// Undetermined coefficients: y = y_c + y_p; a guess of the forcing's own form
// (polynomials, exponentials, sines and cosines, their products and sums);
// and the duplication rule — when the guess already solves the homogeneous
// equation, multiply by t (t² for a double root) — shown as the limit of a
// particular solution whose coefficient blows up at a characteristic root.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';
import { r6, um, co, sg, lead } from './_second.js';

const t = String.raw;
const G0 = 9.80665;

/** The forcing (blue) beside the homogeneous solutions (dashed), as a still graph. */
function forcingPic({ g, homs, x = [0, 3], y = [-1, 4], caption }) {
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', xlabel: 't', ylabel: '',
      curves: [
        ...homs.map(([fn, label, at, dy = -10]) => ({ fn, color: 'ink3', width: 1.4, dash: true, label, labelAt: at, labelDx: 6, labelDy: dy })),
        { fn: g[0], color: 'accent', width: 2.6, label: g[1], labelAt: g[2], labelDx: 6, labelDy: g[3] ?? -12 },
      ],
    },
    caption,
  };
}

export default lesson({
  id: 'math2280.DE-3.3',
  title: 'Undetermined coefficients',
  minutes: 13, difficulty: 3,
  intro: t`Every solution of a forced linear equation is the general solution of the homogeneous equation plus **one** particular solution:

$$a\,y'' + b\,y' + c\,y = g(t), \qquad y = y_c + y_p.$$

When the coefficients are constant and $g$ is built from polynomials, exponentials $e^{at}$, sines and cosines, the derivatives of $g$ stay in the same small family — so guess $y_p$ of the same form with unknown coefficients, substitute, and match. A polynomial of degree $n$ calls for a full polynomial of degree $n$; $Ke^{at}$ for $Ae^{at}$; $\cos\omega t$ or $\sin\omega t$ for $A\cos\omega t + B\sin\omega t$; products and sums for products and sums. **The one trap:** if a term of the guess already solves the homogeneous equation, the operator turns it into zero and it can match nothing. Multiply the guess by $t$ — by $t^2$ if the root is double. That is resonance, in algebra.`,
  symbols: [
    { tex: 'a,\\ b,\\ c', text: 'constant coefficients — for a spring, mass, damping and stiffness' },
    { tex: 'g(t)', text: 'the forcing: the push from outside' },
    { tex: 'y_c', text: 'the complementary solution, $c_1y_1 + c_2y_2$: the general solution of the homogeneous equation $ay\'\' + by\' + cy = 0$' },
    { tex: 'y_p', text: 'a particular solution: any single solution of the forced equation' },
    { tex: 'A,\\ B,\\ \\dots', text: 'the undetermined coefficients of the guess, fixed by substituting and matching like terms' },
    { tex: 't^s', text: 'the extra factor: $s$ is how many times the forcing’s exponent ($a$, or $a \\pm i\\omega$) is a root of the characteristic equation — 0, 1 or 2' },
  ],
  why: t`Constant pushes, ramps, exponential decays and vibrations at one frequency are most of the forcing an engineer meets; this is how their responses are found by hand, and the multiply-by-$t$ rule is the mathematics of resonance.`,
  visual: {
    type: 'graph',
    title: 'Why the guess needs a factor t',
    lead: t`Force $y'' - y' - 2y = e^{at}$, whose characteristic roots are $2$ and $-1$. The guess $Ae^{at}$ gives $A(a^2 - a - 2) = 1$, so $A = \dfrac{1}{(a - 2)(a + 1)}$ — the characteristic polynomial sits in the denominator. Slide the forcing’s exponent $a$ toward the root $2$ and watch what happens to the particular solution.`,
    tasks: [
      t`At $a = 1.01$ the guess works: $A \approx -0.50$ and $y_p = Ae^{at}$ is the blue curve.`,
      t`Slide $a$ to 1.99 or 2.01: $A$ blows up and the blue curve leaves the picture. The gold curve subtracts the homogeneous solution $Ae^{2t}$ — still a particular solution — and stays finite, settling onto $\tfrac13te^{2t}$ (dashed).`,
      t`At $a = 2$ exactly there is no $A$: $Ae^{2t}$ solves the homogeneous equation, so the operator turns it into zero. The limit says what to try instead: $Ate^{2t}$.`,
    ],
    params: {
      x: [0, 1.2], y: [-3, 6], aspect: 'wide', xlabel: 't', ylabel: 'y',
      sliders: [{ key: 'a', label: 'Forcing exponent $a$', min: 0.01, max: 2.99, step: 0.02, value: 1.01, explain: 'The forcing is $e^{at}$. The characteristic roots are 2 and −1; the slider steps over 2 itself.' }],
      curves: [
        { fn: 'x*exp(2x)/3', color: 'ink3', width: 1.6, dash: true, label: '⅓ t e²ᵗ', labelAt: 1.02, labelDx: -62, labelDy: -6 },
        { fn: 'exp(a*x)/((a - 2)*(a + 1))', color: 'accent', width: 2.4, label: 'A eᵃᵗ', labelAt: 0.15, labelDx: 6, labelDy: 14 },
        { fn: '(exp(a*x) - exp(2x))/((a - 2)*(a + 1))', color: 'gold', width: 2.4 },
      ],
      readouts: [{ label: '$A = 1/((a - 2)(a + 1))$', expr: '1/((a - 2)*(a + 1))', digits: 4 }],
    },
    caption: t`Blue: the plain particular solution $Ae^{at}$. Gold: the same minus $Ae^{2t}$, a solution of the homogeneous equation. Dashed: their common limit as $a \to 2$, $\tfrac13te^{2t}$ — which is what the multiply-by-$t$ rule finds directly.`,
  },
  example: {
    prompt: t`An undamped mass on a spring, with natural frequency $\omega_0 = 2$ rad/s, is pushed by two forces at once: a slowly growing ramp and a shaker running at exactly its natural frequency. Per unit mass,

$$y'' + 4y = 4t + 8\sin 2t, \qquad y(0) = 0,\ y'(0) = 0.$$

Find $y(t)$.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 10], y: [-12, 32], aspect: 'wide', xlabel: 't (s)', ylabel: 'y',
        curves: [
          { fn: 'x', color: 'gold', width: 1.6, dash: true, label: 'ramp part t', labelAt: 8.4, labelDx: 4, labelDy: 14 },
          { fn: '0.5*sin(2x) + x - 2x*cos(2x)', color: 'accent', width: 2.4, label: 'y(t)', labelAt: 6.6, labelDx: 8, labelDy: -6 },
        ],
      },
      caption: t`The response: an oscillation at 2 rad/s whose swings grow like $2t$, riding on the ramp $t$ (dashed). No damping, so nothing stops the growth in this model.`,
    },
    steps: [
      { label: 'Complementary solution', text: t`$r^2 + 4 = 0$ gives $r = \pm2i$, so $y_c = c_1\cos 2t + c_2\sin 2t$.` },
      { label: 'Split the forcing', text: t`The operator is linear, so find one particular solution for $4t$ and one for $8\sin 2t$, then add them.` },
      { label: 'The ramp', text: t`Guess $At + B$ (nothing in it solves the homogeneous equation). $L[At + B] = 0 + 4(At + B) = 4t$ gives $A = 1$, $B = 0$: $y_{p1} = t$.` },
      { label: 'The shaker', text: t`The plain guess $C\cos 2t + D\sin 2t$ *is* $y_c$: $L$ turns it into 0. Multiply by $t$. Since $L[t\cos 2t] = -4\sin 2t$ and $L[t\sin 2t] = 4\cos 2t$, $L[t(C\cos 2t + D\sin 2t)] = -4C\sin 2t + 4D\cos 2t = 8\sin 2t$: $C = -2$, $D = 0$, so $y_{p2} = -2t\cos 2t$.` },
      { label: 'Fit the start', text: t`$y = c_1\cos 2t + c_2\sin 2t + t - 2t\cos 2t$. $y(0) = c_1 = 0$; $y'(0) = 2c_2 + 1 - 2 = 0$ gives $c_2 = \tfrac12$.` },
      { label: 'Sense check', text: t`$y = \tfrac12\sin 2t + t - 2t\cos 2t$. Substituting: $y'' = 6\sin 2t + 8t\cos 2t$, and $y'' + 4y = 8\sin 2t + 4t$ ✓. The resonant part grows like $2t$ — in a real structure, until damping, a stop or a fracture ends it.` },
    ],
    answer: t`$y = \tfrac12\sin 2t + t - 2t\cos 2t$`,
  },
  practice: [
    mcq({
      id: 'trial-form', difficulty: 2,
      gen(r) {
        const V = r.pick([
          {
            g: t`4t^2`, gfn: '4x^2', y: [-0.5, 5],
            choices: [t`$At^2 + Bt + C$`, t`$At^2$`, t`$t(At^2 + Bt + C)$`, t`$At^2 + C$`],
            why: { 1: t`$L[At^2] = 2A + 6At + 2At^2$: the derivatives bring in $t$ and constant terms, which need coefficients of their own.`, 2: t`Multiply by $t$ only when a term of the guess solves the homogeneous equation. The roots are $-1$ and $-2$; no polynomial does.`, 3: t`The $3y'$ term turns $t^2$ into $t$, so the guess needs a $Bt$ term to absorb it.` },
            explain: t`$t^2$ and its derivatives span $\{t^2, t, 1\}$, so the guess is $At^2 + Bt + C$. None of these solves $y'' + 3y' + 2y = 0$, so no factor $t$ is needed.`,
          },
          {
            g: t`5e^{3t}`, gfn: '5*exp(3x)', y: [-0.5, 5], x: [0, 0.6],
            choices: [t`$Ae^{3t}$`, t`$Ate^{3t}$`, t`$A\cos 3t + B\sin 3t$`, t`$Ae^{3t} + Be^{-3t}$`],
            why: { 1: t`The factor $t$ is for duplication, and 3 is not a root of $r^2 + 3r + 2$ (the roots are $-1$ and $-2$).`, 2: t`An exponential forcing calls for an exponential guess; sines and cosines go with $e^{\pm3it}$, not $e^{3t}$.`, 3: t`The forcing has no $e^{-3t}$ in it, and neither do its derivatives — that term would come out 0.` },
            explain: t`$L[Ae^{3t}] = A(9 + 9 + 2)e^{3t} = 20Ae^{3t}$, so $A = \tfrac14$. Since 3 is not a characteristic root, the plain guess works.`,
          },
          {
            g: t`6e^{-t}`, gfn: '6*exp(-x)', y: [-0.5, 6.5],
            choices: [t`$Ate^{-t}$`, t`$Ae^{-t}$`, t`$At^2e^{-t}$`, t`$Ate^{-2t}$`],
            why: { 1: t`$e^{-t}$ solves $y'' + 3y' + 2y = 0$ ($-1$ is a root), so $L[Ae^{-t}] = 0$ for every $A$: it cannot produce $6e^{-t}$.`, 2: t`$t^2$ is for a double root. $-1$ is a single root of $(r + 1)(r + 2)$, so one factor $t$ is enough.`, 3: t`The guess follows the forcing, $e^{-t}$; the other root, $-2$, has nothing to do with it.` },
            explain: t`$-1$ is a simple root, so the guess is $Ate^{-t}$. Substituting: $L[te^{-t}] = (2r + 3)e^{-t}|_{r = -1} = e^{-t}$, so $A = 6$ and $y_p = 6te^{-t}$.`,
          },
          {
            g: t`10\cos 2t`, gfn: '10*cos(2x)', y: [-11, 11], x: [0, 6],
            choices: [t`$A\cos 2t + B\sin 2t$`, t`$A\cos 2t$`, t`$t(A\cos 2t + B\sin 2t)$`, t`$Ae^{2t}$`],
            why: { 1: t`The $3y'$ term turns $\cos 2t$ into $\sin 2t$, so the guess needs a sine too.`, 2: t`Multiply by $t$ only if $\pm2i$ were characteristic roots; here they are $-1$ and $-2$.`, 3: t`$e^{2t}$ is not in the forcing’s family: $\cos 2t$ goes with $e^{\pm 2it}$.` },
            explain: t`Cosines and sines turn into each other under differentiation, so both are needed: $A\cos 2t + B\sin 2t$. $\pm2i$ are not roots of $r^2 + 3r + 2$, so no factor $t$.`,
          },
          {
            g: t`t\,e^{2t}`, gfn: 'x*exp(2x)', y: [-0.5, 5], x: [0, 1.1],
            choices: [t`$(At + B)e^{2t}$`, t`$Ate^{2t}$`, t`$t(At + B)e^{2t}$`, t`$At + B$`],
            why: { 1: t`Differentiating $te^{2t}$ gives $e^{2t}$ terms too: the guess needs the constant $B$ inside.`, 2: t`2 is not a root of $r^2 + 3r + 2$, so no extra factor $t$.`, 3: t`The exponential $e^{2t}$ must stay in the guess: $L$ of a polynomial is a polynomial.` },
            explain: t`$te^{2t}$ and its derivatives span $\{te^{2t}, e^{2t}\}$, so guess $(At + B)e^{2t}$. Since 2 is not a characteristic root, no factor $t$ is needed.`,
          },
        ]);
        return {
          prompt: t`Which guess for $y_p$ should you use for $y'' + 3y' + 2y = ${V.g}$?`,
          choices: V.choices, answer: 0, why: V.why,
          hints: [t`First solve the homogeneous equation: $r^2 + 3r + 2 = (r + 1)(r + 2)$, so $y_c = c_1e^{-t} + c_2e^{-2t}$.`, t`Write the family the forcing and its derivatives live in, then check whether any member of that family is already in $y_c$.`],
          teach: 'Guess the forcing’s whole family with unknown coefficients — and multiply by t only when a member of it already solves the homogeneous equation.',
          explain: V.explain,
          visual: forcingPic({ g: [V.gfn, 'g(t)', (V.x || [0, 3])[1] * 0.55], homs: [['exp(-x)', 'e⁻ᵗ', 0.25, -8], ['exp(-2x)', 'e⁻²ᵗ', 0.5, 14]], x: V.x || [0, 3], y: V.y, caption: 'The forcing (blue) and the two homogeneous solutions (dashed). Is the forcing one of them?' }),
        };
      },
    }),
    expr({
      id: 'poly-forcing', difficulty: 2,
      gen(r) {
        const b = r.pick([2, 3, 4]), c = r.pick([1, 2, 4]), al = r.pick([1, 2, 3]), be = r.pick([-1, 1, 2]);
        const K1 = c * al, K0 = b * al + c * be;
        return {
          prompt: t`A spring-mounted sensor inside a rocket whose thrust ramps up obeys $x'' + ${b}x' + ${c === 1 ? '' : c}x = ${K1}t${sg(K0, '')}$. Find the particular solution of the form $At + B$.`,
          answer: `${al}t + (${be})`, answerTeX: t`${lead(al, 't')}${sg(be, '')}`, lhs: 'x_p(t)',
          vars: { t: [-2, 2] },
          errors: [{ answer: `${al}t + (${K0})/(${c})`, feedback: t`Substituting $At + B$ gives $${b}A + ${c === 1 ? '' : c}(At + B)$: the $x'$ term contributes the constant ${b}A, which you must include before solving for $B$.` }],
          hints: [t`$x_p = At + B$ has $x_p' = A$ and $x_p'' = 0$, so $L[x_p] = ${b}A + ${c === 1 ? '' : c}At + ${c === 1 ? '' : c}B$.`, t`Match the $t$ terms: $${c === 1 ? '' : c}A = ${K1}$. Match the constants: $${b}A + ${c === 1 ? '' : c}B = ${K0}$.`],
          teach: 'For a polynomial forcing, substitute a full polynomial of the same degree and match the coefficients of each power of t.',
          explain: t`$${c === 1 ? '' : c}A = ${K1}$ gives $A = ${al}$; then $${b}(${al}) + ${c === 1 ? '' : c}B = ${K0}$ gives $B = ${be}$. So $x_p = ${lead(al, 't')}${sg(be, '')}$: the sensor’s offset follows the ramp, slightly delayed by the damping term.`,
          visual: forcingPic({ g: [`${K1}*x + ${K0}`, 'forcing', 2.2, 14], homs: [], x: [0, 3], y: [Math.min(-1, K0 - 2), K1 * 3 + K0 + 2], caption: 'The ramp forcing: it grows steadily as the thrust builds. A polynomial of degree 1, so the guess is one too.' }),
        };
      },
    }),
    expr({
      id: 'exp-duplicate', difficulty: 3,
      gen(r) {
        const [r1, r2] = r.pick([[2, -1], [1, -3], [-1, -4], [3, 1]]), m = r.pick([1, 2, 3]);
        const K = m * (r1 - r2), d = r1 - r2, q = m / d;
        const b = -(r1 + r2), c = r1 * r2;
        return {
          prompt: t`Solve $y''${sg(b, "y'")}${sg(c, 'y')} = ${K}e^{${co(r1)}t}$ with $y(0) = 0$ and $y'(0) = 0$.`,
          answer: `${m}*t*e^(${r1}*t) + (${q})*(e^(${r2}*t) - e^(${r1}*t))`,
          answerTeX: t`${co(m)}te^{${co(r1)}t} + ${frac(q)}\left(e^{${co(r2)}t} - e^{${co(r1)}t}\right)`, lhs: 'y(t)',
          vars: { t: [0, 1] },
          errors: [{ answer: `${m}*t*e^(${r1}*t)`, feedback: t`That is a particular solution, but its slope at $t = 0$ is ${m}, not 0. Add $c_1e^{${co(r1)}t} + c_2e^{${co(r2)}t}$ and fit the initial conditions.` }],
          hints: [t`The roots are $${r1}$ and $${r2}$: the forcing $e^{${co(r1)}t}$ already solves the homogeneous equation, so guess $y_p = Ate^{${co(r1)}t}$.`, t`$L[te^{${co(r1)}t}] = (2\cdot${r1}${sg(b, '')})e^{${co(r1)}t} = ${d}e^{${co(r1)}t}$, so $A = ${m}$. Then $y = ${co(m)}te^{${co(r1)}t} + c_1e^{${co(r1)}t} + c_2e^{${co(r2)}t}$ with $c_1 + c_2 = 0$ and $${m} + ${r1}c_1 + (${r2})c_2 = 0$.`],
          teach: t`When the forcing’s exponent is a simple characteristic root, guess $Ate^{rt}$; the initial conditions then fix $y_c$ on top.`,
          explain: t`$y_p = ${co(m)}te^{${co(r1)}t}$. With $y_c = c_1e^{${co(r1)}t} + c_2e^{${co(r2)}t}$: $c_1 + c_2 = 0$ and $${m} + ${r1}c_1 + (${r2})c_2 = 0$ give $c_1 = ${frac(-q)}$, $c_2 = ${frac(q)}$. So $y = ${co(m)}te^{${co(r1)}t} + ${frac(q)}\left(e^{${co(r2)}t} - e^{${co(r1)}t}\right)$.`,
          visual: forcingPic({ g: [`${K}*exp(${r1}*x)`, 'forcing', 0.3, -12], homs: [[`exp(${r1}*x)`, `e^(${um(r1)}t)`, 0.7, 14], [`exp(${r2}*x)`, `e^(${um(r2)}t)`, 0.15, 14]], x: [0, 1], y: [-0.5, Math.max(4, 1.15 * K * Math.max(1, Math.exp(r1)))], caption: 'The forcing (blue) and the two homogeneous solutions (dashed): the forcing is a multiple of one of them.' }),
        };
      },
    }),
    expr({
      id: 'double-root', difficulty: 3,
      gen(r) {
        const rr = r.pick([1, -1, 2, -2]), K = r.pick([2, 4, 6]), h = K / 2;
        return {
          prompt: t`Solve $y''${sg(-2 * rr, "y'")}${sg(rr * rr, 'y')} = ${K}e^{${co(rr)}t}$ with $y(0) = 0$ and $y'(0) = 0$.`,
          answer: `${h}*t^2*e^(${rr}*t)`, answerTeX: t`${co(h)}t^2e^{${co(rr)}t}`, lhs: 'y(t)',
          vars: { t: [0, 1.5] },
          errors: [
            { answer: `${K}*t*e^(${rr}*t)`, feedback: t`$te^{${co(rr)}t}$ is a homogeneous solution too — the root ${rr} is double. Multiply by $t^2$.` },
            { answer: `${K}*t^2*e^(${rr}*t)`, feedback: t`$L[t^2e^{${co(rr)}t}] = 2e^{${co(rr)}t}$: divide the forcing by 2.` },
          ],
          hints: [t`$r^2${sg(-2 * rr, 'r')}${sg(rr * rr, '')} = (r ${rr > 0 ? '-' : '+'} ${Math.abs(rr)})^2$: a double root, so $e^{${co(rr)}t}$ and $te^{${co(rr)}t}$ are both homogeneous solutions. Guess $At^2e^{${co(rr)}t}$.`, t`For a double root, $L[t^2e^{rt}] = 2e^{rt}$, so $A = ${h}$ — and $${co(h)}t^2e^{${co(rr)}t}$ already has value and slope 0 at $t = 0$.`],
          teach: t`When the forcing’s exponent is a double root, both $e^{rt}$ and $te^{rt}$ are taken: guess $At^2e^{rt}$.`,
          explain: t`$y_p = ${co(h)}t^2e^{${co(rr)}t}$, since $L[t^2e^{${co(rr)}t}] = 2e^{${co(rr)}t}$. It starts with $y = y' = 0$, so $y_c = 0$ and $y = ${co(h)}t^2e^{${co(rr)}t}$.`,
          visual: forcingPic({ g: [`${K}*exp(${rr}*x)`, 'forcing', 0.2, -12], homs: [[`exp(${rr}*x)`, rr === 1 ? 'eᵗ' : rr === -1 ? 'e⁻ᵗ' : rr === 2 ? 'e²ᵗ' : 'e⁻²ᵗ', 0.9, 14], [`x*exp(${rr}*x)`, rr === 1 ? 't eᵗ' : rr === -1 ? 't e⁻ᵗ' : rr === 2 ? 't e²ᵗ' : 't e⁻²ᵗ', 1.25, -10]], x: [0, 1.5], y: [-0.3, Math.max(3.5, 1.1 * K * Math.exp(Math.max(0, rr * 1.5)))], caption: t`The forcing (blue) and the two homogeneous solutions it collides with (dashed): both are already in $y_c$.` }),
        };
      },
    }),
    mcq({
      id: 'damped-at-w0', difficulty: 2,
      prompt: t`A lightly damped oscillator, $y'' + 0.5y' + 4y = 3\cos 2t$, is driven exactly at its undamped natural frequency $\omega_0 = 2$ rad/s. Which guess for $y_p$?`,
      choices: [t`$A\cos 2t + B\sin 2t$`, t`$t(A\cos 2t + B\sin 2t)$`, t`$A\cos 2t$`, t`$At\cos 2t$`],
      answer: 0,
      why: {
        1: t`The factor $t$ is needed only if $\cos 2t$ solves the homogeneous equation. With damping the roots are $-0.25 \pm 1.98i$, not $\pm2i$, so it does not.`,
        2: t`The damping term turns $\cos 2t$ into $\sin 2t$: the guess needs both.`,
        3: t`No duplication here, so no $t$ — and a lone cosine misses the sine the damping term creates.`,
      },
      hints: [t`Find the characteristic roots of $r^2 + 0.5r + 4$. Is $2i$ one of them?`, t`$r = -0.25 \pm i\sqrt{3.9375}$: the forcing $\cos 2t$ is not a homogeneous solution.`],
      teach: 'Multiply by t only when the forcing truly duplicates a homogeneous solution — with any damping, driving at ω₀ does not.',
      explain: t`$L[A\cos 2t + B\sin 2t] = 0.5(-2A\sin 2t + 2B\cos 2t) + (4 - 4)(\dots) = B\cos 2t - A\sin 2t$, so $B = 3$, $A = 0$: $y_p = 3\sin 2t$, a steady oscillation of amplitude 3 — large, a quarter cycle behind the drive, but bounded.`,
      visual: { type: 'c3-roots', params: { mode: 'forced', zeta: 0.125, w0: 2, W: 1, T: 30, sliders: false, readout: false, panels: 'motion', yname: 'y' }, caption: 'The motion from rest under this drive (in units of the static deflection): it builds up, then levels off. Damping caps it, so there is no t-growth.' },
    }),
    expr({
      id: 'sum-forcing', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 4]), al = r.pick([1, 2, 3]), be = r.pick([1, 2, -1]);
        const P = k * al, E = (1 + k) * be;
        return {
          prompt: t`Using the guess $y_p = At + B + Ce^{t}$, find the particular solution of $y'' + ${k === 1 ? '' : k}y = ${P}t${sg(E, 'e^{t}')}$.`,
          answer: `${al}t + (${be})*e^t`, answerTeX: t`${lead(al, 't')}${sg(be, 'e^{t}')}`, lhs: 'y_p(t)',
          vars: { t: [-1, 1] },
          errors: [{ answer: `${al}t + (${E / k})*e^t`, feedback: t`$L[Ce^t] = Ce^t + ${k === 1 ? '' : k}Ce^t = ${1 + k}Ce^t$: the $y''$ term contributes too.` }],
          hints: [t`Superposition: treat $${P}t$ and $${E}e^t$ separately.`, t`$L[At + B] = ${k === 1 ? '' : k}At + ${k === 1 ? '' : k}B$ and $L[Ce^t] = ${1 + k}Ce^t$.`],
          teach: 'A forcing that is a sum is handled term by term: the particular solutions add.',
          explain: t`$${k === 1 ? '' : k}A = ${P}$, $${k === 1 ? '' : k}B = 0$ and $${1 + k}C = ${E}$, so $y_p = ${lead(al, 't')}${sg(be, 'e^{t}')}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 2], y: [Math.min(-1, 2 * E), P * 2 + Math.max(0, E * 7.5) + 1], aspect: 'wide', xlabel: 't', ylabel: '',
              curves: [
                { fn: `${P}*x`, color: 'violet', width: 2, dash: true, label: 'ramp part', labelAt: 1.6, labelDx: 6, labelDy: 14 },
                { fn: `${E}*exp(x)`, color: 'teal', width: 2, dash: true, label: 'exponential part', labelAt: 1.2, labelDx: -100, labelDy: E > 0 ? -10 : 14 },
                { fn: `${P}*x + ${E}*exp(x)`, color: 'accent', width: 2.6, label: 'g(t)', labelAt: 1.85, labelDx: -30, labelDy: -10 },
              ],
            },
            caption: 'The forcing (blue) is the sum of a ramp and an exponential (dashed); its particular solution is the sum of theirs.',
          },
        };
      },
    }),
    mcq({
      id: 'resonance-missed', difficulty: 2, kind: 'error',
      prompt: t`For $y'' + 9y = 6\sin 3t$ a student guesses $y_p = A\sin 3t$, substitutes, gets $0 = 6\sin 3t$, and concludes: “there is no solution — resonance makes the equation unsolvable.” What is wrong?`,
      choices: [
        t`$\sin 3t$ solves $y'' + 9y = 0$, so the guess must be $t(A\cos 3t + B\sin 3t)$; it gives $y_p = -t\cos 3t$`,
        t`Nothing: an undamped oscillator driven at resonance has no solution`,
        t`The guess only lacks a cosine: $A\cos 3t + B\sin 3t$ works`,
        t`The coefficient $A$ is infinite, so $y$ is infinite at every $t$`,
      ],
      answer: 0,
      why: {
        1: t`The existence theorem guarantees a solution for every $t$: the coefficients and the forcing are continuous. Resonance changes its *form*, not its existence.`,
        2: t`$A\cos 3t + B\sin 3t$ is still all homogeneous: $L$ turns every such combination into 0.`,
        3: t`The solution is finite at every finite $t$; it is its amplitude that grows, like $t$.`,
      },
      hints: [t`What does $L$ do to $\sin 3t$ and $\cos 3t$?`, t`Both solve the homogeneous equation, so multiply the guess by $t$.`],
      teach: 'A guess that duplicates a homogeneous solution cannot match the forcing — multiply it by t, and the resonant solution appears.',
      explain: t`$L[t\cos 3t] = -6\sin 3t$ and $L[t\sin 3t] = 6\cos 3t$, so $t(A\cos 3t + B\sin 3t)$ gives $-6A\sin 3t + 6B\cos 3t = 6\sin 3t$: $A = -1$, $B = 0$, $y_p = -t\cos 3t$ — an oscillation whose amplitude grows linearly.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [-7, 7], aspect: 'wide', xlabel: 't', ylabel: '',
          curves: [
            { fn: '6*sin(3x)', color: 'accent', width: 2.4, label: 'forcing 6 sin 3t', labelAt: 0.5, labelDx: 6, labelDy: -10 },
            { fn: 'sin(3x)', color: 'ink3', width: 1.4, dash: true, label: 'homogeneous sin 3t', labelAt: 2.6, labelDx: 6, labelDy: 14 },
          ],
        },
        caption: 'The forcing (blue) and a solution of the homogeneous equation (dashed): the same shape, at the same frequency.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-accelerometer', difficulty: 3, transfer: true,
      gen(r) {
        const f0 = r.pick([2, 5, 10]), ag = r.pick([1, 5, 20]);
        const w0 = 2 * Math.PI * f0 * 1e3, a = ag * G0;
        const x = (a / (w0 * w0)) * 1e9;
        return {
          prompt: t`In a MEMS accelerometer a proof mass of a few micrograms hangs on silicon springs. When the chip accelerates steadily at $a$, the mass’s displacement relative to the chip obeys $x'' + 2\zeta\omega_0x' + \omega_0^2x = -a$. The resonant frequency is $f_0 = ${f0}$ kHz. How far, in nanometres, does the mass settle from its rest position under a steady ${ag} g ($1\ g = 9.807$ m/s²)?`,
          answer: x, units: 'nm', tol: { rel: 0.01 },
          errors: [
            { value: (a / ((f0 * 1e3) ** 2)) * 1e9, feedback: t`Use the angular frequency: $\omega_0 = 2\pi f_0$, then $x = a/\omega_0^2$.` },
            { value: (a / w0) * 1e9, feedback: t`The constant forcing is balanced by the spring term alone: $\omega_0^2x = -a$, so divide by $\omega_0^2$, not $\omega_0$.` },
          ],
          hints: [t`The forcing is a constant, so guess a constant $x_p = A$: its derivatives vanish.`, t`$\omega_0^2A = -a$, so $|x_p| = a/\omega_0^2$ with $\omega_0 = 2\pi\times${f0}\times10^3$ rad/s.`],
          teach: 'A constant forcing has a constant particular solution — the static deflection — which is exactly what an accelerometer reads.',
          explain: t`$\omega_0 = 2\pi\times${f0}\times10^3 = ${fmt(w0, 3)}$ rad/s, so $|x_p| = a/\omega_0^2 = ${fmt(a, 3)}/(${fmt(w0, 3)})^2 = ${fmt(x, 3)}$ nm. The damping never enters the steady value; it only decides how quickly the mass settles. Displacements of nanometres per g are read by measuring the capacitance between the mass and fixed fingers.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3], y: [-1.25, 0.15], yticks: 0, aspect: 'wide', xlabel: 't (periods of the resonance)', ylabel: 'x (no scale)',
              curves: [{ fn: '-(1 - exp(-0.6*2*pi*x)*(cos(0.8*2*pi*x) + 0.75*sin(0.8*2*pi*x)))', color: 'accent', width: 2.4 }],
              hlines: [{ y: -1, label: 'settled deflection', color: 'gold' }],
            },
            caption: 'The proof mass after the acceleration switches on, for a damping ratio of 0.6 (deflection axis unnumbered): a brief overshoot, then it settles at the static deflection. Time in periods of the resonance.',
          },
        };
      },
    }),
    expr({
      id: 'cp-resonant-ivp', difficulty: 3,
      gen(r) {
        const w = r.pick([2, 3]), m = r.pick([1, 2]);
        const F = 2 * w * m;
        return {
          prompt: t`Solve $y'' + ${w * w}y = ${F}\sin ${w}t$ with $y(0) = 0$ and $y'(0) = 0$.`,
          answer: `${m}/${w}*sin(${w}*t) - ${m}*t*cos(${w}*t)`,
          answerTeX: t`${frac(m / w)}\sin ${w}t - ${co(m)}t\cos ${w}t`, lhs: 'y(t)',
          vars: { t: [0, 3] },
          hints: [t`$\sin ${w}t$ solves $y'' + ${w * w}y = 0$: guess $t(A\cos ${w}t + B\sin ${w}t)$.`, t`$L[t\cos ${w}t] = -${2 * w}\sin ${w}t$, so $A = -${m}$, $B = 0$. Then fit $c_1\cos ${w}t + c_2\sin ${w}t$ to the start.`],
          teach: t`At exact resonance the guess is $t$ times the usual one; the initial conditions then fix $y_c$ as usual.`,
          explain: t`$y_p = -${co(m)}t\cos ${w}t$ (from $L[t\cos ${w}t] = -${2 * w}\sin ${w}t$). Then $y = c_1\cos ${w}t + c_2\sin ${w}t - ${co(m)}t\cos ${w}t$: $y(0) = c_1 = 0$ and $y'(0) = ${w}c_2 - ${m} = 0$ give $c_2 = ${frac(m / w)}$.`,
          visual: { type: 'c3-roots', params: { mode: 'forced', zeta: 0, w0: w, W: 1, T: r6(30 / w), sliders: false, readout: false, panels: 'motion', yname: 'y' }, caption: 'An undamped oscillator driven exactly at its natural frequency, from rest: swings that grow without limit (vertical scale arbitrary).' },
        };
      },
    }),
    mcq({
      id: 'cp-product-trial', difficulty: 3,
      prompt: t`Which guess for $y_p$ is right for $y'' + 4y = t\sin 2t$?`,
      choices: [
        t`$t\big[(At + B)\cos 2t + (Ct + D)\sin 2t\big]$`,
        t`$(At + B)\cos 2t + (Ct + D)\sin 2t$`,
        t`$t(A\cos 2t + B\sin 2t)$`,
        t`$t^2(A\cos 2t + B\sin 2t)$`,
      ],
      answer: 0,
      why: {
        1: t`Its $B\cos 2t$ and $D\sin 2t$ terms solve $y'' + 4y = 0$ and come out 0: the whole guess must be multiplied by $t$.`,
        2: t`The forcing has a factor $t$, so the polynomials in front of $\cos$ and $\sin$ must be of degree 1, before the duplication factor.`,
        3: t`Close, but the lower-degree terms are missing: after multiplying by $t$ you need $At^2 + Bt$, not just $At^2$.`,
      },
      hints: [t`Without duplication the guess for $t\sin 2t$ would be $(At + B)\cos 2t + (Ct + D)\sin 2t$.`, t`$\pm2i$ are roots of $r^2 + 4$, so that whole guess gets one factor $t$.`],
      teach: t`Build the guess for the forcing’s family first, then multiply the whole of it by $t^s$.`,
      explain: t`The family of $t\sin 2t$ needs degree-1 polynomials times $\cos 2t$ and $\sin 2t$. Since $2i$ is a simple characteristic root, multiply everything by $t$: $t[(At + B)\cos 2t + (Ct + D)\sin 2t]$. (It works out to $y_p = -\tfrac18t^2\cos 2t + \tfrac1{16}t\sin 2t$.)`,
      visual: forcingPic({ g: ['x*sin(2x)', 'forcing t sin 2t', 4.2, -12], homs: [['sin(2x)', 'sin 2t', 1.9, 16]], x: [0, 6], y: [-6, 6], caption: 'The forcing (blue), whose oscillating part has the same frequency as a homogeneous solution (dashed).' }),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §2.5 Nonhomogeneous equations', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'OpenStax Calculus Vol. 3, §7.2 Nonhomogeneous linear equations', url: 'https://openstax.org/books/calculus-volume-3/pages/7-2-nonhomogeneous-linear-equations' },
  ],
});
