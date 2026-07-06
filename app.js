const API_URL = "https://linkup-7s4g.onrender.com/events";

const manhattanContainer = document.querySelector(".Manhattan");
const brooklynContainer = document.querySelector(".Brooklyn");

const popup = document.querySelector("#event-popup");
const closePopupButton = document.querySelector("#close-popup");
const popupName = document.querySelector("#popup-name");
const popupDescription = document.querySelector("#popup-description");
const popupDate = document.querySelector("#popup-date");
const popupTime = document.querySelector("#popup-time");
const popupLocation = document.querySelector("#popup-location");
const popupCost = document.querySelector("#popup-cost");
const popupUrl = document.querySelector("#popup-url");

let allEvents = [];
let activeCategory = null;

const categoryFilters = {
    circle1: "Queer Centered",
    circle2: "POC Dominated",
    circle3: "Young & Turnt",
    circle4: "Family Oriented"
};

const categoryDotColors = {
    "Queer Centered": "#87D46E",
    "POC Dominated": "#F56C9A",
    "Young & Turnt": "#F8FADE",
    "Family Oriented": "#17278F"
};

fetch(API_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error("Unable to retrieve events.");
        }
        return response.json();
    })
    .then(events => {
        allEvents = sortEvents(events);
        displayEvents(allEvents);
        setupCircleFilters();
    })
    .catch(error => console.error(error));

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

    clearCards();

    events.forEach(event => {

        const card = createEventCard(event);

        const borough = (event.borough || "").toLowerCase();

        if (borough === "manhattan") {
            manhattanContainer.appendChild(card);
        }

        if (borough === "brooklyn") {
            brooklynContainer.appendChild(card);
        }

    });

}

function clearCards() {

    manhattanContainer.querySelectorAll(".event-card").forEach(card => card.remove());
    brooklynContainer.querySelectorAll(".event-card").forEach(card => card.remove());

}

function createEventCard(event) {

    const card = document.createElement("div");
    card.classList.add("event-card");

    const dots = createCategoryDots(event.category || "");

    card.innerHTML = `
        <div class="category-dots">
            ${dots}
        </div>

        <h2>${event.name}</h2>

        <p class="event-date">
            ${formatDate(event.eventDate || event.event_date || event.Event_date)}
        </p>
    `;

    card.addEventListener("click", () => {
        openPopup(event);
    });

    return card;

}

function createCategoryDots(categoryText) {

    return Object.entries(categoryDotColors)
        .filter(([category]) =>
            categoryText.toLowerCase().includes(category.toLowerCase())
        )
        .map(([, color]) =>
            `<span class="category-dot" style="background-color:${color};"></span>`
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

                document.querySelectorAll(".circle").forEach(c =>
                    c.classList.remove("active-filter")
                );

                displayEvents(allEvents);
                return;
            }

            activeCategory = category;

            document.querySelectorAll(".circle").forEach(c =>
                c.classList.remove("active-filter")
            );

            circle.classList.add("active-filter");

            const filtered = allEvents.filter(event => {

                if (!event.category) return false;

                return event.category
                    .toLowerCase()
                    .includes(category.toLowerCase());

            });

            displayEvents(filtered);

        });

    });

}

function openPopup(event) {

    popupName.textContent = event.name;

    popupDescription.textContent =
        event.description || "No description available.";

    popupDate.textContent = formatDate(
        event.eventDate || event.event_date || event.Event_date
    );

    const start = formatTime(
        event.startTime || event.start_time || event.Start_time
    );

    const end = formatTime(
        event.endTime || event.end_time || event.End_time
    );

    popupTime.textContent =
        end !== "" ? `${start} - ${end}` : start;

    popupLocation.textContent =
        event.location || "Location unavailable";

    popupCost.textContent = formatCost(event.cost);

    if (event.url) {

        popupUrl.href = event.url;
        popupUrl.style.display = "inline-block";

    } else {

        popupUrl.style.display = "none";

    }

    popup.classList.remove("hidden");

}

closePopupButton.addEventListener("click", () => {
    popup.classList.add("hidden");
});

popup.addEventListener("click", e => {

    if (e.target === popup) {

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

    const d = new Date();

    d.setHours(Number(pieces[0]));
    d.setMinutes(Number(pieces[1]));

    return d.toLocaleTimeString([], {
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