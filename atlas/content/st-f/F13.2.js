// Richardson extrapolation — if A(h) = A + Chᵖ + O(h^q), two runs cancel the
// hᵖ term: A ≈ (rᵖA(h/r) − A(h))/(rᵖ − 1). Repeated on the trapezoid rule,
// whose error has only even powers (Euler–Maclaurin), it is Romberg
// integration: ∫₀¹e^(−x²)dx to 10⁻⁵ from 5 samples where the trapezoid needs
// about 80. Where its assumption fails it fails: √x (error ∝ h^1.5) barely
// improves, and for the smooth periodic pendulum-period integrand, where the
// trapezoid is already exponentially accurate, Romberg makes things worse.
// Applied to a whole simulation (F13.1's pendulum) and to grid studies: the
// grid convergence index GCI = 1.25|ε|/(rᵖ − 1). (Euler + Richardson is
// math2280 DE-2.7; the adaptive-quadrature (S₂ − S₁)/15 is F5.3.)
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { romberg, trapz, richardson, TABLEAU, rkStep, n12, lg } from './_ode.js';

const t = String.raw;

// ── three integrands ──
const ERFI = 0.746824132812427025;                         // ∫₀¹ e^(−x²) dx = (√π/2) erf 1
const KM = 0.5, KEX = (() => { let a = 1, g = Math.sqrt(1 - KM); for (let i = 0; i < 40; i++) [a, g] = [(a + g) / 2, Math.sqrt(a * g)]; return Math.PI / (2 * a); })();
const INTS = [
  { key: 1, label: t`$\int_0^1 e^{-x^2}dx$`, f: (x) => Math.exp(-x * x), a: 0, b: 1, exact: ERFI },
  { key: 2, label: t`$\int_0^1 \sqrt x\,dx$`, f: Math.sqrt, a: 0, b: 1, exact: 2 / 3 },
  { key: 3, label: 'a pendulum’s period integral', f: (p) => 1 / Math.sqrt(1 - KM * Math.sin(p) ** 2), a: 0, b: Math.PI / 2, exact: KEX },
];
const LV = 7;
const TAB = INTS.map((I) => romberg(I.f, I.a, I.b, LV));
const COLS = [['accent', 'trapezoid'], ['gold', '1 extrapolation'], ['violet', '2 extrapolations'], ['bad', '3 extrapolations']];
const wh = (k) => `step(0.5 - abs(ig - ${k}))`;
const R = TAB[0];
const TN = (() => { const e1 = Math.abs(R[0][0] - ERFI); return Math.ceil(Math.sqrt(e1 / Math.abs(R[2][2] - ERFI))); })();

// ── F13.1's forced pendulum, extrapolated ──
const Fp = (tt, y) => [y[1], -Math.sin(y[0]) - 0.2 * y[1] + 0.9 * Math.cos(0.7 * tt)];
const runP = (n) => { const h = 10 / n; let y = [0.3, 0]; for (let i = 0; i < n; i++) y = rkStep(TABLEAU.rk4, Fp, i * h, y, h); return y[0]; };
const P200 = runP(200), P400 = runP(400), PREF = runP(12800), PEXT = richardson(P200, P400, 4);

export default lesson({
  id: 'st-f.F13.2',
  title: 'Richardson extrapolation',
  minutes: 14, difficulty: 3,
  intro: t`If you know **how** a computed answer depends on the step — $A(h) = A + Ch^p + O(h^q)$ with known $p$ — then two runs are enough to remove the leading error. Write the expansion for $h$ and for $h/r$, multiply the second by $r^p$, subtract, and $C$ disappears:

$$A \approx \frac{r^pA(h/r) - A(h)}{r^p - 1} + O(h^q)$$

That is **Richardson extrapolation**: a higher-order answer from lower-order runs, for the cost of one line. The trapezoid rule is the perfect candidate: by the Euler–Maclaurin formula its error contains only even powers, $h^2, h^4, h^6, \ldots$, so extrapolating again and again gains two orders each time — **Romberg integration**. The whole method rests on the assumed expansion; where it is wrong, extrapolation is wrong.`,
  symbols: [
    { tex: 'A(h)', text: 'the answer computed with step (or grid spacing) $h$' },
    { tex: 'A', text: 'the exact answer, the limit $h \\to 0$' },
    { tex: 'p', text: 'the order of the leading error term; it must be known (or measured, [F13.1](#/lesson/st-f.F13.1))' },
    { tex: 'r', text: 'the refinement ratio between the two runs (2 for halving)' },
    { tex: 'q', text: 'the order of the next term, which becomes the extrapolated value’s order: $q = p + 2$ for the trapezoid rule' },
  ],
  why: 'Extrapolation turns any convergent computation — an integral, a whole trajectory, a CFD drag coefficient — into a more accurate one plus an error estimate, and it underlies Romberg and Bulirsch–Stoer integrators and the grid-convergence index used to report engineering simulations.',
  visual: {
    type: 'graph',
    title: 'Romberg’s columns',
    lead: t`Error of each column of the Romberg table against the number of function evaluations, log–log. Blue: the trapezoid rule; each further colour is one more Richardson step. Choose the integrand.`,
    tasks: [
      'For $e^{-x^2}$ the columns fall with slopes 2, 4, 6, 8 (against the panel width): each extrapolation adds two orders, as Euler–Maclaurin promises — until round-off near 10⁻¹⁴.',
      'For √x every column falls at the same slow rate: the error is not a series in h², so the extrapolation removes nothing useful.',
      'For the pendulum’s period integral the trapezoid rule (blue) is already at round-off with 9 points; extrapolating makes it worse. Romberg assumes an h² error that is not there.',
    ],
    params: {
      x: [-0.1, 2.25], y: [-16.5, 0], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'function evaluations', ylabel: '|error|',
      choices: [{ key: 'ig', label: 'Integrand', options: INTS.map((I) => [I.key, I.label]), value: 1, explain: 'Smooth; a singular derivative at 0; smooth and periodic-like (its odd derivatives vanish at both ends).' }],
      points: INTS.flatMap((I, k) => TAB[k].flatMap((row, i) => row.slice(0, 4).map((v, j) => ({ x: n12(lg(2 ** i + 1)), y: n12(lg(Math.max(Math.abs(v - I.exact), 1e-16))), r: 4.5 - 0.5 * j, color: COLS[j][0], when: wh(I.key) })))),
      legend: COLS.map(([c, l]) => ({ label: l, color: c, point: true })), legendAt: 'bl',
    },
    caption: 'Exact Romberg tables in float64 (7 levels: 2 to 65 evaluations). Errors below 10⁻¹⁶ are drawn at that level. The pendulum integral is K(m) for m = ½, a large-amplitude (90°) pendulum’s period in units of 4√(L/g).',
  },
  example: {
    prompt: t`Compute $\int_0^1 e^{-x^2}\,dx$ (exact $${ERFI.toFixed(10)}$) by Romberg integration from the trapezoid rule with 1, 2 and 4 panels — five function values in all. Then extrapolate a whole simulation.`,
    visual: {
      type: 'graph',
      params: { x: [-0.03, 1.03], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'exp(−x²)',
        curves: [{ fn: 'exp(-x^2)', color: 'ink3', width: 2.4 }, ...[0, 0.25, 0.5, 0.75].map((x0) => ({ param: [`${x0} + 0.25*t`, `${n12(Math.exp(-x0 * x0))} + (${n12(Math.exp(-((x0 + 0.25) ** 2)) - Math.exp(-x0 * x0))})*t`], t: [0, 1], color: 'accent', width: 1.8, samples: 10 }))],
        points: [0, 0.25, 0.5, 0.75, 1].map((x) => ({ x, y: n12(Math.exp(-x * x)), r: 5, color: 'gold' })) },
      caption: 'The integrand and the four-panel trapezoid (blue chords) through the five samples (gold) that the whole table uses.',
    },
    steps: [
      { label: 'Trapezoid column', text: t`$T(1) = \tfrac12(1 + e^{-1}) = ${R[0][0].toFixed(7)}$, $T(\tfrac12) = ${R[1][0].toFixed(7)}$, $T(\tfrac14) = ${R[2][0].toFixed(7)}$. Errors $${R.slice(0, 3).map((r) => tex(Math.abs(r[0] - ERFI), 2)).join(',\\ ')}$: down 4× per halving, $p = 2$.` },
      { label: 'First extrapolation', text: t`With $p = 2$, $r = 2$: $R_{1,1} = T(\tfrac12) + \frac{T(\frac12) - T(1)}{3} = ${R[1][1].toFixed(7)}$ and $R_{2,1} = ${R[2][1].toFixed(7)}$. These are exactly Simpson’s rule — Simpson is extrapolated trapezoid. Errors $${tex(Math.abs(R[1][1] - ERFI), 2)}$, $${tex(Math.abs(R[2][1] - ERFI), 2)}$.` },
      { label: 'Second extrapolation', text: t`The next error term is $h^4$, so divide by $2^4 - 1 = 15$: $R_{2,2} = R_{2,1} + \frac{R_{2,1} - R_{1,1}}{15} = ${R[2][2].toFixed(7)}$, error $${tex(Math.abs(R[2][2] - ERFI), 2)}$.` },
      { label: 'Cost comparison', text: t`The plain trapezoid rule would need about $${TN}$ panels for that accuracy. Five function values against $${TN + 1}$ — and the extrapolation cost three subtractions.` },
      { label: 'A whole simulation', text: t`The same trick works for anything with a known order. The forced pendulum of F13.1 with RK4 ($p = 4$): $u_{0.05} = ${P200.toFixed(10)}$, $u_{0.025} = ${P400.toFixed(10)}$. Extrapolated: $u_{0.025} + (u_{0.025} - u_{0.05})/15 = ${PEXT.toFixed(10)}$. Error $${tex(Math.abs(P400 - PREF), 2)} \to ${tex(Math.abs(PEXT - PREF), 2)}$ (against a run with 12 800 steps).` },
      { label: 'Fine print', text: t`It works because both runs are in the asymptotic range with a **known** $p$. Get $p$ wrong, or extrapolate outside that range, and the “improved” value can be worse than either input — the Explore’s √x and pendulum integrals show both failures.` },
    ],
    answer: t`$R_{2,2} = ${R[2][2].toFixed(7)}$, error $${tex(Math.abs(R[2][2] - ERFI), 1)}$ from 5 samples; Richardson on the RK4 pendulum cuts the error from $${tex(Math.abs(P400 - PREF), 1)}$ to $${tex(Math.abs(PEXT - PREF), 1)}$.`,
  },
  practice: [
    num({
      id: 'extrap-2', difficulty: 2,
      gen(r) {
        const [lab, ex, C] = r.pick([['a nozzle’s thrust coefficient', 1.712, -0.31], ['a drag coefficient', 0.4237, 0.52], ['an orbit period (h)', 1.5428, 0.087]]);
        const h = r.pick([0.1, 0.2]), A1 = +(ex + C * h * h + 0.6 * C * h ** 4).toFixed(6), A2 = +(ex + (C * h * h) / 4 + (0.6 * C * h ** 4) / 16).toFixed(6);
        const ans = (4 * A2 - A1) / 3;
        return {
          prompt: t`A second-order method gives ${lab} as $A(h) = ${A1}$ and $A(h/2) = ${A2}$. What is the Richardson-extrapolated value?`,
          visual: {
            type: 'graph',
            params: { x: [-0.02, 1.15], y: [Math.min(A1, A2, ex) - 0.3 * Math.abs(A1 - A2) - 1e-6, Math.max(A1, A2, ex) + 0.4 * Math.abs(A1 - A2) + 1e-6], aspect: 'wide', axesAt: 'edge', xlabel: 'h² (relative to the coarse run)', ylabel: 'A', yticks: 0,
              points: [{ x: 1, y: A1, r: 5, color: 'accent', label: 'A(h)', labelDy: -12 }, { x: 0.25, y: A2, r: 5, color: 'accent', label: 'A(h/2)', labelDy: -12 }],
              vlines: [{ x: 0, color: 'ink4' }] },
            caption: 'Plotted against h², a second-order result lies on a straight line: extrapolating to h² = 0 is Richardson’s idea.',
          },
          answer: ans, tol: { rel: 2e-6, abs: 1e-6 },
          errors: [{ value: (16 * A2 - A1) / 15, feedback: 'That assumes p = 4. For a second-order method use 2² = 4: (4A(h/2) − A(h))/3.' }, { value: (A1 + A2) / 2, feedback: 'Averaging does not cancel the h² term; weight the finer run by 2ᵖ.' }].filter((e) => Math.abs(e.value - ans) > 3e-6 * Math.abs(ans) + 1e-6),
          hints: [t`$A \approx \dfrac{2^2A(h/2) - A(h)}{2^2 - 1}$.`, t`$= (4\times${A2} - ${A1})/3$.`],
          teach: 'For a second-order result, (4A(h/2) − A(h))/3 cancels the h² error — the line through the two runs, read at h = 0.',
          explain: t`$(4\times${A2} - ${A1})/3 = ${n12(+ans.toFixed(7))}$. The remaining error is the next term, $O(h^4)$; here the underlying limit is $${ex}$.`,
        };
      },
    }),
    num({
      id: 'extrap-r', difficulty: 2,
      gen(r) {
        const rr = r.pick([1.5, 2, 3]), p = r.pick([1, 2]), A = r.pick([2.4, 15.6, 0.835]);
        const c = r.pick([0.3, -0.2]) * A, A1 = +(A + c).toFixed(4), A2 = +(A + c / rr ** p).toFixed(4);
        const ans = (rr ** p * A2 - A1) / (rr ** p - 1);
        return {
          prompt: t`A heat-flux estimate converges at order $p = ${p}$. Runs on a coarse grid and on one refined by $r = ${rr}$ give $${A1}$ and $${A2}$ (in $\text{kW/m}^2$). Extrapolate.`,
          visual: {
            type: 'graph',
            params: { x: [-0.05, 1.1], y: [Math.min(A1, A2) - 0.45 * Math.abs(c), Math.max(A1, A2) + 0.45 * Math.abs(c)], aspect: 'wide', axesAt: 'edge', xlabel: `h^${p} (relative)`.replace('^1', '').replace('^2', '²'), ylabel: 'q (kW/m²)', yticks: 0,
              points: [{ x: 1, y: A1, r: 5, color: 'accent', label: 'coarse', labelDy: -12 }, { x: n12(1 / rr ** p), y: A2, r: 5, color: 'accent', label: 'fine', labelDy: -12 }], vlines: [{ x: 0, color: 'ink4' }] },
            caption: 'The two runs against hᵖ: the extrapolation is the straight line through them, followed to zero.',
          },
          answer: ans, units: 'kW/m^2', tol: { rel: 1e-4 },
          errors: [{ value: (4 * A2 - A1) / 3, feedback: 'That assumes r = 2 and p = 2. Use rᵖ with the actual ratio and order.' }].filter((e) => Math.abs(e.value - ans) > 2e-4 * Math.abs(ans)),
          hints: [t`$r^p = ${n12(rr ** p)}$.`, t`$A \approx \dfrac{${n12(rr ** p)}\times${A2} - ${A1}}{${n12(rr ** p - 1)}}$.`],
          teach: 'Richardson works for any refinement ratio: weight the finer run by rᵖ and divide by rᵖ − 1.',
          explain: t`$${n12(+ans.toFixed(5))}\ \text{kW/m}^2$. The correction, $${n12(+(ans - A2).toFixed(5))}$, doubles as an error estimate for the fine run.`,
        };
      },
    }),
    num({
      id: 'romberg-entry', difficulty: 2,
      gen(r) {
        const cases = [[t`\int_0^2 \frac{dx}{1+x^2}`, (x) => 1 / (1 + x * x), 0, 2, '1/(1 + x^2)'], [t`\int_1^3 \ln x\,dx`, Math.log, 1, 3, 'ln(x)'], [t`\int_0^1 \cos x^2\,dx`, (x) => Math.cos(x * x), 0, 1, 'cos(x^2)']];
        const [Itex, f, a, b, fx] = cases[r.pick([0, 1, 2])];
        const T2 = +trapz(f, a, b, 2).toFixed(7), T4 = +trapz(f, a, b, 4).toFixed(7), ans = T4 + (T4 - T2) / 3;
        return {
          prompt: t`For $${Itex}$ the trapezoid rule gives $T(2\text{ panels}) = ${T2}$ and $T(4\text{ panels}) = ${T4}$. What is the first Romberg extrapolation from them?`,
          visual: {
            type: 'graph',
            params: { x: [a - 0.05 * (b - a), b + 0.05 * (b - a)], y: [Math.min(0, f(b)) - 0.1, Math.max(f(a), f(b), f((a + b) / 2)) * 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'f(x)',
              curves: [{ fn: fx, color: 'ink3', width: 2.2, domain: [a, b] }], points: [0, 1, 2, 3, 4].map((k) => ({ x: n12(a + ((b - a) * k) / 4), y: n12(f(a + ((b - a) * k) / 4)), r: 4.5, color: 'gold' })) },
            caption: 'The integrand and the five samples both trapezoid sums use.',
          },
          answer: ans, tol: { rel: 1e-6, abs: 2e-7 },
          errors: [{ value: T4 + (T4 - T2) / 15, feedback: 'The trapezoid error starts at h²: divide by 2² − 1 = 3, not 15.' }],
          hints: ['The trapezoid rule is second order: p = 2.', t`$R = T_4 + (T_4 - T_2)/3$.`],
          teach: 'The first Romberg step, T(h/2) + (T(h/2) − T(h))/3, is exactly Simpson’s rule.',
          explain: t`$${T4} + (${T4} - ${T2})/3 = ${ans.toFixed(7)}$ — the same number as Simpson’s rule with 4 panels ([F5.1](#/lesson/st-f.F5.1)), with no new function values.`,
        };
      },
    }),
    mcq({
      id: 'even-powers', difficulty: 3,
      prompt: t`Each column of a Romberg table gains **two** orders of accuracy, not one. Why?`,
      visual: {
        type: 'graph',
        params: { x: [-0.1, 2.25], y: [-16.5, 0], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'function evaluations', ylabel: '|error|',
          points: TAB[0].flatMap((row, i) => row.slice(0, 4).map((v, j) => ({ x: n12(lg(2 ** i + 1)), y: n12(lg(Math.max(Math.abs(v - ERFI), 1e-16))), r: 4.5 - 0.5 * j, color: COLS[j][0] }))),
          legend: COLS.map(([c, l]) => ({ label: l, color: c, point: true })), legendAt: 'bl' },
        caption: 'Romberg columns for $\\int_0^1 e^{-x^2}\\, dx$.',
      },
      choices: [
        'By the Euler–Maclaurin formula the trapezoid error is a series in h², h⁴, h⁶ … with no odd powers, so removing one term jumps two orders',
        'Each extrapolation doubles the number of function evaluations',
        'Richardson extrapolation always gains two orders for any method',
        'The trapezoid rule is exact for quadratics',
      ],
      answer: 0,
      why: {
        1: 'The extrapolations use values already computed; the evaluations double only when a new row is added.',
        2: 'For a method whose error has every power, one extrapolation gains one order.',
        3: 'It is exact only for linear functions; Simpson (one extrapolation) is exact for cubics.',
      },
      hints: ['What does the Euler–Maclaurin formula say about the trapezoid rule’s error?', 'If the error series skips odd powers, which term comes after h²?'],
      teach: 'Extrapolation gains as many orders as the gap to the next term in the error expansion — two for the trapezoid rule, because only even powers appear.',
      explain: t`$T(h) - I = c_2h^2 + c_4h^4 + c_6h^6 + \cdots$ with $c_{2k}$ proportional to $f^{(2k-1)}(b) - f^{(2k-1)}(a)$. Cancelling $h^2$ leaves $h^4$; cancelling that leaves $h^6$. That is why the divisors are $3, 15, 63, \ldots = 4^j - 1$.`,
    }),
    mcq({
      id: 'periodic', difficulty: 3,
      prompt: t`For a large-amplitude pendulum the period needs $\int_0^{\pi/2}\frac{d\varphi}{\sqrt{1 - m\sin^2\varphi}}$. The trapezoid rule with 8 panels is already correct to $10^{-13}$, and Romberg extrapolation makes the result **worse**. Why?`,
      visual: {
        type: 'graph',
        params: { x: [-0.1, 2.25], y: [-16.5, 0], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'function evaluations', ylabel: '|error|',
          points: TAB[2].flatMap((row, i) => row.slice(0, 4).map((v, j) => ({ x: n12(lg(2 ** i + 1)), y: n12(lg(Math.max(Math.abs(v - KEX), 1e-16))), r: 4.5 - 0.5 * j, color: COLS[j][0] }))),
          legend: COLS.map(([c, l]) => ({ label: l, color: c, point: true })), legendAt: 'bl' },
        caption: 'Romberg columns for the period integral (m = ½).',
      },
      choices: [
        'Every odd derivative of the integrand vanishes at both ends, so all the Euler–Maclaurin terms vanish and the trapezoid error is exponentially small — not of the form Ch², which extrapolation assumes',
        'The integrand is singular at the end of the interval',
        'Romberg extrapolation is unstable for trigonometric functions',
        'Round-off from the square root dominates',
      ],
      answer: 0,
      why: {
        1: 'For m = ½ the square root stays well above zero; the integrand is smooth (it would be singular only for m = 1).',
        2: 'Romberg is perfectly stable; it just assumes the wrong error form here.',
        3: 'Round-off is near 10⁻¹⁶; extrapolation’s errors here are 10⁻⁷ to 10⁻¹⁰.',
      },
      hints: ['The integrand is symmetric about φ = 0 and φ = π/2. What does that do to its odd derivatives there?', 'Which coefficients appear in the Euler–Maclaurin series?'],
      teach: 'Extrapolation helps only when the error has the assumed form; for smooth periodic integrands the trapezoid rule is already spectrally accurate.',
      explain: t`The Euler–Maclaurin coefficients involve $f'(b) - f'(a)$, $f'''(b) - f'''(a)$, …, all zero here, so the trapezoid error decays geometrically. Romberg’s combinations then amplify the small, non-$h^2$ errors of the coarse rows instead of cancelling anything. The same is why the trapezoid rule is the method of choice for periodic integrals and the discrete Fourier transform.`,
    }),
    num({
      id: 'gci', difficulty: 3,
      gen(r) {
        const f1 = r.pick([0.3184, 1.0472, 2.7305]), rr = r.pick([1.5, 2]), p = r.pick([1.8, 2, 2.2]), eps = r.pick([0.004, 0.012, -0.007]);
        const f2 = +(f1 * (1 + eps)).toFixed(4), e = Math.abs((f2 - f1) / f1), ans = (100 * 1.25 * e) / (rr ** p - 1);
        return {
          prompt: t`A CFD study reports the fine-grid drag coefficient $f_1 = ${f1}$ and the medium-grid $f_2 = ${f2}$, with refinement ratio $r = ${rr}$ and observed order $p = ${p}$. The grid convergence index is $\text{GCI} = \dfrac{1.25\,\lvert(f_2 - f_1)/f_1\rvert}{r^p - 1}$. What is it, in percent?`,
          visual: {
            type: 'graph',
            params: { x: [-0.05, 1.15], y: [-0.2, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'cell size (relative)', ylabel: 'f (schematic)', yticks: 0,
              points: [{ x: 1, y: 1, r: 5, color: 'accent', label: 'medium f₂', labelDy: -12 }, { x: n12(1 / rr), y: n12(1 / rr ** p), r: 5, color: 'accent', label: 'fine f₁', labelDy: -12 }],
              curves: [{ fn: `x^${p}`, color: 'ink4', dash: true, width: 1.2, domain: [0, 1.1] }] },
            caption: 'Two grids approaching the limit at x = 0 (schematic).',
          },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (100 * e) / (rr ** p - 1), feedback: 'Include the safety factor 1.25 (used when three grids confirmed the order).' }, { value: 100 * 1.25 * e, feedback: 'Divide by rᵖ − 1: the difference between grids overstates the fine grid’s own error.' }],
          hints: [t`$\lvert(f_2 - f_1)/f_1\rvert = ${tex(e, 3)}$; $r^p = ${(rr ** p).toFixed(4)}$.`, t`GCI $= 1.25\times${tex(e, 3)}/${(rr ** p - 1).toFixed(4)}$, times 100 for percent.`],
          teach: 'The GCI is a Richardson error estimate for the fine grid, padded by a safety factor, and reported as a percentage band.',
          explain: t`GCI $= ${ans.toFixed(3)}\%$: report $f_1 = ${f1} \pm ${(f1 * ans / 100).toFixed(4)}$ as the discretisation uncertainty. The safety factor 1.25 is Roache’s and Celik et al.’s recommendation when the order was measured on three grids; 3 when it was not.`,
        };
      },
    }),
    code({
      id: 'romberg-code', difficulty: 3,
      prompt: t`Write \`romberg(f, a, b, levels)\` returning the table as a list of rows: \`R[i][0]\` is the trapezoid rule with $2^i$ panels and \`R[i][j] = R[i][j-1] + (R[i][j-1] - R[i-1][j-1]) / (4**j - 1)\`. Apply it to $\int_0^1 e^{-x^2}\,dx$ with 6 levels.`,
      starter: t`import math

def trap(f, a, b, n):
    h = (b - a) / n
    return h * (0.5 * (f(a) + f(b)) + sum(f(a + k * h) for k in range(1, n)))

def romberg(f, a, b, levels):
    R = []
    # row i: trapezoid with 2**i panels, then the extrapolations j = 1 … i
    return R

R = romberg(lambda x: math.exp(-x * x), 0.0, 1.0, 6)
exact = math.sqrt(math.pi) / 2 * math.erf(1)
print(R[-1][-1], abs(R[-1][-1] - exact))
`,
      answer: t`import math

def trap(f, a, b, n):
    h = (b - a) / n
    return h * (0.5 * (f(a) + f(b)) + sum(f(a + k * h) for k in range(1, n)))

def romberg(f, a, b, levels):
    R = []
    for i in range(levels):
        row = [trap(f, a, b, 2**i)]
        for j in range(1, i + 1):
            row.append(row[j - 1] + (row[j - 1] - R[i - 1][j - 1]) / (4**j - 1))
        R.append(row)
    return R

R = romberg(lambda x: math.exp(-x * x), 0.0, 1.0, 6)
exact = math.sqrt(math.pi) / 2 * math.erf(1)
print(R[-1][-1], abs(R[-1][-1] - exact))`,
      tests: [
        { name: 'the table is triangular: row i has i + 1 entries', code: 'len(R) == 6 and all(len(R[i]) == i + 1 for i in range(6))' },
        { name: t`$R_{1,1}$ is Simpson’s rule with 2 panels`, code: 'abs(R[1][1] - (1 + 4 * math.exp(-0.25) + math.exp(-1)) / 6) < 1e-14' },
        { name: t`the last entry is within $10^{-12}$ of the exact value`, code: 'abs(R[-1][-1] - exact) < 1e-12' },
      ],
      hints: ['For each level i, start a row with trap(f, a, b, 2**i).', 'Then for j = 1 … i append row[j−1] + (row[j−1] − R[i−1][j−1])/(4**j − 1), using the previous row R[i−1].'],
      teach: 'Romberg integration is a triangle of Richardson steps over a column of trapezoid sums.',
      explain: t`With 33 function values the corner of the table is within $${tex(Math.abs(TAB[0][5][5] - ERFI), 1)}$ of the exact value; the trapezoid rule alone, at the same cost, errs by $${tex(Math.abs(TAB[0][5][0] - ERFI), 1)}$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      gen(r) {
        const Cinf = r.pick([1.6342, 1.7128, 1.5517]), c = r.pick([0.021, -0.016]), p = r.pick([1.6, 2]);
        const f3 = +(Cinf + c).toFixed(5), f2 = +(Cinf + c / 2 ** p).toFixed(5), f1 = +(Cinf + c / 4 ** p).toFixed(5);
        const pobs = Math.log2((f3 - f2) / (f2 - f1)), ans = f1 + (f1 - f2) / (2 ** pobs - 1);
        return {
          prompt: t`A rocket-nozzle CFD study gives the thrust coefficient on three grids, each refined by 2: coarse $${f3}$, medium $${f2}$, fine $${f1}$. Measure the order from the three, then extrapolate.`,
          visual: {
            type: 'graph',
            params: { x: [-0.05, 1.1], y: [Math.min(f1, f3) - 0.3 * Math.abs(c), Math.max(f1, f3) + 0.3 * Math.abs(c)], aspect: 'wide', axesAt: 'edge', xlabel: 'cell size (coarse = 1)', ylabel: 'thrust coefficient', yticks: 4,
              points: [[1, f3], [0.5, f2], [0.25, f1]].map(([x, y]) => ({ x, y, r: 5, color: 'accent' })) },
            caption: 'The three grids’ results against cell size.',
          },
          answer: ans, tol: { rel: 5e-5 },
          errors: [{ value: (4 * f1 - f2) / 3, feedback: 'That assumes p = 2. Use the order the three grids actually show.' }, { value: f1, feedback: 'That is the fine-grid value; extrapolate it.' }].filter((e) => Math.abs(e.value - ans) > 1e-4 * ans),
          hints: [t`$p = \log_2\dfrac{${f3} - ${f2}}{${f2} - ${f1}}$.`, t`$C \approx f_1 + (f_1 - f_2)/(2^p - 1)$.`],
          teach: 'Three grids give both the observed order and, with it, an extrapolated value and an error band.',
          explain: t`$p = ${pobs.toFixed(3)}$, and $C \approx ${f1} + (${(f1 - f2).toFixed(5)})/${(2 ** pobs - 1).toFixed(3)} = ${ans.toFixed(5)}$. The correction is the fine grid’s estimated discretisation error.`,
        };
      },
    }),
    mcq({
      id: 'cp-sqrt', difficulty: 2,
      prompt: t`An engineer integrates a flow rate that behaves like $\sqrt{t}$ near $t = 0$ (a valve opening) and applies Romberg extrapolation, but the extrapolated columns are barely better than the trapezoid rule. What is going on?`,
      visual: {
        type: 'graph',
        params: { x: [-0.1, 2.25], y: [-6, 0], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'function evaluations', ylabel: '|error|',
          points: TAB[1].flatMap((row, i) => row.slice(0, 4).map((v, j) => ({ x: n12(lg(2 ** i + 1)), y: n12(lg(Math.abs(v - 2 / 3))), r: 4.5 - 0.5 * j, color: COLS[j][0] }))),
          legend: COLS.map(([c, l]) => ({ label: l, color: c, point: true })), legendAt: 'bl' },
        caption: 'Romberg columns for ∫₀¹ √x dx.',
      },
      choices: [
        t`$\sqrt t$ has an unbounded derivative at 0, so the trapezoid error goes like $h^{3/2}$, not $h^2$; extrapolating as if it were $h^2$ cancels the wrong term`,
        'Romberg needs more than seven levels to start working',
        'The flow rate is too small near zero',
        'Round-off error dominates the extrapolation',
      ],
      answer: 0,
      why: {
        1: 'More levels do not help; every column keeps the same slow slope.',
        2: 'Small values are harmless; the problem is the infinite slope at t = 0.',
        3: 'The errors are around 10⁻³ to 10⁻⁴, far above round-off.',
      },
      hints: ['What is the derivative of √t at 0?', 'What error form does Romberg assume, and is it true here?'],
      teach: 'Extrapolation assumes an error expansion; a singular derivative breaks it, and the cure is a change of variable (t = s²) or a method built for the singularity.',
      explain: t`With $t = s^2$, $\int\sqrt t\,dt = \int 2s^2\,ds$: smooth, and Romberg is exact after a step. In general: measure the order first ([F13.1](#/lesson/st-f.F13.1)), and extrapolate with the order you measured.`,
    }),
    num({
      id: 'cp-period', difficulty: 2, transfer: true,
      gen(r) {
        const P = r.pick([92.68, 97.12, 1436.07]), c = r.pick([0.83, -0.42, 1.6]), h = 1;
        const A1 = +(P + c * h ** 4 * 1e-2).toFixed(5), A2 = +(P + (c * h ** 4 * 1e-2) / 16).toFixed(5), ans = (16 * A2 - A1) / 15;
        return {
          prompt: t`An orbit propagator using RK4 reports a satellite’s period as $${A1}$ min with one step size and $${A2}$ min with half that step. Extrapolate, assuming fourth-order error.`,
          visual: {
            type: 'graph',
            params: { x: [-0.05, 1.1], y: [Math.min(A1, A2, ans) - 0.3 * Math.abs(A1 - A2), Math.max(A1, A2, ans) + 0.3 * Math.abs(A1 - A2)], aspect: 'wide', axesAt: 'edge', xlabel: 'h⁴ (relative)', ylabel: 'period (min)', yticks: 3,
              points: [{ x: 1, y: A1, r: 5, color: 'accent' }, { x: 1 / 16, y: A2, r: 5, color: 'accent' }], vlines: [{ x: 0, color: 'ink4' }] },
            caption: 'The two runs against h⁴.',
          },
          answer: ans, units: 'min', tol: { rel: 1e-7, abs: 2e-6 },
          errors: [{ value: (4 * A2 - A1) / 3, feedback: 'RK4 is fourth order: weight the finer run by 2⁴ = 16 and divide by 15.' }].filter((e) => Math.abs(e.value - ans) > 5e-6),
          hints: [t`$A \approx (16A(h/2) - A(h))/15$.`],
          teach: 'For a fourth-order method the Richardson correction is one fifteenth of the difference between the runs.',
          explain: t`$(16\times${A2} - ${A1})/15 = ${ans.toFixed(6)}$ min; the correction $${tex(ans - A2, 2)}$ min also estimates the finer run’s error.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Richardson (1911), The approximate arithmetical solution by finite differences of physical problems, Phil. Trans. R. Soc. A 210, 307', url: 'https://doi.org/10.1098/rsta.1911.0009' },
    { label: 'Celik et al. (2008), Procedure for estimation and reporting of uncertainty due to discretization in CFD applications, J. Fluids Eng. 130, 078001', url: 'https://doi.org/10.1115/1.2960953' },
    { label: 'Trefethen & Weideman (2014), The exponentially convergent trapezoidal rule, SIAM Review 56, 385', url: 'https://doi.org/10.1137/130932132' },
  ],
});
