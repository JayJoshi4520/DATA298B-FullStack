# Project Requirements Analysis

## 📋 Project Overview
The goal is to build a full-stack web application named **`markdown_preview`** that serves as a live Markdown editor. The application will feature a split-pane interface: one side for editing raw Markdown text and the other for viewing the real-time HTML render. The rendering logic will be handled server-side to ensure strict GitHub Flavored Markdown (GFM) compliance and server-side syntax highlighting.

## 🎯 Core Requirements

### Functional Requirements
1.  **Live Editing:** As the user types in the editor pane, the preview pane must update (near real-time).
2.  **GitHub Flavored Markdown (GFM):** The renderer must support:
    -   Tables
    -   Fenced Code Blocks
    -   Task Lists
    -   Standard Markdown (headers, lists, bold, italic, etc.)
3.  **Syntax Highlighting:** Code blocks must be syntax-highlighted (using Pygments on the backend).
4.  **Containerization:** The entire application must be runnable via `docker-compose`.

### UI/UX Requirements
1.  **Split-Pane Layout:** Side-by-side Editor and Preview.
2.  **Styling:** The preview pane must mimic GitHub's standard Markdown rendering styles (fonts, borders, background colors).

## 🛠️ Technical Stack

### Backend
-   **Language:** Python
-   **Framework:** Flask (Lightweight web framework)
-   **Key Libraries:**
    -   `flask-cors`: To allow the React frontend to communicate with the Python backend.
    -   `markdown`: For converting text to HTML.
    -   `pygments`: For generating CSS classes for code syntax highlighting.

### Frontend
-   **Library:** React (likely via Create React App structure).
-   **HTTP Client:** Axios (for communicating with the `/render` endpoint).
-   **State Management:** React `useState` and `useEffect`.

### Infrastructure
-   **Docker:** Dockerfiles for both services.
-   **Docker Compose:** Orchestration to run backend and frontend simultaneously.

## 📐 Architecture

### Data Flow
1.  **User Input:** User types in `Editor.js` (React).
2.  **State Change:** React captures the input.
3.  **API Request:** Axios sends a POST request with the markdown text to `http://localhost:5000/render`.
4.  **Processing:** Flask receives the text, uses the `markdown` library with `fenced_code` and `tables` extensions, and `pygments` for code formatting.
5.  **Response:** Flask returns the HTML string and (optionally) the CSS required for syntax highlighting.
6.  **Rendering:** `Preview.js` receives the HTML and injects it into the DOM (using `dangerouslySetInnerHTML`), applying the specific GitHub styles defined in `App.css`.

## ✅ Success Criteria
1.  Running `docker-compose up` starts both services without errors.
2.  Accessing the frontend allows typing in the left pane.
3.  Typing a Markdown table results in a correctly formatted HTML table on the right.
4.  Typing a code block (e.g., `python`) results in colored syntax highlighting on the right.
5.  The visual style resembles GitHub (clean fonts, specific borders for code blocks).

## ⚠️ Risks & Considerations
-   **Performance:** Sending a request on *every* keystroke can overwhelm the server or cause UI stutter.
    -   *Mitigation:* The frontend implementation should ideally include a "debounce" mechanism (waiting a few milliseconds after the user stops typing before sending the request), though a direct implementation is acceptable for an MVP.
-   **Security (XSS):** Rendering raw HTML from user input is dangerous (`dangerouslySetInnerHTML`).
    -   *Note:* Since this is a developer tool/previewer, strict sanitization might be relaxed, but the `markdown` library usually handles basic HTML escaping.
-   **CSS Dependencies:** Pygments generates HTML classes, but the CSS definitions need to exist in the frontend. The backend may need to generate this CSS, or a static CSS file corresponding to a Pygments theme must be included in `frontend/src/App.css`.

## 📦 Deliverables Structure

The project will generate the following directory structure:

```text
markdown_preview/
├── .gitignore
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── README.md
│   └── app.py               # Routes: /render
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── README.md
    └── src/
        ├── App.js           # Main layout
        ├── App.css          # GFM styles + Pygments CSS
        ├── components/
        │   ├── Editor.js    # TextArea input
        │   └── Preview.js   # HTML Output container
        └── index.js
```