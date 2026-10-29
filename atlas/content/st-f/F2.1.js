// Truncation versus round-off error — the analyst's view: a method's
// truncation error (what remains with exact arithmetic) falls with the step
// as hᵖ, its round-off error grows as u/hᵏ; adding the two bounds and
// minimising gives the optimal step h* ∝ u^(1/(p+k)) and the best error
// ∝ u^(p/(p+k)). Difference quotients, a Taylor series that converges to the
// wrong answer, and the Schwarzschild effective potential.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { U, U32, n12, lg } from './_num.js';

const t = String.raw;

// ── Explore: differentiate ln x at x = 3 by three formulas, in float64 and in emulated float32 ──
const X0 = 3, F0 = Math.log(3), D_TRUE = 1 / 3;
const F2 = 1 / 9, F3 = 2 / 27, F5 = 24 / 243;          // |f''|, |f'''|, |f⁽⁵⁾| at 3
const r32 = Math.fround;
const FORMULAS = {
  1: (f, h, R) => R(R(f(R(X0 + h)) - f(X0)) / h),
  2: (f, h, R) => R(R(f(R(X0 + h)) - f(R(X0 - h))) / R(2 * h)),
  4: (f, h, R) => R(R(R(R(-f(R(X0 + 2 * h)) + R(8 * f(R(X0 + h)))) - R(8 * f(R(X0 - h)))) + f(R(X0 - 2 * h))) / R(12 * h)),
};
const id = (v) => v;
const measured = [];
for (const m of [1, 2, 4]) {
  for (const [prec, R] of [[64, id], [32, r32]]) {
    const f = prec === 64 ? Math.log : (x) => r32(Math.log(x));
    for (let k = 1; k <= 15; k++) {
      const h = R(10 ** -k);
      const err = Math.abs(FORMULAS[m](f, h, R) - D_TRUE);
      measured.push({ m, prec, k, err: Math.max(err, 1e-17) });
    }
  }
}
const TRUNC = { 1: [Math.log10(F2 / 2), 1], 2: [Math.log10(F3 / 6), 2], 4: [Math.log10(F5 / 30), 4] };   // log₁₀C, p
const RND = { 1: 2, 2: 1, 4: 1.5 };                                                                   // round-off ≈ c·u|f|/h
const exploreCurves = [1, 2, 4].flatMap((m) => {
  const w = `step(0.5 - abs(m - ${m}))`;
  const [lc, p] = TRUNC[m];
  const tr = `${n12(lc)} + ${p}*x`, ro = `log10(${RND[m]}*prec*${n12(F0)}) - x`;
  return [
    { fn: tr, color: 'gold', dash: true, width: 1.6, when: w },
    { fn: ro, color: 'violet', dash: true, width: 1.6, when: w },
    { fn: `log10(10^(${tr}) + 10^(${ro}))`, color: 'ink3', width: 1.6, when: w },
  ];
});
const explorePoints = measured.map(({ m, prec, k, err }) => ({ x: -k, y: n12(lg(err)), r: 4, color: 'accent', when: `step(0.5 - abs(m - ${m}))*step(${prec === 64 ? '1e-10 - prec' : 'prec - 1e-10'})` }));

// ── the worked example: arctan′(1) = ½ by central differences ──
const WX = 1, WF = Math.PI / 4, WM3 = 0.5;               // f(1), |f'''(1)| = |(6x² − 2)/(1 + x²)³| = ½
const HSTAR = Math.cbrt((3 * U * WF) / WM3);
const ESTAR = (WM3 * HSTAR ** 2) / 2;
const cd = (h) => (Math.atan(WX + h) - Math.atan(WX - h)) / (2 * h);
const WERR = Array.from({ length: 12 }, (_, i) => [10 ** -(i + 1), Math.abs(cd(10 ** -(i + 1)) - 0.5)]);
const E5 = Math.abs(cd(1e-5) - 0.5), E8 = Math.abs(cd(1e-8) - 0.5), E3 = Math.abs(cd(1e-3) - 0.5), EH = Math.abs(cd(8e-6) - 0.5);

// ── e⁻²⁰ by its Taylor series ──
function taylorExp(x) { let s = 0, term = 1, k = 0; for (;;) { const nw = s + term; if (nw === s) break; s = nw; k++; term *= x / k; } return [s, k]; }
const [BAD] = taylorExp(-20), [GOOD20] = taylorExp(20);
const TRUE20 = Math.exp(-20);
let MAXTERM = 0; { let term = 1; for (let k = 1; k < 60; k++) { term *= 20 / k; MAXTERM = Math.max(MAXTERM, term); } }

// ── the Schwarzschild effective potential (G = c = 1, r in units of M), Carroll's form with ε = 1 ──
const Veff = (r, L2) => 0.5 - 1 / r + L2 / (2 * r * r) - L2 / r ** 3;
const Veff3 = (r, L2) => 6 / r ** 4 - (12 * L2) / r ** 5 + (60 * L2) / r ** 6;

export default lesson({
  id: 'st-f.F2.1',
  title: 'Truncation versus round-off error',
  minutes: 13, difficulty: 3,
  intro: t`A numerical method makes two kinds of error. **Truncation error** is what remains even in exact arithmetic, because the method stops short — a series cut off, a derivative replaced by a difference quotient. It shrinks as the step $h$ shrinks. **Round-off error** comes from computing in floating point, and a small step *amplifies* it. For the central difference $D_h f(x) = \frac{f(x + h) - f(x - h)}{2h}$ the two add up to

$$\lvert D_h f(x) - f'(x)\rvert \;\le\; \underbrace{\frac{M_3}{6}\,h^2}_{\text{truncation}} \;+\; \underbrace{\frac{u\,\lvert f(x)\rvert}{h}}_{\text{round-off}}$$

The first falls with $h$, the second rises, so there is a **best step** $h^*$ and a best possible error — and no amount of shrinking $h$ beats it. Your [Scientific Programming lesson](#/lesson/prog.P7.2) found the best step by experiment; here you derive it, and the rule behind it.`,
  symbols: [
    { tex: t`D_h f(x)`, text: 'the central-difference estimate of the derivative $f\'(x)$ with step $h$' },
    { tex: 'h', text: 'the step, in the units of $x$' },
    { tex: t`M_3`, text: 'a bound on $\\lvert f\'\'\'\\rvert$ near $x$: the truncation error comes from the Taylor remainder ([Taylor polynomials and the Lagrange remainder](#/lesson/math1220.C2-5.5))' },
    { tex: t`\frac{M_3}{6}h^2`, text: 'the **truncation** error: $f(x \\pm h) = f \\pm hf\' + \\tfrac{h^2}{2}f\'\' \\pm \\tfrac{h^3}{6}f\'\'\'(\\xi_\\pm)$, and the difference quotient keeps the $h^3$ terms divided by $2h$' },
    { tex: t`u\,\lvert f(x)\rvert`, text: 'the rounding error in each computed value of $f$ near $x$ (at least; a library function may err by an ulp or two)' },
    { tex: t`\frac{u\lvert f\rvert}{h}`, text: 'the **round-off** error: two values each off by up to $u\\lvert f\\rvert$, subtracted, divided by $2h$' },
  ],
  why: 'Every discretisation in this course — quadrature, ODE steps, PDE grids — has a truncation error that a smaller step reduces and a round-off error that a smaller step can raise; balancing them tells you when refining stops helping.',
  visual: {
    type: 'graph',
    title: 'The V of a difference quotient',
    lead: t`Differentiating $\ln x$ at $x = 3$ (exact answer $\tfrac13$). Blue dots are measured errors for $h = 10^{-1} \ldots 10^{-15}$; the gold dashed line is the truncation bound, the violet one the round-off bound, the grey curve their sum. Both axes are logarithmic.`,
    tasks: [
      'Step through the three formulas: the right branch steepens (slope 1, 2, 4) and the bottom of the V moves down and to the right.',
      'Switch to float32: the round-off line rises by nine decades, and the best step and the best error both get much larger.',
      'Find the order p from the slope of the right branch, and the derivative order k = 1 from the slope −1 of the left branch.',
    ],
    params: {
      x: [-15.5, -0.5], y: [-17.5, 0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: 'error', xticks: 8, yticks: 6,
      choices: [
        { key: 'm', label: 'Formula', options: [[1, 'forward, p = 1'], [2, 'central, p = 2'], [4, 'five-point, p = 4']], value: 2, explain: t`Forward uses $f(x+h)$ and $f(x)$; central $f(x \pm h)$; five-point $f(x \pm h)$ and $f(x \pm 2h)$, with weights that cancel the error terms up to $h^3$.` },
        { key: 'prec', label: 'Arithmetic', options: [[U, 'float64'], [U32, 'float32']], value: U, explain: t`Unit roundoff $u = 2^{-53}$ or $2^{-24}$.` },
      ],
      curves: exploreCurves,
      points: explorePoints,
      legend: [{ label: 'truncation bound', color: 'gold', dash: true }, { label: 'round-off bound', color: 'violet', dash: true }, { label: 'measured', color: 'accent', point: true }],
      legendAt: 'bl',
    },
    caption: 'Measured in JavaScript’s doubles, which round exactly as Python’s floats do; float32 is emulated by rounding every intermediate result. Errors below 10⁻¹⁶ are drawn at 10⁻¹⁷. The bounds take |f| and the derivative at x = 3 itself.',
  },
  example: {
    prompt: t`You need $f'(1)$ for $f = \arctan$ (the answer is $\tfrac12$) by the central difference in float64. Find the best step and the best error the bound allows, and check them against measurement.`,
    visual: {
      type: 'graph',
      params: { x: [-12.5, -0.5], y: [-13, -2], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: 'error',
        curves: [{ fn: `log10(10^(${n12(Math.log10(WM3 / 6))} + 2x) + 10^(${n12(Math.log10(U * WF))} - x))`, color: 'ink3', width: 1.8, label: 'bound', labelAt: -9.5, labelDx: 6, labelDy: -12 }],
        points: WERR.map(([h, e]) => ({ x: n12(lg(h)), y: n12(lg(Math.max(e, 1e-17))), r: 4, color: 'accent' })),
        vlines: [{ x: n12(lg(HSTAR)), label: 'h*', color: 'gold' }] },
      caption: 'Measured errors of the central difference for arctan at 1 (blue), under the bound M₃h²/6 + u|f|/h (grey). Logarithmic axes.',
    },
    steps: [
      { label: 'The pieces', text: t`$f(1) = \pi/4$ and $f'''(x) = \dfrac{6x^2 - 2}{(1 + x^2)^3}$, so $M_3 \approx \lvert f'''(1)\rvert = \tfrac12$ (it changes little over a tiny step).` },
      { label: 'Minimise', text: t`$E(h) = \dfrac{M_3h^2}{6} + \dfrac{u\lvert f\rvert}{h}$, and $E'(h) = \dfrac{M_3h}{3} - \dfrac{u\lvert f\rvert}{h^2} = 0$ gives $h^{*3} = \dfrac{3u\lvert f\rvert}{M_3}$.` },
      { label: 'Numbers', text: t`$h^* = \left(\dfrac{3 \times 1.11\times10^{-16} \times 0.785}{0.5}\right)^{1/3} = ${tex(HSTAR, 2)}$. At $h^*$ the round-off term is twice the truncation term, so $E^* = \tfrac12 M_3 h^{*2} = ${tex(ESTAR, 2)}$.` },
      { label: 'Measure', text: t`Python gives errors $${tex(E3, 2)}$ at $h = 10^{-3}$ (truncation: $M_3h^2/6 = 8.3\times10^{-8}$, a match), $${tex(EH, 2)}$ at $h = 8\times10^{-6}$, and $${tex(E8, 2)}$ at $h = 10^{-8}$ — hundreds of times *worse* than at $10^{-5}$ ($${tex(E5, 2)}$). The bound is an upper bound: near $h^*$ the round-off errors partly cancel and luck can do better.` },
      { label: 'The rule', text: t`For a method of order $p$ approximating a $k$-th derivative, truncation $\sim h^p$ and round-off $\sim u/h^k$; balancing them gives $h^* \propto u^{1/(p+k)}$ and $E^* \propto u^{p/(p+k)}$. Here $p = 2$, $k = 1$: $h^* \sim u^{1/3} \approx 5\times10^{-6}$ and $E^* \sim u^{2/3} \approx 2\times10^{-11}$ — about **two thirds of the digits** survive.` },
    ],
    answer: t`$h^* \approx ${tex(HSTAR, 2)}$ and $E^* \approx ${tex(ESTAR, 2)}$: no step does much better than about 11 correct digits.`,
  },
  practice: [
    mcq({
      id: 'read-branches', difficulty: 1,
      prompt: t`A difference formula for $f'$ gives the error plot below. What does its right branch, of slope 4, tell you, and what makes the left branch rise with slope $-1$?`,
      visual: {
        type: 'graph',
        params: { x: [-12, 0], y: [-15, 0], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: 'error',
          curves: [{ fn: `log10(10^(-1.5 + 4x) + 10^(-15.7 - x))`, color: 'accent', width: 2 }] },
        caption: 'A measured error against the step, both axes logarithmic (a smooth sketch of a real scan).',
      },
      choices: [
        t`Truncation error $\propto h^4$, a fourth-order formula; round-off $\propto u\lvert f\rvert/h$ on the left`,
        t`Round-off $\propto h^4$ on the right; truncation $\propto 1/h$ on the left`,
        t`A fourth derivative is being approximated, so the error grows like $1/h^4$`,
        t`The formula is first order, because the left branch has slope $-1$`,
      ],
      answer: 0,
      why: {
        1: 'Round-off is what grows as h shrinks; truncation is what shrinks with h.',
        2: 'The slope −1 on the left says a first derivative is being approximated (one division by h); slope 4 on the right is the order.',
        3: 'The left branch’s slope comes from dividing by h, whatever the order; the order is read from the right branch.',
      },
      hints: ['On log–log axes a power law hᵖ is a straight line of slope p.', 'Which error disappears as h → 0 in exact arithmetic?'],
      teach: 'On a log–log plot of error against h the right branch’s slope is the order p of the truncation error, and the left branch’s slope −k comes from dividing a rounding error by hᵏ.',
      explain: t`The right branch is $Ch^4$: truncation of a fourth-order formula (the five-point stencil is one). The left is $\sim u\lvert f\rvert/h$: a fixed rounding error divided by $h$ once, because a first derivative divides by $h$ once.`,
    }),
    num({
      id: 'scale-height', difficulty: 2,
      gen(r) {
        const [H, where] = r.pick([[8.5, 'Earth'], [11.1, 'Mars'], [15.9, 'Venus'], [27, 'Jupiter']]);
        const ans = H * 1000 * Math.cbrt(3 * U);
        return {
          prompt: t`An entry-guidance code differentiates the density $\rho(z) = \rho_0\,e^{-z/H}$ of the atmosphere of ${where} ($H = ${H}$ km) by a central difference in float64. Using $h^* = \left(3u\lvert f\rvert/M_3\right)^{1/3}$ with $M_3 = \lvert\rho'''(z)\rvert$, what is the best step, in metres?`,
          visual: {
            type: 'graph',
            params: { x: [0, 60], y: [0, 1.08], aspect: 'wide', axesAt: 'edge', xlabel: 'altitude z (km)', ylabel: 'ρ / ρ₀',
              curves: [{ fn: `e^(-x/${H})`, color: 'accent', width: 2.2 }],
              vlines: [{ x: H, label: 'z = H', color: 'ink3' }] },
            caption: t`An exponential atmosphere with scale height $H = ${H}$ km: density falls by a factor $e$ every $H$. Real atmospheres are only roughly exponential.`,
          },
          answer: ans, units: 'm', tol: { rel: 0.02 },
          errors: [{ value: H * 1000 * Math.sqrt(U), feedback: t`$\sqrt u$ is the rule for a *forward* difference. The central one balances $h^2$ against $1/h$: a cube root.` }, { value: Math.cbrt(3 * U), feedback: 'That is the step in units of H. Multiply by the scale height in metres.' }],
          hints: [t`For $\rho = \rho_0e^{-z/H}$, every derivative is the function divided by $-H$: $\lvert\rho'''\rvert = \rho/H^3$.`, t`So $h^* = \left(3u\rho\cdot H^3/\rho\right)^{1/3} = H\,(3u)^{1/3}$, and $(3u)^{1/3} = ${tex(Math.cbrt(3 * U), 3)}$.`],
          teach: 'The optimal step is set by the scale on which the function changes — its value over its third derivative — not by the size of the variable.',
          explain: t`$h^* = H(3u)^{1/3} = ${H * 1000}\ \text{m} \times ${tex(Math.cbrt(3 * U), 3)} = ${tex(ans, 3)}$ m. A rule such as “$h = 10^{-6}$” would be meaningless here: in kilometres or in metres it gives steps a thousand times apart.`,
        };
      },
    }),
    num({
      id: 'precision-gain', difficulty: 2,
      gen(r) {
        const [p, name] = r.pick([[1, 'forward difference (order 1)'], [2, 'central difference (order 2)'], [4, 'five-point formula (order 4)']]);
        const ans = 2 ** ((29 * p) / (p + 1));
        return {
          prompt: t`A code differentiates with the ${name}. Moving it from float32 ($u = 2^{-24}$) to float64 ($u = 2^{-53}$), and re-optimising the step, by what factor does the **best achievable error** $E^* \propto u^{p/(p+1)}$ shrink?`,
          visual: {
            type: 'graph',
            params: { x: [-15, 0], y: [-16, 0], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: 'error bound',
              curves: [{ fn: `log10(10^(${p}x - 1) + 10^(${n12(lg(U32))} - x))`, color: 'warn', width: 2, label: 'float32', labelAt: -2, labelDx: 6, labelDy: 14 }, { fn: `log10(10^(${p}x - 1) + 10^(${n12(lg(U))} - x))`, color: 'accent', width: 2, label: 'float64', labelAt: -11, labelDx: 6, labelDy: -12 }] },
            caption: 'The error bound of the same formula in the two precisions (truncation constant 0.1, |f| = 1), logarithmic axes. Only the round-off branch moves.',
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: 2 ** 29, feedback: t`That is the ratio of the unit roundoffs. Only the fraction $p/(p+1)$ of it carries over to the best error.` }, { value: 2 ** (29 / (p + 1)), feedback: t`That is how much the best *step* changes ($u^{1/(p+1)}$). The best error goes as $u^{p/(p+1)}$.` }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: [t`The ratio of unit roundoffs is $2^{-24}/2^{-53} = 2^{29}$.`, t`$E^*$ scales as $u^{p/(p+1)}$, so the factor is $(2^{29})^{${p}/${p + 1}}$.`],
          teach: 'Balancing hᵖ against u/h gives a best error proportional to $u^{p/(p+1)}$: the higher the order, the more of the arithmetic’s precision the method can use.',
          explain: t`$(2^{29})^{${p}/${p + 1}} = 2^{${(29 * p / (p + 1)).toFixed(2)}} \approx ${tex(ans, 3)}$. A first-order formula turns the 29 extra bits into only $14.5$ bits of accuracy; a fourth-order one into $23.2$.`,
        };
      },
    }),
    mcq({
      id: 'taylor-floor', difficulty: 2,
      prompt: t`Summing the Maclaurin series $e^{x} = \sum x^k/k!$ at $x = -20$ in float64, term by term until adding a term no longer changes the sum, gives $${tex(BAD, 4)}$; the true value is $e^{-20} = ${tex(TRUE20, 4)}$. The terms do go to zero. What went wrong?`,
      visual: {
        type: 'graph',
        params: { x: [0, 96], y: [-12, 9], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'k', ylabel: '|term| = 20ᵏ/k!',
          curves: [{ fn: 'log10(20^x/gamma(x + 1))', color: 'accent', width: 2, domain: [0, 95] },
            { fn: n12(lg(TRUE20)), color: 'good', dash: true, width: 1.6, label: 'the answer, e⁻²⁰', labelAt: 4, labelDx: 0, labelDy: 14 },
            { fn: n12(lg(U * MAXTERM)), color: 'bad', dash: true, width: 1.6, label: 'u × largest term', labelAt: 62, labelDx: 0, labelDy: -12 }] },
        caption: 'The size of each term of the series at x = −20 (logarithmic axis). The terms alternate in sign; the largest, near k = 20, is about 4 × 10⁷.',
      },
      choices: [
        t`Round-off: terms of size $4\times10^{7}$ carry errors near $u \times 4\times10^{7} \approx 5\times10^{-9}$, larger than the answer, and they cancel to leave only that error`,
        'Truncation: the loop stopped too early, so more terms would fix it',
        'The series does not converge at x = −20',
        'Overflow in 20ᵏ',
      ],
      answer: 0,
      why: {
        1: 'More terms change nothing: the loop stopped because they had become too small to register, and the truncation error is already far below 10⁻²⁰.',
        2: 'The exponential series converges for every x; the trouble is the arithmetic, not the mathematics.',
        3: '20⁹⁵ ≈ 4 × 10¹²³ is far below the float64 maximum of 1.8 × 10³⁰⁸.',
      },
      hints: ['Where is the red dashed line compared with the green one?', 'The sum of large alternating terms is a cancellation: the result inherits the absolute error of the largest terms.'],
      teach: 'A truncation error you can shrink to zero does not help when the round-off floor — u times the largest intermediate quantity — lies above the answer.',
      explain: t`The truncation error is negligible; the computed sum is wrong by about $${tex(Math.abs(BAD - TRUE20), 2)}$, close to $u$ times the largest term, $${tex(U * MAXTERM, 2)}$. The cure is to avoid the cancellation: $e^{-20} = 1/e^{20}$, whose series has only positive terms, gives $${tex(1 / GOOD20, 6)}$, correct to 15 digits.`,
    }),
    num({
      id: 'second-diff', difficulty: 3,
      gen(r) {
        const [Pmin, what] = r.pick([[92.7, 'the International Space Station (period 92.7 min)'], [717.97, 'a GPS satellite (period 717.97 min)'], [1436.07, 'a geostationary satellite (period 1436.07 min)']]);
        const w = (2 * Math.PI) / (Pmin * 60);
        const ans = Math.pow(48 * U, 0.25) / w;
        return {
          prompt: t`A propagator returns the position of ${what} to full double precision, and you estimate its acceleration with the second difference $\dfrac{x(t+h) - 2x(t) + x(t-h)}{h^2}$, whose error is at most $\dfrac{M_4h^2}{12} + \dfrac{4u\lvert x\rvert}{h^2}$. For one coordinate $x = A\cos\omega t$ take $M_4 = \omega^4 A$ and $\lvert x\rvert = A$. What is the best step, in seconds?`,
          visual: {
            type: 'graph',
            params: { x: [0, 7.2], y: [-1.25, 1.35], aspect: 'wide', axesAt: 'edge', xlabel: 'ωt', ylabel: 'x / A',
              curves: [{ fn: 'cos(x)', color: 'accent', width: 2 }],
              points: [[1.2, 'x(t − h)', -62, -4], [2, 'x(t)', 10, -12], [2.8, 'x(t + h)', 10, 6]].map(([p, l, dx, dy]) => ({ x: p, y: n12(Math.cos(p)), r: 4.5, color: 'gold', label: l, labelDx: dx, labelDy: dy })) },
            caption: 'One coordinate of a circular orbit and the three samples a second difference uses (the step is drawn hugely exaggerated).',
          },
          answer: ans, units: 's', tol: { rel: 0.02 },
          errors: [{ value: Math.cbrt(3 * U) / w, feedback: t`That balances $h^2$ against $1/h$ — the first-derivative rule. A second difference divides by $h^2$, so round-off grows as $1/h^2$.` }, { value: Math.pow(48 * U, 0.25), feedback: 'That is ωh*, a phase. Divide by ω to get seconds.' }],
          hints: [t`Minimise $E(h) = \dfrac{\omega^4Ah^2}{12} + \dfrac{4uA}{h^2}$: set $dE/dh = 0$.`, t`$\dfrac{\omega^4Ah}{6} = \dfrac{8uA}{h^3}$ gives $h^{*4} = \dfrac{48u}{\omega^4}$, so $h^* = (48u)^{1/4}/\omega$, with $\omega = 2\pi/T$.`],
          teach: 'For a k-th derivative round-off grows as u/hᵏ, so the best step grows to $u^{1/(p+k)}$: for the second difference (p = 2, k = 2), the fourth root of u.',
          explain: t`$\omega = 2\pi/(${Pmin}\times60\ \text{s}) = ${tex(w, 3)}\ \text{s}^{-1}$ and $(48u)^{1/4} = ${tex(Math.pow(48 * U, 0.25), 3)}$, so $h^* = ${tex(ans, 3)}$ s. The best error, about $u^{1/2}$ relative, keeps only half the digits: second derivatives from samples are expensive in precision.`,
        };
      },
    }),
    code({
      id: 'taylor-exp', difficulty: 2,
      prompt: t`Write \`taylor_exp(x)\` that sums $\sum_k x^k/k!$ **term by term until adding the next term no longer changes the sum**, and returns the sum. Build each term from the last (\`term *= x / k\`) rather than computing powers and factorials. Then set \`bad = taylor_exp(-20)\` and \`good = 1 / taylor_exp(20)\`.`,
      starter: t`import math

def taylor_exp(x):
    s = 0.0
    term = 1.0
    k = 0
    # add terms until s + term == s
    return s

bad = taylor_exp(-20)
good = 1 / taylor_exp(20)
print(bad, good, math.exp(-20))
`,
      answer: t`import math

def taylor_exp(x):
    s = 0.0
    term = 1.0
    k = 0
    while s + term != s:
        s += term
        k += 1
        term *= x / k
    return s

bad = taylor_exp(-20)
good = 1 / taylor_exp(20)
print(bad, good, math.exp(-20))`,
      tests: [
        { name: t`\`taylor_exp(1)\` is $e$ to 15 digits`, code: 'abs(taylor_exp(1.0) - math.e) < 1e-15' },
        { name: t`\`good\` matches $e^{-20}$ to 14 digits`, code: 'abs(good - math.exp(-20)) / math.exp(-20) < 1e-14' },
        { name: t`\`bad\` is wrong by more than 100% (round-off, not truncation)`, code: 'abs(bad - math.exp(-20)) / math.exp(-20) > 1' },
      ],
      hints: ['Loop with `while s + term != s:` — add the term, increase k, update the term.', 'Inside the loop: `s += term`, then `k += 1`, then `term *= x / k`.'],
      teach: 'Stopping when a term no longer changes the sum makes the truncation error smaller than a rounding error; whether the result is accurate then depends only on round-off.',
      explain: t`The loop stops after about 95 terms either way. \`bad\` comes out near $6.1\times10^{-9}$, three times the true $2.06\times10^{-9}$, because terms up to $4.3\times10^{7}$ cancelled; \`good\` adds only positive terms and is correct to 15 digits.`,
    }),
    multi({
      id: 'classify', difficulty: 2,
      prompt: 'Which of these are **truncation** errors — errors that would remain even with exact arithmetic? Select every one.',
      choices: ['Approximating sin x by x − x³/6', 'Replacing f′(x) by a difference quotient with h = 10⁻³', 'Stopping Newton’s method after six iterations', 'Storing 0.1 as a binary float', 'Computing 1 − cos x for x = 10⁻⁷', 'Adding 10⁸ numbers one at a time'],
      answer: [0, 1, 2],
      why: {
        3: 'Storing a number rounds it: round-off.',
        4: 'In exact arithmetic 1 − cos x is exact; the trouble is the rounding of cos x, magnified by cancellation.',
        5: 'Each addition rounds; with exact arithmetic the sum would be exact.',
      },
      hints: ['Imagine a computer with infinitely many digits. Which errors would still be there?'],
      teach: 'Truncation error belongs to the method (it stops an infinite process); round-off belongs to the arithmetic.',
      explain: 'A cut-off series, a finite step and a finite number of iterations are approximations of the mathematics itself; storing, cancelling and summing are rounding effects that more digits would remove.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-veff', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([8, 10, 12]), L2 = r.pick([12, 16]);
        const V = Veff(R, L2), V3 = Math.abs(Veff3(R, L2));
        const ans = Math.cbrt((3 * U * Math.abs(V)) / V3);
        return {
          prompt: t`A geodesic code needs the force term $dV/dr$ of the Schwarzschild effective potential $V(r) = \tfrac12 - \tfrac{M}{r} + \tfrac{L^2}{2r^2} - \tfrac{ML^2}{r^3}$ (units with $G = c = 1$, $r$ in units of $M$) at $r = ${R}M$ for $L^2 = ${L2}M^2$, by a central difference in float64. With $V = ${tex(V, 4)}$ and $\lvert V'''\rvert = ${tex(V3, 3)}\,M^{-3}$ there, what is the best step $h^*$, in units of $M$?`,
          visual: {
            type: 'graph',
            params: { x: [2.5, 30], y: [0.42, 0.5], aspect: 'wide', axesAt: 'edge', xlabel: 'r / M', ylabel: 'V(r)',
              curves: [{ fn: `0.5 - 1/x + ${L2}/(2x^2) - ${L2}/x^3`, color: 'accent', width: 2 }],
              vlines: [{ x: R, label: `r = ${R}M`, color: 'gold' }] },
            caption: t`The effective potential for $L^2 = ${L2}M^2$ (a massive particle, in Carroll’s form $\tfrac12\dot r^2 + V(r) = \tfrac12E^2$).`,
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: Math.sqrt((U * Math.abs(V)) / V3), feedback: t`That rule has the wrong power: the central difference balances $h^2$ against $1/h$, giving a cube root.` }],
          hints: [t`$h^* = \left(3u\lvert V\rvert/\lvert V'''\rvert\right)^{1/3}$.`, t`$3 \times 1.11\times10^{-16} \times ${tex(Math.abs(V), 4)} / ${tex(V3, 3)}$, then a cube root.`],
          teach: 'The best step depends on the function’s size against its third derivative: a potential near a few tenths with a tiny third derivative tolerates a large step.',
          explain: t`$h^* = \left(3 \times 1.11\times10^{-16} \times ${tex(Math.abs(V), 4)}/${tex(V3, 3)}\right)^{1/3} = ${tex(ans, 3)}\,M$. The potential is nearly constant ($V \approx 0.45$) while its derivatives are small, so the round-off term $u\lvert V\rvert/h$ dominates early. Differentiating analytically avoids the problem entirely — which is why geodesic codes use the exact $V'(r)$.`,
        };
      },
    }),
    num({
      id: 'cp-best-error', difficulty: 2, transfer: true,
      gen(r) {
        const zkm = r.pick([40, 80, 120]), acc = r.pick([20, 30, 45]);
        const z = zkm * 1000;
        const ans = 2 * Math.sqrt(U * z * acc);
        return {
          prompt: t`A trajectory model returns a rocket's altitude $z(t)$ to full float64 precision. Near $z = ${zkm}$ km, where $\lvert z''\rvert \approx ${acc}\ \text{m/s}^2$, its vertical speed is estimated by the **forward** difference $\dfrac{z(t+h) - z(t)}{h}$, with error at most $\dfrac{\lvert z''\rvert h}{2} + \dfrac{2u\lvert z\rvert}{h}$. What is the smallest error any step can guarantee, in m/s?`,
          visual: {
            type: 'graph',
            params: { x: [0, 160], y: [0, 165], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'altitude (km)',
              curves: [{ fn: `${acc / 2000}*x^2`, color: 'accent', width: 2, domain: [0, 160] }],
              hlines: [{ y: zkm, label: `${zkm} km`, color: 'gold' }] },
            caption: t`A schematic ascent with constant acceleration $${acc}\ \text{m/s}^2$ (real ascents vary it).`,
          },
          answer: ans, units: 'm/s', tol: { rel: 0.02 },
          errors: [{ value: Math.sqrt(U * z * acc), feedback: t`Close: at the optimum the two terms are equal, so the total is twice either: $E^* = 2\sqrt{u\lvert z\rvert\lvert z''\rvert}$.` }],
          hints: [t`Minimise $E(h) = \tfrac12 Mh + 2u\lvert z\rvert/h$: $h^* = 2\sqrt{u\lvert z\rvert/M}$.`, t`Substitute: $E^* = 2\sqrt{u\lvert z\rvert M}$ with $u = 1.11\times10^{-16}$, $\lvert z\rvert = ${z}$ m, $M = ${acc}$.`],
          teach: 'A forward difference can never beat about 2√(u|f||f″|): roughly half the digits, whatever the step.',
          explain: t`$E^* = 2\sqrt{1.11\times10^{-16} \times ${z} \times ${acc}} = ${tex(ans, 3)}$ m/s at $h^* = ${tex(2 * Math.sqrt((U * z) / acc), 2)}$ s. Fine for a speed, but a central difference (error $\sim u^{2/3}$) or the model’s own velocity would do far better.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Sauer (2018), Numerical Analysis, 3rd ed., Pearson, §5.1 (rounding error in numerical differentiation)', url: 'https://openlibrary.org/isbn/9780134696454' },
    { label: 'Higham (2002), Accuracy and Stability of Numerical Algorithms, 2nd ed., SIAM, §1.14', url: 'https://doi.org/10.1137/1.9780898718027' },
    { label: 'Carroll (1997), Lecture notes on general relativity, ch. 7 (the Schwarzschild effective potential)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
