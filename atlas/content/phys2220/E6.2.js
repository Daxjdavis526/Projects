// Resistance and Ohm's law: R = V/I; ohmic materials keep R fixed, so I ∝ V.
// A wire's R = ρL/A, with ρ rising with temperature. A battery fixes the
// voltage, not the current: the resistance decides the current.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { sf, apart, circuit, seg, label } from './_circuits.js';

const t = String.raw;
const RHO = { copper: 1.68e-8, aluminium: 2.65e-8, nichrome: 1.0e-6, tungsten: 5.6e-8 };

export default lesson({
  id: 'phys2220.E6.2',
  title: 'Resistance and Ohm’s law',
  minutes: 10, difficulty: 2,
  intro: t`Put a voltage across a piece of material and a current flows; the ratio is its **resistance**, $R = V/I$, measured in ohms (1 Ω = 1 V/A). For many materials — metals at a steady temperature, carbon-film resistors — $R$ stays the same whatever the voltage: double $V$ and $I$ doubles. That proportionality is **Ohm’s law**, and such materials are called ohmic. Plenty of useful things are not: a lamp filament’s resistance climbs as it heats, and a diode conducts in one direction only.

A wire’s resistance comes from its shape and its material: longer wires resist more, fatter ones less, and the **resistivity** $\rho$ belongs to the material — $1.68\times10^{-8}$ Ω·m for copper, $1.0\times10^{-6}$ Ω·m for nichrome. In metals it rises with temperature, roughly as $\rho = \rho_0[1 + \alpha(T - T_0)]$. And a battery fixes a **voltage**, not a current: the resistance of whatever it is connected to decides how much current flows.`,
  equation: t`V = IR, \qquad R = \frac{\rho L}{A}`,
  symbols: [
    { tex: 'V', text: 'the potential difference across the element, in volts' },
    { tex: 'I', text: 'the current through it, in amperes' },
    { tex: 'R', text: 'its resistance, in ohms (Ω): volts needed per ampere' },
    { tex: '\\rho', text: 'the resistivity of the material, in ohm-metres (Ω·m): a property of the material alone' },
    { tex: 'L', text: 'the length of the conductor along the current, in m' },
    { tex: 'A', text: 'its cross-sectional area, in m²' },
    { tex: '\\alpha', text: 'the temperature coefficient of resistivity, per kelvin: about $3.9\\times10^{-3}$ K⁻¹ for copper, so its resistance rises about 0.4% per degree' },
  ],
  why: 'Every wire, heater, strain gauge and bridgewire is designed with R = ρL/A, and Ohm’s law is the first tool for working out what a circuit will do.',
  visual: {
    type: 'em-circuit',
    title: 'A wire across a battery',
    lead: t`The battery drives a current through a length of wire. Change the wire’s material, length and diameter, and the battery’s voltage, and watch the resistance and current in the readout.`,
    tasks: [
      'Double the length: R doubles and the current halves.',
      'Double the diameter: the area quadruples, so R falls to a quarter.',
      'Switch from nichrome to copper: the resistance drops about sixty-fold.',
    ],
    params: { circuit: 'single', opts: { wire: true }, values: { E: 6 }, sliders: ['E'], wire: { material: 'nichrome', L: 1, d: 0.5e-3, materials: ['copper', 'aluminium', 'tungsten', 'nichrome'] }, show: { I: true } },
  },
  example: {
    prompt: t`A heating element is a 1.5 m length of nichrome wire, 0.40 mm in diameter, connected across 12 V. Find its resistance, the current and the current density. What would happen with copper wire of the same size instead?`,
    visual: circuit('single', { opts: { wire: true }, values: { E: 12 }, wire: { material: 'nichrome', L: 1.5, d: 0.4e-3 }, caption: 'The nichrome wire across the 12 V supply. Ideal connecting wires.' }),
    steps: [
      { label: 'Area', text: t`$A = \pi(0.20\times10^{-3}\ \text{m})^2 = 1.26\times10^{-7}$ m² (0.126 mm²).` },
      { label: 'Resistance', text: t`$R = \dfrac{\rho L}{A} = \dfrac{(1.0\times10^{-6}\ \Omega\,\text{m})(1.5\ \text{m})}{1.26\times10^{-7}\ \text{m}^2} = 11.9\ \Omega$.` },
      { label: 'Current', text: t`$I = V/R = 12/11.9 = 1.0$ A, and $J = I/A = 1.0\ \text{A}/0.126\ \text{mm}^2 = 8.0$ A/mm².` },
      { label: 'Copper instead', text: t`Copper’s resistivity is 60 times lower: $R = 0.20\ \Omega$, and the 12 V supply would try to drive 60 A. Heaters use nichrome because a short, robust wire then has a useful resistance — and nichrome resists oxidizing when red-hot.` },
      { label: 'Sense check', text: t`Units: $\Omega\,\text{m}\cdot\text{m}/\text{m}^2 = \Omega$. ✓ The field inside the wire is $V/L = 8$ V/m: modest, because the wire is long.` },
    ],
    answer: t`$R = 11.9\ \Omega$, $I = 1.0$ A, $J = 8.0$ A/mm². Copper: $0.20\ \Omega$ — far too low for a heater on 12 V.`,
  },
  practice: [
    num({
      id: 'ohm', difficulty: 1,
      gen(r) {
        const V = r.pick([1.5, 6, 9, 12, 24]), R = r.pick([2, 5, 8, 20, 47, 100]);
        return {
          prompt: t`A ${R} Ω resistor is connected across a ${V} V battery. What current flows through it?`,
          answer: V / R, units: 'A', tol: { rel: 0.005 },
          errors: apart([{ value: V * R, feedback: t`Divide: $I = V/R$.` }, { value: R / V, feedback: t`Upside down: $I = V/R$.` }], V / R),
          hints: [t`Ohm’s law: $I = V/R$.`],
          teach: t`The current through a resistor is $I = V/R$.`,
          explain: t`$I = V/R = ${V}/${R} = ${nice(sf(V / R))}$ A.`,
          visual: circuit('single', { values: { E: V, R1: R }, caption: 'The resistor across the battery.' }),
        };
      },
    }),
    num({
      id: 'wire-r', difficulty: 2,
      gen(r) {
        const L = r.pick([5, 10, 25, 40]), d = r.pick([0.5, 1.0, 1.6, 2.0]);     // m, mm
        const R = (RHO.copper * L) / (Math.PI * (d * 1e-3 / 2) ** 2);
        return {
          prompt: t`What is the resistance of ${L} m of copper wire ${d} mm in diameter? (Copper: $\rho = 1.68\times10^{-8}\ \Omega\,\text{m}$.)`,
          answer: R, units: 'Ω', tol: { rel: 0.01 },
          errors: apart([
            { value: (RHO.copper * L) / (Math.PI * (d * 1e-3) ** 2), feedback: t`The radius is half the diameter: $A = \pi(d/2)^2$.` },
            { value: (RHO.copper * Math.PI * (d * 1e-3 / 2) ** 2) / L, feedback: t`Upside down: length on top, area below — $R = \rho L/A$.` },
          ], R),
          hints: [t`$R = \rho L/A$ with $A = \pi(d/2)^2$ in m².`, t`$A = \pi(${d / 2}\times10^{-3})^2 = ${tex(Math.PI * (d * 1e-3 / 2) ** 2)}$ m².`],
          teach: t`A wire’s resistance is $R = \rho L/A$: proportional to length, inversely proportional to cross-section.`,
          explain: t`$R = \dfrac{(1.68\times10^{-8})(${L})}{${tex(Math.PI * (d * 1e-3 / 2) ** 2)}} = ${nice(sf(R))}\ \Omega$. Small, which is the point of copper wiring.`,
          visual: circuit('single', { opts: { wire: true }, values: { E: 1.5 }, wire: { material: 'copper', L, d: d * 1e-3 }, hide: ['R1'], caption: 'The copper wire connected across a cell; its resistance is what you are finding.' }),
        };
      },
    }),
    mcq({
      id: 'stretch', difficulty: 2,
      prompt: t`A wire is drawn out to twice its original length. Its volume does not change, so it gets thinner. By what factor does its resistance change?`,
      choices: ['×4', '×2', '×1', '×½'],
      answer: 0,
      why: {
        1: 'Doubling the length alone doubles R — but the wire also got thinner.',
        2: 'The material is the same, but the shape is not: R depends on L/A.',
        3: 'Longer and thinner both raise R.',
      },
      hints: ['Same volume: if L doubles, what happens to A?', t`$R = \rho L/A$: $L \to 2L$ and $A \to A/2$.`],
      teach: t`Stretching a wire raises its resistance twice over: longer and thinner, $R \propto L^2$ at fixed volume.`,
      explain: t`Volume $LA$ is fixed, so $A \to A/2$. Then $R' = \rho(2L)/(A/2) = 4\rho L/A = 4R$. Strain gauges use exactly this: a stretched gauge wire raises its resistance by about twice its fractional stretch.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.5, 8.5], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [seg(0, 0.5, 3.5, 0.5, 'warn', 22), seg(0, -0.9, 7, -0.9, 'warn', 11)],
          points: [label(0, 0.5, 'length L, area A', 'ink2', 0, -22), label(0, -0.9, 'length 2L, area A/2', 'ink2', 0, -17)],
        },
        caption: 'The same piece of metal before and after it is drawn out. Thickness exaggerated.',
      },
    }),
    mcq({
      id: 'battery-current', difficulty: 2,
      prompt: t`A battery drives 0.60 A through a 10 Ω resistor. The resistor is replaced by a 20 Ω one. What current flows now? (Treat the battery as ideal.)`,
      choices: ['0.30 A', '0.60 A: a battery always delivers the same current', '1.2 A', '0.15 A'],
      answer: 0,
      why: {
        1: 'A battery keeps a fixed voltage across its terminals (6 V here), not a fixed current. The resistance decides the current.',
        2: 'More resistance means less current, not more.',
        3: 'The current is inversely proportional to R, not to R².',
      },
      hints: ['What does the battery keep the same — the current or the voltage?', 'The battery’s voltage is (0.60 A)(10 Ω).'],
      teach: 'A battery sets a voltage; the resistance it is connected to decides the current.',
      explain: t`The battery’s voltage is $V = (0.60)(10) = 6.0$ V, and it stays 6.0 V. With 20 Ω: $I = 6.0/20 = 0.30$ A. (A real battery’s voltage sags a little at high current, because of its internal resistance — the next lesson.)`,
      visual: circuit('single', { opts: { amm: true }, values: { E: 6, R1: 20 }, hide: ['A1', 'E'], caption: 'The battery with the new 20 Ω resistor and an ammeter.' }),
    }),
    mcq({
      id: 'iv', difficulty: 2,
      prompt: t`The graph shows current against voltage for three devices: a carbon resistor, a filament bulb and a diode. Which curve is the filament bulb?`,
      choices: ['Q', 'P', 'R', 'None of them: a bulb is ohmic'],
      answer: 0,
      why: {
        1: 'P is a straight line through the origin: constant resistance, an ohmic resistor.',
        2: 'R carries almost no current until about 0.6 V and then rises steeply — a diode (and it would block the other way).',
        3: 'A filament heats up as the current grows, and hot tungsten has a much higher resistivity, so its I–V curve bends.',
      },
      hints: ['Resistance is V/I. For which curve does V/I grow as the voltage rises?', 'The bulb’s filament gets hotter at higher current.'],
      teach: 'A filament’s resistance rises as it heats, so its I–V curve bends over; an ohmic resistor’s is a straight line.',
      explain: t`On curve Q the current grows ever more slowly: $V/I$ rises with voltage as the filament heats — a tungsten filament’s resistance is over ten times higher when glowing than when cold. P is ohmic; R is a diode.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 6.5], y: [0, 0.65], aspect: 'wide', axesAt: 'edge', xlabel: 'V (V)', ylabel: 'I (A)',
          curves: [
            { fn: 'x/12', color: 'accent', label: 'P', labelAt: 5.6, labelDy: -10 },
            { fn: '0.22*x^0.55', color: 'gold', domain: [0, 6.5], label: 'Q', labelAt: 4.8, labelDy: -10 },
            { fn: '1e-9*(e^(x/0.03) - 1)', color: 'violet', domain: [0, 0.608], label: 'R', labelAt: 0.6, labelDx: 8, labelDy: 10 },
          ],
        },
        caption: 'Illustrative I–V curves for the three devices (not real component data).',
      },
    }),
    num({
      id: 'temperature', difficulty: 3,
      gen(r) {
        const R0 = r.pick([2, 5, 12, 40]), T = r.pick([60, 80, 100, 120]);
        const R = R0 * (1 + 0.0039 * (T - 20));
        return {
          prompt: t`A copper motor winding measures ${R0} Ω at 20 °C. What is its resistance when it has warmed to ${T} °C in operation? (Copper: $\alpha = 3.9\times10^{-3}$ K⁻¹.)`,
          answer: R, units: 'Ω', tol: { rel: 0.005 },
          errors: apart([{ value: R0 * 0.0039 * (T - 20), feedback: t`That is only the increase. Add it to $R_0$: $R = R_0[1 + \alpha\Delta T]$.` }, { value: R0 * (1 + 0.0039 * T), feedback: t`Use the temperature *change* from the reference, $T - 20$ °C.` }], R),
          hints: [t`$R = R_0[1 + \alpha(T - T_0)]$, with $T_0 = 20$ °C.`, t`$\alpha\Delta T = (3.9\times10^{-3})(${T - 20}) = ${nice(sf(0.0039 * (T - 20)))}$.`],
          teach: t`A metal’s resistance rises nearly linearly with temperature: $R = R_0[1 + \alpha(T - T_0)]$.`,
          explain: t`$R = ${R0}[1 + (0.0039)(${T - 20})] = ${R0}\times${nice(sf(1 + 0.0039 * (T - 20), 4))} = ${nice(sf(R))}\ \Omega$. Engineers turn this round: measuring a winding’s resistance tells them how hot it is inside.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 140], y: [0, R0 * 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 'T (°C)', ylabel: 'R (Ω)',
              curves: [{ fn: `${R0}*(1 + 0.0039*(x - 20))`, color: 'accent', domain: [0, 140] }],
              points: [{ x: 20, y: R0, color: 'gold', label: `${R0} Ω at 20 °C` }],
              vlines: [{ x: T, label: `${T} °C`, color: 'ink3' }],
            },
            caption: 'The winding’s resistance rises almost linearly with temperature (the linear rule holds well over a few hundred degrees for copper).',
          },
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student finds the resistance of 2.0 m of nichrome wire 0.50 mm in diameter ($\rho = 1.0\times10^{-6}$ Ω·m):

$$R = \frac{\rho L}{\pi d^2} = \frac{(1.0\times10^{-6})(2.0)}{\pi(0.50\times10^{-3})^2} = 2.5\ \Omega.$$

What went wrong?`,
      choices: [
        'The area uses the diameter instead of the radius; R is four times larger, 10 Ω',
        'Resistance is ρA/L, not ρL/A',
        'The length should be squared',
        'Nothing: R = 2.5 Ω',
      ],
      answer: 0,
      why: {
        1: 'R = ρL/A is right: longer wires resist more, fatter ones less.',
        2: 'R grows in proportion to L, not L².',
        3: 'Check the area: πd² is four times the cross-section πr².',
      },
      hints: ['Check each piece of the formula against its definition.', t`The cross-section is $\pi r^2 = \pi(d/2)^2$.`],
      teach: 'A round wire’s cross-section is π(d/2)²; using πd² makes the area four times too big and R four times too small.',
      explain: t`$A = \pi(0.25\times10^{-3})^2 = 1.96\times10^{-7}$ m², so $R = (1.0\times10^{-6})(2.0)/1.96\times10^{-7} = 10\ \Omega$.`,
      visual: circuit('single', { opts: { wire: true }, values: { E: 6 }, wire: { material: 'nichrome', L: 2, d: 0.5e-3 }, hide: ['R1'], caption: 'The nichrome wire in a test circuit.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bridgewire', difficulty: 2, transfer: true,
      gen(r) {
        const d = r.pick([25, 38, 50]), L = r.pick([1, 1.5, 2]);    // µm, mm
        const R = (RHO.nichrome * L * 1e-3) / (Math.PI * (d * 1e-6 / 2) ** 2);
        return {
          prompt: t`The bridgewire inside a pyrotechnic igniter is a ${L} mm length of nichrome wire ${d} µm in diameter ($\rho = 1.0\times10^{-6}$ Ω·m). What is its resistance?`,
          answer: R, units: 'Ω', tol: { rel: 0.01 },
          errors: apart([{ value: (RHO.nichrome * L * 1e-3) / (Math.PI * (d * 1e-6) ** 2), feedback: t`Use the radius: $A = \pi(d/2)^2$.` }], R),
          hints: [t`$R = \rho L/A$ with $L = ${L}\times10^{-3}$ m and $A = \pi(${d / 2}\times10^{-6}\ \text{m})^2$.`],
          teach: t`Even a tiny bridgewire’s resistance follows $R = \rho L/A$.`,
          explain: t`$A = \pi(${d / 2}\times10^{-6})^2 = ${tex(Math.PI * (d * 1e-6 / 2) ** 2)}$ m², so $R = \dfrac{(1.0\times10^{-6})(${L}\times10^{-3})}{${tex(Math.PI * (d * 1e-6 / 2) ** 2)}} = ${nice(sf(R))}\ \Omega$. A firing current of a few amperes through an ohm or two heats so thin a wire white-hot within milliseconds.`,
          visual: circuit('single', { values: { E: 28, R1: R }, names: { R1: 'bridgewire' }, hide: ['R1'], caption: 'The bridgewire drawn as a resistor on the firing bus.' }),
        };
      },
    }),
    num({
      id: 'cp-slope', difficulty: 2,
      gen(r) {
        const R = r.pick([47, 68, 100, 150, 220]);
        const pts = [1, 2, 3, 4, 5].map((v) => ({ x: v, y: +((v / R) * 1000).toFixed(1), color: 'gold', r: 4.5, ...(v === 5 ? { label: `5.0 V, ${((5 / R) * 1000).toFixed(1)} mA`, labelDx: -118, labelDy: -14 } : {}) }));
        return {
          prompt: t`A student measures the current through a resistor at five voltages and plots the data. What is its resistance?`,
          answer: R, units: 'Ω', tol: { rel: 0.03 },
          errors: [{ value: 1000 / R, feedback: 'That is the slope I/V (in mA per volt). Resistance is V/I: the reciprocal, with the current in amperes.' }],
          hints: [t`For an ohmic resistor $I = V/R$: the slope of $I$ against $V$ is $1/R$.`, 'Read the current at 5 V and divide: R = 5 V / I.'],
          teach: 'On an I–V graph of an ohmic resistor, the slope is 1/R.',
          explain: t`At 5.0 V the current is ${((5 / R) * 1000).toFixed(1)} mA, so $R = 5.0\ \text{V}/${nice(sf(5 / R))}\ \text{A} = ${R}\ \Omega$ — and every point gives the same ratio, because the resistor is ohmic.`,
          visual: {
            type: 'graph',
            params: { x: [0, 5.6], y: [0, Math.ceil((5.6 / R) * 1000 * 1.1)], aspect: 'wide', axesAt: 'edge', xlabel: 'V (V)', ylabel: 'I (mA)', points: pts },
            caption: 'The measured points. The readings fall on a straight line through the origin: the resistor is ohmic.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-supply', difficulty: 2, transfer: true,
      prompt: t`On a test stand, a bench supply set to a constant 28 V feeds a 2.0 Ω load and delivers 14 A. A technician swaps in a 1.0 Ω load. Assuming the supply holds its voltage, what current does it now deliver?`,
      choices: ['28 A', '14 A', '7 A', '56 A'],
      answer: 0,
      why: {
        1: 'In constant-voltage mode the supply holds 28 V; a smaller load resistance draws more current.',
        2: 'Halving the resistance doubles the current; it does not halve it.',
        3: 'I = V/R: halving R doubles I, it does not quadruple it.',
      },
      hints: ['Which quantity does the supply hold fixed?'],
      teach: 'A voltage source holds its voltage; the load’s resistance sets the current.',
      explain: t`$I = 28\ \text{V}/1.0\ \Omega = 28$ A. That is why bench supplies also have a current limit: a load fault that drops the resistance would otherwise draw whatever current the supply can deliver.`,
      visual: circuit('single', { opts: { amm: true }, values: { E: 28, R1: 1 }, names: { R1: 'load' }, hide: ['A1'], caption: 'The supply with the new 1.0 Ω load.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §9.3 Resistivity and Resistance and §9.4 Ohm’s Law', url: 'https://openstax.org/books/university-physics-volume-2/pages/9-3-resistivity-and-resistance' },
  ],
});
