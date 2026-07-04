const API_URL = "https://linkup-7s4g.onrender.com/events";

const categoryColors = {
    "Queer Centered": "#87D46E",
    "POC Dominated": "#F56C9A",
    "Young & Turnt": "#F8FADE",
    "Family Oriented": "#17278F"
};

function makeCategoryDots(categoryString) {

    if (!categoryString || categoryString.trim() === "") {
        return "";
    }

    return categoryString
        .split(",")
        .map(category => category.trim())
        .filter(category => categoryColors.hasOwnProperty(category))
        .map(category => {
            const color = categoryColors[category];

            return `
                <span
                    class="category-dot"
                    style="
                        background-color:${color};
                        border:2px solid ${color};
                    ">
                </span>
            `;
        })
        .join("");
}

const manhattanContainer = document.querySelector(".Manhattan");
const brooklynContainer = document.querySelector(".Brooklyn");

fetch(API_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load events.");
        }
        return response.json();
    })
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
            `;

            const borough = event.borough?.trim().toLowerCase();

            if (borough === "manhattan") {
                manhattanContainer.appendChild(card);
            }
            else if (borough === "brooklyn") {
                brooklynContainer.appendChild(card);
            }

        });

    })
    .catch(error => {
        console.error(error);
    });