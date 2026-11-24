import "./style.css";
import { initMotion } from "./motion.js";
import { mountAll } from "./ascii/render.js";
import { initAppearance, initSound, initNav, initFolds, initMisc, initHello } from "./ui.js";
import { initStudio } from "./studio.js";
import { initGithub } from "./github.js";
import { initDevices } from "./devices.js";

initFolds();
initMotion();
initAppearance();
initSound();
initNav();
initMisc();
initHello();
mountAll();
initStudio();
initGithub();
initDevices();
