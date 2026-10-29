// The general method (Taylor §11.5–11.7; Goldstein §6.1–6.2): near a
// stable equilibrium q₀, M_ij = ∂²T/∂q̇ᵢ∂q̇ⱼ and K_ij = ∂²U/∂qᵢ∂qⱼ (the
// Hessian), both at q₀; (K − ω²M)a = 0; the modes are M-orthogonal, so
// normal coordinates diagonalize T and U together, and a start from rest at
// q₀ splits as c_n = a_nᵀMq₀. K positive definite ⇔ stable; a negative
// eigenvalue (ω² < 0) ⇔ exponential runaway; ω = 0 ⇔ a zero mode (a free
// system sliding as a whole). Worked: a cart on a spring with a pendulum
// tuned to it — a tuned-mass damper — whose single resonance at 3.13 rad/s
// splits into 2.67 and 3.66 rad/s. Explore: cm4-modes (cart). Practice: the
// Hessian of a 2D bowl, instability, a free two-body zero mode, the energy
// split of a start, the recipe, properties, a three-storey building.
// Transfer: tuning a skyscraper's pendulum damper. Numerics: prog.P10.1 (eigh).
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct, G } from './_cm.js';
import { eigGen, eigSym, matTeX, modesPic } from './_cm4.js';

const t = String.raw;

const TMD = (() => {
  const Mc = 2, k = 19.6, m = 0.2, l = 1;
  const M = [[Mc + m, m * l], [m * l, m * l * l]], K = [[k, 0], [0, m * G * l]];
  const { w2, modes } = eigGen(K, M), w = w2.map(Math.sqrt);
  const q0 = [0.05, 0], Mq = [M[0][0] * q0[0] + M[0][1] * q0[1], M[1][0] * q0[0] + M[1][1] * q0[1]];
  const c = modes.map((a) => a[0] * Mq[0] + a[1] * Mq[1]), E = w.map((x, i) => 0.5 * x * x * c[i] * c[i]);
  return { Mc, k, m, l, M, K, w2, w, modes, ratio: modes.map((a) => a[1] / a[0]), w0: Math.sqrt(k / Mc), c, E, f1: E[0] / (E[0] + E[1]) };
})();

// a two-mass free body: two blocks joined by a spring
const tetherPic = (cap) => gpic({ x: [-0.3, 6.3], y: [-0.5, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '0.8', lower: '0', from: 0, to: 1.4, color: 'accent', alpha: 0.4 }, { fn: '0.6', lower: '0.1', from: 4.6, to: 5.6, color: 'warn', alpha: 0.4 }], curves: [{ param: ['1.4 + 3.2*t', '0.4 + 0.12*sin(14*pi*t)'], t: [0, 1], color: 'ink2', width: 1.6 }], points: [lab(0.7, 1.05, 'm₁', 'accent'), lab(5.1, 0.85, 'm₂', 'warn')] }, cap, 'Two blocks joined by a spring, floating free');

// a schematic shear building: floors as slabs, columns as lines
function buildingPic(n, cap) {
  const curves = [seg([-1.2, 0], [1.2, 0], 'ink3', 2)];
  for (let i = 1; i <= n; i++) {
    curves.push(seg([-0.8, i - 1], [-0.8, i], 'ink2', 1.6), seg([0.8, i - 1], [0.8, i], 'ink2', 1.6));
  }
  return gpic({ x: [-2.2, 2.2], y: [-0.3, n + 0.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [...Array(n).keys()].map((i) => ({ fn: r6(i + 1 + 0.08), lower: r6(i + 1 - 0.08), from: -0.95, to: 0.95, color: 'accent', alpha: 0.7 })), curves, points: [...Array(n).keys()].map((i) => lab(1.05, i + 1, `m`, 'accent')) }, cap, `A ${n}-storey building drawn as floors on columns`);
}

export default lesson({
  id: 'phys3550.M8.2',
  title: 'The general method: eigenvalue problems',
  minutes: 20, difficulty: 4,
  intro: t`[M8.1](#/lesson/phys3550.M8.1) built $\mathbf M$ and $\mathbf K$ for one system by hand. The recipe works for **any** system with $n$ coordinates sitting near a stable equilibrium $\mathbf q_0$: the mass matrix is $T$'s second derivatives with respect to the velocities, and the stiffness matrix is the **Hessian** of $U$ — its matrix of second derivatives — both evaluated at equilibrium. Then the motion is $n$ independent oscillators. The eigenvalue problem $(\mathbf K - \omega^2\mathbf M)\mathbf a = 0$ is a *generalized* one: the modes are perpendicular not in the ordinary sense but **with $\mathbf M$ as the ruler**, $\mathbf a_m^{\mathsf T}\mathbf M\,\mathbf a_n = 0$. The signs of $\omega^2$ say everything about stability: all positive, the equilibrium is stable; one negative, it runs away; one zero, part of the system can drift freely.`,
  equation: t`M_{ij} = \frac{\partial^2T}{\partial\dot q_i\,\partial\dot q_j}\bigg|_{\mathbf q_0},\quad K_{ij} = \frac{\partial^2U}{\partial q_i\,\partial q_j}\bigg|_{\mathbf q_0};\qquad (\mathbf K - \omega_n^2\mathbf M)\,\mathbf a_n = 0,\quad \mathbf a_m^{\mathsf T}\mathbf M\,\mathbf a_n = \delta_{mn}`,
  symbols: [
    { tex: '\\mathbf q_0', text: 'the equilibrium, where every $\\partial U/\\partial q_i = 0$' },
    { tex: 'M_{ij},\\ K_{ij}', text: 'the mass and stiffness matrices: second derivatives of $T$ and $U$ at $\\mathbf q_0$ (units depend on the coordinates)' },
    { tex: '\\omega_n,\\ \\mathbf a_n', text: 'the $n$-th normal frequency (rad/s) and its mode shape' },
    { tex: '\\delta_{mn}', text: '1 if $m = n$, 0 otherwise: the modes are normalized and $\\mathbf M$-orthogonal' },
    { tex: 'c_n = \\mathbf a_n^{\\mathsf T}\\mathbf M\\,\\mathbf q(0)', text: 'how much of mode $n$ a start from rest at $\\mathbf q(0)$ contains; then $\\mathbf q(t) = \\sum_n c_n\\mathbf a_n\\cos\\omega_nt$' },
  ],
  why: t`This is how every vibration analysis is done — a launch vehicle's bending modes, a molecule's infrared lines, a bridge in the wind — usually by a computer solving $\mathbf K\mathbf a = \omega^2\mathbf M\mathbf a$ for thousands of coordinates ([scipy's \`eigh(K, M)\`](#/lesson/prog.P10.1)). And the same expansion about equilibrium gives the stability of orbits and of Lagrange points.`,
  visual: {
    type: 'cm4-modes',
    title: 'A tuned-mass damper',
    lead: t`A 2 kg cart on a spring (a building's floor, in miniature) with a 0.2 kg pendulum hanging from it. On its own the cart would oscillate at $\sqrt{k/M_c}$; the pendulum alone at $\sqrt{g/\ell} = 3.13$ rad/s. Together: two modes, and $\det(\mathbf K - \omega^2\mathbf M)$ shows where.`,
    tasks: [
      t`With $k = 19.6$ N/m the cart and pendulum are tuned to the same 3.13 rad/s — yet neither normal mode is at 3.13: they split to about 2.67 and 3.66 rad/s.`,
      t`Pull the cart aside and Play: its swing dies away as the pendulum takes the energy, then comes back. A real damper adds friction to the pendulum so the energy never returns.`,
      t`Stiffen the spring to 60 N/m: the modes separate into "mostly cart" and "mostly pendulum", and the coupling barely matters.`,
    ],
    params: { system: 'cart', Mc: 2, k: 19.6, m1: 0.2, l1: 1, start: 'pluck', panels: ['system', 'gallery', 'det'], controls: ['start', 'k'] },
    caption: t`A cart on a spring with a pendulum hanging from it: no friction, small oscillations solved exactly as a sum of the two normal modes. Swings exaggerated for visibility. The determinant is divided by its value at $\omega = 0$.`,
  },
  example: {
    prompt: t`A ${TMD.Mc} kg cart on a spring ($k = ${TMD.k}$ N/m) carries a pendulum: a ${TMD.m} kg bob on a ${TMD.l} m light rod. Using $x$ (the cart) and $\theta$ (the pendulum) as coordinates, find $\mathbf M$, $\mathbf K$ and the normal modes. If the cart is pulled 5 cm aside and released, how is the energy shared between the modes?`,
    visual: modesPic({ system: 'cart', Mc: TMD.Mc, k: TMD.k, m1: TMD.m, l1: TMD.l, panels: ['system'], start: 'pluck', time: 0.6 }, t`The cart and its pendulum a moment after release (swing exaggerated).`),
    steps: [
      { label: 'Energies', text: t`The bob is at $(x + \ell\sin\theta,\ -\ell\cos\theta)$, so $T = \tfrac12(M_c + m)\dot x^2 + m\ell\cos\theta\,\dot x\dot\theta + \tfrac12m\ell^2\dot\theta^2$ and $U = \tfrac12kx^2 - mg\ell\cos\theta$.` },
      { label: 'Expand', text: t`Equilibrium is $x = \theta = 0$. To second order, set $\cos\theta = 1$ in $T$ (the $\dot x\dot\theta$ term is already second order), and $U \approx \tfrac12kx^2 + \tfrac12mg\ell\,\theta^2 + \text{const}$.` },
      { label: 'Matrices', text: t`$$\mathbf M = \begin{bmatrix} M_c + m & m\ell \\ m\ell & m\ell^2 \end{bmatrix} = ${matTeX(TMD.M, 3)},\quad \mathbf K = \begin{bmatrix} k & 0 \\ 0 & mg\ell \end{bmatrix} = ${matTeX(TMD.K, 3)}.$$` },
      { label: 'Frequencies', text: t`$\det(\mathbf K - \omega^2\mathbf M) = 0$ gives $\omega^2 = ${sci(TMD.w2[0], 4)}$ and $${sci(TMD.w2[1], 4)}\ \text{s}^{-2}$: $\omega_1 = ${sci(TMD.w[0], 3)}$ and $\omega_2 = ${sci(TMD.w[1], 3)}$ rad/s, either side of the tuned $${sci(TMD.w0, 3)}$ rad/s.` },
      { label: 'Shapes', text: t`From the second row, $\theta/x = \omega^2m\ell/(mg\ell - \omega^2m\ell^2)$: $${sci(TMD.ratio[0], 3)}$ rad/m (pendulum in step with the cart) and $${sci(TMD.ratio[1], 3)}$ rad/m (against it). Check: $\mathbf a_1^{\mathsf T}\mathbf M\mathbf a_2 = 0$ — orthogonal with $\mathbf M$ as the ruler, not in the ordinary sense.` },
      { label: 'Project the start', text: t`With $\mathbf M$-normalized modes, $c_n = \mathbf a_n^{\mathsf T}\mathbf M\mathbf q(0)$ for $\mathbf q(0) = (0.05\ \text{m}, 0)$, and mode $n$ holds energy $\tfrac12\omega_n^2c_n^2$: $${sci(TMD.E[0] * 1000, 3)}$ and $${sci(TMD.E[1] * 1000, 3)}$ mJ, adding to $\tfrac12kx_0^2 = ${sci(0.5 * TMD.k * 0.0025 * 1000, 3)}$ mJ ✓. About $${Math.round(TMD.f1 * 100)}\%$ is in the slow mode.` },
      { label: 'Why it damps', text: t`Two nearly equal frequencies beat: the cart's swing fades as the pendulum's grows, at the beat rate $(\omega_2 - \omega_1)/2$. Give the pendulum friction and the energy it takes never comes back — the principle of the tuned-mass damper.` },
    ],
    answer: t`$\omega_1 = ${sci(TMD.w[0], 3)}$ rad/s (in step) and $\omega_2 = ${sci(TMD.w[1], 3)}$ rad/s (against); a 5 cm push puts about $${Math.round(TMD.f1 * 100)}\%$ of the energy in the slow mode and the rest in the fast one.`,
  },
  practice: [
    num({
      id: 'hessian', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 1, 2]), k = r.pick([8, 10, 12]), e = r.pick([2, 3, 4]);
        const w = Math.sqrt((k + e) / m);
        const ell = (c, s) => { const a = Math.sqrt((2 * c) / (k + e)), b = Math.sqrt((2 * c) / (k - e)); return { param: [`${r6(a / Math.SQRT2)}*cos(t) - ${r6(b / Math.SQRT2)}*sin(t)`, `${r6(a / Math.SQRT2)}*cos(t) + ${r6(b / Math.SQRT2)}*sin(t)`], t: [0, 6.2832], color: s, width: 1.4 }; };
        return {
          prompt: t`A ${m} kg puck slides on a frictionless table in the potential $U = \tfrac12(${k})(x^2 + y^2) + ${e}\,xy$ (J, with $x, y$ in m). Find $\mathbf K$ at the equilibrium $x = y = 0$ and the **higher** normal-mode frequency.`,
          answer: w, units: 'rad/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(k / m), feedback: t`That ignores the cross term. $K_{xy} = \partial^2U/\partial x\partial y = ${e}$, so $\mathbf K = \begin{bmatrix} ${k} & ${e} \\ ${e} & ${k} \end{bmatrix}$.` }, { value: Math.sqrt((k + e / 2) / m), feedback: t`$\partial^2(${e}xy)/\partial x\partial y = ${e}$, not $${e / 2}$.` }, { value: Math.sqrt((k - e) / m), feedback: t`That is the lower frequency, the mode along $(1, -1)$.` }], w),
          hints: [t`$K_{xx} = \partial^2U/\partial x^2$, $K_{xy} = \partial^2U/\partial x\,\partial y$, and so on; here $\mathbf M = m\mathbf 1$.`, t`$\mathbf K = \begin{bmatrix} ${k} & ${e} \\ ${e} & ${k} \end{bmatrix}$ has eigenvalues $${k} \pm ${e}$ on $(1, \pm1)$; $\omega^2 = \lambda/m$.`],
          teach: t`The stiffness matrix is the Hessian of the potential at equilibrium.`,
          explain: t`$\mathbf K$ has eigenvalues $${k + e}$ and $${k - e}$ N/m along $(1, 1)$ and $(1, -1)$, so $\omega = \sqrt{${k + e}/${m}} = ${sci(w, 3)}$ rad/s along the diagonal $y = x$ — where the bowl is steepest. The equipotentials are ellipses tilted at $45^\circ$: the modes lie along their axes.`,
          visual: gpic({ x: [-1.2, 1.2], y: [-1.2, 1.2], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', curves: [ell(0.5, 'ink3'), ell(2, 'ink3'), ell(4.5, 'ink3')], points: [{ x: 0, y: 0, color: 'gold', r: 5 }] }, t`Contours of $U$ (equal steps of energy) around the equilibrium (gold).`, 'Tilted elliptical contours'),
        };
      },
    }),
    mcq({
      id: 'unstable', difficulty: 2,
      prompt: t`At an equilibrium, $\mathbf K$ turns out to have one negative eigenvalue (and $\mathbf M$, as always, is positive definite). What does the system do near that equilibrium?`,
      visual: gpic({ x: [-2, 2], y: [-1.6, 1.6], xlabel: 'q (along the mode)', ylabel: 'U', curves: [{ fn: '-0.4*x^2', color: 'bad', width: 2.2 }], points: [{ x: 0, y: 0, color: 'gold', r: 5, label: 'equilibrium', labelDx: 8, labelDy: 14 }] }, t`$U$ along the mode with the negative stiffness: a hilltop, not a valley.`, 'A downward parabola'),
      choices: [t`That mode has $\omega^2 < 0$: it grows as $e^{\gamma t}$ with $\gamma = \sqrt{-\omega^2}$, so the equilibrium is unstable`, t`That mode oscillates with an imaginary amplitude`, t`The system is still stable, because $\mathbf M$ is positive`, t`That mode just has zero frequency and drifts`],
      answer: 0,
      why: { 1: t`An imaginary $\omega$ makes $e^{i\omega t}$ real exponentials, $e^{\pm\gamma t}$; the growing one wins.`, 2: t`$\mathbf M$ is always positive definite (kinetic energy is positive); stability is decided by $\mathbf K$ alone.`, 3: t`A zero eigenvalue gives drift; a negative one gives exponential runaway.` },
      hints: [t`Along that mode, $\ddot\xi = -\omega^2\xi$ with $\omega^2 < 0$, i.e. $\ddot\xi = +\gamma^2\xi$.`],
      teach: t`A negative eigenvalue of the Hessian means $\omega^2 < 0$: exponential runaway along that mode.`,
      explain: t`$\ddot\xi = \gamma^2\xi$ gives $\xi = Ae^{\gamma t} + Be^{-\gamma t}$, and any knock excites the growing part. The intermediate-axis spin of [M7.3](#/lesson/phys3550.M7.3) and the collinear Lagrange points L1–L3 are equilibria of exactly this kind.`,
    }),
    num({
      id: 'zero-mode', difficulty: 2,
      gen(r) {
        const m1 = r.pick([200, 400, 600]), m2 = r.pick([50, 100, 150]), k = r.pick([200, 500, 800]);
        const w = Math.sqrt((k * (m1 + m2)) / (m1 * m2));
        return {
          prompt: t`Two spacecraft, ${m1} kg and ${m2} kg, float free in space joined by a tether that acts as a spring with $k = ${k}$ N/m along the line between them. Moving along that line only, the system has two normal modes. One has $\omega = 0$. What is the other?`,
          answer: w, units: 'rad/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(k / m1), feedback: t`That holds $m_2$ fixed. Both craft move; the spring acts on the reduced mass $\mu = m_1m_2/(m_1 + m_2)$.` }, { value: Math.sqrt(k / (m1 + m2)), feedback: t`The total mass belongs to the zero mode (the pair drifting together). The vibration uses the reduced mass.` }, { value: Math.sqrt(k / m2), feedback: t`That holds $m_1$ fixed. Use the reduced mass.` }], w),
          hints: [t`$\mathbf M = \operatorname{diag}(m_1, m_2)$, $\mathbf K = k\begin{bmatrix} 1 & -1 \\ -1 & 1 \end{bmatrix}$. $\det\mathbf K = 0$ — that is the zero mode.`, t`The other root of $\det(\mathbf K - \omega^2\mathbf M) = 0$ is $\omega^2 = k(m_1 + m_2)/(m_1m_2)$.`],
          teach: t`A free system has a zero mode for each way it can move as a whole; the vibrations use what is left (here, the reduced mass).`,
          explain: t`$\omega^2 = k\left(\frac1{m_1} + \frac1{m_2}\right) = ${sci(w * w, 3)}\ \text{s}^{-2}$, so $\omega = ${sci(w, 3)}$ rad/s, with the craft moving opposite ways in the ratio $m_2 : m_1$ so the centre of mass stays put. The zero mode is the pair sliding together: $\mathbf K$ is singular because translation stretches no spring.`,
          visual: tetherPic(t`Two spacecraft joined by a springy tether, free in space (schematic).`),
        };
      },
    }),
    num({
      id: 'energy-split', difficulty: 3,
      gen(r) {
        const k = r.pick([15, 19.6, 30]), m = r.pick([0.2, 0.4]), Mc = 2, l = 1;
        const M = [[Mc + m, m * l], [m * l, m * l * l]], K = [[k, 0], [0, m * G * l]], { w2, modes } = eigGen(K, M);
        const Mq = [M[0][0] * 0.05, M[1][0] * 0.05];   // M q(0) for q(0) = (0.05 m, 0)
        const c = modes.map((a) => a[0] * Mq[0] + a[1] * Mq[1]), E = w2.map((x, i) => 0.5 * x * c[i] * c[i]), f = E[0] / (E[0] + E[1]);
        return {
          prompt: t`The cart-and-pendulum of the worked example, now with $k = ${k}$ N/m and a ${m} kg bob (cart 2 kg, rod 1 m), has $\omega_1^2 = ${sci(w2[0], 4)}$ and $\omega_2^2 = ${sci(w2[1], 4)}\ \text{s}^{-2}$ and $\mathbf M$-normalized modes $\mathbf a_1 = (${sci(modes[0][0], 4)},\ ${sci(modes[0][1], 4)})$, $\mathbf a_2 = (${sci(modes[1][0], 4)},\ ${sci(modes[1][1], 4)})$ (in m and rad). The cart is pulled 5 cm aside and released with the pendulum hanging straight. What fraction of the energy goes into the slow mode?`,
          answer: f, tol: { rel: 0.01 },
          errors: distinct([{ value: (modes[0][0] * 0.05) ** 2 / ((modes[0][0] * 0.05) ** 2 + (modes[1][0] * 0.05) ** 2), feedback: t`Project with $\mathbf M$: $c_n = \mathbf a_n^{\mathsf T}\mathbf M\mathbf q(0)$, and weight each mode's energy by $\omega_n^2$.` }, { value: c[0] ** 2 / (c[0] ** 2 + c[1] ** 2), feedback: t`Each mode's energy is $\tfrac12\omega_n^2c_n^2$: the frequencies differ, so weight by $\omega_n^2$.` }, { value: 1 - f, feedback: t`That is the fast mode's share.` }], f),
          hints: [t`$\mathbf M\mathbf q(0) = (M_{11}, M_{21})\times0.05$; then $c_n = \mathbf a_n\cdot\mathbf M\mathbf q(0)$.`, t`Energy in mode $n$: $\tfrac12\omega_n^2c_n^2$. The fraction is $E_1/(E_1 + E_2)$.`],
          teach: t`A start splits into modes by $c_n = \mathbf a_n^{\mathsf T}\mathbf M\mathbf q(0)$, and each mode keeps its energy $\tfrac12\omega_n^2c_n^2$ for ever.`,
          explain: t`$c_1 = ${sci(c[0], 3)}$ and $c_2 = ${sci(c[1], 3)}$, so $E_1 = ${sci(E[0] * 1000, 3)}$ mJ and $E_2 = ${sci(E[1] * 1000, 3)}$ mJ: a fraction $${sci(f, 3)}$ in the slow mode. In a linear system nothing moves energy between modes: the sloshing you see is the two modes beating, each with its share fixed.`,
          visual: modesPic({ system: 'cart', Mc: 2, k, m1: m, l1: 1, panels: ['gallery'] }, t`The two modes of this cart-and-pendulum (swings exaggerated).`),
        };
      },
    }),
    order({
      id: 'recipe', difficulty: 2,
      prompt: t`Put the general method for small oscillations in order.`,
      visual: modesPic({ system: 'cart', Mc: 2, k: 19.6, m1: 0.2, l1: 1, panels: ['det'] }, t`Step four, drawn: $\det(\mathbf K - \omega^2\mathbf M)$ for the tuned cart and pendulum.`),
      items: [t`Choose coordinates and find the equilibrium: $\partial U/\partial q_i = 0$`, t`Expand: $\mathbf M$ from $T$'s velocity terms, $\mathbf K$ from $U$'s second derivatives, both at equilibrium`, t`Solve $\det(\mathbf K - \omega^2\mathbf M) = 0$ for the $\omega_n^2$ (all positive means stable)`, t`For each $\omega_n$, solve $(\mathbf K - \omega_n^2\mathbf M)\mathbf a_n = 0$ for its shape`, t`Fit the initial conditions: $c_n = \mathbf a_n^{\mathsf T}\mathbf M\mathbf q(0)$ with normalized modes`],
      hints: [t`You cannot expand about an equilibrium you have not found; you cannot find shapes before frequencies.`],
      teach: t`Equilibrium, expansion, frequencies, shapes, then the initial conditions.`,
      explain: t`The expansion happens at the equilibrium, the shapes need the frequencies, and the initial conditions need the shapes. With many coordinates, steps 3–4 are one call to a generalized symmetric eigen-solver.`,
    }),
    multi({
      id: 'facts', difficulty: 3,
      prompt: t`Which statements hold for every system of small oscillations about a stable equilibrium, with $n$ coordinates?`,
      visual: modesPic({ N: 3, m: [1, 0.6, 0.3], l: [0.4, 0.3, 0.3], panels: ['gallery'] }, t`The three modes of a three-bob hanging chain with unequal bobs.`),
      choices: [t`There are $n$ normal modes (counting any zero modes)`, t`The modes are orthogonal with $\mathbf M$ as the weight: $\mathbf a_m^{\mathsf T}\mathbf M\mathbf a_n = 0$ for $m \ne n$`, t`Any small motion is a sum of the modes, each at its own frequency`, t`The mode vectors are always perpendicular in the ordinary sense, $\mathbf a_m\cdot\mathbf a_n = 0$`, t`The frequencies depend on the amplitude of the motion`],
      answer: [0, 1, 2],
      why: { 3: t`Only when $\mathbf M$ is a multiple of the identity. The double pendulum's $(1, \sqrt2)$ and $(1, -\sqrt2)$ have dot product $-1$.`, 4: t`In the quadratic approximation the equations are linear and the frequencies come from $\mathbf M$ and $\mathbf K$ only.` },
      hints: [t`$\mathbf M$ and $\mathbf K$ are symmetric $n\times n$ matrices with $\mathbf M$ positive definite. What does the generalized spectral theorem promise?`, t`Check ordinary orthogonality on the double pendulum's modes.`],
      teach: t`$n$ coordinates give $n$ modes, complete and orthogonal with $\mathbf M$ as the weight, at amplitude-independent frequencies.`,
      explain: t`Substituting $\mathbf q = \mathbf M^{-1/2}\mathbf y$ turns the problem into an ordinary symmetric eigenproblem for $\mathbf M^{-1/2}\mathbf K\mathbf M^{-1/2}$: $n$ real eigenvalues and orthonormal $\mathbf y$'s, which become $\mathbf M$-orthonormal $\mathbf a$'s. Completeness is what lets any initial condition be written as a sum of modes.`,
    }),
    num({
      id: 'storeys', difficulty: 3,
      gen(r) {
        const m = r.pick([2, 3, 5]) * 1e5, k = r.pick([2, 4, 6]) * 1e7;
        const A = [[2, -1, 0], [-1, 2, -1], [0, -1, 1]], { vals } = eigSym(A), w = Math.sqrt((vals[0] * k) / m), T = (2 * Math.PI) / w;
        return {
          prompt: t`A three-storey building is modelled as three equal floors of mass $m = ${sci(m, 2)}$ kg on columns, each storey's columns acting as a spring of stiffness $k = ${sci(k, 2)}$ N/m against sideways sway. With $x_i$ the floors' sideways displacements, $\mathbf M = m\mathbf 1$ and $$\mathbf K = k\begin{bmatrix} 2 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 1 \end{bmatrix}.$$ The smallest eigenvalue of that matrix is $${sci(vals[0], 4)}$. What is the building's fundamental period?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: 2 * Math.PI * Math.sqrt(m / k), feedback: t`That is one floor on one storey. The building's slowest mode has $\omega^2 = ${sci(vals[0], 3)}\,k/m$.` }, { value: (2 * Math.PI) / ((vals[0] * k) / m), feedback: t`$\omega^2 = \lambda k/m$; take the square root before $T = 2\pi/\omega$.` }], T),
          hints: [t`$\det(\mathbf K - \omega^2\mathbf M) = 0$ with $\mathbf M = m\mathbf 1$ means $\omega^2 = (k/m)\lambda$, with $\lambda$ an eigenvalue of the integer matrix.`, t`$\omega_1 = \sqrt{${sci(vals[0], 4)}\,k/m}$; $T = 2\pi/\omega_1$.`],
          teach: t`With equal masses, the frequencies come straight from the eigenvalues of the stiffness pattern.`,
          explain: t`$\omega_1 = \sqrt{${sci(vals[0], 4)}\times${sci(k / m, 3)}} = ${sci(w, 3)}$ rad/s, so $T_1 = ${sci(T, 3)}$ s. (The top floor has only one storey of columns below it and none above: that is the 1 in the corner.) For a real building engineers use the same matrices with thousands of coordinates.`,
          visual: buildingPic(3, t`A three-storey shear building: rigid floors on flexible columns. Schematic.`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tmd', difficulty: 2, transfer: true,
      gen(r) {
        const T0 = r.pick([4, 5, 6, 7]);
        const l = G * (T0 / (2 * Math.PI)) ** 2;
        return {
          prompt: t`A skyscraper's fundamental sway has a period of ${T0} s. Engineers hang a heavy pendulum near the top as a tuned-mass damper, tuned so that the pendulum on its own would swing at the building's frequency. How long must it be (a simple pendulum)?`,
          answer: l, units: 'm', tol: { rel: 0.005 },
          errors: distinct([{ value: G * T0 * T0, feedback: t`$\omega = 2\pi/T$, so $\ell = g/\omega^2 = g\,T^2/4\pi^2$.` }, { value: G * (T0 / (2 * Math.PI)), feedback: t`Square the period: $\ell = g\,(T/2\pi)^2$.` }], l),
          hints: [t`Tuned means $\sqrt{g/\ell} = \omega_{\text{building}} = 2\pi/T$.`],
          teach: t`A tuned-mass damper matches its own frequency to the structure's, so the coupled modes split around the dangerous resonance.`,
          explain: t`$\ell = g\,(T/2\pi)^2 = ${sci(l, 3)}$ m. Taipei 101's 660-tonne steel ball is the famous example; in practice a compound pendulum or cables and springs give the long effective length in less height, and dampers drain the energy.`,
          visual: buildingPic(4, t`A tower with a pendulum damper near the top (schematic; pendulum not drawn to scale).`),
        };
      },
    }),
    num({
      id: 'cp-hessian', difficulty: 3,
      gen(r) {
        const a = r.pick([3, 4, 6]), b = r.pick([1, 2]), m = r.pick([1, 2]);
        const K = [[2 * a, b], [b, 2 * a]], { vals } = eigSym(K), w = Math.sqrt(vals[0] / m);
        return {
          prompt: t`A ${m} kg particle moves in the plane in the potential $U = ${a}(x^2 + y^2) + ${b}\,xy$ (J, $x, y$ in m). Find its **lower** normal-mode frequency about $x = y = 0$.`,
          answer: w, units: 'rad/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt((a - b) / m), feedback: t`$\partial^2(${a}x^2)/\partial x^2 = ${2 * a}$: the Hessian doubles the squared terms' coefficients, while $\partial^2(${b}xy)/\partial x\partial y = ${b}$.` }, { value: Math.sqrt(vals[1] / m), feedback: t`That is the higher frequency.` }, { value: Math.sqrt((2 * a) / m), feedback: t`The cross term splits the frequencies: the eigenvalues of $\mathbf K$ are $${2 * a} \pm ${b}$.` }], w),
          hints: [t`$\mathbf K = \begin{bmatrix} \partial_x^2U & \partial_x\partial_yU \\ \partial_x\partial_yU & \partial_y^2U \end{bmatrix}$ at the origin.`, t`$\mathbf K = \begin{bmatrix} ${2 * a} & ${b} \\ ${b} & ${2 * a} \end{bmatrix}$; its eigenvalues are $${2 * a} \pm ${b}$; $\omega^2 = \lambda/m$.`],
          teach: t`Differentiate twice for $\mathbf K$: squared terms' coefficients double, a cross term's does not.`,
          explain: t`$\lambda_{\min} = ${2 * a - b}$ N/m along $(1, -1)$, so $\omega_1 = \sqrt{${2 * a - b}/${m}} = ${sci(w, 3)}$ rad/s.`,
          visual: gpic({ x: [-1.2, 1.2], y: [-1.2, 1.2], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', points: [{ x: 0, y: 0, color: 'gold', r: 5, label: 'equilibrium', labelDx: 8, labelDy: -10 }], curves: [seg([-1, -1], [1, 1], 'ink4', 1, true), seg([-1, 1], [1, -1], 'ink4', 1, true)] }, t`The plane around the equilibrium, with the two diagonals dashed.`, 'Axes with two diagonal lines'),
        };
      },
    }),
    mcq({
      id: 'cp-zero', difficulty: 2,
      prompt: t`A free-floating spacecraft model (no supports) is analysed for its vibration modes. The solver returns six frequencies that are zero (to round-off) before the first genuine vibration. What are they?`,
      visual: tetherPic(t`The simplest free system: two masses and a spring, which already has one zero mode.`),
      choices: [t`Rigid-body motions — three translations and three rotations — which stretch nothing, so $\mathbf K$ is singular along them`, t`A bug: a physical system cannot have zero frequency`, t`Unstable modes with $\omega^2 < 0$`, t`Modes too slow to measure, about 1 Hz`],
      answer: 0,
      why: { 1: t`Zero is exactly right for motions that cost no potential energy: a free body can drift and turn.`, 2: t`$\omega^2 < 0$ would be a runaway; a free body moving as a whole simply drifts, $\omega^2 = 0$.`, 3: t`Zero means zero: $\mathbf K\mathbf a = 0$ for a rigid motion.` },
      hints: [t`What motions of a free body change no spring's length?`],
      teach: t`Each free rigid-body motion is a zero mode: $\mathbf K\mathbf a = 0$.`,
      explain: t`A body free in space has six rigid-body degrees of freedom, each a zero mode. Analysts check for exactly six as a sanity test of the model, then discard them ([P10](#/lesson/prog.P10.1) does this for a launch vehicle).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §11.5–11.7: the general case; three coupled pendulums; normal coordinates', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'H. Goldstein, C. Poole and J. Safko, Classical Mechanics, 3rd ed. (2002), §6.1–6.2: small oscillations, the eigenvalue equation', url: 'https://www.pearson.com/en-us/subject-catalog/p/classical-mechanics/P200000006389' },
  ],
});
