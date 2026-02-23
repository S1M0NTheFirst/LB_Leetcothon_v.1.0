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

# Function to read event context from file
def get_event_context():
    try:
        with open(os.path.join(os.path.dirname(__file__), "event_context.txt"), "r") as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading event_context.txt: {e}")
        return "SYSTEM: You are a helpful assistant."

# Initialize FastAPI app
app = FastAPI()

# Add CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://lb-leetcothon-v-1-0.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API: ChatRequest class
class ChatRequest(BaseModel):
    message: str

# API: /chat endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    logger.info(f"Incoming request: {request.message}")
    try:
        # Load the context fresh from the file for each request (allows hot-swapping)
        event_context = get_event_context()
        
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"{event_context}\nUSER: {request.message}"
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
