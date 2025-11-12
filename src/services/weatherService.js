// Weather Service for OpenWeatherMap API
const OPENWEATHER_API_KEY = import.meta.env.VITE_weather_api;

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// --- Utility Functions (Must be defined for core logic) ---
export async function fetchWaypointForecast({ waypointId, lat, lon, history }) {
  const res = await fetch('/api/waypoint/forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      waypoint_id: waypointId ?? 0,
      lat,
      lon,
      history: history ?? {}
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Forecast fetch failed: ' + txt);
  }
  return res.json(); // expected: { waypoint_id, lat, lon, forecast: [ {day_index, temperature_c}, ... ] }
}
const calculateShipSpeedFromWeather = (windSpeed, waveHeight, visibility) => {
    const maxShipSpeed = 25; 
    let speedReduction = 0;
    speedReduction += 0.5 * waveHeight;
    if (windSpeed > 10) speedReduction += 0.1 * (windSpeed - 10);
    if (visibility < 5) speedReduction += (5 - visibility) * 0.5;
    let shipSpeed = maxShipSpeed - speedReduction;
    return Math.max(shipSpeed, 3);
};

const generateOceanData = (weatherData) => {
    const windSpeed = weatherData.wind?.speed || 0;
    const windDirection = weatherData.wind?.deg || 0;
    const airTemp = weatherData.main?.temp || 20;
    const g = 9.81;

    const waveHeight = 0.21 * Math.pow(windSpeed, 2) / g;
    const swellHeight = 0.7 * waveHeight;
    const swellDirection = (windDirection + 15) % 360;
    const currentSpeed = 0.03 * windSpeed;
    const currentDirection = (windDirection + 30) % 360;
    const waterTemp = airTemp - 1.5;

    let visibility = weatherData.visibility ? weatherData.visibility / 1000 : 10;
    const shipSpeed = calculateShipSpeedFromWeather(windSpeed, waveHeight, visibility);

    return {
        waveHeight: Number(waveHeight.toFixed(2)),
        swellHeight: Number(swellHeight.toFixed(2)),
        swellDirection: Math.floor(swellDirection),
        currentSpeed: Number(currentSpeed.toFixed(2)),
        currentDirection: Math.floor(currentDirection),
        waterTemp: Number(waterTemp.toFixed(1)),
        visibility,
        shipSpeed: Number(shipSpeed.toFixed(2)),
    };
};

/**
 * Fetch current weather data for a specific waypoint.
 * THROWS an error if API key is missing or fetch fails. No fallbacks.
 */
export const fetchWaypointWeather = async (coordinates, waypointId) => {
    const [lat, lon] = coordinates;
    
    // 1. Check API Key first
    if (!OPENWEATHER_API_KEY) {
        console.error("API Key is missing for OpenWeatherMap.");
        throw new Error('API Key is missing. Cannot fetch real-time data.');
    }
    
    try {
        const weatherResponse = await fetch(
            `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        
        if (!weatherResponse.ok) {
            // 2. Throw error on bad HTTP status (e.g., 401, 400, 500)
            const errorBody = await weatherResponse.text();
            console.error(`API Fetch Error: ${weatherResponse.status} for ${lat}, ${lon}`, errorBody);
            throw new Error(`OpenWeather API failed: Status ${weatherResponse.status}`);
        }
        
        const weatherData = await weatherResponse.json();
        const oceanData = generateOceanData(weatherData);
        
        return {
            weather: weatherData,
            ocean: oceanData,
            timestamp: new Date().toISOString(),
            waypointId: waypointId,
            coordinates: coordinates
        };
    } catch (error) {
        // Re-throw network/JSON parsing errors, or the specific HTTP status error
        throw error;
    }
};

/**
 * Batch fetch weather data for multiple waypoints and return a clean array.
 * Individual failures are captured as error objects, not thrown globally.
 */
export const fetchRouteWeatherData = async (coordinatesList, routeId) => {
    const promises = coordinatesList.map((coordinates, index) => {
        const waypointId = `${routeId}-waypoint-${index}`;
        
        return fetchWaypointWeather(coordinates, waypointId)
            .then(data => ({
                index: index, 
                coordinates: coordinates,
                ...data
            }))
            .catch(error => {
                // Individual waypoint error handler: returns an error object
                console.warn(`Waypoint ${index + 1} failed to fetch:`, error.message);
                return {
                    index: index,
                    coordinates: coordinates,
                    error: `Data unavailable: ${error.message.substring(0, 50)}...`,
                    timestamp: new Date().toISOString()
                };
            });
    });

    const results = await Promise.all(promises); // Use Promise.all since we are catching errors individually

    // We now have an array of data objects or error objects, sorted by index.
    return results; 
};


// --- Utility Helpers for Display ---

export const getWeatherIcon = (weatherCode) => {
    const iconMap = {
        '01': '☀️', '02': '⛅', '03': '☁️', '04': '☁️', '09': '🌧️', 
        '10': '🌦️', '11': '⛈️', '13': '🌨️', '50': '🌫️'
    };
    const code = weatherCode ? weatherCode.toString().substring(0, 2) : '01';
    return iconMap[code] || '🌤️';
};

export const getWindArrow = (degrees) => {
    const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
    const index = Math.round(degrees / 45) % 8;
    return arrows[index];
};

export const getDirectionName = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
};
