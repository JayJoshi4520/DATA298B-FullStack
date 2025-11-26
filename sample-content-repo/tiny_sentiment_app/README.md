# Tiny Sentiment App

A simple sentiment analysis application powered by PyTorch (Backend) and React (Frontend).

## Architecture
- **Backend**: Flask + PyTorch (Simple EmbeddingBag Model)
- **Frontend**: React + Vite + TailwindCSS
- **Infrastructure**: Docker Compose

## Fixes Applied
- **Orchestration**: Removed volume mount for backend to ensure trained model persistence.
- **Training**: Corrected PyTorch `CrossEntropyLoss` tensor shapes.

## Quick Start

1. **Build and Run:**
   ```bash
   docker compose up --build
   ```

2. **Access:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000/health](http://localhost:5000/health)

3. **Usage:**
   - Open localhost:3000
   - Type "I love this so much" -> Click Analyze -> Result: Positive
   - Type "I hate this terrible thing" -> Click Analyze -> Result: Negative