import axios from 'axios';

// Use the environment variable provided by Vite. Default to localhost for standalone dev.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches all workouts from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of workout objects.
 */
export const getWorkouts = async () => {
  try {
    const response = await apiClient.get('/workouts');
    return response.data;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
};

/**
 * Adds a new workout to the backend.
 * @param {object} workoutData - The workout data to be sent.
 * @returns {Promise<object>} A promise that resolves to the newly created workout object.
 */
export const addWorkout = async (workoutData) => {
  try {
    const response = await apiClient.post('/workouts', workoutData);
    return response.data;
  } catch (error) {
    console.error('Error adding workout:', error);
    throw error;
  }
};