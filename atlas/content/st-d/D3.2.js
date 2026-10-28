// The Cauchy–Riemann equations: the amplitwist, written in partial
// derivatives. A complex derivative acts on tiny arrows as one
// turn-and-stretch, so the Jacobian of (x, y) ↦ (u, v) must have the shape
// [[a, −b], [b, a]]: u_x = v_y and u_y = −v_x. Then f′ = u_x + i v_x.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { M, r6, cTeX, num as nm, cxmap, apart } from './_cx.js';

const t = String.raw;

const uvPic = (u, v, z0, caption, o = {}) => cxmap({ f: 'uv', u, v, x: [-2, 2], y: [-2, 2], wx: [-4, 4], wy: [-4, 4], grid: 'cartesian', gn: 9, amplitwist: true, eps: 0.3, drag: { x: z0[0], y: z0[1] }, ...o }, caption);

export default lesson({
  id: 'st-d.D3.2',
  title: 'The Cauchy–Riemann equations',
  minutes: 12, difficulty: 3,
  intro: t`Write $f = u + iv$ and look at it as an ordinary map of the plane, $(x, y) \mapsto (u, v)$. Near a point it acts on tiny arrows through its **Jacobian matrix** of partial derivatives. For $f$ to have a complex derivative $f' = a + ib$, that matrix must be multiplication by $a + ib$ — a turn and a stretch — whose matrix is $\begin{bmatrix} a & -b \\ b & a \end{bmatrix}$. Matching entries gives the **Cauchy–Riemann equations**:

$$\frac{\partial u}{\partial x} = \frac{\partial v}{\partial y}, \qquad \frac{\partial u}{\partial y} = -\frac{\partial v}{\partial x}$$

When they hold (and the partial derivatives are continuous), $f$ is complex-differentiable and $f' = u_x + i\,v_x$. A function that is complex-differentiable at every point of an open region is **analytic** there.`,
  symbols: [
    { tex: 'u,\\ v', text: t`the real and imaginary parts of $f(x + iy)$, two real functions of $x$ and $y$` },
    { tex: t`u_x = \partial u/\partial x`, text: t`partial derivatives: how $u$ changes as $x$ alone changes (likewise $u_y$, $v_x$, $v_y$)` },
    { tex: t`\begin{bmatrix} u_x & u_y \\ v_x & v_y \end{bmatrix}`, text: t`the Jacobian: it sends a tiny arrow $(dx, dy)$ to $(du, dv)$` },
    { tex: t`f' = u_x + i\,v_x`, text: t`the complex derivative read from the first column: $a = u_x$, $b = v_x$` },
  ],
  why: t`Two equations decide whether a function has a derivative in the complex sense — and they tie $u$ and $v$ so tightly that each obeys Laplace’s equation, which is why 2D potential flow and electrostatics can be done with complex functions.`,
  visual: {
    type: 'cx-map',
    title: 'Watch the Jacobian, test the equations',
    lead: t`The map $u = x^2 - k\,y^2$, $v = 2xy$. At $k = 1$ it is $z^2$. The readout shows the Jacobian at $z$ and the two Cauchy–Riemann residuals $u_x - v_y$ and $u_y + v_x$, which must both be $0$ for a complex derivative.`,
    tasks: [
      t`At $k = 1$ both residuals are $0$ everywhere: the green disc maps to a disc, and the amplification is $|2z|$.`,
      t`Set $k = 0.3$: $u_y + v_x = 2(1 - k)y$ is no longer $0$ — the disc maps to a tilted ellipse, and there is no derivative.`,
      t`With $k \ne 1$, drag $z$ onto the real axis: the residuals vanish there (but nowhere near it in the plane), so the function is differentiable only on that line, and analytic nowhere.`,
    ],
    params: {
      f: 'uv', u: 'x^2 - k*y^2', v: '2*x*y',
      sliders: [{ key: 'k', label: '$k$', min: 0, max: 2, step: 0.05, value: 0.4, explain: t`At $k = 1$ the map is $z^2$; any other value breaks the Cauchy–Riemann equations off the real axis.` }],
      x: [-2, 2], y: [-2, 2], wx: [-4, 4], wy: [-4, 4], grid: 'cartesian', gn: 9, amplitwist: true, eps: 0.3, drag: { x: 0.8, y: 0.9 }, readout: ['z', 'jac', 'cr', 'amp'],
    },
    caption: t`The Jacobian and residuals are computed numerically at the dragged point; the amplification is shown only where the residuals vanish.`,
  },
  example: {
    prompt: t`Test $f = e^x\cos y + i\,e^x\sin y$, and $g = x^2 + y^2$, against the Cauchy–Riemann equations.`,
    visual: uvPic('x^2 + y^2', '0', [0.8, 0.6], t`The map $g = x^2 + y^2$: everything lands on the real axis, and the small disc is crushed to a line segment.`, { wx: [-1, 7], wy: [-4, 4] }),
    steps: [
      { label: 'The exponential', text: t`$u = e^x\cos y$, $v = e^x\sin y$. Then $u_x = e^x\cos y = v_y$ and $u_y = -e^x\sin y = -v_x$. Both hold everywhere: $f$ is analytic on the whole plane.` },
      { label: 'Its derivative', text: t`$f' = u_x + i\,v_x = e^x\cos y + i\,e^x\sin y = f$ — this $f$ is $e^z$, and it is its own derivative, as it should be.` },
      { label: 'The square of the length', text: t`$g = |z|^2$: $u = x^2 + y^2$, $v = 0$. Then $u_x = 2x$ but $v_y = 0$, and $u_y = 2y$ but $-v_x = 0$. Both hold only when $x = y = 0$.` },
      { label: 'One point is not enough', text: t`$g$ is complex-differentiable at $z = 0$ (with $g'(0) = 0$) and nowhere else. **Analytic** needs differentiability on a whole open neighbourhood, so $g$ is analytic nowhere — though its partial derivatives exist and are continuous everywhere.` },
    ],
    answer: t`$e^x\cos y + i\,e^x\sin y = e^z$ passes everywhere; $|z|^2$ passes only at $0$ and is analytic nowhere.`,
  },
  practice: [
    multi({
      id: 'which-analytic', difficulty: 2,
      prompt: 'Which of these functions u + iv are analytic on the whole plane? Select every one.',
      visual: uvPic('2*x', 'y', [0.6, 0.5], t`For comparison, a map that fails: $u = 2x$, $v = y$ stretches only across, so a small disc becomes an ellipse.`, { wx: [-4, 4], wy: [-3, 3] }),
      choices: [t`$u = 3x - 2y$, $v = 2x + 3y$`, t`$u = e^{-y}\cos x$, $v = e^{-y}\sin x$`, t`$u = x$, $v = -y$`, t`$u = 2x$, $v = 3y$`, t`$u = x^2 - y^2$, $v = -2xy$`],
      answer: [0, 1],
      why: {
        2: t`$u_x = 1$ but $v_y = -1$: this is $\bar z$, a reflection.`,
        3: t`$u_x = 2 \ne 3 = v_y$: a stretch by different amounts across and up.`,
        4: t`$u_x = 2x$ but $v_y = -2x$: this is $\bar z^{\,2}$, which fails except at $0$.`,
      },
      hints: ['For each, compute the four partial derivatives and check both equations.', t`$u_x = v_y$ and $u_y = -v_x$ must both hold at every point.`],
      teach: 'Test analyticity with the two Cauchy–Riemann equations at every point.',
      explain: t`The first is $(3 + 2i)z$: $u_x = 3 = v_y$, $u_y = -2 = -v_x$. The second is $e^{iz}$: $u_x = -e^{-y}\sin x = v_y$, $u_y = -e^{-y}\cos x = -v_x$. The others are $\bar z$, a non-uniform stretch, and $\bar z^{\,2}$.`,
    }),
    mcq({
      id: 'where-diff', difficulty: 3,
      prompt: t`Where is $f = x^2 + i\,y^2$ complex-differentiable?`,
      visual: uvPic('x^2', 'y^2', [0.9, 0.9], t`$f = x^2 + iy^2$ at a point with $x = y$: the small disc maps to (nearly) a disc. Drag elsewhere in your mind: off that line it would be an ellipse.`, { wx: [-1, 4.5], wy: [-1, 4.5] }),
      choices: [t`Only on the line $y = x$ — so it is analytic nowhere`, t`Everywhere: it is a polynomial in $x$ and $y$`, 'Nowhere', t`Only at $z = 0$`],
      answer: 0,
      why: {
        1: 'Being a polynomial in x and y is not enough: it must be a function of z = x + iy alone, and the Cauchy–Riemann equations test that.',
        2: t`At points with $x = y$ both equations do hold — check $u_x = 2x$ and $v_y = 2y$.`,
        3: t`$u_y = 0 = -v_x$ always; $u_x = v_y$ needs $x = y$, which is a whole line, not just $0$.`,
      },
      hints: [t`$u_x = 2x$, $v_y = 2y$, $u_y = 0$, $v_x = 0$.`, t`The second equation always holds. When does the first?`],
      teach: 'Complex-differentiable at a point, or along a line, is weaker than analytic, which needs a whole open region.',
      explain: t`$u_y = -v_x$ holds everywhere ($0 = 0$); $u_x = v_y$ means $2x = 2y$. So $f$ is differentiable exactly on the line $y = x$, with $f' = u_x + iv_x = 2x$ there. A line contains no open disc, so $f$ is analytic nowhere.`,
    }),
    num({
      id: 'fprime-from-uv', difficulty: 2,
      gen(r) {
        const x = r.pick([1, -1, 2, 0.5]), y = r.pick([1, 2, -1, 0.5]);
        const which = r.pick(['re', 'im']);
        const ux = 3 * x * x - 3 * y * y, vx = 6 * x * y;
        const ans = which === 're' ? ux : vx;
        return {
          prompt: t`$u = x^3 - 3xy^2$ and $v = 3x^2y - y^3$ satisfy the Cauchy–Riemann equations. Find the ${which === 're' ? 'real' : 'imaginary'} part of $f'$ at $z = ${cTeX([x, y])}$.`,
          visual: uvPic('x^3 - 3*x*y^2', '3*x^2*y - y^3', [x, y], t`The map and the small disc at $z$ (axes without numbers).`, { x: [-2.5, 2.5], y: [-2.5, 2.5], wx: [-12, 12], wy: [-12, 12], ticks: false, eps: 0.2 }),
          answer: ans, tol: { rel: 1e-3, abs: 1e-3 },
          errors: apart(ans, which === 're' ? [{ value: -6 * x * y, feedback: t`That is $u_y$. The real part of $f'$ is $u_x$.` }] : [{ value: -vx, feedback: t`$f' = u_x + i\,v_x$; you may have used $u_y = -v_x$ with the wrong sign.` }, { value: ux, feedback: 'That is the real part.' }]),
          hints: [t`$f' = u_x + i\,v_x$.`, which === 're' ? t`$u_x = 3x^2 - 3y^2$.` : t`$v_x = 6xy$.`],
          teach: t`Read the derivative off the first column of the Jacobian: $f' = u_x + i\,v_x$.`,
          explain: t`$f' = (3x^2 - 3y^2) + i\,6xy$, which at $(${x}, ${y})$ is $${cTeX([ux, vx])}$. This is $3z^2$: indeed $u + iv = z^3$.`,
        };
      },
    }),
    mcq({
      id: 'jacobian-shape', difficulty: 2,
      prompt: t`Which matrix could be the Jacobian $\begin{bmatrix} u_x & u_y \\ v_x & v_y \end{bmatrix}$ of a complex-differentiable map at a point?`,
      visual: uvPic('2*x', '3*y', [0.5, 0.4], t`What a Jacobian $\begin{bmatrix} 2 & 0 \\ 0 & 3 \end{bmatrix}$ does to a small disc: an ellipse, not a disc.`, { wx: [-4.5, 4.5], wy: [-4.5, 4.5] }),
      choices: [t`$\begin{bmatrix} 2 & -3 \\ 3 & 2 \end{bmatrix}$`, t`$\begin{bmatrix} 2 & 3 \\ 3 & 2 \end{bmatrix}$`, t`$\begin{bmatrix} 2 & 0 \\ 0 & 3 \end{bmatrix}$`, t`$\begin{bmatrix} 2 & -3 \\ 3 & -2 \end{bmatrix}$`],
      answer: 0,
      why: {
        1: t`Here $u_y = 3$ but $-v_x = -3$. A symmetric matrix stretches along two perpendicular directions by different amounts (5 and −1): no turn-and-stretch does that.`,
        2: t`$u_x = 2 \ne 3 = v_y$: unequal stretches across and up turn discs into ellipses.`,
        3: t`$u_x = 2$ but $v_y = -2$: the determinant is negative, so the map flips orientation, like $\bar z$.`,
      },
      hints: [t`Multiplication by $a + ib$ has matrix $\begin{bmatrix} a & -b \\ b & a \end{bmatrix}$.`, 'Equal diagonal entries, and off-diagonal entries equal and opposite.'],
      teach: t`A complex derivative’s Jacobian is a turn-and-stretch matrix $\begin{bmatrix} a & -b \\ b & a \end{bmatrix}$ — that is all the Cauchy–Riemann equations say.`,
      explain: t`$\begin{bmatrix} 2 & -3 \\ 3 & 2 \end{bmatrix}$ is multiplication by $2 + 3i$: amplification $\sqrt{13}$, twist $${nm(Math.atan2(3, 2) * 180 / Math.PI, 3)}^\circ$.`,
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “$f(z) = |z|^2 = x^2 + y^2$ has partial derivatives $2x$ and $2y$ that exist and are continuous everywhere, so $f$ is analytic everywhere.” What is wrong?`,
      visual: uvPic('x^2 + y^2', '0', [0.7, -0.5], t`$|z|^2$ crushes a small disc onto a segment of the real axis.`, { wx: [-1, 5], wy: [-3, 3] }),
      choices: ['Smooth partial derivatives are not enough: the Cauchy–Riemann equations must also hold, and here they hold only at 0', 'Nothing: smooth partial derivatives make a function analytic', t`The partial derivatives are wrong: $u_x$ should be $x$`, t`$|z|^2$ is not continuous at $0$`],
      answer: 0,
      why: { 1: 'Every smooth map of the plane has continuous partial derivatives; only the ones whose Jacobian is a turn-and-stretch are complex-differentiable.', 2: t`$\partial(x^2)/\partial x = 2x$: those are right.`, 3: t`$|z|^2$ is continuous everywhere.` },
      hints: [t`Write $u = x^2 + y^2$ and $v = 0$, and test both equations.`, t`$u_x = 2x$ but $v_y = 0$: where can these be equal?`],
      teach: 'Continuous partial derivatives plus the Cauchy–Riemann equations give complex differentiability; either alone does not.',
      explain: t`$u_x = 2x$ vs $v_y = 0$, and $u_y = 2y$ vs $-v_x = 0$: both hold only at $z = 0$. So $|z|^2$ is differentiable at $0$ alone and analytic nowhere.`,
    }),
    num({
      id: 'make-analytic', difficulty: 3,
      gen(r) {
        const p = r.pick([2, 3, -1, 4]), b0 = r.pick([0, 1]);
        return {
          prompt: t`For which value of the constant $b$ is $u = x^2 - y^2 + ${p}x$, $v = 2xy + b\,y$ analytic?`,
          visual: uvPic(`x^2 - y^2 + ${p}*x`, `2*x*y + ${b0}*y`, [0.4, 0.6], t`The map with $b = ${b0}$ (the wrong value): the small disc becomes an ellipse.`, { wx: [-6, 6], wy: [-6, 6], ticks: false }),
          answer: p, tol: { rel: 0, abs: 1e-6 },
          errors: apart(p, [{ value: -p, feedback: t`$u_x = 2x + ${p}$ and $v_y = 2x + b$: set them equal.` }]),
          hints: [t`$u_x = 2x + ${p}$ and $v_y = 2x + b$.`, t`Check the second equation too: $u_y = -2y$ and $-v_x = -2y$.`],
          teach: 'The Cauchy–Riemann equations fix how u and v must be matched.',
          explain: t`$u_x = v_y$ gives $${p} = b$; the second equation holds for any $b$. With $b = ${p}$, $f = z^2 + ${p}z$.`,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-test', difficulty: 2,
      gen(r) {
        const set = r.pick([
          [t`$u = x^2 - y^2 + x$, $v = 2xy + y$`, t`$u = x^2 + y^2$, $v = 2xy$`, t`$u = x$, $v = 2y$`, t`$u = e^x\cos y$, $v = -e^x\sin y$`],
          [t`$u = 2x + 1$, $v = 2y$`, t`$u = 2x$, $v = -2y$`, t`$u = x^2$, $v = y^2$`, t`$u = \cos x$, $v = \sin y$`],
          [t`$u = -y$, $v = x$`, t`$u = y$, $v = x$`, t`$u = x^2 - y^2$, $v = xy$`, t`$u = e^x\cos y$, $v = e^x\cos y$`],
          [t`$u = x^3 - 3xy^2$, $v = 3x^2y - y^3$`, t`$u = x^3$, $v = y^3$`, t`$u = x^2 - y^2$, $v = -2xy$`, t`$u = x + y$, $v = x - y$`],
        ]);
        return {
          prompt: 'Which of these is analytic on the whole plane?',
          visual: uvPic('x', '2*y', [0.5, 0.5], 'A non-example for comparison: u = x, v = 2y squashes small discs into ellipses.', { wx: [-3, 3], wy: [-4, 4] }),
          ...(() => {
            const k = r.int(0, 3), ch = [...set.slice(1, k + 1), set[0], ...set.slice(k + 1)];
            const msg = t`Compute all four partial derivatives: $u_x = v_y$ or $u_y = -v_x$ fails here except on a line or at a point, so the function is not analytic.`;
            return { choices: ch, answer: k, why: Object.fromEntries([0, 1, 2, 3].filter((j) => j !== k).map((j) => [j, msg])) };
          })(),
          hints: [t`Test $u_x = v_y$ and $u_y = -v_x$ for each.`, 'A linear pair (u, v) is analytic only if its matrix has the turn-and-stretch shape.'],
          teach: 'Analytic on the plane means the Cauchy–Riemann equations hold at every point.',
          explain: t`${set[0]} passes both equations everywhere: it is $${set[0].includes('+ x') ? 'z^2 + z' : set[0].includes('+ 1') ? '2z + 1' : set[0].includes('-y') ? 'iz' : 'z^3'}$. Each of the others breaks at least one equation except on a line or a point.`,
        };
      },
    }),
    num({
      id: 'cp-fprime', difficulty: 2,
      gen(r) {
        const x = r.pick([0, 0.5, 1]), y = r.pick([0.5, 1, 2, -1]);
        const ans = Math.exp(x) * Math.cos(y);
        return {
          prompt: t`$u = e^x\cos y$, $v = e^x\sin y$. Find the real part of $f'$ at $z = ${cTeX([x, y])}$, to 3 significant figures.`,
          visual: uvPic('e^x*cos(y)', 'e^x*sin(y)', [x, y], t`The map and the small disc at $z$ (axes without numbers).`, { x: [-2, 2], y: [-2.5, 2.5], wx: [-4, 4], wy: [-4, 4], ticks: false }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: apart(ans, [{ value: Math.exp(x) * Math.sin(y), feedback: t`That is $v_x$, the imaginary part of $f'$.` }, { value: -Math.exp(x) * Math.sin(y), feedback: t`That is $u_y$. The real part of $f'$ is $u_x$.` }]),
          hints: [t`$\operatorname{Re} f' = u_x$.`],
          teach: t`$f' = u_x + i\,v_x$.`,
          explain: t`$u_x = e^x\cos y = e^{${x}}\cos(${y}) = ${nm(ans, 3)}$. (This $f$ is $e^z$, so $f' = e^z$.)`,
        };
      },
    }),
    num({
      id: 'cp-flow', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([1, 2, 3]);
        const ans = -2 * A;
        return {
          prompt: t`In a wind-tunnel model, a 2D velocity field is $(p, q) = \big(${A}(x^2 - y^2),\ a\,xy\big)$. For ideal flow it must be **incompressible**, $p_x + q_y = 0$, and **irrotational**, $q_x - p_y = 0$ — together, the Cauchy–Riemann equations for $u = p$, $v = -q$. Find the constant $a$.`,
          visual: { type: 'field2d', params: { P: `${A}*(x^2 - y^2)`, Q: `${-2 * A}*x*y`, x: [-2, 2], y: [-2, 2], density: 14, particles: true, readout: false, probe: false }, caption: 'The velocity field for the right value of a (arrows coloured by speed). Ideal flow: no viscosity.' },
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: apart(ans, [{ value: 2 * A, feedback: t`$p_x = ${2 * A}x$ and $q_y = a\,x$: they must **cancel**.` }]),
          hints: [t`$p_x = ${2 * A}x$ and $q_y = a\,x$.`, t`Incompressible: $${2 * A}x + a x = 0$. Check irrotational too: $q_x - p_y = a y + ${2 * A}y$.`],
          teach: t`A 2D flow that is both incompressible and irrotational is the conjugate of an analytic function: $p - iq$ is analytic.`,
          explain: t`Both conditions give $a = ${ans}$. Then $p - iq = ${A}(x^2 - y^2) + i\,${2 * A}xy = ${A === 1 ? '' : A}z^2$, analytic — the flow into a corner of the previous module, turned.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 4–5', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), ch. 2', url: 'https://openlibrary.org/isbn/9780073383170' },
  ],
});
