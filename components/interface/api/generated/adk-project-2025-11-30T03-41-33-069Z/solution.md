#!/usr/bin/env python3
import os
import json
from pathlib import Path

def create_file(path, content):
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✓ Created: " + path)
    except Exception as e:
        print("✗ Error creating " + path + ": " + str(e))

def main():
    base_path = "/home/coder/project/"
    project_name = "markdown_preview"
    project_path = os.path.join(base_path, project_name)
    
    print("Creating " + project_name + " at: " + project_path)

    # --------------------------------------------------------------------------
    # 1. ROOT CONFIGURATION
    # --------------------------------------------------------------------------
    
    gitignore_content = """
node_modules/
__pycache__/
*.pyc
.env
build/
dist/
.DS_Store
"""
    create_file(os.path.join(project_path, ".gitignore"), gitignore_content)

    docker_compose_content = """version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
    environment:
      - FLASK_ENV=development

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    stdin_open: true
    tty: true
    environment:
      - CHOKIDAR_USEPOLLING=true
"""
    create_file(os.path.join(project_path, "docker-compose.yml"), docker_compose_content)

    # --------------------------------------------------------------------------
    # 2. BACKEND (FLASK)
    # --------------------------------------------------------------------------
    
    backend_path = os.path.join(project_path, "backend")
    
    backend_readme = """# Markdown Preview Backend

Flask application that renders Markdown to HTML using `markdown` library and `pygments` for syntax highlighting.

## Run Locally
```bash
pip install -r requirements.txt
python app.py
```
"""
    create_file(os.path.join(backend_path, "README.md"), backend_readme)

    requirements_txt = """flask==3.0.0
flask-cors==4.0.0
markdown==3.5.1
pygments==2.17.2
"""
    create_file(os.path.join(backend_path, "requirements.txt"), requirements_txt)

    backend_dockerfile = """FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]
"""
    create_file(os.path.join(backend_path, "Dockerfile"), backend_dockerfile)

    app_py = """import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import markdown
from markdown.extensions.codehilite import CodeHiliteExtension
from markdown.extensions.tables import TableExtension
from markdown.extensions.fenced_code import FencedCodeExtension

app = Flask(__name__)
# Enable CORS for all routes, allowing requests from frontend
CORS(app)

@app.route('/render', methods=['POST'])
def render_markdown():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        md_text = data.get('text', '')
        
        # Configure extensions
        # fenced_code: Support for ```code``` blocks
        # tables: Support for markdown tables
        # codehilite: Syntax highlighting using Pygments
        extensions = [
            FencedCodeExtension(),
            TableExtension(),
            CodeHiliteExtension(css_class='codehilite', linenums=False, guess_lang=True)
        ]
        
        html_content = markdown.markdown(md_text, extensions=extensions)
        
        return jsonify({'html': html_content})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on 0.0.0.0 to be accessible from outside the container
    app.run(host='0.0.0.0', port=5000, debug=True)
"""
    create_file(os.path.join(backend_path, "app.py"), app_py)

    # --------------------------------------------------------------------------
    # 3. FRONTEND (REACT)
    # --------------------------------------------------------------------------
    
    frontend_path = os.path.join(project_path, "frontend")
    
    frontend_readme = """# Markdown Preview Frontend

React application providing a split-pane editor for Markdown.

## Run Locally
```bash
npm install
npm start
```
"""
    create_file(os.path.join(frontend_path, "README.md"), frontend_readme)

    package_json = {
        "name": "markdown-preview-frontend",
        "version": "0.1.0",
        "private": True,
        "dependencies": {
            "axios": "^1.6.2",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-scripts": "5.0.1",
            "web-vitals": "^2.1.4"
        },
        "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject"
        },
        "eslintConfig": {
            "extends": [
                "react-app",
                "react-app/jest"
            ]
        },
        "browserslist": {
            "production": [
                ">0.2%",
                "not dead",
                "not op_mini all"
            ],
            "development": [
                "last 1 chrome version",
                "last 1 firefox version",
                "last 1 safari version"
            ]
        }
    }
    create_file(os.path.join(frontend_path, "package.json"), json.dumps(package_json, indent=2))

    frontend_dockerfile = """FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

CMD ["npm", "start"]
"""
    create_file(os.path.join(frontend_path, "Dockerfile"), frontend_dockerfile)

    frontend_gitignore = """# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
"""
    create_file(os.path.join(frontend_path, ".gitignore"), frontend_gitignore)

    # Public folder
    public_path = os.path.join(frontend_path, "public")
    index_html = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Markdown Preview</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
"""
    create_file(os.path.join(public_path, "index.html"), index_html)

    # Src folder
    src_path = os.path.join(frontend_path, "src")
    
    index_js = """import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"""
    create_file(os.path.join(src_path, "index.js"), index_js)

    app_js = """import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Editor from './components/Editor';
import Preview from './components/Preview';

function App() {
  const [markdown, setMarkdown] = useState('# Hello Markdown\\n\\nType your markdown here!\\n\\n## Features\\n\\n- Live Preview\\n- GitHub Flavored Markdown\\n- Syntax Highlighting\\n\\n