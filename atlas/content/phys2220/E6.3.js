// Power in circuits: P = IV = I²R = V²/R. A battery's emf gives each coulomb
// energy ℰ; its internal resistance r wastes I²r, so the terminal voltage is
// ℰ − Ir and the load gets ℰI − I²r. Which form of the power law to use
// depends on what is shared: I in series, V in parallel.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { sf, apart, circuit } from './_circuits.js';

const t = String.raw;

export default lesson({
  id: 'phys2220.E6.3',
  title: 'Power in circuits',
  minutes: 11, difficulty: 2,
  intro: t`A battery is an energy pump: every coulomb that passes through it from − to + gains an energy $\mathcal{E}$, the **emf** (1 V = 1 J/C). Every coulomb that passes through a resistor drops through a potential difference $V$ and gives up that energy as heat — or, in a filament, as heat and light. **Power** is energy per second, so multiplying joules per coulomb by coulombs per second gives watts: $P = IV$. For a resistor, Ohm’s law turns this into $I^2R$ (handy when the current is known) or $V^2/R$ (when the voltage is). A real battery also has an **internal resistance** $r$: a current $I$ wastes $I^2r$ inside it, and the voltage at its terminals sags to $V = \mathcal{E} - Ir$ — which is why a car’s headlights dim while the starter motor cranks.`,
  equation: t`P = IV = I^2R = \frac{V^2}{R}`,
  symbols: [
    { tex: 'P', text: 'power: energy converted per second, in watts (1 W = 1 J/s)' },
    { tex: 'I', text: 'the current through the element, in A' },
    { tex: 'V', text: 'the potential difference across it, in V' },
    { tex: 'R', text: 'its resistance, in Ω' },
    { tex: '\\mathcal{E}', text: 'the emf of a battery: the energy it gives each coulomb, in volts' },
    { tex: 'r', text: 'the battery’s internal resistance, in Ω; the terminal voltage is $\\mathcal{E} - Ir$' },
  ],
  why: 'Power sets what wires, batteries and heaters must survive: a spacecraft’s power budget, the heat in its harness, and the current that fires a bridgewire all come from P = IV.',
  visual: {
    type: 'em-circuit',
    title: 'A battery, its internal resistance and a bulb',
    lead: t`A real battery — an ideal emf in series with an internal resistance $r$ inside the dashed box — lights a bulb. The labels give each part’s power; the readout gives the voltage at the battery’s terminals.`,
    tasks: [
      'Lower the bulb’s resistance: the current rises, the terminal voltage sags, and more of the battery’s power is wasted as I²r.',
      'Hunt for the brightest bulb: it comes when the bulb’s resistance equals r.',
      'Set r to zero: the terminal voltage stays at the full emf whatever the bulb.',
    ],
    params: { circuit: 'single', opts: { lamp: true }, values: { E: 12, r: 1, R1: 6 }, sliders: [{ key: 'R1', min: 0.2, max: 12, step: 0.1, label: 'Bulb resistance $R$' }, { key: 'r', min: 0, max: 4, step: 0.1 }], show: { I: true, P: true } },
  },
  example: {
    prompt: t`A battery with emf 12.0 V and internal resistance 0.50 Ω drives a 5.5 Ω load. Find the current, the terminal voltage, the power delivered to the load, the power wasted inside the battery, and the efficiency.`,
    visual: circuit('single', { values: { E: 12, r: 0.5, R1: 5.5 }, names: { R1: 'load' }, caption: 'The battery as an ideal emf in series with its internal resistance (dashed box), driving the load.' }),
    steps: [
      { label: 'Current', text: t`The loop has $R + r = 6.0\ \Omega$ in all: $I = \dfrac{\mathcal{E}}{R + r} = \dfrac{12.0}{6.0} = 2.0$ A.` },
      { label: 'Terminal voltage', text: t`$V = \mathcal{E} - Ir = 12.0 - (2.0)(0.50) = 11.0$ V — which is also $IR = (2.0)(5.5)$. ✓` },
      { label: 'Powers', text: t`Load: $I^2R = (2.0)^2(5.5) = 22$ W. Inside the battery: $I^2r = (2.0)^2(0.50) = 2.0$ W. The emf supplies $\mathcal{E}I = 24$ W $= 22 + 2.0$. ✓` },
      { label: 'Efficiency', text: t`$22/24 = 92\%$ of the battery’s energy reaches the load.` },
    ],
    answer: t`$I = 2.0$ A, $V = 11.0$ V, $P_\text{load} = 22$ W, $P_r = 2.0$ W, efficiency 92%.`,
  },
  practice: [
    num({
      id: 'heater', difficulty: 1,
      gen(r) {
        const V = r.pick([12, 24, 28, 120]), R = r.pick([4, 8, 12, 48]);
        return {
          prompt: t`A ${R} Ω heater runs from a ${V} V supply. What power does it dissipate?`,
          answer: (V * V) / R, units: 'W', tol: { rel: 0.005 },
          errors: apart([{ value: V / R, feedback: t`That is the current. Power is $V^2/R$ (or $IV$).` }, { value: (V * V) / R / 2, feedback: t`No factor of ½ here: $P = V^2/R$.` }], (V * V) / R),
          hints: [t`With $V$ and $R$ known, $P = V^2/R$.`],
          teach: t`With the voltage across a resistor known, its power is $V^2/R$.`,
          explain: t`$P = V^2/R = ${V}^2/${R} = ${nice(sf((V * V) / R))}$ W (the current is ${nice(sf(V / R))} A, and $IV$ gives the same).`,
          visual: circuit('single', { values: { E: V, R1: R }, names: { R1: 'heater' }, caption: 'The heater on its supply (treated as ideal).' }),
        };
      },
    }),
    num({
      id: 'harness', difficulty: 2,
      gen(r) {
        const I = r.pick([5, 10, 15, 20]), Rw = r.pick([0.05, 0.1, 0.2, 0.3]);
        const P = I * I * Rw;
        return {
          prompt: t`The wiring between a battery and a motor has a total resistance of ${Rw} Ω and carries ${I} A. How much power is turned into heat in the wiring?`,
          answer: P, units: 'W', tol: { rel: 0.005 },
          errors: apart([{ value: I * Rw, feedback: t`That is the voltage dropped along the wiring. The power is $I^2R$.` }, { value: (I * I) / Rw, feedback: t`Multiply by the resistance: $P = I^2R$.` }], P),
          hints: [t`The current is known, so use $P = I^2R$.`],
          teach: t`For a known current, the power lost in a resistance is $I^2R$ — it grows with the square of the current.`,
          explain: t`$P = I^2R = (${I})^2(${Rw}) = ${nice(sf(P))}$ W. Double the current and the loss quadruples, which is why heavy loads get thick cables.`,
          visual: circuit('series', { opts: { n: 2 }, values: { E: 28, R1: Rw, R2: 28 / I - Rw }, names: { R1: 'wiring', R2: 'motor' }, hide: ['R2'], show: { I: true }, caption: 'The wiring’s resistance drawn as one resistor in series with the motor.' }),
        };
      },
    }),
    num({
      id: 'terminal', difficulty: 2,
      gen(r) {
        const E = r.pick([9, 12, 24]), rr = r.pick([0.2, 0.5, 1]), R = r.pick([2, 4, 10]);
        const I = E / (R + rr), V = E - I * rr;
        return {
          prompt: t`A battery of emf ${E} V and internal resistance ${rr} Ω is connected to a ${R} Ω resistor. What is the voltage across the battery’s terminals?`,
          answer: V, units: 'V', tol: { rel: 0.005 },
          errors: apart([{ value: E, feedback: 'That is the emf. With current flowing, some of it is lost across the internal resistance.' }, { value: E - (E / R) * rr, feedback: t`The current is $\mathcal{E}/(R + r)$, not $\mathcal{E}/R$: the internal resistance is in the loop too.` }], V),
          hints: [t`First the current: $I = \mathcal{E}/(R + r)$.`, t`Then $V = \mathcal{E} - Ir$ (or $IR$).`],
          teach: t`A battery’s terminal voltage is its emf minus the drop across its internal resistance, $\mathcal{E} - Ir$.`,
          explain: t`$I = ${E}/(${R} + ${rr}) = ${nice(sf(I))}$ A, so $V = ${E} - (${nice(sf(I))})(${rr}) = ${nice(sf(V))}$ V $= IR$. ✓`,
          visual: circuit('single', { values: { E, r: rr, R1: R }, caption: 'The battery: an ideal emf and its internal resistance inside the dashed box.' }),
        };
      },
    }),
    mcq({
      id: 'two-bulbs', difficulty: 2,
      prompt: t`A single bulb on an ideal battery glows normally. A second, identical bulb is added in series with it. What is the power of each bulb now, compared with the single bulb before?`,
      choices: ['A quarter', 'A half', 'The same', 'Double'],
      answer: 0,
      why: {
        1: 'Halving would be right if the voltage stayed the same; it halves too.',
        2: 'Each bulb now gets only half the battery’s voltage.',
        3: 'Two in series double the resistance; the current falls.',
      },
      hints: ['In series the resistance doubles, so the current halves.', t`$P = I^2R$ for each bulb.`],
      teach: t`Two equal bulbs in series each get half the voltage and half the current, so a quarter of the power: $P = I^2R$.`,
      explain: t`The current halves (twice the resistance), so each bulb’s $I^2R$ falls to $\left(\tfrac12\right)^2 = \tfrac14$. Together they use half the power of the single bulb — and both glow dimly. (Real filaments are cooler and lower in resistance when dim, so the fall is a little less than this ohmic estimate.)`,
      visual: circuit('series', { opts: { n: 2, lamp: true }, values: { E: 12, R1: 12, R2: 12 }, glow: false, caption: 'Two identical bulbs in series on the battery.' }),
    }),
    num({
      id: 'energy', difficulty: 2,
      gen(r) {
        const V = r.pick([12, 28]), I = r.pick([1.5, 2, 3, 4]), h = r.pick([0.5, 2, 6]);
        const E = V * I * h;    // Wh
        return {
          prompt: t`A heater on a ${V} V bus draws ${I} A for ${h} hours. How much energy does it use, in watt-hours?`,
          answer: E, units: 'Wh', tol: { rel: 0.005 },
          errors: apart([{ value: V * I, feedback: 'That is the power in watts. Multiply by the time in hours.' }, { value: V * I * h * 3600, feedback: 'That is in joules (W·s); the question asks for watt-hours.' }], E),
          hints: [t`$P = IV$, then energy $= Pt$.`],
          teach: 'Energy is power times time; a watt-hour is 3600 J.',
          explain: t`$P = (${V})(${I}) = ${nice(V * I)}$ W, and over ${h} h that is $${nice(E)}$ Wh $= ${nice(sf(E * 3.6))}$ kJ.`,
          visual: {
            type: 'graph',
            params: { x: [0, h * 1.25], y: [0, V * I * 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 't (h)', ylabel: 'P (W)',
              curves: [{ fn: `${V * I}*step(${h} - x)`, color: 'gold', domain: [0, h * 1.25] }],
              shade: [{ fn: `${V * I}`, from: 0, to: h, color: 'gold', alpha: 0.25 }] },
            caption: 'The heater’s power while it runs. The shaded area — power × time — is the energy.',
          },
        };
      },
    }),
    num({
      id: 'max-power', difficulty: 3,
      gen(r) {
        const E = r.pick([1.5, 9, 12, 24]), rr = r.pick([0.1, 0.5, 2]);
        return {
          prompt: t`A battery of emf ${E} V has an internal resistance of ${rr} Ω. What is the largest power it can deliver to any external load?`,
          answer: (E * E) / (4 * rr), units: 'W', tol: { rel: 0.005 },
          errors: [{ value: (E * E) / rr, feedback: t`That is the power with the terminals shorted — and it is all wasted inside the battery. The load gets the most when $R = r$.` }, { value: (E * E) / (2 * rr), feedback: t`At $R = r$ the current is $\mathcal{E}/2r$; square it and multiply by $r$.` }],
          hints: [t`The load gets $P = I^2R$ with $I = \mathcal{E}/(R + r)$. It is largest when $R = r$.`, t`At $R = r$: $I = \mathcal{E}/2r$, so $P = \mathcal{E}^2/4r$.`],
          teach: t`A source delivers the most power when the load matches its internal resistance, $R = r$: $P_\text{max} = \mathcal{E}^2/4r$.`,
          explain: t`$P(R) = \dfrac{\mathcal{E}^2R}{(R + r)^2}$; setting $dP/dR = 0$ gives $R = r$, and then $P = \dfrac{\mathcal{E}^2}{4r} = \dfrac{${E}^2}{4(${rr})} = ${nice(sf((E * E) / (4 * rr)))}$ W. The efficiency there is only 50%: maximum power and maximum efficiency are different goals.`,
          visual: circuit('single', { values: { E, r: rr, R1: rr }, names: { R1: 'load' }, hide: ['R1'], caption: 'The battery and its internal resistance driving a load of adjustable resistance.' }),
        };
      },
    }),
    mcq({
      id: 'which-hotter', difficulty: 3,
      prompt: t`A 4 Ω and a 12 Ω resistor are connected in parallel across a 12 V battery. Which one dissipates more power?`,
      choices: ['The 4 Ω resistor', 'The 12 Ω resistor: P = I²R grows with R', 'Both the same: they share the voltage', 'Neither: in parallel no power is dissipated'],
      answer: 0,
      why: {
        1: t`$I^2R$ is the right formula, but in parallel the currents differ: the 4 Ω one carries three times the current. With the voltage shared, $V^2/R$ is the direct route.`,
        2: 'They share the voltage, but they carry different currents, so their powers differ.',
        3: 'Every resistor with current through it dissipates power.',
      },
      hints: ['In parallel, which quantity is the same for both resistors?', t`Same $V$: compare $V^2/R$.`],
      teach: t`Pick the power formula by what is shared: in parallel the voltage is common, so the smaller resistor takes more power ($V^2/R$); in series the current is common, so the larger one does ($I^2R$).`,
      explain: t`Both have 12 V across them. The 4 Ω resistor: $12^2/4 = 36$ W; the 12 Ω one: $12^2/12 = 12$ W. In series the ranking would reverse, because then they share the current.`,
      visual: circuit('parallel', { opts: { n: 2 }, values: { E: 12, R1: 4, R2: 12 }, caption: 'The two resistors in parallel across the battery.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bus', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([15, 20, 25]), rr = r.pick([0.05, 0.1]), Rh = r.pick([0.1, 0.15, 0.2]);
        const V = 28 - I * (rr + Rh);
        return {
          prompt: t`A spacecraft’s 28 V battery (internal resistance ${rr} Ω) feeds a payload through a harness of total resistance ${Rh} Ω. When the payload draws ${I} A, what voltage reaches the payload?`,
          answer: V, units: 'V', tol: { rel: 0.003 },
          errors: apart([{ value: 28 - I * rr, feedback: 'That is the battery’s terminal voltage; the harness drops some more on the way.' }, { value: 28 - I * Rh, feedback: 'The battery’s internal resistance drops voltage too.' }], V),
          hints: ['The battery’s internal resistance, the harness and the payload are all in series: one current.', t`Each resistance in the path drops $IR$: $V_\text{payload} = \mathcal{E} - I(r + R_\text{h})$.`],
          teach: 'Every resistance between the source and the load drops IR, so heavy currents arrive at a lower voltage.',
          explain: t`$V = 28 - ${I}(${rr} + ${Rh}) = ${nice(sf(V))}$ V. The lost ${nice(sf(I * (rr + Rh)))} V is $${nice(sf(I * I * (rr + Rh)))}$ W of heat in the battery and harness — power the spacecraft must generate, and heat it must reject. Power systems specify the minimum bus voltage at the loads for exactly this reason.`,
          visual: circuit('series', { opts: { n: 2 }, values: { E: 28, r: rr, R1: Rh, R2: 28 / I - rr - Rh }, names: { R1: 'harness', R2: 'payload' }, hide: ['R2'], caption: 'The battery (with its internal resistance), the harness and the payload, all in one loop.' }),
        };
      },
    }),
    num({
      id: 'cp-bridgewire', difficulty: 2, transfer: true,
      gen(r) {
        const R = r.pick([0.9, 1.0, 1.1]), I = r.pick([3.5, 4, 5]);
        return {
          prompt: t`A pyrotechnic igniter’s bridgewire has a resistance of ${R} Ω and fires reliably at ${I} A. What power does that current dissipate in the bridgewire?`,
          answer: I * I * R, units: 'W', tol: { rel: 0.005 },
          errors: apart([{ value: I * R, feedback: t`That is the voltage across it. Power is $I^2R$.` }], I * I * R),
          hints: [t`The current is known: $P = I^2R$.`],
          teach: t`The heating power in a resistor carrying a known current is $I^2R$.`,
          explain: t`$P = (${I})^2(${R}) = ${nice(sf(I * I * R))}$ W, concentrated in a wire thinner than a hair, which heats past the ignition temperature of the pyrotechnic charge around it within milliseconds. Igniters are also rated to survive a smaller no-fire current — typically 1 A, about 1 W here — so that stray currents cannot fire them.`,
          visual: circuit('single', { values: { E: I * (R + 0.2), r: 0.2, R1: R }, names: { R1: 'bridgewire' }, show: { I: true }, caption: 'The firing circuit simplified: a supply with its internal resistance driving the bridgewire.' }),
        };
      },
    }),
    mcq({
      id: 'cp-parallel', difficulty: 2,
      prompt: t`A bulb is connected across an ideal battery. An identical second bulb is connected in parallel with it. What happens to the first bulb’s brightness, and to the total power drawn from the battery?`,
      choices: [
        'The first bulb is unchanged; the total power doubles',
        'Both bulbs are half as bright; the total power is unchanged',
        'The first bulb dims; the total power halves',
        'The first bulb brightens; the total power doubles',
      ],
      answer: 0,
      why: {
        1: 'That treats the battery as a fixed supply of power (or current). An ideal battery holds its voltage, so each bulb still has the full voltage.',
        2: 'In parallel the first bulb still has the full voltage, so it does not dim; the total power goes up.',
        3: 'Its voltage and current are unchanged, so its power is unchanged.',
      },
      hints: ['Does adding the second bulb change the voltage across the first?'],
      teach: 'Parallel loads on an ideal source each get the full voltage, so adding one does not affect the others; the source just supplies more current.',
      explain: t`Each bulb has the full battery voltage across it, so the first bulb is exactly as bright as before; the battery now supplies twice the current and twice the power. With a real battery, its internal resistance makes the terminal voltage sag a little, so both would be slightly dimmer.`,
      visual: circuit('parallel', { opts: { n: 2, lamp: true, bsw: true }, values: { E: 12, R1: 12, R2: 12 }, switches: { S2: false }, glow: false, caption: 'Two identical bulbs on parallel branches; the second branch’s switch is about to close.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §9.5 Electrical Energy and Power and §10.1 Electromotive Force', url: 'https://openstax.org/books/university-physics-volume-2/pages/9-5-electrical-energy-and-power' },
  ],
});
