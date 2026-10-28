// Where Newton's gravity ends: the observed cracks — Mercury's extra 43″ per
// century, starlight bent by twice Newton's value, GPS clocks running fast —
// the strength-of-gravity number GM/(rc²) that sizes them, and the hand-over
// to the Road to Einstein (gr.S01.i, gr.S06.i).
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { GM_EARTH, GM_SUN, R_EARTH, AU, C, grp, keplerPicture } from './_gravity.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (v) => +(+v).toFixed(4);
const ARCSEC = Math.PI / 648000;
const R_SUN = 6.957e8;
const eps = (GM, r) => GM / (r * C * C);

// the strength of gravity, GM/(rc²), at places where it has been tested
const LADDER = [
  ['GPS orbit', eps(GM_EARTH, 26560e3)], ['Earth’s surface', eps(GM_EARTH, R_EARTH)], ['Mercury’s orbit', eps(GM_SUN, 5.791e10)],
  ['the Sun’s surface', eps(GM_SUN, R_SUN)], ['S2 at closest approach', eps(4.3e6 * GM_SUN, 120 * AU)], ['neutron star surface', eps(1.4 * GM_SUN, 12e3)], ['black hole horizon', 0.5],
];
const ladder = (hide) => ({
  type: 'graph',
  params: {
    x: [-11, 1.6], y: [0.2, LADDER.length + 0.7], xlabel: 'log₁₀( GM / rc² )', ylabel: '', yticks: 0.001, aspect: 'wide',
    points: LADDER.map(([n, e], i) => {
      const x = n === hide ? -10.6 : r4(Math.log10(e)), left = x > -2;      // the strongest-gravity rungs are labelled to their left
      return { x, y: LADDER.length - i, color: n === hide ? 'gold' : 'accent', label: n === hide ? `${n}: ?` : n, labelDx: left ? -8 : 8, labelDy: 0, labelAlign: left ? 'right' : undefined, r: n === hide ? 0.01 : 5 };
    }),
    vlines: [{ x: Math.log10(0.5), label: 'horizon', color: 'warn' }],
  },
  caption: 'How strong gravity is at each place, measured by GM/(rc²), on a logarithmic scale: each step right is ten times stronger. Newton’s theory is superb on the left and fails on the right.',
});

// a ray of light passing a body (radius rb in picture units; the ray passes at
// 1.05), its bend hugely exaggerated
const bendPicture = ({ body = 'the Sun', label = 'Sun', color = 'gold', rb = 1, what = 'Starlight grazing the Sun' } = {}) => ({
  type: 'graph',
  params: {
    x: [-5.5, 5.5], y: [-1.6, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
    shade: [{ fn: `sqrt(max(0, ${rb * rb} - x^2))`, lower: `-sqrt(max(0, ${rb * rb} - x^2))`, from: -rb, to: rb, color, alpha: 0.7 }],
    curves: [
      { param: ['t', '1.05 + 0.18*(sqrt(t^2 + 1.1) - 1.05)'], t: [-5.4, 5.4], color: 'accent', width: 2 },
      { param: ['t', '1.05 + 0.18*(sqrt(29.16 + 1.1) - 1.05) - 0.18*(5.4 + t)*0.98'], t: [-5.4, 5.4], color: 'ink3', width: 1, dash: true },
    ],
    points: [{ x: -4.6, y: 1.95, r: 0.01, color: 'accent', label: 'starlight' }, { x: 0, y: rb < 0.5 ? -0.35 : 0, r: 0.01, color: 'ink', label, labelDx: -12 }],
  },
  caption: `${what} on its way to Earth (to the right): the path bends toward ${body}. The bend is drawn enormously exaggerated.`,
});

const MERC = { orbitDays: 87.969 };
MERC.perOrbit = (43 * MERC.orbitDays) / 36525;
const BEND_N = (2 * GM_SUN) / (C * C * R_SUN) / ARCSEC;      // ″, Newton's light particle (also the equivalence-principle value)

export default lesson({
  id: 'phys2210.M13.6',
  title: 'Where Newton’s gravity ends: a preview of Einstein',
  minutes: 10, difficulty: 2,
  intro: t`Newton's law has passed every test in this module: the Moon, the planets, satellites, the tides. Yet a few measurements disagree with it — and each is matched, with nothing adjusted, by Einstein's general relativity. All of these are **observed**:

- **Mercury's orbit** turns by 43″ (arcseconds) per century more than Newton's gravity allows, even after every other planet's pull is counted (an excess first noticed by Le Verrier in 1859).
- **Starlight grazing the Sun** bends by 1.75″ — **twice** what Newton's gravity gives a particle moving at the speed of light (favoured by the 1919 eclipse photographs; confirmed by radio telescopes to about one part in ten thousand).
- **Clocks in GPS satellites** run fast by about 38 microseconds a day compared with clocks on the ground. Newton's theory has one universal time and predicts no such thing; every GPS satellite is corrected for it.

How large such effects are is set by one number, the strength of gravity compared with $c^2$:

$$\varepsilon = \frac{GM}{rc^2}$$

> Continue on the Road to Einstein: [Newton's gravity and the 43 arcseconds it cannot explain](#/lesson/gr.S01.i), then [Gravity is mostly time running at different rates](#/lesson/gr.S06.i).`,
  symbols: [
    { tex: '\\varepsilon', text: 'a pure number measuring how strong gravity is: about $10^{-9}$ at Earth’s surface, $2.6\\times10^{-8}$ along Mercury’s orbit, 0.5 at a black hole’s horizon' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$' },
    { tex: 'M', text: 'the mass doing the attracting, in kg' },
    { tex: 'r', text: 'the distance from its centre, in m' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
  ],
  why: 'Every test of relativity is a place where ε stops being negligible; wherever it is tiny, Einstein’s theory gives back Newton’s answers — which is why everything in this module still holds.',
  visual: {
    type: 'orbit',
    title: 'Newton’s orbits close; Einstein’s turn',
    lead: t`A planet released from the same point with the same angular momentum, under Newton's gravity and under Einstein's. This orbit is drawn very close to its central mass, a few dozen times $GM/c^2$ away, where $\varepsilon$ is a few per cent and the difference shows in a single lap.`,
    tasks: [
      'With gravity set to Newton the planet retraces one ellipse forever: the orbit closes.',
      'Switch to Einstein: the closest point moves forward by about 86° on every lap — the same effect that turns Mercury’s orbit by 43″ a century, hugely enlarged.',
      'Move the orbit outward — r₀ = 40 and L = 6.2 — and the advance falls to about 35° per lap. The farther out the orbit, the smaller the advance; Mercury’s orbit is about a million times farther out than this one.',
    ],
    params: { mode: 'newton', r0: 30, L: 4.6, compare: true },
    caption: t`Distances in units of $GM/c^2$ (1.48 km for the Sun). Mercury orbits about 39 million of these units from the Sun, where the advance is only $0.10''$ per orbit; this picture exaggerates it millions of times over. The right panel is a graph of energy, not a picture of space.`,
  },
  example: {
    prompt: t`How much should the Sun bend the light of a star that grazes its edge? Treat light as Newton would — a particle moving at $c$ — then compare with general relativity. Use $GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $R_\odot = 6.957\times10^{8}$ m, $c = 2.998\times10^{8}$ m/s and $1'' = 4.848\times10^{-6}$ rad.`,
    visual: bendPicture(),
    steps: [
      { label: 'How strong is gravity there?', text: t`At the Sun's surface $\varepsilon = \dfrac{GM}{Rc^2} = \dfrac{1.327\times10^{20}}{(6.957\times10^{8})(2.998\times10^{8})^2} = ${tex(eps(GM_SUN, R_SUN))}$.` },
      { label: 'Newton’s answer', text: t`A fast particle passing a mass is deflected by $2\varepsilon$ radians (a result of Newton's law, worked out by Soldner in 1801): $2\times${tex(eps(GM_SUN, R_SUN))} = ${tex(2 * eps(GM_SUN, R_SUN))}$ rad $= ${s3(BEND_N)}''$.` },
      { label: 'Einstein’s answer', text: t`General relativity gives **twice** that, $4\varepsilon = ${s3(2 * BEND_N)}''$: half comes from curved time, which pulls on light as it does on any particle; the other half from curved space, which matters as much as curved time for anything moving at $c$.` },
      { label: 'What is observed', text: t`The 1919 eclipse photographs favoured the full $1.75''$ (with uncertainties of tens of per cent). Radio telescopes tracking quasars near the Sun now confirm Einstein's value to about one part in ten thousand: Newton's is ruled out.` },
      { label: 'Sense check', text: t`$1.75''$ is the width of a coin seen from about 3 km away — tiny, because $\varepsilon$ is only $2\times10^{-6}$. Near a black hole, where $\varepsilon$ approaches 0.5, light can be bent right round.` },
    ],
    answer: t`Newton: $${s3(BEND_N)}''$. Einstein: $${s3(2 * BEND_N)}''$ — the value observed.`,
  },
  practice: [
    match({
      id: 'observed', difficulty: 1,
      prompt: 'Match each observation to what is measured. All of these have been observed; only one is fully explained by Newton’s gravity.',
      left: ['Mercury’s orbit', 'Starlight grazing the Sun', 'Clocks on GPS satellites', 'The Moon’s orbit'],
      right: ['turns 43″ per century more than Newton predicts', 'bends by 1.75″, twice Newton’s value', 'run fast by about 38 μs per day', 'needs 2.7 mm/s² of acceleration, as Newton’s law predicts', 'passes straight by, because light has no mass'],
      answer: [0, 1, 2, 3],
      hints: ['Three of the four are the classic tests of general relativity; the fourth is Newton’s own Moon test.'],
      teach: 'Mercury’s perihelion, light bending and clock rates are observed effects that Newton’s gravity cannot explain and general relativity does.',
      explain: 'Mercury’s extra 43″ per century, light bending of 1.75″ and the GPS clocks’ 38 μs per day are all measured, and all predicted by general relativity. The Moon’s acceleration is Newton’s triumph — agreeing with his inverse-square law to about 1%.',
      visual: ladder(),
    }),
    num({
      id: 'mercury-orbit', difficulty: 2,
      prompt: t`Mercury's orbit turns by an extra $43''$ per century, and Mercury goes round the Sun once every 87.969 days. By how many arcseconds does the orbit turn per orbit? (One century is $36\,525$ days.)`,
      answer: MERC.perOrbit, units: 'arcsec', tol: { rel: 0.01 },
      errors: [{ value: 43 / 100, feedback: 'That is per year. Mercury orbits about four times a year.' }, { value: (43 * 36525) / 87.969, feedback: 'Divide by the number of orbits in a century, not multiply.' }],
      hints: [t`Orbits per century: $36\,525/87.969$.`, t`Divide $43''$ by that number.`],
      teach: 'Mercury’s anomalous turn is a tenth of an arcsecond per orbit — detectable only because it accumulates over centuries.',
      explain: t`$36\,525/87.969 = ${s3(36525 / 87.969)}$ orbits per century, so $43''/${s3(36525 / 87.969)} = ${s3(MERC.perOrbit)}''$ per orbit — the width of a hair seen from 150 m away. General relativity predicts $42.98''$ per century.`,
      visual: keplerPicture('mercury', { t: 0.15, caption: 'Mercury’s orbit, to scale. The extra turn per orbit is far too small to draw.' }),
    }),
    num({
      id: 'newton-light', difficulty: 2,
      gen(r) {
        const v = r.pick([
          { what: 'radio waves from a quasar passing 10 solar radii from the Sun’s centre', GM: GM_SUN, b: 10 * R_SUN, pic: { rb: 0.105, what: 'Radio waves from a quasar passing ten solar radii from the Sun' },
            seen: ' — radio telescopes measure deflections like this for quasars a few degrees from the Sun, and find Einstein’s value' },
          { what: 'light grazing the edge of Jupiter', GM: 1.26687e17, b: 7.1492e7, pic: { body: 'Jupiter', label: 'Jupiter', color: 'warn', what: 'Light grazing Jupiter' },
            seen: ' — radio astronomers measured Jupiter bending a quasar’s light in 2002, as the planet passed close to it in the sky' },
        ]);
        const { GM, b } = v;
        const d = (2 * GM) / (C * C * b) / ARCSEC;
        return {
          prompt: t`Newton's gravity, treating light as a particle moving at $c$, predicts that light passing a body at distance $b$ from its centre is deflected by $2GM/(c^2b)$ radians. Compute it, in arcseconds, for ${v.what}: $GM = ${tex(GM, 4)}\ \text{m}^3/\text{s}^2$ and $b = ${tex(b, 4)}$ m. Use $c = 2.998\times10^{8}$ m/s and $1'' = 4.848\times10^{-6}$ rad.`,
          answer: d, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: 2 * d, feedback: 'That is general relativity’s value, twice Newton’s. The question asks for 2GM/(c²b).' }, { value: (2 * GM) / (C * C * b), feedback: 'That is in radians; divide by 4.848 × 10⁻⁶ for arcseconds.' }],
          hints: [t`Compute $2GM/(c^2b)$ in radians, then divide by $4.848\times10^{-6}$.`],
          teach: 'Newton’s gravity bends light half as much as is observed; the full, observed value comes from general relativity.',
          explain: t`$\dfrac{2(${tex(GM, 4)})}{(2.998\times10^{8})^2(${tex(b, 4)})} = ${tex(d * ARCSEC)}$ rad $= ${s3(d)}''$. General relativity doubles it, to $${s3(2 * d)}''$${v.seen}.`,
          visual: bendPicture(v.pic),
        };
      },
    }),
    num({
      id: 'gps-error', difficulty: 1,
      prompt: t`GPS receivers find their position from the travel times of radio signals, which move at $c = 3.00\times10^{8}$ m/s. If the satellites' clocks were left to run 38 microseconds a day fast, how large a position error would build up in one day, in kilometres?`,
      answer: (3e8 * 38e-6) / 1000, units: 'km', tol: { rel: 0.01 },
      errors: [{ value: 3e8 * 38e-6, feedback: 'That is in metres. Divide by 1000 for kilometres.' }, { value: (3e8 * 38) / 1000, feedback: 'Convert the time to seconds first: 38 μs = 38 × 10⁻⁶ s.' }],
      hints: [t`A timing error $\Delta t$ becomes a distance error $c\,\Delta t$.`],
      teach: 'Relativity is engineering in GPS: a clock error of microseconds becomes kilometres of position error.',
      explain: t`$c\,\Delta t = (3.00\times10^{8})(38\times10^{-6}) = ${grp(Math.round(3e8 * 38e-6))}$ m $\approx ${s3((3e8 * 38e-6) / 1000)}$ km a day. The satellite clocks are set to tick slow before launch — by exactly the amount general relativity predicts — so this never happens. Newton's theory, with one universal time, would not even know a correction was needed.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 10.5], y: [0, 420], xlabel: 'days in orbit', ylabel: 'clock error (μs)', aspect: 'wide',
          curves: [{ fn: '38*x', domain: [0, 10.5], color: 'bad' }],
          points: [{ x: 1, y: 38, color: 'gold', label: '38 μs after one day', labelDx: 8, labelDy: -10 }],
        },
        caption: 'An uncorrected GPS satellite clock would gain on ground clocks steadily, 38 μs every day. A receiver turns every microsecond of clock error into a distance error.',
      },
    }),
    num({
      id: 'epsilon', difficulty: 2,
      gen(r) {
        const [what, data, GM, rr, hide] = r.pick([
          ['at Earth’s surface', '$GM = 3.986\\times10^{14}\\ \\text{m}^3/\\text{s}^2$, $r = 6.371\\times10^{6}$ m', GM_EARTH, R_EARTH, 'Earth’s surface'],
          ['along Mercury’s orbit', '$GM_\\odot = 1.327\\times10^{20}\\ \\text{m}^3/\\text{s}^2$, $r = 5.79\\times10^{10}$ m', GM_SUN, 5.79e10, 'Mercury’s orbit'],
          ['at the Sun’s surface', '$GM_\\odot = 1.327\\times10^{20}\\ \\text{m}^3/\\text{s}^2$, $r = 6.957\\times10^{8}$ m', GM_SUN, R_SUN, 'the Sun’s surface'],
          ['at a GPS satellite', '$GM = 3.986\\times10^{14}\\ \\text{m}^3/\\text{s}^2$, $r = 2.656\\times10^{7}$ m', GM_EARTH, 26.56e6, 'GPS orbit'],
        ]);
        const e = eps(GM, rr);
        return {
          prompt: t`How strong is gravity ${what}, as measured by $\varepsilon = GM/(rc^2)$? Use ${data} and $c = 2.998\times10^{8}$ m/s.`,
          answer: e, tol: { rel: 0.01 },
          errors: [{ value: GM / (rr * C), feedback: 'Divide by c squared.' }, { value: (2 * GM) / (rr * C * C), feedback: 'That is 2GM/(rc²), twice ε.' }],
          hints: [t`$\varepsilon = \dfrac{GM}{rc^2}$, all in SI units.`],
          teach: 'GM/(rc²) measures how strong gravity is; relativistic corrections to Newton are of about this size.',
          explain: t`$\varepsilon = \dfrac{${tex(GM, 4)}}{(${tex(rr, 4)})(2.998\times10^{8})^2} = ${tex(e)}$. ${e < 1e-7 ? 'Tiny: here Newton’s gravity is excellent, and relativity shows up only in very precise measurements — like GPS clocks or Mercury’s orbit over a century.' : 'Still small, but thousands of times larger than at Earth’s surface: enough to bend starlight measurably.'}`,
          visual: ladder(hide),
        };
      },
    }),
    mcq({
      id: 'fall-alike', difficulty: 2,
      prompt: 'On the Moon in 1971, Apollo 15’s David Scott dropped a hammer and a feather together: they landed together. In Newton’s theory, why do bodies of any mass fall alike (without air)?',
      choices: [
        'The mass that gravity pulls on equals the mass that resists acceleration, so it cancels — a coincidence Newton could not explain, and the starting point of Einstein’s theory',
        'Gravity pulls every object with the same force, whatever its mass',
        'The Moon’s gravity is too weak to tell heavy and light objects apart',
        'Heavier objects are pulled harder, and the extra pull happens to be cancelled by the lack of air',
      ],
      answer: 0,
      why: {
        1: 'The force is proportional to the mass — the hammer is pulled far harder. It is the acceleration that is the same.',
        2: 'On Earth, in a vacuum, they fall alike too; the Moon’s weak gravity only made the fall slow enough to watch.',
        3: 'Without air there is nothing left to cancel; the cancellation is between gravitational and inertial mass.',
      },
      hints: [t`Write $a = F/m$ with $F = GMm/r^2$. Which $m$ is which?`],
      teach: 'All bodies fall alike because gravitational mass equals inertial mass — tested to about one part in 10¹⁵, unexplained by Newton, built in by Einstein.',
      explain: t`In $a = \dfrac{GMm_g/r^2}{m_i}$ the gravitational mass $m_g$ and the inertial mass $m_i$ cancel only if they are equal — and experiments (most precisely the MICROSCOPE satellite) find them equal to about one part in $10^{15}$. Einstein made this equality his starting point: if everything falls alike, falling is a property of spacetime, not of the things that fall.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2, 2], y: [-0.3, 3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
          curves: [{ fn: '0', color: 'ink3', width: 2 }, { param: ['-0.6 + 0.35t', '2.2'], t: [-1, 1], color: 'ink2', width: 4 }, { param: ['-0.95', '2.2 + 0.15t'], t: [-1, 1], color: 'ink2', width: 7 }, { param: ['0.7 + 0.25*sin(3t)', '2.2 + 0.4t'], t: [-0.6, 0.6], color: 'ink', width: 1.6 }],
          arrows: [{ from: [-0.6, 1.95], to: [-0.6, 1.2], color: 'bad', label: 'g' }, { from: [0.7, 1.95], to: [0.7, 1.2], color: 'bad', label: 'g' }],
          points: [{ x: -0.6, y: 2.6, r: 0.01, color: 'ink2', label: 'hammer', labelDx: -24 }, { x: 0.7, y: 2.7, r: 0.01, color: 'ink', label: 'feather', labelDx: -22 }],
        },
        caption: 'A hammer and a feather released together on the airless Moon: the same acceleration, 1.62 m/s².',
      },
    }),
    num({
      id: 'earth-dark-star', difficulty: 2,
      prompt: t`Imagine squeezing the whole Earth into a smaller and smaller ball. At what radius would Newton's escape speed, $\sqrt{2GM/R}$, reach the speed of light? Use $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$ and $c = 2.998\times10^{8}$ m/s, and give the radius in millimetres.`,
      answer: ((2 * GM_EARTH) / (C * C)) * 1000, units: 'mm', tol: { rel: 0.01 },
      errors: [{ value: (GM_EARTH / (C * C)) * 1000, feedback: t`Set $\sqrt{2GM/R} = c$: $R = 2GM/c^2$, with the 2.` }],
      hints: [t`Square both sides of $\sqrt{2GM/R} = c$ and solve for $R$.`],
      teach: 'Newton’s escape speed reaches c at R = 2GM/c² — the size of a black hole in general relativity, though the physics behind the two is different.',
      explain: t`$R = \dfrac{2GM}{c^2} = \dfrac{2(3.986\times10^{14})}{(2.998\times10^{8})^2} = ${s3(((2 * GM_EARTH) / (C * C)) * 1000)}$ mm — the size of a marble. General relativity puts a black hole's horizon at exactly this radius, but for different reasons: from inside a real horizon nothing gets out at all, and light still moves at $c$ wherever it is measured.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 10], y: [0, 1.6], xlabel: 'R / (2GM/c²)', ylabel: 'escape speed / c', aspect: 'wide',
          curves: [{ fn: 'sqrt(1/x)', color: 'accent', domain: [0.39, 10] }],
          hlines: [{ y: 1, label: 'speed of light', color: 'warn' }],
        },
        caption: 'Newton’s escape speed for any mass, with the radius measured in units of 2GM/c². Where the curve crosses the line, Newton would need light-speed launches.',
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-crack', difficulty: 2,
      prompt: 'Which of these observations can Newton’s theory of gravity NOT account for?',
      choices: ['GPS satellite clocks gaining about 38 μs a day on ground clocks', 'The Moon going round the Earth every 27.3 days', 'Two high tides a day', 'Jupiter’s mass, worked out from its moons’ orbits'],
      answer: 0,
      why: {
        1: 'Newton’s own Moon test: his inverse-square law gives the Moon’s acceleration to about 1%.',
        2: 'Tides are differences in Newtonian gravity across the Earth — Newton explained them himself.',
        3: 'Kepler’s third law, which Newton derived, weighs Jupiter from its moons.',
      },
      hints: ['Which of these involves time itself running at different rates?'],
      teach: 'Newton’s gravity explains orbits and tides superbly, but has no way for gravity to change the rate of clocks.',
      explain: 'In Newton’s theory every clock, anywhere, runs at the same rate. The GPS clocks’ gain — about +46 μs a day from weaker gravity aloft, −7 μs from their speed — is predicted by relativity and corrected in every satellite. See [Gravity is mostly time running at different rates](#/lesson/gr.S06.i).',
      visual: ladder(),
    }),
    num({
      id: 'cp-pound-rebka', difficulty: 2, transfer: true,
      prompt: t`In 1960, Pound and Rebka sent gamma rays up and down a 22.5 m tower at Harvard and measured the tiny change in their frequency. General relativity predicts a fractional shift of $gh/c^2$. What is it? Use $g = 9.81\ \text{m/s}^2$ and $c = 2.998\times10^{8}$ m/s.`,
      answer: (9.81 * 22.5) / C ** 2, tol: { rel: 0.01 },
      errors: [{ value: (9.81 * 22.5) / C, feedback: 'Divide by c squared.' }],
      hints: [t`Compute $gh/c^2$ with $h = 22.5$ m.`],
      teach: 'Clocks (and light frequencies) depend on height in gravity — a shift of gh/c², observed in 1960 and now measured between atomic clocks less than a metre apart in height.',
      explain: t`$\dfrac{(9.81)(22.5)}{(2.998\times10^{8})^2} = ${tex((9.81 * 22.5) / C ** 2)}$ — a few parts in $10^{15}$. Pound and Rebka measured it (Pound and Snider later to about 1%), the first laboratory test of gravity's effect on time. Newton's theory predicts no shift at all.`,
      visual: {
        type: 'graph',
        params: {
          x: [-3, 3], y: [-0.5, 25], xlabel: '', ylabel: 'height (m)', xticks: 0.001, aspect: 'wide',
          shade: [{ fn: '22.5', lower: '0', from: -0.6, to: 0.6, color: 'ink3', alpha: 0.25 }],
          arrows: [{ from: [-0.25, 0.8], to: [-0.25, 21.5], color: 'violet', label: 'γ up' }, { from: [0.25, 21.5], to: [0.25, 0.8], color: 'gold', label: 'γ down' }],
        },
        caption: 'The tower experiment, side view: gamma rays sent up the 22.5 m tower arrive slightly lower in frequency; sent down, slightly higher.',
      },
    }),
    num({
      id: 'cp-s2', difficulty: 2, transfer: true,
      prompt: t`The star S2 swings to within about 120 AU of Sagittarius A*, the black hole of 4.3 million solar masses at the centre of our galaxy. What is $\varepsilon = GM/(rc^2)$ there? Use $GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $1\ \text{AU} = 1.496\times10^{11}$ m and $c = 2.998\times10^{8}$ m/s.`,
      answer: eps(4.3e6 * GM_SUN, 120 * AU), tol: { rel: 0.01 },
      errors: [{ value: eps(GM_SUN, 120 * AU), feedback: 'Multiply GM☉ by 4.3 million.' }],
      hints: [t`$GM = 4.3\times10^{6}\times1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and $r = 120\times1.496\times10^{11}$ m.`],
      teach: 'Around a supermassive black hole, gravity at a star’s closest approach is thousands of times stronger than anywhere in the Solar System.',
      explain: t`$\varepsilon = ${tex(eps(4.3e6 * GM_SUN, 120 * AU))}$ — about ${(Math.round(eps(4.3e6 * GM_SUN, 120 * AU) / eps(GM_SUN, 5.79e10) / 1000) * 1000).toLocaleString('en-US')} times Mercury's. Relativity's effects on S2 are correspondingly large, and both have been **observed** by the GRAVITY collaboration: the gravitational redshift of its light at closest approach in 2018, and an advance of its orbit by about 12′ (arcminutes) per orbit in 2020.`,
      visual: keplerPicture('s2', { t: 0.03, caption: 'S2’s orbit around Sagittarius A*, to scale.' }),
    }),
  ],
  sources: [
    { label: 'Will (2014), The confrontation between general relativity and experiment, Living Reviews in Relativity 17, 4', url: 'https://arxiv.org/abs/1403.7377' },
    { label: 'Ashby (2003), Relativity in the Global Positioning System, Living Reviews in Relativity 6, 1', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/' },
    { label: 'Pound & Rebka (1960), Apparent weight of photons, Phys. Rev. Lett. 4, 337', url: 'https://doi.org/10.1103/PhysRevLett.4.337' },
    { label: 'GRAVITY Collaboration (2020), Detection of the Schwarzschild precession in the orbit of the star S2', url: 'https://arxiv.org/abs/2004.07187' },
  ],
});
