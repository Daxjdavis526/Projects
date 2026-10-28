// Multiple integrals, DOM-free: iterated integrals over regions described by
// strips (nested Simpson), the strip through a point, Riemann sums of boxes
// over a rectangle (optionally only where a region holds), and the area of a
// small cell under a change of variables (u, v) ↦ (x, y) with its Jacobian.
// Used by the c3-slicer, c3-boxes and c3-jacobian simulations; tested
// headlessly in test/c3-integrals.test.mjs.

/** Composite Simpson's rule with n (even) intervals; 0 for an empty or reversed interval. */
export function simpson(f, a, b, n = 200) {
  if (!(b > a)) return b === a ? 0 : -simpson(f, b, a, n);
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/**
 * A region as strips: pieces [{ from, to, lo, hi }], each over an interval
 * [from, to] of the OUTER variable t, with the inner variable s running from
 * lo(t) to hi(t). The integral of g(t, s) over it, ∫∫ g ds dt, by nested
 * Simpson. (For dy dx strips t is x and s is y; for dx dy, t is y and s is x.)
 */
export function iterated(pieces, g = () => 1, n = 160) {
  let total = 0;
  for (const p of pieces) total += simpson((t) => simpson((s) => g(t, s), p.lo(t), p.hi(t), n), p.from, p.to, n);
  return total;
}

/** The outer range covered by a list of pieces: [first from, last to]. */
export const outerRange = (pieces) => [pieces[0].from, pieces[pieces.length - 1].to];

/** The piece that contains outer coordinate t, its index and its inner limits there (null outside). */
export function stripAt(pieces, t, eps = 1e-9) {
  for (let k = 0; k < pieces.length; k++) {
    const p = pieces[k];
    if (t >= p.from - eps && t <= p.to + eps) return { k, lo: p.lo(t), hi: p.hi(t), piece: p };
  }
  return null;
}

/** The accumulated integral from the start of the outer range to t: ∫ (∫ g ds) dt over the swept part. */
export function sweptIntegral(pieces, t, g = () => 1, n = 120) {
  let total = 0;
  for (const p of pieces) {
    if (t <= p.from) break;
    const b = Math.min(t, p.to);
    total += simpson((u) => simpson((s) => g(u, s), p.lo(u), p.hi(u), n), p.from, b, n);
  }
  return total;
}

/**
 * Problems with a strip description, for a simulation's validate(): each
 * piece runs forwards, the pieces join end to end, and lo ≤ hi inside each.
 */
export function stripProblems(pieces, name = 'region') {
  const out = [];
  pieces.forEach((p, k) => {
    if (!(p.to > p.from)) out.push(`${name} piece ${k + 1}: needs from < to`);
    if (k && Math.abs(p.from - pieces[k - 1].to) > 1e-9) out.push(`${name} piece ${k + 1} must start where piece ${k} ends (${pieces[k - 1].to})`);
    for (let i = 1; i < 20; i++) {
      const t = p.from + ((p.to - p.from) * i) / 20, a = p.lo(t), b = p.hi(t);
      if (!Number.isFinite(a) || !Number.isFinite(b)) { out.push(`${name} piece ${k + 1}: limits undefined at ${+t.toPrecision(4)}`); break; }
      if (a > b + 1e-9) { out.push(`${name} piece ${k + 1}: lower limit above the upper one at ${+t.toPrecision(4)}`); break; }
    }
  });
  return out;
}

/**
 * A Riemann sum of boxes over [x0, x1] × [y0, y1], cut into m × n cells. The
 * height of each box is f at its sample point: 'mid' (centre), 'll' (lower-left
 * corner) or 'ur' (upper-right). With inside(x, y), a cell whose sample point
 * lies outside the region gets no box (f is taken as 0 there).
 */
export function boxes(f, [x0, x1], [y0, y1], m, n, rule = 'mid', inside = null) {
  const dx = (x1 - x0) / m, dy = (y1 - y0) / n, list = [];
  let sum = 0;
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    const a = x0 + i * dx, c = y0 + j * dy;
    const [sx, sy] = rule === 'll' ? [a, c] : rule === 'ur' ? [a + dx, c + dy] : [a + dx / 2, c + dy / 2];
    const inD = !inside || !!inside(sx, sy);
    const v = inD ? f(sx, sy) : 0, h = Number.isFinite(v) ? v : 0;
    list.push({ i, j, x0: a, x1: a + dx, y0: c, y1: c + dy, sx, sy, h, inD });
    sum += h * dx * dy;
  }
  return { list, sum, dx, dy };
}

/** ∬ f over a rectangle by nested Simpson (f smooth); with inside(x, y), a fine midpoint sum instead. */
export function rectIntegral(f, [x0, x1], [y0, y1], inside = null, n = 120) {
  if (!inside) return simpson((x) => simpson((y) => f(x, y), y0, y1, n), x0, x1, n);
  const N = 4 * n, dx = (x1 - x0) / N, dy = (y1 - y0) / N;
  let s = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = x0 + (i + 0.5) * dx, y = y0 + (j + 0.5) * dy;
    if (inside(x, y)) { const v = f(x, y); if (Number.isFinite(v)) s += v; }
  }
  return s * dx * dy;
}

/** The cross-section of the solid under f at x = a: ∫ f(a, y) dy over [y0, y1]. */
export const sliceArea = (f, a, [y0, y1], n = 200) => simpson((y) => f(a, y), y0, y1, n);

/** The boundary of the cell [u0, u1] × [v0, v1], walked anticlockwise in (u, v), k points per edge. */
export function cellBoundary(u0, u1, v0, v1, k = 24) {
  const pts = [];
  for (let i = 0; i < k; i++) pts.push([u0 + ((u1 - u0) * i) / k, v0]);
  for (let i = 0; i < k; i++) pts.push([u1, v0 + ((v1 - v0) * i) / k]);
  for (let i = 0; i < k; i++) pts.push([u1 - ((u1 - u0) * i) / k, v1]);
  for (let i = 0; i < k; i++) pts.push([u0, v1 - ((v1 - v0) * i) / k]);
  return pts;
}

/** Signed area of a closed polygon [[x, y], …] (positive when anticlockwise). */
export function shoelace(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [a, b] = pts[i], [c, d] = pts[(i + 1) % pts.length];
    s += a * d - b * c;
  }
  return s / 2;
}

/**
 * The signed area of the image of the cell [u0, u1] × [v0, v1] under
 * (u, v) ↦ (X(u, v), Y(u, v)): negative when the map reverses orientation.
 */
export function mappedArea(X, Y, u0, u1, v0, v1, k = 48) {
  return shoelace(cellBoundary(u0, u1, v0, v1, k).map(([u, v]) => [X(u, v), Y(u, v)]));
}

/** The Jacobian matrix of (u, v) ↦ (X, Y) at a point, by central differences, and its determinant. */
export function jacobianAt(X, Y, u, v, h = 1e-5) {
  const xu = (X(u + h, v) - X(u - h, v)) / (2 * h), xv = (X(u, v + h) - X(u, v - h)) / (2 * h);
  const yu = (Y(u + h, v) - Y(u - h, v)) / (2 * h), yv = (Y(u, v + h) - Y(u, v - h)) / (2 * h);
  return { xu, xv, yu, yv, det: xu * yv - xv * yu };
}

/** ∬ |J| du dv over [u0, u1] × [v0, v1]: the area of the image region (for a one-to-one map). */
export const imageArea = (X, Y, [u0, u1], [v0, v1], n = 80) =>
  simpson((u) => simpson((v) => Math.abs(jacobianAt(X, Y, u, v).det), v0, v1, n), u0, u1, n);
