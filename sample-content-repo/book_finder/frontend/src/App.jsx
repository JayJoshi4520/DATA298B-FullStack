import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import About from './pages/About';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">📚 BookFinder</div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/search" className="nav-link">Search</Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>&copy; 2023 Book Finder App</p>
      </footer>
    </div>
  );
}

export default App;