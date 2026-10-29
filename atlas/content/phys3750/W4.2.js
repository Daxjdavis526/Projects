// The one-dimensional wave equation y_tt = v² y_xx as an object in its own
// right: linear (superposition), second order in time (two pieces of initial
// data), acceleration set by curvature, plane waves e^{i(qx − ωt)} exactly when
// ω = ±vq (no dispersion), and the many media that obey it — strings, rods,
// sound, spacetime.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;

// the worked example: lengthwise waves in an aluminium-alloy structure
const EX = (() => {
  const E = 70e9, rho = 2700, v = Math.sqrt(E / rho), f = 16, lam = v / f;
  return { E, rho, v, f, lam, q: (2 * Math.PI) / lam, w: 2 * Math.PI * f };
})();

const travelPic = (caption, more = {}) => ({ type: 'wave-string', params: { mode: 'travel', controls: false, play: false, readout: false, time: 0.6, ...more }, caption });

export default lesson({
  id: 'phys3750.W4.2',
  title: 'The one-dimensional wave equation',
  minutes: 14, difficulty: 2,
  intro: t`The continuum limit left one equation for the displacement field $y(x, t)$:

$$\frac{\partial^2 y}{\partial t^2} = v^2\,\frac{\partial^2 y}{\partial x^2}$$

Read it as Newton’s law for every bit of the medium: **acceleration is proportional to curvature**. It is **linear**, so solutions add; it is **second order in time**, so the starting shape and the starting velocity are both needed. Try the course’s guess, a plane wave $e^{i(qx - \omega t)}$: $\partial_t \to -i\omega$, $\partial_x \to iq$, and the equation becomes $\omega^2 = v^2q^2$. Every wavenumber travels at the same speed $\omega/q = v$ — no dispersion, unlike the chain. Strings ($v^2 = T/\mu$), rods ($v^2 = E/\rho$), sound and, far from their sources, gravitational waves ($v = c$) all obey it.`,
  symbols: [
    { tex: 'y(x, t)', text: 'the displacement field: how far the medium at $x$ is from rest at time $t$' },
    { tex: 'v', text: 'the wave speed, in m/s, set by the medium alone' },
    { tex: '\\partial^2y/\\partial t^2', text: 'the acceleration of the bit of medium at $x$' },
    { tex: '\\partial^2y/\\partial x^2', text: 'the curvature of the displacement at $x$, in m⁻¹ (per unit displacement)' },
    { tex: 'q,\\ \\omega', text: 'the wavenumber (rad/m) and angular frequency (rad/s) of a plane wave $e^{i(qx - \\omega t)}$' },
  ],
  why: t`This one equation, with $v = c$, carries light and gravitational waves; its plane-wave solutions and the relation $\omega = vq$ are the template for every field theory you will meet.`,
  visual: {
    type: 'wave-string',
    title: 'Acceleration follows curvature',
    lead: t`A sinusoidal wave travelling along a string of beads. Turn on the **acceleration** arrows: they are largest where the string curves most (crests and troughs) and vanish where it is straight (crossing the axis) — the wave equation, bead by bead.`,
    tasks: ['Show acceleration arrows: every arrow points toward the axis, largest at crests and troughs.', 'Show velocity arrows instead: largest where the string crosses the axis.', t`Change $f$ at fixed $v$: the wavelength changes, the speed does not — $\omega = vq$.`],
    params: { mode: 'travel', arrows: 'acceleration' },
  },
  example: {
    prompt: t`Lengthwise (compressional) waves in an aluminium-alloy rocket structure obey $u_{tt} = (E/\rho)\,u_{xx}$, with Young’s modulus $E = 70$ GPa and density $\rho = 2700\ \text{kg/m}^3$. Show that $u = Ue^{i(qx - \omega t)}$ solves it only if $\omega = \pm vq$, find $v$, and find the wavelength of a ${EX.f} Hz (pogo-range) vibration.`,
    steps: [
      { label: 'Differentiate', text: t`$u_{tt} = (-i\omega)^2u = -\omega^2u$ and $u_{xx} = (iq)^2u = -q^2u$.` },
      { label: 'Substitute', text: t`$-\omega^2u = -(E/\rho)q^2u$. Since $u \ne 0$: $\omega^2 = v^2q^2$ with $v = \sqrt{E/\rho}$. The plain wave works for **every** $q$, with $\omega = \pm vq$ — the two signs are waves running toward $+x$ and $-x$.` },
      { label: 'Speed', text: t`$v = \sqrt{${tn(EX.E, 2)}/${EX.rho}} = ${tn(EX.v)}$ m/s.` },
      { label: 'Wavelength', text: t`$\lambda = v/f = ${tn(EX.v)}/${EX.f} = ${tn(EX.lam)}$ m, i.e. $q = ${tn(EX.q)}$ rad/m.` },
      { label: 'Sense check', text: t`A wavelength of a few hundred metres is longer than any rocket: pogo-range vibrations bend the structure gently along its whole length. Propellant mass loads the real structure and lowers its speed of sound well below this bare-metal value.` },
    ],
    answer: t`$\omega = \pm vq$ with $v = \sqrt{E/\rho} = ${tn(EX.v)}$ m/s; at ${EX.f} Hz, $\lambda = ${tn(EX.lam)}$ m.`,
    visual: travelPic(t`A plane wave on a string of beads, frozen; arrows show each bead’s acceleration, proportional to the local curvature. A string stands in for the rod: the equation is the same.`, { arrows: 'acceleration' }),
  },
  practice: [
    multi({
      id: 'which-solve', difficulty: 2,
      prompt: t`Which of these solve $y_{tt} = 9\,y_{xx}$ ($x$ in m, $t$ in s)? Select all that apply.`,
      visual: curvesPic([
        { fn: 'exp(-(x+1)^2)', color: 'accent', label: 't = 0', labelAt: -1, labelDy: -12 },
        { fn: 'exp(-(x - 2)^2)', color: 'violet', dash: [5, 4], label: 't = 1 s', labelAt: 2, labelDy: -12 },
      ], [-4, 5], [-0.2, 1.3], t`One solution, $e^{-(x + 1 - 3t)^2}$, at two moments: the shape moves 3 m in 1 s.`, { xlabel: 'x (m)', ylabel: 'y' }),
      choices: [t`$\sin(2x - 6t)$`, t`$(x + 3t)^3$`, t`$\sin(3x - t)$`, t`$\cos x\,\cos 3t$`, t`$e^{x}\cos 3t$`, t`$x^2 + 9t^2$`],
      answer: [0, 1, 3, 5],
      why: {
        2: t`$y_{tt} = -\sin(3x - t)$ but $9y_{xx} = -81\sin(3x - t)$: this wave moves at $1/3$ m/s, not 3 m/s.`,
        4: t`$y_{tt} = -9e^x\cos 3t$ but $9y_{xx} = +9e^x\cos 3t$: the signs disagree. An exponential in $x$ has the wrong curvature.`,
      },
      hints: [t`Any $f(x \pm 3t)$ works, and so does any sum of solutions.`, t`For the others, compute $y_{tt}$ and $9y_{xx}$ and compare.`],
      teach: t`Solutions include every $f(x - vt) + g(x + vt)$; when in doubt, differentiate and compare.`,
      explain: t`$\sin(2x - 6t)$ and $(x + 3t)^3$ are $f(x \mp 3t)$. $\cos x\cos 3t = \tfrac12[\cos(x - 3t) + \cos(x + 3t)]$ is a standing wave. And $x^2 + 9t^2 = \tfrac12[(x - 3t)^2 + (x + 3t)^2]$: $y_{tt} = 18 = 9 \times 2$.`,
    }),
    num({
      id: 'acc-curvature', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 5]), lam = r.pick([4, 5, 8]), v = r.pick([20, 30, 40]);
        const q = (2 * Math.PI) / lam, amax = v * v * q * q * (A / 100);
        return {
          prompt: t`A sideways wave $y = A\sin(qx - \omega t)$ with $A = ${A}$ cm and wavelength ${lam} m runs along a tether where $v = ${v}$ m/s. What is the largest sideways acceleration of any bit of the tether, in m/s²?`,
          visual: curvesPic([{ fn: `${A}*sin(${q}*x)`, color: 'accent' }], [0, 2 * lam], [-1.6 * A, 1.6 * A], 'A snapshot of the wave (y in cm against x in m). The tether bends most at the crests and troughs.', { xlabel: 'x (m)', ylabel: 'y (cm)' }),
          answer: amax, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: v * q * (A / 100), feedback: t`That is the largest **velocity**, $\omega A$. Acceleration needs one more factor of $\omega = vq$.` }, { value: v * v * q * q * A, feedback: 'Convert the amplitude to metres.' }],
          hints: [t`$y_{tt} = v^2y_{xx}$, and the largest $|y_{xx}|$ of $A\sin(qx)$ is $q^2A$.`, t`$q = 2\pi/\lambda$; $A$ in metres.`],
          teach: t`The wave equation turns curvature into acceleration: $|y_{tt}|_{\max} = v^2q^2A = \omega^2A$.`,
          explain: t`$q = ${tn(q)}$ rad/m, so $a_{\max} = (${v})^2(${tn(q)})^2(${A / 100}) = ${tn(amax)}\ \text{m/s}^2$ — at the crests and troughs, pointing back toward the axis.`,
        };
      },
    }),
    num({
      id: 'rod-wavelength', difficulty: 2,
      gen(r) {
        const [name, E, rho] = r.pick([['titanium alloy', 114e9, 4430], ['steel', 200e9, 7850], ['carbon-fibre composite (along the fibres)', 135e9, 1600]]);
        const f = r.pick([200, 500, 1000, 2000]), v = Math.sqrt(E / rho);
        return {
          prompt: t`A ${name} strut ($E = ${tn(E / 1e9, 3)}$ GPa, $\rho = ${tn(rho, 4)}\ \text{kg/m}^3$) carries lengthwise waves obeying $u_{tt} = (E/\rho)u_{xx}$. What is the wavelength of a ${f} Hz vibration in it, in m?`,
          visual: travelPic('A wave travelling along a medium, frozen (a string stands in for the strut: the equation is the same).'),
          answer: v / f, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (2 * Math.PI * v) / f, feedback: t`$\lambda = v/f = 2\pi v/\omega$. You used $\omega$ where $f$ belonged, or vice versa.` }, { value: E / rho / f, feedback: t`$v$ is the **square root** of $E/\rho$.` }],
          hints: [t`$v = \sqrt{E/\rho}$.`, t`$\lambda = v/f$.`],
          teach: t`From $\omega = vq$: $\lambda = v/f$, with $v$ read off the equation’s coefficient.`,
          explain: t`$v = ${tn(v)}$ m/s, so $\lambda = ${tn(v)}/${f} = ${tn(v / f)}$ m.`,
        };
      },
    }),
    mcq({
      id: 'units', difficulty: 1,
      prompt: t`For a string, the coefficient in $y_{tt} = v^2y_{xx}$ is built from the tension $T$ (N) and the linear density $\mu$ (kg/m). Which combination has the units of a speed squared?`,
      visual: travelPic('Waves on a string: the speed comes from the string, not the source.', { arrows: 'none' }),
      choices: [t`$T/\mu$`, t`$T\mu$`, t`$\mu/T$`, t`$T/(\mu g)$`],
      answer: 0,
      why: {
        1: t`$\text{N}\cdot\text{kg/m} = \text{kg}^2/\text{s}^2$: not a speed squared.`,
        2: t`$\mu/T$ has units $\text{s}^2/\text{m}^2$ — one over a speed squared.`,
        3: t`$T/(\mu g)$ is a length, and gravity plays no part in a taut string’s waves.`,
      },
      hints: [t`$1\ \text{N} = 1\ \text{kg m/s}^2$.`, t`Divide: $\dfrac{\text{kg m/s}^2}{\text{kg/m}}$.`],
      teach: t`Units fix the wave speed up to a number: $v^2 = T/\mu$ (and the continuum limit shows the number is 1).`,
      explain: t`$\dfrac{\text{N}}{\text{kg/m}} = \dfrac{\text{kg m s}^{-2}}{\text{kg m}^{-1}} = \text{m}^2/\text{s}^2$. Stiffness over inertia, as for every wave speed.`,
    }),
    expr({
      id: 'foundation', difficulty: 3,
      gen(r) {
        const v = r.pick([2, 3, 4, 5]), wc = r.pick([6, 8, 12]);
        return {
          prompt: t`A string glued to a springy bed obeys $y_{tt} = v^2y_{xx} - \omega_c^2\,y$ with $v = ${v}$ m/s and $\omega_c = ${wc}$ rad/s. Substitute $y = e^{i(qx - \omega t)}$ and find $\omega$ (positive) as a function of $q$.`,
          visual: curvesPic([{ fn: `${v}*x`, color: 'ink3', dash: [6, 4], label: 'ω = v q (no bed)', labelAt: 4, labelDy: 14 }], [0, 6], [0, Math.max(v * 6, 2 * wc) * 1.1], t`For comparison: the plain wave equation’s straight line $\omega = vq$.`, { xlabel: 'q (rad/m)', ylabel: 'ω (rad/s)' }),
          answer: `sqrt(${v * v} q^2 + ${wc * wc})`, answerTeX: t`\sqrt{${v * v}q^2 + ${wc * wc}}`,
          lhs: '\\omega(q)', vars: { q: [0.1, 6] },
          errors: [{ answer: `sqrt(${v * v} q^2 - ${wc * wc})`, feedback: t`Check the sign: $-\omega^2 = -v^2q^2 - \omega_c^2$.` }, { answer: `${v} q`, feedback: 'That is the bed-free answer; the bed adds a term.' }],
          hints: [t`$y_{tt} = -\omega^2y$ and $y_{xx} = -q^2y$.`, t`$-\omega^2 = -v^2q^2 - \omega_c^2$.`],
          teach: t`Any extra term spoils $\omega = vq$: here $\omega^2 = v^2q^2 + \omega_c^2$, a **dispersive** medium with no waves below $\omega_c$.`,
          explain: t`$\omega = \sqrt{${v * v}q^2 + ${wc * wc}}$. Now $\omega/q$ depends on $q$, so pulses spread; and as $q \to 0$, $\omega \to \omega_c$, not zero — the same form as a plasma’s or the Klein–Gordon equation’s dispersion relation.`,
        };
      },
    }),
    mcq({
      id: 'shake-faster', difficulty: 2,
      prompt: 'You double the frequency at which you shake the end of a long taut string. What happens to the waves on it?',
      visual: travelPic('A wave on a string driven from one end, frozen.', { f: 0.8 }),
      choices: ['The wavelength halves; the speed stays the same', 'The speed doubles; the wavelength stays the same', 'Both the speed and the wavelength go up by √2', 'The speed doubles and the wavelength also doubles'],
      answer: 0,
      why: {
        1: t`The speed is fixed by the equation’s coefficient, $v^2 = T/\mu$ — a property of the string, not of your hand.`,
        2: t`$\omega = vq$ is linear with a fixed slope; nothing about it involves a square root of the frequency.`,
        3: t`Then $v = f\lambda$ would quadruple — with nothing about the string changed.`,
      },
      hints: [t`What sets $v$ in $y_{tt} = v^2y_{xx}$?`, t`$\omega = vq$ with $v$ fixed: double $\omega$, double $q$.`],
      teach: 'The medium sets the speed; the source sets the frequency; the wavelength follows from λ = v/f.',
      explain: t`$v = \sqrt{T/\mu}$ is unchanged, so doubling $f$ halves $\lambda = v/f$. (On a dispersive medium the speed would change with frequency — not here.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gw', difficulty: 2, transfer: true,
      gen(r) {
        const f = r.pick([35, 100, 150, 250, 400]), c = 2.998e8, lam = c / f / 1000;
        return {
          prompt: t`Far from their source, gravitational-wave strains obey the wave equation with $v = c = 2.998\times10^{8}$ m/s. A signal at ${f} Hz passes through a detector with 4 km arms. What is its wavelength, in km?`,
          visual: { type: 'gr-chirp', params: {}, caption: 'A gravitational-wave chirp and its effect on a detector’s arms (strain hugely exaggerated).' },
          answer: lam, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: (2 * Math.PI * c) / f / 1000, feedback: t`$\lambda = c/f$; the $2\pi$ belongs with $\omega$.` }],
          hints: [t`$\omega = cq$ means $\lambda = c/f$.`, 'Convert metres to kilometres.'],
          teach: t`Gravitational waves obey $\omega = cq$ — no dispersion — so $\lambda = c/f$.`,
          explain: t`$\lambda = ${tn(c, 4)}/${f} = ${tn(lam * 1000)}$ m $= ${tn(lam)}$ km: hundreds of times the 4 km arms, so the whole detector is stretched almost uniformly at each instant.`,
        };
      },
    }),
    num({
      id: 'cp-pyroshock', difficulty: 2,
      gen(r) {
        const L = r.pick([4, 6, 8, 12]), E = 70e9, rho = 2700, v = Math.sqrt(E / rho);
        return {
          prompt: t`A pyrotechnic separation bolt fires at one end of a ${L} m aluminium-alloy interstage ($E = 70$ GPa, $\rho = 2700\ \text{kg/m}^3$). How long does the lengthwise shock front take to reach the far end, in ms?`,
          visual: travelPic('A disturbance running along a medium at the speed its equation sets (a string stands in for the structure).', { arrows: 'none' }),
          answer: (L / v) * 1000, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: (L / (E / rho)) * 1000, feedback: t`Take the square root: $v = \sqrt{E/\rho}$.` }],
          hints: [t`$v = \sqrt{E/\rho}$.`, t`Time $= L/v$.`],
          teach: t`Every disturbance governed by $u_{tt} = v^2u_{xx}$ travels at $v$; for lengthwise waves in a rod, $v = \sqrt{E/\rho}$.`,
          explain: t`$v = ${tn(v)}$ m/s, so $t = ${L}/${tn(v)} = ${tn((L / v) * 1000)}$ ms.`,
        };
      },
    }),
    mcq({
      id: 'cp-two-data', difficulty: 2,
      prompt: t`To predict the future motion of a long string from $y_{tt} = v^2y_{xx}$, what must you know at $t = 0$?`,
      visual: travelPic('A string at one instant: its shape alone does not say which way each bead is moving.', { arrows: 'velocity' }),
      choices: [t`Both the shape $y(x, 0)$ and the velocity $y_t(x, 0)$ along it`, t`Only the shape $y(x, 0)$, since the equation fixes the rest`, t`Only the velocity $y_t(x, 0)$, since a shape cannot move itself`, t`The shape and the acceleration $y_{tt}(x, 0)$ along it`],
      answer: 0,
      why: {
        1: 'The same snapshot could belong to a wave moving left or right, or to a standing wave at its turning point: the shape alone is ambiguous.',
        2: 'A displaced string at rest does move (it is pulled by its curvature), so the shape matters too.',
        3: t`The acceleration is not extra information: the equation computes it from the shape, $y_{tt} = v^2y_{xx}$.`,
      },
      hints: ['How many time derivatives does the equation have?', 'Newton’s law needs position and velocity — for every bead.'],
      teach: 'Second order in time means two initial functions: displacement and velocity.',
      explain: t`The equation is Newton’s second law for every point, so like any second-order system it needs initial positions and velocities: $y(x, 0)$ and $y_t(x, 0)$. d’Alembert’s formula, next, uses exactly these two.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 5–6 (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/17/' },
    { label: 'Georgi, The Physics of Waves, ch. 6 (free from the author)', url: 'https://www.people.fas.harvard.edu/~hgeorgi/new.htm' },
  ],
});
