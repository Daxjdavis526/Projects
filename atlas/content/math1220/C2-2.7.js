// Partial fractions with repeated linear factors and irreducible quadratics: logs, arctangents, and the Lorentzian.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt, polyTeX } from '../../src/core/format.js';
import { fterm, q as qt } from './_integration.js';

const t = String.raw;
const lin = (r) => (r === 0 ? 'x' : r > 0 ? `x - ${r}` : `x + ${-r}`);
const lnAbs = (r) => t`\ln\lvert ${lin(r)}\rvert`;

export default lesson({
  id: 'math1220.C2-2.7',
  title: 'Partial fractions: repeated and quadratic factors',
  minutes: 12, difficulty: 3,
  intro: t`Two complications remain. A **repeated** linear factor $(x - r)^k$ needs one term for every power up to $k$: $\;\frac{A_1}{x - r} + \frac{A_2}{(x - r)^2} + \cdots + \frac{A_k}{(x - r)^k}$. An **irreducible quadratic** $x^2 + bx + c$ — one with $b^2 < 4c$, so no real roots — needs a linear numerator, $\frac{Bx + C}{x^2 + bx + c}$, and it integrates to a logarithm plus an arctangent, built on

$$\int \frac{dx}{x^2 + a^2} = \frac{1}{a}\arctan\frac{x}{a} + C$$

Complete the square to bring any irreducible quadratic to the form $(x + h)^2 + a^2$. The bump $1/(x^2 + a^2)$ is the **Lorentzian**: the shape of a resonance peak near its centre and of a naturally broadened spectral line.`,
  symbols: [
    { tex: 'a', text: t`a positive constant: the bump $1/(x^2 + a^2)$ falls to half its peak height at $x = \pm a$` },
    { tex: t`x^2 + a^2`, text: 'an irreducible quadratic: it is never zero for real x, so it cannot be split into linear factors' },
    { tex: t`\arctan\frac{x}{a}`, text: t`the angle, between $-\tfrac{\pi}{2}$ and $\tfrac{\pi}{2}$ radians, whose tangent is $x/a$` },
    { tex: t`\frac{1}{a}`, text: t`the chain-rule factor: $\frac{d}{dx}\arctan\frac{x}{a} = \frac{a}{x^2 + a^2}$, so dividing by $a$ leaves $\frac{1}{x^2 + a^2}$` },
  ],
  why: t`Completing the square turns any irreducible quadratic into $(x + h)^2 + a^2$; the substitution $u = x + h$ then gives an arctangent.`,
  visual: {
    type: 'graph',
    title: 'The area under a resonance peak',
    lead: t`The blue curve is the Lorentzian $\dfrac{1}{x^2 + a^2}$; the shaded area runs from $0$ to $X$. The amber curve is its running area, $\tfrac1a\arctan\tfrac{x}{a}$, which climbs towards the dashed level $\tfrac{\pi}{2a}$ and never reaches it.`,
    tasks: [
      'Drag X far to the right: the area creeps up on π/(2a) but never gets there.',
      'Halve a: the peak 1/a² quadruples, the bump narrows, and the total area π/(2a) only doubles.',
      'Set X equal to a: the area is exactly half the limit, because arctan 1 = π/4.',
    ],
    params: {
      x: [-0.5, 10], y: [0, 4.3],
      sliders: [
        { key: 'a', label: 'Half-width $a$', min: 0.5, max: 2, step: 0.05, value: 1, explain: t`At $x = \pm a$ the curve is at half its peak height $1/a^2$.` },
        { key: 'X', label: 'Upper limit $X$', min: 0, max: 10, step: 0.05, value: 2, explain: t`The area is $\int_0^X \frac{dx}{x^2 + a^2}$.` },
      ],
      curves: [
        { fn: '1/(x^2 + a^2)', color: 'accent', label: '1/(x² + a²)', labelAt: 'a' },
        { fn: 'atan(x/a)/a', color: 'warn', domain: [0, 10], label: '(1/a) arctan(x/a)', labelAt: 2.6 },
      ],
      shade: [{ fn: '1/(x^2 + a^2)', from: 0, to: 'X', color: 'accent', alpha: 0.28 }],
      hlines: [{ y: 'pi/(2a)', color: 'warn', label: 'π/(2a)' }],
      vlines: [{ x: 'X' }],
      points: [{ x: 'X', y: 'atan(X/a)/a', color: 'warn' }],
      readouts: [
        { label: t`area $\tfrac1a\arctan\tfrac{X}{a}$`, expr: 'atan(X/a)/a' },
        { label: t`limit $\tfrac{\pi}{2a}$`, expr: 'pi/(2a)' },
        { label: 'fraction of the limit', expr: '2*atan(X/a)/pi' },
      ],
    },
    caption: 'Exact curves; the area readout is the arctangent formula evaluated. The limit as X grows is an improper integral, met properly two lessons on.',
  },
  example: {
    prompt: t`Find $\displaystyle\int \frac{2x^2 - x + 4}{x^3 + 4x}\,dx$.`,
    steps: [
      { label: 'Factor', text: t`$x^3 + 4x = x(x^2 + 4)$, and $x^2 + 4$ is irreducible: it has no real roots.` },
      { label: 'Set up', text: t`One constant over the linear factor, a linear numerator over the quadratic: $$\frac{2x^2 - x + 4}{x(x^2 + 4)} = \frac{A}{x} + \frac{Bx + C}{x^2 + 4}.$$` },
      { label: 'Find the constants', text: t`Cover-up at $x = 0$: $A = \dfrac{4}{4} = 1$. Then $2x^2 - x + 4 = (x^2 + 4) + (Bx + C)\,x$, so $x^2 - x = Bx^2 + Cx$: $\;B = 1$, $C = -1$.` },
      { label: 'Integrate each piece', text: t`$\displaystyle\int\frac{dx}{x} = \ln\lvert x\rvert,\quad \int\frac{x\,dx}{x^2 + 4} = \tfrac12\ln(x^2 + 4),\quad \int\frac{-dx}{x^2 + 4} = -\tfrac12\arctan\tfrac{x}{2}.$` },
      { label: 'Check', text: t`$\dfrac{1}{x} + \dfrac{x}{x^2 + 4} - \dfrac{1}{x^2 + 4} = \dfrac{(x^2 + 4) + x(x - 1)}{x(x^2 + 4)} = \dfrac{2x^2 - x + 4}{x^3 + 4x}$. ✓` },
    ],
    answer: t`$\displaystyle\int \frac{2x^2 - x + 4}{x^3 + 4x}\,dx = \ln\lvert x\rvert + \tfrac12\ln(x^2 + 4) - \tfrac12\arctan\tfrac{x}{2} + C$`,
  },
  practice: [
    mcq({
      id: 'form', difficulty: 1,
      gen(r) {
        const rr = r.pick([1, 2, 3, -1, -2]), c = r.int(1, 3), C2 = c * c;
        const L = lin(rr);
        return {
          prompt: t`Which form fits $\dfrac{P(x)}{(${L})^2(x^2 + ${C2})}$, where $P$ has degree less than 4?`,
          choices: [
            t`$\dfrac{A}{${L}} + \dfrac{B}{(${L})^2} + \dfrac{Cx + D}{x^2 + ${C2}}$`,
            t`$\dfrac{B}{(${L})^2} + \dfrac{Cx + D}{x^2 + ${C2}}$`,
            t`$\dfrac{A}{${L}} + \dfrac{B}{(${L})^2} + \dfrac{C}{x^2 + ${C2}}$`,
            t`$\dfrac{A}{${L}} + \dfrac{B}{x + ${c}} + \dfrac{C}{x - ${c}}$`,
          ],
          answer: 0,
          why: {
            1: t`A repeated factor needs every power: $\dfrac{A}{${L}}$ is missing.`,
            2: 'An irreducible quadratic needs a linear numerator, Cx + D, not just a constant.',
            3: t`$x^2 + ${C2}$ has no real roots; it does not factor as $(x + ${c})(x - ${c})$ — that would be $x^2 - ${C2}$.`,
          },
          hints: ['One term for each power of the repeated factor.', 'Over an irreducible quadratic, the numerator is linear.'],
          teach: 'Repeated factor: a term for every power. Irreducible quadratic: a linear numerator.',
          explain: t`Four unknowns for a degree-4 denominator: $A$ and $B$ for the repeated factor, and $Cx + D$ over $x^2 + ${C2}$.`,
        };
      },
    }),
    expr({
      id: 'arctan', difficulty: 2,
      gen(r) {
        const a = r.int(2, 5), A = a * a;
        return {
          prompt: t`Find $\displaystyle\int \frac{dx}{x^2 + ${A}}$.`,
          answer: `atan(x/${a})/${a}`,
          answerTeX: t`\frac{1}{${a}}\arctan\frac{x}{${a}}`,
          integrand: `1/(x^2 + ${A})`,
          keys: [['arctan', 'arctan(']],
          vars: { x: [-6, 6] }, mode: 'constant',
          errors: [
            { answer: `atan(x/${a})`, feedback: t`Missing the $\tfrac{1}{${a}}$: $\frac{d}{dx}\arctan\frac{x}{${a}} = \frac{${a}}{x^2 + ${A}}$.` },
            { answer: `atan(x)/${A}`, feedback: t`Scale the argument too: substitute $x = ${a}u$, which gives $\tfrac{1}{${a}}\arctan\tfrac{x}{${a}}$.` },
          ],
          hints: [t`Factor out ${A}: $\dfrac{1}{${A}}\cdot\dfrac{1}{(x/${a})^2 + 1}$, then let $u = x/${a}$.`, t`$dx = ${a}\,du$, so the integral is $\tfrac{${a}}{${A}}\int\frac{du}{u^2 + 1} = \tfrac{1}{${a}}\arctan u$.`],
          teach: t`$\int\frac{dx}{x^2 + a^2} = \frac1a\arctan\frac{x}{a}$: scale $x$ by $a$ inside, and divide by $a$ outside.`,
          explain: t`With $u = x/${a}$: $\int\frac{${a}\,du}{${A}(u^2 + 1)} = \tfrac{1}{${a}}\arctan\tfrac{x}{${a}} + C$.`,
          visual: {
            type: 'graph',
            params: { x: [-12, 12], y: [-0.02 / A, 1.25 / A], curves: [{ fn: `1/(x^2 + ${A})`, color: 'accent' }], hlines: [{ y: 0.5 / A, label: 'half height' }], vlines: [{ x: a }, { x: -a }] },
            caption: t`A Lorentzian of half-width ${a}: it falls to half its peak at $x = \pm ${a}$ (dashed).`,
          },
        };
      },
    }),
    expr({
      id: 'complete-square', difficulty: 3,
      gen(r) {
        const h = r.pick([1, 2, 3, -1, -2]), k = r.int(1, 3);
        const c = h * h + k * k;
        const inner = h > 0 ? `x + ${h}` : `x - ${-h}`;
        return {
          prompt: t`Find $\displaystyle\int \frac{dx}{${polyTeX([c, 2 * h, 1])}}$.`,
          answer: `atan((${inner})/${k})/${k}`,
          answerTeX: k === 1 ? t`\arctan(${inner})` : t`\frac{1}{${k}}\arctan\frac{${inner}}{${k}}`,
          integrand: `1/(x^2 + ${2 * h}*x + ${c})`,
          keys: [['arctan', 'arctan(']],
          vars: { x: [-5, 5] }, mode: 'constant',
          errors: k === 1 ? [{ answer: 'atan(x)', feedback: t`Shift as well: the square is $(${inner})^2$, so the argument is $${inner}$.` }] : [{ answer: `atan(x/${k})/${k}`, feedback: t`Shift as well: the square is $(${inner})^2$, so the arctangent’s argument is $(${inner})/${k}$.` }],
          hints: [
            t`Complete the square: $${polyTeX([c, 2 * h, 1])} = (${inner})^2 + ${k * k}$.`,
            t`Let $u = ${inner}$; then $\int\dfrac{du}{u^2 + ${k * k}}$.`,
          ],
          teach: 'Complete the square, shift with u = x + h, and use the arctangent formula.',
          explain: t`$(${inner})^2 + ${k * k}$ with $u = ${inner}$ gives $${k === 1 ? '' : t`\tfrac{1}{${k}}`}\arctan${k === 1 ? `(${inner})` : t`\tfrac{${inner}}{${k}}`} + C$.`,
          visual: {
            type: 'graph',
            params: { x: [-h - 6, -h + 6], y: [-0.03 / (k * k), 1.2 / (k * k)], curves: [{ fn: `1/(x^2 + ${2 * h}*x + ${c})`, color: 'accent' }], vlines: [{ x: -h, label: `x = ${-h}` }] },
            caption: t`The integrand is a Lorentzian centred at $x = ${-h}$: completing the square finds its centre.`,
          },
        };
      },
    }),
    expr({
      id: 'log-plus-arctan', difficulty: 3,
      gen(r) {
        const a = r.int(1, 3), A = a * a, c = r.intExcept(-3, 3, [0]);
        const atanTeX = a === 1 ? t`\arctan x` : t`\arctan\frac{x}{${a}}`;
        return {
          prompt: t`Find $\displaystyle\int \frac{${polyTeX([c, 1])}}{x^2 + ${A}}\,dx$.`,
          answer: `ln(x^2 + ${A})/2 + ${qt(c / a)}*atan(x/${a})`,
          answerTeX: t`\tfrac12\ln(x^2 + ${A})${fterm(c / a, atanTeX)}`,
          integrand: `(x + ${c})/(x^2 + ${A})`,
          keys: [['arctan', 'arctan(']],
          vars: { x: [-4, 4] }, mode: 'constant',
          errors: [{ answer: `ln(x^2 + ${A}) + ${qt(c / a)}*atan(x/${a})`, feedback: t`With $u = x^2 + ${A}$, $du = 2x\,dx$: the logarithm carries a factor $\tfrac12$.` }],
          hints: [
            t`Split: $\dfrac{x}{x^2 + ${A}} + \dfrac{${c}}{x^2 + ${A}}$.`,
            t`The first piece is a substitution ($u = x^2 + ${A}$); the second is an arctangent.`,
          ],
          teach: 'Over an irreducible quadratic, the x part of the numerator gives a logarithm and the constant part an arctangent.',
          explain: t`$\int\frac{x\,dx}{x^2 + ${A}} = \tfrac12\ln(x^2 + ${A})$ and $\int\frac{${c}\,dx}{x^2 + ${A}} = ${fterm(c / a, atanTeX, true)}$, so the answer is $\tfrac12\ln(x^2 + ${A})${fterm(c / a, atanTeX)} + C$.`,
        };
      },
    }),
    expr({
      id: 'repeated', difficulty: 2,
      gen(r) {
        const rr = r.pick([1, 2, 3, -1, -2]), q = r.intExcept(-4, 4, [-rr]);
        const m = rr + q;                                     // (x + q)/(x − r)² = 1/(x − r) + (r + q)/(x − r)²
        return {
          prompt: t`Find $\displaystyle\int \frac{${polyTeX([q, 1])}}{(${lin(rr)})^2}\,dx$.`,
          answer: `ln(abs(${lin(rr)})) - (${m})/(${lin(rr)})`,
          answerTeX: t`${lnAbs(rr)} ${m > 0 ? '-' : '+'} \frac{${Math.abs(m)}}{${lin(rr)}}`,
          integrand: `(x + ${q})/(${lin(rr)})^2`,
          keys: [['|x|', 'abs(']],
          vars: { x: [rr + 0.5, rr + 4] }, mode: 'constant',
          errors: [{ answer: `ln(abs(${lin(rr)})) + (${m})/(${lin(rr)})`, feedback: t`$\int\frac{dx}{(x - r)^2} = -\frac{1}{x - r}$: there is a minus sign.` }, { answer: `ln(abs(${lin(rr)})) + (${m})*ln(abs(${lin(rr)}))`, feedback: t`The squared term is not a logarithm: $\int (x - r)^{-2}dx = -(x - r)^{-1}$.` }],
          hints: [
            t`Write the numerator in terms of $${lin(rr)}$: $\;${polyTeX([q, 1])} = (${lin(rr)}) ${m > 0 ? '+' : '-'} ${Math.abs(m)}$.`,
            t`So the integrand is $\dfrac{1}{${lin(rr)}} ${m > 0 ? '+' : '-'} \dfrac{${Math.abs(m)}}{(${lin(rr)})^2}$.`,
          ],
          teach: t`Over a repeated factor, $\int\frac{dx}{x - r}$ is a logarithm but $\int\frac{dx}{(x - r)^2} = -\frac{1}{x - r}$ is not.`,
          explain: t`$\dfrac{1}{${lin(rr)}} ${m > 0 ? '+' : '-'} \dfrac{${Math.abs(m)}}{(${lin(rr)})^2}$ integrates to $${lnAbs(rr)} ${m > 0 ? '-' : '+'} \dfrac{${Math.abs(m)}}{${lin(rr)}} + C$.`,
        };
      },
    }),
    expr({
      id: 'x-squared-factor', difficulty: 3,
      gen(r) {
        const s = r.pick([1, 2, -1, -2, 3]);
        // 1/(x²(x − s)) = −(1/s²)/x − (1/s)/x² + (1/s²)/(x − s)
        const A = -1 / (s * s), B = -1 / s, C = 1 / (s * s), lo = Math.max(0, s) + 0.5;
        const invTerm = s > 0 ? t` + \frac{1}{${s === 1 ? '' : s}x}` : t` - \frac{1}{${s === -1 ? '' : -s}x}`;   // −B/x = 1/(s x)
        return {
          prompt: t`Find $\displaystyle\int \frac{dx}{x^2(${lin(s)})}$.`,
          answer: `${qt(A)}*ln(abs(x)) - (${qt(B)})/x + ${qt(C)}*ln(abs(${lin(s)}))`,
          answerTeX: t`${fterm(A, t`\ln\lvert x\rvert`, true)}${invTerm}${fterm(C, lnAbs(s))}`,
          integrand: `1/(x^2*(${lin(s)}))`,
          keys: [['|x|', 'abs(']],
          vars: { x: [lo, lo + 4] }, mode: 'constant',
          errors: [{ answer: `${qt(-1 / s)}*ln(abs(x)) + ${qt(C)}*ln(abs(${lin(s)}))`, feedback: t`The $\frac{B}{x^2}$ term integrates to $-\frac{B}{x}$, not to a logarithm — and you still need the $\frac{A}{x}$ term.` }],
          hints: [
            t`Form: $\dfrac{A}{x} + \dfrac{B}{x^2} + \dfrac{C}{${lin(s)}}$. Cover-up gives $B$ (at $x = 0$) and $C$ (at $x = ${s}$).`,
            t`$B = \dfrac{1}{0 - ${s < 0 ? `(${s})` : s}} = ${t`${B < 0 ? '-' : ''}\tfrac{1}{${Math.abs(s)}}`}$, $\;C = \dfrac{1}{${s * s}}$. For $A$, compare the $\frac1x$ behaviour at large $x$: $A + C = 0$.`,
            t`Integrate: $A\ln\lvert x\rvert - \dfrac{B}{x} + C\ln\lvert ${lin(s)}\rvert$.`,
          ],
          teach: 'Cover-up finds the constants over the highest power and over the other factors; one more condition (large x, or any other x value) gives the rest.',
          explain: t`$A = ${t`${A < 0 ? '-' : ''}\tfrac{1}{${s * s}}`}$, $B = ${t`${B < 0 ? '-' : ''}\tfrac{1}{${Math.abs(s)}}`}$, $C = \tfrac{1}{${s * s}}$, so the integral is $${fterm(A, t`\ln\lvert x\rvert`, true)}${invTerm}${fterm(C, lnAbs(s))} + C'$.`,
        };
      },
    }),
    num({
      id: 'definite', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), A = a * a, [m, ang, mTeX] = r.pick([[1, Math.PI / 4, ''], [Math.sqrt(3), Math.PI / 3, t`\sqrt3`]]);
        const b = a * m, val = ang / a;
        const bTeX = m === 1 ? String(a) : a === 1 ? t`\sqrt3` : t`${a}\sqrt3`;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${bTeX}} \frac{dx}{x^2 + ${A}}$ to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          integrand: `1/(x^2 + ${A})`, limits: [0, b],
          errors: [{ value: ang, feedback: t`Keep the factor $\tfrac{1}{${a}}$ in front of the arctangent.` }].filter(() => a !== 1),
          hints: [t`An antiderivative is $\tfrac{1}{${a}}\arctan\tfrac{x}{${a}}$.`, t`At the upper limit $\tfrac{x}{${a}} = ${mTeX || 1}$, and $\arctan ${mTeX || 1} = ${m === 1 ? t`\tfrac{\pi}{4}` : t`\tfrac{\pi}{3}`}$.`],
          teach: 'Evaluate the arctangent antiderivative at the limits; special angles give exact answers.',
          explain: t`$\tfrac{1}{${a}}\Big[\arctan\tfrac{x}{${a}}\Big]_0^{${bTeX}} = \tfrac{1}{${a}}\cdot${m === 1 ? t`\tfrac{\pi}{4}` : t`\tfrac{\pi}{3}`} = ${fmt(val, 4)}$.`,
          visual: {
            type: 'graph',
            params: { x: [-1, 8], y: [0, 1.15 / A], curves: [{ fn: `1/(x^2 + ${A})`, color: 'accent' }], shade: [{ fn: `1/(x^2 + ${A})`, from: 0, to: b }] },
            caption: 'The shaded area is the integral.',
          },
        };
      },
    }),
    mcq({
      id: 'constant-numerator', difficulty: 3, kind: 'error',
      prompt: t`A student sets up $\displaystyle\frac{x^2 + 2}{(x - 1)(x^2 + 1)} = \frac{A}{x - 1} + \frac{B}{x^2 + 1}$ and finds no values of $A$ and $B$ that work. What is wrong?`,
      choices: [
        t`The quadratic term needs a linear numerator: $\dfrac{Bx + C}{x^2 + 1}$.`,
        t`$x^2 + 1$ should be factored as $(x - 1)(x + 1)$ first.`,
        'The numerator’s degree is too high, so they must divide first.',
        t`$\dfrac{A}{x - 1}$ needs a partner $\dfrac{A_2}{(x - 1)^2}$.`,
      ],
      answer: 0,
      why: {
        1: t`$x^2 + 1$ has no real roots; $(x - 1)(x + 1)$ is $x^2 - 1$.`,
        2: 'The numerator has degree 2 and the denominator degree 3: no division is needed.',
        3: t`$(x - 1)$ appears only once, so one term is enough.`,
      },
      hints: ['Count unknowns: the denominator has degree 3, so you need 3 constants.', 'What numerator goes over an irreducible quadratic?'],
      teach: 'An irreducible quadratic factor always gets a linear numerator — one constant too few makes the system unsolvable.',
      explain: t`With $\dfrac{A}{x - 1} + \dfrac{Bx + C}{x^2 + 1}$: cover-up gives $A = \tfrac32$, and matching coefficients gives $B = -\tfrac12$, $C = -\tfrac12$.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-x-quadratic', difficulty: 3,
      gen(r) {
        const a = r.int(1, 3), A = a * a;
        return {
          prompt: t`Find $\displaystyle\int \frac{dx}{x^3 + ${A === 1 ? '' : A}x}$ for $x > 0$.`,
          answer: `ln(x)/${A} - ln(x^2 + ${A})/${2 * A}`,
          answerTeX: t`\frac{1}{${A}}\ln x - \frac{1}{${2 * A}}\ln(x^2 + ${A})`,
          integrand: `1/(x^3 + ${A}*x)`,
          keys: [['|x|', 'abs(']],
          vars: { x: [0.3, 5] }, mode: 'constant',
          hints: [t`$x^3 + ${A === 1 ? '' : A}x = x(x^2 + ${A})$: set up $\dfrac{A}{x} + \dfrac{Bx + C}{x^2 + ${A}}$.`, t`Cover-up gives $A = \tfrac{1}{${A}}$; matching coefficients gives $B = -\tfrac{1}{${A}}$, $C = 0$.`],
          teach: 'Factor out x, give the quadratic a linear numerator, then log plus log.',
          explain: t`$\dfrac{1}{x(x^2 + ${A})} = \dfrac{1}{${A}}\left(\dfrac{1}{x} - \dfrac{x}{x^2 + ${A}}\right)$, which integrates to $\tfrac{1}{${A}}\ln x - \tfrac{1}{${2 * A}}\ln(x^2 + ${A}) + C$.`,
        };
      },
    }),
    expr({
      id: 'cp-repeated', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4);
        return {
          prompt: t`Find $\displaystyle\int \frac{x}{(x + ${a})^2}\,dx$ for $x > ${-a}$.`,
          answer: `ln(abs(x + ${a})) + ${a}/(x + ${a})`,
          answerTeX: t`\ln\lvert x + ${a}\rvert + \frac{${a}}{x + ${a}}`,
          integrand: `x/(x + ${a})^2`,
          keys: [['|x|', 'abs(']],
          vars: { x: [-a + 0.5, -a + 4] }, mode: 'constant',
          hints: [t`$x = (x + ${a}) - ${a}$, so $\dfrac{x}{(x + ${a})^2} = \dfrac{1}{x + ${a}} - \dfrac{${a}}{(x + ${a})^2}$.`],
          teach: 'Rewrite the numerator in powers of the repeated factor.',
          explain: t`$\int\frac{dx}{x + ${a}} - ${a}\int\frac{dx}{(x + ${a})^2} = \ln\lvert x + ${a}\rvert + \frac{${a}}{x + ${a}} + C$.`,
        };
      },
    }),
    num({
      id: 'cp-resonance', difficulty: 3, transfer: true,
      gen(r) {
        const [k, kTeX] = r.pick([[0.5, t`\tfrac12`], [1, '1'], [2, '2'], [3, '3']]);
        const frac = (2 / Math.PI) * Math.atan(k);
        return {
          prompt: t`Engine vibration excites a structural mode of a launch vehicle. Near resonance, the power the mode absorbs at drive frequency $\omega$ is close to the Lorentzian $P(\omega) = \dfrac{P_{\max}\gamma^2}{(\omega - \omega_0)^2 + \gamma^2}$, where $\omega_0$ is the resonant frequency and $\gamma$ is the half-width of the peak, set by the damping. The area under the whole curve is $\pi P_{\max}\gamma$. What fraction of that area lies within $\omega_0 \pm ${kTeX === '1' ? '' : kTeX}\gamma$? Give a decimal to 3 significant figures.`,
          answer: frac, tol: { rel: 0.005 },
          integrand: '1/(pi*(x^2 + 1))', limits: [-k, k],
          errors: [{ value: frac / 2, feedback: t`That is one side only. The band runs from $-${kTeX === '1' ? '' : kTeX}\gamma$ to $+${kTeX === '1' ? '' : kTeX}\gamma$ around $\omega_0$.` }],
          hints: [
            t`Substitute $u = \omega - \omega_0$: the area in the band is $P_{\max}\gamma^2\displaystyle\int_{-${kTeX === '1' ? '' : kTeX}\gamma}^{${kTeX === '1' ? '' : kTeX}\gamma}\frac{du}{u^2 + \gamma^2}$.`,
            t`That equals $2P_{\max}\gamma\arctan(${kTeX})$; divide by $\pi P_{\max}\gamma$.`,
          ],
          teach: t`The Lorentzian’s area out to $\pm k\gamma$ is $\tfrac{2}{\pi}\arctan k$ of the whole — exactly half within one half-width.`,
          explain: t`$\dfrac{2P_{\max}\gamma\arctan(${kTeX})}{\pi P_{\max}\gamma} = \dfrac{2}{\pi}\arctan(${kTeX}) = ${fmt(frac, 3)}$. The Lorentzian’s long tails hold a surprising share of the area.`,
          visual: {
            type: 'graph',
            params: { x: [-6, 6], y: [0, 1.15], xlabel: '(ω − ω₀)/γ', ylabel: 'P/Pmax', curves: [{ fn: '1/(x^2 + 1)', color: 'accent' }], shade: [{ fn: '1/(x^2 + 1)', from: -k, to: k }] },
            caption: 'The band around resonance is shaded. The Lorentzian is an approximation valid near the peak of a lightly damped mode.',
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §3.4', url: 'https://openstax.org/books/calculus-volume-2/pages/3-4-partial-fractions' }],
});
