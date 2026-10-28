// The fundamental theorem of curves, made visible: a space curve built from
// nothing but its curvature κ(s) and torsion τ(s), by integrating the
// Frenet–Serret equations (model/dg-frenet.js, tested headlessly). A point
// rides the curve with its frame T, N, B; Play moves it. Constant κ and τ give
// a helix; τ = 0 keeps the curve in a plane.
//
//   { type: 'dg-frenet', params: {
//       kappa: 'k',  tau: 'w',          // expressions of the arc length s and the slider keys
//       length: 20,                     // how much curve to build (an expression of the keys)
//       sliders, choices, constants,    // parameters the expressions may use
//       ghost: { kappa: '1', tau: '0.5', length: 20 },   // optional: a second curve, faint, for comparison
//       at: 3,                          // where the point starts (a value of s)
//       show: ['T', 'N', 'B'],          // frame vectors drawn
//       readouts: ['s', 'kappa', 'tau'],
//       play: true, speed: 1,           // Play advances s at `speed` units per second
//       fixed: false,                   // a still picture: no slider, no Play
//       yaw, pitch } }
//
// The curve starts at a fixed place, with a frame chosen so that a constant-κ,
// τ curve is a helix about the vertical axis; where it ends up in space is
// otherwise arbitrary — the theorem fixes shape, not position.

import { View3D } from '../three-d.js';
import { tex } from '../../ui/dom.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/dg-frenet.js';

export const defaults = { kappa: '1', tau: '0.3', length: 20, show: ['T', 'N', 'B'], readouts: ['s', 'kappa', 'tau'], play: true, speed: 1, fixed: false, labels: true };

const SHOW = ['T', 'N', 'B'];
const READOUTS = ['s', 'kappa', 'tau'];
const COLORS = { T: 'accent', N: 'warn', B: 'teal' };
const CSSVAR = { accent: '--accent', warn: '--warn', teal: '--teal' };
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];

export function mount(F, P) {
  const { canvas, overlay } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A space curve built from its curvature and torsion' });
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  const num = (src, E) => (typeof src === 'number' ? src : fn(src, keys)(E));
  const curveFns = (spec, E) => {
    const k = fn(String(spec.kappa), ['s', ...keys]), t = fn(String(spec.tau), ['s', ...keys]);
    return [(s) => k({ ...E, s }), (s) => t({ ...E, s })];
  };

  const L0 = num(P.length, env());
  if (P.fixed) F.params.sp = P.at ?? 0.3 * L0;
  else F.slider({ key: 'sp', label: '$s$', min: 0, max: +L0.toFixed(4), step: +(L0 / 400).toPrecision(2), value: P.at ?? +(0.3 * L0).toFixed(3), explain: 'Arc length along the curve: moves the point and its frame.' });
  if (P.play && !P.fixed) {
    let anim = null;
    const btn = F.button({ label: 'Play ▶', onClick: () => {
      if (anim) { anim.stop(); anim = null; btn.textContent = 'Play ▶'; return; }
      btn.textContent = 'Pause ❚❚';
      anim = F.animate((dt) => {
        const L = num(P.length, env());
        let s = F.params.sp + dt * (P.speed || 1);
        if (s > Math.min(L, L0)) s = 0;
        F.set('sp', +s.toFixed(5));
      }, { force: true });
    } });
  }

  const view = new View3D(canvas, { yaw: P.yaw ?? 0.6, pitch: P.pitch ?? 0.35, dist: 8, target: [0, 0, 0], scale: 1.2 });
  view.onChange = () => draw();
  const hint = document.createElement('div');
  hint.textContent = 'drag to rotate';
  Object.assign(hint.style, { position: 'absolute', right: '10px', bottom: '6px', fontSize: '.72rem', color: 'var(--ink-3)' });
  overlay.append(hint);
  const pool = [];

  let cache = null, cacheKey = '';
  function build(E) {
    const key = JSON.stringify(E);
    if (key === cacheKey) return cache;
    const [k, t] = curveFns(P, E), L = num(P.length, E);
    const res = M.integrate(k, t, L, 600);
    let ghost = null;
    if (P.ghost) { const [gk, gt] = curveFns(P.ghost, E); ghost = M.integrate(gk, gt, num(P.ghost.length ?? P.length, E), 600); }
    const b = M.bounds([...res.p, ...(ghost ? ghost.p : [])]);
    view.target = b.centre;
    view.dist = Math.max(2, b.size * 2.4);
    cache = { res, ghost, b, k, t, L }; cacheKey = key;
    return cache;
  }

  function draw() {
    const E = env(), { res, ghost, b, k, t, L } = build(E);
    const s = Math.max(0, Math.min(L, F.params.sp));
    const q = M.sampleAt(res, s);
    view.begin();
    // a faint floor grid under the curve, for depth
    const z0 = b.min[2] - 0.05 * b.size, half = 0.6 * b.size, c = b.centre;
    const step = niceStep(b.size / 6);
    for (let g = Math.ceil((c[0] - half) / step) * step; g <= c[0] + half; g += step) view.line([[g, c[1] - half, z0], [g, c[1] + half, z0]], { color: 'line2', width: 0.7, bias: -0.4 });
    for (let g = Math.ceil((c[1] - half) / step) * step; g <= c[1] + half; g += step) view.line([[c[0] - half, g, z0], [c[0] + half, g, z0]], { color: 'line2', width: 0.7, bias: -0.4 });
    if (ghost) view.line(ghost.p, { color: 'ink3', width: 1.4, dash: [5, 5], bias: 0 });
    view.line(res.p, { color: 'violet', width: 2.4, bias: 0.02 });
    const len = 0.16 * b.size + 0.2, marks = [];
    for (const v of SHOW) {
      if (!(P.show || []).includes(v)) continue;
      const tip = q.p.map((x, i) => x + len * q[v][i]);
      view.arrow(q.p, tip, { color: COLORS[v], width: 2.6, bias: 0.08 });
      if (P.labels !== false) marks.push([q.p.map((x, i) => x + 1.18 * len * q[v][i]), `\\mathbf ${v}`, COLORS[v]]);
    }
    view.point(q.p, { color: 'gold', r: 5 });
    view.end();
    marks.forEach(([pt, label, color], i) => {
      let el = pool[i];
      if (!el) { el = document.createElement('div'); el.className = 'lbl'; overlay.append(el); pool.push(el); }
      const [sx, sy, depth] = view.project(pt);
      el.style.display = depth > 0.05 ? '' : 'none';
      el.style.left = `${sx - 6}px`; el.style.top = `${sy - 10}px`;
      el.style.color = `var(${CSSVAR[color]})`;
      if (el.dataset.src !== label) { el.dataset.src = label; el.innerHTML = tex(label); }
    });
    for (let i = marks.length; i < pool.length; i++) pool[i].style.display = 'none';
    const rows = [];
    for (const r of P.readouts || []) {
      if (r === 's') rows.push(['arc length $s$', fmtNum(s)]);
      if (r === 'kappa') rows.push(['curvature $\\kappa(s)$', fmtNum(k(s))]);
      if (r === 'tau') rows.push(['torsion $\\tau(s)$', fmtNum(t(s))]);
    }
    if (rows.length) F.readout(rows);
  }

  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption || 'The curve is built by integrating the Frenet–Serret equations from κ(s) and τ(s) (fourth-order Runge–Kutta). Where it sits and how it is turned are arbitrary: the curvature and torsion fix its shape only up to a rigid motion. Frame vectors are drawn shortened.');
}

function niceStep(x) {
  const p = 10 ** Math.floor(Math.log10(x || 1)), m = x / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}
function fmtNum(v) {
  if (!Number.isFinite(v)) return '\\text{—}';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) return v.toExponential(2).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`);
  return String(+v.toPrecision(3));
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = keysOf(P);
  const tryParse = (src, vars, where) => {
    if (typeof src === 'number') return;
    if (typeof src !== 'string') { problems.push(`dg-frenet ${where}: expected a number or an expression`); return; }
    try { fn(src, [...vars, ...keys]); } catch (e) { problems.push(`dg-frenet ${where}: “${src}” — ${e.message}`); }
  };
  if (P.kappa === undefined || P.tau === undefined) problems.push('dg-frenet needs kappa and tau');
  tryParse(P.kappa ?? '1', ['s'], 'kappa');
  tryParse(P.tau ?? '0', ['s'], 'tau');
  tryParse(P.length ?? 20, [], 'length');
  if (P.ghost) { tryParse(P.ghost.kappa ?? '', ['s'], 'ghost kappa'); tryParse(P.ghost.tau ?? '', ['s'], 'ghost tau'); if (P.ghost.length !== undefined) tryParse(P.ghost.length, [], 'ghost length'); }
  const E = { ...(P.constants || {}) };
  for (const s of P.sliders || []) E[s.key] = s.value;
  for (const c of P.choices || []) E[c.key] = c.value;
  try {
    const L = typeof P.length === 'number' ? P.length : fn(String(P.length ?? 20), keys)(E);
    if (!(L > 0)) problems.push('dg-frenet: length must be positive');
    if (P.at != null && (P.at < 0 || P.at > L)) problems.push('dg-frenet: at must lie in [0, length]');
  } catch { /* reported above */ }
  for (const k of P.show || []) if (!SHOW.includes(k)) problems.push(`dg-frenet: unknown frame vector “${k}” (use ${SHOW.join(', ')})`);
  for (const k of P.readouts || []) if (!READOUTS.includes(k)) problems.push(`dg-frenet: unknown readout “${k}” (use ${READOUTS.join(', ')})`);
  for (const s of P.sliders || []) if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
  return problems;
}
