fetch("http://localhost:8080/events")
    .then(res => res.json())
    .then(data => {

        const container = document.getElementById("events");

        data.forEach(event => {
            const div = document.createElement("div");
            div.className = "event";

            div.innerHTML = `
                <h3>${event.name}</h3>
                <p>${event.eventDate} | ${event.startTime}</p>
                <p>${event.borough} - ${event.location}</p>
                <p>${event.description}</p>
                <p>Cost: $${event.cost}</p>
            `;

            container.appendChild(div);
        });
    });