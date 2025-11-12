// import React, { useState, useEffect } from 'react';
// import {
//     fetchRouteWeatherData,
//     getWeatherIcon,
//     getWindArrow,
//     getDirectionName
// } from '../services/weatherService';

// const WaypointWeatherDisplay = ({ routes = [] }) => {

//     const [selectedRouteId, setSelectedRouteId] = useState('');
//     const [routeWeatherData, setRouteWeatherData] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const selectedRoute = routes.find(route => route.id === parseInt(selectedRouteId));

//     useEffect(() => {
//         if (selectedRoute) {
//             fetchRouteForecast();
//         } else {
//             setRouteWeatherData(null);
//             setError(null);
//         }
//     }, [selectedRouteId]);

//     const fetchRouteForecast = async () => {
//         if (!selectedRoute) return;

//         setLoading(true);
//         setError(null);
//         setRouteWeatherData(null);

//         try {
//             const coordinatesList = selectedRoute.coordinates;
//             const dataArray = await fetchRouteWeatherData(coordinatesList, selectedRoute.id);
//             const validDataPoints = dataArray.filter(d => !d.error);

//             if (validDataPoints.length > 0) {
//                 setRouteWeatherData(dataArray);
//             } else {
//                 throw new Error("Failed to retrieve any valid weather data. Check your API key or connection.");
//             }
//         } catch (err) {
//             console.error('Global Fetch Error:', err);
//             setError(err.message || 'Failed to load real-time data.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleRouteChange = (e) => {
//         setSelectedRouteId(e.target.value);
//     };

//     return (
//         <div
//             style={{
//                 width: '95%',
//                 maxWidth: '1350px',
//                 margin: '0px auto',
//                 background: '#fff',
//                 borderRadius: '12px',
//                 padding: '20px',
//                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//                 boxSizing: 'border-box',
//             }}
//         >
//             <h3
//                 style={{
//                     marginBottom: '20px',
//                     color: '#000000ff',
//                     fontSize: '1.3rem',
//                     textAlign: 'center',
//                     lineHeight: '1.4',
//                 }}
//             >
//                 Current Weather Conditions Across Route Waypoints
//             </h3>

//             {/* Route Dropdown */}
//             <div
//                 style={{
//                     marginBottom: '20px',
//                     display: 'flex',
//                     flexWrap: 'wrap',
//                     gap: '15px',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                 }}
//             >
//                 <div style={{ minWidth: '250px', textAlign: 'center' }}>
//                     <label
//                         style={{
//                             display: 'block',
//                             marginBottom: '8px',
//                             fontWeight: '500',
//                             color: '#34495e',
//                         }}
//                     >
//                         Select Route:
//                     </label>
//                     <select
//                         value={selectedRouteId}
//                         onChange={handleRouteChange}
//                         style={{
//                             width: '100%',
//                             padding: '10px',
//                             borderRadius: '6px',
//                             border: '1px solid #ddd',
//                             fontSize: '14px',
//                             backgroundColor: '#f8f9fa',
//                         }}
//                     >
//                         <option value="">Choose a route...</option>
//                         {routes.map((route) => (
//                             <option key={route.id} value={route.id}>
//                                 {route.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//             </div>

//             {/* Loading */}
//             {loading && (
//                 <div style={{ textAlign: 'center', padding: '40px' }}>
//                     <div style={{ fontSize: '16px', color: '#666' }}>
//                         🚢 Fetching weather for all {selectedRoute?.coordinates.length || 0} waypoints...
//                     </div>
//                 </div>
//             )}

//             {/* Error */}
//             {error && (
//                 <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
//                     <div style={{ fontSize: '16px', marginBottom: '10px' }}>❌ Data Fetch Failed!</div>
//                     <div
//                         style={{
//                             fontSize: '14px',
//                             marginBottom: '15px',
//                             padding: '10px',
//                             background: '#ffebee',
//                             border: '1px solid #d32f2f',
//                             borderRadius: '6px',
//                         }}
//                     >
//                         {error}
//                     </div>
//                     <button
//                         onClick={fetchRouteForecast}
//                         style={{
//                             padding: '8px 16px',
//                             background: '#1976d2',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '4px',
//                             cursor: 'pointer',
//                         }}
//                     >
//                         Retry Fetch
//                     </button>
//                 </div>
//             )}

//             {/* Weather Data Grid */}
//             {routeWeatherData && !loading && !error && (
//                 <div style={{ padding: '10px 0' }}>
//                     <h4
//                         style={{
//                             marginBottom: '15px',
//                             color: '#0056b3',
//                             textAlign: 'center',
//                             fontSize: '1.2rem',
//                         }}
//                     >
//                         Weather Report for "{selectedRoute.name}"
//                     </h4>

//                     <div
//                         style={{
//                             display: 'grid',
//                             gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
//                             gap: '15px',
//                             maxHeight: '65vh',
//                             overflowY: 'auto',
//                             padding: '10px',
//                         }}
//                     >
//                         {routeWeatherData.map((data) => (
//                             <RouteWaypointCard
//                                 key={data.waypointId}
//                                 data={data}
//                                 waypointIndex={data.index + 1}
//                                 routeColor={selectedRoute.color}
//                             />
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Instructions */}
//             {!selectedRouteId && !routeWeatherData && (
//                 <div
//                     style={{
//                         textAlign: 'center',
//                         color: '#6c757d',
//                         fontSize: '14px',
//                         lineHeight: '1.6',
//                         padding: '30px 10px',
//                     }}
//                 >
//                     <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚓</div>
//                     <div>
//                         Select a route above to load the <strong>real-time</strong> current weather for all its waypoints.
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// // Card Component
// const RouteWaypointCard = ({ data, waypointIndex, routeColor }) => {
//     if (data.error) {
//         return (
//             <div
//                 style={{
//                     padding: '15px',
//                     background: '#ffebeb',
//                     borderRadius: '10px',
//                     border: '2px dashed #f44336',
//                     textAlign: 'center',
//                     boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
//                 }}
//             >
//                 <div style={{ fontWeight: 'bold', color: '#d32f2f', marginBottom: '5px' }}>
//                     Waypoint {waypointIndex}
//                 </div>
//                 <div style={{ fontSize: '30px', margin: '5px 0' }}>🚨</div>
//                 <div style={{ fontSize: '12px', color: '#d32f2f' }}>{data.error}</div>
//             </div>
//         );
//     }

//     const { weather, ocean, coordinates } = data;
//     const weatherMain = weather.weather?.[0];

//     return (
//         <div
//             style={{
//                 padding: '15px',
//                 background: '#f8f9fa',
//                 borderRadius: '10px',
//                 border: `2px solid ${routeColor || '#ccc'}`,
//                 textAlign: 'center',
//                 boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
//             }}
//         >
//             <div
//                 style={{
//                     fontWeight: 'bold',
//                     marginBottom: '5px',
//                     color: '#217A8A',
//                     borderBottom: '1px solid #eee',
//                     paddingBottom: '5px',
//                 }}
//             >
//                 Waypoint {waypointIndex}
//             </div>

//             <div style={{ fontSize: '30px', margin: '5px 0' }}>
//                 {getWeatherIcon(weatherMain?.icon)}
//             </div>

//             <div style={{ fontSize: '14px', color: '#555', marginBottom: '10px' }}>
//                 {weatherMain?.description.replace(/\b\w/g, (l) => l.toUpperCase())}
//             </div>

//             <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d9534f', marginBottom: '10px' }}>
//                 {weather.main.temp.toFixed(0)}°C
//             </div>

//             <div
//                 style={{
//                     display: 'grid',
//                     gridTemplateColumns: '1fr 1fr',
//                     gap: '5px',
//                     fontSize: '12px',
//                     color: '#666',
//                 }}
//             >
//                 <DetailItem label="Wind" value={`${getWindArrow(weather.wind.deg)} ${weather.wind.speed.toFixed(1)} m/s`} icon="💨" />
//                 <DetailItem label="Waves" value={`${ocean.waveHeight.toFixed(1)} m`} icon="🌊" />
//                 <DetailItem label="Current" value={`${ocean.currentSpeed.toFixed(1)} m/s`} icon="⛴️" />
//                 <DetailItem label="Water Temp" value={`${ocean.waterTemp.toFixed(1)}°C`} icon="🌡️" />
//             </div>

//             <div style={{ fontSize: '10px', color: '#999', marginTop: '10px' }}>
//                 [{coordinates[0].toFixed(2)}, {coordinates[1].toFixed(2)}]
//             </div>
//         </div>
//     );
// };

// const DetailItem = ({ label, value, icon }) => (
//     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
//         <span style={{ fontWeight: '500', color: '#34495e' }}>
//             {icon} {label}:
//         </span>
//         <span style={{ fontWeight: 'bold', color: '#007bff' }}>{value}</span>
//     </div>
// );

// export default WaypointWeatherDisplay;


import React, { useState, useEffect } from 'react';
import {
  fetchRouteWeatherData,
  getWeatherIcon,
  getWindArrow,
  getDirectionName
} from '../services/weatherService';
import { predictWaypoints } from '../services/mlService';
import './WaypointWeatherDisplay.css';

const WaypointWeatherDisplay = ({ routes = [] }) => {
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [routeWeatherData, setRouteWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState('');
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  const selectedRoute = routes.find(route => route.id === parseInt(selectedRouteId, 10));

  useEffect(() => {
    if (selectedRoute) {
      fetchRouteForecast();
    } else {
      setRouteWeatherData(null);
      setError(null);
    }
    setSelectedWaypointIndex('');
    setForecastData(null);
    setForecastError(null);
    setForecastLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRouteId]);

  const fetchRouteForecast = async () => {
    if (!selectedRoute) return;
    setLoading(true);
    setError(null);
    setRouteWeatherData(null);

    try {
      const coordinatesList = selectedRoute.coordinates;
      const dataArray = await fetchRouteWeatherData(coordinatesList, selectedRoute.id);

      const validDataPoints = Array.isArray(dataArray) ? dataArray.filter(d => !d.error) : [];
      if (validDataPoints.length > 0) {
        setRouteWeatherData(dataArray);
      } else {
        throw new Error('Failed to retrieve any valid weather data. Check your API key or connection.');
      }
    } catch (err) {
      console.error('Global Fetch Error:', err);
      setError(err?.message || 'Failed to load real-time data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteChange = (e) => {
    setSelectedRouteId(e.target.value);
  };

  const handleWaypointChange = async (e) => {
    const idx = e.target.value;
    setSelectedWaypointIndex(idx);
    setForecastData(null);
    setForecastError(null);
    if (idx === '' || !selectedRoute) return;
    await fetchWaypointForecast(parseInt(idx, 10));
  };

  // Fetch predictions, override first prediction (Day-1) with current observed value if available
  const fetchWaypointForecast = async (idx) => {
    try {
      setForecastLoading(true);
      setForecastError(null);
      setForecastData(null);

      const coords = selectedRoute.coordinates[idx];
      if (!coords) throw new Error('Invalid waypoint');
      const [lat, lon] = coords;
      const waypoint = { id: `${selectedRoute.id}-wp-${idx}`, lat, lon, offset_days: idx };
      const OPENWEATHER_API_KEY = import.meta.env.VITE_weather_api || null;

      // call ml service
      const resp = await predictWaypoints([waypoint], 10, OPENWEATHER_API_KEY);
      const first = resp?.results?.[0];
      if (!first) throw new Error('No forecast result');
      if (first.error) throw new Error(first.error);

      // pick predictions array (try several names)
      let preds = [];
      if (Array.isArray(first.forecast)) preds = first.forecast.slice();
      else if (Array.isArray(first.predictions)) preds = first.predictions.slice();
      else if (Array.isArray(resp?.predictions)) preds = resp.predictions.slice();

      // ensure at least length 10 (if model returned fewer, we'll keep what it gave)
      // find the current observed object in routeWeatherData
      const currentDataForWaypoint = Array.isArray(routeWeatherData)
        ? routeWeatherData.find(d =>
            (typeof d.index !== 'undefined' && Number(d.index) === Number(idx)) ||
            (d.waypointId && String(d.waypointId) === `${selectedRoute.id}-wp-${idx}`) )
        : null;

      const observedTemp = currentDataForWaypoint?.weather?.main?.temp ?? null;
      const observedDesc = currentDataForWaypoint?.weather?.weather?.[0]?.description ?? null;
      const observedPrecip = currentDataForWaypoint?.weather?.precipitation ?? currentDataForWaypoint?.weather?.rain?.['1h'] ?? currentDataForWaypoint?.ocean?.precipitation_mm ?? null;

      // override first prediction (Day-1 label in UI)
      if (preds.length > 0) {
        const p = preds[0];
        if (observedTemp !== null && observedTemp !== undefined) {
          p.pred_temp = Number(observedTemp);
          p.temperature_c = Number(observedTemp);
          p.temp = Number(observedTemp);
        }
        if (observedDesc && !p.description) p.description = observedDesc;
        if (observedPrecip !== null && typeof p.precipitation_mm === 'undefined') {
          p.precipitation_mm = observedPrecip;
          p.precipitation = observedPrecip;
        }
        if (typeof p.day_index === 'undefined' && !p.date) {
          p.day_index = 0;
          p.date = new Date().toISOString().split('T')[0];
        }
      }

      // set forecastData (we use predictions field as component expects)
      setForecastData({ predictions: preds });
    } catch (e) {
      console.error('fetchWaypointForecast error:', e);
      setForecastError(e?.message || 'Failed to fetch forecast');
    } finally {
      setForecastLoading(false);
    }
  };

  return (
    <div className="ww-container">
      <h3 className="ww-title">Current Weather Conditions Across Route Waypoints</h3>

      <div className="ww-controls">
        <div className="ww-control">
          <label className="ww-label">Select Route:</label>
          <select className="ww-select" value={selectedRouteId} onChange={handleRouteChange}>
            <option value="">Choose a route...</option>
            {routes.map(route => (
              <option key={route.id} value={route.id}>{route.name}</option>
            ))}
          </select>
        </div>

        <div className="ww-control">
          <label className="ww-label">Select Waypoint:</label>
          <select className="ww-select" value={selectedWaypointIndex} onChange={handleWaypointChange} disabled={!selectedRoute}>
            <option value="">Choose a waypoint...</option>
            {selectedRoute?.coordinates?.map((coord, idx) => (
              <option key={`wp-${idx}`} value={idx}>
                {`Waypoint ${idx + 1} [${coord[0].toFixed(2)}, ${coord[1].toFixed(2)}]`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="ww-loading">🚢 Fetching weather for all {selectedRoute?.coordinates?.length || 0} waypoints...</div>}

      {error && (
        <div className="ww-error">
          <div className="ww-error-title">❌ Data Fetch Failed!</div>
          <div className="ww-error-msg">{error}</div>
          <button className="ww-retry" onClick={fetchRouteForecast}>Retry Fetch</button>
        </div>
      )}

      {routeWeatherData && !loading && !error && (
        <div className="ww-grid-section">
          <h4 className="ww-subtitle">Weather Report for "{selectedRoute.name}"</h4>
          <div className="ww-grid">
            {routeWeatherData.map((data) => (
              <RouteWaypointCard
                key={data.waypointId ?? `${data.index}`}
                data={data}
                waypointIndex={(data.index ?? 0) + 1}
                routeColor={selectedRoute.color}
              />
            ))}
          </div>
        </div>
      )}

      {selectedWaypointIndex !== '' && selectedRoute && (
        <div className="ww-forecast-section">
          <h4 className="ww-forecast-title">10-Day Forecast for Waypoint {parseInt(selectedWaypointIndex, 10) + 1}</h4>

          {forecastLoading && <div className="ww-loading">Loading forecast…</div>}
          {forecastError && <div className="ww-error-msg">{forecastError}</div>}
          {forecastData && <ForecastList forecastData={forecastData} />}
        </div>
      )}

      {!selectedRouteId && !routeWeatherData && (
        <div className="ww-empty">
          <div className="ww-anchor">⚓</div>
          <div>Select a route above to load the real-time current weather for all its waypoints.</div>
        </div>
      )}
    </div>
  );
};

// --------------------------------------------------------------------------------
// Card components
// --------------------------------------------------------------------------------
const RouteWaypointCard = ({ data, waypointIndex, routeColor }) => {
  if (data?.error) {
    return (
      <div className="ww-card ww-card-error">
        <div className="ww-card-title">Waypoint {waypointIndex}</div>
        <div className="ww-card-big">🚨</div>
        <div className="ww-card-small">{data.error}</div>
      </div>
    );
  }

  const { weather, ocean, coordinates } = data || {};
  const weatherMain = weather?.weather?.[0] ?? {};

  return (
    <div className="ww-card" style={{ borderColor: routeColor || '#ccc' }}>
      <div className="ww-card-title">Waypoint {waypointIndex}</div>
      <div className="ww-card-icon">{getWeatherIcon(weatherMain.icon)}</div>
      <div className="ww-card-desc">{String(weatherMain.description || '').replace(/\b\w/g, l => l.toUpperCase())}</div>
      <div className="ww-card-temp">{Number(weather?.main?.temp ?? 0).toFixed(0)}°C</div>
      <div className="ww-card-grid">
        <DetailItem label="Wind" value={`${getWindArrow(weather?.wind?.deg ?? 0)} ${Number(weather?.wind?.speed ?? 0).toFixed(1)} m/s`} icon="💨" />
        <DetailItem label="Waves" value={`${Number(ocean?.waveHeight ?? 0).toFixed(1)} m`} icon="🌊" />
        <DetailItem label="Current" value={`${Number(ocean?.currentSpeed ?? 0).toFixed(1)} m/s`} icon="⛴️" />
        <DetailItem label="Water Temp" value={`${Number(ocean?.waterTemp ?? 0).toFixed(1)}°C`} icon="🌡️" />
      </div>
      <div className="ww-card-coords">{coordinates ? `[${Number(coordinates[0]).toFixed(2)}, ${Number(coordinates[1]).toFixed(2)}]` : ''}</div>
    </div>
  );
};

const DetailItem = ({ label, value, icon }) => (
  <div className="ww-detail-item">
    <span className="ww-detail-label">{icon} {label}:</span>
    <span className="ww-detail-value">{value}</span>
  </div>
);

// -------------------------------------------------------------
// ForecastList — Day-1 ... Day10
// -------------------------------------------------------------
// ForecastList — renders Day-1 .. Day10 and ONLY shows day label + temperature
const ForecastList = ({ forecastData }) => {
  const preds = forecastData?.predictions || [];

  // take up to 10 items (0 => Day-1, 1 => Day2, ... 9 => Day10)
  const days = preds.slice(0, 10);

  const getPredTemp = (item) => {
    if (!item) return null;
    return item.pred_temp ?? item.temperature_c ?? item.temp ?? item.predicted_temp ?? null;
  };

  const getLabel = (index) => index === 0 ? 'Day-1' : `Day${index + 1}`;

  if (days.length === 0) {
    return <div className="ww-no-forecast">No forecast data</div>;
  }

  return (
    <div className="ww-forecast-wrap">
      <div className="ww-forecast-header" style={{ textAlign: 'center', marginBottom: 8 }}>Predictions — Day-1 to Day10</div>

      <div className="ww-forecast-grid">
        {days.map((d, i) => {
          const temp = getPredTemp(d);
          return (
            <div className="ww-forecast-card" key={i}>
              <div className="ww-forecast-label">{getLabel(i)}</div>
              <div className="ww-forecast-temp">{temp !== null ? `${Number(temp).toFixed(1)}°C` : '—'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default WaypointWeatherDisplay;
