// The projector: sizes the canvas, keeps the clock, draws whichever scenes
// are on screen (dissolving between them), lays the captions over the top,
// and runs the controls. The clock follows the audio hardware whenever sound
// is running, so picture and score cannot drift apart.

import { W, H, clamp, smooth, lerp } from './kit.js';
import { TIMELINE, DURATION, activeAt, sceneById, chapters } from './script.js';
import { view, layer, grain, text, clearCaches, SERIF, SANS } from './paint.js';
import { SCENE_DRAW } from './scenes/index.js';

const canvas = document.getElementById('film');
const ctx = canvas.getContext('2d', { alpha: false });
const params = new URLSearchParams(location.search);
const STILL = params.has('still');

// ─── sizing ───────────────────────────────────────────────────────────────

const frame = { x: 0, y: 0, w: W, h: H, scale: 1, dpr: 1 };
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const q = Number(params.get('q')) || 1;
  let dpr = Math.min(window.devicePixelRatio || 1, 2) * q;
  const scale = Math.min(vw / W, vh / H);
  // cap the backing store near 2560 px of film width; beyond that the canvas
  // costs more than it shows
  dpr = Math.min(dpr, 2560 / (W * scale));
  frame.scale = scale; frame.dpr = dpr;
  frame.w = W * scale; frame.h = H * scale;
  frame.x = (vw - frame.w) / 2; frame.y = (vh - frame.h) / 2;
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  canvas.style.width = vw + 'px';
  canvas.style.height = vh + 'px';
  const px = Math.round(scale * dpr * 1000) / 1000;
  if (px !== view.px) { view.px = px; clearCaches(); }
  if (!playing) render();
}

// ─── clock ────────────────────────────────────────────────────────────────

let score = null;            // the soundtrack, once the viewer has pressed play
let playing = false;
let T = 0;                   // film time, seconds
let wallAnchor = 0, filmAnchor = 0;

function now() {
  let t = T;
  if (playing && score && score.running) t = score.filmTime();
  else if (playing) t = filmAnchor + (performance.now() - wallAnchor) / 1000;
  // the audio clock starts a few milliseconds behind its anchor
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

function drawScene(g, s, T) {
  const t = T - s.start;
  const fn = SCENE_DRAW[s.id];
  g.save();
  if (fn) fn(g, t, s);
  else { g.fillStyle = '#111'; g.fillRect(0, 0, W, H); }
  g.restore();
  // fades through black
  let k = 1;
  if (s.fadeIn) k = Math.min(k, smooth(t / s.fadeIn));
  if (s.fadeOut) k = Math.min(k, smooth((s.dur - t) / s.fadeOut));
  if (k < 1) { g.fillStyle = `rgba(0,0,0,${1 - k})`; g.fillRect(-4, -4, W + 8, H + 8); }
}

function render() {
  const t = now();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const k = frame.scale * frame.dpr;
  ctx.setTransform(k, 0, 0, k, frame.x * frame.dpr, frame.y * frame.dpr);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();

  const on = activeAt(t);
  drawScene(ctx, on[0], t);
  if (on[1]) {
    const s = on[1];
    const a = s.xin ? smooth((t - s.start) / s.xin) : 1;
    layer(ctx, a, (g) => drawScene(g, s, t));
  }
  for (const s of on) captions(ctx, s, t - s.start, on.length > 1 && s === on[0] ? 1 - smooth((t - on[1].start) / (on[1].xin || 1)) : 1);
  grain(ctx, t, 0.07);
  ctx.restore();
}

// ─── captions ─────────────────────────────────────────────────────────────

function wrap(g, str, font, maxW) {
  g.font = font;
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const tryL = cur ? cur + ' ' + w : w;
    if (g.measureText(tryL).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tryL;
  }
  if (cur) lines.push(cur);
  // balance two lines so the second is not a lonely word
  if (lines.length === 2) {
    const all = str.split(' ');
    let best = null, bestD = Infinity;
    for (let i = 1; i < all.length; i++) {
      const a = all.slice(0, i).join(' '), b = all.slice(i).join(' ');
      const wa = g.measureText(a).width, wb = g.measureText(b).width;
      if (wa > maxW || wb > maxW) continue;
      const d = Math.abs(wa - wb);
      if (d < bestD) { bestD = d; best = [a, b]; }
    }
    if (best) return best;
  }
  return lines;
}

function captions(g, s, t, sceneAlpha) {
  for (const c of s.captions) {
    const [at, dur, str, kind, who] = c;
    if (t < at - 0.01 || t > at + dur + 0.01) continue;
    const fi = kind === 'title' ? 2.4 : kind === 'count' ? 0.12 : 0.8;
    const fo = kind === 'title' ? 2 : kind === 'count' ? 0.5 : 0.9;
    const a = Math.min(smooth((t - at) / fi), smooth((at + dur - t) / fo)) * sceneAlpha;
    if (a <= 0.003) continue;
    const rise = (1 - smooth((t - at) / 1.6)) * 8;
    if (kind === 'n' || kind === 'q') {
      const size = 50;
      const font = `italic 500 ${size}px ${SERIF}`;
      const q = kind === 'q' ? `“${str.replace(/^…/, '…')}”` : str;
      const lines = wrap(g, q, font, 1500);
      const lh = size * 1.18;
      const y0 = 968 - (lines.length - 1) * lh + rise;
      // a soft dark bed under the words so they read on any background
      const bedA = 0.34 * a;
      const gr = g.createRadialGradient(W / 2, y0 + (lines.length - 1) * lh / 2 - 14, 10, W / 2, y0 + (lines.length - 1) * lh / 2 - 14, 820);
      gr.addColorStop(0, `rgba(0,0,0,${bedA})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.save();
      g.fillStyle = gr;
      g.translate(W / 2, y0);
      g.scale(1, 0.2);
      g.translate(-W / 2, -y0);
      g.fillRect(0, y0 - 820, W, 1640);
      g.restore();
      if (kind === 'q' && who) text(g, who, W / 2, y0 - 58, { face: SANS, size: 17, spacing: 6, color: '#d9c29a', alpha: a * 0.9, shadow: 10 });
      lines.forEach((l, i) => text(g, l, W / 2, y0 + i * lh, { size, italic: true, weight: 500, color: '#f6efe2', alpha: a, shadow: 16 }));
    } else if (kind === 'place') {
      g.save();
      g.globalAlpha = a * 0.85;
      g.fillStyle = '#eadfca';
      g.fillRect(110, 118, 46 * smooth((t - at) / 1.5), 1.5);
      g.restore();
      text(g, str, 172, 126, { face: SANS, size: 19, spacing: 9, color: '#eadfca', alpha: a * 0.85, align: 'left', shadow: 10 });
    } else if (kind === 'title') {
      const k = smooth((t - at) / 5);
      const spacing = lerp(18, 34, k);
      // fit long titles inside the frame
      g.save();
      g.font = `400 132px ${SERIF}`;
      if ('letterSpacing' in g) g.letterSpacing = `${spacing}px`;
      const tw = g.measureText(str).width;
      g.restore();
      const size = tw > 1640 ? 132 * 1640 / tw : 132;
      text(g, str, W / 2, 520, { size, weight: 400, spacing: spacing * size / 132, color: '#f4ecdc', alpha: a, shadow: 30 });
      if (who) text(g, who, W / 2, 598, { size: 38, italic: true, color: '#d8ccb6', alpha: a * smooth((t - at - 1.2) / 2), shadow: 20 });
    } else if (kind === 'card') {
      text(g, str, W / 2, 548, { size: 60, italic: true, weight: 500, color: '#f2e9da', alpha: a });
      if (who) text(g, who, W / 2, 625, { face: SANS, size: 22, spacing: 8, color: '#bda983', alpha: a * smooth((t - at - 1) / 1.5) });
    } else if (kind === 'count') {
      text(g, str, W / 2, 250, { face: SANS, size: 84, weight: 300, color: '#fff3dc', alpha: a * 0.85, shadow: 20 });
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
]).catch(() => {});

let startAt = Number(params.get('t')) || 0;
if (params.get('scene')) {
  const s = sceneById(params.get('scene'));
  if (s) startAt = s.start + (Number(params.get('at')) || 0);
}
T = clamp(startAt, 0, DURATION);

fontsReady.then(() => {
  resize();
  render();
  updateBar();
  if (STILL) { document.body.classList.add('still'); window.__ready = true; return; }
  requestAnimationFrame(loop);
  window.__ready = true;
});

// For tests and the curious.
window.film = {
  seek, play, pause, render, duration: DURATION, timeline: TIMELINE,
  get time() { return now(); },
  frame: (t) => { T = clamp(t, 0, DURATION); render(); },
};
