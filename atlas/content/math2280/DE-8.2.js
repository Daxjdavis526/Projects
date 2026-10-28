// Eigenvalue problems: the vibrating string. Separating u(x, t) = X(x)T(t) in
// the wave equation leaves X″ + λX = 0 with X(0) = X(L) = 0, which has nonzero
// solutions only for λₙ = (nπ/L)² — the string's standing waves, met
// physically in PHYS 2220 W1.4, now as eigenvalues. Shooting in λ, the three
// sign cases, free (Neumann) and fixed–free ends, and a gas line's quarter-wave
// resonance as the transfer.
import { lesson, mcq, num, expr, match } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { co } from './_second.js';
import { fpic, n } from './_laplace.js';

const t = String.raw;

// the Explore: shoot y″ + λy = 0 from y(0) = 0, y′(0) = 1 across [0, π]
const POS = 'step(lam - 0.001)', NEG = 'step(-lam - 0.001)', ZERO = 'step(0.001 - abs(lam))';
const SHOT_END = `${POS}*sin(sqrt(abs(lam))*pi)/sqrt(abs(lam) + 1e-12) + ${NEG}*sinh(sqrt(abs(lam))*pi)/sqrt(abs(lam) + 1e-12) + ${ZERO}*pi`;

/** The first few eigenfunctions of a problem on [0, L], each in its colour (a static picture). */
function modes(fns, L, caption, { y = [-1.3, 1.3], labels = null } = {}) {
  const C = ['accent', 'violet', 'teal', 'gold'];
  return fpic(null, [0, L], y, caption, {
    xlabel: 'x (m)', ylabel: 'X',
    curves: fns.map((fn, i) => ({ fn, color: C[i % 4], width: 2.2, label: labels?.[i], labelAt: labels ? L * (0.08 + 0.1 * i) : undefined, labelDx: 4, labelDy: -12 })),
  });
}

export default lesson({
  id: 'math2280.DE-8.2',
  title: 'Eigenvalue problems: the vibrating string',
  minutes: 13, difficulty: 3,
  intro: t`A string of length $L$, fixed at both ends, obeys the wave equation $u_{tt} = c^2u_{xx}$ for its sideways displacement $u(x, t)$. Look for solutions that keep their shape and only change size, $u = X(x)\,T(t)$. Substituting gives $X\,T'' = c^2X''\,T$, so $\dfrac{T''}{c^2T} = \dfrac{X''}{X}$ — a function of $t$ equal to a function of $x$, so both are one constant, $-\lambda$. The ends give conditions on $X$, and the shape must solve the **eigenvalue problem**

$$X'' + \lambda X = 0, \qquad X(0) = 0, \quad X(L) = 0.$$

$X = 0$ always works. A **nonzero** solution exists only for special values of $\lambda$, the **eigenvalues** $\lambda_n = (n\pi/L)^2$, with **eigenfunctions** $X_n = \sin(n\pi x/L)$. Then $T'' + c^2\lambda_n T = 0$ makes each one oscillate at $\omega_n = c\sqrt{\lambda_n} = n\pi c/L$: the standing waves and harmonics of [PHYS 2220 W1.4](#/lesson/phys2220.W1.4), now as the eigenvalues of a boundary-value problem.`,
  symbols: [
    { tex: t`u(x, t)`, text: 'the string’s sideways displacement at position x and time t, in m' },
    { tex: t`c`, text: t`the wave speed, $\sqrt{F_T/\mu}$ for tension $F_T$ (N) and mass per metre $\mu$ (kg/m), in m/s` },
    { tex: t`X(x)`, text: 'the shape of a mode: what stays the same while it vibrates' },
    { tex: t`\lambda`, text: t`the separation constant, in $\text{m}^{-2}$; only the eigenvalues $\lambda_n$ allow a nonzero shape` },
    { tex: t`n`, text: t`the mode number, 1, 2, 3, …: mode $n$ has $n - 1$ nodes between the ends` },
    { tex: t`\omega_n = c\sqrt{\lambda_n}`, text: t`the angular frequency of mode $n$, in rad/s ($f_n = \omega_n/2\pi$)` },
  ],
  why: t`Every resonance of a bounded system — strings, pipes, beams, drumheads, electrons in atoms — comes from an eigenvalue problem like this one: the boundary conditions allow only a ladder of shapes, each with its own frequency.`,
  visual: {
    type: 'graph',
    title: 'Shooting for eigenvalues',
    lead: t`Shoot $y'' + \lambda y = 0$ from $y(0) = 0$ with slope 1 across $[0, \pi]$ and change $\lambda$. A nonzero solution of the boundary-value problem exists only when the shot lands back on zero at $x = \pi$ (gold).`,
    tasks: [
      'Raise λ slowly from 0: the shot lands on zero at x = π only for λ = 1, 4, 9, 16 — the eigenvalues n². Between them it misses.',
      'Make λ negative: the shot is a sinh curve that climbs for ever and never returns. There are no negative eigenvalues — and λ = 0 gives the straight line y = x, which fails too.',
      'At λ = 9 count the zeros between the ends: two. The n-th eigenfunction has n − 1.',
    ],
    params: {
      x: [0, 3.6], y: [-1.2, 3.4], xlabel: 'x', ylabel: 'y',
      sliders: [{ key: 'lam', label: 'Separation constant $\\lambda$', min: -2, max: 20, step: 0.05, value: 2.5, explain: t`The constant in $y'' + \lambda y = 0$. For $\lambda > 0$ the shot is $\sin(\sqrt\lambda\,x)/\sqrt\lambda$; for $\lambda < 0$ a $\sinh$.` }],
      curves: [
        { fn: 'sin(sqrt(abs(lam))*x)/sqrt(abs(lam) + 1e-12)', color: 'accent', width: 2.8, when: POS },
        { fn: 'sinh(sqrt(abs(lam))*x)/sqrt(abs(lam) + 1e-12)', color: 'bad', width: 2.8, when: NEG },
        { fn: 'x', color: 'warn', width: 2.8, when: ZERO },
      ],
      vlines: [{ x: 'pi', label: 'x = π', color: 'ink3' }],
      points: [{ x: 'pi', y: 0, color: 'gold', r: 6, label: 'must land here', labelDx: -110, labelDy: 16 }],
      readouts: [{ label: 'where the shot lands, $y(\\pi)$', expr: SHOT_END, digits: 3 }, { label: '$\\sqrt\\lambda$', expr: 'sqrt(abs(lam))*sign(lam)', digits: 3 }],
    },
    caption: t`Each curve solves the initial-value problem $y'' + \lambda y = 0$, $y(0) = 0$, $y'(0) = 1$ (blue for $\lambda > 0$, orange at $\lambda = 0$, red for $\lambda < 0$). The interval is $[0, \pi]$, so the eigenvalues are $n^2$; on $[0, L]$ they are $(n\pi/L)^2$.`,
  },
  example: {
    prompt: t`Find every eigenvalue and eigenfunction of $X'' + \lambda X = 0$, $X(0) = X(L) = 0$, and the frequencies of the string they describe. Check against a real string: $L = 0.80$ m, $c = 200$ m/s.`,
    visual: modes(['sin(pi*x/0.8)', 'sin(2*pi*x/0.8)', 'sin(3*pi*x/0.8)'], 0.8, t`The first three eigenfunctions on a 0.80 m string: one, two and three loops.`, { labels: ['n = 1', 'n = 2', 'n = 3'] }),
    steps: [
      { label: 'Lambda negative', text: t`Write $\lambda = -k^2$: $X = c_1\cosh kx + c_2\sinh kx$. $X(0) = 0$ gives $c_1 = 0$; $X(L) = c_2\sinh kL = 0$ with $\sinh kL \ne 0$ gives $c_2 = 0$. Only $X = 0$: no negative eigenvalues.` },
      { label: 'Lambda zero', text: t`$X = c_1 + c_2x$; both ends force $c_1 = c_2 = 0$. Not an eigenvalue.` },
      { label: 'Lambda positive', text: t`$\lambda = k^2$: $X = c_1\cos kx + c_2\sin kx$; $X(0) = 0$ gives $c_1 = 0$, and $X(L) = c_2\sin kL = 0$ with $c_2 \ne 0$ needs $\sin kL = 0$: $\;kL = n\pi$.` },
      { label: 'Eigenpairs', text: t`$\lambda_n = \left(\dfrac{n\pi}{L}\right)^2$, $\;X_n = \sin\dfrac{n\pi x}{L}$, $\;n = 1, 2, 3, \ldots$ ($n = 0$ gives $X = 0$; negative $n$ repeat the same functions).` },
      { label: 'Frequencies', text: t`$T'' + c^2\lambda_nT = 0$ oscillates at $\omega_n = c\sqrt{\lambda_n} = \dfrac{n\pi c}{L}$, so $f_n = \dfrac{nc}{2L}$ — the harmonic ladder.` },
      { label: 'Sense check', text: t`$L = 0.80$ m, $c = 200$ m/s: $f_1 = 200/1.6 = 125$ Hz, $f_2 = 250$ Hz, $f_3 = 375$ Hz — exactly the numbers W1.4 found from wavelengths that fit the string. Same physics, two languages.` },
    ],
    answer: t`$\lambda_n = (n\pi/L)^2$, $X_n = \sin(n\pi x/L)$, $n = 1, 2, \ldots$; each mode vibrates at $f_n = nc/2L$ (125, 250, 375 Hz for the example string).`,
  },
  practice: [
    num({
      id: 'eigenvalue', difficulty: 1,
      gen(r) {
        const L = r.pick([0.5, 0.8, 1.2, 2]), k = r.int(1, 4);
        const lam = ((k * Math.PI) / L) ** 2;
        return {
          prompt: t`For $X'' + \lambda X = 0$ with $X(0) = X(${L}) = 0$ ($x$ in m), what is the eigenvalue $\lambda_{${k}}$, whose eigenfunction has ${k} loop${k > 1 ? 's' : ''}?`,
          answer: lam, units: 'm^-2', tol: { rel: 0.005 },
          errors: [{ value: (k * Math.PI) / L, feedback: t`That is $\sqrt{\lambda_${k}} = ${k}\pi/L$. The eigenvalue is its square.` }, { value: ((k * Math.PI) / (2 * L)) ** 2, feedback: t`A loop is half a wavelength: $\sin(k\pi x/L)$ has $k$ loops, so $\sqrt{\lambda} = k\pi/L$, not $k\pi/2L$.` }],
          hints: [t`$\lambda_n = (n\pi/L)^2$.`],
          teach: t`The eigenvalues of $X'' + \lambda X = 0$, $X(0) = X(L) = 0$ are $(n\pi/L)^2$, one for each whole number of loops.`,
          explain: t`$\lambda_${k} = \left(\dfrac{${k}\pi}{${L}}\right)^2 = ${fmt(lam, 4)}\ \text{m}^{-2}$, eigenfunction $\sin(${co(k)}\pi x/${L})$.`,
          visual: modes([`sin(${k}*pi*x/${L})`], L, t`The eigenfunction with ${k} loop${k > 1 ? 's' : ''} on $[0, ${L}]$.`),
        };
      },
    }),
    mcq({
      id: 'no-negative', difficulty: 2,
      prompt: t`Why does $X'' + \lambda X = 0$, $X(0) = X(L) = 0$ have no negative eigenvalues?`,
      choices: [
        t`For $\lambda = -k^2 < 0$, the solutions with $X(0) = 0$ are $c\sinh kx$, which is never zero again for $x > 0$`,
        t`A negative $\lambda$ would make the frequency imaginary, which is not allowed in mathematics`,
        t`For $\lambda < 0$ the equation has no solutions at all`,
        t`Negative eigenvalues exist, but they are discarded because strings cannot have them`,
      ],
      answer: 0,
      why: {
        1: 'The argument is about the shape X alone, before any frequency; and imaginary numbers are perfectly allowed — they would just mean growth instead of oscillation.',
        2: t`It has two independent solutions, $\cosh kx$ and $\sinh kx$; none except zero meets both conditions.`,
        3: 'Nothing is discarded: the boundary conditions themselves rule them out.',
      },
      hints: [t`Write $\lambda = -k^2$ and solve: $X = c_1\cosh kx + c_2\sinh kx$.`, t`Impose $X(0) = 0$, then ask whether $\sinh kL$ can be zero.`],
      teach: 'Test each sign of λ against both boundary conditions: only oscillating solutions can return to zero.',
      explain: t`$X(0) = 0$ leaves $c\sinh kx$, and $\sinh kL > 0$ for $L > 0$, so $X(L) = 0$ forces $c = 0$. Physically: a negative $\lambda$ would bend the string away from the axis wherever it is displaced, and a curve that always bends away from the axis cannot come back to it.`,
      visual: fpic(null, [0, 3.2], [-0.2, 4], t`Solutions with $X(0) = 0$ for three negative values of $\lambda$: $\sinh(kx)/k$ curves, which never return to zero.`, { xlabel: 'x', ylabel: 'X', curves: [0.3, 0.6, 0.9].map((k, i) => ({ fn: `sinh(${k}x)/${k}`, color: ['bad', 'warn', 'gold'][i], width: 2 })) }),
    }),
    num({
      id: 'cable-mode', difficulty: 2,
      gen(r) {
        const L = r.pick([1.2, 1.5, 2]), FT = r.pick([50, 120, 200]), mu = r.pick([0.02, 0.05]), k = r.int(1, 3);
        const c = Math.sqrt(FT / mu), f = (k * c) / (2 * L);
        return {
          prompt: t`A ${L} m instrument cable on a satellite boom is held at both ends with tension $F_T = ${FT}$ N and has $\mu = ${mu}$ kg/m. From $\omega_n = c\sqrt{\lambda_n}$, what is the frequency $f_${k}$ of its mode ${k}, in Hz?`,
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: (k * Math.PI * c) / L, feedback: t`That is $\omega_${k}$ in rad/s. Divide by $2\pi$ for hertz.` }, { value: (k * c) / L, feedback: t`$\sqrt{\lambda_n} = n\pi/L$, so $f_n = \dfrac{c}{2\pi}\cdot\dfrac{n\pi}{L} = \dfrac{nc}{2L}$: the 2 matters.` }],
          hints: [t`$c = \sqrt{F_T/\mu}$ and $\sqrt{\lambda_${k}} = ${k}\pi/${L}$.`, t`$f_${k} = \dfrac{\omega_${k}}{2\pi} = \dfrac{${k}c}{2\times${L}}$.`],
          teach: t`Each eigenvalue gives one frequency: $\omega_n = c\sqrt{\lambda_n}$, so $f_n = nc/2L$.`,
          explain: t`$c = \sqrt{${FT}/${mu}} = ${fmt(c, 4)}$ m/s and $f_${k} = \dfrac{${k}\times${fmt(c, 4)}}{2\times${L}} = ${fmt(f, 4)}$ Hz. Engineers keep such frequencies away from the spacecraft’s structural and reaction-wheel frequencies.`,
          visual: { type: 'wave-string', params: { mode: 'standing', show: 'mode', n: k, Ls: L, FT, mu, controls: false, play: false, readout: false }, caption: t`The cable in mode ${k}: ${k} loop${k > 1 ? 's' : ''}, ${k - 1} node${k === 2 ? '' : 's'} between the ends. Displacement exaggerated.` },
        };
      },
    }),
    mcq({
      id: 'neumann', difficulty: 2,
      prompt: t`With **free** ends instead, $X'(0) = X'(L) = 0$ (a rod free at both ends vibrating lengthwise, or the air’s displacement in a pipe open at both ends), the eigenfunctions are $\cos(n\pi x/L)$. Which eigenvalue does this problem have that the fixed–fixed one does not?`,
      choices: [t`$\lambda_0 = 0$, with the constant eigenfunction $X = 1$`, t`A negative eigenvalue, $\lambda = -(\pi/L)^2$`, t`$\lambda = (\pi/2L)^2$, a quarter wave`, 'None: both problems have the same eigenvalues and eigenfunctions'],
      answer: 0,
      why: {
        1: t`For $\lambda = -k^2$, $X'(0) = 0$ leaves $\cosh kx$, whose slope $k\sinh kL$ is not zero at $L$.`,
        2: t`A quarter wave has a node at one end and a free end at the other: that is the mixed problem, $X(0) = 0$, $X'(L) = 0$.`,
        3: t`The eigenvalues $(n\pi/L)^2$ for $n \ge 1$ agree, but the eigenfunctions differ (cosines, not sines), and $n = 0$ is new.`,
      },
      hints: [t`Try $\lambda = 0$: $X = c_1 + c_2x$. Which of these have zero slope at both ends?`],
      teach: t`Free ends allow $\lambda = 0$: a constant shape, the whole thing moving together, which fixed ends forbid.`,
      explain: t`At $\lambda = 0$, $X = c_1 + c_2x$ and $X'(0) = X'(L) = 0$ only ask $c_2 = 0$: any constant works: the whole rod (or air column) shifting together, which fixed ends forbid. The other eigenvalues are $(n\pi/L)^2$, $n = 1, 2, \ldots$, with $\cos(n\pi x/L)$.`,
      visual: modes(['1', 'cos(pi*x)', 'cos(2*pi*x)'], 1, t`The first three free–free eigenfunctions on $[0, 1]$: $1$, $\cos\pi x$, $\cos 2\pi x$. Each has zero slope at both ends.`, { y: [-1.3, 1.5] }),
    }),
    match({
      id: 'which-bc', difficulty: 2,
      prompt: t`Match each pair of boundary conditions for $X'' + \lambda X = 0$ on $[0, L]$ with its eigenfunctions.`,
      left: [t`$X(0) = 0$, $X(L) = 0$ (both ends fixed)`, t`$X'(0) = 0$, $X'(L) = 0$ (both ends free)`, t`$X(0) = 0$, $X'(L) = 0$ (fixed, then free)`, t`$X(0) = X(L)$, $X'(0) = X'(L)$ (a ring: periodic)`],
      right: ['sin(nπx/L), n = 1, 2, …', 'cos(nπx/L), n = 0, 1, 2, …', 'sin((2n − 1)πx/2L), n = 1, 2, …', 'both cos(2nπx/L) and sin(2nπx/L)', 'sinh(nπx/L)'],
      answer: [0, 1, 2, 3],
      hints: ['Check each candidate against the conditions: a sine vanishes at 0, a cosine has zero slope at 0.', 'For the mixed problem, the slope must vanish at L: an odd number of quarter waves.'],
      teach: 'The boundary conditions choose the eigenfunctions: zero value means a sine-like end, zero slope a cosine-like end.',
      explain: t`Fixed–fixed: whole half-waves, $\sin(n\pi x/L)$. Free–free: $\cos(n\pi x/L)$, including the constant. Fixed–free: odd quarter-waves, $\sin\big((2n - 1)\pi x/2L\big)$. Periodic: whole waves around the ring, sines and cosines both — every eigenvalue but zero has two eigenfunctions. sinh never satisfies two such conditions.`,
      visual: modes(['sin(pi*x)', 'cos(pi*x)', 'sin(pi*x/2)'], 1, t`Three shapes on $[0, 1]$: $\sin\pi x$ (blue), $\cos\pi x$ (violet) and $\sin(\pi x/2)$ (teal). Check each one’s value and slope at the two ends.`, { y: [-1.3, 1.3] }),
    }),
    num({
      id: 'fixed-free', difficulty: 3,
      gen(r) {
        const L = r.pick([0.5, 1, 2]), k = r.pick([2, 3]);
        const lam = (((2 * k - 1) * Math.PI) / (2 * L)) ** 2;
        return {
          prompt: t`Find the eigenvalue $\lambda_${k}$ of $X'' + \lambda X = 0$ with $X(0) = 0$ and $X'(${L}) = 0$ — a rod clamped at one end and free at the other, vibrating lengthwise.`,
          answer: lam, units: 'm^-2', tol: { rel: 0.005 },
          errors: [{ value: ((k * Math.PI) / L) ** 2, feedback: t`That is the fixed–fixed eigenvalue. Here the slope must vanish at $L$: $\cos kL = 0$, so $kL$ is an odd multiple of $\pi/2$.` }, { value: ((k * Math.PI) / (2 * L)) ** 2, feedback: t`Only **odd** multiples of $\pi/2$ satisfy $\cos kL = 0$: the second is $3\pi/2$, the third $5\pi/2$.` }],
          hints: [t`$X(0) = 0$ leaves $X = \sin kx$ with $\lambda = k^2$. Then $X'(${L}) = k\cos(${L}k) = 0$.`, t`$\cos kL = 0$ means $kL = \dfrac{\pi}{2}, \dfrac{3\pi}{2}, \dfrac{5\pi}{2}, \ldots$; the $n$-th is $\dfrac{(2n - 1)\pi}{2}$.`],
          teach: t`A fixed end and a free end give odd quarter-waves: $\lambda_n = \big((2n - 1)\pi/2L\big)^2$.`,
          explain: t`$k = \dfrac{${2 * k - 1}\pi}{2\times${L}}$, so $\lambda_${k} = ${fmt(lam, 4)}\ \text{m}^{-2}$. The frequencies go 1 : 3 : 5 : …, only odd harmonics — the sound of a pipe closed at one end.`,
          visual: modes([`sin(pi*x/(2*${L}))`], L, t`The first fixed–free eigenfunction on $[0, ${L}]$, a quarter wave. Later ones fit more quarter waves.`, { y: [-0.2, 1.2] }),
        };
      },
    }),
    expr({
      id: 'omega-n', difficulty: 2,
      prompt: t`Separating $u = X(x)T(t)$ in $u_{tt} = c^2u_{xx}$ with both ends fixed gives $T'' + c^2\lambda_nT = 0$ with $\lambda_n = (n\pi/L)^2$. Write the angular frequency $\omega_n$ of mode $n$ in terms of $n$, $c$ and $L$.`,
      answer: 'n*pi*c/L', answerTeX: t`\frac{n\pi c}{L}`, lhs: t`\omega_n`,
      vars: { n: [1, 5], c: [50, 400], L: [0.3, 2] },
      errors: [{ answer: 'n*pi/L', feedback: t`That is $\sqrt{\lambda_n}$, a wavenumber in rad/m. Multiply by $c$ for a frequency.` }, { answer: 'n*c/(2L)', feedback: t`That is $f_n$ in hertz; $\omega_n = 2\pi f_n$.` }, { answer: '(n*pi/L)^2*c^2', feedback: t`That is $\omega_n^2$, the coefficient in $T'' + \omega_n^2T = 0$. Take the square root.` }],
      hints: [t`$T'' + \omega^2T = 0$ oscillates at angular frequency $\omega$.`, t`So $\omega_n^2 = c^2\lambda_n$.`],
      teach: t`The time equation $T'' + c^2\lambda_nT = 0$ turns each eigenvalue into a frequency, $\omega_n = c\sqrt{\lambda_n}$.`,
      explain: t`$\omega_n = c\sqrt{\lambda_n} = \dfrac{n\pi c}{L}$, so $u_n = \sin\dfrac{n\pi x}{L}\big(A_n\cos\omega_nt + B_n\sin\omega_nt\big)$: a standing wave, every point moving in step.`,
      visual: { type: 'wave-string', params: { mode: 'standing', show: 'mode', n: 3, Ls: 1, FT: 50, mu: 0.005, controls: false, play: false, readout: false }, caption: 'A standing wave, mode 3: the shape sin(3πx/L) stays put while its size oscillates in time. Displacement exaggerated.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-eigenvalue', difficulty: 2,
      gen(r) {
        const L = r.pick([0.25, 0.4, 3]), k = r.int(2, 4);
        const lam = ((k * Math.PI) / L) ** 2;
        return {
          prompt: t`What is the eigenvalue $\lambda_${k}$ of $X'' + \lambda X = 0$, $X(0) = X(${L}) = 0$?`,
          answer: lam, units: 'm^-2', tol: { rel: 0.005 },
          errors: [{ value: (k * Math.PI) / L, feedback: t`Square it: $\lambda = (n\pi/L)^2$.` }],
          hints: [t`$\lambda_n = (n\pi/L)^2$.`],
          teach: t`Fixed–fixed eigenvalues are $(n\pi/L)^2$.`,
          explain: t`$\lambda_${k} = (${k}\pi/${L})^2 = ${fmt(lam, 4)}\ \text{m}^{-2}$.`,
          visual: fpic(null, [-0.05 * L, 1.05 * L], [-1, 1], t`The interval $[0, ${L}]$ with both ends fixed.`, { xlabel: 'x (m)', ylabel: 'X', points: [{ x: 0, y: 0, color: 'gold', r: 6, label: 'X = 0', labelDx: 8, labelDy: -12 }, { x: L, y: 0, color: 'gold', r: 6, label: 'X = 0', labelDx: -46, labelDy: -12 }] }),
        };
      },
    }),
    num({
      id: 'cp-feedline', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([1.2, 1.75, 2.5]), c = 349;
        const f1 = c / (4 * L);
        return {
          prompt: t`A gaseous-nitrogen purge line on an engine test stand is ${L} m long: open into a large manifold at $x = 0$ and closed by a valve at $x = ${L}$. Its pressure waves obey the wave equation with $c = 349$ m/s (nitrogen at 20 °C). The open end holds the pressure fixed, $X(0) = 0$; at the closed valve the gas cannot move, which makes $X'(${L}) = 0$. What is the line’s lowest resonant frequency?`,
          answer: f1, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: c / (2 * L), feedback: t`That is for a line with the same condition at both ends. Here one end is fixed and the other free: a quarter wave fits, not a half.` }, { value: (Math.PI * c) / (2 * L), feedback: t`That is $\omega_1$ in rad/s; divide by $2\pi$.` }],
          hints: [t`The mixed problem has $\sqrt{\lambda_1} = \dfrac{\pi}{2L}$ (a quarter wave).`, t`$f_1 = \dfrac{c\sqrt{\lambda_1}}{2\pi} = \dfrac{c}{4L}$.`],
          teach: 'A line closed at one end and open at the other resonates at odd multiples of c/4L.',
          explain: t`$f_1 = \dfrac{c}{4L} = \dfrac{349}{4\times${L}} = ${fmt(f1, 3)}$ Hz, then $3f_1$, $5f_1$, … Feed-line resonances like this are one ingredient of “pogo” and combustion instabilities, where they couple to the engine and structure. The ideal model ignores the line’s elastic walls and flow, which lower the effective $c$.`,
          visual: modes([`sin(pi*x/(2*${L}))`, `sin(3*pi*x/(2*${L}))`], L, t`Pressure shapes that satisfy both ends: zero at the open end, level at the valve. Which one has the lowest frequency?`, { y: [-1.3, 1.3] }),
        };
      },
    }),
    mcq({
      id: 'cp-discrete', difficulty: 2,
      prompt: t`Why can a string fixed at both ends vibrate freely only at certain frequencies?`,
      choices: [
        'Its shape must satisfy a boundary-value problem with zero at both ends, which has nonzero solutions only for a discrete set of eigenvalues',
        'Friction damps every other frequency away',
        'The wave equation itself only has solutions at certain frequencies, whatever the ends do',
        'Tension can take only certain values',
      ],
      answer: 0,
      why: {
        1: 'An ideal string has no friction and still has only these frequencies; damping would only make them fade.',
        2: 'On an infinitely long string any frequency travels. It is the two fixed ends that select.',
        3: 'The tension is whatever it is set to; it scales every frequency together through c.',
      },
      hints: ['What does each end impose on the mode shape X(x)?'],
      teach: 'Boundary conditions at two ends quantize: only eigenvalues give nonzero shapes, and each eigenvalue is a frequency.',
      explain: t`A free vibration is a sum of modes $X_n(x)T_n(t)$, and the shape problem $X'' + \lambda X = 0$, $X(0) = X(L) = 0$ has nonzero solutions only for $\lambda_n = (n\pi/L)^2$. Each fixes a frequency $\omega_n = c\sqrt{\lambda_n}$. The same mechanism quantizes a particle’s energy in a box.`,
      visual: { type: 'wave-string', params: { mode: 'standing', show: 'mode', n: 2, Ls: 1, FT: 50, mu: 0.005, controls: false, play: false, readout: false }, caption: 'A string vibrating in its second mode. Displacement exaggerated.' },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §4.1 (eigenvalue problems) and §4.7 One-dimensional wave equation', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Eigenvalues and eigenfunctions', url: 'https://tutorial.math.lamar.edu/Classes/DE/BVPEvals.aspx' },
    { label: 'OpenStax University Physics Vol. 1, §16.6 Standing waves and resonance', url: 'https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance' },
  ],
});
