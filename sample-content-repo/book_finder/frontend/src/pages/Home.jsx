import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page-container home-page">
      <h1>Welcome to Book Finder</h1>
      <p className="subtitle">Discover your next favorite read with our powerful search engine.</p>
      
      <div className="cta-container">
        <Link to="/search" className="cta-button">Start Searching</Link>
      </div>
    </div>
  );
}

export default Home;