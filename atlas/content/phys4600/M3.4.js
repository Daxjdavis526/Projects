// Absorption and dispersion in conductors (Griffiths §9.4.1–9.4.2, with the
// free-electron picture of §9.4.3 for metals and plasmas). In an ohmic
// conductor the wave equation gains a term μσ ∂E/∂t; the wave number turns
// complex, k̃ = k + iκ, and the field dies as e^{−z/δ} with δ = 1/κ. For a
// good conductor (σ ≫ εω) k ≈ κ ≈ √(ωμσ/2): δ = √(2/ωμσ), B lags E by 45°,
// and B/E = √(μσ/ω) is huge, so the energy is mostly magnetic and the metal
// reflects. Real numbers: copper (σ = 5.95 × 10⁷ S/m) at 60 Hz (8.4 mm) and
// 10 GHz (0.65 μm); seawater (4.8 S/m) against submarine VLF (24 kHz: 1.5 m)
// and ELF (76 Hz: 26 m). Dispersion: σ itself depends on ω (Drude:
// σ̃ = σ₀/(1 − iωτ), τ ≈ 25 fs in copper), and with collisions negligible the
// free electrons are a plasma: k² = (ω² − ω_p²)/c² (the dispersion relation of
// PHYS 3750 W6.4), evanescent below ω_p — metals reflect light and turn
// transparent in the ultraviolet (sodium at 209 nm), and the ionosphere
// reflects shortwave below its critical frequency f_p ≈ 8.98√n_e Hz but passes
// GPS. Transfers: a submarine's VLF antenna depth, the maximum usable
// frequency of a shortwave link (secant law).
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, C, QE, ME, PI, SIGMA, sf, skin, plasmaF } from './_em4b.js';

const t = String.raw;
const CU = SIGMA.copper.sigma, AL = SIGMA.aluminium.sigma, AG = SIGMA.silver.sigma, SEA = SIGMA.seawater.sigma;
const NA = 6.02214076e23;
const nOf = (rho, M) => (rho / M) * NA;           // one free electron per atom: ρ (kg/m³), M (kg/mol)
const N_CU = nOf(8960, 0.063546), N_NA = nOf(968, 0.02299);
const TAU_CU = (CU * ME) / (N_CU * QE * QE);       // the Drude relaxation time of copper

// the worked example: copper at mains frequency and at 10 GHz
const EX = { f1: 60, f2: 10e9 };
EX.d1 = skin(CU, EX.f1);
EX.d2 = skin(CU, EX.f2);
EX.q2 = CU / (EPS0 * 2 * PI * EX.f2);
EX.BE = Math.sqrt((MU0 * CU) / (2 * PI * EX.f2)) * C;   // cB/E in the metal at 10 GHz

const r4 = (v) => +(+v).toPrecision(4);

/** The field inside a good conductor: E (violet) and B (teal, rescaled) against depth in skin depths, at phase ph (degrees). */
function skinPic(caption, { ph = 30, B = true, depth = 5, marks = [] } = {}) {
  const p = r4((ph * PI) / 180);
  return {
    type: 'graph',
    params: {
      x: [-0.6, depth], y: [-1.25, 1.25], aspect: 'wide', xlabel: 'depth z / δ', ylabel: '', yticks: 0, grid: false,
      shade: [{ fn: '1.25', lower: '-1.25', from: 0, to: depth, color: 'ink3', alpha: 0.25 }],
      curves: [
        { fn: 'exp(-x)', domain: [0, depth], color: 'ink3', width: 1, dash: [3, 4] },
        { fn: '-exp(-x)', domain: [0, depth], color: 'ink3', width: 1, dash: [3, 4] },
        { fn: `exp(-x)*cos(x - ${p})`, domain: [0, depth], color: 'violet', width: 2.4, label: 'E', labelAt: 0.05, labelDy: -6 },
        ...(B ? [{ fn: `exp(-x)*cos(x - ${p} - pi/4)`, domain: [0, depth], color: 'teal', width: 2.2, dash: [7, 4], label: 'B (rescaled)', labelAt: 1.6, labelDy: -10 }] : []),
      ],
      points: [{ x: depth * 0.7, y: 1.05, r: 0, label: 'conductor', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' }, ...marks],
    },
    caption,
  };
}

/** A sky-wave path: rays from the ground to a flat layer and back, meeting it at th (deg) from the vertical. Not to scale. */
function skyPic(th, caption) {
  const ta = Math.tan((th * PI) / 180), H = Math.min(1.5, 2.6 / ta), X = r4(H * ta);
  return {
    type: 'graph',
    params: {
      x: [-3, 3], y: [0, 2.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: String(r4(H + 0.6)), lower: String(r4(H)), from: -5, to: 5, color: 'violet', alpha: 0.2 }],
      curves: [
        { fn: '0', domain: [-5, 5], color: 'good', width: 2 },
        { param: [`${-X}*(1 - t)`, `${r4(H)}*t`], t: [0, 1], color: 'gold', width: 2 },
        { param: [`${X}*t`, `${r4(H)}*(1 - t)`], t: [0, 1], color: 'gold', width: 2 },
        { param: ['0', 't'], t: [r4(Math.max(0.05, H - 0.8)), r4(H)], color: 'ink4', dash: [4, 4], width: 1 },
      ],
      points: [
        { x: 0, y: r4(H + 0.3), r: 0, label: 'ionosphere (F2 layer)', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'violet' },
        { x: -0.18, y: r4(H - 0.3), r: 0, label: 'θ', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 },
        { x: r4(-X), y: 0, r: 4, color: 'ink2', label: 'transmitter', labelDy: 12, labelDx: -10 },
        { x: X, y: 0, r: 4, color: 'ink2', label: 'receiver', labelDy: 12, labelDx: -30 },
      ],
    },
    caption,
  };
}

/** Skin depth against frequency on log–log axes for copper, aluminium and seawater (good-conductor formula), with marks. */
function depthPic(caption, { points = [], vlines = [], which = ['cu', 'sea'] } = {}) {
  const line = (sg) => `0.5*log10(2/(2*pi*${MU0}*${sg})) - 0.5*x`;   // log10 δ against x = log10 f
  const L = { cu: [CU, 'accent', 'copper'], al: [AL, 'good', 'aluminium'], sea: [SEA, 'teal', 'seawater'] };
  return {
    type: 'graph',
    params: {
      x: [0, 10], y: [-7, 2], xlog: true, ylog: true, xlabel: 'frequency (Hz)', ylabel: 'skin depth (m)', aspect: 'wide',
      curves: which.map((k) => ({ fn: line(r4(L[k][0])), color: L[k][1], width: 2.2, label: L[k][2], labelAt: k === 'sea' ? 6.2 : 7.5, labelDy: k === 'sea' ? -10 : 14 })),
      points, vlines,
    },
    caption,
  };
}

// Explore expressions: choice m = 1 copper, 2 aluminium, 3 seawater
const is = (j) => `step(0.5 - abs(m - ${j}))`;
const SG = `(s1*${is(1)} + s2*${is(2)} + s3*${is(3)})`, ER = `(1 + 79*${is(3)})`;
const W = '(2*pi*f)', Q = `(${SG}/(${ER}*e0*${W}))`;
const KAPPA = `(${W}*sqrt(${ER}*e0*mu0/2)*sqrt(sqrt(1 + ${Q}^2) - 1))`;

export default lesson({
  id: 'phys4600.M3.4',
  title: 'Absorption and dispersion in conductors',
  minutes: 18, difficulty: 3,
  equation: t`\begin{gathered}\tilde k = k + i\kappa,\quad \vec E = E_0\,e^{-\kappa z}\cos(kz - \omega t)\,\hat x, \\ \delta = \frac1\kappa \approx \sqrt{\frac{2}{\omega\mu\sigma}}\quad(\sigma \gg \varepsilon\omega)\end{gathered}`,
  intro: t`In a conductor an electric field drives a current $\vec J = \sigma\vec E$, and that current eats the wave. Maxwell’s equations give a wave equation with an extra term, $\nabla^2\vec E = \mu\sigma\,\partial\vec E/\partial t + \mu\varepsilon\,\partial^2\vec E/\partial t^2$. A plane wave still solves it, but only with a **complex wave number** $\tilde k = k + i\kappa$. The real part $k$ still sets the wavelength. The imaginary part makes the amplitude die away as $e^{-\kappa z}$, falling by $1/e$ every **skin depth** $\delta = 1/\kappa$. In a good conductor $k$ and $\kappa$ are equal, so the wave dies within about one wavelength of where it entered — and the magnetic field lags the electric field by $45^\circ$. Push the frequency high enough and $\sigma$ itself changes: the free electrons stop behaving like a resistor and behave like a **plasma**, which reflects everything below its plasma frequency.`,
  symbols: [
    { tex: '\\tilde k', text: t`the complex wave number, in 1/m: real part $k$ (wavelength $2\pi/k$) plus imaginary part $\kappa$ (attenuation)` },
    { tex: '\\kappa', text: t`the attenuation constant, in 1/m: the field falls as $e^{-\kappa z}$` },
    { tex: '\\delta', text: 'the skin depth, in m: the depth at which the field has fallen to 1/e ≈ 37% of its value at the surface' },
    { tex: '\\sigma', text: t`the conductivity, in S/m ($5.95\times10^{7}$ for copper, about 4.8 for seawater)` },
    { tex: '\\omega', text: t`the angular frequency of the wave, in rad/s` },
    { tex: '\\mu,\\ \\varepsilon', text: t`the conductor’s permeability and permittivity ($\mu_0$ and $\varepsilon_0$ for most metals)` },
    { tex: 'E_0', text: 'the field amplitude at the surface, in V/m' },
  ],
  why: t`Skin depth decides how thick a waveguide’s plating must be, why power lines are stranded around a steel core, how deep a submarine can hear a radio, and why the ionosphere carries shortwave around the world but lets GPS through.`,
  visual: {
    type: 'graph',
    title: 'A wave dying inside a conductor',
    lead: t`The surface of a conductor is at $z = 0$; depth is measured in skin depths, so the picture is the same for **every** good conductor. Violet is $E$, dashed teal is $B$ (rescaled — in the metal it is far larger than $E/c$), and the grey dashes are the envelope $e^{-z/\delta}$. Choose a material and a frequency to see what one skin depth is in metres.`,
    tasks: [
      t`Step $\omega t$: the crests move inward while shrinking — the wave travels, but dies within about one wavelength ($2\pi\delta$).`,
      t`The teal peaks trail the violet ones by an eighth of a cycle: $B$ lags $E$ by $45^\circ$.`,
      t`Pick seawater and raise the frequency above 100 MHz: the good-conductor formula starts to disagree with the exact skin depth, because the displacement current is no longer negligible.`,
    ],
    params: {
      x: [-0.6, 5], y: [-1.25, 1.25], aspect: 'wide', xlabel: 'depth z / δ', ylabel: '', yticks: 0, grid: false,
      constants: { mu0: MU0, e0: EPS0, s1: r4(CU), s2: r4(AL), s3: SEA },
      sliders: [
        { key: 'ph', label: t`Time $\omega t$`, min: 0, max: 360, step: 5, value: 30, unit: '^\\circ', explain: 'One full cycle is 360°.' },
        { key: 'f', label: t`Frequency $f$`, min: 1, max: 1e10, value: 60, logScale: true, unit: '\\mathrm{Hz}', explain: 'From 1 Hz to 10 GHz: mains power at 60 Hz, submarine radio near 20 kHz, Wi-Fi at 2.4 GHz.' },
      ],
      choices: [{ key: 'm', label: 'Conductor', options: [[1, 'copper'], [2, 'aluminium'], [3, 'seawater']], value: 1, explain: t`Conductivities $5.95\times10^{7}$, $3.77\times10^{7}$ and 4.8 S/m; seawater also has $\varepsilon_r \approx 80$.` }],
      shade: [{ fn: '1.25', lower: '-1.25', from: 0, to: 5, color: 'ink3', alpha: 0.25 }],
      curves: [
        { fn: 'exp(-x)', domain: [0, 5], color: 'ink3', width: 1, dash: [3, 4] },
        { fn: '-exp(-x)', domain: [0, 5], color: 'ink3', width: 1, dash: [3, 4] },
        { fn: 'exp(-x)*cos(x - ph*pi/180)', domain: [0, 5], color: 'violet', width: 2.4, label: 'E', labelAt: 0.05, labelDy: -6 },
        { fn: 'exp(-x)*cos(x - ph*pi/180 - pi/4)', domain: [0, 5], color: 'teal', width: 2.2, dash: [7, 4], label: 'B (rescaled)', labelAt: 1.6, labelDy: -10 },
      ],
      points: [{ x: 3.5, y: 1.05, r: 0, label: 'conductor', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' }],
      readouts: [
        { label: t`Skin depth $\delta = 1/\kappa$ (exact)`, expr: `1/${KAPPA}`, unit: '\\mathrm{m}', digits: 3 },
        { label: t`Good-conductor $\sqrt{2/\omega\mu\sigma}$`, expr: `sqrt(2/(${W}*mu0*${SG}))`, unit: '\\mathrm{m}', digits: 3 },
        { label: t`$\sigma/\varepsilon\omega$ (good conductor if $\gg 1$)`, expr: Q, digits: 3 },
      ],
    },
    caption: t`Depth in units of $\delta$, fields in units of their values at the surface; $B$ is rescaled to the same height as $E$. Plane wave, non-magnetic conductor, with $\sigma$ held at its DC value — true for metals up to the infrared, and for seawater only roughly at gigahertz frequencies.`,
  },
  example: {
    prompt: t`How far does an electromagnetic field penetrate copper ($\sigma = ${tex(CU, 3)}$ S/m) at mains frequency, ${EX.f1} Hz, and at ${nice(EX.f2 / 1e9)} GHz? Is copper a good conductor at both, and how do $E$ and $B$ compare inside it?`,
    visual: depthPic(t`Skin depth against frequency (both axes logarithmic) from the good-conductor formula. The two lines are parallel: $\delta \propto 1/\sqrt f$.`, { which: ['cu', 'al', 'sea'] }),
    steps: [
      { label: 'Good conductor?', text: t`The test is $\sigma/\varepsilon\omega \gg 1$. At ${nice(EX.f2 / 1e9)} GHz, $\sigma/\varepsilon_0\omega \approx ${tex(EX.q2, 2)}$; at ${EX.f1} Hz it is larger still. Copper is a superb conductor at both.` },
      { label: 'The formula', text: t`For $\sigma \gg \varepsilon\omega$, $k \approx \kappa \approx \sqrt{\omega\mu\sigma/2}$, so $\delta = \sqrt{2/\omega\mu\sigma}$: it shrinks as $1/\sqrt f$.` },
      { label: 'Mains', text: t`$\delta = \sqrt{\dfrac{2}{2\pi(${EX.f1})(4\pi\times10^{-7})(${tex(CU, 3)})}} \approx ${nice(sf(EX.d1 * 1e3, 3))}$ mm. A thick busbar carries current mainly in its outer centimetre, which is why large ones are hollow tubes and overhead lines are aluminium strands around a steel core.` },
      { label: 'Microwaves', text: t`$\delta \approx ${nice(sf(EX.d2 * 1e6, 3))}$ μm — ${nice(sf(EX.d1 / EX.d2, 2))} times thinner, as $\sqrt{${tex(EX.f2 / EX.f1, 2)}}$ predicts. A few micrometres of silver or gold plating carries all the current of a waveguide.` },
      { label: 'E against B', text: t`$\tilde k$ has phase $45^\circ$, so $B$ lags $E$ by $45^\circ$, and $B/E = |\tilde k|/\omega = \sqrt{\mu\sigma/\omega}$. At ${nice(EX.f2 / 1e9)} GHz $cB/E \approx ${nice(sf(EX.BE, 2))}$: the field inside is overwhelmingly magnetic, and almost all the incoming energy is reflected.` },
    ],
    answer: t`$\delta \approx ${nice(sf(EX.d1 * 1e3, 3))}$ mm at ${EX.f1} Hz and $${nice(sf(EX.d2 * 1e6, 3))}$ μm at ${nice(EX.f2 / 1e9)} GHz; inside, $B$ lags $E$ by $45^\circ$ and dominates it.`,
  },
  practice: [
    num({
      id: 'delta', difficulty: 2,
      gen(r) {
        const [mat, sg] = r.pick([['copper', CU], ['aluminium', AL], ['silver', AG]]);
        const f = r.pick([50, 1e3, 1e6, 100e6, 2.4e9]);
        const d = skin(sg, f), fs = f >= 1e9 ? `${nice(f / 1e9)} GHz` : f >= 1e6 ? `${nice(f / 1e6)} MHz` : f >= 1e3 ? `${nice(f / 1e3)} kHz` : `${f} Hz`;
        const unit = d > 1e-3 ? 'mm' : 'um', scale = d > 1e-3 ? 1e3 : 1e6;
        return {
          prompt: t`What is the skin depth of ${mat} ($\sigma = ${tex(sg, 3)}$ S/m, non-magnetic) at ${fs}, in ${unit === 'mm' ? 'mm' : 'μm'}?`,
          visual: skinPic(t`The field inside a good conductor against depth in skin depths. The picture is the same for every good conductor; only $\delta$ changes.`),
          answer: d * scale, units: unit === 'mm' ? 'mm' : 'μm', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(2 / (f * MU0 * sg)) * scale, feedback: t`Use $\omega = 2\pi f$, not $f$.` },
            { value: Math.sqrt(1 / (2 * PI * f * MU0 * sg)) * scale, feedback: t`The formula has a 2 on top: $\delta = \sqrt{2/\omega\mu\sigma}$.` },
          ],
          hints: [t`$\delta = \sqrt{\dfrac{2}{\omega\mu\sigma}}$ with $\omega = 2\pi f$ and $\mu = \mu_0$.`, t`Equivalently $\delta = 1/\sqrt{\pi f\mu_0\sigma}$.`],
          teach: 'For a good conductor δ = √(2/ωμσ): it falls as one over the square root of the frequency.',
          explain: t`$\delta = 1/\sqrt{\pi f\mu_0\sigma} \approx ${nice(sf(d * scale, 3))}$ ${unit === 'mm' ? 'mm' : 'μm'}.`,
        };
      },
    }),
    num({
      id: 'f-for-depth', difficulty: 2,
      gen(r) {
        const [what, mat, sg, th] = r.pick([['household aluminium foil', 'aluminium', AL, 16e-6], ['a copper circuit-board trace', 'copper', CU, 35e-6], ['a copper shield can wall', 'copper', CU, 0.2e-3]]);
        const f = 1 / (PI * MU0 * sg * th * th);
        return {
          prompt: t`${what[0].toUpperCase() + what.slice(1)} is ${th >= 1e-4 ? `${nice(th * 1e3)} mm` : `${nice(th * 1e6)} μm`} thick. Above what frequency is it thicker than one skin depth of ${mat} ($\sigma = ${tex(sg, 3)}$ S/m)? Give it in kHz.`,
          visual: depthPic(t`Skin depth against frequency for copper and aluminium (good-conductor formula, logarithmic axes).`, { which: ['cu', 'al'] }),
          answer: f / 1e3, units: 'kHz', tol: { rel: 0.01 },
          errors: [{ value: (2 * PI * f) / 1e3, feedback: t`You found $\omega$; divide by $2\pi$ for $f$.` }, { value: 1 / (PI * MU0 * sg * th) / 1e3, feedback: t`$\delta \propto 1/\sqrt f$, so $f \propto 1/\delta^2$: square the thickness.` }],
          hints: [t`Set $\delta = \sqrt{2/(2\pi f\mu_0\sigma)}$ equal to the thickness $d$ and solve for $f$.`, t`$f = \dfrac{1}{\pi\mu_0\sigma d^2}$.`],
          teach: 'Because δ ∝ 1/√f, the frequency at which a sheet is one skin depth thick goes as 1/d².',
          explain: t`$f = 1/(\pi\mu_0\sigma d^2) \approx ${nice(sf(f / 1e3, 3))}$ kHz. Above it the field has fallen to $1/e$ before reaching the far side; each further skin depth costs another factor $e$ (8.7 dB).`,
        };
      },
    }),
    num({
      id: 'absorb-dB', difficulty: 3,
      gen(r) {
        const [mat, sg] = r.pick([['aluminium', AL], ['copper', CU]]);
        const th = r.pick([0.1, 0.2, 0.5]), f = r.pick([1e6, 10e6, 100e6]);
        const d = skin(sg, f), A = 20 * Math.log10(Math.exp((th * 1e-3) / d));
        return {
          prompt: t`An avionics box has ${mat} walls ${th} mm thick ($\sigma = ${tex(sg, 3)}$ S/m). By how many decibels does the field of a ${nice(f / 1e6)} MHz wave fall in crossing the wall, counting only the absorption inside the metal (not the reflection at its faces)?`,
          visual: skinPic(t`The field decaying through the wall, in skin depths. The real wall is many skin depths thick: the field drops by $e$ for each.`, { depth: 5 }),
          answer: A, units: 'dB', tol: { rel: 0.01 },
          errors: [{ value: 10 * Math.log10(Math.exp((th * 1e-3) / d)), feedback: t`The field (amplitude) falls as $e^{-z/\delta}$; for a field ratio the decibels are $20\log_{10}$.` }],
          hints: [t`Find $\delta$, then the number of skin depths $d/\delta$; the field falls by $e^{-d/\delta}$.`, t`In decibels: $20\log_{10}e^{d/\delta} = 8.69\,d/\delta$ dB.`],
          teach: 'Each skin depth of metal absorbs 8.7 dB of field: shielding gets exponentially better with thickness and frequency.',
          explain: t`$\delta \approx ${nice(sf(d * 1e6, 3))}$ μm, so the wall is $${nice(sf((th * 1e-3) / d, 3))}$ skin depths thick and absorbs $8.69 \times ${nice(sf((th * 1e-3) / d, 3))} \approx ${nice(sf(A, 3))}$ dB. The reflection at the faces adds more still. In practice seams, vents and cable entries, not the metal, limit a box’s shielding — and at low frequencies magnetic fields, with their large skin depths, are the hard part.`,
        };
      },
    }),
    mcq({
      id: 'freq-trend', difficulty: 2,
      prompt: t`An engineer says: “At higher frequency the field gets into the metal more easily, so the current spreads through more of the wire.” What is wrong?`,
      visual: depthPic(t`Skin depth against frequency for copper and seawater (logarithmic axes).`),
      choices: [
        t`It is backwards: $\delta \propto 1/\sqrt f$, so at higher frequency the current crowds into a thinner skin and the wire’s resistance rises`,
        t`Nothing: the skin depth grows as $\sqrt f$`,
        'Skin depth does not depend on frequency, only on the conductivity',
        'At high frequency the current flows only along the axis of the wire',
      ],
      answer: 0,
      why: {
        1: t`$\delta = \sqrt{2/\omega\mu\sigma}$ has $\omega$ in the **denominator**: it shrinks as the frequency rises.`,
        2: t`$\omega$ appears in $\delta$ directly: the faster the field changes, the harder the induced currents push back.`,
        3: t`Inside a good conductor the current crowds toward the **surface**, where the field enters, not the axis.`,
      },
      hints: ['Look at which way the lines slope.', t`$\delta = \sqrt{2/\omega\mu\sigma}$.`],
      teach: 'Higher frequency, thinner skin: the current crowds into the surface and AC resistance rises.',
      explain: t`The induced eddy currents oppose a changing field more strongly the faster it changes, so the field — and the current — is confined to $\delta \propto 1/\sqrt f$. That is why radio-frequency coils use Litz wire (many thin insulated strands) and why RF conductors are plated with silver.`,
    }),
    mcq({
      id: 'b-lags', difficulty: 3,
      prompt: t`Inside a good conductor, how are the wave’s $\vec E$ and $\vec B$ related?`,
      visual: skinPic(t`$E$ (violet) and rescaled $B$ (teal) inside a good conductor at one instant. Depth in skin depths.`, { ph: 60 }),
      choices: [
        t`$B$ lags $E$ by $45^\circ$, and $B/E = \sqrt{\mu\sigma/\omega}$ is far larger than in vacuum, so the field energy is mostly magnetic`,
        t`$B$ and $E$ are in phase with $B = E/c$, exactly as in vacuum`,
        t`$B$ lags $E$ by $90^\circ$, and $B = E/c$`,
        t`$B$ leads $E$ by $45^\circ$, and $B/E$ is smaller than in vacuum, so the energy is mostly electric`,
      ],
      answer: 0,
      why: {
        1: t`In a conductor $B_0/E_0 = \tilde k/\omega$, and $\tilde k$ is complex: both the phase and the size change.`,
        2: t`The phase of $\tilde k$ is $\arctan(\kappa/k)$, which is $45^\circ$ when $k = \kappa$ (a good conductor), not $90^\circ$.`,
        3: t`$B = \tilde kE/\omega$ with $|\tilde k| \gg \omega/c$: the magnetic field is the larger, and it lags.`,
      },
      hints: [t`Faraday’s law still gives $\tilde B_0 = \tilde k\tilde E_0/\omega$.`, t`For a good conductor $\tilde k \approx \sqrt{\omega\mu\sigma/2}\,(1 + i) = \sqrt{\omega\mu\sigma}\,e^{i\pi/4}$.`],
      teach: 'In a good conductor B lags E by 45° and is much stronger relative to E than in vacuum.',
      explain: t`$\tilde B_0 = \tilde k\tilde E_0/\omega$ with $\tilde k = \sqrt{\omega\mu\sigma}\,e^{i\pi/4}$: a $45^\circ$ lag and $B/E = \sqrt{\mu\sigma/\omega}$, thousands to millions of times $1/c$. The surface needs a large $B$ and almost no $E$ — the field pattern of a near-perfect mirror.`,
    }),
    num({
      id: 'drude-tau', difficulty: 3,
      prompt: t`Copper’s conductivity, $${tex(CU, 3)}$ S/m, comes from $n = ${tex(N_CU, 3)}$ free electrons per m³ (one per atom). In the free-electron (Drude) model $\sigma = ne^2\tau/m_e$, where $\tau$ is the mean time between collisions. Find $\tau$, in femtoseconds. (Above roughly $1/2\pi\tau$ the electrons no longer collide within a cycle, and $\sigma$ stops being a constant.)`,
      visual: depthPic(t`Skin depth of copper against frequency, from the DC conductivity. The line is trustworthy only while $\sigma$ stays at its DC value.`, { which: ['cu'] }),
      answer: TAU_CU * 1e15, units: 'fs', tol: { rel: 0.01 },
      errors: [{ value: ((N_CU * QE * QE) / (CU * ME)) * 1e15, feedback: t`Solve $\sigma = ne^2\tau/m_e$ for $\tau$: $\tau = m_e\sigma/ne^2$.` }],
      hints: [t`$\tau = \dfrac{m_e\sigma}{ne^2}$.`, t`$m_e = 9.109\times10^{-31}$ kg, $e = 1.602\times10^{-19}$ C.`],
      teach: 'Conductivity is a relaxation time in disguise: σ = ne²τ/m, with τ ~ 10⁻¹⁴ s in a good metal.',
      explain: t`$\tau = m_e\sigma/ne^2 \approx ${nice(sf(TAU_CU * 1e15, 3))}$ fs. So $1/2\pi\tau \approx ${nice(sf(1 / (2 * PI * TAU_CU) / 1e12, 2))}$ THz: through radio and microwaves copper’s DC conductivity holds and the skin-depth formula is right; in the infrared and visible the electrons answer as a nearly free plasma instead, $\tilde\sigma = \sigma_0/(1 - i\omega\tau)$, and the metal reflects as the next problems describe.`,
    }),
    num({
      id: 'plasma-f', difficulty: 2,
      gen(r) {
        const n = r.pick([1e11, 4e11, 1e12, 2e12]);
        const fp = plasmaF(n);
        return {
          prompt: t`At the peak of the ionosphere’s F2 layer the free-electron density is $${tex(n, 1)}\ \text{m}^{-3}$. What is the plasma frequency $f_p = \dfrac{1}{2\pi}\sqrt{\dfrac{n_ee^2}{\varepsilon_0m_e}}$ there, in MHz?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [-0.2, 3], xlabel: 'k (in units of ωₚ/c)', ylabel: 'ω (in units of ωₚ)', curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.4, label: 'ω² = ωₚ² + c²k²', labelAt: 1.6, labelDy: 18 }, { fn: 'x', color: 'ink3', dash: [5, 4], width: 1.4, label: 'ω = ck', labelAt: 2.4, labelDy: 14 }], hlines: [{ y: 1, color: 'warn', label: 'no travelling wave below ωₚ' }] }, caption: t`The dispersion relation of a collisionless plasma (from [PHYS 3750 W6.4](#/lesson/phys3750.W6.4)): no real $k$ exists below $\omega_p$.` },
          answer: fp / 1e6, units: 'MHz', tol: { rel: 0.01 },
          errors: [{ value: (2 * PI * fp) / 1e6, feedback: t`That is $\omega_p$ in rad/s; divide by $2\pi$.` }],
          hints: [t`$f_p = \dfrac{1}{2\pi}\sqrt{\dfrac{n_ee^2}{\varepsilon_0m_e}}$, with $e = 1.602\times10^{-19}$ C and $m_e = 9.109\times10^{-31}$ kg.`, t`A handy form: $f_p \approx 8.98\sqrt{n_e}$ Hz with $n_e$ in $\text{m}^{-3}$.`],
          teach: 'A plasma’s free electrons set a frequency, f_p ≈ 8.98√nₑ Hz, below which waves cannot travel through it.',
          explain: t`$f_p \approx 8.98\sqrt{${tex(n, 1)}} \approx ${nice(sf(fp / 1e6, 3))}$ MHz. Radio waves below this frequency sent straight up are reflected; above it they pass through.`,
        };
      },
    }),
    mcq({
      id: 'gps-vs-hf', difficulty: 2,
      prompt: t`A shortwave broadcast at 6 MHz bounces off the ionosphere and reaches listeners across an ocean, while GPS signals at 1.575 GHz come straight through it from orbit. Why the difference?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-0.2, 3], xlabel: 'k (in units of ωₚ/c)', ylabel: 'ω (in units of ωₚ)', curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.4 }, { fn: 'x', color: 'ink3', dash: [5, 4], width: 1.4 }], hlines: [{ y: 1, color: 'warn', label: 'ωₚ' }] }, caption: t`The plasma dispersion relation $\omega^2 = \omega_p^2 + c^2k^2$ (blue) against light in vacuum (dashed).` },
      choices: [
        t`The ionosphere’s plasma frequency is a few MHz: below it $k$ is imaginary and the wave is reflected; far above it the electrons cannot follow and the plasma is nearly transparent`,
        'GPS signals are too weak to be reflected',
        'The ionosphere absorbs low frequencies and re-emits them downward',
        'Shortwave travels along the ground, following the Earth’s curve',
      ],
      answer: 0,
      why: {
        1: 'Reflection does not depend on the strength of a wave: the equations are linear.',
        2: t`Below $\omega_p$ the wave is reflected, not absorbed and re-emitted: the energy returns because nothing can travel inward.`,
        3: 'Ground waves exist at low frequencies but die within a few hundred kilometres at 6 MHz; ocean-crossing shortwave goes by the sky.',
      },
      hints: [t`Compare 6 MHz and 1.575 GHz with the ionosphere’s peak $f_p$, a few MHz to about 12 MHz.`, t`For $\omega < \omega_p$, $k^2 = (\omega^2 - \omega_p^2)/c^2 < 0$.`],
      teach: 'Below the plasma frequency a wave cannot travel through a plasma and is reflected; far above it the plasma barely notices.',
      explain: t`With $k$ imaginary the field decays into the layer, like the field in a metal, and the wave returns. (At an angle the reflection reaches higher frequencies, as the checkpoint shows.) At 1.575 GHz, $\omega \gg \omega_p$ and the ionosphere only delays the signal slightly — an error GPS receivers correct by comparing two frequencies.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sub', difficulty: 3, transfer: true,
      gen(r) {
        const [band, f] = r.pick([['VLF transmitter at 24.0 kHz', 24e3], ['VLF transmitter at 19.8 kHz', 19.8e3], ['ELF system at 76 Hz', 76]]);
        const fac = r.pick([100, 1000, 1e4]);
        const d = skin(SEA, f), z = d * Math.log(fac);
        return {
          prompt: t`A submarine listens to a ${band}. Seawater has $\sigma \approx ${SEA}$ S/m. At what depth has the signal’s field fallen to $1/${fac === 1e4 ? '10\\,000' : fac}$ of its value just below the surface? Give it in metres.`,
          visual: depthPic(t`Skin depth against frequency for copper and seawater (good-conductor formula; seawater is a good conductor far below 1 GHz).`),
          answer: z, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: d * Math.log10(fac), feedback: t`The field falls as $e^{-z/\delta}$: use the natural logarithm, $z = \delta\ln(${fac === 1e4 ? '10\\,000' : fac})$.` }, { value: d * Math.log(fac) / 2, feedback: t`That would be the depth for the **power** to fall by that factor; the question is about the field.` }],
          hints: [t`Check the good-conductor condition, then $\delta = \sqrt{2/\omega\mu_0\sigma}$.`, t`$e^{-z/\delta} = 1/${fac === 1e4 ? '10\\,000' : fac}$ gives $z = \delta\ln(${fac === 1e4 ? '10\\,000' : fac})$.`],
          teach: 'Each skin depth costs a factor e: the depth for a given loss is δ times its natural log.',
          explain: t`$\delta \approx ${nice(sf(d, 3))}$ m, so $z = \delta\ln(${fac === 1e4 ? '10\\,000' : fac}) \approx ${nice(sf(z, 3))}$ m. That is why VLF reaches only a submarine near periscope depth (or a trailing wire antenna), and why navies built enormous ELF antennas: at 76 Hz the skin depth is tens of metres.`,
        };
      },
    }),
    num({
      id: 'cp-muf', difficulty: 3, transfer: true,
      gen(r) {
        const fc = r.pick([4.5, 6, 7.5, 9]), th = r.pick([60, 70, 75]);
        const muf = fc / Math.cos((th * PI) / 180);
        return {
          prompt: t`An ionosonde measures the F2 layer’s critical frequency (its peak plasma frequency) as ${fc} MHz. A long-distance shortwave link meets the layer at $${th}^\circ$ from the vertical. Treating the layer as flat, what is the highest frequency it will reflect back down to the far station — the maximum usable frequency — in MHz?`,
          visual: skyPic(th, t`A sky-wave path in the flat-Earth, sharp-layer picture; not to scale (the layer is about 300 km up).`),
          answer: muf, units: 'MHz', tol: { rel: 0.01 },
          errors: [{ value: fc * Math.cos((th * PI) / 180), feedback: t`Oblique incidence lets **higher** frequencies reflect: only the vertical part of $\vec k$ has to be stopped, so $f_{\max} = f_c/\cos\theta$.` }, { value: fc, feedback: 'That is the limit straight up. At a slant the layer reflects higher frequencies.' }],
          hints: [t`Inside the plasma $c^2k^2 = \omega^2 - \omega_p^2$, and the component of $\vec k$ along the layer is fixed by the angle of incidence (as in Snell’s law).`, t`Turning back needs $\omega^2\cos^2\theta \le \omega_p^2$: $f_{\max} = f_c/\cos\theta$, the secant law.`],
          teach: 'At a slant only the vertical part of k must be stopped, so the ionosphere reflects up to f_c/cos θ.',
          explain: t`The along-layer component $k\sin\theta$ is conserved, leaving $c^2k_z^2 = \omega^2\cos^2\theta - \omega_p^2$; the wave turns back where this reaches zero. So $f_{\max} = ${fc}/\cos ${th}^\circ \approx ${nice(sf(muf, 3))}$ MHz. Real links use a curved-Earth correction and stay a little below the MUF, but the secant law is the heart of shortwave propagation forecasts.`,
        };
      },
    }),
    num({
      id: 'cp-sodium', difficulty: 3,
      prompt: t`Sodium has one free electron per atom; its density is 968 kg/m³ and its molar mass 22.99 g/mol. Below what wavelength does a sodium film stop reflecting and start to transmit ultraviolet light? Treat its electrons as a collisionless free-electron plasma and give the answer in nm.`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-0.2, 3], xlabel: 'k (in units of ωₚ/c)', ylabel: 'ω (in units of ωₚ)', curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.4 }, { fn: 'x', color: 'ink3', dash: [5, 4], width: 1.4 }], hlines: [{ y: 1, color: 'warn', label: 'ωₚ' }] }, caption: t`The free-electron dispersion relation: transparent above $\omega_p$, reflecting below it.` },
      answer: (C / plasmaF(N_NA)) * 1e9, units: 'nm', tol: { rel: 0.01 },
      errors: [{ value: (C / (2 * PI * plasmaF(N_NA))) * 1e9, feedback: t`$\lambda = c/f_p = 2\pi c/\omega_p$: keep the $2\pi$.` }],
      hints: [t`$n_e = \rho N_A/M$; then $\omega_p = \sqrt{n_ee^2/\varepsilon_0m_e}$.`, t`The film transmits for $\omega > \omega_p$, i.e. $\lambda < 2\pi c/\omega_p$.`],
      teach: 'A metal is a plasma with a plasma frequency in the ultraviolet: it reflects below and transmits above.',
      explain: t`$n_e = ${tex(N_NA, 3)}\ \text{m}^{-3}$, $f_p \approx ${tex(plasmaF(N_NA), 3)}$ Hz, so $\lambda_p = c/f_p \approx ${nice(sf((C / plasmaF(N_NA)) * 1e9, 3))}$ nm. R. W. Wood observed exactly this ultraviolet transparency of the alkali metals in 1933; for sodium the measured edge is near 210 nm. Copper, with $n_e \approx ${tex(N_CU, 3)}\ \text{m}^{-3}$, has its edge near ${nice(sf((C / plasmaF(N_CU)) * 1e9, 2))} nm, but its bound electrons complicate the picture (and colour it).`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §9.4', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Kittel, Introduction to Solid State Physics (8th ed.), ch. 14: plasma frequencies and UV transparency of the alkali metals', url: 'https://www.wiley.com/en-us/Introduction+to+Solid+State+Physics%2C+8th+Edition-p-9780471415268' },
  ],
});

