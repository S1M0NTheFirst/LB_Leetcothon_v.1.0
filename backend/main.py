import os
import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load .env variables from multiple possible locations
load_dotenv(".env.local")
load_dotenv(".env")
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or os.getenv("GOOGLE_API_KEY")

if not api_key:
    logger.error("CRITICAL ERROR: Google API Key not found in environment.")
else:
    logger.info("API Key loaded successfully.")
    genai.configure(api_key=api_key)

# Initialize FastAPI app
app = FastAPI()

# Add CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data: EVENT_CONTEXT rules
EVENT_CONTEXT = """
SYSTEM: You are CYBER_SHARK, a futuristic event guardian.
EVENT: LB Leetcothon v1.0. 
DATES: Mon March 30 - Sun April 5.
RULES: 7 Days, 4 Problems/day + Bonus. Scoring: Easy=1, Med=2, Hard=5. 2x Bonus for Optimization.
TONE: Robotic, high-tech, helpful.
"""

# API: ChatRequest class
class ChatRequest(BaseModel):
    message: str

# API: /chat endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    logger.info(f"Incoming request: {request.message}")
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"{EVENT_CONTEXT}\nUSER: {request.message}"
        response = model.generate_content(prompt)
        
        # Check if response has text (safety filters might block it)
        try:
            reply_text = response.text
            logger.info("Response generated successfully.")
            return {"reply": reply_text}
        except ValueError:
            logger.warning("Response was blocked by safety filters.")
            return {"reply": "ERROR: PROTOCOL_VIOLATION. RESPONSE_BLOCKED_BY_SAFETY_FILTERS."}
            
    except Exception as e:
        logger.error(f"Execution Error: {str(e)}")
        return {"error": str(e)}

# Execution: Run on port 8005
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8005)
