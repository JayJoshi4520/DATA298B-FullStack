from pydantic import BaseModel, Field
from uuid import uuid4
from typing import Optional

class Task(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()))
    title: str
    date: str
    priority: str
