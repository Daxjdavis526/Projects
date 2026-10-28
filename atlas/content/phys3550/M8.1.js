// Two coupled masses by the Lagrangian method (Taylor §11.1–11.4): near a
// stable equilibrium T ≈ ½q̇ᵀMq̇ and U ≈ ½qᵀKq, so Lagrange's equations are
// M q̈ = −K q; the guess q = a cos(ωt − δ) gives (K − ω²M)a = 0 and
// det(K − ω²M) = 0. PHYS 3750 W2 did springs (coupling in K, identical
// masses); here the coupling sits in the kinetic energy. Worked: the equal
// double pendulum, M = mℓ²[[2,1],[1,1]], K = mgℓ diag(2,1), ω² = (2 ∓ √2)g/ℓ,
// shapes θ₂ = ±√2 θ₁, normal coordinates. Explore: cm4-modes (double pendulum,
// unequal masses and rods). Practice: where the coupling lives, M₁₂ of an
// unequal pendulum, the slow mode, a mode shape with unequal masses, a 2×2
// det from numbers, normal coordinates, mixtures. Transfer: a helicopter's
// slung load (hook block plus load) and its slow sway.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sci, r6, distinct, G } from './_cm.js';
import { dpendPic } from './_cm2.js';
import { eigGen, matTeX, modesPic } from './_cm4.js';

const t = String.raw;
const S2 = Math.SQRT2;

const EX = (() => {
  const m = 1.2, l = 0.5;
  const w1 = Math.sqrt(((2 - S2) * G) / l), w2 = Math.sqrt(((2 + S2) * G) / l);
  return { m, l, w1, w2, T1: (2 * Math.PI) / w1, T2: (2 * Math.PI) / w2, ws: Math.sqrt(G / l) };
})();

// M and K of a double pendulum in the angles (small oscillations)
const dpMK = (m1, m2, l1, l2) => ({ M: [[(m1 + m2) * l1 * l1, m2 * l1 * l2], [m2 * l1 * l2, m2 * l2 * l2]], K: [[(m1 + m2) * G * l1, 0], [0, m2 * G * l2]] });

export default lesson({
  id: 'phys3550.M8.1',
  title: 'Two coupled masses',
  minutes: 18, difficulty: 3,
  intro: t`In [PHYS 3750](#/lesson/phys3750.W2.1) two masses were coupled by a spring, and Newton's laws gave the equations directly. The Lagrangian route works for **any** system near a stable equilibrium, however the parts are joined: expand the kinetic energy to second order in the velocities and the potential energy to second order in the displacements. Each becomes a quadratic form, written with a **mass matrix** $\mathbf M$ and a **stiffness matrix** $\mathbf K$, and Lagrange's equations come out as one matrix equation. A **normal mode** is a motion in which every coordinate swings at the same frequency $\omega$; such motions exist only at the frequencies that make $\mathbf K - \omega^2\mathbf M$ singular. In a double pendulum the two masses are coupled not by a spring but through $\mathbf M$: the lower mass rides on the upper one.`,
  equation: t`T \approx \tfrac12\,\dot{\mathbf q}^{\mathsf T}\mathbf M\,\dot{\mathbf q},\quad U \approx \tfrac12\,\mathbf q^{\mathsf T}\mathbf K\,\mathbf q \;\Longrightarrow\; \mathbf M\ddot{\mathbf q} = -\mathbf K\mathbf q,\qquad \det(\mathbf K - \omega^2\mathbf M) = 0`,
  symbols: [
    { tex: '\\mathbf q', text: 'the generalized coordinates measured from equilibrium — here the two angles $(\\theta_1, \\theta_2)$, in rad' },
    { tex: '\\mathbf M', text: 'the **mass matrix**: $T$’s coefficients, symmetric and positive definite (units: kg·m² for angles)' },
    { tex: '\\mathbf K', text: 'the **stiffness matrix**: $U$’s second derivatives at equilibrium, symmetric (N·m per rad² for angles)' },
    { tex: '\\omega', text: 'a normal-mode angular frequency, rad/s' },
    { tex: '\\mathbf a', text: 'the mode’s shape: the ratio in which the coordinates move, from $(\\mathbf K - \\omega^2\\mathbf M)\\mathbf a = 0$' },
    { tex: '\\mathsf T', text: 'the transpose: $\\dot{\\mathbf q}^{\\mathsf T}\\mathbf M\\dot{\\mathbf q} = \\sum_{ij}M_{ij}\\dot q_i\\dot q_j$' },
  ],
  why: t`Every structure, molecule and spacecraft that vibrates is analysed this way — first $\mathbf M$ and $\mathbf K$, then their modes — and a black hole's ringdown after a merger is a set of (damped) normal modes too.`,
  visual: {
    type: 'cm4-modes',
    title: 'A double pendulum’s two ways to swing',
    lead: t`Two 1 kg bobs on two 0.5 m rods. Top: the motion, exact for small swings. Middle: the two normal modes. Bottom: $\det(\mathbf K - \omega^2\mathbf M)$ against $\omega$ — it crosses zero exactly at the two mode frequencies. Press Play.`,
    tasks: [
      t`Mode 1: both bobs swing the same way, the lower one about $\sqrt2$ times as far out (in angle). Mode 2: they swing opposite ways, and much faster.`,
      t`Pull the lowest mass aside: the motion is a mixture of both modes, and never quite repeats (the frequency ratio is $1 + \sqrt2$, irrational).`,
      t`Make the lower mass light (0.1 kg): the two frequencies close in on a single pendulum's $\sqrt{g/\ell} = 4.43$ rad/s from either side, and the light bob swings more than three times as far (in angle) as the upper one.`,
    ],
    params: { system: 'chain', N: 2, m: 1, l: 0.5, start: 'mode', n: 1, panels: ['system', 'gallery', 'det'], controls: ['start', 'n', 'm2', 'l2'] },
    caption: t`Point masses on light rigid rods, no friction; small oscillations solved exactly as a sum of normal modes. Sideways swings are exaggerated for visibility. The determinant is divided by its value at $\omega = 0$.`,
  },
  example: {
    prompt: t`Two equal bobs ($m = ${EX.m}$ kg) hang on two equal light rods ($\ell = ${EX.l}$ m), one below the other. Find $\mathbf M$ and $\mathbf K$ for small oscillations, the normal-mode frequencies and their shapes.`,
    visual: dpendPic({ t1: 0.35, t2: 0.5, caption: t`The double pendulum, with both angles measured from the vertical. Angles exaggerated.` }),
    steps: [
      { label: 'Kinetic energy', text: t`The upper bob moves at $\ell\dot\theta_1$; the lower one adds its own swing to the upper bob's: $v_2^2 = \ell^2\big[\dot\theta_1^2 + \dot\theta_2^2 + 2\dot\theta_1\dot\theta_2\cos(\theta_1 - \theta_2)\big]$. To second order, $\cos \approx 1$: $T = \tfrac12m\ell^2\big[2\dot\theta_1^2 + 2\dot\theta_1\dot\theta_2 + \dot\theta_2^2\big]$.` },
      { label: 'Potential energy', text: t`$U = -2mg\ell\cos\theta_1 - mg\ell\cos\theta_2 \approx \text{const} + mg\ell\,\theta_1^2 + \tfrac12mg\ell\,\theta_2^2$.` },
      { label: 'Matrices', text: t`Reading off the quadratic forms: $$\mathbf M = m\ell^2\begin{bmatrix} 2 & 1 \\ 1 & 1 \end{bmatrix},\qquad \mathbf K = mg\ell\begin{bmatrix} 2 & 0 \\ 0 & 1 \end{bmatrix}.$$ The off-diagonal 1 in $\mathbf M$ — the cross term $\dot\theta_1\dot\theta_2$ — is the coupling.` },
      { label: 'Determinant', text: t`Write $w = \omega^2\ell/g$. Then $\det(\mathbf K - \omega^2\mathbf M) \propto (2 - 2w)(1 - w) - w^2 = w^2 - 4w + 2 = 0$, so $w = 2 \mp \sqrt2$: $$\omega_1 = \sqrt{(2 - \sqrt2)g/\ell} = ${sci(EX.w1, 3)}\ \text{rad/s},\qquad \omega_2 = \sqrt{(2 + \sqrt2)g/\ell} = ${sci(EX.w2, 3)}\ \text{rad/s}.$$` },
      { label: 'Shapes', text: t`The second row of $(\mathbf K - \omega^2\mathbf M)\mathbf a = 0$ is $-w\,a_1 + (1 - w)a_2 = 0$, so $a_2/a_1 = w/(1 - w)$: $+\sqrt2$ for $\omega_1$ (in step, lower bob further out) and $-\sqrt2$ for $\omega_2$ (opposite ways).` },
      { label: 'Normal coordinates', text: t`Any small motion is $\mathbf q = \xi_1\mathbf a_1 + \xi_2\mathbf a_2$, where each **normal coordinate** $\xi_n$ obeys its own $\ddot\xi_n = -\omega_n^2\xi_n$: two independent oscillators hidden in one coupled system.` },
      { label: 'Sense check', text: t`The mass does not enter (it scales $\mathbf M$ and $\mathbf K$ alike). A single ${EX.l} m pendulum has $\sqrt{g/\ell} = ${sci(EX.ws, 3)}$ rad/s; the slow mode is slower (the pair acts like one longer pendulum) and the fast one faster. Periods: $${sci(EX.T1, 3)}$ s and $${sci(EX.T2, 3)}$ s.` },
    ],
    answer: t`$\mathbf M = m\ell^2\begin{bmatrix} 2 & 1 \\ 1 & 1\end{bmatrix}$, $\mathbf K = mg\ell\begin{bmatrix} 2 & 0 \\ 0 & 1\end{bmatrix}$; $\omega_1 = ${sci(EX.w1, 3)}$ rad/s with $\theta_2 = \sqrt2\,\theta_1$, and $\omega_2 = ${sci(EX.w2, 3)}$ rad/s with $\theta_2 = -\sqrt2\,\theta_1$.`,
  },
  practice: [
    mcq({
      id: 'where-coupling', difficulty: 1,
      prompt: t`For the double pendulum in the angles $\theta_1, \theta_2$, $\mathbf K$ is diagonal. What couples the two angles?`,
      visual: modesPic({ N: 2, m: 1, l: 0.5, panels: ['gallery'] }, t`The double pendulum's two normal modes, side by side (swings exaggerated).`),
      choices: [t`The kinetic energy: the lower bob's velocity includes the upper bob's, giving a $\dot\theta_1\dot\theta_2$ term — an off-diagonal entry in $\mathbf M$`, t`Nothing: with $\mathbf K$ diagonal the two angles swing independently`, t`Gravity, through the off-diagonal terms of $\mathbf K$`, t`The rods' tension, which the Lagrangian leaves out`],
      answer: 0,
      why: { 1: t`The equations are $\mathbf M\ddot{\mathbf q} = -\mathbf K\mathbf q$: an off-diagonal $\mathbf M$ couples them just as well. The modes are mixtures of $\theta_1$ and $\theta_2$.`, 2: t`$\mathbf K$ is diagonal here: in these coordinates gravity's energy splits into a $\theta_1^2$ and a $\theta_2^2$ term.`, 3: t`The constraint forces do no work and drop out of the Lagrangian; their effect is already in the choice of coordinates.` },
      hints: [t`Look at $T = \tfrac12m\ell^2(2\dot\theta_1^2 + 2\dot\theta_1\dot\theta_2 + \dot\theta_2^2)$. Is there a term with both angles?`],
      teach: t`Coupling can sit in $\mathbf M$ (inertial coupling) as well as in $\mathbf K$ (a spring between masses); which one depends on the coordinates.`,
      explain: t`The cross term $\dot\theta_1\dot\theta_2$ puts the coupling in $\mathbf M$. In other coordinates (the bobs' sideways positions, as in [M8.3](#/lesson/phys3550.M8.3)) $\mathbf M$ becomes diagonal and the coupling moves into $\mathbf K$: coupling is a property of the coordinates, the modes are a property of the system.`,
    }),
    expr({
      id: 'M12', difficulty: 2,
      prompt: t`A double pendulum has bobs $m_1$ (upper) and $m_2$ (lower) on rods $\ell_1$ and $\ell_2$. Its small-oscillation kinetic energy is $T = \tfrac12(m_1 + m_2)\ell_1^2\dot\theta_1^2 + m_2\ell_1\ell_2\dot\theta_1\dot\theta_2 + \tfrac12m_2\ell_2^2\dot\theta_2^2$. What is the off-diagonal entry $M_{12}$ of the mass matrix? Type $\ell$ as \`l\`.`,
      answer: 'm_2*l_1*l_2', answerTeX: t`m_2\ell_1\ell_2`, lhs: 'M_{12}', vars: { m_1: [0.5, 2], m_2: [0.5, 2], l_1: [0.3, 1.5], l_2: [0.3, 1.5] },
      errors: [{ answer: '2*m_2*l_1*l_2', feedback: t`$T = \tfrac12\sum_{ij}M_{ij}\dot q_i\dot q_j$ counts the cross term twice ($M_{12}$ and $M_{21}$), so the coefficient of $\dot\theta_1\dot\theta_2$ in $T$ is $M_{12}$ itself.` }, { answer: '(m_1 + m_2)*l_1*l_2', feedback: t`Only the lower bob's motion mixes the two angles; the upper bob depends on $\theta_1$ alone.` }, { answer: 'm_2*l_1*l_2/2', feedback: t`The $\tfrac12$ in front of $\sum M_{ij}\dot q_i\dot q_j$ is cancelled by the two equal cross terms.` }],
      hints: [t`$\tfrac12\dot{\mathbf q}^{\mathsf T}\mathbf M\dot{\mathbf q} = \tfrac12M_{11}\dot\theta_1^2 + M_{12}\dot\theta_1\dot\theta_2 + \tfrac12M_{22}\dot\theta_2^2$.`],
      teach: t`The coefficient of a cross term $\dot q_i\dot q_j$ in $T$ is $M_{ij}$; the coefficient of $\dot q_i^2$ is $\tfrac12M_{ii}$.`,
      explain: t`Matching term by term, $M_{12} = M_{21} = m_2\ell_1\ell_2$, $M_{11} = (m_1 + m_2)\ell_1^2$ and $M_{22} = m_2\ell_2^2$. Likewise $\mathbf K = \operatorname{diag}\big((m_1 + m_2)g\ell_1,\ m_2g\ell_2\big)$.`,
      visual: dpendPic({ t1: 0.4, t2: -0.3, caption: t`A double pendulum with bobs $m_1$ and $m_2$ (drawn with equal rods).` }),
    }),
    num({
      id: 'slow-mode', difficulty: 2,
      gen(r) {
        const l = r.pick([0.3, 0.4, 0.6, 0.8, 1.2]);
        const w1 = Math.sqrt(((2 - S2) * G) / l), T1 = (2 * Math.PI) / w1;
        return {
          prompt: t`A double pendulum has equal bobs on two equal rods of length ${l} m. What is the period of its slow normal mode?`,
          answer: T1, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: 2 * Math.PI * Math.sqrt(l / G), feedback: t`That is a single ${l} m pendulum. The pair swings more slowly in its in-step mode: $\omega_1^2 = (2 - \sqrt2)g/\ell$.` }, { value: (2 * Math.PI) / Math.sqrt(((2 + S2) * G) / l), feedback: t`That is the fast (opposite-ways) mode.` }, { value: (2 * Math.PI) / Math.sqrt((2 - S2) * G * l), feedback: t`$\omega^2 = (2 - \sqrt2)\,g/\ell$: divide by $\ell$.` }], T1),
          hints: [t`$\omega_1^2 = (2 - \sqrt2)g/\ell$ from the worked example.`, t`$T = 2\pi/\omega_1$.`],
          teach: t`The equal double pendulum's slow mode has $\omega^2 = (2 - \sqrt2)g/\ell$, slower than either pendulum alone.`,
          explain: t`$\omega_1 = \sqrt{0.586\times9.8/${l}} = ${sci(w1, 3)}$ rad/s, so $T_1 = ${sci(T1, 3)}$ s — $${sci(T1 / (2 * Math.PI * Math.sqrt(l / G)), 3)}$ times a single pendulum's period.`,
          visual: modesPic({ N: 2, m: 1, l, panels: ['system'], start: 'mode', n: 1, time: 0 }, t`The double pendulum in its slow mode (swing exaggerated).`),
        };
      },
    }),
    num({
      id: 'unequal-shape', difficulty: 3,
      gen(r) {
        const m1 = 1, m2 = r.pick([0.25, 0.5, 2, 4]), l = 0.5;
        const { M, K } = dpMK(m1, m2, l, l), { w2, modes } = eigGen(K, M);
        const ratio = modes[0][1] / modes[0][0];
        return {
          prompt: t`A double pendulum has a 1 kg upper bob and a ${m2} kg lower bob, each on a 0.5 m rod: $$\mathbf M = ${matTeX(M, 3)}\ \text{kg m}^2,\quad \mathbf K = ${matTeX(K, 3)}\ \text{N m}.$$ Its slow mode has $\omega_1^2 = ${sci(w2[0], 4)}\ \text{s}^{-2}$. In that mode, what is $\theta_2/\theta_1$?`,
          answer: ratio, tol: { rel: 0.005 },
          errors: distinct([{ value: S2, feedback: t`$\sqrt2$ belongs to equal masses. Use this system's second row: $-\omega_1^2M_{21}a_1 + (K_{22} - \omega_1^2M_{22})a_2 = 0$.` }, { value: 1 / ratio, feedback: t`That is $\theta_1/\theta_2$.` }, { value: -ratio, feedback: t`Both bobs swing the same way in the slow mode: the ratio is positive.` }], ratio),
          hints: [t`Substitute $\omega_1^2$ into one row of $(\mathbf K - \omega^2\mathbf M)\mathbf a = 0$ and solve for $a_2/a_1$.`, t`Second row: $a_2/a_1 = \omega_1^2M_{21}/(K_{22} - \omega_1^2M_{22})$.`],
          teach: t`A mode's shape comes from substituting its frequency back into $(\mathbf K - \omega^2\mathbf M)\mathbf a = 0$.`,
          explain: t`$a_2/a_1 = \frac{${sci(w2[0], 4)}\times${sci(M[1][0], 3)}}{${sci(K[1][1], 3)} - ${sci(w2[0], 4)}\times${sci(M[1][1], 3)}} = ${sci(ratio, 3)}$. ${m2 < 1 ? 'A light lower bob is flung further out: it barely loads the upper pendulum.' : 'A heavy lower bob drags the upper one along: the system swings almost as one pendulum.'}`,
          visual: modesPic({ N: 2, m: [1, m2], l: [0.5, 0.5], panels: ['gallery'] }, t`The two modes of this double pendulum (bob sizes show the masses; swings exaggerated).`),
        };
      },
    }),
    num({
      id: 'det-numbers', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3]), b = r.pick([1, 2]), c = r.pick([0.5, 1]), k1 = r.pick([20, 30]), k2 = r.pick([10, 15]);
        const M = [[a, c], [c, b]], K = [[k1, 0], [0, k2]], { w2 } = eigGen(K, M), w = Math.sqrt(w2[1]);
        return {
          prompt: t`A two-coordinate system has $$\mathbf M = ${matTeX(M, 3)}\ \text{kg},\qquad \mathbf K = ${matTeX(K, 3)}\ \text{N/m}.$$ Find the higher normal-mode frequency.`,
          answer: w, units: 'rad/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(Math.max(k1 / a, k2 / b)), feedback: t`$\sqrt{K_{ii}/M_{ii}}$ ignores the coupling in $\mathbf M$. Solve $\det(\mathbf K - \omega^2\mathbf M) = 0$.` }, { value: w2[1], feedback: t`That is $\omega^2$. Take the square root.` }, { value: Math.sqrt(w2[0]), feedback: t`That is the lower frequency.` }], w),
          hints: [t`$\det\begin{bmatrix} ${k1} - ${a}\lambda & -${c}\lambda \\ -${c}\lambda & ${k2} - ${b}\lambda \end{bmatrix} = 0$ with $\lambda = \omega^2$.`, t`Expand: $(${a * b} - ${c * c})\lambda^2 - (${k1 * b + k2 * a})\lambda + ${k1 * k2} = 0$.`],
          teach: t`$\det(\mathbf K - \omega^2\mathbf M) = 0$ is a quadratic in $\omega^2$ for two coordinates.`,
          explain: t`The roots are $\omega^2 = ${sci(w2[0], 4)}$ and $${sci(w2[1], 4)}\ \text{s}^{-2}$, so $\omega_2 = ${sci(w, 3)}$ rad/s. Off-diagonal mass pushes the two frequencies apart, as a coupling spring would.`,
          visual: modesPic({ system: 'chain', N: 2, m: 1, l: 0.5, panels: ['det'] }, t`What the computation does, for a double pendulum: $\det(\mathbf K - \omega^2\mathbf M)$ against $\omega$ crosses zero at each normal-mode frequency.`),
        };
      },
    }),
    mcq({
      id: 'mixture', difficulty: 2,
      prompt: t`An equal double pendulum is started from rest with **both** rods tilted $5^\circ$ the same way ($\theta_1 = \theta_2$). What happens?`,
      visual: dpendPic({ t1: 0.3, t2: 0.3, caption: t`The starting position: both rods tilted the same way (angle exaggerated).` }),
      choices: [t`A mixture of both modes: the shape changes as it swings, and the motion never exactly repeats`, t`It swings in the slow mode, because both rods lean the same way`, t`It swings in the fast mode`, t`It stays straight and rotates as one rigid rod`],
      answer: 0,
      why: { 1: t`The slow mode needs $\theta_2 = \sqrt2\,\theta_1$, not $\theta_2 = \theta_1$. This start is mostly slow mode, with some fast mode mixed in.`, 2: t`The fast mode has the rods leaning opposite ways.`, 3: t`The joint is free to bend; nothing keeps the rods in line.` },
      hints: [t`Is $(1, 1)$ a multiple of either mode shape, $(1, \sqrt2)$ or $(1, -\sqrt2)$?`],
      teach: t`Any start that is not exactly a mode shape excites both modes, each swinging at its own frequency.`,
      explain: t`$(1, 1)$ is a combination of $(1, \sqrt2)$ and $(1, -\sqrt2)$, so both modes run. Their frequency ratio is $\sqrt{(2 + \sqrt2)/(2 - \sqrt2)} = 1 + \sqrt2$, irrational, so the shape never exactly recurs — though at small amplitude it stays perfectly regular (this is not chaos; large swings are another matter).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sling', difficulty: 3, transfer: true,
      gen(r) {
        const m1 = r.pick([60, 100]), l1 = r.pick([10, 15, 20]), m2 = r.pick([800, 1500]), l2 = r.pick([3, 5]);
        const { M, K } = dpMK(m1, m2, l1, l2), { w2 } = eigGen(K, M), T = (2 * Math.PI) / Math.sqrt(w2[0]);
        return {
          prompt: t`A hovering helicopter carries a load on a long line: a ${m1} kg hook block hangs $${l1}\ \text{m}$ below the aircraft, and a ${m2} kg load hangs on a $${l2}\ \text{m}$ sling below the hook. Treat the helicopter as a fixed pivot and both lines as light and rigid (a double pendulum). What is the period of the slow sway?`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: distinct([{ value: 2 * Math.PI * Math.sqrt((l1 + l2) / G), feedback: t`A single pendulum of the combined length is close, but the bend at the hook changes it. Solve $\det(\mathbf K - \omega^2\mathbf M) = 0$ for this double pendulum.` }, { value: 2 * Math.PI * Math.sqrt(l1 / G), feedback: t`That is the upper line alone. The heavy load below slows the sway.` }, { value: (2 * Math.PI) / Math.sqrt(w2[1]), feedback: t`That is the fast mode, the hook bouncing between the line and the load.` }], T),
          hints: [t`$\mathbf M = \begin{bmatrix} (m_1 + m_2)\ell_1^2 & m_2\ell_1\ell_2 \\ m_2\ell_1\ell_2 & m_2\ell_2^2 \end{bmatrix}$, $\mathbf K = g\begin{bmatrix} (m_1 + m_2)\ell_1 & 0 \\ 0 & m_2\ell_2 \end{bmatrix}$.`, t`Solve the quadratic $\det(\mathbf K - \lambda\mathbf M) = 0$ for the smaller $\lambda = \omega^2$, then $T = 2\pi/\sqrt\lambda$.`],
          teach: t`A slung load is a double pendulum; its slow sway sets how gently the pilot must manoeuvre.`,
          explain: t`The roots are $\omega^2 = ${sci(w2[0], 3)}$ and $${sci(w2[1], 3)}\ \text{s}^{-2}$; the slow sway has period $${sci(T, 3)}$ s, a little longer than a single $${l1 + l2}$ m pendulum's $${sci(2 * Math.PI * Math.sqrt((l1 + l2) / G), 3)}$ s. A real helicopter is not a fixed pivot (it moves in response) and the load swings in three dimensions, so treat this as the first estimate.`,
          visual: modesPic({ N: 2, m: [m1, m2], l: [l1, l2], panels: ['system'], start: 'mode', n: 1 }, t`The hook block (blue) and the load (orange) below a fixed pivot, in the slow mode. Lengths to scale, swing exaggerated.`),
        };
      },
    }),
    num({
      id: 'cp-ratio', difficulty: 2,
      prompt: t`For an equal double pendulum, what is the ratio of the fast normal-mode frequency to the slow one, $\omega_2/\omega_1$?`,
      answer: 1 + S2, tol: { rel: 0.003 },
      errors: [{ value: (2 + S2) / (2 - S2), feedback: t`That is $\omega_2^2/\omega_1^2$. Take the square root.` }, { value: S2, feedback: t`$\sqrt2$ is the mode-shape ratio $\theta_2/\theta_1$, not a frequency ratio.` }],
      hints: [t`$\omega^2 = (2 \mp \sqrt2)g/\ell$, so $\omega_2/\omega_1 = \sqrt{(2 + \sqrt2)/(2 - \sqrt2)}$.`, t`Multiply top and bottom by $2 + \sqrt2$: the ratio simplifies to $1 + \sqrt2$.`],
      teach: t`The equal double pendulum's frequencies stand in the ratio $1 + \sqrt2$, whatever $m$, $\ell$ and $g$.`,
      explain: t`$\sqrt{\frac{2 + \sqrt2}{2 - \sqrt2}} = \sqrt{\frac{(2 + \sqrt2)^2}{2}} = \frac{2 + \sqrt2}{\sqrt2} = 1 + \sqrt2 \approx 2.414$. An irrational ratio: a mixture of the two modes never repeats exactly.`,
      visual: modesPic({ N: 2, m: 1, l: 0.5, panels: ['det'] }, t`$\det(\mathbf K - \omega^2\mathbf M)$ for an equal double pendulum: its two zeros are the two mode frequencies.`),
    }),
    mcq({
      id: 'cp-amplitude', difficulty: 2,
      prompt: t`A double pendulum's slow mode is started with twice the amplitude (still small). What happens to its frequency?`,
      visual: modesPic({ N: 2, m: 1, l: 0.5, panels: ['gallery'] }, t`The two normal modes of an equal double pendulum.`),
      choices: [t`Nothing: in the linear (small-oscillation) theory the frequencies depend only on $\mathbf M$ and $\mathbf K$`, t`It doubles`, t`It halves`, t`It rises by $\sqrt2$`],
      answer: 0,
      why: { 1: t`$\det(\mathbf K - \omega^2\mathbf M) = 0$ has no amplitude in it.`, 2: t`Larger amplitude does not slow a linear oscillator. (At large angles real pendulums do slow down — but that is outside the quadratic approximation.)`, 3: t`Amplitude does not enter the frequency equation at all.` },
      hints: [t`Which quantities appear in $\det(\mathbf K - \omega^2\mathbf M) = 0$?`],
      teach: t`Normal-mode frequencies of a linear system do not depend on amplitude.`,
      explain: t`The frequencies come from $\mathbf M$ and $\mathbf K$ alone; the amplitude only scales the mode. That is the content of "small oscillations": keep the swings small enough that $\cos\theta \approx 1 - \theta^2/2$ and the theory is exact.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §11.1–11.5: two masses and two springs, the double pendulum', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'L. D. Landau and E. M. Lifshitz, Mechanics, 3rd ed. (1976), §23: oscillations of systems with more than one degree of freedom', url: 'https://archive.org/details/Mechanics_541' },
  ],
});
