// Torque: the turning effect of a force — force times lever arm.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { seg } from './_momentum.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const comma = (x) => x.toLocaleString('en-US');
const DEG = Math.PI / 180;
const r4 = (x) => +x.toFixed(4);

// a static door (a rod hinged at one end, seen from above) with forces, from the rotor simulation
const door = (params, caption) => ({ type: 'mech-rotor', params: { shape: 'rod', M: 12, L: 1, d: 0.5, cm: false, ...params }, caption: caption ?? 'A door seen from above, hinged at the gold axis. Dashed: the line of action of each force; gold: its lever arm.' });

// a rocket standing up the screen, its engine gimballed by `ang` degrees (drawn exaggerated by `show`)
function gimbalPicture(ang, show = 4) {
  const L = 9, cmY = 5.2, a = show * ang * DEG;
  // the line of action through the gimbal (0, 0) along the thrust direction (sin a, cos a)
  const u = [Math.sin(a), Math.cos(a)];
  const foot = [u[0] * (cmY * u[1]), u[1] * (cmY * u[1])];          // projection of the CM (0, cmY) onto the line
  return {
    type: 'graph',
    params: {
      x: [-4, 4], y: [-0.6, L + 0.8], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: String(L - 1.2), lower: '0.6', from: -0.55, to: 0.55, color: 'ink3', alpha: 0.5 }, { fn: `${L - 1.2} + (0.55 - abs(x))*1.9`, lower: String(L - 1.2), from: -0.55, to: 0.55, color: 'ink3', alpha: 0.5 }],
      curves: [
        { param: [`t*${r4(u[0])}`, `t*${r4(u[1])}`], t: [-0.4, 9.6], color: 'ink4', width: 1.1, dash: true },
        seg([0, cmY], [r4(foot[0]), r4(foot[1])], 'gold', 2.2),
        seg([-0.35, 0.6], [0, 0], 'ink2', 2), seg([0.35, 0.6], [0, 0], 'ink2', 2),
      ],
      arrows: [{ from: [0, 0], to: [r4(u[0] * 3.2), r4(u[1] * 3.2)], color: 'accent', label: 'thrust', labelDx: 8 }],
      points: [{ x: 0, y: cmY, r: 5, color: 'ink', label: 'centre of mass', labelDx: -112, labelDy: -2 }, { x: 0, y: 0, r: 4, color: 'gold', label: 'gimbal', labelDx: -54, labelDy: 6 }, { x: r4(foot[0] / 2), y: r4((cmY + foot[1]) / 2), r: 0.01, color: 'gold', label: 'lever arm', labelDx: 8 }],
    },
    caption: `A launch vehicle steering by gimballing its engine (angle exaggerated ${show}×; not to scale). The thrust’s line of action (dashed) misses the centre of mass by the lever arm (gold).`,
  };
}

export default lesson({
  id: 'phys2210.M10.4',
  title: 'Torque',
  minutes: 10, difficulty: 2,
  intro: t`Whether a force turns a body depends on **where** and **in which direction** it pushes, not only on how hard. Its turning effect about an axis is the **torque**:

$$\tau = rF\sin\varphi = r_\perp F$$

where $r$ is the distance from the axis to the point where the force acts and $\varphi$ is the angle between $\vec r$ and $\vec F$. The product $r_\perp = r\sin\varphi$ is the **lever arm**: the perpendicular distance from the axis to the force’s line of action. A force aimed straight at the axis has no lever arm, so **however large it is, it produces no torque**. As a vector, $\vec\tau = \vec r\times\vec F$ (lesson M2.5) points along the axis by the right-hand rule; about a fixed axis, count anticlockwise torques as positive.`,
  symbols: [
    { tex: '\\tau', text: 'the torque about the axis, in newton-metres (N·m) — the same units as energy, but a different quantity: never write joules for a torque' },
    { tex: 'r', text: 'the distance from the axis to the point where the force acts, in m' },
    { tex: 'F', text: 'the size of the force, in N' },
    { tex: '\\varphi', text: 'the angle between $\\vec r$ (from the axis out to the point) and $\\vec F$' },
    { tex: 'r_\\perp = r\\sin\\varphi', text: 'the lever arm: the perpendicular distance from the axis to the line along which the force acts' },
    { tex: '\\vec\\tau = \\vec r\\times\\vec F', text: 'torque as a vector, along the axis, by the right-hand rule' },
  ],
  why: 'Torque is what turns doors and bolts, steers rockets by gimballing their engines, points spacecraft with thrusters — and, in the next lesson, sets the angular acceleration.',
  visual: {
    type: 'mech-rotor',
    title: 'Where you push matters',
    lead: t`A door seen from above, hinged at the gold axis. Choose the push $F$, where it acts ($r$, measured from the hinge) and its angle $\varphi$ to the door. The dashed line is the push’s line of action; the gold segment is the lever arm.`,
    tasks: [
      t`Keep $\varphi = 90°$ and slide the push from the handle toward the hinge: the torque shrinks in proportion to $r$, and at the hinge it is zero however hard you push.`,
      t`Keep $r$ and $F$ and change $\varphi$: the lever arm — and the torque — is largest at 90° and vanishes as the push lines up with the door.`,
      t`Find a second push with the same torque: halve $r$ and double $F$.`,
    ],
    params: { shape: 'rod', M: 12, L: 1, d: 0.5, cm: false, F: 20, rF: 0.8, phi: 60, play: false, readouts: ['tau'], sliders: ['F', { key: 'rF', max: 1 }, 'phi'] },
    caption: 'A door seen from above. The hinge holds the axis still. Lengths to scale; force arrows show direction, with lengths only roughly in proportion.',
  },
  example: {
    prompt: t`A launch vehicle steers by tilting (gimballing) its engine. A Merlin 1D gives 845 kN of thrust; it is gimballed 3.0° from the vehicle’s axis, and the vehicle’s centre of mass is 18 m above the gimbal point. What torque does the thrust exert about the centre of mass?`,
    visual: gimbalPicture(3),
    steps: [
      { label: 'Find r and φ', text: t`The thrust acts at the gimbal, $r = 18$ m from the centre of mass, along the vehicle’s axis. The thrust is tilted 3.0° from that axis, so $\sin\varphi = \sin 3.0°$.` },
      { label: 'Lever arm', text: t`$r_\perp = r\sin\varphi = (18)\sin3.0° = 0.94$ m: the thrust’s line of action misses the centre of mass by less than a metre.` },
      { label: 'Torque', text: t`$\tau = r_\perp F = (0.94\ \text{m})(845{,}000\ \text{N}) = 8.0\times10^{5}$ N·m.` },
      { label: 'Sense check', text: t`A tiny angle, a huge torque: the thrust is enormous and the arm is long. This is thrust-vector control — the way most rockets steer, since fins do little in thin air and nothing in space.` },
    ],
    answer: t`$\tau \approx 8.0\times10^{5}$ N·m.`,
  },
  practice: [
    num({
      id: 'push', difficulty: 1,
      gen(r) {
        const F = r.pick([20, 30, 40, 50]), rF = r.pick([0.6, 0.75, 0.9]);
        return {
          prompt: t`You push a door at right angles to it, with a force of ${F} N, ${rF} m from the hinge. What torque do you exert about the hinge?`,
          answer: F * rF, units: 'N m', tol: { rel: 0.01 },
          errors: [{ value: F / rF, feedback: 'Multiply force by lever arm: τ = rF.' }],
          hints: [t`At right angles, the lever arm is the whole distance $r$: $\tau = rF$.`],
          teach: 'For a push at right angles, torque is force times distance from the axis.',
          explain: t`$\tau = rF = (${rF})(${F}) = ${nice(rF * F)}$ N·m.`,
          visual: door({ F, rF, phi: 90, values: true, lever: false }),
        };
      },
    }),
    num({
      id: 'angled', difficulty: 2,
      gen(r) {
        const F = r.pick([30, 40, 60]), rF = r.pick([0.7, 0.8, 0.9]), phi = r.pick([30, 40, 50, 60]);
        const tau = rF * F * Math.sin(phi * DEG);
        return {
          prompt: t`You push on a door ${rF} m from the hinge with a ${F} N force at ${phi}° to the door’s surface. What torque about the hinge?`,
          answer: tau, units: 'N m', tol: { rel: 0.01 },
          errors: [
            { value: rF * F, feedback: 'Only the part of the force perpendicular to the door turns it: include sin φ.' },
            { value: rF * F * Math.cos(phi * DEG), feedback: 'Use sin φ, with φ measured between the door (the line from the hinge) and the force.' },
          ],
          hints: [t`$\tau = rF\sin\varphi$, where $\varphi$ is the angle between the door and the push.`],
          teach: 'Torque is rF sin φ: only the perpendicular part of the force — or equivalently the perpendicular lever arm — counts.',
          explain: t`$\tau = (${rF})(${F})\sin${phi}° = ${s3(tau)}$ N·m. The lever arm is $r\sin\varphi = ${s3(rF * Math.sin(phi * DEG))}$ m.`,
          visual: door({ F, rF, phi, values: true }),
        };
      },
    }),
    mcq({
      id: 'largest', difficulty: 2,
      prompt: 'Four forces act on a door (seen from above, hinged on the left). Which gives the largest torque about the hinge? A: 100 N, at right angles, 0.1 m from the hinge. B: 40 N, at right angles, 0.8 m out. C: 200 N, along the door toward the hinge, 0.8 m out. D: 60 N, at 30° to the door, 0.8 m out.',
      choices: ['B', 'C', 'A', 'D'],
      answer: 0,
      why: {
        1: 'C is the biggest force, but it points straight at the hinge: zero lever arm, zero torque.',
        2: 'A is large but acts only 0.1 m from the hinge: 100 × 0.1 = 10 N·m.',
        3: 'At 30° only half the force counts: 60 × 0.8 × sin 30° = 24 N·m.',
      },
      hints: ['Compute rF sin φ for each.', 'A force pointing along the door, at the hinge, has no lever arm.'],
      teach: 'A larger force does not mean a larger torque: what counts is force times lever arm.',
      explain: t`A: $0.1\times100 = 10$; B: $0.8\times40 = 32$; C: $0$ (no lever arm); D: $0.8\times60\times\sin30° = 24$ N·m. B wins, with the second-smallest force.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.25, 1.35], y: [-0.55, 0.65], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          shade: [{ fn: '0.025', lower: '-0.025', from: 0, to: 1, color: 'accent', alpha: 0.6 }],
          curves: [{ param: ['0.04*cos(t)', '0.04*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.2 }],
          arrows: [
            { from: [0.1, 0.03], to: [0.1, 0.43], color: 'warn', label: 'A' },
            { from: [0.8, 0.03], to: [0.8, 0.33], color: 'good', label: 'B' },
            { from: [0.95, 0], to: [0.52, 0], color: 'bad', label: 'C', labelDy: -14 },
            { from: [0.8, -0.03], to: [r4(0.8 + 0.4 * Math.cos(-150 * DEG)), r4(-0.03 + 0.4 * Math.sin(-150 * DEG))], color: 'violet', label: 'D', labelDx: -16, labelDy: 8 },
          ],
          points: [{ x: 0, y: 0, r: 0.01, color: 'gold', label: 'hinge', labelDy: 22, labelDx: -16 }],
        },
        caption: 'The door from above, 1 m wide, with the four forces (lengths not to scale).',
      },
    }),
    num({
      id: 'seesaw', difficulty: 2,
      gen(r) {
        const WA = r.pick([250, 300, 350]), rA = r.pick([1.2, 1.5]), WB = r.pick([200, 280, 400]), rB = r.pick([1.4, 1.6, 1.8]);
        const net = WA * rA - WB * rB;
        return {
          prompt: t`On a seesaw, child A (weight ${WA} N) sits ${rA} m to the left of the pivot and child B (weight ${WB} N) sits ${rB} m to the right. What is the net torque about the pivot? (Anticlockwise, which lowers A’s side, is positive.)`,
          answer: net, units: 'N m', tol: { rel: 0.01, abs: 0.5 },
          errors: Math.abs(net) > 1 ? [{ value: WA * rA + WB * rB, feedback: 'The two torques turn the seesaw in opposite directions: subtract.' }] : [],
          hints: ['Each weight acts straight down, at right angles to the level seesaw: τ = r × weight.', 'A’s torque is anticlockwise (+), B’s is clockwise (−).'],
          teach: 'Torques add with signs: anticlockwise positive, clockwise negative.',
          explain: t`$\tau = (${WA})(${rA}) - (${WB})(${rB}) = ${nice(WA * rA)} - ${nice(WB * rB)} = ${nice(net)}$ N·m: ${net > 0 ? 'A’s side goes down' : net < 0 ? 'B’s side goes down' : 'balanced'}.`,
          visual: { type: 'mech-rotor', params: { shape: 'rod', M: 20, L: 4, d: 0, cm: false, F: WB, rF: rB, phi: -90, F2: WA, rF2: -rA, phi2: 90, values: true, flabels: ['B', 'A'] }, caption: 'The seesaw from the side, with the children’s weights as forces. Dashed: lines of action; gold: lever arms.' },
        };
      },
    }),
    num({
      id: 'couple', difficulty: 2,
      gen(r) {
        const F = r.pick([10, 22, 25, 50]), rr = r.pick([0.8, 1.0, 1.25]);
        return {
          prompt: t`To turn a spacecraft, two small thrusters fire together on opposite sides of it, each ${rr} m from its centre and each pushing ${F} N, in opposite directions, at right angles to the line joining them. What torque do they exert about the centre?`,
          answer: 2 * F * rr, units: 'N m', tol: { rel: 0.01 },
          errors: [
            { value: F * rr, feedback: 'Both thrusters turn the craft the same way: their torques add.' },
            { value: 0, feedback: 'The forces cancel, so the centre of mass does not accelerate — but their torques add. That is the point of a couple.' },
          ],
          hints: ['Each thruster’s torque is r F; do they turn the craft the same way?', 'Equal and opposite forces with different lines of action form a couple: zero net force, nonzero torque.'],
          teach: 'A couple — equal and opposite forces on different lines — gives pure torque with no net force.',
          explain: t`Each gives $rF = ${nice(rr * F)}$ N·m, both anticlockwise: $\tau = 2rF = ${nice(2 * rr * F)}$ N·m. The net force is zero, so the craft spins without drifting off — why attitude thrusters are fired in pairs.`,
          visual: { type: 'mech-rotor', params: { shape: 'disk', M: 1000, R: 1.25, F, rF: rr, phi: 90, F2: F, rF2: -rr, phi2: 90, values: true, cm: false }, caption: 'The spacecraft seen along its spin axis, with the two thruster forces.' },
        };
      },
    }),
    mcq({
      id: 'stuck', difficulty: 2,
      prompt: 'A stuck bolt will not turn when you pull with all your strength at right angles on the end of a 25 cm spanner. Which change doubles your torque?',
      choices: ['Slip a pipe over the handle and pull at its end, 50 cm from the bolt', 'Pull at 45° to the handle instead', 'Push on the spanner right next to the bolt', 'Pull twice as fast'],
      answer: 0,
      why: {
        1: 'Tilting the pull away from 90° shortens the lever arm: sin 45° ≈ 0.71, a loss.',
        2: 'Close to the bolt the lever arm almost vanishes, and so does the torque.',
        3: 'Torque depends on force and lever arm, not on how quickly you pull.',
      },
      hints: ['Your force is already at its maximum. What else is in τ = r F sin φ?'],
      teach: 'With the force maxed out, only a longer lever arm raises the torque.',
      explain: t`$\tau = rF\sin\varphi$: with $F$ at your maximum and $\varphi = 90°$ already, doubling $r$ to 50 cm doubles $\tau$. Mechanics call it a cheater bar.`,
      visual: { type: 'mech-rotor', params: { shape: 'rod', M: 0.5, L: 0.25, d: 0.125, cm: false, F: 300, rF: 0.25, phi: 90, values: false }, caption: 'The spanner seen face-on, turning about the bolt (gold); your pull is the red arrow.' },
    }),
    mcq({
      id: 'direction', difficulty: 3,
      prompt: t`A spanner lies along $+x$ from a bolt at the origin, and you push its handle in the $-y$ direction. Which way does the torque vector $\vec\tau = \vec r\times\vec F$ point, and which way does the bolt turn as seen from $+z$?`,
      choices: [t`$-z$: the bolt turns clockwise as seen from $+z$`, t`$+z$: anticlockwise as seen from $+z$`, t`$-y$, along the push`, t`$+x$, along the spanner`],
      answer: 0,
      why: {
        1: t`$\hat\imath\times\hat\jmath = +\hat k$, so $\hat\imath\times(-\hat\jmath) = -\hat k$. Check with your hand: fingers from $+x$ toward $-y$ curl clockwise seen from above.`,
        2: 'A cross product is perpendicular to both of its vectors, so it cannot point along the push.',
        3: 'A cross product is perpendicular to both vectors: it cannot point along the spanner either.',
      },
      hints: [t`$\vec\tau = \vec r\times\vec F$ with $\vec r$ along $\hat\imath$ and $\vec F$ along $-\hat\jmath$.`, t`$\hat\imath\times\hat\jmath = \hat k$.`],
      teach: 'The torque vector points along the axis of the turning it causes, by the right-hand rule: τ = r × F.',
      explain: t`$\hat\imath\times(-\hat\jmath) = -\hat k$: the torque points along $-z$, and by the right-hand rule (thumb along $-z$) the bolt turns clockwise as seen from $+z$.`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 2,
          vectors: [{ to: [1.8, 0, 0], color: 'accent', label: '\\vec r' }, { from: [1.8, 0, 0], to: [1.8, -1.2, 0], color: 'bad', label: '\\vec F' }],
          points: [{ at: [0, 0, 0], color: 'gold', label: '\\text{bolt}' }],
        },
        caption: 'The spanner (from bolt to handle) and your push. Drag to rotate.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gimbal', difficulty: 3, transfer: true,
      gen(r) {
        const [what, T] = r.pick([['an RL10 upper-stage engine', 110], ['a 445 kN booster engine', 445], ['a Merlin 1D', 845]]);
        const ang = r.pick([2, 3, 5]), d = r.pick([6, 12, 20]);
        const tau = T * 1000 * d * Math.sin(ang * DEG);
        return {
          prompt: t`A rocket steers with ${what}: ${T} kN of thrust, gimballed ${ang}° from the vehicle’s axis. The vehicle’s centre of mass is ${d} m from the gimbal point. What torque does the thrust exert about the centre of mass?`,
          answer: tau, units: 'N m', tol: { rel: 0.01 },
          errors: [
            { value: T * 1000 * d, feedback: 'The thrust is nearly along the axis: only r sin φ, the small lever arm, counts.' },
            { value: T * 1000 * d * Math.cos(ang * DEG), feedback: 'Use sin of the gimbal angle: it is the thrust’s small sideways tilt that gives a lever arm.' },
          ],
          hints: [t`$\tau = rF\sin\varphi$ with $r = ${d}$ m and $\varphi = ${ang}°$.`, 'Keep the thrust in newtons.'],
          teach: 'A small gimbal angle times a long lever and a large thrust gives the big torque that steers a rocket.',
          explain: t`$r_\perp = ${d}\sin${ang}° = ${s3(d * Math.sin(ang * DEG))}$ m, so $\tau = (${s3(d * Math.sin(ang * DEG))})(${comma(T * 1000)}) = ${s3(tau)}$ N·m.`,
          visual: gimbalPicture(ang, ang >= 5 ? 2 : 4),
        };
      },
    }),
    mcq({
      id: 'cp-hinge', difficulty: 2,
      prompt: 'One person pushes a heavy door with 500 N, right at the hinge, perpendicular to the door. Another pushes the same door with 50 N at the handle, perpendicular to the door, the other way. Which way does the door turn?',
      choices: ['The way the 50 N push turns it', 'The way the 500 N push turns it', 'Neither: the forces balance', 'It cannot turn: 500 N is ten times larger'],
      answer: 0,
      why: {
        1: 'At the hinge the 500 N push has no lever arm: its torque is zero, however big the force.',
        2: 'The forces do not balance (500 N against 50 N), and anyway turning depends on torques, not forces.',
        3: 'Size of force alone does not decide rotation: torque does.',
      },
      hints: ['Compute each torque: r F sin φ. What is r for the push at the hinge?'],
      teach: 'Torque, not force, decides rotation: a force through the axis has none.',
      explain: t`$\tau_{500} = 0\times500 = 0$; $\tau_{50} = (0.8\ \text{m})(50\ \text{N}) \approx 40$ N·m for a typical door. The door turns the way the small push wants. (The hinge, meanwhile, takes the big push.)`,
      visual: door({ F: 50, rF: 0.9, phi: 90, F2: 500, rF2: 0.02, phi2: -90, lever: false, values: true, flabels: ['push at the handle', 'push at the hinge'] }, 'The door from above: a 50 N push at the handle and a 500 N push at the hinge (arrow lengths not to scale).'),
    }),
    num({
      id: 'cp-pulley', difficulty: 2,
      gen(r) {
        const F1 = r.pick([30, 40, 60]), r1 = r.pick([0.3, 0.4]), F2 = r.pick([50, 70, 90]), r2 = r.pick([0.1, 0.15, 0.2]);
        const net = F1 * r1 - F2 * r2;
        return {
          prompt: t`A stepped pulley has two drums, of radii ${r1} m and ${r2} m, fixed together on one axle. A rope wound round the large drum pulls with ${F1} N, turning it anticlockwise; a rope on the small drum pulls with ${F2} N, turning it clockwise. Both ropes leave tangentially. What is the net torque? (Anticlockwise positive.)`,
          answer: net, units: 'N m', tol: { rel: 0.01, abs: 0.05 },
          errors: Math.abs(net) > 0.1 ? [{ value: F1 * r1 + F2 * r2, feedback: 'The ropes turn the pulley in opposite directions: subtract their torques.' }, { value: (F1 - F2) * ((r1 + r2) / 2), feedback: 'Each force has its own lever arm: compute each torque, then subtract.' }] : [],
          hints: ['A rope leaving a drum tangentially has the drum’s radius as its lever arm.', t`$\tau = F_1r_1 - F_2r_2$.`],
          teach: 'For tangential pulls the lever arm is the radius; then add the torques with signs.',
          explain: t`$\tau = (${F1})(${r1}) - (${F2})(${r2}) = ${nice(F1 * r1)} - ${nice(F2 * r2)} = ${nice(net)}$ N·m — ${net > 0 ? 'anticlockwise, though the smaller force wins' : net < 0 ? 'clockwise' : 'balanced'}.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.7, 0.7], y: [-0.5, 0.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ param: [`${r1}*cos(t)`, `${r1}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2.4 }, { param: [`${r2}*cos(t)`, `${r2}*sin(t)`], t: [0, 6.2832], color: 'violet', width: 2.4 }],
              arrows: [{ from: [r1, 0], to: [r1, 0.4], color: 'accent', label: `${F1} N` }, { from: [-r2, 0], to: [-r2, 0.4], color: 'violet', label: `${F2} N`, labelDx: -44 }],
              points: [{ x: 0, y: 0, r: 4, color: 'gold' }],
            },
            caption: 'The stepped pulley seen along its axle (gold): large drum blue, small drum violet, with the two rope pulls.',
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §10.6 Torque', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-6-torque' }],
});
