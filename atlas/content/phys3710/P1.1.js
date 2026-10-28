// Leptons, quarks and bosons, at Krane’s level: the quark model as a
// working tool. SU(3) flavour multiplets in the (I₃, S) plane (the baryon
// octet and decuplet, the meson nonet) and the Gell-Mann–Nishijima
// relation; the decuplet’s equal spacing predicting the Ω⁻; colour from
// the Δ⁺⁺ and Pauli, and counted by the ratio R of e⁺e⁻ → hadrons to
// e⁺e⁻ → μ⁺μ⁻; magnetic moments from quarks (μₙ/μₚ = −2/3, constituent
// masses near 336 MeV); fermions and bosons by spin; a resonance’s width
// as its lifetime. PHYS 2710 MP13.2 drew the particle table, hadron
// charges, ranges of forces, the proton’s mass budget, lifetimes and the
// Higgs; not repeated.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { DIAGRAMS, diagram, quarkRing, MULTIPLETS } from './_feynman.js';
import { r6, seg, label } from './_nuclear.js';

const t = String.raw;
const MU_P = 2.79284734, MU_N = -1.91304276;              // nuclear magnetons (CODATA 2022)
const MPC2 = 938.27208943, HBAR_MEVS = 6.582119569e-22;
const DEC = { D: 1232, S: (1382.83 + 1383.7 + 1387.2) / 3, X: (1531.8 + 1535.0) / 2, O: 1672.45 };   // PDG 2024, multiplet averages
const OMEGA_PRED = DEC.X + (DEC.X - DEC.D) / 2;

const MCOL = ['accent', 'warn', 'good'];
/** The three multiplets on the (I₃, S) plane; `show` a choice key or a fixed index. */
function multiplet({ show = 'm', caption, extra = {}, masses = true, hide = null } = {}) {
  const w = (k) => (typeof show === 'number' ? (show === k ? '1' : '0') : `1 - min(1, abs(${show} - ${k}))`);
  const points = [];
  MULTIPLETS.forEach((list, k) => {
    const seen = {};
    for (const [name, i3, s, m] of list) {
      if (typeof show === 'number' && show !== k) continue;
      const hidden = hide === name, j = (seen[`${i3},${s}`] = (seen[`${i3},${s}`] ?? -1) + 1);
      if (j === 0) {
        points.push({ x: i3, y: s, r: 7, color: hidden ? 'ink4' : MCOL[k], when: w(k), label: hidden ? '?' : name, labelDx: 0, labelDy: -14, labelAlign: 'center' });
        if (masses && !hidden) points.push({ ...label(i3, s, `${Math.round(m)} MeV`, 'ink3', 0, 15, 'center'), when: w(k) });
      } else points.push({ ...label(i3, s, masses ? `${name} ${Math.round(m)} MeV` : name, MCOL[k], 14, (j - 1) * 14 - 2, 'left'), when: w(k) });
    }
  });
  return {
    type: 'graph',
    params: {
      x: [-2.2, 2.2], y: [-3.6, 1.7], aspect: 'wide', axesAt: 'edge', xlabel: 'isospin component I₃ (more up quarks →)', ylabel: 'strangeness S', xticks: 8, yticks: 5,
      points,
      ...(typeof show === 'string' ? { choices: [{ key: show, label: 'Multiplet', options: [[0, 'baryon octet (spin ½)'], [1, 'baryon decuplet (spin 3/2)'], [2, 'mesons (spin 0)']], value: 1, explain: 'Each family shares a spin and parity; its members differ in how many u, d and s quarks they hold.' }] } : {}),
      ...extra,
    },
    caption: caption ?? 'Hadrons placed by isospin component I₃ = (number of u − number of d)/2 across and strangeness S = −(number of s) up, with masses in MeV (PDG 2024). Each family is one pattern of SU(3) flavour symmetry, the “eightfold way”. Where several particles share a place (Σ⁰ and Λ; π⁰, η and η′), the extra ones are named beside it.',
  };
}

export default lesson({
  id: 'phys3710.P1.1',
  title: 'Leptons, quarks and bosons',
  minutes: 18, difficulty: 3,
  intro: t`In 1961 Gell-Mann and Ne’eman sorted the hadron zoo into geometric families, and in 1964 Gell-Mann and Zweig explained them: hadrons are built from quarks, each with a charge, a **strangeness** and an **isospin**, and those labels add. For any hadron

$$Q = I_3 + \frac{B + S}{2}$$

The [MP13.2](#/lesson/phys2710.MP13.2) overview gave the particle table; here the quark model earns its keep. It predicted a particle before it was found, explained why the Δ⁺⁺ needs a new quantum number, **colour** — which electron–positron collisions then counted — and even predicted the neutron’s magnetic moment from the proton’s.`,
  symbols: [
    { tex: 'Q', text: 'the electric charge, in units of $e$' },
    { tex: 'I_3', text: t`the third component of isospin: $+\tfrac12$ for each up quark, $-\tfrac12$ for each down, opposite for antiquarks, 0 for the others` },
    { tex: 'B', text: t`the baryon number: $+\tfrac13$ per quark, $-\tfrac13$ per antiquark (so 1 for a baryon, 0 for a meson)` },
    { tex: 'S', text: 'the strangeness: −1 for each strange quark, +1 for each strange antiquark' },
  ],
  why: 'The quark model is the grammar of every particle collision, from cosmic rays striking a spacecraft to the LHC, and colour is the charge of the strong force that holds every nucleus together.',
  visual: {
    ...multiplet(),
    title: 'The eightfold way',
    lead: t`Each dot is a hadron, placed by its isospin component (more up quarks to the right) and its strangeness (more strange quarks lower). Switch between the families and look for the patterns — and for the rows’ masses.`,
    tasks: [
      'In the decuplet, each step down in strangeness adds about 150 MeV: a strange quark is heavier than an up or a down. The bottom tip, the Ω⁻ (sss), was predicted from that spacing in 1962 and found in 1964.',
      'Read a charge off the picture: it rises by one along each row to the right. Check Q = I₃ + (B + S)/2 for the Ξ⁻ in the octet.',
      'The mesons are quark–antiquark pairs: the pattern is symmetric about the centre, because each meson’s antiparticle is in the same family.',
    ],
  },
  example: {
    prompt: t`In the quark model the proton’s magnetic moment is $\mu_p = \tfrac13(4\mu_u - \mu_d)$ and the neutron’s $\mu_n = \tfrac13(4\mu_d - \mu_u)$ (from combining three spin-½ quarks into spin ½). Each quark acts like a Dirac particle, $\mu_q = Q_q\,e\hbar/2m_q$. Take $m_u = m_d$. (a) Predict $\mu_n/\mu_p$. (b) From the measured $\mu_p = 2.793$ nuclear magnetons ($e\hbar/2m_p$), find the quark mass.`,
    visual: quarkRing(['u', 'u', 'd'], 'proton: uud', { spins: [1, 1, -1], caption: 'The proton’s three valence quarks with their spins (the two up quarks parallel, the down quark opposite, in the simplest picture). A sketch: the real spin structure involves gluons and sea quarks too.' }),
    steps: [
      { label: 'Quark moments', text: t`With equal masses, $\mu_u = +\tfrac23\,\dfrac{e\hbar}{2m_q}$ and $\mu_d = -\tfrac13\,\dfrac{e\hbar}{2m_q}$, so $\mu_d = -\tfrac12\mu_u$.` },
      { label: 'Proton', text: t`$\mu_p = \tfrac13\left(4\mu_u + \tfrac12\mu_u\right) = \tfrac32\mu_u$.` },
      { label: 'Neutron', text: t`$\mu_n = \tfrac13\left(-2\mu_u - \mu_u\right) = -\mu_u$, so $\mu_n/\mu_p = -\tfrac23 = -0.667$.` },
      { label: 'Compare', text: t`Measured: $\mu_n/\mu_p = ${fmt(MU_N, 6)}/${fmt(MU_P, 6)} = ${fmt(MU_N / MU_P, 4)}$. A simple model of three quarks gets a ratio no one could explain before it, to 3%.` },
      { label: 'Quark mass', text: t`$\mu_p = \tfrac32\times\tfrac23\,\dfrac{e\hbar}{2m_q} = \dfrac{e\hbar}{2m_q}$. Setting this equal to $2.793\,e\hbar/2m_p$ gives $m_q = m_p/2.793 = ${fmt(MPC2 / MU_P, 3)}$ MeV.` },
      { label: 'Sense check', text: t`That is about a third of the proton’s mass — a **constituent** mass, the quark dressed in its cloud of gluons. The bare up and down quark masses in the Standard Model are only 2–5 MeV; [MP13.2](#/lesson/phys2710.MP13.2) showed that 99% of the proton’s mass is field energy.` },
    ],
    answer: t`$\mu_n/\mu_p = -\tfrac23$ (measured $${fmt(MU_N / MU_P, 4)}$); $m_q \approx ${fmt(MPC2 / MU_P, 3)}$ MeV, a constituent mass.`,
  },
  practice: [
    num({
      id: 'gmn', difficulty: 1,
      gen(r) {
        const [name, qs, tq] = r.pick([['Σ⁺', ['u', 'u', 's'], 'uus'], ['Ξ⁻', ['d', 's', 's'], 'dss'], ['K⁰', ['d', 's̄'], t`d\bar s`], ['Δ⁰', ['u', 'd', 'd'], 'udd'], ['K⁻', ['s', 'ū'], t`s\bar u`], ['Σ*⁻', ['d', 'd', 's'], 'dds']]);
        const nu = qs.filter((q) => q === 'u').length - qs.filter((q) => q === 'ū').length, nd = qs.filter((q) => q === 'd').length - qs.filter((q) => q === 'd̄').length;
        const ns = qs.filter((q) => q === 's').length, nsb = qs.filter((q) => q === 's̄').length, B = qs.length === 3 ? 1 : 0, S = nsb - ns, I3 = (nu - nd) / 2, Q = I3 + (B + S) / 2;
        return {
          prompt: t`The ${name} is $${tq}$. Find its $I_3$ (up quarks count $+\tfrac12$, down $-\tfrac12$, antiquarks the opposite), its baryon number $B$ and its strangeness $S$, and use $Q = I_3 + (B + S)/2$ to find its charge.`,
          answer: Q, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: I3 + (B - S) / 2, feedback: 'Strangeness is −1 for each strange quark: an s quark lowers S, an s̄ raises it.' }, { value: I3 + B / 2, feedback: 'Include the strangeness in B + S.' }].filter((e) => Math.abs(e.value - Q) > 0.1),
          hints: [t`Here $I_3 = ${fmt(I3, 2)}$, $B = ${B}$; count the strange quarks for $S$.`, t`$S = ${S}$, so $Q = ${fmt(I3, 2)} + (${B} ${S < 0 ? '-' : '+'} ${Math.abs(S)})/2$.`],
          teach: 'Charge, isospin, baryon number and strangeness are tied together by Q = I₃ + (B + S)/2 — the rule that sorted the hadron zoo.',
          explain: t`$Q = ${fmt(I3, 2)} + ${fmt((B + S) / 2, 2)} = ${Q > 0 ? '+' : ''}${Q}$, matching the name. Adding quark charges ($+\tfrac23$ for u, $-\tfrac13$ for d and s) gives the same — the relation is the quark model in disguise.`,
          visual: quarkRing(qs, name),
        };
      },
    }),
    num({
      id: 'omega', difficulty: 2,
      prompt: t`In 1962 the decuplet’s known members were the $\Delta$ (1232 MeV), the $\Sigma^*$ (${fmt(DEC.S, 4)} MeV) and the $\Xi^*$ (${fmt(DEC.X, 4)} MeV), one, two and three rungs down in strangeness — each step adding a strange quark in place of a light one. Assuming equal steps, using the average step from $\Delta$ to $\Xi^*$, predict the mass of the missing $sss$ baryon, in MeV.`,
      answer: OMEGA_PRED, units: 'MeV', tol: { rel: 0.0005 },
      errors: [{ value: DEC.X + (DEC.X - DEC.S), feedback: 'That uses only the last step. The question asks for the average of the two steps from Δ to Ξ*.' }],
      hints: [t`Average step: $(${fmt(DEC.X, 4)} - 1232)/2$.`, t`Add one step to the $\Xi^*$: $${fmt(DEC.X, 4)} + ${fmt((DEC.X - DEC.D) / 2, 4)}$.`],
      teach: 'Equal spacing in the decuplet reflects one extra strange-quark mass per step — and it predicted the Ω⁻.',
      explain: t`$${fmt(DEC.X, 4)} + ${fmt((DEC.X - DEC.D) / 2, 4)} = ${fmt(OMEGA_PRED, 4)}$ MeV. The $\Omega^-$ found at Brookhaven in 1964 weighs 1672.45 MeV, within 0.7%. Its strangeness −3 also meant it could decay only weakly, one strange quark at a time, so it lives $8\times10^{-11}$ s — long enough to leave a visible track.`,
      visual: { type: 'graph', params: { x: [-3.5, 0.5], y: [1150, 1750], aspect: 'wide', axesAt: 'edge', xlabel: 'strangeness S', ylabel: 'mass (MeV)', xticks: 5,
        curves: [{ fn: `${r6(DEC.D)} - x*${r6((DEC.X - DEC.D) / 2)}`, domain: [-2, 0], color: 'ink3', width: 1.4, dash: true }],
        points: [{ x: 0, y: DEC.D, r: 6, color: 'accent', label: 'Δ', labelDx: 10, labelDy: 0, labelAlign: 'left' }, { x: -1, y: r6(DEC.S), r: 6, color: 'accent', label: 'Σ*', labelDx: 10, labelDy: 0, labelAlign: 'left' }, { x: -2, y: r6(DEC.X), r: 6, color: 'accent', label: 'Ξ*', labelDx: 10, labelDy: 0, labelAlign: 'left' }, { x: -3, y: 1700, r: 0.01, color: 'ink3', label: 'sss: ?', labelDx: 0, labelDy: 0, labelAlign: 'center' }] },
        caption: 'The decuplet’s rows against strangeness (PDG 2024 averages over each row). The dashed line is the trend through the known three; the fourth member is withheld.' },
    }),
    mcq({
      id: 'colour', difficulty: 2,
      prompt: 'The Δ⁺⁺ is three up quarks with spins all aligned (total spin 3/2), in the lowest-energy state with no orbital motion. Why did this force physicists to invent colour?',
      choices: [
        'Three identical fermions in the same spatial and spin state violate the Pauli principle — unless they differ in a new label, colour, in which their combined state is antisymmetric',
        'Its charge, +2, is too large for three quarks of charge +⅔ each',
        'Quarks are bosons, so three of them must carry different colours to be told apart',
        'Pauli’s principle does not apply inside hadrons, so colour was needed to replace it',
      ],
      answer: 0,
      why: {
        1: '3 × ⅔ = 2: the charge works out fine.',
        2: 'Quarks have spin ½: they are fermions, which is the whole problem.',
        3: 'The Pauli principle holds everywhere for fermions; colour rescues it rather than replacing it.',
      },
      hints: ['What must be true of the total state of identical fermions when two are swapped?', 'Space: symmetric (ground state). Spin: all aligned, symmetric. Flavour: uuu, symmetric. What is left?'],
      teach: 'Colour makes the Δ⁺⁺ legal: a third label, antisymmetric among the three quarks, restores the Pauli principle.',
      explain: 'Swapping any two quarks leaves space, spin and flavour unchanged, so without a new label the state would be symmetric — forbidden for fermions. Give each quark one of three colours and make the colour state antisymmetric (every hadron a colour singlet), and the total is antisymmetric. Three colours were later counted directly: in e⁺e⁻ → hadrons, in the decay π⁰ → γγ, and in the W’s branching ratios.',
      visual: quarkRing(['u', 'u', 'u'], 'Δ⁺⁺: uuu', { spins: [1, 1, 1], caption: 'The Δ⁺⁺: three up quarks, spins aligned, no orbital motion. Without colour, three identical fermions in one state — forbidden. A sketch.' }),
    }),
    num({
      id: 'R-ratio', difficulty: 2,
      gen(r) {
        const [E, qs, names] = r.pick([[2.5, [2 / 3, -1 / 3, -1 / 3], 'u, d, s'], [6, [2 / 3, -1 / 3, -1 / 3, 2 / 3], 'u, d, s, c'], [20, [2 / 3, -1 / 3, -1 / 3, 2 / 3, -1 / 3], 'u, d, s, c, b']]);
        const sq = qs.reduce((s, q) => s + q * q, 0), R = 3 * sq;
        return {
          prompt: t`An electron and a positron annihilate into a virtual photon, which makes any charged pair it has the energy for: $\mu^+\mu^-$, or a quark–antiquark pair that becomes a spray of hadrons. Each pair’s rate is proportional to its charge squared, and each quark comes in $N_c$ colours. At $\sqrt s = ${E}$ GeV the quarks ${names} can be made. With $N_c = 3$, what is $R = \sigma(e^+e^- \to \text{hadrons})/\sigma(e^+e^- \to \mu^+\mu^-)$?`,
          answer: R, tol: { rel: 0.005 },
          errors: [{ value: sq, feedback: t`Each flavour comes in three colours, each making its own pair: multiply by $N_c = 3$.` }, { value: 3 * qs.reduce((s, q) => s + Math.abs(q), 0), feedback: t`The rate goes as the charge **squared** (two vertices, each $\propto Q$).` }],
          hints: [t`$R = N_c\sum_q Q_q^2$ over the quarks light enough to be made.`, t`Up-type quarks: $Q^2 = 4/9$; down-type: $1/9$.`],
          teach: t`$R = N_c\sum Q^2$ counts colours: the measured steps match 3, not 1.`,
          explain: t`$R = 3\times${fmt(sq, 4)} = ${fmt(R, 4)}$. Without colour it would be $${fmt(sq, 3)}$. Measurements at these energies give values about 5–10% above $3\sum Q^2$ — the extra is the quarks radiating gluons, a correction $\approx\alpha_s/\pi$ — and nowhere near the colourless prediction.`,
          visual: diagram(DIAGRAMS.annihilate(undefined, ['q', 'q̄'], 'photon', 'γ*'), { caption: 'e⁺e⁻ → q q̄ through a virtual photon: two vertices, each proportional to a charge, so the rate goes as Q². Each colour of quark is a separate final state. The quarks then become hadrons.' }),
        };
      },
    }),
    num({
      id: 'constituent', difficulty: 3,
      prompt: t`The quark model predicts $\mu_\Lambda = \mu_s$ for the $\Lambda$ ($uds$): its $u$ and $d$ pair up with zero spin, leaving the strange quark to carry the moment. The measured value is $\mu_\Lambda = -0.613$ nuclear magnetons ($e\hbar/2m_p$). With $\mu_s = -\tfrac13\,e\hbar/2m_s$, what is the strange quark’s constituent mass, in MeV? ($m_pc^2 = 938.3$ MeV.)`,
      answer: (MPC2 / 3) / 0.613, units: 'MeV', tol: { rel: 0.005 },
      errors: [{ value: MPC2 / 0.613, feedback: t`Keep the strange quark’s charge: $\mu_s = -\tfrac13\,e\hbar/2m_s$.` }, { value: MPC2 * 0.613 * 3, feedback: t`Invert: $\dfrac13\,\dfrac{m_p}{m_s} = 0.613$, so $m_s = m_p/(3\times0.613)$.` }],
      hints: [t`$-\tfrac13\,\dfrac{e\hbar}{2m_s} = -0.613\,\dfrac{e\hbar}{2m_p}$.`, t`$m_s = \dfrac{m_p}{3\times0.613}$.`],
      teach: 'Magnetic moments measure constituent quark masses: about 336 MeV for u and d, about 510 MeV for s.',
      explain: t`$m_s = 938.3/(3\times0.613) = ${fmt(MPC2 / 3 / 0.613, 3)}$ MeV — about 170 MeV heavier than the up and down constituent masses (336 MeV). That difference is the ~150 MeV step between rows of the decuplet: the same strange quark seen two ways.`,
      visual: quarkRing(['u', 'd', 's'], 'Λ: uds', { spins: [1, -1, 1], caption: 'The Λ: its up and down quarks pair to spin 0, so the strange quark carries the spin and the magnetic moment. A sketch.' }),
    }),
    multi({
      id: 'fermions', difficulty: 2,
      prompt: 'Which of these are fermions (half-integer spin, obeying the Pauli principle)? Select all.',
      choices: ['the electron', 'the proton', 'the Δ⁺⁺', 'the π⁰', 'the photon', 'the deuteron (a proton and a neutron bound together)'],
      answer: [0, 1, 2],
      why: {
        3: 'A quark and an antiquark with opposite spins: spin 0, a boson.',
        4: 'Spin 1: a gauge boson.',
        5: 'Two spin-½ nucleons make integer spin (it is 1): a boson. Composites of an even number of fermions are bosons.',
      },
      hints: ['Add the spins: an odd number of spin-½ constituents gives half-integer spin.', 'Baryons have three quarks; mesons a quark and an antiquark.'],
      teach: 'Count fermions: an odd number makes a fermion, an even number a boson — for quarks in hadrons and nucleons in nuclei alike.',
      explain: 'The electron (spin ½), the proton (three quarks, ½) and the Δ⁺⁺ (three quarks, 3/2) are fermions. The π⁰ (spin 0), the photon (1) and the deuteron (1) are bosons. The same rule makes helium-4 atoms bosons and helium-3 atoms fermions, which is why the two liquids behave so differently near absolute zero.',
      visual: { type: 'graph', params: { x: [-0.3, 2.3], y: [0, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'spin (in units of ħ)', ylabel: '', yticks: 0, xticks: 5,
        shade: [0.5, 1.5].map((s) => ({ fn: '1', from: s - 0.08, to: s + 0.08, color: 'accent', alpha: 0.25 })).concat([0, 1, 2].map((s) => ({ fn: '1', from: s - 0.08, to: s + 0.08, color: 'gold', alpha: 0.25 }))),
        points: [label(0.5, 0.85, 'fermions', 'accent', 0, 0, 'center'), label(1.5, 0.85, 'fermions', 'accent', 0, 0, 'center'), label(0, 0.6, 'bosons', 'gold', 0, 0, 'center'), label(1, 0.6, 'bosons', 'gold', 0, 0, 'center'), label(2, 0.6, 'bosons', 'gold', 0, 0, 'center')] },
        caption: 'Spin decides the statistics: half-integer spins are fermions (one to a state), integer spins bosons (any number to a state).' },
    }),
    match({
      id: 'classify', difficulty: 1,
      prompt: 'Match each particle to its family.',
      left: [t`$\tau^-$`, t`$\Sigma^0$ ($uds$)`, t`$J/\psi$ ($c\bar c$)`, 'the gluon', 'the Higgs boson'],
      right: ['lepton', 'baryon', 'meson', 'gauge boson (spin 1)', 'scalar boson (spin 0)', 'graviton'],
      answer: [0, 1, 2, 3, 4],
      hints: ['Leptons feel no strong force; hadrons are made of quarks.', 'Three quarks: a baryon. A quark and an antiquark: a meson. Force carriers have spin 1; the Higgs has spin 0.'],
      teach: 'Leptons, baryons (qqq), mesons (qq̄), spin-1 gauge bosons and the spin-0 Higgs: the Standard Model’s families.',
      explain: 'The τ is the heaviest lepton (1777 MeV). The Σ⁰ is a baryon of the octet. The J/ψ, discovered in 1974, is charm and anticharm — the “November revolution” that confirmed the quark model. Gluons carry the strong force between colours. The Higgs boson is the only fundamental scalar known. The graviton is hypothetical: no quantum theory of gravity has been confirmed.',
      visual: diagram([...DIAGRAMS.annihilate(undefined, ['c', 'c̄'], 'photon', 'γ*')], { time: true, caption: 'e⁺e⁻ → c c̄: at 3.097 GeV the pair binds as the J/ψ, a meson so narrow (93 keV wide) that its discovery in 1974 left no doubt that a fourth quark existed.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-delta', difficulty: 3, transfer: true,
      gen(r) {
        const g = r.pick([5, 10, 20]), Gamma = 117, tau = HBAR_MEVS / Gamma, d = g * Math.sqrt(1 - 1 / (g * g)) * 2.99792458e23 * tau;
        return {
          prompt: t`When a cosmic-ray proton hits a nucleus in the upper atmosphere, it often makes a $\Delta$ resonance. The $\Delta$’s mass peak is $\Gamma = 117$ MeV wide, so its mean life is $\tau = \hbar/\Gamma$ ($\hbar = 6.582\times10^{-22}$ MeV s). If it moves with Lorentz factor $\gamma = ${g}$, how far does it travel, on average, before decaying? Answer in fm.`,
          answer: d, units: 'fm', tol: { rel: 0.01 },
          errors: [{ value: 2.99792458e23 * tau, feedback: t`Moving clocks run slow: the lab sees a mean life $\gamma\tau$, so the distance is $\gamma\beta c\tau$.` }],
          hints: [t`$\tau = 6.582\times10^{-22}/117\ \text{s} = ${tex(tau, 3)}$ s.`, t`Distance $= \gamma\beta c\tau$ with $\beta = \sqrt{1 - 1/\gamma^2}$ and $c = 3.00\times10^{23}$ fm/s.`],
          teach: 'A resonance’s width is its lifetime, τ = ħ/Γ: 100 MeV wide means it dies within a few nuclear diameters even at high speed.',
          explain: t`$\tau = ${tex(tau, 3)}$ s and the distance is $${fmt(d, 3)}$ fm — a few nuclear diameters. Strong decays are this fast: the Δ is seen only as a bump in the invariant mass of its decay products, never as a track. Compare the Ω⁻, whose weak decay lets it fly centimetres.`,
          visual: multiplet({ show: 1, caption: 'The baryon decuplet. The Δ resonances at the top decay strongly within about 10⁻²³ s; the Ω⁻ at the bottom, unable to decay strongly, lives ten trillion times longer. Masses PDG 2024.' }),
        };
      },
    }),
    num({
      id: 'cp-colours', difficulty: 3,
      prompt: t`At $\sqrt s = 10$ GeV, where $u, d, s, c$ and $b$ quarks can be made, experiments measure $R \approx 3.9$. QCD says the gluon radiation raises $R$ by the factor $(1 + \alpha_s/\pi)$, with $\alpha_s \approx 0.18$ there. If $R = N_c(1 + \alpha_s/\pi)\sum Q_q^2$, how many colours $N_c$ does the measurement imply?`,
      answer: 3.9 / ((1 + 0.18 / Math.PI) * (11 / 9)), tol: { rel: 0.01 },
      errors: [{ value: 3.9 / (11 / 9), feedback: t`Divide out the QCD factor $1 + \alpha_s/\pi = ${fmt(1 + 0.18 / Math.PI, 4)}$ as well.` }],
      hints: [t`$\sum Q^2 = \tfrac49 + \tfrac19 + \tfrac19 + \tfrac49 + \tfrac19 = \tfrac{11}{9}$.`, t`$N_c = 3.9/\left[(1 + 0.18/\pi)\times\tfrac{11}{9}\right]$.`],
      teach: 'The size of R counts quark colours: the answer is three.',
      explain: t`$N_c = 3.9/(${fmt(1 + 0.18 / Math.PI, 4)}\times1.222) = ${fmt(3.9 / ((1 + 0.18 / Math.PI) * (11 / 9)), 3)}$ — three colours. Two or four are ruled out by many tens of per cent. The same three appear in the π⁰ → γγ rate (proportional to $N_c^2$) and in how often the W decays to quarks.`,
      visual: diagram(DIAGRAMS.annihilate(undefined, ['q', 'q̄'], 'photon', 'γ*'), { caption: 'e⁺e⁻ → q q̄ through a virtual photon. Every colour of every quark light enough to be made is a separate channel; the rate of each goes as its charge squared.' }),
    }),
    mcq({
      id: 'cp-free', difficulty: 2,
      prompt: 'No experiment has ever isolated a single quark. What is the accepted explanation?',
      choices: [
        'Confinement: the strong force between colour charges does not weaken with distance, so pulling quarks apart costs enough energy to create new quark–antiquark pairs, which form new hadrons',
        'Quarks are only a mathematical device and do not exist',
        'Quarks are too heavy for any accelerator to free',
        'Free quarks exist, but they decay before detectors can see them',
      ],
      answer: 0,
      why: {
        1: 'Electron scattering sees point-like charges inside the proton with charges ⅔ and −⅓, and collisions produce jets along the quarks’ directions: quarks are physical.',
        2: 'Up and down quarks weigh a few MeV; the LHC has 13 600 000 MeV to spare. Energy is not the issue.',
        3: 'The top quark does decay before it can form a hadron, but it decays weakly into a b quark, which is itself confined. No fractional charge has ever been seen.',
      },
      hints: ['How does the strong force between two quarks behave as they separate, compared with electromagnetism?', 'What happens to the energy stored in a stretched gluon field?'],
      teach: 'Confinement: colour fields form strings whose energy creates new pairs, so only colourless hadrons emerge.',
      explain: 'Between quarks the gluon field forms a narrow tube with a constant energy per length, about 1 GeV per fm. Stretching it eventually makes a quark–antiquark pair from the vacuum, leaving two colourless hadrons instead of a free quark. At high energy this happens over and over, and the quarks emerge as jets. Confinement is observed, and seen in lattice QCD calculations, but has no rigorous proof — one of the Millennium Prize problems.',
      visual: quarkRing(['u', 'd̄'], 'π⁺: ud̄', { caption: 'A pion: a quark and an antiquark held by the gluon field. Pull them apart and the field’s energy makes a new pair — two pions, not a free quark. A sketch.' }),
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Elementary Particles (Wiley, 2008), ch. 1 and 5', url: 'https://www.wiley.com/en-us/Introduction+to+Elementary+Particles%2C+2nd+Revised+Edition-p-9783527406012' },
    { label: 'Particle Data Group (2024), Review of Particle Physics, Phys. Rev. D 110, 030001', url: 'https://pdg.lbl.gov/' },
    { label: 'Barnes et al. (1964), Observation of a hyperon with strangeness minus three, Phys. Rev. Lett. 12, 204', url: 'https://doi.org/10.1103/PhysRevLett.12.204' },
    { label: 'Krane, Modern Physics (Wiley, 2020), ch. 14: elementary particles', url: 'https://www.wiley.com/en-us/Modern+Physics%2C+4th+Edition-p-9781119495550' },
  ],
});
