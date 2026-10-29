// A pulse meeting a junction between two strings under the same tension —
// energy density, energy flux, reflection and transmission (PHYS 3750 W9).
// Top: the strings (drawn thicker where heavier) with the pulse, and, while
// the pulses overlap the junction, the incident and reflected parts dashed.
// Middle: the energy density e = ½μ y_t² + ½T y_x² shaded along the string,
// with the flux S = −T y_t y_x as arrows when asked. Bottom: bars of the
// energy on each string as fractions of the incident pulse's, beside the
// predictions r² and 4Z₁Z₂/(Z₁ + Z₂)². Exact solution in model/wv2-junction.js
// (tested in test/wv2-junction.test.mjs).
//
//   { type: 'wv2-junction', params: {
//       ratio: 4,             // μ₂/μ₁, the right string's density over the left's (0.02–50)
//       T: 10, mu1: 0.01,     // tension (N) and the left string's density (kg/m)
//       A: 0.05, w: 0.3,      // the pulse's height and rms width (m)
//       x0: -4,               // where the pulse starts (m, left of the junction)
//       x: [-6, 6],           // the window (m)
//       time: null,           // a still picture at this time (ms); null: start at 0
//       play: null,           // animate (default: in the Explore step, not in a problem)
//       panels: ['string', 'energy', 'bars'],
//       flux: false,          // energy-flux arrows on the energy panel
//       ghosts: true,         // incident and reflected parts dashed near the junction
//       controls: null,       // true, false, or a list of: ratio
//       readout: true,
//       readouts: null,       // rows: ratio r tau R Tr sum v1 v2 Z t (default: ratio r tau R Tr)
//       hide: [],             // rows printed as “?”
//   } }

import { Plot } from '../plot.js';
import * as J from '../model/wv2-junction.js';

export const defaults = {
  ratio: 4, T: 10, mu1: 0.01, A: 0.05, w: 0.3, x0: -4, x: [-6, 6], time: null, play: null,
  panels: ['string', 'energy', 'bars'], flux: false, ghosts: true, controls: null, readout: true, readouts: null, hide: [],
};
const PANELS = ['string', 'energy', 'bars'];
const ROWS = ['ratio', 'r', 'tau', 'R', 'Tr', 'sum', 'v1', 'v2', 'Z', 't'];
const trim = (x, d = 3) => (Number.isFinite(x) ? String(+(+x).toPrecision(d)) : '\\text{—}');

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  const want = P.controls === true || (P.controls === null && !F.compact) ? ['ratio'] : Array.isArray(P.controls) ? P.controls : [];
  if (want.includes('ratio')) {
    F.slider({ key: 'ratio', label: 'Density ratio $\\mu_2/\\mu_1$', min: 0.02, max: 50, value: P.ratio, logScale: true, fmt: (v) => String(+v.toPrecision(2)), explain: 'How much heavier the right-hand string is per metre. Same tension, so a heavier string is slower and has a higher impedance $Z = \\sqrt{T\\mu}$.' });
  } else F.params.ratio = P.ratio;

  const hide = new Set(P.hide || []);
  const cv = {};
  if (panels.includes('string')) cv.string = F.canvas({ aspect: 'wide', label: 'Two strings joined at a junction, with a pulse arriving from the left' });
  if (panels.includes('energy')) cv.energy = F.canvas({ height: F.compact ? '110px' : '140px', label: 'The energy density along the strings' });
  if (panels.includes('bars')) cv.bars = F.canvas({ height: F.compact ? '86px' : '96px', label: 'Energy on each string as a fraction of the incident pulse’s' });
  const ps = cv.string && new Plot(cv.string.canvas, { x: P.x, y: [-1, 1], grid: false, axes: true, xlabel: 'x (m)', ylabel: 'y', yticks: 0, axesAt: 'edge' });
  const pe = cv.energy && new Plot(cv.energy.canvas, { x: P.x, y: [0, 1], grid: false, axes: true, xlabel: '', ylabel: 'e', yticks: 0, xticks: 0, axesAt: 'edge', pad: { l: 46, r: 16, t: 10, b: 12 } });
  const pb = cv.bars && new Plot(cv.bars.canvas, { x: [0, 1.25], y: [0, 2], grid: false, axes: false, pad: { l: 92, r: 16, t: 6, b: 6 } });

  let S = J.setup({ ...P, ratio: +F.params.ratio });
  // model seconds per real second: the incident pulse crosses half the window in about 2.5 s
  const rate = () => (P.x[1] - P.x[0]) / 2 / S.v1 / 2.5;
  const tEnd = () => Math.max(2 * J.arrival(S), (P.x[1] / Math.min(S.v1, S.v2)) * 1.05);
  const still = P.time !== null && P.time !== undefined;
  const st = { t: still ? P.time / 1000 : 0, running: !still && (P.play ?? !F.compact) && !reduced };
  const anim = F.animate((dt) => {
    if (!st.running) return;
    st.t += dt * rate();
    if (st.t > tEnd()) st.t = 0;
    draw();
  }, { force: true });
  if ((P.play ?? !F.compact) !== false && panels.includes('string')) {
    const btn = F.button({ label: st.running ? 'Pause' : 'Play', primary: true, onClick: () => { st.running = !st.running; btn.textContent = st.running ? 'Pause' : 'Play'; if (st.running) anim.start(); } });
    F.button({ label: 'Restart', onClick: () => { st.t = 0; draw(); } });
  }
  F.onChange(() => { S = J.setup({ ...P, ratio: +F.params.ratio }); if (!still) st.t = 0; draw(); });

  const e0 = (S0) => (S0.T * S0.A * S0.A) / (S0.w * S0.w * Math.E);    // peak energy density of the incident pulse

  function drawString() {
    const p = ps, t = st.t, [xa, xb] = P.x;
    const ymax = S.A * Math.max(1.6, 1 + Math.abs(S.r), S.tau) * 1.15;
    p.setView(P.x, [-ymax * 0.55, ymax]);
    p.clear();
    const narrow = (cv.string.canvas.clientWidth || 600) < 520, fs = narrow ? 10.5 : 12;
    const heavy = (mu) => 1.2 + 4 * Math.sqrt(mu / Math.max(S.mu1, S.mu2));
    const n = 700, left = [], right = [];
    for (let i = 0; i <= n; i++) { const x = xa + ((xb - xa) * i) / n, y = J.field(S, x, t).y; (x <= 0 ? left : right).push([x, y]); }
    if (right.length && left.length) right.unshift([0, J.field(S, 0, t).y]);
    if (P.ghosts) {
      const inc = [], ref = [];
      for (let i = 0; i <= n / 2; i++) { const x = xa + ((0 - xa) * i) / (n / 2), q = J.parts(S, x, t); inc.push([x, q.inc]); ref.push([x, q.ref]); }
      const near = Math.abs(S.v1 * t + S.x0) < 4 * S.w || Math.abs(-S.v1 * t - S.x0) < 4 * S.w;
      if (near) { p.path(inc, { color: 'gold', width: 1.2, dash: [5, 4] }); p.path(ref, { color: 'violet', width: 1.2, dash: [5, 4] }); }
    }
    p.path(left, { color: 'accent', width: heavy(S.mu1) });
    p.path(right, { color: 'teal', width: heavy(S.mu2) });
    p.line(0, -ymax * 0.5, 0, ymax * 0.95, { color: 'ink3', width: 1, dash: [3, 4] });
    p.text('μ₁', xa, ymax * 0.82, { color: 'accent', dx: 8, size: fs });
    p.text('μ₂', xb, ymax * 0.82, { color: 'teal', dx: -8, align: 'right', size: fs });
    p.text('junction', 0, -ymax * 0.5, { color: 'ink3', dx: 5, dy: 0, size: fs - 1 });
  }

  function drawEnergy() {
    const p = pe, t = st.t, [xa, xb] = P.x;
    const top = e0(S) * Math.max(1.25, (4 * S.Z2 * S.Z2) / (S.Z1 + S.Z2) ** 2 * 1.1, (1 + Math.abs(S.r)) ** 2 * 0.9);
    p.setView(P.x, [0, top]);
    p.clear();
    const n = 700, pts = [];
    for (let i = 0; i <= n; i++) { const x = xa + ((xb - xa) * i) / n; pts.push([x, Math.min(top, J.energy(S, x, t).e)]); }
    p.path([[xa, 0], ...pts, [xb, 0]], { color: 'gold', width: 1.4, fill: 'gold', fillAlpha: 0.3, close: true });
    p.line(0, 0, 0, top, { color: 'ink3', width: 1, dash: [3, 4] });
    if (P.flux) {
      // flux arrows: length ∝ S, at a few points where the energy density is appreciable
      let smax = 1e-30;
      for (let i = 0; i <= 120; i++) smax = Math.max(smax, Math.abs(J.energy(S, xa + ((xb - xa) * i) / 120, t).S));
      const ref = S.v1 * e0(S);
      for (let i = 1; i < 24; i++) {
        const x = xa + ((xb - xa) * i) / 24, Sx = J.energy(S, x, t).S;
        if (Math.abs(Sx) < 0.04 * ref) continue;
        const len = (0.06 * (xb - xa) * Sx) / ref;
        p.arrow(x, top * 0.82, x + len, top * 0.82, { color: Sx > 0 ? 'accent' : 'violet', width: 2, head: 7 });
      }
    }
    p.text('energy density', xa, top, { color: 'ink2', dx: 6, dy: 10, size: 11 });
    if (P.flux) p.text('flux S →', xb, top, { color: 'ink2', dx: -6, dy: 10, align: 'right', size: 11 });
  }

  function drawBars() {
    const p = pb, t = st.t;
    p.clear();
    const { left, right } = J.split(S, t, 1200);
    const fl = left / S.E, fr = right / S.E, past = t > J.arrival(S) + 6 * S.w / Math.min(S.v1, S.v2);
    const row = (y, f, pred, label, color) => {
      p.rect(0, y - 0.32, 1, 0.64, { color: 'ink4', alpha: 0.12, width: 1 });
      p.rect(0, y - 0.32, Math.min(1.2, f), 0.64, { color, alpha: 0.55, width: 1 });
      if (pred !== null) p.line(pred, y - 0.42, pred, y + 0.42, { color: 'ink', width: 2 });
      p.text(label, 0, y, { dx: -8, align: 'right', size: 11.5, color: 'ink2' });
      p.text(`${(100 * f).toFixed(0)}%`, Math.min(1.2, f), y, { dx: 6, size: 11, color: 'ink2' });
    };
    row(1.5, fl, past ? S.R : null, 'left string', 'accent');
    row(0.5, fr, past ? S.Tr : null, 'right string', 'teal');
  }

  function readout() {
    if (P.readout === false) { F.readout([]); return; }
    const rows = P.readouts || ['ratio', 'r', 'tau', 'R', 'Tr'];
    const val = {
      ratio: ['$\\mu_2/\\mu_1$', trim(+F.params.ratio, 3)],
      r: ['$r = \\frac{Z_1 - Z_2}{Z_1 + Z_2}$', trim(S.r)], tau: ['$\\tau = \\frac{2Z_1}{Z_1 + Z_2}$', trim(S.tau)],
      R: ['reflected $r^2$', trim(S.R)], Tr: ['transmitted $\\tau^2 Z_2/Z_1$', trim(S.Tr)], sum: ['sum', trim(S.R + S.Tr, 4)],
      v1: ['$v_1$', `${trim(S.v1)}\\ \\mathrm{m/s}`], v2: ['$v_2$', `${trim(S.v2)}\\ \\mathrm{m/s}`], Z: ['$Z_2/Z_1$', trim(S.Z2 / S.Z1)],
      t: ['$t$', `${trim(st.t * 1000, 3)}\\ \\mathrm{ms}`],
    };
    F.readout(rows.filter((k) => val[k]).map((k) => [val[k][0], hide.has(k) ? '?' : val[k][1]]));
  }

  function draw() {
    if (ps) drawString();
    if (pe) drawEnergy();
    if (pb) drawBars();
    readout();
  }
  F.draw(draw);
  F.caption('Two ideal strings under the same tension, joined at x = 0; small displacements (exaggerated vertically). Line thickness shows density. Exact solution: the reflected and transmitted pulses are copies of the incident one, scaled by r and τ.');
  return { get: (k) => (k === 'ratio' ? +F.params.ratio : F.params[k]) };
}

export function validate(P) {
  const out = [];
  if (!(P.ratio >= 0.02 && P.ratio <= 50)) out.push('wv2-junction: ratio must lie in 0.02–50');
  for (const k of ['T', 'mu1', 'A', 'w']) if (!(P[k] > 0)) out.push(`wv2-junction: ${k} must be positive`);
  if (!(P.x0 < 0)) out.push('wv2-junction: x0 must be negative (the pulse starts on the left string)');
  if (!(Array.isArray(P.x) && P.x.length === 2 && P.x[0] < 0 && P.x[1] > 0)) out.push('wv2-junction: x must be [min, max] around the junction at 0');
  if (P.time !== null && P.time !== undefined && !(P.time >= 0)) out.push('wv2-junction: time (ms) must be zero or positive');
  if (!Array.isArray(P.panels) || !P.panels.length || P.panels.some((p) => !PANELS.includes(p))) out.push(`wv2-junction: panels must be a list of ${PANELS.join(', ')}`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (c !== 'ratio') out.push(`wv2-junction: unknown control “${c}”`);
  for (const r of [...(P.hide || []), ...(P.readouts || [])]) if (!ROWS.includes(r)) out.push(`wv2-junction: unknown readout “${r}”`);
  if (P.play !== null && P.play !== undefined && typeof P.play !== 'boolean') out.push('wv2-junction: play must be true, false or null');
  return out;
}
