<template>
  <div>
    <h2>My Recent Workouts</h2>
    <div v-if="loading" class="loading">Loading workouts...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="workouts.length" class="workout-list">
      <div v-for="workout in workouts" :key="workout.id" class="workout-card">
        <h3>{{ workout.type }}</h3>
        <p><strong>Duration:</strong> {{ workout.duration }} minutes</p>
        <p><strong>Calories Burned:</strong> {{ workout.calories }} kcal</p>
        <p><strong>Date:</strong> {{ new Date(workout.date).toLocaleDateString() }}</p>
      </div>
    </div>
    <div v-else class="content-card">
      <p>No workouts found. Time to get active!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const workouts = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchWorkouts = async () => {
  try {
    // The Nginx reverse proxy forwards this request to the 'backend' service.
    const response = await axios.get('/api/workouts');
    workouts.value = response.data;
  } catch (err) {
    console.error("Failed to fetch workouts:", err);
    error.value = "Could not load workout data. Please ensure the backend service is running and accessible.";
  } finally {
    loading.value = false;
  }
};

// Fetch data when the component is first mounted
onMounted(() => {
  fetchWorkouts();
});
</script>