# Project Requirements Analysis

## 📋 Project Overview
This document outlines the technical requirements for building "fitness_tracker," a full-stack web application. The application will enable users to log their workouts—including exercise type, duration, and calories burned—and view a history of their entries. The system will be composed of a React frontend, a Flask backend API, a SQLite database, and will be containerized using Docker for streamlined development and deployment.

## 🎯 Core Requirements
The primary goal is to deliver a Minimum Viable Product (MVP) with the following features:

1.  **Workout Logging:** Users must be able to submit a new workout through a form on the web interface. The form will capture:
    *   Exercise Name (e.g., "Running", "Weightlifting")
    *   Duration (in minutes)
    *   Calories Burned

2.  **Workout Display:** All submitted workouts must be displayed in a list on the main page. The list should update dynamically after a new workout is added. The display should be a clean, card-based layout.

3.  **Data Persistence:** All workout data must be stored permanently in a SQLite database. The database file should be automatically created if it does not exist when the application starts.

4.  **API Endpoints:** The backend must expose a RESTful API to manage workouts.
    *   `GET /workouts`: Fetches all existing workout records.
    *   `POST /workouts`: Creates a new workout record.

5.  **Containerization:** The entire application (frontend and backend) must be orchestrated by Docker Compose, allowing for a one-command setup (`docker-compose up`).

## 🛠️ Technical Stack

| Component         | Technology            | Rationale                                                                                                  |
| ----------------- | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Frontend**      | React, Axios          | A modern, component-based library for building interactive UIs. Axios is a standard for making HTTP requests.      |
| **Backend**       | Flask, Python         | A lightweight and flexible web framework, ideal for creating simple RESTful APIs quickly.                |
| **Database**      | SQLite                | A serverless, file-based database perfect for small-scale applications, requiring zero configuration.        |
| **API Handling**  | Flask-CORS            | Essential for handling Cross-Origin Resource Sharing, as the frontend and backend run on different ports. |
| **Environment**   | Docker & Docker Compose | Ensures a consistent and reproducible development environment, simplifying dependency management and deployment. |
| **Configuration** | python-dotenv         | Manages environment variables for configuration (like the database path) cleanly.                          |

## 📐 Architecture
The application will follow a classic client-server architecture.

1.  **Client (React Frontend):**
    *   Runs in its own Docker container on port **4000**.
    *   Renders the UI, including the workout form and list.
    *   Communicates with the backend API via `axios` to fetch and submit data. The API endpoint will be configured to `http://localhost:8000/workouts`.

2.  **Server (Flask Backend):**
    *   Runs in a separate Docker container on port **8000**.
    *   Provides the `/workouts` REST API endpoint.
    *   Handles all business logic and interacts directly with the SQLite database for all CRUD (Create, Read) operations.

3.  **Data Layer (SQLite):**
    *   The SQLite database file (`fitness.db`) will reside within the `backend` directory.
    *   A `db.py` script will be responsible for initializing the database and creating the `workouts` table on first launch.
    *   **Schema for `workouts` table:**
        *   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
        *   `exercise_name` (TEXT, NOT NULL)
        *   `duration_minutes` (INTEGER, NOT NULL)
        *   `calories_burned` (INTEGER, NOT NULL)
        *   `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## ✅ Success Criteria
The project will be considered complete and successful when:
1.  Running `docker-compose up` builds and starts both the frontend and backend services without errors.
2.  The frontend is accessible at `http://localhost:4000` and displays the main application UI.
3.  A user can successfully submit the "Add Workout" form, and the new workout appears in the list on the UI.
4.  The submitted workout data is correctly saved in the `backend/fitness.db` SQLite file.
5.  Upon refreshing the browser or restarting the containers, previously submitted workouts are re-loaded from the database and displayed correctly.
6.  The backend API at `http://localhost:8000/workouts` responds correctly to `GET` and `POST` requests.
7.  The final project structure and all specified files are present and contain functional, non-placeholder code.

## ⚠️ Risks & Considerations
*   **CORS (Cross-Origin Resource Sharing):** The backend must be explicitly configured with `Flask-CORS` to allow requests from the frontend's origin (`http://localhost:4000`). Failure to do so will block all API calls from the browser.
*   **Docker Networking:** The React application must be configured to make API calls to the backend service name as defined in `docker-compose.yml` (e.g., `http://backend:8000`), or to the mapped host port (`http://localhost:8000`) if running locally. The latter is simpler for this context.
*   **Database Initialization:** The database initialization script (`db.py`) must be idempotent, meaning it can be run multiple times without causing errors (e.g., by using `CREATE TABLE IF NOT EXISTS`).
*   **Data Validation:** The current scope does not include input validation. For this MVP, we will assume users enter valid data (e.g., numbers for duration and calories).

## 📦 Deliverables
The final output will be a directory named `fitness_tracker` containing the following file structure and content:

```
fitness_tracker/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── backend/
│   ├── app.py
│   ├── db.py
│   ├── models.py
│   ├── requirements.txt
│   └── README.md
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.css
        ├── App.js
        └── index.js
```