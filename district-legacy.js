// Legacy HERMES CITY sub-district page behaviour (community, social, botmode).
// Extracted from app.js on main@33508ec: scroll reveal + card pointer glow only.
// Sub-district pages have no 3D canvas, so three.js is intentionally not loaded.
// Migrate these pages to Design System 0.2.0, then delete this file.

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const trigger = window.innerHeight * 0.88;
  revealItems.forEach((item) => {
    const top = item.getBoundingClientRect().top;
    if (top < trigger) item.classList.add("visible");
  });
}

function addCardSignals() {
  document.querySelectorAll(".card").forEach((card, index) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(35, 231, 255, 0.18), rgba(12, 18, 28, 0.78) 42%)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.background = "rgba(12, 18, 28, 0.78)";
    });
    card.style.transitionDelay = `${index * 80}ms`;
  });
}

window.addEventListener("scroll", revealOnScroll, { passive: true });
window.addEventListener("load", () => {
  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("visible"));
  } else {
    revealOnScroll();
  }
  addCardSignals();
});
