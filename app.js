const API_URL = "http://localhost:8080/events";

fetch(API_URL)
  .then(response => response.json())
  .then(events => {
    console.log(events);

    const manhattanContainer = document.querySelector(".Manhattan");
    const brooklynContainer = document.querySelector(".Brooklyn");

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