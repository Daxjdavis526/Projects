// Solving initial-value problems with the Laplace transform: L{y′} = sY − y(0)
// and L{y″} = s²Y − s y(0) − y′(0) carry the initial values in; transform,
// solve for Y(s) by algebra, split Y into partial fractions — distinct, complex
// (complete the square) and repeated factors — and read each term back from
// the table. Every pole of Y(s) is one term of y(t): the characteristic roots
// give the free modes, the forcing's poles give the steady part. SymPy does
// the bookkeeping for a gimbal servo; a lander's strut is the transfer.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { co, sg, lead } from './_second.js';
import { fpic, splane, swin, initPic, lab } from './_laplace.js';

const t = String.raw;

// the Explore: y″ + 3y′ + 2y = F from y(0) = y0, y′(0) = v0, as the sum of its partial-fraction terms
const TA = 'F/2', TB = '(2*y0 + v0 - F)*exp(-x)', TC = '(F/2 - y0 - v0)*exp(-2x)';

export default lesson({
  id: 'math2280.DE-6.2',
  title: 'Solving initial-value problems',
  minutes: 14, difficulty: 3,
  intro: t`Integrate by parts, and the transform of a derivative turns into a multiplication by $s$ — with the starting values left over:

$$\mathcal{L}\{y'\} = sY(s) - y(0), \qquad \mathcal{L}\{y''\} = s^2\,Y(s) - s\,y(0) - y'(0)$$

So a linear equation with constant coefficients becomes an **algebraic** equation for $Y(s)$, the initial values already inside it. The method has four steps: **transform** the equation, **solve** for $Y(s)$, split $Y$ into **partial fractions**, and **invert** each fraction from the table. No constants are left to fit at the end: the initial conditions went in at the start. And the partial fractions are not just bookkeeping — **each pole of $Y(s)$ is one term of $y(t)$**.`,
  symbols: [
    { tex: t`y(t)`, text: t`the unknown, for $t \ge 0$: a position, a charge, an angle` },
    { tex: t`Y(s)`, text: t`its Laplace transform, $\mathcal{L}\{y\}$` },
    { tex: t`y(0),\ y'(0)`, text: 'the initial values: where the system starts, and how fast it is moving' },
    { tex: t`s`, text: t`the transform variable, in $\text{s}^{-1}$; multiplying by $s$ is differentiating, once the starting value is accounted for` },
    { tex: t`s\,y(0) + y'(0)`, text: t`what the initial values contribute to the transformed equation — a second-order equation needs both` },
  ],
  why: t`Circuits, structures and control loops are solved this way in practice: one algebraic step handles the forcing and the initial conditions together, and the partial fractions list the system’s modes one by one.`,
  visual: {
    type: 'graph',
    title: 'One term per pole',
    lead: t`The solid curve solves $y'' + 3y' + 2y = F$ from $y(0) = y_0$, $y'(0) = y_0'$. Transforming gives $Y(s) = \dfrac{y_0s^2 + (y_0' + 3y_0)s + F}{s(s + 1)(s + 2)}$, with poles at $0$, $-1$ and $-2$, and the dashed curves are its three partial fractions, transformed back. Change the starting values and the forcing.`,
    tasks: [
      'Whatever you set, the solution is built from the same three terms — a constant, e⁻ᵗ and e⁻²ᵗ. Only their sizes change.',
      'With F = 0, set y′(0) = −2y(0): the slow e⁻ᵗ term vanishes and the solution dies twice as fast.',
      'Set y(0) = y′(0) = 0 and raise F: the constant F/2 (the pole at s = 0) is where the solution settles — the static deflection.',
    ],
    params: {
      x: [0, 6], y: [-2.6, 3.2], xlabel: 't (s)', ylabel: 'y',
      sliders: [
        { key: 'y0', label: 'Starting value $y(0)$', min: -2, max: 2, step: 0.1, value: 1, explain: 'Where the solution starts.' },
        { key: 'v0', label: 'Starting slope $y\'(0)$', min: -4, max: 4, step: 0.1, value: 0, unit: t`\text{s}^{-1}`, explain: 'How fast it is moving at the start.' },
        { key: 'F', label: 'Constant forcing $F$', min: 0, max: 4, step: 0.1, value: 0, explain: t`The right-hand side, switched on at $t = 0$; it transforms to $F/s$.` },
      ],
      curves: [
        { fn: TA, color: 'gold', dash: true, width: 1.7 },
        { fn: TB, color: 'violet', dash: true, width: 1.7 },
        { fn: TC, color: 'teal', dash: true, width: 1.7 },
        { fn: `${TA} + ${TB} + ${TC}`, color: 'accent', width: 2.8 },
      ],
      legend: [
        { label: 'y(t), the sum', color: 'accent' },
        { label: 'pole 0: the constant F/2', color: 'gold', dash: [6, 5] },
        { label: 'pole −1: a multiple of e⁻ᵗ', color: 'violet', dash: [6, 5] },
        { label: 'pole −2: a multiple of e⁻²ᵗ', color: 'teal', dash: [6, 5] },
      ],
      legendAt: 'tr',
      readouts: [
        { label: 'amount of $e^{-t}$: $\\;2y_0 + y_0\' - F$', expr: '2*y0 + v0 - F', digits: 3 },
        { label: 'amount of $e^{-2t}$: $\\;F/2 - y_0 - y_0\'$', expr: 'F/2 - y0 - v0', digits: 3 },
      ],
    },
    caption: t`Exact solutions, from the partial fractions $\dfrac{F/2}{s} + \dfrac{2y_0 + y_0' - F}{s + 1} + \dfrac{F/2 - y_0 - y_0'}{s + 2}$. The forcing is a constant switched on at $t = 0$.`,
  },
  example: {
    prompt: t`Solve $y'' + 5y' + 6y = 12$ with $y(0) = 1$ and $y'(0) = 0$.`,
    visual: fpic('2 - 3exp(-2x) + 2exp(-3x)', [0, 4], [-3.3, 2.6], t`The solution (blue) and its three terms (dashed): the constant 2 from the forcing, and the two decaying modes from the roots $-2$ and $-3$.`, {
      ylabel: 'y',
      curves: [{ fn: '2', color: 'gold', dash: true, width: 1.6 }, { fn: '-3exp(-2x)', color: 'violet', dash: true, width: 1.6, label: '−3e⁻²ᵗ', labelAt: 0.5, labelDx: 8, labelDy: 12 }, { fn: '2exp(-3x)', color: 'teal', dash: true, width: 1.6, label: '2e⁻³ᵗ', labelAt: 0.45, labelDx: 8, labelDy: -10 }],
    }),
    steps: [
      { label: 'Transform', text: t`Term by term, with $y(0) = 1$, $y'(0) = 0$ and $\mathcal{L}\{12\} = 12/s$: $\;\big[s^2Y - s - 0\big] + 5\big[sY - 1\big] + 6Y = \dfrac{12}{s}$.` },
      { label: 'Solve for Y', text: t`Collect: $(s^2 + 5s + 6)\,Y = s + 5 + \dfrac{12}{s}$, so $\;Y = \dfrac{s^2 + 5s + 12}{s\,(s + 2)(s + 3)}$.` },
      { label: 'Partial fractions', text: t`Write $Y = \dfrac{A}{s} + \dfrac{B}{s + 2} + \dfrac{C}{s + 3}$. **Cover-up:** to find a coefficient, cover its factor in the denominator and put $s$ at that factor’s root.
$A = \dfrac{12}{2\cdot 3} = 2$, $\;B = \dfrac{4 - 10 + 12}{(-2)(1)} = -3$, $\;C = \dfrac{9 - 15 + 12}{(-3)(-1)} = 2$.` },
      { label: 'Invert', text: t`From the table: $y(t) = 2 - 3e^{-2t} + 2e^{-3t}$.` },
      { label: 'Check', text: t`$y(0) = 2 - 3 + 2 = 1$ ✓ and $y'(0) = 6 - 6 = 0$ ✓, with no constants fitted. As $t \to \infty$, $y \to 2 = 12/6$: the static balance $6y = 12$. The pole at $s = 0$ came from the forcing; the poles at $-2$ and $-3$ are the roots of $r^2 + 5r + 6$, the free modes.` },
    ],
    answer: t`$y(t) = 2 - 3e^{-2t} + 2e^{-3t}$.`,
  },
  practice: [
    mcq({
      id: 'derivative-rule', difficulty: 1,
      prompt: t`For a solution with $y(0) = 2$ and $y'(0) = -1$, what is $\mathcal{L}\{y''\}$?`,
      choices: [t`$s^2Y - 2s + 1$`, t`$s^2Y - 2s - 1$`, t`$s^2Y + s - 2$`, t`$s^2Y - 2s$`],
      answer: 0,
      why: {
        1: t`The rule subtracts $y'(0)$, which is $-1$: $\;-(-1) = +1$.`,
        2: t`The $s$ goes with $y(0)$, not with $y'(0)$: $\;s^2Y - s\,y(0) - y'(0)$.`,
        3: t`Both initial values appear in $\mathcal{L}\{y''\}$; this drops $y'(0)$.`,
      },
      hints: [t`$\mathcal{L}\{y''\} = s^2Y - s\,y(0) - y'(0)$.`],
      teach: t`$\mathcal{L}\{y''\} = s^2Y - s\,y(0) - y'(0)$: the starting value is multiplied by $s$, the starting slope is not.`,
      explain: t`$s^2Y - s\cdot 2 - (-1) = s^2Y - 2s + 1$. It comes from integrating by parts twice: $\mathcal{L}\{y''\} = s\,\mathcal{L}\{y'\} - y'(0) = s\big(sY - y(0)\big) - y'(0)$.`,
      visual: initPic(2, -1, t`The initial data: the solution starts at $y = 2$ heading down with slope $-1$. Both numbers enter the transformed equation.`),
    }),
    expr({
      id: 'first-order', difficulty: 2,
      gen(r) {
        const k = r.int(2, 4), q = r.int(1, 3), b = k * q, y0 = r.pick([-2, -1, 0, 4, 5]);
        const d = y0 - q;
        const ans = `${q} + (${d})*e^(-${k}t)`;
        const numT = y0 === 0 ? `${b}` : `${lead(y0, 's')} + ${b}`;
        return {
          prompt: t`Solve $y' + ${k}y = ${b}$ with $y(0) = ${y0}$, using the Laplace transform.`,
          answer: ans, answerTeX: t`${q}${sg(d, `e^{-${k}t}`)}`, lhs: 'y(t)',
          vars: { t: [0, 3] },
          integrand: `${b} - ${k}*(${ans})`,
          errors: [
            ...(y0 !== 0 ? [{ answer: `${q} - ${q}*e^(-${k}t)`, feedback: t`That is the solution from $y(0) = 0$: you dropped the initial value from $\mathcal{L}\{y'\} = sY - y(0)$.` }] : []),
            { answer: `${q} + (${d})*e^(${k}t)`, feedback: t`$\dfrac{1}{s + ${k}}$ is the transform of $e^{-${k}t}$: the sign of the exponent flips.` },
          ],
          hints: [t`Transform: $sY${sg(-y0)} + ${k}Y = \dfrac{${b}}{s}$, so $Y = \dfrac{${numT}}{s(s + ${k})}$.`, t`Cover-up: $\dfrac{A}{s} + \dfrac{B}{s + ${k}}$ with $A = \dfrac{${b}}{${k}} = ${q}$ and $B = \dfrac{${y0 === 0 ? '' : `${y0 < 0 ? `(${y0})` : y0}(-${k}) + `}${b}}{-${k}}$.`],
          teach: t`Transform, solve for $Y$, split into partial fractions, invert — the initial value enters through $\mathcal{L}\{y'\} = sY - y(0)$.`,
          explain: t`$Y = \dfrac{${numT}}{s(s + ${k})} = \dfrac{${q}}{s}${sg(d, `\\dfrac{1}{s + ${k}}`)}$, so $y = ${q}${sg(d, `e^{-${k}t}`)}$. It starts at $${y0}$ and relaxes to the equilibrium $${b}/${k} = ${q}$ with time constant $1/${k}$ s.`,
          visual: { type: 'de-slopefield', params: { f: `${b} - ${k}*y`, x: [0, 2.5], y: [Math.min(y0, q) - 1.5, Math.max(y0, q) + 1.5], aspect: 'wide', grid: [21, 11], click: false, points: [{ x: 0, y: y0, label: `y(0) = ${lab(y0)}`, color: 'gold', labelDx: 10 }] }, caption: t`The slope field of $y' = ${b} - ${k}y$ and the starting point. The solution is the curve through the gold point that follows the field.` },
        };
      },
    }),
    expr({
      id: 'distinct', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[1, 3], [1, 4], [2, 3], [2, 5]]);
        let A = r.intExcept(-3, 3, [0]), B = r.intExcept(-3, 3, [0]);
        if (A === B) B = -B;
        const c1 = A + B, c0 = A * q + B * p;
        const numTeX = c1 === 0 ? `${c0}` : `${lead(c1, 's')}${sg(c0)}`;
        return {
          prompt: t`Find $y(t)$ if $Y(s) = \dfrac{${numTeX}}{s^2 + ${p + q}s + ${p * q}}$.`,
          answer: `${A}*e^(-${p}t) + (${B})*e^(-${q}t)`, answerTeX: t`${lead(A, `e^{-${p}t}`)}${sg(B, `e^{-${q}t}`)}`, lhs: 'y(t)',
          vars: { t: [0, 2] },
          errors: [{ answer: `${B}*e^(-${p}t) + (${A})*e^(-${q}t)`, feedback: t`The coefficients are swapped. By cover-up, the coefficient of $\frac{1}{s + ${p}}$ is the rest of $Y$ evaluated at $s = -${p}$.` }],
          hints: [t`Factor the denominator: $s^2 + ${p + q}s + ${p * q} = (s + ${p})(s + ${q})$.`, t`$Y = \dfrac{A}{s + ${p}} + \dfrac{B}{s + ${q}}$. Cover-up: $A = \dfrac{${c1}(-${p})${sg(c0)}}{-${p} + ${q}}$, and similarly for $B$ at $s = -${q}$.`],
          teach: t`Distinct real poles give a sum of exponentials; cover-up finds each coefficient by evaluating the rest of $Y$ at that pole.`,
          explain: t`$A = \dfrac{${c1 * -p + c0}}{${q - p}} = ${A}$ and $B = \dfrac{${c1 * -q + c0}}{${p - q}} = ${B}$, so $y = ${lead(A, `e^{-${p}t}`)}${sg(B, `e^{-${q}t}`)}$.`,
          visual: splane([[-p, 0, `−${p}`], [-q, 0, `−${q}`]], t`The poles of $Y(s)$: two on the negative real axis, so two decaying exponentials.`, swin([[-p, 0], [-q, 0]])),
        };
      },
    }),
    expr({
      id: 'oscillator', difficulty: 2,
      gen(r) {
        const w = r.int(2, 5), a = r.intExcept(-4, 4, [0]), m = r.intExcept(-2, 3, [0]), b = m * w;
        return {
          prompt: t`Solve $y'' + ${w * w}y = 0$ with $y(0) = ${a}$ and $y'(0) = ${b}$, using the Laplace transform.`,
          answer: `${a}*cos(${w}t) + (${m})*sin(${w}t)`, answerTeX: t`${lead(a, `\\cos ${w}t`)}${sg(m, `\\sin ${w}t`)}`, lhs: 'y(t)',
          vars: { t: [0, 3] },
          errors: [
            { answer: `${a}*cos(${w}t) + (${b})*sin(${w}t)`, feedback: t`$\dfrac{${b}}{s^2 + ${w * w}}$ is $${b}/${w}$ times $\dfrac{${w}}{s^2 + ${w * w}}$: divide the starting slope by $\omega = ${w}$.` },
            { answer: `${b}*cos(${w}t) + (${a})*sin(${w}t)`, feedback: t`The starting value multiplies $s$ — the cosine; the starting slope goes with the sine.` },
          ],
          hints: [t`Transform: $s^2Y - ${a}s - (${b}) + ${w * w}Y = 0$, so $Y = \dfrac{${a}s${sg(b)}}{s^2 + ${w * w}}$.`, t`Split it: $${a}\cdot\dfrac{s}{s^2 + ${w * w}}${sg(m)}\cdot\dfrac{${w}}{s^2 + ${w * w}}$.`],
          teach: t`For $y'' + \omega^2y = 0$ the Laplace transform gives $y = y(0)\cos\omega t + \dfrac{y'(0)}{\omega}\sin\omega t$ directly, initial values included.`,
          explain: t`$Y = \dfrac{${a}s${sg(b)}}{s^2 + ${w * w}}$, so $y = ${lead(a, `\\cos ${w}t`)}${sg(m, `\\sin ${w}t`)}$. Check: $y'(0) = ${w}\times${m < 0 ? `(${m})` : m} = ${b}$ ✓.`,
          visual: initPic(a, b, t`The initial data: the solution starts at $y = ${a}$ with slope $${b}$.`, { T: 1.5 }),
        };
      },
    }),
    expr({
      id: 'complex', difficulty: 3,
      gen(r) {
        const c = r.int(1, 2), w = r.int(2, 4), m = r.pick([-1, 1, 2]), v0 = m * w - c;
        const k1 = 2 * c, k0 = c * c + w * w;
        const wrongCoef = (2 * c + v0) / w;
        return {
          prompt: t`Solve $y'' + ${k1}y' + ${k0}y = 0$ with $y(0) = 1$ and $y'(0) = ${v0}$.`,
          answer: `e^(-${c}t)*(cos(${w}t) + (${m})*sin(${w}t))`, answerTeX: t`e^{-${c === 1 ? '' : c}t}\left(\cos ${w}t${sg(m, `\\sin ${w}t`)}\right)`, lhs: 'y(t)',
          vars: { t: [0, 3] },
          errors: [
            { answer: `e^(-${c}t)*(cos(${w}t) + (${wrongCoef})*sin(${w}t))`, feedback: t`After completing the square the numerator must be written in powers of $(s + ${c})$: $\;s + ${2 * c + v0} = (s + ${c})${sg(c + v0)}$. Only the part $(s + ${c})$ becomes the cosine.` },
            { answer: `cos(${w}t) + (${m})*sin(${w}t)`, feedback: t`The poles sit at $-${c} \pm ${w}i$, not on the imaginary axis: the first shift brings a factor $e^{-${c}t}$.` },
          ],
          hints: [t`$Y = \dfrac{s + ${k1}${sg(v0)}}{s^2 + ${k1}s + ${k0}}$. Complete the square: $s^2 + ${k1}s + ${k0} = (s + ${c})^2 + ${w * w}$.`, t`Write the numerator as $(s + ${c}) + ${c + v0 === 0 ? '0' : c + v0}$. Then $\dfrac{s + ${c}}{(s + ${c})^2 + ${w * w}} \leftarrow e^{-${c}t}\cos ${w}t$ and $\dfrac{${w}}{(s + ${c})^2 + ${w * w}} \leftarrow e^{-${c}t}\sin ${w}t$.`],
          teach: t`Complex poles $-a \pm i\omega$: complete the square, write the numerator in powers of $(s + a)$, and invert with the first shift to $e^{-at}\cos\omega t$ and $e^{-at}\sin\omega t$.`,
          explain: t`$Y = \dfrac{(s + ${c})${sg(c + v0)}}{(s + ${c})^2 + ${w * w}} = \dfrac{s + ${c}}{(s + ${c})^2 + ${w * w}}${sg(m)}\cdot\dfrac{${w}}{(s + ${c})^2 + ${w * w}}$, so $y = e^{-${c === 1 ? '' : c}t}\big(\cos ${w}t${sg(m, `\\sin ${w}t`)}\big)$: a damped oscillation at ${w} rad/s decaying at rate ${c} s⁻¹ — the poles’ imaginary and real parts.`,
          visual: splane([[-c, w, `−${c} + ${w}i`], [-c, -w, `−${c} − ${w}i`]], t`The poles of $Y(s)$: a complex pair. Its real part is the decay rate, its imaginary part the angular frequency.`, swin([[-c, w], [-c, -w]])),
        };
      },
    }),
    expr({
      id: 'repeated', difficulty: 3,
      gen(r) {
        const a = r.int(1, 3), v0 = r.pick([-1, 2, 3, 4].filter((v) => v !== -a));
        return {
          prompt: t`Solve $y'' + ${2 * a}y' + ${a * a}y = 0$ with $y(0) = 1$ and $y'(0) = ${v0}$ — a critically damped system.`,
          answer: `e^(-${a}t) + (${a + v0})*t*e^(-${a}t)`, answerTeX: t`e^{-${co(a)}t}${sg(a + v0, `t\\,e^{-${co(a)}t}`)}`, lhs: 'y(t)',
          vars: { t: [0, 3] },
          errors: [
            { answer: `e^(-${a}t) + (${v0})*t*e^(-${a}t)`, feedback: t`Write the numerator in powers of $(s + ${a})$: $\;s + ${2 * a}${sg(v0)} = (s + ${a}) + ${a + v0}$. The coefficient of $\frac{1}{(s + ${a})^2}$ is $${a + v0}$.` },
            { answer: `e^(-${a}t) + (${a + v0})*e^(-${a}t)`, feedback: t`$\dfrac{1}{(s + ${a})^2}$ comes from $t\,e^{-${a}t}$ (first shift of $\mathcal{L}\{t\} = 1/s^2$), not from $e^{-${a}t}$.` },
          ],
          hints: [t`$Y = \dfrac{s + ${2 * a}${sg(v0)}}{(s + ${a})^2}$: a repeated pole at $-${a}$.`, t`Partial fractions for a repeated factor: $\dfrac{A}{s + ${a}} + \dfrac{B}{(s + ${a})^2}$, and $\mathcal{L}^{-1}\left\{\dfrac{1}{(s + ${a})^2}\right\} = t\,e^{-${a}t}$.`],
          teach: t`A repeated pole $(s + a)^2$ needs two fractions, $\frac{A}{s + a} + \frac{B}{(s + a)^2}$, and the second inverts to $B\,t\,e^{-at}$.`,
          explain: t`$Y = \dfrac{(s + ${a}) + ${a + v0}}{(s + ${a})^2} = \dfrac{1}{s + ${a}} + \dfrac{${a + v0}}{(s + ${a})^2}$, so $y = e^{-${co(a)}t}${sg(a + v0, `t\\,e^{-${co(a)}t}`)}$. The factor $t$ is the trace of a double root — the same $te^{rt}$ the characteristic equation needed.`,
          visual: splane([[-a, 0, `double pole at −${a}`]], t`$Y(s)$ has one pole, counted twice: the denominator is $(s + ${a})^2$.`, swin([[-a, 0]])),
        };
      },
    }),
    code({
      id: 'sympy-gimbal', difficulty: 2,
      prompt: t`A rocket engine’s gimbal servo obeys $\theta'' + 2\theta' + 5\theta = 5\,\theta_\text{cmd}$ (angles in degrees, $t$ in s). It rests at $\theta = 1°$ when the command steps to $\theta_\text{cmd} = 2°$, so $\theta'' + 2\theta' + 5\theta = 10$ with $\theta(0) = 1$, $\theta'(0) = 0$. Let SymPy do the algebra: set \`Ys\` to $\Theta(s)$ (solve the transformed equation for \`Y\`), \`parts\` to its partial fractions (\`sp.apart\`), and \`theta\` to $\theta(t)$ (\`sp.inverse_laplace_transform\`).`,
      starter: t`import sympy as sp
t, s = sp.symbols('t s', positive=True)
Y = sp.symbols('Y')

# the transformed equation, written as  (left side) - (right side)
transformed = (s**2*Y - s*1 - 0) + 2*(s*Y - 1) + 5*Y - 10/s

Ys = None      # solve transformed = 0 for Y
parts = None   # partial fractions of Ys in s
theta = None   # the inverse transform: a function of t

print(parts)
print(theta)
`,
      answer: t`import sympy as sp
t, s = sp.symbols('t s', positive=True)
Y = sp.symbols('Y')

# the transformed equation, written as  (left side) - (right side)
transformed = (s**2*Y - s*1 - 0) + 2*(s*Y - 1) + 5*Y - 10/s

Ys = sp.solve(transformed, Y)[0]
parts = sp.apart(Ys, s)
theta = sp.inverse_laplace_transform(Ys, s, t)

print(parts)
print(sp.simplify(theta))`,
      tests: [
        { name: t`\`Ys\` is $\Theta(s) = \dfrac{s^2 + 2s + 10}{s(s^2 + 2s + 5)}$`, code: 'sp.simplify(Ys - (s**2 + 2*s + 10)/(s*(s**2 + 2*s + 5))) == 0' },
        { name: t`\`parts\` is the same function split into two partial fractions`, code: 'sp.simplify(parts - Ys) == 0 and len(sp.Add.make_args(parts)) == 2' },
        { name: t`\`theta\` gives $\theta(1.5\ \text{s})$ correctly`, code: 'abs(float(theta.subs(t, sp.Rational(3, 2))) - float(2 - sp.exp(-sp.Rational(3, 2))*(sp.cos(3) + sp.sin(3)/2))) < 1e-9' },
        { name: t`\`theta\` settles on the commanded 2°`, code: 'abs(float(sp.limit(theta, t, sp.oo)) - 2) < 1e-12' },
      ],
      hints: [t`\`sp.solve(transformed, Y)\` returns a list of solutions; take \`[0]\`.`, t`\`sp.apart(Ys, s)\` splits in the variable \`s\`; \`sp.inverse_laplace_transform(Ys, s, t)\` inverts. Declaring \`t\` positive lets SymPy drop the step $u(t)$ it would otherwise attach.`],
      teach: 'A computer algebra system runs the same four steps — transform, solve, split, invert — and is the honest check on hand-made partial fractions.',
      explain: t`SymPy gives \`parts\` $= \dfrac{2}{s} - \dfrac{s + 2}{s^2 + 2s + 5}$ and $\theta(t) = 2 - e^{-t}\left(\cos 2t + \tfrac12\sin 2t\right)$: the pole at 0 is the commanded 2°, the pair $-1 \pm 2i$ a decaying wobble with a 3.1 s period. It overshoots to about $2.21°$ at $t = \pi/2$ s before settling.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-step', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4]]), c = r.pick([12, 24]);
        const A = c / (p * q), B = -c / (p * (q - p)), C = c / (q * (q - p));
        return {
          prompt: t`Solve $y'' + ${p + q}y' + ${p * q}y = ${c}$ with $y(0) = 0$ and $y'(0) = 0$.`,
          answer: `${A} + (${B})*e^(-${p}t) + (${C})*e^(-${q}t)`, answerTeX: t`${A}${sg(B, `e^{-${co(p)}t}`)}${sg(C, `e^{-${q}t}`)}`, lhs: 'y(t)',
          vars: { t: [0, 3] },
          errors: [
            { answer: `${A}`, feedback: 'That is only the final, steady value. The solution starts from rest, so the two decaying modes are needed too.' },
            { answer: `(${B})*e^(-${p}t) + (${C})*e^(-${q}t)`, feedback: t`The pole at $s = 0$, from the forcing $${c}/s$, contributes the constant $${A}$.` },
          ],
          hints: [t`$Y = \dfrac{${c}}{s(s + ${p})(s + ${q})}$.`, t`Cover-up at $s = 0$, $-${p}$ and $-${q}$.`],
          teach: t`From rest, only the forcing enters $Y(s)$; its pole at $0$ gives the steady value and the characteristic roots give the transient.`,
          explain: t`$Y = \dfrac{${c}}{s(s + ${p})(s + ${q})} = \dfrac{${A}}{s}${sg(B, `\\dfrac{1}{s + ${p}}`)}${sg(C, `\\dfrac{1}{s + ${q}}`)}$. Check: $y(0) = ${A} ${B < 0 ? '-' : '+'} ${Math.abs(B)} + ${C} = 0$ ✓.`,
          visual: splane([[0, 0, '0'], [-p, 0, `−${p}`], [-q, 0, `−${q}`]], t`The poles of $Y(s)$: one from the constant forcing ($s = 0$) and the two roots of $s^2 + ${p + q}s + ${p * q}$.`, swin([[0, 0], [-q, 0]])),
        };
      },
    }),
    num({
      id: 'cp-strut', difficulty: 3, transfer: true,
      gen(r) {
        const [p, q] = r.pick([[2, 4], [2, 6], [3, 6], [4, 8]]), v0 = r.pick([1.5, 2, 2.5, 3]);
        const ts = Math.log(q / p) / (q - p);
        const xmax = (v0 / (q - p)) * (Math.exp(-p * ts) - Math.exp(-q * ts));
        return {
          prompt: t`A lunar lander touches down at $${v0}$ m/s. Model each leg’s strut, per unit mass, as $x'' + ${p + q}x' + ${p * q}x = 0$ ($x$ the compression in m, $t$ in s), starting with $x(0) = 0$ and $x'(0) = ${v0}$ m/s. Solve with the Laplace transform and find the **largest compression**.`,
          answer: xmax, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: v0 / (q - p), feedback: 'That is the size of each exponential term; the compression is their difference, which is much smaller.' }, { value: v0 * ts, feedback: 'That assumes the strut keeps compressing at the touchdown speed. It slows from the first instant.' }],
          hints: [t`$X(s) = \dfrac{${v0}}{(s + ${p})(s + ${q})}$, so $x(t) = \dfrac{${v0}}{${q - p}}\left(e^{-${p}t} - e^{-${q}t}\right)$.`, t`The compression is largest when $x' = 0$: $${p}e^{-${p}t} = ${q}e^{-${q}t}$, so $t^* = \dfrac{\ln(${q}/${p})}{${q - p}}$.`],
          teach: 'Solve, then find the extreme where the derivative vanishes: the transform gives x(t), calculus gives its peak.',
          explain: t`$x(t) = ${v0 === q - p ? '' : n2(v0 / (q - p))}\left(e^{-${p}t} - e^{-${q}t}\right)$ peaks at $t^* = \ln(${q}/${p})/${q - p} = ${fmt(ts, 3)}$ s, where $x = ${fmt(xmax, 3)}$ m. A linear model: real lander struts crush aluminium honeycomb, which absorbs the energy and does not spring back.`,
          visual: fpic(null, [0, 2], [0, 1.1 * v0 / (q - p)], t`The two terms of $x(t)$ (dashed): $${n2(v0 / (q - p))}\,e^{-${p}t}$ and $${n2(v0 / (q - p))}\,e^{-${q}t}$. The compression is the gap between them.`, {
            ylabel: 'm',
            curves: [{ fn: `${v0 / (q - p)}*exp(-${p}x)`, color: 'violet', dash: true, width: 1.8 }, { fn: `${v0 / (q - p)}*exp(-${q}x)`, color: 'teal', dash: true, width: 1.8 }],
          }),
        };
      },
    }),
    mcq({
      id: 'cp-long-run', difficulty: 2,
      prompt: t`$Y(s) = \dfrac{5(s + 3)}{s\,(s + 1)(s^2 + 4s + 13)}$. What does $y(t)$ do as $t \to \infty$?`,
      choices: ['It settles on the constant 15/13', 'It decays to zero', 'It keeps oscillating with a steady amplitude', 'It grows without bound'],
      answer: 0,
      why: {
        1: t`Every pole but one is in the left half-plane — but the pole at $s = 0$ gives a constant term that never decays.`,
        2: t`The pair from $s^2 + 4s + 13 = (s + 2)^2 + 9$ sits at $-2 \pm 3i$: its oscillation decays like $e^{-2t}$.`,
        3: 'No pole lies in the right half-plane, so nothing grows.',
      },
      hints: ['Find the poles; each is one term of y(t).', t`The pole at $0$ gives a constant: its coefficient is $\lim_{s\to 0} sY(s)$.`],
      teach: t`Poles in the left half-plane give terms that die; a simple pole at $s = 0$ gives a constant, equal to $\lim_{s \to 0} sY(s)$.`,
      explain: t`Poles: $0$, $-1$ and $-2 \pm 3i$. All but $s = 0$ give decaying terms, so $y \to \lim_{s\to0} sY(s) = \dfrac{5\cdot 3}{1\cdot 13} = \dfrac{15}{13}$ — the **final-value theorem**, valid because every other pole is in the left half-plane.`,
      visual: splane([[0, 0, '0'], [-1, 0, '−1'], [-2, 3, '−2 + 3i'], [-2, -3, '−2 − 3i']], t`The four poles of $Y(s)$.`, swin([[0, 0], [-2, 3]])),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §6.2 Transforms of derivatives and ODEs', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Solving IVPs with Laplace transforms', url: 'https://tutorial.math.lamar.edu/Classes/DE/IVPWithLaplace.aspx' },
    { label: 'SymPy documentation: integral transforms', url: 'https://docs.sympy.org/latest/modules/integrals/integrals.html' },
  ],
});

// a number in TeX with at most 4 significant figures
function n2(x) { return nice(+x.toPrecision(4)); }
