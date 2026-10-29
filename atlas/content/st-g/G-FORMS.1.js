// Forms, wedges and d, in one sitting — a refresher of st-c.C10 (wedge, d,
// Stokes, Maxwell) built round a new example: the area form. ω = ½(x dy − y dx)
// has dω = dx∧dy, so by Stokes ∮ω round any closed curve is the area inside
// it — the planimeter, the shoelace formula, πab for an ellipse, and Kepler's
// second law (dA/dt = ½(xẏ − yẋ) = h/2, so T = 2πab/h = 2π√(a³/μ)). Also: the
// wedge in 3D (components of a × b, with the dz∧dx ordering), d of a 1-form,
// d² = 0, closed-not-exact dθ as the field of a wire (Ampère: μ₀I per winding),
// orientation. Transfers: orbital periods from the area form (μ_Earth from
// IERS/WGS 84), and the circulation 2ΩA in a spinning propellant tank.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_sg3.js';

const t = String.raw;
const MU_EARTH = 398600.4418;            // km³/s², WGS 84 / IERS
const MU0 = 4e-7 * Math.PI;              // T m / A (to 1e-10, CODATA 2022: 1.25663706127e-6)

const polyPic = (pts, caption) => {
  const curves = pts.map((p, i) => { const q = pts[(i + 1) % pts.length]; return { param: [`${p[0]} + t*${q[0] - p[0]}`, `${p[1]} + t*${q[1] - p[1]}`], t: [0, 1], color: 'accent', width: 2.2 }; });
  return {
    type: 'graph',
    params: { x: [-7, 7], y: [-1, 6], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y', curves, points: pts.map(([x, y], i) => ({ x, y, r: 5, color: 'gold', label: `(${x}, ${y})`, labelDx: 6, labelDy: i === 0 ? 14 : -8 })) },
    caption,
  };
};

export default lesson({
  id: 'st-g.G-FORMS.1',
  title: 'Forms, wedges and d, in one sitting',
  minutes: 14, difficulty: 3,
  intro: t`A **1-form** eats one vector and returns a number; a **2-form** eats two and is antisymmetric — an oriented-area meter. The **wedge** builds 2-forms from 1-forms, and the **exterior derivative** $d$ turns a $k$-form into a $(k+1)$-form, with $d^2 = 0$. They meet in **Stokes’ theorem**:

$$\begin{gathered}(\alpha\wedge\beta)(u, v) = \alpha(u)\beta(v) - \alpha(v)\beta(u) \\ d(f\,dx + g\,dy) = (\partial_xg - \partial_yf)\,dx\wedge dy \\ \int_M d\omega = \oint_{\partial M}\omega\end{gathered}$$

Green’s, Kelvin–Stokes’, Gauss’s and the fundamental theorem of calculus are all this one line. This refresher recaps the four lessons from [the wedge product](#/lesson/st-c.C10.1) to [Maxwell’s equations as $dF = 0$](#/lesson/st-c.C10.4) through one new example: the 1-form $\tfrac12(x\,dy - y\,dx)$, whose boundary integral is an area.`,
  symbols: [
    { tex: '\\alpha, \\beta', text: t`1-forms (covectors), such as $dx$, $dy$, or $a\,dx + b\,dy$` },
    { tex: '\\wedge', text: t`the wedge product: antisymmetric, $\alpha\wedge\beta = -\beta\wedge\alpha$, so $\alpha\wedge\alpha = 0$` },
    { tex: 'd', text: t`the exterior derivative: $df$ is the gradient 1-form; on forms it antisymmetrizes the derivative` },
    { tex: '\\omega', text: t`a $k$-form; $d\omega$ is a $(k+1)$-form` },
    { tex: 'M, \\partial M', text: t`an oriented region and its boundary, walked with $M$ on the left` },
    { tex: 'u, v', text: 'vectors fed to the forms' },
  ],
  why: 'Forms are how general relativity integrates: the volume element √−g d⁴x is a 4-form, Gauss-law and conservation integrals are Stokes’ theorem, and Maxwell’s equations dF = 0, d⋆F = ⋆J hold in any spacetime because d needs no metric.',
  visual: {
    type: 'c3-cells',
    title: 'Stokes as a planimeter',
    lead: t`The field drawn is $\omega = \tfrac12(x\,dy - y\,dx)$, a 1-form. Each cell is tinted by its circulation $\oint\omega$ divided by its area. Since $d\omega = dx\wedge dy$, every cell — whatever its size or place — gives exactly its own area, and the interior edges cancel: the boundary alone measures the area of the whole region.`,
    tasks: [
      t`Refine the cells: the tint never changes. $d\omega = 1\cdot dx\wedge dy$ everywhere, so circulation per unit area is $1$ in every cell.`,
      t`Switch region: disk, rectangle, annulus. Each time $\oint_{\partial M}\omega$ is the area — the annulus needs its inner circle walked the *other* way, keeping the region on the left.`,
      t`Drag the probe: its cell’s circulation is its area. A planimeter wheel rolled round a map’s boundary computes exactly this integral.`,
    ],
    params: {
      mode: 'circ', P: '-y/2', Q: 'x/2', x: [-2.6, 2.6], y: [-1.8, 1.8], n: 3, nSlider: true, nMax: 8,
      regions: [{ label: 'Disk', kind: 'disk', c: [0, 0], r: 1.5 }, { label: 'Rectangle', kind: 'rect', x: [-1.6, 1.4], y: [-1, 1.2] }, { label: 'Annulus', kind: 'annulus', c: [0, 0], r: [0.6, 1.6] }],
      probe: [0.5, 0.4],
    },
    caption: t`Circulations are computed numerically round each cell’s edges; the field arrows are compressed in length.`,
  },
  example: {
    prompt: t`Use $\omega = \tfrac12(x\,dy - y\,dx)$ and Stokes’ theorem to find the area of the ellipse $x = a\cos s$, $y = b\sin s$, and turn the result into Kepler’s third law.`,
    visual: { type: 'graph', params: { x: [-3.6, 3.6], y: [-1.8, 1.8], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [{ param: ['2.4*cos(t)', '1.6*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.2 }], shade: [{ fn: '1.6*sqrt(max(0, 1 - x^2/5.76))', lower: '-1.6*sqrt(max(0, 1 - x^2/5.76))', from: -2.4, to: 2.4, color: 'accent', alpha: 0.14 }], points: [{ x: r6(Math.sqrt(2.4 ** 2 - 1.6 ** 2)), y: 0, r: 6, color: 'gold', label: 'focus (planet)' }] }, caption: 'An orbit-shaped ellipse, a = 2.4, b = 1.6, with the focus where the central body sits.' },
    steps: [
      { label: 'Compute d', text: t`$d\omega = \tfrac12(dx\wedge dy - dy\wedge dx) = \tfrac12(dx\wedge dy + dx\wedge dy) = dx\wedge dy$. So $\int_M d\omega$ is the area of $M$.` },
      { label: 'Pull back', text: t`On the boundary, $dx = -a\sin s\,ds$ and $dy = b\cos s\,ds$, so $\omega = \tfrac12(ab\cos^2s + ab\sin^2s)\,ds = \tfrac12ab\,ds$.` },
      { label: 'Integrate', text: t`$\oint\omega = \int_0^{2\pi}\tfrac12ab\,ds = \pi ab$. Stokes: the area is $\pi ab$.` },
      { label: 'Kepler’s second law', text: t`Along an orbit, measured from the focus, $\omega$ fed the velocity gives $\tfrac{dA}{dt} = \tfrac12(x\dot y - y\dot x) = \tfrac12h$, half the specific angular momentum — constant. So equal areas in equal times.` },
      { label: 'Period', text: t`One orbit sweeps $\pi ab$ at rate $h/2$: $T = 2\pi ab/h$. With $b = a\sqrt{1 - e^2}$ and $h = \sqrt{\mu a(1 - e^2)}$, $T = 2\pi\sqrt{a^3/\mu}$ — Kepler’s third law. (The area form needs no origin at the centre: $\oint\omega$ is the area from any origin, since moving the origin adds an exact form.)` },
    ],
    answer: t`$\oint\tfrac12(x\,dy - y\,dx) = \pi ab$, the ellipse’s area; with $dA/dt = h/2$ this gives $T = 2\pi ab/h = 2\pi\sqrt{a^3/\mu}$.`,
  },
  practice: [
    num({
      id: 'wedge-3d', difficulty: 2,
      gen(r) {
        let a, b, ans;
        do {
          a = [r.intExcept(-3, 3, [0]), r.int(-2, 3), r.intExcept(-2, 2, [0])]; b = [r.int(-2, 2), r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
          ans = a[2] * b[0] - a[0] * b[2];
        } while (ans === 0);
        const wrong = -ans;
        return {
          prompt: t`Wedge $\alpha = ${a[0]}\,dx + ${a[1]}\,dy + ${a[2]}\,dz$ with $\beta = ${b[0]}\,dx + ${b[1]}\,dy + ${b[2]}\,dz$. What is the coefficient of $dz\wedge dx$ in $\alpha\wedge\beta$?`,
          visual: { type: 'calc-vectors3d', params: { range: 3.5, vectors: [{ to: a, color: 'accent', label: '\\alpha' }, { to: b, color: 'gold', label: '\\beta' }], yaw: 0.9 }, caption: 'The two 1-forms drawn as arrows of their components (with the dot product, each is an arrow).' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: wrong, feedback: t`That is the $dx\wedge dz$ coefficient. $dz\wedge dx = -dx\wedge dz$.` }].filter((e) => e.value !== ans),
          hints: [t`Collect the terms with $dz$ and $dx$: $\alpha_z\beta_x\,dz\wedge dx + \alpha_x\beta_z\,dx\wedge dz$.`, t`$dx\wedge dz = -dz\wedge dx$, so the coefficient is $\alpha_z\beta_x - \alpha_x\beta_z$.`],
          teach: t`In 3D the three components of $\alpha\wedge\beta$ on $(dy\wedge dz, dz\wedge dx, dx\wedge dy)$ are the components of $\vec a\times\vec b$ — the cyclic order matters.`,
          explain: t`$\alpha_z\beta_x - \alpha_x\beta_z = (${a[2]})(${b[0]}) - (${a[0]})(${b[2]}) = ${ans}$: the $y$-component of $\vec a\times\vec b$. The cross product is the wedge in disguise — only in 3D, and only once a metric identifies 2-forms with vectors.`,
        };
      },
    }),
    num({
      id: 'd-coef', difficulty: 2,
      gen(r) {
        let p, q, X, y0, val;
        do {
          p = r.intExcept(-3, 3, [0]); q = r.intExcept(-2, 3, [0]); X = r.intExcept(-2, 2, [0]); y0 = r.intExcept(-2, 2, [0]);
          val = (2 * q - p) * X;   // ω = p x y dx + q x² dy  →  dω = (2q − p) x dx∧dy
        } while (val === 0);
        return {
          prompt: t`For $\omega = ${p}xy\,dx + ${q}x^2\,dy$, $d\omega = c(x, y)\,dx\wedge dy$. Find $c$ at the point $(${X}, ${y0})$.`,
          visual: { type: 'field2d', params: { P: `${p}*x*y`, Q: `${q}*x^2`, x: [-3, 3], y: [-1.9, 1.9], probe: false, readout: false }, caption: t`The components $(\omega_x, \omega_y)$ drawn as arrows (lengths compressed).` },
          answer: val, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: p * X - 2 * q * X, feedback: t`Sign: $d(f\,dx + g\,dy) = (\partial_xg - \partial_yf)\,dx\wedge dy$, because $dy\wedge dx = -dx\wedge dy$.` }, { value: 2 * q * X + p * X, feedback: t`The $dx$ term contributes $\partial_yf\,dy\wedge dx = -\partial_yf\,dx\wedge dy$.` }].filter((e) => e.value !== val),
          hints: [t`$d(f\,dx) = \partial_yf\,dy\wedge dx$ (the $dx\wedge dx$ part vanishes).`, t`$c = \partial_x(${q}x^2) - \partial_y(${p}xy) = ${2 * q}x - (${p})x$.`],
          teach: t`$d$ of a 1-form in the plane is the curl: $d(f\,dx + g\,dy) = (\partial_xg - \partial_yf)\,dx\wedge dy$.`,
          explain: t`$c = ${2 * q - p}x$, which is $${val}$ at $x = ${X}$. A closed form has $c = 0$ everywhere; this one is closed only on the line $x = 0$.`,
        };
      },
    }),
    mcq({
      id: 'dd', difficulty: 2,
      prompt: t`$d^2 = 0$: applying $d$ twice always gives zero. Which familiar vector-calculus identity is it, for a function $f$ in $\mathbb R^3$?`,
      visual: { type: 'field2d', params: { P: '2*x - y', Q: '-x + 2*y', x: [-2.6, 2.6], y: [-1.7, 1.7], probe: [0.6, 0.4], readout: true }, caption: t`A gradient field, $\nabla f$ for $f = x^2 - xy + y^2$: the probe’s curl readout is zero everywhere.` },
      choices: [t`$\nabla\times(\nabla f) = 0$, because mixed partial derivatives commute`, t`$\nabla\cdot(\nabla f) = 0$`, t`$\nabla(\nabla\cdot\vec F) = 0$`, t`$\nabla\times\vec F = 0$ for every $\vec F$`],
      answer: 0,
      why: {
        1: t`That is the Laplacian $\nabla^2f$, which is not zero in general ($\nabla^2(x^2) = 2$). It needs a metric (a $\star$), not just $d$.`,
        2: t`The gradient of a divergence is not zero in general; and it is not $d$ applied twice.`,
        3: t`Most fields have curl. The statement is only about fields that are already gradients.`,
      },
      hints: [t`$df$ is the gradient; $d$ of a 1-form is the curl.`, t`$d(df) = \sum(\partial_i\partial_jf - \partial_j\partial_if)\,dx^i\wedge dx^j/2$.`],
      teach: t`$d^2 = 0$ is the commuting of mixed partials; in $\mathbb R^3$ it is curl grad = 0 and div curl = 0.`,
      explain: t`$d(df)$ has components $\partial_i\partial_jf - \partial_j\partial_if = 0$. One level up, $d^2 = 0$ on 1-forms is div curl $= 0$; in spacetime, $F = dA$ gives $dF = 0$ — half of Maxwell’s equations for free.`,
    }),
    num({
      id: 'shoelace', difficulty: 3,
      gen(r) {
        const pts = r.pick([[[-3, 0], [3, 0], [4, 3], [-1, 5]], [[-4, 1], [2, 0], [5, 4], [0, 5]], [[-2, 0], [4, 1], [1, 5]], [[-5, 2], [0, 0], [4, 2], [2, 5], [-2, 4]]]);
        let s = 0;
        for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; s += x1 * y2 - x2 * y1; }
        const ans = Math.abs(s) / 2;
        return {
          prompt: t`A launch range’s hazard area is the polygon with vertices ${pts.map(([x, y]) => `$(${x}, ${y})$`).join(', ')} (km, in order anticlockwise). Each edge from $(x_1, y_1)$ to $(x_2, y_2)$ contributes $\int\tfrac12(x\,dy - y\,dx) = \tfrac12(x_1y_2 - x_2y_1)$. Find the area in km².`,
          visual: polyPic(pts, 'The polygon, walked anticlockwise so the area is on the left.'),
          answer: ans, units: 'km^2', tol: { rel: 0.001 },
          errors: [{ value: Math.abs(s), feedback: t`Each edge contributes *half* of $x_1y_2 - x_2y_1$.` }],
          hints: [t`Sum $\tfrac12(x_iy_{i+1} - x_{i+1}y_i)$ round the polygon, wrapping from the last vertex back to the first.`, t`The sum of $x_iy_{i+1} - x_{i+1}y_i$ is $${s}$.`],
          teach: 'The shoelace formula is Stokes’ theorem for ω = ½(x dy − y dx), whose d is the area form.',
          explain: t`$\tfrac12\cdot${s} = ${nice(ans)}\ \text{km}^2$. Walking clockwise would give the negative: orientation is part of the theorem.`,
        };
      },
    }),
    num({
      id: 'wire', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 2, 3]), I = r.pick([2, 5, 10, 25]);
        const ans = (MU0 * I * n) * 1e6;          // μT·m
        return {
          prompt: t`The magnetic field of a long straight wire carrying $I = ${I}\ \text{A}$ is, as a 1-form, $B = \dfrac{\mu_0I}{2\pi}\,d\theta$, where $d\theta = \dfrac{x\,dy - y\,dx}{x^2 + y^2}$ is closed ($d(d\theta) = 0$) but not exact on the plane minus the wire. Find $\oint B$ round the loop shown, which winds ${n === 1 ? 'once' : n === 2 ? 'twice' : 'three times'} round the wire anticlockwise, in $\mu\text{T}\cdot\text{m}$.`,
          visual: { type: 'graph', params: { x: [-3.4, 3.4], y: [-1.75, 1.75], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [{ polar: `${n === 1 ? '1.2 + 0.3*cos(theta)' : `1.1 + 0.45*cos(theta/${n})`}`, theta: [0, r6(2 * Math.PI * n)], color: 'accent', width: 2 }], points: [{ x: 0, y: 0, r: 5, color: 'gold', label: 'wire' }] }, caption: 'The loop (blue) round the wire, which runs out of the page at the gold dot.' },
          answer: ans, units: 'μT m', tol: { rel: 0.005 },
          errors: [{ value: (MU0 * I) * 1e6, feedback: 'Each winding contributes μ₀I: count the turns.' }, { value: (MU0 * I * n) * 1e6 / (2 * Math.PI), feedback: t`$\oint d\theta = 2\pi$ per turn, which cancels the $2\pi$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$\oint d\theta = 2\pi$ times the number of windings — not $0$, because $\theta$ is not a single-valued function round the wire.`, t`$\oint B = \tfrac{\mu_0I}{2\pi}\cdot2\pi\cdot${n} = ${n}\mu_0I$, with $\mu_0 \approx 1.2566\times10^{-6}\ \text{T m/A}$.`],
          teach: t`A closed form that is not exact has nonzero loop integrals round a hole: $\oint d\theta = 2\pi$ per winding, which is Ampère’s law for a wire.`,
          explain: t`$${n}\mu_0I = ${nice(ans, 4)}\ \mu\text{T m}$. If $B$ were exact ($B = d\phi$ for a single-valued $\phi$), every loop integral would vanish; the hole — the wire — is what lets a closed form circulate.`,
        };
      },
    }),
    mcq({
      id: 'orient', difficulty: 2,
      prompt: t`For $\int_M d\omega = \oint_{\partial M}\omega$ on an annulus (a disc with a hole), how must the two boundary circles be walked?`,
      visual: { type: 'graph', params: { x: [-3.4, 3.4], y: [-1.75, 1.75], equal: true, aspect: 'wide', xlabel: '', ylabel: '', curves: [{ param: ['1.6*cos(t)', '1.6*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['0.6*cos(t)', '0.6*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }], shade: [{ fn: 'sqrt(max(0, 2.56 - x^2))', lower: '-sqrt(max(0, 2.56 - x^2))', from: -1.6, to: 1.6, color: 'accent', alpha: 0.15 }] }, caption: 'The annulus between the two circles (the hole is shaded too, for simplicity; it is not part of M).' },
      choices: ['The outer circle anticlockwise and the inner one clockwise, so the region is always on the left', 'Both anticlockwise', 'Both clockwise', 'The direction does not matter, only the circles'],
      answer: 0,
      why: {
        1: 'Then the inner circle’s contribution has the wrong sign: you would add the hole’s area instead of removing it.',
        2: 'That is the orientation of the complement (or of the region upside down): every integral changes sign.',
        3: 'Reversing a path reverses the sign of a line integral, so orientation is essential.',
      },
      hints: ['The induced orientation keeps the region on your left as you walk the boundary.', 'Walk the inner circle with the annulus on your left: which way do you go?'],
      teach: 'Stokes’ theorem needs the induced orientation: walk every piece of the boundary with the region on the left.',
      explain: t`With $\omega = \tfrac12(x\,dy - y\,dx)$: outer anticlockwise gives $\pi(1.6)^2$, inner clockwise $-\pi(0.6)^2$; the sum is the annulus’s area. The interior cell edges of the Explore picture cancel for the same reason.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-period', difficulty: 3, transfer: true,
      gen(r) {
        const [what, a, e] = r.pick([['the International Space Station (a ≈ 6 790 km, nearly circular)', 6790, 0.0005], ['a GPS satellite (a = 26 560 km, e = 0.01)', 26560, 0.01], ['a geostationary satellite (a = 42 164 km)', 42164, 0], ['a Molniya orbit (a = 26 600 km, e = 0.74)', 26600, 0.74]]);
        const b = a * Math.sqrt(1 - e * e), h = Math.sqrt(MU_EARTH * a * (1 - e * e));
        const T = (2 * Math.PI * a * b) / h / 3600;
        const naive = (2 * Math.PI * a * a) / h / 3600;
        return {
          prompt: t`For ${what}, the area form says the orbit sweeps area at $dA/dt = h/2$, with specific angular momentum $h = \sqrt{\mu a(1 - e^2)}$ and $\mu = ${MU_EARTH}\ \text{km}^3/\text{s}^2$ for the Earth. The orbit’s area is $\pi ab$ with $b = a\sqrt{1 - e^2}$. Find the period, in hours.`,
          visual: { type: 'graph', params: { x: [-1.9, 1.9], y: [-1.05, 1.05], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: [`${r6(e)} + cos(t)`, `${r6(Math.sqrt(1 - e * e))}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2 }], shade: [{ fn: `${r6(Math.sqrt(1 - e * e))}*sqrt(max(0, 1 - (x - ${r6(e)})^2))`, lower: `-${r6(Math.sqrt(1 - e * e))}*sqrt(max(0, 1 - (x - ${r6(e)})^2))`, from: r6(e - 1), to: r6(e + 1), color: 'accent', alpha: 0.12 }], points: [{ x: 0, y: 0, r: 6, color: 'teal', label: 'Earth (focus)' }] }, caption: t`The orbit’s shape with $a$ scaled to $1$ and the Earth at the focus (Earth not to scale).` },
          answer: T, units: 'h', tol: { rel: 0.005 },
          errors: [{ value: naive, feedback: t`You used $\pi a^2$; the ellipse’s area is $\pi ab$.` }, { value: T * 2, feedback: t`The areal rate is $h/2$, so the period is $\pi ab/(h/2)$: check the factor of 2.` }].filter((x) => Math.abs(x.value - T) > 0.005 * T),
          hints: [t`$T = \dfrac{\pi ab}{h/2} = \dfrac{2\pi ab}{h}$.`, t`Here $h = ${tex(h, 5)}\ \text{km}^2/\text{s}$ and $b = ${tex(b, 5)}\ \text{km}$; divide seconds by 3600.`],
          teach: 'Stokes turns the area form into Kepler: area swept at h/2, so T = 2πab/h = 2π√(a³/μ).',
          explain: t`$T = 2\pi ab/h = ${tex(T * 3600, 5)}\ \text{s} = ${nice(T, 4)}\ \text{h}$, the same as $2\pi\sqrt{a^3/\mu}$: the period depends on $a$ alone. (Two-body motion; oblateness and drag perturb real orbits slightly.)`,
        };
      },
    }),
    num({
      id: 'cp-tank', difficulty: 2, transfer: true,
      gen(r) {
        const rpm = r.pick([5, 10, 20, 30]), side = r.pick([0.2, 0.3, 0.5]);
        const W = (rpm * 2 * Math.PI) / 60, A = side * side, ans = 2 * W * A;
        return {
          prompt: t`A propellant tank spins at $${rpm}\ \text{rpm}$ and the liquid co-rotates rigidly: velocity field $\vec v = \Omega(-y, x)$, so the circulation 1-form is $\Omega(-y\,dx + x\,dy)$. Find the circulation $\oint\vec v\cdot d\vec l$ round a square test loop of side $${side}\ \text{m}$ lying in the liquid (anywhere), in $\text{m}^2/\text{s}$.`,
          visual: { type: 'field2d', params: { P: '-y', Q: 'x', x: [-2.6, 2.6], y: [-1.6, 1.6], probe: false, readout: false, loop: { r: 0.6 } }, caption: 'Rigid rotation, with a test loop drawn as a circle (the question uses a square: only its area matters).' },
          answer: ans, units: 'm^2/s', tol: { rel: 0.005 },
          errors: [{ value: W * A, feedback: t`$d(-y\,dx + x\,dy) = 2\,dx\wedge dy$: the factor 2 is the vorticity of rigid rotation.` }, { value: 2 * rpm * A, feedback: t`Convert to rad/s: $\Omega = 2\pi\cdot${rpm}/60$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`Stokes: $\oint = \int d\omega$, and $d(\Omega(-y\,dx + x\,dy)) = 2\Omega\,dx\wedge dy$.`, t`$\Omega = ${nice(W, 4)}\ \text{rad/s}$; circulation $= 2\Omega A$.`],
          teach: 'Circulation round any loop in rigid rotation is 2Ω times its area — Stokes with dω = 2Ω dx∧dy, the same everywhere.',
          explain: t`$2\cdot${nice(W, 4)}\cdot${nice(A)} = ${nice(ans, 4)}\ \text{m}^2/\text{s}$, wherever the loop sits: the vorticity $2\Omega$ is uniform. A propellant that does not spin up with its tank keeps its circulation (Kelvin), which is why spin-stabilized stages need slosh and swirl baffles.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry (Addison-Wesley, 2004), §2.9 (differential forms)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Flanders, Differential Forms with Applications to the Physical Sciences (Dover, 1989), chs. 2–5', url: 'https://openlibrary.org/isbn/9780486661698' },
    { label: 'Vallado, Fundamentals of Astrodynamics and Applications, 4th ed. (Microcosm, 2013), §1.3 (Kepler’s laws; μ⊕ = 398 600.4418 km³/s²)', url: 'https://openlibrary.org/isbn/9781881883180' },
  ],
});
