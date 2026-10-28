// The PDE course boss, "The Well-Posedness Trial": before a new solver may run
// on a simulation centre's machines it must pass five rounds. Classify: the type
// of a constant-coefficient equation from B² − 4AC; Hadamard's example, the
// height at which data sin(nx)/n² grow to size 1, sinh(ny) = n³. Solve:
// d'Alembert's value at a point; the breaking time w√(e/2)/A of a Gaussian under
// Burgers; how long two modes of a rod take to separate in size. Simulate: von
// Neumann analysis of the second-order upwind (Beam–Warming) scheme, stable to
// ν = 2 (code); a measured order of convergence from the model's own runs.
// Explain the blow-up: diagnose five crashed runs (CFL exceeded, FTCS
// advection, heat r > ½, leapfrog past ν = 1, a downwind stencil) from pictures
// computed by model/pde4-fd.js; measure a crash's growth factor and match it to
// |1 − 2ν| (code); upwind's numerical diffusion spreading a front. Einstein's
// equations: a damped, fed constraint violation; the hyperbolicity of the
// Maxwell analogue with a fraction q of the constraint added; which functions
// are harmonic coordinates. Every case function is exported, so
// scratchpad/pde4/verify-boss.mjs recomputes every key another way.
import { boss, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { MATERIALS, player } from './_pde.js';
import { run, error, upwindDiffusivity, maxGain, gainKey } from '../../src/viz/model/pde4-fd.js';

const t = String.raw;
const r3 = (x) => +(+x).toPrecision(3);
const r4 = (x) => +(+x).toPrecision(4);
const scheme = (params, caption) => ({ type: 'pde4-scheme', params: { controls: false, play: false, readout: false, ...params }, caption });

/** Keep only the slips whose values are finite and clearly apart from the key and from each other. */
function apart(errors, key, rel = 0.03) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v), 1e-300);
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, 0.01))) kept.push(e);
  return kept;
}

// ── round 1: classify ───────────────────────────────────────────────────────
const TYPES = ['hyperbolic', 'parabolic', 'elliptic'];
const PARABOLIC = [[1, 2, 1], [1, 4, 4], [4, 4, 1], [2, 4, 2], [1, 6, 9], [9, 6, 1], [1, -2, 1], [4, -4, 1]];
/** A constant-coefficient operator A u_xx + B u_xy + C u_yy and its type. */
export function typeCase(r) {
  const want = r.int(0, 2);
  let A, B, C;
  if (want === 1) [A, B, C] = r.pick(PARABOLIC);
  else {
    do { A = r.pick([1, 2, 3]); B = r.int(-5, 5); C = r.pick([-3, -2, -1, 1, 2, 3, 4]); }
    while (Math.sign(B * B - 4 * A * C) !== (want === 0 ? 1 : -1));
  }
  const disc = B * B - 4 * A * C;
  return { A, B, C, disc, type: disc > 0 ? 0 : disc === 0 ? 1 : 2 };
}
const term = (c, s, first) => (c === 0 ? '' : `${c < 0 ? ' - ' : first ? '' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}${s}`);

/** Hadamard's example: u_xx + u_yy = 0, u(x, 0) = 0, u_y(x, 0) = sin(nx)/n²; u = sin(nx) sinh(ny)/n³ reaches amplitude 1 at y = asinh(n³)/n. */
export function hadamardCase(r) {
  const n = r.pick([10, 20, 50, 100]);
  return { n, y: Math.asinh(n ** 3) / n, data: 1 / n ** 2 };
}

// ── round 2: solve ──────────────────────────────────────────────────────────
/** d'Alembert: f = A e^(−x²/w²), released from rest; u(x0, t0) = ½[f(x0 − ct0) + f(x0 + ct0)]. */
export function dalembertCase(r) {
  const A = r.pick([1, 2, 5]), w = r.pick([0.8, 1, 1.5]), c = r.pick([1, 2]), t0 = r.pick([0.5, 1, 1.5]), x0 = r.pick([0.5, 1, 2]);
  const f = (x) => A * Math.exp(-(x * x) / (w * w));
  return { A, w, c, t0, x0, f, key: 0.5 * (f(x0 - c * t0) + f(x0 + c * t0)) };
}
/** Burgers with u0 = A e^(−x²/w²): first crossing at t* = w√(e/2)/A, at x = √2 w. */
export function shockCase(r) {
  const A = r.pick([0.5, 0.8, 1, 1.5]), w = r.pick([0.5, 1, 2]);
  return { A, w, key: (w * Math.sqrt(Math.E / 2)) / A, x: Math.SQRT2 * w };
}
/** A rod with both ends held at 0 starts in modes 1 and 3; when has the ratio of mode 3 to mode 1 fallen by F? t = L² ln F/(8π²α). */
export function modesCase(r) {
  const m = r.pick(MATERIALS), Lcm = r.pick([2, 5, 10]), F = r.pick([10, 100, 1000]);
  const L = Lcm / 100;
  return { m, Lcm, L, F, key: (L * L * Math.log(F)) / (8 * Math.PI ** 2 * m.alpha) };
}

// ── round 3: simulate ───────────────────────────────────────────────────────
const SCH3 = [['upwind', 'upwind', 1], ['lw', 'Lax–Wendroff', 2], ['laxf', 'Lax–Friedrichs', 1]];
const ORD = Object.fromEntries(SCH3.map(([s]) => [s, [100, 200, 400].map((N) => error({ eq: 'advect', scheme: s, N, nu: 0.5, profile: 'gauss', w: 1.5, t: 10 }).err)]));
/** A measured order from two of the model's runs (one lap of a bump of width 1.5 m at ν = 0.5). */
export function orderCase(r) {
  const [s, name, formal] = r.pick(SCH3), i = r.int(0, 1);
  const N1 = [100, 200][i], e1 = +ORD[s][i].toPrecision(4), e2 = +ORD[s][i + 1].toPrecision(4);
  return { s, name, formal, N1, e1, e2, key: Math.log2(e1 / e2) };
}

// ── round 4: explain the blow-up ────────────────────────────────────────────
const CRASH = [
  { id: 'upwind', eq: 'advect', scheme: 'upwind', nu: 1.2, ans: 0, what: t`upwind for $u_t + c\,u_x = 0$ at Courant number $\nu = 1.2$` },
  { id: 'leap', eq: 'wave', scheme: 'leapfrog', nu: 1.1, ans: 0, what: t`leapfrog for $u_{tt} = c^2u_{xx}$ at Courant number $\nu = 1.1$` },
  { id: 'ftcs', eq: 'advect', scheme: 'ftcs', nu: 0.5, ans: 1, what: t`$u_j^{n+1} = u_j^n - \tfrac12\nu\,(u_{j+1}^n - u_{j-1}^n)$ for $u_t + c\,u_x = 0$ at $\nu = 0.5$` },
  { id: 'heat', eq: 'heat', scheme: 'ftcs', nu: 0.6, ans: 2, what: t`the explicit scheme for $u_t = D\,u_{xx}$ at $r = D\,\Delta t/\Delta x^2 = 0.6$` },
  { id: 'down', eq: 'advect', scheme: 'downwind', nu: 0.4, ans: 3, what: t`$u_j^{n+1} = u_j^n - \nu\,(u_{j+1}^n - u_j^n)$ for $u_t + c\,u_x = 0$ ($c > 0$) at $\nu = 0.4$` },
].map((S) => {
  const base = { eq: S.eq, scheme: S.scheme, nu: S.nu, N: 100, profile: 'box', w: 1, D: 0.1 };
  const R = run({ ...base, t: 400, cap: 2.5 });
  return { ...S, base, t: +(R.time).toFixed(4), steps: R.blown, G: maxGain(gainKey(S.eq, S.scheme), S.nu) };
});
/** Which of five crashed runs, and its largest amplification factor. */
export function crashCase(r) { return r.pick(CRASH); }
const DIAG = [
  t`The time step is past the stability limit of an otherwise sound scheme: reduce $\Delta t$ until the Courant number is at most 1`,
  'The scheme is unstable at every time step even though its stencil covers the characteristic: change the scheme (upwind it, or add the Lax–Wendroff term)',
  t`The explicit diffusion limit $r \le \tfrac12$ is exceeded: $\Delta t$ must shrink with $\Delta x^2$`,
  'The stencil takes its information from downstream, so no time step satisfies the CFL condition: difference from the upwind side',
];

/** Upwind's numerical diffusion spreads a sharp front to a width of about √(4 D_num t). */
export function smearCase(r) {
  const c = r.pick([300, 600, 1000]), dxmm = r.pick([1, 2, 5]), nu = r.pick([0.2, 0.4, 0.6]), tms = r.pick([2, 5, 10]);
  const D = upwindDiffusivity(c, dxmm / 1000, nu), width = Math.sqrt(4 * D * tms / 1000) * 1000;
  return { c, dxmm, nu, tms, D, key: width };
}

// ── round 5: Einstein's equations ───────────────────────────────────────────
/** A damped, fed violation: C′ = −γC + S, C(0) = C0. */
export function dampCase(r) {
  const C0 = r.pick([1e-3, 4e-3, 1e-2]), g = r.pick([0.2, 0.5, 1]), S = r.pick([1e-6, 5e-6, 2e-5]), T = r.pick([5, 10, 20]);
  const Cinf = S / g;
  return { C0, g, S, T, Cinf, key: Cinf + (C0 - Cinf) * Math.exp(-g * T) };
}
/** The Maxwell analogue with a fraction q of Gauss's law substituted: speeds 0, ±√(1 − q). */
export function hyperCase(r) {
  const q = r.pick([0, 0.36, 0.75, 1, 1.44, 2]);
  return { q, type: q < 1 ? 0 : q === 1 ? 1 : 2, speed: Math.sqrt(Math.abs(1 - q)) };
}
// □f = −f_tt + ∇²f in flat spacetime (signature −+++)
const POOL = [
  { tex: 'x + 3t', box: '0' }, { tex: 'x^2 - y^2', box: '0' }, { tex: 'xyz', box: '0' }, { tex: 't^2 + x^2', box: '0' }, { tex: 'xt', box: '0' },
  { tex: 'e^{x}\\cos y', box: '0' }, { tex: 'e^{x}\\cosh t', box: '0' },
  { tex: 't^2 - x^2', box: '-4' }, { tex: 'x^2 + y^2 + z^2', box: '6' }, { tex: 't^2', box: '-2' }, { tex: 'r = \\sqrt{x^2 + y^2 + z^2}', box: '2/r' }, { tex: 'e^{x}\\cos t', box: '2e^{x}\\cos t' },
];
/** Five candidate coordinate functions, at least two harmonic and two not. */
export function gaugeCase(r) {
  const good = r.shuffle(POOL.filter((p) => p.box === '0')), bad = r.shuffle(POOL.filter((p) => p.box !== '0'));
  const ng = r.int(2, 3);
  const picks = r.shuffle([...good.slice(0, ng), ...bad.slice(0, 5 - ng)]);
  return { picks, answer: picks.map((p, i) => (p.box === '0' ? i : -1)).filter((i) => i >= 0) };
}

export default boss({
  title: 'The Well-Posedness Trial',
  intro: t`Before a new solver may run on the simulation centre’s machines — rocket-engine flows on Mondays, colliding black holes on Fridays — it must pass the review board’s trial. You are its author. Five rounds: classify its equations, solve the test problems exactly, simulate them, explain why an earlier version crashed, and finally show that you know what is special about Einstein’s equations.`,
  pass: 0.7,
  rounds: [
    {
      title: 'Classify',
      story: t`The board starts with the questions every PDE must answer first: what type is it, and is the problem you are about to pose even well posed?`,
      items: [
        mcq({
          id: 'r1-type', skill: 'st-b.B10.1', difficulty: 2,
          gen(r) {
            const C = typeCase(r);
            const op = `${term(C.A, 'u_{xx}', true)}${term(C.B, 'u_{xy}')}${term(C.C, 'u_{yy}')}`;
            const choices = ['hyperbolic everywhere', 'parabolic everywhere', 'elliptic everywhere', 'hyperbolic in some regions of the plane and elliptic in others'];
            const why = {};
            for (let i = 0; i < 3; i++) if (i !== C.type) why[i] = t`$B^2 - 4AC = ${C.B}^2 - 4(${C.A})(${C.C}) = ${C.disc}$, which is ${C.disc > 0 ? 'positive' : C.disc < 0 ? 'negative' : 'zero'}: ${TYPES[C.type]}, not ${TYPES[i]}.`;
            why[3] = 'The coefficients are constants, so the discriminant — and the type — is the same at every point. Type changes need variable coefficients, as in the Tricomi equation.';
            return {
              prompt: t`One of the solver’s test equations is $${op} + u_x - 3u = 0$, with constant coefficients. What is its type?`,
              choices, answer: C.type, why,
              hints: [t`Only the second-order part matters: $A = ${C.A}$, $B = ${C.B}$, $C = ${C.C}$.`, t`Compute $B^2 - 4AC$: positive is hyperbolic, zero parabolic, negative elliptic.`],
              teach: 'The sign of B² − 4AC decides the type; lower-order terms do not matter.',
              explain: t`$B^2 - 4AC = ${C.B * C.B} - ${4 * C.A * C.C} = ${C.disc}$: **${TYPES[C.type]}**. ${C.type === 0 ? 'Two families of characteristics: an initial-value problem in a time-like direction is the right question.' : C.type === 1 ? 'One family of characteristics, like the heat equation.' : 'No real characteristics: like Laplace’s equation, it wants boundary values all round, not initial data.'}`,
              visual: { type: 'graph', params: { x: [-6, 6], y: [-20, 40], aspect: 'wide', axesAt: 'edge', xlabel: 'B', ylabel: '4AC', curves: [{ fn: 'x^2', color: 'gold', width: 2.2 }], shade: [{ fn: '40', lower: 'x^2', from: -6, to: 6, color: 'accent', alpha: 0.12 }, { fn: 'x^2', lower: '-20', from: -6, to: 6, color: 'warn', alpha: 0.12 }], points: [{ x: -5.6, y: 33, r: 0, label: 'elliptic: B² < 4AC', color: 'accent' }, { x: -5.6, y: -14, r: 0, label: 'hyperbolic: B² > 4AC', color: 'warn' }, { x: 2.3, y: 12, r: 0, label: 'parabolic', color: 'gold' }] }, caption: 'The three types in the plane of B against 4AC: the gold parabola B² = 4AC is the parabolic boundary. Place the equation yourself.' },
            };
          },
        }),
        num({
          id: 'r1-hadamard', skill: 'st-b.B12.1', difficulty: 3,
          gen(r) {
            const H = hadamardCase(r);
            return {
              prompt: t`A colleague proposes to march Laplace’s equation $u_{xx} + u_{yy} = 0$ upward from $y = 0$ like a wave equation. Hadamard’s test case: $u(x, 0) = 0$, $u_y(x, 0) = \sin(${H.n}x)/${H.n}^2$, whose solution is $u = \sin(${H.n}x)\sinh(${H.n}y)/${H.n}^3$. The data are of size $${tex(H.data)}$. At what height $y$ has the solution’s amplitude grown to 1?`,
              answer: H.y, tol: { rel: 0.005 },
              errors: apart([{ value: Math.log(H.n ** 3) / H.n, feedback: t`Close for large $n$, but $\sinh(ny) = \tfrac12(e^{ny} - e^{-ny})$: solve $\sinh(ny) = n^3$ exactly, $y = \operatorname{arsinh}(n^3)/n$.` }, { value: Math.asinh(H.n ** 2) / H.n, feedback: t`The amplitude is $\sinh(ny)/n^3$, so set $\sinh(ny) = n^3$, not $n^2$.` }, { value: Math.asinh(H.n ** 3), feedback: 'Divide by n: the argument of sinh is ny.' }], H.y, 0.005),
              hints: [t`Set $\sinh(${H.n}y)/${H.n}^3 = 1$.`, t`$y = \operatorname{arsinh}(${H.n}^3)/${H.n}$, with $\operatorname{arsinh}z = \ln(z + \sqrt{z^2 + 1})$.`],
              teach: 'For the Cauchy problem of Laplace’s equation, finer data grow faster: no continuous dependence — ill-posed.',
              explain: t`$y = \operatorname{arsinh}(${H.n ** 3})/${H.n} = ${r3(H.y)}$. Data of size $${tex(H.data)}$ produce a solution of size 1 within that height — and the finer the data (larger $n$), the smaller the height, since $y \approx 3\ln n/n$ (plus $\ln 2/n$). Any round-off error, which contains every $n$, would explode: Hadamard’s third criterion, continuous dependence on the data, fails.`,
              visual: { type: 'graph', params: { x: [0, 3.1416], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'n² × rate at y = 0', curves: [{ fn: `sin(${H.n}*x)`, color: 'accent', width: 1.6, samples: 2000 }] }, caption: t`The Cauchy data $u_y(x, 0)$, multiplied by $n^2 = ${H.n * H.n}$ so they can be seen: tiny, but finely rippled.` },
            };
          },
        }),
      ],
    },
    {
      title: 'Solve',
      story: t`Every test problem the solver will run must first be solved exactly, so that its errors can be measured. Three of them.`,
      items: [
        num({
          id: 'r2-dalembert', skill: 'st-b.B3.2', difficulty: 2,
          gen(r) {
            const D = dalembertCase(r);
            const k = D.key, half = 0.5 * D.f(D.x0 - D.c * D.t0);
            return {
              prompt: t`A string obeys $u_{tt} = c^2u_{xx}$ with $c = ${D.c}$ m/s. It is released from rest with $u(x, 0) = ${D.A}\,e^{-x^2/${r4(D.w * D.w)}}$ (in mm, $x$ in m). What is $u$ at $x = ${D.x0}$ m and $t = ${D.t0}$ s, in mm?`,
              answer: k, units: 'mm', tol: { rel: 0.005, abs: 1e-4 },
              errors: apart([{ value: 2 * half, feedback: t`Each half of the pulse carries half the height: $u = \tfrac12[f(x - ct) + f(x + ct)]$.` }, { value: D.f(D.x0), feedback: 'That is the starting value there; the pulse has split and moved.' }, { value: 0.5 * (D.f(D.x0 - D.t0) + D.f(D.x0 + D.t0)), feedback: t`The shifts are $\pm ct$, with $c = ${D.c}$ m/s.` }], k),
              hints: [t`d’Alembert, released from rest: $u = \tfrac12\big[f(x - ct) + f(x + ct)\big]$.`, t`$x - ct = ${r4(D.x0 - D.c * D.t0)}$, $x + ct = ${r4(D.x0 + D.c * D.t0)}$.`],
              teach: 'Released from rest, a wave splits into two half-height copies of its start, moving apart at speed c.',
              explain: t`$u = \tfrac12\big[f(${r4(D.x0 - D.c * D.t0)}) + f(${r4(D.x0 + D.c * D.t0)})\big] = ${r4(k)}$ mm. Only the data in $[x - ct, x + ct] = [${r4(D.x0 - D.c * D.t0)}, ${r4(D.x0 + D.c * D.t0)}]$ m matter — the domain of dependence — and here only its two end points, since the string started at rest.`,
              visual: player({ mode: 'wave', init: 'pluck', profile: 'gauss', A: D.A, w: D.w, c: D.c, t: D.t0, tmax: 3, x: [-6, 6], probe: [D.x0, D.t0], readout: false }, 'The two halves at the moment asked about; the probe marks the point (the readout is hidden).'),
            };
          },
        }),
        num({
          id: 'r2-shock', skill: 'st-b.B11.1', difficulty: 3,
          gen(r) {
            const S = shockCase(r);
            return {
              prompt: t`The solver’s nonlinear test is Burgers’ equation $u_t + u\,u_x = 0$ from $u(x, 0) = ${S.A}\,e^{-x^2/${r4(S.w * S.w)}}$ (m/s, $x$ in m). When do characteristics first cross — when must the solver start handling a shock?`,
              answer: S.key, units: 's', tol: { rel: 0.005 },
              errors: apart([{ value: S.w / S.A, feedback: t`The steepest slope of $A e^{-x^2/w^2}$ is not $A/w$: it is $\sqrt2\,e^{-1/2}A/w$, at $x = w/\sqrt2$.` }, { value: (S.w * Math.sqrt(Math.E / 2)) / (2 * S.A), feedback: 'The breaking time is −1/min u₀′, with no factor ½.' }], S.key),
              hints: [t`Breaking time $t^* = -1/\min u_0'(x)$.`, t`$u_0' = -\dfrac{2Ax}{w^2}e^{-x^2/w^2}$ is most negative at $x = w/\sqrt2$, where it equals $-\sqrt2\,e^{-1/2}A/w$.`, t`So $t^* = \dfrac{w\,e^{1/2}}{\sqrt2\,A} = \dfrac{w}{A}\sqrt{e/2}$.`],
              teach: 'Characteristics first cross at t* = −1/min u₀′, where the front of the profile is steepest.',
              explain: t`$t^* = \dfrac{${S.w}}{${S.A}}\sqrt{e/2} = ${r3(S.key)}$ s, at $x = \sqrt2\,w = ${r3(S.x)}$ m. After that a conservative scheme is essential: a non-conservative one would move the shock at the wrong speed (B11.2).`,
              visual: { type: 'pde3-burgers', params: { profile: 'gauss', A: S.A, w: S.w, t: 0, tmax: 4, x: [-4, 6], controls: false, play: false, readout: false, tstar: false, shock: false, fold: false }, caption: 'The initial profile and its characteristics, before any crossing is marked.' },
            };
          },
        }),
        num({
          id: 'r2-modes', skill: 'st-b.B7.1', difficulty: 3,
          gen(r) {
            const M = modesCase(r);
            const tau1 = (M.L * M.L) / (Math.PI ** 2 * M.m.alpha);
            return {
              prompt: t`A ${M.Lcm} cm bar of ${M.m.name} ($\alpha = ${tex(M.m.alpha)}\ \text{m}^2/\text{s}$), both ends held at 0 °C, starts with a temperature profile $\sin(\pi x/L) + \sin(3\pi x/L)$ (in kelvin above 0 °C). After how many seconds is the third mode’s amplitude ${M.F} times smaller than the first’s?`,
              answer: M.key, units: 's', tol: { rel: 0.005 },
              errors: apart([{ value: (M.L * M.L * Math.log(M.F)) / (9 * Math.PI ** 2 * M.m.alpha), feedback: t`The *ratio* decays at the difference of the rates, $(9 - 1)\pi^2\alpha/L^2$, not at mode 3’s rate alone.` }, { value: (M.L * M.L * Math.log10(M.F)) / (8 * Math.PI ** 2 * M.m.alpha), feedback: 'Use the natural logarithm of the factor.' }, { value: (M.L * M.L * Math.log(M.F)) / (2 * Math.PI ** 2 * M.m.alpha), feedback: t`Mode $n$ decays at $n^2\pi^2\alpha/L^2$: the rates are $1$ and $9$ (times $\pi^2\alpha/L^2$), not $1$ and $3$.` }], M.key),
              hints: [t`Mode $n$ decays as $e^{-n^2\pi^2\alpha t/L^2}$.`, t`The ratio of mode 3 to mode 1 decays as $e^{-8\pi^2\alpha t/L^2}$; set it to $1/${M.F}$.`],
              teach: 'Separated modes decay independently at n²π²α/L², so higher modes vanish relative to the first at the difference of the rates.',
              explain: t`$t = \dfrac{L^2\ln ${M.F}}{8\pi^2\alpha} = ${r3(M.key)}$ s (the first mode’s own e-folding time is $${r3(tau1)}$ s). The profile becomes a pure $\sin(\pi x/L)$ arch — the smoothing of B4.3 seen mode by mode.`,
              visual: { type: 'graph', params: { x: [0, 1], y: [-1.4, 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x / L', ylabel: 'T (K)', curves: [{ fn: 'sin(pi*x) + sin(3*pi*x)', color: 'ink3', width: 1.6, dash: [5, 4] }, { fn: 'sin(pi*x)', color: 'accent', width: 2.2 }, { fn: 'sin(3*pi*x)', color: 'violet', width: 1.6 }] }, caption: 'The starting profile (dashed) and its two modes (blue: first, violet: third). Room-temperature properties.' },
            };
          },
        }),
      ],
    },
    {
      title: 'Simulate',
      story: t`Now the solver itself. The board wants proof of two things: that its scheme is stable — by analysis, not by luck — and that it converges at the order claimed.`,
      items: [
        code({
          id: 'r3-beam-warming', skill: 'st-b.B13.2', difficulty: 3,
          prompt: t`The solver uses the second-order upwind (Beam–Warming) scheme for $u_t + c\,u_x = 0$:
$$u_j^{n+1} = u_j - \tfrac{\nu}{2}\big(3u_j - 4u_{j-1} + u_{j-2}\big) + \tfrac{\nu^2}{2}\big(u_j - 2u_{j-1} + u_{j-2}\big).$$
Its stencil reaches **two** cells upstream. Write \`G(theta, nu)\` (put $u_j = e^{ij\theta}$, so $u_{j-1} = e^{-i\theta}u_j$) and \`max_gain(nu)\` over \`theta\`. Then find its stability limit \`limit\` by bisection on $[1, 3]$ — the largest $\nu$ with \`max_gain(nu) <= 1 + 1e-12\`.`,
          starter: t`import numpy as np

theta = np.linspace(-np.pi, np.pi, 4001)

def G(theta, nu):
    z = np.exp(-1j * theta)      # the factor u[j-1]/u[j]
    pass

def max_gain(nu):
    pass

lo, hi = 1.0, 3.0
limit = None
print(max_gain(1.5), max_gain(2.2), limit)
`,
          answer: t`import numpy as np

theta = np.linspace(-np.pi, np.pi, 4001)

def G(theta, nu):
    z = np.exp(-1j * theta)      # the factor u[j-1]/u[j]
    return 1 - nu / 2 * (3 - 4 * z + z**2) + nu**2 / 2 * (1 - 2 * z + z**2)

def max_gain(nu):
    return np.max(np.abs(G(theta, nu)))

lo, hi = 1.0, 3.0
for _ in range(50):
    mid = 0.5 * (lo + hi)
    if max_gain(mid) <= 1 + 1e-12:
        lo = mid
    else:
        hi = mid
limit = lo
print(max_gain(1.5), max_gain(2.2), limit)`,
          tests: [
            { name: t`stable at $\nu = 1.5$ — past the usual limit of 1`, code: 'abs(max_gain(1.5) - 1) < 1e-9' },
            { name: t`unstable at $\nu = 2.2$ (largest $|G| = 1.88$)`, code: 'abs(max_gain(2.2) - 1.88) < 1e-6' },
            { name: t`the stability limit is $\nu = 2$`, code: 'limit is not None and abs(limit - 2) < 1e-6' },
          ],
          hints: ['Each uⱼ₋ₖ becomes zᵏ times uⱼ, so G = 1 − (ν/2)(3 − 4z + z²) + (ν²/2)(1 − 2z + z²).', '`max_gain(nu)` is `np.max(np.abs(G(theta, nu)))`.', 'Bisection: 50 times, mid = (lo + hi)/2; keep lo stable and hi unstable; limit = lo.'],
          teach: 'A wider upstream stencil widens the CFL limit: reaching two cells back allows ν up to 2 — and von Neumann confirms it.',
          explain: t`$\max|G| = 1$ for $0 \le \nu \le 2$ and 1.88 at $\nu = 2.2$; the bisection lands on 2. The CFL condition allows exactly this: the stencil reaches $2\Delta x$ upstream, so the characteristic may travel up to two cells per step. Stability analysis and the domain-of-dependence picture agree — the board’s first box is ticked.`,
        }),
        num({
          id: 'r3-order', skill: 'st-b.B13.3', difficulty: 3,
          gen(r) {
            const O = orderCase(r);
            return {
              prompt: t`The solver carries a bump of width 1.5 m once around a 10 m periodic ring with the ${O.name} scheme at $\nu = 0.5$. The largest error is $${tex(O.e1, 4)}$ with $N = ${O.N1}$ points and $${tex(O.e2, 4)}$ with $N = ${2 * O.N1}$. What order of convergence do these runs show?`,
              answer: O.key, tol: { rel: 0, abs: 0.01 },
              errors: apart([{ value: O.e1 / O.e2, feedback: t`That ratio is $2^p$; take $\log_2$.` }, { value: Math.log10(O.e1 / O.e2), feedback: 'The grid was halved: use log₂.' }], O.key, 0.02),
              hints: [t`$p = \log_2\big(E(N)/E(2N)\big)$.`, t`$E(N)/E(2N) = ${r4(O.e1 / O.e2)}$.`],
              teach: 'Two runs at grids differing by 2 measure the order: p = log₂ of the error ratio.',
              explain: t`$p = \log_2 ${r4(O.e1 / O.e2)} = ${O.key.toFixed(2)}$, against a formal order of ${O.formal}. ${O.formal === 2 ? 'Second order, as promised.' : 'Still approaching 1 from below: on these grids the first-order schemes are only entering their asymptotic range.'} These errors were computed by actually running the scheme.`,
              visual: { type: 'graph', params: { x: [1.8, 2.8], y: [Math.log10(O.e2) - 0.5, Math.log10(O.e1) + 0.5], aspect: 'wide', axesAt: 'edge', xlabel: 'grid points N (log scale)', ylabel: 'largest error (log scale)', xlog: true, ylog: true, curves: [], points: [{ x: r4(Math.log10(O.N1)), y: r4(Math.log10(O.e1)), color: 'accent', r: 6 }, { x: r4(Math.log10(2 * O.N1)), y: r4(Math.log10(O.e2)), color: 'accent', r: 6 }] }, caption: 'The two runs on log–log axes: minus the slope between them is the order.' },
            };
          },
        }),
      ],
    },
    {
      title: 'Explain the blow-up',
      story: t`The board has the log of an earlier version that crashed on its first day. You must say what went wrong — from the picture, the scheme and the numbers.`,
      items: [
        mcq({
          id: 'r4-diagnose', skill: 'st-b.B13.2', difficulty: 3,
          gen(r) {
            const S = crashCase(r);
            const why = {};
            const reasons = [
              t`Reducing $\Delta t$ cures only a scheme that is stable below some Courant number; ${S.ans === 1 ? t`this one has $|G| = \sqrt{1 + \nu^2\sin^2\theta} > 1$ at every $\nu > 0$` : S.ans === 2 ? t`here the limit is the diffusion one, $r \le \tfrac12$` : t`a downstream stencil fails at every $\nu$`}.`,
              t`This scheme is ${S.ans === 0 ? 'stable below its limit (ν ≤ 1)' : S.ans === 2 ? 'stable for r ≤ ½' : 'not centred'}; its largest $|G|$ at these settings is $${r3(S.G)}$ for another reason.`,
              t`The $r \le \tfrac12$ limit belongs to the explicit heat scheme; this run ${S.eq === 'heat' ? '' : 'is not a diffusion problem.'}`,
              t`Its stencil ${S.scheme === 'downwind' ? '' : 'does reach upstream'}${S.scheme === 'downwind' ? '' : ' — CFL is about reach, and here the reach is fine.'}`,
            ];
            for (let i = 0; i < 4; i++) if (i !== S.ans) why[i] = reasons[i];
            return {
              prompt: t`The crashed run used ${S.what}, on 100 grid points, starting from a square pulse. The picture shows it shortly before overflow. What went wrong, and what is the cure?`,
              choices: DIAG, answer: S.ans, why,
              hints: ['Find the amplification factor G(θ) of this scheme, and ask whether any time step would make |G| ≤ 1.', 'Upwind and leapfrog are stable up to ν = 1; FTCS for advection never; the explicit heat scheme up to r = ½; a downwind stencil never.'],
              teach: 'A blow-up is diagnosed by the scheme’s amplification factor: past a limit (reduce Δt), or unstable at any step (change the scheme).',
              explain: t`Largest $|G|$ at these settings: $${r3(S.G)}$. The run passed $|u| = 2.5$ after ${S.steps} steps — geometric growth from the pulse’s jumps, which contain the grid-scale waves. ${[t`The scheme is sound below its limit: bring the Courant number to 1 or less.`, t`Centred differences in space with a forward step in time amplify every wave: no $\Delta t$ helps. Upwinding, Lax–Friedrichs or Lax–Wendroff fix it.`, t`At $r = 0.6$ the sawtooth is multiplied by $|1 - 4r| = 1.4$ per step; $\Delta t \le \Delta x^2/(2D)$ cures it, at the price of many more steps on fine grids.`, t`The scheme looks downstream, away from where information comes from; $|G(\pi)| = 1 + 2\nu$. Take the difference from the upwind side.`][S.ans]}`,
              visual: scheme({ ...S.base, t: S.t, tmax: Math.max(S.t, 1), panels: ['profile'], ylim: [-4, 5], exact: false }, t`The crashed run after ${S.steps} steps (dots), from a square pulse; values beyond the window pinned in red.`),
            };
          },
        }),
        code({
          id: 'r4-growth', skill: 'st-b.B13.2', difficulty: 3,
          prompt: t`Reproduce a crash and measure it. Run upwind at $\nu = 1.25$ on the square pulse given, storing \`peaks\`, the value of \`np.max(np.abs(u))\` after each of 60 steps. Set \`rate\` to the average growth factor per step over the last 20 steps, \`(peaks[-1] / peaks[-21]) ** (1 / 20)\`, and \`predicted\` to von Neumann’s $|G(\pi)| = |1 - 2\nu|$.`,
          starter: t`import numpy as np

N, nu = 100, 1.25
x = np.arange(N) * 0.1
u = (np.abs(x - 5.0) < 1.0).astype(float)

peaks = []
# 60 upwind steps, appending np.max(np.abs(u)) after each

rate = None
predicted = None
print(rate, predicted)
`,
          answer: t`import numpy as np

N, nu = 100, 1.25
x = np.arange(N) * 0.1
u = (np.abs(x - 5.0) < 1.0).astype(float)

peaks = []
for n in range(60):
    u = u - nu * (u - np.roll(u, 1))
    peaks.append(np.max(np.abs(u)))

rate = (peaks[-1] / peaks[-21]) ** (1 / 20)
predicted = abs(1 - 2 * nu)
print(rate, predicted)`,
          tests: [
            { name: '60 peaks were recorded', code: 'len(peaks) == 60' },
            { name: t`the measured growth factor matches $|1 - 2\nu| = 1.5$ to within 3%`, code: 'rate is not None and predicted is not None and abs(rate / predicted - 1) < 0.03' },
          ],
          hints: ['Loop 60 times: `u = u - nu * (u - np.roll(u, 1))`, then append the peak.', '`rate = (peaks[-1] / peaks[-21]) ** (1/20)`; `predicted = abs(1 - 2*nu)`.'],
          teach: 'A crash explained: the measured growth per step equals the largest amplification factor von Neumann predicts.',
          explain: t`Late in the run the zigzag dominates and grows by very nearly 1.5 per step, as $|G(\pi)| = |1 - 2(1.25)|$ predicts. That match is the explanation the board wants: not a bug, not round-off, but a Courant number of 1.25 in a scheme whose limit is 1.`,
        }),
        num({
          id: 'r4-smear', skill: 'st-b.B13.1', difficulty: 3,
          gen(r) {
            const S = smearCase(r);
            return {
              prompt: t`The quick fix — run first-order upwind at a small Courant number — is stable but smears. A combustion front moves at $c = ${S.c}$ m/s on a grid of $\Delta x = ${S.dxmm}$ mm at $\nu = ${S.nu}$. Upwind’s modified equation adds a diffusivity $D_{\text{num}} = \tfrac12c\,\Delta x(1 - \nu)$; a sharp front diffuses to a width of about $\sqrt{4D_{\text{num}}t}$. How wide is it after ${S.tms} ms, in mm?`,
              answer: S.key, units: 'mm', tol: { rel: 0.005 },
              errors: apart([{ value: Math.sqrt(4 * (S.c * S.dxmm / 1000 * S.nu / 2) * S.tms / 1000) * 1000, feedback: 'The factor is (1 − ν): numerical diffusion vanishes as ν → 1.' }, { value: Math.sqrt(4 * S.D * S.tms) * 1000, feedback: 'Convert milliseconds to seconds.' }, { value: Math.sqrt(2 * S.D * S.tms / 1000) * 1000, feedback: 'The width asked for is √(4Dt).' }], S.key),
              hints: [t`$D_{\text{num}} = \tfrac12(${S.c})(${tex(S.dxmm / 1000)})(1 - ${S.nu}) = ${r3(S.D)}\ \text{m}^2/\text{s}$.`, t`Width $\sqrt{4D_{\text{num}}t}$ with $t = ${tex(S.tms / 1000)}$ s, then convert to mm.`],
              teach: 'Upwind’s leading error is a diffusion cΔx(1 − ν)/2: lowering ν for safety makes it worse.',
              explain: t`$\sqrt{4\times${r3(S.D)}\times${tex(S.tms / 1000)}} = ${r3(S.key)}$ mm — ${r3(S.key / S.dxmm)} cells, from numerical diffusion alone. Lowering $\nu$ to be safe *increases* the smearing; the real cure is a second-order scheme with a limiter.`,
              visual: scheme({ eq: 'advect', scheme: 'upwind', nu: S.nu, N: 100, profile: 'box', w: 1.5, t: 2, tmax: 4, panels: ['profile'], ylim: [-0.2, 1.3] }, t`Upwind at $\nu = ${S.nu}$ carrying a square pulse (100 points on a 10 m ring, 2 s): its sharp edges smeared by numerical diffusion. Same mechanism, different scales from the problem.`),
            };
          },
        }),
      ],
    },
    {
      title: 'Einstein’s equations',
      story: t`On Fridays the solver must evolve colliding black holes. The last round asks whether you understand why that is harder than anything before it — constraints, gauge and hyperbolicity.`,
      items: [
        num({
          id: 'r5-damp', skill: 'st-b.B14.2', difficulty: 3,
          gen(r) {
            const D = dampCase(r);
            return {
              prompt: t`In the solver’s Einstein run, a constraint violation obeys $C_t = -\gamma C + S$: damping at $\gamma = ${D.g}/M$ against truncation error feeding it at $S = ${tex(D.S)}$ per unit $M$ of time. It starts at $C(0) = ${tex(D.C0)}$ from inexact initial data. What is $C$ at $t = ${D.T}\,M$?`,
              answer: D.key, tol: { rel: 0.005 },
              errors: apart([{ value: D.C0 * Math.exp(-D.g * D.T), feedback: t`That ignores the source: the violation tends to $S/\gamma$, not to 0.` }, { value: D.Cinf, feedback: t`That is the level it tends to; at $t = ${D.T}\,M$ some of the initial violation is still left.` }, { value: D.C0 + D.S * D.T, feedback: 'That has no damping at all.' }], D.key),
              hints: [t`The solution is $C(t) = S/\gamma + \big(C(0) - S/\gamma\big)e^{-\gamma t}$.`, t`$S/\gamma = ${tex(D.Cinf, 3)}$ and $e^{-\gamma t} = ${tex(Math.exp(-D.g * D.T), 3)}$.`],
              teach: 'With damping, a violation forgets its start at rate γ and settles at S/γ.',
              explain: t`$C = ${tex(D.Cinf, 3)} + (${tex(D.C0)} - ${tex(D.Cinf, 3)})\,e^{-${r3(D.g * D.T)}} = ${tex(D.key, 3)}$. Without damping it would be $${tex(D.C0 + D.S * D.T, 3)}$ and still growing.`,
              visual: { type: 'graph', params: { x: [0, D.T * 1.5], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 't (units of M)', ylabel: 'C (scaled)', yticks: 0, curves: [{ fn: `${D.Cinf / Math.max(D.C0, D.Cinf)} + (${D.C0 / Math.max(D.C0, D.Cinf)} - ${D.Cinf / Math.max(D.C0, D.Cinf)})*exp(-${D.g}*x)`, color: 'bad', width: 2.4 }], hlines: [{ y: D.Cinf / Math.max(D.C0, D.Cinf), color: 'ink3', label: 'S/γ' }], vlines: [{ x: D.T, color: 'gold' }] }, caption: 'The violation relaxing toward S/γ (scaled; the gold line marks the time asked about).' },
            };
          },
        }),
        mcq({
          id: 'r5-hyper', skill: 'st-b.B15.3', difficulty: 3,
          gen(r) {
            const H = hyperCase(r);
            const choices = ['strongly hyperbolic: real speeds and a full set of eigenvectors', 'weakly hyperbolic only: real speeds, eigenvectors missing', 'not hyperbolic: complex characteristic speeds', 'parabolic'];
            const speeds = H.type === 0 ? t`$0$ and $\pm${r3(H.speed)}$` : H.type === 1 ? 'all three zero' : t`$0$ and $\pm${r3(H.speed)}\,i$`;
            const why = {};
            for (const i of [0, 1, 2]) if (i !== H.type) why[i] = t`For $q = ${H.q}$ the speeds are ${speeds}${H.type === 1 ? ', and the matrix has rank 2: one eigenvector for a triple eigenvalue' : H.type === 0 ? ', three distinct real values' : ''}.`;
            why[3] = 'There are no second derivatives here and no diffusion: the type is set by the eigenvalues and eigenvectors of the principal matrix.';
            return {
              prompt: t`To show the board why the solver uses a BSSN-type formulation, you analyse the Maxwell analogue $a_t = -E_x$, $E_t = -a_x + \Gamma_x$, $\Gamma_t = -q\,E_x$, in which a fraction $1 - q$ of Gauss’s law has been substituted into the $\Gamma$ equation. Its characteristic polynomial is $-\lambda(\lambda^2 + q - 1)$. Classify the system for $q = ${H.q}$.`,
              choices, answer: H.type, why,
              hints: [t`The speeds are $0$ and $\pm\sqrt{1 - q}$.`, t`Real and distinct: strong. All equal: check the eigenvectors (rows 1 and 3 of $\mathsf M$ coincide when $q = 1$). Imaginary: not hyperbolic.`],
              teach: 'How much of a constraint is added decides the characteristic structure: strong, weak, or not hyperbolic at all.',
              explain: t`At $q = ${H.q}$ the speeds are ${speeds}: **${['strongly hyperbolic', 'weakly hyperbolic only', 'not hyperbolic'][H.type]}**. ${H.type === 0 ? 'Errors propagate away at finite speeds — the BSSN-like behaviour.' : H.type === 1 ? 'This is the ADM-like system in disguise: violations sit still and feed growth ∝ kt.' : 'Imaginary speeds mean growth like e^(k t √(q − 1)): worse than ADM.'}`,
              visual: { type: 'graph', params: { x: [0, 2.2], y: [-1.2, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'q', ylabel: 'real speeds', curves: [{ fn: '0*x', color: 'ink3', width: 2 }], vlines: [{ x: H.q, color: 'gold', label: `q = ${H.q}` }] }, caption: 'The zero speed exists for every q; whether the other two are real is the question.' },
            };
          },
        }),
        multi({
          id: 'r5-gauge', skill: 'st-b.B15.2', difficulty: 3,
          gen(r) {
            const G = gaugeCase(r);
            const why = {};
            G.picks.forEach((p, i) => { if (p.box !== '0') why[i] = t`$\Box(${p.tex.replace(/^r = .*/, 'r')}) = ${p.box} \ne 0$.`; });
            return {
              prompt: t`The solver’s Friday runs use harmonic coordinates: each coordinate must satisfy $\Box f = -\partial_t^2f + \nabla^2 f = 0$. In flat spacetime ($c = 1$, Cartesian $t, x, y, z$), which of these functions could serve as harmonic coordinates? (Select all that apply.)`,
              choices: G.picks.map((p) => t`$${p.tex}$`), answer: G.answer, why,
              hints: [t`Compute $-\partial_t^2 f + \partial_x^2 f + \partial_y^2 f + \partial_z^2 f$ for each.`, t`Watch the sign of the time term: $\Box(t^2) = -2$ but $\Box(t^2 + x^2) = 0$. For the radius, $\nabla^2 r = 2/r$.`],
              teach: 'Harmonic coordinates satisfy the wave equation □xᵘ = 0 — with the minus sign on the time derivatives.',
              explain: t`Harmonic: ${G.picks.filter((p) => p.box === '0').map((p) => t`$${p.tex}$`).join(', ')}. Not: ${G.picks.filter((p) => p.box !== '0').map((p) => t`$${p.tex.replace(/^r = .*/, 'r')}$ ($\Box = ${p.box}$)`).join(', ')}. In curved spacetime $\Box$ uses the metric itself — that is what turns Einstein’s equations into wave equations (Choquet-Bruhat, 1952).`,
              visual: player({ mode: 'wave', init: 'pluck', profile: 'gauss', w: 0.8, c: 1, t: 2, tmax: 5, x: [-8, 8], probe: [1, 4] }, 'Harmonic coordinates are themselves solutions of the wave equation, like this pulse (a one-dimensional illustration).'),
            };
          },
        }),
      ],
    },
  ],
});
