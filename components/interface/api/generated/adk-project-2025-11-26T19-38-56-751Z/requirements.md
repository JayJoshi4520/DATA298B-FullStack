# Project Requirements Analysis

## 📋 Project Overview
The goal is to develop a lightweight, full-stack machine learning application named `mnist_digit_classifier`. This application demonstrates an end-to-end ML workflow where a Python backend trains a Neural Network on the MNIST dataset and serves predictions via an API, while a React frontend allows users to draw digits for real-time inference.

The application is specifically designed to be lightweight enough to run on a CPU-only environment (MacBook Air) and must adhere to specific port configurations.

## 🎯 Core Requirements

### Backend (FastAPI + PyTorch)
1.  **Model Architecture:** A lightweight Neural Network (2-layer MLP or simple CNN) optimized for CPU training.
2.  **Training Pipeline:** A script to download MNIST data (via `torchvision`), train the model from scratch, and save the weights (`model.pth`).
3.  **API Endpoints:**
    *   `GET /train`: Triggers the training process and saves the model.
    *   `POST /predict`: Accepts a Base64 encoded PNG image, preprocesses it to match MNIST format (28x28, grayscale, tensor), and returns the predicted integer.
4.  **CORS Support:** Must allow requests from the frontend origin (Port 4000).

### Frontend (React)
1.  **Canvas Interface:** Interactive drawing area using `react-canvas-draw`.
2.  **Interaction:**
    *   "Clear" button to reset the canvas.
    *   "Predict" button to capture the canvas state, convert to image, and send to the backend.
3.  **Display:** Show the prediction result returned by the API.
4.  **Configuration:** Must run on **Port 4000**.

### Infrastructure
1.  **Dockerization:** A `docker-compose.yml` file to orchestrate both services.
2.  **Constraint Enforcement:**
    *   **Frontend:** Host Port 4000.
    *   **Backend:** Host Port 8000.

## 🛠️ Technical Stack

*   **Backend:**
    *   **Language:** Python 3.9+
    *   **Framework:** FastAPI (High performance, easy async support).
    *   **ML Library:** PyTorch (Torch + Torchvision).
    *   **Image Processing:** Pillow (PIL) & Numpy (for converting Base64 to Tensors).
*   **Frontend:**
    *   **Framework:** React.js.
    *   **HTTP Client:** Axios.
    *   **Component:** `react-canvas-draw` (Simplifies drawing logic).
*   **Containerization:** Docker & Docker Compose.

## 📐 Architecture & Logic Flow

1.  **Initialization:**
    *   User starts app via Docker Compose.
    *   User hits `GET /train` (or backend checks for model existence on startup).
2.  **Prediction Flow:**
    *   **Frontend:** User draws digit -> clicks Predict -> Canvas exports Base64 PNG.
    *   **Network:** POST request sent to `http://localhost:8000/predict`.
    *   **Backend:**
        1.  Decodes Base64.
        2.  **Critical Step:** Resizes image to 28x28.
        3.  **Critical Step:** Converts to Grayscale (1 channel).
        4.  **Critical Step:** Inverts colors (Canvas is usually black on white; MNIST is white on black).
        5.  Normalizes pixel values (0-1).
        6.  Feeds to `model.pth`.
        7.  Returns `{ "digit": 7 }`.
    *   **Frontend:** Displays "7".

## ✅ Success Criteria
1.  **Runnable:** `docker-compose up` launches the app without crashing on a MacBook Air.
2.  **Connectivity:** Frontend (Port 4000) successfully communicates with Backend (Port 8000).
3.  **Functional ML:**
    *   The model trains successfully on CPU within a reasonable time (< 2-3 mins).
    *   The prediction logic correctly interprets a user-drawn digit (handling the resize/invert logic correctly).

## ⚠️ Risks & Considerations
1.  **Image Preprocessing Mismatch:** The most common failure point. The drawing canvas usually produces high-res, black-drawing-on-white-background images. MNIST is 28x28 low-res, white-digit-on-black-background. The backend **must** handle the inversion and resizing gracefully, or predictions will be random.
2.  **Port Conflicts:** The prompt explicitly overrides the standard React port (3000) with **4000**. Configuration in `package.json` or Docker mapping must reflect this strict requirement.
3.  **Synchronous Training:** If the training endpoint is synchronous, the HTTP request might timeout. Since the model is "very small," a synchronous call is acceptable for this MVP, but we should ensure the epoch count is low (e.g., 1-3 epochs) to keep it fast.

## 📦 Deliverables Structure

```text
mnist_digit_classifier/
├── docker-compose.yml          # Services: backend (8000), frontend (4000)
├── .gitignore
├── backend/
│   ├── main.py                 # FastAPI app, CORS, /predict, /train
│   ├── model.py                # PyTorch Network Class (Small CNN/MLP)
│   ├── train.py                # Training logic (Download MNIST, Train, Save)
│   ├── requirements.txt        # torch, torchvision, fastapi, uvicorn, pillow, numpy
│   └── README.md
└── frontend/
    ├── package.json            # Scripts: start on port 4000
    ├── public/
    │   └── index.html          # Title: MNIST Classifier
    ├── src/
    │   ├── App.js              # Canvas, Buttons, API Logic
    │   └── App.css             # Styling
    └── README.md
```