(() => {
  const header = document.getElementById("siteHeader");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.getElementById("site-nav");
  const navLinks = nav ? Array.from(nav.querySelectorAll("a")) : [];

  const setNavState = (isOpen) => {
    if (!navToggle || !nav) return;
    nav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const currentlyOpen = nav.classList.contains("is-open");
      setNavState(!currentlyOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setNavState(false);
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) {
        setNavState(false);
      }
    });
  }

  const handleHeaderScroll = () => {
    if (!header) return;
    header.classList.toggle("is-shrunk", window.scrollY > 34);
  };

  handleHeaderScroll();
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });

  const heroItems = Array.from(document.querySelectorAll("[data-hero-item]"));
  heroItems.forEach((item, index) => {
    item.style.transitionDelay = `${120 + index * 120}ms`;
  });

  window.requestAnimationFrame(() => {
    document.body.classList.add("hero-ready");
  });

  let revealObserver = null;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -40px 0px",
      }
    );
  }

  const activateReveals = () => {
    const revealTargets = Array.from(document.querySelectorAll(".reveal:not(.is-visible)"));
    if (!revealTargets.length) return;
    if (!revealObserver) {
      revealTargets.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    revealTargets.forEach((item) => revealObserver.observe(item));
  };

  activateReveals();
  document.addEventListener("plg:content-rendered", activateReveals);

  const contactForm = document.getElementById("contactForm");
  const contactSuccess = document.getElementById("contactSuccess");
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (contactSuccess) {
        contactSuccess.hidden = true;
        contactSuccess.classList.remove("is-error");
        contactSuccess.textContent = "";
      }

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalLabel = submitButton ? submitButton.textContent : "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: new FormData(contactForm),
        });

        if (!response.ok) {
          throw new Error("Unable to submit contact form.");
        }

        contactForm.reset();
        if (contactSuccess) {
          contactSuccess.textContent = "Success. Your message has been sent to the PLG Fan Club email inbox.";
          contactSuccess.hidden = false;
          contactSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } catch (error) {
        if (contactSuccess) {
          contactSuccess.textContent = "We could not send your message right now. Please check your internet and try again.";
          contactSuccess.classList.add("is-error");
          contactSuccess.hidden = false;
          contactSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        }
      }
    });
  }
})();
