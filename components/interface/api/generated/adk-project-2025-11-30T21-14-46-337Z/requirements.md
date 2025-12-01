# Project Requirements Analysis

## 📋 Project Overview
The user requires a lightweight, full-stack web application named **"task_scheduler"**. The application serves as a task management tool allowing users to create tasks with specific attributes (Title, Date, Priority) and view them in a list. The system uses **Svelte** for the frontend and **FastAPI** (Python) for the backend, orchestrated via **Docker Compose**.

## 🎯 Core Requirements

### 1. Functional Requirements
*   **Task Creation:** Users must be able to input a Task Title, Scheduled Date, and Priority level.
*   **Task Visualization:** Users must be able to view a table of all scheduled tasks.
*   **Data Persistence:** Data will be stored in-memory (non-persistent across restarts) on the backend.
*   **API Communication:** The frontend must communicate with the backend via REST HTTP requests.

### 2. Interface Requirements (Frontend)
*   **Input Form:** Fields for Title (text), Date (date/datetime picker), and Priority (selection or text).
*   **Data Table:** Columns for ID, Title, Date, and Priority.
*   **Styling:** Responsive design using vanilla CSS.

### 3. Backend Requirements
*   **API Endpoints:**
    *   `GET /tasks`: Retrieve all tasks.
    *   `POST /tasks`: Create a new task.
    *   `DELETE /tasks/{id}`: Delete a task (Required by "CRUD routes" specification, even if frontend usage isn't explicitly detailed).
*   **Data Model:** Task object containing `id`, `title`, `date`, `priority`.
*   **Storage:** In-memory list implementation separate from the main controller logic.

## 🛠️ Technical Stack

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | **Svelte** (via Vite) | High performance, low boilerplate, simple reactivity for form/table updates. |
| **HTTP Client** | **Axios** | Simplified Promise-based HTTP requests with easy config. |
| **Backend** | **FastAPI** | High-performance Python framework with automatic data validation (Pydantic). |
| **Server** | **Uvicorn** | ASGI server required to run FastAPI. |
| **Orchestration** | **Docker Compose** | Simplifies running the polyglot stack (Node + Python) simultaneously. |

## 📐 Architecture

### High-Level Design
The application follows a standard **Client-Server** architecture.

1.  **Client (Browser):** Loads Svelte app -> Sends JSON data via Axios -> `http://localhost:8000`.
2.  **Server (FastAPI):** Receives Request -> Validates via Pydantic -> Updates `storage.py` (List) -> Returns JSON response.

### Directory Structure
To maintain separation of concerns and enable Docker containerization, the project will use the following structure:

```text
task_scheduler/
├── docker-compose.yml
├── .gitignore
├── frontend/             # Svelte Application
│   ├── package.json
│   ├── vite.config.js    # Implicit requirement for Vite
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── main.js
│       ├── App.svelte
│       └── styles.css
└── backend/              # FastAPI Application
    ├── requirements.txt
    ├── main.py
    ├── models.py
    └── storage.py
```

## ✅ Success Criteria
1.  **Compilation:** `npm run dev` starts the frontend without errors.
2.  **Execution:** `python main.py` (or uvicorn) starts the backend without errors.
3.  **Orchestration:** `docker-compose up` builds and runs both services successfully.
4.  **Functionality:**
    *   Submitting the form adds a row to the table immediately (or after refresh).
    *   The backend logs show successful 200/201 HTTP codes.
    *   Data survives browser refreshes (as long as the backend server keeps running).

## ⚠️ Risks & Considerations

*   **CORS (Cross-Origin Resource Sharing):**
    *   *Risk:* The browser will block requests from the Svelte app (port ~5173) to the API (port 8000).
    *   *Mitigation:* `CORSMiddleware` must be explicitly configured in `backend/main.py`.
*   **Network Addressing:**
    *   *Risk:* Docker containers have internal networking, but the Browser runs on the *Host* machine.
    *   *Mitigation:* The Frontend must call `localhost:8000` (mapped port), not the internal Docker service name (e.g., `http://backend:8000`), because the code runs in the user's browser, not inside the frontend container.
*   **Date Formatting:**
    *   *Risk:* Inconsistencies between JS Date objects and Python Datetime objects.
    *   *Mitigation:* Use ISO string format for data transfer.

## 📦 Deliverables

The Code Generation Agent must generate the following files:

1.  **`task_scheduler/.gitignore`**: Exclude node_modules, venv, pycache.
2.  **`task_scheduler/docker-compose.yml`**: Services for `frontend` and `backend`.
3.  **`task_scheduler/backend/requirements.txt`**: fastapi, uvicorn.
4.  **`task_scheduler/backend/models.py`**: Pydantic `BaseModel` for Task.
5.  **`task_scheduler/backend/storage.py`**: Class/Functions for `tasks = []`.
6.  **`task_scheduler/backend/main.py`**: FastAPI app with CORS and Routes.
7.  **`task_scheduler/backend/README.md`**: Python run instructions.
8.  **`task_scheduler/frontend/package.json`**: Scripts and dependencies.
9.  **`task_scheduler/frontend/vite.config.js`**: Standard Vite config (crucial for valid project).
10. **`task_scheduler/frontend/public/index.html`**: HTML entry point.
11. **`task_scheduler/frontend/src/styles.css`**: CSS definitions.
12. **`task_scheduler/frontend/src/main.js`**: Mount point.
13. **`task_scheduler/frontend/src/App.svelte`**: Main UI logic (Axios calls + State).
14. **`task_scheduler/frontend/README.md`**: NPM run instructions.