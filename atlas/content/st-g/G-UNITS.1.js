// c = 1 as dimensional bookkeeping: with time measured in metres, every SI
// quantity is metres^a kilograms^b, and multiplying by c slides it along a
// diagonal of the (metre, second) exponent lattice. Restoring c in a formula
// by matching dimensions; acceleration as an inverse length (1 g ≈ 1/ly);
// specific energy as a pure number. Then the particle physicist's second
// step, ħ = c = 1: energies, masses, inverse lengths and inverse times all in
// GeV, through ħc = 197.327 MeV fm and ħ = 6.582×10⁻²⁵ GeV s. Builds on
// phys3710.R0.1 (G = c = 1 as a mass–radius ladder, restoring G and c in one
// clock-rate formula) and gr.S03.i (years and light-years) without repeating
// them; G = 1 and Planck units are lesson G-UNITS.2.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const C = 299792458;
const LY = 9.4607304725808e15;
const HBARC = 197.3269804;            // MeV fm (CODATA 2018)
const HBAR = 6.582119569e-25;         // GeV s
const GEV2MB = 0.3893794;             // 1 GeV⁻² in mb
const ALPHA = 1 / 137.035999;
const r6 = (v) => +(+v).toPrecision(6);

// mass-free quantities on the (metre exponent, second exponent) lattice
const LATTICE = [
  ['length', 1, 0, 8, -8], ['time', 0, 1, 8, -8], ['speed', 1, -1, 8, -8], ['pure number', 0, 0, -8, 14, 'right'],
  ['acceleration', 1, -2, -10, 4, 'right'], ['frequency', 0, -1, 8, 12], ['area', 2, 0, 8, -8], ['J/kg', 2, -2, 8, 4], ['1/length', -1, 0, -8, -8, 'right'],
];

/** The exponent lattice: x = power of metres, y = power of seconds; with c = 1 each diagonal x + y = n is one dimension, Lⁿ. */
function lattice({ only = null, mark = null, extra = {}, sliders = null, readouts = null, caption }) {
  const list = only ? LATTICE.filter((q) => only.includes(q[0])) : LATTICE;
  const curves = [-1, 0, 1, 2].map((n) => ({ fn: `${n} - x`, color: 'ink4', dash: true, width: 1.1, label: n === 1 ? 'L¹' : n === 0 ? 'L⁰' : n === 2 ? 'L²' : 'L⁻¹', labelAt: n + 2.6, labelDx: 4, labelDy: -6 }));
  const points = list.map(([name, x, y, dx, dy, align]) => ({ x, y, r: name === mark ? 6 : 4.5, color: name === mark ? 'gold' : 'accent2', label: name, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) }));
  return {
    type: 'graph',
    params: {
      x: [-1.6, 3.4], y: [-3.3, 1.8], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'power of metres', ylabel: 'power of seconds', xticks: 6, yticks: 6,
      curves: [...curves, ...(extra.curves || [])], points: [...points, ...(extra.points || [])],
      ...(extra.arrows ? { arrows: extra.arrows } : {}), ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}),
    },
    caption: caption ?? t`Quantities without mass, placed by their SI unit $\text{m}^a\,\text{s}^b$. Multiplying by $c$ (m/s) moves a quantity one step down and to the right along a dashed diagonal. With $c = 1$ every point on one diagonal has the same unit, $\text{m}^{a+b}$.`,
  };
}

// particles on the energy ↔ length line λ = ħc/E (log₁₀ of MeV and fm)
const PARTS = [['electron', 0.51099895, 8, -8], ['pion', 139.57039, 8, -8], ['proton', 938.272, 8, -8], ['W', 80369.2, 8, -8], ['Higgs', 125200, 8, 10]];
function natural({ mark = null, hide = false, caption }) {
  return {
    type: 'graph',
    params: {
      x: [-1, 6], y: [-3.5, 3.5], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'rest energy mc² (MeV)', ylabel: 'length ħ/mc (fm)',
      curves: [{ fn: `${r6(Math.log10(HBARC))} - x`, color: 'accent', width: 2.2, label: 'ħ/mc = 197.3 MeV fm ÷ mc²', labelAt: 3.3, labelDx: 8, labelDy: -8 }],
      points: PARTS.filter(([n]) => !(hide && n === mark)).map(([n, m, dx, dy]) => ({ x: r6(Math.log10(m)), y: r6(Math.log10(HBARC / m)), r: n === mark ? 6 : 4.5, color: n === mark ? 'gold' : 'accent2', label: n, labelDx: dx, labelDy: dy })),
    },
    caption: caption ?? t`With $\hbar = c = 1$ a mass is an inverse length: the reduced Compton wavelength $\hbar/mc$, here on logarithmic scales. One straight line serves every particle, because $\hbar c$ is a single fixed number.`,
  };
}

const MU = { p: 1000, m: 105.6583755, ctau: C * 2.1969811e-6 };
MU.L = MU.p / MU.m * MU.ctau;

export default lesson({
  id: 'st-g.G-UNITS.1',
  title: 'c = 1',
  minutes: 11, difficulty: 2,
  intro: t`Setting $c = 1$ is not a statement about light; it is a decision to **measure time in metres**, one second being the $299{,}792{,}458$ m that light covers in it. After that, every SI unit $\text{m}^a\,\text{kg}^b\,\text{s}^n$ becomes $\text{m}^{a+n}\,\text{kg}^b$: speeds are pure numbers, acceleration is an inverse length, energy and momentum are masses. Particle physicists then take a second step, $\hbar = 1$, which makes length an inverse energy:

$$c = 299{,}792{,}458\ \text{m/s} = 1, \qquad \hbar c = 197.327\ \text{MeV fm} = 1$$

The skill is **bookkeeping**: knowing what each quantity has become, and restoring $c$ (and $\hbar$) in a formula by asking what power of each the SI units demand. [Geometric units: c = 1](#/lesson/phys3710.R0.1) went on to $G = 1$ and the mass–radius ladder; here the method itself, and the particle physicist’s road.`,
  symbols: [
    { tex: 'c', text: t`the speed of light, exactly $299{,}792{,}458$ m/s; set to 1, it turns seconds into metres` },
    { tex: '\\hbar', text: t`the reduced Planck constant, $1.054\,571\,817\times10^{-34}$ J s; set to 1, it turns energies into inverse times` },
    { tex: '\\hbar c', text: t`$197.327$ MeV fm: with $\hbar = c = 1$, the factor that turns an energy into an inverse length ($1\ \text{fm} = 10^{-15}$ m)` },
    { tex: '\\text{m}^a\\,\\text{kg}^b\\,\\text{s}^n', text: t`an SI unit; with $c = 1$ the powers of metres and seconds merge into one power of length, $a + n$` },
  ],
  why: 'Every relativity paper sets c = 1 and every particle-physics paper sets ħ = c = 1; reading either, or checking an answer, means putting the constants back by dimensional analysis.',
  visual: {
    ...lattice({
      mark: 'acceleration',
      sliders: [{ key: 'k', label: t`Divide by $c$ how many times`, min: 0, max: 2, step: 1, value: 0, explain: t`Each division by $c$ (m/s) moves the quantity one step up and to the left along its diagonal.` }],
      extra: { points: [{ x: '1 - k', y: '-2 + k', r: 7, color: 'gold', hollow: true }] },
      readouts: [
        { label: t`unit: power of metres`, expr: '1 - k', digits: 1 },
        { label: t`power of seconds`, expr: '-2 + k', digits: 1 },
        { label: t`$1\,g = 9.81\ \text{m/s}^2$ divided by $c^k$`, expr: `9.81/${C}^k`, digits: 4 },
        { label: t`at $k = 2$, in units of $1/\text{light-year}$`, expr: `9.81/${C}^2*${LY}*step(k - 1.5)`, digits: 4 },
      ],
    }),
    title: 'Every unit, one diagonal at a time',
    lead: t`Each dot is a kind of quantity, placed by the powers of metres and seconds in its SI unit. The gold ring follows an acceleration — Earth’s $1\,g$ — as you divide it by $c$ once and twice. It slides along its diagonal; with $c = 1$ everything on that diagonal is the same kind of thing.`,
    tasks: [
      t`Divide once: $g/c$ is a frequency, $3.27\times10^{-8}$ per second.`,
      t`Divide twice: $g/c^2$ is an inverse length, $1.09\times10^{-16}\ \text{m}^{-1}$ — almost exactly one per light-year. With $c = 1$, “1 g” and “1/ly” are the same size.`,
      'Find speed and the pure number on the same diagonal, and J/kg (energy per mass) with them: with c = 1, specific energies have no units at all.',
    ],
  },
  example: {
    prompt: t`A particle physicist writes the mean distance an unstable particle flies before decaying as $L = \dfrac{p}{m}\,\tau$, with $c = 1$. Restore $c$, and find $L$ for a muon of momentum $1$ GeV/$c$ ($mc^2 = 105.658$ MeV, $\tau = 2.197\ \mu\text{s}$).`,
    visual: lattice({ only: ['length', 'time', 'speed', 'pure number'], caption: t`The pieces of the formula on the exponent lattice: $L$ is a length, $\tau$ a time — the same thing when $c = 1$ — and $p/m$ a pure number with $c = 1$ that is a speed in SI.` }),
    steps: [
      { label: 'What each piece is', text: t`In SI, $L$ is in metres, $\tau$ in seconds and $p/m$ in $(\text{kg m/s})/\text{kg} = $ m/s. So $(p/m)\,\tau$ is already in metres: with SI numbers the formula needs no $c$ at all, because $p/m = \gamma v$ exactly.` },
      { label: 'Where c hides', text: t`Particle data come as $p = 1$ GeV/$c$ and $m = 105.658$ MeV/$c^2$ — energies divided by powers of $c$. Then $p/m = \dfrac{1000\ \text{MeV}/c}{105.658\ \text{MeV}/c^2} = ${nice(MU.p / MU.m, 4)}\,c$. The clean way to write it: $L = \dfrac{pc}{mc^2}\,c\tau$, a pure number (energy over energy) times a length.` },
      { label: 'Numbers', text: t`$pc/mc^2 = 1000/105.658 = ${nice(MU.p / MU.m, 4)}$ and $c\tau = ${nice(MU.ctau, 4)}$ m, so $L = ${nice(MU.L, 4)}$ m $\approx ${nice(MU.L / 1000, 3)}$ km.` },
      { label: 'Sense check', text: t`Restoring $c$ is bookkeeping: every term must carry the same SI unit (here metres), and setting $c = 1$ must give back the original. Writing masses as $mc^2$, momenta as $pc$ and times as $c\tau$ turns every piece into an energy or a length, which makes the check automatic.` },
    ],
    answer: t`$L = \dfrac{pc}{mc^2}\,c\tau = ${nice(MU.L / 1000, 3)}$ km.`,
  },
  practice: [
    num({
      id: 'g-per-ly', difficulty: 1,
      gen(r) {
        const [body, g] = r.pick([['Earth', 9.81], ['Mars', 3.721], ['Jupiter (at its cloud tops)', 24.79], ['the Moon', 1.62]]);
        const ans = g / C / C * LY;
        return {
          prompt: t`With $c = 1$ an acceleration is an inverse length. Express the surface gravity of ${body}, $${g}\ \text{m/s}^2$, in units of $1/\text{light-year}$. (1 ly $= 9.461\times10^{15}$ m.) Give the number.`,
          visual: lattice({ mark: 'acceleration', caption: t`Acceleration and $1/\text{length}$ lie on the same diagonal, two steps apart: divide by $c^2$ to move between them.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: g / C * LY, feedback: t`Divide by $c^2$, not $c$: $\text{m/s}^2 \div (\text{m/s})^2 = 1/\text{m}$.` }],
          hints: [t`$g/c^2$ is in $\text{m}^{-1}$; multiply by the metres in a light-year.`, t`$${g}/(${tex(C, 6)})^2\times${tex(LY, 4)}$.`],
          teach: 'With c = 1, an acceleration is an inverse length: a/c² in m⁻¹, and Earth’s gravity is almost exactly 1 per light-year.',
          explain: t`$g/c^2 = ${tex(g / C / C, 3)}\ \text{m}^{-1} = ${nice(ans, 4)}\ \text{ly}^{-1}$. A rocket accelerating at this rate reaches relativistic speeds after about $c/g$ — of order a year for Earth’s gravity.`,
        };
      },
    }),
    multi({
      id: 'same-unit', difficulty: 2,
      prompt: t`With $c = 1$ (but $\hbar$ and $G$ kept), which pairs are measured in the same unit? Select every one.`,
      visual: lattice({}),
      choices: ['energy and mass', 'momentum and mass', 'time and length', 'speed and a pure number', 'acceleration and length', 'frequency and mass'],
      answer: [0, 1, 2, 3],
      why: {
        4: t`Acceleration is $\text{m/s}^2 \to \text{m}^{-1}$, an inverse length, not a length.`,
        5: t`Frequency becomes $\text{m}^{-1}$; mass stays kilograms. Only with $\hbar = 1$ as well do they meet.`,
      },
      hints: [t`Replace every second by metres and see what is left: energy $\text{kg m}^2\text{s}^{-2} \to$ kg.`],
      teach: 'With c = 1, energy, momentum and mass share a unit, as do time and length; speeds are pure numbers.',
      explain: t`$E$: $\text{kg m}^2/\text{s}^2 \to$ kg. $p$: $\text{kg m/s} \to$ kg. Time and length: m. Speed: pure number. Acceleration is $\text{m}^{-1}$; frequency is $\text{m}^{-1}$, which is not a mass without $\hbar = 1$.`,
    }),
    expr({
      id: 'restore-energy', difficulty: 2,
      prompt: t`With $c = 1$, $E^2 = p^2 + m^2$. Restore $c$ to get the energy in SI units, $E$ in joules, $p$ in kg m/s, $m$ in kg.`,
      visual: {
        type: 'graph',
        params: { x: [0, 3], y: [0, 3.4], aspect: 'wide', xlabel: 'pc', ylabel: 'E', curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.2, label: 'E² = (pc)² + (mc²)²', labelAt: 2, labelDx: -150, labelDy: -14 }, { fn: 'x', color: 'warn', dash: true, width: 1.2 }] },
        caption: t`The mass shell in units where $mc^2 = 1$: energy against $pc$. Every term must be an energy squared.`,
      },
      answer: 'sqrt(p^2 c^2 + m^2 c^4)', answerTeX: t`\sqrt{p^2c^2 + m^2c^4}`, lhs: 'E',
      vars: { p: [0.5, 3], m: [0.5, 3], c: [1.5, 4] },
      errors: [{ answer: 'sqrt(p^2 c^2 + m^2 c^2)', feedback: t`$m^2c^2$ has units of momentum squared, not energy squared: the mass term needs $c^4$.` }, { answer: 'sqrt(p^2 + m^2 c^4)', feedback: t`$p^2$ has units $(\text{kg m/s})^2$; multiply by $c^2$ to make it an energy squared.` }],
      hints: [t`$E^2$ is in $\text{J}^2 = (\text{kg m}^2/\text{s}^2)^2$. What power of $c$ turns $p^2$ into that? And $m^2$?`, t`$p\,c$ is an energy; $m\,c^2$ is an energy.`],
      teach: 'Restore c by making every term carry the same SI unit: momentum times c and mass times c² are energies.',
      explain: t`$E = \sqrt{p^2c^2 + m^2c^4}$: each term inside is an energy squared, and setting $c = 1$ gives back $E^2 = p^2 + m^2$.`,
    }),
    num({
      id: 'range', difficulty: 2,
      gen(r) {
        const [what, m] = r.pick([['the pion (139.570 MeV), which carries the long-range part of the nuclear force', 139.57039], ['the W boson (80.37 GeV), which carries the weak force', 80369.2], ['the kaon (493.68 MeV)', 493.677]]);
        const ans = HBARC / m;
        return {
          prompt: t`With $\hbar = c = 1$ a mass is an inverse length, and a force carried by a particle of mass $m$ reaches about $1/m$. Put the constants back: $\hbar/(mc) = \hbar c/(mc^2)$, with $\hbar c = 197.327$ MeV fm. What is that range for ${what}, in fm?`,
          visual: natural({ mark: what.startsWith('the pion') ? 'pion' : what.startsWith('the W') ? 'W' : null, hide: true }),
          answer: ans, units: 'fm', tol: { rel: 0.003 },
          errors: [{ value: m / HBARC, feedback: t`Invert: a heavier particle gives a *shorter* range, $\hbar c/mc^2$.` }],
          hints: [t`Divide $197.327$ MeV fm by the rest energy in MeV.`],
          teach: 'With ħ = c = 1, the length that goes with a mass m is ħ/mc = ħc/mc², with ħc = 197.327 MeV fm.',
          explain: t`$197.327/${m} = ${nice(ans, 4)}$ fm. ${m > 1e4 ? 'Two-thousandths of a proton’s size: that is why the weak force is weak at low energies.' : 'About the size of a nucleon, which is why nuclear forces stop at the edge of a nucleus.'}`,
        };
      },
    }),
    num({
      id: 'width-to-life', difficulty: 2,
      gen(r) {
        const [what, G] = r.pick([['the Z boson', 2.4955], ['the W boson', 2.085], ['the top quark', 1.42]]);
        const ans = HBAR / G;
        return {
          prompt: t`Particle tables quote short-lived particles by their decay width $\Gamma$, an energy; with $\hbar = 1$ the lifetime is simply $1/\Gamma$. For ${what}, $\Gamma = ${G}$ GeV. Restore $\hbar$ ($6.582\times10^{-25}$ GeV s) to find the lifetime, in seconds.`,
          visual: natural({ caption: t`With $\hbar = c = 1$ energies, masses, inverse lengths and inverse times are all one kind of quantity. A width of a few GeV is a length of about $10^{-16}$ m — or a time of about $10^{-25}$ s.` }),
          answer: ans, units: 's', tol: { rel: 0.003 },
          errors: [{ value: G / HBAR, feedback: t`A lifetime is $\hbar/\Gamma$: a wider resonance lives *shorter*.` }],
          hints: [t`$\tau = \hbar/\Gamma$: GeV s divided by GeV leaves seconds.`],
          teach: 'A decay width Γ is an inverse lifetime with ħ = 1: τ = ħ/Γ.',
          explain: t`$\tau = ${tex(HBAR, 4)}/${G} = ${tex(ans, 3)}$ s — light takes about $6\times10^{-24}$ s to cross a proton, more than ten times longer.`,
        };
      },
    }),
    mcq({
      id: 'gev-length', difficulty: 2,
      prompt: t`In natural units ($\hbar = c = 1$) energies are in GeV. In what unit are lengths measured, and how big is it?`,
      visual: natural({}),
      choices: [t`$\text{GeV}^{-1}$, about $0.197$ fm`, t`GeV, about $0.197$ fm`, t`$\text{GeV}^{-1}$, about $197$ m`, t`$\text{GeV}^{-2}$, about $0.389$ mb`],
      answer: 0,
      why: {
        1: 'Length is an inverse energy: a bigger energy probes a smaller distance.',
        2: t`$\hbar c = 0.197$ GeV fm, so $1\ \text{GeV}^{-1} = 0.197$ fm, not metres.`,
        3: t`$\text{GeV}^{-2}$ is an area — the unit of a cross section, $0.389$ mb. A length is $\text{GeV}^{-1}$.`,
      },
      hints: [t`$\hbar c$ has units of energy times length, so length $=$ $\hbar c$ / energy.`],
      teach: 'With ħ = c = 1, lengths are inverse energies: 1 GeV⁻¹ = 0.1973 fm.',
      explain: t`$1\ \text{GeV}^{-1}\times\hbar c = 0.197327\ \text{GeV fm}/\text{GeV} = 0.1973$ fm. Higher energies resolve shorter distances — the reason colliders keep growing.`,
    }),
    num({
      id: 'cross-section', difficulty: 3,
      gen(r) {
        const rs = r.pick([10.58, 29, 35]);
        const ans = 4 * Math.PI * ALPHA * ALPHA / (3 * rs * rs) * GEV2MB * 1e6;
        return {
          prompt: t`In natural units the cross section for $e^+e^- \to \mu^+\mu^-$ is $\sigma = \dfrac{4\pi\alpha^2}{3s}$, with $\alpha = 1/137.036$ and $s$ in $\text{GeV}^2$ — so $\sigma$ comes out in $\text{GeV}^{-2}$. With $1\ \text{GeV}^{-2} = 0.3894$ mb, what is $\sigma$ at $\sqrt{s} = ${rs}$ GeV, in nanobarns? Give the number. (1 mb $= 10^{6}$ nb.)`,
          visual: {
            type: 'graph',
            params: { x: [5, 40], y: [0, 3.6], aspect: 'wide', xlabel: '√s (GeV)', ylabel: 'σ (nb)', curves: [{ fn: `${r6(4 * Math.PI * ALPHA * ALPHA / 3 * GEV2MB * 1e6)}/x^2`, color: 'accent', width: 2.2 }], vlines: [{ x: rs, color: 'gold', label: `√s = ${rs} GeV` }] },
            caption: 'The lowest-order QED cross section falling as 1/s. It ignores the Z boson, whose resonance near 91 GeV dominates at higher energy.',
          },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ans / 1e6, feedback: 'That is in millibarns. 1 mb is a million nanobarns.' }, { value: 4 * Math.PI * ALPHA * ALPHA / (3 * rs) * GEV2MB * 1e6, feedback: t`$s$ is $(\sqrt{s})^2 = ${nice(rs * rs, 4)}\ \text{GeV}^2$, not $${rs}$.` }],
          hints: [t`$s = ${nice(rs * rs, 4)}\ \text{GeV}^2$ and $4\pi\alpha^2/3 = ${tex(4 * Math.PI * ALPHA * ALPHA / 3, 4)}$.`, t`Multiply the result in $\text{GeV}^{-2}$ by $0.3894\times10^{6}$ nb.`],
          teach: 'Natural-unit cross sections come out in GeV⁻²; restore ħ and c with 1 GeV⁻² = 0.3894 mb.',
          explain: t`$\sigma = ${tex(4 * Math.PI * ALPHA * ALPHA / (3 * rs * rs), 4)}\ \text{GeV}^{-2} = ${nice(ans, 3)}$ nb — the familiar $86.8\ \text{nb}/s[\text{GeV}^2]$ of collider physics.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tau', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([5, 10, 20]);
        const ans = p * 1000 / 1776.86 * 87.03e-3;
        return {
          prompt: t`A detector paper gives the tau lepton’s mean decay length as $L = (p/m)\,\tau$ in natural units. For a tau of momentum $${p}$ GeV/$c$ ($mc^2 = 1776.86$ MeV, $c\tau = 87.03\ \mu\text{m}$), restore $c$ and find $L$ in millimetres.`,
          visual: lattice({ only: ['length', 'time', 'speed', 'pure number'], caption: t`$L$ and $\tau$ share a diagonal when $c = 1$; restoring $c$ turns $\tau$ into the length $c\tau$ and $p/m$ into the pure number $p/mc$.` }),
          answer: ans, units: 'mm', tol: { rel: 0.003 },
          errors: [{ value: 87.03e-3, feedback: t`That is $c\tau$ alone. Multiply by $p/mc = \gamma\beta$.` }],
          hints: [t`In SI, $p/m$ is a speed; divide it by $c$ to get a pure number, and give the leftover $c$ to $\tau$.`, t`$L = \dfrac{p}{mc}\,c\tau$, with $p/mc = ${p * 1000}/1776.86$.`],
          teach: 'A decay length is (p/mc)·cτ: the restored form of L = (p/m)τ.',
          explain: t`$p/mc = ${p * 1000}/1776.86 = ${nice(p * 1000 / 1776.86, 4)}$, so $L = ${nice(p * 1000 / 1776.86, 4)}\times87.03\ \mu\text{m} = ${nice(ans, 3)}$ mm — which is why tau decays need silicon vertex detectors a few centimetres from the beam.`,
        };
      },
    }),
    num({
      id: 'cp-propellant', difficulty: 2, transfer: true,
      gen(r) {
        const [engine, ve] = r.pick([['a hydrogen–oxygen engine', 4400], ['a kerosene–oxygen engine', 3300], ['a xenon ion thruster', 30000]]);
        const ans = 0.5 * ve * ve / (C * C);
        return {
          prompt: t`With $c = 1$ an energy per unit mass is a pure number: the fraction of the propellant’s rest energy it represents. For ${engine} with exhaust speed $${ve}$ m/s, what is the exhaust’s kinetic energy per kilogram, $\tfrac12 v_e^2$, as a fraction of $c^2$?`,
          visual: lattice({ mark: 'J/kg', caption: t`Energy per mass, $\text{J/kg} = \text{m}^2/\text{s}^2$, sits on the same diagonal as a pure number: divide by $c^2$.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ve * ve / (C * C), feedback: t`Kinetic energy per kilogram is $\tfrac12 v_e^2$ — keep the half.` }, { value: 0.5 * ve / C, feedback: t`Divide by $c^2$, not $c$: $\text{m}^2/\text{s}^2 \div \text{m}^2/\text{s}^2$.` }],
          hints: [t`$\tfrac12 v_e^2$ is in $\text{m}^2/\text{s}^2$; $c^2$ too.`],
          teach: 'With c = 1, specific energy is dimensionless: v²/c² measures it against rest energy.',
          explain: t`$\tfrac12(${ve})^2/c^2 = ${tex(ans, 3)}$. Chemical and electric rockets turn less than a billionth of their propellant’s rest energy into motion; nuclear fission would reach about $10^{-3}$, and only matter–antimatter would approach 1.`,
        };
      },
    }),
    mcq({
      id: 'cp-restore-tau', difficulty: 2,
      prompt: t`With $c = 1$ a moving clock’s proper time is $d\tau = \sqrt{dt^2 - dx^2}$. Which is the same formula in SI units?`,
      visual: lattice({ only: ['length', 'time'], caption: t`Time and length: the same unit only when $c = 1$.` }),
      choices: [t`$d\tau = \sqrt{dt^2 - dx^2/c^2}$`, t`$d\tau = \sqrt{dt^2 - c^2dx^2}$`, t`$d\tau = \sqrt{c^2dt^2 - dx^2}$`, t`$d\tau = c\sqrt{dt^2 - dx^2}$`],
      answer: 0,
      why: {
        1: t`$c^2dx^2$ is in $\text{m}^4/\text{s}^2$; it cannot be subtracted from $dt^2$ in $\text{s}^2$.`,
        2: t`$\sqrt{c^2dt^2 - dx^2}$ is a length, $c\,d\tau$, not the time $d\tau$.`,
        3: t`$dt^2 - dx^2$ already mixes seconds and metres: it has no SI meaning.`,
      },
      hints: ['Make every term under the root a time squared: what turns dx (metres) into seconds?'],
      teach: 'Restore c so every term has one SI unit; then check that c = 1 gives back the original.',
      explain: t`$dx/c$ is a time, so $d\tau = \sqrt{dt^2 - dx^2/c^2} = dt\sqrt{1 - v^2/c^2}$. The option with $c^2dt^2 - dx^2$ is also correct dimensionally, but it is $c\,d\tau$.`,
    }),
  ],
  sources: [
    { label: 'CODATA 2018: ħc = 197.3269804 MeV fm, ħ = 6.582119569×10⁻²² MeV s', url: 'https://physics.nist.gov/cuu/Constants/' },
    { label: 'Particle Data Group, Review of Particle Physics: physical constants; Z, W, top and τ properties', url: 'https://pdg.lbl.gov/' },
    { label: 'Hartle, Gravity, §1.5 and Appendix A (units)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
  ],
});
