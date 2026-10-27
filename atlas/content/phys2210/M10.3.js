// The parallel-axis theorem: I about any axis from I about a parallel axis
// through the centre of mass.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { seg } from './_momentum.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (x) => +x.toFixed(4);

// a static picture of a body turning about an axis from the rotor simulation
const body = (params, caption) => ({ type: 'mech-rotor', params: { values: false, ...params }, caption });
// a small gold axis ring (perpendicular to the screen) at (x, y), with a label
const axisRing = (x, y, label, r = 0.05) => ({ param: [`${r4(x)} + ${r}*cos(t)`, `${r4(y)} + ${r}*sin(t)`], t: [0, 6.2832], color: 'gold', width: 2.2, label, labelAt: 1.57, labelDx: -4, labelDy: -12 });

export default lesson({
  id: 'phys2210.M10.3',
  title: 'The parallel-axis theorem',
  minutes: 9, difficulty: 2,
  intro: t`Once you know a body’s moment of inertia about an axis through its **centre of mass**, you know it about every **parallel** axis:

$$I = I_\text{cm} + Md^2$$

where $d$ is the distance between the two axes. The extra $Md^2$ is what the body would contribute if all its mass sat at its centre of mass, circling the new axis. Two consequences follow at once: **$I$ is smallest about an axis through the centre of mass**, and moving the axis anywhere else only adds to it. A rod about its end, for instance: $\tfrac1{12}ML^2 + M\left(\tfrac L2\right)^2 = \tfrac13 ML^2$.`,
  symbols: [
    { tex: 'I', text: 'the moment of inertia about the new axis, in kg·m²' },
    { tex: 'I_\\text{cm}', text: 'the moment of inertia about a parallel axis through the centre of mass' },
    { tex: 'M', text: 'the body’s total mass, in kg' },
    { tex: 'd', text: 'the perpendicular distance between the two parallel axes, in m' },
  ],
  why: 'It turns a table of a few standard results into the moment of inertia of a pendulum, a swinging leg, a door, or a solar array on a spacecraft — any part about any parallel axis.',
  visual: {
    type: 'mech-rotor',
    title: 'Move the axis, add Md²',
    lead: t`Slide the axis away from the centre of mass (✕) and watch the moment of inertia climb along the parabola $I = I_\text{cm} + Md^2$. Switch shapes: every body has its own $I_\text{cm}$, but they all add the same $Md^2$.`,
    tasks: [
      t`Slide the axis from the rod’s centre to its end ($d = 0.6$ m): $I$ goes from $\tfrac1{12}ML^2$ to $\tfrac13 ML^2$, four times as large.`,
      t`Find the lowest point of the parabola: it is always at $d = 0$. No parallel axis has less $I$ than the one through the centre of mass.`,
      t`Switch to the disk and put the axis on its rim: $\tfrac12 MR^2 + MR^2 = \tfrac32 MR^2$.`,
    ],
    params: { shape: 'rod', shapes: ['rod', 'disk', 'plate'], M: 2, L: 1.2, R: 0.6, W: 0.6, d: 0.3, plot: 'axis', sliders: ['d'] },
  },
  example: {
    prompt: t`A clock pendulum is a uniform 0.50 kg rod, 1.00 m long, pivoted at its top end, with a 2.0 kg disk-shaped bob of radius 0.10 m centred on its lower end. Find its moment of inertia about the pivot (the axis is perpendicular to the disk). How good would treating the bob as a point mass be?`,
    visual: {
      type: 'graph',
      params: {
        x: [-0.7, 0.7], y: [-1.2, 0.12], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [seg([0, 0], [0, -1], 'accent', 5), { param: ['0.1*cos(t)', '-1 + 0.1*sin(t)'], t: [0, 6.2832], color: 'violet', width: 2 }, axisRing(0, 0, 'pivot', 0.035)],
        shade: [{ fn: '-1 + sqrt(max(0, 0.01 - x^2))', lower: '-1 - sqrt(max(0, 0.01 - x^2))', from: -0.1, to: 0.1, color: 'violet', alpha: 0.6 }],
        points: [{ x: 0, y: -0.5, r: 3, color: 'ink', label: 'rod’s centre of mass', labelDx: 10 }, { x: 0, y: -1, r: 3, color: 'ink', label: 'bob’s centre', labelDx: 16 }],
      },
      caption: 'The pendulum, to scale. The pivot axis is perpendicular to the screen.',
    },
    steps: [
      { label: 'Rod', text: t`Its centre of mass is $L/2$ below the pivot: $I_\text{rod} = \tfrac1{12}ML^2 + M\left(\tfrac L2\right)^2 = \tfrac13 ML^2 = \tfrac13(0.50)(1.00)^2 = 0.167\ \text{kg·m}^2$.` },
      { label: 'Bob', text: t`A disk about its own centre has $\tfrac12 mR^2$; its centre is $1.00$ m from the pivot: $I_\text{bob} = \tfrac12(2.0)(0.10)^2 + (2.0)(1.00)^2 = 0.010 + 2.000 = 2.010\ \text{kg·m}^2$.` },
      { label: 'Add', text: t`Moments of inertia about one axis add: $I = 0.167 + 2.010 = 2.18\ \text{kg·m}^2$.` },
      { label: 'Sense check', text: t`As a point mass the bob would give $2.000$ instead of $2.010$ — just 0.5% low, because its radius is small compared with its distance from the pivot. The rod’s 0.167 matters far more.` },
    ],
    answer: t`$I \approx 2.18\ \text{kg·m}^2$ about the pivot; the point-mass bob is only 0.5% low.`,
  },
  practice: [
    num({
      id: 'rod-end', difficulty: 1,
      gen(r) {
        const M = r.pick([1, 2, 4]), L = r.pick([0.8, 1.2, 1.5]);
        const I = (M * L * L) / 3;
        return {
          prompt: t`Use the parallel-axis theorem: what is the moment of inertia of a uniform ${M} kg rod, ${L} m long, about an axis through one end, perpendicular to the rod? ($I_\text{cm} = \tfrac1{12}ML^2$.)`,
          answer: I, units: 'kg m^2', tol: { rel: 0.01 },
          errors: [
            { value: (M * L * L) / 12, feedback: 'That is about the centre. Moving the axis to the end adds Md².' },
            { value: (M * L * L) / 12 + M * L * L, feedback: 'The distance between the axes is from the centre of mass to the end: d = L/2, not L.' },
          ],
          hints: [t`$d$ is the distance from the centre of mass to the new axis: $L/2$.`, t`$I = \tfrac1{12}ML^2 + M(L/2)^2$.`],
          teach: 'Moving an axis a distance d from the centre of mass adds Md²: a rod about its end has ⅓ML².',
          explain: t`$I = \tfrac1{12}(${M})(${L})^2 + (${M})(${L / 2})^2 = ${s3((M * L * L) / 12)} + ${s3((M * L * L) / 4)} = ${s3(I)}\ \text{kg·m}^2$ — that is $\tfrac13 ML^2$.`,
          visual: body({ shape: 'rod', M, L, d: L / 2 }, 'The rod turning about an axis (gold) at its end; ✕ marks its centre of mass.'),
        };
      },
    }),
    num({
      id: 'disk-rim', difficulty: 2,
      gen(r) {
        const M = r.pick([2, 3, 5]), R = r.pick([0.1, 0.2, 0.25]);
        const I = 1.5 * M * R * R;
        return {
          prompt: t`A uniform ${M} kg disk of radius ${R} m swings about an axis through a point on its rim, perpendicular to its face (like a coin spun on a pin through its edge). What is its moment of inertia about that axis?`,
          answer: I, units: 'kg m^2', tol: { rel: 0.01 },
          errors: [
            { value: 0.5 * M * R * R, feedback: 'That is about the centre: add Md² with d = R.' },
            { value: M * R * R, feedback: t`You added $Md^2$ to nothing: start from the disk’s own $I_\text{cm} = \tfrac12 MR^2$.` },
          ],
          hints: [t`$I_\text{cm} = \tfrac12 MR^2$ for a disk, and $d = R$.`],
          teach: 'For a disk about a point on its rim, I = ½MR² + MR² = 3/2 MR².',
          explain: t`$I = \tfrac12 MR^2 + MR^2 = \tfrac32(${M})(${R})^2 = ${s3(I)}\ \text{kg·m}^2$.`,
          visual: body({ shape: 'disk', M, R, d: R }, 'The disk turning about an axis (gold) on its rim; ✕ marks its centre.'),
        };
      },
    }),
    mcq({
      id: 'least', difficulty: 1,
      prompt: 'A flat plate can be spun about any of the four parallel axes A–D, each perpendicular to the plate. About which is its moment of inertia smallest?',
      choices: ['B, through the centre of mass', 'A, at a corner', 'D, on an edge', 'All the same: same plate, same mass'],
      answer: 0,
      why: {
        1: 'A corner is the farthest any axis on the plate can be from the centre of mass: the largest Md².',
        2: 'An edge axis is d away from the centre of mass, and adds Md².',
        3: t`Moment of inertia depends on the axis. $I = I_\text{cm} + Md^2$ is smallest when $d = 0$.`,
      },
      hints: [t`$I = I_\text{cm} + Md^2$. For which axis is $d$ smallest?`],
      teach: 'Among parallel axes, the one through the centre of mass has the least moment of inertia.',
      explain: t`Every other axis adds $Md^2 > 0$ to $I_\text{cm}$, so the axis through the centre of mass, B, has the least.`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.4, 1.4], y: [-0.9, 0.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          shade: [{ fn: '0.6', lower: '-0.6', from: -1, to: 1, color: 'accent', alpha: 0.3 }],
          curves: [seg([-1, -0.6], [1, -0.6], 'accent', 1.6), seg([1, -0.6], [1, 0.6], 'accent', 1.6), seg([1, 0.6], [-1, 0.6], 'accent', 1.6), seg([-1, 0.6], [-1, -0.6], 'accent', 1.6),
            axisRing(-0.95, 0.55, 'A'), axisRing(0, 0, 'B'), axisRing(0.55, -0.2, 'C'), axisRing(1, 0, 'D')],
        },
        caption: 'A uniform rectangular plate with four candidate axes (gold), all perpendicular to the screen.',
      },
    }),
    num({
      id: 'reverse', difficulty: 2,
      gen(r) {
        const M = r.pick([2, 3, 4]), d = r.pick([0.15, 0.2, 0.25]), Icm = r.pick([0.04, 0.06, 0.09]);
        const I = Icm + M * d * d;
        return {
          prompt: t`An engine’s connecting rod (mass ${M} kg) is hung from a pin ${d} m from its centre of mass and swung; the measured moment of inertia about the pin is ${s3(I)} kg·m². What is its moment of inertia about its centre of mass?`,
          answer: Icm, units: 'kg m^2', tol: { rel: 0.01 },
          errors: [{ value: I + M * d * d, feedback: t`Going toward the centre of mass removes $Md^2$: $I_\text{cm} = I - Md^2$.` }],
          hints: [t`$I = I_\text{cm} + Md^2$, so $I_\text{cm} = I - Md^2$.`],
          teach: 'Engineers measure I about a convenient pin, then subtract Md² to get I about the centre of mass.',
          explain: t`$I_\text{cm} = ${s3(I)} - (${M})(${d})^2 = ${s3(I)} - ${s3(M * d * d)} = ${s3(Icm)}\ \text{kg·m}^2$.`,
          visual: body({ shape: 'plate', M, L: 0.5, W: 0.08, d }, 'The rod (drawn as a slim plate) hanging from the pin (gold); ✕ marks its centre of mass.'),
        };
      },
    }),
    order({
      id: 'proof', difficulty: 3,
      prompt: t`Put the steps of the proof of $I = I_\text{cm} + Md^2$ in order. (A body in the $xy$-plane; both axes perpendicular to it.)`,
      items: [
        t`Put the origin at the centre of mass, so that $\sum m_i x_i = 0$ and $\sum m_i y_i = 0$.`,
        t`Take the new axis at $(d,\ 0)$: particle $i$ is now a distance $\sqrt{(x_i - d)^2 + y_i^2}$ from it.`,
        t`Expand: $I = \sum m_i(x_i^2 + y_i^2) - 2d\sum m_i x_i + d^2\sum m_i$.`,
        t`The first sum is $I_\text{cm}$, the middle one is zero, and $\sum m_i = M$.`,
        t`So $I = I_\text{cm} + Md^2$.`,
      ],
      hints: ['Start by choosing where the origin goes — that is what makes one term vanish.', 'Write the squared distance to the new axis, expand it, then recognise each sum.'],
      teach: t`The cross term vanishes because the origin is at the centre of mass — that is why the theorem only works from $I_\text{cm}$.`,
      explain: t`With the origin at the centre of mass, $\sum m_i x_i = Mx_\text{cm} = 0$, so the cross term disappears and $I = I_\text{cm} + Md^2$. From any other starting axis the cross term would not vanish.`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.4, 2.2], y: [-0.4, 1.4], equal: true, xlabel: 'x', ylabel: 'y', xticks: 0.001, yticks: 0.001,
          curves: [seg([0, 0], [1.1, 0.95], 'ink3', 1.4, true), seg([1.5, 0], [1.1, 0.95], 'violet', 1.8)],
          points: [{ x: 0, y: 0, r: 5, color: 'ink', label: 'centre of mass', labelDy: 14, labelDx: -40 }, { x: 1.5, y: 0, r: 5, color: 'gold', label: 'new axis (d, 0)', labelDy: 14 }, { x: 1.1, y: 0.95, r: 5, color: 'accent', label: 'particle i at (xᵢ, yᵢ)' }],
        },
        caption: 'One particle of the body, its distance from the centre of mass (dashed) and from the new axis (violet).',
      },
    }),
    mcq({
      id: 'two-axes', difficulty: 3, kind: 'error',
      prompt: t`A 2.0 kg rod has $I_A = 0.10\ \text{kg·m}^2$ about axis A, 0.10 m from its centre of mass. A student wants $I_B$ about a parallel axis B, 0.30 m from the centre of mass on the same side, and writes $I_B = I_A + M(0.20)^2 = 0.18\ \text{kg·m}^2$. What went wrong?`,
      choices: [
        t`The theorem starts from the centre of mass: $I_\text{cm} = 0.10 - 2(0.10)^2 = 0.08$, then $I_B = 0.08 + 2(0.30)^2 = 0.26\ \text{kg·m}^2$`,
        'Nothing: the axes are 0.20 m apart, so 0.18 kg·m² is right',
        t`Going from A to B should subtract: $I_B = 0.10 - 2(0.20)^2 = 0.02\ \text{kg·m}^2$`,
        t`$d$ should be measured to the end of the rod`,
      ],
      answer: 0,
      why: {
        1: t`$I = I_\text{cm} + Md^2$ needs one of the axes through the centre of mass; between two other axes the cross term $2d\sum m x$ does not vanish.`,
        2: t`B is farther from the centre of mass than A, so $I_B$ must be larger than $I_A$, not smaller.`,
        3: 'd is always between the two parallel axes, one of them through the centre of mass — the rod’s ends play no part.',
      },
      hints: [t`The theorem is $I = I_\text{cm} + Md^2$. Is either A or B through the centre of mass?`, 'Go back to the centre of mass first, then out to B.'],
      teach: 'Use the parallel-axis theorem only from (or to) an axis through the centre of mass; to go between two others, pass through the centre of mass.',
      explain: t`Back to the centre: $I_\text{cm} = I_A - M(0.10)^2 = 0.08\ \text{kg·m}^2$. Out to B: $I_B = 0.08 + 2.0(0.30)^2 = 0.26\ \text{kg·m}^2$ — not 0.18.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-0.7, 0.7], y: [-0.18, 0.18], equal: true, xlabel: 'position along the rod (m)', ylabel: '', yticks: 0.001,
          shade: [{ fn: '0.025', lower: '-0.025', from: -0.6, to: 0.6, color: 'accent', alpha: 0.5 }],
          curves: [axisRing(0.1, 0, 'A', 0.03), axisRing(0.3, 0, 'B', 0.03)],
          points: [{ x: 0, y: 0, r: 4, color: 'ink', label: 'CM', labelDy: 14 }],
        },
        caption: 'The rod (a 1.2 m example) with the centre of mass and the two parallel axes A and B, perpendicular to the screen.',
      },
    }),
    num({
      id: 'point-approx', difficulty: 2,
      gen(r) {
        const R = r.pick([0.05, 0.1, 0.15]), d = r.pick([0.5, 0.8, 1]);
        const extra = 0.4 * R * R, pct = (100 * extra) / (extra + d * d);
        return {
          prompt: t`A solid ball of radius ${R} m is fixed at the end of a light arm, its centre ${d} m from the axis. By what percentage does treating the ball as a point mass at its centre underestimate the moment of inertia? (Solid sphere: $I_\text{cm} = \tfrac25 MR^2$.)`,
          answer: pct, units: '%', tol: { rel: 0.02 },
          errors: extra / (d * d) > 0.025 ? [{ value: (100 * extra) / (d * d), feedback: t`Close — but compare the missing part with the true moment of inertia, $I_\text{cm} + Md^2$, not with $Md^2$ alone.` }] : [],
          hints: [t`True: $I = \tfrac25 MR^2 + Md^2$. Point mass: $Md^2$.`, t`The fraction missed is $\dfrac{\tfrac25 R^2}{\tfrac25 R^2 + d^2}$ — the mass cancels.`],
          teach: 'A body counts as a point mass when its size is small next to its distance from the axis: the error is about (2/5)(R/d)² for a ball.',
          explain: t`Missing part: $\tfrac25 R^2 = ${s3(extra)}\ \text{m}^2$ (per kg); total $${s3(extra + d * d)}$; so the point mass is low by ${s3(pct)}%.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-0.15, d + R + 0.25], y: [-0.4, 0.4], equal: true, xlabel: 'distance from the axis (m)', ylabel: '', yticks: 0.001,
              curves: [seg([0, 0], [d - R, 0], 'ink3', 2), axisRing(0, 0, 'axis', 0.025)],
              shade: [{ fn: `sqrt(max(0, ${r4(R * R)} - (x - ${d})^2))`, lower: `-sqrt(max(0, ${r4(R * R)} - (x - ${d})^2))`, from: r4(d - R), to: r4(d + R), color: 'teal', alpha: 0.6 }],
            },
            caption: 'The ball on its light arm, to scale; the axis (gold) is perpendicular to the screen.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-array', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([30, 45, 60]), L = r.pick([4, 6]), d = L / 2 + 1;
        const I = (m * L * L) / 12 + m * d * d;
        return {
          prompt: t`A spinning satellite carries a solar-array wing: treat it as a uniform ${m} kg beam ${L} m long, lying along a line through the spin axis, with its centre ${d} m from that axis. What is the wing’s moment of inertia about the spin axis?`,
          answer: I, units: 'kg m^2', tol: { rel: 0.01 },
          errors: [
            { value: m * d * d, feedback: t`That treats the wing as a point at its centre. Add the beam’s own $I_\text{cm} = ML^2/12$.` },
            { value: (m * L * L) / 12, feedback: 'That is about the wing’s own centre. The spin axis is d away: add Md².' },
          ],
          hints: ['The wing turns about the spacecraft’s spin axis, not its own centre.', t`$I = \tfrac1{12}mL^2 + md^2$.`],
          teach: t`For a part mounted away from the axis, add its own $I_\text{cm}$ to $md^2$.`,
          explain: t`$I = \tfrac1{12}(${m})(${L})^2 + (${m})(${d})^2 = ${s3((m * L * L) / 12)} + ${s3(m * d * d)} = ${s3(I)}\ \text{kg·m}^2$. Most of it is the $md^2$ term: deploying arrays multiplies a spacecraft’s moment of inertia — and slows its spin, as lesson M11 explains.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.6, d + L / 2 + 0.6], y: [-1.6, 1.6], equal: true, xlabel: 'distance from the spin axis (m)', ylabel: '', yticks: 0.001,
              shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'ink3', alpha: 0.5 }, { fn: '0.3', lower: '-0.3', from: r4(d - L / 2), to: r4(d + L / 2), color: 'accent', alpha: 0.5 }],
              curves: [axisRing(0, 0, 'spin axis', 0.08)],
              points: [{ x: d, y: 0, r: 4, color: 'ink', label: 'wing’s centre', labelDy: 22 }],
            },
            caption: 'Seen along the spin axis: the satellite body (grey) and the wing (blue), to scale.',
          },
        };
      },
    }),
    num({
      id: 'cp-quarter', difficulty: 2,
      gen(r) {
        const M = r.pick([1.5, 2, 3]), L = r.pick([1, 1.2, 2]);
        const I = (M * L * L) / 12 + M * (L / 4) ** 2;
        return {
          prompt: t`A uniform ${M} kg rod ${L} m long turns about a perpendicular axis one quarter of the way along it. What is its moment of inertia about that axis?`,
          answer: I, units: 'kg m^2', tol: { rel: 0.01 },
          errors: [
            { value: (M * L * L) / 12 + M * (L / 2) ** 2, feedback: 'The quarter point is L/4 from the centre, not L/2.' },
            { value: (M * L * L) / 12 + M * (0.75 * L) ** 2, feedback: 'd is measured from the centre of mass (the middle of the rod), not from the far end: L/4.' },
          ],
          hints: [t`The quarter point is $L/4$ from the centre.`, t`$I = \tfrac1{12}ML^2 + M(L/4)^2$.`],
          teach: t`With $I = I_\text{cm} + Md^2$, $d$ is always measured from the centre of mass.`,
          explain: t`$I = \tfrac1{12}(${M})(${L})^2 + (${M})(${L / 4})^2 = ${s3(I)}\ \text{kg·m}^2$ $= \tfrac7{48}ML^2$.`,
          visual: body({ shape: 'rod', M, L, d: L / 4 }, 'The rod and its axis (gold), a quarter of the way along; ✕ marks the centre of mass.'),
        };
      },
    }),
    mcq({
      id: 'cp-curve', difficulty: 2,
      prompt: t`You measure a rod’s moment of inertia about a series of parallel axes at distances $d$ along it, on both sides of its centre of mass. Plotted against $d$, the results lie on…`,
      choices: [t`a parabola, lowest at $d = 0$, where it equals $I_\text{cm}$`, 'a straight line through the origin', 'a parabola, lowest at the end of the rod', t`a horizontal line: $I$ is a fixed property of the rod`],
      answer: 0,
      why: {
        1: t`$I = I_\text{cm} + Md^2$ is quadratic in $d$, and it is $I_\text{cm}$ (not zero) at $d = 0$.`,
        2: 'The Md² term is smallest at d = 0, the centre of mass, and grows toward the ends.',
        3: 'I depends on the axis: it grows by Md² as the axis moves away from the centre of mass.',
      },
      hints: [t`$I(d) = I_\text{cm} + Md^2$: what kind of curve is that?`],
      teach: t`$I$ against axis offset is a parabola with its minimum, $I_\text{cm}$, at the centre of mass.`,
      explain: t`$I(d) = I_\text{cm} + Md^2$ is a parabola opening upward, symmetric about $d = 0$, with minimum value $I_\text{cm}$. Fitting such a plot is how labs measure both $I_\text{cm}$ and $M$.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-0.7, 0.7], y: [-0.16, 0.16], equal: true, xlabel: 'position along the rod (m)', ylabel: '', yticks: 0.001,
          shade: [{ fn: '0.02', lower: '-0.02', from: -0.6, to: 0.6, color: 'accent', alpha: 0.5 }],
          curves: [-0.5, -0.3, -0.1, 0.1, 0.3, 0.5].map((x, i) => axisRing(x, 0, `${['−0.5', '−0.3', '−0.1', '0.1', '0.3', '0.5'][i]}`, 0.025)),
          points: [{ x: 0, y: 0, r: 4, color: 'ink', label: 'CM', labelDy: 14 }],
        },
        caption: 'The rod and the axis positions tried (gold), measured from its centre of mass in metres.',
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §10.5 Calculating moments of inertia (parallel-axis theorem)', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-5-calculating-moments-of-inertia' }],
});
