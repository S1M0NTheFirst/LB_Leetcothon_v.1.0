import os
import subprocess
import uuid
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

def run_local_cpp(code: str, args: Optional[List[str]] = None) -> Dict[str, Any]:
    file_id = str(uuid.uuid4())
    source_file = f"/tmp/{file_id}.cpp"
    binary_file = f"/tmp/{file_id}"
    
    try:
        with open(source_file, "w") as f:
            f.write(code)
        
        # Compile
        compile_process = subprocess.run(
            ["g++", "-O3", source_file, "-o", binary_file],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if compile_process.returncode != 0:
            return {
                "status": {"description": "Compilation Error", "id": 6},
                "compile_output": compile_process.stderr,
                "stdout": "",
                "stderr": ""
            }
        
        # Execute
        run_args = [binary_file]
        if args:
            run_args.extend(args)
            
        execute_process = subprocess.run(
            run_args,
            capture_output=True,
            text=True,
            timeout=5
        )
        
        return {
            "status": {"description": "Accepted" if execute_process.returncode == 0 else "Runtime Error", "id": 3 if execute_process.returncode == 0 else 11},
            "stdout": execute_process.stdout,
            "stderr": execute_process.stderr,
            "time": 0,
            "memory": 0
        }
    except subprocess.TimeoutExpired:
        return {
            "status": {"description": "Time Limit Exceeded", "id": 5},
            "stdout": "",
            "stderr": "Execution timed out"
        }
    except Exception as e:
        logger.error(f"Local C++ execution error: {e}")
        return {
            "status": {"description": "Internal Error", "id": 13},
            "stderr": str(e)
        }
    finally:
        if os.path.exists(source_file): os.remove(source_file)
        if os.path.exists(binary_file): os.remove(binary_file)

def run_local_c(code: str, args: Optional[List[str]] = None) -> Dict[str, Any]:
    file_id = str(uuid.uuid4())
    source_file = f"/tmp/{file_id}.c"
    binary_file = f"/tmp/{file_id}"
    
    try:
        with open(source_file, "w") as f:
            f.write(code)
        
        # Compile
        compile_process = subprocess.run(
            ["gcc", "-O3", source_file, "-o", binary_file, "-lm"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if compile_process.returncode != 0:
            return {
                "status": {"description": "Compilation Error", "id": 6},
                "compile_output": compile_process.stderr,
                "stdout": "",
                "stderr": ""
            }
        
        # Execute
        run_args = [binary_file]
        if args:
            run_args.extend(args)

        execute_process = subprocess.run(
            run_args,
            capture_output=True,
            text=True,
            timeout=5
        )
        
        return {
            "status": {"description": "Accepted" if execute_process.returncode == 0 else "Runtime Error", "id": 3 if execute_process.returncode == 0 else 11},
            "stdout": execute_process.stdout,
            "stderr": execute_process.stderr,
            "time": 0,
            "memory": 0
        }
    except subprocess.TimeoutExpired:
        return {
            "status": {"description": "Time Limit Exceeded", "id": 5},
            "stdout": "",
            "stderr": "Execution timed out"
        }
    except Exception as e:
        logger.error(f"Local C execution error: {e}")
        return {
            "status": {"description": "Internal Error", "id": 13},
            "stderr": str(e)
        }
    finally:
        if os.path.exists(source_file): os.remove(source_file)
        if os.path.exists(binary_file): os.remove(binary_file)

def run_local_java(code: str) -> Dict[str, Any]:
    file_id = str(uuid.uuid4())
    # Java needs the class name to match the file name. 
    # Assume the class is always 'Solution' or wrap it.
    # The user's code will likely contain 'class Solution'.
    temp_dir = f"/tmp/{file_id}"
    os.makedirs(temp_dir, exist_ok=True)
    source_file = os.path.join(temp_dir, "Solution.java")
    
    try:
        # Wrap user code in a Main class if needed, but usually LeetCode style is just 'class Solution'
        # Let's assume the combined code has a public class 'Main' or we just name it Solution.java
        # and expect the main method to be there.
        with open(source_file, "w") as f:
            f.write(code)
        
        # Compile
        compile_process = subprocess.run(
            ["javac", source_file],
            capture_output=True,
            text=True,
            timeout=15
        )
        
        if compile_process.returncode != 0:
            return {
                "status": {"description": "Compilation Error", "id": 6},
                "compile_output": compile_process.stderr,
                "stdout": "",
                "stderr": ""
            }
        
        # Execute (Main class name depends on what's in the code)
        # We'll assume the driver code provides 'class Main' with main method.
        execute_process = subprocess.run(
            ["java", "-cp", temp_dir, "Main"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        return {
            "status": {"description": "Accepted" if execute_process.returncode == 0 else "Runtime Error", "id": 3 if execute_process.returncode == 0 else 11},
            "stdout": execute_process.stdout,
            "stderr": execute_process.stderr,
            "time": 0,
            "memory": 0
        }
    except subprocess.TimeoutExpired:
        return {
            "status": {"description": "Time Limit Exceeded", "id": 5},
            "stdout": "",
            "stderr": "Execution timed out"
        }
    except Exception as e:
        logger.error(f"Local Java execution error: {e}")
        return {
            "status": {"description": "Internal Error", "id": 13},
            "stderr": str(e)
        }
    finally:
        import shutil
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
