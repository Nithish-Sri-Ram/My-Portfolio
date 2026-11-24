/* The SimFabric studio, in text: a sentence is typed, the world builds in behind a scan line, the exports light.
   An illustration of the flow; the real product is at simfabric.dev. */

import { stage } from "./ascii/render.js";
import { motion } from "./motion.js";
import { tick } from "./sound.js";

const WORLDS = [
  {
    art: "TERRAIN",
    name: "rocky_pass",
    prompt: "A rocky mountain pass, loose scree on the slopes, and a ridge to climb.",
    log: ["terrain · heightfield generated", "rocks · scattered across the slopes"],
  },
  {
    art: "CITY",
    name: "warehouse_yard",
    prompt: "A block of warehouses with loading yards and narrow lanes between them.",
    log: ["layout · blocks, yards and lanes", "props · pallets and crates placed"],
  },
  {
    art: "STACK",
    name: "layered_valley",
    prompt: "A mountain valley in layers: the terrain, then the rocks, then the details on top.",
    log: ["layers · terrain, rocks, details", "each layer checked in physics"],
  },
];

export function initStudio() {
  const root = document.querySelector(".studio");
  if (!root) return;
  const text = root.querySelector(".studio-text");
  const log = root.querySelector(".studio-log");
  const chips = [...root.querySelectorAll(".chip")];
  const exportsEls = [...root.querySelectorAll(".studio-exports span")];
  const nameEl = root.querySelector(".studio-name");
  const view = stage(root.querySelector(".ascii--stage"));

  let run = 0;
  let visible = false;
  const wait = (ms) => new Promise((r) => setTimeout(r, motion.on ? ms : Math.min(ms, 40)));

  const line = (msg, pending = false) => {
    const li = document.createElement("li");
    li.textContent = msg;
    if (pending) li.classList.add("is-pending");
    log.append(li);
    while (log.children.length > 7) log.firstChild.remove();
    return li;
  };

  async function play(i) {
    const token = ++run;
    const alive = () => token === run;
    const w = WORLDS[i];
    chips.forEach((c, k) => c.classList.toggle("is-on", k === i));
    exportsEls.forEach((e) => e.classList.remove("is-on"));
    log.innerHTML = "";
    text.textContent = "";
    nameEl.textContent = w.name;

    for (const ch of w.prompt) {
      if (!alive()) return;
      text.textContent += ch;
      if (ch !== " ") tick("type");
      await wait(/[,.:]/.test(ch) ? 140 : 24);
    }
    await wait(300);
    if (!alive()) return;

    const first = line("reading the description", true);
    view.show(w.art, 1500);
    await wait(450);
    if (!alive()) return;
    first.classList.remove("is-pending");
    for (const msg of [...w.log, "collision shapes, mass, friction", "physics check · scene settled"]) {
      line(msg);
      await wait(320);
      if (!alive()) return;
    }
    for (const e of exportsEls) {
      e.classList.add("is-on");
      tick();
      await wait(140);
      if (!alive()) return;
    }
    line("ready · download or train");

    await wait(6500);
    if (!alive()) return;
    while (!visible) {
      await wait(500);
      if (!alive()) return;
    }
    play((i + 1) % WORLDS.length);
  }

  chips.forEach((c) => c.addEventListener("click", () => play(+c.dataset.world)));

  let started = false;
  new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      if (visible && !started) {
        started = true;
        play(0);
      }
    },
    { threshold: 0.3 }
  ).observe(root);

  // a still first frame, so the stage is never empty
  text.textContent = WORLDS[0].prompt;
  nameEl.textContent = WORLDS[0].name;
  view.show(WORLDS[0].art, 0);
}
