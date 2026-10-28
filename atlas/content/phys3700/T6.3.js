// Average values and equipartition derived: Ē = −∂ln Z/∂β, C = ∂Ē/∂T and
// σ_E² = kT²C; ½kT for every quadratic term proved by one Gaussian
// integral (and kT/n for |q|ⁿ); its failure when the level spacing beats
// kT — CO₂'s bending mode on Earth, Mars and Venus — and energy
// fluctuations from a mole of gas to a 0.1 K bolometer.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, EV, HCK, NA, r4, texNum, apart, ladderPic } from './_stat.js';

const t = String.raw;
const TH_BEND = 667.4 * HCK;                      // CO₂ bending fundamental, 667.4 cm⁻¹ (NIST), as a temperature
const eOsc = (x) => x / Math.expm1(x);            // Ē/kT of an oscillator at x = ε/kT (above the ground state)
const cOsc = (x) => (x * x * Math.exp(x)) / Math.expm1(x) ** 2;
const sums = (pow, tv, Jmax = 40) => `(${Array.from({ length: Jmax + 1 }, (_, J) => `${(2 * J + 1) * (J * (J + 1)) ** pow}*e^(-${J * (J + 1)}/(${tv}))`).join(' + ')})`;
const rotE = (tv) => `(1/(${tv}))*${sums(1, tv)}/${sums(0, tv)}`;
// worked example: CO₂ bending at Earth's mean surface temperature
const EX = { T: 288 };
EX.x = TH_BEND / EX.T; EX.e = eOsc(EX.x); EX.c = cOsc(EX.x);

/** Ē/kT against kT/ε for an oscillator (and optionally a two-level system and a rotor), with equipartition lines. */
function ePic({ mark = null, which = ['osc'], caption, ymax = 1.2 }) {
  const curves = [];
  if (which.includes('osc')) curves.push({ fn: '(1/x)/(e^(1/x) - 1)', domain: [0.03, 5], color: 'accent', label: 'oscillator', labelAt: 3.6, labelDy: 18 });
  if (which.includes('two')) curves.push({ fn: '(1/x)/(e^(1/x) + 1)', domain: [0.03, 5], color: 'gold', label: 'two-level', labelAt: 3.6, labelDy: 14 });
  if (which.includes('rot')) curves.push({ fn: rotE('x'), domain: [0.05, 5], color: 'violet', label: 'rotor', labelAt: 2.2, labelDy: -10 });
  return {
    type: 'graph',
    params: { x: [0, 5], y: [0, ymax], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / ε', ylabel: 'average energy / kT', curves, hlines: [{ y: 1, color: 'ink3', label: 'equipartition: kT' }], vlines: mark === null ? [] : [{ x: r4(mark), color: 'warn' }] },
    caption,
  };
}

export default lesson({
  id: 'phys3700.T6.3',
  title: 'Average values and equipartition derived',
  minutes: 16, difficulty: 3,
  intro: t`The average of any quantity is its values weighted by the Boltzmann probabilities. For the energy that average is hidden inside $Z$: differentiating $Z = \sum_s e^{-\beta E(s)}$ with respect to $\beta = 1/kT$ brings down $-E(s)$ in every term, so

$$\bar E = -\frac{1}{Z}\frac{\partial Z}{\partial \beta} = -\frac{\partial \ln Z}{\partial \beta}.$$

Apply it to any energy that is **quadratic** in a continuous variable, $E = cq^2$. The sum over states becomes an integral, $Z \propto \int e^{-\beta c q^2}dq = \sqrt{\pi/\beta c}$, so $\ln Z = -\tfrac12\ln\beta + \text{const}$ and $\bar E = \tfrac12 kT$ — whatever $c$ is. That is the **equipartition theorem**, met in [T1.2](#/lesson/phys3700.T1.2) as a rule and now proved. The proof also shows when it fails: when the levels are spaced more widely than $kT$, the integral is a bad stand-in for the sum.`,
  symbols: [
    { tex: '\\bar E', text: 'the average (expected) energy of the system, in J' },
    { tex: 'Z', text: 'the partition function, $\\sum_s e^{-\\beta E(s)}$' },
    { tex: '\\beta', text: 'the inverse thermal energy, $1/kT$, in J⁻¹ — the natural variable to differentiate with respect to' },
    { tex: '\\ln Z', text: 'the logarithm of $Z$: its derivatives give the average energy, and (T6.5) the free energy and everything else' },
  ],
  why: 'This is how statistical mechanics computes heat capacities from energy levels — and it explains the 19th-century puzzle of why gases and solids have fewer heat-holding degrees of freedom than classical physics counts.',
  visual: {
    type: 'graph',
    title: 'When equipartition holds',
    lead: t`Average energy, in units of $kT$, against temperature in units of each system’s energy scale $\varepsilon$. Equipartition predicts $kT$ for an oscillator (kinetic plus potential: two quadratic terms) and for a rotor (two rotation axes). Slide the temperature and compare.`,
    tasks: [
      'Cold (kT/ε below about 0.2): every curve falls to zero — the first excited level is out of reach. The degree of freedom is frozen.',
      'Hot: the oscillator and rotor rise to the equipartition line; the oscillator gets there more slowly.',
      'The two-level system never gets there: with a ceiling on its energy, its average stops at ε/2 however hot it gets, so Ē/kT falls back toward zero.',
    ],
    params: {
      x: [0, 5], y: [0, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / ε', ylabel: 'average energy / kT',
      sliders: [{ key: 'tau', label: 'Temperature, $kT/\\varepsilon$', min: 0.05, max: 5, step: 0.05, value: 0.6, explain: 'The thermal energy against the system’s level spacing (or rotational constant).' }],
      curves: [
        { fn: '(1/x)/(e^(1/x) - 1)', domain: [0.03, 5], color: 'accent', label: 'oscillator', labelAt: 3.6, labelDy: 18 },
        { fn: rotE('x'), domain: [0.05, 5], color: 'violet', label: 'rotor', labelAt: 2.2, labelDy: -10 },
        { fn: '(1/x)/(e^(1/x) + 1)', domain: [0.03, 5], color: 'gold', label: 'two-level', labelAt: 3.6, labelDy: 14 },
      ],
      hlines: [{ y: 1, color: 'ink3', label: 'equipartition: kT' }],
      vlines: [{ x: 'tau', color: 'warn' }],
      readouts: [
        { label: 'oscillator $\\bar E/kT$', expr: '(1/tau)/(e^(1/tau) - 1)', digits: 3 },
        { label: 'rotor $\\bar E/kT$', expr: rotE('tau'), digits: 3 },
        { label: 'two-level $\\bar E/kT$', expr: '(1/tau)/(e^(1/tau) + 1)', digits: 3 },
      ],
    },
    caption: 'Exact averages from each Z (energies measured from the ground state; the oscillator’s zero-point energy is left out). Rotor: a rigid heteronuclear molecule.',
  },
  example: {
    prompt: t`CO₂’s bending vibration (two identical oscillators, quantum $hc\times667.4\ \text{cm}^{-1} = k\times${fmt(TH_BEND, 4)}$ K) absorbs Earth’s infrared near 15 μm. From $Z$ for one oscillator, find its average vibrational energy at $${EX.T}$ K as a fraction of the equipartition value $kT$, and its heat capacity per molecule as a fraction of $k$.`,
    visual: ePic({ mark: 1 / EX.x, caption: 'Average energy per oscillator against kT/ε. Orange: CO₂’s bending mode at 288 K, well below the equipartition line.' }),
    steps: [
      { label: 'Partition function', text: t`With energies $n\varepsilon$: $Z = 1/(1 - e^{-\beta\varepsilon})$, so $\ln Z = -\ln(1 - e^{-\beta\varepsilon})$.` },
      { label: 'Differentiate', text: t`$\bar E = -\dfrac{\partial\ln Z}{\partial\beta} = \dfrac{\varepsilon e^{-\beta\varepsilon}}{1 - e^{-\beta\varepsilon}} = \dfrac{\varepsilon}{e^{\varepsilon/kT} - 1}$.` },
      { label: 'Numbers', text: t`$\varepsilon/kT = ${fmt(TH_BEND, 4)}/${EX.T} = ${fmt(EX.x, 4)}$, so $\bar E/kT = ${fmt(EX.x, 4)}/(e^{${fmt(EX.x, 4)}} - 1) = ${fmt(EX.e, 3)}$ — about $${fmt(100 * EX.e, 2)}\,\%$ of $kT$.` },
      { label: 'Heat capacity', text: t`$C = \dfrac{\partial\bar E}{\partial T} = k\dfrac{x^2e^x}{(e^x - 1)^2}$ with $x = \varepsilon/kT$: $C/k = ${fmt(EX.c, 3)}$ per oscillator, or $${fmt(2 * EX.c, 3)}$ for both bending modes.` },
      { label: 'Sense check', text: t`Classically each oscillator would hold $kT$ and give $C = k$; the bending mode is partly frozen, but only partly — which is why CO₂’s heat capacity at room temperature (about $3.5k$ per molecule at constant volume) is above the rigid-molecule $\tfrac52k$.` },
    ],
    answer: t`$\bar E = ${fmt(EX.e, 3)}\,kT$ per bending oscillator; $C = ${fmt(EX.c, 3)}\,k$ (so $${fmt(2 * EX.c, 3)}\,k$ for both).`,
  },
  practice: [
    num({
      id: 'two-level-mean', difficulty: 2,
      gen(r) {
        const x = r.pick([0.5, 1, 2, 3]), v = 1 / (Math.exp(x) + 1);
        return {
          prompt: t`A two-level system has states at $0$ and $\varepsilon$, with $\varepsilon/kT = ${x}$. What is its average energy, $\bar E/\varepsilon$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / Math.expm1(x), feedback: 'That is the oscillator’s formula (minus sign): a two-level system has only one excited state, so Z = 1 + e^(−βε).' }, { value: 1 / (2 * x), feedback: 'Equipartition (½kT) does not apply to a system with two discrete states.' }, { value: Math.exp(-x), feedback: 'Divide by Z: Ē = ε e^(−βε)/(1 + e^(−βε)).' }], v),
          hints: [t`$Z = 1 + e^{-\beta\varepsilon}$, so $\bar E = -\partial\ln Z/\partial\beta = \dfrac{\varepsilon e^{-\beta\varepsilon}}{1 + e^{-\beta\varepsilon}}$.`, t`$\bar E/\varepsilon = 1/(e^{\varepsilon/kT} + 1) = 1/(e^{${x}} + 1)$.`],
          teach: t`$\bar E = -\partial\ln Z/\partial\beta$; for two levels that is $\varepsilon/(e^{\varepsilon/kT} + 1)$.`,
          explain: t`$\bar E/\varepsilon = 1/(e^{${x}} + 1) = ${fmt(v, 3)}$ — the upper state’s probability, as it must be: only that state carries energy.`,
          visual: { type: 'graph', params: { x: [0, 5], y: [0, 0.55], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / ε', ylabel: 'Ē / ε', curves: [{ fn: '1/(e^(1/x) + 1)', domain: [0.03, 5], color: 'gold' }], hlines: [{ y: 0.5, color: 'ink4', label: 'ceiling ε/2' }], vlines: [{ x: r4(1 / x), color: 'warn' }] }, caption: 'A two-level system’s average energy against temperature: it can never pass ε/2. Orange: this temperature.' },
        };
      },
    }),
    order({
      id: 'prove-equipartition', difficulty: 3,
      prompt: t`Order the steps that prove a quadratic term $E = cq^2$ holds $\tfrac12 kT$ on average.`,
      items: [
        t`Classically $q$ is continuous: replace the sum over states by $\int dq$.`,
        t`$Z = C\int_{-\infty}^{\infty} e^{-\beta cq^2}dq$`,
        t`The Gaussian integral gives $Z = C\sqrt{\pi/\beta c}$.`,
        t`So $\ln Z = -\tfrac12\ln\beta + \text{(terms without }\beta)$.`,
        t`$\bar E = -\partial\ln Z/\partial\beta = \tfrac{1}{2\beta} = \tfrac12 kT$.`,
      ],
      hints: [t`Everything that does not depend on $\beta$ drops out when you differentiate $\ln Z$.`, 'The constant C (the density of states in q) and c both end up in those β-free terms.'],
      teach: t`Equipartition is the statement that $Z \propto \beta^{-1/2}$ for each quadratic term.`,
      explain: t`The stiffness $c$ and the state density $C$ only multiply $Z$ by constants, which become additive constants in $\ln Z$ and vanish on differentiation. The step that can fail is the first: replacing a sum over discrete levels by an integral is only good when the spacing is much less than $kT$.`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'q (in units of √(kT/c))', ylabel: 'e^(−βcq²)', curves: [{ fn: 'e^(-x^2)', domain: [-3, 3], color: 'accent' }], shade: [{ fn: 'e^(-x^2)', lower: '0', from: -3, to: 3, color: 'accent', alpha: 0.2 }] }, caption: 'The Gaussian whose area is Z: stiffen the spring (bigger c) and it narrows, scaling Z by a constant only.' },
    }),
    num({
      id: 'power-law', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 4, 6]), v = 1 / n;
        return {
          prompt: t`A degree of freedom has energy $E = c|q|^{${n}}$ with $q$ continuous and classical. Repeat the equipartition argument: what is $\bar E/kT$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 0.5, feedback: 'One half belongs to quadratic energies only. Substitute u = β^(1/n) q in the integral.' }, { value: n / 2, feedback: t`$Z \propto \beta^{-1/${n}}$, so $\bar E = \tfrac1${n}\,kT$.` }], v),
          hints: [t`Substitute $u = (\beta c)^{1/${n}}q$: $Z = \int e^{-\beta c|q|^${n}}dq \propto \beta^{-1/${n}}$.`, t`$\bar E = -\partial\ln Z/\partial\beta = \dfrac{1}{${n}\beta}$.`],
          teach: t`For $E \propto |q|^n$, $Z \propto \beta^{-1/n}$ and $\bar E = kT/n$: equipartition’s ½ is the $n = 2$ case.`,
          explain: t`$\ln Z = -\tfrac1${n}\ln\beta + \text{const}$, so $\bar E = kT/${n}$. ${n === 1 ? 'A linear potential is gravity: a molecule in an isothermal atmosphere has average potential energy mgh = kT.' : 'Steeper walls confine the particle more tightly as it heats, so each kT buys less energy in this coordinate.'}`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [0, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'q', ylabel: 'E / c', curves: [{ fn: 'x^2', domain: [-2, 2], color: 'ink3', dash: true, label: 'q²', labelAt: 1.6, labelDx: 6 }, { fn: `abs(x)^${n}`, domain: [-2, 2], color: 'accent', label: `|q|${n === 1 ? '' : n === 4 ? '⁴' : '⁶'}`, labelAt: n === 1 ? 1.8 : 1.15, labelDx: 8 }] }, caption: 'The potential asked about (solid) against the quadratic one (dashed).' },
        };
      },
    }),
    num({
      id: 'osc-share', difficulty: 2,
      gen(r) {
        const pick = r.pick([['N₂’s vibration', 3352], ['O₂’s vibration', 2239], ['silicon’s optical lattice vibration (Raman line 520.7 cm⁻¹)', 749]]), T = r.pick([300, 1000, 2000]), x = pick[1] / T, v = eOsc(x);
        return {
          prompt: t`Treat ${pick[0]}, with quantum $\varepsilon/k = ${pick[1]}$ K, as a harmonic oscillator. At $${T}$ K, what fraction of the equipartition energy $kT$ does it hold on average (above its ground state)?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: Math.exp(-x), feedback: 'Close at low temperature only. The full result is (ε/kT)/(e^(ε/kT) − 1).' }, { value: 1 / Math.expm1(x), feedback: 'That is the mean number of quanta. Multiply by ε/kT to get Ē/kT.' }], v),
          hints: [t`$\bar E/kT = \dfrac{x}{e^x - 1}$ with $x = \varepsilon/kT = ${fmt(x, 3)}$.`],
          teach: t`An oscillator holds $\bar E = \varepsilon/(e^{\varepsilon/kT} - 1)$: $kT$ when hot, exponentially little when cold.`,
          explain: t`$x = ${fmt(x, 3)}$: $\bar E/kT = ${fmt(x, 3)}/(e^{${fmt(x, 3)}} - 1) = ${texNum(v, 3)}$.`,
          visual: ePic({ mark: 1 / x, caption: 'An oscillator’s average energy against kT/ε. Orange: this temperature.' }),
        };
      },
    }),
    expr({
      id: 'from-Z', difficulty: 3,
      prompt: t`A molecule has a nondegenerate ground state at 0 and an excited level of **two** states at $\varepsilon$, so $Z = 1 + 2e^{-\beta\varepsilon}$. Find $\bar E$ as a function of $\beta$ and $\varepsilon$.`,
      answer: '2*eps*e^(-beta*eps)/(1 + 2*e^(-beta*eps))',
      answerTeX: t`\frac{2\varepsilon e^{-\beta\varepsilon}}{1 + 2e^{-\beta\varepsilon}}`,
      lhs: t`\bar E`,
      vars: { beta: [0.2, 3], eps: [0.5, 2] },
      keys: [['β', 'beta'], ['ε', 'eps']],
      derivativeOf: '-ln(1 + 2*e^(-beta*eps))',
      errors: [
        { answer: 'eps*e^(-beta*eps)/(1 + e^(-beta*eps))', feedback: 'Keep the factor 2: the excited level has two states.' },
        { answer: '2*eps*e^(-beta*eps)', feedback: 'Divide by Z: the derivative of ln Z is Z′/Z.' },
        { answer: '-2*eps*e^(-beta*eps)/(1 + 2*e^(-beta*eps))', feedback: 'Ē = −∂ln Z/∂β: the two minus signs cancel.' },
      ],
      hints: [t`$\dfrac{\partial Z}{\partial\beta} = -2\varepsilon e^{-\beta\varepsilon}$.`, t`$\bar E = -\dfrac{1}{Z}\dfrac{\partial Z}{\partial\beta}$.`],
      teach: t`$\bar E = -\partial\ln Z/\partial\beta = -Z'/Z$.`,
      explain: t`$-\dfrac{\partial\ln Z}{\partial\beta} = \dfrac{2\varepsilon e^{-\beta\varepsilon}}{1 + 2e^{-\beta\varepsilon}}$ — $\varepsilon$ times the probability of being excited, as it must be. Hot, it tends to $\tfrac23\varepsilon$: two of the three states are excited.`,
      visual: ladderPic([{ E: 0, p: 1 / 3, g: 1, label: 'ground' }, { E: 1, p: 2 / 3, g: 2, label: 'excited' }], { y: [-0.3, 1.5], xlabel: 'number of states (share)', ylabel: 'energy (units of ε)', caption: 'The level scheme: bars show each level’s number of states.' }),
    }),
    num({
      id: 'fluctuation', difficulty: 3,
      gen(r) {
        const pick = r.pick([[1e3, t`$10^{3}$ atoms`], [1e9, t`$10^{9}$ atoms`], [NA, 'one mole of atoms']]), N = pick[0], v = Math.sqrt(2 / (3 * N));
        return {
          prompt: t`The energy of a system held at temperature $T$ fluctuates, with $\sigma_E^2 = \overline{E^2} - \bar E^2 = kT^2C$. For a monatomic ideal gas of ${pick[1]} ($\bar E = \tfrac32 NkT$, $C = \tfrac32 Nk$), what is $\sigma_E/\bar E$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / Math.sqrt(N), feedback: 'The right scaling, but carry the factor √(2/3) through.' }, { value: 2 / (3 * N), feedback: 'That is (σ/Ē)². Take the square root.' }], v),
          hints: [t`$\sigma_E = \sqrt{kT^2\cdot\tfrac32Nk} = kT\sqrt{\tfrac32N}$.`, t`$\sigma_E/\bar E = \dfrac{kT\sqrt{3N/2}}{\tfrac32NkT} = \sqrt{\dfrac{2}{3N}}$.`],
          teach: t`Energy fluctuations at fixed $T$ are $\sigma_E = \sqrt{kT^2C}$; relative to $\bar E$ they shrink like $1/\sqrt N$.`,
          explain: t`$\sigma_E/\bar E = \sqrt{2/3N} = ${texNum(v, 3)}$. ${N > 1e20 ? 'For a mole the energy is sharp to about one part in a trillion, which is why thermodynamics can treat it as fixed.' : 'For a small cluster the fluctuations are easily measurable.'}`,
          visual: { type: 'graph', params: { x: [0, 24], y: [-12.5, 0], aspect: 'wide', axesAt: 'edge', xlabel: 'log₁₀ N', ylabel: 'log₁₀ (σ/Ē)', curves: [{ fn: 'log10(sqrt(2/(3*10^x)))', domain: [0, 24], color: 'accent' }], vlines: [{ x: r4(Math.log10(N)), color: 'gold' }] }, caption: 'Relative energy fluctuation of a monatomic ideal gas against the number of atoms (both on log scales). Gold: the system asked about.' },
        };
      },
    }),
    mcq({
      id: 'why-fail', difficulty: 2,
      prompt: 'Why does a diatomic gas’s vibration contribute almost nothing to its heat capacity at room temperature, even though its energy is quadratic (½kx² + ½mv²)?',
      choices: ['Its quantum ħω is many times kT, so the sum over discrete levels is nothing like the integral the equipartition proof assumes', 'Its energy is not quadratic when the molecule is cold', 'The molecules move too slowly at room temperature to vibrate', 'Vibrational energy is not counted in the heat capacity because it is internal'],
      answer: 0,
      why: { 1: 'The potential is close to harmonic at all these temperatures; the problem is the size of the energy steps, not the shape.', 2: 'Translation and vibration are separate degrees of freedom; translational speed does not set whether a vibration is excited — the quantum does.', 3: 'Heat capacity counts every form of internal energy; vibration contributes fully once hot.' },
      hints: ['Which step of the proof replaced a sum by an integral? When is that good?'],
      teach: 'Equipartition fails for a degree of freedom whose level spacing exceeds kT: it freezes out.',
      explain: t`The proof assumed continuous $q$, so that $Z$ is a Gaussian integral. A quantum oscillator has levels $\hbar\omega$ apart; when $\hbar\omega \gg kT$ (about 3000 K against 300 K for N₂), only the ground state is occupied and $\bar E \approx \hbar\omega\,e^{-\hbar\omega/kT}$ — essentially zero.`,
      visual: ePic({ which: ['osc'], caption: 'An oscillator’s average energy over kT: equipartition (the line at 1) is reached only when kT is well above the quantum ε.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-co2-planets', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([['Mars’s surface', 210], ['Venus’s surface', 737], ['Earth’s stratosphere', 220]]), x = TH_BEND / p[1], v = 2 * cOsc(x);
        return {
          prompt: t`At ${p[0]} (about $${p[1]}$ K) the air is ${p[1] === 220 ? 'only 0.04 % ' : 'mostly '}CO₂. Its two bending oscillators each have quantum $\varepsilon/k = ${fmt(TH_BEND, 4)}$ K. What do they add to the heat capacity per molecule, in units of $k$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 2, feedback: 'That is the classical (equipartition) value; the modes are partly frozen at this temperature.' }, { value: cOsc(x), feedback: 'That is one bending oscillator. CO₂ has two.' }, { value: 2 * eOsc(x), feedback: 'That is Ē/kT. Heat capacity is the derivative, C/k = x²eˣ/(eˣ − 1)².' }], v),
          hints: [t`Per oscillator, $C/k = \dfrac{x^2e^x}{(e^x - 1)^2}$ with $x = \varepsilon/kT$.`, t`$x = ${fmt(TH_BEND, 4)}/${p[1]} = ${fmt(x, 3)}$; double the result for two modes.`],
          teach: 'Heat capacity is dĒ/dT; quantized modes add between 0 and k each, depending on ε/kT.',
          explain: t`$x = ${fmt(x, 3)}$, so each mode gives $${fmt(cOsc(x), 3)}\,k$ and the pair $${fmt(v, 3)}\,k$. ${p[1] > 500 ? 'On Venus the bending modes are nearly classical.' : 'In the cold, they are mostly frozen.'}`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 2.3], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / ε', ylabel: 'C / k from both modes', curves: [{ fn: '2*(1/x)^2*e^(1/x)/(e^(1/x) - 1)^2', domain: [0.04, 3], color: 'accent' }], hlines: [{ y: 2, color: 'ink3', label: 'classical 2k' }], vlines: [{ x: r4(1 / x), color: 'warn' }] }, caption: 'Heat capacity of CO₂’s two bending modes (harmonic) against temperature. Orange: this atmosphere.' },
        };
      },
    }),
    num({
      id: 'cp-power', difficulty: 3,
      gen(r) {
        const n = r.pick([1.5, 2.5, 3, 3.5]), v = n;
        return {
          prompt: t`Over some range of temperature a system’s partition function is $Z = AT^{${n}}$, with $A$ a constant. What is $\bar E/kT$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / n, feedback: 'With β = 1/kT, Z ∝ β^(−n), and Ē = −∂ln Z/∂β = n/β.' }, { value: n / 2, feedback: 'There is no factor ½ here: the power of T is the count directly.' }], v),
          hints: [t`In terms of $\beta$: $Z \propto \beta^{-${n}}$.`, t`$\bar E = -\partial\ln Z/\partial\beta = ${n}/\beta$.`],
          teach: t`$\bar E = kT^2\,\partial\ln Z/\partial T$: a power law $Z \propto T^n$ gives $\bar E = nkT$.`,
          explain: t`$\ln Z = ${n}\ln T + \ln A$, and $\bar E = kT^2\dfrac{\partial\ln Z}{\partial T} = ${n}\,kT$. Each quadratic term contributes $T^{1/2}$ to $Z$; ${n} corresponds to ${2 * n} of them.`,
          visual: { type: 'graph', params: { x: [0, 2], y: [0, 12], aspect: 'wide', axesAt: 'edge', xlabel: 'temperature T (arbitrary units)', ylabel: 'Z / A', curves: [{ fn: `x^${n}`, domain: [0, 2], color: 'accent' }] }, caption: 'The partition function given, against temperature: it grows as a power of T, the signature of classical degrees of freedom.' },
        };
      },
    }),
    num({
      id: 'cp-bolometer', difficulty: 3, transfer: true,
      gen(r) {
        const C = r.pick([0.5e-12, 1e-12, 3e-12]), T = r.pick([0.1, 0.3]), v = Math.sqrt(KB * T * T * C) / EV;
        return {
          prompt: t`A spacecraft bolometer — like the 0.1 K detectors of ESA’s Planck mission — measures light by the warming of a tiny absorber. Its absorber, at $${T}$ K, has heat capacity $${texNum(C, 2)}$ J/K. By how much does its energy fluctuate (rms) just from being in contact with its thermal bath? Answer in eV.`,
          answer: v, units: 'eV', tol: { rel: 0.01 },
          errors: apart([{ value: Math.sqrt(KB * T * C) / EV, feedback: t`$\sigma_E^2 = kT^2C$: the temperature is squared.` }, { value: (KB * T * T * C) / EV, feedback: 'That is the variance, σ². Take the square root.' }], v),
          hints: [t`$\sigma_E = \sqrt{kT^2C}$.`, t`$\sqrt{(1.381\times10^{-23})(${T})^2(${texNum(C, 2)})}$ J, then divide by $1.602\times10^{-19}$ J/eV.`],
          teach: t`Contact with a bath makes energy fluctuate by $\sqrt{kT^2C}$ — a noise floor every thermal detector must beat.`,
          explain: t`$\sigma_E = ${texNum(v * EV, 3)}$ J $= ${fmt(v, 3)}$ eV. The detector cannot register an energy much smaller than this in one reading; cooling it (σ ∝ T for fixed C, and C itself falls in the cold) is why such detectors run at a tenth of a kelvin.`,
          visual: { type: 'graph', params: { x: [0, 0.5], y: [0, 8], aspect: 'wide', axesAt: 'edge', xlabel: 'absorber temperature (K)', ylabel: 'rms energy noise (eV)', curves: [{ fn: `sqrt(${KB}*x^2*${C})/${EV}`, domain: [0, 0.5], color: 'accent' }], vlines: [{ x: T, color: 'gold' }] }, caption: 'Thermodynamic energy fluctuation of an absorber with this heat capacity (held fixed for simplicity; real heat capacities fall as the temperature does).' },
        };
      },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §§6.2–6.3', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NIST Chemistry WebBook: carbon dioxide, vibrational frequencies', url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C124389&Mask=800' },
    { label: 'ESA, Planck High Frequency Instrument (bolometers at 0.1 K)', url: 'https://www.esa.int/Science_Exploration/Space_Science/Planck' },
  ],
});
