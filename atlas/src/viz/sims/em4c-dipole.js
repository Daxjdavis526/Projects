// An oscillating dipole and the radiation it sends out (PHYS 4600 M5.1–M5.2).
// Physics in model/em4c-dipole.js (tested in test/em4c-dipole.test.mjs).
// Two panels:
//
//   lines    the exact field lines of a point dipole oscillating as cos ωt, in
//            a plane containing its axis (vertical), at phase ωt. Electric
//            dipole: the electric field lines (violet), which near the dipole
//            stretch out and back like a static dipole's and, once ωt passes
//            a half cycle, pinch off into closed loops that travel outward at
//            c — the radiation. Magnetic dipole (a small current loop): the
//            same curves are the magnetic field lines (teal), and E circles
//            the axis. A dashed circle marks r = λ/2π, where the near and
//            radiation zones meet.
//   pattern  the time-averaged power per solid angle against direction, a
//            polar plot about the same vertical axis: sin²θ for a point dipole
//            (electric or magnetic), and, if asked, the half-wave antenna’s
//            [cos(½π cos θ)/sin θ]².
//
//   { type: 'em4c-dipole', params: {
//       kind: 'electric',       // 'electric' | 'magnetic'
//       kinds: null,            // a list of kinds to offer as a choice
//       phase: 60,              // ωt in degrees
//       view: 1.5,              // half-height of the lines panel, in wavelengths
//       panels: ['lines', 'pattern'],
//       pattern: 'short',       // 'short' (sin²θ) | 'half' (half-wave antenna) | 'both'
//       patterns: null,         // a list of patterns to offer as a choice
//       zones: true,            // the dashed r = λ/2π circle and the zone labels
//       play: null,             // animate ωt (default: in the Explore step, not in a problem)
//       controls: null,         // true, false or a list of: phase view kind pattern
//       readout: true,
//       labels: true,           // words drawn on the canvas
//       speed: 3,               // seconds per cycle when playing
//   } }
//
// Simplified: a point dipole (size ≪ λ), so the near field crowds without
// limit toward the centre; lines inside a small disc there are not drawn.
// Line spacing shows field strength only roughly, and in the near zone not at all.

import { Plot } from '../plot.js';
import * as D from '../model/em4c-dipole.js';
import { sampleGrid, contourSegments } from '../model/c3-contour.js';

export const defaults = {
  kind: 'electric', kinds: null, phase: 60, view: 1.5, panels: ['lines', 'pattern'], pattern: 'short', patterns: null,
  zones: true, play: null, controls: null, readout: true, labels: true, speed: 3,
};
const KINDS = ['electric', 'magnetic'];
const PANELS = ['lines', 'pattern'];
const PATTERNS = ['short', 'half', 'both'];
const DEG = Math.PI / 180;

export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  if (!KINDS.includes(P.kind)) out.push(`em4c-dipole: kind must be one of ${KINDS.join(', ')}`);
  for (const k of P.kinds || []) if (!KINDS.includes(k)) out.push(`em4c-dipole: unknown kind ${k}`);
  if (!PATTERNS.includes(P.pattern)) out.push(`em4c-dipole: pattern must be one of ${PATTERNS.join(', ')}`);
  for (const k of P.patterns || []) if (!PATTERNS.includes(k)) out.push(`em4c-dipole: unknown pattern ${k}`);
  for (const p of P.panels || []) if (!PANELS.includes(p)) out.push(`em4c-dipole: unknown panel ${p}`);
  if (!(P.panels || []).length) out.push('em4c-dipole: panels must not be empty');
  if (typeof P.phase !== 'number') out.push('em4c-dipole: phase must be a number (degrees)');
  if (!(typeof P.view === 'number' && P.view >= 0.15 && P.view <= 4)) out.push('em4c-dipole: view must be a number from 0.15 to 4 (wavelengths)');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!['phase', 'view', 'kind', 'pattern'].includes(c)) out.push(`em4c-dipole: unknown control ${c}`);
  if (!(P.speed > 0)) out.push('em4c-dipole: speed must be positive');
  return out;
}

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  const want = P.controls === true ? ['phase', 'view', 'kind', 'pattern'] : Array.isArray(P.controls) ? P.controls : P.controls === false || F.compact ? [] : ['phase', 'view'];
  const put = (k, v) => { F.params[k] = v; };
  const kinds = P.kinds && P.kinds.length > 1 ? P.kinds : null;
  const patterns = P.patterns && P.patterns.length > 1 ? P.patterns : null;

  if (kinds && !F.compact) F.choice({ key: 'kind', label: 'Dipole', options: kinds.map((k) => [k, k === 'electric' ? 'electric (two charges)' : 'magnetic (a current loop)']), value: P.kind, explain: 'An oscillating pair of charges, or a small loop whose current oscillates.' });
  else put('kind', P.kind);
  if (patterns && !F.compact) F.choice({ key: 'pattern', label: 'Pattern', options: patterns.map((k) => [k, { short: 'point dipole', half: 'half-wave antenna', both: 'both' }[k]]), value: P.pattern, explain: 'Power per solid angle against direction, for a dipole much shorter than λ or for an antenna half a wavelength long.' });
  else put('pattern', P.pattern);
  if (want.includes('phase')) F.slider({ key: 'phase', label: 'Phase $\\omega t$', min: 0, max: 360, step: 5, value: P.phase, unit: '^\\circ', explain: 'Where the dipole is in its cycle: at 0° the moment points up at full strength.' });
  else put('phase', P.phase);
  if (want.includes('view') && panels.includes('lines')) F.slider({ key: 'view', label: 'Zoom: half-height of the view', min: 0.2, max: 3, step: 0.05, value: P.view, unit: '\\lambda', explain: 'Close in (a fraction of a wavelength) the near zone dominates; far out only the radiation is left.' });
  else put('view', P.view);

  const lCv = panels.includes('lines') ? F.canvas({ aspect: 'wide', label: P.alt || 'Field lines of an oscillating dipole in a plane through its axis' }) : null;
  const pCv = panels.includes('pattern') ? F.canvas({ aspect: 'wide', label: 'The radiation pattern: power per solid angle against direction' }) : null;
  const pl = lCv && new Plot(lCv.canvas, { x: [-1, 1], y: [-1, 1], equal: true, grid: false, axes: false, pad: { l: 6, r: 6, t: 6, b: 6 } });
  const pp = pCv && new Plot(pCv.canvas, { x: [-1.3, 1.3], y: [-1.15, 1.15], equal: true, grid: false, axes: false, pad: { l: 6, r: 6, t: 6, b: 6 } });

  const still = P.play === false || F.compact;
  const S = { running: !still && (P.play ?? true) && !reduced && want.includes('phase') };
  const anim = F.animate((dt) => {
    if (!S.running) return;
    const ph = (F.params.phase + (dt * 360) / P.speed) % 360;
    F.set('phase', +ph.toFixed(1));
  }, { force: true });
  if (!still && want.includes('phase')) {
    const btn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => { S.running = !S.running; btn.textContent = S.running ? 'Pause' : 'Play'; if (S.running) anim.start(); } });
  }
  F.onChange(() => draw());

  function drawLines() {
    const V = +F.params.view, ph = F.params.phase * DEG, mag = F.params.kind === 'magnetic';
    pl.setView([-V, V], [-V, V]);
    pl.clear();
    const g = pl.ctx, x0 = pl.vx0, x1 = pl.vx1, y0 = pl.vy0, y1 = pl.vy1;
    const r0 = 0.06 * V;
    const nx = 170, ny = Math.round((nx * (y1 - y0)) / (x1 - x0));
    const grid = sampleGrid((x, z) => (Math.hypot(x, z) < r0 ? NaN : D.psiXZ(x, z, ph)), [x0, x1], [y0, y1], nx, ny);
    const step = V < 0.8 ? 0.3 * Math.sqrt(0.8 / V) : V <= 1.6 ? 0.3 : 0.45, top = Math.min(12, 1 / (2 * Math.PI * r0));
    const col = pl.color(mag ? 'teal' : 'violet');
    g.save();
    g.strokeStyle = col; g.lineWidth = 1.5; g.lineJoin = 'round'; g.lineCap = 'round';
    g.beginPath();
    for (let c = step / 2; c < top; c += step) {
      for (const lev of [c, -c]) {
        for (const [a, b] of contourSegments(grid, lev)) { g.moveTo(pl.X(a[0]), pl.Y(a[1])); g.lineTo(pl.X(b[0]), pl.Y(b[1])); }
      }
    }
    g.stroke();
    g.restore();
    // zones
    const lam2pi = 1 / (2 * Math.PI);
    if (P.zones !== false) {
      pl.circle(0, 0, lam2pi, { color: 'gold', width: 1.3, dash: [5, 5], alpha: 0.85 });
      if (P.labels !== false && V <= 1.2) pl.text('r = λ/2π', lam2pi * 0.71, lam2pi * 0.71, { color: 'gold', size: 11, dx: 4, dy: -6 });
      if (P.labels !== false && V > 0.6) pl.text('radiation zone', x1 - 0.03 * (x1 - x0), y1 - 0.06 * (y1 - y0), { color: 'ink3', size: 11.5, align: 'right' });
      if (P.labels !== false && V > 0.6 && V <= 1.2) pl.text('near zone', 0, -lam2pi, { color: 'ink3', size: 11, dy: 13, align: 'center' });
    }
    // the dipole axis
    pl.line(0, y0, 0, y1, { color: 'ink4', width: 1, dash: [2, 5] });
    // the source, drawn small at the centre (its strength follows cos ωt)
    const p = Math.cos(ph), d = r0 * 0.7;
    pl.circle(0, 0, r0, { fill: 'panel', alpha: 1, color: 'ink4', width: 1 });
    if (!mag) {
      pl.line(0, -d, 0, d, { color: 'ink2', width: 2 });
      const top = p >= 0 ? 'warn' : 'accent', bot = p >= 0 ? 'accent' : 'warn';
      const rr = 2 + 3.5 * Math.abs(p);
      pl.point(0, d, { color: top, r: rr });
      pl.point(0, -d, { color: bot, r: rr });
    } else {
      // a loop seen nearly edge-on, with its current's direction (counterclockwise from above when cos ωt > 0)
      const ry = d * 0.35;
      g.save(); g.strokeStyle = pl.color('warn'); g.lineWidth = 2;
      g.beginPath(); g.ellipse(pl.X(0), pl.Y(0), Math.abs(pl.X(d) - pl.X(0)), Math.abs(pl.Y(ry) - pl.Y(0)), 0, 0, 2 * Math.PI); g.stroke(); g.restore();
      if (Math.abs(p) > 0.15) { const s = Math.sign(p) * d * 0.5; pl.arrow(-s, -ry, s, -ry, { color: 'warn', width: 2, head: 7 }); }
    }
    // a scale bar of one wavelength (or a tenth of one)
    const bar = V > 0.6 ? 1 : 0.1;
    const bx = x0 + 0.04 * (x1 - x0), by = y0 + 0.06 * (y1 - y0);
    pl.line(bx, by, bx + bar, by, { color: 'ink2', width: 2 });
    pl.line(bx, by - 0.012 * (y1 - y0), bx, by + 0.012 * (y1 - y0), { color: 'ink2', width: 2 });
    pl.line(bx + bar, by - 0.012 * (y1 - y0), bx + bar, by + 0.012 * (y1 - y0), { color: 'ink2', width: 2 });
    pl.text(bar === 1 ? 'λ' : '0.1 λ', bx + bar / 2, by, { color: 'ink2', size: 11.5, dy: -11, align: 'center' });
    if (P.labels !== false) pl.text(mag ? 'B field lines' : 'E field lines', x0 + 0.03 * (x1 - x0), y1 - 0.06 * (y1 - y0), { color: mag ? 'teal' : 'violet', size: 12 });
  }

  function drawPattern() {
    pp.clear();
    const which = F.params.pattern;
    pp.line(0, -1.12, 0, 1.12, { color: 'ink4', width: 1, dash: [3, 4] });
    pp.line(-1.25, 0, 1.25, 0, { color: 'ink4', width: 1, dash: [1, 5] });
    const curve = (kind, o) => pp.curve((t) => D.pattern(kind, t) * Math.sin(t), (t) => D.pattern(kind, t) * Math.cos(t), 0, 2 * Math.PI, { samples: 720, ...o });
    if (which === 'short' || which === 'both') curve('short', { color: 'gold', width: 2.6 });
    if (which === 'half' || which === 'both') curve('half', { color: 'accent', width: 2.4, dash: which === 'both' ? [6, 4] : [] });
    // the source on the axis
    pp.line(0, -0.09, 0, 0.09, { color: 'ink2', width: 2.5 });
    if (P.labels !== false) {
      pp.text('axis', 0, 1.05, { color: 'ink3', size: 11, dx: 6, align: 'left' });
      if (which === 'both') {
        pp.text('point dipole: sin²θ', 0.62, 0.62, { color: 'gold', size: 11.5 });
        pp.text('half-wave antenna', 0.62, -0.62, { color: 'accent', size: 11.5 });
      } else pp.text(which === 'half' ? 'half-wave antenna' : 'sin²θ', 0.68, 0.55, { color: which === 'half' ? 'accent' : 'gold', size: 12 });
      pp.text('nothing along the axis', 0, -1.05, { color: 'ink3', size: 11, dx: 6, align: 'left' });
    }
  }

  function draw() {
    if (pl) drawLines();
    if (pp) drawPattern();
    if (P.readout === false) { F.readout([]); return; }
    const rows = [['Phase $\\omega t$', `${Math.round(F.params.phase)}^\\circ`]];
    if (pl) rows.push(['Half-height of view', `${(+F.params.view).toFixed(2)}\\,\\lambda`]);
    F.readout(rows);
  }
  F.draw(draw);
  if (!P.caption) F.caption('Exact fields of a point dipole oscillating as cos ωt, in a plane through its axis (the pattern is the same in every such plane). Lines are level curves of the flux function; their spacing is only a rough guide to field strength. Lengths in wavelengths λ.');
  return { get: (k) => F.params[k] };
}
