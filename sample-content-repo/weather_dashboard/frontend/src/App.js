import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
 const backendUrl = process.env.REACT_APP_BACKEND_URL||"http://localhost:5000";
  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/weather?city=${city}`
      );
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setWeatherData(response.data);
      setError('');
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError('Error fetching weather data. Please check the city name and your internet connection.');
      setWeatherData(null);
    }
  };

  return (
    <div className="App">
      <h1>Weather Dashboard</h1>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {weatherData && (
        <div className="weather-card">
          <h2>{weatherData.city}</h2>
          <p>Temperature: {weatherData.temperature}°C</p>
          <p>Humidity: {weatherData.humidity}%</p>
          <p>Description: {weatherData.description}</p>
        </div>
      )}
    </div>
  );
}

export default App;
