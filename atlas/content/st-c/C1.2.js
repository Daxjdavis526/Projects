// Arc length and reparameterization: length is independent of the
// parameterization; every regular curve has a unit-speed (arc-length)
// parameterization; proper time is the arc length of a worldline.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;

// the logarithmic spiral e^{ct}(cos t, sin t), t from 0 to 3π, and its length
const C = 0.15, Q = C / Math.sqrt(1 + C * C), S = (Math.sqrt(1 + C * C) / C) * (Math.exp(3 * Math.PI * C) - 1);
// the spiral's own angle t as a function of the shown parameter λ: rescaled t (m = 0) or arc length (m = 1)
const W = '((1 - m)*t*3*pi/S + m*ln(1 + q*t)/c)';

const plane = (curves, x, y, { points = [], caption, equal = true, xlabel, ylabel, extra = {} } = {}) => ({
  type: 'graph',
  params: { x, y, equal, aspect: 'wide', curves, points, ...(xlabel ? { xlabel, ylabel } : {}), ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C1.2',
  title: 'Arc length and reparameterization',
  minutes: 12, difficulty: 3,
  intro: t`The parameter of a curve is a label someone chose, and the same trace can be run through fast, slow, backwards or in jerks. Geometry must not care, so it looks for quantities that survive a **change of parameter** $t = \varphi(u)$ — a smooth bijection with $\varphi'(u) \ne 0$. The first is **arc length**, measured from a starting value $t_0$:

$$s(t) = \int_{t_0}^{t} |\alpha'(\tau)|\,d\tau$$

Because $ds/dt = |\alpha'(t)| > 0$ on a regular curve, $s$ can be inverted, and the curve can be re-labelled by its own length. In that **arc-length parameterization** the speed is exactly 1, and every geometric quantity from here on — curvature, torsion, the Frenet frame — is defined with it.`,
  symbols: [
    { tex: 's', text: t`arc length along the curve from the point $\alpha(t_0)$: a length, in metres if $\alpha$ is in metres` },
    { tex: t`|\alpha'(\tau)|`, text: t`the speed at parameter value $\tau$ (a dummy variable of integration)` },
    { tex: 't_0', text: 'the parameter value where the measurement starts; changing it only shifts s by a constant' },
    { tex: t`\varphi`, text: t`a change of parameter, $t = \varphi(u)$: smooth, with $\varphi' \ne 0$ and a smooth inverse` },
  ],
  why: t`Proper time is arc length. A clock carried along a worldline measures $\tau = \int\sqrt{1 - v^2}\,dt$ (with $c = 1$): the length of its path through spacetime with the Minkowski sign. Parameterizing a worldline by proper time is the spacetime version of unit speed, $u^\mu u_\mu = -1$.`,
  visual: {
    type: 'c3-curve',
    title: 'One spiral, two clocks',
    lead: t`A logarithmic spiral $e^{0.15t}(\cos t, \sin t)$, run through by a parameter $\lambda$ in two ways. With **rescaled $t$** the point starts slowly and races at the end; with **arc length** it moves at speed exactly 1, and $\lambda$ *is* the distance travelled. Both runs use the same interval of $\lambda$ — the curve’s full length.`,
    tasks: [
      t`With rescaled $t$, press Play: the speed readout climbs from about 0.45 to about 1.9 as the spiral widens.`,
      t`Switch to arc length: the speed reads 1 everywhere, and the arc-length readout always equals $\lambda$.`,
      t`At the end of the curve both readouts of $s$ agree, about 21.0: the length does not depend on how the curve was run through.`,
    ],
    params: {
      curve: { param: [`exp(c*${W})*cos(${W})`, `exp(c*${W})*sin(${W})`, '0'], t: [0, r6(S)] },
      constants: { c: C, q: r6(Q), S: r6(S) },
      choices: [{ key: 'm', label: 'Parameter $\\lambda$', options: [[0, 'rescaled $t$'], [1, 'arc length $s$']], value: 0, explain: 'Two labellings of the same points.' }],
      plane: 'xy', show: ['T'], pointLabel: t`\lambda`, readouts: ['t', 's', 'speed'], speed: 2.5, at: 4,
      x: [-4.7, 3.4], y: [-2.6, 3.8],
    },
    caption: t`The spiral for $0 \le t \le 3\pi$; the blue arrow is the unit tangent. Readouts are numerical (arc length by quadrature).`,
  },
  example: {
    prompt: t`A cable hangs between two pylons in the shape of a catenary, $y = a\cosh(x/a)$, with its lowest point at $x = 0$ and $a = 50$ m. Find the arc length $s$ from the lowest point as a function of $x$, then reparameterize the cable by $s$ and check the result has unit speed. How long is the cable from $x = 0$ to $x = 40$ m?`,
    visual: plane([{ fn: '50*cosh(x/50)', color: 'accent', width: 2.4, domain: [-40, 40] }], [-48, 48], [44, 72], {
      equal: false, xlabel: 'x (m)', ylabel: 'y (m)',
      points: [{ x: 0, y: 50, color: 'gold', label: 's = 0', labelDy: 16 }, { x: 40, y: r6(50 * Math.cosh(0.8)), color: 'gold', label: 'x = 40 m' }],
      caption: t`The catenary $y = 50\cosh(x/50)$ m between pylons 80 m apart. The vertical scale is stretched.`,
    }),
    steps: [
      { label: 'Parameterize', text: t`Use $x$ itself: $\alpha(x) = \big(x,\ a\cosh(x/a)\big)$, so $\alpha'(x) = \big(1,\ \sinh(x/a)\big)$.` },
      { label: 'Speed', text: t`$|\alpha'(x)| = \sqrt{1 + \sinh^2(x/a)} = \cosh(x/a)$ — never zero, so the curve is regular.` },
      { label: 'Integrate', text: t`$s(x) = \displaystyle\int_0^x \cosh(\xi/a)\,d\xi = a\sinh(x/a)$.` },
      { label: 'Invert', text: t`$x = a\,\operatorname{arsinh}(s/a)$, and $y = a\cosh(x/a) = a\sqrt{1 + \sinh^2(x/a)} = \sqrt{a^2 + s^2}$. So $\beta(s) = \big(a\,\operatorname{arsinh}(s/a),\ \sqrt{a^2 + s^2}\big)$.` },
      { label: 'Check unit speed', text: t`$\beta'(s) = \left(\dfrac{a}{\sqrt{a^2 + s^2}},\ \dfrac{s}{\sqrt{a^2 + s^2}}\right)$, and the sum of squares is $\dfrac{a^2 + s^2}{a^2 + s^2} = 1$ ✓.` },
      { label: 'The number', text: t`$s(40) = 50\sinh(0.8) = 44.4$ m. Sense check: longer than the 40 m straight run, but not by much for a shallow sag ✓.` },
    ],
    answer: t`$s = a\sinh(x/a)$, $\beta(s) = \big(a\,\operatorname{arsinh}(s/a),\ \sqrt{a^2 + s^2}\big)$, and the cable is $44.4$ m long from its lowest point to $x = 40$ m.`,
  },
  practice: [
    mcq({
      id: 'invariant', difficulty: 1,
      prompt: t`A curve $\alpha(t)$ is reparameterized as $\beta(u) = \alpha(\varphi(u))$ with $\varphi' > 0$. Which of these is guaranteed to be the same for $\beta$ as for $\alpha$?`,
      visual: plane([{ param: ['t', '0.5*t^2'], t: [0, 2.4], color: 'accent', width: 2.4 }], [-0.3, 2.7], [-0.4, 3.1], {
        points: [...[0, 0.4, 0.8, 1.2, 1.6, 2, 2.4].map((v) => ({ x: v, y: r6(0.5 * v * v), color: 'gold', r: 4 })), ...[0.4, 0.8, 1.2, 1.6, 2, 2.4].map((u) => ({ x: r6(u * u / 2.4), y: r6(0.5 * (u * u / 2.4) ** 2), color: 'violet', r: 3, hollow: true }))],
        caption: t`One trace, two parameterizations: gold dots at equal steps of $t$, violet rings at equal steps of $u$ with $t = u^2/2.4$. The marks fall in different places.`,
      }),
      choices: ['The length of the arc between two given points of the trace', 'The speed at a given point of the trace', 'The length of the parameter interval', 'The velocity vector at a given point of the trace'],
      answer: 0,
      why: {
        1: t`The speed picks up the factor $\varphi'$: $|\beta'(u)| = |\alpha'(\varphi(u))|\,\varphi'(u)$.`,
        2: t`The parameter interval can be anything: $[0, 1]$ or $[0, 10^6]$ can label the same arc.`,
        3: t`The velocity keeps its direction (since $\varphi' > 0$) but its length is rescaled by $\varphi'$.`,
      },
      hints: ['Which of these is a property of the set of points and their order, rather than of the labels?', 'Use the chain rule on β(u) = α(φ(u)).'],
      teach: 'Arc length is invariant under reparameterization; speed and velocity are not.',
      explain: t`The chain rule gives $|\beta'| = |\alpha'|\,\varphi'$, and the substitution $t = \varphi(u)$ turns $\int|\beta'|\,du$ into $\int|\alpha'|\,dt$. Only the length survives — which is why geometry is built on it.`,
    }),
    num({
      id: 'length-cosh', difficulty: 2,
      gen(r) {
        const [T, Tt] = r.pick([[1, '1'], [1.5, '1.5'], [2, '2'], [Math.log(3), t`\ln 3`]]);
        const L = Math.SQRT2 * Math.sinh(T);
        return {
          prompt: t`Find the length of $\alpha(t) = (\cosh t,\ \sinh t,\ t)$ for $0 \le t \le ${Tt}$, to 3 significant figures.`,
          visual: {
            type: 'calc-vectors3d',
            params: { range: 2.5, curves: [{ param: ['cosh(t)', 'sinh(t)', 't'], t: [0, r6(T)], color: 'accent', width: 2.4 }], points: [{ at: [1, 0, 0], color: 'gold', label: 't = 0' }, { at: [r6(Math.cosh(T)), r6(Math.sinh(T)), r6(T)], color: 'gold', label: `t = ${Tt}` }] },
            caption: t`The curve climbs along a hyperbola’s branch while rising steadily in $z$. Drag to turn it.`,
          },
          answer: L, tol: { rel: 0.005 },
          errors: [{ value: Math.sinh(T), feedback: t`You lost the $\sqrt2$: $|\alpha'|^2 = \sinh^2 t + \cosh^2 t + 1 = 2\cosh^2 t$.` }, { value: Math.sqrt(Math.cosh(T) ** 2 + Math.sinh(T) ** 2 + T * T) - 1, feedback: 'That compares the endpoints’ distances from the origin; the length of a curve is the integral of its speed.' }],
          hints: [t`$\alpha'(t) = (\sinh t,\ \cosh t,\ 1)$.`, t`$\sinh^2 t + \cosh^2 t + 1 = 2\cosh^2 t$, so $|\alpha'(t)| = \sqrt2\cosh t$.`],
          teach: t`Length is the integral of speed: $L = \int_a^b|\alpha'(t)|\,dt$.`,
          explain: t`$L = \int_0^{${Tt}}\sqrt2\cosh t\,dt = \sqrt2\sinh(${Tt}) = ${nice(L, 4)}$.`,
        };
      },
    }),
    expr({
      id: 's-of-t', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2]);
        const A = 4 * a * a, B = 9 * b * b, D = 27 * b * b, E = 8 * a ** 3;
        return {
          prompt: t`For $\alpha(t) = (${a === 1 ? '' : a}t^2,\ ${b === 1 ? '' : b}t^3)$, find the arc length $s(t)$ measured from $t = 0$, for $t \ge 0$.`,
          visual: plane([{ param: [`${a}*t^2`, `${b}*t^3`], t: [0, 1.6], color: 'accent', width: 2.4 }], [-0.5, a * 2.56 + 0.5], [-0.5, b * 4.1 + 0.3], { equal: false, points: [{ x: 0, y: 0, color: 'gold', label: 's = 0' }], caption: t`The branch $t \ge 0$ of the cusp, starting at the singular point. The axes have different scales.` }),
          answer: `((${A} + ${B}t^2)^(3/2) - ${E})/${D}`,
          answerTeX: t`\frac{(${A} + ${B}t^2)^{3/2} - ${E}}{${D}}`,
          vars: { t: [0.2, 2] }, integrand: `t*sqrt(${A} + ${B}*t^2)`,
          errors: [{ answer: `(${A} + ${B}t^2)^(3/2)/${D}`, feedback: t`At $t = 0$ that gives $${nice(E / D)}$, not 0: subtract the value of the antiderivative at the lower limit.` }],
          hints: [t`$|\alpha'(t)| = \sqrt{(${2 * a}t)^2 + (${3 * b}t^2)^2} = t\sqrt{${A} + ${B}t^2}$ for $t \ge 0$.`, t`Substitute $w = ${A} + ${B}t^2$, $dw = ${2 * B}t\,dt$.`],
          teach: 'Arc length from t₀ is the definite integral of the speed from t₀ to t, so it vanishes at t₀.',
          explain: t`$s(t) = \displaystyle\int_0^t \tau\sqrt{${A} + ${B}\tau^2}\,d\tau = \frac{1}{${2 * B}}\cdot\frac23\Big[(${A} + ${B}\tau^2)^{3/2}\Big]_0^t = \frac{(${A} + ${B}t^2)^{3/2} - ${E}}{${D}}$. Note that $s$ is still a fine function at the cusp $t = 0$ — but $ds/dt = 0$ there, so $t(s)$ is not differentiable at $s = 0$.`,
        };
      },
    }),
    expr({
      id: 't-of-s', difficulty: 3,
      gen(r) {
        const [c, ct, root, kt, kx, pre] = r.pick([[1, '', '2', t`\sqrt2`, 'sqrt(2)', ''], [2, '2', '5', t`\tfrac{\sqrt5}{2}`, '(sqrt(5)/2)', t`\tfrac12`], [0.5, '0.5', '1.25', t`\sqrt5`, 'sqrt(5)', '2']]);
        const k = Math.sqrt(1 + c * c) / c;
        const xs = [], ys = [];
        for (let j = 0; j <= 200; j++) { const u = -3 / c + ((4.6 / c) * j) / 200; xs.push(Math.exp(c * u) * Math.cos(u)); ys.push(Math.exp(c * u) * Math.sin(u)); }
        const win = (v) => [r6(Math.min(...v) - 0.4), r6(Math.max(...v) + 0.4)];
        return {
          prompt: t`The logarithmic spiral $\alpha(t) = e^{${ct}t}(\cos t,\ \sin t)$ has arc length $s = ${kt}\,(e^{${ct}t} - 1)$ from $t = 0$ (check it: $|\alpha'(t)| = \sqrt{${root}}\,e^{${ct}t}$). Invert it: give $t$ as a function of $s$.`,
          visual: plane([{ param: [`exp(${c}*t)*cos(t)`, `exp(${c}*t)*sin(t)`], t: [r6(-3 / c), r6(1.6 / c)], color: 'accent', width: 2.2 }], win(xs), win(ys), { points: [{ x: 1, y: 0, color: 'gold', label: 's = 0' }], caption: t`The spiral crosses every ray from the origin at the same angle. Inward, it winds infinitely often round the origin in a finite length.` }),
          answer: `ln(1 + s/${kx})/${c}`,
          answerTeX: t`${pre}\ln\!\left(1 + \frac{s}{${kt}}\right)`,
          vars: { s: [0.1, 5] },
          errors: [{ answer: `ln(s/${kx})/${c}`, feedback: t`That would put $s = 0$ at $t = -\infty$. Solve $e^{${ct}t} = 1 + s/(${kt})$ — keep the $+1$.` }],
          hints: [t`Solve $s = ${kt}\,(e^{${ct}t} - 1)$ for $e^{${ct}t}$ first.`, t`$e^{${ct}t} = 1 + \dfrac{s}{${kt}}$; now take logarithms.`],
          teach: t`Arc-length reparameterization is two steps: integrate the speed to get $s(t)$, then invert to get $t(s)$.`,
          explain: t`$t(s) = ${pre}\ln\!\big(1 + s/${kt}\big)$, so $\beta(s) = \alpha(t(s))$ has unit speed. As $s \to -${kt} \approx -${nice(k, 4)}$ we get $t \to -\infty$: the whole inward spiral, infinitely many turns, has finite length $${kt}$.`,
        };
      },
    }),
    order({
      id: 'invariance-proof', difficulty: 3,
      prompt: t`Prove that length does not depend on the parameterization. Let $\beta(u) = \alpha(\varphi(u))$ for $c \le u \le d$, with $\varphi' > 0$, $\varphi(c) = a$ and $\varphi(d) = b$. Order the steps.`,
      visual: plane([{ fn: '1 + x^3/8 + 0.5*x', color: 'accent', width: 2.4, domain: [0, 2.5] }], [-0.3, 2.8], [-0.2, 4.4], { equal: false, xlabel: 'u', ylabel: 't = φ(u)', points: [{ x: 0, y: 1, color: 'gold', label: '(c, a)' }, { x: 2.5, y: r6(1 + 2.5 ** 3 / 8 + 1.25), color: 'gold', label: '(d, b)', labelDx: -40 }], caption: t`A change of parameter $t = \varphi(u)$ with $\varphi' > 0$: increasing, so it keeps the direction of travel.` }),
      items: [
        t`$L(\beta) = \int_c^d |\beta'(u)|\,du$.`,
        t`Chain rule: $\beta'(u) = \alpha'(\varphi(u))\,\varphi'(u)$.`,
        t`Since $\varphi' > 0$: $|\beta'(u)| = |\alpha'(\varphi(u))|\,\varphi'(u)$.`,
        t`Substitute $t = \varphi(u)$, $dt = \varphi'(u)\,du$: the integral becomes $\int_a^b|\alpha'(t)|\,dt = L(\alpha)$.`,
      ],
      hints: ['Start from the definition of the length of β.', t`Where does the sign of $\varphi'$ matter? In taking the absolute value.`],
      teach: 'Length is invariant because the stretch factor φ′ from the chain rule is exactly the Jacobian of the substitution.',
      explain: t`The factor $\varphi'$ that rescales the speed is the same factor that rescales $du$ into $dt$. If $\varphi' < 0$ the absolute value gives $-\varphi'$ and the limits swap, so the length is still the same: orientation does not matter for length.`,
    }),
    num({
      id: 'chain-speed', difficulty: 2,
      gen(r) {
        const k = r.int(1, 4), u0 = r.pick([1, 2]), v0 = r.int(2, 6);
        const dphi = 3 * u0 * u0 + k, ans = v0 * dphi, t0 = u0 ** 3 + k * u0;
        return {
          prompt: t`A curve $\alpha(t)$ has speed $|\alpha'| = ${v0}$ at $t = ${t0}$. It is reparameterized as $\beta(u) = \alpha(u^3 + ${k}u)$. What is the speed of $\beta$ at $u = ${u0}$?`,
          visual: plane([{ fn: `x^3 + ${k}*x`, color: 'accent', width: 2.4, domain: [0, 2.4] }], [-0.2, 2.6], [-1, 2.4 ** 3 + k * 2.4 + 1], { equal: false, xlabel: 'u', ylabel: 't', points: [{ x: u0, y: t0, color: 'gold', label: `u = ${u0}` }], caption: t`The change of parameter $t = u^3 + ${k}u$: its slope at a point is how many units of $t$ one unit of $u$ is worth there.` }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: v0, feedback: 'Speed is not invariant: the chain rule multiplies it by dt/du.' }, { value: v0 / dphi, feedback: t`You divided by $\varphi'(u)$; the chain rule multiplies: $\beta'(u) = \alpha'(\varphi(u))\,\varphi'(u)$.` }],
          hints: [t`$|\beta'(u)| = |\alpha'(\varphi(u))|\cdot|\varphi'(u)|$ with $\varphi(u) = u^3 + ${k}u$.`, t`$\varphi(${u0}) = ${t0}$ and $\varphi'(${u0}) = 3(${u0})^2 + ${k} = ${dphi}$.`],
          teach: 'Under a change of parameter the speed is multiplied by |dt/du|.',
          explain: t`$|\beta'(${u0})| = ${v0} \times ${dphi} = ${ans}$. The point moves along the same trace; it just covers more of it per unit of $u$.`,
        };
      },
    }),
    mcq({
      id: 'why-regular', difficulty: 3,
      prompt: 'Why must a curve be regular before it can be reparameterized by arc length?',
      visual: plane([{ fn: 'x^3', color: 'accent', width: 2.4, domain: [-1.3, 1.3] }], [-1.5, 1.5], [-2.2, 2.2], { equal: false, xlabel: 't', ylabel: 's', points: [{ x: 0, y: 0, color: 'bad', label: 'ds/dt = 0' }], caption: t`An arc-length function $s(t) = t^3$ from a curve whose speed $3t^2$ vanishes at $t = 0$. Its inverse $t = s^{1/3}$ has a vertical tangent at $s = 0$.` }),
      choices: [
        t`$s'(t) = |\alpha'(t)| > 0$ makes $s$ strictly increasing with a differentiable inverse; where the speed vanishes, $t(s)$ fails to be differentiable`,
        'The arc-length integral diverges at a point where the velocity is zero',
        'A singular curve is not continuous, so its length is not defined',
        'Only curves of constant speed have an arc length',
      ],
      answer: 0,
      why: {
        1: 'The integrand |α′| is zero there, which is perfectly integrable; the length is finite.',
        2: 'Singular curves are smooth maps — continuous and differentiable. The trouble is the inverse of s(t).',
        3: 'Every piecewise-smooth curve has a length; constant speed is what the arc-length parameterization produces.',
      },
      hints: [t`What is $ds/dt$?`, 'By the inverse function theorem, t(s) is differentiable where ds/dt ≠ 0.'],
      teach: 'Regularity is exactly the condition that lets s(t) be inverted smoothly.',
      explain: t`The inverse function theorem gives $dt/ds = 1/|\alpha'(t)|$, which blows up where the speed vanishes. So $\beta(s) = \alpha(t(s))$ need not be differentiable there — the cusp of $(t^2, t^3)$ has no unit-speed parameterization through it.`,
    }),
    num({
      id: 'cycloid-arch', difficulty: 2,
      gen(r) {
        const R = r.pick([0.25, 0.3, 0.35, 0.5, 0.4]);
        return {
          prompt: t`A wheel of radius $${R}\ \text{m}$ rolls one full turn. How far does a point on its rim travel along its cycloid, $\alpha(t) = R(t - \sin t,\ 1 - \cos t)$, $0 \le t \le 2\pi$?`,
          visual: plane([{ param: ['t - sin(t)', '1 - cos(t)'], t: [0, '2*pi'], color: 'accent', width: 2.4 }, { param: ['pi + cos(t)', '1 + sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.2, dash: true }], [-0.5, 6.8], [-0.4, 2.5], { caption: t`One arch of the cycloid, in units of the wheel’s radius; the wheel is drawn half-way through its turn.` }),
          answer: 8 * R, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI * R, feedback: t`$2\pi R$ is how far the hub travels in one turn. The rim point also swings up and over: integrate its speed $2R|\sin\tfrac t2|$.` }, { value: 4 * R, feedback: t`Check the integral: $\int_0^{2\pi} 2R\sin\tfrac t2\,dt = 2R\big[-2\cos\tfrac t2\big]_0^{2\pi} = 8R$.` }],
          hints: [t`From the worked-example lesson before: $|\alpha'(t)| = 2R|\sin\tfrac t2|$.`, t`On $[0, 2\pi]$, $\sin\tfrac t2 \ge 0$; $\int_0^{2\pi} \sin\tfrac t2\,dt = 4$.`],
          teach: 'The length of a cycloid arch is 8R — more than the 2πR the hub travels, since the rim point also rises and falls.',
          explain: t`$L = \int_0^{2\pi} 2R\sin\tfrac t2\,dt = 8R = ${nice(8 * R, 3)}$ m, against $2\pi R = ${nice(2 * Math.PI * R, 3)}$ m for the hub. Wren found this in 1658.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-proper-time', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([1, 2, 5, 10]), g = 1.0327;
        const tau = Math.asinh(g * T) / g;
        const X = Math.sqrt(1 / (g * g) + T * T) - 1 / g;
        return {
          prompt: t`A rocket accelerates at a constant 1 g as felt on board. With $c = 1$, in years and light-years, its worldline is $x(t) = \sqrt{1/g^2 + t^2} - 1/g$ with $g = 1.0327\ \text{yr}^{-1}$. Proper time is the arc length of a worldline measured with the Minkowski sign, $d\tau = \sqrt{dt^2 - dx^2} = \sqrt{1 - \dot x^2}\,dt$. How much does the crew’s clock read after $t = ${T}$ yr of Earth time?`,
          visual: plane([{ param: [`sqrt(${r6(1 / (g * g))} + t^2) - ${r6(1 / g)}`, 't'], t: [0, T], color: 'accent', width: 2.6 }, { fn: 'x', color: 'warn', dash: [5, 5], width: 1, domain: [0, T * 1.05] }], [r6(-0.1 * T), r6(1.1 * T)], [0, r6(1.1 * T)], {
            xlabel: 'x (light-years)', ylabel: 't (years)',
            points: [{ x: r6(X), y: T, color: 'gold', label: `t = ${T} yr` }],
            caption: t`The rocket’s worldline (blue) and a light ray from the launch (dashed): the worldline bends toward it but never reaches it.`,
          }),
          answer: tau, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(T * T + X * X), feedback: t`That is the Euclidean length $\int\sqrt{dt^2 + dx^2}$. Spacetime’s arc length carries a minus sign: $d\tau^2 = dt^2 - dx^2$.` }, { value: T, feedback: 'That is the Earth clock. The moving clock’s proper time is shorter.' }],
          hints: [t`$\dot x = \dfrac{t}{\sqrt{1/g^2 + t^2}}$, so $1 - \dot x^2 = \dfrac{1/g^2}{1/g^2 + t^2}$.`, t`$\tau = \displaystyle\int_0^{${T}}\frac{dt}{\sqrt{1 + g^2t^2}} = \frac1g\operatorname{arsinh}(g\cdot${T})$.`],
          teach: 'Proper time is the arc length of a worldline, with the Minkowski minus sign under the square root.',
          explain: t`$\tau = \dfrac{\operatorname{arsinh}(${nice(g * T, 5)})}{1.0327} = ${nice(tau, 3)}$ yr, while $${T}\ \text{yr}$ pass on Earth and the rocket gets $${nice(X, 3)}$ light-years out. Every arc-length formula of this lesson goes through for spacetime once the sign is flipped.`,
        };
      },
    }),
    expr({
      id: 'cp-astroid', difficulty: 3,
      prompt: t`For the astroid $\alpha(t) = (\cos^3 t,\ \sin^3 t)$, find the arc length $s(t)$ from $t = 0$, for $0 \le t \le \pi/2$.`,
      visual: plane([{ param: ['cos(t)^3', 'sin(t)^3'], t: [0, '2*pi'], color: 'accent', width: 2.4 }], [-1.3, 1.3], [-1.15, 1.15], { points: [{ x: 1, y: 0, color: 'gold', label: 't = 0' }, { x: 0, y: 1, color: 'gold', label: 't = π/2' }], caption: 'The astroid: four arcs meeting in four cusps, where the parameterization is singular.' }),
      answer: '1.5 sin^2 t', answerTeX: t`\tfrac32\sin^2 t`,
      vars: { t: [0.05, 1.5] }, integrand: '3*sin(t)*cos(t)',
      errors: [{ answer: '3 sin^2 t', feedback: t`$\int 3\sin t\cos t\,dt = \tfrac32\sin^2 t$; check by differentiating.` }],
      hints: [t`$\alpha'(t) = (-3\cos^2t\sin t,\ 3\sin^2t\cos t)$, so $|\alpha'| = 3|\sin t\cos t|$.`, t`On $[0, \pi/2]$ both factors are non-negative.`],
      teach: 'Integrate the speed; between cusps the absolute value can be dropped.',
      explain: t`$s(t) = \int_0^t 3\sin\tau\cos\tau\,d\tau = \tfrac32\sin^2 t$. Each quarter has length $\tfrac32$, so the whole astroid has length 6. At the cusps $t = 0, \pi/2$ the speed vanishes — the arc-length parameterization exists on each open arc, not through a cusp.`,
    }),
    mcq({
      id: 'cp-unit', difficulty: 2,
      prompt: t`A curve $\beta(u)$ satisfies $|\beta'(u)| = 1$ for every $u$. What can you conclude about $u$?`,
      visual: plane([{ param: ['cos(t)', 'sin(t)'], t: [0, '2*pi'], color: 'accent', width: 2.2 }], [-1.7, 1.7], [-1.3, 1.3], { points: [0, 1, 2, 3, 4, 5, 6].map((u) => ({ x: r6(Math.cos(u)), y: r6(Math.sin(u)), color: 'gold', r: 4, label: `${u}` })), caption: t`The unit circle at unit speed: the marks $u = 0, 1, \dots, 6$ are one unit of length apart along the arc.` }),
      choices: [
        t`$u$ is arc length up to a choice of starting point and direction: $u = \pm s + \text{const}$`,
        t`$u$ is the angle the tangent has turned through`,
        t`$\beta$ is a straight line traversed at unit speed`,
        t`$u$ is the time a physical particle would take, so nothing geometric follows`,
      ],
      answer: 0,
      why: {
        1: 'That is true for a unit circle only; in general the turning angle grows at the rate κ, not 1.',
        2: 'Unit speed says nothing about direction: the velocity can turn, as on the circle.',
        3: t`Any label can be read as a time, but here $ds/du = |\beta'(u)| = 1$ fixes it as length.`,
      },
      hints: [t`Compute $ds/du$ for the arc length $s$ measured from some $u_0$.`],
      teach: 'Unit speed is the same thing as an arc-length parameter (up to sign and shift).',
      explain: t`$s(u) = \int_{u_0}^u |\beta'| = u - u_0$. So a unit-speed curve is already parameterized by arc length, measured from $u_0$; reversing direction gives $-s$.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §1-3', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §1.2–1.3', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 1 (proper time)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
