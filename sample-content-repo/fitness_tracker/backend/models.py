def get_all_workouts(db_conn):
    """Fetches all workout records from the database using the provided connection."""
    workouts = db_conn.execute(
        'SELECT id, exercise_name, duration_minutes, calories_burned, created_at FROM workouts ORDER BY created_at DESC'
    ).fetchall()
    return [dict(row) for row in workouts]


def add_workout(db_conn, exercise_name, duration_minutes, calories_burned):
    """Adds a new workout record to the database using the provided connection."""
    cursor = db_conn.cursor()
    cursor.execute(
        'INSERT INTO workouts (exercise_name, duration_minutes, calories_burned) VALUES (?, ?, ?)',
        (exercise_name, duration_minutes, calories_burned)
    )
    new_id = cursor.lastrowid
    db_conn.commit()

    # Fetch the newly created workout to return it with all fields (like created_at)
    new_workout_row = db_conn.execute(
        'SELECT * FROM workouts WHERE id = ?', (new_id,)
    ).fetchone()
    
    return dict(new_workout_row) if new_workout_row else None