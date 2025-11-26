# Multi Agent Collaboration 

## Try it out

1. Clone the git Repo using ```git clone https://github.com/JayJoshi4520/DATA298B-FullStack.git```
2. ```cd DATA298-FullStack```
3. Create below .env file, NOTE: for testing only change the API KEY of LLM_API_KEY
```
# ======================
# LLM PROVIDER CONFIGURATION
# ======================
LLM_PRIMARY_PROVIDER=vertexai

# ======================
# GOOGLE VERTEXAI CONFIGURATION
# ======================
GOOGLE_APPLICATION_CREDENTIALS=/var/secrets/sa.json
GOOGLE_GENAI_USE_VERTEXAI=true
LLM_MODEL=projects/excellent-hue-472000-n4/locations/us-east-4/endpoints/3088198308934451200
GOOGLE_CLOUD_PROJECT=excellent-hue-472000-n4
GOOGLE_CLOUD_LOCATION=us-east4
LLM_API_KEY=YOUR_API_KEY
LLM_BASE_URL=https://generativelanguage.googleapis.com
LLM_MAX_TOKENS=4000

# ======================
# SERVER CONFIGURATION
# ======================
NODE_ENV=development
PORT=3030
PROJECT_ROOT=/home/coder/project
COMMAND_TIMEOUT=30000
MAX_FILE_SIZE=1048576

# Development options
DEV_MODE=true
ENABLE_MOCK_AI=false
DEBUG=true


```
4. Run docker command ``````

Once the containers have started, open your browser to http://localhost:5173 and you’ll see the Workspace!,

To Test backend API use http://localhost:3030 using Postman.

Click the **Load VS Code here** button to display the VS Code IDE in the right side panel.


## Development

To work on the Labspace infrastructure, you can utilize the `compose.yaml` file. Make sure to enable Compose Watch mode with the `--watch` flag.

```console
docker compose up --build
```

After it starts, open the workspace at http://localhost:5173.


## Known limitations

- Running multiple workspace concurrently is not supported at this time on the same machine

# Example Prompts

1. 
```
Create a small full-stack web app named "book_finder" under the target directory.  
It should let users search for books using the Google Books API.

**Backend (FastAPI):**
- Folder `backend/` with:
  - `main.py` exposing `/search?query=<term>` endpoint calling Google Books API
  - `requirements.txt` listing fastapi, uvicorn, requests
  - `README.md` describing API setup

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `public/index.html` titled “Book Finder”
  - `src/App.js` with a search bar and list rendering book titles/authors
  - `src/index.js` rendering App
  - `src/App.css` with clean minimal styling
  - `README.md` with startup commands

**Root:**
- `.gitignore` excluding node_modules and caches
- `docker-compose.yml` linking both apps
- `.env.example` with placeholder for backend URL

Generate real, runnable code for all files.
```

2. 
```
Create a small full-stack web app named "expense_tracker" under the target directory.  
It should let users record expenses and view summaries.

**Backend (Django REST Framework):**
- `backend/` folder with:
  - Django project `expense_backend`
  - App `expenses` with models, serializers, and views for expense tracking
  - API endpoint `/api/expenses/`
  - `requirements.txt` with django, djangorestframework
  - `manage.py` and working settings
  - `README.md` explaining migration and runserver commands

**Frontend (Vue.js):**
- `frontend/` folder with:
  - Vue CLI structure or Vite setup
  - `package.json` (vue, axios)
  - `src/App.vue` showing list of expenses and form to add a new one
  - `src/main.js` to initialize app
  - `README.md` with run instructions

**Root Files:**
- `.gitignore` ignoring build and cache folders
- `docker-compose.yml` linking frontend and backend containers

All files must include functional starter implementations, not placeholders.
```

3. 
```Create a full-stack web app named "fitness_tracker" under the target directory.  
Users should track workouts, exercises, and calories.

**Frontend (React):**
- Standard React structure with:
  - `package.json` (react, react-dom, axios)
  - `public/index.html`
  - `src/App.js` showing:
    - Form to add workouts
    - Display list of workouts from backend
  - `src/index.js`
  - `src/App.css` with card-based layout

**Backend (Flask + SQLite):**
- Folder `backend/` with:
  - `app.py` exposing endpoints `/workouts`
  - `db.py` initializing SQLite database (workouts table)
  - `models.py` for CRUD operations
  - `requirements.txt` (flask, sqlite3)
  - Auto-create DB file if missing
  - `README.md` with setup instructions

**Root:**
- `.gitignore`
- `docker-compose.yml` for frontend + backend
- `.env.example` for DB path

All code must be functional, no placeholder content.
```

4. 
```
Create a small full-stack web application named "task_scheduler" under the target directory.  
The app should allow users to create scheduled tasks with a title, date, and priority.

**Frontend (Svelte):**
- Create a Svelte project with:
  - `package.json` (dependencies: svelte, vite, axios)
  - `public/index.html` titled “Task Scheduler”
  - `src/App.svelte` showing:
    - Form to add task (title, date, priority)
    - Table of existing tasks
  - `src/main.js` mounting App
  - `src/styles.css` with simple responsive styling
  - `README.md` with instructions to run via `npm run dev`

**Backend (FastAPI):**
- `backend/` folder with:
  - `main.py` exposing CRUD routes `/tasks`
  - `models.py` defining Task (id, title, date, priority)
  - `storage.py` implementing an in-memory task list
  - `requirements.txt` (fastapi, uvicorn)
  - `README.md` with run instructions

**Root Files:**
- `.gitignore` (node_modules, __pycache__, dist)
- `docker-compose.yml` linking both services

Ensure all files include complete, working code with real logic.
```

5. 
```Create a small full-stack project named "budget_planner" under the target directory.  
The app should help users track income, expenses, and savings.

**Frontend (React):**
- Include:
  - `package.json` with react, axios, react-router-dom
  - `public/index.html`
  - `src/App.js` creating:
    - Dashboard showing current balance
    - Form to add income/expense entries
    - List of transactions
  - `src/api.js` for axios calls
  - `src/App.css` with clean card-based UI
  - `README.md` describing how to run the app

**Backend (Node.js + Express):**
- Folder `backend/` containing:
  - `server.js` with routes `/transactions` (CRUD)
  - `models/Transaction.js` defining MongoDB schema
  - `package.json` (express, mongoose, cors)
  - `README.md` with setup instructions

**Database:**
- Use MongoDB with a connection string from `.env`.

**Root Files:**
- `.env.example` (DB_URI placeholder)
- `.gitignore` for node_modules and logs
- `docker-compose.yml` for backend + frontend + MongoDB

Ensure all files contain working starter code and not placeholders.
```