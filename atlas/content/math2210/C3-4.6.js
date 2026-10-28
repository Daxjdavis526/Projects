// Change of variables and the Jacobian: a map (u, v) ↦ (x, y) stretches each
// little cell by |∂(x, y)/∂(u, v)|, so dA = |J| du dv. Polar's r and
// spherical's r² sin θ are Jacobians; general relativity's √|g| d⁴x is the
// same bookkeeping when the stretching is built into the geometry (a preview).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { r6 } from './_integrals.js';

const t = String.raw;

// the maps the lesson draws on c3-jacobian
const POLAR = { label: 'Polar', x: 'u*cos(v)', y: 'u*sin(v)', u: [0, 2], v: [0, 'pi'], uName: 'r', vName: 'θ', uTeX: 'r', vTeX: '\\theta', Jtex: 'r', view: { x: [-2.3, 2.3], y: [-0.25, 2.3] }, cell: [1.2, 0.8] };
const SHEAR = { label: 'Linear', x: '(u + v)/2', y: '(u - v)/2', u: [0, 2], v: [0, 1], Jtex: '\\tfrac12', view: { x: [-0.2, 1.7], y: [-0.7, 1.2] }, cell: [0.8, 0.3] };
const SQUARE = { label: 'Squaring', x: 'u^2 - v^2', y: '2*u*v', u: [0.3, 1.4], v: [0, 1.1], Jtex: '4(u^2 + v^2)', view: { x: [-1.3, 2.1], y: [-0.2, 3.2] }, cell: [1, 0.5] };
const jac = (maps, caption, extra = {}) => ({ type: 'c3-jacobian', params: { maps, readout: false, sliders: false, ...extra }, caption });

export default lesson({
  id: 'math2210.C3-4.6',
  title: 'Change of variables and the Jacobian',
  minutes: 13, difficulty: 3,
  intro: t`New coordinates are a map $x = x(u, v)$, $y = y(u, v)$. A small rectangle $du \times dv$ in the $(u, v)$ plane lands in the $(x, y)$ plane as a small curvy patch — nearly the parallelogram spanned by $\mathbf r_u\,du$ and $\mathbf r_v\,dv$, where $\mathbf r_u = (x_u, y_u)$ and $\mathbf r_v = (x_v, y_v)$ are the partial derivatives. A parallelogram's area is a determinant, so the patch has area $|J|\,du\,dv$, and

$$\iint_D f\,dx\,dy = \iint_S f\big(x(u, v), y(u, v)\big)\,|J|\,du\,dv, \qquad J = \frac{\partial(x, y)}{\partial(u, v)} = x_u\,y_v - x_v\,y_u$$

**The Jacobian determinant is the local area-stretching factor of the map.** Polar coordinates give $J = r$ — the $r$ in $r\,dr\,d\theta$ — and the $3\times3$ Jacobian of spherical coordinates is $r^2\sin\theta$. *Preview:* in general relativity the volume element is $\sqrt{|g|}\,d^4x$, the same idea, with the stretching read off the metric.`,
  symbols: [
    { tex: 'u,\\ v', text: t`the new coordinates; the map takes a region $S$ of the $(u, v)$ plane one-to-one onto the region $D$ of the $(x, y)$ plane` },
    { tex: 'x_u = \\partial x/\\partial u', text: t`partial derivatives of the map: $\mathbf r_u = (x_u, y_u)$ is the direction (and speed) in which the point moves when $u$ increases` },
    { tex: 'J = \\dfrac{\\partial(x, y)}{\\partial(u, v)}', text: t`the **Jacobian determinant**, $\det\begin{pmatrix} x_u & x_v \\ y_u & y_v \end{pmatrix}$: how many units of $(x, y)$ area each unit of $(u, v)$ area becomes, near a point` },
    { tex: '|J|', text: t`its absolute value: area is positive even where the map flips orientation ($J < 0$)` },
    { tex: 'S,\\ D', text: t`the region in the $(u, v)$ plane and its image in the $(x, y)$ plane. Choose $u$, $v$ so that $S$ is a rectangle` },
  ],
  why: t`Every coordinate system's volume element — $r\,dr\,d\theta$, $r^2\sin\theta\,dr\,d\theta\,d\phi$, and in relativity $\sqrt{|g|}\,d^4x$ — is a Jacobian: the bookkeeping that keeps an area or a volume the same number whatever labels you put on the points.`,
  visual: {
    type: 'c3-jacobian',
    title: 'A map stretches every little cell',
    lead: t`Top: a grid of equal cells in the $(u, v)$ plane. Bottom: the same grid after the map. The gold cell and its image are the same piece of the grid; the readout compares their areas. The dashed parallelogram, spanned by $\mathbf r_u\,\Delta u$ (blue) and $\mathbf r_v\,\Delta v$ (violet), is the straight-sided approximation whose area is $|J|\,\Delta u\,\Delta v$.`,
    tasks: [
      t`**Polar**: move the cell from $r = 0.3$ out to $r = 1.8$. The ratio of areas follows $|J| = r$: cells far from the origin are stretched more.`,
      t`**Linear**: put the cell anywhere — the ratio is always $\tfrac12$. A linear map stretches every area by the same factor, $|\det|$. (It also flips orientation: $J = -\tfrac12$.)`,
      t`**Squaring**: make the cell big and its image is visibly curved, so the ratio misses $|J|$ at the centre. Shrink it and the ratio settles on $|J| = 4(u^2 + v^2)$.`,
    ],
    params: { maps: [POLAR, SHEAR, SQUARE], size: 0.18 },
    caption: 'Top: the (u, v) rectangle. Bottom: its image, each cell tinted by how much the map stretched it; blue curves are u = constant, violet v = constant. Areas of the gold image are measured numerically from its edges.',
  },
  example: {
    prompt: t`Evaluate $\displaystyle\iint_D (x + y)\,e^{x - y}\,dA$, where $D$ is the region bounded by the lines $x + y = 0$, $x + y = 2$, $x - y = 0$ and $x - y = 1$.`,
    visual: { type: 'c3-jacobian', params: { maps: [{ ...SHEAR, cell: [1.2, 0.4] }], size: 0.2 }, caption: t`The map $x = \tfrac{u + v}{2}$, $y = \tfrac{u - v}{2}$ takes the rectangle $0 \le u \le 2$, $0 \le v \le 1$ (top) onto the tilted square $D$ (bottom). Every cell shrinks to half its area.` },
    steps: [
      { label: 'Read the new coordinates off the boundary', text: t`The sides are lines on which $x + y$ or $x - y$ is constant. So let $u = x + y$ and $v = x - y$: the region becomes the rectangle $S$: $0 \le u \le 2$, $0 \le v \le 1$.` },
      { label: 'Solve for x and y', text: t`Adding and subtracting: $x = \tfrac{u + v}{2}$, $y = \tfrac{u - v}{2}$.` },
      { label: 'The Jacobian', text: t`$J = \dfrac{\partial(x, y)}{\partial(u, v)} = \det\begin{pmatrix} \tfrac12 & \tfrac12 \\ \tfrac12 & -\tfrac12 \end{pmatrix} = -\tfrac14 - \tfrac14 = -\tfrac12$, so $|J| = \tfrac12$.` },
      { label: 'Transform and integrate', text: t`The integrand is $u\,e^{v}$, and over a rectangle it factors:
$$\iint_S u\,e^{v}\cdot\tfrac12\,du\,dv = \tfrac12\left(\int_0^2 u\,du\right)\left(\int_0^1 e^v\,dv\right) = \tfrac12\cdot 2\cdot(e - 1) = e - 1 \approx 1.718.$$` },
      { label: 'Sense check', text: t`With $f = 1$ the same steps give the area of $D$: $\tfrac12\times2\times1 = 1$ — and indeed $D$ is a rectangle with sides $\tfrac{2}{\sqrt2}$ and $\tfrac{1}{\sqrt2}$. A shortcut: $\tfrac{\partial(u, v)}{\partial(x, y)} = \det\begin{pmatrix}1 & 1\\1 & -1\end{pmatrix} = -2$, and the inverse map's Jacobian is its reciprocal, $-\tfrac12$.` },
    ],
    answer: t`$\displaystyle\iint_D (x + y)\,e^{x - y}\,dA = e - 1 \approx 1.718$`,
  },
  practice: [
    num({
      id: 'linear', difficulty: 1,
      gen(r) {
        let a, b, c, d;
        do { a = r.int(1, 3); b = r.intExcept(-2, 2, [0]); c = r.intExcept(-2, 2, [0]); d = r.int(1, 3); } while (Math.abs(a * d - b * c) < 1 || Math.abs(a * d - b * c) === Math.abs(a * d + b * c));
        const J = Math.abs(a * d - b * c);
        const term = (k, v, first) => (k === 0 ? '' : `${first ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + '}${Math.abs(k) === 1 ? '' : Math.abs(k)}${v}`);
        return {
          prompt: t`The map $x = ${term(a, 'u', true)}${term(b, 'v')}$, $y = ${term(c, 'u', true)}${term(d, 'v')}$ takes the $(u, v)$ plane to the $(x, y)$ plane. By what factor does it multiply areas?`,
          answer: J, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: Math.abs(a * d + b * c), feedback: t`The determinant subtracts: $x_u y_v - x_v y_u = (${a})(${d}) - (${b})(${c})$.` }],
          hints: [t`For a linear map the Jacobian is the determinant of the coefficients: $\det\begin{pmatrix} ${a} & ${b} \\ ${c} & ${d} \end{pmatrix}$.`],
          teach: 'A linear map stretches every area by the same factor: the absolute value of its determinant.',
          explain: t`$J = (${a})(${d}) - (${b})(${c}) = ${a * d - b * c}$, so areas are multiplied by $|J| = ${J}$${a * d - b * c < 0 ? ' (and orientation is reversed)' : ''}. Every cell of the grid, wherever it is, becomes a parallelogram ${J} times its size.`,
          visual: jac([{ label: 'Linear', x: `${a}*u + ${b}*v`, y: `${c}*u + ${d}*v`, u: [0, 1], v: [0, 1], cell: [0.3, 0.3] }], t`The unit square in $(u, v)$ (top) and its image, a parallelogram (bottom).`),
        };
      },
    }),
    mcq({
      id: 'polar-J', difficulty: 1,
      prompt: t`For polar coordinates, $x = r\cos\theta$, $y = r\sin\theta$, the Jacobian $\dfrac{\partial(x, y)}{\partial(r, \theta)}$ is:`,
      choices: [t`$r$`, t`$\dfrac{1}{r}$`, t`$1$`, t`$r^2$`],
      answer: 0,
      why: {
        1: t`That is $\frac{\partial(r, \theta)}{\partial(x, y)}$, the Jacobian of the inverse map — its reciprocal.`,
        2: t`Polar coordinates do stretch: cells with the same $\Delta r$ and $\Delta\theta$ are bigger farther out.`,
        3: t`$r^2$ belongs to spherical coordinates, where two of the box's edges carry an $r$.`,
      },
      hints: [t`$x_r = \cos\theta$, $x_\theta = -r\sin\theta$, $y_r = \sin\theta$, $y_\theta = r\cos\theta$.`],
      teach: 'The polar Jacobian is r: that is where the r in dA = r dr dθ comes from.',
      explain: t`$J = \cos\theta\cdot r\cos\theta - (-r\sin\theta)\sin\theta = r(\cos^2\theta + \sin^2\theta) = r$.`,
      visual: jac([POLAR], 'The polar map: equal cells in (r, θ) (top) become cells that grow with r (bottom).'),
    }),
    num({
      id: 'ellipse', difficulty: 2,
      gen(r) {
        const a = r.pick([1.5, 2, 2.5, 3]), b = r.pick([0.5, 0.8, 1, 1.2]);
        const A = Math.PI * a * b;
        return {
          prompt: t`An elliptical radar antenna has an aperture $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} \le 1$ with semi-axes $a = ${a}$ m and $b = ${b}$ m. Use the change of variables $x = au$, $y = bv$ to find its area.`,
          answer: A, units: 'm^2', tol: { rel: 2e-3 },
          errors: [
            { value: Math.PI, feedback: t`That is the area of the unit disk in $(u, v)$. Multiply by the stretching factor $|J| = ab$.` },
            { value: Math.PI * a * a, feedback: t`The map stretches by $a$ in one direction and $b$ in the other: $|J| = ab$, not $a^2$.` },
          ].filter((e) => Math.abs(e.value - A) > 1e-9 * A),
          hints: [t`With $x = au$, $y = bv$ the ellipse becomes the unit disk $u^2 + v^2 \le 1$.`, t`$J = \det\begin{pmatrix} a & 0\\ 0 & b\end{pmatrix} = ab$, and the unit disk has area $\pi$.`],
          teach: 'Stretching by a in x and b in y multiplies every area by ab.',
          explain: t`$\iint_E dA = \iint_{u^2+v^2\le1} ab\,du\,dv = ab\,\pi = \pi(${a})(${b}) \approx ${fmt(A, 3)}\ \text{m}^2$.`,
          visual: jac([{ label: 'Elliptical polar', x: `${a}*u*cos(v)`, y: `${b}*u*sin(v)`, u: [0, 1], v: [0, 'pi'], uName: 'ρ', vName: 'α', cell: [0.55, 0.9] }], t`The upper half of the aperture, drawn as the image of a polar grid stretched by $${a}$ across and $${b}$ up (equal scales). The full ellipse is twice this.`),
        };
      },
    }),
    num({
      id: 'parallelogram', difficulty: 2,
      gen(r) {
        const A = r.pick([1, 2, 3]), B = r.pick([1, 2, 3]);
        const I = (A * A * B * B) / 8;
        return {
          prompt: t`$D$ is the region bounded by $x + y = 0$, $x + y = ${A}$, $x - y = 0$ and $x - y = ${B}$. Evaluate $\displaystyle\iint_D (x + y)(x - y)\,dA$.`,
          answer: I, tol: { rel: 1e-4 },
          vars: ['x'], integrand: `${(B * B) / 4}*x`, limits: [0, A],
          errors: [
            { value: (A * A * B * B) / 4, feedback: t`You left out $|J|$. With $u = x + y$, $v = x - y$, $dA = \tfrac12\,du\,dv$.` },
            { value: (A * A * B * B) / 2, feedback: t`That multiplies by $\left|\frac{\partial(u, v)}{\partial(x, y)}\right| = 2$. The factor you need is $\left|\frac{\partial(x, y)}{\partial(u, v)}\right| = \tfrac12$.` },
          ],
          hints: [t`Let $u = x + y$ and $v = x - y$: $D$ becomes $0 \le u \le ${A}$, $0 \le v \le ${B}$, and the integrand $uv$.`, t`$x = \tfrac{u + v}{2}$, $y = \tfrac{u - v}{2}$, so $|J| = \tfrac12$: compute $\tfrac12\left(\int_0^{${A}} u\,du\right)\left(\int_0^{${B}} v\,dv\right)$.`],
          teach: 'Pick u and v to be the expressions that are constant along the region’s sides; then the region is a rectangle.',
          explain: t`$\tfrac12\cdot\tfrac{${A}^2}{2}\cdot\tfrac{${B}^2}{2} = \tfrac{${A * A * B * B}}{8} = ${nice(I)}$.`,
          visual: jac([{ ...SHEAR, u: [0, A], v: [0, B], view: undefined, cell: [r6(A * 0.4), r6(B * 0.4)] }], t`The rectangle $0 \le u \le ${A}$, $0 \le v \le ${B}$ (top) and its image $D$ (bottom), equal scales.`),
        };
      },
    }),
    mcq({
      id: 'inverse', difficulty: 2,
      prompt: t`You are given $u = x + 2y$ and $v = 3x - y$. What is $\left|\dfrac{\partial(x, y)}{\partial(u, v)}\right|$, the factor in $dA = |J|\,du\,dv$?`,
      choices: [t`$\tfrac17$`, '7', t`$-\tfrac17$`, '5'],
      answer: 0,
      why: {
        1: t`That is $\left|\frac{\partial(u, v)}{\partial(x, y)}\right|$ — the Jacobian of the map you were given, which goes from $(x, y)$ to $(u, v)$. You need the other direction: its reciprocal.`,
        2: t`An area factor is an absolute value; the sign only says the map reverses orientation.`,
        3: t`$\det\begin{pmatrix}1 & 2\\3 & -1\end{pmatrix} = (1)(-1) - (2)(3) = -7$, not $5$.`,
      },
      hints: [t`$\frac{\partial(u, v)}{\partial(x, y)} = \det\begin{pmatrix} 1 & 2\\ 3 & -1\end{pmatrix}$ is easy to compute.`, t`The Jacobians of a map and of its inverse are reciprocals.`],
      teach: 'When u and v are given in terms of x and y, compute ∂(u,v)/∂(x,y) and take its reciprocal — no need to solve for x and y.',
      explain: t`$\frac{\partial(u, v)}{\partial(x, y)} = -1 - 6 = -7$, so $\frac{\partial(x, y)}{\partial(u, v)} = -\tfrac17$ and $|J| = \tfrac17$: each unit of $(u, v)$ area is a seventh of a unit of $(x, y)$ area.`,
      visual: jac([{ label: 'Inverse map', x: '(u + 2*v)/7', y: '(3*u - v)/7', u: [0, 2], v: [0, 2], cell: [0.8, 0.8] }], t`The map $x = \tfrac{u + 2v}{7}$, $y = \tfrac{3u - v}{7}$: the square in $(u, v)$ (top) shrinks to a small parallelogram (bottom).`),
    }),
    expr({
      id: 'squaring', difficulty: 2,
      prompt: t`Find the Jacobian $\dfrac{\partial(x, y)}{\partial(u, v)}$ of the map $x = u^2 - v^2$, $y = 2uv$.`,
      answer: '4u^2 + 4v^2', answerTeX: t`4(u^2 + v^2)`,
      vars: { u: [-2, 2], v: [-2, 2] },
      errors: [
        { answer: '4u^2 - 4v^2', feedback: t`Check the sign: $J = x_u y_v - x_v y_u = (2u)(2u) - (-2v)(2v)$, and minus a negative is plus.` },
        { answer: '4u^2', feedback: t`That is only $x_u y_v$. The determinant subtracts $x_v y_u = (-2v)(2v)$ as well.` },
      ],
      hints: [t`$x_u = 2u$, $x_v = -2v$, $y_u = 2v$, $y_v = 2u$.`],
      teach: t`$J = x_u y_v - x_v y_u$: four partial derivatives, one $2\times2$ determinant.`,
      explain: t`$J = (2u)(2u) - (-2v)(2v) = 4u^2 + 4v^2$. The map squares complex numbers, $(u + iv)^2$; it stretches areas by $4|z|^2$, which is why the cells in the picture grow so fast away from the origin.`,
      visual: jac([SQUARE], 'The squaring map: a grid of equal cells (top) and its image (bottom), cells tinted by how much they were stretched.'),
    }),
    mcq({
      id: 'sqrt-g', difficulty: 3,
      prompt: t`*A preview of general relativity.* In spherical coordinates, flat space's line element is $ds^2 = dr^2 + r^2\,d\theta^2 + r^2\sin^2\theta\,d\phi^2$: the metric's components form the diagonal matrix $g = \mathrm{diag}(1,\ r^2,\ r^2\sin^2\theta)$. Relativity writes the volume element as $\sqrt{|\det g|}\;dr\,d\theta\,d\phi$. What is $\sqrt{|\det g|}$ here?`,
      choices: [
        t`$r^2\sin\theta$`,
        t`$r^4\sin^2\theta$`,
        t`$1 + r^2 + r^2\sin^2\theta$`,
        t`$r\sin\theta$`,
      ],
      answer: 0,
      why: {
        1: t`That is $\det g$ itself. The metric holds squared lengths, so the volume element takes its square root.`,
        2: t`The determinant of a diagonal matrix is the product of its diagonal entries, not their sum.`,
        3: t`One $r$ short: $\sqrt{1\cdot r^2\cdot r^2\sin^2\theta} = r^2\sin\theta$.`,
      },
      hints: [t`The determinant of a diagonal matrix is the product of its diagonal entries.`, t`The diagonal entries are the squares of the edge lengths of the coordinate box: $1$, $r^2$, $r^2\sin^2\theta$ for edges $dr$, $r\,d\theta$, $r\sin\theta\,d\phi$.`],
      teach: 'The square root of the metric’s determinant is the volume factor: in flat space it is exactly the Jacobian |J|.',
      explain: t`$\det g = r^4\sin^2\theta$, so $\sqrt{\det g} = r^2\sin\theta$ — the same factor as the Jacobian of $(r, \theta, \phi) \mapsto (x, y, z)$. In curved spacetime there may be no Cartesian coordinates to start from, but $\sqrt{|g|}\,d^4x$ still turns coordinate volume into real four-volume. (Preview: the Road to Einstein develops this from step 8.)`,
      visual: {
        type: 'graph',
        params: { x: [-0.8, 3.6], y: [-2.7, 0.7], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
          points: [['1', 0, 0], ['0', 1.4, 0], ['0', 2.8, 0], ['0', 0, -1], ['r²', 1.4, -1], ['0', 2.8, -1], ['0', 0, -2], ['0', 1.4, -2], ['r² sin²θ', 2.8, -2]].map(([label, x, y]) => ({ x, y, r: 0.01, color: label === '0' ? 'ink3' : 'gold', label, labelDx: -6, labelDy: 0 })),
          curves: [{ param: ['-0.5', 't'], t: [-2.4, 0.4], color: 'ink3', width: 1.6 }, { param: ['3.4', 't'], t: [-2.4, 0.4], color: 'ink3', width: 1.6 }] },
        caption: t`The metric of flat space in spherical coordinates, $g_{ij}$, as a $3\times3$ array: rows and columns $r$, $\theta$, $\phi$.`,
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ellipse-moment', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2]);
        const I = (Math.PI * a ** 3 * b) / 4;
        return {
          prompt: t`$E$ is the elliptical plate $\dfrac{x^2}{${a * a}} + \dfrac{y^2}{${b * b}} \le 1$. Evaluate $\displaystyle\iint_E x^2\,dA$ — its second moment of area about the $y$-axis — using $x = ${a === 1 ? '' : a}u$, $y = ${b === 1 ? '' : b}v$ and then polar coordinates in $(u, v)$.`,
          answer: I, tol: { rel: 2e-3 },
          vars: ['x'], integrand: `${a ** 3 * b}*pi*x^3`, limits: [0, 1],
          hints: [t`$x^2\,dA = ${a * a}u^2\cdot ${a * b}\,du\,dv$ over the unit disk.`, t`In polar form $u = \rho\cos\alpha$: $\iint_{\text{disk}} u^2\,du\,dv = \int_0^{2\pi}\!\int_0^1 \rho^2\cos^2\alpha\,\rho\,d\rho\,d\alpha = \tfrac{\pi}{4}$.`],
          teach: 'Two changes of variables in a row multiply their Jacobians: here ab from the stretch and ρ from polar coordinates.',
          explain: t`$\iint_E x^2\,dA = ${a * a}\cdot${a * b}\iint_{u^2+v^2\le1} u^2\,du\,dv = ${a ** 3 * b}\cdot\tfrac{\pi}{4} \approx ${fmt(I, 4)}$, that is $\tfrac{\pi a^3 b}{4}$. Engineers call it $I_y$: it sets how stiffly an elliptical beam resists bending.`,
          visual: jac([{ label: 'Elliptical polar', x: `${a}*u*cos(v)`, y: `${b}*u*sin(v)`, u: [0, 1], v: [0, 6.2832], uName: 'ρ', vName: 'α', cell: [0.6, 0.6] }], t`Elliptical polar coordinates $x = ${a}\rho\cos\alpha$, $y = ${b}\rho\sin\alpha$, which cover the plate as $\rho$ runs from $0$ to $1$ (equal scales).`),
        };
      },
    }),
    num({
      id: 'cp-schwarzschild', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([1.5, 2, 3, 4, 10]);
        const f = 1 / Math.sqrt(1 - 1 / k), Rmax = Math.max(6, k + 1.5);
        return {
          prompt: t`*A preview of general relativity.* At one moment, the space around a non-rotating black hole has the metric $dl^2 = \dfrac{dr^2}{1 - r_s/r} + r^2\,d\theta^2 + r^2\sin^2\theta\,d\phi^2$, where $r_s$ is the Schwarzschild radius. Its volume element is $\sqrt{\det g}\;dr\,d\theta\,d\phi = \dfrac{r^2\sin\theta}{\sqrt{1 - r_s/r}}\,dr\,d\theta\,d\phi$. By what factor does the volume of a thin spherical shell at $r = ${k}\,r_s$ exceed the flat-space value $4\pi r^2\,\Delta r$?`,
          answer: f, tol: { rel: 2e-3 },
          errors: [
            { value: Math.sqrt(1 - 1 / k), feedback: t`Upside down: $\sqrt{1 - r_s/r} < 1$ sits in the denominator, so the shell holds **more** volume than flat space would give.` },
            { value: 1 / (1 - 1 / k), feedback: t`The volume element takes the square root of the determinant: the factor is $1/\sqrt{1 - r_s/r}$.` },
          ],
          hints: [
            t`Integrate the volume element over all angles at fixed $r$: the angular integrals give $4\pi$, exactly as in flat space.`,
            t`The shell's volume is $\dfrac{4\pi r^2\,\Delta r}{\sqrt{1 - r_s/r}}$, so the factor is $1/\sqrt{1 - r_s/r}$ with $r_s/r = 1/${k}$.`,
          ],
          teach: 'In curved space the volume element is √(det g) times the coordinate volume, so a shell can hold more volume than 4πr² Δr.',
          explain: t`$\dfrac{1}{\sqrt{1 - 1/${k}}} \approx ${fmt(f, 4)}$. Near the hole, radial distances are stretched: the shell is thicker than $\Delta r$ suggests, while its area is still $4\pi r^2$. Taken as given here; the Road to Einstein derives this metric in step 20.`,
          visual: { type: 'surface3d', params: { surface: ['u*cos(v)', 'u*sin(v)', '2*sqrt(u - 1)'], domain: [[1, Rmax], [0, 6.2832]], n: 44, axisLen: r6(Rmax + 0.5), dist: r6(2.7 * Rmax + 1), pitch: 0.42, yaw: 0.6, target: [0, 0, r6(Math.sqrt(Rmax - 1))], curves: [{ param: [`${k}*cos(t)`, `${k}*sin(t)`, `2*sqrt(${k - 1})`], t: [0, 6.2832], color: 'gold', width: 3 }, { param: [`${r6(k + 0.35)}*cos(t)`, `${r6(k + 0.35)}*sin(t)`, `2*sqrt(${r6(k - 0.65)})`], t: [0, 6.2832], color: 'gold', width: 3 }] }, caption: t`An embedding diagram (Flamm's paraboloid), units of $r_s$: a surface whose distances, measured along it, match radial and around-the-hole distances in the black hole's space at one moment. Gold: two circles a coordinate step apart, farther apart along the surface than $\Delta r$. This is **not** the "rubber sheet" picture of gravity: nothing rolls on it, its vertical direction is not a direction in space, and it shows no curvature of time — which is most of what everyday gravity is.` },
        };
      },
    }),
    mcq({
      id: 'cp-sign', difficulty: 2,
      prompt: t`A change of variables has $J = \dfrac{\partial(x, y)}{\partial(u, v)} = -3$ at every point. It maps a region $S$ of area $2$ in the $(u, v)$ plane onto a region $D$. What is the area of $D$?`,
      choices: ['6', '−6', t`$\tfrac23$`, '2'],
      answer: 0,
      why: {
        1: 'Areas are never negative: the formula uses |J|. The minus sign says only that the map reverses orientation, like a mirror.',
        2: 'Dividing by |J| would be the inverse map, taking D back to S.',
        3: 'The map does change areas: by the factor |J| = 3.',
      },
      hints: [t`$\text{area}(D) = \iint_S |J|\,du\,dv$.`],
      teach: 'Area scales by |J|; the sign of J records only whether the map flips orientation.',
      explain: t`$\text{area}(D) = \iint_S |{-3}|\,du\,dv = 3\times2 = 6$. A negative Jacobian means the map flips the plane over — $\mathbf r_u$ and $\mathbf r_v$ come out clockwise instead of anticlockwise.`,
      visual: jac([{ label: 'Flip and stretch', x: 'u', y: '-3*v', u: [0, 2], v: [0, 1], cell: [0.6, 0.3] }], t`The map $x = u$, $y = -3v$: the rectangle (top) is flipped over and stretched three times (bottom).`),
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §5.7 Change of variables in multiple integrals', url: 'https://openstax.org/books/calculus-volume-3/pages/5-7-change-of-variables-in-multiple-integrals' },
    { label: 'Carroll, Spacetime and Geometry, §2.10 (the volume element √|g| d⁴x) and §5.1 (Schwarzschild)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
