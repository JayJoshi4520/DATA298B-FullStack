-- Drop the table if it exists to ensure a clean slate on initialization.
DROP TABLE IF EXISTS workouts;

-- Create the workouts table.
CREATE TABLE workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    calories_burned INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);