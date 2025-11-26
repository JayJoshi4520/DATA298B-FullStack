from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import json
import os
from model import SentimentModel

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Global variables
model = None
vocab = None
device = torch.device("cpu")

def load_resources():
    global model, vocab
    print("Loading model and vocabulary...")
    
    try:
        vocab_path = 'vocab.json'
        model_path = 'model.pth'

        if not os.path.exists(vocab_path) or not os.path.exists(model_path):
            print("✗ Resources missing! Is the container built correctly?")
            return

        with open(vocab_path, 'r') as f:
            vocab = json.load(f)
            
        model = SentimentModel(len(vocab), 64, 2)
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.eval()
        print("✓ Model loaded successfully")
    except Exception as e:
        print(f"✗ Error loading resources: {e}")

@app.route('/health', methods=['GET'])
def health():
    if model is None:
        return jsonify({"status": "unhealthy", "reason": "Model not loaded"}), 503
    return jsonify({"status": "healthy"})

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not vocab:
        return jsonify({"error": "Model not initialized"}), 500
        
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
            
        # Preprocess
        tokens = [vocab.get(w, vocab.get("<UNK>")) for w in text.lower().split()]
        
        if not tokens:
            return jsonify({"sentiment": "unknown", "confidence": 0.0})
            
        text_tensor = torch.tensor(tokens, dtype=torch.long).to(device)
        offsets = torch.tensor([0], dtype=torch.long).to(device)
        
        with torch.no_grad():
            output = model(text_tensor, offsets)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            
            # Get class with highest probability
            confidence, predicted_class = torch.max(probabilities, 1)
            
            sentiment = "Positive" if predicted_class.item() == 1 else "Negative"
            conf_score = confidence.item()
            
        return jsonify({
            "text": text,
            "sentiment": sentiment,
            "confidence": round(conf_score, 4)
        })
    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": "Prediction failed"}), 500

if __name__ == '__main__':
    load_resources()
    app.run(host='0.0.0.0', port=5000)