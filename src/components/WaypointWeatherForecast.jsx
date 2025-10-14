import React, { useState, useEffect } from 'react';
import { 
    fetchRouteWeatherData, 
    getWeatherIcon, 
    getWindArrow, 
    getDirectionName 
} from '../services/weatherService';

const WaypointWeatherDisplay = ({ routes = [] }) => { 

    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [routeWeatherData, setRouteWeatherData] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const selectedRoute = routes.find(route => route.id === parseInt(selectedRouteId));

    useEffect(() => {
        if (selectedRoute) {
            fetchRouteForecast();
        } else {
            setRouteWeatherData(null);
            setError(null);
        }
    }, [selectedRouteId]);

    const fetchRouteForecast = async () => {
        if (!selectedRoute) return;

        setLoading(true);
        setError(null);
        setRouteWeatherData(null);

        try {
            const coordinatesList = selectedRoute.coordinates;
            const dataArray = await fetchRouteWeatherData(coordinatesList, selectedRoute.id); 

            // Filter for points that successfully returned weather data (not error objects)
            const validDataPoints = dataArray.filter(d => !d.error);

            if (validDataPoints.length > 0) {
                setRouteWeatherData(dataArray);
            } else {
                // If the entire array contains only error objects, throw a global error.
                throw new Error("Failed to retrieve any valid weather data. Check your API key or connection.");
            }
        } catch (err) {
            console.error('Global Fetch Error:', err);
            // Display the specific error message from the service file
            setError(err.message || 'Failed to load real-time data.');
        } finally {
            setLoading(false);
        }
    };

    const handleRouteChange = (e) => {
        setSelectedRouteId(e.target.value);
    };

    return (
        <div style={{
            width: '80%',marginLeft: '170px', // Correct camelCase and colon
    marginRight: '1px', background: '#fff', borderRadius: '12px', padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', boxSizing: 'border-box', marginTop: '20px'
        }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#217A8A', fontSize: '1.3rem', textAlign: 'center' }}>
                Current Weather Conditions Across Route Waypoints
            </h3>

            {/* Route Dropdown */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#34495e' }}>Select Route:</label>
                    <select 
                        value={selectedRouteId} 
                        onChange={handleRouteChange} 
                        style={{ width: '300px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: '#f8f9fa' }}
                    >
                        <option value="">Choose a route...</option>
                        {routes.map(route => (
                            <option key={route.id} value={route.id}>{route.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
                        🚢 Fetching weather for all {selectedRoute?.coordinates.length || 0} waypoints...
                    </div>
                </div>
            )}

            {/* Error State: Shows specific error message from the service */}
            {error && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
                    <div style={{ fontSize: '16px', marginBottom: '10px' }}>❌ Data Fetch Failed!</div>
                    <div style={{ fontSize: '14px', marginBottom: '15px', padding: '10px', background: '#ffebee', border: '1px solid #d32f2f', borderRadius: '6px' }}>
                        {error}
                    </div>
                    <button onClick={fetchRouteForecast} style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Retry Fetch</button>
                </div>
            )}

            {/* Route Weather Display (Scrollable Grid) */}
            {routeWeatherData && !loading && !error && (
                <div style={{ padding: '10px 0' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#0056b3', textAlign: 'center', fontSize: '1.2rem' }}>
                        Weather Report for "{selectedRoute.name}"
                    </h4>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        gap: '15px',
                        maxHeight: '60vh', 
                        overflowY: 'auto',
                        padding: '10px'
                    }}>
                        {routeWeatherData.map((data) => (
                            <RouteWaypointCard 
                                key={data.waypointId} 
                                data={data} 
                                waypointIndex={data.index + 1} 
                                routeColor={selectedRoute.color} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            {!selectedRouteId && !routeWeatherData && (
                <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚓</div>
                    <div>Select a route above to load the **real-time** current weather for all its waypoints.</div>
                </div>
            )}

            <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
        </div>
    );
};

// --------------------------------------------------------------------------------
// Helper Card Component for individual waypoint display
// --------------------------------------------------------------------------------

const RouteWaypointCard = ({ data, waypointIndex, routeColor }) => {
    
    // Displays error object if real data fetch failed for this specific point
    if (data.error) {
        return (
            <div style={{ padding: '15px', background: '#ffebeb', borderRadius: '10px', border: '2px dashed #f44336', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <div style={{ fontWeight: 'bold', color: '#d32f2f', marginBottom: '5px' }}>Waypoint {waypointIndex}</div>
                <div style={{ fontSize: '30px', margin: '5px 0' }}>🚨</div>
                <div style={{ fontSize: '12px', color: '#d32f2f', marginTop: '5px' }}>
                    {data.error}
                </div>
            </div>
        );
    }
    
    const { weather, ocean, coordinates } = data;
    const weatherMain = weather.weather?.[0];
    
    return (
        <div style={{
            padding: '15px', background: '#f8f9fa', borderRadius: '10px', 
            border: `2px solid ${routeColor || '#ccc'}`, textAlign: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
            <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '5px', 
                color: '#217A8A', 
                borderBottom: '1px solid #eee', 
                paddingBottom: '5px' 
            }}>
                Waypoint {waypointIndex} 
                {waypointIndex === 1 && ' (Start)'}
                {coordinates && waypointIndex === coordinates.length && ' (End)'}
            </div>
            
            <div style={{ fontSize: '30px', margin: '5px 0' }}>
                {getWeatherIcon(weatherMain?.icon)}
            </div>
            
            <div style={{ fontSize: '14px', color: '#555', marginBottom: '10px' }}>
                {weatherMain?.description.replace(/\b\w/g, l => l.toUpperCase())}
            </div>

            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d9534f', marginBottom: '10px' }}>
                {weather.main.temp.toFixed(0)}°C
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '12px', color: '#666' }}>
                <DetailItem label="Wind" value={`${getWindArrow(weather.wind.deg)} ${weather.wind.speed.toFixed(1)} m/s`} icon="💨" />
                <DetailItem label="Waves" value={`${ocean.waveHeight.toFixed(1)} m`} icon="🌊" />
                <DetailItem label="Current" value={`${ocean.currentSpeed.toFixed(1)} m/s`} icon="⛴️" />
                <DetailItem label="Water Temp" value={`${ocean.waterTemp.toFixed(1)}°C`} icon="🌡️" />
            </div>
            <div style={{ fontSize: '10px', color: '#999', marginTop: '10px' }}>
                 [{coordinates[0].toFixed(2)}, {coordinates[1].toFixed(2)}]
            </div>
        </div>
    );
};


// DetailItem Helper
const DetailItem = ({ label, value, icon }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
        <span style={{ fontWeight: '500', color: '#34495e' }}>{icon} {label}:</span>
        <span style={{ fontWeight: 'bold', color: '#007bff' }}>{value}</span>
    </div>
);

export default WaypointWeatherDisplay;
