// Hilbert spaces and L². An inner-product space that is complete is a Hilbert
// space. Continuous functions with the L² norm are not: ramps steepening into a
// step are Cauchy in L² (|m − n| / (m√(12n))) but not in the sup norm, and their
// limit is not continuous. L² is the completion (Riesz–Fischer); its elements are
// equivalence classes; orthonormal bases, projection as best approximation
// (|x| by Legendre polynomials, error² = 1/96), Bessel and Parseval. QM states,
// δ and plane waves outside L², and the Sobolev spaces behind Einstein's equations.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const RAMP = (n) => `min(1, max(0, ${n}*(x - 0.5) + 0.5))`;

export default lesson({
  id: 'st-g.G3.2',
  title: 'Hilbert spaces and L²',
  minutes: 15, difficulty: 4,
  intro: t`A **Hilbert space** is an inner-product space that is **complete**: every Cauchy sequence, measured in its own norm, converges to an element of the space. The model is $L^2[a, b]$, the square-integrable functions with

$$\langle f, g\rangle = \int_a^b \overline{f(x)}\,g(x)\,dx, \qquad \lVert f\rVert^2 = \sum_n |\langle e_n, f\rangle|^2$$

The second equation is **Parseval’s identity**: in an orthonormal basis $e_n$, the squared length is the sum of the squared components, exactly as in $\mathbb R^3$. Completeness is not automatic — the continuous functions with this norm have holes, as $\mathbb Q$ did — and filling them forces a subtlety: an element of $L^2$ is a function **up to changes on a set of zero length**, so it has no well-defined value at a single point. The physicist’s view of the same space is [Hilbert space](#/lesson/phys4700.M4.1) in quantum mechanics.`,
  symbols: [
    { tex: 'L^2[a, b]', text: t`functions with $\int_a^b |f|^2dx < \infty$, two of them counted as equal when $\int_a^b |f - g|^2dx = 0$` },
    { tex: '\\langle f, g\\rangle', text: t`the inner product; the bar is complex conjugation, so $\langle f, f\rangle = \int|f|^2 \ge 0$` },
    { tex: 'e_n', text: t`an orthonormal basis: $\langle e_m, e_n\rangle = 1$ if $m = n$, else $0$, and no nonzero $f$ is orthogonal to all of them` },
    { tex: '\\langle e_n, f\\rangle', text: t`the component of $f$ along $e_n$ — a Fourier coefficient` },
    { tex: '\\lVert f\\rVert', text: t`the $L^2$ norm, $\bigl(\int|f|^2\bigr)^{1/2}$: for a wave function, the square root of total probability` },
  ],
  why: 'Quantum states are unit vectors in L², and the existence theorems for Einstein’s equations are proved in Sobolev spaces — Hilbert spaces built from L² norms of derivatives, because energy estimates are L² estimates.',
  visual: {
    type: 'graph',
    title: 'Ramps that converge to a step',
    lead: t`$f_n$ is continuous: it climbs from $0$ to $1$ across a window of width $1/n$ around $x = \tfrac12$. Set two indices $n$ and $m$ and compare the two distances between $f_n$ and $f_m$: in $L^2$ (an average) and in the sup norm (the worst point).`,
    tasks: [
      t`Take $n = 10$, $m = 20$, then $n = 40$, $m = 80$: the $L^2$ distance keeps shrinking — the sequence is Cauchy in $L^2$ — while the sup distance stays at $0.25$.`,
      t`Its $L^2$ limit is the step (dashed), which is not continuous. So the continuous functions with the $L^2$ norm are **not** complete: the step is one of their holes.`,
      t`$L^2$ contains the step, and every other such limit: it is the completion. The value of the step at $x = \tfrac12$ is not determined, and in $L^2$ it does not need to be.`,
    ],
    params: {
      x: [0, 1], y: [-0.12, 1.2], aspect: 'wide', xlabel: 'x', ylabel: '',
      sliders: [
        { key: 'n', label: t`Index $n$`, min: 1, max: 100, step: 1, value: 10, explain: t`The ramp $f_n$ is $1/n$ wide.` },
        { key: 'm', label: t`Index $m$`, min: 1, max: 100, step: 1, value: 20, explain: t`A second ramp $f_m$ to compare with.` },
      ],
      shade: [{ fn: `max(${RAMP('n')}, ${RAMP('m')})`, lower: `min(${RAMP('n')}, ${RAMP('m')})`, from: 0, to: 1, color: 'bad', alpha: 0.3 }],
      curves: [
        { fn: 'step(x - 0.5)', color: 'ink3', width: 1.4, dash: true, samples: 2000, label: 'step', labelAt: 0.85, labelDy: -8 },
        { fn: RAMP('n'), color: 'accent', width: 2.2, label: 'fₙ', labelAt: 0.25, labelDy: -8 },
        { fn: RAMP('m'), color: 'gold', width: 2.2, label: 'fₘ', labelAt: 0.12, labelDy: -8 },
      ],
      readouts: [
        { label: t`$\lVert f_n - f_m\rVert_2$`, expr: 'abs(m - n)/(max(m, n)*sqrt(12*min(m, n)))', digits: 3 },
        { label: t`$\lVert f_n - f_m\rVert_\infty$`, expr: 'abs(m - n)/(2*max(m, n))', digits: 3 },
        { label: t`$\lVert f_n - \text{step}\rVert_2$`, expr: '1/sqrt(12*n)', digits: 3 },
      ],
    },
    caption: t`Exact distances: $\lVert f_n - f_m\rVert_2 = \dfrac{|m - n|}{\max(m, n)\sqrt{12\min(m, n)}}$ and $\lVert f_n - f_m\rVert_\infty = \dfrac{|m - n|}{2\max(m, n)}$. The red area is where the two ramps differ.`,
  },
  example: {
    prompt: t`In $L^2[-1, 1]$ find the closest quadratic to $f(x) = |x|$, using the orthonormal Legendre functions $e_0 = \tfrac{1}{\sqrt2}$, $e_1 = \sqrt{\tfrac32}\,x$, $e_2 = \sqrt{\tfrac52}\,\tfrac{3x^2 - 1}{2}$. How far is it from $f$?`,
    visual: {
      type: 'graph',
      params: {
        x: [-1.05, 1.05], y: [-0.05, 1.12], aspect: 'wide', xlabel: 'x', ylabel: '',
        shade: [{ fn: 'max(abs(x), 3/16 + 15*x^2/16)', lower: 'min(abs(x), 3/16 + 15*x^2/16)', from: -1, to: 1, color: 'bad', alpha: 0.3 }],
        curves: [{ fn: 'abs(x)', color: 'accent', width: 2.4, domain: [-1, 1], label: '|x|', labelAt: -0.8, labelDx: -24, labelDy: -4 }, { fn: '3/16 + 15*x^2/16', color: 'gold', width: 2.2, domain: [-1, 1], label: 'projection', labelAt: 0.55, labelDx: 8, labelDy: 6 }],
      },
      caption: t`$|x|$ (blue) and its orthogonal projection onto the quadratics (gold), $\tfrac{3}{16} + \tfrac{15}{16}x^2$. Red: the error, whose squared area-weighted size is $1/96$.`,
    },
    steps: [
      { label: 'Components', text: t`$\langle e_0, f\rangle = \tfrac{1}{\sqrt2}\int_{-1}^1|x|\,dx = \tfrac{1}{\sqrt2}$. $\langle e_1, f\rangle = 0$, since $x|x|$ is odd. $\langle e_2, f\rangle = \sqrt{\tfrac52}\int_0^1 (3x^3 - x)\,dx = \sqrt{\tfrac52}\cdot\tfrac14$.` },
      { label: 'Project', text: t`The closest element of the span is $Pf = \sum_n\langle e_n, f\rangle e_n = \tfrac12 + \tfrac{5}{16}(3x^2 - 1) = \tfrac{3}{16} + \tfrac{15}{16}x^2$. No calculus of minimization is needed: in a Hilbert space the best approximation is the orthogonal projection.` },
      { label: 'Pythagoras', text: t`$f - Pf$ is orthogonal to every quadratic, so $\lVert f\rVert^2 = \lVert Pf\rVert^2 + \lVert f - Pf\rVert^2$. Here $\lVert f\rVert^2 = \int_{-1}^1 x^2dx = \tfrac23$ and $\lVert Pf\rVert^2 = \tfrac12 + \tfrac{5}{32} = \tfrac{21}{32}$.` },
      { label: 'The error', text: t`$\lVert f - Pf\rVert^2 = \tfrac23 - \tfrac{21}{32} = \tfrac{1}{96}$, so $\lVert f - Pf\rVert = ${nice(1 / Math.sqrt(96), 3)}$: exactly one eighth of $\lVert f\rVert = \sqrt{2/3}$, since $\tfrac{1}{96} \div \tfrac23 = \tfrac{1}{64}$.` },
      { label: 'Where completeness enters', text: t`Adding $e_4, e_6, \dots$ only shrinks the error (**Bessel**: $\sum|\langle e_n, f\rangle|^2 \le \lVert f\rVert^2$). Because the Legendre functions form a complete orthonormal set in $L^2[-1, 1]$, the error tends to $0$ and Bessel becomes **Parseval**, with equality. Completeness of the space is what guarantees the series of projections has a limit to converge to.` },
    ],
    answer: t`$Pf = \tfrac{3}{16} + \tfrac{15}{16}x^2$, with $\lVert f - Pf\rVert = 1/\sqrt{96} \approx ${nice(1 / Math.sqrt(96), 3)}$: the projection is the best quadratic in the $L^2$ sense, and Pythagoras gives the error without integrating it.`,
  },
  practice: [
    mcq({
      id: 'which-hilbert', difficulty: 1,
      prompt: t`Which of these, with the $L^2$ inner product $\int f g\,dx$ (or the dot product), is a **Hilbert space**?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.1, 1.15], aspect: 'wide', curves: [5, 20, 80].map((n, i) => ({ fn: RAMP(n), color: ['gold', 'accent2', 'accent'][i], width: 1.8 })).concat([{ fn: 'step(x - 0.5)', color: 'ink3', width: 1.4, dash: true, samples: 2000 }]) }, caption: t`Continuous ramps $f_5, f_{20}, f_{80}$ converging in $L^2$ to a step (dashed).` },
      choices: [t`$L^2[0, 1]$`, t`The continuous functions on $[0, 1]$`, t`The polynomials on $[0, 1]$`, t`$\mathbb Q^3$, triples of rational numbers`],
      answer: 0,
      why: {
        1: t`The ramps are a Cauchy sequence of continuous functions whose $L^2$ limit, a step, is not continuous: not complete.`,
        2: t`Polynomials can converge in $L^2$ to $e^x$ (its Taylor polynomials do), which is not a polynomial: not complete.`,
        3: t`Rational triples can converge to $(\sqrt2, 0, 0)$: not complete, for the same reason $\mathbb Q$ is not.`,
      },
      hints: ['A Hilbert space is an inner-product space that is complete.', 'For each choice, look for a Cauchy sequence whose limit escapes.'],
      teach: t`Hilbert space = inner product + completeness; the other three are inner-product spaces with holes, and $L^2$ is what you get by filling them.`,
      explain: t`$L^2[0, 1]$ is complete (the Riesz–Fischer theorem). The continuous functions and the polynomials are dense in it — every element of $L^2$ is a limit of them — but not complete on their own.`,
    }),
    num({
      id: 'ramp-step', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 5, 12, 25, 75, 300]);
        const ans = 1 / Math.sqrt(12 * n);
        return {
          prompt: t`$f_n$ rises linearly from $0$ to $1$ across $[\tfrac12 - \tfrac1{2n},\ \tfrac12 + \tfrac1{2n}]$ and is $0$ before, $1$ after. Find its $L^2[0, 1]$ distance from the step $H(x - \tfrac12)$ for $n = ${n}$. Give three significant figures.`,
          visual: { type: 'graph', params: { x: [Math.max(0, 0.5 - 1.5 / n), Math.min(1, 0.5 + 1.5 / n)], y: [-0.1, 1.15], aspect: 'wide', shade: [{ fn: `max(${RAMP(n)}, step(x - 0.5))`, lower: `min(${RAMP(n)}, step(x - 0.5))`, from: 0, to: 1, color: 'bad', alpha: 0.3 }], curves: [{ fn: RAMP(n), color: 'accent', width: 2.2 }, { fn: 'step(x - 0.5)', color: 'ink3', width: 1.4, dash: true, samples: 3000 }] }, caption: t`Zoomed onto the ramp of $f_{${n}}$: the two red triangles are where it differs from the step.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 / (12 * n), feedback: t`That is the squared distance, $\int|f_n - H|^2$. Take the square root.` }, { value: 1 / (4 * n), feedback: t`That is the $L^1$ distance (the area of the two triangles). $L^2$ integrates the square, then takes the root.` }],
          hints: [t`On the right half of the ramp, at distance $u$ from $\tfrac12$, the gap is $\tfrac12 - ${n}u$ for $0 < u < \tfrac{1}{${2 * n}}$.`, t`$\int_0^{1/${2 * n}}(\tfrac12 - ${n}u)^2du = \tfrac{1}{24\cdot${n}}$; double it for the left half.`],
          teach: t`The ramp-to-step distance $1/\sqrt{12n}$ goes to $0$: a continuous sequence converging in $L^2$ to a discontinuous limit.`,
          explain: t`$\lVert f_{${n}} - H\rVert_2^2 = 2\cdot\tfrac{1}{24\cdot${n}} = \tfrac{1}{${12 * n}}$, so the distance is $${nice(ans, 4)}$. The sup distance is $\tfrac12$ for every $n$.`,
        };
      },
    }),
    mcq({
      id: 'point-value', difficulty: 2,
      prompt: t`Let $g(x) = 0$ on $[0, 1]$ except $g(\tfrac12) = 5$. In $L^2[0, 1]$, what is $\lVert g\rVert_2$, and is $g$ the zero vector?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.5, 5.6], aspect: 'wide', curves: [{ fn: '0', color: 'accent', width: 2.4 }], points: [{ x: 0.5, y: 5, r: 5, color: 'bad', label: 'g(½) = 5', labelDx: 10 }, { x: 0.5, y: 0, r: 5, hollow: true, color: 'accent' }] }, caption: t`A function that is $0$ except at one point.` },
      choices: [t`$\lVert g\rVert_2 = 0$, and $g$ is the zero vector of $L^2$`, t`$\lVert g\rVert_2 = 5$, so $g$ is not zero`, t`$\lVert g\rVert_2 = 0$, but $g$ is a different vector from $0$`, t`$g$ is not in $L^2$, since it is discontinuous`],
      answer: 0,
      why: {
        1: t`That is its sup norm. $L^2$ integrates $g^2$, and a single point has zero length.`,
        2: t`A norm is definite: $\lVert g\rVert = 0$ only for the zero vector. To keep that true, $L^2$ identifies functions that differ on a set of zero length.`,
        3: t`$L^2$ is full of discontinuous functions; all that matters is $\int|g|^2 < \infty$.`,
      },
      hints: [t`Compute $\int_0^1 g^2\,dx$.`, 'Which norm axiom would break if g were a different vector from 0?'],
      teach: t`An element of $L^2$ is an equivalence class: functions equal except on a set of zero length are the same vector, so “the value at a point” is not defined.`,
      explain: t`$\int_0^1 g^2dx = 0$, so $\lVert g\rVert_2 = 0$ and, by definiteness, $g = 0$ in $L^2$. This is why a wave function’s value at one point carries no meaning, while integrals of $|\psi|^2$ over regions do.`,
    }),
    num({
      id: 'parseval-x', difficulty: 3,
      gen(r) {
        const N = r.pick([1, 2, 3, 5, 10]);
        let S = 0; for (let k = 1; k <= N; k++) S += 1 / (k * k);
        const ans = Math.sqrt(2 * Math.PI ** 3 / 3 - 4 * Math.PI * S);
        return {
          prompt: t`On $[-\pi, \pi]$, $f(x) = x$ has the orthonormal expansion $f = \sum_{k\ge1} c_k e_k$ with $e_k = \sin(kx)/\sqrt\pi$ and $c_k = \dfrac{2\sqrt\pi\,(-1)^{k+1}}{k}$, and $\lVert f\rVert^2 = \int_{-\pi}^{\pi}x^2dx = \dfrac{2\pi^3}{3}$. Using Pythagoras, find the $L^2$ error $\lVert f - S_N f\rVert$ of the partial sum with $N = ${N}$ terms.`,
          visual: { type: 'graph', params: { x: [-3.3, 3.3], y: [-3.8, 3.8], aspect: 'wide', curves: [{ fn: 'x', color: 'ink3', width: 1.4, dash: true, domain: [-3.1416, 3.1416] }, { sum: '2*(-1)^(k+1)*sin(k*x)/k', k: [1, N], color: 'accent', width: 2.2 }] }, caption: t`$f(x) = x$ (dashed) and its partial sum with $N = ${N}$ (blue). The error is largest near $\pm\pi$, where the periodic extension jumps.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI ** 3 / 3 - 4 * Math.PI * S, feedback: t`That is $\lVert f - S_Nf\rVert^2$. Take the square root.` }],
          hints: [t`$\lVert f - S_Nf\rVert^2 = \lVert f\rVert^2 - \sum_{k\le N}|c_k|^2$, because the error is orthogonal to the partial sum.`, t`$\sum_{k\le ${N}}|c_k|^2 = 4\pi\sum_{k\le ${N}}\frac{1}{k^2} = 4\pi\times${nice(S, 6)}$.`],
          teach: t`In an orthonormal basis the squared error of a partial sum is the squared norm minus the captured squared components — no integral of the error needed.`,
          explain: t`$\lVert f\rVert^2 - 4\pi\sum_{k\le ${N}}k^{-2} = ${nice(2 * Math.PI ** 3 / 3, 5)} - ${nice(4 * Math.PI * S, 5)}$, so the error is $${nice(ans, 4)}$. As $N \to \infty$ it goes to $0$ — Parseval — even though the partial sums never converge uniformly near $\pm\pi$.`,
        };
      },
    }),
    num({
      id: 'delta-norm', difficulty: 2,
      gen(r) {
        const [w, wT] = r.pick([[0.1, '0.1'], [0.01, '0.01'], [0.001, '0.001'], [0.0001, '10^{-4}']]);
        const ans = 1 / Math.sqrt(w);
        return {
          prompt: t`A Dirac delta is often pictured as a box of width $w$ and height $1/w$ (area $1$). What is the box’s $L^2$ norm when $w = ${wT}$?`,
          visual: { type: 'graph', params: { x: [-0.6, 0.6], y: [0, 11], aspect: 'wide', curves: [[0.5, 'gold'], [0.2, 'accent2'], [0.1, 'accent']].map(([ww, c]) => ({ fn: `step(${ww / 2} - abs(x))/${ww}`, color: c, width: 2, samples: 2000 })) }, caption: t`Boxes of area $1$ with widths $0.5$, $0.2$ and $0.1$. The area stays $1$; the integral of the square does not.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: t`$1$ is the area, $\int\delta_w\,dx$. The $L^2$ norm squares first: $\int\delta_w^2\,dx = 1/w$.` }, { value: 1 / w, feedback: t`That is the squared norm. Take the square root.` }],
          hints: [t`$\int\delta_w^2\,dx = (1/w)^2\times w$.`],
          teach: t`The boxes approaching $\delta$ have $L^2$ norm $1/\sqrt w \to \infty$: the delta function is not in $L^2$, so it is not a quantum state.`,
          explain: t`$\lVert\delta_w\rVert_2 = \sqrt{1/w} = ${nice(ans, 4)}$, growing without bound as $w \to 0$. Position “eigenstates” $\delta(x - x_0)$ and momentum eigenstates $e^{ikx}$ (with $\int|e^{ikx}|^2dx = \infty$ on $\mathbb R$) live outside $L^2$; they are generalized eigenvectors, used through integrals.`,
        };
      },
    }),
    order({
      id: 'best-approx', difficulty: 3,
      prompt: t`Prove that the orthogonal projection $Pf$ of $f$ onto a closed subspace $M$ is the **closest** point of $M$: for every $g \in M$, $\lVert f - g\rVert \ge \lVert f - Pf\rVert$. Put the steps in order.`,
      visual: { type: 'graph', params: { x: [-0.3, 3.3], y: [-0.4, 2.2], equal: true, aspect: 'wide', axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ fn: '0', color: 'ink3', width: 1.6, domain: [-0.2, 3.2], label: 'M', labelAt: 3.1, labelDy: 14 }, { param: ['2', '1.8*t'], t: [0, 1], color: 'good', width: 1.8, dash: true, label: 'f − Pf', labelAt: 0.5, labelDx: -58, labelDy: 4 }, { param: ['2.9 - 0.9*t', '1.8*t'], t: [0, 1], color: 'bad', width: 1.8, dash: true, label: 'f − g', labelAt: 0.5, labelDx: 8, labelDy: 4 }], arrows: [{ from: [0, 0], to: [2, 1.8], color: 'accent', width: 2.2, label: 'f' }, { from: [0, 0], to: [2, 0], color: 'gold', width: 2.2, label: 'Pf', labelDy: 14 }], points: [{ x: 2.9, y: 0, r: 4, color: 'bad', label: 'g', labelDx: 4, labelDy: 14 }] }, caption: t`A picture in the plane: $M$ is the line, $f - Pf$ is perpendicular to it, and any other $g$ in $M$ is farther from $f$. The same algebra holds in any Hilbert space.` },
      items: [
        t`Write $f - g = (f - Pf) + (Pf - g)$.`,
        t`$f - Pf$ is orthogonal to $M$, and $Pf - g$ lies in $M$, so the two pieces are orthogonal.`,
        t`By Pythagoras, $\lVert f - g\rVert^2 = \lVert f - Pf\rVert^2 + \lVert Pf - g\rVert^2$.`,
        t`So $\lVert f - g\rVert^2 \ge \lVert f - Pf\rVert^2$, with equality only when $g = Pf$.`,
      ],
      hints: ['Split the error into a part perpendicular to M and a part inside M.', t`Pythagoras needs $\langle f - Pf,\ Pf - g\rangle = 0$.`],
      teach: t`Best approximation in a Hilbert space is orthogonal projection, proved by one application of Pythagoras.`,
      explain: t`The perpendicular part is the same for every $g$; only the in-$M$ part changes, and it vanishes for $g = Pf$. Completeness (with $M$ closed) is what guarantees $Pf$ exists at all — the projection theorem.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-normalize', difficulty: 2, transfer: true,
      gen(r) {
        const a = r.pick([0.05, 0.1, 0.2, 0.5]);
        const ans = 1 / Math.sqrt(a);
        return {
          prompt: t`An electron bound to a thin attractive potential has the wave function $\psi(x) = A\,e^{-|x|/a}$ with $a = ${a}$ nm. Choose $A > 0$ so that $\psi$ is a unit vector in $L^2(\mathbb R)$, $\int_{-\infty}^{\infty}|\psi|^2dx = 1$. Give $A$ as a number in $\text{nm}^{-1/2}$.`,
          visual: { type: 'graph', params: { x: [-4 * a, 4 * a], y: [0, 1.15 / a], aspect: 'wide', xlabel: 'x (nm)', ylabel: '', curves: [{ fn: `${nice(ans, 6)}*e^(-abs(x)/${a})`, color: 'accent', width: 2.2, label: 'ψ', labelAt: a, labelDy: -6 }, { fn: `${nice(1 / a, 6)}*e^(-2*abs(x)/${a})`, color: 'violet', width: 1.8, dash: true, label: '|ψ|²', labelAt: -a * 0.6, labelDx: -40 }], shade: [{ fn: `${nice(1 / a, 6)}*e^(-2*abs(x)/${a})`, from: -4 * a, to: 4 * a, color: 'violet', alpha: 0.15 }] }, caption: t`The normalized $\psi$ and $|\psi|^2$, whose total area is $1$ (the curves are drawn to scale once $A$ is right).` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 / a, feedback: t`That is $A^2$. The condition is $A^2a = 1$.` }, { value: 1 / Math.sqrt(2 * a), feedback: t`$\int_{-\infty}^\infty e^{-2|x|/a}dx = a$ — both halves count: $2\times\tfrac a2$.` }],
          hints: [t`$\int_{-\infty}^{\infty}e^{-2|x|/a}\,dx = 2\int_0^\infty e^{-2x/a}dx = a$.`, t`So $A^2a = 1$.`],
          teach: t`A quantum state is a unit vector of $L^2$: normalizing fixes the length to $1$ by choosing the constant, and the units come out as $\text{length}^{-1/2}$.`,
          explain: t`$A^2\cdot${a} = 1$, so $A = 1/\sqrt{${a}} = ${nice(ans, 4)}\ \text{nm}^{-1/2}$. Note that $\psi$ has a kink at $0$ — irrelevant to membership in $L^2$, which asks only for finite $\int|\psi|^2$.`,
        };
      },
    }),
    mcq({
      id: 'cp-sobolev', difficulty: 3, transfer: true,
      prompt: t`Choquet-Bruhat’s theorem — Einstein’s equations have a unique local solution for given initial data — is proved with **energy estimates** in Sobolev spaces $H^s$, whose norm adds up $L^2$ norms of a field and its derivatives up to order $s$. Why $L^2$-type norms rather than the sup norm?`,
      visual: { type: 'graph', params: { x: [-6, 6], y: [-0.1, 1.15], aspect: 'wide', xlabel: 'x', ylabel: 'u', curves: [{ fn: 'e^(-x^2)', color: 'gold', width: 2, label: 't = 0', labelAt: 0.4, labelDx: 6, labelDy: -6 }, { fn: '0.5*e^(-(x - 3)^2) + 0.5*e^(-(x + 3)^2)', color: 'accent', width: 2.2, label: 't = 3', labelAt: 3, labelDx: 6, labelDy: -6 }] }, caption: t`A solution of the 1D wave equation $u_{tt} = u_{xx}$ (with $c = 1$) released from rest: the pulse splits in two. Its peak halves, but the energy $\tfrac12\int(u_t^2 + u_x^2)\,dx$ — an $L^2$ quantity — is exactly conserved.` },
      choices: [t`For wave equations the energy, an $L^2$ norm of derivatives, is controlled in time, while sup norms are not controlled by any conserved quantity`, t`Sup norms cannot be computed for functions of several variables`, t`Sobolev spaces are used only because they are easier to program`, t`Einstein’s equations are elliptic, and $L^2$ is the norm for elliptic equations`],
      answer: 0,
      why: {
        1: t`Sup norms exist in any dimension; the problem is that the wave equation does not keep them under control.`,
        2: t`They are used because the proof needs a norm the evolution respects. Codes often check constraint violations in $L^2$ for related reasons, but that is not why the theorem uses them.`,
        3: t`In harmonic gauge Einstein’s equations are hyperbolic — wave equations for the metric — which is exactly why energy methods work.`,
      },
      hints: [t`What quantity does a wave equation conserve?`, t`Energy is $\tfrac12\int(u_t^2 + |\nabla u|^2)$: an $L^2$ norm of first derivatives.`],
      teach: t`Hyperbolic equations conserve or bound energies, which are $L^2$ norms of derivatives; that makes Sobolev (Hilbert) spaces the natural home for well-posedness proofs.`,
      explain: t`Energy estimates bound the $H^s$ norm at later times by its initial value, and Sobolev embedding then turns enough $L^2$ derivatives into pointwise control. See [Hadamard’s criteria](#/lesson/st-b.B12.1) and [harmonic gauge and Choquet-Bruhat’s theorem](#/lesson/st-b.B15.2).`,
    }),
    num({
      id: 'cp-l2-sequence', difficulty: 3,
      prompt: t`The sequence space $\ell^2$ holds sequences with $\sum|a_n|^2 < \infty$; Parseval makes it a copy of $L^2$ (a function $\leftrightarrow$ its coefficients). Is the harmonic sequence $a = (1, \tfrac12, \tfrac13, \dots)$ in $\ell^2$? If so, give its norm $\lVert a\rVert_2 = \bigl(\sum 1/n^2\bigr)^{1/2}$.`,
      visual: { type: 'calc-series', params: { view: 'sums', term: '1/n^2', limit: 'pi^2/6', N: { min: 1, max: 40, value: 20 }, readout: false }, caption: t`Partial sums of $1/n^2$ climbing to $\pi^2/6$ (dashed). The harmonic sum $\sum 1/n$ itself diverges — but its squares converge. Only finitely many terms are drawn.` },
      answer: Math.PI / Math.sqrt(6), tol: { rel: 0.003 },
      errors: [{ value: Math.PI ** 2 / 6, feedback: t`That is $\lVert a\rVert_2^2 = \pi^2/6$. Take the square root.` }],
      hints: [t`$\sum_{n\ge1} 1/n^2 = \pi^2/6$ (Euler).`, t`The norm is the square root of that sum.`],
      teach: t`A sequence can be square-summable without being summable: $(1/n)$ is in $\ell^2$ but not in $\ell^1$.`,
      explain: t`$\lVert a\rVert_2 = \pi/\sqrt6 = ${nice(Math.PI / Math.sqrt(6), 5)}$. So $(1/n)$ is a perfectly good vector of $\ell^2$ — the coefficient sequence of a sawtooth, for instance — even though $\sum 1/n$ diverges.`,
    }),
  ],
  sources: [
    { label: 'Kreyszig, Introductory Functional Analysis with Applications (Wiley, 1978), ch. 3 (Hilbert spaces, projection, Parseval)', url: 'https://openlibrary.org/isbn/9780471504597' },
    { label: 'Gieres, Mathematical surprises and Dirac’s formalism in quantum mechanics, Rep. Prog. Phys. 63, 1893 (2000)', url: 'https://arxiv.org/abs/quant-ph/9907069' },
    { label: 'Ringström, The Cauchy Problem in General Relativity (EMS, 2009): Sobolev spaces and energy estimates', url: 'https://doi.org/10.4171/053' },
  ],
});
