# Project Requirements Analysis: Tiny Sentiment App Repair

## 📋 Project Overview
The goal is to repair and finalize a "Tiny Sentiment Analysis" application. The current build fails during the Docker image creation process due to a PyTorch tensor shape mismatch (`RuntimeError`) in the training script.

The objective is to deliver a fully functional, containerized web application where a user can input text and receive a "Positive" or "Negative" sentiment classification.

## 🎯 Core Requirements

### 1. Backend Repair (Priority: High)
*   **Fix Training Logic (`train.py`):** Resolve the `RuntimeError: Expected target size [1, 2], got [1]`.
    *   Ensure the model output (logits) has the shape `(Batch_Size, Num_Classes)`.
    *   Ensure the target labels have the shape `(Batch_Size)` and are of type `LongTensor` (int64) for `CrossEntropyLoss`.
    *   Remove manual dimension hacking (like `unsqueeze`) that is causing the mismatch.
*   **Data Preparation:** Ensure `prepare_data.py` generates a vocabulary and saves it to disk so the inference engine can tokenize new input consistently.
*   **API Endpoint:** A Flask (or FastAPI) application serving:
    *   `POST /predict`: Accepts JSON `{ "text": "..." }`, runs the saved model, and returns `{ "sentiment": "positive", "confidence": 0.95 }`.
*   **Model Persistence:** The training script must save the trained state dictionary (`model.pth`) and vocabulary (`vocab.json`) to be loaded by the main application.

### 2. Frontend Integration
*   **UI:** A simple web interface (served via Node/React/static files).
*   **Interaction:** An input box for text and a "Analyze" button.
*   **Connection:** The frontend must successfully proxy or call the backend API endpoint (`http://backend:5000/predict`).

### 3. DevOps & Containerization
*   **Docker Build Fix:** Ensure `train.py` runs successfully during the build process (or moves to a startup script if build-time training is too flaky).
*   **Dependencies:** Pin Python dependencies (Flask, Torch, Numpy) in `requirements.txt` to compatible versions.
*   **Orchestration:** A `docker-compose.yml` that networks the frontend and backend together.

## 🛠️ Technical Stack

*   **Backend:** Python 3.10 (Slim image)
    *   **Framework:** Flask (Lightweight, sufficient for a tiny app).
    *   **ML Library:** PyTorch (Standard, implied by logs).
    *   **Architecture:** Simple Feed-Forward Network (Bag of Words) or EmbeddingBag. Keep it lightweight to ensure the build finishes in seconds.
*   **Frontend:** Node.js 18 (Alpine image) / React (implied by `package.json` in logs).
*   **Container Runtime:** Docker & Docker Compose.

## 📐 Architecture

### Data Flow
1.  **Build Phase:** `prepare_data.py` creates dummy data -> `train.py` trains model -> saves `model.pth`.
2.  **Runtime:** User types text -> Frontend sends POST -> Backend loads `model.pth` -> Predicts -> Returns JSON.

### File Structure
```text
tiny_sentiment_app/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app.py           # The API Server
│   ├── model.py         # Neural Net Class Definition
│   ├── train.py         # Training Script (The source of the error)
│   └── prepare_data.py  # Data generation
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/             # React source code
```

## ✅ Success Criteria
1.  **Build Success:** `docker compose up --build` completes without exit code 1.
2.  **API Functionality:** Sending a curl request to the backend returns a valid JSON response.
3.  **End-to-End Test:** Opening `localhost:3000` (or configured port), typing "I love this", and clicking analyze results in a "Positive" label displayed on screen.

## ⚠️ Risks & Considerations
*   **Memory Usage:** Training inside a Docker build (`RUN python train.py`) increases image size and build time. *Mitigation:* We will keep the dataset "tiny" and the model simple (linear layer) to keep the build under 1 minute.
*   **Tensor Shapes:** PyTorch `CrossEntropyLoss` is strict. *Mitigation:* Explicitly verify tensor shapes in the revised `train.py`.
*   **CORS:** Browser may block frontend-to-backend requests. *Mitigation:* Configure Flask-CORS in the backend.

## 📦 Deliverables
The following corrected files will be generated:
1.  `backend/requirements.txt`
2.  `backend/model.py` (Defines the PyTorch model)
3.  `backend/train.py` (Revised training loop)
4.  `backend/app.py` (Flask API)
5.  `backend/Dockerfile`
6.  `docker-compose.yml`