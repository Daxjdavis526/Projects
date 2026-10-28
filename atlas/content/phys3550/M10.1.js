// The driven damped pendulum (Taylor ch. 12): φ̈ + 2βφ̇ + ω₀² sin φ =
// γω₀² cos ωt with Taylor's parameters (drive period 1 s, ω₀ = 1.5ω,
// β = ω₀/4). Small γ: the linear driven oscillator of M2.3, amplitude
// γω₀²/√((ω₀² − ω²)² + 4β²ω²) = 1.543γ rad. Larger γ: superposition fails
// (sin(φ₁ + φ₂) ≠ sin φ₁ + sin φ₂), the amplitude outruns the linear
// prediction (the pendulum's own frequency falls with amplitude toward the
// drive's), and past γ ≈ 1.066 the period doubles, again and again, until
// at γ = 1.105 it never repeats. The Poincaré section (one dot per drive
// period) counts the period; a 2D autonomous flow cannot be chaotic
// (Poincaré–Bendixson) — the drive's phase is the third dimension.
// Explored in cm5-pendulum. Transfer: a Josephson junction (RCSJ model)
// obeys the same equation. Numbers from model/cm5-chaos.js.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { K, TAY, sci, gpic, seg, lab, distinct, pendPic } from './_cm5.js';
import { planePic } from './_cm4.js';

const t = String.raw;
const PI = Math.PI;
const HBAR = 1.054571817e-34, QE = 1.602176634e-19;

// the worked example: steady amplitudes from rest at φ = 0, linear theory against RK4
const amp = (g) => {
  const R = K.run({ gamma: g }, [0, 0], { periods: 60, spp: 200 });
  const tail = R.phi.slice(-201);
  return (Math.max(...tail) - Math.min(...tail)) / 2;
};
const EX = { g1: 0.1, g2: 0.2, g3: 0.45, g4: 0.9 };
EX.n = [EX.g1, EX.g2, EX.g3, EX.g4].map(amp);
EX.l = [EX.g1, EX.g2, EX.g3, EX.g4].map((g) => TAY.gain * g);

// the periods along the cascade (Poincaré dots after 300 drive periods)
const REGIME = [
  { gamma: 0.9, n: 1, name: 'period 1' },
  { gamma: 1.073, n: 2, name: 'period 2' },
  { gamma: 1.081, n: 4, name: 'period 4' },
  { gamma: 1.105, n: 0, name: 'chaotic' },
];
const D = K.TAYLOR_DOUBLINGS;

export default lesson({
  id: 'phys3550.M10.1',
  title: 'The driven damped pendulum',
  minutes: 16, difficulty: 3,
  intro: t`Push a damped pendulum back and forth with a periodic torque. For small swings it is the driven oscillator of [M2.3](#/lesson/phys3550.M2.3): it settles into one steady motion at the drive's frequency, and doubling the push doubles the swing. But gravity's torque goes as $\sin\phi$, not $\phi$, and once the swings are large that difference takes over. As the drive strength $\gamma$ rises past about $1.07$, the motion repeats only every **two** drive periods, then every four, then eight — and by $\gamma = 1.105$ it **never repeats at all**. Nothing random has been added: the equation is exact and deterministic. This is **chaos**, and the simplest place to watch it is a stroboscope that photographs the pendulum once per drive period: the **Poincaré section**.`,
  equation: t`\ddot\phi + 2\beta\dot\phi + \omega_0^2\sin\phi = \gamma\,\omega_0^2\cos\omega t`,
  symbols: [
    { tex: '\\phi', text: 'the angle from straight down, in rad (not wrapped: going over the top once adds $2\\pi$)' },
    { tex: '\\beta', text: 'the damping constant, in $\\text{s}^{-1}$: undriven swings die away like $e^{-\\beta t}$' },
    { tex: '\\omega_0', text: 'the natural frequency of small swings, $\\sqrt{g/\\ell}$, in rad/s' },
    { tex: '\\gamma', text: 'the **drive strength**: the drive torque’s amplitude divided by the largest torque gravity can exert, $mg\\ell$ (dimensionless)' },
    { tex: '\\omega', text: 'the drive’s angular frequency, in rad/s; the drive period is $2\\pi/\\omega$' },
    { tex: 't', text: 'time, in s' },
  ],
  why: t`It is the smallest mechanical system that is chaotic, and the same equation describes a Josephson junction, a ship rolling in waves and a moon's tumbling spin; learning to read its Poincaré sections is learning to read every chaotic system.`,
  visual: {
    type: 'cm5-pendulum',
    title: 'The route to chaos',
    lead: t`Taylor's pendulum: drive period 1 s, $\omega_0 = 1.5\omega$, $\beta = \omega_0/4$, released from rest at $\phi = -\pi/2$. From the top: the pendulum, $\phi(t)$ over 12 drive periods after 30 periods of settling, the state-space orbit with its **Poincaré dots** (gold, one per drive period), and the bifurcation diagram — the Poincaré values of $\phi$ for every $\gamma$ across $1.06$ to $1.087$, with your $\gamma$ dashed.`,
    tasks: [
      t`Set $\gamma = 1.06$: one gold dot — the motion repeats every drive period. Slide to $1.073$: two dots, and $\phi(t)$ alternates a big and a small swing.`,
      t`Set $\gamma = 1.081$ (four dots) and $1.0826$ (eight): each doubling comes sooner than the last. Read the bifurcation diagram: the branches split at about $1.066$, $1.079$, $1.082$ and $1.083$.`,
      t`Set $\gamma = 1.105$: the dots no longer sit on a few points but scatter over a thin, folded set, and now and then the pendulum swings up just past the inverted position before falling back.`,
    ],
    params: { gamma: 1.073, panels: ['swing', 'time', 'phase', 'bif'], skip: 30, periods: 12, keep: 120, controls: ['gamma'], gRange: [0.9, 1.11], readouts: ['gamma', 'period'] },
    caption: t`Integrated with fixed-step RK4 at 200 steps per drive period (100 in the bifurcation diagram). The gold arrow in the top panel shows the drive torque's phase, not its size. In the bifurcation diagram near each doubling the transient dies slowly, so a few columns there look smeared.`,
  },
  example: {
    prompt: t`Taylor's pendulum ($\omega = 2\pi$ rad/s, $\omega_0 = 3\pi$ rad/s, $\beta = 3\pi/4\ \text{s}^{-1}$) starts from rest at $\phi = 0$. Predict the steady amplitude from the linear (small-angle) theory for $\gamma = ${EX.g1}$, $${EX.g2}$, $${EX.g3}$ and $${EX.g4}$, and compare with a numerical solution of the full equation. When does the linear picture fail?`,
    visual: pendPic({ gamma: EX.g4, start: [0, 0], skip: 20, periods: 4, panels: ['time'], marks: true }, t`$\phi(t)$ for $\gamma = ${EX.g4}$ after 20 drive periods (RK4): a steady swing of $${sci(EX.n[3], 3)}$ rad — far larger than the linear theory's $${sci(EX.l[3], 3)}$ rad.`),
    steps: [
      { label: 'Linearize', text: t`For small $\phi$, $\sin\phi \approx \phi$ and the equation is $\ddot\phi + 2\beta\dot\phi + \omega_0^2\phi = \gamma\omega_0^2\cos\omega t$ — [M2.3](#/lesson/phys3550.M2.3)'s driven oscillator with $f_0 = \gamma\omega_0^2$.` },
      { label: 'Linear amplitude', text: t`$A = \dfrac{\gamma\omega_0^2}{\sqrt{(\omega_0^2 - \omega^2)^2 + 4\beta^2\omega^2}} = \dfrac{9\pi^2\gamma}{\sqrt{(5\pi^2)^2 + (3\pi^2)^2}} = \dfrac{9\gamma}{\sqrt{34}} = ${sci(TAY.gain, 4)}\,\gamma$ rad.` },
      { label: 'Predict', text: t`For $\gamma = ${EX.g1}, ${EX.g2}, ${EX.g3}, ${EX.g4}$: $A = ${EX.l.map((x) => sci(x, 3)).join(',\\ ')}$ rad.` },
      { label: 'Compute', text: t`Integrating the full equation (RK4, 60 drive periods) and measuring the final swing: $${EX.n.map((x) => sci(x, 3)).join(',\\ ')}$ rad.` },
      { label: 'Compare', text: t`At $\gamma = ${EX.g1}$ the two agree to $${sci((100 * (EX.n[0] - EX.l[0])) / EX.l[0], 2)}\%$; at $${EX.g3}$ the true swing is $${sci((100 * (EX.n[2] - EX.l[2])) / EX.l[2], 2)}\%$ bigger; at $${EX.g4}$ it is $${sci(EX.n[3] / EX.l[3], 3)}$ times the prediction. Doubling $\gamma$ from $${EX.g1}$ to $${EX.g2}$ multiplies the swing by $${sci(EX.n[1] / EX.n[0], 3)}$; from $${EX.g3}$ to $${EX.g4}$, by $${sci(EX.n[3] / EX.n[2], 3)}$. Response no longer scales with drive: **superposition has failed**.` },
      { label: 'Why bigger', text: t`A pendulum's own frequency falls as its swing grows: $\sin\phi < \phi$, so at large angles gravity pulls back less than the linear spring it imitates, and a big swing takes longer. Here $\omega_0 = 1.5\omega$, so a bigger swing tunes the pendulum *toward* the drive, nearer resonance — which makes the swing bigger still.` },
    ],
    answer: t`Linear theory gives $A = ${sci(TAY.gain, 4)}\gamma$ rad, which is good to a fraction of a per cent at $\gamma = ${EX.g1}$ but gives only $${sci(EX.l[3], 3)}$ rad at $\gamma = ${EX.g4}$, where the true swing is $${sci(EX.n[3], 3)}$ rad (about $${Math.round((EX.n[3] * 180) / PI)}^\circ$). The linear picture holds to a few per cent while the swing stays below about half a radian, and fails badly beyond.`,
  },
  practice: [
    mcq({
      id: 'superpose', difficulty: 2,
      prompt: t`$\phi_1(t)$ solves the pendulum equation with drive $\gamma_1\omega_0^2\cos\omega t$, and $\phi_2(t)$ with $\gamma_2\omega_0^2\cos\omega t$. Does $\phi_1 + \phi_2$ solve it with drive $(\gamma_1 + \gamma_2)\omega_0^2\cos\omega t$?`,
      visual: gpic({ x: [-3.2, 3.2], y: [-3.2, 3.2], xlabel: 'φ (rad)', ylabel: 'torque ÷ mgℓ', curves: [{ fn: 'x', color: 'ink3', width: 1.6, dash: true, label: 'linear: φ', labelAt: 2.1, labelDx: -78, labelDy: -6 }, { fn: 'sin(x)', color: 'accent', width: 2.4, label: 'gravity: sin φ', labelAt: 2.2, labelDx: 4, labelDy: 18 }] }, t`Gravity's restoring torque (per $mg\ell$) against angle: $\sin\phi$, with its small-angle line $\phi$ dashed. They agree only near $\phi = 0$.`, 'The sine curve and the straight line y = x through the origin'),
      choices: [t`No: $\sin(\phi_1 + \phi_2) \ne \sin\phi_1 + \sin\phi_2$, so the restoring terms do not add`, t`Yes: the equation is linear in the drive, so solutions add`, t`Yes, but only if $\gamma_1 + \gamma_2 < 1$`, t`No, because the damping term $2\beta\dot\phi$ does not add`],
      answer: 0,
      why: { 1: t`The drive term is linear, but the equation as a whole is not: $\sin\phi$ is the nonlinear term. Superposition needs every term to be linear in $\phi$.`, 2: t`Superposition fails for any drive strength; it is only nearly true when the angles are small enough for $\sin\phi \approx \phi$.`, 3: t`$2\beta(\dot\phi_1 + \dot\phi_2) = 2\beta\dot\phi_1 + 2\beta\dot\phi_2$: the damping term is linear and adds perfectly well. The culprit is $\sin\phi$.` },
      hints: [t`Substitute $\phi_1 + \phi_2$ into each term. Which term does not split into a $\phi_1$ piece plus a $\phi_2$ piece?`],
      teach: t`A nonlinear term such as $\sin\phi$ breaks superposition: responses to two drives do not add.`,
      explain: t`$\sin(\phi_1 + \phi_2) = \sin\phi_1\cos\phi_2 + \cos\phi_1\sin\phi_2$, not $\sin\phi_1 + \sin\phi_2$. Without superposition there is no Fourier decomposition of the response into independent pieces, and the door to period doubling and chaos is open.`,
    }),
    num({
      id: 'linear-amp', difficulty: 2,
      gen(r) {
        const k = r.pick([1.2, 1.5, 2]), g = r.pick([0.02, 0.05, 0.08]), Td = r.pick([0.5, 1, 2]);
        const w = (2 * PI) / Td, w0 = k * w, beta = w0 / 4;
        const A = (g * w0 * w0) / Math.sqrt((w0 * w0 - w * w) ** 2 + 4 * beta * beta * w * w);
        return {
          prompt: t`A pendulum with $\omega_0 = ${k}\omega$ and $\beta = \omega_0/4$ is driven with period $${Td}$ s at strength $\gamma = ${g}$. The swings stay small. What is the steady amplitude, in radians?`,
          answer: A, units: 'rad', tol: { rel: 0.01 },
          errors: distinct([{ value: g, feedback: t`That is the static tilt the drive torque would hold. A periodic drive is amplified or reduced by the gain $\omega_0^2/\sqrt{(\omega_0^2 - \omega^2)^2 + 4\beta^2\omega^2}$.` }, { value: (g * w0 * w0) / Math.abs(w0 * w0 - w * w), feedback: t`You left out the damping term $4\beta^2\omega^2$ under the root.` }, { value: (g * w0 * w0) / Math.sqrt((w0 * w0 - w * w) ** 2 + beta * beta * w * w), feedback: t`The damping term is $(2\beta\omega)^2 = 4\beta^2\omega^2$.` }], A),
          hints: [t`Small swings: $\sin\phi \approx \phi$, a linear driven oscillator with $f_0 = \gamma\omega_0^2$.`, t`$A = \gamma\omega_0^2/\sqrt{(\omega_0^2 - \omega^2)^2 + 4\beta^2\omega^2}$; everything can be written in units of $\omega$, so the period drops out.`],
          teach: t`For small swings the driven pendulum is the linear driven oscillator, with amplitude $\gamma\omega_0^2/\sqrt{(\omega_0^2 - \omega^2)^2 + 4\beta^2\omega^2}$.`,
          explain: t`In units of $\omega$: $\omega_0^2 = ${sci(k * k, 3)}\omega^2$ and $2\beta\omega = ${sci(k / 2, 3)}\omega^2$, so $A = \dfrac{${g}\times${sci(k * k, 3)}}{\sqrt{${sci((k * k - 1) ** 2, 4)} + ${sci((k / 2) ** 2, 4)}}} = ${sci(A, 3)}$ rad. The drive period does not matter: only the ratios $\omega_0/\omega$ and $\beta/\omega$ do.`,
          visual: pendPic({ gamma: g, w: r6x(w), w0: r6x(w0), beta: r6x(beta), start: [0, 0], skip: 20, periods: 1, panels: ['swing'], gRange: [0, 1.2] }, t`The pendulum at one moment of its steady swing, drawn at its true angle. The gold arrow shows only the drive's phase.`),
        };
      },
    }),
    mcq({
      id: 'read-section', difficulty: 2,
      gen(r) {
        const R = r.pick(REGIME);
        const all = ['period 1', 'period 2', 'period 4', 'chaotic'];
        const ans = all.indexOf(R.name);
        const why = {
          'period 1': t`One dot means the state comes back to the same point every drive period. Count the gold dots in this picture.`,
          'period 2': t`Period 2 would show exactly two gold dots, visited alternately. Count them.`,
          'period 4': t`Period 4 would show exactly four gold dots. Count them.`,
          chaotic: t`A chaotic section has dozens of dots strewn along a curving, folded set; a few separate dots mean the motion repeats.`,
        };
        return {
          prompt: t`The gold dots are a Poincaré section of a driven pendulum: its state $(\phi, \dot\phi)$ photographed once every drive period, for 120 periods after a long transient. What is the motion?`,
          visual: pendPic({ gamma: R.gamma, panels: ['phase'], skip: 30, periods: 6, keep: 120, orbit: R.n !== 0 }, R.n ? t`The orbit over six drive periods (blue) and 120 Poincaré dots (gold). Taylor's pendulum; the drive strength is not given.` : t`120 Poincaré dots (gold) — the orbit itself is left out, as it would fill the picture. Taylor's pendulum; the drive strength is not given.`),
          choices: [t`Period 1`, t`Period 2`, t`Period 4`, t`Chaotic: it never repeats`],
          answer: ans,
          why: Object.fromEntries(all.map((n, i) => [i, why[n]]).filter(([i]) => i !== ans)),
          hints: [t`A period-$n$ motion revisits the same $n$ states once per drive period each, so its section has exactly $n$ dots.`],
          teach: t`A Poincaré section of a period-$n$ motion is $n$ points; a chaotic one is an endless scatter on a folded set.`,
          explain: R.n ? t`The ${120} dots fall on just ${R.n} point${R.n > 1 ? 's' : ''}: the motion repeats every ${R.n} drive period${R.n > 1 ? 's' : ''} (here $\gamma = ${R.gamma}$).` : t`The dots never repeat: they spread along a thin folded set — a strange attractor (here $\gamma = ${R.gamma}$).`,
        };
      },
    }),
    mcq({
      id: 'why-drive', difficulty: 3,
      prompt: t`An *undriven* damped pendulum (any amplitude) can never be chaotic, but the driven one can. Why?`,
      visual: planePic({ fx: 'y', fy: '-sin(x) - 0.25*y', x: [-6.5, 6.5], y: [-2.8, 2.8], xlabel: 'φ (rad)', ylabel: 'φ̇', equal: false, grid: 19, seeds: [{ x: -6, y: 2.6, dir: 'forward', color: 'accent' }, { x: 1, y: 2.4, dir: 'forward', color: 'warn' }], T: 40 }, t`The undriven damped pendulum's state plane (illustrative units): every orbit spirals into a resting state. Orbits cannot cross.`),
      choices: [t`Its state $(\phi, \dot\phi)$ moves in a plane, where orbits cannot cross, so they can only settle down or loop; the drive's phase $\omega t$ adds a third dimension in which orbits can weave without crossing`, t`Damping removes energy, and chaos needs energy to be conserved`, t`Chaos needs many degrees of freedom, and the drive adds many`, t`Without a drive the equation is linear`],
      answer: 0,
      why: { 1: t`The driven pendulum is damped too, and still chaotic. Damping shrinks state-space areas; chaos survives on a strange attractor of zero area.`, 2: t`A common belief, but false: the driven pendulum has only $\phi$, $\dot\phi$ and the drive phase — "one and a half" degrees of freedom — and that is enough.`, 3: t`$\sin\phi$ is just as nonlinear without the drive. Nonlinearity is necessary for chaos but not sufficient.` },
      hints: [t`How many numbers fix the future of the undriven pendulum? Of the driven one (what else must you know)?`, t`In a plane, an orbit that cannot cross any other orbit (or itself) is boxed in — the Poincaré–Bendixson theorem.`],
      teach: t`Chaos needs at least three state-space dimensions for a flow: a plane is too crowded for orbits that never cross.`,
      explain: t`For the undriven pendulum $(\phi, \dot\phi)$ fixes the future, and in a plane an orbit that never crosses itself or any other must end at a rest point or a closed loop (the Poincaré–Bendixson theorem). The driven pendulum's future also depends on the drive's phase $\omega t$ — a third coordinate. In three dimensions orbits can stretch and fold without crossing: that stretching and folding is chaos.`,
    }),
    num({
      id: 'repeat-time', difficulty: 2,
      gen(r) {
        const R = r.pick(REGIME.filter((x) => x.n >= 2)), Td = r.pick([0.25, 0.5, 2, 4]);
        const w = (2 * PI) / Td, w0 = 1.5 * w, beta = w0 / 4, rep = R.n * Td;
        return {
          prompt: t`A pendulum driven with period $${Td}$ s, with $\omega_0 = 1.5\omega$ and $\beta = \omega_0/4$, has settled into the motion shown. After how many seconds does the whole motion repeat?`,
          visual: pendPic({ gamma: R.gamma, w: r6x(w), w0: r6x(w0), beta: r6x(beta), panels: ['time'], skip: 40, periods: 8, marks: true }, t`$\phi(t)$ after 40 drive periods of settling. The ticks on the time axis mark every drive period.`),
          answer: rep, units: 's', tol: { rel: 0.01 },
          errors: distinct([{ value: Td, feedback: t`That is the drive period. Look again: does each swing look exactly like the one before?` }, { value: rep / 2, feedback: t`Compare swings further apart: the pattern takes ${R.n} drive periods to come round.` }, { value: 2 * rep, feedback: t`It repeats sooner than that: ${R.n} drive periods.` }], rep),
          hints: [t`The ticks are one drive period apart. Find the shortest stretch after which the curve is exactly the same again.`, t`Compare the heights of successive maxima: a period-$n$ motion cycles through $n$ different ones.`],
          teach: t`A period-$n$ motion repeats after $n$ drive periods, and every swing in between is different.`,
          explain: t`The maxima cycle through ${R.n} different heights, so the motion repeats every ${R.n} drive periods: $${R.n}\times${Td}\ \text{s} = ${sci(rep, 3)}$ s. (This is the dimensionless motion of Taylor's pendulum at $\gamma = ${R.gamma}$, run on a drive period of $${Td}$ s.)`,
        };
      },
    }),
    order({
      id: 'route', difficulty: 2,
      prompt: t`Put the long-term motions of Taylor's pendulum (released from rest at $\phi = -\pi/2$) in order of **increasing** drive strength $\gamma$.`,
      visual: pendPic({ gamma: 1.07, panels: ['bif'], bif: [1.06, 1.088], bifN: 200, marks: false }, t`The bifurcation diagram for $1.06 \le \gamma \le 1.088$: $\phi$ once per drive period after a long transient. Read it from left to right.`),
      items: [t`A small swing that is almost a sine wave, period 1`, t`A large swing, over two radians, still period 1`, t`Period 2: alternately big and small swings`, t`Period 4`, t`Chaos: no repeat`],
      hints: [t`Small $\gamma$ is nearly linear. Each doubling needs a stronger drive than the last.`],
      teach: t`As the drive strengthens, the pendulum goes from nearly linear swings through a cascade of period doublings into chaos.`,
      explain: t`Below $\gamma \approx 0.3$ the swing is nearly sinusoidal; by $\gamma = 0.9$ it swings $${sci(EX.n[3], 2)}$ rad, far beyond linear theory, but still period 1. The period doubles at $\gamma = ${D[0].toFixed(4)}$, again at $${D[1].toFixed(4)}$ and $${D[2].toFixed(4)}$, ever closer together, and chaos follows (by $1.105$). Beyond the window drawn there are also periodic windows inside the chaos.`,
    }),
    multi({
      id: 'chaos-true', difficulty: 3,
      prompt: t`Which statements about the pendulum at $\gamma = 1.105$ are true?`,
      visual: pendPic({ gamma: 1.105, panels: ['time'], periods: 20, two: true, d0: 1e-4 }, t`Two pendulums at $\gamma = 1.105$, released $10^{-4}$ rad apart (blue and orange): they agree for about ten drive periods, then part.`),
      choices: [
        t`Its motion is fully determined by its starting state; there is no randomness in the equation`,
        t`Its angle stays within a bounded range, yet the motion never exactly repeats`,
        t`Two copies started a tiny distance apart end up doing entirely different things`,
        t`Its motion is random, like a coin toss, because it never repeats`,
        t`A more accurate computer would make it repeat`,
      ],
      answer: [0, 1, 2],
      why: { 3: t`Deterministic: the same start gives exactly the same motion. "Never repeats" and "random" are different things.`, 4: t`Better arithmetic only delays the moment two nearby starts part; the true motion itself does not repeat.` },
      hints: [t`What would you need to know to predict the motion exactly? Is anything left to chance?`, t`Look at the picture: what happens to two starts $10^{-4}$ rad apart?`],
      teach: t`Chaos is deterministic but aperiodic, with sensitive dependence on the starting state.`,
      explain: t`The equation has no random term: given $\phi(0)$ and $\dot\phi(0)$ the future is fixed. But the motion never repeats, though it stays bounded (over 300 drive periods $|\phi|$ never exceeds $3.4$ rad, just past the top), and tiny differences grow exponentially — the subject of [the next lesson](#/lesson/phys3550.M10.2).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-josephson', difficulty: 3, transfer: true,
      gen(r) {
        const Ic = r.pick([5, 10, 20, 50]), Cp = r.pick([0.5, 1, 2, 5]);
        const wp = Math.sqrt((2 * QE * Ic * 1e-6) / (HBAR * Cp * 1e-12)), f = wp / (2 * PI) / 1e9;
        return {
          prompt: t`A **Josephson junction** — two superconductors separated by a thin barrier, the heart of SQUID magnetometers and of the voltage standard — obeys, in the resistively and capacitively shunted model, $$\frac{\hbar C}{2e}\ddot\phi + \frac{\hbar}{2eR}\dot\phi + I_c\sin\phi = I_{ac}\cos\omega t,$$ where $\phi$ is the phase difference across it. Divided through, this is the driven damped pendulum with $\gamma = I_{ac}/I_c$ and natural ("plasma") frequency $\omega_0 = \sqrt{2eI_c/\hbar C}$. For $I_c = ${Ic}\ \mu\text{A}$ and $C = ${Cp}$ pF, what is $\omega_0/2\pi$, in GHz?`,
          answer: f, units: 'GHz', tol: { rel: 0.01 },
          errors: distinct([{ value: wp / 1e9, feedback: t`That is $\omega_0$ in units of $10^9$ rad/s. Divide by $2\pi$ for the frequency in GHz.` }, { value: Math.sqrt((QE * Ic * 1e-6) / (HBAR * Cp * 1e-12)) / (2 * PI) / 1e9, feedback: t`Keep the factor 2 in $2e$: the superconducting carriers are Cooper pairs, of charge $2e$.` }], f),
          hints: [t`Divide the equation by $\hbar C/2e$: the $\sin\phi$ term becomes $(2eI_c/\hbar C)\sin\phi$, so $\omega_0^2 = 2eI_c/\hbar C$.`, t`$\omega_0 = \sqrt{2(1.602\times10^{-19})(${Ic}\times10^{-6})/\bigl((1.055\times10^{-34})(${Cp}\times10^{-12})\bigr)}$; then divide by $2\pi$.`],
          teach: t`Any system whose equation has the form $\ddot\phi + 2\beta\dot\phi + \omega_0^2\sin\phi = \gamma\omega_0^2\cos\omega t$ is a driven pendulum, with all of its chaos.`,
          explain: t`$\omega_0 = \sqrt{2eI_c/\hbar C} = ${sci(wp, 3)}$ rad/s, so $\omega_0/2\pi = ${sci(f, 3)}$ GHz: a "pendulum" swinging tens of billions of times a second. Microwave-driven junctions show period doubling and chaos, which is why voltage-standard chips are designed to stay well inside the periodic regime.`,
          visual: gpic({ x: [-3.2, 3.2], y: [-1.6, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([-3, 0], [-0.25, 0], 'ink2', 2.4), seg([0.25, 0], [3, 0], 'ink2', 2.4), seg([-0.25, -1.2], [-0.25, 1.2], 'accent', 6), seg([0.25, -1.2], [0.25, 1.2], 'accent', 6)], shade: [{ fn: '1.2', lower: '-1.2', from: -0.18, to: 0.18, color: 'ink4', alpha: 0.6 }], points: [lab(-1.6, 1.5, 'superconductor', 'accent', 0, 0), lab(1.6, 1.5, 'superconductor', 'accent', 0, 0), lab(0, -1.5, 'thin barrier', 'ink3', 0, 0), lab(-2.1, 0.35, 'I', 'warn', 0, 0)], arrows: [{ from: [-2.6, 0], to: [-1.6, 0], color: 'warn', width: 2.2 }] }, t`A Josephson junction, schematic and not to scale: the barrier is a few nanometres thick. The phase difference $\phi$ across it plays the pendulum's angle.`, 'Two superconducting electrodes separated by a thin barrier, with a current flowing through'),
        };
      },
    }),
    mcq({
      id: 'cp-section', difficulty: 2,
      gen(r) {
        const R = r.pick([REGIME[1], REGIME[2]]);
        const n = R.n, rep = n;
        const choices = [t`Every ${rep} drive periods: the section has ${n} dots`, t`Every drive period: the pendulum is driven once per period`, t`Every ${2 * rep} drive periods: the orbit passes each dot twice`, t`Never: the motion is chaotic`];
        return {
          prompt: t`Here is the Poincaré section of a driven pendulum after its transient. How often does the motion repeat?`,
          visual: pendPic({ gamma: R.gamma, panels: ['phase'], skip: 30, periods: 8, keep: 100, orbit: true }, t`The orbit over eight drive periods and 100 Poincaré dots (gold), Taylor's pendulum.`),
          choices, answer: 0,
          why: { 1: t`The drive repeats every period, but the response need not: count the gold dots.`, 2: t`The orbit may loop near a dot, but the section records one snapshot per drive period: ${n} dots means ${n} periods to come round.`, 3: t`A chaotic section has dozens of scattered dots. This one has only ${n}.` },
          hints: [t`Count the separate gold dots.`],
          teach: t`The number of points in a Poincaré section is the period of the motion in drive periods.`,
          explain: t`${n} dots: the state comes back to each one every ${n} drive periods (here $\gamma = ${R.gamma}$).`,
        };
      },
    }),
    num({
      id: 'cp-torque', difficulty: 2,
      gen(r) {
        const m = r.pick([0.2, 0.5, 1.2]), L = r.pick([0.25, 0.4, 0.8]), g = r.pick([1.073, 1.081, 1.105]);
        const tau = g * m * 9.8 * L;
        return {
          prompt: t`A laboratory pendulum (a ${m} kg bob on a light rod ${L} m long, $g = 9.8\ \text{m/s}^2$) is driven by a motor that applies a torque $\Gamma_0\cos\omega t$ at the pivot. What torque amplitude $\Gamma_0$ makes the drive strength $\gamma = ${g}$?`,
          answer: tau, units: 'N m', tol: { rel: 0.01 },
          errors: distinct([{ value: g * m * 9.8, feedback: t`$\gamma$ compares torques: divide by $mg\ell$, not $mg$.` }, { value: g * m * L, feedback: t`Gravity's largest torque is $mg\ell$ — you left out $g$.` }, { value: g * m * 9.8 * L * L, feedback: t`Gravity's largest torque is $mg\ell$, not $mg\ell^2$ (that is part of the moment of inertia).` }], tau),
          hints: [t`$\gamma = \Gamma_0/(mg\ell)$: the drive torque as a fraction of gravity's largest torque.`],
          teach: t`The drive strength $\gamma$ is the drive torque divided by $mg\ell$; above 1 the drive can hold the pendulum out sideways.`,
          explain: t`$\Gamma_0 = \gamma mg\ell = ${g}\times${m}\times9.8\times${L} = ${sci(tau, 3)}$ N m. With $\gamma > 1$ the drive at its peak overpowers gravity's largest pull — one reason the motion can go over the top.`,
          visual: gpic({ x: [-1.6, 1.6], y: [-1.25, 0.45], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([-0.4, 0], [0.4, 0], 'ink2', 3), seg([0, 0], [0.6, -0.8], 'ink2', 2), seg([0, 0], [0, -1], 'ink4', 1, true), { param: ['0.25*cos(t)', '0.25*sin(t)'], t: [0.3, 2.6], color: 'gold', width: 2 }], points: [{ x: 0.6, y: -0.8, color: 'warn', r: 8 }, lab(0.48, 0.3, 'Γ₀ cos ωt', 'gold', 0, 0), lab(0.15, -0.55, 'φ', 'ink2', 0, 0), lab(0.42, -0.35, 'ℓ', 'ink2', 0, 0)], arrows: [{ from: [-0.21, 0.14], to: [-0.24, 0.07], color: 'gold' }] }, t`A rigid pendulum driven by a torque at its pivot, schematic.`, 'A pendulum on a pivot with a curved arrow showing an oscillating torque'),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 12: nonlinear mechanics and chaos', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'S. H. Strogatz, Nonlinear Dynamics and Chaos, 2nd ed. (CRC Press, 2015), §7.3 (Poincaré–Bendixson) and §8.5 (the driven pendulum and Josephson junctions)', url: 'https://doi.org/10.1201/9780429492563' },
    { label: 'B. A. Huberman, J. P. Crutchfield and N. H. Packard, Noise phenomena in Josephson junctions, Appl. Phys. Lett. 37, 750 (1980)', url: 'https://doi.org/10.1063/1.92020' },
  ],
});

function r6x(v) { return +(+v).toPrecision(6); }
