// The harmonic oscillator, solved with a complex exponential: x = Re[Ã e^{−iωt}],
// the complex amplitude Ã = Ae^{iφ} fixed by the initial data (Ã = x₀ + i v₀/ω),
// derivatives as multiplication by −iω, and why linearity licenses all of it.
// Sets the course's convention e^{−iωt}, ready for waves e^{i(qx − ωt)}.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tn, pn, phasorPic, curvesPic } from './_wv.js';

const t = String.raw;
const DEG = 180 / Math.PI;

// the worked example: the drive tine of a quartz tuning-fork gyroscope
const EX = (() => {
  const f = 8.0e3, w = 2 * Math.PI * f, x0 = 2.0e-6, v0 = 0.075, t1 = 25e-6;
  const b = v0 / w, A = Math.hypot(x0, b), phi = Math.atan2(b, x0);
  const x1 = A * Math.cos(w * t1 - phi);
  return { f, w, x0, v0, t1, b, A, phi, x1, vmax: w * A };
})();
const um = (x, n = 3) => tn(x * 1e6, n);

// the Explore picture: a complex amplitude turning clockwise, and its shadow on the real axis
const W = 2;    // rad/s in the Explore
const RE = `a*cos(${W}*s) + (b/${W})*sin(${W}*s)`, IM = `-a*sin(${W}*s) + (b/${W})*cos(${W}*s)`;

export default lesson({
  id: 'phys3750.W1.1',
  title: 'The harmonic oscillator, complex exponentials',
  minutes: 14, difficulty: 2,
  intro: t`A mass on a spring obeys $m\ddot x = -kx$. The equation is **linear with real coefficients**, so you may solve it with a complex exponential — which turns every time derivative into multiplication by $-i\omega$ — and keep the real part:

$$x(t) = \operatorname{Re}\big[\tilde A\,e^{-i\omega t}\big] = A\cos(\omega t - \phi), \qquad \tilde A = A\,e^{i\phi}, \quad \omega = \sqrt{k/m}$$

One complex number $\tilde A$ carries both the amplitude and the phase. This is the move the whole course runs on: two masses, a chain of $N$, a string and light are all solved by guessing an exponential. [The mechanics course](#/lesson/phys3550.M2.1) writes $e^{+i\omega t}$; this course writes $e^{-i\omega t}$ so that waves will read $e^{i(qx - \omega t)}$. The physics is identical; the two complex amplitudes are complex conjugates.`,
  symbols: [
    { tex: 'x(t)', text: 'the displacement from equilibrium, in m — always a real number' },
    { tex: '\\tilde A', text: 'the **complex amplitude**, in m: its length is the amplitude and its angle is the phase' },
    { tex: 'A = |\\tilde A|', text: 'the amplitude, the largest displacement, in m' },
    { tex: '\\phi = \\arg\\tilde A', text: 'the phase, in rad: the motion peaks when $\\omega t = \\phi$' },
    { tex: '\\omega', text: 'the angular frequency, in rad/s; the period is $2\\pi/\\omega$' },
    { tex: 'k,\\ m', text: 'the spring constant (N/m) and the mass (kg)' },
    { tex: 'e^{-i\\omega t}', text: 'Euler: $\\cos\\omega t - i\\sin\\omega t$, a unit arrow in the complex plane turning **clockwise** at $\\omega$' },
    { tex: 'i', text: 'the imaginary unit, $i^2 = -1$' },
  ],
  why: t`Every linear problem in this course — coupled masses, the chain, the string, Maxwell’s fields — is solved by trying $e^{-i\omega t}$ and letting algebra replace calculus: $\frac{d}{dt} \to -i\omega$.`,
  visual: {
    type: 'graph',
    title: 'The complex amplitude turning, and its shadow',
    lead: t`The blue arrow is $\tilde A e^{-i\omega t}$ with $\omega = ${W}$ rad/s. Its **shadow on the real axis** (gold) is the displacement $x(t)$. The green arrow is $-i\tilde Ae^{-i\omega t}$, the velocity divided by $\omega$: its shadow is $v(t)/\omega$. Set the initial position and velocity, then move time.`,
    tasks: [
      t`Set $v(0) = 0$: $\tilde A$ is real, $\phi = 0$, and the motion starts at its peak.`,
      'Slide time: the arrow turns clockwise; the gold dot runs back and forth along the real axis — that is the oscillation.',
      'The green arrow is always a quarter turn ahead of the blue one: the velocity peaks a quarter period before the displacement does.',
    ],
    params: {
      x: [-3.2, 3.2], y: [-2.6, 2.6], equal: true, aspect: 'wide', xlabel: 'Re (cm)', ylabel: 'Im (cm)', xticks: 7, yticks: 5,
      sliders: [
        { key: 'a', label: 'Initial position $x(0)$', min: -2, max: 2, step: 0.1, value: 1.5, unit: '\\mathrm{cm}', explain: t`The real part of $\tilde A$.` },
        { key: 'b', label: 'Initial velocity $v(0)$', min: -4, max: 4, step: 0.1, value: 2, unit: '\\mathrm{cm/s}', explain: t`Divided by $\omega$, the imaginary part of $\tilde A$: $\tilde A = x(0) + i\,v(0)/\omega$.` },
        { key: 's', label: 'Time $t$', min: 0, max: 3.2, step: 0.01, value: 0, unit: '\\mathrm{s}', explain: t`One period is $2\pi/\omega = \pi$ s here.` },
      ],
      curves: [
        { param: ['sqrt(a^2 + (b/2)^2)*cos(t)', 'sqrt(a^2 + (b/2)^2)*sin(t)'], t: [0, 2 * Math.PI], color: 'ink4', width: 1, dash: [3, 4] },
        { param: [RE, `(${IM})*t`], t: [0, 1], color: 'gold', width: 1, dash: [4, 4] },
      ],
      arrows: [
        { from: [0, 0], to: [RE, IM], color: 'accent', width: 2.6, label: 'Ã e^(−iωt)', labelDx: 6, labelDy: -6 },
        { from: [0, 0], to: [IM, `-(${RE})`], color: 'good', width: 2, label: 'v/ω phasor', labelDx: 6, labelDy: 10 },
      ],
      points: [{ x: RE, y: 0, color: 'gold', r: 6, label: 'x(t)', labelDx: 6, labelDy: 14 }],
      readouts: [
        { label: '$x(t)$', expr: RE, unit: 'cm', digits: 3 },
        { label: '$v(t)$', expr: `${W}*(${IM})`, unit: 'cm/s', digits: 3 },
        { label: '$A = |\\tilde A|$', expr: 'sqrt(a^2 + (b/2)^2)', unit: 'cm', digits: 3 },
        { label: '$\\phi$', expr: 'atan2(b/2, a)*180/pi', unit: '°', digits: 3 },
      ],
    },
    caption: t`An ideal, undamped oscillator with $\omega = ${W}$ rad/s. The arrows are drawn to scale in cm; the green one is the velocity divided by $\omega$, so it fits the same axes.`,
  },
  example: {
    prompt: t`A quartz **tuning-fork gyroscope** keeps one pair of tines vibrating at its drive frequency, $f = ${EX.f / 1000}$ kHz; a rotation shows up as a sideways wobble the electronics measure. Treat one tine tip as a harmonic oscillator. At $t = 0$ it is $${um(EX.x0, 2)}\ \mu\text{m}$ from rest position, moving outward at $${EX.v0}$ m/s. Find its complex amplitude, amplitude and phase, and its displacement $${tn(EX.t1 * 1e6, 2)}\ \mu\text{s}$ later.`,
    steps: [
      { label: 'Angular frequency', text: t`$\omega = 2\pi f = 2\pi(${tn(EX.f, 2)}\ \text{Hz}) = ${tn(EX.w, 4)}$ rad/s.` },
      { label: 'Read the initial data', text: t`At $t = 0$, $x(0) = \operatorname{Re}\tilde A$. Differentiating multiplies by $-i\omega$, so $v(0) = \operatorname{Re}(-i\omega\tilde A) = \omega\operatorname{Im}\tilde A$. Hence $\tilde A = x(0) + i\,v(0)/\omega$ — position in the real part, velocity over $\omega$ in the imaginary part.` },
      { label: 'Complex amplitude', text: t`$v(0)/\omega = ${EX.v0}/${tn(EX.w, 4)} = ${um(EX.b)}\ \mu\text{m}$, so $\tilde A = (${um(EX.x0, 2)} + ${um(EX.b)}\,i)\ \mu\text{m}$.` },
      { label: 'Polar form', text: t`$A = |\tilde A| = \sqrt{${um(EX.x0, 2)}^2 + ${um(EX.b)}^2} = ${um(EX.A)}\ \mu\text{m}$ and $\phi = \arctan\dfrac{${um(EX.b)}}{${um(EX.x0, 2)}} = ${tn(EX.phi * DEG)}^\circ$ (the arrow is in the first quadrant, so the plain arctangent is right).` },
      { label: 'Evaluate later', text: t`$\omega t = ${tn(EX.w, 4)} \times ${tn(EX.t1, 2)} = ${tn(EX.w * EX.t1)}$ rad $= ${tn(EX.w * EX.t1 * DEG)}^\circ$, so $x = A\cos(\omega t - \phi) = ${um(EX.A)}\cos(${tn(EX.w * EX.t1 * DEG - EX.phi * DEG)}^\circ) = ${um(EX.x1)}\ \mu\text{m}$.` },
      { label: 'Sense check', text: t`$|x| \le A$, as it must be. The peak speed $\omega A = ${tn(EX.vmax)}$ m/s exceeds the starting speed $${EX.v0}$ m/s, because the tine was not at its centre at $t = 0$.` },
    ],
    answer: t`$\tilde A = (${um(EX.x0, 2)} + ${um(EX.b)}\,i)\ \mu\text{m}$, $A = ${um(EX.A)}\ \mu\text{m}$, $\phi = ${tn(EX.phi * DEG)}^\circ$, and $x(${tn(EX.t1 * 1e6, 2)}\ \mu\text{s}) = ${um(EX.x1)}\ \mu\text{m}$.`,
    visual: phasorPic(EX.x0 * 1e6, EX.b * 1e6, t`The complex amplitude of the tine at $t = 0$, in μm: position along the real axis, velocity over $\omega$ along the imaginary axis.`, { parts: ['x(0)', 'v(0)/ω'] }),
  },
  practice: [
    mcq({
      id: 'why-real-part', difficulty: 1,
      prompt: t`Substituting $\tilde x = \tilde A e^{-i\omega t}$ into $m\ddot{\tilde x} = -k\tilde x$ shows it is a solution when $\omega = \sqrt{k/m}$. Why is its **real part** a solution too?`,
      visual: curvesPic([
        { fn: 'cos(2x)', color: 'accent', label: 'Re: cos ωt', labelAt: 0.35 },
        { fn: '-sin(2x)', color: 'violet', dash: [6, 4], label: 'Im: −sin ωt', labelAt: 2.15, labelDy: 14 },
      ], [0, 6.3], [-1.4, 1.4], t`The real and imaginary parts of $e^{-i\omega t}$ for $\omega = 2$ rad/s ($t$ in s across). Each one alone is an oscillation.`, { xlabel: 't (s)', ylabel: '' }),
      choices: [
        t`The equation is linear with real coefficients, so its real and imaginary parts separate and each part solves it on its own`,
        t`Because $\tilde x$ is real at $t = 0$`,
        t`Because the imaginary part of any solution is zero`,
        t`Because $|e^{-i\omega t}| = 1$, so the complex part never grows`,
      ],
      answer: 0,
      why: {
        1: t`$\tilde x(0) = \tilde A$ is complex in general. And being real at one instant would prove nothing about other times.`,
        2: t`The imaginary part, $-|\tilde A|\sin(\omega t - \phi)$ here, is not zero — it is a second, perfectly good solution.`,
        3: t`The size of the exponential is beside the point: the trick works for damped solutions too, which do shrink. What matters is linearity with real coefficients.`,
      },
      hints: [t`Write $\tilde x = x_R + i\,x_I$ and put it into $m\ddot{\tilde x} + k\tilde x = 0$.`, t`A complex number is zero only if its real and imaginary parts are both zero.`],
      teach: t`For a linear equation with real coefficients, $\operatorname{Re}$ commutes with everything in it, so the real part of a complex solution is a real solution.`,
      explain: t`$m\ddot{\tilde x} + k\tilde x = (m\ddot x_R + kx_R) + i(m\ddot x_I + kx_I) = 0$. Since $m$ and $k$ are real, both brackets vanish separately. A term like $\tilde x^2$ or a complex coefficient would mix the parts and spoil this.`,
    }),
    num({
      id: 'amp-from-ic', difficulty: 2,
      gen(r) {
        const m = r.pick([1.2, 1.5, 2.0]), k = r.pick([2.4, 3.0, 4.8]) * 1000, w = Math.sqrt(k / m);
        const x0 = r.pick([-1, 1]) * r.float(0.5, 2.0, 0.1), v0 = r.pick([-1, 1]) * r.int(20, 110);
        const b = v0 / w, A = Math.hypot(x0, b);
        return {
          prompt: t`A ${m} kg star tracker sits on an isolation mount of stiffness $${tn(k / 1000, 2)}$ kN/m. A thruster firing leaves it at $x(0) = ${x0}$ mm with $v(0) = ${v0}$ mm/s. What is the amplitude of the oscillation that follows, in mm? (Ignore damping.)`,
          visual: phasorPic(x0, b, t`The complex amplitude $\tilde A = x(0) + i\,v(0)/\omega$ in mm, drawn to scale. Its length is what you want.`, { parts: ['x(0)', 'v(0)/ω'] }),
          answer: A, units: 'mm', tol: { rel: 0.01 },
          errors: [
            { value: Math.abs(x0) + Math.abs(b), feedback: t`You added the two parts. They are at right angles in the complex plane: use $|\tilde A| = \sqrt{x_0^2 + (v_0/\omega)^2}$.` },
            { value: Math.hypot(x0, v0 * w), feedback: t`You multiplied $v(0)$ by $\omega$. The imaginary part of $\tilde A$ is $v(0)/\omega$ — a velocity divided by a rate is a length.` },
          ],
          hints: [t`First $\omega = \sqrt{k/m}$, in rad/s.`, t`$\tilde A = x(0) + i\,v(0)/\omega$, and the amplitude is its modulus.`],
          teach: t`The amplitude is the length of $\tilde A = x(0) + i\,v(0)/\omega$.`,
          explain: t`$\omega = \sqrt{${k}/${m}} = ${tn(w)}$ rad/s, $v(0)/\omega = ${tn(b)}$ mm, so $A = \sqrt{${x0}^2 + ${tn(b)}^2} = ${tn(A)}$ mm.`,
        };
      },
    }),
    num({
      id: 'phase', difficulty: 2,
      gen(r) {
        const a = r.pick([-1, 1]) * r.int(1, 4), b = r.pick([-1, 1]) * r.int(1, 4);
        const phi = Math.atan2(b, a) * DEG, naive = Math.atan(b / a) * DEG;
        return {
          prompt: t`An oscillator has complex amplitude $\tilde A = (${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)}i)$ cm, so $x = A\cos(\omega t - \phi)$. Find the phase $\phi$ in degrees, between $-180^\circ$ and $180^\circ$.`,
          visual: phasorPic(a, b, t`$\tilde A$ in the complex plane (cm). The phase is the angle from the positive real axis, counterclockwise positive.`, { parts: ['Re Ã', 'Im Ã'], R: 5.5 }),
          answer: phi, units: 'deg', tol: { rel: 0, abs: 1 },
          errors: a < 0 ? [{ value: naive, feedback: t`The calculator’s $\arctan(b/a)$ only returns angles between $-90^\circ$ and $90^\circ$. This arrow points left ($\operatorname{Re}\tilde A < 0$), so add or subtract $180^\circ$.` }] : [],
          hints: ['Find which quadrant the arrow points into first.', t`$\phi = \arctan(\operatorname{Im}/\operatorname{Re})$, corrected by $\pm 180^\circ$ when the real part is negative.`],
          teach: t`The phase is the angle of $\tilde A$; check the quadrant before trusting an arctangent.`,
          explain: t`$\tilde A$ points into the ${a > 0 ? (b > 0 ? 'first' : 'fourth') : (b > 0 ? 'second' : 'third')} quadrant, so $\phi = ${tn(phi)}^\circ$.`,
        };
      },
    }),
    expr({
      id: 'write-x', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-4, 4, [0]), b = r.intExcept(-4, 4, [0]), w = r.int(2, 6);
        const bs = b < 0 ? `- ${-b}` : `+ ${b}`;
        return {
          prompt: t`An oscillator has $\omega = ${w}$ rad/s and complex amplitude $\tilde A = (${a} ${bs}i)$ cm. Write $x(t) = \operatorname{Re}\big[\tilde Ae^{-i\omega t}\big]$ in cm as a combination of $\cos$ and $\sin$.`,
          visual: phasorPic(a, b, t`$\tilde A$ at $t = 0$, in cm. As time runs, the arrow turns clockwise at $${w}$ rad/s.`, { R: 5.5 }),
          answer: `${a} cos(${w} t) + (${b}) sin(${w} t)`,
          answerTeX: t`${a}\cos ${w}t ${b < 0 ? '-' : '+'} ${Math.abs(b)}\sin ${w}t`,
          lhs: 'x(t)', vars: { t: [0, 3] },
          errors: [{ answer: `${a} cos(${w} t) - (${b}) sin(${w} t)`, feedback: t`That is $\operatorname{Re}[\tilde Ae^{+i\omega t}]$. With $e^{-i\omega t} = \cos\omega t - i\sin\omega t$, the product $(a + ib)(\cos\omega t - i\sin\omega t)$ has real part $a\cos\omega t + b\sin\omega t$.` }],
          hints: [t`Write $e^{-i\omega t} = \cos\omega t - i\sin\omega t$.`, t`Multiply out $(a + ib)(\cos\omega t - i\sin\omega t)$ and keep the terms with no $i$: note $ib \cdot (-i\sin\omega t) = +b\sin\omega t$.`],
          teach: t`$\operatorname{Re}\big[(a + ib)e^{-i\omega t}\big] = a\cos\omega t + b\sin\omega t$: the real part of $\tilde A$ multiplies cosine, the imaginary part multiplies sine.`,
          explain: t`$x(t) = ${a}\cos ${w}t ${b < 0 ? '-' : '+'} ${Math.abs(b)}\sin ${w}t$ cm. Check: $x(0) = ${a}$ cm $= \operatorname{Re}\tilde A$ and $\dot x(0) = ${b * w}$ cm/s $= \omega\operatorname{Im}\tilde A$.`,
        };
      },
    }),
    mcq({
      id: 'acc-phase', difficulty: 2,
      prompt: t`In complex form $\dot{\tilde x} = -i\omega\tilde x$, so the velocity arrow is $\tilde x$ turned a quarter turn ahead (green, below). Where does the **acceleration** arrow $\ddot{\tilde x}$ point relative to $\tilde x$?`,
      visual: phasorPic(1.2, 0.7, t`The displacement arrow $\tilde x$ (blue) and the velocity arrow divided by $\omega$ (green) at one instant; both turn clockwise together.`, { extra: [{ from: [0, 0], to: [0.7, -1.2], color: 'good', width: 2, label: 'ẋ/ω', labelDx: 6, labelDy: 10 }], name: 'x̃', R: 1.9 }),
      choices: ['Opposite to it: half a turn away', 'A quarter turn ahead of it, like the velocity', 'Along it, in phase', 'A quarter turn behind it'],
      answer: 0,
      why: {
        1: t`That is the velocity. Differentiating twice multiplies by $(-i\omega)^2$, which turns the arrow two quarter turns.`,
        2: t`$(-i\omega)^2 = -\omega^2$ is negative: the acceleration points against the displacement, as a restoring force must.`,
        3: t`Each derivative turns the arrow a quarter turn *ahead*; two derivatives cannot land a quarter turn behind.`,
      },
      hints: [t`Differentiate twice: $\ddot{\tilde x} = (-i\omega)^2\tilde x$.`, t`$(-i)^2 = -1$.`],
      teach: t`Each time derivative multiplies by $-i\omega$; two give $-\omega^2$, which is the equation of motion $\ddot x = -\omega^2x$ itself.`,
      explain: t`$\ddot{\tilde x} = -\omega^2\tilde x$: the acceleration arrow is $\omega^2$ times longer and points opposite — the spring always pulls back toward equilibrium.`,
    }),
    {
      type: 'slider', id: 'set-phase', difficulty: 2,
      prompt: t`The curve is $x = \cos(\omega t - \phi)$ against $\omega t$. Set the phase $\phi$ so the motion **starts at $x = 0$ moving toward $+x$**.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 12.6], y: [-1.5, 1.5], aspect: 'wide', xlabel: 'ωt (rad)', ylabel: 'x/A',
          sliders: [{ key: 'ph', label: 'Phase $\\phi$', min: -180, max: 180, step: 5, value: -45, unit: '^\\circ', explain: t`The angle of the complex amplitude $\tilde A = Ae^{i\phi}$.` }],
          curves: [{ fn: 'cos(x - ph*pi/180)', color: 'accent' }],
          points: [{ x: 0, y: 'cos(ph*pi/180)', color: 'gold', r: 6, label: 't = 0', labelDx: 8, labelDy: -10 }],
        },
        caption: t`One oscillation of unit amplitude; the gold dot is the starting point.`,
      },
      param: 'ph', answer: [85, 95],
      instruction: 'Set the phase, then check.',
      hints: [t`$x(0) = A\cos\phi$ must be zero, so $\phi = \pm 90^\circ$.`, t`$\dot x(0) = A\omega\sin\phi$ must be positive.`],
      teach: t`A start at the centre moving forward means $\tilde A = i\,v(0)/\omega$: a purely imaginary amplitude with positive imaginary part, $\phi = +90^\circ$.`,
      explain: t`$\phi = 90^\circ$: $x = \cos(\omega t - 90^\circ) = \sin\omega t$, which starts at zero and rises. $\phi = -90^\circ$ gives $-\sin\omega t$, which starts at zero and falls.`,
    },
    mcq({
      id: 'nonlinear-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “The pendulum obeys $\ddot\theta = -(g/L)\sin\theta$. I found two solutions $\theta_1(t)$ and $\theta_2(t)$ by computer, so $\theta_1 + \theta_2$ is also a solution, and I can find more as $\operatorname{Re}[\Theta e^{-i\omega t}]$.” What is wrong?`,
      visual: curvesPic([
        { fn: 'sin(x)', color: 'accent', label: 'sin θ', labelAt: 2.3, labelDy: -6 },
        { fn: 'x', color: 'ink3', dash: [6, 4], label: 'θ', labelAt: 2.0, labelDx: 10 },
      ], [-3.3, 3.3], [-2.4, 2.4], t`$\sin\theta$ (solid) against $\theta$ (dashed), $\theta$ in rad. They agree only near $\theta = 0$.`, { xlabel: 'θ (rad)', ylabel: '' }),
      choices: [
        t`The equation is not linear: $\sin(\theta_1 + \theta_2) \ne \sin\theta_1 + \sin\theta_2$, so sums of solutions are not solutions and the complex-exponential trick does not apply — only the small-angle version $\ddot\theta = -(g/L)\theta$ is linear`,
        t`Sums of solutions are fine; only the complex exponential fails, because $\sin$ of a complex number is undefined`,
        t`The sum is a solution, but only if $\theta_1$ and $\theta_2$ have the same amplitude`,
        t`Nothing, as long as both solutions have the same period`,
      ],
      answer: 0,
      why: {
        1: t`Sums fail too, for the same reason, and $\sin z$ is perfectly well defined for complex $z$ — it just is not linear.`,
        2: t`No amplitude condition rescues it: $\sin$ of a sum is not the sum of sines for any nonzero angles.`,
        3: t`Superposition is a property of the equation, not of the solutions: with $\sin\theta$ in it, it fails whatever the periods (which, for a real pendulum, depend on amplitude anyway).`,
      },
      hints: [t`Substitute $\theta_1 + \theta_2$ into the equation and use the fact that each $\theta_i$ solves it.`, t`You would need $\sin(\theta_1 + \theta_2) = \sin\theta_1 + \sin\theta_2$. Is that true?`],
      teach: t`Superposition — and the real-part trick — need a linear equation; linearize first (small angles), then superpose.`,
      explain: t`$\ddot\theta_1 + \ddot\theta_2 = -(g/L)(\sin\theta_1 + \sin\theta_2)$, but the equation demands $-(g/L)\sin(\theta_1 + \theta_2)$. For small angles $\sin\theta \approx \theta$ and the equation becomes linear; then both moves are legitimate.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-boom', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([0.6, 0.8, 1.2, 1.5]), w = 2 * Math.PI * f;
        const x0 = r.float(1.0, 4.0, 0.5), v0 = r.pick([-1, 1]) * r.int(5, 25);
        const vmax = Math.hypot(v0, w * x0);
        return {
          prompt: t`A CubeSat releases a deployable magnetometer boom, whose tip then swings at its first bending frequency, ${f} Hz. Telemetry at $t = 0$ gives the tip ${x0} cm from its rest line, moving at ${v0} cm/s. Treating the tip as an undamped harmonic oscillator, what is its **greatest speed** in the swinging that follows, in cm/s?`,
          visual: phasorPic(x0, v0 / w, t`The tip’s complex amplitude $\tilde A$ at $t = 0$, in cm (not labelled with its length).`, { parts: ['x(0)', 'v(0)/ω'] }),
          answer: vmax, units: 'cm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.abs(v0), feedback: 'That is the speed at t = 0. The tip is not at its centre then, so it speeds up later.' }, { value: Math.hypot(x0, v0 / w), feedback: t`That is the amplitude $A$, a length. The greatest speed is $\omega A$.` }],
          hints: [t`$\omega = 2\pi f$; then $\tilde A = x(0) + i\,v(0)/\omega$.`, t`The velocity arrow is $-i\omega\tilde Ae^{-i\omega t}$: its length, $\omega|\tilde A|$, is the greatest speed.`],
          teach: t`Peak speed is $\omega|\tilde A| = \sqrt{v(0)^2 + \omega^2x(0)^2}$.`,
          explain: t`$\omega = 2\pi(${f}) = ${tn(w)}$ rad/s, so $v_{\max} = \sqrt{${v0}^2 + (${tn(w)} \times ${x0})^2} = ${tn(vmax)}$ cm/s.`,
        };
      },
    }),
    mcq({
      id: 'cp-convention', difficulty: 2,
      prompt: t`A mechanics text writes the same motion as $x = \operatorname{Re}\big[B\,e^{+i\omega t}\big]$, while this course writes $x = \operatorname{Re}\big[\tilde A\,e^{-i\omega t}\big]$. How is $B$ related to $\tilde A$?`,
      visual: phasorPic(1.1, 0.8, t`This course’s complex amplitude $\tilde A$ at $t = 0$. It turns clockwise as time runs.`, { R: 1.8 }),
      choices: [t`$B = \tilde A^*$, the complex conjugate`, t`$B = \tilde A$`, t`$B = -\tilde A$`, t`$B = i\tilde A$`],
      answer: 0,
      why: {
        1: t`Then $\operatorname{Re}[\tilde Ae^{i\omega t}] = a\cos\omega t - b\sin\omega t$, which is not $a\cos\omega t + b\sin\omega t$ unless $b = 0$.`,
        2: t`That flips the sign of the whole motion.`,
        3: t`That shifts the phase by a quarter turn: a different motion.`,
      },
      hints: [t`The real part of a number equals the real part of its conjugate.`, t`$\big(\tilde Ae^{-i\omega t}\big)^* = \tilde A^*e^{+i\omega t}$.`],
      teach: t`Switching between $e^{-i\omega t}$ and $e^{+i\omega t}$ conjugates every complex amplitude; the physics is unchanged.`,
      explain: t`$x = \operatorname{Re}[z] = \operatorname{Re}[z^*]$, and $(\tilde Ae^{-i\omega t})^* = \tilde A^*e^{+i\omega t}$, so $B = \tilde A^*$. In that convention the phase is $-\phi$: [the mechanics course](#/lesson/phys3550.M2.1) writes $C = Ae^{-i\delta}$.`,
    }),
    num({
      id: 'cp-zero', difficulty: 3,
      gen(r) {
        const a = r.pick([-1, 1]) * r.int(1, 4), b = r.pick([-1, 1]) * r.int(1, 4), w = r.pick([2, 4, 5, 10]);
        const phi = Math.atan2(b, a);
        // x = A cos(ωt − φ) = 0 when ωt − φ = π/2 + nπ; the first positive t
        let tz = (phi + Math.PI / 2) / w;
        while (tz <= 1e-9) tz += Math.PI / w;
        while (tz - Math.PI / w > 1e-9) tz -= Math.PI / w;
        return {
          prompt: t`An oscillator has $\omega = ${w}$ rad/s and $\tilde A = (${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)}i)$ cm. At what first time $t > 0$ is $x = 0$, in s?`,
          visual: phasorPic(a, b, t`$\tilde A$ at $t = 0$ (cm). The arrow turns clockwise at $${w}$ rad/s; $x = 0$ whenever it points straight up or straight down.`, { R: 5.5 }),
          answer: tz, units: 's', tol: { rel: 0.01 },
          hints: [t`$x = A\cos(\omega t - \phi)$ vanishes when $\omega t - \phi = \pm\pi/2, \pm 3\pi/2, \ldots$`, t`Find $\phi$ (watch the quadrant), then the smallest positive $t = (\phi + \pi/2 + n\pi)/\omega$.`, 'Or picture it: how far must the arrow turn clockwise to stand vertical?'],
          teach: t`$x = 0$ when the turning arrow is vertical: its shadow on the real axis vanishes.`,
          explain: t`$\phi = ${tn(phi)}$ rad. The first zero is at $\omega t = ${tn(tz * w)}$ rad, so $t = ${tn(tz)}$ s.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 1 (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Georgi, The Physics of Waves, ch. 1 (free from the author)', url: 'https://www.people.fas.harvard.edu/~hgeorgi/new.htm' },
  ],
});
