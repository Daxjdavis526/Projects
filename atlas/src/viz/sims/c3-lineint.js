// A line integral built as you watch. A bead rides a path through a plane
// vector field; at the bead the field F (gold) and the direction of travel T
// (white) are drawn, with the part of F along the path (blue where it helps
// the motion, red where it opposes it). Below, the integrand F(r(t)) · r′(t)
// against the parameter, shaded where it is positive (blue) and negative
// (red): its area up to the bead is the work done so far. Reverse the
// direction and every contribution changes sign; trace the same curve at a
// different pace and the integrand changes shape while its area does not.
// Several paths between the same two points can be compared (path
// independence); a potential's level curves can be drawn under the field.
//
//   { type: 'c3-lineint', params: {
//       P: '-y', Q: 'x', x: [-3, 3], y: [-2.2, 2.2],     // the field and the window (equal scales)
//       paths: [{ x: 'cos(t)', y: 'sin(t)', t: [0, 'pi'], label: 'C₁', color: 'gold', labelAt: 0.6 }, …],
//       path: 0,                    // the path the bead rides; several → a choice
//       compare: false,             // draw every path, with each one's total in the readout
//       mode: 'work',               // 'work' ∫F·dr | 'flux' ∫F·n ds (n to the right of travel) | 'scalar' ∫f ds
//       f: '1 + y',                 // scalar mode: the function on the curve (say, a wire's density)
//       reverse: false, reverseToggle: null,      // walk the path backwards; the toggle shows unless in a question's picture
//       reparam: false,             // a choice of paces (steady, speeding up, slow at both ends) for the same curve
//       at: 0.35, atSlider: null,   // where the bead is, as a fraction of the parameter range; its slider (and Play)
//                                   //   show unless in a question's picture
//       play: true,
//       potential: null,            // an expression f(x, y): its level curves, and f(end) − f(start) in the readout
//       arrows: true, density: 13,  // the field's arrows (lengths compressed; colour shows strength)
//       integrand: null,            // the lower graph (default: on, except in a question's small picture)
//       bead: true,                 // false: no bead and no vectors at it (a plain picture of field and path)
//       readout: true,              // false hides every number (a question's picture must not show its answer)
//       points: [{ x, y, label, color }],
//       sliders, choices, constants,
//       xlabel: 'x', ylabel: 'y' } }
//
// The integrals are computed numerically by model/c3-vector.js.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/c3-vector.js';

export const defaults = {
  P: '-y', Q: 'x', x: [-3, 3], y: [-2.2, 2.2],
  paths: [{ x: '2*cos(t)', y: '1.5*sin(t)', t: [0, 'pi'], label: 'C', color: 'gold' }],
  path: 0, compare: false, mode: 'work', f: null, reverse: false, reverseToggle: null, reparam: false,
  at: 0.35, atSlider: null, play: true, potential: null, arrows: true, density: 13, integrand: null, bead: true,
  readout: true, points: [],
};

const MODES = ['work', 'flux', 'scalar'];
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
const num = (src, env, vars) => (typeof src === 'number' ? src : fn(src, vars)(env));
const tx = (v) => (Number.isFinite(v) ? String(+(Math.abs(v) < 5e-10 ? 0 : v).toPrecision(4)) : '\\text{—}');
const LABEL = { work: '\\vec F\\cdot d\\vec r', flux: '\\vec F\\cdot\\hat n\\,ds', scalar: 'f\\,ds' };

export function mount(F, P) {
  const compact = F.compact;
  const keys = keysOf(P), vars = ['x', 'y', ...keys];
  const mode = MODES.includes(P.mode) ? P.mode : 'work';
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A path through a vector field, with a bead riding along it' });
  const showGraph = P.integrand ?? !compact;
  const lower = showGraph ? F.canvas({ aspect: 'wide', height: compact ? '130px' : '175px', label: 'The integrand against the parameter, and its running area' }).canvas : null;
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  const paths = P.paths || [];
  const beadOn = P.bead !== false;
  if (paths.length > 1 && (beadOn || !P.compare)) F.choice({ key: '__path', label: 'Path', options: paths.map((p, k) => [k, p.label || `Path ${k + 1}`]), value: P.path ?? 0, explain: P.compare ? 'The bead rides the chosen path; every path is drawn, and the readout gives the total along each.' : 'Each runs through the same field.' });
  if (P.reverseToggle ?? !compact) F.toggle({ key: '__rev', label: 'Reverse the direction', value: !!P.reverse, explain: 'Walk the same curve from its end back to its start.' });
  else F.params.__rev = !!P.reverse;
  if (P.reparam) F.choice({ key: '__rep', label: 'Pace along the curve', options: [['steady', 'Steady'], ['faster', 'Speeding up'], ['startstop', 'Slow at both ends']], value: 'steady', explain: 'The same curve traced at a different pace: the parameter becomes $s$, from 0 to 1.' });
  if (beadOn && (P.atSlider ?? !compact)) F.slider({ key: '__s', label: 'Bead position', min: 0, max: 1, step: 0.005, value: P.at ?? 0.35, explain: 'How far through the parameter range the bead is: 0 at the start, 1 at the end.', fmt: (v) => v.toFixed(2) });
  else F.params.__s = P.at ?? 0.35;

  const plot = new Plot(canvas, { x: P.x, y: P.y, equal: true, xlabel: P.xlabel ?? 'x', ylabel: P.ylabel ?? 'y' });
  const gplot = lower ? new Plot(lower, { x: [0, 1], y: [-1, 1], xlabel: '', ylabel: '', xticks: 6, yticks: 4, pad: { l: 46, r: 16, t: 10, b: 34 } }) : null;

  // Play: run the bead from where it is to the end
  const S = { running: false };
  let playBtn = null;
  if (beadOn && P.play !== false && !compact) {
    const anim = F.animate((dt) => {
      if (!S.running) return;
      let s = F.params.__s + dt * 0.22;
      if (s >= 1) { s = 1; S.running = false; if (playBtn) playBtn.textContent = 'Replay'; }
      F.set('__s', s);
    }, { force: true });
    playBtn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; playBtn.textContent = 'Play'; return; }
      if (F.params.__s >= 1 - 1e-9) F.set('__s', 0);
      S.running = true; playBtn.textContent = 'Pause'; anim.start();
    } });
  }

  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  let cache = null;
  function build() {
    const E = env();
    const p = fn(P.P ?? 0, vars), q = fn(P.Q ?? 0, vars);
    const field = (x, y) => [p({ ...E, x, y }), q({ ...E, x, y })];
    const fs = P.f ? fn(P.f, vars) : null;
    const scalar = fs ? (x, y) => fs({ ...E, x, y }) : () => 1;
    const rev = !!F.params.__rev;
    const R = P.reparam ? M.REPARAM[F.params.__rep] || M.REPARAM.steady : M.REPARAM.steady;
    const curves = paths.map((pp) => {
      const X = fn(pp.x, ['t', ...keys]), Y = fn(pp.y, ['t', ...keys]);
      let [a, b] = pp.t.map((v) => num(v, E, keys));
      if (rev) [a, b] = [b, a];
      const c = { X: (t) => X({ ...E, t }), Y: (t) => Y({ ...E, t }) };
      // the parameter actually used: s ∈ [0, 1] when reparametrized, else t itself
      const tOf = (s) => a + (b - a) * R.phi(s);
      const g = (s) => {
        const t = tOf(s), k = (b - a) * R.dphi(s);
        if (mode === 'flux') return M.fluxIntegrand(field, c, t, b - a) * k;
        if (mode === 'scalar') return M.scalarIntegrand(scalar, c, t, b - a) * Math.abs(k);
        return M.workIntegrand(field, c, t, b - a) * k;
      };
      const run = M.running(g, 0, 1, 240);
      const total = M.gauss(g, 0, 1, 64);
      return { ...pp, c, a, b, tOf, g, run, total, color: pp.color || 'gold' };
    });
    // the field's arrows, sampled once
    const n = P.density || 13, grid = [];
    let maxM = 1e-12;
    if (mode !== 'scalar' && P.arrows !== false) {
      const dx = (plot.vx1 - plot.vx0) / n, dy = (plot.vy1 - plot.vy0) / Math.max(1, Math.round(n * (plot.vy1 - plot.vy0) / (plot.vx1 - plot.vx0)));
      for (let x = plot.vx0 + dx / 2; x < plot.vx1; x += dx) for (let y = plot.vy0 + dy / 2; y < plot.vy1; y += dy) {
        const [u, v] = field(x, y), m = Math.hypot(u, v);
        if (Number.isFinite(m)) { grid.push([x, y, u, v, m]); maxM = Math.max(maxM, m); }
      }
      cache = { field, curves, grid, maxM, step: Math.min(dx, dy), E };
    } else cache = { field, curves, grid, maxM: 1, step: (plot.vx1 - plot.vx0) / n, E };
    // the scale for the vectors at the bead: the strongest field on the paths is about two grid steps long
    let pm = 1e-12;
    for (const cv of curves) for (const s of cv.run.ts) { const t = cv.tOf(s), m = Math.hypot(...field(cv.c.X(t), cv.c.Y(t))); if (Number.isFinite(m)) pm = Math.max(pm, m); }
    cache.vecScale = (2 * cache.step) / pm;
  }

  F.onChange((key) => { if (key !== '__s') cache = null; draw(); });
  const viewKey = () => [plot.vx0, plot.vx1, plot.vy0, plot.vy1].map((v) => v.toFixed(6)).join();

  function draw() {
    plot.clear();
    if (!cache || cache.view !== viewKey()) { build(); cache.view = viewKey(); }
    const { field, curves, grid, maxM, step, E } = cache;
    const active = curves[paths.length > 1 ? +F.params.__path || 0 : 0];
    // potential contours under everything
    if (P.potential) contours(plot, fn(P.potential, vars), E);
    // the field
    const len = step * 0.8;
    for (const [x, y, u, v, m] of grid) {
      if (m < 1e-12) continue;
      const s = (len * (0.35 + 0.65 * Math.min(1, m / maxM))) / m, t = Math.min(1, m / maxM);
      plot.arrow(x - (u * s) / 2, y - (v * s) / 2, x + (u * s) / 2, y + (v * s) / 2, { color: `rgba(${Math.round(92 + 150 * t)},${Math.round(157 + 36 * t)},${Math.round(255 - 177 * t)},0.55)`, width: 1.2, head: 6 });
    }
    // the paths: dim in full, bright up to the bead, with arrowheads showing the direction
    const sNow = beadOn ? Math.max(0, Math.min(1, +F.params.__s)) : 1;
    const shown = P.compare ? curves : [active];
    for (const cv of shown) {
      const on = cv === active;
      const pts = cv.run.ts.map((s) => { const t = cv.tOf(s); return [cv.c.X(t), cv.c.Y(t)]; });
      plot.path(pts, { color: cv.color, width: on ? 2 : 2.2, alpha: on && beadOn ? 0.45 : 0.9 });
      if (on && beadOn) {
        const upto = Math.round(sNow * 240);
        plot.path(pts.slice(0, upto + 1), { color: cv.color, width: 3.4 });
      }
      for (const f of [0.2, 0.5, 0.8]) {
        const k = Math.round(f * 240), k0 = Math.max(0, k - 6);
        if (pts[k] && pts[k0] && Math.hypot(pts[k][0] - pts[k0][0], pts[k][1] - pts[k0][1]) > 1e-9) plot.arrow(pts[k0][0], pts[k0][1], pts[k][0], pts[k][1], { color: cv.color, width: 2, head: 9 });
      }
      plot.point(pts[0][0], pts[0][1], { color: cv.color, r: 3.5 });
      if (cv.label) {
        const k = Math.round((cv.labelAt ?? 0.62) * 240), q = pts[Math.min(240, k)];
        plot.text(cv.label, q[0], q[1], { color: cv.color, dx: cv.labelDx ?? 10, dy: cv.labelDy ?? -12, weight: 650 });
      }
    }
    for (const p of P.points || []) plot.point(num(p.x, E, keys), num(p.y, E, keys), { color: p.color || 'ink', label: p.label, ldx: p.labelDx, ldy: p.labelDy, lalign: p.labelAlign });

    // the bead and its vectors
    let soFar = null;
    if (beadOn && active) {
      const t = active.tOf(sNow), x = active.c.X(t), y = active.c.Y(t);
      const [vx, vy] = M.velocity(active.c, t, active.b - active.a), sp = Math.hypot(vx, vy) || 1;
      const T = [vx / sp, vy / sp], N = [T[1], -T[0]];     // N: to the right of travel
      if (mode !== 'scalar') {
        const [u, v] = field(x, y), k = cache.vecScale;
        const along = mode === 'flux' ? u * N[0] + v * N[1] : u * T[0] + v * T[1];
        const dir = mode === 'flux' ? N : T;
        // the direction of travel (or the normal), one grid step long
        plot.arrow(x, y, x + dir[0] * step * 1.1, y + dir[1] * step * 1.1, { color: 'ink', width: 1.8, head: 8, label: mode === 'flux' ? 'n̂' : 'T', ldx: 6, ldy: 10 });
        // F, and its component along T (or n), to the same scale
        if (Number.isFinite(u) && Math.hypot(u, v) > 1e-12) {
          plot.arrow(x, y, x + u * k, y + v * k, { color: 'gold', width: 2.6, head: 10, label: 'F', ldx: 6, ldy: -10 });
          const cx = x + dir[0] * along * k, cy = y + dir[1] * along * k;
          plot.line(x + u * k, y + v * k, cx, cy, { color: 'ink3', width: 1.2, dash: [4, 4] });
          if (Math.abs(along) * k > 1e-9) plot.arrow(x, y, cx, cy, { color: along >= 0 ? 'accent' : 'bad', width: 3, head: 9 });
        }
      }
      plot.point(x, y, { color: 'ink', r: 5.5 });
      soFar = active.run.cum[Math.round(sNow * 240)];
    }

    // the integrand, shaded, with the area so far
    if (gplot && active) {
      const { ts, vals } = active.run;
      let lo = Math.min(0, ...vals.filter(Number.isFinite)), hi = Math.max(0, ...vals.filter(Number.isFinite));
      const pad = 0.12 * (hi - lo || 1);
      gplot.setView([0, 1], [lo - pad, hi + pad]);
      gplot.o.xlabel = P.reparam ? 's' : 'fraction of the parameter range';
      gplot.clear();
      const f = (s) => active.g(s);
      gplot.area((s) => Math.max(0, f(s)), 0, 1, { color: 'accent', alpha: 0.16 });
      gplot.area((s) => Math.min(0, f(s)), 0, 1, { color: 'bad', alpha: 0.16 });
      if (beadOn && sNow > 0) {
        gplot.area((s) => Math.max(0, f(s)), 0, sNow, { color: 'accent', alpha: 0.42 });
        gplot.area((s) => Math.min(0, f(s)), 0, sNow, { color: 'bad', alpha: 0.42 });
      }
      gplot.path(ts.map((s, k) => [s, vals[k]]), { color: 'ink', width: 1.8 });
      if (beadOn) gplot.line(sNow, gplot.vy0, sNow, gplot.vy1, { color: 'ink3', width: 1.2, dash: [5, 4] });
      const name = mode === 'flux' ? 'F·n |r′|' : mode === 'scalar' ? 'f |r′|' : 'F·r′';
      gplot.text(P.reparam ? `${name} (per unit s)` : `integrand ${name}`, gplot.vx0, gplot.vy1, { dx: 8, dy: 10, color: 'ink2', size: 11.5 });
    }

    if (P.readout === false) { F.readout([]); return; }
    const rows = [];
    const L = LABEL[mode];
    if (beadOn && soFar !== null) rows.push([`so far: $\\int ${L}$`, tx(soFar)]);
    if (P.compare) curves.forEach((cv, k) => rows.push([`along ${cv.label || `path ${k + 1}`}`, tx(cv.total)]));
    else if (active) rows.push([`whole path: $\\int_C ${L}$`, tx(active.total)]);
    if (P.potential && active) {
      const pot = fn(P.potential, vars);
      const A = [active.c.X(active.a), active.c.Y(active.a)], B = [active.c.X(active.b), active.c.Y(active.b)];
      rows.push(['$f(\\text{end}) - f(\\text{start})$', tx(pot({ ...E, x: B[0], y: B[1] }) - pot({ ...E, x: A[0], y: A[1] }))]);
    }
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(P.caption || (mode === 'scalar'
    ? 'The integrand f|r′| against the parameter; its area is the integral. Computed numerically.'
    : 'Field arrows show direction; their lengths are compressed so weak and strong regions both show, and colour gives strength. The vectors at the bead are drawn to one scale. Integrals are computed numerically.'));
  return { get: (k) => F.params[k] };
}

// level curves of a potential (marching squares on a coarse grid)
function contours(plot, phi, E) {
  const N = 56, vals = [];
  for (let i = 0; i <= N; i++) { vals[i] = []; for (let j = 0; j <= N; j++) vals[i][j] = phi({ ...E, x: plot.vx0 + ((plot.vx1 - plot.vx0) * i) / N, y: plot.vy0 + ((plot.vy1 - plot.vy0) * j) / N }); }
  const flat = vals.flat().filter(Number.isFinite).sort((a, b) => a - b);
  if (!flat.length) return;
  for (let q = 1; q < 12; q++) {
    const lev = flat[Math.floor((flat.length * q) / 12)];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const pts = [];
      const cs = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      for (let k = 0; k < 4; k++) {
        const [a1, b1] = cs[k], [a2, b2] = cs[(k + 1) % 4], v1 = vals[a1][b1], v2 = vals[a2][b2];
        if ((v1 - lev) * (v2 - lev) < 0) { const t = (lev - v1) / (v2 - v1); pts.push([plot.vx0 + ((plot.vx1 - plot.vx0) * (a1 + (a2 - a1) * t)) / N, plot.vy0 + ((plot.vy1 - plot.vy0) * (b1 + (b2 - b1) * t)) / N]); }
      }
      if (pts.length >= 2) plot.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1], { color: 'violet', width: 1, alpha: 0.55 });
    }
  }
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const out = [];
  const keys = keysOf(P);
  const tryParse = (src, vars, where) => { if (src === undefined || src === null || typeof src === 'number') return; try { fn(src, [...vars, ...keys]); } catch (e) { out.push(`c3-lineint ${where}: “${src}” — ${e.message}`); } };
  if (P.mode && !MODES.includes(P.mode)) out.push(`c3-lineint mode must be one of ${MODES.join(', ')}`);
  if (P.mode !== 'scalar') { tryParse(P.P, ['x', 'y'], 'P'); tryParse(P.Q, ['x', 'y'], 'Q'); }
  if (P.mode === 'scalar' && !P.f) out.push('c3-lineint scalar mode needs f');
  tryParse(P.f, ['x', 'y'], 'f');
  tryParse(P.potential, ['x', 'y'], 'potential');
  if (!Array.isArray(P.paths) || !P.paths.length) out.push('c3-lineint needs at least one path');
  for (const [k, p] of (P.paths || []).entries()) {
    tryParse(p.x, ['t'], `path ${k + 1} x`); tryParse(p.y, ['t'], `path ${k + 1} y`);
    if (!Array.isArray(p.t) || p.t.length !== 2) { out.push(`c3-lineint path ${k + 1} needs t: [start, end]`); continue; }
    p.t.forEach((v) => tryParse(v, [], `path ${k + 1} t range`));
    if (p.label !== undefined && /\$|\\/.test(p.label)) out.push(`c3-lineint path ${k + 1} label “${p.label}” is drawn on the canvas: plain text, no TeX`);
  }
  for (const p of P.points || []) { tryParse(p.x, [], 'point'); tryParse(p.y, [], 'point'); if (p.label && /\$|\\/.test(p.label)) out.push(`c3-lineint point label “${p.label}” is plain text`); }
  for (const s of P.sliders || []) if (!(s.min < s.max) || s.value < s.min || s.value > s.max) out.push(`slider ${s.key}: value must lie in [min, max]`);
  if (P.at !== undefined && !(P.at >= 0 && P.at <= 1)) out.push('c3-lineint at must lie in [0, 1]');
  if (!(Array.isArray(P.x) && P.x[0] < P.x[1] && Array.isArray(P.y) && P.y[0] < P.y[1])) out.push('c3-lineint x and y must be ranges [lo, hi]');
  return out;
}
