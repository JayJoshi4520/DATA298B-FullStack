# Project Requirements Analysis

## 📋 Project Overview
The goal is to build **`tiny_sentiment_app`**, a lightweight full-stack machine learning application. The system will allow users to input text via a web interface, which is sent to a Python backend. The backend will process the text using a custom-trained PyTorch neural network (trained from scratch on a tiny dataset) and return a sentiment classification (Positive/Negative).

## 🎯 Core Requirements

### 1. Backend Service (API & ML)
*   **Framework:** Flask.
*   **Port:** **8000** (Strict requirement).
*   **ML Engine:** PyTorch (CPU-based).
*   **Data Handling:**
    *   Must generate or read a "tiny" dataset (CSV format).
    *   Preprocessing pipeline to convert text to numerical tensors (Bag-of-Words approach recommended for speed).
*   **Functionality:**
    *   **Training:** Ability to train a simple classifier in <10 seconds.
    *   **Inference:** Endpoint to predict sentiment of new sentences.
    *   **Persistence:** Save trained model weights and vocabulary mappings to disk to support inference after server restart.
*   **Endpoints:**
    *   `POST /predict`: Accepts JSON `{text: string}`, returns `{sentiment: string}`.
    *   `POST /train`: Triggers the training pipeline and returns success status/metrics.

### 2. Frontend Service (UI)
*   **Framework:** Vue.js.
*   **Port:** **4000** (Strict requirement).
*   **Features:**
    *   Simple input field for user text.
    *   "Predict" button calling the API.
    *   (Optional but recommended) "Retrain" button to trigger the backend training.
    *   Display area for the result (e.g., "Positive" in Green, "Negative" in Red).

### 3. Infrastructure & Configuration
*   **Docker:** Containerization of both services via `docker-compose.yml`.
*   **Networking:** Ensure Frontend can talk to Backend (handling CORS).

## 🛠️ Technical Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Language** | Python 3.9+ | Standard for ML workloads. |
| **API** | Flask | Lightweight, fast to set up for simple APIs. |
| **ML Lib** | PyTorch | Requested library; flexible for custom NN architecture. |
| **Data Libs** | Pandas, Numpy | Efficient CSV handling and array manipulation. |
| **Frontend** | Vue.js (Vue 3) | Reactive UI, easy to integrate with Axios. |
| **HTTP Client** | Axios | Standard library for making HTTP requests from Vue. |
| **Container** | Docker | Ensures consistent environment across machines. |

## 📐 Architecture & Data Flow

1.  **Initialization:**
    *   `prepare_data.py` creates/loads a dummy CSV (e.g., 20-50 rows of data).
    *   `train.py` builds a Vocabulary, transforms data to Bags-of-Words vectors, trains a simple Neural Network, and saves artifacts (`model.pth`, `vocab.json`).
2.  **Inference Flow:**
    *   User types "I love this app" in Vue UI -> Click "Predict".
    *   Vue sends `POST http://localhost:8000/predict`.
    *   Flask loads the saved Model and Vocab.
    *   Text is tokenized -> Model Inference -> Softmax/Sigmoid.
    *   Returns `"Positive"`.
    *   Vue updates the DOM.

## ✅ Success Criteria
1.  **Deployment:** Running `docker-compose up` builds and starts both containers successfully.
2.  **Access:** Frontend loads at `http://localhost:4000`.
3.  **Performance:** Training the model takes **less than 10 seconds** on a standard CPU.
4.  **Functionality:**
    *   Entering "The movie was terrible" returns a "Negative" prediction.
    *   Entering "The movie was great" returns a "Positive" prediction.
5.  **Integration:** No CORS errors in the browser console.

## ⚠️ Risks & Considerations
*   **CORS:** Since the frontend (4000) and backend (8000) differ, `flask-cors` must be implemented in the backend.
*   **Tokenizer Consistency:** The exact same vocabulary mapping used during training must be used during prediction. If the model is retrained, the `app.py` context must reload the new artifacts.
*   **Data Availability:** To ensure the app runs out-of-the-box, we should generate a synthetic "tiny IMDB" CSV within `prepare_data.py` if the file doesn't exist, rather than relying on an external download.
*   **Docker Build Time:** PyTorch is a large dependency. We should try to use a slim Python image or keep the requirements minimal to avoid long download times.

## 📦 Deliverables Structure

```text
tiny_sentiment_app/
├── .gitignore               # Python/Node ignores
├── docker-compose.yml       # Orchestrates app (4000) and api (8000)
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt     # flask, flask-cors, torch, pandas, numpy
│   ├── prepare_data.py      # Generates dummy data.csv & helps loading
│   ├── model.py             # PyTorch nn.Module (Simple BoW Classifier)
│   ├── train.py             # Training loop, saves model.pth & vocab
│   ├── app.py               # Flask endpoints /predict & /train
│   └── README.md
└── frontend/
    ├── Dockerfile           # Node environment
    ├── package.json         # Vue, Vite/CLI, Axios
    ├── vite.config.js       # (Optional) Config to force port 4000
    ├── README.md
    └── src/
        ├── main.js
        └── App.vue          # Main UI Logic
```