// Vectors and components: an arrow becomes two signed numbers once you choose axes.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { vectorPicture, polar, segment, DEG } from './_vectors.js';

const t = String.raw;
const deg = (x) => (x * 180) / Math.PI;

// expressions for the Explore graph: components of the dragged tip (px, py) along axes rotated by phi
const C = 'cos(phi*pi/180)', S = 'sin(phi*pi/180)';
const AX = `(px*${C} + py*${S})`, AY = `(-px*${S} + py*${C})`;

// the worked example: a rocket's velocity along a tilted flight path
const EX = { v: 340, a: 62 };
EX.vx = EX.v * Math.cos(EX.a * DEG);
EX.vy = EX.v * Math.sin(EX.a * DEG);

const r4 = (v) => +(+v).toFixed(4);

// A rocket partway up its climb: a scene to test each listed quantity against.
const CLIMB = {
  type: 'graph',
  params: {
    aspect: 'wide', equal: true, x: [-1.5, 8], y: [-0.8, 6.4], axes: false, grid: false,
    alt: 'A rocket partway along a curved climb from its launch pad',
    curves: [
      segment([-1.2, 0], [7.5, 0], { color: 'ink3', dash: false }),
      { param: ['5*t^2', '7*t'], t: [0, 0.75], color: 'ink3', width: 1.5, dash: true },
    ],
    points: [
      { x: 0, y: 0, r: 5, color: 'ink2', label: 'launch pad' },
      { x: 2.8125, y: 5.25, r: 6, color: 'gold', label: 'the rocket' },
    ],
  },
  caption: 'A rocket partway up its climb. Test each quantity: could you draw it as an arrow on this picture — does it point somewhere? If so, it is a vector.',
};

// Runway axes: the wind (length to scale, w = 1) splits into a headwind along the
// centreline and a crosswind across it. The aircraft lands moving to the right.
function runway(w, a) {
  const c = Math.cos(a * DEG), s = Math.sin(a * DEG);
  const T = [r4(c), r4(s)], R = 0.32;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', equal: true, x: [-1.9, 1.75], y: [-0.45, 1.15], axes: false, grid: false,
      alt: 'A runway seen from above, with the wind arrow split into components along and across it',
      curves: [
        segment([-1.85, 0.07], [1.7, 0.07], { color: 'ink3', dash: false }),
        segment([-1.85, -0.07], [1.7, -0.07], { color: 'ink3', dash: false }),
        segment([-1.85, 0], [1.7, 0], { color: 'ink4', width: 1 }),
        { param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, r4(a * DEG)], color: 'gold', width: 1.8 },
      ],
      arrows: [
        { from: T, to: [0, 0], color: 'accent' },
        { from: T, to: [0, T[1]], color: 'warn' },
        { from: [0, T[1]], to: [0, 0], color: 'good' },
      ],
      points: [
        { x: -1.5, y: 0, r: 4.5, color: 'ink2', label: 'landing →' },
        { x: r4(c + 0.01), y: r4(s - 0.02), r: 0.01, color: 'accent', label: `wind, ${w} km/h` },
        { x: r4(c / 2 - 0.15), y: r4(s + 0.07), r: 0.01, color: 'warn', label: 'headwind' },
        { x: -0.62, y: r4(s / 2), r: 0.01, color: 'good', label: 'crosswind = ?' },
        { x: r4(1.25 * R * Math.cos((a * DEG) / 2)), y: r4(1.25 * R * Math.sin((a * DEG) / 2) - 0.03), r: 0.01, color: 'gold', label: `${a}°` },
      ],
    },
    caption: 'The runway from above, with axes along and across it. The wind arrow splits into a headwind along the centreline and a crosswind across it. Drawn to scale, without numbers: compute, don’t read off.',
  };
}

// A gimballed engine: thrust tilted g degrees off the rocket's axis, drawn to scale (T = 1).
function gimbal(T, g) {
  const sx = Math.sin(g * DEG), cy = Math.cos(g * DEG), R = 0.45;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', equal: true, x: [-0.9, 0.9], y: [-0.22, 1.12], axes: false, grid: false,
      alt: 'A thrust arrow tilted a few degrees off the rocket axis, with its sideways component',
      curves: [
        segment([0, -0.15], [0, 1.08], { color: 'ink3' }),
        segment([sx, cy], [0, cy], { color: 'ink4', width: 1 }),
        { param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [r4((90 - g) * DEG), r4(Math.PI / 2)], color: 'gold', width: 1.8 },
      ],
      arrows: [
        { from: [0, 0], to: [r4(sx), r4(cy)], color: 'accent', label: `thrust, ${T} kN` },
        { from: [0, 0], to: [r4(sx), 0], color: 'warn' },
      ],
      points: [
        { x: -0.36, y: 1.02, r: 0.01, color: 'ink3', label: 'rocket axis' },
        { x: -0.16, y: 0.5, r: 0.01, color: 'gold', label: `${g}°` },
        { x: 0.02, y: -0.1, r: 0.01, color: 'warn', label: 'sideways = ?' },
      ],
    },
    caption: 'Drawn to scale: a tilt of a few degrees moves only a small part of the thrust sideways. Compute it — the picture carries no numbers.',
  };
}

export default lesson({
  id: 'phys2210.M2.1',
  title: 'Vectors and components',
  minutes: 9, difficulty: 1,
  intro: t`A **vector** has a size and a direction — a displacement, a velocity, a force — while a **scalar** has only a size, like a mass, a temperature or a time. Once you choose axes, any vector in a plane splits into two **components**, its shadows along the axes:

$$A_x = A\cos\theta, \qquad A_y = A\sin\theta, \qquad A = \sqrt{A_x^2 + A_y^2}$$

Components turn arrows into ordinary numbers you can add, subtract and feed into equations. They depend on the axes you choose; the arrow itself does not.`,
  symbols: [
    { tex: '\\vec A', text: 'the vector itself: an arrow with a length and a direction. Printed bold (**A**) in many books; written with an arrow by hand' },
    { tex: 'A = |\\vec A|', text: 'the magnitude — the length of the arrow, never negative, in the vector’s units (m, m/s, N…)' },
    { tex: '\\theta', text: 'the direction: the angle from the $+x$ axis to the arrow, measured anticlockwise' },
    { tex: 'A_x,\\ A_y', text: 'the components: signed numbers in the same units as $A$. A negative component means the arrow points along $-x$ or $-y$' },
  ],
  why: 'Every force problem, orbit and flight path you will solve works in components — and the idea that components change with your axes while the vector does not is the seed of four-vectors and tensors in relativity.',
  visual: {
    type: 'graph',
    title: 'Drag a vector and watch its components',
    lead: t`Drag the tip of $\vec A$ (a displacement, in metres). The amber and green arrows are its components: walk along $x$, then along $y$, and you arrive at the tip. Then tilt the axes with the slider: the components change, the arrow does not.`,
    tasks: [
      'Drag A into the upper-left quarter: Aₓ turns negative while |A| stays positive.',
      'Point A straight up: Aₓ = 0 and θ = 90°.',
      'Rotate the axes by φ: the components change, but |A| does not. Physics cannot depend on how you lay your grid.',
    ],
    params: {
      x: [-6, 6], y: [-4.5, 4.5], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
      alt: 'A draggable vector with its x- and y-components and a pair of axes that can be rotated',
      drag: [{ key: 'p', x: 4, y: 3, snap: 0.5 }],
      sliders: [{ key: 'phi', label: 'Rotate the axes by $\\varphi$', min: 0, max: 90, step: 5, value: 0, unit: '^\\circ', explain: 'The dashed violet axes are the rotated ones; the components are measured along them.' }],
      curves: [
        { param: [`t*${C}`, `t*${S}`], t: [-8, 8], color: 'violet', width: 1.3, dash: true, when: 'phi' },
        { param: [`-t*${S}`, `t*${C}`], t: [-8, 8], color: 'violet', width: 1.3, dash: true, when: 'phi' },
        { param: ['0.9*cos(t)', '0.9*sin(t)'], t: ['phi*pi/180', `phi*pi/180 + atan2(${AY}, ${AX})`], color: 'gold', width: 1.8 },
      ],
      arrows: [
        { from: [0, 0], to: [`${AX}*${C}`, `${AX}*${S}`], color: 'warn' },
        { from: [`${AX}*${C}`, `${AX}*${S}`], to: ['px', 'py'], color: 'good' },
        { from: [0, 0], to: ['px', 'py'], color: 'accent', label: 'A' },
      ],
      points: [
        { x: `${AX}*${C}/2 - 0.4`, y: `${AX}*${S}/2 - 0.55`, r: 0.01, color: 'warn', label: 'x-component' },
        { x: `(${AX}*${C} + px)/2 + 0.2`, y: `(${AX}*${S} + py)/2`, r: 0.01, color: 'good', label: 'y-component' },
        { x: `1.3*cos(phi*pi/180 + atan2(${AY}, ${AX})/2)`, y: `1.3*sin(phi*pi/180 + atan2(${AY}, ${AX})/2)`, r: 0.01, color: 'gold', label: 'θ' },
      ],
      readouts: [
        { label: '$A_x$', expr: AX, unit: '\\mathrm{m}', digits: 3 },
        { label: '$A_y$', expr: AY, unit: '\\mathrm{m}', digits: 3 },
        { label: '$|\\vec A|$', expr: 'sqrt(px^2 + py^2)', unit: '\\mathrm{m}', digits: 3 },
        { label: '$\\theta$', expr: `atan2(${AY}, ${AX})*180/pi`, unit: '^\\circ', digits: 3 },
      ],
    },
    caption: 'Drag the tip of A; it snaps to half-metre steps (arrow keys move it too). With the axes rotated, components and θ are measured along the dashed axes; θ is reported between −180° and 180°.',
  },
  example: {
    prompt: t`A rocket climbs at ${EX.v} m/s along a flight path tilted ${EX.a}° above the horizontal. Find the horizontal and vertical components of its velocity.`,
    visual: vectorPicture({
      arrows: [{ to: polar(EX.v, EX.a), label: 'v = 340 m/s' }], comps: { of: polar(EX.v, EX.a), labels: ['horizontal', 'vertical'] },
      arc: { from: 0, to: EX.a, label: '62°' }, xlabel: 'horizontal (m/s)', ylabel: 'vertical (m/s)', caption: 'The velocity and its components, drawn to scale.',
    }),
    steps: [
      { label: 'Draw and choose axes', text: t`Take $x$ horizontal and $y$ vertical. The angle is measured from the $+x$ axis, so the horizontal component is the side *adjacent* to the angle and the vertical one is *opposite* it.` },
      { label: 'Horizontal', text: t`$v_x = v\cos\theta = (${EX.v}\ \text{m/s})\cos ${EX.a}^\circ = ${fmt(EX.vx, 4)}\ \text{m/s} \approx ${fmt(EX.vx, 3)}\ \text{m/s}$` },
      { label: 'Vertical', text: t`$v_y = v\sin\theta = (${EX.v}\ \text{m/s})\sin ${EX.a}^\circ = ${fmt(EX.vy, 4)}\ \text{m/s} \approx ${fmt(EX.vy, 3)}\ \text{m/s}$` },
      { label: 'Sense check', text: t`The path is steeper than 45°, so the vertical component should be the larger — it is. And Pythagoras recovers the speed: $\sqrt{${fmt(EX.vx, 4)}^2 + ${fmt(EX.vy, 4)}^2} = ${fmt(Math.hypot(EX.vx, EX.vy), 3)}$ m/s.` },
    ],
    answer: t`$v_x \approx ${fmt(EX.vx, 3)}$ m/s horizontally and $v_y \approx ${fmt(EX.vy, 3)}$ m/s upward.`,
  },
  practice: [
    multi({
      id: 'which-vectors', difficulty: 1,
      prompt: 'Which of these quantities are vectors? Select all that apply.',
      choices: ['the thrust of a rocket engine', 'a spacecraft’s velocity', 'the mass of its propellant', 'the temperature of its exhaust', 'its speed', 'its displacement from the launch pad'],
      answer: [0, 1, 5],
      why: {
        2: 'Mass has a size but no direction: it is a scalar.',
        3: 'A temperature has no direction: it is a scalar.',
        4: 'Speed is the size of the velocity with the direction thrown away — a scalar.',
      },
      hints: ['For each one, ask: does it make sense to say which way it points?'],
      visual: CLIMB,
      teach: 'A vector has a magnitude and a direction (force, velocity, displacement); a scalar has only a magnitude (mass, temperature, speed, time).',
      explain: 'Thrust, velocity and displacement all point somewhere. Mass, temperature and speed are amounts with no direction.',
    }),
    num({
      id: 'x-component', difficulty: 1,
      gen(r) {
        const F = r.pick([20, 35, 50, 80, 120]), a = r.pick([25, 30, 37, 40, 53, 60, 65]);
        const Fx = F * Math.cos(a * DEG);
        return {
          prompt: t`A cable pulls on a hook with a force of ${F} N, directed ${a}° above the $+x$ axis. What is the $x$-component of the force, to 3 significant figures?`,
          answer: Fx, units: 'N', tol: { rel: 0.005 },
          errors: [
            { value: F * Math.sin(a * DEG), feedback: 'That is the y-component. The angle is measured from the x-axis, so the x-component is the adjacent side: use the cosine.' },
            { value: F * Math.cos(a), feedback: 'Your calculator is in radians. Switch it to degrees, or convert the angle first.' },
          ],
          hints: [t`The $x$-component is adjacent to an angle measured from the $x$-axis: $F_x = F\cos\theta$.`],
          teach: 'For an angle measured from the +x axis, the x-component is F cos θ and the y-component is F sin θ.',
          explain: t`$F_x = F\cos\theta = ${F}\cos ${a}^\circ = ${fmt(Fx, 3)}$ N.`,
          visual: vectorPicture({ arrows: [{ to: polar(F, a), label: 'F' }], comps: { of: polar(F, a), labels: ['Fₓ = ?', ''] }, arc: { from: 0, to: a, label: `${a}°` }, numbers: false }),
        };
      },
    }),
    num({
      id: 'negative-component', difficulty: 2,
      gen(r) {
        const v = r.pick([20, 30, 45, 60]), a = r.pick([120, 150, 160, 200, 210, 240]);
        const vx = v * Math.cos(a * DEG);
        return {
          prompt: t`A ${v} km/h wind blows toward a direction ${a}° anticlockwise from east. With east as $+x$ and north as $+y$, what is its east ($x$) component?`,
          answer: vx, units: 'km/h', tol: { rel: 0.01 },
          errors: [{ value: v * Math.sin(a * DEG), feedback: 'That is the north (y) component. For an angle measured from +x, the x-component uses the cosine.' }],
          hints: ['The wind blows toward the west side of north–south, so its east component is negative.', t`$v_x = v\cos\theta$ with $\theta = ${a}^\circ$; the cosine supplies the sign.`],
          teach: 'A component is negative when the vector points along the negative axis; with θ measured from +x, cos θ supplies the sign automatically.',
          explain: t`$v_x = ${v}\cos ${a}^\circ = ${fmt(vx, 3)}$ km/h. The minus sign says the wind is blowing partly toward the west.`,
          visual: vectorPicture({ arrows: [{ to: polar(v, a), label: 'wind' }], comps: { of: polar(v, a), labels: ['east part = ?', ''] }, arc: { from: 0, to: a, label: `${a}°` }, numbers: false, xlabel: 'east', ylabel: 'north' }),
        };
      },
    }),
    num({
      id: 'speed-from-components', difficulty: 1,
      gen(r) {
        const vx = r.intExcept(-9, 9, [0]), vy = r.intExcept(-9, 9, [0]);
        const v = Math.hypot(vx, vy);
        return {
          prompt: t`A drone’s velocity has components $v_x = ${vx}$ m/s and $v_y = ${vy}$ m/s. What is its speed?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.abs(vx) + Math.abs(vy), feedback: 'The components are perpendicular, so they combine by Pythagoras, not by adding.' }],
          hints: [t`Speed is the magnitude: $v = \sqrt{v_x^2 + v_y^2}$. Squaring removes the signs.`],
          teach: 'The magnitude of a vector is the square root of the sum of the squares of its components — always positive.',
          explain: t`$v = \sqrt{(${vx})^2 + (${vy})^2} = \sqrt{${vx * vx + vy * vy}} = ${fmt(v, 3)}$ m/s.`,
          visual: vectorPicture({ arrows: [{ to: [vx, vy], label: 'v' }], comps: { of: [vx, vy], labels: ['', ''] }, xlabel: 'x (m/s)', ylabel: 'y (m/s)' }),
        };
      },
    }),
    num({
      id: 'direction-angle', difficulty: 2,
      gen(r) {
        const [ax, ay] = r.pick([[-3, 4], [-5, 2], [-2, -6], [-7, -3], [-4, 1], [-1, -5]]);
        const theta = deg(Math.atan2(ay, ax));
        const ans = theta < 0 ? theta + 360 : theta;
        const naive = deg(Math.atan(ay / ax));
        return {
          prompt: t`A vector has components $A_x = ${ax}$ m and $A_y = ${ay}$ m. What is its direction, measured anticlockwise from the $+x$ axis (an angle between 0° and 360°)?`,
          answer: ans, units: '°', tol: { rel: 0.005 },
          errors: [{ value: naive, feedback: t`That is what $\tan^{-1}$ on a calculator returns, but it only gives angles between −90° and 90°. This vector points left ($A_x < 0$), so add 180°.` }],
          hints: ['Sketch it first: which quarter of the plane does the arrow point into?', t`$\tan^{-1}(A_y/A_x) = ${fmt(naive, 3)}°$ points the wrong way for a vector with $A_x < 0$; add 180°.`],
          teach: t`$\tan^{-1}(A_y/A_x)$ only covers −90° to 90°; when $A_x < 0$, add 180° to point the arrow the right way.`,
          explain: t`$\tan^{-1}\!\left(\dfrac{${ay}}{${ax}}\right) = ${fmt(naive, 3)}°$, but $A_x < 0$, so $\theta = ${fmt(naive, 3)}° + 180° = ${fmt(ans, 4)}°$.`,
          visual: vectorPicture({ arrows: [{ to: [ax, ay], label: 'A' }], comps: { of: [ax, ay], labels: ['', ''] }, arc: { from: 0, to: ans, label: 'θ', r: 0.45 }, xlabel: 'x (m)', ylabel: 'y (m)' }),
        };
      },
    }),
    mcq({
      id: 'rotate-axes', difficulty: 3,
      prompt: 'You describe a vector using one set of axes, then rotate the axes by 30° and describe it again. What changes?',
      choices: ['Its components change; its magnitude and the arrow itself do not', 'Its components and its magnitude both change', 'Nothing: the components belong to the vector, not to the axes', 'Only its magnitude changes'],
      answer: 0,
      why: {
        1: t`The length of an arrow does not depend on the grid laid over it: $\sqrt{A_x^2 + A_y^2}$ comes out the same in every rotated frame.`,
        2: 'Components are shadows on the axes, so tilting the axes changes them. The arrow is what stays fixed.',
        3: 'The magnitude is the one thing a rotation cannot change.',
      },
      hints: ['Picture the arrow fixed on the page while you turn the grid underneath it.', 'Which numbers are measured along the grid lines, and which is the arrow’s own length?'],
      teach: 'A vector is a geometric object: its components depend on the axes you choose, its magnitude does not.',
      explain: 'Rotating the axes changes how the arrow projects onto them — the components — but not the arrow or its length. Relativity builds on exactly this idea: the quantities every observer agrees on are built from vectors, not from their components.',
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-1, 5], y: [-0.6, 3.6], equal: true, xticks: 0.001, yticks: 0.001, xlabel: 'x', ylabel: 'y',
          arrows: [{ from: [0, 0], to: [3.5, 2.5], color: 'accent', label: 'A' }],
          curves: [
            { param: [`t*${Math.cos(30 * DEG).toFixed(4)}`, `t*${Math.sin(30 * DEG).toFixed(4)}`], t: [-1, 5], color: 'violet', width: 1.3, dash: true },
            { param: [`-t*${Math.sin(30 * DEG).toFixed(4)}`, `t*${Math.cos(30 * DEG).toFixed(4)}`], t: [-0.6, 3.6], color: 'violet', width: 1.3, dash: true },
          ],
          points: [{ x: +(4.6 * Math.cos(30 * DEG)).toFixed(3), y: +(4.6 * Math.sin(30 * DEG)).toFixed(3), r: 0.01, color: 'violet', label: 'x′' }, { x: +(-3.3 * Math.sin(30 * DEG)).toFixed(3), y: +(3.3 * Math.cos(30 * DEG)).toFixed(3), r: 0.01, color: 'violet', label: 'y′' }],
        },
        caption: 'The same arrow with the original axes (solid) and axes rotated by 30° (dashed).',
      },
    }),
    num({
      id: 'ramp-component', difficulty: 3,
      gen(r) {
        const W = r.pick([400, 600, 900, 1200]), a = r.pick([15, 20, 25, 30, 35]);
        const along = W * Math.sin(a * DEG);
        return {
          prompt: t`A ${W} N crate rests on a loading ramp tilted ${a}° above the horizontal. Use axes along the ramp and perpendicular to it. What is the size of the component of the crate’s weight along the ramp?`,
          answer: along, units: 'N', tol: { rel: 0.005 },
          errors: [
            { value: W * Math.cos(a * DEG), feedback: 'That is the component perpendicular to the ramp. Tilting the axes by the ramp angle puts that angle between the weight and the perpendicular axis.' },
            { value: W, feedback: 'Only part of the weight acts along the ramp; the rest presses the crate into it.' },
          ],
          hints: ['Tilting the axes by the ramp angle tilts the angle between the weight and the perpendicular axis by the same amount.', t`The weight makes an angle of ${a}° with the axis perpendicular to the ramp, so its component along the ramp is $W\sin ${a}^\circ$.`],
          teach: 'With axes tilted to match a ramp of angle θ, the weight splits into W sin θ along the ramp and W cos θ into it.',
          explain: t`Along the ramp: $W\sin\theta = ${W}\sin ${a}^\circ = ${fmt(along, 3)}$ N. Check the limits: a flat ramp ($\theta = 0$) gives zero, and a vertical one gives the whole weight.`,
          visual: { type: 'diagram', params: { kind: 'incline', angle: a, forces: [{ dir: 'down', label: 'W', size: 1, color: 'ink2' }, { dir: 'down-slope', label: 'along ramp = ?', size: +Math.sin(a * DEG).toFixed(3), color: 'warn' }] }, caption: 'Arrow lengths are to scale with each other.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-crosswind', difficulty: 3, transfer: true,
      gen(r) {
        const w = r.pick([30, 40, 50, 65]), a = r.pick([20, 30, 35, 50, 60]);
        const cross = w * Math.sin(a * DEG);
        return {
          prompt: t`A ${w} km/h wind blows at ${a}° to the centreline of the runway an airliner is about to land on. What is the crosswind component — the part of the wind perpendicular to the runway?`,
          answer: cross, units: 'km/h', tol: { rel: 0.01 },
          errors: [{ value: w * Math.cos(a * DEG), feedback: 'That is the headwind component, along the runway. The crosswind is the part perpendicular to it.' }, { value: w * Math.sin(a), feedback: 'Your calculator is in radians; the angle is in degrees.' }],
          hints: ['Put one axis along the runway and the other across it.', t`The crosswind is opposite the ${a}° angle: $w\sin ${a}^\circ$.`],
          visual: runway(w, a),
          teach: 'Choose axes that match the problem — along and across the runway — and the components answer the question directly.',
          explain: t`Crosswind $= w\sin\theta = ${w}\sin ${a}^\circ = ${fmt(cross, 3)}$ km/h, and the headwind is $w\cos\theta = ${fmt(w * Math.cos(a * DEG), 3)}$ km/h. Pilots work this out (in knots) before landing: every aircraft type has a maximum demonstrated crosswind.`,
        };
      },
    }),
    num({
      id: 'cp-gimbal', difficulty: 2,
      gen(r) {
        const T = r.pick([7.6, 15, 40, 220]), g = r.pick([3, 4.5, 6, 8]);
        const side = T * Math.sin(g * DEG);
        return {
          prompt: t`To steer, a rocket swivels (gimbals) its engine so that the ${T} kN thrust points ${g}° away from the rocket’s long axis. What component of the thrust acts sideways, perpendicular to the axis?`,
          answer: side, units: 'kN', tol: { rel: 0.01 },
          errors: [{ value: T * Math.cos(g * DEG), feedback: 'That is the component along the axis — almost all of the thrust. The sideways part is opposite the small angle.' }, { value: T * Math.sin(g), feedback: 'Your calculator is in radians; the angle is in degrees.' }],
          hints: [t`Sideways component $= T\sin\theta$, with $\theta$ the gimbal angle.`],
          visual: gimbal(T, g),
          teach: 'A small tilt moves only a small fraction of a vector into the perpendicular direction: about sin θ of it.',
          explain: t`$T\sin\theta = ${T}\sin ${g}^\circ = ${fmt(side, 3)}$ kN sideways, while $T\cos\theta = ${fmt(T * Math.cos(g * DEG), 4)}$ kN still pushes along the axis. A few degrees of gimbal give a steering force of a few percent of the thrust.`,
        };
      },
    }),
    mcq({
      id: 'cp-quadrant', difficulty: 1,
      prompt: t`A vector has $A_x < 0$ and $A_y < 0$. Its direction, measured anticlockwise from the $+x$ axis, lies between:`,
      choices: ['180° and 270°', '90° and 180°', '270° and 360°', '0° and 90°'],
      answer: 0,
      why: {
        1: t`Between 90° and 180° the arrow points up and to the left: $A_x < 0$ but $A_y > 0$.`,
        2: t`Between 270° and 360° the arrow points down and to the right: $A_x > 0$.`,
        3: 'Between 0° and 90° both components are positive.',
      },
      hints: ['Negative x means left; negative y means down.'],
      teach: 'The signs of the components tell you the quarter: (+,+) 0–90°, (−,+) 90–180°, (−,−) 180–270°, (+,−) 270–360°.',
      explain: 'Both components negative: the arrow points down and to the left, which is between 180° and 270°.',
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §2.1–2.2', url: 'https://openstax.org/books/university-physics-volume-1/pages/2-2-coordinate-systems-and-components-of-a-vector' },
  ],
});
