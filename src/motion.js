/* Motion layer. One root class, motion-on, gates every effect. It is set only when the system does not ask for
   reduced motion, the reader has not paused motion, and the URL has no ?noanim. Without it the page is complete
   and still. */

const root = document.documentElement;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const KEY = "nsr-motion";

export const motion = {
  on: false,
  paused: false,
  listeners: new Set(),
  onChange(fn) {
    this.listeners.add(fn);
  },
};

function readPaused() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}").mode === "paused";
  } catch {
    return false;
  }
}

function apply() {
  const noanim = new URLSearchParams(location.search).has("noanim");
  motion.paused = readPaused();
  motion.on = !reduce.matches && !motion.paused && !noanim;
  root.classList.toggle("motion-on", motion.on);
  root.classList.toggle("motion-paused", motion.paused);
  motion.listeners.forEach((fn) => fn(motion));
}

export function setPaused(paused) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ mode: paused ? "paused" : "auto" }));
  } catch {}
  apply();
}

export function initMotion() {
  apply();
  reduce.addEventListener("change", apply);
  window.addEventListener("storage", (e) => e.key === KEY && apply());

  /* reveals: short, bounded, 70 ms between siblings, 800 ms cap */
  const io = new IntersectionObserver(
    (entries) => {
      const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      batch.forEach((el, i) => {
        el.style.setProperty("--delay", `${Math.min(i * 70, 800)}ms`);
        el.classList.add("is-revealed");
        io.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );
  document.querySelectorAll("[data-reveal], .mask-line").forEach((el) => io.observe(el));

  /* hero name arrives on load */
  requestAnimationFrame(() =>
    document.querySelectorAll(".hero-name .mask-line").forEach((el, i) => {
      el.style.setProperty("--delay", `${120 + i * 90}ms`);
      el.classList.add("is-revealed");
    })
  );

  /* progress bar under the header */
  const bar = document.querySelector(".scroll-progress span");
  let ticking = false;
  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    ticking = false;
  };
  addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(progress);
      }
    },
    { passive: true }
  );
  addEventListener("resize", progress);
  progress();
}
