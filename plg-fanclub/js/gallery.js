(() => {
  const galleryGrid = document.querySelector("[data-gallery-grid]");
  if (!galleryGrid) return;

  const tabs = Array.from(document.querySelectorAll(".filter-tab"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentFilter = "all";
  let visibleItems = [];
  let currentIndex = 0;

  const getItems = () => Array.from(galleryGrid.querySelectorAll(".gallery-item"));

  const syncTabState = (activeFilter) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.filter === activeFilter;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
  };

  const applyFilter = (filterValue = currentFilter) => {
    currentFilter = filterValue;
    const items = getItems();
    items.forEach((item) => {
      const category = item.dataset.category || "general";
      const matches = filterValue === "all" || category === filterValue;
      item.hidden = !matches;
      item.classList.toggle("is-hidden", !matches);
    });
    visibleItems = items.filter((item) => !item.hidden);
  };

  const openLightbox = (item) => {
    if (!lightbox || !lightboxImage || !lightboxCaption || !item) return;
    const image = item.querySelector("img");
    const caption = item.querySelector("figcaption");
    if (!image) return;

    currentIndex = visibleItems.indexOf(item);
    if (currentIndex < 0) currentIndex = 0;

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt || "PLG Fan Club gallery image";
    lightboxCaption.textContent = caption ? caption.textContent : "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    document.body.style.overflow = "";
  };

  const moveLightbox = (step) => {
    if (!visibleItems.length) return;
    currentIndex = (currentIndex + step + visibleItems.length) % visibleItems.length;
    openLightbox(visibleItems[currentIndex]);
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selectedFilter = tab.dataset.filter || "all";
      syncTabState(selectedFilter);
      applyFilter(selectedFilter);
    });
  });

  galleryGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".gallery-shot");
    if (!button) return;
    const item = button.closest(".gallery-item");
    if (!item) return;
    applyFilter(currentFilter);
    openLightbox(item);
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => moveLightbox(-1));
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => moveLightbox(1));
  }

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });

  document.addEventListener("plg:gallery-rendered", () => {
    applyFilter(currentFilter);
  });

  window.PLGGallery = {
    refresh: () => applyFilter(currentFilter),
  };

  applyFilter("all");
})();
