import React from 'react';

function About() {
  return (
    <div className="page-container about-page">
      <h1>About Us</h1>
      <p>
        Book Finder is a modern React application designed to help users explore the vast library of the Google Books API.
      </p>
      <p>
        Built with:
      </p>
      <ul className="tech-list">
        <li><strong>Frontend:</strong> React, Vite, React Router</li>
        <li><strong>Backend:</strong> Python, FastAPI</li>
        <li><strong>Infrastructure:</strong> Docker</li>
      </ul>
    </div>
  );
}

export default About;