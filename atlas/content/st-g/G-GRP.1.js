// Groups, subgroups and homomorphisms. The symmetries of an equilateral
// triangle, D₃ (≅ S₃), as the running example: six elements, composition in
// either order (non-abelian: f∘r = r²∘f), the rotation subgroup C₃, Lagrange's
// theorem, and the orientation homomorphism D₃ → {±1} — which is the
// determinant of the 2 × 2 matrices, as det: O(1,3) → {±1} will be for the
// Lorentz group. Kernels (SL(2, ℝ); θ ↦ R(kθ) with kernel 2πℤ/k, the shape
// of SU(2) → SO(3)); which sets are groups (boosts in different directions
// are not). Transfers: counting a satellite's rotational symmetries by
// orbit–stabilizer, and parity as an improper map.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_sg3.js';

const t = String.raw;
const NAMES = ['e', 'r', 'r²', 'f', 'rf', 'r²f'];

// angle of vertex k (0, 1, 2) after the element with index e (0–5): e = a + 3b means r^a f^b (f first)
const act = (th, e) => `((1 - 2*floor((${e})/3))*(${th}) + floor((${e})/3)*pi + 2*pi*((${e}) - 3*floor((${e})/3))/3)`;
const V0 = [0, 1, 2].map((k) => `(pi/2 + ${r6((2 * Math.PI * k) / 3)})`);
const triangleCurves = [0, 1, 2].map((k) => {
  const a = Math.PI / 2 + (2 * Math.PI * k) / 3, b = a + (2 * Math.PI) / 3;
  return { param: [`${r6(Math.cos(a))} + t*${r6(Math.cos(b) - Math.cos(a))}`, `${r6(Math.sin(a))} + t*${r6(Math.sin(b) - Math.sin(a))}`], t: [0, 1], color: 'ink3', width: 2 };
});
const axes = [0, 1, 2].map((k) => {
  const a = Math.PI / 2 + (2 * Math.PI * k) / 3;
  return { param: [`t*${r6(Math.cos(a))}`, `t*${r6(Math.sin(a))}`], t: [-0.75, 1.25], color: 'ink4', dash: true, width: 1 };
});
const COLORS = ['accent', 'gold', 'teal'];
// the triangle after applying `first` and then `second` (index expressions or numbers)
const triangle = (first, second, extra = {}) => ({
  x: [-2.6, 2.6], y: [-1.15, 1.45], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false,
  curves: [...axes, ...triangleCurves],
  points: [0, 1, 2].map((k) => {
    const th = second == null ? act(V0[k], first) : act(act(V0[k], first), second);
    return { x: `1.0*cos(${th})`, y: `1.0*sin(${th})`, r: 7, color: COLORS[k], label: String(k + 1), labelDx: 10, labelDy: -6 };
  }),
  ...extra,
});

// a regular n-gon with an arrow from vertex 0 to vertex k
const polygon = (n, k) => {
  const P = (i) => [Math.cos(Math.PI / 2 + (2 * Math.PI * i) / n), Math.sin(Math.PI / 2 + (2 * Math.PI * i) / n)].map(r6);
  const curves = Array.from({ length: n }, (_, i) => { const [a, b] = [P(i), P(i + 1)]; return { param: [`${a[0]} + t*${r6(b[0] - a[0])}`, `${a[1]} + t*${r6(b[1] - a[1])}`], t: [0, 1], color: 'ink3', width: 2 }; });
  curves.push({ param: ['0.45*cos(pi/2 + t)', '0.45*sin(pi/2 + t)'], t: [0, r6((2 * Math.PI * k) / n)], color: 'gold', width: 2.2 });
  return { x: [-2.4, 2.4], y: [-1.2, 1.2], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves, points: [{ x: P(0)[0], y: P(0)[1], r: 6, color: 'accent', label: 'start' }, { x: P(k)[0], y: P(k)[1], r: 6, color: 'gold', hollow: true, label: 'after one turn', labelDx: -40, labelDy: -12 }] };
};

// edges of a box with half-sides a, b, c, or of a regular n-prism, or a tetrahedron
const boxEdges = (a, b, c) => {
  const s = [];
  for (const [i, j] of [[0, 1], [1, 2], [0, 2]]) for (const u of [-1, 1]) for (const v of [-1, 1]) {
    const k = 3 - i - j, h = [a, b, c], p = [0, 0, 0], q = [0, 0, 0];
    p[i] = q[i] = u * h[i]; p[j] = q[j] = v * h[j]; p[k] = -h[k]; q[k] = h[k];
    s.push({ from: p, to: q, color: 'accent' });
  }
  return s;
};
const prismEdges = (n) => {
  const P = (i, z) => [r6(1.2 * Math.cos((2 * Math.PI * i) / n)), r6(1.2 * Math.sin((2 * Math.PI * i) / n)), z];
  return Array.from({ length: n }, (_, i) => [{ from: P(i, -0.6), to: P(i + 1, -0.6) }, { from: P(i, 0.6), to: P(i + 1, 0.6) }, { from: P(i, -0.6), to: P(i, 0.6) }]).flat().map((e) => ({ ...e, color: 'accent' }));
};
const tetraEdges = () => {
  const v = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
  const s = [];
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) s.push({ from: v[i], to: v[j], color: 'accent' });
  return s;
};

const ELEMENT_CHOICE = (key, label, value) => ({ key, label, value, options: NAMES.map((n, i) => [i, n]), explain: 'r turns the triangle 120° anticlockwise; f reflects it in the vertical axis; rf means f first, then r.' });

export default lesson({
  id: 'st-g.G-GRP.1',
  title: 'Groups, subgroups and homomorphisms',
  minutes: 13, difficulty: 2,
  intro: t`A **group** is a set $G$ with a composition $g\circ h$ that is associative, has an identity $e$, and gives every element an inverse. The symmetries of anything — a triangle, a crystal, spacetime — form a group, because undoing and combining symmetries are symmetries again. A **subgroup** is a subset that is a group by itself. A **homomorphism** is a map between groups that respects composition:

$$\varphi(g\circ h) = \varphi(g)\,\varphi(h), \qquad \ker\varphi = \{g : \varphi(g) = e\}$$

The kernel is always a subgroup. **Lagrange’s theorem**: the order (number of elements) of a subgroup of a finite group divides the order of the group. The running example is the six symmetries of an equilateral triangle, $D_3$.`,
  symbols: [
    { tex: 'G', text: 'a group: a set with an associative composition, an identity and inverses' },
    { tex: 'g\\circ h', text: t`composition: do $h$ first, then $g$ (like functions)` },
    { tex: 'e', text: t`the identity element: $e\circ g = g\circ e = g$` },
    { tex: '\\varphi', text: 'a homomorphism: a map between groups that turns composition into composition' },
    { tex: '\\ker\\varphi', text: 'the kernel: everything sent to the identity' },
    { tex: 'r, f', text: t`in $D_3$: the rotation by $120^\circ$ anticlockwise, and the reflection in the vertical axis` },
  ],
  why: 'The Lorentz and Poincaré groups are the symmetries special relativity is built on, and a homomorphism — SU(2) → SO(3), SL(2,ℂ) → SO⁺(1,3) — is how spinors get into general relativity.',
  visual: {
    type: 'graph',
    title: 'Composing symmetries of a triangle',
    lead: t`The numbered dots show where the triangle’s corners end up after applying $h$ and then $g$: the picture is $g\circ h$. The dashed lines are the three mirror axes. $r$ turns $120^\circ$ anticlockwise, $f$ reflects in the vertical axis, and $rf$ means $f$ first, then $r$.`,
    tasks: [
      t`Set $h = f$, $g = r$, and then swap them ($h = r$, $g = f$): the corners land differently. $r\circ f \ne f\circ r$ — the group is **non-abelian**, like 3D rotations and the Lorentz group.`,
      t`Set $g = h = r$: you get $r^2$. Every reflection composed with itself gives $e$: each reflection is its own inverse.`,
      t`Compose any two rotations: you always get a rotation. $\{e, r, r^2\}$ is a subgroup. Compose two reflections: also a rotation — reflections alone are *not* a subgroup.`,
    ],
    params: triangle('h', 'g', { choices: [ELEMENT_CHOICE('h', t`First $h$`, 3), ELEMENT_CHOICE('g', t`Then $g$`, 1)] }),
    caption: 'Exact positions; the colours and numbers only track which corner went where.',
  },
  example: {
    prompt: t`In $D_3$, show that $f\circ r = r^2\circ f$, that the rotations $\{e, r, r^2\}$ form a subgroup, and that “rotation $\mapsto +1$, reflection $\mapsto -1$” is a homomorphism $D_3 \to \{+1, -1\}$ with that subgroup as its kernel.`,
    visual: { type: 'graph', params: triangle(1, 3), caption: t`$f\circ r$: first $r$, then $f$. Corner 1 lands bottom right, where $r^2\circ f$ also sends it.` },
    steps: [
      { label: 'Track angles', text: t`Label points by angle $\theta$ round the centre. $r$: $\theta \mapsto \theta + 120^\circ$; $f$: $\theta \mapsto 180^\circ - \theta$.` },
      { label: 'Compose', text: t`$f\circ r$: $\theta \mapsto 180^\circ - (\theta + 120^\circ) = 60^\circ - \theta$. And $r^2\circ f$: $\theta \mapsto (180^\circ - \theta) + 240^\circ$, $= 420^\circ - \theta \equiv 60^\circ - \theta$. Equal: $f\circ r = r^2\circ f = r^{-1}\circ f$.` },
      { label: 'Subgroup', text: t`Rotations compose to rotations ($r^a\circ r^b = r^{a+b}$, exponents mod 3), contain $e = r^0$, and $r^{-1} = r^2$. So $C_3 = \{e, r, r^2\}$ is a subgroup, of order $3$, which divides $6$ as Lagrange says.` },
      { label: 'Homomorphism', text: t`$\varphi$ counts reflections mod 2: an element is $r^af^b$ and $\varphi = (-1)^b$. Composing adds the $b$’s (a reflection reverses handedness, two restore it), so $\varphi(g\circ h) = \varphi(g)\varphi(h)$. In matrices, $\varphi$ is the determinant: $\det R = +1$, $\det F = -1$.` },
      { label: 'Kernel', text: t`$\ker\varphi$ = the elements with $b = 0$ = the rotations. A kernel is always a subgroup, and here it has index $2$ — exactly how the proper Lorentz transformations sit inside the full Lorentz group, as the kernel of $\det$.` },
    ],
    answer: t`$f\circ r = r^2\circ f$ (so $D_3$ is non-abelian); $C_3 = \{e, r, r^2\}$ is a subgroup; and $\varphi = \det = (-1)^{\#\text{reflections}}$ is a homomorphism onto $\{\pm1\}$ with kernel $C_3$.`,
  },
  practice: [
    mcq({
      id: 'compose', difficulty: 2,
      prompt: t`In $D_3$, which element is $r\circ f$ (first reflect in the vertical axis, then turn $120^\circ$ anticlockwise)?`,
      visual: { type: 'graph', params: triangle(0, null, { arrows: [{ from: [0.42, 0.72], to: [-0.42, 0.72], color: 'gold', width: 2, label: 'r', labelDx: -14 }] }), caption: 'The triangle at the start; f reflects in the vertical dashed axis (through corner 1), and r turns it anticlockwise.' },
      choices: ['The reflection that fixes corner 3', 'The reflection that fixes corner 2', t`The rotation $r^2$`, t`The reflection $f$ itself, which fixes corner 1`],
      answer: 0,
      why: {
        1: t`That is $f\circ r$, the other order. In $r\circ f$, $f$ acts first and swaps corners 2 and 3.`,
        2: 'A reflection followed by a rotation reverses handedness once, so the result is a reflection, not a rotation.',
        3: t`Corner 1 does not stay put: $f$ leaves it at the top, then $r$ carries it to the bottom left.`,
      },
      hints: ['Follow each corner: where does f put it, and where does r then take it?', t`$f$ fixes 1 and swaps 2 and 3. Then $r$ moves top → bottom left → bottom right → top.`],
      teach: t`Composition is read right to left, and in $D_3$ the order matters: $r\circ f$ and $f\circ r$ are different reflections.`,
      explain: t`$f$: $1 \to$ top, $2 \to$ bottom right, $3 \to$ bottom left. Then $r$: top → bottom left, bottom right → top, bottom left → bottom right. Corner 3 started bottom right and ends there: $r\circ f$ is the reflection in the axis through corner 3.`,
    }),
    num({
      id: 'order', difficulty: 2,
      gen(r) {
        const [n, k] = r.pick([[6, 2], [6, 4], [8, 2], [8, 6], [10, 4], [12, 8], [12, 9], [9, 6], [10, 5], [12, 3]]);
        const g = (a, b) => (b ? g(b, a % b) : a);
        const ans = n / g(n, k);
        return {
          prompt: t`A regular ${n}-gon’s rotations form the group $C_{${n}}$ of order $${n}$. What is the order of the rotation by $${(360 * k) / n}^\circ$ — the number of times you must apply it to get back to the identity?`,
          visual: { type: 'graph', params: polygon(n, k), caption: t`The ${n}-gon and one application of the rotation by $${(360 * k) / n}^\circ$ (gold arc).` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n, feedback: t`That is the order of the whole group. This rotation returns sooner: after $m$ turns it has gone round $${k}m/${n}$ full circles.` }, { value: k, feedback: 'That is how many vertices one turn moves. The order is how many turns bring you home.' }].filter((e) => e.value !== ans),
          hints: [t`After $m$ applications the total angle is $${(360 * k) / n}m$ degrees; you need a multiple of $360$.`, t`The answer is $${n}/\gcd(${n}, ${k})$, and by Lagrange it divides $${n}$.`],
          teach: 'The powers of one element form a cyclic subgroup, so its order divides the order of the group (Lagrange).',
          explain: t`$${ans}$ turns of $${(360 * k) / n}^\circ$ make $${(360 * k * ans) / n}^\circ$, the first multiple of $360^\circ$. The rotations it generates form a subgroup of order $${ans}$, which divides $${n}$.`,
        };
      },
    }),
    multi({
      id: 'is-group', difficulty: 3,
      prompt: 'Which of these are groups?',
      choices: [t`The integers under addition, $(\mathbb Z, +)$`, t`The nonzero reals under multiplication`, t`Lorentz boosts along the $x$-axis only, under composition`, t`The natural numbers $\{0, 1, 2, \dots\}$ under addition`, t`All real $2\times2$ matrices under multiplication`, t`All pure Lorentz boosts, in every direction, under composition`],
      answer: [0, 1, 2],
      why: {
        3: t`No inverses: nothing added to $3$ gives $0$.`,
        4: t`A matrix with $\det = 0$ has no inverse.`,
        5: t`Not closed: two boosts in different directions compose to a boost **times a rotation** (the Thomas–Wigner rotation). Pure boosts are not a subgroup.`,
      },
      hints: ['Check closure, the identity and inverses for each.', t`For boosts: collinear ones add rapidities, $\tanh(w_1 + w_2)$. What about a boost along $x$ followed by one along $y$?`],
      teach: 'A subset of a group is a subgroup only if it is closed under composition and inverses — boosts along one line are, boosts in all directions are not.',
      explain: t`$\mathbb Z$, $\mathbb R^\times$ and collinear boosts (isomorphic to $(\mathbb R, +)$ through the rapidity) are groups. Non-collinear boosts generate rotations, which is why the Lorentz group must include rotations — see [the Lorentz algebra](#/lesson/st-g.G-LIEA.3).`,
    }),
    mcq({
      id: 'kernel-det', difficulty: 2,
      prompt: t`$\det: GL(2, \mathbb R) \to \mathbb R^\times$ (invertible matrices to nonzero numbers) is a homomorphism, since $\det(AB) = \det A\det B$. What is its kernel?`,
      visual: { type: 'la-map2d', params: { A: [[1, 1.5], [0, 1]], readout: ['A'], view: 2.5 }, caption: 'A shear: it slides the grid sideways without changing any area.' },
      choices: [t`$SL(2, \mathbb R)$: the matrices with $\det = 1$, which preserve area and orientation`, t`The matrices with $\det = 0$`, t`The orthogonal matrices, $A^\top A = I$`, t`Only the identity matrix`],
      answer: 0,
      why: {
        1: t`Those are not in $GL(2, \mathbb R)$ at all, and $0$ is not the identity of $\mathbb R^\times$: that is $1$.`,
        2: t`Orthogonal matrices have $\det = \pm1$; the reflections among them are not in the kernel, and shears with $\det 1$ are in it without being orthogonal.`,
        3: t`The shear in the picture has $\det = 1 \cdot 1 - 1.5 \cdot 0 = 1$ and is not the identity.`,
      },
      hints: [t`The identity of the target group $(\mathbb R^\times, \cdot)$ is $1$.`, t`The kernel is $\{A : \det A = 1\}$.`],
      teach: 'The kernel of a homomorphism is everything sent to the identity of the target; for det that is the area- and orientation-preserving matrices.',
      explain: t`$\ker\det = SL(2, \mathbb R)$, a subgroup of $GL$ (indeed a normal one). The same move defines $SO(3) \subset O(3)$ and the proper Lorentz group inside $O(1, 3)$.`,
    }),
    multi({
      id: 'lagrange', difficulty: 2,
      prompt: t`The rotations of a cube form a group of order $24$. Which of these could be the order of a subgroup?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, segments: boxEdges(1, 1, 1), yaw: 0.55, pitch: 0.45 }, caption: 'A cube; its 24 rotational symmetries permute its faces, edges and corners.' },
      choices: ['8', '12', '5', '9', '16'],
      answer: [0, 1],
      why: { 2: '5 does not divide 24.', 3: '9 does not divide 24 (24/9 is not a whole number).', 4: '16 does not divide 24.' },
      hints: ['By Lagrange’s theorem the order of a subgroup divides the order of the group.', 'The divisors of 24 are 1, 2, 3, 4, 6, 8, 12, 24.'],
      teach: 'Lagrange’s theorem: a subgroup’s order divides the group’s order, because its cosets cut the group into equal pieces.',
      explain: 'Both happen: the 8 rotations keeping one pair of opposite faces in place (as a pair) form a subgroup, and the 12 rotations of the tetrahedron inscribed in the cube another. (The converse of Lagrange fails in general, so a divisor is necessary, not sufficient.)',
    }),
    num({
      id: 'kernel-angle', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, 4, 5, 6, 8]);
        const ans = 360 / k;
        return {
          prompt: t`The map $\varphi(\theta) = R(${k}\theta)$, sending an angle $\theta$ in $(\mathbb R, +)$ to the rotation of the plane by $${k}\theta$, is a homomorphism. Its kernel is all $\theta$ with $R(${k}\theta) = I$. What is the smallest positive angle in the kernel, in degrees?`,
          visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.2, 1.2], equal: true, aspect: 'wide', xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4 }], sliders: [{ key: 'th', label: t`Input angle $\theta$`, min: 0, max: 360, step: 5, value: 20, unit: '^\\circ', explain: t`An element of $(\mathbb R, +)$; the arrow shows its image, the rotation by $${k}\theta$.` }], arrows: [{ from: [0, 0], to: [`cos(${k}*th*pi/180)`, `sin(${k}*th*pi/180)`], color: 'gold', width: 2.4, label: `R(${k}θ) e₁` }] }, caption: t`The image of $\theta$ shown by where it sends the unit vector $e_1$. Find the inputs that send it home.` },
          answer: ans, units: 'deg', tol: { rel: 0.001 },
          errors: [{ value: 360, feedback: t`At $360^\circ$ the image is the identity, but it already was earlier: $${k}\theta$ needs to be a multiple of $360^\circ$.` }, { value: 360 * k, feedback: 'You multiplied by k; the rotation is by kθ, so θ needs to be 360°/k.' }],
          hints: [t`$R(${k}\theta) = I$ when $${k}\theta$ is a whole multiple of $360^\circ$.`, t`The kernel is $\{0, \pm\tfrac{360^\circ}{${k}}, \pm\tfrac{720^\circ}{${k}}, \dots\}$.`],
          teach: 'A homomorphism with kernel K is many-to-one: inputs differing by an element of K have the same image.',
          explain: t`$\theta = 360^\circ/${k} = ${nice(ans)}^\circ$. Every rotation then has exactly ${k} preimages in each $360^\circ$ — a ${k}-to-one map. ${k === 2 ? 'With k = 2 this is the shape of SU(2) → SO(3): a two-to-one homomorphism whose kernel is {±1}.' : 'The two-to-one case, k = 2, is the shape of SU(2) → SO(3), with kernel {±1}.'}`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-satellite', difficulty: 3, transfer: true,
      gen(r) {
        const [what, edges, ans, how] = r.pick([
          ['a cube-shaped satellite bus', boxEdges(1, 1, 1), 24, 'any of 6 faces on top, then 4 turns'],
          ['a square-prism bus, longer than it is wide', boxEdges(0.7, 0.7, 1.4), 8, 'either end face on top, then 4 turns'],
          ['a hexagonal-prism bus', prismEdges(6), 12, 'either hexagonal end on top, then 6 turns'],
          ['a triangular-prism bus', prismEdges(3), 6, 'either triangular end on top, then 3 turns'],
          ['a regular-tetrahedron probe', tetraEdges(), 12, 'any of 4 faces at the bottom, then 3 turns'],
        ]);
        return {
          prompt: t`An attitude-control engineer counts how many rotations bring ${what} back onto its own outline (sensors and markings ignored). Use orbit–stabilizer: the size of the group is (the number of places a face can be carried to) $\times$ (the number of rotations that keep that face in place). How many rotations are there, the identity included?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.8, segments: edges, yaw: 0.55, pitch: 0.45 }, caption: 'The body’s outline; reflections are not rotations and are not counted.' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 2 * ans, feedback: 'That counts reflections too. A spacecraft can only be rotated, not mirrored.' }, { value: ans / 2, feedback: 'Count every face in the orbit: each can be brought to the reference position, in each of its stabilizer’s turns.' }],
          hints: ['Pick a face. How many faces can a rotation carry it to (its orbit)? How many rotations keep it in place (its stabilizer)?', `Here: ${how}.`],
          teach: 'Orbit–stabilizer: the size of a symmetry group is the number of places one feature can go times the number of symmetries fixing it.',
          explain: t`${how}: $${ans}$ rotations. The same count for the round sphere gives infinitely many — a continuous group, $SO(3)$, the subject of [matrix groups](#/lesson/st-g.G-LIEG.1).`,
        };
      },
    }),
    mcq({
      id: 'cp-improper', difficulty: 2,
      prompt: t`$\det$ is a homomorphism from the Lorentz group $O(1, 3)$ to $\{+1, -1\}$. Parity $P$ (flip all three space axes) has $\det P = -1$, time reversal $T$ has $\det T = -1$. What follows for $PT$?`,
      visual: { type: 'la-map2d', params: { A: [[-1, 0], [0, 1]], readout: ['A', 'det'], view: 2.5 }, caption: t`A reflection in one plane (here $x \to -x$): the “F” comes out mirrored. A determinant of $-1$ is a change of handedness.` },
      choices: [t`$\det(PT) = \det P\det T = +1$, so $PT$ lies in the kernel: it is a proper transformation, though not a rotation or boost`, t`$\det(PT) = -2$`, t`$\det(PT) = -1$, since both are improper`, t`$PT$ is the identity, because two reflections cancel`],
      answer: 0,
      why: {
        1: 'A homomorphism multiplies, it does not add.',
        2: t`$(-1)(-1) = +1$: two improper maps compose to a proper one, like two reflections making a rotation.`,
        3: t`$PT$ sends every event $x^\mu$ to $-x^\mu$, which is not the identity. It has $\det +1$ but reverses time, so no continuous path of boosts and rotations reaches it.`,
      },
      hints: [t`A homomorphism satisfies $\det(PT) = \det(P)\det(T)$.`],
      teach: 'A homomorphism to {±1} splits a group into the kernel and the rest; composition multiplies the signs.',
      explain: t`$\det(PT) = +1$: $PT$ is proper ($x^\mu \mapsto -x^\mu$), yet it reverses time. That is why the Lorentz group has *four* pieces, not two — [the four pieces of the Lorentz group](#/lesson/st-g.G-LIEG.2) sorts them by $\det$ and by the sign of $\Lambda^0{}_0$.`,
    }),
  ],
  sources: [
    { label: 'Armstrong, Groups and Symmetry (Springer, 1988), chs. 1–11', url: 'https://doi.org/10.1007/978-1-4757-4034-9' },
    { label: 'Tung, Group Theory in Physics (World Scientific, 1985), ch. 2', url: 'https://doi.org/10.1142/0097' },
  ],
});
