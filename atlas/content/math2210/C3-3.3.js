// Tangent planes and linear approximation: close up, a smooth surface is a
// plane; the linearization and the total differential, error propagation,
// and why "the partials exist" is not enough.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { surf, boxSurf, faceYaw, sterm, r6 } from './_partials.js';

const t = String.raw;

// a hill and a cone in one surface, picked by the choice `shape` (0 hill, 1 cone)
const HILL = '2.5*exp(-(x^2 + 1.5*y^2)/4)';
const CONE = '2.5 - 1.1*sqrt(x^2 + y^2)';

/** z = f(x, y) with the tangent plane at (a, b) and no readouts (they would give the slopes away). */
const thou = (x) => x.toLocaleString('en-US').replace(/,/g, '{,}');
const withPlane = (f, a, b, o = {}) => surf(f, { tangentAt: [a, b], gradient: false, readouts: [], planeSize: 0.7, yaw: faceYaw(f('x', 'y'), a, b), ...o });

export default lesson({
  id: 'math2210.C3-3.3',
  title: 'Tangent planes and linear approximation',
  minutes: 10, difficulty: 2,
  intro: t`Zoom in on a smooth surface and it flattens into a plane: the **tangent plane**. At the point $(a, b)$ it is

$$z = f(a, b) + f_x(a, b)\,(x - a) + f_y(a, b)\,(y - b)$$

Its right-hand side, the **linearization** $L(x, y)$, is the best linear stand-in for $f$ near the point. Written for small changes it becomes the **total differential** $df = f_x\,dx + f_y\,dy$ — the rule every experimentalist uses to carry measurement uncertainties through a formula, and every engineer uses to ask “what if this grows by 1 %?”.`,
  symbols: [
    { tex: 'z', text: 'the height of the tangent plane above the point $(x, y)$' },
    { tex: 'f(a, b)', text: 'the height of the surface at the point of tangency' },
    { tex: 'f_x(a, b),\\ f_y(a, b)', text: 'the partial derivatives there: the plane’s slopes in the $x$ and $y$ directions, each in units of $f$ per unit of its variable' },
    { tex: 'x - a,\\ y - b', text: 'how far you have stepped from the point in each direction' },
  ],
  why: t`“Smooth means flat close up” is also the mathematical heart of the equivalence principle: general relativity treats spacetime as smooth, so a small enough freely falling laboratory sees it as flat.`,
  visual: {
    type: 'surface3d',
    title: 'A plane that hugs the surface',
    lead: t`The gold plane is the tangent plane at the point you choose, and the readouts give its slopes $\partial f/\partial x$ and $\partial f/\partial y$. Zoom in toward the point — scroll or pinch — and watch the surface flatten onto the plane.`,
    tasks: [
      'Move the point anywhere on the hill: the plane always just touches the surface there, tilted to match it.',
      'Zoom in on the point: the gap between the surface and the plane shrinks faster than the patch does, until you cannot tell them apart.',
      t`Switch to the cone and put the point at its tip, $(0, 0)$. No plane fits: however far you zoom, the corner stays a corner. The partial derivatives there do not even exist.`,
    ],
    params: {
      z: `step(0.5 - shape)*(${HILL}) + step(shape - 0.5)*(${CONE})`, domain: [[-2, 2], [-2, 2]], n: 36, tangentAt: ['px', 'py'], gradient: false, planeSize: 0.75, pitch: 0.45, dist: 8.5,
      choices: [{ key: 'shape', label: 'Surface', options: [[0, 'Smooth hill'], [1, 'Cone']], value: 0 }],
      sliders: [
        { key: 'px', label: 'Point $x$', min: -1.6, max: 1.6, step: 0.1, value: 0.9, explain: t`The $x$-coordinate $a$ of the point of tangency.` },
        { key: 'py', label: 'Point $y$', min: -1.6, max: 1.6, step: 0.1, value: -0.8, explain: t`The $y$-coordinate $b$ of the point of tangency.` },
      ],
    },
    caption: t`The hill is $f = 2.5\,e^{-(x^2 + 1.5y^2)/4}$, the cone $f = 2.5 - 1.1\sqrt{x^2 + y^2}$. The slopes are computed numerically, so at the cone’s tip they come out as $0$ and the gold plane sits flat on the point — which shows exactly why it is not tangent. Drag to rotate.`,
  },
  example: {
    prompt: t`A drone’s horizontal distance from its launch point is $r = \sqrt{x^2 + y^2}$. GPS puts it at $(3.00, 4.00)$ km; a moment later it is at $(3.02, 3.97)$ km. Estimate its new distance with the linearization of $r$ at $(3, 4)$, and compare with the exact value.`,
    visual: boxSurf((X, Y) => `sqrt(${X}^2 + ${Y}^2)`, [2, 4], [3, 5], { zr: [3.5, 6.5], top: 3, labels: ['x', 'y', 'r'], tangentAt: [3, 4], caption: t`The graph of $r = \sqrt{x^2 + y^2}$ over $2 \le x \le 4$, $3 \le y \le 5$ (km; heights from 3.5 km), with its tangent plane at $(3, 4)$. Away from the origin the cone is nearly flat. Drag to rotate.` }),
    steps: [
      { label: 'The point', text: t`$r(3, 4) = \sqrt{9 + 16} = 5.00$ km.` },
      { label: 'The slopes', text: t`$r_x = \dfrac{x}{\sqrt{x^2 + y^2}} = \dfrac35 = 0.6$ and $r_y = \dfrac{y}{\sqrt{x^2 + y^2}} = \dfrac45 = 0.8$ — kilometres of distance per kilometre moved.` },
      { label: 'Linearize', text: t`$L(x, y) = 5 + 0.6\,(x - 3) + 0.8\,(y - 4)$.` },
      { label: 'Estimate', text: t`$L(3.02, 3.97) = 5 + 0.6(0.02) + 0.8(-0.03) = 5 + 0.012 - 0.024 = 4.988$ km.` },
      { label: 'Sense check', text: t`Exactly, $\sqrt{3.02^2 + 3.97^2} = \sqrt{24.8813} = 4.98812$ km: the estimate is off by about 0.1 m. The error of a linearization shrinks like the **square** of the step, so a step ten times smaller would be about a hundred times more accurate.` },
    ],
    answer: t`$L(3.02, 3.97) = 4.988$ km; the exact distance is $4.98812$ km.`,
  },
  practice: [
    mcq({
      id: 'read-plane', difficulty: 1,
      prompt: t`The tangent plane to $z = f(x, y)$ at $(1, 2)$ is $z = 5 + 3(x - 1) - 2(y - 2)$. What are $f(1, 2)$, $f_x(1, 2)$ and $f_y(1, 2)$?`,
      visual: withPlane((x, y) => `5 + 3*(${x} - 1) - 2*(${y} - 2) + 0.4*(${x} - 1)^2 - 0.3*(${y} - 2)^2`, 1, 2, { domain: [[-0.5, 2.5], [0.5, 3.5]], zscale: 0.4, target: [1, 2, 2], axes: false, dist: 7.5, caption: t`A surface with this tangent plane (gold) at $(1, 2)$. Drag to rotate.` }),
      choices: [
        t`$f(1, 2) = 5$, $f_x(1, 2) = 3$, $f_y(1, 2) = -2$`,
        t`$f(1, 2) = 5$, $f_x(1, 2) = -2$, $f_y(1, 2) = 3$`,
        t`$f(1, 2) = 6$, $f_x(1, 2) = 3$, $f_y(1, 2) = -2$`,
        t`$f(1, 2) = 5$, $f_x(1, 2) = 3$, $f_y(1, 2) = 2$`,
      ],
      answer: 0,
      why: {
        1: t`Each slope multiplies its own displacement: $3$ multiplies $(x - 1)$, so it is $f_x$.`,
        2: t`Expanded, the plane is $z = 6 + 3x - 2y$, and $6$ is its height at $(0, 0)$. At $(1, 2)$ both brackets vanish, leaving $z = 5$.`,
        3: t`The minus sign belongs to the slope: $-2(y - 2)$ means $f_y = -2$, so the surface falls as $y$ grows.`,
      },
      hints: ['At the point of tangency itself, both brackets are zero.', t`The number in front of $(x - a)$ is the $x$-slope.`],
      teach: 'In the point–slope form of a tangent plane, the constant is f(a, b) and each bracket’s coefficient is the partial derivative in that direction.',
      explain: t`At $(x, y) = (1, 2)$ both brackets vanish, so $f(1, 2) = 5$. The coefficient of $(x - 1)$ is the slope in $x$, $f_x = 3$; that of $(y - 2)$ is $f_y = -2$.`,
    }),
    expr({
      id: 'plane-eq', difficulty: 2,
      gen(r) {
        const A = r.pick([1, 2]), B = r.pick([-1, 1, 3]), C = r.pick([-1, 1]), a = r.pick([1, -1, 2]), b = r.pick([1, 2, -1]);
        const f0 = A * a * a + B * a * b + C * b * b, fx = 2 * A * a + B * b, fy = B * a + 2 * C * b;
        const ft = t`${A === 1 ? '' : A}x^2${sterm(B, 'xy')}${sterm(C, 'y^2')}`;
        const sub = (v, c) => (c < 0 ? `(${v} + ${-c})` : `(${v} - ${c})`);
        const zs = +(2.2 / Math.max(1, ...[[-2, -2], [2, 2], [-2, 2], [2, -2]].map(([x, y]) => Math.abs(A * x * x + B * x * y + C * y * y)))).toPrecision(2);
        return {
          prompt: t`Find the tangent plane to $z = ${ft}$ at the point where $x = ${a}$, $y = ${b}$. Give it as an equation in $x$, $y$ and $z$.`,
          visual: withPlane((x, y) => `${A}*${x}^2 + ${B}*${x}*${y} + ${C}*${y}^2`, a, b, { zscale: zs, dist: 9, caption: t`The surface (heights scaled by ${zs}) and its tangent plane at the point, in gold. Drag to rotate.` }),
          answer: `z = ${f0} + ${fx}*${sub('x', a)} + ${fy}*${sub('y', b)}`,
          answerTeX: t`z = ${f0}${sterm(fx, sub('x', a))}${sterm(fy, sub('y', b))}`,
          vars: { x: [-3, 3], y: [-3, 3], z: [-3, 3] }, mode: 'equation',
          errors: [
            ...(fx !== fy ? [{ answer: `z = ${f0} + ${fy}*${sub('x', a)} + ${fx}*${sub('y', b)}`, feedback: t`The slopes are swapped: $f_x$ multiplies $(x - a)$ and $f_y$ multiplies $(y - b)$.` }] : []),
            ...(f0 !== 0 ? [{ answer: `z = ${fx}*${sub('x', a)} + ${fy}*${sub('y', b)}`, feedback: t`The plane must pass through the point on the surface: add the height $f(${a}, ${b}) = ${f0}$.` }] : []),
          ],
          hints: [t`You need three numbers: $f(${a}, ${b})$, $f_x(${a}, ${b})$ and $f_y(${a}, ${b})$.`, t`$f_x = ${2 * A}x${sterm(B, 'y')}$ and $f_y = ${B === 1 ? '' : B === -1 ? '-' : B}x${sterm(2 * C, 'y')}$.`],
          teach: t`The tangent plane is $z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$, with every slope evaluated at the point.`,
          explain: t`$f(${a}, ${b}) = ${f0}$, $f_x(${a}, ${b}) = ${fx}$, $f_y(${a}, ${b}) = ${fy}$, so $z = ${f0}${sterm(fx, sub('x', a))}${sterm(fy, sub('y', b))}$. Any rearrangement of it, such as $${sterm(fx, 'x', true) || '0'}${sterm(fy, 'y', !fx)} - z = ${fx * a + fy * b - f0}$, is the same plane.`,
        };
      },
    }),
    num({
      id: 'tank', difficulty: 2,
      gen(r) {
        const R = r.pick([1.2, 1.5, 2.0]), H = r.pick([3, 4, 5]), dR = r.pick([0.01, 0.02]), dH = r.pick([-0.02, -0.03, 0.02]);
        const dV = 2 * Math.PI * R * H * dR + Math.PI * R * R * dH;
        return {
          prompt: t`A cylindrical tank has radius $r = ${R}$ m and height $h = ${H}$ m, so $V = \pi r^2 h$. A redesign makes the radius ${dR * 100} cm larger and the height ${Math.abs(dH) * 100} cm ${dH < 0 ? 'smaller' : 'larger'}. Use the total differential to estimate the change in volume.`,
          visual: boxSurf((X, Y) => `pi*${X}^2*${Y}`, [1, 2.5], [2, 6], { zr: [0, Math.PI * 6.25 * 6], labels: ['r', 'h', 'V'], tangentAt: [R, H], caption: t`The volume $V = \pi r^2 h$ over $1 \le r \le 2.5$ m and $2 \le h \le 6$ m, with the tangent plane at the current design. Drag to rotate.` }),
          answer: dV, units: 'm^3', tol: { rel: 0.01 },
          errors: [{ value: 2 * Math.PI * R * H * dR, feedback: t`That is only the radius term. The height changes too: add $\pi r^2\,dh$.` }, { value: Math.PI * R * R * dH, feedback: t`That is only the height term. The radius changes too: add $2\pi r h\,dr$.` }],
          hints: [t`$dV = \dfrac{\partial V}{\partial r}dr + \dfrac{\partial V}{\partial h}dh = 2\pi r h\,dr + \pi r^2\,dh$.`, t`Use metres throughout: $dr = ${dR}$ m and $dh = ${dH}$ m.`],
          teach: 'The total differential adds the change from each input, each weighted by its partial derivative.',
          explain: t`$dV = 2\pi(${R})(${H})(${dR}) + \pi(${R})^2(${dH}) = ${(2 * Math.PI * R * H * dR).toFixed(4)} ${dH < 0 ? '-' : '+'} ${Math.abs(Math.PI * R * R * dH).toFixed(4)} = ${dV.toFixed(3)}\ \text{m}^3$. The exact change, $\pi(r + dr)^2(h + dh) - \pi r^2 h$, differs only in the fourth significant figure.`,
        };
      },
    }),
    num({
      id: 'estimate', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [1, 2], [3, 1]]), dx = r.pick([0.1, -0.1, 0.05]), dy = r.pick([0.05, -0.05, 0.1]);
        // f = x^2 y + y^3
        const f = (x, y) => x * x * y + y ** 3;
        const fx = 2 * a * b, fy = a * a + 3 * b * b, L = f(a, b) + fx * dx + fy * dy;
        return {
          prompt: t`Use the linearization of $f(x, y) = x^2 y + y^3$ at $(${a}, ${b})$ to estimate $f(${nice(a + dx)}, ${nice(b + dy)})$.`,
          visual: withPlane((x, y) => `${x}^2*${y} + ${y}^3`, a, b, { domain: [[a - 1.2, a + 1.2], [b - 1.2, b + 1.2]], zscale: r6(2.2 / f(a + 1.2, b + 1.2)), target: [a, b, 1.2], axes: false, dist: 7.5, caption: t`The graph of $f$ near $(${a}, ${b})$, heights scaled, with its tangent plane in gold. Drag to rotate.` }),
          answer: L, tol: { rel: 2e-3 },
          errors: [{ value: f(a, b), feedback: t`That is $f(${a}, ${b})$ itself. Add the corrections $f_x\,\Delta x + f_y\,\Delta y$.` }, { value: f(a, b) + fy * dx + fx * dy, feedback: t`The slopes are swapped: $f_x$ multiplies the change in $x$.` }].filter((e) => Math.abs(e.value - L) > 0.01 * Math.abs(L)),
          hints: [t`$f(${a}, ${b}) = ${f(a, b)}$, $f_x = 2xy$, $f_y = x^2 + 3y^2$.`, t`$L = f(${a}, ${b}) + f_x(${a}, ${b})(${nice(dx)}) + f_y(${a}, ${b})(${nice(dy)})$.`],
          teach: 'Near the point, f is approximately its value there plus each slope times the step in that variable.',
          explain: t`$f_x(${a}, ${b}) = ${fx}$ and $f_y(${a}, ${b}) = ${fy}$, so $L = ${f(a, b)} + ${fx}(${nice(dx)}) + ${fy}(${nice(dy)}) = ${nice(L)}$. The exact value is $${nice(f(a + dx, b + dy))}$.`,
        };
      },
    }),
    num({
      id: 'pendulum', difficulty: 3,
      gen(r) {
        const [L, dL] = r.pick([[0.800, 0.002], [1.200, 0.003], [0.500, 0.001]]), dT = r.pick([0.004, 0.006]);
        const T = 2 * Math.PI * Math.sqrt(L / 9.80);
        const Tr = +T.toFixed(3);
        const rel = Math.hypot(dL / L, (2 * dT) / Tr) * 100;
        return {
          prompt: t`A pendulum of length $L = ${L.toFixed(3)} \pm ${dL}$ m has a measured period $T = ${Tr.toFixed(3)} \pm ${dT}$ s, and $g = 4\pi^2 L/T^2$. The two uncertainties are independent. What is the relative uncertainty in $g$, in percent?`,
          visual: boxSurf((X, Y) => `4*pi^2*${X}/${Y}^2`, [r6(L * 0.9), r6(L * 1.1)], [r6(Tr * 0.95), r6(Tr * 1.05)], { zr: [8, 12], labels: ['L', 'T', 'g'], tangentAt: [L, Tr], caption: t`$g = 4\pi^2 L/T^2$ near the measured point (heights from 8 m/s²), with its tangent plane: $g$ is steeper in $T$ than in $L$. Drag to rotate.` }),
          answer: rel, units: '%', tol: { rel: 0.03 },
          errors: [
            { value: (dL / L + (2 * dT) / Tr) * 100, feedback: 'That adds the two contributions directly — the worst case. Independent uncertainties combine in quadrature.' },
            { value: Math.hypot(dL / L, dT / Tr) * 100, feedback: t`$T$ is squared in the formula, so its relative uncertainty counts twice: $\dfrac{dg}{g} = \dfrac{dL}{L} - 2\dfrac{dT}{T}$.` },
          ],
          hints: [t`Take the differential of $\ln g = \ln(4\pi^2) + \ln L - 2\ln T$: $\dfrac{dg}{g} = \dfrac{dL}{L} - 2\,\dfrac{dT}{T}$.`, t`Independent: $\dfrac{\sigma_g}{g} = \sqrt{\left(\dfrac{\sigma_L}{L}\right)^2 + \left(2\,\dfrac{\sigma_T}{T}\right)^2}$.`],
          teach: 'For a product of powers, the differential turns each exponent into a weight on that input’s relative uncertainty.',
          explain: t`$\dfrac{\sigma_L}{L} = ${(dL / L * 100).toFixed(3)}\%$ and $2\dfrac{\sigma_T}{T} = ${((2 * dT) / Tr * 100).toFixed(3)}\%$, so $\dfrac{\sigma_g}{g} = \sqrt{${(dL / L * 100).toFixed(3)}^2 + ${((2 * dT) / Tr * 100).toFixed(3)}^2}\,\% = ${rel.toFixed(2)}\%$. The period, squared in the formula, matters more: timing many swings is the cheapest improvement.`,
        };
      },
    }),
    mcq({
      id: 'not-differentiable', difficulty: 3,
      prompt: t`Let $f(x, y) = \dfrac{xy}{x^2 + y^2}$ with $f(0, 0) = 0$. Along both axes $f = 0$, so $f_x(0, 0) = f_y(0, 0) = 0$. Is the plane $z = 0$ the tangent plane at the origin?`,
      visual: surf((x, y) => `${x}*${y}/(${x}^2 + ${y}^2)`, { n: 41, pitch: 0.8, dist: 8.5, caption: t`The graph of $xy/(x^2 + y^2)$: zero along both axes, $\pm\tfrac12$ along the diagonals. Drag to rotate.` }),
      choices: [
        t`No: $f$ is not even continuous at the origin, so it has no tangent plane — partials can exist without differentiability`,
        t`Yes: both partial derivatives exist and are $0$, which is what a tangent plane needs`,
        t`Yes, but only along the axes`,
        t`No: the partial derivatives at the origin are not really $0$`,
      ],
      answer: 0,
      why: {
        1: t`Partial derivatives only test the two axis directions. Along $y = x$ the surface sits at height $\tfrac12$ right up to the origin, far from the plane $z = 0$.`,
        2: t`A tangent plane must approximate $f$ in every direction near the point, not along two lines. This $f$ jumps to $\pm\tfrac12$ along the diagonals.`,
        3: t`They are $0$: $f(h, 0) = 0$ for every $h$, so the difference quotient along the $x$-axis is $0$.`,
      },
      hints: ['Partial derivatives look along the axes only. What does f do along y = x?', t`On $y = x$, $f = \tfrac12$ for every $x \ne 0$. Is $f$ continuous at the origin?`],
      teach: 'Differentiable means the tangent plane approximates f in every direction; existing partial derivatives check only two.',
      explain: t`$f = \tfrac12$ along $y = x$, so $f$ has no limit at the origin and cannot be differentiable there, although both partials exist. The useful test runs the other way: if $f_x$ and $f_y$ exist near the point **and are continuous**, then $f$ is differentiable and the tangent plane works.`,
    }),
    mcq({
      id: 'error-unevaluated', difficulty: 2, kind: 'error',
      prompt: t`For $f(x, y) = x^2 + xy$ at $(1, 2)$, a student writes the tangent plane as $z = 3 + (2x + y)(x - 1) + x(y - 2)$. What is wrong?`,
      visual: withPlane((x, y) => `${x}^2 + ${x}*${y}`, 1, 2, { domain: [[-0.5, 2.5], [0.5, 3.5]], zscale: 0.25, target: [1, 2, 1], axes: false, dist: 7.5, caption: t`The graph of $x^2 + xy$ near $(1, 2)$ (heights scaled by 0.25) with its true tangent plane in gold. Drag to rotate.` }),
      choices: [
        t`The slopes must be evaluated at the point: $f_x(1, 2) = 4$ and $f_y(1, 2) = 1$, giving $z = 3 + 4(x - 1) + (y - 2)$`,
        t`The constant should be $f(0, 0) = 0$, not $3$`,
        t`$f_x$ and $f_y$ are swapped`,
        'Nothing: this is the tangent plane, written without simplifying',
      ],
      answer: 0,
      why: {
        1: t`The plane must pass through the point on the surface, $(1, 2, f(1, 2)) = (1, 2, 3)$, so the constant is $f(1, 2) = 3$.`,
        2: t`$2x + y$ is $f_x$ and $x$ is $f_y$, each with its own bracket — the trouble is that they are still functions.`,
        3: t`Expanding gives terms like $2x^2$ and $xy$: that is a curved surface, not a plane.`,
      },
      hints: ['Is the student’s right-hand side linear in x and y?', t`The slopes in a tangent plane are numbers: $f_x(1, 2)$, not $f_x(x, y)$.`],
      teach: 'Every coefficient in a tangent plane is a number — a partial derivative evaluated at the point.',
      explain: t`With unevaluated slopes the result contains $x^2$ and $xy$ terms, so it is not a plane. Evaluated, $f_x(1, 2) = 2(1) + 2 = 4$ and $f_y(1, 2) = 1$, so the tangent plane is $z = 3 + 4(x - 1) + (y - 2)$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-estimate', difficulty: 2,
      gen(r) {
        const dx = r.pick([0.04, -0.03, 0.05]), dy = r.pick([-0.02, 0.03, -0.04]);
        // f = x e^{y} at (2, 0)
        const L = 2 + 1 * dx + 2 * dy, exact = (2 + dx) * Math.exp(dy);
        return {
          prompt: t`Use the linearization of $f(x, y) = x\,e^{y}$ at $(2, 0)$ to estimate $f(${nice(2 + dx)}, ${nice(dy)})$.`,
          visual: withPlane((x, y) => `${x}*e^(${y})`, 2, 0, { domain: [[0.8, 3.2], [-1.2, 1.2]], zscale: 0.3, target: [2, 0, 0.8], axes: false, dist: 7, caption: t`The graph of $x e^y$ near $(2, 0)$ (heights scaled by 0.3), with its tangent plane in gold. Drag to rotate.` }),
          answer: L, tol: { rel: 1e-3 },
          hints: [t`$f(2, 0) = 2$, $f_x = e^y$, $f_y = x e^y$.`],
          teach: t`The linearization is $L(x, y) = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$.`,
          explain: t`$f_x(2, 0) = 1$ and $f_y(2, 0) = 2$, so $L = 2 + 1(${nice(dx)}) + 2(${nice(dy)}) = ${nice(L)}$. The exact value is $${exact.toFixed(5)}$.`,
        };
      },
    }),
    num({
      id: 'cp-dry-mass', difficulty: 3, transfer: true,
      gen(r) {
        const [m0, mf] = r.pick([[20000, 5000], [30000, 6000], [12000, 4000]]), ve = r.pick([3400, 4400]), dm = r.pick([50, 100, 200]);
        const d = ve * (dm / m0 - dm / mf);
        return {
          prompt: t`An upper stage with exhaust speed $v_e = ${ve}$ m/s has $\Delta v = v_e \ln(m_0/m_f)$, with initial mass $m_0 = ${thou(m0)}$ kg and burnout mass $m_f = ${thou(mf)}$ kg. Late in the design, the structure gains ${dm} kg, which raises **both** $m_0$ and $m_f$ by ${dm} kg. Use the total differential to estimate the change in $\Delta v$, in m/s.`,
          visual: boxSurf((X, Y) => `${ve}*ln(${X}/${Y})`, [r6(m0 * 0.85), r6(m0 * 1.15)], [r6(mf * 0.85), r6(mf * 1.15)], { zr: [r6(ve * Math.log((0.85 * m0) / (1.15 * mf))), r6(ve * Math.log((1.15 * m0) / (0.85 * mf)))], labels: ['m₀', 'm (burnout)', 'Δv'], tangentAt: [m0, mf], caption: t`$\Delta v$ as a function of the initial and burnout masses within 15 % of this design (heights from the smallest $\Delta v$ shown), with the tangent plane at the design point. Drag to rotate.` }),
          answer: d, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: -ve * dm / mf, feedback: t`Raising the structure’s mass raises $m_0$ too, and that term, $+v_e\,dm/m_0$, gives a little back.` }, { value: ve * dm / m0, feedback: t`That is only the $m_0$ term. The bigger effect is the burnout mass: $-v_e\,dm/m_f$.` }],
          hints: [t`$\dfrac{\partial\,\Delta v}{\partial m_0} = \dfrac{v_e}{m_0}$ and $\dfrac{\partial\,\Delta v}{\partial m_f} = -\dfrac{v_e}{m_f}$.`, t`Both inputs change by $dm = ${dm}$ kg: $d(\Delta v) = v_e\left(\dfrac{dm}{m_0} - \dfrac{dm}{m_f}\right)$.`],
          teach: 'When one design change moves several inputs at once, the total differential adds each input’s partial derivative times its own change.',
          explain: t`$d(\Delta v) = ${ve}\left(\dfrac{${dm}}{${m0}} - \dfrac{${dm}}{${mf}}\right) = ${d.toFixed(1)}$ m/s. Dry mass costs far more than propellant mass, because it is carried all the way to burnout — which is why upper stages are built so light.`,
        };
      },
    }),
    mcq({
      id: 'cp-jupiter', difficulty: 2, transfer: true,
      prompt: t`Jupiter’s mass follows from its moon Callisto’s orbit by Kepler’s third law, $M = \dfrac{4\pi^2 a^3}{G\,T^2}$, with $a = 1.883\times10^{6}$ km and $T = 16.689$ days. If $a$ is uncertain by 0.5 % and $T$ by 0.01 %, about how uncertain is $M$?`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.3, 2.3], y: [-2.15, 2.15], equal: true, aspect: 'wide', xlabel: 'x (million km)', ylabel: 'y (million km)', axesAt: 'edge',
          curves: [[0.4217, 'Io'], [0.6711, 'Europa'], [1.0704, 'Ganymede'], [1.8827, 'Callisto']].map(([a, name], k) => ({ param: [`${a}*cos(t)`, `${a}*sin(t)`], t: [0, 6.2832], color: k === 3 ? 'gold' : 'ink3', width: k === 3 ? 2.4 : 1.2, label: name, labelAt: 0.6 + 0.25 * k, labelDx: 4, labelDy: -10 })),
          points: [{ x: 0, y: 0, color: 'warn', r: 4, label: 'Jupiter', labelDx: 8, labelDy: 12 }],
          arrows: [{ from: [0, 0], to: [-1.3313, -1.3313], color: 'gold', label: 'a', labelDx: -14, labelDy: 0 }],
        },
        caption: 'The orbits of Jupiter’s four large moons, to scale (all nearly circular). Callisto’s, the outermost, gives a and T.',
      },
      choices: ['About 1.5 %', 'About 0.5 %', 'About 0.17 %', 'About 1.0 %'],
      answer: 0,
      why: {
        1: t`Powers multiply relative uncertainties: $a$ is cubed, so its 0.5 % counts three times.`,
        2: t`Dividing by 3 is the rule for a cube root. Here $a$ is cubed, so its relative uncertainty is multiplied by 3.`,
        3: t`The factor 2 belongs to $T$, which is squared; $a$ is cubed.`,
      },
      hints: [t`$\dfrac{dM}{M} = 3\,\dfrac{da}{a} - 2\,\dfrac{dT}{T}$.`],
      teach: 'The relative uncertainty of a product of powers is dominated by the input with the largest exponent times relative uncertainty.',
      explain: t`$3 \times 0.5\% = 1.5\%$ from $a$, against $2 \times 0.01\% = 0.02\%$ from $T$: the result is about 1.5 % either way you combine them, and $M = 1.90\times10^{27}$ kg. Periods are easy to time precisely; distances are the hard part of astronomy.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 3, §4.4 Tangent planes and linear approximations', url: 'https://openstax.org/books/calculus-volume-3/pages/4-4-tangent-planes-and-linear-approximations' }],
});
