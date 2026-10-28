// A torque-free rigid body, from Euler's equations integrated numerically
// (RK4): the body turning in space beside its angular momentum seen from the
// body — the tip of L running along a polhode on the sphere |L| = const —
// and the body-frame components ω₁, ω₂, ω₃ against time.
//
// Left (or top): the body as a uniform box with the given principal moments,
// its three principal axes (1, 2, 3 — numbered as given), the angular
// momentum L (gold, fixed in space, pointing up) and the angular velocity ω
// (red) with the path its tip has traced. Right (or below): the sphere of
// fixed |L| in body axes, the family of polhodes (grey), the separatrix
// through the middle axis (violet) and L's own path (gold). Below: ω(t).
// Spin about the largest or smallest axis and L circles that axis; spin near
// the middle one and the body flips over and back — the tennis-racket
// theorem. A teaching-model energy sink (κ) drains energy at fixed |L|, so L
// creeps across the polhodes to the axis of largest moment (Explorer 1).
// Physics: model/cm4-rigid.js (test/cm4-rigid.test.mjs).
//
//   { type: 'cm4-rigid', params: {
//       I: [1, 2, 2.6],            // principal moments (kg m²), in the order of axes 1, 2, 3
//       axis: 2,                 // the axis the spin starts near (1, 2, 3)
//       tilt: 3,                 // how far ω starts from that axis (deg), toward the next axis
//       w: 2,                    // |ω| at the start (rad/s)
//       damp: 0,                 // κ, the teaching-model energy sink (0 = rigid; 0–0.2)
//       T: 40,                   // the length of the run (s)
//       controls: ['axis', 'tilt', 'damp'],   // any of axis tilt damp w I2 ([] for a still picture)
//       panels: ['body', 'sphere', 'omega'],  // any of these, in this order
//       dims: null,              // the box's edges to draw (any units); default: the uniform box with these moments
//       family: true,            // the polhode family and the separatrix on the sphere
//       ellipsoid: false,        // the current energy ellipsoid, as a wire, on the sphere
//       vectors: ['L', 'w'],     // which arrows on the body: L, w
//       trail: true,             // the path of ω's tip (body view) and of L (sphere view)
//       play: true,              // a Play button; false: a still picture at `at`
//       at: null,                // the moment shown when still (s; default the end of the run)
//       rate: 2,                 // simulated seconds per second of Play
//       readout: true,           // t, E/E₀, |L|/|L₀| and ω under the picture
//       hide: [],                // readout rows to print as “?”: t E L w
//       yaw, pitch, syaw, spitch // the cameras (body; sphere), radians
//   } }
//
// A problem's picture must not show its answer: hide the readout or a panel
// (a still with panels: ['sphere'] shows a path, not its numbers).

import { View3D } from '../three-d.js';
import { Plot, themeColors } from '../plot.js';
import * as M from '../model/cm4-rigid.js';

export const defaults = {
  I: [1, 2, 2.6], axis: 2, tilt: 3, w: 2, damp: 0, T: 40, controls: ['axis', 'tilt', 'damp'], panels: ['body', 'sphere', 'omega'],
  dims: null, family: true, ellipsoid: false, vectors: ['L', 'w'], trail: true, play: true, at: null, rate: 2, readout: true, hide: [],
  yaw: 0.65, pitch: 0.32, syaw: 0.75, spitch: 0.38,
};

const AXC = ['accent', 'teal', 'violet'];
const tx = (v, d = 3) => String(+(+v).toPrecision(d));
const rankName = (I, k) => {
  const s = [0, 1, 2].sort((a, b) => I[a] - I[b]);
  const eq = (a, b) => Math.abs(I[a] - I[b]) < 1e-9 * Math.max(...I);
  const r = s.indexOf(k);
  if (eq(s[0], s[1]) && r < 2) return 'equal smallest';
  if (eq(s[1], s[2]) && r > 0) return 'equal largest';
  return ['smallest I', 'middle I', 'largest I'][r];
};

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const panels = (P.panels || []).filter((p) => ['body', 'sphere', 'omega'].includes(p));
  const views3 = panels.filter((p) => p !== 'omega');
  const C = new Set(P.controls || []);
  const I0 = P.I.slice();

  let cv = null, box = null;
  if (views3.length) {
    const c = F.canvas({ aspect: views3.length === 2 ? 'wide' : '', label: views3.length === 2 ? 'A spinning rigid body beside its angular momentum seen from the body' : views3[0] === 'body' ? 'A spinning rigid body with its angular momentum and angular velocity' : 'The sphere of constant angular momentum in body axes, with polhodes' });
    cv = c.canvas; box = c.box;
  }
  const gw = panels.includes('omega') ? F.canvas({ aspect: 'wide', label: 'The angular velocity components in body axes against time' }) : null;

  const axOpts = [1, 2, 3].map((a) => [a, `${a} (${rankName(I0, a - 1)})`]);
  if (C.has('axis')) F.choice({ key: 'axis', label: 'Start spinning about axis', options: axOpts, value: P.axis, explain: 'The principal axis the spin starts near.' });
  else F.params.axis = P.axis;
  if (C.has('tilt')) F.slider({ key: 'tilt', label: 'Starting tilt of $\\vec\\omega$', min: 0.5, max: 30, step: 0.5, value: P.tilt, unit: '^\\circ', explain: 'How far the spin starts from that axis: a small knock.' });
  else F.params.tilt = P.tilt;
  if (C.has('w')) F.slider({ key: 'w', label: 'Spin rate $|\\vec\\omega|$', min: 0.5, max: 4, step: 0.1, value: P.w, unit: '\\mathrm{rad/s}', explain: 'How fast the body starts turning. Faster spins flip sooner but follow the same paths.' });
  else F.params.w = P.w;
  if (C.has('damp')) F.slider({ key: 'damp', label: 'Energy sink $\\kappa$', min: 0, max: 0.2, step: 0.005, value: P.damp, unit: '', explain: 'A teaching model of flexing parts: energy drains while $|\\vec L|$ stays fixed. 0 is a perfectly rigid body.' });
  else F.params.damp = P.damp;
  const sortedI = [...I0].sort((a, b) => a - b);
  if (C.has('I2')) F.slider({ key: 'I2', label: 'Middle moment $I_2$', min: sortedI[0], max: sortedI[2], step: (sortedI[2] - sortedI[0]) / 100, value: I0[1], unit: '\\mathrm{kg\\,m^2}', explain: 'Slide it to either end and the body becomes symmetric: the flips stop.' });
  const Inow = () => (C.has('I2') ? [I0[0], +F.params.I2, I0[2]] : I0);

  // the run, recomputed when a control changes
  let run = null, rkey = '';
  const getRun = () => {
    const I = Inow(), k = `${I}|${F.params.axis}|${F.params.tilt}|${F.params.w}|${F.params.damp}`;
    if (k !== rkey) {
      rkey = k;
      run = M.run(I, { w0: M.startOmega(+F.params.axis, +F.params.tilt, +F.params.w), kappa: +F.params.damp, T: P.T, steps: Math.round(P.T * 60) });
    }
    return run;
  };

  // cameras: two View3D's drawn into one canvas (left/right, or top/bottom on a phone)
  const dummy = () => document.createElement('canvas');
  const V = {
    body: new View3D(dummy(), { yaw: P.yaw, pitch: P.pitch, dist: 9, scale: 1, target: [0, 0, 0.6] }),
    sphere: new View3D(dummy(), { yaw: P.syaw, pitch: P.spitch, dist: 9, scale: 1 }),
  };
  let regions = [];
  if (cv) {
    cv.style.touchAction = 'none'; cv.style.cursor = 'grab'; cv.tabIndex = 0;
    let drag = null;
    const hit = (e) => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; return regions.find((g) => x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h); };
    cv.addEventListener('pointerdown', (e) => { const g = hit(e); if (!g) return; drag = { v: V[g.key], x: e.clientX, y: e.clientY, yaw: V[g.key].yaw, pitch: V[g.key].pitch }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
    cv.addEventListener('pointermove', (e) => {
      if (!drag) return;
      drag.v.yaw = drag.yaw - (e.clientX - drag.x) * 0.008;
      drag.v.pitch = Math.max(-1.45, Math.min(1.45, drag.pitch + (e.clientY - drag.y) * 0.008));
      draw();
    });
    const up = () => { drag = null; cv.style.cursor = 'grab'; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: [0.08, 0], ArrowRight: [-0.08, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key];
      if (!k) return;
      e.preventDefault();
      for (const key of views3) { V[key].yaw += k[0]; V[key].pitch = Math.max(-1.45, Math.min(1.45, V[key].pitch + k[1])); }
      draw();
    });
  }
  const gp = gw ? new Plot(gw.canvas, { x: [0, P.T], y: [-1, 1], xlabel: 't (s)', ylabel: 'ω (rad/s)', yticks: 5 }) : null;

  // play
  const S = { i: P.play ? 0 : null, running: false };
  let btn = null;
  const anim = P.play ? F.animate((dt) => {
    if (!S.running) return;
    const r = getRun(), n = r.t.length - 1, per = n / P.T;
    S.i = Math.min(n, (S.i ?? 0) + Math.max(1, Math.round(dt * P.rate * per)));
    if (S.i >= n) { S.running = false; btn.textContent = 'Replay'; }
    draw();
  }, { force: true }) : null;
  if (anim) {
    btn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; btn.textContent = 'Play'; return; }
      if (btn.textContent === 'Replay' || S.i === null) S.i = 0;
      S.running = true; btn.textContent = 'Pause'; anim.start();
    } });
    F.button({ label: 'Whole run', onClick: () => { S.running = false; S.i = null; btn.textContent = 'Play'; draw(); } });
  }
  F.onChange(() => { S.running = false; S.i = P.play ? 0 : null; if (btn) btn.textContent = 'Play'; draw(); });

  const idxAt = (r) => {
    const n = r.t.length - 1;
    if (S.i !== null) return S.i;
    if (P.at === null || P.at === undefined) return n;
    return Math.max(0, Math.min(n, Math.round((P.at / P.T) * n)));
  };

  // ── the body in space ──
  function drawBody(v, r, n) {
    const I = Inow();
    let d = P.dims ? P.dims.slice() : M.boxFromMoments(I, 1);
    const big = Math.max(...d) || 1;
    d = d.map((x) => (3.0 * x) / big);
    const q = M.displayQuat(r, n), rot = (p) => M.qrot(q, p);
    // faces
    const h = d.map((x) => x / 2);
    for (let k = 0; k < 3; k++) for (const sg of [-1, 1]) {
      const i = (k + 1) % 3, j = (k + 2) % 3, grid = [];
      for (const a of [-1, 1]) {
        const row = [];
        for (const b of [-1, 1]) { const p = [0, 0, 0]; p[k] = sg * h[k]; p[i] = a * h[i]; p[j] = b * h[j]; row.push(rot(p)); }
        grid.push(row);
      }
      v.surface(grid, { color: AXC[k], alpha: 0.78, wireAlpha: 0.3 });
    }
    // principal axes through the box
    for (let k = 0; k < 3; k++) {
      const e = [0, 0, 0]; e[k] = h[k] + 0.55;
      const a = rot(e), b = rot(e.map((x) => -x));
      v.line([b, a], { color: AXC[k], width: 1.6, dash: [4, 4] });
      v.label(rot(e.map((x) => (x * (h[k] + 0.85)) / (h[k] + 0.55))), String(k + 1), { color: AXC[k], size: 13 });
    }
    // L fixed in space, ω turning
    const vec = P.vectors || [];
    if (vec.includes('L')) { v.arrow([0, 0, 0], [0, 0, 3.0], { color: 'gold', width: 3 }); v.label([0, 0, 3.3], 'L', { color: 'gold', size: 14 }); }
    if (vec.includes('w')) {
      const w0 = Math.hypot(...r.w[0]) || 1, scale = 2.6 / w0;
      const tip = (m) => { const qm = M.displayQuat(r, m), wm = M.qrot(qm, r.w[m]); return wm.map((x) => x * scale); };
      if (P.trail && n > 1) {
        const pts = [], from = Math.max(0, n - 900);
        for (let m = from; m <= n; m += 2) pts.push(tip(m));
        v.line(pts, { color: 'bad', width: 1.1 });
      }
      const wt = tip(n);
      v.arrow([0, 0, 0], wt, { color: 'bad', width: 2.6 });
      v.label(wt.map((x) => x * 1.1), 'ω', { color: 'bad', size: 14 });
    }
  }

  // a curve on the sphere of radius R: the part facing the camera solid, the far side faint and dashed
  function onSphere(v, pts, R, o) {
    const eye = v._B.eye, front = (p) => p[0] * eye[0] + p[1] * eye[1] + p[2] * eye[2] > R * R * 1.0001;
    let run = [pts[0]], f = front(pts[0]);
    const flush = () => { if (run.length > 1) v.line(run, f ? o : { ...o, color: o.back || 'ink4', width: Math.max(0.8, (o.width || 1) * 0.6), dash: [3, 4], bias: -0.5 }); };
    for (let k = 1; k < pts.length; k++) {
      const g = front(pts[k]);
      if (g !== f) { run.push(pts[k]); flush(); run = [pts[k]]; f = g; } else run.push(pts[k]);
    }
    flush();
  }

  // ── L seen from the body: the sphere and its polhodes ──
  function drawSphere(v, r, n) {
    const I = Inow(), R = 2.0;
    // the sphere, faint
    const grid = [];
    for (let a = 0; a <= 16; a++) {
      const th = (Math.PI * a) / 16, row = [];
      for (let b = 0; b <= 32; b++) { const ph = (2 * Math.PI * b) / 32; row.push([R * Math.sin(th) * Math.cos(ph), R * Math.sin(th) * Math.sin(ph), R * Math.cos(th)]); }
      grid.push(row);
    }
    v.surface(grid, { color: 'ink3', alpha: 0.16, wire: false });
    for (let k = 0; k < 3; k++) {
      const e = [0, 0, 0]; e[k] = R + 0.45;
      v.line([e.map((x) => -x), e], { color: AXC[k], width: 1.4, dash: [4, 4] });
      v.label(e.map((x) => x * 1.12), String(k + 1), { color: AXC[k], size: 13 });
    }
    const s = [0, 1, 2].sort((a, b) => I[a] - I[b]);
    const tol = 1e-6 * Math.max(...I);
    if (P.family) {
      const symLo = Math.abs(I[s[0]] - I[s[1]]) < tol, symHi = Math.abs(I[s[1]] - I[s[2]]) < tol;
      if (symLo || symHi) {
        // a symmetric body: circles of latitude about its distinct axis
        const ax = symLo ? s[2] : s[0], o1 = (ax + 1) % 3, o2 = (ax + 2) % 3;
        for (const bdeg of [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165]) {
          const b = (bdeg * Math.PI) / 180, pts = [];
          for (let m = 0; m <= 120; m++) { const p = [0, 0, 0], f = (2 * Math.PI * m) / 120; p[ax] = R * Math.cos(b); p[o1] = R * Math.sin(b) * Math.cos(f); p[o2] = R * Math.sin(b) * Math.sin(f); pts.push(p); }
          onSphere(v, pts, R, { color: 'ink3', width: 1 });
        }
      } else {
        const hs = [];
        for (const bdeg of [12, 25, 40, 55, 70]) {
          const b = (bdeg * Math.PI) / 180, c2 = Math.cos(b) ** 2, s2 = Math.sin(b) ** 2;
          hs.push(c2 / I[s[0]] + s2 / I[s[1]], c2 / I[s[2]] + s2 / I[s[1]]);
        }
        for (const hh of hs) for (const c of M.polhode(I, hh, R, 120)) onSphere(v, c, R, { color: 'ink3', width: 1.1 });
        for (const c of M.polhode(I, 1 / I[s[1]], R, 160)) onSphere(v, c, R, { color: 'violet', width: 2, back: 'violet' });
      }
    }
    if (P.ellipsoid) {
      // the energy ellipsoid ΣLᵢ²/Iᵢ = 2E, scaled with the sphere
      const E = r.E[n], Lm = r.Lmag[n] || 1, sc = R / Lm, ax = I.map((x) => Math.sqrt(2 * E * x) * sc);
      for (let a = 1; a < 12; a++) {
        const th = (Math.PI * a) / 12, pts = [];
        for (let b = 0; b <= 60; b++) { const ph = (2 * Math.PI * b) / 60; pts.push([ax[0] * Math.sin(th) * Math.cos(ph), ax[1] * Math.sin(th) * Math.sin(ph), ax[2] * Math.cos(th)]); }
        v.line(pts, { color: 'gold', width: 0.8 });
      }
    }
    const unit = (m) => { const L = r.L[m], l = r.Lmag[m] || 1; return [(R * L[0]) / l, (R * L[1]) / l, (R * L[2]) / l]; };
    if (P.trail) {
      const pts = [];
      for (let m = 0; m <= n; m += 2) pts.push(unit(m));
      pts.push(unit(n));
      onSphere(v, pts, R, { color: 'gold', width: 2.4, back: 'gold', bias: 0.06 });
    }
    const L = unit(n);
    v.arrow([0, 0, 0], L, { color: 'gold', width: 2.4 });
    v.point(L, { color: 'gold', r: 5 });
    v.label(L.map((x) => x * 1.12), 'L', { color: 'gold', size: 14 });
  }

  function draw() {
    const r = getRun(), n = idxAt(r);
    if (cv) {
      const W = cv.clientWidth || 600;
      const narrow = views3.length === 2 && W < 520;
      if (views3.length === 2) { const want = narrow ? '4 / 5' : '2 / 1'; if (box.style.aspectRatio !== want) box.style.aspectRatio = want; }
      const H = cv.clientHeight || 300, dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const col = themeColors();
      regions = views3.length === 2
        ? (narrow ? [{ key: views3[0], x: 0, y: 0, w: W, h: H / 2 }, { key: views3[1], x: 0, y: H / 2, w: W, h: H / 2 }] : [{ key: views3[0], x: 0, y: 0, w: W / 2, h: H }, { key: views3[1], x: W / 2, y: 0, w: W / 2, h: H }])
        : [{ key: views3[0], x: 0, y: 0, w: W, h: H }];
      for (const g of regions) {
        const v = V[g.key];
        v.ctx = ctx; v.w = g.w; v.h = g.h; v.col = col; v._B = v.basis(); v.items = [];
        v.scale = g.key === 'sphere' ? 1.12 : 1.15;
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.beginPath(); ctx.rect(0, 0, g.w, g.h); ctx.clip();
        if (g.key === 'body') drawBody(v, r, n); else drawSphere(v, r, n);
        v.end();
        ctx.font = '600 12px Inter, system-ui, sans-serif'; ctx.fillStyle = col.ink3; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(g.key === 'body' ? 'the body, seen from space' : 'L seen from the body', 10, 8);
        ctx.restore();
      }
      if (regions.length === 2) {
        ctx.strokeStyle = col.line2; ctx.lineWidth = 1; ctx.beginPath();
        if (narrow) { ctx.moveTo(8, H / 2); ctx.lineTo(W - 8, H / 2); } else { ctx.moveTo(W / 2, 8); ctx.lineTo(W / 2, H - 8); }
        ctx.stroke();
      }
    }
    if (gp) {
      let mx = 0.1;
      for (const w of r.w) for (const x of w) mx = Math.max(mx, Math.abs(x));
      gp.setView([0, P.T], [-1.12 * mx, 1.32 * mx]);
      gp.clear();
      for (let k = 0; k < 3; k++) {
        const pts = [];
        for (let m = 0; m <= n; m += 2) pts.push([r.t[m], r.w[m][k]]);
        pts.push([r.t[n], r.w[n][k]]);
        gp.path(pts, { color: AXC[k], width: 2 });
        gp.text(`ω${'₁₂₃'[k]}`, gp.R - 8 - (2 - k) * 34, gp.T + 12, { screen: true, color: AXC[k], size: 13, align: 'right', weight: 650 });
      }
      if (n < r.t.length - 1) gp.line(r.t[n], gp.vy0, r.t[n], gp.vy1, { color: 'gold', width: 1.2, dash: [4, 4] });
    }
    if (P.readout !== false) {
      const hide = new Set(P.hide || []), q = (k, v) => (hide.has(k) ? '?' : v);
      F.readout([
        ['$t$', q('t', `${tx(r.t[n], 3)}\\,\\mathrm{s}`)],
        ['$E/E_0$', q('E', tx(r.E[n] / r.E[0], 4))],
        ['$|\\vec L|/|\\vec L_0|$', q('L', tx(r.Lmag[n] / r.Lmag[0], 4))],
        ['$\\vec\\omega$', q('w', `(${r.w[n].map((x) => tx(x, 2)).join(',\\ ')})\\,\\mathrm{rad/s}`)],
      ]);
    }
  }
  F.draw(draw);
  F.caption('Euler’s equations with no torque, integrated numerically (RK4). The body is drawn as the uniform box with these principal moments; vectors show direction, not size. With κ > 0 a teaching-model energy sink drains energy at fixed |L| — it stands in for flexing parts or sloshing fuel, not a model of either.');
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  if (!Array.isArray(P.I) || P.I.length !== 3 || P.I.some((x) => !(x > 0))) out.push('I must be three positive moments');
  else {
    const [a, b, c] = P.I;
    if (a > b + c + 1e-12 || b > a + c + 1e-12 || c > a + b + 1e-12) out.push('I breaks the triangle inequality: no real body has these moments');
  }
  if (![1, 2, 3].includes(P.axis)) out.push('axis must be 1, 2 or 3');
  if (!(P.tilt >= 0 && P.tilt <= 30)) out.push('tilt must lie in [0, 30] degrees');
  if (!(P.w > 0 && P.w <= 4)) out.push('w must lie in (0, 4] rad/s');
  if (!(P.damp >= 0 && P.damp <= 0.2)) out.push('damp must lie in [0, 0.2]');
  if (!(P.T > 0 && P.T <= 400)) out.push('T must lie in (0, 400] s');
  for (const c of P.controls || []) if (!['axis', 'tilt', 'damp', 'w', 'I2'].includes(c)) out.push(`unknown control “${c}”`);
  for (const p of P.panels || []) if (!['body', 'sphere', 'omega'].includes(p)) out.push(`unknown panel “${p}”`);
  if (!(P.panels || []).length) out.push('panels must name at least one panel');
  for (const v of P.vectors || []) if (!['L', 'w'].includes(v)) out.push(`unknown vector “${v}”`);
  for (const h of P.hide || []) if (!['t', 'E', 'L', 'w'].includes(h)) out.push(`unknown readout “${h}”`);
  if (P.dims && (!Array.isArray(P.dims) || P.dims.length !== 3 || P.dims.some((x) => !(x > 0)))) out.push('dims must be three positive lengths');
  if (P.at !== null && P.at !== undefined && !(P.at >= 0 && P.at <= P.T)) out.push('at must lie in [0, T]');
  return out;
}
