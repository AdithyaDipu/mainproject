import React, { useState, useEffect } from "react";

const WeatherLocation = ({ onWeatherData }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Automatically fetch on load

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser.");
          setLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const apiKey = "866888b944d4f11f8ece25aae6bc09ef"; // Replace with your API key
            const apiUrl = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${latitude},${longitude}`;

            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch weather data.");

            const data = await response.json();
            if (data.error) throw new Error(data.error.info);

            // Extract Rainfall, Temperature, Humidity
            const weatherDetails = {
              temperature: data.current.temperature,
              humidity: data.current.humidity,
              rainfallPercentage: data.current.precip, // Use actual precipitation data
            };

            console.log("Weather data fetched:", weatherDetails); // Debugging log

            // Update local state to display fetched data
            setWeatherData(weatherDetails);

            // Send data to the parent (App.jsx or CropRecommendation.jsx)
            onWeatherData(weatherDetails);
            setError(null);
          },
          (geoError) => {
            setError(`Error getting location: ${geoError.message}`);
            setLoading(false);
          }
        );
      } catch (err) {
        setError(`An unexpected error occurred: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather(); // Automatically fetch weather on component mount
  }, []); // Empty dependency array ensures it runs only once

  return (
    <div>
      <h1>Weather Details</h1>

      {loading && <p>Fetching weather data...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Show fetched weather data before passing it */}
      {weatherData && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
          <h2>Fetched Weather Data:</h2>
          <p><strong>Temperature:</strong> {weatherData.temperature}°C</p>
          <p><strong>Humidity:</strong> {weatherData.humidity}%</p>
          <p><strong>Rainfall:</strong> {weatherData.rainfallPercentage} mm</p>
        </div>
      )}
    </div>
  );
};

export default WeatherLocation;
