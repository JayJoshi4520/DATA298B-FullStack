import React from 'react';

function WorkoutCard({ workout }) {
    const formattedDate = new Date(workout.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="workout-card">
            <h3>{workout.exercise_name}</h3>
            <p><strong>Duration:</strong> {workout.duration_minutes} minutes</p>
            <p><strong>Calories Burned:</strong> {workout.calories_burned} kcal</p>
            <p className="date">Logged on: {formattedDate}</p>
        </div>
    );
}


function WorkoutList({ workouts }) {
  if (!workouts || workouts.length === 0) {
    return <p>No workouts logged yet. Add one above!</p>;
  }

  return (
    <div className="workouts-list">
      {workouts.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}

export default WorkoutList;