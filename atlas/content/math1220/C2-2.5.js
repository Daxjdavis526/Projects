// Trigonometric substitution: square roots of quadratics are right triangles in disguise.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';

const t = String.raw;

// Why substitution `other` fails for radicand `kind` (0: a²−x², 1: a²+x², 2: x²−a²).
function whyNot(kind, other, A, ident) {
  const radicand = [[null, t`${A}(1 - \tan^2\theta)`, t`${A}(1 - \sec^2\theta) = -${A}\tan^2\theta`],
    [t`${A}(1 + \sin^2\theta)`, null, t`${A}(1 + \sec^2\theta)`],
    [t`${A}(\sin^2\theta - 1) = -${A}\cos^2\theta`, t`${A}(\tan^2\theta - 1)`, null]][kind][other];
  const negative = (kind === 0 && other === 2) || (kind === 2 && other === 0);
  return negative
    ? t`The radicand becomes $${radicand}$, which is negative: the root would not be real. You need ${ident}.`
    : t`The radicand becomes $${radicand}$, and no identity makes that a perfect square. You need ${ident}.`;
}

// A labelled right triangle drawn with the graph sim: θ at the origin, the right angle at (adj, 0).
function triangle(adj, opp, lab, caption) {
  const S = Math.max(adj, opp), r = 0.18 * Math.min(adj, opp, S), th = Math.atan2(opp, adj), m = 0.07 * S;
  return {
    type: 'graph',
    params: {
      x: [-0.15 * S, adj + 0.55 * S], y: [-0.22 * S, opp + 0.12 * S], equal: true, xlabel: ' ', ylabel: ' ',
      curves: [
        { param: [`${adj}*t`, '0'], t: [0, 1], color: 'ink2', width: 2.4 },
        { param: [`${adj}`, `${opp}*t`], t: [0, 1], color: 'ink2', width: 2.4 },
        { param: [`${adj}*t`, `${opp}*t`], t: [0, 1], color: 'accent', width: 2.8 },
        { param: [`${r}*cos(t)`, `${r}*sin(t)`], t: [0, th], color: 'warn', width: 2 },
        { param: [`${adj - m}`, `${m}*t`], t: [0, 1], color: 'ink3', width: 1.2 },
        { param: [`${adj - m}+${m}*t`, `${m}`], t: [0, 1], color: 'ink3', width: 1.2 },
      ],
      points: [
        { x: adj * 0.42, y: -0.12 * S, label: lab.adj, r: 0.001, color: 'ink' },
        { x: adj + 0.01 * S, y: opp * 0.5, label: lab.opp, r: 0.001, color: 'ink' },
        { x: adj * 0.56, y: opp * 0.44, label: lab.hyp, r: 0.001, color: 'accent' },
        { x: r * 1.05, y: r * 0.05, label: 'θ', r: 0.001, color: 'warn' },
      ],
    },
    caption,
  };
}

export default lesson({
  id: 'math1220.C2-2.5',
  title: 'Trigonometric substitution',
  minutes: 12, difficulty: 3,
  intro: t`A square root of a quadratic — $\sqrt{a^2 - x^2}$, $\sqrt{a^2 + x^2}$ or $\sqrt{x^2 - a^2}$ — is a right triangle in disguise. Substitute a trig function for $x$ and a Pythagorean identity turns the radicand into a perfect square, so **the root disappears**:

$$x = a\sin\theta \quad\Longrightarrow\quad \sqrt{a^2 - x^2} = a\cos\theta$$

In the same way, $x = a\tan\theta$ gives $\sqrt{a^2 + x^2} = a\sec\theta$, and $x = a\sec\theta$ gives $\sqrt{x^2 - a^2} = a\tan\theta$. After integrating in $\theta$, a reference triangle takes you back to $x$. The areas of circles and ellipses, and the gravity of a long, thin body, come out of exactly these substitutions.`,
  symbols: [
    { tex: 'a', text: 'a positive constant: the radius of the circle, or the fixed side of the triangle' },
    { tex: 'x', text: t`the original variable; here $-a \le x \le a$, so the root is real` },
    { tex: t`\theta`, text: t`the new variable, an angle restricted to $-\tfrac{\pi}{2} \le \theta \le \tfrac{\pi}{2}$ so that $\cos\theta \ge 0$` },
    { tex: t`dx = a\cos\theta\,d\theta`, text: 'the differential that comes with the substitution — it must be replaced too' },
    { tex: t`a\cos\theta`, text: t`the root after substitution: $\sqrt{a^2 - a^2\sin^2\theta} = \sqrt{a^2\cos^2\theta} = a\cos\theta$, positive because of the range of $\theta$` },
  ],
  why: t`Each substitution is chosen so that one identity — $1 - \sin^2\theta = \cos^2\theta$, $\;1 + \tan^2\theta = \sec^2\theta$ or $\sec^2\theta - 1 = \tan^2\theta$ — swallows the radicand.`,
  visual: {
    type: 'graph',
    title: 'The area under a circle is a triangle plus a sector',
    lead: t`The area under the circle $y = \sqrt{a^2 - x^2}$ (here $a = 2$) from $0$ to $X$ splits along the radius into an **amber triangle** and a **blue sector**. Their areas are exactly the two terms of
$$\int_0^X\sqrt{a^2 - x^2}\,dx = \tfrac12X\sqrt{a^2 - X^2} + \tfrac12a^2\theta, \qquad \theta = \arcsin\tfrac{X}{a},$$
and the sector’s angle $\theta$ is the substitution angle of $x = a\sin\theta$.`,
    tasks: [
      'Slide X all the way to 2 (= a): the triangle vanishes and the area is a quarter circle, π.',
      'Watch θ: it is the angle between the vertical axis and the radius, and sin θ = X/a.',
      'Small X: the region is nearly a rectangle of height a, and the two pieces are nearly equal.',
    ],
    params: {
      x: [-0.4, 3.4], y: [-0.25, 2.3], equal: true,
      constants: { a: 2 },
      sliders: [{ key: 'X', label: 'Upper limit $X$', min: 0.05, max: 2, step: 0.01, value: 1.2, explain: t`The integral runs from $0$ to $X$; the substitution angle is $\theta = \arcsin(X/a)$.` }],
      curves: [
        { fn: 'sqrt(a^2 - x^2)', color: 'ink2', width: 2.2, domain: [0, 2] },
        { param: ['X*t', 't*sqrt(a^2 - X^2)'], t: [0, 1], color: 'ink', width: 1.6 },
        { param: ['X', 't*sqrt(a^2 - X^2)'], t: [0, 1], color: 'ink3', width: 1.2 },
        { param: ['0.45*sin(t)', '0.45*cos(t)'], t: [0, 'asin(X/a)'], color: 'violet', width: 2 },
      ],
      shade: [
        { fn: 'sqrt(a^2 - X^2)*x/X', from: 0, to: 'X', color: 'warn', alpha: 0.32 },
        { fn: 'sqrt(a^2 - x^2)', lower: 'sqrt(a^2 - X^2)*x/X', from: 0, to: 'X', color: 'accent', alpha: 0.32 },
      ],
      points: [
        { x: 'X', y: 'sqrt(a^2 - X^2)', color: 'accent2' },
        { x: '0.5*sin(asin(X/a)/2) - 0.05', y: '0.5*cos(asin(X/a)/2) + 0.08', label: 'θ', r: 0.001, color: 'violet' },
      ],
      readouts: [
        { label: t`$\theta = \arcsin(X/a)$`, expr: 'asin(X/a)' },
        { label: 'amber triangle', expr: 'X*sqrt(a^2 - X^2)/2' },
        { label: 'blue sector', expr: 'a^2*asin(X/a)/2' },
        { label: 'total area', expr: 'X*sqrt(a^2 - X^2)/2 + a^2*asin(X/a)/2' },
      ],
    },
    caption: t`Exact geometry, equal scales on both axes. The sector has angle $\theta$ and radius $a$, so its area is $\tfrac12a^2\theta$; the triangle has base $X$ and height $\sqrt{a^2 - X^2}$.`,
  },
  example: {
    prompt: t`Find $\displaystyle\int \frac{dx}{(x^2 + 4)^{3/2}}$. (This is the integral behind the field of a long straight wire or rod.)`,
    visual: triangle(2, 3, { adj: '2', opp: 'x', hyp: '√(x² + 4)' }, t`The reference triangle for $x = 2\tan\theta$: opposite side $x$, adjacent side $2$, so the hypotenuse is $\sqrt{x^2 + 4}$.`),
    steps: [
      { label: 'Choose the substitution', text: t`The radicand is $a^2 + x^2$ with $a = 2$, so let $x = 2\tan\theta$. Then $dx = 2\sec^2\theta\,d\theta$ and $x^2 + 4 = 4\tan^2\theta + 4 = 4\sec^2\theta$.` },
      { label: 'Substitute', text: t`$(x^2 + 4)^{3/2} = (4\sec^2\theta)^{3/2} = 8\sec^3\theta$, so $$\int \frac{2\sec^2\theta\,d\theta}{8\sec^3\theta} = \frac14\int\cos\theta\,d\theta.$$` },
      { label: 'Integrate', text: t`$\tfrac14\int\cos\theta\,d\theta = \tfrac14\sin\theta + C$.` },
      { label: 'Back to x', text: t`From the triangle, $\tan\theta = x/2$ means opposite $= x$, adjacent $= 2$, hypotenuse $= \sqrt{x^2 + 4}$. So $\sin\theta = \dfrac{x}{\sqrt{x^2 + 4}}$ and the integral is $\dfrac{x}{4\sqrt{x^2 + 4}} + C$.` },
      { label: 'Check', text: t`$\dfrac{d}{dx}\Big[\tfrac{x}{4}(x^2 + 4)^{-1/2}\Big] = \tfrac14(x^2 + 4)^{-3/2}\big[(x^2 + 4) - x^2\big] = (x^2 + 4)^{-3/2}.$ ✓` },
    ],
    answer: t`$\displaystyle\int \frac{dx}{(x^2 + 4)^{3/2}} = \frac{x}{4\sqrt{x^2 + 4}} + C$`,
  },
  practice: [
    mcq({
      id: 'which-sub', difficulty: 1,
      gen(r) {
        const a = r.int(2, 5), A = a * a, kind = r.int(0, 2);
        const rad = [t`\sqrt{${A} - x^2}`, t`\sqrt{${A} + x^2}`, t`\sqrt{x^2 - ${A}}`][kind];
        const fns = [t`\sin`, t`\tan`, t`\sec`];
        const sub = (k, c = a) => t`$x = ${c}${fns[k]}\theta$`;
        const others = [0, 1, 2].filter((k) => k !== kind);
        const ident = [t`$1 - \sin^2\theta = \cos^2\theta$`, t`$1 + \tan^2\theta = \sec^2\theta$`, t`$\sec^2\theta - 1 = \tan^2\theta$`];
        return {
          prompt: t`Which substitution removes the root in $\displaystyle\int ${rad}\,dx$?`,
          choices: [sub(kind), sub(others[0]), sub(others[1]), sub(kind, A)],
          answer: 0,
          why: {
            1: whyNot(kind, others[0], A, ident[kind]),
            2: whyNot(kind, others[1], A, ident[kind]),
            3: t`$${A}$ is $a^2$; the substitution uses $a = ${a}$ itself, so that $x^2 = ${A}\,(\cdots)^2$.`,
          },
          hints: [t`Write the radicand as ${kind === 2 ? t`$x^2 - a^2$` : kind === 1 ? t`$a^2 + x^2$` : t`$a^2 - x^2$`} with $a = ${a}$.`, t`Which identity turns it into a perfect square? ${ident[kind]}.`],
          teach: t`Match the root to an identity: $\sqrt{a^2 - x^2}$ takes $x = a\sin\theta$, $\sqrt{a^2 + x^2}$ takes $x = a\tan\theta$, and $\sqrt{x^2 - a^2}$ takes $x = a\sec\theta$.`,
          explain: t`$${sub(kind).slice(1, -1)}$ gives ${[t`$${A} - ${A}\sin^2\theta = ${A}\cos^2\theta$`, t`$${A} + ${A}\tan^2\theta = ${A}\sec^2\theta$`, t`$${A}\sec^2\theta - ${A} = ${A}\tan^2\theta$`][kind]}, so the root is $${a}${['\\cos', '\\sec', '\\tan'][kind]}\theta$.`,
        };
      },
    }),
    mcq({
      id: 'triangle', difficulty: 2,
      gen(r) {
        const a = r.int(2, 5), A = a * a, want = r.pick(['tan', 'cos', 'sec']);
        const R = t`\sqrt{${A} - x^2}`;
        const E = {
          sin: [t`$\dfrac{x}{${a}}$`, t`$x/${a}$ is $\sin\theta$ — opposite over hypotenuse, which is how the substitution was defined.`],
          cos: [t`$\dfrac{${R}}{${a}}$`, t`That is $\cos\theta$ — adjacent over hypotenuse.`],
          tan: [t`$\dfrac{x}{${R}}$`, t`That is $\tan\theta$ — opposite over adjacent.`],
          cot: [t`$\dfrac{${R}}{x}$`, t`That is adjacent over opposite, $\cot\theta$ — upside down.`],
          sec: [t`$\dfrac{${a}}{${R}}$`, t`That is $\sec\theta = 1/\cos\theta$.`],
          csc: [t`$\dfrac{${a}}{x}$`, t`That is $\csc\theta = 1/\sin\theta$ — hypotenuse over opposite.`],
        };
        const set = { tan: ['tan', 'sin', 'cot', 'cos'], cos: ['cos', 'sin', 'sec', 'tan'], sec: ['sec', 'cos', 'csc', 'tan'] }[want];
        const name = { tan: t`\tan\theta`, cos: t`\cos\theta`, sec: t`\sec\theta` }[want];
        return {
          prompt: t`After substituting $x = ${a}\sin\theta$ and integrating, you need $${name}$ in terms of $x$. What is it?`,
          choices: set.map((k) => E[k][0]),
          answer: 0,
          why: { 1: E[set[1]][1], 2: E[set[2]][1], 3: E[set[3]][1] },
          hints: [t`$\sin\theta = x/${a}$: draw a right triangle with opposite side $x$ and hypotenuse $${a}$.`, t`By Pythagoras the adjacent side is $${R}$.`],
          teach: 'Read every trig function of θ off one reference triangle built from the substitution.',
          explain: t`Opposite $x$, hypotenuse $${a}$, adjacent $${R}$, so $${name} = ${E[want][0].slice(1, -1)}$.`,
          visual: triangle(0.8 * a, 0.6 * a, { adj: `√(${A} − x²)`, opp: 'x', hyp: `${a}` }, t`The reference triangle for $x = ${a}\sin\theta$: $\sin\theta = x/${a}$ is opposite over hypotenuse.`),
        };
      },
    }),
    expr({
      id: 'arcsin', difficulty: 2,
      gen(r) {
        const a = r.int(2, 6), A = a * a;
        return {
          prompt: t`Find $\displaystyle\int \frac{dx}{\sqrt{${A} - x^2}}$.`,
          answer: `asin(x/${a})`,
          answerTeX: t`\arcsin\frac{x}{${a}}`,
          integrand: `1/sqrt(${A} - x^2)`,
          vars: { x: [-0.9 * a, 0.9 * a] }, mode: 'constant',
          errors: [
            { answer: 'asin(x)', feedback: t`Scale first: $x = ${a}\sin\theta$ gives $\theta = \arcsin(x/${a})$.` },
            { answer: `asin(x/${a})/${a}`, feedback: t`The $dx = ${a}\cos\theta\,d\theta$ cancels the root’s factor of ${a} exactly; the $\tfrac1a$ belongs to the arctangent formula.` },
          ],
          hints: [t`Let $x = ${a}\sin\theta$, so $dx = ${a}\cos\theta\,d\theta$ and $\sqrt{${A} - x^2} = ${a}\cos\theta$.`, t`The integral becomes $\int d\theta = \theta + C$; then $\theta = \arcsin(x/${a})$.`],
          teach: t`$\int \dfrac{dx}{\sqrt{a^2 - x^2}} = \arcsin\dfrac{x}{a} + C$: the root and the $dx$ cancel completely.`,
          explain: t`$\int\dfrac{${a}\cos\theta\,d\theta}{${a}\cos\theta} = \theta + C = \arcsin\dfrac{x}{${a}} + C$.`,
        };
      },
    }),
    expr({
      id: 'circle-area', difficulty: 3,
      gen(r) {
        const a = r.int(2, 5), A = a * a;
        return {
          prompt: t`Find $\displaystyle\int \sqrt{${A} - x^2}\,dx$.`,
          answer: `x*sqrt(${A} - x^2)/2 + ${A}/2*asin(x/${a})`,
          answerTeX: t`\frac{x}{2}\sqrt{${A} - x^2} + \frac{${A}}{2}\arcsin\frac{x}{${a}}`,
          integrand: `sqrt(${A} - x^2)`,
          vars: { x: [-0.9 * a, 0.9 * a] }, mode: 'constant',
          errors: [
            { answer: `x*sqrt(${A} - x^2)/2`, feedback: 'That is only the triangle. The sector term, (a²/2)·arcsin(x/a), is missing.' },
            { answer: `${A}/2*asin(x/${a})`, feedback: 'That is only the sector. The triangle term, (x/2)·√(a² − x²), is missing.' },
          ],
          hints: [
            t`$x = ${a}\sin\theta$ turns it into $\int ${a}\cos\theta\cdot ${a}\cos\theta\,d\theta = ${A}\int\cos^2\theta\,d\theta$.`,
            t`$\cos^2\theta = \tfrac12(1 + \cos 2\theta)$, so you get $\tfrac{${A}}{2}\big(\theta + \sin\theta\cos\theta\big)$.`,
            t`Back-substitute: $\sin\theta = x/${a}$ and $\cos\theta = \sqrt{${A} - x^2}/${a}$.`,
          ],
          teach: 'The root becomes a cos θ and dx brings another a cos θ: the integral of cos² is the sector, and the sin θ cos θ term is the triangle.',
          explain: t`$\tfrac{${A}}{2}(\theta + \sin\theta\cos\theta) = \tfrac{${A}}{2}\arcsin\tfrac{x}{${a}} + \tfrac{x}{2}\sqrt{${A} - x^2} + C$ — the sector plus the triangle of the explorer.`,
          visual: {
            type: 'graph',
            params: { x: [-a * 1.1, a * 1.1], y: [-0.15 * a, a * 1.12], equal: true, curves: [{ fn: `sqrt(${A} - x^2)`, color: 'accent' }] },
            caption: t`The integrand is the upper half of a circle of radius ${a}; its integral is an area of part of that circle.`,
          },
        };
      },
    }),
    expr({
      id: 'rod-integral', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 3, 5]), A = a * a;
        return {
          prompt: t`Find $\displaystyle\int \frac{dx}{(x^2 + ${A})^{3/2}}$.`,
          answer: `x/(${A}*sqrt(x^2 + ${A}))`,
          answerTeX: t`\frac{x}{${A === 1 ? '' : A}\sqrt{x^2 + ${A}}}`,
          integrand: `1/(x^2 + ${A})^(3/2)`,
          vars: { x: [-3, 3] }, mode: 'constant',
          errors: a === 1 ? [] : [{ answer: `x/sqrt(x^2 + ${A})`, feedback: t`Track the constants: $(x^2 + ${A})^{3/2} = ${A * a}\sec^3\theta$ and $dx = ${a}\sec^2\theta\,d\theta$ leave a factor $\tfrac{1}{${A}}$.` }],
          hints: [t`$x = ${a === 1 ? '' : a}\tan\theta$: then $dx = ${a === 1 ? '' : a}\sec^2\theta\,d\theta$ and $x^2 + ${A} = ${A === 1 ? '' : A}\sec^2\theta$.`, t`The integral becomes $${A === 1 ? '' : t`\tfrac{1}{${A}}`}\int\cos\theta\,d\theta = ${A === 1 ? '' : t`\tfrac{1}{${A}}`}\sin\theta$, and $\sin\theta = x/\sqrt{x^2 + ${A}}$.`],
          teach: t`For $(x^2 + a^2)^{3/2}$, the substitution $x = a\tan\theta$ leaves $\tfrac{1}{a^2}\int\cos\theta\,d\theta$.`,
          explain: t`$${A === 1 ? '' : t`\dfrac{1}{${A}}`}\sin\theta + C = \dfrac{x}{${A === 1 ? '' : A}\sqrt{x^2 + ${A}}} + C$.`,
        };
      },
    }),
    expr({
      id: 'sec-sub', difficulty: 3,
      gen(r) {
        const a = r.int(2, 4), A = a * a;
        return {
          prompt: t`Find $\displaystyle\int \frac{\sqrt{x^2 - ${A}}}{x}\,dx$ for $x > ${a}$.`,
          answer: `sqrt(x^2 - ${A}) - ${a}*asec(x/${a})`,
          answerTeX: t`\sqrt{x^2 - ${A}} - ${a}\,\operatorname{arcsec}\frac{x}{${a}}`,
          integrand: `sqrt(x^2 - ${A})/x`,
          keys: [['arcsec', 'arcsec('], ['arccos', 'arccos(']],
          vars: { x: [1.2 * a, 3 * a] }, mode: 'constant',
          errors: [{ answer: `sqrt(x^2 - ${A}) + ${a}*asec(x/${a})`, feedback: t`$\tan^2\theta = \sec^2\theta - 1$, so $\int\tan^2\theta\,d\theta = \tan\theta - \theta$: the angle term is subtracted.` }],
          hints: [
            t`Let $x = ${a}\sec\theta$: $dx = ${a}\sec\theta\tan\theta\,d\theta$ and $\sqrt{x^2 - ${A}} = ${a}\tan\theta$.`,
            t`The integral becomes $\int\dfrac{${a}\tan\theta}{${a}\sec\theta}\,${a}\sec\theta\tan\theta\,d\theta = ${a}\int\tan^2\theta\,d\theta$.`,
            t`$${a}\int(\sec^2\theta - 1)\,d\theta = ${a}(\tan\theta - \theta)$; then $${a}\tan\theta = \sqrt{x^2 - ${A}}$ and $\theta = \operatorname{arcsec}(x/${a})$.`,
          ],
          teach: t`For $\sqrt{x^2 - a^2}$, $x = a\sec\theta$ makes the root $a\tan\theta$; $\operatorname{arcsec}(x/a)$ is the same as $\arccos(a/x)$ for $x > a$.`,
          explain: t`$${a}(\tan\theta - \theta) + C = \sqrt{x^2 - ${A}} - ${a}\operatorname{arcsec}\tfrac{x}{${a}} + C$ (equivalently $- ${a}\arccos\tfrac{${a}}{x}$).`,
        };
      },
    }),
    num({
      id: 'ellipse', difficulty: 2,
      gen(r) {
        const a = r.int(3, 6), b = r.intExcept(2, a - 1, []);
        const area = Math.PI * a * b;
        return {
          prompt: t`The ellipse $\dfrac{x^2}{${a * a}} + \dfrac{y^2}{${b * b}} = 1$ has area $4\displaystyle\int_0^{${a}} \frac{${b}}{${a}}\sqrt{${a * a} - x^2}\,dx$. Evaluate it to 3 significant figures.`,
          answer: area, tol: { rel: 0.005 },
          integrand: `4*${b}/${a}*sqrt(${a * a} - x^2)`, limits: [0, a],
          errors: [{ value: Math.PI * a * a, feedback: t`That is the area of the circle of radius ${a}. The factor $\tfrac{${b}}{${a}}$ squashes it into the ellipse.` }, { value: area / 4, feedback: 'That is one quarter of the ellipse — multiply by 4.' }],
          hints: [t`$\int_0^{a}\sqrt{a^2 - x^2}\,dx$ is a quarter circle: $\tfrac{\pi a^2}{4}$ (set $x = a\sin\theta$, $\theta$ from $0$ to $\tfrac{\pi}{2}$).`, t`So the area is $4\cdot\tfrac{${b}}{${a}}\cdot\tfrac{\pi\cdot ${a * a}}{4}$.`],
          teach: t`An ellipse is a circle stretched by $b/a$ in one direction, so its area is $\pi ab$.`,
          explain: t`$4\cdot\tfrac{${b}}{${a}}\cdot\tfrac{\pi(${a})^2}{4} = \pi\cdot${a}\cdot${b} = ${fmt(area, 4)}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [-a * 1.15, a * 1.15], y: [-b * 1.25, b * 1.25], equal: true,
              curves: [{ fn: `${b}/${a}*sqrt(${a * a} - x^2)`, color: 'accent' }, { fn: `-${b}/${a}*sqrt(${a * a} - x^2)`, color: 'accent' }],
              shade: [{ fn: `${b}/${a}*sqrt(${a * a} - x^2)`, from: 0, to: a, color: 'accent', alpha: 0.3 }],
            },
            caption: 'The shaded quarter is the integral; four of them make the ellipse.',
          },
        };
      },
    }),
    mcq({
      id: 'forgot-dx', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “Let $x = 2\sin\theta$, so $\sqrt{4 - x^2} = 2\cos\theta$. Then $\displaystyle\int\frac{dx}{\sqrt{4 - x^2}} = \int\frac{d\theta}{2\cos\theta} = \tfrac12\ln\lvert\sec\theta + \tan\theta\rvert + C$.” What went wrong?`,
      choices: [
        t`$dx$ was replaced by $d\theta$. In fact $dx = 2\cos\theta\,d\theta$, which cancels the root and leaves $\int d\theta = \arcsin\tfrac{x}{2} + C$.`,
        t`$\sqrt{4 - x^2}$ should be $2\sin\theta$.`,
        t`The substitution should have been $x = 2\tan\theta$.`,
        t`$\int\sec\theta\,d\theta$ is $\ln\lvert\sec\theta\rvert + C$, not $\ln\lvert\sec\theta + \tan\theta\rvert + C$.`,
      ],
      answer: 0,
      why: {
        1: t`$4 - 4\sin^2\theta = 4\cos^2\theta$, so the root really is $2\cos\theta$.`,
        2: t`$\sqrt{4 - x^2}$ calls for $x = 2\sin\theta$; the choice was right.`,
        3: t`$\ln\lvert\sec\theta\rvert$ is $\int\tan\theta\,d\theta$. The real slip is earlier.`,
      },
      hints: ['Every piece of the integral must be converted to θ — including dx.', t`Differentiate $x = 2\sin\theta$.`],
      teach: t`Substitution replaces $dx$ too: $x = a\sin\theta$ brings $dx = a\cos\theta\,d\theta$.`,
      explain: t`With $dx = 2\cos\theta\,d\theta$: $\displaystyle\int\frac{2\cos\theta\,d\theta}{2\cos\theta} = \theta + C = \arcsin\frac{x}{2} + C$.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-x2-root', difficulty: 3,
      gen(r) {
        const a = r.int(2, 5), A = a * a;
        return {
          prompt: t`Find $\displaystyle\int \frac{dx}{x^2\sqrt{${A} - x^2}}$ for $0 < x < ${a}$.`,
          answer: `-sqrt(${A} - x^2)/(${A}*x)`,
          answerTeX: t`-\frac{\sqrt{${A} - x^2}}{${A}\,x}`,
          integrand: `1/(x^2*sqrt(${A} - x^2))`,
          vars: { x: [0.2 * a, 0.9 * a] }, mode: 'constant',
          hints: [t`$x = ${a}\sin\theta$ gives $\tfrac{1}{${A}}\int\csc^2\theta\,d\theta$.`, t`$\int\csc^2\theta\,d\theta = -\cot\theta$, and $\cot\theta = \sqrt{${A} - x^2}/x$.`],
          teach: 'Substitute, integrate in θ, and read the answer back off the reference triangle.',
          explain: t`$\displaystyle\int\frac{${a}\cos\theta\,d\theta}{${A}\sin^2\theta\cdot ${a}\cos\theta} = \frac{1}{${A}}\int\csc^2\theta\,d\theta = -\frac{\cot\theta}{${A}} + C = -\frac{\sqrt{${A} - x^2}}{${A}x} + C$.`,
        };
      },
    }),
    num({
      id: 'cp-definite', difficulty: 2,
      gen(r) {
        const a = r.int(2, 5), A = a * a, val = 1 / (Math.SQRT2 * A);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${a}} \frac{dx}{(x^2 + ${A})^{3/2}}$ to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          integrand: `1/(x^2 + ${A})^(3/2)`, limits: [0, a],
          hints: [t`An antiderivative is $\dfrac{x}{${A}\sqrt{x^2 + ${A}}}$ (substitute $x = ${a}\tan\theta$).`],
          teach: 'Find the antiderivative by trig substitution, then evaluate at the limits in x.',
          explain: t`$\left[\dfrac{x}{${A}\sqrt{x^2 + ${A}}}\right]_0^{${a}} = \dfrac{${a}}{${A}\cdot ${a}\sqrt2} = \dfrac{1}{${A}\sqrt2} = ${fmt(val, 3)}$.`,
        };
      },
    }),
    num({
      id: 'cp-eros', difficulty: 3, transfer: true,
      gen(r) {
        const d = r.pick([20, 25, 30, 40]);                  // km from the centre, perpendicular to the long axis
        const G = 6.674e-11, M = 6.687e15, L = 34e3, dm = d * 1e3;
        const g = (G * M) / (dm * Math.sqrt(dm * dm + (L * L) / 4));
        const gmm = g * 1e3;                                  // mm/s²
        return {
          prompt: t`Model the asteroid 433 Eros ($M = 6.687\times10^{15}$ kg, about 34 km long) as a thin uniform rod of length $L = 34$ km. At a point ${d} km from its centre, along the perpendicular bisector, its gravitational field is
$$g = \frac{GMd}{L}\int_{-L/2}^{L/2}\frac{dx}{(x^2 + d^2)^{3/2}},$$
with $G = 6.674\times10^{-11}\ \text{N m}^2/\text{kg}^2$. Find $g$ in mm/s², to 3 significant figures.`,
          answer: gmm, units: 'mm/s^2', tol: { rel: 0.005 },
          integrand: `${(G * M * dm / L) * 1e3}/(x^2 + ${dm * dm})^(3/2)`, limits: [-L / 2, L / 2],
          errors: [{ value: (G * M) / (dm * dm) * 1e3, feedback: t`That is $GM/d^2$, the field of a point mass. Spreading the mass along a rod puts much of it farther away, so the field is weaker.` }],
          hints: [
            t`An antiderivative of $(x^2 + d^2)^{-3/2}$ is $\dfrac{x}{d^2\sqrt{x^2 + d^2}}$ ($x = d\tan\theta$).`,
            t`Between $-L/2$ and $L/2$ it gives $\dfrac{L}{d^2\sqrt{L^2/4 + d^2}}$, so $g = \dfrac{GM}{d\sqrt{d^2 + L^2/4}}$.`,
            'Work in metres, then convert m/s² to mm/s².',
          ],
          teach: 'Trig substitution turns the field of an extended body into a closed form; far away it approaches the point-mass field.',
          explain: t`$g = \dfrac{GM}{d\sqrt{d^2 + L^2/4}} = \dfrac{(6.674\times10^{-11})(6.687\times10^{15})}{(${d}\times10^{3})\sqrt{(${d}\times10^{3})^2 + (17\times10^{3})^2}} = ${fmt(gmm, 3)}$ mm/s², compared with $GM/d^2 = ${fmt((G * M) / (dm * dm) * 1e3, 3)}$ mm/s² for a point mass.`,
          visual: {
            type: 'graph',
            params: {
              x: [-22, 22], y: [-5, d + 6], equal: true, xlabel: 'x (km)', ylabel: ' ',
              curves: [
                { param: ['t', '0'], t: [-17, 17], color: 'ink2', width: 7 },
                { param: ['17*t', `${d}*(1 - t)`], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
                { param: ['-17*t', `${d}*(1 - t)`], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
              ],
              points: [{ x: 0, y: d, label: 'P', color: 'gold' }],
              arrows: [{ from: [0, d], to: [0, d - Math.min(8, d / 3)], color: 'gold', label: 'g' }],
            },
            caption: 'A crude model: the real Eros is a lumpy, peanut-shaped body, not a rod. By symmetry the sideways pulls of the two halves cancel, leaving g pointing at the rod.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §3.3', url: 'https://openstax.org/books/calculus-volume-2/pages/3-3-trigonometric-substitution' },
    { label: 'Yeomans et al. 2000, Science 289, 2085 (mass of 433 Eros from NEAR Shoemaker)', url: 'https://doi.org/10.1126/science.289.5487.2085' },
  ],
});
