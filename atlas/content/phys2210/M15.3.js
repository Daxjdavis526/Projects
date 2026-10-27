// Pendulums: the small-angle period 2π√(L/g), independent of mass and (for
// small swings) of amplitude — with the honest large-angle correction, and
// the physical pendulum.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, s3, tn, pendulumPic } from './_osc.js';

const t = String.raw;
const TAU = 2 * Math.PI;

// a uniform rod hanging from a pivot at its top end, swung aside
function rodPic(L, caption) {
  const th = 0.42, len = 2.2, x = len * Math.sin(th), y = -len * Math.cos(th);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-2.6, 2.6], y: [-2.75, 0.35], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
      curves: [
        { param: [`t*${x.toFixed(4)}`, `t*${y.toFixed(4)}`], t: [0, 1], color: 'accent', width: 9 },
        { param: ['0', `-${(len + 0.2).toFixed(2)}*t`], t: [0, 1], color: 'ink4', width: 1.2, dash: true },
      ],
      points: [{ x: 0, y: 0, color: 'ink', r: 5 }, { x: +(x / 2).toFixed(4), y: +(y / 2).toFixed(4), color: 'gold', r: 4, label: 'centre of mass', labelDx: 10 }, { x: +(x + 0.15).toFixed(4), y: +(y - 0.05).toFixed(4), r: 0.01, color: 'ink2', label: `L = ${L} m` }, { x: 0.12, y: 0.18, r: 0.01, color: 'ink2', label: 'pivot' }],
    },
    caption,
  };
}

export default lesson({
  id: 'phys2210.M15.3',
  title: 'Pendulums',
  minutes: 11, difficulty: 2,
  intro: t`A bob of mass $m$ on a string of length $L$, pulled aside by an angle $\theta$, feels a restoring force $mg\sin\theta$ along its path. For small swings $\sin\theta \approx \theta$ (in radians), so the restoring force is proportional to the displacement — simple harmonic motion, with

$$T = 2\pi\sqrt{\frac{L}{g}}$$

The mass cancels: a heavier bob needs more force to accelerate, and gravity supplies exactly that much more. The amplitude does not appear either — **for small swings**. At large angles $\sin\theta < \theta$, the restoring force falls behind and the real period grows: about 0.2% longer at 10°, 7% longer at 60°.`,
  symbols: [
    { tex: 'T', text: 'the period of the swing, in s (there and back)' },
    { tex: 'L', text: 'the length from the pivot to the bob’s centre, in m' },
    { tex: 'g', text: 'the gravitational acceleration, in m/s²: 9.8 on Earth, 3.71 on Mars, 1.62 on the Moon' },
    { tex: '\\theta', text: 'the angle from the vertical, in radians when used in $\\sin\\theta \\approx \\theta$' },
    { tex: 'm', text: 'the bob’s mass, in kg — it drops out of $T$' },
  ],
  why: 'Pendulums kept the world’s time for three centuries and still measure g; the same small-angle reasoning turns any swinging part — a crane’s load, a fuel slosh mode, a test mass hanging in a gravitational-wave detector — into a simple oscillator.',
  visual: {
    type: 'oscillator',
    title: 'Small swings and big ones',
    lead: t`A pendulum integrated exactly (solid) and with the small-angle approximation (dashed). The readouts compare the two periods. Change the length and the release angle.`,
    tasks: [
      'Release from 10°: the two curves stay together and the periods agree within 0.2%.',
      'Release from 60°, then 120°: the exact period pulls ahead of the small-angle one.',
      'Make L four times longer: the period doubles. There is no mass slider — the mass does not matter.',
    ],
    params: { kind: 'pendulum', L: 1, theta0: 20 },
    caption: 'Dashed: the small-angle solution θ₀ cos ω₀t. Solid: the exact equation θ″ = −(g/L) sin θ, integrated numerically. Point bob, massless string, no air (unless you add damping). g = 9.8 m/s². The drawing is not to scale.',
  },
  example: {
    prompt: t`A grandfather clock’s pendulum must take $1.00$ s for each swing — a period of $2.00$ s. (a) How long must it be? (b) The clock is moved to a city where $g = 9.78\ \text{m/s}^2$ instead of $9.80$. How much time does it lose per day?`,
    visual: { type: 'oscillator', params: { kind: 'pendulum', L: 0.99, theta0: 5 }, caption: 'A 0.99 m pendulum swinging through small angles. g = 9.8 m/s².' },
    steps: [
      { label: 'Length', text: t`$T = 2\pi\sqrt{L/g} \Rightarrow L = \dfrac{gT^2}{4\pi^2} = \dfrac{(9.80)(2.00)^2}{4\pi^2} = 0.993\ \text{m}$.` },
      { label: 'New period', text: t`Same $L$, weaker $g$: $T' = T\sqrt{9.80/9.78} = 2.00\times1.00102 = 2.00204\ \text{s}$.` },
      { label: 'Time lost', text: t`Each swing takes 0.102% too long, so the clock counts 0.102% too few seconds: $86\,400\ \text{s}\times0.00102 \approx 88\ \text{s}$ a day.` },
      { label: 'Sense check', text: t`A 0.2% change in $g$ makes a 0.1% change in $T$ — the square root halves it. Clockmakers adjusted the bob’s height with a screw for exactly this; geologists turned the same sensitivity around to map $g$.` },
    ],
    answer: t`(a) $L = 0.993$ m; (b) it loses about 88 s a day.`,
  },
  practice: [
    num({
      id: 'period', difficulty: 1,
      gen(r) {
        const L = r.pick([0.25, 0.5, 1.5, 2.4]);
        const T = TAU * Math.sqrt(L / G);
        return {
          prompt: t`What is the period of a simple pendulum ${L} m long, swinging through small angles? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: [{ value: TAU * Math.sqrt(G / L), feedback: t`The ratio is upside down: $T = 2\pi\sqrt{L/g}$ — a longer pendulum swings more slowly.` }, { value: Math.sqrt(L / G), feedback: t`Keep the $2\pi$: $T = 2\pi\sqrt{L/g}$.` }],
          hints: [t`$T = 2\pi\sqrt{L/g}$.`],
          teach: 'For small swings a simple pendulum has T = 2π√(L/g).',
          explain: t`$T = 2\pi\sqrt{${L}/9.8} = ${tn(T)}\ \text{s}$.`,
          visual: pendulumPic({ deg: 12, L: `L = ${L} m` }),
        };
      },
    }),
    num({
      id: 'length', difficulty: 2,
      gen(r) {
        const T = r.pick([0.5, 1.5, 3.0, 4.0]);
        const L = (G * T * T) / (4 * Math.PI * Math.PI);
        return {
          prompt: t`How long must a simple pendulum be to have a period of ${T} s for small swings? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (G * T) / TAU, feedback: t`Square both sides: $L = gT^2/4\pi^2$.` }, { value: (G * T * T) / TAU, feedback: t`When you square $2\pi$ you get $4\pi^2$.` }],
          hints: [t`Square $T = 2\pi\sqrt{L/g}$: $T^2 = 4\pi^2 L/g$.`],
          teach: 'Solve T = 2π√(L/g) for L: L = gT²/4π².',
          explain: t`$L = \dfrac{9.8\times${T}^2}{4\pi^2} = ${tn(L)}\ \text{m}$.`,
          visual: pendulumPic({ deg: 12, L: 'L = ?' }),
        };
      },
    }),
    mcq({
      id: 'heavier', difficulty: 1,
      prompt: t`Two pendulums of the same length swing through small angles. One bob is lead, the other wood, four times lighter. Compare their periods.`,
      choices: ['They are the same', 'The lead one swings faster: gravity pulls it harder', 'The lead one swings more slowly: it has more inertia', 'The lead one’s period is half as long'],
      answer: 0,
      why: {
        1: 'Gravity does pull it harder — but it also needs more force to accelerate. The two effects cancel exactly.',
        2: 'It does have more inertia, but its larger weight supplies exactly the extra force needed.',
        3: t`No mass appears in $T = 2\pi\sqrt{L/g}$, so no factor of the mass can appear in the answer.`,
      },
      hints: ['Does m appear in T = 2π√(L/g)?'],
      teach: 'A pendulum’s period does not depend on the bob’s mass (neglecting air).',
      explain: t`The restoring force $mg\sin\theta$ and the inertia $m$ are both proportional to the mass, so $m$ cancels in $a = -g\sin\theta$. (In air a light wooden bob slows down sooner — that is damping, not a change of period.) The same cancellation — weight proportional to inertia — is the root of Einstein’s equivalence principle.`,
      visual: pendulumPic({ deg: 15, m: 'lead or wood?' }),
    }),
    num({
      id: 'elsewhere', difficulty: 2,
      gen(r) {
        const [where, g] = r.pick([['the Moon', 1.62], ['Mars', 3.71]]), T0 = r.pick([1.0, 1.5, 2.0]);
        const T = T0 * Math.sqrt(G / g);
        return {
          prompt: t`A pendulum has a period of ${T0.toFixed(1)} s on Earth ($g = 9.8\ \text{m/s}^2$). What is its period on ${where}, where $g = ${g}\ \text{m/s}^2$?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: [{ value: T0 * Math.sqrt(g / G), feedback: 'Weaker gravity gives a slower swing: the period must get longer, not shorter.' }, { value: (T0 * G) / g, feedback: t`$T \propto 1/\sqrt{g}$: take the square root of the ratio.` }],
          hints: [t`$T \propto 1/\sqrt{g}$, so $T_\text{there} = T_\text{Earth}\sqrt{g_\text{Earth}/g_\text{there}}$.`],
          teach: 'A pendulum’s period goes as 1/√g.',
          explain: t`$T = ${T0.toFixed(1)}\sqrt{9.8/${g}} = ${T0.toFixed(1)}\times${tn(Math.sqrt(G / g))} = ${tn(T)}\ \text{s}$.`,
          visual: pendulumPic({ deg: 12, L: 'same L' }),
        };
      },
    }),
    mcq({
      id: 'big-swings', difficulty: 2,
      prompt: t`A pendulum is timed swinging through $5^\circ$, then released from $60^\circ$. How does the second period compare?`,
      choices: ['About 7% longer: the small-angle formula only holds for small swings', 'Exactly the same: a pendulum’s period never depends on its amplitude', 'About 12 times longer, in proportion to the angle', 'Shorter: it swings faster from higher up'],
      answer: 0,
      why: {
        1: t`That is true only for small swings, where $\sin\theta \approx \theta$. At 60°, $\sin 60^\circ = 0.866$ while $\theta = 1.047$ rad — the restoring force falls 17% short.`,
        2: 'It does travel farther and faster, but the period depends only weakly on the amplitude, not in proportion.',
        3: 'It moves faster at the bottom, but over a longer arc; on balance it takes longer, because the restoring force grows more slowly than the angle.',
      },
      hints: ['Compare sin θ with θ (in radians) at 60°.', 'A weaker restoring force than the linear one means a slower swing.'],
      teach: 'The pendulum’s period is independent of amplitude only for small swings; large swings take longer.',
      explain: t`The exact period is $T = T_0\left(1 + \tfrac{1}{16}\theta_0^2 + \dots\right)$: about $1.002\,T_0$ at 10° and $1.073\,T_0$ at 60°. Pendulum clocks keep their swings small and steady for this reason.`,
      visual: pendulumPic({ deg: 60, L: 'L', angle: '60°' }),
    }),
    num({
      id: 'rod', difficulty: 3,
      gen(r) {
        const L = r.pick([0.6, 0.9, 1.2, 1.5]);
        const T = TAU * Math.sqrt((2 * L) / (3 * G));
        return {
          prompt: t`A uniform rod ${L} m long hangs from a pivot at one end and swings through small angles. Using $T = 2\pi\sqrt{I/(mgd)}$, with $I = \tfrac13mL^2$ about the end and $d$ the distance from the pivot to the centre of mass, find its period. ($g = 9.8\ \text{m/s}^2$.)`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: [{ value: TAU * Math.sqrt(L / G), feedback: 'That treats the rod as a bob on a string of length L. Its mass is spread out: use I and d.' }, { value: TAU * Math.sqrt(L / (2 * G)), feedback: 'That treats all the mass as sitting at the centre of mass. A spread-out rod has more inertia than that: use I = ⅓mL².' }],
          hints: [t`For a uniform rod $d = L/2$.`, t`$\dfrac{I}{md} = \dfrac{\tfrac13mL^2}{m(L/2)} = \dfrac{2L}{3}$, so $T = 2\pi\sqrt{\dfrac{2L}{3g}}$.`],
          teach: 'A physical pendulum has T = 2π√(I/mgd): the mass distribution sets the period.',
          explain: t`$T = 2\pi\sqrt{\dfrac{2(${L})}{3(9.8)}} = ${tn(T)}\ \text{s}$ — like a simple pendulum of length $\tfrac23L = ${tn((2 * L) / 3)}$ m.`,
          visual: rodPic(L, 'A uniform rod swinging about a pivot at its top end. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'degrees', difficulty: 2, kind: 'error',
      prompt: t`A student estimates the restoring force on a $2.0$ kg pendulum bob pulled $10^\circ$ aside, using the small-angle approximation:

$$F \approx mg\theta = (2.0)(9.8)(10) = 196\ \text{N}.$$

What is wrong?`,
      choices: [t`$\theta$ must be in radians: $10^\circ = 0.175$ rad, so $F \approx 3.4$ N`, t`It should be $mg\cos\theta$, the component along the string`, t`It should be $mg/\theta$`, 'Nothing: the small-angle approximation is valid at 10°'],
      answer: 0,
      why: {
        1: t`The component along the string is balanced by the tension; the restoring force is the one along the path, $mg\sin\theta$.`,
        2: 'The restoring force grows with the angle, it does not shrink.',
        3: 'The approximation is fine at 10° — but only with θ in radians. 196 N is ten times the bob’s weight.',
      },
      hints: ['Is a restoring force ten times the bob’s weight plausible?', t`$\sin\theta \approx \theta$ holds with $\theta$ in radians.`],
      teach: 'sin θ ≈ θ only with θ in radians.',
      explain: t`$10^\circ = 10\times\pi/180 = 0.175$ rad, so $F \approx (2.0)(9.8)(0.175) = 3.4$ N; the exact value, $mg\sin10^\circ$, is $3.40$ N.`,
      visual: pendulumPic({ deg: 10, m: '2.0 kg', angle: '10°' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-length', difficulty: 2,
      gen(r) {
        const T = r.pick([1.2, 2.5, 6.0]);
        const L = (G * T * T) / (4 * Math.PI * Math.PI);
        return {
          prompt: t`What length of simple pendulum has a period of ${T} s for small swings? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (G * T) / TAU, feedback: 'Square the period: L = gT²/4π².' }],
          hints: [t`$L = gT^2/4\pi^2$.`],
          teach: 'L = gT²/4π².',
          explain: t`$L = \dfrac{9.8\times${T}^2}{4\pi^2} = ${tn(L)}\ \text{m}$.`,
          visual: pendulumPic({ deg: 10, L: 'L = ?' }),
        };
      },
    }),
    mcq({
      id: 'cp-four-L', difficulty: 2,
      prompt: t`Pendulum A is four times as long as pendulum B. Both swing through small angles in the same place. What is $T_A/T_B$?`,
      choices: ['2', '4', '16', '1/2'],
      answer: 0,
      why: { 1: t`The period goes as $\sqrt{L}$, not as $L$.`, 2: 'That would be L², the wrong way up.', 3: 'The longer pendulum is the slower one.' },
      hints: [t`$T \propto \sqrt{L}$.`],
      teach: 'Quadrupling a pendulum’s length doubles its period.',
      explain: t`$T_A/T_B = \sqrt{L_A/L_B} = \sqrt4 = 2$.`,
      visual: pendulumPic({ deg: 12, L: 'A: 4L, B: L' }),
    }),
    num({
      id: 'cp-mars', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([0.8, 1.0, 1.2]);
        const t20 = +(20 * TAU * Math.sqrt(L / 3.71)).toPrecision(3);
        const T = t20 / 20, g = (4 * Math.PI * Math.PI * L) / (T * T);
        return {
          prompt: t`An astronaut on Mars times a ${L.toFixed(2)} m pendulum swinging through small angles: 20 complete swings take ${t20} s. What is $g$ on Mars?`,
          answer: g, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: (4 * Math.PI * Math.PI * L) / (t20 * t20), feedback: 'Divide the time by 20 first: that gives the period of one swing.' }, { value: L / (T * T), feedback: t`Keep the $4\pi^2$: $g = 4\pi^2L/T^2$.` }],
          hints: [t`$T = ${t20}/20$ s.`, t`Solve $T = 2\pi\sqrt{L/g}$ for $g$: $g = 4\pi^2L/T^2$.`],
          teach: 'Timing many swings of a known length measures g: g = 4π²L/T².',
          explain: t`$T = ${t20}/20 = ${tn(T)}$ s, so $g = \dfrac{4\pi^2(${L.toFixed(2)})}{${tn(T)}^2} = ${tn(g)}\ \text{m/s}^2$ — about 38% of Earth’s. Timing 20 swings instead of one cuts the stopwatch’s error twentyfold.`,
          visual: pendulumPic({ deg: 10, L: `L = ${L.toFixed(2)} m` }),
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §15.4 Pendulums', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums' }],
});
