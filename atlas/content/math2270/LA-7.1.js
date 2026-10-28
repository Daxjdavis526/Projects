// Coordinates relative to a basis: one vector, many columns of numbers.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { dot, add, scale, matvec, solve, det2, matTeX, colTeX, tupleTeX } from './_la.js';
import { basisPic, latticePic, fromCols } from './_eig.js';

const t = String.raw;
const ORD = ['first', 'second'];
const same = (u, v) => u.every((x, k) => Math.abs(x - v[k]) < 1e-9);

// a basis of small integer vectors (not parallel, not the standard one) and integer coordinates
function setup(r, { maxDet = 3, cRange = [-2, 3], reach = 5 } = {}) {
  for (let k = 0; k < 500; k++) {
    const b1 = [r.int(-2, 3), r.int(-2, 2)], b2 = [r.int(-2, 2), r.int(-1, 3)];
    const d = det2(fromCols([b1, b2]));
    if (d === 0 || Math.abs(d) > maxDet) continue;
    if ((b1[0] === 1 && b1[1] === 0 && b2[0] === 0 && b2[1] === 1) || b1.every((v) => v === 0) || b2.every((v) => v === 0)) continue;
    if (b1.filter((v) => v !== 0).length + b2.filter((v) => v !== 0).length < 3) continue;
    if (Math.abs(dot(b1, b2)) > 0.75 * Math.hypot(...b1) * Math.hypot(...b2)) continue;      // keep the lattice readable
    const c = [r.intExcept(cRange[0], cRange[1], [0]), r.intExcept(cRange[0], cRange[1], [0])];
    if (c[0] === c[1]) continue;
    const x = add(scale(b1, c[0]), scale(b2, c[1]));
    if (Math.max(...x.map(Math.abs)) > reach || x.every((v) => v === 0) || same(x, c) || same(x, [c[1], c[0]])) continue;
    return { b1, b2, c, x, P: fromCols([b1, b2]), d };
  }
  return { b1: [2, 1], b2: [1, 1], c: [1, 2], x: [4, 3], P: [[2, 1], [1, 1]], d: 1 };
}

export default lesson({
  id: 'math2270.LA-7.1',
  title: 'Coordinates relative to a basis',
  minutes: 10, difficulty: 2,
  intro: t`A **basis** $\mathcal B = \{\mathbf b_1, \dots, \mathbf b_n\}$ is a set of vectors that reaches every vector in exactly one way. So each vector $\mathbf x$ has one list of weights with
$$\mathbf x = c_1\mathbf b_1 + c_2\mathbf b_2 + \dots + c_n\mathbf b_n = P_{\mathcal B}\,[\mathbf x]_{\mathcal B},$$
and that list, $[\mathbf x]_{\mathcal B} = (c_1, \dots, c_n)$, is **the coordinate vector of $\mathbf x$ relative to $\mathcal B$**. The column $(x_1, x_2)$ you have used so far is just the coordinate vector relative to the standard basis $\mathbf e_1, \mathbf e_2$. Change the basis and the numbers change — **the arrow does not**. That one distinction, a vector versus the column that describes it, is the seed of the tensor calculus that general relativity is written in.`,
  symbols: [
    { tex: t`\mathbf x`, text: t`a vector — the arrow itself, here given by its standard components $(x_1, x_2, \dots)$` },
    { tex: t`\mathbf b_1, \dots, \mathbf b_n`, text: t`the basis vectors: $n$ independent vectors in an $n$-dimensional space, listed in a fixed order` },
    { tex: t`c_1, \dots, c_n`, text: t`the coordinates of $\mathbf x$ relative to $\mathcal B$: how many steps of each basis vector reach $\mathbf x$ (plain numbers, possibly negative)` },
    { tex: t`[\mathbf x]_{\mathcal B}`, text: t`the coordinate vector $(c_1, \dots, c_n)$ — a column of numbers that depends on the basis` },
    { tex: t`P_{\mathcal B}`, text: t`the $n\times n$ matrix whose columns are $\mathbf b_1, \dots, \mathbf b_n$ (in standard components). It turns $\mathcal B$-coordinates into standard ones; it is invertible because the columns are a basis` },
  ],
  why: 'Physics picks its basis to suit the problem — along and across an incline, radial and along-track for an orbit, a spacecraft’s body axes — and every such choice is a change of coordinates.',
  visual: {
    type: 'ten-basis',
    title: 'One arrow, many descriptions',
    lead: t`The gold arrow $\mathbf x$ is fixed in the plane; $\mathbf b_1$ and $\mathbf b_2$ are a basis you can drag. The dashed parallelogram builds $\mathbf x = c_1\mathbf b_1 + c_2\mathbf b_2$, and the faint lines mark whole steps of each basis vector. The readout names the coordinates $(x^1, x^2)$ — upper indices, as the tensor track writes components; they are labels, not powers.`,
    tasks: [
      'Drag b₁ and b₂: the arrow x stays put while both of its coordinates change.',
      'Choose “b₁ twice as long”: the first coordinate halves. Longer basis vectors, smaller coordinates.',
      'Choose “Skewed”: the true length of x no longer equals √((x¹)² + (x²)²). Coordinates alone do not know lengths or angles.',
    ],
    params: {
      mode: 'vector', basis: [[1, 0], [0, 1]], vector: [2, 1.5], dragBasis: true, dragVector: true, names: ['b₁', 'b₂'], vname: 'x', vtex: 'x',
      presets: [{ label: 'Standard', basis: [[1, 0], [0, 1]] }, { label: 'b₁ twice as long', basis: [[2, 0], [0, 1]] }, { label: 'Skewed', basis: [[1, 0], [1, 1]] }, { label: 'Turned', basis: [[0.8, 0.6], [-0.6, 0.8]] }],
      readout: ['V', 'len'], snap: 0.1,
    },
    caption: 'The plane has no preferred axes: the basis is a choice. The arrow and its true length never change; its coordinates do. Tips snap to 0.1.',
  },
  example: {
    prompt: t`Let $\mathcal B = \{\mathbf b_1, \mathbf b_2\}$ with $\mathbf b_1 = (1, 1)$ and $\mathbf b_2 = (-1, 2)$. Find the coordinates of $\mathbf x = (1, 7)$ relative to $\mathcal B$.`,
    visual: basisPic([[1, 1], [-1, 2]], [1, 7], { construction: true, caption: 'x built from the basis: three steps of b₁, then two of b₂ (the dashed parallelogram).' }),
    steps: [
      { label: 'Set up', text: t`You want weights with $c_1(1, 1) + c_2(-1, 2) = (1, 7)$ — that is, $P_{\mathcal B}\mathbf c = \mathbf x$ with the basis vectors as columns: $${matTeX([[1, -1], [1, 2]])}\begin{bmatrix} c_1 \\ c_2 \end{bmatrix} = ${colTeX([1, 7])}$ — written out, $c_1 - c_2 = 1$ and $c_1 + 2c_2 = 7$.` },
      { label: 'Solve', text: t`Subtract the first equation from the second: $3c_2 = 6$, so $c_2 = 2$, and then $c_1 = 1 + c_2 = 3$.` },
      { label: 'Write it', text: t`$[\mathbf x]_{\mathcal B} = (3, 2)$. Equivalently $[\mathbf x]_{\mathcal B} = P_{\mathcal B}^{-1}\mathbf x$, with $P_{\mathcal B}^{-1} = \tfrac13${matTeX([[2, 1], [-1, 1]])}$: $\tfrac13(2 + 7,\ -1 + 7) = (3, 2)$.` },
      { label: 'Check', text: t`$3(1, 1) + 2(-1, 2) = (3 - 2,\ 3 + 4) = (1, 7)$. ✓` },
      { label: 'Meaning', text: t`One arrow, two descriptions: $(1, 7)$ in the standard basis, $(3, 2)$ in $\mathcal B$. Neither is “the” vector; each is the vector *described in a basis*.` },
    ],
    answer: t`$[\mathbf x]_{\mathcal B} = (3, 2)$: $\mathbf x = 3\mathbf b_1 + 2\mathbf b_2$.`,
  },
  practice: [
    mcq({
      id: 'read-coords', difficulty: 1,
      gen(r) {
        const { b1, b2, c, x, P } = setup(r, { maxDet: 2, cRange: [-2, 2], reach: 4 });
        const Px = matvec(P, x);
        const wrongs = [[c[1], c[0]], x];
        let fourth = Px, fourthWhy = t`That is $P_{\mathcal B}\mathbf x$: multiplying by the basis matrix goes the wrong way. Coordinates are the weights that *build* $\mathbf x$ from the basis.`;
        if ([c, ...wrongs].some((w) => same(w, fourth))) { fourth = [-c[0], c[1]]; fourthWhy = t`The sign of the first coordinate is off: count the steps along $\mathbf b_1$ in its own direction.`; }
        return {
          prompt: t`The picture shows a basis $\mathbf b_1 = ${tupleTeX(b1)}$, $\mathbf b_2 = ${tupleTeX(b2)}$ and a vector $\mathbf x = ${tupleTeX(x)}$, with the lattice of whole steps of $\mathbf b_1$ and $\mathbf b_2$. What is $[\mathbf x]_{\mathcal B}$?`,
          choices: [t`$${tupleTeX(c)}$`, t`$${tupleTeX(wrongs[0])}$`, t`$${tupleTeX(wrongs[1])}$`, t`$${tupleTeX(fourth)}$`],
          answer: 0,
          why: {
            1: t`The two coordinates are swapped: the first coordinate counts steps of $\mathbf b_1$, the second steps of $\mathbf b_2$.`,
            2: t`Those are the standard components of $\mathbf x$ — its coordinates relative to $\mathbf e_1, \mathbf e_2$, not relative to $\mathcal B$.`,
            3: fourthWhy,
          },
          hints: [t`Follow the faint lines: how many steps parallel to $\mathbf b_1$, then parallel to $\mathbf b_2$, take you from the origin to the tip of $\mathbf x$?`, t`Check a candidate $(c_1, c_2)$ by computing $c_1\mathbf b_1 + c_2\mathbf b_2$.`],
          teach: t`The coordinates relative to $\mathcal B$ are the weights in $\mathbf x = c_1\mathbf b_1 + c_2\mathbf b_2$.`,
          explain: t`$${c[0]}${tupleTeX(b1)} + (${c[1]})${tupleTeX(b2)} = ${tupleTeX(x)}$, so $[\mathbf x]_{\mathcal B} = ${tupleTeX(c)}$.`,
          visual: basisPic([b1, b2], x, { caption: 'The basis b₁, b₂ (drawn from the origin), the gold arrow x, and faint lines one basis step apart.' }),
        };
      },
    }),
    num({
      id: 'solve-coords', difficulty: 2,
      gen(r) {
        const { b1, b2, c, x, P } = setup(r);
        const k = r.int(0, 1), Px = matvec(P, x);
        const errors = [];
        if (x[k] !== c[k]) errors.push({ value: x[k], feedback: t`That is the ${ORD[k]} *standard* component of $\mathbf x$. Its coordinates relative to $\mathcal B$ solve $c_1\mathbf b_1 + c_2\mathbf b_2 = \mathbf x$.` });
        if (c[1 - k] !== c[k] && c[1 - k] !== x[k]) errors.push({ value: c[1 - k], feedback: t`That is the other coordinate, $c_${2 - k}$.` });
        if (Px[k] !== c[k] && !errors.some((e) => e.value === Px[k])) errors.push({ value: Px[k], feedback: t`That comes from $P_{\mathcal B}\mathbf x$. The basis matrix turns coordinates into components; to go back, solve $P_{\mathcal B}\mathbf c = \mathbf x$.` });
        return {
          prompt: t`Find the ${ORD[k]} coordinate $c_${k + 1}$ of $\mathbf x = ${tupleTeX(x)}$ relative to the basis $\mathbf b_1 = ${tupleTeX(b1)}$, $\mathbf b_2 = ${tupleTeX(b2)}$.`,
          answer: c[k], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`Write $c_1${tupleTeX(b1)} + c_2${tupleTeX(b2)} = ${tupleTeX(x)}$ as two equations.`, t`That is the system $${matTeX(P)}\mathbf c = ${colTeX(x)}$; eliminate one unknown.`],
          teach: t`Finding coordinates means solving $P_{\mathcal B}\mathbf c = \mathbf x$, with the basis vectors as the columns of $P_{\mathcal B}$.`,
          explain: t`The system $${b1[0]}c_1 + (${b2[0]})c_2 = ${x[0]}$, $${b1[1]}c_1 + (${b2[1]})c_2 = ${x[1]}$ has solution $\mathbf c = ${tupleTeX(c)}$, so $c_${k + 1} = ${c[k]}$. Check: $${c[0]}${tupleTeX(b1)} + (${c[1]})${tupleTeX(b2)} = ${tupleTeX(x)}$.`,
          visual: basisPic([b1, b2], x, { caption: 'The basis and the vector x, with lines one basis step apart.' }),
        };
      },
    }),
    num({
      id: 'from-coords', difficulty: 1,
      gen(r) {
        const { b1, b2, c, x } = setup(r, { reach: 6 });
        const k = r.int(0, 1);
        const errors = [];
        if (c[k] !== x[k]) errors.push({ value: c[k], feedback: t`That is the coordinate $c_${k + 1}$ you were given. The question asks for the standard component of the vector it describes.` });
        const naive = c[0] * b1[k] + c[1] * b1[1 - k];
        if (naive !== x[k] && naive !== c[k]) errors.push({ value: naive, feedback: t`Use both basis vectors: the ${ORD[k]} component of $c_1\mathbf b_1 + c_2\mathbf b_2$ takes the ${ORD[k]} component of each.` });
        return {
          prompt: t`A vector has coordinates $[\mathbf x]_{\mathcal B} = ${tupleTeX(c)}$ relative to $\mathbf b_1 = ${tupleTeX(b1)}$, $\mathbf b_2 = ${tupleTeX(b2)}$. What is the ${ORD[k]} standard component of $\mathbf x$?`,
          answer: x[k], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`$\mathbf x = c_1\mathbf b_1 + c_2\mathbf b_2 = P_{\mathcal B}[\mathbf x]_{\mathcal B}$: here no equation needs solving.`],
          teach: t`Going from coordinates to the vector is a plain multiplication, $\mathbf x = P_{\mathcal B}[\mathbf x]_{\mathcal B}$.`,
          explain: t`$\mathbf x = ${c[0]}${tupleTeX(b1)} + (${c[1]})${tupleTeX(b2)} = ${tupleTeX(x)}$, so the ${ORD[k]} component is $${x[k]}$.`,
          visual: latticePic(b1, b2, { k: 6, fit: [x], caption: 'The b-lattice: blue lines hold the first coordinate fixed, violet lines the second; crossings are whole-number coordinates.' }),
        };
      },
    }),
    num({
      id: 'orthogonal', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [1, 1], [3, 2]]);
        const b1 = [p, q], b2 = [-q, p], c = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        const x = add(scale(b1, c[0]), scale(b2, c[1])), k = r.int(0, 1), b = k ? b2 : b1;
        const xb = dot(x, b), bb = dot(b, b);
        const errors = [{ value: xb, feedback: t`You have $\mathbf x\cdot\mathbf b_${k + 1} = ${xb}$, but $\mathbf b_${k + 1}$ is not a unit vector: divide by $\mathbf b_${k + 1}\cdot\mathbf b_${k + 1} = ${bb}$.` }];
        if (Math.abs(xb / Math.sqrt(bb) - c[k]) > 1e-9) errors.push({ value: xb / Math.sqrt(bb), feedback: t`Dividing by the length $|\mathbf b_${k + 1}|$ gives the length of the projection. The coordinate needs the length *squared*, $\mathbf b_${k + 1}\cdot\mathbf b_${k + 1}$.` });
        return {
          prompt: t`The basis $\mathbf b_1 = ${tupleTeX(b1)}$, $\mathbf b_2 = ${tupleTeX(b2)}$ is **orthogonal** ($\mathbf b_1\cdot\mathbf b_2 = 0$). Find the coordinate $c_${k + 1}$ of $\mathbf x = ${tupleTeX(x)}$ without solving a system.`,
          answer: c[k], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`Dot both sides of $\mathbf x = c_1\mathbf b_1 + c_2\mathbf b_2$ with $\mathbf b_${k + 1}$: the other term vanishes.`, t`$c_${k + 1} = \dfrac{\mathbf x\cdot\mathbf b_${k + 1}}{\mathbf b_${k + 1}\cdot\mathbf b_${k + 1}}$.`],
          teach: t`For an orthogonal basis each coordinate is a dot product divided by the basis vector’s length squared.`,
          explain: t`$c_${k + 1} = \dfrac{${tupleTeX(x)}\cdot${tupleTeX(b)}}{${bb}} = \dfrac{${xb}}{${bb}} = ${c[k]}$. Orthogonal bases make coordinates cheap — the reason physics prefers them, and the start of Fourier series (LA-10).`,
          visual: basisPic([b1, b2], x, { caption: 'An orthogonal basis: b₁ and b₂ meet at a right angle, so the lattice is made of rectangles.' }),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student wants the coordinates of $\mathbf x = (1, 1)$ relative to $\mathbf b_1 = (2, 1)$, $\mathbf b_2 = (3, 2)$, and writes
$$P_{\mathcal B} = ${matTeX([[2, 3], [1, 2]])}, \qquad [\mathbf x]_{\mathcal B} = P_{\mathcal B}\,\mathbf x = ${matTeX([[2, 3], [1, 2]])}${colTeX([1, 1])} = ${colTeX([5, 3])}.$$
What went wrong?`,
      choices: [
        t`$P_{\mathcal B}$ turns coordinates *into* components; they needed $P_{\mathcal B}^{-1}\mathbf x$, which is $(-1, 1)$`,
        t`The basis vectors belong in the rows of $P_{\mathcal B}$, not its columns`,
        t`The product is wrong: $2\cdot1 + 3\cdot1$ is not $5$`,
        t`$\mathbf x$ must first be scaled to length 1`,
      ],
      answer: 0,
      why: {
        1: t`Columns are right: $P_{\mathcal B}\mathbf c = c_1\mathbf b_1 + c_2\mathbf b_2$. Using rows would give $(3, 5)$, which is just as wrong.`,
        2: 'The arithmetic is fine; it is the direction of the conversion that is backwards.',
        3: 'Coordinates are defined for any vector, of any length.',
      },
      hints: [t`Test their answer: is $5\mathbf b_1 + 3\mathbf b_2$ equal to $(1, 1)$?`, t`$P_{\mathcal B}[\mathbf x]_{\mathcal B} = \mathbf x$, so $[\mathbf x]_{\mathcal B}$ solves a system rather than being a product with $P_{\mathcal B}$.`],
      teach: t`$P_{\mathcal B}$ converts $\mathcal B$-coordinates to standard components; the reverse trip needs its inverse.`,
      explain: t`$5\mathbf b_1 + 3\mathbf b_2 = (19, 11) \ne (1, 1)$. Solving $2c_1 + 3c_2 = 1$, $c_1 + 2c_2 = 1$ gives $c_2 = 1$, $c_1 = -1$: $-\mathbf b_1 + \mathbf b_2 = (1, 1)$ ✓. With $\det P_{\mathcal B} = 1$, $P_{\mathcal B}^{-1} = ${matTeX([[2, -3], [-1, 2]])}$ and $P_{\mathcal B}^{-1}\mathbf x = (-1, 1)$.`,
      visual: basisPic([[2, 1], [3, 2]], [1, 1], { caption: 'The basis b₁ = (2, 1), b₂ = (3, 2) and the vector x = (1, 1): one step back along b₁, one forward along b₂.' }),
    }),
    mcq({
      id: 'plane-coords', difficulty: 2,
      gen(r) {
        let a = 1, b = 1, c = [2, 1];
        for (let k = 0; k < 100; k++) {
          a = r.intExcept(-2, 2, [0]); b = r.intExcept(-2, 2, [0]); c = r.shuffle([-2, -1, 1, 2, 3]).slice(0, 2);
          if (c[0] * a + c[1] * b !== 0) break;       // else x would read (c₁, c₂, 0), the same as a distractor
        }
        const b1 = [1, 0, a], b2 = [0, 1, b];
        const x = add(scale(b1, c[0]), scale(b2, c[1]));
        return {
          prompt: t`The plane $W$ in $\mathbb R^3$ has the basis $\mathbf b_1 = ${tupleTeX(b1)}$, $\mathbf b_2 = ${tupleTeX(b2)}$. The vector $\mathbf x = ${tupleTeX(x)}$ lies in $W$. What is its coordinate vector $[\mathbf x]_{\mathcal B}$ relative to this basis of $W$?`,
          choices: [t`$${tupleTeX(c)}$`, t`$${tupleTeX(x)}$`, t`$${tupleTeX([...c, 0])}$`, t`$${tupleTeX([c[1], c[0]])}$`],
          answer: 0,
          why: {
            1: t`Those are the standard components of $\mathbf x$ in $\mathbb R^3$. Relative to a basis of the plane, $\mathbf x$ needs only two numbers.`,
            2: t`$W$ has a basis of two vectors, so a coordinate vector relative to it has two entries — there is no third basis vector to give a weight to.`,
            3: t`The order matters: the first coordinate is the weight on $\mathbf b_1$.`,
          },
          hints: [t`Write $\mathbf x = c_1\mathbf b_1 + c_2\mathbf b_2$. The first two components of $\mathbf b_1$ and $\mathbf b_2$ are $(1, 0)$ and $(0, 1)$.`, t`So $c_1$ and $c_2$ can be read straight from the first two components of $\mathbf x$; the third component is the check.`],
          teach: 'A k-dimensional subspace has coordinate vectors with k entries, however many components its vectors have.',
          explain: t`$${c[0]}\mathbf b_1 + (${c[1]})\mathbf b_2 = ${tupleTeX(x)}$ ✓ (the third component, $${c[0]}\cdot${a} + (${c[1]})\cdot${b} = ${x[2]}$, checks). A plane is two-dimensional, so coordinates on it are pairs — the same reason a point on Earth’s surface needs only latitude and longitude.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 4,
              vectors: [{ to: b1, color: 'good', label: t`\mathbf b_1` }, { to: b2, color: 'warn', label: t`\mathbf b_2` }, { to: x, color: 'gold', label: t`\mathbf x` }],
              parallelograms: [{ at: scale(add(b1, b2), -2), u: scale(b1, 4), v: scale(b2, 4), color: 'violet', alpha: 0.14 }],
            },
            caption: 'The plane W (a patch of it, violet) with its basis b₁, b₂ and the vector x lying in it. Drag to rotate.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solve', difficulty: 2,
      gen(r) {
        const { b1, b2, c, x } = setup(r, { maxDet: 3 });
        const k = r.int(0, 1);
        return {
          prompt: t`Find $c_${k + 1}$, the ${ORD[k]} coordinate of $\mathbf x = ${tupleTeX(x)}$ relative to $\mathbf b_1 = ${tupleTeX(b1)}$, $\mathbf b_2 = ${tupleTeX(b2)}$.`,
          answer: c[k], tol: { rel: 0, abs: 0.01 },
          hints: [t`Solve $c_1\mathbf b_1 + c_2\mathbf b_2 = \mathbf x$.`],
          teach: t`Coordinates relative to $\mathcal B$ solve $P_{\mathcal B}\mathbf c = \mathbf x$.`,
          explain: t`$\mathbf c = ${tupleTeX(c)}$: $${c[0]}${tupleTeX(b1)} + (${c[1]})${tupleTeX(b2)} = ${tupleTeX(x)}$.`,
          visual: basisPic([b1, b2], x),
        };
      },
    }),
    num({
      id: 'cp-orbit-frame', difficulty: 3, transfer: true,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [4, 3], [-3, 4], [4, -3], [-4, 3], [3, -4]]);
        const rh = [a / 5, b / 5], th = [-b / 5, a / 5];
        const vr = r.pick([-0.3, -0.2, -0.1, 0.1, 0.2, 0.4]), vt = r.pick([5.5, 6.0, 6.5, 7.0, 7.5]);
        const v = add(scale(rh, vr), scale(th, vt)).map((z) => Math.round(z * 1000) / 1000);
        const ask = r.int(0, 1), ans = ask ? vt : vr, other = ask ? vr : vt;
        return {
          prompt: t`A tracking station on the equatorial plane uses axes $x, y$. At one instant a spacecraft’s unit radial vector is $\hat{\mathbf r} = (${nice(rh[0])}, ${nice(rh[1])})$ and its unit along-track vector is $\hat{\mathbf t} = (${nice(th[0])}, ${nice(th[1])})$; its velocity in station axes is $\mathbf v = (${nice(v[0])}, ${nice(v[1])})$ km/s. Find its **${ask ? 'along-track' : 'radial'}** velocity — the ${ask ? 'second' : 'first'} coordinate of $\mathbf v$ relative to the basis $\hat{\mathbf r}, \hat{\mathbf t}$.`,
          answer: ans, units: 'km/s', tol: { rel: 0.002, abs: 0.002 },
          errors: [{ value: other, feedback: t`That is the ${ask ? 'radial' : 'along-track'} coordinate. Dot $\mathbf v$ with $${ask ? t`\hat{\mathbf t}` : t`\hat{\mathbf r}`}$.` }],
          hints: [t`$\hat{\mathbf r}$ and $\hat{\mathbf t}$ are perpendicular unit vectors, so each coordinate is a dot product.`, t`$v_${ask ? 't' : 'r'} = \mathbf v\cdot${ask ? t`\hat{\mathbf t}` : t`\hat{\mathbf r}`}$: multiply matching components and add.`],
          teach: 'In an orthonormal basis each coordinate is the dot product with that basis vector.',
          explain: t`$v_r = \mathbf v\cdot\hat{\mathbf r} = ${nice(vr)}$ km/s and $v_t = \mathbf v\cdot\hat{\mathbf t} = ${nice(vt)}$ km/s. The same velocity, described in the frame that suits an orbit: a nearly circular orbit has a small radial part and an along-track part near the circular speed ($7.7$ km/s for the ISS).`,
          visual: basisPic([rh, th], v.map((z) => z / 2.5), { names: ['r̂', 't̂'], vname: 'v (scaled)', caption: 'The station plane: the radial and along-track unit vectors (a basis) and the velocity, drawn shrunk by 2.5 so it fits.' }),
        };
      },
    }),
    mcq({
      id: 'cp-statement', difficulty: 2,
      prompt: t`Which statement is true for every basis $\mathcal B$ of $\mathbb R^2$?`,
      choices: [
        t`If $[\mathbf u]_{\mathcal B} = [\mathbf w]_{\mathcal B}$, then $\mathbf u = \mathbf w$`,
        t`$[\mathbf x]_{\mathcal B} = \mathbf x$ for every $\mathbf x$`,
        t`The length of $\mathbf x$ is $\sqrt{c_1^2 + c_2^2}$`,
        t`Two vectors with different standard components can never have equal $\mathcal B$-coordinates in different bases`,
      ],
      answer: 0,
      why: {
        1: t`Only for the standard basis. In any other basis the coordinates and the standard components differ.`,
        2: t`That holds only when the basis is orthonormal. Make $\mathbf b_1$ twice as long and $c_1$ halves while $|\mathbf x|$ stays the same.`,
        3: t`They can: $(2, 0)$ has coordinates $(1, 0)$ relative to $\{(2, 0), (0, 1)\}$, and so does $(1, 0)$ relative to the standard basis. Coordinates mean nothing without their basis.`,
      },
      hints: [t`$\mathbf u = P_{\mathcal B}[\mathbf u]_{\mathcal B}$ — what does that say when the coordinate vectors agree?`],
      teach: 'Within one basis, coordinates and vectors match one to one; across bases, the same numbers can mean different arrows.',
      explain: t`$\mathbf u = P_{\mathcal B}[\mathbf u]_{\mathcal B} = P_{\mathcal B}[\mathbf w]_{\mathcal B} = \mathbf w$: in a fixed basis the coordinates determine the vector (that is what “exactly one way” in the definition of a basis buys). But the numbers alone, without the basis, determine nothing.`,
      visual: basisPic([[2, 0], [0, 1]], [2, 0], { construction: true, grid: 'basis', caption: 'The basis b₁ = (2, 0), b₂ = (0, 1): the vector (2, 0) has coordinates (1, 0) here — the same numbers e₁ has in the standard basis.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §8.3 (change of basis)', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 31: Change of basis; image compression', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
