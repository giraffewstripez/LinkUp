const API_URL = "https://your-render-service-name.onrender.com/events";

const manhattanContainer = document.querySelector(".Manhattan");
const brooklynContainer = document.querySelector(".Brooklyn");

fetch(API_URL)
  .then(response => response.json())
  .then(events => {
    manhattanContainer.innerHTML = "";
    brooklynContainer.innerHTML = "";

    events.forEach(event => {
      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = `<h2>${event.name}</h2>`;

      const borough = event.borough?.trim().toLowerCase();

      if (borough === "manhattan") {
        manhattanContainer.appendChild(card);
      } else if (borough === "brooklyn") {
        brooklynContainer.appendChild(card);
      }
    });
  })
  .catch(error => console.error("Error loading events:", error));