import os
import httpx
import logging
import random
import boto3
from typing import List, Optional, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import PROBLEMS_DB, LIST_NODE_DEF

# Setup logging
logger = logging.getLogger(__name__)

# DynamoDB Setup
TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "Users")
dynamodb = boto3.resource(
    "dynamodb",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)
table = dynamodb.Table(TABLE_NAME)

router = APIRouter(prefix="/api/execute", tags=["execute"])

JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true"

# Common imports to prepend to all Python submissions
COMMON_IMPORTS = """
from typing import List, Optional, Any, Dict
import collections
import math
import heapq
import bisect

"""

class RunRequest(BaseModel):
    code: str
    language_id: int
    test_cases: List[Any]
    problem_id: Optional[str] = None

class SubmitRequest(BaseModel):
    problem_id: str
    code: str
    language_id: int
    user_email: str

def get_problem_by_id(problem_id: str):
    # New structure: PROBLEMS_DB[stage][level] = [problems]
    for stage in PROBLEMS_DB:
        for level in ["beginner", "experienced"]:
            if level in PROBLEMS_DB[stage]:
                for problem in PROBLEMS_DB[stage][level]:
                    if problem["id"] == problem_id:
                        return problem, stage
    return None, None

def get_difficulty_points(difficulty: str) -> int:
    points_map = {
        "Easy": 10,
        "Medium": 20,
        "Hard": 30
    }
    return points_map.get(difficulty, 10)

async def award_points(user_email: str, problem_id: str, difficulty: str, current_stage: str):
    if current_stage == "playground":
        return 0, False
    
    try:
        # Get current user data
        response = table.get_item(Key={"email": user_email})
        user = response.get("Item")
        
        if not user:
            # Should not happen if they are logged in, but let's be safe
            return 0, False
            
        solved_problems = user.get("solved_problems", [])
        if problem_id in solved_problems:
            return user.get("score", 0), False
            
        points_to_award = get_difficulty_points(difficulty)
        new_score = int(user.get("score", 0)) + points_to_award
        
        # Update user in DynamoDB
        table.update_item(
            Key={"email": user_email},
            UpdateExpression="SET score = :s, solved_problems = list_append(if_not_exists(solved_problems, :empty_list), :p)",
            ExpressionAttributeValues={
                ":s": new_score,
                ":p": [problem_id],
                ":empty_list": []
            }
        )
        
        return new_score, True
    except Exception as e:
        logger.error(f"Error awarding points: {e}")
        return 0, False

async def execute_with_evaluation(user_code: str, problem_id: str, language_id: int):
    # 1. Find the problem
    problem, stage = get_problem_by_id(problem_id)
    
    if not problem:
        return {"error": "Problem not found"}

    # 2. Build the combined script based on language
    prepended = ""
    combined_code = user_code
    
    # Python specific logic
    if language_id == 71: # Python
        prepended = COMMON_IMPORTS
        if "ListNode" in user_code and "class ListNode" not in problem.get('python_driver_code', ''):
            prepended += LIST_NODE_DEF
        driver = problem.get('python_driver_code', '')
        combined_code = f"{prepended}\n{user_code}\n\n{driver}"
    
    # 3. Send to Judge0
    payload = {
        "source_code": combined_code,
        "language_id": language_id,
        "stdin": ""
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(JUDGE0_URL, json=payload, timeout=20.0)
        response.raise_for_status()
        result = response.json()
        
        stdout = result.get("stdout") or ""
        stderr = result.get("stderr") or ""
        
        # Validation Logic
        if language_id == 71: # Python validation
            if "PASS|" in stdout:
                runtime_beats = round(random.uniform(75.00, 99.99), 2)
                memory_beats = round(random.uniform(75.00, 99.99), 2)
                return {
                    "status": {"description": "Accepted", "id": 3},
                    "runtime_ms": result.get("time"),
                    "runtime_beats": runtime_beats,
                    "memory_mb": result.get("memory"),
                    "memory_beats": memory_beats,
                    "stdout": stdout.replace("PASS|ALL_CASES_PASSED", "").strip(),
                    "difficulty": problem.get("difficulty"),
                    "stage": stage
                }
            elif "FAIL|" in stdout or "ERROR|" in stdout or stderr:
                return {
                    "status": {"description": "Wrong Answer", "id": 4},
                    "message": (stdout + "\n" + stderr).strip()
                }
        
        # Default for other languages or simple runs
        return {
            "status": result.get("status"),
            "stdout": stdout,
            "stderr": stderr,
            "compile_output": result.get("compile_output"),
            "runtime_ms": result.get("time"),
            "memory_mb": result.get("memory")
        }

@router.post("/run")
async def run_code(request: RunRequest):
    logger.info(f"Running code for problem: {request.problem_id}")
    if request.problem_id:
        try:
            return await execute_with_evaluation(request.code, request.problem_id, request.language_id)
        except Exception as e:
            logger.error(f"Execution Error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # Fallback to simple execution if no problem_id
    prepended = COMMON_IMPORTS
    if "ListNode" in request.code: prepended += LIST_NODE_DEF
    
    payload = {
        "source_code": f"{prepended}\n{request.code}",
        "language_id": request.language_id,
        "stdin": ""
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(JUDGE0_URL, json=payload, timeout=15.0)
            response.raise_for_status()
            result = response.json()
            return result
    except Exception as e:
        logger.error(f"Simple Run Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit")
async def submit_code(request: SubmitRequest):
    logger.info(f"Submitting code for problem: {request.problem_id} for user: {request.user_email}")
    try:
        result = await execute_with_evaluation(request.code, request.problem_id, request.language_id)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
            
        # Point Awarding Logic
        points_awarded = False
        new_score = 0
        
        if result.get("status", {}).get("description") == "Accepted":
            difficulty = result.get("difficulty", "Easy")
            stage = result.get("stage", "playground")
            new_score, points_awarded = await award_points(request.user_email, request.problem_id, difficulty, stage)
            
        result["points_awarded"] = points_awarded
        result["new_score"] = new_score
        result["awarded_amount"] = get_difficulty_points(result.get("difficulty", "Easy")) if points_awarded else 0
        
        return result
    except Exception as e:
        logger.error(f"Submission Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
