<script setup>
import { ref } from 'vue';
import axios from 'axios';

const inputText = ref('');
const prediction = ref(null);
const loading = ref(false);
const training = ref(false);
const errorMsg = ref('');

const API_URL = 'http://localhost:8000';

const predict = async () => {
  if (!inputText.value) return;
  
  loading.value = true;
  errorMsg.value = '';
  prediction.value = null;

  try {
    const response = await axios.post(`${API_URL}/predict`, {
      text: inputText.value
    });
    prediction.value = response.data;
  } catch (err) {
    console.error(err);
    errorMsg.value = 'Failed to connect to backend.';
  } finally {
    loading.value = false;
  }
};

const retrain = async () => {
  training.value = true;
  errorMsg.value = '';
  try {
    const response = await axios.post(`${API_URL}/train`);
    alert(`Training Complete! Loss: ${response.data.metrics.loss.toFixed(4)}`);
  } catch (err) {
    errorMsg.value = 'Training failed.';
  } finally {
    training.value = false;
  }
};
</script>

<template>
  <div class="container">
    <div class="card">
      <h1>Tiny Sentiment App</h1>
      <p class="subtitle">Enter text to detect sentiment (Positive/Negative)</p>

      <div class="input-group">
        <textarea 
          v-model="inputText" 
          placeholder="Type something... (e.g., 'The movie was terrible')"
          rows="3"
        ></textarea>
      </div>

      <div class="actions">
        <button @click="predict" :disabled="loading || !inputText" class="btn-primary">
          {{ loading ? 'Analyzing...' : 'Predict Sentiment' }}
        </button>
        
        <button @click="retrain" :disabled="training" class="btn-secondary">
          {{ training ? 'Training...' : 'Retrain Model' }}
        </button>
      </div>

      <div v-if="errorMsg" class="error">
        {{ errorMsg }}
      </div>

      <div v-if="prediction" class="result" :class="prediction.sentiment.toLowerCase()">
        <h2>{{ prediction.sentiment }}</h2>
        <p>Confidence: {{ (prediction.score * 100).toFixed(1) }}%</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 500px;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

h1 {
  margin-top: 0;
  color: #1a1a1a;
  text-align: center;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 1.5rem;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.result {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.positive {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.negative {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.error {
  margin-top: 1rem;
  color: #dc2626;
  text-align: center;
}
</style>