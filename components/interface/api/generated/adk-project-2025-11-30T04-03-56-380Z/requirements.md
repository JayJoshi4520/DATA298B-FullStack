# Project Requirements Analysis

## 📋 Project Overview
The project is a full-stack developer tool named **"color_palette_generator"**. It is designed to assist UI developers and designers in generating harmonious color palettes based on a selected input color. The application consists of a Python-based REST API (FastAPI) for color mathematics and a React-based frontend for user interaction and visualization. A key feature is the ability to export generated palettes directly into CSS variables and Tailwind CSS configuration code.

## 🎯 Core Requirements

### 1. Backend (FastAPI)
- **API Structure:** RESTful API running on port 8000 (default).
- **Color Logic (`colors.py`):**
  - logic to convert between Hex, RGB, and HSL color spaces.
  - Algorithms to calculate variations without using heavy external libraries (pure Python math preferred).
- **Endpoints (`main.py`):**
  - `POST /generate`: Accepts a base color; returns a full harmonious palette (e.g., analogous or split-complementary).
  - `POST /complement`: Accepts a base color; returns the complementary color (180° hue rotation).
  - `POST /shades`: Accepts a base color; returns a gradient of shades (darker) and tints (lighter).
- **CORS:** Must be configured to allow requests from the frontend application.

### 2. Frontend (React)
- **UI Framework:** React with clean, "design tool" aesthetics (minimalist, centered, focused).
- **State Management:** Manage selected base color and the resulting palette list.
- **Components:**
  - `ColorPicker.js`: Integrates `react-colorful` to allow user selection.
  - `PaletteDisplay.js`: Renders color swatches. Clicking a swatch should ideally copy the hex code.
- **Export Functionality:**
  - Capability to generate a text block containing:
    1.  Standard CSS Variables (e.g., `--primary: #ff0000;`)
    2.  Tailwind Config format (e.g., `colors: { primary: '#ff0000', ... }`)

### 3. DevOps & Configuration
- **Containerization:** `docker-compose.yml` to orchestrate both Frontend and Backend services simultaneously.
- **Environment:** Root level `.gitignore` to exclude node_modules, venv, and cache files.

## 🛠️ Technical Stack

- **Backend:**
  - **Language:** Python 3.9+
  - **Framework:** FastAPI (High performance, easy documentation via Swagger UI).
  - **Server:** Uvicorn (ASGI server).
- **Frontend:**
  - **Library:** React (Create React App structure or Vite-compatible structure).
  - **Dependencies:**
    - `axios`: For HTTP requests.
    - `react-colorful`: Lightweight color picker component.
  - **Styling:** CSS (modular or standard App.css as requested).
- **Infrastructure:** Docker & Docker Compose.

## 📐 Architecture

The application follows a standard Client-Server architecture:

1.  **Client (Browser):** Runs the React Single Page Application.
2.  **Interaction:** User picks a color -> Client sends JSON `{ "color": "#hex" }` to Backend.
3.  **Server (Container):** FastAPI receives request -> `colors.py` processes HSL math -> Returns JSON list of hex codes.
4.  **Visualization:** Client updates state -> Renders swatches -> Generates export strings locally.

## ✅ Success Criteria

1.  **Project Structure:** File tree matches the requested structure exactly under `color_palette_generator`.
2.  **Functionality:**
    - The backend starts successfully via Docker.
    - The frontend starts successfully via Docker.
    - Selecting a color in the UI triggers an API call that returns a valid palette.
    - The "Export" feature produces valid CSS and JS/JSON syntax.
3.  **Visuals:** The UI looks professional (padding, shadows, rounded corners) and is not just raw HTML.

## ⚠️ Risks & Considerations

- **Color Math:** Converting Hex to HSL and back requires careful float handling to avoid rounding errors resulting in invalid Hex codes.
- **Docker Networking:** The Frontend container needs to talk to the Backend. The `docker-compose` setup must expose the correct ports, and the Frontend (running in the browser) must address the Backend via `localhost` (since the browser runs on the host machine) or a configured proxy.
- **Input Validation:** Backend should handle invalid hex strings gracefully (return 400 error).

## 📦 Deliverables Structure

The following file structure will be generated:

```text
color_palette_generator/
├── .gitignore
├── docker-compose.yml
├── backend/
│   ├── README.md
│   ├── requirements.txt
│   ├── main.py
│   └── colors.py
└── frontend/
    ├── README.md
    ├── package.json
    └── src/
        ├── App.js
        ├── App.css
        └── components/
            ├── ColorPicker.js
            └── PaletteDisplay.js
```