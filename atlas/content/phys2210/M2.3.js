// Unit vectors: î, ĵ, k̂ as building blocks, and Â = A/|A| as a pure direction.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, frac } from '../../src/core/format.js';
import { vectorPicture, polar, DEG } from './_vectors.js';

const t = String.raw;
const mag3 = (v) => Math.hypot(v[0], v[1], v[2]);

// unit-vector arrows and the î ĵ k̂ path, shared by the 3D pictures
const HATS = [
  { to: [1, 0, 0], color: 'bad', label: '\\hat\\imath', width: 3.4 },
  { to: [0, 1, 0], color: 'good', label: '\\hat\\jmath', width: 3.4 },
  { to: [0, 0, 1], color: 'teal', label: '\\hat k', width: 3.4 },
];
/**
 * A fixed 3D picture of a vector, its î/ĵ/k̂ path and (optionally) its unit vector.
 * A long vector is drawn shrunk to `fit` (its direction is what matters), and the caption says so.
 */
function scene3d(v0, { label = '\\vec A', unit = true, fit = 3.2, caption } = {}) {
  const m = mag3(v0), shrink = m > fit ? fit / m : 1;
  const v = v0.map((c) => +(c * shrink).toFixed(4));
  const R = Math.max(2, Math.ceil(Math.max(...v.map(Math.abs)) + 0.5));
  const p1 = [v[0], 0, 0], p2 = [v[0], v[1], 0];
  return {
    type: 'calc-vectors3d',
    params: {
      range: R, aspect: 'wide',
      vectors: [
        ...HATS,
        { to: p1, color: 'bad', dash: true, width: 2 }, { from: p1, to: p2, color: 'good', dash: true, width: 2 }, { from: p2, to: v, color: 'teal', dash: true, width: 2 },
        { to: v, color: 'accent', label },
        ...(unit ? [{ to: v0.map((c) => +(c / m).toFixed(4)), color: 'gold', label: label.replace('\\vec', '\\hat'), width: 3.4 }] : []),
      ],
    },
    caption: (caption ?? 'Dashed: the path along x, then y, then z that the components describe. Drag to rotate.')
      + (shrink < 1 ? ' The long vector is drawn shrunk to fit; its direction is exact, and the unit vectors are to scale.' : ' Arrows are to scale.'),
  };
}

// The vertical plane through a ground station and a satellite at v: the pointing direction
// r̂ (length 1, to scale), its upward component and the elevation angle.
function dishPlane(v) {
  const h = Math.hypot(v[0], v[1]), m = mag3(v), u = [h / m, v[2] / m];
  const th = Math.atan2(u[1], u[0]), far = [1.4 * u[0], 1.4 * u[1]];
  return vectorPicture({
    arrows: [{ to: u, color: 'gold' }],
    comps: { of: u, labels: ['', 'upward part = ?'] },
    segments: [{ from: u, to: far, color: 'ink3' }],
    arc: { from: 0, to: th / DEG, label: 'elevation', r: 0.22 },
    extent: [far], numbers: false, xlabel: 'horizontal', ylabel: 'up',
    points: [
      { x: +(u[0] / 2 - 0.12 * Math.sin(th)).toFixed(4), y: +(u[1] / 2 + 0.12 * Math.cos(th)).toFixed(4), r: 0.01, color: 'gold', label: 'r̂' },
      { x: +far[0].toFixed(4), y: +far[1].toFixed(4), r: 0.01, color: 'ink3', label: 'toward the satellite' },
    ],
    caption: 'The vertical plane through the dish and the satellite. The dish points along r̂ (gold, length 1); its upward component is the vertical side of the triangle. To scale, without numbers; the satellite itself is far off the picture.',
  });
}

// the worked example: a thrust direction
const EXF = [2, -1, 2];
const EXM = mag3(EXF);

export default lesson({
  id: 'phys2210.M2.3',
  title: 'Unit vectors',
  minutes: 9, difficulty: 2,
  intro: t`A **unit vector** has length exactly 1 and no units: it carries a direction and nothing else. The three that point along the axes, $\hat\imath$, $\hat\jmath$ and $\hat k$, let you write any vector as a sum of steps along $x$, $y$ and $z$:

$$\vec A = A_x\,\hat\imath + A_y\,\hat\jmath + A_z\,\hat k, \qquad |\vec A| = \sqrt{A_x^2 + A_y^2 + A_z^2}, \qquad \hat A = \frac{\vec A}{|\vec A|}$$

Read $A_x\hat\imath$ as “$A_x$ units along $x$”. Dividing any vector by its own length leaves a unit vector pointing the same way — a pure direction you can multiply by any size you like.`,
  symbols: [
    { tex: '\\hat\\imath,\\ \\hat\\jmath,\\ \\hat k', text: 'the unit vectors along $+x$, $+y$ and $+z$: length 1, no units, at right angles to each other' },
    { tex: 'A_x,\\ A_y,\\ A_z', text: 'the components of $\\vec A$, carrying its units (m, N, m/s…): how far to go along each axis' },
    { tex: '|\\vec A|', text: 'the magnitude: Pythagoras in three dimensions' },
    { tex: '\\hat A', text: 'the unit vector along $\\vec A$ (“A-hat”): $\\vec A$ divided by its own length, so $\\vec A = |\\vec A|\\,\\hat A$ — size times direction' },
  ],
  why: 'Thrust directions, antenna pointing, surface normals for heat shields and solar panels, and the radial direction of gravity are all unit vectors — and in relativity, the basis vectors of a coordinate system are the grown-up version of î, ĵ and k̂.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Build a vector from î, ĵ and k̂',
    lead: t`Set the three components. The vector $\vec A$ (blue) is the end of a path of $A_x$ steps of $\hat\imath$, then $A_y$ of $\hat\jmath$, then $A_z$ of $\hat k$. The gold arrow is $\hat A$: same direction, length 1.`,
    tasks: [
      'Set A = 2î + 0ĵ + 0k̂: Â lies exactly on î.',
      'Double every component: A doubles in length, but Â does not move at all.',
      'Make a component negative: that step of the path runs backwards along its axis.',
    ],
    params: {
      range: 3,
      sliders: [
        { key: 'ax', label: '$A_x$', min: -3, max: 3, step: 0.5, value: 1.5, explain: 'How many units along x.' },
        { key: 'ay', label: '$A_y$', min: -3, max: 3, step: 0.5, value: 2.5, explain: 'How many units along y.' },
        { key: 'az', label: '$A_z$', min: -3, max: 3, step: 0.5, value: 2, explain: 'How many units along z.' },
      ],
      vectors: [
        ...HATS,
        { to: ['ax', 0, 0], color: 'bad', dash: true, width: 2, when: 'ax' },
        { from: ['ax', 0, 0], to: ['ax', 'ay', 0], color: 'good', dash: true, width: 2, when: 'ay' },
        { from: ['ax', 'ay', 0], to: ['ax', 'ay', 'az'], color: 'teal', dash: true, width: 2, when: 'az' },
        { to: ['ax', 'ay', 'az'], color: 'accent', label: '\\vec A' },
        { to: ['ax/sqrt(ax^2 + ay^2 + az^2)', 'ay/sqrt(ax^2 + ay^2 + az^2)', 'az/sqrt(ax^2 + ay^2 + az^2)'], color: 'gold', label: '\\hat A', width: 3.4, when: 'ax^2 + ay^2 + az^2' },
      ],
      readouts: [
        { label: '$|\\vec A|$', expr: 'sqrt(ax^2 + ay^2 + az^2)', digits: 3 },
        { label: '$\\hat A$', vec: ['ax/sqrt(ax^2 + ay^2 + az^2)', 'ay/sqrt(ax^2 + ay^2 + az^2)', 'az/sqrt(ax^2 + ay^2 + az^2)'], digits: 3 },
        { label: '$|\\hat A|$', expr: 'sqrt(ax^2 + ay^2 + az^2)/sqrt(ax^2 + ay^2 + az^2)', digits: 3 },
      ],
    },
    caption: 'Red, green and teal: î, ĵ, k̂ (length 1) and the dashed steps along them. Drag to rotate; arrow keys turn it too. Arrows are to scale.',
  },
  example: {
    prompt: t`A spacecraft’s thruster pushes with $\vec F = (2.0\,\hat\imath - 1.0\,\hat\jmath + 2.0\,\hat k)$ kN. Find the size of the force and the unit vector giving its direction.`,
    visual: scene3d(EXF, { label: '\\vec F', caption: 'The force (blue), its î, ĵ, k̂ path (dashed) and its unit vector F̂ (gold). Drag to rotate.' }),
    steps: [
      { label: 'Magnitude', text: t`$|\vec F| = \sqrt{2.0^2 + (-1.0)^2 + 2.0^2} = \sqrt{9.0} = ${fmt(EXM, 2)}$ kN. The minus sign disappears when squared — a magnitude is never negative.` },
      { label: 'Divide by it', text: t`$\hat F = \dfrac{\vec F}{|\vec F|} = \dfrac{2.0\,\hat\imath - 1.0\,\hat\jmath + 2.0\,\hat k}{3.0} = ${frac(2 / 3)}\,\hat\imath - ${frac(1 / 3)}\,\hat\jmath + ${frac(2 / 3)}\,\hat k$. The kilonewtons cancel: a unit vector has no units.` },
      { label: 'Check the length', text: t`$|\hat F| = \sqrt{\tfrac49 + \tfrac19 + \tfrac49} = 1$. ✓` },
      { label: 'Size times direction', text: t`$\vec F = (3.0\ \text{kN})\,\hat F$. Steering the thruster changes $\hat F$; throttling it changes the 3.0 kN.` },
    ],
    answer: t`$|\vec F| = 3.0$ kN along $\hat F = \tfrac23\hat\imath - \tfrac13\hat\jmath + \tfrac23\hat k$.`,
  },
  practice: [
    mcq({
      id: 'i-plus-j', difficulty: 1,
      prompt: t`What is the magnitude of $\hat\imath + \hat\jmath$?`,
      choices: [t`$\sqrt2$`, '2', '1', '0'],
      answer: 0,
      why: {
        1: 'Lengths only add when the vectors point the same way. î and ĵ are perpendicular.',
        2: 'Adding two unit vectors does not, in general, give a unit vector.',
        3: 'î and ĵ point in different directions, so they cannot cancel.',
      },
      hints: [t`$\hat\imath + \hat\jmath$ has components $(1,\ 1,\ 0)$.`],
      visual: vectorPicture({
        arrows: [{ to: [1, 0], color: 'bad' }, { from: [1, 0], to: [1, 1], color: 'good' }, { to: [1, 1] }],
        segments: [{ from: [0, 1], to: [1, 1] }, { from: [0, 0], to: [0, 1] }],
        points: [
          { x: 0.45, y: 0.02, r: 0.01, color: 'bad', label: 'î' },
          { x: 1.02, y: 0.5, r: 0.01, color: 'good', label: 'ĵ' },
          { x: 0.14, y: 0.6, r: 0.01, color: 'accent', label: 'î + ĵ' },
        ],
        caption: 'î, then ĵ from its tip: the sum runs across the unit square (dashed).',
      }),
      teach: 'Unit vectors add like any vectors — by components — so î + ĵ is the diagonal of a unit square.',
      explain: t`$|\hat\imath + \hat\jmath| = \sqrt{1^2 + 1^2} = \sqrt2 \approx 1.41$: the diagonal of a square with sides of length 1.`,
    }),
    num({
      id: 'magnitude-3d', difficulty: 1,
      gen(r) {
        const v = [r.intExcept(-6, 6, [0]), r.intExcept(-6, 6, [0]), r.intExcept(-6, 6, [0])];
        const m = mag3(v);
        return {
          prompt: t`A displacement is $\vec d = (${v[0]}\,\hat\imath ${v[1] < 0 ? '-' : '+'} ${Math.abs(v[1])}\,\hat\jmath ${v[2] < 0 ? '-' : '+'} ${Math.abs(v[2])}\,\hat k)$ m. How long is it?`,
          answer: m, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: Math.hypot(v[0], v[1]), feedback: 'You left out the z-component. In three dimensions, all three components go under the square root.' }, { value: Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]), feedback: 'The components are perpendicular steps, so they combine by Pythagoras, not by adding.' }],
          hints: [t`$|\vec d| = \sqrt{d_x^2 + d_y^2 + d_z^2}$.`],
          teach: t`In three dimensions the magnitude is $\sqrt{A_x^2 + A_y^2 + A_z^2}$: Pythagoras applied twice.`,
          explain: t`$|\vec d| = \sqrt{${v[0] ** 2} + ${v[1] ** 2} + ${v[2] ** 2}} = \sqrt{${v[0] ** 2 + v[1] ** 2 + v[2] ** 2}} = ${fmt(m, 3)}$ m.`,
          visual: scene3d(v, { label: '\\vec d', unit: false, caption: 'The displacement and its three perpendicular steps. Drag to rotate.' }),
        };
      },
    }),
    num({
      id: 'unit-component', difficulty: 2,
      gen(r) {
        const base = r.pick([[1, 2, 2], [2, 3, 6], [1, 4, 8], [4, 4, 7], [2, 6, 9], [3, 4, 12]]);
        const v = r.shuffle(base).map((c) => c * r.sign());
        const m = mag3(v), k = r.int(0, 2), axis = ['x', 'y', 'z'][k];
        return {
          prompt: t`What is the $${axis}$-component of the unit vector along $\vec A = (${v[0]},\ ${v[1]},\ ${v[2]})$? Give a decimal.`,
          answer: v[k] / m, tol: { rel: 0.005, abs: 0.002 },
          errors: [
            { value: v[k], feedback: 'That is a component of A itself. Divide by |A| to make a unit vector.' },
            { value: v[k] / (Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2])), feedback: t`Divide by the magnitude, $\sqrt{A_x^2 + A_y^2 + A_z^2}$, not by the sum of the components.` },
          ],
          hints: [t`First find $|\vec A| = \sqrt{${v[0] ** 2} + ${v[1] ** 2} + ${v[2] ** 2}}$.`, t`$\hat A = \vec A/|\vec A|$, so its $${axis}$-component is $A_${axis}/|\vec A|$.`],
          teach: 'Each component of a unit vector is the matching component of the vector divided by its magnitude — a number between −1 and 1.',
          explain: t`$|\vec A| = ${m}$, so $\hat A = \left(${frac(v[0] / m)},\ ${frac(v[1] / m)},\ ${frac(v[2] / m)}\right)$ and the $${axis}$-component is $${frac(v[k] / m)} \approx ${fmt(v[k] / m, 3)}$.`,
          visual: scene3d(v, { caption: 'A (blue) and its unit vector Â (gold), same direction, length 1. Drag to rotate.' }),
        };
      },
    }),
    mcq({
      id: 'which-is-unit', difficulty: 2,
      prompt: 'Which of these is a unit vector?',
      choices: [t`$0.6\,\hat\imath + 0.8\,\hat k$`, t`$0.5\,\hat\imath + 0.5\,\hat\jmath$`, t`$\tfrac13(\hat\imath + \hat\jmath + \hat k)$`, t`$\hat\imath + \hat\jmath + \hat k$`],
      answer: 0,
      why: {
        1: t`Its length is $\sqrt{0.25 + 0.25} = 0.71$. Components of a unit vector do not add to 1; their squares do.`,
        2: t`Its length is $\sqrt{3}/3 \approx 0.58$. To normalise $\hat\imath + \hat\jmath + \hat k$, divide by its length $\sqrt3$, not by 3.`,
        3: t`Its length is $\sqrt3 \approx 1.73$.`,
      },
      hints: ['A unit vector has length 1: check √(sum of the squares of the components).'],
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', equal: true, x: [-0.25, 1.45], y: [-0.2, 1.2], xticks: 4, yticks: 4,
          alt: 'The unit circle and the straight line x + y = 1, which meet only on the axes',
          curves: [
            { param: ['cos(t)', 'sin(t)'], t: [0, 'pi/2'], color: 'gold', width: 2.2 },
            { fn: '1 - x', domain: [0, 1], color: 'ink3', width: 1.6, dash: true },
          ],
          arrows: [{ from: [0, 0], to: [0.866, 0.5], color: 'gold' }],
          points: [
            { x: 0.5, y: 0.5, r: 4.5, color: 'ink2', label: '(0.5, 0.5)' },
            { x: 0.72, y: 0.86, r: 0.01, color: 'gold', label: 'x² + y² = 1: length 1' },
            { x: 0.04, y: 0.6, r: 0.01, color: 'ink3', label: 'x + y = 1' },
            { x: 0.9, y: 0.43, r: 0.01, color: 'gold', label: 'a unit vector' },
          ],
        },
        caption: 'In a plane, every unit vector’s tip lies on the circle x² + y² = 1. The dashed line is where the components add to 1: it touches the circle only on the axes. In 3D the circle becomes a sphere.',
      },
      teach: 'A vector is a unit vector when the squares of its components add to 1.',
      explain: t`$\sqrt{0.6^2 + 0.8^2} = \sqrt{0.36 + 0.64} = 1$.`,
    }),
    num({
      id: 'size-times-direction', difficulty: 2,
      gen(r) {
        const F = r.pick([300, 450, 600, 900]);
        const base = r.pick([[2, -1, 2], [1, 2, -2], [2, 3, 6], [-3, 4, 12]]);
        const m = mag3(base), k = r.int(0, 2), axis = ['x', 'y', 'z'][k];
        const comp = (F * base[k]) / m;
        return {
          prompt: t`A ${F} N force acts in the direction of the vector $\vec d = (${base[0]},\ ${base[1]},\ ${base[2]})$ m. What is the $${axis}$-component of the force?`,
          answer: comp, units: 'N', tol: { rel: 0.005 },
          errors: [{ value: F * base[k], feedback: t`$\vec d$ only gives the direction: turn it into a unit vector by dividing by $|\vec d| = ${m}$ m before multiplying by ${F} N.` }],
          hints: [t`The force is $\vec F = (${F}\ \text{N})\,\hat d$, with $\hat d = \vec d/|\vec d|$.`, t`$|\vec d| = ${m}$ m, so $F_${axis} = ${F}\times\dfrac{${base[k]}}{${m}}$.`],
          teach: 'To build a vector of a given size along a given direction, multiply the size by the unit vector of that direction.',
          visual: scene3d(base, { label: '\\vec d', caption: 'The direction vector d (blue) and its unit vector d̂ (gold): the force points along d̂.' }),
          explain: t`$\hat d = \tfrac{1}{${m}}(${base.join(',\\ ')})$, so $F_${axis} = ${F}\times\tfrac{${base[k]}}{${m}} = ${fmt(comp, 3)}$ N.`,
        };
      },
    }),
    mcq({
      id: 'unit-form-2d', difficulty: 1,
      prompt: t`A displacement of 5.0 m points 37° above the $+x$ axis, in the $xy$-plane. Which is it in unit-vector form? ($\cos 37° \approx 0.80$, $\sin 37° \approx 0.60$.)`,
      choices: [t`$(4.0\,\hat\imath + 3.0\,\hat\jmath)$ m`, t`$(3.0\,\hat\imath + 4.0\,\hat\jmath)$ m`, t`$(5.0\,\hat\imath + 5.0\,\hat\jmath)$ m`, t`$(4.0\,\hat\imath + 3.0\,\hat k)$ m`],
      answer: 0,
      why: {
        1: 'Swapped: the component adjacent to an angle measured from x is the x-component, 5.0 cos 37°.',
        2: 'That vector is 7.1 m long and points at 45°.',
        3: 'k̂ points along z, but this vector lies in the xy-plane.',
      },
      hints: [t`$A_x = A\cos\theta$, $A_y = A\sin\theta$; then attach $\hat\imath$ and $\hat\jmath$.`],
      teach: 'Unit-vector form is just the components written with î, ĵ, k̂ attached: A = A cos θ î + A sin θ ĵ.',
      explain: t`$A_x = 5.0\cos37° = 4.0$ m and $A_y = 5.0\sin37° = 3.0$ m, so $\vec A = (4.0\,\hat\imath + 3.0\,\hat\jmath)$ m.`,
      visual: vectorPicture({ arrows: [{ to: polar(5, 37), label: '5.0 m' }], arc: { from: 0, to: 37, label: '37°' }, numbers: false }),
    }),
    mcq({
      id: 'normalise-error', difficulty: 3, kind: 'error',
      prompt: t`Asked for the unit vector along $\vec A = 3\,\hat\imath + 4\,\hat\jmath$, a student writes $\hat A = \tfrac37\,\hat\imath + \tfrac47\,\hat\jmath$. What went wrong?`,
      choices: ['They divided by the sum of the components, 7, instead of the magnitude, 5', 'Nothing: the components of a unit vector must add up to 1', 'They should have divided by 3 and by 4 separately', 'A unit vector cannot have a ĵ component when A has an î component'],
      answer: 0,
      why: {
        1: 'Check the length: √((3/7)² + (4/7)²) = 5/7, not 1. It is the squares of the components that sum to 1.',
        2: 'Dividing each component by itself gives î + ĵ, which points at 45° — the wrong direction, and not of length 1.',
        3: 'A unit vector has the same direction as A, so it keeps all of A’s components in proportion.',
      },
      hints: ['Check the length of the student’s answer.', t`$|\vec A| = \sqrt{3^2 + 4^2} = 5$.`],
      visual: vectorPicture({
        arrows: [{ to: [3 / 7, 4 / 7], color: 'bad' }],
        segments: [{ from: [0, 0], to: [0.78, 1.04], color: 'ink3' }],
        curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 'pi/2'], color: 'gold', width: 2 }],
        extent: [[1, 0], [0, 1], [0.78, 1.04]], pad: 0.12,
        points: [
          { x: 0.45, y: 0.36, r: 0.01, color: 'bad', label: 'student’s answer' },
          { x: 0.8, y: 0.9, r: 0.01, color: 'ink3', label: 'direction of A' },
          { x: 0.93, y: 0.3, r: 0.01, color: 'gold', label: 'length 1' },
        ],
        caption: 'The student’s vector, drawn to scale against the unit circle (gold) and the direction of A (dashed).',
      }),
      teach: 'Normalise by the magnitude: Â = A/|A|, never by the sum of the components.',
      explain: t`$|\vec A| = 5$, so $\hat A = \tfrac35\,\hat\imath + \tfrac45\,\hat\jmath$, whose length is $\sqrt{0.36 + 0.64} = 1$. The student’s vector points the right way but is only $5/7$ long.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-antenna', difficulty: 3, transfer: true,
      gen(r) {
        const [base, scale] = r.pick([[[4, 3, 12], 1000], [[2, 6, 9], 1500], [[1, 4, 8], 2000], [[6, 6, 7], 1200]]);
        const v = base.map((c) => c * scale), m = mag3(v);
        return {
          prompt: t`A ground station at the origin ($\hat k$ pointing straight up) tracks a satellite at $\vec r = (${v[0]}\,\hat\imath + ${v[1]}\,\hat\jmath + ${v[2]}\,\hat k)$ km. Its dish must point along $\hat r$. What is the $\hat k$ (upward) component of $\hat r$?`,
          answer: v[2] / m, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: v[2], feedback: 'That is the satellite’s height in km. The pointing direction is the unit vector: divide by |r|.' }],
          hints: [t`$|\vec r| = \sqrt{${v[0]}^2 + ${v[1]}^2 + ${v[2]}^2}$ km.`, t`The upward component of $\hat r$ is $r_z/|\vec r|$.`],
          visual: dishPlane(v),
          teach: 'A pointing direction is a unit vector: the position divided by its distance.',
          explain: t`$|\vec r| = ${m}$ km, so the upward component of $\hat r$ is $${v[2]}/${m} = ${fmt(v[2] / m, 3)}$ — the sine of the dish’s elevation angle, $${fmt((Math.asin(v[2] / m) * 180) / Math.PI, 3)}°$ above the horizon.`,
        };
      },
    }),
    num({
      id: 'cp-speed-3d', difficulty: 2,
      gen(r) {
        const v = r.pick([[120, -50, 90], [200, 150, -60], [-80, 60, 240], [30, -40, 120]]);
        return {
          prompt: t`A drone’s velocity is $\vec v = (${v[0]}\,\hat\imath ${v[1] < 0 ? '-' : '+'} ${Math.abs(v[1])}\,\hat\jmath ${v[2] < 0 ? '-' : '+'} ${Math.abs(v[2])}\,\hat k)$ cm/s. What is its speed, in cm/s?`,
          answer: mag3(v), units: 'cm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]), feedback: 'The components are perpendicular: combine them by Pythagoras.' }],
          hints: [t`Speed $= |\vec v| = \sqrt{v_x^2 + v_y^2 + v_z^2}$.`],
          visual: scene3d(v, { label: '\\vec v', unit: false, caption: 'The drone’s velocity and its three perpendicular components. Drag to rotate.' }),
          teach: 'Speed is the magnitude of the velocity vector.',
          explain: t`$|\vec v| = \sqrt{${v[0] ** 2} + ${v[1] ** 2} + ${v[2] ** 2}} = ${fmt(mag3(v), 4)}$ cm/s.`,
        };
      },
    }),
    mcq({
      id: 'cp-units-of-ihat', difficulty: 2,
      prompt: t`A force is written $\vec F = (3.0\,\hat\imath + 4.0\,\hat\jmath)$ N. What are the units of $\hat\imath$?`,
      choices: ['None: a unit vector is a pure number with a direction', 'Newtons, the units of the force', 'Metres, because it points along the x-axis', 'Radians, because it describes a direction'],
      answer: 0,
      why: {
        1: 'The newtons belong to the components (3.0 N and 4.0 N); î only says “along x”.',
        2: 'The axis is a direction, not a length: the same î serves forces, velocities and displacements alike.',
        3: 'Radians measure angles; a unit vector is a direction given by components, not an angle.',
      },
      hints: [t`$\hat\imath = \vec A/|\vec A|$ for any $\vec A$ along $x$: what happens to the units in that division?`],
      teach: 'Unit vectors are dimensionless: the units of a vector live in its components (or its magnitude).',
      explain: t`$\hat\imath$ is a vector divided by its own length, so its units cancel. The newtons are carried by the components: $F_x = 3.0$ N, $F_y = 4.0$ N.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §2.2', url: 'https://openstax.org/books/university-physics-volume-1/pages/2-2-coordinate-systems-and-components-of-a-vector' },
  ],
});
