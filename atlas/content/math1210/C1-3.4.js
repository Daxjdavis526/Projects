// Product and quotient rules — why (fg)′ is not f′g′, seen as the growth of
// a rectangle, and the quotient rule that turns a rocket's thrust and
// shrinking mass into its jerk.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac, tex } from '../../src/core/format.js';

const t = String.raw;

// the rectangle of the Explore graph: width f(u) = 1 + 0.5u, height g(u) = 0.5 + 0.3u²
const F0 = '(1 + 0.5*u)', F1 = '(1 + 0.5*(u + h))', G0 = '(0.5 + 0.3*u^2)', G1 = '(0.5 + 0.3*(u + h)^2)';
const rect = (u, h) => ({
  shade: [
    { fn: `${G0}`, from: 0, to: F0, color: 'accent', alpha: 0.28 },
    { fn: `${G0}`, from: F0, to: F1, color: 'gold', alpha: 0.5 },
    { fn: `${G1}`, lower: G0, from: 0, to: F0, color: 'violet', alpha: 0.45 },
    { fn: `${G1}`, lower: G0, from: F0, to: F1, color: 'bad', alpha: 0.6 },
  ],
  constants: u === undefined ? undefined : { u, h },
});

export default lesson({
  id: 'math1210.C1-3.4',
  title: 'Product and quotient rules',
  minutes: 10, difficulty: 2,
  equation: t`(fg)' = f'g + fg'`,
  intro: t`The derivative of a product is **not** the product of the derivatives. Think of $f\cdot g$ as the area of a rectangle with sides $f$ and $g$. When both sides grow a little, the area gains a strip $g\,\Delta f$ along one side, a strip $f\,\Delta g$ along the other, and a tiny corner $\Delta f\,\Delta g$ that vanishes in the limit — hence the **product rule** above. Applying it to $f \cdot (1/g)$ gives the **quotient rule**:

$$\left(\frac{f}{g}\right)' = \frac{f'g - fg'}{g^2}\qquad (g \ne 0)$$

Physics multiplies and divides changing quantities all the time: power is force times velocity, momentum is mass times velocity, and a rocket’s acceleration is thrust divided by a shrinking mass.`,
  symbols: [
    { tex: 'f,\\ g', text: 'two functions of the same variable (say, the two sides of a rectangle, or a force and a velocity)' },
    { tex: "f',\\ g'", text: 'their derivatives' },
    { tex: "f'g", text: 'the change from $f$ moving while $g$ is held — the strip $g\\,\\Delta f$' },
    { tex: "fg'", text: 'the change from $g$ moving while $f$ is held — the strip $f\\,\\Delta g$' },
  ],
  why: t`Every time two changing quantities multiply — $P = Fv$, $p = mv$, $Q = CV$ — the product rule gives how fast the product changes.`,
  visual: {
    type: 'graph',
    title: 'The product rule as a growing rectangle',
    lead: t`The blue rectangle has width $f(u) = 1 + 0.5u$ and height $g(u) = 0.5 + 0.3u^2$; its area is $fg$. Step $u$ forward by $h$: the gold strip is $g\,\Delta f$, the violet strip $f\,\Delta g$, and the red corner $\Delta f\,\Delta g$.`,
    tasks: [
      t`Shrink $h$: the strips shrink like $h$, but the corner shrinks like $h^2$. Its share of the new area falls toward zero.`,
      t`Dividing by $h$ and letting $h \to 0$ leaves exactly two strips: $(fg)' = f'g + fg'$. The corner is why $(fg)' \ne f'g'$ — $f'g'$ would be the corner alone.`,
      t`Move $u$: as the rectangle grows taller, the violet strip ($f\,\Delta g$) takes over, because $g$ grows faster than $f$.`,
    ],
    params: {
      x: [0, 3.3], y: [0, 4.4], aspect: 'wide', xlabel: 'width f', ylabel: 'height g',
      sliders: [
        { key: 'u', label: t`Input $u$`, min: 0.2, max: 2.5, step: 0.05, value: 1.5, explain: t`The variable both sides depend on.` },
        { key: 'h', label: t`Step $h$`, min: 0.02, max: 1, step: 0.01, value: 0.6, explain: t`How far $u$ moves: $\Delta f = f(u + h) - f(u)$ and $\Delta g = g(u + h) - g(u)$.` },
      ],
      ...rect(),
      legend: [{ label: 'f·g (the old area)', color: 'accent' }, { label: 'g·Δf', color: 'gold' }, { label: 'f·Δg', color: 'violet' }, { label: 'Δf·Δg', color: 'bad' }],
      legendAt: 'tl',
      readouts: [
        { label: t`$\Delta(fg)$`, expr: `${F1}*${G1} - ${F0}*${G0}`, digits: 3 },
        { label: t`strips $g\Delta f + f\Delta g$`, expr: `${G0}*(${F1} - ${F0}) + ${F0}*(${G1} - ${G0})`, digits: 3 },
        { label: t`corner $\Delta f\,\Delta g$`, expr: `(${F1} - ${F0})*(${G1} - ${G0})`, digits: 3 },
      ],
    },
    caption: t`The axes measure the two side lengths, not $u$. The shaded regions are exact areas: the three coloured pieces always add up to $\Delta(fg)$.`,
  },
  example: {
    prompt: t`A launcher’s first stage gives a constant thrust $F = 7.6$ MN while burning propellant at $\dot m = 2750$ kg/s from a lift-off mass $m_0 = 549{,}000$ kg, so $m(t) = m_0 - \dot m\,t$. Its vertical acceleration is $a(t) = \dfrac{F}{m(t)} - g$. Find the jerk $da/dt$ at lift-off and at $t = 60$ s.`,
    visual: { type: 'graph', params: { x: [0, 100], y: [0, 0.3], aspect: 'wide', xlabel: 't (s)', ylabel: 'da/dt (m/s³)', curves: [{ fn: '7.6e6*2750/(549000 - 2750*x)^2', color: 'accent' }], points: [{ x: 0, y: 0.0693, color: 'gold' }, { x: 60, y: 0.1417, color: 'gold' }] }, caption: t`The jerk climbs as the stage gets lighter. Constant thrust and vertical flight are simplifications: real thrust rises as the air thins, and engines are throttled near maximum dynamic pressure.` },
    steps: [
      { label: 'Spot the quotient', text: t`$a = \dfrac{F}{m} - g$ with $F$ and $g$ constant; only $m$ changes. The quotient rule with numerator $F$ (derivative $0$): $\dfrac{d}{dt}\dfrac{F}{m} = \dfrac{0\cdot m - F\,m'}{m^2} = -\dfrac{F\,m'}{m^2}$.` },
      { label: 'Insert the mass rate', text: t`$m'(t) = -\dot m$, so $\dfrac{da}{dt} = \dfrac{F\,\dot m}{m^2}$ — positive: the acceleration grows as the rocket lightens.` },
      { label: 'At lift-off', text: t`$\dfrac{(7.6\times10^{6})(2750)}{(5.49\times10^{5})^2} = 0.069\ \text{m/s}^3$. (The acceleration itself is $7.6\times10^6/5.49\times10^5 - 9.81 = 4.0\ \text{m/s}^2$.)` },
      { label: 'At 60 s', text: t`$m = 549{,}000 - 165{,}000 = 384{,}000$ kg, so $\dfrac{da}{dt} = \dfrac{2.09\times10^{10}}{1.475\times10^{11}} = 0.142\ \text{m/s}^3$ — doubled, because $m$ is squared in the denominator.` },
      { label: 'Units', text: t`$\dfrac{\text{N}\cdot\text{kg/s}}{\text{kg}^2} = \dfrac{\text{kg m/s}^2\cdot\text{kg/s}}{\text{kg}^2} = \text{m/s}^3$. ✓` },
    ],
    answer: t`$\dfrac{da}{dt} = \dfrac{F\dot m}{m^2}$: $0.069\ \text{m/s}^3$ at lift-off and $0.142\ \text{m/s}^3$ at $t = 60$ s.`,
  },
  practice: [
    mcq({
      id: 'not-fprime-gprime', difficulty: 1,
      prompt: t`What is $\dfrac{d}{dx}\left[x^2\cdot x^3\right]$?`,
      visual: { type: 'graph', params: { x: [0, 3.3], y: [0, 4.4], aspect: 'wide', xlabel: 'width f', ylabel: 'height g', ...rect(1.5, 0.6) }, caption: t`The growing rectangle again: the change in a product is two strips plus a corner — never “derivative times derivative”.` },
      choices: [t`$5x^4$`, t`$6x^3$`, t`$2x^4$`, t`$3x^4$`],
      answer: 0,
      why: { 1: t`That is $f'g' = (2x)(3x^2)$ — the corner of the rectangle, which vanishes in the limit. The product rule is $f'g + fg'$.`, 2: t`That is only $f'g = 2x\cdot x^3$; the term $fg' = x^2\cdot 3x^2$ is missing.`, 3: t`That is only $fg' = x^2\cdot 3x^2$; the term $f'g = 2x\cdot x^3$ is missing.` },
      hints: [t`Product rule: $f'g + fg'$ with $f = x^2$, $g = x^3$.`, t`Check: $x^2\cdot x^3 = x^5$, whose derivative you know.`],
      teach: t`$(fg)' = f'g + fg'$, never $f'g'$.`,
      explain: t`$2x\cdot x^3 + x^2\cdot 3x^2 = 2x^4 + 3x^4 = 5x^4$, which matches $\frac{d}{dx}x^5$.`,
    }),
    expr({
      id: 'product', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), b = r.intExcept(-5, 5, [0]), c = r.int(2, 5), d = r.intExcept(-6, 6, [0]);
        const fT = t`(${a === 1 ? '' : a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)})(${c}x ${d < 0 ? '+' : '-'} ${Math.abs(d)})`;
        return {
          prompt: t`Use the product rule to differentiate $y = ${fT}$.`,
          lhs: "y'",
          answer: `${2 * a}x(${c}x - (${d})) + (${a}x^2 + (${b}))*${c}`,
          answerTeX: t`${2 * a}x(${c}x ${d < 0 ? '+' : '-'} ${Math.abs(d)}) + ${c}(${a === 1 ? '' : a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)})`,
          vars: { x: [-2, 2] }, derivativeOf: `(${a}x^2 + (${b}))(${c}x - (${d}))`,
          errors: [{ answer: `${2 * a * c}x`, feedback: t`That is $f'g'$. The product rule keeps one factor whole in each term: $f'g + fg'$.` }, { answer: `${2 * a}x(${c}x - (${d}))`, feedback: t`Only the $f'g$ term: add $f g' = (${a === 1 ? '' : a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)})\cdot ${c}$.` }],
          hints: [t`$f = ${a === 1 ? '' : a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}$, $f' = ${2 * a}x$; $g = ${c}x ${d < 0 ? '+' : '-'} ${Math.abs(d)}$, $g' = ${c}$.`],
          teach: t`Product rule: differentiate one factor at a time, keep the other, and add.`,
          explain: t`$y' = ${2 * a}x(${c}x ${d < 0 ? '+' : '-'} ${Math.abs(d)}) + ${c}(${a === 1 ? '' : a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)})$, which expands to $${3 * a * c}x^2 - ${2 * a * d}x + ${b * c}$ (simplified or not, both are right).`.replace(/- -/g, '+ ').replace(/\+ -/g, '- '),
          visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [-40, 40], aspect: 'wide', curves: [{ fn: `(${a}*x^2 + (${b}))*(${c}*x - (${d}))`, color: 'accent' }] }, caption: t`$y$ as a function of $x$: a cubic, so expect a quadratic derivative.` },
        };
      },
    }),
    expr({
      id: 'quotient', difficulty: 2,
      gen(r) {
        const a = r.int(1, 5), b = r.intExcept(-5, 5, [0]), c = r.int(1, 6);
        return {
          prompt: t`Use the quotient rule to differentiate $y = \dfrac{${a === 1 ? '' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}}{x^2 + ${c}}$.`,
          lhs: "y'",
          answer: `(${a}(x^2 + ${c}) - (${a}x + (${b}))*2x)/(x^2 + ${c})^2`,
          answerTeX: t`\frac{${a}(x^2 + ${c}) - 2x(${a === 1 ? '' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)})}{(x^2 + ${c})^2}`,
          vars: { x: [-2, 2] }, derivativeOf: `(${a}x + (${b}))/(x^2 + ${c})`,
          errors: [
            { answer: `((${a}x + (${b}))*2x - ${a}(x^2 + ${c}))/(x^2 + ${c})^2`, feedback: t`The numerator is $f'g - fg'$, in that order: “low d-high minus high d-low”. Swapping the terms flips the sign.` },
            { answer: `(${a}(x^2 + ${c}) - (${a}x + (${b}))*2x)/(x^2 + ${c})`, feedback: t`The denominator is $g^2$, not $g$.` },
            { answer: `${a}/(2x)`, feedback: t`That is $f'/g'$. A quotient is not differentiated piece by piece.` },
          ],
          hints: [t`$f = ${a === 1 ? '' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$, $f' = ${a}$; $g = x^2 + ${c}$, $g' = 2x$.`, t`$y' = \dfrac{f'g - fg'}{g^2}$.`],
          teach: t`Quotient rule: $\left(\frac fg\right)' = \frac{f'g - fg'}{g^2}$ — the order in the numerator matters.`,
          explain: t`$y' = \dfrac{${a}(x^2 + ${c}) - 2x(${a === 1 ? '' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)})}{(x^2 + ${c})^2}$.`,
          visual: { type: 'graph', params: { x: [-6, 6], y: [-3, 3], aspect: 'wide', curves: [{ fn: `(${a}*x + (${b}))/(x^2 + ${c})`, color: 'accent' }] }, caption: t`$y$ against $x$: the denominator never vanishes, so $y$ is smooth everywhere.` },
        };
      },
    }),
    num({
      id: 'power-fv', difficulty: 2,
      gen(r) {
        const T0 = r.pick([800, 1000, 1200]), k = r.pick([20, 25, 40]), v0 = r.pick([0.5, 1, 1.5]), acc = r.pick([0.2, 0.3, 0.5]), tt = r.pick([2, 4, 5]);
        const T = T0 - k * tt, v = v0 + acc * tt;
        const ans = -k * v + T * acc;
        return {
          prompt: t`A winch hauls a load up a slope. The cable tension is $T(t) = ${T0} - ${k}t$ newtons and the load’s speed is $v(t) = ${v0} + ${acc}t$ m/s. The winch delivers power $P = Tv$. How fast is that power changing at $t = ${tt}$ s?`,
          answer: ans, units: 'W/s', tol: { rel: 0.003 },
          errors: [{ value: -k * acc, feedback: t`That is $T'v'$. The product rule gives $T'v + Tv'$.` }, { value: T * acc, feedback: t`You kept only $Tv'$; the tension is also changing, which adds $T'v$.` }],
          hints: [t`$P'(t) = T'(t)v(t) + T(t)v'(t)$.`, t`At $t = ${tt}$: $T = ${T}$ N, $T' = -${k}$ N/s, $v = ${nice(v)}$ m/s, $v' = ${acc}\ \text{m/s}^2$.`],
          teach: 'For a product of two changing quantities, each one’s change contributes, weighted by the other’s current value.',
          explain: t`$P' = (-${k})(${nice(v)}) + (${T})(${acc}) = ${nice(-k * v)} + ${nice(T * acc)} = ${nice(ans)}$ W/s.`,
          visual: { type: 'graph', params: { x: [0, 8], y: [0, 1.2 * Math.max(...[0, 2, 4, 6, 8].map((s) => (T0 - k * s) * (v0 + acc * s)))], aspect: 'wide', xlabel: 't (s)', ylabel: 'P (W)', curves: [{ fn: `(${T0} - ${k}*x)*(${v0} + ${acc}*x)`, color: 'accent' }], points: [{ x: tt, y: T * v, color: 'gold' }] }, caption: 'The winch’s power output over the haul (an illustrative profile; friction is not modelled).' },
        };
      },
    }),
    num({
      id: 'parallel', difficulty: 3,
      gen(r) {
        const R1 = r.pick([10, 22, 47, 68]), R2 = r.pick([33, 47, 100, 150]);
        const ans = (R2 / (R1 + R2)) ** 2;
        return {
          prompt: t`Two resistors in parallel have combined resistance $R = \dfrac{R_1R_2}{R_1 + R_2}$. With $R_2 = ${R2}\ \Omega$ fixed, find $\dfrac{dR}{dR_1}$ at $R_1 = ${R1}\ \Omega$.`,
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: R2 / (R1 + R2), feedback: t`Close — but the quotient rule puts $(R_1 + R_2)^2$ underneath: $\frac{R_2(R_1 + R_2) - R_1R_2}{(R_1 + R_2)^2}$.` }, { value: 1, feedback: t`$R$ is not $R_1$ plus a constant; it is a quotient. Use the quotient rule with $R_2$ held constant.` }],
          hints: [t`Treat $R_2$ as a constant: $f = R_2R_1$ ($f' = R_2$), $g = R_1 + R_2$ ($g' = 1$).`, t`$\dfrac{dR}{dR_1} = \dfrac{R_2(R_1 + R_2) - R_1R_2}{(R_1 + R_2)^2} = \dfrac{R_2^2}{(R_1 + R_2)^2}$.`],
          teach: 'With other quantities held constant, the quotient rule works on any variable — here a resistance.',
          explain: t`$\dfrac{dR}{dR_1} = \left(\dfrac{${R2}}{${R1 + R2}}\right)^2 = ${fmt(ans)}$ (ohms per ohm, dimensionless): a $1\ \Omega$ change in $R_1$ shifts $R$ by about $${fmt(ans, 2)}\ \Omega$.`,
          visual: { type: 'graph', params: { x: [0, 200], y: [0, R2 * 1.05], aspect: 'wide', xlabel: 'R₁ (Ω)', ylabel: 'R (Ω)', curves: [{ fn: `x*${R2}/(x + ${R2})`, color: 'accent' }], hlines: [{ y: R2, label: 'R₂', color: 'ink3' }], points: [{ x: R1, y: R1 * R2 / (R1 + R2), color: 'gold' }] }, caption: t`The parallel combination never exceeds $R_2$, however large $R_1$ becomes.` },
        };
      },
    }),
    mcq({
      id: 'quotient-error', difficulty: 3, kind: 'error',
      prompt: t`A student differentiates $y = \dfrac{x^2}{x + 1}$ and writes $y' = \dfrac{x^2\cdot 1 - 2x(x + 1)}{(x + 1)^2}$. What is wrong?`,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 3.5], aspect: 'wide', curves: [{ fn: 'x^2/(x + 1)', color: 'accent' }] }, caption: t`$y = \frac{x^2}{x+1}$ for $x \ge 0$: it rises, so $y'$ must be positive there. The student’s formula gives $-\tfrac34$ at $x = 1$.` },
      choices: [t`The numerator is in the wrong order: it should be $2x(x + 1) - x^2\cdot 1$`, t`The denominator should be $x + 1$, not squared`, t`It should be $\dfrac{2x}{1}$, the ratio of the derivatives`, 'Nothing: it is correct'],
      answer: 0,
      why: { 1: t`The quotient rule really does square the denominator; the slip is in the numerator.`, 2: t`$f'/g'$ is not the derivative of $f/g$ — that would give $2x$, the wrong slope everywhere.`, 3: t`At $x = 1$ it gives $\frac{1 - 4}{4} < 0$, but the graph is rising there.` },
      hints: [t`Write out $f'g - fg'$ with $f = x^2$ and $g = x + 1$.`, 'Which term comes first?'],
      teach: t`In the quotient rule the derivative of the *top* comes first: $f'g - fg'$.`,
      explain: t`$y' = \dfrac{2x(x + 1) - x^2}{(x + 1)^2} = \dfrac{x^2 + 2x}{(x + 1)^2}$, positive for $x > 0$. The student’s version is its negative.`,
    }),
    expr({
      id: 'reciprocal', difficulty: 2,
      gen(r) {
        const k = r.int(1, 9);
        return {
          prompt: t`Differentiate $y = \dfrac{1}{x^2 + ${k}}$.`,
          lhs: "y'",
          answer: `-2x/(x^2 + ${k})^2`, answerTeX: t`-\frac{2x}{(x^2 + ${k})^2}`,
          vars: { x: [-2, 2] }, derivativeOf: `1/(x^2 + ${k})`,
          errors: [{ answer: `1/(2x)`, feedback: t`The derivative of $1/g$ is not $1/g'$. With $f = 1$, the quotient rule gives $-g'/g^2$.` }, { answer: `2x/(x^2 + ${k})^2`, feedback: t`Watch the sign: $\frac{0\cdot g - 1\cdot g'}{g^2} = -\frac{g'}{g^2}$.` }],
          hints: [t`Quotient rule with $f = 1$ ($f' = 0$) and $g = x^2 + ${k}$ ($g' = 2x$).`],
          teach: t`The reciprocal rule: $\left(\frac1g\right)' = -\frac{g'}{g^2}$.`,
          explain: t`$y' = \dfrac{0 - 1\cdot 2x}{(x^2 + ${k})^2} = -\dfrac{2x}{(x^2 + ${k})^2}$: negative for $x > 0$, where the bump falls.`,
          visual: { type: 'graph', params: { x: [-6, 6], y: [-0.05, 1.2 / k], aspect: 'wide', curves: [{ fn: `1/(x^2 + ${k})`, color: 'accent' }] }, caption: t`$y = 1/(x^2 + ${k})$: a bump, rising for $x < 0$ and falling for $x > 0$.` },
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-product', difficulty: 2,
      gen(r) {
        const a = r.int(1, 9);
        return {
          prompt: t`Differentiate $y = \sqrt{x}\,(x^2 - ${a})$.`,
          lhs: "y'",
          answer: `(x^2 - ${a})/(2 sqrt(x)) + 2x sqrt(x)`,
          answerTeX: t`\frac{x^2 - ${a}}{2\sqrt x} + 2x\sqrt{x}`,
          vars: { x: [0.5, 3] }, derivativeOf: `sqrt(x)*(x^2 - ${a})`,
          errors: [{ answer: 'sqrt(x)', feedback: t`That is $f'g' = \frac{1}{2\sqrt x}\cdot 2x$. Use $f'g + fg'$.` }],
          hints: [t`$f = \sqrt x$, $f' = \frac{1}{2\sqrt x}$; $g = x^2 - ${a}$, $g' = 2x$.`],
          teach: 'Product rule: each factor takes its turn being differentiated.',
          explain: t`$y' = \dfrac{x^2 - ${a}}{2\sqrt x} + 2x\sqrt{x} = \dfrac{5x^2 - ${a}}{2\sqrt{x}}$. (Check: $y = x^{5/2} - ${a}x^{1/2}$ gives the same.)`,
          visual: { type: 'graph', params: { x: [0, 4], y: [-a, 30], aspect: 'wide', curves: [{ fn: `sqrt(x)*(x^2 - ${a})`, color: 'accent' }] }, caption: t`$y = \sqrt x\,(x^2 - ${a})$ for $x \ge 0$.` },
        };
      },
    }),
    num({
      id: 'cp-jerk', difficulty: 3, transfer: true,
      gen(r) {
        const [F, m0, md] = r.pick([[7.6e6, 549000, 2750], [2.6e6, 220000, 900]]);
        const tt = r.pick([30, 60, 90]);
        const m = m0 - md * tt, ans = F * md / (m * m);
        return {
          prompt: t`A first stage with constant thrust $F = ${tex(F, 2)}$ N burns $\dot m = ${md}$ kg/s from a lift-off mass of $${tex(m0, 3)}$ kg. Its acceleration is $a(t) = F/m(t) - g$ with $m(t) = m_0 - \dot m\,t$. Find the jerk $da/dt$ at $t = ${tt}$ s.`,
          answer: ans, units: 'm/s^3', tol: { rel: 0.005 },
          errors: [{ value: F * md / (m0 * m0), feedback: t`That uses the lift-off mass. At $t = ${tt}$ s the mass is $m_0 - \dot m t = ${tex(m, 3)}$ kg.` }, { value: F / (m * m), feedback: t`The quotient rule gives $-F m'/m^2$, and $m' = -\dot m$: the mass rate multiplies the top.` }],
          hints: [t`$\dfrac{d}{dt}\dfrac{F}{m} = -\dfrac{F m'}{m^2} = \dfrac{F\dot m}{m^2}$.`, t`At $t = ${tt}$ s, $m = ${tex(m, 3)}$ kg.`],
          teach: 'A constant over a changing quantity: (F/m)′ = −F m′/m², so a lighter rocket’s acceleration rises ever faster.',
          explain: t`$\dfrac{da}{dt} = \dfrac{(${tex(F, 2)})(${md})}{(${tex(m, 3)})^2} = ${tex(ans, 3)}\ \text{m/s}^3$.`,
          visual: { type: 'graph', params: { x: [0, 100], y: [0, m0 / 1000 * 1.1], aspect: 'wide', xlabel: 't (s)', ylabel: 'mass (tonnes)', curves: [{ fn: `(${m0} - ${md}*x)/1000`, color: 'accent', domain: [0, 100] }], points: [{ x: tt, y: m / 1000, color: 'gold' }] }, caption: 'The stage’s mass falling linearly as propellant burns. Constant thrust and mass flow are simplifications.' },
        };
      },
    }),
    expr({
      id: 'cp-quotient', difficulty: 2,
      gen(r) {
        const a = r.int(1, 9), b = r.int(1, 4);
        return {
          prompt: t`Differentiate $y = \dfrac{x^2 - ${a}}{x + ${b}}$.`,
          lhs: "y'",
          answer: `(2x(x + ${b}) - (x^2 - ${a}))/(x + ${b})^2`,
          answerTeX: t`\frac{2x(x + ${b}) - (x^2 - ${a})}{(x + ${b})^2}`,
          vars: { x: [0, 3] }, derivativeOf: `(x^2 - ${a})/(x + ${b})`,
          errors: [{ answer: `((x^2 - ${a}) - 2x(x + ${b}))/(x + ${b})^2`, feedback: t`Numerator order: $f'g - fg'$.` }],
          hints: [t`$f = x^2 - ${a}$, $f' = 2x$; $g = x + ${b}$, $g' = 1$.`],
          teach: 'Quotient rule, derivative of the top first.',
          explain: t`$y' = \dfrac{2x(x + ${b}) - (x^2 - ${a})}{(x + ${b})^2} = \dfrac{x^2 + ${2 * b}x + ${a}}{(x + ${b})^2}$.`,
          visual: { type: 'graph', params: { x: [0, 5], y: [-a / b - 1, 5], aspect: 'wide', curves: [{ fn: `(x^2 - ${a})/(x + ${b})`, color: 'accent' }] }, caption: t`$y$ for $x \ge 0$, away from its asymptote at $x = -${b}$.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §3.3 Differentiation rules', url: 'https://openstax.org/books/calculus-volume-1/pages/3-3-differentiation-rules' },
  ],
});
