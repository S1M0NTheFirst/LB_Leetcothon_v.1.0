import os
import uvicorn
import logging
import random
from datetime import date
from typing import Literal
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from database import PROBLEMS_DB
from execute import router as execute_router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load .env variables
load_dotenv(".env.local")
load_dotenv(".env")

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

# Function to read event context from file
def get_event_context():
    try:
        with open(os.path.join(os.path.dirname(__file__), "event_context.txt"), "r") as f:
            return f.read()
    except Exception:
        return "SYSTEM: You are a helpful assistant."

@app.get("/api/problems/daily")
async def get_daily_problems(level: Literal["beginner", "experienced"] = Query(...)):
    # Use real problems from database
    problems = PROBLEMS_DB.get(level, [])
    # Return all 5 problems for that level
    return problems

@app.get("/api/problems/{problem_id}")
async def get_problem_by_id(problem_id: str):
    for level in ["beginner", "experienced"]:
        for problem in PROBLEMS_DB[level]:
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

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8005)
