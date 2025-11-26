# Project Requirements Analysis

## 📋 Project Overview
The project is an existing **MNIST Digit Classifier** application utilizing a containerized architecture with a Python backend and a Node.js frontend. The current build process is failing due to deprecated system dependencies in the Python backend's Docker environment (specifically `libgl1-mesa-glx` on Debian Trixie/Bookworm). Additionally, the Docker Compose configuration uses obsolete syntax.

The objective is to remediate the build errors, modernize the Docker configuration, and ensure specific port bindings are enforced.

## 🎯 Core Requirements

### 1. Backend Remediation (Priority High)
*   **Fix Dependency Error:** Resolve the `E: Package 'libgl1-mesa-glx' has no installation candidate` error.
*   **Package Replacement:** Replace the obsolete `libgl1-mesa-glx` package with the modern `libgl1` package compatible with newer Debian releases (Bookworm/Trixie) used by the `python:3.9-slim` image.
*   **Dependency Management:** Ensure `libglib2.0-0` is retained as it is required for OpenCV/image processing tasks.

### 2. Docker Compose Configuration
*   **Version Attribute:** Remove the `version: '...'` attribute from `docker-compose.yml` as it is now obsolete in the Docker Compose specification.
*   **Port Enforcement:**
    *   **Frontend Service:** Must be mapped to Host Port **4000**.
    *   **Backend Service:** Must be mapped to Host Port **8000**.
*   **Build Context:** Ensure the build contexts correctly point to the respective directories (`./backend` and `./frontend` or equivalent).

### 3. Application Stability
*   **Image Pinning (Recommended):** To prevent future "surprise" breaking changes (like the underlying OS switching to Debian Trixie/Testing), the Python base image should ideally be pinned to a stable release (e.g., `python:3.9-slim-bookworm`) rather than just `python:3.9-slim`.

## 🛠️ Technical Stack

*   **Orchestration:** Docker Compose (V2)
*   **Backend:**
    *   **Language:** Python 3.9
    *   **OS:** Debian (via `python:3.9-slim`)
    *   **Key Libraries:** OpenCV (implied by `libgl1` requirement)
*   **Frontend:**
    *   **Runtime:** Node.js 18 (Alpine Linux variant)

## 📐 Architecture

The architecture remains a standard 2-tier containerized application:

1.  **Frontend Container (`frontend`):**
    *   Runs the UI (React/Vue/etc.).
    *   Exposes internal port (likely 3000 or 5173) mapped to Host **4000**.
2.  **Backend Container (`backend`):**
    *   Runs the API/Inference engine.
    *   Exposes internal port (likely 8000 or 5000) mapped to Host **8000**.
    *   Installs system-level graphics libraries for image processing.

## ✅ Success Criteria

1.  **Build Success:** Running `docker-compose up --build` completes without exit code 100.
2.  **Container Status:** Both `frontend` and `backend` containers reach "Running" state.
3.  **Port Accessibility:**
    *   `localhost:4000` loads the frontend application.
    *   `localhost:8000` is accessible (or responds to API health checks).
4.  **Clean Logs:** No warnings regarding the `version` attribute in Docker Compose.

## ⚠️ Risks & Considerations

*   **Cache:** Docker build cache might hold onto old intermediate layers. The solution implies using `--build`, but aggressive cache pruning (`docker builder prune`) might be needed if the error persists due to cached layer metadata.
*   **Internal Ports:** The requirement specifies Host ports (4000/8000). We must assume or identify the *internal* ports the apps are listening on (usually 3000 for Node and 8000/5000 for Python) to map them correctly. *Assumption: Backend listens on 8000 internally, Frontend on 3000 internally.*

## 📦 Deliverables

The agent shall generate the following updated files:

1.  `/mnist_digit_classifier/backend/Dockerfile` (Fixed system dependencies).
2.  `/mnist_digit_classifier/docker-compose.yml` (Updated ports and syntax).