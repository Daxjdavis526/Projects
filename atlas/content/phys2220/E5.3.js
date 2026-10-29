// Energy stored in a field: U = Q²/2C = ½CV² = ½QV, the triangle under the
// V–Q line; and the energy lives in the field, u = ½ε₀E². Charging through a
// resistor, the battery does work QV and exactly half is lost as heat.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, sf, apart, circuit, plates, qvGraph, seg } from './_circuits.js';

const t = String.raw;

export default lesson({
  id: 'phys2220.E5.3',
  title: 'Energy stored in a field',
  minutes: 10, difficulty: 2,
  intro: t`Charging a capacitor takes work. The first bit of charge crosses from one plate to the other for free, but every later bit has to be pushed against the voltage already built up, $v = q/C$. Moving $dq$ costs $v\,dq = (q/C)\,dq$, so the total from empty to a charge $Q$ is the **area of the triangle** under the line of $v$ against $q$ — half of $QV$, not all of it.

Where is that energy kept? **In the field.** Divide $\tfrac12 CV^2$ by the volume between the plates, $Ad$, and with $C = \varepsilon_0A/d$ and $E = V/d$ the result depends only on the field:

$$u_E = \tfrac12\varepsilon_0 E^2$$

That energy density holds for any electric field, anywhere — in a capacitor, a lightning cloud or a light wave.`,
  equation: t`U = \frac{Q^2}{2C} = \tfrac12 CV^2 = \tfrac12 QV`,
  symbols: [
    { tex: 'U', text: 'the energy stored in the capacitor, in joules — the work done to separate its charges' },
    { tex: 'Q', text: 'the charge on the positive plate, in coulombs' },
    { tex: 'C', text: 'the capacitance, in farads' },
    { tex: 'V', text: 'the voltage between the plates, in volts; the three forms are the same thing, since $Q = CV$' },
    { tex: 'u_E', text: 'the energy density of the field: energy per volume, in J/m³' },
    { tex: 'E', text: 'the electric field strength, in V/m' },
    { tex: '\\varepsilon_0', text: 'the permittivity of free space, $8.854\\times10^{-12}$ F/m' },
  ],
  why: t`Fields are not bookkeeping: they carry energy, and in relativity energy gravitates — the energy density of a field enters the stress–energy tensor on the right of Einstein’s equations just as mass does.`,
  visual: {
    type: 'em-circuit',
    title: 'Where does the battery’s work go?',
    lead: t`A battery charges an empty capacitor through a resistor. The readout keeps the books since the switch moved: the work the battery has done, the energy now stored in the capacitor, and the heat dissipated in the resistor.`,
    tasks: [
      'Let it charge fully: the battery has done twice the work the capacitor stores — the other half became heat in R.',
      'Make R ten times smaller and Restart: it charges faster, but the half-and-half split does not change.',
      'Switch to Discharge: all the stored energy turns into heat in the resistor.',
    ],
    params: { circuit: 'rc', opts: { net: 'single' }, values: { E: 12, R: 1000, C: 1e-3 }, sliders: [{ key: 'R', min: 100, max: 5000, step: 100 }, 'C'], energy: true, show: { I: true, drop: true } },
  },
  example: {
    prompt: t`A parallel-plate capacitor in vacuum has plates of area 100 cm² that are 1.0 mm apart, and is charged to 500 V. Find the energy it stores, first from $\tfrac12CV^2$, then from the field’s energy density.`,
    visual: plates({ A: 0.01, d: 1e-3, V: 500, show: { energy: true } }, 'The field fills the gap uniformly, so its energy density (gold) is the same everywhere between the plates. Fringing at the edges is ignored; the gap is drawn far wider than to scale.'),
    steps: [
      { label: 'Capacitance', text: t`$C = \varepsilon_0 A/d = (8.854\times10^{-12})(0.0100)/(1.0\times10^{-3}) = 8.85\times10^{-11}$ F $= 88.5$ pF.` },
      { label: 'Energy from the circuit', text: t`$U = \tfrac12 CV^2 = \tfrac12(8.85\times10^{-11})(500)^2 = 1.11\times10^{-5}$ J $= 11.1\ \mu$J.` },
      { label: 'The field', text: t`$E = V/d = 500/1.0\times10^{-3} = 5.0\times10^{5}$ V/m, so $u_E = \tfrac12\varepsilon_0E^2 = \tfrac12(8.854\times10^{-12})(5.0\times10^5)^2 = 1.11$ J/m³.` },
      { label: 'Energy from the field', text: t`The field fills the volume $Ad = (0.0100)(1.0\times10^{-3}) = 1.0\times10^{-5}$ m³, so $U = u_E\,Ad = 1.11\times10^{-5}$ J. The same answer, as it must be: the energy is the field’s.` },
      { label: 'Sense check', text: t`Microjoules: a small air-gap capacitor at a few hundred volts holds about as much energy as a 1 g paper clip dropped 1 mm. The firing banks and flash capacitors that store joules use far larger capacitance.` },
    ],
    answer: t`$U = 11\ \mu$J, both ways.`,
  },
  practice: [
    num({
      id: 'half-cv2', difficulty: 1,
      gen(r) {
        const C = r.pick([100, 220, 470, 1000]), V = r.pick([9, 12, 25, 50]);     // µF, V
        const U = 0.5 * C * 1e-6 * V * V;   // J
        return {
          prompt: t`How much energy does a ${C} µF capacitor store when it is charged to ${V} V?`,
          answer: U * 1e3, units: 'mJ', tol: { rel: 0.005 },
          errors: apart([
            { value: C * 1e-6 * V * V * 1e3, feedback: t`That is $CV^2$ — twice the stored energy. The voltage grows from 0 to $V$ as the charge goes on, so the average is $V/2$: $U = \tfrac12CV^2$.` },
            { value: 0.5 * C * 1e-6 * V * 1e3, feedback: t`Square the voltage: $U = \tfrac12CV^2$.` },
          ], U * 1e3),
          hints: [t`$U = \tfrac12CV^2$ with $C$ in farads.`],
          teach: t`A capacitor charged to $V$ stores $U = \tfrac12CV^2$: the triangle under the $V$–$Q$ line.`,
          explain: t`$U = \tfrac12(${C}\times10^{-6})(${V})^2 = ${tex(U)}$ J $= ${nice(sf(U * 1e3))}$ mJ.`,
          visual: qvGraph({ C: C * 1e-6, Vmax: V * 1.15, qUnit: 'mC', qScale: 1e3, at: V, shade: true, caption: 'Charge against voltage while the capacitor charges. The shaded triangle is the work done: each new bit of charge was pushed against the voltage built up so far.' }),
        };
      },
    }),
    num({
      id: 'q-form', difficulty: 2,
      gen(r) {
        const Q = r.pick([60, 120, 240, 300]), C = r.pick([10, 22, 47]);   // µC, µF
        const U = (Q * 1e-6) ** 2 / (2 * C * 1e-6);    // J
        return {
          prompt: t`An isolated ${C} µF capacitor holds a charge of ${Q} µC. How much energy is stored in it?`,
          answer: U * 1e3, units: 'mJ', tol: { rel: 0.005 },
          errors: apart([
            { value: (Q * 1e-6) ** 2 / (C * 1e-6) * 1e3, feedback: t`Missing the ½: $U = Q^2/2C$.` },
            { value: (Q * 1e-6) * (Q / C) * 1e3, feedback: t`$QV$ counts every coulomb as if it had crossed the full voltage. Only the last ones did: $U = \tfrac12QV$.` },
          ], U * 1e3),
          hints: [t`With $Q$ and $C$ given, use $U = Q^2/2C$ (or find $V = Q/C$ first and use $\tfrac12QV$).`],
          teach: t`When the charge is what you know, $U = Q^2/2C$.`,
          explain: t`$U = \dfrac{(${Q}\times10^{-6})^2}{2(${C}\times10^{-6})} = ${tex(U)}$ J $= ${nice(sf(U * 1e3))}$ mJ. Check with $V = Q/C = ${nice(sf(Q / C))}$ V: $\tfrac12QV$ gives the same.`,
          visual: qvGraph({ C: C * 1e-6, Vmax: (Q / C) * 1.15, at: Q / C, shade: true, caption: `This capacitor's charge–voltage line: at ${Q} µC it sits at the gold line. The shaded area is the stored energy.` }),
        };
      },
    }),
    mcq({
      id: 'double-v', difficulty: 2,
      prompt: t`A capacitor stays connected to a power supply whose voltage is turned up from 50 V to 100 V. By what factor does its stored energy change?`,
      choices: ['×4', '×2', '×1 (C has not changed)', '×½'],
      answer: 0,
      why: {
        1: t`The charge doubles and so does the voltage it sits at: $U = \tfrac12QV$ goes up by $2\times2$.`,
        2: 'C is the same, but the energy depends on V as well.',
        3: t`$U = \tfrac12CV^2$ grows with $V$; it cannot fall when $V$ rises with $C$ fixed.`,
      },
      hints: [t`$U = \tfrac12CV^2$ with $C$ fixed.`],
      teach: t`At fixed capacitance the stored energy goes as the square of the voltage.`,
      explain: t`$U \propto V^2$: doubling $V$ makes $U$ four times larger. On the graph of $U$ against $V$ the parabola steepens as it climbs.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 120], y: [0, 1.25], aspect: 'wide', axesAt: 'edge', xlabel: 'V (V)', ylabel: 'U (relative)',
          curves: [{ fn: '(x/100)^2', color: 'accent', domain: [0, 112] }],
          points: [{ x: 50, y: 0.25, color: 'gold', label: '50 V' }, { x: 100, y: 1, color: 'gold', label: '100 V', labelDx: -46 }],
        },
        caption: 'Stored energy against voltage for one capacitor: U = ½CV², a parabola. The vertical scale is relative.',
      },
    }),
    num({
      id: 'density', difficulty: 2,
      gen(r) {
        const d = r.pick([1, 2, 2.5, 4]), V = r.pick([1, 2, 3, 5]);    // mm, kV
        const E = (V * 1e3) / (d * 1e-3), u = 0.5 * EPS0 * E * E;
        return {
          prompt: t`Two parallel plates ${d} mm apart in vacuum are held at a potential difference of ${V} kV. What is the energy density of the field between them?`,
          answer: u, units: 'J/m^3', tol: { rel: 0.01 },
          errors: apart([
            { value: EPS0 * E * E, feedback: t`Missing the ½: $u_E = \tfrac12\varepsilon_0E^2$.` },
            { value: 0.5 * EPS0 * E, feedback: t`Square the field: $u_E = \tfrac12\varepsilon_0E^2$.` },
          ], u),
          hints: [t`First the field: $E = V/d$ in V/m.`, t`Then $u_E = \tfrac12\varepsilon_0E^2$.`],
          teach: t`The energy density of an electric field is $u_E = \tfrac12\varepsilon_0E^2$, whatever made the field.`,
          explain: t`$E = \dfrac{${V}\times10^3}{${d}\times10^{-3}} = ${tex(E)}$ V/m, so $u_E = \tfrac12(8.854\times10^{-12})(${tex(E)})^2 = ${nice(sf(u))}$ J/m³.${E > 3e6 ? ' (In air this field would exceed the breakdown strength of 3 MV/m and spark; in vacuum it can be held.)' : ''}`,
          visual: plates({ A: 0.01, d: d * 1e-3, V: 12, hide: ['V', 'Q'], show: { energy: true } }, 'The field between the plates, shaded by its energy density: uniform across the gap (fringing ignored).'),
        };
      },
    }),
    mcq({
      id: 'battery-half', difficulty: 3,
      prompt: t`A battery of emf $\mathcal{E}$ charges an empty capacitor $C$ through a resistor $R$ until the current stops. The capacitor ends up holding $Q = C\mathcal{E}$. Which statement about the energy is right?`,
      choices: [
        t`The battery does work $Q\mathcal{E}$; half is stored, half becomes heat in $R$, whatever $R$ is`,
        t`The battery does work $\tfrac12Q\mathcal{E}$, all of it stored in the capacitor`,
        t`The battery does work $Q\mathcal{E}$, all of it stored in the capacitor`,
        t`The heat in $R$ can be made as small as you like by making $R$ small`,
      ],
      answer: 0,
      why: {
        1: t`The battery pushes every coulomb across its full emf, so its work is $Q\mathcal{E}$, not $\tfrac12Q\mathcal{E}$.`,
        2: t`The capacitor can hold only $\tfrac12Q\mathcal{E}$ at the end: the rest is not missing, it went into the resistor as heat.`,
        3: t`A smaller $R$ gives a bigger current for a shorter time; the heat $\int I^2R\,dt$ comes out the same, $\tfrac12C\mathcal{E}^2$.`,
      },
      hints: ['The battery moves every coulomb through the full emf. How much energy does the capacitor end up with?', t`Heat in R: $\int_0^\infty I^2R\,dt$ with $I = (\mathcal{E}/R)e^{-t/RC}$. Try it — R cancels.`],
      teach: t`Charging a capacitor from a fixed voltage always wastes exactly as much energy as it stores.`,
      explain: t`Battery work: $Q\mathcal{E} = C\mathcal{E}^2$. Stored: $\tfrac12C\mathcal{E}^2$. Heat: $\int_0^\infty \frac{\mathcal{E}^2}{R}e^{-2t/RC}dt = \frac{\mathcal{E}^2}{R}\cdot\frac{RC}{2} = \tfrac12C\mathcal{E}^2$ — independent of $R$. Only charging in many small voltage steps (or through an inductor) beats the 50% loss.`,
      visual: circuit('rc', { opts: { net: 'single' }, values: { E: 12, R: 1000, C: 1e-3 }, show: { I: true }, caption: 'The capacitor just after the switch closes: it is empty, so the full emf is across the resistor and the current is at its largest.' }),
    }),
    mcq({
      id: 'pull-apart', difficulty: 3,
      prompt: t`A charged parallel-plate capacitor is disconnected from its battery. You then pull the plates apart until the gap is twice as wide. What happens to the stored energy?`,
      choices: ['It doubles', 'It halves', 'It does not change', 'It quadruples'],
      answer: 0,
      why: {
        1: t`That uses $\tfrac12CV^2$ with $V$ held fixed — but with no battery, $V$ is not fixed: the charge is.`,
        2: 'You pull against the attraction of the plates: your work goes into the field.',
        3: t`With $Q$ fixed, $U = Q^2/2C$ and $C$ halves once: $U$ doubles, it does not quadruple.`,
      },
      hints: ['Disconnected: which of Q, V, C stays the same?', t`$Q$ is trapped on the plates; $C = \varepsilon_0A/d$ halves. Use $U = Q^2/2C$.`],
      teach: t`With the battery disconnected, $Q$ is fixed, so use $U = Q^2/2C$.`,
      explain: t`$Q$ stays put, $C$ halves, so $U = Q^2/2C$ doubles — and the voltage doubles too. The extra energy is the work you did pulling the oppositely charged plates apart. In field terms: the field $E = \sigma/\varepsilon_0$ is unchanged, but now fills twice the volume.`,
      visual: plates({ A: 0.01, d: 2e-3, Q: 4e-10, connected: false, show: { energy: true } }, 'The capacitor charged and then disconnected: its charge has nowhere to go. Energy-density shading in gold.'),
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student works out the energy stored in a 2.0 µF capacitor charged to 300 V:

“$Q = CV = 600\ \mu$C. Moving charge $Q$ through a potential difference $V$ takes work $QV$, so $U = QV = (600\times10^{-6})(300) = 0.18$ J.”

What is wrong?`,
      choices: [
        'The voltage was not 300 V while most of the charge moved: it rose from 0, so U = ½QV = 0.090 J',
        'The charge should be Q = V/C',
        'The energy must be found from the field, not from Q and V',
        'Nothing: U = QV = 0.18 J',
      ],
      answer: 0,
      why: {
        1: t`$Q = CV$ is right: 600 µC.`,
        2: 'Field and circuit give the same answer; the circuit route is fine if done properly.',
        3: 'QV would be right only if every coulomb crossed the full 300 V. The early ones crossed almost none.',
      },
      hints: ['What was the voltage across the capacitor when the first microcoulomb was moved?', 'The work is the area under V against q, from 0 to Q.'],
      teach: 'The charge goes on while the voltage builds up from zero, so the work is the triangle ½QV, not the rectangle QV.',
      explain: t`$U = \int_0^Q \frac{q}{C}dq = \frac{Q^2}{2C} = \tfrac12QV = 0.090$ J. The student’s $QV$ is the whole rectangle on the graph; the stored energy is only the triangle under the line.`,
      visual: (() => {
        const g = qvGraph({ C: 2e-6, Vmax: 340, caption: 'Charge against voltage for the 2.0 µF capacitor. The dashed rectangle is the student’s QV.' });
        g.params.curves.push(seg(0, 600, 300, 600, 'warn', 1.6), seg(300, 0, 300, 600, 'warn', 1.6));
        g.params.curves.slice(-2).forEach((c) => { c.dash = true; });
        g.params.points = [{ x: 300, y: 600, color: 'gold', label: '(300 V, 600 µC)', labelDx: -112 }];
        return g;
      })(),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-firing', difficulty: 2, transfer: true,
      gen(r) {
        const C = r.pick([2200, 3300, 4700]), V = r.pick([24, 28, 32]);
        const U = 0.5 * C * 1e-6 * V * V;
        return {
          prompt: t`A capacitor-discharge firing unit for a pyrotechnic valve charges a ${C} µF bank from the ${V} V bus. How much energy is ready to dump into the igniter?`,
          answer: U, units: 'J', tol: { rel: 0.005 },
          errors: apart([{ value: C * 1e-6 * V * V, feedback: t`That is $CV^2$; the bank stores half of it, $\tfrac12CV^2$.` }], U),
          hints: [t`$U = \tfrac12CV^2$ with $C$ in farads.`],
          teach: t`A charged capacitor bank stores $\tfrac12CV^2$.`,
          explain: t`$U = \tfrac12(${C}\times10^{-6})(${V})^2 = ${nice(sf(U))}$ J. A capacitor can give that energy up in milliseconds — far faster than a battery could — which is why firing units use one.`,
          visual: circuit('firing', { values: { E: V, C: C * 1e-6, Rc: 1000, Rb: 1 }, switches: { S1: true, S2: false }, t: 30, caption: 'The firing circuit armed and charged: the bus has filled the bank through the charging resistor, and the fire switch is still open.' }),
        };
      },
    }),
    num({
      id: 'cp-esd-energy', difficulty: 3, transfer: true,
      gen(r) {
        const C = r.pick([100, 150, 200]), V = r.pick([4, 6, 8, 10]);   // pF, kV
        const U = 0.5 * C * 1e-12 * (V * 1e3) ** 2;   // J
        return {
          prompt: t`A technician refuelling a hydrogen ground-support line has a body capacitance of ${C} pF and has charged up to ${V} kV by walking across an insulating floor. How much energy would a spark from a fingertip release?`,
          answer: U * 1e3, units: 'mJ', tol: { rel: 0.005 },
          errors: apart([{ value: C * 1e-12 * (V * 1e3) ** 2 * 1e3, feedback: t`Missing the ½: $U = \tfrac12CV^2$.` }, { value: 0.5 * C * 1e-12 * V * 1e3 * 1e3, feedback: t`Square the voltage — in volts, not kilovolts.` }], U * 1e3),
          hints: ['The body and the floor are the two plates.', t`$U = \tfrac12CV^2$ with $C = ${C}\times10^{-12}$ F and $V = ${V}\times10^3$ V.`],
          teach: t`The energy in an electrostatic spark is the $\tfrac12CV^2$ stored on the body before it discharges.`,
          explain: t`$U = \tfrac12(${C}\times10^{-12})(${V}\times10^3)^2 = ${nice(sf(U * 1e3))}$ mJ. A hydrogen–air mixture can be ignited by about 0.02 mJ — roughly ${Math.round(U * 1e3 / 0.02 / 10) * 10} times less — and many hydrocarbon vapours by a few tenths of a millijoule. Hence grounding straps, conductive floors and humidity control wherever propellants are handled.`,
          visual: qvGraph({ C: C * 1e-12, Vmax: 12, vUnit: 'kV', vScale: 1e3, at: V, shade: true, caption: `The body as a ${C} pF capacitor: the shaded triangle up to ${V} kV is the energy a spark would release.` }),
        };
      },
    }),
    num({
      id: 'cp-field', difficulty: 2,
      gen(r) {
        const E = r.pick([0.5, 1, 1.5, 2]), vol = r.pick([10, 20, 50]);   // MV/m, cm³
        const U = 0.5 * EPS0 * (E * 1e6) ** 2 * vol * 1e-6;
        return {
          prompt: t`The gap of a vacuum capacitor has a volume of ${vol} cm³, and the field in it is a uniform ${E} MV/m. How much energy is stored?`,
          answer: U * 1e3, units: 'mJ', tol: { rel: 0.01 },
          errors: apart([{ value: EPS0 * (E * 1e6) ** 2 * vol * 1e-6 * 1e3, feedback: t`Missing the ½ in $u_E = \tfrac12\varepsilon_0E^2$.` }], U * 1e3),
          hints: [t`Energy density first: $u_E = \tfrac12\varepsilon_0E^2$, with $E$ in V/m.`, t`Then multiply by the volume in m³ ($1\ \text{cm}^3 = 10^{-6}\ \text{m}^3$).`],
          teach: 'The energy stored in a uniform field is its energy density times the volume it fills.',
          explain: t`$u_E = \tfrac12(8.854\times10^{-12})(${E}\times10^6)^2 = ${nice(sf(0.5 * EPS0 * (E * 1e6) ** 2))}$ J/m³; times $${vol}\times10^{-6}$ m³ gives $${nice(sf(U * 1e3))}$ mJ.`,
          visual: plates({ A: 0.01, d: 2e-3, V: 12, hide: ['V', 'Q', 'A', 'd'], show: { energy: true } }, 'A uniform field between the plates, shaded by its energy density. Fringing ignored.'),
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 2, §8.3 Energy Stored in a Capacitor', url: 'https://openstax.org/books/university-physics-volume-2/pages/8-3-energy-stored-in-a-capacitor' }],
});
