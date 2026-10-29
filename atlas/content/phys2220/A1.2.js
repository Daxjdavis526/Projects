// Nuclear structure and binding energy — Z protons and N neutrons in a
// nucleus of radius 1.2 fm × A^(1/3), the same density in every nucleus; the
// mass defect and binding energy B = (Z m_H + N m_n − M)c² from measured
// atomic masses; the curve of binding energy per nucleon, peaking near iron
// and nickel; why fusing light nuclei and splitting heavy ones both release
// energy. Masses from the Atomic Mass Evaluation via model/qm-nuclear.js.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import * as Nu from '../../src/viz/model/qm-nuclear.js';
import { C, seg, label, r6 } from './_modern.js';

const t = String.raw;

// the rounded values the problems print
const MH = 1.007825, MN = 1.008665, UC2 = 931.5;   // u (a hydrogen atom), u (a neutron), MeV per u
const MP = 1.007276;                                // u, a bare proton: the slip of mixing it with atomic masses
const MEV_J = 1.602176634e-13;                      // J per MeV
const m6 = (name) => +Nu.byName[name].M.toFixed(6); // an atomic mass to six decimals, as printed
const partsOf = (name) => { const n = Nu.byName[name]; return n.Z * MH + n.N * MN; };
const Bof = (name) => (partsOf(name) - m6(name)) * UC2;                   // MeV, from the printed numbers
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
const sup = (s) => String(s).replace(/[-\d]/g, (d) => SUP[d]);
const sym = (name) => { const [el, A] = name.split('-'); return sup(A) + el; };          // ⁵⁶Fe, for canvas labels
const texSym = (name) => { const [el, A] = name.split('-'); return `{}^{${A}}\\text{${el}}`; };
/** 'a' or 'an' before a nuclide's name (an iron-56, a uranium-238). */
const an = (name) => (/^[aeio]/.test(NAMES[name]) ? 'an' : 'a');
const NAMES = { 'He-4': 'helium-4', 'C-12': 'carbon-12', 'O-16': 'oxygen-16', 'Ca-40': 'calcium-40', 'Fe-56': 'iron-56', 'Ni-62': 'nickel-62', 'Sn-120': 'tin-120', 'Pb-208': 'lead-208', 'Au-197': 'gold-197', 'U-235': 'uranium-235', 'U-238': 'uranium-238' };
/** 8.2 × 10¹³, for canvas labels. */
const pow10 = (v, n = 2) => { const [m, e] = v.toExponential(n - 1).split('e'); return `${m} × 10${sup(parseInt(e, 10))}`; };

// fission and fusion energies per kilogram (J/kg)
const PER_FISSION = 200;                                                   // MeV, the round figure the problems use
const U235_NUCLEI_PER_KG = (1000 / 235.04) * Nu.NA;
const U235_JKG = U235_NUCLEI_PER_KG * PER_FISSION * MEV_J;
const Q_DT = (2.014102 + 3.016049 - 4.002603 - 1.008665) * UC2;            // MeV
const DT_JKG = (Q_DT * MEV_J) / ((2.014102 + 3.016049) * Nu.U_KG);

/** The curve of binding energy as a still item picture. */
const curve = (nuclide, extra = {}, caption) => ({
  type: 'qm-binding', params: { nuclide, controls: false, readout: false, ...extra },
  caption: caption ?? 'Binding energy per nucleon of measured nuclides (dots) against mass number; dashed, the liquid-drop model.',
});

/**
 * Two bars — the separate parts and the bound atom — on a mass axis that
 * starts just below the smaller mass (not at zero), with the mass defect
 * marked between them.
 */
function massBars({ parts, whole, partsText, wholeText, gapText, energyText, caption }) {
  const d = parts - whole, lo = whole - 1.6 * d, hi = parts + 0.9 * d;
  const bar = (x0, x1, top, color) => ({ fn: `${r6(top)}`, lower: `${r6(lo)}`, from: x0, to: x1, color, alpha: 0.5 });
  const xg = 7.6;
  return {
    type: 'graph',
    params: {
      x: [-0.4, 12], y: [r6(lo), r6(hi)], aspect: 'wide', axesAt: 'edge', xticks: 0, xlabel: '', ylabel: 'mass (u)', grid: false,
      shade: [bar(0.6, 3.4, parts, 'accent'), bar(4.4, 7.2, whole, 'good')],
      curves: [
        seg(0.6, parts, 3.4, parts, 'accent', 2.4), seg(4.4, whole, 7.2, whole, 'good', 2.4),
        seg(3.4, parts, xg + 0.3, parts, 'ink3', 1.2, true),
        seg(xg, whole, xg, parts, 'gold', 2.2), seg(xg - 0.2, parts, xg + 0.2, parts, 'gold', 2.2), seg(xg - 0.2, whole, xg + 0.2, whole, 'gold', 2.2),
      ],
      points: [
        label(2.0, parts, partsText[0], 'ink', 0, -28, 'center'), label(2.0, parts, partsText[1], 'ink2', 0, -13, 'center'),
        label(5.8, whole, wholeText[0], 'ink', 0, -28, 'center'), label(5.8, whole, wholeText[1], 'ink2', 0, -13, 'center'),
        label(xg, (parts + whole) / 2, gapText, 'gold', 10, -9),
        label(xg, (parts + whole) / 2, energyText, 'gold', 10, 9),
      ],
    },
    caption: caption ?? `The mass axis starts at ${lo.toFixed(2)} u, not at zero: drawn from zero, a difference this small would be invisible.`,
  };
}

/** Nuclei drawn to scale as discs of radius 1.2 fm × A^(1/3), left to right. */
function discs(names, { values = false, caption } = {}) {
  const shade = [], curves = [], points = [];
  let x = 0, top = 0;
  for (const name of names) {
    const R = Nu.radiusFm(Nu.byName[name].A), cx = x + R, s = `sqrt(max(0, ${r6(R * R)} - (x - ${r6(cx)})^2))`;
    shade.push({ fn: s, lower: `-${s}`, from: r6(cx - R), to: r6(cx + R), color: 'accent', alpha: 0.3 });
    curves.push({ param: [`${r6(cx)} + ${r6(R)}*cos(t)`, `${r6(R)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2 });
    points.push(label(cx, -R, values ? `${sym(name)}: R = ${R.toFixed(1)} fm` : sym(name), 'ink2', 0, 14, 'center'));
    x = cx + R + 2.2;
    top = Math.max(top, R);
  }
  // a 2 fm scale bar
  curves.push(seg(0, top + 1.6, 2, top + 1.6, 'ink2', 2.2), seg(0, top + 1.3, 0, top + 1.9, 'ink2', 2), seg(2, top + 1.3, 2, top + 1.9, 'ink2', 2));
  points.push(label(1, top + 1.6, '2 fm', 'ink2', 0, -12, 'center'));
  return {
    type: 'graph',
    params: { x: [-1.2, r6(x - 1)], y: [r6(-top - 3.2), r6(top + 3.2)], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade, curves, points },
    caption: caption ?? 'Nuclei drawn to scale as spheres of radius 1.2 fm × A^(1/3). Real nuclei have soft edges, about 2 fm thick, rather than a sharp surface.',
  };
}

/** Energy released per kilogram of fuel, as horizontal bars on a logarithmic axis. */
function energyBars({ hideU = false, caption } = {}) {
  const rows = [
    ['lithium-ion battery', 0.9e6], ['TNT', 4.184e6], ['kerosene, burnt', 43e6],
    ['uranium-235, fissioned', U235_JKG], ['deuterium–tritium, fused', DT_JKG], ['all the mass, E = mc²', C * C],
  ];
  const shade = [], points = [];
  rows.forEach(([name, v], k) => {
    const y = rows.length - k, hidden = hideU && name.startsWith('uranium');
    if (!hidden) shade.push({ fn: `${r6(y + 0.2)}`, lower: `${r6(y - 0.2)}`, from: 5, to: r6(Math.log10(v)), color: k < 3 ? 'warn' : 'accent', alpha: 0.6 });
    points.push(label(5, y + 0.2, name, 'ink2', 4, -9, 'left'));
    points.push(label(hidden ? 5 : Math.log10(v), y, hidden ? '?' : pow10(v), hidden ? 'gold' : 'ink', 6, 0, 'left'));
  });
  return {
    type: 'graph',
    params: { x: [5, 19.4], y: [0.45, rows.length + 0.75], aspect: 'wide', axesAt: 'edge', xlog: true, yticks: 0, grid: false, xlabel: 'energy released per kilogram (J/kg)', ylabel: '', shade, points },
    caption: caption ?? 'Energy released per kilogram of fuel, on a logarithmic scale: each step along the axis is ten times the last. Battery: about 250 Wh/kg; fission at 200 MeV per nucleus.',
  };
}

export default lesson({
  id: 'phys2220.A1.2',
  title: 'Nuclear structure and binding energy',
  minutes: 13, difficulty: 2,
  intro: t`At the centre of every atom sits a nucleus tens of thousands of times smaller than the atom itself: $Z$ protons and $N$ neutrons — $A = Z + N$ nucleons — held together by the strong nuclear force, which grips neighbouring nucleons hard but reaches only about a femtometre ($10^{-15}$ m). Nucleons pack like the molecules of a liquid, so a nucleus’s volume grows in proportion to $A$ and its radius as the cube root, $R \approx 1.2\ \text{fm}\times A^{1/3}$.

Weigh a nucleus and it comes out *lighter* than its separate protons and neutrons. The missing mass, times $c^2$, is the **binding energy** — the energy released when the nucleons came together, and the energy it would take to pull them apart:

$$B = \left(Z\,m_{\text{H}} + N\,m_n - M\right)c^2$$

Divided by $A$, it makes the most important graph in nuclear physics. Binding energy per nucleon climbs steeply through the light nuclei, peaks at 8.8 MeV near iron and nickel, and sags slowly to 7.6 MeV for uranium. Any change that moves nucleons up the curve releases energy: light nuclei fusing, heavy ones splitting.

> Continue in [Introductory Modern Physics](#/course/phys2710), whose last module returns to nuclear binding and decay.`,
  symbols: [
    { tex: 'Z,\\ N,\\ A', text: 'the numbers of protons (the atomic number, which fixes the element) and neutrons, and the mass number $A = Z + N$, the number of nucleons' },
    { tex: 'M', text: 'the measured mass of the whole *atom*, in atomic mass units: $1\\ \\text{u} = 1.66054\\times10^{-27}$ kg, a twelfth of a carbon-12 atom' },
    { tex: 'm_{\\text{H}},\\ m_n', text: 'the masses of a hydrogen atom, 1.007825 u, and of a neutron, 1.008665 u. Counting hydrogen *atoms* brings along $Z$ electrons, which cancel the $Z$ in the atom’s mass $M$' },
    { tex: 'B', text: t`the binding energy, in MeV. With $1\ \text{u}\,c^2 = ${fmt(Nu.U_MEV, 6)}$ MeV, a mass defect $\Delta m$ in u times 931.5 gives $B$ in MeV` },
    { tex: 'B/A', text: 'the binding energy per nucleon: the average energy needed to remove one nucleon, and the height of the curve' },
    { tex: 'R', text: 'the nuclear radius, $R \\approx R_0A^{1/3}$ with $R_0 = 1.2$ fm $= 1.2\\times10^{-15}$ m' },
  ],
  why: 'The curve of binding energy explains why the Sun shines, why a kilogram of uranium can do the work of millions of kilograms of fuel, and why iron is so common — and it sets how much energy any nuclear process can release.',
  visual: {
    type: 'qm-binding',
    title: 'The curve of binding energy',
    lead: 'Each dot is a real nucleus, placed by its measured mass. Step through the nuclides to read each one’s mass defect and binding energy; switch on fusion and fission to see both climb toward the peak.',
    tasks: [
      'Step from deuterium to iron-56: the binding per nucleon climbs from 1.1 MeV to 8.8 MeV.',
      'Carry on to uranium-238: the curve sags to 7.6 MeV per nucleon, though the total binding energy keeps growing, to 1802 MeV.',
      'Helium-4, carbon-12 and oxygen-16 stand above the dashed liquid-drop curve: unusually stable nuclei.',
      'Switch on fusion and fission: both arrows climb toward the peak, so both release energy.',
    ],
    params: { nuclide: 'H-2', semf: true, reactions: false },
  },
  example: {
    prompt: t`An iron-56 atom ($Z = 26$) has a measured mass of ${m6('Fe-56').toFixed(6)} u. Find the binding energy of its nucleus and the binding energy per nucleon. (Use $m_{\text{H}} = 1.007825$ u, $m_n = 1.008665$ u and $1\ \text{u}\,c^2 = 931.5$ MeV.)`,
    visual: massBars({ parts: partsOf('Fe-56'), whole: m6('Fe-56'), partsText: ['26 ¹H + 30 n, apart', `${partsOf('Fe-56').toFixed(4)} u`], wholeText: ['⁵⁶Fe atom', `${m6('Fe-56').toFixed(4)} u`], gapText: `Δm = ${(partsOf('Fe-56') - m6('Fe-56')).toFixed(4)} u`, energyText: `B = ${Bof('Fe-56').toFixed(1)} MeV`, caption: `The separate parts of an iron-56 atom weigh more than the atom itself. The mass axis starts at 55.1 u, not at zero, so the 0.94% difference can be seen.` }),
    steps: [
      { label: 'Count the nucleons', text: t`$Z = 26$ protons and $N = 56 - 26 = 30$ neutrons.` },
      { label: 'Weigh the parts', text: t`$Z m_{\text{H}} + N m_n = 26(1.007825) + 30(1.008665) = ${(26 * MH).toFixed(6)} + ${(30 * MN).toFixed(6)} = ${partsOf('Fe-56').toFixed(6)}$ u. The 26 hydrogen atoms bring 26 electrons, matching the 26 in the iron atom, so the electrons cancel.` },
      { label: 'The mass defect', text: t`$\Delta m = ${partsOf('Fe-56').toFixed(6)} - ${m6('Fe-56').toFixed(6)} = ${(partsOf('Fe-56') - m6('Fe-56')).toFixed(6)}$ u: the bound atom is lighter than its parts.` },
      { label: 'Binding energy', text: t`$B = ${(partsOf('Fe-56') - m6('Fe-56')).toFixed(6)}\times931.5\ \text{MeV} = ${fmt(Bof('Fe-56'), 4)}$ MeV, so $B/A = ${fmt(Bof('Fe-56'), 4)}/56 = ${fmt(Bof('Fe-56') / 56, 4)}$ MeV per nucleon.` },
      { label: 'Sense check', text: t`The defect is ${fmt((100 * (partsOf('Fe-56') - m6('Fe-56'))) / m6('Fe-56'), 2)}% of the atom’s mass. Chemical bonds change masses by only about one part in $10^{10}$ — far too little for any balance to notice.` },
      { label: 'Near the summit', text: t`Nickel-62, at ${fmt(Nu.bindingPerNucleon(Nu.byName['Ni-62']), 4)} MeV per nucleon, edges out iron-56 for the very top of the curve. Iron-56 is far more common because stars build nickel-56, which decays into iron-56.` },
    ],
    answer: t`$B = ${fmt(Bof('Fe-56'), 4)}$ MeV, or ${fmt(Bof('Fe-56') / 56, 4)} MeV per nucleon.`,
  },
  practice: [
    num({
      id: 'binding-energy', difficulty: 2,
      gen(r) {
        const name = r.pick(['He-4', 'C-12', 'O-16', 'Ca-40']);
        const n = Nu.byName[name], M = m6(name), B = Bof(name), dm = partsOf(name) - M;
        return {
          prompt: t`An atom of ${NAMES[name]}, $${texSym(name)}$, has ${n.Z} protons, ${n.N} neutrons and a mass of ${M.toFixed(6)} u${name === 'C-12' ? ' (exactly — carbon-12 defines the atomic mass unit)' : ''}. Find the binding energy of its nucleus, in MeV. (Use $m_{\text{H}} = 1.007825$ u for a hydrogen atom, $m_n = 1.008665$ u and $1\ \text{u}\,c^2 = 931.5$ MeV.)`,
          answer: B, units: 'MeV', tol: { rel: 0.003 },
          errors: [
            { value: (n.Z * MP + n.N * MN - M) * UC2, feedback: t`That uses the bare proton’s mass, 1.007276 u, against the mass of the whole atom, so the atom’s ${n.Z} electrons are counted as lost mass. Use hydrogen *atoms*, $m_{\text{H}}$: their electrons cancel the atom’s.` },
            { value: B / n.A, feedback: 'That is the binding energy per nucleon. The question asks for the total.' },
          ],
          hints: [t`The separate parts weigh $${n.Z}\,m_{\text{H}} + ${n.N}\,m_n$.`, t`Subtract the atom’s mass to get the mass defect in u, then multiply by 931.5 MeV per u.`],
          teach: 'A binding energy is the mass defect — how much lighter the nucleus is than its separate nucleons — times c².',
          explain: t`$\Delta m = ${partsOf(name).toFixed(6)} - ${M.toFixed(6)} = ${dm.toFixed(6)}$ u, so $B = ${dm.toFixed(6)}\times931.5 = ${fmt(B, 4)}$ MeV, or ${fmt(B / n.A, 3)} MeV per nucleon.${name === 'He-4' ? ' Helium-4 is bound far more tightly than its neighbours — which is why heavy nuclei shed alpha particles whole.' : ''}`,
          visual: curve(name, { hide: ['B'], semf: false }, `The curve of binding energy, with ${NAMES[name]} marked.`),
        };
      },
    }),
    mcq({
      id: 'what-binding-means', difficulty: 1,
      prompt: 'The binding energy of helium-4 is 28.3 MeV. What does that number mean?',
      choices: [
        'It is the energy needed to pull the nucleus apart into 2 separate protons and 2 neutrons — the energy released when they came together',
        'It is the energy the nucleus gives out when it is split into its separate protons and neutrons',
        'It is extra energy stored in the nucleus, which makes it heavier than its separate protons and neutrons',
        'It is the energy holding each nucleon, so the four nucleons together are bound by 4 × 28.3 MeV',
      ],
      answer: 0,
      why: {
        1: 'Pulling a nucleus apart into separate nucleons always costs energy: the parts weigh more than the nucleus. (A heavy nucleus splitting into two smaller *nuclei* can release energy — that is fission, a different change.)',
        2: 'The other way round: the bound nucleus is lighter than its parts, by 28.3 MeV/c², because that energy left when it formed.',
        3: t`28.3 MeV is the total for the whole nucleus. On average each nucleon is bound by $28.3/4 = 7.07$ MeV — the binding energy per nucleon.`,
      },
      hints: ['Look at the picture: which weighs more, the separate parts or the nucleus?'],
      teach: 'Binding energy is what it costs to take a nucleus apart; it shows up as the nucleus weighing less than its parts.',
      explain: 'Two hydrogen atoms and two neutrons weigh 0.0304 u more than one helium-4 atom. When they combine, that mass leaves as 28.3 MeV of energy — gamma rays and motion; to separate them again, the 28.3 MeV must be put back.',
      visual: massBars({ parts: partsOf('He-4'), whole: m6('He-4'), partsText: ['2 ¹H + 2 n, apart', `${partsOf('He-4').toFixed(5)} u`], wholeText: ['⁴He atom', `${m6('He-4').toFixed(5)} u`], gapText: `Δm = ${(partsOf('He-4') - m6('He-4')).toFixed(4)} u`, energyText: `= ${Bof('He-4').toFixed(1)} MeV`, caption: 'The parts of a helium-4 atom, apart, and the atom itself. The mass axis starts at 3.95 u, not at zero, so the 0.75% difference can be seen.' }),
    }),
    num({
      id: 'radius-ratio', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([['U-238', 'He-4'], ['Pb-208', 'O-16'], ['Fe-56', 'He-4'], ['Au-197', 'C-12']]);
        const A1 = Nu.byName[a].A, A2 = Nu.byName[b].A, ratio = Math.cbrt(A1 / A2);
        return {
          prompt: t`Nuclear radii follow $R = R_0A^{1/3}$ with $R_0 = 1.2$ fm. How many times larger is the radius of ${an(a)} ${NAMES[a]} nucleus ($A = ${A1}$) than that of ${an(b)} ${NAMES[b]} nucleus ($A = ${A2}$)?`,
          answer: ratio, tol: { rel: 0.005 },
          errors: [
            { value: A1 / A2, feedback: t`That is the ratio of the mass numbers — and so of the *volumes*. The radius grows only as the cube root, $A^{1/3}$.` },
            { value: Math.sqrt(A1 / A2), feedback: t`The radius goes as the cube root of $A$, not the square root.` },
          ],
          hints: [t`The $R_0$ cancels: $R_1/R_2 = (A_1/A_2)^{1/3}$.`],
          teach: 'A nucleus’s volume is proportional to its number of nucleons, so its radius grows only as the cube root of A.',
          explain: t`$\dfrac{R_1}{R_2} = \left(\dfrac{${A1}}{${A2}}\right)^{1/3} = ${fmt(ratio, 3)}$ — radii of ${fmt(Nu.radiusFm(A1), 2)} fm and ${fmt(Nu.radiusFm(A2), 2)} fm. ${fmt(A1 / A2, 3)} times the nucleons need ${fmt(A1 / A2, 3)} times the volume, but only ${fmt(ratio, 3)} times the radius.`,
          visual: discs([b, a], { caption: `${an(b) === 'an' ? 'An' : 'A'} ${NAMES[b]} nucleus and ${an(a)} ${NAMES[a]} nucleus, drawn to scale. Real nuclei have soft edges rather than a sharp surface.` }),
        };
      },
    }),
    num({
      id: 'nuclear-density', difficulty: 2,
      prompt: t`A nucleus of mass number $A$ has a mass of about $A\times1.66\times10^{-27}$ kg and a radius $R = R_0A^{1/3}$, with $R_0 = 1.2\times10^{-15}$ m. Find its density, in kg/m³.`,
      answer: 1.66e-27 / ((4 / 3) * Math.PI * 1.2e-15 ** 3), units: 'kg/m^3', tol: { rel: 0.01 },
      errors: [{ value: 1.66e-27 / 1.2e-15 ** 3, feedback: t`A sphere’s volume is $\tfrac43\pi R^3$, not $R^3$.` }],
      hints: [t`Density $= \dfrac{A\times1.66\times10^{-27}\ \text{kg}}{\tfrac43\pi R_0^3 A}$ — the $A$ cancels.`, t`$\rho = \dfrac{1.66\times10^{-27}\ \text{kg}}{\tfrac43\pi\,(1.2\times10^{-15}\ \text{m})^3}$.`],
      teach: 'Because R³ is proportional to A, every nucleus has the same density: nuclear matter behaves like a liquid that cannot be squeezed.',
      explain: t`$\rho = \dfrac{1.66\times10^{-27}}{\tfrac43\pi(1.2\times10^{-15})^3} = ${tex(1.66e-27 / ((4 / 3) * Math.PI * 1.2e-15 ** 3), 2)}$ kg/m³, whatever $A$ is — about $${tex(1.66e-27 / ((4 / 3) * Math.PI * 1.2e-15 ** 3) / 1000, 1)}$ times the density of water. A neutron star is a ball of matter roughly this dense: 1.4 solar masses packed into a sphere some 12 km in radius.`,
      visual: discs(['He-4', 'Fe-56', 'U-238'], { values: true, caption: 'Helium-4, iron-56 and uranium-238 nuclei, drawn to scale: 59.5 times as many nucleons make uranium only 3.9 times as wide as helium.' }),
    }),
    mcq({
      id: 'total-vs-per', difficulty: 2,
      prompt: 'The total binding energy of uranium-238 is 1802 MeV; that of iron-56 is 492 MeV. Which nucleus holds its nucleons more tightly?',
      choices: [
        'Iron-56: its binding energy per nucleon is larger',
        'Uranium-238: its total binding energy is nearly four times larger',
        'Neither: the strong force is the same in every nucleus, so every nucleon is held equally tightly',
        'Uranium-238: its 238 nucleons are packed more densely',
      ],
      answer: 0,
      why: {
        1: 'A bigger nucleus has more nucleons to bind, so its total is bound to be larger. What matters is the binding per nucleon, and uranium’s nucleons are each held less tightly — which is why splitting uranium releases energy.',
        2: 'The strong force between neighbours is the same, but uranium’s 92 protons repel each other far more than iron’s 26, lowering the binding per nucleon.',
        3: 'Nuclear density is the same in every nucleus: uranium’s nucleons are no closer together than iron’s.',
      },
      hints: ['Divide each total by the number of nucleons.'],
      teach: 'How tightly a nucleus is bound is measured per nucleon, B/A — that is what the curve plots, and what decides whether a change releases energy.',
      explain: t`$492/56 = 8.79$ MeV per nucleon for iron; $1802/238 = 7.57$ MeV for uranium. Uranium’s total is bigger only because it has more nucleons, each held less tightly.`,
      visual: curve('U-238', { semf: false }, 'The curve of binding energy, with uranium-238 marked.'),
    }),
    multi({
      id: 'which-release', difficulty: 2,
      prompt: 'Using the curve of binding energy, which of these changes release energy? Select every one that does.',
      choices: [
        'Fusing deuterium and tritium into helium-4 and a neutron',
        'Splitting a uranium-235 nucleus, after it absorbs a neutron, into barium and krypton',
        'Splitting an iron-56 nucleus into two lighter nuclei',
        'Fusing two iron-56 nuclei into one nucleus of 112 nucleons',
        'Splitting a helium-4 nucleus into two deuterium nuclei',
      ],
      answer: [0, 1],
      why: {
        2: 'Iron sits at the peak of the curve: lighter pieces would be less tightly bound per nucleon, so splitting iron costs energy.',
        3: 'A nucleus of 112 nucleons lies past the peak, less tightly bound per nucleon than iron, so fusing iron costs energy.',
        4: 'Deuterium is bound by only 1.1 MeV per nucleon, against 7.1 MeV in helium-4: splitting helium-4 this way costs 23.8 MeV.',
      },
      hints: ['A change releases energy when its products are bound more tightly per nucleon — higher on the curve — than what it started with.'],
      teach: 'Energy is released by any change that climbs toward the peak near iron: fusion from the light side, fission from the heavy side.',
      explain: 'Deuterium and tritium (1.1 and 2.8 MeV per nucleon) climb to helium-4 (7.1 MeV); uranium (7.6 MeV) splits into nuclei bound by about 8.5 MeV. Iron sits at the peak, so any change to it — splitting or fusing — costs energy.',
      visual: curve(null, { semf: false }, 'The curve of binding energy, with some landmark nuclei named.'),
    }),
    num({
      id: 'fission-estimate', difficulty: 2,
      prompt: 'When a uranium-235 nucleus (7.59 MeV per nucleon) absorbs a neutron and splits, its products end up — after their own decays — as nuclei bound by about 8.5 MeV per nucleon. Estimate the energy released per fission, in MeV, counting 235 nucleons.',
      answer: 235 * (8.5 - 7.59), units: 'MeV', tol: { rel: 0.02 },
      errors: [
        { value: 8.5 - 7.59, feedback: 'That is the gain per nucleon; each of the 235 nucleons gains it.' },
        { value: 235 * 8.5, feedback: 'That is the binding energy of the products. The energy released is the increase: products minus uranium.' },
      ],
      hints: [t`Each nucleon becomes more tightly bound by $8.5 - 7.59 = 0.91$ MeV.`, 'Multiply by the number of nucleons.'],
      teach: 'Fission releases energy because the middle-mass products are bound about 0.9 MeV more tightly per nucleon than uranium.',
      explain: t`$235\times(8.5 - 7.59) \approx ${fmt(235 * (8.5 - 7.59), 3)}$ MeV. Careful bookkeeping — the 2 or 3 neutrons set free carry no binding energy — brings it to about 200 MeV, the measured energy per fission: tens of millions of times the few electronvolts of a chemical reaction.`,
      visual: curve('U-235', { semf: false, reactions: true }, 'The curve of binding energy with uranium-235 marked. Fusion (green) and fission (orange) both climb toward the peak.'),
    }),
    num({
      id: 'dt-fusion', difficulty: 3,
      prompt: t`The fusion reaction planned for power plants joins deuterium and tritium: ${'$'}{}^{2}\text{H} + {}^{3}\text{H} \to {}^{4}\text{He} + n$. From the atomic masses — deuterium 2.014102 u, tritium 3.016049 u, helium-4 4.002603 u — and the neutron’s 1.008665 u, find the energy each reaction releases, in MeV. ($1\ \text{u}\,c^2 = 931.5$ MeV.)`,
      answer: Q_DT, units: 'MeV', tol: { rel: 0.005 },
      errors: [{ value: (2.014102 + 3.016049 - 4.002603) * UC2, feedback: 'The neutron is a product too: include its mass on the right-hand side.' }],
      hints: [t`Mass before: $2.014102 + 3.016049$ u. Mass after: $4.002603 + 1.008665$ u.`, 'The energy released is (mass before − mass after) × 931.5 MeV per u.'],
      teach: 'A reaction’s energy release is the mass that disappears, times c².',
      explain: t`$\Delta m = 5.030151 - 5.011268 = 0.018883$ u, so $Q = 0.018883\times931.5 = ${fmt(Q_DT, 4)}$ MeV. The two products fly apart with equal and opposite momenta, so the light neutron takes ${fmt(100 * (4.002603 / 5.011268), 2)}% of the energy, about 14 MeV — which is why a fusion plant must catch fast neutrons in a thick blanket to collect its heat.`,
      visual: curve('H-3', { zoom: [0, 20, 0, 8.7], semf: false }, 'The light end of the curve: deuterium (²H) and tritium (³H) are loosely bound, helium-4 far more tightly.'),
    }),
    mcq({
      id: 'why-falls', difficulty: 3,
      prompt: 'Past iron, the binding energy per nucleon slowly falls. Why are heavy nuclei less tightly bound per nucleon?',
      choices: [
        'The electric repulsion acts between every pair of protons, so it grows roughly as Z², while the strong force binds each nucleon only to its near neighbours',
        'The strong force weakens in heavy nuclei, because their nucleons are farther apart',
        'Heavy nuclei hold extra neutrons, and neutrons weaken the binding',
        'Heavy nuclei have more surface, and nucleons at the surface are less tightly bound',
      ],
      answer: 0,
      why: {
        1: 'Nucleons are no farther apart in uranium than in iron — every nucleus has the same density. The attraction between neighbours is unchanged; what grows is the repulsion.',
        2: 'Neutrons add strong attraction with no electric repulsion: heavy nuclei could not hold together without their extra neutrons.',
        3: 'The surface explains the *rise* through the light nuclei, where many nucleons sit at the surface with fewer neighbours. That share shrinks as nuclei grow.',
      },
      hints: ['The strong force grips only near neighbours, about a femtometre apart. Which force reaches across the whole nucleus?', t`Count the pairs of protons that repel each other: a nucleus with $Z$ protons has $Z(Z-1)/2$ of them.`],
      teach: 'Past iron, the electric repulsion between all pairs of protons grows faster than the short-range strong attraction, so heavy nuclei are less tightly bound per nucleon.',
      explain: 'The strong force binds each nucleon to its near neighbours only, so its share per nucleon is roughly constant. The electric repulsion acts between every pair of protons: 325 pairs in iron, 4186 in uranium. That growing repulsion pulls the curve down past iron — and makes the heaviest nuclei unstable, splitting or shedding alpha particles.',
      visual: curve('U-238', { semf: true }, 'Measured binding energies per nucleon (dots) and the liquid-drop model (dashed), with uranium-238 marked.'),
    }),
    num({
      id: 'energy-per-kg', difficulty: 3, transfer: true,
      prompt: t`Each fission of a uranium-235 nucleus releases about 200 MeV. How much energy does fissioning 1.00 kg of uranium-235 release, in joules? (Molar mass 235.04 g/mol; $1\ \text{MeV} = 1.602\times10^{-13}$ J.)`,
      answer: U235_JKG, units: 'J', tol: { rel: 0.01 },
      errors: [{ value: Nu.NA * 1000 * PER_FISSION * MEV_J, feedback: 'Divide by the molar mass: 1.00 kg of uranium-235 is 1000/235.04 = 4.25 mol.' }],
      hints: [t`Number of nuclei: $\dfrac{1000\ \text{g}}{235.04\ \text{g/mol}}\times6.022\times10^{23}\ \text{mol}^{-1}$.`, t`Energy $=$ (number of nuclei) $\times\ 200\ \text{MeV}\times1.602\times10^{-13}$ J/MeV.`],
      teach: 'Per kilogram, fission releases about two million times the energy of burning fuel, because each reaction releases millions of times more.',
      explain: t`$N = ${tex(U235_NUCLEI_PER_KG, 3)}$ nuclei, so $E = ${tex(U235_NUCLEI_PER_KG, 3)}\times200\times1.602\times10^{-13} = ${tex(U235_JKG, 3)}$ J — about ${fmt(U235_JKG / 43e6 / 1e6, 2)} million times the 43 MJ released by burning a kilogram of kerosene.`,
      visual: energyBars({ hideU: true }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-binding', difficulty: 2,
      gen(r) {
        const name = r.pick(['Ni-62', 'Sn-120', 'Pb-208', 'U-238']);
        const n = Nu.byName[name], M = m6(name), B = Bof(name), dm = partsOf(name) - M;
        const note = { 'Ni-62': ' — the most tightly bound nucleus of all, a whisker above iron-56.', 'Sn-120': ' — down from the peak, but still more tightly bound than uranium.', 'Pb-208': ': lead-208 is the heaviest stable nucleus.', 'U-238': ': less tightly bound than the nuclei in the middle of the curve, so uranium can release energy by splitting — or by shedding alpha particles, as it slowly does.' }[name];
        return {
          prompt: t`An atom of ${NAMES[name]} has ${n.Z} protons, ${n.N} neutrons and a mass of ${M.toFixed(6)} u. Find its binding energy per nucleon, in MeV. (Use $m_{\text{H}} = 1.007825$ u, $m_n = 1.008665$ u and $1\ \text{u}\,c^2 = 931.5$ MeV.)`,
          answer: B / n.A, units: 'MeV', tol: { rel: 0.003 },
          errors: [
            { value: B, feedback: t`That is the total binding energy. Divide by the number of nucleons, $A = ${n.A}$.` },
            { value: ((n.Z * MP + n.N * MN - M) * UC2) / n.A, feedback: t`That uses the bare proton’s mass against the mass of the whole atom. Use hydrogen-atom masses, $m_{\text{H}}$, so the electrons cancel.` },
          ],
          hints: [t`Mass defect: $\Delta m = ${n.Z}\,m_{\text{H}} + ${n.N}\,m_n - M$.`, t`$B = \Delta m\times931.5$ MeV; then divide by $A = ${n.A}$.`],
          teach: 'The binding energy per nucleon, B/A, measures how tightly a nucleus is held; no nucleus reaches 8.8 MeV.',
          explain: t`$\Delta m = ${partsOf(name).toFixed(6)} - ${M.toFixed(6)} = ${dm.toFixed(6)}$ u, so $B = ${fmt(B, 5)}$ MeV and $B/A = ${fmt(B / n.A, 4)}$ MeV${note}`,
          visual: curve(name, { hide: ['B'], semf: false }, `The curve of binding energy, with ${NAMES[name]} marked.`),
        };
      },
    }),
    num({
      id: 'cp-reactor', difficulty: 3, transfer: true,
      prompt: 'A large nuclear power plant’s reactor produces 3.0 GW of heat, from which it generates about 1 GW of electricity. At 200 MeV per fission, what mass of uranium-235 does it fission each day, in kg? (Molar mass 235.04 g/mol.)',
      answer: ((3e9 * 86400) / (PER_FISSION * MEV_J) / Nu.NA) * 0.23504, units: 'kg', tol: { rel: 0.01 },
      errors: [
        { value: ((1e9 * 86400) / (PER_FISSION * MEV_J) / Nu.NA) * 0.23504, feedback: 'That uses the 1 GW of electricity. The fission makes the heat, 3.0 GW; two-thirds of it is rejected as waste heat.' },
        { value: ((3e9 * 1) / (PER_FISSION * MEV_J) / Nu.NA) * 0.23504, feedback: 'That is the mass fissioned each second. A day has 86 400 s.' },
      ],
      hints: [t`Heat per day: $3.0\times10^{9}\ \text{W}\times86\,400\ \text{s}$.`, t`Divide by $200\ \text{MeV} = 3.204\times10^{-11}$ J to count the fissions; then convert to moles and to kilograms.`],
      teach: 'At 200 MeV per fission, a reactor fissions only about a kilogram of uranium-235 per day for each gigawatt of heat.',
      explain: t`The day’s heat is $3.0\times10^{9}\times86\,400 = ${tex(3e9 * 86400, 3)}$ J, from $${tex((3e9 * 86400) / (PER_FISSION * MEV_J), 3)}$ fissions — ${fmt((3e9 * 86400) / (PER_FISSION * MEV_J) / Nu.NA, 3)} mol, or ${fmt(((3e9 * 86400) / (PER_FISSION * MEV_J) / Nu.NA) * 0.23504, 3)} kg of uranium-235. A coal plant of the same size burns about 10 000 tonnes of coal a day.`,
      visual: energyBars(),
    }),
    num({
      id: 'cp-sun', difficulty: 3, transfer: true,
      prompt: t`The Sun shines by turning hydrogen into helium. The net change, $4\,{}^{1}\text{H} \to {}^{4}\text{He}$, converts 0.712% of the hydrogen’s mass into energy, and the Sun radiates $3.83\times10^{26}$ W. How much hydrogen does it consume each second, in kg/s?`,
      answer: 3.83e26 / (C * C) / 0.00712, units: 'kg/s', tol: { rel: 0.01 },
      errors: [{ value: 3.83e26 / (C * C), feedback: 'That is the mass turned into energy each second. It is only 0.712% of the hydrogen consumed, so far more hydrogen is used.' }],
      hints: [t`Mass turned into energy each second: $P/c^2$.`, 'That is 0.712% of the hydrogen consumed: divide by 0.00712.'],
      teach: 'A star’s power divided by c² is the mass it turns into energy each second.',
      explain: t`$P/c^2 = ${tex(3.83e26 / (C * C), 3)}$ kg/s becomes energy, so the Sun consumes $${tex(3.83e26 / (C * C) / 0.00712, 3)}$ kg of hydrogen each second — about 600 million tonnes. (About 2% of the energy escapes as neutrinos rather than light, so the true rate is a little higher.) Even so, the Sun is only about halfway through its ten-billion-year life of burning hydrogen.`,
      visual: massBars({ parts: 4 * MH, whole: m6('He-4'), partsText: ['four ¹H atoms', `${(4 * MH).toFixed(5)} u`], wholeText: ['one ⁴He atom', `${m6('He-4').toFixed(5)} u`], gapText: `Δm = ${(4 * MH - m6('He-4')).toFixed(4)} u`, energyText: `= ${((4 * MH - m6('He-4')) * UC2).toFixed(1)} MeV released`, caption: 'The Sun’s net reaction: four hydrogen atoms weigh more than the helium atom they become. The mass axis starts near 3.96 u, not at zero, so the 0.71% difference can be seen.' }),
    }),
    mcq({
      id: 'cp-iron-core', difficulty: 2, transfer: true,
      prompt: 'A massive star fuses ever heavier elements in its core until the core is iron. Why does fusion stop there — leaving the core to collapse?',
      choices: [
        'Iron sits at the peak of the binding-energy curve, so fusing it into anything heavier absorbs energy instead of releasing it',
        'The core is not hot enough to fuse iron',
        'Iron has the largest total binding energy of any nucleus, so it cannot be bound any more tightly',
        'Fusing iron would release so much energy that it would blow the star apart',
      ],
      answer: 0,
      why: {
        1: 'The core is hot enough — billions of kelvin. Iron can fuse; it just takes in energy instead of giving it out, so it cannot hold the core up against gravity.',
        2: 'Uranium’s total binding energy is far larger (1802 MeV against 492 MeV). What peaks near iron is the binding energy *per nucleon*.',
        3: 'The opposite: fusing iron would absorb energy. The supernova comes after the core collapses, and is powered by the collapse.',
      },
      hints: ['Where does iron sit on the curve of binding energy, and what happens to B/A beyond it?'],
      teach: 'Past the peak near iron, fusion absorbs energy instead of releasing it — so iron is where a star’s fuel runs out.',
      explain: 'Every fusion stage from hydrogen to silicon climbs the curve and releases energy. Iron is at the top: fusing it absorbs energy, so the iron core has no fuel left to support it. It collapses in under a second, and the rebound from the collapse drives a supernova.',
      visual: curve('Fe-56', { semf: false, reactions: true }, 'The curve of binding energy, with iron-56 marked. Fusion (green) climbs from the light side, fission (orange) from the heavy side.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §10.2 Nuclear binding energy', url: 'https://openstax.org/books/university-physics-volume-3/pages/10-2-nuclear-binding-energy' },
    { label: 'The Atomic Mass Evaluation (Wang et al., AME2016 and AME2020, Chinese Physics C) — the atomic masses; the two evaluations agree to within about 2 millionths of a u (2 keV), far below the MeV binding energies computed here', url: 'https://www-nds.iaea.org/amdc/' },
    { label: 'Fewell (1995), The atomic nuclide with the highest mean binding energy, Am. J. Phys. 63, 653', url: 'https://doi.org/10.1119/1.17828' },
    { label: 'CODATA 2022 recommended values (NIST): the atomic mass unit and neutron mass', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
