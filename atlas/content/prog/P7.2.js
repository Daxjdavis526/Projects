// The step-size trade-off — truncation error falls with h, round-off error
// grows as ε|f|/h; the V-shaped total, the optimal h ≈ √ε (forward) and ∛ε
// (central) times the scale of x, the step that is not what you typed,
// noise in measured data, and the complex step.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { lg, ulp, forward, central, EPS, EPS32, normals } from './_numkit.js';

const t = String.raw;

// the V-shaped error of sin′(1), computed in double precision for pictures
const HS = Array.from({ length: 65 }, (_, k) => -16 + k / 4);
const VF = HS.map((L) => [L, Math.abs(forward(Math.sin, 1, 10 ** L) - Math.cos(1))]).filter(([, e]) => e > 0);
const VC = HS.map((L) => [L, Math.abs(central(Math.sin, 1, 10 ** L) - Math.cos(1))]).filter(([, e]) => e > 0);

// the worked example: dT/da for a geostationary orbit, T = 2π√(a³/GM) (a*a*a, as the Python is written)
const GM = 3.986004418e14, A = 42164.17e3;
const T = (a) => 2 * Math.PI * Math.sqrt((a * a * a) / GM), D_EXACT = (3 * T(A)) / (2 * A);
const GEO = [1e-8, 1e-3, 1, 250, 1e5].map((h) => ({ h, rel: (central(T, A, h) - D_EXACT) / D_EXACT }));
const H_EFF = (A + 1e-8) - A;
// (x, h) pairs for which the step actually taken differs from h by more than 2%
const HEFF = [['Earth’s radius in metres', 6.371e6], ['the geostationary radius in metres', 42164.17e3], ['the Moon’s distance in metres', 3.844e8]]
  .flatMap(([w, x]) => [1e-8, 3e-8, 1e-7].map((h) => [w, x, h])).filter(([, x, h]) => (x + h) - x > 0 && Math.abs(((x + h) - x) / h - 1) > 0.02);

export default lesson({
  id: 'prog.P7.2',
  title: 'The step-size trade-off',
  minutes: 11, difficulty: 3,
  intro: t`Shrinking $h$ shrinks the truncation error — until round-off strikes back. For tiny $h$, $f(x + h)$ and $f(x)$ agree in almost every digit, and their difference is catastrophic cancellation: an error of about $\varepsilon\lvert f\rvert$, divided by $h$. For a forward difference the total is

$$E(h) \approx \underbrace{\frac{h}{2}\lvert f''\rvert}_{\text{truncation}} + \underbrace{\frac{\varepsilon\lvert f\rvert}{h}}_{\text{round-off}}, \qquad h^* = \sqrt{\frac{2\varepsilon\lvert f\rvert}{\lvert f''\rvert}}$$

a V on log–log axes, smallest at $h^*$. When $f$ and its derivatives share one scale, the rule of thumb is $h^* \approx \sqrt{\varepsilon} \approx 10^{-8}$ times the scale of $x$, leaving about half the digits. The central difference, with truncation $\tfrac{h^2}{6}\lvert f'''\rvert$, does best near $h^* \approx \sqrt[3]{\varepsilon} \approx 6\times10^{-6}$ times that scale, keeping about two-thirds of them.`,
  symbols: [
    { tex: 'E(h)', text: 'the total error of the derivative estimate for step $h$' },
    { tex: 'h', text: 'the step, in the units of $x$' },
    { tex: t`\lvert f\rvert,\ \lvert f''\rvert`, text: 'the size of the function and of its second derivative near $x$' },
    { tex: t`\varepsilon`, text: 'machine epsilon, $2.2\\times10^{-16}$ (or the relative noise of $f$, if $f$ comes from a measurement or a solver that is less precise than that)' },
    { tex: 'h^*', text: 'the step that makes the total error smallest, where the two terms are about equal' },
  ],
  why: 'Every numerical derivative — in a root finder, an optimizer, a Jacobian for an implicit ODE solver — needs a step, and the wrong one silently costs half your digits or all of them.',
  visual: {
    type: 'code-runner',
    title: 'The V',
    lead: t`Press **Run**. The derivative of $\sin x$ at $x = 1$ is estimated for 161 steps from $10^{-16}$ to 1. Right of the dotted lines, truncation dominates (slopes 1 and 2); left of them, round-off (slope −1, ragged because it is round-off). The thin lines are the error model; the dotted lines mark $\sqrt\varepsilon$ and $\sqrt[3]\varepsilon$.`,
    tasks: [
      'Read the printed best steps and errors: the forward difference bottoms out near 10⁻⁸, the central one near 10⁻⁵.',
      'Try the complex step, which subtracts nothing: add `err_cs = np.abs(np.imag(np.sin(x + 1j * h)) / h - df(x))` and plot it. It stays at round-off level even for h = 10⁻¹⁶.',
      'Change x to 1000.0: the V moves right, because the right step scales with x.',
    ],
    params: {
      rows: 25,
      code: t`import numpy as np
import matplotlib.pyplot as plt

f, df, x = np.sin, np.cos, 1.0
eps = np.finfo(float).eps
h = np.logspace(-16, 0, 161)

err_f = np.abs((f(x + h) - f(x)) / h - df(x))
err_c = np.abs((f(x + h) - f(x - h)) / (2 * h) - df(x))
for name, err in [("forward", err_f), ("central", err_c)]:
    k = np.argmin(err)
    print(f"{name}: best h = {h[k]:.1e}, smallest error = {err[k]:.1e}")

fig, ax = plt.subplots()
ax.loglog(h, err_f, ".", ms=4, label="forward")
ax.loglog(h, err_c, ".", ms=4, label="central")
ax.loglog(h, h / 2 * abs(np.sin(x)) + eps * abs(f(x)) / h, color="C0", lw=1, alpha=0.6)
ax.loglog(h, h**2 / 6 * abs(np.cos(x)) + eps * abs(f(x)) / h, color="C1", lw=1, alpha=0.6)
ax.axvline(np.sqrt(eps), ls=":", color="C0")
ax.axvline(eps ** (1 / 3), ls=":", color="C1")
ax.set_ylim(1e-12, 10)
ax.set_xlabel("step h")
ax.set_ylabel("|error| in f′(1)")
ax.legend()
plt.show()`,
    },
    caption: 'The round-off half of the V is noisy: individual points can land lucky, well below the model. Trust the model’s minimum (about 10⁻⁸ and 3 × 10⁻¹¹ here), not the lowest dot.',
  },
  example: {
    prompt: t`A station-keeping planner needs $dT/da$, the change in orbital period per metre of orbit radius, at geostationary radius $a = 42\,164$ km, where $T = 2\pi\sqrt{a^3/GM}$. Pretend there is no formula for it: choose $h$ for a central difference, and check the result against the exact $dT/da = 3T/(2a)$.`,
    visual: {
      type: 'graph',
      params: { x: [-8.5, 5.5], y: [-11.5, -0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (m)', ylabel: 'relative error of dT/da',
        curves: [{ fn: `${lg(2 * A / 3 * EPS / A)} - x + ${lg(A)}`, color: 'ink3', dash: true, domain: [-8.2, 3.6] }, { fn: `2*x - ${lg(24 * A * A)}`, color: 'ink3', dash: true, domain: [0.6, 5.3] }],
        points: GEO.map(({ h, rel }) => ({ x: lg(h), y: lg(Math.abs(rel)), color: 'gold', r: 4.5, labelDx: h > 1e4 ? -78 : 8, label: `h = ${{ 1e-8: '10⁻⁸', 1e-3: '10⁻³', 1: '1', 250: '250', 1e5: '10⁵' }[h]} m`, labelDy: -6 })) },
      caption: 'The five steps tried, against the two error laws (dashed): round-off ∝ 1/h on the left, truncation ∝ h² on the right. Computed in double precision.',
    },
    steps: [
      { label: 'Scale the step', text: t`The textbook $h = 10^{-8}$ is meaningless here: near $a = 4.2\times10^7$ m floats are $${tex(ulp(A))}$ m apart, so \`(a + 1e-8) - a\` is \`${String(H_EFF).replace('e-9', 'e-09')}\` — the step you get is not the step you asked for, and the difference of the periods is all round-off. The step must be a fraction of $a$ itself.` },
      { label: 'Choose h', text: t`For a central difference, $h^* \approx \sqrt[3]{\varepsilon}\,a = 6\times10^{-6}\times4.2\times10^{7} \approx 250$ m. (With the full model, $\lvert T\rvert/\lvert T'''\rvert = 8a^3/3$ gives $h^* = 2\sqrt[3]{\varepsilon}\,a \approx 510$ m: the bottom of the V is broad.)` },
      { label: 'Try it', text: t`\`\`\`python
import math
GM, a = 3.986004418e14, 42164.17e3
T = lambda a: 2 * math.pi * math.sqrt(a * a * a / GM)
exact = 3 * T(a) / (2 * a)
for h in [1e-8, 1e-3, 1.0, 250.0, 1e5]:
    est = (T(a + h) - T(a - h)) / (2 * h)
    print(h, est / exact - 1)
\`\`\`

The relative errors: ${GEO.map(({ h, rel }) => `$${tex(rel, 2)}$ at ${h >= 1 && h < 1e5 ? h : `$${tex(h, 1)}$`} m`).join(', ')}.` },
      { label: 'Sense check', text: t`At 250 m the error is $${tex(GEO[3].rel, 2)}$, close to the $\sim\varepsilon^{2/3}$ the model promises, and hundreds of times better than $h = 1$ m. The answer, $dT/da = ${tex(D_EXACT, 4)}$ s/m, means 1 km of radius changes the period by ${(D_EXACT * 1000).toFixed(2)} s: a satellite parked 1 km too high drifts west by ${(D_EXACT * 1000 / T(A) * 360).toFixed(4)}° a day.` },
    ],
    answer: t`$h \approx 250$ m (not $10^{-8}$); the central difference then matches $3T/(2a) = ${tex(D_EXACT, 4)}$ s/m to about $10^{-11}$, while $h = 10^{-8}$ m is ${(100 * Math.abs(GEO[0].rel)).toFixed(0)}% wrong.`,
  },
  practice: [
    mcq({
      id: 'read-v', difficulty: 1,
      prompt: t`This is the error of a forward difference against the step $h$. What dominates the error on the **left** side of the V?`,
      visual: {
        type: 'graph',
        params: { x: [-16.3, 0.3], y: [-10, 0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: '|error|',
          points: VF.map(([L, e]) => ({ x: L, y: lg(e), color: 'accent', r: 2.6 })) },
        caption: 'The forward-difference error of sin′(1), computed in double precision.',
      },
      choices: ['Round-off: f(x + h) and f(x) agree in most digits, and their difference is divided by a tiny h', 'Truncation: the Taylor terms left out of the formula', 'Overflow: h is too small to be stored', 'The derivative itself becomes inaccurate as h shrinks, because sin x is curved'],
      answer: 0,
      why: {
        1: 'Truncation error grows with h: it dominates the right side, where the line rises with slope 1.',
        2: '10⁻¹⁶ is an ordinary float; nothing overflows or underflows here.',
        3: 'Curvature sets the truncation error, which shrinks as h shrinks.',
      },
      hints: ['On the left, the error grows as h shrinks. Which error term behaves like that?', 'ε|f|/h grows as h → 0.'],
      teach: 'The right arm of the V is truncation (∝ hᵖ); the left arm is round-off (∝ ε|f|/h). The best h sits where they meet.',
      explain: t`On the left the error rises with slope −1, the signature of $\varepsilon\lvert f\rvert/h$: $f(x+h) - f(x)$ is a difference of nearly equal numbers whose rounding errors, about $10^{-16}$, are divided by $h$. Making $h$ smaller there only makes things worse.`,
    }),
    num({
      id: 'optimal-h', difficulty: 2,
      gen(r) {
        const method = r.pick(['forward', 'central']), [prec, eps] = r.pick([['double precision (float64)', EPS], ['single precision (float32)', EPS32]]);
        const [xs, xc] = r.pick([['at $x = 1$', 1], ['of a pressure in pascals at $x = 10^5$ Pa', 1e5], ['at a distance of $x = 1000$ m', 1e3]]);
        const hstar = (method === 'forward' ? Math.sqrt(eps) : Math.cbrt(eps)) * xc;
        return {
          prompt: t`You will differentiate a smooth function ${xs} with a **${method}** difference in ${prec}, where $\varepsilon = ${tex(eps)}$. Using the rule of thumb $h^* \approx ${method === 'forward' ? t`\sqrt{\varepsilon}` : t`\sqrt[3]{\varepsilon}`}\times(\text{the scale of } x)$, what step should you use?`,
          answer: hstar, tol: { rel: 0.02 },
          errors: [{ value: (method === 'forward' ? Math.cbrt(eps) : Math.sqrt(eps)) * xc, feedback: method === 'forward' ? 'That is the central-difference rule (cube root). A forward difference balances h against ε/h: square root.' : 'That is the forward-difference rule (square root). A central difference balances h² against ε/h: cube root.' }, ...(xc !== 1 ? [{ value: (method === 'forward' ? Math.sqrt(eps) : Math.cbrt(eps)), feedback: `Scale the step with x: here x is about ${xc}.` }] : []), { value: eps * xc, feedback: 'A step of ε is far too small: the round-off error ε|f|/h would be of order 1.' }],
          hints: [method === 'forward' ? t`Forward: balance $h$ against $\varepsilon/h$, so $h \sim \sqrt\varepsilon$.` : t`Central: balance $h^2$ against $\varepsilon/h$, so $h \sim \sqrt[3]\varepsilon$.`, t`$${method === 'forward' ? '\\sqrt' : '\\sqrt[3]'}{${tex(eps)}} = ${tex(method === 'forward' ? Math.sqrt(eps) : Math.cbrt(eps))}$; multiply by ${xc}.`],
          teach: 'Pick h ≈ √ε·|x| for forward and ∛ε·|x| for central differences (use max(|x|, 1) near zero) — never a fixed number like 10⁻⁸.',
          explain: t`$h^* \approx ${tex(hstar)}$. The step scales with $x$ because both the truncation term and the smallest representable change in $x$ do. In ${prec} you keep only about ${method === 'forward' ? 'half' : 'two-thirds'} of its ${eps === EPS ? 16 : 7} digits in the derivative${eps === EPS32 ? ' — about ' + (method === 'forward' ? '3 or 4' : '4 or 5') : ''}.`,
        };
      },
    }),
    mcq({
      id: 'why-worse', difficulty: 2,
      prompt: t`Why is the forward difference of $\sin x$ at $x = 1$ worse with $h = 10^{-12}$ than with $h = 10^{-8}$?

\`\`\`python
>>> print(f"{math.sin(1 + 1e-12):.17f}")
0.84147098480843925
>>> print(f"{math.sin(1):.17f}")
0.84147098480789650
\`\`\``,
      choices: [
        'The two sines agree in their first 12 digits, so their difference keeps only about 4; dividing by h does not restore the lost digits',
        'Truncation error grows as h shrinks',
        'math.sin is less accurate for arguments very close to 1',
        'h = 10⁻¹² underflows to zero',
      ],
      answer: 0,
      why: {
        1: 'Truncation error is (h/2)|f″|, which shrinks with h.',
        2: '`math.sin` is accurate to within a unit in the last place for any ordinary argument.',
        3: 'Floats reach down to 10⁻³⁰⁸; 10⁻¹² is nowhere near underflow.',
      },
      hints: ['Compare the two printed values digit by digit.', 'How many digits does the difference keep, if each value is reliable only to about 16 digits?'],
      teach: 'The round-off error of a difference quotient is about ε|f|/h: shrinking h past the optimum trades a little truncation for a lot of cancellation.',
      explain: t`The values share 12 leading digits, so the difference, about $5.4\times10^{-13}$, carries only 4 significant digits — the rest were round-off in the 16th digit of each sine. Dividing by $h$ scales the number but cannot restore digits. With $h = 10^{-8}$ about 8 digits survive the subtraction, and the truncation error is still only $4\times10^{-9}$.`,
    }),
    num({
      id: 'h-eff', difficulty: 3,
      gen(r) {
        const [what, x, h] = r.pick(HEFF);
        const got = (x + h) - x, u = ulp(x);
        return {
          prompt: t`A program differentiates at $x = ${tex(x, 6)}$ (${what}) with \`h = ${h.toExponential().replace('e-', 'e-0')}\`. What step does it actually take? Give \`(x + h) - x\` to three significant figures.`,
          visual: {
            type: 'graph',
            params: { x: [-0.8, Math.ceil(h / u) + 1.8], y: [-0.6, 0.8], aspect: 'wide', axesAt: 'edge', xlabel: 'distance above x, in units of the float spacing', ylabel: '', yticks: 0, grid: false,
              curves: [{ fn: '0', color: 'ink4', width: 1.2, domain: [-0.5, Math.ceil(h / u) + 1.5] }],
              points: [...Array.from({ length: Math.ceil(h / u) + 2 }, (_, k) => ({ x: k, y: 0, color: 'accent', r: 3.5 })), { x: h / u, y: 0, color: 'gold', r: 5, label: 'x + h (exact)', labelDx: -30, labelDy: -14 }] },
            caption: 'The floats just above x (blue dots, one spacing apart) and where x + h would fall in exact arithmetic (gold). The sum is rounded to the nearest dot.',
          },
          answer: got, tol: { rel: 0.005 },
          errors: [{ value: h, feedback: 'That is the step you asked for. x + h must be rounded to a float near x, whose spacing is not small compared with h.' }],
          hints: [t`The spacing of floats near $x$ is $${tex(u)}$ (\`math.ulp(x)\`).`, t`$h$ is ${(h / u).toFixed(2)} spacings; the sum rounds to the nearest whole number of spacings, ${Math.round(h / u)}.`],
          teach: 'x + h is rounded, so the step actually taken is (x + h) − x; compute it that way and divide by it, and the step error disappears.',
          explain: t`$(x + h) - x = ${Math.round(h / u)}\times${tex(u)} = ${tex(got)}$, which is ${(100 * (got / h - 1)).toFixed(1)}% ${got > h ? 'more' : 'less'} than the $h$ you meant. Dividing by the intended $h$ would put that error straight into the derivative. A classic remedy: \`h = (x + h) - x\` before using it — though for $x$ this large the real fix is a step near $\sqrt\varepsilon\,x$.`,
        };
      },
    }),
    code({
      id: 'scan-h', difficulty: 2,
      prompt: t`Find the best step empirically. For $f = e^x$ at $x = 1$ (exact derivative $e$), compute the central-difference error for $h = 10^{-1}, 10^{-2}, \ldots, 10^{-15}$. Set \`errors\` to the list of 15 absolute errors (in that order), and \`best_h\` and \`best_err\` to the step with the smallest error and that error.`,
      starter: t`import math

errors = []
best_h = None
best_err = None
`,
      answer: t`import math

hs = [10.0**-k for k in range(1, 16)]
errors = [abs((math.exp(1 + h) - math.exp(1 - h)) / (2 * h) - math.e) for h in hs]
k = errors.index(min(errors))
best_h, best_err = hs[k], errors[k]
print(best_h, best_err)`,
      tests: [
        { name: '15 errors, from h = 10⁻¹ down to 10⁻¹⁵', code: 'len(errors) == 15 and abs(errors[0] - abs((math.exp(1.1) - math.exp(0.9)) / 0.2 - math.e)) < 1e-15' },
        { name: 'the best step is between 10⁻⁷ and 10⁻⁴ (near ∛ε)', code: '1e-7 <= best_h <= 1e-4 and best_err == min(errors)' },
        { name: t`the best error is below $10^{-9}$, and $h = 10^{-15}$ is far worse`, code: 'best_err < 1e-9 and errors[-1] > 1000 * best_err' },
      ],
      hints: ['`hs = [10.0**-k for k in range(1, 16)]`, then a list comprehension for the errors.', '`k = errors.index(min(errors))` finds the position of the smallest.'],
      teach: 'When in doubt, scan h over decades and look for the bottom of the V — and expect it near ∛ε for central differences.',
      explain: t`The minimum falls near $h = 10^{-5}$, with an error around $10^{-11}$ — about $\varepsilon^{2/3}$ times $e$. At $h = 10^{-15}$ the estimate has lost nearly every digit. In real work you cannot compute the error (you would not need the derivative if you knew it), so you use the rule of thumb instead, or Richardson extrapolation.`,
    }),
    mcq({
      id: 'complex-step', difficulty: 3,
      prompt: t`For a function that works on complex numbers, the **complex-step** derivative is $f'(x) \approx \operatorname{Im}f(x + ih)/h$. With $h = 10^{-20}$ it is accurate to all 16 digits. Why can it use such a tiny step?

\`\`\`python
x, h = 1.0, 1e-20
print(np.imag(np.sin(x + 1j*h)) / h, np.cos(x))     # agree to 16 digits
\`\`\``,
      choices: [
        'It subtracts nothing: the derivative arrives in the imaginary part directly, so there is no cancellation and h can be made tiny',
        'Complex numbers are stored with twice the precision of floats',
        'The imaginary part cancels the truncation error exactly for every h',
        'NumPy switches to exact symbolic differentiation for complex input',
      ],
      answer: 0,
      why: {
        1: 'A complex number is two ordinary floats, with the same ε.',
        2: 'Its truncation error is still of order h² — but with no round-off penalty, h can be made so small that h² vanishes.',
        3: 'NumPy only evaluates sin at a complex argument; nothing symbolic happens.',
      },
      hints: [t`Taylor: $f(x + ih) = f(x) + ihf'(x) - \tfrac{h^2}{2}f''(x) - \ldots$ What is its imaginary part?`, 'Is there any difference of nearly equal numbers in Im f(x + ih)/h?'],
      teach: 'Round-off limits finite differences only because they subtract; the complex step avoids the subtraction, so its step can be tiny and its accuracy full.',
      explain: t`$\operatorname{Im}f(x + ih) = hf'(x) - \tfrac{h^3}{6}f'''(x) + \ldots$, so dividing by $h$ gives $f'$ with an $O(h^2)$ error and **no subtraction** — the left arm of the V disappears. It needs code that accepts complex numbers (and no \`abs\` or comparisons along the way); aerospace design codes use it to get exact-to-round-off sensitivities.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-noise', difficulty: 3, transfer: true,
      gen(r) {
        const s = r.pick([0.5, 1, 2]), h = r.pick([0.02, 0.1, 0.5]);
        const sv = s / (Math.SQRT2 * h);
        const z = normals(Math.round(1000 * s + 100 * h));
        return {
          prompt: t`A drone's barometric altimeter reports altitude every ${h} s with random noise of standard deviation $\sigma = ${s}$ m, independent from reading to reading. Its software takes the vertical speed as the central difference $(z_{k+1} - z_{k-1})/(2h)$. What is the standard deviation of the noise in that speed?`,
          visual: {
            type: 'graph',
            params: { x: [0, 20 * h], y: [-4 * s, 4 * s + 2 * h * 20], aspect: 'wide', axesAt: 'edge', xlabel: 'time (s)', ylabel: 'altitude (m)',
              curves: [{ fn: '2x', color: 'ink3', dash: true }], points: Array.from({ length: 21 }, (_, k) => ({ x: k * h, y: 2 * k * h + s * z(), color: 'accent', r: 3 })) },
            caption: 'Synthetic readings of a drone climbing at a steady 2 m/s (dashed), with the stated noise.',
          },
          answer: sv, units: 'm/s', tol: { rel: 0.02 },
          errors: [{ value: s / (2 * h), feedback: 'Two independent errors add in quadrature: the numerator’s noise is √2 σ, not σ.' }, { value: (2 * s) / (2 * h), feedback: 'Independent noise adds in quadrature (√2 σ), not linearly (2σ).' }],
          hints: [t`The numerator $z_{k+1} - z_{k-1}$ has noise $\sqrt{\sigma^2 + \sigma^2} = \sqrt2\,\sigma$.`, t`Divide by $2h = ${2 * h}$ s.`],
          teach: 'With measured data, the noise σ plays the role of ε|f|: the derivative’s noise grows like σ/h, so the best step is set by the noise, not by machine precision.',
          explain: t`$\sigma_v = \sqrt2\,\sigma/(2h) = \sigma/(\sqrt2\,h) = ${sv.toFixed(2)}$ m/s. ${sv > 2 ? 'That swamps a 2 m/s climb — ' : ''}Smaller steps make it worse, exactly like round-off. Real flight software lengthens the baseline, fits a line through several readings, or fuses the barometer with an accelerometer (a Kalman filter).`,
        };
      },
    }),
    code({
      id: 'cp-dTda', difficulty: 3, transfer: true,
      prompt: t`Write \`dTda(a)\` returning $dT/da$ for a circular Earth orbit of radius \`a\` (m), with $T(a) = 2\pi\sqrt{a^3/GM}$, by a **central** difference whose step scales with $a$: $h = \sqrt[3]{\varepsilon}\,a$, with \`eps = sys.float_info.epsilon\`. The tests compare with the exact $3T/(2a)$ for low Earth orbit and geostationary orbit.`,
      starter: t`import math, sys

GM = 3.986004418e14

def T(a):
    return 2 * math.pi * math.sqrt(a * a * a / GM)

def dTda(a):
    h = 1e-8
    return (T(a + h) - T(a - h)) / (2 * h)
`,
      answer: t`import math, sys

GM = 3.986004418e14

def T(a):
    return 2 * math.pi * math.sqrt(a * a * a / GM)

def dTda(a):
    h = sys.float_info.epsilon ** (1 / 3) * a
    return (T(a + h) - T(a - h)) / (2 * h)

print(dTda(42164.17e3))`,
      tests: [
        { name: 'low Earth orbit (6771 km): relative error below 10⁻⁹', code: 'abs(dTda(6.771e6) / (1.5 * T(6.771e6) / 6.771e6) - 1) < 1e-9' },
        { name: 'geostationary orbit: relative error below 10⁻⁹', code: 'abs(dTda(42164.17e3) / (1.5 * T(42164.17e3) / 42164.17e3) - 1) < 1e-9' },
      ],
      hints: ['The starter’s fixed `h = 1e-8` m is a few float spacings at these radii.', '`h = sys.float_info.epsilon ** (1 / 3) * a`.'],
      teach: 'A derivative routine that scales its step with |x| works at every magnitude; a fixed step works at only one.',
      explain: t`With $h = \sqrt[3]\varepsilon\,a$ (about 40 m in low orbit, 255 m at geostationary radius) both errors are near $2\times10^{-11}$. The starter's $h = 10^{-8}$ m is ${(100 * Math.abs(GEO[0].rel)).toFixed(0)}% wrong at geostationary radius. Library routines — \`scipy.optimize.approx_fprime\`, the Jacobians inside \`solve_ivp\`'s implicit methods — scale their steps the same way.`,
    }),
    mcq({
      id: 'cp-which-h', difficulty: 2,
      prompt: t`You need the central-difference derivative of $e^x$ at $x = 1$ in double precision. Which step gives the most accurate result?`,
      visual: {
        type: 'graph',
        params: { x: [-16.3, 0.3], y: [-13, 0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: '|error|',
          curves: [{ fn: `-x + ${lg(EPS * Math.E)}`, color: 'ink3', dash: true, label: 'round-off ∝ ε/h', labelAt: -11, labelDx: 6, labelDy: -10 }, { fn: `2*x + ${lg(Math.E / 6)}`, color: 'ink3', label: 'truncation ∝ h²', labelAt: -2.5, labelDx: 8, labelDy: 14 }] },
        caption: 'The two error terms of a central difference for a function of size about 1, on log–log axes.',
      },
      choices: ['$h = 10^{-5}$', '$h = 10^{-2}$', '$h = 10^{-8}$', '$h = 10^{-15}$'],
      answer: 0,
      why: {
        1: 'At 10⁻² the truncation error h²/6·f‴ is about 5 × 10⁻⁵: far from the best possible.',
        2: '10⁻⁸ is the forward-difference rule. For a central difference the round-off term ε/h ≈ 2 × 10⁻⁸ is now the larger one.',
        3: 'At 10⁻¹⁵ round-off ε/h is about 0.2: almost no digits survive.',
      },
      hints: ['Where do the two lines cross?', 'For a central difference, balance h² against ε/h: h ≈ ∛ε.'],
      teach: 'Central differences do best near h ≈ ∛ε·|x| ≈ 6 × 10⁻⁶·|x|, keeping about 10–11 digits.',
      explain: t`$\sqrt[3]{2.2\times10^{-16}} \approx 6\times10^{-6}$, so $h = 10^{-5}$ is closest, with a total error near $10^{-11}$. The forward-difference rule $10^{-8}$ would leave the central difference about $10^{-8}$ off — a thousand times worse.`,
    }),
  ],
  sources: [
    { label: 'Press et al., Numerical Recipes, §5.7: Numerical derivatives (the choice of h)', url: 'https://numerical.recipes/' },
    { label: 'Squire & Trapp (1998), Using complex variables to estimate derivatives of real functions, SIAM Review 40, 110', url: 'https://doi.org/10.1137/S003614459631241X' },
    { label: 'Newman, Computational Physics, §5.10.2: Errors on derivatives', url: 'http://www-personal.umich.edu/~mejn/cp/' },
  ],
});
