// The projector: sizes the canvas, keeps the clock, draws the scene on
// screen, lays captions over it, shows the typeset equations (KaTeX, in a
// layer of HTML above the canvas) and runs the controls. While sound is
// running the clock follows the audio hardware, so picture and sound cannot
// drift apart.

import { W, H, clamp, smooth, lerp } from './kit.js';
import { TIMELINE, DURATION, sceneAt, sceneById, chapters } from './script.js';
import { text, COL, SANS, SERIF } from './paint.js';
import { SCENE_DRAW } from './scenes/index.js';

const canvas = document.getElementById('film');
const ctx = canvas.getContext('2d', { alpha: false });
const eqLayer = document.getElementById('eqs');
const params = new URLSearchParams(location.search);
const STILL = params.has('still');

// ─── sizing ───────────────────────────────────────────────────────────────

const frame = { x: 0, y: 0, w: W, h: H, scale: 1, dpr: 1 };
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const q = Number(params.get('q')) || 1;
  let dpr = Math.min(window.devicePixelRatio || 1, 2) * q;
  const scale = Math.min(vw / W, vh / H);
  dpr = Math.min(dpr, 2560 / (W * scale));
  frame.scale = scale; frame.dpr = dpr;
  frame.w = W * scale; frame.h = H * scale;
  frame.x = (vw - frame.w) / 2; frame.y = (vh - frame.h) / 2;
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  canvas.style.width = vw + 'px';
  canvas.style.height = vh + 'px';
  eqLayer.style.transform = `translate(${frame.x}px, ${frame.y}px) scale(${scale})`;
  if (!playing) render();
}

// ─── clock ────────────────────────────────────────────────────────────────

let score = null;
let playing = false;
let T = 0;
let wallAnchor = 0, filmAnchor = 0;

function now() {
  let t = T;
  if (playing && score && score.running) t = score.filmTime();
  else if (playing) t = filmAnchor + (performance.now() - wallAnchor) / 1000;
  return clamp(t, 0, DURATION);
}
function play() {
  if (T >= DURATION - 0.05) T = 0;
  playing = true;
  wallAnchor = performance.now(); filmAnchor = T;
  if (score) score.start(T);
  ui.classList.add('playing');
  ui.classList.remove('ended');
}
function pause() {
  T = now();
  playing = false;
  if (score) score.stop();
  ui.classList.remove('playing');
  render();
}
function seek(t) {
  T = clamp(t, 0, DURATION);
  wallAnchor = performance.now(); filmAnchor = T;
  if (playing && score) score.start(T);
  render();
  updateBar();
}

// ─── drawing ──────────────────────────────────────────────────────────────

// How far the scene is faded in (1 = fully visible).
function sceneAlpha(s, t) {
  let k = 1;
  if (s.fadeIn) k = Math.min(k, smooth(t / s.fadeIn));
  if (s.fadeOut) k = Math.min(k, smooth((s.dur - t) / s.fadeOut));
  return k;
}

function render() {
  const T = now();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const k = frame.scale * frame.dpr;
  ctx.setTransform(k, 0, 0, k, frame.x * frame.dpr, frame.y * frame.dpr);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();

  const s = sceneAt(T);
  const t = T - s.start;
  const fn = SCENE_DRAW[s.id];
  ctx.save();
  if (fn) fn(ctx, t, s);
  else { ctx.fillStyle = '#0c1426'; ctx.fillRect(0, 0, W, H); text(ctx, s.id, W / 2, H / 2, { size: 60 }); }
  ctx.restore();
  chapterLabel(ctx, s, t);
  const a = sceneAlpha(s, t);
  if (a < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - a})`; ctx.fillRect(-4, -4, W + 8, H + 8); }
  captions(ctx, s, t, a);
  ctx.restore();
  equations(T, s, a);
}

// ─── the chapter label ────────────────────────────────────────────────────

function chapterLabel(g, s, t) {
  if (!s.label) return;
  const a = Math.min(smooth((t - 0.4) / 1.2), smooth((7 - t) / 1.5));
  if (a <= 0) return;
  g.save();
  g.globalAlpha = a * 0.9;
  g.fillStyle = COL.gold;
  g.fillRect(96, 92, 46 * smooth((t - 0.4) / 1.4), 2);
  g.restore();
  text(g, s.label.toUpperCase(), 158, 101, { size: 22, spacing: 7, color: COL.ink, alpha: a * 0.9, align: 'left' });
}

// ─── captions ─────────────────────────────────────────────────────────────

function wrap(g, str, font, maxW) {
  g.font = font;
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (g.measureText(next).width > maxW && cur) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  // balance the last two lines so the final one is never a lonely word
  if (lines.length >= 2) {
    const head = lines.slice(0, -2);
    const tail = (lines[lines.length - 2] + ' ' + lines[lines.length - 1]).split(' ');
    let best = null, bestD = Infinity;
    for (let i = 1; i < tail.length; i++) {
      const a = tail.slice(0, i).join(' '), b = tail.slice(i).join(' ');
      const wa = g.measureText(a).width, wb = g.measureText(b).width;
      if (wa > maxW || wb > maxW) continue;
      const d = Math.abs(wa - wb * 1.15);
      if (d < bestD) { bestD = d; best = [a, b]; }
    }
    if (best) return [...head, ...best];
  }
  return lines;
}

const CAPTION_SIZE = 38;
function captions(g, s, t, sceneA) {
  for (const [at, dur, str, kind, who] of s.captions) {
    if (t < at - 0.01 || t > at + dur + 0.01) continue;
    const fi = kind === 'title' || kind === 'credits' ? 2 : 0.45;
    const fo = kind === 'title' || kind === 'credits' ? 2 : 0.45;
    const a = Math.min(smooth((t - at) / fi), smooth((at + dur - t) / fo)) * sceneA;
    if (a <= 0.003) continue;
    if (kind === 'n') {
      const font = `400 ${CAPTION_SIZE}px ${SANS}`;
      const lines = wrap(g, str, font, 1580);
      const lh = CAPTION_SIZE * 1.3;
      const y0 = 1010 - (lines.length - 1) * lh;
      // a soft dark band under the words so they read on any picture
      const top = y0 - CAPTION_SIZE - 34;
      const gr = g.createLinearGradient(0, top, 0, H);
      gr.addColorStop(0, 'rgba(3,6,12,0)');
      gr.addColorStop(0.35, `rgba(3,6,12,${0.72 * a})`);
      gr.addColorStop(1, `rgba(3,6,12,${0.86 * a})`);
      g.fillStyle = gr;
      g.fillRect(0, top, W, H - top);
      lines.forEach((l, i) => text(g, l, W / 2, y0 + i * lh, { size: CAPTION_SIZE, color: '#f2f5fa', alpha: a, shadow: 8 }));
    } else if (kind === 'title') {
      const k = smooth((t - at) / 5);
      const spacing = lerp(20, 34, k);
      text(g, str, W / 2, 520, { face: SERIF, size: 150, weight: 400, spacing, color: '#f4f1ea', alpha: a, shadow: 30 });
      if (who) text(g, who, W / 2, 600, { face: SERIF, size: 40, italic: true, color: '#c9d4e6', alpha: a * smooth((t - at - 1.2) / 2), shadow: 20 });
    } else if (kind === 'card') {
      const font = `italic 500 58px ${SERIF}`;
      const lines = wrap(g, str, font, 1400);
      lines.forEach((l, i) => text(g, l, W / 2, 520 + (i - (lines.length - 1) / 2) * 70, { face: SERIF, size: 58, italic: true, weight: 500, color: '#f2efe8', alpha: a }));
      if (who) text(g, `— ${who}`, W / 2, 520 + (lines.length / 2) * 70 + 40, { size: 24, spacing: 6, color: COL.dim, alpha: a * smooth((t - at - 1) / 1.5) });
    } else if (kind === 'credits') {
      credits(g, a);
    }
  }
}

function credits(g, a) {
  text(g, 'WORLDLINE', W / 2, 300, { face: SERIF, size: 96, spacing: 26, color: '#f4f1ea', alpha: a });
  const rows = [
    'Every number in this film comes from “General Relativity: A Beginner’s Guide”,',
    'where each one is cited to its source.',
    '',
    'The animations are computed from the equations they illustrate:',
    'light clocks, the Lorentz transformation, photon paths and orbits around a',
    'Schwarzschild black hole, the leading-order inspiral chirp, and the Friedmann',
    'expansion of a flat ΛCDM universe. Where a picture is exaggerated, it says so.',
    '',
    'Equations typeset with KaTeX. Drawn on a canvas and scored with WebAudio, live.',
  ];
  rows.forEach((r, i) => text(g, r, W / 2, 420 + i * 46, { size: 30, color: i < 2 ? COL.ink : COL.dim, alpha: a }));
}

// ─── the equations (typeset HTML over the canvas) ────────────────────────

const EQ = [];
function buildEquations() {
  for (const s of TIMELINE) {
    for (const e of s.eqs) {
      const el = document.createElement('div');
      el.className = 'eq' + (e.box ? ' box' : '');
      try {
        window.katex.render(e.tex, el, { displayMode: true, throwOnError: true });
      } catch (err) {
        console.error(`equation in ${s.id}:`, err.message);
        el.textContent = e.tex;
      }
      el.style.fontSize = `${e.size}px`;
      el.style.left = `${e.x}px`;
      el.style.top = `${e.y}px`;
      el.style.opacity = '0';
      eqLayer.appendChild(el);
      EQ.push({ el, s, e, a: 0 });
    }
  }
}

function equations(T, s, sceneA) {
  for (const q of EQ) {
    let a = 0;
    if (q.s === s) {
      const t = T - s.start;
      if (t >= q.e.t0 && t <= q.e.t1) a = Math.min(smooth((t - q.e.t0) / 0.7), smooth((q.e.t1 - t) / 0.7)) * sceneA;
    }
    if (Math.abs(a - q.a) > 0.002 || (a === 0) !== (q.a === 0)) {
      q.el.style.opacity = a.toFixed(3);
      q.el.style.visibility = a > 0.002 ? 'visible' : 'hidden';
      q.a = a;
    }
  }
}

// ─── controls ─────────────────────────────────────────────────────────────

const ui = document.getElementById('ui');
const startBtn = document.getElementById('start');
const bar = document.getElementById('bar');
const fillEl = document.getElementById('fill');
const timeEl = document.getElementById('time');
const chapterEl = document.getElementById('chapter');
const playBtn = document.getElementById('play');
const muteBtn = document.getElementById('mute');
const fsBtn = document.getElementById('fs');
const replayBtn = document.getElementById('replay');

const CH = chapters();
for (const c of CH) {
  const tick = document.createElement('i');
  tick.style.left = `${(c.start / DURATION) * 100}%`;
  tick.title = c.title;
  document.getElementById('ticks').appendChild(tick);
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function updateBar() {
  const t = now();
  fillEl.style.width = `${(t / DURATION) * 100}%`;
  timeEl.textContent = `${fmt(t)} / ${fmt(DURATION)}`;
  let ch = CH[0];
  for (const c of CH) if (t >= c.start - 0.01) ch = c;
  chapterEl.textContent = ch ? ch.title : '';
}

async function begin() {
  ui.classList.add('started');
  if (!score) {
    try {
      const { Score } = await import('./score.js');
      score = new Score();
      if (params.has('mute')) score.setMuted(true);
      muteBtn.classList.toggle('off', score.muted);
    } catch (e) {
      console.warn('no sound:', e);
    }
  }
  play();
}

startBtn.addEventListener('click', begin);
replayBtn.addEventListener('click', () => { seek(0); play(); });
playBtn.addEventListener('click', () => (playing ? pause() : play()));
muteBtn.addEventListener('click', () => {
  if (!score) return;
  score.setMuted(!score.muted);
  muteBtn.classList.toggle('off', score.muted);
});
fsBtn.addEventListener('click', toggleFs);
function toggleFs() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

let dragging = false;
function scrubTo(e) {
  const r = bar.getBoundingClientRect();
  seek(clamp((e.clientX - r.left) / r.width) * DURATION);
}
bar.addEventListener('pointerdown', (e) => { dragging = true; bar.setPointerCapture(e.pointerId); scrubTo(e); });
bar.addEventListener('pointermove', (e) => { if (dragging) scrubTo(e); });
bar.addEventListener('pointerup', () => { dragging = false; });

let idleTimer = 0;
function wake() {
  ui.classList.add('awake');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => ui.classList.remove('awake'), 2600);
}
window.addEventListener('pointermove', wake);
window.addEventListener('keydown', (e) => {
  if (!ui.classList.contains('started')) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); begin(); }
    return;
  }
  wake();
  const t = now();
  if (e.key === ' ' || e.key === 'k') { e.preventDefault(); playing ? pause() : play(); }
  else if (e.key === 'ArrowRight') seek(t + 10);
  else if (e.key === 'ArrowLeft') seek(t - 10);
  else if (e.key === ']') { const n = TIMELINE.find((s) => s.start > t + 0.5); if (n) seek(n.start); }
  else if (e.key === '[') { const p = [...TIMELINE].reverse().find((s) => s.start < t - 2); seek(p ? p.start : 0); }
  else if (e.key === 'm') muteBtn.click();
  else if (e.key === 'f') toggleFs();
});

let reported = false;
function loop() {
  requestAnimationFrame(loop);
  if (!playing) return;
  try {
    const t = now();
    if (t >= DURATION) {
      T = DURATION; playing = false;
      if (score) score.stop();
      ui.classList.remove('playing'); ui.classList.add('ended');
    }
    render();
    updateBar();
  } catch (e) {
    // one bad frame must never stop the film
    if (!reported) { console.error(e); reported = true; }
  }
}

// ─── boot ─────────────────────────────────────────────────────────────────

window.addEventListener('resize', resize);
const fontsReady = Promise.all([
  document.fonts.load(`italic 500 50px "Cormorant Garamond"`),
  document.fonts.load(`400 50px "Cormorant Garamond"`),
  document.fonts.load(`400 20px Jost`),
  document.fonts.load(`400 20px KaTeX_Main`),
  document.fonts.load(`italic 400 20px KaTeX_Math`),
]).catch(() => {});

let startAt = Number(params.get('t')) || 0;
if (params.get('scene')) {
  const s = sceneById(params.get('scene'));
  if (s) startAt = s.start + (Number(params.get('at')) || 0);
}
T = clamp(startAt, 0, DURATION);

fontsReady.then(() => {
  buildEquations();
  resize();
  render();
  updateBar();
  if (STILL) { document.body.classList.add('still'); window.__ready = true; return; }
  requestAnimationFrame(loop);
  window.__ready = true;
});

// For the tools, the tests and the curious.
window.film = {
  seek, play, pause, render, duration: DURATION, timeline: TIMELINE,
  get time() { return now(); },
  frame: (t) => { T = clamp(t, 0, DURATION); render(); },
};
