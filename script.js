/* ============================================================
   MODERN PERSONAL WEBSITE — script.js
   ============================================================ */

(function () {
  "use strict";

  /* ──────────────────────────────────────────────────────────
     1. THEME TOGGLE (dark / light)
  ──────────────────────────────────────────────────────────── */
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle ? themeToggle.querySelector(".theme-icon") : null;

  const THEME_KEY = "am-theme";
  const DARK = "dark";
  const LIGHT = "light";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeIcon) themeIcon.textContent = theme === DARK ? "☀️" : "🌙";
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
  }

  function getPreferredTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === DARK || stored === LIGHT) return stored;
    } catch (_) {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === DARK ? LIGHT : DARK);
    });
  }

  /* ──────────────────────────────────────────────────────────
     2. NAVBAR — scroll shadow + active link highlight
  ──────────────────────────────────────────────────────────── */
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("section[id]");

  function onScroll() {
    if (!navbar) return;

    // Sticky background when scrolled
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    // Active nav link based on visible section
    let current = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 80;
      if (window.scrollY >= top) current = sec.id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${current}`
      );
    });

    // Back-to-top button
    const btt = document.getElementById("backToTop");
    if (btt) {
      if (window.scrollY > 400) {
        btt.classList.add("visible");
      } else {
        btt.classList.remove("visible");
      }
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on page load

  /* ──────────────────────────────────────────────────────────
     3. SMOOTH SCROLL for all internal anchor links
  ──────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });

      // Close mobile menu if open
      closeMobileMenu();
    });
  });

  /* ──────────────────────────────────────────────────────────
     4. MOBILE HAMBURGER MENU
  ──────────────────────────────────────────────────────────── */
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("navLinks");

  function closeMobileMenu() {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("open");
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
      mobileNav.classList.toggle("open", isOpen);
    });

    // Close when clicking outside the nav
    document.addEventListener("click", (e) => {
      if (
        mobileNav.classList.contains("open") &&
        !mobileNav.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });
  }

  /* ──────────────────────────────────────────────────────────
     5. SCROLL-REVEAL (IntersectionObserver)
  ──────────────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    // Fallback: show all immediately
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ──────────────────────────────────────────────────────────
     6. SKILL BAR ANIMATION (animate when bars scroll into view)
  ──────────────────────────────────────────────────────────── */
  const barFills = document.querySelectorAll(".bar-fill");

  function animateBars(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const pct = entry.target.getAttribute("data-pct");
        entry.target.style.width = pct + "%";
        observer.unobserve(entry.target);
      }
    });
  }

  if ("IntersectionObserver" in window && barFills.length) {
    const barObs = new IntersectionObserver(animateBars, { threshold: 0.3 });
    barFills.forEach((bar) => barObs.observe(bar));
  } else {
    barFills.forEach((bar) => {
      bar.style.width = bar.getAttribute("data-pct") + "%";
    });
  }

  /* ──────────────────────────────────────────────────────────
     7. PROJECT FILTER
  ──────────────────────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Update active state
      filterBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-selected", "true");

      const filter = this.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const category = card.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          card.classList.remove("hidden");
          // Re-trigger reveal animation
          card.classList.remove("visible");
          // Small timeout so the transition fires
          setTimeout(() => card.classList.add("visible"), 50);
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

  /* ──────────────────────────────────────────────────────────
     8. CONTACT FORM — validation & simulated submission
  ──────────────────────────────────────────────────────────── */
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  function validateField(input) {
    const errorEl = input.parentElement.querySelector(".field-error");
    let message = "";

    if (input.required && !input.value.trim()) {
      message = "This field is required.";
    } else if (input.type === "email" && input.value.trim() && !input.validity.valid) {
      // Rely on the browser's built-in constraint validation for accurate email checking
      message = "Please enter a valid email address.";
    }

    if (errorEl) errorEl.textContent = message;
    input.classList.toggle("error", !!message);
    return !message;
  }

  if (contactForm) {
    // Validate fields on blur
    contactForm.querySelectorAll("input, textarea").forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.classList.contains("error")) validateField(field);
      });
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate all required fields
      const requiredFields = contactForm.querySelectorAll("[required]");
      let isValid = true;
      requiredFields.forEach((field) => {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) return;

      // Simulate async submission
      const submitBtn = contactForm.querySelector('[type="submit"]');
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        contactForm.reset();
        if (formSuccess) formSuccess.classList.add("visible");

        // Hide success message after 6 seconds
        setTimeout(() => {
          if (formSuccess) formSuccess.classList.remove("visible");
        }, 6000);
      }, 1500);
    });
  }

  /* ──────────────────────────────────────────────────────────
     9. BACK TO TOP BUTTON
  ──────────────────────────────────────────────────────────── */
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ──────────────────────────────────────────────────────────
     10. FOOTER YEAR
  ──────────────────────────────────────────────────────────── */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
