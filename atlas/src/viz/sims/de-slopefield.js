// Slope fields of a first-order equation y′ = f(t, y), for reading solutions
// before (or instead of) solving: a short segment of the slope f at each
// point of a grid; solution curves through chosen points, traced forward and
// backward in t by RK4; a draggable start point whose solution is drawn bold;
// isoclines f(t, y) = c, the curves along which every segment has slope c
// (the nullcline c = 0, where solutions are level, in gold); for an
// autonomous equation y′ = g(y), a phase line beside the field with its
// equilibria (filled: stable, hollow: unstable, half-filled: semi-stable) and
// arrows; and explicit curves — an exact solution family, say — written as
// expressions of t. In the Explore view a click on the field adds a solution
// through that point. Numerics in model/de-ode.js (test/de-ode.test.mjs).
//
//   { type: 'de-slopefield', params: {
//       f: 'y^2 - t',                    // y′ = f(t, y): an expression of t, y and the slider/choice keys
//       x: [-2, 4], y: [-3, 3],          // the window: t across, y up
//       xlabel: 't', ylabel: 'y',        // axis titles (plain text on the canvas: Unicode, no TeX)
//       sliders, choices, constants,     // as in graph
//       field: true,                     // the slope segments (false hides them)
//       grid: [21, 15],                  // how many segments across and up
//       seeds: [[0, 1], { t: 0, y: -1, color: 'good' }],   // solution curves through these points
//       seedColor: null,                 // one colour for every seed (a family), instead of a palette
//       start: [0, 0.5],                 // a draggable start point whose solution is drawn bold (a point item's answer)
//       click: true,                     // a click adds a solution (Explore view only, never in a problem)
//       isoclines: [-1, 0, 1],           // the slopes c whose isoclines f = c are drawn, dashed and labelled
//       isoToggle: false,                // offer a switch for them (they then start hidden)
//       phaseLine: false,                // autonomous f (no t): the phase line at the right, with equilibria
//       equilibria: true,                // with phaseLine: draw each equilibrium solution y = c across the field
//       curves: [{ fn: '(t - c)^3*step(t - c)', domain, color, width, dash, label, labelAt, labelDx, labelDy, when }],
//       points: [{ x, y, label, color, labelDx, labelDy, when }],
//       hlines: [{ y, label, color }], vlines: [{ x, label, color }],
//       readouts: [{ label, expr, unit, digits }],   // expressions of the slider keys and t0, y0 (the start point)
//       aspect: 'square' } }
//
// A problem's picture must not show its answer: leave out the start point or
// the curve the question asks about, and the readouts.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import { traceCurve, equilibria } from '../model/de-ode.js';
import { sampleGrid, contourSegments, joinSegments, labelSpot, levelText } from '../model/c3-contour.js';

export const defaults = {
  f: 'y - t', x: [-3, 3], y: [-3, 3], xlabel: 't', ylabel: 'y', field: true, grid: [21, 15],
  seeds: [], seedColor: null, start: null, click: true, isoclines: null, isoToggle: false,
  phaseLine: false, equilibria: true, curves: [], points: [], hlines: [], vlines: [], readouts: null, aspect: 'square',
};

const SEED_COLORS = ['accent2', 'good', 'violet', 'teal', 'warn', 'bad'];

// a polyline kept inside the plotting frame (a traced solution may run past it)
function framed(plot, pts, o) {
  plot.ctx.save();
  plot._clip();
  plot.path(pts, o);
  plot.ctx.restore();
}
const EQ_COLOR = { stable: 'good', unstable: 'bad', semi: 'warn' };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const { canvas } = F.canvas({ aspect: P.aspect, label: P.alt || (P.phaseLine ? 'A slope field with solution curves and a phase line' : 'A slope field with solution curves') });
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  if (P.isoclines && P.isoToggle) F.toggle({ key: 'iso', label: 'Show isoclines', value: false, explain: 'Each dashed curve joins the points where the slope has one value $c$; on the gold one, $c = 0$, solutions are momentarily level.' });
  const keys = [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = F.params[k]; return e; };
  const plot = new Plot(canvas, { x: P.x, y: P.y, xlabel: P.xlabel, ylabel: P.ylabel, pad: { l: 46, r: P.phaseLine ? 72 : 16, t: 14, b: 34 } });

  const start = P.start ? { t: P.start[0], y: P.start[1] } : null;
  let dragged = false;
  if (start) {
    plot.handle(() => [start.t, start.y], (t, y) => {
      start.t = Math.max(plot.vx0, Math.min(plot.vx1, t));
      start.y = Math.max(plot.vy0, Math.min(plot.vy1, y));
    }, { hollow: true });
    // a dragged start point can be a point item's answer: tell the question to re-read it
    plot.onDrag = () => { dragged = true; draw(); F.notify('point'); };
  }
  const added = [];
  if (P.click && !F.compact) {
    canvas.addEventListener('pointerdown', () => { dragged = false; });
    canvas.addEventListener('click', (e) => {
      if (dragged) { dragged = false; return; }
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      if (px < plot.L || px > plot.R || py < plot.T || py > plot.B) return;
      if (start && Math.hypot(plot.X(start.t) - px, plot.Y(start.y) - py) < 18) return;
      added.push([plot.ix(px), plot.iy(py)]);
      if (added.length > 10) added.shift();
      draw();
    });
    F.button({ label: 'Clear added curves', onClick: () => { added.length = 0; draw(); } });
  }
  F.onChange(() => draw());

  function draw() {
    plot.clear();
    const E = env();
    const fc = fn(P.f, ['t', 'y', ...keys]);
    const f = (t, y) => fc({ ...E, t, y });
    const ev = (src, extra = {}) => (typeof src === 'number' ? src : fn(src, [...keys, ...Object.keys(extra)])({ ...E, ...extra }));
    const shown = (o) => !o.when || ev(o.when);
    const win = [[plot.vx0, plot.vx1], [plot.vy0, plot.vy1]];

    if (P.isoclines && (!P.isoToggle || F.params.iso)) drawIsoclines(f);
    if (P.field !== false) drawField(f);

    let eq = [];
    if (P.phaseLine) {
      const tm = (plot.vx0 + plot.vx1) / 2;
      eq = equilibria((y) => f(tm, y), plot.vy0, plot.vy1);
      if (P.equilibria !== false) for (const e of eq) plot.line(plot.vx0, e.y, plot.vx1, e.y, { color: EQ_COLOR[e.kind], width: 2 });
    }
    for (const l of P.hlines || []) { if (!shown(l)) continue; const y = ev(l.y); plot.line(plot.vx0, y, plot.vx1, y, { color: l.color || 'ink3', width: 1.2, dash: [5, 5] }); if (l.label) plot.text(l.label, plot.vx1, y, { dx: -4, dy: -10, align: 'right', color: l.color || 'ink3' }); }
    for (const l of P.vlines || []) { if (!shown(l)) continue; const x = ev(l.x); plot.line(x, plot.vy0, x, plot.vy1, { color: l.color || 'ink3', width: 1.2, dash: [5, 5] }); if (l.label) plot.text(l.label, x, plot.vy1, { dx: 4, dy: 10, color: l.color || 'ink3' }); }

    for (const c of P.curves || []) {
      if (!shown(c)) continue;
      const g = fn(c.fn, ['t', ...keys]);
      const y = (t) => g({ ...E, t });
      const domain = c.domain ? [ev(c.domain[0]), ev(c.domain[1])] : undefined;
      plot.fn(y, { color: c.color || 'gold', width: c.width || 2.4, dash: c.dash ? [6, 5] : [], domain });
      if (c.label && c.labelAt !== undefined) { const at = ev(c.labelAt); plot.text(c.label, at, y(at), { color: c.color || 'gold', dx: c.labelDx ?? 6, dy: c.labelDy ?? -12, weight: 650 }); }
    }

    const seeds = [...(P.seeds || []).map((s, i) => (Array.isArray(s) ? { t: s[0], y: s[1], color: P.seedColor || SEED_COLORS[i % SEED_COLORS.length] } : { color: P.seedColor || SEED_COLORS[i % SEED_COLORS.length], ...s })),
      ...added.map(([t, y], i) => ({ t, y, color: SEED_COLORS[(i + 1) % SEED_COLORS.length] }))];
    for (const s of seeds) {
      const t0 = ev(s.t), y0 = ev(s.y);
      framed(plot, traceCurve(f, t0, y0, ...win), { color: s.color, width: 2 });
      plot.point(t0, y0, { color: s.color, r: 3.5, label: s.label, ldx: s.labelDx, ldy: s.labelDy });
    }
    if (start) framed(plot, traceCurve(f, start.t, start.y, ...win), { color: 'accent', width: 2.8 });

    for (const p of P.points || []) {
      if (!shown(p)) continue;
      plot.point(ev(p.x), ev(p.y), { color: p.color || 'accent2', label: p.label, r: p.r, ldx: p.labelDx, ldy: p.labelDy });
    }
    if (P.phaseLine) drawPhaseLine(f, eq);
    plot.drawHandles();
    if (P.readouts) {
      const extra = start ? { t0: start.t, y0: start.y } : {};
      F.readout(P.readouts.map((r) => [r.label, fmtVal(ev(r.expr, extra), r)]));
    }
  }

  function drawField(f) {
    const [nx, ny] = P.grid || [21, 15];
    const g = plot.ctx, col = plot.col;
    const kx = (plot.R - plot.L) / (plot.vx1 - plot.vx0), ky = (plot.B - plot.T) / (plot.vy1 - plot.vy0);
    const half = 0.36 * Math.min((plot.R - plot.L) / nx, (plot.B - plot.T) / ny);
    g.save();
    g.strokeStyle = col.ink3; g.lineWidth = 1.25; g.lineCap = 'round';
    g.beginPath();
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const t = plot.vx0 + ((i + 0.5) * (plot.vx1 - plot.vx0)) / nx, y = plot.vy0 + ((j + 0.5) * (plot.vy1 - plot.vy0)) / ny;
      const m = f(t, y);
      if (!Number.isFinite(m)) continue;
      // the direction of slope m on screen: world (1, m) scaled by pixels per unit
      const ex = kx, ey = -m * ky, el = Math.hypot(ex, ey);
      const cx = plot.X(t), cy = plot.Y(y);
      g.moveTo(cx - (ex / el) * half, cy - (ey / el) * half); g.lineTo(cx + (ex / el) * half, cy + (ey / el) * half);
    }
    g.stroke();
    g.restore();
  }

  function drawIsoclines(f) {
    const grid = sampleGrid((t, y) => f(t, y), [plot.vx0, plot.vx1], [plot.vy0, plot.vy1], 140, 110);
    const taken = [];
    const inside = (p) => p[0] > plot.vx0 + 0.06 * (plot.vx1 - plot.vx0) && p[0] < plot.vx1 - 0.1 * (plot.vx1 - plot.vx0) && p[1] > plot.vy0 + 0.05 * (plot.vy1 - plot.vy0) && p[1] < plot.vy1 - 0.05 * (plot.vy1 - plot.vy0);
    const dist = (a, b) => Math.hypot(plot.X(a[0]) - plot.X(b[0]), plot.Y(a[1]) - plot.Y(b[1]));
    for (const c of P.isoclines) {
      const color = c === 0 ? 'gold' : 'violet';
      const lines = joinSegments(contourSegments(grid, c));
      for (const line of lines) framed(plot, line, { color, width: c === 0 ? 2 : 1.5, dash: [7, 5], alpha: 0.9 });
      // one label per isocline, on its longest piece
      const longest = lines.reduce((best, l) => (l.length > (best?.length || 0) ? l : best), null);
      const spot = longest && labelSpot(longest, { at: 0.62, inside, taken, gap: 46, dist });
      if (spot) { taken.push(spot); plot.text(`slope ${levelText(c)}`, spot[0], spot[1], { color, dx: 6, dy: -10, size: 11.5, weight: 650 }); }
    }
  }

  function drawPhaseLine(f, eq) {
    const g = plot.ctx, x = plot.R + 36;
    const tm = (plot.vx0 + plot.vx1) / 2;
    g.save();
    g.strokeStyle = plot.col.ink2; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x, plot.T); g.lineTo(x, plot.B); g.stroke();
    // an arrow in every interval between equilibria, pointing the way y moves there
    const cuts = [plot.vy0, ...eq.map((e) => e.y), plot.vy1];
    for (let k = 0; k + 1 < cuts.length; k++) {
      const a = cuts[k], b = cuts[k + 1];
      if (plot.Y(a) - plot.Y(b) < 26) continue;
      const mid = (a + b) / 2, s = Math.sign(f(tm, mid));
      if (!s) continue;
      const py = plot.Y(mid), d = 7 * s;
      g.fillStyle = plot.col.ink2;
      g.beginPath(); g.moveTo(x, py - d); g.lineTo(x - 6, py + d); g.lineTo(x + 6, py + d); g.closePath(); g.fill();
    }
    for (const e of eq) {
      const py = plot.Y(e.y), c = plot.color(EQ_COLOR[e.kind]);
      g.lineWidth = 2.2; g.strokeStyle = c; g.fillStyle = e.kind === 'stable' ? c : plot.col.panel;
      g.beginPath(); g.arc(x, py, 6, 0, Math.PI * 2); g.fill(); g.stroke();
      if (e.kind === 'semi') {
        // fill the half that solutions approach from: below if g > 0 there, above if g < 0
        g.fillStyle = c; g.beginPath();
        if (e.below > 0) g.arc(x, py, 6, 0, Math.PI); else g.arc(x, py, 6, Math.PI, 2 * Math.PI);
        g.closePath(); g.fill();
      }
    }
    g.fillStyle = plot.col.ink3; g.font = '11px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillText('phase', x, plot.B + 6); g.fillText('line', x, plot.B + 19);
    g.restore();
  }

  F.draw(draw);
  if (P.caption) F.caption(P.caption);
  else F.caption(P.phaseLine
    ? 'Segments show the slope only (their length means nothing). On the phase line: filled dot, stable equilibrium; hollow, unstable; half-filled, semi-stable. Curves are traced numerically (RK4).'
    : 'Segments show the slope only (their length means nothing). Curves are traced numerically with RK4 from the marked points.');
  return { get: (k) => ((k === 'start' || k === 'point') && start ? { x: start.t, y: start.y } : F.params[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
  const tryParse = (src, vars, where) => {
    if (typeof src === 'number' || src === undefined || src === null) return;
    try { fn(src, [...vars, ...keys]); } catch (e) { problems.push(`de-slopefield ${where}: “${src}” — ${e.message}`); }
  };
  const range = (r, w) => { if (!Array.isArray(r) || r.length !== 2 || !(r[0] < r[1])) problems.push(`de-slopefield: ${w} must be [min, max] with min < max`); };
  range(P.x, 'x'); range(P.y, 'y');
  tryParse(P.f, ['t', 'y'], 'f');
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`slider ${s.key} needs a label`);
  }
  if (P.grid && !(Array.isArray(P.grid) && P.grid.length === 2 && P.grid.every((n) => Number.isInteger(n) && n > 1 && n < 80))) problems.push('de-slopefield: grid must be [nx, ny], whole numbers from 2 to 79');
  if (P.isoclines && !(Array.isArray(P.isoclines) && P.isoclines.every(Number.isFinite))) problems.push('de-slopefield: isoclines must be a list of slopes');
  if (P.start && !(Array.isArray(P.start) && P.start.length === 2 && P.start.every(Number.isFinite))) problems.push('de-slopefield: start must be [t, y]');
  for (const s of P.seeds || []) {
    const [t, y] = Array.isArray(s) ? s : [s.t, s.y];
    tryParse(t, [], 'seed t'); tryParse(y, [], 'seed y');
    if (t === undefined || y === undefined) problems.push('de-slopefield: a seed needs t and y');
  }
  for (const c of P.curves || []) {
    if (!c.fn) problems.push('de-slopefield: a curve needs fn');
    tryParse(c.fn, ['t'], 'curve');
    for (const v of [...(c.domain || []), c.labelAt, c.when]) tryParse(v, [], 'curve option');
  }
  for (const p of P.points || []) { tryParse(p.x, [], 'point'); tryParse(p.y, [], 'point'); tryParse(p.when, [], 'point when'); }
  for (const l of P.hlines || []) { tryParse(l.y, [], 'hline'); tryParse(l.when, [], 'hline when'); }
  for (const l of P.vlines || []) { tryParse(l.x, [], 'vline'); tryParse(l.when, [], 'vline when'); }
  for (const r of P.readouts || []) tryParse(r.expr, ['t0', 'y0'], 'readout');
  // canvas labels are plain text: TeX would print literally
  for (const o of [...(P.curves || []), ...(P.points || []), ...(P.hlines || []), ...(P.vlines || []), ...(P.seeds || []).filter((s) => !Array.isArray(s)), { label: P.xlabel }, { label: P.ylabel }]) {
    const L = o && o.label;
    if (typeof L !== 'string') continue;
    const bad = /\$|\\[A-Za-z]|(?<![\w])[A-Za-zα-ωΑ-Ω]{1,2}[_^](?:\{|\(|[A-Za-z0-9α-ωΑ-Ω])|\)[_^]/.exec(L);
    if (bad) problems.push(`de-slopefield label “${L}”: “${bad[0]}” would print literally on the canvas — use Unicode (², ₀, θ) and plain words`);
  }
  return problems;
}

function fmtVal(v, r) {
  if (!Number.isFinite(v)) return '\\text{—}';
  const d = r.digits ?? 4;
  const a = Math.abs(v);
  const s = a !== 0 && (a >= 1e5 || a < 1e-3) ? `${v.toExponential(d - 1).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`)}` : String(+v.toPrecision(d));
  return r.unit ? `${s}\\,${r.unit}` : s;
}
