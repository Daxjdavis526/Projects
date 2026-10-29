// Repeated and cyclic integration by parts: the tabular method, and the
// integral that comes back around.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { fterm, fpoly, ptext, kx, fgraph } from './_integration.js';

const t = String.raw;

// ∫ x^n e^{kx} dx = e^{kx} Σ_j (−1)^j p^{(j)}(x) / k^{j+1}, p = x^n; returns coefficients by power
function polyExpCoefs(n, k) {
  const c = new Array(n + 1).fill(0);
  let deriv = 1;                              // n!/(n−j)! — the coefficient of x^{n−j} in p^{(j)}
  for (let j = 0; j <= n; j++) {
    c[n - j] = ((-1) ** j * deriv) / k ** (j + 1);
    deriv *= n - j;
  }
  return c;
}

// The polynomial factor and its derivative after each round of parts, drawn together.
function ladder(n) {
  const sup = (k) => (k === 1 ? '' : String(k).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]));
  const colors = ['accent', 'warn', 'good', 'violet', 'teal'];
  const curves = [];
  let c = 1, ymax = 0;
  for (let j = 0; j <= n; j++) {
    const p = n - j;
    curves.push({ fn: p === 0 ? String(c) : `${c}*x^${p}`, color: colors[j % colors.length], label: `${c === 1 ? '' : c}${p === 0 ? '' : 'x' + sup(p)}`, labelAt: 1.5 });
    ymax = Math.max(ymax, c * 1.5 ** p);
    c *= p || 1;
  }
  return {
    type: 'graph', params: { x: [0, 1.75], y: [0, ymax * 1.15], curves },
    caption: `The polynomial factor before the first round and after each round of parts. After ${n} rounds it is the constant ${curves[n].label}, and the integral left over needs no more parts.`,
  };
}

export default lesson({
  id: 'math1220.C2-2.2',
  title: 'Repeated and cyclic integration by parts',
  minutes: 10, difficulty: 3,
  intro: t`One round of integration by parts is sometimes not enough. With a polynomial times an exponential or a sine, each round lowers the polynomial’s degree by one, so you **repeat until the polynomial differentiates to a constant**. Keep the bookkeeping in a table — differentiate down one column, integrate down the other, and alternate the signs:

$$\int f\,g\,dx = f\,g_1 - f'\,g_2 + f''\,g_3 - \cdots$$

When neither factor ever simplifies, as in $e^{x}\sin x$, two rounds bring back the very integral you started with, and you solve for it like an unknown. Those two moves give the response of every damped oscillator and decaying circuit.`,
  symbols: [
    { tex: 'f', text: 'the factor you **differentiate** each round — a polynomial, which reaches zero after finitely many derivatives' },
    { tex: t`f',\ f''`, text: 'its first and second derivatives: the next rows of the “differentiate” column' },
    { tex: 'g', text: 'the factor you **integrate** each round — an exponential, a sine or a cosine' },
    { tex: t`g_1,\ g_2,\ g_3`, text: t`successive antiderivatives: $g_1 = \int g\,dx$, $g_2 = \int g_1\,dx$, $g_3 = \int g_2\,dx$ (no $+C$ until the very end)` },
    { tex: t`+,\ -,\ +`, text: t`the alternating signs: one minus sign from each use of $\int u\,dv = uv - \int v\,du$` },
  ],
  why: t`Each row of the table is one round of $\int u\,dv = uv - \int v\,du$, and the alternating signs are that formula’s minus sign, applied again and again.`,
  visual: {
    type: 'graph',
    title: 'The area under a decaying oscillation',
    lead: t`The blue curve is $f(x) = e^{-ax}\sin(bx)$ — integrating it needs **cyclic** integration by parts. The amber curve is the result you will derive, the running area $A(x) = \int_0^x e^{-at}\sin(bt)\,dt$: it climbs while blue is above the axis and falls while blue is below.`,
    tasks: [
      'Drag T along the axis: the amber point always sits at the shaded (signed) area.',
      'Set the damping a to 0: the area swings for ever and never settles.',
      'Raise a: the area settles sooner, at the dashed level b/(a² + b²).',
    ],
    params: {
      x: [0, 10], y: [-1, 2.2],
      sliders: [
        { key: 'a', label: 'Damping $a$', min: 0, max: 1.5, step: 0.05, value: 0.3, explain: t`How fast the oscillation dies away: its envelope is $e^{-ax}$.` },
        { key: 'b', label: 'Frequency $b$', min: 1, max: 4, step: 0.1, value: 2, explain: t`The sine repeats every $2\pi/b$ along the axis.` },
        { key: 'T', label: 'Upper limit $T$', min: 0, max: 10, step: 0.05, value: 4, explain: t`The integral runs from $0$ to $T$.` },
      ],
      curves: [
        { fn: 'exp(-a*x)*sin(b*x)', color: 'accent', label: 'f(x)', labelAt: 0.55 },
        { fn: '(b - exp(-a*x)*(a*sin(b*x) + b*cos(b*x)))/(a^2 + b^2)', color: 'warn', label: 'A(x)', labelAt: 7.4 },
      ],
      shade: [{ fn: 'exp(-a*x)*sin(b*x)', from: 0, to: 'T', color: 'accent', alpha: 0.28 }],
      vlines: [{ x: 'T' }],
      hlines: [{ y: 'b/(a^2 + b^2)', color: 'warn', label: 'b/(a²+b²)' }],
      points: [{ x: 'T', y: '(b - exp(-a*T)*(a*sin(b*T) + b*cos(b*T)))/(a^2 + b^2)', color: 'warn' }],
      readouts: [
        { label: t`$A(T) = \int_0^T f\,dx$`, expr: '(b - exp(-a*T)*(a*sin(b*T) + b*cos(b*T)))/(a^2 + b^2)' },
        { label: t`limit $\tfrac{b}{a^2+b^2}$`, expr: 'b/(a^2 + b^2)' },
      ],
    },
    caption: t`Both curves are exact. The amber curve is the closed form from cyclic integration by parts, $A(x) = \big[b - e^{-ax}(a\sin bx + b\cos bx)\big]/(a^2+b^2)$, evaluated — not a numerical sum. Shading below the axis counts as negative area.`,
  },
  example: {
    prompt: t`Find $\displaystyle I = \int e^{x}\sin x\,dx$.`,
    steps: [
      { label: 'Round one', text: t`Let $u = \sin x$ and $dv = e^{x}\,dx$, so $du = \cos x\,dx$ and $v = e^{x}$:

$$I = e^{x}\sin x - \int e^{x}\cos x\,dx.$$` },
      { label: 'Round two, same roles', text: t`The new integral is no simpler, so go again with the **same** roles — trig factor as $u$, exponential as $dv$. With $u = \cos x$, $du = -\sin x\,dx$, $v = e^{x}$:

$$\int e^{x}\cos x\,dx = e^{x}\cos x + \int e^{x}\sin x\,dx = e^{x}\cos x + I.$$

Swapping roles here (taking $u = e^{x}$) would simply undo round one.` },
      { label: 'The integral comes back', text: t`Substitute into round one: $I = e^{x}\sin x - e^{x}\cos x - I$. The unknown $I$ now sits on both sides — an equation, not a dead end.` },
      { label: 'Solve for I', text: t`Add $I$ to both sides: $2I = e^{x}(\sin x - \cos x)$, so $I = \tfrac12 e^{x}(\sin x - \cos x) + C$. The $+C$ goes in at the end.` },
      { label: 'Check', text: t`$\dfrac{d}{dx}\Big[\tfrac12 e^{x}(\sin x - \cos x)\Big] = \tfrac12 e^{x}(\sin x - \cos x) + \tfrac12 e^{x}(\cos x + \sin x) = e^{x}\sin x.$ ✓` },
    ],
    answer: t`$\displaystyle\int e^{x}\sin x\,dx = \tfrac12 e^{x}(\sin x - \cos x) + C$`,
  },
  practice: [
    mcq({
      id: 'rounds', difficulty: 1,
      gen(r) {
        const n = r.int(2, 4);
        const g = r.pick([[t`e^{2x}`, 'an exponential'], [t`\sin x`, 'a sine'], [t`\cos 3x`, 'a cosine']]);
        return {
          prompt: t`Taking $u$ to be the polynomial factor every time, how many rounds of integration by parts does $\displaystyle\int x^{${n}}\,${g[0]}\,dx$ need?`,
          choices: [String(n), String(n - 1), String(n + 1), String(2 * n)],
          answer: 0,
          why: {
            1: t`After ${n - 1} round${n - 1 === 1 ? '' : 's'} the polynomial factor still has degree 1, so one more round is needed.`,
            2: t`After ${n} rounds the polynomial has become a constant, so the integral left over is elementary — no further parts.`,
            3: 'Each round lowers the degree by one, not by a half.',
          },
          hints: [t`Each round replaces $u$ by $du/dx$: the degree drops by one.`, t`Count the steps from $x^{${n}}$ down to a constant.`],
          teach: t`A degree-$n$ polynomial times ${g[1]} takes $n$ rounds of integration by parts.`,
          explain: t`Each round differentiates the polynomial once: $x^{${n}}$ becomes a constant after ${n} rounds, and the integral left over needs no more parts.`,
          visual: ladder(n),
        };
      },
    }),
    expr({
      id: 'x2-exp', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, -1, -2, -3]);
        const E = t`e^{${kx(k)}}`, c = polyExpCoefs(2, k);
        return {
          prompt: t`Find $\displaystyle\int x^2 e^{${kx(k)}}\,dx$.`,
          answer: `e^(${kx(k)})*(${ptext(c)})`,
          answerTeX: t`${E}\left(${fpoly(c)}\right)`,
          integrand: `x^2*e^(${kx(k)})`,
          vars: { x: [-1.5, 1.5] }, mode: 'constant',
          errors: [
            { answer: `e^(${kx(k)})*(${ptext([1 / k ** 3, -1 / k ** 2, 1 / k])})`, feedback: t`You dropped a 2: with $u = x^2$, $du = 2x\,dx$, so the second row is $2x$, not $x$.` },
            { answer: `e^(${kx(k)})*(${ptext([2 / k ** 3, 2 / k ** 2, 1 / k])})`, feedback: t`The signs must alternate $+,\,-,\,+$ down the table.` },
          ],
          hints: [
            t`Two rounds: first $u = x^2$, then $u = x$ for the leftover $\int x\,${E}\,dx$.`,
            t`Table: differentiate $x^2 \to 2x \to 2 \to 0$; integrate $${E} \to ${fterm(1 / k, E, true)} \to ${fterm(1 / k ** 2, E, true)} \to ${fterm(1 / k ** 3, E, true)}$.`,
            t`Multiply along the diagonals with signs $+,-,+$: $\;x^2\big(${fterm(1 / k, E, true)}\big) - 2x\big(${fterm(1 / k ** 2, E, true)}\big) + 2\big(${fterm(1 / k ** 3, E, true)}\big)$.`,
          ],
          teach: 'For a polynomial times an exponential, differentiate the polynomial to zero, integrate the exponential each time, and alternate the signs.',
          explain: t`Tabular parts gives $\int x^2${E}\,dx = ${E}\left(${fpoly(c)}\right) + C$. Differentiating it returns $x^2${E}$: the product rule’s extra terms cancel in pairs.`,
          visual: fgraph({ f: `x^2*e^(${kx(k)})`, F: `e^(${kx(k)})*(${ptext(c)})`, x: k > 0 ? [-3 / k, 0.8 / k] : [-0.8 / -k, 3 / -k] }),
        };
      },
    }),
    expr({
      id: 'x2-trig', difficulty: 3,
      gen(r) {
        const k = r.int(1, 3), trig = r.pick(['sin', 'cos']);
        const S = t`\sin(${kx(k)})`, C = t`\cos(${kx(k)})`, s = `sin(${kx(k)})`, c = `cos(${kx(k)})`;
        const isCos = trig === 'cos', Tr = isCos ? t`\cos` : t`\sin`;
        // ∫x² cos kx = x² sin/k + 2x cos/k² − 2 sin/k³ ;  ∫x² sin kx = −x² cos/k + 2x sin/k² + 2 cos/k³
        const answer = isCos
          ? `(1/${k})*x^2*${s} + (2/${k * k})*x*${c} - (2/${k ** 3})*${s}`
          : `-(1/${k})*x^2*${c} + (2/${k * k})*x*${s} + (2/${k ** 3})*${c}`;
        const answerTeX = isCos
          ? `${fterm(1 / k, t`x^{2}${S}`, true)}${fterm(2 / k ** 2, t`x${C}`)}${fterm(-2 / k ** 3, S)}`
          : `${fterm(-1 / k, t`x^{2}${C}`, true)}${fterm(2 / k ** 2, t`x${S}`)}${fterm(2 / k ** 3, C)}`;
        const wrong = isCos
          ? `(1/${k})*x^2*${s} - (2/${k * k})*x*${c} - (2/${k ** 3})*${s}`
          : `-(1/${k})*x^2*${c} - (2/${k * k})*x*${s} + (2/${k ** 3})*${c}`;
        const g1 = isCos ? fterm(1 / k, S, true) : fterm(-1 / k, C, true);
        const g2 = isCos ? fterm(-1 / k ** 2, C, true) : fterm(-1 / k ** 2, S, true);
        const g3 = isCos ? fterm(-1 / k ** 3, S, true) : fterm(1 / k ** 3, C, true);
        return {
          prompt: t`Find $\displaystyle\int x^2 ${Tr}(${kx(k)})\,dx$.`,
          answer, answerTeX,
          integrand: `x^2*${trig}(${kx(k)})`,
          vars: { x: [-2, 2] }, mode: 'constant',
          errors: [{ answer: wrong, feedback: t`Check the middle term’s sign. Two minus signs meet there: one from the table and one from integrating the trig factor.` }],
          hints: [
            t`Use the table: differentiate $x^2 \to 2x \to 2 \to 0$ and integrate $${Tr}(${kx(k)})$ three times.`,
            t`The integrate column is $${g1}$, then $${g2}$, then $${g3}$.`,
            t`Combine with signs $+,-,+$: $\;x^2\big(${g1}\big) - 2x\big(${g2}\big) + 2\big(${g3}\big)$.`,
          ],
          teach: 'With a trig factor the integrate column cycles through sine and cosine, so track two kinds of sign: the table’s and the trig antiderivatives’.',
          explain: t`$\int x^2${Tr}(${kx(k)})\,dx = ${answerTeX} + C$.`,
          solution: t`Check by differentiating: the product rule produces $x^2${Tr}(${kx(k)})$ plus four further terms that cancel in pairs.`,
          visual: fgraph({ f: `x^2*${trig}(${kx(k)})`, F: answer, x: [-2.5, 2.5] }),
        };
      },
    }),
    expr({
      id: 'cyclic-cos', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, -1, -2]), b = r.int(3, 5), D = a * a + b * b;
        const E = t`e^{${kx(a)}}`, C = t`\cos(${kx(b)})`, S = t`\sin(${kx(b)})`;
        // show the side where the envelope decays: about two periods, or until it falls to e^-4
        const span = Math.min((4 * Math.PI) / b, 4 / Math.abs(a));
        const lo = a > 0 ? -span : 0, hi = a > 0 ? 0 : span, top = 1.15;
        return {
          prompt: t`Find $\displaystyle I = \int ${E}\cos(${kx(b)})\,dx$.`,
          answer: `e^(${kx(a)})*((${a})*cos(${kx(b)}) + (${b})*sin(${kx(b)}))/${D}`,
          answerTeX: t`\frac{${E}\left(${fterm(a, C, true)}${fterm(b, S)}\right)}{${D}}`,
          integrand: `e^(${kx(a)})*cos(${kx(b)})`,
          vars: { x: [-1.5, 1.5] }, mode: 'constant',
          errors: [
            { answer: `e^(${kx(a)})*((${a})*cos(${kx(b)}) - (${b})*sin(${kx(b)}))/${D}`, feedback: t`Check the sign of the sine term: in round one the minus sign of $-\int v\,du$ and the one in $du = -${b === 1 ? '' : b}\sin(${kx(b)})\,dx$ cancel, so $\int ${E}\sin(${kx(b)})\,dx$ enters with the sign of $v = ${E}/(${a})$.` },
            { answer: `e^(${kx(a)})*((${a})*cos(${kx(b)}) + (${b})*sin(${kx(b)}))/${a * a}`, feedback: t`That is two rounds with the returning $-\tfrac{${b * b}}{${a * a}}I$ term dropped. Move it to the left-hand side and solve for $I$.` },
          ],
          hints: [
            t`Integrate by parts twice, keeping $${E}$ as $dv$ both times.`,
            t`After two rounds: $I = ${fterm(1 / a, t`${E}${C}`, true)}${fterm(b / a ** 2, t`${E}${S}`)}${fterm(-(b * b) / (a * a), 'I')}$.`,
            t`Collect the $I$ terms: $\tfrac{${D}}{${a * a}}\,I = \dots$, then divide.`,
          ],
          teach: t`When both factors cycle, two rounds return a multiple of the original integral; solve the resulting equation for it.`,
          explain: t`From $I\left(1 + \tfrac{${b * b}}{${a * a}}\right) = \tfrac{1}{${a * a}}${E}\big(${fterm(a, C, true)}${fterm(b, S)}\big)$ you get $I = ${t`\frac{${E}\left(${fterm(a, C, true)}${fterm(b, S)}\right)}{${D}}`} + C$.`,
          visual: {
            type: 'graph',
            params: {
              x: [lo, hi], y: [-top, top],
              curves: [
                { fn: `exp(${a}*x)*cos(${b}*x)`, color: 'accent' },
                { fn: `exp(${a}*x)`, color: 'ink3', dash: true, width: 1.4 },
                { fn: `-exp(${a}*x)`, color: 'ink3', dash: true, width: 1.4 },
              ],
            },
            caption: t`The integrand: a cosine inside an exponential envelope $\pm\, ${E}$ (dashed). Differentiating either factor never makes it simpler — the sign that the integral will come back around.`,
          },
        };
      },
    }),
    mcq({
      id: 'circular', difficulty: 3, kind: 'error',
      prompt: t`A student tries $I = \int e^{x}\sin x\,dx$:

- Round one, $u = \sin x$, $dv = e^{x}dx$: $\;I = e^{x}\sin x - \int e^{x}\cos x\,dx$.
- Round two, $u = e^{x}$, $dv = \cos x\,dx$: $\;\int e^{x}\cos x\,dx = e^{x}\sin x - \int e^{x}\sin x\,dx$.
- So $I = e^{x}\sin x - e^{x}\sin x + I$, that is, $0 = 0$.

What went wrong?`,
      choices: [
        t`Round two swapped the roles ($u = e^{x}$), which undoes round one. Keep the trig factor as $u$ both times.`,
        t`Round one should have used $u = e^{x}$.`,
        t`Nothing — $0 = 0$ shows this integral has no elementary antiderivative.`,
        t`A sign slip: it should read $I = e^{x}\sin x - e^{x}\sin x - I$.`,
      ],
      answer: 0,
      why: {
        1: 'Either choice works for round one. The trouble is changing the choice in round two.',
        2: t`It has one: $\tfrac12e^{x}(\sin x - \cos x) + C$. $\;0 = 0$ only says the method went in a circle.`,
        3: t`Each line shown is correct for the choices made. Forcing that sign would give $I = 0$, which is false.`,
      },
      hints: [t`Compare which factor plays $u$ in round one and in round two.`, t`Round two with $u = e^{x}$ just reverses the step that produced $\int e^{x}\cos x\,dx$.`],
      teach: 'In a cyclic integral, keep the same kind of factor as u in every round, or the second round undoes the first.',
      explain: t`Round two must keep $u$ = the trig factor: $u = \cos x$, $dv = e^{x}dx$ gives $\int e^{x}\cos x\,dx = e^{x}\cos x + I$, and then $2I = e^{x}(\sin x - \cos x)$.`,
      visual: fgraph({ f: 'exp(x)*sin(x)', F: 'exp(x)*(sin(x) - cos(x))/2', x: [-3, 2.4], caption: t`The integrand $e^x\sin x$ (blue) and the antiderivative a correct second round produces, $\tfrac12e^x(\sin x - \cos x)$ (dashed): its slope matches the blue curve everywhere.` }),
    }),
    num({
      id: 'def-x2-exp', difficulty: 2,
      gen(r) {
        const b = r.int(1, 4);
        const F = (x) => -Math.exp(-x) * (x * x + 2 * x + 2);
        const val = F(b) - F(0);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${b}} x^2 e^{-x}\,dx$ to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          integrand: 'x^2*e^(-x)', limits: [0, b],
          errors: [{ value: -val, feedback: 'Subtract in the right order: the value at the upper limit minus the value at the lower limit.' }, { value: F(b), feedback: t`You left out the lower limit: at $x = 0$ the antiderivative is $-2$, not $0$.` }],
          hints: [t`Tabular parts: differentiate $x^2 \to 2x \to 2$, integrate $e^{-x} \to -e^{-x} \to e^{-x} \to -e^{-x}$.`, t`An antiderivative is $-e^{-x}(x^2 + 2x + 2)$. Evaluate it at ${b} and at 0, then subtract.`],
          teach: 'For a definite integral, finish the antiderivative first, then evaluate it at both limits.',
          explain: t`$\Big[-e^{-x}(x^2 + 2x + 2)\Big]_0^{${b}} = -${b * b + 2 * b + 2}e^{-${b}} + 2 = ${fmt(val, 4)}$.`,
          visual: {
            type: 'graph',
            params: { x: [-0.2, 6], y: [-0.08, 0.62], curves: [{ fn: 'x^2*exp(-x)', color: 'accent' }], shade: [{ fn: 'x^2*exp(-x)', from: 0, to: b }], vlines: [{ x: b, label: `x = ${b}` }] },
            caption: t`The shaded area is the integral. The curve peaks at $x = 2$, height $4/e^2 \approx 0.54$; the whole area out to infinity is exactly 2.`,
          },
        };
      },
    }),
    order({
      id: 'cyclic-steps', difficulty: 2,
      prompt: t`Put the steps for $\displaystyle\int e^{2x}\cos x\,dx$ in order.`,
      items: [
        t`Integrate by parts with $u = \cos x$, $dv = e^{2x}\,dx$.`,
        t`Integrate the new $\int e^{2x}\sin x\,dx$ by parts with $u = \sin x$, $dv = e^{2x}\,dx$.`,
        t`Spot the original integral $I$ on the right-hand side.`,
        t`Collect the $I$ terms on one side and divide.`,
        t`Add $+C$ and check by differentiating.`,
      ],
      hints: ['Two rounds of parts come first, with the same roles each time.', 'Only once I reappears can you solve for it.'],
      teach: 'Cyclic integration by parts: two rounds with the same roles, spot I, solve the equation, check.',
      explain: t`Two rounds give $I = \tfrac12e^{2x}\cos x + \tfrac14e^{2x}\sin x - \tfrac14 I$, so $\tfrac54 I = \tfrac14e^{2x}(2\cos x + \sin x)$ and $I = \tfrac15e^{2x}(2\cos x + \sin x) + C$.`,
      visual: fgraph({ f: 'exp(2x)*cos(x)', F: 'exp(2x)*(2cos(x) + sin(x))/5', x: [-3, 1.2] }),
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-x3-exp', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, -1, -2]);
        const E = t`e^{${kx(k)}}`, c = polyExpCoefs(3, k);
        return {
          prompt: t`Find $\displaystyle\int x^3 e^{${kx(k)}}\,dx$.`,
          answer: `e^(${kx(k)})*(${ptext(c)})`,
          answerTeX: t`${E}\left(${fpoly(c)}\right)`,
          integrand: `x^3*e^(${kx(k)})`,
          vars: { x: [-1.5, 1.5] }, mode: 'constant',
          hints: ['Three rounds — use the table.', t`Differentiate $x^3 \to 3x^2 \to 6x \to 6 \to 0$ and integrate $${E}$ four times; signs $+,-,+,-$.`],
          teach: 'A cubic times an exponential needs three rounds; the table keeps them straight.',
          explain: t`$\int x^3${E}\,dx = ${E}\left(${fpoly(c)}\right) + C$.`,
          visual: fgraph({ f: `x^3*e^(${kx(k)})`, F: `e^(${kx(k)})*(${ptext(c)})`, x: k > 0 ? [-4.5 / k, 0.8 / k] : [-0.8 / -k, 4.5 / -k] }),
        };
      },
    }),
    expr({
      id: 'cp-cyclic-sin', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 3, -1, -2, -3]), b = r.int(1, 3), D = a * a + b * b;
        const E = t`e^{${kx(a)}}`, C = t`\cos(${kx(b)})`, S = t`\sin(${kx(b)})`;
        return {
          prompt: t`Find $\displaystyle\int ${E}\sin(${kx(b)})\,dx$.`,
          answer: `e^(${kx(a)})*((${a})*sin(${kx(b)}) - (${b})*cos(${kx(b)}))/${D}`,
          answerTeX: t`\frac{${E}\left(${fterm(a, S, true)}${fterm(-b, C)}\right)}{${D}}`,
          integrand: `e^(${kx(a)})*sin(${kx(b)})`,
          vars: { x: [-1.2, 1.2] }, mode: 'constant',
          hints: [t`Two rounds of parts with $dv = ${E}\,dx$ both times.`, t`Then solve $I\left(1 + \tfrac{${b * b}}{${a * a}}\right) = \dots$ for $I$.`],
          teach: 'Two rounds, the same roles, then solve for the integral that came back.',
          explain: t`$I = ${t`\frac{${E}\left(${fterm(a, S, true)}${fterm(-b, C)}\right)}{${D}}`} + C$.`,
          visual: fgraph({ f: `e^(${kx(a)})*sin(${kx(b)})`, F: `e^(${kx(a)})*((${a})*sin(${kx(b)}) - (${b})*cos(${kx(b)}))/${D}`, x: a > 0 ? [-3, 1] : [-1, 3] }),
        };
      },
    }),
    num({
      id: 'cp-landing-gear', difficulty: 3, transfer: true,
      gen(r) {
        const v0 = r.pick([1.5, 2, 2.5, 3]), g = r.pick([3, 4, 5, 6]), w = r.pick([8, 10, 12, 15]);
        const T = Math.PI / (2 * w);
        const dx = (v0 * (w * Math.exp(-g * T) + g)) / (g * g + w * w);
        return {
          prompt: t`At touchdown a landing-gear strut starts compressing with velocity $v(t) = v_0e^{-\gamma t}\cos(\omega t)$, where $v_0 = ${v0}$ m/s, $\gamma = ${g}\ \text{s}^{-1}$ and $\omega = ${w}$ rad/s (a simple damped-oscillation model). It stops compressing at $t = \pi/(2\omega)$. How far has it compressed by then, to 3 significant figures?`,
          answer: dx, units: 'm', tol: { rel: 0.005 },
          integrand: `${v0}*exp(-${g}*x)*cos(${w}*x)`, limits: [0, T],
          errors: [{ value: v0 * T, feedback: t`That treats the velocity as constant at $v_0$. Integrate $v(t)$ itself.` }],
          hints: [
            t`Distance is $\int_0^{\pi/(2\omega)} v(t)\,dt$ — a cyclic integral of $e^{-\gamma t}\cos\omega t$.`,
            t`An antiderivative of $e^{-\gamma t}\cos\omega t$ is $\dfrac{e^{-\gamma t}\left(-\gamma\cos\omega t + \omega\sin\omega t\right)}{\gamma^2 + \omega^2}$.`,
            t`At $t = \pi/(2\omega)$ the cosine is 0 and the sine is 1; at $t = 0$ it is the reverse.`,
          ],
          teach: 'Displacement is the integral of velocity; a damped oscillation makes it a cyclic integral.',
          explain: t`$\Delta x = v_0\,\dfrac{\omega e^{-\gamma\pi/(2\omega)} + \gamma}{\gamma^2+\omega^2} = ${v0}\times\dfrac{${w}\,e^{-${nice(g * T)}} + ${g}}{${g * g + w * w}} = ${fmt(dx, 3)}$ m, about ${Math.round(dx * 100)} cm.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3 * Math.PI / w], y: [-v0 * 0.6, v0 * 1.1], xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: `${v0}*exp(-${g}*x)*cos(${w}*x)`, color: 'accent' }],
              shade: [{ fn: `${v0}*exp(-${g}*x)*cos(${w}*x)`, from: 0, to: T, color: 'accent', alpha: 0.3 }],
            },
            caption: 'The shaded area is the compression. A linear spring–damper is a teaching model; real oleo struts are strongly non-linear.',
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §3.1', url: 'https://openstax.org/books/calculus-volume-2/pages/3-1-integration-by-parts' }],
});
