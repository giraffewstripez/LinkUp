const API_URL = "https://linkup-7s4g.onrender.com/events";

const manhattanContainer = document.querySelector(".Manhattan");
const brooklynContainer = document.querySelector(".Brooklyn");

const popup = document.querySelector("#event-popup");
const closePopup = document.querySelector("#close-popup");

let allEvents = [];
let activeCategory = null;

const categoryFilters = {
    circle1: "Queer Centered",
    circle2: "POC Dominated",
    circle3: "Young & Turnt",
    circle4: "Family Oriented"
};

const categoryColors = {
    "Queer Centered": "#87D46E",
    "POC Dominated": "#F56C9A",
    "Young & Turnt": "#F8FADE",
    "Family Oriented": "#17278F"
};

fetch(API_URL)
    .then(response => response.json())
    .then(events => {
        allEvents = sortEvents(events);
        displayEvents(allEvents);
        setupCircleFilters();
    })
    .catch(error => console.error("Error loading events:", error));

function sortEvents(events) {
    return [...events].sort((a, b) => {
        return new Date(a.eventDate) - new Date(b.eventDate);
    });
}

function displayEvents(events) {
    manhattanContainer.querySelectorAll(".event-card").forEach(card => card.remove());
    brooklynContainer.querySelectorAll(".event-card").forEach(card => card.remove());

    events.forEach(event => {
        const card = createEventCard(event);
        const borough = String(event.borough || "").toLowerCase();

        if (borough === "manhattan") {
            manhattanContainer.appendChild(card);
        } else if (borough === "brooklyn") {
            brooklynContainer.appendChild(card);
        }
    });
}

function createEventCard(event) {
    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
        <div class="category-dots">
            ${getCategoryDots(event.category)}
        </div>
        <h2>${event.name || "Untitled Event"}</h2>
        <p class="event-date">${formatDate(event.eventDate)}</p>
    `;

    card.addEventListener("click", () => openPopup(event));

    return card;
}

function getCategoryDots(categoryText = "") {
    return Object.entries(categoryColors)
        .filter(([category]) =>
            categoryText.toLowerCase().includes(category.toLowerCase())
        )
        .map(([, color]) =>
            `<span class="category-dot" style="background-color: ${color};"></span>`
        )
        .join("");
}

function setupCircleFilters() {
    Object.entries(categoryFilters).forEach(([circleClass, category]) => {
        const circle = document.querySelector(`.${circleClass}`);
        if (!circle) return;

        circle.style.cursor = "pointer";

        circle.addEventListener("click", () => {
            if (activeCategory === category) {
                activeCategory = null;
                displayEvents(allEvents);
                return;
            }

            activeCategory = category;

            const filteredEvents = allEvents.filter(event => {
                return String(event.category || "")
                    .toLowerCase()
                    .includes(category.toLowerCase());
            });

            displayEvents(filteredEvents);
        });
    });
}

function openPopup(event) {
    document.querySelector("#popup-name").textContent = event.name || "Untitled Event";
    document.querySelector("#popup-description").textContent = event.description || "No description available.";
    document.querySelector("#popup-date").textContent = formatDate(event.eventDate);
    document.querySelector("#popup-time").textContent = `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
    document.querySelector("#popup-location").textContent = event.location || "Location unavailable";
    document.querySelector("#popup-cost").textContent = formatCost(event.cost);

    const popupUrl = document.querySelector("#popup-url");

    if (event.url) {
        popupUrl.href = event.url;
        popupUrl.style.display = "inline-block";
    } else {
        popupUrl.style.display = "none";
    }

    popup.classList.remove("hidden");
}

closePopup.addEventListener("click", () => {
    popup.classList.add("hidden");
});

popup.addEventListener("click", event => {
    if (event.target === popup) {
        popup.classList.add("hidden");
    }
});

function formatDate(dateString) {
    if (!dateString) return "Date unavailable";

    const date = new Date(`${dateString}T00:00:00`);

    if (isNaN(date)) return dateString;

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function formatTime(timeString) {
    if (!timeString) return "";

    const pieces = String(timeString).split(":");

    if (pieces.length < 2) return timeString;

    const date = new Date();
    date.setHours(Number(pieces[0]));
    date.setMinutes(Number(pieces[1]));

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

function formatCost(cost) {
    if (cost === null || cost === undefined || cost === "") {
        return "Cost unavailable";
    }

    if (Number(cost) === 0) {
        return "Free";
    }

    return `$${Number(cost).toFixed(2)}`;
}