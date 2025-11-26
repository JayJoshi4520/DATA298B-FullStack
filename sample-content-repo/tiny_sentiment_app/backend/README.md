# Sentiment Backend

Flask API utilizing a PyTorch EmbeddingBag model.

## Endpoints
- POST `/predict`: `{"text": "some sentence"}`
- POST `/train`: Triggers retraining on `tiny_data.csv`.

## Setup
Runs automatically via Docker Compose on port 8000.