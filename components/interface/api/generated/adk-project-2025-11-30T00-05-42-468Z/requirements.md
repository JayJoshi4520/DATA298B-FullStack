# Project Requirements Analysis

## 📋 Project Overview
The goal is to develop a full-stack developer utility tool named `timestamp_converter` located within the `target/` directory. This application will facilitate the conversion between Unix timestamps (seconds/milliseconds) and human-readable date formats, supporting multiple timezones. The project requires a containerized setup using Docker.

## 🎯 Core Requirements

### Backend (FastAPI)
1.  **API Structure:**
    -   `GET /now`: Returns current server time in Unix and ISO format.
    -   `POST /from-unix`: Accepts a timestamp and timezone; returns formatted date strings.
    -   `POST /to-unix`: Accepts a date string and timezone; returns the Unix timestamp.
2.  **Functionality:**
    -   Must support Timezone handling (using `pytz`).
    -   Must support multiple output formats (ISO 8601, Human Readable).
    -   CORS configuration to allow Frontend communication.

### Frontend (React)
1.  **User Interface:**
    -   **Bidirectional Converter:** Users can input a timestamp to get a date, or input a date to get a timestamp.
    -   **Timezone Selector:** A dropdown to select the desired timezone for conversion (defaulting to UTC or Local).
    -   **Current Time Display:** A distinct section showing the live current time/timestamp.
2.  **Components:**
    -   `TimestampInput.js`: Input field for numeric Unix values.
    -   `DateOutput.js`: Display component for the converted results.
    -   `App.js`: Main container managing state and API calls via `axios`.
3.  **Styling:** Clean, utility-based CSS in `App.css`.

### Infrastructure
1.  **Containerization:** `docker-compose.yml` to orchestrate both the Python backend and Node/React frontend.
2.  **Version Control:** `.gitignore` properly configured for Python (pycache, venv) and Node (node_modules).

## 🛠️ Technical Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend** | Python / FastAPI | High performance, automatic Swagger documentation, easy request validation with Pydantic. |
| **Server** | Uvicorn | ASI server standard for FastAPI. |
| **Date Libs** | Pytz | Robust timezone database handling in Python. |
| **Frontend** | React.js | Component-based architecture suitable for interactive forms. |
| **HTTP Client** | Axios | Simplified Promise-based HTTP requests. |
| **DevOps** | Docker | Ensures consistent environment across development machines. |

## 📐 Architecture

**Pattern:** Client-Server / REST API

1.  **Client (Frontend):** Runs on port `3000`. Handles user input and displays data. No complex date logic on the client side; it delegates calculation to the API to ensure server-side accuracy.
2.  **Server (Backend):** Runs on port `8000`. Exposes REST endpoints. Handles parsing, timezone conversion, and validation.
3.  **Communication:** JSON over HTTP.

## ✅ Success Criteria
1.  **Setup:** Running `docker-compose up` successfully builds and starts both containers without errors.
2.  **Accuracy:**
    -   Converting `1609459200` (UTC) results in `2021-01-01 00:00:00`.
    -   Changing timezone modifies the visual date but preserves the instant in time.
3.  **Responsiveness:** The UI handles invalid inputs gracefully (e.g., entering text into the timestamp field).
4.  **Completeness:** All requested files (`main.py`, `App.js`, `docker-compose.yml`, specific components) are present in the specified directory structure.

## ⚠️ Risks & Considerations
1.  **CORS Errors:** The Backend must explicitly whitelist the Frontend origin (usually `http://localhost:3000`) or allow `*` for development ease.
2.  **Networking:** In Docker Compose, services communicate via service names, but the browser accesses the API via `localhost`. The React app runs in the *browser*, not the container, so API calls in React must target `localhost:8000`, not `backend:8000`.
3.  **Input Parsing:** Parsing arbitrary date strings (e.g., "next tuesday") is complex. The `/to-unix` endpoint should expect a standard format (ISO 8601) or specific common formats to avoid errors.

## 📦 Deliverables Structure

```text
target/
└── timestamp_converter/
    ├── .gitignore
    ├── docker-compose.yml
    ├── backend/
    │   ├── README.md
    │   ├── requirements.txt
    │   └── main.py
    └── frontend/
        ├── README.md
        ├── package.json
        └── src/
            ├── App.css
            ├── App.js
            └── components/
                ├── TimestampInput.js
                └── DateOutput.js
```