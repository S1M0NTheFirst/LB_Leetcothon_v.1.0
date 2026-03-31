import os
import sys
import uvicorn
import logging
import random
import pytz
from datetime import datetime, timedelta
from typing import Literal
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

# Add the current directory to sys.path to allow local imports
sys.path.append(os.path.dirname(__file__))

from database import PROBLEMS_DB, DAY_TOPICS
from execute import router as execute_router
from wagers import router as wagers_router
from connection_manager import manager
from fastapi import WebSocket, WebSocketDisconnect
from models import HeartbeatRequest
import boto3

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load .env variables
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(env_path)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or os.getenv("GOOGLE_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)

# Initialize FastAPI app
app = FastAPI()

# Startup event to check DynamoDB tables
@app.on_event("startup")
async def startup_event():
    try:
        # Use client to list tables
        dynamodb_client = boto3.client(
            "dynamodb",
            region_name=os.getenv("AWS_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
        )
        response = dynamodb_client.list_tables()
        tables = response.get("TableNames", [])
        logger.info(f"DynamoDB Tables found: {tables}")
        
        # Check for Pools table
        # We need to resolve the name same way as in wagers.py
        users_table_name = os.getenv("DYNAMODB_TABLE_NAME", "Users")
        prefix = ""
        if "-" in users_table_name and users_table_name != "Users":
            prefix = users_table_name.rsplit("-", 1)[0] + "-"
        
        expected_pools_table = os.getenv("POOLS_TABLE_NAME") or os.getenv("DYNAMODB_POOLS_TABLE") or f"{prefix}Pools"
        
        if expected_pools_table not in tables:
            logger.warning(f"CRITICAL: Expected Pools table '{expected_pools_table}' NOT FOUND in DynamoDB!")
            print(f"CRITICAL WARNING: Expected Pools table '{expected_pools_table}' NOT FOUND in DynamoDB!")
        else:
            logger.info(f"Verified Pools table '{expected_pools_table}' exists.")
            
    except Exception as e:
        logger.error(f"Error during startup DynamoDB check: {e}")

# Include Routers
app.include_router(execute_router)
app.include_router(wagers_router)

# Add CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://lb-leetcothon-v-1-0.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PT_TZ = pytz.timezone("America/Los_Angeles")
# Use localize for safer timezone handling with pytz
EVENT_START_DATE = PT_TZ.localize(datetime(2026, 3, 30, 0, 0, 0))
EVENT_END_DATE = PT_TZ.localize(datetime(2026, 4, 5, 23, 59, 59))

# DynamoDB Setup
dynamodb = boto3.resource(
    "dynamodb",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

# Helper function to get current event stage based on Pacific Time
def get_current_stage():
    current_time = datetime.now(PT_TZ)
    if current_time < EVENT_START_DATE:
        return "playground"
    if current_time > EVENT_END_DATE:
        return "event_over"
    
    # Calculate day based on difference from start date
    days_passed = (current_time - EVENT_START_DATE).days
    stage = f"day_{days_passed + 1}"
    return stage

# Helper to check if a stage is past or current
def is_stage_accessible(stage: str):
    if stage == "playground":
        return True
    
    current_stage = get_current_stage()
    if current_stage == "event_over":
        return True
    if current_stage == "playground":
        return stage == "playground"
        
    stages_order = ["day_1", "day_2", "day_3", "day_4", "day_5", "day_6", "day_7"]
    if stage not in stages_order:
        return False
        
    current_idx = stages_order.index(current_stage)
    stage_idx = stages_order.index(stage)
    return stage_idx <= current_idx

# Function to read event context from file
def get_event_context():
    try:
        with open(os.path.join(os.path.dirname(__file__), "event_context.txt"), "r") as f:
            return f.read()
    except Exception:
        return "SYSTEM: You are a helpful assistant for the LB Leetcothon event."

@app.get("/api/leaderboard")
async def get_leaderboard():
    try:
        response = dynamodb.Table(os.getenv("DYNAMODB_TABLE_NAME", "Users")).scan()
        users = response.get("Items", [])
        leaderboard = []
        for u in users:
            # Eradicate 'score', strictly use 'points'
            user_points = int(u.get("points", 0))
            daily_time_map = u.get("daily_time_map", {})
            total_time_spent = sum(daily_time_map.values()) if daily_time_map else 0
            
            leaderboard.append({
                "email": u.get("email"),
                "name": u.get("name", "Anonymous"),
                "image": u.get("image"),
                "points": user_points,
                "solved_count": len(u.get("solved_problems", [])),
                "streak_map": u.get("daily_streak_map", {}),
                "is_ironman": u.get("ironman_bonus_awarded", False),
                "created_at": u.get("createdAt"),
                "last_login": u.get("lastLogin"),
                "total_time_spent": total_time_spent
            })
        # Primary ranking category strictly sorts users by points (descending order)
        leaderboard.sort(key=lambda x: x["points"], reverse=True)
        return leaderboard
    except Exception as e:
        logger.error(f"Leaderboard Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/heartbeat")
async def user_heartbeat(request: HeartbeatRequest):
    try:
        users_table = dynamodb.Table(os.getenv("DYNAMODB_TABLE_NAME", "Users"))
        current_time_pt = datetime.now(PT_TZ)
        today_str = current_time_pt.strftime("%Y-%m-%d")
        
        res = users_table.get_item(Key={"email": request.user_email})
        user = res.get("Item")
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        daily_time_map = user.get("daily_time_map", {})
        current_daily_time = int(daily_time_map.get(today_str, 0))
        
        # Cap at 24 hours (86,400,000 ms)
        MAX_DAILY_MS = 24 * 60 * 60 * 1000
        new_daily_time = min(MAX_DAILY_MS, current_daily_time + request.interval_ms)
        
        daily_time_map[today_str] = new_daily_time
        
        users_table.update_item(
            Key={"email": request.user_email},
            UpdateExpression="SET daily_time_map = :m, last_heartbeat = :t",
            ExpressionAttributeValues={
                ":m": daily_time_map,
                ":t": current_time_pt.isoformat()
            }
        )
        return {"success": True, "today_time_ms": new_daily_time}
    except Exception as e:
        logger.error(f"Heartbeat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/problems/daily")
async def get_daily_problems(level: Literal["beginner", "experienced"] = Query(default=...)):
    stage = get_current_stage()
    topic = DAY_TOPICS.get(stage, "The Arena")
    if stage in PROBLEMS_DB and level in PROBLEMS_DB[stage]:
        problems = PROBLEMS_DB[stage][level]
    else:
        problems = []
    return {
        "active_stage": stage,
        "topic": topic,
        "problems": problems
    }

@app.get("/api/problems/stage/{stage}")
async def get_problems_by_stage(stage: str, level: Literal["beginner", "experienced"] = Query(default=...)):
    if not is_stage_accessible(stage):
        raise HTTPException(status_code=403, detail="This stage is not yet unlocked.")
    topic = DAY_TOPICS.get(stage, "The Arena")
    if stage in PROBLEMS_DB and level in PROBLEMS_DB[stage]:
        problems = PROBLEMS_DB[stage][level]
    else:
        problems = []
    return {
        "stage": stage,
        "topic": topic,
        "problems": problems
    }

@app.get("/api/problems/{problem_id}")
async def get_problem_by_id(problem_id: str):
    for stage in PROBLEMS_DB:
        for level in ["beginner", "experienced"]:
            if level in PROBLEMS_DB[stage]:
                for problem in PROBLEMS_DB[stage][level]:
                    if problem["id"] == problem_id:
                        topic = DAY_TOPICS.get(stage, "The Arena")
                        return {**problem, "stage": stage, "topic": topic}
    raise HTTPException(status_code=404, detail="Problem not found")

class ChatRequest(BaseModel):
  message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    if not client:
        return {"error": "Generative AI client not initialized. Check your API key."}
    try:
        event_context = get_event_context()
        prompt = f"{event_context}\nUSER: {request.message}"
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        return {"reply": response.text}
    except Exception as e:
        return {"error": str(e)}

@app.websocket("/ws/live-coders")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception:
        await manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8005)
