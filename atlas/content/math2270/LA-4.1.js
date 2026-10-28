// Linear transformations of the plane: superposition, the geometric gallery
// (rotation, reflection, shear, projection) and why a translation is not linear.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { tupleTeX, map2d } from './_la.js';
import { arrows2 } from './_spaces.js';

const t = String.raw;
const comb = (a, b, u = t`\mathbf u`, v = t`\mathbf v`) => `${a === 1 ? '' : a === -1 ? '-' : a}${u} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}${v}`;
const TU = t`T(\mathbf u)`, TV = t`T(\mathbf v)`;
const dec = (v) => `(${v.map((x) => nice(x)).join(',\\ ')})`;
const cosd = (d) => Math.cos((d * Math.PI) / 180), sind = (d) => Math.sin((d * Math.PI) / 180);
const r3 = (x) => +x.toFixed(3);

// the gallery for the identify problem: kind index → matrices
const GALLERY = [
  [[[0, -1], [1, 0]], [[0, 1], [-1, 0]], [[-1, 0], [0, -1]], [[r3(cosd(45)), -r3(sind(45))], [r3(sind(45)), r3(cosd(45))]]],
  [[[1, 0], [0, -1]], [[-1, 0], [0, 1]], [[0, 1], [1, 0]], [[0, -1], [-1, 0]]],
  [[[1, 1], [0, 1]], [[1, 0], [1, 1]], [[1, -1], [0, 1]], [[1, 0], [-1, 1]]],
  [[[1, 0], [0, 0]], [[0, 0], [0, 1]], [[0.5, 0.5], [0.5, 0.5]], [[0.5, -0.5], [-0.5, 0.5]]],
];
const KIND = ['A rotation', 'A reflection', 'A shear', 'A projection'];
const KIND_WHY = [
  'A rotation keeps every length and angle and never mirrors the F: compare the bold F with the faint one — same shape, same size, only turned?',
  'A reflection keeps lengths but mirrors the F, so it reads backwards. Check whether the bold F is a mirror image of the faint one.',
  'A shear slides the plane along one direction: the gold square becomes a leaning parallelogram with the same base and height.',
  'A projection flattens the whole plane onto a line, so the F would collapse into a segment.',
];
const KIND_EXPLAIN = [
  'The F has turned about the origin but kept its shape and size, and it still reads the right way round: a rotation.',
  'The F keeps its size but reads backwards — a mirror image: a reflection, in the line that the map leaves fixed.',
  'The square has become a parallelogram with the same base and height, and the F leans: a shear. Lines in one direction stay put; the rest slide along them.',
  'The whole plane, F and all, has collapsed onto a single line through the origin: a projection. It is still linear — the origin stays put and the flattened grid lines stay evenly spaced.',
];
const PAIRS = [[[1, 1], [1, -1]], [[1, 2], [2, 1]], [[1, 0], [1, 1]], [[2, 1], [-1, 1]], [[1, -1], [0, 1]], [[1, 2], [-1, 1]]];

export default lesson({
  id: 'math2270.LA-4.1',
  title: 'Transformations of the plane',
  minutes: 10, difficulty: 2,
  intro: t`A **transformation** $T$ of the plane sends every vector $\mathbf x$ to a vector $T(\mathbf x)$. It is **linear** when it respects superposition — transforming a combination gives the same combination of the transformed vectors:

$$T(c\,\mathbf u + d\,\mathbf v) = c\,T(\mathbf u) + d\,T(\mathbf v)$$

So once you know where $T$ sends two vectors that point different ways, you know it everywhere. In pictures: the origin stays put, straight lines stay straight, and grid lines stay **parallel and evenly spaced**. Rotations, reflections, shears, stretches and projections all pass; a shift (translation) does not. Superposition is also why linear physics is tractable: forces add, waves pass through one another, and quantum states combine.`,
  symbols: [
    { tex: 'T', text: t`the transformation (map): a rule that takes each vector $\mathbf x$ of the plane $\mathbb R^2$ to a vector $T(\mathbf x)$ of the plane` },
    { tex: t`\mathbf u,\ \mathbf v`, text: 'any two vectors of the plane' },
    { tex: 'c,\\ d', text: 'any two real numbers (scalars), the weights of the combination' },
    { tex: t`T(\mathbf u)`, text: t`the **image** of $\mathbf u$: where $T$ sends it` },
    { tex: t`c\,\mathbf u + d\,\mathbf v`, text: 'a linear combination: scale each vector, then add tip to tail' },
  ],
  why: 'Superposition is the property every linear theory shares — Newton’s forces, Maxwell’s fields, the wave equation, quantum mechanics — and LA-4.2 shows that every linear map is a matrix.',
  visual: {
    type: 'la-map2d',
    title: 'Drag two arrows, move the whole plane',
    lead: t`The two arrows are where the map sends $\mathbf e_1 = (1, 0)$ and $\mathbf e_2 = (0, 1)$. Drag their tips and the whole grid follows, because every vector is a combination of $\mathbf e_1$ and $\mathbf e_2$. Whatever you do, the origin stays put and the grid lines stay straight, parallel and evenly spaced: that is what linear looks like.`,
    tasks: [
      'Drag Ae₂ to (1, 1) and leave Ae₁ at (1, 0): a shear. Horizontal lines slide sideways, yet every grid line stays straight and evenly spaced.',
      'Drag Ae₁ to (0, 1) and Ae₂ to (−1, 0): a quarter-turn rotation. Then try Ae₁ = (1, 0), Ae₂ = (0, −1): a reflection — the F now reads backwards.',
      'Drag Ae₂ onto the origin with Ae₁ at (1, 0): a projection onto the x-axis. The plane flattens onto a line, and the map is still linear.',
    ],
    params: { A: [[1, 0], [0, 1]], drag: true, snap: 0.5, view: 2.6, readout: ['A'] },
    caption: 'Faint: the plane before the map. Bold: after it — the grid, the unit square (gold) and the F. The tips snap to half units. The readout is the map’s matrix, whose columns are the two arrows (LA-4.2).',
  },
  example: {
    prompt: t`A linear map $T$ sends $\mathbf u = (1, 1)$ to $T(\mathbf u) = (0, 2)$ and $\mathbf v = (1, -1)$ to $T(\mathbf v) = (2, 0)$. Where does it send $\mathbf w = (3, 1)$?`,
    visual: arrows2([
      { to: [1, 1], color: 'accent', label: 'u', labelDx: -14, labelDy: -10 },
      { to: [1, -1], color: 'accent', label: 'v', labelDx: 4, labelDy: 10 },
      { to: [2, 2], color: 'accent', dash: true, width: 1.4 },
      { from: [2, 2], to: [3, 1], color: 'accent', dash: true, width: 1.4 },
      { to: [3, 1], color: 'accent', width: 2.8, label: 'w = 2u + v', labelDx: 6, labelDy: 6 },
      { to: [0, 2], color: 'warn', label: 'T(u)', labelDx: -40, labelDy: -6 },
      { to: [2, 0], color: 'warn', label: 'T(v)', labelDx: -6, labelDy: 14 },
      { to: [0, 4], color: 'warn', dash: true, width: 1.4 },
      { from: [0, 4], to: [2, 4], color: 'warn', dash: true, width: 1.4 },
      { to: [2, 4], color: 'gold', width: 2.8, label: 'T(w) = 2T(u) + T(v)', labelDx: 8, labelDy: -4 },
    ], { x: [-1.6, 7.4], y: [-1.6, 4.6], caption: 'Blue: u, v and w = 2u + v built tip to tail. Orange: their images. Gold: T(w), built from the images with the same weights.' }),
    steps: [
      { label: 'Write w from u and v', text: t`Find $c$, $d$ with $c\mathbf u + d\mathbf v = \mathbf w$: componentwise $c + d = 3$ and $c - d = 1$, so $c = 2$ and $d = 1$. That is, $\mathbf w = 2\mathbf u + \mathbf v$.` },
      { label: 'Superpose', text: t`Linearity lets $T$ pass through the combination: $T(\mathbf w) = 2T(\mathbf u) + T(\mathbf v) = 2(0, 2) + (2, 0) = (2, 4)$.` },
      { label: 'No formula needed', text: t`You never needed a formula for $T$: two images fixed it everywhere. (The formula is $T(x, y) = (x - y,\ x + y)$ — check that it gives both images.)` },
      { label: 'Sense check', text: t`$\mathbf u$ has length $\sqrt2$ and $T(\mathbf u)$ length $2$: this map stretches by $\sqrt2$ (and turns by $45^\circ$). So $|T(\mathbf w)|$ should be $\sqrt2\,|\mathbf w| = \sqrt2\cdot\sqrt{10} = \sqrt{20}$, and indeed $|(2, 4)| = \sqrt{4 + 16} = \sqrt{20}$. ✓` },
    ],
    answer: t`$T(\mathbf w) = (2, 4)$ — because $\mathbf w = 2\mathbf u + \mathbf v$, so $T(\mathbf w) = 2T(\mathbf u) + T(\mathbf v)$.`,
  },
  practice: [
    mcq({
      id: 'which-linear', difficulty: 1,
      prompt: 'Which map of the plane is linear?',
      choices: [t`$T(x, y) = (3x - y,\ 2y)$`, t`$T(x, y) = (x + 1,\ y)$`, t`$T(x, y) = (x^2,\ y)$`, t`$T(x, y) = (xy,\ y)$`],
      answer: 0,
      why: {
        1: t`A shift is not linear: $T(0, 0) = (1, 0)$, but every linear map sends $\mathbf 0$ to $\mathbf 0$ (put $c = d = 0$ in the superposition rule).`,
        2: t`Squaring breaks scaling: $T(2, 0) = (4, 0)$, but $2\,T(1, 0) = (2, 0)$.`,
        3: t`A product of the inputs breaks scaling: $T(2, 2) = (4, 2)$, but $2\,T(1, 1) = (2, 2)$.`,
      },
      hints: [t`Test each map on $\mathbf 0$ and on a doubled input: a linear map has $T(\mathbf 0) = \mathbf 0$ and $T(2\mathbf x) = 2T(\mathbf x)$.`, 'In a linear map each output is a fixed combination ax + by of the inputs — nothing added on, squared or multiplied together.'],
      teach: 'A map of the plane is linear exactly when each output is a fixed combination ax + by of the inputs: no constants, powers or products.',
      explain: t`$T(x, y) = (3x - y,\ 2y)$: each output is a fixed combination of $x$ and $y$, so $T(c\mathbf u + d\mathbf v) = cT(\mathbf u) + dT(\mathbf v)$ holds term by term. The others fail at $\mathbf 0$ or under doubling.`,
    }),
    mcq({
      id: 'identify', difficulty: 1,
      gen(r) {
        const kind = r.int(0, 3), A = r.pick(GALLERY[kind]);
        const why = {};
        for (let k = 0; k < 4; k++) if (k !== kind) why[k] = KIND_WHY[k];
        return {
          prompt: 'The picture shows what a linear map does to the plane: the faint F is before the map, the bold F after it. What kind of map is it?',
          choices: KIND, answer: kind, why,
          hints: ['Compare the bold F with the faint one: has it turned, flipped, leaned or flattened?', 'A mirrored F (reading backwards) means a reflection; a flattened one, a projection; a leaning square, a shear; the same F turned about the origin, a rotation.'],
          teach: 'The gallery: rotations turn, reflections mirror, shears slide, projections flatten — all linear, all fixing the origin.',
          explain: KIND_EXPLAIN[kind],
          visual: map2d(A, { view: 2, colNames: ['', ''], caption: 'Faint: the F and the unit square before the map. Bold: after it, with the grid’s image.' }),
        };
      },
    }),
    num({
      id: 'superpose', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const [u, v] = r.pick(PAIRS), Tu = [r.int(-3, 3), r.int(-3, 3)], Tv = [r.int(-3, 3), r.int(-3, 3)];
          const a = r.pick([-2, -1, 2, 3]), b = r.pick([-2, -1, 1, 2]), c = r.int(0, 1);
          const ans = a * Tu[c] + b * Tv[c];
          if (Tu.every((z) => z === 0) || Tv.every((z) => z === 0) || ans === 0 || a === b) continue;
          const errs = [];
          if (Tu[c] + Tv[c] !== ans) errs.push({ value: Tu[c] + Tv[c], feedback: t`Keep the weights: $T(${comb(a, b)}) = ${a}\,T(\mathbf u) + (${b})\,T(\mathbf v)$, not $T(\mathbf u) + T(\mathbf v)$.` });
          if (b * Tu[c] + a * Tv[c] !== ans && b * Tu[c] + a * Tv[c] !== Tu[c] + Tv[c]) errs.push({ value: b * Tu[c] + a * Tv[c], feedback: t`The weights are swapped: $${a}$ goes with $T(\mathbf u)$ and $${b}$ with $T(\mathbf v)$.` });
          return {
            prompt: t`A linear map $T$ sends $\mathbf u = ${tupleTeX(u)}$ to $T(\mathbf u) = ${tupleTeX(Tu)}$ and $\mathbf v = ${tupleTeX(v)}$ to $T(\mathbf v) = ${tupleTeX(Tv)}$. What is the ${c ? 'second' : 'first'} component of $T(${comb(a, b)})$?`,
            answer: ans, tol: { rel: 0, abs: 0.01 }, errors: errs,
            hints: [t`Superposition: $T(${comb(a, b)}) = ${comb(a, b, TU, TV)}$.`, t`Only the ${c ? 'second' : 'first'} components matter: $(${a})(${Tu[c]}) + (${b})(${Tv[c]})$.`],
            teach: 'A linear map sends a combination of vectors to the same combination of their images.',
            explain: t`$T(${comb(a, b)}) = ${comb(a, b, tupleTeX(Tu), tupleTeX(Tv))} = ${tupleTeX([a * Tu[0] + b * Tv[0], a * Tu[1] + b * Tv[1]])}$. The vectors $\mathbf u$ and $\mathbf v$ themselves were not needed — only their images and the weights.`,
            visual: arrows2([
              { to: u, color: 'accent', label: 'u', labelDx: 6, labelDy: -8 }, { to: v, color: 'accent', label: 'v', labelDx: 6, labelDy: -8 },
              ...(Tu.some((z) => z) ? [{ to: Tu, color: 'warn', label: 'T(u)', labelDx: 6, labelDy: -8 }] : []),
              ...(Tv.some((z) => z) ? [{ to: Tv, color: 'warn', label: 'T(v)', labelDx: 6, labelDy: 10 }] : []),
            ], { caption: 'Blue: u and v. Orange: their images under T. The combination you are asked about is not drawn.' }),
          };
        }
        return { prompt: t`$T(\mathbf u) = (1, 2)$ and $T(\mathbf v) = (3, 0)$. First component of $T(2\mathbf u + \mathbf v)$?`, answer: 5, hints: ['2·1 + 3.'], teach: 'Superposition.', explain: t`$2 + 3 = 5$.` };
      },
    }),
    num({
      id: 'rotate-point', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const th = r.pick([30, 45, 60, 120, 135, 150, -30, -60, -120]), x = [r.intExcept(-3, 3, [0]), r.int(-3, 3)], c = r.int(0, 1);
          const img = [x[0] * cosd(th) - x[1] * sind(th), x[0] * sind(th) + x[1] * cosd(th)];
          const cw = [x[0] * cosd(th) + x[1] * sind(th), -x[0] * sind(th) + x[1] * cosd(th)];
          if (Math.abs(img[c]) < 0.1 || Math.abs(cw[c] - img[c]) < 0.05) continue;
          const R = Math.hypot(...x);
          return {
            prompt: t`Rotate the point $\mathbf x = ${tupleTeX(x)}$ through $${th}^\circ$ about the origin (${th > 0 ? 'counterclockwise' : 'clockwise'}). What is the ${c ? 'y' : 'x'}-coordinate of its image, to 3 significant figures?`,
            answer: img[c], tol: { rel: 0.005, abs: 0.005 }, sigfigs: 3,
            errors: [{ value: cw[c], feedback: t`That rotates the wrong way. A positive angle turns counterclockwise: $R_\theta = \begin{bmatrix}\cos\theta & -\sin\theta \\ \sin\theta & \cos\theta\end{bmatrix}$, with $\theta = ${th}^\circ$.` }],
            hints: [t`The rotation matrix is $R_\theta = \begin{bmatrix}\cos\theta & -\sin\theta \\ \sin\theta & \cos\theta\end{bmatrix}$ — its columns are where $\mathbf e_1$ and $\mathbf e_2$ land.`, t`So the image is $(x_1\cos\theta - x_2\sin\theta,\ x_1\sin\theta + x_2\cos\theta)$ with $\theta = ${th}^\circ$ (a negative angle turns clockwise).`],
            teach: 'Rotation through θ is the linear map with matrix [cos θ, −sin θ; sin θ, cos θ]; it keeps every length.',
            explain: t`$R_{${th}^\circ}\mathbf x = (${nice(img[0], 4)},\ ${nice(img[1], 4)})$. Its length is still $\sqrt{${x[0] ** 2 + x[1] ** 2}} \approx ${nice(R, 4)}$: rotations keep lengths.`,
            visual: { type: 'graph', params: { x: [-R - 1, R + 1], y: [-R - 0.8, R + 0.8], aspect: 'wide', equal: true, xlabel: '', ylabel: '', curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 2 * Math.PI], color: 'ink3', dash: true, width: 1.4 }], arrows: [{ from: [0, 0], to: x, color: 'accent', label: 'x', labelDx: 6, labelDy: -10 }] }, caption: 'The point x and the circle it turns along: a rotation about the origin keeps its distance from the origin.' },
          };
        }
        return { prompt: t`Rotate $(1, 0)$ through $90^\circ$; y-coordinate?`, answer: 1, hints: ['(0, 1).'], teach: 'Rotation.', explain: 'It lands on (0, 1).' };
      },
    }),
    mcq({
      id: 'shift-error', kind: 'error', difficulty: 2,
      prompt: t`A navigation display re-centres its map with $T(x, y) = (x + 2,\ y - 1)$. A student argues: “$T$ keeps every shape and sends straight lines to straight lines, so it is linear.” What is wrong with the argument?`,
      choices: [
        t`Straight lines are not enough: a linear map must also fix the origin, and $T(0, 0) = (2, -1)$.`,
        'Nothing is wrong: any map that keeps lines straight is linear.',
        'T fails because it changes lengths; linear maps keep lengths.',
        'T is linear, but only on points with positive coordinates.',
      ],
      answer: 0,
      why: {
        1: t`A shift keeps lines straight but breaks superposition: $T(\mathbf u + \mathbf v) = \mathbf u + \mathbf v + (2, -1)$, while $T(\mathbf u) + T(\mathbf v)$ adds the shift twice.`,
        2: 'A shift keeps every length. Length is not the test anyway: shears and projections change lengths and are linear.',
        3: 'Linearity is a property of the whole map: superposition must hold for every pair of vectors and every pair of weights.',
      },
      hints: [t`Apply $T$ to $\mathbf 0$.`, t`Compare $T(\mathbf u + \mathbf v)$ with $T(\mathbf u) + T(\mathbf v)$ for $\mathbf u = (1, 0)$ and $\mathbf v = (0, 1)$ — the picture does it.`],
      teach: t`A translation keeps lines straight but moves the origin, so it is not linear; maps of the form $A\mathbf x + \mathbf b$ are called affine.`,
      explain: t`$T(1, 0) + T(0, 1) = (3, -1) + (2, 0) = (5, -1)$, but $T(1, 1) = (3, 0)$: superposition fails, because the shift is added once on one side and twice on the other. A map $\mathbf x \mapsto A\mathbf x + \mathbf b$ is called **affine**; it is linear only when $\mathbf b = \mathbf 0$. (Computer graphics and robotics turn shifts into linear maps one dimension up, with homogeneous coordinates.)`,
      visual: arrows2([
        { to: [3, -1], color: 'accent', label: 'T(u)', labelDx: 6, labelDy: 12 },
        { from: [3, -1], to: [5, -1], color: 'accent', dash: true, label: 'T(u) + T(v)', labelDx: -30, labelDy: 14 },
        { to: [3, 0], color: 'gold', width: 2.8, label: 'T(u + v)', labelDx: 6, labelDy: -10 },
      ], { points: [{ x: 2, y: -1, color: 'bad', r: 5.5, label: 'T(0)', labelDx: -12, labelDy: 14 }], x: [-1, 6.5], y: [-2.2, 1.4], caption: 'The shift T with u = (1, 0) and v = (0, 1): T(u + v) (gold) and T(u) + T(v) (blue) land in different places, and T sends the origin to the red dot.' }),
    }),
    num({
      id: 'centroid', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 400; k++) {
          const P = [r.int(-3, 4), r.int(-3, 4)], Qv = [r.int(-3, 4), r.int(-3, 4)], Rv = [r.int(-3, 4), r.int(-3, 4)], c = r.int(0, 1);
          const area = (Qv[0] - P[0]) * (Rv[1] - P[1]) - (Qv[1] - P[1]) * (Rv[0] - P[0]);
          const sum = P[c] + Qv[c] + Rv[c];
          if (Math.abs(area) < 4 || sum % 3 !== 0 || sum === 0) continue;
          const ans = sum / 3, G = [(P[0] + Qv[0] + Rv[0]) / 3, (P[1] + Qv[1] + Rv[1]) / 3];
          const seg = (p, q) => ({ param: [`${p[0]} + t*(${q[0] - p[0]})`, `${p[1]} + t*(${q[1] - p[1]})`], t: [0, 1], color: 'warn', width: 2 });
          return {
            prompt: t`A linear map $T$ sends the corners $P$, $Q$, $R$ of a triangle to $T(P) = ${tupleTeX(P)}$, $T(Q) = ${tupleTeX(Qv)}$ and $T(R) = ${tupleTeX(Rv)}$. You are not told $P$, $Q$ or $R$. What is the ${c ? 'y' : 'x'}-coordinate of the image of the triangle’s centroid $\tfrac13(P + Q + R)$?`,
            answer: ans, tol: { rel: 0, abs: 0.01 },
            errors: [{ value: sum, feedback: t`That is $T(P) + T(Q) + T(R)$: keep the weight $\tfrac13$ on each corner.` }],
            hints: [t`The centroid is the combination $\tfrac13 P + \tfrac13 Q + \tfrac13 R$. What does a linear map do to a combination?`, t`$T\big(\tfrac13(P + Q + R)\big) = \tfrac13\big(T(P) + T(Q) + T(R)\big)$.`],
            teach: 'A linear map sends the centroid of points to the centroid of their images — it is superposition with weights ⅓.',
            explain: t`$\tfrac13\big(${tupleTeX(P)} + ${tupleTeX(Qv)} + ${tupleTeX(Rv)}\big) = (${nice(G[0], 4)},\ ${nice(G[1], 4)})$. The same reasoning is why a rigid rotation carries a body’s centre of mass along with it: centres of mass are weighted combinations, and linear maps keep combinations.`,
            visual: { type: 'graph', params: { x: [-4.5, 5.5], y: [-4, 5], aspect: 'wide', equal: true, xlabel: '', ylabel: '', curves: [seg(P, Qv), seg(Qv, Rv), seg(Rv, P)], points: [{ x: P[0], y: P[1], color: 'warn', label: 'T(P)' }, { x: Qv[0], y: Qv[1], color: 'warn', label: 'T(Q)' }, { x: Rv[0], y: Rv[1], color: 'warn', label: 'T(R)' }] }, caption: 'The image of the triangle. Its centroid is not marked.' },
          };
        }
        return { prompt: t`$T(P) = (3, 0)$, $T(Q) = (0, 3)$, $T(R) = (0, 0)$. x-coordinate of the image of the centroid?`, answer: 1, hints: ['Average the images.'], teach: 'Centroids map to centroids.', explain: 'Average: 1.' };
      },
    }),
    mcq({
      id: 'galilean', difficulty: 3,
      prompt: t`On a spacetime diagram with coordinates $(t, x)$, switching to a frame that moves at speed $v$ along $x$ is, at everyday speeds, Galileo’s map $G(t, x) = (t,\ x - vt)$. Which statement is true?`,
      choices: [
        t`$G$ is linear — a shear of the $(t, x)$ plane — so straight worldlines stay straight and every speed drops by $v$.`,
        t`$G$ is not linear, because $x - vt$ mixes time and space.`,
        t`$G$ is a rotation of the $(t, x)$ plane, so it keeps lengths.`,
        t`$G$ is linear, but it bends the worldline of a moving body into a curve.`,
      ],
      answer: 0,
      why: {
        1: t`Mixing coordinates is what linear maps do: each output is a fixed combination of $t$ and $x$ ($1\cdot t + 0\cdot x$ and $-v\,t + 1\cdot x$), with nothing added on, squared or multiplied together.`,
        2: t`A rotation would change the time coordinate too. $G$ leaves $t$ alone and slides each instant’s line of points along $x$ by $vt$: a shear.`,
        3: t`Linear maps send straight lines to straight lines: the worldline $x = x_0 + ut$ becomes $x' = x_0 + (u - v)t$, still straight.`,
      },
      hints: [t`Is each output a fixed combination of $t$ and $x$?`, t`Apply $G$ to the worldline $x = x_0 + ut$ of a body moving at constant speed $u$.`],
      teach: 'A change of inertial frame is a linear map of spacetime: Galileo’s is a shear; Einstein’s Lorentz boost is linear too, but it is not a shear.',
      explain: t`$G$ has matrix $\begin{bmatrix} 1 & 0 \\ -v & 1 \end{bmatrix}$ acting on $(t, x)$: a shear that leaves $t$ alone. A worldline $x = x_0 + ut$ maps to $x' = x_0 + (u - v)t$ — straight, with speed $u - v$. Galileo’s rule is only the low-speed limit: special relativity replaces it with the Lorentz boost, which is also linear but changes $t$ as well (the Road to Einstein, step 2).`,
      visual: map2d([[1, 0], [-1, 1]], { view: 2.2, shape: 'square', colNames: ['G(1, 0)', 'G(0, 1)'], caption: 'Galileo’s map with v = 1, time t along the horizontal axis and position x up. The faint square is before, the blue one after.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-superpose', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const [u, v] = r.pick(PAIRS), Tu = [r.int(-3, 3), r.int(-3, 3)], Tv = [r.int(-3, 3), r.int(-3, 3)];
          const a = r.intExcept(-2, 3, [0]), b = r.intExcept(-2, 2, [0]), c = r.int(0, 1);
          const w = [a * u[0] + b * v[0], a * u[1] + b * v[1]], ans = a * Tu[c] + b * Tv[c];
          const naive = w[0] * Tu[c] + w[1] * Tv[c];
          if (Tu.every((z) => z === 0) || Tv.every((z) => z === 0) || ans === 0 || Math.max(...w.map(Math.abs)) > 6) continue;
          return {
            prompt: t`A linear map $T$ sends $\mathbf u = ${tupleTeX(u)}$ to $${tupleTeX(Tu)}$ and $\mathbf v = ${tupleTeX(v)}$ to $${tupleTeX(Tv)}$. What is the ${c ? 'second' : 'first'} component of $T(\mathbf w)$ for $\mathbf w = ${tupleTeX(w)}$?`,
            answer: ans, tol: { rel: 0, abs: 0.01 },
            errors: naive !== ans ? [{ value: naive, feedback: t`That treats $\mathbf u$ and $\mathbf v$ as if they were $\mathbf e_1$ and $\mathbf e_2$. First write $\mathbf w = c\mathbf u + d\mathbf v$.` }] : [],
            hints: [t`Solve $c\mathbf u + d\mathbf v = \mathbf w$ for the weights first.`, t`Then $T(\mathbf w) = c\,T(\mathbf u) + d\,T(\mathbf v)$.`],
            teach: 'To transform any vector, write it as a combination of vectors whose images you know, then combine the images with the same weights.',
            explain: t`$\mathbf w = ${comb(a, b)}$, so $T(\mathbf w) = ${comb(a, b, tupleTeX(Tu), tupleTeX(Tv))} = ${tupleTeX([a * Tu[0] + b * Tv[0], a * Tu[1] + b * Tv[1]])}$.`,
            visual: arrows2([
              { to: u, color: 'accent', label: 'u', labelDx: 6, labelDy: -8 }, { to: v, color: 'accent', label: 'v', labelDx: 6, labelDy: 10 },
              { to: w, color: 'ink2', width: 2.6, label: 'w', labelDx: 6, labelDy: -8 },
            ], { caption: 'The vectors u and v whose images are given, and w. Its image is what you are finding.' }),
          };
        }
        return { prompt: t`$T(1, 1) = (1, 0)$, $T(1, -1) = (0, 1)$. First component of $T(2, 0)$?`, answer: 1, hints: ['(2, 0) = u + v.'], teach: 'Superposition.', explain: 'T(u) + T(v) = (1, 1).' };
      },
    }),
    mcq({
      id: 'cp-same-image', difficulty: 2,
      prompt: t`A linear map $T$ sends two different vectors $\mathbf u \ne \mathbf v$ to the same point: $T(\mathbf u) = T(\mathbf v)$. Which must also be true?`,
      choices: [t`$T(\mathbf u - \mathbf v) = \mathbf 0$`, t`$T(\mathbf u) = \mathbf 0$`, t`$T(\mathbf u + \mathbf v) = \mathbf 0$`, t`$\mathbf u = -\mathbf v$`],
      answer: 0,
      why: {
        1: t`$T(\mathbf u)$ can be anything — the picture’s projection sends $\mathbf u$ and $\mathbf v$ to $(2, 0)$, not to $\mathbf 0$.`,
        2: t`$T(\mathbf u + \mathbf v) = T(\mathbf u) + T(\mathbf v) = 2T(\mathbf u)$, which is $\mathbf 0$ only if $T(\mathbf u)$ is.`,
        3: t`Nothing forces that: in the picture $\mathbf u = (2, 1)$ and $\mathbf v = (2, -1)$.`,
      },
      hints: ['Subtract the two equal images and use linearity.'],
      teach: 'If a linear map sends two different vectors to the same place, it sends their difference to 0 — the start of the idea of a kernel (LA-4.3).',
      explain: t`$T(\mathbf u - \mathbf v) = T(\mathbf u) - T(\mathbf v) = \mathbf 0$. So a linear map that is not one-to-one always squashes some nonzero vector to $\mathbf 0$ — here $\mathbf u - \mathbf v = (0, 2)$, a vertical arrow, which the projection flattens to nothing. The vectors $T$ sends to $\mathbf 0$ form its **kernel** (LA-4.3).`,
      visual: arrows2([
        { to: [2, 1], color: 'accent', label: 'u', labelDx: 6, labelDy: -8 },
        { to: [2, -1], color: 'accent', label: 'v', labelDx: 6, labelDy: 10 },
        { from: [2, 1], to: [2, 0.12], color: 'ink3', dash: true, width: 1.3 },
        { from: [2, -1], to: [2, -0.12], color: 'ink3', dash: true, width: 1.3 },
      ], { points: [{ x: 2, y: 0, color: 'gold', r: 6, label: 'T(u) = T(v)', labelDx: 10, labelDy: -10 }], x: [-1, 5], y: [-1.8, 1.8], caption: 'An example: projection onto the x-axis sends u = (2, 1) and v = (2, −1) to the same point (gold).' }),
    }),
    num({
      id: 'cp-sensor', difficulty: 3, transfer: true,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const p = [r.float(1.0, 3.0, 0.1), r.float(0.2, 1.5, 0.1)], q = [r.float(-1.5, 1.5, 0.1), r.float(1.0, 3.0, 0.1)];
          const Fx = r.pick([-20, -10, 10, 20, 30, 40]), Fy = r.pick([-30, -20, -10, 10, 20, 30]), ch = r.int(0, 1);
          const c1 = (Fx + Fy) / 20, c2 = (Fx - Fy) / 20;
          if (c1 === 0 || c2 === 0) continue;
          const ans = c1 * p[ch] + c2 * q[ch], naive = (Fx / 10) * p[ch] + (Fy / 10) * q[ch];
          if (Math.abs(ans) < 0.15 || Math.abs(naive - ans) < 0.05) continue;
          return {
            prompt: t`A two-axis force sensor on a thrust stand produces two voltages, linear in the in-plane load. Calibrating it, the load $\mathbf F_1 = (10, 10)$ N gives readings $${dec(p)}$ mV and $\mathbf F_2 = (10, -10)$ N gives $${dec(q)}$ mV. What does channel ${ch + 1} read under the load $\mathbf F = (${Fx}, ${Fy})$ N, in mV?`,
            answer: ans, units: 'mV', tol: { rel: 0.005, abs: 0.005 },
            errors: [{ value: naive, feedback: t`The calibration loads are not along the axes. Write $\mathbf F = c_1\mathbf F_1 + c_2\mathbf F_2$ first.` }],
            hints: [t`Write $\mathbf F = c_1\mathbf F_1 + c_2\mathbf F_2$: $10c_1 + 10c_2 = ${Fx}$ and $10c_1 - 10c_2 = ${Fy}$.`, t`So $c_1 = ${nice(c1)}$ and $c_2 = ${nice(c2)}$; the reading is $c_1$ times the first calibration reading plus $c_2$ times the second.`],
            teach: 'A linear instrument is calibrated by superposition: measure its response to a few independent inputs, then combine those responses with the input’s weights.',
            explain: t`$\mathbf F = ${nice(c1)}\,\mathbf F_1 + (${nice(c2)})\,\mathbf F_2$, so channel ${ch + 1} reads $${nice(c1)}(${p[ch]}) + (${nice(c2)})(${q[ch]}) = ${nice(ans, 4)}$ mV. This assumes the sensor is linear (good strain-gauge load cells are, to about 0.1% of full scale) and that its zero offset has been subtracted — an offset would make the raw readings affine, $A\mathbf F + \mathbf b$, not linear.`,
            visual: arrows2([
              { to: [1, 1], color: 'accent', label: 'F₁', labelDx: 6, labelDy: -8 },
              { to: [1, -1], color: 'accent', label: 'F₂', labelDx: 6, labelDy: 10 },
              { to: [Fx / 10, Fy / 10], color: 'gold', width: 2.6, label: 'F', labelDx: 6, labelDy: -8 },
            ], { caption: 'The two calibration loads and the new load, in the sensor’s plane, in units of 10 N.' }),
          };
        }
        return { prompt: t`Calibration: $(10, 10)$ N reads $(2, 1)$ mV and $(10, -10)$ N reads $(0, 2)$ mV. Channel 1 under $(20, 0)$ N?`, answer: 2, units: 'mV', hints: ['F = F₁ + F₂.'], teach: 'Superposition.', explain: '2 + 0 = 2 mV.' };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §8.1', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Lay, Lay & McDonald, Linear Algebra and Its Applications (6th ed.), §1.8–1.9', url: 'https://www.pearson.com/en-us/subject-catalog/p/linear-algebra-and-its-applications/P200000006235/9780135851203' },
  ],
});
