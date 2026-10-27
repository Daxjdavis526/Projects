// Wave speed on a string: v = √(F_T/μ). The medium alone sets the speed —
// tension supplies the restoring force, mass per metre the inertia — while the
// source sets only the frequency and amplitude; the wavelength follows.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { tn, s3, r6, snapshot, curvePicture, label, seg, stringRig } from './_waves.js';

const t = String.raw;

/** Wave speed on a string, m/s. */
const speed = (F, mu) => Math.sqrt(F / mu);

export default lesson({
  id: 'phys2220.W1.2',
  title: 'Wave speed on a string',
  minutes: 11, difficulty: 2,
  intro: t`How fast a wave runs along a string is decided by **the string**, not by the hand that shakes it. When a piece of string is displaced, the tension pulls it back toward the line — that is the restoring force — and its mass resists being accelerated — that is the inertia. Newton’s second law applied to a short piece turns into the wave equation, with

$$v = \sqrt{\frac{F_T}{\mu}}$$

A tighter string carries waves faster; a heavier one, slower. The source decides only the frequency and the amplitude; the string then decides the wavelength, $\lambda = v/f$. So **shaking harder, farther or faster does not make a wave travel faster** — though most people, asked, say that it does.`,
  symbols: [
    { tex: 'v', text: 'the wave speed: how fast a crest or a pulse moves along the string, in m/s' },
    { tex: 'F_T', text: 'the tension: the pulling force along the string, in N (the subscript keeps it apart from the period $T$)' },
    { tex: '\\mu = m/L', text: 'the linear mass density: the string’s mass per metre, in kg/m. A 2.0 m string of mass 10 g has $\\mu = 0.010/2.0 = 0.0050$ kg/m' },
  ],
  why: 'Musicians tune by tension, engineers read the tension in a cable from the speed of waves on it, and the rule that the medium alone sets the speed holds for sound and light as well.',
  visual: {
    type: 'wave-string',
    title: 'Only the rope sets the speed',
    lead: t`A 20 m rope. Flick its end to send pulses — tall or short, quick or slow — or keep shaking it. Then change the rope itself: its tension and its mass per metre.`,
    tasks: [
      'Send a tall pulse, then lower the height and send a short one: they travel together, the same distance apart all the way.',
      'Quadruple the tension (from 25 N to 100 N, say): pulses cross the rope in half the time.',
      'Switch to “Keep shaking” and raise the frequency: the wavelength shrinks, but the front of the wave advances just as fast.',
    ],
    params: { mode: 'medium', FT: 40, mu: 0.4 },
  },
  example: {
    prompt: t`A 12 m rope of mass 2.4 kg is stretched with a tension of 200 N. One end is shaken up and down at 2.0 Hz. Find the wave speed, the wavelength and the time a crest takes to run the length of the rope. What changes if the end is shaken at 4.0 Hz instead?`,
    visual: curvePicture({
      fn: 'sin(2*pi*x/15.81)', x: [0, 12], y: [-1.5, 1.8], ylabel: 'y (arbitrary)',
      curves: [{ fn: '0.6*sin(2*pi*x/7.906)', color: 'warn', width: 2, dash: true }],
      points: [label(0.25, 1.45, '2.0 Hz: λ = 15.8 m', 'accent'), label(5.6, 1.45, '4.0 Hz: λ = 7.9 m (dashed)', 'warn')],
      caption: 'The two waves on the same rope, shown together at one instant (heights not to scale). Doubling the frequency halves the wavelength; both waves move at 31.6 m/s.',
    }),
    steps: [
      { label: 'Mass per metre', text: t`$\mu = m/L = 2.4\ \text{kg}/12\ \text{m} = 0.20$ kg/m.` },
      { label: 'Speed', text: t`$v = \sqrt{F_T/\mu} = \sqrt{200\ \text{N}/0.20\ \text{kg/m}} = \sqrt{1000}\ \text{m/s} = 31.6$ m/s. Units: $\sqrt{\text{N}/(\text{kg/m})} = \sqrt{\text{kg}\,\text{m}\,\text{s}^{-2}\cdot\text{m}/\text{kg}} = \text{m/s}$. ✓` },
      { label: 'Wavelength', text: t`$\lambda = v/f = 31.6/2.0 = 15.8$ m.` },
      { label: 'Travel time', text: t`$t = L/v = 12/31.6 = 0.38$ s.` },
      { label: 'Shake faster', text: t`At 4.0 Hz the rope is unchanged, so $v$ is still 31.6 m/s and the crossing still takes 0.38 s. Only the wavelength changes: $\lambda = 31.6/4.0 = 7.9$ m, half as long.` },
    ],
    answer: t`$v = 31.6$ m/s, $\lambda = 15.8$ m, 0.38 s to cross. At 4.0 Hz: same speed and crossing time, $\lambda = 7.9$ m.`,
  },
  practice: [
    num({
      id: 'speed', difficulty: 1,
      gen(r) {
        const F = r.pick([50, 80, 120, 200, 450]), mu = r.pick([0.005, 0.01, 0.02, 0.05, 0.2]);
        const v = speed(F, mu);
        return {
          prompt: t`A string with linear density $\mu = ${mu}$ kg/m is under a tension of ${F} N. How fast do waves travel along it?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [
            { value: F / mu, feedback: t`Take the square root: $v = \sqrt{F_T/\mu}$.` },
            { value: Math.sqrt(mu / F), feedback: t`Upside down: tension on top, $v = \sqrt{F_T/\mu}$.` },
            { value: Math.sqrt(F * mu), feedback: t`Divide by $\mu$ inside the root, don’t multiply.` },
          ],
          hints: [t`$v = \sqrt{F_T/\mu}$, with $F_T$ in N and $\mu$ in kg/m.`],
          teach: t`The wave speed on a string is $\sqrt{F_T/\mu}$: tension over mass per metre, square-rooted.`,
          explain: t`$v = \sqrt{${F}/${mu}} = \sqrt{${tn(F / mu)}} = ${tn(v)}$ m/s.`,
          visual: stringRig({ top: `μ = ${mu} kg/m`, side: `tension ${F} N` }),
        };
      },
    }),
    num({
      id: 'mu-from-mass', difficulty: 2,
      gen(r) {
        const L = r.pick([0.8, 1.2, 1.5, 2.0]), mg = r.pick([4, 6, 9, 12]), F = r.pick([40, 60, 90]);
        const mu = mg / 1000 / L, v = speed(F, mu);
        return {
          prompt: t`A ${L} m string has a mass of ${mg} g and is under a tension of ${F} N. What is the wave speed on it?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [
            { value: speed(F, mg / 1000), feedback: t`$\mu$ is the mass **per metre**: divide the mass by the length first.` },
            { value: speed(F, mg / L), feedback: 'Convert grams to kilograms before dividing.' },
          ],
          hints: [t`First find $\mu = m/L$, in kg/m.`, t`Then $v = \sqrt{F_T/\mu}$.`],
          teach: t`Linear density is mass divided by length, in kg/m; then $v = \sqrt{F_T/\mu}$.`,
          explain: t`$\mu = ${mg / 1000}\ \text{kg}/${L}\ \text{m} = ${tn(mu)}$ kg/m, so $v = \sqrt{${F}/${tn(mu)}} = ${tn(v)}$ m/s.`,
          visual: stringRig({ top: `${mg} g`, side: `tension ${F} N`, length: `L = ${L} m` }),
        };
      },
    }),
    mcq({
      id: 'faster-pulse', difficulty: 1,
      prompt: 'You flick one end of a long, stretched rope to send a pulse along it. Which change would make the pulse travel faster?',
      choices: ['Pulling the rope tighter before you flick', 'Flicking your hand faster', 'Flicking your hand farther, to make a taller pulse', 'Flicking it harder, with more force'],
      answer: 0,
      why: {
        1: 'A quicker flick makes a narrower pulse, not a faster one. Once the pulse leaves your hand, the rope alone decides its speed.',
        2: 'A taller pulse carries more energy but moves at the same speed — send two of different heights in the Explore and they keep pace.',
        3: 'The force of the flick shapes the pulse. Its speed is set by the rope’s tension and mass per metre.',
      },
      hints: [t`Which of these appears in $v = \sqrt{F_T/\mu}$?`],
      teach: 'The medium sets the wave speed, through tension and mass per metre; your hand only sets the pulse’s shape and size.',
      explain: t`$v = \sqrt{F_T/\mu}$ has nothing in it about the hand. Raising the tension raises the speed; a faster or bigger flick makes a narrower or taller pulse moving at the same speed. In one study most university students said the opposite — that a faster flick makes a faster pulse.`,
      visual: { type: 'wave-string', params: { mode: 'medium', controls: false, play: false, readout: false, time: 1.2, pulses: [{ t0: 0, h: 0.35, dur: 0.3 }] }, caption: 'A pulse travelling along a stretched rope, sent from the hand (orange) on the left.' },
    }),
    num({
      id: 'tension-ratio', difficulty: 2,
      gen(r) {
        const [N, words] = r.pick([[2, 'twice as fast'], [3, 'three times as fast'], [1.5, '1.5 times as fast'], [0.5, 'half as fast']]);
        return {
          prompt: t`Waves travel along a guitar string at some speed $v$. To make them travel ${words} on the same string, by what factor must the tension be multiplied?`,
          answer: N * N, tol: { rel: 0.005 },
          errors: [
            { value: N, feedback: t`Speed goes as the **square root** of tension, so the tension must change by the square of the speed factor.` },
            { value: Math.sqrt(N), feedback: t`Other way round: $F_T = \mu v^2$, so multiply the tension by the speed factor squared.` },
          ],
          hints: [t`Solve $v = \sqrt{F_T/\mu}$ for $F_T$: $F_T = \mu v^2$.`, t`With $\mu$ fixed, $F_T \propto v^2$.`],
          teach: t`Tension goes as the square of the wave speed: $F_T = \mu v^2$.`,
          explain: t`$F_T = \mu v^2$, so multiplying $v$ by ${N} multiplies $F_T$ by $${N}^2 = ${N * N}$.`,
          visual: curvePicture({ fn: 'sqrt(x)', x: [0, 4.2], y: [0, 2.3], xlabel: 'tension (×F₀)', ylabel: 'speed (×v₀)', caption: t`Wave speed against tension for one string: $v \propto \sqrt{F_T}$. Each doubling of the speed needs four times the tension.` }),
        };
      },
    }),
    num({
      id: 'new-wavelength', difficulty: 2,
      gen(r) {
        const f1 = r.pick([20, 40, 50]), lam1 = r.pick([0.6, 0.9, 1.5]), f2 = f1 * r.pick([2, 3, 0.5]);
        const lam2 = (lam1 * f1) / f2;
        return {
          prompt: t`Waves of frequency ${f1} Hz on a stretched string have a wavelength of ${lam1} m. What is the wavelength of ${f2} Hz waves on the same string, at the same tension?`,
          answer: lam2, units: 'm', tol: { rel: 0.005 },
          errors: [
            { value: (lam1 * f2) / f1, feedback: t`On one string $v = f\lambda$ is fixed, so a higher frequency means a *shorter* wavelength.` },
            { value: lam1, feedback: 'The wavelength is not a property of the string: the speed is. Same speed, different frequency, different wavelength.' },
          ],
          hints: [t`The string sets $v$: find it from the first wave, $v = f\lambda$.`, t`Then $\lambda_2 = v/f_2$.`],
          teach: 'On a given string v is fixed, so λ = v/f: frequency and wavelength are inversely proportional.',
          explain: t`$v = ${f1} \times ${lam1} = ${tn(f1 * lam1)}$ m/s, the same for any frequency on this string, so $\lambda_2 = ${tn(f1 * lam1)}/${f2} = ${tn(lam2)}$ m.`,
          visual: snapshot({ A: 1, lambda: lam1, x: [0, r6(3 * Math.max(lam1, lam2))], ylabel: 'y (cm)', caption: t`The ${f1} Hz wave on the string at one instant (wavelength ${lam1} m).` }),
        };
      },
    }),
    order({
      id: 'derive', difficulty: 3,
      prompt: t`Put the steps of the derivation of $v = \sqrt{F_T/\mu}$ in order.`,
      items: [
        t`Take a short piece of string, of length $\Delta x$ and mass $\mu\,\Delta x$, displaced a little sideways.`,
        t`The tension pulls each end of the piece along the string, so its sideways pull at each end is $F_T$ times the slope there.`,
        t`The slopes at the two ends differ, so the net sideways force is $F_T\,\dfrac{\partial^2 y}{\partial x^2}\,\Delta x$.`,
        t`Newton’s second law: $\mu\,\Delta x\,\dfrac{\partial^2 y}{\partial t^2} = F_T\,\dfrac{\partial^2 y}{\partial x^2}\,\Delta x$.`,
        t`Cancel $\Delta x$: $\dfrac{\partial^2 y}{\partial x^2} = \dfrac{\mu}{F_T}\dfrac{\partial^2 y}{\partial t^2}$, the wave equation with $1/v^2 = \mu/F_T$.`,
      ],
      hints: ['Start with the piece of string, then the forces on it, then Newton’s second law.', 'The wave equation comes last: it is what Newton’s second law becomes.'],
      teach: 'The wave speed comes out of Newton’s second law: tension supplies the restoring force and μ the inertia.',
      explain: t`Force from the change of slope across the piece, mass from $\mu\,\Delta x$, and $F = ma$ gives the wave equation, whose coefficient $1/v^2$ is $\mu/F_T$. (It assumes small slopes, so the tension stays $F_T$ and the pieces move only sideways.)`,
      visual: curvePicture({
        fn: '0.6*sin(x)', x: [0.1, 3.0], y: [0, 1.25], xlabel: 'x', ylabel: 'y', numbers: false,
        curves: [{ fn: '0.6*sin(x)', domain: [1, 2], color: 'gold', width: 4 }],
        arrows: [{ from: [1, 0.5049], to: [r6(1 - 0.6 * 0.9513), r6(0.5049 - 0.6 * 0.3084)], color: 'violet', label: 'tension', labelDx: -58, labelDy: -12 }, { from: [2, 0.5456], to: [r6(2 + 0.6 * 0.9702), r6(0.5456 - 0.6 * 0.2423)], color: 'violet', label: 'tension', labelDx: 4, labelDy: -12 }],
        caption: 'A short piece of a curved string (gold). The tension pulls each end along the string; the two pulls are tilted differently, so they leave a net force toward the axis. Slope exaggerated.',
      }),
    }),
    num({
      id: 'round-trip', difficulty: 3,
      gen(r) {
        const mu = r.pick([0.4, 0.6, 1.2]), tt = r.pick([0.6, 0.8, 1.0, 1.2]), L = 30;
        const v = (2 * L) / tt, F = mu * v * v;
        return {
          prompt: t`A ${L} m steel cable with $\mu = ${mu}$ kg/m is stretched between two anchors. A tap at one end sends a pulse along it; the pulse bounces off the far anchor and arrives back ${tt} s after the tap. What is the tension in the cable?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: mu * (L / tt) ** 2, feedback: t`In ${tt} s the pulse went there **and back**: $2 \times ${L}$ m.` },
            { value: mu * v, feedback: t`$F_T = \mu v^2$: square the speed.` },
          ],
          hints: ['Find the speed first. How far did the pulse travel in that time?', t`$v = 2L/t$, then $F_T = \mu v^2$.`],
          teach: t`Timing a pulse gives the speed, and the speed gives the tension: $F_T = \mu v^2$.`,
          explain: t`The pulse covered $2 \times ${L} = ${2 * L}$ m in ${tt} s, so $v = ${tn(v)}$ m/s and $F_T = \mu v^2 = ${mu} \times ${tn(v)}^2 = ${tn(F)}$ N. (A real cable’s stiffness and sag make this a little less exact; engineers correct for both.)`,
          visual: curvePicture({
            fn: '0.35*exp(-((x - 3)/0.5)^2)', x: [-0.5, 10.5], y: [-1.2, 1.4], numbers: false, xlabel: '', ylabel: '',
            curves: [seg([0, -0.8], [0, 0.8], { color: 'ink3', width: 5 }), seg([10, -0.8], [10, 0.8], { color: 'ink3', width: 5 })],
            arrows: [{ from: [4.2, 0.75], to: [8.8, 0.75], color: 'gold', label: 'out' }, { from: [8.8, -0.5], to: [4.2, -0.5], color: 'gold', label: 'back', labelDx: -36 }],
            caption: 'A pulse on a cable between two anchors: out to the far end and back again. Not to scale.',
          }),
        };
      },
    }),
    mcq({
      id: 'knot', difficulty: 2,
      prompt: 'A wave on a light string runs into a heavier string knotted to it, with the same tension in both. Which quantity is the same on both sides of the knot?',
      choices: ['The frequency', 'The speed', 'The wavelength', 'All three: a wave keeps its speed, frequency and wavelength wherever it goes'],
      answer: 0,
      why: {
        1: t`The speed belongs to the string: the heavier string, with larger $\mu$, carries waves more slowly.`,
        2: t`$\lambda = v/f$: lower speed at the same frequency means a shorter wavelength in the heavy string.`,
        3: 'Speed is a property of the medium, so it changes at the knot — and the wavelength with it.',
      },
      hints: ['The knot belongs to both strings. How often does it go up and down?', t`Speed depends on $\mu$; then $\lambda = v/f$.`],
      teach: 'Crossing into a new medium, a wave keeps its frequency (set by the source); its speed and wavelength change.',
      explain: t`The knot moves with both strings, so both oscillate at the same frequency. With four times the $\mu$, the heavy string has half the speed, $\sqrt{F_T/4\mu}$, and so half the wavelength. Part of the wave also reflects back from the knot.`,
      visual: curvePicture({
        fn: '(1 - step(x - 4))*sin(pi*x/2) + step(x - 4)*0.667*sin(pi*(x - 4))', x: [0, 8], y: [-1.4, 1.4], ylabel: 'y (cm)',
        points: [{ x: 4, y: 0, color: 'warn', r: 6, label: 'knot', labelDy: 14 }, label(0.3, 1.25, 'light string', 'ink2'), label(5.2, 1.25, 'heavy string (4× μ)', 'ink2')],
        caption: 'A sketch of a wave crossing a knot into a string four times heavier per metre, at the same tension. The part reflected at the knot is not drawn.',
      }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-guitar', difficulty: 2,
      gen(r) {
        const mug = r.pick([0.4, 0.6, 1.1, 2.4]), F = r.pick([60, 70, 80]);
        const v = speed(F, mug / 1000);
        return {
          prompt: t`A steel guitar string has a linear density of ${mug} g/m and is tuned to a tension of ${F} N. How fast do waves travel along it?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: speed(F, mug), feedback: 'Convert g/m to kg/m first: divide by 1000.' }],
          hints: [t`Convert $\mu$ to kg/m, then $v = \sqrt{F_T/\mu}$.`],
          teach: t`Use SI units — kg/m for $\mu$ — in $v = \sqrt{F_T/\mu}$.`,
          explain: t`$\mu = ${mug}\ \text{g/m} = ${tn(mug / 1000)}$ kg/m, so $v = \sqrt{${F}/${tn(mug / 1000)}} = ${tn(v)}$ m/s — fast, because a guitar string is very light for its tension.`,
          visual: stringRig({ top: `μ = ${mug} g/m`, side: `tension ${F} N`, caption: 'A string held at a set tension (on a guitar, by the tuning peg rather than a weight). Not to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-guy', difficulty: 3, transfer: true,
      gen(r) {
        const mu = r.pick([1.2, 1.6, 2.0]), tt = r.pick([0.4, 0.45, 0.5]), L = 50;
        const v = L / tt, F = mu * v * v;
        return {
          prompt: t`Tall masts at a launch range — for tracking antennas and lightning protection — are held up by steel guy cables, and their tensions must be checked. On one guy cable with $\mu = ${mu}$ kg/m, an engineer times a pulse travelling between two sensors ${L} m apart: it takes ${tt} s. What is the tension, in kN? Treat the cable as a flexible string.`,
          answer: F / 1000, units: 'kN', tol: { rel: 0.01 },
          errors: [
            { value: (mu * v) / 1000, feedback: t`$F_T = \mu v^2$: the speed is squared.` },
            { value: (mu * (2 * L / tt) ** 2) / 1000, feedback: 'The pulse went one way, 50 m, between the sensors — not there and back.' },
          ],
          hints: [t`Speed first: $v = d/t$.`, t`$F_T = \mu v^2$; then convert N to kN.`],
          teach: t`Measuring the wave speed on a cable measures its tension: $F_T = \mu v^2$.`,
          explain: t`$v = ${L}/${tt} = ${tn(v)}$ m/s, so $F_T = \mu v^2 = ${mu} \times ${tn(v)}^2 = ${tn(F)}$ N $= ${tn(F / 1000)}$ kN. Methods like this — timing pulses, or measuring a cable’s vibration frequencies — let engineers check tensions without cutting anything.`,
          visual: curvePicture({
            fn: null, x: [-0.5, 10.5], y: [-0.4, 6.2], equal: true, numbers: false, axes: false, grid: false, xlabel: '', ylabel: '',
            curves: [seg([8, 0], [8, 6], { color: 'ink3', width: 5 }), seg([0, 0], [8, 5.5], { color: 'accent', width: 2.2 }), seg([-0.5, 0], [10.5, 0], { color: 'ink4', width: 1.5 }),
              { param: ['0.8241*t - 0.5665*0.4*exp(-((t - 4.6)/0.45)^2)', '0.5665*t + 0.8241*0.4*exp(-((t - 4.6)/0.45)^2)'], t: [3.3, 5.9], color: 'gold', width: 2.6 }],
            points: [{ x: 1.6482, y: 1.133, color: 'good', r: 5, label: 'sensor', labelDx: -54, labelDy: -2 }, { x: 6.5928, y: 4.532, color: 'good', r: 5, label: 'sensor', labelDx: 10, labelDy: 8 }, label(8.25, 3, 'mast', 'ink3')],
            caption: 'A guy cable from the ground to a mast, with a pulse (gold) running up it between two sensors. Not to scale.',
          }),
        };
      },
    }),
    mcq({
      id: 'cp-frequency', difficulty: 2,
      prompt: 'A student shaking one end of a long stretched spring doubles the frequency of her shaking. What happens to the waves on the spring?',
      choices: ['The speed stays the same; the wavelength halves', 'The speed doubles; the wavelength stays the same', 'The speed doubles and the wavelength halves', 'Nothing changes: the frequency does not affect the wave'],
      answer: 0,
      why: {
        1: 'Faster shaking does not make a faster wave: the spring’s tension and mass per metre set the speed.',
        2: t`If the speed doubled and the wavelength halved, $f\lambda$ would be unchanged — so the frequency could not have doubled.`,
        3: t`The frequency is the wave’s frequency: it doubles, and since $v = f\lambda$ is fixed, $\lambda$ must halve.`,
      },
      hints: ['What sets the speed of a wave on the spring?', t`With $v$ fixed, $\lambda = v/f$.`],
      teach: 'The medium fixes v; doubling f halves λ.',
      explain: t`The spring sets $v = \sqrt{F_T/\mu}$, unchanged. The crests now come twice as often but move just as fast, so they are half as far apart: $\lambda = v/f$ halves.`,
      visual: { type: 'wave-string', params: { mode: 'medium', drive: 'wave', controls: false, play: false, readout: false, time: 1.8, fw: 1, Aw: 0.25 }, caption: 'The spring (drawn as a rope) being shaken at the original frequency; the front of the wave train is marked.' },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §16.3 Wave Speed on a Stretched String', url: 'https://openstax.org/books/university-physics-volume-1/pages/16-3-wave-speed-on-a-stretched-string' },
    { label: 'M. C. Wittmann, R. N. Steinberg and E. F. Redish, “Making sense of how students make sense of mechanical waves”, The Physics Teacher 37, 15 (1999)', url: 'https://arxiv.org/abs/physics/0207092' },
  ],
});
