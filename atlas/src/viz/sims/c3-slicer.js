// A region of the plane cut into strips: the picture behind every iterated
// double integral. In dy dx order a vertical strip stands at x and the inner
// integral runs up it, from its bottom end y = lo(x) to its top end y = hi(x);
// in dx dy order a horizontal strip lies at height y and the inner integral
// runs along it from x = lo(y) to x = hi(y). Each end is labelled with the
// boundary curve it touches, so you can watch the limits change — and see
// where one order needs the region split in two. Sweep it across and the
// outer integral adds the strips up.
//
//   { type: 'c3-slicer', params: {
//       x: [-1.5, 2.5], y: [-0.5, 4.5],            // the window (equal scales)
//       dydx: [{ from: -1, to: 2, lo: 'x^2', hi: 'x + 2', loLabel: 'y = x²', hiLabel: 'y = x + 2' }],
//       dxdy: [{ from: 0, to: 1, lo: '-sqrt(y)', hi: 'sqrt(y)', loLabel: 'x = −√y', hiLabel: 'x = √y' },
//              { from: 1, to: 4, lo: 'y - 2', hi: 'sqrt(y)', loLabel: 'x = y − 2', hiLabel: 'x = √y' }],
//                                                // pieces of one description, end to end; give either or both
//       order: 'dydx', orderChoice: true,        // the order shown first; with both, a choice switches
//       f: 'x*y',                                // the integrand, for the readouts (omit: f = 1, so they give areas)
//       at: 0.4,                                 // where the strip starts, as a fraction of the outer range
//       strip: true,                             // false: a static picture of the region (with ghost strips, say)
//       ghost: 0,                                // n faint strips across the whole region: the order at a glance
//       sweep: true,                             // shade the part already swept, and offer a Sweep button
//       limits: true, labels: true,              // outer-limit lines; the strip's end labels
//       fromLabel / toLabel on a piece,          // how its outer limits are written ('x = √2'); default the number
//       readout: true,                           // false hides every number (for a question's picture)
//       sliders, choices, constants,             // as in graph, for f and the boundaries
//       curves: [{ fn, domain } | { param: [x(t), y(t)], t }, + color, width, dash, label, labelAt],
//       points: [{ x, y, label, color }], xlabel, ylabel, aspect } }
//
// validate() checks that each description joins up with lo ≤ hi and, when
// both orders are given, that they describe the same region: their area and
// their first and second moments must agree. The integration lives in
// model/c3-integrals.js. Canvas labels are plain text (Unicode, no TeX).

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/c3-integrals.js';

export const defaults = {
  x: [-1, 3], y: [-1, 3], order: 'dydx', orderChoice: true, f: null, at: 0.4, strip: true, ghost: 0, sweep: true,
  limits: true, labels: true, readout: true, aspect: '', xlabel: 'x', ylabel: 'y',
};

const ORDERS = ['dydx', 'dxdy'];
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
const minus = (s) => String(s).replace(/-/g, '−');
const num = (v) => minus(+(+v).toPrecision(4));

/** One order's pieces as functions of the outer variable, evaluated with environment E. */
function piecesOf(P, order, keys, E) {
  const outer = order === 'dydx' ? 'x' : 'y';
  const val = (src) => (typeof src === 'number' ? src : fn(src, keys)(E));
  return (P[order] || []).map((p) => {
    const lo = fn(p.lo, [outer, ...keys]), hi = fn(p.hi, [outer, ...keys]);
    return { ...p, from: val(p.from), to: val(p.to), lo: (t) => lo({ ...E, [outer]: t }), hi: (t) => hi({ ...E, [outer]: t }) };
  });
}

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A region of the plane cut into strips for an iterated integral' });
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  const orders = ORDERS.filter((o) => P[o]?.length);
  const two = orders.length > 1 && P.orderChoice !== false;
  if (two) {
    F.choice({ key: '__order', label: 'Order of integration', value: orders.includes(P.order) ? P.order : orders[0],
      options: [['dydx', 'dy dx: vertical strips'], ['dxdy', 'dx dy: horizontal strips']],
      explain: 'The same region, sliced two ways: the inner integral runs along each strip, the outer one adds the strips up.' });
  }
  const order = () => (two ? F.params.__order : orders.includes(P.order) ? P.order : orders[0]);
  const plot = new Plot(canvas, { x: P.x, y: P.y, equal: P.equal !== false, xlabel: P.xlabel, ylabel: P.ylabel, grid: P.grid ?? true });

  // one position slider per order; only the active order's is shown
  const pos = {};
  if (P.strip !== false) {
    for (const o of orders) {
      const [a, b] = M.outerRange(piecesOf(P, o, keys, env()));
      const outer = o === 'dydx' ? 'x' : 'y';
      pos[o] = F.slider({
        key: `__${outer}`, label: o === 'dydx' ? 'Strip at $x$' : 'Strip at $y$', min: a, max: b, step: (b - a) / 200, value: a + (P.at ?? 0.4) * (b - a),
        explain: o === 'dydx' ? 'Where the vertical strip stands. The inner integral runs up it, from its bottom end to its top end.' : 'Where the horizontal strip lies. The inner integral runs along it, from its left end to its right end.',
      });
    }
  }
  const showSliders = () => { for (const o of orders) if (pos[o]) pos[o].node.style.display = o === order() ? '' : 'none'; };
  showSliders();

  let anim = null, swept = false;
  if (P.strip !== false && P.sweep !== false) {
    const btn = F.button({ label: 'Sweep ▶', onClick: () => {
      if (anim) { anim.stop(); anim = null; btn.textContent = 'Sweep ▶'; return; }
      const o = order(), key = o === 'dydx' ? '__x' : '__y';
      const [a, b] = M.outerRange(piecesOf(P, o, keys, env()));
      F.set(key, a); swept = true;
      btn.textContent = 'Pause ❚❚';
      anim = F.animate((dt) => {
        const next = Math.min(b, F.params[key] + ((b - a) * dt) / 5);
        F.set(key, next);
        if (next >= b) { anim.stop(); anim = null; btn.textContent = 'Sweep ▶'; }
      }, { force: true });
    } });
  }
  F.onChange((key) => { if (key === '__order') showSliders(); if (key === '__x' || key === '__y') swept = true; draw(); });

  function draw() {
    plot.clear();
    const E = env(), o = order(), vertical = o === 'dydx';
    const pieces = piecesOf(P, o, keys, E);
    const [a, b] = M.outerRange(pieces);
    const t = P.strip === false ? null : F.params[vertical ? '__x' : '__y'];
    const fx = P.f ? fn(P.f, ['x', 'y', ...keys]) : null;
    const g = (u, s) => (fx ? fx({ ...E, ...(vertical ? { x: u, y: s } : { x: s, y: u }) }) : 1);
    // a point of the plane from (outer, inner) coordinates
    const pt = (u, s) => (vertical ? [u, s] : [s, u]);
    const band = (p, u0, u1, n = 80) => {
      const top = [], bot = [];
      for (let i = 0; i <= n; i++) { const u = u0 + ((u1 - u0) * i) / n; top.push(pt(u, p.hi(u))); bot.push(pt(u, p.lo(u))); }
      return [...bot, ...top.reverse()];
    };

    // the whole region as one polygon: every lower end in order, then every upper end back
    const edge = (side) => pieces.flatMap((p) => Array.from({ length: 121 }, (_, i) => { const u = p.from + ((p.to - p.from) * i) / 120; return pt(u, p[side](u)); }));
    const lower = edge('lo'), upper = edge('hi').reverse(), outline = [...lower, ...upper];
    plot.path(outline, { close: true, fill: 'accent', fillAlpha: 0.15, stroke: false });
    if (t !== null && (swept || P.sweepShade) && P.sweep !== false) {
      for (const p of pieces) { const u1 = Math.min(t, p.to); if (u1 > p.from) plot.path(band(p, p.from, u1), { close: true, fill: 'accent', fillAlpha: 0.22, stroke: false }); }
    }
    // ghost strips: the slicing at a glance
    const nG = Math.round(P.ghost || 0);
    for (let k = 0; k < nG; k++) {
      const w = (b - a) / nG, u0 = a + k * w + 0.12 * w, u1 = a + (k + 1) * w - 0.12 * w;
      for (const p of pieces) { const lo = Math.max(u0, p.from), hi = Math.min(u1, p.to); if (hi > lo) plot.path(band(p, lo, hi, 16), { close: true, fill: 'gold', fillAlpha: 0.32, color: 'gold', width: 0.8, alpha: 0.6 }); }
    }
    // the outline
    plot.path([...outline, outline[0]], { color: 'accent', width: 2 });
    // extra curves and points
    for (const c of P.curves || []) {
      const color = c.color || 'ink3', style = { color, width: c.width || 1.6, dash: c.dash ? [6, 5] : [] };
      if (c.fn) { const h = fn(c.fn, ['x', ...keys]); plot.fn((x) => h({ ...E, x }), { ...style, domain: c.domain }); }
      else if (c.param) { const X = fn(c.param[0], ['t', ...keys]), Y = fn(c.param[1], ['t', ...keys]); plot.curve((s) => X({ ...E, t: s }), (s) => Y({ ...E, t: s }), c.t[0], c.t[1], style); }
      if (c.label && c.labelAt !== undefined) {
        const at = c.labelAt;
        const [lx, ly] = c.fn ? [at, fn(c.fn, ['x', ...keys])({ ...E, x: at })] : [fn(c.param[0], ['t', ...keys])({ ...E, t: at }), fn(c.param[1], ['t', ...keys])({ ...E, t: at })];
        plot.text(c.label, lx, ly, { color, dx: c.labelDx ?? 6, dy: c.labelDy ?? -12, weight: 650 });
      }
    }
    // outer limits, and where the description changes formula
    if (P.limits !== false) {
      const ends = [[a, pieces[0].fromLabel], [b, pieces[pieces.length - 1].toLabel]];
      const splits = pieces.slice(1).map((p) => [p.from, p.fromLabel]);
      const mark = (u, label, color, prefix = '') => {
        const text = `${prefix}${vertical ? 'x' : 'y'} = ${label ?? num(u)}`;
        if (vertical) { plot.line(u, plot.vy0, u, plot.vy1, { color, width: 1.2, dash: [5, 5] }); plot.text(text, u, plot.vy0, { color, dx: 4, dy: -12, size: 12, weight: 600 }); }
        else { plot.line(plot.vx0, u, plot.vx1, u, { color, width: 1.2, dash: [5, 5] }); plot.text(text, plot.vx1, u, { color, dx: -4, dy: -10, align: 'right', size: 12, weight: 600 }); }
      };
      ends.forEach(([u, label]) => mark(u, label, 'ink3'));
      splits.forEach(([u, label]) => mark(u, label, 'warn', 'split at '));
    }
    // the strip
    let at = null;
    if (t !== null) {
      at = M.stripAt(pieces, t);
      if (at) {
        const w = (b - a) / 45, p = at.piece, u0 = Math.max(p.from, t - w / 2), u1 = Math.min(p.to, t + w / 2);
        plot.path(band(p, u0, u1, 12), { close: true, fill: 'gold', fillAlpha: 0.75, color: 'gold', width: 1 });
        const P0 = pt(t, at.lo), P1 = pt(t, at.hi);
        if (Math.hypot(P1[0] - P0[0], P1[1] - P0[1]) > 1e-9) plot.arrow(P0[0], P0[1], P1[0], P1[1], { color: 'gold', width: 1.6, head: 8 });
        plot.point(P0[0], P0[1], { color: 'gold', r: 4.5 });
        plot.point(P1[0], P1[1], { color: 'gold', r: 4.5 });
        if (P.labels !== false) {
          if (p.loLabel) plot.text(p.loLabel, P0[0], P0[1], vertical ? { color: 'gold', dx: 8, dy: 13, weight: 650 } : { color: 'gold', dx: -9, dy: 0, align: 'right', weight: 650 });
          if (p.hiLabel) plot.text(p.hiLabel, P1[0], P1[1], vertical ? { color: 'gold', dx: 8, dy: -13, weight: 650 } : { color: 'gold', dx: 9, dy: 0, weight: 650 });
        }
      }
    }
    for (const q of P.points || []) {
      const X = typeof q.x === 'number' ? q.x : fn(q.x, keys)(E), Y = typeof q.y === 'number' ? q.y : fn(q.y, keys)(E);
      plot.point(X, Y, { color: q.color || 'accent2', label: q.label, r: q.r, ldx: q.labelDx, ldy: q.labelDy, lalign: q.labelAlign });
    }

    if (P.readout === false) { F.readout([]); return; }
    const inner = vertical ? 'y' : 'x';
    const total = M.iterated(pieces, g, 120);
    const rows = [];
    if (at) {
      rows.push(['inner limits', `${tx(at.lo)} \\le ${inner} \\le ${tx(at.hi)}`]);
      rows.push([fx ? `inner integral $\\int f\\,d${inner}$` : 'strip length', tx(M.simpson((s) => g(t, s), at.lo, at.hi, 120))]);
      rows.push([fx ? 'swept so far' : 'area swept so far', tx(M.sweptIntegral(pieces, t, g, 80))]);
    }
    rows.push([fx ? 'whole region $\\iint_D f\\,dA$' : 'area of the region', tx(total)]);
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(P.caption || 'The shaded region, cut into strips. Gold: one strip, with the boundary curve at each end. Equal scales on both axes.');
  return { get: (k) => F.params[k], destroy: () => anim?.stop() };
}

const tx = (v) => (Number.isFinite(v) ? String(+v.toPrecision(4)) : '\\text{—}');

/** Node-side check used by the content tests. */
export function validate(P) {
  const out = [];
  const keys = keysOf(P);
  const E = { ...(P.constants || {}) };
  for (const s of P.sliders || []) { E[s.key] = s.value; if (!(s.min < s.max) || s.value < s.min || s.value > s.max) out.push(`slider ${s.key}: value must lie in [min, max]`); if (!s.label) out.push(`slider ${s.key} needs a label`); }
  for (const c of P.choices || []) E[c.key] = c.value;
  const tryF = (src, vars, where) => { if (typeof src === 'number') return true; try { fn(src, [...vars, ...keys]); return true; } catch (e) { out.push(`c3-slicer ${where}: “${src}” — ${e.message}`); return false; } };
  const orders = ORDERS.filter((o) => P[o]?.length);
  if (!orders.length) out.push('c3-slicer needs dydx or dxdy pieces');
  for (const k of ['x', 'y']) if (!(Array.isArray(P[k]) && P[k].length === 2 && P[k][0] < P[k][1])) out.push(`c3-slicer ${k} must be [lo, hi]`);
  if (P.f && !tryF(P.f, ['x', 'y'], 'f')) return out;
  let ok = true;
  for (const o of orders) {
    const outer = o === 'dydx' ? 'x' : 'y';
    P[o].forEach((p, k) => {
      for (const f of ['lo', 'hi']) if (!tryF(p[f], [outer], `${o}[${k}].${f}`)) ok = false;
      for (const f of ['from', 'to']) if (!tryF(p[f], [], `${o}[${k}].${f}`)) ok = false;
      for (const f of ['loLabel', 'hiLabel', 'fromLabel', 'toLabel']) if (p[f] !== undefined && /\$|\\/.test(p[f])) out.push(`c3-slicer ${o}[${k}].${f} “${p[f]}” is drawn on the canvas: plain text and Unicode, no TeX`);
    });
  }
  for (const c of P.curves || []) {
    if (c.fn) tryF(c.fn, ['x'], 'curve fn');
    else if (c.param) { tryF(c.param[0], ['t'], 'curve param'); tryF(c.param[1], ['t'], 'curve param'); if (!Array.isArray(c.t)) out.push('c3-slicer curve: param needs t: [a, b]'); }
    else out.push('c3-slicer curve needs fn or param');
  }
  for (const q of P.points || []) { tryF(q.x, [], 'point x'); tryF(q.y, [], 'point y'); }
  for (const lbl of [...(P.curves || []), ...(P.points || [])].map((c) => c.label).filter(Boolean)) if (/\$|\\/.test(lbl)) out.push(`c3-slicer label “${lbl}” is drawn on the canvas: plain text, no TeX`);
  if (!ok || out.length) return out;
  const desc = {};
  for (const o of orders) {
    const pieces = piecesOf(P, o, keys, E);
    out.push(...M.stripProblems(pieces, o));
    desc[o] = pieces;
  }
  if (orders.length === 2 && !out.length) {
    // the two descriptions must be one region: compare its area and moments
    const fx = P.f ? fn(P.f, ['x', 'y', ...keys]) : null;
    const tests = [['area', () => 1], ['∬x', (x) => x], ['∬y', (x, y) => y], ['∬x²', (x) => x * x], ['∬xy', (x, y) => x * y], ...(fx ? [['∬f', (x, y) => fx({ ...E, x, y })]] : [])];
    for (const [name, h] of tests) {
      const A = M.iterated(desc.dydx, (x, y) => h(x, y), 160), B = M.iterated(desc.dxdy, (y, x) => h(x, y), 160);
      if (Math.abs(A - B) > 2e-3 * Math.max(1, Math.abs(A), Math.abs(B))) out.push(`c3-slicer: the dy dx and dx dy descriptions are different regions (${name}: ${A.toPrecision(5)} vs ${B.toPrecision(5)})`);
    }
  }
  return out;
}
