# Project Requirements Analysis

## 📋 Project Overview
The **Tiny Sentiment App** is a containerized web application consisting of a React-based frontend and a Python/PyTorch backend. The current build process is failing during the backend image construction due to a PyTorch Runtime Error (`matmul primitive`) specifically related to CPU architecture compatibility (likely running on Apple Silicon/ARM64 via Docker).

The objective is to resolve the build failures, modernize the Docker configuration, and deliver a stable, working application that performs sentiment analysis.

## 🎯 Core Requirements

### 1. Backend Remediation (Critical Path)
*   **Fix PyTorch Build Error:** Resolve the `RuntimeError: could not create a primitive descriptor for a matmul primitive`. This indicates an incompatibility between the PyTorch version, the underlying math library (oneDNN/MKL), and the Docker container's CPU architecture (likely utilizing Rosetta/QEMU on macOS).
*   **Dependency Management:** Update `requirements.txt` to ensure a stable, CPU-optimized version of PyTorch is installed that works reliably in a Linux Docker environment.
*   **Training Pipeline:** Ensure `prepare_data.py` and `train.py` run successfully during the build phase (or move to entrypoint if build-time execution remains unstable).

### 2. Infrastructure & Configuration
*   **Docker Compose Modernization:** Remove the obsolete `version` attribute from `docker-compose.yml` to resolve the warning.
*   **Platform Standardization:** Explicitly define the Docker platform (e.g., `linux/amd64` or `linux/arm64`) to ensure consistent behavior across different host machines (Windows/Mac/Linux).

### 3. Application Functionality
*   **API Availability:** The backend must successfully start an HTTP server (Flask/FastAPI) after the model is trained.
*   **Frontend Integration:** The frontend must build successfully and be able to communicate with the backend to send text and receive sentiment predictions.

## 🛠️ Technical Stack

*   **Backend:**
    *   **Base Image:** `python:3.10-slim` (Lightweight, sufficient for this scope).
    *   **ML Framework:** `torch` (PyTorch). *Constraint:* Must use a version compatible with Docker CPU execution.
    *   **Web Framework:** Flask (inferred from standard simple Python web apps).
*   **Frontend:**
    *   **Base Image:** `node:18-alpine`.
    *   **Framework:** React (implied).
*   **Containerization:**
    *   **Docker Compose:** Orchestration of the two services.

## 📐 Architecture & Fix Strategy

### High-Level Design
Two containers running in the same Docker network:
1.  **Backend:** Trains a simple model on startup (or build), exposes an API endpoint (e.g., `/predict`).
2.  **Frontend:** Serves static files or runs a dev server, proxies API requests to the Backend.

### Specific Technical Fixes Required
1.  **PyTorch Configuration:** The specific error is often caused by OneDNN optimizations on emulated hardware.
    *   *Solution A:* Force `requirements.txt` to use a specific CPU-only wheel for Linux.
    *   *Solution B:* Disable MKLDNN in the `Dockerfile` via environment variable: `ENV TORCH_SHOW_CPP_STACKTRACES=1` and potentially `ENV MKLDNN_VERBOSE=0` (though the fix usually involves architecture definition).
2.  **Docker Platform:** Modify `docker-compose.yml` to set `platform: linux/amd64` to ensure the `matmul` operations behave predictably if the host is ARM-based (Mac M1/M2), OR use a native ARM builds if available.

## ✅ Success Criteria

1.  **Build Success:** Command `docker compose up --build` completes without exit code 1.
2.  **Warning Free:** No "version is obsolete" warnings in the Docker log.
3.  **Model Availability:** The container logs show "Training complete" and "Server starting".
4.  **Functional App:** A user can input text (e.g., "I love this!") and receive a Positive sentiment classification.

## ⚠️ Risks & Considerations

*   **Performance:** running `linux/amd64` containers on Apple Silicon involves emulation (Rosetta 2). It is slower but more compatible for PyTorch builds involving complex math libraries.
*   **Build Time:** Training during the `RUN` instruction (Docker build time) increases image size and build duration. If the model grows, training should be moved to the `CMD` or `ENTRYPOINT` (runtime). For a "tiny" app, build-time training is acceptable but risky if data changes.

## 📦 Deliverables

The following files need to be updated/created:
1.  `backend/Dockerfile` (Updated env vars and installation steps).
2.  `backend/requirements.txt` (Pinned versions).
3.  `docker-compose.yml` (Fixed versioning and platform definition).
4.  `backend/train.py` (Ensure robustness).