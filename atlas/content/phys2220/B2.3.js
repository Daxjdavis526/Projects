// Solenoids and toroids: wind a wire into a long tight coil and the turns'
// fields add inside and nearly cancel outside, B = μ₀nI; bend the coil into a
// ring and the field is trapped inside it, B = μ₀NI/(2πr).
import { lesson, mcq, num } from '../../src/core/content.js';
import { MU0, COL, tn, r4, r6, lab, seg2, circ2, page } from './_magnet.js';

const t = String.raw;
const PI = Math.PI;

// ─── pictures ───────────────────────────────────────────────────────────────
// a solenoid cut through its axis (lengths in cm), with its field lines
// (schematic: no axes, for pictures whose real size the problem does not match)
const NOAXES = { axes: false, grid: false };
const solPic = ({ L = 10, R = 1.4, N = 20, I = 2, probe = null, caption, lines = true, schematic = false }) => ({
  type: 'em-bfield',
  params: { unit: 'cm', x: [r6(-0.85 * L), r6(0.85 * L)], y: [r6(-0.48 * L), r6(0.48 * L)], solenoid: { x0: r6(-L / 2), x1: r6(L / 2), R: r6(R), N, I }, lines, readouts: [], static: true, ...(schematic ? NOAXES : {}), ...(probe ? { probe: { x: probe[0], y: probe[1], label: 'P' }, probeArrow: false } : {}) },
  caption,
});
// a toroid cut through its middle (radii in cm); P at distance pr from the centre
const torPic = ({ a = 1.8, b = 3.2, N = 16, I = 2, pr = null, caption, schematic = false }) => ({
  type: 'em-bfield',
  params: { unit: 'cm', x: [r6(-1.75 * b), r6(1.75 * b)], y: [r6(-1.25 * b), r6(1.25 * b)], toroid: { x: 0, y: 0, a, b, N, I }, lines: true, readouts: [], static: true, ...(schematic ? NOAXES : {}), ...(pr ? { probe: { x: r6(pr * Math.cos(0.12)), y: r6(pr * Math.sin(0.12)), label: 'P' }, probeArrow: false } : {}) },
  caption,
});

// the worked example: the turns of the schematic coil (x positions)
const TURNS = Array.from({ length: 13 }, (_, k) => r6(-2.4 + 0.4 * k));
const EX = { N: 600, L: 0.3, I: 4.0, B2: 0.025 };
EX.n = EX.N / EX.L; EX.B = MU0 * EX.n * EX.I; EX.I2 = EX.B2 / (MU0 * EX.n);

export default lesson({
  id: 'phys2220.B2.3',
  title: 'Solenoids and toroids',
  minutes: 12, difficulty: 2,
  intro: t`Wind wire into a long, tightly packed coil — a **solenoid** — and the fields of its turns add up inside and nearly cancel outside. Inside, far from the ends, the field is **uniform**: the same size and direction everywhere, set only by how many turns there are per metre and the current. Bend the solenoid round into a ring — a **toroid** — and the field is trapped entirely inside the ring:

$$B_{\text{solenoid}} = \mu_0 nI, \qquad B_{\text{toroid}} = \frac{\mu_0 NI}{2\pi r}$$

Both follow from Ampère’s law with a well-chosen path. Solenoids are how physicists and engineers make a field to order: the bore of an MRI scanner, the coil of a valve, the magnets that confine fusion plasmas.`,
  symbols: [
    { tex: 'n', text: 'the number of turns per metre of the solenoid’s length, $n = N/L$ (m⁻¹): what matters is how tightly it is wound, not its total length' },
    { tex: 'N', text: 'the total number of turns' },
    { tex: 'I', text: 'the current in the wire, in A' },
    { tex: 'r', text: 'for a toroid: the distance from the ring’s centre, in m — the field is stronger near the inner wall than the outer' },
    { tex: '\\mu_0', text: '$4\\pi\\times10^{-7}$ T·m/A' },
  ],
  why: 'The solenoid is the workhorse of electromagnetism — every relay, valve, MRI scanner and particle-beam magnet is built around one — and the toroid is the shape of most fusion experiments.',
  visual: {
    type: 'em-bfield',
    title: 'Uniform inside, nearly nothing outside',
    lead: t`A coil cut through its axis: each turn crosses the page twice, current coming out at the dots and going in at the crosses. Drag the probe P around. The readout gives the field there and, for comparison, the ideal long-solenoid value $\mu_0 nI$ — or, for the toroid, $\mu_0 NI/(2\pi r)$ at P.`,
    tasks: [
      'Move P around inside the long solenoid: the field barely changes, and it matches μ₀nI.',
      'Take P outside the coil: the field is a small fraction of the inside value.',
      'Switch to the short, fat coil: inside is no longer uniform, and μ₀nI is only a rough guide.',
      'Switch to the toroid: the field runs round inside the ring, stronger near the inner wall, and vanishes in the hole and outside.',
    ],
    params: {
      unit: 'cm', x: [-8, 8], y: [-4.5, 4.5],
      sliders: [
        { key: 'N', label: 'Turns $N$', min: 8, max: 40, step: 1, value: 24, explain: 'More turns in the same length: a stronger field, in proportion.' },
        { key: 'I', label: 'Current $I$', min: 0.5, max: 5, step: 0.5, value: 2, unit: '\\mathrm{A}', explain: 'The field is proportional to the current.' },
      ],
      presets: [
        { id: 'long', label: 'Long solenoid', solenoid: { x0: -6, x1: 6, R: 1.2, N: 'N', I: 'I' }, probe: { x: 1.5, y: 0.5, label: 'P' } },
        { id: 'short', label: 'Short, fat coil', solenoid: { x0: -1.2, x1: 1.2, R: 2.4, N: 'N', I: 'I' }, probe: { x: 0.6, y: 0.8, label: 'P' } },
        { id: 'toroid', label: 'Toroid', toroid: { x: 0, y: 0, a: 1.8, b: 3.2, N: 'N', I: 'I' }, probe: { x: 2.5, y: 0.3, label: 'P' } },
      ],
      preset: 'long',
      readouts: ['B', 'mu0nI', 'mu0NI'],
    },
    caption: 'The coils are made of real circular turns (or, for the toroid, of straight wires crossing its middle plane), and the fields are exact sums over them. Field lines are drawn closer where the field is stronger; the probe’s readout is the true field at P.',
  },
  example: {
    prompt: t`A solenoid 30 cm long has 600 turns and carries 4.0 A. (a) What is the field inside it, away from the ends? (b) What current would give 25 mT? ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
    visual: page({
      x: [-3.4, 3.4], y: [-1.1, 1.7],
      curves: [
        ...TURNS.map((x) => seg2([x, 0.8], [x, -0.8], { color: 'ink4', width: 1, dash: true })),
        ...TURNS.flatMap((x) => [circ2(x, 0.8, 0.09, { color: 'ink', width: 1.4 }), circ2(x, -0.8, 0.09, { color: 'ink', width: 1.4 }), seg2([x - 0.055, -0.855], [x + 0.055, -0.745], { color: 'ink', width: 1.4 }), seg2([x - 0.055, -0.745], [x + 0.055, -0.855], { color: 'ink', width: 1.4 })]),
        seg2([-0.6, 0.25], [0.6, 0.25], { color: 'good', width: 2.4 }), seg2([0.6, 0.25], [0.6, 1.45], { color: 'good', width: 2.4 }), seg2([0.6, 1.45], [-0.6, 1.45], { color: 'good', width: 2.4 }), seg2([-0.6, 1.45], [-0.6, 0.25], { color: 'good', width: 2.4 }),
        ...[-0.45, 0, 0.45].map((y) => seg2([-3.2, y], [3.2, y], { color: COL.B, width: 1.4 })),
      ],
      points: [...TURNS.map((x) => ({ x, y: 0.8, r: 2.4, color: 'ink' })), lab(0, 0.06, 'length ℓ', 'good'), lab(1.5, 1.25, 'outside: B ≈ 0', 'ink3')],
      arrows: [...[-0.45, 0, 0.45].map((y) => ({ from: [-2.0, y], to: [-1.5, y], color: COL.B })), { from: [-0.2, 0.25], to: [0.2, 0.25], color: 'good' }],
      caption: 'The solenoid cut through its axis, with a rectangular Amperian loop (green): one side, of length ℓ, inside along the field; one side outside, where the field is nearly zero. Schematic.',
    }),
    steps: [
      { label: 'Ampère’s law', text: t`Take the green rectangle. Inside, $\vec B$ runs along the bottom side: $B\ell$. Outside, $B \approx 0$. Along the short sides $\vec B$ is perpendicular to the path (or zero). So $\oint\vec B\cdot d\vec l = B\ell$.` },
      { label: 'Enclosed current', text: t`The rectangle encloses $n\ell$ turns, each carrying $I$: $I_{\text{enc}} = n\ell I$. So $B\ell = \mu_0 n\ell I$ and $B = \mu_0 nI$ — the length $\ell$ cancels, so the field is the same everywhere inside.` },
      { label: '(a) The field', text: t`$n = 600/0.30 = ${tn(EX.n)}$ turns/m, so $B = (4\pi\times10^{-7})(${tn(EX.n)})(4.0) = ${tn(EX.B)}$ T $= ${tn(EX.B * 1e3)}$ mT.` },
      { label: '(b) The current', text: t`$I = \dfrac{B}{\mu_0 n} = \dfrac{0.025}{(4\pi\times10^{-7})(${tn(EX.n)})} = ${tn(EX.I2)}$ A.` },
      { label: 'Sense check', text: t`About 200 times Earth’s field from a modest current. The radius of the solenoid never entered: a long solenoid’s field depends on turns per metre and current only.` },
    ],
    answer: t`(a) $${tn(EX.B * 1e3)}$ mT; (b) $${tn(EX.I2)}$ A.`,
  },
  practice: [
    num({
      id: 'sol-B', difficulty: 1,
      gen(r) {
        const N = r.pick([200, 400, 800, 1500]), Lc = r.pick([10, 20, 25, 40]), I = r.pick([0.5, 1.5, 3, 6]);
        const n = N / (Lc / 100), B = MU0 * n * I;
        return {
          prompt: t`A long solenoid ${Lc} cm long has ${N} turns and carries $${I}$ A. What is the field inside it, away from the ends?`,
          visual: solPic({ L: Lc, R: 0.14 * Lc, caption: `The ${Lc} cm solenoid cut through its axis (fewer turns drawn than the real ${N}), with its field lines.` }),
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: MU0 * N * I * 1e3, feedback: t`Use turns per metre, $n = N/L$, not the total number of turns.` }, { value: ((MU0 * N * I) / Lc) * 1e3, feedback: 'Convert the length to metres before dividing.' }],
          hints: [t`$B = \mu_0 nI$, with $n = N/L$ in turns per metre.`, t`$n = ${N}/${Lc / 100}\ \text{m} = ${tn(n)}$ turns/m.`],
          teach: 'Inside a long solenoid B = μ₀nI, where n is the number of turns per metre.',
          explain: t`$n = ${tn(n)}$ m⁻¹, so $B = (4\pi\times10^{-7})(${tn(n)})(${I}) = ${tn(B)}$ T $= ${tn(B * 1e3)}$ mT.`,
        };
      },
    }),
    mcq({
      id: 'stretch', difficulty: 2,
      prompt: t`A long solenoid is stretched to twice its length, keeping the same number of turns and the same current. The field inside it:`,
      visual: solPic({ L: 10, N: 20, caption: 'The solenoid before it is stretched.' }),
      choices: ['Halves', 'Stays the same', 'Doubles', 'Drops to a quarter'],
      answer: 0,
      why: {
        1: t`The field depends on the turns **per metre**, $n = N/L$, and stretching the coil spreads the same turns over twice the length.`,
        2: 'A longer coil does not mean a stronger field: the turns are farther apart.',
        3: t`$B = \mu_0 nI$ is proportional to $n$, which only halves.`,
      },
      hints: [t`$B = \mu_0 nI$ with $n = N/L$. What happens to $n$?`],
      teach: 'A solenoid’s field depends on how tightly it is wound (turns per metre), not on its total number of turns.',
      explain: t`$n = N/L$ halves when $L$ doubles with $N$ fixed, so $B = \mu_0 nI$ halves.`,
    }),
    num({
      id: 'sol-current', difficulty: 2,
      gen(r) {
        const n = r.pick([1000, 2500, 5000, 8000]), BmT = r.pick([5, 12, 30, 50]), I = (BmT / 1000) / (MU0 * n);
        return {
          prompt: t`A lab solenoid is wound with ${n} turns per metre. What current makes a field of ${BmT} mT inside it?`,
          visual: solPic({ schematic: true, caption: 'A solenoid cut through its axis, with its field lines. Schematic.' }),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: [{ value: BmT / (MU0 * n), feedback: 'Convert the field to tesla: 1 mT = 10⁻³ T.' }],
          hints: [t`Solve $B = \mu_0 nI$ for $I$.`, t`$I = \dfrac{B}{\mu_0 n} = \dfrac{${BmT}\times10^{-3}}{(4\pi\times10^{-7})(${n})}$.`],
          teach: 'To make a given field, I = B/(μ₀n): tighter winding needs less current.',
          explain: t`$I = \dfrac{B}{\mu_0 n} = ${tn(I)}$ A.`,
        };
      },
    }),
    num({
      id: 'toroid-r', difficulty: 2,
      gen(r) {
        const N = r.pick([200, 500, 1200]), I = r.pick([0.8, 2, 5]), [a, b] = r.pick([[4, 6], [8, 11], [10, 14]]), rc = r.pick([0.25, 0.5, 0.75]) * (b - a) + a;
        const B = (MU0 * N * I) / (2 * PI * (rc / 100));
        return {
          prompt: t`A toroid has ${N} turns carrying $${I}$ A; its core runs from ${a} cm to ${b} cm from the centre of the ring. What is the field inside the core, ${tn(rc)} cm from the centre?`,
          visual: torPic({ a, b, N: Math.round((4 * PI * a) / (b - a)), pr: rc, caption: 'The toroid cut through its middle: the windings cross the page on the inner wall (dots) and the outer wall (crosses). P is in the core. Fewer turns drawn than the real one.' }),
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * N * I) / (rc / 100)) * 1e3, feedback: t`The Amperian circle round the ring has length $2\pi r$: divide by it.` }, { value: MU0 * (N / (2 * PI * (rc / 100))) * I * 1e3 * 2 * PI, feedback: t`Check the $2\pi$: $B(2\pi r) = \mu_0 NI$.` }],
          hints: [t`Take a circle of radius $r$ through the core, centred on the ring. It encloses all $N$ turns on the inner wall, each carrying $I$.`, t`$B(2\pi r) = \mu_0 NI$.`],
          teach: 'Inside a toroid, a circle round the ring encloses N turns: B = μ₀NI/(2πr).',
          explain: t`$B = \dfrac{\mu_0 NI}{2\pi r} = \dfrac{(4\pi\times10^{-7})(${N})(${I})}{2\pi(${tn(rc / 100)})} = ${tn(B)}$ T $= ${tn(B * 1e3)}$ mT.`,
        };
      },
    }),
    mcq({
      id: 'toroid-out', difficulty: 2,
      prompt: 'What is the magnetic field outside an ideal toroid, and in the hole in its middle?',
      visual: torPic({ caption: 'A toroid cut through its middle, with its field lines.' }),
      choices: [
        'Zero in both places',
        t`$\mu_0 NI/(2\pi r)$ everywhere, inside the ring or not`,
        'Zero outside, but strongest in the hole',
        'Zero in the hole, but not outside, where the outer windings are',
      ],
      answer: 0,
      why: {
        1: 'That formula holds only inside the core, where a circle round the ring encloses the N turns of the inner wall.',
        2: 'A circle inside the hole encloses no current at all, so by symmetry B = 0 there.',
        3: 'A circle outside the ring encloses N turns going up through the inner wall and N coming down through the outer: zero net current, so B = 0 there too.',
      },
      hints: ['Draw a circle centred on the ring in each region. What current passes through each?'],
      teach: 'An ideal toroid keeps its field entirely inside its core: circles in the hole or outside enclose no net current.',
      explain: t`In the hole, a circle encloses no current; outside, it encloses $NI$ up through the inner wall and $NI$ down through the outer wall — zero net. By symmetry $B$ would be the same all round each circle, so $B = 0$ in both regions. (A real toroid’s windings also advance round the ring, which leaves a small stray field — about that of a single turn.)`,
    }),
    mcq({
      id: 'fat-coil', difficulty: 2, kind: 'error',
      prompt: t`Two long solenoids have the same number of turns per metre and the same current, but one is twice as wide. A student says: “The wide one has the weaker field inside — its turns are farther from the middle.” What is wrong?`,
      visual: solPic({ L: 10, R: 2.0, N: 20, caption: 'A long, wide solenoid cut through its axis, with its field lines.' }),
      choices: [
        t`Nothing in $B = \mu_0 nI$ depends on the radius: both have the same field inside`,
        'Nothing: B falls as 1/r from each turn, so the wide one is weaker',
        'The wide one is stronger, because its turns are longer',
        'The wide one has a stronger field outside it, which subtracts from the inside',
      ],
      answer: 0,
      why: {
        1: 'Each turn’s field at the centre is weaker, but a long solenoid’s field comes from every turn along its length, and the total does not depend on the radius.',
        2: 'Longer turns enclose more area, but Ampère’s law gives B = μ₀nI with no radius in it.',
        3: 'Outside a long solenoid the field is nearly zero, whatever its width.',
      },
      hints: [t`Run through the Ampère’s-law argument: $B\ell = \mu_0 n\ell I$. Where would the radius enter?`],
      teach: 'A long solenoid’s field depends only on n and I — not on how wide it is.',
      explain: t`In the Ampère’s-law argument the rectangle encloses $n\ell$ turns whatever the solenoid’s radius, so $B = \mu_0 nI$ for both. The student’s reasoning works for a single flat loop ($B = \mu_0 I/(2R)$), not for a long coil.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-iter', difficulty: 3, transfer: true,
      gen(r) {
        const coils = r.pick([16, 18]), turns = r.pick([134, 150]), IkA = r.pick([60, 68]), R = r.pick([5.5, 6.2]);
        const N = coils * turns, B = (MU0 * N * IkA * 1e3) / (2 * PI * R);
        return {
          prompt: t`A tokamak — a fusion reactor — confines its plasma inside a toroidal field made by ${coils} large D-shaped coils spaced round a ring, each of ${turns} turns carrying ${IkA} kA. Treating them as one toroid, what is the field ${R} m from the ring’s central axis, where the plasma sits?`,
          visual: torPic({ N: coils, pr: 2.5, schematic: true, caption: `A toroid of ${coils} coils, cut through its middle, with its field lines. P marks the plasma’s position. Schematic.` }),
          answer: B, units: 'T', tol: { rel: 0.01 },
          errors: [{ value: (MU0 * turns * IkA * 1e3) / (2 * PI * R), feedback: t`All ${coils} coils carry their turns through the circle: $N = ${coils}\times${turns}$.` }, { value: (MU0 * N * IkA) / (2 * PI * R), feedback: 'Convert the current to amperes.' }],
          hints: [t`Total turns $N = ${coils}\times${turns} = ${N}$; then $B = \mu_0 NI/(2\pi r)$.`, t`$B = \dfrac{(4\pi\times10^{-7})(${N})(${IkA}\times10^{3})}{2\pi(${R})}$.`],
          teach: 'A tokamak’s toroidal field follows the toroid formula, μ₀NI/(2πr), with N counting every turn of every coil.',
          explain: t`$N = ${N}$ turns, so $B = \dfrac{\mu_0 NI}{2\pi r} = ${tn(B)}$ T. ITER’s design (18 coils of 134 turns at 68 kA) gives 5.3 T at its plasma’s centre, 6.2 m from the axis — a field so strong that the coils must be superconducting. The $1/r$ fall-off is real too: the field is stronger on the inboard side of the plasma than the outboard.`,
        };
      },
    }),
    mcq({
      id: 'cp-double', difficulty: 2,
      prompt: t`You want to double the field inside a long solenoid. Which change does it?`,
      visual: solPic({ L: 10, N: 20, caption: 'The solenoid, cut through its axis.' }),
      choices: ['Wind twice as many turns onto the same length', 'Make the coil twice as long, with the same turns per metre', 'Make the coil twice as wide', 'Wind twice as many turns, spread over twice the length'],
      answer: 0,
      why: {
        1: 'A longer coil at the same n has the same field inside: B depends on n, not on the length.',
        2: 'The radius does not appear in B = μ₀nI.',
        3: 'That keeps n = N/L the same, so the field does not change.',
      },
      hints: [t`$B = \mu_0 nI$ with $n = N/L$: which change doubles $n$ (or $I$)?`],
      teach: 'Only turns per metre and current set a long solenoid’s field.',
      explain: t`Twice the turns on the same length doubles $n$, and with it $B = \mu_0 nI$. (Doubling the current would do it too.)`,
    }),
    num({
      id: 'cp-wire', difficulty: 3,
      gen(r) {
        const d = r.pick([0.5, 0.8, 1.0, 1.25]), I = r.pick([2, 3, 5]), n = 1000 / d, B = MU0 * n * I;
        return {
          prompt: t`A long solenoid is wound with a single layer of wire ${d} mm thick, each turn touching the next. With $${I}$ A in the wire, what is the field inside?`,
          visual: solPic({ L: 10, N: 26, schematic: true, caption: 'A tightly wound solenoid cut through its axis: the turns touch. Schematic.' }),
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: MU0 * d * I * 1e3, feedback: 'Turns per metre is one over the wire’s thickness: n = 1/d, with d in metres.' }],
          hints: ['If each turn is d thick and the turns touch, how many fit in one metre?', t`$n = 1/d = 1/(${d}\times10^{-3}\ \text{m}) = ${tn(n)}$ turns/m; then $B = \mu_0 nI$.`],
          teach: 'For a close-wound single layer, n is one over the wire’s thickness.',
          explain: t`$n = ${tn(n)}$ m⁻¹, so $B = \mu_0 nI = ${tn(B)}$ T $= ${tn(B * 1e3)}$ mT. To go higher, add more layers — each one adds another $\mu_0 nI$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §12.6', url: 'https://openstax.org/books/university-physics-volume-2/pages/12-6-solenoids-and-toroids' },
    { label: 'ITER: the toroidal field magnet system', url: 'https://www.iter.org/mach/Magnets' },
  ],
});
