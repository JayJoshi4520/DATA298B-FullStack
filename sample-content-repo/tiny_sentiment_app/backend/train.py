import torch
import torch.nn as nn
import torch.optim as optim
import json
import os
import sys
from model import SentimentModel

def train_model():
    print("Starting training process...")
    
    # 1. Check Data Availability
    if not os.path.exists('vocab.json') or not os.path.exists('dataset.json'):
        print("✗ Data not found. Please run prepare_data.py first.")
        sys.exit(1)

    try:
        # 2. Load Data
        with open('vocab.json', 'r') as f:
            vocab = json.load(f)
        with open('dataset.json', 'r') as f:
            data = json.load(f)

        # 3. Hyperparameters
        EMBED_DIM = 64
        NUM_CLASSES = 2  # 0: Negative, 1: Positive
        LEARNING_RATE = 0.1
        EPOCHS = 20

        # 4. Initialize Model
        device = torch.device("cpu")
        model = SentimentModel(len(vocab), EMBED_DIM, NUM_CLASSES).to(device)
        
        # CrossEntropyLoss requires:
        # Input: (N, C) -> Unnormalized logits
        # Target: (N) -> Class indices (LongTensor)
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.SGD(model.parameters(), lr=LEARNING_RATE)
        
        model.train()
        
        # 5. Training Loop
        print(f"Training on {len(data)} samples for {EPOCHS} epochs...")
        
        for epoch in range(EPOCHS):
            total_loss = 0
            
            for item in data:
                text = item['text']
                label = item['label']
                
                # Tokenize
                tokens = [vocab.get(w, vocab["<UNK>"]) for w in text.lower().split()]
                if not tokens:
                    continue
                    
                # Prepare Tensors for Batch Size = 1
                
                # Input Text: 1D Tensor of tokens
                text_tensor = torch.tensor(tokens, dtype=torch.long).to(device)
                
                # Offsets: 1D Tensor containing start index (0)
                offsets = torch.tensor([0], dtype=torch.long).to(device)
                
                # Label: 1D Tensor containing the single class index
                # Shape MUST be (1,), NOT (1, 1) or (1, 2)
                label_tensor = torch.tensor([label], dtype=torch.long).to(device)
                
                optimizer.zero_grad()
                
                # Forward pass
                # Output shape: [1, 2] (Batch Size, Num Classes)
                output = model(text_tensor, offsets) 
                
                # Validation of shapes (Debugging safeguard)
                if output.shape != (1, 2) or label_tensor.shape != (1,):
                     print(f"Shape Error: Output {output.shape}, Label {label_tensor.shape}")
                     continue

                # Loss calculation
                loss = criterion(output, label_tensor)
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
                
            if (epoch+1) % 5 == 0:
                print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {total_loss:.4f}")

        # 6. Save Model
        torch.save(model.state_dict(), "model.pth")
        print("✓ Model saved successfully to model.pth")
        
    except Exception as e:
        print(f"✗ Training Failed: {e}")
        # Re-raise to ensure Docker build fails if training fails
        raise e

if __name__ == "__main__":
    train_model()