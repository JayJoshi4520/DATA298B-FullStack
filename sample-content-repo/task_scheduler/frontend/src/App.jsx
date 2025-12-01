import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Plus, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask }),
      });
      const data = await response.json();
      setTasks([...tasks, data]);
      setNewTask('');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const toggleTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/toggle`, {
        method: 'PUT',
      });
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
        Task Scheduler
      </h1>

      {/* Add Task Form */}
      <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a new task..."
          style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }}
        />
        <button 
          type="submit"
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} /> Add
        </button>
      </form>

      {/* Error State */}
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
          Error: {error}. Is the backend running?
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        /* Task List */
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.length === 0 ? (
            <li style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>No tasks found. Add one above!</li>
          ) : (
            tasks.map(task => (
              <li 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px', 
                  marginBottom: '8px', 
                  backgroundColor: task.status === 'completed' ? '#f9fafb' : '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {task.status === 'completed' ? 
                  <CheckCircle color="#10b981" /> : 
                  <Circle color="#d1d5db" />
                }
                <span style={{ 
                  flex: 1, 
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  color: task.status === 'completed' ? '#9ca3af' : '#374151'
                }}>
                  {task.title}
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default App
