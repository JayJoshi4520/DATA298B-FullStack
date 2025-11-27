import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import WorkoutForm from '../components/WorkoutForm';

// The backend service is available at this URL from within the Docker network
const API_URL = '/api/workouts';

function DashboardPage() {
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState(null);

  const fetchWorkouts = useCallback(async () => {
    try {
      console.log('Fetching workouts from:', API_URL);
      const response = await axios.get(API_URL);
      setWorkouts(response.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setError(null);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Could not connect to the backend. Please ensure the backend container is running and check the browser console for more details.');
      setWorkouts([]); 
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const handleAddWorkout = async (workoutData) => {
    try {
      const response = await axios.post(API_URL, workoutData);
      // Add new workout and re-sort the list by date
      const updatedWorkouts = [response.data, ...workouts]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setWorkouts(updatedWorkouts);
      setError(null);
    } catch (err) {
      console.error('Error adding workout:', err);
      setError('Failed to add workout. Please try again.');
    }
  };

  return (
    <div>
      <h1>Workout Dashboard</h1>
      <WorkoutForm onAddWorkout={handleAddWorkout} />
      
      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

      <h2>Recent Activities</h2>
      <div className="workouts-list">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <div key={workout.id} className="workout-item">
              <h3>{workout.type}</h3>
              <p>Duration: {workout.duration} minutes</p>
              <p>Date: {new Date(workout.date).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          !error && <p>No workouts logged yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;