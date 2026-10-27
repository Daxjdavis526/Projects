// The Kerr metric: horizons, ergosphere and the 42% efficiency limit —
// Derivation Mode. Boyer–Lindquist form, G = c = 1, a = J/M. Checked with
// SymPy: R_μν = 0 (exact arithmetic at test points); g^rr = Δ/Σ, so the
// surfaces r = const are null where Δ = r² − 2Mr + a² = 0: r± = M ± √(M² − a²);
// g_tt = 0 at r_E = M + √(M² − a²cos²θ); g_tt g_φφ − g_tφ² = −Δ sin²θ; the
// window of angular velocities Ω± = ω ± √(ω² − g_tt/g_φφ), ω = −g_tφ/g_φφ,
// closes on Ω_H = a/(r₊² + a²) = a/(2Mr₊); BPT circular-orbit E and L solve
// the equatorial geodesic equations; dE/dr = 0 ⇔ r² − 6Mr ± 8a√(Mr) − 3a² = 0;
// at a = M, E = (x² + x − 1)/(x^{3/2}√(x + 2)) rises for all x = √(r/M) > 1, so
// E_ISCO → 1/√3 and 1 − 1/√3 = 42.3%; retrograde ISCO 9M, E = 5√3/9, 3.77%;
// horizon area 4π(r₊² + a²) = 8πMr₊, M_irr = √(A/16π). Near a = M the BL
// radii of horizon, photon orbit and ISCO all approach M but stay distinct
// places (proper distances computed). Avoids gr.S26.i (no-hair, r₊ and
// ergosphere numbers, ergosphere angle, Ω_H in turns per second, efficiency
// from a given ISCO, Penrose process, a > M, Gravity Probe B, quasar power,
// Earth's a/M) and gr.EQ.9 (the cross term, a → 0, r₋ numbers, the Sun's
// spin, which component vanishes at the ergosurface, Σ = 0, ergosphere
// thickness, the far field).
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { M_SUN, T_SUN, sci, round, metricTable } from './_classic.js';
import { kerr, kerrExpr } from './_frontier.js';

const t = String.raw;

// ─── circular equatorial orbits (Bardeen, Press & Teukolsky 1972), M = 1 ─────
const E_PRO = '(x^1.5 - 2*x^0.5 + a)/(x^0.75*sqrt(x^1.5 - 3*x^0.5 + 2*a))';
const E_RET = '(x^1.5 - 2*x^0.5 - a)/(x^0.75*sqrt(x^1.5 - 3*x^0.5 - 2*a))';
const RPH_PRO = '2*(1 + cos((2/3)*acos(-a)))', RPH_RET = '2*(1 + cos((2/3)*acos(a)))';   // photon orbits
const eCirc = (r, a, s = 1) => (r ** 1.5 - 2 * r ** 0.5 + s * a) / (r ** 0.75 * Math.sqrt(r ** 1.5 - 3 * r ** 0.5 + 2 * s * a));

// ─── the window of allowed angular velocities in the equatorial plane, M = 1 ──
const window = (a, r) => {
  const gtt = -(1 - 2 / r), gtp = -2 * a / r, gpp = r * r + a * a + 2 * a * a / r;
  const w = -gtp / gpp, d = Math.sqrt(w * w - gtt / gpp);
  return { lo: w - d, w, hi: w + d };
};
const omegaBand = (a, { labels = true, caption } = {}) => {
  const g = `(x^2 + ${round(a * a, 6)} + ${round(2 * a * a, 6)}/x)`, w = `(${round(2 * a, 6)}/x)/${g}`;
  const d = `sqrt(${w}^2 + (1 - 2/x)/${g})`;
  const rp = round(kerr.rPlus(a), 6), OH = round(kerr.omegaH(a), 6);
  return {
    type: 'graph',
    params: {
      x: [1, 6], y: [-0.2, 0.45], xlabel: 'r / M', ylabel: 'Ω × M',
      shade: [{ fn: `${w} + ${d}`, lower: `${w} - ${d}`, from: rp, to: 6, color: 'accent', alpha: 0.16 }],
      curves: [
        { fn: `${w} + ${d}`, domain: [rp, 6], color: 'gold', width: 2.2, ...(labels ? { label: 'Ω₊: light going with the spin', labelAt: 4.1, labelDx: 6, labelDy: -10 } : {}) },
        { fn: `${w} - ${d}`, domain: [rp, 6], color: 'violet', width: 2.2, ...(labels ? { label: 'Ω₋: light going against it', labelAt: 4.1, labelDx: 6, labelDy: 14 } : {}) },
        { fn: w, domain: [rp, 6], color: 'accent', width: 1.6, dash: true, ...(labels ? { label: 'ω: zero angular momentum', labelAt: 3.2, labelDx: 6, labelDy: -8 } : {}) },
      ],
      hlines: [{ y: 0 }],
      vlines: [{ x: rp, label: 'horizon', color: 'ink2' }, { x: 2, label: 'ergosphere edge', color: 'bad' }],
      points: [{ x: rp, y: OH, color: 'accent', r: 5, ...(labels ? { label: 'Ωₕ', labelDx: -8, labelDy: -8, labelAlign: 'right' } : {}) }],
    },
    caption: caption ?? t`The angular velocities $\Omega = d\phi/dt$ allowed to anything at radius $r$ in the equatorial plane of a hole with $a = ${a}M$ ($G = c = 1$; $\Omega$ in units of $1/M$): the shaded window between the two light rays. Outside $r = 2M$ the lower edge is negative — you can stand still, or even go against the spin. Inside the ergosphere both edges are positive: everything turns with the hole. At the horizon the window closes on $\Omega_H$.`,
  };
};

// ─── the equatorial plane seen from above (Boyer–Lindquist r as radius) ─────
// what: the legend text for the coloured circle; against: that orbit runs against the spin
const topView = ({ a, r, what, against = false, caption }) => {
  const rp = round(kerr.rPlus(a), 6), R = round(r, 6), col = against ? 'violet' : 'accent';
  const at = (ang, rad = 0.62) => [round(rad * Math.cos(ang), 5), round(rad * Math.sin(ang), 5)];
  const key = (y, label, color) => ({ x: -9.6, y, r: 0.01, color, label, labelDx: 0, labelDy: 0, labelAlign: 'left' });
  return {
    type: 'graph',
    params: {
      x: [-10, 4], y: [-3.4, 3.4], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: `sqrt(${rp}^2 - x^2)`, lower: `-sqrt(${rp}^2 - x^2)`, from: -rp, to: rp, color: 'ink3', alpha: 0.35 }],
      curves: [
        { polar: `${rp}`, theta: [0, 6.2832], color: 'ink', width: 1.8 },
        { polar: '2', theta: [0, 6.2832], color: 'bad', width: 1.8, dash: true },
        { polar: `${R}`, theta: [0, 6.2832], color: col, width: 2.4 },
        { polar: '0.62', theta: [-0.6, 2.45], color: 'gold', width: 2.2 },
      ],
      arrows: [
        { from: at(2.45), to: at(2.75), color: 'gold' },
        { from: [against ? -0.7 : 0.7, R], to: [against ? 0.7 : -0.7, R], color: col },
      ],
      points: [
        key(2.95, `grey: inside the horizon, r₊ = ${round(kerr.rPlus(a), 3)}M`, 'ink2'),
        key(2.4, 'dashed: edge of the ergosphere, r = 2M', 'bad'),
        key(1.85, what, col),
        key(1.3, 'gold: the direction of the spin', 'gold'),
      ],
    },
    caption,
  };
};

// ─── a slice containing the spin axis, on the oblate map x = √(r² + a²) sin θ, z = r cos θ ──
const sideView = ({ a, caption, inner = true }) => {
  const rp = round(kerr.rPlus(a), 6), rm = round(kerr.rMinus(a), 6), A2 = round(a * a, 6);
  const ring = (r) => [`sqrt(${round(r * r, 6)} + ${A2})*sin(t)`, `${round(r, 6)}*cos(t)`];
  const rE = `(1 + sqrt(1 - ${A2}*cos(t)^2))`;
  return {
    type: 'graph',
    params: {
      x: [-2.9, 2.9], y: [-2.2, 2.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        { param: [`sqrt(${rE}^2 + ${A2})*sin(t)`, `${rE}*cos(t)`], t: [0, 6.2832], color: 'bad', width: 1.8, dash: true },
        { param: ring(kerr.rPlus(a)), t: [0, 6.2832], color: 'ink', width: 2.6 },
        ...(inner ? [{ param: ring(kerr.rMinus(a)), t: [0, 6.2832], color: 'violet', width: 1.6, dash: true }] : []),
      ],
      arrows: [{ from: [0, -2.05], to: [0, 2.05], color: 'ink3', label: 'spin axis', labelDx: 8, labelDy: 8 }],
      points: [
        ...(inner ? [{ x: round(a, 4), y: 0, r: 3.5, color: 'bad' }, { x: round(-a, 4), y: 0, r: 3.5, color: 'bad' }] : []),
        { x: round(Math.sqrt(rp * rp + A2) + 0.05, 4), y: 0.55, r: 0.01, color: 'ink', label: 'event horizon r₊', labelDx: 8, labelDy: 0 },
        { x: 1.75, y: 1.45, r: 0.01, color: 'bad', label: 'ergosphere edge', labelDx: 6, labelDy: 0 },
        ...(inner ? [{ x: 0.12, y: round(-rm - 0.28, 4), r: 0.01, color: 'violet', label: 'inner horizon r₋', labelDx: 0, labelDy: 0, labelAlign: 'left' }] : []),
      ],
    },
    caption,
  };
};

// the Kerr metric's equatorial components, as a table
const kerrTable = metricTable([
  ['−(1 − 2M/r)', '', '', '−2Ma/r'],
  ['', 'r²/Δ', '', ''],
  ['', '', 'r²', ''],
  ['−2Ma/r', '', '', 'r² + a² + 2Ma²/r'],
], {
  colors: [['accent', '', '', 'accent'], [], [], ['accent', '', '', 'accent']],
  caption: t`The Kerr metric in the equatorial plane $\theta = \pi/2$ (Boyer–Lindquist coordinates, $G = c = 1$, $\Delta = r^2 - 2Mr + a^2$). Blue: the $t$–$\phi$ block, the only off-diagonal part.`,
});

// one circular-orbit energy curve, without its minimum marked
const eCurve = (a, { retro = false, caption }) => {
  const E = retro ? E_RET : E_PRO, rph = retro ? 2 * (1 + Math.cos((2 / 3) * Math.acos(a))) : 2 * (1 + Math.cos((2 / 3) * Math.acos(-a)));
  return {
    type: 'graph',
    params: {
      x: [0, 14], y: [0.8, 1.02], xlabel: 'r / M', ylabel: 'E (per unit rest energy)', constants: { a },
      curves: [{ fn: E, domain: [round(rph + 0.02, 5), 14], color: retro ? 'violet' : 'gold', width: 2.4 }],
      hlines: [{ y: 1, label: 'at rest far away' }],
      vlines: [{ x: round(rph, 5), label: 'photon orbit', color: 'ink3' }],
    },
    caption,
  };
};

// black holes of one horizon area: M² = M_irr² + J²/4M_irr² (M_irr = 1)
const irrPic = {
  type: 'graph',
  params: {
    x: [0, 2.2], y: [0.9, 1.5], xlabel: 'angular momentum J / Mᵢᵣᵣ²', ylabel: 'mass M / Mᵢᵣᵣ',
    curves: [{ fn: 'sqrt(1 + x^2/4)', domain: [0, 2], color: 'accent', width: 2.6, label: 'same horizon area', labelAt: 1.2, labelDx: -6, labelDy: -12, labelAlign: 'right' }],
    points: [
      { x: 0, y: 1, color: 'good', r: 5, label: 'no spin: M = Mᵢᵣᵣ', labelDx: 10, labelDy: 14 },
      { x: 2, y: 1.41421, color: 'bad', r: 5, label: 'extreme spin, a = M', labelDx: -8, labelDy: -10, labelAlign: 'right' },
    ],
  },
  caption: t`Black holes that share one horizon area ($G = c = 1$): their mass $M$ against angular momentum $J$, $M^2 = M_\text{irr}^2 + J^2/4M_\text{irr}^2$. Taking spin away while the area stays fixed slides a hole down this curve to $J = 0$; the mass it loses is the energy extracted.`,
};

const areaPic = {
  type: 'graph',
  params: {
    x: [0, 1], y: [24, 52], xlabel: 'spin χ = a/M', ylabel: 'horizon area A / M²',
    curves: [{ fn: '8*pi*(1 + sqrt(1 - x^2))', domain: [0, 1], color: 'accent', width: 2.6 }],
    points: [{ x: 0, y: round(16 * Math.PI, 5), color: 'good', r: 5, label: '16π: no spin', labelDx: 10, labelDy: 12 }, { x: 1, y: round(8 * Math.PI, 5), color: 'bad', r: 5, label: '8π: a = M', labelDx: -10, labelDy: -8, labelAlign: 'right' }],
  },
  caption: t`The horizon area of a Kerr black hole of mass $M$ ($G = c = 1$), $A = 4\pi(r_+^2 + a^2) = 8\pi M r_+$: spin shrinks it, to half at $a = M$.`,
};

// ─── the Explore: circular-orbit energy against r, both senses, with a spin slider ─
const iscoP = kerrExpr.isco('a', true), iscoR = kerrExpr.isco('a', false);
const explorePic = {
  type: 'graph',
  params: {
    x: [0, 12], y: [0.55, 1.03], xlabel: 'r / M', ylabel: 'E (per unit rest energy)',
    sliders: [{ key: 'a', label: 'Spin $a$', min: 0, max: 1, step: 0.001, value: 0.5, unit: 'M', explain: 'a = J/M, the angular momentum per unit mass; a black hole needs a ≤ M.' }],
    curves: [
      { fn: E_PRO, domain: [`${RPH_PRO} + 0.02`, iscoP], color: 'gold', width: 1.4, dash: true, when: `step(${iscoP} - ${RPH_PRO} - 0.05)` },
      { fn: E_PRO, domain: [iscoP, 12], color: 'gold', width: 2.6, label: 'with the spin', labelAt: 9, labelDx: 0, labelDy: 14 },
      { fn: E_RET, domain: [`${RPH_RET} + 0.02`, iscoR], color: 'violet', width: 1.4, dash: true },
      { fn: E_RET, domain: [iscoR, 12], color: 'violet', width: 2.6, label: 'against the spin', labelAt: 10.2, labelDx: 0, labelDy: -10 },
    ],
    hlines: [{ y: 1, label: 'at rest far away' }],
    points: [
      { x: iscoP, y: `sqrt(1 - 2/(3*${iscoP}))`, color: 'gold', r: 6 },
      { x: iscoR, y: `sqrt(1 - 2/(3*${iscoR}))`, color: 'violet', r: 6 },
    ],
    readouts: [
      { label: 'ISCO with the spin', expr: iscoP, unit: 'M', digits: 4 },
      { label: 'energy radiated', expr: `100*(1 - sqrt(1 - 2/(3*${iscoP})))`, unit: '\\%', digits: 3 },
      { label: 'ISCO against the spin', expr: iscoR, unit: 'M', digits: 4 },
      { label: 'energy radiated', expr: `100*(1 - sqrt(1 - 2/(3*${iscoR})))`, unit: '\\%', digits: 3 },
    ],
  },
  caption: t`$E$ of circular orbits in the equatorial plane of a Kerr black hole ($G = c = 1$; Bardeen, Press & Teukolsky 1972): gold for gas going round with the spin, violet against it. Solid: stable orbits; dashed: unstable ones, from the photon orbit inward of the ISCO. Dots: the ISCOs, the lowest $E$ a stable orbit can have. Thin disks — gas in a black hole's equatorial plane — lose energy and drift inward along these curves.`,
};

const C_ = 299792458;
const GW = { m1: 35.6, m2: 30.6, mf: 63.1, chi: 0.69 };               // GW150914, GWTC-1 medians (solar masses)

export default lesson({
  id: 'gr.S26.d',
  title: 'The Kerr metric: horizons, ergosphere and the 42% efficiency limit',
  minutes: 18, difficulty: 3, mode: 'derivation', badges: ['est-der', 'math'],
  intro: t`Roy Kerr found the metric of a spinning black hole in 1963 — not by step 20's route of guessing a symmetric form (spin breaks the spherical symmetry), but by a cleverer algebraic one. We will not re-derive it; we will **verify** it and **read** it. Every feature of a spinning hole follows from the components above with the tools of steps 20–22: where $g^{rr}$ vanishes, where $g_{tt}$ changes sign, which four-velocities are timelike, and the energy of circular orbits. The last of these gives the most important number in high-energy astrophysics: a thin disk around a maximally spinning hole can release $1 - 1/\sqrt3 = 42\%$ of its rest energy.

Conventions: Carroll's, signature $(-,+,+,+)$, **with $G = c = 1$**; Boyer–Lindquist coordinates; $a = J/M$ is the spin as a length, $0 \le a \le M$. Inside the inner horizon the solution is mathematics, not a prediction — that part carries the **math** badge.`,
  equation: t`ds^2 = -\left(1 - \frac{2Mr}{\Sigma}\right)dt^2 - \frac{4Mar\sin^2\theta}{\Sigma}\,dt\,d\phi + \frac{\Sigma}{\Delta}\,dr^2 + \Sigma\,d\theta^2 + \left(r^2 + a^2 + \frac{2Ma^2r\sin^2\theta}{\Sigma}\right)\sin^2\theta\,d\phi^2`,
  symbols: [
    { tex: 'M', text: t`the mass as a length, $GM/c^2$: 1.48 km per solar mass` },
    { tex: 'a', text: t`the spin as a length, $J/(Mc)$: from $0$ (Schwarzschild) to $M$ (maximal spin)` },
    { tex: '\\Sigma', text: t`$r^2 + a^2\cos^2\theta$` },
    { tex: '\\Delta', text: t`$r^2 - 2Mr + a^2$, which vanishes on the horizons` },
    { tex: 'r', text: t`the Boyer–Lindquist radial coordinate — not an areal radius once $a \ne 0$` },
    { tex: '\\theta', text: 'the angle from the spin axis: θ = π/2 is the equatorial plane' },
    { tex: 't,\\ \\phi', text: 'time far away, and the angle around the spin axis' },
  ],
  why: 'Most black holes we observe spin. Their spin sets how bright their disks can be, powers the jets of quasars, and shapes the gravitational waves of every merger; the Kerr metric is the exact description of all of them.',
  visual: {
    ...explorePic,
    title: 'Where the disk ends, and what it has radiated',
    lead: t`The energy $E$ of circular orbits in a spinning hole's equatorial plane ($G = c = 1$). Gas in a disk sheds energy and drifts inward through these orbits until it reaches the lowest point — the innermost stable circular orbit, ISCO — and plunges. What it has radiated by then is $1 - E_\text{ISCO}$. Turn up the spin $a$.`,
    tasks: [
      'At a = 0 both curves coincide: the ISCO is at 6M and 5.72% of the rest energy comes out.',
      'Raise a: the orbit going with the spin moves in and dips lower; the one going against it moves out and rises.',
      'Push a to M: the co-rotating ISCO reaches r = M with E = 1/√3 — 42.3% radiated. At 0.998M, where accretion is expected to stop spinning a hole up, it is 32%.',
    ],
  },
  example: {
    prompt: t`From the Kerr metric, find the horizons and the ergosphere, show that near the hole everything must turn with it and that the horizon turns rigidly, and find how much energy a thin disk can release around a maximally spinning hole.`,
    visual: omegaBand(0.9),
    steps: [
      { label: 'Check it', text: t`SymPy gives $R_{\mu\nu} = 0$ — all ten components, in exact arithmetic at test points — so this is a vacuum solution. At $a = 0$ it is Schwarzschild's; far away the cross term is $-(4J/r)\sin^2\theta\,dt\,d\phi$, the field of any body with angular momentum $J = Ma$.` },
      { label: 'Horizons', text: t`As in step 22, a surface $r = $ const is null where $g^{rr} = 0$. Here $g^{rr} = \Delta/\Sigma$, so $$\Delta = r^2 - 2Mr + a^2 = 0 \quad\Rightarrow\quad r_\pm = M \pm \sqrt{M^2 - a^2}.$$ Real only for $a \le M$. The outer one, $r_+$, is the event horizon: $2M$ without spin, $M$ at $a = M$.` },
      { label: 'The static limit', text: t`An observer at rest relative to the distant stars has $u \propto \partial_t$, timelike only where $g_{tt} < 0$, that is $r^2 - 2Mr + a^2\cos^2\theta > 0$: outside $$r_E = M + \sqrt{M^2 - a^2\cos^2\theta}.$$ Between $r_+$ and $r_E$ — the **ergosphere** — nothing can hover. $r_E$ meets the horizon at the poles and reaches $2M$ at the equator.` },
      { label: 'Frame dragging', text: t`Circling at fixed $r$, $\theta$ with $\Omega = d\phi/dt$ means $u \propto \partial_t + \Omega\,\partial_\phi$, timelike only if $g_{tt} + 2g_{t\phi}\Omega + g_{\phi\phi}\Omega^2 < 0$ — between the roots $$\Omega_\pm = \omega \pm \sqrt{\omega^2 - g_{tt}/g_{\phi\phi}}, \qquad \omega = -\frac{g_{t\phi}}{g_{\phi\phi}}.$$ Inside the ergosphere $g_{tt} > 0$, so both roots are positive: everything must turn with the hole (picture). The midpoint $\omega$ belongs to observers with zero angular momentum, $u_\phi = 0$; far away $\omega \approx 2J/r^3$.` },
      { label: 'The horizon turns', text: t`The window's width depends on $g_{t\phi}^2 - g_{tt}g_{\phi\phi} = \Delta\sin^2\theta$, so it closes where $\Delta = 0$: $\Omega_+ = \Omega_- = \omega(r_+)$. Using $r_+^2 + a^2 = 2Mr_+$, $$\Omega_H = \frac{a}{r_+^2 + a^2} = \frac{a}{2Mr_+},$$ the same at every latitude: the horizon rotates rigidly.` },
      { label: 'Circular orbits', text: t`In the equatorial plane, circular geodesics have energy per unit rest energy $$E = \frac{r^{3/2} - 2Mr^{1/2} \pm aM^{1/2}}{r^{3/4}\sqrt{r^{3/2} - 3Mr^{1/2} \pm 2aM^{1/2}}}$$ (Bardeen, Press & Teukolsky 1972; upper signs going with the spin; SymPy confirms that they solve the geodesic equations). The ISCO is where $E$ is lowest: $dE/dr = 0$ reduces to $r^2 - 6Mr \pm 8a\sqrt{Mr} - 3a^2 = 0$, which gives $6M$ at $a = 0$.` },
      { label: 'Maximal spin', text: t`At $a = M$, with $x = \sqrt{r/M}$, both numerator and root factor: $$E = \frac{(x - 1)(x^2 + x - 1)}{x^{3/2}(x - 1)\sqrt{x + 2}} = \frac{x^2 + x - 1}{x^{3/2}\sqrt{x + 2}},$$ which rises for every $x > 1$. So the lowest stable orbit is at $x \to 1$, $r \to M$, where $E \to 1/\sqrt3 = ${round(1 / Math.sqrt(3), 4)}$: a disk releases $1 - 1/\sqrt3 = ${round(100 * (1 - 1 / Math.sqrt(3)), 3)}\%$ of its rest energy, against $${round(100 * kerr.efficiency(0), 3)}\%$ without spin. Going against the spin the ISCO moves out to $9M$, and only $${round(100 * (1 - 5 * Math.sqrt(3) / 9), 3)}\%$ comes out.` },
      { label: 'Sense check, and limits', text: t`At $a = 0$ every formula returns Schwarzschild's. Near $a = M$ the coordinate radii of the horizon, the photon orbit and the ISCO all approach $M$, but they are different places: at $a = 0.999M$ the photon orbit lies $0.59M$ and the ISCO $2.3M$ of proper distance outside the horizon. Real holes stop short of $a = M$ — the radiation they swallow caps the spin near $0.998M$ (Thorne 1974), where the efficiency is $${round(100 * kerr.efficiency(0.998), 3)}\%$. Inside $r_-$ the solution continues to a ring singularity, but the inner horizon is expected to be unstable: that region is mathematics, not a prediction.` },
    ],
    answer: t`Horizons where $\Delta = 0$: $r_\pm = M \pm \sqrt{M^2 - a^2}$. Ergosphere between $r_+$ and $r_E = M + \sqrt{M^2 - a^2\cos^2\theta}$, where $g_{tt} > 0$ and every observer must co-rotate; the horizon turns rigidly at $\Omega_H = a/2Mr_+$. Around a maximally spinning hole the co-rotating ISCO reaches $r = M$ with $E = 1/\sqrt3$: a thin disk radiates $${round(100 * (1 - 1 / Math.sqrt(3)), 3)}\%$ of its rest energy.`,
  },
  practice: [
    expr({
      id: 'det-block', difficulty: 3,
      prompt: t`In the equatorial plane the $t$–$\phi$ block of the Kerr metric has $g_{tt} = -(1 - 2M/r)$, $g_{t\phi} = -2Ma/r$ and $g_{\phi\phi} = r^2 + a^2 + 2Ma^2/r$ ($G = c = 1$). Compute its determinant, $g_{tt}g_{\phi\phi} - g_{t\phi}^2$.`,
      answer: '-(r^2 - 2M r + a^2)',
      answerTeX: t`-(r^2 - 2Mr + a^2) = -\Delta`,
      lhs: t`g_{tt}g_{\phi\phi} - g_{t\phi}^2`,
      vars: { r: [0.5, 5], M: [0.5, 1.5], a: [0, 1] },
      errors: [
        { answer: 'r^2 - 2M r + a^2', feedback: t`Sign: $g_{tt}g_{\phi\phi}$ is negative far away, where the block is that of flat space, $\text{diag}(-1, r^2)$.` },
        { answer: '-(r^2 - 2M r)', feedback: t`You lost the $a^2$: keep $-(1 - 2M/r)\,a^2$ from $g_{tt}g_{\phi\phi}$.` },
        { answer: '-(r^2 + a^2)', feedback: t`The $2M/r$ terms do not all cancel: $-(1 - 2M/r)r^2$ leaves $-r^2 + 2Mr$.` },
      ],
      hints: [t`Expand $-(1 - 2M/r)(r^2 + a^2 + 2Ma^2/r)$ term by term; the $2Ma^2/r$ pieces cancel.`, t`What is left is $-r^2 - a^2 + 2Mr + 4M^2a^2/r^2$; then subtract $g_{t\phi}^2 = 4M^2a^2/r^2$.`],
      teach: t`A $2\times2$ block with negative determinant has one timelike and one spacelike direction; when the determinant reaches zero, no timelike combination is left.`,
      explain: t`$g_{tt}g_{\phi\phi} - g_{t\phi}^2 = -(r^2 - 2Mr + a^2) = -\Delta$ (at any latitude, $-\Delta\sin^2\theta$). While $\Delta > 0$ some combination of $\partial_t$ and $\partial_\phi$ is timelike: an observer can stay at this $r$ by circling at a suitable rate. At $\Delta = 0$ the block degenerates and no such combination is left — nothing can stay at fixed $r$. That is the horizon, $r_\pm = M \pm \sqrt{M^2 - a^2}$, found here from the $t$–$\phi$ block as step 22 found it from $g^{rr}$.`,
      visual: kerrTable,
    }),
    expr({
      id: 'zamo', difficulty: 2,
      prompt: t`An observer with zero angular momentum has $u_\phi = g_{\phi t}u^t + g_{\phi\phi}u^\phi = 0$. Using the equatorial components $g_{t\phi} = -2Ma/r$ and $g_{\phi\phi} = r^2 + a^2 + 2Ma^2/r$ ($G = c = 1$), find its angular velocity $\omega = d\phi/dt = u^\phi/u^t$.`,
      answer: '2M a/(r^3 + a^2 r + 2M a^2)',
      answerTeX: t`\frac{2Ma}{r^3 + a^2r + 2Ma^2}`,
      lhs: '\\omega',
      vars: { r: [2, 8], M: [0.5, 1], a: [0.1, 1] },
      errors: [
        { answer: '-2M a/(r^3 + a^2 r + 2M a^2)', feedback: t`Sign: $\omega = -g_{t\phi}/g_{\phi\phi}$, and $g_{t\phi}$ is negative — the observer turns with the hole.` },
        { answer: '2M a/r^3', feedback: t`That is the far-field limit, $2J/r^3$. Keep all of $g_{\phi\phi}$.` },
        { answer: '2M a/(r^3 + a^2 r)', feedback: t`$g_{\phi\phi}$ also contains $2Ma^2/r$: multiplied by $r$ it gives $2Ma^2$.` },
      ],
      hints: [t`$u_\phi = 0$ gives $u^\phi/u^t = -g_{t\phi}/g_{\phi\phi}$.`, t`Multiply top and bottom by $r$.`],
      teach: 'Zero angular momentum is not zero angular velocity: near a spinning mass, an observer who refuses to turn is still carried round.',
      explain: t`$\omega = -g_{t\phi}/g_{\phi\phi} = \dfrac{2Ma}{r^3 + a^2r + 2Ma^2}$. Far away it is $2J/r^3$ — frame dragging falling off as the cube of distance, the effect Gravity Probe B measured around the Earth. At the horizon it becomes $a/(r_+^2 + a^2) = \Omega_H$.`,
      visual: topView({ a: 0.9, r: 3, what: 'blue: observers with zero angular momentum, r = 3M', caption: t`The equatorial plane of a hole with $a = 0.9M$, seen from above, with the Boyer–Lindquist $r$ drawn as distance from the centre — a map of the coordinates, not of true distances. The ring of observers at $r = 3M$ have zero angular momentum, yet are carried round with the spin.` }),
    }),
    num({
      id: 'omega-min', difficulty: 3,
      gen(r) {
        const [a, R] = r.pick([[0.9, 1.8], [0.99, 1.5], [0.7, 1.9], [0.5, 1.95]]);
        const { lo, w, hi } = window(a, R), TM = 10 * T_SUN, f = (x) => x / (2 * Math.PI * TM);
        return {
          prompt: t`A 10-solar-mass black hole spins at $a = ${a}M$. A probe sits in its equatorial plane at $r = ${R}M$, inside the ergosphere, circling at angular velocity $\Omega = d\phi/dt$. Its four-velocity $u \propto \partial_t + \Omega\,\partial_\phi$ must be timelike: $g_{tt} + 2g_{t\phi}\Omega + g_{\phi\phi}\Omega^2 < 0$, with $g_{tt} = -(1 - 2M/r)$, $g_{t\phi} = -2Ma/r$, $g_{\phi\phi} = r^2 + a^2 + 2Ma^2/r$ ($G = c = 1$). What is the **slowest** it can circle, in turns per second? ($GM/c^3 = ${sci(TM * 1e6, 4)}\ \mu\text{s}$ for this hole.)`,
          answer: f(lo), units: 'Hz', tol: { rel: 0.01 },
          errors: [
            { value: f(w), feedback: t`That is $\omega$, the middle of the window. The slowest allowed rate is the lower root, $\omega - \sqrt{\omega^2 - g_{tt}/g_{\phi\phi}}$.` },
            { value: f(hi), feedback: 'That is the fastest allowed rate — light going with the spin. Take the lower root.' },
            { value: lo / TM, feedback: t`That is in radians per second. One turn is $2\pi$.` },
          ],
          hints: [t`In units of $M$: $g_{tt} = ${round(-(1 - 2 / R), 5)}$, $g_{t\phi} = ${round(-2 * a / R, 5)}$, $g_{\phi\phi} = ${round(R * R + a * a + 2 * a * a / R, 5)}$. Solve the quadratic for its roots $\Omega_\pm$.`, t`The lower root is $\Omega_- = ${round(lo, 4)}/M$. Divide by $GM/c^3$ for rad/s, then by $2\pi$.`],
          teach: 'Inside the ergosphere both roots of the timelike condition are positive: there is a minimum rate of turning, set by the geometry.',
          explain: t`$\omega = -g_{t\phi}/g_{\phi\phi} = ${round(w, 4)}/M$ and $\Omega_\pm = \omega \pm \sqrt{\omega^2 - g_{tt}/g_{\phi\phi}}$, so $\Omega_- = ${round(lo, 4)}/M$ (and $\Omega_+ = ${round(hi, 4)}/M$). In SI, $\Omega_-/(2\pi\,GM/c^3) = ${round(f(lo), 3)}$ turns per second: no rocket, however powerful, can make it turn more slowly. Outside $r = 2M$ the lower root would be negative and the probe could stand still.`,
          visual: topView({ a, r: R, what: `blue: the probe's circle, r = ${R}M`, caption: t`The equatorial plane of a hole with $a = ${a}M$, seen from above (Boyer–Lindquist $r$ drawn as distance from the centre: a map of the coordinates, not of true distances). The probe's circle lies between the horizon and the edge of the ergosphere.` }),
        };
      },
    }),
    num({
      id: 'horizon-area', difficulty: 3,
      gen(r) {
        const chi = r.pick([0.5, 0.9, 0.99]);
        const rp = kerr.rPlus(chi), A = 4 * Math.PI * (rp * rp + chi * chi);
        return {
          prompt: t`On the horizon of a Kerr hole ($t$ = const, $r = r_+$) the metric is $$ds^2 = \Sigma_+\,d\theta^2 + \frac{(r_+^2 + a^2)^2\sin^2\theta}{\Sigma_+}\,d\phi^2, \qquad \Sigma_+ = r_+^2 + a^2\cos^2\theta$$ ($G = c = 1$). Find its area, $\int_0^{2\pi}\!\int_0^\pi\sqrt{g_{\theta\theta}\,g_{\phi\phi}}\,d\theta\,d\phi$, for spin $a = ${chi}M$. Give the number in units of $M^2$.`,
          answer: A, tol: { rel: 0.005 },
          errors: [
            { value: 4 * Math.PI * rp * rp, feedback: t`That is $4\pi r_+^2$, as if the horizon were a round sphere of radius $r_+$. Here $\sqrt{g_{\theta\theta}g_{\phi\phi}} = (r_+^2 + a^2)\sin\theta$.` },
            { value: 16 * Math.PI, feedback: t`That is a non-spinning hole's area, $16\pi M^2$. Spin shrinks it.` },
            { value: 2 * Math.PI * (rp * rp + chi * chi), feedback: t`$\int_0^\pi\sin\theta\,d\theta = 2$, so the area is $4\pi(r_+^2 + a^2)$.` },
          ],
          hints: [t`$\sqrt{g_{\theta\theta}g_{\phi\phi}} = \sqrt{\Sigma_+\cdot(r_+^2 + a^2)^2\sin^2\theta/\Sigma_+} = (r_+^2 + a^2)\sin\theta$: $\Sigma_+$ cancels.`, t`So $A = 4\pi(r_+^2 + a^2) = 8\pi Mr_+$ (since $\Delta = 0$ there), with $r_+ = M + \sqrt{M^2 - a^2} = ${round(rp, 5)}M$.`],
          teach: t`Area is the integral of $\sqrt{\det g}$ over the surface; on the Kerr horizon the messy $\Sigma_+$ cancels.`,
          explain: t`$A = 4\pi(r_+^2 + a^2) = 8\pi Mr_+ = ${round(A, 4)}\,M^2$, against $16\pi M^2 = ${round(16 * Math.PI, 4)}\,M^2$ without spin. A hole of the same area with no spin would have mass $M_\text{irr} = \sqrt{A/16\pi} = ${round(kerr.mIrr(chi), 4)}M$ — the **irreducible mass**: since the area can never decrease (Hawking), at most $M - M_\text{irr}$ can ever be extracted from the spin.`,
          visual: sideView({ a: chi, inner: false, caption: t`A slice through a hole with $a = ${chi}M$ containing its spin axis, on the map $x = \sqrt{r^2 + a^2}\sin\theta$, $z = r\cos\theta$ — a picture of the coordinates, not of the horizon's true shape. Solid: the event horizon, whose area you are finding; red dashed: the ergosphere's edge.` }),
        };
      },
    }),
    code({
      id: 'isco-sympy', difficulty: 3,
      prompt: t`Find the ISCO of a spinning hole with SymPy. \`E\` below is the energy of co-rotating circular orbits ($M = 1$). The ISCO is where $E$ is lowest: set \`condition\` to the numerator of $dE/dr$ (use \`sp.together\`, \`sp.numer\` and \`sp.factor\`), then find its root for $a = 0.9$ near $r = 3$ with \`sp.nsolve\`, and the efficiency $1 - E$ there.`,
      starter: t`import sympy as sp

r, a = sp.symbols('r a', positive=True)    # units of M (G = c = 1, M = 1)
E = (r**sp.Rational(3, 2) - 2*sp.sqrt(r) + a) / (
    r**sp.Rational(3, 4)*sp.sqrt(r**sp.Rational(3, 2) - 3*sp.sqrt(r) + 2*a))

condition = None     # replace: numerator of dE/dr, factored
r_isco = None        # replace: its root for a = 9/10, near r = 3
efficiency = None    # replace: 1 - E at that radius
print(condition, r_isco, efficiency)
`,
      answer: t`import sympy as sp

r, a = sp.symbols('r a', positive=True)    # units of M (G = c = 1, M = 1)
E = (r**sp.Rational(3, 2) - 2*sp.sqrt(r) + a) / (
    r**sp.Rational(3, 4)*sp.sqrt(r**sp.Rational(3, 2) - 3*sp.sqrt(r) + 2*a))

condition = sp.factor(sp.numer(sp.together(sp.diff(E, r))))
r_isco = sp.nsolve(condition.subs(a, sp.Rational(9, 10)), r, 3)
efficiency = 1 - E.subs({a: sp.Rational(9, 10), r: r_isco})
print(condition, r_isco, efficiency)
`,
      tests: [
        { name: t`the condition gives $r = 6M$ when $a = 0$`, code: 'condition is not None and sp.simplify(condition.subs({a: 0, r: 6})) == 0' },
        { name: t`and $r = M$ when $a = M$`, code: 'condition is not None and sp.simplify(condition.subs({a: 1, r: 1})) == 0' },
        { name: t`ISCO for $a = 0.9M$: $${round(kerr.isco(0.9), 5)}M$`, code: `r_isco is not None and abs(float(r_isco) - ${round(kerr.isco(0.9), 7)}) < 1e-4` },
        { name: t`efficiency $${round(100 * kerr.efficiency(0.9), 4)}\%$`, code: `efficiency is not None and abs(float(efficiency) - ${round(kerr.efficiency(0.9), 6)}) < 1e-4` },
      ],
      hints: [t`\`sp.diff(E, r)\` is a fraction; \`sp.together\` puts it over one denominator and \`sp.numer\` takes the top. The denominator never vanishes outside the photon orbit.`, t`\`condition = sp.factor(sp.numer(sp.together(sp.diff(E, r))))\`, then \`r_isco = sp.nsolve(condition.subs(a, sp.Rational(9, 10)), r, 3)\` and \`efficiency = 1 - E.subs({a: sp.Rational(9, 10), r: r_isco})\`.`],
      teach: 'Gas in a disk sits on the lowest stable rung of circular orbits it can reach; the ISCO is where E(r) is smallest.',
      explain: t`SymPy returns \`2*(-3*a**2 + 8*a*sqrt(r) + r**2 - 6*r)\`: the ISCO condition $r^2 - 6Mr + 8a\sqrt{Mr} - 3a^2 = 0$ of Bardeen, Press and Teukolsky. It gives $6M$ at $a = 0$, $M$ at $a = M$, and $${round(kerr.isco(0.9), 4)}M$ at $a = 0.9M$, where $E = ${round(kerr.eIsco(kerr.isco(0.9)), 4)}$ and the disk radiates $${round(100 * kerr.efficiency(0.9), 3)}\%$. (Going against the spin, the sign of $8a\sqrt{Mr}$ flips.)`,
      visual: eCurve(0.9, { caption: t`$E(r)$ of co-rotating circular orbits around a hole with $a = 0.9M$ ($G = c = 1$). Where is it lowest?` }),
    }),
    num({
      id: 'retro-isco', difficulty: 3,
      prompt: t`Around a maximally spinning hole, $a = M$, the energy of circular orbits going **against** the spin factors, with $x = \sqrt{r/M}$, into $$E = \frac{x^3 - 2x - 1}{x^{3/2}\sqrt{x^3 - 3x - 2}} = \frac{x^2 - x - 1}{x^{3/2}\sqrt{x - 2}} \qquad (x > 2,\ G = c = 1).$$ Gas in a disk turning that way spirals in until $E$ is lowest. What percentage of its rest energy has it radiated by then?`,
      answer: 100 * (1 - (5 * Math.sqrt(3)) / 9), units: '%', tol: { rel: 0.01 },
      errors: [
        { value: 100 * (1 - 1 / Math.sqrt(3)), feedback: t`That is the co-rotating limit, $1 - 1/\sqrt3$. Against the spin the ISCO moves out, not in.` },
        { value: 100 * (1 - Math.sqrt(8 / 9)), feedback: t`That is the non-spinning value at $6M$. Find where this $E(x)$ is lowest.` },
        { value: 100 * (5 * Math.sqrt(3)) / 9, feedback: t`That is $E$ itself; the energy radiated is $1 - E$.` },
      ],
      hints: [t`Differentiate $\ln E = \ln(x^2 - x - 1) - \tfrac32\ln x - \tfrac12\ln(x - 2)$ and set it to zero.`, t`The root is $x = 3$, i.e. $r = 9M$, where $E = \dfrac{9 - 3 - 1}{3^{3/2}\cdot 1} = \dfrac{5}{3\sqrt3} = \dfrac{5\sqrt3}{9}$.`],
      teach: 'Going against the spin is harder: frame dragging fights the orbit, and the last stable orbit moves out.',
      explain: t`$dE/dx = 0$ at $x = 3$: the ISCO is at $r = 9M$, where $E = 5\sqrt3/9 = ${round((5 * Math.sqrt(3)) / 9, 5)}$. The disk radiates $1 - E = ${round(100 * (1 - (5 * Math.sqrt(3)) / 9), 3)}\%$ — less than the $${round(100 * kerr.efficiency(0), 3)}\%$ of a non-spinning hole, and about a eleventh of the $${round(100 * (1 - 1 / Math.sqrt(3)), 3)}\%$ for gas going with the spin.`,
      visual: topView({ a: 1, r: 2.9, against: true, what: 'violet: gas in a disk, going round against the spin', caption: t`The equatorial plane of a maximally spinning hole, seen from above (Boyer–Lindquist $r$ drawn as distance from the centre: a map of the coordinates). The disk's gas orbits against the hole's spin.` }),
    }),
    mcq({
      id: 'inner-region', difficulty: 2,
      prompt: t`The Kerr solution continues inside the event horizon, through the inner horizon $r_- = M - \sqrt{M^2 - a^2}$ and beyond. What does it contain there — and how far should we trust it?`,
      choices: [
        t`A ring-shaped singularity where $\Sigma = 0$, and past the ring regions with closed timelike curves. But the inner horizon is expected to be unstable — matter falling in piles up there — so this part is mathematics, not a prediction about real black holes`,
        t`Nothing: the solution ends at the event horizon`,
        t`A point singularity at $r = 0$, as in Schwarzschild's solution`,
        t`A tunnel to another universe that a traveller could safely use, as the equations show`,
      ],
      answer: 0,
      why: {
        1: t`The metric continues smoothly through $r_+$ in coordinates like those of step 22; it is the physics inside $r_-$ that is doubtful, not the mathematics.`,
        2: t`$\Sigma = r^2 + a^2\cos^2\theta = 0$ needs $r = 0$ and $\theta = \pi/2$: a ring of radius $a$, not a point.`,
        3: t`The exact solution has such regions, but the inner horizon's expected instability, and the star that formed the hole, mean nothing suggests a real hole contains a usable passage.`,
      },
      hints: [t`Where is $\Sigma = r^2 + a^2\cos^2\theta$ zero? And which parts of the solution are expected to survive small disturbances?`],
      teach: 'An exact solution can be mathematically complete and still physically untrustworthy in places: the Kerr interior inside r₋ is the standard example.',
      explain: t`Inside $r_-$ the exact solution has a ring singularity of radius $a$ and, beyond it, regions with closed timelike curves. But the inner horizon is a Cauchy horizon: perturbations falling in are blueshifted without bound there (“mass inflation”), so a real hole's interior is expected to differ. Hence the **math** badge: allowed by the equations, not established in nature. Outside $r_+$ — horizons, ergosphere, orbits — the solution is tested by spins, disks and gravitational waves.`,
      visual: sideView({ a: 0.9, caption: t`A slice through a hole with $a = 0.9M$ containing its spin axis, drawn on the map $x = \sqrt{r^2 + a^2}\sin\theta$, $z = r\cos\theta$ (exact for flat space, a picture of the coordinates here). Solid: the event horizon $r_+$; red dashed: the ergosphere's edge; violet dashed: the inner horizon $r_-$. Red dots: where the ring singularity crosses the slice.` }),
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-omega-h', difficulty: 3,
      prompt: t`In the equatorial plane, observers with zero angular momentum turn at $$\omega = \frac{2Ma}{r^3 + a^2r + 2Ma^2}$$ ($G = c = 1$). Evaluate it on the horizon, where $r_+^2 + a^2 = 2Mr_+$, and write $\Omega_H$ in terms of $M$ and $a$ alone.`,
      answer: 'a/(2M(M + sqrt(M^2 - a^2)))',
      answerTeX: t`\frac{a}{2M\left(M + \sqrt{M^2 - a^2}\right)}`,
      lhs: '\\Omega_H',
      vars: { a: [0.1, 0.9], M: [1, 1.5] },
      errors: [
        { answer: 'a/(M + sqrt(M^2 - a^2))^2', feedback: t`$r_+^3 + a^2r_+ = r_+(r_+^2 + a^2)$: keep the $a^2$, then use $r_+^2 + a^2 = 2Mr_+$.` },
        { answer: '2M a/(M + sqrt(M^2 - a^2))^3', feedback: t`That is $2Ma/r_+^3$, the far-field form. Use the full denominator.` },
        { answer: 'a/(4M^2)', feedback: t`That is the slow-spin limit, with $r_+ \approx 2M$. Keep $r_+ = M + \sqrt{M^2 - a^2}$.` },
      ],
      hints: [t`$r_+^3 + a^2r_+ + 2Ma^2 = r_+(r_+^2 + a^2) + 2Ma^2 = 2Mr_+^2 + 2Ma^2$.`, t`So $\omega(r_+) = \dfrac{2Ma}{2M(r_+^2 + a^2)} = \dfrac{a}{2Mr_+}$, with $r_+ = M + \sqrt{M^2 - a^2}$.`],
      teach: 'The horizon’s identity Δ(r₊) = 0, i.e. r₊² + a² = 2Mr₊, simplifies everything evaluated there.',
      explain: t`$\Omega_H = \dfrac{a}{r_+^2 + a^2} = \dfrac{a}{2Mr_+} = \dfrac{a}{2M\left(M + \sqrt{M^2 - a^2}\right)}$: $0$ without spin, rising to $1/2M$ at $a = M$ — for a 10-solar-mass hole, $${round(1 / (2 * 10 * T_SUN) / (2 * Math.PI), 3)}$ turns per second at the limit.`,
      visual: omegaBand(0.9, { labels: false, caption: t`The window of allowed angular velocities in the equatorial plane of a hole with $a = 0.9M$ ($G = c = 1$): it closes on one value at the horizon.` }),
    }),
    num({
      id: 'cp-gw150914', difficulty: 3, transfer: true,
      prompt: t`In GW150914, black holes of $${GW.m1}$ and $${GW.m2}$ solar masses (spinning slowly: take them as non-spinning) merged into one of $${GW.mf}$ solar masses spinning at $\chi = a/M = ${GW.chi}$ (LIGO–Virgo's GWTC-1 values). Using $A = 8\pi Mr_+$ for a spinning hole and $16\pi M^2$ for a non-spinning one ($G = c = 1$, $GM_\odot/c^2 = ${sci(M_SUN / 1e3, 5)}$ km), find the remnant's horizon area in km².`,
      answer: (8 * Math.PI * (GW.mf * M_SUN) ** 2 * (1 + Math.sqrt(1 - GW.chi ** 2))) / 1e6, units: 'km^2', tol: { rel: 0.01 },
      errors: [
        { value: (16 * Math.PI * (GW.mf * M_SUN) ** 2) / 1e6, feedback: 'That treats the remnant as non-spinning. Its spin shrinks the area: use 8πMr₊.' },
        { value: (4 * Math.PI * (GW.mf * M_SUN * (1 + Math.sqrt(1 - GW.chi ** 2))) ** 2) / 1e6, feedback: t`That is $4\pi r_+^2$. The Kerr horizon's area is $4\pi(r_+^2 + a^2) = 8\pi Mr_+$.` },
        { value: (16 * Math.PI * ((GW.m1 * M_SUN) ** 2 + (GW.m2 * M_SUN) ** 2)) / 1e6, feedback: 'That is the two initial holes’ total. The question asks for the remnant.' },
      ],
      hints: [t`$M = ${GW.mf}\times${sci(M_SUN / 1e3, 5)}$ km, and $r_+ = M\left(1 + \sqrt{1 - \chi^2}\right)$.`, t`$A = 8\pi M r_+ = 8\pi M^2\left(1 + \sqrt{1 - \chi^2}\right)$.`],
      teach: 'Hawking’s area theorem: in any classical process the total horizon area cannot decrease — a merger can radiate mass, but not area.',
      explain: t`$M = ${round(GW.mf * M_SUN / 1e3, 4)}$ km and $r_+ = ${round(1 + Math.sqrt(1 - GW.chi ** 2), 4)}M$, so $A = ${sci((8 * Math.PI * (GW.mf * M_SUN) ** 2 * (1 + Math.sqrt(1 - GW.chi ** 2))) / 1e6, 4)}$ km². The two initial holes had $16\pi(M_1^2 + M_2^2) = ${sci((16 * Math.PI * ((GW.m1 * M_SUN) ** 2 + (GW.m2 * M_SUN) ** 2)) / 1e6, 4)}$ km²: the area grew by ${round(100 * ((8 * (GW.mf) ** 2 * (1 + Math.sqrt(1 - GW.chi ** 2))) / (16 * (GW.m1 ** 2 + GW.m2 ** 2)) - 1), 2)}%, although $${round(GW.m1 + GW.m2 - GW.mf, 2)}$ solar masses were radiated as gravitational waves — as Hawking's area theorem requires.`,
      visual: areaPic,
    }),
    num({
      id: 'cp-extract', difficulty: 3, transfer: true,
      gen(r) {
        const [name, m, chi] = r.pick([['M87*', 6.5e9, 0.9], ['M87*', 6.5e9, 0.7], ['the remnant of GW150914', GW.mf, GW.chi]]);
        const frac = 1 - kerr.mIrr(chi), rp = kerr.rPlus(chi);
        return {
          prompt: t`Suppose ${name} ($${sci(m, 3)}$ solar masses) spins at $\chi = a/M = ${chi}$. Its horizon area $A = 8\pi Mr_+$ can never decrease, so the most energy that can ever be drawn from its spin leaves it as a non-spinning hole of the same area, of mass $M_\text{irr} = \sqrt{A/16\pi}$ ($G = c = 1$). At most how much energy could be extracted, in solar masses ($E = mc^2$)?`,
          answer: frac * m, units: 'Msun', tol: { rel: 0.01 },
          errors: [
            { value: kerr.mIrr(chi) * m, feedback: t`That is $M_\text{irr}$, what remains. The extractable energy is $M - M_\text{irr}$.` },
            { value: (1 - rp / 2) * m, feedback: t`That uses $A = 4\pi r_+^2$, which gives $M_\text{irr} = r_+/2$. The Kerr horizon's area is $4\pi(r_+^2 + a^2) = 8\pi Mr_+$.` },
            { value: (1 - Math.sqrt(1 - chi * chi)) * m, feedback: t`Check $M_\text{irr}$: $\sqrt{8\pi Mr_+/16\pi} = \sqrt{Mr_+/2} = M\sqrt{(1 + \sqrt{1 - \chi^2})/2}$.` },
          ],
          hints: [t`$M_\text{irr} = \sqrt{8\pi Mr_+/16\pi} = \sqrt{Mr_+/2}$, with $r_+ = M\left(1 + \sqrt{1 - \chi^2}\right) = ${round(rp, 5)}M$.`, t`So $M_\text{irr} = ${round(kerr.mIrr(chi), 5)}M$; the extractable energy is $M - M_\text{irr}$.`],
          teach: 'The area theorem splits a black hole’s mass into an irreducible part and rotational energy that can, in principle, be taken out.',
          explain: t`$M_\text{irr} = M\sqrt{(1 + \sqrt{1 - \chi^2})/2} = ${round(kerr.mIrr(chi), 5)}M$, so at most $${round(100 * frac, 3)}\%$ of the mass — $${sci(frac * m, 3)}$ solar masses — is rotational energy that could be extracted, for example by the Penrose process or by magnetic fields threading the ergosphere. Even a maximally spinning hole keeps $1/\sqrt2$ of its mass: at most $29\%$ can come out.`,
          visual: irrPic,
        };
      },
    }),
  ],
  sources: [
    { label: 'Kerr, “Gravitational Field of a Spinning Mass as an Example of Algebraically Special Metrics”, Phys. Rev. Lett. 11, 237 (1963)', url: 'https://doi.org/10.1103/PhysRevLett.11.237' },
    { label: 'Bardeen, Press & Teukolsky, “Rotating Black Holes: Locally Nonrotating Frames, Energy Extraction, and Scalar Synchrotron Radiation”, ApJ 178, 347 (1972)', url: 'https://doi.org/10.1086/151796' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 7 (the Kerr metric)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'LIGO Scientific & Virgo Collaborations, GWTC-1 (2019), Table III', url: 'https://arxiv.org/abs/1811.12907' },
  ],
});
