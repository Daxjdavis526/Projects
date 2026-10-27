// Torque on a current loop: no net force in a uniform field, but a couple that
// turns the loop's magnetic moment μ = NIA toward B, τ = μ × B, with energy
// U = −μ·B. A commutator turns this rocking into the steady turning of a motor.
import { lesson, mcq, num } from '../../src/core/content.js';
import { DEG, COL, tn, r4, arrow3, scene3 } from './_magnet.js';

const t = String.raw;

// the coil between pole pieces, still, at angle θ (degrees between μ and B)
const coilPic = (angle, caption, extra = {}) => ({
  type: 'em-generator',
  params: { mode: 'motor', N: 50, I: 2, B: 0.3, ring: 'split', play: false, angle, graph: false, readouts: [], ...extra },
  caption,
});

// a flat square loop in a 3D scene with its magnetic moment and the field
function loopScene({ mu, B, caption, axisLabels, loopColor = 'warn' }) {
  const m = mu.map((c) => c / Math.hypot(...mu));
  const u = Math.abs(m[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const e1 = [m[1] * u[2] - m[2] * u[1], m[2] * u[0] - m[0] * u[2], m[0] * u[1] - m[1] * u[0]];
  const n1 = Math.hypot(...e1), a = e1.map((c) => c / n1), b = [m[1] * a[2] - m[2] * a[1], m[2] * a[0] - m[0] * a[2], m[0] * a[1] - m[1] * a[0]];
  const s = 1.1, P = (i, j) => [0, 1, 2].map((k) => r4(s * (i * a[k] + j * b[k])));
  const C = [P(1, 1), P(-1, 1), P(-1, -1), P(1, -1)];
  return scene3({
    axisLabels,
    segments: C.map((p, k) => ({ from: p, to: C[(k + 1) % 4], color: loopColor, width: 3.2 })),
    vectors: [arrow3(m.map((c) => 2 * c), COL.mu, '\\vec\\mu'), arrow3(B.map((c) => 2.4 * c / Math.hypot(...B)), COL.B, '\\vec B', B.map((c) => -0.4 * c / Math.hypot(...B)))],
    caption,
  });
}

// U(θ) = −μB cos θ, drawn without numbers
const energyPic = (caption, points = []) => ({
  type: 'graph',
  params: {
    x: [0, 360], y: [-1.35, 1.35], aspect: 'wide', xlabel: 'θ (degrees)', ylabel: 'U', xticks: 8, yticks: 0.001,
    curves: [{ fn: '-cos(x*pi/180)', color: 'gold', width: 2.4 }],
    points,
  },
  caption,
});

// the worked example
const EX = { N: 120, I: 1.5, a: 0.05, b: 0.04, B: 0.35, th: 30 };
EX.A = EX.a * EX.b; EX.mu = EX.N * EX.I * EX.A; EX.tmax = EX.mu * EX.B; EX.tau = EX.tmax * Math.sin(EX.th * DEG);

export default lesson({
  id: 'phys2220.B1.4',
  title: 'Torque on a current loop and motors',
  minutes: 12, difficulty: 2,
  intro: t`A current loop in a uniform field feels **no net force** — the pushes on opposite sides cancel — but they do not act along the same line, so they **twist** it. The twist turns the loop’s magnetic moment $\vec\mu$ toward the field:

$$\vec\tau = \vec\mu\times\vec B, \qquad \mu = NIA, \qquad \tau = NIAB\sin\theta$$

The moment $\vec\mu$ stands perpendicular to the loop: curl your right-hand fingers round with the current and your thumb points along it. The torque is largest when the loop’s plane lies along the field, and zero when the loop faces it squarely. The energy $U = -\vec\mu\cdot\vec B$ is lowest with $\vec\mu$ along $\vec B$, which is why a compass needle swings north. A motor keeps its coil turning by **reversing the current every half turn** with a commutator.`,
  symbols: [
    { tex: '\\vec\\tau', text: 'the torque on the loop, in N·m: it turns the loop about an axis perpendicular to both $\\vec\\mu$ and $\\vec B$' },
    { tex: '\\vec\\mu', text: 'the **magnetic moment** of the loop, in A·m², perpendicular to its plane (right-hand rule with the current)' },
    { tex: 'N', text: 'the number of turns of wire in the coil' },
    { tex: 'I', text: 'the current in each turn, in A' },
    { tex: 'A', text: 'the area of the loop, in m² — any flat shape: a circle of radius $r$ has $A = \\pi r^2$' },
    { tex: 'B', text: 'the uniform field, in T' },
    { tex: '\\theta', text: 'the angle between $\\vec\\mu$ (the normal to the loop) and $\\vec B$ — **not** the angle between the loop’s plane and the field' },
    { tex: 'U = -\\vec\\mu\\cdot\\vec B', text: 'the loop’s potential energy in the field, in J: $-\\mu B$ when aligned (stable), $+\\mu B$ when reversed' },
  ],
  why: 'Electric motors, analogue meters and satellite magnetorquers all run on this torque — and an MRI scanner lines up and tips the magnetic moments of the protons in your body with it.',
  visual: {
    type: 'em-generator',
    title: 'Two equal forces, one twist',
    lead: t`The coil (gold) carries a current (blue) between the poles of a magnet. The field pushes one long side up and the other down (violet): equal and opposite, so no net force — but they twist the coil, swinging its magnetic moment $\vec\mu$ toward $\vec B$. The graph is the torque as the coil turns.`,
    tasks: [
      'Pause with the coil facing the poles (θ = 0°): the forces still act, but along one line through the axle — no torque.',
      'Set θ = 90°: the forces have their full lever arm and the torque is largest, NIAB.',
      'Switch to slip rings: the torque reverses every half turn (the graph dips below zero), so a real coil would only rock. The commutator keeps it turning one way.',
    ],
    params: { mode: 'motor', N: 50, I: 2, B: 0.3, a: 0.1, b: 0.08, rpm: 1200, ring: 'split', ringChoice: true, sliders: ['I', 'B', 'angle'], readouts: ['torque', 'tmax', 'mu', 'angle'] },
    caption: 'Schematic, not to scale (the coil’s true sides are 10 cm × 8 cm, with 50 turns). The forces on the long sides are always vertical and the same size; what changes is their lever arm. The coil is shown turning steadily so you can see the torque at every angle. Animation slowed; the graph uses the true rate of 1200 rpm.',
  },
  example: {
    prompt: t`The coil of a small DC motor has 120 turns of wire on a 5.0 cm × 4.0 cm frame and carries 1.5 A in a 0.35 T field. Find its magnetic moment, the largest torque on it, and the torque when its moment is at $30^\circ$ to the field.`,
    visual: coilPic(30, 'The coil with its moment at 30° to the field: the forces (violet) on its long sides, and the torque readout. Schematic, not to scale.', { N: 120, I: 1.5, B: 0.35, a: 0.05, b: 0.04, readouts: ['mu', 'tmax', 'torque'] }),
    steps: [
      { label: 'Area', text: t`$A = (0.050\ \text{m})(0.040\ \text{m}) = ${tn(EX.A)}\ \text{m}^2$.` },
      { label: 'Moment', text: t`$\mu = NIA = (120)(1.5\ \text{A})(${tn(EX.A)}\ \text{m}^2) = ${tn(EX.mu)}\ \text{A·m}^2$.` },
      { label: 'Largest torque', text: t`When $\vec\mu \perp \vec B$, $\sin\theta = 1$: $\tau_{\max} = \mu B = (${tn(EX.mu)})(0.35\ \text{T}) = ${tn(EX.tmax)}$ N·m.` },
      { label: 'At 30°', text: t`$\tau = \mu B\sin 30^\circ = ${tn(EX.tmax)}\times 0.5 = ${tn(EX.tau)}$ N·m — half the largest value, as $\vec\mu$ is already well on its way to lining up with $\vec B$.` },
      { label: 'Sense check', text: t`Applied to a shaft 1 cm across, 0.126 N·m is a grip of about 25 N at its rim — about right for a small motor.` },
    ],
    answer: t`$\mu = ${tn(EX.mu)}\ \text{A·m}^2$, $\tau_{\max} = ${tn(EX.tmax)}$ N·m, and $${tn(EX.tau)}$ N·m at $30^\circ$.`,
  },
  practice: [
    num({
      id: 'torque-max', difficulty: 1,
      gen(r) {
        const N = r.pick([20, 50, 80, 150]), I = r.pick([0.5, 1.2, 2.5, 4]), a = r.pick([3, 4, 6]), b = r.pick([2, 5, 8]), B = r.pick([0.1, 0.25, 0.4, 0.8]);
        const A = (a / 100) * (b / 100), tm = N * I * A * B;
        return {
          prompt: t`A rectangular coil of ${N} turns, ${a} cm × ${b} cm, carries $${I}$ A in a uniform $${B}$ T field. What is the largest torque the field can exert on it?`,
          visual: coilPic(90, 'The coil turned so that its moment is perpendicular to the field. Schematic, not to scale.', { N, I, B, a: a / 100, b: b / 100 }),
          answer: tm, units: 'N m', tol: { rel: 0.01 },
          errors: [{ value: I * A * B, feedback: t`Each of the ${N} turns feels the torque: multiply by $N$.` }, { value: N * I * a * b * B, feedback: 'Convert the sides to metres before finding the area: 1 cm² = 10⁻⁴ m².' }],
          hints: [t`The torque is largest when $\sin\theta = 1$: $\tau_{\max} = NIAB$.`, t`$A = (${a / 100}\ \text{m})(${b / 100}\ \text{m}) = ${tn(A)}\ \text{m}^2$.`],
          teach: 'The largest torque on a coil is NIAB, when its moment is perpendicular to the field.',
          explain: t`$\tau_{\max} = NIAB = (${N})(${I})(${tn(A)})(${B}) = ${tn(tm)}$ N·m.`,
        };
      },
    }),
    num({
      id: 'torque-angle', difficulty: 2,
      gen(r) {
        const N = r.pick([25, 60, 100]), I = r.pick([0.8, 1.5, 3]), rcm = r.pick([1.5, 2, 3]), B = r.pick([0.2, 0.5, 1.0]), th = r.pick([20, 35, 50, 70, 110, 140]);
        const A = Math.PI * (rcm / 100) ** 2, tq = N * I * A * B * Math.sin(th * DEG);
        const errors = [{ value: N * I * A * B, feedback: t`That is the largest torque. At $${th}^\circ$ include $\sin\theta$.` }];
        if (Math.abs(Math.cos(th * DEG)) > 0.05 && Math.abs(Math.abs(Math.cos(th * DEG)) - Math.sin(th * DEG)) > 0.02) errors.push({ value: N * I * A * B * Math.abs(Math.cos(th * DEG)), feedback: t`The torque goes as $\sin\theta$, with $\theta$ between $\vec\mu$ and $\vec B$: zero when they line up.` });
        errors.push({ value: N * I * 2 * Math.PI * (rcm / 100) * B * Math.sin(th * DEG), feedback: t`Use the area of the circle, $\pi r^2$, not its circumference.` });
        return {
          prompt: t`A circular coil of ${N} turns and radius ${rcm} cm carries $${I}$ A. Its magnetic moment makes an angle of $${th}^\circ$ with a uniform $${B}$ T field. What is the size of the torque on it?`,
          visual: coilPic(th, `The coil with its moment at ${th}° to the field (drawn rectangular; the formula holds for any flat shape). Schematic.`),
          answer: tq, units: 'N m', tol: { rel: 0.01 }, errors,
          hints: [t`$\tau = NIAB\sin\theta$, and the area of a circle is $\pi r^2$.`, t`$A = \pi(${rcm / 100}\ \text{m})^2 = ${tn(A)}\ \text{m}^2$.`],
          teach: 'τ = NIAB sin θ works for any flat coil: only its area matters, not its shape.',
          explain: t`$\tau = NIAB\sin\theta = (${N})(${I})(${tn(A)})(${B})\sin ${th}^\circ = ${tn(tq)}$ N·m.`,
        };
      },
    }),
    {
      type: 'slider', id: 'set-max', difficulty: 2,
      prompt: t`Turn the coil to the angle at which the field twists it hardest. ($\theta$ is the angle between the coil’s magnetic moment, the gold arrow, and the field.)`,
      visual: coilPic(20, 'Use the slider to turn the coil. The forces on the long sides (violet) stay the same size at every angle. Schematic.', { sliders: [{ key: 'angle', min: 0, max: 180, step: 1, value: 20 }] }),
      param: 'angle', answer: [85, 95],
      instruction: 'Set the angle where the torque is largest, then check.',
      hints: ['The forces on the long sides never change size — only how far their lines of action are from the axle.', 'The lever arm is largest when the coil’s plane lies along the field, so that the forces push straight across the plane.', t`$\tau = \mu B\sin\theta$ is largest at $\theta = 90^\circ$.`],
      teach: 'The torque μB sin θ is largest when the moment is perpendicular to the field — the coil’s plane lying along B.',
      explain: t`At $\theta = 90^\circ$ the coil’s plane lies along $\vec B$, so the up and down forces on the long sides act as far from the axle as they can: $\tau = \mu B$. At $0^\circ$ (facing the field) they pull along one line through the axle and the torque vanishes.`,
    },
    mcq({
      id: 'stable', difficulty: 2,
      prompt: t`A current loop free to turn in a uniform field can rest without any torque in two orientations. Which one is **stable**, so that a small nudge makes it swing back?`,
      visual: coilPic(150, 'A coil in a magnet’s field, its moment (gold) at 150° to the field. Schematic.', { arrows: ['B', 'mu', 'F'] }),
      choices: [
        t`$\vec\mu$ along $\vec B$ ($\theta = 0^\circ$), where $U = -\mu B$ is lowest`,
        t`$\vec\mu$ opposite to $\vec B$ ($\theta = 180^\circ$), where $U = +\mu B$`,
        t`$\vec\mu$ perpendicular to $\vec B$ ($\theta = 90^\circ$)`,
        'Every orientation, since the net force on the loop is zero',
      ],
      answer: 0,
      why: {
        1: 'The torque is zero there too, but it is an energy maximum: nudge the loop and the torque drives it further away, all the way round to θ = 0°.',
        2: 'That is where the torque is largest, so the loop cannot rest there at all.',
        3: 'Zero net force does not mean zero torque: the forces on opposite sides form a couple.',
      },
      hints: [t`Stable equilibria sit at the bottom of an energy valley. Where is $U = -\mu B\cos\theta$ lowest?`, 'Nudge the loop a little away from each resting orientation: does the torque push it back, or further away?'],
      teach: 'A magnetic moment rests stably along the field, where its energy −μB is lowest — which is why a compass needle points along B.',
      explain: t`$U = -\mu B\cos\theta$ is lowest at $\theta = 0^\circ$; there a small twist produces a torque back toward $0^\circ$. At $180^\circ$ the torque is also zero, but any nudge grows. A compass needle is a small magnetic moment doing exactly this.`,
    }),
    mcq({
      id: 'commutator', difficulty: 2,
      prompt: 'In a simple DC motor, what does the split-ring commutator do?',
      visual: coilPic(70, 'A DC motor’s coil with its split-ring commutator (the two half-rings on the axle) and the brushes that touch it. Schematic.'),
      choices: [
        'Reverses the current in the coil every half turn, so the torque keeps turning the coil the same way',
        'Turns the supply’s direct current into alternating current, so the coil is pushed back and forth',
        'Keeps the current in the coil constant as it turns',
        'Reverses the magnet’s field every half turn',
      ],
      answer: 0,
      why: {
        1: 'Pushing the coil back and forth is what happens without a commutator. The commutator’s reversals are timed so the torque always points the same way.',
        2: 'The supply sets the current’s size; the commutator only switches its direction in the coil.',
        3: 'The magnet is fixed. The commutator switches the coil’s connections to the supply.',
      },
      hints: [t`With a steady current, the torque $-\mu B\sin\theta$ changes sign when the coil passes $\theta = 0^\circ$. What would the coil do then?`, 'To keep turning, the torque has to keep its sign. What could be flipped to flip the torque back?'],
      teach: 'A commutator reverses the coil’s current each time μ passes B, so the torque never changes sign and the motor keeps turning.',
      explain: t`Just as $\vec\mu$ swings past $\vec B$, the gaps in the split ring pass the brushes and the coil’s connections swap. The current — and $\vec\mu$ — reverse, so the torque keeps pushing the same way round. Without it, the coil would rock back and forth about $\theta = 0^\circ$.`,
    }),
    num({
      id: 'flip-work', difficulty: 3,
      gen(r) {
        const N = r.pick([40, 100, 250]), I = r.pick([0.2, 0.5, 1.5]), rcm = r.pick([1, 2.5, 4]), B = r.pick([0.05, 0.2, 0.6]);
        const mu = N * I * Math.PI * (rcm / 100) ** 2, W = 2 * mu * B;
        return {
          prompt: t`A circular coil of ${N} turns and radius ${rcm} cm carries $${I}$ A. It rests with its moment along a uniform $${B}$ T field. How much work must you do to turn it slowly until its moment points the opposite way?`,
          visual: energyPic('The coil’s energy U = −μB cos θ: the work you do is the rise in U from θ = 0° to θ = 180°.', [{ x: 0, y: -1, r: 5, color: 'gold', label: 'start', labelDx: 8, labelDy: 12 }, { x: 180, y: 1, r: 5, color: 'gold', label: 'finish', labelDx: 8, labelDy: -10 }]),
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: mu * B, feedback: t`$U$ rises from $-\mu B$ to $+\mu B$: a change of $2\mu B$, not $\mu B$.` }, { value: 0, feedback: 'The energy at the end differs from the energy at the start: the work is that difference.' }],
          hints: [t`The work done turning it slowly equals the change in $U = -\mu B\cos\theta$.`, t`$W = U(180^\circ) - U(0^\circ) = \mu B - (-\mu B) = 2\mu B$, with $\mu = NI\pi r^2$.`],
          teach: 'Turning a magnetic moment from along B to against it raises its energy U = −μB cos θ by 2μB.',
          explain: t`$\mu = NI\pi r^2 = ${tn(mu)}\ \text{A·m}^2$, so $W = 2\mu B = ${tn(W)}$ J.`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 2, kind: 'error',
      prompt: t`The plane of a 40-turn coil makes an angle of $30^\circ$ with a uniform field. A student writes the torque as $\tau = NIAB\sin 30^\circ = \tfrac12 NIAB$. What is wrong?`,
      visual: coilPic(60, 'The coil: its plane at 30° to the field, so its moment (gold) at 60° to it. Schematic.'),
      choices: [
        t`$\theta$ is the angle between $\vec\mu$ (the normal to the coil) and $\vec B$, which is $60^\circ$ here: $\tau = NIAB\sin 60^\circ$`,
        'Nothing: the angle in the formula is the one between the coil’s plane and the field',
        t`The torque on a coil is always $NIAB$, whatever its angle`,
        t`It should be $\tau = NIAB\cos 60^\circ$`,
      ],
      answer: 0,
      why: {
        1: t`The formula comes from $\vec\mu\times\vec B$, and $\vec\mu$ is perpendicular to the plane. The plane’s angle and the moment’s angle add to $90^\circ$.`,
        2: 'Facing the field squarely (θ = 0°) the coil feels no torque at all.',
        3: t`$\cos 60^\circ = \sin 30^\circ$: the same mistake written another way.`,
      },
      hints: [t`Draw $\vec\mu$: perpendicular to the coil’s plane.`, t`If the plane is at $30^\circ$ to $\vec B$, the normal is at $90^\circ - 30^\circ$.`],
      teach: 'In τ = NIAB sin θ, θ is measured from the normal (μ) to the field, not from the coil’s plane.',
      explain: t`The moment is at $90^\circ - 30^\circ = 60^\circ$ to $\vec B$, so $\tau = NIAB\sin 60^\circ \approx 0.87\,NIAB$ — not $0.5\,NIAB$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-magnetorquer', difficulty: 2, transfer: true,
      gen(r) {
        const N = r.pick([150, 200, 300]), ImA = r.pick([40, 60, 80]), side = r.pick([8, 9, 10]), BuT = r.pick([25, 30, 40]);
        const mu = N * (ImA / 1000) * (side / 100) ** 2, tq = mu * BuT * 1e-6;
        return {
          prompt: t`A CubeSat steers itself with a **magnetorquer**: a coil of ${N} turns wound on a ${side} cm × ${side} cm frame, carrying ${ImA} mA. In low Earth orbit the field is about $${BuT}\ \mu\text{T}$. What is the largest torque the coil can exert on the satellite?`,
          visual: loopScene({ mu: [0, 0, 1], B: [1, 0, 0], caption: 'The magnetorquer coil (gold), its magnetic moment (gold arrow) and Earth’s field (teal), at right angles for the largest torque. Drag to rotate.' }),
          answer: tq, units: 'N m', tol: { rel: 0.01 },
          errors: [{ value: N * ImA * (side / 100) ** 2 * BuT * 1e-6, feedback: 'Convert the current to amperes: 1 mA = 10⁻³ A.' }, { value: mu * BuT, feedback: 'Convert the field to tesla: 1 μT = 10⁻⁶ T.' }],
          hints: [t`$\tau_{\max} = \mu B$ with $\mu = NIA$.`, t`$\mu = (${N})(${ImA}\times10^{-3}\ \text{A})(${side / 100}\ \text{m})^2 = ${tn(mu)}\ \text{A·m}^2$.`],
          teach: 'A satellite’s magnetorquer is a current loop: its largest torque is NIAB, tiny in Earth’s weak field but free of propellant.',
          explain: t`$\mu = NIA = ${tn(mu)}\ \text{A·m}^2$ and $\tau = \mu B = ${tn(tq)}$ N·m — a few millionths of a newton-metre. Yet a CubeSat has a small moment of inertia (around $0.01\ \text{kg·m}^2$), so even this turns it through a right angle in a couple of minutes, with no propellant — and by pushing against Earth’s field it can also slow a tumble or unload a reaction wheel.`,
        };
      },
    }),
    mcq({
      id: 'cp-which-way', difficulty: 2,
      prompt: t`A small current loop lies flat (horizontal), with its magnetic moment pointing straight up. A uniform field points east. How does the torque turn the loop?`,
      visual: loopScene({ mu: [0, 0, 1], B: [1, 0, 0], axisLabels: ['east', 'north', 'up'], caption: 'The flat loop (gold) with its moment pointing up, in a field pointing east (teal). Drag to rotate.' }),
      choices: [
        'It tips its moment over toward the east, turning about a north–south axis',
        'It tips its moment over toward the west, turning about a north–south axis',
        'It spins the loop flat about the vertical, like a turntable',
        'It does not turn: the forces on opposite sides cancel',
      ],
      answer: 0,
      why: {
        1: 'That would raise its energy. The torque turns μ toward B, never away from it.',
        2: t`$\vec\tau = \vec\mu\times\vec B$ is perpendicular to $\vec\mu$, so it cannot spin the loop about $\vec\mu$ itself.`,
        3: 'The forces cancel as a net force, but they act on opposite sides and form a couple: a torque.',
      },
      hints: [t`$\vec\tau = \vec\mu\times\vec B$, and the torque always swings $\vec\mu$ toward $\vec B$.`, t`Up $\times$ east $=$ north: the torque vector points north, so the loop rotates about a north–south line.`],
      teach: 'The torque μ × B turns the moment toward the field, about an axis perpendicular to both.',
      explain: t`$\vec\tau = \vec\mu\times\vec B$: up $\times$ east $=$ north, so the loop turns about a north–south axis, in the sense that tips $\vec\mu$ from up toward east — lowering its energy $-\vec\mu\cdot\vec B$.`,
    }),
    num({
      id: 'cp-current', difficulty: 3,
      gen(r) {
        const N = r.pick([80, 120, 200]), a = r.pick([2, 3]), b = r.pick([1.5, 2.5]), B = r.pick([0.15, 0.3]), th = r.pick([40, 60, 75]), tq = r.pick([2, 5, 8]) * 1e-3;
        const A = (a / 100) * (b / 100), I = tq / (N * A * B * Math.sin(th * DEG));
        return {
          prompt: t`A galvanometer coil has ${N} turns on a ${a} cm × ${b} cm frame, in a $${B}$ T field. With its moment at $${th}^\circ$ to the field, the coil feels a torque of $${tn(tq)}$ N·m. What current flows in it?`,
          visual: coilPic(th, `The coil with its moment at ${th}° to the field. Schematic.`),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: [{ value: tq / (N * A * B), feedback: t`Include $\sin ${th}^\circ$: the torque is only $NIAB$ at $90^\circ$.` }, { value: tq / (A * B * Math.sin(th * DEG)), feedback: t`Divide by the ${N} turns too: each one carries $I$.` }],
          hints: [t`Solve $\tau = NIAB\sin\theta$ for $I$.`, t`$I = \dfrac{\tau}{NAB\sin\theta}$ with $A = ${tn(A)}\ \text{m}^2$.`],
          teach: 'Rearranging τ = NIAB sin θ turns a measured torque into a current — how an analogue meter works.',
          explain: t`$I = \dfrac{\tau}{NAB\sin\theta} = \dfrac{${tn(tq)}}{(${N})(${tn(A)})(${B})\sin ${th}^\circ} = ${tn(I)}$ A.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §11.6', url: 'https://openstax.org/books/university-physics-volume-2/pages/11-6-force-and-torque-on-a-current-loop' },
    { label: 'OpenStax University Physics Vol. 2, §13.6 (motors and back emf)', url: 'https://openstax.org/books/university-physics-volume-2/pages/13-6-electric-generators-and-back-emf' },
  ],
});
