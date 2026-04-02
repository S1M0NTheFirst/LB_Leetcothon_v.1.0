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
            "compile_output": compile_process.stderr,
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
            "stderr": str(e),
            "compile_output": ""
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
            "compile_output": compile_process.stderr,
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
            "stderr": str(e),
            "compile_output": ""
        }
    finally:
        if os.path.exists(source_file): os.remove(source_file)
        if os.path.exists(binary_file): os.remove(binary_file)

def run_local_java(code: str, args: Optional[List[str]] = None) -> Dict[str, Any]:
    file_id = str(uuid.uuid4())
    temp_dir = f"/tmp/{file_id}"
    os.makedirs(temp_dir, exist_ok=True)
    
    # In Java, the source filename must match the public class name.
    # Our drivers use 'public class Main'.
    source_file = os.path.join(temp_dir, "Main.java")
    
    # Try to find javac and java paths
    javac_path = "/Library/Java/JavaVirtualMachines/jdk-22.jdk/Contents/Home/bin/javac"
    java_path = "/Library/Java/JavaVirtualMachines/jdk-22.jdk/Contents/Home/bin/java"
    
    if not os.path.exists(javac_path):
        javac_path = "javac" # Fallback to PATH
    if not os.path.exists(java_path):
        java_path = "java" # Fallback to PATH

    try:
        with open(source_file, "w") as f:
            f.write(code)
        
        # Compile
        compile_process = subprocess.run(
            [javac_path, source_file],
            capture_output=True,
            text=True,
            timeout=15
        )
        
        if compile_process.returncode != 0:
            return {
                "status": {"description": "Compilation Error", "id": 6},
                "compile_output": compile_process.stderr,
                "stdout": "",
                "stderr": compile_process.stderr
            }
        
        # Execute
        run_args = [java_path, "-cp", temp_dir, "Main"]
        if args:
            run_args.extend(args)

        execute_process = subprocess.run(
            run_args,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        return {
            "status": {"description": "Accepted" if execute_process.returncode == 0 else "Runtime Error", "id": 3 if execute_process.returncode == 0 else 11},
            "stdout": execute_process.stdout,
            "stderr": execute_process.stderr,
            "compile_output": compile_process.stderr,
            "time": 0,
            "memory": 0
        }
    except FileNotFoundError as e:
        logger.error(f"Java tools not found: {e}")
        return {
            "status": {"description": "Internal Error", "id": 13},
            "message": f"Java execution environment not properly configured: {e}"
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
            "message": str(e)
        }
    finally:
        import shutil
        # Small delay to ensure file handles are closed
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
