import subprocess
import sys

# Run the output.py script and capture output
result = subprocess.run([sys.executable, "/home/coder/project/output.py"], capture_output=True, text=True)

print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)

if result.returncode == 0:
    print("Script executed successfully.")
else:
    print(f"Script failed with return code {result.returncode}")
