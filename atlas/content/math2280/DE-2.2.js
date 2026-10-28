// Linear first-order equations: the integrating factor, the structure
// "transient + particular", and the two-step radioactive decay chain.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac, tex } from '../../src/core/format.js';

const t = String.raw;
const LN2 = Math.log(2);

// two-step chains A → B → (stable or long-lived), half-lives in hours (NUBASE2020 / NNDC)
const CHAINS = [
  { a: 'molybdenum-99', b: 'technetium-99m', TA: 65.98, TB: 6.007, use: 'the medical isotope generator' },
  { a: 'tellurium-132', b: 'iodine-132', TA: 76.9, TB: 2.295, use: 'fallout from fission' },
  { a: 'barium-140', b: 'lanthanum-140', TA: 306.1, TB: 40.27, use: 'fission products in spent fuel' },
  { a: 'lead-212', b: 'bismuth-212', TA: 10.64, TB: 1.009, use: 'the thorium decay series' },
];
// the daughter's share N_B/N_A(0) at time t, starting with no daughter
const daughter = (la, lb, tt) => (la / (lb - la)) * (Math.exp(-la * tt) - Math.exp(-lb * tt));
const peak = (la, lb) => Math.log(lb / la) / (lb - la);
const co = (k) => (k === 1 ? '' : String(k));

// the Explore graph: decay constants from the sliders, with the daughter's formula
// written so that equal half-lives give its limit instead of 0/0
const LA = 'ln(2)/TA', D = '(ln(2)/TB - ln(2)/TA + 1e-9)';
const NA = `exp(-${LA}*x)`, NB = `(${LA})/${D}*(exp(-${LA}*x) - exp(-(${LA} + ${D})*x))`;
const TSTAR = `ln((${LA} + ${D})/(${LA}))/${D}`;
const LB = `(${LA} + ${D})`;
const AB = `${LB}/(${LA})*${NB}`;                                   // the daughter's activity over the parent's starting activity
const at = (expr) => expr.replaceAll('*x', `*(${TSTAR})`);

export default lesson({
  id: 'math2280.DE-2.2',
  title: 'Linear equations and integrating factors',
  minutes: 12, difficulty: 3,
  intro: t`A first-order equation is **linear** when it can be written in standard form $y' + p(t)\,y = q(t)$. Multiplying by the **integrating factor** $\mu = e^{\int p\,dt}$ turns the left side into the derivative of one product, $(\mu y)' = \mu q$, and a single integration finishes the job:

$$y(t) = \frac{1}{\mu(t)}\left(\int \mu(t)\,q(t)\,dt + C\right), \qquad \mu(t) = e^{\int p(t)\,dt}$$

The answer always has the same shape: a particular solution plus $C/\mu$, a solution of the homogeneous equation $y' + py = 0$ — for constant $p > 0$, a **transient** $Ce^{-pt}$ that dies away. That structure, not the formula, is what carries over to circuits, oscillators and every linear system you will meet.`,
  symbols: [
    { tex: t`p(t)`, text: t`the coefficient of $y$ once the $y'$ term has coefficient 1; a decay rate when it is a positive constant, in $\text{s}^{-1}$` },
    { tex: t`q(t)`, text: t`the source or forcing: whatever feeds $y$ from outside` },
    { tex: t`\mu(t)`, text: t`the integrating factor $e^{\int p\,dt}$; any antiderivative of $p$ will do, since a constant factor cancels` },
    { tex: t`C`, text: t`the constant of integration, fixed by the initial condition — and divided by $\mu$ along with everything else` },
  ],
  why: t`Every linear first-order system in physics — an RC circuit, a sensor’s lag, a parent nucleus feeding a daughter — is solved by this one integrating factor, and its “transient plus particular” shape returns in every higher-order linear equation.`,
  visual: {
    type: 'graph',
    title: 'A parent nucleus feeding a daughter',
    lead: t`A parent $A$ decays into a daughter $B$, which decays in turn. The parent obeys $N_A' = -\lambda_A N_A$; the daughter gains what the parent loses and loses its own decays, $N_B' + \lambda_B N_B = \lambda_A N_A$ — a linear equation, solved by the integrating factor $e^{\lambda_B t}$. Set the two half-lives and watch the daughter rise, peak and follow its parent down.`,
    tasks: [
      'The defaults are the hospital generator: molybdenum-99 (66 h) feeding technetium-99m (6.0 h). The daughter peaks after about 23 h, then rides on its parent’s decay.',
      'Switch to activities: once the daughter has peaked its activity runs just above its parent’s (transient equilibrium).',
      'Make the half-lives equal: the formula’s 0/0 turns into λt e^(−λt), the shape the integrating factor gives directly.',
    ],
    params: {
      x: [0, 120], y: [0, 1.05], xlabel: 't (hours)', ylabel: 'fraction of starting value',
      sliders: [
        { key: 'TA', label: 'Parent half-life $T_A$', min: 2, max: 100, step: 1, value: 66, unit: t`\text{h}`, explain: t`$\lambda_A = \ln 2 / T_A$: the parent’s decay constant.` },
        { key: 'TB', label: 'Daughter half-life $T_B$', min: 1, max: 100, step: 1, value: 6, unit: t`\text{h}`, explain: t`$\lambda_B = \ln 2 / T_B$: how fast the daughter decays once made.` },
      ],
      choices: [{ key: 'show', label: 'Plot', options: [[0, 'Numbers of nuclei'], [1, 'Activities (decays per second)']], value: 0 }],
      curves: [
        { fn: NA, color: 'accent', label: 'parent A', labelAt: 100, labelDy: -12 },
        { fn: NB, color: 'gold', label: 'daughter B', labelAt: 60, labelDy: -12, when: 'step(0.5 - show)' },
        { fn: `1 - ${NA} - ${NB}`, color: 'ink3', dash: true, width: 1.6, label: 'decayed past B', labelAt: 90, labelDy: 14, when: 'step(0.5 - show)' },
        { fn: AB, color: 'gold', label: 'daughter B', labelAt: 60, labelDy: -12, when: 'step(show - 0.5)' },
      ],
      points: [{ x: TSTAR, y: `(1 - show)*${at(NB)} + show*${at(AB)}`, color: 'gold', label: 'peak' }],
      readouts: [
        { label: 'daughter peaks at', expr: TSTAR, unit: t`\text{h}`, digits: 3 },
        { label: 'its peak share of $N_0$', expr: at(NB), digits: 3 },
      ],
    },
    caption: t`Numbers of nuclei as fractions of the parent’s starting number — or activities, $\lambda N$, as fractions of the parent’s starting activity — with no daughter at $t = 0$. Both peak at the same moment. Each decay is a random event; these smooth curves are the averages for a large sample. Real molybdenum-99 sends about 88% of its decays to technetium-99m; this model sends all of them.`,
  },
  example: {
    prompt: t`A technetium generator starts with $N_0$ nuclei of molybdenum-99 ($T_A = 66.0$ h) and no technetium-99m ($T_B = 6.01$ h). Find the number of technetium nuclei $N_B(t)$, and the time at which it is largest — when a hospital should “milk” the generator.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 96], y: [0, 1.05], xlabel: 't (hours)', ylabel: 'fraction of N₀',
        curves: [
          { fn: `exp(-${LN2 / 66}*x)`, color: 'accent', label: 'molybdenum-99', labelAt: 75, labelDy: -12 },
          { fn: `${(LN2 / 66) / (LN2 / 6.01 - LN2 / 66)}*(exp(-${LN2 / 66}*x) - exp(-${LN2 / 6.01}*x))`, color: 'gold', label: 'technetium-99m', labelAt: 55, labelDy: -12 },
        ],
        vlines: [{ x: peak(LN2 / 66, LN2 / 6.01), label: 'peak', color: 'gold' }],
      },
      caption: t`The parent decays exponentially; the daughter rises, peaks after about a day and then follows the parent at about a tenth of its number. Branching to other states is ignored.`,
    },
    steps: [
      { label: 'Model', text: t`The parent obeys $N_A' = -\lambda_A N_A$, so $N_A = N_0e^{-\lambda_A t}$. The daughter gains every parent decay and loses its own: $N_B' = \lambda_A N_A - \lambda_B N_B$, with $\lambda = \ln 2/T$: $\lambda_A = ${fmt(LN2 / 66, 3)}\ \text{h}^{-1}$ and $\lambda_B = ${fmt(LN2 / 6.01, 3)}\ \text{h}^{-1}$.` },
      { label: 'Standard form', text: t`$N_B' + \lambda_B N_B = \lambda_A N_0e^{-\lambda_A t}$: linear, with $p = \lambda_B$ and $q = \lambda_A N_0 e^{-\lambda_A t}$. (It is not separable: the right side mixes $t$ and $N_B$ in a sum.)` },
      { label: 'Integrating factor', text: t`$\mu = e^{\lambda_B t}$, and $(e^{\lambda_B t}N_B)' = \lambda_A N_0\,e^{(\lambda_B - \lambda_A)t}$.` },
      { label: 'Integrate', text: t`$e^{\lambda_B t}N_B = \dfrac{\lambda_A N_0}{\lambda_B - \lambda_A}e^{(\lambda_B - \lambda_A)t} + C$. At $t = 0$, $N_B = 0$, so $C = -\dfrac{\lambda_A N_0}{\lambda_B - \lambda_A}$. Dividing by $\mu$:
$$N_B(t) = \frac{\lambda_A N_0}{\lambda_B - \lambda_A}\left(e^{-\lambda_A t} - e^{-\lambda_B t}\right).$$` },
      { label: 'The peak', text: t`$N_B' = 0$ when $\lambda_A e^{-\lambda_A t} = \lambda_B e^{-\lambda_B t}$, so $t^* = \dfrac{\ln(\lambda_B/\lambda_A)}{\lambda_B - \lambda_A} = \dfrac{\ln ${fmt((LN2 / 6.01) / (LN2 / 66), 4)}}{${fmt(LN2 / 6.01 - LN2 / 66, 4)}\ \text{h}^{-1}} \approx ${fmt(peak(LN2 / 66, LN2 / 6.01), 3)}$ h.` },
      { label: 'Sense check', text: t`After a few daughter half-lives $e^{-\lambda_B t}$ is negligible and $N_B/N_A \to \lambda_A/(\lambda_B - \lambda_A) \approx ${fmt((LN2 / 66) / (LN2 / 6.01 - LN2 / 66), 2)}$: the daughter rides on its parent (**transient equilibrium**). Hospitals do elute these generators about once a day.` },
    ],
    answer: t`$N_B(t) = \dfrac{\lambda_A N_0}{\lambda_B - \lambda_A}\left(e^{-\lambda_A t} - e^{-\lambda_B t}\right)$, largest after about ${fmt(peak(LN2 / 66, LN2 / 6.01), 3)} h.`,
  },
  practice: [
    expr({
      id: 'ramp', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 4]), m = r.pick([1, 2, 3]), y0 = r.pick([0, 1, 2]);
        const b = a * m, c = y0 + m / a;
        const ans = `${m}t - ${m / a} + (${c})*exp(-${a}t)`;
        return {
          prompt: t`Solve $y' + ${co(a)}y = ${b}t$ with $y(0) = ${y0}$.`,
          answer: ans, answerTeX: t`y = ${co(m)}t - ${frac(m / a)} + ${frac(c)}\,e^{-${co(a)}t}`, lhs: 'y',
          vars: { t: [-1, 2] },
          integrand: `${b}t - ${a}*(${ans})`,
          errors: [
            { answer: `${m}t - ${m / a} + ${y0}*exp(-${a}t)`, feedback: t`Apply $y(0) = ${y0}$ to the whole solution: at $t = 0$ it is $-${frac(m / a)} + C$, so $C = ${frac(c)}$.` },
            { answer: `${m}t + (${c - (2 * m) / a})*exp(-${a}t) + ${m / a}`, feedback: t`Sign slip in the parts integral: $\int t e^{${co(a)}t}dt = \left(\dfrac{t}{${a}} - \dfrac{1}{${a * a}}\right)e^{${co(a)}t}$.` },
          ],
          hints: [t`$\mu = e^{${co(a)}t}$, so $(e^{${co(a)}t}y)' = ${b}t\,e^{${co(a)}t}$. Integrate by parts.`, t`$\int ${b}t\,e^{${co(a)}t}dt = ${b}\left(\dfrac{t}{${a}} - \dfrac{1}{${a * a}}\right)e^{${co(a)}t}$, so $y = ${co(m)}t - ${frac(m / a)} + Ce^{-${co(a)}t}$.`],
          teach: t`A polynomial source gives a polynomial particular solution plus the transient $Ce^{-at}$; the initial condition fixes $C$ last.`,
          explain: t`$e^{${co(a)}t}y = ${b}\left(\tfrac{t}{${a}} - \tfrac{1}{${a * a}}\right)e^{${co(a)}t} + C$, so $y = ${co(m)}t - ${frac(m / a)} + Ce^{-${co(a)}t}$; $y(0) = -${frac(m / a)} + C = ${y0}$ gives $C = ${frac(c)}$. As $t$ grows the transient dies and $y$ tracks the line $${co(m)}t - ${frac(m / a)}$, lagging $${frac(1 / a)}$ behind the ramp $${co(m)}t$.`,
          visual: { type: 'de-slopefield', params: { f: `${b}*t - ${a}*y`, x: [0, 3], y: [-1.5, 3 * m + 1], grid: [17, 14], points: [{ x: 0, y: y0, color: 'gold', label: 'start' }] }, caption: t`The slope field of $y' = ${b}t - ${co(a)}y$; every solution is pulled onto one straight line.` },
        };
      },
    }),
    expr({
      id: 'over-t', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, -1, 3]);
        const ans = `t*sin(t) + ${k}t`;
        const kpi = k === 1 ? t`\pi` : k === -1 ? t`-\pi` : t`${k}\pi`;
        return {
          prompt: t`Solve $y' - \dfrac{y}{t} = t\cos t$ for $t > 0$, with $y(\pi) = ${kpi}$.`,
          answer: ans, answerTeX: t`y = t\sin t ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}t`, lhs: 'y',
          vars: { t: [0.5, 3] },
          integrand: `(${ans})/t + t*cos(t)`,
          errors: [
            { answer: `t*sin(t) + ${k}`, feedback: t`Multiply the constant by $t$ as well: from $\dfrac{y}{t} = \sin t + C$, $\;y = t\sin t + Ct$.` },
            { answer: `t*sin(t) + cos(t) + ${k}t`, feedback: t`$(y/t)' = \cos t$ integrates to $\sin t$ alone — no parts needed once you have the integrating factor.` },
          ],
          hints: [t`$p(t) = -\dfrac1t$, so $\mu = e^{-\ln t} = \dfrac1t$.`, t`$\left(\dfrac{y}{t}\right)' = \dfrac1t\cdot t\cos t = \cos t$, so $\dfrac yt = \sin t + C$.`],
          teach: 'With a variable coefficient the integrating factor is a function of t, here 1/t, and the constant ends up multiplying 1/μ = t.',
          explain: t`$\mu = 1/t$ gives $(y/t)' = \cos t$, so $y = t\sin t + Ct$. At $t = \pi$: $\pi\sin\pi + C\pi = C\pi = ${kpi}$, so $C = ${k}$.`,
          visual: { type: 'de-slopefield', params: { f: 'y/t + t*cos(t)', x: [0.3, 6], y: [-8, 8], grid: [19, 14], points: [{ x: Math.PI, y: k * Math.PI, color: 'gold', label: 'start' }] }, caption: t`The slope field of $y' = y/t + t\cos t$ for $t > 0$, with the initial point.` },
        };
      },
    }),
    num({
      id: 'chain-amount', difficulty: 2,
      gen(r) {
        const C = r.pick(CHAINS), la = LN2 / C.TA, lb = LN2 / C.TB;
        const tt = Math.round(r.pick([0.5, 1, 2]) * peak(la, lb));
        const val = daughter(la, lb, tt);
        return {
          prompt: t`In ${C.use}, ${C.a} (half-life ${nice(C.TA, 4)} h) decays to ${C.b} (half-life ${nice(C.TB, 4)} h). Starting from pure ${C.a}, what fraction of the original ${C.a} nuclei are ${C.b} nuclei after ${tt} h? Use $N_B = \dfrac{\lambda_A N_0}{\lambda_B - \lambda_A}\left(e^{-\lambda_A t} - e^{-\lambda_B t}\right)$.`,
          answer: val, tol: { rel: 0.01 },
          errors: [{ value: (lb / (lb - la)) * (Math.exp(-la * tt) - Math.exp(-lb * tt)), feedback: t`The prefactor is $\lambda_A/(\lambda_B - \lambda_A)$ — the parent’s decay rate on top.` }, { value: Math.exp(-la * tt), feedback: 'That is the parent’s surviving fraction, not the daughter’s.' }].filter((e) => Math.abs(e.value - val) > 0.02 * val),
          hints: [t`$\lambda = \ln 2/T$: $\lambda_A = ${fmt(la, 4)}\ \text{h}^{-1}$, $\lambda_B = ${fmt(lb, 4)}\ \text{h}^{-1}$.`, t`Compute $\dfrac{\lambda_A}{\lambda_B - \lambda_A}$, then $e^{-\lambda_A t} - e^{-\lambda_B t}$ at $t = ${tt}$ h.`],
          teach: t`In a two-step chain the daughter’s share is $\lambda_A/(\lambda_B - \lambda_A)$ times the difference of the two exponentials.`,
          explain: t`$\dfrac{\lambda_A}{\lambda_B - \lambda_A} = ${fmt(la / (lb - la), 4)}$ and $e^{-\lambda_A t} - e^{-\lambda_B t} = ${tex(Math.exp(-la * tt), 4)} - ${tex(Math.exp(-lb * tt), 4)}$, so $N_B/N_0 = ${tex(val, 3)}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, Math.ceil(2.6 * peak(la, lb))], y: [0, 1.05], xlabel: 't (hours)', ylabel: 'fraction of N₀',
              curves: [{ fn: `exp(-${la}*x)`, color: 'accent', label: 'parent', labelAt: 2.2 * peak(la, lb), labelDy: -12 }, { fn: `${la / (lb - la)}*(exp(-${la}*x) - exp(-${lb}*x))`, color: 'gold', label: 'daughter', labelAt: 1.8 * peak(la, lb), labelDy: -12 }],
              vlines: [{ x: tt, label: `t = ${tt} h`, color: 'ink3' }],
            },
            caption: 'The two populations against time. Your answer is the height of the gold curve at the dashed line — compute it, then compare.',
          },
        };
      },
    }),
    num({
      id: 'chain-peak', difficulty: 2,
      gen(r) {
        const C = r.pick(CHAINS), la = LN2 / C.TA, lb = LN2 / C.TB, T = peak(la, lb);
        return {
          prompt: t`${C.a.charAt(0).toUpperCase() + C.a.slice(1)} (half-life ${nice(C.TA, 4)} h) decays to ${C.b} (half-life ${nice(C.TB, 4)} h). Starting from pure ${C.a}, after how many hours is the amount of ${C.b} largest?`,
          answer: T, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: (C.TA + C.TB) / 2, feedback: t`The peak is not the average of the half-lives: set $dN_B/dt = 0$.` }, { value: Math.log(lb / la) / (lb + la), feedback: t`The denominator is $\lambda_B - \lambda_A$, from $\ln(\lambda_B/\lambda_A) = (\lambda_B - \lambda_A)t$.` }].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: [t`Differentiate $N_B \propto e^{-\lambda_A t} - e^{-\lambda_B t}$ and set it to zero: $\lambda_A e^{-\lambda_A t} = \lambda_B e^{-\lambda_B t}$.`, t`Take logarithms: $t^* = \dfrac{\ln(\lambda_B/\lambda_A)}{\lambda_B - \lambda_A}$, with $\lambda = \ln 2/T$.`],
          teach: t`The daughter peaks when it decays exactly as fast as it is made: $\lambda_A N_A = \lambda_B N_B$.`,
          explain: t`$\lambda_A = ${fmt(la, 4)}$, $\lambda_B = ${fmt(lb, 4)}\ \text{h}^{-1}$, so $t^* = \dfrac{\ln ${fmt(lb / la, 4)}}{${fmt(lb - la, 4)}} = ${fmt(T, 3)}$ h. At the peak the daughter’s decay rate $\lambda_B N_B$ equals its production rate $\lambda_A N_A$.`,
          visual: { type: 'graph', params: { x: [0, Math.ceil(3 * T)], y: [0, 1.05], xlabel: 't (hours)', ylabel: 'fraction of N₀', curves: [{ fn: `exp(-${la}*x)`, color: 'accent', label: 'parent', labelAt: 2.4 * T, labelDy: -12 }] }, caption: 'The parent’s decay. The daughter’s curve is for you to work out.' },
        };
      },
    }),
    mcq({
      id: 'lost-transient', difficulty: 2, kind: 'error',
      prompt: t`A student solves $y' + 3y = 6$: “$(e^{3t}y)' = 6e^{3t}$, so $e^{3t}y = 2e^{3t} + C$, so $y = 2 + C$.” What went wrong?`,
      choices: [
        t`The constant must be divided by $e^{3t}$ too: $y = 2 + Ce^{-3t}$`,
        t`The integrating factor should be $e^{-3t}$`,
        t`$\int 6e^{3t}\,dt$ is $18e^{3t}$, so $y = 18 + C$`,
        t`Nothing: a constant divided by $e^{3t}$ is still just a constant`,
      ],
      answer: 0,
      why: {
        1: t`$\mu = e^{\int 3\,dt} = e^{+3t}$; the student had that right.`,
        2: t`Integrating divides by 3: $\int 6e^{3t}dt = 2e^{3t}$.`,
        3: t`$C/e^{3t} = Ce^{-3t}$ changes with $t$. That decaying piece is the transient — the part that remembers $y(0)$.`,
      },
      hints: [t`Divide **every** term of $e^{3t}y = 2e^{3t} + C$ by $e^{3t}$.`, t`Test the student’s answer with $C = 1$: does $y = 3$ satisfy $y' + 3y = 6$?`],
      teach: 'Dividing by μ divides the constant of integration too; that is where the transient C/μ comes from.',
      explain: t`$y = 2 + Ce^{-3t}$. The student’s “solutions” $y = 2 + C$ are horizontal lines, and only $y = 2$ works: $y = 3$ gives $0 + 9 \neq 6$. In the slope field, the dashed lines cut straight across the segments.`,
      visual: { type: 'de-slopefield', params: { f: '6 - 3*y', x: [0, 2], y: [0, 4], grid: [17, 13], seeds: [[0, 3.6], [0, 0.4]], seedColor: 'accent2', hlines: [{ y: 3, label: 'student’s y = 2 + C, C = 1', color: 'bad' }, { y: 1, label: 'C = −1', color: 'bad' }] }, caption: t`The slope field of $y' = 6 - 3y$ with two true solutions (blue), both pulled onto $y = 2$, and two of the student’s horizontal lines (red), which cross the segments.` },
    }),
    expr({
      id: 'equal-rates', difficulty: 3,
      gen(r) {
        const k = r.pick([0.5, 1, 2]), N0 = r.pick([100, 400, 1000]);
        const ans = `${k * N0}*t*exp(-${k}t)`;
        return {
          prompt: t`A parent and its daughter happen to share the decay constant $\lambda = ${k}\ \text{h}^{-1}$. The parent starts with $${N0}$ nuclei and the daughter with none, so $N_B' + ${k}N_B = ${nice(k * N0)}\,e^{-${co(k)}t}$, $N_B(0) = 0$. Find $N_B(t)$. (The two-exponential formula gives $0/0$ here.)`,
          answer: ans, answerTeX: t`N_B = ${nice(k * N0)}\,t\,e^{-${co(k)}t}`, lhs: t`N_B`,
          vars: { t: [0, 4] },
          integrand: `${k * N0}*exp(-${k}t) - ${k}*(${ans})`,
          errors: [{ answer: `${k * N0}*exp(-${k}t)`, feedback: t`After multiplying by $\mu = e^{${co(k)}t}$ the right side is the constant $${nice(k * N0)}$, which integrates to $${nice(k * N0)}\,t$.` }, { answer: `${N0}*t*exp(-${k}t)`, feedback: t`Keep the factor $\lambda$: the daughter is fed at the rate $\lambda N_A = ${nice(k * N0)}e^{-${co(k)}t}$.` }].filter((e) => k !== 1 || !e.answer.startsWith(`${N0}*t`)),
          hints: [t`$\mu = e^{${co(k)}t}$, and $\mu q = e^{${co(k)}t}\cdot ${nice(k * N0)}e^{-${co(k)}t}$ is a constant.`, t`$(e^{${co(k)}t}N_B)' = ${nice(k * N0)}$, so $e^{${co(k)}t}N_B = ${nice(k * N0)}t + C$ and $C = 0$.`],
          teach: 'When the source has the same exponential as the transient, μq is constant and the integral produces a factor t.',
          explain: t`$(e^{${co(k)}t}N_B)' = ${nice(k * N0)}$ gives $N_B = ${nice(k * N0)}\,t\,e^{-${co(k)}t}$. It peaks at $t = 1/\lambda = ${nice(1 / k)}$ h — the limit of $\ln(\lambda_B/\lambda_A)/(\lambda_B - \lambda_A)$ as the two rates merge. The same factor $t$ appears at resonance in driven oscillators.`,
          visual: { type: 'graph', params: { x: [0, 4 / k + 1], y: [0, N0 * 1.05], xlabel: 't (hours)', ylabel: 'nuclei', curves: [{ fn: `${N0}*exp(-${k}x)`, color: 'accent', label: 'parent', labelAt: 0.5 / k, labelDx: 8 }] }, caption: 'The parent’s exponential decay; the daughter is fed in proportion to it.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-xenon', difficulty: 3, transfer: true,
      gen(r) {
        const [TI, TX] = r.pick([[6.57, 9.14], [6.6, 9.1]]);
        const la = LN2 / TI, lb = LN2 / TX, T = peak(la, lb);
        return {
          prompt: t`When a nuclear reactor shuts down, the iodine-135 in its fuel (half-life ${TI} h) keeps decaying into xenon-135 (half-life ${TX} h), a strong neutron absorber. Ignoring the xenon already present at shutdown, so that $X(0) = 0$, the xenon obeys $X' + \lambda_X X = \lambda_I I_0 e^{-\lambda_I t}$. How many hours after shutdown does the xenon peak? (This is the “iodine pit” that can stop a reactor from restarting.)`,
          answer: T, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: Math.log(la / lb) / (la + lb), feedback: t`Use the difference of the rates: $t^* = \dfrac{\ln(\lambda_X/\lambda_I)}{\lambda_X - \lambda_I}$ — here both logarithm and difference are negative.` }].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: [t`Same chain as before, with $A$ = iodine and $B$ = xenon: $t^* = \dfrac{\ln(\lambda_X/\lambda_I)}{\lambda_X - \lambda_I}$.`, t`$\lambda_I = \ln 2/${TI} = ${fmt(la, 4)}$ and $\lambda_X = \ln 2/${TX} = ${fmt(lb, 4)}$ per hour. The formula works when the daughter lives longer: numerator and denominator are both negative.`],
          teach: 'The daughter-peak formula t* = ln(λB/λA)/(λB − λA) holds whichever nucleus lives longer.',
          explain: t`$t^* = \dfrac{\ln(${fmt(lb, 4)}/${fmt(la, 4)})}{${fmt(lb, 4)} - ${fmt(la, 4)}} = \dfrac{${fmt(Math.log(lb / la), 4)}}{${fmt(lb - la, 4)}} \approx ${fmt(T, 3)}$ h. In a real reactor the xenon present at shutdown shifts the peak somewhat, and operators must wait a day or more for it to decay before restarting.`,
          visual: { type: 'graph', params: { x: [0, 48], y: [0, 1.05], xlabel: 'hours after shutdown', ylabel: 'fraction of I₀', curves: [{ fn: `exp(-${la}*x)`, color: 'accent', label: 'iodine-135', labelAt: 30, labelDy: -12 }] }, caption: 'The iodine inventory after shutdown, decaying exponentially; every decay makes a xenon nucleus.' },
        };
      },
    }),
    expr({
      id: 'cp-sine', difficulty: 3,
      gen(r) {
        const A = r.pick([1, 2, 3]), y0 = r.pick([0, 1, -1, 2]);
        const c = y0 + A;
        const ans = `${A}*(sin(t) - cos(t)) + (${c})*exp(-t)`;
        return {
          prompt: t`Solve $y' + y = ${2 * A}\sin t$ with $y(0) = ${y0}$.`,
          answer: ans, answerTeX: t`y = ${co(A)}(\sin t - \cos t) ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}e^{-t}`, lhs: 'y',
          vars: { t: [-1, 3] },
          integrand: `${2 * A}*sin(t) - (${ans})`,
          errors: [{ answer: `${A}*(sin(t) - cos(t)) + ${y0}*exp(-t)`, feedback: t`At $t = 0$ the particular part is $-${A}$, so $C = ${y0} + ${A}$.` }].filter(() => c !== y0),
          hints: [t`$\mu = e^t$: $(e^ty)' = ${2 * A}e^t\sin t$. You need $\int e^t\sin t\,dt = \tfrac12 e^t(\sin t - \cos t)$.`, t`So $y = ${co(A)}(\sin t - \cos t) + Ce^{-t}$; set $t = 0$.`],
          teach: 'A sinusoidal source gives a sinusoidal particular solution that lags the source, plus the decaying transient.',
          explain: t`$y = ${co(A)}(\sin t - \cos t) + Ce^{-t}$ with $C = ${y0} + ${A} = ${c}$. The steady part $${co(A)}(\sin t - \cos t) = ${A === 1 ? '' : A}\sqrt2\sin(t - \pi/4)$ lags the source by $45°$ and has amplitude $${A === 1 ? '' : A}\sqrt2$, not $${2 * A}$.`,
          visual: { type: 'de-slopefield', params: { f: `${2 * A}*sin(t) - y`, x: [0, 10], y: [-2 * A - 1, 2 * A + 1], grid: [19, 13], points: [{ x: 0, y: y0, color: 'gold', label: 'start' }] }, caption: t`The slope field of $y' = ${2 * A}\sin t - y$: every solution settles onto one oscillation.` },
        };
      },
    }),
    mcq({
      id: 'cp-difference', difficulty: 2,
      prompt: t`$y_1$ and $y_2$ both solve $y' + p(t)\,y = q(t)$, with $q \neq 0$. Which of these must solve the **homogeneous** equation $y' + p(t)\,y = 0$?`,
      choices: [t`$y_1 - y_2$`, t`$y_1 + y_2$`, t`$2y_1$`, t`$y_1\,y_2$`],
      answer: 0,
      why: {
        1: t`$(y_1 + y_2)' + p(y_1 + y_2) = 2q$, not 0: it solves the equation with source $2q$.`,
        2: t`$(2y_1)' + p(2y_1) = 2q \neq 0$.`,
        3: t`A product of solutions is not a solution of a linear equation; the derivative of a product brings cross terms.`,
      },
      hints: ['Substitute each candidate into y′ + p y and use what you know about y₁ and y₂.'],
      teach: 'Any two solutions of a linear equation differ by a solution of the homogeneous equation: every solution is one particular solution plus C/μ.',
      explain: t`$(y_1 - y_2)' + p(y_1 - y_2) = q - q = 0$. That is why the general solution is $y_p + C/\mu$: once you have one solution, every other differs from it by a homogeneous solution, $Ce^{-\int p\,dt}$.`,
      visual: { type: 'de-slopefield', params: { f: 'sin(t) - y', x: [0, 8], y: [-2, 3], grid: [19, 13], seeds: [[0, 2.5], [0, -1.5]], seedColor: 'accent2' }, caption: t`Two solutions of $y' + y = \sin t$ from different starts. The gap between them shrinks like $e^{-t}$.` },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §1.4 Linear equations and the integrating factor', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'NNDC, National Nuclear Data Center: NuDat (half-lives)', url: 'https://www.nndc.bnl.gov/nudat3/' },
    { label: 'IAEA, Technetium-99m radiopharmaceuticals: manufacture of kits (generator elution)', url: 'https://www.iaea.org/publications/7887/technetium-99m-radiopharmaceuticals-manufacture-of-kits' },
  ],
});
