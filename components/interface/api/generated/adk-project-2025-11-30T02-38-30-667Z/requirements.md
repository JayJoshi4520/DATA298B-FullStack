# Project Requirements Analysis

## 📋 Project Overview
The goal is to develop **`lorem_ipsum_generator`**, a full-stack local developer tool designed to generate various types of placeholder data (text, user data, identifiers) for use in software testing and UI prototyping. The application will consist of a Python-based REST API and a React-based Single Page Application (SPA), containerized via Docker.

## 🎯 Core Requirements

### 1. Backend (FastAPI)
The backend acts as the logic layer utilizing the `faker` library to generate data.
- **API Endpoint:** A primary `/generate` endpoint accepting parameters for:
  - `type`: The category of data to generate.
  - `count`: The quantity of items/paragraphs to return.
- **Supported Data Types:**
  - **Text:** Paragraphs, Sentences, Words (Lorem Ipsum).
  - **User Data:** Names, Emails, Addresses.
  - **System:** UUIDs.
- **Architecture:** Separation of concerns with route handling in `main.py` and generation logic in `generators.py`.
- **CORS:** Must enable CORS to allow the frontend to communicate with the API.

### 2. Frontend (React)
A minimal, functional UI for interacting with the API.
- **State Management:** Manage selected `type`, input `count`, and the resulting `data`.
- **Components:**
  - `GeneratorForm`: A control panel containing a dropdown (Type Selector) and a number input (Count).
  - `OutputDisplay`: A view area to render the result (either as a text block or a list) with a "Copy to Clipboard" button.
- **Styling:** Minimalistic "developer-centric" CSS (clean lines, monospaced fonts for output).

### 3. Infrastructure & DevOps
- **Containerization:** `docker-compose.yml` to orchestrate both services simultaneously.
- **Networking:** Frontend must be able to reach Backend via HTTP.

## 🛠️ Technical Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend** | **FastAPI** (Python 3.9+) | High performance, automatic Swagger docs, easy JSON handling. |
| **Logic** | **Faker** | Robust library for generating localized fake data. |
| **Server** | **Uvicorn** | ASGI server standard for FastAPI. |
| **Frontend** | **React.js** | Component-based architecture ideal for form/display state separation. |
| **HTTP Client** | **Axios** | Simplified Promise-based HTTP requests. |
| **DevOps** | **Docker / Docker Compose** | Ensures consistent environment and easy startup. |

## 📐 Architecture

**Data Flow:**
1. User selects "Email" and Count "5" in React UI.
2. React sends `GET /generate?type=email&count=5` to FastAPI.
3. FastAPI validates input and calls `generators.generate_emails(5)`.
4. `Faker` generates the data.
5. FastAPI returns JSON payload: `{"data": ["a@b.com", "c@d.com", ...]}`.
6. React receives JSON and renders the list in the Output Display.

## ✅ Success Criteria
1. **Docker Launch:** Running `docker-compose up` successfully builds and starts both containers without errors.
2. **Connectivity:** Frontend (port 3000) successfully fetches data from Backend (port 8000).
3. **Data Accuracy:**
    - "Paragraphs" returns blocks of text.
    - "UUIDs" returns valid UUID strings.
    - "Addresses" returns formatted address strings.
4. **UX Utility:** The "Copy" button successfully places generated content into the user's clipboard.

## ⚠️ Risks & Considerations
- **CORS Configuration:** The backend must explicitly whitelist the frontend origin (likely `http://localhost:3000`) or allow `*` for local dev tools.
- **Data Formatting:** The frontend needs to handle displaying both **Arrays** (e.g., list of names) and **Strings** (e.g., paragraphs of text) gracefully.
- **Input Validation:** Backend should cap the `count` (e.g., max 100) to prevent performance issues.

## 📦 Deliverables Structure

The following file structure will be generated:

```text
lorem_ipsum_generator/
├── docker-compose.yml          # Orchestration for Frontend + Backend
├── .gitignore                  # Git exclusions (node_modules, venv, etc.)
├── backend/
│   ├── README.md
│   ├── requirements.txt        # fastapi, uvicorn, faker
│   ├── main.py                 # API Entry point & CORS setup
│   └── generators.py           # Functions using Faker
└── frontend/
    ├── README.md
    ├── package.json            # React, axios dependencies
    ├── public/                 # Standard React public assets
    └── src/
        ├── App.js              # Main container logic
        ├── App.css             # Minimal styling
        ├── index.js            # Entry point
        └── components/
            ├── GeneratorForm.js   # Input controls
            └── OutputDisplay.js   # Results & Copy button
```