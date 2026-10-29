// Simple harmonic motion: a restoring force proportional to displacement
// gives x = A cos(ωt + φ), with a period that does not depend on the amplitude.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { s3, tn, springPic, xtGraph } from './_osc.js';

const t = String.raw;
const TAU = 2 * Math.PI;

export default lesson({
  id: 'phys2210.M15.1',
  title: 'Simple harmonic motion',
  minutes: 11, difficulty: 2,
  intro: t`Pull a block on a spring aside and let go. The spring pulls back with $F = -kx$, so the acceleration is $a = -\tfrac{k}{m}x$: proportional to the displacement and always pointing back toward equilibrium. Any motion with $a = -\omega^2 x$ is **simple harmonic motion** (SHM), and its solution is

$$x(t) = A\cos(\omega t + \phi), \qquad \omega = \sqrt{\frac{k}{m}}, \qquad T = \frac{2\pi}{\omega}$$

A stiffer spring or a lighter block oscillates faster — but **the period does not depend on the amplitude**: pull it twice as far and it travels twice as far in the same time.`,
  symbols: [
    { tex: 'x(t)', text: 'the displacement from equilibrium at time $t$, in m' },
    { tex: 'A', text: 'the amplitude: the largest displacement, in m' },
    { tex: '\\omega', text: 'the angular frequency, in rad/s: how fast the phase $\\omega t + \\phi$ advances (not a physical rotation)' },
    { tex: '\\phi', text: 'the phase constant, in rad: sets where in its cycle the motion is at $t = 0$' },
    { tex: 'k', text: 'the spring constant (stiffness), in N/m' },
    { tex: 'm', text: 'the oscillating mass, in kg' },
    { tex: 'T', text: 'the period: the time for one full cycle, in s. The frequency is $f = 1/T = \\omega/2\\pi$, in Hz' },
  ],
  why: 'Nearly anything nudged from a stable equilibrium — a spring, a pendulum, a molecule, a bridge, a gravitational-wave detector’s mirror — oscillates this way for small motions, so SHM is the first model of every vibration.',
  visual: {
    type: 'mech-graphlink',
    title: 'Position, velocity and acceleration together',
    lead: t`A cart on a spring (the spring is not drawn) oscillates about $x = 0$. The three graphs share one time axis: position, velocity and acceleration. Press **Play**, or drag the time slider.`,
    tasks: [
      'Make k four times larger: the oscillation becomes twice as fast, since ω = √(k/m).',
      'Change the amplitude A: the period does not change at all.',
      'Turn on the tangent lines: where x is largest, v is zero and a is most negative — the acceleration always points back toward x = 0.',
    ],
    params: {
      x: 'A*cos(sqrt(k/m)*t)', T: 12, panels: ['x', 'v', 'a'], track: 'horizontal',
      sliders: [
        { key: 'A', label: 'Amplitude $A$', min: 0.2, max: 1, step: 0.05, value: 0.6, unit: '\\mathrm{m}', explain: 'How far the cart is pulled before it is released at $t = 0$.' },
        { key: 'k', label: 'Spring constant $k$', min: 1, max: 16, step: 0.5, value: 4, unit: '\\mathrm{N/m}', explain: 'Stiffer spring, stronger pull back.' },
        { key: 'm', label: 'Mass $m$', min: 0.5, max: 4, step: 0.1, value: 1, unit: '\\mathrm{kg}', explain: 'More mass, more inertia: slower oscillation.' },
      ],
      ranges: { x: [-1.1, 1.1] },
    },
    caption: 'Ideal SHM: a linear spring, no friction, released from rest at x = A. The cart stands for the mass on the spring.',
  },
  example: {
    prompt: t`A $0.50$ kg block on a spring with $k = 18$ N/m is pulled $0.10$ m from equilibrium and released at $t = 0$. Find $\omega$, the period, the frequency, $x(t)$, and the block’s greatest speed and greatest acceleration.`,
    visual: { type: 'mech-graphlink', params: { x: '0.10*cos(6*t)', T: 2.1, panels: ['x', 'v', 'a'], track: 'horizontal', ranges: { x: [-0.12, 0.12] } }, caption: 'The block’s motion: x(t) = 0.10 cos 6t. Ideal spring, no friction.' },
    steps: [
      { label: 'Angular frequency', text: t`$\omega = \sqrt{k/m} = \sqrt{18/0.50} = 6.0\ \text{rad/s}$.` },
      { label: 'Period and frequency', text: t`$T = 2\pi/\omega = 1.05\ \text{s}$; $f = 1/T = 0.95\ \text{Hz}$.` },
      { label: 'Equation of motion', text: t`Released from rest at $x = +A$, so $\phi = 0$: $x(t) = (0.10\ \text{m})\cos(6.0\,t)$.` },
      { label: 'Greatest speed', text: t`$v = dx/dt = -A\omega\sin\omega t$, so $v_\text{max} = A\omega = (0.10)(6.0) = 0.60\ \text{m/s}$, passing through $x = 0$.` },
      { label: 'Greatest acceleration', text: t`$a = -A\omega^2\cos\omega t$, so $a_\text{max} = A\omega^2 = 3.6\ \text{m/s}^2$, at the ends. Check: $kA/m = 18(0.10)/0.50 = 3.6$. ✓` },
    ],
    answer: t`$\omega = 6.0$ rad/s, $T = 1.05$ s, $f = 0.95$ Hz, $x = 0.10\cos 6t$ m, $v_\text{max} = 0.60$ m/s, $a_\text{max} = 3.6\ \text{m/s}^2$.`,
  },
  practice: [
    num({
      id: 'period', difficulty: 1,
      gen(r) {
        const m = r.pick([0.25, 0.5, 1.2, 2.0]), k = r.pick([8, 12.5, 20, 45]);
        const T = TAU * Math.sqrt(m / k);
        return {
          prompt: t`A ${m} kg block oscillates on a spring with $k = ${k}$ N/m. What is the period?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: [{ value: TAU * Math.sqrt(k / m), feedback: t`The ratio is upside down: $T = 2\pi\sqrt{m/k}$ — more mass, longer period.` }, { value: Math.sqrt(m / k), feedback: t`That is $1/\omega$. The period is $2\pi/\omega$.` }, { value: 1 / T, feedback: 'That is the frequency, cycles per second. The period is its reciprocal.' }],
          hints: [t`$\omega = \sqrt{k/m}$ and $T = 2\pi/\omega$.`],
          teach: 'A mass on a spring has period T = 2π√(m/k).',
          explain: t`$\omega = \sqrt{${k}/${m}} = ${tn(Math.sqrt(k / m))}$ rad/s, so $T = 2\pi/\omega = ${tn(T)}\ \text{s}$.`,
          visual: springPic({ m: `${m} kg`, k: `k = ${k} N/m`, arrow: 'pulled, then released' }),
        };
      },
    }),
    num({
      id: 'k-from-graph', difficulty: 2,
      gen(r) {
        const T = r.pick([0.8, 1.25, 1.6, 2.0]), m = r.pick([0.2, 0.4, 0.5]);
        const k = (4 * Math.PI * Math.PI * m) / (T * T);
        return {
          prompt: t`The graph shows the position of a ${m} kg block on a spring. What is the spring constant?`,
          answer: k, units: 'N/m', tol: { rel: 0.01 },
          errors: [{ value: m / (T * T), feedback: t`$\omega = 2\pi/T$, so $k = m\omega^2 = 4\pi^2 m/T^2$: keep the $4\pi^2$.` }, { value: 4 * Math.PI * Math.PI * m * T * T, feedback: 'The period goes in the denominator: k = 4π²m/T².' }],
          hints: ['Read the period: the time between two neighbouring peaks.', t`$T = 2\pi\sqrt{m/k}$ gives $k = \dfrac{4\pi^2 m}{T^2}$.`],
          teach: 'Read the period from peak to peak, then k = 4π²m/T².',
          explain: t`Peaks are $${T}$ s apart, so $T = ${T}$ s and $k = \dfrac{4\pi^2(${m})}{(${T})^2} = ${tn(k)}\ \text{N/m}$.`,
          visual: xtGraph({ A: 0.05, w: TAU / T, tmax: 2.4 * T, xticks: 12, points: [{ x: 0, y: 0.05, color: 'gold' }, { x: T, y: 0.05, color: 'gold' }, { x: 2 * T, y: 0.05, color: 'gold' }], caption: 'Position against time. Gold: the peaks. Ideal SHM, no friction.' }),
        };
      },
    }),
    mcq({
      id: 'four-m', difficulty: 1,
      prompt: t`A block on a spring oscillates with period $T$. It is replaced by a block with **four times** the mass on the same spring. What is the new period?`,
      choices: [t`$2T$`, t`$4T$`, t`$T/2$`, t`$T$: only the spring sets the period`],
      answer: 0,
      why: {
        1: t`The period goes as the *square root* of the mass: $\sqrt{4} = 2$.`,
        2: 'More mass means more inertia, so a slower oscillation and a longer period, not a shorter one.',
        3: t`The mass matters: $T = 2\pi\sqrt{m/k}$.`,
      },
      hints: [t`$T = 2\pi\sqrt{m/k}$.`],
      teach: 'The period of a mass on a spring grows as the square root of the mass.',
      explain: t`$T' = 2\pi\sqrt{4m/k} = 2\cdot2\pi\sqrt{m/k} = 2T$.`,
      visual: springPic({ m: '4m', k: 'the same spring', arrow: null, x: 0 }),
    }),
    mcq({
      id: 'amplitude', difficulty: 2,
      prompt: t`A block on an ideal spring is pulled 2 cm from equilibrium and released, and its period is timed. Then it is pulled 4 cm and released. The new period is:`,
      choices: ['The same', 'Twice as long: it has twice as far to go', t`$\sqrt2$ times as long`, 'Half as long: the stretched spring pulls twice as hard'],
      answer: 0,
      why: {
        1: 'It does have twice as far to go — but the spring pulls twice as hard all the way, so it moves twice as fast. The two effects cancel exactly.',
        2: 'No square root appears: for a linear spring the period does not depend on the amplitude at all.',
        3: 'Twice the force does give twice the speed, but over twice the distance — the time is unchanged.',
      },
      hints: ['Does A appear in T = 2π√(m/k)?'],
      teach: 'For true SHM the period is independent of the amplitude.',
      explain: t`$T = 2\pi\sqrt{m/k}$ has no $A$ in it. Doubling $A$ doubles every displacement, speed and acceleration, so the motion is the same shape, scaled — and takes the same time. (Real springs stretched far enough stop obeying $F = -kx$; then this fails.)`,
      visual: springPic({ x: 1.0, ghost: 0.5, m: 'm', k: 'k', arrow: '4 cm (dashed: 2 cm)' }),
    }),
    num({
      id: 'vmax', difficulty: 2,
      gen(r) {
        const m = r.pick([0.3, 0.6, 1.5]), k = r.pick([30, 60, 150]), A = r.pick([4, 6, 10]);   // A in cm
        const w = Math.sqrt(k / m), v = (A / 100) * w;
        return {
          prompt: t`A ${m} kg block on a spring ($k = ${k}$ N/m) is pulled ${A} cm from equilibrium and released. How fast is it moving as it passes through equilibrium?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: (A / 100) * w * w, feedback: t`That is $A\omega^2$, the largest acceleration. The largest speed is $A\omega$.` }, { value: A * w, feedback: 'Convert the amplitude to metres.' }],
          hints: [t`The speed is greatest at equilibrium: $v_\text{max} = A\omega$.`, t`$\omega = \sqrt{k/m}$, and $A$ in metres.`],
          teach: 'In SHM the greatest speed, Aω, occurs at equilibrium.',
          explain: t`$\omega = \sqrt{${k}/${m}} = ${tn(w)}$ rad/s, so $v_\text{max} = A\omega = ${A / 100}\times${tn(w)} = ${tn(v)}\ \text{m/s}$.`,
          visual: springPic({ m: `${m} kg`, k: `k = ${k} N/m`, x: 0, arrow: null, v: 'v = ?' }),
        };
      },
    }),
    expr({
      id: 'v-of-t', difficulty: 2,
      gen(r) {
        const A = r.pick([0.2, 0.05, 0.3]), w = r.pick([3, 4, 5]);
        return {
          prompt: t`A block’s position is $x(t) = ${A}\cos(${w}t)$, in metres. Find its velocity $v(t)$.`,
          answer: `-${A * w}*sin(${w}t)`,
          answerTeX: t`-${tn(A * w)}\sin(${w}t)`,
          vars: { t: [0, 3] }, lhs: 'v(t)', derivativeOf: `${A}*cos(${w}t)`,
          errors: [{ answer: `${A * w}*sin(${w}t)`, feedback: t`The derivative of $\cos u$ is $-\sin u$: watch the sign.` }, { answer: `-${A}*sin(${w}t)`, feedback: t`Chain rule: differentiating $\cos(${w}t)$ brings out a factor of ${w}.` }],
          hints: [t`$v = dx/dt$.`, t`$\dfrac{d}{dt}\cos(\omega t) = -\omega\sin(\omega t)$.`],
          teach: 'Velocity is the time derivative of position: for x = A cos ωt, v = −Aω sin ωt.',
          explain: t`$v = \dfrac{d}{dt}\left[${A}\cos(${w}t)\right] = -${tn(A * w)}\sin(${w}t)$ m/s: largest, $${tn(A * w)}$ m/s, when $x = 0$; zero at the ends.`,
          visual: xtGraph({ A, w, tmax: (3 * TAU) / w, caption: t`The position $x(t) = ${A}\cos(${w}t)$. Its slope at each instant is the velocity.` }),
        };
      },
    }),
    mcq({
      id: 'start-left', difficulty: 2,
      prompt: t`A block on a spring is pushed to $x = -A$ (left of equilibrium) and released from rest at $t = 0$. Which describes its motion?`,
      choices: [t`$x = -A\cos\omega t$`, t`$x = A\cos\omega t$`, t`$x = A\sin\omega t$`, t`$x = -A\sin\omega t$`],
      answer: 0,
      why: {
        1: t`At $t = 0$ that gives $x = +A$: the block would start on the right.`,
        2: t`At $t = 0$ that gives $x = 0$ — a start at equilibrium, already moving.`,
        3: t`That also starts at $x = 0$ (moving left), not at $-A$ at rest.`,
      },
      hints: ['Put t = 0 into each: which gives x = −A?', 'Then check the velocity at t = 0 is zero.'],
      teach: 'Fix A and φ from the initial conditions: the position and velocity at t = 0.',
      explain: t`$x(0) = -A\cos 0 = -A$ ✓, and $v(0) = A\omega\sin 0 = 0$ ✓. Equivalently $x = A\cos(\omega t + \pi)$: a phase constant of $\pi$.`,
      visual: springPic({ x: -1.0, m: 'm', k: 'k', arrow: 'A' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-freq', difficulty: 2,
      gen(r) {
        const m = r.pick([0.15, 0.4, 0.8]), k = r.pick([25, 60, 120]);
        const f = Math.sqrt(k / m) / TAU;
        return {
          prompt: t`What is the frequency, in Hz, of a ${m} kg mass on a spring with $k = ${k}$ N/m?`,
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(k / m), feedback: t`That is $\omega$, in rad/s. Divide by $2\pi$ for cycles per second.` }, { value: 1 / f, feedback: 'That is the period. The frequency is its reciprocal.' }],
          hints: [t`$f = \dfrac{\omega}{2\pi} = \dfrac{1}{2\pi}\sqrt{\dfrac{k}{m}}$.`],
          teach: 'f = ω/2π = (1/2π)√(k/m).',
          explain: t`$\omega = \sqrt{${k}/${m}} = ${tn(Math.sqrt(k / m))}$ rad/s, so $f = \omega/2\pi = ${tn(f)}\ \text{Hz}$.`,
          visual: springPic({ m: `${m} kg`, k: `k = ${k} N/m`, arrow: 'released' }),
        };
      },
    }),
    expr({
      id: 'cp-a-of-t', difficulty: 2,
      gen(r) {
        const A = r.pick([0.1, 0.25, 0.4]), w = r.pick([2, 3, 6]);
        return {
          prompt: t`A mass moves as $x(t) = ${A}\cos(${w}t)$, in metres. Find its acceleration $a(t)$.`,
          answer: `-${+(A * w * w).toFixed(6)}*cos(${w}t)`,
          answerTeX: t`-${tn(A * w * w)}\cos(${w}t)`,
          vars: { t: [0, 3] }, lhs: 'a(t)',
          errors: [{ answer: `${+(A * w * w).toFixed(6)}*cos(${w}t)`, feedback: 'The acceleration points opposite to the displacement: a = −ω²x.' }, { answer: `-${+(A * w).toFixed(6)}*sin(${w}t)`, feedback: 'That is the velocity. Differentiate once more.' }],
          hints: ['Differentiate twice.'],
          teach: 'For SHM, a = −ω²x: the acceleration is the displacement scaled by −ω².',
          explain: t`$v = -${tn(A * w)}\sin(${w}t)$ and $a = -${tn(A * w * w)}\cos(${w}t) = -${w * w}\,x$ — exactly $a = -\omega^2 x$ with $\omega = ${w}$.`,
          visual: xtGraph({ A, w, tmax: (3 * TAU) / w, caption: t`The position $x(t) = ${A}\cos(${w}t)$.` }),
        };
      },
    }),
    num({
      id: 'cp-bmmd', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([600, 650]), mc = 11.4, M = r.pick([58, 66, 75, 82]);
        const T = +(TAU * Math.sqrt((M + mc) / k)).toFixed(4);
        const Mfound = (k * T * T) / (4 * Math.PI * Math.PI) - mc;
        return {
          prompt: t`In orbit nothing has weight, so astronauts measure their mass by oscillating. An astronaut sits in a ${mc} kg chair mounted on springs with a combined $k = ${k}$ N/m, and the chair oscillates with a period of ${T} s. What is the astronaut’s mass?`,
          answer: Mfound, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: Mfound + mc, feedback: 'That is the chair and the astronaut together. Subtract the chair.' }, { value: (k * T * T) - mc, feedback: t`Keep the $4\pi^2$: $m = kT^2/4\pi^2$.` }],
          hints: [t`$T = 2\pi\sqrt{m_\text{total}/k}$, so $m_\text{total} = \dfrac{kT^2}{4\pi^2}$.`, 'The oscillating mass is the astronaut plus the chair.'],
          teach: 'The period of a mass on a spring measures inertial mass — no gravity required.',
          explain: t`$m_\text{total} = \dfrac{${k}\times${T}^2}{4\pi^2} = ${tn(Mfound + mc)}$ kg, so the astronaut has $${tn(Mfound + mc)} - ${mc} = ${tn(Mfound)}\ \text{kg}$. Skylab and the ISS have both used spring-oscillation devices like this.`,
          visual: springPic({ m: 'chair + astronaut', k: `k = ${k} N/m`, arrow: 'oscillates' }),
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §15.1 Simple Harmonic Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-1-simple-harmonic-motion' }],
});
