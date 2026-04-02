
import sys
import os
import uuid
import subprocess

# Mock logger
class MockLogger:
    def error(self, msg): print(f"ERROR: {msg}")
logger = MockLogger()

def run_local_java(code: str):
    file_id = str(uuid.uuid4())
    temp_dir = f"/tmp/{file_id}"
    os.makedirs(temp_dir, exist_ok=True)
    source_file = os.path.join(temp_dir, "Main.java")
    
    javac_path = "/Library/Java/JavaVirtualMachines/jdk-22.jdk/Contents/Home/bin/javac"
    java_path = "/Library/Java/JavaVirtualMachines/jdk-22.jdk/Contents/Home/bin/java"
    
    if not os.path.exists(javac_path): javac_path = "javac"
    if not os.path.exists(java_path): java_path = "java"

    try:
        with open(source_file, "w") as f:
            f.write(code)
        
        compile_process = subprocess.run(
            [javac_path, source_file],
            capture_output=True,
            text=True,
            timeout=15
        )
        
        if compile_process.returncode != 0:
            return {"status": "compile_error", "stderr": compile_process.stderr}
        
        execute_process = subprocess.run(
            [java_path, "-cp", temp_dir, "Main"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        return {
            "status": "ok",
            "stdout": execute_process.stdout,
            "stderr": execute_process.stderr,
            "returncode": execute_process.returncode
        }
    finally:
        import shutil
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)

test_code = """
public class Main {
    public static void main(String[] args) {
        System.out.println("HELLO_FROM_JAVA");
    }
}
"""

result = run_local_java(test_code)
print(result)
