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
# Improved Prefix detection: LB_Leetcodethon_Users -> LB_Leetcodethon_
prefix = ""
if USERS_TABLE != "Users":
    if "-" in USERS_TABLE:
        prefix = USERS_TABLE.rsplit("-", 1)[0] + "-"
    elif "_" in USERS_TABLE:
        prefix = USERS_TABLE.rsplit("_", 1)[0] + "_"

# POOLS_TABLE resolution
POOLS_TABLE = os.getenv("POOLS_TABLE_NAME") or os.getenv("DYNAMODB_POOLS_TABLE") or f"{prefix}Pools"
WAGERS_TABLE = os.getenv("DYNAMODB_WAGERS_TABLE") or f"{prefix}Wagers"

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
    
    # Daily pool based on date: daily_YYYY-MM-DD
    date_str = current_time.strftime("%Y-%m-%d")
    if prediction_type == "next_problem":
        return f"next_{date_str}"
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

def settle_wager(user_email: str, pool_id: str, amount_bet: Decimal, status: str, explicit_winnings: Optional[Decimal] = None):
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
            if explicit_winnings is not None:
                winnings = explicit_winnings
            else:
                # Fallback to 2x if no explicit payout provided
                winnings = amount_bet * 2
            
            update_expression_parts.append("points = if_not_exists(points, :zero) + :win")
            expression_attribute_values[":win"] = winnings
            expression_attribute_values[":zero"] = Decimal(0)
            wager_to_settle["payout"] = winnings
        else:
            wager_to_settle["payout"] = 0

        users_table.update_item(
            Key={"email": user_email},
            UpdateExpression=", ".join(update_expression_parts),
            ExpressionAttributeValues=expression_attribute_values
        )

        wager_to_settle["status"] = status
        wager_to_settle["settled_at"] = datetime.now(PT_TZ).isoformat()
        wagers_table.put_item(Item=wager_to_settle)
        logger.info(f"Successfully settled wager for {user_email} in pool {pool_id} as {status} (Payout: {wager_to_settle.get('payout')})")

    except Exception as e:
        logger.error(f"Error settling wager: {e}")

def auto_settle_user_wagers(user_email: str):
    """Checks and settles any matured wagers for a specific user."""
    try:
        dynamodb = get_dynamodb_resource()
        users_table = dynamodb.Table(USERS_TABLE)
        pools_table = dynamodb.Table(POOLS_TABLE)
        
        user_res = users_table.get_item(Key={"email": user_email})
        user = user_res.get("Item")
        if not user:
            return

        active_wagers = user.get("active_wagers", [])
        if not active_wagers:
            return

        current_time = datetime.now(PT_TZ)
        current_date_str = current_time.strftime("%Y-%m-%d")
        
        wagers_to_settle = []

        for wager in active_wagers:
            pool_id = wager.get("pool_id", "")
            pred_type = wager.get("prediction_type")
            
            # Skip Ironman wagers in the daily auto-settle loop
            if pool_id.startswith("ironman_"):
                continue

            # 1. Daily All Clear & Next Problem Settlement
            if pool_id.startswith("daily_") or pool_id.startswith("next_"):
                # Only settle if the day is past
                current_date_prefix = f"daily_{current_date_str}" if pred_type == "daily_all_clear" else f"next_{current_date_str}"
                
                if pool_id != current_date_prefix:
                    try:
                        # pool_id format: daily_YYYY-MM-DD or next_YYYY-MM-DD
                        parts = pool_id.split("_")
                        if len(parts) < 2:
                            continue
                        date_part = parts[1]
                        wager_date = PT_TZ.localize(datetime.strptime(date_part, "%Y-%m-%d"))
                        
                        # Wait until at least 1 AM the next day to ensure batch settlement has a chance to run
                        if current_time > (wager_date + timedelta(days=1, hours=1)):
                            # For pool-based logic, we need the pool multiplier
                            pool_res = pools_table.get_item(Key={"pool_id": pool_id})
                            pool = pool_res.get("Item")
                            
                            if pool and pool.get("status") == "resolved":
                                won = False
                                if pred_type == "daily_all_clear":
                                    day_idx = (wager_date - EVENT_START_DATE).days + 1
                                    day_stage = f"day_{day_idx}"
                                    daily_problems = get_problem_ids_for_day(day_stage)
                                    if daily_problems:
                                        solved_problems = user.get("solved_problems", [])
                                        won = all(p_id in solved_problems for p_id in daily_problems)
                                elif pred_type == "next_problem":
                                    # Simple win condition for "Next Problem": solved at least one problem.
                                    # In reality, the batch script marks them as winners.
                                    # For auto-settle fallback, we check if they have any solved problems.
                                    solved_problems = user.get("solved_problems", [])
                                    won = len(solved_problems) > 0 

                                if won:
                                    total_pot = pool.get("total_pot", Decimal(0))
                                    total_winning_bets = pool.get("total_winning_bets", Decimal(0))
                                    
                                    if total_winning_bets > 0:
                                        # Pari-mutuel formula: (Pool * 0.95 / Total Winning Bets) * User Bet
                                        multiplier = (total_pot * Decimal("0.95")) / total_winning_bets
                                        winnings = Decimal(str(wager["amount_bet"])) * multiplier
                                        wagers_to_settle.append((pool_id, wager["amount_bet"], "won", winnings.quantize(Decimal("1"))))
                                    else:
                                        wagers_to_settle.append((pool_id, wager["amount_bet"], "won", wager["amount_bet"] * Decimal("1.2")))
                                else:
                                    wagers_to_settle.append((pool_id, wager["amount_bet"], "lost", Decimal(0)))
                            else:
                                # If pool isn't resolved yet by script, skip auto-settle to avoid wrong payouts
                                logger.info(f"Pool {pool_id} not resolved yet, skipping auto-settle for {user_email}")
                                continue
                    except (ValueError, IndexError) as e:
                        logger.warning(f"Error parsing date from pool_id {pool_id}: {e}")
                        continue

        for p_id, amt, status, winnings in wagers_to_settle:
            logger.info(f"Auto-settling wager for {user_email}: {p_id} -> {status} (Winnings: {winnings})")
            settle_wager(user_email, p_id, amt, status, explicit_winnings=winnings)

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
        next_id = get_current_pool_id("next_problem")
        ironman_id = get_current_pool_id("ironman_streak")
        
        daily_res = pools_table.get_item(Key={"pool_id": daily_id})
        next_res = pools_table.get_item(Key={"pool_id": next_id})
        ironman_res = pools_table.get_item(Key={"pool_id": ironman_id})
        
        daily_pool = daily_res.get("Item", {"total_pot": 0, "participant_count": 0})
        next_pool = next_res.get("Item", {"total_pot": 0, "participant_count": 0})
        ironman_pool = ironman_res.get("Item", {"total_pot": 0, "participant_count": 0})
        
        user_wagers = []
        if user_email:
            user_res = users_table.get_item(Key={"email": user_email})
            user = user_res.get("Item", {})
            user_wagers = user.get("active_wagers", [])

        return {
            "daily": {
                "pool_id": daily_id,
                "total_pot": float(daily_pool.get("total_pot", 0)),
                "participant_count": int(daily_pool.get("participant_count", 0)),
                "is_joined": any(w.get("pool_id") == daily_id for w in user_wagers)
            },
            "next_problem": {
                "pool_id": next_id,
                "total_pot": float(next_pool.get("total_pot", 0)),
                "participant_count": int(next_pool.get("participant_count", 0)),
                "is_joined": any(w.get("pool_id") == next_id for w in user_wagers)
            },
            "ironman": {
                "pool_id": ironman_id,
                "total_pot": float(ironman_pool.get("total_pot", 0)),
                "participant_count": int(ironman_pool.get("participant_count", 0)),
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
        
        if current_points < request.amount:
            raise HTTPException(status_code=400, detail=f"Insufficient points: Have {current_points}, need {request.amount}")
            
        active_wagers = user.get("active_wagers", [])
        if any(w["pool_id"] == pool_id for w in active_wagers):
             raise HTTPException(status_code=400, detail="Already joined this pool")

        new_wager = {
            "pool_id": pool_id,
            "amount_bet": Decimal(str(request.amount)),
            "prediction_type": request.prediction_type,
            "status": "active",
            "timestamp": datetime.now(PT_TZ).isoformat()
        }
        
        # 1. Deduct points and add to active_wagers
        users_table.update_item(
            Key={"email": request.user_email},
            UpdateExpression="SET points = points - :amt, active_wagers = list_append(if_not_exists(active_wagers, :empty_list), :w)",
            ExpressionAttributeValues={
                ":amt": Decimal(str(request.amount)),
                ":w": [new_wager],
                ":empty_list": []
            }
        )
        
        # 2. Update Pool with atomic ADD operations
        try:
            pools_table.update_item(
                Key={"pool_id": pool_id},
                UpdateExpression="ADD total_pot :amt, participant_count :one, participants :email_set",
                ExpressionAttributeValues={
                    ":amt": Decimal(str(request.amount)),
                    ":one": Decimal(1),
                    ":email_set": {request.user_email} # String Set
                }
            )
        except Exception as pe:
            logger.error(f"Pool update failed, rolling back user points: {pe}")
            # Rollback: Refund points and remove the last added wager
            try:
                user_rollback_res = users_table.get_item(Key={"email": request.user_email})
                user_rollback = user_rollback_res.get("Item")
                if user_rollback:
                    current_wagers = user_rollback.get("active_wagers", [])
                    if current_wagers and current_wagers[-1]["pool_id"] == pool_id:
                        current_wagers.pop()
                    
                    users_table.update_item(
                        Key={"email": request.user_email},
                        UpdateExpression="SET points = points + :amt, active_wagers = :w",
                        ExpressionAttributeValues={
                            ":amt": Decimal(str(request.amount)),
                            ":w": current_wagers
                        }
                    )
            except Exception as rollback_err:
                logger.error(f"CRITICAL: Rollback failed: {rollback_err}")
            
            raise HTTPException(status_code=500, detail=f"Database Error: {str(pe)}")
        
        return {"message": "Wager placed successfully", "pool_id": pool_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Wager join error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
