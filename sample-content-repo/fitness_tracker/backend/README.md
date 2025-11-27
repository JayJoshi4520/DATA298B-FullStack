# Backend - Flask API

This directory contains the Python Flask backend for the Fitness Tracker application.

## Functionality
- Exposes a RESTful API to manage workout data.
- Connects to a SQLite database (`fitness.db`) using request-scoped connections.
- Handles creation and retrieval of workout records.

## API Endpoints
- `GET /workouts`: Fetches all workout records.
- `POST /workouts`: Creates a new workout record. Expects a JSON body with `exercise_name`, `duration_minutes`, and `calories_burned`.

## Running Standalone (for development)
1.  **Create a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Initialize the database:**
    This command needs to be run once to create the database schema.
    ```bash
    flask init-db
    ```
4.  **Run the application:**
    ```bash
    flask run
    ```
The API will be available at `http://localhost:5000` (Flask's default port).