# Project Requirements Analysis

## 📋 Project Overview
The user is attempting to run a containerized "Task Scheduler" application consisting of a FastAPI backend and a Vite-based frontend. While the containers start successfully and logs indicate the services are running, the frontend is inaccessible from the host machine (browser).

The primary objective is to debug the networking configuration between the Docker container and the host machine to make the frontend accessible.

## 🎯 Core Requirements

### 1. Fix Frontend Connectivity (Priority: High)
The logs show the frontend running internally on port `4000` inside the container:
`➜ Network: http://172.27.0.3:4000/`
However, the user cannot access it.
*   **Action:** Verify and fix the `ports` mapping in `docker-compose.yml`. The container port `4000` must be mapped to a host port (e.g., `4000:4000`).
*   **Action:** Ensure the Vite server is explicitly binding to `0.0.0.0` (via `vite.config.js` or command flags), allowing external connections. (The logs suggest it might be, but we must guarantee it).

### 2. Cleanup Docker Compose Configuration (Priority: Low)
The logs show a warning: `the attribute version is obsolete`.
*   **Action:** Remove the `version: '3'` (or similar) line from `docker-compose.yml` to adhere to the latest Docker Compose specification.

### 3. Verify Backend Connectivity (Priority: Medium)
The backend is running on internal port `8000`.
*   **Action:** Ensure the backend port `8000` is also correctly exposed in `docker-compose.yml` so the frontend can communicate with it (and for potential direct API testing).

## 🛠️ Technical Stack
*   **Containerization:** Docker & Docker Compose.
*   **Backend:** Python 3.11, FastAPI, Uvicorn.
*   **Frontend:** Node.js, Vite (Port 4000).

## 📐 Architecture & Debugging Strategy
The current architecture is a standard multi-container setup. The failure point is at the **Host <-> Container Network Interface**.

**Current State (Broken):**
`Host Browser` --(X)--> `Docker Port Mapping` --?--> `Frontend Container (Port 4000)`

**Desired State (Fixed):**
`Host Browser` --(Port 4000)--> `Docker Port Mapping` --(Port 4000)--> `Frontend Container (0.0.0.0:4000)`

## ✅ Success Criteria
1.  Running `docker compose up` results in no warnings regarding the `version` attribute.
2.  The user can open a web browser on the host machine (e.g., `http://localhost:4000`) and see the frontend application.
3.  The frontend logs show requests being received.

## ⚠️ Risks & Considerations
*   **Port Conflicts:** If port 4000 is occupied on the user's host machine, the mapping might fail. We will assume port 4000 is free or stick to the configuration implied by the logs.
*   **CORS Issues:** Once the frontend loads, it may fail to talk to the backend if CORS is not configured for the frontend's specific origin. This is out of scope for *loading* the page, but relevant for functionality.
*   **Vite Configuration:** Sometimes Vite defaults to `127.0.0.1` even if Docker maps the ports. We must ensure `host: true` or `host: '0.0.0.0'` is set in `vite.config.js`.

## 📦 Deliverables
The following files need modification:
1.  `/task_scheduler/docker-compose.yml` (Fix port mapping and remove version).
2.  `/task_scheduler/frontend/vite.config.js` (Ensure server host is set to 0.0.0.0 and port is 4000).
3.  `/task_scheduler/frontend/package.json` (Verify start script, optionally add `--host`).