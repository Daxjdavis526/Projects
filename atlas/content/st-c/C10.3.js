// Integrating forms and Stokes' theorem: an n-form on an oriented n-manifold
// is integrated by pulling it back to a chart (the Jacobian comes out of the
// wedge); ∫_M dω = ∫_∂M ω contains the FTC, Green, Kelvin–Stokes and Gauss.
// A hemisphere checked both ways, the area form of the sphere (closed, not
// exact), orientation, and the Earth's fair-weather charge from Gauss's law.
import { lesson, mcq, num, order, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;

export default lesson({
  id: 'st-c.C10.3',
  title: 'Integrating forms and Stokes’ theorem',
  minutes: 15, difficulty: 3,
  equation: t`\int_M d\omega = \int_{\partial M}\omega`,
  intro: t`An $n$-form is made to be integrated over an $n$-dimensional region: it already knows how to measure oriented volume. To integrate $\omega = f\,dx^1\wedge\dots\wedge dx^n$ over a region of an oriented manifold, pull it back to a chart whose coordinates are in the positive order and integrate $f$ as an ordinary multiple integral. Change chart and the wedge product produces the Jacobian determinant by itself — $dx\wedge dy = r\,dr\wedge d\theta$ — so the answer is chart-independent. No metric is needed, only an **orientation**: a consistent choice of which ordered bases are positive.

Then one theorem does the work of four. For a $(k-1)$-form $\omega$ on an oriented $k$-dimensional $M$ with boundary $\partial M$ (oriented so that the outward direction followed by the boundary’s own positive basis is positive):

$$\begin{array}{c|c|c} \omega & M & \text{classical theorem} \\ \hline f & \text{curve from } P \text{ to } Q & \int_P^Q df = f(Q) - f(P) \\ P\,dx + Q\,dy & \text{region of the plane} & \text{Green} \\ \text{1-form} & \text{surface in space} & \text{Kelvin–Stokes} \\ \text{2-form} & \text{solid} & \text{Gauss (divergence)} \end{array}$$`,
  symbols: [
    { tex: 'M', text: t`an oriented $k$-dimensional manifold with boundary: a curve, a surface, a solid, a region of spacetime` },
    { tex: t`\partial M`, text: t`its boundary, $(k-1)$-dimensional, with the induced orientation (outward first)` },
    { tex: t`\omega`, text: t`a $(k-1)$-form, smooth on all of $M$` },
    { tex: t`d\omega`, text: t`its exterior derivative, a $k$-form: what gets integrated over $M$` },
  ],
  why: t`Every conservation law in physics is Stokes’ theorem applied to $d(\star J) = 0$: what flows out through the boundary of a region of spacetime equals what was destroyed inside — nothing. Gauss’s law, the ADM mass of a spacetime and the Komar integrals of GR are all boundary integrals of this kind.`,
  visual: {
    type: 'c3-cells',
    title: 'One theorem, three pictures',
    lead: t`Cut $M$ into cells. Each cell contributes its own boundary integral; shared boundaries are walked in opposite directions and cancel; only the outer boundary survives. Switch between the interval (FTC), circulation (Green) and flux (Green’s flux form, the 2D divergence theorem).`,
    tasks: [
      t`Interval: each piece contributes $f(\text{right}) - f(\text{left})$; inner endpoints cancel, leaving $f(b) - f(a)$. That is $\int_M df = \int_{\partial M}f$ with $\partial M = \{b\} - \{a\}$.`,
      t`Circulation: compare “sum over the cells” with “round the boundary” — equal for any number of cells. Raise the number of cells: each cell’s circulation per area settles on $\partial_xQ - \partial_yP$, the coefficient of $d\omega$.`,
      t`Flux: the same bookkeeping with outward flux per cell; per area it tends to the divergence.`,
    ],
    params: { modes: ['interval', 'circ', 'flux'], mode: 'circ', P: '-y + 0.3*x*y', Q: 'x + 0.2*x^2', x: [-2.6, 2.6], y: [-1.8, 1.8], region: { kind: 'disk', c: [0, 0], r: 1.4 }, n: 3, f: 'x^3/3 - x', a: -1.5, b: 2 },
    caption: t`The 1-form $(-y + 0.3xy)\,dx + (x + 0.2x^2)\,dy$ drawn as arrows (which uses the Euclidean metric), and a disc cut into rings and sectors. All integrals are computed numerically; the equality of the two totals is Stokes’ theorem.`,
  },
  example: {
    prompt: t`Verify Stokes’ theorem for $\omega = x\,dy$ on the upper unit hemisphere $M$ (oriented by the outward normal), by integrating $\omega$ round the equator and $d\omega$ over $M$ in the chart $(\theta, \varphi)$.`,
    visual: { type: 'c3-flux', params: { F: ['0', '0', '1'], surfaces: [{ label: 'Hemisphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi/2'], v: [0, '2*pi'], boundary: { x: 'cos(t)', y: 'sin(t)', z: '0', t: [0, '2*pi'] } }], readouts: [], arrows: false }, caption: t`The hemisphere tinted by $dx\wedge dy$ on its patches (strongest at the top, where the patches face up), its outward normals, and its boundary walked anticlockwise seen from above.` },
    steps: [
      { label: 'The boundary', text: t`$\partial M$ is the equator $(\cos t, \sin t, 0)$, $0 \le t \le 2\pi$, anticlockwise seen from above (outward normal up, right-hand rule). Pull back: $x\,dy = \cos t\cdot\cos t\,dt$, and $\int_0^{2\pi}\cos^2t\,dt = \pi$.` },
      { label: 'The derivative', text: t`$d\omega = dx\wedge dy$, the 2-form that measures area projected on the $xy$-plane.` },
      { label: 'Pull back', text: t`With $x = \sin\theta\cos\varphi$ and $y = \sin\theta\sin\varphi$: $dx\wedge dy = \det\dfrac{\partial(x, y)}{\partial(\theta, \varphi)}\,d\theta\wedge d\varphi = \sin\theta\cos\theta\,d\theta\wedge d\varphi$.` },
      { label: 'Orientation', text: t`The chart $(\theta, \varphi)$ has $\mathbf X_\theta\times\mathbf X_\varphi$ pointing outward (C3.2), so it is positively oriented: integrate as written.` },
      { label: 'Integrate', text: t`$\int_0^{2\pi}\!\int_0^{\pi/2}\sin\theta\cos\theta\,d\theta\,d\varphi = 2\pi\cdot\tfrac12 = \pi$ ✓.` },
      { label: 'Sense check', text: t`$\pi$ is the area of the hemisphere’s shadow on the $xy$-plane, the unit disc — as it must be, since $dx\wedge dy$ measures exactly that shadow.` },
    ],
    answer: t`$\int_{\partial M}x\,dy = \pi = \int_M dx\wedge dy$.`,
  },
  practice: [
    match({
      id: 'four-theorems', difficulty: 2,
      prompt: t`Each classical theorem is $\int_M d\omega = \int_{\partial M}\omega$ for one choice of $\omega$ and $M$. Match them.`,
      left: ['The fundamental theorem of calculus', 'Green’s theorem', 'The Kelvin–Stokes theorem', 'The divergence (Gauss) theorem'],
      right: ['a 0-form (function) on a curve, whose boundary is two end points', 'a 1-form on a flat region of the plane', 'a 1-form on a curved surface in space', 'a 2-form on a solid region of space', 'a 3-form on a closed surface'],
      answer: [0, 1, 2, 3],
      visual: { type: 'c3-cells', params: { modes: ['interval', 'circ', 'flux'], mode: 'interval', P: '-y', Q: 'x', x: [-2.6, 2.6], y: [-1.8, 1.8], n: 3, nSlider: false, readout: false, f: 'x^3/3 - x', a: -1.5, b: 2 }, caption: 'The cell picture behind each version: inner boundaries cancel, the outer one remains.' },
      hints: ['ω has one degree less than the dimension of M.', 'A 3-form cannot be integrated over a 2-dimensional surface.'],
      teach: 'Stokes’ theorem in every dimension: integrate dω over M, or ω over the boundary of M.',
      explain: t`FTC: $k = 1$. Green and Kelvin–Stokes: $k = 2$, the second on a curved surface (where $d\omega$ is the curl’s flux). Gauss: $k = 3$, with $d$ of the flux 2-form being the divergence times volume. Integrating a 3-form needs a 3-dimensional region, so the last option matches nothing.`,
    }),
    num({
      id: 'disc', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 1.5, 2, 3]);
        const ans = 2 * Math.PI * R * R;
        return {
          prompt: t`Use Stokes’ theorem to find $\oint(-y\,dx + x\,dy)$ round the circle of radius $${R}$, anticlockwise.`,
          visual: { type: 'c3-cells', params: { mode: 'circ', P: '-y', Q: 'x', x: [-3.4, 3.4], y: [-2.3, 2.3], region: { kind: 'disk', c: [0, 0], r: Math.min(R, 2) }, n: 3, nSlider: false, probe: null, readout: false }, caption: t`The disc cut into cells (drawn at radius ${Math.min(R, 2)}); every cell carries the same circulation per area.` },
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: Math.PI * R * R, feedback: t`$d(-y\,dx + x\,dy) = 2\,dx\wedge dy$: twice the area.` }, { value: 2 * Math.PI * R, feedback: 'That is the circumference. The integral is 2 × area.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$d\omega = (\partial_x x - \partial_y(-y))\,dx\wedge dy = 2\,dx\wedge dy$.`, t`$\int_{\text{disc}}2\,dx\wedge dy = 2\times\pi R^2$.`],
          teach: 'The boundary integral of −y dx + x dy is twice the enclosed area — the principle of the planimeter.',
          explain: t`$\oint\omega = \int 2\,dA = 2\pi(${R})^2 = ${nice(ans, 4)}$. This is how a planimeter measures area by tracing a boundary — and how C9.3’s half-ellipse gave $2\pi$: twice its area $\pi$, once the straight closing edge (which contributes 0) is added.`,
        };
      },
    }),
    num({
      id: 'gauss', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 0.5, 3]);
        const ans = 4 * Math.PI * a ** 3;
        return {
          prompt: t`Find $\int_{S}(x\,dy\wedge dz + y\,dz\wedge dx + z\,dx\wedge dy)$ over the sphere of radius $${a}$ (outward orientation) using Stokes.`,
          visual: { type: 'c3-flux', params: { F: ['x', 'y', 'z'], surfaces: [{ label: 'Sphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'], volume: { kind: 'ball', c: [0, 0, 0], r: 1 } }], readouts: [], normals: false }, caption: 'The field (x, y, z) leaving a sphere (drawn at radius 1), tinted by its flux.' },
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: (4 / 3) * Math.PI * a ** 3, feedback: t`$d$ of this 2-form is $3\,dx\wedge dy\wedge dz$ ($1 + 1 + 1$): three times the volume.` }, { value: 4 * Math.PI * a * a, feedback: 'That is the surface area. The integral is 3 × volume.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$d\beta = (\partial_xx + \partial_yy + \partial_zz)\,dx\wedge dy\wedge dz = 3\,dx\wedge dy\wedge dz$.`, t`Volume of the ball: $\tfrac43\pi a^3$.`],
          teach: 'The divergence theorem is Stokes for a 2-form on a solid: the flux out equals the integral of the divergence inside.',
          explain: t`$\int_S\beta = \int_B 3\,dV = 3\cdot\tfrac43\pi(${a})^3 = ${nice(ans, 4)}$. Directly: on the sphere the field is radial with size $a$, so the flux is $a\times 4\pi a^2$ — the same.`,
        };
      },
    }),
    num({
      id: 'cap', difficulty: 2,
      gen(r) {
        const th = r.pick([20, 30, 45, 60, 75]);
        const ans = 2 * Math.PI * (1 - Math.cos(th * DEG));
        return {
          prompt: t`Integrate the area form of the unit sphere, $\sin\theta\,d\theta\wedge d\varphi$, over the cap $0 \le \theta \le ${th}^\circ$.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 90 - th, transport: false, readout: false }, caption: t`The circle at colatitude $${th}^\circ$ that bounds the cap.` },
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: 2 * Math.PI * Math.sin(th * DEG), feedback: t`$\int_0^{\theta_0}\sin\theta\,d\theta = 1 - \cos\theta_0$, not $\sin\theta_0$.` }, { value: 2 * Math.PI * (1 - Math.cos(th * DEG)) / (2 * Math.PI), feedback: t`Include the $\varphi$ integral: a factor $2\pi$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\int_0^{2\pi}\!\int_0^{\theta_0}\sin\theta\,d\theta\,d\varphi$.`],
          teach: 'An n-form is integrated by pulling it back to a chart and doing the ordinary multiple integral.',
          explain: t`$2\pi(1 - \cos ${th}^\circ) = ${nice(ans, 4)}$. The whole sphere gives $4\pi$. And $\sin\theta\,d\theta\wedge d\varphi = d(-\cos\theta\,d\varphi)$ on the cap, so Stokes gives the same: $-\cos\theta_0\cdot 2\pi$ round the edge, minus the value $-2\pi$ at the pole’s tiny circle.`,
        };
      },
    }),
    mcq({
      id: 'no-boundary', difficulty: 3,
      prompt: t`The sphere $S^2$ has no boundary. What does Stokes’ theorem say about the area form $\sigma = \sin\theta\,d\theta\wedge d\varphi$, whose integral over $S^2$ is $4\pi$?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.4, grid: false, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'teal' }] }, caption: 'The unit sphere: compact, with no edge anywhere.' },
      choices: [
        t`$\sigma$ is not $d\eta$ for any 1-form $\eta$ defined on all of $S^2$: that would force $\int_{S^2}\sigma = \int_{\partial S^2}\eta = 0$`,
        t`$\int_{S^2}\sigma$ must be 0, so the area is really 0`,
        t`$\sigma = d(-\cos\theta\,d\varphi)$ on all of $S^2$, so Stokes fails on the sphere`,
        'Stokes does not apply to manifolds without boundary',
      ],
      answer: 0,
      why: {
        1: t`Only exact forms must integrate to 0 over a closed manifold; $\sigma$ is not exact.`,
        2: t`$-\cos\theta\,d\varphi$ is not defined at the poles ($d\varphi$ is singular there), so it is not a 1-form on all of $S^2$. Stokes is fine.`,
        3: t`It applies with $\partial M = \varnothing$, giving $\int_M d\eta = 0$ — a strong statement, not an exception.`,
      },
      hints: [t`Suppose $\sigma = d\eta$ with $\eta$ smooth everywhere. Apply Stokes.`, t`$\partial S^2 = \varnothing$.`],
      teach: 'On a manifold without boundary, every exact form integrates to zero; a closed form with a nonzero integral is therefore not exact.',
      explain: t`$\sigma$ is closed ($d\sigma = 0$: there are no 3-forms on a surface) but not exact. Its integral, $4\pi$, detects the sphere’s topology — the seed of Gauss–Bonnet (C6.4), where $\int K\,dA = 4\pi$ for any metric on a sphere.`,
    }),
    num({
      id: 'ftc', difficulty: 2,
      gen(r) {
        const [P, Q] = r.pick([[[0, 0], [1, 2]], [[1, -1], [2, 1]], [[-1, 1], [1, 1]], [[0, 1], [2, 0]]]);
        const f = (x, y) => x * x * y + y;
        const ans = f(...Q) - f(...P);
        return {
          prompt: t`Integrate $\omega = 2xy\,dx + (x^2 + 1)\,dy$ along any path from $(${P.join(', ')})$ to $(${Q.join(', ')})$.`,
          visual: { type: 'c3-lineint', params: { P: '2*x*y', Q: 'x^2 + 1', x: [-1.8, 2.8], y: [-1.6, 2.4], paths: [{ x: `${P[0]} + ${Q[0] - P[0]}*t`, y: `${P[1]} + ${Q[1] - P[1]}*t + 0.8*sin(pi*t)`, t: [0, 1], label: 'C', color: 'gold' }], potential: 'x^2*y + y', readout: false, integrand: false, bead: false }, caption: 'A wiggly path between the two points over the level curves of a potential.' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -ans, feedback: 'End minus start: f(Q) − f(P).' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Find $f$ with $df = \omega$: $\partial_xf = 2xy$ and $\partial_yf = x^2 + 1$.`, t`$f = x^2y + y$; then Stokes for a 0-form: $\int_C df = f(\text{end}) - f(\text{start})$.`],
          teach: 'For an exact 1-form, Stokes on a curve is the fundamental theorem of calculus: only the end points matter.',
          explain: t`$f = x^2y + y$, so $\int_C\omega = f(${Q.join(', ')}) - f(${P.join(', ')}) = ${f(...Q)} - (${f(...P)}) = ${ans}$, for every path. The boundary of a curve is its two end points, the second counted with $+$ and the first with $-$.`,
        };
      },
    }),
    order({
      id: 'square-proof', difficulty: 3,
      prompt: t`Prove $\int_R d(Q\,dy) = \oint_{\partial R}Q\,dy$ for the unit square $R = [0, 1]^2$ (anticlockwise boundary). Order the steps.`,
      visual: { type: 'c3-cells', params: { mode: 'circ', P: '0', Q: 'x^2 + y', x: [-0.6, 1.6], y: [-0.3, 1.3], region: { kind: 'rect', x: [0, 1], y: [0, 1] }, n: 1, nSlider: false, probe: null, readout: false }, caption: 'The unit square and its anticlockwise boundary.' },
      items: [
        t`$d(Q\,dy) = \partial_xQ\,dx\wedge dy$, so the left side is $\int_0^1\!\int_0^1\partial_xQ\,dx\,dy$.`,
        t`Do the $x$-integral first by the FTC: $\int_0^1\partial_xQ\,dx = Q(1, y) - Q(0, y)$.`,
        t`So the left side is $\int_0^1 Q(1, y)\,dy - \int_0^1 Q(0, y)\,dy$.`,
        t`On the boundary, $dy = 0$ on the top and bottom; the right side goes up ($+\int_0^1Q(1, y)\,dy$), the left side down ($-\int_0^1Q(0, y)\,dy$).`,
        t`The two sides agree. The $P\,dx$ term is the same argument with $x$ and $y$ swapped (and a sign from $dy\wedge dx$).`,
      ],
      hints: ['Turn the area integral into an iterated one and use the one-variable FTC.', 'Then walk the four edges and see which carry dy.'],
      teach: 'Stokes in any dimension reduces, cell by cell, to the one-variable fundamental theorem of calculus.',
      explain: t`For a general region, cut it into near-square cells: this proof covers each cell, and the inner edges cancel (C10.2). Curved surfaces are handled by pulling back to chart squares — which works because pullback commutes with $d$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-earth-charge', difficulty: 3, transfer: true,
      gen(r) {
        const E = r.pick([100, 120, 130, 150]);
        const eps0 = 8.8541878188e-12, R = 6.371e6;
        const Q = -eps0 * E * 4 * Math.PI * R * R;
        return {
          prompt: t`In fair weather the atmospheric electric field at the ground points **downward** with strength about $${E}$ V/m, everywhere over the globe. Treating the Earth as a sphere of radius $6371$ km, use Gauss’s law — Stokes for the flux 2-form, $\oint\mathbf E\cdot d\mathbf A = Q/\varepsilon_0$ — to estimate the net charge on the Earth’s surface, in coulombs (sign included). ($\varepsilon_0 = 8.854\times10^{-12}$ F/m.)`,
          visual: { type: 'c3-flux', params: { F: ['-x', '-y', '-z'], surfaces: [{ label: 'Earth', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'] }], readouts: [], normals: false }, caption: 'A sphere with a field pointing straight in everywhere: the flux through it is negative (red).' },
          answer: Q, units: 'C', tol: { rel: 0.01 },
          errors: [{ value: -Q, feedback: 'The field points down, into the surface: the outward flux is negative, so the enclosed charge is negative.' }, { value: -E * 4 * Math.PI * R * R, feedback: t`Multiply by $\varepsilon_0$: $Q = \varepsilon_0\oint\mathbf E\cdot d\mathbf A$.` }, { value: -eps0 * E * Math.PI * R * R, feedback: t`A sphere’s area is $4\pi R^2$.` }],
          hints: [t`Outward flux $= -E\times 4\pi R^2$, since $\mathbf E$ points inward.`, t`$Q = \varepsilon_0\times(-${E})\times 4\pi(6.371\times10^{6})^2$.`],
          teach: 'Gauss’s law is Stokes’ theorem for the electric flux 2-form: a boundary measurement gives the total charge inside.',
          explain: t`$Q = -${E}\times 8.854\times10^{-12}\times 4\pi(6.371\times10^6)^2 \approx ${tex(Q, 3)}$ C — about half a million coulombs, kept up by thunderstorms worldwide (the global electric circuit). The measurement is made only at the boundary, never inside.`,
        };
      },
    }),
    num({
      id: 'cp-hemisphere', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3, 0.5]);
        const ans = Math.PI * a * a;
        return {
          prompt: t`Using Stokes, find $\int_M dx\wedge dy$ over the upper hemisphere of radius $${a}$, oriented by the outward normal.`,
          visual: { type: 'c3-flux', params: { F: ['0', '0', '1'], surfaces: [{ label: 'Hemisphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi/2'], v: [0, '2*pi'], boundary: { x: 'cos(t)', y: 'sin(t)', z: '0', t: [0, '2*pi'] } }], readouts: [], arrows: false }, caption: 'A hemisphere (drawn at radius 1) and its boundary circle.' },
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: 2 * Math.PI * a * a, feedback: 'That is the hemisphere’s own area. dx∧dy measures only its shadow on the xy-plane.' }, { value: -ans, feedback: 'With the outward (upward) normal, the boundary runs anticlockwise seen from above: positive.' }],
          hints: [t`$dx\wedge dy = d(x\,dy)$; integrate $x\,dy$ round the equator of radius $${a}$.`, t`$\oint x\,dy = \int_0^{2\pi}a\cos t\cdot a\cos t\,dt = \pi a^2$.`],
          teach: 'Stokes lets a surface integral be done on its boundary instead — any surface with the same boundary gives the same answer.',
          explain: t`$\pi(${a})^2 = ${nice(ans, 4)}$: the area of the shadow, the same for the flat disc or any other surface spanning the same circle.`,
        };
      },
    }),
    mcq({
      id: 'cp-orient', difficulty: 2,
      prompt: t`The same hemisphere is oriented instead by the **inward** normal. What happens to $\int_M dx\wedge dy$ and to the direction of $\partial M$?`,
      visual: { type: 'c3-flux', params: { F: ['0', '0', '1'], surfaces: [{ label: 'Hemisphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi/2'], v: [0, '2*pi'], boundary: { x: 'cos(t)', y: 'sin(t)', z: '0', t: [0, '2*pi'] } }], flip: true, readouts: [], arrows: false }, caption: 'The hemisphere with its normals flipped inward; its boundary now runs the other way.' },
      choices: ['The integral becomes −π and the boundary runs clockwise seen from above', 'Nothing changes: area is positive', 'The integral becomes −π but the boundary still runs anticlockwise', 'The integral becomes 0'],
      answer: 0,
      why: {
        1: 'An integral of a form depends on orientation: flipping it flips the sign.',
        2: 'Stokes would then fail. The boundary’s orientation is induced from M’s, so it flips too.',
        3: 'Only the sign changes; the shadow still has area π.',
      },
      hints: ['Integrals of forms are odd under a change of orientation.', 'The induced boundary orientation follows the right-hand rule with the chosen normal.'],
      teach: 'Reversing the orientation of M reverses that of ∂M, and both sides of Stokes change sign together.',
      explain: t`Both become $-\pi$. Forms measure *oriented* size; an unsigned area needs a metric and $|\,\cdot\,|$, which is the other way to integrate (C11).`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §2.9–2.10', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Needham, Visual Differential Geometry and Forms, ch. 37–38', url: 'https://press.princeton.edu/books/paperback/9780691203706/visual-differential-geometry-and-forms' },
    { label: 'Rycroft, Israelsson & Price, The global atmospheric electric circuit, J. Atmos. Sol.-Terr. Phys. 62, 1563 (2000)', url: 'https://doi.org/10.1016/S1364-6826(00)00112-7' },
  ],
});
