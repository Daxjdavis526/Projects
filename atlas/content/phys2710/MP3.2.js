// Energy, mass and E = mc² — the mass of a system is its energy at rest
// divided by c², so it is not the sum of its parts' masses: kinetic energy
// inside adds mass, binding energy removes it. Einstein's 1905 argument
// (a body emitting light, seen from two frames; worked exactly with the
// Doppler factors of MP2.5), the 2005 direct test with neutron capture on
// silicon and sulfur (Rainville et al.), neutron decay, colliding lumps and
// RHIC's gold-on-gold fireball, hydrogen's 14 μg per kilogram, a kettle, and
// the proton's mass, 99% not quark mass. The work–energy integral, the energy
// triangle, fission, fusion and the Sun are in phys2220.R1.4 and A1.2 and not
// repeated. Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, MEC2, MPC2, MNC2, UC2, M_N, M_H1, M_HE4, MDC2, M_SI28, M_SI29, M_S32, M_S33, M_AU197, M_UQ, M_DQ, TAU_N, IE_H } from './_constants.js';
import { seg, label, frame, circle, disc, r6 } from './_diagrams.js';

const t = String.raw;
const g = (b) => 1 / Math.sqrt(1 - b * b);
const C2 = C * C;
// neutron capture: the mass lost becomes gamma rays (keV)
const SN_SI = (M_SI28 + M_N - M_SI29) * UC2 * 1e3;
const SN_S = (M_S32 + M_N - M_S33) * UC2 * 1e3;
const SI_LEVEL = 4933.967;                         // keV, the ²⁹Si level most captures pass through
// neutron decay
const Q_N = MNC2 - MPC2 - MEC2;
// gold-197: the nucleus, and its energy per nucleon at RHIC
const M_AU = M_AU197 * UC2 - 79 * MEC2;            // MeV (the electrons' binding, about 0.6 MeV, neglected)
const RHIC_G = 100000 / (M_AU / 197);              // γ for 100 GeV per nucleon
// Einstein's lamp
const EL = { L: 1, b: 0.6 };
EL.G = g(EL.b); EL.fwd = (EL.L / 2) * EL.G * (1 + EL.b); EL.back = (EL.L / 2) * EL.G * (1 - EL.b);
// fractions of mass that are energy
const F_H = (IE_H * 1e-6) / (M_H1 * UC2);
const F_D = (MPC2 + MNC2 - MDC2) / (MPC2 + MNC2);
const F_HE = (2 * M_H1 + 2 * M_N - M_HE4) / (2 * M_H1 + 2 * M_N);
const QUARKS = 2 * M_UQ + M_DQ;
const F_WATER = (4184 * 80) / C2;                  // kettle: 80 K of heating per kg of water

/** Fractions of a mass that are energy, on a log axis; rows can be hidden (the question). */
function ladder({ hide = [], mark = null, caption }) {
  const rows = [
    ['water heated by 80 K', F_WATER, 'warn'],
    ['hydrogen atom: electron binding', F_H, 'accent'],
    ['deuteron: nuclear binding', F_D, 'violet'],
    ['helium-4 nucleus: nuclear binding', F_HE, 'violet'],
    ['proton: beyond its quarks’ masses', 1 - QUARKS / MPC2, 'gold'],
  ];
  const points = [];
  rows.forEach(([name, f, col], i) => {
    const y = 5 - i;
    if (hide.includes(i)) points.push({ x: -13.6, y, r: 0.01, color: col, label: `${name}: ?`, labelDx: 0, labelDy: -12, labelAlign: 'left' });
    else points.push({ x: r6(Math.log10(f)), y, color: col, r: 5, label: name, labelDx: Math.log10(f) > -4 ? -10 : 10, labelDy: -12, labelAlign: Math.log10(f) > -4 ? 'right' : 'left' });
  });
  if (mark != null) points.push({ x: r6(Math.log10(mark[0])), y: r6(5 - mark[1]), color: 'ink', r: 5, label: mark[2], labelDx: 10, labelDy: 12, labelAlign: 'left' });
  return {
    type: 'graph',
    params: { x: [-14, 0.4], y: [0.3, 5.7], xlog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'fraction of the mass that the energy accounts for, ΔE/(mc²)', ylabel: '', yticks: 0, points },
    caption: caption ?? 'How much of a system’s mass is the energy in question, from heating to the binding of nuclei and quarks. Logarithmic: each grid step is a factor of ten.',
  };
}

/** Energy levels of a nucleus after neutron capture, to scale in MeV. */
function levels({ top, name, product, cascade = true, caption }) {
  const W = 4;
  const curves = [seg(0, 0, W, 0, 'ink', 2.4), seg(0, top, W, top, 'gold', 2.4, true)];
  const arrows = [], points = [label(W, 0, `${product}, ground state`, 'ink', 10, 0, 'left'), label(W, top, `${name} + n, just captured: ?`, 'gold', 10, 0, 'left')];
  if (cascade) {
    const lv = SI_LEVEL / 1e3;
    curves.push(seg(0, lv, W, lv, 'ink2', 1.6));
    points.push(label(W, lv, `excited ${product}, ${fmt(lv, 4)} MeV`, 'ink2', 10, 0, 'left'));
    arrows.push({ from: [1.2, r6(top)], to: [1.2, r6(lv)], color: 'violet', width: 2.4 }, { from: [2.6, r6(lv)], to: [2.6, 0], color: 'violet', width: 2.4 });
    points.push(label(1.2, (top + lv) / 2, 'γ₁', 'violet', 10, 0, 'left'), label(2.6, lv / 2, 'γ₂', 'violet', 10, 0, 'left'));
  } else {
    arrows.push({ from: [2, r6(top)], to: [2, 0], color: 'violet', width: 2.4 });
    points.push(label(2, top / 2, 'γ rays', 'violet', 10, 0, 'left'));
  }
  return {
    type: 'graph',
    params: { x: [-0.5, 9], y: [-0.6, top + 1], aspect: 'wide', axesAt: 'edge', xlabel: '', xticks: 0, ylabel: 'energy (MeV)', curves, arrows, points },
    caption,
  };
}

/** Two equal lumps meeting head-on and sticking: before and after. */
function lumps({ b, m = '1.00 kg', caption }) {
  return {
    type: 'graph',
    params: frame([-4, 4], [-1.6, 1.6], {
      aspect: 'wide',
      shade: [disc(-2.6, 0.6, 0.35, 'accent', 0.85), disc(2.6, 0.6, 0.35, 'accent', 0.85), disc(0, -0.85, 0.45, 'violet', 0.85)],
      arrows: [{ from: [-2.15, 0.6], to: [-1.0, 0.6], color: 'accent', width: 2.4, label: `${b}c`, labelDx: -6, labelDy: -14 }, { from: [2.15, 0.6], to: [1.0, 0.6], color: 'accent', width: 2.4, label: `${b}c`, labelDx: -16, labelDy: -14 }],
      points: [label(-2.6, 0.6, m, 'ink', 0, 44, 'center'), label(2.6, 0.6, m, 'ink', 0, 44, 'center'), label(0, -0.85, 'one hot lump at rest: M = ?', 'violet', 0, 54, 'center'), label(-3.9, 1.35, 'before', 'ink3', 0, 0, 'left'), label(-3.9, -0.4, 'after', 'ink3', 0, 0, 'left')],
    }),
    caption: caption ?? 'Two identical lumps meet head-on and stick. The total momentum is zero before and after. Not to scale.',
  };
}

export default lesson({
  id: 'phys2710.MP3.2',
  title: 'Energy, mass and E = mc²',
  minutes: 14, difficulty: 3,
  intro: t`A particle of mass $m$ moving at speed $v$ carries energy and momentum

$$E = \gamma mc^2, \qquad K = (\gamma - 1)mc^2, \qquad E^2 = (pc)^2 + (mc^2)^2$$

At rest it still has $E_0 = mc^2$. Read the other way round, this says what mass **is**: a system’s mass is its energy, measured in the frame where its total momentum is zero, divided by $c^2$. So the mass of a composite system is not the sum of its parts’ masses. Kinetic energy and heat inside add to it; binding energy — the work needed to pull the parts apart — takes from it:

$$Mc^2 = \sum m_ic^2 + K_{\text{inside}} - B$$

The differences are tiny for chemistry and everyday heat, a part in a thousand for nuclei, and almost everything for a proton.

> You met these formulas, and $E = mc^2$ at work in the Sun and in fission, in [Relativistic momentum and energy](#/lesson/phys2220.R1.4). Here: why energy *has* mass, and how well that has been tested.`,
  symbols: [
    { tex: 'E', text: 'a particle’s or system’s total energy, in J or MeV' },
    { tex: 'K', text: 'kinetic energy, in J or MeV' },
    { tex: 'm,\\ M', text: t`masses, in kg or MeV/$c^2$; $M$ for a whole system — the same in every frame` },
    { tex: 'mc^2', text: t`rest energy: ${fmt(MEC2, 4)} MeV for an electron, ${fmt(MPC2, 6)} MeV for a proton; $1\ \text{u} = ${fmt(UC2, 8)}$ MeV/$c^2$` },
    { tex: '\\gamma', text: t`$1/\sqrt{1 - v^2/c^2}$` },
    { tex: 'B', text: 'binding energy: the energy needed to pull a bound system apart into free, resting parts, in MeV' },
    { tex: 'c', text: t`the speed of light; $c^2 = ${tex(C2, 5)}$ J/kg` },
  ],
  why: 'Nuclear power, the masses of every nucleus, the energy budgets of particle collisions and the fact that a proton weighs a hundred times its quarks are all the same statement: energy has mass, and a system’s mass is its energy at rest.',
  visual: {
    type: 'mp-collide',
    title: 'Two protons: the mass of the pair',
    lead: t`Two protons approach each other head-on, each with kinetic energy $K$. The arrows are four-momenta: $pc$ across, $E$ up. Each proton’s arrow ends on the hyperbola $E^2 - (pc)^2 = (m_pc^2)^2$; the gold arrow is their sum, and its length on the diagram’s own geometry, $\sqrt{E^2 - (pc)^2}$, is the mass of the pair.`,
    tasks: [
      t`At $K = 0$ the pair’s mass is $2m_p = ${fmt(2 * MPC2, 6)}$ MeV: the sum of the parts.`,
      t`At $K = 500$ MeV each, the pair weighs $\sqrt s = ${fmt(2 * (500 + MPC2), 6)}$ MeV/$c^2$ — the kinetic energy counts as mass.`,
      'Slide the observer’s frame. The total energy and momentum change; √s does not. Mass is what every observer agrees on.',
    ],
    params: { scenario: 'pp', K: 500, controls: ['K', 'frame'], range: [0, 3000] },
    caption: 'Four-momenta of two protons meeting head-on, to scale. The gold arrow is the total; its hyperbola marks √s, the pair’s mass times c², the same in every frame. Lab and centre-of-momentum frames coincide here.',
  },
  example: {
    prompt: t`Einstein’s 1905 argument, with numbers. A lamp at rest sends out two equal flashes of light in opposite directions, ${fmt(EL.L / 2, 2)} J each, so it loses energy $L = ${EL.L}$ J and does not recoil. Watch the same event from a frame in which the lamp moves at $${EL.b}c$ along the line of the flashes. Show that the lamp’s mass must fall by $L/c^2$.`,
    visual: {
      type: 'graph',
      params: frame([-4.2, 4.2], [-2.1, 1.7], {
        aspect: 'wide',
        shade: [disc(0, 0.75, 0.32, 'gold', 0.9), disc(0, -1.15, 0.32, 'gold', 0.9)],
        curves: [seg(-4.1, -0.25, 4.1, -0.25, 'ink4', 1, true)],
        arrows: [
          { from: [0.45, 0.75], to: [2.5, 0.75], color: 'warn', width: 2.4, label: `${fmt(EL.L / 2, 2)} J`, labelDx: 8, labelDy: 0 },
          { from: [-0.45, 0.75], to: [-2.5, 0.75], color: 'warn', width: 2.4, label: `${fmt(EL.L / 2, 2)} J`, labelDx: -8, labelDy: 0, labelAlign: 'right' },
          { from: [0.45, -1.15], to: [3.2, -1.15], color: 'accent', width: 3.2, label: `${fmt(EL.fwd, 3)} J`, labelDx: 8, labelDy: 0 },
          { from: [-0.45, -1.15], to: [-1.3, -1.15], color: 'bad', width: 1.6, label: `${fmt(EL.back, 3)} J`, labelDx: -8, labelDy: 0, labelAlign: 'right' },
          { from: [-0.3, -1.7], to: [0.6, -1.7], color: 'gold', width: 2, label: `lamp moves at ${EL.b}c`, labelDx: 8, labelDy: 0 },
        ],
        points: [label(-4.1, 1.45, 'lamp’s own frame', 'ink3', 0, 0, 'left'), label(-4.1, -0.5, `frame where the lamp moves at ${EL.b}c`, 'ink3', 0, 0, 'left')],
      }),
      caption: 'The two flashes in the lamp’s frame (top) and in a frame where the lamp moves to the right (bottom): the forward flash is blueshifted and carries more energy, the backward one less. Arrow lengths are not to scale.',
    },
    steps: [
      { label: 'Light energy is Doppler-shifted', text: t`Einstein showed that a flash’s energy transforms like its frequency (for photons, $E = hf$ makes it obvious). From MP2.5, head-on and tail-on the factors are $\gamma(1 \pm \beta)$: the flashes carry $${fmt(EL.L / 2, 2)}\times${fmt(EL.G, 3)}\times${fmt(1 + EL.b, 2)} = ${fmt(EL.fwd, 3)}$ J and $${fmt(EL.L / 2, 2)}\times${fmt(EL.G, 3)}\times${fmt(1 - EL.b, 2)} = ${fmt(EL.back, 3)}$ J — together $\gamma L = ${fmt(EL.G * EL.L, 3)}$ J.` },
      { label: 'Conserve energy in both frames', text: t`Lamp’s frame: $E_{\text{before}} = E_{\text{after}} + L$. Moving frame: $H_{\text{before}} = H_{\text{after}} + \gamma L$. Subtract: $(H - E)_{\text{before}} - (H - E)_{\text{after}} = (\gamma - 1)L = ${fmt((EL.G - 1) * EL.L, 3)}$ J.` },
      { label: 'That difference is kinetic energy', text: t`$H - E$ is the lamp’s energy seen moving minus its energy at rest: its kinetic energy in the moving frame. So the lamp’s kinetic energy fell by $${fmt((EL.G - 1) * EL.L, 3)}$ J — yet its speed is still $${EL.b}c$, because the flashes push equally both ways.` },
      { label: 'Same speed, less kinetic energy: less mass', text: t`$K = (\gamma - 1)Mc^2$ with $\gamma$ unchanged, so $(\gamma - 1)\,\Delta M\,c^2 = (\gamma - 1)L$ and $\Delta M = L/c^2 = ${EL.L}\ \text{J}/(${tex(C, 4)}\ \text{m/s})^2 = ${tex(EL.L / C2, 3)}$ kg. The speed $${EL.b}c$ cancels: any frame gives the same answer.` },
      { label: 'Sense check', text: t`Nothing in the argument cared that the energy left as light. Any energy a body gives away takes mass $E/c^2$ with it — Einstein’s 1905 conclusion. Einstein kept only the $\tfrac12v^2$ term of the kinetic energy; done exactly, as here, the result is the same.` },
    ],
    answer: t`The flashes carry $\gamma L = ${fmt(EL.G * EL.L, 3)}$ J in the moving frame, so the lamp loses $${fmt((EL.G - 1) * EL.L, 3)}$ J of kinetic energy at unchanged speed: its mass falls by $L/c^2 = ${tex(EL.L / C2, 3)}$ kg.`,
  },
  practice: [
    num({
      id: 'si-capture', difficulty: 2,
      prompt: t`When a silicon-28 nucleus captures a slow neutron it becomes silicon-29 and sheds the extra energy as gamma rays. Atomic masses (AME2020): $^{28}$Si ${M_SI28} u, $^{29}$Si ${M_SI29} u; the neutron ${M_N} u. What total gamma-ray energy should come out, in keV? Neglect the tiny recoil of the nucleus. ($1\ \text{u} = ${fmt(UC2, 8)}$ MeV/$c^2$.)`,
      answer: SN_SI, units: 'keV', tol: { rel: 0.002 },
      errors: [{ value: SN_SI / 1000, feedback: 'That is the energy in MeV. The question asks for keV.' }],
      hints: [t`The mass lost is $\Delta m = m(^{28}\text{Si}) + m_n - m(^{29}\text{Si})$. The atoms’ 14 electrons appear on both sides and cancel.`, t`$\Delta m = ${fmt((M_SI28 + M_N - M_SI29), 6)}$ u; multiply by $${fmt(UC2, 8)}$ MeV per u.`],
      teach: 'In a nuclear reaction the energy released is the mass lost times c²: here Δm·c² comes out as gamma rays.',
      explain: t`$\Delta m = ${fmt(M_SI28 + M_N - M_SI29, 6)}$ u, so $E = ${fmt(SN_SI, 5)}$ keV. Most captures emit two gamma rays in cascade, about 3539 and 4934 keV. In 2005 Rainville and colleagues compared Penning-trap masses with gamma-ray wavelengths measured by crystal diffraction for exactly this reaction and its sulfur cousin: $E = mc^2$ held to 4 parts in $10^7$ — the most precise direct test.`,
      visual: levels({ top: SN_SI / 1e3, name: '²⁸Si', product: '²⁹Si', caption: t`What happens after silicon-28 captures a neutron, to scale: the captured state (dashed) decays to the ground state of silicon-29, usually through the level at ${fmt(SI_LEVEL / 1e3, 4)} MeV.` }),
    }),
    num({
      id: 'neutron-q', difficulty: 2,
      prompt: t`A free neutron lives ${fmt(TAU_N / 60, 3)} minutes on average, then decays: $n \to p + e^- + \bar\nu_e$. Rest energies: neutron ${fmt(MNC2, 8)} MeV, proton ${fmt(MPC2, 8)} MeV, electron ${fmt(MEC2, 8)} MeV; the antineutrino’s is below 1 eV. How much kinetic energy do the products share, in MeV?`,
      answer: Q_N, units: 'MeV', tol: { rel: 0.003 },
      errors: [{ value: MNC2 - MPC2, feedback: 'That leaves out the electron, whose rest energy has to come out of the same budget.' }, { value: MNC2 - MPC2 + MEC2, feedback: 'The electron is made in the decay, so its rest energy is spent, not gained: subtract it.' }],
      hints: [t`Energy released $Q = (m_n - m_p - m_e)c^2$: the rest energy that disappears becomes kinetic energy.`, t`$${fmt(MNC2, 8)} - ${fmt(MPC2, 8)} - ${fmt(MEC2, 8)}$.`],
      teach: 'A decay releases Q = (initial mass − final masses)c², shared as the products’ kinetic energy.',
      explain: t`$Q = ${fmt(Q_N, 4)}$ MeV, shared between the electron, the antineutrino and (a little) the proton. A neutron is only ${fmt((Q_N / MNC2) * 100, 2)}% heavier than the products — enough to make every free neutron decay. Inside most nuclei the binding makes the neutron’s decay cost energy instead, which is why those nuclei are stable.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [0, 2], aspect: 'wide', axesAt: 'edge', xlabel: '', xticks: 0, ylabel: 'rest energy − 938 MeV',
          shade: [{ fn: r6(MNC2 - 938), lower: '0', from: 0.6, to: 1.6, color: 'violet', alpha: 0.7 }, { fn: r6(MPC2 - 938), lower: '0', from: 2.4, to: 3.4, color: 'accent', alpha: 0.7 }, { fn: r6(MPC2 + MEC2 - 938), lower: r6(MPC2 - 938), from: 2.4, to: 3.4, color: 'teal', alpha: 0.85 }],
          arrows: [{ from: [3.7, r6(MPC2 + MEC2 - 938)], to: [3.7, r6(MNC2 - 938)], color: 'gold', width: 2.2 }],
          hlines: [{ y: r6(MNC2 - 938), color: 'ink3' }],
          points: [label(1.1, MNC2 - 938, `neutron, ${fmt(MNC2, 8)} MeV`, 'violet', 0, -12, 'center'), label(2.9, (MPC2 - 938) / 2, 'proton', 'ink', 0, 0, 'center'), label(2.9, MPC2 - 938 + MEC2 / 2, '+ electron', 'ink', 0, 0, 'center'), label(3.7, (MPC2 + MEC2 + MNC2) / 2 - 938, 'Q = ?', 'gold', -8, 0, 'right')],
        },
        caption: 'Rest energies before and after neutron decay, measured upward from 938 MeV so the differences show. The gap is the energy the products share.',
      },
    }),
    num({
      id: 'sticky', difficulty: 2,
      gen(r) {
        const b = r.pick([0.6, 0.8, 0.5]);
        const M = 2 * g(b);
        return {
          prompt: t`Two lumps of putty, each of mass 1.00 kg, fly at each other at $${b}c$ (each, in the lab), collide head-on and stick. What is the mass of the single lump afterwards, in kg?`,
          answer: M, units: 'kg', tol: { rel: 0.003 },
          errors: [{ value: 2, feedback: 'Mass is not simply conserved: the kinetic energy turns into heat inside the lump, and that heat has mass.' }, { value: 2 + b * b, feedback: t`That adds Newton’s kinetic energy $\tfrac12mv^2$ as mass. At these speeds the kinetic energy is $(\gamma - 1)mc^2$.` }],
          hints: [t`The total momentum is zero, so the lump ends at rest: all the energy is rest energy, $Mc^2 = 2\gamma mc^2$.`, t`$\gamma = 1/\sqrt{1 - ${b}^2} = ${fmt(g(b), 5)}$.`],
          teach: 'When moving parts merge, their kinetic energy stays in the system as heat — and as mass: M = Σγm.',
          explain: t`$M = 2\gamma m = 2\times${fmt(g(b), 5)}\times1.00$ kg $= ${fmt(M, 4)}$ kg. The extra ${fmt(M - 2, 3)} kg is the heat — $${tex((M - 2) * C2, 3)}$ J — and the lump is heavier because of it. Cool it down and the mass returns, as radiation, to 2.00 kg.`,
          visual: lumps({ b }),
        };
      },
    }),
    num({
      id: 'h-atom', difficulty: 2,
      prompt: t`A hydrogen atom weighs less than a free proton plus a free electron, by its ionization energy, ${IE_H} eV, divided by $c^2$. By how many micrograms is one kilogram of hydrogen atoms lighter than the same protons and electrons pulled apart? (Hydrogen atom: $m_\text{H}c^2 = ${fmt(M_H1 * UC2, 7)}$ MeV.)`,
      answer: F_H * 1e9, units: 'μg', tol: { rel: 0.005 },
      errors: [{ value: F_H * 1e6, feedback: 'That is in milligrams. One kilogram is 10⁹ μg.' }, { value: F_H * 1e12, feedback: 'That is in nanograms. One kilogram is 10⁹ μg.' }],
      hints: [t`The fraction of each atom’s mass that is missing is $\dfrac{${IE_H}\ \text{eV}}{${fmt(M_H1 * UC2, 7)}\times10^6\ \text{eV}}$; the same fraction of a kilogram is missing.`],
      teach: 'Binding energy is missing mass: a bound system weighs less than its parts by B/c².',
      explain: t`The fraction is $${tex(F_H, 4)}$, so a kilogram is $${fmt(F_H * 1e9, 3)}\ \mu\text{g}$ lighter — far below what any balance could detect in a chemical reaction. Nuclear binding takes about a hundred thousand times larger fractions.`,
      visual: ladder({ hide: [1] }),
    }),
    num({
      id: 'kettle', difficulty: 1,
      gen(r) {
        const [kg, T0] = r.pick([[1.7, 20], [1.0, 15], [0.5, 10]]);
        const dm = (kg * 4184 * (100 - T0)) / C2;
        return {
          prompt: t`A kettle heats ${kg} kg of water from ${T0} °C to 100 °C. Water’s specific heat is 4184 J/(kg K). By how many nanograms does the water’s mass increase?`,
          answer: dm * 1e12, units: 'ng', tol: { rel: 0.005 },
          errors: [{ value: dm * 1e9, feedback: 'That is in micrograms. One kilogram is 10¹² ng.' }],
          hints: [t`Heat in: $Q = mc_w\Delta T$. Mass gained: $\Delta m = Q/c^2$.`, t`$Q = ${kg}\times4184\times${100 - T0}$ J $= ${tex(kg * 4184 * (100 - T0), 4)}$ J, and $c^2 = ${tex(C2, 4)}$ m²/s².`],
          teach: 'Heat is energy, so it has mass: Δm = Q/c², about 10⁻¹² of the mass for everyday heating.',
          explain: t`$\Delta m = ${tex(kg * 4184 * (100 - T0), 4)}\ \text{J}/(${tex(C2, 4)}\ \text{m}^2/\text{s}^2) = ${tex(dm, 3)}$ kg $= ${fmt(dm * 1e12, 3)}$ ng: real, and a few parts in $10^{12}$ of the water — about ten thousand times too small for the best balances to see.`,
          visual: ladder({ hide: [0], caption: 'Fractions of a mass that are energy, on a log axis. Everyday heat sits near the bottom left; the proton, top right, is almost all energy.' }),
        };
      },
    }),
    mcq({
      id: 'proton-quarks', difficulty: 2,
      prompt: t`A proton is two up quarks and a down quark. The Particle Data Group lists their masses as about ${M_UQ} MeV$/c^2$ (up) and ${M_DQ} MeV$/c^2$ (down). The proton’s mass is ${fmt(MPC2, 6)} MeV$/c^2$. Where is the rest?`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [0, 1050], aspect: 'wide', axesAt: 'edge', xlabel: '', xticks: 0, ylabel: 'mass (MeV/c²)',
          shade: [{ fn: r6(MPC2), lower: '0', from: 0.6, to: 1.6, color: 'gold', alpha: 0.75 }, { fn: r6(QUARKS), lower: '0', from: 2.4, to: 3.4, color: 'accent', alpha: 0.9 }],
          points: [label(1.1, MPC2, `proton: ${fmt(MPC2, 6)}`, 'gold', 0, -12, 'center'), label(2.9, QUARKS, `its three quarks: ${fmt(QUARKS, 3)}`, 'accent', 0, -12, 'center')],
        },
        caption: 'The proton’s mass beside the summed masses of its three quarks, to scale.',
      },
      choices: [
        'In the energy of the quarks’ motion and of the gluon field that binds them: the system’s energy is its mass',
        'In the binding energy, which adds to the mass of the quarks just as it does for a nucleus',
        'In the electrons that orbit the proton',
        'Nowhere: mass is conserved, so the quark masses must be wrong',
      ],
      answer: 0,
      why: {
        1: 'Binding energy subtracts from a nucleus’s mass. A proton is the opposite case: its mass is far above its parts’ masses, because the confined quarks and gluons carry enormous kinetic and field energy.',
        2: 'A bare proton has no electrons, and an electron weighs only 0.511 MeV/c² anyway.',
        3: 'Mass is not additive. A system’s mass is its total energy at rest over c², and that energy includes motion and fields inside.',
      },
      hints: [t`What fraction of ${fmt(MPC2, 4)} MeV do the quark masses account for?`],
      teach: 'About 99% of the proton’s mass is the energy of its confined quarks and gluons, not the quarks’ own masses.',
      explain: t`The quarks supply ${fmt(QUARKS, 3)} MeV, ${fmt((QUARKS / MPC2) * 100, 2)}% of the proton’s mass. The other ${fmt(100 - (QUARKS / MPC2) * 100, 3)}% is the energy of quarks moving near the speed of light inside a femtometre and of the gluon field between them — computed from first principles by lattice QCD. Most of the mass of you is this energy.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rhic', difficulty: 3, transfer: true,
      prompt: t`Brookhaven’s RHIC collides gold nuclei head-on, each carrying 100 GeV of total energy per nucleon. A gold-197 nucleus has rest energy ${fmt(M_AU / 1000, 6)} GeV. Suppose the two nuclei momentarily form a single fireball at rest. How many times the combined mass of the two nuclei is the fireball’s mass?`,
      answer: RHIC_G, tol: { rel: 0.005 },
      errors: [{ value: 1, feedback: 'Mass is not conserved separately: the fireball’s mass is its total energy over c², kinetic energy included.' }, { value: RHIC_G - 1, feedback: t`That counts only the kinetic energy. The fireball’s rest energy is all of the energy, $2\gamma Mc^2$.` }],
      hints: [t`Total momentum is zero, so the fireball’s rest energy is the total energy: $2\times197\times100$ GeV.`, t`Each nucleus has $\gamma = 197\times100\ \text{GeV}\,/\,${fmt(M_AU / 1000, 6)}\ \text{GeV}$.`],
      teach: 'The mass of a system at rest is its total energy over c²: a head-on collision turns kinetic energy into mass.',
      explain: t`$\gamma = 19\,700/${fmt(M_AU / 1000, 6)} = ${fmt(RHIC_G, 4)}$, so the fireball weighs ${fmt(RHIC_G, 4)} times the two nuclei — about ${fmt((2 * 19700) / 1000, 3)} TeV/$c^2$. It lives a few times $10^{-23}$ s as a quark–gluon plasma, then condenses into thousands of new particles. (You met these nuclei as flattened pancakes in lesson MP2.2.)`,
      visual: {
        type: 'graph',
        params: frame([-4, 4], [-1.5, 1.5], {
          aspect: 'wide',
          curves: [{ param: ['-1.6 + 0.05*cos(t)', '0.9*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.6 }, { param: ['1.6 + 0.05*cos(t)', '0.9*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.6 }],
          arrows: [{ from: [-3.4, 0], to: [-2.0, 0], color: 'gold', width: 2.4 }, { from: [3.4, 0], to: [2.0, 0], color: 'gold', width: 2.4 }],
          points: [label(-2.7, 0, '100 GeV per nucleon', 'gold', 0, -16, 'center'), label(0, -1.2, 'gold nuclei, flattened by γ ≈ 107 (not to scale)', 'ink3', 0, 0, 'center')],
        }),
        caption: 'Two gold nuclei about to collide at RHIC, seen in the lab: Lorentz-contracted into thin discs. Not to scale.',
      },
    }),
    num({
      id: 'cp-sulfur', difficulty: 2,
      prompt: t`The 2005 test of $E = mc^2$ also used neutron capture on sulfur-32, which becomes sulfur-33. Atomic masses: $^{32}$S ${M_S32} u, $^{33}$S ${M_S33} u, the neutron ${M_N} u. What total gamma-ray energy, in keV, does each capture release?`,
      answer: SN_S, units: 'keV', tol: { rel: 0.002 },
      errors: [{ value: SN_S / 1000, feedback: 'That is in MeV; the question asks for keV.' }, { value: (M_S33 - M_S32) * UC2 * 1e3, feedback: 'That is the mass difference of the two sulfur atoms. Include the neutron that was captured.' }],
      hints: [t`$\Delta m = m(^{32}\text{S}) + m_n - m(^{33}\text{S})$, then $\times${fmt(UC2, 8)}$ MeV per u.`],
      teach: 'Energy released = mass lost × c², with every particle on both sides counted.',
      explain: t`$\Delta m = ${fmt(M_S32 + M_N - M_S33, 6)}$ u, so $E = ${fmt(SN_S, 5)}$ keV. Rainville and colleagues measured the gamma rays’ wavelengths and these masses independently; the two sides agreed to 4 parts in $10^7$.`,
      visual: levels({ top: SN_S / 1e3, name: '³²S', product: '³³S', cascade: false, caption: 'Neutron capture on sulfur-32, to scale: the captured state decays to the ground state of sulfur-33 by gamma rays.' }),
    }),
    mcq({
      id: 'cp-hot-box', difficulty: 2,
      prompt: 'A sealed, rigid box of gas sits on a perfect balance. A heater outside warms it through the wall by 100 K; nothing enters or leaves but heat. What happens to the box’s mass?',
      visual: {
        type: 'graph',
        params: frame([-4, 4], [-1.5, 1.5], {
          aspect: 'wide',
          curves: [seg(-3.4, -1, -0.6, -1, 'ink2'), seg(-3.4, 1, -0.6, 1, 'ink2'), seg(-3.4, -1, -3.4, 1, 'ink2'), seg(-0.6, -1, -0.6, 1, 'ink2'), seg(0.6, -1, 3.4, -1, 'ink2'), seg(0.6, 1, 3.4, 1, 'ink2'), seg(0.6, -1, 0.6, 1, 'ink2'), seg(3.4, -1, 3.4, 1, 'ink2')],
          arrows: [
            { from: [-2.6, 0.3], to: [-2.3, 0.5], color: 'accent', width: 1.8 }, { from: [-1.5, -0.4], to: [-1.8, -0.2], color: 'accent', width: 1.8 }, { from: [-1.2, 0.5], to: [-1.0, 0.2], color: 'accent', width: 1.8 },
            { from: [1.4, 0.3], to: [2.1, 0.8], color: 'warn', width: 1.8 }, { from: [2.5, -0.4], to: [1.8, 0.0], color: 'warn', width: 1.8 }, { from: [2.8, 0.5], to: [3.2, -0.2], color: 'warn', width: 1.8 },
          ],
          points: [label(-2, -1, 'before', 'ink3', 0, 16, 'center'), label(2, -1, 'after heating', 'ink3', 0, 16, 'center'), ...[[-2.6, 0.3], [-1.5, -0.4], [-1.2, 0.5], [1.4, 0.3], [2.5, -0.4], [2.8, 0.5]].map(([x, y]) => ({ x, y, r: 4, color: x < 0 ? 'accent' : 'warn' }))],
        }),
        caption: 'The same molecules before and after heating: the same number, moving faster. Not to scale.',
      },
      choices: [
        'It increases, by the heat added divided by c² — far too little to see',
        'It stays exactly the same, because the box holds the same molecules',
        'It decreases, because hot gas is less dense',
        'It increases, because hot molecules each have more rest mass',
      ],
      answer: 0,
      why: {
        1: 'The number of molecules is fixed, but the box’s mass is its total energy at rest over c², and the molecules’ kinetic energy has risen.',
        2: 'The box is sealed and rigid: the density of the gas inside cannot change. And density is not mass.',
        3: 'Each molecule’s own mass is unchanged. The extra mass belongs to the system: it is the kinetic energy of the molecules’ motion inside the box.',
      },
      hints: ['What is the mass of a system, in terms of its energy in the frame where it is at rest?'],
      teach: 'Heating a system adds mass Q/c² to it, though each part keeps its own mass: mass belongs to the whole system’s energy.',
      explain: 'The box gains mass Q/c². For a litre of air heated by 100 K, Q ≈ 90 J and Δm ≈ 10⁻¹⁵ kg: a real effect that no balance can detect.',
    }),
  ],
  sources: [
    { label: 'Einstein (1905), Ist die Trägheit eines Körpers von seinem Energieinhalt abhängig?, Annalen der Physik 18, 639 (English: Does the inertia of a body depend upon its energy content?)', url: 'https://doi.org/10.1002/andp.19053231314' },
    { label: 'Rainville et al. (2005), A direct test of E = mc², Nature 438, 1096', url: 'https://doi.org/10.1038/4381096a' },
    { label: 'Wang et al. (2021), The AME 2020 atomic mass evaluation (II), Chinese Physics C 45, 030003', url: 'https://doi.org/10.1088/1674-1137/abddaf' },
    { label: 'Particle Data Group (2024), Review of Particle Physics: quark masses, neutron mean life', url: 'https://pdg.lbl.gov/' },
  ],
});
