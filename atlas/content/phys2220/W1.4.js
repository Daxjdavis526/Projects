// Standing waves and normal modes: waves reflecting back and forth on a string
// fixed at both ends reinforce only when a whole number of half-wavelengths
// fits, so the string has a ladder of resonant frequencies f_n = n v / 2L.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { tn, s3, r6, standingPicture, stringRig } from './_waves.js';

const t = String.raw;
const L_GUITAR = 0.648;                       // m, a common guitar scale length

/** Fundamental frequency of a string, Hz. */
const f1Of = (L, F, mu) => Math.sqrt(F / mu) / (2 * L);

export default lesson({
  id: 'phys2220.W1.4',
  title: 'Standing waves and normal modes',
  minutes: 12, difficulty: 2,
  intro: t`Waves on a string fixed at both ends reflect from the ends and run back and forth, superposing. Two equal waves travelling in opposite directions add up to a **standing wave**, $y = 2A\sin kx\cos\omega t$: a pattern that does not travel, with **nodes** that never move and **antinodes** that swing the most. Both ends are held still, so both must be nodes — which only works if a whole number of half-wavelengths fits on the string, $L = n\lambda/2$. That allows only certain frequencies:

$$f_n = \frac{n v}{2L} = \frac{n}{2L}\sqrt{\frac{F_T}{\mu}}, \qquad n = 1, 2, 3, \ldots$$

These are the string’s **normal modes**: the **fundamental** $f_1$ and its **harmonics** $2f_1, 3f_1, \ldots$ Shake the string at one of them and it **resonates**, swinging far more than the shaking; at any other frequency it hardly moves.`,
  symbols: [
    { tex: 'f_n', text: 'the frequency of the $n$th normal mode, in Hz' },
    { tex: 'n', text: 'the mode number, 1, 2, 3, …: the number of loops (half-wavelengths) on the string' },
    { tex: 'L', text: 'the length of the vibrating string, between the two fixed ends, in m' },
    { tex: 'v = \\sqrt{F_T/\\mu}', text: 'the wave speed on the string, in m/s, from its tension $F_T$ (N) and mass per metre $\\mu$ (kg/m)' },
    { tex: '\\lambda_n = 2L/n', text: 'the wavelength of mode $n$: neighbouring nodes are $\\lambda_n/2$ apart' },
  ],
  why: 'Every instrument, every resonating structure and — in quantum mechanics — every particle in a box has a ladder of normal modes; the string is where you first see why only certain frequencies are allowed.',
  visual: {
    type: 'wave-string',
    title: 'Find the string’s resonances',
    lead: t`A 1 m string, fixed at the right, is shaken up and down by a tiny amount at its left end. Sweep the driving frequency and watch the response curve underneath: the string comes alive only at certain frequencies.`,
    tasks: [
      'Sweep f slowly up from 0: the string resonates at 50, 100, 150 Hz… with one, two, three loops.',
      'Between the peaks the string barely moves: the reflected waves arrive out of step and undo each other.',
      'Raise the tension from 50 N to 200 N: v doubles (√4), and every resonance moves up by a factor of 2.',
    ],
    params: { mode: 'standing', show: 'drive', fd: 40, FT: 50 },
  },
  example: {
    prompt: t`A string 0.80 m long with $\mu = 4.0$ g/m is stretched between two fixed points with a tension of 160 N. Find its fundamental frequency and the next two harmonics, and the positions of the nodes when it vibrates in its third mode.`,
    visual: standingPicture({ n: 3, L: 0.8, caption: 'The string in its third mode: three loops, four nodes (orange) including the ends. The solid line is the string at one moment, the dashed lines the limits of its swing. Height exaggerated.' }),
    steps: [
      { label: 'Wave speed', text: t`$v = \sqrt{F_T/\mu} = \sqrt{160/0.0040} = 200$ m/s.` },
      { label: 'Fundamental', text: t`$f_1 = v/2L = 200/(2 \times 0.80) = 125$ Hz: half a wavelength fills the string, so $\lambda_1 = 1.60$ m.` },
      { label: 'Harmonics', text: t`$f_2 = 2f_1 = 250$ Hz and $f_3 = 3f_1 = 375$ Hz.` },
      { label: 'Nodes of mode 3', text: t`Three half-wavelengths fit, so $\lambda_3/2 = 0.80/3 = 0.267$ m. Nodes at $x = 0$, $0.267$, $0.533$ and $0.80$ m.` },
      { label: 'Sense check', text: t`$f_3\lambda_3 = 375 \times 0.533 = 200$ m/s $= v$. ✓ Every mode travels at the string’s one speed.` },
    ],
    answer: t`$f_1 = 125$ Hz, $f_2 = 250$ Hz, $f_3 = 375$ Hz; mode-3 nodes at 0, 26.7, 53.3 and 80 cm.`,
  },
  practice: [
    num({
      id: 'fundamental', difficulty: 1,
      gen(r) {
        const L = r.pick([0.6, 0.65, 0.8, 1.0]), F = r.pick([60, 80, 100, 150]), mu = r.pick([0.002, 0.004, 0.006]);
        const v = Math.sqrt(F / mu), f1 = v / (2 * L);
        return {
          prompt: t`A string ${L} m long, with $\mu = ${mu}$ kg/m, is fixed at both ends under a tension of ${F} N. What is its fundamental frequency?`,
          answer: f1, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: v / L, feedback: t`The fundamental fits **half** a wavelength on the string: $\lambda_1 = 2L$, so $f_1 = v/2L$.` }, { value: v, feedback: t`That is the wave speed. Divide by $\lambda_1 = 2L$.` }],
          hints: [t`Find $v = \sqrt{F_T/\mu}$ first.`, t`$f_1 = v/2L$.`],
          teach: t`A string fixed at both ends has fundamental $f_1 = v/2L$: half a wavelength fills it.`,
          explain: t`$v = \sqrt{${F}/${mu}} = ${tn(v)}$ m/s, so $f_1 = ${tn(v)}/(2 \times ${L}) = ${tn(f1)}$ Hz.`,
          visual: standingPicture({ n: 1, L, caption: 'The fundamental: one loop, with nodes only at the fixed ends. Height exaggerated.' }),
        };
      },
    }),
    num({
      id: 'count-loops', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]), f1 = r.pick([40, 55, 80, 110]);
        const f = n * f1;
        return {
          prompt: t`A string fixed at both ends vibrates in the pattern shown, at ${f} Hz. What is its fundamental frequency?`,
          answer: f1, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: f / (n + 1), feedback: 'Count the loops, not the nodes: the ends are nodes too, so there is always one more node than loops.' }, { value: f * n, feedback: t`Higher modes have higher frequencies: $f_n = nf_1$, so $f_1 = f_n/n$.` }],
          hints: ['Count the loops between the fixed ends: that is n.', t`$f_n = n f_1$.`],
          teach: t`The mode number is the number of loops, and $f_n = nf_1$.`,
          explain: t`There are ${n} loops, so this is mode $n = ${n}$ and $f_1 = ${f}/${n} = ${f1}$ Hz.`,
          visual: standingPicture({ n, L: 1, numbers: false, caption: 'The string vibrating in one of its normal modes. Height exaggerated.' }),
        };
      },
    }),
    num({
      id: 'tune', difficulty: 2,
      gen(r) {
        const [mu, f] = r.pick([[0.0004, 330], [0.0007, 247], [0.0012, 196], [0.0019, 147]]);
        const F = mu * (2 * L_GUITAR * f) ** 2;
        return {
          prompt: t`A guitar string with $\mu = ${r6(mu * 1000)}$ g/m vibrates over a length of ${L_GUITAR} m. What tension tunes its fundamental to ${f} Hz?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: F * 1000, feedback: t`Check your units: $\mu$ must be in kg/m, not g/m.` }, { value: mu * (2 * L_GUITAR * f), feedback: t`$F_T = \mu v^2$: square the speed.` }, { value: mu * (L_GUITAR * f) ** 2, feedback: t`The wave speed is $v = 2Lf_1$, since $\lambda_1 = 2L$.` }].filter((e) => Math.abs(e.value - F) > 0.02 * F),
          hints: [t`The fundamental has $\lambda_1 = 2L$, so $v = 2Lf_1$.`, t`Then $F_T = \mu v^2$.`],
          teach: t`To tune a string, $v = 2Lf_1$ and $F_T = \mu v^2$.`,
          explain: t`$v = 2(${L_GUITAR})(${f}) = ${tn(2 * L_GUITAR * f)}$ m/s, so $F_T = ${tn(mu)} \times ${tn(2 * L_GUITAR * f)}^2 = ${tn(F)}$ N — about the weight of 7 kg, typical of a guitar string.`,
          visual: stringRig({ wave: 1, top: `μ = ${r6(mu * 1000)} g/m`, side: 'tension ?', length: `L = ${L_GUITAR} m`, caption: 'The string vibrating in its fundamental. On a guitar a tuning peg, not a weight, sets the tension. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'node-spacing', difficulty: 1,
      prompt: 'How far apart are neighbouring nodes of a standing wave?',
      choices: [t`$\lambda/2$`, t`$\lambda$`, t`$\lambda/4$`, t`$2\lambda$`],
      answer: 0,
      why: {
        1: t`A full wavelength contains two loops: nodes come every half wavelength.`,
        2: t`$\lambda/4$ is the distance from a node to the next antinode.`,
        3: t`That would be four loops between neighbouring nodes. Each loop is half a wavelength.`,
      },
      hints: [t`In $y = 2A\sin kx\cos\omega t$ the nodes are where $\sin kx = 0$: $kx = 0, \pi, 2\pi, \ldots$`],
      teach: 'Nodes are half a wavelength apart, with an antinode halfway between each pair.',
      explain: t`$\sin kx = 0$ at $kx = m\pi$, i.e. $x = m\lambda/2$: one node every half wavelength. That is why a string of length $L$ holds $n$ loops when $L = n\lambda/2$.`,
      visual: standingPicture({ n: 4, L: 1, numbers: false, caption: 'A standing wave with nodes (orange). How does the spacing of the nodes compare with the wavelength?' }),
    }),
    mcq({
      id: 'raise-pitch', difficulty: 1,
      prompt: 'Which change raises the fundamental frequency of a guitar string?',
      choices: ['Tightening it', 'Plucking it harder', 'Fitting a thicker, heavier string at the same tension', 'Letting more of it vibrate (a longer length)'],
      answer: 0,
      why: {
        1: 'Plucking harder makes a bigger amplitude — a louder note — at the same frequency.',
        2: t`More mass per metre means a slower wave and a *lower* note: $f_1 = \sqrt{F_T/\mu}/2L$.`,
        3: t`A longer string has a longer fundamental wavelength, $2L$, and so a lower note. Fretting shortens it to raise the pitch.`,
      },
      hints: [t`$f_1 = \dfrac{1}{2L}\sqrt{\dfrac{F_T}{\mu}}$: which choice increases it?`],
      teach: 'A string sounds higher when tighter, lighter or shorter; plucking harder only makes it louder.',
      explain: t`$f_1$ grows with $\sqrt{F_T}$: tightening raises the pitch. The amplitude of the pluck does not appear in the formula at all.`,
      visual: stringRig({ wave: 1, top: 'guitar string', side: 'tension', caption: 'A string vibrating in its fundamental. Not to scale.' }),
    }),
    multi({
      id: 'which-resonate', difficulty: 2,
      prompt: 'A string fixed at both ends has a fundamental frequency of 125 Hz. At which of these driving frequencies will it resonate? Select all that apply.',
      choices: ['250 Hz', '375 Hz', '187.5 Hz', '62.5 Hz', '500 Hz'],
      answer: [0, 1, 4],
      why: {
        2: t`$187.5 = 1.5 \times 125$: one and a half loops would leave an antinode at a fixed end. Not allowed.`,
        3: t`Below the fundamental the wavelength is longer than $2L$: not even one loop fits between nodes at the ends.`,
      },
      hints: ['The normal modes are whole-number multiples of the fundamental.'],
      teach: 'A string fixed at both ends resonates only at whole-number multiples of its fundamental.',
      explain: t`$250 = 2f_1$, $375 = 3f_1$ and $500 = 4f_1$ are modes 2, 3 and 4. Neither $187.5 = 1.5f_1$ nor $62.5 = 0.5f_1$ fits a whole number of half-wavelengths.`,
      visual: standingPicture({ n: 1, L: 0.8, caption: 'The string’s fundamental, 125 Hz. Height exaggerated.' }),
    }),
    mcq({
      id: 'touch-midpoint', difficulty: 3,
      prompt: 'A guitarist lightly touches a string at its exact midpoint — forcing a node there — and plucks it. Which frequencies can it sound?',
      choices: [t`Only the even harmonics: $2f_1, 4f_1, 6f_1, \ldots$`, t`Only the fundamental, $f_1$`, t`Only the odd harmonics: $f_1, 3f_1, 5f_1, \ldots$`, 'All the harmonics, just more quietly'],
      answer: 0,
      why: {
        1: 'The fundamental has its antinode right at the midpoint — the finger stops exactly that motion.',
        2: t`Odd modes have an antinode at the midpoint ($\sin(n\pi/2) = \pm 1$), so the finger kills them.`,
        3: 'Modes with an antinode at the finger cannot vibrate at all; only modes with a node there survive.',
      },
      hints: ['Which modes already have a node at the midpoint?', t`Mode $n$ has nodes at $x = mL/n$. Is $L/2$ among them?`],
      teach: 'Forcing a node at a point allows only the modes that already have a node there.',
      explain: t`$L/2$ is a node of mode $n$ when $L/2 = mL/n$ for some whole $m$, i.e. when $n$ is even. So the string sounds $2f_1, 4f_1, \ldots$ — an octave above its normal note. Guitarists call this playing a harmonic.`,
      visual: standingPicture({ n: 2, L: 1, marks: [{ x: 0.5, y: 0, color: 'good', r: 7, label: 'finger', dy: 16 }], caption: 'Mode 2, which already has a node at the midpoint (green: the finger). Height exaggerated.' }),
    }),
    num({
      id: 'fret', difficulty: 2,
      gen(r) {
        const [ratio, words] = r.pick([[1.5, 'a fifth higher (1.5 times the frequency)'], [2, 'an octave higher (twice the frequency)'], [1.25, 'a major third higher (1.25 times the frequency)']]);
        const L2 = L_GUITAR / ratio;
        return {
          prompt: t`An open guitar string vibrates over ${L_GUITAR} m. To play a note ${words} on the same string, a fret shortens the vibrating length. How long must the vibrating part be?`,
          answer: L2, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: L_GUITAR * ratio, feedback: t`A higher note needs a *shorter* string: $f_1 \propto 1/L$.` }, { value: L_GUITAR / (ratio * ratio), feedback: t`$f_1 = v/2L$ is inversely proportional to $L$ itself, not to $L^2$.` }],
          hints: [t`Same string, same tension: $v$ is fixed, so $f_1 \propto 1/L$.`],
          teach: 'At fixed tension and μ, the fundamental is inversely proportional to the vibrating length.',
          explain: t`$f_1 = v/2L$ with $v$ unchanged, so $L' = L/${ratio} = ${tn(L2)}$ m. The fret sits $${tn(L_GUITAR - L2)}$ m from the nut.`,
          visual: standingPicture({ n: 1, L: L_GUITAR, xlabel: 'distance from the nut (m)', caption: 'The open string vibrating in its fundamental over its full length. Height exaggerated.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-harmonic', difficulty: 2,
      gen(r) {
        const L = r.pick([0.5, 0.75, 1.2]), F = r.pick([50, 90, 120]), mu = r.pick([0.003, 0.005]), n = r.pick([2, 3, 4]);
        const f = n * f1Of(L, F, mu);
        return {
          prompt: t`A string ${L} m long with $\mu = ${mu}$ kg/m is held at both ends under ${F} N of tension. What is the frequency of its mode $n = ${n}$?`,
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: f / n, feedback: t`That is the fundamental. Mode ${n} is ${n} times it.` }, { value: 2 * f, feedback: t`$\lambda_n = 2L/n$, not $L/n$: check the factor of 2.` }].filter((e) => Math.abs(e.value - f) > 0.02 * f),
          hints: [t`$f_n = \dfrac{n}{2L}\sqrt{F_T/\mu}$.`],
          teach: t`$f_n = n v/2L$.`,
          explain: t`$v = \sqrt{${F}/${mu}} = ${tn(Math.sqrt(F / mu))}$ m/s, so $f_${n} = ${n} \times ${tn(Math.sqrt(F / mu))}/(2 \times ${L}) = ${tn(f)}$ Hz.`,
          visual: standingPicture({ n, L, caption: `Mode ${n} of the string. Height exaggerated.` }),
        };
      },
    }),
    num({
      id: 'cp-vibrating-wire', difficulty: 3, transfer: true,
      gen(r) {
        const f0 = r.pick([800, 900, 1000]), p = r.pick([1, 2, 3]);
        const f1 = f0 * (1 + p / 100), dT = ((f1 / f0) ** 2 - 1) * 100;
        return {
          prompt: t`A **vibrating-wire gauge** measures strain in a structure — a dam, a tunnel lining, a test rig — using a short steel wire stretched between two mounts on it. As the structure deforms, the wire’s tension changes, and with it the wire’s fundamental frequency, which a coil plucks and listens to. One gauge reads ${f0} Hz; after loading it reads ${s3(f1, 4)} Hz. By what percentage has the wire’s tension increased?`,
          answer: dT, units: '%', tol: { rel: 0.01 },
          errors: [{ value: p, feedback: t`Tension goes as the frequency **squared**: $F_T = \mu(2Lf_1)^2$.` }, { value: Math.sqrt(1 + p / 100) * 100 - 100, feedback: t`Other way round: $F_T \propto f_1^2$, so square the frequency ratio.` }],
          hints: [t`With $L$ and $\mu$ fixed, $F_T = \mu(2Lf_1)^2 \propto f_1^2$.`, t`$F_T'/F_T = (f'/f)^2$; subtract 1 and turn it into a percentage.`],
          teach: 'With length and μ fixed, a string’s tension goes as the square of its fundamental frequency.',
          explain: t`$F'/F = (${s3(f1, 4)}/${f0})^2 = ${s3((f1 / f0) ** 2, 5)}$, an increase of $${tn(dT)}\%$ — twice the ${p}% rise in frequency, because $F_T \propto f_1^2$. Frequencies can be measured very precisely, which is what makes these gauges so stable over years.`,
          visual: standingPicture({ n: 1, L: 1, numbers: false, xlabel: '', caption: 'A vibrating-wire gauge, simplified: a taut steel wire fixed at both ends to the structure, vibrating in its fundamental. The coil that plucks it and reads its frequency is not drawn. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'cp-nodes', difficulty: 2,
      prompt: 'A 0.90 m string fixed at both ends vibrates in its third mode. Where are its nodes, apart from the two ends?',
      choices: ['At 0.30 m and 0.60 m', 'At 0.45 m only', 'At 0.225, 0.45 and 0.675 m', 'At 0.15, 0.45 and 0.75 m'],
      answer: 0,
      why: {
        1: 'That is the second mode: two loops, one node in the middle.',
        2: 'Those are the nodes of the fourth mode: four loops, 0.225 m each.',
        3: 'Those are the antinodes of the third mode — the middles of the loops.',
      },
      hints: ['Mode 3 has three loops of equal length.', 'Each loop is 0.90/3 m long.'],
      teach: 'Mode n divides the string into n equal loops, with nodes at multiples of L/n.',
      explain: t`Three loops of $0.90/3 = 0.30$ m each: nodes at 0, 0.30, 0.60 and 0.90 m; antinodes halfway between, at 0.15, 0.45 and 0.75 m.`,
      visual: standingPicture({ n: 3, L: 0.9, nodes: false, numbers: false, caption: 'The string in its third mode (nodes not marked). Height exaggerated.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §16.6 Standing Waves and Resonance', url: 'https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance' },
  ],
});
