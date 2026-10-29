// Vectors in three dimensions — a third axis by the right-hand rule, and
// everything from the plane with one more component: lengths, distances,
// spheres. Spacecraft positions are the running example.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { QUADS, signed, vecTeX, arrows3D, add, sub, scale, norm } from './_vectors.js';

const t = String.raw;
const R_EARTH = 6371;   // km, mean radius
const fitRange = (pts) => Math.max(2, Math.ceil(Math.max(...pts.flat().map(Math.abs))) + 0.5);
const pointTeX = (p) => `(${p.join(', ')})`;
const shift = (v, name) => (v === 0 ? `${name}^2` : v > 0 ? `(${name} - ${v})^2` : `(${name} + ${-v})^2`);

export default lesson({
  id: 'math1220.C2-7.2',
  title: 'Vectors in three dimensions',
  minutes: 9, difficulty: 2,
  intro: t`Add a third axis, $z$, perpendicular to both $x$ and $y$ and oriented by the **right-hand rule**: curl the fingers of your right hand from $x$ toward $y$, and your thumb points along $z$. A point is $(x, y, z)$, a vector is $\langle v_x, v_y, v_z\rangle = v_x\hat\imath + v_y\hat\jmath + v_z\hat k$, and everything from the plane carries over with one more term:

$$|\vec v| = \sqrt{v_x^2 + v_y^2 + v_z^2}, \qquad \overrightarrow{PQ} = \langle x_2 - x_1,\ y_2 - y_1,\ z_2 - z_1\rangle$$

The distance between two points is the length of the vector joining them. One surprise: an equation such as $z = 0$ now describes a whole **plane**, not a line.`,
  symbols: [
    { tex: '(x, y, z)', text: 'the coordinates of a point: distances along three mutually perpendicular axes' },
    { tex: '\\hat k', text: t`the unit vector $\langle 0, 0, 1\rangle$ along $z$, joining $\hat\imath$ and $\hat\jmath$` },
    { tex: '|\\vec v|', text: 'the magnitude — Pythagoras twice: across the floor, then up' },
    { tex: '\\overrightarrow{PQ}', text: t`the vector from point $P(x_1, y_1, z_1)$ to point $Q(x_2, y_2, z_2)$: end minus start` },
  ],
  why: t`Spacecraft positions, thrust directions, magnetic fields and, later, the four-vectors of relativity all have more than two components. The rules do not change — only the number of terms.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'A vector and its three components',
    lead: t`Set the components with the sliders and drag the picture to turn it. The dashed path walks along $x$, then $y$, then $z$; the grey dashed line is the vector’s shadow on the floor (the $xy$-plane), whose length is $\sqrt{v_x^2 + v_y^2}$.`,
    tasks: [
      'Set v = ⟨2, 3, 6⟩: |v| = 7, by Pythagoras twice — √(2² + 3²) across the floor, then the height 6.',
      'Turn the picture: from some angles a long vector looks short. Only the components tell the truth.',
      t`Make $v_z$ negative: the arrow dips below the floor.`,
    ],
    params: {
      range: 6.5,
      sliders: [
        { key: 'vx', label: '$v_x$', min: -6, max: 6, step: 0.5, value: 2, explain: 'Reach along $x$.' },
        { key: 'vy', label: '$v_y$', min: -6, max: 6, step: 0.5, value: 3, explain: 'Reach along $y$.' },
        { key: 'vz', label: '$v_z$', min: -6, max: 6, step: 0.5, value: 6, explain: 'Height along $z$.' },
      ],
      components: [{ to: ['vx', 'vy', 'vz'], color: 'accent' }],
      segments: [{ from: [0, 0, 0], to: ['vx', 'vy', 0], color: 'ink3', dash: true }],
      vectors: [{ to: ['vx', 'vy', 'vz'], color: 'accent', label: t`\vec v` }],
      readouts: [
        { label: 'shadow $\\sqrt{v_x^2 + v_y^2}$', expr: 'sqrt(vx^2 + vy^2)', digits: 3 },
        { label: '$|\\vec v|$', expr: 'sqrt(vx^2 + vy^2 + vz^2)', digits: 3 },
      ],
    },
    caption: 'Drag to rotate; scroll or pinch to zoom. Right-handed axes, to scale; the grid lies in the xy-plane.',
  },
  example: {
    prompt: t`In an Earth-centred frame, a satellite is at $\vec r = \langle 4000, -3000, 5000\rangle$ km. How high is it above the surface, taking Earth as a sphere of radius $6371$ km?`,
    visual: arrows3D([{ to: [4, -3, 5], label: t`\vec r` }], { range: 5.5, extra: { components: [{ to: [4, -3, 5], color: 'accent' }] }, caption: 'Drag to rotate. The origin is Earth’s centre; axes in thousands of km.' }),
    steps: [
      { label: 'Distance from the centre', text: t`The satellite’s distance from Earth’s centre is the magnitude of its position vector: $|\vec r| = \sqrt{4000^2 + (-3000)^2 + 5000^2}$ km.` },
      { label: 'Compute', text: t`$= \sqrt{(16 + 9 + 25)\times10^6} = \sqrt{50}\times10^3 = 7071$ km. The minus sign disappears when squared.` },
      { label: 'Subtract the radius', text: t`Altitude $= |\vec r| - R_\oplus = 7071 - 6371 = 700$ km.` },
      { label: 'Sense check', text: t`$700$ km is a typical altitude for Earth-observation satellites, well above the International Space Station’s $\sim 420$ km. No component alone (at most 5000 km) is even larger than Earth’s radius — the altitude only appears once all three are combined.` },
    ],
    answer: t`$|\vec r| = 7071$ km, so the satellite is about $700$ km above the surface.`,
  },
  practice: [
    num({
      id: 'magnitude-3d', difficulty: 1,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS), v = signed(r, [a, b, c]);
        return {
          prompt: t`Find the magnitude of $\vec v = ${vecTeX(v)}$.`,
          answer: L, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: Math.sqrt(v[0] ** 2 + v[1] ** 2), feedback: 'You left out the z-component: in 3D there are three squares under the root.' }, { value: L * L, feedback: t`That is $|\vec v|^2$; take the square root.` }],
          hints: [t`$|\vec v| = \sqrt{v_x^2 + v_y^2 + v_z^2}$.`],
          teach: 'In three dimensions the magnitude has three squares under the root.',
          explain: t`$\sqrt{${v[0] ** 2} + ${v[1] ** 2} + ${v[2] ** 2}} = \sqrt{${L * L}} = ${L}$.`,
          visual: arrows3D([{ to: v, label: t`\vec v` }], { extra: { components: [{ to: v, color: 'accent' }] } }),
        };
      },
    }),
    num({
      id: 'distance', difficulty: 2,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS), d = signed(r, [a, b, c]);
        const P = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], Q = add(P, d);
        const errors = [{ value: norm(add(P, Q)), feedback: 'The vector between the points is Q − P: subtract the coordinates.' }, { value: Math.abs(norm(Q) - norm(P)), feedback: 'The distance between points is not the difference of their distances from the origin. Subtract coordinates, then take the length.' }].filter((e) => Math.abs(e.value - L) > 0.05);
        return {
          prompt: t`Find the distance between $P${pointTeX(P)}$ and $Q${pointTeX(Q)}$.`,
          answer: L, tol: { rel: 1e-4 },
          errors,
          hints: [t`$\overrightarrow{PQ} = Q - P = ${vecTeX(d)}$.`, 'The distance is the magnitude of that vector.'],
          teach: 'The distance between two points is the length of the vector from one to the other.',
          explain: t`$\overrightarrow{PQ} = ${vecTeX(d)}$, so $|PQ| = \sqrt{${d[0] ** 2} + ${d[1] ** 2} + ${d[2] ** 2}} = ${L}$.`,
          visual: { type: 'calc-vectors3d', params: { range: fitRange([P, Q]), points: [{ at: P, label: 'P', color: 'gold' }, { at: Q, label: 'Q', color: 'gold' }], vectors: [{ from: P, to: Q, color: 'accent', label: t`\overrightarrow{PQ}` }] }, caption: 'Drag to rotate.' },
        };
      },
    }),
    mcq({
      id: 'p-to-q', difficulty: 2,
      gen(r) {
        let P, Q, d;
        do { P = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)]; Q = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)]; d = sub(Q, P); } while (d.some((x) => x === 0) || P.some((x) => x === 0) || Q.every((x) => x === 0));   // keeps the four choices distinct
        const slip = [d[0], d[1], Q[2] + P[2]];
        return {
          prompt: t`What is the vector $\overrightarrow{PQ}$ from $P${pointTeX(P)}$ to $Q${pointTeX(Q)}$?`,
          choices: [t`$${vecTeX(d)}$`, t`$${vecTeX(scale(d, -1))}$`, t`$${vecTeX(add(P, Q))}$`, t`$${vecTeX(slip)}$`],
          answer: 0,
          why: {
            1: t`That is $\overrightarrow{QP}$, from $Q$ back to $P$: start minus end instead of end minus start.`,
            2: 'Adding the coordinates gives no geometric vector between the points; subtract them.',
            3: t`The $z$-component was added instead of subtracted: $${Q[2]} - (${P[2]}) = ${d[2]}$.`,
          },
          hints: ['A vector from P to Q is “end minus start”.'],
          teach: t`$\overrightarrow{PQ} = Q - P$: end minus start, component by component.`,
          visual: { type: 'calc-vectors3d', params: { range: fitRange([P, Q]), points: [{ at: P, label: 'P' }, { at: Q, label: 'Q' }], vectors: [{ from: P, to: Q, color: 'accent' }] }, caption: 'Drag to rotate. The arrow runs from P to Q.' },
          explain: t`$\overrightarrow{PQ} = \langle ${Q[0]} - (${P[0]}),\ ${Q[1]} - (${P[1]}),\ ${Q[2]} - (${P[2]})\rangle = ${vecTeX(d)}$.`,
        };
      },
    }),
    mcq({
      id: 'y-equals-2', difficulty: 2,
      prompt: t`In three dimensions, what does the equation $y = 2$ describe?`,
      choices: [t`A plane parallel to the $xz$-plane`, t`A line parallel to the $x$-axis`, t`A plane parallel to the $xy$-plane`, t`The single point $(0, 2, 0)$`],
      answer: 0,
      why: {
        1: 'That is the picture in the plane. In space, x and z are free to take any values, which sweeps out a whole plane.',
        2: t`The $xy$-plane has $z$ fixed. Here $y$ is fixed, so the plane is parallel to the $xz$-plane.`,
        3: t`Only $y$ is constrained; $x$ and $z$ can be anything.`,
      },
      hints: [t`Which coordinates are left free when $y = 2$?`, t`Every point $(x, 2, z)$ satisfies it, for all $x$ and $z$.`],
      teach: 'One equation in three unknowns leaves two free directions: a surface, not a curve.',
      explain: t`All points $(x, 2, z)$ satisfy $y = 2$: a flat sheet two units along $y$, parallel to the $xz$-plane.`,
      visual: { type: 'calc-vectors3d', params: { range: 3, planes: [{ normal: [0, 1, 0], d: 2, size: 2.5, color: 'violet', alpha: 0.3 }] }, caption: 'Drag to rotate: the set of all points with y = 2.' },
    }),
    num({
      id: 'sphere-radius', difficulty: 3,
      gen(r) {
        const c = [r.intExcept(-4, 4, [0]), r.int(-4, 4), r.intExcept(-4, 4, [0])], R = r.int(2, 7);
        const k = R * R - c[0] ** 2 - c[1] ** 2 - c[2] ** 2;
        const lin = ['x', 'y', 'z'].map((n, i) => (c[i] === 0 ? '' : ` ${c[i] > 0 ? '-' : '+'} ${2 * Math.abs(c[i])}${n}`)).join('');
        const errors = [{ value: R * R, feedback: 'That is r²; take the square root.' }];
        if (k > 0 && Math.abs(Math.sqrt(k) - R) > 0.05) errors.push({ value: Math.sqrt(k), feedback: 'Complete the square in each variable first: the constants it produces move to the right-hand side.' });
        return {
          prompt: t`Find the radius of the sphere $x^2 + y^2 + z^2${lin} = ${k}$.`,
          answer: R, tol: { rel: 1e-4 },
          errors,
          hints: [t`Complete the square in $x$, $y$ and $z$ separately.`, t`For example $x^2 ${c[0] > 0 ? '-' : '+'} ${2 * Math.abs(c[0])}x = ${shift(c[0], 'x')} - ${c[0] ** 2}$.`, t`Collect the constants: $r^2 = ${k} + ${c[0] ** 2} + ${c[1] ** 2} + ${c[2] ** 2}$.`],
          teach: t`Completing the square turns the equation into $(x-a)^2 + (y-b)^2 + (z-c)^2 = r^2$: centre $(a, b, c)$, radius $r$.`,
          visual: { type: 'calc-vectors3d', params: { range: fitRange([c.map((x) => Math.abs(x) + R)]), spheres: [{ centre: c, radius: R, color: 'teal' }], points: [{ at: c, color: 'teal' }] }, caption: 'Drag to rotate: the sphere, drawn as three great circles around its centre.' },
          explain: t`$${shift(c[0], 'x')} + ${shift(c[1], 'y')} + ${shift(c[2], 'z')} = ${k} + ${c[0] ** 2 + c[1] ** 2 + c[2] ** 2} = ${R * R}$: centre $${pointTeX(c)}$, radius $${R}$.`,
        };
      },
    }),
    num({
      id: 'altitude', difficulty: 2,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS), k = Math.round(7000 / L / 10) * 10;
        const v = signed(r, [a, b, c]).map((x) => x * k), dist = L * k;
        return {
          prompt: t`A satellite’s position in an Earth-centred frame is $\vec r = ${vecTeX(v)}$ km. What is its altitude above a spherical Earth of radius $6371$ km?`,
          answer: dist - R_EARTH, units: 'km', tol: { rel: 2e-3 },
          errors: [{ value: dist, feedback: 'That is its distance from Earth’s centre. Subtract Earth’s radius for the altitude.' }],
          hints: [t`$|\vec r| = \sqrt{r_x^2 + r_y^2 + r_z^2}$ is the distance from Earth’s centre.`, t`Altitude $= |\vec r| - 6371$ km.`],
          teach: 'A position vector from a planet’s centre has the distance to that centre as its magnitude.',
          visual: { type: 'calc-vectors3d', params: { range: 8, grid: false, spheres: [{ centre: [0, 0, 0], radius: 6.371, color: 'teal' }], vectors: [{ to: v.map((x) => x / 1000), color: 'warn', label: t`\vec r` }] }, caption: 'Drag to rotate. Earth (teal circles) and the satellite’s position vector; axes in thousands of km.' },
          explain: t`$|\vec r| = ${k}\sqrt{${a * a} + ${b * b} + ${c * c}} = ${k}\times${L} = ${dist}$ km, so the altitude is $${dist} - 6371 = ${dist - R_EARTH}$ km.`,
        };
      },
    }),
    num({
      id: 'thruster-component', difficulty: 3,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS), d = signed(r, [a, b, c]), F = L * r.pick([20, 50, 100]);
        return {
          prompt: t`A thruster pushes with $${F}$ N along the direction $${vecTeX(d)}$ (the vector gives the direction only). What is the $z$-component of the force?`,
          answer: (F * d[2]) / L, units: 'N', tol: { rel: 1e-3 },
          errors: [{ value: F * d[2], feedback: t`First turn the direction into a unit vector: divide by its length, $${L}$.` }, { value: (F * d[2]) / (L * L), feedback: t`Divide by the length $${L}$, not its square.` }],
          hints: [t`The force is $${F}\,\hat d$, where $\hat d$ is the unit vector in the direction $${vecTeX(d)}$: divide it by its length.`, t`$|${vecTeX(d)}| = ${L}$.`],
          teach: 'A force of size F along a direction d is F times the unit vector d/|d|.',
          explain: t`$\hat d = \frac{1}{${L}}${vecTeX(d)}$, so $\vec F = ${F}\hat d = ${vecTeX(scale(d, F / L))}$ N; its $z$-component is $${nice((F * d[2]) / L)}$ N.`,
          visual: arrows3D([{ to: scale(d, 3 / L), color: 'warn', label: t`\vec F` }], { range: 3.5, extra: { components: [{ to: scale(d, 3 / L), color: 'warn' }] }, caption: 'Drag to rotate. The arrow shows the direction of the force, scaled to fit.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-distance', difficulty: 2,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS), d = signed(r, [a, b, c]);
        const P = [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)], Q = add(P, d);
        return {
          prompt: t`How far apart are $A${pointTeX(P)}$ and $B${pointTeX(Q)}$?`,
          answer: L, tol: { rel: 1e-4 },
          hints: [t`Find $\overrightarrow{AB}$, then its length.`],
          teach: 'Distance = |end − start|.',
          visual: { type: 'calc-vectors3d', params: { range: fitRange([P, Q]), points: [{ at: P, label: 'A' }, { at: Q, label: 'B' }], segments: [{ from: P, to: Q, color: 'gold', dash: true }] }, caption: 'Drag to rotate.' },
          explain: t`$\overrightarrow{AB} = ${vecTeX(d)}$ and $|\overrightarrow{AB}| = ${L}$.`,
        };
      },
    }),
    num({
      id: 'cp-sphere', difficulty: 3,
      gen(r) {
        const c = [r.int(-3, 3), r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])], R = r.int(3, 8);
        const k = R * R - c[0] ** 2 - c[1] ** 2 - c[2] ** 2;
        const lin = ['x', 'y', 'z'].map((n, i) => (c[i] === 0 ? '' : ` ${c[i] > 0 ? '-' : '+'} ${2 * Math.abs(c[i])}${n}`)).join('');
        return {
          prompt: t`Find the radius of the sphere $x^2 + y^2 + z^2${lin} = ${k}$.`,
          answer: R, tol: { rel: 1e-4 },
          errors: [{ value: R * R, feedback: 'Take the square root of r².' }],
          hints: ['Complete the square in each variable.', t`$r^2 = ${k} + ${c[0] ** 2} + ${c[1] ** 2} + ${c[2] ** 2}$.`],
          teach: 'Complete the square in x, y and z to read off centre and radius.',
          explain: t`Completing the squares gives $${shift(c[0], 'x')} + ${shift(c[1], 'y')} + ${shift(c[2], 'z')} = ${R * R}$, so $r = ${R}$.`,
        };
      },
    }),
    num({
      id: 'cp-docking', difficulty: 3, transfer: true,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS), s = r.pick([5, 10]), v = signed(r, [a, b, c]).map((x) => x * s);
        const dist = L * s, speed = r.pick([0.05, 0.1]);
        return {
          prompt: t`During a rendezvous, a cargo spacecraft is at $\vec r = ${vecTeX(v)}$ m relative to the space station’s docking port. If it closes straight in at a steady $${speed}$ m/s, how many **minutes** until it docks?`,
          answer: dist / speed / 60, units: 'min', tol: { rel: 5e-3 },
          errors: [{ value: (Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2])) / speed / 60, feedback: 'Adding the component sizes overestimates the distance; the straight-line distance is the magnitude.' }],
          hints: [t`The distance to go is $|\vec r|$.`, t`$|\vec r| = ${s}\sqrt{${a * a} + ${b * b} + ${c * c}} = ${dist}$ m. Time $=$ distance $/$ speed.`],
          teach: 'A straight-line distance in space is the magnitude of the relative position vector.',
          visual: { type: 'calc-vectors3d', params: { range: fitRange([v.map((x) => x / 10)]), points: [{ at: [0, 0, 0], label: t`\text{port}`, color: 'good' }, { at: v.map((x) => x / 10), label: t`\text{craft}`, color: 'warn' }], vectors: [{ from: v.map((x) => x / 10), to: [0, 0, 0], color: 'warn' }] }, caption: 'Drag to rotate. The approach path straight to the docking port; axes in tens of metres.' },
          explain: t`$|\vec r| = ${dist}$ m, so the approach takes $\frac{${dist}}{${speed}} = ${nice(dist / speed)}$ s $= ${nice(dist / speed / 60, 3)}$ min. (Real final approaches are this slow, around 0.1 m/s.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §2.2 Vectors in Three Dimensions', url: 'https://openstax.org/books/calculus-volume-3/pages/2-2-vectors-in-three-dimensions' },
  ],
});
