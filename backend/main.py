import os
import uvicorn
import logging
import random
from datetime import datetime
from typing import Literal
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import pytz
from database import PROBLEMS_DB, DAY_TOPICS
from execute import router as execute_router
from wagers import router as wagers_router
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
client = None
if api_key:
    client = genai.Client(api_key=api_key)

# Initialize FastAPI app
app = FastAPI()

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
EVENT_START_DATE = datetime(2026, 3, 30, 0, 0, 0, tzinfo=PT_TZ)
EVENT_END_DATE = datetime(2026, 4, 5, 20, 0, 0, tzinfo=PT_TZ)

# Helper function to get current event stage based on Pacific Time
def get_current_stage():
    current_time = datetime.now(PT_TZ)
    
    if current_time < EVENT_START_DATE:
        return "playground"
    
    if current_time > EVENT_END_DATE:
        return "event_over"
        
    # Map dates to days
    date_to_stage = {
        (EVENT_START_DATE + timedelta(days=i)).date(): f"day_{i+1}"
        for i in range(7)
    }
    
    stage = date_to_stage.get(current_time.date(), "playground") # Fallback to playground just in case
    return stage

# Helper to check if a stage is past or current
def is_stage_accessible(stage: str):
    if stage == "playground":
        return datetime.now(PT_TZ) < EVENT_START_DATE
        
    current_stage = get_current_stage()
    if current_stage == "event_over":
        return True # All past stages are accessible

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

@app.get("/api/problems/daily")
async def get_daily_problems(level: Literal["beginner", "experienced"] = Query(...)):
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
async def get_problems_by_stage(stage: str, level: Literal["beginner", "experienced"] = Query(...)):
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
