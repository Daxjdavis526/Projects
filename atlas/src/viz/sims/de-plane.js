// The phase plane of a planar system x′ = f(x, y), y′ = g(x, y) — or of a
// linear one, x′ = Ax — for reading a system's behaviour off one picture:
// direction arrows; trajectories traced both ways by RK4, with arrowheads in
// the direction of time; nullclines (x′ = 0 violet, y′ = 0 teal, both dashed);
// equilibria found numerically and typed by their Jacobian (filled green
// attracts, hollow red repels, orange saddle, hollow gold neutral); the real
// eigenvector lines of a linear system, labelled with their eigenvalues;
// level curves of a conserved quantity (one or more drawn bold in gold — a
// separatrix); a draggable start point whose trajectory is drawn bold and
// can be played as a moving dot, with x(t) and y(t) on a second panel (and a
// pendulum swinging beside them, when x is an angle); a shape carried along
// by the flow for a time t (e^{At} for a linear system, with its matrix read
// out); and a magnifier that zooms in on a point, so a nonlinear portrait can
// be seen turning into its linearization. In the Explore view a click adds a
// trajectory. Numerics in model/de-plane.js (test/de-plane.test.mjs).
//
//   { type: 'de-plane', params: {
//       fx: 'y', fy: '-sin(x) - b*y',     // x′ and y′: expressions of x, y and the slider/choice/constant keys
//       matrix: [[0, 1], [-4, 'c']],      // or a linear system x′ = Ax (entries: numbers or expressions of the keys)
//       x: [-3, 3], y: [-3, 3],           // the window
//       xlabel: 'x', ylabel: 'y',         // axis titles (plain text on the canvas: Unicode, no TeX)
//       equal: true, aspect: 'square',    // one unit the same length both ways; canvas shape ('square', 'wide', '')
//       sliders, choices, constants,      // as in graph
//       field: true, grid: 17,            // direction arrows (length means nothing) and how many across
//       nullclines: false,                // x′ = 0 and y′ = 0, dashed
//       equilibria: false,                // true marks them; 'label' adds each one's type in words
//       eigen: false,                     // matrix: the real eigenvector lines (straight-line solutions), labelled λ
//       levels: { fn: 'y^2/2 - cos(x)', values: [-0.5, 0, 0.5], highlight: [1] },   // or n: 9, or { from, to, step }
//       seeds: [[1, 0], { x: 0, y: 2, color: 'gold', dir: 'forward' }],   // trajectories (both ways unless dir)
//       seedColor: null,                  // one colour for every seed (a family), instead of a palette
//       T: 30,                            // how long each seed is traced each way
//       start: [1, 0],                    // a draggable start point; its forward trajectory is drawn bold (a point item's answer)
//       play: false,                      // a Play button: a dot runs along the start trajectory
//       series: false, tmax: 20,          // a second panel with x(t) and y(t) from the start point, 0 ≤ t ≤ tmax
//       seriesY: null, seriesNames: null, // that panel's y range and its two curve labels (default: the axis titles)
//       pendulum: false,                  // with series: a pendulum at angle x (radians from straight down) beside the graphs
//       flow: { t: 'tf', shape: 'square', at: [0, 0], size: 1 },   // a shape carried by the flow for time t (a key or a number)
//       zoom: { at: [0, 0], max: 30 },    // a magnifier slider centred on a point
//       curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.3], fn, color, width, dash, label, labelAt, when }],
//       points: [{ x, y, label, color, r, labelDx, labelDy, when }],
//       click: true,                      // a click adds a trajectory (Explore view only, never in a problem)
//       readout: true,                    // matrix: τ, Δ, τ² − 4Δ, the eigenvalues and the type; false hides them
//       readouts: [{ label, expr, digits }],   // expressions of the keys and x0, y0 (the start point)
//   } }
//
// A problem's picture must not show its answer: leave out the readout, the
// equilibrium labels or the start point the question asks about.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import { classify2, eig2, expm2, trajectory, at, equilibria, eqColor, rk4Step } from '../model/de-plane.js';
import { sampleGrid, contourSegments, joinSegments, levelsFrom, range } from '../model/c3-contour.js';

export const defaults = {
  fx: 'y', fy: '-x', matrix: null, x: [-3, 3], y: [-3, 3], xlabel: 'x', ylabel: 'y', equal: true, aspect: 'square',
  field: true, grid: 17, nullclines: false, equilibria: false, eigen: false, levels: null,
  seeds: [], seedColor: null, T: 30, start: null, play: false, rate: 1, series: false, tmax: 20, seriesY: null, seriesNames: null,
  pendulum: false, flow: null, zoom: null, curves: [], points: [], click: true, readout: true, readouts: null,
};

const SEED_COLORS = ['accent2', 'violet', 'teal', 'gold', 'good', 'warn', 'bad'];
const num = (v, d = 3) => {
  if (!Number.isFinite(v)) return '\\text{—}';
  if (Math.abs(v) < 5e-13) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(d - 1).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`);
  return String(+v.toPrecision(d));
};
const plain = (v, d = 3) => String(+(+v).toPrecision(d)).replace('-', '−');

function framed(plot, pts, o) {
  plot.ctx.save();
  plot._clip();
  plot.path(pts, o);
  plot.ctx.restore();
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const { canvas } = F.canvas({ aspect: P.aspect, label: P.alt || 'A phase portrait: direction arrows and trajectories' });
  const S2 = P.series ? F.canvas({ aspect: 'wide', label: P.pendulum ? 'A pendulum and its angle and angular velocity over time' : 'The two coordinates of the bold trajectory over time' }) : null;
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  if (P.zoom) F.slider({ key: 'zoom', label: P.zoom.label || 'Magnification', min: 1, max: P.zoom.max || 30, step: 0.1, value: P.zoom.value || 1, logScale: true, explain: P.zoom.explain || 'Zoom in on the marked point: close enough to an equilibrium, the portrait looks like that of its linearization.' });
  const keys = [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {}), ...(P.zoom ? ['zoom'] : [])];
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = F.params[k]; return e; };
  const ev = (src, E, extra = []) => (typeof src === 'number' ? src : fn(src, [...keys, ...extra])(E));
  const plot = new Plot(canvas, { x: P.x, y: P.y, equal: P.equal, xlabel: P.xlabel, ylabel: P.ylabel });
  const sp = S2 && new Plot(S2.canvas, { x: [0, P.tmax], y: P.seriesY || [-1, 1], xlabel: 't', ylabel: '', pad: { l: 46, r: 16, t: 14, b: 34 } });

  // the start point (draggable) and trajectories added by clicking
  const start = P.start ? { x: P.start[0], y: P.start[1] } : null;
  let dragged = false;
  if (start) {
    plot.handle(() => [start.x, start.y], (x, y) => {
      start.x = Math.max(plot.vx0, Math.min(plot.vx1, x));
      start.y = Math.max(plot.vy0, Math.min(plot.vy1, y));
    }, { hollow: true });
    plot.onDrag = () => { dragged = true; S.t = 0; draw(); F.notify('point'); };
  }
  const added = [];
  if (P.click && !F.compact) {
    canvas.addEventListener('pointerdown', () => { dragged = false; });
    canvas.addEventListener('click', (e) => {
      if (dragged) { dragged = false; return; }
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      if (px < plot.L || px > plot.R || py < plot.T || py > plot.B) return;
      if (start && Math.hypot(plot.X(start.x) - px, plot.Y(start.y) - py) < 18) return;
      added.push([plot.ix(px), plot.iy(py)]);
      if (added.length > 10) added.shift();
      cache.key = null;
      draw();
    });
    F.button({ label: 'Clear added trajectories', onClick: () => { added.length = 0; cache.key = null; draw(); } });
  }

  // Play: a dot running along the start trajectory
  const S = { t: 0, running: false, fwd: [] };
  let playBtn = null;
  if (P.play && start) {
    const anim = F.animate((dt) => {
      if (!S.running) return;
      S.t += dt * (P.rate || 1);
      const end = S.fwd.length ? S.fwd[S.fwd.length - 1].t : 0;
      if (S.t >= end) { S.t = end; S.running = false; if (playBtn) playBtn.textContent = 'Replay'; }
      draw();
    }, { force: true });
    playBtn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; playBtn.textContent = 'Play'; return; }
      const end = S.fwd.length ? S.fwd[S.fwd.length - 1].t : 0;
      if (S.t >= end - 1e-9) S.t = 0;
      S.running = true; playBtn.textContent = 'Pause'; anim.start();
    } });
  }
  F.onChange(() => { S.t = 0; cache.key = null; draw(); });

  const cache = { key: null };
  function system(E) {
    if (P.matrix) {
      const A = P.matrix.map((row) => row.map((s) => ev(s, E)));
      const [[a, b], [c, d]] = A;
      return { A, f: (x, y) => [a * x + b * y, c * x + d * y] };
    }
    const gx = fn(P.fx, ['x', 'y', ...keys]), gy = fn(P.fy, ['x', 'y', ...keys]);
    const e = { ...E };
    return { A: null, f: (x, y) => { e.x = x; e.y = y; return [gx(e), gy(e)]; } };
  }

  function view(E) {
    if (!P.zoom) return;
    const z = +E.zoom || 1, [cx, cy] = P.zoom.at || [0, 0];
    const hx = (P.x[1] - P.x[0]) / 2 / z, hy = (P.y[1] - P.y[0]) / 2 / z;
    plot.setView([cx - hx, cx + hx], [cy - hy, cy + hy]);
  }

  function draw() {
    const E = env();
    view(E);
    plot.clear();
    const { A, f } = system(E);
    const box = [[plot.vx0, plot.vx1], [plot.vy0, plot.vy1]];
    const shown = (o) => !o.when || ev(o.when, E);
    const key = JSON.stringify([E, box, plot.w, plot.h]);
    if (cache.key !== key) {
      cache.key = key;
      cache.levels = P.levels ? contourLines(P.levels, E) : [];
      cache.nulls = P.nullclines ? nullclines(f, box) : null;
      cache.eq = P.equilibria && !A ? equilibria(f, box) : [];
      const seeds = [...(P.seeds || []).map((s, i) => (Array.isArray(s) ? { x: s[0], y: s[1] } : { ...s })).map((s, i) => ({ color: P.seedColor || SEED_COLORS[i % SEED_COLORS.length], ...s })),
        ...added.map(([x, y], i) => ({ x, y, color: SEED_COLORS[(i + 3) % SEED_COLORS.length] }))];
      cache.seeds = seeds.map((s) => {
        const x0 = ev(s.x, E), y0 = ev(s.y, E), T = s.T ?? P.T;
        let pts, i0 = 0;
        if (s.dir === 'forward') pts = trajectory(f, x0, y0, { T, box });
        else if (s.dir === 'backward') { pts = trajectory(f, x0, y0, { T, box, dir: -1 }).reverse(); i0 = pts.length - 1; }
        else { const back = trajectory(f, x0, y0, { T, box, dir: -1 }); pts = [...back.reverse(), ...trajectory(f, x0, y0, { T, box }).slice(1)]; i0 = back.length - 1; }
        return { ...s, x0, y0, pts, i0 };
      });
    }

    // conserved-quantity level curves, then nullclines, then the direction field
    for (const L of cache.levels) framed(plot, L.pts, { color: L.hi ? 'gold' : 'ink3', width: L.hi ? 2.4 : 1.2, alpha: L.hi ? 1 : 0.8 });
    if (cache.nulls) {
      for (const pts of cache.nulls.x) framed(plot, pts, { color: 'violet', width: 2, dash: [7, 5] });
      for (const pts of cache.nulls.y) framed(plot, pts, { color: 'teal', width: 2, dash: [7, 5] });
    }
    if (P.field !== false) drawField(f);

    // a linear system's eigenvector lines and its line of equilibria
    let type = null;
    if (A) {
      const [[a, b], [c, d]] = A;
      type = classify2(a, b, c, d);
      if (P.eigen) {
        const e = eig2(a, b, c, d);
        if (Array.isArray(e.vectors)) e.vectors.forEach((v, k) => {
          const R = 3 * Math.hypot(plot.vx1 - plot.vx0, plot.vy1 - plot.vy0);
          plot.line(-R * v.dir[0], -R * v.dir[1], R * v.dir[0], R * v.dir[1], { color: 'gold', width: 1.8, dash: [8, 6] });
          const spot = edgeSpot(v.dir, k);
          if (spot) plot.text(`λ = ${plain(v.lambda)}`, spot[0], spot[1], { color: 'gold', weight: 650, size: 12, dx: 6, dy: k ? 12 : -12 });
        });
      }
      if (type.kind === 'line' || type.kind === 'zero') {
        // the null space of A: every point on it is an equilibrium
        const r1 = [a, b], r2 = [c, d], row = Math.hypot(...r1) >= Math.hypot(...r2) ? r1 : r2, n = Math.hypot(...row);
        if (n > 0) { const R = 3 * Math.hypot(plot.vx1 - plot.vx0, plot.vy1 - plot.vy0), u = [-row[1] / n, row[0] / n]; plot.line(-R * u[0], -R * u[1], R * u[0], R * u[1], { color: eqColor(type), width: 3 }); }
      }
    }

    if (P.flow) drawFlow(f, A, E);

    for (const c of P.curves || []) {
      if (!shown(c)) continue;
      const style = { color: c.color || 'gold', width: c.width || 2.2, dash: c.dash ? [6, 5] : [] };
      let lx = null, ly = null;
      if (c.param) {
        const fxp = fn(c.param[0], ['t', ...keys]), fyp = fn(c.param[1], ['t', ...keys]);
        plot.curve((t) => fxp({ ...E, t }), (t) => fyp({ ...E, t }), ev(c.t[0], E), ev(c.t[1], E), style);
        if (c.labelAt !== undefined) { const tt = ev(c.labelAt, E); lx = fxp({ ...E, t: tt }); ly = fyp({ ...E, t: tt }); }
      } else if (c.fn) {
        const g = fn(c.fn, ['x', ...keys]);
        plot.fn((x) => g({ ...E, x }), { ...style, domain: c.domain ? [ev(c.domain[0], E), ev(c.domain[1], E)] : undefined });
        if (c.labelAt !== undefined) { lx = ev(c.labelAt, E); ly = g({ ...E, x: lx }); }
      }
      if (c.label && lx !== null) plot.text(c.label, lx, ly, { color: style.color, dx: c.labelDx ?? 6, dy: c.labelDy ?? -12, weight: 650 });
    }

    for (const s of cache.seeds) {
      const pts = s.pts.map((p) => [p.x, p.y]);
      framed(plot, pts, { color: s.color, width: 2 });
      heads(pts, s.color, s.i0);
      plot.point(s.x0, s.y0, { color: s.color, r: 3.2, label: s.label, ldx: s.labelDx, ldy: s.labelDy });
    }

    // the start point's trajectory, forward in time
    if (start) {
      S.fwd = trajectory(f, start.x, start.y, { T: P.series ? P.tmax : P.T, box, dtMax: P.series ? Math.min(0.05, P.tmax / 600) : 0.05, maxSteps: 8000 });
      const pts = S.fwd.map((p) => [p.x, p.y]);
      framed(plot, pts, { color: 'accent', width: 3 });
      heads(pts, 'accent');
    }

    // equilibria
    if (A && type && type.kind !== 'line' && type.kind !== 'zero') marker(0, 0, type, P.equilibria === 'label');
    for (const e of cache.eq) marker(e.x, e.y, e.type, P.equilibria === 'label');

    for (const p of P.points || []) {
      if (!shown(p)) continue;
      plot.point(ev(p.x, E), ev(p.y, E), { color: p.color || 'accent2', label: p.label, r: p.r, ldx: p.labelDx, ldy: p.labelDy });
    }
    if (P.zoom) plot.point(...(P.zoom.at || [0, 0]), { color: 'ink2', r: 2.5 });

    // the moving dot
    const now = start && P.play && S.fwd.length ? at(S.fwd, S.t) : null;
    if (now) plot.point(now.x, now.y, { color: 'gold', r: 6, ring: 'ink' });
    plot.drawHandles();
    if (sp) drawSeries(now);

    // readouts
    const rows = [];
    if (A && P.readout !== false) {
      const [[a, b], [c, d]] = A, e = eig2(a, b, c, d);
      const lam = e.values[0].im === 0
        ? (Math.abs(e.values[0].re - e.values[1].re) < 1e-9 ? `${num(e.values[0].re)}\\ (\\text{twice})` : `${num(e.values[0].re)},\\ ${num(e.values[1].re)}`)
        : `${num(e.values[0].re)} \\pm ${num(e.values[0].im)}i`;
      rows.push(['trace $\\tau$', num(e.tr)], ['determinant $\\Delta$', num(e.det)], ['$\\tau^2 - 4\\Delta$', num(e.disc)], ['eigenvalues $\\lambda$', lam], ['type', `\\text{${type.name}}`]);
    }
    if (P.flow && A && P.readout !== false) {
      const t = ev(P.flow.t, E), [[a, b], [c, d]] = A, X = expm2(a, b, c, d, t);
      rows.push(['$e^{At}$', `\\begin{bmatrix} ${num(X[0][0])} & ${num(X[0][1])} \\\\ ${num(X[1][0])} & ${num(X[1][1])} \\end{bmatrix}`], ['$\\det e^{At} = e^{\\tau t}$', num(X[0][0] * X[1][1] - X[0][1] * X[1][0])]);
    }
    if (P.readouts) {
      const extra = start ? { x0: start.x, y0: start.y } : { x0: 0, y0: 0 };
      for (const r of P.readouts) rows.push([r.label, num(ev(r.expr, { ...E, ...extra }, ['x0', 'y0']), r.digits ?? 4)]);
    }
    if (rows.length) F.readout(rows);
  }

  // direction arrows: all the same length, so they show direction only
  function drawField(f) {
    if (P.field === false) return;
    const n = P.grid || 17, g = plot.ctx;
    const pxW = plot.R - plot.L, pxH = plot.B - plot.T, cell = Math.max(pxW, pxH) / n;
    const nx = Math.max(2, Math.round(pxW / cell)), ny = Math.max(2, Math.round(pxH / cell));
    const len = cell * 0.62;
    g.save();
    g.strokeStyle = plot.col.ink4; g.fillStyle = plot.col.ink4; g.lineWidth = 1.15; g.lineCap = 'round';
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const x = plot.vx0 + ((i + 0.5) * (plot.vx1 - plot.vx0)) / nx, y = plot.vy0 + ((j + 0.5) * (plot.vy1 - plot.vy0)) / ny;
      const [u, v] = f(x, y);
      // the direction on screen: world (u, v) scaled by pixels per unit (y flips)
      const ex = u * (pxW / (plot.vx1 - plot.vx0)), ey = -v * (pxH / (plot.vy1 - plot.vy0)), el = Math.hypot(ex, ey);
      if (!(el > 0) || !Number.isFinite(el)) continue;
      const ux = ex / el, uy = ey / el, cx = plot.X(x), cy = plot.Y(y);
      const x0 = cx - (ux * len) / 2, y0 = cy - (uy * len) / 2, x1 = cx + (ux * len) / 2, y1 = cy + (uy * len) / 2;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - ux * 3, y1 - uy * 3); g.stroke();
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - ux * 5 - uy * 2.6, y1 - uy * 5 + ux * 2.6); g.lineTo(x1 - ux * 5 + uy * 2.6, y1 - uy * 5 - ux * 2.6); g.closePath(); g.fill();
    }
    g.restore();
  }

  // arrowheads on a trajectory, pointing forward in time: three after its
  // start point (index i0) and two before it, at fixed distances on screen —
  // so a closed orbit traced round many times still gets only five
  function heads(pts, color, i0 = 0) {
    const g = plot.ctx;
    g.save(); plot._clip();
    g.fillStyle = plot.color(color);
    const put = (k, from) => {
      const ax = plot.X(pts[from][0]), ay = plot.Y(pts[from][1]), bx = plot.X(pts[k][0]), by = plot.Y(pts[k][1]);
      const d = Math.hypot(bx - ax, by - ay);
      if (!(d > 0) || !Number.isFinite(d)) return;
      const ux = (bx - ax) / d, uy = (by - ay) / d, s = 7;
      g.beginPath(); g.moveTo(bx + ux * s * 0.5, by + uy * s * 0.5);
      g.lineTo(bx - ux * s - uy * s * 0.55, by - uy * s + ux * s * 0.55);
      g.lineTo(bx - ux * s + uy * s * 0.55, by - uy * s - ux * s * 0.55);
      g.closePath(); g.fill();
    };
    const walk = (step, marks) => {
      let acc = 0, m = 0;
      for (let k = i0 + step; k >= 0 && k < pts.length && m < marks.length; k += step) {
        const p = pts[k - step], q = pts[k];
        const d = Math.hypot(plot.X(q[0]) - plot.X(p[0]), plot.Y(q[1]) - plot.Y(p[1]));
        if (!Number.isFinite(d)) break;
        acc += d;
        if (acc >= marks[m]) { if (step > 0) put(k, k - 1); else put(k + 1, k); m++; }
      }
    };
    walk(1, [55, 175, 295]);
    walk(-1, [75, 195]);
    g.restore();
  }

  function marker(x, y, type, label) {
    if (x < plot.vx0 || x > plot.vx1 || y < plot.vy0 || y > plot.vy1) return;
    const g = plot.ctx, col = plot.color(eqColor(type)), px = plot.X(x), py = plot.Y(y);
    const filled = type.stability === 'stable' || type.kind === 'saddle';
    g.save();
    g.lineWidth = 2.4; g.strokeStyle = col; g.fillStyle = filled ? col : plot.col.panel;
    g.beginPath(); g.arc(px, py, 6, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
    if (label) plot.text(type.name, x, y, { color: eqColor(type), dx: 10, dy: -12, size: 11.5, weight: 650 });
  }

  // a place near the frame's edge on an eigenvector line, for its label: the
  // first line labelled in the upper half of the window, the second in the lower
  function edgeSpot(dir, k) {
    const up = dir[1] > 1e-9 || (Math.abs(dir[1]) <= 1e-9 && dir[0] > 0);
    const sgn = (up ? 1 : -1) * (k ? -1 : 1), d = [sgn * dir[0], sgn * dir[1]];
    let s = Infinity;
    if (Math.abs(d[0]) > 1e-9) s = Math.min(s, (d[0] > 0 ? plot.vx1 : plot.vx0) / d[0]);
    if (Math.abs(d[1]) > 1e-9) s = Math.min(s, (d[1] > 0 ? plot.vy1 : plot.vy0) / d[1]);
    if (!(s > 0) || !Number.isFinite(s)) return null;
    return [0.8 * s * d[0], 0.8 * s * d[1]];
  }

  function contourLines(spec, E) {
    const h = fn(spec.fn, ['x', 'y', ...keys]), e = { ...E };
    const grid = sampleGrid((x, y) => { e.x = x; e.y = y; return h(e); }, [plot.vx0, plot.vx1], [plot.vy0, plot.vy1], 170, 170);
    const [lo, hi] = range(grid);
    const vals = levelsFrom(spec.values ?? spec.n ?? spec, lo, hi);
    const his = (spec.highlight || []).map((v) => ev(v, E));
    const out = [];
    for (const c of vals) for (const pts of joinSegments(contourSegments(grid, c))) out.push({ pts, hi: false });
    for (const c of his) for (const pts of joinSegments(contourSegments(grid, c))) out.push({ pts, hi: true });
    return out;
  }

  function nullclines(f, box) {
    const [[xa, xb], [ya, yb]] = box;
    const gx = sampleGrid((x, y) => f(x, y)[0], [xa, xb], [ya, yb], 150, 150);
    const gy = sampleGrid((x, y) => f(x, y)[1], [xa, xb], [ya, yb], 150, 150);
    return { x: joinSegments(contourSegments(gx, 0)), y: joinSegments(contourSegments(gy, 0)) };
  }

  // a shape carried along by the flow for time t: exactly e^{At} for a linear system, RK4 otherwise
  function drawFlow(f, A, E) {
    const t = ev(P.flow.t, E), shape = P.flow.shape || 'square', [cx, cy] = P.flow.at || [0, 0], s = P.flow.size ?? 1;
    let base;
    if (shape === 'disc') base = Array.from({ length: 121 }, (_, k) => [cx + s * Math.cos((2 * Math.PI * k) / 120), cy + s * Math.sin((2 * Math.PI * k) / 120)]);
    else {
      const sq = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]], out = [];
      for (let k = 0; k < 4; k++) for (let j = 0; j < 30; j++) { const u = j / 30, p = sq[k], q = sq[k + 1]; out.push([cx + s * (p[0] + (q[0] - p[0]) * u), cy + s * (p[1] + (q[1] - p[1]) * u)]); }
      out.push(out[0]); base = out;
    }
    let move;
    if (A) { const X = expm2(A[0][0], A[0][1], A[1][0], A[1][1], t); move = ([x, y]) => [X[0][0] * x + X[0][1] * y, X[1][0] * x + X[1][1] * y]; }
    else {
      const n = Math.max(20, Math.ceil(Math.abs(t) / 0.02)), h = t / n;
      move = ([x, y]) => { let z = [x, y]; for (let i = 0; i < n; i++) z = rk4Step(f, z[0], z[1], h); return z; };
    }
    plot.path(base, { close: true, color: 'ink3', width: 1.2, dash: [4, 4], fill: 'ink3', fillAlpha: 0.08 });
    const img = base.map(move);
    framed(plot, img, { close: true, color: 'gold', width: 2, fill: 'gold', fillAlpha: 0.22 });
    if (A && shape === 'square' && cx === 0 && cy === 0) {
      const e1 = move([s, 0]), e2 = move([0, s]);
      plot.arrow(0, 0, e1[0], e1[1], { color: 'accent', width: 2.4, label: 'eᴬᵗe₁', ldx: 6, ldy: -10 });
      plot.arrow(0, 0, e2[0], e2[1], { color: 'violet', width: 2.4, label: 'eᴬᵗe₂', ldx: 6, ldy: -10 });
    }
  }

  function drawSeries(now) {
    const pts = S.fwd;
    const pend = !!P.pendulum;
    const H = S2.canvas.clientHeight || 300;
    sp.o.pad = { l: pend ? Math.round(H * 0.95) + 46 : 46, r: 16, t: 14, b: 34 };
    let lo = Infinity, hi = -Infinity;
    for (const p of pts) { lo = Math.min(lo, p.x, p.y); hi = Math.max(hi, p.x, p.y); }
    if (!Number.isFinite(lo)) { lo = -1; hi = 1; }
    const padY = 0.08 * (hi - lo || 1);
    sp.setView([0, P.tmax], P.seriesY || [lo - padY, hi + padY]);
    sp.clear();
    const names = P.seriesNames || [P.xlabel, P.ylabel];
    sp.path(pts.map((p) => [p.t, p.x]), { color: 'accent', width: 2.4 });
    sp.path(pts.map((p) => [p.t, p.y]), { color: 'violet', width: 2 });
    sp.ctx.font = '650 12.5px Inter, system-ui, sans-serif';
    const w1 = sp.ctx.measureText(names[1]).width;
    sp.text(names[1], sp.vx1, sp.vy1, { dx: -8, dy: 10, color: 'violet', weight: 650, align: 'right' });
    sp.text(names[0], sp.vx1, sp.vy1, { dx: -22 - w1, dy: 10, color: 'accent', weight: 650, align: 'right' });
    if (now && P.play) { sp.line(now.t, sp.vy0, now.t, sp.vy1, { color: 'gold', width: 1.4, dash: [4, 4] }); sp.point(now.t, now.x, { color: 'gold', r: 4 }); }
    if (pend) {
      const g = sp.ctx, cx = H * 0.5 + 6, cy = H * 0.47, R = H * 0.34, th = now ? now.x : (start ? start.x : 0);
      g.save();
      g.strokeStyle = sp.col.line3; g.setLineDash([3, 4]); g.lineWidth = 1;
      g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
      g.setLineDash([]);
      const bx = cx + R * Math.sin(th), by = cy + R * Math.cos(th);
      g.strokeStyle = sp.col.ink2; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(bx, by); g.stroke();
      g.fillStyle = sp.col.ink; g.beginPath(); g.arc(cx, cy, 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = sp.col.gold; g.beginPath(); g.arc(bx, by, 10, 0, Math.PI * 2); g.fill();
      g.restore();
    }
  }

  F.draw(draw);
  if (P.caption) F.caption(P.caption);
  else F.caption('Arrows show direction only. Trajectories are traced numerically (RK4), forward and backward in time from the marked points; arrowheads point forward in time.');
  return { get: (k) => ((k === 'start' || k === 'point') && start ? { x: start.x, y: start.y } : F.params[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {}), ...(P.zoom ? ['zoom'] : [])];
  const tryParse = (src, vars, where) => {
    if (typeof src === 'number' || src === undefined || src === null) return;
    try { fn(src, [...vars, ...keys]); } catch (e) { problems.push(`de-plane ${where}: “${src}” — ${e.message}`); }
  };
  const range2 = (r, w) => { if (!Array.isArray(r) || r.length !== 2 || !(r[0] < r[1])) problems.push(`de-plane: ${w} must be [min, max] with min < max`); };
  range2(P.x, 'x'); range2(P.y, 'y');
  if (P.matrix) {
    if (!(Array.isArray(P.matrix) && P.matrix.length === 2 && P.matrix.every((r) => Array.isArray(r) && r.length === 2))) problems.push('de-plane: matrix must be [[a, b], [c, d]]');
    else for (const r of P.matrix) for (const s of r) tryParse(s, [], 'matrix entry');
  } else { tryParse(P.fx, ['x', 'y'], 'fx'); tryParse(P.fy, ['x', 'y'], 'fy'); }
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`slider ${s.key} needs a label`);
    if (!s.explain) problems.push(`slider ${s.key} needs an explain line`);
  }
  if (P.levels) {
    if (!P.levels.fn) problems.push('de-plane: levels needs fn');
    tryParse(P.levels.fn, ['x', 'y'], 'levels fn');
    for (const v of P.levels.highlight || []) tryParse(v, [], 'levels highlight');
  }
  for (const s of P.seeds || []) {
    const [x, y] = Array.isArray(s) ? s : [s.x, s.y];
    if (x === undefined || y === undefined) problems.push('de-plane: a seed needs x and y');
    tryParse(x, [], 'seed x'); tryParse(y, [], 'seed y');
    if (!Array.isArray(s) && s.dir && !['both', 'forward', 'backward'].includes(s.dir)) problems.push(`de-plane: seed dir “${s.dir}” — use both, forward or backward`);
  }
  if (P.start && !(Array.isArray(P.start) && P.start.length === 2 && P.start.every(Number.isFinite))) problems.push('de-plane: start must be [x, y] (numbers)');
  if ((P.play || P.series) && !P.start) problems.push('de-plane: play and series need a start point');
  if (P.pendulum && !P.series) problems.push('de-plane: pendulum is drawn on the series panel — set series: true');
  if (P.flow) {
    tryParse(P.flow.t, [], 'flow t');
    if (P.flow.shape && !['square', 'disc'].includes(P.flow.shape)) problems.push('de-plane: flow shape must be square or disc');
  }
  if (P.zoom && !(Array.isArray(P.zoom.at) && P.zoom.at.length === 2 && P.zoom.at.every(Number.isFinite))) problems.push('de-plane: zoom.at must be [x, y]');
  if (!(Number.isInteger(P.grid) && P.grid >= 5 && P.grid <= 40)) problems.push('de-plane: grid must be a whole number from 5 to 40');
  for (const c of P.curves || []) {
    if (!c.param && !c.fn) problems.push('de-plane: a curve needs param or fn');
    if (c.param) { tryParse(c.param[0], ['t'], 'curve x'); tryParse(c.param[1], ['t'], 'curve y'); for (const v of c.t || []) tryParse(v, [], 'curve t'); if (!c.t) problems.push('de-plane: a param curve needs t: [from, to]'); }
    if (c.fn) tryParse(c.fn, ['x'], 'curve fn');
    tryParse(c.when, [], 'curve when'); tryParse(c.labelAt, [], 'curve labelAt');
  }
  for (const p of P.points || []) { tryParse(p.x, [], 'point'); tryParse(p.y, [], 'point'); tryParse(p.when, [], 'point when'); }
  for (const r of P.readouts || []) tryParse(r.expr, ['x0', 'y0'], 'readout');
  // canvas labels are plain text: TeX would print literally
  for (const o of [...(P.curves || []), ...(P.points || []), ...(P.seeds || []).filter((s) => !Array.isArray(s)), { label: P.xlabel }, { label: P.ylabel }, ...(P.seriesNames || []).map((label) => ({ label }))]) {
    const L = o && o.label;
    if (typeof L !== 'string') continue;
    const bad = /\$|\\[A-Za-z]|(?<![\w])[A-Za-zα-ωΑ-Ω]{1,2}[_^](?:\{|\(|[A-Za-z0-9α-ωΑ-Ω])|\)[_^]/.exec(L);
    if (bad) problems.push(`de-plane label “${L}”: “${bad[0]}” would print literally on the canvas — use Unicode (², ₀, θ) and plain words`);
  }
  return problems;
}
