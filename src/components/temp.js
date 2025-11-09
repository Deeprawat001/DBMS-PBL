const apiKey = "a18086c37ce56f30541b14a9dca07475"; // your key
const city = "Dehradun"; // ✅ define a city first

const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log("✅ API Data:", data);
  })
  .catch(error => {
    console.error("❌ Error fetching data:", error);
  });
