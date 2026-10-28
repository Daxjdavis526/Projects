// Two coupled oscillators: M ẍ = −K x, the guess x = a e^{−iωt}, the
// eigenvalue problem (K − ω²M) a = 0, and its two normal modes. Examples: the
// tines of a tuning-fork gyroscope (in-phase and balanced anti-phase modes),
// a two-stage rocket standing on its pad, a two-axis gimbal.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { tn, pn, curvesPic } from './_wv.js';

const t = String.raw;

// the worked example: two quartz tines, each on its own flexure, coupled through the base
const EX = (() => {
  const m = 1.0e-6, k = 3.6e3, kc = 180;
  const w1 = Math.sqrt(k / m), w2 = Math.sqrt((k + 2 * kc) / m);
  return { m, k, kc, w1, w2, f1: w1 / (2 * Math.PI), f2: w2 / (2 * Math.PI) };
})();

// eigen-frequencies of [[(k1+k2)/m1, −k2/m1], [−k2/m2, k2/m2]] — a stack: ground–k1–m1–k2–m2 (free top)
function stack(m1, m2, k1, k2) {
  const T = (k1 + k2) / m1 + k2 / m2, D = (k1 * k2) / (m1 * m2), s = Math.sqrt(T * T - 4 * D);
  const lo = (T - s) / 2, hi = (T + s) / 2;
  return { lo: Math.sqrt(lo), hi: Math.sqrt(hi), ratio: (w2) => (k1 + k2 - m1 * w2) / k2, T, D };
}

// a schematic of the stack: ground, spring k1, block m1, spring k2, block m2
function stackPic(caption, labels = ['m₁ (lower stage)', 'm₂ (upper stage)', 'k₁ (pad)', 'k₂ (interstage)']) {
  const zig = (y0, y1) => ({ param: [`0.28*(2/pi)*asin(sin(10*pi*t))`, `${y0} + ${y1 - y0}*t`], t: [0, 1], color: 'ink2', width: 1.6 });
  const box = (y0, y1, w, color) => [[-w, y0, w, y0], [w, y0, w, y1], [w, y1, -w, y1], [-w, y1, -w, y0]].map(([a, b, c, d]) => ({ param: [`${a} + ${c - a}*t`, `${b} + ${d - b}*t`], t: [0, 1], color, width: 2.2 }));
  return {
    type: 'graph',
    params: {
      x: [-3.2, 3.2], y: [-0.4, 9.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ fn: '0', domain: [-1.4, 1.4], color: 'ink3', width: 3 }, zig(0, 2.6), ...box(2.6, 4.6, 0.9, 'accent'), zig(4.6, 6.8), ...box(6.8, 8.6, 0.65, 'violet')],
      points: [
        { x: 1.05, y: 3.6, r: 0, label: labels[0], color: 'accent' }, { x: 0.8, y: 7.7, r: 0, label: labels[1], color: 'violet' },
        { x: 0.45, y: 1.3, r: 0, label: labels[2], color: 'ink2' }, { x: 0.45, y: 5.7, r: 0, label: labels[3], color: 'ink2' },
      ],
    },
    caption,
  };
}

const pairPic = (params, caption) => ({ type: 'de-modes', params: { system: 'pair', m: 1, m2: 1, k: 10, kc: 2, controls: [], starts: false, play: false, readout: false, energy: false, ...params }, caption });

export default lesson({
  id: 'phys3750.W2.1',
  title: 'Two coupled oscillators and normal modes',
  minutes: 15, difficulty: 3,
  intro: t`Join two oscillators by a spring and neither moves on its own any more: each equation contains the other displacement. Collect them as one matrix equation $M\ddot{\mathbf x} = -K\mathbf x$ and make the course’s guess — **every mass at the same frequency**, $\mathbf x = \mathbf a\,e^{-i\omega t}$. The calculus disappears and an eigenvalue problem is left:

$$\big(K - \omega^2 M\big)\,\mathbf a = 0 \qquad\Longrightarrow\qquad \det\big(K - \omega^2 M\big) = 0$$

Each root $\omega^2$ is a **normal-mode frequency**, and its vector $\mathbf a$ is the **mode shape**: the fixed pattern in which the masses move together. Two masses have two modes; any motion at all is a sum of them. This is the [eigenvalue method](#/lesson/math2280.DE-4.5) of differential equations, done the physicist’s way.`,
  symbols: [
    { tex: '\\mathbf x', text: 'the column of displacements $(x_1, x_2)$, each in m' },
    { tex: 'M', text: 'the mass matrix, here diagonal with entries $m_1, m_2$ (kg)' },
    { tex: 'K', text: 'the stiffness matrix (N/m): $K_{ij}$ is the force on mass $i$ per metre of displacement of mass $j$, with the sign flipped' },
    { tex: '\\mathbf a', text: 'the mode shape: the complex amplitudes of the masses in one mode, fixed in ratio' },
    { tex: '\\omega', text: 'a normal-mode angular frequency, in rad/s' },
    { tex: '\\det', text: 'the determinant; it vanishes exactly when the matrix has a nonzero solution $\\mathbf a$' },
  ],
  why: t`Modes are eigenvectors: find them and a coupled problem falls apart into independent oscillators. Chains, strings, molecules and the ringing of a black hole are all analysed this way.`,
  visual: {
    type: 'de-modes',
    title: 'Two coupled masses in their normal modes',
    lead: t`Two masses between walls, each on a wall spring $k$, joined by a coupling spring $k_c$ (gold). Start them in a mode and watch: both masses move at **one** frequency and keep their ratio. Then pull one mass alone and see that it is not a mode.`,
    tasks: [t`Mode 1: the masses swing together and the coupling spring never stretches, so $\omega_1 = \sqrt{k/m}$ whatever $k_c$ is.`, t`Mode 2: they swing oppositely; raise $k_c$ and only this mode speeds up.`, t`Make $m_2$ heavier: the mode shapes tilt — in mode 2 the heavy mass barely moves.`],
    params: { system: 'pair', m: 1, m2: 1, k: 10, kc: 2, controls: ['kc', 'm2'], start: 'mode1', energy: false },
  },
  example: {
    prompt: t`In a **tuning-fork gyroscope** two quartz tines stand side by side on a common base. Model each tine tip as a mass $m = ${tn(EX.m * 1e6, 2)}$ mg on its own flexure of stiffness $k = ${tn(EX.k, 2)}$ N/m, the two coupled through the base by $k_c = ${EX.kc}$ N/m. Find the two normal modes and their frequencies, and say which one a gyroscope should drive.`,
    steps: [
      { label: 'Equations of motion', text: t`$m\ddot x_1 = -kx_1 - k_c(x_1 - x_2)$ and $m\ddot x_2 = -kx_2 - k_c(x_2 - x_1)$. So $M = m\,I$ and $K = \begin{pmatrix} k + k_c & -k_c \\ -k_c & k + k_c\end{pmatrix}$.` },
      { label: 'Guess one frequency', text: t`Put $\mathbf x = \mathbf a e^{-i\omega t}$: $\ddot{\mathbf x} = -\omega^2\mathbf x$, so $(K - \omega^2 m I)\mathbf a = 0$.` },
      { label: 'Determinant', text: t`$(k + k_c - m\omega^2)^2 - k_c^2 = 0$, so $k + k_c - m\omega^2 = \pm k_c$, giving $\omega_1^2 = k/m$ and $\omega_2^2 = (k + 2k_c)/m$.` },
      { label: 'Mode shapes', text: t`With $\omega_1$ the first row reads $k_c a_1 - k_c a_2 = 0$: $\mathbf a_1 = (1, 1)$, the tines in step. With $\omega_2$ it reads $-k_c a_1 - k_c a_2 = 0$: $\mathbf a_2 = (1, -1)$, the tines opposite.` },
      { label: 'Numbers', text: t`$\omega_1 = \sqrt{${tn(EX.k, 2)}/${tn(EX.m, 2)}} = ${tn(EX.w1)}$ rad/s, $f_1 = ${tn(EX.f1)}$ Hz; $\omega_2 = \sqrt{${tn(EX.k + 2 * EX.kc, 3)}/${tn(EX.m, 2)}} = ${tn(EX.w2)}$ rad/s, $f_2 = ${tn(EX.f2)}$ Hz.` },
      { label: 'Which to drive', text: t`In the anti-phase mode the tines’ momenta cancel at every instant, so the base feels no net force and the mounting does not leak energy or pick up vibration. That balanced mode, $f_2 = ${tn(EX.f2)}$ Hz, is the drive mode; the in-phase mode, $${tn(EX.f2 - EX.f1)}$ Hz away, is kept well separated.` },
    ],
    answer: t`$f_1 = ${tn(EX.f1)}$ Hz with shape $(1, 1)$ and $f_2 = ${tn(EX.f2)}$ Hz with shape $(1, -1)$; drive the balanced anti-phase mode.`,
    visual: pairPic({ start: 'mode2', play: true }, 'The anti-phase mode of two equal masses: the coupling spring (gold) stretches and squeezes, the walls feel opposite pulls. Displacements exaggerated; ideal springs, no damping.'),
  },
  practice: [
    mcq({
      id: 'what-is-mode', difficulty: 1,
      prompt: 'What makes a motion of a coupled system a **normal mode**?',
      visual: pairPic({ start: 'mode2' }, 'Two coupled masses started in their second normal mode, with each displacement against time below.'),
      choices: [
        'Every mass moves sinusoidally at one shared frequency, with the amplitudes in a fixed ratio',
        'Each mass oscillates at its own natural frequency, as if the other were absent',
        'Energy flows steadily back and forth from one mass to the other mass',
        'One mass moves while all the other masses stay exactly where they are',
      ],
      answer: 0,
      why: {
        1: t`That would be true only with no coupling. The coupling spring changes the frequencies: the modes have $\sqrt{k/m}$ and $\sqrt{(k + 2k_c)/m}$.`,
        2: 'That is what a mixture of two modes does (beats, next lesson). In a single mode the share of energy each mass holds stays the same.',
        3: 'Holding one mass still is not a solution of the coupled equations; the coupling spring would pull it.',
      },
      hints: [t`A mode is a solution of the form $\mathbf a\,e^{-i\omega t}$ with one $\omega$.`, 'Look at the graph: do the two curves keep their ratio?'],
      teach: t`A normal mode is a solution $\mathbf a\,e^{-i\omega t}$: one frequency, one fixed shape.`,
      explain: t`In a mode $\mathbf x(t) = \mathbf a\cos(\omega t - \phi)$: every mass passes through zero at the same instants and their amplitudes keep the ratio set by $\mathbf a$.`,
    }),
    num({
      id: 'stack-low', difficulty: 3,
      gen(r) {
        const m1 = r.pick([120, 150, 200]) * 1e3, m2 = r.pick([30, 40, 50]) * 1e3, k1 = r.pick([2, 3, 4]) * 1e8, k2 = r.pick([1, 1.5, 2]) * 1e8;
        const S = stack(m1, m2, k1, k2);
        return {
          prompt: t`A launch vehicle stands on its pad. Lengthwise, model the lower stage as $m_1 = ${m1 / 1e3}$ t resting on hold-downs of stiffness $k_1 = ${tn(k1 / 1e8, 2)}\times10^{8}$ N/m, and the upper stage as $m_2 = ${m2 / 1e3}$ t on an interstage of stiffness $k_2 = ${tn(k2 / 1e8, 2)}\times10^{8}$ N/m (its top is free). What is the **lower** normal-mode frequency, in Hz?`,
          visual: stackPic('The two-mass model of the stack: masses on springs, moving vertically. A teaching model: a real stack has many distributed modes.'),
          answer: S.lo / (2 * Math.PI), units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: S.lo, feedback: t`That is $\omega$ in rad/s. Divide by $2\pi$ for hertz.` }, { value: Math.sqrt(k1 / (m1 + m2)) / (2 * Math.PI), feedback: t`$\sqrt{k_1/(m_1 + m_2)}$ treats the stack as rigid. The interstage flexes too, which lowers the frequency a little.` }],
          hints: [t`$K = \begin{pmatrix} k_1 + k_2 & -k_2 \\ -k_2 & k_2\end{pmatrix}$, $M = \operatorname{diag}(m_1, m_2)$.`, t`$\det(K - \omega^2M) = 0$ is a quadratic in $\omega^2$: $m_1m_2\,\omega^4 - [m_2(k_1 + k_2) + m_1k_2]\,\omega^2 + k_1k_2 = 0$.`, t`Take the smaller root for $\omega^2$, then $f = \omega/2\pi$.`],
          teach: t`For two masses, $\det(K - \omega^2M) = 0$ is a quadratic in $\omega^2$; its two roots are the mode frequencies squared.`,
          explain: t`Dividing by $m_1m_2$: $\omega^4 - ${tn(S.T)}\,\omega^2 + ${tn(S.D)} = 0$, so $\omega^2 = ${tn(S.lo ** 2)}$ or $${tn(S.hi ** 2)}\ \text{s}^{-2}$. The lower mode has $\omega = ${tn(S.lo)}$ rad/s, $f = ${tn(S.lo / (2 * Math.PI))}$ Hz.`,
        };
      },
    }),
    num({
      id: 'stack-shape', difficulty: 3,
      gen(r) {
        const m1 = r.pick([100, 160]) * 1e3, m2 = r.pick([25, 40]) * 1e3, k1 = r.pick([2, 5]) * 1e8, k2 = r.pick([1, 2]) * 1e8;
        const S = stack(m1, m2, k1, k2), ratio = S.ratio(S.lo ** 2);
        return {
          prompt: t`For the stack model with $m_1 = ${m1 / 1e3}$ t, $m_2 = ${m2 / 1e3}$ t, $k_1 = ${tn(k1 / 1e8, 1)}\times10^{8}$ N/m and $k_2 = ${tn(k2 / 1e8, 1)}\times10^{8}$ N/m, the lower mode has $\omega^2 = ${tn(S.lo ** 2, 4)}\ \text{s}^{-2}$. In that mode, what is the ratio $a_2/a_1$ of the upper stage’s amplitude to the lower stage’s?`,
          visual: stackPic('Ground, hold-downs, lower stage, interstage, upper stage: the two-mass model, moving vertically.'),
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: 1, feedback: 'A ratio of 1 would mean the interstage never flexes. Use the first row of (K − ω²M)a = 0.' }, { value: 1 / ratio, feedback: t`Upside down: you found $a_1/a_2$.` }],
          hints: [t`The first row of $(K - \omega^2M)\mathbf a = 0$: $(k_1 + k_2 - m_1\omega^2)a_1 - k_2a_2 = 0$.`, t`So $a_2/a_1 = (k_1 + k_2 - m_1\omega^2)/k_2$.`],
          teach: t`Once $\omega^2$ is known, either row of $(K - \omega^2M)\mathbf a = 0$ gives the mode shape’s ratio.`,
          explain: t`$a_2/a_1 = (${tn(k1 + k2, 2)} - ${tn(m1, 3)}\times${tn(S.lo ** 2, 4)})/${tn(k2, 2)} = ${tn(ratio)}$: in the low mode the upper stage moves ${ratio > 1 ? 'more than' : 'less than'} the lower one, in the same direction.`,
        };
      },
    }),
    order({
      id: 'method', difficulty: 2,
      prompt: 'Put the steps of the normal-mode method in order.',
      visual: pairPic({ start: 'one', graph: false }, 'Any coupled linear system, like these two masses: the method works for every one.'),
      items: [
        t`Write Newton’s law for each mass and collect it as $M\ddot{\mathbf x} = -K\mathbf x$`,
        t`Guess $\mathbf x = \mathbf a\,e^{-i\omega t}$, one frequency for all`,
        t`Get $(K - \omega^2M)\mathbf a = 0$`,
        t`Demand $\det(K - \omega^2M) = 0$ and solve for $\omega^2$`,
        t`Put each $\omega^2$ back to find its shape $\mathbf a$`,
        'Write the general motion as a sum of the modes',
      ],
      hints: ['Physics first, then the guess, then linear algebra.', 'You cannot find a mode shape before you know its frequency.'],
      teach: t`Newton → guess $e^{-i\omega t}$ → eigenvalue problem → frequencies → shapes → superpose.`,
      explain: t`The determinant condition comes first because a nonzero $\mathbf a$ exists only for special $\omega^2$; each one then fixes its own shape, and linearity lets you add the modes.`,
    }),
    mcq({
      id: 'weak-coupling', difficulty: 2,
      prompt: t`For the two tines (each $\sqrt{k/m}$ alone), the mode frequencies are $\omega_1 = \sqrt{k/m}$ and $\omega_2 = \sqrt{(k + 2k_c)/m}$. What happens as the coupling $k_c \to 0$?`,
      visual: curvesPic([
        { fn: '1 + 0*x', color: 'accent', label: 'ω₁ (in phase)', labelAt: 1.4, labelDy: 14 },
        { fn: 'sqrt(1 + 2x)', color: 'violet', label: 'ω₂ (anti-phase)', labelAt: 1.2, labelDy: -12 },
      ], [0, 2], [0, 2.4], t`The two mode frequencies, in units of $\sqrt{k/m}$, against the coupling $k_c/k$.`, { xlabel: 'kc/k', ylabel: 'ω' }),
      choices: [
        'The two frequencies merge, and then any pattern — one tine alone too — is a mode',
        'The anti-phase mode disappears, leaving the system with only one normal mode',
        'Both frequencies drop to zero, because nothing is holding the tines together',
        'The two modes keep different frequencies, set only by the tine masses',
      ],
      answer: 0,
      why: {
        1: t`A system of two masses always has two modes; at $k_c = 0$ they simply share one frequency (they are *degenerate*).`,
        2: t`Each tine still has its own flexure $k$: the frequencies tend to $\sqrt{k/m}$, not zero.`,
        3: t`The gap between them is set by $k_c$: $\omega_2^2 - \omega_1^2 = 2k_c/m$, which vanishes with $k_c$.`,
      },
      hints: [t`Set $k_c = 0$ in both formulas.`, t`If both modes have the same $\omega$, is any combination $c_1(1, 1) + c_2(1, -1)$ also a solution at that $\omega$?`],
      teach: t`Coupling splits frequencies; with no coupling the modes are degenerate and the mode shapes are no longer forced to be $(1, \pm1)$.`,
      explain: t`At $k_c = 0$, $\omega_1 = \omega_2$, so every combination of $(1, 1)$ and $(1, -1)$ — including $(1, 0)$, one tine alone — moves at that one frequency. Even a weak coupling picks out the symmetric and antisymmetric shapes.`,
    }),
    num({
      id: 'gimbal', difficulty: 3,
      gen(r) {
        const I1 = r.pick([0.02, 0.03, 0.04]), I2 = r.pick([0.01, 0.015]), k1 = r.pick([8, 10, 12]), kc = r.pick([2, 3, 4]);
        // I1 θ̈1 = −k1 θ1 − kc(θ1 − θ2); I2 θ̈2 = −kc(θ2 − θ1)
        const S = stack(I1, I2, k1, kc);
        return {
          prompt: t`A star tracker’s outer gimbal ring (moment of inertia $I_1 = ${I1}\ \text{kg m}^2$) is held to the spacecraft by a torsion flexure $\kappa_1 = ${k1}$ N m/rad, and carries the camera ($I_2 = ${I2}\ \text{kg m}^2$) on a second flexure $\kappa_c = ${kc}$ N m/rad about the same axis. Find the **higher** normal-mode frequency of small twisting oscillations, in Hz.`,
          visual: curvesPic([{ fn: `${I1 * I2}*x^2 - ${I2 * (k1 + kc) + I1 * kc}*x + ${k1 * kc}`, color: 'accent', label: 'det(K − ω²I)', labelAt: S.hi ** 2 * 1.05, labelDx: 8 }],
            [0, S.hi ** 2 * 1.35], [-1.3 * ((S.hi ** 2 - S.lo ** 2) ** 2) * I1 * I2 / 4, k1 * kc * 1.15], t`$\det(K - \omega^2 I)$ against $\omega^2$: a parabola whose two zeros are the two modes (axis numbers hidden).`, { xlabel: 'ω²', ylabel: '', xticks: 0, yticks: 0 }),
          answer: S.hi / (2 * Math.PI), units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: S.lo / (2 * Math.PI), feedback: 'That is the lower mode. Take the larger root.' }, { value: S.hi, feedback: 'That is ω in rad/s; divide by 2π.' }],
          hints: [t`Twisting obeys the same equations as masses on springs, with $I$ for $m$ and $\kappa$ for $k$: $K = \begin{pmatrix} \kappa_1 + \kappa_c & -\kappa_c \\ -\kappa_c & \kappa_c\end{pmatrix}$, $M = \operatorname{diag}(I_1, I_2)$.`, t`$I_1I_2\,\omega^4 - [I_2(\kappa_1 + \kappa_c) + I_1\kappa_c]\,\omega^2 + \kappa_1\kappa_c = 0$.`],
          teach: t`The method does not care what oscillates: torsion with $I$ and $\kappa$ is the same eigenvalue problem as masses with $m$ and $k$.`,
          explain: t`$\omega^2 = ${tn(S.lo ** 2)}$ or $${tn(S.hi ** 2)}\ \text{s}^{-2}$; the higher mode has $\omega = ${tn(S.hi)}$ rad/s, $f = ${tn(S.hi / (2 * Math.PI))}$ Hz — gimbal and camera twisting against each other.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-split', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([0.5, 0.8, 1.2]) * 1e-6, f1 = r.pick([8, 10, 12]) * 1e3, df = r.pick([200, 300, 400, 500]);
        const w1 = 2 * Math.PI * f1, w2 = 2 * Math.PI * (f1 + df), kc = (m * (w2 * w2 - w1 * w1)) / 2;
        return {
          prompt: t`A tuning-fork gyroscope designer wants the balanced anti-phase mode exactly ${df} Hz above the in-phase mode, which sits at ${tn(f1 / 1e3, 2)} kHz. Each tine has effective mass $${tn(m * 1e6, 2)}$ mg. What coupling stiffness $k_c$ through the base does that need, in N/m? (Use $\omega_1^2 = k/m$, $\omega_2^2 = (k + 2k_c)/m$.)`,
          visual: pairPic({ start: 'mode2', graph: false }, 'The anti-phase mode of two equal coupled oscillators (masses for tines). Ideal springs, no damping.'),
          answer: kc, units: 'N/m', tol: { rel: 0.01 },
          errors: [{ value: m * (w2 - w1) ** 2 / 2, feedback: t`Subtract the squares, not the frequencies: $2k_c/m = \omega_2^2 - \omega_1^2$.` }, { value: m * (w2 * w2 - w1 * w1), feedback: t`You dropped the factor $\tfrac12$: $\omega_2^2 - \omega_1^2 = 2k_c/m$.` }],
          hints: [t`$\omega_2^2 - \omega_1^2 = 2k_c/m$.`, t`Work in rad/s: $\omega = 2\pi f$, with $f_2 = ${tn(f1 + df)}$ Hz.`],
          teach: t`The coupling sets the splitting of the two mode frequencies: $\omega_2^2 - \omega_1^2 = 2k_c/m$.`,
          explain: t`$k_c = \tfrac12 m(\omega_2^2 - \omega_1^2) = \tfrac12(${tn(m, 2)})\big[(${tn(w2, 4)})^2 - (${tn(w1, 4)})^2\big] = ${tn(kc)}$ N/m.`,
        };
      },
    }),
    num({
      id: 'cp-stack-high', difficulty: 3,
      gen(r) {
        const m1 = r.pick([80, 110, 140]) * 1e3, m2 = r.pick([20, 35]) * 1e3, k1 = r.pick([3, 4]) * 1e8, k2 = r.pick([1, 1.5]) * 1e8;
        const S = stack(m1, m2, k1, k2);
        return {
          prompt: t`For the two-mass stack model with $m_1 = ${m1 / 1e3}$ t, $m_2 = ${m2 / 1e3}$ t, $k_1 = ${tn(k1 / 1e8, 1)}\times10^{8}$ N/m (hold-downs) and $k_2 = ${tn(k2 / 1e8, 2)}\times10^{8}$ N/m (interstage), find the **higher** normal-mode frequency in Hz.`,
          visual: stackPic('The two-mass model of a launch vehicle on its pad, moving vertically. Illustrative stiffnesses.'),
          answer: S.hi / (2 * Math.PI), units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: S.lo / (2 * Math.PI), feedback: 'That is the lower mode.' }, { value: S.hi, feedback: 'That is ω in rad/s.' }],
          hints: [t`$\omega^4 - \big[(k_1 + k_2)/m_1 + k_2/m_2\big]\omega^2 + k_1k_2/(m_1m_2) = 0$.`, 'Take the larger root, then divide its square root by 2π.'],
          teach: t`The higher mode of the stack has the two stages moving in opposite directions, squeezing the interstage.`,
          explain: t`$\omega^2 = ${tn(S.hi ** 2)}\ \text{s}^{-2}$, so $f = ${tn(S.hi / (2 * Math.PI))}$ Hz. Its shape ratio $a_2/a_1 = ${tn(S.ratio(S.hi ** 2))}$ is negative: the stages move oppositely.`,
        };
      },
    }),
    mcq({
      id: 'cp-unequal', difficulty: 2,
      prompt: t`Two masses between walls on equal wall springs are coupled by a spring; mass 2 is twice as heavy as mass 1. In the **higher** (anti-phase) mode, how do their amplitudes compare?`,
      visual: pairPic({ m2: 2, start: 'one', graph: false }, 'Mass 2 (violet) has twice the mass of mass 1. Both wall springs are equal.'),
      choices: ['The heavier mass moves less than the lighter one', 'They move equally and oppositely, as for equal masses', 'The heavier mass moves more than the lighter one', 'The heavier mass stays at rest while only the lighter one moves'],
      answer: 0,
      why: {
        1: t`$(1, -1)$ is a mode only by symmetry; unequal masses break it, and the mode shapes tilt.`,
        2: 'More inertia means less motion for the same spring forces in the anti-phase mode, not more.',
        3: 'A mass at rest would still feel the coupling spring’s pull, so it could not stay at rest.',
      },
      hints: ['Turn the Explore’s m₂ slider up and start mode 2.', 'In the anti-phase mode, the heavy mass is the one that is harder to shake.'],
      teach: 'Symmetry fixes the shapes (1, 1) and (1, −1) only for identical oscillators; otherwise the eigenvectors tilt toward the lighter mass in the fast mode.',
      explain: t`Solving $(K - \omega^2M)\mathbf a = 0$ for $k = 10$, $k_c = 2$ N/m, $m_1 = 1$, $m_2 = 2$ kg gives, in the fast mode, $|a_2| < |a_1|$: the light mass does most of the moving while the heavy one, harder to accelerate, barely does.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 2: Coupled Oscillators', url: 'https://digitalcommons.usu.edu/foundation_wave/21/' },
    { label: 'Georgi, The Physics of Waves, ch. 3 (free from the author)', url: 'https://www.people.fas.harvard.edu/~hgeorgi/new.htm' },
  ],
});
