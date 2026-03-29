(() => {
  const upcomingNode = document.getElementById("upcomingEventsGrid");
  const pastNode = document.getElementById("pastEventsGrid");
  const loadingNode = document.getElementById("eventsLoading");
  const upcomingEmpty = document.getElementById("eventsUpcomingEmpty");
  const pastEmpty = document.getElementById("eventsPastEmpty");

  if (!window.PLGContent || !upcomingNode || !pastNode) return;

  const hideLoading = () => {
    if (loadingNode) loadingNode.hidden = true;
  };

  const renderUpcomingCard = (entry) => {
    const card = document.createElement("article");
    card.className = "event-card reveal";
    const eventType = entry.data.type || "Community Event";
    const date = window.PLGContent.formatDate(entry.data.event_date || entry.data.date);
    const location = entry.data.location || "Kentinkrono, Ghana";
    const descriptionSource = window.PLGContent.markdownToPlainText(entry.body || "");
    const description =
      descriptionSource.length > 180 ? `${descriptionSource.slice(0, 177)}...` : descriptionSource || "Details coming soon.";

    card.innerHTML = `
      <p class="label">${window.PLGContent.escapeHtml(eventType)}</p>
      <h3>${window.PLGContent.escapeHtml(entry.data.title || "Untitled Event")}</h3>
      <ul class="event-meta">
        <li>Date: ${window.PLGContent.escapeHtml(date || "To be announced")}</li>
        <li>Time: ${window.PLGContent.escapeHtml(entry.data.time || "To be confirmed")}</li>
        <li>Location: ${window.PLGContent.escapeHtml(location)}</li>
      </ul>
      <p>${window.PLGContent.escapeHtml(description)}</p>
      <a class="btn btn-primary" href="contact.html">RSVP / Learn More</a>
    `;
    return card;
  };

  const renderPastCard = (entry) => {
    const card = document.createElement("article");
    card.className = "archive-card reveal";
    const eventType = entry.data.type || "Community Event";
    const date = window.PLGContent.formatDate(entry.data.event_date || entry.data.date);
    const location = entry.data.location || "Kentinkrono, Ghana";
    const descriptionSource = window.PLGContent.markdownToPlainText(entry.body || "");
    const description =
      descriptionSource.length > 150 ? `${descriptionSource.slice(0, 147)}...` : descriptionSource || "More details will be added soon.";

    card.innerHTML = `
      <h3>${window.PLGContent.escapeHtml(entry.data.title || "Untitled Event")}</h3>
      <p class="label">${window.PLGContent.escapeHtml(date || "Date not set")} · ${window.PLGContent.escapeHtml(location)} · ${window.PLGContent.escapeHtml(eventType)}</p>
      <p>${window.PLGContent.escapeHtml(description)}</p>
    `;
    return card;
  };

  const sortByNewest = (a, b) => {
    const dateA = window.PLGContent.toDate(a.data.event_date || a.data.date);
    const dateB = window.PLGContent.toDate(b.data.event_date || b.data.date);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB - dateA;
  };

  const init = async () => {
    const entries = await window.PLGContent.loadCollection("/_posts/events");
    const sorted = entries.sort(sortByNewest);
    const upcoming = sorted.filter((item) => String(item.data.status || "").toLowerCase() === "upcoming");
    const past = sorted.filter((item) => String(item.data.status || "").toLowerCase() === "past");

    hideLoading();

    if (!upcoming.length) {
      if (upcomingEmpty) upcomingEmpty.hidden = false;
    } else {
      upcoming.forEach((entry) => upcomingNode.appendChild(renderUpcomingCard(entry)));
    }

    if (!past.length) {
      if (pastEmpty) pastEmpty.hidden = false;
    } else {
      past.forEach((entry) => pastNode.appendChild(renderPastCard(entry)));
    }

    if (!upcoming.length && !past.length) {
      if (upcomingEmpty) upcomingEmpty.hidden = false;
      if (pastEmpty) pastEmpty.hidden = false;
    }

    document.dispatchEvent(new CustomEvent("plg:content-rendered"));
  };

  init().catch(() => {
    hideLoading();
    if (upcomingEmpty) {
      upcomingEmpty.textContent = "No events posted yet. Check back soon!";
      upcomingEmpty.hidden = false;
    }
    if (pastEmpty) {
      pastEmpty.textContent = "No events posted yet. Check back soon!";
      pastEmpty.hidden = false;
    }
  });
})();
