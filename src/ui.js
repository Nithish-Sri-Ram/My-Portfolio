/* Header controls, the sections drawer, folding sections, the clock and the demo video. */

import { motion, setPaused } from "./motion.js";
import { startSound, stopSound, soundOn, tick } from "./sound.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;

/* ---------- appearance ---------- */
const KEY = "nsr-appearance";
function readAppearance() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || "{}");
    return {
      theme: ["system", "light", "dark"].includes(a.theme) ? a.theme : "system",
      accent: ["blue", "orange", "green", "red", "pink"].includes(a.accent) ? a.accent : "blue",
    };
  } catch {
    return { theme: "system", accent: "blue" };
  }
}

function applyAppearance(a) {
  if (a.theme === "system") delete root.dataset.theme;
  else root.dataset.theme = a.theme;
  if (a.accent === "blue") delete root.dataset.accent;
  else root.dataset.accent = a.accent;
  const dark = a.theme === "dark" || (a.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  $('meta[name="theme-color"]').content = dark ? "#101010" : "#f1f1f1";
  const t = $(`input[name="theme"][value="${a.theme}"]`);
  const c = $(`input[name="accent"][value="${a.accent}"]`);
  if (t) t.checked = true;
  if (c) c.checked = true;
}

export function initAppearance() {
  const details = $(".appearance");
  let state = readAppearance();
  applyAppearance(state);

  details.addEventListener("change", (e) => {
    if (e.target.name === "theme") state.theme = e.target.value;
    if (e.target.name === "accent") state.accent = e.target.value;
    applyAppearance(state);
    tick();
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => applyAppearance(state));
  addEventListener("storage", (e) => {
    if (e.key === KEY) applyAppearance((state = readAppearance()));
  });

  details.addEventListener("toggle", () => details.open && closeNav());
  document.addEventListener("click", (e) => details.open && !details.contains(e.target) && (details.open = false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && details.open) {
      details.open = false;
      $("summary", details).focus();
    }
  });

  const mt = $(".motion-toggle");
  const label = () => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    mt.textContent = reduced ? "Motion reduced by system" : motion.paused ? "Play motion" : "Pause motion";
    mt.disabled = reduced;
  };
  mt.addEventListener("click", () => {
    setPaused(!motion.paused);
    tick();
  });
  motion.onChange(label);
  label();
}

/* ---------- sound ---------- */
export function initSound() {
  const btn = $(".sound-toggle");
  btn.addEventListener("click", async () => {
    if (soundOn) stopSound();
    else await startSound();
    btn.setAttribute("aria-pressed", String(soundOn));
    $("span", btn).textContent = soundOn ? "Stop sound" : "Start sound";
  });
}

/* ---------- sections drawer ---------- */
const navBtn = () => $(".nav-toggle");
function openNav() {
  const nav = $("#site-index");
  nav.hidden = false;
  requestAnimationFrame(() => document.body.classList.add("nav-open"));
  navBtn().setAttribute("aria-expanded", "true");
  $(".appearance").open = false;
  setTimeout(() => $("a", nav).focus({ preventScroll: true }), 200);
  tick("open");
}
function closeNav(restore) {
  if (!document.body.classList.contains("nav-open")) return;
  document.body.classList.remove("nav-open");
  navBtn().setAttribute("aria-expanded", "false");
  setTimeout(() => {
    if (!document.body.classList.contains("nav-open")) $("#site-index").hidden = true;
  }, 330);
  if (restore) navBtn().focus();
}

export function initNav() {
  navBtn().addEventListener("click", () => (document.body.classList.contains("nav-open") ? closeNav() : openNav()));
  $(".nav-backdrop").addEventListener("click", () => closeNav(true));
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeNav(true));
  $$(".index-links a").forEach((a) => a.addEventListener("click", () => closeNav()));
  $$("[data-folds]").forEach((b) =>
    b.addEventListener("click", () => {
      const open = b.dataset.folds === "open";
      $$(".fold-section").forEach((s) => setFold(s, open));
      tick("open");
    })
  );

  /* current section in the drawer */
  const links = $$(".index-links a");
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${e.target.id}`)));
      }),
    { rootMargin: "-40% 0px -55% 0px" }
  );
  $$("main > section").forEach((s) => io.observe(s));
}

/* ---------- folding sections ---------- */
function setFold(section, open) {
  const btn = $(".section-toggle", section);
  const body = $(".section-body", section);
  if (!btn || !body) return;
  btn.setAttribute("aria-expanded", String(open));
  body.classList.toggle("is-open", open);
}

export function initFolds() {
  $$(".fold-section").forEach((section) => {
    setFold(section, section.hasAttribute("data-open"));
    const btn = $(".section-toggle", section);
    const toggle = () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      setFold(section, open);
      tick(open ? "open" : "click");
    };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });
    $(".section-heading", section).addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      toggle();
    });
  });

  /* a link to a section, or to something inside one, opens it */
  const reveal = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id && document.getElementById(id);
    const section = el && el.closest(".fold-section");
    if (section) setFold(section, true);
  };
  addEventListener("hashchange", reveal);
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", () => {
      const el = document.getElementById(a.getAttribute("href").slice(1));
      const section = el && el.closest(".fold-section");
      if (section) setFold(section, true);
    })
  );
  reveal();
}

/* ---------- misc ---------- */
export function initHello() {
  const hello = $(".hello");
  if (!hello) return;
  document.addEventListener("click", (e) => hello.open && !hello.contains(e.target) && (hello.open = false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && hello.open) {
      hello.open = false;
      $("summary", hello).focus();
    }
  });
  hello.addEventListener("toggle", () => hello.open && tick("open"));
  $$(".copy", hello).forEach((b) =>
    b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy);
      } catch {
        const t = document.createElement("textarea");
        t.value = b.dataset.copy;
        document.body.append(t);
        t.select();
        document.execCommand("copy");
        t.remove();
      }
      b.textContent = "Copied";
      b.classList.add("is-done");
      tick();
      setTimeout(() => {
        b.textContent = "Copy";
        b.classList.remove("is-done");
      }, 1600);
    })
  );
}

export function initMisc() {
  $$(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
  const clock = () => $$(".clock").forEach((el) => (el.textContent = fmt.format(new Date())));
  clock();
  setInterval(clock, 15000);

  const overlay = $(".overlay");
  const video = $("video", overlay);
  let last = null;
  const close = () => {
    video.pause();
    overlay.hidden = true;
    last && last.focus();
  };
  $$("[data-video]").forEach((b) =>
    b.addEventListener("click", () => {
      last = b;
      if (!video.getAttribute("src")) video.src = b.dataset.video;
      overlay.hidden = false;
      video.play().catch(() => {});
      $(".overlay-close").focus();
    })
  );
  $(".overlay-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => e.target === overlay && close());
  document.addEventListener("keydown", (e) => e.key === "Escape" && !overlay.hidden && close());
}
