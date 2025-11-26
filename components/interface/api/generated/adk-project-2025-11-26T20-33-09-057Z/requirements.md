# Project Requirements Analysis

## 📋 Project Overview
The user is attempting to build a containerized **MNIST Digit Classifier** application comprising a React frontend and a Python backend. The build process is failing during the **Frontend** container construction due to a Node.js package dependency conflict.

Specifically, the library `react-canvas-draw` demands an older version of React (16.x or 17.x), but the project is configured to use React 18.x. Additionally, there are minor syntax warnings in the Docker configuration that need cleanup.

## 🎯 Core Requirements

### 1. Fix Dependency Resolution Error (Critical)
The primary blocker is `npm error code ERESOLVE`.
*   **Problem:** `react-canvas-draw@1.2.1` has a peer dependency of React < 18, but the root project uses React 18.3.1.
*   **Requirement:** Configure the build process to resolve this conflict without downgrading React, typically by enforcing legacy peer dependency resolution.

### 2. Fix Docker Configuration Warnings (Maintenance)
*   **Docker Compose:** Remove the obsolete `version` attribute from `docker-compose.yml` to suppress the startup warning.
*   **Dockerfile Syntax:** Fix the casing mismatch warning (`FromAsCasing`) in the Dockerfile (ensure `AS` matches `FROM` casing).

### 3. Ensure Successful Build
*   The final code must allow `docker compose up --build` to execute from start to finish without error exit codes.

## 🛠️ Technical Stack
*   **Containerization:** Docker Desktop, Docker Compose.
*   **Frontend Runtime:** Node.js 18 (Alpine Linux variant).
*   **Frontend Framework:** React 18.2.0+.
*   **Problematic Library:** `react-canvas-draw` (Canvas drawing tool for digit input).
*   **Web Server:** Nginx (Alpine) - indicated by the multi-stage build logs.

## 📐 Architecture & Solution Strategy

To resolve the issue while maintaining the modern React stack, the following changes are required in the Infrastructure code:

1.  **Frontend Dockerfile Modification:**
    *   Locate the `RUN npm install` command.
    *   Update it to `RUN npm install --legacy-peer-deps` OR `RUN npm ci --legacy-peer-deps`.
    *   *Rationale:* This tells npm to ignore the peer dependency warning. `react-canvas-draw` is known to work generally fine with React 18 despite the metadata warning.

2.  **Docker Compose Cleanup:**
    *   Remove `version: '3'` (or similar) from the top of the yaml file.

## ✅ Success Criteria
1.  **Build Completes:** The command `docker compose up --build` finishes all stages (Backend and Frontend) successfully.
2.  **No Critical Errors:** The log `npm error code ERESOLVE` no longer appears.
3.  **Clean Logs:** The warnings regarding `version` and `FromAsCasing` are gone.

## ⚠️ Risks & Considerations
*   **Runtime Stability:** Using `--legacy-peer-deps` bypasses strict checks. While unlikely for this specific library, there is a minor risk that `react-canvas-draw` could behave unexpectedly with React 18's concurrency features. However, for an MVP/Student project, this is the standard accepted fix.
*   **Context:** Ensure the context paths in the Dockerfile (`COPY . .`) remain correct relative to the file structure.

## 📦 Deliverables
The Developer Agent must provide the corrected content for:
1.  **`frontend/Dockerfile`** (With the npm fix and casing fix).
2.  **`docker-compose.yml`** (Cleaned up).