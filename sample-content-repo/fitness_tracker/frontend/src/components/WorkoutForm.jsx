import React, { useState } from 'react';

function WorkoutForm({ onAddWorkout }) {
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!type || !duration || !date) {
      alert('Please fill out all fields');
      return;
    }
    onAddWorkout({ type, duration, date });
    setType('');
    setDuration('');
  };

  return (
    <form className="workout-form" onSubmit={handleSubmit}>
      <h2>Log New Workout</h2>
      <div className="form-group">
        <label htmlFor="type">Activity Type</label>
        <input
          id="type"
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g., Running, Cycling"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="duration">Duration (minutes)</label>
        <input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g., 30"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn-primary">Add Workout</button>
    </form>
  );
}

export default WorkoutForm;