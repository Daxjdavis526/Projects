// Contour maps of z = f(x, y), DOM-free: sample f on a grid, trace each level
// set f = c with marching squares (an ambiguous saddle cell is resolved by
// the value at its centre), join the pieces into polylines, choose evenly
// spaced "nice" levels, and find a spot on each curve for its label.
// Used by the c3-contour simulation; tested headlessly in
// test/c3-contour.test.mjs.

/**
 * f sampled on an (nx+1) × (ny+1) grid over [x0, x1] × [y0, y1]:
 * { x0, x1, y0, y1, nx, ny, z } with z[i][j] = f(x_i, y_j) (NaN where undefined).
 */
export function sampleGrid(f, [x0, x1], [y0, y1], nx = 100, ny = nx) {
  const z = [];
  for (let i = 0; i <= nx; i++) {
    const row = [];
    const x = x0 + ((x1 - x0) * i) / nx;
    for (let j = 0; j <= ny; j++) {
      const v = f(x, y0 + ((y1 - y0) * j) / ny);
      row.push(Number.isFinite(v) ? v : NaN);
    }
    z.push(row);
  }
  return { x0, x1, y0, y1, nx, ny, z };
}

/** The smallest and largest finite values on a grid. */
export function range(grid) {
  let lo = Infinity, hi = -Infinity;
  for (const row of grid.z) for (const v of row) if (Number.isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; }
  return [lo, hi];
}

// the edges of a cell, as corner pairs (corners: 0 = (i, j), 1 = (i+1, j), 2 = (i+1, j+1), 3 = (i, j+1))
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0]];

/**
 * The level set f = c as line segments [[xa, ya], [xb, yb]]. A grid value
 * exactly equal to c is nudged up by a hair, so a contour through a grid
 * point is still found once, and a flat region at height c gives no noise.
 */
export function contourSegments(grid, c) {
  const { x0, x1, y0, y1, nx, ny, z } = grid;
  const dx = (x1 - x0) / nx, dy = (y1 - y0) / ny;
  const eps = 1e-12 * (1 + Math.abs(c));
  const val = (i, j) => { const v = z[i][j]; return Math.abs(v - c) <= eps ? c + eps : v; };
  const segs = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
    const v = q.map(([a, b]) => val(a, b));
    if (v.some((w) => !Number.isFinite(w))) continue;
    const cross = [];
    for (const [a0, b0] of EDGES) {
      if ((v[a0] - c) * (v[b0] - c) < 0) {
        // interpolate from the lower grid node, so the two cells that share
        // this edge compute exactly the same point and the pieces join
        const [a, b] = q[a0][0] + q[a0][1] < q[b0][0] + q[b0][1] ? [a0, b0] : [b0, a0];
        const s = (c - v[a]) / (v[b] - v[a]);
        const [ia, ja] = q[a], [ib, jb] = q[b];
        cross.push([x0 + (ia + (ib - ia) * s) * dx, y0 + (ja + (jb - ja) * s) * dy]);
      }
    }
    if (cross.length === 2) segs.push([cross[0], cross[1]]);
    else if (cross.length === 4) {
      // a saddle cell: corners 0 and 2 share a side of c. If the centre is on
      // their side, the curves separate corners 1 and 3 from the middle; else 0 and 2.
      const centre = (v[0] + v[1] + v[2] + v[3]) / 4;
      if ((centre - c) * (v[0] - c) > 0) segs.push([cross[0], cross[1]], [cross[2], cross[3]]);
      else segs.push([cross[0], cross[3]], [cross[1], cross[2]]);
    }
  }
  return segs;
}

/**
 * Join segments that share endpoints into polylines [[x, y], …] (closed loops
 * repeat their first point). contourSegments computes a shared point exactly
 * the same way in both cells, so by default endpoints must match exactly;
 * tol > 0 matches them to within tol instead.
 */
export function joinSegments(segs, tol = 0) {
  const key = tol > 0 ? (p) => `${Math.round(p[0] / tol)},${Math.round(p[1] / tol)}` : (p) => `${p[0]},${p[1]}`;
  const ends = new Map();
  const used = new Array(segs.length).fill(false);
  segs.forEach((s, k) => { for (const p of s) { const kk = key(p); if (!ends.has(kk)) ends.set(kk, []); ends.get(kk).push(k); } });
  const next = (p) => (ends.get(key(p)) || []).find((k) => !used[k]);
  const lines = [];
  for (let k = 0; k < segs.length; k++) {
    if (used[k]) continue;
    used[k] = true;
    const line = [segs[k][0], segs[k][1]];
    for (const dir of [1, -1]) {   // grow forward from the last point, then backward from the first
      for (;;) {
        const end = dir === 1 ? line[line.length - 1] : line[0];
        const m = next(end);
        if (m === undefined) break;
        used[m] = true;
        const [a, b] = segs[m];
        const p = key(a) === key(end) ? b : a;
        if (dir === 1) line.push(p); else line.unshift(p);
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Evenly spaced levels with a round step (1, 2, 2.5 or 5 × 10ⁿ), about n of them, strictly inside (lo, hi). */
export function niceLevels(lo, hi, n = 8) {
  if (!(hi > lo)) return [];
  const raw = (hi - lo) / (n + 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || 10 * mag;
  const out = [];
  for (let c = Math.ceil(lo / step) * step; c < hi - 1e-9 * step; c += step) if (c > lo + 1e-9 * step) out.push(+c.toPrecision(12));
  return out;
}

/** Levels from a spec: an array, { from, to, step }, or a count (nice levels over the grid's range). */
export function levelsFrom(spec, lo, hi) {
  if (Array.isArray(spec)) return spec.slice();
  if (spec && typeof spec === 'object') {
    const out = [], { from, to, step } = spec;
    if (!(step > 0)) return out;
    for (let c = from; c <= to + 1e-9 * step; c += step) out.push(+c.toPrecision(12));
    return out;
  }
  return niceLevels(lo, hi, typeof spec === 'number' ? spec : 8);
}

/** Length of a polyline. */
export function length(line) {
  let s = 0;
  for (let k = 1; k < line.length; k++) s += Math.hypot(line[k][0] - line[k - 1][0], line[k][1] - line[k - 1][1]);
  return s;
}

/**
 * A point on the polyline for its label: the point at a fraction `at` of its
 * length that is inside `inside(p)` and farther than `gap` (in the units of
 * `dist`) from every point in `taken`; null if there is none.
 */
export function labelSpot(line, { at = 0.5, inside = () => true, taken = [], gap = 0, dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) } = {}) {
  const L = length(line);
  if (!(L > 0)) return null;
  for (const f of [at, at + 0.15, at - 0.15, at + 0.3, at - 0.3, 0.1, 0.9]) {
    if (f < 0 || f > 1) continue;
    let s = f * L, p = null;
    for (let k = 1; k < line.length; k++) {
      const d = Math.hypot(line[k][0] - line[k - 1][0], line[k][1] - line[k - 1][1]);
      if (s <= d) { const u = d ? s / d : 0; p = [line[k - 1][0] + (line[k][0] - line[k - 1][0]) * u, line[k - 1][1] + (line[k][1] - line[k - 1][1]) * u]; break; }
      s -= d;
    }
    if (p && inside(p) && taken.every((q) => dist(p, q) > gap)) return p;
  }
  return null;
}

/** A level's label: up to 3 significant figures, with a true minus sign. */
export function levelText(c) {
  const a = Math.abs(c);
  const s = a === 0 ? '0' : a >= 1e4 || a < 1e-3 ? c.toExponential(1) : String(+c.toPrecision(3));
  return s.replace('-', '−');
}
