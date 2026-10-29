// Superposition and initial conditions: every motion of a string (or chain)
// with fixed ends is a sum of its normal modes, each with a complex
// coefficient c_n = a_n + i u_n/ω_n fixed by the starting shape and velocity.
// Projections on a chain by orthogonality; missing modes when a pluck sits on
// a node; frequencies that do not care how hard you pluck. (The integral
// formula for the coefficients — Fourier series — is W6.1.)
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tn, chainPic, curvesPic } from './_wv.js';
import { chainModes, project, motion } from '../../src/viz/model/wv-chain.js';

const t = String.raw;

// the worked example: the middle of three tethered satellites pulled aside and released
const EX = (() => {
  const m = 20, T = 40, a = 100, k = T / a, w0 = Math.sqrt(k / m), d = 2, t1 = 30;
  const ms = chainModes(3, 'fixed'), x0 = [0, d, 0], amps = project(ms, x0);
  const x = motion(ms, x0)(w0 * t1).x, w = ms.map((mm) => mm.w * w0);
  return { m, T, a, k, w0, d, t1, amps, x, w };
})();

export default lesson({
  id: 'phys3750.W5.3',
  title: 'Superposition and initial conditions',
  minutes: 15, difficulty: 3,
  intro: t`Each normal mode solves the wave equation on its own, and the equation is linear, so any sum of modes solves it too. For a medium with fixed ends that sum is **every** possible motion:

$$y(x, t) = \operatorname{Re}\sum_n c_n\,\sin(q_nx)\,e^{-i\omega_nt}, \qquad c_n = a_n + i\,\frac{u_n}{\omega_n}$$

The starting shape, written as a sum of mode shapes $y_0 = \sum a_n\sin q_nx$, gives the real parts; the starting velocity $u_0 = \sum u_n\sin q_nx$ gives the imaginary parts — exactly as $\tilde A = x_0 + i v_0/\omega$ did for one oscillator. On a chain the $a_n$ come from projecting onto the mode vectors, which are orthogonal. Then each mode simply rings at its own frequency, and the shape changes because they drift in and out of step.`,
  symbols: [
    { tex: 'c_n', text: 'the complex amplitude of mode $n$, in m: one number holding its size and phase' },
    { tex: 'a_n', text: 'how much of mode $n$ the starting shape $y_0$ contains, in m' },
    { tex: 'u_n', text: 'how much of mode $n$ the starting velocity $u_0$ contains, in m/s' },
    { tex: '\\sin(q_nx)', text: 'the shape of mode $n$ with fixed ends at $x = 0$ and $L$: $q_n = n\\pi/L$' },
    { tex: '\\omega_n = vq_n', text: 'the frequency of mode $n$ (on a chain, $2\\sqrt{k/m}\\sin(q_na/2)$), in rad/s' },
  ],
  why: t`“Decompose into modes, let each one ring, add them back” is the method for every linear system — circuits, quantum states, gravitational-wave ringdown — and the bridge to Fourier analysis next.`,
  visual: {
    type: 'wv-chain',
    title: 'A pluck is a chord of modes',
    lead: t`Pluck one bead of the chain and watch; below, each mode’s dot on the dispersion curve is sized by how much of that mode the pluck contains.`,
    tasks: ['Pluck the middle bead of an odd chain (N = 9, bead 5): every even mode’s dot vanishes — they have a node there.', 'Pluck bead 1: every mode is present, the high ones strongly.', 'Choose a wide pulse: only the low modes are present, and the shape travels almost undistorted.'],
    params: { N: 9, maxN: 25, start: 'pluck', pluck: 5, controls: ['start', 'pluck', 'N', 'width'], readouts: ['N', 'v', 't'] },
  },
  example: {
    prompt: t`Three ${EX.m} kg satellites hang on a tether at tension ${EX.T} N, ${EX.a} m apart, between fixed end bodies (the chain of [N coupled oscillators](#/lesson/phys3750.W3.1)). The middle one is pulled ${EX.d} m sideways and released from rest. How does each satellite move, and where is the middle one after ${EX.t1} s?`,
    steps: [
      { label: 'Modes', text: t`From W3.1: $\omega_1 = ${tn(EX.w[0])}$, $\omega_2 = ${tn(EX.w[1])}$, $\omega_3 = ${tn(EX.w[2])}$ rad/s, with unit shape vectors $\mathbf s_1 = \tfrac12(1, \sqrt2, 1)$, $\mathbf s_2 = \tfrac{1}{\sqrt2}(1, 0, -1)$, $\mathbf s_3 = \tfrac12(1, -\sqrt2, 1)$.` },
      { label: 'Project', text: t`The shapes are orthonormal, so $a_n = \mathbf s_n\cdot\mathbf x_0$ with $\mathbf x_0 = (0, ${EX.d}, 0)$ m: $a_1 = ${tn(EX.amps[0])}$ m, $a_2 = 0$, $a_3 = ${tn(EX.amps[2])}$ m. Mode 2 has a node at the middle satellite, so this start cannot excite it.` },
      { label: 'Released from rest', text: t`$u_n = 0$, so $c_n = a_n$ is real: $\mathbf x(t) = a_1\mathbf s_1\cos\omega_1t + a_3\mathbf s_3\cos\omega_3t$.` },
      { label: 'Each satellite', text: t`Middle: $x_2 = \tfrac{d}{2}(\cos\omega_1t + \cos\omega_3t)$. Ends: $x_1 = x_3 = \tfrac{d}{2\sqrt2}(\cos\omega_1t - \cos\omega_3t)$ — they start at zero and are dragged into motion.` },
      { label: 'At the time asked', text: t`$x_2(${EX.t1}\ \text{s}) = ${tn(EX.d / 2)}\big[\cos(${tn(EX.w[0] * EX.t1)}) + \cos(${tn(EX.w[2] * EX.t1)})\big] = ${tn(EX.x[1])}$ m, and $x_1 = x_3 = ${tn(EX.x[0])}$ m.` },
      { label: 'Sense check', text: t`At $t = 0$: $x_2 = d$ and $x_1 = 0$ ✓. The motion never repeats exactly, because $\omega_3/\omega_1 = \sqrt{(2 + \sqrt2)/(2 - \sqrt2)} = ${tn(EX.w[2] / EX.w[0], 4)}$ is irrational.` },
    ],
    answer: t`$x_2 = \tfrac d2(\cos\omega_1t + \cos\omega_3t)$, $x_{1,3} = \tfrac{d}{2\sqrt2}(\cos\omega_1t - \cos\omega_3t)$; after ${EX.t1} s the middle satellite is at $${tn(EX.x[1])}$ m and the outer ones at $${tn(EX.x[0])}$ m.`,
    visual: chainPic({ N: 3, start: 'pluck', pluck: 2, panels: ['chain', 'disp'], k: EX.k, m: EX.m, a: EX.a, play: true }, 'The middle satellite pulled aside and released: below, only modes 1 and 3 have dots — mode 2 is missing. Teaching model: tether mass and orbital forces ignored.'),
  },
  practice: [
    num({
      id: 'two-modes', difficulty: 2,
      gen(r) {
        const L = r.pick([2, 3, 4]), v = r.pick([60, 90, 120]), A = r.pick([4, 5, 6]), B = r.pick([1, 2, 3]);
        const w1 = (Math.PI * v) / L, w3 = 3 * w1;
        // a moment when neither mode is near a zero crossing, so the slips stay distinguishable
        const times = r.shuffle([0.004, 0.006, 0.008, 0.01, 0.012, 0.014, 0.016, 0.018, 0.02, 0.022, 0.025]);
        const tt = times.find((x) => Math.abs(Math.cos(w1 * x)) > 0.2 && Math.abs(Math.cos(w3 * x)) > 0.2 && Math.abs(A * Math.cos(w1 * x) - B * Math.cos(w3 * x)) > 0.3) ?? 0.004;
        const y = A * Math.cos(w1 * tt) - B * Math.cos(w3 * tt);
        return {
          prompt: t`An instrument cable ${L} m long, fixed at both ends, carries waves at ${v} m/s. It is released from rest in the shape $y_0 = ${A}\sin(\pi x/L) + ${B}\sin(3\pi x/L)$ mm. What is the displacement of its midpoint at $t = ${tt}$ s, in mm?`,
          visual: curvesPic([
            { fn: `${A}*sin(pi*x/${L}) + ${B}*sin(3*pi*x/${L})`, color: 'accent', label: 'y₀', labelAt: L * 0.22, labelDy: -12 },
            { fn: `${A}*sin(pi*x/${L})`, color: 'ink3', dash: [5, 4], width: 1.2 }, { fn: `${B}*sin(3*pi*x/${L})`, color: 'ink3', dash: [2, 4], width: 1.2 },
          ], [0, L], [-B - 1, A + B + 1], 'The starting shape (solid) and its two modes (dashed), y in mm against x in m.', { xlabel: 'x (m)', ylabel: 'y (mm)' }),
          answer: y, units: 'mm', tol: { rel: 0.01, abs: 0.02 },
          errors: [{ value: A * Math.cos(w1 * tt) + B * Math.cos(w3 * tt), feedback: t`At the midpoint $\sin(3\pi/2) = -1$: mode 3 enters with a minus sign.` }, { value: (A - B) * Math.cos(w1 * tt), feedback: t`Each mode rings at its **own** frequency: mode 3 at $3\omega_1$.` }],
          hints: [t`$y = ${A}\sin(\pi x/L)\cos\omega_1t + ${B}\sin(3\pi x/L)\cos\omega_3t$ with $\omega_n = n\pi v/L$.`, t`At $x = L/2$: $\sin(\pi/2) = 1$ and $\sin(3\pi/2) = -1$.`],
          teach: 'Each mode keeps its starting amplitude and rings at its own frequency; add them back at the point you want.',
          explain: t`$\omega_1 = ${tn(w1)}$ rad/s, $\omega_3 = ${tn(w3)}$ rad/s; $y(L/2) = ${A}\cos(${tn(w1 * tt)}) - ${B}\cos(${tn(w3 * tt)}) = ${tn(y)}$ mm.`,
        };
      },
    }),
    mcq({
      id: 'centre-pluck', difficulty: 2,
      prompt: t`The middle bead of a chain of $N = 9$ beads (fixed ends) is pulled aside and released. Which modes are absent from the motion?`,
      visual: chainPic({ N: 9, start: 'pluck', pluck: 5 }, 'The middle bead of nine plucked (gold), the others at rest at first (exaggerated).'),
      choices: ['Every even mode: they all have a node at the middle bead', 'Every odd mode: the middle bead sits on their nodes', 'None: a single plucked bead excites every mode', 'All except mode 1, because a pluck is a fundamental'],
      answer: 0,
      why: {
        1: t`Odd modes are symmetric about the centre and largest there: they are strongly present.`,
        2: t`A pluck excites mode $n$ in proportion to the mode’s displacement at the plucked bead — zero if that bead sits on a node.`,
        3: 'A single displaced bead is far from the smooth fundamental shape; it contains many modes.',
      },
      hints: [t`$a_n = \mathbf s_n\cdot\mathbf x_0$, and $\mathbf x_0$ has only one nonzero entry.`, t`Mode $n$ at bead 5 of 9: $\sin(5n\pi/10)$. When is it zero?`],
      teach: 'A pluck at a node of a mode cannot excite that mode.',
      explain: t`$a_n \propto \sin(n\pi/2)$, zero for every even $n$. Plucking a guitar string at its middle likewise silences the even harmonics — which is why it sounds hollow there.`,
    }),
    num({
      id: 'struck', difficulty: 2,
      gen(r) {
        const L = r.pick([1.5, 2, 3]), v = r.pick([80, 120, 200]), V = r.pick([0.2, 0.3, 0.5]), n = r.pick([1, 2, 3]);
        const w = (n * Math.PI * v) / L, A = (V / w) * 1000;
        return {
          prompt: t`A taut cable ${L} m long (fixed ends, $v = ${v}$ m/s) starts straight but with velocity $u_0 = ${V}\sin(${n === 1 ? '' : n}\pi x/L)$ m/s, as from a shaped hammer blow. What is the amplitude of the oscillation that follows, in mm?`,
          visual: curvesPic([{ fn: `${V}*sin(${n}*pi*x/${L})`, color: 'gold', label: 'u₀', labelAt: L / (2 * n), labelDy: -12 }], [0, L], [-V * 1.4, V * 1.4], 'The starting velocity along the cable (m/s against x in m); the cable itself starts straight.', { xlabel: 'x (m)', ylabel: 'u₀ (m/s)' }),
          answer: A, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: V * w * 1000, feedback: t`Multiplying by $\omega$ gives an acceleration. Velocity over rate is the length: $|c_n| = u_n/\omega_n$.` }, ...(n > 1 ? [{ value: ((V * L) / (Math.PI * v)) * 1000, feedback: t`That uses $\omega_1$; this is mode ${n}, with $\omega_{${n}} = ${n}\pi v/L$.` }] : [])],
          hints: [t`Only mode ${n} is present: $c_${n} = i\,u_${n}/\omega_${n}$.`, t`$\omega_${n} = ${n}\pi v/L$.`],
          teach: t`A starting velocity in one mode gives amplitude $u_n/\omega_n$, a quarter cycle out of step: $y = (u_n/\omega_n)\sin(q_nx)\sin\omega_nt$.`,
          explain: t`$\omega_${n} = ${tn(w)}$ rad/s, so the amplitude is $${V}/${tn(w)} = ${tn(A / 1000)}$ m $= ${tn(A)}$ mm.`,
        };
      },
    }),
    expr({
      id: 'struck-y', difficulty: 3,
      gen(r) {
        const L = r.pick([1, 2]), v = r.pick([2, 4]), V = r.pick([3, 6]);
        const w = (Math.PI * v) / L;
        return {
          prompt: t`A string of length $L = ${L}$ m with fixed ends and $v = ${v}$ m/s starts straight with velocity $u_0 = ${V}\sin(\pi x/L)$ cm/s. Write $y(x, t)$ in cm ($x$ in m, $t$ in s).`,
          visual: curvesPic([{ fn: `${V}*sin(pi*x/${L})`, color: 'gold', label: 'u₀', labelAt: L / 2, labelDy: -12 }], [0, L], [-0.6, V * 1.3], 'The starting velocity (cm/s against x in m); the string starts straight.', { xlabel: 'x (m)', ylabel: 'u₀ (cm/s)' }),
          answer: `${V / w} sin(pi x/${L}) sin(${w} t)`,
          answerTeX: t`\frac{${V}}{${tn(w / Math.PI)}\pi}\sin\frac{\pi x}{${L}}\sin(${tn(w / Math.PI)}\pi t)`,
          lhs: 'y(x, t)', vars: { x: [0, L], t: [0, 1] },
          errors: [{ answer: `${V / w} sin(pi x/${L}) cos(${w} t)`, feedback: t`That starts displaced, not straight. With $y_0 = 0$, $c_1 = iu_1/\omega_1$ and $\operatorname{Re}[ie^{-i\omega t}] = \sin\omega t$.` }, { answer: `${V} sin(pi x/${L}) sin(${w} t)`, feedback: t`Divide the velocity by $\omega_1$ to get a displacement.` }],
          hints: [t`Only mode 1: $\omega_1 = \pi v/L = ${tn(w / Math.PI)}\pi$ rad/s.`, t`$c_1 = i\,u_1/\omega_1$ and $\operatorname{Re}\big[i\,e^{-i\omega_1t}\big] = \sin\omega_1t$.`],
          teach: t`Pure starting velocity: $y = (u_n/\omega_n)\sin(q_nx)\sin(\omega_nt)$.`,
          explain: t`$y = \dfrac{${V}}{${tn(w / Math.PI)}\pi}\sin\dfrac{\pi x}{${L}}\sin(${tn(w / Math.PI)}\pi t) \approx ${tn(V / w)}\sin(\pi x/${L})\sin(${tn(w)}t)$ cm. Check: $y(x, 0) = 0$ and $y_t(x, 0) = ${V}\sin(\pi x/${L})$.`,
        };
      },
    }),
    num({
      id: 'two-bead', difficulty: 3,
      gen(r) {
        const k = r.pick([20, 50, 80]), m = r.pick([0.2, 0.5]), d = r.pick([2, 3, 4]), tt = r.pick([0.3, 0.5, 0.8]);
        const w0 = Math.sqrt(k / m), ms = chainModes(2, 'fixed'), x = motion(ms, [d, 0])(w0 * tt).x[0];
        return {
          prompt: t`Two ${m} kg beads on springs of ${k} N/m between fixed walls (three springs). Bead 1 is pulled ${d} cm aside and released, bead 2 at rest. Where is bead 1 at $t = ${tt}$ s, in cm?`,
          visual: chainPic({ N: 2, start: 'pluck', pluck: 1, view: 'longitudinal' }, 'Bead 1 pulled aside (exaggerated), bead 2 at rest, between two walls.'),
          answer: x, units: 'cm', tol: { rel: 0.01, abs: 0.02 },
          errors: [{ value: d * Math.cos(w0 * tt), feedback: 'Bead 1 is not a mode on its own: it is half of each mode, and the two ring at different frequencies.' }],
          hints: [t`$(${d}, 0) = \tfrac{${d}}{2}(1, 1) + \tfrac{${d}}{2}(1, -1)$, with $\omega_1 = \sqrt{k/m}$ and $\omega_2 = \sqrt{3k/m}$.`, t`$x_1(t) = \tfrac{${d}}{2}\big(\cos\omega_1t + \cos\omega_2t\big)$.`],
          teach: 'Project the start onto the modes, let each ring at its own frequency, add back.',
          explain: t`$\omega_1 = ${tn(w0)}$, $\omega_2 = ${tn(Math.sqrt(3) * w0)}$ rad/s: $x_1 = ${d / 2}[\cos(${tn(w0 * tt)}) + \cos(${tn(Math.sqrt(3) * w0 * tt)})] = ${tn(x)}$ cm.`,
        };
      },
    }),
    mcq({
      id: 'how-many', difficulty: 2,
      prompt: t`A chain of $N$ beads has $N$ modes. How many real numbers must you know at $t = 0$ to fix its whole future motion?`,
      visual: chainPic({ N: 5, start: 'custom', x0: [0.3, -0.5, 1, 0.2, -0.4] }, 'Five beads at one instant: positions are visible; velocities are not.'),
      choices: [t`$2N$: every bead’s position and velocity, i.e. $N$ complex $c_n$`, t`$N$: one amplitude for each of the $N$ modes`, t`$N$: the bead positions, as the equation sets the velocities`, t`$4N$: positions, velocities, accelerations and phases`],
      answer: 0,
      why: {
        1: t`Each mode needs a size **and** a phase: $c_n$ is complex, two real numbers.`,
        2: 'The same positions could be passed through with any velocities; Newton’s law fixes accelerations, not velocities.',
        3: t`Accelerations follow from positions through the equation, and the phases are already inside $c_n$.`,
      },
      hints: ['A single oscillator needs x(0) and v(0).', t`One complex $\tilde A = x_0 + iv_0/\omega$ per oscillator; one $c_n$ per mode.`],
      teach: t`$N$ modes × one complex amplitude each = $2N$ real numbers = $N$ positions + $N$ velocities.`,
      explain: t`Second-order equations for $N$ beads need $N$ positions and $N$ velocities. Projecting them onto the modes gives $a_n$ and $u_n$, packed as $c_n = a_n + iu_n/\omega_n$. For a string, two whole functions $y_0(x)$ and $u_0(x)$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-end-satellite', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([15, 20, 30]), T = r.pick([30, 40, 60]), a = 100, d = r.pick([1, 2, 3]), tt = r.pick([20, 25, 40]);
        const w0 = Math.sqrt(T / a / m), ms = chainModes(3, 'fixed'), x = motion(ms, [d, 0, 0])(w0 * tt).x;
        return {
          prompt: t`Three ${m} kg satellites on a tether at tension ${T} N, ${a} m apart, between fixed end bodies. Satellite 1 is pulled ${d} m sideways and released; the others start at rest in line. Where is satellite 3 (the far one) after ${tt} s, in m?`,
          visual: chainPic({ N: 3, start: 'pluck', pluck: 1 }, 'Satellite 1 displaced (gold, exaggerated), the others at rest; tether between fixed end bodies.'),
          answer: x[2], units: 'm', tol: { rel: 0.02, abs: 0.01 },
          errors: [{ value: 0, feedback: 'Satellite 3 does not stay put: the modes carry the disturbance across.' }],
          hints: [t`Unit shapes $\tfrac12(1, \sqrt2, 1)$, $\tfrac{1}{\sqrt2}(1, 0, -1)$, $\tfrac12(1, -\sqrt2, 1)$ with $\lambda = 2 - \sqrt2, 2, 2 + \sqrt2$ and $\omega = \sqrt{\lambda T/(am)}$.`, t`Project $(${d}, 0, 0)$: $a_1 = ${d}/2$, $a_2 = ${d}/\sqrt2$, $a_3 = ${d}/2$.`, t`$x_3 = \tfrac{${d}}{4}\cos\omega_1t - \tfrac{${d}}{2}\cos\omega_2t + \tfrac{${d}}{4}\cos\omega_3t$.`],
          teach: 'Project, ring, add back — the far satellite moves because every mode it shares with satellite 1 is excited.',
          explain: t`$\omega_{1,2,3} = ${tn(ms[0].w * w0)},\ ${tn(ms[1].w * w0)},\ ${tn(ms[2].w * w0)}$ rad/s; $x_3(${tt}) = ${tn(x[2])}$ m (and $x_1 = ${tn(x[0])}$, $x_2 = ${tn(x[1])}$ m).`,
        };
      },
    }),
    num({
      id: 'cp-missing', difficulty: 3,
      gen(r) {
        const p = r.pick([3, 4, 5]);
        return {
          prompt: t`A string with fixed ends is pulled aside at a point $L/${p}$ from one end into a triangle and released. What is the **lowest** harmonic number $n$ that is missing from its motion?`,
          visual: curvesPic([{ fn: `min(${p}*x, (1 - x)/${1 - 1 / p})`, color: 'accent' }], [0, 1], [-0.2, 1.25], t`The plucked shape: a triangle with its corner at $L/${p}$ ($x$ in units of $L$).`, { xlabel: 'x / L', ylabel: '' }),
          answer: p, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 2, feedback: t`Even harmonics vanish only for a pluck at the centre, $L/2$.` }],
          hints: ['A mode cannot be excited by a pluck at one of its nodes.', t`Mode $n$ has nodes at $x = jL/n$. For which smallest $n$ is $L/${p}$ a node?`],
          teach: t`Plucking at $L/p$ removes harmonic $p$ and its multiples: the coefficient carries a factor $\sin(n\pi/p)$.`,
          explain: t`Mode $n = ${p}$ has a node at $L/${p}$, so it is absent (and so are $${2 * p}, ${3 * p}, \ldots$). The full triangle coefficients, $\propto \sin(n\pi/${p})/n^2$, come with Fourier series in W6.1.`,
        };
      },
    }),
    mcq({
      id: 'cp-harder', difficulty: 2,
      prompt: 'You pluck the same string twice as hard (twice the displacement, same shape and place). What happens to its normal-mode frequencies and to its mode amplitudes?',
      visual: curvesPic([{ fn: 'min(x/0.3, (1 - x)/0.7)', color: 'ink3', dash: [5, 4], label: 'gentle', labelAt: 0.55, labelDy: 14 }, { fn: '2*min(x/0.3, (1 - x)/0.7)', color: 'accent', label: 'twice as hard', labelAt: 0.55, labelDy: -14 }], [0, 1], [-0.2, 2.4], 'Two plucks of the same shape at the same point, one twice as big (small-slope regime).', { xlabel: 'x / L', ylabel: '' }),
      choices: ['Frequencies unchanged; every amplitude doubles', 'Frequencies double; amplitudes stay the same', 'Frequencies rise a little; amplitudes double', 'Frequencies unchanged; only the fundamental doubles'],
      answer: 0,
      why: {
        1: t`The frequencies $\omega_n = vq_n$ depend on the string, not on the pluck.`,
        2: 'In the linear (small-slope) wave equation nothing depends on amplitude. A real string does stiffen slightly at large amplitude — outside this model.',
        3: t`Linearity scales every $c_n$ by the same factor: the shape is the same, so the mixture is the same.`,
      },
      hints: [t`Which of $c_n$ and $\omega_n$ depends on the starting data?`, 'Linearity: double the start, double the solution.'],
      teach: 'Mode frequencies belong to the medium; mode amplitudes belong to the start — and scale with it.',
      explain: t`$y_0 \to 2y_0$ gives $a_n \to 2a_n$ for every $n$, while $\omega_n$ is untouched: same notes, same mixture, twice as loud. Pitch does not depend on how hard you pluck.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 6–7 (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/17/' },
    { label: 'Georgi, The Physics of Waves, ch. 4–5 (free from the author)', url: 'https://www.people.fas.harvard.edu/~hgeorgi/new.htm' },
  ],
});
