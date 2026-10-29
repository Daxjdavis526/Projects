// The st-e boss, "The Methods Marathon": Kestrel, an imagined small probe, on
// its way to a contact-binary asteroid. Round 1, signals on the pad: a heater's
// pulse train (a Fourier coefficient), a pressure step's Gibbs overshoot, and
// the power in a square wave's first harmonics (Parseval). Round 2, cruise:
// a laser pulse's minimum bandwidth (σ_tσ_f = 1/4π), the decay time of an
// attitude loop from its poles, and a Rayleigh-quotient bound on a solar-array
// boom's torsional mode. Round 3, instruments: the dark lines of a
// Hermite–Gauss laser mode, the energy in a Gaussian pulse's range gate
// (erf), and the carrier-null test of the radio's phase modulator (a zero of
// J₀). Round 4, arrival: the quadrupole of the two-lobed asteroid (Pₗ), and a
// heater ring on an annular radiator plate (a Sturm–Liouville Green's
// function). Round 5, shapes and series: a pressure-loaded sensor diaphragm
// (a functional derivative in 2D) and the Chebyshev series of a thrust ramp
// (Bernstein ellipse). Every number comes from a generator; the case
// functions are exported so a script can recompute every key another way.
import { boss, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { besselZero } from '../../src/viz/model/pde2-membrane.js';
import { SF, gpic, hermiteCoef, polyExpr, r3, r4, PI } from './_sf.js';
import { GIBBS_FRAC } from './_fa.js';

const t = String.raw;
const lg = Math.log10;

/** Keep only the slips whose values are finite and clearly apart from the key (and from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  return kept;
}

// ── round 1: signals ────────────────────────────────────────────────────────
/** A heater driven by a pulse train: height H (V), duty fraction D; the fundamental's amplitude (2H/π) sin πD. */
export function pulseCase(r) {
  const H = r.pick([5, 12, 28]), D = r.pick([0.1, 0.2, 0.25, 0.3, 0.4]), Tp = r.pick([2, 5, 10]);
  return { H, D, Tp, key: ((2 * H) / PI) * Math.sin(PI * D) };
}
/** A pressure step from p1 to p2 (kPa) rebuilt from many harmonics: the partial sums peak at p2 + 0.0895 (p2 − p1). */
export function gibbsCase(r) {
  const p1 = r.pick([100, 120, 250]), J = r.pick([40, 60, 150, 300]);
  return { p1, p2: p1 + J, J, key: p1 + J + GIBBS_FRAC * J };
}
/** A square wave's power in its harmonics through N: Σ over odd k ≤ N of 8/(π²k²). */
export function parsevalCase(r) {
  const N = r.pick([1, 3, 5, 7, 9]);
  let s = 0;
  for (let k = 1; k <= N; k += 2) s += 8 / (PI * PI * k * k);
  return { N, key: 100 * s };
}

// ── round 2: cruise ─────────────────────────────────────────────────────────
/** A Gaussian laser pulse of rms duration σ_t (ns): the smallest rms bandwidth, σ_f = 1/(4πσ_t), in MHz. */
export function bandwidthCase(r) {
  const st = r.pick([0.5, 1, 2, 4, 8]);
  return { st, key: 1e3 / (4 * PI * st) };
}
/** Attitude loop ω²/(s² + 2ζωs + ω²): poles −ζω ± iω√(1 − ζ²); time for the envelope to fall to 1%. */
export function polesCase(r) {
  const w = r.pick([0.5, 0.8, 1.2, 2]), z = r.pick([0.15, 0.25, 0.4, 0.6]);
  return { w, z, re: -z * w, im: w * Math.sqrt(1 - z * z), key: Math.log(100) / (z * w) };
}
/** Torsion of a boom clamped at the hub, free at the tip: trial x(2L − x) gives R = 2.5/L², so f ≤ c√2.5/(2πL). */
export function boomCase(r) {
  const L = r.pick([2, 3, 5, 8]), c = r.pick([3100, 3180]);
  return { L, c, key: (c * Math.sqrt(2.5)) / (2 * PI * L), exact: c / (4 * L) };
}

// ── round 3: instruments ────────────────────────────────────────────────────
/** A Hermite–Gauss mode TEMₙ₀, field ∝ Hₙ(√2x/w)e^(−x²/w²): the outermost dark line at x = w·u/√2, u the largest zero of Hₙ. */
export function modeCase(r) {
  const n = r.pick([2, 3, 4, 5]), w = r.pick([0.8, 1.5, 2.5, 4]);
  const zs = SF.roots((u) => SF.hermite(n, u), 0.01, 6, 0.005);
  const u = zs[zs.length - 1];
  let peak = 0;
  for (let i = 0; i <= 2000; i++) { const x = -3.2 * w + (6.4 * w * i) / 2000, v = SF.hermite(n, (Math.SQRT2 * x) / w) ** 2 * Math.exp((-2 * x * x) / (w * w)); peak = Math.max(peak, v); }
  return { n, w, u, zs, peak: +peak.toPrecision(8), key: (w * u) / Math.SQRT2 };
}
/** A Gaussian pulse, intensity ∝ e^(−t²/2σ²): the share of its energy inside a gate ±τ, erf(τ/σ√2), in %. */
export function gateCase(r) {
  const sigma = r.pick([1.5, 2, 3, 5]), k = r.pick([0.5, 1, 1.5, 2.5]);
  const tau = +(k * sigma).toFixed(3);
  const erf = (x) => (2 / Math.sqrt(PI)) * SF.integrate((v) => Math.exp(-v * v), 0, x, 20);
  return { sigma, tau, key: 100 * erf(tau / (sigma * Math.SQRT2)), erf };
}
/** Phase modulation at f_m: the carrier vanishes first at β = j₀,₁, so the peak frequency deviation is βf_m. */
export function nullCase(r) {
  const fm = r.pick([1, 2.5, 4, 10]);
  const j01 = besselZero(0, 1);
  return { fm, j01, key: j01 * fm };
}

// ── round 4: arrival ────────────────────────────────────────────────────────
/** Two equal lobes a distance d apart: the quadrupole's share of the potential, (d/2r)² P₂(cos θ), in %. */
export function lobesCase(r) {
  const d = r.pick([10, 16, 22]), R = r.pick([60, 80, 120]), th = r.pick([0, 20, 40, 70, 90]);
  const x = Math.cos((th * PI) / 180);
  return { d, R, th, x, key: 100 * (d / (2 * R)) ** 2 * SF.legendre(2, x) };
}
/** A heater ring (power Q, radius s) on an annular plate a < r < b held cold at both edges: ΔT = Q/(2πkh) · ln(s/a) ln(b/s)/ln(b/a). */
export function ringCase(r) {
  const a = r.pick([5, 8]), b = r.pick([20, 25, 30]), s = r.pick([10, 12, 15]), Q = r.pick([5, 10, 20]), k = r.pick([150, 200]), h = r.pick([1, 2]);
  const G = (Math.log(s / a) * Math.log(b / s)) / Math.log(b / a);
  return { a, b, s, Q, k, h, G, key: (Q / (2 * PI * k * h * 1e-3)) * G };
}

// ── round 5: shapes and series ──────────────────────────────────────────────
/** A circular diaphragm, radius a (mm), tension T (N/m), pressure p (Pa): −T∇²w = p, centre deflection pa²/4T, in μm. */
export function diaphragmCase(r) {
  const a = r.pick([3, 5, 8]), T = r.pick([50, 100, 200]), p = r.pick([200, 500, 1000]);
  return { a, T, p, key: ((p * (a * 1e-3) ** 2) / (4 * T)) * 1e6 };
}
/** A thrust ramp tanh(t/τ) stored as a Chebyshev series on −T ≤ t ≤ T: poles at x = ±iπτ/2T, ρ = β + √(1 + β²), N ≈ 10/log₁₀ρ. */
export function rampCase(r) {
  const tau = r.pick([0.2, 0.5, 1, 2]), T = r.pick([5, 10, 30]);
  const beta = (PI * tau) / (2 * T), rho = SF.bernsteinRho(0, beta);
  return { tau, T, beta, rho, key: Math.ceil(10 / lg(rho)) };
}

const pulsePic = (C) => gpic({ x: [-C.Tp, C.Tp], y: [-0.15 * C.H, 1.25 * C.H], xlabel: 't (s)', yticks: 4, curves: [{ fn: `${C.H}*step(${(C.D * C.Tp) / 2} - abs(x - ${C.Tp}*floor(x/${C.Tp} + 0.5)))`, color: 'warn', width: 2.3, samples: 2000 }] }, `Two periods of the heater drive: ${C.H} V for a fraction ${C.D} of each ${C.Tp} s period, 0 otherwise.`);

export default boss({
  title: 'The Methods Marathon',
  intro: t`*Kestrel* is an imagined small probe bound for a **contact binary** — an asteroid made of two lobes resting against each other, like Arrokoth, which New Horizons flew past in 2019. You are on its analysis team, and every subsystem hands you a problem that one of this course’s methods solves: Fourier series and transforms for its signals, poles and Rayleigh quotients for its control and structure, orthogonal polynomials and Bessel functions for its instruments, Legendre series and Green’s functions on arrival, and variational calculus and Chebyshev series at the end. Five rounds, thirteen problems, no hints, one try each. Every number is computed; the probe is not real, the methods are.`,
  pass: 0.7,
  rounds: [
    {
      title: 'Signals on the pad',
      story: t`Before launch, the ground station records Kestrel’s housekeeping signals: a pulsed heater, a pressure sensor that sees a sudden step, and a square-wave clock line. Each is a periodic signal, so each is a Fourier series.`,
      items: [
        num({
          id: 'r1-pulse', skill: 'st-e.E1.2', difficulty: 3,
          gen(r) {
            const C = pulseCase(r);
            return {
              prompt: t`A battery heater is driven by a pulse train: $${C.H}\ \text{V}$ for a fraction $D = ${C.D}$ of each period, $0\ \text{V}$ for the rest. The heater’s slow thermal response passes mainly the **fundamental**. What is the amplitude of the fundamental (the $n = 1$ harmonic) in the Fourier series of the drive, in volts? (Take $t = 0$ at the middle of a pulse.)`,
              answer: C.key, units: 'V', tol: { rel: 0.005 },
              errors: apart([
                { value: (2 * C.H) / PI, feedback: t`$2H/\pi$ is the fundamental of a square wave ($D = \tfrac12$). For duty fraction $D$ the coefficient carries $\sin(\pi D)$.` },
                { value: C.H * C.D, feedback: t`$HD$ is the average, the $a_0/2$ term — the dc level, not the fundamental.` },
                { value: 2 * C.H * C.D, feedback: t`$2HD$ is the small-$D$ limit of $\frac{2H}{\pi}\sin\pi D$; at $D = ${C.D}$ use the sine.` },
              ], C.key),
              hints: [
                t`The pulse is even about $t = 0$, so only cosines appear: $a_n = \dfrac{2}{T}\displaystyle\int_{-DT/2}^{DT/2}H\cos\frac{2\pi nt}{T}\,dt$.`,
                t`That integral gives $a_n = \dfrac{2H}{n\pi}\sin(n\pi D)$.`,
              ],
              teach: 'A Fourier coefficient is a projection: for a pulse of duty fraction D the n-th is (2H/nπ) sin(nπD).',
              explain: t`$a_1 = \dfrac{2\times${C.H}}{\pi}\sin(${C.D}\pi) = ${r4(C.key)}$ V. The coefficients fall like $1/n$ because the drive jumps, and $\sin(n\pi D)$ silences every harmonic with $nD$ a whole number — at $D = \tfrac12$ the even ones.`,
              visual: pulsePic(C),
            };
          },
        }),
        num({
          id: 'r1-gibbs', skill: 'st-e.E2.2', difficulty: 3,
          gen(r) {
            const C = gibbsCase(r);
            return {
              prompt: t`A tank-pressure channel jumps from $${C.p1}\ \text{kPa}$ to $${C.p2}\ \text{kPa}$, and the ground software rebuilds the record from its Fourier series truncated at a few hundred harmonics. What is the highest reading the rebuilt signal shows just after the step, in kPa?`,
              answer: C.key, units: 'kPa', tol: { rel: 0.002 },
              errors: apart([
                { value: C.p2, feedback: 'Adding harmonics never removes the overshoot near a jump; it only narrows it (Gibbs).' },
                { value: C.p2 * (1 + GIBBS_FRAC), feedback: 'The overshoot is a fraction of the jump, not of the level: a constant offset changes nothing.' },
                { value: C.p2 + 2 * GIBBS_FRAC * C.J, feedback: t`The overshoot is $${r4(GIBBS_FRAC)}$ of the jump $J$ beyond the upper level, not twice that.` },
              ], C.key, 0.002, 0.002),
              hints: [t`The Gibbs overshoot tends to $\big(\tfrac{1}{\pi}\operatorname{Si}(\pi) - \tfrac12\big)J \approx ${r4(GIBBS_FRAC)}\,J$ beyond the upper level.`, t`Here $J = ${C.J}$ kPa.`],
              teach: 'A truncated Fourier series overshoots a jump by about 8.95% of the jump, however many terms are kept.',
              explain: t`$${C.p2} + ${r4(GIBBS_FRAC)}\times${C.J} = ${r4(C.key)}$ kPa. An alarm threshold set just above $${C.p2}$ kPa would trip on the reconstruction alone; tapering the coefficients (Fejér, Lanczos) removes the ringing at the cost of a softer edge.`,
              visual: gpic({ x: [-PI, PI], y: [C.p1 - 0.3 * C.J, C.p2 + 0.3 * C.J], yticks: 0, xlabel: 'time (one period)', curves: [{ fn: `${C.p1} + ${C.J}*step(x)`, color: 'ink3', dash: [5, 4], width: 1.4, domain: [-3.14, 3.14] }, { sum: `${C.p1 + C.J / 2}*step(1.5 - k) + ${C.J / 2}*4/((2k - 1)*pi)*sin((2k - 1)*x)`, k: [1, 15], color: 'accent', width: 2.2 }] }, 'The step (dashed) and a partial sum with 15 odd harmonics (blue); the pressure scale is hidden.'),
            };
          },
        }),
        num({
          id: 'r1-parseval', skill: 'st-e.E2.3', difficulty: 3,
          gen(r) {
            const C = parsevalCase(r);
            const odd = [...Array(C.N + 1).keys()].filter((k) => k % 2);
            return {
              prompt: t`Kestrel’s clock line is a square wave switching between $\pm A$. A filter passes its harmonics up to $n = ${C.N}$ and blocks the rest. What percentage of the square wave’s power gets through? (The square wave’s sine coefficients are $b_n = \dfrac{4A}{n\pi}$ for odd $n$.)`,
              answer: C.key, units: '%', tol: { rel: 0.002 },
              errors: apart([
                { value: (100 * 4) / (PI * PI) * odd.reduce((s, k) => s + 1 / (k * k), 0), feedback: t`Each harmonic $b\sin n\omega t$ carries mean power $b^2/2$; against the total $A^2$ that is $8/(\pi^2n^2)$, not $4/(\pi^2n^2)$.` },
                { value: (100 * 4) / PI * odd.reduce((s, k) => s + 1 / k, 0) / 4, feedback: 'Power goes as the square of each amplitude.' },
                { value: 100 * (8 / (PI * PI)) * odd.length, feedback: t`Each harmonic’s share falls as $1/n^2$: the $n$-th carries $8/(\pi^2n^2)$, not the same as the fundamental.` },
              ], C.key),
              hints: [t`Parseval: the mean power $A^2$ equals $\sum b_n^2/2$.`, t`So harmonic $n$ carries a share $\dfrac{(4A/n\pi)^2/2}{A^2} = \dfrac{8}{\pi^2n^2}$; add these for $n = ${odd.join(', ')}$.`],
              teach: 'Parseval’s theorem shares a signal’s power among its harmonics: each carries |coefficient|²/2.',
              explain: t`$\dfrac{8}{\pi^2}\Big(${odd.map((k) => (k === 1 ? '1' : t`\tfrac{1}{${k * k}}`)).join(' + ')}\Big) = ${r4(C.key)}\%$. The fundamental alone carries $8/\pi^2 = 81.06\%$; the rest is spread thinly over the sharp edges.`,
              visual: gpic({ x: [0, 12], y: [0, 0.9], xlabel: 'harmonic n', ylabel: 'share of power', points: [1, 3, 5, 7, 9, 11].map((k) => ({ x: k, y: 8 / (PI * PI * k * k), color: k <= C.N ? 'accent' : 'ink4', r: 5 })), vlines: [{ x: C.N + 0.5, color: 'gold' }] }, 'Each odd harmonic’s share of the power (dots) and the filter’s cutoff (gold).'),
            };
          },
        }),
      ],
    },
    {
      title: 'Cruise',
      story: t`On the way out, Kestrel’s ranging laser fires short Gaussian pulses, its attitude loop steadies the probe after every thruster firing, and its solar-array booms must not twist in resonance with the reaction wheels.`,
      items: [
        num({
          id: 'r2-bandwidth', skill: 'st-e.E3.3', difficulty: 3,
          gen(r) {
            const C = bandwidthCase(r);
            return {
              prompt: t`The ranging laser emits Gaussian pulses of rms duration $\sigma_t = ${C.st}\ \text{ns}$ (the rms width of $|f(t)|^2$). What is the smallest possible rms bandwidth $\sigma_f$ of the pulse, in MHz? (Uncertainty principle of signals: $\sigma_t\sigma_\omega \ge \tfrac12$, with equality for Gaussians.)`,
              answer: C.key, units: 'MHz', tol: { rel: 0.005 },
              errors: apart([
                { value: 1e3 / (2 * PI * C.st), feedback: t`$\sigma_\omega = 1/(2\sigma_t)$ is in rad/s; in hertz divide by $2\pi$: $\sigma_f = 1/(4\pi\sigma_t)$.` },
                { value: 1e3 / (2 * C.st), feedback: t`That is $\sigma_\omega$ in rad per μs; convert to frequency, $\sigma_f = \sigma_\omega/2\pi$.` },
                { value: 1e3 / (4 * PI * C.st) * 1e3, feedback: '1 ns⁻¹ is 1000 MHz, not 10⁶ MHz.' },
              ], C.key),
              hints: [t`For a Gaussian, $\sigma_t\sigma_\omega = \tfrac12$ exactly.`, t`$\sigma_f = \sigma_\omega/2\pi = 1/(4\pi\sigma_t)$, and $1/\text{ns} = 1000$ MHz.`],
              teach: t`A pulse cannot be both short and narrow-band: $\sigma_t\sigma_f \ge 1/4\pi$, with equality only for a Gaussian.`,
              explain: t`$\sigma_f = \dfrac{1}{4\pi\times${C.st}\ \text{ns}} = ${r4(C.key)}$ MHz. A shorter pulse ranges more precisely but needs a wider receiver bandwidth, which lets in more noise — the trade every ranging system makes.`,
              visual: gpic({ x: [-4 * C.st, 4 * C.st], y: [0, 1.1], xlabel: 't (ns)', yticks: 0, curves: [{ fn: `e^(-x^2/(2*${C.st * C.st}))`, color: 'accent', width: 2.3 }] }, 'The pulse’s intensity |f(t)|² against time.'),
            };
          },
        }),
        num({
          id: 'r2-poles', skill: 'st-e.E4.1', difficulty: 3,
          gen(r) {
            const C = polesCase(r);
            return {
              prompt: t`After a thruster pulse, Kestrel’s attitude error obeys a loop with transfer function $H(s) = \dfrac{${r4(C.w * C.w)}}{s^2 + ${r4(2 * C.z * C.w)}s + ${r4(C.w * C.w)}}$. From its poles, how long does the oscillation’s envelope take to fall to 1% of its initial size, in seconds?`,
              answer: C.key, units: 's', tol: { rel: 0.005 },
              errors: apart([
                { value: Math.log(100) / C.w, feedback: t`The decay rate is the poles’ real part, $\zeta\omega = ${r4(C.z * C.w)}$ s⁻¹, not their distance from the origin.` },
                { value: Math.log(100) / C.im, feedback: 'The imaginary part sets the oscillation frequency; the real part sets the decay.' },
                { value: 1 / (C.z * C.w), feedback: t`$1/(\zeta\omega)$ is one e-folding. Falling to 1% takes $\ln 100 \approx 4.6$ of them.` },
              ], C.key),
              hints: [t`Poles: $s = -\zeta\omega \pm i\omega\sqrt{1 - \zeta^2}$ with $\omega^2 = ${r4(C.w * C.w)}$ and $2\zeta\omega = ${r4(2 * C.z * C.w)}$.`, t`The envelope is $e^{\operatorname{Re}(s)\,t}$; solve $e^{-\zeta\omega t} = 0.01$.`],
              teach: 'Each pole contributes $e^{st}$: its real part sets the decay rate, its imaginary part the oscillation.',
              explain: t`The poles are $${r4(C.re)} \pm ${r4(C.im)}i$ s⁻¹, so the envelope is $e^{${r4(C.re)}t}$ and $t = \ln 100/${r4(-C.re)} = ${r4(C.key)}$ s. Both poles in the left half-plane: the loop is stable.`,
              visual: gpic({ x: [-2.5, 0.6], y: [-2.3, 2.3], equal: true, xlabel: 'Re s (1/s)', ylabel: 'Im s', points: [{ x: C.re, y: C.im, color: 'bad', r: 6 }, { x: C.re, y: -C.im, color: 'bad', r: 6 }] }, 'The two poles of H(s) in the s-plane.'),
            };
          },
        }),
        num({
          id: 'r2-boom', skill: 'st-e.E5.2', difficulty: 4,
          gen(r) {
            const C = boomCase(r);
            return {
              prompt: t`A solar-array boom of length $L = ${C.L}\ \text{m}$ is clamped at the hub and free at the tip. Its torsional twist $\theta(x)$ obeys $-\theta'' = (\omega/c)^2\theta$ with $\theta(0) = 0$, $\theta'(L) = 0$ and torsional wave speed $c = ${C.c}\ \text{m/s}$. Using the Rayleigh quotient $\big(\frac\omega c\big)^2 \le \dfrac{\int_0^L\theta'^2dx}{\int_0^L\theta^2dx}$ with the trial $\theta = x(2L - x)$, give the upper bound on the fundamental frequency, in Hz.`,
              answer: C.key, units: 'Hz', tol: { rel: 0.003 },
              errors: apart([
                { value: C.exact, feedback: t`That is the exact fundamental, $c/4L$; the trial gives a slightly higher **bound**.` },
                { value: (C.c * Math.sqrt(10)) / (2 * PI * C.L), feedback: t`$x(L - x)$ is the clamped–clamped trial (its slope at the tip is not zero). The free tip needs a trial like $x(2L - x)$.` },
                { value: (C.c * 2.5) / (2 * PI * C.L), feedback: t`The quotient bounds $(\omega/c)^2$: take the square root.` },
              ], C.key, 0.003, 0.003),
              hints: [t`$\int_0^L(2L - 2x)^2dx = \tfrac43L^3$ and $\int_0^Lx^2(2L - x)^2dx = \tfrac{8}{15}L^5$.`, t`So $(\omega/c)^2 \le 2.5/L^2$ and $f \le \dfrac{c\sqrt{2.5}}{2\pi L}$.`],
              teach: 'Any trial function obeying the essential boundary condition gives an upper bound on the lowest eigenvalue.',
              explain: t`$\big(\frac\omega c\big)^2 \le \dfrac{4L^3/3}{8L^5/15} = \dfrac{2.5}{L^2}$, so $f \le \dfrac{${C.c}\sqrt{2.5}}{2\pi\times${C.L}} = ${r4(C.key)}$ Hz, only $${r3((100 * (C.key - C.exact)) / C.exact)}\%$ above the exact $c/4L = ${r4(C.exact)}$ Hz. At the free tip only $\theta(0) = 0$ must be imposed: the zero-slope condition is natural, and comes out of the minimization.`,
              visual: gpic({ x: [0, C.L], y: [0, 1.15], xlabel: 'x (m)', yticks: 0, curves: [{ fn: `sin(pi*x/(2*${C.L}))`, color: 'ink3', width: 1.5, dash: [6, 4] }, { fn: `x*(2*${C.L} - x)/${C.L * C.L}`, color: 'accent', width: 2.3 }] }, 'The trial twist (blue, scaled to 1 at the tip) and the true mode sin(πx/2L) (dashed).'),
            };
          },
        }),
      ],
    },
    {
      title: 'Instruments',
      story: t`Kestrel’s lidar uses a Hermite–Gauss beam and a timing gate on its returns; its radio phase-modulates the carrier, and the engineers calibrate the modulator by making the carrier disappear.`,
      items: [
        num({
          id: 'r3-mode', skill: 'st-e.E6.2', difficulty: 3,
          gen(r) {
            const C = modeCase(r);
            return {
              prompt: t`The lidar’s beam runs in the Hermite–Gauss mode TEM$_{${C.n}0}$, whose field across the beam is $E(x) \propto H_{${C.n}}\big(\sqrt2\,x/w\big)\,e^{-x^2/w^2}$ with beam radius $w = ${C.w}\ \text{mm}$. How far from the axis is its **outermost** dark line, in mm?`,
              answer: C.key, units: 'mm', tol: { rel: 0.005 },
              errors: apart([
                { value: C.w * C.u, feedback: t`The argument is $\sqrt2x/w$: a zero at $u$ sits at $x = wu/\sqrt2$.` },
                { value: (C.w * C.zs[0]) / Math.SQRT2, feedback: 'That is the innermost nonzero dark line; the question asks for the outermost.' },
                { value: (C.w * Math.sqrt(2 * C.n + 1)) / Math.SQRT2, feedback: t`$\sqrt{2n + 1}$ only bounds the zeros of $H_n$; find the largest zero itself.` },
              ], C.key, 0.005, 0.005),
              hints: [t`Dark lines are the zeros of $H_{${C.n}}(u)$ with $u = \sqrt2x/w$.`, t`$H_{${C.n}}$ by the recurrence $H_{k+1} = 2uH_k - 2kH_{k-1}$; its largest zero is $u = ${r4(C.u)}$.`],
              teach: 'An orthogonal polynomial’s zeros are where its mode is dark; Hₙ has n real zeros, spread out to about ±√(2n + 1).',
              explain: t`The largest zero of $H_{${C.n}}$ is $u = ${r4(C.u)}$, so $x = ${C.w}\times${r4(C.u)}/\sqrt2 = ${r4(C.key)}$ mm. The mode has ${C.n} dark lines in all, symmetric about the axis.`,
              visual: gpic({ x: [-3.2 * C.w, 3.2 * C.w], y: [0, 1.1], xlabel: 'x (distance scale hidden)', xticks: 0, yticks: 0, curves: [{ fn: `(${polyExpr(hermiteCoef(C.n), `(sqrt(2)*x/${C.w})`)})^2*e^(-2*x^2/${C.w * C.w})/${C.peak}`, color: 'accent', width: 2.3, samples: 1500 }] }, `The intensity across the TEM${'₀₁₂₃₄₅'[C.n]}₀ beam (distance scale hidden): its dark lines are the zeros of the Hermite polynomial.`),
            };
          },
        }),
        num({
          id: 'r3-gate', skill: 'st-e.E9.2', difficulty: 3,
          gen(r) {
            const C = gateCase(r);
            return {
              prompt: t`A lidar return pulse has intensity $\propto e^{-t^2/2\sigma^2}$ with $\sigma = ${C.sigma}\ \text{ns}$. The receiver integrates only during a gate $-${C.tau} \le t \le ${C.tau}\ \text{ns}$ centred on the peak. What percentage of the pulse energy does it collect?`,
              answer: C.key, units: '%', tol: { rel: 0.003 },
              errors: apart([
                { value: 100 * C.erf(C.tau / C.sigma), feedback: t`Rescale with $u = t/(\sigma\sqrt2)$: the argument is $\tau/(\sigma\sqrt2)$.` },
                { value: 50 * C.erf(C.tau / (C.sigma * Math.SQRT2)), feedback: 'The gate is two-sided, from −τ to +τ.' },
              ], C.key, 0.004, 0.004),
              hints: [t`Fraction $= \dfrac{\int_{-\tau}^{\tau}e^{-t^2/2\sigma^2}dt}{\sigma\sqrt{2\pi}} = \operatorname{erf}\Big(\dfrac{\tau}{\sigma\sqrt2}\Big)$.`, t`$\tau/(\sigma\sqrt2) = ${r4(C.tau / (C.sigma * Math.SQRT2))}$.`],
              teach: 'Gaussian energy inside a finite window is an error-function value.',
              explain: t`$\operatorname{erf}(${r4(C.tau / (C.sigma * Math.SQRT2))}) = ${r4(C.key / 100)}$, so $${r4(C.key)}\%$. A wider gate collects more signal but also more background light.`,
              visual: gpic({ x: [-4 * C.sigma, 4 * C.sigma], y: [0, 1.1], xlabel: 't (ns)', yticks: 0, curves: [{ fn: `e^(-x^2/(2*${C.sigma * C.sigma}))`, color: 'accent', width: 2.3 }], shade: [{ fn: `e^(-x^2/(2*${C.sigma * C.sigma}))`, from: -C.tau, to: C.tau, alpha: 0.2 }], vlines: [{ x: -C.tau, color: 'gold' }, { x: C.tau, color: 'gold' }] }, 'The return pulse and the gate (gold).'),
            };
          },
        }),
        num({
          id: 'r3-null', skill: 'st-e.E8.1', difficulty: 3,
          gen(r) {
            const C = nullCase(r);
            return {
              prompt: t`The radio phase-modulates its carrier with a test tone of frequency $f_m = ${C.fm}\ \text{kHz}$: the signal is $\cos(\omega_ct + \beta\sin2\pi f_mt)$, and by the generating function $e^{i\beta\sin\phi} = \sum_nJ_n(\beta)e^{in\phi}$ the carrier line has amplitude $J_0(\beta)$. Engineers raise $\beta$ until the carrier line first vanishes. What peak frequency deviation $\Delta f = \beta f_m$ does that set, in kHz?`,
              answer: C.key, units: 'kHz', tol: { rel: 0.003 },
              errors: apart([
                { value: besselZero(1, 1) * C.fm, feedback: t`$3.832$ is the first zero of $J_1$, where the first sidebands vanish. The carrier is $J_0$.` },
                { value: PI * C.fm, feedback: t`$J_0$’s first zero is not at $\pi$: it is $j_{0,1} = ${r4(C.j01)}$ (computed, not $\pi$; the large-$x$ form puts it near $3\pi/4$).` },
                { value: C.fm, feedback: t`$\beta = 1$ leaves $J_0(1) = ${r4(SF.besselJ(0, 1))}$ of the carrier amplitude.` },
              ], C.key, 0.003, 0.003),
              hints: [t`The carrier vanishes where $J_0(\beta) = 0$; the first zero is $j_{0,1}$.`, t`$j_{0,1} = ${r4(C.j01)}$, so $\Delta f = ${r4(C.j01)}\times${C.fm}$ kHz.`],
              teach: 'The zeros of J₀ make a precise calibration: the carrier of a phase- or frequency-modulated signal vanishes at β = 2.405, 5.520, ….',
              explain: t`$\beta = j_{0,1} = ${r4(C.j01)}$, so $\Delta f = ${r4(C.key)}$ kHz. This “Bessel null” method calibrates FM deviation to a fraction of a per cent with nothing but a spectrum analyser.`,
              visual: gpic({ x: [0, 2], y: [-1.3, 1.3], xlabel: 'time (ms, schematic)', yticks: 0, curves: [{ fn: `cos(40*x + ${r4(C.j01)}*sin(2*pi*x))`, color: 'accent', width: 1.5, samples: 2000 }] }, 'A phase-modulated carrier, drawn with a carrier far slower than a real one.'),
            };
          },
        }),
      ],
    },
    {
      title: 'Arrival',
      story: t`Kestrel reaches the two-lobed asteroid. Its navigators need the lobes’ quadrupole to predict the orbit, and its thermal engineers must check a heater ring on the annular radiator that faces the asteroid’s sunlit side.`,
      items: [
        num({
          id: 'r4-lobes', skill: 'st-e.E7.1', difficulty: 4,
          gen(r) {
            const C = lobesCase(r);
            return {
              prompt: t`Model the contact binary as two equal point masses a distance $d = ${C.d}\ \text{km}$ apart. Kestrel is $r = ${C.R}\ \text{km}$ from the centre, at angle $\theta = ${C.th}^\circ$ from the line through the lobes. Using $\dfrac{1}{|\vec r - \vec r\,'|} = \sum_l\dfrac{r'^l}{r^{l+1}}P_l(\cos\gamma)$, by what percentage does the quadrupole term change the potential compared with a single point of the same total mass? (Include the sign.)`,
              answer: C.key, units: '%', tol: { rel: 0.005, abs: 1e-4 },
              errors: apart([
                { value: -C.key, feedback: t`Sign: the bracket is $1 + (d/2r)^2P_2(\cos\theta) + \cdots$ — positive along the lobes’ axis, negative across it.` },
                { value: 100 * (C.d / C.R) ** 2 * SF.legendre(2, C.x), feedback: t`Each lobe is $d/2$ from the centre: the ratio is $(d/2r)^2$.` },
                { value: 100 * (C.d / (2 * C.R)) ** 2, feedback: t`Multiply by $P_2(\cos${C.th}^\circ) = ${r4(SF.legendre(2, C.x))}$.` },
              ], C.key, 0.01, 0.01),
              hints: [t`For each lobe $r' = d/2$ and $\cos\gamma = \pm\cos\theta$; the odd $l$ cancel between the two.`, t`The bracket is $1 + \big(\tfrac{d}{2r}\big)^2P_2(\cos\theta)$, with $P_2(x) = \tfrac12(3x^2 - 1)$.`],
              teach: 'A multipole term is (size/distance)ˡ times Pₗ of the direction: the quadrupole of two lobes strengthens gravity along their axis and weakens it across.',
              explain: t`$\big(\tfrac{${C.d}}{2\times${C.R}}\big)^2\times${r4(SF.legendre(2, C.x))} = ${tex(C.key / 100, 3)}$, i.e. $${r4(C.key)}\%$. Small, but over many orbits such terms make orbits precess — real missions fit dozens of harmonics.`,
              visual: gpic({ x: [-1.1 * C.R, 1.1 * C.R], y: [-0.25 * C.R, 1.15 * C.R], equal: true, xticks: 0, yticks: 0, xlabel: '', points: [{ x: -C.d / 2, y: 0, color: 'gold', r: 7 }, { x: C.d / 2, y: 0, color: 'gold', r: 7 }, { x: C.R * C.x, y: C.R * Math.sin((C.th * PI) / 180), color: 'accent', label: 'Kestrel', labelDx: 8 }], arrows: [{ from: [0, 0], to: [C.R * C.x, C.R * Math.sin((C.th * PI) / 180)], color: 'ink3', width: 1.3, dash: [5, 4] }] }, 'The two lobes (gold, size exaggerated) and the probe’s direction; not to scale.'),
            };
          },
        }),
        num({
          id: 'r4-ring', skill: 'st-e.E10.1', difficulty: 4,
          gen(r) {
            const C = ringCase(r);
            return {
              prompt: t`An annular radiator plate (inner radius $a = ${C.a}\ \text{cm}$, outer $b = ${C.b}\ \text{cm}$, thickness $h = ${C.h}\ \text{mm}$, conductivity $k = ${C.k}\ \text{W/(m K)}$) is held at the sink temperature along both edges. A heater ring of radius $s = ${C.s}\ \text{cm}$ dissipates $Q = ${C.Q}\ \text{W}$. Steady conduction gives $-(r\,T')' = \dfrac{Q}{2\pi kh}\,\delta(r - s)$. With the Green’s function of $-(rT')'$ on $[a, b]$, $G(r, s) = \dfrac{\ln(r_</a)\,\ln(b/r_>)}{\ln(b/a)}$, what is the temperature rise at the heater ring, in K?`,
              answer: C.key, units: 'K', tol: { rel: 0.005 },
              errors: apart([
                { value: (C.Q / (C.k * C.h * 1e-3)) * C.G, feedback: t`The ring spreads $Q$ round a circumference: the source strength is $Q/(2\pi kh)$.` },
                { value: (C.Q / (2 * PI * C.k * C.h * 1e-3)) * ((Math.log10(C.s / C.a) * Math.log10(C.b / C.s)) / Math.log10(C.b / C.a)), feedback: 'Use natural logarithms in G.' },
                { value: (C.Q / (2 * PI * C.k * C.h * 1e-3)) * ((C.s - C.a) * (C.b - C.s)) / (C.b - C.a) / 100, feedback: t`That is the tent for $-T'' $ (a straight strip). The radial operator $-(rT')'$ has logarithms for its homogeneous solutions.` },
              ], C.key),
              hints: [t`$T(s) = \dfrac{Q}{2\pi kh}\,G(s, s)$, with $kh$ in W/K and lengths in consistent units (the logarithms are unitless).`, t`$G(s, s) = \dfrac{\ln(${C.s}/${C.a})\ln(${C.b}/${C.s})}{\ln(${C.b}/${C.a})} = ${r4(C.G)}$.`],
              teach: 'A Sturm–Liouville Green’s function is u₁(r<)u₂(r>)/(−pW): for −(rT′)′ it is built from ln r.',
              explain: t`$\dfrac{Q}{2\pi kh} = \dfrac{${C.Q}}{2\pi\times${C.k}\times${C.h / 1000}} = ${r4(C.Q / (2 * PI * C.k * C.h * 1e-3))}$ K, times $G(s, s) = ${r4(C.G)}$: $\Delta T = ${r4(C.key)}$ K. Here $pW = -1$ for $u_1 = \ln(r/a)$, $u_2 = \ln(b/r)$ divided by $\ln(b/a)$ — constant, as Abel’s theorem demands.`,
              visual: gpic({ x: [C.a, C.b], y: [0, 1.15], xlabel: 'r (cm)', yticks: 0, curves: [{ fn: `(step(${C.s} - x)*ln(x/${C.a})*ln(${C.b}/${C.s}) + step(x - ${C.s})*ln(${C.s}/${C.a})*ln(${C.b}/x))/${Math.log(C.s / C.a) * Math.log(C.b / C.s)}`, color: 'warn', width: 2.3 }], vlines: [{ x: C.s, color: 'gold' }] }, 'The shape of the temperature rise across the plate (scaled to 1 at the heater, gold).'),
            };
          },
        }),
      ],
    },
    {
      title: 'Shapes and series',
      story: t`Last checks before the landing attempt: a pressure sensor’s diaphragm must not bow too far, and the flight software stores the thrust profile of the descent engine as a Chebyshev series that must fit in memory.`,
      items: [
        num({
          id: 'r5-diaphragm', skill: 'st-e.E11.1', difficulty: 4,
          gen(r) {
            const C = diaphragmCase(r);
            return {
              prompt: t`A circular sensor diaphragm of radius $a = ${C.a}\ \text{mm}$, under tension $T = ${C.T}\ \text{N/m}$ and pressure difference $p = ${C.p}\ \text{Pa}$, takes the deflection $w(r)$ that makes $E[w] = \displaystyle\iint\Big(\frac T2|\nabla w|^2 - p\,w\Big)dA$ stationary, with $w = 0$ at the rim. Set $\delta E/\delta w = 0$, solve for the axisymmetric $w$, and give the deflection at the centre, in μm.`,
              answer: C.key, units: 'um', tol: { rel: 0.005 },
              errors: apart([
                { value: ((C.p * (C.a * 1e-3) ** 2) / (8 * C.T)) * 1e6, feedback: t`$pa^2/8T$ is the strip formula $pL^2/8T$ with the radius as the span. The membrane is round: $\nabla^2w = \frac1r(rw')'$ gives $w = \frac{p}{4T}(a^2 - r^2)$.` },
                { value: ((C.p * (C.a * 1e-3) ** 2) / (2 * C.T)) * 1e6, feedback: t`$pa^2/2T$ is the sag of a strip spanning the diameter ($-Tw'' = p$, one-dimensional). In 2D, $\frac1r(rw')' = -p/T$ gives $rw' = -\frac{p}{2T}r^2$ and $w = \frac{p}{4T}(a^2 - r^2)$: held all round, it sags half as much.` },
                { value: (C.p * (C.a * 1e-3) ** 2) / (4 * C.T), feedback: 'That is in metres; the question asks for micrometres.' },
              ], C.key),
              hints: [t`$\delta E/\delta w = -T\nabla^2w - p$, so $-T\nabla^2w = p$.`, t`Axisymmetric: $\frac1r(rw')' = -p/T$, regular at the centre: $w = \frac{p}{4T}(a^2 - r^2)$.`],
              teach: 'The functional derivative of the Dirichlet energy is −∇²: minimizing elastic energy minus work gives Poisson’s equation.',
              explain: t`$w(0) = \dfrac{pa^2}{4T} = \dfrac{${C.p}\times(${C.a}\times10^{-3})^2}{4\times${C.T}} = ${r4(C.key)}$ μm — a paraboloid, half the strip’s sag because the membrane is held all round.`,
              visual: gpic({ x: [-C.a, C.a], y: [-1.2, 0.15], xlabel: 'r (mm)', yticks: 0, curves: [{ fn: `-(1 - x^2/${C.a * C.a})`, color: 'accent', width: 2.3 }], arrows: [-0.6, -0.2, 0.2, 0.6].map((f) => ({ from: [f * C.a, 0.12], to: [f * C.a, -0.25], color: 'gold', width: 1.3 })) }, 'A cut through the deflected diaphragm (depth scale hidden) and the pressure (gold).'),
            };
          },
        }),
        num({
          id: 'r5-ramp', skill: 'st-e.E12.1', difficulty: 4,
          gen(r) {
            const C = rampCase(r);
            return {
              prompt: t`The descent engine’s thrust ramps as $\tanh(t/\tau)$ with $\tau = ${C.tau}\ \text{s}$, and the software stores it on $-T \le t \le T$, $T = ${C.T}\ \text{s}$, as a Chebyshev series in $x = t/T$. $\tanh(Tx/\tau)$ has poles at $x = \pm i\pi\tau/2T$. Assuming $|a_n| \sim \rho^{-n}$ with $\rho$ from the Bernstein ellipse through those poles, about how many terms bring the coefficients down by a factor $10^{10}$?`,
              answer: C.key, tol: { rel: 0, abs: 1.5 },
              errors: apart([
                { value: Math.ceil(10 / lg(1 + C.beta)), feedback: t`$\rho = \beta + \sqrt{1 + \beta^2}$ for poles at $\pm i\beta$, not $1 + \beta$ (they agree only for small $\beta$).` },
                { value: Math.ceil(10 * lg(C.rho)), feedback: t`Divide: $N = 10/\log_{10}\rho$.` },
                { value: Math.ceil(10 / lg(SF.bernsteinRho(0, (PI * C.tau) / C.T))), feedback: t`The poles of $\tanh z$ are at $z = \pm i\pi/2$, so in $x$ they sit at $\pm i\pi\tau/2T$.` },
              ], C.key, 0.08, 0.05),
              hints: [t`$\beta = \pi\tau/2T = ${r4(C.beta)}$ and $\rho = \beta + \sqrt{1 + \beta^2}$.`, t`$N \approx 10/\log_{10}\rho$.`],
              teach: 'The nearest complex singularity fixes a Chebyshev series’ geometric rate; a ramp much sharper than the window needs many terms.',
              explain: t`$\rho = ${r4(C.rho)}$, $\log_{10}\rho = ${r4(lg(C.rho))}$, so $N \approx ${C.key}$ terms. A sharper ramp or a longer window brings the poles toward the interval; splitting the window into pieces is the usual cure.`,
              visual: gpic({ x: [-1, 1], y: [-1.15, 1.15], xlabel: 'x = t / T', curves: [{ fn: `tanh(${C.T / C.tau}*x)`, color: 'accent', width: 2.3, samples: 2000 }] }, 'The thrust ramp over the stored window.'),
            };
          },
        }),
      ],
    },
  ],
});
