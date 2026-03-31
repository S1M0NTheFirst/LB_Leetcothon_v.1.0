import os
import boto3
import logging
import pytz
import random
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models import JoinWagerRequest, Wager, Pool
from decimal import Decimal
from dotenv import load_dotenv

from database import PROBLEMS_DB

logger = logging.getLogger(__name__)

# Load .env variables
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(env_path)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# DynamoDB Setup
USERS_TABLE = os.getenv("DYNAMODB_TABLE_NAME", "Users")
# If DYNAMODB_TABLE_NAME contains a prefix (e.g. "leetcothon-Users"), 
# try to apply same prefix to Pools and Wagers if they aren't explicitly set.
prefix = ""
if "-" in USERS_TABLE and USERS_TABLE != "Users":
    # If table is e.g. "lb-leetcothon-Users", prefix is "lb-leetcothon-"
    prefix = USERS_TABLE.rsplit("-", 1)[0] + "-"

POOLS_TABLE = os.getenv("DYNAMODB_POOLS_TABLE", f"{prefix}Pools")
WAGERS_TABLE = os.getenv("DYNAMODB_WAGERS_TABLE", f"{prefix}Wagers")

def get_dynamodb_resource():
    return boto3.resource(
        "dynamodb",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )

router = APIRouter(prefix="/api/wagers", tags=["wagers"])

PT_TZ = pytz.timezone("America/Los_Angeles")
EVENT_START_DATE = PT_TZ.localize(datetime(2026, 3, 30, 0, 0, 0))

def get_current_pool_id(prediction_type: str):
    current_time = datetime.now(PT_TZ)
    if prediction_type == "ironman_streak":
        return "ironman_2026"
    
    # Daily pool based on date
    date_str = current_time.strftime("%Y_%m_%d")
    return f"daily_{date_str}"

def get_problem_ids_for_day(day_stage: str):
    """Gets all problem IDs for a given day (e.g., 'day_1')."""
    ids = []
    if day_stage in PROBLEMS_DB:
        for level in ['beginner', 'experienced']:
            if level in PROBLEMS_DB[day_stage]:
                ids.extend([p['id'] for p in PROBLEMS_DB[day_stage][level]])
    return list(set(ids))

def get_active_wager_for_problem(user_email: str) -> Optional[Dict[str, Any]]:
    try:
        dynamodb = get_dynamodb_resource()
        users_table = dynamodb.Table(USERS_TABLE)
        response = users_table.get_item(Key={"email": user_email})
        user = response.get("Item")
        if not user:
            return None
        
        active_wagers = user.get("active_wagers", [])
        for wager in active_wagers:
            if wager.get("prediction_type") == "next_problem":
                return wager
        return None
    except Exception as e:
        logger.error(f"Error getting active wager: {e}")
        return None

def settle_wager(user_email: str, pool_id: str, amount_bet: Decimal, status: str):
    try:
        dynamodb = get_dynamodb_resource()
        users_table = dynamodb.Table(USERS_TABLE)
        wagers_table = dynamodb.Table(WAGERS_TABLE)
        
        user_response = users_table.get_item(Key={"email": user_email})
        user = user_response.get("Item")
        if not user:
            raise Exception("User not found for wager settlement")

        active_wagers = user.get("active_wagers", [])
        wager_to_settle_index = -1
        for i, wager in enumerate(active_wagers):
            if wager["pool_id"] == pool_id:
                wager_to_settle_index = i
                break
        
        if wager_to_settle_index == -1:
            logger.warning(f"No active wager found for user {user_email} in pool {pool_id}")
            return

        wager_to_settle = active_wagers.pop(wager_to_settle_index)

        update_expression_parts = ["SET active_wagers = :new_wagers"]
        expression_attribute_values = {":new_wagers": active_wagers}

        if status == "won":
            winnings = amount_bet * 2 # 2x payout
            update_expression_parts.append("points = if_not_exists(points, :zero) + :win")
            expression_attribute_values[":win"] = winnings
            expression_attribute_values[":zero"] = Decimal(0)

        users_table.update_item(
            Key={"email": user_email},
            UpdateExpression=", ".join(update_expression_parts),
            ExpressionAttributeValues=expression_attribute_values
        )

        wager_to_settle["status"] = status
        wager_to_settle["settled_at"] = datetime.now(PT_TZ).isoformat()
        wagers_table.put_item(Item=wager_to_settle)
        logger.info(f"Successfully settled wager for {user_email} in pool {pool_id} as {status}")

    except Exception as e:
        logger.error(f"Error settling wager: {e}")

def auto_settle_user_wagers(user_email: str):
    """Checks and settles any matured wagers for a specific user."""
    try:
        dynamodb = get_dynamodb_resource()
        users_table = dynamodb.Table(USERS_TABLE)
        
        user_res = users_table.get_item(Key={"email": user_email})
        user = user_res.get("Item")
        if not user:
            return

        active_wagers = user.get("active_wagers", [])
        if not active_wagers:
            return

        current_time = datetime.now(PT_TZ)
        current_date_str = current_time.strftime("%Y_%m_%d")
        
        wagers_to_settle = []

        for wager in active_wagers:
            pool_id = wager.get("pool_id")
            pred_type = wager.get("prediction_type")
            
            # 1. Daily All Clear Settlement
            if pred_type == "daily_all_clear":
                if pool_id.startswith("daily_") and pool_id != f"daily_{current_date_str}":
                    date_parts = pool_id.split("_")[1:] # [YYYY, MM, DD]
                    wager_date = PT_TZ.localize(datetime(int(date_parts[0]), int(date_parts[1]), int(date_parts[2])))
                    
                    if current_time > (wager_date + timedelta(days=1)):
                        day_idx = (wager_date - EVENT_START_DATE).days + 1
                        day_stage = f"day_{day_idx}"
                        daily_problems = get_problem_ids_for_day(day_stage)
                        
                        if daily_problems:
                            solved_problems = user.get("solved_problems", [])
                            if all(p_id in solved_problems for p_id in daily_problems):
                                wagers_to_settle.append((pool_id, wager["amount_bet"], "won"))
                            else:
                                wagers_to_settle.append((pool_id, wager["amount_bet"], "lost"))

            # 2. Ironman Settlement
            elif pred_type == "ironman_streak":
                event_end_date = EVENT_START_DATE + timedelta(days=7)
                if current_time > event_end_date:
                    daily_streak_map = user.get("daily_streak_map", {})
                    all_days_completed = all(daily_streak_map.get(f"day_{i}") for i in range(1, 8))
                    if all_days_completed:
                        wagers_to_settle.append((pool_id, wager["amount_bet"], "won"))
                    else:
                        wagers_to_settle.append((pool_id, wager["amount_bet"], "lost"))

        for p_id, amt, status in wagers_to_settle:
            logger.info(f"Auto-settling wager for {user_email}: {p_id} -> {status}")
            settle_wager(user_email, p_id, amt, status)

    except Exception as e:
        logger.error(f"Error in auto_settle_user_wagers: {e}")

@router.get("/stats")
async def get_wager_stats(user_email: Optional[str] = None):
    try:
        dynamodb = get_dynamodb_resource()
        users_table = dynamodb.Table(USERS_TABLE)
        pools_table = dynamodb.Table(POOLS_TABLE)
        
        if user_email:
            auto_settle_user_wagers(user_email)

        daily_id = get_current_pool_id("daily_all_clear")
        ironman_id = get_current_pool_id("ironman_streak")
        
        daily_res = pools_table.get_item(Key={"pool_id": daily_id})
        ironman_res = pools_table.get_item(Key={"pool_id": ironman_id})
        
        daily_pool = daily_res.get("Item", {"total_pot": 0, "participant_ids": []})
        ironman_pool = ironman_res.get("Item", {"total_pot": 0, "participant_ids": []})
        
        user_wagers = []
        if user_email:
            user_res = users_table.get_item(Key={"email": user_email})
            user = user_res.get("Item", {})
            user_wagers = user.get("active_wagers", [])

        return {
            "daily": {
                "pool_id": daily_id,
                "total_pot": float(daily_pool.get("total_pot", 0)),
                "participants": len(daily_pool.get("participant_ids", [])),
                "is_joined": any(w.get("pool_id") == daily_id for w in user_wagers)
            },
            "ironman": {
                "pool_id": ironman_id,
                "total_pot": float(ironman_pool.get("total_pot", 0)),
                "participants": len(ironman_pool.get("participant_ids", [])),
                "is_joined": any(w.get("pool_id") == ironman_id for w in user_wagers)
            },
            "user_wagers": [{**w, "amount_bet": float(w["amount_bet"])} for w in user_wagers]
        }
    except Exception as e:
        logger.error(f"Error fetching wager stats: {e}")
        return {"error": str(e)}

@router.post("/join")
async def join_wager(request: JoinWagerRequest):
    pool_id = get_current_pool_id(request.prediction_type)
    
    try:
        dynamodb = get_dynamodb_resource()
        users_table = dynamodb.Table(USERS_TABLE)
        pools_table = dynamodb.Table(POOLS_TABLE)
        
        user_response = users_table.get_item(Key={"email": request.user_email})
        user = user_response.get("Item")
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        current_points = int(user.get("points", 0))
        
        logger.info(f"Join Wager attempt: user={request.user_email}, points={current_points}, requested_amount={request.amount}")
        
        if current_points < request.amount:
            raise HTTPException(status_code=400, detail=f"Insufficient points: Have {current_points}, need {request.amount}")
            
        active_wagers = user.get("active_wagers", [])
        if any(w["pool_id"] == pool_id for w in active_wagers):
             raise HTTPException(status_code=400, detail="Already joined this pool")

        new_wager = {
            "pool_id": pool_id,
            "amount_bet": Decimal(request.amount),
            "prediction_type": request.prediction_type,
            "status": "active",
            "timestamp": datetime.now(PT_TZ).isoformat()
        }
        
        users_table.update_item(
            Key={"email": request.user_email},
            UpdateExpression="SET points = if_not_exists(points, :zero) - :amt, active_wagers = list_append(if_not_exists(active_wagers, :empty_list), :w)",
            ExpressionAttributeValues={
                ":amt": Decimal(str(request.amount)),
                ":w": [new_wager],
                ":empty_list": [],
                ":zero": Decimal(0)
            }
        )
        
        try:
            pools_table.update_item(
                Key={"pool_id": pool_id},
                UpdateExpression="SET total_pot = if_not_exists(total_pot, :zero) + :amt, participant_ids = list_append(if_not_exists(participant_ids, :empty_list), :u)",
                ExpressionAttributeValues={
                    ":amt": Decimal(str(request.amount)),
                    ":u": [request.user_email],
                    ":zero": Decimal(0),
                    ":empty_list": []
                }
            )
        except Exception as pe:
            # If item doesn't exist at all, we might need to put it first if the table doesn't support automatic creation via update
            # But standard DynamoDB update_item with SET and if_not_exists usually creates the item if Key is not found.
            # However, some regions/versions might behave differently or if there are ConditionExpressions.
            # Let's ensure it exists.
            logger.info(f"Pool {pool_id} might not exist, creating it.")
            pools_table.put_item(Item={
                "pool_id": pool_id,
                "total_pot": Decimal(str(request.amount)),
                "participant_ids": [request.user_email],
                "status": "open"
            })
        
        return {"message": "Wager placed successfully", "pool_id": pool_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Wager join error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
