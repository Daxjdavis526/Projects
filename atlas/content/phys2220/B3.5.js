// Generators and transformers: a coil turned in a field makes a sinusoidal
// emf NBAω sin ωt; two coils sharing one changing flux transform voltages in
// the ratio of their turns. A running motor is a generator too: its back emf
// limits its current.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, r6 } from './_magnet.js';

const t = String.raw;
const PI = Math.PI;
const omega = (rpm) => (2 * PI * rpm) / 60;

// ─── pictures ───────────────────────────────────────────────────────────────
/** The coil between the poles, still, at angle θ (degrees) from facing the field squarely. */
const genStill = (deg, caption, extra = {}) => ({
  type: 'em-generator',
  params: { mode: 'generator', angle: deg, play: false, graph: false, readouts: [], arrows: ['B', 'mu', 'I'], ...extra },
  caption,
});
/** An ideal transformer, Np and Ns turns, still; no graphs or readouts unless asked. */
const xfPic = ({ Np, Ns, Vp = 230, f = 50, RL = 10, source = 'ac', graphs = [], labels = true, caption }) => ({
  type: 'em-faraday',
  params: { mode: 'transformer', Np, Ns, Vp, f, RL, source, play: false, graphs, readouts: [], labels },
  caption,
});

// the worked example: 250 turns, 12 cm × 10 cm, 0.30 T, 3000 rpm
const EX = { N: 250, a: 0.12, b: 0.1, B: 0.3, rpm: 3000 };
EX.A = EX.a * EX.b; EX.w = omega(EX.rpm); EX.f = EX.rpm / 60; EX.e0 = EX.N * EX.B * EX.A * EX.w; EX.rms = EX.e0 / Math.SQRT2; EX.e30 = EX.e0 * Math.sin(PI / 6);

export default lesson({
  id: 'phys2220.B3.5',
  title: 'Generators and transformers',
  minutes: 15, difficulty: 2,
  intro: t`Turn a coil of $N$ turns steadily in a magnetic field and the flux through it, $NBA\cos\omega t$, rises and falls, so Faraday’s law gives an emf that swings back and forth — alternating current:

$$\mathcal{E} = NBA\omega\sin\omega t, \qquad \frac{V_s}{V_p} = \frac{N_s}{N_p}$$

The emf peaks at $NBA\omega$ when the coil’s plane lies *along* the field — when the flux through it is zero but changing fastest. Wind two coils on one iron core and you have a **transformer**: an alternating current in the primary ($N_p$ turns) makes a changing flux that threads the secondary ($N_s$ turns) too. Every turn of either coil has the same emf, so the voltages are in the ratio of the turns (the second equation, for an ideal transformer). Power in equals power out, so stepping the voltage up steps the current down. A transformer needs the flux to *change*: on steady DC it does nothing.`,
  symbols: [
    { tex: '\\mathcal{E}', text: 'the generator’s emf, in V' },
    { tex: 'N', text: 'the number of turns on the generator’s coil' },
    { tex: 'A', text: 'the area of the coil, in m²' },
    { tex: '\\omega', text: 'the angular speed, in rad/s: $\\omega = 2\\pi f$, and $f$ in revolutions per second is the rpm divided by 60' },
    { tex: 'V_p, V_s', text: 'the voltages across the primary and secondary windings (both rms, or both peak)' },
    { tex: 'N_p, N_s', text: 'the numbers of turns on the primary and secondary windings' },
  ],
  why: 'Nearly all the world’s electricity comes from coils turning in magnetic fields, and it reaches you through a chain of transformers — stepped up to hundreds of kilovolts to cross the country with little loss, and down again for your wall socket and every charger plugged into it.',
  visual: {
    type: 'em-generator',
    title: 'A coil turning in a field',
    lead: t`A coil of $N$ turns turns between the poles of a magnet. Below: the flux linkage $N\Phi$ through it and the emf at its brushes, with a cursor at the present moment.`,
    tasks: [
      'Watch the coil and the emf graph together: the emf peaks when the coil lies edge-on to the field — when the flux through it is zero but changing fastest.',
      'When the coil faces the field squarely, the flux is greatest and the emf is zero.',
      'Double the turning rate: the peak emf doubles and so does the frequency.',
      'Switch to a split-ring commutator: the output no longer reverses — pulsing DC, as from a simple dynamo.',
    ],
    params: {
      mode: 'generator', N: 100, B: 0.2, a: 0.1, b: 0.08, rpm: 3000, ringChoice: true,
      sliders: ['rpm', 'N', 'B'],
      readouts: ['peak', 'f', 'emf'], arrows: ['B', 'mu', 'I'],
    },
  },
  example: {
    prompt: t`A generator coil of 250 turns, each 12 cm by 10 cm, turns at 3000 rpm in a uniform 0.30 T field. Find (a) the frequency of its emf, (b) the peak emf, (c) the rms emf, and (d) the emf when the coil has turned 30° from facing the field squarely.`,
    visual: genStill(90, 'The coil a quarter turn from facing the field: its plane now lies along the field (teal), its normal (gold) across it — the moment the emf peaks. Blue: the induced current.', { N: EX.N, B: EX.B, a: EX.a, b: EX.b, rpm: EX.rpm }),
    steps: [
      { label: '(a) Frequency', text: t`3000 revolutions per minute is $3000/60 = ${tn(EX.f)}$ revolutions per second, and each revolution is one cycle: $f = ${tn(EX.f)}$ Hz. In radians per second, $\omega = 2\pi f = ${tn(EX.w)}$ rad/s.` },
      { label: '(b) Peak emf', text: t`$A = (0.12)(0.10) = ${tn(EX.A)}$ m², so $\mathcal{E}_0 = NBA\omega = (250)(0.30)(${tn(EX.A)})(${tn(EX.w)}) = ${tn(EX.e0)}$ V.` },
      { label: '(c) rms', text: t`For a sine wave, $\mathcal{E}_{\text{rms}} = \mathcal{E}_0/\sqrt2 = ${tn(EX.rms)}$ V — this coil would make roughly 200 V, 50 Hz mains.` },
      { label: '(d) At 30°', text: t`With $\theta = \omega t$ measured from facing the field, $\mathcal{E} = \mathcal{E}_0\sin 30^\circ = ${tn(EX.e30)}$ V. At 0° it is zero; at 90°, the full ${tn(EX.e0)} V.` },
      { label: 'Sense check', text: 'The emf grows with every factor in NBAω: more turns, a stronger field, a bigger coil, or faster turning. Real power-station generators turn the field rather than the coil, but the physics is the same.' },
    ],
    answer: t`(a) $${tn(EX.f)}$ Hz; (b) $${tn(EX.e0)}$ V; (c) $${tn(EX.rms)}$ V; (d) $${tn(EX.e30)}$ V.`,
  },
  practice: [
    num({
      id: 'peak', difficulty: 2,
      gen(r) {
        const N = r.pick([50, 120, 400]), [ac, bc] = r.pick([[10, 8], [15, 10], [20, 20]]), B = r.pick([0.1, 0.25, 0.5]), rpm = r.pick([600, 1500, 3600]);
        const A = (ac * bc) / 1e4, e0 = N * B * A * omega(rpm);
        return {
          prompt: t`A generator has a coil of ${N} turns, each ${ac} cm by ${bc} cm, turning at ${rpm} rpm in a ${B} T field. What is its peak emf?`,
          visual: genStill(40, 'The coil turning between the poles: its normal (gold) at an angle to the field (teal). Blue: the induced current.'),
          answer: e0, units: 'V', tol: { rel: 0.01 },
          errors: [
            { value: N * B * A * rpm, feedback: t`Convert the turning rate to rad/s: $\omega = 2\pi\times\text{rpm}/60$.` },
            { value: (N * B * A * rpm) / 60, feedback: t`That uses revolutions per second. One revolution is $2\pi$ radians: $\omega = 2\pi f$.` },
            { value: e0 / Math.SQRT2, feedback: 'That is the rms value. The peak is NBAω.' },
            { value: e0 / N, feedback: 'Every turn adds its own emf: multiply by N.' },
          ],
          hints: [t`$\mathcal{E}_0 = NBA\omega$, with $\omega = 2\pi\times(\text{rpm}/60)$ and $A$ in m².`, t`$\omega = 2\pi(${rpm}/60) = ${tn(omega(rpm))}$ rad/s; $A = ${tn(A)}$ m².`],
          teach: 'A coil turning at ω in a field B has peak emf NBAω, with ω in radians per second.',
          explain: t`$\omega = ${tn(omega(rpm))}$ rad/s and $A = ${tn(A)}$ m², so $\mathcal{E}_0 = (${N})(${B})(${tn(A)})(${tn(omega(rpm))}) = ${tn(e0)}$ V.`,
        };
      },
    }),
    mcq({
      id: 'max-flux', difficulty: 2,
      prompt: 'A generator’s coil is turning steadily. At the instant shown it faces the field squarely, so the flux through it is at its greatest. What is the emf at this instant?',
      visual: genStill(0, 'The coil at the instant it faces the field squarely: its normal (gold) along the field (teal), the most flux through it.', { arrows: ['B', 'mu'] }),
      choices: ['Zero: the flux is momentarily not changing', 'At its peak: the flux is greatest', 'Half its peak', 'At its peak, but negative'],
      answer: 0,
      why: {
        1: 'The emf depends on how fast the flux changes, not on how much there is. At its maximum the flux stops rising and is about to fall: its rate of change is zero.',
        2: t`$\mathcal{E} = \mathcal{E}_0\sin\theta$ is zero at $\theta = 0$, not half.`,
        3: 'The emf peaks (with either sign) a quarter turn later, when the coil lies edge-on to the field and the flux through it is zero.',
      },
      hints: [t`Faraday’s law: the emf is $-N\,d\Phi_B/dt$. How fast is $\Phi_B = BA\cos\theta$ changing at $\theta = 0$?`],
      teach: 'A generator’s emf is zero when the flux through its coil is greatest, and greatest when the flux is zero.',
      explain: t`$\Phi_B = BA\cos\omega t$ is at a peak here, and at a peak a graph is momentarily flat: $d\Phi_B/dt = 0$, so $\mathcal{E} = 0$. A quarter turn later the coil lies along the field: no flux through it, but the flux changes fastest, and the emf is $NBA\omega$.`,
    }),
    num({
      id: 'ratio', difficulty: 1,
      gen(r) {
        const [Vp, Np, Ns] = r.pick([[230, 1150, 60], [120, 600, 3000], [230, 920, 48], [480, 1200, 300], [120, 240, 4800]]);
        const Vs = (Vp * Ns) / Np;
        return {
          prompt: t`An ideal transformer has ${Np} turns on its primary and ${Ns} on its secondary. The primary is connected to ${Vp} V AC. What is the voltage across the secondary?`,
          visual: xfPic({ Np, Ns, Vp, caption: `The transformer: ${Np} turns on the primary (left, fed by the supply), ${Ns} on the secondary (right, feeding the load). Fewer turns are drawn than the real ones, in proportion.` }),
          answer: Vs, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: (Vp * Np) / Ns, feedback: t`The ratio is the other way up: $V_s/V_p = N_s/N_p$ — the winding with more turns has the higher voltage.` }],
          hints: [t`$\dfrac{V_s}{V_p} = \dfrac{N_s}{N_p}$.`],
          teach: 'An ideal transformer’s voltages are in the ratio of its turns: the side with more turns has the higher voltage.',
          explain: t`$V_s = V_p\dfrac{N_s}{N_p} = (${Vp})\dfrac{${Ns}}{${Np}} = ${tn(Vs)}$ V — a step-${Ns > Np ? 'up' : 'down'} transformer. Each turn on either winding has the same emf, $d\Phi_B/dt$, because the same flux runs through them all.`,
        };
      },
    }),
    num({
      id: 'neon', difficulty: 2,
      gen(r) {
        const Vp = r.pick([120, 230]), Vs = r.pick([2400, 6000, 9000]), ImA = r.pick([15, 20, 30]);
        const Ip = ((ImA / 1000) * Vs) / Vp;
        return {
          prompt: t`A neon sign’s transformer steps ${Vp} V up to ${Vs} V, and the sign draws ${ImA} mA. Treating the transformer as ideal, what current does it draw from the ${Vp} V supply?`,
          visual: xfPic({ Np: 100, Ns: Math.round((100 * Vs) / Vp), Vp, labels: false, caption: 'A step-up transformer: the supply feeds the primary (left), with few turns; the secondary (right), with many, feeds the sign. Schematic.' }),
          answer: Ip, units: 'A', tol: { rel: 0.01 },
          errors: [
            { value: ((ImA / 1000) * Vp) / Vs, feedback: 'Stepping the voltage up steps the current down — so the primary, at the lower voltage, carries the larger current.' },
            { value: ImA / 1000, feedback: 'The two windings carry different currents: power in equals power out, VₚIₚ = VₛIₛ.' },
          ],
          hints: ['For an ideal transformer the power in equals the power out.', t`$V_pI_p = V_sI_s$, so $I_p = I_s\,V_s/V_p$.`],
          teach: 'In an ideal transformer VₚIₚ = VₛIₛ: stepping the voltage up steps the current down by the same factor.',
          explain: t`$I_p = I_s\dfrac{V_s}{V_p} = (${ImA / 1000})\dfrac{${Vs}}{${Vp}} = ${tn(Ip)}$ A. The power is the same on both sides: ${tn((ImA / 1000) * Vs)} W.`,
        };
      },
    }),
    mcq({
      id: 'dc', difficulty: 2,
      prompt: 'A transformer’s primary is connected to a 12 V battery instead of an AC supply. What appears across its secondary?',
      visual: xfPic({ Np: 400, Ns: 800, Vp: 12, source: 'dc', graphs: ['vp'], caption: 'The transformer switched onto a battery at t = 0: the graph is the steady 12 V across the primary.' }),
      choices: [
        'A brief pulse as it is switched on, then nothing',
        'A steady voltage in the ratio of the turns, as with AC',
        'A steady voltage, reduced by the resistance of the windings',
        'An alternating voltage at the transformer’s own frequency',
      ],
      answer: 0,
      why: {
        1: 'The turns ratio holds for the emfs, and those need a changing flux. A steady current makes a steady flux, which induces nothing.',
        2: 'No steady voltage appears at all: the secondary’s emf is N d Φ/dt, and Φ stops changing once the current settles.',
        3: 'A transformer has no frequency of its own: it follows the supply’s. With DC there is nothing to follow.',
      },
      hints: ['What does the secondary’s emf depend on: the flux, or its rate of change?'],
      teach: 'Transformers work only while the flux changes: on DC they give a pulse at switch-on and nothing after.',
      explain: t`While the primary current builds up after switch-on, the core’s flux grows and the secondary gets a pulse; once the current settles, the flux is steady and $\mathcal{E}_s = -N_s\,d\Phi_B/dt = 0$. (Meanwhile the primary, now just a coil of wire on a battery, draws a large steady current that can burn it out.)`,
    }),
    num({
      id: 'back-emf', difficulty: 3,
      gen(r) {
        const V = r.pick([12, 24, 48]), R = r.pick([0.2, 0.5, 1.0]), frac = r.pick([0.8, 0.9, 0.95]);
        const eb = r6(V * frac), I = (V - eb) / R;
        return {
          prompt: t`A DC motor’s windings have a resistance of ${R} Ω. Running at full speed on a ${V} V supply, its turning coil generates a back emf of ${eb} V. What current does it draw?`,
          visual: {
            type: 'em-generator',
            params: { mode: 'motor', angle: 60, play: false, graph: false, readouts: [], arrows: ['B', 'mu', 'F', 'I'], ring: 'split' },
            caption: 'The motor’s coil, with the forces (violet) that turn it. As it turns, the flux through it changes: it is a generator too.',
          },
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: [
            { value: V / R, feedback: 'That would be the current at the instant of starting, before the coil turns. Running, its back emf opposes the supply: I = (V − ε)/R.' },
            { value: (V + eb) / R, feedback: 'The back emf opposes the supply (Lenz’s law), so it subtracts.' },
            { value: eb / R, feedback: 'The current is driven by what is left of the supply voltage after the back emf: V − ε.' },
          ],
          hints: ['The turning coil is a generator whose emf opposes the current the supply drives through it.', t`$I = \dfrac{V - \mathcal{E}_{\text{back}}}{R}$.`],
          teach: 'A running motor’s back emf opposes its supply, so it draws only the current that the difference between the two can drive through its windings.',
          explain: t`$I = \dfrac{V - \mathcal{E}_{\text{back}}}{R} = \dfrac{${V} - ${eb}}{${R}} = ${tn(I)}$ A. At the moment it starts, with no back emf, it would draw ${tn(V / R)} A — ${tn(V / (V - eb), 2)} times as much. That surge is why big motors are started gently, and why a stalled motor overheats.`,
        };
      },
    }),
    {
      type: 'slider', id: 'set-rpm', difficulty: 2, param: 'rpm',
      instruction: 'Drag the turning-rate slider to the right value, then check.',
      gen(r) {
        const rpm = r.pick([1200, 1800, 2400, 4200, 4800]), N = 100, B = 0.2, A = 0.1 * 0.08;
        const e0 = +(N * B * A * omega(rpm)).toPrecision(3);
        return {
          prompt: t`The coil has 100 turns, each 10 cm by 8.0 cm, in a 0.20 T field. Set the turning rate so that the peak emf is ${e0} V.`,
          answer: [rpm - 90, rpm + 90],
          hints: [t`$\mathcal{E}_0 = NBA\omega$, so $\omega = \mathcal{E}_0/(NBA)$; then rpm $= 60\,\omega/(2\pi)$.`],
          teach: 'A generator’s peak emf is proportional to its turning rate.',
          explain: t`$\omega = \dfrac{${e0}}{(100)(0.20)(0.0080)} = ${tn(e0 / (100 * 0.2 * 0.008))}$ rad/s, which is $${tn((60 * e0) / (100 * 0.2 * 0.008) / (2 * PI))}$ rpm.`,
          visual: { type: 'em-generator', params: { mode: 'generator', N, B, a: 0.1, b: 0.08, rpm: 3000, sliders: ['rpm'], graph: false, readouts: [], arrows: ['B', 'mu', 'I'] }, caption: 'The coil turning between the poles (animation slowed). The readouts are hidden: work out the rate.' },
        };
      },
    },
  ],
  checkpoint: [
    num({
      id: 'cp-supply', difficulty: 3, transfer: true,
      gen(r) {
        const [Vp, Np] = r.pick([[230, 1150], [120, 600]]), Vs = r.pick([24, 28]), Is = r.pick([3, 4, 6.5]);
        const Ns = (Np * Vs) / Vp, Ip = (Is * Vs) / Vp;
        return {
          prompt: t`A test stand’s valve-driver supply uses a transformer to step ${Vp} V mains down to ${Vs} V for its solenoid valves, which draw ${Is} A in all when they are open. Treating the transformer as ideal, what current does it draw from the mains?`,
          visual: xfPic({ Np, Ns, Vp, RL: Vs / Is, caption: `The supply’s transformer: ${Np} turns on the mains side (left), ${Ns} on the valve side (right). Schematic.` }),
          answer: Ip, units: 'A', tol: { rel: 0.01 },
          errors: [
            { value: (Is * Vp) / Vs, feedback: 'Stepping the voltage down steps the current up: the high-voltage mains side carries the smaller current.' },
            { value: Is, feedback: 'The two sides carry different currents: power in = power out.' },
          ],
          hints: ['Power in equals power out for an ideal transformer.', t`$I_p = I_s\,\dfrac{V_s}{V_p}$.`],
          teach: 'A step-down transformer draws less current from the mains than it delivers to its load, in the ratio of the voltages.',
          explain: t`$I_p = I_s\dfrac{V_s}{V_p} = (${Is})\dfrac{${Vs}}{${Vp}} = ${tn(Ip)}$ A. The power, ${tn(Is * Vs)} W, is the same on both sides. A real transformer wastes a few per cent in its windings and core, and the supply then rectifies the ${Vs} V AC to DC for the valves.`,
        };
      },
    }),
    mcq({
      id: 'cp-faster', difficulty: 2,
      prompt: 'A generator is driven twice as fast. What happens to its output?',
      visual: genStill(90, 'The coil turning in the field (shown edge-on to the field, where the emf peaks).', { arrows: ['B', 'mu', 'I'] }),
      choices: ['The peak emf and the frequency both double', 'The peak emf doubles; the frequency is fixed by the field', 'The frequency doubles; the peak emf stays the same', 'The peak emf quadruples'],
      answer: 0,
      why: {
        1: 'The frequency is simply how many turns the coil makes each second: it doubles too.',
        2: t`$\mathcal{E}_0 = NBA\omega$: the flux changes twice as fast, so the peak emf doubles as well.`,
        3: t`$\mathcal{E}_0 = NBA\omega$ is proportional to $\omega$, not $\omega^2$.`,
      },
      hints: [t`$\mathcal{E} = NBA\omega\sin\omega t$: where does $\omega$ appear?`],
      teach: 'Speeding up a generator raises both its peak emf (NBAω) and its frequency (ω/2π).',
      explain: t`$\omega$ appears twice in $NBA\omega\sin\omega t$: in the amplitude and in the rate of oscillation. That is why a grid generator must hold its speed precisely — on a 50 Hz grid, at 3000 rpm for a two-pole machine.`,
    }),
    num({
      id: 'cp-400', difficulty: 2,
      gen(r) {
        const f = r.pick([400, 60, 50]), pairs = r.pick([1, 2]);
        const rpm = (60 * f) / pairs;
        return {
          prompt: t`${f === 400 ? 'Aircraft electrical systems run at 400 Hz.' : `A power grid runs at ${f} Hz.`} A generator with ${pairs === 1 ? 'one pair of poles' : 'two pairs of poles'} makes ${pairs === 1 ? 'one cycle of emf per revolution' : 'two cycles of emf per revolution'}. How fast must it turn, in rpm?`,
          visual: genStill(30, pairs === 1 ? 'A generator with one pair of poles: one cycle of emf for each revolution of its coil.' : 'For comparison, a generator with one pair of poles, which makes one cycle per revolution. With two pairs round the coil, each revolution passes two north and two south poles: two cycles.'),
          answer: rpm, units: 'rpm', tol: { rel: 0.01 },
          errors: [
            { value: f / pairs, feedback: 'That is revolutions per second. Multiply by 60 for revolutions per minute.' },
            { value: (60 * f) / pairs / (2 * PI), feedback: 'The frequency is in cycles per second, not radians per second: no 2π is needed here.' },
            ...(pairs === 2 ? [{ value: 60 * f, feedback: 'With two pairs of poles each revolution gives two cycles, so the coil need turn only half as fast.' }] : []),
          ],
          hints: [t`Cycles per second = (revolutions per second) × (cycles per revolution).`],
          teach: 'A generator’s frequency is its revolutions per second times the number of pole pairs.',
          explain: t`It needs ${f} cycles per second, at ${pairs} per revolution: ${tn(f / pairs)} revolutions per second $= ${tn(rpm)}$ rpm.${f === 400 ? ' Aircraft use 400 Hz because transformers and motors for a higher frequency can be smaller and lighter — the flux needs to change fast, not be large.' : ''}`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §13.7', url: 'https://openstax.org/books/university-physics-volume-2/pages/13-7-electric-generators-and-back-emf' },
    { label: 'OpenStax University Physics Vol. 2, §15.6 (transformers)', url: 'https://openstax.org/books/university-physics-volume-2/pages/15-6-transformers' },
  ],
});
