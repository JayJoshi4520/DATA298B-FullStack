require('dotenv').config();
const express = require('express');
const cors = require('cors');
const taskRoutes = require('./src/api/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing
app.use(cors());
// Enable parsing of JSON bodies in requests
app.use(express.json());

// --- API Routes ---
// Mount the task routes under the /api path
app.use('/api', taskRoutes);

// --- Health Check Endpoint ---
app.get('/', (req, res) => {
  res.status(200).send('<h1>Express API is running!</h1>');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});