import os
import sqlite3
import click
from flask import Flask, jsonify, request, g
from flask.cli import with_appcontext
from flask_cors import CORS
from dotenv import load_dotenv
from models import get_all_workouts, add_workout

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
# Use instance folder for the database, a Flask best practice
app.config['DATABASE'] = os.getenv('DATABASE_PATH', 'instance/fitness.db')

# Enable CORS for all routes, allowing requests from our frontend
CORS(app, resources={r"/*": {"origins": "*"}})

# --- Database Connection Management ---

def get_db():
    """
    Gets the database connection for the current application context.
    If a connection doesn't exist, it creates one.
    """
    if 'db' not in g:
        try:
            db_path = app.config['DATABASE']
            # Ensure the instance directory exists
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            g.db = sqlite3.connect(
                db_path,
                detect_types=sqlite3.PARSE_DECLTYPES
            )
            g.db.row_factory = sqlite3.Row
        except sqlite3.Error as e:
            app.logger.error(f"Database connection error: {e}")
            raise
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    """Closes the database connection at the end of the request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

# --- Database Initialization Command ---

def init_db():
    """Initializes the database schema from schema.sql."""
    try:
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()
    except Exception as e:
        click.echo(f"Failed to initialize database: {e}")
        raise

@app.cli.command('init-db')
@with_appcontext
def init_db_command():
    """CLI command to initialize the database."""
    init_db()
    click.echo('Initialized the database.')

# --- API Routes ---

@app.route('/workouts', methods=['GET'])
def list_workouts():
    """Endpoint to get all workouts."""
    try:
        db = get_db()
        workouts = get_all_workouts(db)
        return jsonify(workouts), 200
    except Exception as e:
        app.logger.error(f"Error fetching workouts: {e}")
        return jsonify({'error': 'An internal server error occurred'}), 500

@app.route('/workouts', methods=['POST'])
def create_workout():
    """Endpoint to add a new workout."""
    data = request.get_json()
    if not data or not all(k in data for k in ('exercise_name', 'duration_minutes', 'calories_burned')):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        exercise_name = data['exercise_name']
        duration_minutes = int(data['duration_minutes'])
        calories_burned = int(data['calories_burned'])

        db = get_db()
        new_workout = add_workout(db, exercise_name, duration_minutes, calories_burned)
        if new_workout is None:
            return jsonify({'error': 'Failed to create and retrieve workout'}), 500
            
        return jsonify(new_workout), 201
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid data type for duration or calories.'}), 400
    except Exception as e:
        app.logger.error(f"Error creating workout: {e}")
        return jsonify({'error': 'An internal server error occurred'}), 500

if __name__ == '__main__':
    # This block is for running the app directly for local development (e.g., without gunicorn)
    # Note: `flask init-db` must be run first.
    app.run(host='0.0.0.0', port=8000, debug=True)