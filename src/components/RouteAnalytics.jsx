import React, { useState, useEffect } from 'react';
import './RouteAnalytics.css';

// Keep the same distance utility so results are IDENTICAL.
// Do NOT import routes from the file anymore.
import { calculateRouteDistance } from '../data/routes';

/**
 * RouteAnalytics
 * Props:
 *  - waypointData: object keyed by `${route.id}-waypoint-${index}` with { weather, ocean, timestamp, ... }
 */
export default function RouteAnalytics({ waypointData = {} }) {
  const [selectedRouteForCalculation, setSelectedRouteForCalculation] = useState(null);

  // NEW: routes now come from API instead of file
  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setRoutesLoading(true);
        setRoutesError(null);
        const res = await fetch('http://localhost:4000/api/routes');
        if (!res.ok) throw new Error(`Failed to load routes: ${res.status} ${res.statusText}`);
        const data = await res.json();
        if (!alive) return;

        // Expecting array of routes with { id, name, color, style, coordinates }
        setRoutes(Array.isArray(data) ? data : []);

        // If a route was selected earlier and still exists in new list, keep it
        if (selectedRouteForCalculation) {
          const match = (Array.isArray(data) ? data : []).find(
            r => r.id === selectedRouteForCalculation.id
          );
          setSelectedRouteForCalculation(match || null);
        }
      } catch (e) {
        if (!alive) return;
        setRoutesError(e.message || 'Failed to load routes');
        setRoutes([]);
        setSelectedRouteForCalculation(null);
      } finally {
        if (alive) setRoutesLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []); // fetch once on mount

  // Matches your original logic
  const calculateRouteMetrics = (route) => {
    if (!route) return null;

    const totalDistance = calculateRouteDistance(route.coordinates);
    const baseSpeed = 20; // knots
    const baseFuelPerDay = 175; // tons/day

    // Average weather from waypointData
    let totalWindSpeed = 0;
    let totalWaveHeight = 0;
    let waypointCount = 0;

    route.coordinates.forEach((coord, index) => {
      const waypointId = `${route.id}-waypoint-${index}`;
      const waypointInfo = waypointData[waypointId];

      if (waypointInfo && waypointInfo.weather && waypointInfo.ocean) {
        totalWindSpeed += waypointInfo.weather.wind?.speed || 0;
        totalWaveHeight += parseFloat(waypointInfo.ocean.waveHeight) || 0;
        waypointCount++;
      }
    });

    const avgWindSpeed = waypointCount > 0 ? totalWindSpeed / waypointCount : 10;
    const avgWaveHeight = waypointCount > 0 ? totalWaveHeight / waypointCount : 1.5;

    // Speed adjustment
    let speedAdjustment = 1.0;
    if (avgWindSpeed > 15) speedAdjustment *= 0.9;
    else if (avgWindSpeed > 10) speedAdjustment *= 0.95;
    if (avgWaveHeight > 3) speedAdjustment *= 0.8;
    else if (avgWaveHeight > 2) speedAdjustment *= 0.9;
    if (route.style === 'dashed') speedAdjustment *= 0.95;

    const adjustedSpeed = baseSpeed * speedAdjustment;
    const travelTimeHours = totalDistance / (adjustedSpeed * 1.852); // knots -> km/h
    const travelTimeDays = travelTimeHours / 24;

    // Fuel adjustment
    let fuelAdjustment = 1.0;
    if (avgWindSpeed > 15) fuelAdjustment *= 1.15;
    if (avgWaveHeight > 3) fuelAdjustment *= 1.2;
    if (route.style === 'dashed') fuelAdjustment *= 1.05;

    const totalFuel = baseFuelPerDay * travelTimeDays * fuelAdjustment;

    return {
      totalDistance,
      baseSpeed,
      adjustedSpeed,
      travelTimeHours,
      travelTimeDays,
      totalFuel,
      avgWindSpeed,
      avgWaveHeight,
      speedAdjustment,
      fuelAdjustment,
      baseFuelPerDay,
    };
  };

  return (
    <div className="ra-container">
      <h3 className="ra-title">🚢 Route Analytics</h3>

      {/* Route Selection */}
      <div className="ra-select-wrap">
        <label className="ra-select-label">
          Select Route for Analysis:
        </label>

        <select
          className="ra-select"
          value={selectedRouteForCalculation?.id || ''}
          onChange={(e) => {
            const route = routes.find(r => r.id === parseInt(e.target.value, 10));
            setSelectedRouteForCalculation(route || null);
          }}
          disabled={routesLoading || !!routesError}
        >
          <option value="">
            {routesLoading ? 'Loading routes...' : routesError ? 'Failed to load routes' : 'Choose a route...'}
          </option>
          {!routesLoading && !routesError && routes.map(route => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </select>
      </div>

      {/* Route Metrics Display */}
      {selectedRouteForCalculation ? (
        <div>
          <div
            className="ra-metrics-frame"
            style={{
              background: `linear-gradient(135deg, ${selectedRouteForCalculation.color}15, ${selectedRouteForCalculation.color}05)`,
              border: `2px solid ${selectedRouteForCalculation.color}30`
            }}
          >
            <h4
              className="ra-metrics-title"
              style={{ color: selectedRouteForCalculation.color }}
            >
              {selectedRouteForCalculation.name}
            </h4>

            {(() => {
              const metrics = calculateRouteMetrics(selectedRouteForCalculation);
              if (!metrics) return <div>Loading metrics...</div>;

              return (
                <div className="ra-grid">
                  {/* Distance & Speed */}
                  <div className="ra-card">
                    <h5 className="ra-card-title ra-blue">📏 Distance & Speed</h5>
                    <div className="ra-card-body">
                      <div><strong>Total Distance:</strong> {metrics.totalDistance.toFixed(0)} km</div>
                      <div><strong>Base Speed:</strong> {metrics.baseSpeed} knots</div>
                      <div><strong>Adjusted Speed:</strong> {metrics.adjustedSpeed.toFixed(1)} knots</div>
                      <div><strong>Speed Factor:</strong> {(metrics.speedAdjustment * 100).toFixed(0)}%</div>
                    </div>
                  </div>

                  {/* Travel Time */}
                  <div className="ra-card">
                    <h5 className="ra-card-title ra-green">⏱️ Estimated Travel Time</h5>
                    <div className="ra-card-body">
                      <div><strong>Hours:</strong> {metrics.travelTimeHours.toFixed(1)} hrs</div>
                      <div><strong>Days:</strong> {metrics.travelTimeDays.toFixed(1)} days</div>
                      <div className="ra-pill ra-pill-green">
                        <strong>Estimated Arrival:</strong><br />
                        {new Date(Date.now() + metrics.travelTimeHours * 60 * 60 * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Fuel Consumption */}
                  <div className="ra-card">
                    <h5 className="ra-card-title ra-red">⛽ Fuel Consumption</h5>
                    <div className="ra-card-body">
                      <div><strong>Base Consumption:</strong> {metrics.baseFuelPerDay} tons/day</div>
                      <div><strong>Fuel Factor:</strong> {(metrics.fuelAdjustment * 100).toFixed(0)}%</div>
                      <div><strong>Total Fuel:</strong> {metrics.totalFuel.toFixed(1)} tons</div>
                      <div className="ra-pill ra-pill-red">
                        <strong>Cost Estimate:</strong><br />
                        ${(metrics.totalFuel * 650).toFixed(0)} (at $650/ton)
                      </div>
                    </div>
                  </div>

                  {/* Weather Impact */}
                  <div className="ra-card">
                    <h5 className="ra-card-title ra-orange">🌤️ Weather Impact</h5>
                    <div className="ra-card-body">
                      <div><strong>Avg Wind Speed:</strong> {metrics.avgWindSpeed.toFixed(1)} m/s</div>
                      <div><strong>Avg Wave Height:</strong> {metrics.avgWaveHeight.toFixed(1)}m</div>
                      <div className="ra-pill ra-pill-orange">
                        <strong>Conditions:</strong><br />
                        {metrics.avgWindSpeed > 15 ? '⚠️ High winds' : metrics.avgWindSpeed > 10 ? '⚠️ Moderate winds' : '✅ Favorable winds'}<br />
                        {metrics.avgWaveHeight > 3 ? '⚠️ High waves' : metrics.avgWaveHeight > 2 ? '⚠️ Moderate waves' : '✅ Calm seas'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Recommendations */}
          <div className="ra-reco">
            <h5 className="ra-reco-title">💡 Recommendations</h5>
            <div className="ra-reco-body">
              {(() => {
                const metrics = calculateRouteMetrics(selectedRouteForCalculation);
                if (!metrics) return <div>Loading recommendations...</div>;

                const recommendations = [];
                if (metrics.avgWindSpeed > 15) recommendations.push('• Consider route adjustment for high winds');
                if (metrics.avgWaveHeight > 3) recommendations.push('• Monitor wave conditions closely');
                if (metrics.fuelAdjustment > 1.1) recommendations.push('• Fuel consumption above normal - plan accordingly');
                if (metrics.speedAdjustment < 0.9) recommendations.push('• Speed reduced due to conditions - adjust schedule');
                if (recommendations.length === 0) recommendations.push('• Conditions favorable for optimal performance');

                return recommendations.map((rec, idx) => (
                  <div key={idx} className="ra-reco-item">{rec}</div>
                ));
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="ra-empty">
          <div className="ra-empty-emoji">📊</div>
          <div>Select a route above to view detailed analytics including:</div>
          <div className="ra-empty-bullets">
            • Estimated travel time<br />
            • Fuel consumption<br />
            • Weather impact analysis<br />
            • Cost estimates<br />
            • Route recommendations
          </div>
        </div>
      )}
    </div>
  );
}
