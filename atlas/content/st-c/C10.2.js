// The exterior derivative: d takes k-forms to (k + 1)-forms, d(ω_μ dx^μ) =
// ∂_ν ω_μ dx^ν∧dx^μ, and d² = 0 because mixed partials commute — the dual of
// "the boundary of a boundary is empty". In ℝ³ d is grad, curl and div, and
// d² = 0 is curl grad = 0 and div curl = 0. Closed versus exact: dθ on the
// punctured plane, and the vector potential outside a solenoid.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const SEL = (k) => `step(0.5 - abs(m - ${k}))`;

// polynomial 1-forms P dx + Q dy with their exterior derivative coefficient ∂xQ − ∂yP
const FORMS = [
  { P: 'x^2*y', Q: 'x + y^3', Ptex: t`x^2y`, Qtex: t`x + y^3`, d: '1 - x^2', dtex: t`1 - x^2` },
  { P: '-y^3', Q: 'x*y', Ptex: t`-y^3`, Qtex: t`xy`, d: 'y + 3*y^2', dtex: t`y + 3y^2` },
  { P: 'x*y', Q: 'x^2 - y', Ptex: t`xy`, Qtex: t`x^2 - y`, d: 'x', dtex: t`x` },
  { P: 'y*cos(x)', Q: 'sin(x) + x*y', Ptex: t`y\cos x`, Qtex: t`\sin x + xy`, d: 'y', dtex: t`y` },
  { P: '2*x*y^2', Q: 'x^2*y + x', Ptex: t`2xy^2`, Qtex: t`x^2y + x`, d: '1 - 2*x*y', dtex: t`1 - 2xy` },
];

export default lesson({
  id: 'st-c.C10.2',
  title: 'The exterior derivative',
  minutes: 14, difficulty: 3,
  equation: t`d(\omega_\mu\,dx^\mu) = \partial_\nu\omega_\mu\;dx^\nu\wedge dx^\mu, \qquad d^2 = 0`,
  intro: t`The **exterior derivative** $d$ turns a $k$-form into a $(k+1)$-form. On functions it is the differential, $df = \partial_\mu f\,dx^\mu$. On a 1-form it differentiates the components and wedges on one more $dx$, as above; because $dx^\nu\wedge dx^\mu$ is antisymmetric, only the antisymmetric part survives — in 2D, $d(P\,dx + Q\,dy) = (\partial_xQ - \partial_yP)\,dx\wedge dy$, the circulation per unit area of the cells in the picture below. Higher forms work the same way, and $d$ obeys a Leibniz rule with a sign: $d(\alpha\wedge\beta) = d\alpha\wedge\beta + (-1)^k\alpha\wedge d\beta$ for a $k$-form $\alpha$.

Two facts make $d$ special. It needs **no metric and no connection**: it is the same in every chart. And **applying it twice gives zero**, $d(d\omega) = 0$, because mixed partial derivatives commute while wedges anticommute. Its geometric twin: the boundary of a region is a closed curve, which has no boundary — **the boundary of a boundary is empty**. C10.3 shows that these are the same statement.`,
  symbols: [
    { tex: t`\omega = \omega_\mu\,dx^\mu`, text: t`a 1-form with components $\omega_\mu$ (summed over $\mu$)` },
    { tex: t`\partial_\nu\omega_\mu`, text: t`the partial derivatives of its components in the chart` },
    { tex: t`dx^\nu\wedge dx^\mu`, text: t`the basis 2-forms: antisymmetric, so $dx^\nu\wedge dx^\mu = -dx^\mu\wedge dx^\nu$` },
    { tex: 'd', text: t`the exterior derivative, from $k$-forms to $(k + 1)$-forms` },
    { tex: 'd^2 = 0', text: t`$d(d\omega) = 0$ for every form $\omega$` },
  ],
  why: t`Half of Maxwell’s equations is $dF = 0$ (C10.4), and charge conservation is $d^2 = 0$. In GR, $d$ is the one derivative that needs no Christoffel symbols, which is why the Bianchi identity and Cartan’s structure equations are written with it.`,
  visual: {
    type: 'c3-cells',
    title: 'Circulation cell by cell',
    lead: t`A 1-form $\omega = P\,dx + Q\,dy$ (drawn as arrows $(P, Q)$) and a square cut into cells. Each cell is walked anticlockwise; its circulation $\oint\omega$ tints it (blue positive, red negative). Per unit area, that circulation is the coefficient of $d\omega$.`,
    tasks: [
      t`$\omega = -y\,dx + x\,dy$: every cell has the same circulation per area, 2 — because $d\omega = 2\,dx\wedge dy$ everywhere.`,
      t`$\omega = d(x^2y)$: every cell is grey. An exact form has $d\omega = d(df) = 0$, and its circulation round any loop vanishes.`,
      t`$\omega = \tfrac13(-y^3\,dx + x^3\,dy)$: $d\omega = (x^2 + y^2)\,dx\wedge dy$, faint near the centre and strong at the corners. Add cells: each one’s circulation per area tends to $x^2 + y^2$ at its centre, and the inner edges cancel in pairs.`,
    ],
    params: {
      mode: 'circ',
      choices: [{ key: 'm', label: 'The 1-form', options: [[1, t`$-y\,dx + x\,dy$`], [2, t`$d(x^2y) = 2xy\,dx + x^2\,dy$`], [3, t`$\tfrac13(-y^3\,dx + x^3\,dy)$`]], value: 1, explain: 'Three 1-forms: one with constant dω, one exact (dω = 0), one with dω growing outward.' }],
      P: `${SEL(1)}*(-y) + ${SEL(2)}*(2*x*y) + ${SEL(3)}*(-y^3/3)`,
      Q: `${SEL(1)}*x + ${SEL(2)}*x^2 + ${SEL(3)}*(x^3/3)`,
      x: [-2.6, 2.6], y: [-1.8, 1.8], region: { kind: 'rect', x: [-1.5, 1.5], y: [-1.2, 1.2] }, n: 3, probe: [0.9, 0.6],
    },
    caption: t`Drawing a 1-form as arrows uses the Euclidean metric; the circulations do not. Arrow lengths are compressed. Circulations are computed numerically round each cell.`,
  },
  example: {
    prompt: t`Compute $d\omega$ for $\omega = x^2y\,dx + (x + y^3)\,dy$, and check it by the circulation round a small square of side $0.2$ centred at $(0.5, 0)$. Then verify $d(df) = 0$ for $f = x^2y^3$.`,
    visual: { type: 'c3-cells', params: { mode: 'circ', P: 'x^2*y', Q: 'x + y^3', x: [-2.6, 2.6], y: [-1.8, 1.8], region: { kind: 'rect', x: [-1.5, 1.5], y: [-1.2, 1.2] }, n: 6, nSlider: false, probe: [0.5, 0], readout: false }, caption: t`Cells tinted by the circulation of $\omega$: strongest along $x = 0$, where $1 - x^2$ peaks, zero at $x = \pm1$ and negative (red) beyond.` },
    steps: [
      { label: 'Differentiate', text: t`$d\omega = d(x^2y)\wedge dx + d(x + y^3)\wedge dy = (2xy\,dx + x^2\,dy)\wedge dx + (dx + 3y^2\,dy)\wedge dy$.` },
      { label: 'Wedge', text: t`$dx\wedge dx = dy\wedge dy = 0$ and $dy\wedge dx = -dx\wedge dy$, so $d\omega = -x^2\,dx\wedge dy + dx\wedge dy = (1 - x^2)\,dx\wedge dy$.` },
      { label: 'Small square', text: t`At $(0.5, 0)$ the coefficient is $0.75$; a square of area $0.04$ should have circulation $\approx 0.75\times 0.04 = 0.030$. Walking its four sides gives $0.0299$ (exactly $\iint(1 - x^2)\,dA = 0.02987$): the small-loop estimate is good to 0.5%.` },
      { label: 'An exact form', text: t`$df = 2xy^3\,dx + 3x^2y^2\,dy$, so $d(df) = (\partial_x(3x^2y^2) - \partial_y(2xy^3))\,dx\wedge dy = (6xy^2 - 6xy^2)\,dx\wedge dy = 0$.` },
      { label: 'Why it had to vanish', text: t`Both terms were the mixed partial $\partial_x\partial_yf$, entering with opposite signs from $dy\wedge dx = -dx\wedge dy$. That cancellation is $d^2 = 0$.` },
    ],
    answer: t`$d\omega = (1 - x^2)\,dx\wedge dy$, matching the small-square circulation $0.030$ at $(0.5, 0)$; and $d(df) = 0$.`,
  },
  practice: [
    expr({
      id: 'd-coef', difficulty: 2,
      gen(r) {
        const F = r.pick(FORMS);
        return {
          prompt: t`Write $d\omega = h(x, y)\,dx\wedge dy$ for $\omega = ${F.Ptex}\,dx + (${F.Qtex})\,dy$. Give $h$.`,
          visual: { type: 'field2d', params: { P: F.P, Q: F.Q, x: [-2, 2], y: [-2, 2], readout: false, probe: false, particles: false }, caption: 'The 1-form drawn as arrows (P, Q) — a picture that borrows the Euclidean metric.' },
          answer: F.d, answerTeX: F.dtex, vars: { x: [-2, 2], y: [-2, 2] },
          errors: [{ answer: `-(${F.d})`, feedback: t`$d(P\,dx) = \partial_yP\,dy\wedge dx = -\partial_yP\,dx\wedge dy$: the $P$ term enters with a minus sign.` }],
          hints: [t`$d\omega = (\partial_xQ - \partial_yP)\,dx\wedge dy$.`, t`$P = ${F.Ptex}$ and $Q = ${F.Qtex}$.`],
          teach: t`In 2D, $d(P\,dx + Q\,dy) = (\partial_xQ - \partial_yP)\,dx\wedge dy$.`,
          explain: t`$h = ${F.dtex}$. It is the circulation per unit area round a tiny loop — the scalar curl of the plane, now with no metric in sight.`,
        };
      },
    }),
    mcq({
      id: 'dd-zero', difficulty: 2,
      prompt: t`In $\mathbb R^3$, $d$ on functions is the gradient and $d$ on 1-forms is the curl. Which vector-calculus identity is $d(df) = 0$?`,
      visual: { type: 'field2d', params: { P: '2*x', Q: '-2*y', x: [-2, 2], y: [-2, 2], potential: 'x^2 - y^2', probe: [0.8, 0.5] }, caption: t`The gradient field of $x^2 - y^2$ with its level curves: the probe reads zero curl everywhere.` },
      choices: [t`$\nabla\times(\nabla f) = 0$`, t`$\nabla\cdot(\nabla f) = 0$`, t`$\nabla(\nabla\cdot\mathbf F) = 0$`, t`$\nabla\cdot(\nabla\times\mathbf F) \ne 0$`],
      answer: 0,
      why: {
        1: t`$\nabla\cdot\nabla f = \nabla^2 f$ is Laplace’s operator, not zero in general (it needs a metric, too).`,
        2: t`That composes $d$ in the wrong order and is not an identity: $\nabla(\nabla\cdot\mathbf F)$ is usually nonzero.`,
        3: t`$\nabla\cdot(\nabla\times\mathbf F) = 0$ always — it is the other half of $d^2 = 0$.`,
      },
      hints: [t`$df$ is the 1-form version of $\nabla f$; $d$ of a 1-form is the curl.`],
      teach: 'd² = 0 contains both curl grad = 0 and div curl = 0.',
      explain: t`On functions $d$ is grad, on 1-forms curl, on 2-forms div. $d^2 = 0$ from functions to 2-forms says curl grad $= 0$; from 1-forms to 3-forms, div curl $= 0$. Two identities, one reason.`,
    }),
    num({
      id: 'winding', difficulty: 2,
      gen(r) {
        const c = r.pick([0, 0.5, 1.5, 2]), R = r.pick([1, 1.2]), n = r.pick([1, 2, -1]);
        const encloses = R > Math.abs(c);
        const ans = encloses ? 2 * Math.PI * n : 0;
        return {
          prompt: t`The 1-form $d\theta = \dfrac{x\,dy - y\,dx}{x^2 + y^2}$ on the plane minus the origin is closed: $d(d\theta) = 0$ there. Integrate it round the circle of radius $${R}$ centred at $(${c}, 0)$, traversed ${Math.abs(n) === 2 ? 'twice' : 'once'} ${n > 0 ? 'anticlockwise' : 'clockwise'}.`,
          visual: { type: 'c3-lineint', params: { P: '-y/(x^2 + y^2)', Q: 'x/(x^2 + y^2)', x: [-1.8, 3.6], y: [-1.6, 1.6], paths: [{ x: `${c} + ${R}*cos(${n > 0 ? '' : '-'}t)`, y: `${R}*sin(${n > 0 ? '' : '-'}t)`, t: [0, r6(2 * Math.PI * Math.abs(n))], label: 'C', color: 'gold' }], readout: false, integrand: false, bead: false, points: [{ x: 0, y: 0, label: 'origin', color: 'bad' }] }, caption: t`The loop and the 1-form $d\theta$ (as arrows, which grow toward the excluded origin).` },
          answer: ans, tol: { rel: 0.002, abs: 0.01 },
          errors: [{ value: encloses ? 0 : 2 * Math.PI * n, feedback: encloses ? t`$d\theta$ is closed but not exact: round a loop that encloses the origin it gives $2\pi$ per turn, though $d(d\theta) = 0$.` : 'The loop does not go round the origin: the angle returns to its start without completing a turn.' }, { value: -ans, feedback: 'Check the direction: anticlockwise is positive.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\oint d\theta$ is the net change of the angle $\theta$ round the loop.`, encloses ? 'The circle goes round the origin.' : 'Does the circle go round the origin? Check whether the origin is inside.'],
          teach: 'A closed form (dω = 0) need not be exact: dθ integrates to 2π per turn round the origin, a hole in its domain.',
          explain: encloses ? t`The loop winds $${n}$ time${Math.abs(n) > 1 ? 's' : ''} round the origin: $\oint d\theta = ${nice(ans / Math.PI)}\pi = ${nice(ans, 4)}$. If $d\theta$ were $d$ of a function, every loop integral would be 0; it is not, because $\theta$ is not a single-valued function on the punctured plane.` : t`The origin is outside the circle, so $\theta$ can be chosen continuously on a region containing it and $\oint d\theta = 0$.`,
        };
      },
    }),
    mcq({
      id: 'd-of-2form', difficulty: 2,
      prompt: t`In $\mathbb R^3$, what is $d\big(F_x\,dy\wedge dz + F_y\,dz\wedge dx + F_z\,dx\wedge dy\big)$?`,
      visual: { type: 'c3-flux', params: { F: ['x', 'y', 'z'], surfaces: [{ label: 'Sphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'], volume: { kind: 'ball', c: [0, 0, 0], r: 1 } }], readouts: [] }, caption: t`The field $(x, y, z)$ streaming out of a sphere: the flux 2-form of a field with positive divergence.` },
      choices: [t`$(\nabla\cdot\mathbf F)\,dx\wedge dy\wedge dz$`, t`$(\nabla\times\mathbf F)\cdot(dx, dy, dz)$`, t`$0$, since $d^2 = 0$`, t`$(\partial_xF_x)\,dx\wedge dy\wedge dz$ only`],
      answer: 0,
      why: {
        1: 'd of a 2-form is a 3-form; the curl belongs to d of a 1-form.',
        2: t`$d^2 = 0$ applies only if the 2-form is itself some $d\eta$; a general flux 2-form is not.`,
        3: t`$d(F_y\,dz\wedge dx) = \partial_yF_y\,dy\wedge dz\wedge dx = \partial_yF_y\,dx\wedge dy\wedge dz$ too: every component contributes its own derivative.`,
      },
      hints: [t`$d(F_x\,dy\wedge dz) = \partial_xF_x\,dx\wedge dy\wedge dz$ — the $y$ and $z$ derivatives die against $dy\wedge dz$.`, t`$dz\wedge dx\wedge dy$ and $dy\wedge dz\wedge dx$ are cyclic shifts of $dx\wedge dy\wedge dz$, so they equal it.`],
      teach: 'd of the flux 2-form of F is the divergence of F times the volume form.',
      explain: t`$\partial_xF_x + \partial_yF_y + \partial_zF_z$ appears — the divergence. So in $\mathbb R^3$: $d$ = grad on 0-forms, curl on 1-forms, div on 2-forms. (Identifying 1- and 2-forms with vector fields uses the metric and orientation; $d$ itself uses neither.)`,
    }),
    num({
      id: 'div-point', difficulty: 2,
      gen(r) {
        const x = r.pick([1, 2, -1]), y = r.pick([1, -1, 2]), z = r.pick([0.5, 1, 2]);
        const ans = 2 * x * y + z + 2 * x * z;
        return {
          prompt: t`For $\beta = x^2y\,dy\wedge dz + yz\,dz\wedge dx + xz^2\,dx\wedge dy$, write $d\beta = h\,dx\wedge dy\wedge dz$. Evaluate $h$ at $(${x}, ${y}, ${z})$.`,
          visual: { type: 'c3-flux', params: { F: ['x^2*y', 'y*z', 'x*z^2'], surfaces: [{ label: 'Small sphere', x: `${x} + 0.4*sin(u)*cos(v)`, y: `${y} + 0.4*sin(u)*sin(v)`, z: `${z} + 0.4*cos(u)`, u: [0, 'pi'], v: [0, '2*pi'] }], readouts: [], arrows: false, normals: false }, caption: 'A small sphere about the point, tinted by the flux of β through it (blue outward, red inward).' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 2 * x * y + z + 2 * x * z - (z) + 0, feedback: t`Include $\partial_y(yz) = z$ from the middle term.` }, { value: x * x + z + 2 * x * z, feedback: t`The first term is $x^2y$: its $x$-derivative is $2xy$, not $x^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$h = \partial_x(x^2y) + \partial_y(yz) + \partial_z(xz^2)$.`, t`$= 2xy + z + 2xz$.`],
          teach: 'For a 2-form in 3D, the coefficient of dβ is the divergence of the corresponding field.',
          explain: t`$h = 2(${x})(${y}) + ${z} + 2(${x})(${z}) = ${nice(ans)}$ — the net outflow per unit volume from a tiny box at the point.`,
        };
      },
    }),
    order({
      id: 'dd-proof', difficulty: 3,
      prompt: t`Prove $d(df) = 0$ for any smooth function $f$. Order the steps.`,
      visual: { type: 'c3-cells', params: { mode: 'circ', P: '2*x*y', Q: 'x^2', x: [-2.6, 2.6], y: [-1.8, 1.8], region: { kind: 'rect', x: [-1.5, 1.5], y: [-1.2, 1.2] }, n: 3, nSlider: false, probe: null, readout: false }, caption: t`$df$ for $f = x^2y$: every cell’s circulation is zero.` },
      items: [
        t`$df = \partial_\mu f\,dx^\mu$.`,
        t`$d(df) = \partial_\nu\partial_\mu f\,dx^\nu\wedge dx^\mu$.`,
        t`Mixed partials commute: $\partial_\nu\partial_\mu f = \partial_\mu\partial_\nu f$ (symmetric in $\mu, \nu$).`,
        t`The wedge is antisymmetric: $dx^\nu\wedge dx^\mu = -dx^\mu\wedge dx^\nu$.`,
        t`A symmetric array summed against an antisymmetric one gives zero, so $d(df) = 0$.`,
      ],
      hints: ['Write d(df) out in components first.', 'Then compare the symmetry of the two factors.'],
      teach: 'd² = 0 because second partial derivatives are symmetric and wedge products are antisymmetric.',
      explain: t`The same argument works for $d(d\omega)$ with any form $\omega$. In the picture: an exact 1-form has zero circulation round every cell, so $d(df)$, the circulation per area, vanishes.`,
    }),
    mcq({
      id: 'boundary-boundary', difficulty: 2,
      prompt: t`Cut a square into four cells and walk each cell’s edge anticlockwise. What happens to the edges inside the square, and what does it say about the boundary of the boundary?`,
      visual: { type: 'c3-cells', params: { mode: 'circ', P: '0', Q: '0', x: [-2.6, 2.6], y: [-1.8, 1.8], region: { kind: 'rect', x: [-1.2, 1.2], y: [-1.2, 1.2] }, n: 2, nSlider: false, probe: null, arrows: false, readout: false }, caption: 'Four cells, each with its anticlockwise edge arrows. Look at an edge two cells share.' },
      choices: [
        'Each inner edge is walked twice in opposite directions and cancels, leaving the outer square; that square is a closed loop with no end points — its boundary is empty',
        'Each inner edge is walked twice in the same direction, doubling it',
        'The inner edges cancel, and the outer loop’s boundary is its four corners',
        'Nothing cancels; the total boundary is the sum of the four cells’ perimeters',
      ],
      answer: 0,
      why: {
        1: 'Neighbouring anticlockwise cells run their shared edge in opposite directions.',
        2: 'Corners are where edges meet, not boundary points of the loop: each corner is the end of one edge and the start of the next, so they cancel too.',
        3: 'As oriented edges, the shared ones cancel exactly; only lengths would add.',
      },
      hints: ['Draw two neighbouring squares and their arrows along the shared side.', 'For the outer loop, list each edge’s start and end point; does any point remain unmatched?'],
      teach: 'The boundary of a boundary is empty: inner edges cancel in pairs, and a closed loop has no end points.',
      explain: t`$\partial(\partial R) = \varnothing$ for every region. By Stokes (C10.3), $\int_R d(d\omega) = \int_{\partial R}d\omega = \int_{\partial\partial R}\omega = 0$ — the geometric reason for $d^2 = 0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solenoid', difficulty: 3, transfer: true,
      gen(r) {
        const B = r.pick([0.5, 1.2, 2]), Rcm = r.pick([1, 2, 3]);
        const R = Rcm / 100, Phi = B * Math.PI * R * R;
        return {
          prompt: t`A long solenoid of radius $${Rcm}$ cm holds a uniform field $B = ${B}$ T inside and none outside. Outside it, the vector potential is the 1-form $A = \dfrac{\Phi}{2\pi}\,d\theta$, where $\Phi$ is the flux through the solenoid: $dA = 0$ there (no field), yet $A$ is not exact. What is $\oint A$ round a loop that encircles the solenoid once, in webers?`,
          visual: { type: 'c3-lineint', params: { P: '-y/(x^2 + y^2)', Q: 'x/(x^2 + y^2)', x: [-3, 3], y: [-2, 2], paths: [{ x: '(1.6 + 0.3*cos(3*t))*cos(t)', y: '(1.6 + 0.3*cos(3*t))*sin(t)', t: [0, r6(2 * Math.PI)], label: 'loop', color: 'gold', labelAt: 0.1 }], readout: false, integrand: false, bead: false, points: [{ x: 0, y: 0, label: 'solenoid', color: 'bad' }] }, caption: 'The solenoid end-on (red) and a loop round it, through the field-free region where A lives.' },
          answer: Phi, units: 'Wb', tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`$dA = 0$ outside, but $A$ is closed, not exact: $\oint A = \Phi$ for any loop round the solenoid.` }, { value: B * 2 * Math.PI * R, feedback: t`The flux is $B$ times the solenoid’s cross-sectional area, $\pi R^2$.` }, { value: B * Math.PI * Rcm * Rcm, feedback: 'Convert centimetres to metres before squaring.' }].filter((e) => Math.abs(e.value - Phi) > 0.01 * Phi),
          hints: [t`$\oint\frac{\Phi}{2\pi}\,d\theta = \frac{\Phi}{2\pi}\cdot 2\pi = \Phi$.`, t`$\Phi = B\pi R^2$ with $R = ${R}$ m.`],
          teach: 'A closed but not exact form gives the same nonzero integral round every loop that encloses the hole in its domain.',
          explain: t`$\oint A = \Phi = ${B}\times\pi\times(${R})^2 = ${tex(Phi, 3)}$ Wb, whatever the loop’s shape. Electrons sent round the solenoid feel no field, yet their phase shifts by $e\Phi/\hbar$ — the Aharonov–Bohm effect, observed in 1960 and since confirmed with shielded toroidal magnets (Tonomura, 1986).`,
        };
      },
    }),
    expr({
      id: 'cp-d', difficulty: 2,
      gen(r) {
        const F = r.pick(FORMS.slice(1));
        return {
          prompt: t`Compute $d\omega$ for $\omega = ${F.Ptex}\,dx + (${F.Qtex})\,dy$, written as $h(x, y)\,dx\wedge dy$. Give $h$.`,
          visual: { type: 'c3-cells', params: { mode: 'circ', P: F.P, Q: F.Q, x: [-2.6, 2.6], y: [-1.8, 1.8], region: { kind: 'rect', x: [-1.5, 1.5], y: [-1.2, 1.2] }, n: 5, nSlider: false, probe: null, readout: false }, caption: t`Cells tinted by the circulation of $\omega$ round them.` },
          answer: F.d, answerTeX: F.dtex, vars: { x: [-2, 2], y: [-2, 2] },
          errors: [{ answer: `-(${F.d})`, feedback: t`Sign: $h = \partial_xQ - \partial_yP$.` }],
          hints: [t`$h = \partial_xQ - \partial_yP$.`],
          teach: t`$d(P\,dx + Q\,dy) = (\partial_xQ - \partial_yP)\,dx\wedge dy$: the circulation per unit area.`,
          explain: t`$h = ${F.dtex}$; the cells’ tints follow its sign.`,
        };
      },
    }),
    mcq({
      id: 'cp-exact', difficulty: 2,
      prompt: t`Which of these 1-forms on the whole plane is exact, $\omega = df$ for some function $f$?`,
      visual: { type: 'field2d', params: { P: 'y', Q: 'x', x: [-2, 2], y: [-2, 2], readout: false, probe: false }, caption: t`One of the four, drawn as arrows: $(y, x)$.` },
      choices: [t`$y\,dx + x\,dy$`, t`$x\,dy$`, t`$-y\,dx + x\,dy$`, t`$y\,dx - x\,dy$`],
      answer: 0,
      why: {
        1: t`$d(x\,dy) = dx\wedge dy \ne 0$, so it cannot be $df$.`,
        2: t`$d(-y\,dx + x\,dy) = 2\,dx\wedge dy \ne 0$.`,
        3: t`$d(y\,dx - x\,dy) = -2\,dx\wedge dy \ne 0$.`,
      },
      hints: ['Exact forms are closed: compute dω for each.', 'On the whole plane (no holes) closed also implies exact.'],
      teach: 'On the plane, a 1-form is exact exactly when its d vanishes (the Poincaré lemma).',
      explain: t`$d(y\,dx + x\,dy) = dy\wedge dx + dx\wedge dy = 0$, and indeed it is $d(xy)$. On a region with holes, $d\omega = 0$ is necessary but not sufficient — $d\theta$ is the standard counterexample.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §2.9', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Needham, Visual Differential Geometry and Forms, Act V (forms)', url: 'https://press.princeton.edu/books/paperback/9780691203706/visual-differential-geometry-and-forms' },
    { label: 'Tonomura et al., Evidence for Aharonov–Bohm effect with magnetic field completely shielded from electron wave, Phys. Rev. Lett. 56, 792 (1986)', url: 'https://doi.org/10.1103/PhysRevLett.56.792' },
  ],
});
