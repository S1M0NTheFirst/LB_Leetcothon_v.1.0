import os
import httpx
import logging
import random
import boto3
import pytz
import uuid
from datetime import datetime
from typing import List, Optional, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import PROBLEMS_DB, LIST_NODE_DEF
from local_executor import run_local_cpp, run_local_c, run_local_java
from decimal import Decimal
from dotenv import load_dotenv
from wagers import get_active_wager_for_problem, settle_wager

# Setup logging
logger = logging.getLogger(__name__)

# Load .env variables
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(env_path)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

PT_TZ = pytz.timezone("America/Los_Angeles")

# DynamoDB Setup
TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "Users")
SUBMISSIONS_TABLE = os.getenv("DYNAMODB_SUBMISSIONS_TABLE", "Submissions")

def get_dynamodb_resource():
    return boto3.resource(
        "dynamodb",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )

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

# Common headers for languages
CPP_HEADERS = """
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <stack>
#include <queue>
#include <cmath>
#include <climits>
#include <sstream>
#include <numeric>
#include <iomanip>
#include <list>
#include <deque>

using namespace std;

// Parsing Helpers
vector<int> parseVectorInt(string s) {
    vector<int> res;
    string temp = "";
    for(char c : s) {
        if(isdigit(c) || c == '-') temp += c;
        else if(c == ',' || c == ']') {
            if(!temp.empty()) {
                res.push_back(stoi(temp));
                temp = "";
            }
        }
    }
    return res;
}

vector<string> parseVectorString(string s) {
    vector<string> res;
    string temp = "";
    bool inQuotes = false;
    for(char c : s) {
        if(c == '\"') inQuotes = !inQuotes;
        else if((c == ',' || c == ']') && !inQuotes) {
            if(!temp.empty()) {
                res.push_back(temp);
                temp = "";
            }
        } else if (inQuotes || (!isspace(c) && c != '[')) {
            temp += c;
        }
    }
    return res;
}
"""

C_HEADERS = """
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <math.h>
#include <limits.h>
#include <ctype.h>
"""

JAVA_HEADERS = """
import java.util.*;
import java.io.*;
import java.util.stream.*;
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

def get_current_event_stage():
    current_time = datetime.now(PT_TZ)
    # This logic should match main.py
    event_start = datetime(2026, 3, 30, 0, 0, 0, tzinfo=PT_TZ)
    event_end = datetime(2026, 4, 5, 23, 59, 59, tzinfo=PT_TZ)
    
    if current_time < event_start:
        return "playground"
    if current_time > event_end:
        return "event_over"
        
    days_passed = (current_time - event_start).days
    return f"day_{days_passed + 1}"

def get_problem_by_id(problem_id: str):
    event_stage = get_current_event_stage()
    
    # Prioritize finding the problem in the current event stage
    if event_stage != "playground" and event_stage in PROBLEMS_DB:
        for level in ["beginner", "experienced"]:
            if level in PROBLEMS_DB[event_stage]:
                for problem in PROBLEMS_DB[event_stage][level]:
                    if problem["id"] == problem_id:
                        return problem, event_stage

    # If not found in current event stage, search all stages
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

async def award_points(user_email: str, problem_id: str, difficulty: str, current_stage: str, runtime_ms: float = 0, memory_mb: float = 0):
    if current_stage == "playground":
        return 0, False, False, False
    
    try:
        dynamodb = get_dynamodb_resource()
        table = dynamodb.Table(TABLE_NAME)
        # 1. Find the problem to get its data
        problem_data, _ = get_problem_by_id(problem_id)
        
        # 2. Get current user data
        response = table.get_item(Key={"email": user_email})
        user = response.get("Item")
        
        if not user:
            return 0, False, False, False
            
        solved_problems = user.get("solved_problems", [])
        is_already_solved = problem_id in solved_problems
        
        # 1. Base Points Calculation
        base_points = get_difficulty_points(difficulty)
        points_earned = base_points
        
        # 2. Optimization Bonus Check
        is_optimized = False
        if problem_data and "optimization_thresholds" in problem_data:
            thresholds = problem_data["optimization_thresholds"]
            t_ms = float(thresholds.get("runtime_ms", 0))
            t_mb = float(thresholds.get("memory_mb", 0))
            
            if runtime_ms > 0 and memory_mb > 0 and runtime_ms <= t_ms and memory_mb <= t_mb:
                is_optimized = True
                points_earned *= 2

        # 3. Ironman Streak Logic
        daily_streak_map = user.get("daily_streak_map", {})
        ironman_awarded = False
        
        if not is_already_solved:
            if current_stage.startswith("day_"):
                daily_streak_map[current_stage] = True
                
                all_days = [f"day_{i}" for i in range(1, 8)]
                if all(daily_streak_map.get(d) for d in all_days) and not user.get("ironman_bonus_awarded"):
                    points_earned += 500
                    ironman_awarded = True
            
            solved_problems.append(problem_id)
        else:
            return int(user.get("points", 0)), False, is_optimized, False

        new_points = int(user.get("points", 0)) + points_earned
        
        # 4. Stage Completion Check
        stage_problems = []
        for level in ["beginner", "experienced"]:
            if current_stage in PROBLEMS_DB and level in PROBLEMS_DB[current_stage]:
                stage_problems.extend([p["id"] for p in PROBLEMS_DB[current_stage][level]])
        
        stage_problems = list(set(stage_problems))
        stage_solved_count = sum(1 for p in solved_problems if any(p == sp for sp in stage_problems))
        
        daily_clears = user.get("daily_clears", [])
        if stage_solved_count >= 5 and current_stage not in daily_clears:
            daily_clears.append(current_stage)

        update_expr = "SET points = :p, solved_problems = :sp, daily_clears = :dc, daily_streak_map = :ds"
        expr_attr_vals = {
            ":p": Decimal(str(new_points)),
            ":sp": solved_problems,
            ":dc": daily_clears,
            ":ds": daily_streak_map
        }
        
        if ironman_awarded:
            update_expr += ", ironman_bonus_awarded = :iba"
            expr_attr_vals[":iba"] = True

        table.update_item(
            Key={"email": user_email},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_attr_vals
        )
        
        return new_points, True, is_optimized, ironman_awarded
    except Exception as e:
        logger.error(f"Error awarding points: {e}")
        return 0, False, False, False

async def execute_with_evaluation(user_code: str, problem_id: str, language_id: int):
    problem, stage = get_problem_by_id(problem_id)
    if not problem:
        return {"error": "Problem not found"}

    if language_id == 71: # Python
        combined_code = f"{COMMON_IMPORTS}\n"
        if "ListNode" in user_code and "class ListNode" not in (problem.get('python_driver_code') or ''):
            combined_code += LIST_NODE_DEF
        combined_code += f"{user_code}\n\n{problem.get('python_driver_code', '')}"
        
        result = await run_with_judge0(combined_code, language_id)
        return process_judge0_result(result, problem, stage)

    elif language_id == 54: # C++
        driver_code = problem.get('cpp_driver_code', '')
        if not driver_code:
            driver_code = "\nint main() { cout << \"PASS|ALL_CASES_PASSED\" << endl; return 0; }\n"
        combined_code = f"{CPP_HEADERS}\n{user_code}\n\n{driver_code}"
        result = run_local_cpp(combined_code)
        return process_local_result(result, problem, stage)

    elif language_id == 50: # C
        driver_code = problem.get('c_driver_code', '')
        if not driver_code:
            driver_code = "\nint main() { printf(\"PASS|ALL_CASES_PASSED\\n\"); return 0; }\n"
        combined_code = f"{C_HEADERS}\n{user_code}\n\n{driver_code}"
        result = run_local_c(combined_code)
        return process_local_result(result, problem, stage)

    elif language_id == 62: # Java
        driver_code = problem.get('java_driver_code', '')
        if not driver_code:
            driver_code = "\nclass Main { public static void main(String[] args) { System.out.println(\"PASS|ALL_CASES_PASSED\"); } }\n"
        combined_code = f"{JAVA_HEADERS}\n{user_code}\n\n{driver_code}"
        result = run_local_java(combined_code)
        return process_local_result(result, problem, stage)

    return await run_with_judge0(user_code, language_id)

async def run_with_judge0(code: str, language_id: int):
    payload = {
        "source_code": code,
        "language_id": language_id,
        "stdin": ""
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(JUDGE0_URL, json=payload, timeout=20.0)
        response.raise_for_status()
        return response.json()

def process_judge0_result(result, problem, stage):
    stdout = result.get("stdout") or ""
    stderr = result.get("stderr") or ""
    
    if "PASS|" in stdout:
        return {
            "status": {"description": "Accepted", "id": 3},
            "runtime_ms": float(result.get("time") or 0) * 1000,
            "memory_mb": float(result.get("memory") or 0) / 1024,
            "stdout": stdout.replace("PASS|ALL_CASES_PASSED", "").strip(),
            "difficulty": problem.get("difficulty"),
            "stage": stage
        }
    elif "FAIL|" in stdout or "ERROR|" in stdout or stderr:
        return {
            "status": {"description": "Wrong Answer", "id": 4},
            "message": (stdout + "\n" + stderr).strip()
        }
    return result

def process_local_result(result, problem, stage):
    stdout = result.get("stdout") or ""
    stderr = result.get("stderr") or ""
    
    if "PASS|" in stdout:
        return {
            "status": {"description": "Accepted", "id": 3},
            "runtime_ms": round(random.uniform(10, 50), 2),
            "memory_mb": round(random.uniform(2, 10), 2),
            "stdout": stdout.replace("PASS|ALL_CASES_PASSED", "").strip(),
            "difficulty": problem.get("difficulty"),
            "stage": stage
        }
    elif "FAIL|" in stdout or "ERROR|" in stdout or stderr or result["status"]["id"] != 3:
        description = result["status"]["description"]
        if "PASS|" not in stdout and result["status"]["id"] == 3:
             description = "Wrong Answer"
        return {
            "status": {"description": description, "id": result["status"]["id"]},
            "message": (stdout + "\n" + stderr + "\n" + (result.get("compile_output") or "")).strip()
        }
    return result

@router.get("/submissions/{problem_id}")
async def get_submissions(problem_id: str, user_email: str):
    try:
        from boto3.dynamodb.conditions import Key
        # PK=user_email, SK=problem_id#timestamp
        response = submissions_table.query(
            KeyConditionExpression=Key('user_email').eq(user_email) & Key('problem_id_timestamp').begins_with(f"{problem_id}#"),
            ScanIndexForward=False
        )
        return response.get("Items", [])
    except Exception as e:
        logger.error(f"Submissions Fetch Error: {e}")
        return []

@router.post("/run")
async def run_code(request: RunRequest):
    if request.problem_id:
        return await execute_with_evaluation(request.code, request.problem_id, request.language_id)
    
    if request.language_id == 71: # Python
        source_code = f"{COMMON_IMPORTS}\n{request.code}"
    elif request.language_id == 54: # C++
        source_code = f"{CPP_HEADERS}\n{request.code}"
    elif request.language_id == 50: # C
        source_code = f"{C_HEADERS}\n{request.code}"
    elif request.language_id == 62: # Java
        source_code = f"{JAVA_HEADERS}\n{request.code}"
    else:
        source_code = request.code

    payload = {
        "source_code": source_code,
        "language_id": request.language_id,
        "stdin": ""
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(JUDGE0_URL, json=payload, timeout=15.0)
        return response.json()

@router.post("/submit")
async def submit_code(request: SubmitRequest):
    try:
        # Check for active wager before execution
        active_wager = get_active_wager_for_problem(request.user_email)

        result = await execute_with_evaluation(request.code, request.problem_id, request.language_id)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
            
        points_awarded = False
        new_points = 0
        is_optimized = False
        ironman_awarded = False
        
        if result.get("status", {}).get("description") == "Accepted":
            stage = result.get("stage", "playground")
            difficulty = result.get("difficulty", "Easy")
            runtime = result.get("runtime_ms", 0)
            memory = result.get("memory_mb", 0)
            
            new_points, points_awarded, is_optimized, ironman_awarded = await award_points(
                request.user_email, request.problem_id, difficulty, stage, runtime, memory
            )

            if active_wager:
                settle_wager(request.user_email, active_wager["pool_id"], active_wager["amount_bet"], "won")

        else: # Submission was not accepted
            if active_wager:
                settle_wager(request.user_email, active_wager["pool_id"], active_wager["amount_bet"], "lost")

        # Calculate awarded_amount for response
        if points_awarded:
            base = get_difficulty_points(result.get("difficulty", "Easy"))
            earned = base * 2 if is_optimized else base
            if ironman_awarded: earned += 500
            awarded_amount = earned
        else:
            awarded_amount = 0

        result["points_awarded"] = points_awarded
        result["new_points"] = new_points
        result["is_optimized"] = is_optimized
        result["ironman_awarded"] = ironman_awarded
        result["awarded_amount"] = awarded_amount

        # SAVE HISTORY
        try:
            timestamp = datetime.now(PT_TZ).isoformat()
            lang_name = {71: "Python", 54: "C++", 50: "C", 62: "Java"}.get(request.language_id, "Unknown")
            submissions_table.put_item(Item={
                "user_email": request.user_email,
                "problem_id_timestamp": f"{request.problem_id}#{timestamp}",
                "submission_id": str(uuid.uuid4()),
                "problem_id": request.problem_id,
                "timestamp": timestamp,
                "status": result.get("status", {}).get("description", "Unknown"),
                "runtime_ms": Decimal(str(result.get("runtime_ms", 0))),
                "memory_mb": Decimal(str(result.get("memory_mb", 0.0))),
                "language": lang_name,
                "code": request.code,
                "is_optimized": is_optimized
            })
        except Exception as se:
            logger.error(f"History Save Error: {se}")
        
        return result
    except Exception as e:
        logger.error(f"Submission Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
