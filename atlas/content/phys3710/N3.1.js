// Q-values and cross sections, at Krane’s level. Q from atomic masses;
// endothermic thresholds K_th = −Q(1 + m_a/m_X), and why momentum makes the
// threshold exceed |Q| (Rutherford’s ¹⁴N(α,p)¹⁷O, the first artificial
// transmutation, as the worked example); cross sections in barns and
// thin-target rates; the 1/v law; neutron activation for measuring a
// reactor’s flux; neutron detectors (³He, ¹⁰B, ⁶Li) and the mean free path
// of thermal against fast neutrons in uranium-235. PHYS 2220 A1.2 did the
// D–T fusion Q-value; not repeated.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { U, KE2, NA, mass, Q, uni, r6, seg, label } from './_nuclear.js';

const t = String.raw;
const QR = Q(['He-4', 'N-14'], ['O-17', 'H-1']), KTH = -QR * (1 + mass('He-4') / mass('N-14'));
const VB = (2 * 7 * KE2) / (1.2 * (Math.cbrt(4) + Math.cbrt(14)));      // Coulomb barrier α + ¹⁴N, MeV (centre of mass)
const N235 = (19.05 / 235.0439) * NA;                                   // U-235 nuclei per cm³ in the metal

/** Two levels — the reactants and the products — with the Q-value between them (heights schematic). */
function levels(before, after, q, { showQ = false, caption } = {}) {
  const up = q < 0, yb = up ? 0.6 : 2.6, ya = up ? 2.6 : 0.6;
  return {
    type: 'graph',
    params: {
      x: [0, 10], y: [0, 3.4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [seg(0.8, yb, 3.8, yb, 'accent', 3), seg(6.2, ya, 9.2, ya, 'warn', 3), seg(3.8, yb, 9.2, yb, 'ink4', 1.2, true)],
      arrows: [{ from: [7.7, up ? yb + 0.05 : yb - 0.05], to: [7.7, up ? ya - 0.08 : ya + 0.08], color: up ? 'bad' : 'good', width: 2 }, { from: [4, yb], to: [6, ya], color: 'ink3', width: 1.4 }],
      points: [label(2.3, yb, before, 'accent', 0, -13, 'center'), label(7.7, ya, after, 'warn', 0, up ? -13 : 14, 'center'),
        label(7.85, 1.6, showQ ? `${up ? '' : '+'}${fmt(q, 4)} MeV` : (up ? 'energy needed: ?' : 'energy released: ?'), up ? 'bad' : 'good', 6, 0, 'left')],
    },
    caption: caption ?? `Rest energies before and after (schematic heights): the products lie ${up ? 'higher, so the reaction absorbs energy (Q < 0)' : 'lower, so the reaction releases energy (Q > 0)'}.`,
  };
}

/** Fission cross sections of uranium-235 and -238 against neutron energy, on log–log axes (schematic: resonances not drawn). */
function sigmaPlot({ slider = false, mark = null, caption } = {}) {
  return {
    type: 'graph',
    params: {
      x: [-3, 7.3], y: [-2, 4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'neutron energy (eV)', ylabel: 'cross section (barns)',
      curves: [
        { fn: 'log10(585*sqrt(0.0253/10^x) + 1.2)', color: 'accent', width: 2.6, label: '²³⁵U fission', labelAt: -1.2, labelDx: 8, labelDy: -8 },
        { fn: 'log10(0.55/(1 + exp(-(10^x - 1400000)/150000)) + 0.000001)', domain: [5.4, 7.3], color: 'warn', width: 2.6, label: '²³⁸U fission', labelAt: 6.25, labelDx: -6, labelDy: 16, labelAlign: 'right' },
        { fn: 'log10(2.68*sqrt(0.0253/10^x))', domain: [-3, 0.5], color: 'warn', width: 1.6, dash: true, label: '²³⁸U capture', labelAt: -2.4, labelDy: 14 },
      ],
      hlines: [{ y: r6(Math.log10(Math.PI * (1.2 * Math.cbrt(235)) ** 2 / 100)), label: 'πR² of the nucleus, 1.7 b', color: 'ink3' }],
      vlines: [{ x: r6(Math.log10(0.0253)), label: 'thermal', color: 'good' }, { x: r6(Math.log10(2e6)), label: 'fast', color: 'gold' }, ...(mark !== null ? [{ x: mark, color: 'violet' }] : []), ...(slider ? [{ x: 'lE', color: 'violet' }] : [])],
      ...(slider ? {
        sliders: [{ key: 'lE', label: t`Neutron energy, $\log_{10}(E/\text{eV})$`, min: -3, max: 7.3, step: 0.01, value: -1.6, explain: 'From cold neutrons to the fastest fission neutrons. Thermal neutrons, at room temperature, have 0.025 eV.' }],
        readouts: [
          { label: t`$E$`, expr: '10^lE', unit: t`\text{eV}`, digits: 3 },
          { label: t`$\sigma_f({}^{235}\text{U})$`, expr: '585*sqrt(0.0253/10^lE) + 1.2', unit: t`\text{b}`, digits: 3 },
          { label: t`neutron speed`, expr: 'sqrt(2*10^lE*1.602e-19/1.675e-27)', unit: t`\text{m/s}`, digits: 3 },
        ],
      } : {}),
    },
    caption: caption ?? 'Neutron cross sections against energy, both on log scales — schematic. Uranium-235’s fission cross section follows the 1/v law (585 b at 0.0253 eV) and levels off near 1 b at MeV energies; between about 1 eV and 1 keV it is a forest of resonances, not drawn. Uranium-238 fissions only above about 1 MeV. ENDF thermal values.',
  };
}

/** Activation: A/A_sat = 1 − e^(−λt) during irradiation, in units of the product’s half-life. */
function activation(tIrr, T, unit, { caption } = {}) {
  const xm = Math.max(5, Math.ceil((tIrr / T) * 1.5));
  return {
    type: 'graph',
    params: {
      x: [0, xm], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: `irradiation time (half-lives of the product, ${fmt(T, 4)} ${unit} each)`, ylabel: 'activity ÷ saturation',
      curves: [{ fn: '1 - 2^(-x)', color: 'accent', width: 2.6 }],
      hlines: [{ y: 1, label: 'saturation: σΦN', color: 'gold' }],
      vlines: [{ x: r6(tIrr / T), label: 'removed', color: 'ink3' }],
    },
    caption: caption ?? 'A foil in a neutron flux: atoms of the product are made at the steady rate σΦN and decay at their own rate, so the activity climbs toward σΦN (saturation), as a daughter does in secular equilibrium. The foil’s own burn-up is neglected.',
  };
}

export default lesson({
  id: 'phys3710.N3.1',
  title: 'Q-values and cross sections',
  minutes: 18, difficulty: 3,
  intro: t`A nuclear reaction $a + X \to Y + b$ is written $X(a, b)Y$. Two numbers decide what happens. The **Q-value** — mass in minus mass out — says whether it releases energy or must be paid for; if $Q < 0$, the projectile needs more than $|Q|$, because momentum must be conserved too. The **cross section** $\sigma$ says how likely it is: an effective target area, measured in barns ($1\ \text{b} = 10^{-28}\ \text{m}^2$, “as big as a barn” for a nucleus). A beam crossing a thin target makes reactions at the rate

$$R = \sigma\,I\,n\,x$$

and nothing in the physics says $\sigma$ must resemble the nucleus’s size: slow neutrons see uranium-235 as 300 times larger than it is.`,
  symbols: [
    { tex: 'R', text: 'the number of reactions per second' },
    { tex: '\\sigma', text: t`the cross section, in barns: $1\ \text{b} = 10^{-28}\ \text{m}^2 = 10^{-24}\ \text{cm}^2$` },
    { tex: 'I', text: 'the beam: projectiles per second (a current divided by their charge, or a neutron flux times an area)' },
    { tex: 'n', text: 'the number density of target nuclei, per m³ (or per cm³)' },
    { tex: 'x', text: 'the target’s thickness, thin enough that the beam is barely depleted; $nx$ is nuclei per unit area' },
  ],
  why: 'Every reactor, neutron detector, isotope factory and fusion design is a book-keeping of Q-values and cross sections.',
  visual: {
    ...sigmaPlot({ slider: true }),
    title: 'How big is a nucleus, to a neutron?',
    lead: t`The blue curve is the chance that a neutron of a given energy splits a uranium-235 nucleus, expressed as an area; the grey line is the nucleus’s actual cross-sectional area. Slide the neutron’s energy from cold to fast.`,
    tasks: [
      'At thermal energy (0.025 eV, 2200 m/s) the fission cross section is 585 b — over 300 times the nucleus’s area. The slower the neutron, the bigger it looks: σ ∝ 1/v.',
      'Slide to 2 MeV, where fission neutrons are born: the cross section has fallen to about 1 b. This is why most reactors slow their neutrons down.',
      'Uranium-238 (orange) only fissions above about 1 MeV, and even then rarely; at thermal energies it just captures neutrons, a few barns’ worth.',
    ],
  },
  example: {
    prompt: t`In 1919 Rutherford made the first artificial nuclear reaction, ${'$'}{}^{14}\text{N}(\alpha, p){}^{17}\text{O}$, firing alpha particles into nitrogen. From the atomic masses — helium-4 4.0026033 u, nitrogen-14 14.0030740 u, oxygen-17 16.9991318 u, hydrogen-1 1.0078250 u — find the Q-value and the least alpha energy that can make the reaction go.`,
    visual: levels('α + ¹⁴N', '¹⁷O + p', QR, { showQ: true, caption: 'Rest energies before and after (schematic heights): the products are heavier by 1.19 MeV, so the reaction must be paid for.' }),
    steps: [
      { label: 'Q-value', text: t`$Q = [M({}^4\text{He}) + M({}^{14}\text{N}) - M({}^{17}\text{O}) - M({}^1\text{H})]c^2 = (18.0056773 - 18.0069568)\times931.494 = ${fmt(QR, 4)}$ MeV. Atomic masses work: 9 electrons on each side.` },
      { label: 'Why more than |Q|', text: t`The alpha brings momentum, so the products must move; their kinetic energy cannot be turned into mass. Only the energy in the centre-of-mass frame is available: $K_{cm} = K_\alpha\,\dfrac{m_X}{m_a + m_X}$ (non-relativistically).` },
      { label: 'Threshold', text: t`Set $K_{cm} = |Q|$: $K_{th} = -Q\left(1 + \dfrac{m_a}{m_X}\right) = ${fmt(-QR, 4)}\times\left(1 + \dfrac{4.0026}{14.0031}\right) = ${fmt(KTH, 4)}$ MeV. At threshold the products move off together at the centre-of-mass velocity.` },
      { label: 'The barrier', text: t`Quantum tunnelling aside, the alpha must also come close: the Coulomb barrier of $\alpha + {}^{14}\text{N}$ at contact is $2\times7\times1.440/[1.2(4^{1/3} + 14^{1/3})] \approx ${fmt(VB, 2)}$ MeV in the centre of mass, about $${fmt((VB * 18) / 14, 2)}$ MeV in the lab.` },
      { label: 'Sense check', text: t`Rutherford’s alphas, from radium C′ (polonium-214), had 7.7 MeV: above both the threshold and the barrier. A threshold always exceeds $|Q|$, by the fraction $m_a/m_X$: 29% here, under half a per cent for a proton on uranium.` },
    ],
    answer: t`$Q = ${fmt(QR, 4)}$ MeV; the threshold is $${fmt(KTH, 4)}$ MeV of alpha kinetic energy.`,
  },
  practice: [
    num({
      id: 'q-value', difficulty: 1,
      gen(r) {
        const [X, a, Y, b, name, use] = r.pick([
          ['Li-6', 'n', 'H-3', 'He-4', t`${'$'}{}^6\text{Li}(n, \alpha){}^3\text{H}$`, 'lithium-6 glass neutron detectors and making tritium for fusion'],
          ['B-10', 'n', 'Li-7', 'He-4', t`${'$'}{}^{10}\text{B}(n, \alpha){}^7\text{Li}$`, 'boron counters and reactor control rods'],
          ['He-3', 'n', 'H-3', 'H-1', t`${'$'}{}^3\text{He}(n, p){}^3\text{H}$`, 'helium-3 proportional counters'],
          ['Co-59', 'n', 'Co-60', null, t`${'$'}{}^{59}\text{Co}(n, \gamma){}^{60}\text{Co}$`, 'making cobalt-60 for radiotherapy'],
        ]);
        const out = b ? [Y, b] : [Y], q = Q([a, X], out);
        return {
          prompt: t`Find the Q-value of ${name}, used in ${use}. Atomic masses: ${[X, Y, ...(b ? [b] : [])].map((k) => `${k} ${fmt(mass(k), 11)} u`).join(', ')}; the neutron 1.008664916 u. Answer in MeV.`,
          answer: q, units: 'MeV', tol: { rel: 0.003 },
          errors: [{ value: -q, feedback: 'Q is mass before minus mass after: a positive Q means energy is released.' }],
          hints: [t`$Q = [m_n + M(X) - M(Y)${b ? ' - M(b)' : ''}]c^2$.`, 'Multiply the mass difference in u by 931.494 MeV.'],
          teach: 'Q = (mass before − mass after)c²; slow neutrons can only start reactions with Q > 0, which makes them ideal for detectors.',
          explain: t`$Q = ${fmt(q, 4)}$ MeV. A thermal neutron brings only 0.025 eV, so the products share essentially just $Q$: ${b ? 'two charged particles with megaelectronvolt energies that ionize a gas or a crystal — easy to detect' : 'the energy leaves as gamma rays, and the cobalt-60 made is itself radioactive'}.`,
          visual: levels(`n + ${uni(X)}`, b ? `${uni(Y)} + ${b === 'He-4' ? 'α' : b === 'H-1' ? 'p' : uni(b)}` : `${uni(Y)} + γ`, q),
        };
      },
    }),
    num({
      id: 'threshold', difficulty: 2,
      gen(r) {
        const [X, Y, name, use] = r.pick([['Li-7', 'Be-7', t`${'$'}{}^7\text{Li}(p, n){}^7\text{Be}$`, 'a standard source of monoenergetic neutrons'], ['H-3', 'He-3', t`${'$'}{}^3\text{H}(p, n){}^3\text{He}$`, 'calibrating neutron detectors'], ['C-13', 'N-13', t`${'$'}{}^{13}\text{C}(p, n){}^{13}\text{N}$`, 'making nitrogen-13 for PET']]);
        const q = Q(['H-1', X], ['n', Y]), K = -q * (1 + mass('H-1') / mass(X));
        return {
          prompt: t`The reaction ${name} (${use}) has $Q = ${fmt(q, 4)}$ MeV. The target nucleus has mass ${fmt(mass(X), 6)} u and the proton 1.007825 u. What is the threshold kinetic energy of the proton in the lab, in MeV?`,
          answer: K, units: 'MeV', tol: { rel: 0.002 },
          errors: [{ value: -q, feedback: t`At exactly $|Q|$ the products would have to be at rest, but momentum forbids it. Multiply by $1 + m_a/m_X$.` }, { value: -q * (1 + mass(X) / mass('H-1')), feedback: t`The factor is $1 + m_a/m_X$ (projectile over target), not the other way round.` }],
          hints: ['Only the kinetic energy in the centre-of-mass frame can make mass.', t`$K_{th} = -Q\left(1 + \dfrac{m_p}{m_X}\right) = ${fmt(-q, 4)}\times\left(1 + \dfrac{1.007825}{${fmt(mass(X), 6)}}\right)$.`],
          teach: t`An endothermic threshold is $|Q|(1 + m_a/m_X)$: the lighter the projectile relative to the target, the closer to $|Q|$.`,
          explain: t`$K_{th} = ${fmt(K, 4)}$ MeV. Just above threshold the neutrons all fly forward in a narrow cone, with nearly the centre-of-mass velocity — which is why ${X === 'Li-7' ? 'lithium-7' : X === 'H-3' ? 'tritium' : 'carbon-13'} targets make neutrons of well-defined energy.`,
          visual: levels(`p + ${uni(X)}`, `${uni(Y)} + n`, q, { showQ: true, caption: 'Rest energies before and after (schematic heights). The products are heavier; the projectile must bring more than the difference, because momentum must be conserved.' }),
        };
      },
    }),
    num({
      id: 'thin-target', difficulty: 2,
      gen(r) {
        const I = r.pick([0.5, 1, 2]), mg = r.pick([5, 10, 20]), mb = r.pick([200, 300]);
        const beam = (I * 1e-6) / 1.602176634e-19, nx = ((mg * 1e-3) / mass('Li-7')) * NA, R = mb * 1e-27 * beam * nx;
        return {
          prompt: t`A ${I} μA proton beam strikes a thin lithium-7 target of ${mg} mg/cm² (7.016 g/mol). At this energy ${'$'}{}^7\text{Li}(p, n){}^7\text{Be}$ has a cross section of ${mb} mb (millibarns). How many neutrons per second does the target make?`,
          answer: R, units: 's^-1', tol: { rel: 0.01 },
          errors: [{ value: R * 1000, feedback: t`A millibarn is $10^{-3}$ b $= 10^{-27}\ \text{cm}^2$.` }, { value: R / 1000, feedback: 'Convert mg/cm² to g/cm² (divide by 1000) — and no more.' }],
          hints: [t`Protons per second: $I/e = ${tex(beam, 3)}$. Nuclei per cm²: $nx = \dfrac{${mg}\times10^{-3}}{7.016}\times6.022\times10^{23}$.`, t`$R = \sigma\,(I/e)\,nx$ with $\sigma = ${mb}\times10^{-27}\ \text{cm}^2$.`],
          teach: 'Thin-target rate = σ × beam particles per second × target nuclei per unit area.',
          explain: t`$nx = ${tex(nx, 3)}\ \text{cm}^{-2}$ and $R = (${mb}\times10^{-27})(${tex(beam, 3)})(${tex(nx, 3)}) = ${tex(R, 3)}\ \text{s}^{-1}$: only one proton in ${tex(beam / R, 2)} reacts. The rest lose their energy as heat — a few watts to remove from a few square centimetres.`,
          visual: { type: 'graph', params: { x: [0, 10], y: [0, 4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
            shade: [{ fn: '3.4', lower: '0.6', from: 6, to: 6.35, color: 'violet', alpha: 0.5 }],
            arrows: [0.9, 1.5, 2.1, 2.7, 3.1].map((y) => ({ from: [0.6, y], to: [5.8, y], color: 'accent', width: 1.6 })).concat([{ from: [6.5, 2.1], to: [9.2, 3.2], color: 'gold', width: 2 }]),
            points: [label(3.2, 3.55, 'proton beam, I/e per second', 'accent', 0, 0, 'center'), label(6.17, 0.35, 'Li-7 foil, nx per cm²', 'violet', 0, 0, 'center'), label(9.2, 3.2, 'neutron', 'gold', 0, -10, 'right')] },
            caption: 'A beam crossing a thin target. Each nucleus presents an effective area σ; the fraction of the beam that reacts is σ·nx — tiny here. Not to scale.' },
        };
      },
    }),
    mcq({
      id: 'barn', difficulty: 2,
      prompt: t`A uranium-235 nucleus has a geometric cross section $\pi R^2 = \pi(1.2\times235^{1/3}\ \text{fm})^2 \approx 1.7$ b, yet its fission cross section for thermal neutrons is 585 b. How can a nucleus “look” 300 times bigger than it is?`,
      choices: [
        'A cross section is a probability expressed as an area, not a size: a slow neutron is a wave about 10⁴ times wider than the nucleus, it lingers near it (σ ∝ 1/v), and absorbing it is a resonance-like process',
        'The neutron is attracted by the nucleus’s charge and pulled in from far away',
        'The electron cloud of the uranium atom also captures neutrons',
        'Thermal neutrons are larger particles than fast ones',
      ],
      answer: 0,
      why: {
        1: 'The neutron has no charge; there is no long-range pull.',
        2: 'Electrons barely interact with neutrons; the process is nuclear.',
        3: 'A neutron’s size, about 0.8 fm, does not change with speed; its wavelength does.',
      },
      hints: ['What is a slow neutron’s de Broglie wavelength compared with a nucleus?', 'The cross section measures how often a reaction happens, divided by the flux. Is that the same as the size?'],
      teach: 'Cross sections are reaction probabilities in units of area: quantum waves, lingering times and resonances let them exceed the geometric size enormously.',
      explain: t`At 0.025 eV the neutron’s reduced wavelength $\hbar/p$ is about $2.9\times10^4$ fm, so the classical picture of a projectile hitting a target fails. The neutron spends a time $\propto 1/v$ near the nucleus, and capture into the compound nucleus uranium-236 is strongly favoured. Charged particles at low energy have the opposite problem: the Coulomb barrier makes their cross sections vanishingly small.`,
      visual: sigmaPlot({ mark: r6(Math.log10(0.0253)), caption: 'Uranium-235’s fission cross section against neutron energy (log scales, schematic, resonances not drawn), with the geometric area of the nucleus for comparison.' }),
    }),
    num({
      id: 'one-over-v', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 10, 100, 1000]), s = 3840 * Math.sqrt(0.0253 / E);
        return {
          prompt: t`Boron-10 absorbs thermal neutrons (0.0253 eV) with a cross section of 3840 b, following the $1/v$ law up to tens of keV. What is its cross section for neutrons of ${E} eV? Give the number of barns.`,
          answer: s, tol: { rel: 0.005 },
          errors: [{ value: 3840 * (0.0253 / E), feedback: t`$\sigma \propto 1/v \propto 1/\sqrt E$: take the square root of the energy ratio.` }],
          hints: [t`$v \propto \sqrt E$, so $\sigma(E) = \sigma_0\sqrt{E_0/E}$.`, t`$\sigma = 3840\sqrt{0.0253/${E}}$ b.`],
          teach: 'Below the resonances absorption cross sections follow 1/v: the chance of capture is proportional to the time spent near the nucleus.',
          explain: t`$\sigma = 3840\times${fmt(Math.sqrt(0.0253 / E), 3)} = ${fmt(s, 3)}$ b. Because the absorption rate per atom, $\sigma v\,n_{\text{neutrons}}$, is then independent of speed, a boron detector counts neutron *density* whatever their energy — a handy property for flux monitors.`,
          visual: { type: 'graph', params: { x: [-2, 4], y: [0, 4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'neutron energy (eV)', ylabel: 'σ (barns)',
            curves: [{ fn: 'log10(3840*sqrt(0.0253/10^x))', color: 'accent', width: 2.6, label: '¹⁰B(n,α): σ ∝ 1/v', labelAt: 2.2, labelDy: -12 }],
            points: [{ x: r6(Math.log10(0.0253)), y: r6(Math.log10(3840)), r: 5, color: 'gold', label: '3840 b at 0.0253 eV', labelDx: 10, labelDy: -6 }], vlines: [{ x: r6(Math.log10(E)), label: `${E} eV`, color: 'ink3' }] },
            caption: 'The 1/v law on log–log axes is a straight line of slope −½. Boron-10 follows it closely up to tens of keV.' },
        };
      },
    }),
    num({
      id: 'activation', difficulty: 3,
      gen(r) {
        const h = r.pick([6, 12, 24]), mg = r.pick([10, 20, 50]), A = r.pick([2e6, 5e6, 1e7]);
        const T = 2.6941 * 24, N = ((mg * 1e-3) / mass('Au-197')) * NA, f = 1 - 2 ** (-h / T), phi = A / f / (98.65e-24 * N);
        return {
          prompt: t`To measure a research reactor’s neutron flux, a ${mg} mg gold foil (100% gold-197, 196.97 g/mol) is irradiated for ${h} hours. ${'$'}{}^{197}\text{Au}(n,\gamma){}^{198}\text{Au}$ has $\sigma = 98.65$ b for thermal neutrons; gold-198 has a half-life of 2.694 days. Right after removal the foil’s activity is $${tex(A, 2)}$ Bq. What is the thermal flux, in neutrons per cm² per second?`,
          answer: phi, units: 'cm^-2 s^-1', tol: { rel: 0.01 },
          errors: [{ value: A / (98.65e-24 * N), feedback: t`The foil had not reached saturation: divide by $1 - 2^{-t/T_{1/2}}$ first.` }],
          hints: [t`During irradiation $A(t) = \sigma\Phi N\left(1 - 2^{-t/T_{1/2}}\right)$.`, t`$N = \dfrac{${mg}\times10^{-3}}{196.97}\times6.022\times10^{23} = ${tex(N, 3)}$ and $1 - 2^{-${h}/${fmt(T, 4)}} = ${fmt(f, 4)}$.`],
          teach: 'Activation grows toward the saturation activity σΦN; measuring a foil’s activity measures the flux.',
          explain: t`$\sigma N = 98.65\times10^{-24}\times${tex(N, 3)} = ${tex(98.65e-24 * N, 3)}\ \text{cm}^2$; saturation activity $= ${tex(A / f, 3)}$ Bq; $\Phi = ${tex(phi, 3)}\ \text{cm}^{-2}\,\text{s}^{-1}$. Research reactors run at $10^{12}$–$10^{15}$; the foil is a cheap, passive flux meter.`,
          visual: activation(h / 24, 2.6941, 'd', { caption: 'The gold-198 activity as the foil is irradiated (in half-lives of gold-198): it climbs toward saturation, σΦN. The foil came out at the grey line. Burn-up of the gold is neglected.' }),
        };
      },
    }),
    num({
      id: 'mfp', difficulty: 2,
      gen(r) {
        const fast = r.bool(0.5), s = fast ? 7 : 700, lam = 1 / (N235 * s * 1e-24);
        return {
          prompt: t`Uranium-235 metal (19.05 g/cm³, 235.04 g/mol) presents a total cross section (fission, capture and scattering together) of about ${s} b to ${fast ? 'fast neutrons of 1–2 MeV' : 'thermal neutrons'}. What is a neutron’s mean free path in it — the average distance between interactions — in cm?`,
          answer: lam, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: lam * 1e-24 / 1e-28, feedback: t`Keep units consistent: with $n$ per cm³, use $\sigma$ in cm² ($1\ \text{b} = 10^{-24}\ \text{cm}^2$).` }],
          hints: [t`$\lambda = 1/(n\sigma)$ with $n = \dfrac{19.05}{235.04}\times6.022\times10^{23}\ \text{cm}^{-3}$.`, t`$n = ${tex(N235, 4)}\ \text{cm}^{-3}$, $\sigma = ${s}\times10^{-24}\ \text{cm}^2$.`],
          teach: 'The mean free path 1/(nσ) sets the scale of a reactor or a bomb: fast neutrons travel centimetres between collisions.',
          explain: t`$\lambda = 1/(${tex(N235, 3)}\times${s}\times10^{-24}) = ${fmt(lam, 3)}$ cm. ${fast ? 'Fast neutrons cross several centimetres of metal per interaction, so a sphere of uranium-235 must be about the size of a grapefruit (critical mass about 50 kg bare) before most neutrons cause fissions rather than escape.' : 'Thermal neutrons are absorbed within a fraction of a millimetre — but reactors use dilute fuel, so their neutrons travel through moderator and fuel alike.'}`,
          visual: sigmaPlot({ mark: fast ? r6(Math.log10(1.5e6)) : r6(Math.log10(0.0253)), caption: 'Fission cross sections against neutron energy (schematic, log scales). The violet line marks the neutron energy in the question; scattering and capture add to the total.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-he3', difficulty: 3, transfer: true,
      prompt: t`NASA’s Lunar Prospector (1998) mapped hydrogen — water ice — at the Moon’s poles with helium-3 neutron counters: slow neutrons leaking from the surface trigger ${'$'}{}^3\text{He}(n, p){}^3\text{H}$, and the charged products ionize the gas. With $Q = ${fmt(Q(['n', 'He-3'], ['H-1', 'H-3']), 4)}$ MeV and a neutron so slow its momentum is negligible, how much kinetic energy does the proton carry, in keV? (Masses: proton 1.0073 u, triton 3.0155 u.)`,
      answer: (Q(['n', 'He-3'], ['H-1', 'H-3']) * 3.0155) / (1.0073 + 3.0155) * 1000, units: 'keV', tol: { rel: 0.005 },
      errors: [{ value: (Q(['n', 'He-3'], ['H-1', 'H-3']) * 1.0073) / (1.0073 + 3.0155) * 1000, feedback: t`That is the triton’s share. With equal momenta, the lighter proton takes the larger part: $Qm_t/(m_p + m_t)$.` }, { value: (Q(['n', 'He-3'], ['H-1', 'H-3']) / 2) * 1000, feedback: 'Equal and opposite momenta, not equal energies: K = p²/2m favours the lighter particle.' }],
      hints: ['Initial momentum is zero, so the proton and the triton fly apart with equal and opposite momenta.', t`$K_p = Q\,\dfrac{m_t}{m_p + m_t}$.`],
      teach: 'In a two-body breakup at rest the lighter product takes the larger share of Q, in the ratio of the masses.',
      explain: t`$K_p = ${fmt(Q(['n', 'He-3'], ['H-1', 'H-3']) * 1000, 4)}\times3.0155/4.0228 = ${fmt((Q(['n', 'He-3'], ['H-1', 'H-3']) * 3.0155) / (1.0073 + 3.0155) * 1000, 4)}$ keV, leaving ${fmt((Q(['n', 'He-3'], ['H-1', 'H-3']) * 1.0073) / (1.0073 + 3.0155) * 1000, 3)} keV for the triton. Every captured neutron deposits the full 764 keV, a clean peak well above gamma-ray noise. With 5330 b for thermal neutrons, helium-3 is so good at this that a cadmium-covered twin tube (cutting off the thermal ones) let the team separate thermal from epithermal neutrons — and the dip in epithermal neutrons over the poles pointed to hydrogen.`,
      visual: levels('n + ³He', '³H + p', Q(['n', 'He-3'], ['H-1', 'H-3']), { showQ: true, caption: 'The capture releases 0.764 MeV, shared between the proton and the triton (schematic heights).' }),
    }),
    num({
      id: 'cp-power', difficulty: 3,
      gen(r) {
        const phi = r.pick([2e13, 3e13, 5e13]), n = 9.3e20, F = n * 585e-24 * phi, P = F * 200 * 1.602176634e-13;
        return {
          prompt: t`In a reactor’s fuel, uranium-235 nuclei number $9.3\times10^{20}$ per cm³ (4%-enriched uranium dioxide). The thermal flux is $${tex(phi, 1)}$ neutrons per cm² per second, the fission cross section 585 b, and each fission leaves about 200 MeV of heat. What is the power density, in W/cm³?`,
          answer: P, units: 'W/cm^3', tol: { rel: 0.01 },
          errors: [{ value: P / 1.602176634e-13 * 1.602176634e-19, feedback: t`200 MeV is $200\times1.602\times10^{-13}$ J: MeV, not eV.` }],
          hints: [t`Fissions per cm³ per second: $n\sigma\Phi$, with $\sigma = 585\times10^{-24}\ \text{cm}^2$.`, t`$n\sigma\Phi = ${tex(F, 3)}$; multiply by $200\times1.602\times10^{-13}$ J.`],
          teach: 'Reaction rate density = nσΦ: the same thin-target formula, with a flux in place of a beam.',
          explain: t`$${tex(F, 3)}$ fissions per cm³ per second give $${fmt(P, 3)}$ W/cm³. Real fuel runs a few hundred W/cm³: the effective cross section, averaged over the hotter neutrons in a reactor, is lower than the 585 b of 2200 m/s neutrons, so this is an overestimate. A single cubic centimetre of fuel puts out a good fraction of an electric kettle’s power.`,
          visual: sigmaPlot({ mark: r6(Math.log10(0.0253)), caption: 'Uranium-235’s fission cross section (schematic, log scales): thermal neutrons, marked, do nearly all the fissioning in a light-water reactor.' }),
        };
      },
    }),
    mcq({
      id: 'cp-neutral', difficulty: 2,
      prompt: 'Why are reactions on heavy nuclei at low energies almost always driven by neutrons rather than protons or alpha particles?',
      choices: [
        'Neutrons are uncharged, so no Coulomb barrier keeps them out: even a 0.025 eV neutron reaches the nucleus, while a proton needs MeV energies to tunnel in',
        'Neutrons are heavier than protons, so they hit harder',
        'Protons are absorbed by the atom’s electrons before reaching the nucleus',
        'Only neutrons feel the strong nuclear force',
      ],
      answer: 0,
      why: {
        1: 'The neutron is only 0.14% heavier than the proton — irrelevant here.',
        2: 'A proton passes through the electron cloud easily; it is the nucleus’s charge that stops it.',
        3: 'Protons feel the strong force just as neutrons do; they simply cannot get close enough at low energy.',
      },
      hints: ['What does a charged particle meet as it approaches a nucleus with 92 protons?', t`For a proton on uranium the barrier is about $92\times1.44/R$ MeV, with $R \approx 8$ fm.`],
      teach: 'No charge, no barrier: neutrons react at any energy, which is what makes chain reactions and neutron activation possible.',
      explain: t`The Coulomb barrier for a proton on uranium is about $92\times1.44/8.6 \approx 15$ MeV; below a few MeV, proton reaction cross sections are tiny. A neutron feels nothing until it is within reach of the strong force — and slow neutrons, as the $1/v$ law shows, are captured best of all.`,
      visual: levels('p + ²³⁸U', 'barrier ≈ 15 MeV', -15, { showQ: true, caption: 'What a slow proton faces: a Coulomb barrier near 15 MeV above it (schematic heights). A neutron sees none.' }),
    }),
  ],
  sources: [
    { label: 'Krane, Introductory Nuclear Physics (Wiley, 1988), ch. 11: nuclear reactions', url: 'https://www.wiley.com/en-us/Introductory+Nuclear+Physics%2C+3rd+Edition-p-9780471805533' },
    { label: 'Brown et al. (2018), ENDF/B-VIII.0, Nuclear Data Sheets 148, 1 (thermal cross sections)', url: 'https://doi.org/10.1016/j.nds.2018.02.001' },
    { label: 'Rutherford (1919), Collision of α particles with light atoms IV, Phil. Mag. 37, 581', url: 'https://doi.org/10.1080/14786440608635919' },
    { label: 'Feldman et al. (1998), Fluxes of fast and epithermal neutrons from Lunar Prospector, Science 281, 1496', url: 'https://doi.org/10.1126/science.281.5382.1496' },
  ],
});
