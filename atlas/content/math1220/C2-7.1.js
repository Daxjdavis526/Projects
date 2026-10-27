// Vectors in the plane — components, magnitude, direction, and addition tip
// to tail: airspeed plus wind is ground velocity.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, frac } from '../../src/core/format.js';
import { TRIPLES, signed, vecTeX, arrows2D, add, sub, scale, norm, deg } from './_vectors.js';

const t = String.raw;
const RAD = Math.PI / 180;
const angleOf = (v) => { const a = deg(Math.atan2(v[1], v[0])); return a < 0 ? a + 360 : a; };

export default lesson({
  id: 'math1220.C2-7.1',
  title: 'Vectors in the plane',
  minutes: 9, difficulty: 1,
  intro: t`A **vector** is a quantity with both a size and a direction: a velocity, a force, a displacement. In the plane you describe it by its **components**, how far it reaches along $x$ and along $y$, and its length follows from Pythagoras:

$$\vec v = \langle v_x, v_y\rangle = v_x\,\hat\imath + v_y\,\hat\jmath, \qquad |\vec v| = \sqrt{v_x^2 + v_y^2}$$

Vectors **add component by component** — geometrically, tip to tail — and a **scalar multiple** $k\vec v$ stretches the arrow by $|k|$, flipping it when $k < 0$. Where an arrow is drawn does not matter; only its length and direction do.`,
  symbols: [
    { tex: '\\vec v', text: 'a vector, written with an arrow; drawn as an arrow whose length is its size' },
    { tex: 'v_x,\\ v_y', text: 'its **components** along the $x$- and $y$-axes, in the units of the quantity (m/s, N, …)' },
    { tex: '\\hat\\imath,\\ \\hat\\jmath', text: t`the **unit vectors** $\langle 1, 0\rangle$ and $\langle 0, 1\rangle$ along the axes` },
    { tex: '|\\vec v|', text: 'the **magnitude**: the length of the arrow, in the same units as the components' },
    { tex: '\\theta', text: t`the direction angle, measured counterclockwise from the $+x$-axis: $v_x = |\vec v|\cos\theta$, $v_y = |\vec v|\sin\theta$` },
  ],
  why: t`Every free-body diagram, every thrust vector and every navigation problem — airspeed plus wind gives ground velocity — is vector addition done in components.`,
  visual: {
    type: 'graph',
    title: 'Adding vectors tip to tail',
    lead: t`Drag the round handles at the tips of $\vec a$ (blue) and $\vec b$ (amber). The grey arrow is $\vec b$ moved so that its tail sits on the tip of $\vec a$; the green arrow from the origin to its tip is $\vec a + \vec b$. The readouts add the components.`,
    tasks: [
      'Drag b until a + b points straight up: then its x-component is zero, so bₓ = −aₓ.',
      'Make b point exactly opposite a with the same length: a + b shrinks to nothing.',
      'Watch |a + b|: it is never more than |a| + |b|, and equals it only when a and b point the same way.',
    ],
    params: {
      x: [-6, 7], y: [-4, 6], equal: true,
      drag: [{ key: 'a', x: 4, y: 1, snap: 0.5 }, { key: 'b', x: 1, y: 3, snap: 0.5 }],
      arrows: [
        { from: [0, 0], to: ['ax', 'ay'], color: 'accent', label: 'a' },
        { from: [0, 0], to: ['bx', 'by'], color: 'warn', label: 'b' },
        { from: ['ax', 'ay'], to: ['ax + bx', 'ay + by'], color: 'ink3' },
        { from: [0, 0], to: ['ax + bx', 'ay + by'], color: 'good', label: 'a + b' },
      ],
      readouts: [
        { label: '$|\\vec a|$', expr: 'sqrt(ax^2 + ay^2)', digits: 3 },
        { label: '$|\\vec b|$', expr: 'sqrt(bx^2 + by^2)', digits: 3 },
        { label: '$(\\vec a + \\vec b)_x$', expr: 'ax + bx', digits: 3 },
        { label: '$(\\vec a + \\vec b)_y$', expr: 'ay + by', digits: 3 },
        { label: '$|\\vec a + \\vec b|$', expr: 'sqrt((ax + bx)^2 + (ay + by)^2)', digits: 3 },
      ],
    },
    caption: 'Handles snap to half-units. Arrows are drawn to scale, with equal units on both axes.',
  },
  example: {
    prompt: t`An aircraft flies with airspeed $240$ km/h pointing due north, while the wind blows at $50$ km/h toward the southeast. Find its velocity over the ground: speed and direction. Take $x$ east and $y$ north.`,
    visual: arrows2D([
      { to: [0, 4.8], color: 'accent' },
      { from: [0, 4.8], to: [Math.SQRT1_2, 4.8 - Math.SQRT1_2], color: 'warn' },
      { to: [Math.SQRT1_2, 4.8 - Math.SQRT1_2], color: 'good' },
    ], { pad: 0.6, aspect: 'wide', caption: 'Blue: velocity relative to the air. Amber: the wind, tip to tail. Green: velocity over the ground. To scale, in units of 50 km/h — the wind bends the track only slightly.' }),
    steps: [
      { label: 'Write each vector in components', text: t`Air velocity: $\vec v_\text{air} = \langle 0, 240\rangle$ km/h. Wind toward the southeast points $45^\circ$ below the $+x$-axis: $\vec w = \langle 50\cos45^\circ, -50\sin45^\circ\rangle = \langle 35.36, -35.36\rangle$ km/h.` },
      { label: 'Add component by component', text: t`$\vec v_\text{ground} = \vec v_\text{air} + \vec w = \langle 0 + 35.36,\ 240 - 35.36\rangle = \langle 35.36,\ 204.64\rangle$ km/h.` },
      { label: 'Speed', text: t`$|\vec v_\text{ground}| = \sqrt{35.36^2 + 204.64^2} = \sqrt{43\,129} = 207.7$ km/h.` },
      { label: 'Direction', text: t`$\theta = \arctan\frac{204.64}{35.36} = 80.2^\circ$ from east — that is $9.8^\circ$ east of north.` },
      { label: 'Sense check', text: t`The wind has a southward part, so the aircraft is slower over the ground than its airspeed (207.7 < 240), and an eastward part, so it drifts east. Magnitudes did not simply add: $240 + 50 = 290$ would be wrong.` },
    ],
    answer: t`Ground velocity $\langle 35.4, 204.6\rangle$ km/h: $207.7$ km/h, $9.8^\circ$ east of north.`,
  },
  practice: [
    num({
      id: 'magnitude-2d', difficulty: 1,
      gen(r) {
        const [x0, y0, c] = r.pick(TRIPLES), v = signed(r, [x0, y0]);
        return {
          prompt: t`Find the magnitude of $\vec v = ${vecTeX(v)}$.`,
          answer: c, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: Math.abs(v[0]) + Math.abs(v[1]), feedback: 'The components are the legs of a right triangle: use Pythagoras, not their sum.' }, { value: c * c, feedback: t`That is $|\vec v|^2$; take the square root.` }],
          hints: [t`$|\vec v| = \sqrt{v_x^2 + v_y^2}$; the signs disappear when you square.`],
          teach: 'The magnitude is the hypotenuse of the right triangle the components make.',
          explain: t`$|\vec v| = \sqrt{(${v[0]})^2 + (${v[1]})^2} = \sqrt{${c * c}} = ${c}$.`,
          visual: arrows2D([{ to: v, label: 'v' }]),
        };
      },
    }),
    num({
      id: 'direction-angle', difficulty: 2,
      gen(r) {
        const v = [-r.int(1, 6), r.intExcept(-6, 6, [0])];
        const ang = angleOf(v), naive = deg(Math.atan(v[1] / v[0]));
        const errors = [{ value: naive, feedback: t`$\arctan(v_y/v_x)$ only returns angles between $-90^\circ$ and $90^\circ$. This vector points left ($v_x < 0$), so add $180^\circ$.` }];
        if (ang > 180) errors.push({ value: ang - 360, feedback: 'That is the same direction measured clockwise. Give the counterclockwise angle, between 0° and 360°.' });
        return {
          prompt: t`What is the direction angle of $\vec v = ${vecTeX(v)}$, measured counterclockwise from the positive $x$-axis, between $0^\circ$ and $360^\circ$? (Give it to the nearest tenth of a degree.)`,
          answer: ang, units: '°', tol: { rel: 0.002, abs: 0.1 },
          errors,
          hints: [t`Sketch it first: $v_x < 0$ and $v_y ${v[1] > 0 ? '> 0' : '< 0'}$ puts it in quadrant ${v[1] > 0 ? 'II' : 'III'}.`, t`$\arctan\frac{${v[1]}}{${v[0]}} = ${nice(naive, 3)}^\circ$ points the wrong way; add $180^\circ$.`],
          teach: t`$\arctan(v_y/v_x)$ cannot tell $\langle 1, 1\rangle$ from $\langle -1, -1\rangle$: check the quadrant and add $180^\circ$ when $v_x < 0$.`,
          explain: t`$\theta = 180^\circ + \arctan\frac{${v[1]}}{${v[0]}} = 180^\circ ${naive < 0 ? '-' : '+'} ${nice(Math.abs(naive), 3)}^\circ = ${nice(ang, 4)}^\circ$.`,
          visual: arrows2D([{ to: v, label: 'v' }]),
        };
      },
    }),
    mcq({
      id: 'unit-vector', difficulty: 2,
      gen(r) {
        const [x0, y0, c] = r.pick(TRIPLES), v = signed(r, [x0, y0]), s = Math.abs(v[0]) + Math.abs(v[1]);
        const show = (d) => t`$\left\langle ${frac(v[0] / d)},\ ${frac(v[1] / d)} \right\rangle$`;
        return {
          prompt: t`Which is the unit vector in the direction of $\vec v = ${vecTeX(v)}$?`,
          choices: [show(c), t`$\left\langle ${frac(-v[0] / c)},\ ${frac(-v[1] / c)} \right\rangle$`, show(s), show(c * c)],
          answer: 0,
          why: {
            1: 'That has length 1 but points the opposite way.',
            2: t`Dividing by $|v_x| + |v_y| = ${s}$ does not give length 1: the magnitude is $\sqrt{v_x^2 + v_y^2} = ${c}$.`,
            3: t`Divide by $|\vec v| = ${c}$, not by $|\vec v|^2 = ${c * c}$.`,
          },
          hints: [t`A unit vector is $\frac{\vec v}{|\vec v|}$.`, t`$|\vec v| = ${c}$.`],
          teach: 'Divide a vector by its magnitude to get a unit vector pointing the same way.',
          visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-2.3, 2.3], equal: true, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink3', width: 1.4 }], arrows: [{ from: [0, 0], to: [(2 * v[0]) / c, (2 * v[1]) / c], color: 'accent', label: 'v' }] }, caption: t`The direction of $\vec v$ (drawn at length 2, not to scale) and the unit circle: the unit vector ends where the arrow crosses the circle.` },
          explain: t`$|\vec v| = ${c}$, so $\hat v = \frac{\vec v}{${c}} = \left\langle ${frac(v[0] / c)}, ${frac(v[1] / c)} \right\rangle$, whose length is $\frac{${c}}{${c}} = 1$.`,
        };
      },
    }),
    num({
      id: 'gimbal', difficulty: 2,
      gen(r) {
        const T = r.pick([500, 850, 1200]), dl = r.pick([2, 3, 5, 6]);
        const side = T * Math.sin(dl * RAD), ex = 4 * dl * RAD;
        return {
          prompt: t`A rocket engine producing $${T}$ kN of thrust is gimballed $${dl}^\circ$ away from the vehicle’s long axis to steer it. What is the sideways component of the thrust, perpendicular to the axis?`,
          answer: side, units: 'kN', tol: { rel: 0.005 },
          errors: [{ value: T * Math.cos(dl * RAD), feedback: t`That is the component along the axis. The sideways part is opposite the gimbal angle: $T\sin\delta$.` }, { value: T * dl, feedback: t`You multiplied by the angle in degrees. Use $\sin\delta$ (close to $\delta$ in radians, for small angles).` }],
          hints: [t`Draw the thrust as the hypotenuse of a right triangle, with the vehicle axis as one leg.`, t`Sideways component $= T\sin\delta$.`],
          teach: t`Resolve a vector at angle $\delta$ to an axis into $|\vec v|\cos\delta$ along it and $|\vec v|\sin\delta$ across it.`,
          explain: t`$${T}\sin${dl}^\circ = ${nice(side, 3)}$ kN sideways, leaving $${nice(T * Math.cos(dl * RAD), 4)}$ kN along the axis. The small-angle approximation $T\delta$ with $\delta$ in radians gives $${nice(T * dl * RAD, 3)}$ kN — almost the same.`,
          visual: arrows2D([
            { to: [Math.sin(ex), Math.cos(ex)], color: 'warn' },
            { to: [0, Math.cos(ex)], color: 'ink3' },
            { from: [0, Math.cos(ex)], to: [Math.sin(ex), Math.cos(ex)], color: 'accent' },
          ], { pad: 0.35, caption: 'Amber: the thrust. Grey: its component along the vehicle axis. Blue: the sideways component. The gimbal angle is exaggerated four times so the sideways part is visible.' }),
        };
      },
    }),
    num({
      id: 'net-force', difficulty: 2,
      gen(r) {
        const [x0, y0, c] = r.pick(TRIPLES), S = signed(r, [x0, y0]);
        let F1, F2;
        for (let k = 0; k < 20; k++) {
          F1 = [r.intExcept(-9, 9, [0]), r.intExcept(-9, 9, [0])]; F2 = sub(S, F1);
          if (F2[0] !== 0 && F2[1] !== 0 && norm(F1) + norm(F2) - c > 0.5) break;
        }
        return {
          prompt: t`Two forces act on a hovering drone’s frame: $\vec F_1 = ${vecTeX(F1)}$ N and $\vec F_2 = ${vecTeX(F2)}$ N. What is the magnitude of the net force?`,
          answer: c, units: 'N', tol: { rel: 1e-3 },
          errors: [{ value: norm(F1) + norm(F2), feedback: 'Magnitudes do not add unless the forces point the same way. Add the components first.' }],
          hints: ['Add the x-components, then the y-components.', t`$\vec F_1 + \vec F_2 = ${vecTeX(S)}$ N. Now find its length.`],
          teach: 'Add vectors component by component, then take the magnitude of the result.',
          explain: t`$\vec F_\text{net} = ${vecTeX(S)}$ N, so $|\vec F_\text{net}| = \sqrt{${S[0] ** 2} + ${S[1] ** 2}} = ${c}$ N — less than $|\vec F_1| + |\vec F_2| = ${nice(norm(F1) + norm(F2), 3)}$ N.`,
          visual: arrows2D([{ to: F1, color: 'accent' }, { from: F1, to: S, color: 'warn' }, { to: S, color: 'good' }], { caption: 'Blue: F₁. Amber: F₂, placed tip to tail. Green: the net force. To scale.' }),
        };
      },
    }),
    num({
      id: 'crab-angle', difficulty: 3,
      gen(r) {
        const v = r.pick([150, 200, 250]), w = r.pick([20, 30, 40, 50]);
        const th = deg(Math.asin(w / v)), north = Math.sqrt(v * v - w * w), u = 50;
        return {
          prompt: t`A light aircraft with airspeed $${v}$ km/h must fly a ground track due north while the wind blows due east at $${w}$ km/h. How many degrees west of north must it point (its *crab angle*)? Give 4 significant figures.`,
          answer: th, units: '°', tol: { rel: 0.001 },
          errors: [{ value: deg(Math.atan(w / v)), feedback: t`The airspeed $${v}$ km/h is the hypotenuse — the aircraft’s full velocity relative to the air — not the northward leg. Use $\sin\theta = ${w}/${v}$.` }],
          hints: [t`Ground velocity = air velocity + wind. For a due-north track the east components must cancel: the air velocity needs a westward component of $${w}$ km/h.`, t`The air velocity has length $${v}$ and west component $${w}$: $\sin\theta = \frac{${w}}{${v}}$.`],
          teach: 'Velocity relative to the ground is velocity relative to the air plus the wind’s velocity.',
          explain: t`$\vec v_\text{air} = \langle -${w},\ ${nice(north, 4)}\rangle$ has length $${v}$, so $\theta = \arcsin\frac{${w}}{${v}} = ${nice(th, 3)}^\circ$ west of north. The ground speed is $\sqrt{${v}^2 - ${w}^2} = ${nice(north, 4)}$ km/h — a crosswind always costs some speed.`,
          visual: arrows2D([
            { to: [-w / u, north / u], color: 'accent' },
            { from: [-w / u, north / u], to: [0, north / u], color: 'warn' },
            { to: [0, north / u], color: 'good' },
          ], { pad: 0.6, aspect: 'wide', caption: 'Blue: velocity relative to the air. Amber: the wind. Green: the northward ground velocity. To scale, in units of 50 km/h.' }),
        };
      },
    }),
    mcq({
      id: 'parallel', difficulty: 2,
      prompt: t`Which vector is parallel to $\langle 2, -3\rangle$?`,
      choices: [t`$\langle -4, 6\rangle$`, t`$\langle 3, -2\rangle$`, t`$\langle 2, 3\rangle$`, t`$\langle 4, -3\rangle$`],
      answer: 0,
      why: {
        1: 'Swapping the components rotates the direction; it is not a multiple.',
        2: t`Flipping one sign reflects the vector; $\langle 2, 3\rangle$ is not a multiple of $\langle 2, -3\rangle$.`,
        3: t`Only the $x$-component was doubled. A multiple scales both: $2\langle 2, -3\rangle = \langle 4, -6\rangle$.`,
      },
      hints: [t`Parallel vectors are scalar multiples: $\vec u = k\vec v$ for some number $k$.`],
      teach: t`Two vectors are parallel when one is a scalar multiple of the other; a negative $k$ points the opposite way, but along the same line.`,
      visual: { type: 'graph', params: { x: [-6, 6], y: [-6, 6], equal: true, curves: [{ param: ['2t', '-3t'], t: [-3, 3], color: 'ink3', width: 1.2, dash: true }], arrows: [{ from: [0, 0], to: [2, -3], color: 'accent', label: '⟨2, −3⟩' }] }, caption: 'Every vector parallel to ⟨2, −3⟩ lies along the dashed line through the origin, pointing either way along it.' },
      explain: t`$\langle -4, 6\rangle = -2\langle 2, -3\rangle$: a scalar multiple with $k = -2$, so it lies along the same line, pointing the other way.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-combination', difficulty: 2,
      gen(r) {
        const [x0, y0, c] = r.pick(TRIPLES), S = signed(r, [x0, y0]);
        const a = [r.intExcept(-5, 5, [0]), r.intExcept(-5, 5, [0])], b = sub(scale(a, 2), S);
        const errors = [{ value: norm(add(scale(a, 2), b)), feedback: t`Subtract $\vec b$: $2\vec a - \vec b$, not $2\vec a + \vec b$.` }, { value: Math.abs(2 * norm(a) - norm(b)), feedback: 'Combine the components first, then take the magnitude.' }].filter((e) => Math.abs(e.value - c) > 0.05);
        return {
          prompt: t`$\vec a = ${vecTeX(a)}$ and $\vec b = ${vecTeX(b)}$. Find $|2\vec a - \vec b|$.`,
          answer: c, tol: { rel: 1e-3 },
          errors,
          hints: [t`$2\vec a - \vec b = \langle 2a_x - b_x,\ 2a_y - b_y\rangle$.`],
          teach: 'Scale and add component by component; take the magnitude last.',
          visual: arrows2D([{ to: a, color: 'accent', label: 'a' }, { to: b, color: 'warn', label: 'b' }], { caption: 'The two vectors, to scale.' }),
          explain: t`$2\vec a - \vec b = ${vecTeX(S)}$, with magnitude $\sqrt{${S[0] ** 2} + ${S[1] ** 2}} = ${c}$.`,
        };
      },
    }),
    num({
      id: 'cp-direction', difficulty: 2,
      gen(r) {
        const v = [r.intExcept(-6, 6, [0]), -r.int(1, 6)];
        const ang = angleOf(v);
        return {
          prompt: t`Find the direction angle of $${vecTeX(v)}$, counterclockwise from the positive $x$-axis, between $0^\circ$ and $360^\circ$, to the nearest tenth of a degree.`,
          answer: ang, units: '°', tol: { rel: 0.002, abs: 0.1 },
          errors: [
            ...(v[0] < 0 ? [{ value: deg(Math.atan(v[1] / v[0])), feedback: 'Check the quadrant: arctan alone returns an angle between −90° and 90°, and this vector points left, so add 180°.' }] : []),
            { value: ang - 360, feedback: 'Same direction, measured clockwise: add 360°.' },
          ],
          hints: [t`Which quadrant is $${vecTeX(v)}$ in?`],
          teach: 'Find the quadrant first; arctan gives the right angle only for vectors pointing right.',
          visual: arrows2D([{ to: v, label: 'v' }]),
          explain: t`The vector is in quadrant ${v[0] > 0 ? 'IV' : 'III'}, so $\theta = ${nice(ang, 4)}^\circ$.`,
        };
      },
    }),
    num({
      id: 'cp-burn', difficulty: 3, transfer: true,
      gen(r) {
        const [orbit, v] = r.pick([['a low Earth orbit', 7.7], ['a low Earth orbit', 7.5], ['geostationary orbit', 3.07]]), d = r.pick([0.1, 0.2, 0.3, 0.5]);
        const gain = (Math.sqrt(v * v + d * d) - v) * 1000;
        return {
          prompt: t`A spacecraft in ${orbit} moves at $${v}$ km/s. It fires its engine to add $${d}$ km/s **perpendicular** to its velocity (straight away from Earth). By how many **m/s** does its speed change?`,
          answer: gain, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: d * 1000, feedback: 'Speeds only add like that when the vectors are parallel. These are perpendicular: use Pythagoras.' }],
          hints: [t`New velocity $= \langle ${v}, ${d}\rangle$ km/s in a frame with $x$ along the old velocity.`, t`New speed $\sqrt{${v}^2 + ${d}^2}$; subtract $${v}$ and convert to m/s.`],
          teach: 'A burn perpendicular to the velocity mostly turns it; the speed changes only by about Δv²/(2v).',
          visual: arrows2D([{ to: [v, 0], color: 'accent' }, { from: [v, 0], to: [v, 5 * d], color: 'warn' }, { to: [v, 5 * d], color: 'good' }], { pad: 0.5, aspect: 'wide', caption: 'Blue: velocity before the burn. Amber: the burn, at right angles (drawn five times longer so it shows). Green: velocity after — turned, and only slightly longer.' }),
          explain: t`$\sqrt{${v}^2 + ${d}^2} = ${nice(Math.sqrt(v * v + d * d), 6)}$ km/s, a gain of only $${nice(gain, 3)}$ m/s from a $${d * 1000}$ m/s burn — the burn mostly rotates the velocity, by $\arctan\frac{${d}}{${v}} = ${nice(deg(Math.atan(d / v)), 3)}^\circ$. The binomial series agrees: $\sqrt{v^2 + d^2} \approx v + \frac{d^2}{2v}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §2.1 Vectors in the Plane', url: 'https://openstax.org/books/calculus-volume-3/pages/2-1-vectors-in-the-plane' },
  ],
});
