// Current and current density: I = dQ/dt = n q v_d A, J = I/A. Drift speeds
// are below a millimetre per second, yet every bulb lights at once, because
// the field reaches the whole circuit at nearly the speed of light. Charge is
// conserved, so the current is the same all round a single loop: it is not
// used up.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { E_CHARGE, sf, apart, circuit, wirePicture } from './_circuits.js';

const t = String.raw;
const N_CU = 8.49e28;     // free electrons per m³ in copper (one per atom)

/** A current pulse I(t) on a graph: a trapezoid rising over rise ms, flat, then falling over fall ms to zero at t3 ms. */
const pulse = (I0, rise, t3, fall, caption) => ({
  type: 'graph',
  params: {
    x: [0, t3 * 1.15], y: [0, I0 * 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 't (ms)', ylabel: 'I (A)',
    curves: [{ fn: `${I0}*max(0, min(min(x/${rise}, 1), (${t3} - x)/${fall}))`, color: 'gold', domain: [0, t3 * 1.15] }],
    shade: [{ fn: `${I0}*max(0, min(min(x/${rise}, 1), (${t3} - x)/${fall}))`, from: 0, to: t3, color: 'gold', alpha: 0.25 }],
  },
  caption,
});

export default lesson({
  id: 'phys2220.E6.1',
  title: 'Current and current density',
  minutes: 10, difficulty: 2,
  intro: t`An electric **current** is charge on the move. Through any cross-section of a wire, the current is the rate at which charge crosses it, measured in amperes: 1 A is one coulomb per second. In a metal the movers are the free electrons. They already race about at random at around $10^6$ m/s, but that goes nowhere on average; an electric field adds a tiny steady **drift**, $v_d$, against the field. With $n$ carriers per cubic metre, each of charge $q$, the charge drifting through an area $A$ each second is $nqv_dA$.

Drift is astonishingly slow — well under a millimetre per second — yet a lamp lights the instant you close the switch. The wire is already full of electrons; what travels fast is the **field** that sets all of them drifting at once, which spreads round the circuit at nearly the speed of light. And because charge is conserved, **the current is the same all the way round a single loop**: a bulb takes energy from the charge passing through it, not the charge itself.`,
  equation: t`I = \frac{dQ}{dt} = n\,q\,v_d\,A`,
  symbols: [
    { tex: 'I', text: 'the current, in amperes (A): coulombs per second through a cross-section' },
    { tex: 'dQ/dt', text: 'the rate at which charge crosses that cross-section' },
    { tex: 'n', text: 'the number of free charge carriers per cubic metre: about $8.5\\times10^{28}$ m⁻³ in copper (one free electron per atom)' },
    { tex: 'q', text: 'the charge of each carrier: for an electron, magnitude $e = 1.602\\times10^{-19}$ C' },
    { tex: 'v_d', text: 'the drift speed: the carriers’ average speed along the wire, typically a fraction of a mm/s' },
    { tex: 'A', text: 'the wire’s cross-sectional area, in m²' },
    { tex: 'J = I/A', text: 'the current density, in A/m² (often quoted in A/mm²): current per unit area, $J = nqv_d$' },
  ],
  why: 'Current is what a circuit carries, and the fact that it is the same all round a loop — charge conservation — is the first of Kirchhoff’s rules, on which all circuit analysis rests.',
  visual: {
    type: 'em-circuit',
    title: 'Three bulbs, one current',
    lead: t`A battery lights three bulbs in a single loop, with an ammeter before them and another after. The dots are the charge carriers, moving at a speed proportional to the current.`,
    tasks: [
      'Open and close the switch: all three bulbs go out and come back on together — every carrier in the loop starts and stops at once.',
      'Compare A₁ and A₂, before and after the bulbs: the same current. The bulbs use up energy, not charge.',
      'Show the carriers as electrons: they drift the other way round the loop, and every reading stays the same.',
    ],
    params: { circuit: 'series', opts: { n: 3, sw: true, amm: true, lamp: true }, values: { E: 9, R1: 6, R2: 6, R3: 6 }, sliders: ['E'], carrierToggle: true, show: { I: false } },
  },
  example: {
    prompt: t`A 2.05 mm diameter copper wire (12 gauge, common in house wiring) carries 20.0 A. How fast do its electrons drift, and how long does one take to drift 1 m along it? Copper has one free electron per atom; its density is 8.96 g/cm³ and its molar mass 63.55 g/mol.`,
    visual: wirePicture({ caption: 'Inside the wire: the free electrons drift against the field, so the current (conventional, the direction positive charge would move) points the other way. Random thermal motion, far faster than the drift, is not drawn.' }),
    steps: [
      { label: 'Carrier density', text: t`Atoms per m³: $\dfrac{8960\ \text{kg/m}^3}{0.06355\ \text{kg/mol}}\times6.022\times10^{23}\ \text{mol}^{-1} = 8.49\times10^{28}$ m⁻³, so $n = 8.49\times10^{28}$ free electrons per m³.` },
      { label: 'Area', text: t`$A = \pi r^2 = \pi(1.025\times10^{-3}\ \text{m})^2 = 3.30\times10^{-6}$ m² (3.30 mm²).` },
      { label: 'Drift speed', text: t`$v_d = \dfrac{I}{neA} = \dfrac{20.0}{(8.49\times10^{28})(1.602\times10^{-19})(3.30\times10^{-6})} = 4.46\times10^{-4}$ m/s — under half a millimetre per second.` },
      { label: 'One metre', text: t`$t = \dfrac{1\ \text{m}}{4.46\times10^{-4}\ \text{m/s}} = 2240$ s, about 37 minutes.` },
      { label: 'Sense check', text: t`Yet the lights come on at once: the field reaches every electron in the circuit within nanoseconds, and they all start drifting together. Water in a full hose behaves the same way — the tap opens and water leaves the far end at once, though no particular molecule has travelled the length of the hose.` },
    ],
    answer: t`$v_d = 0.45$ mm/s; about 37 minutes to drift one metre.`,
  },
  practice: [
    num({
      id: 'per-second', difficulty: 1,
      gen(r) {
        const I = r.pick([0.5, 1.5, 2, 3.5, 10]);
        const N = I / E_CHARGE;
        return {
          prompt: t`An ammeter in a circuit reads ${I} A. How many electrons pass through it each second?`,
          answer: N, tol: { rel: 0.01 },
          errors: [{ value: I * E_CHARGE, feedback: t`Divide by the electron’s charge: $N = Q/e$ with $Q = (${I}\ \text{C/s})(1\ \text{s})$.` }],
          hints: [t`In one second, $Q = I\times1\ \text{s}$ passes. Each electron carries $1.602\times10^{-19}$ C.`],
          teach: 'One ampere is one coulomb per second, about 6.2 × 10¹⁸ electrons per second.',
          explain: t`$Q = ${I}$ C each second, and $N = Q/e = ${I}/1.602\times10^{-19} = ${tex(N)}$ electrons per second.`,
          visual: circuit('single', { opts: { amm: true }, values: { E: 6 * I, R1: 6 }, caption: 'The ammeter sits in the loop, so all the current flows through it.' }),
        };
      },
    }),
    num({
      id: 'drift', difficulty: 2,
      gen(r) {
        const d = r.pick([0.8, 1.0, 1.6, 2.0]), I = r.pick([2, 5, 10, 15]);     // mm, A
        const A = Math.PI * (d * 1e-3 / 2) ** 2, v = I / (N_CU * E_CHARGE * A);
        return {
          prompt: t`A copper wire ${d} mm in diameter carries ${I} A. What is the drift speed of its free electrons? (Copper has $8.49\times10^{28}$ free electrons per m³.)`,
          answer: v * 1e3, units: 'mm/s', tol: { rel: 0.01 },
          errors: apart([{ value: I / (N_CU * E_CHARGE * Math.PI * (d * 1e-3) ** 2) * 1e3, feedback: t`The radius is half the diameter: $A = \pi(d/2)^2$.` }], v * 1e3),
          hints: [t`$v_d = I/(neA)$ with $A = \pi(d/2)^2$ in m².`, t`$A = \pi(${d / 2}\times10^{-3})^2 = ${tex(A)}$ m².`],
          teach: t`The drift speed is $v_d = I/(neA)$: tiny, because $n$ is enormous.`,
          explain: t`$v_d = \dfrac{${I}}{(8.49\times10^{28})(1.602\times10^{-19})(${tex(A)})} = ${tex(v)}$ m/s $= ${nice(sf(v * 1e3))}$ mm/s.`,
          visual: wirePicture({ caption: `The ${d} mm copper wire carrying ${I} A, seen from the side. Not to scale; the electrons’ fast random motion is not drawn.` }),
        };
      },
    }),
    mcq({
      id: 'same-current', difficulty: 1,
      prompt: t`Three identical bulbs are in series with a battery. Ammeter A₁, between the battery and the first bulb, reads 0.50 A. What does A₂, after the last bulb, read?`,
      choices: ['0.50 A', 'Less than 0.50 A: each bulb uses some up', 'More than 0.50 A', 'Zero: the bulbs have used it all'],
      answer: 0,
      why: {
        1: 'Bulbs use energy, not charge. Every coulomb that enters a bulb leaves it again — otherwise charge would pile up in the bulb.',
        2: 'There is nowhere for extra charge to come from between the bulbs.',
        3: 'If no charge came out of the last bulb, charge would have to pile up somewhere in the loop, and it does not.',
      },
      hints: ['Can charge pile up inside a bulb?'],
      teach: 'Charge is conserved, so the current is the same everywhere in a single loop; a bulb takes energy from the charge, not the charge itself.',
      explain: t`In a single loop every coulomb goes all the way round, so the current is 0.50 A everywhere — before the bulbs, between them and after them. What drops along the loop is the *potential*: each coulomb gives up energy in each bulb.`,
      visual: circuit('series', { opts: { n: 3, amm: true, lamp: true }, values: { E: 9, R1: 6, R2: 6, R3: 6 }, hide: ['A2'], glow: false, caption: 'Three bulbs in one loop, with an ammeter before them and one after.' }),
    }),
    mcq({
      id: 'first-bulb', difficulty: 2,
      prompt: t`Three bulbs are wired in series round a long loop with a switch. When the switch is closed, which bulb lights first?`,
      choices: [
        'All three light together',
        'The bulb nearest the battery’s positive terminal',
        'The bulb nearest the battery’s negative terminal, where the electrons come from',
        'The bulb nearest the switch',
      ],
      answer: 0,
      why: {
        1: 'Charge does not have to travel from the battery to the bulb: the wires and bulbs are already full of mobile charge.',
        2: 'Electrons leave the negative terminal, but the ones that light a bulb are the ones already in it.',
        3: 'The switch completes the loop; the field then spreads round all of it at once.',
      },
      hints: ['Where are the charges that flow through each bulb before the switch closes?', 'What has to travel round the loop for the charges in a bulb to start moving?'],
      teach: 'Closing a switch sets every carrier in the circuit moving almost at once: the field travels at nearly the speed of light, while the carriers themselves barely creep.',
      explain: t`The charges in each filament are already there; the field that pushes them is set up along the whole loop within a few nanoseconds of closing the switch, so all three bulbs light together. If the bulbs had to wait for electrons from the battery, at under a millimetre per second, a lamp at the end of a 2 m cord would take about an hour to come on.`,
      visual: circuit('series', { opts: { n: 3, sw: true, lamp: true }, values: { E: 9, R1: 6, R2: 6, R3: 6 }, switches: { S: false }, caption: 'Three bulbs in series round a loop, the switch open.' }),
    }),
    num({
      id: 'density', difficulty: 2,
      gen(r) {
        const d = r.pick([0.5, 1.0, 1.6, 2.5]), I = r.pick([1, 3, 6, 10]);
        const A = Math.PI * (d / 2) ** 2;      // mm²
        return {
          prompt: t`What is the current density in a wire ${d} mm in diameter carrying ${I} A? Give it in A/mm².`,
          answer: I / A, units: 'A/mm^2', tol: { rel: 0.01 },
          errors: apart([{ value: I / (Math.PI * d * d), feedback: t`Use the radius, $d/2$: $A = \pi(d/2)^2$.` }, { value: I * A, feedback: 'Current density is current divided by area.' }], I / A),
          hints: [t`$J = I/A$ with $A = \pi(d/2)^2$, here in mm².`],
          teach: 'Current density is current per unit cross-sectional area, J = I/A.',
          explain: t`$A = \pi(${d / 2}\ \text{mm})^2 = ${nice(sf(A))}$ mm², so $J = ${I}/${nice(sf(A))} = ${nice(sf(I / A))}$ A/mm². Wiring is sized to keep $J$ to a few A/mm²; much more and the wire overheats.`,
          visual: wirePicture({ caption: `The wire carrying ${I} A through every cross-section. Not to scale.` }),
        };
      },
    }),
    num({
      id: 'pulse', difficulty: 2,
      gen(r) {
        const I0 = r.pick([2, 3, 4]), flat = r.pick([6, 8, 10]);
        const rise = 2, fall = 4, t3 = rise + flat + fall;
        const Q = I0 * (flat + rise / 2 + fall / 2);     // mC
        return {
          prompt: t`The graph shows the current through a solenoid valve while it is pulsed: it rises to ${I0} A over ${rise} ms, stays there for ${flat} ms, then falls to zero over ${fall} ms. How much charge flows through the coil?`,
          answer: Q, units: 'mC', tol: { rel: 0.01 },
          errors: apart([{ value: I0 * t3, feedback: 'The current is not at its peak the whole time: the ramps count only half.' }, { value: I0 * flat, feedback: 'The ramps carry charge too: add the two triangles.' }], Q),
          hints: [t`Charge is the area under the $I$–$t$ graph: $Q = \int I\,dt$.`, 'Split it into two triangles and a rectangle; A × ms gives mC.'],
          teach: t`The charge that flows is the area under the current–time graph, $Q = \int I\,dt$.`,
          explain: t`Rectangle: $${I0}\times${flat} = ${I0 * flat}$ mC. Triangles: $\tfrac12(${I0})(${rise}) + \tfrac12(${I0})(${fall}) = ${I0 * (rise + fall) / 2}$ mC. Total $${nice(Q)}$ mC.`,
          visual: pulse(I0, rise, t3, fall, 'The current through the coil during one pulse. The shaded area is the charge that flows.'),
        };
      },
    }),
    mcq({
      id: 'through-across', difficulty: 2,
      prompt: t`Which sentence describes the bulb correctly?`,
      choices: [
        'A current flows through the bulb; there is a voltage across it',
        'A voltage flows through the bulb and is used up there',
        'A current is across the bulb; the voltage flows through it',
        'The current is used up in the bulb, leaving only voltage',
      ],
      answer: 0,
      why: {
        1: 'Voltage is a difference of potential between two points; it does not flow anywhere, and nothing about it is used up.',
        2: 'Current is a flow, through a cross-section; voltage is a difference, between two points.',
        3: 'The same current leaves the bulb as enters it; what the bulb takes is energy.',
      },
      hints: ['Which meter goes in the path of the charge, and which goes from one side of the bulb to the other?'],
      teach: 'Current flows through an element; a voltage (potential difference) is between its two ends.',
      explain: t`The ammeter sits in the loop because current flows *through* things; the voltmeter is connected to both ends of the bulb because voltage is *across* — a difference of potential, like a difference in height. Saying “voltage flows” is like saying “altitude flows down a river”.`,
      visual: circuit('single', { opts: { amm: true, volt: true, lamp: true }, values: { E: 12, R1: 24 }, glow: false, caption: 'A bulb with an ammeter in the loop and a voltmeter connected across the bulb.' }),
    }),
    mcq({
      id: 'electrons-way', difficulty: 2,
      prompt: t`The gold arrows show the direction of the (conventional) current. Which way do the free electrons in the copper wires move?`,
      choices: [
        'Against the arrows: out of the battery’s negative terminal, round the loop, into its positive terminal',
        'Along the arrows',
        'Back and forth, with no net motion',
        'They do not move; only the field travels round the loop',
      ],
      answer: 0,
      why: {
        1: 'The arrows show conventional current: the way positive charge would move. Electrons are negative, so they drift the opposite way.',
        2: 'That is true of alternating current. A battery drives a steady drift one way round.',
        3: 'The field arrives first, but then every free electron drifts — slowly — round the loop.',
      },
      hints: ['Conventional current is defined as the direction positive charge would move.', 'Electrons are negative.'],
      teach: 'Conventional current points the way positive charge would move; in metals the electrons actually drift the opposite way, with the same effect.',
      explain: t`Electrons drift from the negative terminal round the external circuit to the positive one, against the arrows. Negative charge moving one way carries the same current as positive charge moving the other way, so every circuit result is the same either way — Franklin simply picked the sign before electrons were known.`,
      visual: circuit('single', { values: { E: 12, R1: 6 }, show: { I: true }, caption: 'Arrows show the conventional current, from the battery’s + terminal round the circuit to its − terminal.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-igniter', difficulty: 2, transfer: true,
      gen(r) {
        const I = r.pick([3.5, 5]), dt = r.pick([10, 20, 50]);     // A, ms
        const N = (I * dt * 1e-3) / E_CHARGE;
        return {
          prompt: t`A pyrotechnic igniter is fired by a ${I} A pulse lasting ${dt} ms through its bridgewire. How many electrons pass through the bridgewire?`,
          answer: N, tol: { rel: 0.01 },
          errors: [{ value: I * dt * 1e-3, feedback: 'That is the charge in coulombs. Divide by the charge of one electron.' }],
          hints: [t`$Q = I\,\Delta t$, then $N = Q/e$.`],
          teach: 'The charge in a steady pulse is current times duration; dividing by e counts the electrons.',
          explain: t`$Q = (${I})(${dt}\times10^{-3}) = ${nice(sf(I * dt * 1e-3))}$ C, so $N = Q/e = ${tex(N)}$ electrons. The bridgewire heats because each of those electrons drops through the voltage across it; none of them is used up.`,
          visual: pulse(I, 0.0001 * dt, dt, 0.0001 * dt, `The firing pulse: ${I} A for ${dt} ms. The shaded area is the charge.`),
        };
      },
    }),
    num({
      id: 'cp-drift-time', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([2.5, 4, 6]), I = r.pick([20, 30, 40]), L = r.pick([1, 1.5, 2]);    // mm², A, m
        const v = I / (N_CU * E_CHARGE * A * 1e-6), T = L / v;
        return {
          prompt: t`A satellite’s main power cable has a copper conductor of ${A} mm² cross-section and carries ${I} A from the battery to a ${L} m distant distribution box. How long would one electron take to drift that far? Give your answer in minutes. (Copper: $8.49\times10^{28}$ free electrons per m³.)`,
          answer: T / 60, units: 'min', tol: { rel: 0.01 },
          errors: apart([{ value: T, feedback: 'That is in seconds; the question asks for minutes.' }], T / 60),
          hints: [t`First the drift speed, $v_d = I/(neA)$, with $A$ in m².`, t`Then $t = L/v_d$; convert seconds to minutes.`],
          teach: 'Electrons drift so slowly that crossing even a metre of cable takes many minutes.',
          explain: t`$v_d = \dfrac{${I}}{(8.49\times10^{28})(1.602\times10^{-19})(${A}\times10^{-6})} = ${tex(v)}$ m/s, so $t = ${L}/${tex(v)} = ${nice(sf(T, 3))}$ s $\approx ${nice(sf(T / 60, 2))}$ minutes. Power still reaches the box at once: the energy travels in the fields around the cable, not with the electrons.`,
          visual: wirePicture({ caption: 'The conductor inside the cable. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'cp-return', difficulty: 2,
      prompt: t`A 28 V bus feeds a heater through a supply wire and a return wire. An ammeter in the supply wire reads 10.0 A. What does an ammeter in the return wire read?`,
      choices: ['10.0 A', 'A little less than 10.0 A: the heater uses some', 'Zero: the heater uses the current to make heat', 'It depends on the heater’s power'],
      answer: 0,
      why: {
        1: 'The heater converts electrical energy to heat, but every coulomb that goes in comes out.',
        2: 'Then charge would be piling up in the heater at 10 coulombs every second.',
        3: 'Whatever the power, the current is the same all round a single loop.',
      },
      hints: ['Is there any other path the charge could take?'],
      teach: 'In a single loop the current going out on the supply wire is the current coming back on the return wire.',
      explain: t`The supply and return wires are in the same loop as the heater, so both carry 10.0 A. The heater’s 280 W comes from each coulomb dropping through 28 V, not from losing charge.`,
      visual: circuit('series', { opts: { n: 2, amm: true }, values: { E: 28, R1: 0.2, R2: 2.6 }, names: { R1: 'wiring', R2: 'heater' }, hide: ['A2'], caption: 'The heater (right) on the bus, with ammeters in the supply and return wires.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §9.1 Electrical Current and §9.2 Model of Conduction in Metals', url: 'https://openstax.org/books/university-physics-volume-2/pages/9-1-electrical-current' },
    { label: 'McDermott & Shaffer (1992), Am. J. Phys. 60, 994 — students’ ideas of current being “used up”', url: 'https://www.compadre.org/portal/items/detail.cfm?ID=2722' },
  ],
});
