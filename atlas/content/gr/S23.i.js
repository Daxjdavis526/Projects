// Gravitational time dilation and redshift — Intuition Mode. Clocks deeper in
// a gravitational well tick slower, by √(1 − r_s/r) relative to far away
// (≈ 1 − GM/rc² in weak fields); light climbing out is redshifted by the same
// factor. Measured from Pound–Rebka (1960) to optical clocks a millimetre
// apart; used every day by GPS (+45.7 gravity, −7.2 speed, net +38.5 μs/day
// in this simplified model; Ashby's full value 38.6).
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, C, M_SUN, R_SUN, GM_EARTH, R_EARTH, DAY, rs, mLen, sci, round } from './_fasttrack.js';
import { staticClockRate } from '../../src/viz/model/gravity.js';

const t = String.raw;

const K = GM_EARTH / (C * C);                  // GM/c² for Earth, m
const PER_DAY = DAY * 1e6;                     // μs per day, per unit fractional rate
const orbit = (altKm) => {
  const r = R_EARTH + altKm * 1e3;
  const grav = K * (1 / R_EARTH - 1 / r), speed = K / (2 * r);   // fractional rates: higher = faster, moving = slower
  return { r, grav, speed, net: grav - speed, v: Math.sqrt(GM_EARTH / r) };
};
const GPS_ALT = 20184, GPS = orbit(GPS_ALT);
const CROSS = R_EARTH / 2 / 1e3;               // net = 0 at r = 1.5 R: altitude R/2, km
const FACTORY = (() => { const [i, f] = (10.23 * (1 - GPS.net)).toFixed(10).split('.'); return `${i}.${f.match(/.{1,3}/g).join('\u2009')}`; })();   // MHz, decimals grouped in threes
const YEAR_MS = GPS.net * DAY * 365.25 * 1e3;  // a year of uncorrected offset, ms
const z = (M, r) => 1 / staticClockRate(r, mLen(M)) - 1;   // redshift of a static emitter at r, seen far away

// the GPS clock budget against altitude (in thousands of km), μs per day
const KD = round(K * PER_DAY, 6), RE = R_EARTH;
const budgetGraph = (extra = {}) => ({
  type: 'graph',
  params: {
    x: [0, 40], y: [-32, 62], xlabel: 'altitude (thousands of km)', ylabel: 'μs gained per day',
    constants: { KD, RE },
    sliders: [{ key: 'A', label: 'Altitude of a circular orbit', min: 0, max: 40, step: 0.05, value: extra.value ?? 20.18, unit: '\\times 1000\\ \\mathrm{km}', explain: 'The satellite’s clock is compared with one on the ground (Earth’s rotation ignored).' }],
    curves: [
      { fn: 'KD*(1/RE - 1/(RE + 1e6x))', color: 'gold', label: 'height: faster', labelAt: 33 },
      { fn: '-KD/(2(RE + 1e6x))', color: 'accent', label: 'speed: slower', labelAt: 13 },
      { fn: 'KD*(1/RE - 1/(RE + 1e6x)) - KD/(2(RE + 1e6x))', color: 'good', width: 3, label: 'net', labelAt: 25 },
    ],
    hlines: [{ y: 0 }],
    points: [
      ...(extra.marks === false ? [] : [
        { x: 0.42, y: round(orbit(420).net * PER_DAY, 4), color: 'ink2', label: 'ISS' },
        { x: round(GPS_ALT / 1e3, 4), y: round(GPS.net * PER_DAY, 4), color: 'ink2', label: 'GPS' },
        { x: 35.786, y: round(orbit(35786).net * PER_DAY, 4), color: 'ink2', label: 'GEO' },
      ]),
      { x: 'A', y: 'KD*(1/RE - 1/(RE + 1e6A)) - KD/(2(RE + 1e6A))', color: 'violet', r: 6 },
    ],
    readouts: [
      { label: 'altitude', expr: '1000A', unit: '\\mathrm{km}', digits: 5 },
      { label: 'height', expr: 'KD*(1/RE - 1/(RE + 1e6A))', unit: '\\mu\\mathrm{s/day}', digits: 3 },
      { label: 'speed', expr: '-KD/(2(RE + 1e6A))', unit: '\\mu\\mathrm{s/day}', digits: 3 },
      { label: 'net', expr: 'KD*(1/RE - 1/(RE + 1e6A)) - KD/(2(RE + 1e6A))', unit: '\\mu\\mathrm{s/day}', digits: 3 },
    ],
  },
  caption: 'A clock in a circular orbit compared with a clock on the ground: it gains from being higher (GM/c² · (1/R − 1/r)) and loses from moving (v²/2c²). Earth’s rotation and shape are ignored, a few-tenths-of-a-percent effect.',
});

// 1 + z against r/rₛ for a static emitter: exact, and the weak-field rule, with the emitter marked
const redshiftGraph = (k, label) => ({
  type: 'graph',
  params: {
    x: [1, 6], y: [1, 2.6], xlabel: 'r / rₛ', ylabel: '1 + z',
    curves: [
      { fn: '1/sqrt(1 - 1/x)', domain: [1.18, 6], color: 'bad', label: 'exact', labelAt: 3 },
      { fn: '1 + 1/(2x)', domain: [1, 6], color: 'ink3', dash: true, width: 1.6, label: 'weak field', labelAt: 4.6, labelDy: 14 },
    ],
    vlines: [{ x: k, label, color: 'accent' }],
  },
  caption: 'Redshift of light sent from a hovering emitter at r and received far away: exact, 1/√(1 − rₛ/r), and the weak-field rule 1 + rₛ/2r that works so well around ordinary stars.',
});

export default lesson({
  id: 'gr.S23.i',
  title: 'Clocks run slow low down: GPS and Pound–Rebka',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`Clocks deeper in a gravitational well tick more slowly, and light climbing out of the well arrives **redshifted** by the same factor. This is general relativity's most often and most precisely tested prediction: Pound and Rebka measured it up a 22.5 m tower in 1960; Gravity Probe A flew a hydrogen-maser clock to 10 000 km in 1976 and confirmed it to 2 parts in 10 000; two Galileo navigation satellites stranded in eccentric orbits pinned it to a few parts in 100 000 in 2018; optical clocks now see it across a millimetre. And every GPS receiver relies on it. For light sent from a static emitter at $r_\text{em}$ to a static receiver at $r_\text{rec}$:

$$1 + z = \frac{f_\text{em}}{f_\text{rec}} = \sqrt{\frac{1 - r_s/r_\text{rec}}{1 - r_s/r_\text{em}}}$$`,
  equation: t`\frac{d\tau}{dt} = \sqrt{1 - \frac{2GM}{rc^2}} \;\approx\; 1 - \frac{GM}{rc^2}`,
  symbols: [
    { tex: 'd\\tau/dt', text: 'the rate of a clock hovering at radius $r$, compared with a clock far away' },
    { tex: 'r', text: 'distance from the centre of the mass (the areal radius), in m' },
    { tex: 'G,\\ M', text: 'the gravitational constant and the mass; $GM = 3.986\\times10^{14}\\ \\text{m}^3/\\text{s}^2$ for Earth' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
    { tex: 'z', text: 'the redshift: the fraction by which the received frequency is lower' },
    { tex: 'f_\\text{em},\\ f_\\text{rec}', text: 'the frequency as measured by the emitter’s clock and by the receiver’s clock' },
    { tex: 'r_s', text: 'the Schwarzschild radius $2GM/c^2$; the approximation $\\approx$ holds when $r \\gg r_s$' },
  ],
  why: 'Near a black hole this factor runs all the way to zero: light from close to the horizon arrives redshifted almost to nothing — the reason a black hole looks black.',
  visual: {
    ...budgetGraph(),
    title: 'Why GPS clocks run fast',
    lead: t`A clock in orbit is **higher** than one on the ground (so it runs fast) and **moving** (so it runs slow). Slide the orbit's altitude and watch the two effects trade places.`,
    tasks: ['Start at the ISS (420 km): speed wins, and its clocks lose about 25 μs a day.', 'Find where the net curve crosses zero: about 3200 km up, the two effects cancel.', 'Go to GPS (20 200 km): height wins, and the clocks gain about 38.5 μs a day.'],
  },
  example: {
    prompt: t`GPS satellites orbit at $r = ${sci(GPS.r / 1e3, 4)}$ km from Earth's centre (20 200 km up). By how much do their clocks run fast or slow compared with clocks on the ground, per day? Use $GM/c^2 = ${sci(K * 1e3, 4)}$ mm for Earth and $R = 6371$ km.`,
    steps: [
      { label: 'Height', text: t`Each clock ticks at $1 - GM/(rc^2)$ relative to far away, so the satellite gains the difference: $\dfrac{GM}{c^2}\left(\dfrac{1}{R} - \dfrac{1}{r}\right) = ${sci(GPS.grav)}$. Over a day ($86\,400$ s) that is $+${sci(GPS.grav * PER_DAY)}$ μs.` },
      { label: 'Speed', text: t`In a circular orbit $v^2 = GM/r$, so $v = ${sci(GPS.v / 1e3)}$ km/s and moving clocks lose $v^2/2c^2 = ${sci(GPS.speed)}$: $-${sci(GPS.speed * PER_DAY)}$ μs a day.` },
      { label: 'Net', text: t`$+${sci(GPS.grav * PER_DAY)} - ${sci(GPS.speed * PER_DAY)} = +${sci(GPS.net * PER_DAY)}$ μs per day: the satellite clocks run **fast**. (The full calculation, with Earth's rotation and shape, gives 45.8, 7.2 and 38.6 μs.)` },
      { label: 'The fix', text: t`The fractional offset is $${sci(GPS.net)}$, so the clocks are built to tick at $10.23\ \text{MHz}\times(1 - ${sci(GPS.net)}) = ${FACTORY.replace(/\u2009/g, '\\,')}$ MHz on the ground — and 10.23 MHz once in orbit.` },
      { label: 'Why it matters', text: t`GPS finds you by timing light from several satellites. Light travels ${sci((C * GPS.net * DAY) / 1e3)} km in ${sci(GPS.net * PER_DAY)} μs, and a timing error of just 1 ns is 30 cm of position error. General relativity is engineering here.` },
    ],
    answer: t`Height: $+${sci(GPS.grav * PER_DAY)}$ μs/day; speed: $-${sci(GPS.speed * PER_DAY)}$ μs/day; net $+${sci(GPS.net * PER_DAY)}$ μs/day. GPS clocks are set slow before launch to cancel it.`,
  },
  practice: [
    num({
      id: 'star-z', difficulty: 2,
      gen(r) {
        const [name, m, rad] = r.pick([['the Sun', 1, R_SUN], ['Sirius A (2.06 solar masses, radius 1.19 million km)', 2.06, 1.19e9], ['Proxima Centauri (0.122 solar masses, radius 107 000 km)', 0.122, 1.07e8]]);
        const zz = z(m * M_SUN, rad);
        return {
          visual: {
            type: 'graph',
            params: {
              x: [0, 10.5], y: [-1.3, 0.3], xlabel: 'distance from the centre ÷ the star’s radius', ylabel: 'clock rate − 1 (units of GM/Rc²)',
              shade: [{ fn: '0.3', lower: '-1.3', from: 0, to: 1, color: 'gold', alpha: 0.14 }],
              curves: [{ fn: '-1/x', domain: [1, 10.5], color: 'gold' }],
              hlines: [{ y: 0, label: 'received far away' }],
              points: [{ x: 1, y: -1, color: 'bad' }, { x: 1.15, y: -1.13, r: 0.5, color: 'bad', label: 'emitted here' }, { x: 0.08, y: -1.22, r: 0.5, color: 'gold', label: 'star' }],
            },
            caption: 'How far a hovering clock runs behind a far-away one — the depth of the gravitational well — in units of its value at the star’s surface. Light climbing out is redshifted by the depth it climbs.',
          },
          prompt: t`Light leaves the surface of ${name}${name === 'the Sun' ? ' (radius 696 000 km)' : ''} and is received far away. By what fraction $z$ is it redshifted by gravity? (1 solar mass $= 1.989\times10^{30}$ kg)`,
          answer: zz, tol: { rel: 0.01 },
          errors: [{ value: 2 * zz, feedback: 'That is r_s/R. The redshift is half of that in a weak field: z ≈ GM/(Rc²) = rₛ/(2R).' }],
          hints: [t`In a weak field, $z \approx \dfrac{GM}{Rc^2} = \dfrac{r_s}{2R}$.`, t`$GM/(Rc^2) = (6.674\times10^{-11})(${sci(m * M_SUN)})/((${sci(rad)})(2.998\times10^{8})^2)$.`],
          teach: 'Light escaping from radius R is redshifted by z ≈ GM/(Rc²) in a weak field — a few parts per million for a star like the Sun.',
          explain: t`$z = ${sci(zz)}$. Astronomers often quote it as a Doppler speed, $zc = ${sci((zz * C) / 1e3)}$ km/s — for the Sun, about 0.6 km/s, which has been measured in its spectral lines.`,
        };
      },
    }),
    num({
      id: 'ns', difficulty: 2,
      gen(r) {
        const [m, rk] = r.pick([[1.4, 12], [1.4, 10], [2.0, 12], [1.2, 11]]);
        const oneZ = 1 + z(m * M_SUN, rk * 1e3);
        return {
          visual: redshiftGraph(round((rk * 1e3) / rs(m * M_SUN), 4), 'surface'),
          prompt: t`A neutron star has ${m} solar masses packed into a radius of ${rk} km. Light from its surface reaches us with what factor $1 + z$ (emitted frequency ÷ received frequency)?`,
          answer: oneZ, tol: { rel: 0.003 },
          errors: [{ value: 1 + (G * m * M_SUN) / (rk * 1e3 * C * C), feedback: 'That is the weak-field approximation. Here r_s/R is large: use 1/√(1 − rₛ/R).' }, { value: Math.sqrt(1 - rs(m * M_SUN) / (rk * 1e3)), feedback: 'Flip it: 1 + z = 1/√(1 − rₛ/R), which is larger than 1.' }],
          hints: [t`$1 + z = 1/\sqrt{1 - r_s/R}$ for light received far away.`, t`$r_s = ${sci(rs(m * M_SUN) / 1e3)}$ km, so $r_s/R = ${sci(rs(m * M_SUN) / (rk * 1e3))}$.`],
          teach: 'For strong gravity use the exact factor: 1 + z = 1/√(1 − r_s/R).',
          explain: t`$1 + z = 1/\sqrt{1 - ${sci(rs(m * M_SUN) / (rk * 1e3))}} = ${sci(oneZ, 4)}$: lines from the surface arrive at ${Math.round(100 / oneZ)}% of their emitted frequency. Measuring such shifts is one way to weigh and size neutron stars.`,
        };
      },
    }),
    {
      type: 'slider', id: 'crossover', difficulty: 2, param: 'A', answer: [3.0, 3.4],
      prompt: 'Set the slider to the orbit altitude at which a satellite’s clock neither gains nor loses against a ground clock.',
      instruction: 'Move the altitude slider in the picture (in thousands of km), then check.',
      hints: ['Watch the green net curve.', 'It crosses zero where the height gain equals the speed loss — a little above 3000 km.'],
      teach: 'Low orbits lose time (speed wins), high orbits gain it (height wins); the two cancel at r = 1.5 R, about 3200 km up.',
      explain: t`The net is zero when $\dfrac{GM}{c^2}\left(\dfrac1R - \dfrac1r\right) = \dfrac{GM}{2rc^2}$, which gives $r = \tfrac32 R$: an altitude of $R/2 = ${Math.round(CROSS)}$ km.`,
      visual: budgetGraph({ value: 10, marks: false }),
    },
    num({
      id: 'gnss', difficulty: 3,
      gen(r) {
        const [name, alt] = r.pick([['Galileo (Europe)', 23222], ['GLONASS (Russia)', 19100], ['BeiDou’s medium orbits (China)', 21528], ['GPS (USA)', 20184]]);
        const o = orbit(alt);
        return {
          prompt: t`${name} satellites orbit ${alt.toLocaleString('en-US')} km above the ground. Taking both effects into account, how many microseconds per day do their clocks gain on ground clocks? ($GM/c^2 = ${sci(K * 1e3, 4)}$ mm for Earth, $R = 6371$ km.)`,
          answer: o.net * PER_DAY, units: 'μs', tol: { rel: 0.01 },
          errors: [{ value: o.grav * PER_DAY, feedback: 'That is the height effect alone. The orbital speed makes the clock lose v²/2c² as well.' }, { value: (o.grav + o.speed) * PER_DAY, feedback: 'The speed effect slows the satellite clock: subtract it.' }],
          hints: [t`Height: $\dfrac{GM}{c^2}\left(\dfrac1R - \dfrac1r\right)$ with $r = R + ${alt}$ km. Speed: $\dfrac{GM}{2rc^2}$ (circular orbit).`, t`Height $= ${sci(o.grav)}$, speed $= ${sci(o.speed)}$; subtract, then multiply by $86\,400\times10^{6}$ μs.`],
          teach: 'A navigation satellite’s clock gains from height and loses from speed; above about 3200 km, height wins.',
          explain: t`Height $+${sci(o.grav * PER_DAY)}$ μs, speed $-${sci(o.speed * PER_DAY)}$ μs: net $+${sci(o.net * PER_DAY)}$ μs per day. Every navigation system has to correct for it.`,
          visual: budgetGraph({ value: round(alt / 1e3, 3) }),
        };
      },
    }),
    mcq({
      id: 'climbing-light', difficulty: 2,
      prompt: 'Light climbs from the ground floor to the top of a tower and arrives with a slightly lower frequency. What is the best way to describe what happened?',
      choices: [
        'The top clock ticks faster, so it counts fewer wave crests per tick; to observers hovering at each height the light seems to have lost energy, but energy depends on who measures',
        'The light slowed down below c as it climbed',
        'Space expanded while the light was travelling, stretching its wavelength',
        'Some of the light was absorbed on the way, lowering its frequency',
      ],
      answer: 0,
      why: {
        1: 'Measured locally, light always travels at c.',
        2: 'That is the cosmological redshift of distant galaxies. Here nothing expands; the tower is static.',
        3: 'Absorption dims light; it does not change its frequency.',
      },
      hints: ['The crests arrive at the top at the same rate they left the bottom — counted in far-away time. What differs between the two places?'],
      teach: 'Gravitational redshift is a comparison of clocks: higher clocks tick faster, so they measure lower frequencies for the same light.',
      explain: 'Nothing happens to the light on the way: the set-up is static, so crests arrive at the rate they were sent, in far-away time. But the top clock ticks faster than the bottom one, so it counts fewer crests per tick — a lower frequency. Saying the photon "lost energy climbing" is a fair description for hovering observers, but it is not a statement every observer would make.',
      visual: {
        type: 'graph',
        params: {
          x: [-0.3, 1.6], y: [0, 6.6], xlabel: 'height', ylabel: 'far-away time', grid: false,
          curves: [
            { param: ['0', 't'], t: [0, 6.3], color: 'accent', width: 2 },
            { param: ['1', 't'], t: [0, 6.3], color: 'violet', width: 2 },
            ...[0, 1, 2, 3, 4, 5].map((k) => ({ fn: `x + ${k}`, domain: [0, 1], color: 'gold', width: 1.6, ...(k === 5 ? { label: 'wave crests', labelAt: 0.22, labelDy: 14 } : {}) })),
          ],
          points: [
            ...[0, 1, 2, 3, 4, 5, 6].map((k) => ({ x: 0, y: k, color: 'accent', r: 3.5 })),
            ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ x: 1, y: round(0.8 * k, 2), color: 'violet', r: 3.5 })),
            { x: -0.02, y: 6.35, r: 0.5, color: 'accent', label: 'bottom clock' }, { x: 0.98, y: 6.35, r: 0.5, color: 'violet', label: 'top clock' },
          ],
        },
        caption: 'Spacetime picture, hugely exaggerated: far-away time runs up the page. Dots are the ticks of a clock at the bottom of the tower (blue) and at the top (violet); gold lines are successive wave crests climbing from one to the other.',
      },
    }),
    mcq({
      id: 'centre', difficulty: 3,
      prompt: 'At the very centre of the Earth, gravity’s pull is zero. Compared with a clock on the surface, a clock at the centre runs…',
      choices: [
        'slower — clock rates depend on how deep in the gravitational well you are, not on the local pull',
        'at the same rate, because there is no gravity there',
        'faster, because nothing pulls on it',
        'at a rate that cannot be defined',
      ],
      answer: 0,
      why: {
        1: 'Zero pull means the well is flat at the bottom, not that you are out of it.',
        2: 'Clocks run fast where you are higher in the well, not where the pull is weak.',
        3: 'A clock at rest at the centre ticks perfectly well; its rate is set by the potential there.',
      },
      hints: ['Is the centre higher or lower in the gravitational well than the surface? You would have to do work to climb from the centre to the surface.', t`The rate is $1 + \Phi/c^2$, where $\Phi$ is the potential — the depth of the well — not its slope $g$.`],
      teach: 'Gravitational time dilation follows the potential Φ (how deep in the well), not the field g (how steep).',
      explain: 'To climb from the centre to the surface you must do work against gravity, so the centre is lower in the well. For a uniform Earth the centre is 1.5 times as deep as the surface, and a clock there would lose about 30 μs a day against a surface clock — even though nothing pulls on it.',
      visual: {
        type: 'graph',
        params: {
          x: [0, 3.05], y: [-1.75, 1.3], xlabel: 'distance from the centre ÷ Earth’s radius', ylabel: '',
          curves: [
            { fn: '-(3 - x^2)/2', domain: [0, 1], color: 'gold' },
            { fn: '-1/x', domain: [1, 3.05], color: 'gold', label: 'depth of the well', labelAt: 2, labelDy: 14 },
            { fn: 'x', domain: [0, 1], color: 'accent' },
            { fn: '1/x^2', domain: [1, 3.05], color: 'accent', label: 'pull g', labelAt: 2 },
          ],
          vlines: [{ x: 1, label: 'surface' }],
          hlines: [{ y: 0 }],
          points: [{ x: 0, y: -1.5, color: 'gold', label: 'centre' }, { x: 0, y: 0, color: 'accent' }],
        },
        caption: 'A uniform Earth, each curve in units of its value at the surface. Gold: the depth of the gravitational well (the potential). Blue: the pull g, its slope. The real Earth is denser in the middle, which makes its centre deeper still.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-static', difficulty: 2,
      gen(r) {
        const k = r.pick([1.5, 2, 3, 5]);
        const zz = 1 / Math.sqrt(1 - 1 / k) - 1;
        return {
          visual: redshiftGraph(k, 'probe'),
          prompt: t`A probe hovers at $r = ${k}\,r_s$ above a black hole and beams radio signals to a distant station. What is the redshift $z$ of the signal received far away?`,
          answer: zz, tol: { rel: 0.005 },
          errors: [{ value: 1 / Math.sqrt(1 - 1 / k), feedback: 'That is 1 + z. Subtract 1 to get z.' }, { value: 1 - Math.sqrt(1 - 1 / k), feedback: 'Use 1 + z = 1/√(1 − rₛ/r), not 1 − √(1 − rₛ/r).' }],
          hints: [t`$1 + z = 1/\sqrt{1 - r_s/r}$ for a receiver far away.`],
          teach: 'A static emitter at r is seen from far away with redshift 1 + z = 1/√(1 − r_s/r).',
          explain: t`$1 + z = 1/\sqrt{1 - 1/${k}} = ${sci(1 + zz, 4)}$, so $z = ${sci(zz, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-gps-fix', difficulty: 2,
      prompt: 'GPS satellite clocks gain about 38 microseconds a day on ground clocks because of relativity. What do engineers do about it?',
      choices: [
        'Build the clocks to tick slightly slow on the ground, so that in orbit they tick at the right rate',
        'Nothing: 38 microseconds is far too small to matter',
        'Reset the clocks once a year',
        'Shield the clocks from gravity inside the satellite',
      ],
      answer: 0,
      why: {
        1: `Light travels about ${sci((C * GPS.net * DAY) / 1e3)} km in ${sci(GPS.net * PER_DAY)} μs, and positions come from light-travel times: it matters enormously.`,
        2: `A year of uncorrected offset would be ${sci(YEAR_MS, 2)} milliseconds — ${Math.round((C * YEAR_MS) / 1e6).toLocaleString('en-US')} km of light travel.`,
        3: 'Gravity cannot be shielded, and the effect is a property of time at that altitude, not a force on the clock.',
      },
      hints: ['The offset is steady and predictable. How would you cancel a clock that always runs fast by the same fraction?'],
      teach: `GPS clocks are set to ${FACTORY} MHz on the ground so that, after relativity, they tick at 10.23 MHz in orbit.`,
      explain: t`The fractional offset ($${sci(GPS.net)}$) is built in before launch: the clocks are tuned to ${FACTORY} MHz so that, in orbit, they run at the nominal 10.23 MHz as seen from the ground. Small extra corrections for slightly eccentric orbits are made in the receivers.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 10.4], y: [-25, 430], xlabel: 'days in orbit', ylabel: 'clock error (μs)',
          curves: [
            { fn: `${round(GPS.net * PER_DAY, 4)}*x`, domain: [0, 10], color: 'bad', label: 'uncorrected', labelAt: 6, labelDx: -84, labelDy: -6 },
            { fn: '0', domain: [0, 10], color: 'good', label: 'corrected', labelAt: 7 },
          ],
        },
        caption: `A GPS clock’s error if its relativistic gain were left alone: ${sci(GPS.net * PER_DAY)} μs a day, and every microsecond is 300 m of light travel — ${(C * GPS.net * DAY / 1e3).toFixed(1)} km after one day.`,
      },
    }),
    num({
      id: 'cp-white-dwarf', difficulty: 3, transfer: true,
      gen(r) {
        const [m, rk] = r.pick([[1.0, 5800], [0.6, 8700], [1.02, 5640]]);
        const zz = z(m * M_SUN, rk * 1e3), v = (zz * C) / 1e3;
        const LS = round(Math.log10(R_SUN / 1e3), 4), LW = round(Math.log10(rk), 4), deep = (m * R_SUN) / 1e3 / rk;   // depths in units of the Sun's surface depth
        return {
          visual: {
            type: 'graph',
            params: {
              x: [3.4, 7.1], y: [round(-1.15 * deep, 2), round(0.12 * deep, 2)], xlabel: 'log₁₀(distance from the centre in km)', ylabel: 'clock rate − 1 (Sun’s surface = −1)',
              curves: [
                { fn: `-${m}*10^(${LS} - x)`, domain: [LW, 7.1], color: 'teal', label: 'white dwarf', labelAt: 4.4, labelDy: 14 },
                { fn: `-10^(${LS} - x)`, domain: [LS, 7.1], color: 'gold', width: 3, label: 'Sun', labelAt: 6.2 },
              ],
              hlines: [{ y: 0 }],
              points: [{ x: LW, y: round(-deep, 3), color: 'teal' }, { x: LS, y: -1, color: 'gold' }],
            },
            caption: 'The gravitational well outside the Sun and outside this white dwarf, each drawn from its surface outward. The white dwarf has about the Sun’s mass, but its surface sits far closer to the centre, so light leaving it climbs out of a far deeper well.',
          },
          prompt: t`A white dwarf packs ${m} solar masses into a radius of ${rk.toLocaleString('en-US')} km — about the size of Earth. Astronomers quote its gravitational redshift as a Doppler speed, $zc$. What is $zc$, in km/s?`,
          answer: v, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: 2 * v, feedback: 'z ≈ GM/(Rc²), which is rₛ/(2R), not rₛ/R.' }],
          hints: [t`In this weak field $z \approx GM/(Rc^2)$, so $zc \approx GM/(Rc)$.`, t`$GM/(Rc) = (6.674\times10^{-11})(${sci(m * M_SUN)})/((${sci(rk * 1e3)})(2.998\times10^{8}))$ m/s.`],
          teach: 'The gravitational redshift of a compact star, quoted as a speed, is about GM/(Rc): tens of km/s for a white dwarf.',
          explain: t`$z = ${sci(zz)}$ and $zc = ${sci(v)}$ km/s — far more than the Sun's ${sci((z(M_SUN, R_SUN) * C) / 1e3, 2)} km/s, because the mass sits so close to the centre. Shifts of this size are measured in white-dwarf spectra, such as that of Sirius B.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Ashby, “Relativity in the Global Positioning System”, Living Rev. Relativ. 6, 1 (2003)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/' },
    { label: 'Will, “The Confrontation between General Relativity and Experiment”, Living Rev. Relativ. 17, 4 (2014)', url: 'https://arxiv.org/abs/1403.7377' },
    { label: 'Pound & Rebka, Phys. Rev. Lett. 4, 337 (1960)', url: 'https://doi.org/10.1103/PhysRevLett.4.337' },
    { label: 'Delva et al., Galileo satellites test of the gravitational redshift (2018)', url: 'https://arxiv.org/abs/1812.03711' },
  ],
});
