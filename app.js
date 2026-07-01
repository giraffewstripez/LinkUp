const API_URL = "http://localhost:8080/events";

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

      card.innerHTML = `
        <h2>${event.name}</h2>
      `;

      if (event.borough === "Manhattan") {
        manhattanContainer.appendChild(card);
      }

      if (event.borough === "Brooklyn") {
        brooklynContainer.appendChild(card);
      }
    });
  })
  .catch(error => {
    console.error("Error loading events:", error);
  });