# Project Requirements Analysis

## 📋 Project Overview
The user requires a resolution for a buggy `Dockerfile` located in `/mnist_digit_classifier/frontend`. To ensure the "final working project" request is met, we must provide not just the fixed Dockerfile, but a functional context (Backend + Model) to ensure the frontend has an API to consume.

The project is an **MNIST Digit Classifier**, a web application allowing users to input handwritten digits (likely via a drawing canvas) and receive a classification prediction from a machine learning model.

## 🎯 Core Requirements
### 1. Frontend (The Primary Fix)
*   **Web Interface:** A drawing canvas for users to write digits (0-9).
*   **API Integration:** Mechanism to convert the drawing (canvas data) to a tensor/image and send it to the backend.
*   **Response Handling:** Display the predicted digit and confidence score.
*   **Containerization:** A robust, multi-stage `Dockerfile` that builds the static assets and serves them (fixing the reported bug).

### 2. Backend (Contextual Requirement)
*   **API Endpoint:** REST API (FastAPI recommended) to accept image data.
*   **Inference Engine:** A pre-trained model (or simple training script) to classify the digit.
*   **CORS Handling:** Allow requests from the frontend container.

### 3. Orchestration
*   **Docker Compose:** A `docker-compose.yml` to spin up both the Frontend and Backend services in a shared network, solving potential networking issues.

## 🛠️ Technical Stack
*   **Frontend Framework:** **React** (using Vite for speed). It provides a rich ecosystem for drawing canvas libraries (`react-canvas-draw`) and state management.
*   **Frontend Server:** **Nginx (Alpine Linux)**. Used within the Docker container to serve the static React build files. This is the industry standard for production frontend containers.
*   **Backend:** **FastAPI (Python)**. High performance, native async support, and easy integration with ML libraries.
*   **ML Library:** **PyTorch** or **TensorFlow/Keras**. (We will use a simple PyTorch CNN for clarity and ease of installation).
*   **Containerization:** **Docker** & **Docker Compose**.

## 📐 Architecture
The solution will utilize a **Microservices Architecture**:

1.  **Service A (Frontend):** 
    *   Build Stage: Node.js image to compile React code.
    *   Serve Stage: Nginx image to host the artifacts on port 80.
2.  **Service B (Backend):** 
    *   Python image running Uvicorn/FastAPI.
    *   Loads the trained model into memory.
    *   Exposes port 8000.
3.  **Communication:** HTTP/REST over a Docker bridge network.

## ✅ Success Criteria
1.  **Successful Build:** The `frontend` Dockerfile builds without errors (fixing the original bug).
2.  **Container Startup:** `docker-compose up` starts both containers without exiting.
3.  **Functional UI:** User can access `localhost`, draw a number, click "Predict", and see a correct result.
4.  **Network Visibility:** Frontend container can successfully reach Backend container via service name (e.g., `http://backend:8000`).

## ⚠️ Risks & Considerations
*   **Common Dockerfile Bugs (likely the user's original issue):**
    *   `node_modules` not being ignored (need `.dockerignore`).
    *   Wrong working directory.
    *   Permissions issues with `npm install`.
    *   Missing Nginx configuration for Single Page Application routing (React Router).
*   **CORS:** The browser enforces CORS; the Backend must explicitly allow the Frontend origin.
*   **Model Input:** The drawing canvas must strictly match the MNIST format (28x28 grayscale, white on black background) or the predictions will be random. Pre-processing in the backend is critical.

## 📦 Deliverables

### File Structure
```text
/mnist_digit_classifier
├── docker-compose.yml          # Orchestration
├── /backend                    # Python API
│   ├── Dockerfile
│   ├── main.py                 # FastAPI app
│   ├── model.py                # Neural Network Definition
│   └── requirements.txt
└── /frontend                   # React App
    ├── Dockerfile              # THE FIX (Multi-stage build)
    ├── .dockerignore
    ├── nginx.conf              # Nginx config for React
    ├── package.json
    ├── vite.config.js
    └── /src
        ├── App.jsx             # Main UI Logic
        └── Canvas.jsx          # Drawing Component
```