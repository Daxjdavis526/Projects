// The Advanced Math D boss, "The Residue Hunt": HALCYON, an imagined
// Saturn mission built on paper from real physics, from the shake table to
// a black hole's ringdown. Round 1 (rational integrals): the mean-square
// response of an instrument mount to random launch vibration, and the noise
// power through a two-pole anti-alias filter. Round 2 (trigonometric
// integrals): the period integral of an eccentric Saturn orbit, and which
// pole the unit circle encloses. Round 3 (Jordan's lemma, indented
// contours): the gust correlation a Titan glider feels, and an indented
// integral from the radar altimeter's design notes. Round 4 (conformal
// maps, potential flow): the chord of the glider's Joukowski wing, the angle
// of attack Titan's thick air demands, and what goes wrong without the Kutta
// condition. Round 5 (causality, quasinormal modes): which filter can run in
// real time, and the pitch and damping time of a supermassive black hole's
// ringdown heard in the spacecraft's Doppler-tracking link. Every number a
// learner reads comes from its generator; the case functions are exported
// so a script can recompute every key another way.
import { boss, mcq, num } from '../../src/core/content.js';
import { num as nm, cxmap } from './_cx.js';
import { contour, circle } from './_cx2.js';
import { indented, pole, plane, realPic, r4, KERR, TSUN } from './_cx3.js';

const t = String.raw;
const PI = Math.PI;
const DEG = PI / 180;
const RHO_TITAN = 5.3;     // kg/m³, near Titan's surface (1.5 bar, 94 K, nitrogen)
const G_TITAN = 1.352;     // m/s²

/** Keep only the slips whose values are finite and clearly apart from the key (and a little apart from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key, rel) && Math.abs(Math.abs(e.value) - Math.abs(key)) > rel * Math.abs(key) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  return kept;
}

// ── round 1: the shake table ────────────────────────────────────────────────
/** Random vibration: I = ∫ du/((1 − u²)² + (2ζu)²) = π/2ζ. */
export function shakeCase(r) {
  const zeta = r.pick([0.02, 0.025, 0.04, 0.05, 0.08]);
  return { zeta, Q: 1 / (2 * zeta), key: PI / (2 * zeta) };
}
/** Noise power through H = ab/((iω + a)(iω + b)): ∫|H|² dω = πab/(a + b), rad/s. */
export function filterCase(r) {
  const [a, b] = r.pick([[10, 40], [20, 50], [5, 30], [100, 400], [60, 90]]);
  return { a, b, key: (PI * a * b) / (a + b) };
}

// ── round 2: Saturn orbit ───────────────────────────────────────────────────
/** The period integral ∫₀^{2π} dθ/(1 + e cos θ)² = 2π/(1 − e²)^{3/2}. */
export function periodCase(r) {
  const e = r.pick([0.3, 0.45, 0.6, 0.75, 0.85]);
  return { e, key: (2 * PI) / (1 - e * e) ** 1.5 };
}
/** ∫ dθ/(1 + e cos θ) → ∮ 2 dz/(i(ez² + 2z + e)): the poles (−1 ± √(1 − e²))/e. */
export function poleCase(r) {
  const e = r.pick([0.4, 0.5, 0.6, 0.8]);
  const s = Math.sqrt(1 - e * e);
  return { e, inside: (-1 + s) / e, outside: (-1 - s) / e, key: (-1 + s) / e };
}

// ── round 3: Titan's air ────────────────────────────────────────────────────
/** Dryden-shaped gust spectrum S = (σ²/π)λ/(λ² + ω²): R(τ) = σ²e^{−λτ}, λ = V/L. */
export function gustCase(r) {
  const V = r.pick([8, 10, 12, 15]), L = r.pick([100, 150, 250]), sig = r.pick([0.4, 0.6, 0.8]), tau = r.pick([3, 5, 10, 15]);
  const lam = V / L;
  return { V, L, sig, tau, lam, key: sig * sig * Math.exp(-lam * tau) };
}
/** ∫₀^∞ sin(ax)/(x(x² + b²)) dx = π(1 − e^{−ab})/2b² (indented contour). */
export function indentCase(r) {
  const a = r.pick([1, 2, 3, 0.5]), b = r.pick([1, 1.5, 2]);
  return { a, b, key: (PI * (1 - Math.exp(-a * b))) / (2 * b * b) };
}

// ── round 4: the glider's wing ──────────────────────────────────────────────
/** Symmetric Joukowski section: ζ = z + c²/z, circle centre −m·c through z = c. Chord c[2 + s + 1/s], s = 1 + 2m. */
export function chordCase(r) {
  const c = r.pick([0.2, 0.25, 0.3, 0.4]), m = r.pick([0.05, 0.1, 0.15, 0.2]);
  const s = 1 + 2 * m;
  return { c, m, key: c * (2 + s + 1 / s) };
}
const GLIDERS = [];
for (const mass of [150, 200, 300, 400]) for (const span of [6, 8, 10]) for (const chord of [0.5, 0.6, 0.8]) for (const U of [8, 10, 12]) {
  const Lp = (mass * G_TITAN) / span, s = Lp / (PI * RHO_TITAN * U * U * chord);
  if (s > Math.sin(2 * DEG) && s < Math.sin(9 * DEG)) GLIDERS.push([mass, span, chord, U]);
}
/** The angle of attack that holds a glider up in Titan's air: sin α = L′/(πρU²c), L′ = mg/b. */
export function glideCase(r) {
  const [mass, span, chord, U] = r.pick(GLIDERS);
  const Lp = (mass * G_TITAN) / span, s = Lp / (PI * RHO_TITAN * U * U * chord);
  return { mass, span, chord, U, Lp, key: Math.asin(s) / DEG };
}
/** Γ = 0 on a cambered airfoil at angle α: the rear stagnation point is the image of the circle point at angle α from the centre — above the trailing edge's −β, so on the upper surface. */
export function kuttaCase(r) {
  const alpha = r.pick([4, 6, 8, 10]);
  return { alpha };
}

// ── round 5: the ringdown ──────────────────────────────────────────────────
/** Four candidate filters, each a pole pair ±a + ib; exactly one has every pole below the axis. */
export function causalCase(r) {
  const a = [r.pick([0.8, 1, 1.2]), r.pick([0.6, 1.5]), r.pick([0.9, 1.3]), r.pick([0.7, 1.1])];
  const b = [-r.pick([0.2, 0.3, 0.4]), r.pick([0.2, 0.3]), r.pick([0.15, 0.25]), r.pick([0.2, 0.35])];
  const good = r.int(0, 3);
  const set = a.map((ak, k) => (k === good ? [{ re: ak, im: -Math.abs(b[k]) }] : k === (good + 1) % 4 ? [{ re: ak, im: Math.abs(b[k]) }] : k === (good + 2) % 4 ? [{ re: ak, im: -Math.abs(b[k]) }, { re: ak + 0.6, im: Math.abs(b[k]) }] : [{ re: ak, im: Math.abs(b[k]) }, { re: ak + 0.5, im: Math.abs(b[k]) + 0.2 }]));
  return { set, good };
}
/** A supermassive ringdown heard in the Doppler link: f = Re(Mω)/(2π(1 + z)M), τ = (1 + z)M/|Im(Mω)|. */
export function ringCase(r) {
  const M = r.pick([5e5, 1e6, 3e6, 1e7]), [chi, wr, wi] = r.pick([KERR[2], KERR[5], KERR[7]]), z = r.pick([0, 0.3, 1]);
  const Mo = M * (1 + z) * TSUN;
  return { M, chi, wr, wi, z, Mo, f: wr / (2 * PI * Mo), tau: Mo / -wi };
}

const ringPic = (wr, wi, caption) => ({ type: 'cx3-causal', params: { poles: [{ re: r4(wr), im: r4(wi) }], drag: false, showT: false, readout: false, panels: ['w', 't'], t: 10, T: [-10, 80], window: { re: [-0.8, 0.8], im: [-0.3, 0.12] }, names: { w: 'Mω', t: 't/M', G: 'h(t)' }, labels: false, arc: false }, caption });
const flowPic = (params, caption) => ({ type: 'cx3-flow', params: { readout: false, dots: false, controls: [], x: [-3.2, 3.2], y: [-1.6, 1.6], ...params }, caption });

export default boss({
  title: 'The Residue Hunt',
  intro: t`HALCYON is an imagined Saturn mission, built on paper from real physics. It must survive the shake of launch, settle into an eccentric orbit, drop a glider into Titan’s thick, cold air — and, in its spare time, turn its radio link into a gravitational-wave detector, as Cassini once did, listening for the millihertz ringing of supermassive black holes. Every number you need is an integral or a pole. Leave the real line and hunt them down.`,
  pass: 0.7,
  rounds: [
    {
      title: 'The shake table',
      story: t`Before launch, HALCYON is bolted to a shake table that plays back the random roar of a rocket. The engineers want to know how hard its instruments will ride — which comes down to integrals of rational functions over every frequency.`,
      items: [
        num({
          id: 'r1-shake', skill: 'st-d.D9.1', difficulty: 3,
          gen(r) {
            const C = shakeCase(r), { zeta, Q, key } = C;
            return {
              prompt: t`The magnetometer boom rides a structural mode with damping ratio $\zeta = ${zeta}$ (quality factor $Q = ${nm(Q, 3)}$). Under random vibration with a flat spectrum, its mean-square response is proportional to $$I = \int_{-\infty}^{\infty}\frac{du}{(1 - u^2)^2 + (2\zeta u)^2},$$ where $u$ is the frequency in units of the mode’s natural frequency. Evaluate $I$.`,
              visual: realPic({ fn: `1/((1 - x^2)^2 + ${+(4 * zeta * zeta).toFixed(6)}*x^2)`, x: [-2.2, 2.2], y: [0, 1.1 * Q * Q], xlabel: 'u = ω/ωₙ', caption: t`The squared gain of the mode: two sharp peaks of height $Q^2$. The shaded area is $I$.` }),
              answer: key, tol: { rel: 0.005 },
              errors: apart([
                { value: Q * Q, feedback: t`$Q^2$ is the height of a peak, not the area: the width shrinks like $\zeta$.` },
                { value: PI / zeta, feedback: t`Only the two poles above the axis, $\pm\sqrt{1 - \zeta^2} + i\zeta$, are inside the contour; their residues add to $1/(4i\zeta)$.` },
                { value: PI * Q * Q, feedback: t`The area scales like $Q$, not $Q^2$.` },
              ], key),
              hints: [
                t`The denominator is $|1 - u^2 + 2i\zeta u|^2$; its zeros are $u = \pm\sqrt{1 - \zeta^2} \pm i\zeta$.`,
                t`Close in the upper half-plane. The two upper residues add to $\dfrac{1}{4i\zeta}$.`,
                t`So $I = 2\pi i\cdot\dfrac{1}{4i\zeta} = \dfrac{\pi}{2\zeta} = \pi Q$.`,
              ],
              teach: t`The area under a resonance’s squared gain is $\pi/2\zeta = \pi Q$: mean-square response grows like $Q$.`,
              explain: t`$I = \pi/2\zeta = ${nm(key, 4)}$. Halving the damping doubles the mean-square response and multiplies the rms by $\sqrt2$ — the $\sqrt Q$ of Miles’ equation. (A flat input spectrum is the test standard’s idealisation; real launch spectra are shaped.)`,
            };
          },
        }),
        num({
          id: 'r1-filter', skill: 'st-d.D9.1', difficulty: 3,
          gen(r) {
            const C = filterCase(r), { a, b, key } = C;
            return {
              prompt: t`The accelerometers’ signals pass through an anti-alias filter $H(i\omega) = \dfrac{ab}{(i\omega + a)(i\omega + b)}$ with real poles at $a = ${a}$ and $b = ${b}$ rad/s. The noise power it lets through is proportional to $\displaystyle\int_{-\infty}^{\infty}|H(i\omega)|^2\,d\omega$. Evaluate it, in rad/s.`,
              visual: realPic({ fn: `${a * a * b * b}/((x^2 + ${a * a})*(x^2 + ${b * b}))`, x: [-4 * b, 4 * b], y: [0, 1.15], xlabel: 'ω (rad/s)', caption: t`The filter’s power gain $|H|^2$: $1$ at $\omega = 0$, falling off beyond about $${a}$ rad/s. The shaded area is the integral.` }),
              answer: key, units: 'rad/s', tol: { rel: 0.005 },
              errors: apart([
                { value: PI / (a * b * (a + b)), feedback: t`$|H|^2 = \dfrac{a^2b^2}{(\omega^2 + a^2)(\omega^2 + b^2)}$: keep the $a^2b^2$ on top.` },
                { value: (a * b) / (2 * (a + b)), feedback: t`That is the integral divided by $2\pi$ — an integral over frequency in hertz. The question asks for $\int|H|^2\,d\omega$ itself.` },
                { value: (PI * a * a) / (a + b), feedback: 'Both poles contribute; recheck the residues at ia and ib.' },
              ], key),
              hints: [t`$|H|^2 = \dfrac{a^2b^2}{(\omega^2 + a^2)(\omega^2 + b^2)}$: poles at $\pm ia$, $\pm ib$.`, t`D9.1: $\displaystyle\int\frac{d\omega}{(\omega^2 + a^2)(\omega^2 + b^2)} = \frac{\pi}{ab(a + b)}$.`, t`Multiply by $a^2b^2$.`],
              teach: t`$\int|H|^2d\omega$ for a two-pole filter is $\pi ab/(a + b)$: a sum of two upper-half-plane residues.`,
              explain: t`$a^2b^2\cdot\dfrac{\pi}{ab(a + b)} = \dfrac{\pi ab}{a + b} = \dfrac{\pi\times${a * b}}{${a + b}} = ${nm(key, 4)}$ rad/s. Dividing by $4\pi$ (half the line, and hertz instead of rad/s) gives the filter’s equivalent noise bandwidth, $${nm(key / (4 * PI), 3)}$ Hz.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Saturn orbit',
      story: t`Seven years later HALCYON brakes into a long, looping orbit round Saturn. The navigators average over a full turn — and a full turn is a closed contour.`,
      items: [
        num({
          id: 'r2-period', skill: 'st-d.D9.2', difficulty: 3,
          gen(r) {
            const C = periodCase(r), { e, key } = C;
            return {
              prompt: t`HALCYON’s orbit is $r = p/(1 + e\cos\theta)$ with eccentricity $e = ${e}$. Its period is $T = \dfrac{p^2}{h}\displaystyle\int_0^{2\pi}\frac{d\theta}{(1 + e\cos\theta)^2}$, with $h$ the angular momentum per unit mass. Evaluate the integral.`,
              visual: { type: 'graph', params: { x: [-(1 + e) - 0.25, 1 - e + 0.5], y: [-1.2 * Math.sqrt(1 - e * e), 1.2 * Math.sqrt(1 - e * e)], equal: true, xlabel: '', ylabel: '', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ polar: `${r4(1 - e * e)}/(1 + ${e}*cos(theta))`, theta: [0, 2 * PI], color: 'accent', width: 2.4 }], points: [{ x: 0, y: 0, label: 'Saturn', color: 'gold', r: 6 }] }, caption: 'The orbit drawn with semi-major axis 1. Saturn (not to scale) sits at the focus.' },
              answer: key, tol: { rel: 0.005 },
              errors: apart([
                { value: (2 * PI) / Math.sqrt(1 - e * e), feedback: t`That is $\int d\theta/(1 + e\cos\theta)$. Squaring makes the inner pole double: its residue needs a derivative.` },
                { value: (2 * PI) / (1 - e * e), feedback: t`The exponent is $\tfrac32$: $\dfrac{2\pi}{(1 - e^2)^{3/2}}$.` },
              ], key),
              hints: [t`With $z = e^{i\theta}$ the integrand becomes $\dfrac{4z}{i(ez^2 + 2z + e)^2}$: a double pole at the inner root.`, t`Or differentiate $\displaystyle\int_0^{2\pi}\frac{d\theta}{a + e\cos\theta} = \frac{2\pi}{\sqrt{a^2 - e^2}}$ with respect to $a$, then set $a = 1$.`, t`$-\dfrac{\partial}{\partial a}\dfrac{2\pi}{\sqrt{a^2 - e^2}} = \dfrac{2\pi a}{(a^2 - e^2)^{3/2}}$.`],
              teach: t`$\int_0^{2\pi}\frac{d\theta}{(1 + e\cos\theta)^2} = \frac{2\pi}{(1 - e^2)^{3/2}}$, which turns into Kepler’s third law.`,
              explain: t`$\dfrac{2\pi}{(1 - ${nm(e * e, 4)})^{3/2}} = ${nm(key, 4)}$. With $p = a(1 - e^2)$ and $h = \sqrt{\mu p}$ this gives $T = 2\pi\sqrt{a^3/\mu}$ — Kepler’s third law, from a residue.`,
            };
          },
        }),
        mcq({
          id: 'r2-pole', skill: 'st-d.D9.2', difficulty: 2,
          gen(r) {
            const C = poleCase(r), { e, inside, outside } = C;
            const f = (v) => nm(v, 3);
            return {
              prompt: t`To average $1/r$ over HALCYON’s orbit ($e = ${e}$), the navigators write $\displaystyle\int_0^{2\pi}\frac{d\theta}{1 + ${e}\cos\theta} = \oint_{|z| = 1}\frac{2\,dz}{i(${e}z^2 + 2z + ${e})}$. Which pole’s residue do they need?`,
              visual: realPic({ fn: `1/(1 + ${e}*cos(x))`, x: [0, 2 * PI], y: [0, 1.15 / (1 - e)], xlabel: 'θ', caption: 'The integrand over one turn; the shaded area is the integral.', extra: { xticks: 4 } }),
              choices: [t`$z = ${f(inside)}$`, t`$z = ${f(outside)}$`, t`$z = 0$`, t`$z = ${f(-e)}$`],
              answer: 0,
              why: {
                1: t`$|${f(outside)}| > 1$: that root is outside the unit circle. The two roots multiply to $1$, so exactly one is inside.`,
                2: t`The $z$ from $\cos\theta$ and the $z$ from $d\theta = dz/(iz)$ cancel: there is no pole at the origin.`,
                3: t`$-${e}$ is not a root: $${e}(${e})^2 - 2(${e}) + ${e} \ne 0$. Solve the quadratic.`,
              },
              hints: [t`The roots of $${e}z^2 + 2z + ${e}$ are $\dfrac{-1 \pm \sqrt{1 - ${e}^2}}{${e}}$.`, 'Their product is 1: one is inside the unit circle, one outside.'],
              teach: t`With $z = e^{i\theta}$, only the poles inside the unit circle count; reciprocal pairs put exactly one inside.`,
              explain: t`The roots are $${f(inside)}$ and $${f(outside)}$, multiplying to $1$. The inside one gives $\operatorname{Res} = \dfrac{2}{i\cdot2\sqrt{1 - e^2}}$, so the integral is $\dfrac{2\pi}{\sqrt{1 - e^2}} = ${nm((2 * PI) / Math.sqrt(1 - e * e), 4)}$.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Titan’s air',
      story: t`HALCYON releases its glider into Titan’s atmosphere: nitrogen four times denser than Earth’s air at the surface, in a gravity one seventh of ours. The flight engineers model the gusts and design a radar altimeter — Fourier integrals both.`,
      items: [
        num({
          id: 'r3-gust', skill: 'st-d.D9.3', difficulty: 3,
          gen(r) {
            const C = gustCase(r), { V, L, sig, tau, lam, key } = C;
            return {
              prompt: t`Assume Titan’s near-surface gusts have a Dryden-shaped spectrum, $$S(\omega) = \frac{\sigma^2}{\pi}\frac{\lambda}{\lambda^2 + \omega^2},\qquad \lambda = \frac{V}{L},$$ for the glider flying at $V = ${V}$ m/s through turbulence of scale $L = ${L}$ m and intensity $\sigma = ${sig}$ m/s. The gust correlation is $R(\tau) = \int_{-\infty}^{\infty}S(\omega)\cos\omega\tau\,d\omega$. Find $R$ at $\tau = ${tau}$ s, in $\text{m}^2/\text{s}^2$.`,
              visual: realPic({ fn: `${r4((sig * sig * lam) / PI)}/(${r4(lam * lam)} + x^2)`, x: [-6 * lam, 6 * lam], y: [0, (1.15 * sig * sig) / (PI * lam)], xlabel: 'ω (rad/s)', caption: t`The assumed gust spectrum: a Lorentzian of half-width $\lambda = V/L$. Titan’s real turbulence spectrum has not been measured; the shape is the mission’s modelling assumption.` }),
              answer: key, units: 'm^2/s^2', tol: { rel: 0.005 },
              errors: apart([
                { value: sig * sig, feedback: t`$\sigma^2$ is $R(0)$; the residue at $i\lambda$ brings $e^{-\lambda\tau}$.` },
                { value: sig * sig * Math.exp(-tau / lam), feedback: t`$\lambda = V/L = ${nm(lam, 3)}\ \text{s}^{-1}$ multiplies $\tau$.` },
                { value: sig * Math.exp(-lam * tau), feedback: t`$S$ carries $\sigma^2$: square the intensity.` },
              ], key),
              hints: [t`Write $\cos\omega\tau = \operatorname{Re}e^{i\omega\tau}$ and close above for $\tau > 0$: the pole is at $i\lambda$.`, t`$\operatorname{Res} = \dfrac{\sigma^2\lambda}{\pi}\cdot\dfrac{e^{-\lambda\tau}}{2i\lambda}$, so $R = \sigma^2e^{-\lambda\tau}$.`],
              teach: 'A Lorentzian spectrum transforms into an exponential correlation: the pole’s height is the decay rate.',
              explain: t`$R = ${sig}^2e^{-${nm(lam * tau, 3)}} = ${nm(key, 4)}\ \text{m}^2/\text{s}^2$. The gusts lose their memory after $L/V = ${nm(1 / lam, 3)}$ s.`,
            };
          },
        }),
        num({
          id: 'r3-indent', skill: 'st-d.D9.3', difficulty: 4,
          gen(r) {
            const C = indentCase(r), { a, b, key } = C;
            return {
              prompt: t`A step in the radar altimeter’s design notes needs $$I = \int_0^{\infty}\frac{\sin(${nm(a, 3)}x)}{x\,(x^2 + ${nm(b * b, 3)})}\,dx.$$ Evaluate it.`,
              visual: plane({ f: `exp(${a}*i*z)/(z*(z^2 + ${b * b}))`, contour: indented(2.4 * b, 0.25 * b), marks: [pole(0, 0, '0'), pole(0, b, `${nm(b, 3)}i`), pole(0, -b, `−${nm(b, 3)}i`)], x: [-2.8 * b, 2.8 * b], y: [-1.5 * b, 2.8 * b] }, t`The indented contour for $e^{${nm(a, 3)}iz}/(z(z^2 + ${nm(b * b, 3)}))$: it steps over the pole at $0$ and encloses the one above.`),
              answer: key, tol: { rel: 0.005 },
              errors: apart([
                { value: PI / (2 * b * b), feedback: t`That is the half-residue at $0$ alone. The pole at $${nm(b, 3)}i$ is inside and contributes $-\pi e^{-ab}/(2b^2)$ after halving.` },
                { value: (PI * (1 - Math.exp(-a * b))) / (b * b), feedback: 'That is the whole line; the integrand is even, so halve.' },
                { value: (PI * (1 + Math.exp(-a * b))) / (2 * b * b), feedback: t`The residue at $ib$ is $-e^{-ab}/(2b^2)$: mind its sign.` },
              ], key),
              hints: [t`Integrate $\dfrac{e^{iaz}}{z(z^2 + b^2)}$ round the indented contour; the small semicircle contributes $-\pi i\operatorname{Res}_0$.`, t`$\operatorname{Res}_0 = 1/b^2$; $\operatorname{Res}_{ib} = -e^{-ab}/(2b^2)$.`, t`$\text{PV}\!\int_{-\infty}^\infty = \pi i\operatorname{Res}_0 + 2\pi i\operatorname{Res}_{ib}$; take the imaginary part and halve.`],
              teach: 'A pole on the path counts half: indent round it.',
              explain: t`$\text{PV}\!\int_{-\infty}^\infty \frac{e^{iax}}{x(x^2 + b^2)}dx = \frac{\pi i}{b^2}(1 - e^{-ab})$, so $I = \frac{\pi(1 - e^{-${nm(a * b, 3)}})}{2\times${nm(b * b, 3)}} = ${nm(key, 4)}$.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Wings over Titan',
      story: t`The glider’s wing section is drawn the old way: a circle, mapped by Joukowski. In air this thick and gravity this weak, a light glider can fly slowly — if the circulation is right.`,
      items: [
        num({
          id: 'r4-chord', skill: 'st-d.D10.1', difficulty: 3,
          gen(r) {
            const C = chordCase(r), { c, m, key } = C;
            return {
              prompt: t`The wing section is the image of a circle under $\zeta = z + \dfrac{c^2}{z}$ with $c = ${c}$ m. The circle passes through $z = c$ (the critical point, which becomes the sharp trailing edge at $\zeta = 2c$) and is centred at $z = -${m}c$ on the real axis, so it crosses the axis again at $z = -${nm(1 + 2 * m, 3)}c$. How long is the chord, from trailing edge to leading edge, in metres?`,
              visual: cxmap({ f: 'joukowski', x: [-2, 1.6], y: [-1.4, 1.4], wx: [-2.6, 2.6], wy: [-1.2, 1.2], grid: 'none', drag: false, zname: 'circle plane (units of c)', wname: 'wing plane ζ (units of c)', curves: [{ param: [`${-m} + ${1 + m}*cos(t)`, `${1 + m}*sin(t)`], t: [0, 2 * PI], color: 'gold' }], points: [{ x: 1, y: 0, label: 'c', wlabel: '2c', color: 'bad' }, { x: -(1 + 2 * m), y: 0, label: '', wlabel: '', color: 'accent' }] }, t`The circle and its image, drawn in units of $c$: a symmetric Joukowski airfoil.`),
              answer: key, units: 'm', tol: { rel: 0.005 },
              errors: apart([
                { value: 4 * c, feedback: t`$4c$ is the flat plate’s chord ($m = 0$). With thickness the leading edge moves further out: $J(-${nm(1 + 2 * m, 3)}c) = -c\left(${nm(1 + 2 * m, 3)} + \frac{1}{${nm(1 + 2 * m, 3)}}\right)$.` },
                { value: c * (2 + (1 + 2 * m)), feedback: t`Map the leading point too: $J(z) = z + c^2/z$ adds $c^2/z$.` },
                { value: 2 * c * (1 + m), feedback: 'That is the circle’s diameter; the map stretches it.' },
              ], key),
              hints: [t`The trailing edge is $J(c) = 2c$.`, t`The leading edge is $J(-sc) = -c\left(s + \dfrac1s\right)$ with $s = ${nm(1 + 2 * m, 3)}$.`, t`Chord $= 2c + c\left(s + \dfrac1s\right)$.`],
              teach: 'Map the extreme points of the circle to find the airfoil’s extent; the cusp is the image of the critical point.',
              explain: t`Chord $= c\left(2 + ${nm(1 + 2 * m, 3)} + \frac{1}{${nm(1 + 2 * m, 3)}}\right) = ${nm(key, 4)}$ m. The thickness parameter $m$ barely lengthens the chord (by $c\,m^2$-sized terms) but rounds the nose, which keeps the flow attached at higher angles.`,
            };
          },
        }),
        num({
          id: 'r4-alpha', skill: 'st-d.D10.2', difficulty: 4,
          gen(r) {
            const C = glideCase(r), { mass, span, chord, U, Lp, key } = C;
            return {
              prompt: t`The glider has mass $${mass}$ kg, span $${span}$ m and chord $${chord}$ m, and glides at $U = ${U}$ m/s in Titan’s near-surface air ($\rho = ${RHO_TITAN}\ \text{kg/m}^3$, $g = ${G_TITAN}\ \text{m/s}^2$). Treating the wing as a 2D thin flat plate with uniform lift along the span, at what angle of attack must it fly, in degrees?`,
              visual: flowPic({ mode: 'airfoil', alpha: r4(key), camber: 0, thick: 0.03, kutta: true, stag: false }, 'A thin Joukowski plate at the angle of attack in question, with the Kutta circulation. Ideal flow; the drawing does not show the answer’s value.'),
              answer: key, units: '°', tol: { rel: 0.005 },
              errors: apart([
                { value: (Math.asin((mass * 9.81) / span / (PI * RHO_TITAN * U * U * chord)) / DEG) || NaN, feedback: t`Use Titan’s gravity, $${G_TITAN}\ \text{m/s}^2$, for the weight.` },
                { value: Math.asin(Lp / (PI * 1.225 * U * U * chord)) / DEG || NaN, feedback: t`Use Titan’s air density, $${RHO_TITAN}\ \text{kg/m}^3$.` },
                { value: Math.asin(Lp / (2 * PI * RHO_TITAN * U * U * chord)) / DEG, feedback: t`For a plate $L' = \pi\rho U^2c\sin\alpha$ (that is $\tfrac12\rho U^2c\cdot2\pi\sin\alpha$): no extra 2.` },
              ], key),
              hints: [t`Lift per span: $L' = mg/b = ${nm(Lp, 4)}$ N/m.`, t`Kutta: $\Gamma = \pi Uc\sin\alpha$; Kutta–Joukowski: $L' = \rho U\Gamma = \pi\rho U^2c\sin\alpha$.`, t`$\sin\alpha = \dfrac{L'}{\pi\rho U^2c}$.`],
              teach: 'Kutta condition plus Kutta–Joukowski turn a weight into an angle of attack: sin α = L′/(πρU²c).',
              explain: t`$\sin\alpha = \dfrac{${nm(Lp, 4)}}{\pi\times${RHO_TITAN}\times${U}^2\times${chord}} = ${nm(Math.sin(key * DEG), 4)}$, so $\alpha = ${nm(key, 3)}^\circ$. Thick air and weak gravity let a heavy glider fly slowly — the reason NASA’s Dragonfly rotorcraft is going to Titan. A real 3D wing needs a few degrees more.`,
            };
          },
        }),
        mcq({
          id: 'r4-kutta', skill: 'st-d.D10.2', difficulty: 3,
          gen(r) {
            const C = kuttaCase(r), { alpha } = C;
            return {
              prompt: t`A junior engineer runs the ideal-flow model of the cambered section at $\alpha = ${alpha}^\circ$ with the circulation left at $\Gamma = 0$, as in the picture. What does the model predict, and what fixes it?`,
              visual: flowPic({ mode: 'airfoil', alpha, camber: 0.08, thick: 0.1, kutta: false, gamma: 0, stag: false }, t`The section at $${alpha}^\circ$ with $\Gamma = 0$. Stagnation points not marked.`),
              choices: [
                'The rear stagnation point sits on the upper surface and the air whips round the sharp trailing edge at infinite speed; the Kutta condition chooses the Γ that moves it to the trailing edge, and that Γ gives the lift',
                'The flow already leaves the trailing edge smoothly; the section simply has no lift at this angle',
                'The rear stagnation point sits on the lower surface; adding drag fixes it',
                'There are no stagnation points when Γ = 0',
              ],
              answer: 0,
              why: {
                1: t`Smooth flow off the edge needs a particular nonzero $\Gamma = 4\pi UR\sin(\alpha + \beta)$; at $\Gamma = 0$ the model has no lift at all, which is unphysical.`,
                2: 'With the stream from the left at positive α, the rear stagnation point is carried up and forward onto the upper surface. Ideal flow has no drag to add.',
                3: 'The image of a cylinder flow always has two stagnation points; with Γ = 0 they are images of diametrically opposite points of the circle.',
              },
              hints: ['At Γ = 0, the circle-plane flow has stagnation points at angles α and α + 180°. Where does the rear one land on the airfoil?', 'The trailing edge is the image of z = 1, where J′ = 0: what happens to the velocity there unless dW/dz also vanishes?'],
              teach: 'The Kutta condition picks the one circulation that makes the trailing edge a stagnation point; the lift follows from it.',
              explain: t`With $\Gamma = 0$ the rear stagnation point is upstream of the trailing edge on the upper surface, and the flow turns round the cusp with infinite velocity. Real air cannot do that: viscosity sheds a starting vortex until the flow leaves the edge smoothly. The model imitates this by setting $\Gamma = 4\pi UR\sin(\alpha + \beta)$, giving lift $\rho U\Gamma$.`,
            };
          },
        }),
      ],
    },
    {
      title: 'The ringdown',
      story: t`On the long cruise home HALCYON’s radio link is quiet, so the team turns it into an instrument: a gravitational wave passing between Earth and the spacecraft makes the link’s Doppler shift wobble. Cassini tried this; HALCYON hopes to catch a supermassive black hole ringing in the millihertz band.`,
      items: [
        mcq({
          id: 'r5-causal', skill: 'st-d.D11.1', difficulty: 3,
          gen(r) {
            const C = causalCase(r), { set, good } = C;
            const COL = ['accent', 'violet', 'teal', 'warn'];
            const pts = set.flatMap((ps, k) => ps.flatMap((q) => [{ x: r4(q.re), y: r4(q.im), label: String(k + 1), color: COL[k], r: 5 }, { x: r4(-q.re), y: r4(q.im), color: COL[k], r: 5 }]));
            const desc = (ps) => ps.map((q) => t`$\pm${nm(q.re, 3)} ${q.im < 0 ? '-' : '+'} ${nm(Math.abs(q.im), 3)}i$`).join(' and ');
            return {
              prompt: t`The Doppler data are cleaned in real time by a digital filter, whose response function must be causal. Four candidate filters have their poles (in the complex frequency plane) at: filter 1: ${desc(set[0])}; filter 2: ${desc(set[1])}; filter 3: ${desc(set[2])}; filter 4: ${desc(set[3])}. Which one can run in real time — never responding before its input?`,
              visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-0.7, 0.8], equal: true, xlabel: 'Re ω', ylabel: 'Im ω', points: pts, hlines: [{ y: 0, color: 'ink3' }] }, caption: 'The four filters’ poles, numbered (each pole has a mirror partner at −Re ω).' },
              choices: [`Filter ${good + 1}`, `Filter ${((good + 1) % 4) + 1}`, `Filter ${((good + 2) % 4) + 1}`, `Filter ${((good + 3) % 4) + 1}`],
              answer: 0,
              why: {
                1: 'Its poles lie above the real axis: closing the contour above for t < 0 encloses them, so it responds before its input.',
                2: 'One of its pole pairs lies below the axis, but the other is above — enough to make it respond before the input.',
                3: 'All its poles are above the axis: a purely advanced response.',
              },
              hints: [t`For $t < 0$ the inverse transform closes in the upper half-plane.`, 'A causal response has no poles there: every pole must lie below the real axis.'],
              teach: 'Causal ⇔ analytic in the upper half-plane ⇔ every pole below the real axis.',
              explain: t`Only filter ${good + 1} has every pole below the axis, so its response vanishes for $t < 0$ and it can run in real time. Each of the others has at least one pole pair above the axis, which the upper contour encloses for $t < 0$: a response before the cause.`,
            };
          },
        }),
        num({
          id: 'r5-pitch', skill: 'st-d.D11.2', difficulty: 3,
          gen(r) {
            const C = ringCase(r), { M, chi, wr, wi, z, f } = C;
            return {
              prompt: t`Two galaxies’ central black holes merge into one of $${nm(M / 1e6, 3)}\times10^6\,M_\odot$, spinning at $\chi = ${chi}$, ${z === 0 ? 'nearby (ignore redshift)' : t`at redshift $z = ${z}$`}. Its fundamental mode is at $M\omega = ${wr.toFixed(4)} - ${(-wi).toFixed(4)}\,i$ ($G = c = 1$; $GM_\odot/c^3 = 4.9255\ \mu\text{s}$). At what frequency does HALCYON hear it ring, in mHz?`,
              visual: ringPic(wr, wi, t`The pole for $\chi = ${chi}$ and the ringdown it makes, in units of $M$.`),
              answer: f * 1e3, units: 'mHz', tol: { rel: 0.005 },
              errors: apart([
                { value: (wr / (M * TSUN * (1 + z))) * 1e3, feedback: t`$\operatorname{Re}\omega$ is an angular frequency: divide by $2\pi$.` },
                ...(z > 0 ? [{ value: (wr / (2 * PI * M * TSUN)) * 1e3, feedback: t`Expansion stretches the wave: divide by $1 + z = ${1 + z}$.` }] : []),
                { value: (0.37367 / (2 * PI * M * TSUN * (1 + z))) * 1e3, feedback: t`That is the non-spinning value; use $${wr.toFixed(4)}$ for $\chi = ${chi}$.` },
              ], f * 1e3),
              hints: [t`$GM/c^3 = ${nm(M, 3)}\times4.9255\ \mu\text{s} = ${nm(M * TSUN, 4)}$ s.`, t`Emitted: $f = \dfrac{${wr.toFixed(4)}}{2\pi\,GM/c^3}$.${z > 0 ? t` Received: divide by $1 + z$.` : ''}`],
              teach: 'f = Re(Mω)/(2π GM/c³), divided by 1 + z on arrival: supermassive ringdowns sit in the millihertz band.',
              explain: t`$f = \dfrac{${wr.toFixed(4)}}{2\pi\times${nm(M * TSUN, 4)}\ \text{s}${z > 0 ? t`\times${1 + z}` : ''}} = ${nm(f * 1e3, 4)}$ mHz. (Spacecraft Doppler tracking is sensitive near 0.1–1 mHz but far less than LISA will be; this is a thought experiment at the edge of feasibility.)`,
            };
          },
        }),
        num({
          id: 'r5-tau', skill: 'st-d.D11.2', difficulty: 3,
          gen(r) {
            const C = ringCase(r), { M, chi, wr, wi, z, tau } = C;
            return {
              prompt: t`For a $${nm(M / 1e6, 3)}\times10^6\,M_\odot$ remnant spinning at $\chi = ${chi}$ (fundamental mode $M\omega = ${wr.toFixed(4)} - ${(-wi).toFixed(4)}\,i$)${z === 0 ? ', nearby' : t` at redshift $z = ${z}$`}, how long does the ringdown take to fall by a factor $e$ as HALCYON records it — the damping time $\tau$, in seconds?`,
              visual: ringPic(wr, wi, 'The pole and its ringdown in units of M: its distance below the axis sets the decay.'),
              answer: tau, units: 's', tol: { rel: 0.005 },
              errors: apart([
                { value: (M * TSUN * (1 + z)) / wr, feedback: t`$\tau$ comes from the imaginary part: $\tau = M/|\operatorname{Im}(M\omega)|$.` },
                ...(z > 0 ? [{ value: (M * TSUN) / -wi, feedback: t`Redshift stretches durations too: multiply by $1 + z$.` }] : []),
                { value: (M * TSUN * (1 + z)) / -wi / (2 * PI), feedback: t`No $2\pi$ here: $\tau = 1/|\operatorname{Im}\omega|$ directly.` },
              ], tau),
              hints: [t`$GM/c^3 = ${nm(M * TSUN, 4)}$ s; $\tau = \dfrac{GM/c^3}{${(-wi).toFixed(4)}}$ in the source’s frame.`, z > 0 ? t`Received durations are longer by $1 + z = ${1 + z}$.` : 'No redshift to correct for.'],
              teach: 'τ = (1 + z) GM/c³ / |Im Mω|: a millionfold heavier hole rings a millionfold longer.',
              explain: t`$\tau = ${z > 0 ? `${1 + z}\\times` : ''}\dfrac{${nm(M * TSUN, 4)}\ \text{s}}{${(-wi).toFixed(4)}} = ${nm(tau, 4)}$ s — ${tau > 120 ? `${nm(tau / 60, 3)} minutes` : 'under two minutes'} of fading tone, with quality factor $${nm(wr / (2 * -wi), 3)}$, set by the spin alone.`,
            };
          },
        }),
      ],
    },
  ],
});
