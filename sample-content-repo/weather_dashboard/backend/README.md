# Weather Dashboard Backend

This is the backend for the Weather Dashboard application.

## Setup

1.  Make sure you have Python 3.6+ installed.
2.  Navigate to the `backend` directory: `cd backend`
3.  Create a virtual environment: `python -m venv venv`
4.  Activate the virtual environment:
    *   On Windows: `venv\Scripts\activate`
    *   On macOS and Linux: `source venv/bin/activate`
5.  Install the dependencies: `pip install -r requirements.txt`
6.  Set the environment variable `OWM_API_KEY`. You can obtain an API key from [OpenWeatherMap](https://openweathermap.org/).

## Running the Application

1.  Run the Flask application: `python app.py`
2.  The API will be available at `http://localhost:5000`
