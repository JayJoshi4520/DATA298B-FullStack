# Project Requirements Analysis

## 📋 Project Overview
This document outlines the requirements for a full-stack web application named "fitness_tracker". The application will enable users to perform basic tracking of their workouts, including the type of exercise and calories burned. The project will be containerized using Docker for ease of setup and deployment. The goal is to deliver a functional Minimum Viable Product (MVP) with a clear separation between the frontend and backend services.

## 🎯 Core Requirements
The application must provide the following core functionalities:

1.  **Workout Creation:** Users must be able to submit a new workout through a form on the user interface. Each workout entry will include:
    *   `exercise_name` (e.g., "Running", "Weightlifting")
    *   `duration_minutes` (e.g., 30)
    *   `calories_burned` (e.g., 300)

2.  **Workout Display:** Users must be able to view a list of all previously submitted workouts on the main page. The list should update automatically after a new workout is added.

3.  **Backend API:** A backend service must expose a RESTful API to handle workout data.
    *   It must provide an endpoint to retrieve all workouts.
    *   It must provide an endpoint to create a new workout.

4.  **Data Persistence:** Workout data must be stored persistently in an SQLite database. The database file should be created automatically if it does not exist upon application startup.

5.  **Containerization:** Both frontend and backend applications must be containerized using Docker and managed via a single `docker-compose.yml` file.

## 🛠️ Technical Stack

| Component         | Technology         | Rationale                                                                                                       |
| ----------------- | ------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Frontend**      | React              | A popular and robust JavaScript library for building user interfaces, as specified in the user request.           |
| **HTTP Client**   | Axios              | A promise-based HTTP client for making API requests from the React frontend to the Flask backend.                 |
| **Backend**       | Flask              | A lightweight and flexible Python web framework, ideal for creating RESTful APIs quickly.                         |
| **Database**      | SQLite             | A self-contained, serverless SQL database engine suitable for development and small-scale applications.           |
| **Containerization** | Docker & Docker Compose | To create a consistent, isolated, and reproducible development environment for both services.                 |

## 📐 Architecture
The application will follow a classic client-server architecture.

1.  **Frontend (Client):**
    *   A single-page application (SPA) built with React.
    *   Resides in the root directory.
    *   Communicates with the backend via RESTful API calls (using Axios).
    *   Manages its own state for displaying workouts and handling form input.
    *   Will run in a Docker container on port **4000**.

2.  **Backend (Server):**
    *   A RESTful API built with Flask.
    *   Resides in the `/backend` subdirectory.
    *   Handles all business logic and CRUD (Create, Read) operations for workouts.
    *   Interacts directly with the SQLite database.
    *   Will run in a separate Docker container on port **8000**.
    *   CORS (Cross-Origin Resource Sharing) must be enabled to allow requests from the frontend origin (http://localhost:4000).

3.  **Database:**
    *   An SQLite database file (`workouts.db`) located within the `/backend` directory.
    *   The database will contain a single table named `workouts` with the following schema:
        *   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
        *   `exercise_name` (TEXT, NOT NULL)
        *   `duration_minutes` (INTEGER, NOT NULL)
        *   `calories_burned` (INTEGER, NOT NULL)
        *   `date_created` (TEXT, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

4.  **API Endpoints:**
    *   `GET /workouts`: Retrieves a list of all workouts in JSON format.
    *   `POST /workouts`: Accepts a JSON payload (`{exercise_name, duration_minutes, calories_burned}`) to create a new workout. Returns the newly created workout object.

## ✅ Success Criteria
The project will be considered complete and successful when the following criteria are met:
1.  The entire application can be started with a single command: `docker-compose up`.
2.  The user can navigate to `http://localhost:4000` in a web browser and see the application interface.
3.  The main page displays a form to add a new workout and a list of any existing workouts fetched from the backend.
4.  A user can fill out the form and submit it. The new workout is saved to the SQLite database via the backend API.
5.  The list of workouts on the frontend updates immediately to show the newly added workout without requiring a page refresh.
6.  All specified files and folders are created, and the code is functional and free of placeholder content.

## ⚠️ Risks & Considerations
*   **CORS Configuration:** The Flask backend must be correctly configured to accept cross-origin requests from the React frontend (running on a different port). This is a common point of failure in development.
*   **Database Initialization:** The database schema initialization logic must be robust and run only once. The application should gracefully handle the case where the database file already exists.
*   **Docker Networking:** The frontend and backend containers must be on the same Docker network to communicate with each other. The frontend will need to reference the backend by its service name (e.g., `http://backend:8000`) within the Docker network.
*   **Error Handling:** The initial MVP will have minimal error handling. For example, form validation (e.g., ensuring duration is a number) will be basic. This is an area for future improvement.

## 📦 Deliverables
The final deliverable will be a directory named `fitness_tracker` with the following structure and files:

```
fitness_tracker/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── public/
│   └── index.html
├── src/
│   ├── App.css
│   ├── App.js
│   └── index.js
└── backend/
    ├── app.py
    ├── db.py
    ├── models.py
    ├── README.md
    └── requirements.txt
```