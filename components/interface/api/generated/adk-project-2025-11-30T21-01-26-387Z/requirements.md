# Project Requirements Analysis

## 📋 Project Overview
The project, `tiny_sentiment_app`, is a minimal viable product (MVP) demonstrating a full-stack Machine Learning application. It consists of a Vue.js frontend for user interaction and a Python-based backend (Flask + PyTorch) that handles data processing, model training, and inference. The goal is to provide a working architectural skeleton where a user can train a simple neural network on a tiny dataset and perform real-time sentiment analysis.

## 🎯 Core Requirements

### Backend (Python/Flask/PyTorch)
1.  **Data Preparation (`prepare_data.py`):**
    *   Must generate or load a tiny dataset (approx. 20-50 samples) to ensure training is instant (<10s).
    *   Must handle text preprocessing: simple tokenization and vocabulary building.
2.  **Model Architecture (`model.py`):**
    *   A simple Feedforward Neural Network (Bag-of-Words approach) is recommended over LSTM for this specific "tiny" constraint to ensure speed and simplicity without complex padding/embedding layers.
3.  **Training (`train.py`):**
    *   Script to train the model on CPU.
    *   Must save model artifacts (weights `model.pth` and vocabulary `vocab.json`) for the API to use.
4.  **API (`app.py`):**
    *   `POST /train`: Triggers the training script programmatically.
    *   `POST /predict`: Accepts JSON text input, vectorizes it using the saved vocabulary, runs inference, and returns sentiment (Positive/Negative).
    *   **CORS Support:** Must handle Cross-Origin Resource Sharing to allow the Vue frontend to communicate with the Flask backend.

### Frontend (Vue.js)
1.  **User Interface:**
    *   A clean interface with a text input field.
    *   A "Analyze Sentiment" button.
    *   A "Retrain Model" button (optional but good for testing the `/train` endpoint).
    *   A results display area showing the predicted label.
2.  **Logic:**
    *   Use `axios` to communicate with the backend API.
    *   Handle loading states and basic error display.

### Infrastructure
1.  **Containerization:**
    *   `docker-compose.yml` to orchestrate both services simultaneously.
    *   Network configuration to allow frontend-to-backend communication.

## 🛠️ Technical Stack

*   **Backend Language:** Python 3.9+
*   **ML Framework:** PyTorch (CPU version) - chosen for dynamic graph capabilities and ease of debugging.
*   **Web Framework:** Flask - chosen for lightweight setup compared to Django.
*   **Data Processing:** Pandas (CSV handling), Numpy.
*   **Frontend Framework:** Vue.js 3 - chosen for its reactive data binding and component-based structure.
*   **HTTP Client:** Axios.

## 📐 Architecture

**Pattern:** Client-Server / REST API

1.  **Data Layer:** A simple CSV file (`dataset.csv`) generated locally.
2.  **Processing Layer:** 
    *   **Training:** Raw Text -> Tokenization -> Bag of Words Vector -> Neural Net -> Backpropagation -> Save State.
    *   **Inference:** Raw Text -> Tokenization -> Bag of Words Vector -> Neural Net (Loaded State) -> Prediction.
3.  **Presentation Layer:** Vue.js Single Page Application (SPA).

## ✅ Success Criteria

1.  **Performance:** Model training completes in under 10 seconds.
2.  **Functionality:**
    *   Inputting "This movie is great" results in a "Positive" prediction.
    *   Inputting "I hate this terrible film" results in a "Negative" prediction.
3.  **Deployment:** `docker-compose up` successfully builds and starts both containers without manual intervention.

## ⚠️ Risks & Considerations

1.  **CORS Issues:** The most common failure point in separated frontend/backend setups. `flask-cors` must be included in `requirements.txt` and configured in `app.py`.
2.  **Model/Vocab Persistence:** The API needs to handle cases where the model hasn't been trained yet (files missing). The application should ideally train on startup or fail gracefully.
3.  **Dataset Size:** Since the dataset is "tiny" (synthetic), the model will be overfitted. It will only recognize words present in the training set. This is acceptable for a tech demo but not for real-world usage.

## 📦 Deliverables Structure

The following file structure will be generated:

```text
tiny_sentiment_app/
├── backend/
│   ├── prepare_data.py    # Generates dummy CSV & builds vocab
│   ├── model.py           # PyTorch NN Module definition
│   ├── train.py           # Training loop logic
│   ├── app.py             # Flask API endpoints
│   ├── requirements.txt   # Python dependencies
│   └── README.md          # Backend specific docs
├── frontend/
│   ├── public/            # Static files
│   ├── src/
│   │   ├── App.vue        # Main UI component
│   │   ├── main.js        # Vue entry point
│   ├── package.json       # Node dependencies
│   ├── vue.config.js      # (Optional) Vue config
│   └── README.md          # Frontend specific docs
├── .gitignore
└── docker-compose.yml     # Orchestration
```