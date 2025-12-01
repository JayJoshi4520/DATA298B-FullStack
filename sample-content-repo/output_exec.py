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
    project_name = "task_scheduler"
    project_path = os.path.join(base_path, project_name)
    
    print("Creating " + project_name + " at: " + project_path)
    
    # ---------------------------------------------------------
    # 1. Root Configuration
    # ---------------------------------------------------------
    
    # .gitignore
    gitignore_content = """
node_modules/
__pycache__/
*.pyc
.env
dist/
.DS_Store
"""
    create_file(os.path.join(project_path, ".gitignore"), gitignore_content)

    # docker-compose.yml
    docker_compose_content = """version: '3.8'

services:
  backend:
    image: python:3.11-slim
    working_dir: /app
    volumes:
      - ./backend:/app
    command: >
      sh -c "pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
    ports:
      - "8000:8000"

  frontend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./frontend:/app
    command: >
      sh -c "npm install && npm run dev -- --host"
    ports:
      - "5173:5173"
    environment:
      - CHOKIDAR_USEPOLLING=true
"""
    create_file(os.path.join(project_path, "docker-compose.yml"), docker_compose_content)

    # ---------------------------------------------------------
    # 2. Backend Files
    # ---------------------------------------------------------
    
    backend_dir = os.path.join(project_path, "backend")

    # requirements.txt
    req_content = """fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.3
"""
    create_file(os.path.join(backend_dir, "requirements.txt"), req_content)

    # models.py
    models_content = """from pydantic import BaseModel, Field
from uuid import uuid4
from typing import Optional

class Task(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()))
    title: str
    date: str
    priority: str
"""
    create_file(os.path.join(backend_dir, "models.py"), models_content)

    # storage.py
    storage_content = """from typing import List, Optional
from models import Task

class TaskStorage:
    def __init__(self):
        # In-memory storage
        self._tasks: List[Task] = []

    def add_task(self, task: Task) -> Task:
        self._tasks.append(task)
        return task

    def get_all(self) -> List[Task]:
        return self._tasks

    def delete_task(self, task_id: str) -> bool:
        original_count = len(self._tasks)
        self._tasks = [t for t in self._tasks if t.id != task_id]
        return len(self._tasks) < original_count

# Singleton instance
db = TaskStorage()
"""
    create_file(os.path.join(backend_dir, "storage.py"), storage_content)

    # main.py
    main_py_content = """from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Task
from storage import db

app = FastAPI(title="Task Scheduler API")

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"  # Open for development convenience
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Task Scheduler API is running"}

@app.get("/tasks")
def get_tasks():
    return db.get_all()

@app.post("/tasks", status_code=201)
def create_task(task: Task):
    return db.add_task(task)

@app.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    success = db.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}
"""
    create_file(os.path.join(backend_dir, "main.py"), main_py_content)

    # Backend README
    backend_readme = """# Task Scheduler Backend

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run server:
   ```bash
   uvicorn main:app --reload
   ```
   
API will be available at http://localhost:8000
Docs available at http://localhost:8000/docs
"""
    create_file(os.path.join(backend_dir, "README.md"), backend_readme)

    # ---------------------------------------------------------
    # 3. Frontend Files
    # ---------------------------------------------------------
    
    frontend_dir = os.path.join(project_path, "frontend")

    # package.json
    pkg_json = {
        "name": "task-scheduler-frontend",
        "private": True,
        "version": "0.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
        },
        "devDependencies": {
            "@sveltejs/vite-plugin-svelte": "^3.0.1",
            "svelte": "^4.2.8",
            "vite": "^5.0.10"
        },
        "dependencies": {
            "axios": "^1.6.5"
        }
    }
    create_file(os.path.join(frontend_dir, "package.json"), json.dumps(pkg_json, indent=2))

    # vite.config.js
    vite_config = """import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true, // Needed for Docker
    port: 5173
  }
})
"""
    create_file(os.path.join(frontend_dir, "vite.config.js"), vite_config)

    # public/index.html
    index_html = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task Scheduler</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
"""
    create_file(os.path.join(frontend_dir, "public", "index.html"), index_html)

    # src/main.js
    main_js = """import './styles.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
})

export default app
"""
    create_file(os.path.join(frontend_dir, "src", "main.js"), main_js)

    # src/styles.css
    styles_css = """:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
  justify-content: center;
}

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  width: 100%;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
  margin-bottom: 2rem;
}

.card {
  padding: 2em;
  background-color: #333;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.input-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

input, select {
  padding: 0.6em 1.2em;
  border-radius: 4px;
  border: 1px solid #555;
  background-color: #1a1a1a;
  color: white;
  font-size: 1em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #646cff;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
  background-color: #535bf2;
}

button.delete-btn {
  background-color: #ff4646;
  padding: 0.4em 0.8em;
  font-size: 0.9em;
}
button.delete-btn:hover {
  background-color: #d63333;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #333;
}

th {
  background-color: #444;
  color: #fff;
}

tr:hover {
  background-color: #2a2a2a;
}
"""
    create_file(os.path.join(frontend_dir, "src", "styles.css"), styles_css)

    # src/App.svelte
    app_svelte = """<script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  // State variables
  let tasks = [];
  let newTask = {
    title: '',
    date: '',
    priority: 'Medium'
  };
  let loading = false;
  let error = null;

  // API Base URL (assumes localhost:8000 for local dev)
  const API_URL = 'http://localhost:8000/tasks';

  // Fetch tasks on component mount
  onMount(async () => {
    await fetchTasks();
  });

  async function fetchTasks() {
    try {
      loading = true;
      const response = await axios.get(API_URL);
      tasks = response.data;
      error = null;
    } catch (err) {
      console.error(err);
      error = "Failed to connect to backend. Is it running?";
    } finally {
      loading = false;
    }
  }

  async function addTask() {
    if (!newTask.title || !newTask.date) {
      alert("Please fill in Title and Date");
      return;
    }

    try {
      await axios.post(API_URL, newTask);
      // Reset form
      newTask = { title: '', date: '', priority: 'Medium' };
      // Refresh list
      await fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Error adding task");
    }
  }

  async function deleteTask(id) {
    if(!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Error deleting task");
    }
  }
</script>

<main>
  <h1>Task Scheduler</h1>

  <div class="card">
    <h2>Add New Task</h2>
    <div class="input-group">
      <input 
        type="text" 
        placeholder="Task Title" 
        bind:value={newTask.title} 
      />
      <input 
        type="date" 
        bind:value={newTask.date} 
      />
      <select bind:value={newTask.priority}>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>
      <button on:click={addTask}>Add Task</button>
    </div>
  </div>

  {#if error}
    <div style="color: #ff4646; margin: 1rem;">{error}</div>
  {/if}

  {#if loading}
    <p>Loading tasks...</p>
  {:else if tasks.length === 0}
    <p>No tasks scheduled. Add one above!</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th>Priority</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {#each tasks as task (task.id)}
          <tr>
            <td>{task.title}</td>
            <td>{task.date}</td>
            <td>
              <span style="
                color: {task.priority === 'High' || task.priority === 'Critical' ? '#ff4646' : 'inherit'};
                font-weight: {task.priority === 'High' || task.priority === 'Critical' ? 'bold' : 'normal'}
              ">
                {task.priority}
              </span>
            </td>
            <td>
              <button class="delete-btn" on:click={() => deleteTask(task.id)}>Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
"""
    create_file(os.path.join(frontend_dir, "src", "App.svelte"), app_svelte)

    # Frontend README
    frontend_readme = """# Task Scheduler Frontend

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```

Access the app at http://localhost:5173
"""
    create_file(os.path.join(frontend_dir, "README.md"), frontend_readme)

    print("\n✓ Project created successfully!")
    print("Next steps:")
    print(f"1. cd {project_path}")
    print("2. Option A (Docker): Run 'docker-compose up'")
    print("3. Option B (Manual):")
    print("   - Terminal 1: cd backend && pip install -r requirements.txt && uvicorn main:app --reload")
    print("   - Terminal 2: cd frontend && npm install && npm run dev")

if __name__ == "__main__":
    main()
