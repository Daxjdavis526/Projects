// Double integrals in polar coordinates: a polar cell has sides dr and r dθ,
// so dA = r dr dθ — the factor that makes the Gaussian integral possible,
// and the one most often forgotten.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { r6 } from './_integrals.js';

const t = String.raw;

// a polar picture on calc-polar
const polar = (x, y, params, caption) => ({ type: 'calc-polar', params: { grid: 'polar', aspect: 'wide', x, y, angles: 'none', ...params }, caption });
// a cell r0 ≤ r ≤ r0 + dr, th0 ≤ θ ≤ th0 + dth (numbers), as a fill with its outline
const cell = (r0, dr, th0, dth, color = 'gold', alpha = 0.6) => ({
  fill: { polar: `${r6(r0 + dr)}`, inner: `${r6(r0)}`, theta: [r6(th0), r6(th0 + dth)], color, alpha },
  edges: [
    { polar: `${r6(r0 + dr)}`, theta: [r6(th0), r6(th0 + dth)], color, width: 1.6 },
    { polar: `${r6(r0)}`, theta: [r6(th0), r6(th0 + dth)], color, width: 1.6 },
  ],
  segs: [th0, th0 + dth].map((a) => ({ from: [r6(r0 * Math.cos(a)), r6(r0 * Math.sin(a))], to: [r6((r0 + dr) * Math.cos(a)), r6((r0 + dr) * Math.sin(a))], color, width: 1.6 })),
});
// a surface of revolution z = g(r) over 0 ≤ r ≤ R (g an expression of u = r), on surface3d
const revolved = (g, R, { r0 = 0, zs = 1, caption, curves = [], ...rest } = {}) => ({
  type: 'surface3d',
  params: { surface: [`u*cos(v)`, `u*sin(v)`, `${zs}*(${g})`], domain: [[r0, R], [0, 6.2832]], n: 40, axisLen: r6(R * 1.25), dist: r6(3.2 * R + 1.5), yaw: 0.6, pitch: 0.5, curves, ...rest },
  caption,
});

export default lesson({
  id: 'math2210.C3-4.3',
  title: 'Double integrals in polar coordinates',
  minutes: 11, difficulty: 2,
  intro: t`Disks, rings and sectors are awkward in $x$ and $y$: the limits fill with square roots. In polar coordinates the same regions are rectangles in $r$ and $\theta$. The price is a single factor. The small region between radii $r$ and $r + dr$ and angles $\theta$ and $\theta + d\theta$ — a **polar cell** — is nearly a rectangle with sides $dr$ and $r\,d\theta$, so its area is $r\,dr\,d\theta$, not $dr\,d\theta$:

$$\iint_D f\,dA = \int_\alpha^\beta\!\!\int_{r_1(\theta)}^{r_2(\theta)} f(r\cos\theta,\ r\sin\theta)\,r\,dr\,d\theta$$

That extra $r$ is the most-forgotten factor in multivariable calculus. It is also what makes the famous **Gaussian integral** $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}$ possible.`,
  symbols: [
    { tex: 'r,\\ \\theta', text: t`polar coordinates: the distance from the origin and the angle from the positive $x$-axis, in radians; $x = r\cos\theta$, $y = r\sin\theta$` },
    { tex: 'dA = r\\,dr\\,d\\theta', text: t`the **area element**: a polar cell with sides $dr$ (along the radius) and $r\,d\theta$ (an arc of a circle of radius $r$)` },
    { tex: 'r_1(\\theta),\\ r_2(\\theta)', text: t`where the ray at angle $\theta$ enters and leaves $D$; $r_1 = 0$ when $D$ contains the origin` },
    { tex: '\\alpha,\\ \\beta', text: t`the angular limits: constants, with $\beta - \alpha \le 2\pi$` },
    { tex: 'f(r\\cos\\theta,\\ r\\sin\\theta)', text: t`the integrand rewritten in polar coordinates; often $x^2 + y^2$ simply becomes $r^2$` },
  ],
  why: t`Circular symmetry is everywhere in physics — beams, disks, pipes, galaxies, the field around a star — and the $r$ in $r\,dr\,d\theta$ is your first **scale factor**: the same bookkeeping, generalised, gives volumes in any coordinates and, in general relativity, in curved spacetime.`,
  visual: {
    type: 'calc-polar',
    title: 'Where the r comes from',
    lead: t`The gold cell is the polar rectangle $r \le r' \le r + \Delta r$, $\theta \le \theta' \le \theta + \Delta\theta$. Its sides along the radius have length $\Delta r$; its arcs have length about $r\,\Delta\theta$ — the farther out, the longer. The readouts compare its true area with $r\,\Delta r\,\Delta\theta$ and with $\Delta r\,\Delta\theta$.`,
    tasks: [
      t`Slide the cell outward from $r = 0.3$ to $r = 2$ without changing $\Delta r$ or $\Delta\theta$: its area grows in proportion to $r$, while $\Delta r\,\Delta\theta$ does not change at all.`,
      t`Make the cell big — $\Delta r = 0.6$, $\Delta\theta = 1$ rad — and compare: with $r$ taken at the cell's middle, $r\,\Delta r\,\Delta\theta$ still matches the true area exactly. (Check: $\tfrac12\big((r + \Delta r)^2 - r^2\big)\Delta\theta = \big(r + \tfrac{\Delta r}{2}\big)\Delta r\,\Delta\theta$.)`,
      t`Turn $\theta$ all the way round: nothing changes. The area of a cell depends on how far out it is, not on its direction.`,
    ],
    params: {
      x: [-2.9, 2.9], y: [-2.9, 2.9], aspect: '', grid: 'polar', rstep: 0.5, spokes: 30, angles: 'rad',
      sliders: [
        { key: 'r0', label: 'Inner radius $r$', min: 0.1, max: 2.2, step: 0.05, value: 1.2, explain: 'How far out the cell starts.' },
        { key: 'th0', label: 'Angle $\\theta$', min: 0, max: 6.25, step: 0.05, value: 0.5, unit: '\\mathrm{rad}', explain: 'The direction of its near edge, from the positive $x$-axis.' },
        { key: 'dr', label: '$\\Delta r$', min: 0.1, max: 0.6, step: 0.05, value: 0.4, explain: 'Its depth along the radius.' },
        { key: 'dth', label: '$\\Delta\\theta$', min: 0.1, max: 1, step: 0.05, value: 0.6, unit: '\\mathrm{rad}', explain: 'The angle it spans.' },
      ],
      fills: [{ polar: 'r0 + dr', inner: 'r0', theta: ['th0', 'th0 + dth'], color: 'gold', alpha: 0.6 }],
      curves: [{ polar: 'r0 + dr', theta: ['th0', 'th0 + dth'], color: 'gold', width: 2 }, { polar: 'r0', theta: ['th0', 'th0 + dth'], color: 'gold', width: 2 }],
      segments: [
        { from: ['r0*cos(th0)', 'r0*sin(th0)'], to: ['(r0 + dr)*cos(th0)', '(r0 + dr)*sin(th0)'], color: 'gold', width: 2 },
        { from: ['r0*cos(th0 + dth)', 'r0*sin(th0 + dth)'], to: ['(r0 + dr)*cos(th0 + dth)', '(r0 + dr)*sin(th0 + dth)'], color: 'gold', width: 2 },
      ],
      texts: [
        { text: 'Δr', x: '(r0 + dr/2)*cos(th0) + 0.16*sin(th0)', y: '(r0 + dr/2)*sin(th0) - 0.16*cos(th0)', color: 'gold' },
        { text: 'r Δθ', x: '(r0 + dr + 0.24)*cos(th0 + dth/2)', y: '(r0 + dr + 0.24)*sin(th0 + dth/2)', color: 'gold' },
      ],
      readouts: [
        { label: 'true area of the cell', expr: 'area', digits: 4 },
        { label: '$r\\,\\Delta r\\,\\Delta\\theta$, $r$ at the middle', expr: '(r0 + dr/2)*dr*dth', digits: 4 },
        { label: '$\\Delta r\\,\\Delta\\theta$ (no $r$)', expr: 'dr*dth', digits: 4 },
      ],
    },
    caption: 'One polar cell on a grid of rings 0.5 apart and spokes 30° apart. The true area is measured numerically from its edges.',
  },
  example: {
    prompt: t`The bell curve $e^{-x^2}$ has no elementary antiderivative, yet the area under it is known exactly. Find $I = \displaystyle\int_{-\infty}^{\infty} e^{-x^2}\,dx$ by computing $I^2$ as a double integral.`,
    visual: revolved('exp(-u^2)', 2.4, { zs: 1.6, curves: [{ param: ['t', '0', '1.6*exp(-t^2)'], t: [-2.4, 2.4], color: 'gold', width: 3 }], caption: t`The surface $z = e^{-(x^2 + y^2)}$ (heights $\times 1.6$), cut off at $r = 2.4$. Its volume is $I^2$; the gold curve, its slice through $y = 0$, is the bell $e^{-x^2}$ whose area is $I$. Drag to rotate.` }),
    steps: [
      { label: 'Square it', text: t`Name the variable differently in each copy: $I^2 = \left(\int e^{-x^2}\,dx\right)\left(\int e^{-y^2}\,dy\right)$. A product of single integrals is a double integral of the product (lesson C3-4.1, run backwards), here over the whole plane:
$$I^2 = \iint_{\mathbb R^2} e^{-(x^2 + y^2)}\,dA.$$` },
      { label: 'Go polar', text: t`$x^2 + y^2 = r^2$, the whole plane is $0 \le r < \infty$, $0 \le \theta \le 2\pi$, and $dA = r\,dr\,d\theta$:
$$I^2 = \int_0^{2\pi}\!\!\int_0^{\infty} e^{-r^2}\,r\,dr\,d\theta.$$` },
      { label: 'The r does the work', text: t`With $u = r^2$, $du = 2r\,dr$: $\displaystyle\int_0^{\infty} e^{-r^2}\,r\,dr = \tfrac12\int_0^\infty e^{-u}\,du = \tfrac12$. Without the factor $r$ from $dA$ there would again be no antiderivative.` },
      { label: 'Finish', text: t`$I^2 = 2\pi\cdot\tfrac12 = \pi$, and since $I > 0$, $I = \sqrt{\pi} \approx 1.7725$.` },
      { label: 'Sense check', text: t`The bell is $1$ tall and roughly $1.8$ wide at half its height, so an area near $1.8$ is right; Simpson's rule on $[-5, 5]$ gives $1.77245$. Rescaling $x$ gives the normal distribution's constant: $\int e^{-x^2/2\sigma^2}\,dx = \sigma\sqrt{2\pi}$.` },
    ],
    answer: t`$\displaystyle\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi} \approx 1.7725$`,
  },
  practice: [
    (() => {
      const A = cell(0.8, 0.45, 0.6, 0.55);
      return mcq({
        id: 'cell-area', difficulty: 1,
        prompt: t`A polar cell runs from radius $r$ to $r + \Delta r$ and from angle $\theta$ to $\theta + \Delta\theta$ (in radians). For small $\Delta r$ and $\Delta\theta$, its area is approximately:`,
        choices: [t`$r\,\Delta r\,\Delta\theta$`, t`$\Delta r\,\Delta\theta$`, t`$r^2\,\Delta r\,\Delta\theta$`, t`$\tfrac12 r^2\,\Delta\theta$`],
        answer: 0,
        why: {
          1: t`That treats the cell as a rectangle $\Delta r$ by $\Delta\theta$. But $\Delta\theta$ is an angle, not a length: the arc it cuts at radius $r$ has length $r\,\Delta\theta$.`,
          2: t`One $r$ too many. An $r^2$ appears in spherical coordinates, or in $\tfrac12\int r^2\,d\theta$ after the inner $\int r\,dr$ has been done.`,
          3: t`That is the whole wedge from the origin out to radius $r$, not a cell of depth $\Delta r$.`,
        },
        hints: [t`Two sides of the cell lie along rays (length $\Delta r$); the other two are arcs of circles. How long is an arc of radius $r$ through angle $\Delta\theta$?`],
        teach: 'A polar cell is nearly a rectangle with sides Δr and r Δθ, so dA = r dr dθ.',
        explain: t`The cell's sides are $\Delta r$ and the arc $r\,\Delta\theta$, so its area is about $r\,\Delta r\,\Delta\theta$ — exactly so if $r$ is taken at the middle of the cell. The same $\Delta r$ and $\Delta\theta$ give a bigger cell farther out.`,
        visual: polar([-0.5, 2.3], [-0.25, 1.75], { rstep: 0.5, spokes: 15, fills: [A.fill], curves: [...A.edges, { polar: '0.3', theta: [0.6, 1.15], color: 'ink2', width: 1.4 }], segments: [...A.segs, ...[0.6, 1.15].map((a) => ({ from: [0, 0], to: [r6(0.8 * Math.cos(a)), r6(0.8 * Math.sin(a))], color: 'ink3', width: 1.2, dash: true }))], texts: [{ text: 'Δr', x: r6(1.025 * Math.cos(0.6) + 0.12 * Math.sin(0.6)), y: r6(1.025 * Math.sin(0.6) - 0.12 * Math.cos(0.6)), color: 'gold' }, { text: 'Δθ', x: r6(0.42 * Math.cos(0.875)), y: r6(0.42 * Math.sin(0.875)), color: 'ink2' }], rays: [] },
        'A polar cell on a grid of rings and spokes. Δθ is the angle the cell spans, seen from the origin.'),
      });
    })(),
    num({
      id: 'shaft', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 1.5, 2, 2.5, 3]);
        const J = (Math.PI * a ** 4) / 2;
        return {
          prompt: t`A solid circular drive shaft of radius $${a}$ cm resists twisting in proportion to its **polar moment of area**, $J = \displaystyle\iint_D (x^2 + y^2)\,dA$, taken over its circular cross-section $D$. Compute $J$.`,
          answer: J, units: 'cm^4', tol: { rel: 0.005 },
          vars: ['r'], integrand: `2*pi*r^3`, limits: [0, a],
          errors: [
            { value: (2 * Math.PI * a ** 3) / 3, feedback: t`You integrated $r^2\,dr\,d\theta$: the area element is $r\,dr\,d\theta$, so the integrand becomes $r^2\cdot r = r^3$.` },
            { value: (Math.PI * a ** 4) / 4, feedback: t`$\theta$ must run all the way round, from $0$ to $2\pi$.` },
          ],
          hints: [t`In polar coordinates $x^2 + y^2 = r^2$ and the disk is $0 \le r \le ${a}$, $0 \le \theta \le 2\pi$.`, t`$J = \displaystyle\int_0^{2\pi}\!\!\int_0^{${a}} r^2\cdot r\,dr\,d\theta$.`],
          teach: 'Over a disk, polar limits are constants and x² + y² becomes r² — but dA still brings its own r.',
          explain: t`$J = \displaystyle\int_0^{2\pi}\!\!\int_0^{${a}} r^3\,dr\,d\theta = 2\pi\cdot\frac{${a}^4}{4} = \frac{\pi\,(${a})^4}{2} \approx ${fmt(J, 4)}\ \text{cm}^4$ — the engineer's $J = \pi d^4/32$ for a shaft of diameter $d$. Material far from the axis counts with $r^2$: that is why hollow tubes make stiff, light shafts.`,
          visual: revolved(`u^2`, a, { zs: r6(1.1 / a), caption: t`The graph of $z = x^2 + y^2$ over the shaft's cross-section (heights scaled to fit): $J$ is the volume under it. Drag to rotate.` }),
        };
      },
    }),
    num({
      id: 'ring', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2]), b = a + r.pick([1, 2, 3]);
        const I = 2 * Math.PI * (b - a);
        return {
          prompt: t`Evaluate $\displaystyle\iint_D \frac{dA}{\sqrt{x^2 + y^2}}$ over the ring $D$: $${a} \le \sqrt{x^2 + y^2} \le ${b}$.`,
          answer: I, tol: { rel: 1e-3 },
          vars: ['r'], integrand: `2*pi*(1/r)*r`, limits: [a, b],
          errors: [{ value: 2 * Math.PI * Math.log(b / a), feedback: t`That integrates $\frac1r\,dr\,d\theta$. With $dA = r\,dr\,d\theta$ the factor $\frac1r$ cancels the $r$, leaving $dr\,d\theta$.` }],
          hints: [t`The ring is $${a} \le r \le ${b}$, $0 \le \theta \le 2\pi$, and $\sqrt{x^2 + y^2} = r$.`, t`$\dfrac{1}{r}\cdot r\,dr\,d\theta = dr\,d\theta$.`],
          teach: 'The r in dA can cancel a 1/r in the integrand: a singularity at the origin may be no trouble at all in polar form.',
          explain: t`$\displaystyle\int_0^{2\pi}\!\!\int_{${a}}^{${b}} \frac1r\cdot r\,dr\,d\theta = 2\pi(${b} - ${a}) = ${2 * (b - a)}\pi \approx ${fmt(I, 4)}$. Up to a constant this is the electric potential at the centre of a uniformly charged washer: every ring of radius $r$ contributes in proportion to its charge, $\propto r\,dr$, divided by its distance, $r$.`,
          visual: revolved('1/u', b, { r0: a, zs: r6(0.8 * a), caption: t`The graph of $z = 1/\sqrt{x^2 + y^2}$ over the ring (heights scaled to fit). Drag to rotate.` }),
        };
      },
    }),
    num({
      id: 'half-disk', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3, 4]);
        const I = (2 * a ** 3) / 3;
        return {
          prompt: t`$D$ is the half-disk $x^2 + y^2 \le ${a * a}$, $y \ge 0$. Evaluate $\displaystyle\iint_D y\,dA$.`,
          answer: I, tol: { rel: 1e-3 },
          vars: ['r'], integrand: `2*r^2`, limits: [0, a],
          errors: [
            { value: a * a, feedback: t`That integrates $y\,dr\,d\theta$: with $dA = r\,dr\,d\theta$ the integrand becomes $r\sin\theta\cdot r$.` },
            { value: 0, feedback: t`That is the whole disk, where the halves above and below the $x$-axis cancel. Here $\theta$ runs from $0$ to $\pi$ only.` },
          ],
          hints: [t`The half-disk is $0 \le r \le ${a}$, $0 \le \theta \le \pi$, and $y = r\sin\theta$.`, t`$\displaystyle\int_0^{\pi}\!\!\int_0^{${a}} r\sin\theta\cdot r\,dr\,d\theta = \left(\int_0^\pi \sin\theta\,d\theta\right)\left(\int_0^{${a}} r^2\,dr\right)$.`],
          teach: 'Write the integrand in polar form, then multiply by r: y dA becomes r sin θ · r dr dθ.',
          explain: t`$\displaystyle\int_0^\pi \sin\theta\,d\theta = 2$ and $\displaystyle\int_0^{${a}} r^2\,dr = \frac{${a}^3}{3}$, so the integral is $\frac{2\cdot${a}^3}{3} = ${nice(r6(I))}$. Divided by the area $\tfrac{\pi}{2}(${a})^2$, it gives the half-disk's centroid height, $\bar y = \frac{4\cdot${a}}{3\pi} \approx ${fmt((4 * a) / (3 * Math.PI), 3)}$ — lesson C3-4.7 makes this a habit.`,
          visual: polar([-a * 1.25, a * 1.25], [-0.25 * a, 1.2 * a], { rstep: a > 2 ? 1 : 0.5, spokes: 30, fills: [{ polar: `${a}`, theta: [0, 'pi'], color: 'accent', alpha: 0.25 }], curves: [{ polar: `${a}`, theta: [0, 'pi'], color: 'accent' }], segments: [{ from: [-a, 0], to: [a, 0], color: 'accent' }] }, t`The half-disk $D$ on a polar grid: $0 \le r \le ${a}$, $0 \le \theta \le \pi$.`),
        };
      },
    }),
    mcq({
      id: 'off-centre', difficulty: 3,
      prompt: t`In polar coordinates, which limits describe the disk $(x - 1)^2 + y^2 \le 1$, whose boundary is the circle $r = 2\cos\theta$?`,
      choices: [
        t`$-\tfrac{\pi}{2} \le \theta \le \tfrac{\pi}{2}$, $\ 0 \le r \le 2\cos\theta$`,
        t`$0 \le \theta \le 2\pi$, $\ 0 \le r \le 2\cos\theta$`,
        t`$0 \le \theta \le 2\pi$, $\ 0 \le r \le 1$`,
        t`$-\tfrac{\pi}{2} \le \theta \le \tfrac{\pi}{2}$, $\ 0 \le r \le 2$`,
      ],
      answer: 0,
      why: {
        1: t`For $\tfrac{\pi}{2} < \theta < \tfrac{3\pi}{2}$, $2\cos\theta < 0$: the "upper limit" falls below the lower one, and those angles do not meet the disk at all.`,
        2: t`That is the unit disk centred on the origin. This one is centred at $(1, 0)$.`,
        3: t`That is the right half of the disk of radius $2$. Each ray leaves this disk at the circle, $r = 2\cos\theta$, not at $r = 2$.`,
      },
      hints: [t`The disk touches the origin and lies in the right half-plane. Which directions $\theta$ point into it?`, t`Along the ray at angle $\theta$, you start at the origin and leave the disk where you hit the circle, $r = 2\cos\theta$.`],
      teach: 'For a region through the origin, θ runs over the directions that point into it, and r runs from 0 out to the boundary curve.',
      explain: t`Expanding $(x - 1)^2 + y^2 = 1$ gives $x^2 + y^2 = 2x$, that is $r^2 = 2r\cos\theta$, or $r = 2\cos\theta$. The disk lies in $x \ge 0$, so $\theta$ runs from $-\tfrac{\pi}{2}$ to $\tfrac{\pi}{2}$, and each ray runs from the origin out to the circle. (Check: $\int_{-\pi/2}^{\pi/2}\int_0^{2\cos\theta} r\,dr\,d\theta = \int 2\cos^2\theta\,d\theta = \pi$, the area of a unit disk.)`,
      visual: polar([-1.2, 2.6], [-1.35, 1.35], { rstep: 0.5, spokes: 30, fills: [{ polar: '2*cos(theta)', theta: [-1.5708, 1.5708], color: 'accent', alpha: 0.25 }], curves: [{ polar: '2*cos(theta)', theta: [-1.5708, 1.5708], color: 'accent', label: 'r = 2 cos θ', labelAt: 0.85, labelDx: 8 }] }, t`The disk $(x - 1)^2 + y^2 \le 1$, which touches the origin. Grid rings $0.5$ apart.`),
    }),
    num({
      id: 'gauss-scale', difficulty: 2,
      gen(r) {
        const s = r.pick([0.5, 2, 3, 4]);
        const I = s * Math.sqrt(2 * Math.PI);
        return {
          prompt: t`Using $\int_{-\infty}^{\infty} e^{-u^2}\,du = \sqrt{\pi}$, evaluate $\displaystyle\int_{-\infty}^{\infty} e^{-x^2/(2\sigma^2)}\,dx$ for $\sigma = ${s}$ — the normalising constant of a bell curve with standard deviation $\sigma$.`,
          answer: I, tol: { rel: 1e-3 },
          integrand: `exp(-x^2/${2 * s * s})`, limits: ['-inf', 'inf'],
          errors: [
            { value: Math.sqrt(Math.PI), feedback: t`The bell has been stretched: substitute $u = x/(\sigma\sqrt2)$, so $dx = \sigma\sqrt2\,du$.` },
            { value: s * Math.sqrt(Math.PI), feedback: t`Close — $u = x/(\sigma\sqrt2)$, so the stretch factor is $\sigma\sqrt2$, not $\sigma$.` },
          ],
          hints: [t`Substitute $u = \dfrac{x}{\sigma\sqrt2}$, so that $\dfrac{x^2}{2\sigma^2} = u^2$.`, t`Then $dx = \sigma\sqrt{2}\,du$, and the integral is $\sigma\sqrt2\cdot\sqrt\pi$.`],
          teach: 'Stretching a bell curve by a factor stretches its area by the same factor.',
          explain: t`With $u = x/(\sigma\sqrt2)$: $\displaystyle\int e^{-x^2/2\sigma^2}\,dx = \sigma\sqrt2\int e^{-u^2}\,du = \sigma\sqrt{2\pi} = ${s}\sqrt{2\pi} \approx ${fmt(I, 4)}$. Dividing by it is what makes the normal distribution's total probability $1$.`,
          visual: { type: 'graph', params: { x: [-4.2 * Math.max(1, s), 4.2 * Math.max(1, s)], y: [-0.1, 1.2], aspect: 'wide', curves: [{ fn: 'exp(-x^2)', color: 'ink3', width: 1.6, label: 'e⁻ˣ²', labelAt: 0.75, labelDx: 6 }, { fn: `exp(-x^2/${2 * s * s})`, color: 'accent', label: `σ = ${s}`, labelAt: r6(1.6 * s), labelDx: 6 }], shade: [{ fn: `exp(-x^2/${2 * s * s})`, from: -4.2 * Math.max(1, s), to: 4.2 * Math.max(1, s), color: 'accent', alpha: 0.2 }] }, caption: t`The bell $e^{-x^2/2\sigma^2}$ (shaded) against $e^{-x^2}$, whose area is $\sqrt\pi$.` },
        };
      },
    }),
    (() => {
      const cells = [0.3, 1.0, 1.7].map((r0) => cell(r0, 0.35, 0.45, 0.5));
      return mcq({
        id: 'forgot-r', difficulty: 2, kind: 'error',
        prompt: t`A student finds the area of a disk of radius 3 as
$$\int_0^{2\pi}\!\!\int_0^3 dr\,d\theta = 6\pi.$$
The area is $\pi\cdot 3^2 = 9\pi$. What went wrong?`,
        choices: [
          t`The area element is $r\,dr\,d\theta$, not $dr\,d\theta$: $\int_0^{2\pi}\int_0^3 r\,dr\,d\theta = 9\pi$`,
          t`$\theta$ should run from $0$ to $\pi$`,
          t`$r$ should run from $-3$ to $3$`,
          t`Nothing: polar and Cartesian areas are different quantities`,
        ],
        answer: 0,
        why: {
          1: t`That would give $3\pi$, half of their already-wrong answer. $\theta$ from $0$ to $2\pi$ is right for a full disk.`,
          2: t`With $r \ge 0$ and $\theta$ going all the way round, every point is covered once. Negative $r$ would count the disk twice.`,
          3: t`Area is area, in any coordinates. Getting the same number both ways is exactly what the factor $r$ guarantees.`,
        },
        hints: [t`Do cells with the same $dr$ and $d\theta$ have the same area near the centre and near the rim?`],
        teach: 'The most common slip in polar integrals is dropping the r from dA = r dr dθ.',
        explain: t`$\int_0^{2\pi}\int_0^3 dr\,d\theta$ gives every cell the same weight, but cells near the rim are bigger than cells near the centre. With $dA = r\,dr\,d\theta$: $\int_0^{2\pi}\int_0^3 r\,dr\,d\theta = 2\pi\cdot\tfrac92 = 9\pi$.`,
        visual: polar([-3.4, 3.4], [-3.4, 3.4], { aspect: '', rstep: 0.5, spokes: 30, fills: [{ polar: '3', theta: [0, 6.2832], color: 'accent', alpha: 0.12 }, ...cells.map((c) => c.fill)], curves: [{ polar: '3', theta: [0, 6.2832], color: 'accent' }, ...cells.flatMap((c) => c.edges)], segments: cells.flatMap((c) => c.segs) }, t`The disk of radius 3 and three cells with the same $\Delta r$ and $\Delta\theta$ at different distances from the centre.`),
      });
    })(),
  ],
  checkpoint: [
    num({
      id: 'cp-bell', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1, 1.5, 2]);
        const V = Math.PI * (1 - Math.exp(-a * a));
        return {
          prompt: t`Evaluate $\displaystyle\iint_D e^{-(x^2 + y^2)}\,dA$ over the disk $D$: $x^2 + y^2 \le ${nice(a * a)}$.`,
          answer: V, tol: { rel: 2e-3 },
          vars: ['r'], integrand: `2*pi*r*exp(-r^2)`, limits: [0, a],
          hints: [t`$\displaystyle\int_0^{2\pi}\!\!\int_0^{${a}} e^{-r^2}\,r\,dr\,d\theta$; substitute $u = r^2$.`],
          teach: 'Radial integrands over disks become one-variable integrals in r, with the r from dA making the substitution work.',
          explain: t`$2\pi\Big[-\tfrac12 e^{-r^2}\Big]_0^{${a}} = \pi\big(1 - e^{-${nice(a * a)}}\big) \approx ${fmt(V, 4)}$ — already ${Math.round((100 * V) / Math.PI)}% of the whole-plane value, $\pi$.`,
          visual: revolved('exp(-u^2)', a, { zs: 1.4, caption: t`The surface $z = e^{-(x^2 + y^2)}$ over the disk (heights $\times 1.4$). Drag to rotate.` }),
        };
      },
    }),
    num({
      id: 'cp-laser', difficulty: 3, transfer: true,
      gen(r) {
        const w = r.pick([2, 3, 4]), k = r.pick([0.5, 0.75, 1, 1.25]);
        const R = r6(k * w), frac = 1 - Math.exp((-2 * R * R) / (w * w));
        return {
          prompt: t`An optical inter-satellite link sends a laser beam whose intensity has the Gaussian profile $I(r) = I_0\,e^{-2r^2/w^2}$, where $r$ is the distance from the beam's axis and $w = ${w}$ mm is the beam radius. The receiver's circular aperture, of radius $${R}$ mm, is centred on the beam. What percentage of the beam's power, $P = \iint I\,dA$, passes through it?`,
          answer: 100 * frac, units: '%', tol: { rel: 0.005 },
          errors: [
            { value: 100 * (1 - Math.exp((-R * R) / (w * w))), feedback: t`Keep the factor 2 in the exponent: with $u = 2r^2/w^2$, the fraction is $1 - e^{-2R^2/w^2}$.` },
            { value: 100 * (R / w), feedback: 'That treats the power as proportional to the radius. The beam is two-dimensional: integrate I over the aperture’s area.' },
          ],
          hints: [
            t`Power through radius $R$: $\displaystyle\int_0^{2\pi}\!\!\int_0^{R} I_0 e^{-2r^2/w^2}\,r\,dr\,d\theta$. Total power: the same with $R \to \infty$.`,
            t`$\displaystyle\int_0^R e^{-2r^2/w^2}\,r\,dr = \frac{w^2}{4}\left(1 - e^{-2R^2/w^2}\right)$, and the total is $\frac{w^2}{4}$.`,
          ],
          teach: 'The power of a beam is its intensity integrated over area, and for a round beam the r in dA turns the Gaussian into an easy integral.',
          explain: t`The fraction is $\dfrac{\int_0^R e^{-2r^2/w^2}\,r\,dr}{\int_0^\infty e^{-2r^2/w^2}\,r\,dr} = 1 - e^{-2R^2/w^2} = 1 - e^{-${fmt((2 * R * R) / (w * w), 3)}} \approx ${fmt(100 * frac, 3)}\%$. At $R = w$ it is $1 - e^{-2} \approx 86.5\%$, which is why $w$ (the "$1/e^2$ radius") is the standard way to quote a laser beam's size.`,
          visual: { type: 'graph', params: { x: [-2.4 * w, 2.4 * w], y: [-0.1, 1.25], aspect: 'wide', xlabel: 'distance across the beam (mm)', ylabel: 'I / I₀', curves: [{ fn: `exp(-2*x^2/${w * w})`, color: 'warn' }], shade: [{ fn: `exp(-2*x^2/${w * w})`, from: -R, to: R, color: 'warn', alpha: 0.25 }], vlines: [{ x: -R, label: 'aperture edge' }, { x: R }] }, caption: t`A cut through the beam along a diameter. The aperture passes everything between the dashed lines — but the beam is two-dimensional, so the power is $\iint I\,dA$, not the shaded area.` },
        };
      },
    }),
    num({
      id: 'cp-galaxy', difficulty: 3, transfer: true,
      gen(r) {
        const [R, where] = r.pick([[2.6, 'within 2.6 kpc of the centre (one scale length)'], [5.2, 'within 5.2 kpc of the centre (two scale lengths)'], [8.2, 'within 8.2 kpc of the centre — about the Sun’s distance from the Galactic Centre']]);
        const h = 2.6, q = R / h, frac = 1 - (1 + q) * Math.exp(-q);
        return {
          prompt: t`Model the Milky Way's stellar disc as a thin **exponential disc**, with surface density $\Sigma(r) = \Sigma_0\,e^{-r/h}$ and scale length $h = 2.6$ kpc. What percentage of the disc's mass, $M = \iint \Sigma\,dA$, lies ${where}?`,
          answer: 100 * frac, units: '%', tol: { rel: 0.005 },
          errors: [{ value: 100 * (1 - Math.exp(-q)), feedback: t`That integrates $\Sigma\,dr$ without the factor $r$: a ring of radius $r$ has area $2\pi r\,dr$, and the outer rings are big.` }],
          hints: [
            t`$M(R) = \displaystyle\int_0^{2\pi}\!\!\int_0^R \Sigma_0 e^{-r/h}\,r\,dr\,d\theta$; the total mass takes $R \to \infty$.`,
            t`By parts, $\displaystyle\int_0^R r\,e^{-r/h}\,dr = h^2\left[1 - \left(1 + \tfrac{R}{h}\right)e^{-R/h}\right]$, and the total is $h^2$.`,
          ],
          teach: 'Mass in a disc is surface density times the ring area 2πr dr: even a density that peaks at the centre puts much of its mass far out.',
          explain: t`$\dfrac{M(R)}{M} = 1 - \left(1 + \tfrac{R}{h}\right)e^{-R/h}$ with $\tfrac{R}{h} = ${fmt(q, 3)}$: $1 - ${fmt(1 + q, 3)}\,e^{-${fmt(q, 3)}} \approx ${fmt(100 * frac, 3)}\%$. Without the factor $r$ you would put far too much mass near the centre: the density is greatest there, but the rings are small.`,
          visual: { type: 'graph', params: { x: [0, 16], y: [-0.05, 1.12], aspect: 'wide', xlabel: 'r (kpc)', ylabel: '', curves: [{ fn: `exp(-x/${h})`, color: 'accent', label: 'Σ(r)/Σ₀', labelAt: 1.2, labelDx: 8 }, { fn: `(x/${h})*exp(1 - x/${h})`, color: 'gold', label: 'mass per ring, 2πrΣ (scaled)', labelAt: 6.5, labelDx: 8, labelDy: -10 }] }, caption: t`Blue: the surface density, highest at the centre. Gold: the mass in each thin ring, $2\pi r\,\Sigma(r)\,dr$ (scaled to peak at 1), which peaks at $r = h$. An idealised disc: the real Galaxy also has a bulge, a bar and a dark-matter halo.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §5.3 Double integrals in polar coordinates', url: 'https://openstax.org/books/calculus-volume-3/pages/5-3-double-integrals-in-polar-coordinates' },
    { label: 'Bland-Hawthorn & Gerhard (2016), The Galaxy in Context, ARA&A 54, 529', url: 'https://arxiv.org/abs/1602.07702' },
  ],
});
