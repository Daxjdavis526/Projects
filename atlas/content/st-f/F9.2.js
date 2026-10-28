// Runge–Kutta methods as a family — the Butcher tableau, the order conditions
// (Σbᵢ = 1, Σbᵢcᵢ = ½, Σbᵢcᵢ² = ⅓, Σbᵢaᵢⱼcⱼ = ⅙ …) and their count (1, 2, 4, 8,
// 17), the stability function R(z) = 1 + Σ zᵏ bᵀAᵏ⁻¹𝟙 and the stability
// regions in the complex hλ-plane (the num3-stability sim): real-axis limits
// 2, 2, 2.513, 2.785; imaginary-axis limits 0, 0, √3, 2√2. Worked example: a
// solar array's 0.5 Hz flex mode, which Heun inflates ×1476 in ten minutes
// while RK4 damps it by 4%. (The code of RK4 is prog P11.1; its first meeting
// is math2280 DE-2.8.)
import { lesson, mcq, num, expr, match, code } from '../../src/core/content.js';
import { tex, frac } from '../../src/core/format.js';
import * as S from '../../src/viz/model/num3-stab.js';
import { TABLEAU, runRK, n12 } from './_ode.js';

const t = String.raw;

// ── the worked example: a 0.5 Hz flex mode, h = 0.1 s, ten minutes ──
const W = Math.PI, H = 0.1, NST = 6000, Y = W * H;
const flex = (tt, s) => [s[1], -(W * W) * s[0]];
const AMP = Object.fromEntries(['heun', 'rk3', 'rk4'].map((m) => { const s = runRK(TABLEAU[m], flex, 0, [1, 0], NST * H, NST); return [m, Math.hypot(s[0], s[1] / W)]; }));
const RH = S.absR('heun', [0, Y]), R4 = S.absR('rk4', [0, Y]);
const LIM = Object.fromEntries(['euler', 'heun', 'rk3', 'rk4'].map((m) => [m, [S.realLimit(m), S.imagLimit(m)]]));

// ── tableaux for the stability-function item ──
const TABS = [
  { name: 'the midpoint method', A: [[0, 0], [0.5, 0]], b: [0, 1], c: [0, 0.5] },
  { name: 'a two-stage method', A: [[0, 0], [1, 0]], b: [0.25, 0.75], c: [0, 1] },
  { name: 'Kutta’s third-order method', A: [[0, 0, 0], [0.5, 0, 0], [-1, 2, 0]], b: [1 / 6, 2 / 3, 1 / 6], c: [0, 0.5, 1] },
  { name: 'a three-stage method', A: [[0, 0, 0], [0.5, 0, 0], [0, 0.5, 0]], b: [0, 0, 1], c: [0, 0.5, 0.5] },
  { name: 'Heun’s third-order method', A: [[0, 0, 0], [1 / 3, 0, 0], [0, 2 / 3, 0]], b: [0.25, 0, 0.75], c: [0, 1 / 3, 2 / 3] },
];
/** R(z) coefficients 1, bᵀ𝟙, bᵀA𝟙, bᵀA²𝟙, … */
function rCoeffs({ A, b }) {
  const s = b.length, out = [1];
  let v = Array(s).fill(1);
  for (let k = 1; k <= s; k++) { out.push(b.reduce((q, bi, i) => q + bi * v[i], 0)); v = A.map((row) => row.reduce((q, a, j) => q + a * v[j], 0)); }
  return out;
}
const tableauTeX = ({ A, b, c }) => {
  const s = b.length, cols = 'c'.repeat(s);
  const rows = A.map((row, i) => `${frac(c[i])} & ${row.map((a, j) => (j < i ? frac(a) : '')).join(' & ')}`).join(t` \\[5pt] `);
  return t`\begin{array}{c|${cols}} ${rows} \\[5pt] \hline & ${b.map((x) => frac(x)).join(' & ')} \end{array}`;
};
const polyAtlas = (cs) => cs.map((x, k) => (k === 0 ? '1' : `${n12(x)}*z^${k}`)).join(' + ');
const polyTeXz = (cs) => cs.map((x, k) => (k === 0 ? '1' : `+ ${x === 1 ? '' : frac(x)}${k === 1 ? 'z' : `z^{${k}}`}`)).filter((_, k) => k === 0 || cs[k] !== 0).join(' ');

export default lesson({
  id: 'st-f.F9.2',
  title: 'Runge–Kutta methods',
  minutes: 15, difficulty: 3,
  intro: t`A Runge–Kutta method samples the slope several times inside each step and takes a weighted average. Every explicit one is a small table of numbers — the **Butcher tableau** — read as

$$k_i = f\Big(t_n + c_ih,\; y_n + h\sum_{j<i}a_{ij}k_j\Big), \qquad y_{n+1} = y_n + h\sum_{i=1}^{s}b_ik_i$$

Choosing the numbers to match the Taylor series of the true solution term by term gives **order conditions**: $\sum b_i = 1$ for order 1, $\sum b_ic_i = \tfrac12$ for order 2, two more for order 3, four more for order 4. Applied to $y' = \lambda y$, every such method multiplies $y$ by a polynomial $R(z)$ in $z = h\lambda$ each step, and where $\lvert R(z)\rvert > 1$ it blows up. That **stability region** in the complex plane, not the order, decides whether a step size is usable at all.`,
  symbols: [
    { tex: 'k_i', text: 'the $i$-th **stage**: a slope evaluated at a trial point inside the step' },
    { tex: 'c_i', text: 'where in the step stage $i$ is evaluated, as a fraction of $h$ ($c_1 = 0$)' },
    { tex: 'a_{ij}', text: 'how much of the earlier stage $k_j$ goes into the trial point for $k_i$ (explicit: only $j < i$)' },
    { tex: 'b_i', text: 'the weights of the final average; they sum to 1' },
    { tex: 's', text: 'the number of stages: evaluations of $f$ per step, the cost' },
    { tex: t`z = h\lambda`, text: 'the step times an eigenvalue $\\lambda$ of the problem (complex for oscillations): the one number that decides stability' },
    { tex: 'R(z)', text: 'the **stability function**: one step on $y\' = \\lambda y$ gives $y_{n+1} = R(z)y_n$. For $s = p \\le 4$ it is the Taylor polynomial of $e^z$ of degree $p$' },
  ],
  why: 'Every general-purpose integrator — scipy’s RK45, MATLAB’s ode45, the geodesic lab of F14 — is a Runge–Kutta tableau, and its stability region tells you before you run it whether an orbit, a vibration or a decay can be stepped at the h you want.',
  visual: {
    type: 'num3-stability',
    title: 'Stability regions in the complex hλ-plane',
    lead: t`Shaded: where the chosen method’s step multiplier has $\lvert R(z)\rvert \le 1$; coloured outlines: the other methods’ boundaries. Drag $z = h\lambda$. A decay $y' = -ky$ sits on the negative real axis; an undamped oscillation $x'' = -\omega^2x$ has $\lambda = \pm i\omega$, on the imaginary axis. The lower panel runs the method on $y' = \lambda y$.`,
    tasks: [
      'Drag z up the imaginary axis with Euler: |R| > 1 at once. Every oscillation grows. RK2 is the same, only more slowly (|R|² = 1 + y⁴/4).',
      `Switch to RK3 and RK4: they keep a stretch of the imaginary axis, up to ${LIM.rk3[1].toFixed(3)} (√3) and ${LIM.rk4[1].toFixed(3)} (2√2).`,
      `On the negative real axis the limits are ${LIM.euler[0].toFixed(0)}, ${LIM.heun[0].toFixed(0)}, ${LIM.rk3[0].toFixed(3)} and ${LIM.rk4[0].toFixed(3)}: four stages buy only 40% more step than one.`,
    ],
    params: { methods: ['euler', 'heun', 'rk3', 'rk4'], method: 'rk4', compare: true, z: [-0.2, 2], x: [-3.6, 1.2], y: [-3.2, 3.2], n: 40 },
    caption: 'Regions computed from each method’s stability polynomial on a fine pixel grid. Every 2-stage method of order 2 shares one polynomial (likewise 3-stage order 3 and 4-stage order 4), so “RK2” stands for Heun, midpoint and Ralston alike.',
  },
  example: {
    prompt: t`A satellite’s solar array has a flexible bending mode at $0.5$ Hz, modelled as $x'' = -\omega^2x$ with $\omega = \pi$ rad/s. An attitude simulation steps it with $h = 0.1$ s for ten minutes ($${NST}$ steps). Derive Heun’s $R(z)$ from its tableau, and predict what Heun and RK4 do to the mode’s amplitude.`,
    visual: {
      type: 'graph',
      params: { x: [0, 620], y: [-1.3, 3.6], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'amplitude',
        curves: [
          { fn: '0', color: 'ink3', width: 2, dash: true, domain: [0, 600], label: 'exact', labelAt: 560, labelDy: -12 },
          { fn: `x*${n12(Math.log10(RH) / H)}`, color: 'bad', width: 2.4, domain: [0, 600], label: 'Heun', labelAt: 470, labelDx: -40, labelDy: -14 },
          { fn: `x*${n12(Math.log10(S.absR('rk3', [0, Y])) / H)}`, color: 'violet', width: 2.4, domain: [0, 600], label: 'RK3', labelAt: 540, labelDy: -14 },
          { fn: `x*${n12(Math.log10(R4) / H)}`, color: 'accent', width: 2.4, domain: [0, 600], label: 'RK4', labelAt: 400, labelDy: 14 },
        ] },
      caption: 'The mode’s amplitude (log scale) as each method computes it, |R(iωh)|ⁿ after n = t/h steps. Checked against full runs of each method; the exact amplitude stays 1.',
    },
    steps: [
      { label: 'The tableau', text: t`Heun: $c = (0, 1)$, $a_{21} = 1$, $b = (\tfrac12, \tfrac12)$ — slope at the start, slope at the Euler-predicted end, averaged.` },
      { label: 'Apply it to y′ = λy', text: t`$k_1 = \lambda y_n$, $k_2 = \lambda(y_n + hk_1) = \lambda y_n(1 + z)$, so $y_{n+1} = y_n + \tfrac{h}{2}(k_1 + k_2) = \left(1 + z + \tfrac12z^2\right)y_n$. The Taylor series of $e^z$ to second order: that is what order 2 means.` },
      { label: 'Oscillation', text: t`$x'' = -\omega^2x$ as a first-order system has eigenvalues $\pm i\omega$, so $z = \pm i\omega h = \pm ${Y.toFixed(4)}i$. With $z = iy$: $\lvert R\rvert^2 = (1 - \tfrac12y^2)^2 + y^2 = 1 + \tfrac14y^4$ — larger than 1 for **every** $y \ne 0$.` },
      { label: 'Heun’s growth', text: t`$\lvert R\rvert = ${RH.toFixed(7)}$ per step, so after $${NST}$ steps the amplitude is multiplied by $${RH.toFixed(7)}^{${NST}} = ${AMP.heun.toFixed(0)}$. The simulation — 20 steps per period, which looks generous — shows the array flapping a thousandfold harder than it should.` },
      { label: 'RK4', text: t`For RK4, $\lvert R(iy)\rvert^2 = 1 - \tfrac{y^6}{72} + \tfrac{y^8}{576} < 1$ for $0 < y < 2\sqrt2$: $\lvert R\rvert = ${R4.toFixed(8)}$, and the amplitude after ten minutes is $${AMP.rk4.toFixed(3)}$ of its true value — a small **numerical damping**. (RK3 damps far more: to $${AMP.rk3.toFixed(3)}$.)` },
      { label: 'Sense check', text: t`Running both methods confirms the predictions to every printed digit — for a linear problem $\lvert R(z)\rvert^n$ is not an estimate but the answer. Neither method conserves the oscillation’s energy; methods built to do that are [F10](#/lesson/st-f.F10.1).` },
    ],
    answer: t`Heun: $R = 1 + z + \tfrac12z^2$, $\lvert R(i\omega h)\rvert^2 = 1 + \tfrac14(\omega h)^4$, amplitude $\times${AMP.heun.toFixed(0)}$ in ten minutes. RK4: $\times${AMP.rk4.toFixed(3)}$.`,
  },
  practice: [
    num({
      id: 'order2-weight', difficulty: 2,
      gen(r) {
        const [al, alT] = r.pick([[0.5, t`\tfrac12`], [2 / 3, t`\tfrac23`], [1, '1'], [0.75, t`\tfrac34`], [0.25, t`\tfrac14`]]);
        const b2 = 1 / (2 * al);
        return {
          prompt: t`A two-stage explicit method evaluates its second slope at $c_2 = a_{21} = ${alT}$. The order conditions $b_1 + b_2 = 1$ and $b_2c_2 = \tfrac12$ make it second order. What is $b_2$?`,
          visual: {
            type: 'graph',
            params: { x: [-0.05, 1.15], y: [0.85, 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 't (in units of h)', ylabel: 'y', yticks: 0,
              curves: [{ fn: 'exp(0.6x)', color: 'ink3', width: 2.4, domain: [0, 1.1] }, { fn: '1 + 0.6x', color: 'accent', width: 1.6, dash: true, domain: [0, al + 0.1] }],
              points: [{ x: 0, y: 1, r: 5, color: 'accent', label: 'k₁ here', labelDx: 8, labelDy: -12 }, { x: n12(al), y: n12(1 + 0.6 * al), r: 5, color: 'gold', label: 'k₂ here', labelDx: 8, labelDy: 14 }],
              vlines: [{ x: n12(al), color: 'gold', label: 'c₂h' }, { x: 1, color: 'ink4', label: 'h' }] },
            caption: 'One step from t to t + h: the first slope at the start, the second at the Euler-predicted point a fraction c₂ into the step.',
          },
          answer: b2, tol: { rel: 0.001 },
          errors: [{ value: 1 - b2, feedback: 'That is b₁. The question asks for the weight of the second stage, b₂ = 1/(2c₂).' }, { value: al / 2, feedback: 'Solve b₂c₂ = ½ for b₂: divide, do not multiply.' }].filter((e) => Math.abs(e.value - b2) > 1e-6),
          hints: [t`Only the second condition involves $c_2$: $b_2 = \dfrac{1}{2c_2}$.`, t`$b_2 = 1/(2\times${alT})$.`],
          teach: 'Order 2 needs two conditions; a two-stage method has three free numbers, so there is a one-parameter family: midpoint (c₂ = ½), Heun (c₂ = 1), Ralston (c₂ = ⅔) …',
          explain: t`$b_2 = 1/(2c_2) = ${frac(b2)}$ and $b_1 = ${frac(1 - b2)}$.${al === 0.5 ? ' That is the midpoint method.' : al === 1 ? ' That is Heun’s method.' : al === 2 / 3 ? ' That is Ralston’s method, which minimises the leading error coefficient.' : ''} Whatever $c_2$ is, $R(z) = 1 + z + \tfrac12z^2$: every member of the family has the same stability region.`,
        };
      },
    }),
    expr({
      id: 'stability-function', difficulty: 3,
      gen(r) {
        const T = r.pick(TABS), cs = rCoeffs(T);
        while (cs.length > 1 && Math.abs(cs[cs.length - 1]) < 1e-15) cs.pop();
        const s = T.b.length, taylor = Array.from({ length: s + 1 }, (_, k) => 1 / [1, 1, 2, 6, 24][k]);
        const isTaylor = cs.length === taylor.length && cs.every((x, k) => Math.abs(x - taylor[k]) < 1e-12);
        return {
          prompt: t`Here is ${T.name}:
$$${tableauTeX(T)}$$
Apply one step to $y' = \lambda y$ and find its stability function $R(z)$, $z = h\lambda$.`,
          answer: polyAtlas(cs), answerTeX: polyTeXz(cs), vars: { z: [-2, 1] }, lhs: 'R(z)',
          errors: isTaylor ? [] : [{ answer: polyAtlas(taylor), feedback: 'That is the Taylor polynomial of eᶻ, which this method does not match: work the stages out rather than assuming the order.' }],
          hints: [t`$k_1 = \lambda y$; each later stage is $\lambda$ times its trial point, so every $k_i$ is $\lambda y$ times a polynomial in $z$.`, t`Equivalently $R(z) = 1 + z\sum b_i + z^2\sum_i b_ic_i + z^3\sum_{i,j}b_ia_{ij}c_j + \cdots$.`],
          teach: 'On y′ = λy every explicit RK step is multiplication by a polynomial in z = hλ, of degree at most the number of stages; its coefficients are bᵀ𝟙, bᵀc, bᵀAc, …',
          explain: t`$R(z) = ${polyTeXz(cs)}$. ${isTaylor ? t`It matches $e^z$ through $z^{${s}}$, consistent with order ${s}.` : t`It departs from $e^z = 1 + z + \tfrac12z^2 + \tfrac16z^3 + \cdots$ at the first coefficient that differs — so the method’s order is at most the power before it.`}`,
        };
      },
    }),
    num({
      id: 'rk4-decay-limit', difficulty: 2,
      gen(r) {
        const k = r.pick([150, 400, 800, 2500]), sp = r.pick(['a catalyst-bed temperature transient', 'a fast chemical species', 'a sensor’s electronic filter']);
        const ans = LIM.rk4[0] / k;
        return {
          prompt: t`In a propulsion model, ${sp} decays as $y' = -${k}\,y$ (in $\text{s}^{-1}$). What is the largest step RK4 can take without the decay turning into growth?`,
          visual: { type: 'num3-stability', params: { methods: ['rk4'], method: 'rk4', z: [-1, 0], drag: false, panels: ['plane'], x: [-3.4, 0.8], y: [-3.2, 3.2], controls: false, readout: false },
            caption: 'RK4’s stability region. A decay y′ = −ky puts z = −kh on the negative real axis.' },
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: 2 / k, feedback: 'h ≤ 2/k is Euler’s (and RK2’s) limit. RK4’s region reaches further along the real axis, to −2.785.' }, { value: (2 * Math.SQRT2) / k, feedback: '2√2 is RK4’s limit on the imaginary axis (oscillations). A decay sits on the real axis.' }],
          hints: ['z = −kh must lie inside RK4’s region on the negative real axis.', t`RK4’s region meets the real axis at $z = -${LIM.rk4[0].toFixed(4)}$.`],
          teach: 'The largest stable step is the distance to the region’s edge along the eigenvalue’s ray, divided by |λ|.',
          explain: t`$h \le ${LIM.rk4[0].toFixed(4)}/${k} = ${tex(ans, 4)}$ s. Accuracy for the slow parts of the model may allow far longer steps — when a fast decay forces tiny steps on a slowly varying problem, the problem is **stiff**, and [implicit methods](#/lesson/st-f.F11.1) are the cure.`,
        };
      },
    }),
    {
      type: 'point', id: 'place-z', difficulty: 2,
      gen(r) {
        const w = r.pick([10, 20, 40]), zeta = r.pick([0.2, 0.5, 0.7]), h = r.pick([0.05, 0.1]);
        const zx = -zeta * w * h, zy = w * h * Math.sqrt(1 - zeta * zeta);
        return {
          prompt: t`A landing-gear strut is a damped oscillator with natural frequency $\omega = ${w}$ rad/s and damping ratio $\zeta = ${zeta}$, so its eigenvalues are $\lambda = \omega\left(-\zeta \pm i\sqrt{1 - \zeta^2}\right)$. A simulation uses $h = ${h}$ s. Drag the point to $z = h\lambda$ for the eigenvalue with positive imaginary part — and read off whether RK4 is stable there.`,
          instruction: 'Drag the point to z = hλ, then check.',
          visual: { type: 'num3-stability', params: { methods: ['rk4'], method: 'rk4', z: [0.6, -1.5], snap: 0.05, panels: ['plane'], x: [-3.6, 1.2], y: [-3.2, 3.2], controls: false } },
          answer: { x: zx, y: zy }, tol: { x: 0.12, y: 0.12 },
          hints: [t`$h\omega = ${n12(h * w)}$, so $z = ${n12(h * w)}\left(-${zeta} + i\sqrt{1 - ${zeta}^2}\right)$.`, t`Real part $${n12(zx)}$, imaginary part $${zy.toFixed(3)}$.`],
          teach: 'An eigenvalue of a damped oscillator lies in the left half-plane at angle set by ζ; multiplying by h slides it along that ray.',
          explain: t`$z = ${n12(zx)} + ${zy.toFixed(3)}i$, with $\lvert R(z)\rvert = ${S.absR('rk4', [zx, zy]).toFixed(4)}$: ${S.absR('rk4', [zx, zy]) <= 1 ? 'inside RK4’s region, so the computed oscillation decays as it should' : 'outside RK4’s region — the computed oscillation would grow although the real one decays'}. ${S.absR('euler', [zx, zy]) <= 1 ? 'Euler would be stable here too.' : t`Euler would not: $\lvert 1 + z\rvert = ${S.absR('euler', [zx, zy]).toFixed(3)}$.`}`,
        };
      },
    },
    num({
      id: 'heun-growth', difficulty: 3,
      gen(r) {
        const per = r.pick([10, 20, 40]), nper = r.pick([50, 100, 200]);
        const y = (2 * Math.PI) / per, n = per * nper, ans = (1 + y ** 4 / 4) ** (n / 2);
        return {
          prompt: t`Heun’s method integrates an undamped oscillator with $${per}$ steps per period, for $${nper}$ periods. Its stability function satisfies $\lvert R(iy)\rvert^2 = 1 + \tfrac14y^4$. By what factor has the amplitude grown?`,
          visual: { type: 'num3-stability', params: { methods: ['heun'], method: 'heun', z: [0, y], drag: false, x: [-1.2, 0.6], y: [-0.8, 0.8], n: 60, controls: false, readout: false },
            caption: 'Heun’s region near the origin: the oscillation’s z = iωh sits just outside it. Below: |yₙ| over 60 steps.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (1 + y ** 4 / 4) ** n, feedback: 'The formula is for |R|². The amplitude grows by |R| per step: take the square root.' }, { value: 1 + (n * y ** 4) / 8, feedback: 'That linearises the growth; after many steps it compounds.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$y = \omega h = 2\pi/${per}$; there are $${n}$ steps.`, t`Amplitude factor $= \left(1 + \tfrac14y^4\right)^{${n}/2}$.`],
          teach: 'For a linear problem the amplitude after n steps is exactly |R(z)|ⁿ: tiny excesses over 1 compound.',
          explain: t`$y = ${y.toFixed(4)}$, $\lvert R\rvert = ${Math.sqrt(1 + y ** 4 / 4).toFixed(7)}$, and after $${n}$ steps the amplitude is $\times${tex(ans, 3)}$. Halving $h$ divides $y^4$ by 16 and doubles the steps, so the growth exponent falls eightfold — convergent, but never neutral.`,
        };
      },
    }),
    match({
      id: 'which-R', difficulty: 2,
      prompt: t`Match each method to its stability function $R(z)$, $z = h\lambda$.`,
      left: ['Euler', t`any two-stage method of order 2`, 'classical RK4', 'backward (implicit) Euler'],
      right: ['1 + z', '1 + z + z²/2', '1 + z + z²/2 + z³/6 + z⁴/24', '1/(1 − z)', 'eᶻ'],
      visual: { type: 'num3-stability', params: { methods: ['euler', 'heun', 'rk4', 'beuler'], method: 'beuler', compare: true, z: null, panels: ['plane'], x: [-3.6, 2.6], y: [-3.2, 3.2], controls: false, readout: false },
        caption: 'The four methods’ stability regions: backward Euler’s (shaded) is everything outside the disc of radius 1 about z = 1; the explicit methods’ are bounded.' },
      answer: [0, 1, 2, 3],
      hints: ['Explicit methods give polynomials whose degree is at most the number of stages.', 'An implicit method solves y₁ = y₀ + hλy₁ for y₁.'],
      teach: 'Explicit RK methods have polynomial R; implicit ones rational R. Only the exact solution has R = eᶻ.',
      explain: t`Euler $1 + z$; second order $1 + z + \tfrac12z^2$; RK4 the Taylor polynomial of $e^z$ to $z^4$; backward Euler $y_1 = y_0 + zy_1 \Rightarrow R = 1/(1 - z)$, bounded by 1 on the whole left half-plane — see [F11.1](#/lesson/st-f.F11.1). No method has $R = e^z$ exactly; that is the exact flow.`,
    }),
    code({
      id: 'rk-tableau', difficulty: 3,
      prompt: t`Write \`rk_step(A, b, c, f, t, y, h)\` for any explicit Butcher tableau (NumPy arrays), and \`order(A, b, c)\`, which runs $y' = y\cos t$, $y(0) = 1$ to $t = 2$ (exact $e^{\sin t}$) with 40 and 80 steps and returns $\log_2(E_{40}/E_{80})$. The program measures Kutta’s RK3 and the 3/8 rule.`,
      starter: t`import numpy as np

def rk_step(A, b, c, f, t, y, h):
    s = len(b)
    k = []
    # for each stage i: trial point y + h * sum_j A[i, j] * k[j] (j < i), slope at t + c[i]*h
    return y

def order(A, b, c):
    f = lambda t, y: y * np.cos(t)
    errs = []
    for n in (40, 80):
        h, y = 2.0 / n, np.array([1.0])
        for i in range(n):
            y = rk_step(A, b, c, f, i * h, y, h)
        errs.append(abs(y[0] - np.exp(np.sin(2.0))))
    return np.log2(errs[0] / errs[1])

A3 = np.array([[0, 0, 0], [0.5, 0, 0], [-1, 2, 0]]); b3 = np.array([1/6, 2/3, 1/6]); c3 = np.array([0, 0.5, 1])
A38 = np.array([[0, 0, 0, 0], [1/3, 0, 0, 0], [-1/3, 1, 0, 0], [1, -1, 1, 0]]); b38 = np.array([1/8, 3/8, 3/8, 1/8]); c38 = np.array([0, 1/3, 2/3, 1])
print(order(A3, b3, c3), order(A38, b38, c38))
`,
      answer: t`import numpy as np

def rk_step(A, b, c, f, t, y, h):
    s = len(b)
    k = []
    for i in range(s):
        yi = y + h * sum(A[i, j] * k[j] for j in range(i))
        k.append(f(t + c[i] * h, yi))
    return y + h * sum(b[i] * k[i] for i in range(s))

def order(A, b, c):
    f = lambda t, y: y * np.cos(t)
    errs = []
    for n in (40, 80):
        h, y = 2.0 / n, np.array([1.0])
        for i in range(n):
            y = rk_step(A, b, c, f, i * h, y, h)
        errs.append(abs(y[0] - np.exp(np.sin(2.0))))
    return np.log2(errs[0] / errs[1])

A3 = np.array([[0, 0, 0], [0.5, 0, 0], [-1, 2, 0]]); b3 = np.array([1/6, 2/3, 1/6]); c3 = np.array([0, 0.5, 1])
A38 = np.array([[0, 0, 0, 0], [1/3, 0, 0, 0], [-1/3, 1, 0, 0], [1, -1, 1, 0]]); b38 = np.array([1/8, 3/8, 3/8, 1/8]); c38 = np.array([0, 1/3, 2/3, 1])
print(order(A3, b3, c3), order(A38, b38, c38))`,
      tests: [
        { name: t`one 3/8-rule step on $y' = y$ is $1 + h + \tfrac12h^2 + \tfrac16h^3 + \tfrac1{24}h^4$`, code: 'abs(rk_step(A38, b38, c38, lambda t, y: y, 0.0, np.array([1.0]), 0.1)[0] - (1 + 0.1 + 0.005 + 0.1**3/6 + 0.1**4/24)) < 1e-15' },
        { name: 'it uses the stage times: one RK3 step of y′ = 3t² from 0 to 1 is exact', code: 'abs(rk_step(A3, b3, c3, lambda t, y: 3 * t**2 + 0 * y, 0.0, np.array([0.0]), 1.0)[0] - 1) < 1e-14' },
        { name: 'RK3 measures order 3 (within 0.15)', code: 'abs(order(A3, b3, c3) - 3) < 0.15' },
        { name: 'the 3/8 rule measures order 4 (within 0.15)', code: 'abs(order(A38, b38, c38) - 4) < 0.15' },
      ],
      hints: ['In stage i, the trial point is y + h·Σⱼ₍ⱼ₍ᵢ₎ A[i, j]·k[j] (an empty sum is 0); the slope is f(t + c[i]·h, trial point).', 'After all stages, return y + h·Σᵢ b[i]·k[i].'],
      teach: 'One function runs every explicit RK method: the tableau is data, and a measured order checks that the data were typed correctly.',
      explain: t`The measured orders come out close to 3 and 4 (pre-asymptotic corrections shift them by a few hundredths at these steps). A single mistyped entry in a tableau usually drops the measured order to 1 or 2 — the fastest way to catch it, and the theme of [F13.1](#/lesson/st-f.F13.1).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-leo', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([92.6, 95.4, 101.5, 1436.1]), ans = (P * Math.SQRT2) / Math.PI;
        return {
          prompt: t`A circular orbit with period $P = ${P}$ min, linearised about the reference orbit, has oscillation eigenvalues $\pm i\omega$ with $\omega = 2\pi/P$. What is the largest step for which RK4 keeps those oscillations from growing?`,
          visual: { type: 'num3-stability', params: { methods: ['rk4'], method: 'rk4', z: [0, 1], drag: false, panels: ['plane'], x: [-3.6, 1.2], y: [-3.2, 3.2], controls: false, readout: false },
            caption: 'RK4’s region; an undamped oscillation sits on the imaginary axis.' },
          answer: ans, units: 'min', tol: { rel: 0.005 },
          errors: [{ value: (LIM.rk4[0] * P) / (2 * Math.PI), feedback: '2.785 is the limit on the real axis. Orbital oscillations have imaginary eigenvalues: use 2√2.' }, { value: P / Math.PI, feedback: 'Euler’s limit on the real axis is 2, but on the imaginary axis it is RK4’s 2√2 that counts.' }],
          hints: [t`Stability needs $\omega h \le 2\sqrt2$.`, t`$h \le 2\sqrt2/\omega = 2\sqrt2\,P/(2\pi) = \sqrt2\,P/\pi$.`],
          teach: 'For oscillations, the imaginary-axis extent of the region sets the stability limit — but a stable step can still be useless for accuracy.',
          explain: t`$h \le \sqrt2P/\pi = ${ans.toFixed(1)}$ min — barely more than two steps per orbit. Stable, and worthless: the orbit would be badly wrong. For orbits accuracy, not stability, sets the step; stability limits bite when the problem has much faster time scales than the ones you care about.`,
        };
      },
    }),
    mcq({
      id: 'cp-damping', difficulty: 2, transfer: true,
      prompt: t`A structural-dynamics code integrates an undamped vibration mode for a long time at about 20 steps per period. Which statement is right?`,
      visual: { type: 'num3-stability', params: { methods: ['heun', 'rk3', 'rk4'], method: 'rk3', compare: true, z: [0, 0.314], drag: false, x: [-1.4, 0.6], y: [-0.9, 0.9], n: 60, controls: false, readout: false },
        caption: 'Near the origin: RK3 shaded, RK2 and RK4 outlined. The gold dot is z = iωh at 20 steps per period.' },
      choices: [
        'Heun makes the amplitude grow, RK3 damps it noticeably, RK4 damps it only slightly — none keeps it exactly',
        'All three keep the amplitude constant, because the problem is undamped',
        'Heun damps the amplitude and RK4 makes it grow',
        'Higher order always means less amplitude error, so RK3 is better than Heun only by a constant factor',
      ],
      answer: 0,
      why: {
        1: 'An explicit RK method’s polynomial R cannot have |R(iy)| = 1 along a stretch of the imaginary axis; the exact flow does.',
        2: 'Heun’s |R(iy)|² = 1 + y⁴/4 > 1: it grows. RK4’s is slightly below 1: it damps.',
        3: 'The behaviour differs in kind, not degree: Heun inflates the mode, RK3 and RK4 deflate it.',
      },
      hints: ['Where is z = iωh relative to each boundary?', 'Outside a region the mode grows; inside it decays.'],
      teach: 'On the imaginary axis an explicit RK method either inflates or damps an oscillation; the size and sign of |R(iy)| − 1 say which and how fast.',
      explain: t`At $y = 0.314$: Heun $\lvert R\rvert = ${S.absR('heun', [0, 0.314]).toFixed(6)}$ (grows), RK3 $${S.absR('rk3', [0, 0.314]).toFixed(6)}$, RK4 $${S.absR('rk4', [0, 0.314]).toFixed(8)}$ (both damp, RK3 sixty times faster). Damping can masquerade as physical dissipation in a long run — another reason long simulations use [symplectic methods](#/lesson/st-f.F10.1).`,
    }),
    num({
      id: 'cp-array-step', difficulty: 2, transfer: true,
      gen(r) {
        const f = r.pick([0.5, 2, 8, 35]), ans = (2 * Math.SQRT2) / (2 * Math.PI * f);
        return {
          prompt: t`A spacecraft model includes an undamped flexible mode at $${f}$ Hz. What is the largest step RK4 can take without that mode growing? (RK4’s region reaches $2\sqrt2$ up the imaginary axis.)`,
          visual: { type: 'num3-stability', params: { methods: ['rk3', 'rk4'], method: 'rk4', compare: true, z: [0, 1], drag: false, panels: ['plane'], x: [-3.6, 1.2], y: [-3.2, 3.2], controls: false, readout: false },
            caption: 'RK4 shaded, RK3 outlined: both cover a stretch of the imaginary axis.' },
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(3) / (2 * Math.PI * f), feedback: 'That is RK3’s limit. The question asks for RK4: 2√2.' }, { value: (2 * Math.SQRT2) / f, feedback: 'Convert the frequency to angular frequency: ω = 2πf.' }],
          hints: [t`$\omega = 2\pi f$; the mode’s $z = \pm i\omega h$.`, t`$h \le 2\sqrt2/\omega$.`],
          teach: 'The fastest mode in a model sets the stability limit of an explicit method, whether or not that mode matters.',
          explain: t`$\omega = ${(2 * Math.PI * f).toFixed(3)}$ rad/s, so $h \le 2\sqrt2/\omega = ${tex(ans, 3)}$ s (RK3: $${tex(Math.sqrt(3) / (2 * Math.PI * f), 3)}$ s). A stiff structural mode can force a whole attitude simulation to tiny steps; engineers either drop such modes or switch to implicit integrators.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Butcher, Numerical Methods for Ordinary Differential Equations, 3rd ed. (Wiley 2016), ch. 3', url: 'https://doi.org/10.1002/9781119121534' },
    { label: 'Hairer, Nørsett & Wanner, Solving Ordinary Differential Equations I (Springer 1993), §II.1–II.2', url: 'https://doi.org/10.1007/978-3-540-78862-1' },
    { label: 'LeVeque, Finite Difference Methods for ODEs and PDEs (SIAM 2007), ch. 7: absolute stability', url: 'https://faculty.washington.edu/rjl/fdmbook/' },
  ],
});
