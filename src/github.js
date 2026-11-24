import { tick } from "./sound.js";

/* "Find me on GitHub", kept from the old site: a year of squares, 41 to a row, with FINDME lit in them. */

const PATTERN = [
  0, 1, 2, 3, 41, 42, 43, 44, 82, 83, 123, 124, 125, 126, 164, 165, 166, 167, 205, 206, 246, 247, 287, 288, 5, 6,
  46, 47, 87, 88, 128, 129, 169, 170, 210, 211, 251, 252, 292, 293, 8, 9, 14, 15, 49, 50, 51, 90, 91, 92, 131, 132,
  133, 134, 172, 173, 213, 214, 254, 255, 295, 296, 175, 176, 217, 177, 218, 259, 55, 56, 96, 97, 137, 138, 178,
  179, 219, 220, 260, 261, 217, 218, 259, 260, 261, 301, 302, 17, 18, 19, 58, 59, 60, 61, 99, 100, 102, 103, 140,
  141, 144, 181, 182, 185, 222, 223, 225, 226, 263, 264, 265, 266, 304, 305, 306, 24, 25, 65, 66, 67, 106, 107, 108,
  147, 148, 149, 150, 188, 189, 229, 230, 270, 271, 311, 312, 67, 108, 149, 150, 191, 232, 192, 233, 274, 234, 275,
  316, 194, 235, 276, 154, 195, 236, 73, 114, 155, 33, 34, 74, 75, 115, 116, 156, 157, 197, 198, 238, 239, 279, 280,
  320, 321, 36, 37, 38, 39, 77, 78, 79, 80, 118, 119, 159, 160, 161, 162, 200, 201, 202, 203, 241, 242, 282, 283,
  284, 285, 323, 324, 325, 326,
];
const COLS = 41;
const BOXES = 365;

export function initGithub() {
  const link = document.querySelector(".gh");
  const grid = document.querySelector(".gh-grid");
  if (!grid) return;
  const on = new Set(PATTERN);
  const frag = document.createDocumentFragment();
  let k = 0;
  for (let i = 0; i < BOXES; i++) {
    const el = document.createElement("i");
    el.style.setProperty("--col", String(i % COLS));
    if (on.has(i)) {
      el.className = k++ % 4 === 0 ? "on hint" : "on"; // a few stay half-lit, like the old chart
    }
    frag.append(el);
  }
  grid.append(frag);

  // Light up on hover or keyboard focus; on touch screens, when the chart is in view.
  const set = (lit) => {
    if (link.classList.contains("is-lit") === lit) return;
    link.classList.toggle("is-lit", lit);
    if (lit) tick("open");
  };
  link.addEventListener("mouseenter", () => set(true));
  link.addEventListener("mouseleave", () => set(false));
  link.addEventListener("focusin", () => set(true));
  link.addEventListener("focusout", () => set(false));

  if (matchMedia("(hover: none)").matches) {
    new IntersectionObserver(([e]) => set(e.isIntersecting), { threshold: 0.6 }).observe(grid);
  }
}
