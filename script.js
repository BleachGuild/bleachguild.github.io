document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault();

    const target = document.querySelector(this.getAttribute('href'));

    if (!target) return;

    const startPosition = window.scrollY;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = 1 - Math.pow(1 - progress, 3);

      window.scrollTo(
        0,
        startPosition + distance * easedProgress
      );

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  });
});
const revealElements = document.querySelectorAll(
  ".section, .activity-card, .event-card, .rule-card, .recruitment-card, .discord-recruitment, .leader-card"
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
     if (entry.isIntersecting) {
  setTimeout(() => {
    entry.target.classList.add("visible");
  }, 50);

  revealObserver.unobserve(entry.target);
}
    });
  },
  {
    threshold: 0.15
  }
);

revealElements.forEach((element) => {
  element.classList.add("reveal");
  revealObserver.observe(element);
});

// Load official guild events from GitHub Pages.
async function loadGuildEvents() {
  const container = document.getElementById("events-list");

  if (!container) return;

  try {
    const response = await fetch(
      `./events.json?v=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const events = await response.json();

    if (!Array.isArray(events)) {
      throw new Error("Invalid events data");
    }

    const upcomingEvents = events
      .filter(event => event.status === "upcoming")
      .sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      );

    container.replaceChildren();

    if (upcomingEvents.length === 0) {
      const message = document.createElement("p");
      message.textContent =
        "Aucun événement à venir pour le moment. Revenez bientôt !";

      container.appendChild(message);
      return;
    }

    upcomingEvents.forEach(event => {
      const card = document.createElement("article");
      card.className = "event-card";

      const content = document.createElement("div");
      content.className = "event-content";

      const tag = document.createElement("span");
      tag.className = "event-tag";
      tag.textContent = "ÉVÉNEMENT";

      const title = document.createElement("h3");
      title.textContent = event.title;

      const description = document.createElement("p");
      description.className = "event-description";
      description.textContent = event.description;

      const details = document.createElement("div");
      details.className = "event-details";

      const parts = event.date.split("-");
      const date = parts.length === 3
        ? `${parts[2]}/${parts[1]}/${parts[0]}`
        : event.date;

      const time = (event.time || "").replace(":", "h");

      const fields = [
        ["Date", date],
        ["Heure", time],
        ["Format", event.format || "À préciser"],
        ["Récompense", event.reward || "À définir"]
      ];

      fields.forEach(([label, value]) => {
        const item = document.createElement("div");
        const labelElement = document.createElement("span");
        const valueElement = document.createElement("strong");

        labelElement.textContent = label;
        valueElement.textContent = value;

        item.append(labelElement, valueElement);
        details.appendChild(item);
      });

      const info = document.createElement("p");
      info.className = "event-discord";
      info.textContent =
        "Retrouvez les informations complémentaires sur notre Discord.";

      content.append(tag, title, description, details, info);
      card.appendChild(content);
      container.appendChild(card);

      // Apply the site's existing scroll animation.
      revealObserver.observe(card);
    });
  } catch (error) {
    console.error("Impossible de charger les événements :", error);

    container.replaceChildren();

    const message = document.createElement("p");
    message.textContent =
      "Les événements ne sont pas disponibles pour le moment.";

    container.appendChild(message);
  }
}

loadGuildEvents();
