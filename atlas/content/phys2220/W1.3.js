// Superposition and interference: displacements add. Pulses pass through each
// other; same-frequency waves combine into one wave whose amplitude depends on
// the phase difference, which a path difference produces.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, s3, r6, curvePicture, label, twoSources, michelson } from './_waves.js';

const t = String.raw;
const D2R = Math.PI / 180;
const V_SOUND = 343;                       // m/s, air at 20 °C
/** Amplitude of the sum of two same-frequency waves. */
const res = (A1, A2, deg) => Math.sqrt(A1 * A1 + A2 * A2 + 2 * A1 * A2 * Math.cos(deg * D2R));
/** Keep only the slips whose value differs from the key. */
const apart = (errs, key) => errs.filter((e) => Math.abs(e.value - key) > 0.02 * Math.abs(key) + 1e-9);

/** Two pulses on a string: triangle-free smooth bumps of heights h1, h2 centred at c1, c2 (m), with their sum. */
function pulsePair({ h1, h2, c1 = 2.5, c2 = 7.5, sum = false, caption }) {
  const b = (h, c) => `${r6(h)}*cos(pi*(x - ${r6(c)})/1.6)^2*step(0.8 - abs(x - ${r6(c)}))`;
  const lo = Math.min(0, h1, h2, sum ? h1 + h2 : 0), hi = Math.max(0, h1, h2, sum ? h1 + h2 : 0);
  return curvePicture({
    fn: null, x: [0, 10], y: [r6(lo - 1.2), r6(hi + 1.4)], ylabel: 'y (cm)',
    curves: [{ fn: b(h1, c1), color: 'accent', width: 2.4 }, { fn: b(h2, c2), color: 'warn', width: 2.4 }, ...(sum ? [{ fn: `${b(h1, c1)} + ${b(h2, c2)}`, color: 'good', width: 2.8 }] : [])],
    arrows: [{ from: [r6(c1 - 0.6), r6(hi + 0.7)], to: [r6(c1 + 1.2), r6(hi + 0.7)], color: 'accent' }, { from: [r6(c2 + 0.6), r6(hi + 0.7)], to: [r6(c2 - 1.2), r6(hi + 0.7)], color: 'warn' }],
    caption,
  });
}

export default lesson({
  id: 'phys2220.W1.3',
  title: 'Superposition and interference',
  minutes: 12, difficulty: 2,
  intro: t`When two waves are in the same place at the same time, the medium’s displacement is simply the **sum** of the displacements each wave would cause alone. This is **superposition**; it holds whenever the medium responds in proportion to the push (small amplitudes). Pulses pass straight through each other and come out unchanged. Two waves with the same frequency add up to one wave of that frequency, whose amplitude depends on how far out of step they are — their **phase difference** $\phi$:

$$y = y_1 + y_2, \qquad A_\text{res} = 2A\left|\cos\tfrac{\phi}{2}\right|, \qquad \phi = 2\pi\,\frac{\Delta r}{\lambda}$$

In step ($\phi = 0, 2\pi, \ldots$) they reinforce: **constructive** interference. Half a cycle apart ($\phi = \pi, 3\pi, \ldots$) they cancel: **destructive** interference. Two sources in step produce exactly such a phase difference wherever their waves have travelled different distances.`,
  symbols: [
    { tex: 'y_1,\\ y_2', text: 'the displacements each wave would cause on its own, in m' },
    { tex: 'y', text: 'the actual displacement of the medium: their sum' },
    { tex: 'A', text: 'the amplitude of each of two equal waves, in m' },
    { tex: 'A_\\text{res}', text: 'the amplitude of the combined wave, from $2A$ (in step) down to $0$ (opposite)' },
    { tex: '\\phi', text: 'the phase difference, in rad (or degrees): how far one wave’s cycle is shifted from the other’s. $2\\pi$ rad $= 360°$ is a whole cycle' },
    { tex: '\\Delta r', text: 'the path difference: how much farther one wave has travelled than the other, in m' },
    { tex: '\\lambda', text: 'the wavelength, in m. Each extra wavelength of path adds a whole cycle, $2\\pi$, of phase' },
  ],
  why: 'Superposition is how noise-cancelling headphones work, how interferometers such as LIGO measure lengths far smaller than an atom, and — later — why electrons and photons make interference patterns.',
  visual: {
    type: 'wave-string',
    title: 'Waves add',
    lead: t`Two pulses head for each other along a string. Dashed: each pulse as it would be alone; green: the string, their sum. Drag the time slider through the moment they overlap — then switch to two waves travelling together and change the phase difference.`,
    tasks: [
      'Make the right pulse an upside-down copy of the left (−0.8 m): at t = 1.5 s the string is flat for an instant, then both pulses come out unchanged.',
      'With two upright pulses, the string where they overlap is as tall as both heights added.',
      'Switch to Two waves and slide φ from 0° to 180°: the sum shrinks from A₁ + A₂ to |A₁ − A₂|, which is zero when the amplitudes are equal.',
    ],
    params: { mode: 'two', kind: 'pulses', h1: 0.8, h2: 0.5 },
  },
  example: {
    prompt: t`Two waves travel the same way along a string with the same frequency and the same amplitude, 4.0 mm, but one is $60°$ ahead of the other in its cycle. What is the amplitude of the wave on the string? What phase difference would make it 4.0 mm, and what path difference produces that phase difference?`,
    visual: curvePicture({
      fn: null, x: [0, 4], y: [-9, 10], ylabel: 'y (mm)',
      curves: [{ fn: '4*sin(pi*x)', color: 'accent', width: 1.6, dash: true }, { fn: '4*sin(pi*x + pi/3)', color: 'warn', width: 1.6, dash: true }, { fn: '6.928*sin(pi*x + pi/6)', color: 'good', width: 2.8 }],
      points: [label(0.05, 8.6, 'dashed: each wave alone · green: their sum', 'ink2')],
      caption: 'The two 4.0 mm waves (dashed), 60° apart, and the string’s actual shape, their sum (green), at one instant. Wavelength 2 m.',
    }),
    steps: [
      { label: 'Add the waves', text: t`$A\sin\theta + A\sin(\theta + \phi) = 2A\cos\tfrac{\phi}{2}\,\sin\!\left(\theta + \tfrac{\phi}{2}\right)$, from $\sin a + \sin b = 2\cos\tfrac{a - b}{2}\sin\tfrac{a + b}{2}$. The sum is a wave of the same frequency with amplitude $2A|\cos(\phi/2)|$.` },
      { label: 'At 60°', text: t`$A_\text{res} = 2(4.0)\cos 30° = 6.9$ mm — more than either wave, less than their sum of 8.0 mm.` },
      { label: 'For 4.0 mm', text: t`$2(4.0)\cos(\phi/2) = 4.0$ needs $\cos(\phi/2) = \tfrac12$, so $\phi/2 = 60°$ and $\phi = 120°$.` },
      { label: 'Path difference', text: t`A whole wavelength of extra path is $360°$, so $120°$ needs $\Delta r = \tfrac{120}{360}\lambda = \lambda/3$.` },
      { label: 'Sense check', text: t`$\phi = 0$ gives $8.0$ mm and $\phi = 180°$ gives $0$; 60° and 120° fall in between, in order. ✓` },
    ],
    answer: t`$A_\text{res} = 6.9$ mm; it is 4.0 mm at $\phi = 120°$, which a path difference of $\lambda/3$ produces.`,
  },
  practice: [
    num({
      id: 'pulses-add', difficulty: 1,
      gen(r) {
        const h1 = r.pick([2, 3, 4]), h2 = r.pick([-2.5, -1, 1.5, 2, 5]);
        return {
          prompt: t`Two pulses approach each other on a string: one ${h1} cm high, the other ${h2 < 0 ? `inverted, ${-h2} cm deep` : `${h2} cm high`}. They have the same width. At the instant their centres pass through the same point, what is the string’s displacement there? (Give a sign: up is positive.)`,
          answer: h1 + h2, units: 'cm', tol: { rel: 0.005, abs: 0.01 },
          errors: apart([{ value: Math.abs(h1) + Math.abs(h2), feedback: 'An inverted pulse displaces the string downward: add the displacements with their signs.' }, { value: Math.max(h1, Math.abs(h2)), feedback: 'Neither pulse wins: the displacements add.' }], h1 + h2),
          hints: ['Superposition: add what each pulse alone would do at that point.', 'Down counts as negative.'],
          teach: 'Where waves overlap, the displacement is the sum of the separate displacements, signs included.',
          explain: t`$y = y_1 + y_2 = ${h1} + (${h2}) = ${h1 + h2}$ cm. A moment later the pulses separate again, each unchanged.`,
          visual: pulsePair({ h1, h2, caption: 'The two pulses before they meet, moving toward each other (arrows).' }),
        };
      },
    }),
    mcq({
      id: 'flat-string', difficulty: 2,
      prompt: 'An upright pulse and an equal upside-down pulse meet on a string. At the instant they exactly overlap, the string is perfectly flat. Where is the energy the pulses carried?',
      choices: ['In the string’s motion: it is flat for an instant but moving fast', 'Nowhere: it is destroyed, then recreated as the pulses separate', 'It has turned into heat in the collision', 'It is stored in the stretching of the flat string'],
      answer: 0,
      why: {
        1: 'Energy is conserved at every instant. Nothing destroys it and then recreates it.',
        2: 'The pulses come out unchanged afterwards, so no energy went into heat.',
        3: 'A flat string is stretched least, not most. At that instant the energy is all kinetic.',
      },
      hints: ['A moment later the pulses reappear unchanged. Something must have been happening in the flat string.', 'Is a flat string necessarily at rest?'],
      teach: 'Superposed displacements can cancel while the string’s velocity does not: a flat string can be moving fast.',
      explain: t`At the overlap the two displacements cancel, but the velocities add: the left half of the string is moving one way and the right half the other, as fast as anywhere in either pulse. All the energy is kinetic for that instant, and that motion rebuilds the two pulses.`,
      visual: { type: 'wave-string', params: { mode: 'two', kind: 'pulses', h1: 0.8, h2: -0.8, time: 1.5, controls: false, play: false, readout: false }, caption: 'The instant of exact overlap: dashed lines are the two pulses as each would be alone; the string itself (green) is flat.' },
    }),
    num({
      id: 'resultant', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 5]), ph = r.pick([40, 60, 90, 150]);
        const R = 2 * A * Math.abs(Math.cos((ph / 2) * D2R));
        return {
          prompt: t`Two waves of the same frequency and amplitude, ${A} mm each, travel together along a string with a phase difference of $${ph}°$. What is the amplitude of the resulting wave?`,
          answer: R, units: 'mm', tol: { rel: 0.01 },
          errors: apart([
            { value: 2 * A, feedback: t`$2A$ is the in-step case, $\phi = 0$. With a phase difference the amplitude is $2A|\cos(\phi/2)|$.` },
            { value: 2 * A * Math.abs(Math.cos(ph * D2R)), feedback: t`Use half the phase difference: $2A|\cos(\phi/2)|$.` },
          ], R),
          hints: [t`$A_\text{res} = 2A|\cos(\phi/2)|$.`],
          teach: 'Two equal same-frequency waves add to amplitude 2A|cos(φ/2)|.',
          explain: t`$A_\text{res} = 2(${A})\cos(${ph / 2}°) = ${tn(R)}$ mm.`,
          visual: curvePicture({
            fn: null, x: [0, 4], y: [-2.6 * A, 2.6 * A], ylabel: 'y (mm)',
            curves: [{ fn: `${A}*sin(pi*x)`, color: 'accent', width: 2 }, { fn: `${A}*sin(pi*x + ${r6(ph * D2R)})`, color: 'warn', width: 2, dash: true }],
            caption: `The two waves at one instant (solid and dashed), ${ph}° apart. Their sum is not drawn.`,
          }),
        };
      },
    }),
    num({
      id: 'phase-from-path', difficulty: 2,
      gen(r) {
        const lam = r.pick([0.5, 0.8, 1.2]), q = r.pick([0.25, 0.4, 0.6, 0.75]);
        const dr = lam * q, phi = 360 * q;
        const r1 = r.pick([2.5, 3, 3.5]);
        return {
          prompt: t`Two loudspeakers driven in step emit sound of wavelength ${lam} m. A microphone is ${s3(r1, 4)} m from one speaker and ${s3(r1 + dr, 4)} m from the other. What is the phase difference between the two waves at the microphone, in degrees?`,
          answer: phi, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: q, feedback: t`That is the path difference in wavelengths. Each wavelength is $360°$: multiply by 360.` }, { value: (360 * lam) / dr, feedback: t`Upside down: $\phi = 360° \times \Delta r/\lambda$.` }],
          hints: [t`Path difference first: $\Delta r = r_2 - r_1$.`, t`$\phi = 360° \times \Delta r/\lambda$.`],
          teach: 'Each wavelength of path difference shifts the phase by 360°.',
          explain: t`$\Delta r = ${s3(r1 + dr, 4)} - ${s3(r1, 4)} = ${s3(dr)}$ m $= ${q}\lambda$, so $\phi = ${q} \times 360° = ${tn(phi)}°$ (or $${tn(phi * D2R)}$ rad).`,
          visual: twoSources({ l1: `${s3(r1, 4)} m`, l2: `${s3(r1 + dr, 4)} m`, who: 'mic', caption: 'Two speakers driven in step and a microphone, with the distance from each. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'which-kind', difficulty: 2,
      gen(r) {
        const lam = r.pick([0.4, 0.5, 0.8]), m = r.pick([1, 2, 3, 4, 5]), r1 = r.pick([2, 2.5, 3]);
        const r2 = r1 + (m * lam) / 2, construct = m % 2 === 0;
        const whyIn = t`For that, $\Delta r$ must be a whole number of wavelengths; here it is $${m / 2}\lambda$.`;
        const whyOut = t`For that, $\Delta r$ must be a whole number plus a half of wavelengths; here it is $${m / 2}\lambda$.`;
        return {
          prompt: t`Two speakers driven in step emit a tone of wavelength ${lam} m. A listener stands ${s3(r1)} m from one and ${s3(r2)} m from the other. What kind of interference does she hear?`,
          choices: ['Constructive: the waves arrive in step', 'Destructive: the waves arrive half a cycle apart', 'Partly constructive: they are neither in step nor opposite', 'There is no way to tell without the frequency'],
          answer: construct ? 0 : 1,
          why: {
            ...(construct ? { 1: whyOut } : { 0: whyIn }),
            2: t`$\Delta r/\lambda = ${m / 2}$ exactly, so the waves are exactly ${construct ? 'in step' : 'opposite'}.`,
            3: t`The wavelength is given, and it is all you need: compare $\Delta r$ with $\lambda$.`,
          },
          hints: [t`Find $\Delta r$ and divide by $\lambda$.`, 'A whole number means in step; a whole number plus a half means opposite.'],
          teach: 'Path differences of whole wavelengths give constructive interference; whole-plus-half wavelengths give destructive.',
          explain: t`$\Delta r = ${s3(r2)} - ${s3(r1)} = ${s3(r2 - r1)}$ m $= ${m / 2}\lambda$: ${construct ? 'a whole number of wavelengths, so the waves arrive in step — constructive' : 'a whole number plus a half, so they arrive half a cycle apart — destructive'}.`,
          visual: twoSources({ l1: `${s3(r1)} m`, l2: `${s3(r2)} m`, who: 'listener', caption: 'Two speakers driven in step and a listener, with the distance from each. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'lowest-quiet', difficulty: 3,
      gen(r) {
        const dr = r.pick([0.25, 0.4, 0.5, 0.85]);
        const f = V_SOUND / (2 * dr);
        return {
          prompt: t`Two speakers driven in step play the same tone. A listener is ${dr} m farther from one speaker than from the other. What is the **lowest** frequency for which she hears destructive interference? (Speed of sound 343 m/s.)`,
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: V_SOUND / dr, feedback: t`With $\Delta r = \lambda$ the waves arrive in step — constructive. Destructive first happens when $\Delta r = \lambda/2$.` }, { value: V_SOUND / (4 * dr), feedback: t`Destructive needs $\Delta r = \lambda/2$, so $\lambda = 2\Delta r$, not $4\Delta r$.` }],
          hints: ['Destructive interference needs Δr = λ/2, 3λ/2, 5λ/2, …', t`The longest such wavelength is $\lambda = 2\Delta r$; then $f = v/\lambda$.`],
          teach: 'Destructive interference first appears when the path difference is half a wavelength.',
          explain: t`The longest wavelength that cancels has $\Delta r = \lambda/2$, so $\lambda = 2(${dr}) = ${2 * dr}$ m and $f = 343/${2 * dr} = ${tn(f)}$ Hz. Odd multiples of this frequency cancel too.`,
          visual: twoSources({ l1: 'r', l2: `r + ${dr} m`, who: 'listener', caption: 'Two speakers driven in step and a listener. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'least-amplitude', difficulty: 2,
      gen(r) {
        const [A1, A2] = r.pick([[0.6, 1.5], [0.9, 0.5], [1.2, 0.3], [1.0, 1.4]]);
        return {
          prompt: t`Two waves of the same frequency travel together along a string, with amplitudes ${A1} cm and ${A2} cm. By changing the phase difference between them, what is the **smallest** amplitude the combined wave can have?`,
          answer: Math.abs(A1 - A2), units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: A1 + A2, feedback: 'That is the largest, with the waves in step. The smallest comes when they are opposite.' }, { value: Math.sqrt(A1 * A1 + A2 * A2), feedback: 'That is the amplitude at a 90° phase difference. Opposite waves (180°) give the smallest sum.' }],
          hints: ['The smallest sum comes when the waves are exactly opposite (φ = 180°).', 'Then one wave’s crests sit in the other’s troughs.'],
          teach: 'Unequal waves can never cancel completely: the combined amplitude ranges from |A₁ − A₂| to A₁ + A₂.',
          explain: t`At $\phi = 180°$ the crests of one wave fill the troughs of the other, leaving $|${A1} - ${A2}| = ${tn(Math.abs(A1 - A2))}$ cm. Complete cancellation needs equal amplitudes.`,
          visual: { type: 'wave-string', params: { mode: 'two', kind: 'waves', A1, A2, phase: 90, controls: false, play: false, readout: false }, caption: `The two waves (dashed) and their sum (green) at a 90° phase difference.` },
        };
      },
    }),
    mcq({
      id: 'anti-noise', difficulty: 2,
      prompt: 'Noise-cancelling headphones play “anti-noise” into your ear. To cancel a steady 200 Hz hum, the anti-noise at your ear must be:',
      choices: ['200 Hz, the same amplitude, half a cycle out of step', '200 Hz, the same amplitude, exactly in step', '200 Hz but much louder than the hum', 'A different frequency, such as 400 Hz'],
      answer: 0,
      why: {
        1: 'In step, the two would add: the hum would get twice as strong.',
        2: 'Unequal amplitudes cannot cancel: a louder anti-noise leaves the difference behind, half a cycle out of step.',
        3: 'Waves of different frequencies drift in and out of step, so they cannot cancel at every instant.',
      },
      hints: ['For the sum to be zero at every instant, the anti-noise must be the hum turned upside down.'],
      teach: 'Complete cancellation needs the same frequency, the same amplitude and a phase difference of half a cycle.',
      explain: t`Upside down is the same as half a cycle ($180°$) out of step. Then at every instant $y_\text{hum} + y_\text{anti} = 0$. Real headphones measure the noise with a microphone and adjust continuously; they cancel steady low hums far better than sudden sounds.`,
      visual: curvePicture({ fn: 'sin(2*pi*200*x)', x: [0, 0.02], y: [-1.6, 1.6], xlabel: 't (s)', ylabel: 'pressure', numbers: true, caption: 'The hum at your ear: a 200 Hz pressure oscillation (arbitrary units).' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-general', difficulty: 3,
      gen(r) {
        const A1 = r.pick([2, 3, 4]), A2 = r.pick([1, 5, 6]), ph = r.pick([60, 90, 120]);
        const R = res(A1, A2, ph);
        return {
          prompt: t`Two waves of the same frequency and direction, with amplitudes ${A1} mm and ${A2} mm and a phase difference of $${ph}°$, travel along a string. The amplitude of their sum is $\sqrt{A_1^2 + A_2^2 + 2A_1A_2\cos\phi}$. What is it?`,
          answer: R, units: 'mm', tol: { rel: 0.01 },
          errors: apart([{ value: A1 + A2, feedback: 'Simply adding the amplitudes is the in-step case only.' }, { value: Math.sqrt(A1 * A1 + A2 * A2), feedback: t`Keep the cross term $2A_1A_2\cos\phi$.` }], R),
          hints: [t`Substitute into $\sqrt{A_1^2 + A_2^2 + 2A_1A_2\cos\phi}$.`, t`$\cos ${ph}° = ${s3(Math.cos(ph * D2R))}$.`],
          teach: 'Same-frequency waves combine with amplitude √(A₁² + A₂² + 2A₁A₂ cos φ).',
          explain: t`$\sqrt{${A1}^2 + ${A2}^2 + 2(${A1})(${A2})\cos ${ph}°} = ${tn(R)}$ mm.`,
          visual: { type: 'wave-string', params: { mode: 'two', kind: 'waves', A1: A1 / 4, A2: A2 / 4, phase: ph, controls: false, play: false, readout: false }, caption: 'The two waves (dashed), drawn at a quarter of their sizes, and their sum (green).' },
        };
      },
    }),
    num({
      id: 'cp-ligo', difficulty: 3, transfer: true,
      prompt: t`LIGO is a Michelson interferometer: laser light is split down two perpendicular arms, bounces off mirrors at the far ends, and the two returning beams recombine at a detector. If one arm’s mirror moves outward by $\Delta L$, light in that arm travels $2\Delta L$ farther. LIGO’s laser has $\lambda = 1064$ nm. If the output is bright (constructive), how far must one mirror move to make it dark?`,
      answer: 266, units: 'nm', tol: { rel: 0.01 },
      errors: [{ value: 532, feedback: t`Moving the mirror by $\Delta L$ changes the path by $2\Delta L$ — the light goes there and back.` }, { value: 1064, feedback: 'A whole wavelength of path brings the beams back in step: bright again.' }],
      hints: ['Bright to dark needs an extra half wavelength of path difference.', t`$2\Delta L = \lambda/2$.`],
      teach: 'In an interferometer, moving a mirror by λ/4 changes the round-trip path by λ/2 and swaps bright for dark.',
      explain: t`Dark needs the path difference to change by $\lambda/2 = 532$ nm, and moving a mirror by $\Delta L$ changes the path by $2\Delta L$, so $\Delta L = \lambda/4 = 266$ nm. LIGO detects arm changes near $10^{-18}$ m — far smaller than this — by working near the dark setting, measuring tiny changes in brightness, and folding the light back and forth hundreds of times in each 4 km arm.`,
      visual: michelson({ caption: 'A Michelson interferometer such as LIGO, from above (not to scale). Moving one end mirror changes that arm’s round-trip path by twice the distance moved.' }),
    }),
    mcq({
      id: 'cp-walk', difficulty: 2,
      prompt: 'Two speakers side by side play the same steady tone, driven in step. You walk slowly along a line in front of them. What do you hear?',
      choices: ['The tone grows loud and soft, again and again, as you walk', 'The same loudness everywhere: twice as loud as one speaker', 'Silence everywhere: the two waves cancel', 'The pitch rises and falls as you walk'],
      answer: 0,
      why: {
        1: 'The path difference changes as you walk, so the waves arrive sometimes in step and sometimes opposite.',
        2: 'The waves cancel only where the path difference is a whole-plus-half number of wavelengths, not everywhere.',
        3: 'Interference changes the amplitude, not the frequency: the pitch stays the same.',
      },
      hints: ['How does the path difference change as you move sideways?'],
      teach: 'Two sources in step make a pattern of loud and quiet places as the path difference changes.',
      explain: t`Directly in front of the midpoint the paths are equal: loud. Moving sideways, the path difference grows: quiet where it reaches $\lambda/2$, loud again at $\lambda$, and so on. (Real rooms blur the pattern with echoes.)`,
      visual: twoSources({ s1: [0, 0.8], s2: [0, -0.8], P: [6, 1.6], l1: 'r₁', l2: 'r₂', who: 'you', path: [[6, -3], [6, 3.2]], caption: 'Two speakers driven in step; you walk along the dashed line. Not to scale.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §16.5 Interference of Waves', url: 'https://openstax.org/books/university-physics-volume-1/pages/16-5-interference-of-waves' },
    { label: 'LIGO Laboratory, “LIGO’s Interferometer”', url: 'https://www.ligo.caltech.edu/page/ligos-ifo' },
  ],
});
