import json
import os
import sys

def prepare():
    print("Preparing dummy dataset...")
    
    try:
        # Small synthetic dataset for demonstration
        data = [
            {"text": "I love this movie it is great", "label": 1},
            {"text": "absolutely fantastic result", "label": 1},
            {"text": "what a wonderful day", "label": 1},
            {"text": "I like this very much", "label": 1},
            {"text": "this is terrible and bad", "label": 0},
            {"text": "I hate this waste of time", "label": 0},
            {"text": "awful experience never again", "label": 0},
            {"text": "disgusting food and service", "label": 0}
        ]
        
        # 1. Build Vocabulary
        vocab = {"<PAD>": 0, "<UNK>": 1}
        for item in data:
            tokens = item["text"].lower().split()
            for token in tokens:
                if token not in vocab:
                    vocab[token] = len(vocab)
                    
        print(f"Vocabulary size: {len(vocab)}")
        
        # 2. Save Data and Vocab
        with open('dataset.json', 'w') as f:
            json.dump(data, f)
            
        with open('vocab.json', 'w') as f:
            json.dump(vocab, f)
            
        print("✓ Data preparation complete. Saved dataset.json and vocab.json")
        
    except Exception as e:
        print(f"✗ Error during data preparation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    prepare()