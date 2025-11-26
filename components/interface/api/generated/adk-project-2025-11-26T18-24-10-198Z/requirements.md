# Project Requirements Analysis

## 📋 Project Overview
The client requires a full-stack Machine Learning application named `mnist_digit_classifier`. The system serves as a demonstration of an end-to-end ML pipeline, allowing users to draw a digit (0-9) in a web interface and receive a real-time classification from a neural network backend trained on the MNIST dataset. The application must be containerized and optimized for local development on a CPU-only environment.

## 🎯 Core Requirements

### 1. Backend (Python/FastAPI)
*   **Machine Learning Model:**
    *   Implement a lightweight Neural Network (MLP or simple CNN) using PyTorch.
    *   The model must be trainable from scratch.
    *   The model structure must be defined in `model.py`.
*   **Training Pipeline:**
    *   Automated download of MNIST dataset via `torchvision`.
    *   Training logic located in `train.py`.
    *   Persistence: Save the trained weights to `model.pth`.
*   **API Interface (`main.py`):**
    *   **POST /predict:** Accept Base64 encoded PNG string, preprocess the image (resize/grayscale), and return the predicted integer.
    *   **GET /train:** Trigger the training process programmatically.
    *   **CORS:** Middleware configuration to allow requests from the frontend (Port 4000).
*   **Dependencies:** `fastapi`, `uvicorn`, `torch`, `torchvision`, `pillow`, `numpy`.

### 2. Frontend (React)
*   **User Interface:**
    *   Canvas area for drawing digits (using `react-canvas-draw`).
    *   "Clear" and "Predict" controls.
    *   Display area for the prediction result.
    *   Clean, minimal styling (`App.css`).
*   **Logic:**
    *   Capture canvas state as Base64 image.
    *   Asynchronous communication with the backend (`axios`).
    *   Error handling for network failures.
*   **Configuration:**
    *   Host port set to **4000** (overriding standard defaults).

### 3. DevOps & Environment
*   **Containerization:** `docker-compose.yml` to orchestrate both services.
*   **Execution:** optimized for CPU-only architecture (MacBook Air compatible).
*   **Version Control:** Proper `.gitignore` for Python and Node artifacts.

## 🛠️ Technical Stack
*   **Backend:** Python 3.9+, FastAPI (High performance API), PyTorch (ML Framework), Pillow (Image processing).
*   **Frontend:** React 18+, Axios (HTTP Client), React-Canvas-Draw (Drawing utility).
*   **Infrastructure:** Docker, Docker Compose.

## 📐 Architecture & Data Flow
1.  **User Action:** User draws on React Frontend (Port 4000).
2.  **Request:** React converts canvas to Base64 -> POST to `http://localhost:8000/predict`.
3.  **Preprocessing (Critical):** Backend receives Base64 -> Decodes -> Converts to Grayscale -> Resizes to 28x28 -> Normalizes (To match MNIST format).
4.  **Inference:** PyTorch model processes tensor -> Returns class with highest probability.
5.  **Response:** Backend returns JSON `{ "digit": 7 }` -> Frontend displays result.

## ✅ Success Criteria
1.  **Run:** `docker-compose up` builds and starts both containers without errors.
2.  **Access:** Frontend is accessible at `http://localhost:4000`, Backend docs at `http://localhost:8000/docs`.
3.  **Training:** Hitting `GET /train` (or running the script) successfully downloads MNIST and creates `model.pth`.
4.  **Prediction:** Drawing a digit on the frontend results in the correct number being displayed roughly 80-90% of the time (allowing for the simplicity of the model).

## ⚠️ Risks & Considerations
*   **Image Format Mismatch:** The biggest technical risk is the discrepancy between the HTML5 Canvas (often high-res, RGBA, black on white) and MNIST data (28x28, 1-channel, white on black). The backend **must** handle inversion and resizing robustly.
*   **Model Existence:** The API must handle cases where `/predict` is called before `model.pth` exists (e.g., return a generic error or auto-trigger training).
*   **Port Mapping:** React defaults to port 3000 inside the container. Docker Compose must map Host:4000 to Container:3000.

## 📦 Deliverables Structure

```text
mnist_digit_classifier/
├── docker-compose.yml          # Maps Frontend:4000, Backend:8000
├── .gitignore
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── model.py                # PyTorch Network Class
│   ├── train.py                # Training script
│   ├── requirements.txt
│   ├── README.md
│   └── Dockerfile
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html          # Title: "MNIST Classifier"
    ├── src/
    │   ├── App.js              # Canvas & Logic
    │   ├── App.css
    │   └── index.js
    ├── README.md
    └── Dockerfile
```