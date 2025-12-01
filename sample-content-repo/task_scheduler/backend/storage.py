from typing import List, Optional
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
