fetch("http://localhost:8080/events")
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("events");
        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = "<p>No events found in the database yet.</p>";
            return;
        }

        data.forEach(event => {
            const div = document.createElement("div");
            div.className = "event";
            div.innerHTML = `
                <h3>${event.name}</h3>
                <p>${event.eventDate || ""} | ${event.startTime || ""}</p>
                <p>${event.borough || ""} - ${event.location || ""}</p>
                <p>${event.description || ""}</p>
                <p>Cost: $${event.cost}</p>
            `;
            container.appendChild(div);
        });
    })
    .catch(error => {
        document.getElementById("events").innerHTML = "Could not load events. Make sure the backend is running.";
        console.error(error);
    });
