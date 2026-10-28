// Laplace's equation in a rectangular box, solved by relaxation — the
// DOM-free model behind sims/em3-relax.js, tested headlessly in
// test/em3-relax.test.mjs.
//
// The box is 0 ≤ x ≤ a, 0 ≤ y ≤ b, with a = 1 (lengths in units of the
// width), cut into nx × ny square cells (h = 1/nx, ny = round(nx·b)). The four
// walls are held at set potentials (the top wall may instead carry
// V₀ sin(πx/a)); an optional rectangular electrode inside is held at its own
// potential. Every other node is free. One sweep replaces each free node by
// the average of its four neighbours — the discrete mean-value property:
//   Jacobi        all nodes from the previous sweep's values
//   Gauss–Seidel  in place, using neighbours already updated this sweep
//   SOR           Gauss–Seidel over-relaxed by ω (ω = 1 is Gauss–Seidel)
// The fixed point is the five-point discrete solution of ∇²V = 0; it does not
// depend on the starting guess (the discrete uniqueness theorem), and it
// approaches the exact Fourier-series solution as h² when h shrinks.

/** Exact series potential at (x, y) in the box [0, 1] × [0, b] (constant walls; top wall optionally a sine). */
export function series(b, walls, x, y, { top = 'flat', terms = 401 } = {}) {
  const { left = 0, right = 0, bottom = 0, top: T = 0 } = walls;
  const PI = Math.PI;
  // sinh(u)/sinh(U) for 0 ≤ u ≤ U, without overflow
  const ratio = (u, U) => (U === 0 ? 0 : Math.exp(u - U) * (-Math.expm1(-2 * u)) / (-Math.expm1(-2 * U)));
  let v = 0;
  for (let n = 1; n <= terms; n += 2) {
    const c = 4 / (n * PI), k = n * PI;
    if (top !== 'sine' && T) v += T * c * Math.sin(k * x) * ratio(k * y, k * b);
    if (bottom) v += bottom * c * Math.sin(k * x) * ratio(k * (b - y), k * b);
    if (left) v += left * c * Math.sin((k * y) / b) * ratio((k * (1 - x)) / b, k / b);
    if (right) v += right * c * Math.sin((k * y) / b) * ratio((k * x) / b, k / b);
  }
  if (top === 'sine' && T) v += T * Math.sin(PI * x) * ratio(PI * y, PI * b);
  return v;
}

/** A Park–Miller generator, so a "random" starting guess is the same on every run. */
function rng(seed) {
  let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * Build a box. spec: { n (cells across), aspect (b/a), walls: { left, right,
 * bottom, top } in volts, top: 'flat' | 'sine', electrode: { x, y, w, h, V }
 * (a rectangle in units of a, or null) }.
 */
export function makeBox({ n = 24, aspect = 1, walls = {}, top = 'flat', electrode = null } = {}) {
  const nx = Math.max(4, Math.round(n)), ny = Math.max(4, Math.round(nx * aspect));
  const b = ny / nx, h = 1 / nx;
  const W = { left: 0, right: 0, bottom: 0, top: 0, ...walls };
  const N = (nx + 1) * (ny + 1);
  const V = new Float64Array(N), fixed = new Uint8Array(N);
  const id = (i, j) => i * (ny + 1) + j;
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
    const x = i * h, k = id(i, j);
    const onL = i === 0, onR = i === nx, onB = j === 0, onT = j === ny;
    if (!(onL || onR || onB || onT)) continue;
    fixed[k] = 1;
    const topV = top === 'sine' ? W.top * Math.sin(Math.PI * x) : W.top;
    // a corner belongs to two walls: give it their average
    const vals = [];
    if (onL) vals.push(W.left);
    if (onR) vals.push(W.right);
    if (onB) vals.push(W.bottom);
    if (onT) vals.push(topV);
    V[k] = vals.reduce((s, v) => s + v, 0) / vals.length;
  }
  let el = null;
  if (electrode) {
    const i0 = Math.max(1, Math.round(electrode.x * nx)), i1 = Math.min(nx - 1, Math.round((electrode.x + electrode.w) * nx));
    const j0 = Math.max(1, Math.round(electrode.y * nx)), j1 = Math.min(ny - 1, Math.round((electrode.y + electrode.h) * nx));
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { fixed[id(i, j)] = 1; V[id(i, j)] = electrode.V; }
    el = { i0, i1, j0, j1, V: electrode.V };
  }
  let lo = Infinity, hi = -Infinity;
  for (let k = 0; k < N; k++) if (fixed[k]) { lo = Math.min(lo, V[k]); hi = Math.max(hi, V[k]); }
  return { nx, ny, b, h, V, fixed, id, walls: W, top, electrode: el, lo, hi, sweeps: 0 };
}

/** A copy of a box (same walls and fixed values), for a second run from another guess. */
export function cloneBox(B) {
  return { ...B, V: Float64Array.from(B.V), fixed: B.fixed, sweeps: B.sweeps };
}

/** Set every free node: 'zero', 'high' (the largest fixed value), 'low', 'mean', or 'random' (between the extremes). */
export function init(B, kind = 'zero', seed = 7) {
  const r = rng(seed);
  for (let k = 0; k < B.V.length; k++) {
    if (B.fixed[k]) continue;
    B.V[k] = kind === 'high' ? B.hi : kind === 'low' ? B.lo : kind === 'mean' ? (B.lo + B.hi) / 2 : kind === 'random' ? B.lo + (B.hi - B.lo) * r() : 0;
  }
  B.sweeps = 0;
  return B;
}

/** The SOR factor that converges fastest on this grid (Frankel–Young). */
export function omegaOpt(B) {
  const rho = (Math.cos(Math.PI / B.nx) + Math.cos(Math.PI / B.ny)) / 2;   // Jacobi's spectral radius
  return 2 / (1 + Math.sqrt(1 - rho * rho));
}

/** One sweep. method: 'jacobi' | 'gs' | 'sor'. Returns the largest change of any node. */
export function sweep(B, method = 'gs', omega = null) {
  const { nx, ny, V, fixed } = B, S = ny + 1;
  let big = 0;
  if (method === 'jacobi') {
    const old = Float64Array.from(V);
    for (let i = 1; i < nx; i++) for (let j = 1; j < ny; j++) {
      const k = i * S + j;
      if (fixed[k]) continue;
      const v = (old[k - S] + old[k + S] + old[k - 1] + old[k + 1]) / 4;
      big = Math.max(big, Math.abs(v - old[k]));
      V[k] = v;
    }
  } else {
    const w = method === 'sor' ? (omega ?? omegaOpt(B)) : 1;
    for (let i = 1; i < nx; i++) for (let j = 1; j < ny; j++) {
      const k = i * S + j;
      if (fixed[k]) continue;
      const avg = (V[k - S] + V[k + S] + V[k - 1] + V[k + 1]) / 4;
      const d = w * (avg - V[k]);
      big = Math.max(big, Math.abs(d));
      V[k] += d;
    }
  }
  B.sweeps++;
  return big;
}

/** Sweep until the largest change falls below tol (or max sweeps). Returns the number of sweeps taken. */
export function relax(B, method = 'gs', { tol = 1e-9, max = 100000, omega = null } = {}) {
  let k = 0;
  while (k < max) { k++; if (sweep(B, method, omega) < tol) break; }
  return k;
}

/** The largest |V − average of its four neighbours| over the free nodes. */
export function residual(B) {
  const { nx, ny, V, fixed } = B, S = ny + 1;
  let r = 0;
  for (let i = 1; i < nx; i++) for (let j = 1; j < ny; j++) {
    const k = i * S + j;
    if (!fixed[k]) r = Math.max(r, Math.abs(V[k] - (V[k - S] + V[k + S] + V[k - 1] + V[k + 1]) / 4));
  }
  return r;
}

/** The largest difference between two boxes' values. */
export function gap(A, B) {
  let g = 0;
  for (let k = 0; k < A.V.length; k++) g = Math.max(g, Math.abs(A.V[k] - B.V[k]));
  return g;
}

/** V at the node nearest (x, y), with its node indices. */
export function at(B, x, y) {
  const i = Math.max(0, Math.min(B.nx, Math.round(x / B.h))), j = Math.max(0, Math.min(B.ny, Math.round(y / B.h)));
  return { i, j, x: i * B.h, y: j * B.h, V: B.V[B.id(i, j)] };
}

/** The four neighbours' average at node (i, j) (an interior node). */
export function neighbourMean(B, i, j) {
  const S = B.ny + 1, k = i * S + j;
  return (B.V[k - S] + B.V[k + S] + B.V[k - 1] + B.V[k + 1]) / 4;
}

/** The grid as { x0, x1, y0, y1, nx, ny, z } (z[i][j]) for contouring. */
export function grid(B) {
  const z = [];
  for (let i = 0; i <= B.nx; i++) { const row = []; for (let j = 0; j <= B.ny; j++) row.push(B.V[B.id(i, j)]); z.push(row); }
  return { x0: 0, x1: 1, y0: 0, y1: B.b, nx: B.nx, ny: B.ny, z };
}

/** The largest and smallest values at free nodes (for the extremum check). */
export function freeRange(B) {
  let lo = Infinity, hi = -Infinity;
  for (let k = 0; k < B.V.length; k++) if (!B.fixed[k]) { lo = Math.min(lo, B.V[k]); hi = Math.max(hi, B.V[k]); }
  return [lo, hi];
}
