// Cosmology and FLRW spacetime — Intuition Mode. Homogeneity and isotropy
// leave one function, the scale factor a(t): proper distances d = a(t)χ, so
// every galaxy sees v = H d (no centre), light stretches as 1 + z = 1/a, and
// the CMB cools as 1/a. H₀ = 67.4 (Planck, CMB + ΛCDM) or 73.0 (local ladder)
// km/s/Mpc: both are shown — the tension is open (S31, S37). Misconceptions
// after Davis & Lineweaver (2004). Numbers from model/gr-cosmology.js.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sci, round } from './_frontier.js';
import { logDots } from './_frontier.js';
import { hubbleTime, hubbleRadius, comovingDistance, lookbackTime, ageFlat, MPC_KM, GYR_S, LY_PER_MPC, C_KMS } from '../../src/viz/model/gr-cosmology.js';

const t = String.raw;

const H_CMB = 67.4, H_LOC = 73.0;
const T_CMB = 2.725, Z_CMB = 1089.9;
const PH = comovingDistance(Infinity, { Om: 0.315 - 9.1e-5, OL: 0.685, Or: 9.1e-5 }, H_CMB) * LY_PER_MPC / 1e9;   // Gly

// Davis & Lineweaver's "teardrop": how far away (proper distance, then) the light reaching us today was emitted,
// against the time it set out — flat ΛCDM, Planck 2018, computed point by point
const PLANCK = { Om: 0.315, OL: 0.685 }, AGE = ageFlat(0.315, H_CMB);
const TEAR = Array.from({ length: 80 }, (_, k) => {
  const a = k < 40 ? 10 ** (-2.5 + (2.5 + Math.log10(0.3)) * (k / 40)) : 0.3 + (0.7 * (k - 40)) / 39, z = 1 / a - 1;
  return [AGE - lookbackTime(z, PLANCK, H_CMB, 2000), (a * comovingDistance(z, PLANCK, H_CMB, 2000) * LY_PER_MPC) / 1e9];
});
const teardrop = {
  type: 'graph',
  params: {
    x: [0, 15.5], y: [0, 7], xlabel: 'when the light set out (billion years after the Big Bang)', ylabel: 'its distance then (billion ly)',
    points: [...TEAR.map(([x, y]) => ({ x: round(x, 5), y: round(y, 5), r: 1.8, color: 'accent' })), { x: round(AGE, 5), y: 0, color: 'gold', label: 'us, today' }],
  },
  caption: 'For light arriving here today: how far from us its source was at the moment the light set out, against when that was (Planck 2018 model, computed). Light from the earliest times left sources that were then very close — and it has taken almost the whole age of the universe to arrive.',
};

// the "no centre" picture: a 5 × 5 patch of galaxies, before (grey) and after a stretch s (blue),
// drawn as measured from a home galaxy (hx, hy); the grey grid is the old grid, the blue one the stretched grid
const L = [-2, -1, 0, 1, 2];
const flow = ({ drag = false, home = [0, 0], s = 1.3 } = {}) => {
  const HX = drag ? 'max(-2, min(2, px))' : String(home[0]), HY = drag ? 'max(-2, min(2, py))' : String(home[1]);
  const nx = (i) => `${i} + (s - 1)*(${i} - ${HX})`, ny = (j) => `${j} + (s - 1)*(${j} - ${HY})`;
  return {
    x: [-3.95, 3.95], y: [-3.95, 3.95], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    ...(drag ? { drag: [{ key: 'p', x: home[0], y: home[1], snap: 1 }] } : { constants: { s } }),
    curves: [
      ...L.flatMap((i) => [
        { param: [String(i), 't'], t: [-2.4, 2.4], color: 'ink4', width: 1 },
        { param: ['t', String(i)], t: [-2.4, 2.4], color: 'ink4', width: 1 },
        { param: [nx(i), `${HY} + s*(t - ${HY})`], t: [-2.4, 2.4], color: 'accent', width: 0.8, dash: true },
        { param: [`${HX} + s*(t - ${HX})`, ny(i)], t: [-2.4, 2.4], color: 'accent', width: 0.8, dash: true },
      ]),
    ],
    points: [
      ...L.flatMap((i) => L.map((j) => ({ x: i, y: j, color: 'ink3', r: 3 }))),
      ...L.flatMap((i) => L.map((j) => ({ x: nx(i), y: ny(j), color: 'accent', r: 4 }))),
      ...(drag ? [] : [{ x: home[0], y: home[1], color: 'gold', r: 6, label: 'home' }]),
    ],
    arrows: L.flatMap((i) => L.map((j) => ({ from: [i, j], to: [nx(i), ny(j)], color: 'accent2' }))),
  };
};

// a Hubble diagram: recession speed against distance, for both measured values of H₀
const hubbleDiagram = ({ dMax = 400, vline = null, hline = null, cLine = false, radius = false } = {}) => ({
  type: 'graph',
  params: {
    x: [0, dMax], y: [0, round((1.12 * H_LOC * dMax) / 1000, 3)], xlabel: 'distance (Mpc)', ylabel: 'speed (thousand km/s)',
    curves: [
      { fn: `${H_CMB / 1000}x`, color: 'gold', label: `H₀ = ${H_CMB} (CMB)`, labelAt: dMax * 0.55, labelDy: 14, labelDx: 4 },
      { fn: `${H_LOC / 1000}x`, color: 'accent', dash: true, label: `${H_LOC} (local)`, labelAt: dMax * 0.3, labelDx: -40 },
    ],
    hlines: [...(cLine ? [{ y: round(C_KMS / 1000, 6), label: 'speed of light', color: 'bad' }] : []), ...(hline !== null ? [{ y: round(hline / 1000, 6), color: 'violet' }] : [])],
    vlines: [...(vline !== null ? [{ x: vline, label: `${vline} Mpc`, color: 'violet' }] : []), ...(radius ? [{ x: round(hubbleRadius(H_CMB), 5), label: 'Hubble radius', color: 'bad' }] : [])],
  },
  caption: 'The Hubble–Lemaître law, v = H₀d, for the two disputed values of H₀ (km/s per Mpc): from the cosmic microwave background (gold) and from the local distance ladder (blue, dashed). Real galaxies scatter around the line by their own motions, a few hundred km/s.',
});

export default lesson({
  id: 'gr.S30.i',
  title: 'An expanding universe without a centre',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`Seen on scales of hundreds of millions of light-years, the universe is the same everywhere and in every direction — the **cosmological principle**, checked by galaxy surveys and by the near-perfect evenness of the cosmic microwave background. General relativity then allows space to change size with time by a single overall factor, the **scale factor** $a(t)$, equal to 1 today. Galaxies keep fixed labels on a grid whose rulers stretch, so the distance to a galaxy is $d = a(t)\,\chi$. Two consequences follow, for every observer in every galaxy — there is **no centre**:

$$v = H_0\,d \qquad\qquad 1 + z = \frac{1}{a(t_\text{emit})}$$

Distant galaxies recede at speeds proportional to their distance (the Hubble–Lemaître law), and light that crossed the expanding space arrives stretched, redshifted by the factor the universe grew while it travelled.`,
  equation: t`ds^2 = -c^2\,dt^2 + a(t)^2\left(dx^2 + dy^2 + dz^2\right)`,
  symbols: [
    { tex: 'ds^2', text: 'the spacetime interval between two nearby events (here for a spatially flat universe, as measurements indicate)' },
    { tex: 't', text: '**cosmic time**: the time kept by clocks riding along with the galaxies; 13.8 billion years since the Big Bang' },
    { tex: 'x,\\ y,\\ z', text: '**comoving** coordinates: fixed labels on the stretching grid. A galaxy keeps its labels (apart from small motions of its own)' },
    { tex: 'a(t)', text: 'the scale factor: how big every intergalactic distance is compared with today ($a = 1$ now, $a = 1/2$ when distances were half as big). No units' },
    { tex: 'd = a\\chi', text: 'the proper distance to a galaxy now, where $\\chi$ is its comoving distance — its fixed separation on the grid, measured today' },
    { tex: 'H_0', text: 'the Hubble constant, today’s rate of expansion $\\dot a/a$: 67.4 km/s per Mpc from the cosmic microwave background, 73.0 from nearby stars and supernovae — a disagreement still unexplained' },
    { tex: 'z', text: 'the redshift: received wavelength ÷ emitted wavelength, minus 1' },
    { tex: 'c', text: 'the speed of light. 1 Mpc (megaparsec) = 3.26 million light-years $= 3.086\\times10^{19}$ km' },
  ],
  why: 'This one geometry explains why distant galaxies recede, why their light is redshifted, why the sky is filled with a 2.7 K glow — and it sets the stage for asking what the universe is made of, and how it will end.',
  visual: {
    type: 'graph',
    title: 'No centre: every galaxy sees the same thing',
    lead: t`A patch of galaxies at two moments. **Grey**: where they were. **Blue**: the same galaxies after space has stretched by the factor on the slider; arrows join them. The positions are drawn as astronomers in the **ringed** galaxy, home, would measure them. Drag the ring onto any other galaxy.`,
    tasks: ['From the centre galaxy, every arrow points away from you, and a galaxy twice as far has moved twice as far.', 'Drag home to a corner galaxy: from there the pattern is exactly the same — everything flees from it. No galaxy is special.', 'Watch the grids: the blue grid is the grey grid stretched. Each galaxy stays on its own grid lines — its comoving labels never change.'],
    params: {
      ...flow({ drag: true }),
      aspect: 'square',
      sliders: [{ key: 's', label: 'Stretch $a_2/a_1$', min: 1, max: 1.45, step: 0.01, value: 1.3, explain: 'How much every distance between the galaxies has grown between the two moments.' }],
      readouts: [
        { label: 'a neighbour one step away moved', expr: 's - 1', unit: '\\text{ step}', digits: 3 },
        { label: 'a galaxy two steps away moved', expr: '2(s - 1)', unit: '\\text{ steps}', digits: 3 },
      ],
    },
    caption: 'A two-dimensional teaching model: 25 galaxies on a square grid. Real galaxies are scattered, add small motions of their own, and are themselves held together by gravity — galaxies, stars, planets and atoms do not stretch. Here a single stretch is shown; in the universe a(t) grows continuously.',
  },
  example: {
    prompt: t`Take $H_0 = ${H_CMB}$ km/s/Mpc. (a) How fast does a galaxy 100 Mpc away recede? (b) How long would anything take to cover that distance at that speed? (c) Light reaches us from a galaxy at $z = 1$: how big was the universe when the light left? (d) The cosmic microwave background was released at $z = ${Z_CMB}$ and is ${T_CMB} K today. How hot was it then?`,
    visual: {
      type: 'gr-friedmann',
      params: { sliders: false, readout: false, models: [[0.315, 0.685, 'our universe (Planck 2018)', 'gold']], a: [0, 2] },
      caption: 'Our universe’s scale factor against time (Planck 2018 fit). The grey dashed line keeps today’s expansion rate for ever: run backwards, it reaches a = 0 one Hubble time ago, 14.5 billion years — close to, but not equal to, the true age, because the rate has changed.',
    },
    steps: [
      { label: 'Speed', text: t`$v = H_0 d = ${H_CMB}\ \text{km/s/Mpc}\times100\ \text{Mpc} = ${sci(H_CMB * 100, 4)}$ km/s — ${sci((100 * H_CMB * 100) / C_KMS, 2)}% of the speed of light.` },
      { label: 'Hubble time', text: t`$t = d/v = 1/H_0 = (3.086\times10^{19}\ \text{km/Mpc})/(${H_CMB}\ \text{km/s/Mpc}) = ${sci(MPC_KM / H_CMB)}$ s $= ${sci(hubbleTime(H_CMB))}$ billion years — the same for every galaxy, because $v \propto d$. It is close to the age, 13.8 billion years; the two differ because the expansion rate has changed over time.` },
      { label: 'Redshift', text: t`$1 + z = 1/a$, so $z = 1$ means $a = 1/2$: when the light left, every intergalactic distance was half of today's.` },
      { label: 'The cooling glow', text: t`Wavelengths of light stretch with $a$, so the temperature of thermal radiation falls as $1/a$: $T = ${T_CMB}\ \text{K}\times(1 + ${Z_CMB}) = ${sci(T_CMB * (1 + Z_CMB), 4)}$ K — about as hot as a lamp filament. That is when the universe became transparent.` },
      { label: 'Honest caveat', text: t`With the local value $H_0 = ${H_LOC}$ the speed would be ${sci(H_LOC * 100, 4)} km/s and the Hubble time ${sci(hubbleTime(H_LOC))} billion years. The two measurements disagree by about 8%, far beyond their error bars: the **Hubble tension**, an open question.` },
    ],
    answer: t`(a) ${sci(H_CMB * 100, 4)} km/s; (b) $1/H_0 = ${sci(hubbleTime(H_CMB))}$ billion years; (c) half its present size, $a = 1/2$; (d) about ${sci(T_CMB * (1 + Z_CMB), 3)} K.`,
  },
  practice: [
    mcq({
      id: 'centre', difficulty: 1,
      prompt: 'Every distant galaxy is receding from the Milky Way. Where is the centre of the expansion?',
      choices: [
        'There is none: astronomers in every galaxy see the same thing, with everything receding from them',
        'The Milky Way: since everything recedes from us, we must be at the centre',
        'The point where the Big Bang exploded, which telescopes can locate',
        'At the edge of the universe, toward which every galaxy is moving',
      ],
      answer: 0,
      why: {
        1: 'The pattern looks centred on whoever looks. In the picture, home is in a corner, and everything still recedes from it.',
        2: 'The Big Bang was not an explosion at a point in space. It happened everywhere at once, and space has been stretching ever since.',
        3: 'The universe described by general relativity has no edge: a flat or open one goes on, and a closed one curves back on itself.',
      },
      hints: ['Look at the picture: home is a corner galaxy. Where do its arrows point?'],
      teach: 'A uniform stretching has no centre: every galaxy sees all the others recede, faster the farther they are.',
      explain: 'When every distance grows by the same factor, each galaxy sees the others recede with speeds proportional to their distance: v = H₀d, the same law from everywhere. The Milky Way is not special — it is simply where we happen to measure from.',
      visual: { type: 'graph', params: flow({ home: [2, 1], s: 1.3 }), caption: 'The patch of galaxies as measured from a corner galaxy (gold): grey before, blue after the universe grew by 30%. Teaching model, in two dimensions.' },
    }),
    num({
      id: 'hubble-law', difficulty: 1,
      gen(r) {
        const H = r.pick([H_CMB, H_LOC]), d = r.pick([40, 100, 200, 350]);
        return {
          prompt: t`With $H_0 = ${H}$ km/s/Mpc, how fast does a galaxy ${d} Mpc away recede?`,
          answer: H * d, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: d / H, feedback: 'Multiply: v = H₀ × d.' }],
          hints: [t`$v = H_0 d$: the units km/s/Mpc times Mpc leave km/s.`],
          teach: 'The Hubble–Lemaître law: recession speed is proportional to distance, v = H₀d.',
          explain: t`$v = ${H}\times${d} = ${sci(H * d, 4)}$ km/s. With the other measured value of $H_0$ (${H === H_CMB ? H_LOC : H_CMB}) it would be ${sci((H === H_CMB ? H_LOC : H_CMB) * d, 4)} km/s — the Hubble tension in miniature.`,
          visual: hubbleDiagram({ vline: d }),
        };
      },
    }),
    num({
      id: 'distance', difficulty: 2,
      gen(r) {
        const H = r.pick([H_CMB, H_LOC]), z = r.pick([0.005, 0.01, 0.02, 0.03]);
        const d = (C_KMS * z) / H;
        return {
          prompt: t`A nearby galaxy's spectrum is redshifted by $z = ${z}$. For small $z$ its recession speed is $v \approx cz$. How far away is it, taking $H_0 = ${H}$ km/s/Mpc? ($c = 299\,792$ km/s)`,
          answer: d, units: 'Mpc', tol: { rel: 0.01 },
          errors: [{ value: z / H, feedback: 'First turn the redshift into a speed, v = cz, in km/s.' }, { value: C_KMS * z * H, feedback: 'Divide the speed by H₀: d = v/H₀.' }],
          hints: [t`$v = cz = 299\,792\times${z}$ km/s.`, t`Then $d = v/H_0$.`],
          teach: 'For nearby galaxies, distance ≈ cz/H₀ — the way most galaxy distances are first estimated.',
          explain: t`$v = ${sci(C_KMS * z, 4)}$ km/s, so $d = v/H_0 = ${sci(d)}$ Mpc (${sci(d * LY_PER_MPC / 1e6)} million light-years). For larger $z$ the simple $v = cz$ fails, and the full history $a(t)$ is needed.`,
          visual: hubbleDiagram({ hline: C_KMS * z, dMax: 150 }),
        };
      },
    }),
    num({
      id: 'scale-factor', difficulty: 2,
      gen(r) {
        const z = r.pick([0.5, 1, 2, 3, 6, 10]);
        return {
          prompt: t`Light arrives from a galaxy with redshift $z = ${z}$. When it set out, what was the scale factor $a$ — the size of intergalactic distances compared with today?`,
          answer: 1 / (1 + z), tol: { rel: 0.005 },
          errors: [{ value: 1 / z, feedback: 'Use 1 + z, not z: the stretch factor of the light is 1 + z.' }, { value: 1 + z, feedback: 'That is how much bigger the universe is now. It was smaller then: a = 1/(1 + z).' }],
          hints: [t`Wavelengths stretch in proportion to $a$: $1 + z = a_\text{now}/a_\text{then}$, with $a_\text{now} = 1$.`],
          teach: 'Cosmological redshift measures how much the universe has grown while the light travelled: 1 + z = 1/a.',
          explain: t`$a = 1/(1 + ${z}) = ${sci(1 / (1 + z))}$: distances were ${z === 1 ? 'half' : `${sci(100 / (1 + z))}%`} of today's. Every wavelength grew by the factor ${1 + z} on the way.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 12], y: [-2.6, 2.6], xlabel: '', ylabel: '', grid: false,
              curves: [{ fn: '1 + 0.8sin(2pi*x)', domain: [0, 12], color: 'teal', label: 'emitted', labelAt: 0.1, labelDy: -26 }, { fn: `-1.4 + 0.8sin(2pi*x/${1 + z})`, domain: [0, 12], color: 'bad', label: 'received', labelAt: 0.1, labelDy: 26 }],
            },
            caption: `The same wave as emitted (top) and as received (bottom): every wavelength stretched by 1 + z = ${1 + z} during the journey. Schematic.`,
          },
        };
      },
    }),
    num({
      id: 'cmb-temp', difficulty: 2,
      gen(r) {
        const [z, when] = r.pick([[Z_CMB, 'when the cosmic microwave background was released, at'], [100, 'at'], [20, 'when the first stars may have formed, around'], [6, 'when the light now reaching us from distant quasars set out, at']]);
        const x = T_CMB * (1 + z);
        return {
          prompt: t`The cosmic microwave background is ${T_CMB} K today. The temperature of such radiation falls as $1/a$. How hot was it ${when} $z = ${z}$?`,
          answer: x, units: 'K', tol: { rel: 0.005 },
          errors: [...(z < 200 ? [{ value: T_CMB * z, feedback: 'Use 1 + z: the universe was smaller by a factor 1 + z, so it was hotter by 1 + z.' }] : []), { value: T_CMB / (1 + z), feedback: 'It was hotter in the past, not colder: multiply by 1 + z.' }],
          hints: [t`$T \propto 1/a$ and $1/a = 1 + z$, so $T = ${T_CMB}\,(1 + z)$.`],
          teach: 'Radiation filling the universe cools as it expands: T = T₀(1 + z).',
          explain: t`$T = ${T_CMB}\times(1 + ${z}) = ${sci(x, 4)}$ K.${z === Z_CMB ? ' Around 3000 K hydrogen became neutral and the universe turned transparent; that light is the glow we still see, stretched 1091 times into microwaves.' : ''}`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3.3], y: [0, 4], xlabel: 'log₁₀(1 + z)', ylabel: 'log₁₀(T in K)',
              curves: [{ fn: `${round(Math.log10(T_CMB), 5)} + x`, color: 'bad' }],
              points: [{ x: 0, y: round(Math.log10(T_CMB), 5), color: 'gold', label: 'today, 2.725 K' }],
              hlines: [{ y: round(Math.log10(273.15), 5), label: 'water freezes, 273 K', color: 'teal' }],
            },
            caption: 'The background’s temperature against redshift, both in powers of ten: it rises as 1 + z going back in time.',
          },
        };
      },
    }),
    mcq({
      id: 'faster-than-light', difficulty: 2,
      prompt: t`With $H_0 = ${H_CMB}$ km/s/Mpc, a galaxy 5000 Mpc away recedes at $${sci(H_CMB * 5000, 3)}$ km/s — faster than light. Does that break relativity?`,
      choices: [
        'No: relativity forbids outrunning light locally, but the recession is the growth of the space between us; no light beam is ever overtaken',
        'Yes, so the Hubble–Lemaître law must stop working beyond about 4400 Mpc',
        'Yes: such galaxies cannot exist, and none will ever be seen',
        'No, because galaxies that far away are travelling backward in time',
      ],
      answer: 0,
      why: {
        1: 'In an expanding universe v = H d holds at every distance; c/H₀ (4448 Mpc) is just where the recession speed equals c — the Hubble radius.',
        2: 'Many galaxies we observe are receding faster than light today; we see light they sent long ago.',
        3: 'Nothing in cosmology involves travelling backward in time; this is ordinary expansion.',
      },
      hints: ['Special relativity limits speeds measured by an observer for things passing nearby. Is the distant galaxy passing anyone?'],
      teach: 'Recession faster than light breaks no law: only local speeds, through nearby space, are limited by c.',
      explain: t`Special relativity says nothing outruns light **locally**. The galaxy is at rest on its own patch of the grid; the space between grows, and over 5000 Mpc the growth adds up to more than c. Beyond the Hubble radius $c/H_0 = ${sci(hubbleRadius(H_CMB), 4)}$ Mpc every galaxy recedes faster than light — and many of them are visible.`,
      visual: hubbleDiagram({ dMax: 6000, cLine: true, radius: true }),
    }),
    mcq({
      id: 'bound', difficulty: 2,
      prompt: 'Does the expansion of the universe make the Solar System — or your own body — grow?',
      choices: [
        'No: systems held together by gravity or other forces keep their own size; only the spacing between distant, unbound galaxies grows',
        'Yes, by the same fraction as everything else, but too slowly to notice',
        'Yes: atoms, planets and galaxies all grow, so rulers grow too and the expansion cannot really be measured',
        'Only the Sun grows, because it is hot',
      ],
      answer: 0,
      why: {
        1: 'A bound system does not follow the cosmic stretch at all. Its size is set by its own forces; the expansion’s effect on the Earth–Sun orbit is unmeasurably tiny (the next lesson estimates it).',
        2: 'If everything grew, nothing would change — but distant galaxies’ light is measurably redshifted, while atoms emit the same lines they always did.',
        3: 'The Sun’s size is set by its own pressure and gravity; it has nothing to do with cosmic expansion.',
      },
      hints: ['Galaxies in the picture are scattered freely. Are the atoms in a ruler, or the planets in the Solar System, free in the same way?'],
      teach: 'Only unbound things follow the cosmic expansion: galaxies, the Solar System, atoms and rulers keep their size.',
      explain: 'The FLRW description is an average over scales of hundreds of millions of light-years. Inside galaxies and clusters, gravity has long since pulled matter into bound systems that no longer expand; atoms are held by electromagnetism. Spectral lines from those atoms are what show that the space between galaxies is stretching.',
      visual: logDots([['an atom — held by electric forces', 1e-10, 'gold'], ['the Solar System, to Neptune — held by gravity', 4.5e12, 'gold'], ['the Milky Way, about 10⁵ light-years — held by gravity', 9.46e20, 'gold'], ['the gap to a galaxy 100 Mpc away — grows', 3.086e24, 'accent']], { xlabel: 'size in metres (powers of ten)', range: [-12, 36], every: 6, caption: 'Sizes in powers of ten. Gold: bound systems, which keep their size. Blue: the space between galaxies far apart, which stretches.' }),
    }),
    num({
      id: 'hubble-time', difficulty: 2,
      gen(r) {
        const H = r.pick([H_CMB, 70, H_LOC]);
        const x = hubbleTime(H);
        return {
          prompt: t`The Hubble time $1/H_0$ is how long ago all galaxies would have been together if they had always receded at today's speeds. Compute it, in billions of years, for $H_0 = ${H}$ km/s/Mpc. (1 Mpc $= 3.086\times10^{19}$ km; 1 billion years $= 3.156\times10^{16}$ s)`,
          answer: x, tol: { rel: 0.005 },
          errors: [{ value: x * 1e9, feedback: 'Give the answer in billions of years: divide by 3.156×10¹⁶ s, not by 3.156×10⁷ s.' }, { value: H / (MPC_KM / GYR_S), feedback: 'That is H₀ itself in units of per billion years; the Hubble time is its reciprocal.' }],
          hints: [t`$1/H_0 = (3.086\times10^{19}\ \text{km})/(${H}\ \text{km/s})$, in seconds.`, t`$= ${sci(MPC_KM / H)}$ s; divide by $3.156\times10^{16}$ s per billion years.`],
          teach: 'The Hubble time, 1/H₀ ≈ 14 billion years, sets the scale of the universe’s age.',
          explain: t`$1/H_0 = ${sci(MPC_KM / H)}$ s $= ${sci(x)}$ billion years. The true age (13.8 billion years for our universe) differs because the expansion first slowed and then sped up.`,
          visual: hubbleDiagram({ dMax: 400 }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-speed', difficulty: 2,
      gen(r) {
        const H = r.pick([H_CMB, H_LOC]), gly = r.pick([0.5, 1, 2]);
        const d = (gly * 1e9) / LY_PER_MPC, v = H * d;
        return {
          prompt: t`A galaxy is ${gly} billion light-years away (1 Mpc = 3.262 million light-years). With $H_0 = ${H}$ km/s/Mpc, at what speed does it recede?`,
          answer: v, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: H * gly * 1e3, feedback: 'Convert the distance to megaparsecs first: divide light-years by 3.262 million.' }],
          hints: ['Convert to Mpc, then use v = H₀d.'],
          teach: 'Use v = H₀d with the distance in megaparsecs.',
          explain: t`$d = ${sci(gly * 1e9, 2)}/3.262\times10^{6} = ${sci(d)}$ Mpc, so $v = ${H}\times${sci(d)} = ${sci(v)}$ km/s.`,
          visual: hubbleDiagram({ dMax: 800, vline: round(d, 3) }),
        };
      },
    }),
    mcq({
      id: 'cp-horizon', difficulty: 2,
      prompt: 'The universe is 13.8 billion years old. How far away, today, is the most distant matter whose light could have reached us?',
      choices: [
        `About ${Math.round(PH)} billion light-years: space kept stretching while the light was on its way`,
        '13.8 billion light-years, because light travels one light-year per year',
        '27.6 billion light-years: the light went out and came back',
        'Infinitely far: everything in the universe is visible',
      ],
      answer: 0,
      why: {
        1: '13.8 billion years is how long the light travelled. Meanwhile the space behind it kept growing, so its source is now much farther away.',
        2: 'The light made a one-way trip, from there to here.',
        3: 'Light has had only 13.8 billion years to travel, so there is a horizon: matter beyond it has not yet been seen.',
      },
      hints: ['The light travelled for 13.8 billion years. What happened to the distance between its source and us during that time?'],
      teach: 'Because space stretched while light travelled, the edge of the observable universe is now about 46 billion light-years away.',
      explain: t`Adding up the stretch along the way, $\int c\,dt/a$, gives about $${sci(PH, 3)}$ billion light-years today for the farthest matter whose light can have reached us — the radius of the observable universe (computed for the Planck 2018 model). The light we receive from it left when it was much closer.`,
      visual: teardrop,
    }),
    num({
      id: 'cp-supernova', difficulty: 3, transfer: true,
      gen(r) {
        const z = r.pick([0.5, 0.8, 1.2]), days = r.pick([18, 20, 25]);
        return {
          prompt: t`A type Ia supernova brightens and fades over about ${days} days in its own frame. Seen from Earth at redshift $z = ${z}$, how long does it appear to take? (Every interval between light crests — and so every clock tick carried by the light — is stretched by the same factor as wavelengths.)`,
          answer: days * (1 + z), units: 'd', tol: { rel: 0.01 },
          errors: [{ value: days * z, feedback: 'The stretch factor is 1 + z, not z.' }, { value: days / (1 + z), feedback: 'Distant events appear slowed down, not sped up: multiply by 1 + z.' }],
          hints: ['Wavelengths stretch by 1 + z. Do time intervals between crests stretch too?', t`$\Delta t_\text{seen} = (1 + z)\,\Delta t_\text{emitted}$.`],
          teach: 'Distant events appear slowed by the factor 1 + z — cosmological time dilation.',
          explain: t`$${days}\times(1 + ${z}) = ${sci(days * (1 + z))}$ days. Exactly this slowing is measured in the light curves and spectra of distant supernovae — direct evidence that redshift is expansion, not light getting "tired" on the way.`,
          visual: {
            type: 'graph',
            params: {
              x: [-10, 80], y: [0, 1.15], xlabel: 'days', ylabel: 'brightness',
              curves: [{ fn: `exp(-((x - 15)/${round(days / 2.2, 4)})^2)`, color: 'teal', label: 'in its own frame', labelAt: 15 }],
            },
            caption: 'A schematic supernova light curve, as it would be seen nearby (shape simplified). Seen from far away, the whole curve is stretched in time.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
    { label: 'Davis & Lineweaver, “Expanding confusion: common misconceptions of cosmological horizons…” (2004)', url: 'https://arxiv.org/abs/astro-ph/0310808' },
    { label: 'Carroll, Lecture Notes on GR, ch. 8 (cosmology)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
