// Beats and resonance in pipes: two close tones add to a sound whose loudness
// swells |f₁ − f₂| times a second; an air column resonates when its standing
// wave fits its ends — open ends are pressure nodes, closed ends pressure
// antinodes — and a rocket chamber's acoustic modes can feed a combustion
// instability.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, s3, r6, label, curvePicture } from './_waves.js';

const t = String.raw;
const vAir = (C) => Math.sqrt((1.4 * 8.314462618 * (C + 273.15)) / 0.0289647);
const apart = (errs, key, rel = 0.012) => errs.filter((e) => Math.abs(e.value - key) > rel * Math.abs(key));
/** A static pipe picture from the sound simulation. */
const pipe = (ends, k, L, caption, extra = {}) => ({ type: 'wave-sound', params: { mode: 'pipe', ends, k, L, controls: false, play: false, readout: false, ask: true, ...extra }, ...(caption ? { caption } : {}) });
/** Two tones and their sum over a few hundredths of a second. */
const tones = (f1, f2, ms = 30, caption) => curvePicture({
  fn: null, x: [0, ms], y: [-2.6, 2.9], xlabel: 't (ms)', ylabel: 'pressure',
  curves: [{ fn: `cos(2*pi*${f1}*x/1000)`, color: 'ink3', width: 1.1, dash: true }, { fn: `cos(2*pi*${f2}*x/1000)`, color: 'ink4', width: 1.1, dash: true }, { fn: `cos(2*pi*${f1}*x/1000) + cos(2*pi*${f2}*x/1000)`, color: 'good', width: 2 }],
  caption: caption ?? `The two tones (dashed) and their sum (green) over the first ${ms} ms — far shorter than one beat.`,
});

export default lesson({
  id: 'phys2220.W2.4',
  title: 'Beats and resonance in pipes',
  minutes: 13, difficulty: 3,
  intro: t`Sound two tones of nearly equal frequency together and their superposition drifts in and out of step: the loudness swells and fades — **beats** — as many times a second as the frequencies differ. Air in a pipe, like a string, has **normal modes**. An **open** end lets the air move freely, so it is a displacement antinode and a **pressure node** (the pressure there stays at the room’s); a **closed** end stops the air, so it is a displacement node and a **pressure antinode**. Fitting the standing wave to the ends gives

$$\begin{gathered} f_\text{beat} = |f_1 - f_2| \\ f_n = \frac{nv}{2L}\ \ \text{(both ends open, or both closed)}, \qquad f_n = \frac{nv}{4L},\ \ n = 1, 3, 5, \ldots\ \ \text{(one end closed)} \end{gathered}$$

A pipe closed at one end sounds an octave lower than an open one of the same length, and has **only odd harmonics**.`,
  symbols: [
    { tex: 'f_\\text{beat}', text: 'the beat frequency: how many times per second the loudness swells, in Hz' },
    { tex: 'f_1,\\ f_2', text: 'the frequencies of the two tones, in Hz. You hear their average as the pitch' },
    { tex: 'f_n', text: 'the frequency of the pipe’s $n$th harmonic, in Hz' },
    { tex: 'n', text: 'the harmonic number: 1, 2, 3, … for a pipe with like ends; only odd numbers for a pipe closed at one end' },
    { tex: 'v', text: 'the speed of sound in the gas inside the pipe, in m/s' },
    { tex: 'L', text: 'the length of the pipe, in m' },
  ],
  why: 'Musicians tune by listening for beats to vanish; every wind instrument is an air column; and the same standing waves in a rocket’s combustion chamber can grow into an instability violent enough to destroy the engine.',
  visual: {
    type: 'wave-sound',
    title: 'The modes of an air column',
    lead: t`Each dot is a parcel of air in the pipe; red tracers mark two of them. Choose the ends and step through the resonances. Below: the displacement (solid, with its envelope dotted) and the pressure (dashed) along the pipe.`,
    tasks: [
      'Open–open: resonances 1, 2, 3 are harmonics n = 1, 2, 3 — every whole multiple of the fundamental.',
      'Closed–open: the resonances are n = 1, 3, 5 — odd harmonics only — and the fundamental is half the open pipe’s.',
      'At a closed end the air cannot move (displacement node) while the pressure swings most (pressure antinode); at an open end it is the other way round.',
    ],
    params: { mode: 'pipe', ends: 'open-open', k: 1, L: 0.5 },
  },
  example: {
    prompt: t`An organ pipe 0.60 m long is open at both ends, in air where sound travels at 343 m/s. Find its fundamental and second harmonic. What are the first two resonances if one end is closed? Then a 290 Hz tuning fork is sounded with the open pipe’s fundamental: how many beats per second are heard?`,
    visual: pipe('open-open', 1, 0.6, 'The open pipe in its fundamental: displacement antinodes at both open ends, a displacement node (and pressure antinode) in the middle. Motion exaggerated.', { ask: false }),
    steps: [
      { label: 'Open pipe', text: t`Half a wavelength fits between the two open ends: $f_1 = v/2L = 343/(2 \times 0.60) = 286$ Hz, and $f_2 = 2f_1 = 572$ Hz.` },
      { label: 'Closed at one end', text: t`Now a quarter wavelength fits between the closed end (node) and the open end (antinode): $f_1 = v/4L = 343/(4 \times 0.60) = 143$ Hz. The next resonance fits three quarters: $f_3 = 3f_1 = 429$ Hz. There is no $2f_1$.` },
      { label: 'Beats', text: t`$f_\text{beat} = |290 - 286| = 4$ Hz: the sound swells four times a second. Shortening the pipe slightly would raise 286 Hz toward 290 Hz and slow the beats — that is how instruments are tuned by ear.` },
      { label: 'Sense check', text: t`Closing one end halves the fundamental — an octave down — which is why a stopped organ pipe sounds as low as an open one twice its length.` },
    ],
    answer: t`Open: 286 Hz and 572 Hz. Closed at one end: 143 Hz and 429 Hz. With the 290 Hz fork: 4 beats per second.`,
  },
  practice: [
    num({
      id: 'beat-frequency', difficulty: 1,
      gen(r) {
        const f1 = r.pick([256, 330, 440, 512]), d = r.pick([2, 3, 5, 7]) * r.sign(), f2 = f1 + d;
        return {
          prompt: t`Two tuning forks, of ${f1} Hz and ${f2} Hz, are struck together. How many beats per second do you hear?`,
          answer: Math.abs(d), units: 'Hz', tol: { rel: 0, abs: 0.05 },
          errors: [{ value: (f1 + f2) / 2, feedback: 'That is the pitch you hear — the average frequency. The beats come at the difference.' }, { value: f1 + f2, feedback: 'The beat frequency is the difference, not the sum.' }],
          hints: [t`$f_\text{beat} = |f_1 - f_2|$.`],
          teach: 'Two close tones beat at the difference of their frequencies.',
          explain: t`$|${f1} - ${f2}| = ${Math.abs(d)}$ Hz: the two waves drift fully out of step and back ${Math.abs(d)} times a second. The pitch heard is their average, $${s3((f1 + f2) / 2, 4)}$ Hz.`,
          visual: tones(f1, f2),
        };
      },
    }),
    num({
      id: 'tuning', difficulty: 3,
      gen(r) {
        const fr = r.pick([440, 330, 247]), b = r.pick([2, 3, 4, 5]), above = r.bool(0.5);
        const fs = above ? fr + b : fr - b;
        return {
          prompt: t`A guitar string sounded with a ${fr} Hz tuning fork gives ${b} beats per second. Tightening the string very slightly makes the beats ${above ? 'faster' : 'slower'}. What was the string’s frequency before it was tightened?`,
          answer: fs, units: 'Hz', tol: { rel: 0, abs: 0.1 },
          errors: [{ value: above ? fr - b : fr + b, feedback: `Tightening raises the string’s frequency. If the beats got ${above ? 'faster' : 'slower'}, the string was moving ${above ? 'away from' : 'toward'} the fork’s frequency — so it started ${above ? 'above' : 'below'} it.` }],
          hints: [`The beats alone allow two answers: ${fr} + ${b} and ${fr} − ${b} Hz.`, `Tightening raises the frequency. ${above ? 'Faster beats mean the gap grew' : 'Slower beats mean the gap shrank'}: which starting point does that fit?`],
          teach: 'Beats give the size of a frequency difference; a small known change tells you its sign.',
          explain: t`The string was at ${fr - b} or ${fr + b} Hz. Tightening raises its frequency; the beats got ${above ? 'faster, so the gap grew: it started above the fork, at' : 'slower, so the gap shrank: it started below the fork, at'} ${fs} Hz.`,
          visual: { type: 'wave-sound', params: { mode: 'beats', f1: fr, f2: fs, controls: false, readout: false, ask: true }, caption: 'The string and the fork sounding together: the loudness of their sum over one second (top) and the waveform over 20 ms (bottom).' },
        };
      },
    }),
    num({
      id: 'open-pipe', difficulty: 1,
      gen(r) {
        const L = r.pick([0.25, 0.4, 0.75, 1.2]), C = r.pick([0, 20, 30]);
        const v = vAir(C), f = v / (2 * L);
        return {
          prompt: t`A pipe ${L} m long, open at both ends, is in air at ${C} °C, where sound travels at $${tn(v, 4)}$ m/s. What is its fundamental frequency?`,
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: v / (4 * L), feedback: t`$v/4L$ is for a pipe closed at one end. Open at both ends, half a wavelength fits: $f_1 = v/2L$.` }, { value: v / L, feedback: t`The fundamental fits half a wavelength in the pipe: $\lambda = 2L$.` }],
          hints: ['Both ends are displacement antinodes, with one node in the middle: half a wavelength.', t`$f_1 = v/2L$.`],
          teach: 'An open–open pipe holds half a wavelength in its fundamental: f₁ = v/2L.',
          explain: t`$f_1 = ${tn(v, 4)}/(2 \times ${L}) = ${tn(f)}$ Hz.`,
          visual: pipe('open-open', 1, Math.min(2, Math.max(0.2, L)), 'A pipe open at both ends in its fundamental (motion exaggerated).'),
        };
      },
    }),
    num({
      id: 'closed-pipe', difficulty: 2,
      gen(r) {
        const L = r.pick([0.3, 0.5, 0.85]), k = r.pick([2, 3]);
        const n = 2 * k - 1, v = 343, f = (n * v) / (4 * L);
        const word = k === 2 ? 'second' : 'third';
        return {
          prompt: t`A pipe ${L} m long is closed at one end and open at the other. What is the frequency of its ${word} resonance? (Speed of sound 343 m/s.)`,
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: apart([{ value: (k * v) / (4 * L), feedback: t`A pipe closed at one end has only odd harmonics: its resonances are $f_1, 3f_1, 5f_1, \ldots$ — so the ${word} one is $${n}f_1$.` }, { value: (k * v) / (2 * L), feedback: t`$nv/2L$ is for a pipe with both ends alike. Closed at one end: $f_n = nv/4L$ with $n$ odd.` }], f),
          hints: [t`Its fundamental is $f_1 = v/4L$.`, t`The resonances are the odd harmonics: $f_1, 3f_1, 5f_1, \ldots$`],
          teach: t`A pipe closed at one end resonates only at odd multiples of $v/4L$.`,
          explain: t`$f_1 = 343/(4 \times ${L}) = ${tn(v / (4 * L))}$ Hz; the ${word} resonance is $${n}f_1 = ${tn(f)}$ Hz.`,
          visual: pipe('closed-open', k, L, `The pipe in its ${word} resonance (motion exaggerated).`),
        };
      },
    }),
    mcq({
      id: 'which-pipe', difficulty: 2,
      prompt: 'An air column resonates at 150 Hz, 250 Hz and 350 Hz, and at no frequencies in between. What kind of pipe is it?',
      choices: ['Closed at one end, with a fundamental of 50 Hz', 'Open at both ends, with a fundamental of 100 Hz', 'Open at both ends, with a fundamental of 150 Hz', 'Closed at one end, with a fundamental of 150 Hz'],
      answer: 0,
      why: {
        1: 'An open pipe with f₁ = 100 Hz would resonate at 100, 200, 300 Hz — not 150, 250, 350.',
        2: 'An open pipe with f₁ = 150 Hz would resonate at 150, 300, 450 Hz: consecutive resonances 150 Hz apart, not 100.',
        3: 'If f₁ were 150 Hz, the next resonance of a closed pipe would be 3f₁ = 450 Hz.',
      },
      hints: ['Successive resonances are 100 Hz apart. What fundamental do the three share?', '150 : 250 : 350 = 3 : 5 : 7.'],
      teach: 'Resonances in the ratio 1 : 3 : 5 … mark a pipe closed at one end; 1 : 2 : 3 … a pipe with like ends.',
      explain: t`All three are odd multiples of 50 Hz — $3 \times 50$, $5 \times 50$, $7 \times 50$ — so this is a pipe closed at one end with $f_1 = 50$ Hz (its fundamental lies below the range tested). Spacing between resonances is $2f_1$ for a closed pipe but $f_1$ for an open one.`,
      visual: curvePicture({
        fn: null, x: [0, 420], y: [0, 1.25], xlabel: 'frequency (Hz)', ylabel: 'response', numbers: true,
        curves: [150, 250, 350].map((f) => ({ fn: `exp(-((x - ${f})/4)^2)`, color: 'violet', width: 2.2 })),
        caption: 'The measured resonances of the air column (sketch).',
      }),
    }),
    mcq({
      id: 'closed-end', difficulty: 2,
      prompt: 'An air column closed at one end is resonating. At the closed end:',
      choices: ['The air does not move, and the pressure swings most', 'The air moves most, and the pressure stays steady', 'Both the air’s motion and the pressure swing are largest', 'The air does not move and the pressure does not change'],
      answer: 0,
      why: {
        1: 'That describes an open end: the air there moves freely, and the pressure is held at the room’s.',
        2: 'Pressure varies most where the air on either side is squeezed against something — and that is where the air cannot move.',
        3: 'Air pressed against the closed end alternately piles up and thins out: the pressure there swings the most.',
      },
      hints: ['Can the air next to a wall move into the wall?', 'Where air is stopped, neighbouring air piles up against it.'],
      teach: 'A closed end is a displacement node and a pressure antinode; an open end is the reverse.',
      explain: t`The wall stops the air at the closed end (a displacement node), so the air arriving from inside piles up against it, then thins out: the pressure swings most there (a pressure antinode). Pressure and displacement standing waves are always a quarter wavelength out of step.`,
      visual: pipe('closed-open', 1, 0.5, 'A pipe closed at the left end, in its fundamental (motion exaggerated).'),
    }),
    num({
      id: 'resonance-tube', difficulty: 3,
      gen(r) {
        const f = r.pick([384, 440, 512]), C = r.pick([18, 22, 25]);
        const v = vAir(C), lam = v / f, e = 0.012;
        const L1 = Math.round((lam / 4 - e) * 1000) / 1000, L2 = Math.round(((3 * lam) / 4 - e) * 1000) / 1000;
        const vm = 2 * f * (L2 - L1);
        return {
          prompt: t`In a lab, a ${f} Hz tuning fork rings above a tube while the water level inside is lowered. The air column (closed by the water) resonates loudly when it is ${s3(L1 * 100, 3)} cm long, and again at ${s3(L2 * 100, 3)} cm. What is the speed of sound?`,
          answer: vm, units: 'm/s', tol: { rel: 0.01 },
          errors: apart([{ value: 4 * f * L1, feedback: t`Using $L_1 = \lambda/4$ alone ignores the end correction — the open end acts slightly beyond the tube. The *difference* $L_2 - L_1 = \lambda/2$ cancels it.` }, { value: f * (L2 - L1), feedback: t`Successive resonances of a closed tube are half a wavelength apart: $\lambda = 2(L_2 - L_1)$.` }], vm),
          hints: ['Between successive resonances, half a wavelength is added to the air column.', t`$\lambda = 2(L_2 - L_1)$, then $v = f\lambda$.`],
          teach: 'Successive resonance lengths differ by half a wavelength, a difference in which the end correction cancels.',
          explain: t`$\lambda = 2(${s3(L2, 3)} - ${s3(L1, 3)}) = ${s3(2 * (L2 - L1), 3)}$ m, so $v = ${f} \times ${s3(2 * (L2 - L1), 3)} = ${tn(vm)}$ m/s. ($4fL_1$ would give $${tn(4 * f * L1)}$ m/s: too low, because the open end behaves as if the tube were about a centimetre longer.)`,
          visual: pipe('closed-open', 1, Math.max(0.2, L1), 'The air column above the water: closed at the water surface, open at the top, in its first resonance (drawn on its side; motion exaggerated).'),
        };
      },
    }),
    num({
      id: 'helium-pipe', difficulty: 2,
      gen(r) {
        const f = r.pick([262, 330, 440]);
        const fh = (f * 1007) / 343;
        return {
          prompt: t`An organ pipe sounds at ${f} Hz in air, where sound travels at 343 m/s. What would it sound at if filled with helium at the same temperature, where sound travels at 1007 m/s?`,
          answer: fh, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: f, feedback: t`The length sets the *wavelength*; the frequency is $v/\lambda$, so it rises with the speed of sound.` }, { value: (f * 343) / 1007, feedback: 'Faster sound with the same wavelength means a higher frequency, not a lower one.' }],
          hints: [t`The pipe’s length fixes the wavelength of each mode; $f = v/\lambda$.`],
          teach: 'A pipe’s length fixes its wavelengths, so its frequencies scale with the speed of sound in the gas inside.',
          explain: t`Same $\lambda$, so $f \propto v$: $${f} \times 1007/343 = ${tn(fh)}$ Hz. Something similar happens when you speak after breathing helium: your vocal tract’s resonances shift up, though the vibrating vocal folds do not.`,
          visual: pipe('open-open', 1, 0.6, 'The pipe in its fundamental (motion exaggerated). The wavelength is fixed by the length.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-closed', difficulty: 2,
      gen(r) {
        const L = r.pick([0.2, 0.35, 0.6]), C = r.pick([-10, 15, 30]);
        const v = vAir(C), f = v / (4 * L);
        return {
          prompt: t`A pipe ${L} m long, closed at one end, is in air at ${C} °C, where sound travels at $${tn(v, 4)}$ m/s. What is its fundamental?`,
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: v / (2 * L), feedback: t`Closed at one end, only a quarter wavelength fits in the fundamental: $f_1 = v/4L$.` }],
          hints: [t`$f_1 = v/4L$.`],
          teach: 'A pipe closed at one end has fundamental v/4L.',
          explain: t`$f_1 = ${tn(v, 4)}/(4 \times ${L}) = ${tn(f)}$ Hz.`,
          visual: pipe('closed-open', 1, L, 'The pipe, closed at the left (motion exaggerated).'),
        };
      },
    }),
    num({
      id: 'cp-chamber', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([0.3, 0.45, 0.6]), c = r.pick([1000, 1100, 1200]);
        const f = c / (2 * L);
        return {
          prompt: t`In a liquid-propellant rocket engine, the combustion chamber is ${L} m long. The injector plate is a solid wall, and the narrow nozzle throat reflects sound back almost as a wall would, so along its length the chamber behaves roughly like a pipe **closed at both ends**. The hot gas carries sound at about ${c} m/s. Estimate the frequency of its first longitudinal acoustic mode.`,
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: c / (4 * L), feedback: t`$v/4L$ is for a pipe with one end open. Closed at both ends, half a wavelength fits: $v/2L$.` }, { value: 343 / (2 * L), feedback: 'Use the speed of sound in the hot combustion gas, not in room-temperature air.' }],
          hints: ['Both ends are displacement nodes (pressure antinodes): half a wavelength fits in the fundamental.', t`$f_1 = v/2L$ with $v$ the sound speed in the hot gas.`],
          teach: t`A chamber closed at both ends has modes $f_n = nv/2L$, with $v$ the sound speed in the hot gas.`,
          explain: t`$f_1 = ${c}/(2 \times ${L}) = ${tn(f)}$ Hz. If the flames release heat in step with the pressure swings of a mode like this, they pump energy into it and the oscillation grows — **combustion instability**, which can wreck an engine in a fraction of a second. Real chambers also have transverse (tangential and radial) modes that this one-dimensional estimate cannot describe: the Saturn V’s F-1 engine suffered a first-tangential instability near 500 Hz during development, cured by baffles that split the injector face into compartments and by injector redesign, proved in about two thousand full-scale firings — some with small bombs set off in the chamber to check that disturbances died away.`,
          visual: pipe('closed-closed', 1, Math.min(2, Math.max(0.2, L)), 'The chamber treated as a pipe closed at both ends (injector at left, nozzle throat at right), in its first longitudinal mode. A real chamber is wider and its nozzle end only partly reflecting. Motion exaggerated.', { T: 20 }),
        };
      },
    }),
    num({
      id: 'cp-propellers', difficulty: 3, transfer: true,
      gen(r) {
        const [n1, n2, B] = r.pick([[1200, 1212, 4], [1500, 1510, 3], [1800, 1806, 6], [1020, 1029, 4]]);
        const f1 = (n1 / 60) * B, f2 = (n2 / 60) * B, fb = Math.abs(f1 - f2);
        return {
          prompt: t`On a twin-engine propeller aircraft, the left propeller turns at ${n1} rpm and the right at ${n2} rpm; each has ${B} blades. The loudest tone from each is its blade-passing frequency (blades per second passing a point). Passengers hear the combined drone throb. How many seconds pass between one loud throb and the next?`,
          answer: 1 / fb, units: 's', tol: { rel: 0.01 },
          errors: apart([{ value: 60 / Math.abs(n1 - n2), feedback: 'That uses the shafts’ rotation rates. The loudest tones are at the blade-passing frequency: revolutions per second times the number of blades.' }, { value: fb, feedback: 'That is the beat frequency, in Hz. The time between throbs is its reciprocal.' }], 1 / fb),
          hints: [t`Blade-passing frequency $= (\text{rpm}/60) \times (\text{number of blades})$.`, t`Beat frequency $= |f_1 - f_2|$; the time between throbs is $1/f_\text{beat}$.`],
          teach: 'Two nearly matched propellers beat at the difference of their blade-passing frequencies.',
          explain: t`$f_1 = ${n1}/60 \times ${B} = ${tn(f1, 4)}$ Hz and $f_2 = ${tn(f2, 4)}$ Hz, so $f_\text{beat} = ${tn(fb)}$ Hz and a throb comes every $${tn(1 / fb)}$ s. Many propeller aircraft have **synchrophasers** that hold the propellers at exactly the same speed and a fixed phase to stop this throbbing.`,
          visual: tones(f1, f2, 60, 'The two blade-passing tones (dashed) and their sum (green) over the first 60 ms — a small piece of one slow beat.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §17.4 Normal Modes of a Standing Sound Wave', url: 'https://openstax.org/books/university-physics-volume-1/pages/17-4-normal-modes-of-a-standing-sound-wave' },
    { label: 'OpenStax University Physics Vol. 1, §17.6 Beats', url: 'https://openstax.org/books/university-physics-volume-1/pages/17-6-beats' },
    { label: 'J. C. Oefelein and V. Yang, “Comprehensive review of liquid-propellant combustion instabilities in F-1 engines”, J. Propulsion and Power 9, 657 (1993)', url: 'https://www.yang.gatech.edu/publications/Journal/JPP%20(1993,%20Oefelein).pdf' },
  ],
});
