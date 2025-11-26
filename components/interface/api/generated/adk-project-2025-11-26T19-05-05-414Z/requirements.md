# Project Requirements Analysis

## 📋 Project Overview
The goal is to containerize the existing `mnist_digit_classifier` full-stack application. This involves creating Docker configurations to encapsulate the frontend, backend, and machine learning model dependencies, allowing the entire application to be spun up and run consistently using a single orchestration command.

## 🎯 Core Requirements
1.  **Containerization of Backend:**
    *   Create a `Dockerfile` for the Python API/Model server.
    *   Ensure all ML dependencies (TensorFlow/PyTorch, Flask/FastAPI, NumPy, etc.) are installed.
    *   Ensure the model file is accessible within the container.
2.  **Containerization of Frontend:**
    *   Create a `Dockerfile` for the web interface.
    *   Ensure build steps (if applicable, e.g., React build) are handled or static files are served correctly.
3.  **Orchestration:**
    *   Create a `docker-compose.yml` file to manage both services simultaneously.
4.  **Configuration Updates:**
    *   Update backend network bindings to listen on `0.0.0.0` (required for Docker).
    *   Update frontend API base URLs to ensure it can communicate with the backend container (typically via localhost mapping or reverse proxy).
5.  **Optimization:**
    *   Implement `.dockerignore` files to prevent copying unnecessary local files (like `node_modules`, `venv`, or `__pycache__`) into the build context.

## 🛠️ Technical Stack
*   **Container Engine:** Docker
*   **Orchestration:** Docker Compose
*   **Base Images:**
    *   Backend: `python:3.8-slim` or `3.9-slim` (Optimized for size).
    *   Frontend: `node:alpine` (for development) or `nginx:alpine` (for serving static build artifacts).

## 📐 Architecture
The application will move from a local process architecture to a containerized microservices pattern:

1.  **Service A (Backend):** 
    *   Runs the API and ML Inference.
    *   Exposes Port (e.g., 5000).
    *   Contains the `model.h5` (or equivalent).
2.  **Service B (Frontend):**
    *   Serves the UI.
    *   Exposes Port (e.g., 3000 or 80).
3.  **Network:**
    *   Docker Bridge Network allowing containers to communicate if necessary.
    *   Port mapping to the Host machine to allow the user to access the app via browser.

## ✅ Success Criteria
1.  The user can navigate to the root directory and run `docker-compose up --build`.
2.  The application launches without manual installation of Python or Node.js dependencies on the host machine.
3.  The Frontend is accessible via browser (e.g., `http://localhost:3000`).
4.  The Frontend successfully sends image data to the Backend.
5.  The Backend successfully returns a prediction to the Frontend.

## ⚠️ Risks & Considerations
*   **CORS Issues:** Running on different ports/containers might trigger Cross-Origin Resource Sharing errors if not handled in the backend code.
*   **Host Binding:** If the backend runs on `127.0.0.1` inside the container, it will not be accessible. It **must** run on `0.0.0.0`.
*   **Model Loading:** Ensure the path to the model file is relative and works within the Linux container environment (case sensitivity matters).
*   **API URLs:** If the frontend is client-side (SPA), it needs to access the backend via the *Host's* localhost port, not the internal docker network DNS name (since the browser runs outside the container).

## 📦 Deliverables
1.  `/backend/Dockerfile`
2.  `/frontend/Dockerfile`
3.  `/docker-compose.yml`
4.  `/.dockerignore` (in root or respective subfolders)
5.  Updated backend entry point (e.g., `app.py` or `main.py`) to bind to Host `0.0.0.0`.