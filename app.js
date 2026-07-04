const API_URL = "https://linkup-7s4g.onrender.com/events";

const categoryColors = {
    "Queer Centered": "#87D46E",
    "POC Dominated": "#F56C9A",
    "Young & Turnt": "#F8FADE",
    "Family Oriented": "#17278F"
};

function makeCategoryDots(categoryString) {
    if (!categoryString || categoryString.trim() === "") return "";

    return categoryString
        .split(",")
        .map(category => category.trim())
        .filter(category => categoryColors[category])
        .map(category => {
            const color = categoryColors[category];
            return `
                <span
                    class="category-dot"
                    style="background-color:${color}; border:2px solid ${color};">
                </span>
            `;
        })
        .join("");
}

function openPopup(event) {
    document.getElementById("popup-name").textContent = event.name || "";
    document.getElementById("popup-description").textContent = event.description || "No description available.";
    document.getElementById("popup-date").textContent = event.eventDate || "TBA";
    document.getElementById("popup-time").textContent = `${event.startTime || "TBA"} - ${event.endTime || "TBA"}`;
    document.getElementById("popup-location").textContent = event.location || "TBA";
    document.getElementById("popup-cost").textContent = event.cost === 0 ? "Free" : `$${event.cost}`;

    const popupUrl = document.getElementById("popup-url");

    if (event.url) {
        popupUrl.href = event.url;
        popupUrl.style.display = "inline-block";
    } else {
        popupUrl.style.display = "none";
    }

    document.getElementById("event-popup").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    const manhattanContainer = document.querySelector(".Manhattan");
    const brooklynContainer = document.querySelector(".Brooklyn");

    const popup = document.getElementById("event-popup");
    const closePopup = document.getElementById("close-popup");

    closePopup.addEventListener("click", () => {
        popup.classList.add("hidden");
    });

    popup.addEventListener("click", event => {
        if (event.target === popup) {
            popup.classList.add("hidden");
        }
    });

    fetch(API_URL)
        .then(response => response.json())
        .then(events => {
            manhattanContainer.innerHTML = "";
            brooklynContainer.innerHTML = "";

            events.forEach(event => {
                const card = document.createElement("div");
                card.className = "event-card";

                card.innerHTML = `
                    <div class="category-dots">
                        ${makeCategoryDots(event.category)}
                    </div>

                    <h2>${event.name}</h2>
                    <p class="event-date">${event.eventDate || ""}</p>
                `;

                card.addEventListener("click", () => {
                    openPopup(event);
                });

                const borough = event.borough?.trim().toLowerCase();

                if (borough === "manhattan") {
                    manhattanContainer.appendChild(card);
                } else if (borough === "brooklyn") {
                    brooklynContainer.appendChild(card);
                }
            });
        })
        .catch(error => {
            console.error("Error loading events:", error);
        });
});