// Bifurcations and the logistic map (Taylor §12.8–12.9; Strogatz ch. 10):
// x → rx(1 − x). Fixed points 0 and 1 − 1/r, stable while |f′| = |2 − r|
// < 1; at r₁ = 3 the slope reaches −1 and a 2-cycle is born (a flip
// bifurcation); the 2-cycle's multiplier is −r² + 2r + 4, which reaches −1
// at r₂ = 1 + √6. The doublings r₃, r₄, … are computed (Newton's method on
// the cycle conditions) and their gaps shrink by Feigenbaum's δ =
// 4.669 201 6… (Feigenbaum 1978, cited), accumulating at r∞ = 3.569 946. The
// same δ appears in Taylor's pendulum (estimates from its doublings, 4.67
// and 4.66): universality. Windows inside chaos (period 3 at 1 + √8).
// Coding exercise: λ(r) = ⟨ln|r(1 − 2x)|⟩. Transfer: predicting the next
// doubling and the onset of chaos in a test rig. Numbers from
// model/cm5-chaos.js.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { K, LOG, sci, distinct, pendPic, logPic } from './_cm5.js';

const t = String.raw;
const D = K.TAYLOR_DOUBLINGS, DELTA = K.FEIGENBAUM_DELTA;
const R2 = 1 + Math.sqrt(6);
const f6 = (x) => x.toFixed(6);

export default lesson({
  id: 'phys3550.M10.3',
  title: 'Bifurcations and the logistic map',
  minutes: 18, difficulty: 3,
  intro: t`The pendulum's route to chaos takes a computer to see. A one-line rule shows the same route with a pencil: the **logistic map**, a crude model of a population that grows when small and starves when large. Iterate it and, as the growth parameter $r$ rises, its long-run behaviour goes from a steady value to a 2-cycle, a 4-cycle, an 8-cycle … — each **bifurcation** (a sudden change in the kind of motion) coming sooner than the last — then chaos. The gaps between successive doublings shrink by a fixed ratio, **Feigenbaum's** $\delta = 4.669\ldots$, and astonishingly it is the *same* number for the pendulum, for dripping taps, for convecting fluids and for electronic circuits: a universal constant of the period-doubling route.`,
  equation: t`x_{n+1} = r\,x_n(1 - x_n), \qquad \delta = \lim_{k\to\infty}\frac{r_k - r_{k-1}}{r_{k+1} - r_k} = 4.669\,201\,6\ldots`,
  symbols: [
    { tex: 'x_n', text: 'the state after $n$ steps: a population as a fraction of the most the habitat can hold (between 0 and 1)' },
    { tex: 'r', text: 'the growth parameter (0 to 4): how fast a small population multiplies each step' },
    { tex: 'n', text: 'the step number (one generation, or one drive period for a pendulum’s Poincaré section)' },
    { tex: 'r_k', text: 'the value of $r$ at which the period doubles for the $k$-th time: $r_1 = 3$, $r_2 = 1 + \\sqrt6$, …' },
    { tex: '\\delta', text: 'Feigenbaum’s constant: the limiting ratio of successive gaps between doublings (dimensionless)' },
  ],
  why: t`The logistic map is where the general theory of bifurcations, stability of fixed points and universality can all be done with algebra and a short program — and its δ is measured in real fluids and circuits, a rare exact prediction from chaos theory.`,
  visual: {
    type: 'cm5-logistic',
    title: 'From a fixed point to chaos',
    lead: t`Top: the **cobweb** — go up to the parabola $y = rx(1 - x)$ (one step), across to the line $y = x$ (the output becomes the next input), and repeat. The fixed points are where the two curves cross (green: stable; red: unstable). Bottom: the **bifurcation diagram**, the long-run values of $x$ for every $r$ from 2.8 to 4, with the doublings $r_1, r_2, \ldots$ dotted and your $r$ dashed.`,
    tasks: [
      t`Set $r = 2.8$: the cobweb spirals into the fixed point $1 - 1/r$. Raise $r$ past 3: the fixed point turns red and the cobweb settles on a square — a 2-cycle.`,
      t`Step $r$ through 3.5 and 3.56: periods 4 and 8. On the diagram each fork comes about 4.7 times sooner than the one before.`,
      t`Try $r = 3.7$ (chaos: $\lambda > 0$) and then $r = 3.835$: inside the chaos, a clean period-3 window.`,
    ],
    params: { r: 3.2, x0: 0.2, n: 60, panels: ['cobweb', 'bif'], bif: [2.8, 4], doublings: true, controls: ['r', 'x0'], rRange: [2.5, 4], readouts: ['r', 'period', 'lambda'] },
    caption: t`The logistic map iterated exactly (double precision). The bifurcation diagram plots 200 iterates after 600 discarded ones for each column of pixels; near each doubling the transient decays slowly, so the forks look slightly blurred there.`,
  },
  example: {
    prompt: t`Find the fixed points of the logistic map and where the nonzero one loses stability. Then find the 2-cycle born there, and the value $r_2$ at which it in turn loses stability. Estimate $\delta$ from the doublings computed beyond that.`,
    visual: logPic({ r: 3.3, x0: 0.2, n: 30, skip: 200, panels: ['cobweb'] }, t`The cobweb at $r = 3.3$ after 200 discarded steps: the orbit has settled onto a 2-cycle (the square) around the unstable fixed point (red).`),
    steps: [
      { label: 'Fixed points', text: t`$x^* = rx^*(1 - x^*)$ gives $x^* = 0$ or $x^* = 1 - 1/r$ (positive for $r > 1$).` },
      { label: 'Stability', text: t`A small error $\epsilon$ maps to $f'(x^*)\epsilon$: it shrinks if $|f'(x^*)| < 1$. With $f'(x) = r(1 - 2x)$, $f'(1 - 1/r) = 2 - r$. Stable for $1 < r < 3$; at $r_1 = 3$ the slope is $-1$ and errors flip sign each step without shrinking — a **flip** (period-doubling) bifurcation.` },
      { label: 'The 2-cycle', text: t`Points with $f(f(x)) = x$ but $f(x) \ne x$: dividing the fixed points out of the quartic leaves $r^2x^2 - r(r + 1)x + (r + 1) = 0$, so $x_\pm = \dfrac{r + 1 \pm \sqrt{(r - 3)(r + 1)}}{2r}$, real for $r > 3$.` },
      { label: 'Its stability', text: t`The 2-step slope is $f'(x_+)f'(x_-) = r^2(1 - 2x_+)(1 - 2x_-)$. Using $x_+ + x_- = (r + 1)/r$ and $x_+x_- = (r + 1)/r^2$, it is $-r^2 + 2r + 4$. It reaches $-1$ when $r^2 - 2r - 5 = 0$: $r_2 = 1 + \sqrt6 = ${f6(R2)}$.` },
      { label: 'Onward', text: t`The algebra gets out of hand, but Newton's method on "$f^{2^k}(x) = x$ with slope $-1$" gives $r_3 = ${f6(LOG.r[2])}$, $r_4 = ${f6(LOG.r[3])}$, $r_5 = ${f6(LOG.r[4])}$, $r_6 = ${f6(LOG.r[5])}$, accumulating at $r_\infty \approx ${f6(LOG.rinf)}$.` },
      { label: 'Feigenbaum', text: t`Gap ratios: $\dfrac{r_2 - r_1}{r_3 - r_2} = ${sci(LOG.dr[0], 4)}$, then $${sci(LOG.dr[1], 4)}$, $${sci(LOG.dr[2], 4)}$, $${sci(LOG.dr[3], 4)}$, $${sci(LOG.dr[4], 4)}$ … converging on $\delta = 4.6692$.` },
    ],
    answer: t`Fixed points $0$ and $1 - 1/r$; the second is stable for $1 < r < 3$. The 2-cycle $x_\pm = [r + 1 \pm \sqrt{(r - 3)(r + 1)}]/2r$ is stable until $r_2 = 1 + \sqrt6 \approx ${f6(R2)}$. The gap ratios $${sci(LOG.dr[0], 3)}, ${sci(LOG.dr[1], 3)}, ${sci(LOG.dr[2], 4)}, \ldots$ approach $\delta = 4.669$.`,
  },
  practice: [
    num({
      id: 'fixed-point', difficulty: 1,
      gen(r) {
        const rr = r.pick([1.5, 2, 2.4, 2.75]);
        const key = 1 - 1 / rr;
        return {
          prompt: t`At $r = ${rr}$ the logistic map settles to a steady value. What is it?`,
          answer: key, tol: { rel: 0.005 },
          errors: distinct([{ value: 1 / rr, feedback: t`Solve $x = rx(1 - x)$: dividing by $x$ gives $1 = r(1 - x)$, so $x = 1 - 1/r$, not $1/r$.` }, { value: 0, feedback: t`$x = 0$ is a fixed point too, but for $r > 1$ it is unstable: any population grows away from it.` }], key),
          hints: [t`A steady value satisfies $x = rx(1 - x)$ with $x \ne 0$.`],
          teach: t`The logistic map's nonzero fixed point is $x^* = 1 - 1/r$.`,
          explain: t`$1 = r(1 - x^*)$, so $x^* = 1 - 1/${rr} = ${sci(key, 4)}$. Its slope there, $2 - r = ${sci(2 - rr, 3)}$, has magnitude below 1, so it attracts.`,
          visual: logPic({ r: rr, x0: 0.1, n: 25, panels: ['cobweb'], fixed: false }, t`The cobweb from $x_0 = 0.1$ at this $r$ (25 steps).`),
        };
      },
    }),
    mcq({
      id: 'which-kind', difficulty: 2,
      gen(r) {
        const C = r.pick([
          { rr: 1.7, k: 0, slope: 0.3 }, { rr: 2.6, k: 1, slope: -0.6 }, { rr: 3.3, k: 2, slope: -1.3 },
        ]);
        const choices = [t`It attracts, approached from one side ($0 < f' < 1$)`, t`It attracts, approached with alternating overshoots ($-1 < f' < 0$)`, t`It repels: orbits leave it with alternating overshoots ($f' < -1$)`, t`It repels: orbits leave it on one side ($f' > 1$)`];
        const why = [
          t`Here $f'(x^*) = 2 - r = ${sci(C.slope, 2)}$: negative, so successive errors flip sign.`,
          t`Here $f'(x^*) = 2 - r = ${sci(C.slope, 2)}$${C.slope > 0 ? ': positive, so errors keep their sign' : ', of magnitude above 1: errors grow'}.`,
          t`Here $|f'(x^*)| = |2 - r| = ${sci(Math.abs(C.slope), 2)}$${Math.abs(C.slope) < 1 ? ', below 1: errors shrink' : ''}.`,
          t`For the logistic map's nonzero fixed point $f' = 2 - r$, which is below 1 for every $r > 1$.`,
        ];
        return {
          prompt: t`At $r = ${C.rr}$, how does the fixed point $x^* = 1 - 1/r$ behave?`,
          visual: logPic({ r: C.rr, x0: C.rr > 3 ? 0.66 : 0.12, n: 4, panels: ['cobweb'], fixed: false }, t`The parabola and the line $y = x$ at this $r$, with the first four cobweb steps.`),
          choices, answer: C.k,
          why: Object.fromEntries([0, 1, 2, 3].filter((i) => i !== C.k).map((i) => [i, why[i]])),
          hints: [t`$f'(x) = r(1 - 2x)$, so at $x^* = 1 - 1/r$ the slope is $2 - r$.`, t`$|f'| < 1$: attracts; negative $f'$: the orbit alternates sides.`],
          teach: t`A fixed point of a map attracts when $|f'(x^*)| < 1$, and the sign of $f'$ says whether orbits approach from one side or alternate.`,
          explain: t`$f'(x^*) = 2 - ${C.rr} = ${sci(C.slope, 2)}$. ${C.k === 0 ? 'Between 0 and 1: errors shrink without changing sign — a staircase in the cobweb.' : C.k === 1 ? 'Between −1 and 0: errors shrink and alternate — a spiral in the cobweb.' : 'Below −1: errors grow and alternate, and the orbit settles instead onto a 2-cycle around the fixed point.'}`,
        };
      },
    }),
    num({
      id: 'two-cycle', difficulty: 3,
      gen(r) {
        const rr = r.pick([3.1, 3.2, 3.3, 3.4]);
        const s = Math.sqrt((rr - 3) * (rr + 1)), xp = (rr + 1 + s) / (2 * rr), xm = (rr + 1 - s) / (2 * rr);
        return {
          prompt: t`At $r = ${rr}$ the logistic map settles onto a 2-cycle, alternating between two values. What is the **larger** one?`,
          answer: xp, tol: { rel: 0.003 },
          errors: distinct([{ value: xm, feedback: t`That is the smaller of the two: take the $+$ sign.` }, { value: 1 - 1 / rr, feedback: t`That is the fixed point, now unstable; the 2-cycle straddles it.` }, { value: (rr + 1 + s) / rr, feedback: t`Divide by $2r$, from the quadratic formula.` }], xp),
          hints: [t`The 2-cycle points satisfy $r^2x^2 - r(r + 1)x + (r + 1) = 0$.`, t`$x_\pm = \dfrac{r + 1 \pm \sqrt{(r - 3)(r + 1)}}{2r}$.`],
          teach: t`Just past $r = 3$ the 2-cycle's points are $x_\pm = [r + 1 \pm \sqrt{(r - 3)(r + 1)}]/2r$, straddling the old fixed point.`,
          explain: t`$\sqrt{(${rr} - 3)(${rr} + 1)} = ${sci(s, 4)}$, so $x_+ = (${sci(rr + 1, 3)} + ${sci(s, 4)})/${sci(2 * rr, 3)} = ${sci(xp, 4)}$ and $x_- = ${sci(xm, 4)}$. Check: $${rr}\times${sci(xp, 4)}\times(1 - ${sci(xp, 4)}) = ${sci(K.logistic(rr, xp), 4)} = x_-$.`,
          visual: logPic({ r: rr, x0: 0.15, n: 6, panels: ['cobweb'], fixed: false }, t`The parabola and the line at this $r$, with the first six cobweb steps from $x_0 = 0.15$ (the transient, before the orbit settles).`),
        };
      },
    }),
    num({
      id: 'gap-ratio', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 3, 4]);
        const a = +LOG.r[k - 1].toFixed(6), b = +LOG.r[k].toFixed(6), c = +LOG.r[k + 1].toFixed(6);
        const key = (b - a) / (c - b);
        return {
          prompt: t`The logistic map's period doubles at $r_${k} = ${a}$, $r_${k + 1} = ${b}$ and $r_${k + 2} = ${c}$. Estimate Feigenbaum's $\delta$ from these three.`,
          answer: key, tol: { rel: 0.002 },
          errors: distinct([{ value: (c - b) / (b - a), feedback: t`Upside down: $\delta$ is the earlier (bigger) gap over the later one, so it is larger than 1.` }, { value: c / b, feedback: t`$\delta$ is a ratio of *gaps*, not of the parameters themselves.` }], key),
          hints: [t`$\delta \approx (r_{k+1} - r_k)/(r_{k+2} - r_{k+1})$.`],
          teach: t`Successive gaps between period doublings shrink by about $\delta = 4.669$.`,
          explain: t`$(${b} - ${a})/(${c} - ${b}) = ${sci(b - a, 4)}/${sci(c - b, 4)} = ${sci(key, 4)}$. Later triples get closer to $4.6692$; the first gaps are not yet in the self-similar regime.`,
          visual: logPic({ r: 3.5, x0: 0.2, panels: ['bif'], bif: [2.9, 3.6], bifY: [0.3, 0.95], doublings: true, marks: false }, t`The bifurcation diagram for $2.9 \le r \le 3.6$ with the doublings dotted (violet).`),
        };
      },
    }),
    num({
      id: 'accumulate', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, 4]);
        const a = +LOG.r[k - 1].toFixed(6), b = +LOG.r[k].toFixed(6);
        const key = b + (b - a) / (DELTA - 1);
        return {
          prompt: t`The doublings come at $r_${k} = ${a}$ and $r_${k + 1} = ${b}$. If every later gap is $1/\delta$ of the one before ($\delta = 4.669$), where do they accumulate — where does chaos begin? Give 5 significant figures.`,
          answer: key, tol: { rel: 2e-5 },
          errors: distinct([{ value: b + (b - a) / DELTA, feedback: t`That adds only the next gap. The remaining gaps form a geometric series: $(b - a)(1/\delta + 1/\delta^2 + \cdots) = (b - a)/(\delta - 1)$.` }, { value: b + (b - a) * DELTA, feedback: t`The gaps *shrink* by $\delta$: divide, do not multiply.` }], key, 2e-5),
          hints: [t`The later gaps are $(r_{${k + 1}} - r_${k})/\delta$, $(r_{${k + 1}} - r_${k})/\delta^2$, …`, t`Their sum is $(r_{${k + 1}} - r_${k})/(\delta - 1)$; add it to $r_{${k + 1}}$.`],
          teach: t`Because the gaps shrink geometrically, infinitely many doublings fit before a finite $r_\infty$.`,
          explain: t`$r_\infty \approx ${b} + ${sci(b - a, 4)}/${sci(DELTA - 1, 4)} = ${sci(key, 6)}$. The true accumulation point is $3.569\,946$; the estimate improves as $k$ grows.`,
          visual: logPic({ r: 3.56, x0: 0.2, panels: ['bif'], bif: [3.4, 3.6], bifY: [0.3, 0.92], doublings: true, marks: false }, t`The bifurcation diagram for $3.4 \le r \le 3.6$: the forks crowd together toward the onset of chaos.`),
        };
      },
    }),
    mcq({
      id: 'universal', difficulty: 2,
      prompt: t`Taylor's pendulum doubles its period at drive strengths $\gamma_1 = ${D[0].toFixed(4)}$, $\gamma_2 = ${D[1].toFixed(4)}$, $\gamma_3 = ${D[2].toFixed(4)}$ and $\gamma_4 = ${D[3].toFixed(4)}$. Which property does it share with the logistic map?`,
      visual: pendPic({ gamma: 1.07, panels: ['bif'], bif: [1.06, 1.086], bifN: 160, marks: false }, t`The pendulum's bifurcation diagram for $1.06 \le \gamma \le 1.086$: $\phi$ once per drive period after a long transient.`),
      choices: [t`The ratio of successive gaps, about 4.67 — Feigenbaum's $\delta$`, t`The values of the doubling parameters themselves`, t`The period-2 formula $x_\pm = [r + 1 \pm \sqrt{(r - 3)(r + 1)}]/2r$`, t`Nothing: a pendulum and a population model have different equations`],
      answer: 0,
      why: { 1: t`$\gamma_1 = ${D[0].toFixed(4)}$ and $r_1 = 3$ have nothing in common: the parameters are in different units and set by details. The *ratios* are what agree.`, 2: t`That formula belongs to the logistic map alone.`, 3: t`The equations differ, but the period-doubling route has the same geometry near its accumulation point, whatever the system.` },
      hints: [t`Compute $(\gamma_2 - \gamma_1)/(\gamma_3 - \gamma_2)$.`],
      teach: t`Feigenbaum's δ is universal: every smooth system that doubles its period with a single hump shows it.`,
      explain: t`$(\gamma_2 - \gamma_1)/(\gamma_3 - \gamma_2) = ${sci((D[1] - D[0]) / (D[2] - D[1]), 3)}$ and $(\gamma_3 - \gamma_2)/(\gamma_4 - \gamma_3) = ${sci((D[2] - D[1]) / (D[3] - D[2]), 3)}$ — the logistic map's $4.669$ to within the accuracy of the early doublings. Feigenbaum showed (1978) that the constant follows from the self-similarity of the cascade, not from any one equation.`,
    }),
    code({
      id: 'lyap-logistic', difficulty: 3,
      prompt: t`Write \`lyapunov(r, x0=0.2, skip=1000, n=20000)\`: iterate the logistic map \`skip\` times from \`x0\` to lose the transient, then **return** the average of $\ln|r(1 - 2x)|$ over the next \`n\` iterates (computing it at each $x$ before stepping on). The program prints $\lambda$ for a few values of $r$.`,
      starter: t`import math

def lyapunov(r, x0=0.2, skip=1000, n=20000):
    # 1. iterate x -> r x (1 - x) skip times
    # 2. average ln|r(1 - 2x)| over the next n iterates
    pass

for r in (2.5, 3.2, 3.5, 3.7, 4.0):
    print(r, lyapunov(r))
`,
      answer: t`import math

def lyapunov(r, x0=0.2, skip=1000, n=20000):
    x = x0
    for _ in range(skip):
        x = r * x * (1 - x)
    total = 0.0
    for _ in range(n):
        total += math.log(abs(r * (1 - 2 * x)))
        x = r * x * (1 - x)
    return total / n

for r in (2.5, 3.2, 3.5, 3.7, 4.0):
    print(r, lyapunov(r))
`,
      tests: [
        { name: '$\\lambda(2.5) = \\ln 0.5$: a stable fixed point with slope $-0.5$', code: 'abs(lyapunov(2.5) - math.log(0.5)) < 1e-9' },
        { name: 'negative on the 2-cycle at $r = 3.2$', code: '-1.0 < lyapunov(3.2) < -0.8' },
        { name: 'positive in chaos at $r = 3.7$ (about 0.35)', code: '0.3 < lyapunov(3.7) < 0.4' },
        { name: '$\\lambda(4) \\approx \\ln 2$', code: 'abs(lyapunov(4.0, n=200000) - math.log(2)) < 0.01' },
        { name: 'the values are printed', code: '"3.7" in _stdout' },
      ],
      hints: [t`Two loops: one that only steps \`x\`, then one that adds \`math.log(abs(r * (1 - 2 * x)))\` before stepping.`, t`Return \`total / n\`.`],
      teach: t`For a map, the Lyapunov exponent is the average of $\ln|f'(x_n)|$ along the orbit: the average log stretch per step.`,
      explain: t`Each step multiplies a small error by $f'(x_n)$, so after $n$ steps it is multiplied by the product of the slopes; its log is the sum of $\ln|f'(x_n)|$, and $\lambda$ is the average. At $r = 2.5$ every slope is $2 - r = -0.5$, giving $\ln 0.5$ exactly; at $r = 4$ the average is exactly $\ln 2$ (for almost every start), the error doubling each step.`,
    }),
    mcq({
      id: 'window', difficulty: 2,
      prompt: t`Beyond $r_\infty \approx 3.57$ the map is mostly chaotic. What does it do at $r = 3.835$?`,
      visual: logPic({ r: 3.835, x0: 0.2, panels: ['bif'], bif: [3.7, 4], marks: false }, t`The bifurcation diagram for $3.7 \le r \le 4$, with its white gaps.`),
      choices: [t`It settles into a 3-cycle: $r = 3.835$ lies in a periodic window inside the chaos`, t`It is chaotic, like every $r$ beyond $r_\infty$`, t`It settles to the fixed point $1 - 1/r$`, t`It escapes to $-\infty$`],
      answer: 0,
      why: { 1: t`Not every $r$: the white gaps in the diagram are periodic windows, and the widest, from $1 + \sqrt8 = 3.828$, has period 3.`, 2: t`The fixed point has slope $2 - r = -1.835$ there: unstable.`, 3: t`Orbits escape only for $r > 4$, when the parabola's top pokes above 1.` },
      hints: [t`Look for the widest white gap in the picture.`],
      teach: t`Chaos past $r_\infty$ is interrupted by periodic windows, the widest a period-3 window starting at $1 + \sqrt8$.`,
      explain: t`At $r = 3.835$ the orbit settles onto 3 values (its Lyapunov exponent is $${sci(K.lyapLogistic(3.835), 2)}$ per step, negative). The window begins at $1 + \sqrt 8 = ${f6(1 + Math.sqrt(8))}$ and then has its own period-doubling cascade (3, 6, 12, …) with the same $\delta$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rig', difficulty: 3, transfer: true,
      gen(r) {
        const a1 = r.pick([2.0, 2.4, 3.1]), g = r.pick([0.6, 0.8, 1.1]);
        const a2 = +(a1 + g).toFixed(3), a3 = +(a2 + g / 4.7).toFixed(3);
        const key = a3 + (a3 - a2) / (DELTA - 1);
        return {
          prompt: t`*A hypothetical test rig.* Engineers shake a tank of propellant simulant up and down to study sloshing. As they raise the shaker amplitude, the surface's motion doubles its period at amplitudes of ${a1} mm, ${a2} mm and ${a3} mm. Assuming the cascade follows Feigenbaum's scaling ($\delta = 4.669$), at what amplitude should they expect chaotic sloshing to begin? Give 4 significant figures.`,
          answer: key, units: 'mm', tol: { rel: 4e-4 },
          errors: distinct([{ value: a3 + (a3 - a2) / DELTA, feedback: t`That is only the next doubling. Add all the remaining gaps: $(a_3 - a_2)/(\delta - 1)$.` }, { value: a3 + (a3 - a2) * DELTA, feedback: t`The gaps shrink by $\delta$ each time.` }], key, 1e-3),
          hints: [t`After $a_3$ the gaps are $(a_3 - a_2)/\delta$, $(a_3 - a_2)/\delta^2$, …`, t`Their sum is $(a_3 - a_2)/(\delta - 1)$.`],
          teach: t`Feigenbaum scaling predicts where chaos sets in from the first few doublings, in any system that takes this route.`,
          explain: t`$a_\infty \approx ${a3} + (${a3} - ${a2})/${sci(DELTA - 1, 4)} = ${sci(key, 4)}$ mm. (Check: the measured gap ratio is $${sci((a2 - a1) / (a3 - a2), 3)}$, close to $\delta$.) Universality makes this prediction possible without solving the fluid's equations — but only for the period-doubling route; other routes to chaos exist.`,
          visual: pendPic({ gamma: 1.07, panels: ['bif'], bif: [1.06, 1.086], bifN: 160, marks: false }, t`What a period-doubling cascade looks like (here Taylor's pendulum; the rig's own diagram is not shown).`),
        };
      },
    }),
    num({
      id: 'cp-slope', difficulty: 2,
      gen(r) {
        const rr = r.pick([3.05, 3.15, 3.25, 3.4]);
        const key = -rr * rr + 2 * rr + 4;
        return {
          prompt: t`The logistic map's 2-cycle has a two-step slope $f'(x_+)f'(x_-) = -r^2 + 2r + 4$. What is it at $r = ${rr}$, and is the cycle stable? (Enter the slope.)`,
          answer: key, tol: { rel: 0.003 },
          errors: distinct([{ value: 2 - rr, feedback: t`$2 - r$ is the slope at the fixed point, not around the 2-cycle.` }, { value: rr * rr - 2 * rr - 4, feedback: t`Check the sign: $-r^2 + 2r + 4$.` }], key),
          hints: [t`Substitute $r = ${rr}$.`, t`The cycle is stable while the slope lies between $-1$ and $1$.`],
          teach: t`A cycle is stable when the product of the slopes around it has magnitude below 1.`,
          explain: t`$-(${rr})^2 + 2(${rr}) + 4 = ${sci(key, 4)}$: ${Math.abs(key) < 1 ? 'between −1 and 1, so the 2-cycle attracts' : 'below −1, so the 2-cycle has itself become unstable and a 4-cycle has taken over'} (it loses stability at $1 + \sqrt6 = ${f6(R2)}$).`,
          visual: logPic({ r: rr, x0: 0.2, n: 20, skip: 300, panels: ['cobweb'], fixed: false }, t`The cobweb at this $r$ after 300 discarded steps.`),
        };
      },
    }),
    mcq({
      id: 'cp-limit', difficulty: 2,
      prompt: t`Why must the doublings accumulate at a finite $r_\infty$ rather than going on for ever as $r$ increases?`,
      visual: logPic({ r: 3.5, x0: 0.2, panels: ['bif'], bif: [2.9, 3.6], bifY: [0.3, 0.95], doublings: true, marks: false }, t`The cascade for $2.9 \le r \le 3.6$, doublings dotted.`),
      choices: [t`The gaps shrink geometrically (by $\delta$ each time), and a geometric series of gaps has a finite sum`, t`Because $r$ cannot exceed 4`, t`Because a computer cannot represent periods longer than $2^{53}$`, t`They do not: the doublings continue up to $r = 4$`],
      answer: 0,
      why: { 1: t`The cap at 4 is not the reason: the doublings pile up at $3.5699$, well below it.`, 2: t`$r_\infty$ is a property of the map, found by analysis, not a limit of computer arithmetic.`, 3: t`Past $3.5699$ the map is mostly chaotic, with periodic windows.` },
      hints: [t`Add the gaps: $g + g/\delta + g/\delta^2 + \cdots$.`],
      teach: t`Infinitely many doublings fit in a finite range because their spacing shrinks geometrically.`,
      explain: t`$g(1 + 1/\delta + 1/\delta^2 + \cdots) = g\delta/(\delta - 1)$ is finite, so infinitely many doublings happen before $r_\infty \approx 3.569\,946$ — the onset of chaos.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 12: bifurcation diagrams and the logistic map', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'M. J. Feigenbaum, Quantitative universality for a class of nonlinear transformations, J. Stat. Phys. 19, 25 (1978)', url: 'https://doi.org/10.1007/BF01020332' },
    { label: 'S. H. Strogatz, Nonlinear Dynamics and Chaos, 2nd ed. (CRC Press, 2015), ch. 10: one-dimensional maps', url: 'https://doi.org/10.1201/9780429492563' },
  ],
});
