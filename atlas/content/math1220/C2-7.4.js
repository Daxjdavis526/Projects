// The cross product — a vector perpendicular to two others, as long as the
// parallelogram they span: torque, angular momentum, the normal to an orbit.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { vecTeX, arrows2D, add, sub, scale, dot, cross, norm, deg } from './_vectors.js';

const t = String.raw;
const D = 'pi/180';
const BX = `B*cos(th*${D})*cos(ph*${D})`, BY = `B*sin(th*${D})*cos(ph*${D})`, BZ = `B*sin(ph*${D})`;
const pointTeX = (p) => `(${p.join(', ')})`;
const rand3 = (r, lo = -4, hi = 4) => [r.int(lo, hi), r.int(lo, hi), r.int(lo, hi)];
const fit = (...vs) => Math.max(3, Math.ceil(Math.max(...vs.flat().map(Math.abs))) + 0.5);
const scene = (params, caption = 'Drag to rotate.') => ({ type: 'calc-vectors3d', params, caption });

export default lesson({
  id: 'math1220.C2-7.4',
  title: 'The cross product',
  minutes: 11, difficulty: 3,
  intro: t`The **cross product** of two vectors in space is a third vector, **perpendicular to both**, whose length is the area of the parallelogram they span. Its direction follows the **right-hand rule**: point your fingers along $\vec a$, curl them toward $\vec b$, and your thumb points along $\vec a\times\vec b$.

$$\vec a\times\vec b = \langle a_yb_z - a_zb_y,\ a_zb_x - a_xb_z,\ a_xb_y - a_yb_x\rangle, \qquad |\vec a\times\vec b| = |\vec a|\,|\vec b|\sin\theta$$

Order matters: $\vec b\times\vec a = -\,\vec a\times\vec b$. Parallel vectors give the zero vector. Torque $\vec\tau = \vec r\times\vec F$ and angular momentum $\vec L = \vec r\times m\vec v$ are cross products.`,
  symbols: [
    { tex: '\\vec a\\times\\vec b', text: 'the cross product: a **vector**, perpendicular to both $\\vec a$ and $\\vec b$; its units are the product of theirs (m × N = N·m for torque)' },
    { tex: 'a_yb_z - a_zb_y', text: t`the $x$-component: cover the $x$-column and cross-multiply what is left. The middle component, $a_zb_x - a_xb_z$, is where sign slips happen` },
    { tex: '\\theta', text: t`the angle between $\vec a$ and $\vec b$, $0 \le \theta \le 180^\circ$` },
    { tex: '|\\vec a\\times\\vec b|', text: 'the area of the parallelogram with sides $\\vec a$ and $\\vec b$ — zero when they are parallel, largest when perpendicular' },
  ],
  why: t`Torque on a control surface, the angular momentum that fixes an orbit’s plane, the magnetic force $q\vec v\times\vec B$ and the normal vector to a plane are all cross products.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Perpendicular, with the parallelogram’s area as its length',
    lead: t`$\vec a$ (blue) lies along the $x$-axis with length 2. Set the length of $\vec b$ (amber), its angle from $\vec a$ around the floor, and a tilt out of the floor. The green arrow is $\vec a\times\vec b$; the gold parallelogram is the area it measures. Drag the picture to turn it.`,
    tasks: [
      'Sweep the angle from 0° to 180°: the green arrow grows from nothing to its longest at 90°, then shrinks back — |a × b| = |a||b| sin θ.',
      'Take the angle past 180°: the green arrow flips to point down. Curl the fingers of your right hand from a toward b to see why.',
      'Switch on b × a: it is the same length, pointing exactly the other way.',
    ],
    params: {
      range: 4.5,
      sliders: [
        { key: 'B', label: 'Length of $\\vec b$', min: 0.5, max: 2.25, step: 0.25, value: 2, explain: 'The second side of the parallelogram.' },
        { key: 'th', label: 'Angle of $\\vec b$ from $\\vec a$, around the floor', min: 0, max: 360, step: 5, value: 60, unit: '^\\circ', explain: 'Measured counterclockwise seen from above.' },
        { key: 'ph', label: 'Tilt of $\\vec b$ out of the floor', min: -60, max: 60, step: 5, value: 0, unit: '^\\circ', explain: 'Lifts $\\vec b$ out of the $xy$-plane; the cross product tilts to stay perpendicular.' },
      ],
      toggles: [{ key: 'ba', label: 'Show $\\vec b\\times\\vec a$', value: false, explain: 'The same length, the opposite direction.' }],
      parallelograms: [{ u: [2, 0, 0], v: [BX, BY, BZ], color: 'gold', alpha: 0.28 }],
      vectors: [
        { to: [2, 0, 0], color: 'accent', label: t`\vec a` },
        { to: [BX, BY, BZ], color: 'warn', label: t`\vec b` },
        { to: [0, `-2*${BZ}`, `2*${BY}`], color: 'good', label: t`\vec a\times\vec b` },
        { to: [0, `2*${BZ}`, `-2*${BY}`], color: 'violet', dash: true, label: t`\vec b\times\vec a`, when: 'ba' },
      ],
      readouts: [
        { label: '$\\vec a\\times\\vec b$', vec: [0, `-2*${BZ}`, `2*${BY}`] },
        { label: '$|\\vec a\\times\\vec b|$', expr: `sqrt((2*${BZ})^2 + (2*${BY})^2)`, digits: 3 },
        { label: '$|\\vec a||\\vec b|\\sin\\theta$', expr: `2*B*sin(acos(cos(th*${D})*cos(ph*${D})))`, digits: 3 },
      ],
    },
    caption: 'Drag to rotate; scroll or pinch to zoom. To scale: the length of the green arrow, in axis units, equals the gold area in square units.',
  },
  example: {
    prompt: t`An elevator hinges about the $y$-axis. Air pushes up on it with $\vec F = \langle 0, 0, 800\rangle$ N at the point $\vec r = \langle 0.30, 1.2, 0\rangle$ m from the origin on the hinge line ($x$ points aft, $y$ along the span, $z$ up). Find the torque $\vec\tau = \vec r\times\vec F$, and the hinge moment the actuator must hold.`,
    visual: {
      type: 'calc-vectors3d',
      params: {
        range: 1.6,
        lines: [{ point: [0, 0, 0], dir: [0, 1, 0], t: [-0.3, 1.6], color: 'ink3', dash: true, label: t`\text{hinge}` }],
        parallelograms: [{ at: [0, 0, 0], u: [0, 1.4, 0], v: [0.5, 0, 0], color: 'violet', alpha: 0.18 }],
        vectors: [
          { to: [0.3, 1.2, 0], color: 'accent', label: t`\vec r` },
          { from: [0.3, 1.2, 0], to: [0.3, 1.2, 0.8], color: 'warn', label: t`\vec F` },
          { to: [0.96, -0.24, 0], color: 'good', label: t`\vec\tau` },
        ],
      },
      caption: 'Drag to rotate. r in metres; F and τ scaled down 1000 times to fit. The violet panel stands in for the elevator, aft of its hinge.',
    },
    steps: [
      { label: 'Write the vectors', text: t`$\vec r = \langle 0.30, 1.2, 0\rangle$ m and $\vec F = \langle 0, 0, 800\rangle$ N.` },
      { label: 'Cross product, one component at a time', text: t`- $\tau_x = r_yF_z - r_zF_y = (1.2)(800) - 0 = 960$
- $\tau_y = r_zF_x - r_xF_z = 0 - (0.30)(800) = -240$
- $\tau_z = r_xF_y - r_yF_x = 0 - 0 = 0$

so $\vec\tau = \langle 960, -240, 0\rangle$ N·m.` },
      { label: 'Check it is perpendicular', text: t`$\vec\tau\cdot\vec r = (960)(0.30) + (-240)(1.2) + 0 = 0$ and $\vec\tau\cdot\vec F = 0$. ✓` },
      { label: 'Hinge moment', text: t`Only the component of $\vec\tau$ along the hinge axis turns the elevator: $\vec\tau\cdot\hat\jmath = -240$ N·m. The actuator must hold $240$ N·m. The $960$ N·m about the $x$-axis bends the elevator against its hinge brackets instead.` },
      { label: 'Sense check', text: t`Lever arm times force: the force acts $0.30$ m aft of the hinge, and $0.30 \times 800 = 240$ N·m. The $1.2$ m distance along the span cannot turn the elevator about its own hinge. By the right-hand rule, $-\hat\jmath$ means the trailing edge is pushed up.` },
    ],
    answer: t`$\vec\tau = \langle 960, -240, 0\rangle$ N·m, $|\vec\tau| = 990$ N·m; the hinge moment is $240$ N·m.`,
  },
  practice: [
    mcq({
      id: 'unit-vectors', difficulty: 1,
      prompt: t`What is $\hat\jmath\times\hat k$?`,
      choices: [t`$\hat\imath$`, t`$-\hat\imath$`, t`$0$`, t`$1$`],
      answer: 0,
      why: {
        1: t`That is $\hat k\times\hat\jmath$. Going around the cycle $\hat\imath \to \hat\jmath \to \hat k \to \hat\imath$ in order gives $+$.`,
        2: t`That is the **dot** product $\hat\jmath\cdot\hat k$. The cross product of perpendicular unit vectors is a unit vector.`,
        3: 'The cross product is a vector, not a number. Its length is 1 here, but it has a direction.',
      },
      hints: [t`$\hat\imath\times\hat\jmath = \hat k$, and the pattern cycles: $\hat\jmath\times\hat k$, $\hat k\times\hat\imath$.`],
      teach: t`Cyclic order gives $+$: $\hat\imath\times\hat\jmath = \hat k$, $\hat\jmath\times\hat k = \hat\imath$, $\hat k\times\hat\imath = \hat\jmath$; reversing the order flips the sign.`,
      visual: scene({ range: 1.6, vectors: [{ to: [1, 0, 0], color: 'accent', label: t`\hat\imath` }, { to: [0, 1, 0], color: 'warn', label: t`\hat\jmath` }, { to: [0, 0, 1], color: 'good', label: t`\hat k` }] }, 'Drag to rotate. Curl the fingers of your right hand from ĵ toward k̂ and see where your thumb points.'),
      explain: t`$\hat\jmath\times\hat k = \hat\imath$ — the same cycle as $\hat\imath\times\hat\jmath = \hat k$. With the formula: $\langle 0,1,0\rangle\times\langle 0,0,1\rangle = \langle 1\cdot1 - 0,\ 0 - 0,\ 0 - 0\rangle = \langle 1, 0, 0\rangle$.`,
    }),
    mcq({
      id: 'compute-cross', difficulty: 2,
      gen(r) {
        let a, b, c, choices;
        do {
          a = rand3(r, -3, 4); b = rand3(r, -3, 4); c = cross(a, b);
          const slip = [c[0], -c[1], c[2]], prod = [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
          choices = [c, slip, scale(c, -1), prod].map((v) => t`$${vecTeX(v)}$`);
        } while (c.some((x) => x === 0) || new Set(choices).size < 4);
        return {
          prompt: t`Compute $\vec a\times\vec b$ for $\vec a = ${vecTeX(a)}$ and $\vec b = ${vecTeX(b)}$.`,
          choices, answer: 0,
          why: {
            1: t`The middle component is $a_zb_x - a_xb_z$ — in the determinant it carries a minus sign, and that is where this slip happened.`,
            2: t`That is $\vec b\times\vec a$: the order is reversed, which flips every sign.`,
            3: 'Multiplying matching components is neither product: the dot product would add them to a number, and the cross product mixes different components.',
          },
          hints: [t`$\vec a\times\vec b = \langle a_yb_z - a_zb_y,\ a_zb_x - a_xb_z,\ a_xb_y - a_yb_x\rangle$.`, t`The $x$-component is $(${a[1]})(${b[2]}) - (${a[2]})(${b[1]}) = ${c[0]}$.`],
          teach: 'Each component of a × b uses the other two coordinates; check your answer is perpendicular to a and b.',
          visual: scene({ range: fit(a, b), parallelograms: [{ u: a, v: b, color: 'gold', alpha: 0.25 }], vectors: [{ to: a, color: 'accent', label: t`\vec a` }, { to: b, color: 'warn', label: t`\vec b` }] }, 'Drag to rotate. The cross product will stand perpendicular to this gold parallelogram.'),
          explain: t`$\vec a\times\vec b = \langle (${a[1]})(${b[2]}) - (${a[2]})(${b[1]}),\ (${a[2]})(${b[0]}) - (${a[0]})(${b[2]}),\ (${a[0]})(${b[1]}) - (${a[1]})(${b[0]})\rangle = ${vecTeX(c)}$. Check: $${vecTeX(c)}\cdot\vec a = ${dot(c, a)}$ and $${vecTeX(c)}\cdot\vec b = ${dot(c, b)}$.`,
        };
      },
    }),
    num({
      id: 'parallelogram-area', difficulty: 2,
      gen(r) {
        let a, b, c;
        do { a = rand3(r, -3, 4); b = rand3(r, -3, 4); c = cross(a, b); } while (norm(c) < 2);
        const A = norm(c);
        return {
          prompt: t`Find the area of the parallelogram with sides $\vec a = ${vecTeX(a)}$ and $\vec b = ${vecTeX(b)}$, to 3 significant figures.`,
          answer: A, tol: { rel: 2e-3 },
          errors: [{ value: norm(a) * norm(b), feedback: t`$|\vec a||\vec b|$ is the area only for perpendicular sides. Use $|\vec a\times\vec b| = |\vec a||\vec b|\sin\theta$.` }, { value: Math.abs(dot(a, b)), feedback: 'The dot product measures alignment, not area: use the length of the cross product.' }].filter((e) => Math.abs(e.value - A) > 0.01 * A),
          hints: [t`Area $= |\vec a\times\vec b|$.`, t`$\vec a\times\vec b = ${vecTeX(c)}$.`],
          teach: 'The length of the cross product is the area of the parallelogram the two vectors span.',
          explain: t`$\vec a\times\vec b = ${vecTeX(c)}$, so the area is $\sqrt{${c[0] ** 2} + ${c[1] ** 2} + ${c[2] ** 2}} = ${nice(A, 4)}$.`,
          visual: { type: 'calc-vectors3d', params: { range: Math.max(4, Math.ceil(Math.max(...a.map(Math.abs), ...b.map(Math.abs))) + 1), parallelograms: [{ u: a, v: b, color: 'gold', alpha: 0.3 }], vectors: [{ to: a, color: 'accent', label: t`\vec a` }, { to: b, color: 'warn', label: t`\vec b` }] }, caption: 'Drag to rotate: the gold parallelogram is the area you are finding.' },
        };
      },
    }),
    num({
      id: 'triangle-area', difficulty: 2,
      gen(r) {
        let P, Q, R, c;
        do { P = rand3(r, -3, 3); Q = rand3(r, -3, 3); R = rand3(r, -3, 3); c = cross(sub(Q, P), sub(R, P)); } while (norm(c) < 3);
        const A = norm(c) / 2;
        return {
          prompt: t`Find the area of the triangle with vertices $P${pointTeX(P)}$, $Q${pointTeX(Q)}$ and $R${pointTeX(R)}$, to 3 significant figures.`,
          answer: A, tol: { rel: 2e-3 },
          errors: [{ value: 2 * A, feedback: 'That is the parallelogram. A triangle is half of it.' }],
          hints: [t`Use two sides from the same vertex: $\overrightarrow{PQ} = ${vecTeX(sub(Q, P))}$ and $\overrightarrow{PR} = ${vecTeX(sub(R, P))}$.`, t`Area $= \tfrac12|\overrightarrow{PQ}\times\overrightarrow{PR}|$, and $\overrightarrow{PQ}\times\overrightarrow{PR} = ${vecTeX(c)}$.`],
          teach: 'A triangle is half the parallelogram on two of its sides: area = ½|PQ × PR|.',
          explain: t`$\overrightarrow{PQ}\times\overrightarrow{PR} = ${vecTeX(c)}$, of length $${nice(norm(c), 4)}$; half of that is $${nice(A, 4)}$.`,
          visual: { type: 'calc-vectors3d', params: { range: 4, triangles: [{ pts: [P, Q, R], color: 'gold' }], points: [{ at: P, label: 'P' }, { at: Q, label: 'Q' }, { at: R, label: 'R' }] }, caption: 'Drag to rotate.' },
        };
      },
    }),
    num({
      id: 'wrench', difficulty: 2,
      gen(r) {
        const L = r.pick([0.2, 0.25, 0.3, 0.4]), F = r.pick([50, 80, 120]), th = r.pick([30, 60, 70, 80]);   // not 45°, where sin = cos
        const tau = L * F * Math.sin((th * Math.PI) / 180);
        return {
          prompt: t`A technician pulls with $${F}$ N on the end of a $${L}$ m torque wrench, at $${th}^\circ$ to the handle. What is the magnitude of the torque on the bolt?`,
          answer: tau, units: 'N m', tol: { rel: 2e-3 },
          errors: [{ value: L * F * Math.cos((th * Math.PI) / 180), feedback: t`Torque uses the sine of the angle between $\vec r$ and $\vec F$: only the part of the force perpendicular to the handle turns the bolt.` }, { value: L * F, feedback: t`That would need the force at $90^\circ$ to the handle. Multiply by $\sin${th}^\circ$.` }],
          hints: [t`$|\vec\tau| = |\vec r||\vec F|\sin\theta$.`],
          teach: 'Only the force component perpendicular to the lever arm produces torque.',
          visual: arrows2D([{ to: [3, 0], color: 'ink3', label: 'r' }, { from: [3, 0], to: [3 + 2 * Math.cos((th * Math.PI) / 180), 2 * Math.sin((th * Math.PI) / 180)], color: 'warn', label: 'F' }], { caption: t`The handle $\vec r$ (grey) and the pull $\vec F$ (amber) at $${th}^\circ$ to it. Directions are true; lengths are not to scale.` }),
          explain: t`$|\vec\tau| = (${L})(${F})\sin${th}^\circ = ${nice(tau, 4)}$ N·m.`,
        };
      },
    }),
    mcq({
      id: 'order-slip', difficulty: 3, kind: 'error',
      prompt: t`A student computes $\langle 1, 2, 0\rangle\times\langle 3, 1, 0\rangle = \langle 0, 0, 5\rangle$. What went wrong?`,
      choices: [
        t`The $z$-component is $a_xb_y - a_yb_x = (1)(1) - (2)(3) = -5$; they subtracted in the wrong order`,
        t`The cross product of two vectors in the $xy$-plane is zero`,
        t`The answer should be a number, $5$, not a vector`,
        t`Nothing: the answer is right`,
      ],
      answer: 0,
      why: {
        1: t`Two vectors in the $xy$-plane have a cross product along $z$, perpendicular to that plane — zero only if they are parallel.`,
        2: 'The cross product is a vector; its length is the area, 5, but it also has a direction.',
        3: t`Use the right-hand rule: from $\langle 1, 2, 0\rangle$ (steep) curl toward $\langle 3, 1, 0\rangle$ (shallow) — that is clockwise seen from above, so the thumb points down, along $-\hat k$.`,
      },
      hints: [t`The $z$-component of $\vec a\times\vec b$ is $a_xb_y - a_yb_x$.`, 'Check the direction with your right hand: is a → b clockwise or counterclockwise seen from above?'],
      teach: 'The cross product is anticommutative, so the order of subtraction inside each component decides the sign.',
      visual: scene({ range: 5.5, parallelograms: [{ u: [1, 2, 0], v: [3, 1, 0], color: 'gold', alpha: 0.25 }], vectors: [{ to: [1, 2, 0], color: 'accent', label: t`\vec a` }, { to: [3, 1, 0], color: 'warn', label: t`\vec b` }, { to: [0, 0, -5], color: 'good', label: t`\vec a\times\vec b` }] }, 'Drag to rotate. The correct cross product, to scale: length 5 (the gold area), pointing down.'),
      explain: t`$z$-component: $(1)(1) - (2)(3) = -5$, so the answer is $\langle 0, 0, -5\rangle$. Its length, 5, is the area of the parallelogram; its direction, down, comes from the right-hand rule.`,
    }),
    mcq({
      id: 'anticommute', difficulty: 2,
      prompt: t`If $\vec a\times\vec b = \langle 2, -1, 3\rangle$, what is $\vec b\times\vec a$?`,
      choices: [t`$\langle -2, 1, -3\rangle$`, t`$\langle 2, -1, 3\rangle$`, t`$\langle 3, -1, 2\rangle$`, t`$\langle 0, 0, 0\rangle$`],
      answer: 0,
      why: {
        1: 'That would make the cross product commutative, which it is not.',
        2: 'Reversing the order does not reverse the components; it flips their signs.',
        3: 'b × a is zero only if a and b are parallel — and then a × b would be zero too.',
      },
      hints: ['Use your right hand: curl from b toward a instead of from a toward b.'],
      teach: t`$\vec b\times\vec a = -\,\vec a\times\vec b$: same length, opposite direction.`,
      visual: scene({ range: 3.5, vectors: [{ to: [2, -1, 3], color: 'good', label: t`\vec a\times\vec b` }] }, 'Drag to rotate. a × b, as given.'),
      explain: t`Swapping the order flips the right-hand rule, so $\vec b\times\vec a = -\langle 2, -1, 3\rangle = \langle -2, 1, -3\rangle$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-triangle', difficulty: 2,
      gen(r) {
        let P, Q, R, c;
        do { P = rand3(r, -4, 4); Q = rand3(r, -4, 4); R = rand3(r, -4, 4); c = cross(sub(Q, P), sub(R, P)); } while (norm(c) < 3);
        const A = norm(c) / 2;
        return {
          prompt: t`Find the area of the triangle $A${pointTeX(P)}$, $B${pointTeX(Q)}$, $C${pointTeX(R)}$, to 3 significant figures.`,
          answer: A, tol: { rel: 2e-3 },
          errors: [{ value: 2 * A, feedback: 'Halve it: a triangle is half the parallelogram.' }],
          hints: [t`Area $= \tfrac12|\overrightarrow{AB}\times\overrightarrow{AC}|$.`],
          teach: 'Triangle area = ½|AB × AC|.',
          visual: scene({ range: fit(P, Q, R), triangles: [{ pts: [P, Q, R], color: 'gold' }], points: [{ at: P, label: 'A' }, { at: Q, label: 'B' }, { at: R, label: 'C' }] }),
          explain: t`$\overrightarrow{AB}\times\overrightarrow{AC} = ${vecTeX(c)}$; area $= \tfrac12(${nice(norm(c), 4)}) = ${nice(A, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-torque-z', difficulty: 3,
      gen(r) {
        let rv, F, tz;
        do { rv = [r.intExcept(-3, 3, [0]) / 10, r.intExcept(-3, 3, [0]) / 10, r.int(-3, 3) / 10]; F = [r.intExcept(-9, 9, [0]) * 10, r.intExcept(-9, 9, [0]) * 10, r.int(-9, 9) * 10]; tz = rv[0] * F[1] - rv[1] * F[0]; } while (Math.abs(tz) < 2);
        return {
          prompt: t`A force $\vec F = ${vecTeX(F)}$ N acts at $\vec r = ${vecTeX(rv)}$ m from a shaft that runs along the $z$-axis. What is the torque about the shaft — the $z$-component of $\vec r\times\vec F$?`,
          answer: tz, units: 'N m', tol: { rel: 2e-3 },
          errors: [{ value: -tz, feedback: t`Check the order: $\tau_z = r_xF_y - r_yF_x$.` }],
          hints: [t`$\tau_z = r_xF_y - r_yF_x$.`, t`$(${rv[0]})(${F[1]}) - (${rv[1]})(${F[0]})$.`],
          teach: 'The torque about an axis is the component of r × F along that axis.',
          visual: scene({ range: 2.5, lines: [{ point: [0, 0, 0], dir: [0, 0, 1], t: [-2, 2], color: 'ink2', dash: true, label: t`\text{shaft}` }], vectors: [{ to: scale(rv, 5), color: 'accent', label: t`\vec r` }, { from: scale(rv, 5), to: add(scale(rv, 5), scale(F, 1.5 / norm(F))), color: 'warn', label: t`\vec F` }] }, 'Drag to rotate. r is drawn five times longer and F at length 1.5, so only directions are to scale.'),
          explain: t`$\tau_z = (${rv[0]})(${F[1]}) - (${rv[1]})(${F[0]}) = ${nice(tz, 4)}$ N·m. Neither $r_z$ nor $F_z$ can turn the shaft.`,
        };
      },
    }),
    num({
      id: 'cp-inclination', difficulty: 3, transfer: true,
      gen(r) {
        const [inc, r0, u] = r.pick([[51.6, 6778, 30], [28.5, 7000, 120], [98, 7078, 200], [63.4, 7200, 60], [45, 6900, 300]]);
        const Dg = Math.PI / 180, v0 = Math.sqrt(398600.4418 / r0);
        const R = [r0 * Math.cos(u * Dg), r0 * Math.sin(u * Dg), 0].map((x) => +x.toFixed(1));
        const V = [-v0 * Math.sin(u * Dg) * Math.cos(inc * Dg), v0 * Math.cos(u * Dg) * Math.cos(inc * Dg), v0 * Math.sin(inc * Dg)].map((x) => +x.toFixed(3));
        const h = cross(R, V), i = deg(Math.acos(h[2] / norm(h)));
        return {
          prompt: t`A satellite crosses the equator with position $\vec r = ${vecTeX(R)}$ km and velocity $\vec v = ${vecTeX(V)}$ km/s in an Earth-centred frame ($\hat k$ along Earth’s axis). Its orbit lies in the plane of $\vec r$ and $\vec v$, so it is perpendicular to $\vec h = \vec r\times\vec v$. The **inclination** is the angle between $\vec h$ and $\hat k$. Find it, in degrees.`,
          answer: i, units: '°', tol: { rel: 2e-3, abs: 0.1 },
          errors: [{ value: 90, feedback: t`That is the angle between $\vec r$ and $\vec v$. The inclination is the angle between $\vec h = \vec r\times\vec v$ and $\hat k$.` }, { value: 180 - i, feedback: t`Use $\vec r\times\vec v$ in that order: $\vec v\times\vec r$ points the opposite way.` }],
          hints: [t`Compute $\vec h = \vec r\times\vec v$, then $\cos i = \frac{h_z}{|\vec h|}$.`, t`$\vec h = \langle ${h.map((x) => nice(x, 5)).join(',\\ ')}\rangle$ km²/s.`],
          teach: 'An orbit’s plane is fixed by its angular momentum h = r × v; the inclination is the angle between h and Earth’s axis.',
          visual: (() => {
            const ru = scale(R, 1 / norm(R)), vu = scale(V, 1 / norm(V)), s = 2.3;
            return scene({ range: 3, grid: false, planes: [{ normal: [0, 0, 1], d: 0, size: 2.6, color: 'accent', alpha: 0.12 }], curves: [{ param: [0, 1, 2].map((k) => `${s * ru[k]}*cos(t) + ${s * vu[k]}*sin(t)`), t: [0, 2 * Math.PI], color: 'violet', width: 1.8 }], vectors: [{ to: scale(ru, s), color: 'accent', label: t`\vec r` }, { from: scale(ru, s), to: add(scale(ru, s), scale(vu, 1.4)), color: 'warn', label: t`\vec v` }] }, 'Drag to rotate. The orbit (violet) through the satellite’s position, crossing the equatorial plane (blue). Distances not to scale.');
          })(),
          explain: t`$\vec h = \vec r\times\vec v = \langle ${h.map((x) => nice(x, 5)).join(',\\ ')}\rangle$ km²/s, $|\vec h| = ${nice(norm(h), 5)}$, so $\cos i = ${nice(h[2] / norm(h), 4)}$ and $i = ${nice(i, 4)}^\circ$${inc > 90 ? ' — over 90°: a retrograde orbit, typical of sun-synchronous satellites' : ''}.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §2.4 The Cross Product', url: 'https://openstax.org/books/calculus-volume-3/pages/2-4-the-cross-product' },
  ],
});
