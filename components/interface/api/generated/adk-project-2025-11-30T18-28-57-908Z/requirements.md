# Project Requirements Analysis

## 📋 Project Overview
The goal is to develop "env_manager," a full-stack web application designed to help developers manage, validate, and compare `.env` configuration files across different environments (e.g., Development vs. Production). The tool will feature a "Hacker/Terminal" aesthetic and run within a Dockerized environment.

## 🎯 Core Requirements

### 1. Backend Service (Flask)
**Functionality:**
- **Text Processing:** accurately parse `.env` file content (strings) into structured JSON objects (Key-Value pairs).
- **Comparison Logic:** Logic to identify:
  - Missing keys (present in Source but missing in Target).
  - Value mismatches (keys exist in both but values differ).
- **Generation:** Ability to reconstruct a standard `.env` string from structured data.

**API Endpoints:**
- `POST /parse`: Accepts raw text, returns JSON object of env vars. Should handle comments (`#`) and empty lines gracefully.
- `POST /compare`: Accepts two env objects (Source & Target), returns a diff object highlighting missing keys and value discrepancies.
- `POST /generate`: Accepts a JSON object, returns a formatted `.env` string.

### 2. Frontend Service (React)
**Functionality:**
- **Dual Pane Editor:** Two input areas (`EnvEditor`) to paste/edit environment variables (e.g., Left: Local, Right: Production).
- **Visual Diffing:** A `DiffView` component to display the comparison results returned by the backend.
- **Visual Feedback:** Highlighting mechanism for missing variables (Critical for preventing prod crashes).
- **Terminal Aesthetic:** Dark mode, green/monospaced fonts, scanlines (optional), and console-like structure.

**User Interface Structure:**
- **EnvEditor.js:** A text-area based component with basic line numbering or syntax coloring if possible.
- **DiffView.js:** A read-only display showing the results of the comparison.

### 3. Infrastructure
- **Containerization:** Both services must run via `docker-compose`.
- **CORS:** The backend must allow requests from the frontend container/browser.

## 🛠️ Technical Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Backend** | Python 3 + Flask | Lightweight, excellent string manipulation capabilities, fast development time for REST APIs. |
| **Frontend** | React.js | Component-based architecture is ideal for multiple editor panes and dynamic diff views. |
| **Styling** | CSS (Custom) | No framework (Bootstrap/Tailwind) needed; custom CSS required to achieve specific "Terminal" look. |
| **Networking** | Axios | Standard Promise-based HTTP client for browser-to-backend communication. |
| **DevOps** | Docker & Docker Compose | Ensures consistent environment and easy startup for the end user. |

## 📐 Architecture

The application follows a standard **Single Page Application (SPA)** architecture:

1.  **Client (Browser):** Holds state (raw text of env files). Sends text to API for heavy lifting (parsing/comparing).
2.  **API (Flask):** Stateless. Receives raw strings, performs logic using `parser.py`, returns JSON.
3.  **Data Flow:**
    *   User pastes text -> Frontend State
    *   Frontend sends text to `POST /compare` -> Backend
    *   Backend parses both texts, calculates diff -> Returns JSON
    *   Frontend renders JSON in `DiffView`.

## ✅ Success Criteria
1.  **Deployment:** `docker-compose up` successfully builds and starts both containers without errors.
2.  **Parsing:** The application correctly ignores comments (lines starting with `#`) and parses `KEY=VALUE` pairs.
3.  **Comparison:** The UI clearly indicates when a key exists in File A but not in File B.
4.  **Styling:** The application visually resembles a retro terminal (Dark background, Monospace font).

## ⚠️ Risks & Considerations
-   **Parsing Complexity:** Handling edge cases in `.env` files (e.g., quoted values with spaces `KEY="value with spaces"`, inline comments) requires a robust regex or parsing logic in `parser.py`.
-   **Docker Networking:** Ensuring the React frontend (running in browser) can access the Flask backend. Since this is a dev tool, mapping ports to localhost (e.g., Frontend:3000, Backend:5000) is the safest approach.

## 📦 Deliverables Structure

The output code must strictly adhere to this file tree:

```text
env_manager/
├── docker-compose.yml
├── .gitignore
├── backend/
│   ├── app.py              # Main Flask application with endpoints
│   ├── parser.py           # Logic to parse .env strings
│   ├── requirements.txt    # flask, flask-cors
│   └── README.md
└── frontend/
    ├── package.json        # scripts, dependencies (react, axios)
    ├── public/             # Standard React public folder
    ├── src/
    │   ├── App.js          # Main layout and state management
    │   ├── App.css         # Terminal styling
    │   ├── components/
    │   │   ├── EnvEditor.js # Text input component
    │   │   └── DiffView.js  # Result display component
    └── README.md
```