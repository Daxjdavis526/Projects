// The wedge product: (α∧β)(u, v) = α(u)β(v) − α(v)β(u), antisymmetric;
// dx∧dy measures the oriented area of a parallelogram's shadow on the
// xy-plane; in 3D the three shadows are the components of u × v; k-forms
// number C(n, k); the top form is the determinant; dx∧dy = r dr∧dθ; a solar
// panel's intercepted power.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);
const C = (n, k) => { let c = 1; for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1); return c; };

// two 1-forms drawn as stacks of lines (unit spacing): their cells are the units of α∧β
const stacks = (a, b, { caption, arrows = [], range = 6 } = {}) => {
  const lines = (w, color) => Array.from({ length: 2 * range + 1 }, (_, i) => i - range).map((k) => (Math.abs(w[1]) > 1e-9 ? { fn: `(${k} - ${w[0]}*x)/(${w[1]})`, color, width: k === 0 ? 2 : 1.1 } : { param: [String(r6(k / w[0])), 't'], t: [-3, 3], color, width: k === 0 ? 2 : 1.1 }));
  return { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.5, 1.5], equal: true, aspect: 'wide', grid: false, xticks: 5, yticks: 3, curves: [...lines(a, 'teal'), ...lines(b, 'violet')], arrows }, caption };
};
// a parallelogram in space with its shadow on one coordinate plane (calc-vectors3d)
const shadowPic = (u, v, plane, { caption, extra = {} } = {}) => {
  const proj = (w) => (plane === 'xy' ? [w[0], w[1], 0] : plane === 'yz' ? [0, w[1], w[2]] : [w[0], 0, w[2]]);
  return {
    type: 'calc-vectors3d',
    params: {
      range: 2.2, yaw: 0.7, pitch: 0.35,
      vectors: [{ to: u, color: 'accent', label: t`\mathbf u` }, { to: v, color: 'gold', label: t`\mathbf v` }],
      parallelograms: [{ at: [0, 0, 0], u, v, color: 'gold', alpha: 0.3 }, { at: [0, 0, 0], u: proj(u), v: proj(v), color: 'violet', alpha: 0.35 }],
      segments: [u, v, u.map((x, i) => x + v[i])].map((w) => ({ from: w, to: proj(w), color: 'ink3', dash: true })),
      ...extra,
    },
    caption,
  };
};

// the explore: u and v on sliders, their parallelogram and its three shadows
const U = ['ux', 'uy', 'uz'], V = ['vx', 'vy', 'vz'];

export default lesson({
  id: 'st-c.C10.1',
  title: 'The wedge product',
  minutes: 13, difficulty: 3,
  equation: t`(\alpha\wedge\beta)(\mathbf u, \mathbf v) = \alpha(\mathbf u)\,\beta(\mathbf v) - \alpha(\mathbf v)\,\beta(\mathbf u)`,
  intro: t`A 1-form measures how far an arrow reaches. The **wedge product** of two 1-forms measures how much **oriented area** two arrows span: feed $\alpha\wedge\beta$ the pair $(\mathbf u, \mathbf v)$ and it returns the signed area of their parallelogram as seen through $\alpha$ and $\beta$. Swapping $\mathbf u$ and $\mathbf v$ reverses the orientation and the sign, and two parallel arrows span nothing — so $\alpha\wedge\beta = -\beta\wedge\alpha$ and $\alpha\wedge\alpha = 0$.

The basic case: $dx\wedge dy\,(\mathbf u, \mathbf v) = u^xv^y - u^yv^x$, the signed area of the **shadow** of the parallelogram on the $xy$-plane. Antisymmetric tensors of this kind are **2-forms**; wedging more 1-forms gives 3-forms (volumes) and so on. In $n$ dimensions the $k$-forms make a space of dimension $\binom nk$; in 4D the electromagnetic field is a 2-form with $\binom42 = 6$ components — three of $\mathbf E$ and three of $\mathbf B$ (C10.4).`,
  symbols: [
    { tex: t`\alpha,\ \beta`, text: 'two 1-forms (covectors) at the same point' },
    { tex: t`\mathbf u,\ \mathbf v`, text: 'two vectors at that point, spanning a parallelogram' },
    { tex: t`\alpha(\mathbf u)`, text: t`the number $\alpha$ gives $\mathbf u$: how many of $\alpha$’s lines it crosses` },
    { tex: t`\alpha\wedge\beta`, text: t`their wedge product, a 2-form: an antisymmetric machine that eats two vectors. Convention: $\alpha\wedge\beta = \alpha\otimes\beta - \beta\otimes\alpha$, with no factor $\tfrac12$ (some books include one)` },
  ],
  why: t`Forms are what get integrated: a 2-form over surfaces, a 3-form over volumes, a 4-form over regions of spacetime. They need no metric to do it — only an orientation — which is why the field strength $F$ and the conservation laws of GR are written with them.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'One parallelogram, three shadows',
    lead: t`Two vectors $\mathbf u$ (blue) and $\mathbf v$ (gold) span a parallelogram. Its shadows on the three coordinate planes are the values of $dy\wedge dz$, $dz\wedge dx$ and $dx\wedge dy$ on $(\mathbf u, \mathbf v)$. Drag to turn the view.`,
    tasks: [
      t`Swap the roles: set $\mathbf v$ to what $\mathbf u$ was and vice versa. Every reading flips sign — the orientation reversed.`,
      t`Make $\mathbf v$ a multiple of $\mathbf u$: all three areas vanish. That is $\alpha\wedge\alpha = 0$.`,
      t`Set $u^z = v^z = 0$: the parallelogram lies in the $xy$-plane, $dx\wedge dy$ is its whole area and the other two vanish. Compare the three readings with $\mathbf u\times\mathbf v$ — the same numbers.`,
    ],
    params: {
      range: 2.4, yaw: 0.7, pitch: 0.35,
      sliders: [
        { key: 'ux', label: t`$u^x$`, min: -2, max: 2, step: 0.1, value: 1.6, explain: 'First component of u.' },
        { key: 'uy', label: t`$u^y$`, min: -2, max: 2, step: 0.1, value: 0.2, explain: 'Second component of u.' },
        { key: 'uz', label: t`$u^z$`, min: -2, max: 2, step: 0.1, value: 0.6, explain: 'Third component of u.' },
        { key: 'vx', label: t`$v^x$`, min: -2, max: 2, step: 0.1, value: 0.3, explain: 'First component of v.' },
        { key: 'vy', label: t`$v^y$`, min: -2, max: 2, step: 0.1, value: 1.4, explain: 'Second component of v.' },
        { key: 'vz', label: t`$v^z$`, min: -2, max: 2, step: 0.1, value: 1, explain: 'Third component of v.' },
      ],
      vectors: [{ to: U, color: 'accent', label: t`\mathbf u` }, { to: V, color: 'gold', label: t`\mathbf v` }],
      parallelograms: [
        { at: [0, 0, 0], u: U, v: V, color: 'gold', alpha: 0.28 },
        { at: [0, 0, 0], u: ['ux', 'uy', 0], v: ['vx', 'vy', 0], color: 'violet', alpha: 0.3 },
        { at: [0, 0, 0], u: [0, 'uy', 'uz'], v: [0, 'vy', 'vz'], color: 'teal', alpha: 0.3 },
        { at: [0, 0, 0], u: ['ux', 0, 'uz'], v: ['vx', 0, 'vz'], color: 'accent', alpha: 0.22 },
      ],
      readouts: [
        { label: t`$dy\wedge dz\,(\mathbf u, \mathbf v)$ (teal)`, expr: 'uy*vz - uz*vy', digits: 3 },
        { label: t`$dz\wedge dx\,(\mathbf u, \mathbf v)$ (blue)`, expr: 'uz*vx - ux*vz', digits: 3 },
        { label: t`$dx\wedge dy\,(\mathbf u, \mathbf v)$ (violet)`, expr: 'ux*vy - uy*vx', digits: 3 },
        { label: t`$\mathbf u\times\mathbf v$`, vec: ['uy*vz - uz*vy', 'uz*vx - ux*vz', 'ux*vy - uy*vx'], digits: 3 },
      ],
    },
    caption: t`To scale. The shadow areas are signed: positive when $\mathbf u$ turns toward $\mathbf v$ anticlockwise as seen from the positive side of the missing axis. Matching them to $\mathbf u\times\mathbf v$ uses the Euclidean metric and the right-hand rule; the 2-form itself needs neither.`,
  },
  example: {
    prompt: t`On the plane, let $\alpha = dx + 2\,dy$ and $\beta = 3\,dx - dy$. Write $\alpha\wedge\beta$ as a multiple of $dx\wedge dy$, and evaluate it on $\mathbf u = (1, 1)$, $\mathbf v = (0, 2)$ two ways.`,
    visual: { type: 'la-det', params: { cols: [[1, 1], [0, 2]], names: ['u', 'v'], readout: ['det'] }, caption: t`The parallelogram of $\mathbf u$ and $\mathbf v$; $dx\wedge dy$ gives its signed area, $+2$ (turning from $\mathbf u$ to $\mathbf v$ is anticlockwise).` },
    steps: [
      { label: 'Expand', text: t`$\alpha\wedge\beta = (dx + 2\,dy)\wedge(3\,dx - dy) = 3\,dx\wedge dx - dx\wedge dy + 6\,dy\wedge dx - 2\,dy\wedge dy$.` },
      { label: 'Simplify', text: t`$dx\wedge dx = dy\wedge dy = 0$ and $dy\wedge dx = -dx\wedge dy$: $\alpha\wedge\beta = (-1 - 6)\,dx\wedge dy = -7\,dx\wedge dy$. In general the coefficient is $\alpha_x\beta_y - \alpha_y\beta_x$.` },
      { label: 'Evaluate via area', text: t`$dx\wedge dy(\mathbf u, \mathbf v) = 1\cdot 2 - 1\cdot 0 = 2$, so $\alpha\wedge\beta(\mathbf u, \mathbf v) = -14$.` },
      { label: 'Evaluate directly', text: t`$\alpha(\mathbf u) = 3$, $\beta(\mathbf v) = -2$, $\alpha(\mathbf v) = 4$, $\beta(\mathbf u) = 2$: $3\cdot(-2) - 4\cdot 2 = -14$ ✓.` },
      { label: 'Sense check', text: t`In 2D every 2-form is a multiple of $dx\wedge dy$ ($\binom22 = 1$), so $\alpha\wedge\beta$ is just “area, scaled by $-7$”. The $-7$ is the determinant of the matrix with rows $(1, 2)$ and $(3, -1)$.` },
    ],
    answer: t`$\alpha\wedge\beta = -7\,dx\wedge dy$, and $(\alpha\wedge\beta)(\mathbf u, \mathbf v) = -14$ both ways.`,
  },
  practice: [
    num({
      id: 'dxdy', difficulty: 1,
      gen(r) {
        const u = [r.pick([1, 2, 3]), r.pick([0, 1, -1])], v = [r.pick([-1, 0, 1]), r.pick([1, 2, 3])];
        const d = u[0] * v[1] - u[1] * v[0];
        return {
          prompt: t`Evaluate $dx\wedge dy$ on $\mathbf u = (${u.join(', ')})$ and $\mathbf v = (${v.join(', ')})$, in that order.`,
          visual: { type: 'la-det', params: { cols: [u, v], names: ['u', 'v'], tint: false, readout: false }, caption: 'The parallelogram spanned by u and v (no sign shown).' },
          answer: d, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -d, feedback: t`Order matters: $dx\wedge dy(\mathbf u, \mathbf v) = u^xv^y - u^yv^x$.` }, { value: u[0] * v[1] + u[1] * v[0], feedback: 'The wedge subtracts the swapped product: it is antisymmetric.' }].filter((e) => Math.abs(e.value - d) > 0.01),
          hints: [t`$dx\wedge dy(\mathbf u, \mathbf v) = dx(\mathbf u)\,dy(\mathbf v) - dx(\mathbf v)\,dy(\mathbf u)$.`],
          teach: 'dx∧dy on two vectors is the signed area of their parallelogram — the 2×2 determinant.',
          explain: t`$${u[0]}\cdot${v[1]} - (${u[1]})(${v[0]}) = ${d}$: the parallelogram has area $${Math.abs(d)}$, ${d > 0 ? 'positive because the turn from u to v is anticlockwise' : 'negative because the turn from u to v is clockwise'}.`,
        };
      },
    }),
    num({
      id: 'wedge-coef', difficulty: 2,
      gen(r) {
        const a = [r.pick([1, 2, -1]), r.pick([1, 3, -2])], b = [r.pick([2, -1, 1]), r.pick([1, 2, -1])];
        const c = a[0] * b[1] - a[1] * b[0];
        const ok = Math.abs(c) > 0;
        const bb = ok ? b : [b[0], b[1] + 1];
        const cc = a[0] * bb[1] - a[1] * bb[0];
        const fm = (w) => t`${w[0] === 1 ? '' : w[0] === -1 ? '-' : w[0]}\,dx ${w[1] < 0 ? '-' : '+'} ${Math.abs(w[1]) === 1 ? '' : Math.abs(w[1])}\,dy`;
        return {
          prompt: t`For $\alpha = ${fm(a)}$ and $\beta = ${fm(bb)}$, write $\alpha\wedge\beta = c\,dx\wedge dy$. What is $c$?`,
          visual: stacks(a, bb, { caption: t`The stacks of $\alpha$ (teal) and $\beta$ (violet), lines one unit apart. Together they cut the plane into cells; $|c|$ is the number of cells per unit area.` }),
          answer: cc, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -cc, feedback: t`$\alpha\wedge\beta = (\alpha_x\beta_y - \alpha_y\beta_x)\,dx\wedge dy$ — check which product comes first.` }, { value: a[0] * bb[1] + a[1] * bb[0], feedback: t`$dy\wedge dx = -dx\wedge dy$: the cross terms subtract.` }].filter((e) => Math.abs(e.value - cc) > 0.01),
          hints: [t`Expand and use $dx\wedge dx = dy\wedge dy = 0$, $dy\wedge dx = -dx\wedge dy$.`, t`$c = \alpha_x\beta_y - \alpha_y\beta_x$.`],
          teach: t`In 2D, $\alpha\wedge\beta = (\alpha_x\beta_y - \alpha_y\beta_x)\,dx\wedge dy$: the determinant of the two covectors’ components.`,
          explain: t`$c = (${a[0]})(${bb[1]}) - (${a[1]})(${bb[0]}) = ${cc}$. Geometrically, $|c|$ counts the cells the two stacks make per unit area: a 2-form is a honeycomb of oriented tubes.`,
        };
      },
    }),
    mcq({
      id: 'alpha-alpha', difficulty: 2,
      prompt: t`For any 1-forms $\alpha$ and $\beta$, which statement is true?`,
      visual: { type: 'la-det', params: { cols: [[2, 1], [3, 1.5]], names: ['u', 'v'], readout: false }, caption: 'Two parallel arrows span a parallelogram of zero area.' },
      choices: [
        t`$\alpha\wedge\alpha = 0$ and $\beta\wedge\alpha = -\alpha\wedge\beta$`,
        t`$\alpha\wedge\alpha = 2\,\alpha\otimes\alpha$ and $\beta\wedge\alpha = \alpha\wedge\beta$`,
        t`$\alpha\wedge\alpha = \alpha^2$, a positive 2-form`,
        t`$\alpha\wedge\beta = 0$ whenever $\alpha$ and $\beta$ are both nonzero`,
      ],
      answer: 0,
      why: {
        1: t`The wedge is antisymmetric: $\alpha\otimes\beta - \beta\otimes\alpha$ changes sign when $\alpha$ and $\beta$ swap, and vanishes when they are equal.`,
        2: t`$\alpha\wedge\alpha(\mathbf u, \mathbf v) = \alpha(\mathbf u)\alpha(\mathbf v) - \alpha(\mathbf v)\alpha(\mathbf u) = 0$.`,
        3: t`$dx\wedge dy \ne 0$ although $dx$ and $dy$ are nonzero; the wedge vanishes only when they are parallel.`,
      },
      hints: [t`Put $\beta = \alpha$ in the defining formula.`],
      teach: 'The wedge product is antisymmetric: α∧β = −β∧α, so α∧α = 0.',
      explain: t`So $\alpha\wedge\beta = 0$ exactly when $\alpha$ and $\beta$ are parallel — the stacks never cross, and the cells have no area. This is the algebra of “oriented area”: no area without two independent directions.`,
    }),
    num({
      id: 'shadow', difficulty: 2,
      gen(r) {
        const u = [r.pick([1, 1.5, 2]), r.pick([0, 0.5, -0.5]), r.pick([0.5, 1, -1])];
        const v = [r.pick([0, 0.5, -0.5]), r.pick([1, 1.5]), r.pick([1, 1.5, -0.5])];
        const plane = r.pick(['xy', 'yz', 'zx']);
        const val = plane === 'xy' ? u[0] * v[1] - u[1] * v[0] : plane === 'yz' ? u[1] * v[2] - u[2] * v[1] : u[2] * v[0] - u[0] * v[2];
        const name = { xy: t`dx\wedge dy`, yz: t`dy\wedge dz`, zx: t`dz\wedge dx` }[plane];
        return {
          prompt: t`In space, $\mathbf u = (${u.join(', ')})$ and $\mathbf v = (${v.join(', ')})$. Evaluate $${name}\,(\mathbf u, \mathbf v)$ — the signed area of the parallelogram’s shadow on the ${plane === 'zx' ? 'zx' : plane}-plane.`,
          visual: shadowPic(u, v, plane, { caption: t`The parallelogram (gold) and its shadow (violet) on the coordinate plane, dropped along dashed lines.` }),
          answer: val, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -val, feedback: plane === 'zx' ? t`The order is $dz\wedge dx$: $u^zv^x - u^xv^z$ (cyclic order x → y → z → x).` : 'Check the order of the two products.' }].filter((e) => Math.abs(e.value - val) > 0.01),
          hints: [t`$${name}(\mathbf u, \mathbf v)$ uses only two components of each vector.`, plane === 'xy' ? t`$u^xv^y - u^yv^x$.` : plane === 'yz' ? t`$u^yv^z - u^zv^y$.` : t`$u^zv^x - u^xv^z$.`],
          teach: 'Each basis 2-form in 3D measures the signed area of a parallelogram’s shadow on one coordinate plane.',
          explain: t`$${name}(\mathbf u, \mathbf v) = ${nice(val)}$ — the ${plane === 'xy' ? 'z' : plane === 'yz' ? 'x' : 'y'}-component of $\mathbf u\times\mathbf v$. The three shadows together are the cross product; but the 2-form is the more basic object, and it exists in any dimension, where no cross product does.`,
        };
      },
    }),
    num({
      id: 'count-forms', difficulty: 2,
      gen(r) {
        const [n, k, ctx] = r.pick([[4, 2, 'the electromagnetic field strength'], [4, 3, 'the current 3-forms of spacetime'], [3, 2, 'fluxes in space'], [5, 2, 'a five-dimensional Kaluza–Klein spacetime'], [4, 4, 'volume forms on spacetime']]);
        const ans = C(n, k);
        return {
          prompt: t`How many independent components does a $${k}$-form have in $${n}$ dimensions? (Context: ${ctx}.)`,
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: n ** k, feedback: t`That counts all $${k}$-index arrays; antisymmetry leaves only increasing index lists $\mu_1 < \dots < \mu_${k}$.` }, ...(k === 2 ? [{ value: (n * n - n) / 2 + n, feedback: 'That is the count for symmetric tensors. Antisymmetric ones also lose the diagonal.' }] : [])].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`A basis is $dx^{\mu_1}\wedge\dots\wedge dx^{\mu_${k}}$ with $\mu_1 < \dots < \mu_${k}$: choose $${k}$ of the $${n}$ coordinates.`, t`$\binom{${n}}{${k}} = \dfrac{${n}!}{${k}!\,${n - k}!}$.`],
          teach: 'k-forms in n dimensions form a space of dimension n choose k.',
          explain: t`$\binom{${n}}{${k}} = ${ans}$. ${n === 4 && k === 2 ? 'Six: three for E and three for B — one 2-form, not two vectors.' : n === 4 && k === 4 ? 'One: every 4-form on spacetime is a multiple of dt∧dx∧dy∧dz.' : ''}`,
        };
      },
    }),
    num({
      id: 'polar-patch', difficulty: 3,
      gen(r) {
        const rr = r.pick([2, 3, 2.5]), dr = r.pick([0.1, 0.2]), dth = r.pick([0.05, 0.1]);
        const A = (rr + dr / 2) * dr * dth;
        return {
          prompt: t`Pulled back to polar coordinates, $dx\wedge dy = r\,dr\wedge d\theta$. Use it to find the area of the small patch $${rr} \le r \le ${rr + dr}$, $0 \le \theta \le ${dth}$ (to first order).`,
          visual: { type: 'graph', params: { x: [-0.3, 3.6], y: [-0.2, 1.8], equal: true, aspect: 'wide', xticks: 5, yticks: 3, shade: [], curves: [...[1, 2, 3].map((k) => ({ param: [`${k}*cos(t)`, `${k}*sin(t)`], t: [0, 0.6], color: 'ink4' })), { param: [`${rr}*cos(t)`, `${rr}*sin(t)`], t: [0, dth], color: 'gold', width: 2.4 }, { param: [`${rr + dr}*cos(t)`, `${rr + dr}*sin(t)`], t: [0, dth], color: 'gold', width: 2.4 }, { param: ['t', '0'], t: [rr, rr + dr], color: 'gold', width: 2.4 }, { param: [`t*cos(${dth})`, `t*sin(${dth})`], t: [rr, rr + dr], color: 'gold', width: 2.4 }, { param: [`t*cos(${dth})`, `t*sin(${dth})`], t: [0, 3.4], color: 'ink4', dash: [4, 4] }] }, caption: 'The patch (gold) between two circles and two rays.' },
          answer: A, tol: { rel: 0.06 },
          errors: [{ value: dr * dth, feedback: t`$dr\wedge d\theta$ alone is not area: the pullback brings the factor $r$, the Jacobian of polar coordinates.` }].filter((e) => Math.abs(e.value - A) > 0.08 * A),
          hints: [t`$\int r\,dr\,d\theta \approx r\,\Delta r\,\Delta\theta$ for a small patch.`, t`$${rr}\times${dr}\times${dth}$, or integrate exactly.`],
          teach: 'Pulling back dx∧dy to polar coordinates gives r dr∧dθ: the Jacobian appears automatically from the wedge product.',
          explain: t`$r\,\Delta r\,\Delta\theta \approx ${nice(rr * dr * dth, 4)}$; integrating exactly, $\tfrac12(${nice((rr + dr) ** 2)} - ${nice(rr * rr)})\times${dth} = ${nice(A, 4)}$ (either is accepted). Where does $r$ come from? $dx\wedge dy = (\cos\theta\,dr - r\sin\theta\,d\theta)\wedge(\sin\theta\,dr + r\cos\theta\,d\theta) = r(\cos^2\theta + \sin^2\theta)\,dr\wedge d\theta$.`,
        };
      },
    }),
    order({
      id: 'antisym', difficulty: 3,
      prompt: t`A bilinear $\omega$ with $\omega(\mathbf u, \mathbf u) = 0$ for every $\mathbf u$ (“parallel arrows span no area”) must be antisymmetric. Order the steps of the proof.`,
      visual: { type: 'la-det', params: { cols: [[2, 0.5], [0.8, 1.6]], names: ['u', 'v'], readout: false }, caption: 'Swapping u and v reverses the turning arrow and the sign of the area.' },
      items: [
        t`Apply the hypothesis to $\mathbf u + \mathbf v$: $\omega(\mathbf u + \mathbf v, \mathbf u + \mathbf v) = 0$.`,
        t`Expand by bilinearity: $\omega(\mathbf u, \mathbf u) + \omega(\mathbf u, \mathbf v) + \omega(\mathbf v, \mathbf u) + \omega(\mathbf v, \mathbf v) = 0$.`,
        t`The first and last terms vanish by the hypothesis.`,
        t`So $\omega(\mathbf u, \mathbf v) = -\omega(\mathbf v, \mathbf u)$.`,
      ],
      hints: ['Feed ω a sum of two vectors in both slots.', 'Bilinear means: linear in each slot separately.'],
      teach: 'For a bilinear form, “zero on parallel arrows” and “antisymmetric” are the same condition.',
      explain: t`The converse holds too: antisymmetry gives $\omega(\mathbf u, \mathbf u) = -\omega(\mathbf u, \mathbf u)$, so it is 0. Either property characterizes 2-forms.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-panel', difficulty: 3, transfer: true,
      gen(r) {
        const u = [r.pick([0.5, 1, -0.5]), r.pick([2, 2.5]), r.pick([0, 0.4])], v = [r.pick([1, 0.8, 1.2]), r.pick([0, 0.3, -0.3]), r.pick([1.2, 1.5])];
        const S = 1361, A = u[1] * v[2] - u[2] * v[1], P = S * Math.abs(A);
        return {
          prompt: t`A spacecraft’s rectangular-ish solar array is the parallelogram spanned by the edges $\mathbf u = (${u.join(', ')})$ m and $\mathbf v = (${v.join(', ')})$ m. Sunlight arrives along the $-x$ direction with the solar constant $1361\ \text{W/m}^2$. The sunlight intercepted is $1361\ \text{W/m}^2 \times |dy\wedge dz\,(\mathbf u, \mathbf v)|$ — the area of the array’s shadow on the $yz$-plane. How many watts of sunlight does it intercept?`,
          visual: shadowPic(u, v, 'yz', { caption: 'The array (gold) and its shadow (violet) on the yz-plane, which is what light arriving along x sees.', extra: { vectors: [{ to: u, color: 'accent', label: t`\mathbf u` }, { to: v, color: 'gold', label: t`\mathbf v` }, { from: [2.4, 1, 0.8], to: [1.4, 1, 0.8], color: 'warn', label: t`\text{sun}` }] } }),
          answer: P, units: 'W', tol: { rel: 0.005 },
          errors: [{ value: S * Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]), feedback: 'That is the full area of the array. Only its projection across the sunlight counts: the dy∧dz shadow.' }, { value: S * Math.abs(u[0] * v[1] - u[1] * v[0]), feedback: 'Light travelling along x sees the shadow on the yz-plane, not the xy-plane.' }].filter((e) => Math.abs(e.value - P) > 0.01 * P),
          hints: [t`$dy\wedge dz(\mathbf u, \mathbf v) = u^yv^z - u^zv^y$.`, t`$= ${u[1]}\cdot${v[2]} - ${u[2]}\cdot(${v[1]})$ m².`],
          teach: 'The flux of a uniform beam through a parallelogram is the beam strength times the 2-form that measures area across the beam.',
          explain: t`$dy\wedge dz(\mathbf u, \mathbf v) = ${nice(A, 4)}\ \text{m}^2$, so $P = 1361\times${nice(Math.abs(A), 4)} = ${nice(P, 4)}$ W of sunlight (the panels convert perhaps 30% of it). The flux 2-form of a beam along $x$ is $S\,dy\wedge dz$: integrating forms over surfaces (C10.3) is exactly this, added up.`,
        };
      },
    }),
    num({
      id: 'cp-eval', difficulty: 2,
      gen(r) {
        const a = [r.pick([1, 2]), r.pick([-1, 1, 3])], b = [r.pick([0, 1, -2]), r.pick([1, 2])];
        const u = [r.pick([1, 2]), r.pick([0, 1])], v = [r.pick([-1, 1]), r.pick([2, 3])];
        const au = a[0] * u[0] + a[1] * u[1], av = a[0] * v[0] + a[1] * v[1], bu = b[0] * u[0] + b[1] * u[1], bv = b[0] * v[0] + b[1] * v[1];
        const ans = au * bv - av * bu;
        return {
          prompt: t`With $\alpha = ${a[0]}\,dx + (${a[1]})\,dy$ and $\beta = ${b[0]}\,dx + ${b[1]}\,dy$, evaluate $(\alpha\wedge\beta)(\mathbf u, \mathbf v)$ for $\mathbf u = (${u.join(', ')})$, $\mathbf v = (${v.join(', ')})$.`,
          visual: { type: 'la-det', params: { cols: [u, v], names: ['u', 'v'], tint: false, readout: false }, caption: 'The parallelogram spanned by u and v.' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: au * bv + av * bu, feedback: 'Subtract the swapped term: α(u)β(v) − α(v)β(u).' }, { value: -ans, feedback: 'The first term is α(u)β(v).' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\alpha(\mathbf u) = ${au}$, $\alpha(\mathbf v) = ${av}$, $\beta(\mathbf u) = ${bu}$, $\beta(\mathbf v) = ${bv}$.`],
          teach: t`$\alpha\wedge\beta(\mathbf u, \mathbf v) = \alpha(\mathbf u)\beta(\mathbf v) - \alpha(\mathbf v)\beta(\mathbf u)$, or equivalently $(\alpha_x\beta_y - \alpha_y\beta_x)$ times the signed area of $\mathbf u$, $\mathbf v$.`,
          explain: t`$${au}\cdot${bv} - ${av}\cdot${bu} = ${ans}$. Check: $(\alpha_x\beta_y - \alpha_y\beta_x)\det[\mathbf u\ \mathbf v] = ${a[0] * b[1] - a[1] * b[0]}\times${u[0] * v[1] - u[1] * v[0]} = ${(a[0] * b[1] - a[1] * b[0]) * (u[0] * v[1] - u[1] * v[0])}$ ✓.`,
        };
      },
    }),
    mcq({
      id: 'cp-top', difficulty: 2,
      prompt: t`The 3-form $dx\wedge dy\wedge dz$ gives the signed volume of the box spanned by three vectors. What is $dx\wedge dy\wedge dz\,(\mathbf e_y, \mathbf e_x, \mathbf e_z)$, with the unit vectors in that order?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, vectors: [{ to: [0, 1, 0], color: 'accent', label: t`\mathbf e_y` }, { to: [1, 0, 0], color: 'gold', label: t`\mathbf e_x` }, { to: [0, 0, 1], color: 'violet', label: t`\mathbf e_z` }], parallelograms: [{ at: [0, 0, 0], u: [1, 0, 0], v: [0, 1, 0], color: 'ink3', alpha: 0.15 }] }, caption: 'The unit cube’s three edges, fed to the 3-form in the order shown.' },
      choices: [t`$-1$`, t`$1$`, t`$0$`, t`$3$`],
      answer: 0,
      why: {
        1: 'The volume is 1, but the order (y, x, z) is a left-handed one: one swap from (x, y, z) flips the sign.',
        2: 'The three vectors are independent, so the volume is not zero.',
        3: 'The 3-form is multilinear and antisymmetric, not a sum of the three lengths.',
      },
      hints: [t`$dx\wedge dy\wedge dz(\mathbf a, \mathbf b, \mathbf c) = \det[\mathbf a\ \mathbf b\ \mathbf c]$.`, 'Swapping two columns of a determinant changes its sign.'],
      teach: 'The top form dx∧dy∧dz is the determinant: it measures signed volume and flips sign with orientation.',
      explain: t`$\det[\mathbf e_y\ \mathbf e_x\ \mathbf e_z] = -1$. Integration of forms (C10.3) needs exactly this: a choice of orientation saying which ordered bases count as positive.`,
    }),
  ],
  sources: [
    { label: 'Needham, Visual Differential Geometry and Forms, ch. 33–34', url: 'https://press.princeton.edu/books/paperback/9780691203706/visual-differential-geometry-and-forms' },
    { label: 'Carroll, Spacetime and Geometry, §2.9', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
