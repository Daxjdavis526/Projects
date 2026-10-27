// The magnetic force on a moving charge, F = qv × B: sideways to both the
// velocity and the field, zero for a charge at rest or moving along B, and
// never doing work. Field lines of B close on themselves (no monopoles).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import {
  QE, MP, G0, DEG, COL, PARTICLES, AXES, tn, r4, cross, scale, neg, axisTeX,
  arrow3, arc3, scene3, lab, seg2, circ2, fieldMarks, page, barMagnetParts,
} from './_magnet.js';

const t = String.raw;

// the Explore scene: B along +y, v in the floor at θ from B, F = q v × B along ±z
const TH = 'th*pi/180';
const V3 = [`v*sin(${TH})`, `v*cos(${TH})`, 0];

// v and B at an angle θ (degrees), with the angle marked; the force not drawn
function anglePic(th, charge, caption) {
  const B = [0, 2.2, 0], v = [2 * Math.sin(th * DEG), 2 * Math.cos(th * DEG), 0];
  return scene3({
    charge, vectors: [arrow3(B, COL.B, '\\vec B'), arrow3(v, COL.v, '\\vec v')],
    curves: [arc3(B, v, { R: 0.8, label: `${th}^\\circ` })],
    caption: caption ?? 'The velocity (green) and the field (teal) at the particle, with the angle between them. Drag to rotate.',
  });
}

// words for the six directions in the plane of the page
const PAGE_WORD = { '+x': 'to the right', '-x': 'to the left', '+y': 'up the page', '-y': 'down the page', '+z': 'out of the page', '-z': 'into the page' };

// the auroral example: gyrofrequency of an electron (rounded constants)
const gyroMHz = (B) => (QE * B) / (2 * Math.PI * 9.109e-31) / 1e6;

export default lesson({
  id: 'phys2220.B1.1',
  title: 'Magnetic fields and the Lorentz force',
  minutes: 12, difficulty: 2,
  intro: t`A magnetic field pushes only on charges that **move**, and it pushes **sideways**: the force is perpendicular both to the velocity and to the field,

$$\vec F = q\vec v\times\vec B, \qquad |\vec F| = |q|\,vB\sin\theta$$

So a charge at rest feels nothing, and a charge moving along the field feels nothing. Because the force is always at right angles to the motion, **a magnetic field never does work**: it can steer a charge but never speed it up. Add an electric field and you have the whole **Lorentz force**, $\vec F = q(\vec E + \vec v\times\vec B)$ — the rule that guides the electrons of an aurora, the ions in a Hall thruster and the beams of every particle accelerator.`,
  symbols: [
    { tex: '\\vec F', text: 'the magnetic force on the charge, in newtons (N)' },
    { tex: 'q', text: 'the charge, in coulombs (C), **with its sign**: $+e$ for a proton, $-e$ for an electron, where $e = 1.602\\times10^{-19}$ C' },
    { tex: '\\vec v', text: 'the velocity of the charge, in m/s' },
    { tex: '\\vec B', text: 'the magnetic field, in tesla (T), where $1\\ \\text{T} = 1\\ \\text{N}/(\\text{A·m})$. Earth’s field at the surface is 25–65 μT; a fridge magnet about 5 mT; a hospital MRI magnet 1.5–3 T' },
    { tex: '\\theta', text: 'the angle between $\\vec v$ and $\\vec B$: only the part of the velocity perpendicular to the field, $v\\sin\\theta$, feels a force' },
    { tex: '\\times', text: 'the cross product. **Right-hand rule:** point your fingers along $\\vec v$ and curl them toward $\\vec B$; your thumb points along $\\vec v\\times\\vec B$. For a negative charge the force points the other way' },
    { tex: '\\vec E', text: 'an electric field, in N/C, if one is present too: its push $q\\vec E$ adds to the magnetic one' },
  ],
  why: 'This sideways push on moving charge runs every electric motor, mass spectrometer and particle accelerator — and special relativity will show that electric and magnetic fields are two views of one field.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Sweep v into B: the force stands up out of their plane',
    lead: t`The field $\vec B$ (teal) points along $+y$; the velocity $\vec v$ (green) lies in the floor at angle $\theta$ from it. The violet arrow is the force $\vec F = q\vec v\times\vec B$. Curl your right-hand fingers along the gold arc, from $\vec v$ toward $\vec B$: your thumb points along $\vec v\times\vec B$ — and along $\vec F$ for a positive charge.`,
    tasks: [
      'Close θ to 0°: with v along B the force vanishes, however fast the charge moves.',
      'Set θ = 90°: the force is as large as it gets, |q|vB.',
      'Switch to the electron: the force flips, though v and B have not changed.',
      'Turn the picture: F always stands at right angles to the shaded plane that holds v and B.',
    ],
    params: {
      range: 3,
      constants: { e0: QE },
      sliders: [
        { key: 'th', label: 'Angle $\\theta$ between $\\vec v$ and $\\vec B$', min: 0, max: 180, step: 5, value: 90, unit: '^\\circ', explain: t`Only the part of $\vec v$ perpendicular to $\vec B$, $v\sin\theta$, feels a force.` },
        { key: 'v', label: 'Speed $v$', min: 0, max: 2.5, step: 0.1, value: 2, unit: '\\times10^{6}\\ \\mathrm{m/s}', explain: 'The force grows in proportion to the speed: a charge at rest feels no magnetic force at all.' },
        { key: 'B', label: 'Field strength $B$', min: 0, max: 2, step: 0.1, value: 1.5, unit: '\\mathrm{T}', explain: 'In tesla. 1.5 T is a hospital MRI magnet; Earth’s field, about 50 μT, is thirty thousand times weaker.' },
      ],
      choices: [{ key: 'q', label: 'The moving charge', options: [[1, 'proton, +e'], [-1, 'electron, −e']], value: 1, explain: 'Same size of charge, opposite sign.' }],
      parallelograms: [{ at: [0, 0, 0], u: V3, v: [0, 'B', 0], color: COL.B, alpha: 0.12 }],
      curves: [{ param: [`0.8*sin((1 - t)*${TH})`, `0.8*cos((1 - t)*${TH})`, 0], t: [0, 1], color: 'gold', width: 2, label: '\\theta', labelAt: 0.5 }],
      vectors: [
        { to: [0, 'B', 0], color: COL.B, label: '\\vec B' },
        { to: V3, color: COL.v, label: '\\vec v' },
        { to: [0, 0, `q*0.6*v*B*sin(${TH})`], color: COL.F, label: '\\vec F' },
      ],
      points: [{ at: [0, 0, 0], color: COL.pos, r: 6.5, when: 'step(q)' }, { at: [0, 0, 0], color: COL.neg, r: 6.5, when: 'step(-q)' }],
      readouts: [{ label: '$|\\vec F| = |q|vB\\sin\\theta$', expr: `e0*1e19*v*B*sin(${TH})`, unit: '\\times10^{-13}\\ \\mathrm{N}', digits: 3 }],
    },
    caption: 'v and B are to scale (v in 10⁶ m/s, B in tesla); the force arrow’s length is proportional to |F|, which the readout gives for a proton or an electron — they carry the same size of charge. The field is drawn as one arrow: only its value at the charge matters. Drag to rotate.',
  },
  example: {
    prompt: t`Near the magnetic equator Earth’s field is horizontal, points north, and is about $30\ \mu\text{T}$ strong. A proton moves straight down there at $1.0\times10^{7}$ m/s (slow, by cosmic-ray standards). Find the magnetic force on it — size and direction — and compare it with the proton’s weight. ($e = 1.602\times10^{-19}$ C, $m_p = 1.673\times10^{-27}$ kg)`,
    visual: scene3({
      axisLabels: ['east', 'north', 'up'], charge: 1,
      vectors: [arrow3([0, 0, -2.2], COL.v, '\\vec v'), arrow3([0, 1.8, 0], COL.B, '\\vec B'), arrow3([2.2, 0, 0], COL.F, '\\vec F')],
      curves: [arc3([0, 0, -1], [0, 1, 0], { R: 0.8 })],
      caption: 'The proton (red) moving down, Earth’s field pointing north, and the force (violet) pointing east. The gold arc is the right-hand sweep from v to B. Arrow lengths are not to scale. Drag to rotate.',
    }),
    steps: [
      { label: 'Set up axes', text: t`Let $x$ point east, $y$ north and $z$ up. Then $\vec v = (0,\ 0,\ -1.0\times10^{7})$ m/s and $\vec B = (0,\ 30\times10^{-6},\ 0)$ T: they are at $90^\circ$ to each other.` },
      { label: 'Size', text: t`$F = |q|vB\sin\theta = (1.602\times10^{-19}\ \text{C})(1.0\times10^{7}\ \text{m/s})(30\times10^{-6}\ \text{T})(1) = ${tn(QE * 1e7 * 30e-6)}$ N.` },
      { label: 'Direction', text: t`Fingers down (along $\vec v$), curled toward north (along $\vec B$): your thumb points **east**. Check with unit vectors: $(-\hat k)\times\hat\jmath = \hat\imath$, east. The proton is positive, so $\vec F$ points along $\vec v\times\vec B$.` },
      { label: 'Compare with gravity', text: t`The weight is $m_pg = (1.673\times10^{-27}\ \text{kg})(9.81\ \text{m/s}^2) = ${tn(MP * G0)}$ N — about $${tn((QE * 1e7 * 30e-6) / (MP * G0), 2)}$ times smaller. For charged particles in fields, gravity can be ignored.` },
      { label: 'What it means', text: t`Positive particles coming down near the equator are bent toward the east. The same bending is behind the **east–west effect**: more cosmic rays arrive from the west than from the east, which showed in the 1930s that most of them are positively charged.` },
    ],
    answer: t`$F = ${tn(QE * 1e7 * 30e-6)}$ N, pointing east — about $${tn((QE * 1e7 * 30e-6) / (MP * G0), 2)}$ times the proton’s weight.`,
  },
  practice: [
    mcq({
      id: 'rhr-direction', difficulty: 2,
      gen(r) {
        const iv = r.int(0, 5);
        let ib = r.int(0, 5);
        while (Math.floor(ib / 2) === Math.floor(iv / 2)) ib = r.int(0, 5);
        const key = r.pick(['proton', 'electron']), P = PARTICLES[key], sg = key === 'proton' ? 1 : -1;
        const v = AXES[iv][1], B = AXES[ib][1], vxB = cross(v, B), F = scale(vxB, sg);
        return {
          prompt: t`${P.An} moves along $${axisTeX(v)}$ through a uniform magnetic field that points along $${axisTeX(B)}$. Which way does the magnetic force on it point?`,
          visual: scene3({
            charge: sg, vectors: [arrow3(scale(v, 2.2), COL.v, '\\vec v'), arrow3(scale(B, 2.2), COL.B, '\\vec B')],
            caption: `The ${P.name} (${sg > 0 ? 'red' : 'blue'}) with its velocity (green) and the field (teal). The axes are right-handed. Drag to rotate.`,
          }),
          choices: [t`Along $${axisTeX(F)}$`, t`Along $${axisTeX(neg(F))}$`, t`Along $${axisTeX(B)}$`, t`Along $${axisTeX(v)}$`],
          answer: 0,
          why: {
            1: sg > 0 ? t`That is $-\vec v\times\vec B$. Fingers along $\vec v$, curled toward $\vec B$: the thumb gives $\vec v\times\vec B$, along $${axisTeX(vxB)}$.` : t`That is the direction of $\vec v\times\vec B$ — but an electron is negative, so the force points the opposite way.`,
            2: 'A magnetic force is never along the field: it is perpendicular to B.',
            3: 'A magnetic force is never along the velocity. It is perpendicular to v, so it turns the particle without speeding it up.',
          },
          hints: [
            t`Point your fingers along $\vec v$, curl them toward $\vec B$: your thumb gives $\vec v\times\vec B$. Then remember the sign of the charge.`,
            t`Use $\hat\imath\times\hat\jmath = \hat k$, $\hat\jmath\times\hat k = \hat\imath$, $\hat k\times\hat\imath = \hat\jmath$ (reversing the order flips the sign), with $\hat\imath, \hat\jmath, \hat k$ along $+x, +y, +z$. ${sg < 0 ? 'Then reverse the result: the charge is negative.' : 'The charge is positive, so the force is along that product.'}`,
          ],
          teach: t`The magnetic force points along $q\vec v\times\vec B$: perpendicular to both $\vec v$ and $\vec B$, and reversed for a negative charge.`,
          explain: t`$\vec v\times\vec B$ points along $${axisTeX(vxB)}$${sg < 0 ? t`; the electron’s charge is negative, so the force points the other way, along $${axisTeX(F)}$` : ', and the proton is positive, so that is the force'}.`,
        };
      },
    }),
    num({
      id: 'force-size', difficulty: 2,
      gen(r) {
        const key = r.pick(['proton', 'electron', 'alpha']), P = PARTICLES[key];
        const v = r.pick([2.0e5, 4.5e5, 8.0e5, 1.5e6, 3.0e6, 6.0e6]);
        const [B, Bt] = r.pick([[0.05, '0.050'], [0.12, '0.12'], [0.25, '0.25'], [0.4, '0.40'], [0.85, '0.85'], [1.5, '1.5']]);
        const th = r.pick([30, 60, 90, 120, 150]);
        const Q = Math.abs(P.q), s = Math.sin(th * DEG), F = Q * v * B * s;
        const errors = [];
        if (th !== 90) {
          errors.push({ value: Q * v * B, feedback: t`You left out $\sin\theta$: only the part of $\vec v$ perpendicular to $\vec B$ counts.` });
          errors.push({ value: Q * v * B * Math.abs(Math.cos(th * DEG)), feedback: t`The magnetic force uses $\sin\theta$, not $\cos\theta$: it is largest when $\vec v$ is perpendicular to $\vec B$ and zero when they are parallel.` });
        }
        if (key === 'alpha') errors.push({ value: QE * v * B * s, feedback: t`An alpha particle (a helium nucleus) carries charge $+2e$, not $+e$.` });
        return {
          prompt: t`${P.An} (charge $${P.qTeX}$) moves at $${tn(v)}$ m/s through a uniform $${Bt}$ T magnetic field, at $${th}^\circ$ to the field. What is the size of the magnetic force on it? ($e = 1.602\times10^{-19}$ C)`,
          visual: anglePic(th, Math.sign(P.q)),
          answer: F, units: 'N', tol: { rel: 0.01 }, errors,
          hints: [t`$|\vec F| = |q|vB\sin\theta$, with $\theta$ the angle between $\vec v$ and $\vec B$.`, t`$|q| = ${tn(Q, 4)}$ C and $\sin ${th}^\circ = ${s.toFixed(3)}$.`],
          teach: t`The size of the magnetic force is $|q|vB\sin\theta$: charge, speed, field, and the sine of the angle between $\vec v$ and $\vec B$.`,
          explain: t`$F = |q|vB\sin\theta = (${tn(Q, 4)}\ \text{C})(${tn(v)}\ \text{m/s})(${Bt}\ \text{T})\sin ${th}^\circ = ${tn(F)}$ N.`,
        };
      },
    }),
    mcq({
      id: 'at-rest', difficulty: 1,
      prompt: t`An electron sits **at rest** in the gap of a strong electromagnet, where $B = 1.5$ T. What magnetic force acts on it?`,
      visual: page({
        x: [-3.4, 3.4], y: [-1.9, 1.9],
        shade: [{ fn: '1.6', lower: '-1.6', from: -3.3, to: -2.3, color: 'ink3', alpha: 0.5 }, { fn: '1.6', lower: '-1.6', from: 2.3, to: 3.3, color: 'ink3', alpha: 0.5 }],
        curves: [-1.2, -0.6, 0, 0.6, 1.2].map((y) => seg2([-2.3, y], [2.3, y], { color: COL.B, width: 1.6 })),
        arrows: [-1.2, -0.6, 0, 0.6, 1.2].map((y) => ({ from: [-1.4, y], to: [-0.9, y], color: COL.B })),
        points: [lab(-2.8, 0, 'N', 'ink'), lab(2.8, 0, 'S', 'ink'), { x: 0.6, y: 0.3, r: 7, color: COL.neg, label: 'e⁻ at rest', labelDx: 11, labelDy: -12 }],
        caption: 'The field crosses the gap from the N pole to the S pole (teal lines). The electron (blue) is not moving. Not to scale.',
      }),
      choices: [
        'None at all: a magnetic field pushes only on moving charges',
        'A pull toward the N pole',
        'A push along the field lines, toward the S pole',
        t`A force of $eB = 2.4\times10^{-19}$ N, across the field`,
      ],
      answer: 0,
      why: {
        1: 'Charges are not attracted to magnetic poles — that mixes up poles with electric charges. With v = 0, F = qv × B is zero.',
        2: 'That would make B act like an electric field. A magnetic force is never along B, and it needs the charge to move.',
        3: t`Check the units: $eB$ is in C·T, which is N·s/m — not a force. The force $qvB$ needs a speed, and here $v = 0$.`,
      },
      hints: ['Look at what the magnetic force depends on: F = qv × B.', 'What is v for this electron?'],
      teach: 'A magnetic field exerts no force on a charge at rest: the force needs a velocity.',
      explain: t`$\vec F = q\vec v\times\vec B$ and $\vec v = 0$, so $\vec F = 0$, however strong the field. (An electric field, by contrast, pushes on charges at rest.)`,
    }),
    mcq({
      id: 'no-work', difficulty: 2,
      prompt: 'A proton moves round a circle in a uniform magnetic field pointing into the page, with no other forces acting. Over one full circle, how much work does the magnetic force do on it, and what happens to its speed?',
      visual: page({
        x: [-3.2, 3.2], y: [-2.2, 2.2],
        curves: [circ2(0, 0, 1.5, { color: 'ink3', dash: true })],
        points: [
          ...fieldMarks(-3, 3, -2, 2, 7, 5, 'in', { skip: (x, y) => Math.abs(Math.hypot(x, y) - 1.5) < 0.45 || (Math.abs(x) < 0.4 && Math.abs(y) < 0.4) }),
          ...[-90, 30, 150].map((a) => ({ x: r4(1.5 * Math.cos(a * DEG)), y: r4(1.5 * Math.sin(a * DEG)), r: 6.5, color: COL.pos })),
        ],
        arrows: [-90, 30, 150].flatMap((a, k) => {
          const c = Math.cos(a * DEG), s = Math.sin(a * DEG), x = 1.5 * c, y = 1.5 * s;
          return [
            { from: [r4(x), r4(y)], to: [r4(x - 0.85 * s), r4(y + 0.85 * c)], color: COL.v, ...(k === 0 ? { label: 'v', labelDx: 6, labelDy: 10 } : {}) },
            { from: [r4(x), r4(y)], to: [r4(x - 0.65 * c), r4(y - 0.65 * s)], color: COL.F, ...(k === 0 ? { label: 'F', labelDx: 8, labelDy: 2 } : {}) },
          ];
        }),
        caption: '× marks: the field points into the page. The proton (red) shown at three moments, with its velocity (green) and the magnetic force (violet), which always points to the centre. Not to scale.',
      }),
      choices: [
        'No work at all, so the speed never changes: the force is always perpendicular to the velocity',
        'Positive work: the force keeps the proton going round, so it gradually speeds up',
        'Negative work: the force bends the proton off its straight path, which slows it down',
        'Zero net work over the whole circle, but the speed rises on one half and falls on the other',
      ],
      answer: 0,
      why: {
        1: 'Nothing needs to push a particle along to keep it moving. The force points at the centre, at 90° to the motion: it changes the direction of v, not its size.',
        2: 'Turning is not slowing. A force at right angles to the velocity does no work, so the kinetic energy cannot change.',
        3: 'That happens to a ball on a vertical loop, where gravity is sometimes along the motion. The magnetic force is perpendicular to v at every instant, so the speed is constant all the way round.',
      },
      hints: [t`Work is done at the rate $P = \vec F\cdot\vec v$.`, t`$\vec F = q\vec v\times\vec B$ is perpendicular to $\vec v$ at every instant, so what is $\vec F\cdot\vec v$?`],
      teach: 'A magnetic force is always perpendicular to the velocity, so it does no work and cannot change a particle’s speed or kinetic energy.',
      explain: t`The power delivered is $\vec F\cdot\vec v = q(\vec v\times\vec B)\cdot\vec v = 0$ at every instant, so the work is zero over any path and the speed is constant. The magnetic force only bends the path — here into a circle.`,
    }),
    mcq({
      id: 'field-lines', difficulty: 2,
      prompt: 'The picture shows the field lines of a bar magnet, outside it and inside it. Which statement about magnetic field lines is right?',
      visual: (() => {
        const m = barMagnetParts({});
        return page({ x: [-3.4, 3.4], y: [-1.8, 1.8], ...m, caption: 'Field lines of a bar magnet (teal), drawn as if its poles sat at its ends — a fair picture outside a long, thin magnet. Inside, the field runs from S back to N.' });
      })(),
      choices: [
        'They never end: each one is a closed loop, running from N to S outside the magnet and from S back to N inside it',
        'They begin on the N pole and end on the S pole, as electric field lines begin on positive charges and end on negative ones',
        'They are the paths a small charged particle would follow if it were released near the magnet',
        'Saw the magnet in half and you get one piece with only an N pole and one with only an S pole',
      ],
      answer: 0,
      why: {
        1: 'That would need magnetic “charges” (monopoles), and none has ever been found. Inside the magnet the lines carry on, from S back to N.',
        2: 'A magnetic force is perpendicular to B, so a moving charge is pushed across the lines, not along them — and a charge at rest is not pushed at all.',
        3: 'Each half is a whole magnet with its own N and S poles, and its field lines still close on themselves. No one has ever isolated a single pole.',
      },
      hints: ['Follow one field line out of the N end, round the outside and back into the magnet. Where does it go then?', 'Electric field lines start and end on charges. Is there a magnetic charge for a field line to end on?'],
      teach: 'Magnetic field lines have no beginning and no end: there are no magnetic monopoles, so every line closes on itself.',
      explain: t`Magnetic field lines form **closed loops** — outside the magnet from N to S, inside it from S back to N. In the language of flux, $\oint\vec B\cdot d\vec A = 0$ for every closed surface: as many lines leave any closed surface as enter it.`,
    }),
    num({
      id: 'e-and-b', difficulty: 3,
      gen(r) {
        const key = r.pick(['proton', 'electron']), P = PARTICLES[key];
        let v, B, E;
        do {
          v = r.pick([2, 3, 4, 5, 6, 8]) * 1e5;
          B = r.pick([0.05, 0.08, 0.1, 0.15, 0.2, 0.3]);
          E = r.pick([1, 2, 3, 4, 5, 6, 8]) * 1e4;
        } while (Math.abs(E - v * B) < 0.25 * Math.max(E, v * B));
        const q = P.q, Fy = q * (E - v * B);
        return {
          prompt: t`${P.An} moves along $+x$ at $${tn(v)}$ m/s through a region where an electric field of $${tn(E)}$ V/m points along $+y$ and a magnetic field of $${B.toPrecision(2)}$ T points along $+z$. What is the $y$-component of the total force on it? ($e = 1.602\times10^{-19}$ C)`,
          visual: scene3({
            charge: Math.sign(q),
            vectors: [arrow3([2.2, 0, 0], COL.v, '\\vec v'), arrow3([0, 0, 1.9], COL.B, '\\vec B'), arrow3([0, 1.9, 0], COL.E, '\\vec E')],
            caption: `The ${P.name} (${q > 0 ? 'red' : 'blue'}) with its velocity (green), the electric field (gold) and the magnetic field (teal). Lengths not to scale. Drag to rotate.`,
          }),
          answer: Fy, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: q * (E + v * B), feedback: t`Check the direction of $\vec v\times\vec B$: $\hat\imath\times\hat k = -\hat\jmath$, so the magnetic force here points along $-y$ for a positive charge.` },
            { value: q * E, feedback: t`That is only the electric part, $qE$. Add the magnetic part, $q\vec v\times\vec B$.` },
            { value: -q * v * B, feedback: t`That is only the magnetic part. Add the electric part, $qE$.` },
          ],
          hints: [
            t`Use the whole Lorentz force, $\vec F = q(\vec E + \vec v\times\vec B)$. Find the direction of $\vec v\times\vec B$ first.`,
            t`$\hat\imath\times\hat k = -\hat\jmath$, so $\vec v\times\vec B = -vB\,\hat\jmath$ and $F_y = q(E - vB)$. Keep the sign of $q$.`,
          ],
          teach: 'The electric and magnetic forces on a charge add as vectors: F = q(E + v × B).',
          explain: t`$\vec v\times\vec B = (v\hat\imath)\times(B\hat k) = -vB\,\hat\jmath$, so $F_y = q(E - vB) = (${tn(q, 4)}\ \text{C})(${tn(E)} - ${tn(v * B)})\ \text{V/m} = ${tn(Fy)}$ N. The two forces pull in opposite directions; when $E = vB$ exactly, they cancel and the particle goes straight — the idea of the velocity selector, coming next.`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 2, kind: 'error',
      prompt: t`An electron moves east through a magnetic field that points north. A student reasons: “Fingers point east, along $\vec v$; I curl them toward north, along $\vec B$; my thumb points up. So the force on the electron is **up**.” What is wrong?`,
      visual: scene3({
        axisLabels: ['east', 'north', 'up'], charge: -1,
        vectors: [arrow3([2.2, 0, 0], COL.v, '\\vec v'), arrow3([0, 2, 0], COL.B, '\\vec B')],
        caption: 'The electron (blue) moving east through a field pointing north. Drag to rotate.',
      }),
      choices: [
        t`Nothing in the hand rule — but the electron is negative, so the force is opposite to $\vec v\times\vec B$: it points down`,
        t`The fingers should start along $\vec B$ and curl toward $\vec v$`,
        'The force should point north, along the field',
        'There is no force, because the electron moves perpendicular to the field',
      ],
      answer: 0,
      why: {
        1: t`That computes $\vec B\times\vec v$, which does point down — the right answer for the wrong reason. The rule is always fingers along $\vec v$, curled toward $\vec B$; then reverse for a negative charge.`,
        2: 'A magnetic force is perpendicular to the field, never along it.',
        3: 'Moving perpendicular to B gives the largest force (sin 90° = 1). The force vanishes only when v is parallel to B.',
      },
      hints: ['Check each step of the hand rule, then check what kind of charge is moving.', t`The hand rule gives the direction of $\vec v\times\vec B$. The force is $q\vec v\times\vec B$, and for an electron $q = -e$.`],
      teach: 'The right-hand rule gives v × B; for a negative charge the force points the opposite way.',
      explain: t`East $\times$ north $=$ up, so $\vec v\times\vec B$ points up, as the student found. But $\vec F = q\vec v\times\vec B$ with $q = -e$, so the force on the electron points **down**.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-aurora', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([1.5e7, 2.0e7, 2.5e7, 3.0e7]), th = r.pick([20, 25, 30, 40]), BuT = r.pick([50, 55, 60]);
        const B = BuT * 1e-6, s = Math.sin(th * DEG), F = QE * v * B * s;
        return {
          prompt: t`The electrons that light up the aurora spiral down along Earth’s field lines into the upper atmosphere. One moves at $${tn(v)}$ m/s at $${th}^\circ$ to the local field, which there has a strength of $${BuT}\ \mu\text{T}$. What is the size of the magnetic force on it? ($e = 1.602\times10^{-19}$ C)`,
          visual: anglePic(th, -1, 'The electron (blue), its velocity (green) and Earth’s field (teal), with the angle between them. Drag to rotate.'),
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: QE * v * B, feedback: t`Include $\sin\theta$: only the part of the velocity across the field feels a force.` },
            { value: QE * v * B * Math.cos(th * DEG), feedback: t`The magnetic force uses $\sin\theta$, not $\cos\theta$.` },
          ],
          hints: [t`$F = |q|vB\sin\theta$, with $B$ in tesla: $1\ \mu\text{T} = 10^{-6}$ T.`, t`$F = (1.602\times10^{-19})(${tn(v)})(${BuT}\times10^{-6})\sin ${th}^\circ$.`],
          teach: 'The magnetic force on a charge depends only on the velocity component perpendicular to the field: F = |q|vB sin θ.',
          explain: t`$F = (1.602\times10^{-19}\ \text{C})(${tn(v)}\ \text{m/s})(${BuT}\times10^{-6}\ \text{T})\sin ${th}^\circ = ${tn(F)}$ N. Tiny — yet on an electron of mass $9.1\times10^{-31}$ kg it whirls the electron round the field line about $${tn(gyroMHz(B), 2)}$ million times a second, while the part of its velocity along the line carries it down into the atmosphere.`,
        };
      },
    }),
    mcq({
      id: 'cp-page', difficulty: 2,
      gen(r) {
        const dir = r.pick(['in', 'out']), key = r.pick(['proton', 'electron']), P = PARTICLES[key], sg = Math.sign(P.q);
        const vName = r.pick(['+x', '-x', '+y', '-y']);
        const v = AXES.find(([n]) => n === vName)[1], B = dir === 'in' ? [0, 0, -1] : [0, 0, 1];
        const F = scale(cross(v, B), sg);
        const word = (u) => PAGE_WORD[axisTeX(u)];
        const vx = 1.3 * v[0], vy = 1.3 * v[1];
        return {
          prompt: `${P.An} moves ${word(v)} through a uniform magnetic field that points ${word(B)}, as shown. Which way does the magnetic force on it point?`,
          visual: page({
            x: [-3, 3], y: [-1.9, 1.9],
            points: [...fieldMarks(-2.6, 2.6, -1.6, 1.6, 6, 4, dir, { skip: (x, y) => Math.hypot(x, y) < 0.5 || Math.hypot(x - vx, y - vy) < 0.5 }), { x: 0, y: 0, r: 7, color: sg > 0 ? COL.pos : COL.neg }],
            arrows: [{ from: [0, 0], to: [vx, vy], color: COL.v, label: 'v', labelDx: 6, labelDy: -10 }],
            caption: `${dir === 'in' ? '× marks: the field points into the page.' : '• marks: the field points out of the page.'} The ${P.name} is ${sg > 0 ? 'red' : 'blue'}; its velocity is green.`,
          }),
          choices: [word(F), word(neg(F)), word(B), word(v)].map((w) => w[0].toUpperCase() + w.slice(1)),
          answer: 0,
          why: {
            1: sg > 0 ? 'That is opposite to v × B. Fingers along v, curl them toward B (into or out of the page): your thumb gives the force on a positive charge.' : 'That is the direction of v × B — but the electron is negative, so the force is reversed.',
            2: 'A magnetic force is never along B: it is perpendicular to the field.',
            3: 'A magnetic force is never along the velocity: it turns the particle, it does not speed it up.',
          },
          hints: ['Fingers along v, curled toward B; thumb along v × B. Remember the sign of the charge.', t`With $x$ to the right, $y$ up the page and $z$ out of the page: $\hat\imath\times\hat\jmath = \hat k$, $\hat\jmath\times\hat k = \hat\imath$, $\hat k\times\hat\imath = \hat\jmath$.`],
          teach: 'For a field into or out of the page, the magnetic force lies in the page, perpendicular to the velocity; flip it for a negative charge.',
          explain: t`$\vec v$ points ${word(v)} and $\vec B$ points ${word(B)}, so $\vec v\times\vec B$ points ${word(cross(v, B))}${sg < 0 ? '; the electron is negative, so the force points ' + word(F) : ', which is the force on the positive proton'}.`,
        };
      },
    }),
    multi({
      id: 'cp-no-force', difficulty: 2,
      prompt: 'In a uniform magnetic field pointing to the right, six particles are at rest or moving as shown. Which of them feel **no** magnetic force? Select every one.',
      visual: page({
        x: [-3.6, 3.6], y: [-2.3, 2.3],
        curves: [2.05, 0.2, -2.05].map((y) => seg2([-3.5, y], [3.5, y], { color: COL.B, width: 1.3 })),
        arrows: [
          ...[2.05, 0.2, -2.05].map((y) => ({ from: [3.0, y], to: [3.4, y], color: COL.B })),
          { from: [-1.5, 1.15], to: [-0.5, 1.15], color: COL.v },
          { from: [1.5, 1.15], to: [0.5, 1.15], color: COL.v },
          { from: [-2.4, -1.55], to: [-2.4, -0.6], color: COL.v },
          { from: [0, -1.55], to: [0, -0.6], color: COL.v },
          { from: [2.2, -1.55], to: [2.85, -0.9], color: COL.v },
        ],
        points: [
          { x: -2.6, y: 1.15, r: 7, color: COL.pos, label: 'A', labelDx: -6, labelDy: -16 },
          { x: -1.5, y: 1.15, r: 7, color: COL.neg, label: 'B', labelDx: -6, labelDy: -16 },
          { x: 1.5, y: 1.15, r: 7, color: COL.pos, label: 'C', labelDx: -6, labelDy: -16 },
          { x: -2.4, y: -1.55, r: 7, color: COL.pos, label: 'D', labelDx: -22, labelDy: 0 },
          { x: 0, y: -1.55, r: 7, color: 'ink3', label: 'E', labelDx: -22, labelDy: 0 },
          { x: 2.2, y: -1.55, r: 7, color: COL.neg, label: 'F', labelDx: -22, labelDy: 0 },
        ],
        caption: 'The field (teal) points to the right everywhere in the region. Red: protons; blue: electrons; grey: a neutron. Green arrows are velocities; A has none.',
      }),
      choices: [
        'A — a proton at rest',
        'B — an electron moving to the right, along the field',
        'C — a proton moving to the left, against the field',
        'D — a proton moving straight up the page',
        'E — a neutron moving straight up the page',
        'F — an electron moving up and to the right, at 45° to the field',
      ],
      answer: [0, 1, 2, 4],
      why: {
        3: t`Its velocity is perpendicular to $\vec B$, so the force is as large as it can be, $evB$ — pointing into the page.`,
        5: t`Only the part of its velocity across the field matters, $v\sin 45^\circ$, and that is not zero.`,
      },
      hints: ['A magnetic force needs a charge, a velocity, and some of that velocity across the field.', t`$|\vec F| = |q|vB\sin\theta$ vanishes when $q = 0$, $v = 0$, or $\theta = 0^\circ$ or $180^\circ$.`],
      teach: 'No magnetic force acts on a neutral particle, a charge at rest, or a charge moving along or against the field.',
      explain: t`$|\vec F| = |q|vB\sin\theta$. A: $v = 0$. B and C: $\theta = 0^\circ$ and $180^\circ$, so $\sin\theta = 0$. E: $q = 0$ (a neutron has a tiny magnetic moment, which a uniform field twists but does not push). D feels the full $evB$, and F feels $evB\sin 45^\circ$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §11.3', url: 'https://openstax.org/books/university-physics-volume-2/pages/11-3-magnetic-fields-and-lines' },
    { label: 'NOAA NCEI: the World Magnetic Model (Earth’s field)', url: 'https://www.ncei.noaa.gov/products/world-magnetic-model' },
  ],
});
