from fastapi import FastAPI, HTTPException
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
