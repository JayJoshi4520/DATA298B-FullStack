import React from 'react';

function AboutPage() {
  return (
    <div>
      <header>
        <h1>About Fitness Tracker</h1>
      </header>
      <div className="workouts-container">
        <p>
          This application is a full-stack solution designed to help you log and track your workouts efficiently.
        </p>
        <p>
          <strong>Tech Stack:</strong>
        </p>
        <ul>
          <li><strong>Frontend:</strong> React (with Vite for bundling) and React Router for navigation.</li>
          <li><strong>Backend:</strong> Flask (Python web framework).</li>
          <li><strong>Database:</strong> SQLite for simple, file-based data storage.</li>
          <li><strong>Containerization:</strong> Docker and Docker Compose for a consistent development environment.</li>
        </ul>
      </div>
    </div>
  );
}

export default AboutPage;