const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// In-memory data store for demonstration
let tasks = [
    { id: 1, title: 'Containerize App', status: 'pending', createdAt: new Date() },
    { id: 2, title: 'Fix Dockerfile', status: 'completed', createdAt: new Date() }
];

// Routes
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newTask = {
        id: tasks.length + 1,
        title,
        status: 'pending',
        createdAt: new Date()
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

app.put('/api/tasks/:id/toggle', (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);

    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.status = task.status === 'pending' ? 'completed' : 'pending';
    res.json(task);
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
