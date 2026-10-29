// Symmetries of the lowered Riemann tensor and the count n²(n²−1)/12 of its
// independent components: 1, 6, 20 in two, three and four dimensions. Where
// each symmetry comes from (metric compatibility, loop orientation, zero
// torsion), the pair-matrix picture of the count, the cyclic identity's
// C(n,4) constraints, Carroll's local-flatness count (second derivatives of
// g left over after the third-order coordinate freedom), Weyl = Riemann −
// Ricci, and why 3D is special.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const PAIRS = ['12', '13', '23', '14', '24', '34', '15', '25', '35', '45'];   // ordered so the first n(n−1)/2 are the pairs of n indices
const PAIRS0 = ['01', '02', '12', '03', '13', '23'];                         // the same order with spacetime indices 0–3
const riem = (n) => (n * n * (n * n - 1)) / 12;
const ricci = (n) => (n * (n + 1)) / 2;

/** The symmetric matrix of index pairs: independent cells (on and above the diagonal) bold, the rest faint. */
function pairGrid({ n = null, names = PAIRS, mark = [], slider = false } = {}) {
  const pts = [];
  const N = slider ? 10 : (n * (n - 1)) / 2;
  const vis = (i, j) => (slider ? { when: `step(n*(n-1)/2 - ${Math.max(i, j)} - 0.5)` } : {});
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const hit = mark.some(([a, b]) => a === i && b === j);
    pts.push({ x: j, y: -i, r: 6, color: hit ? 'gold' : j >= i ? 'accent' : 'ink4', ...vis(i, j) });
  }
  for (let k = 0; k < N; k++) {
    pts.push({ x: k, y: 0.85, r: 0, label: names[k], labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2', ...(slider ? { when: `step(n*(n-1)/2 - ${k} - 0.5)` } : {}) });
    pts.push({ x: -0.95, y: -k, r: 0, label: names[k], labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2', ...(slider ? { when: `step(n*(n-1)/2 - ${k} - 0.5)` } : {}) });
  }
  const span = slider ? 10 : N;
  return { x: [-1.7, span + 0.3], y: [-span + 0.3, 1.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, points: pts };
}

const countPic = (caption, { ricciToo = true } = {}) => ({
  type: 'graph',
  params: {
    x: [1.5, 4.6], y: [0, 23], aspect: 'wide', axesAt: 'edge', xlabel: 'dimension n', ylabel: 'independent components', xticks: 4, yticks: 5,
    points: [
      ...[2, 3, 4].map((n) => ({ x: n, y: riem(n), r: 5, color: 'accent', label: `Riemann ${riem(n)}`, labelDx: 8, labelDy: n === 2 && ricciToo ? 12 : -6 })),
      ...(ricciToo ? [2, 3, 4].map((n) => ({ x: n, y: ricci(n), r: 5, color: 'violet', label: `Ricci ${ricci(n)}`, labelDx: 8, labelDy: n === 2 ? -8 : 14 })) : []),
    ],
  },
  caption,
});

export default lesson({
  id: 'st-c.C15.3',
  title: 'Symmetries of Riemann and counting components',
  minutes: 13, difficulty: 3,
  equation: t`R_{\rho\sigma\mu\nu} = -R_{\sigma\rho\mu\nu} = -R_{\rho\sigma\nu\mu} = R_{\mu\nu\rho\sigma},\qquad R_{\rho\sigma\mu\nu} + R_{\rho\mu\nu\sigma} + R_{\rho\nu\sigma\mu} = 0`,
  intro: t`Lower the first index, $R_{\rho\sigma\mu\nu} = g_{\rho\lambda}R^\lambda{}_{\sigma\mu\nu}$, and the Levi-Civita Riemann tensor obeys the identities above. Each has a reason you can picture:

- **Last pair antisymmetric:** running the loop the other way reverses the change.
- **First pair antisymmetric:** transport keeps lengths, so the change is a *rotation* — $\delta V$ is perpendicular to $V$.
- **Cyclic identity** (the first Bianchi identity): zero torsion.
- **Pair exchange:** follows from the other three.

Of the $n^4$ components only $$\frac{n^2(n^2 - 1)}{12}$$ are independent: **1, 6 and 20** in two, three and four dimensions. One number per point for a surface, twenty for spacetime.`,
  symbols: [
    { tex: t`R_{\rho\sigma\mu\nu}`, text: t`the Riemann tensor with all indices lowered: the first pair $\rho\sigma$ is the rotation, the last pair $\mu\nu$ the plane of the loop` },
    { tex: 'n', text: 'the dimension of the space (4 for spacetime)' },
    { tex: t`\tfrac{n^2(n^2 - 1)}{12}`, text: 'the number of independent components left at each point once every symmetry is used' },
  ],
  why: t`Twenty numbers at each event are all the gravitational field there is: ten of them (Ricci) are fixed by the matter present through Einstein’s equation, and the other ten (Weyl) are the tides and gravitational waves that travel through empty space.`,
  visual: {
    type: 'graph',
    title: 'Count the pairs',
    lead: t`Each row and column is an antisymmetric index pair, such as $12$ (since $R_{21\ldots} = -R_{12\ldots}$, the pair $21$ adds nothing new). Pair exchange makes the grid symmetric, so only the bold cells on and above the diagonal are free. Slide $n$ and count them.`,
    tasks: [
      t`$n = 2$: one pair, one cell — the single number $K$ of every surface.`,
      t`$n = 3$: three pairs, six free cells, and no cyclic constraint (it needs four different indices): 6.`,
      t`$n = 4$: six pairs and 21 cells, minus the one cyclic identity with all four indices different, $R_{0123} + R_{0231} + R_{0312} = 0$: 20.`,
    ],
    params: {
      ...pairGrid({ slider: true }), aspect: 'wide',
      sliders: [{ key: 'n', label: 'dimension $n$', min: 2, max: 5, step: 1, value: 4, explain: 'The number of coordinates: 2 for a surface, 4 for spacetime.' }],
      readouts: [
        { label: t`pairs $m = n(n-1)/2$`, expr: 'n*(n-1)/2', digits: 3 },
        { label: t`free cells $m(m+1)/2$`, expr: '(n*(n-1)/2)*(n*(n-1)/2 + 1)/2', digits: 3 },
        { label: t`cyclic constraints $\binom{n}{4}$`, expr: 'n*(n-1)*(n-2)*(n-3)/24', digits: 3, zero: 0.5 },
        { label: t`independent $n^2(n^2-1)/12$`, expr: 'n^2*(n^2-1)/12', digits: 3 },
      ],
    },
    caption: t`Rows and columns are index pairs, listed so that the first $m$ belong to $n$ indices. Bold cells: independent before the cyclic identity; faint cells: copies across the diagonal.`,
  },
  example: {
    prompt: t`Count the independent components of the Riemann tensor of four-dimensional spacetime, indices $0, 1, 2, 3$.`,
    visual: { type: 'graph', params: { ...pairGrid({ n: 4, names: PAIRS0 }), aspect: 'wide' }, caption: 'The six antisymmetric pairs of spacetime indices and the symmetric 6 × 6 grid they make; bold cells are independent before the cyclic identity.' },
    steps: [
      { label: 'Pairs', text: t`Antisymmetry in $\rho\sigma$ means only pairs with $\rho < \sigma$ matter: $01, 02, 12, 03, 13, 23$ — that is $m = 4\cdot3/2 = 6$. The same for $\mu\nu$.` },
      { label: 'A symmetric grid', text: t`Think of $R_{\rho\sigma\mu\nu}$ as a $6\times6$ matrix whose row is the first pair and column the second. Pair exchange, $R_{\rho\sigma\mu\nu} = R_{\mu\nu\rho\sigma}$, makes it symmetric: $6\cdot7/2 = 21$ free entries.` },
      { label: 'Cyclic identity', text: t`If two of $\sigma, \mu, \nu$ are equal, or one equals $\rho$, $R_{\rho\sigma\mu\nu} + R_{\rho\mu\nu\sigma} + R_{\rho\nu\sigma\mu} = 0$ already follows from the antisymmetries. Only all-different indices give a new condition: $R_{0123} + R_{0231} + R_{0312} = 0$ — one more, $\binom{4}{4} = 1$.` },
      { label: 'Total', text: t`$21 - 1 = 20$, matching $\dfrac{n^2(n^2 - 1)}{12} = \dfrac{16\cdot15}{12} = 20$.` },
      { label: 'Sense check', text: t`$n = 2$: $m = 1$, one cell, no cyclic condition — $1$, the Gaussian curvature. $n = 3$: $m = 3$, six cells — $6$. The formula agrees with both.` },
    ],
    answer: t`$21 - 1 = 20$ independent components.`,
  },
  practice: [
    multi({
      id: 'vanish', difficulty: 2,
      prompt: t`In four-dimensional spacetime (coordinates $t, x, y, z$), which components of $R_{\rho\sigma\mu\nu}$ are zero for **every** metric? Select all that are.`,
      visual: { type: 'graph', params: { ...pairGrid({ n: 4, names: PAIRS0 }), aspect: 'wide' }, caption: 'Only pairs of two different indices appear in the grid: a pair like tt or xx is not on it at all.' },
      choices: [t`$R_{xxyz}$`, t`$R_{tytt}$`, t`$R_{txtx}$`, t`$R_{xyyx}$`, t`$R_{tytx}$`],
      answer: [0, 1],
      why: {
        2: t`$R_{txtx}$ is the radial tidal stretch near a mass ($-2M/r^3$ in a falling frame along $x = r$): not zero in general.`,
        3: t`$R_{xyyx} = -R_{xyxy}$: a sign flip of a component that is generally not zero.`,
        4: t`$t y$ and $t x$ are both legitimate pairs; such off-diagonal entries of the grid are free in general (they vanish in Schwarzschild’s natural frame, not for every metric).`,
      },
      hints: ['An antisymmetric pair with two equal indices is zero.'],
      teach: 'A component with a repeated index inside either antisymmetric pair is identically zero.',
      explain: t`$R_{xx\ldots} = -R_{xx\ldots}$ forces zero, and so does $R_{\ldots tt}$. Every other combination can be non-zero for some metric; whether it is depends on the spacetime.`,
    }),
    num({
      id: 'cyclic', difficulty: 2,
      gen(r) {
        const A = r.intExcept(-9, 9, [0]), B = r.intExcept(-9, 9, [0, -A]);
        const key = -A - B;
        return {
          prompt: t`At an event, a spacetime has $R_{0123} = ${A}\times10^{-20}\ \text{m}^{-2}$ and $R_{0231} = ${B}\times10^{-20}\ \text{m}^{-2}$ (coordinates in metres). What is $R_{0312}$, in units of $10^{-20}\ \text{m}^{-2}$?`,
          visual: {
            type: 'graph',
            params: { x: [-2.2, 2.2], y: [-1.5, 1.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, aspect: 'wide',
              points: [{ x: 0, y: 0, r: 7, color: 'ink3', label: '0 stays first', labelDy: 18, labelAlign: 'center', labelDx: 0 }, { x: 0, y: 1.1, r: 6, color: 'accent', label: '1', labelDy: -12, labelAlign: 'center', labelDx: 0 }, { x: 0.95, y: -0.55, r: 6, color: 'accent', label: '2', labelDx: 10 }, { x: -0.95, y: -0.55, r: 6, color: 'accent', label: '3', labelDx: -18 }],
              curves: [{ param: ['1.2*cos(t)', '1.2*sin(t)'], t: [-1.2, 1.4], color: 'gold', width: 2 }, { param: ['1.2*cos(t)', '1.2*sin(t)'], t: [1.75, 3.45], color: 'gold', width: 2 }, { param: ['1.2*cos(t)', '1.2*sin(t)'], t: [3.85, 4.95], color: 'gold', width: 2 }],
              arrows: [{ from: [0.31, 1.16], to: [0.45, 1.11], color: 'gold', width: 2 }] },
            caption: 'The cyclic identity keeps the first index and cycles the other three: 123 → 231 → 312.',
          },
          answer: key, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: A + B, feedback: 'The three cyclic terms add to zero, so the third is minus the sum of the other two.' }, { value: A - B, feedback: t`All three terms enter with a plus sign: $R_{0123} + R_{0231} + R_{0312} = 0$.` }].filter((e) => Math.abs(e.value - key) > 0.5),
          hints: [t`$R_{\rho\sigma\mu\nu} + R_{\rho\mu\nu\sigma} + R_{\rho\nu\sigma\mu} = 0$ with $\rho = 0$, $\sigma\mu\nu = 123$.`],
          teach: 'The cyclic (first Bianchi) identity: fix the first index and the three cyclic orderings of the others sum to zero.',
          explain: t`$R_{0312} = -R_{0123} - R_{0231} = -(${A}) - (${B}) = ${key}$, in units of $10^{-20}\ \text{m}^{-2}$. In four dimensions this is the only cyclic condition not already implied by the antisymmetries — the "$-1$" in $21 - 1 = 20$.`,
        };
      },
    }),
    num({
      id: 'weyl-count', difficulty: 3,
      gen(r) {
        const n = r.pick([5, 6, 10, 11]);
        const key = riem(n) - ricci(n);
        return {
          prompt: t`The Ricci tensor (C16) is symmetric, with $n(n+1)/2$ independent components. What is left of Riemann once its Ricci part is removed — the **Weyl tensor** — has the rest. How many independent components does the Weyl tensor have in $n = ${n}$ dimensions?`,
          visual: countPic('Independent components of Riemann (blue) and Ricci (violet) in two, three and four dimensions: in 3D they are equal.'),
          answer: key, tol: { rel: 0, abs: 0.5 },
          errors: [
            { value: riem(n), feedback: t`That is all of Riemann; subtract the $n(n+1)/2$ components that belong to Ricci.` },
            { value: riem(n) - (n * (n - 1)) / 2, feedback: t`Ricci is symmetric, so it has $n(n+1)/2$ independent components, not $n(n-1)/2$.` },
          ],
          hints: [t`Riemann: $n^2(n^2 - 1)/12$; Ricci: $n(n+1)/2$.`, t`For $n = ${n}$: $${riem(n)} - ${ricci(n)}$.`],
          teach: 'Weyl = Riemann minus Ricci: the part of curvature not fixed by the local matter.',
          explain: t`$\dfrac{${n * n}(${n * n} - 1)}{12} - \dfrac{${n}\cdot${n + 1}}{2} = ${riem(n)} - ${ricci(n)} = ${key}$. In four dimensions the same count gives $20 - 10 = 10$; in three it gives $6 - 6 = 0$ — there is no Weyl tensor, so Ricci determines all of Riemann.`,
        };
      },
    }),
    num({
      id: 'flatness-count', difficulty: 3,
      gen(r) {
        const n = r.pick([3, 4, 5]);
        const d2g = ricci(n) ** 2, free = (n * n * (n + 1) * (n + 2)) / 6, key = d2g - free;
        return {
          prompt: t`At a point of an $n = ${n}$ dimensional space, coordinates can always be chosen so that $g_{\mu\nu} = \eta_{\mu\nu}$ (or $\delta_{\mu\nu}$) and $\partial_\lambda g_{\mu\nu} = 0$. Can the second derivatives $\partial_\kappa\partial_\lambda g_{\mu\nu}$ be removed too? Count: they number $\big(\tfrac{n(n+1)}{2}\big)^2$; the unused freedom in a coordinate change is its third derivatives $\partial^3x'^\mu/\partial x^\kappa\partial x^\lambda\partial x^\rho$, which number $n\cdot\tfrac{n(n+1)(n+2)}{6}$. How many second-derivative combinations are left that no choice of coordinates can remove?`,
          visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'chart', P: [3.1, 1.4], drag: false, readout: false, field: true, cells: 10 }, caption: 'Near P the ellipses are all nearly alike: to first order the metric can be made flat there. How the ellipses change across the chart at second order is what no coordinates can remove.' },
          answer: key, tol: { rel: 0, abs: 0.5 },
          errors: [
            { value: d2g, feedback: t`That is how many second derivatives there are. Subtract the ones the third-order coordinate freedom can cancel.` },
            { value: free, feedback: t`That is the coordinate freedom. The question asks what is left over after using it.` },
          ],
          hints: [t`Second derivatives of $g$: $\tfrac{n(n+1)}{2}$ symmetric pairs $\mu\nu$ times $\tfrac{n(n+1)}{2}$ symmetric pairs $\kappa\lambda$.`, t`For $n = ${n}$: $${d2g}$ second derivatives, $${free}$ third derivatives of the coordinate change.`],
          teach: 'Curvature is what is left of the metric’s second derivatives after every coordinate freedom is used: exactly n²(n²−1)/12 numbers.',
          explain: t`$${d2g} - ${free} = ${key}$ — exactly $n^2(n^2 - 1)/12$, the number of independent Riemann components. That is no coincidence: the Riemann tensor *is* the part of $\partial\partial g$ that no coordinates can remove. In spacetime, $100 - 80 = 20$: you can always make gravity vanish at a point (the equivalence principle), never its tides.`,
        };
      },
    }),
    order({
      id: 'first-pair', difficulty: 3,
      prompt: t`Show that the lowered Riemann tensor is antisymmetric in its first pair, $R_{\rho\sigma\mu\nu} = -R_{\sigma\rho\mu\nu}$. Order the argument.`,
      visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'transport', P: [1.0, 0.9], Q: [2.4, 1.5], drag: false, readout: false, field: true, angle: 60, sliders: [] }, caption: 'Arrows carried along both routes keep their length as the metric measures it: they arrive turned, never stretched.' },
      items: [
        t`Levi-Civita transport keeps lengths, so after a small loop $g(V + \delta V, V + \delta V) = g(V, V)$.`,
        t`To first order that says $2\,g(V, \delta V) = 2V^\rho\,\delta V_\rho = 0$: the change is perpendicular to $V$.`,
        t`With $\delta V_\rho = -R_{\rho\sigma\mu\nu}V^\sigma A^\mu B^\nu\,\delta a\,\delta b$, this is $R_{\rho\sigma\mu\nu}V^\rho V^\sigma A^\mu B^\nu = 0$ for every $V$ and every loop.`,
        t`A bilinear form that gives zero on every pair $(V, V)$ is antisymmetric, so $R_{\rho\sigma\mu\nu} = -R_{\sigma\rho\mu\nu}$.`,
      ],
      hints: ['Start from what parallel transport does to a vector’s length.', t`Expand $g(V + \delta V, V + \delta V)$ to first order.`],
      teach: 'Antisymmetry in the first pair is metric compatibility: holonomy is a rotation, never a stretch.',
      explain: t`So at each point Riemann is a rotation generator (first pair) for each oriented plane (last pair). A connection that did not keep lengths — like the non-metric one of C12.3 — would lose this symmetry and have more components.`,
    }),
    mcq({
      id: 'three-d', difficulty: 2,
      prompt: t`In three dimensions Riemann and Ricci both have 6 independent components. What follows?`,
      visual: countPic('Independent components of Riemann (blue) and Ricci (violet): the two counts meet at n = 3.'),
      choices: [
        t`Ricci determines Riemann completely: a 3D space with $R_{\mu\nu} = 0$ is flat`,
        t`Ricci is always zero in three dimensions`,
        t`Riemann and Ricci are the same tensor in three dimensions`,
        'Nothing: equal counts are a coincidence with no consequence',
      ],
      answer: 0,
      why: {
        1: 'A round 3-sphere has non-zero Ricci (C16.1). The count says Ricci carries all the information, not that it vanishes.',
        2: 'They have different numbers of indices; one is built from the other by contraction, and in 3D the map can be inverted.',
        3: 'Equal counts here reflect that the Weyl part, the only part Ricci cannot see, has zero components.',
      },
      hints: ['Weyl = Riemann − Ricci. How many components does it have in 3D?'],
      teach: 'In three dimensions the Weyl tensor vanishes, so Ricci fixes all of Riemann.',
      explain: t`In 3D, $R_{\rho\sigma\mu\nu}$ can be written entirely from $R_{\mu\nu}$, $R$ and $g$. So for gravity in 2+1 dimensions, where Einstein’s equation sets Ricci by the matter, empty space is flat: there are no tides and no gravitational waves there. Four dimensions are the first with Weyl curvature to spare.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dimensions', difficulty: 2, transfer: true,
      gen(r) {
        const [n, what] = r.pick([[5, 'Kaluza–Klein theory (1921–26) added a fifth dimension to unify gravity with electromagnetism'], [10, 'superstring theories are formulated in ten spacetime dimensions'], [11, 'M-theory and eleven-dimensional supergravity use eleven'], [26, 'the bosonic string needs twenty-six']]);
        const key = riem(n);
        return {
          prompt: t`Theories with extra dimensions are speculative — no experiment has found evidence of any — but their geometry is ordinary: ${what}. How many independent components does the Riemann tensor have at each point of an $n = ${n}$ dimensional spacetime?`,
          visual: countPic('Independent components in two, three and four dimensions: 1, 6 and 20. The count grows as n⁴.', { ricciToo: false }),
          answer: key, tol: { rel: 0, abs: 0.5 },
          errors: [
            { value: n ** 4, feedback: t`$n^4$ counts every component before the symmetries cut it down to $n^2(n^2 - 1)/12$.` },
            { value: ((n * (n - 1)) / 2) ** 2, feedback: 'That uses the two antisymmetries but forgets pair exchange and the cyclic identity.' },
          ],
          hints: [t`$\dfrac{n^2(n^2 - 1)}{12}$ with $n = ${n}$.`],
          teach: 'The Riemann tensor has n²(n²−1)/12 independent components in n dimensions.',
          explain: t`$\dfrac{${n * n}\times${n * n - 1}}{12} = ${key}$. The mathematics is the same in any dimension; whether nature has more than four is an open question that experiments (searches for deviations from inverse-square gravity at sub-millimetre scales, missing energy at colliders) have so far answered with "not that we can see".`,
        };
      },
    }),
    num({
      id: 'cp-swap', difficulty: 2,
      gen(r) {
        const v = r.intExcept(-9, 9, [0]);
        const [ask, sign, why] = r.pick([['R_{3412}', 1, 'swap the pairs'], ['R_{2134}', -1, 'one swap inside the first pair'], ['R_{4321}', 1, 'swap the pairs, then swap inside each pair (two sign changes)'], ['R_{1243}', -1, 'one swap inside the last pair']]);
        const key = sign * v;
        return {
          prompt: t`In a four-dimensional space, $R_{1234} = ${v}\ \text{m}^{-2}$ at some point. What is $${ask}$ there, in $\text{m}^{-2}$?`,
          visual: { type: 'graph', params: { ...pairGrid({ n: 4, mark: [[0, 5], [5, 0]] }), aspect: 'wide' }, caption: 'The pair grid in four dimensions (indices 1–4): pair 12 against pair 34 and its mirror image across the diagonal are highlighted in gold.' },
          answer: key, units: 'm^-2', tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -key, feedback: 'Count the swaps: each swap inside a pair flips the sign; exchanging the two pairs does not.' }],
          hints: [t`Pair exchange keeps the sign; a swap inside a pair flips it.`],
          teach: 'Swapping inside a pair flips the sign; exchanging the two pairs does not.',
          explain: t`To reach $${ask}$: ${why}. So $${ask} = ${sign > 0 ? '+' : '-'}R_{1234} = ${key}\ \text{m}^{-2}$.`,
        };
      },
    }),
    multi({
      id: 'cp-two-d', difficulty: 3,
      prompt: t`Which statements are true for **every** two-dimensional surface? Select all that are.`,
      visual: { type: 'dg4-chart', params: { metric: 'torus', mode: 'chart', P: [2.0, 2.4], drag: false, readout: ['K'], field: true }, caption: 'The torus: K varies from point to point, but at each point it is one number.' },
      choices: [
        t`Riemann has one independent component per point: $R_{1212} = K\det g$`,
        t`The cyclic identity adds no condition`,
        t`$K$ is the same at every point`,
        t`The first-pair antisymmetry fails, because a 2D rotation has only one angle`,
      ],
      answer: [0, 1],
      why: {
        2: 'One component per point, but it varies: the torus is positive outside and negative inside.',
        3: 'It holds in every dimension; in 2D it is exactly why one angle (the rotation) is all there is.',
      },
      hints: [t`Put $n = 2$ into each count: pairs, free cells, cyclic constraints $\binom{n}{4}$.`, 'One component per point does not mean the same number at every point.'],
      teach: 'In 2D the symmetries leave one component per point; the cyclic identity needs four different indices and so says nothing.',
      explain: t`$m = 1$, so one free cell, and $\binom{2}{4} = 0$ cyclic conditions: $R_{1212} = K\det g$ is everything. The one number may vary from place to place — a cylinder has $K = 0$ everywhere, a torus changes sign.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.6 (symmetries of Riemann; the counting argument; local flatness, §2.5)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Misner, Thorne & Wheeler, Gravitation, §13.5 and exercise 13.10 (counting Riemann components)', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
  ],
});
