// A charged particle in a uniform magnetic field: the circle, the helix, and —
// with an electric field across B — the E×B drift, the velocity selector and
// the mass spectrometer. The velocity (green) and the force (violet) ride with
// the particle; the speed readout stays fixed, because a magnetic force does
// no work. The motion is solved exactly in model/em-lorentz.js (tested
// headlessly in test/em-lorentz.test.mjs); it is non-relativistic, so speeds
// are kept below c/10.
//
//   { type: 'em-lorentz', params: {
//       view: '3d',                        // '3d': B points to the right, the path a circle or helix around it;
//                                          // 'top': looking along B, which points out of (bdir: 'out') or into ('in') the page
//       species: 'proton',                 // electron proton alpha deuteron xenon o2, or { q, m, name } in units of e and u
//       choose: ['proton', 'electron'],    // offer a choice of particle (the picture rescales when it changes)
//       v: 2e6, pitch: 90,                 // speed (m/s, at most c/10); angle between v and B (degrees)
//       B: 0.5, E: 0,                      // tesla; V/m — E points along +y (up the page in the top view), across B
//       sliders: ['v', 'B', 'pitch', 'E'], // built-in sliders (default ranges), or objects { key, min, max, step, value, logScale, label, explain }
//       particles: [{ species, v, dir, at: [x, y], label, labelAt, labelDx, labelDy }],   // top view: several particles; v may be 'v'
//                                          //   (the slider) or 0; labelAt: where along its path the label sits (0–1, default the end);
//                                          //   dir = direction of motion in the page (degrees from +x); at = start (display units)
//       unit: 'cm',                        // length unit of the top view's axes (m cm mm um km); default from the radius
//       x: [..], y: [..],                  // top view range in `unit` (default: fitted to the paths)
//       detector: false,                   // top view: the field fills y > 0 only, and particles stop on the line y = 0 (a mass spectrometer)
//       plates: null,                      // top view: { x0, x1, h } the plates that make E (a velocity selector), in `unit`
//       arrows: ['v', 'F'],                // at the particle: v, F (total force), FB (magnetic part), FE (electric part)
//       arrowsOn: [0],                     // which particles carry the arrows (default: the first, when there are several)
//       turns: 2, path: 'full',            // turns of path drawn; 'full' draws the whole path faintly, 'trail' only where it has been
//       play: true, t: 0.25,               // animate (Play/Pause); play: false draws a still with the particle t periods along
//       readouts: ['r', 'T', 'speed'],     // any of r T f pitch speed K drift land
//       showR: false,                      // top view: draw the radius from the centre, labelled r
//       labels: true } }                   // arrow labels
//
// A picture must not show its answer: set readouts: [] and leave showR off
// when a question asks for the radius.

import { Plot } from '../plot.js';
import { View3D } from '../three-d.js';
import { tex } from '../../ui/dom.js';
import * as M from '../model/em-lorentz.js';

export const defaults = {
  view: '3d', species: 'proton', choose: null, v: 2e6, pitch: 90, B: 0.5, E: 0, sliders: [], particles: null,
  bdir: 'out', unit: null, x: null, y: null, detector: false, plates: null, arrows: ['v', 'F'], turns: 2, path: 'full',
  play: true, t: 0.25, readouts: ['r', 'T', 'speed'], showR: false, labels: true, aspect: null,
};

const VIEWS = ['3d', 'top'];
const READOUTS = ['r', 'T', 'f', 'pitch', 'speed', 'K', 'drift', 'land'];
const ARROWS = ['v', 'F', 'FB', 'FE'];
const UNITS = { km: 1e3, m: 1, cm: 1e-2, mm: 1e-3, um: 1e-6 };
const UNIT_TEXT = { km: 'km', m: 'm', cm: 'cm', mm: 'mm', um: 'μm' };
const VMAX = 0.1 * M.C;
const BUILTIN = ['v', 'B', 'pitch', 'E'];
const DEG = Math.PI / 180;
const CSSVAR = { accent: '--accent', good: '--good', warn: '--warn', bad: '--bad', violet: '--violet', gold: '--gold', teal: '--teal', ink: '--ink', ink2: '--ink-2', ink3: '--ink-3' };

// ─── numbers ────────────────────────────────────────────────────────────────
function texNum(v, n = 3) {
  if (!Number.isFinite(v)) return '\\text{—}';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e4 || a < 1e-2) { const [m, e] = v.toExponential(n - 1).split('e'); return `${m} \\times 10^{${+e}}`; }
  return String(+v.toPrecision(n));
}
const PREFIX = {
  m: [[1e3, '\\mathrm{km}'], [1, '\\mathrm{m}'], [1e-2, '\\mathrm{cm}'], [1e-3, '\\mathrm{mm}'], [1e-6, '\\mu\\mathrm{m}'], [1e-9, '\\mathrm{nm}']],
  s: [[1, '\\mathrm{s}'], [1e-3, '\\mathrm{ms}'], [1e-6, '\\mu\\mathrm{s}'], [1e-9, '\\mathrm{ns}'], [1e-12, '\\mathrm{ps}']],
  Hz: [[1e9, '\\mathrm{GHz}'], [1e6, '\\mathrm{MHz}'], [1e3, '\\mathrm{kHz}'], [1, '\\mathrm{Hz}']],
  eV: [[1e9, '\\mathrm{GeV}'], [1e6, '\\mathrm{MeV}'], [1e3, '\\mathrm{keV}'], [1, '\\mathrm{eV}']],
  T: [[1, '\\mathrm{T}'], [1e-3, '\\mathrm{mT}'], [1e-6, '\\mu\\mathrm{T}'], [1e-9, '\\mathrm{nT}']],
  'V/m': [[1e6, '\\mathrm{MV/m}'], [1e3, '\\mathrm{kV/m}'], [1, '\\mathrm{V/m}']],
};
/** A quantity as TeX with a sensible prefix: si(0.0418, 'm') → 4.18 cm. */
function si(x, unit, n = 3) {
  if (!Number.isFinite(x)) return '\\text{—}';
  if (unit === 'm/s') return `${texNum(x, n)}\\ \\mathrm{m/s}`;
  const list = PREFIX[unit];
  if (Math.abs(x) < 1e-300) return `0\\ ${list.find(([f]) => f === 1)[1]}`;
  const [f, u] = list.find(([f]) => Math.abs(x) >= f * 0.99995) || list[list.length - 1];
  const s = (x / f).toPrecision(n);
  return `${/e/.test(s) ? texNum(x / f, n) : s}\\ ${u}`;
}

// ─── parameters ─────────────────────────────────────────────────────────────
function sliderSpec(s, P) {
  const key = typeof s === 'string' ? s : s.key;
  const v0 = P.v, B0 = P.B, E0 = P.E;
  const base = {
    v: { label: 'Speed $v$', min: v0 / 4, max: Math.min(2 * v0, VMAX), step: v0 / 40, value: v0, logScale: false, fmt: (x) => texNum(x, 3), unit: '\\mathrm{m/s}', explain: 'Faster: a bigger circle, in proportion. The time for one turn does not change.' },
    B: { label: 'Field $B$', min: B0 / 2, max: 2 * B0, step: B0 / 20, value: B0, fmt: (x) => si(x, 'T', 3), unit: '', explain: 'A stronger field bends harder: the radius and the period both scale as 1/B.' },
    pitch: { label: 'Angle between $\\vec v$ and $\\vec B$', min: 0, max: 90, step: 1, value: P.pitch, unit: '^\\circ', explain: 'At 90° the path is a circle. Smaller angles add a steady drift along B: a helix.' },
    E: { label: 'Electric field $E$ (along $+y$)', min: 0, max: E0 > 0 ? 2 * E0 : v0 * B0 * 2, step: (E0 > 0 ? 2 * E0 : v0 * B0 * 2) / 100, value: E0, fmt: (x) => si(x, 'V/m', 3), unit: '', explain: 'Across B, it makes the path drift sideways at E/B.' },
  }[key] || {};
  const o = typeof s === 'string' ? { ...base, key } : { ...base, ...s };
  if (o.unit && o.fmt && (key === 'B' || key === 'E')) o.unit = '';
  return o;
}

/** The particles to draw, at the current control values (lengths in metres). */
function particlesOf(P, vals, U) {
  const sp = vals.species;
  if (P.particles?.length) {
    return P.particles.map((p, k) => {
      const pt = M.particle(p.species ?? sp), v = p.v === 'v' ? vals.v : (p.v ?? vals.v);
      const dir = (p.dir ?? (P.detector ? 90 : 0)) * DEG;
      const at = (p.at || [0, 0]).map((c) => c * U);
      return { ...pt, v, vperp: v, vpar: 0, r0: [at[0], at[1], 0], v0: [v * Math.cos(dir), v * Math.sin(dir), 0], label: p.label ?? pt.short, k };
    });
  }
  const pt = M.particle(sp), v = vals.v, a = vals.pitch * DEG;
  const vperp = v * Math.sin(a), vpar = v * Math.cos(a);
  return [{ ...pt, v, vperp, vpar, r0: null, v0: [vperp, 0, vpar], label: pt.short, k: 0 }];
}

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const is3D = P.view === '3d', compact = !!F.compact;
  const { canvas, overlay } = F.canvas({ aspect: P.aspect ?? 'wide', label: P.alt || (is3D ? 'A charged particle circling or spiralling around a uniform magnetic field — drag to turn the picture' : 'A charged particle’s path in a uniform magnetic field, seen looking along the field') });

  // controls
  if (P.choose?.length > 1) F.choice({ key: '_sp', label: 'Particle', options: P.choose.map((s) => [s, M.SPECIES[s].name]), value: typeof P.species === 'string' ? P.species : P.choose[0], explain: 'Same charge size for the proton and the electron; the electron is 1836 times lighter.' });
  for (const s of P.sliders || []) F.slider(sliderSpec(s, P));
  const vals = () => ({
    species: F.params._sp ?? P.species,
    v: F.params.v !== undefined ? +F.params.v : P.v,
    B: F.params.B !== undefined ? +F.params.B : P.B,
    pitch: F.params.pitch !== undefined ? +F.params.pitch : P.pitch,
    E: F.params.E !== undefined ? +F.params.E : P.E,
  });

  // the display scale, fixed while sliders move (so changes show) and reset when the particle changes
  const S = { running: P.play !== false && !reduced, t: 0, pause: 0 };
  let U = 1, unitName = 'm', ref = null, view = null, plot = null, S3 = 1;
  const refOf = () => {
    const V = vals(), pts = particlesOf(P, V, 1);
    const vd = Math.abs(V.E) / V.B, vr = (p) => Math.max(p.v, vd, 1e-30);
    const rs = pts.map((p) => M.radius(p.m, vr(p), p.q, V.B));
    return { r: Math.max(...rs), v: Math.max(...pts.map(vr)), F: Math.max(...pts.map((p) => Math.abs(p.q) * vr(p) * V.B)), T: Math.max(...pts.map((p) => M.period(p.m, p.q, V.B))) };
  };
  const setScale = () => {
    ref = refOf();
    if (P.unit) unitName = P.unit;
    else {
      const L = 2 * ref.r * (P.E ? 3 : 1);
      unitName = L >= 2e3 ? 'km' : L >= 1 ? 'm' : L >= 0.01 ? 'cm' : L >= 1e-3 ? 'mm' : 'um';
    }
    U = UNITS[unitName];
    // 3D: one display unit per orbit radius — or less, so that the turns asked for fit the window along B
    const V = vals(), p0 = particlesOf(P, V, 1)[0];
    const along = P.turns * M.pitch(p0.m, p0.vpar, p0.q, V.B);
    S3 = Math.min(1 / ref.r, along > 0 ? (2 * 3) / along : Infinity);
  };
  setScale();

  // ─── the motion of each particle ─────────────────────────────────────────
  const Bz = () => (is3D || P.bdir !== 'in' ? 1 : -1) * vals().B;
  function tracks() {
    const V = vals(), B = Bz();
    return particlesOf(P, V, U).map((p) => {
      const W = M.omega(p.q, p.m, B), T = M.period(p.m, p.q, B);
      let r0 = p.r0;
      if (!r0) {
        // centre the circle on the origin; a drifting orbit starts upstream; a helix starts at the back of the 3D window
        r0 = [-p.v0[1] / W, (p.v0[0] - V.E / B) / W, 0];
        if (V.E && !is3D) r0[0] -= Math.sign(V.E / B) * (P.turns * T * Math.abs(V.E / B)) / 2;
        if (is3D && p.vpar) {
          const along = Math.min(2 * Yw / scale3(), P.turns * M.pitch(p.m, p.vpar, p.q, B));   // the length of helix shown
          r0[2] = -Math.sign(p.vpar) * along / 2;
        }
      }
      const cfg = { q: p.q, m: p.m, B, E: V.E, r0, v0: p.v0 };
      let tEnd = P.turns * T;
      if (P.detector && !is3D) tEnd = T / 2;
      if (is3D && p.vpar) tEnd = Math.min(tEnd, (2 * Yw) / scale3() / Math.abs(p.vpar));
      if (P.plates && !is3D) {
        const { x0, x1, h } = P.plates;
        const n = 600, span = P.turns * T;
        for (let k = 1; k <= n; k++) {
          const tt = (span * k) / n, r = M.stateAt(cfg, tt).r;
          if (r[0] / U > x1 || r[0] / U < x0 - 1e-9 || Math.abs(r[1] / U) > h) { tEnd = tt; break; }
        }
      }
      return { ...p, cfg, T, tEnd, W };
    });
  }

  // ─── the 3D view ─────────────────────────────────────────────────────────
  const Yw = 3;                                                      // the window along B, in display units
  const scale3 = () => S3;                                           // display units per metre
  const D3 = (r) => { const s = scale3(); return [r[1] * s, r[2] * s, r[0] * s]; };   // model (x, y, z) → display: B (ẑ) to the right
  const Dv = (v) => [v[1], v[2], v[0]];
  if (is3D) {
    view = new View3D(canvas, { yaw: P.yaw ?? 0.62, pitch: P.camPitch ?? 0.3, dist: P.dist ?? 17, scale: P.scale ?? 2.3, target: [0, 0, 0] });
    view.onChange = () => draw();
    const hint = document.createElement('div');
    hint.textContent = 'drag to rotate';
    Object.assign(hint.style, { position: 'absolute', right: '10px', bottom: '6px', fontSize: '.72rem', color: 'var(--ink-3)' });
    overlay.append(hint);
  } else {
    plot = new Plot(canvas, { x: [-1, 1], y: [-1, 1], equal: true, grid: P.grid ?? true, axes: P.axes ?? true, xlabel: `x (${UNIT_TEXT[unitName]})`, ylabel: `y (${UNIT_TEXT[unitName]})`, xticks: compact ? 6 : undefined, yticks: compact ? 5 : undefined });
  }

  // the top view's range: fitted to the paths at the starting values, then kept
  const fitTop = () => {
    if (P.x && P.y) { plot.setView(P.x, P.y); return; }
    const pts = [];
    for (const tr of tracks()) for (const r of M.path(tr.cfg, 0, tr.tEnd, 160)) pts.push([r[0] / U, r[1] / U]);
    if (P.plates) pts.push([P.plates.x0, P.plates.h], [P.plates.x1, -P.plates.h]);
    if (P.detector) pts.push([0, 0]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const pad = 0.14 * Math.max(x1 - x0, y1 - y0, 1e-9);
    x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
    if (P.detector) y0 = Math.min(y0, -0.18 * (y1 - y0));
    plot.setView([x0, x1], [y0, y1]);
  };
  if (!is3D) fitTop();

  // Play / Pause, and the animation clock (one turn of the slowest particle ≈ 3.5 s)
  let playBtn = null;
  if (P.play !== false && !compact) {
    playBtn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => { S.running = !S.running; playBtn.textContent = S.running ? 'Pause' : 'Play'; if (S.running) anim?.start(); } });
    F.button({ label: 'Restart', onClick: () => { S.t = 0; S.pause = 0; draw(); } });
  }
  const anim = P.play === false ? null : F.animate((dt) => {
    if (!S.running) return;
    const trs = tracks(), end = Math.max(...trs.map((tr) => tr.tEnd)), Tmax = Math.max(...trs.map((tr) => tr.T));
    if (S.pause > 0) { S.pause -= dt; if (S.pause <= 0) S.t = 0; draw(); return; }
    S.t += (dt / 3.5) * Tmax;
    const loops = trs.every((tr) => !tr.vpar && !P.detector && !P.plates && !tr.cfg.E);
    if (S.t >= end) { if (loops) S.t %= end; else { S.t = end; S.pause = 1.2; } }
    draw();
  }, { force: true });
  if (P.play === false) S.t = P.t * tracks()[0].T;

  F.onChange((key) => {
    if (key === '_sp') { setScale(); if (!is3D) { plot.o.xlabel = `x (${UNIT_TEXT[unitName]})`; plot.o.ylabel = `y (${UNIT_TEXT[unitName]})`; fitTop(); } S.t = 0; }
    if (key === 'pitch' || key === 'E') S.t = 0;
    draw();
  });

  // TeX labels in the overlay (3D)
  const pool = [];
  const cssColor = (n) => `var(${CSSVAR[n] || '--ink'})`;
  function place(marks) {
    marks.forEach(([sx, sy, label, color], k) => {
      let el = pool[k];
      if (!el) { el = document.createElement('div'); el.className = 'lbl'; overlay.append(el); pool.push(el); }
      el.style.display = ''; el.style.left = `${sx}px`; el.style.top = `${sy}px`; el.style.color = cssColor(color);
      if (el.dataset.src !== label) { el.dataset.src = label; el.innerHTML = tex(label); }
    });
    for (let k = marks.length; k < pool.length; k++) pool[k].style.display = 'none';
  }

  const arrowsOf = (tr, s) => {
    const want = P.arrows || [];
    const V = vals(), B = Bz(), out = [];
    const FB = [tr.q * s.v[1] * B, -tr.q * s.v[0] * B, 0], FE = [0, tr.q * V.E, 0], Ft = [FB[0] + FE[0], FB[1] + FE[1], 0];
    if (want.includes('v')) out.push(['v', s.v, ref.v, 'good', '\\vec v', 'v']);
    if (want.includes('F')) out.push(['F', Ft, ref.F, 'violet', '\\vec F', 'F']);
    if (want.includes('FB')) out.push(['FB', FB, ref.F, 'violet', 'q\\vec v\\times\\vec B', 'qv×B']);
    if (want.includes('FE') && V.E) out.push(['FE', FE, ref.F, 'gold', 'q\\vec E', 'qE']);
    return out;
  };

  function draw() {
    const trs = tracks(), V = vals();
    if (is3D) draw3D(trs, V); else drawTop(trs, V);
    readouts(trs, V);
  }

  function draw3D(trs) {
    view.begin();
    const marks = [];
    // field lines along B, on a grid around the orbit
    const R = Math.max(1.0, 1.75 * S3 * ref.r);
    for (const [X, Z] of [[-R, -R], [-R, R], [R, -R], [R, R], [0, -1.35 * R], [0, 1.35 * R]]) {
      view.arrow([X, -Yw - 0.4, Z], [X, Yw + 0.4, Z], { color: 'teal', width: 1 });
    }
    { const [sx, sy, z] = view.project([0, Yw + 0.85, 1.35 * R]); if (z > 0.05) marks.push([sx, sy, '\\vec B', 'teal']); }
    for (const tr of trs) {
      const col = tr.q > 0 ? 'bad' : 'accent';
      const t = Math.min(S.t, tr.tEnd);
      if (P.path !== 'none') {
        const full = M.path(tr.cfg, 0, tr.tEnd, 240).map(D3);
        if (P.path === 'full') view.line(full, { color: 'ink3', width: 1.2, dash: [4, 4] });
        const n = Math.max(2, Math.ceil(240 * (t / (tr.tEnd || 1))));
        if (t > 0) view.line(M.path(tr.cfg, 0, t, n).map(D3), { color: col, width: 2.4 });
      }
      // the guiding axis
      const c = M.centre(tr.cfg);
      view.line([D3([c[0], c[1], -Yw / scale3()]), D3([c[0], c[1], Yw / scale3()])], { color: 'ink4', width: 1, dash: [3, 5] });
      const s = M.stateAt(tr.cfg, t), p = D3(s.r);
      for (const [, vec, refv, color, label] of arrowsOf(tr, s)) {
        const m = Math.hypot(...vec);
        if (m < 1e-9 * refv) continue;
        const len = (label === '\\vec v' ? 0.95 : 0.75) * (m / refv), d = Dv(vec).map((x) => (x / m) * len);
        const tip = [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
        view.arrow(p, tip, { color, width: 2.6 });
        if (P.labels) { const [sx, sy, z] = view.project([tip[0] + d[0] * 0.2, tip[1] + d[1] * 0.2, tip[2] + d[2] * 0.2]); if (z > 0.05) marks.push([sx, sy, label, color]); }
      }
      view.point(p, { color: col, r: 6 });
    }
    view.end();
    place(marks);
  }

  function drawTop(trs, V) {
    plot.clear();
    const g = plot.ctx, c = plot.col;
    const out = P.bdir !== 'in';
    // the field: ⊙ or ⊗ on a grid (only above the detector line in a spectrometer)
    const step = Math.max(34, Math.min(54, (plot.R - plot.L) / 14));
    g.save(); g.strokeStyle = c.teal; g.fillStyle = c.teal; g.globalAlpha = 0.5; g.lineWidth = 1.2;
    for (let X = plot.L + step / 2; X < plot.R; X += step) for (let Y = plot.T + step / 2; Y < plot.B; Y += step) {
      if (P.detector && plot.iy(Y) < 0) continue;
      g.beginPath(); g.arc(X, Y, 4.5, 0, 2 * Math.PI); g.stroke();
      if (out) { g.beginPath(); g.arc(X, Y, 1.4, 0, 2 * Math.PI); g.fill(); }
      else { g.beginPath(); g.moveTo(X - 3, Y - 3); g.lineTo(X + 3, Y + 3); g.moveTo(X + 3, Y - 3); g.lineTo(X - 3, Y + 3); g.stroke(); }
    }
    g.restore();
    // the plates and the electric field between them
    if (P.plates) {
      const { x0, x1, h } = P.plates, th = 0.05 * h;
      plot.rect(x0, h, x1 - x0, th, { color: 'ink3', alpha: 0.85 });
      plot.rect(x0, -h - th, x1 - x0, th, { color: 'ink3', alpha: 0.85 });
      const up = V.E >= 0;
      plot.text(up ? '−  −  −  −  −' : '+  +  +  +  +', (x0 + x1) / 2, h + 2.2 * th, { align: 'center', color: 'ink2', dy: -6 });
      plot.text(up ? '+  +  +  +  +' : '−  −  −  −  −', (x0 + x1) / 2, -h - 2.2 * th, { align: 'center', color: 'ink2', dy: 8 });
    }
    if (V.E) {
      const xs = P.plates ? [P.plates.x0, P.plates.x1] : [plot.vx0, plot.vx1], ys = P.plates ? [-P.plates.h, P.plates.h] : [plot.vy0, plot.vy1];
      const nx = 6, len = 0.22 * (ys[1] - ys[0]) * Math.sign(V.E);
      for (let i = 0; i < nx; i++) {
        const x = xs[0] + ((i + 0.5) * (xs[1] - xs[0])) / nx;
        plot.arrow(x, -len / 2, x, len / 2, { color: 'gold', width: 1.4, head: 7, alpha: 0.55, label: i === nx - 1 ? 'E' : '', ldx: 6, ldy: 0 });
      }
    }
    // the detector line and the entrance slit
    if (P.detector) {
      g.save(); g.fillStyle = c.teal; g.globalAlpha = 0.05; g.fillRect(plot.L, plot.T, plot.R - plot.L, plot.Y(0) - plot.T); g.restore();
      const gap = 0.012 * (plot.vx1 - plot.vx0);
      plot.line(plot.vx0, 0, -gap, 0, { color: 'ink2', width: 3 });
      plot.line(gap, 0, plot.vx1, 0, { color: 'ink2', width: 3 });
      plot.text('detector', plot.vx1, 0, { align: 'right', dy: 12, color: 'ink3', size: 11 });
      plot.text('slit', 0, 0, { align: 'center', dy: 12, color: 'ink3', size: 11 });
    }
    for (const tr of trs) {
      const col = tr.q > 0 ? 'bad' : 'accent';
      const t = Math.min(S.t, tr.tEnd);
      const toD = (r) => [r[0] / U, r[1] / U];
      if (P.path === 'full') plot.path(M.path(tr.cfg, 0, tr.tEnd, 300).map(toD), { color: 'ink3', width: 1.3, dash: [5, 5] });
      if (P.path !== 'none' && t > 0) plot.path(M.path(tr.cfg, 0, t, Math.max(2, Math.ceil(300 * t / (tr.tEnd || 1)))).map(toD), { color: col, width: 2.4 });
      if (P.showR && !V.E) {
        const ce = M.centre(tr.cfg), s0 = M.stateAt(tr.cfg, t), cx = ce[0] / U, cy = ce[1] / U;
        plot.point(cx, cy, { color: 'ink2', r: 3 });
        plot.line(cx, cy, s0.r[0] / U, s0.r[1] / U, { color: 'ink2', width: 1.4, dash: [4, 3] });
        plot.text('r', (cx + s0.r[0] / U) / 2, (cy + s0.r[1] / U) / 2, { color: 'ink2', dx: 6, dy: -8, weight: 650 });
      }
      const s = M.stateAt(tr.cfg, t), [px, py] = toD(s.r);
      const scale = (0.42 * ref.r) / U;
      const withArrows = (P.arrowsOn ?? (trs.length > 1 ? [0] : [tr.k])).includes(tr.k);
      for (const [key, vec, refv, color, , text] of withArrows ? arrowsOf(tr, s) : []) {
        const m = Math.hypot(vec[0], vec[1]);
        if (m < 1e-6 * refv) continue;
        const len = (key === 'v' ? 1 : 0.8) * scale * (m / refv);
        plot.arrow(px, py, px + (vec[0] / m) * len, py + (vec[1] / m) * len, { color, width: 2.4, head: 9, label: P.labels ? text : '', ldx: 6, ldy: -8 });
      }
      plot.point(px, py, { color: col, r: 6 });
    }
    // labels at the ends of the paths, nudged apart where they would collide
    if (trs.length > 1) {
      const placed = [];
      for (const tr of trs) {
        if (!tr.label) continue;
        const spec = P.particles[tr.k] || {};
        const e = M.stateAt(tr.cfg, tr.tEnd * (spec.labelAt ?? 1)).r, sx = plot.X(e[0] / U);
        let dy = P.detector ? 16 : -14;
        if (spec.labelDy !== undefined) dy = spec.labelDy;
        else while (placed.some(([x, y]) => Math.abs(x - sx) < 46 && Math.abs(y - (plot.Y(e[1] / U) + dy)) < 14)) dy += P.detector ? 15 : -15;
        placed.push([sx, plot.Y(e[1] / U) + dy]);
        plot.text(tr.label, e[0] / U, e[1] / U, { color: tr.q > 0 ? 'bad' : 'accent', dx: spec.labelDx ?? 0, dy, align: 'center', weight: 650 });
      }
    }
  }

  function readouts(trs, V) {
    const want = P.readouts || [], rows = [], tr = trs[0];
    if (!tr) return;
    const B = Math.abs(Bz()), s = M.stateAt(tr.cfg, Math.min(S.t, tr.tEnd)), sp = Math.hypot(...s.v);
    if (want.includes('r')) rows.push(['radius $r = mv_\\perp/(|q|B)$', si(M.radius(tr.m, tr.vperp, tr.q, B), 'm')]);
    if (want.includes('T')) rows.push(['time per turn $T = 2\\pi m/(|q|B)$', si(tr.T, 's')]);
    if (want.includes('f')) rows.push(['turns per second $f = 1/T$', si(1 / tr.T, 'Hz')]);
    if (want.includes('pitch') && is3D) rows.push(['pitch $p = v_\\parallel T$', si(M.pitch(tr.m, tr.vpar, tr.q, B), 'm')]);
    if (want.includes('speed')) rows.push([V.E ? 'speed now' : 'speed (never changes)', si(sp, 'm/s')]);
    if (want.includes('K')) rows.push(['kinetic energy', si(M.kineticEV(tr.m, sp), 'eV')]);
    if (want.includes('drift') && V.E) rows.push(['drift speed $E/B$', si(V.E / B, 'm/s')]);
    if (want.includes('land') && P.detector) for (const t2 of trs) rows.push([`${t2.label} lands at`, si(Math.abs(M.stateAt(t2.cfg, t2.T / 2).r[0]), 'm')]);
    F.readout(rows);
  }

  F.draw(draw);
  F.caption(P.caption || (is3D
    ? 'Exact non-relativistic motion in a uniform field. The picture keeps one scale while you move the sliders and rescales when you change the particle; the arrows show directions, with lengths in proportion to |v| and |F|. Drag to rotate.'
    : `Looking along B, which points ${P.bdir === 'in' ? 'into the page (the crossed circles)' : 'out of the page (the dotted circles)'}. Exact non-relativistic motion; arrow lengths are in proportion to |v| and |F|, not in the axes’ units.`));
  return { get: (k) => (k === 'species' ? vals().species : F.params[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const p = [];
  if (!VIEWS.includes(P.view)) p.push(`em-lorentz: unknown view “${P.view}” (use ${VIEWS.join(', ')})`);
  const sp = (s, where) => {
    if (typeof s === 'string') { if (!M.SPECIES[s]) p.push(`em-lorentz ${where}: unknown species “${s}” (use ${Object.keys(M.SPECIES).join(', ')}, or { q, m } in e and u)`); }
    else if (!s || !(Math.abs(s.q) > 0) || !(s.m > 0)) p.push(`em-lorentz ${where}: a custom particle needs { q, m } in units of e and u`);
  };
  sp(P.species, 'species');
  for (const s of P.choose || []) sp(s, 'choose');
  if (P.choose && !P.choose.includes(P.species)) p.push('em-lorentz: species must be one of choose');
  if (!(P.v > 0 && P.v <= VMAX)) p.push(`em-lorentz: v must be between 0 and c/10 (${VMAX.toExponential(2)} m/s) — the model is non-relativistic`);
  if (!(P.B > 0)) p.push('em-lorentz: B must be positive (use bdir to turn it round in the top view)');
  if (!(P.pitch >= 0 && P.pitch <= 180)) p.push('em-lorentz: pitch is an angle in degrees, 0–180');
  if (!Number.isFinite(P.E)) p.push('em-lorentz: E must be a number (V/m)');
  if (!['in', 'out'].includes(P.bdir)) p.push('em-lorentz: bdir is “in” or “out”');
  if (P.unit !== null && P.unit !== undefined && !UNITS[P.unit]) p.push(`em-lorentz: unknown unit “${P.unit}” (use ${Object.keys(UNITS).join(', ')})`);
  for (const r of P.readouts || []) if (!READOUTS.includes(r)) p.push(`em-lorentz: unknown readout “${r}” (use ${READOUTS.join(', ')})`);
  for (const a of P.arrows || []) if (!ARROWS.includes(a)) p.push(`em-lorentz: unknown arrow “${a}” (use ${ARROWS.join(', ')})`);
  if (!['full', 'trail', 'none'].includes(P.path)) p.push('em-lorentz: path is full, trail or none');
  if (!(P.turns > 0)) p.push('em-lorentz: turns must be positive');
  for (const s of P.sliders || []) {
    const key = typeof s === 'string' ? s : s?.key;
    if (!BUILTIN.includes(key)) { p.push(`em-lorentz: slider “${key}” is not one of ${BUILTIN.join(', ')}`); continue; }
    const o = sliderSpec(s, P);
    if (!(o.min < o.max) || o.value < o.min || o.value > o.max) p.push(`em-lorentz: slider ${key} needs min < value < max (got ${o.min}, ${o.value}, ${o.max})`);
    if (key === 'v' && o.max > VMAX) p.push('em-lorentz: the v slider may not go above c/10');
    if (key === 'B' && !(o.min > 0)) p.push('em-lorentz: the B slider must stay above zero');
  }
  if (P.particles) {
    if (P.view !== 'top') p.push('em-lorentz: several particles need the top view');
    P.particles.forEach((q, k) => {
      if (q.species !== undefined) sp(q.species, `particles[${k}]`);
      if (q.v !== undefined && q.v !== 'v' && !(q.v >= 0 && q.v <= VMAX)) p.push(`em-lorentz particles[${k}]: v must be from 0 to c/10, or 'v' for the slider`);
      if (q.at && !(Array.isArray(q.at) && q.at.length === 2 && q.at.every(Number.isFinite))) p.push(`em-lorentz particles[${k}]: at is [x, y] in the display unit`);
      if (q.at && !P.unit) p.push(`em-lorentz particles[${k}]: give a unit when particles have positions`);
    });
  }
  if ((P.detector || P.plates) && P.view !== 'top') p.push('em-lorentz: the detector and the plates belong to the top view');
  if (P.plates && !(P.plates.x1 > P.plates.x0 && P.plates.h > 0)) p.push('em-lorentz: plates need { x0, x1, h } with x1 > x0 and h > 0');
  if (P.plates && !P.unit) p.push('em-lorentz: give a unit with the plates');
  if ((P.x && !P.y) || (P.y && !P.x)) p.push('em-lorentz: give both x and y ranges, or neither');
  return p;
}
