// The frontier: quantum gravity, singularities, information and the Hubble
// tension — Derivation Mode. The mathematical form of each open front, every
// claim badged. Singularities: Penrose 1965 (trapped surface + null condition +
// non-compact Cauchy surface ⇒ an incomplete light ray), from dθ/dλ ≤ −θ²/2;
// Painlevé–Gullstrand light speeds dr/dt = c(±1 − √(r_s/r)): trapped spheres for
// r < r_s; the longest proper time from horizon to r = 0 is πGM/c³ (E = 0
// geodesic; E = 1 gives (4/3)GM/c³). Hawking: Euclidean regularity, r = r_s +
// ρ²/4r_s ⇒ angle cτ/(2r_s) of period 2π ⇒ T = ħc/(4πk_B r_s) = ħc³/(8πGMk_B);
// in general T = ħc|f′(r_h)|/(4πk_B), de Sitter T = ħH/(2πk_B); photon-only
// evaporation P = ħc⁶/(15360πG²M²), lifetime 5120πG²M³/(ħc⁴); simplest Page time
// 1 − 2^(−3/2) of the lifetime. Compton = Schwarzschild at m = √(ħc/2G).
// Hubble tension n_σ = |H_a − H_b|/√(σ_a² + σ_b²): 4.9σ (SH0ES 2022 vs Planck
// 2018), 7.05σ (H0DN vs CMB combined 2026), 1.5σ (CCHP 2025 vs Planck).
// Everything checked in SymPy (scratch v37.py); numbers computed below.
import { lesson, mcq, multi, num, expr, code } from '../../src/core/content.js';
import { C, G, HBAR, KB, GM_SUN, M_SUN, YEAR, sci, round } from './_derivlate.js';

const t = String.raw;

// ── numbers ─────────────────────────────────────────────────────────────────

const hawkingT = (M) => (HBAR * C ** 3) / (8 * Math.PI * G * M * KB);        // K
const LIFE = (5120 * Math.PI * G * G) / (HBAR * C ** 4);                       // s per kg³
const T_CMB = 2.7255;                                                          // K
const AGE = 13.787e9;                                                          // yr (Planck 2018)
const M_AGE = Math.cbrt((AGE * YEAR) / LIFE);                                  // kg evaporating in AGE
const CCHP_S = Math.sqrt(1.22 ** 2 + 1.33 ** 2 + 0.7 ** 2);                    // 1.94 km/s/Mpc

// ── pictures ────────────────────────────────────────────────────────────────

// H₀ measurements as whiskers; p picks the early-universe value, q the local one
const P1 = 'step(1.5 - p)', P2 = 'step(p - 1.5)';
const Q1 = 'step(1.5 - q)', Q2 = 'step(q - 1.5)*step(2.5 - q)', Q3 = 'step(q - 2.5)';
const HE = `(67.4*${P1} + 67.19*${P2})`, SE = `(0.5*${P1} + 0.38*${P2})`, RE = `(7*${P1} + 6*${P2})`;
const HL = `(73.04*${Q1} + 73.5*${Q2} + 70.39*${Q3})`, SL = `(1.04*${Q1} + 0.81*${Q2} + ${round(CCHP_S, 4)}*${Q3})`, RL = `(2*${Q1} + 1*${Q2} + 3*${Q3})`;
const ROWS = [
  [7, 67.4, 0.5, 0.5, 'Planck 2018 (CMB): 67.4 ± 0.5', 'accent'],
  [6, 67.19, 0.38, 0.38, 'CMB combined, 2026: 67.19 ± 0.38', 'accent'],
  [5, 71.0, 7, 9, 'gravitational-wave sirens, 2026: 71 +9 −7', 'ink2'],
  [4, 71.6, 3.3, 3.9, 'lensing time delays (TDCOSMO): 71.6 +3.9 −3.3', 'ink2'],
  [3, 70.39, CCHP_S, CCHP_S, 'CCHP 2025 (TRGB): 70.4 ± 1.9', 'bad'],
  [2, 73.04, 1.04, 1.04, 'SH0ES 2022 (Cepheids): 73.04 ± 1.04', 'bad'],
  [1, 73.5, 0.81, 0.81, 'local ladder, H0DN 2026: 73.50 ± 0.81', 'bad'],
];
const h0Pic = ({ p = 1, q = 1, interactive = false, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [61, 82], y: [0.3, 7.9], xlabel: 'H₀ (km/s/Mpc)', ylabel: '', grid: false, axesAt: 'edge', yticks: 0,
    ...(interactive ? {
      choices: [
        { key: 'p', label: 'Early-universe value', options: [[1, 'Planck 2018: 67.4 ± 0.5'], [2, 'CMB combined, 2026: 67.19 ± 0.38']], value: p, explain: 'Inferred from the cosmic microwave background by fitting the standard model of cosmology, ΛCDM.' },
        { key: 'q', label: 'Local measurement', options: [[1, 'SH0ES 2022: 73.04 ± 1.04'], [2, 'H0DN 2026: 73.50 ± 0.81'], [3, 'CCHP 2025: 70.4 ± 1.9']], value: q, explain: 'Measured from the distance ladder: parallaxes, then Cepheid or TRGB stars, then type Ia supernovae.' },
      ],
      readouts: [
        { label: 'difference', expr: `${HL} - ${HE}`, digits: 3, unit: '\\text{ km/s/Mpc}' },
        { label: t`combined $\sigma = \sqrt{\sigma_a^2 + \sigma_b^2}$`, expr: `sqrt(${SL}^2 + ${SE}^2)`, digits: 3, unit: '\\text{ km/s/Mpc}' },
        { label: t`tension $n_\sigma$`, expr: `(${HL} - ${HE})/sqrt(${SL}^2 + ${SE}^2)`, digits: 3 },
      ],
    } : { constants: { p, q } }),
    curves: [
      ...ROWS.map(([y, h, lo, hi, , color]) => ({ param: [`${round(h - lo, 5)} + ${round(lo + hi, 5)}*t`, `${y}`], t: [0, 1], color, width: 2 })),
      { param: [`${HE} - ${SE} + 2*${SE}*t`, RE], t: [0, 1], color: 'gold', width: 6 },
      { param: [`${HL} - ${SL} + 2*${SL}*t`, RL], t: [0, 1], color: 'gold', width: 6 },
    ],
    vlines: [{ x: HE, color: 'gold' }, { x: HL, color: 'gold' }],
    points: ROWS.map(([y, h, , , label, color]) => ({ x: h, y, color, r: 4, label, labelDx: 0, labelDy: -12, labelAlign: 'center' })),
  },
  caption: caption ?? t`Measurements of the expansion rate today, with their quoted 1σ uncertainties (CCHP: statistical, systematic and supernova errors added in quadrature). Blue: inferred from the early universe assuming ΛCDM; red: the local distance ladder; grey: independent methods, not yet precise enough to decide. Gold: the pair being compared. Values as of October 2026.`,
});

// near-horizon Euclidean geometry: a smooth disc only for the right period
const discPic = ({ k = 1, interactive = false, caption } = {}) => ({
  type: 'surface3d',
  params: {
    surface: ['u*k*cos(v)', 'u*k*sin(v)', 'u*sqrt(1 - k^2)'], domain: [[0, 2], [0, 6.2832]], n: 36, axes: false, pitch: 0.5, dist: 7.5, target: [0, 0, 0.5],
    ...(interactive ? {
      choices: [{ key: 'k', label: 'Period of imaginary time', options: [[1, '8πGM/c³: smooth (the Hawking temperature)'], [0.75, '¾ of that: a cone tip'], [0.5, '½ of that: a sharper tip']], value: k, explain: 'Imaginary time τ, rescaled to an angle cτ/(2rₛ), must run once round in 2π for the geometry to be smooth at the horizon.' }],
    } : { constants: { k } }),
    curves: [{ param: ['1.5*k*cos(t)', '1.5*k*sin(t)', '1.5*sqrt(1 - k^2)'], t: [0, 6.2832], color: 'gold', width: 2.6 }],
  },
  caption: caption ?? t`The Euclidean $(\tau, r)$ plane next to a Schwarzschild horizon, which sits at the centre. Drawn as a surface so that lengths are true: radial distance $\rho$ out from the horizon, angle $c\tau/(2r_s)$ around it. With the period $8\pi GM/c^3$ it is a flat disc; any other period leaves a cone tip at the horizon — a singularity the geometry does not have.`,
});

// radial light speeds in Painlevé–Gullstrand coordinates, units of c
const lightPic = {
  type: 'graph',
  params: {
    x: [0.1, 4], y: [-4.2, 1.2], xlabel: 'r / rₛ', ylabel: 'dr/dt of light (units of c)', axesAt: 'edge',
    shade: [{ fn: '1.2', lower: '-4.2', from: 0.1, to: 1, color: 'bad', alpha: 0.12 }],
    curves: [
      { fn: '1 - 1/sqrt(x)', domain: [0.1, 4], color: 'gold', width: 2.6 },
      { fn: '-1 - 1/sqrt(x)', domain: [0.1, 4], color: 'accent', width: 2.4 },
    ],
    hlines: [{ y: 0, color: 'ink3' }],
    vlines: [{ x: 1, color: 'ink3', label: 'horizon' }],
    points: [
      { x: 3.9, y: 0.75, r: 0.01, color: 'gold', label: 'outgoing light', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 3.9, y: -1.95, r: 0.01, color: 'accent', label: 'ingoing light', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 0.15, y: 0.75, r: 0.01, color: 'bad', label: 'trapped: both move in', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`How fast radial light moves in Painlevé–Gullstrand coordinates (step 32), $dr/dt = c\left(\pm1 - \sqrt{r_s/r}\right)$. Inside the horizon (shaded) even "outgoing" light moves inward: every sphere there is a trapped surface.`,
};

// longest fall from horizon to centre: the cycloid r = (rₛ/2)(1 + cos η), τ = (GM/c³)(η + sin η)
const fallPic = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 4.1], y: [0, 1.1], xlabel: 'proper time after crossing the horizon (units of GM/c³)', ylabel: 'r / rₛ', axesAt: 'edge',
    curves: [
      { param: ['t + sin(t)', '(1 + cos(t))/2'], t: [0, 3.14159], color: 'gold', width: 2.6 },
      { param: ['(4/3)*(1 - (1 - t)^(3/2))', '1 - t'], t: [0, 1], color: 'accent', width: 2, dash: true },
    ],
    vlines: [{ x: round(Math.PI, 5), color: 'bad', label: 'π: the longest possible' }],
    points: [
      { x: 1.45, y: 0.26, r: 0.01, color: 'gold', label: 'gold: at rest at the horizon (E = 0)', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: 1.45, y: 0.16, r: 0.01, color: 'accent', label: 'dashed: from rest far away (E = 1)', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption,
});

// mass loss, entropy and the Page curve in the simplest model
const pagePic = {
  type: 'graph',
  params: {
    x: [0, 1], y: [0, 1.5], xlabel: 'time ÷ lifetime', ylabel: 'fraction of the starting value', axesAt: 'edge',
    curves: [
      { fn: '(1 - x)^(1/3)', domain: [0, 1], color: 'accent', width: 2 },
      { fn: '(1 - x)^(2/3)', domain: [0, 1], color: 'gold', width: 2.6 },
      { fn: '1 - (1 - x)^(2/3)', domain: [0, 1], color: 'ink3', width: 2, dash: true },
      { fn: 'min(1 - (1 - x)^(2/3), (1 - x)^(2/3))', domain: [0, 1], color: 'violet', width: 2.8 },
    ],
    vlines: [{ x: round(1 - 2 ** -1.5, 5), color: 'violet', label: 'Page time' }],
    points: [
      { x: 0.02, y: 1.43, r: 0.01, color: 'accent', label: 'blue: mass', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: 0.02, y: 1.34, r: 0.01, color: 'gold', label: 'gold: black-hole entropy', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: 0.02, y: 1.25, r: 0.01, color: 'ink3', label: 'dashed: radiation entropy (Hawking)', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: 0.02, y: 1.16, r: 0.01, color: 'violet', label: 'violet: radiation entropy (information escapes)', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`An evaporating black hole in the simplest model: mass $\propto (1 - t/t_{\text{ev}})^{1/3}$, entropy $\propto M^2$. If Hawking's calculation were the whole story, the radiation's entropy would rise to the full starting value (dashed); if information escapes, it can never exceed what the hole still holds, and must turn over at the Page time (violet, schematic). Which happens in real black holes is open.`,
};

// lifetime against mass (simplest, photons only), logarithmic
const lifePic = {
  type: 'graph',
  params: {
    x: [8, 14], y: [0, 18], xlabel: 'log₁₀(mass / kg)', ylabel: 'log₁₀(lifetime / years)', axesAt: 'edge',
    curves: [{ fn: `3*x + ${round(Math.log10(LIFE / YEAR), 5)}`, color: 'gold', width: 2.6 }],
    hlines: [{ y: round(Math.log10(AGE), 5), color: 'accent', label: 'the age of the universe' }],
    points: [{ x: round(Math.log10(M_AGE), 5), y: round(Math.log10(AGE), 5), color: 'bad', r: 5, label: 'ending now', labelDx: 10, labelDy: 16 }],
  },
  caption: t`The simplest estimate of a black hole's lifetime, $5120\pi G^2M^3/(\hbar c^4)$, on logarithmic axes: a straight line of slope 3. Real black holes also emit neutrinos and gravitons, and heavier particles once hot enough, which shortens the lifetime of the lightest ones.`,
};

// Compton wavelength and Schwarzschild radius against mass, logarithmic
const LC = round(Math.log10(HBAR / C), 5);              // log10(ħ/c), m·kg
const LS = round(Math.log10((2 * G) / C ** 2), 5);      // log10(2G/c²), m/kg
const crossPic = {
  type: 'graph',
  params: {
    x: [-31, 31], y: [-60, 8], xlabel: 'log₁₀(mass / kg)', ylabel: 'log₁₀(length / m)', axesAt: 'edge',
    curves: [
      { fn: `${LC} - x`, color: 'accent', width: 2.4 },
      { fn: `${LS} + x`, color: 'gold', width: 2.4 },
    ],
    points: [
      { x: round((LC - LS) / 2, 5), y: round((LC + LS) / 2, 5), color: 'bad', r: 5, label: 'both matter here', labelDx: 10, labelDy: 18 },
      { x: -30.04, y: round(LC + 30.04, 4), color: 'accent', r: 4, label: 'electron', labelDx: 8, labelDy: 14 },
      { x: 30.3, y: round(LS + 30.3, 4), color: 'gold', r: 4, label: 'Sun', labelDx: -8, labelDy: -10, labelAlign: 'right' },
      { x: -27, y: 4.5, r: 0.01, color: 'accent', label: 'blue: quantum size, ħ/(mc)', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: -27, y: -0.5, r: 0.01, color: 'gold', label: 'gold: gravitational size, 2Gm/c²', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`Two sizes of an object of mass $m$: its Compton wavelength, below which quantum effects rule, and its Schwarzschild radius, the scale of its gravity. For everything ever measured one of them is utterly negligible; they meet only near $10^{-8}$ kg packed into $10^{-35}$ m — where no tested theory applies.`,
};

// ── coding exercise ─────────────────────────────────────────────────────────

const CODE_START = `import sympy as sp

G, M, c, hbar, kB, M0 = sp.symbols('G M c hbar k_B M0', positive=True)
T = hbar*c**3/(8*sp.pi*G*M*kB)                  # Hawking temperature
sigma_SB = sp.pi**2*kB**4/(60*hbar**3*c**2)       # Stefan-Boltzmann constant
r_s = 2*G*M/c**2                                  # horizon radius

def power():
    # return the power a black body of area 4 pi r_s^2 radiates at temperature T
    return 0                                      # replace this line

P = sp.simplify(power())
# dM/dt = -P/c^2, so the time to lose everything is the integral of c^2/P dM from 0 to M0
lifetime = sp.simplify(sp.integrate(c**2/P, (M, 0, M0))) if P != 0 else None
print('P =', P)
print('lifetime =', lifetime)
`;
const CODE_ANSWER = CODE_START.replace('    return 0                                      # replace this line', '    return 4*sp.pi*r_s**2*sigma_SB*T**4');

export default lesson({
  id: 'gr.S37.d',
  title: 'The frontier: quantum gravity, singularities, information and the Hubble tension',
  minutes: 16, difficulty: 3, mode: 'derivation', badges: ['open'],
  intro: t`General relativity has passed every test put to it. Its open problems come in two kinds: places where its own mathematics predicts that it stops working, and measurements that refuse to agree. This last step writes each one down as an equation, and labels it honestly.

**Singularities** (a theorem). Penrose (1965): if a trapped surface forms, matter obeys the null energy condition and space has a non-compact Cauchy surface, then some light ray ends after a finite affine parameter. The engine is focusing, $d\theta/d\lambda \le -\tfrac12\theta^2$ (step 33). What happens there is **open**: that is a question for quantum gravity. **Hawking radiation** (derived, never observed): quantum fields near a horizon radiate at a temperature that contains $\hbar$, $G$ and $c$ together. Whether the radiation carries information out is **open**. **The Hubble tension** (open): the expansion rate measured nearby and the one inferred from the early universe disagree by about 5σ or more, depending on which data are combined.`,
  equation: t`T_H = \frac{\hbar c^3}{8\pi GMk_B}, \qquad \frac{d\theta}{d\lambda} \le -\frac12\theta^2, \qquad n_\sigma = \frac{\left|H_a - H_b\right|}{\sqrt{\sigma_a^2 + \sigma_b^2}}`,
  symbols: [
    { tex: 'T_H', text: 'the Hawking temperature of a non-rotating black hole, in K: derived for quantum fields on the classical black-hole spacetime, and never observed' },
    { tex: '\\hbar,\\ k_B', text: 'the reduced Planck constant (quantum theory) and Boltzmann’s constant (heat)' },
    { tex: 'M,\\ G,\\ c', text: 'the black hole’s mass, Newton’s constant and the speed of light' },
    { tex: '\\theta', text: t`the expansion of a family of light rays: the fractional rate of change of their cross-section; negative when they converge` },
    { tex: '\\lambda', text: 'the affine parameter along the rays — a clock that light carries' },
    { tex: 'H_a,\\ H_b', text: 'two measurements of the expansion rate today, in km/s/Mpc' },
    { tex: '\\sigma_a,\\ \\sigma_b', text: 'their quoted 1σ uncertainties' },
    { tex: 'n_\\sigma', text: 'how many combined standard deviations apart they are — meaningful only if the errors are Gaussian, independent and complete' },
  ],
  why: 'Knowing exactly what each open problem is — an equation that predicts its own breakdown, a derived but unobserved effect, or two measurements that disagree — is what lets you read a headline about the frontier and tell what is known, what is guessed and what is hype.',
  visual: {
    ...h0Pic({ interactive: true }),
    title: 'How big is the Hubble tension?',
    lead: t`Pick an early-universe value and a local measurement; the readout gives the tension, $n_\sigma = |H_a - H_b|/\sqrt{\sigma_a^2 + \sigma_b^2}$. The formula assumes Gaussian, independent errors — which is exactly what the argument is about.`,
    tasks: [
      t`Start with SH0ES 2022 against Planck 2018: $5.64$ km/s/Mpc apart with a combined $\sigma$ of $1.15$ — about $4.9\sigma$.`,
      t`Switch to the 2026 pair, H0DN against the combined CMB value: both errors shrank, and the tension grows to about $7\sigma$.`,
      t`Pick CCHP 2025: a different calibration of the same distance ladder gives $70.4 \pm 1.9$, and the tension drops to about $1.5\sigma$. The dispute is about systematic errors, which no formula for $n_\sigma$ can see.`,
    ],
  },
  example: {
    prompt: t`Derive the Hawking temperature without quantum field theory in the bulk: rotate the Schwarzschild metric to imaginary time, $t = -i\tau$, and demand that the geometry be smooth at the horizon. Then put in numbers for a stellar black hole and for Sagittarius A*.`,
    visual: discPic({ interactive: true }),
    steps: [
      { label: 'Imaginary time', text: t`With $t = -i\tau$ the metric becomes positive-definite: $ds^2 = f\,c^2d\tau^2 + dr^2/f + r^2d\Omega^2$, with $f = 1 - r_s/r$ and $r_s = 2GM/c^2$. In quantum statistical mechanics, a system in equilibrium at temperature $T$ is described by imaginary time running round a circle of circumference $\hbar/(k_BT)$.` },
      { label: 'Near the horizon', text: t`Write $r = r_s + \rho^2/(4r_s)$. Then $f = \rho^2/(4r_s^2) + O(\rho^4)$ and $dr^2/f = d\rho^2\left(1 + O(\rho^2)\right)$, so $$ds^2 \approx d\rho^2 + \rho^2\,d\!\left(\frac{c\tau}{2r_s}\right)^2:$$ the flat plane in polar coordinates, with radius $\rho$ — the proper distance from the horizon — and angle $c\tau/(2r_s)$.` },
      { label: 'Smoothness', text: t`A plane is smooth at its centre only if the angle runs once round in $2\pi$; any other period leaves a cone tip. So $\tau$ must have period $4\pi r_s/c = 8\pi GM/c^3$.` },
      { label: 'The temperature', text: t`Set the period equal to $\hbar/(k_BT)$: $$k_BT_H = \frac{\hbar c}{4\pi r_s} = \frac{\hbar c^3}{8\pi GM}.$$ The same as $\hbar\kappa/(2\pi c)$ with the surface gravity $\kappa = c^4/(4GM)$, and for any metric of the form $-fc^2dt^2 + dr^2/f$ the argument gives $k_BT = \hbar c\,|f'(r_h)|/(4\pi)$.` },
      { label: 'Numbers', text: t`One solar mass: $${sci(hawkingT(M_SUN), 3)}$ K. Sagittarius A*, $4.30$ million solar masses: $${sci(hawkingT(4.3e6 * M_SUN), 3)}$ K. Both are far colder than the $2.7255$ K microwave background, so today they absorb more than they emit. A black hole as warm as the background would weigh $${sci((HBAR * C ** 3) / (8 * Math.PI * G * KB * T_CMB), 2)}$ kg, about 0.6 Moon masses.` },
      { label: 'What it means', text: t`The calculation treats quantum fields on a fixed classical spacetime (semiclassical gravity). It is derived, consistent with black-hole thermodynamics — and unobserved: only analogue horizons, in flowing Bose–Einstein condensates, have shown Hawking-like radiation (Steinhauer, 2016–2019), and how conclusively is debated. Whether the radiation carries information out is the open information paradox.` },
    ],
    answer: t`$T_H = \dfrac{\hbar c^3}{8\pi GMk_B}$: $${sci(hawkingT(M_SUN), 2)}$ K for one solar mass and $${sci(hawkingT(4.3e6 * M_SUN), 2)}$ K for Sagittarius A* — derived, unobserved.`,
  },
  practice: [
    expr({
      id: 'pg-outgoing', difficulty: 2,
      prompt: t`In Painlevé–Gullstrand coordinates (step 32) the Schwarzschild metric is $ds^2 = -c^2dt^2 + \left(dr + c\sqrt{r_s/r}\,dt\right)^2 + r^2d\Omega^2$. For light moving radially, $ds^2 = 0$ and $d\Omega = 0$. Find $dr/dt$ for the "outgoing" ray — the one with the larger $dr/dt$.`,
      visual: lightPic,
      answer: 'c*(1 - sqrt(r_s/r))', answerTeX: t`c\left(1 - \sqrt{r_s/r}\right)`, lhs: 'dr/dt',
      vars: { c: [0.5, 2], r_s: [0.5, 2], r: [0.2, 4] },
      errors: [
        { answer: 'c*(1 + sqrt(r_s/r))', feedback: t`Solve $dr/dt + c\sqrt{r_s/r} = \pm c$: the shift term is subtracted.` },
        { answer: '-c*(1 + sqrt(r_s/r))', feedback: t`That is the ingoing ray. The outgoing one has the $+c$ root.` },
        { answer: 'c*(1 - r_s/r)', feedback: t`That is the coordinate speed in Schwarzschild's own coordinates. Here the shift is $c\sqrt{r_s/r}$, under a square root.` },
      ],
      hints: [t`$ds^2 = 0$ gives $\left(dr/dt + c\sqrt{r_s/r}\right)^2 = c^2$.`],
      teach: t`Inside the horizon both radial light rays move inward: $dr/dt = c\left(\pm1 - \sqrt{r_s/r}\right) < 0$. Every sphere there is a trapped surface — the first assumption of Penrose's theorem, met by every black hole.`,
      explain: t`$dr/dt = c\left(1 - \sqrt{r_s/r}\right)$, positive outside the horizon, zero on it and negative inside. With $\theta \propto dr/d\lambda$ for a sphere of light, both families of light rays leaving a sphere inside the horizon converge: a trapped surface. Penrose's theorem then guarantees a light ray that ends — with no symmetry assumed, so it applies to real, lumpy collapse too.`,
    }),
    multi({
      id: 'penrose-assumptions', difficulty: 3,
      prompt: 'Which of these does Penrose’s 1965 singularity theorem assume? Select every one.',
      visual: lightPic,
      choices: [
        t`A closed trapped surface: a sphere-like surface from which both families of light rays converge, $\theta_\pm < 0$`,
        t`The null energy condition, $R_{\mu\nu}k^\mu k^\nu \ge 0$ for every null vector`,
        t`A non-compact Cauchy surface: a slice of space, infinite in extent, whose data determine everything`,
        t`Spherical symmetry of the collapsing matter`,
        t`That the density becomes infinite somewhere`,
      ],
      answer: [0, 1, 2],
      why: {
        3: t`The theorem's power is that it needs no symmetry: Oppenheimer and Snyder's spherical collapse had already shown a singularity in a special case.`,
        4: t`Infinite density is not assumed — and not even concluded. The conclusion is geodesic incompleteness: some light ray cannot be extended.`,
      },
      hints: [t`Think of what the Raychaudhuri equation needs to force $\theta \to -\infty$: a starting $\theta < 0$, and a sign for $R_{\mu\nu}k^\mu k^\nu$.`, 'The third assumption is about the global shape of space, not about matter.'],
      teach: 'Penrose: trapped surface + null energy condition + non-compact Cauchy surface ⇒ incomplete light rays. The theorem is established; what replaces the singularity is open.',
      explain: t`With $\theta_0 < 0$ and $R_{\mu\nu}k^\mu k^\nu \ge 0$, every light ray from the trapped surface would focus within affine parameter $2/|\theta_0|$; a non-compact Cauchy surface makes that impossible for all of them, so some ray must end. Hawking and Penrose (1970) extended this, under the strong energy condition, to cosmology. Quantum fields can break the null condition locally (step 33), so the theorems mark where the classical theory stops, not what lies beyond.`,
    }),
    expr({
      id: 'max-infall', difficulty: 3,
      prompt: t`Inside a Schwarzschild horizon a radial free fall obeys $\left(\dfrac{dr}{d\tau}\right)^2 = c^2\left(\mathcal E^2 - 1 + \dfrac{r_s}{r}\right)$, where $\mathcal E$ is the conserved energy per unit rest energy. The longest-lived path from the horizon to $r = 0$ has $\mathcal E = 0$ (released at rest at the horizon). Find the proper time it takes, $\tau = \displaystyle\int_0^{r_s}\frac{dr}{c\sqrt{r_s/r - 1}}$, in terms of $r_s$ and $c$.`,
      visual: fallPic(t`Falling from the horizon ($r = r_s$) to the centre, in units of $GM/c^3$: released at rest at the horizon (gold, a cycloid) the fall takes $\pi GM/c^3$; fallen from rest far away (dashed) it takes $\tfrac43GM/c^3$ from the horizon.`),
      answer: 'pi*r_s/(2*c)', answerTeX: t`\frac{\pi r_s}{2c}`, lhs: t`\tau`,
      vars: { r_s: [0.5, 3], c: [0.5, 2] },
      errors: [
        { answer: '2*r_s/(3*c)', feedback: t`That is the fall from rest far away, $\mathcal E = 1$, with $(dr/d\tau)^2 = c^2r_s/r$. Here $\mathcal E = 0$.` },
        { answer: 'pi*r_s/c', feedback: t`Substitute $r = r_s\sin^2\psi$: the integral becomes $\frac{2r_s}{c}\int_0^{\pi/2}\sin^2\psi\,d\psi = \frac{\pi r_s}{2c}$.` },
        { answer: 'r_s/c', feedback: t`That is light's crossing time, not the free-fall proper time.` },
      ],
      hints: [t`Substitute $r = r_s\sin^2\psi$, so $dr = 2r_s\sin\psi\cos\psi\,d\psi$ and $\sqrt{r_s/r - 1} = \cos\psi/\sin\psi$.`, t`$\int_0^{\pi/2}\sin^2\psi\,d\psi = \pi/4$.`],
      teach: t`No one inside a Schwarzschild horizon can last longer than $\pi r_s/(2c) = \pi GM/c^3$ of their own time — firing rockets only shortens it.`,
      explain: t`$\tau = \frac{2r_s}{c}\cdot\frac{\pi}{4} = \frac{\pi r_s}{2c} = \frac{\pi GM}{c^3}$. Accelerating paths are not geodesics and have less proper time (Lewis and Kwan, 2007). For a 10-solar-mass hole that is $${sci((Math.PI * 10 * GM_SUN) / C ** 3, 2)}$ s. This is classical general relativity; what happens at $r = 0$ — where the theorem says the path ends — is open. Real black holes spin, and inside Kerr's inner horizon the picture changes and is itself open.`,
    }),
    expr({
      id: 'de-sitter-temperature', difficulty: 3,
      prompt: t`The worked example's argument works for any metric $ds^2 = -fc^2dt^2 + dr^2/f + r^2d\Omega^2$ with a horizon where $f(r_h) = 0$: smoothness gives $k_BT = \hbar c\,|f'(r_h)|/(4\pi)$. An observer in a universe dominated by a cosmological constant (de Sitter space) has $f = 1 - H^2r^2/c^2$, with a horizon at $r_h = c/H$. Find the temperature of that horizon.`,
      visual: discPic({ caption: t`The same smoothness argument, now at a cosmological horizon: near $r_h$ the Euclidean geometry is a flat disc only for one period of imaginary time, which fixes the temperature.` }),
      answer: 'hbar*H/(2*pi*k_B)', answerTeX: t`\frac{\hbar H}{2\pi k_B}`, lhs: 'T',
      vars: { hbar: [0.5, 2], H: [0.5, 2], k_B: [0.5, 2] },
      errors: [
        { answer: 'hbar*H/(4*pi*k_B)', feedback: t`$|f'(r_h)| = 2H^2r_h/c^2 = 2H/c$: keep the factor 2.` },
        { answer: 'hbar*H/(8*pi*k_B)', feedback: t`Only the black hole has the $8\pi$, from $r_s = 2GM/c^2$. Here $|f'| = 2H/c$.` },
        { answer: 'hbar*H/k_B', feedback: t`Include the $4\pi$ from smoothness: $k_BT = \hbar c|f'|/(4\pi)$.` },
      ],
      hints: [t`$f'(r) = -2H^2r/c^2$, so $|f'(c/H)| = 2H/c$.`, t`$k_BT = \hbar c\cdot\dfrac{2H}{c}\cdot\dfrac{1}{4\pi}$.`],
      teach: t`A cosmological horizon has a temperature too: $T = \hbar H/(2\pi k_B)$ (Gibbons and Hawking, 1977) — derived, and far too cold ever to measure.`,
      explain: t`$k_BT = \hbar H/(2\pi)$. For $H = 67.4$ km/s/Mpc $= ${sci(67.4e3 / 3.0856775814913673e22, 3)}$ s⁻¹, about today's expansion rate, it would be $${sci((HBAR * (67.4e3 / 3.0856775814913673e22)) / (2 * Math.PI * KB), 2)}$ K. Horizons and temperature come together in every case the argument reaches — one of the strongest hints that gravity, heat and quantum theory are tied together at a deeper level nobody yet understands.`,
    }),
    code({
      id: 'sympy-evaporation', difficulty: 3,
      prompt: t`Estimate how fast a black hole evaporates, treating it as a black body that emits only photons. The program defines the Hawking temperature, the Stefan–Boltzmann constant and the horizon radius. Complete \`power()\` so that it returns $P = 4\pi r_s^2\,\sigma_{\text{SB}}T^4$; the program then integrates $dM/dt = -P/c^2$ for the lifetime.`,
      visual: pagePic,
      starter: CODE_START,
      answer: CODE_ANSWER,
      tests: [
        { name: t`$P = \hbar c^6/(15360\pi G^2M^2)$`, code: 'sp.simplify(P - hbar*c**6/(15360*sp.pi*G**2*M**2)) == 0' },
        { name: t`lifetime $= 5120\pi G^2M_0^3/(\hbar c^4)$`, code: 'lifetime is not None and sp.simplify(lifetime - 5120*sp.pi*G**2*M0**3/(hbar*c**4)) == 0' },
        { name: t`one solar mass lasts about $2.1\times10^{67}$ years`, code: "lifetime is not None and abs(float(lifetime.subs({G: 6.6743e-11, c: 299792458, hbar: 1.054571817e-34, M0: 1.989e30}))/3.15576e7/2.095e67 - 1) < 0.01" },
      ],
      hints: ['The area is `4*sp.pi*r_s**2`; multiply by `sigma_SB*T**4`.', 'In code: `return 4*sp.pi*r_s**2*sigma_SB*T**4`.'],
      teach: t`A hotter, smaller hole radiates faster: $P \propto 1/M^2$, so the lifetime grows as $M^3$ — $2\times10^{67}$ years for the Sun's mass.`,
      explain: t`$P = 4\pi r_s^2\sigma T^4 = \hbar c^6/(15360\pi G^2M^2)$, and $\int_0^{M_0}c^2\,dM/P = 5120\pi G^2M_0^3/(\hbar c^4)$. The estimate ignores greybody factors and other particle species; careful calculations (Page, 1976) change the number by a modest factor, not the $M^3$ law. Nothing like it has been observed: astrophysical black holes are far colder than the microwave background.`,
    }),
    num({
      id: 'page-time', difficulty: 2,
      gen(r) {
        const [q, what] = r.pick([[0.5, 'half its starting value — the Page time'], [0.25, 'a quarter of its starting value'], [0.75, 'three quarters of its starting value']]);
        const x = 1 - q ** 1.5;
        return {
          prompt: t`In the simplest model of evaporation, $M^3 = M_0^3\left(1 - t/t_{\text{ev}}\right)$, and the black hole's entropy is proportional to its horizon area, $S \propto M^2$. What fraction of its lifetime $t_{\text{ev}}$ has passed when its entropy has fallen to ${what}?`,
          answer: x, tol: { abs: 0.002 },
          errors: [
            { value: 1 - q, feedback: t`$S \propto M^2$ and $M^3 \propto 1 - t/t_{\text{ev}}$, so $S \propto (1 - t/t_{\text{ev}})^{2/3}$, not linear in time.` },
            { value: 1 - q ** 3, feedback: t`From $S \propto M^2$, $M/M_0 = \sqrt{${q}}$; cube that, not $${q}$.` },
          ],
          hints: [t`$S/S_0 = (M/M_0)^2 = (1 - t/t_{\text{ev}})^{2/3}$.`, t`So $t/t_{\text{ev}} = 1 - (S/S_0)^{3/2}$.`],
          teach: t`In the simplest model the Page time comes at $1 - 2^{-3/2} \approx 0.65$ of the lifetime: from then on, unitarity demands that the radiation start giving information back.`,
          explain: t`$t/t_{\text{ev}} = 1 - ${q}^{3/2} = ${round(x, 4)}$. Page (1993) argued that if information is preserved, the radiation's entropy must turn over once it reaches the hole's remaining entropy — at half the starting value, the Page time. A more careful count of the radiation's entropy moves it somewhat earlier. Island calculations reproduce this turnover in simplified models (2019–20); for real black holes it is open.`,
          visual: pagePic,
        };
      },
    }),
    num({
      id: 'tension-sigma', difficulty: 2,
      gen(r) {
        const [a, sa, na, b, sb, nb] = r.pick([
          [73.04, 1.04, 'SH0ES 2022', 67.4, 0.5, 'Planck 2018'],
          [73.5, 0.81, 'H0DN 2026', 67.19, 0.38, 'the combined CMB value of 2026'],
          [73.04, 1.04, 'SH0ES 2022', 67.19, 0.38, 'the combined CMB value of 2026'],
        ]);
        const n = Math.abs(a - b) / Math.hypot(sa, sb);
        const fmt = (x) => (x === 73.5 ? '73.50' : String(x));
        return {
          prompt: t`${na} measures $H_0 = ${fmt(a)} \pm ${sa}$ km/s/Mpc; ${nb} gives $${b} \pm ${sb}$ km/s/Mpc. If the errors are Gaussian and independent, how many standard deviations apart are they?`,
          answer: n, tol: { rel: 0.01 },
          errors: [
            { value: Math.abs(a - b) / (sa + sb), feedback: t`Independent errors add in quadrature: $\sqrt{\sigma_a^2 + \sigma_b^2}$, not $\sigma_a + \sigma_b$.` },
            { value: Math.abs(a - b) / sa, feedback: t`Both measurements are uncertain: combine $\sigma_a$ and $\sigma_b$.` },
          ],
          hints: [t`$n_\sigma = |H_a - H_b|/\sqrt{\sigma_a^2 + \sigma_b^2}$.`],
          teach: 'The tension in σ is the difference over the combined uncertainty — and it means what it says only if every error is accounted for.',
          explain: t`$|${fmt(a)} - ${b}|/\sqrt{${sa}^2 + ${sb}^2} = ${round(Math.abs(a - b), 4)}/${round(Math.hypot(sa, sb), 3)} = ${round(n, 3)}\sigma$. If the errors were complete and Gaussian, a chance fluctuation this large would be wildly unlikely. That is why the question is open: either some systematic error hides in the distance ladder or in the CMB analysis, or the standard model of cosmology — not general relativity itself — needs changing. The CCHP's calibration, $70.4 \pm 1.9$, sits in between.`,
          visual: h0Pic({ p: b === 67.4 ? 1 : 2, q: a === 73.5 ? 2 : 1, caption: t`The two measurements compared here, in gold, among the others (1σ bars). Values as of October 2026.` }),
        };
      },
    }),
    expr({
      id: 'planck-mass', difficulty: 2,
      prompt: t`Quantum effects matter below an object's Compton wavelength, $\hbar/(mc)$; its gravity matters at its Schwarzschild radius, $2Gm/c^2$. Find the mass at which the two lengths are equal.`,
      visual: crossPic,
      answer: 'sqrt(hbar*c/(2*G))', answerTeX: t`\sqrt{\frac{\hbar c}{2G}}`, lhs: 'm',
      vars: { hbar: [0.5, 2], c: [0.5, 2], G: [0.5, 2] },
      errors: [
        { answer: 'sqrt(hbar*c/G)', feedback: t`That is the Planck mass itself. Setting $\hbar/(mc) = 2Gm/c^2$ leaves a factor $\tfrac12$ under the root.` },
        { answer: 'hbar*c/(2*G)', feedback: t`$m^2 = \hbar c/(2G)$: take the square root.` },
        { answer: 'sqrt(2*G/(hbar*c))', feedback: t`Check the units: $\hbar c/G$ is a mass squared, so the answer is $\sqrt{\hbar c/(2G)}$.` },
      ],
      hints: [t`$\dfrac{\hbar}{mc} = \dfrac{2Gm}{c^2}$ gives $m^2 = \dfrac{\hbar c}{2G}$.`],
      teach: t`Quantum theory and gravity matter together only at $m \approx \sqrt{\hbar c/G}$ in a region $\sqrt{\hbar G/c^3}$ across — the Planck scale, where no theory has been tested.`,
      explain: t`$m = \sqrt{\hbar c/(2G)} = ${sci(Math.sqrt((HBAR * C) / (2 * G)), 3)}$ kg, with both lengths equal to $\sqrt{2\hbar G/c^3} = ${sci(Math.sqrt((2 * HBAR * G) / C ** 3), 3)}$ m — the Planck scale, up to factors of order one. Everything ever measured lies far from the crossing, which is why no experiment yet tests quantum gravity. Candidate theories — strings, loop quantum gravity and others — differ precisely there.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sgr-fall', difficulty: 3, transfer: true,
      gen(r) {
        const [name, m] = r.pick([['Sagittarius A*, the black hole at the centre of our Galaxy (4.30 million solar masses)', 4.3e6], ['M87*, the first black hole imaged (6.5 billion solar masses)', 6.5e9], ['a 30-solar-mass black hole like those LIGO detects', 30]]);
        const tau = (Math.PI * m * GM_SUN) / C ** 3;
        return {
          prompt: t`A probe crosses the horizon of ${name}. Treating the hole as non-rotating, what is the longest proper time, in seconds, its clock can record before reaching $r = 0$? Use $\tau_{\max} = \pi GM/c^3$ and $GM_\odot/c^3 = 4.925\times10^{-6}$ s.`,
          answer: tau, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: tau * (4 / (3 * Math.PI)), feedback: t`That is the fall from rest far away, $\tfrac43GM/c^3$. The longest possible is $\pi GM/c^3$.` },
            { value: tau / Math.PI, feedback: t`Include the factor $\pi$: $\tau_{\max} = \pi GM/c^3$.` },
          ],
          hints: [t`$GM/c^3 = ${m}\times4.925\times10^{-6}$ s.`, t`Multiply by $\pi$.`],
          teach: t`Inside a non-rotating black hole the longest any clock can run is $\pi GM/c^3$: about a minute for Sagittarius A*, a day for M87*, under a millisecond for a stellar-mass hole.`,
          explain: t`$\pi GM/c^3 = ${sci(tau, 3)}$ s. That is a classical-GR result for an idealised, non-rotating hole. What the probe would meet at the end is not known: the singularity theorem says the classical description ends there, and quantum gravity is needed beyond it. Real black holes spin, and their interiors are an open problem too.`,
          visual: fallPic(t`The longest fall from the horizon to the centre, in units of $GM/c^3$: $\pi GM/c^3$ for any non-rotating black hole — gold. Dashed: falling in from rest far away.`),
        };
      },
    }),
    num({
      id: 'cp-pbh', difficulty: 3,
      gen(r) {
        const [age, ageTeX] = r.pick([[AGE, t`13.79`], [1e9, '1'], [1e6, t`10^{-3}`]]);
        const m = Math.cbrt((age * YEAR) / LIFE);
        return {
          prompt: t`Hypothetical primordial black holes, formed in the early universe, would be evaporating now if light enough. Using the simplest lifetime, $t = 5120\pi G^2M^3/(\hbar c^4)$, what starting mass, in kg, gives a lifetime of $${ageTeX}$ billion years? ($G = 6.674\times10^{-11}$ SI, $\hbar = 1.0546\times10^{-34}$ J s, $c = 2.998\times10^8$ m/s, 1 yr $= 3.156\times10^7$ s)`,
          answer: m, units: 'kg', tol: { rel: 0.02 },
          errors: [
            { value: Math.cbrt(age / LIFE), feedback: 'Convert the time to seconds first: 1 yr = 3.156 × 10⁷ s.' },
            { value: Math.sqrt((age * YEAR) / LIFE), feedback: t`The lifetime grows as $M^3$: take the cube root.` },
          ],
          hints: [t`$M = \left(\dfrac{\hbar c^4\,t}{5120\pi G^2}\right)^{1/3}$, with $t$ in seconds.`, t`$\hbar c^4/(5120\pi G^2) = ${sci(1 / LIFE, 3)}$ kg³/s.`],
          teach: t`Only black holes lighter than about $10^{11}$ kg — a small asteroid's mass, in a region smaller than a proton — could have evaporated within the age of the universe.`,
          explain: t`$M = ${sci(m, 3)}$ kg, with a Hawking temperature of $${sci(hawkingT(m), 2)}$ K and a horizon radius of $${sci((2 * G * m) / C ** 2, 2)}$ m. Including every particle species it can emit raises this mass by a factor of a few (Page's estimate is about $5\times10^{11}$ kg for the present age). Whether primordial black holes exist is unknown; searches for the final bursts of their evaporation have found none.`,
          visual: lifePic,
        };
      },
    }),
    multi({
      id: 'cp-status', difficulty: 2,
      prompt: 'Which of these statements are established — a theorem of classical general relativity or an observational result — rather than open questions? Select every one.',
      visual: h0Pic({ p: 1, q: 1, caption: t`The local and early-universe measurements of $H_0$ (1σ bars); gold: SH0ES 2022 and Planck 2018. Values as of October 2026.` }),
      choices: [
        t`If a trapped surface forms and matter obeys the null energy condition, general relativity predicts light rays that end after a finite affine parameter`,
        t`The SH0ES and Planck values of $H_0$ disagree by about $4.9\sigma$, if their quoted errors are complete`,
        t`Hawking radiation has been detected from a black hole`,
        t`Island calculations have shown how information escapes from real black holes`,
        t`The cause of the Hubble tension is new physics`,
      ],
      answer: [0, 1],
      why: {
        2: t`No astrophysical black hole is hot enough: a solar-mass hole is at $6\times10^{-8}$ K. Only analogue horizons in the laboratory have been studied.`,
        3: t`They reproduce the Page curve in simplified models (two-dimensional gravity, or anti-de Sitter space coupled to a bath). Real four-dimensional black holes, and the microscopic mechanism, remain open.`,
        4: t`Unresolved systematic errors are not excluded; the CCHP's calibration finds a smaller tension. The cause is open.`,
      },
      hints: ['Separate what is proved or measured from what is interpreted.'],
      teach: 'At the frontier, label every claim: Penrose’s theorem and the measured discrepancy are established; Hawking radiation is derived but unobserved; information escape and the cause of the tension are open.',
      explain: t`Penrose's theorem is a theorem; the $4.9\sigma$ is arithmetic on published numbers — the interpretation is what is open. Hawking radiation is derived for quantum fields on curved spacetime and unobserved; island calculations are evidence from toy models; the Hubble tension's cause is unknown. That is the state of the field in October 2026.`,
    }),
  ],
  sources: [
    { label: 'Penrose, “Gravitational collapse and space-time singularities”, Phys. Rev. Lett. 14, 57 (1965)', url: 'https://doi.org/10.1103/PhysRevLett.14.57' },
    { label: 'Hawking, “Particle creation by black holes”, Commun. Math. Phys. 43, 199 (1975)', url: 'https://doi.org/10.1007/BF02345020' },
    { label: 'Gibbons & Hawking, “Action integrals and partition functions in quantum gravity”, Phys. Rev. D 15, 2752 (1977)', url: 'https://doi.org/10.1103/PhysRevD.15.2752' },
    { label: 'Page, “Information in black hole radiation”, Phys. Rev. Lett. 71, 3743 (1993)', url: 'https://arxiv.org/abs/hep-th/9306083' },
    { label: 'Almheiri, Hartman, Maldacena, Shaghoulian & Tajdini, “Replica wormholes and the entropy of Hawking radiation” (2019)', url: 'https://arxiv.org/abs/1911.12333' },
    { label: 'Riess et al. (SH0ES), “A comprehensive measurement of the local value of the Hubble constant…”, ApJL 934, L7 (2022)', url: 'https://arxiv.org/abs/2112.04510' },
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
    { label: 'Freedman et al. (CCHP), status report on the Hubble constant, ApJ (2025)', url: 'https://iopscience.iop.org/article/10.3847/1538-4357/adce78' },
    { label: 'Cai & Wang, review of the Hubble tension (June 2026)', url: 'https://arxiv.org/html/2606.20434v1' },
  ],
});
