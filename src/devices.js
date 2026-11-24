/* Phone and laptop screens in "Earlier work": each screenshot scrolls slowly while it is on screen, stops while
   the reader hovers, touches or focuses it (so they can scroll it themselves), and rests at the end before
   returning to the top. Off when motion is off. */

import { motion } from "./motion.js";

export function initDevices() {
  document.querySelectorAll("[data-autoscroll]").forEach((screen) => {
    let visible = false;
    let held = false;
    let pauseUntil = performance.now() + 1200;
    let pos = 0;
    let last = 0;
    let raf = 0;
    const speed = screen.closest(".device--laptop") ? 22 : 34; // px per second

    const hold = () => {
      held = true;
    };
    const release = () => {
      held = false;
      pos = screen.scrollTop;
      pauseUntil = performance.now() + 1500;
    };
    screen.addEventListener("pointerenter", hold);
    screen.addEventListener("pointerleave", release);
    screen.addEventListener("touchstart", hold, { passive: true });
    screen.addEventListener("touchend", release, { passive: true });
    screen.addEventListener("focus", hold);
    screen.addEventListener("blur", release);

    const step = (now) => {
      raf = 0;
      if (!visible || !motion.on) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      if (!held && now > pauseUntil) {
        const max = screen.scrollHeight - screen.clientHeight;
        pos += speed * dt;
        if (pos >= max) {
          pos = max;
          pauseUntil = now + 2200;
          setTimeout(() => {
            if (held) return;
            screen.scrollTo({ top: 0, behavior: "smooth" });
            pos = 0;
            pauseUntil = performance.now() + 1800;
          }, 2000);
        }
        screen.scrollTop = pos;
      }
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (!raf && visible && motion.on) {
        last = 0;
        raf = requestAnimationFrame(step);
      }
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    }).observe(screen);
    motion.onChange(start);
  });
}
