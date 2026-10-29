// Energy conditions — Intuition Mode. For a perfect fluid: NEC ρc² + p ≥ 0;
// WEC also ρ ≥ 0; SEC also ρc² + 3p ≥ 0; DEC ρc² ≥ |p|. They are assumptions,
// not laws: Λ (p = −ρc²) breaks the SEC — hence cosmic acceleration — while
// quantum fields break all pointwise conditions locally (Casimir effect,
// measured). Quantum inequalities bound how negative, for how long. The NEC is
// what wormholes and warp drives must break (S35, S36). Casimir: T = (π²ħc /
// 720d⁴) diag(−1, 1, 1, −3), so ρc² = −π²ħc/(720d⁴), pressure across the
// plates −π²ħc/(240d⁴).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { G, C, HBAR, sci, round, logDots } from './_frontier.js';

const t = String.raw;

const casimirRho = (d) => -(Math.PI ** 2 * HBAR * C) / (720 * d ** 4);     // J/m³ (negative)
const casimirP = (d) => (Math.PI ** 2 * HBAR * C) / (240 * d ** 4);          // attractive pressure, Pa
const throat = (r0) => C ** 4 / (8 * Math.PI * G * r0 * r0);                 // |ρc²| = |p_r| at an Ellis throat, J/m³
const SUNLIGHT = 1361 / C;                                                    // J/m³ of sunlight at Earth

// the (ρc², p) plane for a perfect fluid, in arbitrary units
const FLUIDS = [
  ['dust', 1, 0, 'accent'],
  ['radiation', 1.2, 0.4, 'teal'],
  ['dark energy Λ', 0.8, -0.8, 'gold'],
  ['phantom, w = −1.2', 1.2, -1.44, 'bad'],
  ['Casimir', -0.3, -0.9, 'violet'],
  ['wormhole throat', -0.7, -0.7, 'violet'],
];
const plane = ({ drag = false, only = null, mark = null, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [-1.7, 1.9], y: [-1.75, 1.75], equal: true, xlabel: 'energy density ρc²', ylabel: 'pressure p',
    shade: [
      { fn: '1.75', lower: 'max(-x, -1.75)', from: -1.75, to: 3, color: 'good', alpha: 0.1 },
      { fn: 'min(x, 1.75)', lower: 'max(-x, -1.75)', from: 0, to: 3, color: 'good', alpha: 0.14 },
    ],
    curves: [
      { fn: '-x', domain: [-1.7, 1.75], color: 'bad', width: 2.2, label: 'NEC: ρc² + p = 0', labelAt: -1.45, labelDy: -14 },
      { fn: '-x/3', domain: [-1.7, 1.9], color: 'violet', dash: true, width: 1.6, label: 'SEC: ρc² + 3p = 0', labelAt: -1.6, labelDy: -12 },
      { fn: 'x', domain: [0, 1.75], color: 'accent', dash: true, width: 1.4, label: 'DEC: ρc² = |p|', labelAt: 1.05, labelDx: -96 },
    ],
    vlines: [{ x: 0 }],
    points: (only ? FLUIDS.filter(([n]) => only.includes(n)) : FLUIDS).map(([label, x, y, color]) => ({ x, y, color, label })).concat(mark ? [{ x: mark[0], y: mark[1], color: 'gold', r: 6, label: mark[2] }] : []),
    ...(drag ? {
      drag: [{ key: 'p', x: 1.4, y: -0.3, snap: 0.05 }],
      readouts: [
        { label: 'null: $\\rho c^2 + p$', expr: 'px + py', digits: 3 },
        { label: 'weak: also $\\rho c^2$', expr: 'px', digits: 3 },
        { label: 'strong: $\\rho c^2 + 3p$', expr: 'px + 3py', digits: 3 },
        { label: 'dominant: $\\rho c^2 - |p|$', expr: 'px - abs(py)', digits: 3 },
      ],
    } : {}),
  },
  caption: caption ?? 'The plane of energy density and pressure for a perfect fluid, in arbitrary units. Light green: the null condition holds; darker green: all four hold. Casimir vacuum and a wormhole throat are not perfect fluids: they are placed by their pressure in one direction — across the plates, and along the throat.',
});

export default lesson({
  id: 'gr.S33.i',
  title: 'Rules that ordinary matter obeys — and quantum fields bend',
  minutes: 10, difficulty: 3, mode: 'intuition', badges: ['est-der'],
  intro: t`Einstein's equations will produce any spacetime you like if you may choose the matter freely: write down a geometry, compute its curvature, and call the result "the matter". **Energy conditions** are the rules that separate reasonable matter from the rest. For a fluid of energy density $\rho c^2$ and pressure $p$ they read:

- **null (NEC):** $\rho c^2 + p \ge 0$;
- **weak (WEC):** the null condition and $\rho \ge 0$ — no observer measures negative energy;
- **strong (SEC):** the null condition and $\rho c^2 + 3p \ge 0$ — gravity attracts;
- **dominant (DEC):** $\rho c^2 \ge |p|$ — energy never flows faster than light.

They are **assumptions**, not laws of nature. Dark energy breaks the strong condition — which is why the expansion accelerates — and quantum fields can break every one of them locally, as the measured Casimir effect shows. The null condition matters most here: every traversable wormhole and every faster-than-light warp drive must break it.`,
  equation: t`\rho c^2 + p \ge 0`,
  symbols: [
    { tex: '\\rho', text: 'the energy density divided by $c^2$, in kg/m³; $\\rho c^2$ is energy per volume, in J/m³' },
    { tex: 'p', text: 'the pressure, in Pa (J/m³). Negative pressure is tension, like a stretched rubber sheet' },
    { tex: 'c', text: 'the speed of light' },
    { tex: 'w = p/\\rho c^2', text: 'the equation of state: 0 for dust, 1/3 for radiation, −1 for a cosmological constant' },
    { tex: '\\text{NEC, WEC, SEC, DEC}', text: 'the null, weak, strong and dominant energy conditions. In general they are statements about what every observer measures; for a fluid they reduce to the inequalities above' },
  ],
  why: 'The theorems that singularities form, that horizon area never decreases, and that wormholes cannot be crossed all assume an energy condition — so every claim of a wormhole or a warp drive stands or falls on which condition it breaks, and by how much.',
  visual: {
    ...plane({ drag: true }),
    title: 'Which matter is reasonable?',
    lead: t`Each point is a kind of matter: its energy density across, its pressure up. **Drag the ring** to any point; the readout gives the four combinations, and a condition holds when its number is zero or positive.`,
    tasks: ['Drag the ring onto dust: all four numbers are positive — every condition holds.', 'Drag it onto dark energy Λ: ρc² + p = 0, so the null condition just holds, but ρc² + 3p < 0 — the strong condition fails. That is why Λ speeds up the expansion.', 'Drag it below the red line: the null condition fails, and with it every other condition. Wormhole throats and warp-drive walls live there.'],
  },
  example: {
    prompt: t`Two uncharged metal plates face each other $d = 1\ \mu\text{m}$ apart in vacuum. Quantum theory gives the field between them energy density $\rho c^2 = -\dfrac{\pi^2\hbar c}{720\,d^4}$ and a pressure across the plates three times as negative. Find both, check the null condition, and compare with what a wormhole throat of radius $r_0 = 1$ m would need, $|\rho c^2| = c^4/(8\pi G r_0^2)$.`,
    steps: [
      { label: 'Energy density', text: t`$\pi^2\hbar c/(720 d^4) = 9.870\times1.0546\times10^{-34}\times2.998\times10^{8}/(720\times10^{-24}) = ${sci(-casimirRho(1e-6))}$ J/m³, so $\rho c^2 = ${sci(casimirRho(1e-6))}$ J/m³ — **negative**: less energy than empty space outside.` },
      { label: 'Pressure', text: t`Across the plates $p = 3\rho c^2 = ${sci(-casimirP(1e-6))}$ Pa: a tension, which pulls the plates together with ${sci(casimirP(1e-6) * 1e3, 2)} mPa. That attraction — the Casimir effect — has been measured since 1997.` },
      { label: 'Null condition', text: t`For light crossing between the plates, $\rho c^2 + p = 4\rho c^2 < 0$: the null condition **fails**. Quantum fields really do break energy conditions.` },
      { label: 'But how much?', text: t`A wormhole throat of radius 1 m needs $c^4/(8\pi G r_0^2) = ${sci(throat(1), 2)}$ J/m³ of negative energy density — $${sci(throat(1) / -casimirRho(1e-6), 1)}$ times more. Even plates 10 nm apart, at $${sci(-casimirRho(1e-8), 2)}$ J/m³, fall short by a factor of $${sci(throat(1) / -casimirRho(1e-8), 1)}$.` },
      { label: 'And for how long', text: t`Quantum inequalities add a second limit: the more negative the energy density a field produces, the shorter the time, and the thinner the region, it can last.` },
    ],
    answer: t`$\rho c^2 = ${sci(casimirRho(1e-6))}$ J/m³, pressure across the plates $${sci(-casimirP(1e-6))}$ Pa; the null condition fails — but by about 46 orders of magnitude less than a throat of radius 1 m needs.`,
  },
  practice: [
    mcq({
      id: 'status', difficulty: 1,
      prompt: 'What is the status of the energy conditions in general relativity?',
      choices: [
        'They are assumptions about what reasonable matter does, used as inputs to theorems — and known physics breaks some of them',
        'They are laws that follow from Einstein’s equations',
        'They are another way of stating that energy is conserved',
        'They have been confirmed by experiment for every kind of matter',
      ],
      answer: 0,
      why: {
        1: 'Einstein’s equations accept any stress–energy at all; nothing in them forbids negative energy. The conditions are extra assumptions.',
        2: 'Energy–momentum conservation holds whether or not an energy condition does: it is a separate statement.',
        3: 'Dark energy breaks the strong condition, and the Casimir effect breaks the null condition between the plates — both are observed.',
      },
      hints: ['Does anything in Einstein’s equations forbid a negative energy density?'],
      teach: 'Energy conditions are assumptions, not laws: the field equations themselves allow any matter.',
      explain: 'Singularity theorems, the area theorem and the no-traversable-wormhole theorems all start from an energy condition. The weaker, averaged versions (such as the averaged null condition along complete light rays) are believed to hold for all real matter; the pointwise versions are known to fail.',
      visual: plane(),
    }),
    multi({
      id: 'which-hold', difficulty: 2,
      gen(r) {
        const [name, w] = r.pick([['dust (cold matter, w = 0)', 0], ['radiation (w = 1/3)', 1 / 3], ['a cosmological constant (w = −1)', -1], ['a fluid with w = −1/2', -0.5]]);
        const holds = [1 + w >= -1e-12, 1 + w >= -1e-12, 1 + 3 * w >= -1e-12 && 1 + w >= -1e-12, Math.abs(w) <= 1 + 1e-12];
        const answer = holds.flatMap((h, k) => (h ? [k] : []));
        const why = {};
        if (!holds[2]) why[2] = t`$\rho c^2 + 3p = (1 + 3w)\rho c^2 = ${sci(1 + 3 * w, 2)}\,\rho c^2 < 0$: the strong condition fails — and that is exactly what lets this fluid speed up the expansion.`;
        return {
          prompt: t`Which energy conditions does ${name}, with positive energy density, satisfy? Select every one. (Its pressure is $p = w\rho c^2$.)`,
          choices: ['null: ρc² + p ≥ 0', 'weak: also ρ ≥ 0', 'strong: also ρc² + 3p ≥ 0', 'dominant: ρc² ≥ |p|'],
          answer, why,
          hints: [t`Write each condition in terms of $w$: null $1 + w \ge 0$; strong $1 + 3w \ge 0$; dominant $|w| \le 1$.`],
          teach: 'For a fluid with p = wρc²: null needs w ≥ −1, strong needs w ≥ −1/3, dominant needs |w| ≤ 1.',
          explain: t`With $w = ${sci(w, 2)}$: $1 + w = ${sci(1 + w, 2)}$, $1 + 3w = ${sci(1 + 3 * w, 2)}$, $|w| = ${sci(Math.abs(w), 2)}$. ${holds[2] ? 'All four hold: ordinary matter and light are “reasonable”.' : 'Null, weak and dominant hold; the strong condition fails — the signature of anything that makes the universe accelerate.'}`,
          visual: plane({ only: [w === 0 ? 'dust' : w === 1 / 3 ? 'radiation' : w === -1 ? 'dark energy Λ' : ''], mark: w === -0.5 ? [1, -0.5, 'w = −1/2'] : null }),
        };
      },
    }),
    num({
      id: 'casimir', difficulty: 2,
      gen(r) {
        const [d, dtxt] = r.pick([[1e-6, t`1\ \mu\text{m}`], [1e-7, t`100\ \text{nm}`], [1e-8, t`10\ \text{nm}`]]);
        const x = casimirRho(d);
        return {
          prompt: t`What is the energy density $\rho c^2 = -\pi^2\hbar c/(720\,d^4)$ between two Casimir plates $d = ${dtxt}$ apart? ($\hbar = 1.0546\times10^{-34}$ J s, $c = 2.998\times10^{8}$ m/s)`,
          answer: x, units: 'J/m^3', tol: { rel: 0.01 },
          errors: [{ value: x * d, feedback: 'The gap enters as d⁴, not d³.' }, { value: x / Math.PI ** 2, feedback: 'Keep the π² in the numerator.' }],
          hints: [t`$d^4 = (${sci(d)}\ \text{m})^4 = ${sci(d ** 4)}\ \text{m}^4$.`, t`$\pi^2\hbar c = ${sci(Math.PI ** 2 * HBAR * C)}$ J m; divide by $720\,d^4$ and keep the minus sign.`],
          teach: 'The Casimir energy density grows as 1/d⁴: tiny at micrometres, larger — but still small — at nanometres.',
          explain: t`$\rho c^2 = ${sci(x)}$ J/m³. ${d > 5e-7 ? 'Smaller than the energy density of sunlight at Earth.' : 'Halving the gap multiplies it by 16, but the plates cannot be brought much closer than a few nanometres before they stop behaving like ideal mirrors.'}`,
          visual: logDots([['sunlight at Earth', SUNLIGHT, 'gold'], ['air at sea-level pressure (as J/m³)', 1.013e5, 'ink2'], ['a 1 m wormhole throat needs', throat(1), 'bad']], { xlabel: 'energy density in J/m³ (powers of ten)', range: [-8, 70], every: 10, caption: 'Energy densities for scale, in powers of ten (sunlight: 1361 W/m² ÷ c).' }),
        };
      },
    }),
    mcq({
      id: 'phantom', difficulty: 2,
      prompt: t`Some models of dark energy are "phantom", with $w = p/(\rho c^2) = -1.2$ and positive $\rho$. Which energy conditions would it break?`,
      choices: [
        'All four: it breaks the null condition, ρc² + p = −0.2ρc² < 0, and every other condition includes that one',
        'Only the strong one, like a cosmological constant',
        'None: it is just dark energy',
        'Only the dominant one, because |p| > ρc²',
      ],
      answer: 0,
      why: {
        1: 'A cosmological constant sits exactly on the null line (w = −1). Phantom energy lies below it.',
        2: 'Being called dark energy does not exempt it: below w = −1 the null condition fails.',
        3: 'The dominant condition does fail — but so does the null condition, and with it the weak and strong ones.',
      },
      hints: ['Compute ρc² + p = (1 + w)ρc².', 'The weak, strong and dominant conditions each contain the null condition.'],
      teach: 'Breaking the null condition breaks all four: it is the weakest, and the others include it.',
      explain: 'With w = −1.2, ρc² + p = −0.2ρc² < 0. No observation requires phantom energy; current data are consistent with w = −1, and the hints of evolving dark energy are below discovery level.',
      visual: plane({ only: ['dark energy Λ', 'phantom, w = −1.2'] }),
    }),
    mcq({
      id: 'dark-energy-wormhole', difficulty: 2,
      prompt: 'Dark energy has negative pressure. Could it hold a wormhole throat open?',
      choices: [
        'No: a throat needs ρc² + p < 0, but a cosmological constant has ρc² + p = 0 exactly — it satisfies the null condition',
        'Yes: dark energy is the exotic matter wormholes need',
        'Yes, if enough of it were concentrated in one place',
        'No, because dark energy is only a hypothesis and does not exist',
      ],
      answer: 0,
      why: {
        1: 'Exotic matter, in the wormhole sense, breaks the null condition. Λ’s energy density is positive and its pressure exactly −ρc²: it sits on the boundary, not beyond it.',
        2: 'A cosmological constant has the same density everywhere; it cannot be concentrated, and its w would stay −1 anyway.',
        3: 'The accelerating expansion is observed; what dark energy is remains open. Either way, a constant Λ cannot hold a throat open.',
      },
      hints: ['Where does Λ sit relative to the red line in the picture?'],
      teach: 'Dark energy (Λ) breaks the strong condition but satisfies the null condition — so it is not the exotic matter wormholes need.',
      explain: 'Wormholes and warp drives need the null condition broken; Λ only breaks the strong one. That is why “dark energy powers warp drives” headlines are wrong even before any engineering.',
      visual: plane({ only: ['dark energy Λ', 'wormhole throat'] }),
    }),
    num({
      id: 'strong', difficulty: 3,
      gen(r) {
        const w = r.pick([0, 1 / 3, -0.5, -0.8, -1]);
        const x = 1 + 3 * w;
        const wt = w === 1 / 3 ? '1/3' : String(w);
        return {
          prompt: t`The acceleration equation says the expansion slows if $\rho c^2 + 3p > 0$ and speeds up if it is negative. For a fluid with $p = w\rho c^2$ and $w = ${wt}$, what is $\rho c^2 + 3p$, in units of $\rho c^2$?`,
          answer: x, tol: { rel: 0.001, abs: 0.001 },
          errors: [...(w !== 0 ? [{ value: 1 + w, feedback: 'That is the null combination, ρc² + p. Here it is ρc² + 3p.' }] : [])],
          hints: [t`$\rho c^2 + 3p = \rho c^2 + 3w\rho c^2 = (1 + 3w)\rho c^2$.`, t`$1 + 3\times(${wt})$.`],
          teach: 'Anything with w < −1/3 breaks the strong condition and accelerates the expansion.',
          explain: t`$1 + 3w = ${sci(x, 3)}$: ${x > 0 ? 'positive — gravity attracts and the expansion slows' : x < 0 ? 'negative — the strong condition fails and the expansion speeds up' : 'zero — the boundary: no acceleration either way'}.`,
          visual: plane({ only: [], mark: [1, round(w, 4), `w = ${w === 1 / 3 ? '1/3' : w === -0.5 ? '−1/2' : w === -0.8 ? '−0.8' : w === -1 ? '−1' : '0'}`], caption: 'The fluid in question, on the plane of energy density and pressure (arbitrary units).' }),
        };
      },
    }),
    mcq({
      id: 'quantum-inequality', difficulty: 3,
      prompt: 'Quantum fields can produce negative energy density, as in the Casimir effect. What do quantum inequalities say about it?',
      choices: [
        'The more negative the energy density, the shorter the time — and the thinner the region — it can last, and it comes with compensating positive energy',
        'Negative energy can be collected and stored indefinitely, like charge in a battery',
        'It can exist only inside black holes',
        'It is the same thing as antimatter, which has negative energy',
      ],
      answer: 0,
      why: {
        1: 'Quantum inequalities forbid exactly that: a large negative energy density cannot persist.',
        2: 'The Casimir effect is measured in laboratories on Earth.',
        3: 'Antimatter has positive energy: a positron weighs the same as an electron, and annihilation releases energy.',
      },
      hints: ['Look at the picture: what happens to the allowed negative energy density as the time gets shorter?', 'The bound scales as ħ/(c³t⁴).'],
      teach: 'Quantum inequalities: negative energy density is allowed only in amounts that shrink rapidly the longer it lasts.',
      explain: 'For simple quantum fields, the average energy density an observer sees over a time t cannot be more negative than about −ħ/(c³t⁴) times a number of order one. Brief, small dips are allowed; large, lasting ones are not. Applied to wormholes, the negative energy must sit in a band far thinner than the throat; applied to warp drives, the bubble wall must be absurdly thin.',
      visual: {
        type: 'graph',
        params: {
          x: [-16, -4], y: [-45, 8], xlabel: 'log₁₀(time it lasts, in s)', ylabel: 'log₁₀(largest negative energy density, J/m³)',
          curves: [{ fn: `${round(Math.log10(HBAR / C ** 3), 5)} - 4x`, color: 'violet', width: 2.6, label: 'the bound, ∝ ħ/(c³t⁴)', labelAt: -9.5 }],
          shade: [{ fn: `${round(Math.log10(HBAR / C ** 3), 5)} - 4x`, lower: '-45', from: -16, to: -4, color: 'good', alpha: 0.12 }],
        },
        caption: 'Schematic quantum inequality for a simple massless field: below the line (green) is allowed. The numerical factor in front depends on the field and on how the average is taken.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-casimir-pressure', difficulty: 2,
      gen(r) {
        const [d, dtxt] = r.pick([[1e-6, t`1\ \mu\text{m}`], [5e-7, t`0.5\ \mu\text{m}`], [2e-6, t`2\ \mu\text{m}`]]);
        const x = casimirP(d);
        return {
          prompt: t`Two Casimir plates $d = ${dtxt}$ apart are pulled together by the pressure $\pi^2\hbar c/(240\,d^4)$. What is it, in pascals? ($\hbar = 1.0546\times10^{-34}$ J s)`,
          answer: x, units: 'Pa', tol: { rel: 0.01 },
          errors: [{ value: x / 3, feedback: 'The pressure has 240 in the denominator, not 720 — three times the energy density.' }],
          hints: ['Compute d⁴ first, then π²ħc/(240 d⁴).'],
          teach: 'The Casimir pressure, π²ħc/(240d⁴), is about a millipascal at one micrometre.',
          explain: t`$${sci(x)}$ Pa — about $${sci(x / 1.013e5, 2)}$ of atmospheric pressure, yet measured: Lamoreaux confirmed it in 1997, and later experiments to a few percent.`,
          visual: logDots([['atmospheric pressure', 1.013e5, 'ink2'], ['sunlight’s pressure on an absorber at Earth', SUNLIGHT, 'gold']], { xlabel: 'pressure in pascals (powers of ten)', range: [-8, 9], every: 2, caption: 'Pressures for scale, in powers of ten.' }),
        };
      },
    }),
    mcq({
      id: 'cp-honest', difficulty: 2,
      prompt: 'Which statement about breaking energy conditions is right?',
      choices: [
        'Quantum effects break them in small, brief and measured ways, such as the Casimir effect; nobody knows how to produce large amounts of negative energy for long',
        'They have never been broken, which proves that wormholes are impossible',
        'A cosmological constant breaks the null condition, so the universe is full of exotic matter',
        'They can be broken at will with strong enough magnetic fields',
      ],
      answer: 0,
      why: {
        1: 'The Casimir effect breaks the null condition between the plates. What is unknown is whether large, lasting violations are possible — not whether violations happen at all.',
        2: 'A cosmological constant has ρc² + p = 0: it satisfies the null condition and breaks only the strong one.',
        3: 'Electromagnetic fields have positive energy density and satisfy all four conditions.',
      },
      hints: ['Recall the Casimir example: did the null condition hold between the plates?'],
      teach: 'Small quantum violations of energy conditions are real; large, lasting ones are not known to be possible.',
      explain: 'The honest summary: pointwise conditions fail in quantum physics, but averaged conditions and quantum inequalities still sharply limit negative energy. That is the difference between “not forbidden by Einstein’s equations” and “achievable”.',
      visual: logDots([['Casimir, plates 1 μm apart', -casimirRho(1e-6), 'violet'], ['Casimir, plates 10 nm apart', -casimirRho(1e-8), 'violet'], ['a 1 km wormhole throat needs', throat(1000), 'bad'], ['a 1 m wormhole throat needs', throat(1), 'bad']], { xlabel: 'size of negative energy density, J/m³ (powers of ten)', range: [-6, 68], every: 10, caption: 'Negative energy density available from the Casimir effect against what wormholes would need, in powers of ten (magnitudes).' }),
    }),
    num({
      id: 'cp-shortfall', difficulty: 3, transfer: true,
      gen(r) {
        const [d, dtxt] = r.pick([[1e-8, '10 nm'], [1e-7, '100 nm']]);
        const r0 = r.pick([1, 100]);
        const x = throat(r0) / -casimirRho(d);
        return {
          prompt: t`A propulsion concept proposes using the Casimir effect to supply the negative energy for a wormhole throat of radius $r_0 = ${r0}$ m. Plates ${dtxt} apart give $|\rho c^2| = \pi^2\hbar c/(720 d^4)$; the throat needs about $c^4/(8\pi G r_0^2)$. By what factor does the Casimir effect fall short (needed ÷ available)? ($G = 6.674\times10^{-11}$ SI)`,
          answer: x, tol: { rel: 0.015 },
          errors: [{ value: 1 / x, feedback: 'That is available ÷ needed. The question asks how many times more is needed.' }],
          hints: [t`Needed: $c^4/(8\pi G r_0^2) = ${sci(throat(r0))}$ J/m³.`, t`Available: $\pi^2\hbar c/(720 d^4) = ${sci(-casimirRho(d))}$ J/m³; divide.`],
          teach: 'The gap between laboratory negative energy and what a wormhole needs is some 35 to 46 orders of magnitude.',
          explain: t`$${sci(throat(r0))}/${sci(-casimirRho(d))} = ${sci(x, 2)}$. And quantum inequalities would still forbid spreading even that much negative energy through a large region for long. The concept fails by tens of orders of magnitude before any engineering begins.`,
          visual: logDots([['Casimir, plates 1 μm apart', -casimirRho(1e-6), 'violet'], ['a 1 km wormhole throat needs', throat(1000), 'bad']], { xlabel: 'energy density, J/m³ (powers of ten)', range: [-6, 52], every: 8, caption: 'Two magnitudes for scale, in powers of ten.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Kontou & Sanders, “Energy conditions in general relativity and quantum field theory”, Class. Quantum Grav. 37, 193001 (2020)', url: 'https://arxiv.org/abs/2003.01815' },
    { label: 'Lamoreaux, demonstration of the Casimir force, Phys. Rev. Lett. 78, 5 (1997)', url: 'https://doi.org/10.1103/PhysRevLett.78.5' },
    { label: 'Ford & Roman, quantum field theory constrains traversable wormhole geometries (1996)', url: 'https://arxiv.org/abs/gr-qc/9510071' },
    { label: 'Carroll, Lecture Notes on GR, ch. 4 (energy conditions)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
