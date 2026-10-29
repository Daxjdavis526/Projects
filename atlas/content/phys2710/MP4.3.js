// Pair production and annihilation — a photon above 2mₑc² = 1.022 MeV can
// become an electron and a positron, but only beside a nucleus (or another
// particle) that takes up momentum: the threshold E = 2mc²(1 + m/M) from the
// invariant mass. Annihilation gives back-to-back 511 keV photons at rest
// and Doppler-split ones in flight; PET and time-of-flight PET; TeV gamma
// rays absorbed on starlight. Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, MEC2, MPC2, MMUC2, UC2, HC_EVNM } from './_constants.js';
import { seg, label, frame, circle, r6 } from './_diagrams.js';
import { LAMBDA_C_PM, M_PB208 } from './_quanta.js';

const t = String.raw;
const M2 = 2 * MEC2;                                  // MeV, the pair’s rest energy
const MPB = M_PB208 * UC2 - 82 * MEC2;                // MeV, a lead-208 nucleus
const thresh = (m, M) => 2 * m * (1 + m / M);         // MeV, photon threshold to make a pair of mass m on a target M at rest
const pcOf = (K, m = MEC2) => Math.sqrt(K * K + 2 * K * m);
const rCm = (K, B) => pcOf(K) / (2.99792458 * B);     // cm: r = p/eB with pc in MeV and B in T

/**
 * A pair made in a bubble chamber, seen from above with the magnetic field
 * into the page: the photon (dashed) converts at the origin; the electron
 * curls clockwise, the positron anticlockwise. E (MeV), f (the electron’s
 * share of the kinetic energy) and B (T) are numbers or slider keys.
 */
function chamber(E, f, B, extra = {}) {
  const K = (s) => `(${s})*((${E}) - ${M2.toFixed(4)})`;
  const r = (s) => `sqrt(${K(s)}^2 + ${M2.toFixed(4)}*${K(s)})/(2.99792*(${B}))`;
  const rm = r(f), rp = r(`1 - (${f})`), on = `step((${E}) - ${M2.toFixed(4)})`;
  return {
    x: [-10, 10], y: [-6, 6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { ...seg(-10, 0, 0, 0, 'violet', 2, true), label: 'photon (leaves no track)', labelAt: 0.12, labelDx: 0, labelDy: -12 },
      { param: [`${rm}*sin(t)`, `-${rm}*(1 - cos(t))`], t: [0, 6.2832], color: 'accent', width: 2.2, when: on, label: 'electron', labelAt: 3.1416, labelDx: 8, labelDy: 10 },
      { param: [`${rp}*sin(t)`, `${rp}*(1 - cos(t))`], t: [0, 6.2832], color: 'warn', width: 2.2, when: on, label: 'positron', labelAt: 3.1416, labelDx: 8, labelDy: -10 },
    ],
    points: [{ x: 0, y: 0, r: 4, color: 'ink' }, { ...label(0.6, -1.2, 'below threshold: the photon passes on', 'ink3', 0, 0, 'left'), when: `step(${M2.toFixed(4)} - (${E}))` }],
    ...extra,
  };
}
const chamberVisual = (E, f, B, caption) => ({ type: 'graph', params: chamber(E, f, B), caption: caption ?? `A ${E} MeV photon converting into a pair beside a nucleus (centre), in a ${B} T field into the page. Tracks drawn as circles; real ones spiral inward as the particles lose energy ionizing the liquid.` });

/** The energy budget of one conversion as a bar, in MeV: two rest energies, then the two kinetic energies. */
function budgetBar(E, Km, caption) {
  const top = Math.max(E, M2) * 1.08, Kp = Math.max(0, E - M2 - Km);
  const block = (a, b, color, alpha = 0.55) => ({ fn: '1', lower: '0', from: r6(a), to: r6(b), color, alpha });
  const shade = [block(0, MEC2, 'accent'), block(MEC2, M2, 'warn')];
  const points = [label(MEC2 / 2, 0.5, 'e⁻ rest', 'ink', 0, 0, 'center'), label(1.5 * MEC2, 0.5, 'e⁺ rest', 'ink', 0, 0, 'center')];
  const curves = [seg(0, 1.35, r6(E), 1.35, 'violet', 2.4), seg(0, 1.2, 0, 1.5, 'violet', 2), seg(r6(E), 1.2, r6(E), 1.5, 'violet', 2)];
  points.push(label(E / 2, 1.35, `photon: ${fmt(E, 4)} MeV`, 'violet', 0, -12, 'center'));
  if (E >= M2) {
    if (Km > 0) { shade.push(block(M2, M2 + Km, 'accent', 0.25)); points.push(label(M2 + Km / 2, 0.5, 'K₋', 'accent', 0, 0, 'center')); }
    if (Kp > 0) { shade.push(block(M2 + Km, E, 'warn', 0.25)); points.push(label(M2 + Km + Kp / 2, 0.5, Km > 0 ? 'K₊' : 'kinetic', 'warn', 0, 0, 'center')); }
  } else curves.push(seg(r6(E), -0.15, r6(E), 1.15, 'bad', 2.2, true));
  return {
    type: 'graph',
    params: { x: [0, r6(top)], y: [-0.45, 1.75], aspect: 'wide', xlabel: 'energy (MeV)', ylabel: '', yticks: 0, grid: false, axesAt: 'edge', shade, curves, points },
    caption: caption ?? 'Where a converting photon’s energy goes: 0.511 MeV into each particle’s rest energy, the rest into their kinetic energies. The nucleus takes almost none.',
  };
}

/** A PET ring 80 cm across: an annihilation inside it and the two back-to-back photons. */
function petRing({ x0 = 0.12, y0 = 0.05, ang = 25, caption, labels = [] } = {}) {
  const u = [Math.cos(ang * Math.PI / 180), Math.sin(ang * Math.PI / 180)];
  const hit = (s) => { // where the line from (x0, y0) along s·u meets the ring of radius 0.4
    const b = x0 * u[0] + y0 * u[1], c = x0 * x0 + y0 * y0 - 0.16, d = -s * b + Math.sqrt(b * b - c);
    return [x0 + s * d * u[0], y0 + s * d * u[1]];
  };
  const A = hit(1), Bp = hit(-1);
  const det = [];
  for (let k = 0; k < 36; k++) det.push({ x: r6(0.43 * Math.cos(k * Math.PI / 18)), y: r6(0.43 * Math.sin(k * Math.PI / 18)), r: 3.5, color: 'ink3' });
  return {
    type: 'graph',
    params: frame([-0.62, 0.62], [-0.5, 0.5], {
      aspect: 'wide',
      curves: [circle(0, 0, 0.4, 'ink4', 1.2), seg(Bp[0], Bp[1], A[0], A[1], 'ink4', 1.2, true)],
      arrows: [{ from: [x0, y0], to: [r6(A[0]), r6(A[1])], color: 'gold' }, { from: [x0, y0], to: [r6(Bp[0]), r6(Bp[1])], color: 'gold' }],
      points: [...det, { x: x0, y: y0, r: 5, color: 'bad' }, ...labels],
    }),
    caption: caption ?? 'A PET scanner’s ring of detectors (80 cm across, seen end-on) and one annihilation inside it: two 511 keV photons fly apart along a line, and the two detectors they hit define the line of response (dashed). Not to scale.',
  };
}

/** Two photons leaving an annihilation along a line, forward and backward. */
const flight = (caption) => ({
  type: 'graph',
  params: frame([-5.2, 5.2], [-1.4, 1.4], {
    aspect: 'wide',
    arrows: [{ from: [-4.6, 0.6], to: [-0.5, 0.6], color: 'warn', label: 'positron, kinetic energy K', labelDx: -150, labelDy: -14 },
      { from: [0.2, 0], to: [4.6, 0], color: 'gold', label: 'photon forward: E₁ = ?', labelDx: -150, labelDy: -14 },
      { from: [-0.2, 0], to: [-2.4, 0], color: 'gold', width: 1.6, label: 'photon back: E₂', labelDx: -10, labelDy: 16, labelAlign: 'right' }],
    points: [{ x: 0, y: 0, r: 5, color: 'accent' }, label(0, 0, 'electron at rest', 'accent', 0, 18, 'center')],
  }),
  caption: caption ?? 'A positron in flight annihilating with an electron at rest, with the two photons emitted along the line of flight. Not to scale.',
});

/** Energy against momentum (MeV): a photon’s line E = pc never reaches the pair’s lowest possible energy at a given momentum. */
const photonVsPair = {
  type: 'graph',
  params: {
    x: [-0.2, 4.6], y: [0, 2.3], equal: true, aspect: 'wide', xlabel: 'pc (MeV)', ylabel: 'E (MeV)',
    curves: [
      { fn: `sqrt(x^2 + ${r6(M2 * M2)})`, domain: [0, 4.6], color: 'accent', width: 2.6, label: 'the lightest e⁻e⁺ pair', labelAt: 1.6, labelDx: -10, labelDy: -12, labelAlign: 'right' },
      { fn: 'x', domain: [0, 2.3], color: 'gold', width: 2.4, label: 'one photon: E = pc', labelAt: 1.9, labelDx: 10, labelDy: 8 },
    ],
    points: [{ x: 0, y: r6(M2), color: 'accent', r: 4, label: '2mc² = 1.022 MeV', labelDx: 10, labelDy: 14 }],
  },
  caption: 'Energy against momentum. A lone photon lies on the gold line; an electron–positron pair with the same total momentum needs at least the energy on the blue curve, which is always higher. With nothing else present, the photon can never become a pair.',
};

export default lesson({
  id: 'phys2710.MP4.3',
  title: 'Pair production',
  minutes: 13, difficulty: 3,
  intro: t`A gamma ray of more than 1.022 MeV passing close to a nucleus can vanish and leave an electron and a positron — the electron’s antiparticle, of the same mass and opposite charge — in its place: energy turned into matter, $E = mc^2$ read from right to left. Energy conservation sets the threshold and the bookkeeping:

$$E_\gamma = 2m_ec^2 + K_- + K_+$$

Energy alone is not enough. **A lone photon in empty space can never make a pair**, because it cannot conserve momentum at the same time; a nucleus nearby takes up the momentum while taking almost no energy. The reverse, annihilation, turns an electron and a positron into gamma rays — two of them, of 511 keV each when the pair is at rest — and every PET scan is built on those photon pairs.

> This uses relativistic energy and the invariant $E^2 - (pc)^2 = (mc^2)^2$ from lessons [MP3.2](#/lesson/phys2710.MP3.2) and [MP3.3](#/lesson/phys2710.MP3.3).`,
  symbols: [
    { tex: 'E_\\gamma', text: 'the photon’s energy, in MeV' },
    { tex: 'm_ec^2', text: t`the rest energy of an electron — and of a positron — $${fmt(MEC2, 6)}$ MeV; the pair needs $2m_ec^2 = ${fmt(M2, 5)}$ MeV` },
    { tex: 'K_-,\\ K_+', text: 'the kinetic energies of the electron and the positron, which share whatever the photon has beyond $2m_ec^2$ in any proportion' },
  ],
  why: 'Pair production is how gamma-ray telescopes such as Fermi’s Large Area Telescope catch the most energetic photons and why lead stops gamma rays above a few MeV; run backwards, it is how a PET scanner sees a tumour.',
  visual: {
    type: 'graph',
    title: 'A pair in a bubble chamber',
    lead: t`A gamma ray (dashed — photons leave no track) converts beside a nucleus at the centre. In a magnetic field into the page the electron curls one way and the positron the other, each on a circle of radius $r = p/eB$: the bigger its momentum, the wider its circle.`,
    tasks: [
      'Lower the photon energy below 1.022 MeV: the tracks vanish — not enough energy to make two electron masses.',
      'Slide the share: the energy beyond 1.022 MeV can be split any way between the two, and their circles trade size.',
      'Double the field B: every radius halves. Measuring radii is how the particles’ momenta, and so the photon’s energy, are found.',
    ],
    params: chamber('E', 'f', 'B', {
      sliders: [
        { key: 'E', label: 'Photon energy $E_\\gamma$', min: 0.5, max: 10, step: 0.01, value: 4, unit: '\\mathrm{MeV}', explain: 'The gamma ray’s energy. Below $2m_ec^2 = 1.022$ MeV no pair can form.' },
        { key: 'f', label: 'Electron’s share of the kinetic energy', min: 0.05, max: 0.95, step: 0.01, value: 0.35, unit: '', explain: 'The fraction of $E_\\gamma - 2m_ec^2$ that goes to the electron; the positron gets the rest.' },
        { key: 'B', label: 'Magnetic field $B$', min: 0.05, max: 1, step: 0.01, value: 0.4, unit: '\\mathrm{T}', explain: 'Into the page. A stronger field bends every track more tightly.' },
      ],
      readouts: [
        { label: 'electron $K_-$', expr: `f*(E - ${M2.toFixed(4)})`, unit: '\\mathrm{MeV}', digits: 3 },
        { label: 'positron $K_+$', expr: `(1 - f)*(E - ${M2.toFixed(4)})`, unit: '\\mathrm{MeV}', digits: 3 },
        { label: 'electron radius', expr: `sqrt((f*(E - 1.022))^2 + 1.022*f*(E - 1.022))/(2.99792*B)`, unit: '\\mathrm{cm}', digits: 3 },
        { label: 'positron radius', expr: `sqrt(((1 - f)*(E - 1.022))^2 + 1.022*(1 - f)*(E - 1.022))/(2.99792*B)`, unit: '\\mathrm{cm}', digits: 3 },
      ],
    }),
    caption: 'Seen from above, with the field into the page; distances in cm. Tracks are drawn as full circles; real ones spiral inward as the particles lose energy ionizing the liquid. The nucleus’s recoil is far too small to see. Below threshold the radii read as blank.',
  },
  example: {
    prompt: t`Show that a photon cannot make an electron–positron pair in empty space, and find the threshold photon energy for making one beside a target of mass $M$ at rest — first a lead-208 nucleus, then a lone electron.`,
    visual: photonVsPair,
    steps: [
      { label: 'Alone, impossible', text: t`Just at threshold the pair would sit at rest in its own centre-of-momentum frame, with total momentum zero. But a photon has momentum $E/c$ in every frame: there is no frame where it is at rest. In the picture, the photon’s line $E = pc$ never reaches the pair’s curve $E = \sqrt{(pc)^2 + (2m_ec^2)^2}$.` },
      { label: 'Add a target', text: t`Take the photon plus a target of mass $M$ at rest. The quantity $E_\text{tot}^2 - (p_\text{tot}c)^2$ is the same in every frame (lesson MP3.3). Before the collision it is $(E_\gamma + Mc^2)^2 - E_\gamma^2 = M^2c^4 + 2E_\gamma Mc^2$.` },
      { label: 'At threshold', text: t`The least the products can have is all of them at rest in the centre-of-momentum frame: target, electron and positron, total rest energy $(M + 2m_e)c^2$, so the invariant is at least $(M + 2m_e)^2c^4$.` },
      { label: 'Solve', text: t`$M^2c^4 + 2E_\gamma Mc^2 = (M + 2m_e)^2c^4$ gives $E_\gamma = 2m_ec^2\left(1 + \dfrac{m_e}{M}\right)$.` },
      { label: 'A lead nucleus', text: t`$Mc^2 = ${fmt(MPB / 1000, 5)}$ GeV, so $m_e/M = ${tex(MEC2 / MPB, 3)}$: the threshold is $1.022$ MeV plus only ${fmt(M2 * (MEC2 / MPB) * 1e6, 2)} eV. The nucleus takes up the momentum almost free of charge in energy.` },
      { label: 'A lone electron', text: t`With $M = m_e$: $E_\gamma = 4m_ec^2 = ${fmt(thresh(MEC2, MEC2), 4)}$ MeV. Three particles leave — the new pair and the struck electron — so this is called **triplet production**. And as $M \to 0$ the threshold runs off to infinity: with no target, no pair.` },
    ],
    answer: t`Impossible alone. Beside a lead nucleus the threshold is $${fmt(M2, 4)}$ MeV (plus ${fmt(M2 * (MEC2 / MPB) * 1e6, 2)} eV); beside a free electron it is $4m_ec^2 = ${fmt(thresh(MEC2, MEC2), 4)}$ MeV.`,
  },
  practice: [
    num({
      id: 'threshold-lambda', difficulty: 1,
      prompt: 'What is the longest wavelength a photon can have and still make an electron–positron pair beside a heavy nucleus? Answer in pm.',
      answer: HC_EVNM / (M2 * 1000), units: 'pm', tol: { rel: 0.005 },
      errors: [{ value: HC_EVNM / (MEC2 * 1000), feedback: t`The photon must supply *two* rest energies, $2m_ec^2 = 1.022$ MeV, not one.` }],
      hints: [t`The photon needs at least $2m_ec^2 = 1022$ keV, and $\lambda = hc/E$ with $hc = 1239.8$ keV pm.`],
      teach: 'A pair costs two rest energies, 1.022 MeV, so only photons shorter than about 1.2 pm can make one.',
      explain: t`$\lambda = \dfrac{1239.8\ \text{keV pm}}{1022.0\ \text{keV}} = ${fmt(HC_EVNM / (M2 * 1000), 4)}$ pm — exactly half the electron’s Compton wavelength, $h/m_ec = ${fmt(LAMBDA_C_PM, 4)}$ pm, since $\lambda = h/(2m_ec)$.`,
      visual: budgetBar(M2, 0, 'At threshold the photon’s whole energy goes into the two rest energies, and the pair is made at rest (in its own frame).'),
    }),
    num({
      id: 'share', difficulty: 2,
      gen(r) {
        const E = r.pick([2.5, 3.0, 4.2, 5.0, 6.13]), Km = +(r.pick([0.25, 0.4, 0.6, 0.7]) * (E - M2)).toFixed(2);
        const Kp = E - M2 - Km;
        return {
          prompt: t`A ${E} MeV gamma ray converts into a pair beside a nucleus. The electron’s track shows a kinetic energy of ${Km} MeV. What is the positron’s kinetic energy, in MeV?`,
          answer: Kp, units: 'MeV', tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: E - Km, feedback: t`Two rest energies come out of the photon’s energy first: $K_+ = E_\gamma - 2m_ec^2 - K_-$.` }, { value: E - MEC2 - Km, feedback: t`Both particles need their rest energy, $0.511$ MeV each — subtract $2m_ec^2 = 1.022$ MeV.` }],
          hints: [t`$E_\gamma = 2m_ec^2 + K_- + K_+$, with $2m_ec^2 = 1.022$ MeV.`],
          teach: 'The photon pays both rest energies first; the two kinetic energies share what is left.',
          explain: t`$K_+ = ${E} - 1.022 - ${Km} = ${fmt(Kp, 3)}$ MeV. The nucleus recoils with a momentum comparable to the particles’, but being some $10^5$ times heavier it takes a negligible energy.`,
          visual: chamberVisual(E, +(Km / (E - M2)).toFixed(3), 0.6),
        };
      },
    }),
    mcq({
      id: 'why-nucleus', difficulty: 2,
      prompt: 'Why does pair production happen only near a nucleus (or another charged particle), never in empty space?',
      choices: [
        'Something else must take up momentum: a lone photon cannot turn into a pair while conserving both energy and momentum',
        'The nucleus supplies part of the energy needed to make the two masses',
        'The nucleus’s electric field is needed to separate the positive and negative charges after they form',
        'Charge would not be conserved without a nucleus to balance it',
      ],
      answer: 0,
      why: {
        1: 'It gives almost none: beside a lead nucleus the threshold exceeds 1.022 MeV by only about 3 eV. Its job is momentum.',
        2: 'Separating them is not the issue: no frame exists in which a lone photon has zero momentum, as a pair at rest would need.',
        3: 'Charge is conserved anyway: the electron and positron carry −e and +e, a total of zero, like the photon.',
      },
      hints: [t`In which frame would a pair made exactly at threshold be at rest? Does a photon have such a frame?`, t`Compare the photon’s $E = pc$ with the pair’s minimum $E = \sqrt{(pc)^2 + (2m_ec^2)^2}$ at the same momentum.`],
      teach: 'A photon always carries momentum E/c, so a pair needs a third body to take momentum — a nucleus, which takes almost no energy.',
      explain: t`For a given momentum a pair needs at least $\sqrt{(pc)^2 + (2m_ec^2)^2}$ of energy, always more than a photon of that momentum has. A nearby nucleus absorbs the mismatch in momentum while, being heavy, taking almost no energy — so the threshold is just over $2m_ec^2$.`,
      visual: photonVsPair,
    }),
    mcq({
      id: 'two-photons', difficulty: 2,
      prompt: 'An electron and a positron at rest annihilate. Why do they make two photons of 511 keV each, rather than one photon of 1022 keV?',
      choices: [
        'Their total momentum is zero, and one photon always carries momentum, so at least two photons are needed, flying apart with equal energies',
        'Each particle turns into its own photon independently',
        'A single photon of 1022 keV would immediately make a new pair',
        'Photons cannot carry more than 511 keV',
      ],
      answer: 0,
      why: {
        1: 'They annihilate together; the two photons share the pair’s energy and momentum, and in flight they are not 511 keV each.',
        2: 'It cannot even be made: one photon would carry momentum the pair did not have.',
        3: 'Gamma rays of many MeV are common; the 511 keV comes from momentum conservation sharing 1022 keV equally.',
      },
      hints: ['What is the total momentum before the annihilation?', 'Two photons with opposite momenta can add to zero; one photon cannot.'],
      teach: 'Annihilation at rest has zero momentum, so it makes two back-to-back photons that share the 1022 keV equally.',
      explain: t`Zero momentum before means zero after, so the photons must fly apart with equal and opposite momenta — and so equal energies, $m_ec^2 = 511$ keV each. A PET scanner relies on exactly this: the two photons travel in opposite directions along one line through the patient.`,
      visual: petRing({ x0: 0, y0: 0, ang: 20, caption: 'An annihilation at rest: two 511 keV photons fly apart back to back. Not to scale.' }),
    }),
    num({
      id: 'in-flight', difficulty: 3,
      gen(r) {
        const K = r.pick([0.5, 1, 2, 5]), Etot = K + M2, pc = pcOf(K), E1 = (Etot + pc) / 2, E2 = (Etot - pc) / 2;
        return {
          prompt: t`A positron with kinetic energy ${K} MeV annihilates with an electron at rest, and the two photons happen to fly along the positron’s line of flight, one forward and one backward. What energy does the forward photon carry, in MeV?`,
          answer: E1, units: 'MeV', tol: { rel: 0.005 },
          errors: [{ value: Etot / 2, feedback: 'Equal shares only happen when the pair is at rest. Here the total momentum is the positron’s, so the forward photon must carry more.' }, { value: E2, feedback: 'That is the backward photon: the forward one gets the larger share.' }],
          hints: [t`Energy: $E_1 + E_2 = K + 2m_ec^2$. Momentum along the line: $E_1 - E_2 = pc$ of the positron.`, t`$pc = \sqrt{K^2 + 2Km_ec^2} = \sqrt{${K}^2 + 2(${K})(0.511)}$ MeV; then $E_1 = \tfrac12\big[(K + 2m_ec^2) + pc\big]$.`],
          teach: 'In flight, energy and momentum conservation split the annihilation energy unequally: E₁ + E₂ = K + 2mc², E₁ − E₂ = pc.',
          explain: t`$E_1 + E_2 = ${fmt(Etot, 4)}$ MeV and $E_1 - E_2 = pc = ${fmt(pc, 4)}$ MeV, so $E_1 = ${fmt(E1, 4)}$ MeV and $E_2 = ${fmt(E2, 3)}$ MeV — a relativistic Doppler split. Most positrons slow almost to rest before annihilating, which is why the 511 keV line is so sharp.`,
          visual: flight(),
        };
      },
    }),
    num({
      id: 'tof-pet', difficulty: 2,
      gen(r) {
        const dt = r.pick([200, 250, 400, 600]), dx = (C * dt * 1e-12) / 2;
        return {
          prompt: t`A time-of-flight PET scanner times the two 511 keV photons of each annihilation. If the photon heading to one detector arrives ${dt} ps before the other, how far from the midpoint between the two detectors did the annihilation happen, in cm?`,
          answer: dx * 100, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: C * dt * 1e-12 * 100, feedback: 'Moving the annihilation a distance x toward one detector shortens that photon’s path by x and lengthens the other’s by x: the difference is 2x, so x = cΔt/2.' }],
          hints: [t`If the annihilation is $x$ closer to one detector, the two paths differ by $2x$.`, t`$2x = c\,\Delta t$, with $c = 3.00\times10^{10}$ cm/s and $\Delta t = ${dt}\times10^{-12}$ s.`],
          teach: 'Time of flight places an annihilation along its line: x = cΔt/2.',
          explain: t`$x = c\,\Delta t/2 = (2.998\times10^{10}\ \text{cm/s})(${dt}\times10^{-12}\ \text{s})/2 = ${fmt(dx * 100, 3)}$ cm, toward the detector that fired first. Today’s scanners time to about 200–400 ps, pinning each event to a few centimetres along its line, which cuts the image noise.`,
          visual: petRing({ x0: 0.1, y0: 0.04, ang: 15, labels: [label(0.1, 0.04, 'x = ? from the midpoint', 'bad', 0, 18, 'center')] }),
        };
      },
    }),
    num({
      id: 'heavy-pair', difficulty: 3,
      gen(r) {
        const [pName, m] = r.pick([['a muon and an antimuon', MMUC2], ['a proton and an antiproton', MPC2]]);
        const [tName, M] = r.pick([['a free proton', MPC2], ['a lead-208 nucleus', MPB]]);
        const E = thresh(m, M);
        const mm = (x) => (x >= 1e4 ? tex(x, 6) : fmt(x, 7));              // a rest energy in MeV, as TeX
        const pText = pName.split(' and ')[0].replace(/^an? /, ''), tText = tName.replace(/^an? /, '');
        return {
          prompt: t`A high-energy photon strikes ${tName} at rest. What is the least photon energy that can make ${pName}, in MeV? (Rest energies: ${pText} $${mm(m)}$ MeV; ${tText} $${mm(M)}$ MeV.)`,
          answer: E, units: 'MeV', tol: { rel: 0.002 },
          errors: [{ value: 2 * m, feedback: t`That ignores the target: it must recoil, so the threshold is $2mc^2(1 + m/M)$, not just $2mc^2$.` }].filter((e) => Math.abs(e.value - E) > 0.004 * E),
          hints: [t`Use the invariant: $M^2c^4 + 2E_\gamma Mc^2 = (M + 2m)^2c^4$.`, t`So $E_\gamma = 2mc^2\left(1 + \dfrac{m}{M}\right)$, with $m$ the new particle’s mass and $M$ the target’s.`],
          teach: 'Making a pair of mass m on a target M at rest costs E = 2mc²(1 + m/M): the lighter the target, the more is wasted on its recoil.',
          explain: t`$E_\gamma = 2(${mm(m)})\left(1 + \dfrac{${mm(m)}}{${mm(M)}}\right) = ${fmt(E, 5)}$ MeV. ${M > 1e4 ? 'A heavy target wastes almost nothing on recoil.' : 'A light target must carry off a lot of kinetic energy, so the threshold rises well above 2mc².'}`,
          visual: budgetBar(2.5, 0.7, 'The same bookkeeping at any scale: the photon must pay the new pair’s rest energies first. Electron-pair numbers drawn; a heavier pair needs proportionally more.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tev', difficulty: 3, transfer: true,
      gen(r) {
        const E1 = r.pick([0.5, 1, 2, 5, 10]);                 // TeV
        const E2 = (MEC2 * 1e6) ** 2 / (E1 * 1e12);          // eV
        const lamUm = HC_EVNM / E2 / 1000;
        return {
          prompt: t`Gamma rays of ${E1} TeV from distant blazars are absorbed on their way to us by colliding with photons of starlight that fill intergalactic space, making electron–positron pairs. For a head-on collision the condition is $E_1E_2 \ge (m_ec^2)^2$. What is the longest wavelength of background photon that can absorb a ${E1} TeV gamma ray, in μm?`,
          answer: lamUm, units: 'μm', tol: { rel: 0.005 },
          errors: [{ value: lamUm / 4, feedback: t`Head-on, the invariant is $4E_1E_2$, and it must reach $(2m_ec^2)^2 = 4(m_ec^2)^2$: the 4s cancel, leaving $E_1E_2 \ge (m_ec^2)^2$.` }],
          hints: [t`$E_2 = (m_ec^2)^2/E_1 = (0.511\times10^{6}\ \text{eV})^2/(${E1}\times10^{12}\ \text{eV})$.`, t`Then $\lambda = hc/E_2$, with $hc = 1.2398\ \mu\text{m eV}$.`],
          teach: 'Two photons can make a pair if their invariant mass reaches 2mₑc²; head-on that needs E₁E₂ ≥ (mₑc²)².',
          explain: t`$E_2 = ${fmt(E2, 3)}$ eV, so $\lambda = 1.2398/${fmt(E2, 3)} = ${fmt(lamUm, 3)}$ μm — infrared. TeV gamma rays are dimmed by the infrared glow of all the galaxies there have ever been, and astronomers use the dimming to measure that glow.`,
          visual: {
            type: 'graph',
            params: frame([-5.2, 5.2], [-1.6, 1.6], {
              aspect: 'wide',
              curves: [{ fn: '0.22*sin(2*pi*(x + 4.6)/0.25)', domain: [-4.6, -0.5], color: 'violet', width: 1.8 }, { fn: '0.3*sin(2*pi*(x - 4.6)/1.6)', domain: [0.5, 4.6], color: 'bad', width: 1.8 }],
              points: [label(-2.6, 0.55, `gamma ray, ${E1} TeV`, 'violet', 0, -6, 'center'), label(2.6, 0.62, 'starlight photon: λ = ?', 'bad', 0, -6, 'center'), { x: 0, y: 0, r: 5, color: 'gold' }, label(0, -0.6, 'e⁻ e⁺', 'gold', 0, 6, 'center')],
              arrows: [{ from: [-0.5, -0.9], to: [-0.1, -0.9], color: 'violet' }, { from: [0.5, -0.9], to: [0.1, -0.9], color: 'bad' }],
            }),
            caption: 'A gamma ray and a photon of background starlight meeting head-on and making a pair. Wavelengths not to scale: the gamma ray’s is some 10¹³ times shorter.',
          },
        };
      },
    }),
    num({
      id: 'cp-511-lambda', difficulty: 2,
      prompt: t`Each photon from an annihilation at rest carries $m_ec^2 = 511.0$ keV. What is its wavelength, in pm?`,
      answer: HC_EVNM / (MEC2 * 1000), units: 'pm', tol: { rel: 0.005 },
      errors: [{ value: HC_EVNM / (M2 * 1000), feedback: 'Each photon carries one rest energy, 511 keV; the 1022 keV is shared between two.' }],
      hints: [t`$\lambda = hc/E$ with $hc = 1239.8$ keV pm.`],
      teach: 'A photon of energy mₑc² has wavelength h/mₑc — the electron’s Compton wavelength.',
      explain: t`$\lambda = 1239.8/511.0 = ${fmt(HC_EVNM / (MEC2 * 1000), 4)}$ pm $= h/m_ec$, the electron’s Compton wavelength — no coincidence, since $\lambda = hc/(m_ec^2) = h/(m_ec)$.`,
      visual: petRing({ x0: -0.08, y0: 0.06, ang: 40 }),
    }),
    mcq({
      id: 'cp-below', difficulty: 2,
      prompt: 'A 0.90 MeV gamma ray enters a block of lead. Which interactions can it have?',
      choices: [
        'Photoelectric absorption or Compton scattering, but not pair production',
        'Pair production too, since lead nuclei are heavy enough to supply the missing energy',
        'Only pair production, since lead stops gamma rays by turning them into matter',
        'None: gamma rays pass straight through lead',
      ],
      answer: 0,
      why: {
        1: 'A heavy nucleus takes momentum, not energy: the threshold stays at 1.022 MeV, above 0.90 MeV.',
        2: 'Below 1.022 MeV pair production is impossible; the photoelectric effect and Compton scattering do all the work.',
        3: 'Lead is used for shielding precisely because it absorbs gamma rays strongly.',
      },
      hints: ['Compare 0.90 MeV with 2mₑc².'],
      teach: 'Below 1.022 MeV a gamma ray can only be absorbed photoelectrically or Compton-scattered; pair production needs more than two rest energies.',
      explain: t`$0.90\ \text{MeV} < 2m_ec^2 = 1.022$ MeV, so no pair is possible, however heavy the nucleus. In lead, Compton scattering dominates from about 0.5 to 5 MeV and pair production above that.`,
      visual: budgetBar(0.9, 0, 'The 0.90 MeV photon (red dashed line) against the two rest energies a pair would need.'),
    }),
  ],
  sources: [
    { label: 'Anderson (1933), The positive electron, Phys. Rev. 43, 491', url: 'https://doi.org/10.1103/PhysRev.43.491' },
    { label: 'OpenStax University Physics Vol. 3, §11.3 (antimatter and annihilation)', url: 'https://openstax.org/books/university-physics-volume-3/pages/11-3-particle-conservation-laws' },
    { label: 'NIST XCOM: photon cross sections (photoelectric, Compton, pair production)', url: 'https://physics.nist.gov/PhysRefData/Xcom/html/xcom1.html' },
    { label: 'Gould & Schréder (1966), opacity of the universe to high-energy photons, Phys. Rev. Lett. 16, 252', url: 'https://doi.org/10.1103/PhysRevLett.16.252' },
  ],
});
