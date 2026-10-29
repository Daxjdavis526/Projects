// The Minkowski metric and the summation convention — Derivation Mode.
// Index notation is introduced here (Carroll's conventions, signature
// −,+,+,+): x^μ = (ct, x, y, z), η_μν = diag(−1, 1, 1, 1), a repeated index
// up-and-down is summed. Lorentz transformations are the maps with
// η_ρσ Λ^ρ_μ Λ^σ_ν = η_μν; boosts are hyperbolic rotations and rapidities add.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { round, matrix, frames } from './_deriv.js';

const t = String.raw;

const ink3 = 'ink3';
const etaPicture = (caption) => matrix(
  [['−1', '0', '0', '0'], ['0', '1', '0', '0'], ['0', '0', '1', '0'], ['0', '0', '0', '1']],
  {
    colors: [['bad', ink3, ink3, ink3], [ink3, 'accent', ink3, ink3], [ink3, ink3, 'accent', ink3], [ink3, ink3, ink3, 'accent']],
    rowLabels: ['μ = 0', '1', '2', '3'], colLabels: ['ν = 0', '1', '2', '3'], left: 'η =', w: 1.1, h: 0.55,
    caption: caption ?? t`The Minkowski metric $\eta_{\mu\nu}$ as a $4\times4$ array: row $\mu$, column $\nu$. Only the diagonal is non-zero, and only the time–time entry is negative.`,
  },
);
const boostPicture = (caption) => matrix(
  [['γ', '−γβ', '0', '0'], ['−γβ', 'γ', '0', '0'], ['0', '0', '1', '0'], ['0', '0', '0', '1']],
  {
    colors: [['gold', 'violet', ink3, ink3], ['violet', 'gold', ink3, ink3], [ink3, ink3, 'ink', ink3], [ink3, ink3, ink3, 'ink']],
    rowLabels: ['μ = 0', '1', '2', '3'], colLabels: ['ν = 0', '1', '2', '3'], left: 'Λ =', w: 1.1, h: 0.55,
    caption: caption ?? t`$\Lambda^\mu{}_\nu$ for a boost along $x$: the upper index $\mu$ picks the row, the lower index $\nu$ the column. $\Lambda^\mu{}_\nu B^\nu$ is row times column, summed over $\nu$.`,
  },
);
// the unit hyperbola, the light cone and frames at fixed rapidities (no readout)
const hyperbola = (phis, caption) => ({
  type: 'graph',
  params: {
    x: [-3.3, 3.3], y: [-0.5, 3.6], equal: true, xlabel: 'x', ylabel: 'ct',
    curves: [
      { fn: 'x', color: 'warn', dash: true, width: 1.3 }, { fn: '-x', color: 'warn', dash: true, width: 1.3 },
      { param: ['sinh(t)', 'cosh(t)'], t: [-2, 2], color: 'ink3', width: 1.4 },
      ...phis.map((p, k) => ({ param: [`${round(Math.sinh(p))}*t`, `${round(Math.cosh(p))}*t`], t: [0, 4], color: ['gold', 'violet', 'teal'][k], width: 2.4 })),
    ],
    points: phis.map((p, k) => ({ x: round(Math.sinh(p)), y: round(Math.cosh(p)), color: ['gold', 'violet', 'teal'][k] })),
  },
  caption,
});
const tanhGraph = (points, caption) => ({
  type: 'graph',
  params: {
    x: [0, 3.2], y: [0, 1.15], xlabel: 'rapidity φ', ylabel: 'speed β = tanh φ',
    curves: [{ fn: 'tanh(x)', color: 'accent' }, { fn: 'x', color: 'ink3', dash: true, domain: [0, 1.1], label: 'β = φ (slow speeds)', labelAt: 0.75, labelDx: 8, labelDy: 10 }],
    hlines: [{ y: 1, label: 'the speed of light', color: 'warn' }],
    points,
  },
  caption,
});

// four-vectors with small integer components and a non-zero time part
function vec4(r) {
  return [r.intExcept(-3, 4, [0]), r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)];
}
const fmtVec = (v) => `(${v.join(', ')})`;
const paren = (k) => (k < 0 ? `(${k})` : `${k}`);

export default lesson({
  id: 'gr.S03.d',
  title: 'The Minkowski metric ημν and the summation convention',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`Collect an event’s coordinates into one object with an index, $x^\mu = (ct, x, y, z)$ for $\mu = 0, 1, 2, 3$. The interval between two nearby events then becomes the single expression above, read with **Einstein’s summation convention: an index that appears twice in a term, once up and once down, is summed over its four values.** The **Minkowski metric** $\eta_{\mu\nu} = \mathrm{diag}(-1, 1, 1, 1)$ supplies the signs.

Lorentz transformations are now *defined* as the linear maps that leave this expression unchanged — and seen that way, a boost is a hyperbolic rotation whose angle, the rapidity, simply adds. Every equation of general relativity is written in this notation; from step 8 on, $\eta_{\mu\nu}$ is replaced by a metric $g_{\mu\nu}(x)$ that varies from place to place.`,
  equation: t`ds^2 = \eta_{\mu\nu}\,dx^\mu dx^\nu = -c^2\,dt^2 + dx^2 + dy^2 + dz^2`,
  symbols: [
    { tex: 'x^\\mu', text: t`an event’s four coordinates, $x^0 = ct$, $x^1 = x$, $x^2 = y$, $x^3 = z$, all in metres. The raised $\mu$ says *which* coordinate; it is not a power` },
    { tex: '\\mu,\\ \\nu', text: t`spacetime indices: Greek letters run over $0, 1, 2, 3$; Latin letters such as $i, j$ run over the space values $1, 2, 3$` },
    { tex: '\\eta_{\\mu\\nu}', text: t`the Minkowski metric, a $4\times4$ array: $\eta_{00} = -1$, $\eta_{11} = \eta_{22} = \eta_{33} = +1$, zero off the diagonal. Carroll’s signature, $(-,+,+,+)$` },
    { tex: 'dx^\\mu', text: t`the coordinate differences $(c\,dt, dx, dy, dz)$ between two nearby events` },
    { tex: '\\eta_{\\mu\\nu}dx^\\mu dx^\\nu', text: t`shorthand for $\sum_{\mu=0}^{3}\sum_{\nu=0}^{3}\eta_{\mu\nu}\,dx^\mu dx^\nu$: sixteen terms, of which only the four diagonal ones survive` },
    { tex: 'ds^2', text: t`the interval, in $\text{m}^2$: negative for timelike separations (a clock between them records $d\tau = \sqrt{-ds^2}/c$), zero for light, positive for spacelike` },
  ],
  why: t`This notation is the language of the rest of the Road: the metric, the Christoffel symbols, the curvature tensors and Einstein’s equations are all index expressions read with exactly these rules.`,
  visual: {
    type: 'graph',
    title: 'A boost is a hyperbolic rotation',
    lead: t`The grey curve is $(ct)^2 - x^2 = 1$. The gold axes are those of a frame boosted by rapidity $\phi_1$: its time axis meets the hyperbola at $(\sinh\phi_1, \cosh\phi_1)$. The violet time axis is that frame boosted again, by $\phi_2$.`,
    tasks: [
      'Move φ₁: the readout’s γ₁² − (γ₁β₁)² never leaves 1 — the gold point slides along the hyperbola.',
      'Set φ₁ = φ₂ = 0.55: each boost is 0.50c, yet together they give tanh(1.10) = 0.80c, not 1.00c. Rapidities add; speeds do not.',
      'Push both sliders to 1.5: the violet axis crowds the light cone but never crosses it.',
    ],
    params: {
      x: [-3.3, 3.3], y: [-0.5, 3.6], equal: true, xlabel: 'x', ylabel: 'ct',
      sliders: [
        { key: 'p1', label: t`First boost, rapidity $\phi_1$`, min: -1.5, max: 1.5, step: 0.01, value: 0.6, explain: t`Its speed is $\beta_1 = \tanh\phi_1$ and its Lorentz factor $\gamma_1 = \cosh\phi_1$.` },
        { key: 'p2', label: t`Second boost on top of it, $\phi_2$`, min: -1.5, max: 1.5, step: 0.01, value: 0.5, explain: t`Measured in the first boosted frame; the violet axis is the combined frame.` },
      ],
      curves: [
        { fn: 'x', color: 'warn', dash: true, width: 1.3 }, { fn: '-x', color: 'warn', dash: true, width: 1.3 },
        { param: ['sinh(t)', 'cosh(t)'], t: [-2, 2], color: 'ink3', width: 1.4 },
        { param: ['sinh(p1)*t', 'cosh(p1)*t'], t: [0, 4], color: 'gold', width: 2.4 },
        { param: ['cosh(p1)*t', 'sinh(p1)*t'], t: [-4, 4], color: 'gold', width: 2.4 },
        { param: ['sinh(p1 + p2)*t', 'cosh(p1 + p2)*t'], t: [0, 4], color: 'violet', width: 2.4 },
      ],
      points: [{ x: 'sinh(p1)', y: 'cosh(p1)', color: 'gold', label: 'φ₁' }, { x: 'sinh(p1 + p2)', y: 'cosh(p1 + p2)', color: 'violet', label: 'φ₁ + φ₂' }],
      readouts: [
        { label: t`$\beta_1 = \tanh\phi_1$`, expr: 'tanh(p1)', digits: 4 },
        { label: t`$\gamma_1 = \cosh\phi_1$`, expr: 'cosh(p1)', digits: 4 },
        { label: t`$\gamma_1^2 - (\gamma_1\beta_1)^2$`, expr: 'cosh(p1)^2 - sinh(p1)^2', digits: 4 },
        { label: t`$\beta_2 = \tanh\phi_2$`, expr: 'tanh(p2)', digits: 4 },
        { label: t`combined speed $\tanh(\phi_1 + \phi_2)$`, expr: 'tanh(p1 + p2)', digits: 4 },
        { label: t`$(\beta_1 + \beta_2)/(1 + \beta_1\beta_2)$`, expr: '(tanh(p1) + tanh(p2))/(1 + tanh(p1)*tanh(p2))', digits: 4 },
      ],
    },
    caption: t`Units with $c = 1$; light runs along the dashed lines. Every frame’s one-unit tick on its own time axis lies on the grey hyperbola. The rapidity $\phi$ is the hyperbolic angle: $\beta = \tanh\phi$, $\gamma = \cosh\phi$, $\gamma\beta = \sinh\phi$.`,
  },
  example: {
    prompt: t`Write the condition for a linear map $dx'^\mu = \Lambda^\mu{}_\nu\,dx^\nu$ to preserve $ds^2$, check it for the boost of step 2, and show that two boosts in a row add their rapidities.`,
    visual: etaPicture(),
    steps: [
      { label: 'Write the sum out', text: t`$\eta_{\mu\nu}\,dx^\mu dx^\nu$ stands for sixteen terms, one for each pair $(\mu, \nu)$. Every off-diagonal $\eta_{\mu\nu}$ is zero, so four survive: $\eta_{00}(dx^0)^2 + \eta_{11}(dx^1)^2 + \eta_{22}(dx^2)^2 + \eta_{33}(dx^3)^2 = -c^2dt^2 + dx^2 + dy^2 + dz^2$.` },
      { label: 'The condition', text: t`In the new frame $ds^2 = \eta_{\rho\sigma}\,dx'^\rho dx'^\sigma$. Substitute $dx'^\rho = \Lambda^\rho{}_\mu dx^\mu$ and $dx'^\sigma = \Lambda^\sigma{}_\nu dx^\nu$ — with *different* dummy letters, so no index appears more than twice — to get $\eta_{\rho\sigma}\Lambda^\rho{}_\mu\Lambda^\sigma{}_\nu\,dx^\mu dx^\nu$. This equals $\eta_{\mu\nu}dx^\mu dx^\nu$ for every $dx$ exactly when $\eta_{\rho\sigma}\Lambda^\rho{}_\mu\Lambda^\sigma{}_\nu = \eta_{\mu\nu}$ (in matrices, $\Lambda^{\mathsf T}\eta\Lambda = \eta$).` },
      { label: 'Check the boost', text: t`For the boost along $x$, $\Lambda^0{}_0 = \Lambda^1{}_1 = \gamma$ and $\Lambda^0{}_1 = \Lambda^1{}_0 = -\gamma\beta$. With $\mu = \nu = 0$ the sum over $\rho, \sigma$ keeps $-(\Lambda^0{}_0)^2 + (\Lambda^1{}_0)^2 = -\gamma^2 + \gamma^2\beta^2 = -1 = \eta_{00}$ ✓. With $\mu = 0$, $\nu = 1$: $-\Lambda^0{}_0\Lambda^0{}_1 + \Lambda^1{}_0\Lambda^1{}_1 = \gamma^2\beta - \gamma^2\beta = 0 = \eta_{01}$ ✓. And $\mu = \nu = 1$ gives $-\gamma^2\beta^2 + \gamma^2 = 1$ ✓.` },
      { label: 'Rapidity', text: t`The $(0, 0)$ condition says $\gamma^2 - (\gamma\beta)^2 = 1$ — the identity $\cosh^2\phi - \sinh^2\phi = 1$. So write $\gamma = \cosh\phi$ and $\gamma\beta = \sinh\phi$, which makes $\beta = \tanh\phi$: **a boost is a hyperbolic rotation by the rapidity $\phi$**.` },
      { label: 'Two boosts in a row', text: t`The top-left entry of $\Lambda(\phi_1)\Lambda(\phi_2)$ is $\cosh\phi_1\cosh\phi_2 + \sinh\phi_1\sinh\phi_2 = \cosh(\phi_1 + \phi_2)$, and the others follow the same way: $\Lambda(\phi_1)\Lambda(\phi_2) = \Lambda(\phi_1 + \phi_2)$. Then $\beta = \tanh(\phi_1 + \phi_2) = \dfrac{\beta_1 + \beta_2}{1 + \beta_1\beta_2}$ — step 2’s velocity addition, in one line.` },
      { label: 'Sense check', text: t`$0.8c$ on top of $0.8c$: $\operatorname{artanh}0.8 = ${fmt(Math.atanh(0.8), 5)}$, and $\tanh(${fmt(2 * Math.atanh(0.8), 5)}) = ${fmt(Math.tanh(2 * Math.atanh(0.8)), 4)}$; the formula gives $1.6/1.64 = ${fmt(1.6 / 1.64, 4)}$ ✓. Below the speed of light, however many boosts you stack.` },
    ],
    answer: t`$\eta_{\rho\sigma}\Lambda^\rho{}_\mu\Lambda^\sigma{}_\nu = \eta_{\mu\nu}$; the boost satisfies it because $\gamma^2(1 - \beta^2) = 1$, so $\gamma = \cosh\phi$, $\gamma\beta = \sinh\phi$, and $\Lambda(\phi_1)\Lambda(\phi_2) = \Lambda(\phi_1 + \phi_2)$.`,
  },
  practice: [
    mcq({
      id: 'free-index', difficulty: 2,
      prompt: 'Which of these is a valid equation in index notation?',
      choices: [
        t`$A^\mu = \Lambda^\mu{}_\nu B^\nu$`,
        t`$A^\mu = \Lambda^\mu{}_\nu B^\mu$`,
        t`$A_\mu = \Lambda^\mu{}_\nu B^\nu$`,
        t`$A^\mu = \Lambda^\nu{}_\nu B^\nu$`,
      ],
      answer: 0,
      why: {
        1: t`On the right $\mu$ appears twice, both times up, and $\nu$ appears once, down — a free $\nu$ that the left side does not have.`,
        2: t`The free index $\mu$ is down on the left but up on the right. Free indices must match in name *and* height in every term.`,
        3: t`$\nu$ appears three times in one term — a summed index appears exactly twice — and the left side’s $\mu$ has no partner on the right.`,
      },
      hints: ['Free indices (the unsummed ones) must be the same, at the same height, in every term.', 'A summed (dummy) index appears exactly twice in a term: once up, once down.'],
      teach: 'In a valid index equation every term carries the same free indices at the same heights, and each summed index appears exactly twice, once up and once down.',
      explain: t`In $A^\mu = \Lambda^\mu{}_\nu B^\nu$ the dummy $\nu$ is summed (once up, once down) and the free $\mu$ is up on both sides. It stands for four equations, one for each $\mu$; for $\mu = 0$: $A^0 = \Lambda^0{}_0B^0 + \Lambda^0{}_1B^1 + \Lambda^0{}_2B^2 + \Lambda^0{}_3B^3$.`,
      visual: boostPicture(),
    }),
    num({
      id: 'contract', difficulty: 2,
      gen(r) {
        let A, B, ans, eu;
        do {
          A = vec4(r); B = vec4(r);
          ans = -A[0] * B[0] + A[1] * B[1] + A[2] * B[2] + A[3] * B[3];
          eu = A[0] * B[0] + A[1] * B[1] + A[2] * B[2] + A[3] * B[3];
        } while (ans === 0 || Math.abs(ans) === Math.abs(eu));
        return {
          prompt: t`Two four-vectors have components $A^\mu = ${fmtVec(A)}$ and $B^\mu = ${fmtVec(B)}$, in the order $(0, 1, 2, 3)$. Evaluate $\eta_{\mu\nu}A^\mu B^\nu$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [
            { value: eu, feedback: t`You added all four products, as for an ordinary dot product. $\eta_{00} = -1$: the time–time term enters with a minus sign.` },
            { value: -ans, feedback: t`That is the $(+,-,-,-)$ convention. With Carroll’s $\eta = \mathrm{diag}(-1, 1, 1, 1)$, only the time term is negative.` },
          ],
          hints: [t`Only the diagonal of $\eta$ is non-zero, so the double sum keeps four terms: $\eta_{00}A^0B^0 + \eta_{11}A^1B^1 + \eta_{22}A^2B^2 + \eta_{33}A^3B^3$.`, t`$= -(${paren(A[0])})(${paren(B[0])}) + (${paren(A[1])})(${paren(B[1])}) + (${paren(A[2])})(${paren(B[2])}) + (${paren(A[3])})(${paren(B[3])})$.`],
          teach: t`The Minkowski inner product $\eta_{\mu\nu}A^\mu B^\nu$ is minus the product of the time components plus the products of the space components.`,
          explain: t`$\eta_{\mu\nu}A^\mu B^\nu = -(${A[0] * B[0]}) + (${A[1] * B[1]}) + (${A[2] * B[2]}) + (${A[3] * B[3]}) = ${ans}$. Of the sixteen terms of the double sum, the twelve with $\mu \neq \nu$ vanish. Every inertial observer computes the same number, though each finds different components.`,
          visual: etaPicture(),
        };
      },
    }),
    mcq({
      id: 'lower', difficulty: 2,
      prompt: t`A four-vector has components $A^\mu = (2, 1, 0, 3)$. What are its lower-index components $A_\mu = \eta_{\mu\nu}A^\nu$?`,
      choices: ['(−2, 1, 0, 3)', '(2, −1, 0, −3)', '(2, 1, 0, 3)', '(−2, −1, 0, −3)'],
      answer: 0,
      why: {
        1: 'That is lowering with the opposite signature, (+, −, −, −). With Carroll’s η = diag(−1, 1, 1, 1), only the time component changes sign.',
        2: 'That lowers with the Euclidean metric δ, which changes nothing. In spacetime the metric is η, and its −1 flips the time component.',
        3: 'η multiplies the space components by +1: only A₀ picks up the minus sign.',
      },
      hints: [t`For each $\mu$, $A_\mu = \eta_{\mu 0}A^0 + \eta_{\mu 1}A^1 + \eta_{\mu 2}A^2 + \eta_{\mu 3}A^3$, and $\eta$ is diagonal.`, t`$A_0 = \eta_{00}A^0 = -A^0$; $A_i = \eta_{ii}A^i = A^i$.`],
      teach: 'Lowering an index with η = diag(−1, 1, 1, 1) flips the sign of the time component and leaves the space components alone.',
      explain: t`$A_0 = -A^0 = -2$ and $A_i = A^i$, so $A_\mu = (-2, 1, 0, 3)$. Now $A_\mu A^\mu = -4 + 1 + 0 + 9 = 6$ — the same as $\eta_{\mu\nu}A^\mu A^\nu$, as it must be: lowering with $\eta$ just builds the metric into the components.`,
      visual: etaPicture(t`Lowering is multiplying by this array: $A_\mu = \eta_{\mu\nu}A^\nu$. Its one negative entry is the time–time one.`),
    }),
    num({
      id: 'three-boosts', difficulty: 2,
      gen(r) {
        const b = r.pick([0.3, 0.5, 0.6]);
        const ans = Math.tanh(3 * Math.atanh(b));
        return {
          prompt: t`A courier ship moves at $${b}c$ relative to a station. It launches a drone forward at $${b}c$ relative to itself, and the drone launches a probe forward at $${b}c$ relative to the drone. How fast does the probe move relative to the station, as a fraction of $c$? (Add rapidities: $\phi = \operatorname{artanh}\beta$.)`,
          answer: ans, tol: { rel: 0.002 },
          errors: [
            { value: 3 * b, feedback: 'Speeds do not add in relativity; their rapidities do.' },
            { value: Math.tanh(2 * Math.atanh(b)), feedback: 'That combines only two of the three boosts.' },
          ],
          hints: [t`Each boost has rapidity $\phi = \operatorname{artanh}${b} = ${fmt(Math.atanh(b), 4)}$.`, t`Three boosts in a row: $\beta = \tanh(3\phi) = \tanh(${fmt(3 * Math.atanh(b), 4)})$.`],
          teach: 'Collinear boosts compose by adding rapidities: β = tanh(φ₁ + φ₂ + φ₃).',
          explain: t`$3\phi = ${fmt(3 * Math.atanh(b), 4)}$, so $\beta = \tanh(${fmt(3 * Math.atanh(b), 4)}) = ${fmt(ans, 4)}$ — less than the $${nice(3 * b)}$ that adding speeds would give. Applying $\dfrac{\beta_1 + \beta_2}{1 + \beta_1\beta_2}$ twice gives the same answer, the long way.`,
          visual: tanhGraph([{ x: round(Math.atanh(b)), y: b, color: 'gold', label: `one boost: ${b}c` }], t`Speed against rapidity. Rapidities add without limit; $\beta = \tanh\phi$ squeezes any total below 1. For slow speeds $\beta \approx \phi$, which is why Galileo’s addition works in daily life.`),
        };
      },
    }),
    expr({
      id: 'compose-gamma', difficulty: 3,
      prompt: t`Two boosts in the same direction, with speeds $\beta_1$ and $\beta_2$, combine into a single boost. Find its Lorentz factor $\gamma$ as a function of $\beta_1$ and $\beta_2$. (Use $\gamma = \cosh\phi$ and $\cosh(\phi_1 + \phi_2) = \cosh\phi_1\cosh\phi_2 + \sinh\phi_1\sinh\phi_2$.)`,
      answer: '(1 + beta_1 beta_2)/sqrt((1 - beta_1^2)(1 - beta_2^2))', answerTeX: t`\frac{1 + \beta_1\beta_2}{\sqrt{(1 - \beta_1^2)(1 - \beta_2^2)}}`,
      lhs: '\\gamma',
      vars: { beta_1: [-0.9, 0.9], beta_2: [-0.9, 0.9] },
      errors: [
        { answer: '1/sqrt((1 - beta_1^2)(1 - beta_2^2))', feedback: t`That is $\gamma_1\gamma_2$, which drops the $\sinh\phi_1\sinh\phi_2$ term: Lorentz factors do not simply multiply.` },
        { answer: '(1 - beta_1 beta_2)/sqrt((1 - beta_1^2)(1 - beta_2^2))', feedback: t`Check the sign: $\sinh\phi_1\sinh\phi_2 = \gamma_1\beta_1\gamma_2\beta_2$ is added, for boosts in the same direction.` },
      ],
      hints: [t`$\cosh\phi_k = \gamma_k$ and $\sinh\phi_k = \gamma_k\beta_k$.`, t`So $\gamma = \gamma_1\gamma_2 + \gamma_1\beta_1\gamma_2\beta_2 = \gamma_1\gamma_2(1 + \beta_1\beta_2)$; then write each $\gamma_k$ as $1/\sqrt{1 - \beta_k^2}$.`],
      teach: 'The combined boost has γ = γ₁γ₂(1 + β₁β₂): the cosh of a sum of rapidities.',
      explain: t`$\gamma = \cosh(\phi_1 + \phi_2) = \gamma_1\gamma_2(1 + \beta_1\beta_2) = \dfrac{1 + \beta_1\beta_2}{\sqrt{(1 - \beta_1^2)(1 - \beta_2^2)}}$. Check with $0.6c$ twice: $1.25^2\times1.36 = ${nice(1.5625 * 1.36)}$, and the combined speed $0.882c$ has $\gamma = 1/\sqrt{1 - 0.882^2} = ${fmt(1 / Math.sqrt(1 - (1.2 / 1.36) ** 2), 4)}$ ✓.`,
      visual: hyperbola([0.6, 1.1], t`Two frames on the hyperbola $(ct)^2 - x^2 = 1$: gold at rapidity $\phi_1$, violet at $\phi_1 + \phi_2$. The height of each point is its frame’s $\gamma = \cosh\phi$.`),
    }),
    mcq({
      id: 'square', difficulty: 3, kind: 'error',
      prompt: t`A student squares the scalar $A_\mu B^\mu$ and writes $(A_\mu B^\mu)^2 = A_\mu B^\mu A_\mu B^\mu$. What is wrong?`,
      choices: [
        t`$\mu$ now appears four times in one term; rename one pair of dummies: $A_\mu B^\mu A_\nu B^\nu$`,
        'Nothing: squaring just writes the factors twice',
        t`It should be $A_\mu A^\mu B_\mu B^\mu$`,
        t`It should be $A^2B^2$, the product of the two lengths`,
      ],
      answer: 0,
      why: {
        1: t`Written this way the sums are ambiguous: the rule “sum over a repeated index” no longer says which $A$ pairs with which $B$. Each summed index may appear exactly twice.`,
        2: t`That repeats the same index letter four times, and $(A_\mu A^\mu)(B_\nu B^\nu)$ — with the dummies renamed — is a different number, $A^2B^2$.`,
        3: 'That holds only when the two vectors are parallel. In general the square of a contraction is not the product of the two squared lengths.',
      },
      hints: ['How many times may a summed index appear in a single term?', t`A dummy index is a placeholder: $A_\mu B^\mu = A_\nu B^\nu$. Use that to keep the two sums apart.`],
      teach: 'A summed index may appear only twice in a term; when you multiply two sums, give each its own dummy letter.',
      explain: t`$(A_\mu B^\mu)^2 = (A_\mu B^\mu)(A_\nu B^\nu)$: sixteen terms, one for each pair $(\mu, \nu)$. Renaming dummies is always allowed — the letter is only a placeholder — and it keeps each index at exactly two appearances.`,
    }),
    num({
      id: 'galileo-fails', difficulty: 2,
      gen(r) {
        const b = r.pick([0.6, 0.8, 0.5]);
        const ans = -1 + b * b;
        return {
          prompt: t`Galileo’s boost $t' = t$, $x' = x - vt$ acts on $(ct, x)$ as the matrix $\Lambda^\mu{}_\nu = \begin{pmatrix} 1 & 0 \\ -\beta & 1 \end{pmatrix}$ (rows $\mu$, columns $\nu$). For $\beta = ${b}$, evaluate $\eta_{\rho\sigma}\Lambda^\rho{}_0\Lambda^\sigma{}_0$, using only $\eta_{00} = -1$ and $\eta_{11} = 1$.`,
          answer: ans, tol: { rel: 0, abs: 0.002 },
          errors: [
            { value: -1, feedback: t`$-1$ is what a Lorentz transformation gives. Compute it for this matrix: $\Lambda^1{}_0 = -\beta$ is not zero.` },
            { value: -1 - b * b, feedback: t`$\eta_{11} = +1$: the $(\Lambda^1{}_0)^2$ term is added.` },
          ],
          hints: [t`With $\mu = \nu = 0$ the double sum keeps $\eta_{00}(\Lambda^0{}_0)^2 + \eta_{11}(\Lambda^1{}_0)^2$.`, t`$\Lambda^0{}_0 = 1$ and $\Lambda^1{}_0 = -${b}$ (column 0 of the matrix).`],
          teach: t`A map preserves the interval only if $\eta_{\rho\sigma}\Lambda^\rho{}_\mu\Lambda^\sigma{}_\nu = \eta_{\mu\nu}$; Galileo’s boost fails the $(0, 0)$ condition.`,
          explain: t`$-(1)^2 + (-${b})^2 = ${nice(ans)} \neq -1 = \eta_{00}$. Galileo’s boost does not preserve the interval: a clock at rest in $S$ ($dx = 0$) would get $ds'^2 = -(1 - \beta^2)c^2dt^2$, a different proper time in different frames. Only the Lorentz boost, with its $\gamma$’s, passes the test.`,
          visual: matrix([['1', '0'], ['−β', '1']], { colors: [['ink', ink3], ['bad', 'ink']], rowLabels: ['μ = 0', '1'], colLabels: ['ν = 0', '1'], left: 'Λ =', w: 1.2, h: 0.6, caption: t`Galileo’s boost as a matrix on $(ct, x)$: time is not mixed with position ($\Lambda^0{}_1 = 0$), but position is mixed with time.` }),
        };
      },
    }),
    order({
      id: 'condition-order', difficulty: 2,
      prompt: t`Put the steps in order to derive the condition a Lorentz transformation must satisfy.`,
      items: [
        t`In the new frame, $ds^2 = \eta_{\rho\sigma}\,dx'^\rho dx'^\sigma$.`,
        t`Substitute $dx'^\rho = \Lambda^\rho{}_\mu dx^\mu$ and $dx'^\sigma = \Lambda^\sigma{}_\nu dx^\nu$, using different dummy letters.`,
        t`Collect: $ds^2 = \left(\eta_{\rho\sigma}\Lambda^\rho{}_\mu\Lambda^\sigma{}_\nu\right)dx^\mu dx^\nu$.`,
        t`Demand this equal $\eta_{\mu\nu}dx^\mu dx^\nu$ for every $dx$: $\eta_{\rho\sigma}\Lambda^\rho{}_\mu\Lambda^\sigma{}_\nu = \eta_{\mu\nu}$.`,
        t`Check the boost: the $(0, 0)$ component gives $-\gamma^2 + \gamma^2\beta^2 = -1$ ✓.`,
      ],
      hints: ['Start from the interval written in the new frame’s coordinates.', t`The condition comes from comparing coefficients of $dx^\mu dx^\nu$.`],
      teach: t`Lorentz transformations are defined as the linear maps with $\eta_{\rho\sigma}\Lambda^\rho{}_\mu\Lambda^\sigma{}_\nu = \eta_{\mu\nu}$, which is the statement that $ds^2$ is the same in every inertial frame.`,
      explain: t`Write $ds^2$ in the new coordinates, substitute the transformation with fresh dummy indices, collect the coefficient of $dx^\mu dx^\nu$, and require it to be $\eta_{\mu\nu}$. The boost of step 2 satisfies all ten independent conditions because $\gamma^2(1 - \beta^2) = 1$.`,
      visual: hyperbola([0.5, -0.4], t`What the condition means: every Lorentz transformation keeps each event on its own hyperbola $(ct)^2 - x^2 = \text{const}$, the way rotations keep points on circles. Two boosted frames’ unit ticks shown.`),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-stages', difficulty: 3, transfer: true,
      gen(r) {
        const [n, d] = r.pick([[10, 0.1], [5, 0.2], [20, 0.1], [8, 0.25]]);
        const ans = Math.tanh(n * Math.atanh(d));
        return {
          prompt: t`An interstellar probe fires ${n} identical engine stages one after another. Each stage, measured in the probe’s rest frame just before it fires, adds $${d}c$. Ignoring everything but kinematics, what is the probe’s final speed relative to its launch frame, as a fraction of $c$?`,
          answer: ans, tol: { rel: 0.002 },
          errors: [
            { value: n * d, feedback: 'Speeds do not add in relativity; each stage adds the same rapidity, not the same speed.' },
            { value: Math.tanh(Math.atanh(d) * (n - 1)), feedback: `Count all ${n} stages.` },
          ],
          hints: [t`Each stage is a boost with rapidity $\operatorname{artanh}${d}$, measured in the frame it starts from — so the rapidities add.`, t`$\beta = \tanh\left(${n}\times${fmt(Math.atanh(d), 5)}\right)$.`],
          teach: 'Staged boosts, each defined in the current rest frame, add their rapidities: after n equal stages β = tanh(n·artanh Δβ).',
          explain: t`Total rapidity $${n}\times${fmt(Math.atanh(d), 5)} = ${fmt(n * Math.atanh(d), 4)}$, so $\beta = ${fmt(ans, 4)}$. The relativistic rocket equation says the same thing for a continuous burn: the rapidity gained is $(u/c)\ln(m_\text{initial}/m_\text{final})$, where $u$ is the exhaust speed.`,
          visual: tanhGraph([{ x: round(Math.atanh(d)), y: d, color: 'gold', label: 'one stage' }], t`Speed against rapidity. Each stage moves the probe the same distance to the right along this curve, and the curve never reaches $\beta = 1$.`),
        };
      },
    }),
    mcq({
      id: 'cp-scalar', difficulty: 2,
      prompt: 'Which of these is a Lorentz scalar — a single number every inertial observer computes identically?',
      choices: [t`$\eta_{\mu\nu}A^\mu B^\nu$`, t`$A^0$`, t`$A^\mu B^\mu$, summed over $\mu$`, t`$\eta_{\mu\mu}A^\mu$, summed over $\mu$`],
      answer: 0,
      why: {
        1: t`A single component changes under a boost: $A'^0 = \gamma(A^0 - \beta A^1)$.`,
        2: t`Two upper indices are not a valid contraction: $A^0B^0 + A^1B^1 + \dots$ changes under a boost (it is the Euclidean sum, not the interval).`,
        3: t`$\mu$ appears three times — not a valid contraction — and the result is not invariant.`,
      },
      hints: ['A scalar has no free indices left over and every sum pairs one upper with one lower index.', t`Lowering with $\eta$ turns $\eta_{\mu\nu}A^\mu B^\nu$ into $A_\nu B^\nu$.`],
      teach: 'Contracting every index — one up, one down, with η doing the lowering — gives a number all inertial observers agree on.',
      explain: t`$\eta_{\mu\nu}A^\mu B^\nu = -A^0B^0 + A^1B^1 + A^2B^2 + A^3B^3$ is unchanged by any $\Lambda$ with $\eta_{\rho\sigma}\Lambda^\rho{}_\mu\Lambda^\sigma{}_\nu = \eta_{\mu\nu}$. Its components change; it does not.`,
      visual: (() => {
        const v = frames({ beta: 0.5, range: 4, xlabel: 'x', ylabel: 'ct', caption: t`One arrow $A$, two sets of axes. Its components along the black axes and along the gold ones differ; $\eta_{\mu\nu}A^\mu A^\nu$ does not.` });
        v.params.arrows = [{ from: [0, 0], to: [1.2, 2.6], color: 'violet', label: 'A' }];
        return v;
      })(),
    }),
    mcq({
      id: 'cp-gps', difficulty: 3, transfer: true,
      prompt: t`A GPS satellite broadcasts where it was and when, $x_i^\mu$, with each signal. Your receiver’s reception event $x^\mu$ lies on that emission’s light cone: $\eta_{\mu\nu}(x^\mu - x_i^\mu)(x^\nu - x_i^\nu) = 0$, one equation per satellite. Your cheap receiver clock is no good, so your own time is unknown too. How many satellites must you hear to fix your position and the time?`,
      choices: ['Four', 'Three', 'Two', 'One, if its signal is strong enough'],
      answer: 0,
      why: {
        1: 'Three equations would do for x, y and z alone — but the reception time is a fourth unknown, since the receiver clock is not trusted.',
        2: 'Two light-cone conditions leave a two-dimensional family of possible events.',
        3: 'Signal strength carries no timing information; one light-cone condition fixes only one combination of the four unknowns.',
      },
      hints: [t`Count the unknowns in $x^\mu$.`, t`Each satellite adds one equation $\eta_{\mu\nu}\,\Delta x^\mu\Delta x^\nu = 0$.`],
      teach: 'A position fix is four light-cone conditions for four unknowns: x, y, z and the receiver’s time.',
      explain: t`The unknowns are $x^0 = ct$, $x$, $y$ and $z$; each satellite’s signal contributes one null condition $\eta_{\mu\nu}\Delta x^\mu\Delta x^\nu = 0$. Four satellites give four equations for four unknowns, which is why GPS needs four in view — and why it is a timing system as much as a positioning one.`,
      visual: frames({
        events: [[4.2, 0.6, 'you receive'], [0.4, -3.2, 'sent', 'violet'], [0.8, 4, 'sent', 'violet']],
        segments: [[-0.5, -3.2, 5.4, -3.2, 'violet'], [-0.5, 4, 5.4, 4, 'violet'], [-0.5, 0.6, 5.4, 0.6, 'accent'], [0.4, -3.2, 4.2, 0.6, 'warn'], [0.8, 4, 4.2, 0.6, 'warn']],
        range: 4.5, cone: false, xlabel: 'x', ylabel: 'ct',
        caption: t`One dimension of space: two satellites (violet) each send a time-stamped signal; your reception event lies on both signals’ light cones (the 45° lines). In three dimensions there are four unknowns. Satellite motion is left out.`,
      }),
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §1.2–1.4 (Minkowski space, index notation)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), ch. 2', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Ashby (2003), Relativity in the Global Positioning System, Living Reviews in Relativity 6, 1', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/' },
  ],
});
