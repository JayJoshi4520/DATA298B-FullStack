#!/usr/bin/env python3
import os
import json
from pathlib import Path

"""
This script generates a basic full-stack "weather_dashboard" project with React frontend and Flask backend,
containerized with Docker Compose.
"""

def create_file(path, content):
    """
    Creates a file with the given content, including creating necessary directories.

    Args:
        path (str): The path to the file to be created.
        content (str): The content to be written to the file.
    """
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Created: {path}")
    except Exception as e:
        print(f"✗ Error creating {path}: {str(e)}")

def main():
    """
    Generates the weather_dashboard project structure and necessary files.
    """
    base_path = "/home/coder/project/"
    project_name = "weather_dashboard"
    project_path = os.path.join(base_path, project_name)

    print(f"Creating {project_name} at: {project_path}")

    # Create directories
    frontend_dir = os.path.join(project_path, "frontend")
    backend_dir = os.path.join(project_path, "backend")
    frontend_src_dir = os.path.join(frontend_dir, "src")
    frontend_public_dir = os.path.join(frontend_dir, "public")

    try:
        os.makedirs(frontend_src_dir, exist_ok=True)
        os.makedirs(frontend_public_dir, exist_ok=True)
        os.makedirs(backend_dir, exist_ok=True)
        print("✓ Created directories")
    except Exception as e:
        print(f"✗ Error creating directories: {str(e)}")
        return False

    # Create .gitignore
    gitignore_content = """node_modules
__pycache__
.env
"""
    create_file(os.path.join(project_path, ".gitignore"), gitignore_content)

    # Create .env.example
    env_example_content = """OWM_API_KEY=YOUR_OPENWEATHERMAP_API_KEY
REACT_APP_BACKEND_URL=http://localhost:5000
"""
    create_file(os.path.join(project_path, ".env.example"), env_example_content)

    # Create docker-compose.yml
    docker_compose_content = """version: "3.8"
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:5000
    volumes:
      - ./frontend:/app
      - /app/node_modules
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - OWM_API_KEY=${OWM_API_KEY}
    volumes:
      - ./backend:/app
"""
    create_file(os.path.join(project_path, "docker-compose.yml"), docker_compose_content)

    # Frontend files
    frontend_package_json_content = """{
  "name": "weather_dashboard_frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "axios": "^1.6.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "dev": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
"""
    create_file(os.path.join(frontend_dir, "package.json"), frontend_package_json_content)

    frontend_index_html_content = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Weather Dashboard App"
    />
    <title>Weather Dashboard</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
"""
    create_file(os.path.join(frontend_public_dir, "index.html"), frontend_index_html_content)

    frontend_app_css_content = """
.App {
  text-align: center;
  padding: 20px;
}

.weather-card {
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  width: 300px;
  border-radius: 5px;
}

.weather-card h2 {
  margin-top: 0;
}
"""
    create_file(os.path.join(frontend_src_dir, "App.css"), frontend_app_css_content)

    frontend_app_js_content = """import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/weather?city=${city}`
      );
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setWeatherData(response.data);
      setError('');
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError('Error fetching weather data. Please check the city name and your internet connection.');
      setWeatherData(null);
    }
  };

  return (
    <div className="App">
      <h1>Weather Dashboard</h1>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {weatherData && (
        <div className="weather-card">
          <h2>{weatherData.city}</h2>
          <p>Temperature: {weatherData.temperature}°C</p>
          <p>Humidity: {weatherData.humidity}%</p>
          <p>Description: {weatherData.description}</p>
        </div>
      )}
    </div>
  );
}

export default App;
"""
    create_file(os.path.join(frontend_src_dir, "App.js"), frontend_app_js_content)

    frontend_index_js_content = """import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"""
    create_file(os.path.join(frontend_src_dir, "index.js"), frontend_index_js_content)

    frontend_readme_content = """# Weather Dashboard Frontend

This is the frontend for the Weather Dashboard application.

## Setup

1.  Make sure you have Node.js and npm installed.
2.  Navigate to the `frontend` directory: `cd frontend`
3.  Install the dependencies: `npm install`

## Environment Variables

The application uses environment variables for configuration.  If you have a `.env` file in the root directory, make sure to source it before running the application.

## Running the Application

1.  Start the development server: `npm run dev`
2.  Open your browser and go to `http://localhost:3000`
"""
    create_file(os.path.join(frontend_dir, "README.md"), frontend_readme_content)

    # Backend files
    backend_app_py_content = """from flask import Flask, request, jsonify
import requests
import os
from flask_cors import CORS
from requests.exceptions import RequestException

app = Flask(__name__)
CORS(app)

OWM_API_KEY = os.environ.get('OWM_API_KEY')

@app.route('/weather')
def get_weather():
    '''
    Fetches weather data from OpenWeatherMap API based on the city provided in the request.
    Returns the data as a JSON response.
    '''
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required'}), 400

    try:
        url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OWM_API_KEY}&units=metric'
        response = requests.get(url)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        data = response.json()

        if data['cod'] != 200:
            return jsonify({'error': data['message'}]), data['cod']

        weather_data = {
            'city': data['name'],
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'description': data['weather'][0]['description']
        }
        return jsonify(weather_data)

    except RequestException as e:
        print(f"API Request failed: {e}")
        return jsonify({'error': 'Failed to connect to weather API'}), 500
    except (KeyError, TypeError) as e:
        print(f"Error processing API response: {e}")
        return jsonify({'error': 'Error processing weather data'}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
"""
    create_file(os.path.join(backend_dir, "app.py"), backend_app_py_content)

    backend_requirements_content = """flask==3.0.0
requests==2.31.0
Flask-Cors==4.0.0
"""
    create_file(os.path.join(backend_dir, "requirements.txt"), backend_requirements_content)

    backend_readme_content = """# Weather Dashboard Backend

This is the backend for the Weather Dashboard application.

## Setup

1.  Make sure you have Python 3.6+ installed.
2.  Navigate to the `backend` directory: `cd backend`
3.  Create a virtual environment: `python -m venv venv`
4.  Activate the virtual environment:
    *   On Windows: `venv\\Scripts\\activate`
    *   On macOS and Linux: `source venv/bin/activate`
5.  Install the dependencies: `pip install -r requirements.txt`
6.  Set the environment variable `OWM_API_KEY`. You can obtain an API key from [OpenWeatherMap](https://openweathermap.org/).

## Running the Application

1.  Run the Flask application: `python app.py`
2.  The API will be available at `http://localhost:5000`
"""
    create_file(os.path.join(backend_dir, "README.md"), backend_readme_content)

    # Dockerfiles
    frontend_dockerfile_content = """
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
"""
    create_file(os.path.join(frontend_dir, "Dockerfile"), frontend_dockerfile_content)

    backend_dockerfile_content = """
FROM python:3.9-slim-buster

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
"""
    create_file(os.path.join(backend_dir, "Dockerfile"), backend_dockerfile_content)


    print("✓ Project created successfully!")
    print("\nNext steps:")
    print(f"1. cd {project_path}")
    print("2. cd frontend && npm install")
    print("3. cd ../backend && pip install -r requirements.txt")
    print("4. cd .. && docker-compose up --build")

    return True

if __name__ == "__main__":
    main()
