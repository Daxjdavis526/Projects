// The cross product: a vector perpendicular to two others, as long as the parallelogram they span.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { vectorPicture } from './_vectors.js';

const t = String.raw;
const DEG = Math.PI / 180;
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.sqrt(dot(a, a));
const vecTeX = (v) => `(${v.join(',\\ ')})`;
const r4 = (v) => +v.toFixed(4);

// Explore: A = a x̂; B has length b at angle th from A, tilted out of the floor by phi; `swap` gives B × A
const B3 = ['b*cos(th*pi/180)', 'b*sin(th*pi/180)*cos(phi*pi/180)', 'b*sin(th*pi/180)*sin(phi*pi/180)'];
const SGN = '(1 - 2*swap)';
const C3 = ['0', `-${SGN}*a*${B3[2]}`, `${SGN}*a*${B3[1]}`];
// the right-hand sweep: an arc from A toward B in their plane, drawn as short segments
const ARC_R = 0.7, ARC_N = 10;
const arcPt = (u) => [`${ARC_R}*cos(${u}*th*pi/180)`, `${ARC_R}*sin(${u}*th*pi/180)*cos(phi*pi/180)`, `${ARC_R}*sin(${u}*th*pi/180)*sin(phi*pi/180)`];
const ARC = Array.from({ length: ARC_N - 1 }, (_, k) => ({ from: arcPt(k / ARC_N), to: arcPt((k + 1) / ARC_N), color: 'gold', width: 2 }));

// a fixed 3D picture: A, B, their parallelogram and A × B (shrunk if long, and said so)
function crossScene(A, B, { la = '\\vec A', lb = '\\vec B', lc = '\\vec A\\times\\vec B', showC = true, caption } = {}) {
  const C = cross(A, B), m = Math.max(len(A), len(B));
  const s = m > 2.8 ? 2.8 / m : 1;
  const a = A.map((c) => r4(c * s)), b = B.map((c) => r4(c * s));
  const k = len(C) * s * s > 3 ? 3 / (len(C) * s * s) : 1;
  const c = C.map((x) => r4(x * s * s * k));
  return {
    type: 'calc-vectors3d',
    params: {
      range: 3, aspect: 'wide',
      parallelograms: [{ at: [0, 0, 0], u: a, v: b, color: 'gold', alpha: 0.25 }],
      vectors: [{ to: a, color: 'accent', label: la }, { to: b, color: 'violet', label: lb }, ...(showC ? [{ to: c, color: 'bad', label: lc }] : [])],
    },
    caption: caption ?? `Drag to rotate.${s < 1 ? ' A and B are drawn at reduced scale.' : ''}${showC && k < 1 ? ' A × B is drawn shorter than its true length so it fits.' : ''}`,
  };
}

// the worked example
const EXA = [2, 1, 0], EXB = [-1, 3, 2], EXC = cross(EXA, EXB);

export default lesson({
  id: 'phys2210.M2.5',
  title: 'The cross product',
  minutes: 10, difficulty: 3,
  intro: t`The **cross product** of two vectors is a third vector, perpendicular to both of them. Its length is the area of the parallelogram the two span, and its direction comes from the **right-hand rule**: curl the fingers of your right hand from $\vec A$ toward $\vec B$, and your thumb points along $\vec A\times\vec B$.

$$|\vec A\times\vec B| = AB\sin\theta, \qquad \vec A\times\vec B = (A_yB_z - A_zB_y)\,\hat\imath + (A_zB_x - A_xB_z)\,\hat\jmath + (A_xB_y - A_yB_x)\,\hat k$$

**Order matters**: $\vec B\times\vec A = -\vec A\times\vec B$. Torque, angular momentum and the magnetic force on a moving charge are all cross products.`,
  symbols: [
    { tex: '\\vec A\\times\\vec B', text: '“A cross B”: a vector perpendicular to both. Its units are the product of theirs — N·m for a lever arm crossed with a force' },
    { tex: '\\theta', text: 'the angle between $\\vec A$ and $\\vec B$, tail to tail, from 0° to 180°' },
    { tex: 'AB\\sin\\theta', text: 'the magnitude: the area of the parallelogram with sides $\\vec A$ and $\\vec B$ — zero for parallel vectors, largest ($AB$) at 90°' },
    { tex: 'A_yB_z - A_zB_y,\\ \\dots', text: 'the components: each one uses the *other* two axes, in the cyclic order $x \\to y \\to z \\to x$' },
    { tex: '\\hat\\imath\\times\\hat\\jmath = \\hat k', text: 'the pattern behind the right-hand rule: $\\hat\\jmath\\times\\hat k = \\hat\\imath$ and $\\hat k\\times\\hat\\imath = \\hat\\jmath$ too, and any vector crossed with itself is zero' },
  ],
  why: 'Torque and angular momentum (rotation, gyroscopes, reaction wheels), the magnetic force F = qv × B, and the normal vector to any surface — all start here.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Sweep A into B and watch your thumb',
    lead: t`$\vec A$ (blue) and $\vec B$ (violet) span the gold parallelogram. The red arrow is $\vec A\times\vec B$: perpendicular to both, with a length equal to the parallelogram’s area. The gold arc shows the sweep from $\vec A$ toward $\vec B$ — curl your right-hand fingers along it and your thumb points along the red arrow.`,
    tasks: [
      'Close the angle to 0°: the parallelogram flattens and A × B vanishes — parallel vectors have no cross product.',
      'Set θ = 90°: the area, and |A × B|, are as large as they can be, AB.',
      'Make θ negative, or reverse the order to B × A: the red arrow flips to the other side.',
      'Tilt B out of the floor with φ: A × B swings round, always perpendicular to the plane of A and B.',
    ],
    params: {
      range: 3,
      sliders: [
        { key: 'a', label: 'Length of $\\vec A$', min: 0.5, max: 2, step: 0.1, value: 2, explain: t`$\vec A$ lies along $x$.` },
        { key: 'b', label: 'Length of $\\vec B$', min: 0.5, max: 2, step: 0.1, value: 1.5, explain: t`$\vec B$ starts in the floor (the $xy$-plane).` },
        { key: 'th', label: 'Angle from $\\vec A$ to $\\vec B$, $\\theta$', min: -180, max: 180, step: 5, value: 60, unit: '^\\circ', explain: 'Positive: anticlockwise seen from above.' },
        { key: 'phi', label: 'Tilt of $\\vec B$ out of the floor, $\\varphi$', min: 0, max: 80, step: 5, value: 0, unit: '^\\circ', explain: 'Rotates the plane of A and B about the x-axis.' },
      ],
      toggles: [{ key: 'swap', label: 'Reverse the order: show $\\vec B\\times\\vec A$', value: false }],
      parallelograms: [{ at: [0, 0, 0], u: ['a', 0, 0], v: B3, color: 'gold', alpha: 0.25 }],
      segments: ARC,
      vectors: [
        { to: ['a', 0, 0], color: 'accent', label: '\\vec A' },
        { to: B3, color: 'violet', label: '\\vec B' },
        { from: arcPt((ARC_N - 1) / ARC_N), to: arcPt(1), color: 'gold', width: 2.2, when: '1 - swap' },
        { from: arcPt(1 / ARC_N), to: arcPt(0), color: 'gold', width: 2.2, when: 'swap' },
        { to: C3, color: 'bad', label: '\\vec A\\times\\vec B', when: '1 - swap' },
        { to: C3, color: 'bad', label: '\\vec B\\times\\vec A', when: 'swap' },
      ],
      readouts: [
        { label: 'area $= AB\\,|\\sin\\theta|$', expr: 'a*b*abs(sin(th*pi/180))', digits: 3 },
        { label: 'the red arrow', vec: C3, digits: 3 },
        { label: 'its length', expr: `sqrt((${C3[1]})^2 + (${C3[2]})^2)`, digits: 3 },
      ],
    },
    caption: 'Drag to rotate; arrow keys turn it too. Lengths are in arbitrary units; the red arrow’s length equals the gold area. With the order reversed, the sweep runs from B back to A and the arrow flips.',
  },
  example: {
    prompt: t`Find $\vec A\times\vec B$ for $\vec A = ${vecTeX(EXA)}$ and $\vec B = ${vecTeX(EXB)}$, and check that it is perpendicular to both.`,
    visual: crossScene(EXA, EXB, { caption: 'A, B, their parallelogram and A × B (red). To fit, A and B are drawn at three-quarters scale and A × B at about a third of its true length. Drag to rotate.' }),
    steps: [
      { label: 'The pattern', text: t`Each component uses the *other* two axes, in cyclic order: the $x$-component is $A_yB_z - A_zB_y$, then shift every letter one step round $x \to y \to z \to x$ to get the next.` },
      { label: 'Components', text: t`$x$: $(1)(2) - (0)(3) = ${EXC[0]}$. $y$: $(0)(-1) - (2)(2) = ${EXC[1]}$. $z$: $(2)(3) - (1)(-1) = ${EXC[2]}$. So $\vec A\times\vec B = ${vecTeX(EXC)}$.` },
      { label: 'Check: perpendicular to both', text: t`$\vec A\cdot(\vec A\times\vec B) = (2)(2) + (1)(-4) + (0)(7) = ${dot(EXA, EXC)}$ and $\vec B\cdot(\vec A\times\vec B) = (-1)(2) + (3)(-4) + (2)(7) = ${dot(EXB, EXC)}$. ✓ Both dot products vanish: the quickest check on any cross product.` },
      { label: 'Magnitude', text: t`$|\vec A\times\vec B| = \sqrt{2^2 + (-4)^2 + 7^2} = \sqrt{69} \approx ${fmt(len(EXC), 3)}$: the area of the parallelogram. As a cross-check, $AB\sin\theta$ with $A = \sqrt5$, $B = \sqrt{14}$ and $\cos\theta = \tfrac{\vec A\cdot\vec B}{AB} = \tfrac{1}{\sqrt{70}}$ also gives $\sqrt{69}$.` },
    ],
    answer: t`$\vec A\times\vec B = ${vecTeX(EXC)}$, of length $\sqrt{69} \approx ${fmt(len(EXC), 3)}$, perpendicular to both $\vec A$ and $\vec B$.`,
  },
  practice: [
    match({
      id: 'unit-crosses', difficulty: 1,
      prompt: 'Match each cross product of unit vectors to its result.',
      left: [t`$\hat\imath\times\hat\jmath$`, t`$\hat\jmath\times\hat k$`, t`$\hat k\times\hat\imath$`, t`$\hat\jmath\times\hat\imath$`, t`$\hat\imath\times\hat\imath$`],
      right: ['k̂', 'î', 'ĵ', '−k̂', '0 (the zero vector)', '−î', '1'],
      answer: [0, 1, 2, 3, 4],
      hints: ['Going round the cycle î → ĵ → k̂ → î gives a plus sign; going backwards gives a minus.', 'A vector crossed with itself spans no area at all.'],
      teach: 'î × ĵ = k̂, ĵ × k̂ = î, k̂ × î = ĵ; reversing the order flips the sign, and a vector crossed with itself is zero.',
      visual: {
        type: 'calc-vectors3d',
        params: { range: 1.6, aspect: 'wide', vectors: [{ to: [1, 0, 0], color: 'bad', label: '\\hat\\imath', width: 3.4 }, { to: [0, 1, 0], color: 'good', label: '\\hat\\jmath', width: 3.4 }, { to: [0, 0, 1], color: 'teal', label: '\\hat k', width: 3.4 }] },
        caption: 'The right-handed set of unit vectors: curl your fingers from î to ĵ and your thumb points along k̂. Drag to rotate.',
      },
      explain: 'Forwards round the cycle: î × ĵ = k̂, ĵ × k̂ = î, k̂ × î = ĵ. Backwards: ĵ × î = −k̂. And î × î = 0, because sin 0° = 0. (The decoy 1 is î · î, a dot product.)',
    }),
    num({
      id: 'cross-magnitude', difficulty: 1,
      gen(r) {
        const A = r.pick([2.5, 4, 6, 12]), B = r.pick([3, 5, 8]), a = r.pick([25, 30, 50, 70, 120, 150]);
        const m = A * B * Math.sin(a * DEG);
        return {
          prompt: t`Two vectors of lengths ${A} and ${B} make an angle of ${a}° with each other. What is the magnitude of their cross product?`,
          answer: m, tol: { rel: 0.005 },
          errors: [{ value: A * B * Math.cos(a * DEG), feedback: 'That is the dot product, AB cos θ. The cross product’s size uses the sine.' }, { value: A * B, feedback: 'AB is the largest possible value, reached only at 90°. Include sin θ.' }],
          hints: [t`$|\vec A\times\vec B| = AB\sin\theta$.`],
          teach: 'The cross product’s magnitude is AB sin θ — the area of the parallelogram the vectors span.',
          visual: crossScene([A, 0, 0], [B * Math.cos(a * DEG), B * Math.sin(a * DEG), 0], { caption: 'The two vectors, the parallelogram they span (gold) and their cross product (red), scaled to fit. Drag to rotate.' }),
          explain: t`$${A}\times${B}\times\sin ${a}^\circ = ${fmt(m, 3)}$.${a > 90 ? ' Past 90° the sine is still positive: magnitudes are never negative.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'east-cross-north', difficulty: 2,
      prompt: t`$\vec A$ points east and $\vec B$ points north, both horizontal. Which way does $\vec A\times\vec B$ point?`,
      choices: ['Straight up', 'Straight down', 'West', 'North-east, between them'],
      answer: 0,
      why: {
        1: 'That is B × A. Curl your right-hand fingers from east toward north: the thumb points up.',
        2: 'West is horizontal, but A × B must be perpendicular to both horizontal vectors — so it is vertical.',
        3: 'The cross product is perpendicular to both vectors, so it cannot lie between them.',
      },
      hints: ['A × B is perpendicular to both A and B — so it is vertical. Up or down?', 'With east as x and north as y, up is z: î × ĵ = k̂.'],
      teach: 'Right-hand rule: fingers sweep from the first vector to the second, and the thumb gives the direction of the cross product.',
      explain: t`With $x$ east, $y$ north and $z$ up, $\hat\imath\times\hat\jmath = \hat k$: straight up.`,
      visual: { ...crossScene([2, 0, 0], [0, 2, 0], { la: '\\vec A\\ (\\text{east})', lb: '\\vec B\\ (\\text{north})', showC: false, caption: 'East along x, north along y, up along z. Drag to rotate.' }) },
    }),
    num({
      id: 'cross-component', difficulty: 2,
      gen(r) {
        let A, B, C;
        do {
          A = [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])];
          B = [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])];
          C = cross(A, B);
        } while (C.some((c) => c === 0));
        const k = r.int(0, 2), axis = ['x', 'y', 'z'][k];
        return {
          prompt: t`For $\vec A = ${vecTeX(A)}$ and $\vec B = ${vecTeX(B)}$, what is the $${axis}$-component of $\vec A\times\vec B$?`,
          answer: C[k], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -C[k], feedback: 'The sign is flipped: that is a component of B × A. Keep the cyclic order.' }],
          hints: [t`$(\vec A\times\vec B)_x = A_yB_z - A_zB_y$; shift $x \to y \to z \to x$ for the others.`, ['x', 'y', 'z'][k] === 'x' ? t`$(${A[1]})(${B[2]}) - (${A[2]})(${B[1]})$.` : ['x', 'y', 'z'][k] === 'y' ? t`$(${A[2]})(${B[0]}) - (${A[0]})(${B[2]})$.` : t`$(${A[0]})(${B[1]}) - (${A[1]})(${B[0]})$.`],
          teach: 'Each component of $\\vec A \\times \\vec B$ uses the other two axes, in cyclic order: $(\\vec A\\times\\vec B)_x = A_yB_z - A_zB_y$, and so on.',
          visual: crossScene(A, B, { showC: false, caption: 'A, B and the parallelogram they span; A × B is perpendicular to it. Drag to rotate.' }),
          explain: t`$\vec A\times\vec B = ${vecTeX(C)}$, so the $${axis}$-component is $${C[k]}$.`,
        };
      },
    }),
    num({
      id: 'triangle-area', difficulty: 2,
      gen(r) {
        const P = [0, 0, 0];
        const Q = r.pick([[3, 0, 0], [2, 1, 0], [4, 0, 1]]), R = r.pick([[0, 2, 1], [1, 3, 2], [0, 4, 2]]);
        const area = len(cross(Q, R)) / 2;
        return {
          prompt: t`A triangular panel has corners at $P = (0,\ 0,\ 0)$, $Q = ${vecTeX(Q)}$ and $R = ${vecTeX(R)}$, in metres. What is its area?`,
          answer: area, units: 'm^2', tol: { rel: 0.005 },
          errors: [{ value: 2 * area, feedback: 'That is the area of the whole parallelogram. The triangle is half of it.' }],
          hints: [t`Form the edge vectors $\vec{PQ}$ and $\vec{PR}$. The parallelogram they span has area $|\vec{PQ}\times\vec{PR}|$.`, 'The triangle is half of that parallelogram.'],
          teach: 'The area of a triangle is half the magnitude of the cross product of two of its edges.',
          explain: t`$\vec{PQ}\times\vec{PR} = ${vecTeX(cross(Q, R))}$, of length $${fmt(len(cross(Q, R)), 4)}$ m², so the triangle’s area is $${fmt(area, 3)}\ \text{m}^2$.`,
          visual: crossScene(Q, R, { la: '\\vec{PQ}', lb: '\\vec{PR}', showC: false, caption: 'The two edges from P and the parallelogram they span; the triangle is half of it. Drag to rotate.' }),
        };
        void P;
      },
    }),
    mcq({
      id: 'reverse-order', difficulty: 2,
      prompt: t`If $\vec A\times\vec B = (3,\ -1,\ 2)$, what is $\vec B\times\vec A$?`,
      choices: [t`$(-3,\ 1,\ -2)$`, t`$(3,\ -1,\ 2)$`, t`$(2,\ -1,\ 3)$`, t`$(0,\ 0,\ 0)$`],
      answer: 0,
      why: {
        1: 'Unlike the dot product, the cross product is not commutative: swapping the order reverses the direction.',
        2: 'Reversing the order does not reverse the list of components; it changes every sign.',
        3: 'Only parallel vectors have a zero cross product — and that does not depend on order.',
      },
      hints: ['Sweep B into A instead of A into B: which way does your thumb point now?'],
      teach: 'The cross product is anticommutative: B × A = −(A × B).',
      visual: crossScene([1, -1, -2], [1, 1, -1], { caption: 'One pair of vectors whose cross product is (3, −1, 2), shown in red. Drag to rotate.' }),
      explain: t`$\vec B\times\vec A = -\vec A\times\vec B = (-3,\ 1,\ -2)$: the same length, the opposite direction.`,
    }),
    mcq({
      id: 'cross-error', difficulty: 3, kind: 'error',
      prompt: t`A student computes $(2,\ 1,\ 0)\times(1,\ 4,\ 0)$ and writes $(0,\ 0,\ (2)(4) + (1)(1)) = (0,\ 0,\ 9)$. What is wrong?`,
      choices: [
        t`The $z$-component should be $(2)(4) - (1)(1) = 7$`,
        t`The $x$- and $y$-components should not be zero`,
        'Vectors in the xy-plane have a zero cross product',
        t`The $z$-component should be $(2)(1) + (1)(4) = 6$`,
      ],
      answer: 0,
      why: {
        1: 'Both vectors lie in the xy-plane, so their cross product is perpendicular to it: only the z-component survives. Those zeros are right.',
        2: 'Their cross product is perpendicular to the xy-plane, along z — not zero unless they are parallel.',
        3: 'That is the dot product, which is a number, not a component of a vector.',
      },
      hints: [t`Both vectors lie in the $xy$-plane, so their cross product points along $z$ — the zeros are fine. Check the $z$-component.`, t`$(\vec A\times\vec B)_z = A_xB_y - A_yB_x$. Look at the sign between the two products.`],
      teach: 'Each cross-product component is a difference of two products, never a sum.',
      visual: crossScene([2, 1, 0], [1, 4, 0], { showC: false, caption: 'Both vectors lie in the xy-plane (the floor), so their cross product is vertical. Drag to rotate.' }),
      explain: t`$(\vec A\times\vec B)_z = A_xB_y - A_yB_x = (2)(4) - (1)(1) = 7$, so the result is $(0,\ 0,\ 7)$ — up, as the right-hand rule says when sweeping from $(2,1)$ toward $(1,4)$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-torque-wrench', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([0.25, 0.3, 0.4, 0.45]), F = r.pick([80, 120, 150, 200]), a = r.pick([50, 60, 70, 80]);
        const tau = L * F * Math.sin(a * DEG);
        return {
          prompt: t`A mechanic tightens a bolt with a torque wrench, pulling on the handle ${L} m from the bolt with a ${F} N force at ${a}° to the handle. The torque is $\vec\tau = \vec r\times\vec F$. What is its magnitude?`,
          answer: tau, units: 'N*m', tol: { rel: 0.005 },
          errors: [{ value: L * F * Math.cos(a * DEG), feedback: 'Only the part of the force perpendicular to the handle turns the bolt: use sin θ, not cos θ.' }, { value: L * F, feedback: 'rF is the torque for a perpendicular pull. Include sin θ for the angle.' }],
          hints: [t`$|\vec r\times\vec F| = rF\sin\theta$, with θ the angle between the handle and the force.`, t`$\tau = (${L}\ \text{m})(${F}\ \text{N})\sin ${a}^\circ$.`],
          teach: 'Torque is the cross product of the lever arm and the force: τ = rF sin θ, largest for a perpendicular pull.',
          visual: vectorPicture({
            arrows: [{ to: [3, 0], label: 'r (handle)', mid: true }, { from: [3, 0], to: [3 + 2 * Math.cos(a * DEG), 2 * Math.sin(a * DEG)], color: 'violet', label: 'F' }],
            arc: { at: [3, 0], from: 0, to: a, r: 0.6, label: `${a}°` },
            points: [{ x: 0, y: 0, r: 5, color: 'ink2', label: 'bolt' }],
            numbers: false, caption: 'The wrench seen from above: the handle runs from the bolt to your hand. Directions to scale; lengths not.',
          }),
          explain: t`$\tau = ${L}\times${F}\times\sin ${a}^\circ = ${fmt(tau, 3)}$ N·m. Pulling at 90° would give the most, ${fmt(L * F, 3)} N·m; pulling along the handle would give none. That is why torque specifications assume a pull perpendicular to the handle.`,
        };
      },
    }),
    num({
      id: 'cp-cross-length', difficulty: 2,
      gen(r) {
        const [A, B] = r.pick([[[1, 2, 0], [3, -1, 2]], [[2, 0, 1], [1, 3, 0]], [[0, 1, 3], [2, 2, 1]], [[1, -1, 2], [3, 0, 1]]]);
        const C = cross(A, B);
        return {
          prompt: t`What is $|\vec A\times\vec B|$ for $\vec A = ${vecTeX(A)}$ and $\vec B = ${vecTeX(B)}$?`,
          answer: len(C), tol: { rel: 0.005 },
          errors: [{ value: Math.abs(dot(A, B)), feedback: 'That is the size of the dot product. Compute the cross product’s components, then their magnitude.' }],
          hints: [t`Find $\vec A\times\vec B$ component by component, then take its magnitude.`],
          teach: 'Compute the cross product component by component, then take the magnitude — the area of the parallelogram.',
          visual: crossScene(A, B, { showC: false, caption: 'The parallelogram whose area is |A × B|. Drag to rotate.' }),
          explain: t`$\vec A\times\vec B = ${vecTeX(C)}$, so $|\vec A\times\vec B| = \sqrt{${dot(C, C)}} = ${fmt(len(C), 3)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-angular-momentum', difficulty: 2, transfer: true,
      prompt: t`A satellite moves anticlockwise on a circular orbit in the $xy$-plane, as seen from above ($+z$). At one moment its position is along $+x$ and its momentum along $+y$. Its angular momentum $\vec L = \vec r\times\vec p$ points:`,
      choices: [t`along $+z$, perpendicular to the orbit`, t`along $-z$`, t`along $+x$, outward`, 'nowhere: it is zero for a circular orbit'],
      answer: 0,
      why: {
        1: 'That would be p × r. Sweep from r (along x) to p (along y): the thumb points up.',
        2: 'L is perpendicular to both r and p, so it cannot lie along r.',
        3: 'r and p are perpendicular here, so |r × p| = rp, as large as it can be.',
      },
      hints: [t`$\hat\imath\times\hat\jmath = ?$`],
      teach: 'Angular momentum r × p is perpendicular to the plane of the orbit, set by the right-hand rule from the sense of motion.',
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-1.6, 1.9], y: [-1.3, 1.3], equal: true, xticks: 0.001, yticks: 0.001, xlabel: 'x', ylabel: 'y',
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.4, dash: true }],
          arrows: [{ from: [0, 0], to: [1, 0], color: 'accent', label: 'r' }, { from: [1, 0], to: [1, 0.7], color: 'violet', label: 'p' }, { from: [0.0872, 0.9962], to: [-0.2588, 0.9659], color: 'ink3' }],
          points: [{ x: 0, y: 0, r: 7, color: 'teal', label: 'planet' }, { x: 1, y: 0, r: 4, color: 'gold' }],
        },
        caption: 'The orbit seen from above, looking down the +z axis; the satellite moves anticlockwise. Not to scale.',
      },
      explain: t`$\vec r\times\vec p \propto \hat\imath\times\hat\jmath = \hat k$: along $+z$. For every point of the orbit $\vec L$ points the same way — and with no torque it stays fixed, which is why an orbit keeps its plane.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §2.4', url: 'https://openstax.org/books/university-physics-volume-1/pages/2-4-products-of-vectors' },
  ],
});
