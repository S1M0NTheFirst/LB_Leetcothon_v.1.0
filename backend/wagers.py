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

logger = logging.getLogger(__name__)

# DynamoDB Setup
USERS_TABLE = os.getenv("DYNAMODB_TABLE_NAME", "Users")
POOLS_TABLE = os.getenv("DYNAMODB_POOLS_TABLE", "Pools")

dynamodb = boto3.resource(
    "dynamodb",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

users_table = dynamodb.Table(USERS_TABLE)
pools_table = dynamodb.Table(POOLS_TABLE)

router = APIRouter(prefix="/api/wagers", tags=["wagers"])

PT_TZ = pytz.timezone("America/Los_Angeles")

def get_current_pool_id(prediction_type: str):
    current_time = datetime.now(PT_TZ)
    if prediction_type == "ironman_streak":
        return "ironman_2026"
    
    # Daily pool based on date
    date_str = current_time.strftime("%Y_%m_%d")
    return f"daily_{date_str}"

@router.get("/stats")
async def get_wager_stats(user_email: Optional[str] = None):
    daily_id = get_current_pool_id("daily_all_clear")
    ironman_id = get_current_pool_id("ironman_streak")
    
    try:
        # Fetch Pool Data
        daily_res = pools_table.get_item(Key={"pool_id": daily_id})
        ironman_res = pools_table.get_item(Key={"pool_id": ironman_id})
        
        daily_pool = daily_res.get("Item", {"total_pot": 0, "participant_ids": []})
        ironman_pool = ironman_res.get("Item", {"total_pot": 0, "participant_ids": []})
        
        # User Specific Data
        user_wagers = []
        if user_email:
            user_res = users_table.get_item(Key={"email": user_email})
            user = user_res.get("Item", {})
            user_wagers = user.get("active_wagers", [])

        # Format Response
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
        # 1. Get user and validate points
        user_response = users_table.get_item(Key={"email": request.user_email})
        user = user_response.get("Item")
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        current_points = int(user.get("score", 0))
        if current_points < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient points")
            
        # Check if already in this pool
        active_wagers = user.get("active_wagers", [])
        if any(w["pool_id"] == pool_id for w in active_wagers):
             raise HTTPException(status_code=400, detail="Already joined this pool")

        # 2. Update User (Deduct points, add wager)
        new_wager = {
            "pool_id": pool_id,
            "amount_bet": Decimal(request.amount),
            "prediction_type": request.prediction_type,
            "status": "active",
            "timestamp": datetime.now(PT_TZ).isoformat()
        }
        
        users_table.update_item(
            Key={"email": request.user_email},
            UpdateExpression="SET score = score - :amt, active_wagers = list_append(if_not_exists(active_wagers, :empty_list), :w)",
            ExpressionAttributeValues={
                ":amt": Decimal(request.amount),
                ":w": [new_wager],
                ":empty_list": []
            }
        )
        
        # 3. Update Pool (Add to pot, add participant)
        pools_table.update_item(
            Key={"pool_id": pool_id},
            UpdateExpression="SET total_pot = if_not_exists(total_pot, :zero) + :amt, participant_ids = list_append(if_not_exists(participant_ids, :empty_list), :u)",
            ExpressionAttributeValues={
                ":amt": Decimal(request.amount),
                ":u": [request.user_email],
                ":zero": Decimal(0),
                ":empty_list": []
            }
        )
        
        return {"message": "Wager placed successfully", "pool_id": pool_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Wager join error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
