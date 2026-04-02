
import sys
import os
import uuid
import subprocess

def run_local_java(code: str, args=None):
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
        
        run_args = [java_path, "-cp", temp_dir, "Main"]
        if args: run_args.extend(args)

        execute_process = subprocess.run(
            run_args,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        return {
            "status": "Accepted" if execute_process.returncode == 0 else "Runtime Error",
            "returncode": execute_process.returncode,
            "stdout": execute_process.stdout,
            "stderr": execute_process.stderr
        }
    finally:
        import shutil
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)

test_code = """
public class Main {
    public static void main(String[] args) {
        try {
            int x = Integer.parseInt("not-a-number");
        } catch (Exception e) {
            e.printStackTrace(System.err);
            System.exit(1);
        }
    }
}
"""

result = run_local_java(test_code)
print(result)
