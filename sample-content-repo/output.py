#!/usr/bin/env python3
"""
Refactoring Script for Book Finder Application.
Migrates frontend to Vite + React Router and ensures production-ready configuration.
"""

import os
import json

def create_file(path, content):
    """Creates a file with the given content, ensuring parent directories exist."""
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content.strip())
        print(f"✓ Created: {path}")
    except Exception as e:
        print(f"✗ Error creating {path}: {str(e)}")

def main():
    base_path = "/home/coder/project/"
    project_name = "book_finder"
    project_path = os.path.join(base_path, project_name)
    
    print(f"Refactoring project '{project_name}' at: {project_path}")
    print("Applying changes: Vite migration, React Router implementation, directory restructuring.")
    
    # ---------------------------------------------------------
    # ROOT CONFIGURATION
    # ---------------------------------------------------------
    
    # .gitignore (Updated for Vite dist folder)
    gitignore_content = """
node_modules/
__pycache__/
*.pyc
.env
.DS_Store
build/
dist/
.coverage
"""
    create_file(os.path.join(project_path, ".gitignore"), gitignore_content)

    # .env.example (Updated variable prefix for Vite)
    env_example_content = """
VITE_API_URL=http://localhost:8000
"""
    create_file(os.path.join(project_path, ".env.example"), env_example_content)

    # docker-compose.yml (Updated frontend command and ports)
    docker_compose_content = """
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
    # Required for Docker hot reloading
    stdin_open: true
    tty: true
"""
    create_file(os.path.join(project_path, "docker-compose.yml"), docker_compose_content)

    # ---------------------------------------------------------
    # BACKEND FILES (FastAPI)
    # ---------------------------------------------------------

    backend_reqs = """
fastapi==0.104.1
uvicorn==0.24.0
requests==2.31.0
"""
    create_file(os.path.join(project_path, "backend/requirements.txt"), backend_reqs)

    backend_main = """
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"

@app.get("/")
def read_root():
    return {"message": "Welcome to the Book Finder API"}

@app.get("/search")
def search_books(query: str = Query(..., min_length=1)):
    # Search for books using the Google Books API.
    params = {"q": query}
    try:
        logger.info(f"Searching for: {query}")
        response = requests.get(GOOGLE_BOOKS_API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        items = data.get("items", [])
        results = []
        for item in items:
            info = item.get("volumeInfo", {})
            image_links = info.get("imageLinks", {})
            thumbnail = image_links.get("thumbnail", "") if image_links else ""
            
            # Fallback for missing authors
            authors = info.get("authors", ["Unknown Author"])
            
            results.append({
                "id": item.get("id"),
                "title": info.get("title", "Unknown Title"),
                "authors": authors,
                "description": info.get("description", "No description available."),
                "thumbnail": thumbnail
            })
            
        return {"results": results}
    except requests.RequestException as e:
        logger.error(f"External API error: {e}")
        raise HTTPException(status_code=503, detail="External API unavailable")
    except Exception as e:
        logger.error(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
"""
    create_file(os.path.join(project_path, "backend/main.py"), backend_main)

    backend_dockerfile = """
FROM python:3.9-slim

WORKDIR /app

# Prevent Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
# Prevent Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
    create_file(os.path.join(project_path, "backend/Dockerfile"), backend_dockerfile)

    backend_readme = """
# Book Finder Backend

FastAPI service acting as a proxy to the Google Books API.

## Setup
1. `pip install -r requirements.txt`
2. `uvicorn main:app --reload`
3. Open `http://localhost:8000/docs` for Swagger UI.
"""
    create_file(os.path.join(project_path, "backend/README.md"), backend_readme)

    # ---------------------------------------------------------
    # FRONTEND FILES (Vite + React Router)
    # ---------------------------------------------------------

    # 1. package.json with Vite and Router
    frontend_package = {
      "name": "book-finder-frontend",
      "version": "0.1.0",
      "type": "module",
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
        "preview": "vite preview"
      },
      "dependencies": {
        "axios": "^1.6.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.20.0"
      },
      "devDependencies": {
        "@types/react": "^18.2.37",
        "@types/react-dom": "^18.2.15",
        "@vitejs/plugin-react": "^4.2.0",
        "eslint": "^8.53.0",
        "eslint-plugin-react": "^7.33.2",
        "eslint-plugin-react-hooks": "^4.6.0",
        "eslint-plugin-react-refresh": "^0.4.4",
        "vite": "^5.0.0"
      }
    }
    create_file(os.path.join(project_path, "frontend/package.json"), json.dumps(frontend_package, indent=2))

    # 2. vite.config.js
    vite_config = """
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose to network (essential for Docker)
    port: 3000, // Match the port in docker-compose
    watch: {
      usePolling: true // Often required for Docker volumes on Windows/Mac
    }
  }
})
"""
    create_file(os.path.join(project_path, "frontend/vite.config.js"), vite_config)

    # 3. index.html (Moved to root of frontend for Vite)
    frontend_index_html = """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Book Finder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""
    create_file(os.path.join(project_path, "frontend/index.html"), frontend_index_html)

    # 4. src/main.jsx (Entry point)
    frontend_main_jsx = """
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
"""
    create_file(os.path.join(project_path, "frontend/src/main.jsx"), frontend_main_jsx)

    # 5. src/App.jsx (Routing Layout)
    frontend_app_jsx = """
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import About from './pages/About';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">📚 BookFinder</div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/search" className="nav-link">Search</Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>&copy; 2023 Book Finder App</p>
      </footer>
    </div>
  );
}

export default App;
"""
    create_file(os.path.join(project_path, "frontend/src/App.jsx"), frontend_app_jsx)

    # 6. src/pages/Home.jsx
    frontend_home_jsx = """
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page-container home-page">
      <h1>Welcome to Book Finder</h1>
      <p className="subtitle">Discover your next favorite read with our powerful search engine.</p>
      
      <div className="cta-container">
        <Link to="/search" className="cta-button">Start Searching</Link>
      </div>
    </div>
  );
}

export default Home;
"""
    create_file(os.path.join(project_path, "frontend/src/pages/Home.jsx"), frontend_home_jsx)

    # 7. src/pages/About.jsx
    frontend_about_jsx = """
import React from 'react';

function About() {
  return (
    <div className="page-container about-page">
      <h1>About Us</h1>
      <p>
        Book Finder is a modern React application designed to help users explore the vast library of the Google Books API.
      </p>
      <p>
        Built with:
      </p>
      <ul className="tech-list">
        <li><strong>Frontend:</strong> React, Vite, React Router</li>
        <li><strong>Backend:</strong> Python, FastAPI</li>
        <li><strong>Infrastructure:</strong> Docker</li>
      </ul>
    </div>
  );
}

export default About;
"""
    create_file(os.path.join(project_path, "frontend/src/pages/About.jsx"), frontend_about_jsx)

    # 8. src/pages/Search.jsx (The main logic)
    frontend_search_jsx = """
import React, { useState } from 'react';
import axios from 'axios';

function Search() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use Vite environment variable or default
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const searchBooks = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setBooks([]);

    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { query: query }
      });
      setBooks(response.data.results);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch books. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container search-page">
      <h2>Find a Book</h2>
      <form onSubmit={searchBooks} className="search-form">
        <input
          type="text"
          placeholder="Enter title, author, or ISBN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="results-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <div className="book-thumb-container">
              {book.thumbnail ? (
                <img src={book.thumbnail} alt={book.title} className="book-thumb" />
              ) : (
                <div className="no-thumb">No Image</div>
              )}
            </div>
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="author">{book.authors.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>
      
      {!loading && books.length === 0 && query && !error && (
          <p className="no-results">No results found for "{query}".</p>
      )}
    </div>
  );
}

export default Search;
"""
    create_file(os.path.join(project_path, "frontend/src/pages/Search.jsx"), frontend_search_jsx)

    # 9. src/App.css
    frontend_app_css = """
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --bg-color: #f8f9fa;
  --text-color: #333;
  --card-bg: #fff;
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-color);
  margin: 0;
  color: var(--text-color);
  line-height: 1.6;
}

/* Layout & Navigation */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: var(--card-bg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--secondary-color);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: var(--secondary-color);
  font-weight: 600;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary-color);
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page-container {
  text-align: center;
}

/* Home Page */
.home-page h1 {
  font-size: 3rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.cta-button {
  display: inline-block;
  background: var(--primary-color);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 2rem;
  transition: transform 0.2s, background-color 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
  background-color: #2980b9;
}

/* About Page */
.about-page {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
}

.tech-list {
  list-style-type: none;
  padding: 0;
}

.tech-list li {
  background: white;
  padding: 0.5rem 1rem;
  margin: 0.5rem 0;
  border-radius: 4px;
  border-left: 4px solid var(--primary-color);
}

/* Search Page Components */
.search-form {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-form input {
  padding: 12px 20px;
  width: 100%;
  max-width: 400px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.search-form input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.search-form button {
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.search-form button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: inline-block;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.book-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
}

.book-thumb-container {
  height: 200px;
  background: #f1f2f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.book-thumb {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.no-thumb {
  color: #95a5a6;
  font-size: 0.9rem;
}

.book-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-info h3 {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  color: var(--secondary-color);
  line-height: 1.4;
}

.book-info .author {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin: auto 0 0 0;
}

.footer {
  text-align: center;
  padding: 2rem;
  color: #95a5a6;
  font-size: 0.9rem;
  margin-top: auto;
}
"""
    create_file(os.path.join(project_path, "frontend/src/App.css"), frontend_app_css)

    # 10. frontend/Dockerfile (Updated for Vite)
    frontend_dockerfile = """
FROM node:18-alpine

WORKDIR /app

# Install dependencies first to cache layer
COPY package.json .
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start Vite development server
CMD ["npm", "run", "dev"]
"""
    create_file(os.path.join(project_path, "frontend/Dockerfile"), frontend_dockerfile)

    # 11. frontend/README.md
    frontend_readme = """
# Book Finder Frontend

Modern React application built with Vite and React Router.

## Tech Stack
- **Vite**: Next Generation Frontend Tooling
- **React Router v6**: Client-side routing
- **Axios**: HTTP Client

## Development
1. `npm install`
2. `npm run dev` (Runs on port 3000)

## Docker
The Dockerfile maps internal port 3000 to host port 3000.
"""
    create_file(os.path.join(project_path, "frontend/README.md"), frontend_readme)

    print("\n✓ Refactoring complete!")
    print("Next steps:")
    print(f"1. cd {project_path}")
    print("2. docker-compose down -v (if previously running)")
    print("3. docker-compose up --build")
    print("4. Open http://localhost:3000")

if __name__ == "__main__":
    main()
