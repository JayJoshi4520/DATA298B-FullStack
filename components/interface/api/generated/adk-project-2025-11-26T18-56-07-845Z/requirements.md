# Project Requirements Analysis

## 📋 Project Overview
The user has an existing full-stack application (Frontend + Backend + ML Model) that is currently failing to start. The primary failure point appears to be a dependency on a pre-trained model file during the backend startup process.

**The Goal:** Refactor the backend to handle a "missing model" state gracefully, expose an API endpoint to trigger training on-demand, and provide a unified startup script to run the full stack application.

## 🎯 Core Requirements

### 1. Backend Reliability (Fix Startup Crash)
*   **Lazy Loading/Conditional Loading:** The backend must **not** crash if the model file (e.g., `.pkl`, `.h5`) is missing upon server start.
*   **Global State Management:** The backend needs a mechanism to track if the model is `LOADED`, `NOT_TRAINED`, or `TRAINING`.
*   **Prediction Guard:** The prediction endpoint must check if the model is loaded before attempting inference, returning a generic `400` or `503` error with a message "Model not trained" if it is missing.

### 2. Backend API Enhancements
*   **Training Endpoint:** A `POST /train` endpoint that:
    *   Triggers the model training function.
    *   Saves the model artifact to disk.
    *   Loads the model into memory.
    *   Returns success status.
*   **Health/Status Endpoint:** A `GET /health` or `GET /status` endpoint that returns:
    *   Server status (Up).
    *   Model status (Trained/Not Trained).

### 3. Frontend Integration
*   **Status Check:** On load, the Frontend must check the Backend status.
*   **Conditional UI:**
    *   If Model is **Ready**: Show the Prediction Form.
    *   If Model is **Missing**: Show a "Train Model" button.
    *   If Model is **Training**: Show a loading spinner/progress indicator.
*   **Action:** Wiring the "Train Model" button to the `POST /train` endpoint.

### 4. Full Stack Orchestration
*   **Unified Startup:** A single command or script to launch both the Frontend (e.g., React/Vue) and Backend (Python) simultaneously.
*   **CORS Configuration:** Ensure the Backend allows requests from the Frontend's local port (e.g., localhost:3000).

## 🛠️ Technical Stack (Assumed/Recommended)

*   **Backend:** Python (FastAPI or Flask).
    *   *Reason:* Standard for ML integration. FastAPI is preferred for async handling of training tasks, but Flask is acceptable.
*   **Frontend:** React.js (or existing framework).
    *   *Reason:* Reactive state management is needed to switch between "Train" and "Predict" views.
*   **ML Library:** Scikit-Learn (Generic implementation).
    *   *Reason:* Standard pickle serialization.
*   **Orchestration:** Node.js `concurrently` or a shell script.
    *   *Reason:* Allows running two servers in one terminal.

## 📐 Architecture & Logic Flow

**Current (Broken):**
`Start Server` -> `Load Model` -> `CRASH (File missing)`

**Target (Fixed):**
1.  `Start Server` -> `Check Model File`
2.  If `File Exists` -> `Load Model` -> `State = READY`
3.  If `File Missing` -> `Log Warning` -> `State = NOT_TRAINED` -> `Server Starts Successfully`
4.  User clicks "Train" on FE -> `POST /train`
5.  Backend trains -> Saves File -> Loads Model -> `State = READY`

## ✅ Success Criteria
1.  **Zero-Config Startup:** The application starts successfully even if the `model.pkl` file has been deleted.
2.  **Feedback Loop:** The UI clearly communicates whether the model needs training.
3.  **Functional Flow:** User can click "Train", wait for completion, and immediately run a prediction without restarting the server.
4.  **Connectivity:** Frontend and Backend communicate without CORS errors.

## ⚠️ Risks & Considerations
*   **Training Time:** If training takes a long time, the HTTP request might time out. *Mitigation:* For this MVP, we will assume training is quick/synchronous. For complex models, a background task queue (Celery) would be needed (Out of scope for now).
*   **Concurrency:** If two users hit "Train" simultaneously. *Mitigation:* Add a simple `is_training` flag in the backend global state.

## 📦 Deliverables

The output must include:
1.  **`backend/app.py` (or `main.py`):** Refactored API code with try/except blocks around model loading and new training endpoints.
2.  **`backend/model.py`:** A dummy or real training function that saves a file.
3.  **`frontend/src/App.js`:** React code handling the conditional rendering (Train vs Predict).
4.  **`package.json` (Root):** Configuration to install `concurrently` and run both servers.