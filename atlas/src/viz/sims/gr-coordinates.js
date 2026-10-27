// The same flat plane labelled with different coordinates. Physics in
// model/gr-coords.js.
//
//   mode 'measure' — a circle, a straight segment or nothing (shape: 'none') on the plane, with a
//     polar or skewed grid over it; the right panel is the coordinate chart,
//     where the same curve looks quite different. The readout measures its
//     length with each grid’s metric (they agree) and naively, adding up
//     coordinate differences as if they were distances (which does not).
//     Optional `step: { r, theta, dr, dtheta }` (degrees) draws the polar
//     line element: the small triangle with legs dr and r dθ.
//   mode 'field' — a constant field of arrows on a polar grid. Its polar
//     components change from point A to point B although the arrows do not;
//     optionally, the arrow you get at B by copying A’s components.
//   mode 'basis' — the polar grid’s own arrows at a point P: r̂ turns as you
//     go around, and the step for a fixed Δθ grows as you go out.
//
//   { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', shape: 'circle', centre: [2, 1], radius: 1.5 } }
//   readout: false hides the lengths (so a question’s picture does not print its answer).

import { Plot } from '../plot.js';
import { toPolar, fromPolar, fromSkew, toSkew, circle, segment, lengths, polarComponents, polarBasis, dAngle } from '../model/gr-coords.js';

export const defaults = {
  mode: 'measure', grid: 'polar', gridChoice: true, shape: 'circle', shapeChoice: true, centre: [2, 1], radius: 1.5, ends: [[-3, -1], [3, 2]],
  skew: 60, step: null, range: 5, alpha: 0, a: [3, 0.5], b: [-1, 3], naive: false, p: [2.5, 1.5], readout: true, radiusSlider: null,
};

const DEG = Math.PI / 180;

export function mount(F, P) {
  if (P.mode === 'field') return mountField(F, P);
  if (P.mode === 'basis') return mountBasis(F, P);
  return mountMeasure(F, P);
}

// ── drawing helpers shared by the modes ──────────────────────────────────────
const gridStep = (R) => Math.max(1, Math.round(R / 5));   // keep about ten grid lines across, whatever the zoom
function polarGrid(pl, R, o = {}) {
  const rmax = Math.ceil(R * Math.SQRT2), st = gridStep(R);
  for (let r = st; r <= rmax; r += st) pl.circle(0, 0, r, { color: o.color || 'accent2', width: 1, alpha: o.alpha ?? 0.45 });
  for (let k = 0; k < 12; k++) { const a = k * 30 * DEG; pl.line(0, 0, rmax * Math.cos(a), rmax * Math.sin(a), { color: o.color || 'accent2', width: 1, alpha: o.alpha ?? 0.45 }); }
}
function cartGrid(pl, R, o = {}) {
  const st = gridStep(R);
  for (let k = -Math.ceil(R * 1.6 / st) * st; k <= Math.ceil(R * 1.6); k += st) {
    pl.line(k, -R * 1.6, k, R * 1.6, { color: o.color || 'ink4', width: 1, alpha: o.alpha ?? 0.35 });
    pl.line(-R * 1.6, k, R * 1.6, k, { color: o.color || 'ink4', width: 1, alpha: o.alpha ?? 0.35 });
  }
}
function skewGrid(pl, R, alpha, o = {}) {
  const st = gridStep(R), n = Math.ceil((R * 2.2) / st) * st;
  for (let k = -n; k <= n; k += st) {
    const [x0, y0] = fromSkew(-n * 2, k, alpha), [x1, y1] = fromSkew(n * 2, k, alpha);
    pl.line(x0, y0, x1, y1, { color: o.color || 'accent2', width: 1, alpha: o.alpha ?? 0.45 });
    const [x2, y2] = fromSkew(k, -n * 2, alpha), [x3, y3] = fromSkew(k, n * 2, alpha);
    pl.line(x2, y2, x3, y3, { color: o.color || 'accent2', width: 1, alpha: o.alpha ?? 0.45 });
  }
}
const fmt3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : '\\text{—}');
const fmtDeg = (rad) => `${(rad / DEG).toFixed(1)}^\\circ`;

// ── measure: lengths in two coordinate systems ───────────────────────────────
function mountMeasure(F, P) {
  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'A curve on a flat plane, its coordinate grid, and the same curve drawn in the coordinate chart' });
  const R = P.range;
  if (P.gridChoice !== false) F.choice({ key: 'grid', label: 'Coordinates', options: [['polar', 'Polar (r, θ)'], ['skew', `Skewed axes (${P.skew}°)`], ['cart', 'Cartesian (x, y)']], value: P.grid, explain: 'The same plane and the same curve — only the labels change.' });
  else F.params.grid = P.grid;
  if (P.shapeChoice !== false) F.choice({ key: 'shape', label: 'Curve', options: [['circle', 'Circle'], ['segment', 'Straight segment']], value: P.shape, explain: 'Drag the handles on the plane to move it.' });
  else F.params.shape = P.shape;
  if (P.radiusSlider ?? P.shapeChoice !== false) F.slider({ key: 'radius', label: 'Circle radius', min: 0.3, max: 4, step: 0.05, value: P.radius, explain: 'Its true circumference is $2\\pi \\times$ radius, whatever the coordinates.' });
  else F.params.radius = P.radius;
  const alpha = P.skew * DEG;
  const c = { x: P.centre[0], y: P.centre[1] };
  const e = P.ends.map(([x, y]) => ({ x, y }));
  const plane = new Plot(canvas, { x: [-R, R], y: [-R, R], equal: true, grid: false, axes: false });
  const chart = new Plot(canvas, { x: [-180, 180], y: [0, R * 1.5], grid: true, axes: true });
  const clampR = (v) => Math.max(-R, Math.min(R, v));
  plane.handle(() => (F.params.shape === 'circle' ? [c.x, c.y] : [e[0].x, e[0].y]), (x, y) => { if (F.params.shape === 'circle') { c.x = clampR(x); c.y = clampR(y); } else { e[0].x = clampR(x); e[0].y = clampR(y); } });
  plane.handle(() => (F.params.shape === 'circle' ? [NaN, NaN] : [e[1].x, e[1].y]), (x, y) => { e[1].x = clampR(x); e[1].y = clampR(y); });
  plane.onDrag = () => draw();
  F.onChange(() => draw());

  function draw() {
    const ctx = canvas.getContext('2d');
    const W = canvas.clientWidth || 600;
    const small = W < 560;
    // side by side on wide screens; stacked (plane above, chart below) on narrow ones
    const want = small ? '10 / 13' : '';
    if (box.style.aspectRatio !== want) box.style.aspectRatio = want;
    const H = canvas.clientHeight || W / 2;
    if (small) {
      plane.o.pad = { l: 6, r: 6, t: 6, b: H * 0.5 + 4 };
      chart.o.pad = { l: 34, r: 10, t: H * 0.5 + 18, b: 30 };
    } else {
      plane.o.pad = { l: 6, r: W / 2 + 6, t: 6, b: 6 };
      chart.o.pad = { l: W / 2 + 40, r: 10, t: 14, b: 34 };
    }
    chart.o.xticks = small ? 5 : 8;
    chart.o.yticks = small ? 4 : 6;
    const grid = F.params.grid, shape = F.params.shape;
    // (y labels are drawn by hand: Plot puts short ones at the canvas’s left edge, which is the other panel)
    let ylab;
    if (grid === 'polar' && P.step && shape === 'none') { const st = P.step; chart.setView([st.theta - 2.5 * st.dtheta, st.theta + 3.5 * st.dtheta], [Math.max(0, st.r - 1.5 * st.dr), st.r + 2.5 * st.dr]); chart.o.xlabel = 'θ (degrees)'; ylab = 'r'; }
    else if (grid === 'polar') { chart.setView([-190, 190], [0, R * 1.5]); chart.o.xlabel = 'θ (degrees)'; ylab = 'r'; }
    else if (grid === 'skew') { chart.setView([-R * 1.3, R * 1.3], [-R * 1.3, R * 1.3]); chart.o.xlabel = 'u'; ylab = 'v'; }
    else { chart.setView([-R, R], [-R, R]); chart.o.xlabel = 'x'; ylab = 'y'; }
    chart.o.ylabel = '';
    plane.resize(); chart.resize(); plane.refreshTheme(); chart.refreshTheme();
    ctx.clearRect(0, 0, plane.w, plane.h);
    // left: the plane
    ctx.save(); ctx.beginPath(); ctx.rect(plane.L, plane.T, plane.R - plane.L, plane.B - plane.T); ctx.clip();
    cartGrid(plane, R, { alpha: grid === 'cart' ? 0.9 : 0.3, color: grid === 'cart' ? 'accent2' : 'ink4' });
    if (grid === 'polar') polarGrid(plane, R);
    if (grid === 'skew') skewGrid(plane, R, alpha);
    plane.point(0, 0, { color: 'ink2', r: 3.5 });
    const pts = shape === 'circle' ? circle(c.x, c.y, F.params.radius, 720) : shape === 'segment' ? segment([e[0].x, e[0].y], [e[1].x, e[1].y], 400) : [];
    if (pts.length) plane.path(pts, { color: 'gold', width: 2.6 });
    if (P.step) drawStep(plane, P.step);
    if (pts.length) plane.drawHandles();
    ctx.restore();
    plane.text('the plane', plane.L + 6, plane.T + 12, { screen: true, color: 'ink2', size: small ? 10.5 : 12 });
    // divider
    ctx.save(); ctx.strokeStyle = plane.col.line2; ctx.beginPath();
    if (small) { ctx.moveTo(6, H * 0.5); ctx.lineTo(W - 6, H * 0.5); } else { ctx.moveTo(W / 2, 6); ctx.lineTo(W / 2, plane.h - 6); }
    ctx.stroke(); ctx.restore();
    // right: the chart
    chart.grid(); chart.axes();
    chart.text(ylab, chart.L - (small ? 24 : 30), chart.T + 2, { screen: true, color: 'ink2', size: 12, halo: false });
    ctx.save(); ctx.beginPath(); ctx.rect(chart.L, chart.T, chart.R - chart.L, chart.B - chart.T); ctx.clip();
    const mapped = pts.map(([x, y]) => {
      if (grid === 'polar') { const [r, th] = toPolar(x, y); return [th / DEG, r]; }
      if (grid === 'skew') return toSkew(x, y, alpha);
      return [x, y];
    });
    // break the chart curve where θ jumps across ±180°
    const segs = [[]];
    for (let k = 0; k < mapped.length; k++) {
      if (k && grid === 'polar' && Math.abs(mapped[k][0] - mapped[k - 1][0]) > 170) segs.push([]);
      segs[segs.length - 1].push(mapped[k]);
    }
    for (const s of segs) chart.path(s, { color: 'gold', width: 2.6 });
    if (P.step && grid === 'polar') drawChartStep(chart, P.step);
    if (grid === 'polar' && chart.vy0 <= 0) {
      chart.line(-180, 0, 180, 0, { color: 'bad', width: 3, alpha: 0.7 });
      chart.line(-180, 0, -180, R * 1.5, { color: 'ink3', width: 1, dash: [3, 4] });
      chart.line(180, 0, 180, R * 1.5, { color: 'ink3', width: 1, dash: [3, 4] });
      chart.text('this whole edge is one point: r = 0', chart.L + 6, chart.Y(0) - 10, { screen: true, color: 'bad', size: small ? 10 : 11.5 });
    }
    ctx.restore();
    chart.text(grid === 'cart' ? 'the chart (x, y)' : grid === 'polar' ? 'the chart: θ across, r up' : 'the chart: u across, v up', chart.L + 6, chart.T + 10, { screen: true, color: 'ink2', size: small ? 10.5 : 12 });
    // readout
    if (!pts.length || P.readout === false) return;
    const L = lengths(pts, alpha);
    const rows = [['length with Pythagoras in $x, y$', fmt3(L.cart)]];
    if (grid === 'polar') rows.push(['with $ds^2 = dr^2 + r^2\\,d\\theta^2$', fmt3(L.polar)], ['adding $\\sqrt{dr^2 + d\\theta^2}$ (not a length)', fmt3(L.naivePolar)]);
    if (grid === 'skew') rows.push([`with $ds^2 = du^2 + dv^2 + 2\\cos ${P.skew}^\\circ\\,du\\,dv$`, fmt3(L.skew)], ['adding $\\sqrt{du^2 + dv^2}$ (not a length)', fmt3(L.naiveSkew)]);
    if (shape === 'circle') rows.push(['$2\\pi \\times \\text{radius}$', fmt3(2 * Math.PI * F.params.radius)]);
    if (grid === 'polar' && shape === 'circle') rows.push(['goes around the origin', Math.abs(L.winding) > Math.PI ? '\\text{yes}' : '\\text{no}']);
    F.readout(rows);
  }
  function drawChartStep(ch, s) {
    const t0 = s.theta, t1 = s.theta + s.dtheta, r0 = s.r, r1 = s.r + s.dr;
    ch.line(t0, r0, t0, r1, { color: 'accent', width: 3 });
    ch.line(t0, r1, t1, r1, { color: 'violet', width: 3 });
    ch.line(t0, r0, t1, r1, { color: 'bad', width: 2.4, dash: [5, 4] });
    ch.text('dr', t0, (r0 + r1) / 2, { color: 'accent', dx: -22, weight: 700 });
    ch.text('dθ', (t0 + t1) / 2, r1, { color: 'violet', dy: -12, weight: 700, align: 'center' });
    ch.text('√(dr² + dθ²): not ds', t1, (r0 + r1) / 2, { color: 'bad', dx: 8, dy: 8, size: 11 });
  }
  function drawStep(pl, s) {
    const th = s.theta * DEG, dth = s.dtheta * DEG;
    const p0 = fromPolar(s.r, th), corner = fromPolar(s.r + s.dr, th), q = fromPolar(s.r + s.dr, th + dth);
    pl.line(0, 0, ...fromPolar(s.r + s.dr + 0.6, th), { color: 'ink3', width: 1, dash: [4, 4] });
    pl.line(0, 0, ...fromPolar(s.r + s.dr + 0.6, th + dth), { color: 'ink3', width: 1, dash: [4, 4] });
    pl.line(...p0, ...corner, { color: 'accent', width: 3 });
    pl.curve((u) => (s.r + s.dr) * Math.cos(th + u * dth), (u) => (s.r + s.dr) * Math.sin(th + u * dth), 0, 1, { color: 'violet', width: 3 });
    pl.line(...p0, ...q, { color: 'good', width: 3 });
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    pl.text('dr', ...mid(p0, corner), { color: 'accent', dx: 6, dy: 10, weight: 700 });
    pl.text('r dθ', ...mid(corner, q), { color: 'violet', dx: 8, dy: 0, weight: 700 });
    pl.text('ds', ...mid(p0, q), { color: 'good', dx: -24, dy: -4, weight: 700 });
    pl.point(...p0, { color: 'ink', r: 3.5 });
  }
  F.draw(draw);
  F.caption(P.caption || 'The plane itself, with the chosen coordinate grid drawn over it, and the coordinate chart, where every grid line becomes a straight line. Drag the circle’s centre (or the segment’s ends). Lengths are in grid units; the curve is sampled finely, so the sums agree to three decimals.');
  return { get: (k) => F.params[k] };
}

// ── field: a constant arrow field and its changing polar components ─────────
function mountField(F, P) {
  const { canvas } = F.canvas({ aspect: '', label: P.alt || 'A field of identical arrows on a polar grid, with two points A and B' });
  const R = P.range;
  F.slider({ key: 'alpha', label: 'Direction of every arrow', min: -180, max: 180, step: 5, value: P.alpha, unit: '^\\circ', explain: 'Measured anticlockwise from east. Every arrow in the field is the same.' });
  F.toggle({ key: 'naive', label: 'At B, copy A’s components', value: P.naive, explain: 'Red dashed: the arrow with the same $(V_r, V_\\theta)$ as at A — not the same arrow.' });
  const pts = [{ x: P.a[0], y: P.a[1], name: 'A' }, { x: P.b[0], y: P.b[1], name: 'B' }];
  const plot = new Plot(canvas, { x: [-R, R], y: [-R, R], equal: true, grid: false, axes: false });
  for (const p of pts) plot.handle(() => [p.x, p.y], (x, y) => { const r = Math.hypot(x, y); const k = r < 0.4 ? 0.4 / (r || 1) : 1; p.x = Math.max(-R, Math.min(R, x * k)); p.y = Math.max(-R, Math.min(R, y * k)); });
  plot.onDrag = () => draw();
  F.onChange(() => draw());
  function draw() {
    plot.clear();
    const ctx = canvas.getContext('2d');
    ctx.save(); ctx.beginPath(); ctx.rect(plot.L, plot.T, plot.R - plot.L, plot.B - plot.T); ctx.clip();
    cartGrid(plot, R, { alpha: 0.25 });
    polarGrid(plot, R, { alpha: 0.35 });
    const a = F.params.alpha * DEG, ux = Math.cos(a), uy = Math.sin(a);
    for (let x = -Math.floor(plot.vx1); x <= plot.vx1; x++) for (let y = -Math.floor(plot.vy1); y <= plot.vy1; y++) {
      if (pts.some((p) => Math.hypot(p.x - x, p.y - y) < 0.9)) continue;
      plot.arrow(x - 0.3 * ux, y - 0.3 * uy, x + 0.3 * ux, y + 0.3 * uy, { color: 'ink3', width: 1.4, head: 6 });
    }
    plot.point(0, 0, { color: 'ink2', r: 3 });
    const comp = pts.map((p) => { const [, th] = toPolar(p.x, p.y); return { th, c: polarComponents(a, th), B: polarBasis(th) }; });
    pts.forEach((p, i) => {
      const { B } = comp[i];
      plot.arrow(p.x, p.y, p.x + 0.85 * B.rhat[0], p.y + 0.85 * B.rhat[1], { color: 'accent2', width: 1.8, label: 'out', ldx: 4, ldy: -6, lsize: 11 });
      plot.arrow(p.x, p.y, p.x + 0.85 * B.thetahat[0], p.y + 0.85 * B.thetahat[1], { color: 'violet', width: 1.8, label: 'around', ldx: 4, ldy: -6, lsize: 11 });
      plot.arrow(p.x, p.y, p.x + 1.3 * ux, p.y + 1.3 * uy, { color: 'gold', width: 3 });
    });
    if (F.params.naive) {
      const [vr, vt] = comp[0].c, Bb = comp[1].B, p = pts[1];
      const nx = vr * Bb.rhat[0] + vt * Bb.thetahat[0], ny = vr * Bb.rhat[1] + vt * Bb.thetahat[1];
      plot.arrow(p.x, p.y, p.x + 1.3 * nx, p.y + 1.3 * ny, { color: 'bad', width: 2.4, dash: [6, 4] });
    }
    ctx.restore();
    plot.drawHandles();
    pts.forEach((p) => plot.text(p.name, p.x, p.y, { dx: -18, dy: 14, weight: 700, color: 'ink' }));
    const turn = dAngle(comp[0].th, comp[1].th);
    if (P.readout !== false) F.readout([
      ['at A: $(V_r,\\ V_\\theta)$', `(${comp[0].c[0].toFixed(3)},\\ ${comp[0].c[1].toFixed(3)})`],
      ['at B: $(V_r,\\ V_\\theta)$', `(${comp[1].c[0].toFixed(3)},\\ ${comp[1].c[1].toFixed(3)})`],
      ['the grid turns from A to B by', fmtDeg(turn)],
    ]);
  }
  F.draw(draw);
  F.caption(P.caption || 'Every gold and grey arrow is the same arrow — same length, same direction. Blue $\\hat r$ (“out”) and violet $\\hat\\theta$ (“around”, anticlockwise) are the polar grid’s own unit arrows at A and at B. The components $(V_r, V_\\theta)$ say how much of the arrow lies along each; they change because $\\hat r$ and $\\hat\\theta$ turn from place to place, not because the field does.');
  return { get: (k) => F.params[k] };
}

// ── basis: how the polar grid’s arrows turn and stretch ─────────────────────
function mountBasis(F, P) {
  const { canvas } = F.canvas({ aspect: '', label: P.alt || 'The polar grid’s own arrows at a point P, and how they change from point to point' });
  const R = P.range;
  const STEP = 0.25;                              // radians: the drawn “around” step
  const p = { x: P.p[0], y: P.p[1] };
  const plot = new Plot(canvas, { x: [-R, R], y: [-R, R], equal: true, grid: false, axes: false });
  plot.handle(() => [p.x, p.y], (x, y) => { const r = Math.hypot(x, y); const k = r < 0.6 ? 0.6 / (r || 1) : r > R - 0.4 ? (R - 0.4) / r : 1; p.x = x * k; p.y = y * k; });
  plot.onDrag = () => draw();
  F.toggle({ key: 'ray', label: 'Show the arrows along P’s ray', value: P.ray ?? true, explain: 'Going outward, the step for a fixed $\\Delta\\theta$ gets longer: it is $r\\,\\Delta\\theta$.' });
  F.toggle({ key: 'ring', label: 'Show the arrows around P’s circle', value: P.ring ?? true, explain: 'Going around, $\\hat r$ turns by exactly the angle you move through.' });
  F.onChange(() => draw());
  function draw() {
    plot.clear();
    const ctx = canvas.getContext('2d');
    ctx.save(); ctx.beginPath(); ctx.rect(plot.L, plot.T, plot.R - plot.L, plot.B - plot.T); ctx.clip();
    cartGrid(plot, R, { alpha: 0.2 });
    polarGrid(plot, R, { alpha: 0.35 });
    const [r, th] = toPolar(p.x, p.y);
    const basisAt = (rr, tt, o) => {
      const [x, y] = fromPolar(rr, tt), B = polarBasis(tt);
      plot.arrow(x, y, x + B.rhat[0], y + B.rhat[1], { color: 'accent2', width: o.w, alpha: o.alpha });
      plot.arrow(x, y, x + STEP * rr * B.thetahat[0], y + STEP * rr * B.thetahat[1], { color: 'violet', width: o.w, alpha: o.alpha });
    };
    if (F.params.ray) for (let k = 1; k <= Math.floor(R * 1.3); k++) if (Math.abs(k - r) > 0.3) basisAt(k, th, { w: 1.6, alpha: 0.55 });
    if (F.params.ring) for (let k = 1; k < 12; k++) basisAt(r, th + k * 30 * DEG, { w: 1.6, alpha: 0.55 });
    basisAt(r, th, { w: 3, alpha: 1 });
    plot.point(0, 0, { color: 'ink2', r: 3 });
    ctx.restore();
    plot.drawHandles();
    plot.text('P', p.x, p.y, { dx: -16, dy: 14, weight: 700 });
    if (P.readout !== false) F.readout([
      ['P: $r$', r.toFixed(2)], ['$\\theta$', fmtDeg(th)],
      ['distance per radian of $\\theta$ (the length of $\\mathbf{e}_\\theta$)', `r = ${r.toFixed(2)}`],
      ['its stretch per unit step outward', `1/r = ${(1 / r).toFixed(3)}`],
      ['turn of $\\hat r$ per radian around', `1\\ \\text{rad} = ${(180 / Math.PI).toFixed(1)}^\\circ`],
    ]);
  }
  F.draw(draw);
  F.caption(P.caption || `Blue: $\\hat r$, the unit arrow pointing outward. Violet: the step you take when $\\theta$ grows by ${STEP} rad, which is $${STEP}\\,r$ long — the coordinate arrow $\\mathbf{e}_\\theta$ scaled by ${STEP}. Drag P. The rule that tracks these turns and stretches from point to point is the connection.`);
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!['measure', 'field', 'basis'].includes(P.mode)) p.push(`gr-coordinates: unknown mode ${P.mode}`);
  if (!['polar', 'skew', 'cart'].includes(P.grid)) p.push(`gr-coordinates: unknown grid ${P.grid}`);
  if (!['circle', 'segment', 'none'].includes(P.shape)) p.push(`gr-coordinates: unknown shape ${P.shape}`);
  if (!(P.radius >= 0.3 && P.radius <= 4)) p.push('gr-coordinates: radius must lie in [0.3, 4]');
  if (!(P.skew > 10 && P.skew < 170)) p.push('gr-coordinates: skew angle must lie in (10°, 170°)');
  if (P.step && !(P.step.r > 0 && Number.isFinite(P.step.dr) && Number.isFinite(P.step.theta) && Number.isFinite(P.step.dtheta))) p.push('gr-coordinates: step needs r > 0, dr, theta and dtheta');
  return p;
}
