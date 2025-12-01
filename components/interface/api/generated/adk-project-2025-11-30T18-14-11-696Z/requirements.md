# Project Requirements Analysis

## 📋 Project Overview
The goal is to develop **`cron_builder`**, a full-stack developer utility application. This tool allows users to visually construct standard cron expressions via a GUI (Graphical User Interface) and immediately verify the schedule by calculating the next 10 execution times using a Python backend.

## 🎯 Core Requirements

### 1. Backend (FastAPI)
*   **API Framework:** FastAPI.
*   **Cron Logic:** Utilize `croniter` for parsing standard cron expressions.
*   **Endpoints:**
    *   `POST /parse`: Validates the cron string and potentially returns a human-readable description or validity status.
    *   `POST /next-runs`: Accepts a cron expression and returns a list of the next 10 execution timestamps (ISO format) based on the current server time.
*   **Error Handling:** Graceful handling of invalid cron syntax (returning 400 Bad Request).
*   **CORS:** Must enable CORS to allow the React frontend to communicate with the API.

### 2. Frontend (React)
*   **Visual Builder:** A set of 5 distinct dropdown/selector components representing:
    1.  Minute (0-59)
    2.  Hour (0-23)
    3.  Day of Month (1-31)
    4.  Month (1-12)
    5.  Day of Week (0-6 or SUN-SAT)
*   **Expression Preview:** Real-time display of the resulting string (e.g., `*/15 0 * * *`).
*   **Results Display:** A component to list the next 10 calculated run times returned by the backend.
*   **Styling:** "Clean developer UI" implies a functional, likely minimal design, potentially using monospaced fonts for data and high contrast (or dark mode).

### 3. Deployment / Infrastructure
*   **Containerization:** `docker-compose.yml` to orchestrate both the frontend (Node) and backend (Python) services simultaneously.
*   **Ignore Rules:** Standard `.gitignore` for Python and Node environments.

## 🛠️ Technical Stack

*   **Backend:** Python 3.9+, FastAPI, Uvicorn (Server), Croniter (Logic).
*   **Frontend:** React (Create React App structure), Axios (HTTP Client), CSS3.
*   **Containerization:** Docker & Docker Compose.

## 📐 Architecture

**Pattern:** Client-Server / REST API

1.  **User Action:** User changes a specific dropdown (e.g., selects "Every 5 minutes").
2.  **Frontend Logic:** React state updates the specific cron segment and reconstructs the full cron string.
3.  **API Call:** React `useEffect` triggers a POST request to `http://localhost:8000/next-runs` with the cron string payload.
4.  **Backend Processing:** FastAPI receives the request, `croniter` calculates dates starting from `datetime.now()`.
5.  **Response:** JSON array of ISO timestamps returned to Frontend.
6.  **Render:** Frontend formats timestamps and displays them in the `NextRuns` component.

## ✅ Success Criteria
1.  **Functional:** Changing a dropdown immediately updates the "Next Runs" list.
2.  **Accuracy:** The calculated times match standard Cron logic.
3.  **Resilience:** Entering/selecting an invalid combination does not crash the server.
4.  **UX:** The interface is clean, readable, and intuitive for a developer.
5.  **Start-up:** `docker-compose up` is the only command needed to run the full stack.

## ⚠️ Risks & Considerations
*   **Cron Complexity:** Standard cron has 5 fields. Advanced cron (Quartz/Spring) has 6 or 7. We will strictly scope this to standard 5-field Linux cron.
*   **Special Characters:** Handling `*`, `/`, `,`, and `-` in a simple dropdown UI is complex.
    *   *MVP Strategy:* The UI will focus on standard "Every X" or "Specific X" selections to keep the complexity manageable for the requested "dropdown" requirement, while allowing the user to type in the raw input field if they want complex ranges.
*   **Timezones:** The backend calculates based on server time (UTC usually in Docker). The frontend should format these to the user's local browser time for clarity.

## 📦 Deliverables Structure

The following file structure will be generated:

```text
cron_builder/
├── docker-compose.yml
├── .gitignore
├── backend/
│   ├── requirements.txt
│   ├── main.py
│   ├── cron_utils.py
│   └── README.md
└── frontend/
    ├── package.json
    ├── README.md
    └── src/
        ├── App.js
        ├── App.css
        └── components/
            ├── CronField.js
            └── NextRuns.js
```