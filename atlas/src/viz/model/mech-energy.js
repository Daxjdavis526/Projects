// Motion along a line in a potential-energy landscape: the model behind the
// energy diagrams of sims/mech-energy.js. DOM-free; tested headlessly in
// test/mech-energy.test.mjs.
//
// Two systems share one interface:
//  - a particle on a line, m ẍ = −U′(x) − f·sgn(ẋ). U(x) is any potential
//    energy; f ≥ 0 is a kinetic-friction force of constant size (a block on a
//    level floor pushed by a spring has f = μ_k m g);
//  - a bead on a frictionless wire of height h(x). Its energy is
//    U = m g h(x), and its exact equation of motion along the wire is
//    ẍ = −(g + h″ẋ²) h′ / (1 + h′²). Friction may act on stretches where the
//    wire is level (h′ = 0), where the normal force is exactly m g.
// Static friction is taken equal to kinetic: a particle that comes to rest
// stays at rest wherever the conservative force cannot overcome f.
//
// Analysis on an interval [a, b]: the turning points (U = E), the allowed
// intervals (U ≤ E) and the equilibria (U′ = 0), each classified as stable
// (a minimum of U), unstable (a maximum) or neutral (a level stretch).

export const G = 9.8;

/** Central differences with step h. */
export const d1 = (f, x, h) => (f(x + h) - f(x - h)) / (2 * h);
export const d2 = (f, x, h) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);

const sgn = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);

function bisect(g, lo, hi, glo) {
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2, gm = g(mid);
    if (gm === 0) return mid;
    if (sgn(gm) === sgn(glo)) { lo = mid; glo = gm; } else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * The roots of g on [a, b], ascending: the sign changes on an n-cell grid,
 * refined by bisection. A root exactly on a grid node counts once; a stretch
 * where g is identically zero is not reported (it has no single root).
 */
export function roots(g, a, b, n = 800) {
  const out = [];
  const xs = Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
  const gs = xs.map(g);
  for (let i = 0; i < n; i++) {
    const g0 = gs[i], g1 = gs[i + 1];
    if (!Number.isFinite(g0) || !Number.isFinite(g1)) continue;
    if (g0 === 0) {
      // an isolated zero on a node: the neighbours have opposite signs or touch zero from one side
      const gp = i > 0 ? gs[i - 1] : NaN;
      if ((i === 0 || gp !== 0) && g1 !== 0) out.push(xs[i]);
      continue;
    }
    if (g1 === 0) { if (i + 1 === n) out.push(xs[n]); continue; }
    if (sgn(g0) !== sgn(g1)) out.push(bisect(g, xs[i], xs[i + 1], g0));
  }
  return out;
}

/** Where U = E on [a, b]: the turning points, ascending. */
export const turningPoints = (U, E, [a, b], n) => roots((x) => U(x) - E, a, b, n);

/** The stretches of [a, b] where U(x) ≤ E (where the particle may be). */
export function allowed(U, E, [a, b], n = 800) {
  const cuts = [a, ...turningPoints(U, E, [a, b], n).filter((x) => x > a && x < b), b];
  const out = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const lo = cuts[i], hi = cuts[i + 1];
    if (hi - lo < 1e-12 * (b - a)) continue;
    if (U((lo + hi) / 2) <= E) {
      const last = out[out.length - 1];
      if (last && Math.abs(last[1] - lo) < 1e-12 * (b - a)) last[1] = hi; else out.push([lo, hi]);
    }
  }
  return out;
}

/**
 * Equilibria of U on [a, b]: [{ x, U, kind, from?, to? }], ascending. kind is
 * 'stable' (U has a minimum: the force points back towards x), 'unstable' (a
 * maximum, or a level inflection) or 'neutral' (U is level over a stretch
 * [from, to]; x is its middle).
 */
export function equilibria(U, [a, b], n = 800) {
  const span = b - a, h = span * 1e-5, dx = span / n;
  const xs = Array.from({ length: n + 1 }, (_, i) => a + dx * i);
  const Us = xs.map(U);
  const scale = Math.max(1e-300, ...Us.filter(Number.isFinite).map(Math.abs));
  const tiny = scale * 1e-10 / span;
  const D = xs.map((x) => d1(U, x, h));
  const flat = D.map((d) => Number.isFinite(d) && Math.abs(d) <= tiny);
  const out = [];
  // level stretches of three or more nodes
  for (let i = 0; i <= n;) {
    if (!flat[i]) { i++; continue; }
    let j = i;
    while (j + 1 <= n && flat[j + 1]) j++;
    if (j - i >= 2) out.push({ x: (xs[i] + xs[j]) / 2, U: U((xs[i] + xs[j]) / 2), kind: 'neutral', from: xs[i], to: xs[j] });
    i = j + 1;
  }
  const inFlat = (x) => out.some((q) => q.kind === 'neutral' && x >= q.from - dx && x <= q.to + dx);
  for (const x of roots((s) => d1(U, s, h), a, b, n)) {
    if (inFlat(x) || x <= a || x >= b) continue;
    const c = d2(U, x, Math.max(h, span * 1e-4));
    const u0 = U(x), l = U(x - dx / 4), r = U(x + dx / 4);
    const kind = c > 0 && l >= u0 && r >= u0 ? 'stable' : c < 0 && l <= u0 && r <= u0 ? 'unstable' : l > u0 && r > u0 ? 'stable' : 'unstable';
    out.push({ x, U: u0, kind });
  }
  return out.sort((p, q) => p.x - q.x);
}

/** The local minimum of U reached by walking downhill from x (golden-section on a bracket). */
export function downhill(U, x, [a, b]) {
  const step = (b - a) / 400;
  const dir = U(Math.min(b, x + step)) < U(Math.max(a, x - step)) ? 1 : -1;
  let p = x;
  while (p + dir * step >= a && p + dir * step <= b && U(p + dir * step) < U(p)) p += dir * step;
  let lo = Math.max(a, p - step), hi = Math.min(b, p + step);
  const gr = (Math.sqrt(5) - 1) / 2;
  for (let k = 0; k < 80; k++) {
    const c = hi - gr * (hi - lo), d = lo + gr * (hi - lo);
    if (U(c) < U(d)) hi = d; else lo = c;
  }
  return (lo + hi) / 2;
}

/**
 * A system to move.
 *   U(x)            potential energy (J) — or
 *   h(x)            the height of a wire (m), with U = m g h
 *   m, g            mass (kg) and the free-fall acceleration (m/s²)
 *   friction(x)     the size of the kinetic-friction force at x (N, ≥ 0); for a wire it must be zero where h′ ≠ 0
 *   span            the length scale of the problem (the width of the plotted range), which sets the difference steps
 */
export function system({ U, h = null, m = 1, g = G, friction = null, span = 1 }) {
  const sys = { m, g, h, friction: friction || (() => 0), hasFriction: !!friction };
  if (h) {
    const eps = 1e-4 * span;
    sys.U = (x) => m * g * h(x);
    sys.dh = (x) => d1(h, x, eps);
    sys.d2h = (x) => d2(h, x, eps);
    sys.dU = (x) => m * g * sys.dh(x);
  } else {
    const eps = 1e-6 * span;
    sys.U = U;
    sys.dU = (x) => d1(U, x, eps);
  }
  return sys;
}

/** Kinetic energy of the state: ½ m ẋ² on a line, ½ m (1 + h′²) ẋ² along a wire. */
export function kinetic(sys, s) {
  const w = sys.h ? 1 + sys.dh(s.x) ** 2 : 1;
  return 0.5 * sys.m * w * s.v * s.v;
}

/** The speed: |ẋ| on a line, the speed along the wire for a bead. */
export const speed = (sys, s) => Math.abs(s.v) * (sys.h ? Math.sqrt(1 + sys.dh(s.x) ** 2) : 1);

/** The conservative force along the motion: −dU/dx on a line; −mg sin θ along a wire. */
export function force(sys, x) {
  if (!sys.h) return -sys.dU(x);
  const hp = sys.dh(x);
  return (-sys.m * sys.g * hp) / Math.sqrt(1 + hp * hp);
}

// [ẋ, ẍ, rate of thermal energy] with friction opposing the direction `dir`
function rhs(sys, x, v, dir) {
  const f = sys.friction(x);
  if (!sys.h) return [v, (-sys.dU(x) - f * dir) / sys.m, f * Math.abs(v)];
  const hp = sys.dh(x), w = 1 + hp * hp, rw = Math.sqrt(w);
  return [v, (-(sys.g + sys.d2h(x) * v * v) * hp) / w - (f * dir) / (sys.m * rw), f * Math.abs(v) * rw];
}

function rk4(sys, x, v, th, dt, dir) {
  const k1 = rhs(sys, x, v, dir);
  const k2 = rhs(sys, x + (dt / 2) * k1[0], v + (dt / 2) * k1[1], dir);
  const k3 = rhs(sys, x + (dt / 2) * k2[0], v + (dt / 2) * k2[1], dir);
  const k4 = rhs(sys, x + dt * k3[0], v + dt * k3[1], dir);
  return [
    x + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    v + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    th + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
  ];
}

/** A fresh state: at x, moving with velocity v (m/s along x), no thermal energy yet. */
export const state = (x, v = 0) => ({ x, v, th: 0, t: 0, rest: false });

/**
 * Advance the state by dt (in place), in `sub` RK4 steps. With friction, a
 * step in which the velocity would change sign is cut where it reaches zero;
 * the particle then stays at rest if |conservative force| ≤ friction.
 */
export function advance(sys, s, dt, sub = 20) {
  const h0 = dt / sub;
  let left = dt;
  for (let guard = 0; left > 1e-15 && guard < 4 * sub; guard++) {
    if (s.rest) { s.t += left; return s; }
    const h = Math.min(h0, left);
    let dir = sgn(s.v);
    const f = sys.friction(s.x);
    if (dir === 0) {
      const Fc = force(sys, s.x);
      if (sys.hasFriction && Math.abs(Fc) <= f) { s.rest = f > 0 || Fc === 0; if (s.rest) continue; }
      dir = sgn(Fc);
    }
    const next = rk4(sys, s.x, s.v, s.th, h, dir);
    if (sys.hasFriction && f > 0 && dir !== 0 && sgn(next[1]) !== dir) {
      // stopped inside this step: find when the velocity reaches zero
      let lo = 0, hi = h;
      for (let k = 0; k < 50; k++) { const mid = (lo + hi) / 2; if (sgn(rk4(sys, s.x, s.v, s.th, mid, dir)[1]) === dir) lo = mid; else hi = mid; }
      const r = rk4(sys, s.x, s.v, s.th, hi, dir);
      s.x = r[0]; s.v = 0; s.th = r[2]; s.t += hi; left -= hi;
      const Fc = force(sys, s.x);
      if (Math.abs(Fc) <= sys.friction(s.x)) s.rest = true;
      continue;
    }
    [s.x, s.v, s.th] = next;
    s.t += h; left -= h;
  }
  return s;
}

/** Energies of the state: { K, U, th, E (mechanical), total }. */
export function energies(sys, s) {
  const K = kinetic(sys, s), U = sys.U(s.x);
  return { K, U, th: s.th, E: K + U, total: K + U + s.th };
}

/**
 * Keep a frictionless motion exactly on its energy E: rescale the speed so
 * that K = E − U (where that is positive). Long animations then never drift.
 */
export function project(sys, s, E) {
  const K = E - sys.U(s.x);
  if (!(K > 0) || s.v === 0) return s;
  const w = sys.h ? 1 + sys.dh(s.x) ** 2 : 1;
  s.v = Math.sign(s.v) * Math.sqrt((2 * K) / (sys.m * w));
  return s;
}
