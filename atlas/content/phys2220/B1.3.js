// The force on a current-carrying wire, F = IL × B: the sum of the sideways
// pushes on its drifting charges. Zero along the field, largest across it;
// for a curved wire add up I dl × B, and a closed loop in a uniform field
// feels no net force at all.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G0, DEG, COL, AXES, tn, r4, r6, cross, scale, neg, axisTeX, arrow3, arc3, scene3, lab, seg2, circ2, fieldMarks, page } from './_magnet.js';

const t = String.raw;

// ─── pictures ───────────────────────────────────────────────────────────────
// a straight wire through the origin along `dir`, the current along it, a field region along +y
function wireScene({ dir, B = [0, 1, 0], F = null, s = 1, caption, axisLabels, extra = {} }) {
  const d = dir.map((c) => c / Math.hypot(...dir)), half = 1.6;
  // the current arrow rides just beside the wire, so the wire does not hide it
  const side = Math.abs(d[2]) > 0.9 ? [0.28, 0, 0] : [0, 0, 0.28], lift = side;
  const Bu = B.map((c) => c / Math.hypot(...B));
  const offsets = [[-2.3, 0], [2.3, 0], [-2.3, 1.5], [2.3, 1.5]];
  // field arrows, placed off the wire, all parallel to B
  const perp1 = Math.abs(Bu[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1], perp2 = cross(Bu, perp1);
  const fieldArrows = offsets.map(([a, b], k) => {
    const c = [a * perp2[0] + b * perp1[0], a * perp2[1] + b * perp1[1], a * perp2[2] + b * perp1[2]];
    return arrow3(c.map((x, i) => x + 2.1 * Bu[i]), COL.B, k === 1 ? '\\vec B' : '', c.map((x, i) => x - 2.1 * Bu[i]));
  });
  return scene3({
    axisLabels,
    segments: [{ from: d.map((c) => r4(-half * c)), to: d.map((c) => r4(half * c)), color: 'ink3', width: 5 }],
    vectors: [
      ...fieldArrows,
      arrow3(d.map((c, k) => 0.45 * s * c + lift[k]), COL.I, 'I', d.map((c, k) => -0.65 * s * c + lift[k])),
      ...(F ? [arrow3(F, COL.F, '\\vec F')] : []),
    ],
    caption, extra,
  });
}

// words for the six directions in the plane of the page
const PAGE_WORD = { '+x': 'to the right', '-x': 'to the left', '+y': 'up the page', '-y': 'down the page', '+z': 'out of the page', '-z': 'into the page' };
const cap = (w) => w[0].toUpperCase() + w.slice(1);

// a triangle-wave spring from (x, y0) down to (x, y1), as a graph curve
const spring = (x, y0, y1, n = 7, w = 0.13) => ({
  param: [`${x} + ${w}*asin(sin(${2 * n}*pi*t))/(pi/2)`, `${r6(y0)} + ${r6(y1 - y0)}*t`], t: [0, 1], color: 'ink2', width: 1.6,
});

// the worked example: a rod held up by the magnetic force
const EX = { m: 0.05, L: 0.25, B: 0.5 };
EX.I = (EX.m * G0) / (EX.L * EX.B);

export default lesson({
  id: 'phys2220.B1.3',
  title: 'Forces on currents',
  minutes: 11, difficulty: 2,
  intro: t`A current is charge on the move, so a magnetic field pushes on a wire that carries one. Add up the sideways force $q\vec v_d\times\vec B$ on every drifting charge in a straight piece of wire and you get

$$\vec F = I\vec L\times\vec B, \qquad |\vec F| = ILB\sin\theta$$

The force is perpendicular both to the wire and to the field: zero for a wire lying along $\vec B$, largest for one straight across it. For a curved wire, add up $d\vec F = I\,d\vec l\times\vec B$ along it. This push spins every electric motor, drives every loudspeaker cone, and fires the railgun.`,
  symbols: [
    { tex: '\\vec F', text: 'the magnetic force on the straight piece of wire, in N' },
    { tex: 'I', text: 'the current, in amperes (A): 1 A is 1 C of charge passing per second' },
    { tex: '\\vec L', text: 'a vector along the wire, as long as the piece of wire in the field (m), pointing the way the current flows' },
    { tex: '\\vec B', text: 'the magnetic field, in tesla (T), assumed uniform along the piece of wire' },
    { tex: '\\theta', text: 'the angle between the wire (the current) and the field' },
    { tex: 'd\\vec l', text: 'a short piece of a curved wire, pointing along the current: each piece feels $d\\vec F = I\\,d\\vec l\\times\\vec B$' },
  ],
  why: 'Every motor and loudspeaker runs on this push — and in orbit an electrodynamic tether uses it to raise or lower a spacecraft without propellant.',
  visual: {
    type: 'calc-vectors3d',
    title: 'A wire across a field gets pushed sideways',
    lead: t`A 20 cm wire (grey) lies in the floor, carrying a current $I$ (blue arrow) at angle $\theta$ to a uniform field $\vec B$ (teal). The violet arrow is the force $\vec F = I\vec L\times\vec B$: fingers along the current, curled toward $\vec B$, thumb along $\vec F$.`,
    tasks: [
      'Turn the wire until it lies along B (θ = 0°): the force vanishes, whatever the current.',
      'Reverse the current: the force flips to point down.',
      'Double the current, then double B: each doubles the force — it is proportional to I, L and B.',
    ],
    params: {
      range: 3,
      constants: { L: 0.2 },
      sliders: [
        { key: 'th', label: 'Angle $\\theta$ between the wire and $\\vec B$', min: 0, max: 180, step: 5, value: 90, unit: '^\\circ', explain: 'Only the part of the wire across the field feels a push: the force goes as sin θ.' },
        { key: 'I', label: 'Current $I$', min: 0, max: 10, step: 0.5, value: 5, unit: '\\mathrm{A}', explain: 'The force is proportional to the current.' },
        { key: 'B', label: 'Field $B$', min: 0, max: 0.5, step: 0.01, value: 0.3, unit: '\\mathrm{T}', explain: 'A strong permanent magnet gives a few tenths of a tesla across a small gap.' },
      ],
      choices: [{ key: 's', label: 'Current direction', options: [[1, 'one way'], [-1, 'reversed']], value: 1, explain: 'Reversing the current reverses the force.' }],
      segments: [{ from: ['-1.6*sin(th*pi/180)', '-1.6*cos(th*pi/180)', 0], to: ['1.6*sin(th*pi/180)', '1.6*cos(th*pi/180)', 0], color: 'ink3', width: 5 }],
      vectors: [
        { from: [-2.3, -2.1, 0], to: [-2.3, 2.1, 0], color: COL.B },
        { from: [2.3, -2.1, 0], to: [2.3, 2.1, 0], color: COL.B, label: '\\vec B' },
        { from: [-2.3, -2.1, 1.5], to: [-2.3, 2.1, 1.5], color: COL.B },
        { from: [2.3, -2.1, 1.5], to: [2.3, 2.1, 1.5], color: COL.B },
        { from: ['-0.65*s*sin(th*pi/180)', '-0.65*s*cos(th*pi/180)', 0.28], to: ['0.45*s*sin(th*pi/180)', '0.45*s*cos(th*pi/180)', 0.28], color: COL.I, label: 'I' },
        { to: [0, 0, 's*2.4*I*L*B*sin(th*pi/180)'], color: COL.F, label: '\\vec F' },
      ],
      curves: [{ param: ['0.9*sin(t*th*pi/180)', '0.9*cos(t*th*pi/180)', 0], t: [0, 1], color: 'gold', width: 2, label: '\\theta', labelAt: 0.5 }],
      readouts: [{ label: '$|\\vec F| = ILB\\sin\\theta$', expr: 'I*L*B*sin(th*pi/180)', unit: '\\mathrm{N}', digits: 3 }],
    },
    caption: 'The field is uniform; four arrows stand for it. The wire and field directions are exact; the force arrow’s length is in proportion to |F|, which the readout gives for 20 cm of wire. Drag to rotate.',
  },
  example: {
    prompt: t`A copper rod 25 cm long, of mass 50 g, lies horizontally east–west in a horizontal $0.50$ T field that points north. What current, in which direction, makes the magnetic force hold the rod up against gravity? ($g = 9.81\ \text{m/s}^2$)`,
    visual: wireScene({
      dir: [1, 0, 0], F: [0, 0, 1.6], axisLabels: ['east', 'north', 'up'],
      caption: 'The rod (grey) along east–west, the field pointing north (teal), the current flowing east (blue) and the magnetic force (violet) pointing up. Drag to rotate.',
    }),
    steps: [
      { label: 'Balance', text: t`To float, the magnetic force must equal the weight: $ILB\sin 90^\circ = mg$.` },
      { label: 'Current', text: t`$I = \dfrac{mg}{LB} = \dfrac{(0.050\ \text{kg})(9.81\ \text{m/s}^2)}{(0.25\ \text{m})(0.50\ \text{T})} = ${tn(EX.I)}$ A.` },
      { label: 'Direction', text: t`The force must point up. Try the current flowing east: fingers east, curled toward north, thumb **up**. ✓ (East $\times$ north $=$ up: $\hat\imath\times\hat\jmath = \hat k$.) A current flowing west would push the rod down.` },
      { label: 'Sense check', text: t`Four amperes is a modest current — but a 0.50 T field across 25 cm takes a large electromagnet. This balance of a magnetic force against a known weight is how currents were once calibrated: the “current balance”.` },
    ],
    answer: t`$I = ${tn(EX.I)}$ A, flowing east.`,
  },
  practice: [
    num({
      id: 'wire-force', difficulty: 1,
      gen(r) {
        const L = r.pick([0.15, 0.25, 0.4, 0.6]), I = r.pick([2.5, 4, 8, 12, 20]), B = r.pick([0.08, 0.15, 0.3, 0.6, 1.2]), th = r.pick([30, 60, 90, 120, 150]);
        const s = Math.sin(th * DEG), F = I * L * B * s;
        const errors = th === 90 ? [] : [
          { value: I * L * B, feedback: t`Include $\sin\theta$: only the part of the wire across the field is pushed.` },
          { value: I * L * B * Math.abs(Math.cos(th * DEG)), feedback: t`The force goes as $\sin\theta$ — zero along the field, largest across it — not $\cos\theta$.` },
        ];
        return {
          prompt: t`A straight wire carries $${I}$ A. A ${L * 100} cm length of it lies in a uniform $${B}$ T field, at $${th}^\circ$ to the field. What is the size of the magnetic force on that length of wire?`,
          visual: wireScene({ dir: [Math.sin(th * DEG), Math.cos(th * DEG), 0], extra: { curves: [arc3([0, 1, 0], [Math.sin(th * DEG), Math.cos(th * DEG), 0], { R: 0.9, label: `${th}^\\circ` })] }, caption: 'The wire (grey) with its current (blue) in the field (teal), and the angle between them. Drag to rotate.' }),
          answer: F, units: 'N', tol: { rel: 0.01 }, errors,
          hints: [t`$|\vec F| = ILB\sin\theta$, with $L$ in metres.`, t`$\sin ${th}^\circ = ${s.toFixed(3)}$.`],
          teach: 'The force on a straight wire is ILB sin θ, with θ the angle between the current and the field.',
          explain: t`$F = ILB\sin\theta = (${I}\ \text{A})(${L}\ \text{m})(${B}\ \text{T})\sin ${th}^\circ = ${tn(F)}$ N.`,
        };
      },
    }),
    mcq({
      id: 'wire-direction', difficulty: 2,
      gen(r) {
        const dir = r.pick(['in', 'out']), iName = r.pick(['+x', '-x', '+y', '-y']);
        const Ld = AXES.find(([n]) => n === iName)[1], B = dir === 'in' ? [0, 0, -1] : [0, 0, 1], F = cross(Ld, B);
        const word = (u) => PAGE_WORD[axisTeX(u)];
        const horiz = Ld[0] !== 0;
        return {
          prompt: `A straight wire carries a current ${word(Ld)} through a uniform magnetic field that points ${word(B)}, as shown. Which way does the magnetic force on the wire point?`,
          visual: page({
            x: [-3, 3], y: [-1.9, 1.9],
            curves: [horiz ? seg2([-2.8, 0], [2.8, 0], { color: 'ink2', width: 4 }) : seg2([0, -1.8], [0, 1.8], { color: 'ink2', width: 4 })],
            points: fieldMarks(-2.5, 2.5, -1.5, 1.5, 6, 4, dir, { skip: (x, y) => (horiz ? Math.abs(y) < 0.35 : Math.abs(x) < 0.35) }),
            arrows: [{ from: [r4(-0.6 * Ld[0]), r4(-0.6 * Ld[1])], to: [r4(0.6 * Ld[0]), r4(0.6 * Ld[1])], color: COL.I, label: 'I', labelDx: 6, labelDy: -12 }],
            caption: `${dir === 'in' ? '× marks: the field points into the page.' : '• marks: the field points out of the page.'} The wire is grey; the blue arrow shows the current.`,
          }),
          choices: [word(F), word(neg(F)), word(B), word(Ld)].map(cap),
          answer: 0,
          why: {
            1: t`That is opposite to $I\vec L\times\vec B$. Fingers along the current, curled toward $\vec B$ (${word(B)}): your thumb gives the force.`,
            2: 'The force on a wire is never along the field: it is perpendicular to B.',
            3: 'The magnetic force is perpendicular to the wire: it pushes the wire sideways, not along itself.',
          },
          hints: ['Point your fingers along the current, then curl them toward B. Your thumb gives the force.', t`With $x$ to the right, $y$ up the page and $z$ out of it: $\hat\imath\times\hat\jmath = \hat k$, $\hat\jmath\times\hat k = \hat\imath$, $\hat k\times\hat\imath = \hat\jmath$.`],
          teach: t`The force on a current-carrying wire is along $I\vec L\times\vec B$: perpendicular to both the wire and the field.`,
          explain: t`$\vec L$ points ${word(Ld)} and $\vec B$ ${word(B)}, so $I\vec L\times\vec B$ points ${word(F)}.`,
        };
      },
    }),
    mcq({
      id: 'along-field', difficulty: 1,
      prompt: t`A wire carrying $20$ A runs straight across the gap of a magnet, exactly along its uniform $0.80$ T field. What magnetic force acts on 10 cm of the wire?`,
      visual: page({
        x: [-3.2, 3.2], y: [-1.7, 1.7],
        shade: [{ fn: '1.5', lower: '-1.5', from: -3.1, to: -2.3, color: 'ink3', alpha: 0.5 }, { fn: '1.5', lower: '-1.5', from: 2.3, to: 3.1, color: 'ink3', alpha: 0.5 }],
        curves: [...[-1.1, -0.55, 0.55, 1.1].map((y) => seg2([-2.3, y], [2.3, y], { color: COL.B, width: 1.4 })), seg2([-2.3, 0], [2.3, 0], { color: 'ink2', width: 4 })],
        arrows: [...[-1.1, -0.55, 0.55, 1.1].map((y) => ({ from: [-1.6, y], to: [-1.2, y], color: COL.B })), { from: [0.4, 0], to: [1.3, 0], color: COL.I, label: 'I', labelDx: 6, labelDy: -12 }],
        points: [lab(-2.7, 0, 'N', 'ink'), lab(2.7, 0, 'S', 'ink')],
        caption: 'The field crosses the gap from N to S (teal); the wire (grey) runs along it, carrying the current to the right. Not to scale.',
      }),
      choices: ['None: a current along the field feels no force', t`$1.6$ N, sideways`, t`$1.6$ N, along the wire`, t`$16$ N, sideways`],
      answer: 0,
      why: {
        1: t`$ILB = 1.6$ N only when the wire crosses the field. Here $\theta = 0^\circ$, so $\sin\theta = 0$.`,
        2: 'A magnetic force never points along the wire — and here there is none at all.',
        3: t`Check the length: 10 cm is 0.10 m. And in any case $\sin 0^\circ = 0$.`,
      },
      hints: [t`$|\vec F| = ILB\sin\theta$. What is the angle between the current and the field?`],
      teach: 'A wire lying along the field feels no magnetic force: sin 0° = 0.',
      explain: t`The current runs along $\vec B$, so $\theta = 0^\circ$ and $F = ILB\sin 0^\circ = 0$. Each drifting charge moves along the field, and charges moving along $\vec B$ feel nothing.`,
    }),
    num({
      id: 'levitate', difficulty: 2,
      gen(r) {
        const mg = r.pick([10, 20, 35, 50]), L = r.pick([0.1, 0.2, 0.3]), B = r.pick([0.2, 0.4, 0.8]);
        const I = ((mg / 1000) * G0) / (L * B);
        return {
          prompt: t`A horizontal rod of mass ${mg} g and length ${L * 100} cm sits in a horizontal $${B}$ T field at right angles to it. What current must it carry for the magnetic force to support its whole weight? ($g = 9.81\ \text{m/s}^2$)`,
          visual: page({
            x: [-3, 3], y: [-1.8, 1.8],
            shade: [{ fn: '1.6', lower: '-1.6', from: -2.9, to: -2.1, color: 'ink3', alpha: 0.5 }, { fn: '1.6', lower: '-1.6', from: 2.1, to: 2.9, color: 'ink3', alpha: 0.5 }],
            curves: [...[-1.2, -0.6, 0.6, 1.2].map((y) => seg2([-2.1, y], [2.1, y], { color: COL.B, width: 1.3 })), circ2(0, 0, 0.32, { color: 'ink2', width: 2.2 })],
            arrows: [...[-1.2, -0.6, 0.6, 1.2].map((y) => ({ from: [-1.5, y], to: [-1.1, y], color: COL.B })), { from: [0, 0.32], to: [0, 1.25], color: COL.F, label: 'F', labelDx: 8, labelDy: 0 }, { from: [0, -0.32], to: [0, -1.25], color: 'ink2', label: 'mg', labelDx: 8, labelDy: 0 }],
            points: [lab(-2.5, 0, 'N', 'ink'), lab(2.5, 0, 'S', 'ink'), lab(0, 0, '•', COL.I)],
            caption: 'The rod seen end-on between the poles, its current coming out of the page (•), with the magnetic force (violet) balancing its weight. Not to scale.',
          }),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: [{ value: (mg * G0) / (L * B), feedback: 'Convert the mass to kilograms first.' }, { value: (L * B) / ((mg / 1000) * G0), feedback: t`Upside down: $ILB = mg$ gives $I = mg/(LB)$.` }],
          hints: ['Set the magnetic force equal to the weight.', t`$ILB = mg$, so $I = \dfrac{mg}{LB}$ — with $m$ in kg and $L$ in m.`],
          teach: 'To hold a rod up, the magnetic force ILB must equal its weight mg.',
          explain: t`$I = \dfrac{mg}{LB} = \dfrac{(${tn(mg / 1000)})(9.81)}{(${L})(${B})} = ${tn(I)}$ A.`,
        };
      },
    }),
    mcq({
      id: 'semicircle', difficulty: 3,
      prompt: t`A wire bent into a semicircle of radius $R$ carries a current $I$, in a uniform field $\vec B$ perpendicular to the semicircle’s plane. What is the size of the total magnetic force on the semicircle?`,
      visual: page({
        x: [-2.6, 2.6], y: [-0.5, 2.1],
        curves: [circ2(0, 0, 1.6, { color: 'ink2', width: 4, a0: 0, a1: Math.PI }), seg2([-1.6, 0], [1.6, 0], { color: 'ink3', width: 1.4, dash: true }), circ2(0, 0, 1.92, { color: COL.I, width: 2, a0: 0.55, a1: 1.0 })],
        points: [...fieldMarks(-2.3, 2.3, 0.15, 1.95, 7, 3, 'in', { skip: (x, y) => Math.abs(Math.hypot(x, y) - 1.75) < 0.45 }), lab(0, -0.22, '2R', 'ink3')],
        arrows: [{ from: [r4(1.92 * Math.cos(0.95)), r4(1.92 * Math.sin(0.95))], to: [r4(1.92 * Math.cos(1.12)), r4(1.92 * Math.sin(1.12))], color: COL.I, label: 'I', labelDx: -14, labelDy: -6 }],
        caption: 'The semicircular wire (grey) carrying I, in a field pointing into the page (×). The dashed line joins its ends, a distance 2R apart.',
      }),
      choices: [
        t`$2IRB$ — the same as a straight wire joining its ends`,
        t`$\pi IRB$ — the length of the arc times $IB$`,
        'Zero — the pieces of the curve push in different directions and cancel',
        t`$IRB$`,
      ],
      answer: 0,
      why: {
        1: t`Each piece $d\vec l$ is pushed perpendicular to itself, so the pieces push in different directions; adding their sizes, $\pi R\cdot IB$, overcounts.`,
        2: 'The sideways parts do cancel in pairs, but the parts along the semicircle’s axis of symmetry all point the same way and add up.',
        3: t`The straight wire with the same ends is $2R$ long, not $R$.`,
      },
      hints: [t`Each short piece feels $d\vec F = I\,d\vec l\times\vec B$. Add these as vectors, not as sizes.`, t`$\sum I\,d\vec l\times\vec B = I\left(\sum d\vec l\right)\times\vec B$, and the pieces $d\vec l$ add up to the straight line from one end to the other.`],
      teach: 'In a uniform field, any wire feels the same force as a straight wire joining its ends: the dl vectors add to that chord.',
      explain: t`Because $\vec B$ is uniform it comes out of the sum: $\vec F = I\left(\int d\vec l\right)\times\vec B$, and the pieces $d\vec l$ add up to the chord, of length $2R$. So $F = I(2R)B = 2IRB$, pointing along the symmetry axis — $${tn(2 / Math.PI, 2)}$ of the naive $\pi IRB$.`,
    }),
    mcq({
      id: 'closed-loop', difficulty: 2,
      prompt: t`A rectangular loop of wire carries a current anticlockwise, lying in the page in a uniform magnetic field that points into the page. What is the total magnetic force on the loop?`,
      visual: page({
        x: [-3, 3], y: [-1.9, 1.9],
        curves: [seg2([-1.5, -0.9], [1.5, -0.9], { color: 'ink2', width: 3 }), seg2([1.5, -0.9], [1.5, 0.9], { color: 'ink2', width: 3 }), seg2([1.5, 0.9], [-1.5, 0.9], { color: 'ink2', width: 3 }), seg2([-1.5, 0.9], [-1.5, -0.9], { color: 'ink2', width: 3 })],
        points: fieldMarks(-2.6, 2.6, -1.6, 1.6, 7, 5, 'in', { skip: (x, y) => (Math.abs(Math.abs(x) - 1.5) < 0.35 && Math.abs(y) < 1.2) || (Math.abs(Math.abs(y) - 0.9) < 0.35 && Math.abs(x) < 1.8) }),
        arrows: [
          { from: [-1.1, -0.9], to: [-0.5, -0.9], color: COL.I, label: 'I', labelDx: 0, labelDy: 14 },
          { from: [1.5, -0.55], to: [1.5, -0.05], color: COL.I },
          { from: [1.1, 0.9], to: [0.5, 0.9], color: COL.I },
          { from: [-1.5, 0.55], to: [-1.5, 0.05], color: COL.I },
          { from: [0, -0.9], to: [0, -0.4], color: COL.F }, { from: [0, 0.9], to: [0, 0.4], color: COL.F },
          { from: [1.5, 0.4], to: [1.0, 0.4], color: COL.F, label: 'F', labelDx: -4, labelDy: -10 }, { from: [-1.5, -0.4], to: [-1.0, -0.4], color: COL.F },
        ],
        caption: 'The loop (grey) with its current (blue) in a field into the page (×). The violet arrows are the forces on the four sides. Not to scale.',
      }),
      choices: [
        'Zero: the forces on opposite sides are equal and opposite',
        'Inward, four times the force on one side',
        'Out of the page, because the loop’s current makes its own field',
        'Along the current, round the loop',
      ],
      answer: 0,
      why: {
        1: 'Each side is pushed toward the middle, but opposite sides are pushed in opposite directions: the four forces add to zero. They only squeeze the loop.',
        2: 'A loop’s own field cannot push the loop as a whole; and in the page here the forces all lie in the plane of the loop.',
        3: 'A magnetic force on a wire is always perpendicular to the wire, never along it.',
      },
      hints: ['Find the force on each side with F = IL × B, then add the four forces as vectors.', 'Opposite sides carry the current in opposite directions.'],
      teach: 'A closed current loop in a uniform field feels no net force: the forces on its sides cancel in pairs.',
      explain: t`Opposite sides have equal lengths and opposite currents, so their forces are equal and opposite: the total is zero. (The same holds for any closed loop in a uniform field: $\oint d\vec l = 0$.) A loop tilted to the field still feels no net force — but, as the next lesson shows, a **torque**.`,
    }),
    mcq({
      id: 'find-error', difficulty: 2, kind: 'error',
      prompt: t`A wire carries a current to the east, through a field that points north. A student argues: “The current is carried by electrons, and they drift **west**. Fingers west, curled toward north: thumb down. So the force on the wire is **down**.” What is wrong?`,
      visual: wireScene({ dir: [1, 0, 0], axisLabels: ['east', 'north', 'up'], caption: 'The wire (grey) with its conventional current (blue) flowing east, in a field pointing north (teal). Drag to rotate.' }),
      choices: [
        t`The electrons are negative, so the force on them is opposite to $\vec v\times\vec B$: up. The wire is pushed up, just as $I\vec L\times\vec B$ says`,
        'Nothing: a current carried by electrons is pushed the opposite way to one carried by positive charges',
        'The fingers should start along the field and curl toward the electrons’ velocity',
        'The force points east, along the current',
      ],
      answer: 0,
      why: {
        1: t`Flip the sign of the carriers and you flip their velocity too (for the same current), so $q\vec v$ — and the force — stays the same. Only the Hall effect, a sideways pile-up of charge, reveals the sign of the carriers.`,
        2: t`That computes $\vec B\times\vec v$ — the right answer here only by accident. The rule is fingers along $\vec v$, curled toward $\vec B$, then flip for a negative charge.`,
        3: 'The force on a wire is perpendicular to the wire, never along it.',
      },
      hints: [t`The force on each electron is $q\vec v\times\vec B$ with $q = -e$.`, t`West $\times$ north $=$ down. Now include the electron’s negative charge.`],
      teach: 'The force on a wire does not depend on the sign of the carriers: use the conventional current, F = IL × B.',
      explain: t`For each electron, $\vec v\times\vec B$ points down, but $q = -e$ turns the force up. Conventional current gives the same answer directly: east $\times$ north $=$ up, so $I\vec L\times\vec B$ points up.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 2, transfer: true,
      gen(r) {
        const Lkm = r.pick([2, 5, 10]), I = r.pick([0.5, 1, 2]), BuT = r.pick([20, 30, 40]);
        const F = I * Lkm * 1e3 * BuT * 1e-6;
        return {
          prompt: t`An **electrodynamic tether** is a long conducting wire hanging below a spacecraft in low Earth orbit. A ${Lkm} km tether, vertical, carries a current of $${I}$ A through Earth’s field, which there is horizontal, points north, and has a strength of $${BuT}\ \mu\text{T}$. What is the size of the magnetic force on the tether?`,
          visual: scene3({
            axisLabels: ['east', 'north', 'up'],
            segments: [{ from: [0, 0, -1.4], to: [0, 0, 1.4], color: 'ink2', width: 4 }],
            vectors: [arrow3([0, 0, 0.35], COL.I, 'I', [0, 0, -0.55]), arrow3([2.2, 0, 1.4], COL.v, '\\vec v', [0.8, 0, 1.4]), arrow3([-2.2, 2.1, 0], COL.B, '\\vec B', [-2.2, -2.1, 0]), arrow3([2.2, 2.1, 0], COL.B, '', [2.2, -2.1, 0])],
            caption: 'The tether (grey) hanging vertically, its current flowing up (blue), the spacecraft’s velocity east (green) and Earth’s field pointing north (teal). Not to scale. Drag to rotate.',
          }),
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: I * Lkm * BuT * 1e-6, feedback: 'Convert the length to metres: 1 km = 1000 m.' }],
          hints: [t`The tether is perpendicular to the field, so $F = ILB$.`, t`$L = ${Lkm}\times10^{3}$ m and $B = ${BuT}\times10^{-6}$ T.`],
          teach: 'F = ILB applies to any straight conductor across a field — even a kilometres-long tether in orbit.',
          explain: t`$F = ILB = (${I}\ \text{A})(${Lkm}\times10^{3}\ \text{m})(${BuT}\times10^{-6}\ \text{T}) = ${tn(F)}$ N. Small — but it acts all the time, with no propellant. With the current flowing up, up $\times$ north points **west**, against the orbital motion: a drag that lowers the orbit (the tether’s own motional emf drives the current that way, as Lenz’s law will explain). Driving the current down with solar power turns the force round, into a thrust.`,
        };
      },
    }),
    mcq({
      id: 'cp-direction', difficulty: 2,
      gen(r) {
        const iv = r.int(0, 5);
        let ib = r.int(0, 5);
        while (Math.floor(ib / 2) === Math.floor(iv / 2)) ib = r.int(0, 5);
        const Ld = AXES[iv][1], B = AXES[ib][1], F = cross(Ld, B);
        return {
          prompt: t`A straight wire carries a current along $${axisTeX(Ld)}$ through a uniform magnetic field that points along $${axisTeX(B)}$. Which way does the magnetic force on the wire point?`,
          visual: wireScene({ dir: Ld, B, caption: 'The wire (grey), its current (blue) and the field (teal). The axes are right-handed. Drag to rotate.' }),
          choices: [t`Along $${axisTeX(F)}$`, t`Along $${axisTeX(neg(F))}$`, t`Along $${axisTeX(B)}$`, t`Along $${axisTeX(Ld)}$`],
          answer: 0,
          why: { 1: t`That is $-I\vec L\times\vec B$: check the order — fingers along the current, curled toward $\vec B$.`, 2: 'The force on a wire is never along the field.', 3: 'The force on a wire is never along the wire.' },
          hints: ['Fingers along the current, curled toward B: thumb along the force.', t`$\hat\imath\times\hat\jmath = \hat k$, $\hat\jmath\times\hat k = \hat\imath$, $\hat k\times\hat\imath = \hat\jmath$.`],
          teach: 'The force on a straight current is along IL × B, perpendicular to both the wire and the field.',
          explain: t`$\vec L$ along $${axisTeX(Ld)}$ crossed with $\vec B$ along $${axisTeX(B)}$ points along $${axisTeX(F)}$.`,
        };
      },
    }),
    num({
      id: 'cp-springs', difficulty: 3,
      gen(r) {
        const m = r.pick([30, 40, 60]), L = r.pick([0.2, 0.3]), B = r.pick([0.4, 0.6]), [x0, x1] = r.pick([[1.2, 0.8], [1.5, 0.9], [2.0, 1.5]]);
        const F = (m / 1000) * G0 * (1 - x1 / x0), I = F / (L * B);
        return {
          prompt: t`A horizontal metal rod (mass ${m} g, length ${L * 100} cm) hangs from two light springs in a horizontal $${B.toFixed(2)}$ T field at right angles to it. With no current the springs are stretched by ${x0.toFixed(1)} cm. When a current flows through the rod, the stretch shrinks to ${x1.toFixed(1)} cm. What is the current? ($g = 9.81\ \text{m/s}^2$)`,
          visual: page({
            x: [-3, 3], y: [-2.0, 2.0],
            curves: [spring(-1.2, 1.8, 0.1), spring(1.2, 1.8, 0.1), seg2([-2.2, 1.8], [2.2, 1.8], { color: 'ink3', width: 3 }), seg2([-1.9, 0], [1.9, 0], { color: 'ink2', width: 5 })],
            points: fieldMarks(-2.6, 2.6, -1.7, 1.2, 7, 4, 'in', { skip: (x, y) => Math.abs(y) < 0.3 || (Math.abs(Math.abs(x) - 1.2) < 0.35 && y > 0) }),
            arrows: [{ from: [-0.5, 0], to: [0.5, 0], color: COL.I, label: 'I', labelDx: 0, labelDy: -14 }],
            caption: 'The rod (grey) hanging from two springs in a field into the page (×), carrying the current to the right (blue). Not to scale.',
          }),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: [{ value: ((m / 1000) * G0) / (L * B), feedback: 'That current would support the whole weight. The springs still carry part of it: the magnetic force is only the weight the springs no longer hold.' }],
          hints: [t`With no current, the springs’ force $k x_0$ equals the weight $mg$, so $k = mg/x_0$.`, t`With the current, $k x_1 + ILB = mg$, so $ILB = mg\left(1 - x_1/x_0\right)$.`],
          teach: 'A magnetic force adds to the other forces in a free-body diagram like any other force: here it takes over part of the springs’ load.',
          explain: t`The springs now hold only $x_1/x_0 = ${(x1 / x0).toFixed(3)}$ of the weight, so the magnetic force supplies the rest: $ILB = mg(1 - x_1/x_0) = ${tn(F)}$ N, and $I = ${tn(F)}/(${L}\times${B}) = ${tn(I)}$ A. With the current to the right in a field into the page, $I\vec L\times\vec B$ points up, as it must.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §11.5', url: 'https://openstax.org/books/university-physics-volume-2/pages/11-5-magnetic-force-on-a-current-carrying-conductor' },
    { label: 'NASA Technical Reports: electrodynamic tethers in space (ProSEDS)', url: 'https://ntrs.nasa.gov/search?q=ProSEDS%20electrodynamic%20tether' },
  ],
});
