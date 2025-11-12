// const apiKey = "a18086c37ce56f30541b14a9dca07475"; // your key
// const city = "Dehradun"; // ✅ define a city first

// const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

// fetch(url)
//   .then(response => {
//     if (!response.ok) {
//       throw new Error("Network response was not ok: " + response.status);
//     }
//     return response.json();
//   })
//   .then(data => {
//     console.log("✅ API Data:", data);
//   })
//   .catch(error => {
//     console.error("❌ Error fetching data:", error);
//   });

// 1. Define the API endpoint (URL)
// Assuming your API is running on localhost (your machine) at port 4000.
const API_URL = 'http://localhost:4000/api/routes'; 

console.log(`Attempting to fetch data from: ${API_URL}`);

// 2. Use the fetch() function
fetch(API_URL)
  // Step 3: Handle the Response
  // The initial response is a raw HTTP response. We call .json() to parse the body
  // content into a usable JavaScript object (since your API returns JSON data).
  .then(response => {
    // Always check if the request was successful (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  // Step 4: Handle the Data
  // 'data' is the final JavaScript object (e.g., an array of routes or metrics)
  .then(data => {
    console.log("✅ Data successfully received from the database via API:");
    console.log(data); // <-- This line prints the data to your console!
  })
  // Step 5: Handle any Errors
  .catch(error => {
    console.error("❌ There was a problem with the fetch operation:", error.message);
    // Common errors here include:
    // - Network issues (API server not running)
    // - CORS errors (Browser security blocking the request)
    // - Incorrect URL
  });