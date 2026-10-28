// Newton’s method — follow the tangent line down to the axis, and repeat.
// Kepler’s equation, solved by hand, puts a satellite on its orbit.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, curveFig, fitY, lineAt } from './_c1kit.js';
import { thou } from './_c1int.js';

const t = String.raw;

// Kepler’s equation f(E) = E − e sin E − M, as expressions of an argument (for the Explore graph)
const KF = (X) => `((${X}) - e*sin(${X}) - M)`;
const KD = (X) => `(1 - e*cos(${X}))`;
const KS = (X) => `((${X}) - ${KF(X)}/${KD(X)})`;
const X1 = KS('x0'), X2 = KS(X1), X3 = KS(X2);

// the worked example: a Molniya orbit, 2.00 h after perigee
const ECC = 0.74, A_MOL = 26600, M_MOL = 2 * Math.PI * 120 / 718;
const kep = (e, M, E0, n) => { const out = [E0]; let E = E0; for (let i = 0; i < n; i++) { E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); out.push(E); } return out; };
const MOL = kep(ECC, M_MOL, M_MOL, 4);
const R_MOL = A_MOL * (1 - ECC * Math.cos(MOL[4]));
const f4 = (E) => E - ECC * Math.sin(E) - M_MOL;

// one Newton step
const step = (f, df, x) => x - f(x) / df(x);

export default lesson({
  id: 'math1210.C1-4.8',
  title: 'Newton’s method',
  minutes: 10, difficulty: 3,
  intro: t`Most equations have no formula for their roots. Newton’s method finds one anyway: from a guess $x_n$, follow the tangent line at $(x_n, f(x_n))$ down to where it meets the axis, and take that as the next guess:

$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$$

Close to a simple root the number of correct digits roughly **doubles** with every step. Far from one, or where the tangent is nearly flat, it can shoot off, cycle or diverge — so a good starting guess matters. The equation that made the method famous in astronomy is Kepler’s: it says where a planet or satellite is on its orbit at a given time.`,
  symbols: [
    { tex: 'x_n', text: 'the current guess for the root' },
    { tex: 'x_{n+1}', text: 'the improved guess: where the tangent line at $x_n$ crosses the axis' },
    { tex: 'f(x_n)', text: 'how far $f$ is from zero at the current guess — the **residual**' },
    { tex: "f'(x_n)", text: 'the slope of the tangent there; the step fails if it is $0$ and misbehaves if it is small' },
  ],
  why: t`Every computer that solves an equation — orbit propagators, circuit simulators, the implicit solvers in CFD and general-relativity codes — runs Newton’s method or a descendant of it, millions of times a second.`,
  visual: {
    type: 'graph',
    title: 'Tangent lines walking down to a root',
    lead: t`The curve is Kepler’s equation written as $f(E) = E - e\sin E - M = 0$, where $e$ is the orbit’s eccentricity and $M$ the mean anomaly (elapsed fraction of the period, times $2\pi$). Drag the gold starting point $E_0$. Its tangent (gold) meets the axis at $E_1$; the tangent there (violet) gives $E_2$.`,
    tasks: [
      'Put the gold point at E₀ = M ≈ 1.05: E₁ overshoots to about 2.07, E₂ comes back to 1.796, and E₃ already agrees with the root to four figures.',
      'Set e to 0.97 and M to 0.2, then start near E₀ = 0, where the curve is almost flat: E₁ is flung far away.',
      'With the same settings start at E₀ = π instead. Starting from π is known to converge for every e below 1 and every M.',
    ],
    params: {
      x: [-0.5, 6.8], y: [-3.2, 4.6], aspect: 'wide', xlabel: 'E (rad)', ylabel: 'f(E)',
      sliders: [
        { key: 'e', label: t`Eccentricity $e$`, min: 0, max: 0.97, step: 0.01, value: ECC, explain: '0 is a circle; close to 1 a long, thin ellipse. 0.74 is a Molniya orbit.' },
        { key: 'M', label: t`Mean anomaly $M$`, min: 0.1, max: 6.2, step: 0.05, value: 1.05, unit: t`\text{rad}`, explain: 'The time since perigee as an angle: it grows uniformly, 2π per orbit.' },
      ],
      curves: [
        { fn: 'x - e*sin(x) - M', color: 'accent' },
        { fn: `${KF(X1)} + ${KD(X1)}*(x - ${X1})`, color: 'violet', dash: true, width: 1.6, domain: [`min(${X1}, ${X2}) - 0.7`, `max(${X1}, ${X2}) + 0.7`] },
      ],
      tangent: { fn: 'x - e*sin(x) - M', at: 1.05 },
      arrows: [{ from: [X1, 0], to: [X1, KF(X1)], color: 'ink3', width: 1.2, dash: true }],
      points: [{ x: X1, y: 0, color: 'gold', label: 'E₁', labelDy: 18 }, { x: X2, y: 0, color: 'violet', label: 'E₂', labelDx: -16, labelDy: -6 }],
      readouts: [
        { label: t`$E_0$`, expr: 'x0', digits: 6 },
        { label: t`$E_1$`, expr: X1, digits: 6 },
        { label: t`$E_2$`, expr: X2, digits: 6 },
        { label: t`$E_3$`, expr: X3, digits: 6 },
        { label: t`$f(E_3)$`, expr: KF(X3), digits: 2 },
      ],
    },
    caption: 'Exact iterates of Newton’s method on this curve. The violet tangent is drawn only near the second step.',
  },
  example: {
    prompt: t`A Molniya communications satellite has eccentricity $e = 0.74$, semi-major axis $a = 26\,600$ km and period $718$ min. Two hours after perigee its mean anomaly is $M = 2\pi\cdot\tfrac{120}{718} = ${M_MOL.toFixed(4)}$ rad. Solve Kepler’s equation $E - 0.74\sin E = M$ for the eccentric anomaly $E$, and find its distance from Earth’s centre, $r = a(1 - e\cos E)$.`,
    visual: curveFig({ fn: `x - 0.74*sin(x) - ${N(M_MOL)}`, x: [0.6, 2.5], y: [-0.8, 0.95], xlabel: 'E (rad)', ylabel: 'f(E)', domain: [0.6, 2.5], points: MOL.slice(0, 3).map((E, i) => ({ x: E, y: f4(E), color: ['gold', 'violet', 'good'][i], label: ['E₀', 'E₁', 'E₂'][i], labelDx: i === 0 ? -22 : 8, labelDy: i === 1 ? -4 : 16 })), curves: MOL.slice(0, 2).map((E, i) => ({ fn: lineAt(E, f4(E), 1 - ECC * Math.cos(E)), color: ['gold', 'violet'][i], dash: true, width: 1.5, domain: i === 0 ? [E, MOL[1] + 0.05] : [MOL[2] - 0.05, E] })), caption: t`$f(E) = E - 0.74\sin E - ${M_MOL.toFixed(4)}$ near its root. Each dashed tangent meets the axis at the next guess.` }),
    steps: [
      { label: 'Set up', text: t`$f(E) = E - 0.74\sin E - ${M_MOL.toFixed(4)}$ and $f'(E) = 1 - 0.74\cos E$. Start from $E_0 = M = ${M_MOL.toFixed(4)}$ (radians throughout).` },
      { label: 'Step 1', text: t`$f(E_0) = ${f4(MOL[0]).toFixed(4)}$, $f'(E_0) = ${(1 - ECC * Math.cos(MOL[0])).toFixed(4)}$, so $E_1 = ${MOL[0].toFixed(4)} - \dfrac{${f4(MOL[0]).toFixed(4)}}{${(1 - ECC * Math.cos(MOL[0])).toFixed(4)}} = ${MOL[1].toFixed(4)}$. The shallow tangent overshoots.` },
      { label: 'Step 2', text: t`$f(E_1) = ${f4(MOL[1]).toFixed(4)}$, $f'(E_1) = ${(1 - ECC * Math.cos(MOL[1])).toFixed(4)}$: $E_2 = ${MOL[2].toFixed(4)}$.` },
      { label: 'Steps 3 and 4', text: t`$f(E_2) = ${f4(MOL[2]).toFixed(4)}$ gives $E_3 = ${MOL[3].toFixed(5)}$; then $f(E_3) = ${tex6(f4(MOL[3]))}$ gives $E_4 = ${MOL[4].toFixed(6)}$. The corrections shrank $0.27 \to 0.021 \to 0.00014$: digits doubling.` },
      { label: 'Position', text: t`$r = 26\,600\,(1 - 0.74\cos ${MOL[4].toFixed(4)}) = ${thou(R_MOL)}$ km from Earth’s centre, about $${thou(Math.round((R_MOL - 6378) / 100) * 100)}$ km up.` },
      { label: 'Sense check', text: t`The Molniya orbit runs from about $500$ km up at perigee to about $40\,000$ km at apogee, which it reaches $6$ hours after perigee. Two hours in, it is already well on the way out.` },
    ],
    answer: t`$E \approx ${MOL[4].toFixed(4)}$ rad, and $r \approx ${(R_MOL / 1000).toFixed(1)}\times10^{3}$ km.`,
  },
  practice: [
    num({
      id: 'babylon', difficulty: 1,
      gen(r) {
        const [n, x0] = r.pick([[2, 1], [3, 2], [5, 2], [7, 3], [10, 3], [20, 4]]), x1 = (x0 + n / x0) / 2;
        return {
          prompt: t`Use one step of Newton’s method on $f(x) = x^2 - ${n}$, starting from $x_0 = ${x0}$, to estimate $\sqrt{${n}}$. Give $x_1$ to 4 significant figures.`,
          answer: x1, tol: { rel: 0.0005 },
          errors: [{ value: x0 + (x0 * x0 - n) / (2 * x0), feedback: t`The step **subtracts** $f(x_0)/f'(x_0)$.` }],
          hints: [t`$f(${x0}) = ${x0 * x0 - n}$ and $f'(x) = 2x$, so $f'(${x0}) = ${2 * x0}$.`, t`$x_1 = ${x0} - \dfrac{${x0 * x0 - n}}{${2 * x0}}$.`],
          teach: t`For $x^2 - N$, Newton’s step is $x_{n+1} = \tfrac12(x_n + N/x_n)$: average the guess with $N$ divided by it — the Babylonian square root.`,
          explain: t`$x_1 = ${x0} - \dfrac{${x0 * x0 - n}}{${2 * x0}} = ${nice(x1, 5)}$, against $\sqrt{${n}} = ${nice(Math.sqrt(n), 6)}$. One step from a rough guess, and already the first few digits are right.`,
          visual: curveFig({ fn: `x^2 - ${n}`, x: [0, x0 + 1.6], y: fitY((x) => x * x - n, 0, x0 + 1.5), at: x0, f: (x) => x * x - n, df: (x) => 2 * x, span: 1.3, caption: t`$y = x^2 - ${n}$ and its tangent at $x_0 = ${x0}$. Where does the tangent cross the axis?` }),
        };
      },
    }),
    num({
      id: 'newton-cubic', difficulty: 2,
      gen(r) {
        const x0 = r.pick([2, 3]);
        const f = (x) => x ** 3 - 2 * x - 5, df = (x) => 3 * x * x - 2;
        const x1 = step(f, df, x0), x2 = step(f, df, x1);
        return {
          prompt: t`Newton’s own example (1669) was $x^3 - 2x - 5 = 0$. Take **two** steps from $x_0 = ${x0}$ and give $x_2$ to 4 significant figures.`,
          answer: x2, tol: { rel: 0.0003 },
          errors: [{ value: x1, feedback: t`That is $x_1$. Take one more step from it.` }],
          hints: [t`$f'(x) = 3x^2 - 2$. First step: $x_1 = ${x0} - \dfrac{${f(x0)}}{${df(x0)}} = ${nice(x1, 6)}$.`, t`Second step: $x_2 = x_1 - \dfrac{x_1^3 - 2x_1 - 5}{3x_1^2 - 2}$, with $x_1 = ${nice(x1, 6)}$.`],
          teach: 'Keep full precision between steps; round only the final answer.',
          explain: t`$x_1 = ${nice(x1, 6)}$, then $x_2 = ${nice(x2, 7)}$. The root is $2.0945515\ldots$${x0 === 2 ? ', so two steps from 2 already give six correct figures.' : ', so starting further away cost a step or two.'}`,
          visual: curveFig({ fn: 'x^3 - 2*x - 5', x: [1.4, 3.2], y: [-5, 22], at: x0, f, df, span: 0.9, caption: t`$y = x^3 - 2x - 5$ and the first tangent, from $x_0 = ${x0}$.` }),
        };
      },
    }),
    mcq({
      id: 'flat-start', difficulty: 2,
      prompt: t`You want the root of $f(x) = x^3 - 3x + 1$ near $x = 1.5$. Which starting point marked on the graph is a poor choice?`,
      visual: curveFig({ fn: 'x^3 - 3*x + 1', x: [-2.3, 2.3], y: [-2.4, 4.4], points: [{ x: 0.95, y: 0.95 ** 3 - 2.85 + 1, color: 'gold', label: 'P', labelDy: 18 }, { x: 1.4, y: 1.4 ** 3 - 4.2 + 1, color: 'gold', label: 'S', labelDx: 8, labelDy: 14 }, { x: 1.7, y: 1.7 ** 3 - 5.1 + 1, color: 'gold', label: 'R', labelDx: -18 }, { x: 2.0, y: 3, color: 'gold', label: 'Q', labelDx: -18 }], caption: t`$y = x^3 - 3x + 1$, with four candidate starting points. The root wanted is the one near $1.5$.` }),
      choices: ['P, where the tangent is nearly flat', 'Q, because it is the furthest from the root', 'S, because the curve is below the axis there', 'R, because it is above the axis'],
      answer: 0,
      why: {
        1: t`From $Q$ ($x = 2$) the tangent is steep and lands at $x_1 = 1.667$, then $1.549$, $1.5324$: it converges.`,
        2: t`Below or above the axis does not matter; the sign of $f$ just sets the direction of the step. From $S$ the next guesses are $1.558$, $1.533$.`,
        3: t`From $R$ the steps go $1.556$, $1.533$: fine.`,
      },
      hints: [t`The step is $f(x_n)/f'(x_n)$. What happens to it when $f'(x_n)$ is small?`, 'Find the point where the tangent line would be almost horizontal.'],
      teach: 'A nearly flat tangent meets the axis far away: never start Newton’s method near a turning point of f.',
      explain: t`At $P$ ($x = 0.95$), $f' = -0.29$ while $f = -0.99$, so the step is $3.4$ to the left: $x_1 \approx -2.44$, near the wrong root entirely. The method then converges — to $-1.879$, not $1.532$.`,
    }),
    mcq({
      id: 'cycle', difficulty: 2,
      prompt: t`Apply Newton’s method to $f(x) = x^3 - 2x + 2$ starting from $x_0 = 0$. What happens?`,
      visual: curveFig({ fn: 'x^3 - 2*x + 2', x: [-2.4, 1.8], y: [-2, 4.5], curves: [{ fn: '2 - 2*x', color: 'gold', dash: true, width: 1.5, domain: [-0.3, 1.3] }, { fn: '1 + (x - 1)', color: 'violet', dash: true, width: 1.5, domain: [-0.3, 1.3] }], points: [{ x: 0, y: 2, color: 'gold', label: 'x = 0' }, { x: 1, y: 1, color: 'violet', label: 'x = 1', labelDx: 8, labelDy: 14 }], caption: t`$y = x^3 - 2x + 2$ with the tangents at $x = 0$ (gold) and $x = 1$ (violet). Follow each to the axis.` }),
      choices: [
        'It cycles 0, 1, 0, 1, … forever',
        t`It converges to the root near $x = -1.77$`,
        'It diverges to infinity',
        t`It stops at once, because $f'(0) = 0$`,
      ],
      answer: 0,
      why: {
        1: t`That root exists, but from $0$ the steps never get near it. Compute $x_1$ and $x_2$.`,
        2: t`The guesses stay bounded — they just repeat.`,
        3: t`$f'(0) = -2$, not $0$.`,
      },
      hints: [t`$f(0) = 2$, $f'(0) = -2$: $x_1 = 0 - \dfrac{2}{-2}$.`, t`Now $f(1) = 1$, $f'(1) = 1$: what is $x_2$?`],
      teach: 'Newton’s method is not guaranteed to converge: it can cycle, even on a smooth polynomial.',
      explain: t`$x_1 = 0 - \frac{2}{-2} = 1$, $x_2 = 1 - \frac{1}{1} = 0$: back where it started. Each tangent lands exactly on the other point. A different start (say $-2$) converges to $-1.769$.`,
    }),
    num({
      id: 'float-sphere', difficulty: 3,
      gen(r) {
        const rho = r.pick([0.3, 0.4, 0.6, 0.7]);
        const f = (h) => h ** 3 - 3 * h * h + 4 * rho, df = (h) => 3 * h * h - 6 * h;
        let h = 1; for (let i = 0; i < 30; i++) h = step(f, df, h);
        const h1 = step(f, df, 1);
        return {
          prompt: t`A solid ball of radius $1$ m and relative density $${rho}$ floats in water. By Archimedes, the depth $h$ it sinks to satisfies $h^3 - 3h^2 + ${nice(4 * rho)} = 0$, with $0 < h < 2$. Use Newton’s method from $h_0 = 1$ to find $h$ to 4 significant figures.`,
          answer: h, units: 'm', tol: { rel: 0.0005 },
          errors: [{ value: h1, feedback: t`That is $h_1$, one step. Repeat until the digits stop changing.` }],
          hints: [t`$f(h) = h^3 - 3h^2 + ${nice(4 * rho)}$, $f'(h) = 3h^2 - 6h$.`, t`$h_1 = 1 - \dfrac{f(1)}{f'(1)} = 1 - \dfrac{${nice(4 * rho - 2)}}{-3} = ${nice(h1, 6)}$.`, 'One or two more steps fix four figures.'],
          teach: 'Iterate until successive guesses agree to the precision you need.',
          explain: t`$h_1 = ${nice(h1, 6)}$, $h_2 = ${nice(step(f, df, h1), 6)}$, and the next step changes nothing at this precision: $h = ${nice(h, 4)}$ m. ${rho < 0.5 ? 'Lighter than half the density of water, the ball floats less than half submerged.' : 'Denser than half the density of water, it floats more than half submerged.'}`,
          visual: curveFig({ fn: `x^3 - 3*x^2 + ${N(4 * rho)}`, x: [-0.1, 2.1], y: fitY(f, 0, 2), xlabel: 'h (m)', ylabel: 'f(h)', domain: [0, 2], extra: { xticks: 0 }, caption: t`$f(h)$ on $0 \le h \le 2$ m ($h$ axis unnumbered): one root in this range. The water is assumed still; the derivation uses the volume of a spherical cap.` }),
        };
      },
    }),
    mcq({
      id: 'find-error-step', difficulty: 2, kind: 'error',
      prompt: t`A student’s code for Newton’s method updates the guess with

$$x_{n+1} = x_n - \frac{f'(x_n)}{f(x_n)}.$$

What is wrong?`,
      visual: curveFig({ fn: 'x^2 - 2', x: [0, 2.6], y: [-2.3, 4.6], at: 2, f: (x) => x * x - 2, df: (x) => 2 * x, span: 1.1, caption: t`The tangent at $x_0 = 2$ falls $f(x_0) = 2$ over a run of $f(x_0)/f'(x_0) = 0.5$ to reach the axis.` }),
      choices: [
        t`The fraction is upside down: the step is $f(x_n)/f'(x_n)$`,
        'The minus should be a plus',
        t`It should use $f''(x_n)$ in the denominator`,
        'Nothing; either fraction works',
      ],
      answer: 0,
      why: {
        1: t`The minus is right: if $f > 0$ and $f' > 0$ the root is to the left. The fraction is the problem.`,
        2: t`Newton’s method uses only the first derivative: it follows a tangent *line*.`,
        3: t`From $x_0 = 2$ on $x^2 - 2$, the student’s rule gives $2 - 4/2 = 0$, nowhere near $\sqrt2$.`,
      },
      hints: ['The tangent drops f(xₙ) in height. With slope f′(xₙ), what horizontal distance does that take?'],
      teach: t`The step is rise ÷ slope: $f(x_n)/f'(x_n)$ is the horizontal distance from $x_n$ to where the tangent hits the axis.`,
      explain: t`A line of slope $f'$ falls $f(x_n)$ over a run of $f(x_n)/f'(x_n)$, so $x_{n+1} = x_n - f(x_n)/f'(x_n)$. From $x_0 = 2$: $2 - 2/4 = 1.5$, on the way to $1.414$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cos-x', difficulty: 2,
      gen(r) {
        const x0 = r.pick([0.5, 1]);
        const f = (x) => Math.cos(x) - x, df = (x) => -Math.sin(x) - 1, x1 = step(f, df, x0);
        return {
          prompt: t`Take one step of Newton’s method on $\cos x = x$ (radians), starting from $x_0 = ${x0}$. Give $x_1$ to 4 significant figures.`,
          answer: x1, tol: { rel: 0.0005 },
          errors: [{ value: x0 + f(x0) / df(x0), feedback: t`Check the sign: with $f(x) = \cos x - x$ and $f' = -\sin x - 1$, the step is $x_0 - f/f'$.` }],
          hints: [t`Write it as $f(x) = \cos x - x = 0$, with $f'(x) = -\sin x - 1$.`],
          teach: 'Rewrite the equation as f(x) = 0 before applying Newton’s method.',
          explain: t`$f(${x0}) = ${nice(f(x0), 5)}$, $f'(${x0}) = ${nice(df(x0), 5)}$, so $x_1 = ${x0} - \dfrac{${nice(f(x0), 5)}}{${nice(df(x0), 5)}} = ${nice(x1, 5)}$. The root is $0.739085$.`,
          visual: curveFig({ fn: 'cos(x)', x: [-0.1, 1.6], y: [-0.1, 1.2], curves: [{ fn: 'x', color: 'gold', label: 'y = x', labelAt: 1.1 }], label: 'y = cos x', labelAt: 0.25, caption: t`$y = \cos x$ and $y = x$ cross once; that crossing is the root of $\cos x - x$.` }),
        };
      },
    }),
    num({
      id: 'cp-kepler-gto', difficulty: 3, transfer: true,
      gen(r) {
        const M = r.pick([0.6, 1, 1.5, 2.2]), e = 0.73, a = 24400;
        let E = Math.PI; for (let i = 0; i < 40; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        const rr = a * (1 - e * Math.cos(E));
        return {
          prompt: t`A satellite on a geostationary transfer orbit has $e = 0.73$ and semi-major axis $a = 24\,400$ km. At a moment when its mean anomaly is $M = ${M}$ rad, solve Kepler’s equation $E - 0.73\sin E = ${M}$ by Newton’s method, then give its distance from Earth’s centre, $r = a(1 - e\cos E)$, in km.`,
          answer: rr, units: 'km', tol: { rel: 0.003 },
          errors: [{ value: a * (1 - e * Math.cos(M)), feedback: t`That uses $E = M$, the starting guess. Iterate Newton’s method until $E$ settles first.` }],
          hints: [t`$f(E) = E - 0.73\sin E - ${M}$, $f'(E) = 1 - 0.73\cos E$.`, t`Start from $E_0 = \pi$ (or $E_0 = M + 0.73$) and iterate until $E$ stops changing in the fourth decimal.`, t`The root is $E = ${E.toFixed(4)}$ rad; now evaluate $r$.`],
          teach: 'Kepler’s equation cannot be solved in closed form, so every orbit code solves it numerically — usually by Newton’s method.',
          explain: t`Newton’s method gives $E = ${E.toFixed(5)}$ rad, so $r = 24\,400\,(1 - 0.73\cos ${E.toFixed(4)}) = ${thou(rr)}$ km. The orbit runs from $6\,588$ km (perigee, about $210$ km up) to $42\,212$ km (geostationary height).`,
          visual: { type: 'graph', params: { x: [-46000, 14000], y: [-19000, 19000], equal: true, aspect: 'wide', xlabel: 'km', ylabel: 'km', curves: [{ param: [`24400*(cos(t) - 0.73)`, `24400*sqrt(1 - 0.73^2)*sin(t)`], t: [0, 2 * Math.PI], color: 'accent' }, { param: ['6378*cos(t)', '6378*sin(t)'], t: [0, 2 * Math.PI], color: 'teal' }], points: [{ x: 24400 * (1 - 0.73), y: 0, color: 'gold', label: 'perigee', labelDy: 16 }, { x: -24400 * 1.73, y: 0, color: 'gold', label: 'apogee', labelDx: 8 }] }, caption: 'The transfer orbit (blue) to scale around Earth (teal); the satellite moves fastest near perigee. Earth’s oblateness and the Moon’s pull are ignored.' },
        };
      },
    }),
    mcq({
      id: 'cp-cuberoot', difficulty: 3,
      prompt: t`Newton’s method is applied to $f(x) = x^{1/3}$ (the real cube root), whose only root is $x = 0$, starting from any $x_0 \ne 0$. What happens?`,
      visual: curveFig({ fn: 'cbrt(x)', x: [-2.2, 2.2], y: [-1.6, 1.6], at: 0.5, f: Math.cbrt, df: (x) => 1 / (3 * Math.cbrt(x * x)), span: 1.3, caption: t`$y = \sqrt[3]{x}$ and its tangent at $x_0 = 0.5$. Where does it meet the axis?` }),
      choices: [
        t`Each step gives $x_{n+1} = -2x_n$: the guesses alternate in sign and double — it diverges`,
        t`It converges, slowly, because the root is at $0$`,
        t`It reaches $0$ in one step`,
        t`It cycles between $x_0$ and $-x_0$`,
      ],
      answer: 0,
      why: {
        1: t`Compute one step: $x - \dfrac{x^{1/3}}{\tfrac13 x^{-2/3}} = x - 3x = -2x$. The distance doubles every time.`,
        2: t`That would need the tangent to pass through the origin; it meets the axis at $-2x_0$.`,
        3: t`A cycle would need $x_{n+1} = -x_n$; here it is $-2x_n$.`,
      },
      hints: [t`$f'(x) = \tfrac13 x^{-2/3}$.`, t`Simplify $\dfrac{f(x)}{f'(x)} = \dfrac{x^{1/3}}{\tfrac13x^{-2/3}}$.`],
      teach: 'At a root where the curve is vertical (infinite slope), Newton’s method can be repelled rather than attracted.',
      explain: t`$\dfrac{f}{f'} = 3x$, so $x_{n+1} = x_n - 3x_n = -2x_n$: $0.5, -1, 2, -4, \dots$ The vertical tangent at the root makes every tangent line overshoot by twice the distance.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §4.9 Newton’s method', url: 'https://openstax.org/books/calculus-volume-1/pages/4-9-newtons-method' },
    { label: 'Curtis, Orbital Mechanics for Engineering Students, ch. 3 (Kepler’s equation)', url: 'https://www.sciencedirect.com/book/9780081021330/orbital-mechanics-for-engineering-students' },
  ],
});

// a small residual as TeX (×10ⁿ for tiny values)
function tex6(x) {
  const [m, e] = x.toExponential(2).split('e');
  return Math.abs(x) < 1e-3 ? `${m}\\times10^{${+e}}` : x.toFixed(5);
}
