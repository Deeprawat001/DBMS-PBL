// client/src/services/mlService.js
// Set the API BASE URL using the environment variable or hardcode it for testing
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'; 

/**
 * Fetches the 10-day ML weather forecast by sending data to the Node.js proxy.
 * This function must match what is called in WaypointWeatherDisplay.jsx.
 */
export async function predictWaypoints(waypoints, days, apiKey) {
    // The component only sends ONE waypoint at a time, so we process the first one.
    const waypoint = waypoints[0];

    // Node proxy route: /api/waypoint/forecast (as per your architecture plan)
    const url = `${API_BASE}/api/waypoint/forecast`; 

    const payload = {
        waypoint_id: waypoint.id, // e.g., "1-wp-19" (string)
        lat: waypoint.lat,
        lon: waypoint.lon,
        // The Python model expects 'history', so send an empty object if not provided
        history: waypoint.history || {} 
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(`Prediction API failed: ${res.status} ${JSON.stringify(json)}`);
    }

    // The component expects the response to be wrapped in { results: [...] }
    return { results: [json] };
}