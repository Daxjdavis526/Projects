// Graphs of sine and cosine — the unit circle unrolled: period 2π, range [−1, 1], cosine a quarter period ahead.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { PI, piTeX, trigGraph } from './_m0trig.js';

const t = String.raw;
const SIN = { fn: 'sin(x)', color: 'warn' }, COS = { fn: 'cos(x)', color: 'accent' };

export default lesson({
  id: 'm0.M0-7.4',
  title: 'Graphs of sine and cosine',
  minutes: 9, difficulty: 2,
  intro: t`Let $P$ go round the unit circle and plot its height against the angle it has turned through: that is the graph of $y = \sin x$, the circle **unrolled**. Plot the horizontal position instead and you get $y = \cos x$. Both repeat every full turn, both stay between $-1$ and $1$, and the cosine is the same wave as the sine, a quarter turn ahead:

$$\sin(x + 2\pi) = \sin x, \qquad \cos x = \sin\!\left(x + \tfrac{\pi}{2}\right)$$

Landmarks worth knowing: $\sin x = 0$ at $x = 0, \pi, 2\pi, \ldots$; it peaks at $\pi/2$ and bottoms out at $3\pi/2$. Sine is **odd**, $\sin(-x) = -\sin x$; cosine is **even**, $\cos(-x) = \cos x$. And a horizontal line $y = c$ with $-1 < c < 1$ crosses each full period **twice**.`,
  symbols: [
    { tex: 'x', text: 'the angle, in radians, now used as the horizontal axis' },
    { tex: '2\\pi', text: 'the **period**: one full turn, after which the values repeat' },
    { tex: '\\tfrac{\\pi}{2}', text: 'a quarter turn: the shift between cosine and sine' },
  ],
  why: t`These two curves are the shape of every oscillation and wave in physics — a mass on a spring, an AC voltage, a sound wave, light. Reading their landmarks off the graph (zeros, peaks, where a level is crossed) is how you solve the equations they appear in.`,
  visual: {
    type: 'm0-unitcircle',
    title: 'Unrolling the circle',
    lead: t`Drag $P$ (or use the slider). Its height is carried across to the graph, which is traced up to the current angle. Switch the graph to cosine, or show both.`,
    tasks: [
      t`Take $P$ to $\pi/2$, $\pi$, $3\pi/2$ and $2\pi$: top of the circle, the peak; left side, a zero going down; bottom, the trough; back to the start.`,
      t`Show **both**: the cosine (blue) reaches each peak a quarter turn, $\pi/2$, before the sine does. Its graph is the sine slid left by $\pi/2$.`,
      t`Pick a height, say $0.5$: on the circle two points have it ($30^\circ$ and $150^\circ$), and the sine graph crosses $y = 0.5$ twice per turn.`,
    ],
    params: { mode: 'unroll', theta: 1, range: [0, 2 * PI], units: 'rad', fnChoice: true, fn: 'sin' },
  },
  example: {
    prompt: t`Solve $\sin x = -\tfrac12$ for $0 \le x < 2\pi$.`,
    visual: trigGraph({ curves: [SIN], extra: { hlines: [{ y: -0.5, color: 'gold' }], points: [{ x: N(7 * PI / 6), y: -0.5, color: 'gold', r: 5, label: '7π/6', labelAlign: 'center', labelDx: -22, labelDy: 13 }, { x: N(11 * PI / 6), y: -0.5, color: 'gold', r: 5, label: '11π/6', labelAlign: 'center', labelDx: 26, labelDy: 13 }] }, caption: t`One period of $\sin x$ and the level $-\tfrac12$: two crossings, both where the sine is negative.` }),
    steps: [
      { label: 'Reference angle', text: t`Ignore the sign: $\sin\alpha = \tfrac12$ at the acute angle $\alpha = \tfrac{\pi}{6}$.` },
      { label: 'Where is sine negative', text: t`Below the axis: $\pi < x < 2\pi$, the third and fourth quadrants. The graph dips below zero only there.` },
      { label: 'Third quadrant', text: t`Half a turn plus the reference angle: $x = \pi + \tfrac{\pi}{6} = \tfrac{7\pi}{6}$.` },
      { label: 'Fourth quadrant', text: t`A full turn minus the reference angle: $x = 2\pi - \tfrac{\pi}{6} = \tfrac{11\pi}{6}$.` },
      { label: 'Check', text: t`$\sin\tfrac{7\pi}{6} = \sin 210^\circ = -0.5$ ✓ and $\sin\tfrac{11\pi}{6} = \sin 330^\circ = -0.5$ ✓. A calculator’s $\sin^{-1}(-0.5) = -\tfrac{\pi}{6}$ is the same point as $\tfrac{11\pi}{6}$, outside the interval as written — and it misses $\tfrac{7\pi}{6}$ entirely.` },
    ],
    answer: t`$x = \tfrac{7\pi}{6}$ and $x = \tfrac{11\pi}{6}$.`,
  },
  practice: [
    mcq({
      id: 'which-curve', difficulty: 1,
      gen(r) {
        const k = r.int(0, 3), fns = ['sin(x)', 'cos(x)', '-sin(x)', '-cos(x)'];
        const start = [t`starts at $0$ and rises`, t`starts at its peak, $1$`, t`starts at $0$ and falls`, t`starts at its trough, $-1$`];
        return {
          prompt: t`Which function is graphed?`,
          visual: trigGraph({ curves: [{ fn: fns[k], color: 'accent' }], lo: -PI / 2, hi: 2 * PI, caption: t`One curve, with the angle axis in radians.` }),
          choices: [t`$y = \sin x$`, t`$y = \cos x$`, t`$y = -\sin x$`, t`$y = -\cos x$`],
          answer: k,
          why: Object.fromEntries([0, 1, 2, 3].filter((j) => j !== k).map((j) => [j, t`That curve ${start[j]} at $x = 0$; this one ${start[k]}.`])),
          hints: [t`Read the curve at $x = 0$: what is its value there, and is it going up or down?`],
          teach: t`At $x = 0$: $\sin$ is $0$ and rising, $\cos$ is at its peak $1$; a minus sign flips either upside down.`,
          explain: t`The curve ${start[k]} at $x = 0$, which is ${['$\\sin x$', '$\\cos x$', '$-\\sin x$', '$-\\cos x$'][k]}.`,
        };
      },
    }),
    num({
      id: 'count-zeros', difficulty: 2,
      gen(r) {
        const L = r.pick([7, 10, 12, 15, 20]), ans = Math.floor(L / PI) + 1;
        return {
          prompt: t`How many solutions does $\sin x = 0$ have in the interval $0 \le x \le ${L}$?`,
          answer: ans, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: ans - 1, feedback: t`Count $x = 0$ as well: $\sin 0 = 0$, and the interval includes it.` }, { value: Math.floor(L / (2 * PI)) + 1, feedback: t`The sine is zero every *half* turn, at every multiple of $\pi$, not only every $2\pi$.` }].filter((e) => e.value !== ans),
          hints: [t`$\sin x = 0$ exactly at $x = 0, \pi, 2\pi, 3\pi, \ldots$`, t`How many multiples of $\pi \approx 3.14$ are there from $0$ up to $${L}$?`],
          teach: t`The zeros of $\sin x$ are the multiples of $\pi$: one every half turn.`,
          explain: t`$x = k\pi \le ${L}$ for $k = 0, 1, \ldots, ${ans - 1}$ (since $${ans - 1}\pi = ${sig((ans - 1) * PI, 3)}$ and $${ans}\pi = ${sig(ans * PI, 3)}$): $${ans}$ solutions.`,
          visual: { type: 'graph', params: { x: [-0.5, L + 0.8], y: [-1.4, 1.4], aspect: 'wide', yticks: 4, curves: [{ fn: 'sin(x)', color: 'warn', domain: [0, L] }, { fn: 'sin(x)', color: 'warn', dash: true, width: 1.2 }], vlines: [{ x: L, color: 'gold', label: `x = ${L}` }] }, caption: t`$y = \sin x$, solid over the interval; the $x$-axis is marked in plain radians.` },
        };
      },
    }),
    num({
      id: 'second-root', difficulty: 3,
      gen(r) {
        const c = r.pick([0.3, 0.45, 0.6, 0.85]), a = Math.asin(c), ans = PI - a;
        return {
          prompt: t`$\sin x = ${c}$ has two solutions with $0 \le x < 2\pi$. Find the larger one, in radians.`,
          answer: ans, units: 'rad', tol: { rel: 0.003 },
          errors: [{ value: a, feedback: t`$${sig(a, 4)}$ is the smaller solution, the one a calculator gives. The other is its mirror image across $x = \pi/2$.` }, { value: a + PI, feedback: t`Half a period later the sine is $-${c}$, not $${c}$: the graph is below the axis there.` }, { value: 2 * PI - a, feedback: t`$2\pi - x$ gives the same *cosine*. For the same sine, use $\pi - x$.` }],
          hints: [t`A calculator gives one solution: $\sin^{-1}(${c}) = ${sig(a, 4)}$.`, t`The graph is symmetric about its peak at $x = \pi/2$, so the other crossing is at $\pi - ${sig(a, 4)}$.`],
          teach: t`If $x_1$ solves $\sin x = c$, so does $\pi - x_1$: the sine graph is symmetric about its peak.`,
          explain: t`$x = \pi - ${sig(a, 4)} = ${sig(ans, 4)}$ rad. Check: $\sin(${sig(ans, 4)}) = ${sig(Math.sin(ans), 3)}$ ✓.`,
          visual: trigGraph({ curves: [SIN], extra: { hlines: [{ y: c, color: 'gold' }] }, caption: t`$y = \sin x$ over one period and the level $y = ${c}$.` }),
        };
      },
    }),
    mcq({
      id: 'shift', difficulty: 2,
      prompt: t`The graph of $y = \cos x$ is the graph of $y = \sin x$:`,
      visual: trigGraph({ curves: [{ ...SIN, label: 'sin x', labelAt: N(PI / 2), labelDx: -14, labelDy: -12 }, { ...COS, label: 'cos x', labelAt: 0.05, labelDx: 4, labelDy: -12 }], lo: -PI, hi: 2 * PI, caption: t`Both curves, on the same axes.` }),
      choices: [t`shifted left by $\pi/2$`, t`shifted right by $\pi/2$`, t`shifted up by $1$`, t`shifted left by $\pi$`],
      answer: 0,
      why: {
        1: t`Shifting right by $\pi/2$ gives $\sin(x - \pi/2) = -\cos x$. The cosine peaks at $0$, *before* the sine’s peak at $\pi/2$.`,
        2: t`The curves have the same midline, $y = 0$, and the same range; only their timing differs.`,
        3: t`A shift by $\pi$ turns the sine upside down: $\sin(x + \pi) = -\sin x$.`,
      },
      hints: [t`Where is each curve’s first peak at or after $x = 0$?`],
      teach: t`$\cos x = \sin(x + \pi/2)$: the cosine runs a quarter period ahead of the sine.`,
      explain: t`The cosine peaks at $x = 0$, the sine at $\pi/2$; moving the sine left by $\pi/2$ lines the peaks up. In the formula, that is $\sin(x + \pi/2)$ — inside, plus means left, as in [transformations of graphs](#/lesson/m0.M0-4.2).`,
    }),
    mcq({
      id: 'steepest', difficulty: 2,
      prompt: t`Where in $0 \le x < 2\pi$ is $\sin x$ **increasing** most steeply?`,
      visual: { type: 'graph', params: { x: [-0.3, 6.6], y: [-1.5, 1.5], aspect: 'wide', yticks: 4, curves: [{ fn: 'sin(x)', color: 'warn' }], tangent: { fn: 'sin(x)', at: 2 } }, caption: t`Drag the gold point along the curve; the line is the tangent there. The $x$-axis is in plain radians.` },
      choices: [t`$x = 0$`, t`$x = \pi/2$`, t`$x = \pi$`, t`$x = 3\pi/2$`],
      answer: 0,
      why: {
        1: t`At $\pi/2$ the sine is at its peak: the slope there is zero.`,
        2: t`At $\pi$ the curve is as steep as it gets — but going *down* (slope $-1$).`,
        3: t`At $3\pi/2$ the sine is at its trough, momentarily flat.`,
      },
      hints: [t`The steepest points of a wave are where it crosses its midline, not at the peaks.`],
      teach: t`A sine wave is steepest at its zero crossings and flat at its peaks — the slope of $\sin x$ is $\cos x$.`,
      explain: t`At $x = 0$ the curve crosses upward with slope $\cos 0 = 1$, its largest. That slope is the derivative of $\sin x$, $\cos x$ — see [derivatives of trigonometric functions](#/lesson/math1210.C1-3.5).`,
    }),
    expr({
      id: 'as-cosine', difficulty: 3,
      gen(r) {
        const neg = r.bool(0.5);
        return {
          prompt: neg ? t`The graph of $y = -\sin x$ is a cosine graph shifted sideways. Write $-\sin x$ as $\cos(x + c)$ for a suitable $c$ (no sine allowed).` : t`The graph of $y = \sin x$ is a cosine graph shifted sideways. Write $\sin x$ as $\cos(x + c)$ for a suitable $c$ (no sine allowed).`,
          lhs: neg ? '-\\sin x' : '\\sin x',
          answer: neg ? 'cos(x + pi/2)' : 'cos(x - pi/2)', answerTeX: neg ? t`\cos\!\left(x + \tfrac{\pi}{2}\right)` : t`\cos\!\left(x - \tfrac{\pi}{2}\right)`,
          vars: { x: [-3, 3] }, forbid: ['sin'],
          errors: [{ answer: neg ? 'cos(x - pi/2)' : 'cos(x + pi/2)', feedback: neg ? t`$\cos(x - \pi/2) = \sin x$: that moved the cosine right. $-\sin x$ needs it moved left.` : t`$\cos(x + \pi/2) = -\sin x$: that moved the cosine left. The sine peaks *after* the cosine, so move the cosine right.` }],
          hints: [t`The cosine peaks at $x = 0$. Where does ${neg ? '$-\\sin x$' : '$\\sin x$'} first peak?`, t`It peaks at $x = ${neg ? '-\\pi/2' : '\\pi/2'}$, so the cosine must be shifted ${neg ? 'left' : 'right'} by $\pi/2$.`],
          teach: t`Line up the peaks: a shift of the cosine by a quarter period turns it into $\pm\sin x$.`,
          explain: neg ? t`$-\sin x$ peaks at $-\pi/2$: the cosine moved left by $\pi/2$, so $-\sin x = \cos(x + \pi/2)$.` : t`$\sin x$ peaks at $\pi/2$: the cosine moved right by $\pi/2$, so $\sin x = \cos(x - \pi/2)$.`,
          visual: trigGraph({ curves: [{ ...COS, label: 'cos x', labelAt: 0.05, labelDx: 4, labelDy: -12 }, { fn: neg ? '-sin(x)' : 'sin(x)', color: 'warn', label: neg ? '−sin x' : 'sin x', labelAt: N(neg ? 1.5 * PI : PI / 2), labelDx: 4, labelDy: -12 }], lo: -PI, hi: 2 * PI, caption: t`The cosine (blue) and the curve to rewrite (orange).` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3]), c = r.pick([-0.6, -0.2, 0.4, 0.7]), f = r.pick(['sin', 'cos']), F = '\\' + f, ans = 2 * n;
        return {
          prompt: t`How many solutions does $${F} x = ${c}$ have in $0 \le x < ${2 * n}\pi$?`,
          answer: ans, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: n, feedback: t`A level between $-1$ and $1$ is crossed **twice** in every period, once going up and once going down.` }, { value: 2, feedback: t`Two per period — and $0 \le x < ${2 * n}\pi$ holds $${n}$ periods.` }].filter((e, i, A) => A.findIndex((o) => o.value === e.value) === i),
          hints: [t`How many full periods of $2\pi$ fit in the interval?`, t`In each period, how many times does the curve cross the level $${c}$?`],
          teach: t`A level strictly between $-1$ and $1$ is hit twice per period.`,
          explain: t`$${n}$ periods, two crossings each: $${ans}$ solutions.`,
          visual: trigGraph({ curves: [{ fn: `${f}(x)`, color: f === 'sin' ? 'warn' : 'accent' }], lo: 0, hi: 2 * n * PI, step: PI, extra: { hlines: [{ y: c, color: 'gold' }] }, caption: t`The curve over the whole interval, and the level $${c}$.` }),
        };
      },
    }),
    num({
      id: 'cp-panel', difficulty: 3, transfer: true,
      gen(r) {
        const [fT, f] = r.pick([[t`half`, 0.5], [t`$\sqrt3/2 \approx 87\%$ of`, Math.sqrt(3) / 2], [t`$\sqrt2/2 \approx 71\%$ of`, Math.SQRT1_2]]), ans = Math.acos(f) / PI;
        return {
          prompt: t`A spin-stabilised probe turns steadily, and a solar panel on its side produces power $P = P_{\max}\cos\theta$ while it faces the Sun ($\cos\theta > 0$), where $\theta$ is the angle between the panel’s normal and the Sun. For what fraction of each turn does the panel produce more than ${fT} its peak power?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 2 * ans, feedback: t`That counts only the half turn the panel faces the Sun. The question asks for a fraction of the **whole** turn, $2\pi$.` }, { value: 1 - ans, feedback: t`That is the fraction of the turn *below* the threshold.` }],
          hints: [t`$\cos\theta > ${sig(f, 3)}$ for $-\alpha < \theta < \alpha$, with $\alpha = \cos^{-1}(${sig(f, 3)})$.`, t`That window is $2\alpha$ wide, out of a full turn of $2\pi$.`],
          teach: t`The time a sinusoid spends above a level is set by the angle where it crosses it: here $\cos\theta > c$ for $|\theta| < \cos^{-1}c$.`,
          explain: t`$\alpha = \cos^{-1}(${sig(f, 3)}) = ${piTeX(Math.acos(f))}$, so the window is $2\alpha$ out of $2\pi$: a fraction $\alpha/\pi = ${sig(ans, 3)}$.`,
          visual: trigGraph({ curves: [{ fn: 'max(cos(x), 0)', color: 'accent' }, { fn: 'cos(x)', color: 'accent', dash: true, width: 1.2 }], lo: -PI, hi: PI, y: [-1.2, 1.3], ylabel: 'P / Pmax', xlabel: 'θ', extra: { hlines: [{ y: N(f), color: 'gold' }] }, caption: t`Panel power over one turn (solid; zero when facing away) and the threshold. The model ignores the panel’s angle to the spin axis and any shading.` }),
        };
      },
    }),
    mcq({
      id: 'cp-equal', difficulty: 2,
      prompt: t`For which $x$ in $0 \le x < 2\pi$ is $\cos x = \sin x$?`,
      visual: trigGraph({ curves: [{ ...SIN, label: 'sin x', labelAt: N(PI / 2), labelDx: -14, labelDy: -12 }, { ...COS, label: 'cos x', labelAt: 0.05, labelDx: 4, labelDy: -12 }], caption: t`Both curves over one period.` }),
      choices: [t`$\tfrac{\pi}{4}$ and $\tfrac{5\pi}{4}$`, t`$\tfrac{\pi}{4}$ and $\tfrac{3\pi}{4}$`, t`$\tfrac{\pi}{4}$ only`, t`$\tfrac{\pi}{4}$ and $\tfrac{7\pi}{4}$`],
      answer: 0,
      why: {
        1: t`At $\tfrac{3\pi}{4}$ the sine is $+\tfrac{\sqrt2}{2}$ but the cosine is $-\tfrac{\sqrt2}{2}$.`,
        2: t`The curves cross twice per period; the second crossing, below the axis, is half a turn later.`,
        3: t`At $\tfrac{7\pi}{4}$ the cosine is positive and the sine negative.`,
      },
      hints: [t`$\cos x = \sin x$ means $\tan x = 1$. Where on the circle are the two coordinates equal?`],
      teach: t`$\tan x = 1$ every half turn: equal coordinates happen on the line $y = x$, at two opposite points of the circle.`,
      explain: t`The coordinates are equal at $45^\circ$ (both $+\tfrac{\sqrt2}{2}$) and $225^\circ$ (both $-\tfrac{\sqrt2}{2}$): $x = \tfrac{\pi}{4}$ and $\tfrac{5\pi}{4}$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §6.1 Graphs of the Sine and Cosine Functions', url: 'https://openstax.org/books/precalculus-2e/pages/6-1-graphs-of-the-sine-and-cosine-functions' },
  ],
});
