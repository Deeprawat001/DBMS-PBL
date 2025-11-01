import React from 'react';
import { calculateWeatherAffectedSpeed } from '../utils/maritimeCalculations';
import { getWindArrow, getDirectionName } from '../services/weatherService';
import "./WeatherSpeedDisplay.css";

const WeatherSpeedDisplay = ({ 
  isSimulationRunning, 
  currentWaypointWeather, 
  shipSpeed, 
  currentWeatherAffectedSpeed 
}) => {
  console.log('WeatherSpeedDisplay props:', {
    isSimulationRunning,
    currentWaypointWeather,
    shipSpeed,
    currentWeatherAffectedSpeed,
    hasWeatherData: !!(currentWaypointWeather && currentWaypointWeather.weather && currentWaypointWeather.ocean)
  });

  if (!isSimulationRunning || !currentWaypointWeather) {
    console.log('WeatherSpeedDisplay: Not showing data because:', {
      isSimulationRunning,
      hasCurrentWaypointWeather: !!currentWaypointWeather
    });
    return (
      <div className="weather-container inactive">
        <div className="weather-header">
          <div className="weather-icon">🌊</div>
          <h4>Weather Speed Impact</h4>
          <div className="weather-subtext">
            Start simulation to see real-time weather effects
          </div>
        </div>
        
        <div className="weather-grid">
          <div><div>💨</div><div>Wind Impact</div></div>
          <div><div>🌊</div><div>Wave Effects</div></div>
          <div><div>⚡</div><div>Power Usage</div></div>
          <div><div>⛽</div><div>Fuel Consumption</div></div>
        </div>
      </div>
    );
  }

  console.log('WeatherSpeedDisplay: Showing weather data');
  
  const weatherFactors = calculateWeatherAffectedSpeed(shipSpeed, currentWaypointWeather, 0);
  const speedImpact = currentWeatherAffectedSpeed - shipSpeed;
  const impactColor = speedImpact >= 0 ? '#4caf50' : '#f44336';
  
  return (
    <div className="weather-container active">
      <h4>🌊 Weather Speed Impact</h4>
      
      <div className={`speed-display ${speedImpact >= 0 ? 'positive' : 'negative'}`}>
        <div className="speed-title">Current Speed Over Ground</div>
        <div className="speed-value" style={{ color: impactColor }}>
          {currentWeatherAffectedSpeed.toFixed(1)} knots
        </div>
        <div className="speed-details">
          <span>Base Speed: <strong>{shipSpeed} kn</strong></span>
          <span>Impact: <strong style={{ color: impactColor }}>{speedImpact >= 0 ? '+' : ''}{speedImpact.toFixed(1)} kn</strong></span>
        </div>
      </div>

      <div className="factors-section">
        <h5>🌤️ Weather Factors</h5>

        <div className="factor-card">
          <div className="factor-header">
            <span>💨 Wind ({getWindArrow(currentWaypointWeather.weather.wind?.deg)} {getDirectionName(currentWaypointWeather.weather.wind?.deg)})</span>
            <span className="wind-value">{currentWaypointWeather.weather.wind?.speed} m/s</span>
          </div>
          <div className="factor-impact">Impact: <strong>{weatherFactors.factors.wind?.speedImpact.toFixed(2)} kn loss</strong></div>
        </div>

        <div className="factor-card">
          <div className="factor-header">
            <span>🌊 Wave Height</span>
            <span className="wave-value">{currentWaypointWeather.ocean.waveHeight}m</span>
          </div>
          <div className="factor-impact">Impact: <strong>{weatherFactors.factors.waves?.speedLoss.toFixed(2)} kn loss</strong></div>
        </div>

        <div className="factor-card">
          <div className="factor-header">
            <span>🌊 Swell ({getWindArrow(currentWaypointWeather.ocean.swellDirection)} {getDirectionName(currentWaypointWeather.ocean.swellDirection)})</span>
            <span className="swell-value">{currentWaypointWeather.ocean.swellHeight}m</span>
          </div>
          <div className="factor-impact">Impact: <strong>{weatherFactors.factors.swell?.speedLoss.toFixed(2)} kn loss</strong></div>
        </div>

        <div className="factor-card">
          <div className="factor-header">
            <span>🌊 Current ({getWindArrow(currentWaypointWeather.ocean.currentDirection)} {getDirectionName(currentWaypointWeather.ocean.currentDirection)})</span>
            <span className="current-value">{currentWaypointWeather.ocean.currentSpeed} kn</span>
          </div>
          <div className="factor-impact">Impact: <strong>{weatherFactors.factors.current?.alongCourse.toFixed(2)} kn</strong></div>
        </div>
      </div>

      <div className="power-fuel-section">
        <h6>⚡ Power & Fuel Impact</h6>
        <div className="power-fuel-grid">
          <div>
            <div>Power Increase</div>
            <div>{weatherFactors.powerIncrease.toFixed(0)} kW</div>
          </div>
          <div>
            <div>Fuel Increase</div>
            <div>{weatherFactors.fuelIncrease.toFixed(0)} kg/h</div>
          </div>
        </div>
      </div>

      <div className="resistance-section">
        <div>Total Resistance: {weatherFactors.totalResistance.toFixed(0)} N</div>
        <div>Combined environmental forces affecting ship performance</div>
      </div>
    </div>
  );
};

export default WeatherSpeedDisplay;