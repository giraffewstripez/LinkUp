const API_URL = "https://linkup-7s4g.onrender.com/events";

const manhattanContainer = document.querySelector(".Manhattan");
const brooklynContainer = document.querySelector(".Brooklyn");

let allEvents = [];

const categoryFilters = {
  circle1: "Queer Centered",
  circle2: "POC Dominated",
  circle3: "Young & Turnt",
  circle4: "Family Oriented"
};

fetch(API_URL)
  .then(response => response.json())
  .then(events => {
    allEvents = events.sort((a, b) => {
      return new Date(a.eventDate) - new Date(b.eventDate);
    });

    displayEvents(allEvents);
    setupCircleFilters();
  })
  .catch(error => console.error("Error fetching events:", error));

function displayEvents(events) {
  manhattanContainer.innerHTML = "<h2>Manhattan</h2>";
  brooklynContainer.innerHTML = "<h2>Brooklyn</h2>";

  events.forEach(event => {
    const card = createEventCard(event);

    if (event.borough === "Manhattan") {
      manhattanContainer.appendChild(card);
    } else if (event.borough === "Brooklyn") {
      brooklynContainer.appendChild(card);
    }
  });
}

function createEventCard(event) {
  const card = document.createElement("div");
  card.classList.add("event-card");

  card.innerHTML = `
    <h3>${event.name}</h3>
    <p>${event.eventDate}</p>
  `;

  card.addEventListener("click", () => {
    openEventPopup(event);
  });

  return card;
}

function setupCircleFilters() {
  Object.keys(categoryFilters).forEach(circleClass => {
    const circle = document.querySelector(`.${circleClass}`);

    if (!circle) return;

    circle.addEventListener("click", () => {
      const selectedCategory = categoryFilters[circleClass];

      const filteredEvents = allEvents.filter(event => {
        return event.category &&
          event.category.toLowerCase().includes(selectedCategory.toLowerCase());
      });

      displayEvents(filteredEvents);
    });
  });
}