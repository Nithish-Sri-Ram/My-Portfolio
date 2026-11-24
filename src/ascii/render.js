/* Text art, after SimFabric's research and documentation pages (simfabric/frontend/src/lib/asciiMark.js).
   A piece is a grid of densities, 0 for nothing to 5 for the darkest. At time t a slow ripple moves through
   its characters; the strand is a wave of the same characters. */

import * as ART from "./art.js";
import { motion } from "../motion.js";

export const RAMP = " .·:+*";
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export const artAt = (grid, t, amp = 0.9) =>
  grid
    .map((row, y) =>
      [...row]
        .map((d, x) => (d === "0" ? " " : RAMP[clamp(Math.round(+d + Math.sin(x * 0.16 + y * 0.42 - t) * amp), 1, 5)]))
        .join("")
    )
    .join("\n");

export const strandAt = (t, cols = 74, rows = 3) =>
  Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => {
      const middle = (rows - 1) / 2 + Math.sin(x * 0.13 - t * 0.7) * (rows / 3.3) + Math.sin(x * 0.041 + t * 0.3) * (rows / 6);
      return RAMP[clamp(Math.round(4.6 - Math.abs(y - middle) * 3.4), 0, 5)];
    }).join("")
  ).join("\n");

/* One shared clock for every piece on screen: 120 ms ticks, like the original. */
const live = new Set();
let t = 0;
setInterval(() => {
  if (!motion.on || document.hidden) return;
  t += 0.16;
  live.forEach((draw) => draw(t));
}, 120);

function watch(el, draw) {
  draw(0);
  new IntersectionObserver(([e]) => (e.isIntersecting ? live.add(draw) : live.delete(draw)), { rootMargin: "120px" }).observe(el);
}

export function mountAll(root = document) {
  root.querySelectorAll("pre[data-art]").forEach((pre) => {
    const grid = ART[pre.dataset.art];
    if (!grid) return;
    const amp = pre.hasAttribute("data-ripple") ? 0.9 : 0;
    watch(pre, (time) => (pre.textContent = artAt(grid, time, amp)));
  });

  root.querySelectorAll("pre[data-strand]").forEach((pre) => {
    const wide = pre.dataset.strand === "wide";
    const cols = () => {
      if (!wide) return 74;
      const ch = parseFloat(getComputedStyle(pre).fontSize) * 0.6 || 7;
      return Math.max(40, Math.floor(pre.clientWidth / ch));
    };
    let c = cols();
    window.addEventListener("resize", () => (c = cols()));
    watch(pre, (time) => (pre.textContent = strandAt(time, c, wide ? 7 : 3)));
  });
}

/* A piece that builds in behind a scan line, then ripples. Returns a controller. */
export function stage(pre) {
  let grid = null;
  let start = 0;
  let duration = 1;
  let raf = 0;
  const scramble = "·:+*";

  const frame = (time) => {
    if (!grid) return;
    const p = Math.min(1, (performance.now() - start) / duration);
    if (p >= 1 || !motion.on) {
      pre.textContent = artAt(grid, time ?? t, 0.9);
      return true;
    }
    const scanRow = Math.floor(p * (grid.length + 2));
    pre.innerHTML = grid
      .map((row, y) => {
        if (y < scanRow - 1) return artAt([row], t + y * 0.42, 0.9);
        if (y <= scanRow) {
          const s = [...row].map((d) => (d === "0" ? " " : scramble[(Math.random() * scramble.length) | 0])).join("");
          return `<span class="scan">${s}</span>`;
        }
        return "";
      })
      .join("\n");
    return false;
  };

  const loop = () => {
    if (!frame()) raf = requestAnimationFrame(loop);
    else live.add(idle);
  };
  const idle = (time) => grid && (pre.textContent = artAt(grid, time, 0.9));

  return {
    show(name, ms = 1400) {
      grid = ART[name];
      live.delete(idle);
      cancelAnimationFrame(raf);
      start = performance.now();
      duration = ms;
      loop();
    },
    clear() {
      grid = null;
      live.delete(idle);
      cancelAnimationFrame(raf);
      pre.textContent = "";
    },
    get rows() {
      return grid ? grid.length : 0;
    },
  };
}
