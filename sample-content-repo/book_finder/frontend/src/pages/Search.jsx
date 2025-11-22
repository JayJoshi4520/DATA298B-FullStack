import React, { useState } from 'react';
import axios from 'axios';

function Search() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use Vite environment variable or default
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const searchBooks = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setBooks([]);

    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { query: query }
      });
      setBooks(response.data.results);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch books. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container search-page">
      <h2>Find a Book</h2>
      <form onSubmit={searchBooks} className="search-form">
        <input
          type="text"
          placeholder="Enter title, author, or ISBN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="results-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <div className="book-thumb-container">
              {book.thumbnail ? (
                <img src={book.thumbnail} alt={book.title} className="book-thumb" />
              ) : (
                <div className="no-thumb">No Image</div>
              )}
            </div>
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="author">{book.authors.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>
      
      {!loading && books.length === 0 && query && !error && (
          <p className="no-results">No results found for "{query}".</p>
      )}
    </div>
  );
}

export default Search;