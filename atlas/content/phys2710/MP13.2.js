// The particle zoo and the Standard Model — six quarks and six leptons in
// three generations; hadrons as qqq and qq̄; the forces and their carriers
// (gluons, photon, W and Z; gravity left out); the Higgs boson at 125 GeV;
// conservation laws (charge, baryon number, lepton numbers, strangeness in
// strong and electromagnetic processes) deciding which reactions happen;
// a force’s range from its carrier’s mass. Honest about what is open:
// neutrino masses, dark matter, the matter–antimatter asymmetry. Masses
// are the Particle Data Group’s (2024); every number is computed here.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { MPC2, M_UQ, M_DQ, MEC2, MMUC2, MPIC2, MZC2 } from './_constants.js';
import { r6, seg, label } from './_diagrams.js';
import { HBARC } from './_quanta.js';

const t = String.raw;
const ML = 1115.683, MW = 80369.2, MH = 125200, MK = 493.677;     // MeV: Λ⁰, W, Higgs, K⁺ (PDG 2024)
const Q_L = ML - MPC2 - MPIC2;

/** Every elementary particle on one logarithmic mass scale (rows: quarks, leptons, bosons). */
const P = [
  ['u', 2.16e6, 3, 1], ['d', 4.70e6, 3, 1], ['s', 93.5e6, 3, 2], ['c', 1.273e9, 3, 2], ['b', 4.183e9, 3, 3], ['t', 172.57e9, 3, 3],
  ['e', MEC2 * 1e6, 2, 1], ['μ', MMUC2 * 1e6, 2, 2], ['τ', 1776.93e6, 2, 3],
  ['W', MW * 1e6, 1, 0], ['Z', MZC2 * 1e6, 1, 0], ['Higgs', MH * 1e6, 1, 0],
];
const GEN = { 1: 'accent', 2: 'teal', 3: 'violet', 0: 'gold' };
function ladder({ show = 'show', caption } = {}) {
  const on = (k) => (typeof show === 'number' ? (show >= k ? '1' : '0') : `step(${show} - ${k - 0.5})`);   // a string: a bare 0 would read as “no condition”
  return {
    type: 'graph',
    params: {
      x: [-1.6, 12.4], y: [0.3, 4.1], xlog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'mass (eV, log scale)', ylabel: '', yticks: 0, grid: true,
      points: [
        ...P.map(([n, m, row, g]) => ({ x: r6(Math.log10(m)), y: row, r: 6, color: GEN[g], label: n, ...({ W: { labelDx: -8, labelDy: -12, labelAlign: 'right' }, Z: { labelDx: 0, labelDy: 16, labelAlign: 'center' }, Higgs: { labelDx: 8, labelDy: -12, labelAlign: 'left' }, u: { labelDx: -4, labelDy: -13, labelAlign: 'right' }, d: { labelDx: 4, labelDy: -13, labelAlign: 'left' } }[n] || { labelDx: 0, labelDy: -13, labelAlign: 'center' }) })),
        label(-1.5, 3, 'quarks', 'ink', 0, 14, 'left'), label(-1.5, 2, 'leptons', 'ink', 0, 14, 'left'), label(-1.5, 1, 'bosons', 'ink', 0, 14, 'left'),
        label(-1.45, 1.35, 'photon, gluon: massless', 'gold', 0, 0, 'left'),
        { x: r6(Math.log10(MPC2 * 1e6)), y: 3.65, r: 7, color: 'warn', label: 'proton, 938 MeV', labelDx: 10, labelDy: -10, when: on(1) },
        { x: r6(Math.log10((2 * M_UQ + M_DQ) * 1e6)), y: 3.65, r: 4, color: 'warn', label: 'its three quarks, 9 MeV', labelDx: -10, labelDy: -10, labelAlign: 'right', when: on(1) },
        { ...label(-0.35, 2, 'neutrinos: below 0.45 eV', 'bad', 6, -12, 'left'), when: on(2) },
        { ...label(5, 0.55, 'dark matter: mass unknown, maybe not a particle at all', 'bad', 0, 0, 'center'), when: on(2) },
      ],
      arrows: [{ from: [-0.35, 2], to: [-1.4, 2], color: 'bad', width: 2.2, when: on(2) }, { from: [r6(Math.log10(9.02e6)), 3.65], to: [r6(Math.log10(MPC2 * 1e6) - 0.08), 3.65], color: 'warn', width: 1.4, dash: true, when: on(1) }],
      ...(typeof show === 'string' ? { choices: [{ key: show, label: 'Show', options: [[0, 'the particles'], [1, '+ the proton'], [2, '+ what is not known']], value: 0, explain: 'Colour marks the generation: first (blue), second (green), third (violet); the bosons in gold.' }] } : {}),
    },
    caption: caption ?? 'Every known elementary particle on one logarithmic scale of mass (PDG 2024). Quark masses are scheme-dependent “current” masses (MS-bar, at 2 GeV for u, d, s). Gravity, and any graviton, is not part of the Standard Model.',
  };
}

/** Quark content of a hadron as a little diagram: coloured discs in a ring. */
function quarks(qs, name) {
  const pts = qs.map((q, i) => {
    const a = (2 * Math.PI * i) / qs.length + Math.PI / 2, anti = q.endsWith('̄');
    return [{ x: r6(0.55 * Math.cos(a)), y: r6(0.55 * Math.sin(a)), r: 15, color: anti ? 'warn' : 'accent' }, label(0.55 * Math.cos(a), 0.55 * Math.sin(a), q, 'ink', 0, 0, 'center')];
  }).flat();
  return {
    type: 'graph',
    params: { x: [-2.4, 2.4], y: [-1.2, 1.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: ['1.05*cos(t)', '1.05*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1.4, dash: true }],
      points: [...pts, label(1.25, 0, name, 'ink', 0, 0, 'left')] },
    caption: 'The hadron’s valence quarks (antiquarks in orange). A sketch: inside, the quarks are bound by a sea of gluons and quark–antiquark pairs.',
  };
}

/** The Yukawa potential e^(−r/R)/r for a carrier of range R, beside the Coulomb 1/r. */
const yukawa = (R, name) => ({
  type: 'graph',
  params: { x: [0, 5], y: [0, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'distance r (in units of R)', ylabel: 'strength of the pull', yticks: 0,
    curves: [{ fn: '1/x', domain: [0.3, 5], color: 'ink3', width: 1.8, dash: true, label: 'massless carrier: 1/r', labelAt: 4, labelDy: -10 }, { fn: 'exp(-x)/x', domain: [0.3, 5], color: 'accent', width: 2.6, label: `massive carrier (${name})`, labelAt: 1.3, labelDx: 8 }],
    vlines: [{ x: 1, label: 'R = ħc / Mc²', color: 'gold' }] },
  caption: 'A force carried by a particle of mass M dies off exponentially beyond R = ħc/Mc² (the Yukawa form, solid); a massless carrier gives the long-range 1/r (dashed). Distances in units of R.',
});

const diphoton = (theta) => ({
  type: 'graph',
  params: { x: [-1, 4], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    arrows: [{ from: [0, 0], to: [r6(3 * Math.cos((theta / 2) * Math.PI / 180)), r6(1.4 * Math.sin((theta / 2) * Math.PI / 180))], color: 'gold', label: 'photon 1', labelDx: 6 },
      { from: [0, 0], to: [r6(3 * Math.cos((theta / 2) * Math.PI / 180)), r6(-1.4 * Math.sin((theta / 2) * Math.PI / 180))], color: 'gold', label: 'photon 2', labelDx: 6 }],
    points: [{ x: 0, y: 0, r: 5, color: 'violet' }, label(-0.15, 0, 'collision point', 'violet', 0, 0, 'right'), label(0.9, 0, `opening angle ${theta}°`, 'ink2', 0, 0, 'left')] },
  caption: 'Two photons from one collision, as a detector records them (sketch, not to scale; angles drawn squashed). Their energies and opening angle give the mass of whatever made them.',
});

export default lesson({
  id: 'phys2710.MP13.2',
  title: 'The particle zoo and the Standard Model',
  minutes: 14, difficulty: 2,
  badges: ['est-obs', 'open'],
  intro: t`By the 1960s accelerators had found hundreds of “elementary” particles — a zoo. The order behind it is the **Standard Model**. Matter is made of six **quarks** (up, down, charm, strange, top, bottom) and six **leptons** (the electron, muon and tau and their three neutrinos), in three ever heavier generations. Quarks never appear alone: they bind in threes into **baryons** such as the proton (uud) and in quark–antiquark pairs into **mesons**. Three forces act on them, each carried by a boson: the strong force by eight gluons, electromagnetism by the photon, and the weak force by the W and Z. The **Higgs boson**, found at CERN in 2012 at 125 GeV, is the trace of the field that gives the W, Z and the matter particles their masses. Neutron decay shows the pieces at work:

$$n \to p + e^- + \bar\nu_e \qquad\text{that is}\qquad d \to u + W^- \to u + e^- + \bar\nu_e$$

**Conservation laws** — of charge, of baryon number, of lepton number — decide what can happen. And the model is not the end: it leaves out gravity, it said neutrinos were massless (they are not), and it explains neither dark matter nor why the universe holds matter but almost no antimatter.`,
  symbols: [
    { tex: 'n,\\ p', text: 'the neutron (quarks udd, charge 0) and the proton (uud, charge +1); each has baryon number +1' },
    { tex: 'u,\\ d', text: 'the up quark (charge +⅔) and the down quark (charge −⅓), each with baryon number ⅓' },
    { tex: 'e^-', text: 'the electron, a lepton with electron-lepton number +1' },
    { tex: '\\bar\\nu_e', text: 'the electron antineutrino: no charge, almost no mass, electron-lepton number −1 (so leptons balance: 0 → +1 − 1)' },
    { tex: 'W^-', text: t`the negative W boson that carries the weak force, $80.37$ GeV: it exists only fleetingly inside the decay` },
  ],
  why: 'Every particle detector, every reactor’s neutrino flux and every cosmic ray striking a spacecraft is described by this model — and its gaps point at the deepest open questions in physics.',
  visual: {
    ...ladder(),
    title: 'Everything on one scale',
    lead: t`Each dot is an elementary particle, placed by its mass on a logarithmic scale running from a tenth of an eV to a trillion eV. Quarks on top, leptons in the middle, the force carriers and the Higgs below. Colour marks the generation.`,
    tasks: [
      'Read across a row: each generation repeats the one before, only heavier. The top quark weighs about as much as a gold atom.',
      'Show the proton: its three quarks add up to only 9 MeV of its 938. The other 99% is the energy of the gluon field and the quarks’ motion — not the Higgs.',
      'Show what is not known: neutrinos are so light that only upper limits exist, and dark matter is not on the chart at all.',
    ],
  },
  example: {
    prompt: t`In a bubble chamber, a pion hits a proton and makes two neutral particles, $\pi^- + p \to K^0 + \Lambda^0$, produced in pairs within $10^{-23}$ s. The lambda ($uds$, 1115.68 MeV) then lives about $2.6\times10^{-10}$ s before $\Lambda^0 \to p + \pi^-$. Check the conservation laws for both, find the energy released in the decay, and explain why the lambda lives ten trillion times longer than it took to make it.`,
    visual: { type: 'mp-collide', params: { scenario: 'lambda', controls: false, readout: false }, caption: 'The decay Λ⁰ → p + π⁻ on the energy–momentum diagram, seen from the lambda’s rest frame: the two products fly apart with equal and opposite momenta, sharing 37.8 MeV of kinetic energy.' },
    steps: [
      { label: 'Charge', text: t`Production: $-1 + 1 = 0 + 0$. Decay: $0 = +1 - 1$. Conserved in both.` },
      { label: 'Baryon number', text: t`Quarks count $+\tfrac13$, antiquarks $-\tfrac13$. Production: $0 + 1 = 0 + 1$ (pions and kaons are quark–antiquark pairs; the lambda has three quarks). Decay: $1 = 1 + 0$. Conserved.` },
      { label: 'Strangeness', text: t`Count $-1$ for each strange quark and $+1$ for each strange antiquark. The $K^0$ ($d\bar s$) has $+1$, the $\Lambda^0$ ($uds$) $-1$: production gives $0 + 0 = +1 - 1$ — conserved, so the strong force can do it, fast, and the strange particles must be made in pairs. The decay goes from $-1$ to $0$: only the weak force can change a quark’s flavour.` },
      { label: 'Energy released', text: t`$Q = (m_\Lambda - m_p - m_\pi)c^2 = 1115.68 - 938.27 - 139.57 = ${fmt(Q_L, 3)}$ MeV, shared as kinetic energy.` },
      { label: 'Why so slow', text: t`Strong processes take about $10^{-23}$ s, the time light needs to cross a proton. The weak force acts through the W, whose 80 GeV mass makes it very short-ranged and feeble at low energy: $2.6\times10^{-10}$ s is a typical weak lifetime. A particle’s lifetime is a fingerprint of the force that kills it.` },
    ],
    answer: t`Both reactions conserve charge and baryon number. Production conserves strangeness (strong, $10^{-23}$ s); the decay changes it by one (weak, $2.6\times10^{-10}$ s), releasing $${fmt(Q_L, 3)}$ MeV.`,
  },
  practice: [
    num({
      id: 'hadron-charge', difficulty: 1,
      gen(r) {
        const [name, qs, tq, Q] = r.pick([
          ['Δ⁺⁺', ['u', 'u', 'u'], 'uuu', 2], ['Σ⁻', ['d', 'd', 's'], 'dds', -1], ['Ω⁻', ['s', 's', 's'], 'sss', -1], ['K⁺', ['u', 's̄'], t`u\bar s`, 1],
          ['π⁻', ['d', 'ū'], t`d\bar u`, -1], ['Λ⁰', ['u', 'd', 's'], 'uds', 0], ['Ξ⁰', ['u', 's', 's'], 'uss', 0], ['D⁻', ['d', 'c̄'], t`d\bar c`, -1],
        ]);
        const meson = qs.length === 2, wrong = meson ? qs.reduce((s, q) => s + ({ u: 2 / 3, d: -1 / 3, s: -1 / 3, c: 2 / 3 }[q[0]]), 0) : null;
        return {
          prompt: t`The ${name} is made of the quarks $${tq}$. What is its electric charge, in units of $e$? (Up and charm quarks carry $+\tfrac23$, down and strange $-\tfrac13$; an antiquark carries the opposite charge.)`,
          answer: Q, tol: { rel: 0, abs: 0.02 },
          errors: wrong !== null && Math.abs(wrong - Q) > 0.1 ? [{ value: wrong, feedback: 'The bar marks an antiquark: flip its charge.' }] : [],
          hints: ['Add the quarks’ charges.', 'Up-type +2/3, down-type −1/3; an antiquark (with a bar) has the opposite sign.'],
          teach: 'A hadron’s charge is the sum of its quarks’ charges — always a whole number.',
          explain: t`Adding the quark charges gives ${Q > 0 ? '+' : ''}${Q}. Fractional charges always add up to whole numbers in hadrons, which is one reason quarks are never seen alone: only these combinations exist freely.`,
          visual: quarks(qs, name),
        };
      },
    }),
    mcq({
      id: 'forbidden', difficulty: 2,
      prompt: 'Which of these processes is forbidden by a conservation law?',
      choices: [
        t`$p \to e^+ + \gamma$`,
        t`$n \to p + e^- + \bar\nu_e$`,
        t`$\pi^+ \to \mu^+ + \nu_\mu$`,
        t`$\mu^- \to e^- + \bar\nu_e + \nu_\mu$`,
      ],
      answer: 0,
      why: {
        1: 'Charge 0 → 0, baryon number 1 → 1, electron-lepton number 0 → +1 − 1. Allowed: free neutrons decay in about 15 minutes.',
        2: 'Charge, baryon number (0) and muon-lepton number (−1 → −1) are all conserved. This is how almost every charged pion decays.',
        3: 'Muon number +1 → +1 and electron number 0 → +1 − 1: allowed. This is how muons decay, in 2.2 μs.',
      },
      hints: ['Check charge, baryon number and lepton number for each.', 'Count baryons: the proton has baryon number 1. What about the positron and the photon?'],
      teach: 'Baryon number is conserved in every process ever observed: the proton, the lightest baryon, has nowhere to decay to.',
      explain: t`Charge balances ($+1 \to +1$), but baryon number goes from 1 to 0 and lepton number from 0 to $-1$. No proton decay has ever been seen: Super-Kamiokande’s 50 000 tonnes of water show the proton lives more than $10^{34}$ years in this channel. Some unified theories predict it decays eventually — an open question.`,
      visual: quarks(['u', 'u', 'd'], 'proton (uud)'),
    }),
    num({
      id: 'range', difficulty: 2,
      gen(r) {
        const [what, m, unit, scale] = r.pick([['a pion (139.6 MeV), which carries the force between nucleons', MPIC2, 'fm', 1], ['a kaon (493.7 MeV)', MK, 'fm', 1], ['the W boson (80.37 GeV), carrier of the weak force', MW, 'am', 1000], ['the Z boson (91.19 GeV)', MZC2, 'am', 1000]]);
        const R = HBARC / m;
        return {
          prompt: t`A force carried by a particle of mass $M$ reaches about $R = \hbar c/Mc^2$, with $\hbar c = 197.3$ MeV fm. What is the range of a force carried by ${what}? Answer in ${unit === 'fm' ? 'fm' : 'attometres (1 am = 0.001 fm)'}.`,
          answer: R * scale, units: unit, tol: { rel: 0.005 },
          errors: [{ value: (R * scale) * 2 * Math.PI, feedback: t`That used $hc$; the range uses $\hbar c = hc/2\pi = 197.3$ MeV fm.` }],
          hints: [t`$R = \dfrac{\hbar c}{Mc^2} = \dfrac{197.3\ \text{MeV fm}}{Mc^2}$.`, unit === 'fm' ? 'With Mc² in MeV the answer comes out in fm.' : 'With Mc² in MeV the answer is in fm; multiply by 1000 for am.'],
          teach: 'A heavy carrier makes a short-ranged force, R = ħc/Mc²: the massless photon gives electromagnetism its infinite reach.',
          explain: t`$R = 197.3/${fmt(m, 5)} = ${fmt(R, 3)}$ fm${unit === 'am' ? t` $= ${fmt(R * 1000, 3)}$ am, a thousandth of a proton’s size: that is why the weak force is weak at everyday energies` : ' — about the size of a nucleus, which is why nuclear forces stop at its edge (Yukawa’s 1935 argument)'}. A virtual carrier of energy $Mc^2$ can exist for about $\hbar/Mc^2$ and travel at most $c$ times that.`,
          visual: yukawa(R, unit === 'fm' ? 'meson' : 'W or Z'),
        };
      },
    }),
    num({
      id: 'proton-mass', difficulty: 2,
      prompt: t`The up and down quarks have masses of about 2.16 MeV and 4.70 MeV (PDG 2024). What percentage of the proton’s mass, 938.27 MeV, do its three quarks’ masses account for?`,
      answer: ((2 * M_UQ + M_DQ) / MPC2) * 100, units: '%', tol: { rel: 0.01 },
      errors: [{ value: ((M_UQ + 2 * M_DQ) / MPC2) * 100, feedback: 'The proton is uud: two ups and one down.' }],
      hints: ['The proton is uud.', t`$(2\times2.16 + 4.70)/938.27\times100$.`],
      teach: 'About 99% of the proton’s mass — and so of yours — is the energy of quarks and gluons in motion, not the quarks’ own mass.',
      explain: t`$(2\times2.16 + 4.70)/938.27 = ${fmt(((2 * M_UQ + M_DQ) / MPC2) * 100, 3)}$%. The Higgs field gives the quarks those few MeV; the remaining 99% of the proton’s mass is $E = mc^2$ of the confined gluon field and the quarks’ motion, computed from first principles by lattice QCD. (Quark masses depend on how they are defined; these are the PDG’s standard values.)`,
      visual: ladder({ show: 1, caption: 'The proton (orange, 938 MeV) and the sum of its three quarks’ masses (9 MeV) on the mass scale (log). PDG 2024 masses.' }),
    }),
    match({
      id: 'which-force', difficulty: 2,
      prompt: 'A particle’s lifetime betrays the force that makes it decay. Match each decay to the force responsible.',
      left: [t`$\Delta^{++} \to p + \pi^+$, lifetime $5.6\times10^{-24}$ s`, t`$\pi^0 \to \gamma + \gamma$, lifetime $8.4\times10^{-17}$ s`, t`$\pi^+ \to \mu^+ + \nu_\mu$, lifetime $2.6\times10^{-8}$ s`],
      right: ['the strong force', 'electromagnetism', 'the weak force', 'gravity'],
      answer: [0, 1, 2],
      hints: ['Typical lifetimes: strong about 10⁻²³ s, electromagnetic 10⁻²⁰ to 10⁻¹⁶ s, weak 10⁻¹³ s and longer.', 'Photons in the products point to electromagnetism; neutrinos to the weak force.'],
      teach: 'Strong decays take ~10⁻²³ s, electromagnetic ones (with photons) ~10⁻¹⁸ s, weak ones (with neutrinos, or changing flavour) far longer.',
      explain: 'The Δ falls apart strongly almost as soon as it forms; the π⁰ annihilates into two photons; the charged pion must change a quark’s flavour and emit a neutrino, which only the weak force can do. Gravity is far too weak to matter in any particle decay.',
      visual: { type: 'graph', params: { x: [-25, -6], y: [0, 1], xlog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'lifetime (s, log scale)', ylabel: '', yticks: 0,
        shade: [{ fn: '1', from: -24.5, to: -22, color: 'bad', alpha: 0.15 }, { fn: '1', from: -21, to: -15.5, color: 'gold', alpha: 0.15 }, { fn: '1', from: -13.5, to: -6, color: 'teal', alpha: 0.15 }],
        points: [label(-23.25, 0.85, 'typical strong', 'bad', 0, 0, 'center'), label(-18.25, 0.85, 'typical electromagnetic', 'gold', 0, 0, 'center'), label(-9.75, 0.85, 'typical weak', 'teal', 0, 0, 'center'),
          { x: r6(Math.log10(5.6e-24)), y: 0.4, r: 5, color: 'ink', label: 'Δ', labelDy: -12, labelDx: 0, labelAlign: 'center' }, { x: r6(Math.log10(8.4e-17)), y: 0.4, r: 5, color: 'ink', label: 'π⁰', labelDy: -12, labelDx: 0, labelAlign: 'center' }, { x: r6(Math.log10(2.6e-8)), y: 0.4, r: 5, color: 'ink', label: 'π⁺', labelDy: -12, labelDx: 0, labelAlign: 'center' }] },
        caption: 'The three lifetimes on a logarithmic scale, against the typical ranges for each force (rough, overlapping in places).' },
    }),
    num({
      id: 'diphoton', difficulty: 3,
      gen(r) {
        const [E1, E2] = r.pick([[80, 65], [95, 70], [110, 60], [150, 45]]), mt = r.pick([118, 125.2, 131]);
        const th = Math.round((Math.acos(1 - (mt * mt) / (2 * E1 * E2)) * 180) / Math.PI * 10) / 10, m = Math.sqrt(2 * E1 * E2 * (1 - Math.cos((th * Math.PI) / 180)));
        return {
          prompt: t`The Higgs boson was discovered partly through its decay into two photons. In one candidate event the photons carry ${E1} GeV and ${E2} GeV, with ${th}° between them. For two massless particles the invariant mass is $m = \sqrt{2E_1E_2(1 - \cos\theta)}$ (with $c = 1$). What mass made them, in GeV?`,
          answer: m, units: 'GeV', tol: { rel: 0.005 },
          errors: [{ value: E1 + E2, feedback: 'The energies alone do not give the mass: the photons also carry momentum. Use the invariant mass formula.' }, { value: Math.sqrt(E1 * E2 * (1 - Math.cos((th * Math.PI) / 180))), feedback: 'Keep the factor 2 inside the square root.' }],
          hints: [t`$\cos ${th}° = ${fmt(Math.cos((th * Math.PI) / 180), 4)}$.`, t`$m = \sqrt{2(${E1})(${E2})(1 - ${fmt(Math.cos((th * Math.PI) / 180), 4)})}$ GeV.`],
          teach: 'The invariant mass of decay products is the same in every frame — a bump in its distribution reveals the particle that decayed.',
          explain: t`$m = ${fmt(m, 4)}$ GeV. ${Math.abs(m - 125.2) < 2 ? 'Right at the Higgs mass, 125.2 GeV.' : 'Not the Higgs (125.2 GeV) — one of the many background photon pairs.'} One event proves nothing: ATLAS and CMS found the Higgs as a small excess of events near 125 GeV over a smooth background of billions of collisions, announced on 4 July 2012.`,
          visual: diphoton(th),
        };
      },
    }),
    mcq({
      id: 'neutrino-mass', difficulty: 2,
      prompt: 'What is known about the masses of neutrinos?',
      choices: [
        'They are not zero — neutrinos change flavour as they travel, which requires mass — but their values are unknown; experiments only bound them below about 0.45 eV',
        'They are exactly zero, as the original Standard Model says',
        'They have been measured: about 0.5 eV each',
        'Only the tau neutrino has mass; the other two are massless',
      ],
      answer: 0,
      why: {
        1: 'Flavour oscillations, discovered by Super-Kamiokande (1998) and SNO (2001), are impossible for massless neutrinos.',
        2: 'No neutrino mass has been measured: KATRIN’s beta-decay experiment set an upper limit of 0.45 eV (2025), and cosmology suggests the three add up to less than about 0.1 eV.',
        3: 'Oscillations show the masses differ from one another, so at least two are non-zero; which is which is still being worked out.',
      },
      hints: ['What did the discovery of neutrino oscillations (Nobel Prize 2015) show?', 'Has any experiment measured a neutrino’s mass, or only limited it?'],
      teach: 'Neutrinos have mass — oscillations prove it — but how much is still unmeasured: physics beyond the original Standard Model.',
      explain: 'Oscillations measure only differences of squared masses, so at least two neutrinos are heavier than 0.009 and 0.05 eV. Direct measurements give upper limits (KATRIN: below 0.45 eV for the electron antineutrino). Whether neutrinos are their own antiparticles, and why they are millions of times lighter than the electron, are open questions.',
      visual: ladder({ show: 2, caption: 'The known particles with the neutrinos’ upper limit (red arrow: below 0.45 eV). PDG 2024; KATRIN 2025.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-omega', difficulty: 2,
      prompt: t`In 1964 the $\Omega^-$ was found at Brookhaven in the strong reaction $K^- + p \to \Omega^- + K^+ + K^0$, just as Gell-Mann’s quark scheme predicted. The $K^-$ has strangeness $-1$, the proton $0$, and both $K^+$ and $K^0$ have $+1$. What strangeness must the $\Omega^-$ carry?`,
      answer: -3, tol: { rel: 0, abs: 0.01 },
      errors: [{ value: -1, feedback: 'Balance the totals: −1 + 0 = S + 1 + 1.' }, { value: 3, feedback: 'Strange quarks count −1 each, so a particle made of strange quarks has negative strangeness.' }],
      hints: ['Strong reactions conserve strangeness.', t`$-1 + 0 = S + 1 + 1$.`],
      teach: 'Strangeness is conserved by the strong force: count it on both sides.',
      explain: t`$S = -1 - 2 = -3$: three strange quarks, $sss$. Its predicted mass (about 1680 MeV) and its existence were a triumph of the quark model.`,
      visual: quarks(['s', 's', 's'], 'Ω⁻'),
    }),
    num({
      id: 'cp-asymmetry', difficulty: 3, transfer: true,
      prompt: t`Measurements of the cosmic microwave background and of the lightest elements give a ratio of baryons to photons in the universe of $\eta = 6.1\times10^{-10}$. Space holds 411 microwave background photons per cm³. How many baryons (protons and neutrons) are there per cubic metre of the universe, on average?`,
      answer: 6.1e-10 * 411e6, units: 'm^-3', tol: { rel: 0.01 },
      errors: [{ value: 6.1e-10 * 411, feedback: 'Convert to cubic metres: 1 m³ = 10⁶ cm³.' }],
      hints: [t`Photons per m³: $411\times10^{6}$.`, t`Baryons per m³ $= \eta \times 4.11\times10^{8}$.`],
      teach: 'The universe holds about one baryon per two billion photons: the leftover of a tiny matter–antimatter imbalance.',
      explain: t`$n_b = 6.1\times10^{-10}\times4.11\times10^{8} = ${fmt(6.1e-10 * 411e6, 3)}$ per m³ — about one proton in every four cubic metres. If the early universe had made matter and antimatter in exactly equal amounts, they would have annihilated into photons and left almost nothing. Instead about one extra quark survived for every billion or so pairs. The Standard Model’s CP violation is far too small to explain that — one of the great **open questions**.`,
      visual: ladder({ show: 2 }),
    }),
    mcq({
      id: 'cp-dark', difficulty: 2, transfer: true,
      prompt: 'Galaxies rotate too fast, galaxy clusters bend light too strongly, and the cosmic microwave background’s pattern needs extra gravity — all pointing to about five times more “dark matter” than ordinary matter. Which statement is honest?',
      choices: [
        'No particle in the Standard Model can be the dark matter; what it is remains unknown, and searches have so far found nothing',
        'It is made of neutrinos, which are dark and abundant',
        'It has been identified as WIMPs in underground detectors',
        'It is ordinary matter in dim stars and gas that telescopes have not yet seen',
      ],
      answer: 0,
      why: {
        1: 'Neutrinos are too light and too fast: they would smear out the small-scale structure that is observed. They make up well under 1% of the matter.',
        2: 'Underground detectors have only set ever tighter limits on WIMPs; nothing has been detected.',
        3: 'The amount of ordinary matter is pinned down independently, by the light elements and the microwave background — and it is about a sixth of the total.',
      },
      hints: ['How many lines of evidence are there, and what do they need?', 'Has any experiment detected a dark-matter particle?'],
      teach: 'Dark matter’s gravity is observed in many independent ways; its nature is an open question beyond the Standard Model.',
      explain: 'The gravitational evidence is strong and comes from many directions. But no Standard Model particle fits: it must be neutral, stable, slow-moving and not made of baryons. Candidates include WIMPs, axions and primordial black holes; some physicists explore modified gravity instead. Nothing has been detected yet.',
      visual: ladder({ show: 2, caption: 'The Standard Model’s particles. None of them can be the dark matter.' }),
    }),
  ],
  sources: [
    { label: 'Particle Data Group (2024), Review of Particle Physics, Phys. Rev. D 110, 030001', url: 'https://pdg.lbl.gov/' },
    { label: 'OpenStax University Physics Vol. 3, ch. 11 (particle physics)', url: 'https://openstax.org/books/university-physics-volume-3/pages/11-introduction' },
    { label: 'ATLAS Collaboration (2012), Observation of a new particle in the search for the Standard Model Higgs boson, Phys. Lett. B 716, 1', url: 'https://doi.org/10.1016/j.physletb.2012.08.020' },
    { label: 'KATRIN Collaboration (2025), Direct neutrino-mass measurement based on 259 days of KATRIN data, Science 388, 180', url: 'https://doi.org/10.1126/science.adq9592' },
  ],
});
