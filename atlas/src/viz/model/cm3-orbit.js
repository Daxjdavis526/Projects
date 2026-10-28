// Central-force orbits in the reduced one-body problem, DOM-free (behind the
// cm3-orbit simulation; tested in test/cm3-orbit.test.mjs). Units: μ = 1 and
// the force constant k = 1, so a length scale is set by ℓ.
//   kepler  F = −1/r²                 U = −1/r
//   power   F = −rⁿ (n > −3)          U = rⁿ⁺¹/(n + 1), or ln r when n = −1
//   gr      F = −1/r² − 3δℓ²/r⁴       U = −1/r − δℓ²/r³ — the Schwarzschild
//           correction to the effective potential, with δ = GM/c² (G = M = 1)
// U_eff(r) = U(r) + ℓ²/(2r²). The orbit comes from Binet's equation in u = 1/r,
//   u″ + u = −F(1/u) / (ℓ²u²)   (′ = d/dφ),
// integrated with RK4 from the inner turning point (periapsis); the time along
// it from dt = r² dφ / ℓ.

export const LAWS = ['kepler', 'power', 'gr'];

/** The force law: U(r), F(r) (radial, + outward), U at infinity, and n. */
export function law({ force = 'kepler', n = -2, L = 1, delta = 0 } = {}) {
  if (force === 'gr') {
    const d = delta, L2 = L * L;
    return { U: (r) => -1 / r - (d * L2) / r ** 3, F: (r) => -1 / r ** 2 - (3 * d * L2) / r ** 4, Uinf: 0, n: -2 };
  }
  const k = force === 'kepler' ? -2 : n;
  if (Math.abs(k + 1) < 1e-12) return { U: (r) => Math.log(r), F: (r) => -1 / r, Uinf: Infinity, n: -1 };
  return { U: (r) => r ** (k + 1) / (k + 1), F: (r) => -(r ** k), Uinf: k < -1 ? 0 : Infinity, n: k };
}

export const ueff = (lw, L) => (r) => lw.U(r) + (L * L) / (2 * r * r);

/** Radius of the circular orbit (the minimum of U_eff), and of the barrier top (gr only, else null). */
export function circular(P) {
  const L = P.L;
  if (P.force === 'gr') {
    const L2 = L * L, disc = L2 * L2 - 12 * P.delta * L2;
    if (!(disc > 0)) return { rc: null, rb: null };
    return { rc: (L2 + Math.sqrt(disc)) / 2, rb: (L2 - Math.sqrt(disc)) / 2 };
  }
  const n = P.force === 'kepler' ? -2 : P.n;
  return { rc: L ** (2 / (n + 3)), rb: null };
}

function bisect(f, a, b) {
  let fa = f(a);
  for (let i = 0; i < 200; i++) {
    const m = 0.5 * (a + b), fm = f(m);
    if (fm === 0) return m;
    if (fa * fm < 0) b = m; else { a = m; fa = fm; }
    if (Math.abs(b - a) < 1e-14 * Math.max(1, Math.abs(m))) break;
  }
  return 0.5 * (a + b);
}

/**
 * Turning points for energy E: { rc, Emin, rp, ra, fate } — rp the inner turning
 * point (null if the body falls to the centre), ra the outer (null if it escapes);
 * fate 'bound' | 'circle' | 'escape' | 'plunge'. E below the well's floor is raised to it.
 */
export function turning(P) {
  const lw = law(P), V = ueff(lw, P.L);
  const { rc, rb } = circular(P);
  if (rc === null) return { rc: null, Emin: null, E: P.E, rp: null, ra: null, fate: 'plunge', rb: null, Ebar: null };
  const Emin = V(rc);
  const E = Math.max(P.E, Emin);
  const g = (r) => V(r) - E;
  const tiny = 1e-10 * Math.max(1, Math.abs(Emin));
  if (E - Emin <= tiny) return { rc, Emin, E, rp: rc, ra: rc, fate: 'circle', rb, Ebar: rb ? V(rb) : null };
  // inner side
  let rp = null;
  const Ebar = rb ? V(rb) : null;
  if (rb !== null) { if (E < Ebar) rp = bisect(g, rb, rc); }
  else { let a = rc; for (let i = 0; i < 400 && g(a) <= 0; i++) a *= 0.5; rp = bisect(g, a, rc); }
  // outer side
  let ra = null;
  if (E < lw.Uinf) { let b = rc; for (let i = 0; i < 400 && g(b) <= 0; i++) b *= 2; ra = bisect(g, rc, b); }
  const fate = rp === null ? 'plunge' : ra === null ? 'escape' : 'bound';
  return { rc, Emin, E, rp, ra, fate, rb, Ebar };
}

/**
 * The orbit. Options: turns (how many 2π of φ to integrate for a bound orbit),
 * steps (per 2π), rfar (stop an escaping orbit beyond this), rin (stop a plunge
 * inside this). Returns { pts: [[x, y]], r, phi, t, ...turning, apsidal, advance }.
 * The body starts at periapsis on the +x axis moving anticlockwise (a plunging one
 * at apoapsis); an escaping orbit is returned whole, inbound leg first.
 */
export function orbit(P, { turns = 3, steps = 1440, rfar = null, rin = null } = {}) {
  const tp = turning(P);
  const lw = law(P), L = P.L, L2 = L * L;
  const acc = (u) => -lw.F(1 / u) / (L2 * u * u) - u;    // u″ = −F/(ℓ²u²) − u
  const h = (2 * Math.PI) / steps;
  const out = { ...tp, pts: [], r: [], phi: [], t: [], apsidal: null, advance: null };
  if (tp.rc === null && tp.fate === 'plunge' && tp.rp === null && tp.ra === null) return out;
  const start = tp.rp ?? tp.ra;
  const far = rfar ?? (tp.ra ? 50 * tp.ra : 60 * tp.rp);
  const near = rin ?? (P.force === 'gr' ? 2 * P.delta : 1e-3 * (tp.rc || start));
  let u = 1 / start, w = 0, phi = 0, t = 0;
  const maxN = tp.fate === 'bound' || tp.fate === 'circle' ? Math.round(turns * steps) : 40 * steps;
  const R = [1 / u], PH = [0], T = [0];
  let prevW = 0;
  for (let i = 0; i < maxN; i++) {
    const k1u = w, k1w = acc(u);
    const k2u = w + 0.5 * h * k1w, k2w = acc(u + 0.5 * h * k1u);
    const k3u = w + 0.5 * h * k2w, k3w = acc(u + 0.5 * h * k2u);
    const k4u = w + h * k3w, k4w = acc(u + h * k3u);
    const u1 = u + (h / 6) * (k1u + 2 * k2u + 2 * k3u + k4u);
    const w1 = w + (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
    if (!(u1 > 0) || 1 / u1 > far) break;
    t += 0.5 * h * (1 / (u * u) + 1 / (u1 * u1)) / L;
    phi += h; u = u1;
    // the first apoapsis: u′ crosses zero going up (from the periapsis start)
    if (out.apsidal === null && tp.fate === 'bound' && prevW < 0 && w1 >= 0) out.apsidal = phi - h * (w1 / (w1 - prevW));
    prevW = w1; w = w1;
    R.push(1 / u); PH.push(phi); T.push(t);
    if (1 / u < near) break;
  }
  if (tp.fate === 'circle' || (tp.fate === 'bound' && out.apsidal === null)) out.apsidal = smallApsidal(P, tp.rc);
  if (out.apsidal !== null) out.advance = 2 * out.apsidal - 2 * Math.PI;
  if (tp.fate === 'escape') {
    // the inbound leg is the mirror image of the outbound one
    const n = R.length;
    for (let i = n - 1; i > 0; i--) { out.r.push(R[i]); out.phi.push(-PH[i]); out.t.push(-T[i]); }
    for (let i = 0; i < n; i++) { out.r.push(R[i]); out.phi.push(PH[i]); out.t.push(T[i]); }
  } else { out.r = R; out.phi = PH; out.t = T; }
  out.pts = out.r.map((r, i) => [r * Math.cos(out.phi[i]), r * Math.sin(out.phi[i])]);
  return out;
}

/** The apsidal angle of a nearly circular orbit at rc: π / √(3 + rF′/F). */
export function smallApsidal(P, rc) {
  const F = law(P).F, h = 1e-5 * rc;
  const dF = (F(rc + h) - F(rc - h)) / (2 * h);
  const q = 3 + (rc * dF) / F(rc);
  return q > 0 ? Math.PI / Math.sqrt(q) : null;
}

/** The power-law formula for a nearly circular orbit: π/√(3 + n). */
export const apsidalFormula = (n) => Math.PI / Math.sqrt(3 + n);

/** Kepler-orbit elements for μ = k = 1: semi-latus rectum p = ℓ², e = √(1 + 2Eℓ²), a = −1/(2E). */
export function keplerElements(E, L) {
  const p = L * L, e = Math.sqrt(Math.max(0, 1 + 2 * E * L * L));
  return { p, e, a: E < 0 ? -1 / (2 * E) : null, rp: p / (1 + e), ra: e < 1 ? p / (1 - e) : null };
}
