// In-memory data store to simulate a database
let tasks = [
    { id: 1, title: 'Learn Express.js', completed: false, createdAt: new Date() },
    { id: 2, title: 'Build a REST API', completed: true, createdAt: new Date() },
    { id: 3, title: 'Deploy the application', completed: false, createdAt: new Date() }
];
let nextId = 4;

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
exports.getAllTasks = (req, res) => {
    res.status(200).json(tasks);
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Public
exports.getTaskById = (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Public
exports.createTask = (req, res) => {
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
        return res.status(400).json({ message: 'Title is required and must be a string' });
    }

    const newTask = { 
        id: nextId++, 
        title: title.trim(), 
        completed: false,
        createdAt: new Date()
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Public
exports.updateTask = (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    const { title, completed } = req.body;
    const task = tasks[taskIndex];

    if (title !== undefined) {
        task.title = title;
    }
    if (completed !== undefined) {
        task.completed = completed;
    }
    
    tasks[taskIndex] = task;

    res.status(200).json(task);
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Public
exports.deleteTask = (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== taskId);

    if (tasks.length === initialLength) {
        return res.status(404).json({ message: 'Task not found' });
    }

    res.status(204).send(); // 204 No Content
};