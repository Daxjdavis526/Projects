// Massless particles and four-momentum — energy and momentum as one
// four-vector whose length, E² − (pc)² = (mc²)², every observer agrees on;
// massless particles on the light lines (E = pc, always at c); the invariant
// mass of a system, √s, and threshold energies: the Bevatron's antiprotons
// (worked example, K = 6m_pc² = 5.63 GeV), π⁰ production, fixed target
// against collider (an LHC proton on a proton at rest: 113 GeV), deuteron
// photodisintegration, Λ → pπ⁻, SN 1987A's neutrinos and KATRIN's mass
// limit, and the GZK cutoff of cosmic rays on the CMB. Single-particle mass
// shells, π → μν, K → ππ and two-photon invariant masses are in gr.S04.d;
// Compton scattering and pair production are lessons MP4.2 and MP4.3.
// Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { MPC2, MNC2, MDC2, MPI0C2, KB_EV, T_CMB, LY, YEAR } from './_constants.js';
import { seg, label, frame, disc, r6 } from './_diagrams.js';
import * as R from '../../src/viz/model/mp-fourmomentum.js';

const t = String.raw;
const mp = MPC2;
// the Bevatron
const BEV = { Kth: R.thresholdFixed(mp, mp, 4 * mp), K: 6200 };
BEV.sqrtS = R.sqrtSFixed(mp, mp, BEV.K);
// π⁰ production on a proton at rest
const PI_TH = R.thresholdFixed(mp, mp, 2 * mp + MPI0C2);
// the LHC's 6.8 TeV beam
const LHC = { K: 6.8e6 };
LHC.fixed = R.sqrtSFixed(mp, mp, LHC.K); LHC.coll = R.sqrtSCollider(mp, mp, LHC.K);
// γ + d → p + n
const BD = mp + MNC2 - MDC2, PHOTO = R.thresholdFixed(0, MDC2, mp + MNC2);
// Λ → p π⁻ at rest
const LAM = R.twoBody(R.PARTICLES.Lambda.m, mp, R.PARTICLES['pi-'].m);
// SN 1987A neutrinos: lag behind light for mass m (eV) and energy E (MeV), over D light-years
const D_LMC = 162000;                                  // ly: 49.59 kpc (Pietrzyński et al. 2019)
const lagMs = (mEV, EMeV) => ((D_LMC * LY) / 2.99792458e8) * ((mEV * 1e-6) / EMeV) ** 2 / 2 * 1e3;
// the GZK cutoff: a proton meeting a typical CMB photon head-on
const EG = 2.701178 * KB_EV * T_CMB;                   // eV: the mean energy of a CMB photon, 2.701 kT
const GZK = R.thresholdOnPhoton(mp, EG * 1e-6, mp + MPI0C2) * 1e6;   // eV

/** A schematic head-on meeting: a particle from the left, another from the right. */
function headOn({ left, right, leftColor = 'accent', rightColor = 'gold', wavy = 'right', caption }) {
  const wave = { param: ['3.6 - 1.6*t', '0.18*sin(31.4*t)'], t: [0, 1], color: rightColor, width: 2.2 };
  return {
    type: 'graph',
    params: frame([-4, 4], [-1.2, 1.2], {
      aspect: 'wide',
      shade: [disc(-2.6, 0, 0.32, leftColor, 0.9)],
      curves: wavy === 'right' ? [wave] : [],
      arrows: [{ from: [-2.15, 0], to: [-0.9, 0], color: leftColor, width: 2.6 }, ...(wavy === 'right' ? [{ from: [2.05, 0], to: [1.75, 0], color: rightColor, width: 2.2 }] : [{ from: [2.15, 0], to: [0.9, 0], color: rightColor, width: 2.6 }])],
      points: [label(-2.6, 0, left, leftColor, 0, 30, 'center'), label(2.8, 0, right, rightColor, 0, 30, 'center')],
    }),
    caption,
  };
}

/** The (pc, E) plane: light lines, one mass hyperbola, and marked points. */
function massShell({ points = [], caption }) {
  return {
    type: 'graph',
    params: {
      x: [-3, 3], y: [0, 3.2], equal: true, aspect: 'wide', xlabel: 'pc (units of mc²)', ylabel: 'E', axesAt: 'edge',
      curves: [{ fn: 'abs(x)', color: 'gold', width: 2.4 }, { fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.2, dash: true }],
      legend: [{ label: 'light: E = |pc|', color: 'gold' }, { label: 'mass m: E² − (pc)² = (mc²)²', color: 'accent', dash: [6, 5] }], legendAt: 'br',
      points,
    },
    caption,
  };
}

export default lesson({
  id: 'phys2710.MP3.3',
  title: 'Massless particles and four-momentum',
  minutes: 15, difficulty: 3,
  intro: t`Energy and momentum transform together under a Lorentz boost, exactly as $ct$ and $x$ do. Packed into one **four-momentum** $P = (E/c,\ \vec p)$, they have a “length” that every observer agrees on — the mass:

$$E^2 - (pc)^2 = (mc^2)^2, \qquad v = \frac{pc^2}{E}$$

A particle with $m = 0$ has $E = pc$ and moves at $c$ in every frame: light, and to excellent approximation a neutrino. For a **system**, add the four-momenta: $\sqrt s = \sqrt{(\sum E)^2 - (\sum \vec p\,c)^2}$ is its invariant mass, the energy available in the centre-of-momentum frame. A collision can make new particles only if $\sqrt s \ge \sum m_ic^2$ — the **threshold** — and since $\sqrt s$ is the same in every frame, it can be worked out in the lab and used in the centre of momentum.

> You met four-momentum and the mass shell in [Four-velocity, four-momentum and invariants](#/lesson/gr.S04.d). Here: what the invariant says about collisions — why fixed-target experiments waste most of their energy, and how the antiproton was found.`,
  symbols: [
    { tex: 'P', text: t`four-momentum $(E/c,\ \vec p)$; for several particles, add the parts` },
    { tex: 'E,\\ \\vec p', text: t`energy (MeV) and momentum (MeV/$c$) in a given frame` },
    { tex: 'm', text: t`mass, the same in every frame; $mc^2$ in MeV (proton: ${fmt(mp, 6)} MeV)` },
    { tex: '\\sqrt s', text: t`the invariant mass of a system times $c^2$: its total energy in the frame where its total momentum is zero, in MeV` },
    { tex: 'K_{\\text{th}}', text: 'threshold kinetic energy: the least a beam particle needs to make a given set of particles, in MeV' },
    { tex: 'v', text: t`a particle’s speed; $v = c$ exactly when $m = 0$` },
  ],
  why: 'Every accelerator ever built was sized by a threshold calculation, and the invariant mass is how the Higgs boson, the Z and every new particle are found: in the debris, the total four-momentum of the products has the mass of the parent.',
  visual: {
    type: 'mp-collide',
    title: 'Collisions on the energy–momentum diagram',
    lead: t`The Bevatron fired protons at protons at rest to make antiprotons: $p + p \to p + p + p + \bar p$. The beam (blue) and target (violet) arrows add to the gold total, whose hyperbola marks $\sqrt s$. The red hyperbola is $4m_pc^2$: the total must reach it for the reaction to go. Change the beam energy, slide the observer’s frame, or choose another situation.`,
    tasks: [
      t`At the Bevatron’s ${fmt(BEV.K / 1e3, 2)} GeV, $\sqrt s = ${fmt(BEV.sqrtS / 1e3, 4)}$ GeV, just above $4m_pc^2 = ${fmt((4 * mp) / 1e3, 4)}$ GeV. Lower $K$ to ${fmt(BEV.Kth / 1e3, 4)} GeV and the gold hyperbola touches the red one: threshold.`,
      'Drag the frame to CM: the total momentum vanishes and the total energy equals √s. At threshold the four products could all sit at rest in this frame. At “beam at rest” the target flies in instead — same collision, same √s.',
      t`Choose “An LHC proton on a proton at rest”: of a ${fmt(LHC.K / 1e6, 2)} TeV beam, only $\sqrt s = ${fmt(LHC.fixed / 1e3, 3)}$ GeV is available. Head-on, $\sqrt s = ${fmt(LHC.coll / 1e6, 3)}$ TeV.`,
    ],
    params: { scenario: 'bevatron', K: BEV.K, controls: ['scenario', 'K', 'frame'] },
  },
  example: {
    prompt: t`In 1955 Chamberlain, Segrè, Wiegand and Ypsilantis made the first antiprotons by firing protons from Berkeley’s Bevatron into a target. Conservation of charge and of baryon number mean the simplest reaction is $p + p \to p + p + p + \bar p$. What is the least kinetic energy the beam proton needs, if the target proton is at rest? ($m_pc^2 = ${fmt(mp, 6)}$ MeV.)`,
    visual: { type: 'mp-collide', params: { scenario: 'bevatron', K: r6(BEV.Kth), controls: false }, caption: 'The Bevatron reaction exactly at threshold, in the lab: the total’s hyperbola (gold) touches the red one, 4mₚc². Drawn to scale.' },
    steps: [
      { label: 'Use the invariant in the lab', text: t`With $c = 1$ and energies in MeV: the beam has $(E, p)$, the target $(m, 0)$. So $s = (E + m)^2 - p^2 = E^2 - p^2 + 2Em + m^2 = 2m^2 + 2Em$.` },
      { label: 'Use the same invariant in the CM frame', text: t`Cheapest outcome: the four products all at rest in the centre-of-momentum frame. Then the total energy there is $4m$ and the momentum zero, so $s = (4m)^2 = 16m^2$.` },
      { label: 'Equate', text: t`$2m^2 + 2Em = 16m^2$, so $E = 7m$ and $K = E - m = 6m = 6\times${fmt(mp, 6)}$ MeV $= ${fmt(BEV.Kth / 1e3, 4)}$ GeV.` },
      { label: 'Where the energy goes', text: t`Only $2m = ${fmt((2 * mp) / 1e3, 4)}$ GeV becomes new mass. The rest is kinetic energy the products must keep, because the beam’s momentum has to be conserved: the products move off together at $${fmt(R.velocity([7 * mp + mp, Math.sqrt(48) * mp]), 3)}c$. Head-on, with two beams, each proton would need only $K = m_pc^2 = ${fmt(mp / 1e3, 4)}$ GeV.` },
      { label: 'Sense check', text: t`The Bevatron was built to reach about 6.2 GeV with this threshold in mind. Its protons hit copper, whose bound nucleons move (Fermi motion), which lowers the threshold a little — part of why antiprotons appeared at 6.2 GeV in usable numbers. Segrè and Chamberlain shared the 1959 Nobel Prize.` },
    ],
    answer: t`$K_{\text{th}} = 6m_pc^2 = ${fmt(BEV.Kth / 1e3, 4)}$ GeV, three times the $2m_pc^2$ of new mass made.`,
  },
  practice: [
    num({
      id: 'lhc-fixed', difficulty: 2,
      prompt: t`An LHC proton, kinetic energy ${fmt(LHC.K / 1e6, 2)} TeV, hits a proton at rest — as in LHCb’s gas-target experiments. How much energy is available in the centre-of-momentum frame, $\sqrt s$, in GeV? ($m_pc^2 = ${fmt(mp, 6)}$ MeV.)`,
      answer: LHC.fixed / 1e3, units: 'GeV', tol: { rel: 0.005 },
      errors: [{ value: LHC.K / 1e3, feedback: 'That is the beam’s energy. Most of it is locked into the motion of the centre of momentum and cannot make new particles.' }, { value: LHC.coll / 1e3, feedback: 'That is √s for two beams colliding head-on. With the target at rest, s = 2m² + 2Em.' }],
      hints: [t`$s = 2(m_pc^2)^2 + 2E\,m_pc^2$ with $E = K + m_pc^2$.`, t`$s = 2m(K + 2m)$ when the masses are equal; take the square root.`],
      teach: 'On a fixed target √s = √(2mc²(K + 2mc²)) grows only as the square root of the beam energy; head-on, √s = 2E.',
      explain: t`$\sqrt s = \sqrt{2\times${fmt(mp, 6)}\times(${tex(LHC.K, 2)} + ${fmt(2 * mp, 6)})}$ MeV $= ${fmt(LHC.fixed / 1e3, 4)}$ GeV — under 1% of the ${fmt(LHC.coll / 1e3, 5)} GeV the same protons reach head-on. That is why the LHC is a collider.`,
      visual: { type: 'mp-collide', params: { scenario: 'lhcfixed', K: LHC.K, controls: false, readout: false, hide: ['mass'] }, caption: 'An LHC proton (blue) and a proton at rest (too small to see at this scale) on the energy–momentum diagram. Their total (gold) lies almost along the light line: large E, large p, little invariant mass.' },
    }),
    num({
      id: 'pion-threshold', difficulty: 3,
      prompt: t`Proton beams make neutral pions on hydrogen targets: $p + p \to p + p + \pi^0$. What is the threshold kinetic energy of the beam, in MeV? ($m_pc^2 = ${fmt(mp, 6)}$ MeV, $m_{\pi^0}c^2 = ${fmt(MPI0C2, 6)}$ MeV.)`,
      answer: PI_TH, units: 'MeV', tol: { rel: 0.005 },
      errors: [{ value: MPI0C2, feedback: t`That is just the pion’s rest energy. Momentum must also be conserved, so the products keep some kinetic energy: use the invariant $s$.` }],
      hints: [t`At threshold, $\sqrt s = M = 2m_p + m_\pi$ (with $c = 1$).`, t`In the lab $s = (2m_p)^2 + 2Km_p$, so $K_{\text{th}} = \dfrac{M^2 - (2m_p)^2}{2m_p}$.`],
      teach: t`Fixed-target threshold: $K_{\text{th}} = \dfrac{(\sum m)^2 - (m_{\text{beam}} + m_{\text{target}})^2}{2m_{\text{target}}}\,c^2$.`,
      explain: t`$M = ${fmt(2 * mp + MPI0C2, 6)}$ MeV, so $K_{\text{th}} = \dfrac{M^2 - (2m_p)^2}{2m_p} = \dfrac{m_\pi(4m_p + m_\pi)}{2m_p} = ${fmt(PI_TH, 4)}$ MeV — more than twice the pion’s mass. Berkeley’s synchrocyclotron, with 380 MeV alpha particles, made the first artificial pions in 1948.`,
      visual: { type: 'mp-collide', params: { scenario: 'pion', K: 400, controls: false, readout: false }, caption: t`A 400 MeV proton on a proton at rest. The total (gold) clears the red hyperbola, $2m_pc^2 + m_\pi c^2$: above threshold. Drawn to scale.` },
    }),
    num({
      id: 'deuteron-photo', difficulty: 3,
      prompt: t`A gamma ray can split a deuteron at rest into a proton and a neutron, $\gamma + d \to p + n$. The deuteron’s binding energy is $B = (m_p + m_n - m_d)c^2 = ${fmt(BD * 1e3, 5)}$ keV. What is the photon’s threshold energy, in keV, to five significant figures? ($m_dc^2 = ${fmt(MDC2, 7)}$ MeV.)`,
      answer: PHOTO * 1e3, units: 'keV', tol: { abs: 0.25, rel: 0 },
      errors: [{ value: BD * 1e3, feedback: t`That is $B$ itself. The photon also brings momentum $E/c$, so the proton and neutron must move off with a little kinetic energy.` }],
      hints: [t`A photon has $E = pc$: its four-momentum is $(E, E)$ with $c = 1$. With the deuteron at rest, $s = m_d^2 + 2Em_d$.`, t`Set $s = (m_p + m_n)^2 = (m_d + B)^2$: $E = B + \dfrac{B^2}{2m_d}$.`],
      teach: 'A massless particle still carries momentum E/c, so a photon’s threshold exceeds the energy the reaction needs at rest.',
      explain: t`$E = B + B^2/(2m_dc^2) = ${fmt(BD * 1e3, 5)} + ${fmt(((BD * BD) / (2 * MDC2)) * 1e3, 3)} = ${fmt(PHOTO * 1e3, 5)}$ keV. The extra ${fmt(((BD * BD) / (2 * MDC2)) * 1e3, 3)} keV is the kinetic energy of the proton–neutron pair, which carries the photon’s momentum away. Chadwick and Goldhaber first split deuterons this way in 1934, with 2.6 MeV gamma rays from thorium C″.`,
      visual: headOn({ left: 'deuteron, at rest', right: `photon, E ≥ ?`, leftColor: 'violet', rightColor: 'gold', caption: 'A photon meets a deuteron at rest. It brings energy E and momentum E/c. Not to scale.' }),
    }),
    num({
      id: 'lambda-decay', difficulty: 2,
      prompt: t`A $\Lambda^0$ (rest energy ${fmt(R.PARTICLES.Lambda.m, 7)} MeV) decays at rest into a proton (${fmt(mp, 6)} MeV) and a $\pi^-$ (${fmt(R.PARTICLES['pi-'].m, 7)} MeV). What momentum does the proton carry, in MeV/$c$?`,
      answer: LAM.p, units: 'MeV/c', tol: { rel: 0.005 },
      errors: [{ value: R.PARTICLES.Lambda.m - mp - R.PARTICLES['pi-'].m, feedback: t`That is the kinetic energy released, $Q$, shared by both. The momentum follows from $E^2 = (pc)^2 + (mc^2)^2$ for each, with equal and opposite momenta.` }],
      hints: [t`Equal and opposite momenta $p$, energies adding to $M$: $\sqrt{m_p^2 + p^2} + \sqrt{m_\pi^2 + p^2} = M$ ($c = 1$).`, t`The solution is $E_p = \dfrac{M^2 + m_p^2 - m_\pi^2}{2M}$, then $p = \sqrt{E_p^2 - m_p^2}$.`],
      teach: 'In a two-body decay at rest each product’s energy is fixed: E₁ = (M² + m₁² − m₂²)c²/(2M), and the momenta are equal and opposite.',
      explain: t`$E_p = ${fmt(LAM.E1, 6)}$ MeV, so $pc = \sqrt{${fmt(LAM.E1, 6)}^2 - ${fmt(mp, 6)}^2} = ${fmt(LAM.p, 4)}$ MeV. The pion, with the same momentum, takes most of the kinetic energy: ${fmt(LAM.E2 - R.PARTICLES['pi-'].m, 3)} of the ${fmt(R.PARTICLES.Lambda.m - mp - R.PARTICLES['pi-'].m, 3)} MeV. Bubble-chamber physicists found Λ’s from the V of these two tracks: their invariant mass always came out at 1116 MeV.`,
      visual: { type: 'mp-collide', params: { scenario: 'lambda', K: 0, controls: false, readout: false }, caption: 'Λ⁰ → p + π⁻ at rest: the two products’ four-momenta (blue, violet) add to the Λ’s (gold), straight up. Each ends on its own mass hyperbola. Drawn to scale.' },
    }),
    mcq({
      id: 'massless', difficulty: 2,
      prompt: t`Some particle is measured, in one frame, to have $E = pc$ exactly. What follows?`,
      visual: massShell({ points: [{ x: 1.6, y: 1.6, color: 'gold', r: 5, label: 'E = pc', labelDx: 10, labelDy: 12, labelAlign: 'left' }], caption: 'The (pc, E) plane: massless particles live on the light lines; a massive particle’s energy and momentum lie on its hyperbola, which never touches them.' }),
      choices: [
        'It is massless: it moves at c in every frame and has no rest frame',
        'It has mass E/c², because energy is mass',
        'It moves at c in this frame, but an observer chasing it could see it slower',
        'It must be at rest, because E = pc is the rest energy',
      ],
      answer: 0,
      why: {
        1: t`$E^2 - (pc)^2 = (mc^2)^2 = 0$: its mass is zero. A *system* of photons going different ways has mass, but a single particle with $E = pc$ has none.`,
        2: t`$E^2 - (pc)^2$ is the same in every frame, so $E = pc$ in all of them, and $v = pc^2/E = c$ in all of them. There is no frame where it slows.`,
        3: t`At rest $p = 0$, so $E = pc$ would give $E = 0$. The rest energy is $mc^2$, reached when $p = 0$.`,
      },
      hints: ['Work out E² − (pc)², and remember it is the same in every frame.'],
      teach: 'E = pc means zero mass: such a particle moves at c in every frame and has no rest frame.',
      explain: t`$E^2 - (pc)^2 = 0$ gives $m = 0$, and $v = pc^2/E = c$ in every frame, since the invariant cannot change. Photons are the example; gluons are massless too, and neutrinos come so close that only careful experiments find their mass.`,
    }),
    num({
      id: 'neutrino-lag', difficulty: 3, transfer: true,
      prompt: t`Neutrinos from supernova 1987A crossed about 162 000 light-years to reach Earth in February 1987. KATRIN’s 2025 upper limit on the neutrino mass is $0.45$ eV/$c^2$. How many milliseconds behind light would a 10 MeV neutrino of that mass arrive? (For $E \gg mc^2$: $1 - v/c \approx \tfrac12(mc^2/E)^2$.)`,
      answer: lagMs(0.45, 10), units: 'ms', tol: { rel: 0.01 },
      errors: [{ value: 2 * lagMs(0.45, 10), feedback: t`Check the factor: $1 - \beta \approx \tfrac12(mc^2/E)^2$, with the ½.` }],
      hints: [t`The delay is the travel time times $1 - v/c$: $\Delta t = \dfrac{D}{c}\cdot\tfrac12\left(\dfrac{mc^2}{E}\right)^2$.`, t`$D/c = 162\,000$ years $= ${tex(D_LMC * YEAR * (LY / (2.99792458e8 * YEAR)), 4)}$ s, and $mc^2/E = 0.45\ \text{eV}/10^7\ \text{eV}$.`],
      teach: 'A light, fast particle lags light by 1 − v/c ≈ ½(mc²/E)²: tiny, but over cosmic distances measurable.',
      explain: t`$mc^2/E = ${tex(4.5e-8, 2)}$, so $1 - v/c = ${tex(0.5 * 4.5e-8 ** 2, 3)}$; over $${tex(D_LMC * YEAR, 4)}$ s that is $${fmt(lagMs(0.45, 10), 3)}$ ms. The 1987 burst itself lasted about 13 s, so its arrival times bounded the mass only at several eV; KATRIN’s laboratory measurement does far better.`,
      visual: {
        type: 'graph',
        params: {
          x: [5, 40], y: [0, 120], aspect: 'wide', xlabel: 'neutrino energy (MeV)', ylabel: 'lag behind light (ms)', axesAt: 'edge',
          curves: [{ fn: `${r6(lagMs(2, 1))}/x^2`, color: 'ink3', width: 2, dash: true, label: 'mass 2 eV/c²', labelAt: 14, labelDx: 8, labelDy: -8 }, { fn: `${r6(lagMs(0.8, 1))}/x^2`, color: 'accent', width: 2.4, label: 'mass 0.8 eV/c²', labelAt: 8, labelDx: 8, labelDy: -8 }],
          vlines: [{ x: 10, label: '10 MeV', color: 'gold' }],
        },
        caption: t`How far a neutrino from SN 1987A trails the light, for two masses above today’s limit. The lag falls as $1/E^2$ and grows as $m^2$.`,
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-collider-pbar', difficulty: 2,
      prompt: t`Instead of a fixed target, two proton beams of equal energy meet head-on to make $p + p \to p + p + p + \bar p$. What is the least kinetic energy each beam proton needs, in MeV? ($m_pc^2 = ${fmt(mp, 6)}$ MeV.)`,
      answer: R.thresholdCollider(mp, 4 * mp), units: 'MeV', tol: { rel: 0.005 },
      errors: [{ value: BEV.Kth, feedback: 'That is the fixed-target threshold. Head-on the lab is the centre-of-momentum frame, so no energy is wasted on motion of the products.' }, { value: 2 * mp, feedback: t`That is each proton’s total energy, $2m_pc^2$. Subtract the rest energy for the kinetic energy.` }],
      hints: [t`Head-on with equal energies the total momentum is zero: $\sqrt s = 2E$.`],
      teach: 'In a symmetric collider the lab is the CM frame: the threshold is just Σm, shared between the beams.',
      explain: t`$\sqrt s = 2E \ge 4m_pc^2$, so $E = 2m_pc^2$ and $K = m_pc^2 = ${fmt(mp, 6)}$ MeV per beam — ${fmt(BEV.Kth / mp / 2, 3)} times less, in total, than the ${fmt(BEV.Kth / 1e3, 4)} GeV a fixed target needs.`,
      visual: { type: 'mp-collide', params: { scenario: 'ppbar', K: 1500, controls: false, readout: false }, caption: 'Two protons head-on at 1.5 GeV each: the total (gold) points straight up and clears the red threshold hyperbola, 4mₚc², with room to spare.' },
    }),
    num({
      id: 'cp-gzk', difficulty: 3, transfer: true,
      prompt: t`Space is filled with cosmic-microwave-background photons of typical energy $E_\gamma = ${fmt(EG * 1e4, 3)}\times10^{-4}$ eV. A cosmic-ray proton meeting one head-on can make a pion, $p + \gamma \to p + \pi^0$. Find the proton’s threshold energy, in units of $10^{20}$ eV. ($m_pc^2 = ${fmt(mp, 6)}$ MeV, $m_{\pi^0}c^2 = ${fmt(MPI0C2, 6)}$ MeV; for an ultra-relativistic proton, $pc \approx E$.)`,
      answer: GZK / 1e20, tol: { rel: 0.01 },
      errors: [{ value: (2 * GZK) / 1e20, feedback: t`Head-on, the photon’s momentum adds to the proton’s: $s \approx m_p^2 + 4EE_\gamma$, not $2EE_\gamma$.` }],
      hints: [t`Photon $(E_\gamma, -E_\gamma)$, proton $(E, p)$ with $p \approx E$ ($c = 1$): $s = m_p^2 + 2E_\gamma(E + p) \approx m_p^2 + 4EE_\gamma$.`, t`Set $s = (m_p + m_\pi)^2$: $E = \dfrac{(m_p + m_\pi)^2 - m_p^2}{4E_\gamma}$, with every energy in eV.`],
      teach: 'An invariant works across absurd energy ratios: a proton meeting a 10⁻³ eV photon needs about 10²⁰ eV to make a pion.',
      explain: t`$(m_p + m_\pi)^2 - m_p^2 = ${tex((mp + MPI0C2) ** 2 - mp * mp, 4)}$ MeV$^2 = ${tex(((mp + MPI0C2) ** 2 - mp * mp) * 1e12, 4)}$ eV², so $E = ${tex(GZK, 3)}$ eV. Protons above this lose energy to the CMB within a few hundred million light-years: the Greisen–Zatsepin–Kuzmin cutoff. Hotter photons in the CMB’s tail, meeting protons at all angles, lower the real cutoff to about $5\times10^{19}$ eV, where the Pierre Auger Observatory sees the cosmic-ray spectrum fall steeply — though whether that is this cutoff or the sources running out is still debated.`,
      visual: headOn({ left: 'cosmic-ray proton', right: 'CMB photon', leftColor: 'accent', rightColor: 'warn', caption: 'A cosmic-ray proton meets a microwave photon head-on. Not to scale: the proton carries some 10²³ times the photon’s energy.' }),
    }),
    mcq({
      id: 'cp-why-collide', difficulty: 2,
      prompt: 'Why have particle physicists built colliders, rather than firing beams at fixed targets, since the 1970s?',
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [0, 4.3], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'proton beam energy (GeV)', ylabel: '√s (GeV)',
          curves: [{ fn: 'log(2*10^x)/log(10)', color: 'gold', width: 2.6, label: 'two beams head-on', labelAt: 1.2, labelDx: -8, labelDy: -12, labelAlign: 'right' }, { fn: `log(sqrt(2*${r6(mp / 1e3)}*(10^x + ${r6(mp / 1e3)})))/log(10)`, color: 'accent', width: 2.6, label: 'beam on a proton at rest', labelAt: 3, labelDx: 0, labelDy: 16 }],
        },
        caption: 'Energy available to make new particles, √s, against beam energy, for protons. Logarithmic on both axes.',
      },
      choices: [
        t`On a fixed target $\sqrt s$ grows only as the square root of the beam energy; head-on it grows in proportion`,
        'Colliding beams hit each other more often than beams hit a solid target',
        'In a fixed target the beam loses most of its energy to the target’s electrons',
        'Head-on collisions double the speed at which the particles meet, past c',
      ],
      answer: 0,
      why: {
        1: 'The opposite: a solid target is packed with nuclei, while two beams are thin and rarely collide. Colliders accept far fewer collisions for far more energy per collision.',
        2: 'Ionizing electrons takes a tiny share of the energy. The real loss is kinematic: momentum conservation forces the products to keep moving.',
        3: 'Relative speeds never exceed c (velocity addition). What grows is the energy available in the centre-of-momentum frame.',
      },
      hints: ['Compare √s = √(2mc²(K + 2mc²)) with √s = 2E.'],
      teach: 'On a fixed target √s ≈ √(2Emc²), while head-on √s = 2E, so above a few GeV colliders win by orders of magnitude.',
      explain: t`At ${fmt(LHC.K / 1e6, 2)} TeV per proton, a fixed target gives $\sqrt s = ${fmt(LHC.fixed / 1e3, 3)}$ GeV and a collider ${fmt(LHC.coll / 1e3, 5)} GeV. To reach the LHC’s $\sqrt s$ on a fixed target a beam would need about $${tex((LHC.coll ** 2 / (2 * mp)) * 1e6, 2)}$ eV.`,
    }),
  ],
  sources: [
    { label: 'Chamberlain, Segrè, Wiegand & Ypsilantis (1955), Observation of antiprotons, Phys. Rev. 100, 947', url: 'https://doi.org/10.1103/PhysRev.100.947' },
    { label: 'KATRIN Collaboration (2025), Direct neutrino-mass measurement based on 259 days of KATRIN data, Science 388, 180', url: 'https://doi.org/10.1126/science.adq9592' },
    { label: 'Greisen (1966), End to the cosmic-ray spectrum?, Phys. Rev. Lett. 16, 748', url: 'https://doi.org/10.1103/PhysRevLett.16.748' },
    { label: 'Pietrzyński et al. (2019), A distance to the Large Magellanic Cloud that is precise to one per cent, Nature 567, 200', url: 'https://doi.org/10.1038/s41586-019-0999-4' },
    { label: 'Particle Data Group (2024), Review of Particle Physics: kinematics', url: 'https://pdg.lbl.gov/' },
  ],
});
