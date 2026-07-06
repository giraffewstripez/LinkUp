const API_URL = "https://linkup-7s4g.onrender.com/events";

const manhattanContainer = document.querySelector(".Manhattan");
const brooklynContainer = document.querySelector(".Brooklyn");

const popup = document.querySelector("#event-popup");
const closePopup = document.querySelector("#close-popup");

let allEvents = [];
let activeCategory = null;

const categoryFilters = {
    cat1: "Queer Centered",
    cat2: "POC Dominated",
    cat3: "Young & Turnt",
    cat4: "Family Oriented"
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
        setupCategoryFilters();
    })
    .catch(error => console.error("Error loading events:", error));

function sortEvents(events) {
    return [...events].sort((a, b) => {
        return getDateValue(a) - getDateValue(b);
    });
}

function getDateValue(event) {
    const date = event.eventDate || event.event_date || event.Event_date || "";
    const time = event.startTime || event.start_time || event.Start_time || "00:00";

    return new Date(`${date}T${time}`).getTime();
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

        <p class="event-date">
            ${formatDate(event.eventDate || event.event_date || event.Event_date)}
        </p>
    `;

    card.addEventListener("click", () => openPopup(event));

    return card;
}

function getCategoryDots(categoryText = "") {
    return Object.entries(categoryColors)
        .filter(([category]) =>
            String(categoryText).toLowerCase().includes(category.toLowerCase())
        )
        .map(([, color]) =>
            `<span class="category-dot" style="background-color: ${color};"></span>`
        )
        .join("");
}

function setupCategoryFilters() {
    Object.entries(categoryFilters).forEach(([catClass, category]) => {
        const catDiv = document.querySelector(`.${catClass}`);

        if (!catDiv) return;

        catDiv.addEventListener("click", () => {
            if (activeCategory === category) {
                activeCategory = null;

                document.querySelectorAll(".cat1, .cat2, .cat3, .cat4").forEach(cat => {
                    cat.classList.remove("active-filter");
                });

                displayEvents(allEvents);
                return;
            }

            activeCategory = category;

            document.querySelectorAll(".cat1, .cat2, .cat3, .cat4").forEach(cat => {
                cat.classList.remove("active-filter");
            });

            catDiv.classList.add("active-filter");

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
    document.querySelector("#popup-name").textContent =
        event.name || "Untitled Event";

    document.querySelector("#popup-description").textContent =
        event.description || "No description available.";

    document.querySelector("#popup-date").textContent =
        formatDate(event.eventDate || event.event_date || event.Event_date);

    const start = formatTime(event.startTime || event.start_time || event.Start_time);
    const end = formatTime(event.endTime || event.end_time || event.End_time);

    document.querySelector("#popup-time").textContent =
        end ? `${start} - ${end}` : start;

    document.querySelector("#popup-location").textContent =
        event.location || "Location unavailable";

    document.querySelector("#popup-cost").textContent =
        formatCost(event.cost);

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

    const value = Number(cost);

    if (!isNaN(value)) {
        if (value === 0) {
            return "Free";
        }

        return `$${value.toFixed(2)}`;
    }

    return cost;
}