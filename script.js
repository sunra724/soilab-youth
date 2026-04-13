"use strict";

const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const primaryNav = document.getElementById("primary-nav");
const navLinks = primaryNav ? primaryNav.querySelectorAll("a") : [];
const sectionIds = ["about", "programs", "stats", "news", "contact"];

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      primaryNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const updateHeader = () => {
  if (!header) return;
  if (window.scrollY > 16) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
};

window.addEventListener("scroll", updateHeader);
updateHeader();

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const statObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.getAttribute("data-target") || "0");
      const suffix = element.getAttribute("data-suffix") || "";
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.floor(progress * target);
        element.textContent = `${value}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          element.textContent = `${target}${suffix}`;
        }
      };

      requestAnimationFrame(tick);
      observer.unobserve(element);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".stat-num").forEach((item) => statObserver.observe(item));

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));

const sectionElements = sectionIds
  .map((id) => document.getElementById(id))
  .filter((el) => el !== null);

const activateMenu = () => {
  const offset = window.scrollY + 160;
  let current = "";

  sectionElements.forEach((section) => {
    if (!section) return;
    if (offset >= section.offsetTop) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === `#${current}`) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
};

window.addEventListener("scroll", activateMenu);
activateMenu();
