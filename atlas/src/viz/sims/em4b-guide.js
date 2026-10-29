// A hollow rectangular waveguide carrying one TE_mn mode (PHYS 4600 M3.5).
// Physics in model/em4b-guide.js (tested in test/em4b-guide.test.mjs). Three
// panels:
//
//   section  the guide's cross-section (a × b, to scale) with the transverse
//            electric field as violet arrows and B_z, the field along the
//            guide, as shading (teal one way, orange the other);
//   side     the guide seen from above, z running to the right over `len`
//            millimetres: the field just above the bottom wall, where E stands
//            straight out of the page (shading) and B lies in the page
//            (teal arrows, forming the loops of the mode). Above cutoff the
//            pattern travels and repeats every guide wavelength λ_g; below
//            cutoff it only swells and fades in place, dying away along z;
//   disp     the dispersion diagram: frequency against the propagation
//            constant k for the lowest modes (hyperbolas, each starting at its
//            cutoff), the light line f = ck/2π, the operating frequency and
//            the operating point. The slope of the line from the origin is the
//            phase velocity; the slope of the curve, the group velocity.
//
//   { type: 'em4b-guide', params: {
//       a: 22.86, b: 10.16,    // inner width and height, mm (WR-90 by default)
//       m: 1, n: 0,            // the TE_mn mode shown (not both zero)
//       f: 10,                 // frequency, GHz
//       len: 120,              // side panel: length of guide shown, mm
//       fmax: 25,              // disp panel: top of the frequency axis, GHz
//       modes: 5,              // disp panel: how many of the lowest modes to draw
//       panels: ['section', 'side', 'disp'],
//       phase: null,           // a still picture at this phase (degrees); null animates
//       play: null,            // animate (default: true unless compact)
//       controls: null,        // true, false or a list of: f m n a b (default: f m n unless compact)
//       readout: true,
//       readouts: null,        // rows: fc lam0 lamg vp vg decay next (default: fc lamg vp vg decay)
//       hide: [],              // rows printed as “?”, and 'labels' to leave the mode names off the diagram
//       labels: true,
//   } }
//
// Walls are perfect conductors; the mode is a single TE mode at one frequency.
// Field arrows show direction and relative size within each picture only.

import { Plot } from '../plot.js';
import * as M from '../model/em4b-guide.js';

export const defaults = {
  a: 22.86, b: 10.16, m: 1, n: 0, f: 10, len: 120, fmax: 25, modes: 5,
  panels: ['section', 'side', 'disp'], phase: null, play: null, controls: null, readout: true, readouts: null, hide: [], labels: true,
};
const PANELS = ['section', 'side', 'disp'];
const ROWS = ['fc', 'lam0', 'lamg', 'vp', 'vg', 'decay', 'next'];
const CONTROLS = ['f', 'm', 'n', 'a', 'b'];
const C = M.C;
const SUB = (k) => String(k).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
const trim = (x, d = 3) => (Number.isFinite(x) ? String(+(+x).toPrecision(d)) : '\\text{—}');

export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  for (const k of ['a', 'b', 'f', 'len', 'fmax']) if (!(typeof P[k] === 'number' && P[k] > 0)) out.push(`em4b-guide: ${k} must be a positive number`);
  for (const k of ['m', 'n']) if (!(Number.isInteger(P[k]) && P[k] >= 0 && P[k] <= 4)) out.push(`em4b-guide: ${k} must be a whole number from 0 to 4`);
  if (P.m === 0 && P.n === 0) out.push('em4b-guide: TE00 does not exist; m and n cannot both be 0');
  if (!(Number.isInteger(P.modes) && P.modes >= 1 && P.modes <= 10)) out.push('em4b-guide: modes must be a whole number from 1 to 10');
  for (const p of P.panels || []) if (!PANELS.includes(p)) out.push(`em4b-guide: unknown panel ${p}`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) out.push(`em4b-guide: unknown control ${c}`);
  for (const r of P.readouts || []) if (!ROWS.includes(r)) out.push(`em4b-guide: unknown readout ${r}`);
  for (const h of P.hide || []) if (![...ROWS, 'labels'].includes(h)) out.push(`em4b-guide: unknown hide ${h}`);
  if (P.f > P.fmax) out.push('em4b-guide: f must not exceed fmax');
  return out;
}

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  const hide = new Set(P.hide || []);
  const want = P.controls === true ? CONTROLS : Array.isArray(P.controls) ? P.controls : P.controls === false || F.compact ? [] : ['f', 'm', 'n'];
  const put = (k, v) => { F.params[k] = v; };

  if (want.includes('f')) F.slider({ key: 'f', label: 'Frequency $f$', min: 1, max: P.fmax, step: 0.05, value: P.f, unit: '\\mathrm{GHz}', explain: 'Below a mode’s cutoff it cannot travel down the guide; above it, it can.' });
  else put('f', P.f);
  if (want.includes('m')) F.slider({ key: 'm', label: 'Mode number $m$ (across the width)', min: 0, max: 4, step: 1, value: P.m, explain: 'The number of half-wavelengths of the pattern across the width a.' });
  else put('m', P.m);
  if (want.includes('n')) F.slider({ key: 'n', label: 'Mode number $n$ (across the height)', min: 0, max: 4, step: 1, value: P.n, explain: 'The number of half-wavelengths across the height b. TE₀₀ does not exist.' });
  else put('n', P.n);
  if (want.includes('a')) F.slider({ key: 'a', label: 'Width $a$', min: 5, max: 50, step: 0.01, value: P.a, unit: '\\mathrm{mm}', explain: 'The wider inner dimension: it sets the lowest cutoff, c/2a.' });
  else put('a', P.a);
  if (want.includes('b')) F.slider({ key: 'b', label: 'Height $b$', min: 2, max: 50, step: 0.01, value: P.b, unit: '\\mathrm{mm}', explain: 'Usually about half the width, so the next mode across the width comes before any mode across the height.' });
  else put('b', P.b);

  const secCv = panels.includes('section') ? F.canvas({ aspect: 'wide', label: P.alt || 'The cross-section of a rectangular waveguide with the electric field of one mode' }) : null;
  const sideCv = panels.includes('side') ? F.canvas({ height: '170px', label: 'The waveguide from above, with the field just above its bottom wall' }) : null;
  const dispCv = panels.includes('disp') ? F.canvas({ aspect: F.compact ? 'wide' : '', label: 'Dispersion diagram: frequency against propagation constant for the lowest modes' }) : null;

  const ps = secCv && new Plot(secCv.canvas, { x: [0, 1], y: [0, 1], equal: true, grid: false, axes: false, pad: { l: 10, r: 10, t: 22, b: 10 } });
  const pz = sideCv && new Plot(sideCv.canvas, { x: [0, 1], y: [0, 1], equal: true, grid: false, axes: false, pad: { l: 10, r: 10, t: 18, b: 8 } });
  const pd = dispCv && new Plot(dispCv.canvas, { x: [0, 1], y: [0, 1], xlabel: 'propagation constant k (rad/m)', ylabel: 'f (GHz)', pad: { l: 46, r: 16, t: 14, b: 36 } });

  const still = P.phase !== null && P.phase !== undefined;
  const S = { ph: still ? (P.phase * Math.PI) / 180 : Math.PI / 3, running: !still && (P.play ?? !F.compact) && !reduced };
  const anim = F.animate((dt) => { if (!S.running) return; S.ph += dt * Math.PI * 0.9; draw(); }, { force: true });
  if (!still && (panels.includes('section') || panels.includes('side'))) {
    const btn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => { S.running = !S.running; btn.textContent = S.running ? 'Pause' : 'Play'; if (S.running) anim.start(); } });
  }
  F.onChange(() => draw());

  const state = () => {
    const a = F.params.a * 1e-3, b = F.params.b * 1e-3, m = Math.round(F.params.m), n = Math.round(F.params.n), f = F.params.f * 1e9;
    const ok = m > 0 || n > 0;
    return { a, b, m, n, f, ok, g: ok ? M.guide(a, b, m, n, f) : null };
  };

  // the fields at "time" t such that ωt = −phase (z = 0 at the left of the side view)
  const fields = (s, x, y, z) => M.te(s.a, s.b, s.m, s.n, s.f, x, y, z, -S.ph / (2 * Math.PI * s.f));

  function drawSection(s) {
    const A = s.a * 1e3, Bh = s.b * 1e3, pad = 0.12 * Math.max(A, Bh);
    ps.setView([-pad, A + pad], [-pad, Bh + pad]);
    ps.clear();
    const g = ps.ctx;
    // B_z shading on a grid of cells
    const nx = 36, ny = Math.max(6, Math.round((36 * Bh) / A));
    let bmax = 0;
    const cells = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const x = ((i + 0.5) / nx) * s.a, y = ((j + 0.5) / ny) * s.b;
      const F_ = fields(s, x, y, 0);
      cells.push([i, j, F_.Bz]);
    }
    // the largest |B_z| over a cycle is 1 at the corners (B₀ = 1)
    bmax = 1;
    for (const [i, j, v] of cells) {
      if (Math.abs(v) < 0.02) continue;
      ps.rect((i / nx) * A, (j / ny) * Bh, A / nx + 0.02, Bh / ny + 0.02, { fill: v > 0 ? 'teal' : 'warn', alpha: 0.6 * Math.min(1, Math.abs(v) / bmax), stroke: false });
    }
    // transverse E arrows, scaled by the largest |E| over the cross-section and the cycle
    const ax = 11, ay = Math.max(3, Math.round((11 * Bh) / A));
    const K2 = (s.m * Math.PI / s.a) ** 2 + (s.n * Math.PI / s.b) ** 2, w = 2 * Math.PI * s.f;
    const Emax = (w / K2) * Math.max(s.m * Math.PI / s.a, s.n * Math.PI / s.b);
    const cell = Math.min(A / ax, Bh / ay);
    for (let i = 0; i < ax; i++) for (let j = 0; j < ay; j++) {
      const x = ((i + 0.5) / ax) * s.a, y = ((j + 0.5) / ay) * s.b;
      const F_ = fields(s, x, y, 0);
      const ex = F_.Ex / Emax, ey = F_.Ey / Emax, mag = Math.hypot(ex, ey);
      if (mag < 0.04) continue;
      const L = 0.85 * cell * Math.min(1, mag);
      const X = x * 1e3, Y = y * 1e3, ux = (ex / mag) * L / 2, uy = (ey / mag) * L / 2;
      ps.arrow(X - ux, Y - uy, X + ux, Y + uy, { color: 'violet', width: 2, head: 6 });
    }
    // walls
    g.save(); ps.rect(0, 0, A, Bh, { fill: false, stroke: 'ink2', width: 3 }); g.restore();
    if (P.labels !== false) {
      ps.text(`TE${SUB(s.m)}${SUB(s.n)} cross-section`, -pad * 0.6, Bh + pad * 0.62, { color: 'ink2', size: 12 });
      ps.text(`a = ${trim(A, 4)} mm`, A / 2, -pad * 0.5, { color: 'ink3', size: 11, align: 'center' });
      ps.text('E arrows, Bz shading', A + pad * 0.6, Bh + pad * 0.62, { color: 'ink3', size: 11, align: 'right' });
    }
  }

  function drawSide(s) {
    // m ≥ 1: seen from above, the field just over the bottom wall (y = 0): E_y out of the page, (B_z, B_x) in it.
    // m = 0: seen from the side, the field just inside the side wall (x = 0): E_x out of the page, (B_z, B_y) in it.
    const top = s.m >= 1, U = (top ? s.a : s.b) * 1e3, L = P.len, pad = 0.18 * U;
    const at = (u, z) => fields(s, top ? u : 0, top ? 0 : u, z);
    pz.setView([0, L], [-pad * 1.9, U + pad * 1.9]);
    pz.clear();
    const K2 = (s.m * Math.PI / s.a) ** 2 + (s.n * Math.PI / s.b) ** 2, w = 2 * Math.PI * s.f;
    const q = top ? (s.m * Math.PI) / s.a : (s.n * Math.PI) / s.b;
    const Emax = (w / K2) * q;
    const nz = 90, nu = 10;
    for (let i = 0; i < nz; i++) for (let j = 0; j < nu; j++) {
      const z = ((i + 0.5) / nz) * L * 1e-3, u = ((j + 0.5) / nu) * U * 1e-3;
      const F_ = at(u, z), v = (top ? F_.Ey : F_.Ex) / Emax;
      if (Math.abs(v) < 0.03) continue;
      pz.rect((i / nz) * L, (j / nu) * U, L / nz + 0.05, U / nu + 0.05, { fill: v > 0 ? 'violet' : 'warn', alpha: 0.5 * Math.min(1, Math.abs(v)), stroke: false });
    }
    // B in the page, scaled by the larger of its two amplitudes
    const kfac = s.g.above ? s.g.k : s.g.kappa;
    const Bscale = Math.max(1, (kfac / K2) * q);
    const az = 26, au = 4, cell = Math.min(L / az, U / au);
    for (let i = 0; i < az; i++) for (let j = 0; j < au; j++) {
      const z = ((i + 0.5) / az) * L * 1e-3, u = ((j + 0.5) / au) * U * 1e-3;
      const F_ = at(u, z);
      const bz = F_.Bz / Bscale, bu = (top ? F_.Bx : F_.By) / Bscale, mag = Math.hypot(bz, bu);
      if (mag < 0.06) continue;
      const len = 0.8 * cell * Math.min(1, mag), Z = z * 1e3, X = u * 1e3;
      pz.arrow(Z - (bz / mag) * len / 2, X - (bu / mag) * len / 2, Z + (bz / mag) * len / 2, X + (bu / mag) * len / 2, { color: 'teal', width: 1.6, head: 5 });
    }
    pz.line(0, 0, L, 0, { color: 'ink2', width: 3 });
    pz.line(0, U, L, U, { color: 'ink2', width: 3 });
    if (P.labels !== false) {
      pz.text(s.g.above ? 'travelling →' : 'evanescent: dies away along z', L, -pad * 1.1, { color: s.g.above ? 'gold' : 'warn', size: 11.5, align: 'right' });
      pz.text(`${top ? 'from above' : 'from the side'}, ${L} mm of guide`, 2, U + pad * 1.1, { color: 'ink3', size: 11 });
    }
  }

  function drawDisp(s) {
    const fmax = P.fmax, kmax = (2 * Math.PI * fmax * 1e9) / C;
    pd.setView([0, kmax], [0, fmax]);
    pd.clear();
    const list = M.modesBelow(s.a, s.b, fmax * 1e9 * 1.0001).slice(0, P.modes);
    if (!list.some((q) => q.m === s.m && q.n === s.n) && s.ok) list.push({ m: s.m, n: s.n, fc: M.cutoff(s.a, s.b, s.m, s.n) });
    pd.fn((k) => (C * k) / (2 * Math.PI) / 1e9, { color: 'ink3', dash: [5, 4], width: 1.4 });
    for (const q of list) {
      const cur = q.m === s.m && q.n === s.n;
      const fc = q.fc / 1e9, Kq = (2 * Math.PI * q.fc) / C;
      pd.fn((k) => (C * Math.sqrt(k * k + Kq * Kq)) / (2 * Math.PI) / 1e9, { color: cur ? 'accent' : 'ink3', width: cur ? 2.6 : 1.3 });
      if (P.labels !== false && !hide.has('labels') && fc < fmax * 0.97) pd.text(`TE${SUB(q.m)}${SUB(q.n)}`, kmax * 0.02, fc, { color: cur ? 'accent' : 'ink3', size: 11, dy: -8 });
    }
    pd.text('light line', kmax * 0.78, fmax * 0.78, { color: 'ink3', size: 11, dx: 8 });
    pd.line(0, s.f / 1e9, kmax, s.f / 1e9, { color: 'gold', width: 1.4, dash: [6, 4] });
    if (s.ok && s.g.above) {
      pd.line(0, 0, s.g.k, s.f / 1e9, { color: 'violet', width: 1.2, dash: [3, 4] });
      pd.point(s.g.k, s.f / 1e9, { color: 'gold', r: 5 });
    } else if (s.ok) pd.point(0, s.f / 1e9, { color: 'warn', r: 5, label: 'below cutoff', lcolor: 'warn' });
  }

  function draw() {
    const s = state();
    if (!s.ok) {
      for (const p of [ps, pz, pd]) if (p) { p.clear(); p.text('TE₀₀ does not exist: choose m or n above 0', (p.vx0 + p.vx1) / 2, (p.vy0 + p.vy1) / 2, { align: 'center', color: 'warn' }); }
      F.readout([]);
      return;
    }
    if (ps) drawSection(s);
    if (pz) drawSide(s);
    if (pd) drawDisp(s);
    if (P.readout === false) { F.readout([]); return; }
    const g = s.g;
    const next = M.modesBelow(s.a, s.b, 1e15).find((q) => q.fc > g.fc * 1.0001);
    const rows = {
      fc: [`Cutoff $f_{${s.m}${s.n}}$`, `${trim(g.fc / 1e9, 4)}\\ \\mathrm{GHz}`],
      lam0: ['Free-space $\\lambda_0$', `${trim(g.lam0 * 100, 4)}\\ \\mathrm{cm}`],
      lamg: ['Guide wavelength $\\lambda_g$', g.above ? `${trim(g.lamg * 100, 4)}\\ \\mathrm{cm}` : '\\text{none (below cutoff)}'],
      vp: ['Phase velocity $v_p$', g.above ? `${trim(g.vp / C, 4)}\\,c` : '\\text{—}'],
      vg: ['Group velocity $v_g$', g.above ? `${trim(g.vg / C, 4)}\\,c` : '0'],
      decay: ['Field dies by $1/e$ in', g.above ? '\\text{(travels)}' : `${trim(g.decay * 1e3, 3)}\\ \\mathrm{mm}`],
      next: ['Next mode’s cutoff', next ? `${trim(next.fc / 1e9, 4)}\\ \\mathrm{GHz}` : '\\text{—}'],
    };
    const keys = (P.readouts || ['fc', 'lamg', 'vp', 'vg', 'decay']).filter((k) => rows[k]);
    F.readout(keys.map((k) => (hide.has(k) ? [rows[k][0], '?'] : rows[k])));
  }
  F.draw(draw);
  if (!P.caption) F.caption('Perfectly conducting walls, one TE mode at one frequency. Cross-section and top view are to scale; arrow lengths and shading show only the relative strength within each picture.');
  return { get: (k) => F.params[k] };
}
