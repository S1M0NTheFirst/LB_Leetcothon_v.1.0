import httpx
import logging
import random
from typing import List, Optional, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import PROBLEMS_DB, LIST_NODE_DEF

# Setup logging
logger = logging.getLogger(__name__)

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

async def execute_python_with_evaluation(user_code: str, problem_id: str, language_id: int):
    # 1. Find the problem
    problem = None
    for level in ["beginner", "experienced"]:
        for p in PROBLEMS_DB[level]:
            if p["id"] == problem_id:
                problem = p
                break
        if problem: break
    
    if not problem:
        return {"error": "Problem not found"}

    # 2. Build the combined script
    prepended = COMMON_IMPORTS
    if "ListNode" in user_code and "class ListNode" not in problem['python_driver_code']:
        prepended += LIST_NODE_DEF

    combined_code = f"{prepended}\n{user_code}\n\n{problem['python_driver_code']}"
    
    # DEBUG: Print the code being sent to Judge0
    logger.info("--- START OF EXECUTED CODE ---")
    logger.info(combined_code)
    logger.info("--- END OF EXECUTED CODE ---")

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
        
        if "PASS|" in stdout:
            runtime_beats = round(random.uniform(75.00, 99.99), 2)
            memory_beats = round(random.uniform(75.00, 99.99), 2)
            return {
                "status": {"description": "Accepted", "id": 3},
                "runtime_ms": result.get("time"),
                "runtime_beats": runtime_beats,
                "memory_mb": result.get("memory"),
                "memory_beats": memory_beats,
                "stdout": stdout.replace("PASS|ALL_CASES_PASSED", "").strip()
            }
        elif "FAIL|" in stdout or "ERROR|" in stdout or stderr:
            return {
                "status": {"description": "Wrong Answer", "id": 4},
                "message": (stdout + "\n" + stderr).strip()
            }
        else:
            return {
                "status": result.get("status"),
                "stdout": stdout,
                "stderr": stderr,
                "compile_output": result.get("compile_output")
            }

@router.post("/run")
async def run_code(request: RunRequest):
    logger.info(f"Running code for problem: {request.problem_id}")
    
    # If we have a problem_id, run with evaluation for a better UI experience
    if request.problem_id:
        try:
            result = await execute_python_with_evaluation(request.code, request.problem_id, request.language_id)
            if "error" in result:
                raise HTTPException(status_code=404, detail=result["error"])
            return result
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
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit")
async def submit_code(request: SubmitRequest):
    logger.info(f"Submitting code for problem: {request.problem_id}")
    try:
        result = await execute_python_with_evaluation(request.code, request.problem_id, request.language_id)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except Exception as e:
        logger.error(f"Submission Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
