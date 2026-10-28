// Noether's theorem side by side: a symmetry and the quantity it conserves.
// Left, a 1 kg puck moving in a plane over the contour lines of its potential
// energy; right, the candidate conserved quantities against time, each as a
// fraction of its starting value (a flat line at 1 is a conserved quantity).
//   rotation     U = ½(x² + (1 + ε)y²): circles when ε = 0 — angular momentum L
//   translation  U = ½y² + ε(x + 3): a straight valley, tilted by ε — momentum pₓ
//   time         U = ½(1 + ε sin 2t)(x² + y²): a bowl that breathes — energy E
// Slide ε away from 0 and exactly the protected quantity starts to change;
// the others, whose symmetries survive, stay flat.
// The physics is model/cm2-noether.js (tested in test/cm2-var.test.mjs).
//
//   { type: 'cm2-noether', params: {
//       kind: 'rotation',          // rotation | translation | time
//       kinds: false,              // a choice between the three
//       eps: 0,                    // the symmetry-breaking parameter (rotation 0–1, translation 0–0.4, time 0–0.25)
//       sliders: ['eps'],          // [] for a still picture
//       show: null,                // quantities on the right: any of E L px py (default: the kind's own plus one more)
//       panels: ['plane', 'Q'],
//       play: true,                // a Play button that runs the motion; otherwise the whole path is drawn
//       labels: true,              // the symmetry's name on the plane
//   } }

import { Plot } from '../plot.js';
import * as N from '../model/cm2-noether.js';

export const defaults = { kind: 'rotation', kinds: false, eps: 0, sliders: ['eps'], show: null, panels: ['plane', 'Q'], play: true, labels: true };
const EMAX = { rotation: 1, translation: 0.4, time: 0.25 };
const TMAX = { rotation: 20, translation: 6, time: 20 };
const SHOW = { rotation: ['L', 'E'], translation: ['px', 'E'], time: ['E', 'L'] };
const COL = { E: 'gold', L: 'accent', px: 'good', py: 'violet' };
const QNAME = { E: 'energy E', L: 'angular momentum L', px: 'momentum pₓ', py: 'momentum pᵧ' };
const QTEX = { E: 'E', L: 'L', px: 'p_x', py: 'p_y' };
const SYM = { rotation: 'symmetry: rotate about O', translation: 'symmetry: slide along x', time: 'symmetry: same at every t' };
const trim = (x, n = 3) => String(+(+x).toPrecision(n));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const panels = (P.panels || ['plane', 'Q']).filter((p) => ['plane', 'Q'].includes(p));
  const cv = {};
  for (const p of panels) cv[p] = F.canvas({ aspect: p === 'plane' ? '' : 'wide', label: p === 'plane' ? 'A puck moving over the contours of its potential energy' : 'Candidate conserved quantities against time' });
  if (P.kinds) F.choice({ key: 'kind', label: 'Symmetry', options: [['rotation', 'Rotation'], ['translation', 'Translation'], ['time', 'Time']], value: P.kind });
  else F.params.kind = P.kind;
  const emaxAll = P.kinds ? 0.25 : EMAX[P.kind];
  if ((P.sliders || []).includes('eps')) F.slider({ key: 'eps', label: 'Symmetry breaking $\\varepsilon$', min: 0, max: emaxAll, step: emaxAll / 100, value: Math.min(P.eps, emaxAll), unit: '', explain: 'At 0 the potential has the symmetry exactly; above 0 it is broken.' });
  else F.params.eps = P.eps;

  const plots = {};
  if (cv.plane) plots.plane = new Plot(cv.plane.canvas, { x: [-3, 3], y: [-1.8, 1.8], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', yticks: 5 });
  if (cv.Q) plots.Q = new Plot(cv.Q.canvas, { x: [0, 20], y: [0, 2], xlabel: 't (s)', ylabel: 'Q / Q(0)', yticks: 5 });

  let run = null, rkey = '';
  const getRun = () => {
    const k = `${F.params.kind}|${F.params.eps}`;
    if (k !== rkey) { rkey = k; run = N.run(F.params.kind, +F.params.eps, { T: TMAX[F.params.kind], steps: 3000 }); }
    return run;
  };
  const S = { i: null, running: false };
  let btn = null;
  const anim = P.play ? F.animate((dt) => {
    if (!S.running) return;
    const r = getRun(), n = r.t.length - 1, rate = n / TMAX[F.params.kind];
    S.i = Math.min(n, (S.i ?? 0) + Math.max(1, Math.round(dt * rate * 1.5)));
    if (S.i >= n) { S.running = false; btn.textContent = 'Replay'; }
    draw();
  }, { force: true }) : null;
  if (anim) {
    btn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; btn.textContent = 'Play'; return; }
      if (btn.textContent === 'Replay' || S.i === null) S.i = 0;
      S.running = true; btn.textContent = 'Pause'; anim.start();
    } });
    F.button({ label: 'Whole path', onClick: () => { S.running = false; S.i = null; btn.textContent = 'Play'; draw(); } });
  }
  F.onChange(() => { S.running = false; S.i = null; if (btn) btn.textContent = 'Play'; draw(); });

  function contours(pp, kind, eps, t) {
    const U = N.potential(kind, eps);
    for (const c of [0.1, 0.4, 0.9, 1.6, 2.5, 3.6]) {
      if (kind === 'rotation') pp.curve((s) => Math.sqrt(2 * c) * Math.cos(s), (s) => Math.sqrt((2 * c) / (1 + eps)) * Math.sin(s), 0, 2 * Math.PI, { color: 'ink4', width: 1.2 });
      else if (kind === 'time') { const k = 1 + eps * Math.sin(2 * t), r = Math.sqrt((2 * c) / k); pp.curve((s) => r * Math.cos(s), (s) => r * Math.sin(s), 0, 2 * Math.PI, { color: 'ink4', width: 1.2 }); }
    }
    if (kind === 'translation') {
      // U = ½y² + ε(x + 3) = c: horizontal lines when ε = 0, nested parabolas opening left otherwise
      for (const c of [0.05, 0.3, 0.8, 1.5]) {
        if (eps < 1e-6) { const y = Math.sqrt(2 * c); pp.line(-4, y, 4, y, { color: 'ink4', width: 1.2 }); pp.line(-4, -y, 4, -y, { color: 'ink4', width: 1.2 }); }
      }
      if (eps >= 1e-6) for (let j = 0; j < 9; j++) { const c = 0.3 * j; pp.curve((y) => (c - 0.5 * y * y) / eps - 3, (y) => y, -2, 2, { color: 'ink4', width: 1.2 }); }
    }
    void U;
  }

  function draw() {
    const kind = F.params.kind, eps = +F.params.eps, r = getRun(), n = r.t.length - 1;
    const i = S.i === null ? n : S.i;
    const show = P.show || SHOW[kind];
    if (plots.plane) {
      const pp = plots.plane;
      pp.setView(kind === 'translation' ? [-3, 4] : [-3, 3], [-1.8, 1.8]);
      pp.clear();
      contours(pp, kind, eps, r.t[i]);
      const trail = [];
      for (let j = 0; j <= i; j += 2) trail.push([r.s[j][0], r.s[j][1]]);
      pp.path(trail, { color: 'accent', width: 1.8 });
      const s = r.s[i];
      pp.point(0, 0, { color: 'ink3', r: 2.5, label: kind === 'translation' ? '' : 'O', ldx: -12, ldy: 10 });
      pp.point(s[0], s[1], { color: 'warn', r: 6 });
      if (P.labels) pp.text(SYM[kind] + (eps > 0 ? ' — broken' : ''), pp.vx0 + 0.04 * (pp.vx1 - pp.vx0), pp.vy1 - 0.08 * (pp.vy1 - pp.vy0), { color: eps > 0 ? 'bad' : 'good', size: 12.5, weight: 650 });
    }
    if (plots.Q) {
      const pq = plots.Q, T = TMAX[kind];
      const series = show.map((k) => { const q0 = r.q[k][0]; return [k, r.q[k].map((v) => v / q0)]; });
      let lo = 1, hi = 1;
      for (const [, v] of series) for (const x of v) { if (x < lo) lo = x; if (x > hi) hi = x; }
      lo = Math.min(lo, 0.8); hi = Math.max(hi, 1.2);
      const pad = 0.08 * (hi - lo);
      pq.setView([0, T], [lo - pad, hi + pad]);
      pq.clear();
      pq.line(0, 1, T, 1, { color: 'ink3', width: 1, dash: [4, 4] });
      series.forEach(([k, v], idx) => {
        const pts = [];
        for (let j = 0; j <= i; j += 3) pts.push([r.t[j], v[j]]);
        pts.push([r.t[i], v[i]]);
        pq.path(pts, { color: COL[k], width: 2.4 });
        pq.text(QNAME[k], pq.R - 8, pq.T + 12 + idx * 16, { screen: true, color: COL[k], size: 12, align: 'right', weight: 650 });
      });
    }
    F.readout([['$t$', `${trim(r.t[i])}\\,\\mathrm{s}`], ...show.map((k) => [`$${QTEX[k]}/${QTEX[k]}(0)$`, trim(r.q[k][i] / r.q[k][0], 4)])]);
  }
  F.draw(draw);
  F.caption('A 1 kg point puck, no friction; the grey lines are contours of equal potential energy. Integrated numerically (RK4). Each quantity is plotted as a fraction of its starting value.');
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  if (!N.KINDS.includes(P.kind)) out.push(`unknown kind “${P.kind}”`);
  const emax = P.kinds ? 0.25 : EMAX[P.kind] ?? 0;
  if (!(P.eps >= 0 && P.eps <= emax)) out.push(`eps must lie in [0, ${emax}]`);
  for (const s of P.sliders || []) if (s !== 'eps') out.push(`unknown slider “${s}”`);
  for (const q of P.show || []) {
    if (!['E', 'L', 'px', 'py'].includes(q)) { out.push(`unknown quantity “${q}”`); continue; }
    // each is drawn as a fraction of its starting value, which must not be zero
    if (N.KINDS.includes(P.kind) && Math.abs(N.quantities(P.kind, P.eps)[q](0, N.START[P.kind])) < 1e-9) out.push(`${q} starts at zero for ${P.kind}: it cannot be shown as a fraction of its start`);
  }
  for (const p of P.panels || []) if (!['plane', 'Q'].includes(p)) out.push(`unknown panel “${p}”`);
  return out;
}
