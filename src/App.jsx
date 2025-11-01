import React, { useState, useEffect } from "react";
import SimpleMap from "./SimpleMap";
import "./App.css";
import { routes as maritimeRoutes } from './data/routes'; 
import WaypointWeatherDisplay from "./components/WaypointWeatherForecast"; 


function App() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // You can set isLoading to false immediately as there is no async data fetching here
  useEffect(() => {
    console.log('App component mounted. Routes data loaded:', maritimeRoutes.length);
    setIsLoading(false);
  }, []);

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'red',
        background: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1>Error Loading Application</h1>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        background: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1>Loading Maritime Application...</h1>
        <p>Please wait while the application initializes.</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Maritime Trade Routes - World Map</h1>
        <p>
          Historic maritime trade routes connecting Alexandria to major global ports across all continents
        </p>
      </div>
      <div className="main-content">
        <SimpleMap />
      </div>

      <div className="Down">
          {/* 2. PASS THE ROUTES PROP: Pass the imported route data to the component. */}
          <WaypointWeatherDisplay routes={maritimeRoutes} />
      </div>

      <div className="footer">
        &copy; 2025 Maritime Shipping Routes. Interactive visualization of global shipping routes.
      </div>
    </div>
  );
}

export default App;