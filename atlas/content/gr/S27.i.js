// Gravitational waves — Intuition Mode. A passing wave stretches one
// transverse direction and squeezes the other by the strain h ≈ 10⁻²¹; LIGO's
// 4 km arms change in difference by ΔL = hL ≈ 4×10⁻¹⁸ m. An inspiral chirps
// at a rate set by the chirp mass (GW150914: 36 + 29 → 28.1 M☉; 30.6 as seen
// at z = 0.09; 0.16 s from 35 Hz at leading order; ~3 M☉c² radiated).
// Earth–Sun radiates 196 W; Hulse–Taylor's orbit decays at 2.40×10⁻¹².
// Numbers from model/gr-waves.js (tested in test/gr-waves.test.mjs).
import { lesson, mcq, num } from '../../src/core/content.js';
import { C, M_SUN, YEAR, sci, round, T_SUN, logDots } from './_frontier.js';
import { chirpMass, tauOfF, cyclesBetween, powerCircular, pbDot, strain, MPC } from '../../src/viz/model/gr-waves.js';

const t = String.raw;

const MC = chirpMass(36, 29), MCD = 1.09 * MC;                // GW150914, source and detector frame
const TAU35 = tauOfF(35, MCD);
const E150914 = 3 * M_SUN * C * C;                            // J
const PROTON = 1.68e-15;                                       // proton diameter, m (charge radius 0.84 fm)
const M_EARTH = 5.972e24, AU_M = 1.496e11;
const P_ES = powerCircular(M_SUN, M_EARTH, AU_M);              // W
const HT = { Pb: 7.7519 * 3600, m1: 1.438, m2: 1.390, e: 0.617 };
const HT_PDOT = pbDot(HT.Pb, HT.m1, HT.m2, HT.e);
const HT_A = Math.cbrt((6.674e-11 * (HT.m1 + HT.m2) * M_SUN * HT.Pb ** 2) / (4 * Math.PI ** 2));
const HT_POWER = powerCircular(HT.m1 * M_SUN, HT.m2 * M_SUN, HT_A) * 11.84;   // ×Peters–Mathews f(e)
const L_SUN = 3.828e26;                                        // W

// a static chirp for given masses: the waveform alone, no numbers
const chirpPic = (m1, m2, caption) => ({
  type: 'gr-chirp',
  params: { m1, m2, D: 410, sliders: false, play: false, readout: false, ring: false, p: 1 },
  caption: caption ?? `The leading-order chirp of ${m1} + ${m2} solar masses, from 30 Hz until the horizons would touch (the last cycles only roughly right; merger not drawn).`,
});

// a schematic Michelson interferometer, not to scale
const interferometer = {
  type: 'graph',
  params: {
    x: [-2.4, 4.4], y: [-1.9, 3.7], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['-1.6 + 1.6t', '0'], t: [0, 1], color: 'bad', width: 2.4 },
      { param: ['3.4t', '0'], t: [0, 1], color: 'gold', width: 2.4 },
      { param: ['0', '3.2t'], t: [0, 1], color: 'gold', width: 2.4 },
      { param: ['0', '-1.2t'], t: [0, 1], color: 'violet', width: 2, dash: true },
      { param: ['-0.35 + 0.7t', '-0.35 + 0.7t'], t: [0, 1], color: 'ink', width: 3 },
      { param: ['3.5', '-0.45 + 0.9t'], t: [0, 1], color: 'ink', width: 4 },
      { param: ['-0.45 + 0.9t', '3.3'], t: [0, 1], color: 'ink', width: 4 },
    ],
    points: [
      { x: -1.75, y: 0, color: 'bad', label: 'laser' },
      { x: 0.2, y: -0.25, r: 0.5, color: 'ink2', label: 'beam splitter' },
      { x: 3.5, y: 0.5, r: 0.5, color: 'ink2', label: 'mirror (free mass)' },
      { x: 0.45, y: 3.3, r: 0.5, color: 'ink2', label: 'mirror (free mass)' },
      { x: 1.5, y: 0.25, r: 0.5, color: 'gold', label: 'arm, 4 km' },
      { x: 0, y: -1.3, color: 'violet', label: 'photodetector' },
    ],
  },
  caption: 'A Michelson interferometer, as in LIGO (schematic, not to scale; the real detectors add cavities that send the light back and forth along each arm hundreds of times). The mirrors hang as pendulums, free to move along the arms. Light from both arms recombines at the beam splitter; how it interferes depends on how long each round trip took.',
};

// a ring of free test masses lying in the screen
const ringPic = {
  type: 'graph',
  params: {
    x: [-1.9, 1.9], y: [-1.45, 1.55], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1, dash: true }],
    points: [
      ...Array.from({ length: 12 }, (_, k) => ({ x: round(Math.cos((k * Math.PI) / 6), 6), y: round(Math.sin((k * Math.PI) / 6), 6), color: 'accent2' })),
      { x: 0, y: 0, color: 'gold', label: '⊙ wave coming toward you' },
    ],
  },
  caption: 'Twelve free-floating test masses on a circle in the plane of the screen; a gravitational wave travels straight out of the screen toward you.',
};

const lengths = (L, armLabel) => logDots(
  [[armLabel, L, 'gold'], ['a human hair (0.1 mm)', 1e-4, 'ink2'], ['an atom (10⁻¹⁰ m)', 1e-10, 'ink2'], ['a proton (1.7×10⁻¹⁵ m)', PROTON, 'violet']],
  { xlabel: 'length in metres (powers of ten)', range: [-20, L > 1e6 ? 16 : 12], every: 4, caption: 'Lengths on a scale of powers of ten. The answer lies off the bottom of everyday experience.' },
);

const hPulsarYears = 20;
const pulsarCurve = {
  type: 'graph',
  params: {
    x: [0, hPulsarYears], y: [0, 19], xlabel: 'years of observation', ylabel: 'periastron early by (s)',
    curves: [{ fn: `${round((0.5 * Math.abs(HT_PDOT) * YEAR ** 2) / HT.Pb, 6)}*x^2`, color: 'accent' }],
  },
  caption: `General relativity’s prediction for how early the Hulse–Taylor pulsar reaches periastron, for the first ${hPulsarYears} years: a parabola, because the period shrinks steadily. Measurements since 1974 follow it.`,
};

export default lesson({
  id: 'gr.S27.i',
  title: 'Ripples in spacetime and how LIGO hears them',
  minutes: 10, difficulty: 3, mode: 'intuition', badges: ['est-obs'],
  intro: t`Accelerate a mass and the curvature around it changes; the change spreads outward at the speed of light as a **gravitational wave**. Passing through you, it stretches distances along one direction while squeezing them along the perpendicular one, then the reverse, by a tiny fraction $h$, the **strain**. LIGO's two detectors are L-shaped laser interferometers with 4 km arms that sense how the difference between the arms changes. On 14 September 2015 both recorded GW150914: two black holes of about 36 and 29 solar masses merging 410 megaparsecs (1.3 billion light-years) away. As two bodies spiral together their waves rise in frequency and strength — a **chirp** — at a rate set by one combination of the masses, the **chirp mass**:

$$\mathcal{M} = \frac{(m_1 m_2)^{3/5}}{(m_1 + m_2)^{1/5}} \qquad \frac{df}{dt} = \frac{96}{5}\,\pi^{8/3}\left(\frac{G\mathcal{M}}{c^3}\right)^{5/3} f^{11/3}$$`,
  equation: t`h = \frac{\Delta L}{L}`,
  symbols: [
    { tex: 'h', text: 'the strain: the fractional stretch the wave produces. No units; about $10^{-21}$ for the strongest signals LIGO hears' },
    { tex: 'L', text: 'the length of a detector arm: 4 km for LIGO, 3 km for Virgo and KAGRA' },
    { tex: '\\Delta L', text: 'how much the *difference* between the two arms changes: for a wave from overhead, one arm grows by $hL/2$ while the other shrinks by $hL/2$' },
    { tex: 'f', text: 'the wave’s frequency, in Hz: twice the frequency of the orbit' },
    { tex: '\\mathcal{M}', text: 'the chirp mass, in kg or solar masses: the one combination of the two masses $m_1, m_2$ that sets how fast the frequency sweeps' },
    { tex: 'df/dt', text: 'how fast the frequency climbs, in Hz per second' },
    { tex: 'G,\\ c', text: 'the gravitational constant and the speed of light; $G\\mathcal{M}/c^3$ is the chirp mass as a time, 4.93 μs per solar mass' },
  ],
  why: 'Gravitational waves are a new sense: they weigh black holes no telescope can see, test general relativity where gravity is strongest, and — with light from the same event, GW170817 — showed that gravity travels at the speed of light to within one part in 10¹⁵.',
  visual: {
    type: 'gr-chirp',
    title: 'A chirp, and what it does to a detector',
    lead: t`**Right:** the strain from two black holes spiralling together, computed at leading order; the gold line is "now". **Left:** a ring of free-floating test masses, with LIGO-style arms running to two of them, distorted by the wave at that moment — enormously exaggerated. Press **Play**.`,
    tasks: ['Play GW150914 (36 + 29 solar masses): the ring stretches faster and harder as the frequency sweeps from 30 Hz to a few hundred hertz in about a quarter of a second.', 'Make both masses 12: the chirp mass drops to about 10, and the sweep takes over a second and many more cycles — lighter binaries chirp more slowly.', 'Double the distance: only the strain halves; the sweep does not change. The sweep weighs a binary; the loudness then tells how far away it is.'],
    params: { m1: 36, m2: 29, D: 410, p: 0.6 },
  },
  example: {
    prompt: t`GW150914: black holes of 36 and 29 solar masses merged 410 Mpc away, into one of 62 solar masses. Find the chirp mass, how long the chirp lasts from 35 Hz, the energy radiated, and how much LIGO's arms changed at the peak strain, $h = 1.0\times10^{-21}$.`,
    steps: [
      { label: 'Chirp mass', text: t`$\mathcal{M} = (36\times29)^{3/5}/(65)^{1/5} = ${sci(MC)}$ solar masses. The expansion of the universe ($z = 0.09$) stretches the signal, so the detector sees it as if $\mathcal{M}$ were $1.09\times${sci(MC)} = ${sci(MCD)}$.` },
      { label: 'Duration', text: t`Running $df/dt$ backwards gives the time left when the frequency is $f$: $\tau = \tfrac{5}{256}(G\mathcal{M}/c^3)^{-5/3}(\pi f)^{-8/3}$. With $G\mathcal{M}/c^3 = ${sci(MCD)}\times4.926\ \mu\text{s} = ${sci(MCD * T_SUN * 1e6)}\ \mu\text{s}$ and $f = 35$ Hz, $\tau = ${sci(TAU35, 2)}$ s, about ${Math.round(cyclesBetween(35, 250, MCD))} cycles up to 250 Hz. LIGO saw the sweep from 35 to 250 Hz take about 0.2 s.` },
      { label: 'Energy', text: t`$36 + 29 = 65$ solar masses went in; $62$ came out. The missing $3\,M_\odot c^2 = 3\times1.989\times10^{30}\times(2.998\times10^{8})^2 = ${sci(E150914, 2)}$ J left as gravitational waves, mostly in the last few orbits and the merger.` },
      { label: 'The stretch', text: t`$\Delta L = hL = 1.0\times10^{-21}\times4000$ m $= 4\times10^{-18}$ m — about 1/${Math.round(PROTON / 4e-18)} of a proton's diameter.` },
      { label: 'Sense check', text: t`The waves come at twice the orbital frequency, so at 35 Hz the holes circled each other 17.5 times a second, and at 250 Hz 125 times — black holes tens of kilometres across, moving at a large fraction of the speed of light.` },
    ],
    answer: t`$\mathcal{M} = ${sci(MC)}\,M_\odot$ ($${sci(MCD)}\,M_\odot$ as seen at Earth); about ${sci(TAU35, 2)} s from 35 Hz; $${sci(E150914, 2)}$ J radiated; $\Delta L = 4\times10^{-18}$ m.`,
  },
  practice: [
    mcq({
      id: 'ring', difficulty: 1,
      prompt: 'A gravitational wave travels straight out of the screen, through a ring of free-floating test masses lying in the screen. What does the ring do as the wave passes?',
      choices: [
        'It is stretched along one direction while squeezed along the perpendicular one, then the reverse, again and again',
        'It is pushed back and forth as a whole, along the direction the wave travels',
        'It grows and shrinks evenly in every direction, staying circular',
        'Nothing: a wave travelling along the line of sight cannot affect masses lying across it',
      ],
      answer: 0,
      why: {
        1: 'Gravitational waves are transverse — they act across their direction of travel. And a push on the whole ring could not even be measured: only stretching between the masses is.',
        2: 'In general relativity the ring keeps its area (to first order): as one direction stretches, the perpendicular one squeezes. An even “breathing” would point to a different theory of gravity.',
        3: 'The opposite: gravitational waves act only across their direction of travel — exactly in the plane of this ring.',
      },
      hints: ['Gravitational waves are transverse, like light.', 'They are travelling tides: stretching one way comes with squeezing the other.'],
      teach: 'A gravitational wave is a travelling tide: it stretches one direction across its path while squeezing the perpendicular one, alternately.',
      explain: 'The ring becomes an ellipse stretched along one axis, then, half a cycle later, along the perpendicular axis; along the direction of travel nothing happens. A second polarization does the same along axes turned by 45°. The Explore picture shows it, exaggerated about 10²⁰ times.',
      visual: ringPic,
    }),
    num({
      id: 'arm', difficulty: 1,
      gen(r) {
        const [name, L, short] = r.pick([['LIGO (arms 4 km)', 4000, 'a LIGO arm, 4 km'], ['Virgo (arms 3 km)', 3000, 'a Virgo arm, 3 km'], ['KAGRA, in Japan (arms 3 km)', 3000, 'a KAGRA arm, 3 km'], ['the planned space detector LISA (arms 2.5 million km)', 2.5e9, 'a LISA arm, 2.5 million km']]);
        const [h, hTeX] = L > 1e6 ? r.pick([[1e-20, t`10^{-20}`], [3e-21, t`3\times10^{-21}`]]) : r.pick([[1e-21, t`10^{-21}`], [2e-21, t`2\times10^{-21}`], [5e-22, t`5\times10^{-22}`]]);
        const x = h * L;
        return {
          prompt: t`A gravitational wave of strain $h = ${hTeX}$ passes ${name}. By how much does the difference between the two arm lengths change, $\Delta L = hL$?`,
          answer: x, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: x / 2, feedback: 'That is the change in one arm, hL/2. The difference between the arms changes by hL, since one grows as the other shrinks.' }],
          hints: [t`Multiply: $\Delta L = h \times L$, with $L$ in metres.`],
          teach: 'Strain is a fraction: the change in length is the strain times the length.',
          explain: t`$\Delta L = ${hTeX}\times${sci(L)}\ \text{m} = ${sci(x)}$ m${x < 1e-14 ? ` — about 1/${Math.round(PROTON / x)} of a proton's diameter` : ' — a fraction of an atom’s width over millions of kilometres'}.`,
          visual: lengths(L, short),
        };
      },
    }),
    num({
      id: 'chirp-mass', difficulty: 2,
      gen(r) {
        const [name, m1, m2] = r.pick([['GW150914, the first signal ever detected: 36 and 29 solar masses', 36, 29], ['GW250114, the loudest signal so far: 33.6 and 32.2 solar masses', 33.6, 32.2], ['GW231123, the most massive pair yet: about 137 and 101 solar masses', 137, 101], ['two black holes of 20 and 10 solar masses', 20, 10]]);
        const x = chirpMass(m1, m2);
        return {
          prompt: t`What is the chirp mass $\mathcal{M} = (m_1m_2)^{3/5}/(m_1+m_2)^{1/5}$ of ${name}?`,
          answer: x, units: 'Msun', tol: { rel: 0.005 },
          errors: [
            { value: m1 + m2, feedback: 'That is the total mass. The chirp mass is (m₁m₂)^(3/5)/(m₁+m₂)^(1/5).' },
            { value: (m1 * m2) / (m1 + m2), feedback: 'That is the reduced mass m₁m₂/(m₁+m₂). Use the 3/5 and 1/5 powers.' },
            { value: (m1 * m2) ** 0.6, feedback: 'You left out the division by (m₁+m₂)^(1/5).' },
          ],
          hints: [t`$m_1m_2 = ${sci(m1 * m2, 4)}$; raise it to the power $3/5 = 0.6$.`, t`$(m_1 + m_2)^{1/5} = ${sci(m1 + m2, 4)}^{0.2} = ${sci((m1 + m2) ** 0.2, 4)}$; divide.`],
          teach: 'The chirp mass, (m₁m₂)^(3/5)/(m₁+m₂)^(1/5), is what the frequency sweep measures best.',
          explain: t`$\mathcal{M} = ${sci((m1 * m2) ** 0.6, 4)}/${sci((m1 + m2) ** 0.2, 4)} = ${sci(x)}$ solar masses. Equal masses give $\mathcal{M} = 0.87\,m$; the bigger the chirp mass, the faster and shorter the chirp.`,
          visual: chirpPic(m1, m2),
        };
      },
    }),
    num({
      id: 'merge-time', difficulty: 3,
      gen(r) {
        const [what, Mc, f] = r.pick([
          ['GW150914 (chirp mass 30.6 solar masses, as seen at the detector)', 30.6, 35],
          ['two 10-solar-mass black holes (chirp mass 8.71)', 8.71, 30],
          ['two 1.4-solar-mass neutron stars, like GW170817 (chirp mass 1.22)', 1.22, 30],
          ['two 1.4-solar-mass neutron stars (chirp mass 1.22), caught at 10 Hz as planned detectors will', 1.22, 10],
        ]);
        const x = tauOfF(f, Mc), T = Mc * T_SUN;
        return {
          prompt: t`At leading order, a binary whose waves have frequency $f$ merges a time $\tau = \dfrac{5}{256}\left(\dfrac{G\mathcal{M}}{c^3}\right)^{-5/3}(\pi f)^{-8/3}$ later. How long is that for ${what}, at $f = ${f}$ Hz? ($G\mathcal{M}/c^3$ is 4.926 μs per solar mass.)`,
          answer: x, units: 's', tol: { rel: 0.015 },
          errors: [
            { value: x * Math.PI ** (8 / 3), feedback: 'Use πf, not f, inside the −8/3 power.' },
            { value: x * (256 / 5), feedback: 'Keep the factor 5/256 in front.' },
          ],
          hints: [t`$G\mathcal{M}/c^3 = ${Mc}\times4.926\times10^{-6}$ s $= ${sci(T, 4)}$ s; raise it to the power $-5/3$.`, t`$(G\mathcal{M}/c^3)^{-5/3} = ${sci(T ** (-5 / 3), 4)}$ and $(\pi\cdot${f})^{-8/3} = ${sci((Math.PI * f) ** (-8 / 3), 4)}$; multiply them by $5/256$.`],
          teach: 'Lighter binaries sweep more slowly: the time left goes as 𝓜^(−5/3) f^(−8/3).',
          explain: t`$\tau = \tfrac{5}{256}\times${sci(T ** (-5 / 3), 4)}\times${sci((Math.PI * f) ** (-8 / 3), 4)} = ${sci(x)}$ s${x > 120 ? ` — about ${Math.round(x / 60)} minutes` : ''}. ${Mc < 2 ? 'GW170817’s neutron stars were tracked for about 100 seconds; heavy black-hole pairs give a fraction of a second.' : 'Heavy black holes give a short chirp; neutron stars sweep through the band for minutes.'}`,
          visual: {
            type: 'graph',
            params: {
              x: [0.9, 2.7], y: [-3.5, 3.5], xlabel: 'log₁₀(frequency in Hz)', ylabel: 'log₁₀(time left in s)',
              curves: [[30.6, 'gold', 'chirp mass 30.6', 1.45], [8.71, 'accent', '8.71', 1.2], [1.22, 'violet', '1.22', 1.0]].map(([m, color, label, at]) => { const y1 = Math.log10(tauOfF(1, m)); return { fn: `${round(y1, 6)} - (8/3)x`, domain: [Math.max(0.9, round((y1 - 3.4) / (8 / 3), 4)), Math.min(2.7, round((y1 + 3.4) / (8 / 3), 4))], color, label, labelAt: at }; }),
            },
            caption: 'Time left before merger against frequency, both in powers of ten, at leading order, for three chirp masses: every line has slope −8/3, and heavier binaries sit lower.',
          },
        };
      },
    }),
    num({
      id: 'energy', difficulty: 2,
      gen(r) {
        const ask = r.pick(['J', 'percent', 'sun']);
        const x = ask === 'J' ? E150914 : ask === 'percent' ? (100 * 3) / 65 : E150914 / L_SUN / YEAR;
        return {
          prompt: ask === 'J'
            ? t`GW150914 began as 36 + 29 solar masses and ended as one black hole of 62 solar masses. How much energy left as gravitational waves, in joules? (1 solar mass $= 1.989\times10^{30}$ kg)`
            : ask === 'percent'
              ? t`GW150914 began as 36 + 29 solar masses and ended as one black hole of 62 solar masses. What percentage of the starting mass was radiated away as gravitational waves?`
              : t`GW150914 radiated $3\,M_\odot c^2$ as gravitational waves. For how many years would the Sun have to shine (luminosity $3.828\times10^{26}$ W) to give off as much energy? (1 solar mass $= 1.989\times10^{30}$ kg, 1 year $= 3.156\times10^{7}$ s)`,
          answer: x, units: ask === 'J' ? 'J' : ask === 'percent' ? '%' : 'yr', tol: { rel: 0.01 },
          errors: ask === 'J' ? [{ value: 3 * M_SUN * C, feedback: 'Multiply by c², not c.' }, { value: 3 * M_SUN, feedback: 'That is a mass. Energy is mass times c².' }]
            : ask === 'percent' ? [{ value: (100 * 3) / 62, feedback: 'Divide by the starting mass, 65, not the final 62.' }]
              : [{ value: E150914 / L_SUN, feedback: 'That is in seconds. Divide by 3.156×10⁷ s per year.' }],
          hints: ask === 'percent' ? ['Mass radiated: 36 + 29 − 62 solar masses.'] : [t`Energy radiated: $E = 3\,M_\odot c^2 = 3\times1.989\times10^{30}\times(2.998\times10^{8})^2$ J.`, ...(ask === 'sun' ? ['Divide by the Sun’s power to get seconds, then by the seconds in a year.'] : [])],
          teach: 'A black-hole merger can turn several percent of its mass into gravitational waves within a fraction of a second.',
          explain: t`$E = 3\,M_\odot c^2 = ${sci(E150914, 3)}$ J — ${sci((100 * 3) / 65, 2)}% of the starting mass, and as much as the Sun emits in $${sci(E150914 / L_SUN / YEAR, 2)}$ years. Almost all of it came out in the last few orbits and the merger.`,
          visual: logDots([['Earth’s rest energy, mc²', M_EARTH * C * C, 'ink2'], ['the Sun’s light over 10 billion years', L_SUN * 1e10 * YEAR, 'gold'], ['the Sun’s rest energy, mc²', M_SUN * C * C, 'gold']], { xlabel: 'energy in joules (powers of ten)', range: [40, 50], every: 2, caption: 'Some energies for scale, in powers of ten (all computed: L☉ × 10¹⁰ years, and mc² for Earth and the Sun).' }),
        };
      },
    }),
    mcq({
      id: 'not-sound', difficulty: 2,
      prompt: 'LIGO’s signals are often played as sound — GW150914 becomes a short rising “whoop”. Which statement is right?',
      choices: [
        'The waves are ripples of spacetime, not sound; their frequencies happen to lie in the range of hearing, so the strain record can be played through a speaker',
        'Merging black holes are loud: the sound crosses space and LIGO’s sensitive microphones pick it up',
        'LIGO records ultrasound from the merger and shifts it down so that people can hear it',
        'The waves shake the air inside LIGO’s arms, which is why the arms are kept at normal air pressure',
      ],
      answer: 0,
      why: {
        1: 'Sound needs a medium, and the space between galaxies is nearly empty. Gravitational waves need no medium and travel at the speed of light.',
        2: 'No shift is needed: the waves themselves oscillate tens to hundreds of times a second.',
        3: 'LIGO’s beam tubes hold one of the best vacuums on Earth. Sound could not travel in them, and the waves need no air.',
      },
      hints: ['What does sound need in order to travel? Is it there between galaxies?'],
      teach: 'Gravitational waves are not sound: they are ripples of spacetime that happen to oscillate at audio frequencies, so their recordings can be played as sound.',
      explain: 'GW150914 swept from 35 Hz (a deep bass note) to about 250 Hz (just below middle C), so turning the strain into a speaker’s motion makes an audible chirp — a sonification. Nothing reached Earth as sound; the detector measured changes in the lengths of its arms.',
      visual: chirpPic(36, 29, 'The GW150914 chirp at leading order: about a dozen cycles in a quarter of a second, rising in pitch and loudness.'),
    }),
    num({
      id: 'earth-sun', difficulty: 2,
      prompt: t`Two bodies on a circular orbit radiate gravitational waves with power $P = \dfrac{32}{5}\,\dfrac{G^4}{c^5}\,\dfrac{(m_1 m_2)^2\,(m_1 + m_2)}{a^5}$. Compute $P$ for Earth ($5.972\times10^{24}$ kg) orbiting the Sun ($1.989\times10^{30}$ kg) at $a = 1.496\times10^{11}$ m. ($G = 6.674\times10^{-11}$ SI, $c = 2.998\times10^{8}$ m/s)`,
      answer: P_ES, units: 'W', tol: { rel: 0.02 },
      errors: [{ value: P_ES * (5 / 32), feedback: 'Keep the factor 32/5 in front.' }, { value: P_ES * AU_M, feedback: 'The separation enters as a⁵ in the denominator.' }],
      hints: [t`$m_1m_2 = ${sci(M_SUN * M_EARTH, 4)}$ kg², so $(m_1m_2)^2 = ${sci((M_SUN * M_EARTH) ** 2, 4)}$; $m_1 + m_2 \approx 1.989\times10^{30}$ kg.`, t`$G^4 = ${sci(6.674e-11 ** 4, 4)}$, $c^5 = ${sci(C ** 5, 4)}$, $a^5 = ${sci(AU_M ** 5, 4)}$.`],
      teach: 'Planetary orbits radiate almost nothing: the power grows as the fifth power of 1/a and the square of the masses.',
      explain: t`$P = ${sci(P_ES)}$ W — a few light bulbs' worth from the whole Earth–Sun system. At that rate the orbit would take about $10^{23}$ years to decay, so gravitational waves matter only for compact, fast binaries: the Hulse–Taylor pulsar radiates about $${sci(HT_POWER, 2)}$ W.`,
      visual: logDots([['a 2 kW electric kettle', 2e3, 'ink2'], ['Hulse–Taylor binary pulsar, in gravitational waves', HT_POWER, 'accent'], ['the Sun, in light', L_SUN, 'gold']], { xlabel: 'power in watts (powers of ten)', range: [0, 38], every: 6, caption: 'Powers for scale, in powers of ten. The Hulse–Taylor value is computed from the quadrupole formula with its orbit’s eccentricity.' }),
    }),
    num({
      id: 'two-sites', difficulty: 2,
      prompt: 'The two LIGO detectors, at Hanford (Washington) and Livingston (Louisiana), are about 3000 km apart. Gravitational waves travel at the speed of light. What is the longest possible delay between a wave’s arrival at the two sites?',
      answer: 3e6 / C, units: 's', tol: { rel: 0.01 },
      errors: [{ value: 3e6 / C / 2, feedback: 'The longest delay is for a wave travelling along the line joining the sites: the full 3000 km.' }],
      hints: ['A wave travelling along the line from one site to the other covers the whole distance between them.', 'Delay = distance ÷ speed of light, with the distance in metres.'],
      teach: 'Arrival-time differences between detectors locate a source on the sky and separate real signals from local noise.',
      explain: t`$3.0\times10^{6}\ \text{m}/2.998\times10^{8}\ \text{m/s} = ${sci((3e6 / C) * 1e3)}$ ms. A real signal must appear at both sites within this window, with matching shapes; noise at one site does not. Delays between three or more detectors (with Virgo and KAGRA) narrow down where on the sky the source lies.`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.2, 5.2], y: [-1.3, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [
            { param: ['0', 't'], t: [-0.9, 0.9], color: 'ink3', width: 1.6, dash: true },
            { param: ['-0.6', 't'], t: [-0.9, 0.9], color: 'ink4', width: 1.2, dash: true },
            { param: ['4t', '0'], t: [0, 1], color: 'ink4', width: 1 },
          ],
          points: [{ x: 0, y: 0, color: 'accent', label: 'Hanford' }, { x: 4, y: 0, color: 'gold', label: 'Livingston' }, { x: 0.1, y: 1.15, r: 0.5, color: 'ink3', label: 'wavefronts' }, { x: 1.5, y: -0.35, r: 0.5, color: 'ink3', label: '3000 km' }],
          arrows: [{ from: [-0.9, -0.85], to: [0.4, -0.85], color: 'ink2', label: 'travel at c' }],
        },
        caption: 'Two detectors and a plane gravitational wave arriving along the line between them (schematic; Earth’s curvature ignored).',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-each-arm', difficulty: 2,
      gen(r) {
        const [name, L] = r.pick([['LIGO', 4000], ['Virgo', 3000]]);
        const [h, hTeX] = r.pick([[1e-21, t`10^{-21}`], [2e-21, t`2\times10^{-21}`], [8e-22, t`8\times10^{-22}`]]);
        return {
          prompt: t`A wave of strain $h = ${hTeX}$ arrives from directly above ${name}, with the best possible orientation. By how much does **each** of its ${L / 1000} km arms change length?`,
          answer: (h * L) / 2, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: h * L, feedback: 'That is the change in the difference between the arms. Each arm changes by half of it, hL/2 — one longer, one shorter.' }],
          hints: ['One arm grows while the other shrinks, so that their difference changes by hL.'],
          teach: 'Each arm changes by hL/2 in opposite directions, so the arms’ difference changes by hL.',
          explain: t`Each arm changes by $hL/2 = ${hTeX}\times${L}/2 = ${sci((h * L) / 2)}$ m — one longer, the other shorter.`,
          visual: interferometer,
        };
      },
    }),
    mcq({
      id: 'cp-laser', difficulty: 2,
      prompt: 'If a gravitational wave stretches LIGO’s arms, it also stretches the wavelength of the laser light in them. How can the light still detect the stretch?',
      choices: [
        'What matters is how long each round trip takes: light in the stretched arm takes slightly longer to return than light in the squeezed arm, so the two returning beams interfere differently',
        'It cannot; LIGO instead measures changes in the laser’s brightness caused by the wave',
        'The mirrors are bolted rigidly to the ground, so only the light is stretched, and the stretch is what is measured',
        'Gravitational waves do not affect light at all, only the mirrors',
      ],
      answer: 0,
      why: {
        1: 'LIGO does measure light at its output, but what changes it is the difference in round-trip times between the arms.',
        2: 'The mirrors hang as pendulums, free to move along the arms: they act as free-falling test masses.',
        3: 'The wave does affect light in the arms. The measurement works anyway, because the laser’s own frequency at the corner is fixed and the round-trip times change.',
      },
      hints: ['The laser at the corner is not stretched; it keeps producing light of the same frequency. What does the wave change about the trip down an arm and back?'],
      teach: 'An interferometer compares round-trip travel times of light along two arms; a gravitational wave changes them in opposite ways.',
      explain: 'Fresh light keeps arriving from the laser, unchanged. In the arm that is stretching, each round trip takes a little longer; in the arm being squeezed, a little shorter. The beams recombine at the beam splitter slightly out of step, and the photodetector sees the interference change — for GW150914 a difference of 2hL/c ≈ 3×10⁻²⁶ s per round trip, built up over hundreds of bounces.',
      visual: interferometer,
    }),
    num({
      id: 'cp-pulsar', difficulty: 3, transfer: true,
      gen(r) {
        const yr = r.pick([25, 30, 40]), tt = yr * YEAR;
        const x = (0.5 * Math.abs(HT_PDOT) * tt * tt) / HT.Pb;
        return {
          prompt: t`The Hulse–Taylor binary pulsar's orbit (period $P_b = 27\,907$ s) shrinks as it radiates gravitational waves: the period falls by $|\dot P_b| = ${sci(Math.abs(HT_PDOT))}$ s every second. Each orbit is a little shorter than the last, so periastron arrives earlier and earlier: after observing for a time $t$ the shift adds up to $\Delta T = \tfrac12\,(|\dot P_b|/P_b)\,t^2$. How many seconds early is periastron after ${yr} years? (1 year $= 3.156\times10^{7}$ s)`,
          answer: x, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 2 * x, feedback: 'Keep the ½.' }, { value: Math.abs(HT_PDOT) * tt, feedback: 'The shift grows as t², not t: each orbit adds a little more delay than the one before.' }],
          hints: [t`$t = ${yr}\times3.156\times10^{7}$ s $= ${sci(tt, 4)}$ s.`, t`$\Delta T = 0.5\times(${sci(Math.abs(HT_PDOT))}/27\,907)\times(${sci(tt, 4)})^2$.`],
          teach: 'A steady shrinking of the orbital period makes the periastron time drift quadratically — the curve that first proved gravitational waves carry energy away.',
          explain: t`$\Delta T = ${sci(x)}$ s. General relativity predicts $\dot P_b = ${sci(HT_PDOT)}$ from the quadrupole formula, with no adjustable parameters; the measured decay agrees to 0.2% (observed ÷ predicted $= 0.9983 \pm 0.0016$). Hulse and Taylor's discovery won the 1993 Nobel Prize.`,
          visual: pulsarCurve,
        };
      },
    }),
  ],
  sources: [
    { label: 'LIGO–Virgo, “Observation of gravitational waves from a binary black hole merger”, Phys. Rev. Lett. 116, 061102 (2016)', url: 'https://arxiv.org/abs/1602.03837' },
    { label: 'LIGO: the GW150914 detector summary', url: 'https://ligo.org/science-summaries/gw150914detector/' },
    { label: 'Weisberg & Huang, the Hulse–Taylor pulsar’s orbital decay (2016)', url: 'https://arxiv.org/abs/1606.02744' },
    { label: 'LIGO–Virgo, Fermi & INTEGRAL, GW170817 and the speed of gravity (2017)', url: 'https://arxiv.org/abs/1710.05834' },
    { label: 'Carroll, Lecture Notes on GR, ch. 6 (gravitational radiation)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
