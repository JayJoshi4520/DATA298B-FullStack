# Project Requirements Analysis

## 📋 Project Overview
The goal is to develop **`base64_toolkit`**, a full-stack developer utility web application. The tool provides a unified interface for three common development tasks: Base64 encoding/decoding of text, Base64 encoding of image files, and decoding/inspecting JSON Web Tokens (JWT). The application will be containerized using Docker.

## 🎯 Core Requirements

### 1. Backend Service (Node.js + Express)
*   **API Endpoints:**
    *   `POST /api/encode`: Accepts text strings or files (images) and returns the Base64 encoded string.
    *   `POST /api/decode`: Accepts a Base64 string and returns the decoded plain text.
    *   `POST /api/jwt-decode`: Accepts a JWT string and returns the decoded header and payload (without signature verification requirement, purely inspection).
*   **Data Handling:**
    *   Must verify input integrity (handle empty strings, invalid Base64).
    *   Must support `multipart/form-data` for file uploads (Image handling).
*   **Configuration:** CORS enabled to allow frontend communication.

### 2. Frontend Application (React)
*   **User Interface:**
    *   A clean, "tool-style" interface (neutral colors, distinct input/output areas).
    *   **Tabbed Navigation:**
        1.  **Text Encoder:** Two text areas (Input/Output) with "Encode" and "Decode" buttons.
        2.  **Image Encoder:** File picker input and a text area to display the resulting Base64 string (with a Copy to Clipboard feature implies).
        3.  **JWT Decoder:** Input text area for the token and a formatted JSON view for Header and Payload.
*   **State Management:** Simple local state (`useState`) to manage active tabs and input values.
*   **Networking:** Use `axios` to communicate with the backend endpoints.

### 3. Infrastructure
*   **Docker:** A `docker-compose.yml` to orchestrate both services simultaneously.
*   **Version Control:** A comprehensive `.gitignore` for Node.js projects.

## 🛠️ Technical Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend** | Node.js, Express | Lightweight, fast execution for string manipulation. |
| **Backend Libs** | `cors`, `jsonwebtoken`, `multer` | `multer` is required for handling file uploads (images) in memory. |
| **Frontend** | React.js | Component-based structure suits the Tabbed UI requirements perfectly. |
| **Frontend Libs** | `axios` | Standard HTTP client for API requests. |
| **Orchestration** | Docker Compose | Simplifies deployment and ensures environment consistency. |

## 📐 Architecture

### High-Level Data Flow
1.  **Text:** User Input -> React State -> `POST /encode` (JSON) -> Backend -> Response -> Display.
2.  **Image:** File Select -> React FormData -> `POST /encode` (Multipart) -> Backend (`multer`) -> Buffer to Base64 -> Response -> Display.
3.  **JWT:** User Input -> React State -> `POST /jwt-decode` -> Backend (`jsonwebtoken.decode`) -> Response -> Display JSON.

### Directory Structure
```text
base64_toolkit/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TextEncoder.js
│   │   │   ├── ImageEncoder.js
│   │   │   └── JwtDecoder.js
│   │   ├── App.js
│   │   └── App.css
│   ├── package.json
│   └── README.md
├── .gitignore
└── docker-compose.yml
```

## ✅ Success Criteria
1.  **Functional Text Tab:** Typing "Hello" and clicking Encode results in "SGVsbG8=". Decoding reverses the process.
2.  **Functional Image Tab:** Uploading a PNG/JPG results in a long Base64 string displayed in the output box.
3.  **Functional JWT Tab:** Pasting a valid JWT results in the display of the JSON payload object.
4.  **Docker Launch:** Running `docker-compose up` successfully starts both containers without errors, accessible via `localhost`.

## ⚠️ Risks & Considerations
*   **Image Size:** Large images converted to Base64 create massive strings. *Mitigation:* The backend should handle the conversion efficiently, but the frontend might lag if rendering 5MB+ of text. We will assume reasonable file sizes for a dev tool.
*   **CORS:** Since frontend and backend run on different ports (e.g., 3000 and 5000), CORS must be configured correctly in `server.js`.
*   **Multer Dependency:** The user didn't explicitly ask for `multer`, but it is technically required to handle the "handle images" requirement in Express. It will be added.

## 📦 Deliverables
The following files will be generated:
1.  `base64_toolkit/.gitignore`
2.  `base64_toolkit/docker-compose.yml`
3.  `base64_toolkit/backend/package.json`
4.  `base64_toolkit/backend/server.js`
5.  `base64_toolkit/backend/README.md`
6.  `base64_toolkit/frontend/package.json`
7.  `base64_toolkit/frontend/src/App.js`
8.  `base64_toolkit/frontend/src/App.css`
9.  `base64_toolkit/frontend/src/components/TextEncoder.js`
10. `base64_toolkit/frontend/src/components/ImageEncoder.js`
11. `base64_toolkit/frontend/src/components/JwtDecoder.js`
12. `base64_toolkit/frontend/README.md`