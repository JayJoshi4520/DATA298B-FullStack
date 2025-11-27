const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Sample in-memory data
let workouts = [
  { id: 1, type: 'Running', duration: 30, date: '2023-10-27', calories: 300 },
  { id: 2, type: 'Weightlifting', duration: 60, date: '2023-10-26', calories: 400 },
  { id: 3, type: 'Yoga', duration: 45, date: '2023-10-25', calories: 150 }
];

app.get('/api/workouts', (req, res) => {
  console.log('GET /api/workouts - Returning workout list');
  res.json(workouts);
});

app.get('/', (req, res) => {
    res.send('Fitness Tracker API is running!');
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});