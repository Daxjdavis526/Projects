// Field lines: curves tangent to E everywhere; they start on + charges and
// end on − charges (or at infinity), in numbers proportional to the charge;
// crowding shows strength; they never cross; and they are not the paths of
// charges.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { tn, s3, field, fieldLive } from './_efield.js';

const t = String.raw;

// an electrostatic quadrupole lens: −λ rods on the x axis, +λ rods on the y axis (cm, nC/m)
const QUAD = [{ x: 3, y: 0, lambda: -10 }, { x: -3, y: 0, lambda: -10 }, { x: 0, y: 3, lambda: 10 }, { x: 0, y: -3, lambda: 10 }];

export default lesson({
  id: 'phys2220.E2.4',
  title: 'Field lines',
  minutes: 11, difficulty: 2,
  intro: t`A **field line** is a curve drawn so that at every point the field is tangent to it — its slope is the field's direction:

$$\frac{dy}{dx} = \frac{E_y}{E_x}$$

Field lines start on positive charges and end on negative ones (or run off to infinity), and the **number** leaving or entering a charge is proportional to its size. Where they crowd together the field is strong; where they spread apart it is weak. Two lines **never cross**: the field has only one direction at any point. And a field line is **not a path**: it shows the direction of the force on a charge, not the way the charge moves.`,
  symbols: [
    { tex: 'x,\\ y', text: 'the coordinates of a point on the field line, in m' },
    { tex: 'E_x,\\ E_y', text: 'the components of the electric field at that point, in N/C: their ratio fixes the line’s direction there' },
    { tex: '\\frac{dy}{dx}', text: 'the slope of the field line: drawing the line means solving this differential equation' },
    { tex: 'N \\propto q', text: 'the number of lines leaving (or ending on) a charge is proportional to its charge — a drawing rule, chosen once per picture' },
  ],
  why: 'Field-line pictures let you read a field at a glance — where it is strong, where it vanishes, where charges sit — and Faraday, who invented them, reasoned with them before the mathematics existed.',
  visual: {
    type: 'em-field',
    title: 'Lines of force — and the path of a charge',
    lead: t`Field lines for a few arrangements. The proton (red dot) sits at rest on the dashed field line through it. Press **Launch** to release it, and compare its path with the line.`,
    tasks: [
      '+2q and −q: twice as many lines leave +2q as end on −q. The rest go off to infinity.',
      'Launch the proton: it sets off along the dashed line, then swings wide of it. A field line is not a path.',
      'Drag the proton’s starting point (the dashed ring) and launch again: wherever the line bends sharply, the proton strays furthest.',
    ],
    params: {
      unit: 'cm', x: [-12, 12], y: [-7.5, 7.5],
      presets: [
        { id: 'unequal', label: '+2q and −q', charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: -1 }], particle: { kind: 'proton', x: -1.8, y: 1.6, speed: 0, fieldLine: true } },
        { id: 'dipole', label: 'Dipole', charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: -2 }], particle: { kind: 'proton', x: -2.2, y: 1.4, speed: 0, fieldLine: true } },
        { id: 'like', label: 'Like charges', charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: 2 }], particle: { kind: 'proton', x: -0.5, y: 0.6, speed: 0, fieldLine: true } },
        { id: 'quad', label: 'Quadrupole lens', lines: QUAD, particle: { kind: 'proton', x: 0.6, y: 2.2, speed: 0, fieldLine: true } },
      ],
      preset: 'unequal', arrows: false, fieldLines: true, density: 16, labels: true, readouts: [],
      toggles: ['fieldLines', 'arrows'],
    },
    caption: 'Field lines are drawn in the plane of the page, 16 from the largest charge. The proton’s path is computed from F = qE alone (no gravity, no radiation); the quadrupole’s four rods run straight through the page.',
  },
  example: {
    prompt: t`Charges $+2q$ and $-q$ sit 10.0 cm apart. (a) If 16 field lines leave $+2q$, how many end on $-q$, and where do the rest go? (b) The field is zero at one point on the line through the charges. Where? (c) What do the lines look like far away?`,
    visual: field({ unit: 'cm', x: [-17, 29], y: [-12, 12], charges: [{ x: -10, y: 0, q: 2, label: '+2q' }, { x: 0, y: 0, q: -1, label: '−q' }], fieldLines: true, density: 16, notes: { points: [{ x: 24.14, y: 0, color: 'gold', r: 4.5, label: 'E = 0', ldx: -18, ldy: -13 }] } }, 'The field lines of +2q and −q (10.0 cm apart), with the point where the field vanishes (gold), 24.1 cm beyond −q. The lines that do not end on −q head off to infinity.'),
    steps: [
      { label: 'Counting', text: t`Lines are proportional to charge: $-q$ has half the charge of $+2q$, so 8 lines end on it. The other 8 leave the picture and run off to infinity — far away, the pair has a net charge $+q$ and its lines spread out like those of a single $+q$.` },
      { label: 'Where can E vanish?', text: t`Between the charges both fields point toward $-q$, so they add. On the far side of $+2q$ the bigger charge is also nearer, so it wins. Only beyond $-q$ can the weaker but nearer charge balance the stronger, farther one.` },
      { label: 'Solve', text: t`At distance $x$ beyond $-q$: $\dfrac{k(2q)}{(10.0 + x)^2} = \dfrac{kq}{x^2}$, so $\dfrac{10.0 + x}{x} = \sqrt2$ and $x = \dfrac{10.0}{\sqrt2 - 1} = ${s3(10 / (Math.SQRT2 - 1), 3)}$ cm.` },
      { label: 'Read the picture', text: t`Near that point the lines bend away: the field there has no direction, so no line passes through it. Lines from $+2q$ that pass near it either curl back into $-q$ or escape.` },
    ],
    answer: t`(a) 8 end on $-q$; 8 go to infinity. (b) On the line, ${s3(10 / (Math.SQRT2 - 1), 3)} cm beyond $-q$. (c) Far away they spread radially, like the 8 lines of a single $+q$.`,
  },
  practice: [
    num({
      id: 'count-lines', difficulty: 1,
      gen(r) {
        const NA = r.pick([12, 16, 20, 24]), qA = r.pick([2, 3, 4, 6]), NB = r.pick([4, 6, 8, 10].filter((n) => n < NA)), qB = -(qA * NB) / NA;
        return {
          prompt: t`In a field-line drawing, ${NA} lines leave charge A, which is $+${qA}$ nC, and ${NB} lines end on charge B. What is the charge on B (with its sign)?`,
          answer: qB, units: 'nC', tol: { rel: 0.005 },
          errors: [{ value: -(qA * NA) / NB, feedback: 'Turned upside down: fewer lines means less charge. $q_B/q_A = N_B/N_A$.' }],
          hints: ['The number of lines is proportional to the charge.', t`$|q_B| = q_A\cdot N_B/N_A$; lines *end* on negative charges.`],
          teach: 'The number of field lines at a charge is proportional to its size: lines start on + charges and end on − charges.',
          explain: t`$|q_B| = ${qA}\times\dfrac{${NB}}{${NA}} = ${s3(-qB, 3)}$ nC, and lines end on it, so $q_B = ${s3(qB, 3)}$ nC.`,
          visual: field({ x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: qA, label: 'A' }, { x: 3, y: 0, q: qB, label: 'B' }], fieldLines: true, density: NA }, `The field lines of A and B, ${NA} of them leaving A.`),
        };
      },
    }),
    mcq({
      id: 'no-crossing', difficulty: 1,
      prompt: 'Why can two electric field lines never cross?',
      choices: [
        'At a crossing the field would point in two directions at once, but it has only one direction at each point',
        'They repel each other, like charges',
        'They can cross, but only far from all charges',
        'Each line carries its own charge, and two charges cannot share a point',
      ],
      answer: 0,
      why: {
        1: 'Field lines are a drawing of the field, not objects that push on each other.',
        2: 'Far from the charges the field still has one direction at each point, so lines still cannot cross.',
        3: 'Lines carry no charge; they start and end on the charges.',
      },
      hints: ['A field line’s direction at a point is the field’s direction there.'],
      teach: 'A field line points along E, and E has one direction at each point, so lines cannot cross.',
      explain: 'The tangent to a field line is the direction of E. If two lines crossed at P, there would be two different directions for E at P. Lines can only meet where E has no direction at all — at a charge, or where E = 0.',
      visual: field({ x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: 2 }], fieldLines: true, density: 14 }, 'The field lines of two equal positive charges: they bend away from each other rather than cross.'),
    }),
    mcq({
      id: 'strongest', difficulty: 2,
      prompt: 'At which of the marked points is the electric field strongest?',
      choices: ['P', 'Q', 'R', 'They are all the same: the field of a charge does not depend on where you are'],
      answer: 0,
      why: {
        1: 'At Q the lines are farther apart than at P: the field is weaker.',
        2: 'At R the lines are spread widest: the field is weakest of the three.',
        3: 'The field falls off with distance; the spacing of the lines shows it.',
      },
      hints: ['Where are the lines closest together?'],
      teach: 'Where field lines crowd together the field is strong; where they spread apart it is weak.',
      explain: 'The lines are densest at P, close to the larger charge, so the field is strongest there. (In a flat drawing of a 3D field the spacing is only a rough guide — but crowding still means strength.)',
      visual: field({ x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: 4 }, { x: 3, y: 0, q: -1 }], fieldLines: true, density: 20, notes: { points: [{ x: -2.2, y: 1.2, color: 'gold', r: 4.5, label: 'P' }, { x: 0.5, y: 3.6, color: 'gold', r: 4.5, label: 'Q' }, { x: 7.5, y: 4, color: 'gold', r: 4.5, label: 'R' }] } }, 'The field lines of +4 nC and −1 nC, with three marked points.'),
    }),
    num({
      id: 'to-infinity', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 1], [5, 2], [4, 1], [5, 3]]), N = r.pick([15, 20, 30].filter((n) => (n * b) % a === 0)) || a * 6;
        const toInf = N - (N * b) / a;
        return {
          prompt: t`Charges $+${a}q$ and $-${b}q$ sit near each other. A drawing shows ${N} field lines leaving $+${a}q$. How many of them do not end on $-${b}q$, but run off to infinity?`,
          answer: toInf, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: (N * b) / a, feedback: 'That is the number that end on the negative charge. The question asks for the rest.' }],
          hints: [t`Lines ending on $-${b}q$: $${N}\times\dfrac{${b}}{${a}}$.`],
          teach: 'Lines that do not end on a negative charge go to infinity; their number reflects the net charge.',
          explain: t`$${N}\times\dfrac{${b}}{${a}} = ${(N * b) / a}$ lines end on $-${b}q$, so $${N} - ${(N * b) / a} = ${toInf}$ go to infinity — the share of the net charge $+${a - b}q$.`,
          visual: field({ x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: a, label: `+${a}q` }, { x: 3, y: 0, q: -b, label: `−${b}q` }], fieldLines: false }, 'The two charges (field lines not shown).'),
        };
      },
    }),
    mcq({
      id: 'not-a-path', difficulty: 2,
      prompt: 'A proton is released from rest at the point shown, which lies on a curved field line (dashed). What path does it follow?',
      choices: [
        'It sets off along the line, then strays from it: once moving, its inertia carries it wide of the curve',
        'It follows the field line exactly, all the way to the negative charge',
        'It moves at right angles to the field line',
        'It stays where it is: a field line only shows where the field is',
      ],
      answer: 0,
      why: {
        1: 'The force is along the line, but force sets the acceleration, not the velocity. To follow a curve, a moving charge needs a force with a sideways part toward the curve’s centre — and the field line’s own direction gives none.',
        2: 'The force on it is along the field line, not across it.',
        3: 'There is a field at that point, so there is a force on the proton: it accelerates at once.',
      },
      hints: ['Newton’s second law: the force sets the acceleration. Which way does the velocity point a moment later?'],
      teach: 'A field line shows the direction of the force, not of the motion; a charge follows a field line only if the line is straight.',
      explain: 'At the start the proton’s velocity is zero, so it moves off along the force — along the line. But as the line curves, the proton’s velocity still points along the old direction, so it swings outside the curve. Only on a straight field line, or for a particle with negligible inertia, do path and line agree.',
      visual: field({ x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: -2 }], fieldLines: false, particle: { kind: 'proton', x: -2.2, y: 1.4, speed: 0, fieldLine: true, path: false } }, 'A dipole, the proton at rest (red dot) and the field line through it (dashed).'),
    }),
    expr({
      id: 'line-ode', difficulty: 3,
      gen(r) {
        const x0 = r.pick([1, 2, 3]), y0 = r.pick([1, 2, 4].filter((v) => v !== x0)), c = x0 * y0;
        return {
          prompt: t`Near the centre of an electrostatic quadrupole lens the field is $\vec E = \dfrac{E_0}{a}(x, -y)$. Find the field line through the point $(${x0}, ${y0})$, in millimetres from the centre: solve $\dfrac{dy}{dx} = \dfrac{E_y}{E_x}$.`,
          lhs: 'y', answer: `${c}/x`, answerTeX: t`\frac{${c}}{x}`,
          vars: { x: [0.5, 5] },
          errors: [{ answer: `${y0}*x/${x0}`, feedback: t`That is a straight line through the origin, the field line of a point charge. Here $dy/dx = -y/x$.` }, { answer: `${c}*x`, feedback: t`Check: separating gives $\ln y = -\ln x + C$, so $y = C/x$.` }],
          hints: [t`$\dfrac{dy}{dx} = \dfrac{-y}{x}$. Separate the variables: $\dfrac{dy}{y} = -\dfrac{dx}{x}$.`, t`Integrate: $\ln y = -\ln x + C$, so $xy = \text{constant}$.`, t`Fix the constant with the point: $xy = ${x0}\times${y0}$.`],
          teach: 'Drawing a field line means solving $dy/dx = E_y/E_x$ — here a separable equation whose solutions are the hyperbolas xy = constant.',
          explain: t`$\dfrac{dy}{y} = -\dfrac{dx}{x} \Rightarrow \ln y = -\ln x + C \Rightarrow xy = ${c}$, so $y = ${c}/x$: a hyperbola. Every field line near the lens's centre is one of these, which is why the field there squeezes a beam in one direction while stretching it in the other.`,
          visual: field({ x: [-6, 6], y: [-4.5, 4.5], lines: QUAD, fieldLines: true, density: 14 }, 'The four rods of a quadrupole lens seen end-on (+ on the y axis, − on the x axis, 3 cm from the centre) and their field lines. Within a few millimetres of the centre the field is very close to E₀(x, −y)/a.'),
        };
      },
    }),
    multi({
      id: 'rules', difficulty: 2,
      prompt: 'Which statements about electric field lines are true? Select all that apply.',
      choices: [
        'The field at a point is tangent to the field line through it',
        'Lines start on positive charges and end on negative charges or at infinity',
        'A charge released from rest always moves along the field line through its starting point',
        'The more lines leave a charge, the larger the charge',
        'Field lines are real filaments in space that charges travel along',
      ],
      answer: [0, 1, 3],
      why: {
        2: 'Only at the very start, or along a straight line. On a curved line the charge’s inertia carries it off the line.',
        4: 'They are a drawing of the field — a useful picture, not a physical object.',
      },
      hints: ['Field lines are a drawing convention for the field’s direction and strength.'],
      teach: 'Field lines picture the field: tangent gives direction, density gives strength, number gives charge — and nothing more.',
      explain: 'Field lines are a picture of the field: the tangent gives its direction, crowding its strength, and the number at a charge its size. They are not paths and not things.',
      visual: field({ x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: 3 }, { x: 3, y: 0, q: -1 }], fieldLines: true, density: 15 }, 'The field lines of +3 nC and −1 nC.'),
    }),
    mcq({
      id: 'electron-path', difficulty: 3, kind: 'error',
      prompt: 'A student says: “An electron released from rest at P will slide along the field line through P, from the + charge toward the − charge.” What is wrong?',
      choices: [
        'An electron is pushed against the field, toward the + charge — and once moving, it will not stay on a curved line',
        'Nothing is wrong: charges always travel along field lines from + to −',
        'The electron stays put, because a field line pushes only charges that lie off it',
        'The electron moves at right angles to the field line',
      ],
      answer: 0,
      why: {
        1: 'Field lines show the push on a positive charge. A negative charge is pushed the other way, and no charge is obliged to follow a curved line.',
        2: 'There is a field at P, so the electron feels a force qE at once.',
        3: 'The force on a charge lies along the field line (forward or backward), never across it.',
      },
      hints: ['Which way is a negative charge pushed: along E, or against it?', 'Does the force decide where the electron is going, or how its velocity changes?'],
      teach: 'Negative charges are pushed against the field lines, and no charge has to follow a curved line.',
      explain: 'Two errors. The electron’s charge is negative, so F = qE points backward along the line, toward the + charge. And after it starts moving, its inertia carries it off the curved line — just as the proton in the Explore swings wide.',
      visual: field({ x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: -2 }], fieldLines: true, density: 12, particle: { kind: 'electron', x: 0, y: 3.1, speed: 0, path: false }, notes: { points: [{ x: 0, y: 3.1, color: 'gold', r: 0.01, label: 'P', ldx: 10, ldy: -10 }] } }, 'A dipole’s field lines and the electron (blue) at rest at P.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        const [qA, N, qB] = r.pick([[6, 24, 2.5], [4, 20, 1.6], [5, 30, 2], [8, 16, 3]]), nB = (N * qB) / qA;
        return {
          prompt: t`A drawing shows ${N} field lines leaving a $+${qA}$ nC charge. How many lines should end on a nearby $-${qB}$ nC charge?`,
          answer: nB, tol: { rel: 0, abs: 0.5 },
          hints: ['Lines are proportional to charge.'],
          teach: 'One drawing, one rule: lines per coulomb is the same for every charge in the picture.',
          explain: t`$${N}\times\dfrac{${qB}}{${qA}} = ${nB}$ lines.`,
          visual: field({ x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: qA, label: `+${qA} nC` }, { x: 3, y: 0, q: -qB, label: `−${qB} nC` }], fieldLines: false }, 'The two charges (field lines not shown).'),
        };
      },
    }),
    mcq({
      id: 'cp-quadrupole', difficulty: 3, transfer: true,
      prompt: t`Particle accelerators steer their beams with electrostatic (or magnetic) **quadrupole lenses**. Near the centre of the lens shown, the field is $\vec E = \dfrac{E_0}{a}(x, -y)$ with $E_0 > 0$. A positive ion moving along the beam axis (straight into the page) drifts slightly off-centre. What does the lens do?`,
      choices: [
        'It pushes an ion that drifted along x farther out, and an ion that drifted along y back toward the centre: it focuses in one direction and defocuses in the other',
        'It pushes every ion back toward the centre: it focuses in all directions',
        'It pushes every ion away from the centre',
        'Nothing: the field is zero at the centre, so it is zero nearby too',
      ],
      answer: 0,
      why: {
        1: t`At $(x, 0)$ the field is $(E_0x/a, 0)$ — pointing away from the axis. A field with zero divergence in empty space cannot point inward everywhere.`,
        2: t`At $(0, y)$ the field is $(0, -E_0y/a)$ — pointing back toward the axis.`,
        3: 'The field grows in proportion to the distance from the centre: zero there, but not nearby.',
      },
      hints: [t`Evaluate $\vec E$ at $(x, 0)$ and at $(0, y)$ for small positive $x$ and $y$.`, 'A positive ion is pushed along E.'],
      teach: 'A quadrupole focuses in one plane and defocuses in the other, so beamlines alternate lenses rotated by 90° to focus overall.',
      explain: t`At $(x, 0)$, $\vec E \propto (x, 0)$ points away from the axis: defocusing in $x$. At $(0, y)$, $\vec E \propto (0, -y)$ points back: focusing in $y$. No static field in empty space can focus in every direction at once, so accelerators use pairs of lenses turned 90° to each other — alternating-gradient focusing — which focus overall.`,
      visual: field({ x: [-6, 6], y: [-4.5, 4.5], lines: QUAD, fieldLines: true, density: 14 }, 'A quadrupole lens seen along the beam: four rods running into the page, with + rods on the y axis and − rods on the x axis, and their field lines.'),
    }),
    num({
      id: 'cp-escape', difficulty: 2,
      gen(r) {
        const [a, b, N] = r.pick([[4, 3, 16], [6, 1, 18], [5, 2, 20], [3, 2, 24]]), toInf = N - (N * b) / a;
        return {
          prompt: t`${N} field lines leave a charge $+${a}q$ in a drawing that also shows a charge $-${b}q$. How many lines run off to infinity?`,
          answer: toInf, tol: { rel: 0, abs: 0.5 },
          hints: ['Count the lines that end on the negative charge first.'],
          teach: 'The lines that escape to infinity carry the net charge’s share.',
          explain: t`$${N}\times\dfrac{${b}}{${a}} = ${(N * b) / a}$ end on $-${b}q$; the other $${toInf}$ escape — the share of the net charge $+${a - b}q$.`,
          visual: field({ x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: a, label: `+${a}q` }, { x: 3, y: 0, q: -b, label: `−${b}q` }], fieldLines: false }, 'The two charges (field lines not shown).'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §5.6 Electric Field Lines', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-6-electric-field-lines' },
  ],
});
