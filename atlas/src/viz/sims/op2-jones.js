// Polarization through a chain of elements, by Jones calculus (PHYS 4650
// O6). Light (a Jones vector, or unpolarized) passes polarizers, quarter- and
// half-wave plates, general retarders and rotators. Two views:
//
//   chain   the state before and after every element as the ellipse its
//           electric field traces (seen facing the oncoming wave), with an
//           arrow for the sense of rotation and the irradiance; each element
//           drawn with its transmission or fast axis
//   sphere  the same states as points on the Poincaré sphere (S₁ right,
//           S₂ into the picture, S₃ up): a retarder turns the state about its
//           fast axis on the equator by its retardance (drawn as an arc), a
//           polarizer projects it onto its own point (dashed)
//   both    the chain above the sphere
//
// Physics in model/op2-jones.js (tested in test/op2-jones.test.mjs). The
// convention is Hecht's: (1, i)/√2 turns counterclockwise facing the wave,
// “left-circular”, at the top of the sphere (S₃ = +1).
//
//   { type: 'op2-jones', params: {
//       input: { angle: 0 },          // linear at an angle (°); or { jones: [[re, im], [re, im]] };
//                                     // or 'unpolarized', 'ccw', 'cw'
//       elements: [{ kind: 'pol' | 'qwp' | 'hwp' | 'ret' | 'rot', angle: 0, delta: 90, label: '' }],
//       view: 'chain',                // 'chain' | 'sphere' | 'both'
//       controls: [],                 // sliders { key, label, min, max, step, value, unit, explain,
//                                     //   set: [[elementIndex, 'angle' | 'delta']] or 'in' (the input angle) }
//       readouts: null,               // rows: jones I psi chi hand stokes (of the output); default I psi hand
//       hide: [],                     // rows not to show; also 'states' (draw only the input), 'out' (hide the
//                                     // output state's picture) or 'intensity' (no I under the panels)
//       play: false,                  // animate the field vectors (also a Play button)
//       yaw: 35, pitch: 22,           // sphere camera (°)
//       labels: true,
//   } }

import { Plot } from '../plot.js';
import * as J from '../model/op2-jones.js';

export const defaults = { input: { angle: 0 }, elements: [], view: 'chain', controls: [], readouts: null, hide: [], play: false, yaw: 35, pitch: 22, labels: true };
const KINDS = ['pol', 'qwp', 'hwp', 'ret', 'rot'];
const ROWS = ['jones', 'I', 'psi', 'chi', 'hand', 'stokes'];
const HIDES = [...ROWS, 'states', 'out', 'intensity'];
const trim = (x, n = 3) => String(+(+x).toPrecision(n)).replace('-', '−');
const D = J.DEG;
const STATE_COL = ['gold', 'teal', 'violet', 'warn', 'good', 'accent2', 'bad'];

function inputVector(inp, angle) {
  if (inp === 'unpolarized') return 'unpolarized';
  if (inp === 'ccw') return J.CCW;
  if (inp === 'cw') return J.CW;
  if (inp && inp.jones) { const v = inp.jones.map((c) => [c[0], c[1] ?? 0]); const n = Math.sqrt(J.intensity(v)); return v.map((c) => [c[0] / n, c[1] / n]); }
  return J.linear((angle ?? inp?.angle ?? 0) * D);
}

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const els = P.elements.map((e) => ({ ...e }));
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  let inAngle = P.input && typeof P.input === 'object' && 'angle' in P.input ? P.input.angle : 0;
  for (const c of P.controls || []) F.slider({ key: c.key, label: c.label, min: c.min, max: c.max, step: c.step ?? 1, value: c.value, unit: c.unit ?? '^\\circ', explain: c.explain || '' });
  const both = P.view === 'both';
  const { canvas } = F.canvas({ aspect: both ? '' : 'wide', label: P.alt || 'Polarization states through a chain of polarizers and wave plates' });
  const pl = new Plot(canvas, { x: [0, 1], y: [0, 1], grid: false, axes: false, pad: { l: 0, r: 0, t: 0, b: 0 } });
  const st = { ph: 0, running: !!P.play && !reduced };
  const anim = F.animate((dt) => { if (!st.running) return; st.ph += dt * 2 * Math.PI * 0.35; draw(); }, { force: true });
  if (!F.compact || P.play) {
    const btn = F.button({ label: st.running ? 'Pause' : 'Play', onClick: () => { st.running = !st.running; btn.textContent = st.running ? 'Pause' : 'Play'; if (st.running) anim.start(); else draw(); } });
  }

  function sync() {
    for (const c of P.controls || []) {
      const v = +F.params[c.key];
      if (c.set === 'in') { inAngle = v; continue; }
      for (const [i, prop] of c.set || []) els[i][prop] = v;
    }
  }

  function draw() {
    sync();
    pl.resize();
    const W = pl.w, H = pl.h;
    pl.setView([0, W], [0, H]);
    pl.clear();
    const res = J.chain(inputVector(P.input, inAngle), els);
    if (P.view === 'chain') drawChain(res, 0, 0, W, H);
    else if (P.view === 'sphere') drawSphere(res, 0, 0, W, H);
    else { drawChain(res, 0, H * 0.58, W, H * 0.42); drawSphere(res, 0, 0, W, H * 0.58); }
    readout(res);
  }

  // world coordinates are pixels with y up (Plot's view is set to [0, W] × [0, H])
  function drawChain(res, x0, y0, w, h) {
    const n = els.length, cols = 2 * n + 1, cw = w / cols, fs = cw < 70 ? 9.5 : 11;
    const r = Math.min(cw * 0.4, h * 0.3), cy = y0 + h * 0.55;
    // the beam axis
    pl.line(x0 + cw * 0.15, cy, x0 + w - cw * 0.15, cy, { color: 'ink4', width: 1, dash: [4, 4] });
    for (let j = 0; j <= n; j++) {
      const cx = x0 + cw * (2 * j + 0.5), s = res[j];
      const show = !(hide.has('states') && j > 0) && !(hide.has('out') && j === n);
      pl.circle(cx, cy, r, { color: 'ink4', width: 1, fill: 'bg', alpha: 1, strokeAlpha: 0.8 });
      if (show) drawState(s, cx, cy, r, STATE_COL[j % STATE_COL.length]);
      else if (P.labels) pl.text('?', cx, cy, { color: 'ink2', size: 16, align: 'center', weight: 700 });
      if (P.labels) {
        pl.text(j === 0 ? 'in' : j === n ? 'out' : `after ${j}`, cx, cy + r, { color: 'ink2', size: fs, align: 'center', dy: -9 });
        if (!hide.has('intensity') && show) pl.text(`I = ${trim(s.I, 3)}`, cx, cy - r, { color: 'ink2', size: fs, align: 'center', dy: 11 });
      }
    }
    els.forEach((el, i) => {
      const cx = x0 + cw * (2 * i + 1.5);
      drawElement(el, cx, cy, Math.min(r, cw * 0.38), fs);
    });
  }

  function drawState(s, cx, cy, r, color) {
    if (!s.v) {
      // unpolarized: a starburst of short double arrows
      for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 6; pl.line(cx - 0.8 * r * Math.cos(a), cy - 0.8 * r * Math.sin(a), cx + 0.8 * r * Math.cos(a), cy + 0.8 * r * Math.sin(a), { color, width: 1.6, alpha: 0.8 }); }
      return;
    }
    // amplitudes relative to an input of irradiance 1
    const pts = [];
    for (let k = 0; k <= 96; k++) { const f = J.fieldAt(s.v, (2 * Math.PI * k) / 96); pts.push([cx + f[0] * r * 0.9, cy + f[1] * r * 0.9]); }
    pl.path(pts, { color, width: 2.2 });
    const e = J.ellipse(s.v);
    if (s.I < 1e-6) { pl.point(cx, cy, { color, r: 3 }); return; }
    if (e.hand !== 0) {
      // an arrowhead showing the sense of rotation
      const a = J.fieldAt(s.v, 0.9), b = J.fieldAt(s.v, 1.05);
      pl.arrow(cx + a[0] * r * 0.9, cy + a[1] * r * 0.9, cx + b[0] * r * 0.9, cy + b[1] * r * 0.9, { color, width: 2.2, head: 9 });
    }
    // the field now
    const f = J.fieldAt(s.v, st.ph);
    pl.arrow(cx, cy, cx + f[0] * r * 0.9, cy + f[1] * r * 0.9, { color: 'ink', width: 1.6, head: 7 });
  }

  function drawElement(el, cx, cy, r, fs) {
    const th = (el.angle ?? 0) * D, c = Math.cos(th), s = Math.sin(th);
    const kindCol = el.kind === 'pol' ? 'accent' : el.kind === 'rot' ? 'violet' : 'good';
    pl.circle(cx, cy, r * 0.95, { color: kindCol, width: 2, fill: kindCol, alpha: 0.1, strokeAlpha: 1 });
    if (el.kind === 'pol') {
      // the transmission axis, with a few hatch lines parallel to it
      for (const o of [-0.5, 0, 0.5]) { const L = Math.sqrt(1 - o * o) * r * 0.9; pl.line(cx - L * c - o * r * s, cy - L * s + o * r * c, cx + L * c - o * r * s, cy + L * s + o * r * c, { color: kindCol, width: o === 0 ? 2.6 : 1, alpha: o === 0 ? 1 : 0.6 }); }
    } else if (el.kind === 'rot') {
      pl.arrow(cx + r * 0.6, cy, cx + r * 0.6 * Math.cos(th), cy + r * 0.6 * Math.sin(th), { color: kindCol, width: 2 });
    } else {
      pl.line(cx - r * 0.9 * c, cy - r * 0.9 * s, cx + r * 0.9 * c, cy + r * 0.9 * s, { color: kindCol, width: 2.6 });
      pl.line(cx - r * 0.5 * s, cy + r * 0.5 * c, cx + r * 0.5 * s, cy - r * 0.5 * c, { color: kindCol, width: 1, dash: [3, 3] });
      if (P.labels && r > 26) pl.text('fast', cx + r * 0.9 * c, cy + r * 0.9 * s, { color: kindCol, size: 9.5, align: c >= 0 ? 'left' : 'right', dx: c >= 0 ? 3 : -3 });
    }
    if (P.labels) {
      const name = el.label || (el.kind === 'pol' ? 'polarizer' : el.kind === 'qwp' ? 'λ/4' : el.kind === 'hwp' ? 'λ/2' : el.kind === 'rot' ? 'rotator' : `${trim(el.delta ?? 90, 3)}° plate`);
      pl.text(name, cx, cy + r, { color: kindCol, size: fs, align: 'center', dy: -9, weight: 600 });
      pl.text(`${trim(el.angle ?? 0, 3)}°`, cx, cy - r, { color: 'ink2', size: fs, align: 'center', dy: 11 });
    }
  }

  function drawSphere(res, x0, y0, w, h) {
    const R = Math.min(w * 0.3, h * 0.4), cx = x0 + w / 2, cy = y0 + h / 2;
    const yaw = P.yaw * D, pit = P.pitch * D;
    // S1 right, S2 into the picture, S3 up; turn by yaw about S3, tilt by pitch
    const proj = ([a, b, c]) => {
      const x = a * Math.cos(yaw) + b * Math.sin(yaw), yv = -a * Math.sin(yaw) + b * Math.cos(yaw);
      // the camera looks slightly down: far points (yv > 0) rise on the screen, the north pole faces the camera
      const z = c * Math.cos(pit) + yv * Math.sin(pit), depth = yv * Math.cos(pit) - c * Math.sin(pit);
      return [cx + R * x, cy + R * z, depth];
    };
    const curve3 = (pts, o) => {
      let seg = [], back = null;
      const flush = () => { if (seg.length > 1) pl.path(seg, { ...o, dash: back ? [3, 4] : o.dash, alpha: back ? 0.45 : o.alpha ?? 1 }); };
      for (const p of pts) { const q = proj(p), b = q[2] > 0; if (back !== null && b !== back) { seg.push([q[0], q[1]]); flush(); seg = []; } back = b; seg.push([q[0], q[1]]); }
      flush();
    };
    pl.circle(cx, cy, R, { color: 'ink3', width: 1.4 });
    const ring = (f) => Array.from({ length: 121 }, (_, k) => f((2 * Math.PI * k) / 120));
    curve3(ring((a) => [Math.cos(a), Math.sin(a), 0]), { color: 'ink3', width: 1.2 });
    curve3(ring((a) => [Math.cos(a), 0, Math.sin(a)]), { color: 'ink4', width: 1 });
    const fs = 10.5;
    const mark = (p, label, color = 'ink2', dx = 0, dy = 0) => { const q = proj(p); pl.point(q[0], q[1], { color, r: 2.5 }); if (P.labels) pl.text(label, q[0], q[1], { color, size: fs, dx: 6 + dx, dy: -6 + dy }); };
    mark([1, 0, 0], 'H (0°)'); mark([-1, 0, 0], 'V (90°)', 'ink2', -52); mark([0, 1, 0], '+45°'); mark([0, -1, 0], '−45°');
    mark([0, 0, 1], 'L: ccw facing the wave', 'ink2', 0, -4); mark([0, 0, -1], 'R: cw', 'ink2', 0, 14);
    // the states and the paths between them
    let prev = res[0];
    const unit = (v) => { const s = J.stokes(v); return [s[1] / s[0], s[2] / s[0], s[3] / s[0]]; };
    els.forEach((el, i) => {
      const nxt = res[i + 1];
      if (prev.v && nxt.v && nxt.I > 1e-9) {
        if (el.kind === 'pol') { const a = proj(unit(prev.v)), b = proj(unit(nxt.v)); pl.line(a[0], a[1], b[0], b[1], { color: 'accent', width: 1.4, dash: [5, 4] }); }
        else if (el.kind === 'rot') curve3(Array.from({ length: 41 }, (_, k) => unit(J.apply(J.rotator(((el.angle ?? 0) * D * k) / 40), prev.v))), { color: 'violet', width: 2.2 });
        else curve3(J.retarderPath(prev.v, el), { color: 'good', width: 2.4 });
      }
      prev = nxt;
    });
    res.forEach((s, j) => {
      if (!s.v || s.I < 1e-9) return;
      if ((hide.has('states') && j > 0) || (hide.has('out') && j === res.length - 1)) return;
      const q = proj(unit(s.v));
      pl.point(q[0], q[1], { color: STATE_COL[j % STATE_COL.length], r: 5 });
      if (P.labels) pl.text(j === 0 ? 'in' : j === res.length - 1 ? 'out' : String(j), q[0], q[1], { color: STATE_COL[j % STATE_COL.length], size: fs, weight: 700, dx: -14, dy: 10 });
    });
  }

  function readout(res) {
    if (P.readout === false) { F.readout([]); return; }
    const last = res[res.length - 1];
    const rows = (P.readouts || ['I', 'psi', 'hand']).filter((k) => !hide.has(k));
    const out = [];
    const c = (z) => { const re = Math.abs(z[0]) < 5e-4 ? 0 : z[0], im = Math.abs(z[1]) < 5e-4 ? 0 : z[1]; if (!im) return trim(re); if (!re) return `${trim(im)}i`; return `${trim(re)} ${im < 0 ? '-' : '+'} ${trim(Math.abs(im))}i`; };
    for (const k of rows) {
      if (!last.v) { if (k === 'I') out.push(['out: $I$', trim(last.I)]); else if (k === 'hand') out.push(['out', '\\text{unpolarized}']); continue; }
      const e = J.ellipse(last.v), S = J.stokes(last.v);
      if (k === 'I') out.push(['out: $I$', trim(last.I)]);
      else if (k === 'jones') {
        // remove the global phase: make E_x real and non-negative (or E_y if E_x = 0)
        const ref = J.cabs2(last.v[0]) > 1e-9 ? last.v[0] : last.v[1], m = Math.sqrt(J.cabs2(ref)), ph = J.conj([ref[0] / m, ref[1] / m]);
        const v = last.v.map((z) => J.cmul(z, ph));
        out.push(['out: Jones vector', `\\begin{pmatrix}${c(v[0])}\\\\ ${c(v[1])}\\end{pmatrix}`]);
      } else if (k === 'psi') out.push(['azimuth $\\psi$', Math.abs(S[3]) > 0.999 * S[0] ? '\\text{— (circular)}' : `${trim(e.psi / D, 3)}^\\circ`]);
      else if (k === 'chi') out.push(['ellipticity $b/a$', trim(Math.abs(Math.tan(e.chi)), 3)]);
      else if (k === 'hand') out.push(['turn (facing the wave)', e.hand > 0 ? '\\text{counterclockwise (L)}' : e.hand < 0 ? '\\text{clockwise (R)}' : '\\text{linear}']);
      else if (k === 'stokes') out.push(['Stokes $(S_1, S_2, S_3)/S_0$', `(${trim(S[1] / S[0], 2)}, ${trim(S[2] / S[0], 2)}, ${trim(S[3] / S[0], 2)})`]);
    }
    F.readout(out);
  }

  F.onChange(() => draw());
  F.draw(draw);
  F.caption('Ideal elements (lossless wave plates, perfect polarizers); the input has irradiance 1. The ellipses are seen facing the oncoming wave; Hecht’s naming: counterclockwise = left-circular. On the sphere, dashed parts lie behind it.');
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const out = [];
  const inp = P.input;
  if (!(inp === 'unpolarized' || inp === 'ccw' || inp === 'cw' || (inp && typeof inp === 'object' && (typeof inp.angle === 'number' || (Array.isArray(inp.jones) && inp.jones.length === 2)))))
    out.push("op2-jones: input must be { angle }, { jones: [[re, im], [re, im]] }, 'unpolarized', 'ccw' or 'cw'");
  if (!Array.isArray(P.elements)) return [...out, 'op2-jones: elements must be a list'];
  if (P.elements.length > 6) out.push('op2-jones: at most 6 elements');
  P.elements.forEach((e, i) => {
    if (!KINDS.includes(e.kind)) out.push(`op2-jones: element ${i} kind must be one of ${KINDS.join(', ')}`);
    if (typeof (e.angle ?? 0) !== 'number') out.push(`op2-jones: element ${i} angle must be a number (degrees)`);
    if (e.kind === 'ret' && typeof (e.delta ?? 90) !== 'number') out.push(`op2-jones: element ${i} delta must be a number (degrees)`);
  });
  if (!['chain', 'sphere', 'both'].includes(P.view)) out.push('op2-jones: view must be chain, sphere or both');
  for (const r of P.readouts || []) if (!ROWS.includes(r)) out.push(`op2-jones: unknown readout ${r}`);
  for (const r of P.hide || []) if (!HIDES.includes(r)) out.push(`op2-jones: unknown hide ${r}`);
  for (const c of P.controls || []) {
    if (!c.key || typeof c.label !== 'string' || !(c.min < c.max) || typeof c.value !== 'number' || !c.explain) out.push(`op2-jones: control ${c.key} needs key, label, min < max, value and explain`);
    if (!(c.set === 'in' || (Array.isArray(c.set) && c.set.every((s) => Array.isArray(s) && P.elements[s[0]] && ['angle', 'delta'].includes(s[1]))))) out.push(`op2-jones: control ${c.key} set must be 'in' or [[element, 'angle' | 'delta'], …]`);
  }
  return out;
}
