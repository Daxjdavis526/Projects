// The Friedmann equations — Intuition Mode. H² = H₀²[Ω_r a⁻⁴ + Ω_m a⁻³ +
// Ω_k a⁻² + Ω_Λ]: what the universe contains sets its expansion history, age
// and fate. Planck 2018: Ω_m = 0.315, Ω_Λ = 0.685, flat, 13.8 Gyr, q₀ = −0.53,
// acceleration since z = 0.63. Open (dated, both camps shown): the Hubble
// tension (67.4 ± 0.5 vs 73.04 ± 1.04; CCHP 70.4), and DESI's hint of
// evolving dark energy (2.8–4.2σ in 2025, weaker by mid-2026). Numbers from
// model/gr-cosmology.js (tested in test/gr-cosmology.test.mjs).
import { lesson, mcq, num } from '../../src/core/content.js';
import { sci, round, logDots, M_PROTON, G, C, M_SUN, AU } from './_frontier.js';
import { rhoCrit, q0, zAccel, zEqualLambda, ageFlat, ageIntegral, lookbackTime, hubbleTime } from '../../src/viz/model/gr-cosmology.js';

const t = String.raw;

const H = 67.4, PLANCK = { Om: 0.315, OL: 0.685 };
const RHO = rhoCrit(H), OMB = 0.0224 / (H / 100) ** 2;
const AGE = ageFlat(0.315, H), AGE_R = ageIntegral({ Om: 0.315 - 9.1e-5, OL: 0.685, Or: 9.1e-5 }, H);
const ZACC = zAccel(PLANCK), TACC = lookbackTime(ZACC, PLANCK, H);
const LAMBDA = 1.09e-52;                                 // m⁻², from Planck's Ω_Λ and H₀

// measurements of H₀ (km/s/Mpc, 1σ), as summarised in the research notes (checked Oct 2026)
const H0S = [
  ['Planck 2018 (CMB)', 67.4, 0.5, 0.5, 'gold'],
  ['SPT-3G (CMB)', 66.81, 0.81, 0.81, 'gold'],
  ['ACT DR6 (CMB)', 68.3, 1.1, 1.1, 'gold'],
  ['CCHP red giants', 70.39, 1.94, 1.94, 'violet'],
  ['gravitational-wave sirens', 71.0, 7, 9, 'teal'],
  ['TDCOSMO lensed quasars', 71.6, 3.3, 3.9, 'teal'],
  ['SH0ES Cepheids', 73.04, 1.04, 1.04, 'accent'],
  ['megamasers', 73.9, 3.0, 3.0, 'teal'],
];
const forest = {
  type: 'graph',
  params: {
    x: [58, 88], y: [-1.3, H0S.length - 0.1], axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: `${H0S.length - 0.4}`, lower: '-0.6', from: 66.9, to: 67.9, color: 'gold', alpha: 0.14 }, { fn: `${H0S.length - 0.4}`, lower: '-0.6', from: 72.0, to: 74.08, color: 'accent', alpha: 0.14 }],
    curves: [
      ...[60, 65, 70, 75, 80, 85].map((v) => ({ param: [String(v), 't'], t: [-0.6, H0S.length - 0.4], color: 'ink4', width: 0.8 })),
      ...H0S.map(([, v, lo, hi, color], k) => ({ param: [`${round(v - lo, 5)} + ${round(lo + hi, 5)}t`, String(k)], t: [0, 1], color, width: 2.6 })),
    ],
    points: [
      ...H0S.map(([label, v, , , color], k) => ({ x: v, y: k, color, label })),
      ...[60, 65, 70, 75, 80, 85].map((v) => ({ x: v - 0.6, y: -0.95, r: 0.5, color: 'ink3', label: String(v) })),
      { x: 76.5, y: -0.95, r: 0.5, color: 'ink2', label: 'H₀ in km/s/Mpc' },
    ],
  },
  caption: 'Measurements of today’s expansion rate with 1σ error bars (as summarised in the 2026 literature; values checked October 2026). Gold: inferred from the cosmic microwave background by assuming the standard ΛCDM model. Blue: the Cepheid–supernova distance ladder. Others: independent methods. The disagreement between the gold and blue bands is unexplained — an open question.',
};

// densities of the ingredients against the scale factor, in units of today's critical density
const densities = {
  type: 'graph',
  params: {
    x: [-4.6, 0.8], y: [-1.5, 14], xlabel: 'log₁₀(scale factor a)', ylabel: 'log₁₀(density ÷ today’s critical density)',
    curves: [
      { fn: `${round(Math.log10(9.1e-5), 5)} - 4x`, domain: [-4.5, 0.8], color: 'bad', label: 'radiation', labelAt: -4.2, labelDx: 10 },
      { fn: `${round(Math.log10(0.315), 5)} - 3x`, color: 'accent', label: 'matter', labelAt: -3.2, labelDy: 16 },
      { fn: `${round(Math.log10(0.685), 5)}`, color: 'gold', label: 'dark energy (Λ)', labelAt: -2.5 },
    ],
    vlines: [{ x: 0, label: 'today' }],
  },
  caption: 'How the densities of radiation, matter and a cosmological constant change as the universe grows (Planck 2018 values), in powers of ten. Radiation ruled first, then matter; dark energy rules now.',
};

const fateOf = (Om, OL, caption) => ({ type: 'gr-friedmann', params: { Om, OL, sliders: false, readout: false, a: [0, 2.5] }, caption });

export default lesson({
  id: 'gr.S31.i',
  title: 'What the universe is made of decides its fate',
  minutes: 11, difficulty: 3, mode: 'intuition', badges: ['est-obs', 'open'],
  intro: t`How fast space stretches is set by what fills it. Applied to the expanding universe, Einstein's equations become the **Friedmann equation**:

$$H^2 = \left(\frac{\dot a}{a}\right)^2 = \frac{8\pi G}{3}\,\rho - \frac{kc^2}{a^2} + \frac{\Lambda c^2}{3}$$

Divide every density by the **critical density** $\rho_c = 3H_0^2/(8\pi G)$ — today about five protons' worth per cubic metre — and it becomes the equation above. Each ingredient dilutes differently as space grows: radiation as $a^{-4}$, matter as $a^{-3}$, and a cosmological constant not at all. So radiation ruled the first ~50 000 years, matter the next several billion, and dark energy rules now. The Planck satellite's fit (2018): $\Omega_m = 0.315$, $\Omega_\Lambda = 0.685$, space flat to within a few tenths of a percent, age 13.8 billion years, and an expansion that is **speeding up**. What dark energy is, and why two ways of measuring $H_0$ disagree, are **open questions**.`,
  equation: t`H^2 = H_0^2\left[\Omega_r a^{-4} + \Omega_m a^{-3} + \Omega_k a^{-2} + \Omega_\Lambda\right]`,
  symbols: [
    { tex: 'H', text: 'the expansion rate $\\dot a/a$ at any time; $H_0$ is its value today, 67–73 km/s/Mpc' },
    { tex: 'a', text: 'the scale factor: 1 today, smaller in the past' },
    { tex: '\\Omega_m', text: 'matter — dark and ordinary — as a fraction of the critical density today: 0.315 (ordinary atoms are only 0.049 of it)' },
    { tex: '\\Omega_r', text: 'radiation (light and neutrinos), today only $9\\times10^{-5}$' },
    { tex: '\\Omega_\\Lambda', text: 'dark energy, taken as a cosmological constant: 0.685' },
    { tex: '\\Omega_k', text: 'spatial curvature, $1 - \\Omega_r - \\Omega_m - \\Omega_\\Lambda$: measured to be close to 0 (flat space)' },
    { tex: '\\rho_c', text: 'the critical density $3H_0^2/(8\\pi G)$, in kg/m³: the density that makes space flat' },
    { tex: 'k,\\ \\Lambda', text: 'in the original form: the curvature of space and the cosmological constant; $\\rho$ is the total mass-equivalent density' },
  ],
  why: 'This one equation dates the universe, shapes the pattern in the cosmic microwave background and decides how everything ends; the discovery that the expansion is speeding up won the 2011 Nobel Prize.',
  visual: {
    type: 'gr-friedmann',
    title: 'Contents in, history out',
    lead: t`The gold curve is the size of the universe $a$ against time, for the contents you choose; dashed is the Planck 2018 fit. Every curve passes through **today** with the same slope — the measured $H_0$. The red dot is the Big Bang; the readout gives the age and the fate.`,
    tasks: ['Press “Matter only” ($\\Omega_m = 1$, no dark energy): the age drops to 9.7 billion years — younger than the oldest stars. Dark energy fixes that.', 'Now raise $\\Omega_m$ to 3: the expansion stalls and the universe recollapses in a Big Crunch.', 'Back at Planck 2018, switch H₀ to 73.0: the age falls to 12.7 billion years. Which value is right is an open question.'],
    params: { Om: 0.315, OL: 0.685, H0: 67.4 },
  },
  example: {
    prompt: t`Take Planck 2018's values: $H_0 = 67.4$ km/s/Mpc, $\Omega_m = 0.315$, $\Omega_\Lambda = 0.685$. Find the critical density, the matter in protons per cubic metre, whether the expansion is slowing or speeding up today, when it started to speed up, and the age.`,
    steps: [
      { label: 'Critical density', text: t`$H_0 = 67.4/(3.086\times10^{19})\ \text{s}^{-1} = ${sci(H / 3.086e19)}\ \text{s}^{-1}$, so $\rho_c = 3H_0^2/(8\pi G) = ${sci(RHO)}$ kg/m³ — ${sci(RHO / M_PROTON, 2)} proton masses per cubic metre.` },
      { label: 'Matter', text: t`$\Omega_m\rho_c = ${sci(0.315 * RHO)}$ kg/m³, about ${sci((0.315 * RHO) / M_PROTON, 2)} protons per cubic metre. Ordinary atoms are only $\Omega_b = ${sci(OMB, 2)}$ — one part in ${Math.round(0.315 / OMB)} of the matter; the rest is dark matter.` },
      { label: 'Slowing or speeding?', text: t`The acceleration equation, $\ddot a/a = -\tfrac{4\pi G}{3}(\rho + 3p/c^2) + \tfrac{\Lambda c^2}{3}$, gives the deceleration parameter $q_0 = \Omega_m/2 - \Omega_\Lambda = ${sci(0.315 / 2, 3)} - 0.685 = ${sci(q0(PLANCK), 2)}$. Negative: the expansion is **speeding up**.` },
      { label: 'Since when?', text: t`Acceleration began when matter's pull, $\Omega_m/(2a^3)$, fell below $\Omega_\Lambda$: $a = (\Omega_m/2\Omega_\Lambda)^{1/3} = ${sci(1 / (1 + ZACC), 3)}$, so $z = ${sci(ZACC, 2)}$ — about ${sci(TACC, 2)} billion years ago.` },
      { label: 'Age', text: t`For a flat universe of matter and $\Lambda$ there is a closed form: $t_0 = \dfrac{2}{3H_0\sqrt{\Omega_\Lambda}}\,\sinh^{-1}\!\sqrt{\Omega_\Lambda/\Omega_m} = ${sci(AGE, 4)}$ billion years (${sci(AGE_R, 4)} with radiation; Planck quotes $13.787 \pm 0.020$).` },
      { label: 'Sense check', text: t`Matter alone ($\Omega_m = 1$) would give $2/(3H_0) = ${sci((2 / 3) * hubbleTime(H), 3)}$ billion years — less than the ages of the oldest stars. The universe is older than a decelerating one because its expansion has been speeding up.` },
    ],
    answer: t`$\rho_c = ${sci(RHO)}$ kg/m³; matter ≈ ${sci((0.315 * RHO) / M_PROTON, 2)} protons/m³ (ordinary atoms about ${sci((OMB * RHO) / M_PROTON, 2)}); $q_0 = ${sci(q0(PLANCK), 2)}$, speeding up since $z \approx ${sci(ZACC, 2)}$; age ${sci(AGE_R, 3)} billion years.`,
  },
  practice: [
    num({
      id: 'dilute', difficulty: 1,
      gen(r) {
        const k = r.pick([2, 3, 10]), what = r.pick(['matter', 'radiation', 'dark energy (a cosmological constant)']);
        const x = what === 'matter' ? k ** 3 : what === 'radiation' ? k ** 4 : 1;
        return {
          prompt: t`When the universe was 1/${k} of its present size ($a = 1/${k}$), how many times denser than today was its ${what}?`,
          answer: x, tol: { rel: 0.001 },
          errors: what === 'radiation' ? [{ value: k ** 3, feedback: 'Radiation dilutes faster than matter: besides the volume, each photon’s wavelength stretches, so its energy falls too. Density goes as 1/a⁴.' }]
            : what === 'matter' ? [{ value: k, feedback: 'Density follows volume, which goes as a³.' }]
              : [{ value: k ** 3, feedback: 'A cosmological constant is a property of space itself: its density never changes.' }],
          hints: ['Matter dilutes with volume, ∝ 1/a³. Radiation also loses energy per photon, ∝ 1/a⁴. Λ does not dilute.'],
          teach: 'As space grows, matter dilutes as 1/a³, radiation as 1/a⁴, and a cosmological constant not at all.',
          explain: t`${what === 'matter' ? `$${k}^3 = ${x}$ times denser` : what === 'radiation' ? `$${k}^4 = ${x}$ times denser: ${k}^3 from the smaller volume and ${k} more because every wavelength was ${k} times shorter` : 'Exactly as dense as today: its density is constant'}. That is why radiation dominated the early universe and dark energy dominates the late one.`,
          visual: densities,
        };
      },
    }),
    num({
      id: 'rho-crit', difficulty: 2,
      gen(r) {
        const H0 = r.pick([67.4, 70, 73.0]), x = rhoCrit(H0);
        return {
          prompt: t`What is the critical density $\rho_c = 3H_0^2/(8\pi G)$ for $H_0 = ${H0}$ km/s/Mpc? (1 Mpc $= 3.086\times10^{19}$ km; $G = 6.674\times10^{-11}$ SI)`,
          answer: x, units: 'kg/m^3', tol: { rel: 0.01 },
          errors: [{ value: (3 * H0 ** 2) / (8 * Math.PI * G), feedback: 'Convert H₀ to s⁻¹ first: divide 67.4 km/s by 3.086×10¹⁹ km.' }, { value: x / 3, feedback: 'Keep the 3 in 3H₀²/(8πG).' }],
          hints: [t`$H_0 = ${H0}/(3.086\times10^{19})\ \text{s}^{-1} = ${sci(H0 / 3.086e19)}\ \text{s}^{-1}$.`, t`Square it, multiply by 3, divide by $8\pi\times6.674\times10^{-11}$.`],
          teach: 'The critical density, 3H₀²/(8πG), is about 10⁻²⁶ kg/m³ — a few protons per cubic metre.',
          explain: t`$\rho_c = 3(${sci(H0 / 3.086e19)})^2/(8\pi\times6.674\times10^{-11}) = ${sci(x)}$ kg/m³ — ${sci(x / M_PROTON, 2)} proton masses per cubic metre, far emptier than any laboratory vacuum.`,
          visual: logDots([['air at sea level', 1.2, 'ink2'], ['one hydrogen atom per cm³ (interstellar gas)', M_PROTON * 1e6, 'teal'], ['one proton per m³', M_PROTON, 'accent']], { xlabel: 'density in kg/m³ (powers of ten)', range: [-30, 8], every: 5, caption: 'Densities for scale, in powers of ten (computed from the proton mass).' }),
        };
      },
    }),
    num({
      id: 'q0', difficulty: 2,
      gen(r) {
        const [Om, OL, name] = r.pick([[0.315, 0.685, 'our universe (Planck 2018)'], [1, 0, 'a matter-only, flat universe'], [0.3, 0, 'an open universe with $\\Omega_m = 0.3$ and no dark energy'], [0.25, 0.75, 'a flat universe with $\\Omega_m = 0.25$, $\\Omega_\\Lambda = 0.75$']]);
        const x = q0({ Om, OL });
        return {
          prompt: t`The deceleration parameter today is $q_0 = \Omega_m/2 - \Omega_\Lambda$ (positive: slowing down; negative: speeding up). What is it for ${name}${Om === 0.315 ? ' — $\\Omega_m = 0.315$, $\\Omega_\\Lambda = 0.685$' : ''}?`,
          answer: x, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: Om - OL, feedback: 'Matter enters as $\\Omega_m/2$: in the acceleration equation, ρ + 3p/c² for pressureless matter carries a factor ½ relative to Λ.' }, ...(OL > 0 ? [{ value: OL - Om / 2, feedback: 'Check the sign: matter slows the expansion (positive q), Λ speeds it up (negative q).' }] : [])],
          hints: [t`$q_0 = ${Om}/2 - ${OL}$.`],
          teach: 'Matter decelerates the expansion and dark energy accelerates it: q₀ = $\\Omega_m/2 - \\Omega_\\Lambda$.',
          explain: t`$q_0 = ${sci(Om / 2, 3)} - ${OL} = ${sci(x, 3)}$: ${x < 0 ? 'negative — the expansion is speeding up' : 'positive — the expansion is slowing down'}. In the picture, that is whether the curve bends up or down at today.`,
          visual: fateOf(Om, OL, `The history of ${name}, with today’s point and the straight line of today’s expansion rate. A curve bending away above the line is speeding up; one bending below it is slowing down.`),
        };
      },
    }),
    num({
      id: 'z-acc', difficulty: 3,
      gen(r) {
        const [Om, OL] = r.pick([[0.315, 0.685], [0.3, 0.7], [0.25, 0.75], [0.35, 0.65]]);
        const x = zAccel({ Om, OL });
        return {
          prompt: t`In a flat universe with $\Omega_m = ${Om}$ and $\Omega_\Lambda = ${OL}$, the expansion speeds up when $\Omega_\Lambda > \Omega_m/(2a^3)$. At what redshift did it begin to speed up?`,
          answer: x, tol: { rel: 0.01 },
          errors: [{ value: zEqualLambda({ Om, OL }), feedback: 'That is when the densities of matter and Λ were equal. Acceleration starts earlier, when $\\Omega_\\Lambda = \\Omega_m/(2a^3)$ — the factor ½ comes from ρ + 3p/c².' }, { value: x + 1, feedback: 'That is 1 + z. Subtract 1.' }],
          hints: [t`Solve $\Omega_\Lambda = \Omega_m/(2a^3)$: $a = (\Omega_m/(2\Omega_\Lambda))^{1/3}$.`, t`$a = (${Om}/${2 * OL})^{1/3} = ${sci(1 / (1 + x), 4)}$; then $z = 1/a - 1$.`],
          teach: 'The expansion switched from slowing to speeding up about 6 billion years ago, at z ≈ 0.6.',
          explain: t`$a = ${sci(1 / (1 + x), 4)}$, so $z = ${sci(x, 3)}$. For our universe that was about ${sci(TACC, 2)} billion years ago; type Ia supernovae from both sides of this switch revealed the acceleration in 1998.`,
          visual: fateOf(Om, OL, `The history a(t) of a flat universe with $\\Omega_m = ${Om}$, $\\Omega_\\Lambda = ${OL}$. The curve changes from bending down (slowing) to bending up (speeding) at the moment asked for.`),
        };
      },
    }),
    mcq({
      id: 'lambda-why', difficulty: 2,
      prompt: t`The acceleration equation reads $\dfrac{\ddot a}{a} = -\dfrac{4\pi G}{3}\left(\rho + \dfrac{3p}{c^2}\right)$, counting dark energy as a fluid of density $\rho$ and pressure $p$. Why does dark energy speed the expansion up when matter slows it down?`,
      choices: [
        t`Its pressure is negative, $p = -\rho c^2$. In general relativity pressure gravitates too, so $\rho + 3p/c^2 = -2\rho$: its gravity pushes instead of pulls`,
        'It is a force between galaxies that pushes them apart, like a compressed spring',
        'It has negative mass, which repels ordinary matter',
        'It is made of particles that move faster than light',
      ],
      answer: 0,
      why: {
        1: 'Dark energy is not a force between galaxies. It fills space evenly and acts through the geometry, the same everywhere.',
        2: 'Its energy density is positive. What is unusual is its pressure, which is negative — a tension.',
        3: 'Nothing like that is involved: a cosmological constant behaves like the energy of empty space itself.',
      },
      hints: ['Which term in ρ + 3p/c² can make it negative?', 'For a cosmological constant, p = −ρc².'],
      teach: 'Pressure gravitates in general relativity; the negative pressure of dark energy makes its gravity repulsive.',
      explain: t`With $p = -\rho c^2$, $\rho + 3p/c^2 = -2\rho < 0$, so the acceleration equation gives $\ddot a > 0$. Matter has $p \approx 0$ and pulls. (This is the "strong energy condition" being broken — the subject of the energy-conditions lesson.) What dark energy actually is remains an open question.`,
      visual: {
        type: 'graph',
        params: {
          x: [0.2, 2], y: [-2.2, 1.4], xlabel: 'scale factor a', ylabel: 'contribution to ä/a (units of H₀²)',
          curves: [
            { fn: '-0.315/(2x^3)', domain: [0.42, 2], color: 'accent', label: 'matter: pulls', labelAt: 1.3, labelDy: 14 },
            { fn: '0.685', color: 'gold', label: 'dark energy: pushes', labelAt: 1.2 },
            { fn: '0.685 - 0.315/(2x^3)', domain: [0.42, 2], color: 'good', width: 3, label: 'total', labelAt: 0.9, labelDy: 14 },
          ],
          hlines: [{ y: 0 }],
        },
        caption: 'The two contributions to the acceleration ä/a for Planck 2018’s universe, in units of H₀²: matter’s (falling off as 1/a³) and the cosmological constant’s (constant). Where the total is above zero, the expansion speeds up.',
      },
    }),
    mcq({
      id: 'tension', difficulty: 2,
      prompt: 'The cosmic microwave background, read through the standard ΛCDM model, gives H₀ = 67.4 ± 0.5 km/s/Mpc (Planck); stars and supernovae in nearby galaxies give 73.04 ± 1.04 (SH0ES). What is the honest status of this disagreement?',
      choices: [
        'An open question: the values differ by about five times their combined uncertainty, so either a measurement has an unrecognised error or the standard model of the universe is missing something',
        'It proves that general relativity is wrong',
        'Planck’s smaller error bar means 67.4 is the right value',
        'The two agree within their uncertainties, so there is no real problem',
      ],
      answer: 0,
      why: {
        1: 'One number is measured nearby; the other is inferred through the ΛCDM model. If new physics is needed, it could be in the early universe’s ingredients — nothing singles out general relativity.',
        2: 'A small error bar shows precision, not accuracy — and the CMB value assumes ΛCDM is the right model.',
        3: 'The difference, 5.6 km/s/Mpc, is about five times the combined uncertainty of 1.2.',
      },
      hints: ['Compare the difference with the error bars in the picture.'],
      teach: 'The Hubble tension — early-universe 67–68 against local 73 km/s/Mpc — is real in the data and unexplained: an open question.',
      explain: 'The gold (CMB-based) and blue (distance-ladder) measurements disagree at roughly 5σ, and other methods do not yet settle it: the CCHP’s red-giant ladder gives 70.4 ± 1.9; gravitational-wave “standard sirens” give 71 (+9/−7). What would decide it: independent ladders converging, or early-universe data demanding a change to ΛCDM. Headlines saying it “breaks cosmology” or “proves new physics” go beyond the evidence.',
      visual: forest,
    }),
    num({
      id: 'sigma', difficulty: 3,
      gen(r) {
        const [a, sa, b, sb, names] = r.pick([[73.04, 1.04, 67.4, 0.5, 'SH0ES (73.04 ± 1.04) and Planck (67.4 ± 0.5)'], [73.5, 0.81, 67.19, 0.38, 'a combined local ladder (73.50 ± 0.81) and the combined CMB experiments (67.19 ± 0.38)'], [70.39, 1.94, 67.4, 0.5, 'the CCHP red-giant ladder (70.39 ± 1.94) and Planck (67.4 ± 0.5)']]);
        const x = Math.abs(a - b) / Math.hypot(sa, sb);
        return {
          prompt: t`How many standard deviations apart are ${names}? For independent measurements, divide the difference by the combined uncertainty $\sqrt{\sigma_1^2 + \sigma_2^2}$.`,
          answer: x, tol: { rel: 0.01 },
          errors: [{ value: Math.abs(a - b) / (sa + sb), feedback: 'Combine the uncertainties in quadrature, √(σ₁² + σ₂²), not by adding them.' }, { value: Math.abs(a - b) / Math.max(sa, sb), feedback: 'Use the combined uncertainty of both, √(σ₁² + σ₂²).' }],
          hints: [t`Difference: $${a} - ${b} = ${sci(Math.abs(a - b), 3)}$.`, t`Combined: $\sqrt{${sa}^2 + ${sb}^2} = ${sci(Math.hypot(sa, sb), 3)}$.`],
          teach: 'A disagreement in σ is the difference divided by √(σ₁² + σ₂²) — meaningful only if the errors are independent and Gaussian, which is exactly what is debated.',
          explain: t`$${sci(Math.abs(a - b), 3)}/${sci(Math.hypot(sa, sb), 3)} = ${sci(x, 3)}\sigma$. ${x > 4 ? 'Taken at face value, far too large to be chance' : 'Not significant on its own'} — but σ counts assume no unknown systematic errors, and that assumption is the heart of the dispute.`,
          visual: forest,
        };
      },
    }),
    {
      type: 'slider', id: 'recollapse', difficulty: 2, param: 'Om', answer: [0.995, 1.1],
      prompt: 'With no dark energy ($\\Omega_\\Lambda = 0$), set the matter density $\\Omega_m$ to the smallest value for which the universe will one day stop expanding and fall back in a Big Crunch.',
      instruction: 'Move the Ωₘ slider, watching the fate in the readout, then check.',
      visual: { type: 'gr-friedmann', params: { Om: 0.3, OL: 0, lock: ['OL'] } },
      hints: ['Watch the “fate” line in the readout as you raise $\\Omega_m$ past 1.', 'The dividing line is the critical density itself.'],
      teach: 'Without dark energy, a universe denser than critical ($\\Omega_m > 1$, positively curved) recollapses; at or below critical it expands forever.',
      explain: 'Just above $\\Omega_m = 1$ the universe eventually recollapses (for $\\Omega_m = 1.005$, after about 10⁵ billion years); at exactly 1 it expands forever, ever more slowly. Dark energy changes the rule: our universe, $\\Omega_m = 0.315$ with $\\Omega_\\Lambda = 0.685$, should expand forever, ever faster — if dark energy really is a constant, which is not yet known.',
    },
  ],
  checkpoint: [
    num({
      id: 'cp-protons', difficulty: 2,
      gen(r) {
        const [what, Om] = r.pick([['all matter, dark and ordinary', 0.315], ['ordinary atoms only', round(OMB, 4)], ['dark energy, counted as a mass density', 0.685]]);
        const x = (Om * RHO) / M_PROTON;
        return {
          prompt: t`The critical density for $H_0 = 67.4$ km/s/Mpc is $${sci(RHO)}$ kg/m³. Counting ${what} as $\Omega = ${Om}$ of it, how many proton masses per cubic metre is that? (proton mass $1.673\times10^{-27}$ kg)`,
          answer: x, tol: { rel: 0.01 },
          errors: [{ value: RHO / M_PROTON, feedback: `That is the whole critical density. Multiply by Ω = ${Om}.` }],
          hints: ['Multiply the critical density by Ω, then divide by the proton mass.'],
          teach: 'The universe is astonishingly empty on average: a few protons’ worth of mass per cubic metre.',
          explain: t`$${Om}\times${sci(RHO)}/1.673\times10^{-27} = ${sci(x)}$ per cubic metre.`,
          visual: logDots([['air at sea level', 1.2, 'ink2'], ['one hydrogen atom per cm³ (interstellar gas)', M_PROTON * 1e6, 'teal'], ['one proton per m³', M_PROTON, 'accent']], { xlabel: 'density in kg/m³ (powers of ten)', range: [-30, 8], every: 5, caption: 'Densities for scale, in powers of ten.' }),
        };
      },
    }),
    mcq({
      id: 'cp-desi', difficulty: 2,
      prompt: 'In 2025 the DESI galaxy survey, combined with other data, preferred dark energy that changes with time over a constant Λ, at 2.8σ to 4.2σ depending on which supernova sample was used. Recalibrations and a July 2026 analysis since weakened the preference. What is the right summary?',
      choices: [
        'A hint, below the 5σ standard for a discovery and sensitive to how the data are calibrated: whether dark energy evolves is an open question',
        'Evolving dark energy has been discovered, and Λ is ruled out',
        'The hint has been refuted, and Λ is now proven',
        'The result shows dark energy does not exist',
      ],
      answer: 0,
      why: {
        1: 'None of the combinations reached 5σ, and the significance moved with calibration — the signs of a hint, not a discovery.',
        2: 'Weakening a hint does not prove the alternative; Λ remains consistent with the data, not proven.',
        3: 'Every analysis still needs dark energy to explain the acceleration; the question is only whether it is constant.',
      },
      hints: ['Compare the bars with the 5σ line.'],
      teach: 'Results below 5σ, especially ones that shift with calibration, are hints: report them as open, with both possibilities alive.',
      explain: 'DESI DR2 found 2.8–4.2σ preferences for evolving dark energy (March 2025); a recalibration of one supernova sample lowered its case from 4.2σ to 3.2σ, the full Dark Energy Survey analysis (May 2026) gave 2.2–3.0σ, and DESI’s Lyman-α analysis (July 2026) moved toward Λ. Euclid and further DESI data will test it.',
      visual: {
        type: 'graph',
        params: {
          x: [0.3, 6.7], y: [0, 6], xlabel: ' ', ylabel: 'preference for evolving dark energy (σ)', xticks: 7,
          curves: [[1, 3.1], [2, 2.8], [3, 3.8], [4, 4.2], [5, 3.2]].map(([x, s]) => ({ param: [String(x), `${s}t`], t: [0, 1], color: 'accent', width: 9 })).concat([{ param: ['6', '2.2 + 0.8t'], t: [0, 1], color: 'violet', width: 9 }]),
          points: [[1, 3.1, 'BAO+CMB'], [2, 2.8, 'Pantheon+'], [3, 3.8, 'Union3'], [4, 4.2, 'DES-Y5'], [5, 3.2, 'DES recal.'], [6, 3.0, 'DES full']].map(([x, y, label]) => ({ x: x - 0.25, y: y + 0.12, r: 0.5, color: 'ink2', label })),
          hlines: [{ y: 5, label: '5σ: the bar for a discovery', color: 'bad' }],
        },
        caption: 'Preference for time-varying dark energy: DESI DR2 BAO combined with the CMB alone and with three supernova samples (2025); the DES supernovae after recalibration; the full DES analysis (range, 2026). Values as reported; none reach 5σ.',
      },
    }),
    num({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      gen(r) {
        const [where, rr, name] = r.pick([['Earth’s orbit, 1 AU from the Sun', AU, 'Earth'], ['Neptune’s orbit, 30 AU from the Sun', 30 * AU, 'Neptune'], ['the Moon’s orbit, 3.84×10⁸ m from Earth', 3.84e8, 'the Moon']]);
        const M = name === 'the Moon' ? 5.972e24 : M_SUN;
        const push = ((LAMBDA * C * C) / 3) * rr, pull = (G * M) / (rr * rr), x = push / pull;
        return {
          prompt: t`For a planet or moon, a cosmological constant adds an outward acceleration $(\Lambda c^2/3)\,r$ to the inward pull $GM/r^2$. With $\Lambda = 1.09\times10^{-52}\ \text{m}^{-2}$, what is the ratio of the push to the pull at ${where}? ($GM = ${name === 'the Moon' ? t`3.986\times10^{14}` : t`1.327\times10^{20}`}$ m³/s²)`,
          answer: x, tol: { rel: 0.015 },
          errors: [{ value: x * 3, feedback: 'Keep the 3 in Λc²/3.' }, { value: x / C, feedback: 'Use c², not c.' }],
          hints: [t`Push: $(\Lambda c^2/3)\,r = (1.09\times10^{-52}\times(2.998\times10^{8})^2/3)\times${sci(rr, 3)} = ${sci(push)}$ m/s².`, t`Pull: $GM/r^2 = ${sci(pull)}$ m/s²; divide.`],
          teach: 'Dark energy’s push on bound systems is utterly negligible — which is why they do not expand.',
          explain: t`Push $${sci(push)}$ m/s², pull $${sci(pull)}$ m/s²: the ratio is $${sci(x)}$. Dark energy matters only across hundreds of millions of light-years, where matter is spread thin; within a planetary system it is undetectable.`,
          visual: logDots([[`Sun’s pull at Earth`, (G * M_SUN) / AU ** 2, 'gold'], ['Jupiter’s pull on Earth at closest approach', (G * 1.898e27) / (4.2 * AU) ** 2, 'teal'], ['Earth’s pull on the Moon', (G * 5.972e24) / 3.84e8 ** 2, 'accent']], { xlabel: 'acceleration in m/s² (powers of ten)', range: [-9, 1], every: 2, caption: 'Some gravitational pulls in the Solar System, in powers of ten (computed).' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
    { label: 'Riess et al., observational evidence for an accelerating universe (1998)', url: 'https://arxiv.org/abs/astro-ph/9805201' },
    { label: 'Cai & Wang, review of the Hubble tension (June 2026)', url: 'https://arxiv.org/html/2606.20434v1' },
    { label: 'Freedman et al., CCHP status report on H₀ (2025)', url: 'https://iopscience.iop.org/article/10.3847/1538-4357/adce78' },
    { label: 'DESI DR2 results II: BAO and cosmological constraints (2025)', url: 'https://arxiv.org/abs/2503.14738' },
  ],
});
