// Series for Calculus II: Taylor coefficients of the standard functions about
// any centre (by exact formulas or exact recurrences — no numerical
// differentiation), their radii of convergence from the nearest complex
// singularity, the Riemann zeta function by Euler–Maclaurin summation, and the
// complete elliptic integral K by the arithmetic–geometric mean (the exact
// period of a pendulum).

export type TaylorFn = 'exp' | 'sin' | 'cos' | 'log1p' | 'geom' | 'atan' | 'lorentz' | 'sqrt1p' | 'gauss' | 'cosh';

/** f itself, for plotting against its polynomials. */
export const TAYLOR_F: Record<TaylorFn, (x: number) => number> = {
  exp: Math.exp, sin: Math.sin, cos: Math.cos, cosh: Math.cosh,
  log1p: (x) => (x > -1 ? Math.log1p(x) : NaN),
  geom: (x) => 1 / (1 - x),
  atan: Math.atan,
  lorentz: (x) => 1 / (1 + x * x),
  sqrt1p: (x) => (x >= -1 ? Math.sqrt(1 + x) : NaN),
  gauss: (x) => Math.exp(-x * x),
};

/** Where f is defined and smooth on the real line (the centre must be inside). */
export const TAYLOR_DOMAIN: Record<TaylorFn, [number, number]> = {
  exp: [-Infinity, Infinity], sin: [-Infinity, Infinity], cos: [-Infinity, Infinity], cosh: [-Infinity, Infinity],
  log1p: [-1, Infinity], geom: [-Infinity, 1], atan: [-Infinity, Infinity], lorentz: [-Infinity, Infinity],
  sqrt1p: [-1, Infinity], gauss: [-Infinity, Infinity],
};

/** Coefficients c_0..c_N of f(x) = Σ c_n (x − a)^n. */
export function taylorCoeffs(fn: TaylorFn, a: number, N: number): number[] {
  const c: number[] = new Array(N + 1).fill(0);
  let fact = 1;
  switch (fn) {
    case 'exp': { const ea = Math.exp(a); for (let n = 0; n <= N; n++) { if (n) fact *= n; c[n] = ea / fact; } break; }
    case 'sin': for (let n = 0; n <= N; n++) { if (n) fact *= n; c[n] = Math.sin(a + (n * Math.PI) / 2) / fact; } break;
    case 'cos': for (let n = 0; n <= N; n++) { if (n) fact *= n; c[n] = Math.cos(a + (n * Math.PI) / 2) / fact; } break;
    case 'cosh': for (let n = 0; n <= N; n++) { if (n) fact *= n; c[n] = (n % 2 ? Math.sinh(a) : Math.cosh(a)) / fact; } break;
    case 'log1p': { c[0] = Math.log1p(a); const u = 1 + a; for (let n = 1; n <= N; n++) c[n] = ((n % 2 ? 1 : -1) / n) / Math.pow(u, n); break; }
    case 'geom': for (let n = 0; n <= N; n++) c[n] = 1 / Math.pow(1 - a, n + 1); break;
    case 'lorentz': case 'atan': {
      // 1/(1 + x²) = Im[1/(x − i)]·… : expand 1/(x − i) and 1/(x + i) about a with complex arithmetic
      // 1/(1+x²) = (1/(2i)) (1/(x − i) − 1/(x + i)); 1/(x − z) = −Σ (x − a)^n / (z − a)^{n+1}
      const d: number[] = [];
      for (let n = 0; n <= N; n++) {
        // (z − a)^{-(n+1)} for z = i: modulus ρ^{-(n+1)}, argument −(n+1)·arg(i − a)
        const rho = Math.hypot(a, 1), th = Math.atan2(1, -a);
        const mag = Math.pow(rho, -(n + 1)), ang = -(n + 1) * th;
        // −(i − a)^{-(n+1)} + (−i − a)^{-(n+1)} = −2i·Im[(i − a)^{-(n+1)}]; times 1/(2i) → −Im
        d.push(-mag * Math.sin(ang));
      }
      if (fn === 'lorentz') for (let n = 0; n <= N; n++) c[n] = d[n];
      else { c[0] = Math.atan(a); for (let n = 1; n <= N; n++) c[n] = d[n - 1] / n; }
      break;
    }
    case 'sqrt1p': { const u = 1 + a; let binom = 1; for (let n = 0; n <= N; n++) { c[n] = Math.sqrt(u) * binom / Math.pow(u, n); binom *= (0.5 - n) / (n + 1); } break; }
    case 'gauss': {
      // f′ = −2x f: (n + 1) c_{n+1} = −2 (a c_n + c_{n−1})
      c[0] = Math.exp(-a * a);
      for (let n = 0; n < N; n++) c[n + 1] = (-2 * (a * c[n] + (n ? c[n - 1] : 0))) / (n + 1);
      break;
    }
  }
  return c;
}

/** Radius of convergence about a: the distance to the nearest singularity in the complex plane. */
export function taylorRadius(fn: TaylorFn, a: number): number {
  switch (fn) {
    case 'log1p': case 'sqrt1p': return Math.abs(1 + a);
    case 'geom': return Math.abs(1 - a);
    case 'atan': case 'lorentz': return Math.hypot(a, 1);
    default: return Infinity;
  }
}

/** Σ c_n (x − a)^n by Horner's rule. */
export function evalTaylor(c: number[], a: number, x: number, N = c.length - 1): number {
  const t = x - a;
  let s = 0;
  for (let n = N; n >= 0; n--) s = s * t + c[n];
  return s;
}

/** sup |f^(N+1)| on the interval between a and x, for the Lagrange remainder bound (entire functions only). */
export function derivativeBound(fn: TaylorFn, a: number, x: number, N: number): number | null {
  const lo = Math.min(a, x), hi = Math.max(a, x);
  if (fn === 'sin' || fn === 'cos') return 1;
  if (fn === 'exp') return Math.exp(hi);
  if (fn === 'cosh') return Math.cosh(Math.max(Math.abs(lo), Math.abs(hi)));
  void N;
  return null;
}

const BERNOULLI_2K = [1 / 6, -1 / 30, 1 / 42, -1 / 30, 5 / 66, -691 / 2730, 7 / 6, -3617 / 510];

/** ζ(p) = Σ 1/n^p for real p > 1, by Euler–Maclaurin (relative error ~1e−15). */
export function zeta(p: number): number {
  if (!(p > 1)) return Infinity;
  const N = 12;
  let s = 0;
  for (let n = 1; n < N; n++) s += Math.pow(n, -p);
  s += Math.pow(N, 1 - p) / (p - 1) + Math.pow(N, -p) / 2;
  // Σ B_2k/(2k)! · p(p+1)…(p+2k−2) · N^{−p−2k+1}
  let rising = p, fact = 2;
  for (let k = 1; k <= BERNOULLI_2K.length; k++) {
    s += (BERNOULLI_2K[k - 1] / fact) * rising * Math.pow(N, -p - 2 * k + 1);
    rising *= (p + 2 * k - 1) * (p + 2 * k);
    fact *= (2 * k + 1) * (2 * k + 2);
  }
  return s;
}

/** The tail Σ_{n>N} 1/n^p = ζ(p) − S_N, computed directly by Euler–Maclaurin at N (no cancellation). */
export function zetaTail(p: number, N: number): number {
  if (!(p > 1)) return Infinity;
  if (N < 12) { let s = zeta(p); for (let n = 1; n <= N; n++) s -= Math.pow(n, -p); return s; }
  // Σ_{n=N+1}^∞ n^{-p} = ∫_N^∞ x^{-p} dx − N^{-p}/2 + Σ B_2k/(2k)! (p)_{2k−1} N^{−p−2k+1}
  let s = Math.pow(N, 1 - p) / (p - 1) - Math.pow(N, -p) / 2;
  let rising = p, fact = 2;
  for (let k = 1; k <= 4; k++) {
    s += (BERNOULLI_2K[k - 1] / fact) * rising * Math.pow(N, -p - 2 * k + 1);
    rising *= (p + 2 * k - 1) * (p + 2 * k);
    fact *= (2 * k + 1) * (2 * k + 2);
  }
  return s;
}

/** The Euler–Mascheroni constant γ = lim (H_N − ln N). */
export const EULER_GAMMA = 0.5772156649015329;

/** Arithmetic–geometric mean. */
export function agm(a: number, b: number): number {
  for (let i = 0; i < 60 && Math.abs(a - b) > 1e-16 * Math.abs(a); i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return (a + b) / 2;
}

/** Complete elliptic integral of the first kind K(k) = ∫_0^{π/2} dθ / √(1 − k² sin²θ), 0 ≤ k < 1. */
export function ellipticK(k: number): number {
  if (!(k >= 0 && k < 1)) return Infinity;
  return Math.PI / (2 * agm(1, Math.sqrt(1 - k * k)));
}

/** Exact period of a pendulum released from rest at amplitude θ0 (radians, < π): T = 4 √(L/g) K(sin(θ0/2)). */
export function pendulumPeriod(theta0: number, L = 1, g = 9.81): number {
  return 4 * Math.sqrt(L / g) * ellipticK(Math.sin(Math.abs(theta0) / 2));
}

/** The period's own series in the amplitude: T/T0 = Σ [(2n)!/(2^{2n} (n!)²)]² k^{2n},  k = sin(θ0/2). */
export function pendulumPeriodSeries(theta0: number, terms: number): number {
  const k2 = Math.sin(theta0 / 2) ** 2;
  let s = 0, coef = 1, pk = 1;
  for (let n = 0; n < terms; n++) { s += coef * coef * pk; coef *= (2 * n + 1) / (2 * n + 2); pk *= k2; }
  return s;
}

/**
 * Σ_{k≥0} (−1)^k a_k for a slowly alternating series, by the Cohen–Rodriguez
 * Villegas–Zagier acceleration (error ~ 5.8^{−n}; n = 24 gives ~1e−16 for
 * completely monotone a_k such as 1/(k+1)^p).
 */
export function alternatingSum(a: (k: number) => number, n = 24): number {
  let d = Math.pow(3 + Math.sqrt(8), n);
  d = (d + 1 / d) / 2;
  let b = -1, c = -d, s = 0;
  for (let k = 0; k < n; k++) { c = b - c; s += c * a(k); b = ((k + n) * (k - n) * b) / ((k + 0.5) * (k + 1)); }
  return s / d;
}

/** Dirichlet eta η(p) = Σ (−1)^{n+1}/n^p, for every p > 0 (η(1) = ln 2). */
export function eta(p: number): number { return alternatingSum((k) => Math.pow(k + 1, -p)); }

/** ln n! by summing logarithms (exact enough for n in the thousands). */
const LF: number[] = [0];
export function logFactorial(n: number): number { for (let k = LF.length; k <= n; k++) LF.push(LF[k - 1] + Math.log(k)); return LF[n]; }
