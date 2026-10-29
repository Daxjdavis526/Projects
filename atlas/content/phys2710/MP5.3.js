// Franck–Hertz and energy levels — electrons fired through mercury vapour can
// give an atom energy only in one lump, 4.89 eV, so the collector current
// drops each time the accelerating voltage passes another 4.89 V; the vapour
// glows at λ = hc/ΔE = 253.7 nm. Reading ΔE from peak spacings (not the first
// peak: contact potential), why elastic collisions cost nothing, collisions
// against photons, neon’s glowing layers, mercury’s 184.9 nm line, and the
// collisional excitation of oxygen in the aurora. A virtual experiment on
// model/mp-franck-hertz.js; every number is computed here or there.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import * as FH from '../../src/viz/model/mp-franck-hertz.js';
import { HC_EVNM, MEC2, UC2 } from './_constants.js';
import { seg, label, frame, r6 } from './_diagrams.js';
import { HG_LEVELS, HG_GPMOL, O_1D, O_1S } from './_quanta.js';

const t = String.raw;
const HG = FH.GASES.hg.E1, NE = FH.GASES.ne.E1;
const peaksAt = (gas, opts) => FH.peaks(FH.curve(gas, opts, 1500)).map((v) => +v.toFixed(1));
const EX = { contact: 2.1, Vr: 1.5 };
EX.peaks = peaksAt('hg', { Vr: EX.Vr, contact: EX.contact });
EX.dE = (EX.peaks[EX.peaks.length - 1] - EX.peaks[0]) / (EX.peaks.length - 1);
const ME_U = MEC2 / UC2;                                         // the electron’s mass in u

/** The simulation as a still picture for a question. */
const still = (params, caption) => ({ type: 'mp-franck-hertz', params: { play: false, controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** Mercury’s lowest levels above the ground state, to scale, with optional arrows [{ to, label, color, x, dashed }]. */
function hgLadder(arrows = [], caption) {
  const L = [[0, 'ground state'], [HG_LEVELS['3P0'], '4.67 eV'], [HG_LEVELS['3P1'], '4.89 eV'], [HG_LEVELS['3P2'], '5.46 eV'], [HG_LEVELS['1P1'], '6.70 eV'], [HG_LEVELS.ion, '10.44 eV: ionized']];
  const curves = L.map(([E]) => seg(0, E, 4.2, E, 'ink2', E === HG_LEVELS.ion ? 1.2 : 2, E === HG_LEVELS.ion));
  const points = L.map(([E, txt], i) => label(4.2, E, txt, 'ink2', 8, [0, 8, -3, -9, 0, 0][i]));
  return {
    type: 'graph',
    params: frame([-2.2, 7.4], [-0.8, 11.3], {
      aspect: 'wide', equal: false, curves, points,
      arrows: arrows.map((a) => ({ from: [a.x ?? 1.2, a.from ?? 0], to: [a.x ?? 1.2, a.to], color: a.color || 'gold', dash: a.dashed ? [5, 4] : undefined, label: a.label, labelDx: -8, labelDy: 0, labelAlign: 'right' })),
    }),
    caption: caption ?? 'Mercury’s ground state and its lowest excited levels, to scale (NIST). The 4.67 and 5.46 eV levels are metastable: they almost never return straight to the ground state by emitting light. The 4.89 eV level does, at 253.7 nm.',
  };
}

/** Atomic oxygen’s two auroral levels, to scale. */
const oLadder = (ask) => ({
  type: 'graph',
  params: frame([-2.5, 7.5], [-0.5, 4.9], {
    aspect: 'wide', equal: false,
    curves: [seg(0, 0, 4, 0, 'ink2', 2), seg(0, O_1D, 4, O_1D, 'ink2', 2), seg(0, O_1S, 4, O_1S, 'ink2', 2)],
    points: [label(4, 0, 'ground state', 'ink2', 8, 0), label(4, O_1D, `¹D: ${O_1D.toFixed(2)} eV`, 'ink2', 8, 0), label(4, O_1S, `¹S: ${O_1S.toFixed(2)} eV`, 'ink2', 8, 0)],
    arrows: [
      { from: [0.8, 0], to: [0.8, O_1S], color: 'accent', label: 'electron impact', labelDx: -8, labelDy: 0, labelAlign: 'right' },
      { from: [2.4, O_1S], to: [2.4, O_1D], color: 'good', label: ask === 'green' ? 'λ = ?' : 'green', labelDx: 8, labelDy: 0 },
      { from: [3.4, O_1D], to: [3.4, 0], color: 'bad', label: ask === 'red' ? 'λ = ?' : 'red', labelDx: 8, labelDy: 0 },
    ],
  }),
  caption: 'The two levels of atomic oxygen behind the aurora, to scale. Electrons raining down from the magnetosphere excite the atoms by collision, as in a Franck–Hertz tube; the atoms then drop down, emitting the green and the red auroral lines.',
});

export default lesson({
  id: 'phys2710.MP5.3',
  title: 'Franck–Hertz and energy levels',
  minutes: 14, difficulty: 3, lab: true,
  intro: t`Spectral lines show that atoms emit and absorb light only at certain energies. In 1914 James Franck and Gustav Hertz showed the same thing **without light**: they fired electrons through mercury vapour and found that an electron could give a mercury atom energy only in one lump. Below 4.9 eV the collisions were elastic and cost the electron almost nothing; an electron with more could hand over exactly 4.9 eV and keep the rest. The current that reached their collector fell each time the accelerating voltage passed another 4.9 V, and the vapour began to glow in the ultraviolet at the wavelength a 4.9 eV photon has:

$$\Delta V = \frac{\Delta E}{e}, \qquad \lambda = \frac{hc}{\Delta E}$$

Franck and Hertz at first read 4.9 eV as mercury’s ionization energy; Bohr pointed out that it was the first excited level. Either way, energy levels belong to the atom itself — whatever delivers the energy.`,
  symbols: [
    { tex: '\\Delta V', text: 'the spacing between successive peaks of the current, in volts' },
    { tex: '\\Delta E', text: t`the energy of the atom’s first excited level above its ground state: ${fmt(HG, 4)} eV for mercury` },
    { tex: 'e', text: t`the elementary charge, $1.602\times10^{-19}$ C: an electron crossing $\Delta V$ gains $e\,\Delta V$` },
    { tex: '\\lambda', text: 'the wavelength of the photon the excited atom emits when it returns to the ground state' },
    { tex: 'hc', text: '1239.8 eV nm' },
  ],
  why: 'The same collisional excitation lights neon signs and fluorescent tubes, colours the aurora and powers gas lasers; and Franck–Hertz was the first direct proof, independent of spectra, that an atom’s energy is quantized.',
  visual: {
    type: 'mp-franck-hertz',
    title: 'A Franck–Hertz tube',
    lead: t`Electrons leave the cathode and gain energy on the way to the grid; then they must climb a small retarding voltage to reach the anode, which gives the current. Middle: a typical electron’s kinetic energy along the tube. Bottom: the anode current against the accelerating voltage $V$, traced as you go.`,
    tasks: [
      'Press Sweep V: the current rises, then drops sharply just after 4.9 V, 9.8 V, 14.7 V … — each time electrons can afford one more excitation.',
      'Stop at 12 V and read the sawtooth: each electron excites two atoms and reaches the grid with about 2.2 eV, enough to beat the 1.5 V retarding voltage.',
      'Switch to neon and sweep again: glowing layers appear one at a time, every 18.7 V or so — count them against V.',
    ],
    params: { gas: 'hg', V: 12, Vr: 1.5 },
  },
  example: {
    prompt: t`A Franck–Hertz tube of mercury vapour, with a retarding voltage of ${EX.Vr} V, gives current peaks at ${EX.peaks.map((v) => `${v.toFixed(1)} V`).join(', ')}. Find mercury’s excitation energy, explain why the first peak is not at that voltage, and predict the wavelength the vapour emits.`,
    visual: still({ gas: 'hg', V: 24, Vr: EX.Vr, contact: EX.contact, hide: ['E1'] }, `The tube at 24 V with a ${EX.contact} V contact potential, and its current curve. The spacing label is hidden: reading it is the exercise.`),
    steps: [
      { label: 'Use the spacings', text: t`Successive peaks differ by ${EX.peaks.slice(1).map((v, i) => (v - EX.peaks[i]).toFixed(1)).join(', ')} V. Averaging all of them at once: $\Delta V = \dfrac{${EX.peaks[EX.peaks.length - 1].toFixed(1)} - ${EX.peaks[0].toFixed(1)}}{${EX.peaks.length - 1}}\ \text{V} = ${fmt(EX.dE, 3)}$ V.` },
      { label: 'The energy', text: t`Each extra peak means one more excitation per electron, so $\Delta E = e\,\Delta V = ${fmt(EX.dE, 3)}$ eV.` },
      { label: 'Why not the first peak', text: t`The first peak sits at ${EX.peaks[0].toFixed(1)} V, not ${fmt(EX.dE, 2)} V. The cathode and grid are different metals, so a **contact potential** — here about ${fmt(EX.peaks[0] - EX.dE, 2)} V — adds to the voltage the electrons actually feel. It shifts every peak equally, so the spacing is still honest. (The same trick saved Millikan’s slope in lesson MP4.1.)` },
      { label: 'The light', text: t`An atom raised by $\Delta E$ returns to the ground state by emitting one photon: $\lambda = \dfrac{1239.8\ \text{eV nm}}{${fmt(EX.dE, 3)}\ \text{eV}} = ${fmt(HC_EVNM / EX.dE, 4)}$ nm, in the ultraviolet.` },
      { label: 'Sense check', text: t`Spectroscopy puts mercury’s strongest ultraviolet line at 253.7 nm, from a level ${fmt(HG, 4)} eV up: agreement within ${fmt(Math.abs(HC_EVNM / EX.dE / 253.73 - 1) * 100, 1)}%. Franck and Hertz saw that 253.7 nm line appear in their vapour exactly when the electrons were fast enough — and not before.` },
    ],
    answer: t`$\Delta E = ${fmt(EX.dE, 3)}$ eV; the first peak is shifted by a contact potential of about ${fmt(EX.peaks[0] - EX.dE, 2)} V; the vapour emits at $${fmt(HC_EVNM / EX.dE, 4)}$ nm (measured: 253.7 nm).`,
  },
  practice: [
    num({
      id: 'uv-line', difficulty: 1,
      gen(r) {
        const dV = r.pick([4.86, 4.88, 4.90, 4.92]);
        return {
          prompt: t`A student’s Franck–Hertz curve for mercury has its peaks ${dV.toFixed(2)} V apart on average. What wavelength of light does this predict the vapour emits, in nm?`,
          answer: HC_EVNM / dV, units: 'nm', tol: { rel: 0.003 },
          errors: [{ value: dV / HC_EVNM * 1e6, feedback: t`Invert: $\lambda = hc/\Delta E$, with $hc = 1239.8$ eV nm.` }],
          hints: [t`The peak spacing gives the excitation energy: $\Delta E = e\,\Delta V = ${dV.toFixed(2)}$ eV.`, t`$\lambda = 1239.8\ \text{eV nm}/\Delta E$.`],
          teach: 'An atom excited by ΔE in a collision gives that energy back as one photon of wavelength hc/ΔE.',
          explain: t`$\lambda = 1239.8/${dV.toFixed(2)} = ${fmt(HC_EVNM / dV, 4)}$ nm — mercury’s 253.7 nm ultraviolet line, within the precision of the curve.`,
          visual: still({ gas: 'hg', V: 20, hide: ['E1'] }),
        };
      },
    }),
    num({
      id: 'from-peaks', difficulty: 2,
      gen(r) {
        const contact = r.pick([1.8, 2.5]), Vr = r.pick([1.0, 1.5]);
        const pk = peaksAt('hg', { Vr, contact }), dE = (pk[pk.length - 1] - pk[0]) / (pk.length - 1);
        return {
          prompt: t`A mercury Franck–Hertz tube gives current peaks at ${pk.map((v) => `${v.toFixed(1)}`).join(', ')} V. What is mercury’s excitation energy, in eV?`,
          answer: dE, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: pk[0], feedback: 'The first peak is shifted by the contact potential between the electrodes. Use the spacing between peaks, which the shift cannot change.' }, { value: pk[pk.length - 1] / pk.length, feedback: 'Dividing the last peak by the number of peaks includes the contact potential’s shift. Use differences between peaks.' }].filter((e) => Math.abs(e.value - dE) > 0.015 * dE),
          hints: ['The voltage the electrons feel is shifted by an unknown contact potential, the same for every peak.', t`Average the spacings: $(V_\text{last} - V_\text{first})$ divided by the number of gaps.`],
          teach: 'Read an excitation energy from the spacing of the peaks, never from the position of the first one.',
          explain: t`$\Delta E = \dfrac{${pk[pk.length - 1].toFixed(1)} - ${pk[0].toFixed(1)}}{${pk.length - 1}}\ \text{eV} = ${fmt(dE, 3)}$ eV. The first peak is ${fmt(pk[0] - dE, 2)} V too high: that is the contact potential.`,
          visual: still({ gas: 'hg', V: 28, Vr, contact, hide: ['E1'] }, 'The tube’s current curve with a contact potential between its electrodes. The axis numbers are the data.'),
        };
      },
    }),
    mcq({
      id: 'why-drop', difficulty: 2,
      prompt: 'Just after the accelerating voltage passes 4.9 V, the anode current drops sharply. Why?',
      choices: [
        'Electrons now reach 4.9 eV just before the grid, give it all to mercury atoms, and arrive with too little energy to climb the retarding voltage',
        'At 4.9 eV the electrons start ionizing mercury atoms, and the ions block the current',
        'Mercury atoms absorb the electrons themselves once they are fast enough',
        'Above 4.9 V the electrons move too fast to be collected by the anode',
      ],
      answer: 0,
      why: {
        1: 'Ionizing mercury takes 10.4 eV. Franck and Hertz first thought so too; Bohr pointed out the 4.9 eV was an excitation.',
        2: 'The electrons are not absorbed: they lose energy and carry on, slowly. The atom keeps the 4.9 eV, not the electron.',
        3: 'Faster electrons have no trouble reaching the anode; it is the slow ones, robbed of 4.9 eV, that the retarding voltage turns back.',
      },
      hints: ['Where along the tube does an electron first have 4.9 eV when V is just above 4.9 V?', 'After an inelastic collision near the grid, how much kinetic energy is left to climb the retarding voltage?'],
      teach: 'An electron that excites an atom near the grid arrives with almost nothing left, so the retarding voltage stops it.',
      explain: 'Just above 4.9 V the electrons gain 4.9 eV right in front of the grid, excite an atom and keep only the small excess — less than eVr — so the retarding field turns them back and the current falls. Raise V further and they excite earlier, regain energy, and get through again — until they can afford a second excitation at 9.8 V.',
      visual: still({ gas: 'hg', V: 4, Vr: 1.5, hide: ['E1'] }, 'The tube at 4.0 V, below the first drop: every electron reaches the grid with about 4 eV and climbs the 1.5 V barrier.'),
    }),
    num({
      id: 'layers', difficulty: 2,
      gen(r) {
        const V = r.pick([42, 60, 75, 79]);
        const n = FH.excitations(V, NE);
        return {
          prompt: t`In a neon Franck–Hertz tube the excited atoms glow orange-red, so you can *see* where electrons excite atoms. Neon’s excitation energy is about ${NE} eV. At an accelerating voltage of ${V} V (no contact potential), how many glowing layers are there between cathode and grid?`,
          answer: n, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n + 1, feedback: t`A layer forms only where an electron has gained another full ${NE} eV: ${V} V buys $\lfloor ${V}/${NE} \rfloor = ${n}$ of them.` }],
          hints: [t`Each layer is where electrons have gained another ${NE} eV since the last.`, t`Count the whole multiples of ${NE} V in ${V} V.`],
          teach: 'Each glowing layer is one excitation per electron: the number of layers is the number of whole ΔE the voltage provides.',
          explain: t`$${V}/${NE} = ${fmt(V / NE, 3)}$, so a typical electron excites ${n} atoms — ${n} layers, where the electrons have gained ${NE} eV, ${fmt(2 * NE, 3)} eV, and so on. Raise V past ${fmt((n + 1) * NE, 3)} V and layer ${n + 1} appears at the grid and creeps back toward the cathode as V grows.`,
          visual: still({ gas: 'ne', V: 25, Vr: 4, graph: false }, 'The neon tube at 25 V, where one glowing layer has formed. Glow drawn schematically.'),
        };
      },
    }),
    num({
      id: 'elastic', difficulty: 3,
      prompt: t`Below 4.9 eV an electron bounces elastically off mercury atoms (mass ${HG_GPMOL} u). In a head-on elastic collision with an atom at rest, what is the largest fraction of its kinetic energy the electron can lose? (Electron mass: $${tex(ME_U, 4)}$ u.)`,
      answer: FH.elasticShare(ME_U, HG_GPMOL), tol: { rel: 0.01 },
      errors: [{ value: ME_U / HG_GPMOL, feedback: t`For a head-on elastic collision the fraction given away is $4mM/(m + M)^2 \approx 4m/M$: you are missing the factor 4.` }],
      hints: [t`From momentum and energy conservation in one dimension, a mass $m$ hitting $M$ at rest gives it a fraction $\dfrac{4mM}{(m + M)^2}$ of its kinetic energy.`, t`With $m \ll M$ that is about $4m/M$.`],
      teach: 'A light electron bouncing off a heavy atom loses almost no energy, so it keeps accelerating until it can excite the atom.',
      explain: t`$\dfrac{4mM}{(m + M)^2} \approx \dfrac{4m}{M} = ${tex(FH.elasticShare(ME_U, HG_GPMOL), 3)}$ — about one part in $10^5$. Even thousands of elastic bounces cost an electron only a few per cent of its energy, which is why the inelastic 4.9 eV losses dominate the curve.`,
      visual: {
        type: 'graph',
        params: frame([-5, 5], [-1.4, 1.4], {
          aspect: 'wide',
          points: [{ x: 1.4, y: 0, r: 26, color: 'ink3' }, label(1.4, -0.95, `mercury atom, ${Math.round(HG_GPMOL)} u`, 'ink3', 0, 0, 'center'), { x: -1.8, y: 0, r: 4, color: 'accent' }, label(-1.8, 0, 'electron', 'accent', 0, -14, 'center')],
          arrows: [{ from: [-4.4, 0.25], to: [-2.2, 0.25], color: 'accent' }, { from: [-2.2, -0.25], to: [-4.2, -0.25], color: 'accent', dash: [4, 4] }],
        }),
        caption: 'An electron bouncing straight back off a mercury atom, which hardly moves. Sizes not to scale.',
      },
    }),
    mcq({
      id: 'electron-vs-photon', difficulty: 2,
      prompt: 'A 6.0 eV electron and a 6.0 eV photon each meet a mercury atom in its ground state. Which can give the atom energy?',
      choices: [
        'Only the electron: it can excite the 4.89 eV level and keep the remaining 1.1 eV, while the photon must match a level exactly and 6.0 eV matches none',
        'Only the photon: light, not collisions, excites atoms',
        'Both: each gives the atom exactly 6.0 eV',
        'Neither: 6.0 eV does not match any of mercury’s levels',
      ],
      answer: 0,
      why: {
        1: 'Franck and Hertz excited atoms with electrons alone — the point of the experiment.',
        2: 'The atom has no level 6.0 eV up, so it cannot take exactly 6.0 eV from either.',
        3: 'A photon must be absorbed whole, so it needs an exact match; an electron can hand over part of its energy and keep the rest.',
      },
      hints: ['A photon is absorbed whole or not at all. Can an electron give away only part of its kinetic energy?'],
      teach: 'A photon needs an exact match to be absorbed; an electron can give any allowed excitation energy and keep the change.',
      explain: 'The photon would have to vanish and leave the atom with exactly 6.0 eV — no such level exists, so it passes by. The electron can excite the 4.67, 4.89 or 5.46 eV level and fly on with the difference. That is why collisions excite atoms over a wide range of electron energies, while absorption picks out sharp lines.',
      visual: hgLadder([{ to: 6.0, label: '6.0 eV', color: 'gold', x: 1.4, dashed: true }]),
    }),
    num({
      id: 'second-line', difficulty: 2,
      prompt: t`More refined Franck–Hertz tubes also show electrons losing ${HG_LEVELS['1P1'].toFixed(2)} eV, exciting mercury’s ¹P₁ level, which returns straight to the ground state. What wavelength does it emit, in nm?`,
      answer: HC_EVNM / HG_LEVELS['1P1'], units: 'nm', tol: { rel: 0.003 },
      errors: [{ value: HC_EVNM / (HG_LEVELS['1P1'] - HG), feedback: 'That is the jump down to the 4.89 eV level. This level returns straight to the ground state, emitting all 6.70 eV.' }],
      hints: [t`$\lambda = hc/E$ with $E = ${HG_LEVELS['1P1'].toFixed(2)}$ eV.`],
      teach: 'Every level an electron can excite shows up again as light of λ = hc/E when the atom falls back.',
      explain: t`$\lambda = 1239.8/${HG_LEVELS['1P1'].toFixed(3)} = ${fmt(HC_EVNM / HG_LEVELS['1P1'], 4)}$ nm — mercury’s 184.9 nm line, deep enough in the ultraviolet to split oxygen molecules, which is why some mercury lamps make ozone.`,
      visual: hgLadder([{ to: HG_LEVELS['1P1'], label: 'electron impact', color: 'accent', x: 0.8 }, { from: HG_LEVELS['1P1'], to: 0, label: 'λ = ?', color: 'violet', x: 2.6 }]),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-aurora', difficulty: 2, transfer: true,
      gen(r) {
        const which = r.pick(['green', 'red']), E = which === 'green' ? O_1S - O_1D : O_1D;
        return {
          prompt: t`The aurora is a Franck–Hertz tube the size of a planet: electrons from Earth’s magnetosphere excite oxygen atoms high in the atmosphere by collision. An oxygen atom raised to its ¹S level (${O_1S.toFixed(2)} eV) drops first to its ¹D level (${O_1D.toFixed(2)} eV), and that later to the ground state. What is the wavelength of the ${which} auroral line, ${which === 'green' ? 'from ¹S to ¹D' : 'from ¹D to the ground state'}, in nm?`,
          answer: HC_EVNM / E, units: 'nm', tol: { rel: 0.005 },
          errors: which === 'green' ? [{ value: HC_EVNM / O_1S, feedback: 'The green photon carries only the difference between the two excited levels, ¹S − ¹D.' }] : [{ value: HC_EVNM / (O_1S - O_1D), feedback: 'That is the green line, ¹S to ¹D. The red one is ¹D to the ground state.' }],
          hints: [t`The photon carries ${which === 'green' ? `$${O_1S.toFixed(2)} - ${O_1D.toFixed(2)}$` : `$${O_1D.toFixed(2)}$`} eV.`, t`$\lambda = 1239.8\ \text{eV nm}/E$.`],
          teach: 'Auroral colours are atomic levels excited by electron collisions, read through λ = hc/ΔE.',
          explain: t`$\lambda = 1239.8/${fmt(E, 4)} = ${fmt(HC_EVNM / E, 4)}$ nm (in vacuum; ${which === 'green' ? '557.7 nm in air' : '630.0 nm in air'}). ${which === 'green' ? 'The ¹S level lives under a second, so the green glow comes from about 100–150 km up.' : 'The ¹D level lives nearly two minutes, so collisions quench it lower down: the red glow comes only from above about 200 km.'}`,
          visual: oLadder(which),
        };
      },
    }),
    num({
      id: 'cp-neon', difficulty: 2,
      prompt: t`A neon Franck–Hertz tube gives current peaks at ${peaksAt('ne', { Vr: 4, contact: 1.5 }).map((v) => v.toFixed(1)).join(', ')} V. What is neon’s excitation energy, in eV?`,
      answer: (() => { const p = peaksAt('ne', { Vr: 4, contact: 1.5 }); return (p[p.length - 1] - p[0]) / (p.length - 1); })(),
      units: 'eV', tol: { rel: 0.01 },
      errors: [{ value: peaksAt('ne', { Vr: 4, contact: 1.5 })[0], feedback: 'The first peak includes a contact potential. Use the spacing of the peaks.' }],
      hints: [t`Average the spacing: (last − first) ÷ number of gaps.`],
      teach: 'The peak spacing measures the excitation energy whatever the gas.',
      explain: t`$\Delta E = \dfrac{${peaksAt('ne', { Vr: 4, contact: 1.5 }).slice(-1)[0].toFixed(1)} - ${peaksAt('ne', { Vr: 4, contact: 1.5 })[0].toFixed(1)}}{3}$ eV $\approx ${fmt((peaksAt('ne', { Vr: 4, contact: 1.5 }).slice(-1)[0] - peaksAt('ne', { Vr: 4, contact: 1.5 })[0]) / 3, 3)}$ eV — neon’s group of levels near 18.4–19.0 eV. Those atoms do not drop straight to the ground state: they stop at levels near 16.7 eV first, giving off the visible orange-red light of every neon sign.`,
      visual: still({ gas: 'ne', V: 79, Vr: 4, contact: 1.5, hide: ['E1'] }, 'The neon tube near the top of its range, and its current curve.'),
    }),
    mcq({
      id: 'cp-meaning', difficulty: 2,
      prompt: 'What did the Franck–Hertz experiment show that spectral lines alone did not?',
      choices: [
        'Atoms take in energy only in fixed amounts even from colliding electrons, so the energy levels belong to the atom, not to the way light interacts with it',
        'Electrons are waves that diffract through mercury vapour',
        'Mercury atoms are ionized by 4.9 eV electrons',
        'Light consists of photons of energy hf',
      ],
      answer: 0,
      why: {
        1: 'Electron diffraction came in 1927 (lesson MP6.1); Franck–Hertz treats the electrons as particles.',
        2: 'Mercury’s ionization energy is 10.4 eV; the 4.9 eV is its first excitation.',
        3: 'The photon was established by the photoelectric effect; Franck–Hertz is about the atom’s levels, probed without light.',
      },
      hints: ['What delivered the energy to the atoms in this experiment?'],
      teach: 'Quantized absorption by collision, with the matching light emitted, showed that energy levels are a property of the atom itself.',
      explain: 'Spectra could have been a peculiarity of how atoms handle light. Franck and Hertz excited atoms mechanically — with electrons — and found the same quantized step, followed by emission of the matching 253.7 nm photon. The levels are the atom’s own. They shared the 1925 Nobel Prize for it.',
      visual: still({ gas: 'hg', V: 18, Vr: 1.5 }),
    }),
  ],
  sources: [
    { label: 'Franck & Hertz (1914), Verh. Dtsch. Phys. Ges. 16, 457 — and their 1925 Nobel Prize', url: 'https://www.nobelprize.org/prizes/physics/1925/summary/' },
    { label: 'NIST Atomic Spectra Database: mercury and oxygen levels', url: 'https://www.nist.gov/pml/atomic-spectra-database' },
    { label: 'OpenStax University Physics Vol. 3, §6.4 (energy levels and the Bohr model)', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-4-bohrs-model-of-the-hydrogen-atom' },
  ],
});
