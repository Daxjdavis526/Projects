// Energy in a magnetic field: building up a current in a coil takes work
// against its back emf, U = ½LI², and that energy lives in the field, at a
// density u_B = B²/2μ₀ (exactly ½LI² for a long solenoid). The magnetic twin
// of ½CV² and ½ε₀E².
import { lesson, mcq, num } from '../../src/core/content.js';
import { MU0, EPS0, tn, sf, r6, apart, acPic, solenoidPic, COL } from './_maxwell.js';

const t = String.raw;

// the worked example: the B4.1 solenoid (500 turns, 10.0 cm, 2.00 cm across) at 2.00 A
const EX = (() => {
  const N = 500, len = 0.1, A = Math.PI * 0.01 ** 2, I = 2, L = (MU0 * N * N * A) / len, B = (MU0 * N * I) / len;
  const u = (B * B) / (2 * MU0);
  return { N, len, A, I, L, B, u, U: 0.5 * L * I * I, V: A * len };
})();

/** U = ½LI² against I for a coil of inductance L (H), current axis to Imax (A), energy in J or mJ */
function energyCurve({ L, Imax, vl = [], hl = [], points = [], caption, curves = [], hideAxis = '' }) {
  const Umax = 0.5 * L * Imax * Imax, mJ = Umax < 1, f = mJ ? 1e3 : 1;
  return {
    type: 'graph',
    params: {
      x: [0, r6(Imax)], y: [0, r6(Umax * f * 1.15)], aspect: 'wide', axesAt: 'edge', xlabel: hideAxis === 'x' ? 'I' : 'I (A)', ylabel: hideAxis === 'y' ? 'U' : `U (${mJ ? 'mJ' : 'J'})`,
      ...(hideAxis === 'x' ? { xticks: 0.001 } : hideAxis === 'y' ? { yticks: 0.001 } : {}),
      curves: [{ fn: `${r6(0.5 * L * f)}*x^2`, color: COL.L, width: 2.6 }, ...curves], vlines: vl, hlines: hl, points,
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.B4.3',
  title: 'Energy in a magnetic field',
  minutes: 11, difficulty: 2,
  intro: t`Building up a current in a coil takes work: the source must push charge through the coil against its back emf, delivering power $P = (L\,dI/dt)\,I$. Adding that up as the current grows from 0 to $I$ gives the energy stored,

$$U_B = \tfrac12 LI^2, \qquad u_B = \frac{B^2}{2\mu_0}$$

That energy is not in the copper — it is in the **magnetic field**. For a long solenoid, $\tfrac12LI^2$ is exactly $B^2/2\mu_0$ times the volume inside, and the **energy density** $u_B = B^2/2\mu_0$ holds wherever there is a field: in a motor’s air gap, in an MRI scanner, in Earth’s magnetosphere. It is the magnetic twin of a capacitor’s $\tfrac12CV^2$ and $\tfrac12\varepsilon_0E^2$.`,
  symbols: [
    { tex: 'U_B', text: 'the energy stored in the coil’s magnetic field, in joules (J)' },
    { tex: 'L', text: 'the inductance, in henries (H)' },
    { tex: 'I', text: 'the current through the coil, in amperes (A)' },
    { tex: 'u_B', text: 'the magnetic energy density — energy per volume of space — in joules per cubic metre (J/m³)' },
    { tex: 'B', text: 'the magnetic field strength at that point, in tesla (T)' },
    { tex: t`\mu_0`, text: t`the permeability of free space, $4\pi\times10^{-7}$ T·m/A` },
  ],
  why: 'Fields carry energy of their own. That is what makes light possible: an electromagnetic wave is energy moving between electric and magnetic fields with no wires at all.',
  visual: {
    type: 'em-ac',
    title: 'Where the battery’s work goes',
    lead: t`The same RL circuit, now with its energy bookkeeping. The lower graph adds up, from the moment the switch closes, the battery’s work, the heat in the resistor and the energy stored in the coil, $\tfrac12Li^2$. The battery’s work is always the other two together.`,
    tasks: [
      'At first most of the battery’s work goes into the field; later, almost all of it becomes heat.',
      'Once the current is steady, the stored energy stops growing — the field is full.',
      'Double ℰ: the final current doubles and the stored energy quadruples.',
      'Flip the switch to the short: the stored energy drains into the resistor as heat.',
    ],
    params: { mode: 'rl', E: 12, R: 4, L: 0.2, panel: 'energy' },
  },
  example: {
    prompt: t`The solenoid of the previous lesson — 500 turns, 10.0 cm long, 2.00 cm in diameter, $L = 0.987$ mH — carries 2.00 A. Find the energy stored (a) from $\tfrac12LI^2$, and (b) from the energy density of the field inside it. ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
    visual: solenoidPic({ len: '10.0 cm', d: '2.00 cm', N: '500 turns', field: true, current: '2.00 A', caption: 'The solenoid and the field inside it (teal), not to scale. Outside a long solenoid the field is weak, so almost all the energy is inside.' }),
    steps: [
      { label: 'Power into the coil', text: t`To keep the current rising the source must supply the coil’s voltage $L\,dI/dt$ while the current $I$ flows: $P = LI\,\dfrac{dI}{dt}$.` },
      { label: 'Add it up', text: t`$U = \displaystyle\int P\,dt = \int_0^I LI'\,dI' = \tfrac12LI^2$. No heat is involved: an ideal coil gives the energy back when the current falls.` },
      { label: '(a) From the inductance', text: t`$U = \tfrac12(${tn(EX.L)}\ \text{H})(2.00\ \text{A})^2 = ${tn(EX.U)}$ J $= ${tn(EX.U * 1e3)}$ mJ.` },
      { label: 'The field inside', text: t`$B = \mu_0NI/\ell = (4\pi\times10^{-7})(500)(2.00)/0.100 = ${tn(EX.B)}$ T, so $u_B = \dfrac{B^2}{2\mu_0} = \dfrac{(${tn(EX.B)})^2}{2(4\pi\times10^{-7})} = ${tn(EX.u)}\ \text{J/m}^3$.` },
      { label: '(b) From the field', text: t`The volume inside is $A\ell = (${tn(EX.A)}\ \text{m}^2)(0.100\ \text{m}) = ${tn(EX.V)}\ \text{m}^3$, so $U = u_BA\ell = ${tn(EX.u * EX.V)}$ J — the same.` },
      { label: 'Why they agree', text: t`Put $L = \mu_0N^2A/\ell$ and $B = \mu_0NI/\ell$ into $\tfrac12LI^2$: it becomes $\dfrac{B^2}{2\mu_0}A\ell$ exactly. The energy “in the inductor” is energy in its field.` },
    ],
    answer: t`$U = ${tn(EX.U * 1e3)}$ mJ either way; the field inside holds $${tn(EX.u)}\ \text{J/m}^3$.`,
  },
  practice: [
    num({
      id: 'half-LI2', difficulty: 1,
      gen(r) {
        const L = r.pick([0.05, 0.2, 0.5, 1.5]), I = r.pick([0.8, 2.0, 3.5, 6.0]);
        const U = 0.5 * L * I * I;
        return {
          prompt: t`How much energy is stored in a ${L} H coil carrying ${I} A?`,
          visual: energyCurve({ L, Imax: 7, hideAxis: 'y', vl: [{ x: I, color: 'violet', label: `${I} A` }], caption: t`Stored energy against current for this coil: a parabola, $U \propto I^2$ (the energy axis is left unnumbered). The violet line marks ${I} A.` }),
          answer: U, units: 'J', tol: { rel: 0.005 },
          errors: apart([{ value: L * I * I, feedback: t`Missing the $\tfrac12$: $U = \tfrac12LI^2$, because the coil’s voltage grows from zero as the current builds.` }, { value: 0.5 * L * I, feedback: t`The current is squared: $U = \tfrac12LI^2$.` }], U),
          hints: [t`$U_B = \tfrac12LI^2$.`],
          teach: t`A coil carrying current $I$ stores $U_B = \tfrac12LI^2$ in its magnetic field.`,
          explain: t`$U = \tfrac12(${L}\ \text{H})(${I}\ \text{A})^2 = ${tn(U)}$ J.`,
        };
      },
    }),
    num({
      id: 'current-for-energy', difficulty: 2,
      gen(r) {
        const LmH = r.pick([10, 25, 80, 150]), UmJ = r.pick([20, 50, 200, 500]);
        const L = LmH * 1e-3, U = UmJ * 1e-3, I = Math.sqrt((2 * U) / L);
        return {
          prompt: t`What current must flow through a ${LmH} mH coil for it to store ${UmJ} mJ?`,
          visual: energyCurve({ L, Imax: r6(I * 1.6), hideAxis: 'x', hl: [{ y: UmJ, color: 'violet', label: `${UmJ} mJ` }], caption: t`Stored energy against current for this coil (the current axis is left unnumbered); the violet line is the energy wanted.` }),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: Math.sqrt(U / L), feedback: t`Keep the factor 2: $I = \sqrt{2U/L}$.` }, { value: (2 * U) / L, feedback: t`Take the square root: $\tfrac12LI^2 = U$ gives $I^2 = 2U/L$.` }], I),
          hints: [t`Solve $\tfrac12LI^2 = U$ for $I$.`, t`$I = \sqrt{2U/L}$ with $U$ in joules and $L$ in henries.`],
          teach: t`Since $U = \tfrac12LI^2$, the current needed for an energy $U$ is $I = \sqrt{2U/L}$.`,
          explain: t`$I = \sqrt{\dfrac{2(${UmJ}\times10^{-3}\ \text{J})}{${LmH}\times10^{-3}\ \text{H}}} = ${tn(I)}$ A.`,
        };
      },
    }),
    num({
      id: 'energy-density', difficulty: 1,
      gen(r) {
        const [B, Bt, what] = r.pick([[0.5, '0.50', 'between the poles of a lab electromagnet'], [1.5, '1.5', 'inside a 1.5 T hospital MRI scanner'], [3.0, '3.0', 'inside a 3.0 T research MRI scanner'], [0.05, '0.050', 'near the face of a strong neodymium magnet']]);
        const u = (B * B) / (2 * MU0);
        return {
          prompt: t`What is the magnetic energy density where the field is ${Bt} T (${what})? ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          visual: { type: 'graph', params: { x: [0, 3.5], y: [0, 5], aspect: 'wide', axesAt: 'edge', xlabel: 'B (T)', ylabel: 'energy density u', yticks: 0.001, curves: [{ fn: `x^2/(2*${r6(MU0)})/1e6`, color: COL.B, width: 2.6 }], vlines: [{ x: B, color: 'violet', label: `${Bt} T` }] }, caption: t`The energy density of a magnetic field rises as $B^2$ (the energy axis is left unnumbered). The violet line marks ${Bt} T.` },
          answer: u, units: 'J/m^3', tol: { rel: 0.01 },
          errors: apart([{ value: (B * B) / MU0, feedback: t`Keep the 2 in the denominator: $u_B = B^2/2\mu_0$.` }, { value: B / (2 * MU0), feedback: t`Square the field: $u_B = B^2/2\mu_0$.` }], u),
          hints: [t`$u_B = B^2/2\mu_0$ with $B$ in tesla.`],
          teach: t`A magnetic field stores energy at $u_B = B^2/2\mu_0$ joules per cubic metre.`,
          explain: t`$u_B = \dfrac{(${Bt})^2}{2(4\pi\times10^{-7})} = ${tn(u)}\ \text{J/m}^3$.`,
        };
      },
    }),
    mcq({
      id: 'doubling', difficulty: 1,
      prompt: t`The current through a coil is doubled. The energy stored in its field:`,
      visual: energyCurve({ L: 0.5, Imax: 4.5, points: [{ x: 1.5, y: r6(0.5 * 0.5 * 2.25), color: 'gold', label: 'I', labelDx: -14, labelDy: -12 }], vl: [{ x: 3, color: 'violet', label: '2I' }], caption: t`Stored energy against current: a parabola, $U = \tfrac12LI^2$.` }),
      choices: ['Becomes 4 times as large', 'Doubles', 'Stays the same, since L has not changed', 'Becomes 8 times as large'],
      answer: 0,
      why: {
        1: t`The energy goes as $I^2$, not $I$ — the coil’s opposing voltage is larger all the way up, so the work grows faster than the current.`,
        2: t`$L$ is fixed, but $U = \tfrac12LI^2$ depends on the current too.`,
        3: 'Cubing would need U ∝ I³; it goes as I².',
      },
      hints: [t`$U = \tfrac12LI^2$: what does doubling $I$ do to $I^2$?`],
      teach: 'Stored magnetic energy grows as the square of the current.',
      explain: t`$U' = \tfrac12L(2I)^2 = 4\cdot\tfrac12LI^2$. Equivalently, the field $B$ doubles and the energy density $B^2/2\mu_0$ quadruples everywhere.`,
    }),
    mcq({
      id: 'where-energy-goes', difficulty: 2,
      prompt: t`A steady current flows in the circuit shown. The switch is then moved to the short, cutting the battery out. The coil’s current dies away. Where does the energy that was stored in the coil end up?`,
      visual: acPic({ mode: 'rl', on: false, E: 12, R: 4, L: 0.2, graphs: [], t: 0, hide: ['i', 'emf'] }, 'The switch has just moved to the short: the coil and the resistor form a loop on their own.'),
      choices: ['As heat in the resistor', 'Back in the battery', 'It stays in the coil, which keeps its current for ever', 'It disappears: an ideal coil has no resistance, so no energy can be lost'],
      answer: 0,
      why: {
        1: 'The battery is no longer in the loop, so nothing can flow back into it.',
        2: 'The current does die away — the resistor turns it into heat, and the field shrinks with it. Only a superconducting loop with no resistance keeps its current.',
        3: 'Energy is conserved: the coil itself loses none, but the resistor in the same loop does.',
      },
      hints: ['Which element in the remaining loop turns electrical energy into something else?', t`The coil drives the current through $R$, which dissipates $I^2R$ until the stored $\tfrac12LI_0^2$ is used up.`],
      teach: 'When a coil’s current dies away through a resistor, the energy of its field becomes heat in the resistor.',
      explain: t`The coil drives the decaying current through $R$; $\int_0^\infty I^2R\,dt = \int_0^\infty I_0^2Re^{-2t/\tau}dt = \tfrac12I_0^2R\tau = \tfrac12LI_0^2$ — all of the stored energy, exactly.`,
    }),
    num({
      id: 'solenoid-energy', difficulty: 2,
      gen(r) {
        const N = r.pick([400, 800, 1200]), lcm = r.pick([20, 30, 40]), dcm = r.pick([3, 4, 6]), I = r.pick([1.5, 3.0, 5.0]);
        const len = lcm / 100, A = Math.PI * (dcm / 200) ** 2, B = (MU0 * N * I) / len, U = ((B * B) / (2 * MU0)) * A * len;
        return {
          prompt: t`A solenoid ${lcm} cm long and ${dcm} cm in diameter has ${N} turns and carries ${I} A. How much energy is stored in the field inside it? ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          visual: solenoidPic({ len: `${lcm} cm`, d: `${dcm} cm`, N: `${N} turns`, field: true, current: `${I} A` }),
          answer: U * 1e3, units: 'mJ', tol: { rel: 0.01 },
          errors: apart([{ value: (((B * B) / MU0) * A * len) * 1e3, feedback: t`The energy density is $B^2/2\mu_0$ — the 2 is missing.` }, { value: ((B * B) / (2 * MU0)) * Math.PI * (dcm / 100) ** 2 * len * 1e3, feedback: 'The diameter went in as the radius: the area is π(d/2)².' }], U * 1e3),
          hints: [t`Either find $L = \mu_0N^2A/\ell$ and use $\tfrac12LI^2$, or find $B = \mu_0NI/\ell$ and multiply $B^2/2\mu_0$ by the volume $A\ell$.`, t`$B = ${tn(B)}$ T and $A\ell = ${tn(A * len)}\ \text{m}^3$.`],
          teach: t`The energy of a solenoid can be found as $\tfrac12LI^2$ or as $(B^2/2\mu_0)\times A\ell$ — the same number, because the energy is in the field.`,
          explain: t`$B = \mu_0NI/\ell = ${tn(B)}$ T, $u_B = ${tn((B * B) / (2 * MU0))}\ \text{J/m}^3$, volume $A\ell = ${tn(A * len)}\ \text{m}^3$: $\;U = ${tn(U)}$ J $= ${tn(U * 1e3)}$ mJ.`,
        };
      },
    }),
    num({
      id: 'compare-E-B', difficulty: 3,
      gen(r) {
        const B = r.pick([0.5, 1.0, 1.5]);
        const uB = (B * B) / (2 * MU0), uE = 0.5 * EPS0 * 3e6 ** 2, ratio = uB / uE;
        return {
          prompt: t`Air breaks down — sparks — at an electric field of about $3.0\times10^6$ V/m, which caps the energy density an electric field in air can hold. Compare a ${B} T magnetic field, easily made with an electromagnet. How many times larger is the magnetic energy density? ($\varepsilon_0 = 8.854\times10^{-12}$ F/m, $\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          answer: ratio, tol: { rel: 0.01 },
          errors: apart([{ value: (B * B / MU0) / uE, feedback: t`The magnetic density is $B^2/2\mu_0$ — with the 2.` }, { value: uB / (EPS0 * 3e6 ** 2), feedback: t`The electric density is $\tfrac12\varepsilon_0E^2$ — with the ½.` }], ratio),
          hints: [t`$u_E = \tfrac12\varepsilon_0E^2$ and $u_B = B^2/2\mu_0$.`, t`$u_E = \tfrac12(8.854\times10^{-12})(3.0\times10^6)^2 = ${tn(uE)}\ \text{J/m}^3$.`],
          teach: 'An ordinary magnetic field stores thousands of times more energy per volume than the strongest electric field air can hold — which is why motors push with magnetic fields.',
          explain: t`$u_B = \dfrac{(${B})^2}{2(4\pi\times10^{-7})} = ${tn(uB)}\ \text{J/m}^3$ and $u_E = ${tn(uE)}\ \text{J/m}^3$, a ratio of about $${tn(ratio, 2)}$. That is why electric motors and generators work through magnetic fields in their air gaps rather than electric ones.`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`To find the energy stored in a long solenoid, a student computes $B^2/2\mu_0$ for the field inside and multiplies it by the volume of copper in the winding. What is wrong?`,
      visual: solenoidPic({ len: 'ℓ', d: 'd', N: 'N turns', raw: true, field: true, caption: 'A long solenoid and the field inside it (teal). Not to scale.' }),
      choices: [
        t`The energy is in the field, which fills the space inside the coil: multiply by the enclosed volume $A\ell$, not the copper’s volume`,
        t`The energy density should be $B^2\mu_0/2$`,
        'Nothing: the energy of a coil is stored in its wire',
        t`The volume should be the copper’s, but $B$ should be the field in the copper, which is zero`,
      ],
      answer: 0,
      why: {
        1: t`Check the units: $B^2/\mu_0$ is $\text{T}^2/(\text{T·m/A}) = \text{T·A/m} = \text{J/m}^3$. $B^2\mu_0$ is not an energy density.`,
        2: 'The wire only carries the current. The stored energy is spread through the space where the field is — mostly the space inside the coil.',
        3: 'The energy is not in the copper at all, so neither the copper’s volume nor the field inside it is the right thing to use.',
      },
      hints: ['Where is the field B that the energy density describes?', t`Check against $\tfrac12LI^2$ with $L = \mu_0N^2A/\ell$: which volume appears?`],
      teach: 'Magnetic energy is stored in the field, so integrate B²/2μ₀ over the space the field fills — for a long solenoid, its inside.',
      explain: t`$\tfrac12LI^2 = \tfrac12\dfrac{\mu_0N^2A}{\ell}I^2 = \dfrac{B^2}{2\mu_0}\,A\ell$ with $B = \mu_0NI/\ell$: the volume that appears is the enclosed volume $A\ell$. The copper is a small fraction of that and holds almost none of the energy.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-energy', difficulty: 2,
      gen(r) {
        const LmH = r.pick([5, 12, 40, 75]), I = r.pick([2.5, 4.0, 8.0, 12]);
        const U = 0.5 * LmH * 1e-3 * I * I;
        return {
          prompt: t`A ${LmH} mH coil carries ${I} A. How much energy does its field hold?`,
          visual: energyCurve({ L: LmH * 1e-3, Imax: 14, hideAxis: 'y', vl: [{ x: I, color: 'violet', label: `${I} A` }], caption: t`Stored energy against current for this coil (energy axis unnumbered); the violet line marks ${I} A.` }),
          answer: U, units: 'J', tol: { rel: 0.01 },
          hints: [t`$U = \tfrac12LI^2$ with $L$ in henries.`],
          teach: t`$U_B = \tfrac12LI^2$.`,
          explain: t`$U = \tfrac12(${LmH}\times10^{-3})(${I})^2 = ${tn(U)}$ J.`,
        };
      },
    }),
    mcq({
      id: 'cp-ratio', difficulty: 2,
      prompt: t`Coil 1 has inductance $L$ and carries current $2I$. Coil 2 has inductance $2L$ and carries current $I$. Compare the energies they store.`,
      visual: { type: 'graph', params: { x: [0, 2.4], y: [0, 3.3], aspect: 'wide', axesAt: 'edge', xlabel: 'current (in units of I)', ylabel: 'U (units of LI²)', curves: [{ fn: '0.5*x^2', color: 'teal', width: 2.6, label: 'inductance L', labelAt: 2.2, labelDx: -96, labelDy: -4 }, { fn: 'x^2', color: 'violet', width: 2.6, label: 'inductance 2L', labelAt: 1.62, labelDx: -104, labelDy: -6 }] }, caption: t`Stored energy against current for an inductance $L$ (teal) and $2L$ (violet): each a parabola, $\tfrac12LI^2$.` },
      choices: ['Coil 1 stores twice as much as coil 2', 'They store the same', 'Coil 2 stores twice as much as coil 1', 'Coil 1 stores four times as much as coil 2'],
      answer: 0,
      why: {
        1: t`The current is squared but the inductance is not: doubling $I$ helps more than doubling $L$.`,
        2: t`$U_2 = \tfrac12(2L)I^2 = LI^2$ is less than $U_1 = \tfrac12L(2I)^2 = 2LI^2$.`,
        3: t`$U_1 = 2LI^2$ and $U_2 = LI^2$: the ratio is 2, not 4.`,
      },
      hints: [t`Write $U = \tfrac12LI^2$ for each coil.`],
      teach: 'Stored energy is linear in L but quadratic in I.',
      explain: t`$U_1 = \tfrac12L(2I)^2 = 2LI^2$; $U_2 = \tfrac12(2L)I^2 = LI^2$. Coil 1 holds twice as much.`,
    }),
    num({
      id: 'cp-mri', difficulty: 3, transfer: true,
      gen(r) {
        const [B, Bt] = r.pick([[1.5, '1.5'], [3.0, '3.0']]), D = r.pick([0.6, 0.7]), len = r.pick([1.5, 1.6]);
        const u = (B * B) / (2 * MU0), V = Math.PI * (D / 2) ** 2 * len, U = u * V;
        return {
          prompt: t`A hospital MRI scanner holds a ${Bt} T field inside its bore. Treat the bore as a cylinder ${D.toFixed(2)} m across and ${len} m long, filled with that uniform field. Roughly how much energy is stored in the field inside the bore? Give megajoules. ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          visual: solenoidPic({ len: `${len} m`, d: `${D.toFixed(2)} m`, N: null, field: true, caption: 'The scanner’s magnet drawn as a solenoid, not to scale. A real magnet’s superconducting windings wrap around the bore, and the field is less uniform near its ends.' }),
          answer: U / 1e6, units: 'MJ', tol: { rel: 0.02 },
          errors: apart([{ value: ((B * B) / MU0) * V / 1e6, feedback: t`$u_B = B^2/2\mu_0$ — the 2 is missing.` }, { value: u * Math.PI * D * D * len / 1e6, feedback: 'The bore’s radius is half the diameter: V = π(D/2)²ℓ.' }], U / 1e6),
          hints: [t`Energy density times volume: $U = \dfrac{B^2}{2\mu_0}\,\pi\left(\dfrac{D}{2}\right)^2\ell$.`, t`$u_B = ${tn(u)}\ \text{J/m}^3$ and $V = ${tn(V)}\ \text{m}^3$.`],
          teach: 'Energy density times volume estimates the energy in a field — here, a large fraction of a megajoule or more inside an MRI bore.',
          explain: t`$u_B = \dfrac{(${Bt})^2}{2(4\pi\times10^{-7})} = ${tn(u)}\ \text{J/m}^3$, $V = \pi(${D / 2})^2(${len}) = ${tn(V)}\ \text{m}^3$: $\;U \approx ${tn(U / 1e6, 2)}$ MJ. The whole magnet stores more, because its field also fills the windings and the space around them: clinical magnets store energies of the order of megajoules, which is why a “quench” — the winding losing superconductivity — boils off liquid helium so violently.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §14.3 Energy in a magnetic field', url: 'https://openstax.org/books/university-physics-volume-2/pages/14-3-energy-in-a-magnetic-field' },
  ],
});
