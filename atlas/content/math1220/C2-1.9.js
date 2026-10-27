// Hyperbolic functions: definitions, the hyperbola identity, calculus,
// inverses as logarithms, catenaries, drag and rapidity.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;
const g = 9.81;

export default lesson({
  id: 'math1220.C2-1.9',
  title: 'Hyperbolic functions and their calculus',
  minutes: 11, difficulty: 2,
  intro: t`The **hyperbolic functions** are built from $e^x$ and $e^{-x}$:

$$\cosh x = \frac{e^x + e^{-x}}{2}, \qquad \sinh x = \frac{e^x - e^{-x}}{2}, \qquad \tanh x = \frac{\sinh x}{\cosh x}$$

They satisfy $\cosh^2 x - \sinh^2 x = 1$, so the point $(\cosh t, \sinh t)$ runs along the hyperbola $x^2 - y^2 = 1$ just as $(\cos t, \sin t)$ runs around the circle. Their calculus mirrors trigonometry with one sign changed: $(\sinh x)' = \cosh x$ and $(\cosh x)' = +\sinh x$. A hanging cable is a $\cosh$ curve, a body falling against air drag approaches its terminal speed like $\tanh$, and in special relativity a change of velocity is a “hyperbolic rotation”.`,
  symbols: [
    { tex: '\\cosh x', text: 'the hyperbolic cosine, “cosh”: the average of $e^x$ and $e^{-x}$. It is even, and never less than 1' },
    { tex: '\\sinh x', text: 'the hyperbolic sine, “sinch” or “shine”: half the difference of $e^x$ and $e^{-x}$. It is odd, and $\\sinh 0 = 0$' },
    { tex: '\\tanh x', text: 'the hyperbolic tangent, $\\sinh x/\\cosh x$; it climbs from $-1$ to $1$ and never reaches either' },
    { tex: 't', text: 'the **hyperbolic angle**: the shaded sector from the origin out to $(\\cosh t, \\sinh t)$ has area $t/2$, just as a circular sector of angle $t$ does' },
    { tex: 'e^x', text: 'the exponential function; $e \\approx 2.718$' },
  ],
  why: t`Catenary cables and arches, terminal velocity under quadratic drag, and the rapidity of special relativity ($\cosh\varphi = \gamma$) are all hyperbolic — and so are the substitutions that crack integrals like $\int\sqrt{1 + x^2}\,dx$.`,
  visual: {
    type: 'graph',
    title: 'The hyperbola is to cosh and sinh what the circle is to cos and sin',
    lead: t`Blue: the hyperbola $x^2 - y^2 = 1$, traced by $P = (\cosh\varphi, \sinh\varphi)$. Dashed: the unit circle, traced by $Q = (\cos\varphi, \sin\varphi)$. The shaded **hyperbolic sector** runs from the origin out to the arc between $(1, 0)$ and $P$.`,
    tasks: [
      t`Drag $\varphi$: $P$ slides along the hyperbola and the readout $\cosh^2\varphi - \sinh^2\varphi$ stays exactly $1$.`,
      t`The sector’s area is always $\varphi/2$ — the same as a circular sector of angle $\varphi$. That is why $\varphi$ is called a hyperbolic angle.`,
      t`Unlike $Q$, which goes round and round, $P$ never comes back: $\cosh\varphi$ grows like $\tfrac12 e^{\varphi}$.`,
    ],
    params: {
      x: [-1.5, 3.5], y: [-2.7, 2.7], equal: true,
      sliders: [{ key: 'phi', label: 'Hyperbolic angle $\\varphi$', min: -1.6, max: 1.6, step: 0.02, value: 1, explain: t`Negative $\varphi$ mirrors $P$ below the axis, since $\sinh$ is odd.` }],
      curves: [
        { param: ['cosh(t)', 'sinh(t)'], t: [-1.8, 1.8], color: 'accent' },
        { param: ['cos(t)', 'sin(t)'], t: [0, '2*pi'], color: 'ink3', dash: true },
        { param: ['t*cosh(phi)', 't*sinh(phi)'], t: [0, 1], color: 'gold', width: 1.6 },
      ],
      shade: [
        { fn: 'tanh(phi)*x', lower: '0', from: 0, to: 1, color: 'gold', alpha: 0.3 },
        { fn: 'tanh(phi)*x', lower: 'sgn(phi)*sqrt(x^2 - 1)', from: 1, to: 'cosh(phi)', color: 'gold', alpha: 0.3 },
      ],
      points: [
        { x: 'cosh(phi)', y: 'sinh(phi)', color: 'gold', label: 'P' },
        { x: 'cos(phi)', y: 'sin(phi)', color: 'ink2', label: 'Q' },
      ],
      readouts: [
        { label: t`$\cosh\varphi$`, expr: 'cosh(phi)', digits: 4 },
        { label: t`$\sinh\varphi$`, expr: 'sinh(phi)', digits: 4 },
        { label: t`$\cosh^2\varphi - \sinh^2\varphi$`, expr: 'cosh(phi)^2 - sinh(phi)^2', digits: 6 },
        { label: t`sector area $\varphi/2$`, expr: 'abs(phi)/2', digits: 3 },
      ],
    },
    caption: t`The identity readout is computed from $\cosh\varphi$ and $\sinh\varphi$ themselves; the sector area uses the exact result $\varphi/2$ (it can be checked by integrating).`,
  },
  example: {
    prompt: t`A cable hangs in the curve $y = 10\cosh(x/10)$ between supports at $x = -10$ and $x = 10$ (metres). How long is it?`,
    visual: {
      type: 'graph',
      params: { aspect: 'wide', x: [-14, 14], y: [0, 18], xlabel: 'x (m)', curves: [{ fn: '10*cosh(x/10)', color: 'accent', domain: [-10, 10] }, { param: ['20*t - 10', '10*cosh(1)'], t: [0, 1], color: 'ink3', dash: true }], vlines: [{ x: -10, color: 'ink3', label: 'support' }, { x: 10, color: 'ink3', label: 'support' }] },
      caption: 'The catenary between its supports, and the straight 20 m span (dashed).',
    },
    steps: [
      { label: 'Derivative', text: t`$y' = 10\sinh(x/10)\cdot\tfrac{1}{10} = \sinh(x/10)$ — differentiating $\cosh$ gives $+\sinh$.` },
      { label: 'The identity does the work', text: t`$1 + y'^2 = 1 + \sinh^2(x/10) = \cosh^2(x/10)$, so $\sqrt{1 + y'^2} = \cosh(x/10)$ (positive, since $\cosh \ge 1$).` },
      { label: 'Integrate', text: t`$L = \displaystyle\int_{-10}^{10}\cosh(x/10)\,dx = \Big[10\sinh(x/10)\Big]_{-10}^{10} = 20\sinh 1 \approx 23.50$ m.` },
      { label: 'Sense check', text: t`The cable sags $10(\cosh 1 - 1) \approx 5.43$ m. Its length, 23.5 m, lies between the straight span (20 m) and the path down the sag and back up ($20 + 2\times5.43 \approx 30.9$ m).` },
    ],
    answer: t`$L = 20\sinh 1 \approx 23.5$ m`,
  },
  practice: [
    mcq({
      id: 'identity', difficulty: 1,
      prompt: 'Which identity holds for every real x?',
      choices: [t`$\cosh^2 x - \sinh^2 x = 1$`, t`$\cosh^2 x + \sinh^2 x = 1$`, t`$\sinh^2 x - \cosh^2 x = 1$`, t`$\cosh^2 x - \sinh^2 x = \cosh 2x$`],
      answer: 0,
      why: {
        1: t`That is the circle identity for $\cos$ and $\sin$. Since $\cosh x \ge 1$, $\cosh^2 x + \sinh^2 x \ge 1$, with equality only at $x = 0$.`,
        2: t`The sign is flipped: $\sinh^2 x - \cosh^2 x = -1$.`,
        3: t`$\cosh 2x = \cosh^2 x + \sinh^2 x$; the difference is always $1$.`,
      },
      hints: [t`Try $x = 0$: $\cosh 0 = 1$, $\sinh 0 = 0$.`, t`Expand: $\left(\tfrac{e^x + e^{-x}}{2}\right)^2 - \left(\tfrac{e^x - e^{-x}}{2}\right)^2$.`],
      teach: 'cosh² − sinh² = 1: the hyperbolic version of the Pythagorean identity, with a minus sign.',
      explain: t`$\tfrac14\left(e^{2x} + 2 + e^{-2x}\right) - \tfrac14\left(e^{2x} - 2 + e^{-2x}\right) = \tfrac44 = 1$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-2.6, 2.6], y: [-3, 4], curves: [{ fn: 'cosh(x)', color: 'accent', label: 'cosh x', labelAt: 1.75 }, { fn: 'sinh(x)', color: 'warn', label: 'sinh x', labelAt: -2.2 }, { fn: 'tanh(x)', color: 'good', label: 'tanh x', labelAt: 1.9 }] } },
    }),
    num({
      id: 'cosh-ln', difficulty: 1,
      gen(r) {
        const k = r.int(2, 5), val = (k + 1 / k) / 2;
        return {
          prompt: t`Evaluate $\cosh(\ln ${k})$ exactly, from the definition. A fraction or a decimal is fine.`,
          answer: val, tol: { rel: 1e-3 },
          errors: [{ value: (k - 1 / k) / 2, feedback: t`That is $\sinh(\ln ${k})$: $\cosh$ *adds* $e^x$ and $e^{-x}$.` }],
          hints: [t`$e^{\ln ${k}} = ${k}$ and $e^{-\ln ${k}} = \tfrac1{${k}}$.`],
          teach: 'With logarithms inside, the definitions turn hyperbolic functions into ordinary fractions.',
          explain: t`$\cosh(\ln ${k}) = \tfrac12\left(${k} + \tfrac1{${k}}\right) = ${frac(val)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-2.2, 2.2], y: [0, 3.5], curves: [{ fn: 'cosh(x)', color: 'accent' }], points: [{ x: Math.log(k), y: val, color: 'gold', label: `x = ln ${k}` }] } },
        };
      },
    }),
    expr({
      id: 'derivative', difficulty: 2,
      gen(r) {
        const which = r.int(0, 2);
        const cases = [
          { f: t`\ln(\cosh x)`, answer: 'tanh x', tex: t`\tanh x`, errors: [{ answer: '1/cosh x', feedback: t`Chain rule: multiply $\tfrac{1}{\cosh x}$ by the derivative of $\cosh x$, which is $\sinh x$.` }] },
          { f: t`\sinh\left(x^2\right)`, answer: '2x cosh(x^2)', tex: t`2x\cosh\left(x^2\right)`, errors: [{ answer: 'cosh(x^2)', feedback: t`Chain rule: multiply by the derivative of the inside, $2x$.` }, { answer: '-2x cosh(x^2)', feedback: t`No minus sign: $(\sinh u)' = +\cosh u$.` }] },
          { f: t`x\cosh x`, answer: 'cosh x + x sinh x', tex: t`\cosh x + x\sinh x`, errors: [{ answer: 'sinh x', feedback: 'Product rule: (uv)′ = u′v + uv′ — two terms.' }, { answer: 'cosh x - x sinh x', feedback: t`$(\cosh x)' = +\sinh x$ — unlike $(\cos x)' = -\sin x$.` }] },
        ][which];
        return {
          prompt: t`Differentiate $y = ${cases.f}$.`,
          answer: cases.answer, answerTeX: cases.tex,
          vars: { x: [-1.5, 1.5] }, errors: cases.errors,
          hints: [t`$(\sinh x)' = \cosh x$ and $(\cosh x)' = \sinh x$ — no minus signs anywhere.`, 'Use the chain or product rule exactly as with trigonometric functions.'],
          teach: 'Hyperbolic derivatives follow the trig pattern, except that the derivative of cosh is +sinh.',
          explain: t`$\dfrac{d}{dx}\,${cases.f} = ${cases.tex}$.`,
        };
      },
    }),
    expr({
      id: 'integral', difficulty: 2,
      gen(r) {
        const k = r.int(2, 5);
        return {
          prompt: t`Find $\displaystyle\int \sinh(${k}x)\,dx$.`,
          answer: `cosh(${k}x)/${k}`, answerTeX: t`\frac{\cosh(${k}x)}{${k}} + C`,
          vars: { x: [-1.2, 1.2] }, mode: 'constant',
          errors: [
            { answer: `-cosh(${k}x)/${k}`, feedback: t`That is the trig habit, $\int\sin = -\cos$. For hyperbolic functions $\int\sinh u\,du = +\cosh u$.` },
            { answer: `${k}cosh(${k}x)`, feedback: t`Divide by ${k}, don’t multiply: differentiating $\cosh(${k}x)$ produces a factor ${k} that must be cancelled.` },
          ],
          hints: [t`$\dfrac{d}{dx}\cosh(${k}x) = ${k}\sinh(${k}x)$.`],
          teach: 'Integrating sinh gives +cosh (and cosh gives +sinh); a linear inside contributes 1/k.',
          explain: t`$\int\sinh(${k}x)\,dx = \tfrac1{${k}}\cosh(${k}x) + C$. Check: differentiating gives $\sinh(${k}x)$ ✓`,
        };
      },
    }),
    num({
      id: 'arsinh', difficulty: 3,
      gen(r) {
        const [p, q, root] = r.pick([[3, 4, 5], [4, 3, 5], [12, 5, 13], [5, 12, 13]]);
        const k = p / q, y = Math.log(k + root / q);
        return {
          prompt: t`Solve $\sinh y = ${frac(k)}$ for $y$. Give a decimal to 4 significant figures.`,
          answer: y, tol: { rel: 2e-4 },
          errors: [{ value: Math.log(k), feedback: t`$\sinh y$ is not $e^y$: solve $\tfrac{e^y - e^{-y}}{2} = ${frac(k)}$ as a quadratic in $e^y$.` }],
          hints: [
            t`Multiply $\dfrac{e^y - e^{-y}}{2} = ${frac(k)}$ by $2e^y$: $e^{2y} - ${frac(2 * k)}\,e^y - 1 = 0$.`,
            t`That is a quadratic in $u = e^y$. Keep the positive root: $u = ${frac(k)} + \sqrt{\left(${frac(k)}\right)^2 + 1} = ${frac(k + root / q)}$.`,
          ],
          teach: 'Inverse hyperbolic functions are logarithms: arsinh x = ln(x + √(x² + 1)).',
          explain: t`$e^y = ${frac(k)} + \sqrt{${frac(k * k + 1)}} = ${frac(k + root / q)}$, so $y = \ln ${frac(k + root / q)} \approx ${fmt(y, 4)}$. In general $\operatorname{arsinh} x = \ln\left(x + \sqrt{x^2 + 1}\right)$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.5, 2.3], y: [-0.5, 3.5], curves: [{ fn: 'sinh(x)', color: 'accent', label: 'y = sinh x', labelAt: 1.9 }], hlines: [{ y: k, color: 'gold', label: `height ${nice(k)}` }] } },
        };
      },
    }),
    num({
      id: 'rapidity', difficulty: 3,
      gen(r) {
        const [b1, b2] = r.pick([[0.6, 0.6], [0.8, 0.5], [0.5, 0.5], [0.6, 0.8]]);
        const b = (b1 + b2) / (1 + b1 * b2);
        return {
          prompt: t`In special relativity a speed $v$ along a line corresponds to a **rapidity** $\varphi$ with $v/c = \tanh\varphi$, and successive boosts along that line simply **add their rapidities**. A probe moves at $${b1}c$ relative to a station; it launches a sub-probe forward at $${b2}c$ relative to itself. How fast is the sub-probe moving relative to the station, as a fraction of $c$?`,
          answer: b, tol: { rel: 0.002 },
          errors: [{ value: b1 + b2, feedback: t`Speeds do not simply add — that can exceed $c$. Add the rapidities instead, then take $\tanh$.` }],
          hints: [
            t`Total rapidity $\varphi = \operatorname{artanh}(${b1}) + \operatorname{artanh}(${b2})$.`,
            t`$\tanh(\varphi_1 + \varphi_2) = \dfrac{\tanh\varphi_1 + \tanh\varphi_2}{1 + \tanh\varphi_1\tanh\varphi_2}$.`,
          ],
          teach: 'Rapidities add where velocities cannot; tanh turns the sum back into a speed that stays below c.',
          explain: t`$\dfrac{v}{c} = \dfrac{${b1} + ${b2}}{1 + (${b1})(${b2})} = ${fmt(b, 4)}$ — still less than 1, however many boosts you stack.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3.2], y: [0, 1.15], xlabel: 'rapidity φ', ylabel: 'v/c', curves: [{ fn: 'tanh(x)', color: 'accent' }], hlines: [{ y: 1, color: 'bad', label: 'v = c' }], points: [{ x: Math.atanh(b1), y: b1, color: 'gold', label: 'probe' }] } },
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-tanh', difficulty: 2,
      gen(r) {
        const k = r.int(2, 4);
        return {
          prompt: t`Differentiate $y = \tanh(${k}x)$.`,
          answer: `${k}/cosh(${k}x)^2`, answerTeX: t`${k}\operatorname{sech}^2(${k}x)`,
          vars: { x: [-1, 1] },
          errors: [{ answer: `1/cosh(${k}x)^2`, feedback: t`Chain rule: multiply by ${k}.` }],
          hints: [t`$\tanh = \sinh/\cosh$; the quotient rule and $\cosh^2 - \sinh^2 = 1$ give $(\tanh u)' = \dfrac{1}{\cosh^2 u}$.`],
          teach: 'The derivative of tanh u is sech² u = 1/cosh² u, times u′.',
          explain: t`$\dfrac{d}{dx}\tanh(${k}x) = \dfrac{${k}}{\cosh^2(${k}x)} = ${k}\operatorname{sech}^2(${k}x)$.`,
        };
      },
    }),
    num({
      id: 'cp-skydiver', difficulty: 3, transfer: true,
      gen(r) {
        const vT = r.pick([50, 55, 60]), T = r.pick([5, 10, 15]);
        const x = ((vT * vT) / g) * Math.log(Math.cosh((g * T) / vT));
        return {
          prompt: t`With quadratic air drag, a skydiver who jumps from rest has speed $v(t) = ${vT}\tanh\left(\dfrac{9.81\,t}{${vT}}\right)$ m/s, approaching the terminal speed ${vT} m/s. How far does she fall in the first ${T} s? Give 3 significant figures.`,
          answer: x, units: 'm', tol: { rel: 0.005 },
          errors: [
            { value: 0.5 * g * T * T, feedback: t`That is free fall with no drag, $\tfrac12 gt^2$. Drag holds her back.` },
            { value: vT * T, feedback: 'That assumes terminal speed from the start; she begins at rest.' },
          ],
          hints: [t`Distance $= \int_0^{${T}} v(t)\,dt$, and $\int\tanh u\,du = \ln(\cosh u)$ (substitute $w = \cosh u$).`, t`With $u = 9.81t/${vT}$: distance $= \dfrac{${vT}^2}{9.81}\ln\cosh\left(\dfrac{9.81\cdot${T}}{${vT}}\right)$.`],
          teach: 'Integrating tanh gives ln cosh — the distance fallen under quadratic drag.',
          explain: t`$\dfrac{${vT * vT}}{9.81}\ln\cosh(${fmt((g * T) / vT, 4)}) \approx ${fmt(x)}$ m, less than the ${fmt(0.5 * g * T * T)} m of drag-free fall. (The model assumes a constant drag coefficient and air density.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 20], y: [0, vT * 1.25], xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `${vT}*tanh(9.81*x/${vT})`, color: 'accent', label: 'with drag', labelAt: 13 }, { fn: '9.81*x', color: 'ink3', dash: true, label: 'no drag', labelAt: 2.2 }], shade: [{ fn: `${vT}*tanh(9.81*x/${vT})`, from: 0, to: T, color: 'accent', alpha: 0.22 }], hlines: [{ y: vT, color: 'bad', label: 'terminal speed' }] }, caption: 'Speed against time; the shaded area is the distance fallen.' },
        };
      },
    }),
    num({
      id: 'cp-cable-angle', difficulty: 3, transfer: true,
      gen(r) {
        const [a, d] = r.pick([[50, 40], [40, 30], [60, 40]]);
        const ang = (Math.atan(Math.sinh(d / a)) * 180) / Math.PI;
        return {
          prompt: t`A power cable hangs as $y = ${a}\cosh(x/${a})$ m between towers at $x = \pm${d}$ m. At what angle to the horizontal does it meet each tower? Answer in degrees.`,
          answer: ang, units: '°', tol: { rel: 0.005 },
          errors: [{ value: (Math.atan(Math.cosh(d / a)) * 180) / Math.PI, feedback: t`The slope is $y'$, which is $\sinh(x/${a})$, not $\cosh$.` }],
          hints: [t`The slope of the cable is $y' = \sinh(x/${a})$.`, t`At the tower the angle is $\arctan\left(\sinh\tfrac{${d}}{${a}}\right)$.`],
          teach: 'The direction of a curve is set by its derivative: angle = arctan(slope).',
          explain: t`$y'(${d}) = \sinh(${nice(d / a)}) \approx ${fmt(Math.sinh(d / a), 4)}$, so the angle is $\arctan(${fmt(Math.sinh(d / a), 4)}) \approx ${fmt(ang)}^\circ$. The tower must resist the cable’s pull along that direction.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-d * 1.4, d * 1.4], y: [0, a * Math.cosh(d / a) * 1.25], xlabel: 'x (m)', curves: [{ fn: `${a}*cosh(x/${a})`, color: 'accent', domain: [-d, d] }, { param: [`${d} - 18*t`, `${a * Math.cosh(d / a)} - 18*t*${Math.sinh(d / a)}`], t: [0, 1], color: 'gold' }], vlines: [{ x: -d, color: 'ink3', label: 'tower' }, { x: d, color: 'ink3', label: 'tower' }] }, caption: 'The cable and its tangent line at the right-hand tower (gold).' },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §2.9 Calculus of the Hyperbolic Functions', url: 'https://openstax.org/books/calculus-volume-2/pages/2-9-calculus-of-the-hyperbolic-functions' }],
});
