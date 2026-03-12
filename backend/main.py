import os
import uvicorn
import logging
import random
from datetime import datetime
from typing import Literal
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import pytz
from database import PROBLEMS_DB
from execute import router as execute_router
from connection_manager import manager
from fastapi import WebSocket, WebSocketDisconnect

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load .env variables
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(env_path)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Initialize FastAPI app
app = FastAPI()

# Include Routers
app.include_router(execute_router)

# Add CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://lb-leetcothon-v-1-0.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to get current event stage based on Pacific Time
def get_current_stage():
    pt_tz = pytz.timezone("America/Los_Angeles")
    current_time = datetime.now(pt_tz)
    current_date = current_time.date()
    
    # Event starts March 30, 2026
    start_date = datetime(2026, 3, 30).date()
    
    if current_date < start_date:
        return "playground"
    
    # Map dates to days
    date_to_stage = {
        datetime(2026, 3, 30).date(): "day_1",
        datetime(2026, 3, 31).date(): "day_2",
        datetime(2026, 4, 1).date(): "day_3",
        datetime(2026, 4, 2).date(): "day_4",
        datetime(2026, 4, 3).date(): "day_5",
        datetime(2026, 4, 4).date(): "day_6",
        datetime(2026, 4, 5).date(): "day_7",
    }
    
    stage = date_to_stage.get(current_date, "day_7" if current_date > datetime(2026, 4, 5).date() else "playground")
    return stage

# Helper to check if a stage is past or current
def is_stage_accessible(stage: str):
    current_stage = get_current_stage()
    
    # "playground" is always accessible unless it's March 30 or later?
    # Actually, the requirement says on Day 1, playground is locked/hidden.
    # So on Day 1, only day_1 is "active", playground is "past"?
    # Let's define order
    stages_order = ["playground", "day_1", "day_2", "day_3", "day_4", "day_5", "day_6", "day_7"]
    
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
        return "SYSTEM: You are a helpful assistant."

@app.get("/api/problems/daily")
async def get_daily_problems(level: Literal["beginner", "experienced"] = Query(...)):
    stage = get_current_stage()
    
    # For now, if stage is not playground, we might not have problems yet.
    # But we'll try to get them from PROBLEMS_DB.
    # If PROBLEMS_DB is not restructured, we'll return playground problems for now
    # to avoid breaking things, but we'll include the stage.
    
    # If PROBLEMS_DB is structured by stage:
    if stage in PROBLEMS_DB and level in PROBLEMS_DB[stage]:
        problems = PROBLEMS_DB[stage][level]
    else:
        # Fallback to current structure if not restructured yet
        problems = PROBLEMS_DB.get(level, [])
        
    return {
        "active_stage": stage,
        "problems": problems
    }

@app.get("/api/problems/stage/{stage}")
async def get_problems_by_stage(stage: str, level: Literal["beginner", "experienced"] = Query(...)):
    if not is_stage_accessible(stage):
        raise HTTPException(status_code=403, detail="This stage is not yet unlocked.")
    
    if stage in PROBLEMS_DB and level in PROBLEMS_DB[stage]:
        problems = PROBLEMS_DB[stage][level]
    else:
        # Fallback
        problems = PROBLEMS_DB.get(level, [])
        
    return {
        "stage": stage,
        "problems": problems
    }

@app.get("/api/problems/{problem_id}")
async def get_problem_by_id(problem_id: str):
    # This might need update if PROBLEMS_DB is restructured
    # For now search everywhere
    if "beginner" in PROBLEMS_DB and "experienced" in PROBLEMS_DB:
        # Old structure
        for level in ["beginner", "experienced"]:
            for problem in PROBLEMS_DB[level]:
                if problem["id"] == problem_id:
                    return problem
    else:
        # New structure
        for stage in PROBLEMS_DB:
            for level in ["beginner", "experienced"]:
                if level in PROBLEMS_DB[stage]:
                    for problem in PROBLEMS_DB[stage][level]:
                        if problem["id"] == problem_id:
                            return problem
                            
    raise HTTPException(status_code=404, detail="Problem not found")

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        event_context = get_event_context()
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"{event_context}\nUSER: {request.message}"
        response = model.generate_content(prompt)
        return {"reply": response.text}
    except Exception as e:
        return {"error": str(e)}

@app.websocket("/ws/live-coders")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception:
        await manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8005)
