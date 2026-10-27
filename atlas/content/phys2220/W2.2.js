// Decibels: β = 10 log₁₀(I/I₀). Ratios of intensity become differences of
// level; intensities add, decibels do not; and a rocket's "204 dB" is a sound
// power level, not a sound anyone heard.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, s3, r6, label, spheres, twoSources, dbLadder } from './_waves.js';

const t = String.raw;
const I0 = 1e-12;
const lvl = (I) => 10 * Math.log10(I / I0);
const add = (...b) => 10 * Math.log10(b.reduce((s, x) => s + 10 ** (x / 10), 0));
const DB = { rel: 0.002, abs: 0.1 };          // decibel answers: to about a tenth of a dB
const SLS_LW = 202.4;                          // dB re 1 pW, Artemis I (Kellison & Gee 2023)

export default lesson({
  id: 'phys2220.W2.2',
  title: 'Decibels',
  minutes: 11, difficulty: 2,
  intro: t`Your ears handle sound intensities from about $10^{-12}$ W/m² (the faintest sound you can hear) to about 1 W/m² (painful) — a range of a **trillion**. The decibel scale compresses that range into a few hundred: it measures intensity by its **logarithm**,

$$\beta = (10\ \text{dB})\,\log_{10}\frac{I}{I_0}, \qquad I_0 = 10^{-12}\ \text{W/m}^2$$

So ratios become differences: every **factor of 10** in intensity adds **10 dB**, doubling adds 3 dB, and twice the distance from a small source (a quarter of the intensity) takes away 6 dB. Two sources together do not add their decibels — they add their **intensities**.`,
  symbols: [
    { tex: '\\beta', text: 'the sound intensity level, in decibels (dB). A decibel is a tenth of a bel; it labels a ratio, not a physical unit' },
    { tex: 'I', text: 'the sound intensity, in W/m²' },
    { tex: 'I_0', text: 'the reference intensity, $10^{-12}$ W/m²: roughly the faintest 1 kHz tone a young ear can hear. A sound at $I_0$ is 0 dB' },
    { tex: '\\log_{10}', text: 'the base-10 logarithm: $\\log_{10} 1000 = 3$, because $10^3 = 1000$' },
  ],
  why: 'Every noise limit — on a launch pad, in an aircraft cabin, on a factory floor — is written in decibels, and reading them means turning differences back into ratios.',
  visual: {
    type: 'graph',
    title: 'Distance, power and decibels',
    lead: t`Pick a source and slide the distance. The curve is the level $\beta$ at every distance (on a logarithmic scale); the gold dot is where you are. Sound from a small source spreads over a sphere, so its intensity falls as $1/r^2$.`,
    tasks: [
      'Slide from 10 m to 100 m: the level drops by 20 dB — ten times the distance, a hundredth of the intensity.',
      'Switch from the siren (2 W) to the jet (100 kW): the whole line rises by 47 dB, since 10 log₁₀(50 000) = 47.',
      'With Saturn V, find how far away you would have to stand for the level to fall below the threshold of pain — ignoring absorption by the air.',
    ],
    params: {
      aspect: 'wide', x: [0, 4.4], y: [-20, 200], xlabel: 'distance from the source (logarithmic scale)', ylabel: 'level β (dB)', xticks: 0.001, axesAt: 'edge',
      choices: [{ key: 'P', label: 'Source', options: [[1e-5, 'Voice (10 µW)'], [2, 'Siren (2 W)'], [1e5, 'Jet airliner (100 kW)'], [2.5e8, 'Saturn V (250 MW)']], value: 2, explain: 'Rough sound powers: the power each source radiates as sound.' }],
      sliders: [{ key: 'r', label: 'Distance $r$', min: 1, max: 20000, value: 10, logScale: true, unit: '\\mathrm{m}', explain: 'Logarithmic slider: equal moves multiply the distance by equal factors.' }],
      curves: [{ fn: '10*log10(P/(4*pi*10^(2*x)*1e-12))', color: 'accent', width: 2.4 }],
      hlines: [{ y: 0, label: 'threshold of hearing', color: 'ink3' }, { y: 85, label: 'harmful over hours', color: 'warn' }, { y: 120, label: 'threshold of pain', color: 'bad' }],
      points: [
        { x: 'log10(r)', y: '10*log10(P/(4*pi*r^2*1e-12))', color: 'gold', r: 6 },
        label(0, -13, '1 m', 'ink3', -8, 0), label(1, -13, '10 m', 'ink3', -12, 0), label(2, -13, '100 m', 'ink3', -16, 0), label(3, -13, '1 km', 'ink3', -12, 0), label(4, -13, '10 km', 'ink3', -16, 0),
      ],
      readouts: [{ label: 'intensity $I = P/4\\pi r^2$', expr: 'P/(4*pi*r^2)', unit: '\\mathrm{W/m^2}', digits: 3 }, { label: 'level $\\beta$', expr: '10*log10(P/(4*pi*r^2*1e-12))', unit: '\\mathrm{dB}', digits: 4 }],
    },
    caption: 'Each source is treated as small and radiating equally in all directions in open air, with no absorption. Real sources are louder in some directions, the ground reflects, and over kilometres the air absorbs high frequencies — so real levels can differ by several dB. Source powers are rough; Saturn V’s is from Gee et al. (2022).',
  },
  example: {
    prompt: t`On its first launch (Artemis I, 2022), NASA’s Space Launch System radiated an overall **sound power level** of $L_W = 202.4$ dB re 1 pW, worked out from microphones 1.4–1.8 km away. (a) What is its sound power in watts? (b) Treating the rocket as a small source radiating evenly into the half-space above the ground, what intensity level would you predict 1.5 km away? (c) The loudest level actually measured about 1.5 km away was near 136 dB. Why might the estimate fall short?`,
    visual: spheres({ ratio: 2, l1: '', l2: '1.5 km', who: 'microphone', caption: 'The rocket (orange) and a microphone 1.5 km away. Above the ground the sound spreads over a hemisphere of area 2πr². Not to scale.' }),
    steps: [
      { label: 'Power level to watts', text: t`A power level uses the same logarithm with a reference power of $10^{-12}$ W: $L_W = 10\log_{10}(P/10^{-12}\ \text{W})$. So $P = 10^{-12} \times 10^{20.24}\ \text{W} = 1.7\times10^{8}$ W — about 0.3% of the power in the rocket’s exhaust.` },
      { label: 'Spread it out', text: t`Over a hemisphere of radius 1500 m: $I = P/(2\pi r^2) = 1.74\times10^8/(2\pi \times 1500^2) = 12.3$ W/m².` },
      { label: 'Level', text: t`$\beta = 10\log_{10}(12.3/10^{-12}) = 130.9$ dB, far above the threshold of pain.` },
      { label: 'Compare', text: t`The measurement is about 5 dB higher — three times the intensity. A rocket is not a small source radiating evenly: its noise comes from a long exhaust plume and is strongest in certain directions, and the ground and the pad reflect sound. Such estimates are rough to several decibels, and even published rocket sound powers differ by a dB or so.` },
    ],
    answer: t`$P = 1.7\times10^8$ W; the simple estimate gives 131 dB at 1.5 km, about 5 dB below the roughly 136 dB measured.`,
  },
  practice: [
    num({
      id: 'level-from-I', difficulty: 1,
      gen(r) {
        const m = r.pick([2, 3.2, 5, 8]), e = r.pick([-9, -6, -4, -2]);
        const I = m * 10 ** e, b = lvl(I);
        return {
          prompt: t`What is the sound level, in dB, of a sound with intensity $${m}\times10^{${e}}$ W/m²?`,
          answer: b, tol: DB,
          errors: [{ value: Math.log10(I / I0), feedback: 'Multiply the logarithm by 10: decibels are tenths of a bel.' }, { value: 10 * Math.log(I / I0), feedback: 'Use the base-10 logarithm (log), not the natural logarithm (ln).' }],
          hints: [t`$\beta = 10\log_{10}(I/I_0)$ with $I_0 = 10^{-12}$ W/m².`, t`$I/I_0 = ${m}\times10^{${e + 12}}$.`],
          teach: 'β = 10 log₁₀(I/I₀): the level counts powers of ten of intensity above 10⁻¹² W/m², ten decibels each.',
          explain: t`$I/I_0 = ${m}\times10^{${e + 12}}$, so $\beta = 10\log_{10}(${m}\times10^{${e + 12}}) = 10(${s3(Math.log10(m), 3)} + ${e + 12}) = ${tn(b, 4)}$ dB.`,
          visual: dbLadder(),
        };
      },
    }),
    num({
      id: 'I-from-level', difficulty: 2,
      gen(r) {
        const b = r.pick([35, 72, 94, 110]);
        const I = I0 * 10 ** (b / 10);
        return {
          prompt: t`A sound level meter reads ${b} dB. What is the intensity?`,
          answer: I, units: 'W/m^2', tol: { rel: 0.01 },
          errors: [{ value: b / 10 * I0, feedback: t`Undo the logarithm with a power of ten: $I = I_0\,10^{\beta/10}$.` }, { value: 10 ** (b / 10), feedback: t`Multiply by $I_0 = 10^{-12}$ W/m²: the ratio $10^{\beta/10}$ is $I/I_0$, not $I$.` }],
          hints: [t`Solve $\beta = 10\log_{10}(I/I_0)$ for $I$.`, t`$I = I_0 \times 10^{\beta/10}$.`],
          teach: 'To go back from decibels: I = I₀ × 10^(β/10).',
          explain: t`$I = 10^{-12} \times 10^{${b / 10}} = ${tn(I)}$ W/m².`,
          visual: dbLadder({ marks: [{ b, label: `${b} dB` }] }),
        };
      },
    }),
    num({
      id: 'identical-sources', difficulty: 2,
      gen(r) {
        const b1 = r.pick([80, 95, 110]), [N, words] = r.pick([[2, 'Two identical engines'], [4, 'Four identical engines'], [10, 'Ten identical engines']]);
        const b = b1 + 10 * Math.log10(N);
        return {
          prompt: t`One engine on a test stand produces a level of ${b1} dB at a nearby microphone. ${words} running together, each just as loud at that microphone, would produce what level?`,
          answer: b, tol: DB,
          errors: [
            { value: N * b1, feedback: 'Decibels do not add. Add the intensities, then take the logarithm again.' },
            ...(N === 2 ? [{ value: b1 + 6.02, feedback: 'Plus 6 dB would mean the two sound waves were exactly in step, so their amplitudes added. Independent engines are not in step: their intensities add, giving +3 dB.' }] : []),
          ],
          hints: [t`$N$ equal sources give $N$ times the intensity.`, t`$\beta_N = \beta_1 + 10\log_{10}N$.`],
          teach: 'Independent sources add intensities: N equal sources are 10 log₁₀N dB louder than one.',
          explain: t`$N = ${N}$ times the intensity adds $10\log_{10}${N} = ${s3(10 * Math.log10(N), 3)}$ dB: $${b1} + ${s3(10 * Math.log10(N), 3)} = ${tn(b, 4)}$ dB.`,
          visual: twoSources({ s1: [0, 1], s2: [0, -1], P: [6, 0.4], l1: '', l2: '', who: 'microphone', caption: 'Engines (blue boxes) and a microphone. Each engine alone gives the same level there. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'how-many-times', difficulty: 1,
      gen(r) {
        const lo = r.pick([40, 55, 70]), d = r.pick([10, 20, 30, 13]);
        const hi = lo + d, ratio = 10 ** (d / 10);
        return {
          prompt: t`How many times more intense is a ${hi} dB sound than a ${lo} dB sound?`,
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: d / 10, feedback: t`Each 10 dB is a factor of 10, multiplied — not added: the ratio is $10^{\Delta\beta/10}$.` }, { value: d, feedback: 'The difference in decibels is not the ratio of intensities: convert with 10^(Δβ/10).' }, { value: hi / lo, feedback: 'Decibels are logarithms: their ratio means nothing. Their difference gives the ratio of intensities.' }].filter((e) => Math.abs(e.value - ratio) > 0.02 * ratio),
          hints: [t`$\Delta\beta = 10\log_{10}(I_2/I_1)$.`, t`$I_2/I_1 = 10^{\Delta\beta/10}$.`],
          teach: 'A difference of Δβ decibels is an intensity ratio of 10^(Δβ/10).',
          explain: t`$\Delta\beta = ${d}$ dB, so $I_2/I_1 = 10^{${d / 10}} = ${tn(ratio)}$.`,
          visual: dbLadder({ marks: [{ b: hi, label: `${hi} dB` }, { b: lo, label: `${lo} dB` }] }),
        };
      },
    }),
    num({
      id: 'farther', difficulty: 2,
      gen(r) {
        const b1 = r.pick([96, 104, 118]), k = r.pick([2, 3, 4, 10]), r1 = r.pick([5, 20, 50]);
        const b2 = b1 - 20 * Math.log10(k);
        return {
          prompt: t`${r1} m from a siren the level is ${b1} dB. Treating the siren as a small source, what is the level ${r1 * k} m away?`,
          answer: b2, tol: DB,
          errors: [{ value: b1 - 10 * Math.log10(k), feedback: t`Intensity falls as $1/r^2$, so the level falls by $20\log_{10}(r_2/r_1)$, not $10\log_{10}$.` }, { value: b1 / k, feedback: 'Decibels do not scale with distance like that: find the intensity ratio, then convert it to a difference.' }],
          hints: [t`$${k}$ times the distance means $1/${k * k}$ of the intensity.`, t`$\Delta\beta = 10\log_{10}(1/${k * k}) = -20\log_{10}${k}$.`],
          teach: 'From a small source, the level drops 20 log₁₀(r₂/r₁) dB: 6 dB for each doubling of distance.',
          explain: t`$\beta_2 = ${b1} - 20\log_{10}${k} = ${b1} - ${s3(20 * Math.log10(k), 3)} = ${tn(b2, 4)}$ dB.`,
          visual: spheres({ ratio: k, l1: `${r1} m`, l2: `${r1 * k} m` }),
        };
      },
    }),
    num({
      id: 'two-unequal', difficulty: 3,
      gen(r) {
        const [b1, b2] = r.pick([[80, 86], [90, 95], [70, 80]]);
        const b = add(b1, b2);
        return {
          prompt: t`Two machines make ${b1} dB and ${b2} dB at the same spot when each runs alone. What is the level with both running?`,
          answer: b, tol: DB,
          errors: [{ value: b1 + b2, feedback: 'Decibels do not add: add the intensities.' }, { value: (b1 + b2) / 2, feedback: 'Two sources are louder than either alone — and averaging logarithms means nothing here.' }, { value: b2 + 3.01, feedback: '+3 dB is for two equal sources. These are unequal: add their actual intensities.' }],
          hints: ['Turn each level into an intensity, add, then turn the sum back into decibels.', t`$I = I_0 \times 10^{\beta/10}$: $10^{${b1 / 10}}I_0$ and $10^{${b2 / 10}}I_0$.`],
          teach: 'To combine sources, add intensities and convert back; the louder source dominates.',
          explain: t`$I_\text{total} = 10^{-12}(10^{${b1 / 10}} + 10^{${b2 / 10}})$ W/m², so $\beta = 10\log_{10}(10^{${b1 / 10}} + 10^{${b2 / 10}}) = ${tn(b, 4)}$ dB — only a little above the louder machine.`,
          visual: dbLadder({ marks: [{ b: b2, label: `${b2} dB` }, { b: b1, label: `${b1} dB` }] }),
        };
      },
    }),
    mcq({
      id: 'zero-dB', difficulty: 1,
      prompt: 'A sound level of 0 dB means:',
      choices: [t`The intensity equals the reference, $10^{-12}$ W/m²: about the faintest sound a young ear can hear`, 'There is no sound at all', 'The sound is too faint to measure', 'The intensity is zero'],
      answer: 0,
      why: {
        1: t`$\log_{10}1 = 0$: 0 dB is $I = I_0$, a real (very faint) sound. No sound at all would be $-\infty$ dB.`,
        2: 'Quieter sounds still have levels: they are negative decibels.',
        3: t`$\beta = 10\log_{10}(I/I_0)$ is 0 when $I/I_0 = 1$, not when $I = 0$.`,
      },
      hints: [t`What is $\log_{10} 1$?`],
      teach: '0 dB is the reference intensity, not silence; fainter sounds have negative levels.',
      explain: t`$\beta = 0$ when $I = I_0 = 10^{-12}$ W/m². A sound ten times fainter is $-10$ dB; true silence would be $-\infty$ dB.`,
      visual: dbLadder({ marks: [{ b: 0, label: '0 dB' }] }),
    }),
    num({
      id: 'ear-defenders', difficulty: 2,
      gen(r) {
        const d = r.pick([15, 25, 30]);
        const pct = 100 * 10 ** (-d / 10);
        return {
          prompt: t`Ear defenders rated to cut ${d} dB are worn on a launch pad. What percentage of the sound intensity gets through to the ear?`,
          answer: pct, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 - d, feedback: 'Decibels are not percentages: −d dB is an intensity factor of 10^(−d/10).' }, { value: 100 * 10 ** (-d / 20), feedback: t`That would be the *pressure amplitude* factor. Intensity uses $10^{-\Delta\beta/10}$.` }],
          hints: [t`A drop of $\Delta\beta$ dB multiplies the intensity by $10^{-\Delta\beta/10}$.`],
          teach: 'Cutting Δβ decibels multiplies the intensity by 10^(−Δβ/10).',
          explain: t`$10^{-${d}/10} = ${tn(pct / 100)}$, so ${tn(pct)}% of the intensity gets through: a ${d} dB cut removes all but a sliver of the energy, though the ear judges it as a much smaller change in loudness.`,
          visual: dbLadder({ caption: 'Typical sound levels (rough). Ear defenders lower every level by the same number of decibels.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-factor', difficulty: 2,
      gen(r) {
        const k = r.pick([5, 20, 50, 300]);
        const d = 10 * Math.log10(k);
        return {
          prompt: t`An engine test raises the sound intensity at a microphone by a factor of ${k}. By how many decibels does the level rise?`,
          answer: d, tol: DB,
          errors: [{ value: k / 10, feedback: t`The rise is $10\log_{10}(\text{ratio})$.` }, { value: 20 * Math.log10(k), feedback: t`For intensity ratios, use $10\log_{10}$; $20\log_{10}$ is for ratios of amplitude.` }],
          hints: [t`$\Delta\beta = 10\log_{10}(I_2/I_1)$.`],
          teach: 'An intensity ratio R is a level difference of 10 log₁₀R dB.',
          explain: t`$\Delta\beta = 10\log_{10}${k} = ${tn(d, 3)}$ dB.`,
          visual: dbLadder(),
        };
      },
    }),
    num({
      id: 'cp-sls', difficulty: 3, transfer: true,
      gen(r) {
        const km = r.pick([3, 5, 8]);
        const P = I0 * 10 ** (SLS_LW / 10), I = P / (2 * Math.PI * (km * 1000) ** 2), b = lvl(I);
        return {
          prompt: t`The Space Launch System radiated a sound power level of ${SLS_LW} dB re 1 pW at lift-off. Treating it as a small source radiating evenly into the half-space above the ground (area $2\pi r^2$), and ignoring absorption by the air, estimate the sound level ${km} km away.`,
          answer: b, tol: { rel: 0.002, abs: 0.3 },
          errors: [{ value: lvl(P / (4 * Math.PI * (km * 1000) ** 2)), feedback: t`Above the ground the sound spreads over a hemisphere, $2\pi r^2$, not a whole sphere.` }, { value: SLS_LW, feedback: 'That is the power level of the whole rocket. The level at a listener depends on how widely that power has spread.' }],
          hints: [t`Power first: $P = 10^{-12}\ \text{W} \times 10^{${SLS_LW}/10}$.`, t`Then $I = P/(2\pi r^2)$ with $r$ in metres, and $\beta = 10\log_{10}(I/10^{-12})$.`],
          teach: 'A sound power level describes the source; the level at a listener depends on how far the power has spread.',
          explain: t`$P = 10^{-12} \times 10^{20.24} = ${tn(P)}$ W; $I = ${tn(P)}/(2\pi \times ${km * 1000}^2) = ${tn(I)}$ W/m², so $\beta = ${tn(b, 4)}$ dB. Real launches beam their noise in particular directions and the air absorbs some of it over kilometres, so measurements can differ from this by several dB either way.`,
          visual: spheres({ ratio: 3, l1: '', l2: `${km} km`, who: 'listener', caption: 'The rocket (orange) and a listener. Above the ground the sound spreads over a hemisphere. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'cp-204', difficulty: 3, kind: 'error',
      prompt: t`A website says: *“The Saturn V was 204 decibels — so loud that its sound melted concrete and set grass on fire a mile away.”* What is the main error?`,
      choices: [
        '204 dB is the whole rocket’s sound power level (dB re 1 picowatt), not the level anyone heard: a mile away it was far lower',
        'Nothing: 204 dB really is enough to melt concrete',
        'Decibels measure the pitch of a sound, not its strength',
        'The Saturn V was silent: rocket exhaust makes no sound',
      ],
      answer: 0,
      why: {
        1: 'No one heard 204 dB: levels at listeners were tens of decibels lower. Acoustics researchers who examined the story found the sound nowhere near strong enough to melt concrete or start fires.',
        2: 'Decibels measure intensity (or power or pressure) on a logarithmic scale; pitch is the frequency.',
        3: 'The exhaust jet is violently turbulent and roars: a fraction of a percent of a large rocket’s jet power — about 0.3% for SLS — becomes sound.',
      },
      hints: ['Is 204 dB a level at a place, or a property of the whole source?', 'A power level uses a reference power, 1 pW: 204 dB is about 2.5×10⁸ W in total.'],
      teach: 'A sound power level (dB re 1 pW) describes the whole source; a sound level at a listener depends on the distance and is much lower.',
      explain: t`About 204 dB re 1 pW — roughly $2.5\times10^8$ W of sound — is the estimated total sound power of the Saturn V. Spread over a hemisphere of radius 1.6 km (a mile), that is $I = 2.5\times10^8/(2\pi \times 1600^2) \approx 16$ W/m², about 132 dB: deafening, but nowhere near melting concrete. The fire and scorching near pads come from the hot exhaust, not from sound.`,
      visual: dbLadder({ caption: 'Typical sound levels (rough: real sounds vary by many decibels). The scale stops at 150 dB.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §17.3 Sound Intensity', url: 'https://openstax.org/books/university-physics-volume-1/pages/17-3-sound-intensity' },
    { label: 'K. L. Gee, M. T. Mathews, M. C. Anderson and G. W. Hart, “Saturn-V sound levels: A letter to the Redditor”, J. Acoust. Soc. Am. 152, 1068 (2022)', url: 'https://doi.org/10.1121/10.0013216' },
    { label: 'L. T. Kellison and K. L. Gee, “Sound power of NASA’s lunar rockets: Space Launch System versus Saturn V”, JASA Express Lett. 3, 113601 (2023)', url: 'https://pubs.aip.org/asa/jel/article/3/11/113601/2922874/Sound-power-of-NASA-s-lunar-rockets-Space-Launch' },
    { label: 'K. L. Gee et al., “Space Launch System acoustics: Far-field noise measurements of the Artemis-I launch”, JASA Express Lett. 3, 023601 (2023)', url: 'https://pubs.aip.org/asa/jel/article/3/2/023601/2874351/Space-Launch-System-acoustics-Far-field-noise' },
  ],
});
