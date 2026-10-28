// Conservation laws and Feynman diagrams, at an intermediate level.
// Diagrams as book-keeping: vertices, couplings and powers of α, internal
// lines as terms in a calculation (virtual, off shell), antiparticle arrows
// as a convention. Quantitative: the e⁺e⁻ → μ⁺μ⁻ cross section, positronium’s
// two- and three-photon lifetimes (one extra vertex, one extra α), the muon
// lifetime from G_F, the τ lifetime by counting channels (with colour), the
// W’s branching to eν, and helicity suppression of π → eν. Conservation
// laws (charge, baryon number, lepton family numbers, strangeness in strong
// processes) used to allow or forbid reactions. PHYS 2710 MP13.2 did
// p → e⁺γ, the Ω⁻’s strangeness and the Λ production example; not repeated.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { DIAGRAMS, diagram, fermion, boson, vertex, tag } from './_feynman.js';

const t = String.raw;
const ALPHA = 1 / 137.035999177, GF = 1.1663788e-5, HBAR_GEVS = 6.582119569e-25;
const M_MU = 0.1056583755, M_TAU = 1.77693, TAU_MU = 2.1969811e-6, TAU_TAU = 290.3e-15, BR_E = 0.1782;
const TAU_GF = HBAR_GEVS / ((GF * GF * M_MU ** 5) / (192 * Math.PI ** 3));
const SCALE = (M_MU / M_TAU) ** 5, TAU_PRED = (TAU_MU * SCALE) / 5;
const PS = (9 * Math.PI) / (4 * (Math.PI ** 2 - 9) * ALPHA);
const SIG = ((4 * Math.PI * ALPHA * ALPHA) / 3) * 0.3893794 * 1e6;       // nb GeV²
const ME = 0.51099895069, MMU = 105.6583755, MPI = 139.57039;
const PI_RATIO = (ME / MMU) ** 2 * ((MPI ** 2 - ME ** 2) / (MPI ** 2 - MMU ** 2)) ** 2;

/** The gallery: six diagrams under one choice key. */
const GALLERY = [
  ['annihilate', 'e⁺e⁻ → μ⁺μ⁻'], ['moller', 'e⁻e⁻ → e⁻e⁻'], ['compton', 'Compton'], ['twoPhoton', 'e⁺e⁻ → γγ'], ['beta', 'β decay'], ['muon', 'μ decay'],
];
const gallery = () => {
  const pieces = GALLERY.flatMap(([k], i) => DIAGRAMS[k](`1 - min(1, abs(d - ${i}))`));
  return diagram(pieces, {
    extra: { choices: [{ key: 'd', label: 'Process', options: GALLERY.map(([, name], i) => [i, name]), value: 0, explain: 'Each picture is the simplest (lowest-order) diagram for that process.' }] },
    caption: 'Lowest-order Feynman diagrams. Time runs left to right; each dot is a vertex where one coupling acts (e for a photon, g for a W). Fermion arrows follow particles; an antiparticle’s arrow points backward in time — a book-keeping convention for the calculation, not a claim about motion. Internal lines are virtual: terms in a sum, not particles you could catch.',
  });
};

export default lesson({
  id: 'phys3710.P1.2',
  title: 'Conservation laws and Feynman diagrams',
  minutes: 20, difficulty: 3,
  intro: t`Feynman’s diagrams are **book-keeping**. Each one stands for a term in the calculation of an amplitude: every vertex is a point where a particle emits or absorbs a force carrier, contributes one factor of the coupling, and conserves charge, baryon number and every lepton number. In electromagnetism each vertex brings $\sqrt\alpha$, so a process drawn with $n$ vertices has a rate proportional to $\alpha^n$:

$$\text{rate} \propto |\mathcal M|^2 \propto \alpha^{\,n}, \qquad \alpha = \frac{e^2}{4\pi\varepsilon_0\hbar c} = \frac{1}{137.036}$$

Each extra vertex costs a factor of about $1/137$, which is why the simplest diagram usually wins. Internal lines are **virtual**: they do not obey $E^2 = (pc)^2 + (mc^2)^2$, and they are not trajectories. Read correctly, a diagram tells you what is allowed, roughly how fast it goes, and why.`,
  symbols: [
    { tex: '\\mathcal M', text: 'the amplitude for the process: a sum of terms, one per diagram; the rate is proportional to its square' },
    { tex: 'n', text: 'the number of vertices in the diagram (two for the simplest scattering)' },
    { tex: '\\alpha', text: 'the fine-structure constant, the strength of the electromagnetic coupling (each vertex contributes $\\sqrt\\alpha$ to $\\mathcal M$)' },
    { tex: 'e,\\ \\varepsilon_0,\\ \\hbar,\\ c', text: 'the elementary charge, the vacuum permittivity, the reduced Planck constant and the speed of light' },
  ],
  why: 'The same diagrams govern the Sun’s first fusion step, the decay of every cosmic-ray pion and muon that reaches the ground, and every collision in a particle detector.',
  visual: {
    ...gallery(),
    title: 'Six diagrams',
    lead: t`Pick a process. Count its vertices, check that charge is conserved at each one, and follow the arrows: they mark particles going forward in time, antiparticles backward.`,
    tasks: [
      'e⁺e⁻ → μ⁺μ⁻ and Compton scattering each have two vertices: both rates go as α².',
      'In beta decay a d quark becomes a u by emitting a W⁻, which becomes an electron and an antineutrino. The other two quarks are spectators. Check charge at each vertex: −⅓ → +⅔ + (−1), and −1 → −1 + 0.',
      'Muon decay has the same shape as beta decay, with a muon in place of the quark: one weak process, two disguises.',
    ],
  },
  example: {
    prompt: t`The muon lives $\tau_\mu = 2.197\ \mu\text{s}$. The tau lepton ($m_\tau c^2 = 1776.9$ MeV) decays by the same diagram, a W emitted by the lepton — but it is heavy enough for the W to become $e\bar\nu_e$, $\mu\bar\nu_\mu$, or a quark pair $d\bar u$. Estimate the tau’s lifetime. (Weak decay rates of this kind scale as $m^5$; $m_\mu c^2 = 105.66$ MeV.)`,
    visual: diagram(DIAGRAMS.muon(undefined, 'τ⁻', 'ντ', ['e⁻, μ⁻ or d', 'ν̄ₑ, ν̄μ or ū']), { caption: 'τ⁻ decay: the tau becomes its neutrino by emitting a virtual W⁻, which becomes a lepton–antineutrino pair or a quark–antiquark pair (in any of three colours). Time runs left to right.' }),
    steps: [
      { label: 'Why m to the fifth', text: t`The weak coupling $G_F$ has dimensions of $1/\text{energy}^2$. A rate $\Gamma$ (an energy, times $1/\hbar$) built from $G_F^2$ needs five more powers of energy, and the only energy around is the decaying mass: $\Gamma \propto G_F^2m^5$ — Sargent’s rule.` },
      { label: 'One channel', text: t`If the tau decayed only to $e\bar\nu_e\nu_\tau$, exactly like the muon, it would live $\tau_\mu(m_\mu/m_\tau)^5 = 2.197\times10^{-6}\times${tex(SCALE, 3)} = ${tex(TAU_MU * SCALE, 3)}$ s.` },
      { label: 'Count the channels', text: t`The W⁻ can become $e^-\bar\nu_e$, $\mu^-\bar\nu_\mu$, or $d\bar u$ in each of **three colours**: five channels of nearly equal strength (the tau is too light for $s\bar c$). The rate is five times larger.` },
      { label: 'Estimate', text: t`$\tau_\tau \approx ${tex(TAU_MU * SCALE, 3)}/5 = ${tex(TAU_PRED, 3)}$ s.` },
      { label: 'Sense check', text: t`Measured: $2.903\times10^{-13}$ s, and the electron channel’s share is 17.8%, not 20% (the quark channel is boosted by gluon radiation and the muon channel slightly suppressed by its mass). Using that share, $\tau_\mu(m_\mu/m_\tau)^5\times0.178 = ${tex(TAU_MU * SCALE * BR_E, 4)}$ s — within 0.3%. Without colour there would be three channels and a lifetime near $5\times10^{-13}$ s.` },
    ],
    answer: t`About $${tex(TAU_PRED, 2)}$ s by counting five channels (measured $2.90\times10^{-13}$ s): the factor 5 includes the three colours of the $d\bar u$ pair.`,
  },
  practice: [
    multi({
      id: 'allowed', difficulty: 2,
      prompt: 'Which of these processes are allowed by the conservation laws? (Strangeness need be conserved only by strong and electromagnetic processes; the weak force may change it by one unit.) Select all that are allowed.',
      choices: [
        t`$\bar\nu_e + p \to n + e^+$`,
        t`$\mu^- \to e^- + \gamma$`,
        t`$\Xi^- \to \Lambda^0 + \pi^-$ (weak decay)`,
        t`$\Xi^0 \to p + \pi^-$`,
        t`$p + p \to p + p + \pi^0$`,
        t`$n \to p + e^-$`,
      ],
      answer: [0, 2, 4],
      why: {
        1: 'Charge is conserved, but muon-lepton number goes from 1 to 0 and electron-lepton number from 0 to 1. Searches (MEG II) find it happens less than once in about 10¹³ muon decays.',
        3: 'Strangeness changes by 2 (the Ξ⁰ has two strange quarks, the products none). Even the weak force changes it only one unit at a time.',
        5: 'Charge balances, but electron-lepton number goes from 0 to 1: an antineutrino must be emitted too.',
      },
      hints: ['For each, check charge, baryon number, electron-lepton number and muon-lepton number — then strangeness.', 'Ξ has strangeness −2, Λ −1, nucleons and pions 0.'],
      teach: 'Conservation laws are filters: check charge, baryon number, each lepton number, then strangeness against the force involved.',
      explain: t`$\bar\nu_e + p \to n + e^+$ is inverse beta decay (lepton number $-1 \to -1$), the reaction Cowan and Reines used to catch reactor antineutrinos in 1956. $\Xi^- \to \Lambda^0\pi^-$ changes strangeness by one unit, so it is weak — the $\Xi^-$ lives $1.6\times10^{-10}$ s. $pp \to pp\pi^0$ is a strong process, made in every proton accelerator above 280 MeV.`,
      visual: diagram(DIAGRAMS.beta(), { caption: 'Beta decay as quarks see it: at each vertex charge, baryon number and lepton number balance. Inverse beta decay, ν̄ₑ + p → n + e⁺, is the same diagram read with particles swapped between the ends. Time runs left to right.' }),
    }),
    num({
      id: 'missing', difficulty: 2,
      gen(r) {
        const [rx, S, X] = r.pick([
          [t`K^- + p \to \Xi^- + X`, 1, 'K⁺'],
          [t`\pi^- + p \to K^0 + X`, -1, 'Λ⁰ (or Σ⁰)'],
          [t`K^- + p \to \Lambda^0 + X`, 0, 'π⁰ (or η)'],
          [t`\pi^+ + p \to K^+ + X`, -1, 'Σ⁺'],
        ]);
        return {
          prompt: t`In the strong reaction $${rx}$, what is the strangeness of the unknown particle $X$? ($K^-$: $S = -1$; $K^+$, $K^0$: $+1$; $\Lambda^0$: $-1$; $\Xi^-$: $-2$; nucleons and pions: 0.)`,
          answer: S, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -S, feedback: 'Balance the totals: S(before) = S(after), and solve for X’s share.' }].filter((e) => e.value !== S),
          hints: ['The strong force conserves strangeness: add it up on each side.', 'Strangeness of X = (total before) − (total of the known particles after).'],
          teach: 'Strong reactions conserve strangeness, so strange particles are made in pairs: the bookkeeping identifies the partner.',
          explain: t`Balancing gives $S_X = ${S}$: $X$ is a particle such as the ${X}. This associated production — strangeness made in pairs, in $10^{-23}$ s, then destroyed one unit at a time by slow weak decays — was the puzzle that led Gell-Mann and Nishijima to strangeness in 1953.`,
          visual: diagram(DIAGRAMS.annihilate(undefined, ['s', 's̄'], 'gluon', 'g'), { time: true, caption: 'Strangeness is made in pairs: in a strong process a gluon can create an s quark only together with an s̄. A schematic quark-level picture (the incoming lines stand for quarks of the colliding hadrons). Time runs left to right.' }),
        };
      },
    }),
    mcq({
      id: 'virtual', difficulty: 2,
      prompt: 'In the diagram for e⁻e⁻ → e⁻e⁻, a wavy photon line joins the two electrons. What does that line mean?',
      choices: [
        'A virtual photon: a term in the calculation, carrying energy and momentum between the vertices without obeying E = pc; it cannot be detected, and the diagram’s geometry is not a path in space',
        'A real photon that travels from one electron to the other at the speed of light',
        'The electrons’ actual trajectories bending as they repel',
        'A photon emitted by one electron that later escapes to a detector',
      ],
      answer: 0,
      why: {
        1: 'A real photon would need E = pc. Here the momentum transfer is spacelike: no real photon could carry it.',
        2: 'The lines are not paths: the same amplitude includes the diagram with the outgoing electrons swapped, and none of it describes where the electrons are.',
        3: 'Photons that escape are external lines; this one starts and ends on vertices inside the diagram.',
      },
      hints: ['Can a free photon carry momentum without energy, as an elastic scattering in the centre-of-mass frame requires?', 'Feynman diagrams are pictures of terms in a perturbation series.'],
      teach: 'Internal lines are virtual: off-shell terms in a sum, not particles in flight; the picture is book-keeping, not a movie.',
      explain: t`In the centre-of-mass frame the electrons swap momentum but not energy, so the exchanged “photon” has $E = 0$ and $p \ne 0$ — impossible for a real photon. That is what *virtual* means. The full amplitude adds this diagram to one with the outgoing electrons exchanged (they are identical), and higher-order diagrams with loops; only the sum is physical. Thinking of virtual particles as tiny bullets is a handy image, but no more.`,
      visual: diagram(DIAGRAMS.moller(), { caption: 'Møller scattering, e⁻e⁻ → e⁻e⁻, at lowest order: the photon line is internal and virtual. A second diagram, with the outgoing electrons swapped, is added to it. Time runs left to right.' }),
    }),
    num({
      id: 'positronium', difficulty: 2,
      prompt: t`Positronium is an electron bound to a positron. In the spin-0 state it annihilates to two photons; in the spin-1 state, two photons are forbidden by symmetry, and it needs three — one more vertex. QED gives the ratio of their decay rates as $\dfrac{\Gamma_{2\gamma}}{\Gamma_{3\gamma}} = \dfrac{9\pi}{4(\pi^2 - 9)\,\alpha}$. Evaluate it, with $\alpha = 1/137.036$.`,
      answer: PS, tol: { rel: 0.003 },
      errors: [{ value: PS * ALPHA * ALPHA, feedback: t`Divide by $\alpha$, i.e. multiply by 137.036.` }],
      hints: [t`$\pi^2 - 9 = ${fmt(Math.PI ** 2 - 9, 4)}$.`, t`$\dfrac{9\pi}{4\times${fmt(Math.PI ** 2 - 9, 4)}}\times137.036$.`],
      teach: 'One extra vertex costs one factor of α: the three-photon decay is about a thousand times slower.',
      explain: t`The ratio is $${fmt(PS, 4)}$: most of it is the $1/\alpha = 137$ from the extra vertex, the rest from the three-body phase space. Measured lifetimes are 0.1244 ns and 142.05 ns, a ratio of ${fmt(142.05 / 0.1244, 4)}; the 2.5% difference is the next order of QED, proportional to $\alpha$ again. Positron emission tomography sees the two-photon kind: back-to-back 511 keV photons.`,
      visual: diagram([...DIAGRAMS.threePhoton()], { caption: 'Spin-1 positronium must annihilate to three photons: three vertices, so its rate carries one more factor of α than the two-photon decay. One of several diagrams. Time runs left to right.' }),
    }),
    num({
      id: 'muon-life', difficulty: 3,
      prompt: t`Fermi’s theory gives the muon’s decay rate as $\Gamma = \dfrac{G_F^2(m_\mu c^2)^5}{192\pi^3\hbar}$, with $G_F = 1.1664\times10^{-5}\ \text{GeV}^{-2}$ (in units with $\hbar c = 1$), $m_\mu c^2 = 0.105658$ GeV and $\hbar = 6.5821\times10^{-25}$ GeV s. What lifetime does it predict, in μs?`,
      answer: TAU_GF * 1e6, units: 'us', tol: { rel: 0.003 },
      errors: [{ value: (HBAR_GEVS / ((GF * M_MU ** 5) / (192 * Math.PI ** 3))) * 1e6, feedback: t`Square the Fermi constant: the amplitude has one factor of $G_F$, the rate two.` }],
      hints: [t`$\Gamma = \dfrac{(1.1664\times10^{-5})^2(0.105658)^5}{192\pi^3}$ GeV, then $\tau = \hbar/\Gamma$.`, t`$192\pi^3 = ${fmt(192 * Math.PI ** 3, 5)}$ and $(0.105658)^5 = ${tex(M_MU ** 5, 4)}$.`],
      teach: t`The muon lifetime is how $G_F$ is measured: the weak coupling, read from a clock.`,
      explain: t`$\Gamma = ${tex((GF * GF * M_MU ** 5) / (192 * Math.PI ** 3), 4)}$ GeV, so $\tau = ${fmt(TAU_GF * 1e6, 4)}$ μs. Measured: 2.197 μs; the 0.4% difference is a QED radiative correction. In practice the logic runs backwards: the muon lifetime, measured to a part per million, defines $G_F$ — the weak force’s strength, $\approx10^{-5}\ \text{GeV}^{-2}$, tiny because the W is heavy ($G_F \propto g^2/M_W^2$).`,
      visual: diagram(DIAGRAMS.muon(), { caption: 'Muon decay, μ⁻ → νμ e⁻ ν̄ₑ, through a virtual W⁻. At low energy the W line shrinks to a point and Fermi’s constant G_F stands for the whole middle of the diagram. Time runs left to right.' }),
    }),
    match({
      id: 'vertices', difficulty: 1,
      prompt: 'Match each vertex to the interaction it belongs to.',
      left: [t`$e^- \to e^- + \gamma$`, t`$u \to u + g$`, t`$e^- \to \nu_e + W^-$`, t`$\nu_\mu \to \nu_\mu + Z^0$`],
      right: ['electromagnetic', 'strong', 'weak (charged current)', 'weak (neutral current)', 'gravitational'],
      answer: [0, 1, 2, 3],
      hints: ['Which force carrier appears in each vertex?', 'Photon: electromagnetism. Gluon: strong. W: charged weak. Z: neutral weak.'],
      teach: 'Each force has its own vertex; a diagram’s vertices tell you which forces act and how fast.',
      explain: 'Photons couple to charge, gluons to colour (only quarks and gluons), the W changes a particle into its weak partner (e into νₑ, d into u) and carries charge, and the Z couples without changing identity — the neutral current discovered at CERN in 1973, the first evidence for the Z. Gravity has no vertex in the Standard Model.',
      visual: diagram(DIAGRAMS.beta(), { caption: 'Beta decay holds two weak vertices: d → u + W⁻ and W⁻ → e⁻ + ν̄ₑ. Time runs left to right.' }),
    }),
    num({
      id: 'sigma', difficulty: 3,
      gen(r) {
        const E = r.pick([10, 20, 35]), s = (SIG / (E * E));
        return {
          prompt: t`At lowest order QED predicts $\sigma(e^+e^- \to \mu^+\mu^-) = \dfrac{4\pi\alpha^2(\hbar c)^2}{3s}$, where $\sqrt s$ is the total collision energy. With $(\hbar c)^2 = 0.3894\ \text{GeV}^2\,\text{mb}$ ($1\ \text{mb} = 10^6$ nb) and $\alpha = 1/137.036$, what is it at $\sqrt s = ${E}$ GeV, in nanobarns?`,
          answer: s, tol: { rel: 0.005 },
          errors: [{ value: s * E, feedback: t`$s$ is the square of the collision energy: $s = ${E * E}\ \text{GeV}^2$.` }, { value: (s * 137.036), feedback: t`$\alpha^2$: the diagram has two vertices, so the rate carries two powers of $\alpha$.` }],
          hints: [t`$\dfrac{4\pi\alpha^2}{3} = ${tex((4 * Math.PI * ALPHA * ALPHA) / 3, 4)}$.`, t`$\sigma = ${tex((4 * Math.PI * ALPHA * ALPHA) / 3, 4)}\times0.3894\times10^6\ \text{nb}/${E * E}$.`],
          teach: 'σ(e⁺e⁻ → μ⁺μ⁻) = 86.8 nb/s[GeV²]: two vertices give α², and dimensions demand 1/s.',
          explain: t`$\sigma = ${fmt(s, 3)}$ nb — the yardstick for $R$ in the previous lesson. It falls as $1/s$ because nothing else sets an energy scale; measured at PETRA and PEP in the 1980s, it agreed with QED to about a per cent until the Z’s influence appeared near 40 GeV.`,
          visual: diagram(DIAGRAMS.annihilate(), { caption: 'e⁺e⁻ → μ⁺μ⁻ through one virtual photon: two vertices, a rate ∝ α². Time runs left to right.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-W', difficulty: 2,
      prompt: t`The $W^-$ boson (80.4 GeV) decays to $e^-\bar\nu_e$, $\mu^-\bar\nu_\mu$, $\tau^-\bar\nu_\tau$, or a quark pair: $d\bar u$ or $s\bar c$ (the $b\bar t$ pair is too heavy), each quark pair in three colours. If every channel has the same strength, what percentage of W decays give an electron and its antineutrino?`,
      answer: 100 / 9, units: '%', tol: { rel: 0.005 },
      errors: [{ value: 100 / 5, feedback: 'Each quark pair comes in three colours: 3 lepton channels + 2 × 3 quark channels.' }, { value: 100 / 3, feedback: 'The W also decays to quarks — in fact two-thirds of the time.' }],
      hints: ['Count the channels: three lepton pairs, and two quark pairs times three colours.', 'The electron channel is one of nine.'],
      teach: 'Counting channels, with colour, predicts the W’s branching ratios: one in nine to each lepton.',
      explain: t`$1/9 = 11.1\%$. Measured: $(10.71 \pm 0.16)\%$ — the quark channels are boosted a little by gluon radiation, as for the tau and $R$. Without colour the electron share would be 20%. The same counting predicted the W’s total width, 2.1 GeV, before LEP measured it.`,
      visual: diagram(DIAGRAMS.annihilate(undefined, ['e⁻ (or μ⁻, τ⁻, d, s)', 'ν̄ (or ū, c̄)'], 'W', 'W⁻'), { time: true, caption: 'Schematic: a W⁻, made in a collision, decays to a lepton–antineutrino pair or a quark–antiquark pair. Every pair of each colour is a separate channel. Time runs left to right.' }),
    }),
    mcq({
      id: 'cp-sun', difficulty: 2, transfer: true,
      prompt: 'The Sun’s fuel burns slowly: a proton in its core waits, on average, billions of years to fuse. The first step of the proton–proton chain is p + p → d + e⁺ + νₑ. Why is it so slow?',
      choices: [
        'One proton must turn into a neutron during the brief encounter, and only the weak interaction can change a quark’s flavour (u → d), with a tiny coupling',
        'Electric repulsion stops all but a few protons: the Coulomb barrier alone sets the rate',
        'Positron emission is forbidden by charge conservation, so the reaction only happens by rare exceptions',
        'The neutrino is too heavy to be made easily at the Sun’s temperature',
      ],
      answer: 0,
      why: {
        1: 'The barrier suppresses every fusion reaction, but other steps of the chain (d + p → ³He + γ) take seconds. The difference is the weak interaction.',
        2: 'Charge balances: +1 +1 = +1 +1 + 0. Nothing is forbidden; it is slow.',
        3: 'Neutrinos weigh less than 1 eV; energy is not the issue.',
      },
      hints: ['What happens to one of the protons’ quarks in this reaction?', 'Which force can turn an up quark into a down quark?'],
      teach: 'A weak vertex in the Sun’s first step makes the proton–proton chain slow — which is why the Sun lasts ten billion years.',
      explain: 'Two protons meet near the Gamow peak only for about 10⁻²² s, and in that time a weak process must turn uud into udd while they are close. The probability is so small that no laboratory has measured this cross section; it is computed. The Sun’s neutrinos, from exactly this step, have been detected (Borexino, 2014) and confirm the rate. If the step were strong, the Sun would have burned out long ago.',
      visual: diagram(DIAGRAMS.beta(), { caption: 'The weak vertex at the heart of p + p → d + e⁺ + νₑ: a quark changes flavour by emitting a W (drawn here for the closely related beta decay of a neutron). Time runs left to right.' }),
    }),
    num({
      id: 'cp-pion', difficulty: 3,
      prompt: t`A charged pion decays almost always to $\mu\nu_\mu$, very rarely to $e\nu_e$ — even though the electron channel has more energy to spare. The weak interaction makes left-handed particles, and angular momentum conservation then forces the light electron into its “wrong” helicity, at a cost $\propto m^2$. The prediction is $\dfrac{\Gamma(\pi \to e\nu)}{\Gamma(\pi \to \mu\nu)} = \left(\dfrac{m_e}{m_\mu}\right)^2\left(\dfrac{m_\pi^2 - m_e^2}{m_\pi^2 - m_\mu^2}\right)^2$. Evaluate it with $m_e = 0.511$, $m_\mu = 105.66$ and $m_\pi = 139.57$ MeV.`,
      answer: PI_RATIO, tol: { rel: 0.005 },
      errors: [{ value: (ME / MMU) ** 2, feedback: t`Include the phase-space factor: the electron’s larger energy release favours it by $(m_\pi^2 - m_e^2)^2/(m_\pi^2 - m_\mu^2)^2$.` }, { value: ((MPI ** 2 - ME ** 2) / (MPI ** 2 - MMU ** 2)) ** 2, feedback: t`That is only the phase-space factor. The helicity suppression $(m_e/m_\mu)^2$ is what makes the electron channel rare.` }],
      hints: [t`$(m_e/m_\mu)^2 = ${tex((ME / MMU) ** 2, 4)}$.`, t`$\dfrac{m_\pi^2 - m_e^2}{m_\pi^2 - m_\mu^2} = \dfrac{${fmt(MPI ** 2 - ME ** 2, 6)}}{${fmt(MPI ** 2 - MMU ** 2, 5)}}$.`],
      teach: 'Angular momentum plus left-handed weak currents suppress π → eν by (mₑ/m_μ)²: a conservation law shows up as a factor of 10⁴.',
      explain: t`$${tex(PI_RATIO, 4)}$: about one decay in 8000 gives an electron. Measured: $1.23\times10^{-4}$; the 4% difference is radiative corrections. Had the weak interaction treated both helicities alike, the electron channel would have dominated — this ratio was among the strongest early evidence for the left-handed (V − A) structure of weak interactions. Cosmic-ray pions in the upper atmosphere therefore make muons, which is why muons, not electrons, dominate the charged particles reaching the ground.`,
      visual: diagram([fermion(1, 3.6, 3.6, 3), fermion(3.6, 3, 1, 2.4), boson(3.6, 3, 6.4, 3, { kind: 'W' }), fermion(6.4, 3, 9, 5), fermion(9, 1, 6.4, 3), vertex(3.6, 3), vertex(6.4, 3),
        tag(1, 3.6, 'd', 'accent', -8, 0, 'right'), tag(1, 2.4, 'ū', 'accent', -8, 0, 'right'), tag(1, 3, 'π⁻', 'ink2', -26, 0, 'right'), tag(5, 3, 'W⁻', 'violet', 0, -16, 'center'), tag(9, 5, 'μ⁻ or e⁻', 'warn', 8, 0, 'left'), tag(9, 1, 'ν̄μ or ν̄ₑ', 'warn', 8, 0, 'left')], { caption: 'Schematic: a π⁻ annihilates its quark and antiquark into a virtual W⁻, which becomes a charged lepton and an antineutrino. Back-to-back in the pion’s rest frame, both must be left-handed — possible only through the lepton’s mass. Time runs left to right.' }),
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Elementary Particles (Wiley, 2008), ch. 2, 6–9', url: 'https://www.wiley.com/en-us/Introduction+to+Elementary+Particles%2C+2nd+Revised+Edition-p-9783527406012' },
    { label: 'Particle Data Group (2024), Review of Particle Physics, Phys. Rev. D 110, 030001', url: 'https://pdg.lbl.gov/' },
    { label: 'David Peak, PHYS 3710 Structure of Matter notes and Problem Set 11 (QED Feynman diagrams), USU', url: 'https://digitalcommons.usu.edu/intermediate_modernphysics_problems/11/' },
    { label: 'MEG II Collaboration (2024), A search for μ⁺ → e⁺γ with the first dataset of the MEG II experiment, Eur. Phys. J. C 84, 216', url: 'https://doi.org/10.1140/epjc/s10052-024-12416-2' },
  ],
});
