import React, { useState, useEffect } from 'react';
    import './App.css';

    function App() {
      // Load todos from local storage or use a default array
      const [todos, setTodos] = useState(() => {
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          return JSON.parse(savedTodos);
        } else {
          return [
            { id: 1, text: 'Learn React', completed: true },
            { id: 2, text: 'Build a Todo App', completed: false },
          ];
        }
      });
      const [input, setInput] = useState('');

      // Save todos to local storage whenever they change
      useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos));
      }, [todos]);

      const handleInputChange = (e) => {
        setInput(e.target.value);
      };

      const handleAddTodo = (e) => {
        e.preventDefault();
        if (input.trim() === '') return;
        setTodos([
          ...todos,
          { id: Date.now(), text: input, completed: false }
        ]);
        setInput('');
      };

      const toggleTodo = (id) => {
        setTodos(
          todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          )
        );
      };

      const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
      };

      return (
        <div className="app-container">
          <div className="todo-app">
            <h1>Todo List</h1>
            <form onSubmit={handleAddTodo} className="todo-form">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Add a new todo..."
                className="todo-input"
              />
              <button type="submit" className="todo-button">Add</button>
            </form>
            <ul className="todo-list">
              {todos.map(todo => (
                <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                  <span onClick={() => toggleTodo(todo.id)} className="todo-text">
                    {todo.text}
                  </span>
                  <button onClick={() => deleteTodo(todo.id)} className="delete-button">✕</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    export default App;