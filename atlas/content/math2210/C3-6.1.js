// Homogeneous linear equations with constant coefficients: try e^{rt}, get
// the characteristic equation, and read the motion from its two roots — real,
// repeated or complex (by Euler's formula). The mathematical view of the
// damped oscillators of Physics I, with stability as "where the roots sit".
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, frac } from '../../src/core/format.js';
import { sterm, r6 } from './_partials.js';

const t = String.raw;

/** The motion x(t) of a(x″) + b(x′) + c(x) = 0, drawn by c3-roots from (x0, v0), with no numbers. */
const motion = (a, b, c, { x0 = 1, v0 = 0, T = 8, panels = 'motion', caption } = {}) => ({
  type: 'c3-roots',
  params: { mode: 'free', zeta: r6(b / (2 * Math.sqrt(a * c))), w0: r6(Math.sqrt(c / a)), x0, v0, T, sliders: false, readout: false, panels, yname: 'y' },
  caption,
});

/** a y″ + b y′ + c y = 0 as TeX. */
const ode = (a, b, c, y = 'y') => `${a === 1 ? '' : a}${y}''${sterm(b, `${y}'`)}${sterm(c, y)} = 0`;

export default lesson({
  id: 'math2210.C3-6.1',
  title: 'Homogeneous equations with constant coefficients',
  minutes: 11, difficulty: 3,
  intro: t`A mass on a spring, the charge in a circuit, a spacecraft nudged off its pointing direction: near equilibrium each obeys a linear equation with constant coefficients,

$$a\,y'' + b\,y' + c\,y = 0.$$

Try $y = e^{rt}$. Each derivative just multiplies it by $r$, so the equation becomes the **characteristic equation** $ar^2 + br + c = 0$, and its two roots decide everything. Two real roots give exponentials; a repeated root brings in a factor $t$; complex roots $\alpha \pm i\beta$ give the oscillations $e^{\alpha t}\cos\beta t$ and $e^{\alpha t}\sin\beta t$, by Euler’s formula. Physics I met these motions as damped oscillators; this is why their formulas look the way they do.`,
  symbols: [
    { tex: 'y(t)', text: 'the unknown function: a displacement, a charge, an angle' },
    { tex: "y',\\ y''", text: 'its first and second derivatives with respect to time $t$' },
    { tex: 'a,\\ b,\\ c', text: 'constant coefficients. For a mass on a spring: the mass $m$ (kg), the damping coefficient $b$ (kg/s) and the spring constant $k$ (N/m)' },
    { tex: 'r', text: 'a root of $ar^2 + br + c = 0$, in units of 1/time; it may be complex' },
    { tex: 'e^{rt}', text: 'the trial solution; with $r = \\alpha + i\\beta$, Euler’s formula gives $e^{rt} = e^{\\alpha t}(\\cos\\beta t + i\\sin\\beta t)$' },
  ],
  why: t`Every linear system near an equilibrium — a structure, a circuit, an orbit nudged off course, an attitude controller — is a set of such equations, and its stability is read off from **where the characteristic roots sit**: all in the left half of the complex plane, and every disturbance dies away.`,
  visual: {
    type: 'c3-roots',
    title: 'Where the roots sit, the motion follows',
    lead: t`For $y'' + 2\zeta\omega_0\,y' + \omega_0^2\,y = 0$ the roots are $r = -\zeta\omega_0 \pm \omega_0\sqrt{\zeta^2 - 1}$. Top: the two roots in the complex plane. Bottom: the motion they make, starting from $y = 1$ at rest. Move the damping ratio $\zeta$ and the natural frequency $\omega_0$.`,
    tasks: [
      t`At $\zeta = 0.2$ the roots are $-0.4 \pm 1.96i$: the real part $-0.4$ sets the decay $e^{-0.4t}$ (the dashed envelope) and the imaginary part $1.96$ the oscillation, with period $2\pi/1.96 = 3.2$ s.`,
      t`Raise $\zeta$ to 1: the roots slide round the circle and meet on the real axis — critical damping, the quickest return without overshoot. Past 1 they split along the axis, one creeping toward 0, and the return gets slower.`,
      t`Drag $\zeta$ below zero: the roots cross into the right half-plane and the motion grows. Negative damping is how flutter and pogo look in the mathematics.`,
    ],
    params: { mode: 'free', zeta: 0.2, w0: 2, x0: 1, v0: 0, T: 10, yname: 'y' },
  },
  example: {
    prompt: t`Solve $y'' + 4y' + 13y = 0$ with $y(0) = 1$ and $y'(0) = 0$.`,
    visual: motion(1, 4, 13, { T: 4, caption: t`The solution, from $y = 1$ at rest. The dashed envelope is $\pm R\,e^{-2t}$; the oscillation inside it has period $2\pi/3 \approx 2.1$ s.` }),
    steps: [
      { label: 'Characteristic equation', text: t`$y = e^{rt}$ gives $(r^2 + 4r + 13)e^{rt} = 0$, so $r^2 + 4r + 13 = 0$ and $r = \dfrac{-4 \pm \sqrt{16 - 52}}{2} = -2 \pm 3i$.` },
      { label: 'Real solutions', text: t`By Euler’s formula, $e^{(-2 + 3i)t} = e^{-2t}(\cos3t + i\sin3t)$. The equation is linear with real coefficients, so the real and imaginary parts are solutions separately: $y = e^{-2t}(C_1\cos3t + C_2\sin3t)$.` },
      { label: 'Fit the start', text: t`$y(0) = C_1 = 1$.` },
      { label: 'Fit the starting slope', text: t`$y' = e^{-2t}\big[(-2C_1 + 3C_2)\cos3t + (-3C_1 - 2C_2)\sin3t\big]$, so $y'(0) = -2 + 3C_2 = 0$ and $C_2 = \tfrac23$.` },
      { label: 'Sense check', text: t`$y = e^{-2t}\left(\cos3t + \tfrac23\sin3t\right)$. It starts at 1 with zero slope, oscillates with angular frequency 3 (the imaginary part) and shrinks by $e^{-2} \approx 0.14$ every second (the real part). Here $\omega_0 = \sqrt{13}$ and $\zeta = 4/(2\sqrt{13}) = 0.55$: underdamped.` },
    ],
    answer: t`$y = e^{-2t}\left(\cos 3t + \tfrac23\sin 3t\right)$`,
  },
  practice: [
    expr({
      id: 'real-roots', difficulty: 2,
      gen(r) {
        const [r1, r2] = r.pick([[-1, -2], [-1, -3], [-2, -3], [-1, -4]]);
        const b = -(r1 + r2), c = r1 * r2;
        const c1 = r2 / (r2 - r1), c2 = -r1 / (r2 - r1);
        return {
          prompt: t`Solve $${ode(1, b, c)}$ with $y(0) = 1$ and $y'(0) = 0$.`,
          visual: motion(1, b, c, { T: 6, caption: 'The solution you are looking for, plotted from y = 1 at rest: it creeps back without oscillating.' }),
          answer: `(${r2})/(${r2 - r1})*e^(${r1}*t) + (${-r1})/(${r2 - r1})*e^(${r2}*t)`,
          answerTeX: t`${frac(c1)}\,e^{${r1}t} ${c2 < 0 ? '-' : '+'} ${Math.abs(c2) === 1 ? '' : frac(Math.abs(c2))}\,e^{${r2}t}`,
          vars: { t: [0, 3] }, lhs: 'y(t)',
          errors: [{ answer: `e^(${r1}*t) + e^(${r2}*t)`, feedback: t`That has $y(0) = 2$. Choose the constants from the initial conditions: $C_1 + C_2 = 1$ and $${r1}C_1 ${r2 < 0 ? '-' : '+'} ${Math.abs(r2)}C_2 = 0$.` }],
          hints: [t`The characteristic equation $r^2 + ${b}r + ${c} = 0$ factors as $(r ${r1 < 0 ? '+' : '-'} ${Math.abs(r1)})(r ${r2 < 0 ? '+' : '-'} ${Math.abs(r2)}) = 0$.`, t`$y = C_1e^{${r1}t} + C_2e^{${r2}t}$ with $C_1 + C_2 = 1$ and $${r1}C_1 + (${r2})C_2 = 0$.`],
          teach: t`Two distinct real roots $r_1$, $r_2$ give $y = C_1e^{r_1t} + C_2e^{r_2t}$; the initial conditions fix the constants.`,
          explain: t`Roots $${r1}$ and $${r2}$. From $C_1 + C_2 = 1$ and $${r1}C_1 + (${r2})C_2 = 0$: $C_1 = ${frac(c1)}$, $C_2 = ${frac(c2)}$. So $y = ${frac(c1)}\,e^{${r1}t} ${c2 < 0 ? '-' : '+'} ${Math.abs(c2) === 1 ? '' : frac(Math.abs(c2))}\,e^{${r2}t}$ — overdamped, since both roots are real and negative.`,
        };
      },
    }),
    mcq({
      id: 'pure-imaginary', difficulty: 2,
      prompt: t`What is the general solution of $y'' + 4y = 0$?`,
      visual: motion(1, 0, 4, { T: 8, caption: t`One solution, from $y = 1$ at rest: it oscillates for ever, neither growing nor decaying.` }),
      choices: [
        t`$r = \pm 2i$, so $y = C_1\cos 2t + C_2\sin 2t$`,
        t`$r = \pm 4$, so $y = C_1e^{4t} + C_2e^{-4t}$`,
        t`$r = \pm 2$, so $y = C_1e^{2t} + C_2e^{-2t}$`,
        t`$r = 2i$ only, so $y = C\cos 2t$`,
      ],
      answer: 0,
      why: {
        1: t`The characteristic equation is $r^2 + 4 = 0$: $r^2 = -4$, so $r = \pm\sqrt{-4} = \pm 2i$ — neither 4 nor real.`,
        2: t`$r^2 = -4$, not $+4$: the plus sign in $y'' + 4y$ makes the roots imaginary, and the motion oscillates.`,
        3: t`A second-order equation has two independent solutions; $r = -2i$ is a root too, and together they give both $\cos 2t$ and $\sin 2t$.`,
      },
      hints: [t`Substitute $y = e^{rt}$: $r^2 + 4 = 0$.`, t`$r = \pm 2i$, and $e^{\pm 2it} = \cos 2t \pm i\sin 2t$.`],
      teach: 'For y″ + ω²y = 0 the roots are ±iω, giving cos ωt and sin ωt: simple harmonic motion.',
      explain: t`$r^2 = -4$ gives $r = \pm 2i$, a pair with zero real part: no growth, no decay, angular frequency 2. Real solutions: $\cos 2t$ and $\sin 2t$. This is simple harmonic motion, $y'' = -\omega^2 y$ with $\omega = 2$.`,
    }),
    expr({
      id: 'repeated', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 3]);
        return {
          prompt: t`Solve $${ode(1, 2 * k, k * k)}$ with $y(0) = 1$ and $y'(0) = 0$.`,
          visual: motion(1, 2 * k, k * k, { T: 6 / k + 2, caption: 'The solution, from y = 1 at rest: critically damped, it returns as fast as it can without overshooting.' }),
          answer: `(1 + ${k}*t)*e^(-${k}*t)`,
          answerTeX: t`(1 + ${k === 1 ? '' : k}t)\,e^{-${k === 1 ? '' : k}t}`,
          vars: { t: [0, 3] }, lhs: 'y(t)',
          errors: [{ answer: `e^(-${k}*t)`, feedback: t`$e^{-${k === 1 ? '' : k}t}$ alone has $y'(0) = -${k}$, not 0. With a repeated root the second solution is $t\,e^{-${k === 1 ? '' : k}t}$: use both.` }, { answer: `(1 - ${k}*t)*e^(-${k}*t)`, feedback: t`Check $y'(0)$: for $(C_1 + C_2t)e^{-${k === 1 ? '' : k}t}$ it is $C_2 - ${k}C_1$, which must be 0.` }],
          hints: [t`$r^2 + ${2 * k}r + ${k * k} = (r + ${k})^2$: the root $-${k}$ is repeated.`, t`For a repeated root the solutions are $e^{-${k === 1 ? '' : k}t}$ and $t\,e^{-${k === 1 ? '' : k}t}$: $y = (C_1 + C_2t)e^{-${k === 1 ? '' : k}t}$.`],
          teach: t`A repeated root $r$ gives the two solutions $e^{rt}$ and $t\,e^{rt}$.`,
          explain: t`$y = (C_1 + C_2t)e^{-${k === 1 ? '' : k}t}$. $y(0) = C_1 = 1$; $y'(0) = C_2 - ${k}C_1 = 0$ gives $C_2 = ${k}$. So $y = (1 + ${k === 1 ? '' : k}t)e^{-${k === 1 ? '' : k}t}$.`,
        };
      },
    }),
    num({
      id: 'critical-b', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 4]), c = r.pick([8, 18, 32]);
        const b = 2 * Math.sqrt(a * c);
        return {
          prompt: t`For which damping coefficient $b > 0$ does $${a === 1 ? '' : a}y'' + b\,y' + ${c}y = 0$ have a repeated characteristic root (critical damping)?`,
          visual: motion(a, b, c, { T: 5, caption: t`Critically damped motion from $y = 1$ at rest (no numbers on purpose): the boundary between oscillating and creeping back.` }),
          answer: b, tol: { rel: 1e-3 },
          errors: [{ value: Math.sqrt(a * c), feedback: t`The discriminant $b^2 - 4ac$ must vanish: $b = 2\sqrt{ac}$, not $\sqrt{ac}$.` }, { value: 4 * a * c, feedback: t`That is $b^2$. Take the square root: $b = \sqrt{4ac}$.` }],
          hints: [t`A repeated root needs the discriminant of $${a === 1 ? '' : a}r^2 + br + ${c} = 0$ to vanish: $b^2 - 4(${a})(${c}) = 0$.`],
          teach: 'Critical damping is where the characteristic roots meet: b² = 4ac, so b = 2√(ac) — for a spring, 2√(km).',
          explain: t`$b^2 = 4ac = 4(${a})(${c}) = ${4 * a * c}$, so $b = ${nice(b)}$. Then $r = -\dfrac{b}{2a} = ${nice(-b / (2 * a))}$, twice. In damping-ratio terms, $\zeta = \dfrac{b}{2\sqrt{ac}} = 1$.`,
        };
      },
    }),
    mcq({
      id: 'why-real-parts', difficulty: 2,
      prompt: t`The roots of $y'' + 2y' + 10y = 0$ are $-1 \pm 3i$. Why are $e^{-t}\cos3t$ and $e^{-t}\sin3t$ solutions — real functions, from complex roots?`,
      visual: { type: 'graph', params: { x: [0, 5], y: [-1.15, 1.15], aspect: 'wide', xlabel: 't', ylabel: 'y', curves: [{ fn: 'e^(-x)*cos(3x)', color: 'accent', label: 'e⁻ᵗ cos 3t', labelAt: 0.75, labelDy: 14 }, { fn: 'e^(-x)*sin(3x)', color: 'violet', label: 'e⁻ᵗ sin 3t', labelAt: 0.55, labelDy: -12 }, { fn: 'e^(-x)', color: 'ink3', width: 1.2, dash: true }, { fn: '-e^(-x)', color: 'ink3', width: 1.2, dash: true }] }, caption: t`The real and imaginary parts of $e^{(-1 + 3i)t}$, inside the envelope $\pm e^{-t}$ (dashed).` },
      choices: [
        t`$e^{(-1 + 3i)t} = e^{-t}(\cos3t + i\sin3t)$ solves the equation, and because the coefficients are real, its real and imaginary parts each solve it too`,
        t`Because only sines and cosines have second derivatives equal to minus themselves`,
        t`Because the imaginary parts of the roots can be ignored for physical problems`,
        t`Because $-1 \pm 3i$ is close enough to the real number $-1$`,
      ],
      answer: 0,
      why: {
        1: t`$e^{-t}\cos 3t$ is not of that kind: its second derivative is not $-1$ times itself. The real-and-imaginary-part argument is what works.`,
        2: t`The imaginary part $3$ is the angular frequency: ignore it and the oscillation disappears.`,
        3: t`Nothing is approximated here: the solutions are exact.`,
      },
      hints: ['Write e^(−1+3i)t with Euler’s formula.', t`If $L[u + iv] = 0$ for a linear $L$ with real coefficients, what are $L[u]$ and $L[v]$?`],
      teach: 'For real coefficients, the real and imaginary parts of a complex solution are real solutions.',
      explain: t`Write $L[y] = y'' + 2y' + 10y$. Then $L[e^{rt}] = 0$ for $r = -1 + 3i$, and $e^{rt} = u + iv$ with $u = e^{-t}\cos 3t$, $v = e^{-t}\sin 3t$. Since $L$ has real coefficients, $L[u] + iL[v] = 0$ forces $L[u] = 0$ and $L[v] = 0$. The same trick is behind phasors in AC circuits.`,
    }),
    mcq({
      id: 'error-sign', difficulty: 2, kind: 'error',
      prompt: t`Solving $y'' - 2y' + 5y = 0$, a student finds $r = 1 \pm 2i$ and writes $y = e^{-t}(C_1\cos2t + C_2\sin2t)$, “a damped oscillation”. What is wrong?`,
      visual: motion(1, -2, 5, { T: 4, caption: t`The actual solution of $y'' - 2y' + 5y = 0$ from $y = 1$ at rest.` }),
      choices: [
        t`The real part of the roots is $+1$, so the factor is $e^{+t}$: the oscillation grows`,
        t`The roots are wrong: they should be $-1 \pm 2i$`,
        t`The frequency should be 4, not 2`,
        'Nothing: every second-order equation with complex roots describes a damped oscillation',
      ],
      answer: 0,
      why: {
        1: t`$r = \dfrac{2 \pm \sqrt{4 - 20}}{2} = 1 \pm 2i$: the student’s roots are right. The slip came after.`,
        2: t`The imaginary part, 2, is the angular frequency; the 4 under the square root became $2i$.`,
        3: t`Damped means the real part is negative. Here the $-2y'$ term pumps energy in, and the real part is positive.`,
      },
      hints: [t`$e^{(\alpha + i\beta)t} = e^{\alpha t}(\cos\beta t + i\sin\beta t)$. What is $\alpha$ here?`, t`The $-2y'$ term is negative damping.`],
      teach: 'The sign of the roots’ real part decides growth or decay: positive means the oscillation grows.',
      explain: t`With $\alpha = +1$, $y = e^{t}(C_1\cos2t + C_2\sin2t)$: an oscillation whose amplitude grows by a factor $e$ each second. The coefficient $-2$ of $y'$ is negative damping — energy fed in on every cycle.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-solve', difficulty: 2,
      gen(r) {
        const al = r.pick([1, 2]), be = r.pick([2, 3, 4]);
        return {
          prompt: t`Solve $${ode(1, 2 * al, al * al + be * be)}$ with $y(0) = 0$ and $y'(0) = ${be}$.`,
          visual: motion(1, 2 * al, al * al + be * be, { x0: 0, v0: be, T: 4, caption: 'The solution, starting from y = 0 with an upward kick.' }),
          answer: `e^(-${al}*t)*sin(${be}*t)`,
          answerTeX: t`e^{-${al === 1 ? '' : al}t}\sin ${be}t`,
          vars: { t: [0, 3] }, lhs: 'y(t)',
          hints: [t`The roots are $-${al} \pm ${be}i$.`],
          teach: t`Complex roots $\alpha \pm i\beta$ give $y = e^{\alpha t}(C_1\cos\beta t + C_2\sin\beta t)$; fit $C_1$ and $C_2$ to the start.`,
          explain: t`$r = -${al} \pm ${be}i$, so $y = e^{-${al === 1 ? '' : al}t}(C_1\cos${be}t + C_2\sin${be}t)$. $y(0) = C_1 = 0$, and then $y'(0) = ${be}C_2 = ${be}$ gives $C_2 = 1$: $y = e^{-${al === 1 ? '' : al}t}\sin${be}t$.`,
        };
      },
    }),
    num({
      id: 'cp-attitude', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([800, 1500, 2500]), Kp = r.pick([20, 40, 60]);
        const Kd = 2 * Math.sqrt(I * Kp);
        return {
          prompt: t`A spacecraft’s attitude controller fires thrusters so that a small pointing error $\theta$ obeys $I\theta'' + K_d\theta' + K_p\theta = 0$, with moment of inertia $I = ${I}$ kg·m² and stiffness $K_p = ${Kp}$ N·m/rad. What derivative gain $K_d$, in N·m·s/rad, makes the response critically damped?`,
          visual: { type: 'c3-roots', params: { mode: 'free', zeta: 0.3, w0: r6(Math.sqrt(Kp / I)), x0: 1, v0: 0, T: r6(30 * Math.sqrt(I / Kp)), sliders: false, readout: false, panels: 'motion', yname: 'θ' }, caption: 'With too little damping the pointing error rings for many cycles before it settles. (This curve is not the critical case.)' },
          answer: Kd, units: 'N*m*s/rad', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(I * Kp), feedback: t`Critical damping needs $K_d^2 = 4IK_p$, so $K_d = 2\sqrt{IK_p}$.` }],
          hints: [t`A repeated root needs $K_d^2 - 4IK_p = 0$.`, t`$K_d = 2\sqrt{IK_p} = 2\sqrt{${I}\times${Kp}}$.`],
          teach: t`For $I\theta'' + K_d\theta' + K_p\theta = 0$, critical damping is $K_d = 2\sqrt{IK_p}$.`,
          explain: t`$K_d = 2\sqrt{${I}\times${Kp}} = ${Math.round(Kd)}$ N·m·s/rad. Real attitude controllers often aim lower, near $\zeta \approx 0.7$, accepting a few per cent of overshoot for a quicker settle.`,
        };
      },
    }),
    mcq({
      id: 'cp-unstable', difficulty: 3, transfer: true,
      prompt: t`In a pogo oscillation the coupling between a rocket’s structure and its propellant feed acts like **negative damping**: in the model $y'' + b\,y' + \omega_0^2y = 0$, the effective $b$ becomes negative. What happens to the characteristic roots and the motion?`,
      visual: { type: 'c3-roots', params: { mode: 'free', zeta: -0.08, w0: 2, x0: 0.3, v0: 0, T: 12, sliders: false, readout: false, yname: 'y' }, caption: 'A characteristic-root picture and the motion it makes, for one negative value of the damping. The shaded half-plane is where motions grow.' },
      choices: [
        t`The roots move into the right half-plane (positive real part), so the oscillation grows exponentially until something nonlinear limits it`,
        t`The roots become purely imaginary, so the oscillation keeps a constant amplitude`,
        t`The roots become real, so the motion stops oscillating`,
        t`Nothing changes: the sign of $b$ only affects the phase`,
      ],
      answer: 0,
      why: {
        1: t`Purely imaginary roots need $b = 0$ exactly. With $b < 0$ the real part is $-b/2 > 0$.`,
        2: t`For a small negative $b$ the roots are still complex — the motion oscillates — but with a positive real part.`,
        3: t`The real part of the roots, $-b/2$, sets growth or decay: its sign is everything.`,
      },
      hints: [t`The roots are $r = -\dfrac{b}{2} \pm \sqrt{\dfrac{b^2}{4} - \omega_0^2}$. What is the real part when $b < 0$ is small?`, t`A root $\alpha + i\beta$ gives the factor $e^{\alpha t}$: decay if $\alpha < 0$, growth if $\alpha > 0$.`],
      teach: 'Negative damping puts the roots in the right half-plane: oscillations grow exponentially.',
      explain: t`The real part $-b/2$ becomes positive, so $y \propto e^{|b|t/2}\cos(\omega_d t)$ grows on every cycle — the signature of pogo and flutter. Engineers cure it by restoring positive damping or detuning the coupled frequencies, as with the gas accumulators added to rocket feed lines after Apollo 13’s pogo.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §7.1 Second-order linear equations', url: 'https://openstax.org/books/calculus-volume-3/pages/7-1-second-order-linear-equations' },
    { label: 'OpenStax Calculus Vol. 3, §7.4 Applications', url: 'https://openstax.org/books/calculus-volume-3/pages/7-4-applications' },
  ],
});
