(() => {
  const BLOG_CONTENTS_API =
    "https://api.github.com/repos/Homega525/plg-fan-club/contents/plg-fanclub/_posts/blog";

  const listNode = document.getElementById("blogList");
  const loadingNode = document.getElementById("blogLoading");
  const emptyNode = document.getElementById("blogEmpty");

  if (!listNode || !window.PLGContent) return;

  const finishLoading = () => {
    if (loadingNode) loadingNode.hidden = true;
  };

  const showEmpty = (message) => {
    if (!emptyNode) return;
    emptyNode.textContent = message;
    emptyNode.hidden = false;
  };

  const createPostCard = (entry) => {
    const title = entry.data.title || "Untitled Post";
    const summarySource = entry.data.summary || window.PLGContent.markdownToPlainText(entry.body || "");
    const summary = summarySource.length > 180 ? `${summarySource.slice(0, 177)}...` : summarySource;
    const category = entry.data.category || "General";
    const date = window.PLGContent.formatDate(entry.data.date);
    const cover = entry.data.thumbnail || "https://picsum.photos/seed/plg-blog-default/720/420";
    const fullBody = window.PLGContent.markdownToHtml(entry.body || "");
    const card = document.createElement("article");
    card.className = "blog-card reveal";
    card.innerHTML = `
      <div class="blog-card-media">
        <img src="${window.PLGContent.escapeHtml(cover)}" alt="${window.PLGContent.escapeHtml(title)}" loading="lazy">
      </div>
      <div class="blog-card-content">
        <div class="blog-meta">
          <span class="blog-badge">${window.PLGContent.escapeHtml(category)}</span>
          <time datetime="${window.PLGContent.escapeHtml(entry.data.date || "")}">${window.PLGContent.escapeHtml(date || "Date not set")}</time>
        </div>
        <h3>${window.PLGContent.escapeHtml(title)}</h3>
        <p class="blog-summary">${window.PLGContent.escapeHtml(summary || "No summary available yet.")}</p>
        <button class="btn btn-ghost blog-read-more" type="button" aria-expanded="false">Read More</button>
        <div class="blog-expanded" hidden>
          ${fullBody || "<p>Full post content is not available yet.</p>"}
        </div>
      </div>
    `;
    return card;
  };

  const bindReadMoreToggle = () => {
    listNode.addEventListener("click", (event) => {
      const button = event.target.closest(".blog-read-more");
      if (!button) return;
      const card = button.closest(".blog-card");
      if (!card) return;
      const expanded = card.querySelector(".blog-expanded");
      if (!expanded) return;

      const willOpen = expanded.hidden;
      expanded.hidden = !willOpen;
      button.setAttribute("aria-expanded", String(willOpen));
      button.textContent = willOpen ? "Show Less" : "Read More";
    });
  };

  const init = async () => {
    bindReadMoreToggle();
    const entries = await window.PLGContent.loadCollection(BLOG_CONTENTS_API);
    const sorted = entries.sort((a, b) => {
      const dateA = window.PLGContent.toDate(a.data.date);
      const dateB = window.PLGContent.toDate(b.data.date);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB - dateA;
    });

    finishLoading();

    if (!sorted.length) {
      showEmpty("No blog posts yet. Fresh updates will appear here soon!");
      return;
    }

    const cards = sorted.map(createPostCard);
    cards.forEach((card) => listNode.appendChild(card));
    document.dispatchEvent(new CustomEvent("plg:content-rendered"));
  };

  init().catch(() => {
    finishLoading();
    showEmpty("Unable to load posts right now. Please try again shortly.");
  });
})();
