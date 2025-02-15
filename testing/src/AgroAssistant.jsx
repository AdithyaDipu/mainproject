import React, { useState } from "react";
import WeatherLocation from "./weather";
import CropRecommendation from "./temp";

function AgroAssistant() {
  const [weatherData, setWeatherData] = useState(null);

  return (
    <div>
      <h1>Smart Agro Assistant</h1>
      <WeatherLocation onWeatherData={setWeatherData} />
      {weatherData && <CropRecommendation weatherData={weatherData} />}
    </div>
  );
}

export default AgroAssistant;
