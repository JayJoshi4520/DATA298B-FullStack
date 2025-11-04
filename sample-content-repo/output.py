#!/usr/bin/env python3
"""
Script to create a basic Python Flask server project.
"""
import os
import json
from pathlib import Path


def main():
    """
    Creates a Flask server project with necessary files.
    """
    base_path = "/home/coder/project/"
    project_name = "flask_server"
    project_path = os.path.join(base_path, project_name)

    try:
        # Create project directory
        print(f"Creating project directory: {project_path}")
        os.makedirs(project_path, exist_ok=True)

        # Create server.py (Flask application)
        server_content = """
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True)
"""
        server_path = os.path.join(project_path, 'server.py')
        try:
            with open(server_path, 'w', encoding='utf-8') as f:
                f.write(server_content)
            print(f"✓ Created: {server_path}")
        except Exception as e:
            print(f"✗ Error creating {server_path}: {e}")
            return False

        # Create requirements.txt (Flask dependency)
        requirements_content = "flask"
        requirements_path = os.path.join(project_path, 'requirements.txt')
        try:
            with open(requirements_path, 'w', encoding='utf-8') as f:
                f.write(requirements_content)
            print(f"✓ Created: {requirements_path}")
        except Exception as e:
            print(f"✗ Error creating {requirements_path}: {e}")
            return False

        # Create README.md (Project instructions)
        readme_content = """
# Flask Server

A simple Flask server application.

## Installation

1.  Navigate to the project directory: `cd flask_server`
2.  Create a virtual environment: `python3 -m venv venv`
3.  Activate the virtual environment: `source venv/bin/activate`
4.  Install dependencies: `pip install -r requirements.txt`

## Running the application

1.  Run the Flask application: `python server.py`
2.  Access the application: Open your web browser and go to `http://127.0.0.1:5000/`
"""
        readme_path = os.path.join(project_path, 'README.md')
        try:
            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(readme_content)
            print(f"✓ Created: {readme_path}")
        except Exception as e:
            print(f"✗ Error creating {readme_path}: {e}")
            return False

        print("✓ Project created successfully!")
        return True

    except Exception as e:
        print(f"✗ Error creating project: {e}")
        return False


if __name__ == "__main__":
    main()
