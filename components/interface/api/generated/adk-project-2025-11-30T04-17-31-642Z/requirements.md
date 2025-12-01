# Project Requirements Analysis

## 📋 Project Overview
The goal is to develop a full-stack developer utility tool named **`base64_toolkit`**. This application serves as a centralized dashboard for common encoding and decoding tasks. It will be containerized using Docker and features a React frontend communicating with a Node.js/Express backend to perform data processing.

## 🎯 Core Requirements

### 1. Functional Requirements
*   **Text Processing:**
    *   Ability to input plain text and convert it to a Base64 string.
    *   Ability to input a Base64 string and decode it back to plain text.
*   **Image Processing:**
    *   Ability to upload an image file from the client.
    *   Server-side conversion of the image file to a Base64 Data URI string.
    *   Display the resulting Base64 string to the user.
*   **JWT Debugging:**
    *   Ability to input a JSON Web Token (JWT).
    *   Server-side parsing of the token header and payload (without signature verification logic, purely for debugging).
    *   Display the decoded JSON structure.

### 2. User Interface (Frontend)
*   **Navigation:** A tabbed interface to switch between "Text Encoder", "Image Encoder", and "JWT Decoder".
*   **Styling:** "Tool-style" UI (clean, utility-focused, likely using a dark or high-contrast theme via `App.css`).

## 🛠️ Technical Stack

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Key Libraries:**
    *   `cors`: To allow requests from the React frontend running on a different port.
    *   `jsonwebtoken`: For robust parsing of JWT tokens.
    *   `multer`: (Implicit Requirement) Necessary to handle `multipart/form-data` for image file uploads in memory.
*   **Endpoints:**
    *   `POST /encode`: Accepts text or files, returns Base64.
    *   `POST /decode`: Accepts Base64, returns text.
    *   `POST /jwt-decode`: Accepts a token string, returns decoded JSON object.

### Frontend
*   **Framework:** React
*   **HTTP Client:** Axios
*   **State Management:** React `useState` for handling tab switching and form inputs.

### Infrastructure
*   **Docker:** `Dockerfile` for both services and a `docker-compose.yml` to orchestrate them.

## 📐 Architecture

The project will follow a standard Monorepo structure:

```text
base64_toolkit/
├── backend/            # Express API running on internal port (e.g., 5000)
├── frontend/           # React App running on exposed port (e.g., 3000)
├── docker-compose.yml  # Orchestration
└── .gitignore          # Git configuration
```

**Data Flow:**
1.  User interacts with React Component.
2.  Axios sends payload to Express API.
3.  Express processes data (Buffer manipulation for Base64, library call for JWT).
4.  Express returns JSON response.
5.  React renders result.

## ✅ Success Criteria
1.  **Deployment:** Running `docker-compose up` successfully builds and starts both containers without errors.
2.  **Functionality:**
    *   Text Encoder tab successfully converts "Hello" <-> "SGVsbG8=".
    *   Image Encoder tab accepts a PNG/JPG, and returns a string starting with `data:image/...`.
    *   JWT Decoder tab accepts a generic JWT and displays the Header and Payload JSON.
3.  **Stability:** The app handles invalid Base64 strings or malformed JWTs gracefully (returns an error message, doesn't crash).

## ⚠️ Risks & Considerations
*   **Payload Size:** Default Express/Body-parser limits might block large image uploads.
    *   *Mitigation:* We must configure `express.json({ limit: '50mb' })` and `express.urlencoded` limits.
*   **CORS:** Browser will block requests if CORS is not enabled on the backend.
*   **Security:** This is a developer tool. We are *decoding* JWTs for inspection, not verifying signatures for authentication. The UI should make it clear that the signature is not being validated against a secret.

## 📦 Deliverables

The implementation will generate the following file structure:

1.  **Root:**
    *   `docker-compose.yml`
    *   `.gitignore`
2.  **Backend:**
    *   `Dockerfile`
    *   `package.json`
    *   `server.js`
    *   `README.md`
3.  **Frontend:**
    *   `Dockerfile`
    *   `package.json`
    *   `public/` (index.html)
    *   `src/App.js`
    *   `src/App.css`
    *   `src/components/TextEncoder.js`
    *   `src/components/ImageEncoder.js`
    *   `src/components/JwtDecoder.js`
    *   `README.md`