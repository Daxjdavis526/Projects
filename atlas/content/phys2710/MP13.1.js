// Nuclear binding and decay — the liquid-drop (semi-empirical) mass
// formula with real coefficients and what each term means; decay happens
// when the products are more tightly bound (Q > 0). Alpha decay (Q from
// AME2020 masses, the alpha’s share Q(A − 4)/A, tunnelling through the
// Coulomb barrier), beta decay (continuous spectrum, the neutrino; the
// valley of stability), gamma decay. The aerospace hook: plutonium-238 in
// radioisotope generators (87.7 yr). Carbon-14: made by cosmic-ray
// neutrons, dated by counting atoms. Coding: fit the liquid drop to
// AME2020. PHYS 2220 A1.2–A1.3 did binding energies, half-lives, activity
// and RTG power; this lesson does not repeat them.
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import * as Nu from '../../src/viz/model/qm-nuclear.js';
import { r6, seg, label } from './_diagrams.js';
import { N_A } from './_quanta.js';

const t = String.raw;
const U = Nu.U_MEV, HE4 = 4.00260325413;
/** AME2020 atomic masses (u) of the parents and daughters used here (Wang et al. 2021). */
const M = {
  pu238: 238.0495601, u234: 234.0409523, ra226: 226.0254103, rn222: 222.0175782, u238: 238.0507884, th234: 234.0436014,
  po210: 209.9828737, pb206: 205.9744653, am241: 241.0568293, np237: 237.0481734, h1: 1.00782503223, n: 1.00866491606,
  c14: 14.0032419884, n14: 14.00307400443, co60: 59.9338163, ni60: 59.9307859, cs137: 136.9070895, ba137: 136.9058274, h3: 3.01604928132, he3: 3.01602932197,
};
const Qa = (p, d) => (M[p] - M[d] - HE4) * U;
const Q_PU = Qa('pu238', 'u234'), K_PU = (Q_PU * 234) / 238;
const SEMF_Q = Nu.semf(92, 234).B + Nu.binding(Nu.byName['He-4']) - Nu.semf(94, 238).B;
const ALPHAS = {
  ra226: { name: 'radium-226', d: 'rn222', dn: 'radon-222', Z: 88, A: 226 },
  u238: { name: 'uranium-238', d: 'th234', dn: 'thorium-234', Z: 92, A: 238 },
  po210: { name: 'polonium-210', d: 'pb206', dn: 'lead-206', Z: 84, A: 210 },
  am241: { name: 'americium-241', d: 'np237', dn: 'neptunium-237', Z: 95, A: 241 },
};
const BETAS = {
  c14: { name: 'carbon-14', d: 'n14', dn: 'nitrogen-14', sym: t`{}^{14}\text{C} \to {}^{14}\text{N}` },
  co60: { name: 'cobalt-60', d: 'ni60', dn: 'nickel-60', sym: t`{}^{60}\text{Co} \to {}^{60}\text{Ni}` },
  cs137: { name: 'cesium-137', d: 'ba137', dn: 'barium-137', sym: t`{}^{137}\text{Cs} \to {}^{137}\text{Ba}` },
  h3: { name: 'tritium (hydrogen-3)', d: 'he3', dn: 'helium-3', sym: t`{}^{3}\text{H} \to {}^{3}\text{He}` },
};

// ---- pictures
const DATA = Nu.NUCLIDES.filter((n) => n.A >= 16);
const ZV = (aC, aA) => `(x/(2 + (${aC})/(2*(${aA}))*x^(2/3)))`;
/** The liquid drop’s terms, per nucleon, along the valley of stability, with measured B/A as dots. aS, aC, aA: numbers or slider keys. */
function semfTerms({ aS = 17.8, aC = 0.711, aA = 23.7, extra = {}, caption } = {}) {
  const Zx = ZV(aC, aA), aV = 15.75;
  const vs = `${aV} - (${aS})*x^(-1/3)`, vsc = `${vs} - (${aC})*${Zx}*(${Zx} - 1)/x^(4/3)`, all = `${vsc} - (${aA})*(x - 2*${Zx})^2/x^2`;
  return {
    type: 'graph',
    params: {
      x: [0, 250], y: [0, 17.5], aspect: 'wide', axesAt: 'edge', xlabel: 'mass number A', ylabel: 'binding energy per nucleon (MeV)',
      curves: [
        { fn: String(aV), color: 'ink3', width: 1.6, dash: true, label: 'volume only', labelAt: 200, labelDy: -10 },
        { fn: vs, domain: [4, 250], color: 'teal', width: 1.8, label: '− surface', labelAt: 215, labelDy: -10 },
        { fn: vsc, domain: [4, 250], color: 'violet', width: 1.8, label: '− Coulomb', labelAt: 215, labelDy: -10 },
        { fn: all, domain: [4, 250], color: 'accent', width: 2.8, label: '− asymmetry: the liquid drop', labelAt: 150, labelDy: 16 },
      ],
      points: [...Nu.NUCLIDES.map((n) => ({ x: n.A, y: r6(Nu.bindingPerNucleon(n)), r: 2.6, color: 'gold' })), ...(extra.points || [])],
      ...Object.fromEntries(Object.entries(extra).filter(([k]) => k !== 'points')),
    },
    caption: caption ?? 'The liquid-drop formula per nucleon, built term by term along the valley of stability (the best Z for each A), against measured nuclei (gold dots, AME2020). Pairing is left out of the curves. The formula is a model: it misses the extra stability of “magic” nuclei such as helium-4 and lead-208.',
  };
}
const misfit = (() => {
  const terms = DATA.map((n) => `(${r6(Nu.bindingPerNucleon(n))} - (15.75 - aS*${r6(n.A ** (-1 / 3))} - aC*${r6((n.Z * (n.Z - 1)) / n.A ** (4 / 3))} - aA*${r6((n.A - 2 * n.Z) ** 2 / n.A ** 2)}))^2`);
  return `1000*sqrt((${terms.join(' + ')})/${DATA.length})`;
})();

/** The alpha particle’s potential energy around a daughter of charge Zd: a well inside R, Coulomb outside; the alpha’s energy Q. */
function barrier(Zd, A, Q, { caption, showQ = true } = {}) {
  const R = 1.2 * (Math.cbrt(A - 4) + Math.cbrt(4)), k = 2 * Zd * 1.44, rOut = k / Q;
  return {
    type: 'graph',
    params: {
      x: [0, 80], y: [-35, 35], aspect: 'wide', axesAt: 'edge', xlabel: 'distance from the centre (fm)', ylabel: 'energy (MeV)',
      curves: [{ fn: `${r6(k)}/x`, domain: [r6(R), 80], color: 'accent', width: 2.6 }, seg(0, -30, R, -30, 'accent', 2.6), seg(R, -30, R, k / R, 'accent', 2.6),
        { fn: String(r6(Q)), domain: [0, 80], color: 'gold', width: 2, dash: true }],
      shade: [{ fn: `${r6(k)}/x`, lower: String(r6(Q)), from: r6(R), to: r6(rOut), color: 'bad', alpha: 0.3 }],
      points: [label(r6(R + 3), r6(Q - 5), 'the alpha must tunnel through the shaded barrier', 'bad', 0, 0, 'left'), label(78, Q, showQ ? `alpha’s energy, ${fmt(Q, 3)} MeV` : 'alpha’s energy', 'gold', 0, -10, 'right'),
        label(R / 2, -30, 'nucleus', 'accent', 0, 12, 'center'), label(r6(R + 2), r6(k / R), `${fmt(k / R, 3)} MeV barrier top`, 'accent', 0, 0, 'left')],
    },
    caption: caption ?? `An alpha particle’s potential energy near the daughter nucleus (Z = ${Zd}): a deep well inside about ${fmt(R, 2)} fm, the electric repulsion 2Zke²/r outside. The alpha’s energy (gold) is far below the barrier’s top; classically it could never leave. The square well is a simplification.`,
  };
}

/** The electron’s kinetic-energy spectrum in beta decay (allowed shape, Coulomb correction left out). */
function betaSpectrum(Q, { endpoint = true, caption } = {}) {
  const m = 0.511, f = `sqrt(x^2 + 2*x*${m})*(${r6(Q)} - x)^2*(x + ${m})`;
  let top = 0;
  for (let i = 1; i < 200; i++) { const x = (Q * i) / 200; top = Math.max(top, Math.sqrt(x * x + 2 * x * m) * (Q - x) ** 2 * (x + m)); }
  return {
    type: 'graph',
    params: {
      x: [0, r6(Q * 1.15)], y: [0, 1.25], aspect: 'wide', axesAt: 'edge', xlabel: 'electron kinetic energy (MeV)', ylabel: 'electrons per energy', yticks: 0,
      ...(endpoint ? {} : { xticks: 0 }),
      shade: [{ fn: `${f}/${r6(top)}`, from: 0, to: r6(Q), color: 'accent', alpha: 0.25 }],
      curves: [{ fn: `${f}/${r6(top)}`, domain: [0, r6(Q)], color: 'accent', width: 2.6 }],
      vlines: [{ x: r6(Q), label: endpoint ? 'endpoint = Q' : 'endpoint: ?', color: 'gold' }],
    },
    caption: caption ?? 'The energies of the electrons from many beta decays: a continuous spread up to the decay energy Q, not one sharp line. The antineutrino carries off the rest. Shape approximate (the Coulomb pull of the nucleus is left out).',
  };
}

/** Atomic mass against Z for the isobars of A = 101 (liquid drop; odd A, one parabola). */
const parabola = (() => {
  const A = 101, names = { 40: 'Zr', 41: 'Nb', 42: 'Mo', 43: 'Tc', 44: 'Ru', 45: 'Rh', 46: 'Pd', 47: 'Ag', 48: 'Cd' };
  const mass = (Z) => (Z * Nu.M_H + (A - Z) * Nu.M_N) * U - Nu.semf(Z, A).B;
  const m0 = Math.min(...Object.keys(names).map((z) => mass(+z)));
  const pts = Object.entries(names).map(([z, s]) => ({ x: +z, y: r6(mass(+z) - m0), r: 5, color: +z === 44 ? 'gold' : 'accent', label: `${s}-101`, labelDx: 0, labelDy: -12, labelAlign: 'center' }));
  return {
    type: 'graph',
    params: {
      x: [39.3, 48.7], y: [-2, 26], aspect: 'wide', axesAt: 'edge', xlabel: 'protons Z (A = 101 throughout)', ylabel: 'mass energy above the lightest (MeV)',
      curves: [{ fn: `(x*${Nu.M_H} + (101 - x)*${Nu.M_N})*${U} - (15.75*101 - 17.8*101^(2/3) - 0.711*x*(x - 1)/101^(1/3) - 23.7*(101 - 2*x)^2/101) - ${r6(m0)}`, color: 'ink3', width: 1.4, dash: true }],
      points: pts,
    },
    caption: 'Nuclei with the same mass number A = 101 (isobars), their masses from the liquid-drop formula. Each beta decay changes Z by one at fixed A and can only go downhill in mass. Real masses follow the parabola within a few MeV.',
  };
})();

export default lesson({
  id: 'phys2710.MP13.1',
  title: 'Nuclear binding and decay',
  minutes: 15, difficulty: 3,
  badges: ['est-obs', 'model'],
  intro: t`A nucleus behaves remarkably like a drop of charged liquid. Each nucleon binds only to its nearest neighbours, so the binding grows with the volume; those at the surface miss some neighbours; every proton repels every other; and the exclusion principle rewards equal numbers of protons and neutrons. The **liquid-drop (semi-empirical) mass formula** adds these up:

$$B = a_VA - a_SA^{2/3} - a_C\frac{Z(Z-1)}{A^{1/3}} - a_A\frac{(A - 2Z)^2}{A} + \delta$$

With $a_V = 15.75$, $a_S = 17.8$, $a_C = 0.711$ and $a_A = 23.7$ MeV it matches measured binding energies of heavy nuclei to within about 1%. A nucleus decays when it can become something more tightly bound: the **Q-value**, the mass lost times $c^2$, must be positive. Heavy nuclei shed alpha particles; nuclei with too many neutrons or protons beta-decay toward the valley of stability; excited nuclei emit gamma rays.

> PHYS 2220 introduced binding energy and half-lives ([A1.2](#/lesson/phys2220.A1.2), [A1.3](#/lesson/phys2220.A1.3)); this lesson asks why.`,
  symbols: [
    { tex: 'B', text: 'the binding energy: the energy needed to pull the nucleus apart into free protons and neutrons, in MeV' },
    { tex: 'A,\\ Z', text: 'the mass number (protons + neutrons) and the atomic number (protons); $N = A - Z$ neutrons' },
    { tex: 'a_V', text: 'the volume coefficient, 15.75 MeV: each nucleon’s share of binding with its neighbours' },
    { tex: 'a_S', text: 'the surface coefficient, 17.8 MeV: the binding lost by nucleons at the surface (the surface area grows as $A^{2/3}$)' },
    { tex: 'a_C', text: 'the Coulomb coefficient, 0.711 MeV: the electric repulsion of $Z$ protons in a sphere of radius $\\propto A^{1/3}$' },
    { tex: 'a_A', text: 'the asymmetry coefficient, 23.7 MeV: the exclusion-principle cost of having more of one kind of nucleon than the other' },
    { tex: '\\delta', text: t`the pairing term: $+a_P/\sqrt A$ for even $Z$ and even $N$, $-a_P/\sqrt A$ for both odd, 0 otherwise ($a_P = 11.18$ MeV)` },
  ],
  why: 'Binding energies decide what decays, what fuses and what fissions — from the plutonium heat source of a deep-space probe to the iron at a dying star’s core.',
  visual: {
    ...semfTerms({
      aS: 'aS', aC: 'aC', aA: 'aA',
      extra: {
        sliders: [
          { key: 'aS', label: 'Surface $a_S$', min: 0, max: 30, step: 0.1, value: 17.8, unit: '\\mathrm{MeV}', explain: 'The binding lost at the surface. It matters most for small nuclei, which are mostly surface.' },
          { key: 'aC', label: 'Coulomb $a_C$', min: 0, max: 1.2, step: 0.005, value: 0.711, unit: '\\mathrm{MeV}', explain: 'The protons’ electric repulsion, which grows as $Z^2$ and dominates heavy nuclei.' },
          { key: 'aA', label: 'Asymmetry $a_A$', min: 1, max: 40, step: 0.1, value: 23.7, unit: '\\mathrm{MeV}', explain: 'The cost of unequal numbers of protons and neutrons.' },
        ],
        readouts: [{ label: 'typical miss for A ≥ 16 (rms)', expr: misfit, unit: '\\mathrm{keV\\ per\\ nucleon}', digits: 3 }],
      },
    }),
    title: 'A nucleus as a liquid drop',
    lead: t`The flat dashed line is what each nucleon would get from its neighbours alone. Subtract the surface, then the protons’ repulsion, then the cost of unequal proton and neutron numbers, and the blue curve should run through the measured nuclei (gold).`,
    tasks: [
      'Set the Coulomb coefficient to 0: the curve no longer bends down for heavy nuclei — without the protons’ repulsion, fission would release nothing and uranium would be stable.',
      'Raise the surface coefficient: light nuclei, which are nearly all surface, fall furthest.',
      'Fit by hand: tune the three sliders to make the typical miss as small as you can. Then compare your values with the real ones — and look at helium-4 near A = 4, which no setting can reach.',
    ],
  },
  example: {
    prompt: t`Plutonium-238, the heat source of NASA’s radioisotope generators, decays by alpha emission: $\,{}^{238}\text{Pu} \to {}^{234}\text{U} + \alpha$. (a) From the atomic masses (Pu-238 238.0495601 u, U-234 234.0409523 u, He-4 4.0026033 u) find the Q-value. (b) How is it shared between the alpha particle and the recoiling uranium? (c) How well does the liquid-drop formula predict Q?`,
    visual: barrier(92, 238, Q_PU, { caption: 'The alpha particle’s potential energy around the uranium-234 it leaves behind: it must tunnel through the electric barrier, which is why plutonium-238 takes 87.7 years, on average, to half decay. The square well is a simplification.' }),
    steps: [
      { label: 'Mass lost', text: t`$\Delta m = 238.0495601 - 234.0409523 - 4.0026033 = ${fmt(M.pu238 - M.u234 - HE4, 4)}$ u. Atomic masses can be used directly: 94 electrons before, 92 + 2 after.` },
      { label: 'Q-value', text: t`$Q = \Delta m\,c^2 = ${fmt(M.pu238 - M.u234 - HE4, 4)}\times931.494\ \text{MeV} = ${fmt(Q_PU, 4)}$ MeV.` },
      { label: 'Sharing it', text: t`The parent is at rest, so the alpha and the daughter fly apart with equal and opposite momenta. With $K = p^2/2m$ the lighter one takes more energy: $K_\alpha = Q\,\dfrac{m_U}{m_U + m_\alpha} \approx Q\,\dfrac{A - 4}{A} = ${fmt(Q_PU, 4)}\times\dfrac{234}{238} = ${fmt(K_PU, 4)}$ MeV. The uranium recoils with the remaining ${fmt((Q_PU - K_PU) * 1000, 2)} keV.` },
      { label: 'The liquid drop', text: t`$Q = B(\text{U-234}) + B(\text{He-4}) - B(\text{Pu-238})$. The formula gives $B = ${fmt(Nu.semf(94, 238).B, 5)}$ MeV for Pu-238 and $${fmt(Nu.semf(92, 234).B, 5)}$ MeV for U-234; with helium-4’s measured 28.30 MeV, $Q = ${fmt(SEMF_Q, 3)}$ MeV. Its errors of over 10 MeV in each $B$ largely cancel, leaving a 3% miss.` },
      { label: 'Sense check', text: t`Measured alpha energies from plutonium-238 are 5.499 MeV (71%) and 5.456 MeV (29%, leaving the uranium in an excited state, which then gives a 43 keV gamma ray). The heavy recoiling nucleus does real damage: each one knocks thousands of atoms out of place in the fuel.` },
    ],
    answer: t`$Q = ${fmt(Q_PU, 4)}$ MeV; the alpha takes $${fmt(K_PU, 4)}$ MeV and the uranium ${fmt((Q_PU - K_PU) * 1000, 2)} keV; the liquid drop predicts ${fmt(SEMF_Q, 3)} MeV.`,
  },
  practice: [
    match({
      id: 'terms', difficulty: 1,
      prompt: 'Match each term of the liquid-drop formula with the physics behind it.',
      left: [t`$a_VA$`, t`$-a_SA^{2/3}$`, t`$-a_CZ(Z-1)/A^{1/3}$`, t`$-a_A(A - 2Z)^2/A$`],
      right: ['each nucleon is bound to its nearest neighbours only', 'nucleons at the surface have fewer neighbours', 'every proton repels every other proton', 'the exclusion principle fills proton and neutron levels separately', 'the nucleus spins faster when it is heavier'],
      answer: [0, 1, 2, 3],
      hints: ['How does each term grow with A? A total that grows as A means each nucleon contributes the same amount.', '$A^{2/3}$ is how a sphere’s surface area grows; Z(Z − 1)/2 counts the pairs of protons.'],
      teach: 'The liquid drop: volume binding, minus surface, Coulomb and asymmetry costs — each term a piece of physics.',
      explain: t`A short-range force saturates, so the binding grows as $A$ — like a liquid’s heat of vaporization. Surface nucleons miss neighbours, in proportion to the area $\propto A^{2/3}$. The $Z(Z-1)/2$ pairs of protons repel across a radius $\propto A^{1/3}$. And because protons and neutrons each obey the exclusion principle, an excess of either must sit in higher levels — the asymmetry term.`,
      visual: semfTerms({ caption: 'The liquid-drop terms per nucleon along the valley of stability, against measured nuclei (gold). A model: pairing is left out of the curves.' }),
    }),
    num({
      id: 'coulomb', difficulty: 2,
      gen(r) {
        const key = r.pick(['U-238', 'Pb-208', 'Au-197', 'Th-232', 'Ba-138']), n = Nu.byName[key], E = (0.711 * n.Z * (n.Z - 1)) / Math.cbrt(n.A);
        return {
          prompt: t`Using $a_C = 0.711$ MeV, what is the electric repulsion energy of the protons in ${key.replace('-', '-')} ($Z = ${n.Z}$, $A = ${n.A}$), in MeV? Compare it with its total binding energy, $${fmt(Nu.binding(n), 5)}$ MeV.`,
          answer: E, units: 'MeV', tol: { rel: 0.005 },
          errors: [{ value: (0.711 * n.Z * n.Z) / Math.cbrt(n.A), feedback: t`A proton does not repel itself: count $Z(Z-1)$, not $Z^2$ (a small difference here, but the formula says $Z(Z-1)$).` }, { value: (0.711 * n.Z * (n.Z - 1)) / n.A, feedback: t`The radius grows as $A^{1/3}$: divide by the cube root of $A$.` }].filter((e) => Math.abs(e.value / E - 1) > 0.004),
          hints: [t`$E_C = a_C\,Z(Z-1)/A^{1/3}$.`, t`$A^{1/3} = ${fmt(Math.cbrt(n.A), 4)}$.`],
          teach: 'The protons’ repulsion grows as $Z^2/A^{1/3}$: in heavy nuclei it eats up half the binding, which is why they fission and alpha-decay.',
          explain: t`$E_C = 0.711\times${n.Z}\times${n.Z - 1}/${fmt(Math.cbrt(n.A), 4)} = ${fmt(E, 4)}$ MeV — ${fmt((E / Nu.binding(n)) * 100, 2)}% of the binding energy that holds the nucleus together. Pushing Z higher soon makes nuclei that come apart within seconds; the heaviest known elements live for milliseconds.`,
          visual: { type: 'qm-binding', params: { nuclide: key, controls: false, readout: false, semf: true, labels: false }, caption: 'Binding energy per nucleon against mass number (AME2020 masses; dashed: the liquid drop). The highlighted nucleus is the one in the question; the curve’s fall at large A is the Coulomb term at work.' },
        };
      },
    }),
    num({
      id: 'alpha-q', difficulty: 2,
      gen(r) {
        const key = r.pick(Object.keys(ALPHAS)), a = ALPHAS[key], Q = Qa(key, a.d);
        return {
          prompt: t`${a.name[0].toUpperCase() + a.name.slice(1)} (${fmt(M[key], 10)} u) alpha-decays to ${a.dn} (${fmt(M[a.d], 10)} u). With helium-4 at 4.0026033 u and $1\ \text{u} = 931.494$ MeV, what is the Q-value, in MeV?`,
          answer: Q, units: 'MeV', tol: { rel: 0.003 },
          errors: [{ value: (M[key] - M[a.d]) * U, feedback: 'Subtract the alpha particle’s mass too: Q = [M(parent) − M(daughter) − M(He-4)]c².' }],
          hints: ['Q is the mass lost, times c².', t`$Q = [M_\text{parent} - M_\text{daughter} - M_{\text{He}}]\times931.494$ MeV/u. Atomic masses are fine: the electrons balance.`],
          teach: 'An alpha decay’s energy is the mass it loses: Q = [M(parent) − M(daughter) − M(He-4)]c².',
          explain: t`$\Delta m = ${fmt(M[key] - M[a.d] - HE4, 4)}$ u, so $Q = ${fmt(Q, 4)}$ MeV — a few MeV, like every alpha emitter. The alpha itself leaves with $Q(A - 4)/A = ${fmt((Q * (a.A - 4)) / a.A, 4)}$ MeV.`,
          visual: barrier(a.Z - 2, a.A, Q, { showQ: false }),
        };
      },
    }),
    num({
      id: 'recoil', difficulty: 2,
      gen(r) {
        const key = r.pick(Object.keys(ALPHAS)), a = ALPHAS[key], Q = +Qa(key, a.d).toFixed(3), Kr = (Q * 4) / a.A;
        return {
          prompt: t`${a.name[0].toUpperCase() + a.name.slice(1)} ($A = ${a.A}$), at rest, alpha-decays with $Q = ${Q}$ MeV. How much kinetic energy does the recoiling daughter nucleus take, in keV?`,
          answer: Kr * 1000, units: 'keV', tol: { rel: 0.01 },
          errors: [{ value: (Q * (a.A - 4)) / a.A * 1000, feedback: 'That is the alpha’s share. The heavy daughter takes the small remainder.' }, { value: (Q / 2) * 1000, feedback: 'Equal momenta, not equal energies: with K = p²/2m, the lighter particle takes far more.' }],
          hints: ['The two fly apart with equal and opposite momenta, and K = p²/2m.', t`The daughter’s share is $Q\,\dfrac{m_\alpha}{m_\alpha + m_d} \approx Q\,\dfrac{4}{A}$.`],
          teach: 'Momentum conservation splits a two-body decay unequally: the light alpha takes (A − 4)/A of Q, the heavy daughter 4/A.',
          explain: t`$K_d = Q\times4/${a.A} = ${fmt(Kr * 1000, 3)}$ keV — small next to the alpha’s ${fmt(Q - Kr, 4)} MeV, but enough to knock thousands of atoms out of place where it stops.`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-1, 1], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
            arrows: [{ from: [0.3, 0], to: [3.6, 0], color: 'gold', label: 'alpha', labelDx: -30, labelDy: -14 }, { from: [-0.6, 0], to: [-3.9, 0], color: 'accent', width: 4, label: 'daughter', labelDx: 10, labelDy: -14 }],
            points: [{ x: 0.2, y: 0, r: 5, color: 'gold' }, { x: -0.35, y: 0, r: 13, color: 'accent' }, label(0, -0.7, 'equal and opposite momenta', 'ink2', 0, 0, 'center')] },
            caption: 'After the decay: the alpha particle and the daughter nucleus fly apart with equal and opposite momenta (arrows show momentum, not speed). Not to scale.' },
        };
      },
    }),
    num({
      id: 'beta-q', difficulty: 2,
      gen(r) {
        const key = r.pick(Object.keys(BETAS)), b = BETAS[key], Q = (M[key] - M[b.d]) * U;
        return {
          prompt: t`In beta-minus decay, $${b.sym} + e^- + \bar\nu_e$, a neutron in the nucleus becomes a proton. With atomic masses ${b.name} ${fmt(M[key], 11)} u and ${b.dn} ${fmt(M[b.d], 11)} u, what is the decay energy Q, in keV?`,
          answer: Q * 1000, units: 'keV', tol: { rel: 0.003 },
          errors: [{ value: (Q - 0.51099895) * 1000, feedback: 'With atomic masses the emitted electron is already counted: the daughter atom has one more electron, exactly the one that was emitted. Q = [M(parent) − M(daughter)]c².' }].filter((e) => e.value > 0),
          hints: [t`For $\beta^-$ decay with **atomic** masses, $Q = [M_\text{parent} - M_\text{daughter}]c^2$: the electron masses balance.`, 'Multiply the mass difference in u by 931 494 keV/u.'],
          teach: 'Beta-minus Q-values come straight from atomic masses: Q = [M(parent) − M(daughter)]c².',
          explain: t`$Q = (${tex(M[key] - M[b.d], 4)}\ \text{u})(931{,}494\ \text{keV/u}) = ${fmt(Q * 1000, 4)}$ keV. That is the most energy any one electron can carry; most get less, the antineutrino taking the rest.${key === 'c14' ? ' Carbon-14’s small Q is part of why its half-life is long, 5730 years.' : ''}`,
          visual: betaSpectrum(Q, { endpoint: false, caption: `The spectrum of electron energies from ${b.name} (shape approximate; the Coulomb correction is left out). The endpoint is withheld.` }),
        };
      },
    }),
    mcq({
      id: 'neutrino', difficulty: 2,
      prompt: 'In alpha decay every alpha from a given transition has the same energy. In beta decay the electrons come out with every energy from zero up to Q. What does the spread tell us?',
      choices: [
        'A third, unseen particle shares the energy — the antineutrino, proposed by Pauli in 1930 and detected in 1956',
        'Energy is conserved only on average in beta decay',
        'The electrons lose varying amounts of energy colliding with the atom’s other electrons on the way out',
        'The nucleus is left in a different excited state each time, one for every electron energy',
      ],
      answer: 0,
      why: {
        1: 'Bohr briefly considered this in 1930. Every test since has found energy conserved in each decay.',
        2: 'Such losses are tiny and would not spread a sharp line across the whole range from 0 to Q.',
        3: 'Nuclei have a few discrete levels, not a continuum; and the gamma rays that would follow are not seen.',
      },
      hints: ['In a two-body decay, momentum conservation fixes each particle’s energy. What if there were three bodies?', 'Pauli’s “desperate remedy” of 1930.'],
      teach: 'A continuous beta spectrum means three bodies share the energy: the third is the (anti)neutrino.',
      explain: t`With two bodies, momentum conservation fixes each energy (as for alpha decay). A continuous spread means a third body takes a varying share. Pauli proposed a light neutral particle; Fermi built the theory; Cowan and Reines caught antineutrinos from a reactor in 1956. Neutrinos turned out to have mass — tiny, and still not measured (lesson MP13.2).`,
      visual: betaSpectrum(0.1565, { caption: 'The beta spectrum of carbon-14: electrons of every energy up to Q = 156 keV (shape approximate).' }),
    }),
    mcq({
      id: 'valley', difficulty: 3,
      prompt: 'The picture shows the masses of nuclei with A = 101. Molybdenum-101 (Z = 42) is radioactive. How does it decay?',
      choices: [
        'By beta-minus decay to technetium-101 (Z = 43), and then again to ruthenium-101 (Z = 44), which is stable',
        'By beta-plus decay to niobium-101 (Z = 41)',
        'By alpha decay, since it lies far from the bottom of the curve',
        'It cannot decay: a beta decay would change its mass number',
      ],
      answer: 0,
      why: {
        1: 'Niobium-101 lies higher on the curve: a decay can only go downhill in mass.',
        2: 'Alpha decay changes A by 4 and is important only for heavy nuclei (beyond about A = 150). Here a beta decay is downhill.',
        3: 'Beta decay changes Z by one and leaves A unchanged — it moves along this very curve.',
      },
      hints: ['A decay can happen only if the products are lighter: Q > 0.', 'Which neighbour of Mo-101 on the curve is lower? Beta-minus raises Z by one.'],
      teach: 'Isobars sit on a mass parabola; beta decays step downhill along it toward the valley of stability.',
      explain: t`Mo-101 has too many neutrons for its mass number. Beta-minus decay turns a neutron into a proton, stepping to Tc-101 and then to Ru-101 at the bottom of the parabola. Nuclei on the other side (Rh, Pd…) step down by beta-plus decay or electron capture. The liquid drop predicts the bottom here correctly; real masses follow the parabola within a few MeV.`,
      visual: parabola,
    }),
    code({
      id: 'fit-drop', difficulty: 3,
      prompt: t`Fit the liquid drop to real nuclei. The program holds ${DATA.length} nuclides from the 2020 Atomic Mass Evaluation and computes each binding energy from its mass. The formula is **linear** in its five coefficients, so a least-squares fit is one call. Finish \`fit()\`: build the matrix \`X\` whose columns are $A$, $-A^{2/3}$, $-Z(Z-1)/A^{1/3}$, $-(A-2Z)^2/A$ and $\delta/\sqrt A$ ($\delta = +1$ even–even, $-1$ odd–odd, 0 otherwise), and return \`np.linalg.lstsq(X, B, rcond=None)[0]\`. Then \`worst()\` names the nucleus the formula misses most.`,
      starter: t`import numpy as np

data = [${DATA.map((n, i) => `${i % 3 ? ' ' : '\n    '}("${n.name}", ${n.Z}, ${n.N}, ${n.M})`).join(',')}
]
mH, mn, U = 1.00782503223, 1.00866491606, 931.49410372      # u, u, MeV per u
Z = np.array([d[1] for d in data], float)
N = np.array([d[2] for d in data], float)
A = Z + N
B = (Z * mH + N * mn - np.array([d[3] for d in data])) * U   # measured binding energies, MeV

def fit():
    delta = np.where((Z % 2 == 0) & (N % 2 == 0), 1.0, np.where((Z % 2 == 1) & (N % 2 == 1), -1.0, 0.0))
    # X = np.column_stack([...five columns...])
    return np.zeros(5)

def worst(c):
    return ""

c = fit()
print("aV, aS, aC, aA, aP =", np.round(c, 3))
print("worst fit:", worst(c))
`,
      answer: t`import numpy as np

data = [${DATA.map((n, i) => `${i % 3 ? ' ' : '\n    '}("${n.name}", ${n.Z}, ${n.N}, ${n.M})`).join(',')}
]
mH, mn, U = 1.00782503223, 1.00866491606, 931.49410372
Z = np.array([d[1] for d in data], float)
N = np.array([d[2] for d in data], float)
A = Z + N
B = (Z * mH + N * mn - np.array([d[3] for d in data])) * U

def design():
    delta = np.where((Z % 2 == 0) & (N % 2 == 0), 1.0, np.where((Z % 2 == 1) & (N % 2 == 1), -1.0, 0.0))
    return np.column_stack([A, -A**(2/3), -Z*(Z - 1)/A**(1/3), -(A - 2*Z)**2/A, delta/np.sqrt(A)])

def fit():
    return np.linalg.lstsq(design(), B, rcond=None)[0]

def worst(c):
    miss = B - design() @ c
    return data[int(np.argmax(np.abs(miss)))][0]

c = fit()
print("aV, aS, aC, aA, aP =", np.round(c, 3))
print("worst fit:", worst(c))`,
      tests: [
        { name: t`the volume coefficient comes out at $16.24$ MeV`, code: 'abs(fit()[0] - 16.236) < 0.01' },
        { name: t`the Coulomb coefficient comes out at $0.754$ MeV`, code: 'abs(fit()[2] - 0.7537) < 0.002' },
        { name: t`the asymmetry coefficient comes out at $24.1$ MeV`, code: 'abs(fit()[3] - 24.146) < 0.02' },
        { name: 'the worst-fitted nucleus is doubly magic lead-208', code: 'worst(fit()) == "Pb-208"' },
      ],
      hints: [t`\`np.column_stack([A, -A**(2/3), -Z*(Z - 1)/A**(1/3), -(A - 2*Z)**2/A, delta/np.sqrt(A)])\` builds the matrix, one row per nucleus.`, t`For \`worst\`, the misses are \`B - X @ c\`; \`np.argmax(np.abs(miss))\` gives the index of the biggest, and \`data[i][0]\` its name. (Build \`X\` in a helper so both functions can use it.)`],
      teach: 'A model linear in its parameters is fitted by one least-squares solve; the residuals then show where the model’s physics runs out.',
      explain: t`The fit gives $a_V \approx 16.2$, $a_S \approx 19.4$, $a_C \approx 0.754$, $a_A \approx 24.1$ MeV — close to the textbook values, which come from fits to thousands of nuclei. (The pairing coefficient is poorly pinned down by so few nuclides.) The typical miss is about 3 MeV in binding energies of hundreds of MeV, but lead-208 is underbound by the formula by almost 10 MeV: with 82 protons and 126 neutrons it has two closed **shells** — the “magic numbers” that the liquid drop knows nothing about and the nuclear shell model explains.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-helium', difficulty: 3, transfer: true,
      gen(r) {
        const kg = r.pick([1, 3.5, 4.2]), atoms = ((kg * 1000) / M.pu238) * N_A, decayed = atoms * (1 - 2 ** (-1 / 87.7)), L = (decayed / N_A) * 22.414;
        return {
          prompt: t`A radioisotope generator holds ${kg} kg of plutonium-238 (238.05 g/mol, half-life 87.7 years). Every decay releases an alpha particle, which soon picks up two electrons and becomes a helium atom inside the fuel. How much helium builds up in one year, in litres at 0 °C and 1 atm (22.414 L/mol)? The fuel’s capsules are vented for exactly this reason.`,
          answer: L, units: 'L', tol: { rel: 0.01 },
          hints: [t`Nuclei: $N = (${kg * 1000}/238.05)\times6.022\times10^{23}$. The fraction that decays in a year is $1 - 2^{-1/87.7}$.`, 'Each decay gives one helium atom: moles = decays/N_A; litres = moles × 22.414.'],
          teach: 'Every alpha decay makes a helium atom: an alpha emitter is a slow helium factory, and its containers must allow for the gas.',
          explain: t`$N = ${tex(atoms, 3)}$ nuclei, of which $1 - 2^{-1/87.7} = ${fmt(1 - 2 ** (-1 / 87.7), 3)}$ decay in a year: $${tex(decayed, 3)}$ helium atoms, $${fmt(decayed / N_A, 3)}$ mol, $${fmt(L, 3)}$ L. Over a 14-year mission that is many litres of gas, so the iridium-clad fuel pellets have frits that let helium out and keep plutonium in.`,
          visual: { type: 'qm-decay', params: { isotope: 'pu238', t: 0.3, N0: 400, controls: false, readout: false, play: false }, caption: 'A sample of plutonium-238 decaying nucleus by nucleus (a model sample: a kilogram holds about 2.5 × 10²⁴ nuclei). Each decay emits an alpha particle — a helium nucleus.' },
        };
      },
    }),
    num({
      id: 'cp-ams', difficulty: 3, transfer: true,
      gen(r) {
        const age = r.pick([20000, 30000, 40000]), Aq = 0.23e-3 * 2 ** (-age / 5730), perHour = Aq * 3600;
        return {
          prompt: t`Living carbon has a carbon-14 activity of 0.23 Bq per gram (half-life 5730 years). A 1.0 mg sample of carbon from wood ${age.toLocaleString('en-GB').replace(',', ' ')} years old is all an archaeologist has. How many carbon-14 decays happen in it per hour?`,
          answer: perHour, tol: { rel: 0.01 },
          errors: [{ value: 0.23 * 3600 * 2 ** (-age / 5730), feedback: 'The sample is 1.0 mg, a thousandth of a gram.' }],
          hints: [t`Today’s activity: $0.23\ \text{Bq/g}\times10^{-3}\ \text{g}\times2^{-${age}/5730}$.`, 'One becquerel is one decay per second; multiply by 3600.'],
          teach: 'Old, small samples decay far too rarely to count: radiocarbon labs count the carbon-14 atoms themselves, with an accelerator mass spectrometer.',
          explain: t`$A = 2.3\times10^{-4}\times2^{-${fmt(age / 5730, 3)}} = ${tex(Aq, 3)}$ Bq, so about $${fmt(perHour, 2)}$ decays per hour — hopeless against background. But the sample still holds $A/\lambda \approx ${tex(Aq / (Math.LN2 / (5730 * Nu.YEAR)), 2)}$ carbon-14 atoms, which an accelerator mass spectrometer counts directly. That is how radiocarbon dating reaches back about 50 000 years with milligram samples. The carbon-14 itself is made high in the atmosphere when cosmic-ray neutrons hit nitrogen: $n + {}^{14}\text{N} \to {}^{14}\text{C} + p$, with $Q = +0.626$ MeV.`,
          visual: { type: 'qm-decay', params: { isotope: 'c14', t: r6(age / 5730), tmax: 8, N0: 400, controls: false, readout: false, play: false }, caption: 'A model sample of carbon-14 after the given age: most nuclei (grey) have decayed. A real milligram of old carbon holds only about a million carbon-14 atoms among 5 × 10¹⁹ ordinary ones.' },
        };
      },
    }),
    mcq({
      id: 'cp-why-alpha', difficulty: 2,
      prompt: 'Plutonium-238 has too many protons for comfort, yet it never emits a single proton; it emits alpha particles (two protons and two neutrons) instead. Why?',
      choices: [
        'Emitting a proton would need about 6 MeV (Q < 0), while the alpha, being so tightly bound itself (28.3 MeV), carries Q = +5.6 MeV',
        'Protons are too heavy to escape the nucleus',
        'A proton would violate charge conservation; an alpha does not',
        'Alpha particles are emitted because they are lighter than protons',
      ],
      answer: 0,
      why: {
        1: 'The alpha is four times heavier than a proton and still escapes.',
        2: 'Both carry away positive charge, and both decays conserve it.',
        3: 'An alpha particle is about four times as massive as a proton.',
      },
      hints: ['A decay can only happen if it releases energy: compare the Q-values.', 'How strongly bound is helium-4 compared with its neighbours on the binding curve?'],
      teach: 'Alpha decay wins because helium-4 is exceptionally tightly bound: emitting it releases energy where emitting a single nucleon would cost it.',
      explain: t`From the masses, $Q_p = [M(\text{Pu-238}) - M(\text{Np-237}) - M(\text{H-1})]c^2 = ${fmt((M.pu238 - M.np237 - M.h1) * U, 3)}$ MeV: impossible. Helium-4’s 28.3 MeV of binding — 7.07 MeV per nucleon — pays for itself: $Q_\alpha = +${fmt(Q_PU, 3)}$ MeV.`,
      visual: { type: 'qm-binding', params: { nuclide: 'He-4', controls: false, readout: false, semf: true }, caption: 'Binding energy per nucleon (AME2020 masses). Helium-4 sits far above its light neighbours and above the liquid-drop curve (dashed): it is the most tightly bound of the light nuclei.' },
    }),
  ],
  sources: [
    { label: 'Wang et al. (2021), The AME 2020 atomic mass evaluation (II), Chinese Physics C 45, 030003', url: 'https://doi.org/10.1088/1674-1137/abddaf' },
    { label: 'OpenStax University Physics Vol. 3, ch. 10 (nuclear physics)', url: 'https://openstax.org/books/university-physics-volume-3/pages/10-introduction' },
    { label: 'Krane, Introductory Nuclear Physics, ch. 3 and 8–9 (the liquid drop; alpha and beta decay)', url: 'https://www.wiley.com/en-us/Introductory+Nuclear+Physics%2C+3rd+Edition-p-9780471805533' },
    { label: 'NASA, Radioisotope power systems (plutonium-238)', url: 'https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/' },
  ],
});
