(() => {
  const galleryGrid = document.querySelector("[data-gallery-grid]");
  const loadingNode = document.getElementById("galleryLoading");
  const emptyNode = document.getElementById("galleryEmpty");

  if (!galleryGrid || !window.PLGContent) return;

  const hideLoading = () => {
    if (loadingNode) loadingNode.hidden = true;
  };

  const normalizeCategory = (value) => {
    const normalized = window.PLGContent.slugifyCategory(value);
    if (normalized === "get-together") return "get-together";
    if (normalized === "weddings") return "weddings";
    if (normalized === "funerals") return "funerals";
    if (normalized === "parties") return "parties";
    return "general";
  };

  const buildItem = (entry) => {
    const title = entry.data.title || "PLG Gallery Photo";
    const image = entry.data.image || "https://picsum.photos/seed/plg-gallery-fallback/700/900";
    const category = normalizeCategory(entry.data.category || "general");
    const fig = document.createElement("figure");
    fig.className = "gallery-item reveal";
    fig.dataset.category = category;
    fig.innerHTML = `
      <button class="gallery-shot" type="button" aria-label="Open ${window.PLGContent.escapeHtml(title)} image">
        <img src="${window.PLGContent.escapeHtml(image)}" alt="${window.PLGContent.escapeHtml(title)}" loading="lazy">
      </button>
      <figcaption>${window.PLGContent.escapeHtml(title)}</figcaption>
    `;
    return fig;
  };

  const sortByNewest = (a, b) => {
    const dateA = window.PLGContent.toDate(a.data.date);
    const dateB = window.PLGContent.toDate(b.data.date);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB - dateA;
  };

  const init = async () => {
    const entries = await window.PLGContent.loadCollection("/_posts/gallery");
    hideLoading();

    if (!entries.length) {
      if (emptyNode) emptyNode.hidden = false;
      document.dispatchEvent(new CustomEvent("plg:gallery-rendered"));
      return;
    }

    entries.sort(sortByNewest).forEach((entry) => galleryGrid.appendChild(buildItem(entry)));
    document.dispatchEvent(new CustomEvent("plg:gallery-rendered"));
    document.dispatchEvent(new CustomEvent("plg:content-rendered"));
  };

  init().catch(() => {
    hideLoading();
    if (emptyNode) {
      emptyNode.textContent = "No photos yet. Come back after our next event!";
      emptyNode.hidden = false;
    }
    document.dispatchEvent(new CustomEvent("plg:gallery-rendered"));
  });
})();
