# Multi Agent Collaboration 

## Try it out

1. Clone the git Repo using
3. Create below .env file inside ```/components/interface/api```, NOTE: for testing only change the API KEY of LLM_API_KEY
```
# ======================
# LLM PROVIDER CONFIGURATION
# ======================
LLM_PRIMARY_PROVIDER=vertexai

# ======================
# GOOGLE VERTEXAI CONFIGURATION
# ======================
GOOGLE_APPLICATION_CREDENTIALS=/var/secrets/sa.json
GOOGLE_GENAI_USE_VERTEXAI=false
GCS_BUCKET_NAME="data298b-project-store"
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
Create below .env file inside ```/components/interface/client```
```
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID="" 
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```

4. Run docker command ```docker compose build && docker compose up```

Once the containers have started, open your browser to http://localhost:5173 and you’ll see the Workspace!,

To Test backend API use http://localhost:3030 using Postman.

Click the **Load VS Code here** button to display the VS Code IDE in the right side panel.


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


6. 
```
Create a full-stack ML application named "mnist_digit_classifier" under the target directory.  
The backend must train a small neural network from scratch on the MNIST dataset and provide a prediction API.  
The frontend lets users draw a digit and get predictions.

**Backend (FastAPI + PyTorch):**
- Folder `backend/` containing:
  - `model.py` defining a VERY small neural network (2-layer MLP or tiny CNN)
  - `train.py` training the model from scratch using MNIST (download via torchvision)
  - `main.py` exposing:
    - POST `/predict` endpoint accepting a base64 PNG and returning predicted digit
    - GET `/train` endpoint that triggers training
  - Automatically create `model.pth` after training
  - `requirements.txt` including: fastapi, uvicorn, torch, torchvision, pillow, numpy
  - `README.md` explaining training and usage

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios, react-canvas-draw)
  - `public/index.html` titled “MNIST Classifier”
  - `src/App.js` allowing users to:
    - Draw a digit on canvas
    - Send image to the backend
    - Display predicted digit
  - `src/App.css` with clean UI styling
  - `README.md` for setup

**Root Files:**
- `.gitignore` ignoring node_modules, model files, __pycache__
- `docker-compose.yml` exposing backend on 8000 and frontend on 3000

All code must be complete and runnable on a CPU-only MacBook Air.
```

7.
```
Create a small ML full-stack project named "tiny_sentiment_app" under the target directory.  
User can input sentences, the backend predicts sentiment using a tiny neural network you train from scratch.

**Backend (Flask + PyTorch):**
- In `backend/` include:
  - `prepare_data.py` preprocessing a tiny CSV dataset (e.g., IMDB mini)
  - `model.py` defining a tiny LSTM or bag-of-words classifier
  - `train.py` training model on CPU with small dataset
  - `app.py` exposing:
    - `/predict` endpoint for sentiment prediction
    - `/train` endpoint to retrain model
  - `requirements.txt` with flask, torch, numpy, pandas
  - `README.md` documenting training steps

**Frontend (Vue.js):**
- In `frontend/` include:
  - `package.json` (vue, axios)
  - `src/App.vue` with:
    - Text input for sentiment analysis
    - Output box showing label (positive/negative)
  - `src/main.js`
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Ensure the dataset is tiny and training is fast (<10 seconds).
```

8.
```
Create a full-stack developer tool named "code_snippet_manager" under the target directory.
A tool for developers to save, organize, and search code snippets with syntax highlighting.

**Backend (FastAPI):**
- Folder `backend/` with:
  - `main.py` with CRUD endpoints `/snippets`
  - `models.py` defining Snippet (id, title, language, code, tags, created_at)
  - Search by language or tags
  - `requirements.txt` (fastapi, uvicorn)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios, react-syntax-highlighter, prismjs)
  - `src/App.js` with snippet list, code editor, syntax highlighting preview
  - `src/components/SnippetCard.js`, `src/components/CodeEditor.js`
  - `src/App.css` with VS Code-like dark theme
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Generate complete working code with syntax highlighting for 10+ languages.
```

9.
```
Create a full-stack developer tool named "api_tester" under the target directory.
A Postman-like tool for testing REST APIs.

**Backend (Node.js + Express):**
- Folder `backend/` with:
  - `server.js` with `/proxy` endpoint to forward requests (avoid CORS)
  - `history.js` to save request history
  - `package.json` (express, axios, cors)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `src/App.js` with URL input, method selector (GET/POST/PUT/DELETE), headers editor, body editor, response viewer
  - `src/components/RequestBuilder.js`, `src/components/ResponseViewer.js`
  - `src/App.css` with Postman-inspired dark UI
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

All code must be functional.
```

10.
```
Create a full-stack developer tool named "json_formatter" under the target directory.
A tool to format, validate, and visualize JSON data.

**Backend (FastAPI):**
- Folder `backend/` with:
  - `main.py` with `/format`, `/validate`, `/minify` endpoints
  - `utils.py` for JSON operations
  - `requirements.txt` (fastapi, uvicorn)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios, react-json-view)
  - `src/App.js` with input textarea, formatted output, tree view toggle
  - `src/components/JsonTree.js`, `src/components/ErrorDisplay.js`
  - `src/App.css` with developer-friendly dark theme
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Generate complete code with real-time validation.
```

11.
```
Create a full-stack developer tool named "regex_tester" under the target directory.
A tool for testing and debugging regular expressions.

**Backend (Flask):**
- Folder `backend/` with:
  - `app.py` with `/test` endpoint accepting pattern and test string
  - Return matches, groups, and positions
  - `requirements.txt` (flask, flask-cors)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `src/App.js` with regex input, test string input, highlighted matches, match groups display
  - `src/components/MatchHighlighter.js`, `src/components/CheatSheet.js`
  - `src/App.css` with syntax-highlighted styling
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Include a regex cheat sheet sidebar.
```

12.
```
Create a full-stack developer tool named "git_commit_generator" under the target directory.
Generate conventional commit messages from code diffs.

**Backend (FastAPI + AI):**
- Folder `backend/` with:
  - `main.py` with `/generate` endpoint accepting diff text
  - `prompts.py` with templates for conventional commits
  - Generate commit message based on diff analysis
  - `requirements.txt` (fastapi, uvicorn)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios, react-diff-viewer)
  - `src/App.js` with diff input, generated commit message, copy button
  - `src/components/DiffViewer.js`, `src/components/CommitPreview.js`
  - `src/App.css` with GitHub-like diff styling
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Generate complete working code.
```

13.
```
Create a full-stack developer tool named "dependency_analyzer" under the target directory.
Analyze package.json or requirements.txt for outdated/vulnerable dependencies.

**Backend (Node.js + Express):**
- Folder `backend/` with:
  - `server.js` with `/analyze` endpoint accepting package file content
  - `analyzer.js` parsing dependencies and checking versions
  - Mock vulnerability database
  - `package.json` (express, cors, semver)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `src/App.js` with file upload/paste, dependency table with status badges
  - `src/components/DependencyTable.js`, `src/components/VulnerabilityAlert.js`
  - `src/App.css` with npm-style UI
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

All code must be functional.
```

14.
```
Create a full-stack developer tool named "sql_playground" under the target directory.
An interactive SQL query editor with in-memory SQLite database.

**Backend (FastAPI):**
- Folder `backend/` with:
  - `main.py` with `/query` endpoint executing SQL
  - `database.py` setting up sample tables (users, orders, products)
  - Pre-populate with sample data
  - `requirements.txt` (fastapi, uvicorn, aiosqlite)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios, react-table)
  - `src/App.js` with SQL editor, execute button, results table, schema sidebar
  - `src/components/QueryEditor.js`, `src/components/ResultsTable.js`
  - `src/App.css` with database tool styling
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Generate complete playground with 3 sample tables.
```

15.
```
Create a full-stack developer tool named "env_manager" under the target directory.
Manage and compare .env files across environments.

**Backend (Flask):**
- Folder `backend/` with:
  - `app.py` with `/parse`, `/compare`, `/generate` endpoints
  - `parser.py` for .env file parsing
  - `requirements.txt` (flask, flask-cors)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `src/App.js` with env file editor, diff view, missing vars highlight
  - `src/components/EnvEditor.js`, `src/components/DiffView.js`
  - `src/App.css` with terminal-like styling
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

All code must be complete.
```

16.
```
Create a full-stack developer tool named "cron_builder" under the target directory.
A visual cron expression builder and scheduler.

**Backend (FastAPI):**
- Folder `backend/` with:
  - `main.py` with `/parse`, `/next-runs` endpoints
  - `cron_utils.py` for cron expression parsing
  - Return next 10 execution times
  - `requirements.txt` (fastapi, uvicorn, croniter)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `src/App.js` with visual cron builder (dropdowns for each field), expression preview, next runs list
  - `src/components/CronField.js`, `src/components/NextRuns.js`
  - `src/App.css` with clean developer UI
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Generate complete working cron builder.
```

17.
```
Create a full-stack developer tool named "base64_toolkit" under the target directory.
Encode/decode Base64, handle images, and JWT tokens.

**Backend (Node.js + Express):**
- Folder `backend/` with:
  - `server.js` with `/encode`, `/decode`, `/jwt-decode` endpoints
  - Support text and file encoding
  - `package.json` (express, cors, jsonwebtoken)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `src/App.js` with tabs: Text Encoder, Image Encoder, JWT Decoder
  - `src/components/TextEncoder.js`, `src/components/ImageEncoder.js`, `src/components/JwtDecoder.js`
  - `src/App.css` with tool-style tabbed UI
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

All code must be functional.
```

18.
```
Create a full-stack developer tool named "color_palette_generator" under the target directory.
Generate color palettes for UI development.

**Backend (FastAPI):**
- Folder `backend/` with:
  - `main.py` with `/generate`, `/complement`, `/shades` endpoints
  - `colors.py` for color manipulation (HSL, RGB, Hex conversions)
  - `requirements.txt` (fastapi, uvicorn)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios, react-colorful)
  - `src/App.js` with color picker, generated palette display, CSS export
  - `src/components/ColorPicker.js`, `src/components/PaletteDisplay.js`
  - `src/App.css` with clean design tool styling
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Export CSS variables and Tailwind config.
```

19.
```
Create a full-stack developer tool named "markdown_preview" under the target directory.
Live markdown editor with GitHub-flavored markdown support.

**Backend (Flask):**
- Folder `backend/` with:
  - `app.py` with `/render` endpoint converting markdown to HTML
  - Support GFM (tables, code blocks, task lists)
  - `requirements.txt` (flask, flask-cors, markdown, pygments)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `src/App.js` with split-pane editor and live preview
  - `src/components/Editor.js`, `src/components/Preview.js`
  - `src/App.css` with GitHub markdown styling
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Generate complete editor with syntax highlighting for code blocks.
```

20.
```
Create a full-stack developer tool named "lorem_ipsum_generator" under the target directory.
Generate placeholder content for developers.

**Backend (FastAPI):**
- Folder `backend/` with:
  - `main.py` with `/generate` endpoint (paragraphs, sentences, words, names, emails)
  - `generators.py` with various content generators
  - `requirements.txt` (fastapi, uvicorn, faker)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `src/App.js` with type selector, count input, generated content, copy button
  - `src/components/GeneratorForm.js`, `src/components/OutputDisplay.js`
  - `src/App.css` with minimal developer UI
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Support: Lorem Ipsum, Names, Emails, Addresses, UUIDs.
```

21.
```
Create a full-stack developer tool named "http_status_reference" under the target directory.
An interactive HTTP status code reference for developers.

**Backend (Node.js + Express):**
- Folder `backend/` with:
  - `server.js` with `/status/:code` returning details
  - `statuses.js` containing all HTTP status codes with descriptions and use cases
  - `package.json` (express, cors)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `src/App.js` with searchable status code list, category filters (1xx, 2xx, 3xx, 4xx, 5xx)
  - `src/components/StatusCard.js`, `src/components/CategoryFilter.js`
  - `src/App.css` with color-coded categories
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

All code must be functional.
```

22.
```
Create a full-stack developer tool named "timestamp_converter" under the target directory.
Convert between Unix timestamps and human-readable dates.

**Backend (FastAPI):**
- Folder `backend/` with:
  - `main.py` with `/to-unix`, `/from-unix`, `/now` endpoints
  - Support multiple formats and timezones
  - `requirements.txt` (fastapi, uvicorn, pytz)
  - `README.md`

**Frontend (React):**
- Folder `frontend/` with:
  - `package.json` (react, axios)
  - `src/App.js` with bidirectional converter, timezone selector, current time display
  - `src/components/TimestampInput.js`, `src/components/DateOutput.js`
  - `src/App.css` with clean utility styling
  - `README.md`

**Root Files:**
- `.gitignore`
- `docker-compose.yml`

Generate complete working converter.
```
