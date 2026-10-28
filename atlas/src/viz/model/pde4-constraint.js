// Constraints that ride along with an evolution — two toys for module B14 of
// the PDE course. DOM-free; tested in test/pde4-fd.test.mjs.
//
// maxwell: one dimension of Maxwell's equations with ε₀ = 1. A blob of charge
//   drifts at speed v through a fixed neutralizing background on a periodic
//   line; the field obeys E_t = −J with J = vρ (Ampère with no magnetic field),
//   and Gauss's law E_x = ρ is the constraint. The charge is moved by the
//   upwind scheme. 'staggered': E lives between grid points and is updated by
//   the very flux that moves the charge, so the discrete Gauss law
//   (E_{j+½} − E_{j−½})/Δx = ρ_j holds to round-off for ever. 'collocated': E
//   lives on the grid points, is updated with J_j = vρ_j and checked with the
//   centred difference; the two discrete laws disagree by the upwind scheme's
//   numerical diffusion, C_t = −(vΔx/2)δ²ρ/Δx², so the violation drifts — at a
//   size proportional to Δx.
//
// wave: the first-order reduction of the wave equation that numerical
//   relativity's toy models use, u_t = π, π_t = φ_x, φ_t = π_x − γ(φ − u_x),
//   with the auxiliary field φ standing for u_x. The constraint C = φ − u_x
//   obeys C_t = −γC exactly — and, with centred differences D₀ throughout, the
//   semi-discrete C = φ − D₀u obeys it too. γ = 0: a violation rides along
//   unchanged; γ > 0: it dies as e^(−γt). Time stepping: classical RK4.

const TAU = 2 * Math.PI;

/** maxwell: { N, v, nu, L, A, w, x0, scheme: 'staggered' | 'collocated', tmax, frames } */
export function runMaxwell(o) {
  const { N = 100, v = 1, nu = 0.5, L = 10, A = 1, w = 0.6, scheme = 'collocated', tmax = 10, frames = 100 } = o;
  const x0 = o.x0 ?? L / 4;
  const dx = L / N, dt = (nu * dx) / v, steps = Math.round(tmax / dt);
  const x = Array.from({ length: N }, (_, j) => j * dx);
  // the moving blob (on the nearest periodic image) and the background that makes the line neutral
  let blob = Float64Array.from(x, (xx) => { const X = ((xx - x0 + L / 2) % L + L) % L - L / 2; return A * Math.exp(-(X * X) / (w * w)); });
  const mean = blob.reduce((s, b) => s + b, 0) / N;
  const rho = () => Array.from(blob, (b) => b - mean);
  // E at j + ½ from the cumulative charge, shifted to zero mean
  const r0 = rho();
  let Eh = new Float64Array(N); let acc = 0;
  for (let j = 0; j < N; j++) { acc += dx * r0[j]; Eh[j] = acc; }
  const mh = Eh.reduce((s, e) => s + e, 0) / N; Eh = Eh.map((e) => e - mh);
  // collocated E (N even): solve the centred Gauss law E_{j+1} − E_{j−1} = 2Δx ρ_j exactly, so the run starts with C = 0
  // (two decoupled chains, even and odd points; each made to have zero mean)
  let E = Eh;
  if (scheme !== 'staggered') {
    E = new Float64Array(N);
    for (const start of [0, 1]) {
      let s = 0, cnt = 0;
      for (let j = start; j + 2 < N; j += 2) { E[j + 2] = E[j] + 2 * dx * r0[j + 1]; }
      for (let j = start; j < N; j += 2) { s += E[j]; cnt++; }
      for (let j = start; j < N; j += 2) E[j] -= s / cnt;
    }
  }
  const gauss = () => {
    const R = rho(), C = new Array(N);
    for (let j = 0; j < N; j++) {
      C[j] = scheme === 'staggered'
        ? (E[j] - E[(j - 1 + N) % N]) / dx - R[j]
        : (E[(j + 1) % N] - E[(j - 1 + N) % N]) / (2 * dx) - R[j];
    }
    return C;
  };
  const norm = (C) => C.reduce((m, c) => Math.max(m, Math.abs(c)), 0);
  const every = Math.max(1, Math.floor(steps / frames));
  const snaps = [], hist = [];
  const snap = (n) => { const C = gauss(); snaps.push({ t: n * dt, rho: rho(), E: Array.from(E), C }); };
  snap(0); hist.push([0, norm(gauss())]);
  for (let n = 1; n <= steps; n++) {
    const nb = new Float64Array(N);
    for (let j = 0; j < N; j++) nb[j] = blob[j] - nu * (blob[j] - blob[(j - 1 + N) % N]);
    // both versions use the current carried by the moving blob, J = v·blob
    for (let j = 0; j < N; j++) E[j] -= dt * v * blob[j];
    blob = nb;
    hist.push([n * dt, norm(gauss())]);
    if (n % every === 0 || n === steps) snap(n);
  }
  return { x, dx, dt, steps, snaps, hist, xE: scheme === 'staggered' ? x.map((xx) => xx + dx / 2) : x };
}

const gaussU = (x, w) => { const X = x - Math.PI; return Math.exp(-(X * X) / (w * w)); };
const gaussDU = (x, w) => { const X = x - Math.PI; return (-2 * X / (w * w)) * Math.exp(-(X * X) / (w * w)); };

/** wave: { N, gamma, eps (fractional error put into φ at t = 0), w, cfl, tmax, frames, start: 'rest' | 'right' } on [0, 2π) */
export function runWave(o) {
  const { N = 100, gamma = 0, eps = 0.1, w = 0.5, cfl = 0.5, tmax = 6, frames = 100, start = 'right' } = o;
  const dx = TAU / N, dt = cfl * dx, steps = Math.round(tmax / dt);
  const x = Array.from({ length: N }, (_, j) => j * dx);
  const D0 = (f) => Float64Array.from({ length: N }, (_, j) => (f[(j + 1) % N] - f[(j - 1 + N) % N]) / (2 * dx));
  let u = Float64Array.from(x, (xx) => gaussU(xx, w));
  let p = Float64Array.from(x, (xx) => (start === 'right' ? -gaussDU(xx, w) : 0));
  let f = Float64Array.from(x, (xx) => (1 + eps) * gaussDU(xx, w));
  const rhs = (U, P, Fi) => {
    const Pu = D0(U), Pp = D0(P), Pf = D0(Fi);
    return [P, Pf, Float64Array.from({ length: N }, (_, j) => Pp[j] - gamma * (Fi[j] - Pu[j]))];
  };
  const add = (a, k, h) => Float64Array.from(a, (ai, j) => ai + h * k[j]);
  const C = () => { const Du = D0(u); return Array.from(f, (fi, j) => fi - Du[j]); };
  const norm = (c) => c.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  const every = Math.max(1, Math.floor(steps / frames));
  const snaps = [], hist = [];
  const snap = (n) => snaps.push({ t: n * dt, u: Array.from(u), phi: Array.from(f), ux: Array.from(D0(u)), C: C() });
  snap(0); hist.push([0, norm(C())]);
  for (let n = 1; n <= steps; n++) {
    const k1 = rhs(u, p, f);
    const k2 = rhs(add(u, k1[0], dt / 2), add(p, k1[1], dt / 2), add(f, k1[2], dt / 2));
    const k3 = rhs(add(u, k2[0], dt / 2), add(p, k2[1], dt / 2), add(f, k2[2], dt / 2));
    const k4 = rhs(add(u, k3[0], dt), add(p, k3[1], dt), add(f, k3[2], dt));
    const comb = (a, i) => Float64Array.from(a, (ai, j) => ai + (dt / 6) * (k1[i][j] + 2 * k2[i][j] + 2 * k3[i][j] + k4[i][j]));
    u = comb(u, 0); p = comb(p, 1); f = comb(f, 2);
    hist.push([n * dt, norm(C())]);
    if (n % every === 0 || n === steps) snap(n);
  }
  return { x, dx, dt, steps, snaps, hist };
}

/** The snapshot nearest to time t. */
export function at(R, t) {
  let best = R.snaps[0];
  for (const s of R.snaps) if (Math.abs(s.t - t) < Math.abs(best.t - t)) best = s;
  return best;
}
