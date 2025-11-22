import subprocess
import sys

# Run the output.py script and capture output
try:
    result = subprocess.run([sys.executable, "/home/coder/project/output.py"], capture_output=True, text=True)
    print(result.stdout)
    print(result.stderr)
except Exception as e:
    print(str(e))
