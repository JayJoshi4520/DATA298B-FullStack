# Project Requirements Analysis

## 📋 Project Overview
The user is experiencing a critical stability issue in the `/mnist_digit_classifier` project. Specifically, the **backend Docker container terminates unexpectedly ("crashes") during the model training phase**. This behavior is symptomatic of resource exhaustion (Out of Memory - OOM), insufficient shared memory, or unhandled runtime exceptions.

The objective is to diagnose the crash, optimize the container/code configuration to handle the training workload, and ensure the model can be trained successfully within the containerized environment.

## 🎯 Core Requirements

### 1. Infrastructure Stability (Docker Configuration)
*   **Prevent OOM Kills:** The container configuration must be updated to allow for higher memory usage or swap space usage to prevent the Linux OOM killer from terminating the process.
*   **Shared Memory Increase:** ML frameworks (PyTorch/TensorFlow) often require more shared memory than the Docker default (64MB). This must be increased (e.g., to 2GB or via `--shm-size`).
*   **Restart Policy:** Implement a restart policy for transient failures, though the primary goal is to prevent the crash itself.

### 2. Data Persistence
*   **Volume Mapping:** Ensure that training checkpoints and the final saved model are written to a mounted volume (Host machine directory), not just the container's ephemeral file system. If the container crashes, progress must not be lost.

### 3. Application Optimization (Python/ML Code)
*   **Batch Processing:** The training script must utilize data generators or batching (e.g., `batch_size`) rather than loading the entire dataset into RAM at once.
*   **Checkpointing:** Implement `ModelCheckpoint` callbacks to save weights after every epoch.
*   **Exception Handling:** Wrap the training loop in `try-except` blocks to catch and log specific Python errors before the container exits.

### 4. Observability
*   **Verbose Logging:** The application must output training progress and resource usage to `stdout`/`stderr` so it can be viewed via `docker logs`.

## 🛠️ Technical Stack
*   **Container Runtime:** Docker / Docker Compose.
*   **Language:** Python 3.9+ (Standard for ML).
*   **ML Framework:** (Assumed TensorFlow/Keras or PyTorch based on "MNIST" context).
*   **OS:** Linux (Alpine or Slim Debian/Ubuntu images).

## 📐 Architecture

### Docker Compose Configuration
The solution relies heavily on infrastructure configuration changes:

```yaml
services:
  backend:
    build: .
    # Key Requirement: Resource Limits & Reservations
    deploy:
      resources:
        limits:
          memory: 4G  # Example limit
    # Key Requirement: Shared Memory for ML Data Loaders
    shm_size: '2gb' 
    # Key Requirement: Persistence
    volumes:
      - ./models:/app/models
      - ./data:/app/data
```

### Code Pattern
*   **Input:** MNIST Dataset (Download or Load from disk).
*   **Process:** Data Generator -> Model.fit() (with batching) -> Validation.
*   **Output:** Serialized Model File (`.h5`, `.pt`, or `.onnx`) stored in `/app/models`.

## ✅ Success Criteria
1.  **Stability:** The user can run the training command, and the container remains `Up` throughout the entire epoch cycle.
2.  **Completion:** The training process reaches 100% completion without Exit Code 137 (OOM) or Exit Code 1 (Error).
3.  **Artifact Generation:** A trained model file appears in the project's local directory after the process finishes.
4.  **Reproducibility:** The fix works across restarts of the container.

## ⚠️ Risks & Considerations
*   **Host Hardware Limits:** If the host machine running Docker does not have enough physical RAM to support the training even with optimizations, the training will inevitably fail.
*   **Image Bloat:** Installing heavy ML libraries can create large Docker images. Use "slim" variants where possible.
*   **GPU vs CPU:** If the code expects a GPU (CUDA) but the container is running on CPU-only mode without proper fallback, it may crash. The solution should default to CPU compatibility for broad usage unless GPU is specified.

## 📦 Deliverables

1.  **`Dockerfile`**: (Refined) Optimized for size and caching dependencies.
2.  **`docker-compose.yml`**: (Updated) With increased `shm_size`, memory limits, and volume mounts.
3.  **`requirements.txt`**: Ensure explicit versions for stability.
4.  **`train.py`** (or equivalent): Updated with:
    *   Batch size handling.
    *   Model Checkpointing callbacks.
    *   Proper logging setup.