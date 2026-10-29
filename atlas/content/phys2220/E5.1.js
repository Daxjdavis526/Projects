// Capacitors and capacitance: Q = CV, and C = ε₀A/d for parallel plates.
// The charge held is proportional to the voltage; the constant is set by the
// geometry alone. Charge never crosses the gap, and a charged capacitor is
// neutral overall.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, sf, apart, circuit, plates, fringe, qvGraph, capOnGraph, label } from './_circuits.js';

const t = String.raw;

export default lesson({
  id: 'phys2220.E5.1',
  title: 'Capacitors and capacitance',
  minutes: 10, difficulty: 2,
  intro: t`A **capacitor** is two conductors separated by an insulator. Connect it to a battery and the battery pumps charge from one conductor to the other — electrons are pulled off one plate and pushed onto the other — until the voltage between the plates matches the battery’s. The charge it then holds is **proportional to the voltage**, and the constant of proportionality, the **capacitance**, depends only on the shape, the size and the insulator — not on the charge or the voltage. For two flat plates of area $A$ a small distance $d$ apart, Gauss’s law gives it in one line.`,
  equation: t`C = \frac{Q}{V} = \frac{\varepsilon_0 A}{d}`,
  symbols: [
    { tex: 'C', text: 'the capacitance: charge held per volt, in farads (1 F = 1 C/V). Real parts run from picofarads (pF, $10^{-12}$ F) to millifarads' },
    { tex: 'Q', text: 'the charge on the positive plate, in coulombs; the other plate holds $-Q$, so the capacitor as a whole is neutral' },
    { tex: 'V', text: 'the potential difference between the plates, in volts' },
    { tex: '\\varepsilon_0', text: 'the permittivity of free space, $8.854\\times10^{-12}$ F/m (the same constant as in Coulomb’s law, $k = 1/4\\pi\\varepsilon_0$)' },
    { tex: 'A', text: 'the area of one plate’s face, in m²' },
    { tex: 'd', text: 'the gap between the plates, in m — small compared with the plates, so the field between them is uniform' },
  ],
  why: t`Every pair of conductors has a capacitance — two plates, a coaxial cable, you and the floor — and $Q = CV$ says how much charge it holds at a given voltage. Capacitors store the energy in camera flashes and pyrotechnic firing units, and they set the timing of every RC circuit.`,
  visual: {
    type: 'em-capacitor',
    title: 'Plates, a gap and a battery',
    lead: t`Two plates seen edge-on, wired to a battery. The marks show how densely the charge sits on each plate; the violet lines are the field between them. Watch the charge $Q$ and the capacitance $C$ in the readout as you change things.`,
    tasks: [
      'Double the plate area: C and Q double, while the charge per area and the field stay put.',
      'Halve the gap: C doubles, and so does the field E = V/d.',
      'Double the battery’s voltage: Q doubles but C does not change — it belongs to the geometry.',
    ],
    params: { A: 0.01, d: 2e-3, V: 12, f: 0, controls: ['A', 'd', 'V'], readouts: ['C', 'Q', 'V', 'E'] },
  },
  example: {
    prompt: t`Two square metal plates 10.0 cm on a side face each other 1.00 mm apart in vacuum, and are connected to a 12.0 V battery. Find the capacitance, the charge on each plate and the field between them.`,
    visual: plates({ A: 0.01, d: 1e-3, V: 12 }, 'The plates edge-on, with the battery connected. The gap is drawn far wider than to scale: real plates 10 cm wide and 1 mm apart look like two sheets of paper almost touching.'),
    steps: [
      { label: 'Field from the charge', text: t`Charge $Q$ spread over area $A$ has density $\sigma = Q/A$. Between two oppositely charged plates, Gauss’s law gives a uniform field $E = \sigma/\varepsilon_0$ (each plate contributes $\sigma/2\varepsilon_0$; between them the two add, outside they cancel).` },
      { label: 'Voltage from the field', text: t`A uniform field over the gap gives $V = Ed = \dfrac{Qd}{\varepsilon_0 A}$. So $Q/V = \varepsilon_0 A/d$: the charge is proportional to the voltage, and the ratio is fixed by the geometry.` },
      { label: 'Capacitance', text: t`$A = (0.100\ \text{m})^2 = 0.0100\ \text{m}^2$, $d = 1.00\times10^{-3}$ m: $\;C = \dfrac{(8.854\times10^{-12})(0.0100)}{1.00\times10^{-3}} = 8.85\times10^{-11}\ \text{F} = 88.5\ \text{pF}$.` },
      { label: 'Charge', text: t`$Q = CV = (88.5\times10^{-12}\ \text{F})(12.0\ \text{V}) = 1.06\times10^{-9}\ \text{C} = 1.06$ nC on the positive plate, $-1.06$ nC on the other.` },
      { label: 'Field', text: t`$E = V/d = 12.0\ \text{V}/1.00\times10^{-3}\ \text{m} = 1.20\times10^{4}$ V/m. Check: $\sigma/\varepsilon_0 = (1.06\times10^{-9}/0.0100)/8.854\times10^{-12} = 1.20\times10^4$ V/m. ✓` },
      { label: 'Sense check', text: t`Picofarads: a farad is enormous. For 1 F with a 1 mm gap you would need $A = Cd/\varepsilon_0 = 1.1\times10^8$ m² — plates more than 10 km on a side.` },
    ],
    answer: t`$C = 88.5$ pF, $Q = \pm1.06$ nC, $E = 1.20\times10^4$ V/m.`,
  },
  practice: [
    num({
      id: 'q-cv', difficulty: 1,
      gen(r) {
        const C = r.pick([10, 22, 47, 100, 220, 470]), V = r.pick([1.5, 3, 5, 9, 12, 24]);
        const Q = C * V;      // µC
        return {
          prompt: t`A ${C} µF capacitor is charged through a resistor from a ${V} V battery until the current stops. How much charge is on its positive plate?`,
          answer: Q, units: 'µC', tol: { rel: 0.005 },
          errors: [
            { value: C / V, feedback: t`Divided instead of multiplied: $Q = CV$.` },
            { value: V / C, feedback: t`That is $V/C$. The charge is $Q = CV$.` },
          ],
          hints: [t`When the current has stopped, the capacitor’s voltage equals the battery’s. Then $Q = CV$; µF × V gives µC.`],
          teach: t`A capacitor holds charge in proportion to its voltage: $Q = CV$.`,
          explain: t`$Q = CV = (${C}\ \mu\text{F})(${V}\ \text{V}) = ${nice(Q)}\ \mu\text{C}$. The negative plate holds $-${nice(Q)}\ \mu$C: the capacitor as a whole stays neutral.`,
          visual: circuit('rc', { opts: { net: 'single' }, values: { E: V, C: C * 1e-6, R: 1000 }, t: 10 * 1000 * C * 1e-6, caption: 'The capacitor long after the switch was closed: no current flows any more, so there is no voltage across the resistor and the capacitor has the battery’s full voltage.' }),
        };
      },
    }),
    num({
      id: 'geometry', difficulty: 2,
      gen(r) {
        const A = r.pick([20, 50, 100, 150, 250]), d = r.pick([0.5, 1, 1.5, 2]);   // cm², mm
        const C = (EPS0 * A * 1e-4) / (d * 1e-3);        // F
        return {
          prompt: t`Two parallel plates, each of area ${A} cm², face each other ${d} mm apart in vacuum. What is their capacitance?`,
          answer: C * 1e12, units: 'pF', tol: { rel: 0.01 },
          errors: apart([{ value: (EPS0 * A) / d * 1e12, feedback: t`Convert first: 1 cm² is $10^{-4}$ m² and 1 mm is $10^{-3}$ m.` }, { value: (EPS0 * d * 1e-3) / (A * 1e-4) * 1e12, feedback: t`Upside down: area on top, gap below — bigger plates hold more, a wider gap less.` }], C * 1e12),
          hints: [t`$C = \varepsilon_0 A/d$ with $A$ in m² and $d$ in m.`, t`$A = ${A}\times10^{-4}$ m², $d = ${d}\times10^{-3}$ m, $\varepsilon_0 = 8.854\times10^{-12}$ F/m.`],
          teach: t`Parallel plates have $C = \varepsilon_0 A/d$: proportional to the area, inversely proportional to the gap.`,
          explain: t`$C = \dfrac{(8.854\times10^{-12})(${A}\times10^{-4})}{${d}\times10^{-3}} = ${tex(C)}\ \text{F} = ${nice(sf(C * 1e12))}$ pF.`,
          visual: plates({ A: A * 1e-4, d: d * 1e-3, V: 12, hide: ['Q'] }, 'The plates edge-on; the gap is drawn far wider than to scale.'),
        };
      },
    }),
    mcq({
      id: 'c-fixed', difficulty: 2,
      prompt: t`A capacitor connected to a 6.0 V battery holds 30 µC. It is moved to a 12 V battery. What happens to its capacitance?`,
      choices: ['It stays 5.0 µF; the charge doubles to 60 µC', 'It doubles to 10 µF', 'It halves to 2.5 µF', 'It quadruples to 20 µF'],
      answer: 0,
      why: {
        1: t`$C = Q/V$ is a ratio, not a recipe: doubling $V$ doubles $Q$ too, so the ratio does not change.`,
        2: t`That holds $Q$ at 30 µC and doubles $V$ — but the battery pushes more charge on until $Q = CV$ again.`,
        3: t`Nothing about the plates or the gap changed, so nothing can quadruple $C$.`,
      },
      hints: ['What is C made of? Which of those things changed?', t`$C = \varepsilon_0 A/d$ for plates: geometry only.`],
      teach: t`Capacitance is set by geometry and material; the charge adjusts to the voltage as $Q = CV$.`,
      explain: t`$C = 30\ \mu\text{C}/6.0\ \text{V} = 5.0\ \mu$F, and it stays 5.0 µF: on 12 V the plates take $Q = (5.0\ \mu\text{F})(12\ \text{V}) = 60\ \mu$C. On the graph of $Q$ against $V$ the capacitor is one straight line through the origin; its slope is $C$.`,
      visual: qvGraph({ C: 5e-6, Vmax: 14, points: [{ x: 6, y: 30, label: '6 V: 30 µC', color: 'accent2' }, { x: 12, y: 60, label: '12 V', color: 'gold', labelDx: -46 }], caption: 'Charge against voltage for this capacitor: one straight line through the origin. Its slope is the capacitance.' }),
    }),
    mcq({
      id: 'no-crossing', difficulty: 2,
      prompt: t`While a capacitor charges, a current flows in the wires on both sides of it. Where does the charge that arrives on the negative plate come from?`,
      choices: [
        'From the wire on its own side: electrons are pushed onto it from the battery’s negative terminal, while the same number leave the positive plate',
        'From the positive plate: electrons jump across the gap',
        'From the insulator between the plates',
        'From the battery, which makes new charge as the plates fill up',
      ],
      answer: 0,
      why: {
        1: 'No charge crosses the gap: it is an insulator. The current stops at one plate and starts again from the other.',
        2: 'The insulator’s own charges stay put (they can shift slightly, as you will see with dielectrics), but they do not travel to the plates.',
        3: 'Charge is conserved: the battery only moves charge that is already in the wires and plates.',
      },
      hints: ['Watch the moving charges: do any of them cross between the plates?', 'Every plate is fed by its own wire.'],
      teach: 'No charge crosses a capacitor’s gap: one plate loses electrons through its wire as the other gains them through its own.',
      explain: t`The battery pulls electrons off the top plate through the top wire and pushes the same number onto the bottom plate through the bottom wire. The current is the same on both sides at every instant, but nothing crosses the gap — only the field between the plates grows.`,
      visual: circuit('rc', { opts: { net: 'single' }, values: { E: 12, R: 1000, C: 1e-3 }, flow: true, caption: 'A capacitor charging, slowed down enormously. Dots are charge carriers moving at a speed proportional to the current (real drift speeds are far slower). None cross the gap between the plates.' }),
    }),
    mcq({
      id: 'scaling', difficulty: 2,
      prompt: t`A parallel-plate capacitor stays connected to the same battery while its plate area is doubled and its gap halved. By what factor does the charge on it change?`,
      choices: ['×4', '×1 (the changes cancel)', '×2', '×¼'],
      answer: 0,
      why: {
        1: t`Both changes raise $C$: more area holds more charge, and a smaller gap does too. They multiply, they do not cancel.`,
        2: 'Each change alone doubles C; together they double it twice.',
        3: t`Upside down: $C = \varepsilon_0 A/d$ grows with $A$ and shrinks with $d$.`,
      },
      hints: [t`$C = \varepsilon_0 A/d$: what happens to $A/d$?`, 'With the battery connected, V is fixed, so Q = CV follows C.'],
      teach: t`$C \propto A/d$, and on a battery $Q = CV$ follows $C$.`,
      explain: t`$C' = \varepsilon_0 (2A)/(d/2) = 4\,\varepsilon_0 A/d = 4C$. The battery keeps $V$ the same, so $Q' = 4Q$.`,
      visual: (() => {
        const a = capOnGraph(-2.3, 0, 2, 1.3, 4), b = capOnGraph(2.2, 0, 2.83, 0.65, 6);
        return {
          type: 'graph',
          params: { x: [-4.4, 4.4], y: [-1.45, 1.45], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', alt: 'A capacitor before and after: twice the plate area, half the gap',
            curves: [...a.curves, ...b.curves],
            points: [...a.points, ...b.points, label(-2.3, -1.25, 'area A, gap d', 'ink2', -40, 0), label(2.2, -1.25, 'area 2A, gap d/2', 'ink2', -48, 0)] },
          caption: 'Before and after, edge-on, both on the same battery. Plate lengths are drawn as for square plates (√2 longer for twice the area); the charge marks are schematic.',
        };
      })(),
    }),
    num({
      id: 'v-from-q', difficulty: 2,
      gen(r) {
        const Q = r.pick([2, 3.5, 5, 8]), A = r.pick([100, 200, 400]), d = r.pick([1, 1.5, 2.5]);   // nC, cm², mm
        const V = (Q * 1e-9 * d * 1e-3) / (EPS0 * A * 1e-4);
        return {
          prompt: t`Two parallel plates of area ${A} cm², ${d} mm apart in vacuum, carry charges $+${Q}$ nC and $-${Q}$ nC. What is the potential difference between them?`,
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: (Q * 1e-9) / (EPS0 * A * 1e-4), feedback: t`That is the field $E = \sigma/\varepsilon_0$ in V/m. Multiply by the gap to get the voltage.` }],
          hints: [t`Find the field first: $E = \sigma/\varepsilon_0$ with $\sigma = Q/A$.`, t`Then $V = Ed$ — or in one step, $V = Q/C$ with $C = \varepsilon_0 A/d$.`],
          teach: t`Between parallel plates the field is uniform, $E = Q/(\varepsilon_0 A)$, so $V = Ed = Qd/(\varepsilon_0 A)$.`,
          explain: t`$E = \dfrac{${Q}\times10^{-9}}{(8.854\times10^{-12})(${A}\times10^{-4})} = ${tex((Q * 1e-9) / (EPS0 * A * 1e-4))}$ V/m, and $V = Ed = ${nice(sf(V))}$ V.`,
          visual: fringe({ caption: 'Two oppositely charged plates in cross-section. Between them the field is uniform; at the edges it fringes. The formula ignores the fringe, which is good when the gap is much smaller than the plates.' }),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student finds the capacitance of plates 5.0 cm × 5.0 cm, 0.50 mm apart, in vacuum:

$$C = \frac{\varepsilon_0 A}{d} = \frac{(8.854\times10^{-12})(25)}{0.50} = 4.4\times10^{-10}\ \text{F}.$$

What went wrong?`,
      choices: [
        'The area and the gap were not converted to m² and m; the answer is ten times too big',
        'ε₀ belongs in the denominator',
        'The voltage is needed to find a capacitance',
        'The gap should be squared',
      ],
      answer: 0,
      why: {
        1: t`$C = \varepsilon_0 A/d$ is right as written; only the numbers put into it are wrong.`,
        2: 'Capacitance is geometry; Q and V adjust together, so no voltage is needed.',
        3: 'The field between plates is uniform, so V = Ed, with d to the first power.',
      },
      hints: ['Check the units of every number that went in.', t`25 cm² is $25\times10^{-4}$ m², and 0.50 mm is $0.50\times10^{-3}$ m.`],
      teach: 'Put SI units into C = ε₀A/d: area in m², gap in m.',
      explain: t`$C = \dfrac{(8.854\times10^{-12})(25\times10^{-4})}{0.50\times10^{-3}} = 4.4\times10^{-11}$ F $= 44$ pF. The unconverted area was $10^4$ too big and the gap $10^3$ too big: net, ten times too large.`,
      visual: plates({ A: 25e-4, d: 0.5e-3, V: 12, hide: ['Q'] }, 'The plates edge-on: 25 cm² each, 0.50 mm apart (the gap drawn far wider than to scale).'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-esd', difficulty: 3, transfer: true,
      gen(r) {
        const C = r.pick([100, 150, 200]), V = r.pick([4, 6, 8, 10, 12]);     // pF, kV
        const Q = C * 1e-12 * V * 1e3;   // C
        return {
          prompt: t`Before handling hydrazine, a technician walks across a dry floor and charges up to ${V} kV relative to ground. Treat the body and the floor as a capacitor of ${C} pF. How much charge does the technician carry?`,
          answer: Q * 1e6, units: 'µC', tol: { rel: 0.005 },
          hints: [t`The body is one “plate”, the floor the other: $Q = CV$.`, t`$Q = (${C}\times10^{-12}\ \text{F})(${V}\times10^3\ \text{V})$.`],
          teach: 'Any pair of conductors is a capacitor: the charge on a person is their capacitance to ground times their voltage.',
          explain: t`$Q = CV = (${C}\times10^{-12})(${V}\times10^{3}) = ${tex(Q)}$ C $= ${nice(sf(Q * 1e6))}\ \mu$C. Small as that is, it is all released in a spark lasting well under a microsecond when a finger nears a grounded fitting — which is why propellant handlers wear grounding straps and conductive shoes.`,
          visual: qvGraph({ C: C * 1e-12, Vmax: 14, vUnit: 'kV', vScale: 1e3, at: V, caption: `The body as a capacitor of ${C} pF: its charge grows in proportion to its voltage. A person can reach 10 kV or more on a dry day; the Human Body Model used to test electronics takes 100 pF.` }),
        };
      },
    }),
    num({
      id: 'cp-gap', difficulty: 2,
      gen(r) {
        const A = r.pick([50, 100, 200]), C = r.pick([50, 100, 150, 250]);      // cm², pF
        const d = (EPS0 * A * 1e-4) / (C * 1e-12);   // m
        return {
          prompt: t`A parallel-plate capacitor in vacuum has plates of area ${A} cm² and a capacitance of ${C} pF. How far apart are the plates?`,
          answer: d * 1e3, units: 'mm', tol: { rel: 0.01 },
          hints: [t`Rearrange $C = \varepsilon_0 A/d$ for $d$, and work in SI units.`],
          teach: t`The gap is $d = \varepsilon_0 A/C$.`,
          explain: t`$d = \dfrac{\varepsilon_0 A}{C} = \dfrac{(8.854\times10^{-12})(${A}\times10^{-4})}{${C}\times10^{-12}} = ${tex(d)}$ m $= ${nice(sf(d * 1e3))}$ mm.`,
          visual: plates({ A: A * 1e-4, d: Math.min(0.01, d), V: 12, hide: ['d', 'Q'] }, 'The plates edge-on, the gap drawn wider than to scale.'),
        };
      },
    }),
    mcq({
      id: 'cp-net', difficulty: 2,
      prompt: t`A capacitor is said to be “charged to 50 µC”. What is the total charge on the capacitor, both plates together?`,
      choices: ['Zero', '50 µC', '100 µC', 'It depends on the voltage'],
      answer: 0,
      why: {
        1: '50 µC is on the positive plate only; the negative plate holds −50 µC.',
        2: 'The two plates carry opposite charges; they do not add up.',
        3: 'Whatever the voltage, the plates’ charges are equal and opposite.',
      },
      hints: ['What does the negative plate hold?'],
      teach: 'A capacitor’s “charge Q” is the charge on its positive plate; the other plate holds −Q, so it is neutral overall.',
      explain: t`The battery only moved charge from one plate to the other: $+50\ \mu$C on one, $-50\ \mu$C on the other, zero in total. A “charged” capacitor stores separated charge — and energy — not net charge.`,
      visual: plates({ A: 0.012, d: 2.5e-3, V: 12, hide: ['Q'] }, 'A charged capacitor edge-on: positive charge on one plate, an equal negative charge on the other.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §8.1 Capacitors and Capacitance', url: 'https://openstax.org/books/university-physics-volume-2/pages/8-1-capacitors-and-capacitance' },
    { label: 'CODATA 2022: vacuum electric permittivity', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?ep0' },
  ],
});
