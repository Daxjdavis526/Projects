// Linear approximation and differentials — replace a curve by its tangent
// line near a point, and know how large the error is.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { N, curveFig } from './_c1kit.js';

const t = String.raw;

// gravity against altitude (km), its tangent at x0, and its second derivative
const G = '9.81*(6371/(6371 + x))^2';
const Gat = (v) => `9.81*(6371/(6371 + ${v}))^2`;
const Lat = (v) => `(9.81*(6371/(6371 + x0))^2 - 2*9.81*6371^2/(6371 + x0)^3*(${v} - x0))`;
const F2 = '(6*9.81*6371^2/(6371 + x0)^4)';
const PROBE = '(x0 + d)';
const g = (h) => 9.81 * (6371 / (6371 + h)) ** 2;

export default lesson({
  id: 'math1210.C1-4.2',
  title: 'Linear approximation and differentials',
  minutes: 10, difficulty: 2,
  intro: t`Zoom in on a smooth curve and it straightens out. Near a point $a$, a function is almost its tangent line — the **linearization**

$$f(x) \approx L(x) = f(a) + f'(a)\,(x - a)$$

The same statement in the language of **differentials**: a small change $dx$ in the input produces a change $dy = f'(x)\,dx$ in the output. The price is an error that grows like the **square** of the step: about $\tfrac12 f''(a)(x - a)^2$. Halve the step and the error drops fourfold. This is the physicist’s everyday tool — every “for small $x$” in a textbook is a linearization, and every uncertainty in a lab report is propagated with differentials.`,
  symbols: [
    { tex: 'a', text: 'the point you linearize about, where $f(a)$ and $f\'(a)$ are known' },
    { tex: 'L(x)', text: 'the linearization: the tangent line at $a$, used in place of $f$' },
    { tex: "f'(a)", text: 'the slope at $a$: how much $f$ changes per unit of $x$' },
    { tex: 'dx,\\ dy', text: 'differentials: a small change in the input, and the change $f\'(x)\\,dx$ the tangent line predicts in the output' },
    { tex: "\\tfrac12 f''(a)(x-a)^2", text: 'the leading error of the linearization: set by the curve’s bending, $f\'\'$, and the square of the step' },
  ],
  why: t`Small-angle formulas, uncertainty propagation in the lab, the weak-field limit of general relativity and the whole of linear-response physics are linearizations — and the error term says when to trust them.`,
  visual: {
    type: 'graph',
    title: 'Gravity, linearized',
    lead: t`The blue curve is the gravitational acceleration $g(h) = g_0\left(\frac{R}{R + h}\right)^2$ against altitude. The gold line is its linearization at the point you drag. The slider moves a probe a distance $d$ away from that point: the shaded sliver is the error, and the dashed curve adds the error estimate $\tfrac12 g''\,d^2$ to the line.`,
    tasks: [
      t`With the tangent at the ground, set $d = 420$ km (the space station’s altitude): the line is off by about $0.12\ \text{m/s}^2$, and the estimate is close to that.`,
      t`Double $d$: the error roughly quadruples. Halve it: the error drops to about a quarter.`,
      t`Push $d$ toward $2000$ km: the line is badly wrong, and even the error estimate has drifted off — it is trustworthy only while $d$ is small compared with $R = 6371$ km.`,
    ],
    params: {
      x: [-150, 4200], y: [0, 10.8], aspect: 'wide', xlabel: 'h (km)', ylabel: 'g (m/s²)',
      sliders: [{ key: 'd', label: t`Probe distance $d$`, min: 0, max: 3500, step: 10, value: 200, unit: t`\text{km}`, explain: t`How far from the tangent point the linearization is being tested.` }],
      curves: [
        { fn: G, color: 'accent', domain: [0, 4200] },
        { fn: `${Lat('x')} + 0.5*${F2}*(x - x0)^2`, color: 'violet', dash: true, width: 1.4, domain: ['x0', 'x0 + 3500'] },
      ],
      tangent: { fn: G, at: 0 },
      shade: [{ fn: G, lower: Lat('x'), from: 'x0', to: PROBE, color: 'bad', alpha: 0.3 }],
      vlines: [{ x: PROBE, color: 'ink3' }],
      readouts: [
        { label: t`true $g$`, expr: Gat(PROBE), unit: t`\text{m/s}^2`, digits: 4 },
        { label: t`linear $L$`, expr: Lat(PROBE), unit: t`\text{m/s}^2`, digits: 4 },
        { label: 'error', expr: `${Gat(PROBE)} - ${Lat(PROBE)}`, unit: t`\text{m/s}^2`, digits: 3 },
        { label: t`estimate $\tfrac12 g''d^2$`, expr: `0.5*${F2}*d^2`, unit: t`\text{m/s}^2`, digits: 3 },
      ],
    },
    caption: t`$g_0 = 9.81\ \text{m/s}^2$, $R = 6371$ km: a spherical, non-rotating Earth. The error estimate is the first term the line leaves out; it slightly overestimates here, because the next term has the opposite sign.`,
  },
  example: {
    prompt: t`The International Space Station orbits about $420$ km up. Estimate the gravitational acceleration there with the linearization of $g(h) = g_0\left(\dfrac{R}{R+h}\right)^2$ at $h = 0$, estimate the error, and compare with the exact value. Use $g_0 = 9.81\ \text{m/s}^2$ and $R = 6371$ km.`,
    visual: curveFig({ fn: G, x: [-60, 1100], y: [6.8, 10.3], xlabel: 'h (km)', ylabel: 'g (m/s²)', at: 0, f: g, df: (h) => -2 * 9.81 / 6371 * (6371 / (6371 + h)) ** 3, span: 1050, points: [{ x: 420, y: g(420), color: 'accent', label: 'ISS: 8.63', labelDx: 4, labelDy: -6 }], caption: t`Near the ground the curve and its tangent agree; by $420$ km they have parted by about $0.12\ \text{m/s}^2$.` }),
    steps: [
      { label: 'Value and slope at a', text: t`$g(0) = g_0 = 9.81\ \text{m/s}^2$. $g'(h) = -\dfrac{2g_0R^2}{(R+h)^3}$, so $g'(0) = -\dfrac{2g_0}{R} = -0.00308\ \text{m/s}^2$ per km.` },
      { label: 'Linearize', text: t`$L(h) = g_0\left(1 - \dfrac{2h}{R}\right)$ — the standard “gravity falls by $2h/R$” rule. At $420$ km: $9.81\times\left(1 - \dfrac{840}{6371}\right) = 8.52\ \text{m/s}^2$.` },
      { label: 'Estimate the error', text: t`$g''(h) = \dfrac{6g_0R^2}{(R+h)^4}$, so $\tfrac12 g''(0)h^2 = 3g_0\left(\dfrac{h}{R}\right)^2 = 3(9.81)(0.0659)^2 = 0.13\ \text{m/s}^2$. Since $g'' > 0$ the curve bends up away from the line, so the true value is **above** $8.52$.` },
      { label: 'Compare', text: t`Exactly, $g(420) = 9.81\left(\dfrac{6371}{6791}\right)^2 = 8.63\ \text{m/s}^2$. The linear estimate is low by $0.12\ \text{m/s}^2$ (1.4%), as the error estimate predicted.` },
      { label: 'Read the physics', text: t`At the station’s altitude gravity is still $88\%$ of its surface value. Astronauts float because the station is falling around the Earth with them, not because gravity has gone.` },
    ],
    answer: t`$L(420\text{ km}) = 8.52\ \text{m/s}^2$; error estimate $+0.13$; exact $8.63\ \text{m/s}^2$.`,
  },
  practice: [
    num({
      id: 'sqrt-estimate', difficulty: 1,
      gen(r) {
        const n = r.pick([5, 6, 7, 8, 9, 10]), d = r.pick([-0.5, -0.3, 0.2, 0.3, 0.5]);
        const a = n * n, x = a + d, L = n + d / (2 * n);
        return {
          prompt: t`Use the linearization of $\sqrt{x}$ at $a = ${a}$ to estimate $\sqrt{${nice(x)}}$.`,
          answer: L, tol: { rel: 2e-5 },
          errors: [{ value: n + d / n, feedback: t`The slope of $\sqrt x$ is $\dfrac{1}{2\sqrt x}$, so at $${a}$ it is $\dfrac{1}{${2 * n}}$, not $\dfrac{1}{${n}}$.` }],
          hints: [t`$L(x) = \sqrt{${a}} + \dfrac{1}{2\sqrt{${a}}}(x - ${a})$.`],
          teach: t`Linearize where the function and its slope are easy: at a perfect square for $\sqrt x$.`,
          explain: t`$L(${nice(x)}) = ${n} + \dfrac{${nice(d)}}{${2 * n}} = ${nice(L, 6)}$. A calculator gives $${nice(Math.sqrt(x), 6)}$.`,
          visual: curveFig({ fn: 'sqrt(x)', x: [a - 12, a + 12], y: [n - 1.2, n + 1.1], domain: [Math.max(0, a - 12), a + 12], at: a, f: Math.sqrt, df: (v) => 0.5 / Math.sqrt(v), span: 10, caption: t`$y = \sqrt x$ near $${a}$ and its tangent line. At this zoom they are hard to tell apart.` }),
        };
      },
    }),
    num({
      id: 'sqrt-error', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]), d = r.pick([0.5, 1, 2]);
        const a = n * n, est = d * d / (8 * n ** 3);
        return {
          prompt: t`The linearization of $\sqrt x$ at $a = ${a}$ estimates $\sqrt{${nice(a + d)}} \approx ${nice(n + d / (2 * n), 6)}$. Use $\tfrac12\lvert f''(a)\rvert(x - a)^2$ to estimate by how much this **overestimates** the true value.`,
          answer: est, tol: { rel: 0.01 },
          errors: [{ value: d * d / (4 * n ** 3), feedback: t`Keep the $\tfrac12$: the error estimate is $\tfrac12\lvert f''(a)\rvert(x-a)^2$, and $\lvert f''(${a})\rvert = \dfrac{1}{4\cdot ${a}^{3/2}}$.` }],
          hints: [t`$f''(x) = -\dfrac14 x^{-3/2}$.`, t`At $a = ${a}$: $\lvert f''\rvert = \dfrac{1}{4\cdot ${n ** 3}} = \dfrac{1}{${4 * n ** 3}}$.`, t`Multiply by $\tfrac12(${nice(d)})^2$.`],
          teach: t`The linearization’s error is about $\frac12 f''(a)(x-a)^2$; for a concave-down curve the tangent lies above it, so the estimate is too big.`,
          explain: t`$\tfrac12\cdot\dfrac{1}{${4 * n ** 3}}\cdot ${nice(d * d)} = ${tex(est, 3)}$. Exactly: $${nice(n + d / (2 * n), 6)} - \sqrt{${nice(a + d)}} = ${tex(n + d / (2 * n) - Math.sqrt(a + d), 3)}$ — the estimate of the error is itself good to a few percent.`,
          visual: curveFig({ fn: 'sqrt(x)', x: [-0.5, a + 2.5 * d + 1], y: [-0.3, n + 1.6], domain: [0, a + 2.5 * d + 1], at: a, f: Math.sqrt, df: (v) => 0.5 / Math.sqrt(v), span: 2.5 * d, caption: t`$\sqrt x$ is concave down, so it sags below every tangent line — and the gap grows with the square of the distance from $${a}$.` }),
        };
      },
    }),
    num({
      id: 'tank-volume', difficulty: 2,
      gen(r) {
        const R = r.pick([0.4, 0.5, 0.8, 1.2]), dr = r.pick([1, 2, 3]);
        const pct = 3 * (dr / 1000) / R * 100;
        return {
          prompt: t`The inner radius of a spherical helium tank is measured as $${R}$ m, uncertain by $\pm ${dr}$ mm. Use differentials to find the resulting relative uncertainty in its volume, in percent.`,
          answer: pct, units: '%', tol: { rel: 0.005 },
          errors: [{ value: (dr / 1000) / R * 100, feedback: t`That is the relative uncertainty in the radius. The volume goes as $r^3$, which triples it.` }],
          hints: [t`$V = \tfrac43\pi r^3$, so $dV = 4\pi r^2\,dr$.`, t`Divide by $V$: $\dfrac{dV}{V} = 3\,\dfrac{dr}{r}$.`],
          teach: t`For a power law $V \propto r^n$, relative errors multiply by $n$: $\frac{dV}{V} = n\frac{dr}{r}$.`,
          explain: t`$\dfrac{dV}{V} = 3\times\dfrac{${nice(dr / 1000)}}{${R}} = ${nice(pct / 100, 3)}$, that is $${nice(pct, 3)}\%$.`,
          visual: curveFig({ fn: '4/3*pi*x^3', x: [0, 1.6 * R], y: [-0.1 * 4.19 * (1.5 * R) ** 3, 4.19 * (1.6 * R) ** 3], xlabel: 'r (m)', ylabel: 'V (m³)', at: R, f: (x) => 4 / 3 * Math.PI * x ** 3, df: (x) => 4 * Math.PI * x * x, span: 0.35 * R, caption: t`Volume against radius, and the tangent at $r = ${R}$ m. Its slope, $4\pi r^2$ (the surface area), converts an error in $r$ into an error in $V$.` }),
        };
      },
    }),
    mcq({
      id: 'kinetic-energy', difficulty: 2,
      prompt: t`A re-entering capsule’s speed is known to $\pm 0.5\%$. To about what precision is its kinetic energy $K = \tfrac12 mv^2$ known, if the mass is exact?`,
      visual: curveFig({ fn: '0.5*x^2', x: [-0.1, 2.2], y: [-0.2, 2.4], xlabel: 'v (relative)', ylabel: 'K (relative)', domain: [0, 2.2], at: 1.2, f: (x) => 0.5 * x * x, df: (x) => x, span: 0.6, caption: t`$K$ grows as $v^2$: the curve steepens, so the same relative error in $v$ means a larger relative error in $K$.` }),
      choices: [t`$\pm 1\%$`, t`$\pm 0.5\%$`, t`$\pm 0.25\%$`, t`$\pm 2\%$`],
      answer: 0,
      why: {
        1: t`Squaring the speed doubles its relative error: $\frac{dK}{K} = 2\frac{dv}{v}$.`,
        2: t`That halves the error, as for $\sqrt{v}$. For $v^2$ it doubles.`,
        3: t`That would be a fourth power. $K \propto v^2$.`,
      },
      hints: [t`$dK = mv\,dv$; divide by $K = \tfrac12mv^2$.`],
      teach: t`Relative errors multiply by the power: $K \propto v^2$ gives $\frac{dK}{K} = 2\frac{dv}{v}$.`,
      explain: t`$\dfrac{dK}{K} = \dfrac{mv\,dv}{\tfrac12mv^2} = 2\dfrac{dv}{v} = 2\times 0.5\% = 1\%$.`,
    }),
    num({
      id: 'small-burn', difficulty: 2,
      gen(r) {
        const ve = r.pick([2200, 3000, 4400]), m0 = r.pick([500, 1000, 2000]), dm = r.pick([5, 10, 20]);
        const L = ve * dm / m0;
        return {
          prompt: t`A spacecraft of mass $m_0 = ${m0}$ kg makes a small correction burn with $\Delta m = ${dm}$ kg of propellant at exhaust speed $v_e = ${ve}$ m/s. The rocket equation gives $\Delta v = v_e\ln\dfrac{m_0}{m_0 - \Delta m} = -v_e\ln\left(1 - \dfrac{\Delta m}{m_0}\right)$. Estimate $\Delta v$ with the linearization $\ln(1 - x) \approx -x$.`,
          answer: L, units: 'm/s', tol: { rel: 1e-4 },
          errors: [{ value: ve * Math.log(m0 / (m0 - dm)), feedback: t`That is the exact value from the logarithm, a little larger. The question asks for the linear estimate $v_e\,\Delta m/m_0$.` }],
          hints: [t`With $x = \Delta m/m_0$, $\Delta v \approx v_e\,x$.`],
          teach: t`For small $x$, $\ln(1 - x) \approx -x$: a small burn gives a speed change proportional to the propellant used.`,
          explain: t`$\Delta v \approx ${ve}\times\dfrac{${dm}}{${m0}} = ${nice(L, 4)}$ m/s. The exact value is $${nice(ve * Math.log(m0 / (m0 - dm)), 5)}$ m/s; the error, about $\tfrac12 v_e x^2 = ${nice(0.5 * ve * (dm / m0) ** 2, 3)}$ m/s, is tiny because $x = ${nice(dm / m0)}$ is small.`,
          visual: { type: 'graph', params: { x: [0, 0.5], y: [-0.03, 0.72], aspect: 'wide', xlabel: 'x = Δm / m₀', ylabel: 'Δv / vₑ', curves: [{ fn: '-ln(1 - x)', color: 'accent', label: '−ln(1 − x)', labelAt: 0.43, labelDx: -84 }, { fn: 'x', color: 'gold', dash: true, width: 1.8, label: 'x', labelAt: 0.47 }], points: [{ x: dm / m0, y: -Math.log(1 - dm / m0), color: 'accent' }] }, caption: t`The exact $\Delta v/v_e$ and its linearization: indistinguishable for burns of a few percent of the mass; at $x = 0.4$ the line falls 22% short.` },
        };
      },
    }),
    mcq({
      id: 'find-error-geo', difficulty: 3, kind: 'error',
      prompt: t`A student uses $g \approx g_0\left(1 - \dfrac{2h}{R}\right)$ to find the gravitational acceleration at geostationary altitude, $h = 35\,786$ km, with $R = 6371$ km, and gets $-100\ \text{m/s}^2$. What went wrong?`,
      visual: { type: 'graph', params: { x: [-1.5, 40], y: [-14, 11], aspect: 'wide', xlabel: 'h (thousand km)', ylabel: 'g (m/s²)', curves: [{ fn: '9.81*(6371/(6371 + 1000*x))^2', color: 'accent', domain: [0, 40], label: 'true g', labelAt: 30, labelDy: -12 }, { fn: '9.81*(1 - 2000*x/6371)', color: 'gold', dash: true, width: 1.8, domain: [0, 12], label: 'linear', labelAt: 4.5, labelDx: 8 }], hlines: [{ y: 0 }], points: [{ x: 35.786, y: 0.224, color: 'accent', label: 'GEO', labelDy: -12 }] }, caption: t`The true $g$ (blue) and the linearization at the ground (dashed), which crosses zero at only $h = R/2$.` },
      choices: [
        t`The linearization holds only for $h \ll R$, and $35\,786$ km is $5.6R$`,
        t`The slope should be $+2g_0/R$: gravity grows with height`,
        t`The altitude must be converted to metres first`,
        t`Nothing — gravity really does reverse direction far from the Earth`,
      ],
      answer: 0,
      why: {
        1: t`Gravity weakens with height; the negative slope is right. The step is the problem.`,
        2: t`$h/R$ is a ratio of two lengths: any unit works as long as both match.`,
        3: t`Newtonian gravity always pulls inward; the true value at that altitude is $0.22\ \text{m/s}^2$.`,
      },
      hints: [t`How does the error of a linearization grow with the step $h$?`, t`Compare $h$ with $R$: the error term $3g_0(h/R)^2$ is enormous here.`],
      teach: t`A linearization is a local tool: its error grows with the square of the step, so it fails once the step is comparable to the scale on which the function bends.`,
      explain: t`$g = 9.81\left(\dfrac{6371}{42\,157}\right)^2 = 0.224\ \text{m/s}^2$. The error estimate $3g_0(h/R)^2 \approx 930\ \text{m/s}^2$ shows the linearization was never going to work this far out.`,
    }),
    num({
      id: 'sail-area', difficulty: 2,
      gen(r) {
        const R = r.pick([10, 15, 20, 30]), dr = r.pick([0.5, 1, 2]);
        const dA = 2 * Math.PI * R * dr / 100;
        return {
          prompt: t`A circular solar sail of radius $${R}$ m warms in sunlight and its radius grows by $${dr}$ cm. Use the differential $dA = 2\pi r\,dr$ to estimate the change in its area, in $\text{m}^2$.`,
          answer: dA, units: 'm^2', tol: { rel: 0.005 },
          errors: [{ value: Math.PI * (dr / 100) ** 2, feedback: t`That is the area of a circle of radius $dr$. The change is a thin ring: circumference times width.` }, { value: 2 * Math.PI * R * dr, feedback: t`Convert $dr$ to metres: $${dr}$ cm $= ${nice(dr / 100)}$ m.` }],
          hints: [t`$dr = ${nice(dr / 100)}$ m. The new area is a thin ring of circumference $2\pi r$ and width $dr$.`],
          teach: t`A differential turns a small change of input into a change of output through the derivative: $dA = A'(r)\,dr$.`,
          explain: t`$dA = 2\pi(${R})(${nice(dr / 100)}) = ${nice(dA, 4)}\ \text{m}^2$. The exact change $\pi(r + dr)^2 - \pi r^2$ adds only $\pi\,dr^2 = ${tex(Math.PI * (dr / 100) ** 2, 2)}\ \text{m}^2$.`,
          visual: { type: 'graph', params: { x: [-1.6 * R, 1.6 * R], y: [-1.15 * R, 1.15 * R], aspect: 'wide', equal: true, xlabel: 'm', ylabel: '', curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 2 * Math.PI], color: 'accent' }, { param: [`${N(R * 1.06)}*cos(t)`, `${N(R * 1.06)}*sin(t)`], t: [0, 2 * Math.PI], color: 'gold', dash: true, width: 1.2 }], arrows: [{ from: [0, 0], to: [R, 0], color: 'accent', label: `r = ${R} m`, labelDy: -10, labelAlign: 'right' }] }, caption: t`The sail (blue) and its warmer outline (dashed), with the growth exaggerated many times so the ring is visible.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cbrt', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]), d = r.pick([-1, -0.5, 0.3, 0.5, 1]);
        const a = n ** 3, L = n + d / (3 * n * n);
        return {
          prompt: t`Use a linearization to estimate $\sqrt[3]{${nice(a + d)}}$.`,
          answer: L, tol: { rel: 1e-4 },
          errors: [{ value: n + d / (3 * n), feedback: t`The slope of $x^{1/3}$ is $\tfrac13x^{-2/3}$; at $${a}$ that is $\dfrac{1}{3\cdot ${n * n}}$.` }],
          hints: [t`Linearize $x^{1/3}$ at $a = ${a}$.`],
          teach: t`Pick $a$ where the root is exact and the slope easy.`,
          explain: t`$L = ${n} + \dfrac{${nice(d)}}{3\cdot ${n * n}} = ${nice(L, 6)}$ (true value $${nice(Math.cbrt(a + d), 6)}$).`,
          visual: curveFig({ fn: 'cbrt(x)', x: [a - 20, a + 20], y: [Math.cbrt(Math.max(a - 20, -8)) - 0.6, n + 1], domain: [a - 20, a + 20], at: a, f: Math.cbrt, df: (v) => 1 / (3 * Math.cbrt(v) ** 2), span: 12, caption: t`$y = \sqrt[3]{x}$ and its tangent at $${a}$.` }),
        };
      },
    }),
    num({
      id: 'cp-kepler', difficulty: 2, transfer: true,
      gen(r) {
        const pa = r.pick([0.1, 0.2, 0.4, 1]);
        const ans = 1.5 * pa;
        return {
          prompt: t`By Kepler’s third law a satellite’s period goes as $T \propto a^{3/2}$, where $a$ is the orbit’s semi-major axis. If $a$ is known to $\pm ${pa}\%$, to what relative precision, in percent, is the period predicted?`,
          answer: ans, units: '%', tol: { rel: 0.005 },
          errors: [{ value: pa, feedback: t`The power $3/2$ multiplies the relative error.` }, { value: pa / 1.5, feedback: t`Multiply by $\tfrac32$, do not divide.` }],
          hints: [t`$\dfrac{dT}{T} = \dfrac32\,\dfrac{da}{a}$.`],
          teach: t`For any power law, differentials give $\frac{dT}{T} = n\frac{da}{a}$.`,
          explain: t`$\dfrac{dT}{T} = \dfrac32\times ${pa}\% = ${nice(ans)}\%$.`,
          visual: curveFig({ fn: 'x^1.5', x: [-0.1, 2.2], y: [-0.2, 3.3], xlabel: 'a (relative)', ylabel: 'T (relative)', domain: [0, 2.2], at: 1, f: (x) => x ** 1.5, df: (x) => 1.5 * Math.sqrt(x), span: 0.6, caption: t`$T \propto a^{3/2}$ with its tangent at today’s orbit: the slope there is $\tfrac32$ in relative units.` }),
        };
      },
    }),
    mcq({
      id: 'cp-concavity', difficulty: 2,
      prompt: t`The linearization of $\sqrt{x}$ at $25$ gives $\sqrt{26} \approx 5.1$. Is that estimate too big or too small?`,
      visual: curveFig({ fn: 'sqrt(x)', x: [-1, 50], y: [-0.5, 7.8], domain: [0, 50], at: 25, f: Math.sqrt, df: (v) => 0.5 / Math.sqrt(v), span: 24, caption: t`$y = \sqrt x$ and its tangent at $25$, shown over a wide range so the gap is visible.` }),
      choices: [
        t`Too big: $\sqrt x$ is concave down, so its graph lies below its tangent lines`,
        t`Too small: $\sqrt x$ is increasing, so the true value is higher`,
        t`Exact: the step $1$ is small`,
        t`Too small: $\sqrt x$ is concave down`,
      ],
      answer: 0,
      why: {
        1: t`Increasing has nothing to do with it — the tangent line is increasing too. Bending decides which is above.`,
        2: t`Small steps give small errors, not zero ones: $5.1^2 = 26.01$, not $26$.`,
        3: t`Concave down is right, but it puts the curve **below** the tangent, so the tangent overestimates.`,
      },
      hints: [t`Look at the picture: is the curve above or below its tangent line?`],
      teach: t`Concave down ($f'' < 0$): the tangent line overestimates; concave up: it underestimates.`,
      explain: t`$5.1^2 = 26.01 > 26$, so $5.1$ is slightly too big — as concavity predicts. $\sqrt{26} = 5.0990$.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §4.2 Linear approximations and differentials', url: 'https://openstax.org/books/calculus-volume-1/pages/4-2-linear-approximations-and-differentials' }],
});
