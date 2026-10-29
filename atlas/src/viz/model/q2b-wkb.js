// The WKB approximation against the exact bound states of one-dimensional
// wells, for the q2b-wkb simulation and the PHYS 4710 WKB lessons. DOM-free.
//
// Units: ħ = m = 1, so the Schrödinger equation reads −½ψ″ + Vψ = Eψ and the
// local momentum is p(x) = √(2(E − V)). Five wells:
//   harmonic  V = x²/2                    (soft both sides; exact Eₙ = n + ½)
//   linear    V = |x|                     (soft both sides; exact from Airy zeros)
//   quartic   V = x⁴/2                    (soft both sides)
//   bouncer   V = x for x > 0, a hard wall at x = 0   (exact Eₙ = −aₙ/2^{1/3})
//   tilt      an infinite well on [0, π] with a sloping floor V = F·x
// Levels are labelled the textbook way: n = 0, 1, 2 … for the soft wells (so
// ∮p dx = (n + ½)h for the harmonic oscillator), n = 1, 2, … for the walled ones.
// Internally a level is its number of nodes.
//
// WKB quantization: ∫ p dx between the turning points = π(nodes + ν), where
// ν = ½ for two soft turning points, ¾ for one wall and one soft point, 1 for
// two walls (each soft point costs a quarter of a wavelength, π/4, in phase).
// Exact levels: Numerov integration with node counting and bisection.

export const AI0 = 0.355028053887817239;          // Ai(0)
export const AIP0 = -0.258819403792806798;        // Ai′(0)
const SQPI = Math.sqrt(Math.PI);

export const POTS = {
  harmonic: { label: 'harmonic: V = x²/2', V: (x) => 0.5 * x * x, xa: -11, xb: 11, wallL: false, wallR: false, first: 0, nmax: 14 },
  linear: { label: 'linear: V = |x|', V: (x) => Math.abs(x), xa: -17, xb: 17, wallL: false, wallR: false, first: 0, nmax: 14 },
  quartic: { label: 'quartic: V = x⁴/2', V: (x) => 0.5 * x ** 4, xa: -4.6, xb: 4.6, wallL: false, wallR: false, first: 0, nmax: 14 },
  bouncer: { label: 'bouncer: V = x, wall at 0', V: (x) => x, xa: 0, xb: 17, wallL: true, wallR: false, first: 1, nmax: 15 },
  tilt: { label: 'box on [0, π] with floor F·x', V: (x, F) => F * x, xa: 0, xb: Math.PI, wallL: true, wallR: true, first: 1, nmax: 12 },
};

/** The potential of a well as a function of x (F is the tilt's slope). */
export const potential = (pot, F = 0) => (x) => POTS[pot].V(x, F);

/** Bisection for a root of f on [a, b] (f(a), f(b) of opposite sign). */
function bisect(f, a, b, n = 200) {
  let fa = f(a);
  for (let i = 0; i < n; i++) {
    const c = 0.5 * (a + b), fc = f(c);
    if (c === a || c === b) break;
    if ((fc < 0) === (fa < 0)) { a = c; fa = fc; } else b = c;
  }
  return 0.5 * (a + b);
}

/** Where the minimum of the well lies (all five wells have a single minimum). */
const xMin = (pot) => (pot === 'bouncer' || pot === 'tilt' ? 0 : 0);

/**
 * The classically allowed region at energy E: [x1, x2], with soft1/soft2
 * telling whether each end is a soft turning point (true) or a wall (false).
 */
export function turning(pot, E, F = 0) {
  const P = POTS[pot], V = potential(pot, F), x0 = xMin(pot);
  if (E <= V(x0)) return null;
  let x1, x2, soft1, soft2;
  if (P.wallL && V(P.xa) < E) { x1 = P.xa; soft1 = false; } else { x1 = bisect((x) => V(x) - E, P.xa, x0); soft1 = true; }
  if (P.wallR && V(P.xb) < E) { x2 = P.xb; soft2 = false; } else { x2 = bisect((x) => E - V(x), x0, P.xb); soft2 = true; }
  return { x1, x2, soft1, soft2 };
}

// Gauss–Legendre nodes on [−1, 1] (40 points), built once by Newton's method
const GL = (() => {
  const n = 40, xs = [], ws = [];
  for (let i = 1; i <= n; i++) {
    let x = Math.cos((Math.PI * (i - 0.25)) / (n + 0.5)), dp = 0;
    for (let it = 0; it < 100; it++) {
      let p0 = 1, p1 = x;
      for (let k = 2; k <= n; k++) { const p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; }
      dp = (n * (x * p1 - p0)) / (x * x - 1);
      const dx = p1 / dp; x -= dx;
      if (Math.abs(dx) < 1e-15) break;
    }
    xs.push(x); ws.push(2 / ((1 - x * x) * dp * dp));
  }
  return { xs, ws };
})();

/**
 * ∫ f(x) dx over [a, b] where f may have inverse-square-root or square-root
 * behaviour at the ends: substitute x = c − d cos θ (θ from 0 to π), which
 * makes both ends smooth, and use Gauss–Legendre in θ (in several panels).
 */
export function endIntegral(f, a, b, panels = 8) {
  const c = 0.5 * (a + b), d = 0.5 * (b - a);
  let s = 0;
  for (let k = 0; k < panels; k++) {
    const t0 = (Math.PI * k) / panels, t1 = (Math.PI * (k + 1)) / panels, tm = 0.5 * (t0 + t1), th = 0.5 * (t1 - t0);
    for (let i = 0; i < GL.xs.length; i++) {
      const t = tm + th * GL.xs[i];
      s += GL.ws[i] * th * f(c - d * Math.cos(t)) * d * Math.sin(t);
    }
  }
  return s;
}

/** ∫ p dx across the allowed region at energy E. */
export function action(pot, E, F = 0) {
  const T = turning(pot, E, F);
  if (!T) return 0;
  const V = potential(pot, F);
  return endIntegral((x) => Math.sqrt(Math.max(0, 2 * (E - V(x)))), T.x1, T.x2);
}

/** ∫ dx/p across the allowed region: half the classical period. */
export function halfPeriod(pot, E, F = 0) {
  const T = turning(pot, E, F);
  const V = potential(pot, F);
  return endIntegral((x) => 1 / Math.sqrt(Math.max(1e-300, 2 * (E - V(x)))), T.x1, T.x2);
}

/** ν in ∫p dx = π(nodes + ν). */
export function maslov(T) { return 1 - ((T.soft1 ? 1 : 0) + (T.soft2 ? 1 : 0)) / 4; }

/** The WKB energy of the level with the given number of nodes. */
export function wkbLevel(pot, nodes, F = 0) {
  const V = potential(pot, F);
  const Emin = V(xMin(pot)) + 1e-12;
  const g = (E) => { const T = turning(pot, E, F); return action(pot, E, F) - Math.PI * (nodes + maslov(T)); };
  let hi = Emin + 1;
  while (g(hi) < 0) hi = Emin + 2 * (hi - Emin);
  // the walled box changes ν where E crosses the top of the floor, so g can jump there; bisection still lands on the crossing
  return bisect(g, Emin, hi, 100);
}

// ── exact levels by Numerov ──
const NGRID = 6000;

/** Numerov from x[from] towards x[to] for ψ″ = 2(V − E)ψ, ψ = 0 at the start; returns ψ and the node count. */
function numerov(xs, Vs, E, from, to) {
  const h = xs[1] - xs[0], h2 = (h * h) / 12, dir = to > from ? 1 : -1;
  const n = xs.length, psi = new Float64Array(n);
  psi[from] = 0; psi[from + dir] = 1e-12;
  let nodes = 0;
  const g = (i) => 2 * (Vs[i] - E);
  for (let i = from + dir; i !== to; i += dir) {
    const a = 1 - h2 * g(i + dir), b = 2 * psi[i] * (1 + 5 * h2 * g(i)), c = psi[i - dir] * (1 - h2 * g(i - dir));
    psi[i + dir] = (b - c) / a;
    if (Math.abs(psi[i + dir]) > 1e200) for (let j = from; j !== i + 2 * dir; j += dir) psi[j] *= 1e-200;
    if ((psi[i + dir] < 0) !== (psi[i] < 0)) nodes++;
  }
  return { psi, nodes };
}

const gridCache = new Map();
function grid(pot, F) {
  const key = `${pot}|${F}`;
  if (gridCache.has(key)) return gridCache.get(key);
  const P = POTS[pot], V = potential(pot, F), xs = new Float64Array(NGRID + 1), Vs = new Float64Array(NGRID + 1);
  for (let i = 0; i <= NGRID; i++) { xs[i] = P.xa + ((P.xb - P.xa) * i) / NGRID; Vs[i] = V(xs[i]); }
  const g = { xs, Vs };
  if (gridCache.size > 40) gridCache.clear();
  gridCache.set(key, g);
  return g;
}

/** Nodes of the solution started at the left end (ψ = 0) at energy E: the number of levels below E. */
function countBelow(pot, E, F) {
  const { xs, Vs } = grid(pot, F);
  return numerov(xs, Vs, E, 0, xs.length - 1).nodes;
}

const levelCache = new Map();
/** The exact energy of the level with the given number of nodes. */
export function exactLevel(pot, nodes, F = 0) {
  const key = `${pot}|${F}|${nodes}`;
  if (levelCache.has(key)) return levelCache.get(key);
  const Ew = wkbLevel(pot, nodes, F);
  const V = potential(pot, F), Emin = V(xMin(pot));
  let lo = Emin, hi = Ew;
  while (countBelow(pot, hi, F) <= nodes) hi = Emin + 1.5 * (hi - Emin) + 0.1;
  while (countBelow(pot, lo, F) > nodes) lo = Emin + 0.5 * (lo - Emin);
  for (let i = 0; i < 80; i++) {
    const c = 0.5 * (lo + hi);
    if (c === lo || c === hi) break;
    if (countBelow(pot, c, F) > nodes) hi = c; else lo = c;
  }
  const E = 0.5 * (lo + hi);
  if (levelCache.size > 400) levelCache.clear();
  levelCache.set(key, E);
  return E;
}

/**
 * The exact normalized wave function at an eigenvalue E: integrated in from
 * both ends and joined (least squares over a window) near the right turning
 * point. Returns { xs, ys } on the model grid; the first lobe is positive.
 */
export function exactPsi(pot, E, F = 0) {
  const { xs, Vs } = grid(pot, F), n = xs.length;
  const L = numerov(xs, Vs, E, 0, n - 1).psi, R = numerov(xs, Vs, E, n - 1, 0).psi;
  const T = turning(pot, E, F);
  const P = POTS[pot];
  const xm = T.soft2 ? T.x2 : 0.5 * (T.x1 + T.x2);
  const im = Math.max(2, Math.min(n - 3, Math.round(((xm - P.xa) / (P.xb - P.xa)) * (n - 1))));
  const w = Math.max(3, Math.round(0.03 * n));
  let sLR = 0, sRR = 0;
  for (let i = Math.max(1, im - w); i <= Math.min(n - 2, im + w); i++) { sLR += L[i] * R[i]; sRR += R[i] * R[i]; }
  const s = sRR > 0 ? sLR / sRR : 1;
  const ys = new Float64Array(n);
  for (let i = 0; i < n; i++) ys[i] = i <= im ? L[i] : s * R[i];
  // normalize, and make the first lobe positive
  const h = xs[1] - xs[0];
  let norm = 0;
  for (let i = 0; i < n; i++) norm += ys[i] * ys[i] * h;
  norm = Math.sqrt(norm);
  let i1 = 0;
  while (i1 < n - 1 && xs[i1] < T.x1) i1++;
  let best = i1;
  for (let i = i1; i < n && xs[i] < T.x1 + 0.6 * (T.x2 - T.x1); i++) { if (Math.abs(ys[i]) > Math.abs(ys[best])) best = i; if (i > i1 + 2 && Math.abs(ys[i]) < Math.abs(ys[best]) * 0.5) break; }
  const sign = ys[best] < 0 ? -1 : 1;
  for (let i = 0; i < n; i++) ys[i] *= sign / norm;
  return { xs, ys };
}

/**
 * The WKB wave function at energy E on the points xs (normalized so the
 * oscillating part carries unit probability): (2C/√p) cos(φ − α) inside, with
 * φ = ∫ from x1 of p dx and α = π/4 after a soft turning point (π/2 after a
 * wall); (C/√|p|) e^{−∫|p| dx} beyond a soft turning point, with the sign
 * (−1)^nodes on the right. At the turning points themselves it diverges.
 */
export function wkbPsi(pot, E, xs, F = 0, nodes = 0) {
  const T = turning(pot, E, F), V = potential(pot, F);
  const C = 1 / Math.sqrt(2 * halfPeriod(pot, E, F));
  const aL = T.soft1 ? Math.PI / 4 : Math.PI / 2;
  const phi = (x) => endIntegral((u) => Math.sqrt(Math.max(0, 2 * (E - V(u)))), T.x1, x, 2);
  const kap = (a, b) => endIntegral((u) => Math.sqrt(Math.max(0, 2 * (V(u) - E))), a, b, 2);
  const sgnR = nodes % 2 ? -1 : 1;
  return Array.from(xs, (x) => {
    if (x < T.x1) return T.soft1 ? C / Math.sqrt(Math.sqrt(2 * (V(x) - E))) * Math.exp(-kap(x, T.x1)) : 0;
    if (x > T.x2) return T.soft2 ? (sgnR * C) / Math.sqrt(Math.sqrt(2 * (V(x) - E))) * Math.exp(-kap(T.x2, x)) : 0;
    const p = Math.sqrt(2 * (E - V(x)));
    return ((2 * C) / Math.sqrt(p)) * Math.cos(phi(x) - aL);
  });
}

/** The WKB amplitude envelope 2C/√p inside the allowed region. */
export function wkbEnvelope(pot, E, x, F = 0) {
  const T = turning(pot, E, F), V = potential(pot, F);
  if (x <= T.x1 || x >= T.x2) return NaN;
  const C = 1 / Math.sqrt(2 * halfPeriod(pot, E, F));
  return (2 * C) / Math.sqrt(Math.sqrt(2 * (E - V(x))));
}

/** Airy function Ai(z): power series for |z| ≤ 7, asymptotic series beyond. */
export function airy(z) {
  if (Math.abs(z) <= 7) {
    let f = 1, g = z, tf = 1, tg = z;
    const z3 = z * z * z;
    for (let k = 1; k < 200; k++) {
      tf *= z3 / ((3 * k - 1) * (3 * k)); tg *= z3 / ((3 * k) * (3 * k + 1));
      f += tf; g += tg;
      if (Math.abs(tf) < 1e-18 * Math.abs(f) && Math.abs(tg) < 1e-18 * (Math.abs(g) + 1e-300)) break;
    }
    return AI0 * f + AIP0 * g;
  }
  const u1 = 5 / 72, u2 = 385 / 10368, u3 = 85085 / 2239488;
  if (z > 0) {
    const zeta = (2 / 3) * z ** 1.5;
    return (Math.exp(-zeta) / (2 * SQPI * z ** 0.25)) * (1 - u1 / zeta + u2 / zeta ** 2 - u3 / zeta ** 3);
  }
  const x = -z, zeta = (2 / 3) * x ** 1.5, ph = zeta + Math.PI / 4;
  return (Math.sin(ph) * (1 - u2 / zeta ** 2) - Math.cos(ph) * (u1 / zeta - u3 / zeta ** 3)) / (SQPI * x ** 0.25);
}

/** The WKB (leading asymptotic) forms of Ai on either side of the turning point z = 0. */
export function airyWkb(z) {
  if (z > 0) return Math.exp(-(2 / 3) * z ** 1.5) / (2 * SQPI * z ** 0.25);
  if (z < 0) { const x = -z; return Math.sin((2 / 3) * x ** 1.5 + Math.PI / 4) / (SQPI * x ** 0.25); }
  return NaN;
}

/** Level label n (as the lessons use it) ↔ nodes. */
export const nodesOf = (pot, n) => n - POTS[pot].first;
export const labelOf = (pot, nodes) => nodes + POTS[pot].first;
