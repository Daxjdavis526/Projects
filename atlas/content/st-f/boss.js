// The Numerical Methods boss, "The Convergence Court": a team's black-hole
// orbit code comes before a review panel whose one rule is that every claim
// of accuracy is backed by a convergence test. Round 1, the arithmetic: the
// gap between float64 numbers where a long run keeps its clock (F1.1); the
// digits a static clock's rate 1 − √(1 − 2M/r) loses to cancellation far from
// the mass (F1.2). Round 2, finding things: periapsis and apoapsis by
// bisection on E² − V(r) (code, F3.3); the order of the midpoint rule on the
// proper time of a fall, ½ because of the endpoint singularity (F5.1).
// Round 3, the matrices: the order and constant of a convergence plot by
// least squares (code, F8.1); power iteration on RK4's step matrix for the
// linearized radial motion, converging inside 6M and not outside (F7.1).
// Round 4, the steppers: RK4's largest stable step for the radial epicycle,
// 2√2/ω (F9.2); velocity Verlet's energy wobble (hω)²/4 there (F10.2); a
// ringdown solver run past the CFL limit and its growth factor per step
// (F11.2). Round 5, the verdict: a precession code that claims RK4 measured
// at order 2 (F13.1); a radial-fall RK4 with a third stage built from k₁ to
// fix (code, F14.1); and the normalization monitor that convicts a wrong
// Christoffel symbol (F14.3). Every case function is exported, so
// scratchpad/num4/verify-boss.mjs recomputes every key another way.
import { boss, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { ulp } from './_num.js';
import { cycloid, etaAt, tauHorizon, orbitOf, precession, apoState, geoRun, monitors, circular, epicyclic2, Veff, fall, rFall, n12, lg } from './_geo.js';

const t = String.raw;
const NB = ' ';

/** Keep only the slips whose values are finite and clearly apart from the key and from each other. */
function apart(errors, key, rel = 0.03) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v), 1e-300);
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, 0.01))) kept.push(e);
  return kept;
}
const s3 = (x) => +(+x).toPrecision(3);
const VeffPic = (L, marks, caption, o = {}) => ({
  type: 'graph',
  params: {
    x: [2, o.xmax ?? 16], y: o.y ?? [0.86, 1.0], aspect: 'wide', axesAt: 'edge', xlabel: 'r (M)', ylabel: 'V(r)',
    curves: [{ fn: `(1 - 2/x)*(1 + ${n12(L * L)}/x^2)`, color: 'gold', width: 2.2, domain: [2.02, o.xmax ?? 16] }],
    vlines: [{ x: 6, color: 'ink4', label: 'ISCO 6M' }],
    hlines: o.hlines ?? [],
    points: marks,
  },
  caption,
});

// ── round 1: the arithmetic ────────────────────────────────────────────────
/** A long run's clock: the gap between adjacent float64 numbers at proper time T (in M). */
export function ulpCase(r) {
  const T = r.pick([2.5e5, 6.4e6, 3.1e8, 9.0e9]);
  return { T, key: ulp(T), e: Math.floor(Math.log2(T)) };
}
const CLOCKS = [
  { key: 'gps', what: 'a GPS satellite, 26 560 km from the centre of the Earth', rM: 2.656e7 / 4.435e-3, mass: 'the Earth’s mass, $GM/c^2 = 4.435$ mm' },
  { key: 'sun', what: 'a probe 1 AU from the Sun', rM: 1.495978707e11 / 1476.625, mass: 'the Sun’s mass, $GM/c^2 = 1.477$ km' },
  { key: 'sgr', what: 'a star 1000 AU from Sagittarius A* (4.3 million solar masses)', rM: 1.495978707e14 / (4.3e6 * 1476.625), mass: 'Sagittarius A*’s mass, $GM/c^2 = 6.35\\times10^{6}$ km' },
];
/** The cancellation in 1 − √(1 − 2M/r): the amplification factor (1 + s)/(1 − s), s = √(1 − 2M/r). */
export function cancelCase(r) {
  const C = r.pick(CLOCKS), x = 2 / C.rM, s = Math.sqrt(1 - x), key = (1 + s) ** 2 / x;   // (1 + s)/(1 − s) without the cancellation it measures
  return { C, s, key, digits: Math.log10(key) };
}

// ── round 2: finding things ────────────────────────────────────────────────
const TP = orbitOf(11, 27);
/** Proper time of a fall from rest at R to r₁ by the midpoint rule with n panels, and its exact value. */
export function quadCase(r) {
  const R = r.pick([8, 10, 12]), r1 = r.pick([0.4, 0.5]) * R, n = r.pick([50, 100]);
  const f = (x) => 1 / Math.sqrt(2 / x - 2 / R);
  const mid = (m) => { const h = (R - r1) / m; let s = 0; for (let i = 0; i < m; i++) s += f(r1 + (i + 0.5) * h); return s * h; };
  const exact = cycloid(R).tau(Math.acos((2 * r1) / R - 1));
  const e1 = s3(Math.abs(mid(n) - exact)), e2 = s3(Math.abs(mid(2 * n) - exact));
  return { R, r1, n, exact, e1, e2, key: Math.log2(e1 / e2) };
}

// ── round 3: the matrices ──────────────────────────────────────────────────
const FIT_N = [50, 100, 200, 400, 800];
const FIT_O = orbitOf(10, 25);
const FIT_E = FIT_N.map((N) => +Math.abs(precession(10, 25, N, { method: 'verlet' }).adv - FIT_O.exact).toPrecision(10));
const FIT_H = FIT_N.map((N) => +((2 * Math.PI) / N).toPrecision(12));
/** The least-squares line through (log₁₀ h, log₁₀ e): slope p and intercept log₁₀ C, by the normal equations. */
export function lsLine(hs, es) {
  const x = hs.map(Math.log10), y = es.map(Math.log10), n = x.length;
  const mx = x.reduce((a, b) => a + b) / n, my = y.reduce((a, b) => a + b) / n;
  const p = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
  return { p, logC: my - p * mx };
}
const FIT = lsLine(FIT_H, FIT_E);

/** RK4's one-step matrix for δ″ = −ω²δ (ω² < 0 inside 6M), and power iteration on it. */
export function stepMatrix(w2, h) {
  const hA = [[0, h], [-w2 * h, 0]], mul = (X, Y) => X.map((row) => [0, 1].map((j) => row[0] * Y[0][j] + row[1] * Y[1][j]));
  let S = [[1, 0], [0, 1]], P = [[1, 0], [0, 1]], c = 1;
  for (let k = 1; k <= 4; k++) { P = mul(P, hA); c *= k; S = S.map((row, i) => row.map((v, j) => v + P[i][j] / c)); }
  return S;
}
export function powerRatios(S, n = 300) {
  let x = [1, 0];
  const out = [];
  for (let k = 0; k < n; k++) { const y = [S[0][0] * x[0] + S[0][1] * x[1], S[1][0] * x[0] + S[1][1] * x[1]], m = Math.hypot(...y); out.push(m / Math.hypot(...x)); x = y.map((v) => v / m); }
  return out;
}
export function powerCase(r) {
  const ru = r.pick([4.5, 5, 5.5]), rs = r.pick([7, 8, 10]), h = r.pick([1, 2]);
  const U = powerRatios(stepMatrix(epicyclic2(ru), h)), Sx = powerRatios(stepMatrix(epicyclic2(rs), h), 2000).slice(1000);
  return { ru, rs, h, conv: U[U.length - 1], lo: Math.min(...Sx), hi: Math.max(...Sx), lam: Math.sqrt(-epicyclic2(ru)), om: Math.sqrt(epicyclic2(rs)) };
}

// ── round 4: the steppers ──────────────────────────────────────────────────
/** RK4's largest stable step for the radial epicycle about a circular orbit at r: hω ≤ 2√2. */
export function stabCase(r) {
  const rc = r.pick([7, 8, 10, 15, 20]), om = Math.sqrt(epicyclic2(rc));
  return { rc, om, key: (2 * Math.SQRT2) / om };
}
/** Velocity Verlet's relative energy wobble (hω)²/4 for the radial epicycle. */
export function wobbleCase(r) {
  const rc = r.pick([7, 8, 9, 12]), h = r.pick([2, 5, 10]), om = Math.sqrt(epicyclic2(rc));
  return { rc, h, om, key: ((h * om) ** 2) / 4 };
}
/** Leapfrog for the wave equation past the CFL limit: the sawtooth mode's |G| per step at Courant number ν. */
export function cflCase(r) {
  const nu = r.pick([1.05, 1.1, 1.2, 1.5]), dx = r.pick([0.05, 0.1, 0.2]), b = 1 - 2 * nu * nu;
  return { nu, dx, dt: +(nu * dx).toFixed(4), key: Math.abs(b) + Math.sqrt(b * b - 1) };
}

// ── round 5: the verdict ───────────────────────────────────────────────────
/** A precession code that claims RK4 but runs velocity Verlet: three runs and their observed order. */
export function orderCase(r) {
  const [rp, ra] = r.pick([[9, 24], [10, 30], [12, 28], [11, 40]]), N = r.pick([60, 100, 150]);
  const u = [N, 2 * N, 4 * N].map((k) => +precession(rp, ra, k, { method: 'verlet' }).adv.toFixed(10));
  return { rp, ra, N, u, Q: (u[0] - u[1]) / (u[1] - u[2]), key: Math.log2((u[0] - u[1]) / (u[1] - u[2])) };
}
const BF = { R: 15, T: 50 };
const BF_EX = rFall(BF.R, BF.T), BF_E = [50, 100].map((n) => Math.abs(fall('rk4', BF.R, BF.T, n).r - BF_EX));
/** The monitors of a correct and of a buggy (Γʳᵣᵣ sign) geodesic code at steps h and h/2 over 1000M. */
export function monitorCase(r) {
  const h = r.pick([2, 1]), [rp, ra] = r.pick([[7, 16], [8, 20]]), S = apoState(rp, ra);
  const run = (hh, bug) => { const mx = { E: 0, L: 0, U: 0 }; geoRun(S.y, hh, Math.round(1000 / hh), { bug, each: (i, y) => { const m = monitors(y); mx.E = Math.max(mx.E, Math.abs(m.E - S.E)); mx.L = Math.max(mx.L, Math.abs(m.L - S.L)); mx.U = Math.max(mx.U, Math.abs(m.uu + 1)); } }); return mx; };
  return { h, rp, ra, a: run(h, 'Grrr'), b: run(h / 2, 'Grrr') };
}

export default boss({
  title: 'The Convergence Court',
  intro: t`A team has written a code that follows stars and probes around a black hole ($G = c = 1$, lengths and times in units of the mass $M$), and wants to publish what it computes. The review panel — the Convergence Court — has one rule: **every claim of accuracy is backed by evidence that the error shrinks as it should**. Five exhibits, from the arithmetic up. Show the code converges at the order it claims, or find the bug.`,
  pass: 0.7,
  rounds: [
    {
      title: 'Exhibit A: the arithmetic',
      story: t`Before any method, the numbers themselves. The code keeps every quantity in IEEE double precision (float64), and the court wants to know where that is not enough.`,
      items: [
        num({
          id: 'r1-ulp', skill: 'st-f.F1.1', difficulty: 3,
          gen(r) {
            const C = ulpCase(r);
            return {
              prompt: t`An extreme-mass-ratio inspiral runs for a long time: the code’s proper-time clock reaches $\tau = ${tex(C.T)}M$, stored as a float64 and advanced by adding the step $h$ each time. What is the gap between adjacent float64 numbers near $\tau$, in units of $M$?`,
              visual: { type: 'num-float', params: { value: C.T, format: 'f64', controls: false, decode: false, microscope: false, flip: false, formats: false }, caption: 'The 64 bits of τ: sign, 11 exponent bits, 52 fraction bits.' },
              answer: C.key, tol: { rel: 0.001 },
              errors: apart([{ value: 2 ** -52, feedback: t`$2^{-52}$ is the gap just above 1. The gap scales with the number: $2^{e - 52}$ where $2^e \le \tau < 2^{e+1}$.` }, { value: C.T * 2 ** -52, feedback: t`Close, but the gap is a power of two: $2^{e-52}$ with $e = \lfloor\log_2\tau\rfloor$, not $\tau\times2^{-52}$.` }, { value: C.T * 2 ** -53, feedback: t`That is a bound on the rounding error, half a gap at most, and only roughly; the gap itself is $2^{e-52}$.` }], C.key),
              hints: [t`Float64 numbers between $2^e$ and $2^{e+1}$ are spaced $2^{e-52}$ apart.`, t`$\log_2 ${tex(C.T)} = ${Math.log2(C.T).toFixed(3)}$, so $e = ${C.e}$.`, t`The gap is $2^{${C.e} - 52} = 2^{${C.e - 52}}$.`],
              teach: 'Float64 numbers are spaced $2^{e-52}$ apart between $2^e$ and $2^{e+1}$: the absolute precision of a clock falls as it runs.',
              explain: t`$2^{${C.e}} \le ${tex(C.T)} < 2^{${C.e + 1}}$, so the gap is $2^{${C.e - 52}} = ${tex(C.key, 4)}M$. Each addition $\tau + h$ is rounded to that grid: a step of $h = 0.5M$ is now carried with a relative error up to $${tex(C.key / 2 / 0.5, 2)}$, and a step smaller than half the gap would not move the clock at all. Long runs count steps in an integer and compute $\tau = n h$, or keep the clock in two parts.`,
            };
          },
        }),
        num({
          id: 'r1-cancel', skill: 'st-f.F1.2', difficulty: 3,
          gen(r) {
            const C = cancelCase(r);
            return {
              prompt: t`The code reports how much slower a static clock runs than a distant one: $1 - \sqrt{1 - 2M/r}$, computed exactly as written. For ${C.C.what} — that is, $r = ${tex(C.C.rM, 4)}M$ in units of ${C.C.mass} — by what factor does the subtraction amplify the relative errors already in its operands?`,
              visual: {
                type: 'graph',
                params: { x: [0, 11], y: [-11, 0.2], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'r / M', ylabel: '1 − √(1 − 2M/r)',
                  curves: [{ fn: 'log10(2*10^(-x)/(1 + sqrt(1 - 2*10^(-x))))', color: 'accent', width: 2.2, domain: [0.31, 11] }] },
                caption: 'The rate deficit of a static clock against distance (computed here in the cancellation-free form). Far out it is tiny — the difference of two numbers that agree in most of their digits.',
              },
              answer: C.key, tol: { rel: 0.02 },
              errors: apart([{ value: C.key / (1 + C.s), feedback: t`That is $1/(1 - s)$, about $r/M$. The amplification factor is $(|a| + |b|)/|a - b|$: both operands count in the numerator, $1 + s \approx 2$.` }, { value: C.digits, feedback: 'That is the number of decimal digits lost, log₁₀ of the factor. The question asks for the factor itself.' }], C.key),
              hints: [t`For $a - b$ the relative error is amplified by $(|a| + |b|)/|a - b|$ ([F1.2](#/lesson/st-f.F1.2)).`, t`Here $a = 1$ and $b = s = \sqrt{1 - 2M/r}$, with $1 - s \approx M/r$ for large $r$.`, t`Factor $= (1 + s)/(1 - s) \approx 2r/M$.`],
              teach: 'Subtracting nearly equal numbers amplifies their relative errors by (|a| + |b|)/|a − b|; rewriting the formula removes the subtraction.',
              explain: t`$s = \sqrt{1 - 2M/r}$ differs from 1 by about $M/r = ${tex(1 / C.C.rM, 3)}$, so the factor is $(1 + s)/(1 - s) = ${tex(C.key, 3)}$: about $${C.digits.toFixed(1)}$ of float64’s 16 digits are lost, leaving roughly $${(16 - C.digits).toFixed(0)}$. The cure is algebra, not more bits: $1 - \sqrt{1 - x} = x/(1 + \sqrt{1 - x})$ with $x = 2M/r$ has no subtraction at all.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Exhibit B: finding things',
      story: t`An orbit code must find things that no step lands on exactly — the turning points of an orbit, the proper time of a fall — and the court checks how fast each answer converges.`,
      items: [
        code({
          id: 'r2-turning', skill: 'st-f.F3.3', difficulty: 3,
          prompt: t`The team sets up an orbit from its energy and angular momentum. Write \`bisect(g, a, b)\`, a bisection that halves the bracket until it is shorter than $10^{-12}$ and returns the midpoint. The program then finds the periapsis in $[8, 16]$ and the apoapsis in $[16, 60]$ as roots of $g(r) = E^2 - V(r)$, with $V(r) = (1 - 2M/r)(1 + L^2/r^2)$ and $M = 1$.`,
          starter: t`E2 = ${TP.E2.toPrecision(17)}       # E squared
L2 = ${TP.L2.toPrecision(17)}       # L squared

def g(r):
    return E2 - (1 - 2 / r) * (1 + L2 / r**2)

def bisect(g, a, b):
    # keep g(a) and g(b) of opposite signs; halve until b - a < 1e-12
    return 0.5 * (a + b)

rp = bisect(g, 8.0, 16.0)
ra = bisect(g, 16.0, 60.0)
print(rp, ra)
`,
          answer: t`E2 = ${TP.E2.toPrecision(17)}       # E squared
L2 = ${TP.L2.toPrecision(17)}       # L squared

def g(r):
    return E2 - (1 - 2 / r) * (1 + L2 / r**2)

def bisect(g, a, b):
    ga = g(a)
    while b - a >= 1e-12:
        m = 0.5 * (a + b)
        gm = g(m)
        if (gm > 0) == (ga > 0):
            a, ga = m, gm
        else:
            b = m
    return 0.5 * (a + b)

rp = bisect(g, 8.0, 16.0)
ra = bisect(g, 16.0, 60.0)
print(rp, ra)`,
          tests: [
            { name: 'the periapsis is at 11M', code: 'abs(rp - 11) < 1e-8' },
            { name: 'the apoapsis is at 27M', code: 'abs(ra - 27) < 1e-8' },
            { name: t`bisect also finds $\sqrt2$ as the root of $x^2 - 2$ on $[1, 2]$`, code: 'abs(bisect(lambda x: x * x - 2, 1.0, 2.0) - 2 ** 0.5) < 1e-11' },
          ],
          hints: ['Keep the sign of g at the left end, ga. Each pass: m = (a + b)/2; if g(m) has the sign of ga, move a to m; otherwise move b.', 'Loop while b − a ≥ 1e−12 (about 45 halvings of a bracket of width 40).', 'The bracket [8, 16] contains only the periapsis: V has its maximum and the third root further in, below 8M.'],
          teach: 'Bisection is slow but cannot fail once a sign change is bracketed — the safeguard inside every robust root finder, used here to set up an orbit from E and L.',
          explain: t`The roots are $r_p = 11M$ and $r_a = 27M$ to the precision of the printed $E^2$ and $L^2$; the third root of the cubic, $1/u_3 = ${(1 / TP.u3).toFixed(3)}M$, lies outside both brackets. Each pass halves the bracket, so about 45 passes reach $10^{-12}$ — one binary digit per evaluation. Newton’s method would take five or six, but needs a safeguard ([F3.3](#/lesson/st-f.F3.3)): near a turning point $g$ is flat at its maximum between the two roots, where a Newton step can fly off.`,
          visual: VeffPic(Math.sqrt(TP.L2), [], 'V(r) for this orbit’s L, with the orbit’s E² as a dashed level: the orbit lives where V(r) ≤ E², and its turning points are where the two meet.', { y: [0.9, 1.02], xmax: 40, hlines: [{ y: +n12(TP.E2), color: 'accent', label: 'E²' }] }),
        }),
        num({
          id: 'r2-quad', skill: 'st-f.F5.1', difficulty: 3,
          gen(r) {
            const C = quadCase(r);
            return {
              prompt: t`The team computes the proper time of a fall from rest at $R = ${C.R}M$ to $r = ${C.r1}M$ with the composite midpoint rule:
$$\tau = \int_{${C.r1}}^{${C.R}} \frac{dr}{\sqrt{2M/r - 2M/R}}$$
Against the exact value, $${C.exact.toFixed(5)}M$ from the cycloid, the errors are $${tex(C.e1, 3)}M$ with $${C.n}$ panels and $${tex(C.e2, 3)}M$ with $${2 * C.n}$. What order of convergence do they show?`,
              visual: {
                type: 'graph',
                params: { x: [C.r1 - 0.3, C.R + 0.4], y: [0, 9], aspect: 'wide', axesAt: 'edge', xlabel: 'r (M)', ylabel: 'integrand',
                  curves: [{ fn: `1/sqrt(2/x - 2/${C.R})`, color: 'accent', width: 2.2, domain: [C.r1, C.R - 1e-4], samples: 2000 }], vlines: [{ x: C.R, color: 'bad', label: 'r = R' }] },
                caption: 'The integrand rises without bound at r = R, where the fall starts from rest; the area under it stays finite.',
              },
              answer: C.key, tol: { rel: 0, abs: 0.03 },
              errors: apart([{ value: C.e1 / C.e2, feedback: t`That ratio is $2^p$; take $\log_2$.` }, { value: 2, feedback: 'Second order is what the midpoint rule promises for a smooth integrand. These errors fall far more slowly: compute log₂ of their ratio.' }], C.key, 0.1),
              hints: [t`$p = \log_2(e_n/e_{2n})$.`, t`$e_n/e_{2n} = ${(C.e1 / C.e2).toFixed(4)}$.`, t`Near $r = R$ the integrand behaves like $(R - r)^{-1/2}$: the panel at the end carries an error that shrinks only like $h^{1/2}$.`],
              teach: 'A rule’s order assumes a smooth integrand; an endpoint singularity (R − r)^(−1/2) cuts any Newton–Cotes rule to order ½ — and a substitution restores it.',
              explain: t`$p = \log_2 ${(C.e1 / C.e2).toFixed(4)} = ${C.key.toFixed(3)}$: order one half, set by the $(R - r)^{-1/2}$ singularity at the start of the fall. The cycloid’s substitution $r = \tfrac{R}{2}(1 + \cos\eta)$ makes the integrand $\sqrt{R^3/8M}\,(1 + \cos\eta)$, perfectly smooth, and the same rule then converges at second order (Gauss–Legendre, exponentially).`,
            };
          },
        }),
      ],
    },
    {
      title: 'Exhibit C: the matrices',
      story: t`Convergence plots are data, and data are fitted by least squares; stability is a statement about eigenvalues. The court reads both.`,
      items: [
        code({
          id: 'r3-fit', skill: 'st-f.F8.1', difficulty: 3,
          prompt: t`The team’s velocity Verlet precession errors for the orbit $(r_p, r_a) = (10, 25)M$ are below, against the step $h = 2\pi/N$. Write \`fit(h, e)\` that fits $\log_{10}e = \log_{10}C + p\log_{10}h$ by least squares — build the matrix with columns $1$ and $\log_{10}h$ and use \`np.linalg.lstsq\` (which works through an orthogonal factorization, not the normal equations) — and returns \`(p, logC)\`.`,
          starter: t`import numpy as np

h = np.array([${FIT_H.join(', ')}])
e = np.array([${FIT_E.map((v) => v.toPrecision(10)).join(', ')}])

def fit(h, e):
    # least squares for log10(e) = logC + p * log10(h)
    return 0.0, 0.0

p, logC = fit(h, e)
print(p, logC)
`,
          answer: t`import numpy as np

h = np.array([${FIT_H.join(', ')}])
e = np.array([${FIT_E.map((v) => v.toPrecision(10)).join(', ')}])

def fit(h, e):
    A = np.column_stack([np.ones_like(h), np.log10(h)])
    coef, *_ = np.linalg.lstsq(A, np.log10(e), rcond=None)
    return coef[1], coef[0]

p, logC = fit(h, e)
print(p, logC)`,
          tests: [
            { name: t`the fitted order is $p = ${FIT.p.toFixed(4)}$`, code: `abs(p - ${n12(FIT.p)}) < 1e-6` },
            { name: t`the fitted constant is $\log_{10}C = ${FIT.logC.toFixed(4)}$`, code: `abs(logC - ${n12(FIT.logC)}) < 1e-6` },
            { name: 'fit recovers an exact power law', code: 'all(abs(np.array(fit(np.array([0.1, 0.2, 0.4]), 3 * np.array([0.1, 0.2, 0.4])**4)) - np.array([4, np.log10(3)])) < 1e-9)' },
          ],
          hints: ['A = np.column_stack([np.ones_like(h), np.log10(h)]) and b = np.log10(e).', 'coef, *_ = np.linalg.lstsq(A, b, rcond=None) gives [logC, p].', 'Return coef[1], coef[0].'],
          teach: 'An order of convergence is a slope on a log–log plot; fitting it by least squares through every run is steadier than any one pair.',
          explain: t`$p = ${FIT.p.toFixed(4)}$ and $C = 10^{${FIT.logC.toFixed(3)}} = ${tex(10 ** FIT.logC, 3)}$: velocity Verlet’s second order, with error $\approx ${tex(10 ** FIT.logC, 3)}\,h^2$ rad per orbit. The fit is only as good as the asymptotic range: points from coarse, pre-asymptotic runs bend it, so look at the residuals before trusting the slope.`,
          visual: { type: 'graph', params: { x: [-2.2, -0.8], y: [-5.5, -2], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (rad)', ylabel: 'error (rad)', points: FIT_H.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(FIT_E[i])), r: 5, color: 'gold' })) }, caption: 'The five runs on log–log axes.' },
        }),
        mcq({
          id: 'r3-power', skill: 'st-f.F7.1', difficulty: 3,
          gen(r) {
            const C = powerCase(r);
            return {
              prompt: t`Linearized about a circular orbit, the radial motion is $\ddot{\delta r} = -\omega^2\,\delta r$, so one RK4 step multiplies $(\delta r, \dot{\delta r})$ by a $2\times2$ matrix $S$. The team runs power iteration on $S$ at $h = ${C.h}M$. About the circular orbit at $r = ${C.ru}M$ the ratio $\lVert Sx\rVert/\lVert x\rVert$ settles at $${C.conv.toFixed(6)}$; about the one at $r = ${C.rs}M$ it keeps swinging between $${C.lo.toFixed(3)}$ and $${C.hi.toFixed(3)}$ however long it runs. Why?`,
              visual: { type: 'num3-stability', params: { methods: ['rk4'], method: 'rk4', z: null, drag: false, panels: ['plane'], readout: false, controls: false, legend: false, x: [-0.42, 0.42], y: [-0.26, 0.26], marks: [{ z: [+n12(C.h * C.lam), 0], label: '+hλ', color: 'bad' }, { z: [+n12(-C.h * C.lam), 0], label: '−hλ', color: 'bad' }, { z: [0, +n12(C.h * C.om)], label: '+ihω', color: 'accent' }, { z: [0, +n12(-C.h * C.om)], label: '−ihω', color: 'accent' }] }, caption: `The corner of RK4’s stability region near the origin of the complex hλ-plane, with the scaled eigenvalues of the two linearized problems: a real pair ±hλ at ${C.ru}M (red), an imaginary pair ±ihω at ${C.rs}M (blue).` },
              choices: [
                t`Inside $6M$ the eigenvalues of $\delta r$’s equation are real, $\pm\lambda$, and $S$’s eigenvalues $R(\pm h\lambda)$ have different sizes, so one dominates; outside, they are $\pm i\omega$, $S$’s are a complex-conjugate pair of equal modulus, and there is no dominant eigenvalue to converge to`,
                'Outside 6M the step is unstable, so the iterates blow up and the ratios cannot settle',
                'Power iteration needs a symmetric matrix; S happens to be symmetric only inside 6M',
                'The starting vector is orthogonal to the dominant eigenvector outside 6M',
              ],
              answer: 0,
              why: {
                1: t`At these steps $|R(\pm ih\omega)|$ is just below 1: stable. The ratios swing but do not grow.`,
                2: 'Power iteration needs a dominant eigenvalue, not symmetry; S is not symmetric in either case.',
                3: 'Rounding would soon add a component along any eigenvector; and with two eigenvalues of equal modulus there is no dominant one to find.',
              },
              hints: [t`What are the eigenvalues of $\begin{pmatrix} 0 & 1 \\ -\omega^2 & 0 \end{pmatrix}$ when $\omega^2 > 0$, and when $\omega^2 < 0$?`, 'Power iteration converges at the rate |λ₂/λ₁|. What if |λ₂| = |λ₁|?', t`RK4 maps an eigenvalue $z = h\lambda$ to $R(z) = 1 + z + z^2/2 + z^3/6 + z^4/24$.`],
              teach: 'Power iteration needs one eigenvalue strictly largest in modulus; a complex-conjugate pair never has one, which is how an oscillation shows up.',
              explain: t`At $${C.ru}M$, $\lambda = ${tex(C.lam, 4)}/M$ and the dominant eigenvalue is $R(h\lambda) = ${C.conv.toFixed(6)}$, the growth per step of the unstable orbit (within $10^{-5}$ of $e^{h\lambda}$). At $${C.rs}M$ the pair $R(\pm ih\omega)$ has modulus just under 1 and rotates the iterate by about $h\omega = ${(C.h * C.om).toFixed(3)}$ rad per step, so the ratio follows the rotating vector forever. The ISCO is exactly where the eigenvalues cross from real to imaginary.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Exhibit D: the steppers',
      story: t`Now the integrators themselves: how large a step each may take, what it does to the energy, and what happens to a wave solver pushed past its limit.`,
      items: [
        num({
          id: 'r4-stability', skill: 'st-f.F9.2', difficulty: 3,
          gen(r) {
            const C = stabCase(r);
            return {
              prompt: t`A slightly perturbed circular orbit at $r = ${C.rc}M$ oscillates radially with $\omega^2 = \dfrac{M(r - 6M)}{r^3(r - 3M)}$ (proper time). RK4’s stability region meets the imaginary axis at $\pm2\sqrt2\,i$. What is the largest step, in units of $M$, for which RK4 keeps this oscillation from growing?`,
              visual: { type: 'num3-stability', params: { methods: ['rk4'], method: 'rk4', z: null, drag: false, panels: ['plane'], readout: false, controls: false, legend: false, x: [-3.4, 1.2], y: [-3.2, 3.2] }, caption: 'RK4’s region of absolute stability. An undamped oscillation puts hλ = ±ihω on the imaginary axis.' },
              answer: C.key, tol: { rel: 0.005 },
              errors: apart([{ value: 2 / C.om, feedback: t`$h\omega \le 2$ is not RK4’s limit (Euler is unstable on the imaginary axis for every step). RK4’s region reaches $2\sqrt2$.` }, { value: 2.785 / C.om, feedback: t`2.785 is where the region meets the *negative real* axis, the limit for decay. An oscillation sits on the imaginary axis.` }, { value: (2 * Math.SQRT2) / (C.om * C.om), feedback: t`Divide $2\sqrt2$ by $\omega$, not by $\omega^2$.` }], C.key),
              hints: [t`The eigenvalues of $\ddot{\delta r} = -\omega^2\delta r$ are $\pm i\omega$.`, t`$\omega^2 = (${C.rc} - 6)/(${C.rc}^3\times${C.rc - 3}) = ${tex(C.om ** 2, 4)}$.`, t`Stability needs $h\omega \le 2\sqrt2$.`],
              teach: 'Stability bounds the step through the problem’s fastest eigenvalue: for an oscillation, RK4 needs hω ≤ 2√2.',
              explain: t`$\omega = ${tex(C.om, 4)}/M$, so $h \le 2\sqrt2/\omega = ${C.key.toFixed(1)}M$. That is a ceiling, not a recommendation: the orbit itself needs steps far smaller for accuracy. Stability limits bite in stiff problems, where the fastest eigenvalue belongs to something you do not care to resolve.`,
            };
          },
        }),
        num({
          id: 'r4-wobble', skill: 'st-f.F10.2', difficulty: 3,
          gen(r) {
            const C = wobbleCase(r);
            return {
              prompt: t`The team integrates a slightly perturbed circular orbit at $r = ${C.rc}M$ with velocity Verlet at $h = ${C.h}M$. Its radial oscillation has $\omega^2 = M(r - 6M)/(r^3(r - 3M))$. Treating that oscillation as harmonic, what relative energy wobble should the court expect?`,
              visual: VeffPic(circular(C.rc).L, [{ x: C.rc, y: n12(Veff(C.rc, circular(C.rc).L)), r: 5.5, color: 'accent', label: `r = ${C.rc}M`, labelDy: 18 }], 'The effective potential for this orbit’s L; the circular orbit sits at its minimum.', { y: [+n12(Veff(C.rc, circular(C.rc).L) - 0.02), +n12(Veff(C.rc, circular(C.rc).L) + 0.06)], xmax: 30 }),
              answer: C.key, tol: { rel: 0.01 },
              errors: apart([{ value: (C.h * C.om) / 2, feedback: t`The wobble is second order: square $h\omega$.` }, { value: (C.h * C.om) ** 2, feedback: t`Include the factor $\tfrac14$ from the shadow Hamiltonian.` }, { value: (C.h * C.om ** 2) ** 2 / 4, feedback: t`Use $\omega$, the square root of the given $\omega^2$.` }], C.key),
              hints: [t`For Verlet on an oscillator the energy wobbles by a relative $\tfrac14(h\omega)^2$ ([F10.2](#/lesson/st-f.F10.2)).`, t`$\omega = \sqrt{${tex(C.om ** 2, 4)}} = ${tex(C.om, 4)}$.`, t`$h\omega = ${(C.h * C.om).toFixed(4)}$.`],
              teach: 'A symplectic method’s energy error is a bounded wobble, (hω)²/4 for an oscillation, set by the fastest motion it resolves.',
              explain: t`$h\omega = ${(C.h * C.om).toFixed(4)}$, so $\tfrac14(h\omega)^2 = ${tex(C.key, 3)}$ — and it stays that size however long the run. It says nothing about the phase: the oscillation’s period is off by about $(h\omega)^2/24$ relative, an error that accumulates.`,
            };
          },
        }),
        num({
          id: 'r4-cfl', skill: 'st-f.F11.2', difficulty: 3,
          gen(r) {
            const C = cflCase(r);
            return {
              prompt: t`For the ringdown, the team solves the wave equation $\psi_{tt} = \psi_{xx} - V(x)\psi$ (Regge–Wheeler, in the tortoise coordinate $x$) with leapfrog on a grid of $\Delta x = ${C.dx}M$ — but with $\Delta t = ${C.dt}M$, a Courant number $\nu = ${C.nu}$. Ignoring the small potential term, von Neumann analysis gives $G^2 - 2(1 - 2\nu^2\sin^2\tfrac{\theta}{2})G + 1 = 0$. By what factor per step does the worst mode (the sawtooth, $\theta = \pi$) grow?`,
              visual: {
                type: 'graph',
                params: { x: [-30, 40], y: [-0.01, 0.17], aspect: 'wide', axesAt: 'edge', xlabel: 'tortoise coordinate x (M)', ylabel: 'V (1/M²)',
                  curves: [{ param: ['2 + exp(t) + 2*t - 2*ln(2)', '(1 - 2/(2 + exp(t)))*(6/(2 + exp(t))^2 - 6/(2 + exp(t))^3)'], t: [-17, 4.2], samples: 3000, color: 'gold', width: 2.2 }] },
                caption: 'The Regge–Wheeler potential for l = 2 gravitational waves around a Schwarzschild black hole, peaked near r = 3.28M. Its height, 0.15/M², is tiny next to 4/Δx² — which is why it can be ignored in the stability analysis.',
              },
              answer: C.key, tol: { rel: 0.005 },
              errors: apart([{ value: C.nu, feedback: 'The Courant number is not the growth factor: solve the quadratic for G at θ = π.' }, { value: Math.abs(1 - 2 * C.nu * C.nu), feedback: t`That is the half-sum of the roots; with $b = 1 - 2\nu^2 < -1$ the roots are $b \pm \sqrt{b^2 - 1}$, and the larger one in size is $|b| + \sqrt{b^2 - 1}$.` }, { value: C.nu * C.nu, feedback: t`Solve $G^2 - 2bG + 1 = 0$ with $b = 1 - 2\nu^2$.` }], C.key),
              hints: [t`At $\theta = \pi$: $G^2 - 2bG + 1 = 0$ with $b = 1 - 2\nu^2 = ${(1 - 2 * C.nu ** 2).toFixed(4)}$.`, t`The roots are $b \pm \sqrt{b^2 - 1}$; their product is 1, so one has $|G| > 1$ whenever $|b| > 1$.`, t`$|G| = |b| + \sqrt{b^2 - 1}$.`],
              teach: 'Past the CFL limit the leapfrog roots leave the unit circle along the real axis, and the sawtooth grows by a fixed factor every step.',
              explain: t`$b = ${(1 - 2 * C.nu ** 2).toFixed(4)}$, so $|G| = ${C.key.toFixed(4)}$ per step: after 50 steps the sawtooth has grown by $${tex(C.key ** 50, 2)}$. With $\Delta t \le \Delta x$ ($\nu \le 1$), $|b| \le 1$ and both roots sit on the unit circle — the CFL condition. The court’s verdict on this run: unstable by construction, whatever the physics.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Exhibit E: the verdict',
      story: t`Last, the claims themselves. The team’s paper says its precession code is fourth order, its fall code is RK4, and its geodesic code is correct. The court runs the tests.`,
      items: [
        num({
          id: 'r5-order', skill: 'st-f.F13.1', difficulty: 3,
          gen(r) {
            const C = orderCase(r);
            const Ob = orbitOf(C.rp, C.ra);
            return {
              prompt: t`The team’s precession code, described as “RK4”, gives an advance per orbit for $(r_p, r_a) = (${C.rp}, ${C.ra})M$ of $${C.u[0].toFixed(10)}$, $${C.u[1].toFixed(10)}$ and $${C.u[2].toFixed(10)}$ rad at $N = ${C.N}$, $${2 * C.N}$ and $${4 * C.N}$ steps per orbit. What order of convergence do the runs show?`,
              visual: { type: 'graph', params: { x: [-1.15 * C.ra, 1.15 * C.ra], y: [-1.15 * C.ra, 1.15 * C.ra], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (M)', ylabel: 'y (M)', points: [...(() => { const P = precession(C.rp, C.ra, 400, { orbits: 2, path: true }).path; const k = Math.max(1, Math.round(P.length / 600)); return P.filter((_, i) => i % k === 0).map(([ph, u]) => ({ x: n12(Math.cos(ph) / u), y: n12(Math.sin(ph) / u), r: 1.4, color: 'accent' })); })(), { x: 0, y: 0, r: 5, color: 'void' }] }, caption: 'The orbit, two radial periods of an accurate run: its periapsis swings round by a large angle each time.' },
              answer: C.key, tol: { rel: 0, abs: 0.03 },
              errors: apart([{ value: C.Q, feedback: t`That is $Q = 2^p$; take $\log_2$.` }, { value: 4, feedback: 'Four is what the paper claims. Compute what the runs show: log₂ of the ratio of successive differences.' }], C.key, 0.05),
              hints: [t`$Q = (u_N - u_{2N})/(u_{2N} - u_{4N})$.`, t`$Q = ${tex(C.Q, 4)}$.`, t`$p = \log_2 Q$.`],
              teach: 'An order claim is checked by measuring it; a fourth-order label on a second-order code is caught by three runs.',
              explain: t`$Q = ${tex(C.Q, 4)}$, so $p = ${C.key.toFixed(2)}$: second order, not fourth. The pattern — a clean slope 2 in the precession, always of the same sign — is velocity Verlet’s spurious precession ([F14.2](#/lesson/st-f.F14.2)); the exact advance is $${Ob.exact.toFixed(8)}$ rad. The claim is struck from the paper.`,
            };
          },
        }),
        code({
          id: 'r5-fix', skill: 'st-f.F14.1', difficulty: 3,
          prompt: t`The team’s radial-fall code, which it calls RK4, measures order 2 against the cycloid. Find and fix the bug in \`step\` so that \`order\` — from the errors at $n = 50$ and $100$ steps to $\tau = ${BF.T}M$, falling from rest at $R = ${BF.R}M$ with $M = 1$ — comes out near 4.`,
          starter: t`import numpy as np

R, T = ${BF.R}.0, ${BF.T}.0

def exact_r(tau):
    s = np.sqrt(R**3 / 8)
    lo, hi = 0.0, np.pi
    for _ in range(100):
        mid = 0.5 * (lo + hi)
        if s * (mid + np.sin(mid)) < tau:
            lo = mid
        else:
            hi = mid
    return R / 2 * (1 + np.cos(0.5 * (lo + hi)))

def f(y):
    r, v = y
    return np.array([v, -1 / r**2])

def step(y, h):
    k1 = f(y)
    k2 = f(y + h / 2 * k1)
    k3 = f(y + h / 2 * k1)
    k4 = f(y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)

def run(n):
    y, h = np.array([R, 0.0]), T / n
    for _ in range(n):
        y = step(y, h)
    return y[0]

e50, e100 = abs(run(50) - exact_r(T)), abs(run(100) - exact_r(T))
order = np.log2(e50 / e100)
print(e50, e100, order)
`,
          answer: t`import numpy as np

R, T = ${BF.R}.0, ${BF.T}.0

def exact_r(tau):
    s = np.sqrt(R**3 / 8)
    lo, hi = 0.0, np.pi
    for _ in range(100):
        mid = 0.5 * (lo + hi)
        if s * (mid + np.sin(mid)) < tau:
            lo = mid
        else:
            hi = mid
    return R / 2 * (1 + np.cos(0.5 * (lo + hi)))

def f(y):
    r, v = y
    return np.array([v, -1 / r**2])

def step(y, h):
    k1 = f(y)
    k2 = f(y + h / 2 * k1)
    k3 = f(y + h / 2 * k2)
    k4 = f(y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)

def run(n):
    y, h = np.array([R, 0.0]), T / n
    for _ in range(n):
        y = step(y, h)
    return y[0]

e50, e100 = abs(run(50) - exact_r(T)), abs(run(100) - exact_r(T))
order = np.log2(e50 / e100)
print(e50, e100, order)`,
          tests: [
            { name: 'the observed order is now close to 4', code: 'abs(order - 4) < 0.15' },
            { name: t`the error with 100 steps is about $${tex(BF_E[1], 2)}$`, code: `abs(e100 / ${n12(BF_E[1])} - 1) < 0.01` },
          ],
          hints: ['The update and k1, k2, k4 are fine. Look at what each stage is built from.', 'k3 must use the slope k2 at the midpoint, not k1.', 'k3 = f(y + h/2 * k2).'],
          teach: 'An order test identifies a broken stage at once: RK4 with its third stage built from k₁ collapses to a second-order method.',
          explain: t`With $k_3$ built from $k_1$, $k_3 = k_2$ and the update becomes $(k_1 + 4k_2 + k_4)/6$, a second-order method. Fixed, the errors are $${tex(BF_E[0], 2)}$ and $${tex(BF_E[1], 2)}$: order $${Math.log2(BF_E[0] / BF_E[1]).toFixed(2)}$. At $\tau = ${BF.T}M$ the faller from $${BF.R}M$ is at $r = ${BF_EX.toFixed(3)}M$, outside the horizon, which it crosses at $${tauHorizon(BF.R).toFixed(1)}M$.`,
          visual: { type: 'graph', params: { x: [0, 66], y: [0, 16], aspect: 'wide', axesAt: 'edge', xlabel: 'proper time τ (M)', ylabel: 'r (M)', curves: [{ param: [`${n12(cycloid(BF.R).s)}*(t + sin(t))`, `${BF.R / 2}*(1 + cos(t))`], t: [0, Math.PI], color: 'accent', width: 2.2 }], vlines: [{ x: BF.T, color: 'gold', label: `τ = ${BF.T}M` }], hlines: [{ y: 2, color: 'bad', label: 'horizon' }] }, caption: 'The exact fall from 15M (the cycloid) and the time at which the code is tested.' },
        }),
        mcq({
          id: 'r5-monitor', skill: 'st-f.F14.3', difficulty: 3,
          gen(r) {
            const C = monitorCase(r);
            const row = (k, unit = '') => t`$${tex(C.a[k], 2)}${unit}$ at $h = ${C.h}M$, $${tex(C.b[k], 2)}${unit}$ at $h = ${C.h / 2}M$`;
            return {
              prompt: t`Last exhibit: the geodesic code on the orbit $(r_p, r_a) = (${C.rp}, ${C.ra})M$, with RK4 for $1000M$. The largest drifts of its monitors are: $|\Delta E|$: ${row('E')}. $|\Delta L|$: ${row('L', 'M')}. $|u\cdot u + 1|$: ${row('U')}. What is the court’s verdict?`,
              visual: {
                type: 'graph',
                params: { x: [-0.45, 0.55], y: [-11, -1.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (M)', ylabel: 'largest drift',
                  points: [['E', 'gold'], ['L', 'violet'], ['U', 'bad']].flatMap(([k, c]) => [{ x: n12(lg(C.h)), y: n12(lg(C.a[k])), r: 5, color: c }, { x: n12(lg(C.h / 2)), y: n12(lg(C.b[k])), r: 5, color: c }]),
                  legend: [{ label: '|ΔE|', color: 'gold', point: true }, { label: '|ΔL|', color: 'violet', point: true }, { label: '|u·u + 1|', color: 'bad', point: true }], legendAt: 'br' },
                caption: 'The three monitors at the two steps, log–log.',
              },
              choices: [
                t`A bug in the $\ddot r$ equation: $E$ and $L$ converge at fourth order, but the normalization drift does not shrink at all, so it is not truncation error`,
                'Healthy: all three monitors are small, so the code is correct',
                t`The step is too large: halve it again and $|u\cdot u + 1|$ will start to fall`,
                t`A bug in the $\ddot t$ equation, since $E = (1 - 2M/r)\dot t$ drifts`,
              ],
              answer: 0,
              why: {
                1: 'Small is not the test; shrinking at the method’s order is. One monitor here does not shrink at all.',
                2: 'A drift that is the same at two steps is not heading anywhere: the trajectory has converged — to the solution of the wrong equations.',
                3: 'E’s drift falls sixteenfold per halving, as truncation error should. The ṫ equation is fine.',
              },
              hints: ['Compute the ratio of each monitor between the two steps.', 'Which ratios are near 16, and which near 1?', 'Which equations keep E and L constant, and which must be right for u·u to stay at −1 as well?'],
              teach: 'A monitor converging to zero at the method’s order acquits the integrator; one converging to a nonzero value convicts the equations.',
              explain: t`$|\Delta E|$ and $|\Delta L|$ fall by $${(C.a.E / C.b.E).toFixed(1)}$ and $${(C.a.L / C.b.L).toFixed(1)}$ — RK4’s order — but $|u\cdot u + 1|$ stays at $${tex(C.b.U, 2)}$. The $\ddot t$ and $\ddot\varphi$ equations, which alone keep $E$ and $L$, are right; the $\ddot r$ equation is not. (It is the sign of $\Gamma^r{}_{rr}$, as in [F14.3](#/lesson/st-f.F14.3).) Verdict: fix the Christoffel symbol, rerun every test — and then publish.`,
            };
          },
        }),
      ],
    },
  ],
});
