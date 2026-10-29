// WKB in the classically forbidden region and the tunnelling exponent
// (Griffiths & Schroeter §9.2). Where V > E the WKB solutions grow or decay as
// e^{±∫|p|dx/ħ}; across a thick barrier only the decaying one survives, and
// T ≈ e^{−2γ}, γ = (1/ħ)∫|p|dx. The prefactor needs the connection formulas
// (M5.3). Tests of the exponent: the inverted-parabola barrier, whose exact
// T = 1/(1 + e^{2γ}) (Kemble 1935; Landau & Lifshitz §50) with γ = πΔ/ħω;
// the rectangular barrier (right exponent, wrong prefactor: sharp edges);
// a Gaussian barrier against an exact transfer-matrix calculation (code).
// The Coulomb barrier's integral in closed form, its thin-barrier limit
// 2γ → 2πη with η = zZαc/v, and its first correction −4√(R/b)·γ₀/π… ;
// the half-lives and the Geiger–Nuttall fit are phys3710.N2.2's and are only
// linked. Transfers: the STM (an order of magnitude per ångström), Fowler–
// Nordheim field emission, the CNO cycle and the Sun's p + p Gamow factor.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBARC_EVNM, MEC2_EV, ALPHA, potPic, r6, seg, label } from './_q2b.js';
import { MPC2 } from '../phys2710/_constants.js';

const t = String.raw;
const SQ2M = Math.sqrt(2 * MEC2_EV) / HBARC_EVNM;            // nm⁻¹ eV^-½: κ = SQ2M·√(V − E) for an electron
const kappa = (dV) => SQ2M * Math.sqrt(dV);                  // nm⁻¹
const rectExact = (E, V0, a) => 1 / (1 + (V0 * V0 * Math.sinh(kappa(V0 - E) * a) ** 2) / (4 * E * (V0 - E)));
const KE2 = 1.43996448;                                      // MeV fm: e²/4πε₀ (from α ħc)
const HBARC_MEVFM = HBARC_EVNM;                              // 197.327 eV nm = 197.327 MeV fm
function gammaCoul(z, Z, E, muc2, R) {
  const b = (z * Z * KE2) / E, x = R / b;
  const g = ((Math.sqrt(2 * muc2 * E) / HBARC_MEVFM) * b) * (Math.acos(Math.sqrt(x)) - Math.sqrt(x * (1 - x)));
  const g0 = ((Math.sqrt(2 * muc2 * E) / HBARC_MEVFM) * b) * (Math.PI / 2);
  return { b, x, g, g0 };
}
/** Sommerfeld's 2πη for charges z, Z at relative kinetic energy E (keV) with reduced mass μc² (MeV), non-relativistic. */
const twoPiEta = (z, Z, EkeV, muc2) => 2 * Math.PI * z * Z * ALPHA / Math.sqrt((2 * EkeV * 1e-3) / muc2);
const MAC2 = 3727.3794118;                                   // MeV, the alpha particle (CODATA 2022)

const EX = { z: 2, Z: 86, E: 6, R: 9 };
EX.mu = MAC2 * (218 * 931.494) / (MAC2 + 218 * 931.494);
Object.assign(EX, gammaCoul(EX.z, EX.Z, EX.E, EX.mu, EX.R));
EX.approx = EX.g0 - 2 * (Math.sqrt(2 * EX.mu * EX.E) / HBARC_MEVFM) * Math.sqrt(EX.R * EX.b);

/** A rectangular barrier with an energy line. */
const rectPic = (E, V0, a, caption) => potPic({
  x: [r6(-0.6 * a), r6(1.6 * a)], y: [0, r6(V0 * 1.3)],
  curves: [seg(-0.6 * a, 0, 0, 0, 'ink2', 2.4), seg(0, 0, 0, V0, 'ink2', 2.4), seg(0, V0, a, V0, 'ink2', 2.4), seg(a, V0, a, 0, 'ink2', 2.4), seg(a, 0, 1.6 * a, 0, 'ink2', 2.4)],
  E: { from: -0.6 * a, to: 1.6 * a, y: E }, shade: [{ fn: `${V0}`, lower: `${E}`, from: 0, to: a, color: 'warn', alpha: 0.25 }],
  points: [label(a / 2, V0, `V₀ = ${V0} eV`, 'ink2', 0, -10, 'center')], caption,
});

export default lesson({
  id: 'phys4710.M5.2',
  title: 'Tunnelling and alpha decay',
  minutes: 18, difficulty: 3,
  intro: t`Inside a barrier, where $V > E$, the classical momentum is imaginary and the WKB wave stops oscillating: it grows or decays as $e^{\pm\frac1\hbar\int|p|\,dx}$. Across a thick barrier only the decaying solution survives, and the fraction of the wave that leaks through is set by one integral:

$$\begin{gathered} T \approx e^{-2\gamma} \\ \gamma = \frac1\hbar\int_{x_1}^{x_2}\sqrt{2m\,[V(x) - E]}\;dx \end{gathered}$$

This **tunnelling exponent** explains alpha decay, fusion in the Sun, the scanning tunnelling microscope and field emission — and why each depends so violently on energy and width.`,
  symbols: [
    { tex: 'T', text: 'the transmission probability: the fraction of incident particles that come out on the far side' },
    { tex: '\\gamma', text: 'the tunnelling exponent, a pure number: the WKB phase integral through the barrier' },
    { tex: 'x_1, x_2', text: 'the turning points, where V(x) = E: the barrier’s edges at this energy' },
    { tex: 'V(x)', text: 'the barrier’s potential energy, in J or eV' },
    { tex: 'E', text: 'the particle’s energy, below the top of the barrier' },
    { tex: 'm', text: 'the particle’s mass (the reduced mass for two bodies), in kg' },
    { tex: '\\hbar', text: 'the reduced Planck constant' },
    { tex: '|p| = \\sqrt{2m(V - E)}', text: 'the magnitude of the imaginary classical momentum under the barrier; |p|/ħ = κ is the local decay constant' },
  ],
  why: 'Every alpha-decay lifetime, every fusion rate in a star, every STM image and every flash-memory cell rests on the tunnelling exponent.',
  visual: {
    type: 'graph',
    title: 'WKB against the exact answer',
    lead: t`For a barrier shaped like an upside-down parabola, $V = V_0 - \tfrac12 m\omega^2x^2$, the exact transmission is known: $T = 1/(1 + e^{2\gamma})$ with $\gamma = \pi(V_0 - E)/\hbar\omega$. The WKB estimate is $e^{-2\gamma}$. Both are plotted on a log scale against $E/V_0$.`,
    tasks: [
      t`Deep below the top (E/V₀ = 0.2 with V₀ = 3ħω) the two agree to better than a part in a million: the ratio is $1 + e^{-2\gamma}$.`,
      'Raise E to the top: the exact T is exactly ½ there, but WKB says 1 — and above the top it climbs past 1, which is nonsense.',
      'Make the barrier taller in units of ħω (a heavier particle, or a wider barrier): the curves agree over more of the range.',
    ],
    params: {
      x: [0, 1.4], y: [-14, 0.6], ylog: true, aspect: 'wide', xlabel: 'E / V₀', ylabel: 'transmission T', axesAt: 'edge', xticks: 7,
      sliders: [
        { key: 's', label: t`Barrier height $V_0/\hbar\omega$`, min: 0.5, max: 6, step: 0.1, value: 3, explain: 'How tall the barrier is in units of ħω, its natural quantum of energy: large means thick and classical, small means thin and quantum.' },
        { key: 'e', label: t`Energy $E/V_0$`, min: 0.05, max: 1.3, step: 0.01, value: 0.6, explain: 'The particle’s energy as a fraction of the barrier’s height.' },
      ],
      curves: [
        { fn: 'log10(1/(1 + exp(2*pi*s*(1 - x))))', color: 'accent', width: 2.6, label: 'exact', labelAt: 1.25, labelDy: 14 },
        { fn: '-2*pi*s*(1 - x)/ln(10)', color: 'gold', width: 2, dash: [6, 4], label: 'WKB: e⁻²ᵞ', labelAt: 0.12, labelDx: 4, labelDy: 20 },
      ],
      hlines: [{ y: 0, color: 'ink3' }],
      vlines: [{ x: 'e', color: 'violet' }, { x: 1, color: 'ink4' }],
      readouts: [
        { label: t`$\gamma = \pi(V_0 - E)/\hbar\omega$`, expr: 'pi*s*(1 - e)', digits: 3 },
        { label: 'exact T', expr: '1/(1 + exp(2*pi*s*(1 - e)))', digits: 3, zero: 0 },
        { label: t`WKB $e^{-2\gamma}$`, expr: 'exp(-2*pi*s*(1 - e))', digits: 3, zero: 0 },
        { label: 'WKB ÷ exact', expr: '1 + exp(-2*pi*s*(1 - e))', digits: 4 },
      ],
    },
    caption: 'The exact transmission of a parabolic barrier (Kemble 1935) against the WKB exponential. The vertical grey line is the barrier top. Above it the parabola’s exact formula still holds; WKB’s does not.',
  },
  example: {
    prompt: t`An alpha particle ($z = 2$) of kinetic energy $E = ${EX.E}$ MeV leaves a daughter nucleus of charge $Z = ${EX.Z}$ whose nuclear surface is at $R = ${EX.R}$ fm; outside, the barrier is pure Coulomb, $V = zZe^2/4\pi\epsilon_0 r$. Do the WKB integral exactly, find its thin-nucleus limit, and evaluate $2\gamma$. Use $e^2/4\pi\epsilon_0 = 1.440$ MeV fm, $\hbar c = 197.33$ MeV fm and a reduced mass $\mu c^2 = ${fmt(EX.mu, 5)}$ MeV.`,
    visual: potPic({ x: [0, 50], y: [-12, 32], curves: [seg(0, -10, EX.R, -10, 'ink2', 2.4), seg(EX.R, -10, EX.R, r6(EX.z * EX.Z * KE2 / EX.R), 'ink2', 2.4), { fn: `${r6(EX.z * EX.Z * KE2)}/x`, domain: [EX.R, 50] }], E: { from: 0, to: 50, y: EX.E }, shade: [{ fn: `${r6(EX.z * EX.Z * KE2)}/x`, lower: `${EX.E}`, from: EX.R, to: r6(EX.b), color: 'warn', alpha: 0.3 }], points: [label(EX.R, -10, 'R', 'ink2', 4, 12), label(EX.b, EX.E, 'b', 'gold', 2, 14)], xlabel: 'r (fm)', ylabel: 'energy (MeV)', caption: `The alpha’s potential: a nuclear well inside R (schematic depth), the Coulomb barrier outside, and the forbidden stretch from R to b = ${fmt(EX.b, 3)} fm (shaded) at E = ${EX.E} MeV.` }),
    steps: [
      { label: 'Turning points', text: t`Inside, the nuclear surface $R = ${EX.R}$ fm. Outside, where $V = E$: $b = zZe^2/(4\pi\epsilon_0E) = ${EX.z * EX.Z}\times1.440/${EX.E} = ${fmt(EX.b, 4)}$ fm. The barrier is ${fmt(EX.b - EX.R, 3)} fm thick.` },
      { label: 'Set up', text: t`$\gamma = \dfrac1\hbar\displaystyle\int_R^b\sqrt{2\mu\Bigl(\frac{zZe^2}{4\pi\epsilon_0r} - E\Bigr)}\,dr = \frac{\sqrt{2\mu E}}{\hbar}\int_R^b\sqrt{\frac br - 1}\,dr$, since $zZe^2/4\pi\epsilon_0 = Eb$.` },
      { label: 'Integrate', text: t`With $r = b\sin^2u$: $\displaystyle\int_R^b\sqrt{\tfrac br - 1}\,dr = b\Bigl[\arccos\sqrt{x} - \sqrt{x(1 - x)}\Bigr]$ with $x = R/b = ${fmt(EX.x, 3)}$.` },
      { label: 'Evaluate', text: t`$\sqrt{2\mu c^2E}/\hbar c = ${fmt(Math.sqrt(2 * EX.mu * EX.E) / HBARC_MEVFM, 4)}\ \text{fm}^{-1}$, so $\gamma = ${fmt(Math.sqrt(2 * EX.mu * EX.E) / HBARC_MEVFM, 4)}\times${fmt(EX.b, 4)}\times${fmt(Math.acos(Math.sqrt(EX.x)) - Math.sqrt(EX.x * (1 - EX.x)), 4)} = ${fmt(EX.g, 4)}$ and $2\gamma = ${fmt(2 * EX.g, 4)}$: $T \approx e^{-2\gamma} = ${tex(Math.exp(-2 * EX.g), 3)}$.` },
      { label: 'Thin nucleus', text: t`As $R/b \to 0$ the bracket tends to $\pi/2$ and $\gamma \to \dfrac{\pi}{2}\dfrac{\sqrt{2\mu E}}{\hbar}b = \pi\dfrac{zZe^2}{4\pi\epsilon_0\hbar v} = \pi\eta$, with $\eta = zZ\alpha c/v$ (Sommerfeld’s parameter). That limit gives $2\gamma_0 = ${fmt(2 * EX.g0, 4)}$ here — too big, because the barrier is really cut off at $R$.` },
      { label: 'First correction', text: t`Expanding for small $x$: $\arccos\sqrt x - \sqrt{x(1 - x)} \approx \tfrac\pi2 - 2\sqrt x$, so $2\gamma \approx 2\pi\eta - \dfrac{4}{\hbar}\sqrt{2\mu\,zZ\tfrac{e^2}{4\pi\epsilon_0}R} = ${fmt(2 * EX.approx, 4)}$, within ${Math.round(100 * Math.abs(EX.approx - EX.g) / EX.g)}% of the exact ${fmt(2 * EX.g, 4)} even though $R/b$ is not very small.` },
      { label: 'Sense check', text: t`$e^{-2\gamma}$ is about $10^{${Math.round(-2 * EX.g / Math.LN10)}}$: an alpha rattling inside at $10^{21}$ hits per second escapes in about $10^{${Math.round(2 * EX.g / Math.LN10 - 21)}}$ s. Because $\eta \propto 1/v \propto E^{-1/2}$, a small change in $E$ moves the exponent a lot — the root of the Geiger–Nuttall law. For real nuclei and measured half-lives see [alpha decay in Modern Physics II](#/lesson/phys3710.N2.2).` },
    ],
    answer: t`$\gamma = \dfrac{\sqrt{2\mu E}}{\hbar}\,b\,\bigl[\arccos\sqrt{R/b} - \sqrt{(R/b)(1 - R/b)}\bigr]$, giving $2\gamma = ${fmt(2 * EX.g, 4)}$ here; the thin-nucleus limit is $2\gamma \to 2\pi zZ\alpha c/v$.`,
  },
  practice: [
    num({
      id: 'rect-wkb', difficulty: 2,
      gen(r) {
        const V0 = r.pick([3, 4, 5]), E = r.pick([1, 1.5, 2]), a = r.pick([0.5, 0.8, 1]);
        const k = kappa(V0 - E), ans = Math.exp(-2 * k * a), ex = rectExact(E, V0, a);
        return {
          prompt: t`An electron of energy $E = ${E}$ eV meets a rectangular barrier of height $V_0 = ${V0}$ eV and width $a = ${a}$ nm. Estimate the transmission with WKB, $T \approx e^{-2\gamma}$. ($\hbar c = 197.33$ eV nm, $m_ec^2 = 511.0$ keV.)`,
          visual: rectPic(E, V0, a, 'A rectangular barrier; shaded: the forbidden region at this energy, where |p| = √(2m(V₀ − E)) is constant.'),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: Math.exp(-k * a), feedback: t`$T$ is the square of the amplitude ratio: the exponent is $2\gamma = 2\kappa a$, not $\kappa a$.` }, { value: Math.exp(-2 * kappa(V0) * a), feedback: t`Use $V_0 - E$ under the root, not $V_0$.` }],
          hints: [t`For a flat barrier $\gamma = \kappa a$ with $\kappa = \sqrt{2m(V_0 - E)}/\hbar$.`, t`$\kappa = \sqrt{2\times511\,000\times${V0 - E}}\,/\,197.33\ \text{nm}^{-1}$.`],
          teach: 'For a flat barrier the WKB integral is just κa, and T falls exponentially with the width.',
          explain: t`$\kappa = ${fmt(k, 4)}\ \text{nm}^{-1}$, $2\gamma = ${fmt(2 * k * a, 4)}$, so $T \approx ${tex(ans, 3)}$. The exact answer for a rectangular barrier is $${tex(ex, 3)}$ — the same exponential with a prefactor of ${fmt(ex / ans, 3)}, which WKB misses because the barrier’s edges are sharp, not slowly varying.`,
        };
      },
    }),
    mcq({
      id: 'width', difficulty: 2,
      prompt: t`A thick barrier transmits $T = 10^{-6}$. Its width is doubled, its height unchanged. Roughly what is the new transmission?`,
      visual: rectPic(1.5, 4, 1, 'One rectangular barrier; imagine it twice as wide. Heights schematic.'),
      choices: [t`$10^{-12}$`, t`$5\times10^{-7}$`, t`$2.5\times10^{-7}$`, t`$10^{-3}$`],
      answer: 0,
      why: {
        1: 'Transmission is not inversely proportional to width: halving would mean a linear law.',
        2: t`That treats $T$ as falling with the square of the width; it falls *exponentially*.`,
        3: t`That would be $\sqrt T$: doubling the width doubles the exponent, it does not halve it.`,
      },
      hints: [t`$T \approx e^{-2\kappa a}$. What does doubling $a$ do to the exponent?`],
      teach: 'Doubling a barrier’s width squares its (small) transmission: tunnelling is exponential in width, not linear.',
      explain: t`$e^{-2\kappa(2a)} = \bigl(e^{-2\kappa a}\bigr)^2 = (10^{-6})^2 = 10^{-12}$. Two barriers in a row multiply their transmissions, so one twice as wide does the same.`,
    }),
    num({
      id: 'stm', difficulty: 2,
      gen(r) {
        const phi = r.pick([4, 4.5, 5]), dz = r.pick([0.05, 0.1, 0.2]);
        const k = kappa(phi), ans = Math.exp(2 * k * dz);
        return {
          prompt: t`In a scanning tunnelling microscope, electrons tunnel across a vacuum gap between tip and surface. The barrier is about the work function, $\phi = ${phi}$ eV above the electrons’ energy. By what factor does the tunnelling current fall when the tip is pulled back by $${dz}$ nm?`,
          visual: rectPic(1, 1 + phi, 0.6, `The gap as a rectangular barrier of height φ above the electrons’ energy (schematic; the real barrier is rounded by image forces and the applied voltage).`),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: Math.exp(k * dz), feedback: t`The current goes as $T \approx e^{-2\kappa d}$: the factor is $e^{2\kappa\,\Delta d}$.` }, { value: 1 / ans, feedback: 'That is the ratio the other way up: the current falls, so give old ÷ new.' }],
          hints: [t`Current $\propto e^{-2\kappa d}$ with $\kappa = \sqrt{2m_e\phi}/\hbar$.`, t`The factor is $e^{2\kappa\,\Delta d}$, with $\kappa = \sqrt{2\times511\,000\times${phi}}\,/\,197.33\ \text{nm}^{-1}$.`],
          teach: 'With a work function of a few eV, κ ≈ 11 nm⁻¹, so the tunnelling current changes by about an order of magnitude per ångström: the STM’s vertical resolution.',
          explain: t`$\kappa = ${fmt(k, 4)}\ \text{nm}^{-1}$, so the current drops by $e^{2\times${fmt(k, 4)}\times${dz}} = ${fmt(ans, 3)}$. This steepness is why an STM resolves height changes of a hundredth of an ångström and why the last atom on the tip carries nearly all the current.`,
        };
      },
    }),
    num({
      id: 'parabolic', difficulty: 3,
      gen(r) {
        const hw = r.pick([10, 20, 40]), D = r.pick([15, 25, 40, 60]);     // meV
        const g = (Math.PI * D) / hw, ans = Math.exp(-2 * g), ex = 1 / (1 + Math.exp(2 * g));
        return {
          prompt: t`A particle meets a barrier shaped like an inverted parabola, $V = V_0 - \tfrac12m\omega^2x^2$, with $\hbar\omega = ${hw}$ meV, at an energy $\Delta = V_0 - E = ${D}$ meV below the top. Do the WKB integral and find $T \approx e^{-2\gamma}$.`,
          visual: potPic({ x: [-2, 2], y: [-1.2, 1.4], curves: [{ fn: '1 - x^2/2', domain: [-2, 2] }], E: { from: -2, to: 2, y: 0.4 }, shade: [{ fn: '1 - x^2/2', lower: '0.4', from: -1.0954, to: 1.0954, color: 'warn', alpha: 0.3 }], xlabel: 'x (schematic)', ylabel: 'V (schematic)', yticks: 0, xticks: 0, caption: 'An inverted-parabola barrier with the forbidden stretch at energy E shaded. Schematic scales.' }),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: Math.exp(-g), feedback: t`$T \approx e^{-2\gamma}$, with $\gamma = \pi\Delta/\hbar\omega$.` }, { value: Math.exp(-4 * g), feedback: t`$\gamma$ is already the full integral across the barrier, $\pi\Delta/\hbar\omega$; there is no extra factor of 2 inside it.` }],
          hints: [t`$|p| = \sqrt{2m(\Delta - \tfrac12 m\omega^2x^2)}$, a semi-ellipse in $x$: its integral is half the ellipse’s area.`, t`The semi-axes are $\sqrt{2\Delta/m\omega^2}$ and $\sqrt{2m\Delta}$, so $\int|p|\,dx = \pi\Delta/\omega$ and $\gamma = \pi\Delta/\hbar\omega$.`],
          teach: t`For a parabolic barrier $\gamma = \pi\Delta/\hbar\omega$ — and the exact answer is $1/(1 + e^{2\gamma})$, so WKB is excellent wherever $e^{-2\gamma} \ll 1$.`,
          explain: t`$\gamma = \pi\times${D}/${hw} = ${fmt(g, 4)}$, so $T \approx e^{-2\gamma} = ${tex(ans, 3)}$. The exact result is $1/(1 + e^{2\gamma}) = ${tex(ex, 3)}$: WKB is high by a factor $1 + e^{-2\gamma} = ${fmt(1 + Math.exp(-2 * g), 4)}$.`,
        };
      },
    }),
    num({
      id: 'fowler', difficulty: 3,
      gen(r) {
        const phi = r.pick([4.5, 5]), F = r.pick([3, 4, 5, 6]);            // eV, V/nm
        const g2 = (4 * SQ2M * phi ** 1.5) / (3 * F), ans = Math.exp(-g2);
        return {
          prompt: t`**Field emission.** A strong field $\mathcal E = ${F}$ V/nm at a metal surface (work function $\phi = ${phi}$ eV) tilts the barrier into a triangle, $V - E = \phi - e\mathcal Ex$ for $0 < x < \phi/e\mathcal E$. Find the WKB transmission $e^{-2\gamma}$ for an electron at the Fermi level.`,
          visual: potPic({ x: [-0.3, 1.8], y: [-0.5, phi * 1.3], curves: [seg(-0.3, 0, 0, 0, 'ink2', 2.4), seg(0, 0, 0, phi, 'ink2', 2.4), { fn: `${phi} - ${F}*x`, domain: [0, 1.8] }], E: { from: -0.3, to: 1.8, y: 0 }, Elabel: 'Fermi level', shade: [{ fn: `${phi} - ${F}*x`, lower: '0', from: 0, to: r6(phi / F), color: 'warn', alpha: 0.3 }], xlabel: 'x (nm)', ylabel: 'energy (eV)', caption: 'The triangular barrier outside a metal in a strong field (no image-charge rounding): its thickness at the Fermi level is φ/eℰ.' }),
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: Math.exp(-g2 / 2), feedback: t`That is $e^{-\gamma}$; square it for the transmission.` }, { value: Math.exp(-(2 * SQ2M * phi ** 1.5) / F), feedback: t`$\int_0^{\phi/e\mathcal E}\sqrt{\phi - e\mathcal Ex}\,dx = \tfrac{2}{3}\phi^{3/2}/e\mathcal E$ — keep the $\tfrac23$.` }],
          hints: [t`$\gamma = \dfrac{\sqrt{2m}}{\hbar}\displaystyle\int_0^{\phi/e\mathcal E}\sqrt{\phi - e\mathcal Ex}\,dx$.`, t`The integral is $\tfrac23\phi^{3/2}/e\mathcal E$, so $2\gamma = \dfrac{4\sqrt{2m}\,\phi^{3/2}}{3\hbar e\mathcal E}$, with $\sqrt{2m_ec^2}/\hbar c = ${fmt(SQ2M, 4)}\ \text{nm}^{-1}\text{eV}^{-1/2}$.`],
          teach: t`A triangular barrier gives the Fowler–Nordheim exponent $\propto \phi^{3/2}/\mathcal E$: emission current rises steeply with field.`,
          explain: t`$2\gamma = 4\times${fmt(SQ2M, 4)}\times${fmt(phi ** 1.5, 4)}/(3\times${F}) = ${fmt(g2, 4)}$, so $T \approx ${tex(ans, 3)}$. Field-emission electron guns and flash memory (Fowler–Nordheim tunnelling through a thin oxide) rely on this exponent; the image charge rounds the real barrier and raises $T$ somewhat.`,
        };
      },
    }),
    num({
      id: 'cno', difficulty: 3,
      gen(r) {
        const [Z, A, name] = r.pick([[6, 12, 'carbon-12'], [7, 14, 'nitrogen-14'], [8, 16, 'oxygen-16']]);
        const E = r.pick([20, 25, 30]);                                      // keV
        const mu = (MPC2 * A * 931.494) / (MPC2 + A * 931.494);
        const ans = twoPiEta(1, Z, E, mu);
        return {
          prompt: t`In the CNO cycle of stars heavier than the Sun, protons fuse with ${name} ($Z = ${Z}$). Nuclei are tiny beside the turning point at stellar energies, so the thin-barrier limit applies: $2\gamma \approx 2\pi\eta$ with $\eta = zZ\alpha c/v$. Find $2\gamma$ for a relative kinetic energy of $${E}$ keV. (Reduced mass $\mu c^2 = ${fmt(mu, 5)}$ MeV, $\alpha = 1/137.036$.)`,
          visual: potPic({ x: [0, 60], y: [0, 1.15], curves: [{ fn: '8/x', domain: [7, 60] }, seg(7, 0, 7, 1.143, 'ink2', 2)], E: { from: 0, to: 60, y: 0.2 }, shade: [{ fn: '8/x', lower: '0.2', from: 7, to: 40, color: 'warn', alpha: 0.3 }], xlabel: 'separation r (schematic)', ylabel: 'energy (schematic)', xticks: 0, yticks: 0, caption: 'A proton approaching a nucleus at stellar energies: the barrier is hundreds of times higher than the energy, and the turning point far outside the nucleus. Not to scale.' }),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: t`That is $\pi\eta = \gamma$; the exponent of $T$ is $2\gamma = 2\pi\eta$.` }, { value: twoPiEta(1, Z, E, MPC2), feedback: 'Use the reduced mass of the pair, not the proton mass.' }],
          hints: [t`$v/c = \sqrt{2E/\mu c^2}$, non-relativistic.`, t`$2\gamma = 2\pi\,Z\alpha/(v/c)$ with $z = 1$.`],
          teach: 'For two charges the Gamow exponent is 2πzZαc/v: heavier nuclei, with larger Z, are much harder to fuse at the same energy.',
          explain: t`$v/c = \sqrt{2\times${E}\times10^{-3}/${fmt(mu, 5)}} = ${tex(Math.sqrt((2 * E * 1e-3) / mu), 4)}$, so $2\gamma = 2\pi\times${Z}\times${fmt(ALPHA, 5)}/${tex(Math.sqrt((2 * E * 1e-3) / mu), 4)} = ${fmt(ans, 4)}$ and $e^{-2\gamma} = ${tex(Math.exp(-ans), 3)}$. That is why the CNO cycle needs core temperatures above about 17 million kelvin to beat the proton–proton chain.`,
        };
      },
    }),
    code({
      id: 'wkb-vs-exact', difficulty: 3,
      prompt: t`Test WKB against an exact calculation for a smooth Gaussian barrier $V = V_0e^{-x^2/w^2}$ ($V_0 = 8$, $w = 1.5$, units $\hbar = m = 1$). \`T_exact(E)\` is written for you: it solves the Schrödinger equation through many thin slices. Write \`gamma(E)\`, which returns $\int\sqrt{2(V - E)}\,dx$ over the region where $V > E$ (use a fine grid on $[-6, 6]$, \`np.clip\` to zero the allowed region, and \`np.trapezoid\`), and \`T_wkb(E)\` $= e^{-2\gamma}$. The program prints both for several energies.`,
      starter: t`import numpy as np

V0, w = 8.0, 1.5          # barrier height and width (hbar = m = 1)

def V(x):
    return V0 * np.exp(-x**2 / w**2)

def T_exact(E, L=8.0, N=4000):
    """Exact transmission: propagate (psi, psi') from the right through N flat slices."""
    x = np.linspace(-L, L, N + 1); d = x[1] - x[0]
    xm = 0.5 * (x[1:] + x[:-1])
    k0 = np.sqrt(2 * E)
    psi, dpsi = np.exp(1j * k0 * L), 1j * k0 * np.exp(1j * k0 * L)
    for v in V(xm)[::-1]:
        k = np.sqrt(2 * (E - v) + 0j)
        c, s = np.cos(k * d), np.sin(k * d)
        psi, dpsi = psi * c - dpsi * s / k, psi * k * s + dpsi * c
    A = 0.5 * (psi + dpsi / (1j * k0)) * np.exp(1j * k0 * L)   # incident amplitude
    return 1 / abs(A)**2

def gamma(E):
    pass

def T_wkb(E):
    pass

for E in [1, 2, 4, 6, 7.5]:
    print(E, T_exact(E), T_wkb(E))
`,
      answer: t`import numpy as np

V0, w = 8.0, 1.5          # barrier height and width (hbar = m = 1)

def V(x):
    return V0 * np.exp(-x**2 / w**2)

def T_exact(E, L=8.0, N=4000):
    """Exact transmission: propagate (psi, psi') from the right through N flat slices."""
    x = np.linspace(-L, L, N + 1); d = x[1] - x[0]
    xm = 0.5 * (x[1:] + x[:-1])
    k0 = np.sqrt(2 * E)
    psi, dpsi = np.exp(1j * k0 * L), 1j * k0 * np.exp(1j * k0 * L)
    for v in V(xm)[::-1]:
        k = np.sqrt(2 * (E - v) + 0j)
        c, s = np.cos(k * d), np.sin(k * d)
        psi, dpsi = psi * c - dpsi * s / k, psi * k * s + dpsi * c
    A = 0.5 * (psi + dpsi / (1j * k0)) * np.exp(1j * k0 * L)   # incident amplitude
    return 1 / abs(A)**2

def gamma(E):
    x = np.linspace(-6, 6, 200001)
    kappa = np.sqrt(np.clip(2 * (V(x) - E), 0, None))
    return np.trapezoid(kappa, x)

def T_wkb(E):
    return np.exp(-2 * gamma(E))

for E in [1, 2, 4, 6, 7.5]:
    print(E, T_exact(E), T_wkb(E))
`,
      tests: [
        { name: t`$\gamma(4) = 5.299$`, code: 'abs(gamma(4.0) - 5.299006) < 2e-3' },
        { name: t`$\gamma(1) = 10.937$`, code: 'abs(gamma(1.0) - 10.937281) < 3e-3' },
        { name: t`\`T_wkb(6)\` is $e^{-2\gamma}$`, code: 'abs(T_wkb(6.0) / np.exp(-2 * gamma(6.0)) - 1) < 1e-9' },
        { name: 'WKB is within 25% of exact across nine orders of magnitude (E = 1 to 6)', code: 'all(0.75 < T_wkb(E) / T_exact(E) < 1.25 for E in [1, 2, 4, 6])' },
      ],
      hints: [t`Where $V < E$ the integrand must be zero: \`np.clip(2 * (V(x) - E), 0, None)\` before the square root.`, t`\`x = np.linspace(-6, 6, 200001)\`, then \`np.trapezoid(np.sqrt(...), x)\`.`],
      teach: 'The WKB exponent is one integral, and it gets transmissions right to tens of per cent where they span ten orders of magnitude.',
      explain: t`The ratios come out near 0.8–0.9 for $E$ from 1 to 6 while $T$ itself runs from $4\times10^{-10}$ to $8\times10^{-3}$: the exponent is right and only the prefactor is slightly off. Near the top ($E = 7.5$) $e^{-2\gamma}$ overshoots by 20%; the connection-formula result $1/(1 + e^{2\gamma})$ does better there.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pp', difficulty: 3, transfer: true,
      gen(r) {
        const E = r.pick([4, 5, 6, 8]);                                       // keV
        const ans = Math.exp(-twoPiEta(1, 1, E, MPC2 / 2));
        return {
          prompt: t`At the centre of the Sun ($T \approx 15.7$ million K, $kT \approx 1.35$ keV), most proton–proton fusions happen at relative energies of a few keV, far below the Coulomb barrier of about 0.5 MeV. Using the thin-barrier Gamow factor $e^{-2\pi\eta}$, $\eta = \alpha c/v$, estimate the tunnelling probability at $E = ${E}$ keV. ($\mu c^2 = m_pc^2/2 = ${fmt(MPC2 / 2, 6)}$ MeV.)`,
          visual: potPic({ x: [0, 60], y: [0, 1.15], curves: [{ fn: '8/x', domain: [7, 60] }, seg(7, 0, 7, 1.143, 'ink2', 2)], E: { from: 0, to: 60, y: 0.15 }, shade: [{ fn: '8/x', lower: '0.15', from: 7, to: 53.3, color: 'warn', alpha: 0.3 }], xlabel: 'separation r (schematic)', ylabel: 'energy (schematic)', xticks: 0, yticks: 0, caption: 'Two protons approaching: the Coulomb barrier and the long forbidden stretch at a few keV. Not to scale — the real barrier is a hundred times higher than E.' }),
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: Math.exp(-twoPiEta(1, 1, E, MPC2)), feedback: 'Use the reduced mass, half a proton mass, to get the relative speed.' }, { value: Math.exp(-twoPiEta(1, 1, E, MPC2 / 2) / 2), feedback: t`The probability is $e^{-2\gamma}$ with $\gamma = \pi\eta$: the exponent is $2\pi\eta$.` }],
          hints: [t`$v/c = \sqrt{2E/\mu c^2}$.`, t`$2\pi\eta = 2\pi\alpha/(v/c)$.`],
          teach: 'The Sun shines only because protons tunnel: classically none of them could ever touch.',
          explain: t`$v/c = ${tex(Math.sqrt((2 * E * 1e-3) / (MPC2 / 2)), 4)}$, $2\pi\eta = ${fmt(twoPiEta(1, 1, E, MPC2 / 2), 4)}$, so $e^{-2\pi\eta} = ${tex(ans, 3)}$. Small, but the Sun has about $10^{57}$ protons; the product of this rising factor and the falling Maxwell–Boltzmann tail makes the Gamow peak near 6 keV. (The p + p rate is then throttled much further by the weak interaction, which must turn a proton into a neutron during the brief encounter.)`,
        };
      },
    }),
    mcq({
      id: 'cp-valid', difficulty: 2,
      prompt: t`When is $T \approx e^{-2\gamma}$ a reliable estimate?`,
      visual: { type: 'graph', params: { x: [0, 1.4], y: [-10, 0.6], ylog: true, aspect: 'wide', xlabel: 'E / V₀', ylabel: 'T', axesAt: 'edge', curves: [{ fn: 'log10(1/(1 + exp(2*pi*2.5*(1 - x))))', color: 'accent', width: 2.4 }, { fn: '-2*pi*2.5*(1 - x)/ln(10)', color: 'gold', width: 2, dash: [6, 4] }], vlines: [{ x: 1, color: 'ink4' }] }, caption: 'Exact (blue) and WKB (gold, dashed) transmission for a parabolic barrier with V₀ = 2.5ħω, against energy. The grey line is the top.' },
      choices: [
        t`When $\gamma \gg 1$: a thick or high barrier, energy well below the top`,
        'Whenever the energy is below the top of the barrier, however close',
        'Only for rectangular barriers, where |p| is constant',
        t`When $\gamma \ll 1$, so that the exponential is close to 1`,
      ],
      answer: 0,
      why: {
        1: t`Close to the top the turning points merge, the forbidden region is thinner than a wavelength, and the true $T$ approaches ½ at the top, not 1.`,
        2: 'Sharp edges are exactly what WKB handles worst: the exponent is right but the prefactor is not.',
        3: t`Small $\gamma$ is where it fails — a thin barrier is not a slowly varying potential.`,
      },
      hints: ['Compare the two curves near the barrier top and far below it.'],
      teach: 'The tunnelling formula needs the barrier to be many decay lengths thick; near the top a different (exact or connection-formula) treatment is needed.',
      explain: t`The derivation keeps only the decaying solution under the barrier, which is fair when it decays a lot ($\gamma \gg 1$), and it needs the turning points to be far apart compared with the local wavelength. Then even the prefactor is near 1 for smooth barriers: the parabola’s exact $1/(1 + e^{2\gamma})$ differs from $e^{-2\gamma}$ by $1 + e^{-2\gamma}$.`,
    }),
    num({
      id: 'cp-ratio', difficulty: 3,
      gen(r) {
        const Z = r.pick([82, 84, 86, 88]), E1 = r.pick([5, 5.5, 6]), dE = r.pick([0.5, 1]);
        const mu = MAC2 * 0.98;                                                  // heavy daughter: μ ≈ 0.98 m_α
        const e1 = twoPiEta(2, Z, E1 * 1000, mu), e2 = twoPiEta(2, Z, (E1 + dE) * 1000, mu);
        const ans = Math.exp(e1 - e2);
        return {
          prompt: t`Two alpha emitters with the same daughter charge $Z = ${Z}$ release alphas of $${E1}$ MeV and $${E1 + dE}$ MeV. Using only the thin-barrier exponent $2\pi\eta = 2\pi\cdot2Z\alpha c/v$ (take $\mu c^2 = ${fmt(mu, 4)}$ MeV), by what factor is the more energetic alpha’s tunnelling probability larger?`,
          visual: potPic({ x: [0, 70], y: [0, 32], curves: [{ fn: `${r6(2 * Z * KE2)}/x`, domain: [8, 70] }, seg(8, 0, 8, r6(2 * Z * KE2 / 8), 'ink2', 2)], E: { from: 0, to: 70, y: E1 }, Elabel: `${E1} MeV`, xlabel: 'r (fm)', ylabel: 'energy (MeV)', extra: { hlines: [{ y: E1 + dE, color: 'violet' }] }, caption: `The Coulomb barrier with the two alpha energies (gold dashed: ${E1} MeV; violet: ${E1 + dE} MeV). The nucleus’s edge is drawn at 8 fm.` }),
          answer: ans, tol: { rel: 0.04 },
          errors: [{ value: Math.exp((e1 - e2) / 2), feedback: t`Use the full exponent $2\pi\eta$ of the probability, not $\pi\eta$.` }, { value: (E1 + dE) / E1, feedback: 'The probability is exponential in 1/v, not proportional to the energy.' }],
          hints: [t`The ratio is $e^{2\pi(\eta_1 - \eta_2)}$, and $\eta \propto 1/v \propto E^{-1/2}$.`, t`$v/c = \sqrt{2E/\mu c^2}$ for each.`],
          teach: 'Because the exponent goes as 1/√E, a modest change in alpha energy changes the half-life by orders of magnitude: the Geiger–Nuttall law in miniature.',
          explain: t`$2\pi\eta_1 = ${fmt(e1, 4)}$ and $2\pi\eta_2 = ${fmt(e2, 4)}$, so the ratio is $e^{${fmt(e1 - e2, 4)}} = ${tex(ans, 3)}$. The thin-barrier limit overstates the exponents (the nuclear radius trims them), but the energy dependence survives — compare with real half-lives in [the Geiger–Nuttall plot](#/lesson/phys3710.N2.2).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §9.2', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Gamow, “Zur Quantentheorie des Atomkernes”, Z. Phys. 51, 204 (1928)', url: 'https://doi.org/10.1007/BF01343196' },
    { label: 'Fowler & Nordheim, “Electron emission in intense electric fields”, Proc. R. Soc. A 119, 173 (1928)', url: 'https://doi.org/10.1098/rspa.1928.0091' },
    { label: 'CODATA 2022 recommended values', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
