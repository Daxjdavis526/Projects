// Partial derivatives: the rate of change of a function of several
// variables in one coordinate direction, with the others held fixed — the
// slope of a trace on the graph. Higher partials, Clairaut, and the PDEs of
// physics in preview.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { surf, gasSurface, ellipses, sterm, r6, GAS_R } from './_partials.js';

const t = String.raw;

/** A height scale that keeps the graph of g within about ±2.4 over the square [−s, s]². */
function zfit(g, s = 1.5, dom = [[-s, s], [-s, s]]) {
  let m = 1e-9;
  for (let i = 0; i <= 24; i++) for (let j = 0; j <= 24; j++) {
    const x = dom[0][0] + ((dom[0][1] - dom[0][0]) * i) / 24, y = dom[1][0] + ((dom[1][1] - dom[1][0]) * j) / 24;
    const v = Math.abs(g(x, y));
    if (Number.isFinite(v)) m = Math.max(m, v);
  }
  return +Math.min(1, 2.4 / m).toPrecision(2);
}

// the hill f = 10 − x² − 2y² as a contour map: level curves at 2, 4, 6, 8
const HILL_LEVELS = [2, 4, 6, 8];
const hillMap = (points, caption) => ({
  type: 'graph',
  params: {
    x: [-3.6, 3.6], y: [-2.4, 2.4], equal: true, aspect: 'wide',
    curves: ellipses(1, 2, HILL_LEVELS.map((c) => 10 - c), { color: 'accent2' }),
    points: [
      ...HILL_LEVELS.map((c) => ({ x: r6(Math.sqrt(10 - c)), y: 0, r: 0.01, color: 'accent2', label: `${c}`, labelDx: 3, labelDy: -9 })),
      ...points,
    ],
  },
  caption,
});

export default lesson({
  id: 'math2210.C3-3.2',
  title: 'Partial derivatives',
  minutes: 10, difficulty: 2,
  intro: t`A function of several variables changes at a different rate in each direction. The **partial derivative** with respect to $x$ holds every other variable fixed and differentiates in $x$ alone:

$$\frac{\partial f}{\partial x}(a, b) = \lim_{h \to 0} \frac{f(a + h,\, b) - f(a,\, b)}{h}$$

On the graph it is the **slope of the trace** cut by the plane $y = b$; $\partial f/\partial y$ is the slope of the trace cut by $x = a$. Physics is written in them: how a gas’s pressure changes with temperature at fixed volume, how a field varies along one axis — and the laws of heat, waves and gravity are all equations between partial derivatives.`,
  symbols: [
    { tex: '\\dfrac{\\partial f}{\\partial x}', text: 'the partial derivative of $f$ with respect to $x$, also written $f_x$: units of $f$ per unit of $x$' },
    { tex: '(a, b)', text: 'the point where the rate is measured' },
    { tex: 'h', text: 'a small step in $x$ alone — $y$ stays at $b$' },
    { tex: 'f(a+h,\\,b) - f(a,\\,b)', text: 'the change in $f$ caused by that step' },
    { tex: '\\partial', text: 'a rounded “d”: it warns that other variables exist and are being held fixed' },
  ],
  why: t`Every field equation you will meet — heat flow, waves, Maxwell’s equations, Einstein’s — is a **partial differential equation**: a relation between partial derivatives of a field.`,
  visual: {
    type: 'surface3d',
    title: 'Two slopes through one point of a gas',
    lead: t`The surface is the ideal-gas law $P = nRT/V$ for one mole: pressure as a function of volume and temperature. Through the chosen state run two curves — the **isotherm** (gold, $T$ held fixed) and the **isochore** (violet, $V$ held fixed). The white lines touch them: their slopes are $\partial P/\partial V$ and $\partial P/\partial T$.`,
    tasks: [
      t`Change $T$ only: the violet isochore is a straight line, so $\partial P/\partial T = nR/V$ is the same all along it.`,
      t`Squeeze the gas from 30 L to 12 L: the gold isotherm steepens, because $\partial P/\partial V = -nRT/V^2$ grows as $V$ shrinks.`,
      t`Compare the readouts’ units — kPa per litre and kPa per kelvin. Partial derivatives in different directions measure different things.`,
    ],
    ...(() => {
      const g = gasSurface({ V: 'Vp', T: 'Tp' });
      return {
        params: {
          ...g.params,
          sliders: [
            { key: 'Vp', label: 'Volume $V$', min: 12, max: 38, step: 1, value: 25, unit: '\\mathrm{L}', explain: 'The volume of the container holding one mole of gas.' },
            { key: 'Tp', label: 'Temperature $T$', min: 210, max: 390, step: 5, value: 300, unit: '\\mathrm{K}', explain: 'The absolute temperature of the gas.' },
          ],
          readouts: [
            { label: 'pressure $P$', expr: `${GAS_R}*Tp/Vp`, unit: '\\mathrm{kPa}', digits: 4 },
            { label: '$\\partial P/\\partial V$', expr: `-${GAS_R}*Tp/Vp^2`, unit: '\\mathrm{kPa/L}', digits: 3 },
            { label: '$\\partial P/\\partial T$', expr: `${GAS_R}/Vp`, unit: '\\mathrm{kPa/K}', digits: 3 },
          ],
        },
        caption: t`One mole of ideal gas, $P = nRT/V$ with $R = 8.314$ J/(mol·K), over 10–40 L and 200–400 K; heights are to scale within the picture. Real gases depart from this surface at high pressure and low temperature. Drag to rotate.`,
      };
    })(),
  },
  example: {
    prompt: t`One mole of an ideal gas is at $V = 25.0$ L and $T = 300$ K, so $P = nRT/V$ with $nR = 8.314$ J/K. Find $\partial P/\partial V$ and $\partial P/\partial T$ there, say what each means, and check that the two mixed second partials agree.`,
    visual: gasSurface({ V: 25, T: 300, caption: t`The state $V = 25$ L, $T = 300$ K on the ideal-gas surface. Gold: the isotherm $T = 300$ K; violet: the isochore $V = 25$ L. Drag to rotate.` }),
    steps: [
      { label: 'Hold T, differentiate in V', text: t`With $T$ fixed, $P = (nRT)\,V^{-1}$ is a constant times $V^{-1}$: $\dfrac{\partial P}{\partial V} = -\dfrac{nRT}{V^2} = -\dfrac{8.314 \times 300}{25.0^2} = -3.99$ kPa/L.` },
      { label: 'Hold V, differentiate in T', text: t`With $V$ fixed, $P = (nR/V)\,T$ is linear in $T$: $\dfrac{\partial P}{\partial T} = \dfrac{nR}{V} = \dfrac{8.314}{25.0} = 0.333$ kPa/K.` },
      { label: 'Read them', text: t`Squeezing the gas by 1 L at constant temperature raises its pressure by about 4.0 kPa; warming it by 1 K in a rigid box raises it by 0.33 kPa. (1 J/L = 1 kPa, so the units come out in kPa.)` },
      { label: 'Mixed partials', text: t`$\dfrac{\partial}{\partial T}\!\left(-\dfrac{nRT}{V^2}\right) = -\dfrac{nR}{V^2}$ and $\dfrac{\partial}{\partial V}\!\left(\dfrac{nR}{V}\right) = -\dfrac{nR}{V^2}$: the same, $-0.0133$ kPa/(L·K), as **Clairaut’s theorem** promises whenever the second partials are continuous.` },
      { label: 'Sense check', text: t`$P = 8.314 \times 300/25.0 = 99.8$ kPa, about one atmosphere. Squeezing raises the pressure, so $\partial P/\partial V$ must be negative — it is.` },
    ],
    answer: t`$\partial P/\partial V = -3.99$ kPa/L and $\partial P/\partial T = 0.333$ kPa/K; both mixed partials are $-nR/V^2 = -0.0133$ kPa/(L·K).`,
  },
  practice: [
    expr({
      id: 'fx-poly', difficulty: 1,
      gen(r) {
        const A = r.pick([1, 2, 3]), B = r.pick([-2, -1, 1, 2]), C = r.pick([2, 3, 4]);
        const f = `${A}*x^2*y + ${B}*x*y^2 + ${C}*y`;
        const fTeX = t`${A === 1 ? '' : A}x^2y${sterm(B, 'xy^2')}${sterm(C, 'y')}`;
        const zs = zfit((x, y) => A * x * x * y + B * x * y * y + C * y);
        return {
          prompt: t`Find $\dfrac{\partial f}{\partial x}$ for $f(x, y) = ${fTeX}$.`,
          visual: surf((x, y) => `${A}*${x}^2*${y} + ${B}*${x}*${y}^2 + ${C}*${y}`, { domain: [[-1.5, 1.5], [-1.5, 1.5]], zscale: zs, traces: [{ y: 1 }], dist: 8, caption: t`The graph of $f$ (heights scaled by ${zs}). The gold curve is its trace in the plane $y = 1$: $\partial f/\partial x$ is the slope of curves like it. Drag to rotate.` }),
          answer: `${2 * A}*x*y + ${B}*y^2`,
          answerTeX: t`${2 * A}xy${sterm(B, 'y^2')}`,
          vars: { x: [-2, 2], y: [-2, 2] }, derivativeOf: f, wrt: 'x', lhs: t`\dfrac{\partial f}{\partial x}`,
          errors: [
            { answer: `${2 * A}*x*y + ${B}*y^2 + ${C}`, feedback: t`$${C}y$ contains no $x$: with $y$ held fixed it is a constant, and its $x$-derivative is $0$.` },
            { answer: `${2 * A}*x*y + ${2 * B}*x*y`, feedback: t`In $${B === 1 ? '' : B === -1 ? '-' : B}xy^2$ only the $x$ is differentiated; $y^2$ is a constant factor, so the term gives $${B === 1 ? '' : B === -1 ? '-' : B}y^2$.` },
          ],
          hints: [t`Treat $y$ as a constant, like the number 3.`, t`$\dfrac{\partial}{\partial x}(x^2 y) = 2xy$, $\dfrac{\partial}{\partial x}(x y^2) = y^2$, and $\dfrac{\partial}{\partial x}(y) = 0$.`],
          teach: 'To take ∂/∂x, differentiate in x as usual while treating every other variable as a constant.',
          explain: t`Holding $y$ fixed: $${A === 1 ? '' : A}x^2y \to ${2 * A}xy$, $\;${B === 1 ? '' : B === -1 ? '-' : B}xy^2 \to ${B === 1 ? '' : B === -1 ? '-' : B}y^2$, and $${C}y \to 0$. So $f_x = ${2 * A}xy${sterm(B, 'y^2')}$.`,
        };
      },
    }),
    expr({
      id: 'fy-exp', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -1]), b = r.pick([2, 3]);
        const ea = a === 1 ? 'e^{x}' : a === -1 ? 'e^{-x}' : `e^{${a}x}`;
        return {
          prompt: t`Find $\dfrac{\partial f}{\partial y}$ for $f(x, y) = ${ea}\cos(${b}y)$.`,
          visual: surf((x, y) => `e^(${a}*${x})*cos(${b}*${y})`, { domain: [[-1, 1], [-1.5, 1.5]], zscale: r6(2 / Math.exp(Math.abs(a))), traces: [{ x: 0.5 }], dist: 7.5, caption: t`The graph of $f$ (heights scaled). The violet curve is its trace in the plane $x = 0.5$: $\partial f/\partial y$ is its slope. Drag to rotate.` }),
          answer: `-${b}*e^(${a}*x)*sin(${b}*y)`,
          answerTeX: t`-${b}\,${ea}\sin(${b}y)`,
          vars: { x: [-1.5, 1.5], y: [-2, 2] }, derivativeOf: `e^(${a}*x)*cos(${b}*y)`, wrt: 'y', lhs: t`\dfrac{\partial f}{\partial y}`,
          errors: [
            { answer: `${b}*e^(${a}*x)*sin(${b}*y)`, feedback: t`The derivative of $\cos$ is $-\sin$: check the sign.` },
            { answer: `-e^(${a}*x)*sin(${b}*y)`, feedback: t`The chain rule brings out the inner derivative: $\dfrac{\partial}{\partial y}\cos(${b}y) = -${b}\sin(${b}y)$.` },
          ],
          hints: [t`With $x$ fixed, $${ea}$ is a constant factor.`, t`$\dfrac{d}{dy}\cos(${b}y) = -${b}\sin(${b}y)$.`],
          teach: 'A factor that depends only on the held variable rides along as a constant multiplier.',
          explain: t`$${ea}$ does not depend on $y$, so it multiplies the $y$-derivative of $\cos(${b}y)$, which is $-${b}\sin(${b}y)$: $f_y = -${b}\,${ea}\sin(${b}y)$.`,
        };
      },
    }),
    mcq({
      id: 'signs', difficulty: 2,
      prompt: t`The map shows level curves of a hill $f(x, y)$, whose summit is at the origin. At the point $P = (1.2, -0.8)$, what are the signs of $f_x$ and $f_y$?`,
      visual: hillMap([{ x: 1.2, y: -0.8, color: 'gold', r: 5, label: 'P', labelDx: 8, labelDy: -10 }], t`Level curves of $f$, labelled by height (2, 4, 6, 8) where they cross the $x$-axis, rising toward the summit at the origin.`),
      choices: [t`$f_x < 0$ and $f_y > 0$`, t`$f_x > 0$ and $f_y < 0$`, t`$f_x < 0$ and $f_y < 0$`, t`$f_x > 0$ and $f_y > 0$`],
      answer: 0,
      why: {
        1: t`Those are the signs of $P$’s coordinates, not of the slopes. Step from $P$ in the $+x$ direction: do you climb or descend?`,
        2: t`A step in $+y$ from $P$ (at $y = -0.8$) heads toward the summit, which is uphill — so $f_y > 0$.`,
        3: t`A step in $+x$ from $P$ (at $x = 1.2$) heads away from the summit, which is downhill — so $f_x < 0$.`,
      },
      hints: [t`$f_x$ asks: moving from $P$ in the $+x$ direction only, does $f$ rise or fall?`, 'Moving right from P takes you away from the summit; moving up the page takes you toward it.'],
      teach: 'The sign of a partial derivative is whether a small step in that positive coordinate direction goes uphill or downhill.',
      explain: t`Moving in $+x$ from $P$ crosses level curves toward lower values (away from the summit), so $f_x < 0$. Moving in $+y$ climbs toward the summit, so $f_y > 0$. For this hill, $f = 10 - x^2 - 2y^2$: $f_x = -2x = -2.4$ and $f_y = -4y = 3.2$ at $P$.`,
    }),
    num({
      id: 'isochore', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 4]), V = r.pick([15, 20, 25, 30]), T = r.pick([250, 300, 350]);
        const dPdT = (n * GAS_R) / V;
        return {
          prompt: t`A rigid ${V} L flask holds ${n} mol of ideal gas at ${T} K. Find $\left(\dfrac{\partial P}{\partial T}\right)_V$, the rate at which its pressure rises with temperature at fixed volume. ($R = 8.314$ J/(mol·K); 1 J/L = 1 kPa.)`,
          visual: gasSurface({ V, T, n, caption: t`The ideal-gas surface for ${n} mol, with the state ${V} L, ${T} K. The violet isochore is the flask’s fixed volume; its slope is the answer. Drag to rotate.` }),
          answer: dPdT, units: 'kPa/K', tol: { rel: 0.01 },
          errors: [{ value: (n * GAS_R * T) / V, feedback: t`That is the pressure itself, $nRT/V$. Differentiate with respect to $T$: the $T$ drops out.` }, { value: -(n * GAS_R * T) / (V * V), feedback: t`That is $\partial P/\partial V$, the slope along the isotherm. Here $V$ is held fixed and $T$ varies.` }],
          hints: [t`$P = \dfrac{nR}{V}\,T$: with $V$ fixed, $P$ is a constant times $T$.`],
          teach: t`The subscript in $(\partial P/\partial T)_V$ names the variable held fixed: here the volume.`,
          explain: t`$\left(\dfrac{\partial P}{\partial T}\right)_V = \dfrac{nR}{V} = \dfrac{${n}\times 8.314}{${V}} = ${nice(+dPdT.toPrecision(3))}$ kPa/K, the same at every temperature: the isochore is a straight line.`,
        };
      },
    }),
    expr({
      id: 'mixed', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3]), b = r.pick([2, 3]);
        // f = x^a y^b + sin(xy);  f_x = a x^(a-1) y^b + y cos(xy);  f_xy = ab x^(a-1) y^(b-1) + cos(xy) - xy sin(xy)
        const fx = `${a}*x^${a - 1}*y^${b} + y*cos(x*y)`;
        const pw = (v, p) => (p === 1 ? v : `${v}^{${p}}`);
        return {
          prompt: t`For $f(x, y) = x^{${a}}y^{${b}} + \sin(xy)$, find the mixed partial $\dfrac{\partial^2 f}{\partial y\,\partial x} = \dfrac{\partial}{\partial y}\!\left(\dfrac{\partial f}{\partial x}\right)$.`,
          visual: (() => {
            let lo = 0, hi = 0;
            for (let k = 0; k <= 64; k++) { const y = -1.6 + (3.2 * k) / 64, v = a * y ** b + y * Math.cos(y); lo = Math.min(lo, v); hi = Math.max(hi, v); }
            const pad = 0.12 * (hi - lo);
            return { type: 'graph', params: { x: [-1.6, 1.6], y: [r6(lo - pad), r6(hi + pad)], aspect: 'wide', xlabel: 'y', ylabel: '∂f/∂x at x = 1', curves: [{ fn: `${a}*x^${b} + x*cos(x)`, color: 'gold', width: 2.4 }] }, caption: t`How the $x$-slope $\partial f/\partial x$ changes as you move in $y$, along the line $x = 1$. The mixed partial $f_{xy}$ at $x = 1$ is the slope of this curve.` };
          })(),
          answer: `${a * b}*x^${a - 1}*y^${b - 1} + cos(x*y) - x*y*sin(x*y)`,
          answerTeX: t`${a * b}${pw('x', a - 1)}${pw('y', b - 1)} + \cos(xy) - xy\sin(xy)`,
          vars: { x: [-1.5, 1.5], y: [-1.5, 1.5] }, derivativeOf: fx, wrt: 'y', lhs: t`f_{xy}`,
          errors: [
            { answer: `${a * b}*x^${a - 1}*y^${b - 1} + cos(x*y)`, feedback: t`$y\cos(xy)$ is a product of two factors that both contain $y$: use the product rule, which adds $-xy\sin(xy)$.` },
            { answer: `${a * b}*x^${a - 1}*y^${b - 1} - x*y*sin(x*y)`, feedback: t`Differentiating $y\cos(xy)$ gives two terms: $\cos(xy)$ from the $y$ in front, and $-xy\sin(xy)$ from the cosine.` },
          ],
          hints: [t`First find $f_x = ${a}${pw('x', a - 1)}y^{${b}} + y\cos(xy)$.`, t`Now differentiate that in $y$, holding $x$ fixed. $y\cos(xy)$ needs the product rule.`, t`$\dfrac{\partial}{\partial y}\big(y\cos(xy)\big) = \cos(xy) - xy\sin(xy)$.`],
          teach: 'A mixed partial differentiates in one variable, then the other; for smooth functions the order does not matter (Clairaut).',
          explain: t`$f_x = ${a}${pw('x', a - 1)}y^{${b}} + y\cos(xy)$, so $f_{xy} = ${a * b}${pw('x', a - 1)}${pw('y', b - 1)} + \cos(xy) - xy\sin(xy)$. Differentiating in the other order, $f_y = ${b}x^{${a}}${pw('y', b - 1)} + x\cos(xy)$ and $f_{yx}$ gives the same expression.`,
        };
      },
    }),
    num({
      id: 'heat', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [3, 2], [5, 2], [9, 3], [4, 3], [3, 1]]);
        const alpha = a / (b * b);
        const bx = b === 1 ? 'x' : `${b}x`;
        return {
          prompt: t`The temperature along a thin rod is $u(x, t) = e^{-${a}t}\sin(${bx})$. It satisfies the heat equation $\dfrac{\partial u}{\partial t} = \alpha\,\dfrac{\partial^2 u}{\partial x^2}$ for one value of the constant $\alpha$. Find it.`,
          visual: { type: 'graph', params: { x: [0, Math.PI / b], y: [-0.1, 1.15], aspect: 'wide', xlabel: 'x', ylabel: 'u', curves: [0, 0.3 / a, 0.8 / a].map((tt, k) => ({ fn: `${r6(Math.exp(-a * tt))}*sin(${b}x)`, color: ['warn', 'violet', 'accent'][k], width: 2.4, label: `t = ${nice(+tt.toPrecision(2))}`, labelAt: r6(Math.PI / (2 * b)), labelDy: -12 })) }, caption: t`The temperature profile $u(x, t)$ at three times: the hump keeps its shape and dies away exponentially. Units chosen so the numbers are pure.` },
          answer: alpha, tol: { rel: 1e-3 },
          errors: [
            { value: (b * b) / a, feedback: t`Upside down: $\alpha = u_t / u_{xx}$.` },
            ...(b > 1 ? [{ value: a / b, feedback: t`Differentiating $\sin(${bx})$ twice brings out $${b}$ twice: $u_{xx} = -${b * b}u$.` }] : []),
            { value: -alpha, feedback: t`Both $u_t$ and $u_{xx}$ are negative multiples of $u$, so their ratio is positive.` },
          ].filter((e) => Math.abs(e.value - alpha) > 0.02 * alpha),
          hints: [t`$u_t = -${a}\,e^{-${a}t}\sin(${bx}) = -${a}u$.`, t`$u_{xx} = -${b * b}\,e^{-${a}t}\sin(${bx}) = -${b * b}u$.`, t`$\alpha = u_t / u_{xx}$.`],
          teach: 'To check that a function solves a PDE, compute each partial derivative it contains and compare.',
          explain: t`$u_t = -${a}u$ and $u_{xx} = -${b * b}u$, so $u_t = \tfrac{${a}}{${b * b}}\,u_{xx}$ and $\alpha = ${nice(+alpha.toPrecision(4))}$. The diffusivity $\alpha$ sets how fast heat spreads; a sharper profile (larger ${b === 1 ? 'wavenumber' : t`wavenumber ${b}`}) decays faster, as $e^{-\alpha k^2 t}$.`,
        };
      },
    }),
    mcq({
      id: 'error-power', difficulty: 3, kind: 'error',
      prompt: t`A student differentiates $f(x, y) = x^y$ (for $x > 0$) and writes $\dfrac{\partial f}{\partial y} = y\,x^{y-1}$. What went wrong?`,
      visual: surf((x, y) => `${x}^${y}`, { domain: [[0.5, 3], [0, 2]], traces: [{ x: 2 }], zscale: 0.3, target: [1.6, 1, 0.6], dist: 7, caption: t`The graph of $x^y$ (heights scaled by 0.3). The violet trace is $x = 2$, where $f = 2^y$: an exponential curve in $y$. Drag to rotate.` }),
      choices: [
        t`They used the power rule, which is for $\partial/\partial x$; with $x$ fixed, $x^y$ is an exponential in $y$, so $\dfrac{\partial f}{\partial y} = x^y\ln x$`,
        t`Nothing: the power rule works for any exponent`,
        t`They should have written $\dfrac{\partial f}{\partial y} = x^{y}$, since the derivative of an exponential is itself`,
        t`They should have written $\dfrac{\partial f}{\partial y} = y\,x^{y-1}\ln x$, combining both rules`,
      ],
      answer: 0,
      why: {
        1: t`The power rule needs a variable base and a constant exponent. Here the exponent $y$ is the variable.`,
        2: t`Only $e^y$ is its own derivative. For base $x$, $\dfrac{d}{dy}x^y = x^y\ln x$.`,
        3: t`Each partial uses one rule: the power rule gives $\partial f/\partial x = y\,x^{y-1}$; the exponential rule gives $\partial f/\partial y = x^y\ln x$. Nothing multiplies them together.`,
      },
      hints: ['Which variable is held constant when you take ∂/∂y?', t`With $x = 2$ fixed, $f = 2^y$. What is $\dfrac{d}{dy}2^y$?`],
      teach: t`Which rule applies depends on which letter varies: $x^y$ is a power in $x$ but an exponential in $y$.`,
      explain: t`For $\partial/\partial y$, $x$ is a constant base, so $x^y = e^{y\ln x}$ and $\dfrac{\partial f}{\partial y} = x^y\ln x$. Their answer, $y\,x^{y-1}$, is the other partial, $\partial f/\partial x$.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-fy', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4]);
        const f = `x^2*sin(${k}*y) + y^3/x`;
        return {
          prompt: t`Find $\dfrac{\partial f}{\partial y}$ for $f(x, y) = x^2\sin(${k}y) + \dfrac{y^3}{x}$.`,
          visual: surf((x, y) => `${x}^2*sin(${k}*${y}) + ${y}^3/${x}`, { domain: [[0.5, 2], [-1.2, 1.2]], traces: [{ x: 1 }], zscale: 0.45, target: [1.2, 0, 0], dist: 7.5, caption: t`The graph of $f$ (heights scaled by 0.45), with its trace in the plane $x = 1$ in violet. Drag to rotate.` }),
          answer: `${k}*x^2*cos(${k}*y) + 3*y^2/x`,
          answerTeX: t`${k}x^2\cos(${k}y) + \dfrac{3y^2}{x}`,
          vars: { x: [0.5, 2], y: [-1.5, 1.5] }, derivativeOf: f, wrt: 'y', lhs: t`\dfrac{\partial f}{\partial y}`,
          errors: [{ answer: `2*x*sin(${k}*y) - y^3/x^2`, feedback: t`That is $\partial f/\partial x$. Hold $x$ fixed and differentiate in $y$.` }],
          hints: [t`$x^2$ and $\dfrac{1}{x}$ are constants when $x$ is held fixed.`],
          teach: 'Factors of the held variable are constants; differentiate only the y-dependence.',
          explain: t`$\dfrac{\partial}{\partial y}\big(x^2\sin(${k}y)\big) = ${k}x^2\cos(${k}y)$ and $\dfrac{\partial}{\partial y}\dfrac{y^3}{x} = \dfrac{3y^2}{x}$.`,
        };
      },
    }),
    num({
      id: 'cp-copv', difficulty: 3, transfer: true,
      gen(r) {
        const [P0, psi] = r.pick([[20.7, 3000], [27.6, 4000], [31.0, 4500]]), dT = r.pick([10, 15, 20]);
        const T0 = 293, dP = (P0 * dT) / T0;
        return {
          prompt: t`A rocket stage’s helium pressurant tank is filled to ${P0} MPa (about ${psi} psi) at ${T0} K and sealed. On the pad it warms by ${dT} K. Treating helium as an ideal gas in a rigid tank, use $\left(\dfrac{\partial P}{\partial T}\right)_V$ to find the rise in pressure, in MPa.`,
          visual: { type: 'graph', params: { x: [0, 340], y: [0, r6(P0 * 1.25)], aspect: 'wide', xlabel: 'T (K)', ylabel: 'P (MPa)', curves: [{ fn: `${r6(P0 / T0)}*x`, color: 'violet', width: 2.4, label: 'fixed volume', labelAt: 120, labelDy: -14 }], points: [{ x: T0, y: P0, color: 'gold', r: 5, label: `fill: ${P0} MPa, ${T0} K`, labelDx: -10, labelDy: -14, labelAlign: 'right' }] }, caption: t`Pressure against temperature for the sealed tank: an ideal gas at fixed volume follows a straight line through the origin.` },
          answer: dP, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: P0 * (T0 + dT) / T0, feedback: 'That is the new pressure, not the rise.' }, { value: P0 * dT / (T0 + 273.15), feedback: 'The temperature is already in kelvin: no 273.15 needed.' }],
          hints: [t`For an ideal gas at fixed volume, $\left(\dfrac{\partial P}{\partial T}\right)_V = \dfrac{nR}{V} = \dfrac{P}{T}$.`, t`$\Delta P = \dfrac{P}{T}\,\Delta T$ — exact here, since $P$ is proportional to $T$.`],
          teach: t`At fixed volume an ideal gas has $(\partial P/\partial T)_V = nR/V = P/T$, so its pressure rises in proportion to absolute temperature.`,
          explain: t`$\left(\dfrac{\partial P}{\partial T}\right)_V = \dfrac{P}{T} = \dfrac{${P0}\ \text{MPa}}{${T0}\ \text{K}} = ${(P0 / T0 * 1000).toFixed(1)}$ kPa/K, so $\Delta P = ${(P0 / T0 * 1000).toFixed(1)}\ \text{kPa/K} \times ${dT}\ \text{K} = ${dP.toFixed(2)}$ MPa. Real helium at 20–30 MPa has a pressure 10–15 % above the ideal-gas value for the same amount, yet at fixed volume its pressure still rises almost exactly in proportion to $T$, so the estimate stands — one reason pressurant tanks carry relief valves and temperature limits.`,
        };
      },
    }),
    mcq({
      id: 'cp-wave', difficulty: 2, transfer: true,
      prompt: t`Far from its source, a weak gravitational wave travelling along $x$ makes each component $h$ of the metric perturbation obey the wave equation $\dfrac{\partial^2 h}{\partial t^2} = c^2\,\dfrac{\partial^2 h}{\partial x^2}$. Which of these solves it?`,
      visual: { type: 'gr-chirp', params: { sliders: false, play: false, readout: false }, caption: t`A gravitational-wave signal and what it does to a detector’s arms. Each strain component satisfies the wave equation far from the source.` },
      choices: [t`$h = A\sin(kx - kct)$`, t`$h = A\,e^{-ct}\sin(kx)$`, t`$h = A\sin(kx)\cos(2kct)$`, t`$h = A(x^2 + ct)$`],
      answer: 0,
      why: {
        1: t`Here $h_{tt} = +c^2h$ but $c^2h_{xx} = -c^2k^2h$: opposite signs. Decay in time with a fixed shape belongs to the heat equation, not the wave equation.`,
        2: t`$h_{tt} = -4k^2c^2 h$ but $c^2 h_{xx} = -k^2c^2 h$: off by a factor of 4. A standing wave works only when the time frequency is $kc$.`,
        3: t`$h_{tt} = 0$ while $c^2h_{xx} = 2Ac^2$: not equal.`,
      },
      hints: [t`Compute $h_{tt}$ and $h_{xx}$ for each and compare $h_{tt}$ with $c^2 h_{xx}$.`],
      teach: 'Any function of x − ct solves the one-dimensional wave equation: it is a shape moving at speed c.',
      explain: t`For $h = A\sin(kx - kct)$: $h_{tt} = -k^2c^2 h$ and $h_{xx} = -k^2 h$, so $h_{tt} = c^2h_{xx}$. ✓ It is a sine wave moving in $+x$ at speed $c$ — in the weak-field limit, gravitational waves travel at the speed of light, as LIGO and the gamma rays from GW170817 confirmed.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 3, §4.3 Partial derivatives', url: 'https://openstax.org/books/calculus-volume-3/pages/4-3-partial-derivatives' }],
});
