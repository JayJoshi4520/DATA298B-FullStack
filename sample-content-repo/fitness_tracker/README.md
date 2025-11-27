# Fitness Tracker Application

This is a full-stack fitness tracking application containerized with Docker. It features a multi-page Vue.js frontend with client-side routing and a Node.js backend API.

## Architecture
- **Frontend:** A Vue.js 3 Single Page Application (SPA) with Vue Router, served by Nginx.
- **Backend:** A Node.js/Express.js API server.
- **Orchestration:** Docker Compose to manage the multi-container setup.

## How to Run
Ensure you have Docker and Docker Compose installed on your system.

1. **Navigate to the project root directory:**
   ```bash
   cd fitness_tracker
   ```

2. **Build and run the containers:**
   ```bash
   docker compose up --build
   ```
   The `--build` flag is important to rebuild the images with any changes.

## Accessing the Application
- **Frontend Application:** [http://localhost:8080](http://localhost:8080)
  - **Home Page:** [http://localhost:8080/](http://localhost:8080/)
  - **Dashboard:** [http://localhost:8080/dashboard](http://localhost:8080/dashboard)
  - **About Page:** [http://localhost:8080/about](http://localhost:8080/about)
- **Backend API (for testing):** [http://localhost:3000/api/workouts](http://localhost:3000/api/workouts)

The frontend is configured to proxy API requests starting with `/api` to the backend service, so you don't have to worry about CORS or specifying ports in the frontend code.