// Self-inductance: a coil's own field threads its own turns, so a changing
// current induces an emf in the coil itself, ε = −L dI/dt. An inductor opposes
// CHANGES in current, not current: a steady current, however large, induces
// nothing. For a long solenoid L = μ₀N²A/ℓ.
import { lesson, mcq, num } from '../../src/core/content.js';
import { MU0, tn, sf, apart, solenoidPic, currentGraph, acPic, lab } from './_maxwell.js';

const t = String.raw;

// the worked example's solenoid: 500 turns, 10.0 cm long, 2.00 cm across; 0 → 2.00 A in 5.00 ms
const EX = (() => {
  const N = 500, len = 0.1, r = 0.01, A = Math.PI * r * r, L = (MU0 * N * N * A) / len, rate = 2 / 5e-3;
  return { N, len, A, L, rate, emf: L * rate, B: (MU0 * N * 2) / len };
})();

export default lesson({
  id: 'phys2220.B4.1',
  title: 'Self-inductance',
  minutes: 11, difficulty: 2,
  intro: t`A current in a coil makes a magnetic field, and that field threads the coil’s own turns. Change the current and the flux through the coil changes — so, by Faraday’s law, the coil induces an emf **in itself**. The flux the coil links is proportional to its current, $N\Phi_B = LI$; the constant $L$ is its **inductance**, and the emf is

$$\mathcal{E}_L = -L\,\frac{dI}{dt}$$

The minus sign is Lenz’s law: the emf pushes against the **change**. So an inductor does not oppose current — a steady current, however large, induces nothing at all. It opposes changes in current. That is why a coil smooths the current in a power supply, why switching off a coil can strike a spark, and why every circuit with a coil has a time constant.`,
  symbols: [
    { tex: t`\mathcal{E}_L`, text: 'the self-induced emf, in volts (V): the voltage the coil develops across itself while its current changes' },
    { tex: 'L', text: t`the inductance, in henries (H): flux linked per ampere, $L = N\Phi_B/I$, so $1\ \text{H} = 1\ \text{Wb/A} = 1\ \text{V·s/A}$. It depends only on the coil’s shape, size, turns and core — for a long solenoid, $L = \mu_0 N^2 A/\ell$` },
    { tex: t`\frac{dI}{dt}`, text: 'the rate at which the current through the coil changes, in amperes per second (A/s)' },
    { tex: 'N', text: 'the number of turns, each threaded by the flux $\\Phi_B$' },
    { tex: t`\Phi_B`, text: 'the magnetic flux through one turn, in webers ($1\\ \\text{Wb} = 1\\ \\text{T·m}^2$)' },
    { tex: '-', text: 'Lenz’s law: the emf drives current the way that would **undo the change** — against a rising current, along a falling one' },
    { tex: t`\mu_0,\ A,\ \ell`, text: t`in the solenoid formula: $\mu_0 = 4\pi\times10^{-7}$ T·m/A, the cross-sectional area $A$ in m², and the length $\ell$ in m` },
  ],
  why: 'Inductance is electrical inertia: it is why the current in a coil cannot jump, which gives RL circuits their time constant, stores energy in magnetic fields, and — paired with a capacitor — makes circuits oscillate.',
  visual: {
    type: 'em-ac',
    title: 'Change the current and the coil answers back',
    lead: t`A supply drives a current through an ideal coil: up a ramp, steady, down, then off. The lower graph is the emf the coil induces in itself — the slope of the current graph, times $-L$. The gold arrow shows which way that emf pushes.`,
    tasks: [
      'Watch the flat stretches: a steady 2 A induces no emf at all.',
      'Halve the ramp time: the current changes twice as fast, and the emf doubles.',
      'Double L: the same current, twice the emf.',
      'Switch to the sine wave: the emf is largest where the current passes through zero.',
    ],
    params: { mode: 'coil', L: 0.5, Imax: 2, tr: 1, th: 1.5 },
  },
  example: {
    prompt: t`A solenoid 10.0 cm long and 2.00 cm in diameter has 500 turns. (a) Find its inductance. (b) Its current rises steadily from 0 to 2.00 A in 5.00 ms. What emf does it induce in itself, and which way does that emf push? ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
    visual: solenoidPic({ len: '10.0 cm', d: '2.00 cm', N: '500 turns', field: true, current: 'I', caption: 'The solenoid from the side, not to scale; the teal lines are the field inside it. Only a few of the 500 turns are drawn.' }),
    steps: [
      { label: 'Field inside', text: t`A long solenoid has a uniform field $B = \mu_0 n I$ inside, where $n = N/\ell$ is the number of turns per metre: $B = \mu_0 N I/\ell$.` },
      { label: 'Flux linked', text: t`Each turn has flux $\Phi_B = BA$, and there are $N$ turns: $N\Phi_B = \dfrac{\mu_0 N^2 A}{\ell}\,I$. The flux linked is proportional to $I$ — so $L = N\Phi_B/I = \mu_0N^2A/\ell$, which depends only on the geometry.` },
      { label: 'Inductance', text: t`$A = \pi(0.0100\ \text{m})^2 = ${tn(EX.A)}\ \text{m}^2$, so $L = \dfrac{(4\pi\times10^{-7})(500)^2(${tn(EX.A)})}{0.100} = ${tn(EX.L)}\ \text{H} \approx ${tn(EX.L * 1e3)}$ mH.` },
      { label: 'Rate of change', text: t`$\dfrac{dI}{dt} = \dfrac{2.00\ \text{A}}{5.00\times10^{-3}\ \text{s}} = ${EX.rate}\ \text{A/s}$.` },
      { label: 'emf', text: t`$|\mathcal{E}_L| = L\,\dfrac{dI}{dt} = (${tn(EX.L)}\ \text{H})(${EX.rate}\ \text{A/s}) = ${tn(EX.emf)}$ V. The current is rising, so the emf pushes **against** it — the coil fights the increase, and the supply must push back with ${tn(EX.emf)} V to keep the ramp going.` },
      { label: 'Sense check', text: t`Units: $\text{H}\cdot\text{A/s} = (\text{V·s/A})(\text{A/s}) = \text{V}$ ✓. At 2.00 A the field inside is only $\mu_0NI/\ell = ${tn(EX.B * 1e3)}$ mT, so millihenries and a fraction of a volt are about right for a small coil.` },
    ],
    answer: t`(a) $L = ${tn(EX.L * 1e3)}$ mH. (b) $|\mathcal{E}_L| = ${tn(EX.emf)}$ V while the current rises, pushing against the rise.`,
  },
  practice: [
    mcq({
      id: 'steady-current', difficulty: 1,
      prompt: t`A steady 3.0 A flows through an ideal 2.0 H coil (one with no resistance). What is the voltage across the coil?`,
      visual: currentGraph({ pts: [[0, 3], [10, 3]], tUnit: 's', y: [0, 4], caption: 'The current through the coil: a steady 3.0 A, held for as long as you like.' }),
      choices: ['0 V', '6.0 V', '1.5 V', 'There is no steady current: an inductor blocks it'],
      answer: 0,
      why: {
        1: t`That treats $L$ like a resistance, $V = LI$. The emf is $L\,dI/dt$: it depends on how fast the current changes, and here it does not change.`,
        2: t`$L/I$ has no meaning here. With $dI/dt = 0$ the emf is zero, whatever $L$ and $I$ are.`,
        3: 'An inductor opposes changes in current, not current itself: once steady, the current flows through an ideal coil as through a plain wire.',
      },
      hints: [t`The emf is $\mathcal{E}_L = -L\,dI/dt$. What is $dI/dt$ for a steady current?`],
      teach: 'An inductor responds only to changes in current: with the current steady, an ideal coil has no voltage across it.',
      explain: t`$dI/dt = 0$, so $\mathcal{E}_L = -L\,dI/dt = 0$: no voltage at all. A real coil has some resistance $r$, and then the voltage would be $Ir$ — nothing to do with $L$.`,
    }),
    num({
      id: 'emf-from-ramp', difficulty: 1,
      gen(r) {
        const LmH = r.pick([20, 50, 120, 250, 400]), dI = r.pick([0.5, 1.2, 2.0, 3.5]), dtms = r.pick([2, 5, 10, 25]);
        const emf = (LmH * 1e-3 * dI) / (dtms * 1e-3);
        return {
          prompt: t`The current through a ${LmH} mH coil rises steadily by ${dI} A in ${dtms} ms. How big is the emf the coil induces in itself?`,
          visual: currentGraph({ pts: [[0, 0], [dtms, dI], [dtms * 1.6, dI]], tUnit: 'ms', marks: [lab(dtms / 2, dI / 2, `ΔI = ${dI} A in ${dtms} ms`, 'ink', 8, -12, 'left')], caption: 'The current through the coil: a steady ramp, then held.' }),
          answer: emf, units: 'V', tol: { rel: 0.01 },
          errors: apart([{ value: LmH * 1e-3 * dI, feedback: t`You multiplied $L$ by $\Delta I$ but did not divide by the time: the emf is $L\,\Delta I/\Delta t$.` }, { value: (dI / (dtms * 1e-3)) / (LmH * 1e-3), feedback: t`Multiply by $L$, do not divide: $|\mathcal{E}| = L\,dI/dt$.` }], emf),
          hints: [t`$|\mathcal{E}_L| = L\,\dfrac{\Delta I}{\Delta t}$ for a steady ramp. Put $L$ in henries and $\Delta t$ in seconds.`],
          teach: t`The self-induced emf is the inductance times the rate of change of the current: $|\mathcal{E}_L| = L\,dI/dt$.`,
          explain: t`$|\mathcal{E}_L| = (${LmH}\times10^{-3}\ \text{H})\dfrac{${dI}\ \text{A}}{${dtms}\times10^{-3}\ \text{s}} = ${tn(emf)}$ V, pushing against the rising current — and only while it rises.`,
        };
      },
    }),
    num({
      id: 'solenoid-L', difficulty: 2,
      gen(r) {
        const N = r.pick([200, 300, 400, 500, 800]), lcm = r.pick([8, 10, 12, 15, 20]), dcm = r.pick([1.0, 1.5, 2.0, 2.5, 3.0]);
        const A = Math.PI * (dcm / 200) ** 2, L = (MU0 * N * N * A) / (lcm / 100);
        return {
          prompt: t`A solenoid is ${lcm} cm long and ${dcm.toFixed(1)} cm in diameter, wound with ${N} turns. What is its inductance? ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          visual: solenoidPic({ len: `${lcm} cm`, d: `${dcm.toFixed(1)} cm`, N: `${N} turns` }),
          answer: L * 1e3, units: 'mH', tol: { rel: 0.01 },
          errors: apart([
            { value: ((MU0 * N * A) / (lcm / 100)) * 1e3, feedback: t`The turns count twice: each of the $N$ turns makes the field, and each of the $N$ turns links it. $L = \mu_0N^2A/\ell$.` },
            { value: ((MU0 * N * N * Math.PI * (dcm / 100) ** 2) / (lcm / 100)) * 1e3, feedback: 'You used the diameter as the radius: the area is π(d/2)², a quarter of πd².' },
            { value: ((MU0 * N * N * (dcm / 200) ** 2) / (lcm / 100)) * 1e3, feedback: t`The area of a circle is $\pi r^2$ — the $\pi$ is missing.` },
          ], L * 1e3),
          hints: [t`$L = \mu_0N^2A/\ell$, with $A = \pi(d/2)^2$ in m² and $\ell$ in m.`, t`$A = \pi(${(dcm / 200).toFixed(4)}\ \text{m})^2 = ${tn(A)}$ m², $\ell = ${lcm / 100}$ m.`],
          teach: t`A long solenoid has $L = \mu_0N^2A/\ell$: the turns count twice, once for making the field and once for linking it.`,
          explain: t`$L = \dfrac{(4\pi\times10^{-7})(${N})^2(${tn(A)})}{${lcm / 100}} = ${tn(L)}\ \text{H} = ${tn(L * 1e3)}$ mH.`,
        };
      },
    }),
    mcq({
      id: 'scale-N', difficulty: 2,
      prompt: t`A solenoid is rewound with twice as many turns of thinner wire, filling the same length and the same cross-section. Its inductance becomes:`,
      visual: solenoidPic({ len: 'the same', d: 'the same', N: 'doubled', caption: 'The same length and diameter as before, now with twice the turns. Not to scale.' }),
      choices: ['4 times as large', '2 times as large', 'Unchanged', 'Half as large'],
      answer: 0,
      why: {
        1: t`Doubling $N$ doubles the field — and also doubles the number of turns that field threads. Both factors count: $L \propto N^2$.`,
        2: 'Inductance depends on the geometry and the number of turns; the wire’s thickness does not enter.',
        3: 'More turns make a stronger field for the same current, and more turns link it: the inductance grows.',
      },
      hints: [t`$L = \mu_0N^2A/\ell$. Which of these changed?`],
      teach: t`Inductance grows as the square of the number of turns: $L \propto N^2$.`,
      explain: t`$L' = \mu_0(2N)^2A/\ell = 4\,\mu_0N^2A/\ell = 4L$. Twice the turns make twice the field per ampere, and twice as many turns link it.`,
    }),
    mcq({
      id: 'lenz-direction', difficulty: 2,
      prompt: t`The current through the coil flows as shown and is **decreasing**. Which way does the coil’s self-induced emf push?`,
      visual: acPic({ mode: 'coil', L: 0.5, Imax: 2, tr: 1, th: 1.5, t: 3.0, hide: ['emf'], graphs: ['I'] }, 'The coil and the current through it, with the moment shown by the grey line on the graph: the current still flows the same way, but is falling.'),
      choices: [
        'Along the current: it tries to keep the current flowing',
        'Against the current: an inductor always opposes the current',
        'Nowhere: an emf needs a moving magnet nearby',
        'It depends only on how large the current is, not on whether it is rising or falling',
      ],
      answer: 0,
      why: {
        1: 'An inductor opposes the change, not the current. The change here is a decrease, so the emf pushes to keep the current up — along it.',
        2: 'The coil’s own field is changing because its own current is: that changing flux through its own turns is what induces the emf.',
        3: t`The emf is $-L\,dI/dt$: its size and direction follow the rate of change. A large steady current induces nothing.`,
      },
      hints: ['Lenz’s law: the induced emf opposes the change in flux. Is the flux growing or shrinking?', 'The flux is shrinking with the current, so the emf acts to keep the current — and the flux — up.'],
      teach: 'A coil’s emf opposes the change in its current: against a rising current, along a falling one.',
      explain: t`$dI/dt < 0$, so $\mathcal{E}_L = -L\,dI/dt > 0$ along the current: the coil tries to keep the current going. This is why the current in a coil cannot stop instantly — and why opening a switch on a coil can make a spark.`,
    }),
    num({
      id: 'L-from-measurement', difficulty: 2,
      gen(r) {
        const rate = r.pick([50, 120, 150, 400, 800]), emf = r.pick([0.6, 1.8, 2.4, 4.5]);
        const L = emf / rate;
        return {
          prompt: t`While the current through an ideal coil climbs at a steady ${rate} A/s, a voltmeter across the coil reads ${emf} V. What is the coil’s inductance?`,
          visual: currentGraph({ pts: [[0, 0], [10, rate * 0.01]], tUnit: 'ms', marks: [lab(5, rate * 0.005, `slope ${rate} A/s`, 'ink', 10, -10, 'left')], caption: 'The current through the coil, rising at a steady rate.' }),
          answer: L * 1e3, units: 'mH', tol: { rel: 0.01 },
          errors: apart([{ value: emf * rate * 1e3, feedback: t`Divide the emf by the rate: $L = \mathcal{E}/(dI/dt)$.` }, { value: (rate / emf) * 1e3, feedback: t`Upside down: $L = \mathcal{E}/(dI/dt)$, volts per (amperes per second).` }], L * 1e3),
          hints: [t`For an ideal coil the voltage is the emf alone, $|\mathcal{E}_L| = L\,dI/dt$. Solve for $L$.`],
          teach: t`Inductance is the emf per unit rate of change of current: $L = |\mathcal{E}_L|/(dI/dt)$ — volts per (amperes per second), which is a henry.`,
          explain: t`$L = \dfrac{${emf}\ \text{V}}{${rate}\ \text{A/s}} = ${tn(L)}\ \text{H} = ${tn(L * 1e3)}$ mH.`,
        };
      },
    }),
    mcq({
      id: 'emf-graph', difficulty: 3,
      prompt: t`The current through an inductor follows the graph. During which interval is the self-induced emf largest in size?`,
      visual: currentGraph({
        pts: [[0, 0], [2, 3], [5, 3], [6, 0], [8, 0]], tUnit: 'ms', y: [0, 4.2],
        marks: [lab(1, 3.6, 'P', 'ink'), lab(3.5, 3.6, 'Q', 'ink'), lab(5.5, 3.6, 'R', 'ink'), lab(7, 3.6, 'S', 'ink')],
        extra: { vlines: [{ x: 2, color: 'ink4' }, { x: 5, color: 'ink4' }, { x: 6, color: 'ink4' }] },
        caption: 'The current through the coil in four stretches: P (0–2 ms), Q (2–5 ms), R (5–6 ms) and S (6–8 ms).',
      }),
      choices: ['R, from 5 to 6 ms', 'Q, from 2 to 5 ms', 'P, from 0 to 2 ms', 'Q and S equally'],
      answer: 0,
      why: {
        1: 'In Q the current is largest — but steady, so the emf is zero there. The emf follows the slope, not the height.',
        2: 'In P the current changes by 3 A in 2 ms; in R it changes by the same 3 A in only 1 ms — twice as fast.',
        3: 'Q and S both have zero slope, so the emf is zero in both: the least, not the most.',
      },
      hints: [t`The emf is $L\,|dI/dt|$: look for the steepest part of the graph, not the highest.`, 'Compare the slopes: P rises 3 A in 2 ms; R falls 3 A in 1 ms.'],
      teach: 'The self-induced emf follows the slope of the current graph, not its height.',
      explain: t`$|dI/dt|$ is 1.5 A/ms in P, 0 in Q, 3 A/ms in R and 0 in S. R is steepest, so the emf is largest there — twice as large as in P, and in the opposite direction (opposing a fall rather than a rise).`,
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “My inductor is 2.0 H. A current of 3.0 A flows through it, so it pushes back with an emf of $(2.0\ \text{H})(3.0\ \text{A}) = 6.0$ V. Inductors resist current, just like resistors.” What is wrong?`,
      visual: currentGraph({ pts: [[0, 3], [10, 3]], tUnit: 's', y: [0, 4], caption: 'The current in the student’s inductor: a steady 3.0 A.' }),
      choices: [
        t`The emf depends on $dI/dt$, not on $I$: with a steady 3.0 A there is no emf at all`,
        t`The emf should be $L/I = 0.67$ V`,
        t`Nothing — but the emf points along the current, not against it`,
        t`Inductance is measured in ohms, so the coil has a resistance of 6.0 Ω`,
      ],
      answer: 0,
      why: {
        1: t`Dividing does not rescue it: the emf has nothing to do with the size of $I$, only with how fast it changes.`,
        2: 'The calculation itself is the mistake — a steady current induces no emf, in either direction.',
        3: t`A henry is a volt-second per ampere, not an ohm. Inductance is not resistance.`,
      },
      hints: ['Write down the definition of the self-induced emf.', t`$\mathcal{E}_L = -L\,dI/dt$. What is $dI/dt$ here?`],
      teach: 'Inductors oppose changes in current; they do not resist a steady current the way resistors do.',
      explain: t`$\mathcal{E}_L = -L\,dI/dt$, and a steady current has $dI/dt = 0$, so the emf is zero. Had the current been rising at 3.0 A/s, the emf would have been 6.0 V — the student confused the current with its rate of change.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solenoid-emf', difficulty: 2,
      gen(r) {
        const N = r.pick([300, 600, 900]), lcm = r.pick([12, 15, 25]), dcm = r.pick([2.0, 3.0, 4.0]);
        const I1 = r.pick([1.5, 2.5, 4.0]), tms = r.pick([2.0, 4.0, 8.0]);
        const A = Math.PI * (dcm / 200) ** 2, L = (MU0 * N * N * A) / (lcm / 100), emf = (L * I1) / (tms * 1e-3);
        return {
          prompt: t`A solenoid ${lcm} cm long and ${dcm.toFixed(1)} cm in diameter has ${N} turns. Its current rises steadily from 0 to ${I1} A in ${tms.toFixed(1)} ms. What is the size of the emf it induces in itself? ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          visual: solenoidPic({ len: `${lcm} cm`, d: `${dcm.toFixed(1)} cm`, N: `${N} turns`, current: 'I rising' }),
          answer: emf, units: 'V', tol: { rel: 0.01 },
          hints: [t`First $L = \mu_0N^2A/\ell$; then $|\mathcal{E}_L| = L\,\Delta I/\Delta t$.`, t`$A = \pi(d/2)^2$, and $\Delta t = ${tms}\times10^{-3}$ s.`],
          teach: t`Find $L$ from the geometry, then the emf from the rate of change: $|\mathcal{E}_L| = L\,dI/dt$.`,
          explain: t`$L = \dfrac{(4\pi\times10^{-7})(${N})^2\,\pi(${dcm / 200})^2}{${lcm / 100}} = ${tn(L)}$ H; $\;|\mathcal{E}_L| = (${tn(L)})\dfrac{${I1}}{${tn(tms * 1e-3)}} = ${tn(emf)}$ V.`,
        };
      },
    }),
    mcq({
      id: 'cp-sine-zero', difficulty: 3,
      prompt: t`A sinusoidal current flows through an ideal coil. At the instant marked P the current is zero and rising. At that instant the coil’s self-induced emf is:`,
      visual: { type: 'graph', params: { x: [0, 2], y: [-1.4, 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 't (periods)', ylabel: 'I', yticks: 0.001, curves: [{ fn: 'sin(2*pi*x)', color: 'accent', width: 2.6 }], points: [{ x: 1, y: 0, color: 'gold', r: 5, label: 'P', labelDx: 8, labelDy: 14 }] }, caption: 'The current through the coil against time; P is where it crosses zero on the way up.' },
      choices: ['As large as it ever gets, pushing against the rise', 'Zero: with no current there is nothing to oppose', 'As large as it ever gets, pushing the way the current is rising', 'Half its largest value'],
      answer: 0,
      why: {
        1: t`The emf follows $dI/dt$, the slope — and the slope of a sine is steepest exactly where it crosses zero.`,
        2: 'Lenz’s law: the emf opposes the change. The current is rising, so the emf pushes against the rise.',
        3: t`At P the slope is at its maximum, not half of it: $\frac{d}{dt}\sin\omega t = \omega\cos\omega t$, and $\cos$ is $\pm1$ where $\sin$ is 0.`,
      },
      hints: ['Which matters for the emf: the height of the graph or its slope?', 'Where is a sine curve steepest?'],
      teach: 'For a sinusoidal current the emf peaks where the current crosses zero, because that is where the current changes fastest.',
      explain: t`With $I = I_0\sin\omega t$, $\mathcal{E}_L = -L\omega I_0\cos\omega t$: largest in size at the zero crossings, and negative at P, opposing the rise. The emf is a quarter cycle out of step with the current — the heart of AC circuits with coils.`,
    }),
    num({
      id: 'cp-valve', difficulty: 3, transfer: true,
      gen(r) {
        const LmH = r.pick([20, 25, 40]), I = r.pick([0.8, 1.2, 1.5]), dt = r.pick([0.1, 0.2, 0.25]);
        const emf = (LmH * 1e-3 * I) / (dt * 1e-3);
        return {
          prompt: t`A propellant valve on a rocket engine is held open by a solenoid run from the vehicle’s 28 V bus; its coil has $L = ${LmH}$ mH and carries ${I} A. When the controller switches it off, the current falls to zero in about ${dt} ms. Roughly how large an emf appears across the coil?`,
          visual: currentGraph({ pts: [[0, I], [1, I], [1 + dt, 0], [3, 0]], tUnit: 'ms', marks: [lab(1 + dt / 2, I / 2, `${dt} ms`, 'ink', 10, 0, 'left')], caption: 'The coil’s current as the driver switches off: it collapses in a fraction of a millisecond.' }),
          answer: emf, units: 'V', tol: { rel: 0.02 },
          errors: apart([{ value: LmH * 1e-3 * I, feedback: t`Divide by the time the current takes to fall: $|\mathcal{E}| \approx L\,\Delta I/\Delta t$.` }], emf),
          hints: [t`$|\mathcal{E}_L| \approx L\,\dfrac{\Delta I}{\Delta t}$, with $\Delta I = ${I}$ A.`, t`$L = ${LmH}\times10^{-3}$ H and $\Delta t = ${dt}\times10^{-3}$ s.`],
          teach: 'Switching off a coil makes the current fall fast, so even a modest inductance produces a large emf — engineers clamp it with a flyback diode.',
          explain: t`$|\mathcal{E}_L| \approx (${LmH}\times10^{-3})\dfrac{${I}}{${dt}\times10^{-3}} = ${tn(emf)}$ V — about ${tn(emf / 28, 2)} times the 28 V that drove the valve. The emf pushes to keep the current flowing; with nowhere to go it can arc across the switch, so valve drivers carry a **flyback diode** that gives the current a path to die away gently.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §14.2 Self-inductance and inductors', url: 'https://openstax.org/books/university-physics-volume-2/pages/14-2-self-inductance-and-inductors' },
  ],
});
