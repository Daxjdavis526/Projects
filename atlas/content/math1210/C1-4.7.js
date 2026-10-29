// L’Hôpital’s rule — when f and g both vanish at a, their ratio near a is the
// ratio of their slopes. The rule behind every "this reduces to the old result
// when the parameter goes to zero" in physics.
import { lesson, mcq, num, multi } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, curveFig } from './_c1kit.js';

const t = String.raw;

// numerator (blue) and denominator (gold) on one picture — the setting, not the limit
const pairFig = (f, g, x, y, caption, more = {}) => ({
  type: 'graph',
  params: { x, y, aspect: 'wide', curves: [{ fn: f, color: 'accent', label: 'f', labelAt: x[1] * 0.75, labelDx: 6 }, { fn: g, color: 'gold', label: 'g', labelAt: x[1] * 0.92, labelDy: 14 }], ...more },
  caption,
});

// the Explore pairs, switched by the choice k (0, 1, 2); W(j) is 1 for the chosen pair and 0 otherwise
const W = (j) => `max(0, 1 - abs(k - ${j}))`;
const PAIRS = [
  { f: 'sin(x)', g: 'x', fp: 'cos(x)', gp: '1', L: 1 },
  { f: 'e^(2*x) - 1', g: 'x', fp: '2*e^(2*x)', gp: '1', L: 2 },
  { f: '1 - cos(x)', g: 'x^2', fp: 'sin(x)', gp: '2*x', L: 0.5 },
];
const at = (s) => s.replace(/x/g, '(px)');
const mix = (key) => PAIRS.map((P, j) => `${W(j)}*(${at(key(P))})`).join(' + ');

// the worked example: velocity with linear drag, v = (g/k)(1 − e^(−kt))
const G = 9.81;

export default lesson({
  id: 'math1210.C1-4.7',
  title: 'L’Hôpital’s rule',
  minutes: 9, difficulty: 3,
  intro: t`A limit of a quotient in which top and bottom **both** go to $0$ (or both to $\pm\infty$) is an indeterminate form: the answer depends on how fast each goes. Near such a point both functions are nearly straight lines through zero, so their ratio is the ratio of their slopes:

$$\lim_{x\to a}\frac{f(x)}{g(x)} = \lim_{x\to a}\frac{f'(x)}{g'(x)}$$

provided the right-hand limit exists. Differentiate top and bottom **separately** — this is not the quotient rule. Other indeterminate forms ($0\cdot\infty$, $\infty - \infty$, $1^\infty$, $0^0$, $\infty^0$) are first rewritten as a quotient, often by taking a logarithm.`,
  symbols: [
    { tex: 'a', text: 'the point being approached — a number, or $\\pm\\infty$' },
    { tex: 'f,\\ g', text: 'the numerator and denominator; the rule needs $f, g \\to 0$ together, or $f, g \\to \\pm\\infty$ together' },
    { tex: "f',\\ g'", text: 'their derivatives, taken separately; $g\'$ must be nonzero near $a$ (except perhaps at $a$)' },
  ],
  why: t`Every time a formula from new physics must reduce to the old one in some limit — drag to free fall as the drag goes to zero, Planck’s law to the classical one at low frequency — the check is an indeterminate limit, and this rule settles it.`,
  visual: {
    type: 'graph',
    title: 'Near the crossing, a ratio of slopes',
    lead: t`Blue is $f$, gold is $g$; both pass through $0$ at $x = 0$, so $f/g$ (violet dashes) is undefined there. Drag the marker along the axis towards $0$ and compare $f/g$ with $f'/g'$.`,
    tasks: [
      t`For $\sin x / x$: as the marker nears $0$, both readouts approach $1$ — the two curves leave the origin with the same slope.`,
      t`Switch to $(e^{2x} - 1)/x$: the blue curve leaves the origin twice as steeply as the gold one, and the limit is $2$.`,
      t`Switch to $(1 - \cos x)/x^2$: now $f'/g' = \sin x/(2x)$ is itself $0/0$ at the origin. Apply the rule again: $\cos x / 2 \to \tfrac12$.`,
    ],
    params: {
      x: [-2.2, 2.2], y: [-1.6, 3.2], aspect: 'wide',
      choices: [{ key: 'k', label: 'Limit', options: [[0, t`$\sin x / x$`], [1, t`$(e^{2x} - 1)/x$`], [2, t`$(1 - \cos x)/x^2$`]], value: 0, explain: 'Three classic 0/0 limits at x = 0.' }],
      drag: [{ key: 'p', x: 1.2, y: 0, lockY: true }],
      curves: PAIRS.flatMap((P, j) => [
        { fn: P.f, color: 'accent', width: 2.2, when: W(j), label: 'f', labelAt: 1.75, labelDx: 6 },
        { fn: P.g, color: 'gold', width: 2.2, when: W(j), label: 'g', labelAt: j === 1 ? 2 : 1.55, labelDx: 6, labelDy: 10 },
        { fn: `(${P.f})/(${P.g})`, color: 'violet', dash: true, width: 2, when: W(j) },
      ]),
      points: PAIRS.map((P, j) => ({ x: 0, y: P.L, color: 'violet', r: 4, when: W(j) })),
      vlines: [{ x: 'px', color: 'ink3' }],
      readouts: [
        { label: t`marker $x$`, expr: 'px', digits: 3 },
        { label: t`$f(x)/g(x)$`, expr: mix((P) => `(${P.f})/(${P.g})`), digits: 4 },
        { label: t`$f'(x)/g'(x)$`, expr: mix((P) => `(${P.fp})/(${P.gp})`), digits: 4 },
      ],
    },
    caption: 'The violet dot marks the limit, which the ratio never actually takes at x = 0 (it is undefined there). Readouts are exact values of the expressions at the marker.',
  },
  example: {
    prompt: t`An object falling from rest with **linear** air drag has velocity $v(t) = \dfrac{g}{k}\left(1 - e^{-kt}\right)$, where $k$ (in $\text{s}^{-1}$) measures the drag. Show that as $k \to 0$ this becomes free fall, $v = gt$.`,
    visual: curveFig({ fn: `${G}*x`, x: [-0.2, 8.4], y: [-3, 82], xlabel: 't (s)', ylabel: 'v (m/s)', domain: [0, 8.2], label: 'k → 0: gt', labelAt: 5.2, labelDx: -78, labelDy: -14, color: 'ink3', caption: t`$v(t)$ for three drag constants, and free fall $gt$ (grey), with $g = 9.81\ \text{m/s}^2$. Linear drag is a model: at these speeds real air drag grows more like the square of the speed.`, curves: [0.5, 0.2, 0.05].map((k, i) => ({ fn: `${N(G / k)}*(1 - e^(-${k}*x))`, color: ['accent', 'violet', 'gold'][i], domain: [0, 8.2], label: `k = ${k} s⁻¹`, labelAt: 7.6, labelDx: 4, labelDy: i === 2 ? -14 : 10 })) }),
    steps: [
      { label: 'Spot the form', text: t`At fixed $t$, as $k \to 0$ the numerator $g(1 - e^{-kt}) \to g(1 - 1) = 0$ and the denominator $k \to 0$. Plugging in gives $0/0$ — indeterminate.` },
      { label: 'Differentiate in k', text: t`The variable here is $k$, with $t$ held fixed. $\dfrac{d}{dk}\,g\left(1 - e^{-kt}\right) = g\,t\,e^{-kt}$ and $\dfrac{d}{dk}k = 1$.` },
      { label: 'Take the new limit', text: t`$\displaystyle\lim_{k\to0}\frac{g\,t\,e^{-kt}}{1} = g\,t\,e^{0} = gt$.` },
      { label: 'Read the physics', text: t`With vanishing drag the formula becomes free fall, as it must. For any $k > 0$ the curve bends away from $gt$ towards the terminal speed $g/k$.` },
      { label: 'Sense check', text: t`Units: $g/k$ is $\text{m/s}^2 \times \text{s} = \text{m/s}$, a speed, and $kt$ has no units, as an exponent must.` },
    ],
    answer: t`$\displaystyle\lim_{k\to0}\frac{g}{k}\left(1 - e^{-kt}\right) = gt$: free fall is the zero-drag limit.`,
  },
  practice: [
    num({
      id: 'sin-ratio', difficulty: 1,
      gen(r) {
        const a = r.int(2, 6), b = r.intExcept(2, 7, [a]);
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to0}\frac{\sin(${a}x)}{${b}x}$.`,
          answer: a / b, tol: { rel: 0.002 },
          errors: [{ value: b / a, feedback: 'Upside down: the derivative of the numerator goes on top.' }],
          hints: [t`Both go to $0$. Differentiate top and bottom separately.`, t`$\dfrac{${a}\cos(${a}x)}{${b}} \to \dfrac{${a}}{${b}}$.`],
          teach: 'A 0/0 limit is the ratio of the two slopes at the point where both vanish.',
          explain: t`$\dfrac{${a}\cos(${a}x)}{${b}} \to \dfrac{${a}}{${b}} = ${nice(a / b, 4)}$. The numerator leaves the origin with slope $${a}$, the denominator with slope $${b}$.`,
          visual: pairFig(`sin(${a}*x)`, `${b}*x`, [-1.2, 1.2], [-1.6, 1.6], t`$f(x) = \sin(${a}x)$ and $g(x) = ${b}x$, both through the origin.`),
        };
      },
    }),
    num({
      id: 'exp-twice', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 4, -2, -3]);
        const sx = a < 0 ? `+ ${-a}x` : `- ${a}x`;
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to0}\frac{e^{${a}x} - 1 ${sx}}{x^2}$.`,
          answer: a * a / 2, tol: { rel: 0.002 },
          errors: [{ value: a * a, feedback: t`After the second differentiation the denominator is $2$, not $1$.` }, { value: a, feedback: 'After one application the limit is still 0/0. Apply the rule a second time.' }].filter((e) => Math.abs(e.value - a * a / 2) > 1e-9),
          hints: [t`Once: $\dfrac{${a}e^{${a}x} ${a < 0 ? `+ ${-a}` : `- ${a}`}}{2x}$ — still $0/0$.`, t`Twice: $\dfrac{${a * a}e^{${a}x}}{2}$. Now let $x \to 0$.`],
          teach: 'If the first application of the rule gives 0/0 again, apply it again — checking each time that the form is still indeterminate.',
          explain: t`Two applications: $\dfrac{${a * a}e^{${a}x}}{2} \to \dfrac{${a * a}}{2} = ${nice(a * a / 2)}$. This is the $\tfrac12 a^2x^2$ term of $e^{ax}$’s expansion showing through.`,
          visual: pairFig(`e^(${a}*x) - 1 - (${a})*x`, 'x^2', [-0.9, 0.9], [-0.2, 2], t`$f(x) = e^{${a}x} - 1 ${sx}$ and $g(x) = x^2$ both touch the axis at $0$ with zero slope.`),
        };
      },
    }),
    mcq({
      id: 'find-error-determinate', difficulty: 2, kind: 'error',
      prompt: t`A student writes $\displaystyle\lim_{x\to0}\frac{x + 1}{x + 2} = \lim_{x\to0}\frac{1}{1} = 1$ “by L’Hôpital’s rule”. What is wrong?`,
      visual: curveFig({ fn: '(x + 1)/(x + 2)', x: [-1.5, 3], y: [-1, 1.4], domain: [-1.5, 3], points: [{ x: 0, y: 0.5, color: 'violet', label: '(0, 1/2)' }], caption: t`$y = \dfrac{x + 1}{x + 2}$ passes smoothly through $(0, \tfrac12)$.` }),
      choices: [
        t`The limit is not indeterminate: plugging in gives $\tfrac12$, and the rule does not apply`,
        t`They should have used the quotient rule to differentiate $\frac{x + 1}{x + 2}$`,
        'Nothing — L’Hôpital’s rule works for any quotient',
        t`The derivatives are wrong: they should be $x$ and $x$`,
      ],
      answer: 0,
      why: {
        1: t`L’Hôpital never uses the quotient rule: top and bottom are differentiated separately. And here it should not be used at all.`,
        2: t`The rule needs $0/0$ or $\infty/\infty$. Applied to $\tfrac12$ it gives nonsense, as here.`,
        3: t`$\frac{d}{dx}(x + 1) = 1$ and $\frac{d}{dx}(x + 2) = 1$; the derivatives are right, the rule is misapplied.`,
      },
      hints: ['Before using the rule, substitute x = 0. What form do you get?'],
      teach: 'Check the form first: L’Hôpital’s rule applies only to 0/0 or ∞/∞.',
      explain: t`At $x = 0$ the quotient is $\tfrac12$ — continuous, so that is the limit. Ratios of slopes only matter when both functions vanish together.`,
    }),
    num({
      id: 'x-sin-a-over-x', difficulty: 2,
      gen(r) {
        const a = r.int(2, 9);
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to\infty} x\sin\!\left(\frac{${a}}{x}\right)$.`,
          answer: a, tol: { rel: 0.002 },
          errors: [{ value: 1 / a, feedback: t`Check the derivative of $\sin(${a}/x)$: the chain rule gives $\cos(${a}/x)\cdot(-${a}/x^2)$.` }],
          hints: [t`This is $\infty\cdot 0$. Rewrite it as $\dfrac{\sin(${a}/x)}{1/x}$, a $0/0$ form.`, t`Differentiate: $\dfrac{\cos(${a}/x)\cdot(-${a}/x^2)}{-1/x^2} = ${a}\cos(${a}/x)$.`],
          teach: t`A product $0\cdot\infty$ becomes a quotient by moving one factor into the denominator as its reciprocal.`,
          explain: t`$\dfrac{\sin(${a}/x)}{1/x} \to \lim ${a}\cos(${a}/x) = ${a}$. Equivalently, with $u = ${a}/x \to 0$: $x\sin(${a}/x) = ${a}\,\dfrac{\sin u}{u} \to ${a}$.`,
          visual: curveFig({ fn: `x*sin(${a}/x)`, x: [0, 30], y: [0, 1.2 * a], domain: [0.4, 30], extra: { yticks: 0 }, caption: t`$y = x\sin(${a}/x)$ for large $x$ (height axis unnumbered): it levels off.` }),
        };
      },
    }),
    num({
      id: 'one-to-infinity', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2]), L = Math.exp(a * b);
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to\infty}\left(1 + \frac{${a}}{x}\right)^{${b === 1 ? '' : b}x}$ to 3 significant figures.`,
          answer: L, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: t`$1^\infty$ is indeterminate: the base approaches $1$ while the power grows. Take the logarithm.` }],
          hints: [t`Let $y$ be the expression. Then $\ln y = ${b === 1 ? '' : b}x\ln\!\left(1 + \tfrac{${a}}{x}\right) = \dfrac{${b === 1 ? '' : b}\ln(1 + ${a}/x)}{1/x}$, a $0/0$ form.`, t`L’Hôpital: $\ln y \to ${b === 1 ? '' : b}\cdot ${a} = ${a * b}$, so $y \to e^{${a * b}}$.`],
          teach: t`For $1^\infty$, $0^0$ and $\infty^0$, take the logarithm, find its limit, then exponentiate.`,
          explain: t`$\ln y = \dfrac{${b === 1 ? '' : b}\ln(1 + ${a}/x)}{1/x} \to ${a * b}$, so the limit is $e^{${a * b}} = ${nice(L, 4)}$ — the same limit that defines continuous compounding.`,
          visual: curveFig({ fn: `(1 + ${a}/x)^(${b}*x)`, x: [0, 40], y: [0, 1.2 * L], domain: [0.2, 40], extra: { yticks: 0 }, caption: 'The expression for growing x (height axis unnumbered): it rises and levels off — not at 1.' }),
        };
      },
    }),
    mcq({
      id: 'planck-rj', difficulty: 2,
      prompt: t`In Planck’s law of blackbody radiation the factor $\dfrac{x}{e^{x} - 1}$ appears, with $x = h\nu/k_BT$ (photon energy over thermal energy). At low frequency, $x \to 0$. What does the factor approach — and so what happens to Planck’s law there?`,
      visual: pairFig('x', 'e^x - 1', [-0.6, 1.4], [-0.6, 3], t`$f(x) = x$ and $g(x) = e^x - 1$ near $x = 0$.`),
      choices: [
        t`$1$: Planck’s law becomes the classical Rayleigh–Jeans law`,
        t`$0$: low-frequency radiation vanishes`,
        t`$\infty$: the classical “ultraviolet catastrophe” appears at low frequency`,
        t`$e$`,
      ],
      answer: 0,
      why: {
        1: t`Top and bottom both go to $0$, so the limit is not automatically $0$. Their slopes at $0$ are both $1$.`,
        2: t`Both go to $0$ at the same rate. The catastrophe is the classical law’s failure at **high** frequency.`,
        3: t`$e^0 = 1$, so the bottom vanishes; the limit is the ratio of slopes, $1/e^0 = 1$.`,
      },
      hints: [t`Both $x$ and $e^x - 1$ vanish at $x = 0$.`, t`Ratio of derivatives: $\dfrac{1}{e^{x}} \to 1$.`],
      teach: 'A new theory must reproduce the old one where the old one worked — and checking that is usually a 0/0 limit.',
      explain: t`$\dfrac{1}{e^x} \to 1$, so for $h\nu \ll k_BT$ the factor is $1$ and Planck’s law reduces to the classical Rayleigh–Jeans law, which matches experiment at low frequency.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cos', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, 4, 6]);
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to0}\frac{1 - \cos(${a}x)}{x^2}$.`,
          answer: a * a / 2, tol: { rel: 0.002 },
          errors: [{ value: a * a, feedback: t`The second derivative of $x^2$ is $2$: divide by it.` }, { value: a / 2, feedback: t`Differentiating $\sin(${a}x)$ brings out another factor of $${a}$.` }],
          hints: [t`Once: $\dfrac{${a}\sin(${a}x)}{2x}$, still $0/0$.`, t`Twice: $\dfrac{${a * a}\cos(${a}x)}{2}$.`],
          teach: 'Apply the rule as many times as the form stays 0/0.',
          explain: t`$\dfrac{${a}\sin(${a}x)}{2x} \to \dfrac{${a * a}\cos(${a}x)}{2} \to \dfrac{${a * a}}{2} = ${nice(a * a / 2)}$.`,
          visual: pairFig(`1 - cos(${a}*x)`, 'x^2', [-1.2, 1.2], [-0.2, 2.2], t`$f(x) = 1 - \cos(${a}x)$ and $g(x) = x^2$: both touch zero, flat, at the origin.`),
        };
      },
    }),
    num({
      id: 'cp-rocket-small', difficulty: 3, transfer: true,
      gen(r) {
        const ve = r.pick([2200, 2800, 3200, 4400]), m0 = r.pick([800, 1200, 2000, 4000]), L = ve / m0;
        return {
          prompt: t`The rocket equation gives the speed gained by burning a propellant mass $\Delta m$: $\Delta v = v_e\ln\dfrac{m_0}{m_0 - \Delta m}$. For a stage with exhaust speed $v_e = ${ve}$ m/s and starting mass $m_0 = ${m0}$ kg, find $\displaystyle\lim_{\Delta m\to0}\frac{\Delta v}{\Delta m}$, in (m/s) per kg.`,
          answer: L, units: 'm/(s kg)', tol: { rel: 0.005 },
          errors: [{ value: ve, feedback: t`Differentiate $\ln\dfrac{m_0}{m_0 - \Delta m} = \ln m_0 - \ln(m_0 - \Delta m)$ with respect to $\Delta m$: you get $\dfrac{1}{m_0 - \Delta m}$.` }],
          hints: [t`At $\Delta m = 0$ both $\Delta v$ and $\Delta m$ are $0$.`, t`$\dfrac{d}{d\Delta m}\,v_e\big(\ln m_0 - \ln(m_0 - \Delta m)\big) = \dfrac{v_e}{m_0 - \Delta m}$, and the denominator’s derivative is $1$.`],
          teach: t`A small burn gives $\Delta v \approx v_e\,\Delta m/m_0$: momentum carried off by the exhaust, shared by the whole vehicle.`,
          explain: t`$\dfrac{v_e}{m_0 - \Delta m} \to \dfrac{v_e}{m_0} = \dfrac{${ve}}{${m0}} = ${nice(L, 4)}$ (m/s)/kg. So the first kilogram of propellant adds about $${nice(L, 3)}$ m/s — the small-burn rule mission planners use for trim manoeuvres.`,
          visual: curveFig({ fn: `${ve}*ln(${m0}/(${m0} - x))`, x: [0, 0.6 * m0], y: [0, 1.1 * ve * Math.log(1 / 0.4)], xlabel: 'Δm (kg)', ylabel: 'Δv', domain: [0, 0.6 * m0], at: 0, f: (x) => ve * Math.log(m0 / (m0 - x)), df: (x) => ve / (m0 - x), span: 0.3 * m0, extra: { yticks: 0 }, caption: 'Δv against propellant burned (speed axis unnumbered), with the tangent at Δm = 0. No gravity or drag.' }),
        };
      },
    }),
    multi({
      id: 'cp-forms', difficulty: 2,
      prompt: t`Which of these limit forms are **indeterminate** — that is, the form alone does not fix the answer? Select all that apply.`,
      choices: [t`$\dfrac{0}{0}$`, t`$1^{\infty}$`, t`$\infty - \infty$`, t`$\dfrac{0}{\infty}$`, t`$\infty\cdot\infty$`, t`$0^{\infty}$`],
      answer: [0, 1, 2],
      why: {
        3: t`A vanishing top over a huge bottom is always $0$.`,
        4: t`Two huge factors make something huge: always $\infty$.`,
        5: t`A base near $0$ raised to a huge power is always $0$ (for a positive base).`,
      },
      hints: ['For each form, can you find two examples with different limits?', t`$\frac{x}{x} \to 1$ but $\frac{2x}{x} \to 2$, both $0/0$. Try the same for the others.`],
      teach: t`$0/0$, $\infty/\infty$, $0\cdot\infty$, $\infty - \infty$, $1^\infty$, $0^0$ and $\infty^0$ are indeterminate; forms like $0/\infty$ or $\infty\cdot\infty$ are not.`,
      explain: t`$0/0$, $1^\infty$ and $\infty - \infty$ each have examples with different limits ($(x + 1) - x \to 1$ but $2x - x \to \infty$). The other three always give $0$, $\infty$ and $0$.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §4.8 L’Hôpital’s rule', url: 'https://openstax.org/books/calculus-volume-1/pages/4-8-lhopitals-rule' }],
});
