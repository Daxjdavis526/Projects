// Continuity and uniform continuity. Moving one quantifier — choosing δ before
// the point a instead of after it — turns continuity into uniform continuity.
// Pictures: a draggable point on 1/x over (0, 1) whose window collapses as it
// nears 0, against 5√x, whose window never drops below a floor despite an
// infinite slope at 0. Lipschitz bounds, Heine–Cantor, and why ODE solvers,
// grids and the geodesic equation care.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const is = (k) => `step(0.5 - abs(fc - ${k}))`;
const A = 'max(min(px, 1), 0.06)';
// the largest δ at a: 1/x is worst on the left; for 5√x, with e = ε/5, the left side binds once a ≥ e²
const E = '(eps/5)';
const DINV = `(${A}^2*eps/(1 + ${A}*eps))`;
const DSQ = `(step(${A} - ${E}^2)*(2*${E}*sqrt(${A}) - ${E}^2) + step(${E}^2 - ${A})*(2*${E}*sqrt(${A}) + ${E}^2))`;
const DEL = `(${is(0)}*${DINV} + ${is(1)}*${DSQ})`;
const FA = `(${is(0)}/${A} + ${is(1)}*5*sqrt(${A}))`;

export default lesson({
  id: 'st-g.G2.2',
  title: 'Continuity and uniform continuity',
  minutes: 13, difficulty: 3,
  intro: t`A function is **continuous on** an interval $I$ when it is continuous at each point: for every $a$ and every $\varepsilon$ there is a $\delta$ — and that $\delta$ may depend on $a$. Move one quantifier, so that $\delta$ is chosen **before** the point, and you get a stronger property:

$$\forall\varepsilon > 0\ \ \exists\delta > 0\ \ \forall a, x \in I:\ \ |x - a| < \delta \;\Rightarrow\; |f(x) - f(a)| < \varepsilon$$

This is **uniform continuity**: one input tolerance serves the whole interval. $1/x$ on $(0, 1)$ is continuous but not uniformly so; on a **closed, bounded** interval every continuous function is uniformly continuous (the Heine–Cantor theorem). The handiest sufficient condition is a **Lipschitz** bound $|f(x) - f(a)| \le K|x - a|$, which gives $\delta = \varepsilon/K$ at once.`,
  symbols: [
    { tex: 'I', text: t`the interval the statement is about — the same formula can be uniformly continuous on one interval and not on another` },
    { tex: '\\varepsilon,\\ \\delta', text: t`output and input tolerances; here $\delta$ is fixed before $a$ and $x$ are chosen, so it may depend on $\varepsilon$ only` },
    { tex: 'a, x', text: t`any two points of $I$ closer than $\delta$` },
    { tex: 'K', text: t`a Lipschitz constant: a bound on the slope of every chord, $|f(x) - f(a)|/|x - a| \le K$ (for a smooth $f$, any bound on $|f'|$)` },
  ],
  why: 'Uniform estimates are what let a single grid spacing, a single time step or a single existence proof work across a whole domain: the Picard–Lindelöf theorem behind every ODE solver — the geodesic equation included — needs a Lipschitz right-hand side.',
  visual: {
    type: 'graph',
    title: 'One window for the whole interval?',
    lead: t`Drag the white handle to move the point $a$. The green band is $f(a) \pm \varepsilon$; the gold strip is the widest window $a \pm \delta$ that keeps the curve in the band, worked out exactly at that $a$. Watch what the strip does as $a$ slides toward $0$.`,
    tasks: [
      t`$1/x$ with $\varepsilon = 1$: at $a = 1$ the window is $\delta = 0.5$; at $a = 0.1$ it is $0.0091$. As $a \to 0$, $\delta(a) \to 0$: no single $\delta$ serves all of $(0, 1)$.`,
      t`$5\sqrt x$ with the same $\varepsilon$: the slope is infinite at $0$, yet $\delta(a)$ never falls below $(\varepsilon/5)^2 = 0.04$. It is uniformly continuous.`,
      t`Halve $\varepsilon$ for $5\sqrt x$: the floor drops to a quarter, $(\varepsilon/5)^2$. Uniform continuity does not say $\delta$ is independent of $\varepsilon$ — only of $a$.`,
    ],
    params: {
      x: [0, 1.05], y: [-0.8, 7], aspect: 'wide', xlabel: 'x', ylabel: 'f(x)',
      choices: [{ key: 'fc', label: 'Function on (0, 1]', options: [[0, t`$1/x$`], [1, t`$5\sqrt x$`]], value: 0, explain: 'The function whose windows are compared across the interval.' }],
      sliders: [{ key: 'eps', label: t`Tolerance $\varepsilon$`, min: 0.2, max: 2, step: 0.05, value: 1, explain: t`The output tolerance: $|f(x) - f(a)|$ must stay below it for every $x$ in the window.` }],
      drag: [{ key: 'p', x: 0.7, y: -0.5, lockY: true }],
      shade: [
        { fn: `${FA} + eps`, lower: `${FA} - eps`, from: 0, to: 1.05, color: 'good', alpha: 0.15 },
        { fn: '7', lower: '-0.8', from: `max(${A} - ${DEL}, 0)`, to: `${A} + ${DEL}`, color: 'gold', alpha: 0.2 },
      ],
      curves: [
        { fn: '1/x', color: 'accent', width: 2.2, domain: [0.13, 1.05], when: is(0) },
        { fn: '5*sqrt(x)', color: 'accent', width: 2.2, domain: [0, 1.05], when: is(1) },
      ],
      points: [{ x: A, y: FA, r: 5, color: 'gold' }, { x: 'px', y: -0.5, r: 0, label: 'drag: a', labelDx: 10 }],
      readouts: [
        { label: t`point $a$`, expr: A, digits: 3 },
        { label: t`widest window $\delta(a)$ here`, expr: DEL, digits: 3 },
        { label: t`smallest $\delta(a)$ over the whole interval`, expr: `${is(1)}*${E}^2`, digits: 3 },
      ],
    },
    caption: t`$\delta(a)$ is computed exactly: $a^2\varepsilon/(1 + a\varepsilon)$ for $1/x$ (its left side binds), and from the left or right edge for $5\sqrt x$. The handle stops at $a = 0.06$; the readout of the smallest $\delta$ is the infimum over all of $(0, 1]$ — zero for $1/x$.`,
  },
  example: {
    prompt: t`Prove that $f(x) = 1/x$ is **not** uniformly continuous on $(0, 1)$, but **is** uniformly continuous on $[c, 1]$ for any $c > 0$.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 0.75], y: [0, 11], aspect: 'wide', xlabel: 'x', ylabel: '1/x',
        curves: [{ fn: '1/x', color: 'accent', width: 2.2, domain: [0.09, 0.75] }],
        points: [[0.4, 'δ = 0.4'], [0.2, 'δ = 0.2'], [0.1, 'δ = 0.1']].flatMap(([d, lab]) => [{ x: d, y: 1 / d, r: 4.5, color: 'gold', label: lab, labelDx: 10, labelDy: 4 }, { x: d / 2, y: 2 / d, r: 4.5, color: 'bad' }]),
        arrows: [[0.4, 'gap 2.5'], [0.2, 'gap 5'], [0.1, 'gap 10']].map(([d, lab]) => ({ from: [d / 2, 1 / d], to: [d / 2, 2 / d], color: 'bad', width: 1.6, label: lab, labelDx: -52, labelDy: 0 })),
      },
      caption: t`Pairs $a = \delta$ (gold) and $x = \delta/2$ (red), only $\delta/2$ apart. The vertical gap $1/\delta$ grows as $\delta$ shrinks: closeness of inputs no longer controls the outputs.`,
    },
    steps: [
      { label: 'Write the negation', text: t`Not uniformly continuous: $\exists\varepsilon > 0\ \forall\delta > 0\ \exists a, x \in I:\ |x - a| < \delta$ and $|f(x) - f(a)| \ge \varepsilon$.` },
      { label: 'Choose epsilon', text: t`Take $\varepsilon = 1$. Given any $\delta$, we may assume $\delta < 1$ (a smaller $\delta$ is a harder challenge for us, so winning against it wins against the larger one too).` },
      { label: 'Find the pair', text: t`Let $a = \delta$ and $x = \delta/2$, both in $(0, 1)$. Then $|x - a| = \delta/2 < \delta$, but $\left|\frac1x - \frac1a\right| = \frac2\delta - \frac1\delta = \frac1\delta > 1$. Every $\delta$ is beaten, so $1/x$ is not uniformly continuous on $(0, 1)$.` },
      { label: 'Stay away from zero', text: t`On $[c, 1]$: $\left|\frac1x - \frac1a\right| = \frac{|x - a|}{xa} \le \frac{|x - a|}{c^2}$, since $x, a \ge c$. That is a Lipschitz bound with $K = 1/c^2$.` },
      { label: 'One delta for all', text: t`Given $\varepsilon$, set $\delta = c^2\varepsilon$. For any $a, x \in [c, 1]$ with $|x - a| < \delta$: $\left|\frac1x - \frac1a\right| \le \frac{\delta}{c^2} = \varepsilon$… strictly less, since $|x - a| < \delta$. The $\delta$ never mentioned $a$: uniform. The price of approaching $0$ is the factor $c^2$.` },
    ],
    answer: t`On $(0, 1)$: $\varepsilon = 1$ and the pair $\delta, \delta/2$ defeat every $\delta$. On $[c, 1]$: $\delta = c^2\varepsilon$ works for every $a$ at once, because the slope there never exceeds $1/c^2$.`,
  },
  practice: [
    mcq({
      id: 'which-order', difficulty: 1,
      prompt: t`Which statement says that $f$ is **uniformly** continuous on $I$?`,
      visual: {
        type: 'graph',
        params: { x: [0, 1.05], y: [0, 9], aspect: 'wide', xlabel: 'x', ylabel: '1/x', curves: [{ fn: '1/x', color: 'accent', width: 2, domain: [0.11, 1.05] }], shade: [{ fn: '9', lower: '0', from: 0.15, to: 0.25, color: 'gold', alpha: 0.2 }, { fn: '9', lower: '0', from: 0.8, to: 0.9, color: 'gold', alpha: 0.2 }], arrows: [{ from: [0.27, 4], to: [0.27, 6.67], color: 'bad', width: 1.5, label: 'big change', labelDx: 6 }, { from: [0.92, 1.11], to: [0.92, 1.25], color: 'good', width: 1.5, label: 'small change', labelDx: -20, labelDy: -14 }] },
        caption: t`Two windows of the same width $0.1$ on $1/x$: near $0$ the output changes by $2.7$, near $1$ by $0.14$.`,
      },
      choices: [t`$\forall\varepsilon\ \exists\delta\ \forall a\ \forall x:\ |x - a| < \delta \Rightarrow |f(x) - f(a)| < \varepsilon$`, t`$\forall a\ \forall\varepsilon\ \exists\delta\ \forall x:\ |x - a| < \delta \Rightarrow |f(x) - f(a)| < \varepsilon$`, t`$\exists\delta\ \forall\varepsilon\ \forall a\ \forall x:\ |x - a| < \delta \Rightarrow |f(x) - f(a)| < \varepsilon$`, t`$\forall\varepsilon\ \forall\delta\ \forall a\ \forall x:\ |x - a| < \delta \Rightarrow |f(x) - f(a)| < \varepsilon$`],
      answer: 0,
      why: {
        1: t`That is ordinary continuity on $I$: $\delta$ comes after $a$, so it may depend on it.`,
        2: t`One $\delta$ for every $\varepsilon$ would force $f(x) = f(a)$ whenever $|x - a| < \delta$: only locally constant functions qualify.`,
        3: t`Every $\delta$ working means even huge windows keep the output within $\varepsilon$: again only constant functions.`,
      },
      hints: [t`In uniform continuity, $\delta$ may depend on $\varepsilon$ but not on the point.`, t`So $\exists\delta$ must come after $\forall\varepsilon$ and before $\forall a$.`],
      teach: t`Continuity on $I$ is $\forall a\ \forall\varepsilon\ \exists\delta$; uniform continuity moves $\forall a$ after $\exists\delta$ — one window for every point.`,
      explain: t`With $\forall\varepsilon\ \exists\delta\ \forall a$, the window is fixed before the point is named, so it must serve the steepest part of $I$. The picture shows why $1/x$ cannot manage that near $0$.`,
    }),
    num({
      id: 'lipschitz-delta', difficulty: 2,
      gen(r) {
        const Amp = r.pick([5, 10, 15, 20]), w = r.pick([2, 3, 4, 6]), eps = r.pick([0.1, 0.5, 1]);
        const ans = eps / (Amp * w);
        return {
          prompt: t`A pendulum swings as $\theta(t) = ${Amp}^\circ\,\sin(${w}t)$, $t$ in seconds. Find the largest $\delta$ that the Lipschitz bound guarantees: any two moments less than $\delta$ apart, **anywhere** in the motion, have angles within $${eps}^\circ$ of each other. Give $\delta$ in seconds.`,
          visual: { type: 'graph', params: { x: [0, 2 * Math.PI / w], y: [-Amp * 1.3, Amp * 1.3], aspect: 'wide', xlabel: 't (s)', ylabel: 'θ (degrees)', curves: [{ fn: `${Amp}*sin(${w}x)`, color: 'accent', width: 2.2 }, { fn: `${Amp * w}*x`, color: 'gold', width: 1.4, dash: true, domain: [0, 1.2 / w], label: `slope ${Amp * w} °/s`, labelAt: 0.9 / w, labelDx: 8, labelDy: 6 }] }, caption: t`One period, with the tangent at the steepest point (dashed): no chord is steeper than $${Amp * w}$ degrees per second.` },
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: eps / Amp, feedback: t`The slope bound is $${Amp}\times${w}$ degrees per second, not $${Amp}$: differentiate $\sin(${w}t)$.` }, { value: eps * Amp * w, feedback: t`Divide the tolerance by the slope bound: $\delta = \varepsilon/K$.` }],
          hints: [t`$|\theta'(t)| = ${Amp}\cdot${w}\,|\cos(${w}t)| \le ${Amp * w}$ degrees per second, so $K = ${Amp * w}$.`, t`The mean value theorem gives $|\theta(t) - \theta(s)| \le K|t - s|$; set $K\delta = ${eps}$.`],
          teach: t`A bound $K$ on $|f'|$ is a Lipschitz constant, and $\delta = \varepsilon/K$ works uniformly — the same window everywhere.`,
          explain: t`$K = ${Amp * w}$ °/s, so $\delta = ${eps}/${Amp * w} = ${nice(ans, 3)}$ s. The bound is tight at the bottom of the swing, where the pendulum is fastest; elsewhere there is room to spare.`,
        };
      },
    }),
    multi({
      id: 'which-uniform', difficulty: 2,
      prompt: t`Which functions are uniformly continuous on the set given? Select **every** one.`,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 2.2], aspect: 'wide', curves: [{ fn: 'sqrt(x)', color: 'accent', width: 2.2, label: '√x', labelAt: 3.3, labelDy: -6 }, { fn: '1/x', color: 'gold', width: 2, domain: [0.46, 4], label: '1/x', labelAt: 0.6, labelDx: 8 }] }, caption: t`$\sqrt x$ starts vertically at $0$; $1/x$ blows up there. Only one of these is a problem for uniform continuity.` },
      choices: [t`$x^2$ on $[0, 10]$`, t`$x^2$ on $\mathbb R$`, t`$\sqrt x$ on $[0, \infty)$`, t`$1/x$ on $[1, \infty)$`, t`$\sin(1/x)$ on $(0, 1)$`, t`$\sin x$ on $\mathbb R$`],
      answer: [0, 2, 3, 5],
      why: {
        1: t`For fixed $\delta$, $(a + \delta)^2 - a^2 = 2a\delta + \delta^2$ grows without bound as $a$ grows.`,
        4: t`Near $0$ it swings between $\pm1$ over shorter and shorter intervals: points $\delta$ apart can differ by $2$.`,
      },
      hints: [t`Closed and bounded intervals are automatic (Heine–Cantor). For the others, ask whether chords can get arbitrarily steep — or, for $\sqrt x$, check $|\sqrt x - \sqrt a| \le \sqrt{|x - a|}$.`],
      teach: t`Uniform continuity fails when a function changes by a fixed amount over ever shorter intervals; an infinite slope at one point alone does not cause that.`,
      explain: t`$x^2$ on $[0, 10]$: Heine–Cantor (or $K = 20$). $\sqrt x$: $\delta = \varepsilon^2$ works everywhere. $1/x$ on $[1, \infty)$: slope at most $1$. $\sin x$: $K = 1$. The failures are $x^2$ on $\mathbb R$ (steeper and steeper) and $\sin(1/x)$ (faster and faster).`,
    }),
    num({
      id: 'square-uniform', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 3, 4, 5]), eps = r.pick([0.5, 1, 2]);
        const ans = R - Math.sqrt(R * R - eps);
        return {
          prompt: t`$f(x) = x^2$ is uniformly continuous on $[0, ${R}]$. What is the **largest** $\delta$ such that any two points $a, x$ of the interval with $|x - a| < \delta$ have $|x^2 - a^2| < ${eps}$? Give three significant figures.`,
          visual: { type: 'graph', params: { x: [0, R + 0.3], y: [0, (R + 0.3) ** 2], aspect: 'wide', xlabel: 'x', ylabel: 'x²', curves: [{ fn: 'x^2', color: 'accent', width: 2.2 }], shade: [{ fn: `${((R + 0.3) ** 2).toFixed(2)}`, lower: '0', from: 0, to: 0.4, color: 'gold', alpha: 0.18 }, { fn: `${((R + 0.3) ** 2).toFixed(2)}`, lower: '0', from: R - 0.4, to: R, color: 'gold', alpha: 0.18 }], vlines: [{ x: R, color: 'ink3', label: `x = ${R}` }] }, caption: t`Two windows of equal width at the ends of $[0, ${R}]$: the same input change moves $x^2$ far more at the right end. The interval stops at $x = ${R}$.` },
          answer: ans, tol: { rel: 0.003 },
          errors: [
            { value: eps / (2 * R), feedback: t`That is the Lipschitz $\delta = \varepsilon/K$ with $K = ${2 * R}$. It works, but it is not the largest: the change over a window ending at $${R}$ is $${2 * R}\delta - \delta^2$, a little less than $${2 * R}\delta$.` },
            { value: Math.sqrt(R * R + eps) - R, feedback: t`That window reaches past $x = ${R}$, outside the interval. The worst pair inside $[0, ${R}]$ is $x = ${R}$, $a = ${R} - \delta$.` },
            { value: Math.sqrt(eps), feedback: t`$\sqrt{${eps}}$ is the window at $a = 0$, the gentlest point. The binding pair is at the steep end.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`For $a < x$ in $[0, ${R}]$, $x^2 - a^2 = (x + a)(x - a)$ is largest, for a given gap, when the pair sits at the right end: $x = ${R}$, $a = ${R} - \delta$.`, t`Solve $${R}^2 - (${R} - \delta)^2 = ${eps}$, that is $\delta^2 - ${2 * R}\delta + ${eps} = 0$, and take the smaller root.`],
          teach: t`The uniform $\delta$ is decided by the worst pair of points in the interval — for $x^2$ on $[0, R]$, the pair at the steep right end.`,
          explain: t`$${R}^2 - (${R} - \delta)^2 = ${2 * R}\delta - \delta^2 = ${eps}$ gives $\delta = ${R} - \sqrt{${R * R - eps}} = ${nice(ans, 4)}$. Any wider window contains a pair at the right end whose squares differ by more than $${eps}$; the Lipschitz estimate $${nice(eps / (2 * R), 4)}$ is safe but slightly smaller.`,
        };
      },
    }),
    mcq({
      id: 'sqrt-surprise', difficulty: 3,
      prompt: t`$\sqrt x$ has an infinite slope at $x = 0$, so it is not Lipschitz on $[0, 1]$. Is it uniformly continuous there, and if so, what $\delta$ serves every point?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.1], aspect: 'wide', curves: [{ fn: 'sqrt(x)', color: 'accent', width: 2.2 }, { fn: '4*x', color: 'gold', dash: true, width: 1.4, domain: [0, 0.27], label: 'slope 4', labelAt: 0.2, labelDx: 6 }, { fn: '10*x', color: 'bad', dash: true, width: 1.4, domain: [0, 0.1], label: 'slope 10', labelAt: 0.08, labelDx: -50 }] }, caption: t`However steep a line through the origin, $kx$ lies below $\sqrt x$ for $x < 1/k^2$: no slope bound holds on all of $[0, 1]$.` },
      choices: [t`Yes: $\delta = \varepsilon^2$, because $|\sqrt x - \sqrt a| \le \sqrt{|x - a|}$`, t`No: an unbounded slope rules out uniform continuity`, t`Yes: $\delta = \varepsilon/2$, because $\sqrt x$ is Lipschitz with $K = 2$`, t`Only on $[c, 1]$ for $c > 0$, never including $0$`],
      answer: 0,
      why: {
        1: t`Uniform continuity is weaker than a slope bound. The inequality $|\sqrt x - \sqrt a| \le \sqrt{|x - a|}$ controls the change without any derivative.`,
        2: t`The slope near $0$ exceeds every $K$, so no Lipschitz constant exists on $[0, 1]$.`,
        3: t`$[0, 1]$ is closed and bounded and $\sqrt x$ is continuous there: Heine–Cantor already says yes, $0$ included.`,
      },
      hints: [t`Square both sides: is $(\sqrt x - \sqrt a)^2 \le |x - a|$?`, t`For $x \ge a \ge 0$: $(\sqrt x - \sqrt a)^2 \le (\sqrt x - \sqrt a)(\sqrt x + \sqrt a) = x - a$.`],
      teach: t`Lipschitz implies uniformly continuous, not the reverse: $\sqrt x$ is uniformly continuous with $\delta = \varepsilon^2$ but has no Lipschitz constant on $[0, 1]$.`,
      explain: t`$|\sqrt x - \sqrt a| \le \sqrt{|x - a|} < \sqrt\delta = \varepsilon$ when $\delta = \varepsilon^2$, for every $a$ — uniform. Such a bound with a power below $1$ is called Hölder continuity.`,
    }),
    order({
      id: 'lipschitz-proof', difficulty: 3,
      prompt: t`Prove: **if $|f(x) - f(a)| \le K|x - a|$ for all $x, a \in I$ (with $K > 0$), then $f$ is uniformly continuous on $I$.** Put the steps in order.`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-2, 2.6], aspect: 'wide', curves: [{ fn: 'sin(1.6x)/1.6 + 0.3*x', color: 'accent', width: 2.2 }, { fn: '0.3*0.6 + sin(1.6*0.6)/1.6 + 1.3*(x - 0.6)', color: 'gold', dash: true, width: 1.3 }, { fn: '0.3*0.6 + sin(1.6*0.6)/1.6 - 1.3*(x - 0.6)', color: 'gold', dash: true, width: 1.3 }], points: [{ x: 0.6, y: +(0.18 + Math.sin(0.96) / 1.6).toFixed(5), r: 4.5, color: 'gold', label: 'a', labelDx: 6, labelDy: 18 }] }, caption: t`A function with $|f'| \le 1.3$ and the cone of slopes $\pm1.3$ from one of its points: the graph never leaves the cone — and the same cone fits at every point.` },
      items: [
        t`Let $\varepsilon > 0$.`,
        t`Set $\delta = \varepsilon/K$.`,
        t`Take any $a, x \in I$ with $|x - a| < \delta$.`,
        t`Then $|f(x) - f(a)| \le K|x - a| < K\delta = \varepsilon$.`,
        t`$\delta$ did not depend on $a$ or $x$, so $f$ is uniformly continuous on $I$.`,
      ],
      hints: [t`$\delta$ must be named right after $\varepsilon$, before any point is chosen.`, t`The estimate uses the Lipschitz bound with $|x - a| < \delta = \varepsilon/K$.`],
      teach: t`A Lipschitz constant gives a uniform $\delta = \varepsilon/K$ in one line: every point has the same cone.`,
      explain: t`The order mirrors $\forall\varepsilon\ \exists\delta\ \forall a, x$: the challenge, the response (built from $K$ alone), then arbitrary points and the estimate.`,
    }),
    mcq({
      id: 'sequential', difficulty: 2,
      prompt: t`$f(x) = \sin(1/x)$ for $x \ne 0$, with $f(0) = 0$. Continuity at $0$ would force $f(x_n) \to f(0)$ for **every** sequence $x_n \to 0$. Which sequence proves that $f$ is **not** continuous at $0$?`,
      visual: { type: 'graph', params: { x: [0, 0.25], y: [-1.3, 1.3], aspect: 'wide', curves: [{ fn: 'sin(1/x)', color: 'accent', width: 1.3, samples: 5000, domain: [0.004, 0.25] }], points: [1, 2, 3, 4].map((n) => ({ x: +(1 / (n * Math.PI)).toFixed(6), y: 0, r: 4, color: 'ink3' })) }, caption: t`$\sin(1/x)$ near $0$ (sampled, so the fastest wiggles are not all drawn). Grey dots: the zeros $x = 1/(n\pi)$.` },
      choices: [t`$x_n = \dfrac{1}{\pi/2 + 2\pi n}$, where $f(x_n) = 1$ for every $n$`, t`$x_n = \dfrac{1}{n\pi}$, where $f(x_n) = 0$`, t`$x_n = \dfrac{1}{2\pi n}$, where $f(x_n) = 0$`, t`None: a sequence can never prove discontinuity`],
      answer: 0,
      why: {
        1: t`Along this sequence $f(x_n) = 0 = f(0)$: consistent with continuity, so it proves nothing.`,
        2: t`Again $f(x_n) = 0 \to f(0)$: one good sequence cannot establish continuity, and it cannot refute it either.`,
        3: t`The sequential criterion is an equivalence: one sequence $x_n \to a$ with $f(x_n) \not\to f(a)$ is a complete proof of discontinuity.`,
      },
      hints: [t`You need $x_n \to 0$ with $f(x_n)$ **not** tending to $f(0) = 0$.`],
      teach: t`$f$ is continuous at $a$ exactly when $x_n \to a$ implies $f(x_n) \to f(a)$ for every sequence; one bad sequence disproves continuity.`,
      explain: t`$x_n = 1/(\pi/2 + 2\pi n) \to 0$, but $f(x_n) = \sin(\pi/2 + 2\pi n) = 1 \not\to 0$. The sequential form is often the quickest way to show a function is not continuous.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-grid', difficulty: 3, transfer: true,
      prompt: t`A simulation stores a field $f(r)$ on a grid of uniform spacing $h$ and needs $|f(r) - f(r_{\text{grid}})| < \varepsilon$ everywhere on its domain, with $r_{\text{grid}}$ the nearest grid point. Near a black hole puncture the field behaves like $1/r$ on $(0, R]$. Why do numerical-relativity codes refine the grid near the puncture instead of choosing one $h$?`,
      visual: { type: 'graph', params: { x: [0, 2], y: [0, 9], aspect: 'wide', xlabel: 'r', ylabel: 'f ~ 1/r', curves: [{ fn: '1/x', color: 'accent', width: 2, domain: [0.11, 2] }], points: Array.from({ length: 10 }, (_, i) => { const r = 0.2 * (i + 1); return { x: +r.toFixed(2), y: +(1 / r).toFixed(4), r: 4, color: 'gold' }; }) }, caption: t`Grid points $h = 0.2$ apart on $1/r$. Between the first two the field changes by $2.5$; between the last two, by $0.03$. Real codes also excise or regularize the puncture itself.` },
      choices: [t`$1/r$ is not uniformly continuous on $(0, R]$: no single $h$ meets the tolerance everywhere, so the spacing must shrink toward the puncture`, t`$1/r$ is not continuous at grid points near the puncture`, t`A uniform grid would work, but it would waste memory far from the hole`, t`Refinement is needed only because the field is not differentiable`],
      answer: 0,
      why: {
        1: t`It is continuous at every $r > 0$. The trouble is that the required spacing depends on $r$ and tends to $0$.`,
        2: t`No uniform spacing works at all for $1/r$ on $(0, R]$; saving memory is the reason to coarsen far away, not to refine near.`,
        3: t`$1/r$ is differentiable at every $r > 0$. The issue is how the needed $\delta$ — here the spacing — behaves across the domain.`,
      },
      hints: [t`A uniform grid spacing is a $\delta$ chosen before the point.`, t`For $1/r$, the widest acceptable window at $r$ shrinks like $r^2\varepsilon$.`],
      teach: t`A single grid spacing is a uniform $\delta$; a field that is continuous but not uniformly continuous forces the spacing to vary — adaptive mesh refinement.`,
      explain: t`Meeting the tolerance at $r$ needs $h \lesssim r^2\varepsilon$, which tends to $0$ at the puncture. So codes nest finer and finer boxes toward the black hole, keeping the spacing comparable to the local scale.`,
    }),
    num({
      id: 'cp-lipschitz-c', difficulty: 2,
      gen(r) {
        const c = r.pick([0.1, 0.2, 0.25, 0.5]), eps = r.pick([0.01, 0.05, 0.1]);
        const ans = c * c * eps;
        return {
          prompt: t`On $[${c}, 1]$, the function $1/x$ satisfies $\left|\frac1x - \frac1a\right| \le \frac{|x - a|}{${c}^2}$. What $\delta$ does this Lipschitz bound give for $\varepsilon = ${eps}$, valid at every point of $[${c}, 1]$?`,
          visual: { type: 'graph', params: { x: [0, 1.05], y: [0, 1 / c + 1], aspect: 'wide', xlabel: 'x', ylabel: '1/x', curves: [{ fn: '1/x', color: 'accent', width: 2.2, domain: [c, 1.05] }, { fn: '1/x', color: 'ink4', width: 1.2, dash: true, domain: [1 / (1 / c + 1), c] }], vlines: [{ x: c, color: 'gold', label: `x = ${c}` }] }, caption: t`$1/x$ on $[${c}, 1]$ (solid). It is steepest at the left end, slope $-1/${c}^2$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: eps / (c * c), feedback: t`Multiply, do not divide: $\delta = \varepsilon/K$ with $K = 1/${c}^2$, so $\delta = ${c}^2\varepsilon$.` }, { value: c * eps, feedback: t`The Lipschitz constant is $1/c^2$, not $1/c$: the slope of $1/x$ is $-1/x^2$.` }],
          hints: [t`The bound is a Lipschitz constant $K = 1/${c}^2 = ${nice(1 / (c * c))}$.`, t`$\delta = \varepsilon/K$.`],
          teach: t`$\delta = \varepsilon/K$, and for $1/x$ on $[c, 1]$, $K = 1/c^2$: the closer the interval reaches toward $0$, the smaller the uniform window.`,
          explain: t`$\delta = ${c}^2\times${eps} = ${nice(ans, 3)}$. It works at every point of $[${c}, 1]$ — and as $c \to 0$ it collapses, the trace of the failure on $(0, 1)$.`,
        };
      },
    }),
    mcq({
      id: 'cp-heine-cantor', difficulty: 3,
      prompt: t`Which function does the Heine–Cantor theorem (continuous on a closed, bounded interval $\Rightarrow$ uniformly continuous) guarantee to be uniformly continuous?`,
      visual: { type: 'graph', params: { x: [0, 1.65], y: [0, 16], aspect: 'wide', curves: [{ fn: 'tan(x)', color: 'accent', width: 2.2, domain: [0, 1.5] }, { fn: 'tan(x)', color: 'ink4', width: 1.2, dash: true, domain: [1.5, 1.507] }], vlines: [{ x: 1.5, color: 'gold', label: 'x = 1.5' }, { x: +(Math.PI / 2).toFixed(5), color: 'bad', label: 'π/2' }] }, caption: t`$\tan x$ up to $x = 1.5$ (solid), where it is $14.1$, and its blow-up at $\pi/2 \approx 1.571$.` },
      choices: [t`$\tan x$ on $[0, 1.5]$`, t`$\tan x$ on $[0, \pi/2)$`, t`$x^2$ on $[0, \infty)$`, t`$1/x$ on $(0, 1]$`],
      answer: 0,
      why: {
        1: t`$[0, \pi/2)$ is not closed, and $\tan x$ is not uniformly continuous there: it blows up at the open end.`,
        2: t`$[0, \infty)$ is closed but not bounded, and $x^2$ is not uniformly continuous there.`,
        3: t`$(0, 1]$ is not closed, and $1/x$ fails at the open end.`,
      },
      hints: ['Check both conditions: closed (contains its endpoints) and bounded.', 'Three of the sets miss an endpoint or run off to infinity.'],
      teach: t`Heine–Cantor needs a closed **and** bounded interval; drop either and a continuous function can fail to be uniformly continuous at the open or infinite end.`,
      explain: t`$\tan x$ is continuous on $[0, 1.5]$, a closed bounded interval, so it is uniformly continuous there (its slope is at most $\sec^2 1.5 \approx 201$). The other three each lose one condition — and with it the conclusion.`,
    }),
  ],
  sources: [
    { label: 'Abbott, Understanding Analysis, 2nd ed. (Springer, 2015), §§4.3–4.4 (continuity, uniform continuity)', url: 'https://doi.org/10.1007/978-1-4939-2712-8' },
    { label: 'Lebl, Basic Analysis I, §3.4 (uniform continuity, Lipschitz; free online)', url: 'https://www.jirka.org/ra/' },
    { label: 'Dafermos & Luk, The interior of dynamical vacuum black holes I: C⁰-stability of the Kerr Cauchy horizon (2017)', url: 'https://arxiv.org/abs/1710.01722' },
  ],
});
