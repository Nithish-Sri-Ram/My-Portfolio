/* Sound, generated in the browser: a slow pentatonic pad and small ticks for the page's controls.
   Nothing plays until the reader presses Start sound. */

let ctx = null;
let master = null;
let padNodes = [];
let noteTimer = 0;
export let soundOn = false;

const NOTES = [220, 246.94, 293.66, 329.63, 392, 440, 493.88, 587.33];

function ensure() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);
}

function pad() {
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  filter.Q.value = 0.7;
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.05;
  lfoGain.gain.value = 320;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();
  filter.connect(master);

  const voices = [110, 164.81, 220, 277.18].map((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = i % 2 ? "sine" : "triangle";
    o.frequency.value = f;
    o.detune.value = (i - 1.5) * 4;
    g.gain.value = 0.05;
    o.connect(g).connect(filter);
    o.start();
    return o;
  });
  padNodes = [lfo, ...voices];
}

function pluck(freq, when = 0, vol = 0.07) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t = ctx.currentTime + when;
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 2.7);
}

function melody() {
  const n = NOTES[(Math.random() * NOTES.length) | 0];
  pluck(n, 0, 0.06);
  if (Math.random() < 0.4) pluck(n * 1.5, 0.35, 0.03);
  noteTimer = setTimeout(melody, 1800 + Math.random() * 2600);
}

export async function startSound() {
  ensure();
  await ctx.resume();
  if (!padNodes.length) pad();
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.5);
  clearTimeout(noteTimer);
  melody();
  soundOn = true;
}

export function stopSound() {
  if (!ctx) return;
  clearTimeout(noteTimer);
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  soundOn = false;
}

/* A small tick for folds, chips and typing. */
export function tick(kind = "click") {
  if (!soundOn || !ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t = ctx.currentTime;
  const type = kind === "type" ? [1800, 0.012, 0.03] : kind === "open" ? [660, 0.05, 0.12] : [1200, 0.035, 0.06];
  o.type = kind === "open" ? "triangle" : "square";
  o.frequency.setValueAtTime(type[0], t);
  if (kind === "open") o.frequency.exponentialRampToValueAtTime(990, t + 0.08);
  g.gain.setValueAtTime(type[1], t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + type[2]);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + type[2] + 0.02);
}
