// Weak and Einstein equivalence principles, and what tests them —
// Derivation Mode. The Eötvös ratio as the WEP's test statistic; the EEP as
// WEP + local Lorentz invariance + local position invariance; the
// gravitational redshift derived from crest timing in an accelerating rocket
// (only the constancy of c in an inertial frame is used); the locality of
// the principle quantified by tides; and the tests: MICROSCOPE, Pound–Rebka,
// Gravity Probe A, Hughes–Drever, lunar laser ranging.
import { lesson, mcq, num, expr, order, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { C, GM_EARTH, R_EARTH, GM_SUN, R_SUN, LY, g0, sci, round } from './_deriv.js';

const t = String.raw;

const ARCSEC = Math.PI / 648000;
const G_MICRO = GM_EARTH / (R_EARTH + 710e3) ** 2;          // MICROSCOPE's orbit, 710 km up
const PR_H = 22.5;                                          // m, the Harvard tower
const GPA = (GM_EARTH * (1 / R_EARTH - 1 / (R_EARTH + 1e7))) / C ** 2;
const EP_LIMB = (2 * GM_SUN) / (C * C * R_SUN) / ARCSEC;    // ″, equivalence principle alone

// light crests climbing an accelerating cabin (c = 1, height h = 1): floor z = a t²/2, ceiling 1 + a t²/2.
// Crest 1 leaves the floor at t = 0, crest 2 at t = T0; a = gh/c², exaggerated.
const T0 = 0.6;
const arrive1 = '2/(1 + sqrt(1 - 2*a))';
const K2 = `(1 + ${T0} - ${0.5 * T0 * T0}*a)`;
const arrive2 = `2*${K2}/(1 + sqrt(1 - 2*a*${K2}))`;
function pulseParams(extra = {}) {
  return {
    x: [-0.25, 1.75], y: [-0.1, 2.45], equal: true, xlabel: 'height above the floor, z / h', ylabel: 'time, ct / h',
    curves: [
      { param: ['0.5*a*t^2', 't'], t: [0, 2.45], color: 'accent', width: 2.4, label: 'floor', labelAt: 2.2, labelDx: -36, labelDy: 0 },
      { param: ['1 + 0.5*a*t^2', 't'], t: [0, 2.45], color: 'violet', width: 2.4, label: 'ceiling', labelAt: 2.2, labelDx: 8, labelDy: 0 },
      { param: ['t', 't'], t: [0, arrive1], color: 'gold', width: 2 },
      { param: [`${0.5 * T0 * T0}*a + t`, `${T0} + t`], t: [0, `${arrive2} - ${T0}`], color: 'gold', width: 2 },
    ],
    points: [
      { x: 0, y: 0, color: 'gold', label: 'crest 1 leaves', labelDx: -100, labelDy: -12 },
      { x: `${0.5 * T0 * T0}*a`, y: T0, color: 'gold', label: 'crest 2 leaves', labelDx: -100, labelDy: 0 },
      { x: arrive1, y: arrive1, color: 'gold' },
      { x: `${0.5 * T0 * T0}*a + ${arrive2} - ${T0}`, y: arrive2, color: 'gold' },
    ],
    ...extra,
  };
}

// WEP ⊂ EEP ⊂ SEP, drawn as nested boxes
function principlesPicture(caption) {
  const box = (x0, x1, y0, y1, color, width = 1.8) => [
    { param: [`${x0} + ${x1 - x0}*t`, `${y0}`], t: [0, 1], color, width }, { param: [`${x0} + ${x1 - x0}*t`, `${y1}`], t: [0, 1], color, width },
    { param: [`${x0}`, `${y0} + ${y1 - y0}*t`], t: [0, 1], color, width }, { param: [`${x1}`, `${y0} + ${y1 - y0}*t`], t: [0, 1], color, width },
  ];
  const lab = (x, y, label, color) => ({ x, y, r: 0.01, color, label, labelDx: 0, labelDy: 0, labelAlign: 'center' });
  return {
    type: 'graph',
    params: {
      x: [-3.2, 3.2], y: [-1.75, 1.75], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [...box(-3.1, 3.1, -1.65, 1.65, 'ink3'), ...box(-2.85, 2.85, -1.2, 1.0, 'accent'), ...box(-2.7, -1.0, -1.0, 0.45, 'gold'), ...box(-0.85, 0.85, -1.0, 0.45, 'violet'), ...box(1.0, 2.7, -1.0, 0.45, 'teal')],
      points: [
        lab(0, 1.35, 'strong EP: gravitational experiments and self-gravitating bodies too', 'ink3'),
        lab(0, 0.75, 'Einstein equivalence principle (EEP)', 'accent'),
        lab(-1.85, 0.05, 'WEP:', 'gold'), lab(-1.85, -0.4, 'universal free fall', 'gold'),
        lab(0, 0.05, 'LLI:', 'violet'), lab(0, -0.4, 'local special relativity', 'violet'),
        lab(1.85, 0.05, 'LPI:', 'teal'), lab(1.85, -0.4, 'same everywhere, always', 'teal'),
      ],
    },
    caption,
  };
}

// a rough history of tests of universal free fall (orders of magnitude)
const wepHistory = (caption) => ({
  type: 'graph',
  params: {
    x: [1890, 2035], y: [-16, -7.5], xlabel: 'year', ylabel: 'log₁₀ |η| reached',
    points: [
      { x: 1908, y: -9, color: 'ink3', label: 'Eötvös' }, { x: 1964, y: -11, color: 'ink3', label: 'Roll, Krotkov, Dicke' },
      { x: 1972, y: -12, color: 'ink3', label: 'Braginsky, Panov' }, { x: 2008, y: -13, color: 'ink3', label: 'Eöt-Wash', labelDx: -64, labelDy: -10 },
      { x: 2022, y: -15, color: 'gold', label: 'MICROSCOPE', labelDx: -102, labelDy: 0 },
    ],
  },
  caption: caption ?? 'How closely different materials have been shown to fall alike, as orders of magnitude of the Eötvös ratio |η|. Torsion balances on the ground until 2008; MICROSCOPE in orbit. Approximate, after Will (2014).',
});

// a freely falling box with test balls drifting under tides (exaggerated)
const tidalBox = {
  type: 'graph',
  params: {
    x: [-3, 3], y: [-2.3, 2.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['-1.6 + 3.2*t', '-1.6'], t: [0, 1], color: 'ink2' }, { param: ['-1.6 + 3.2*t', '1.6'], t: [0, 1], color: 'ink2' },
      { param: ['-1.6', '-1.6 + 3.2*t'], t: [0, 1], color: 'ink2' }, { param: ['1.6', '-1.6 + 3.2*t'], t: [0, 1], color: 'ink2' },
    ],
    arrows: [
      { from: [0, 1.1], to: [0, 1.5], color: 'gold' }, { from: [0, -1.1], to: [0, -1.5], color: 'gold' },
      { from: [1.1, 0], to: [0.9, 0], color: 'gold' }, { from: [-1.1, 0], to: [-0.9, 0], color: 'gold' },
    ],
    points: [
      { x: 0, y: 1.1, color: 'accent', r: 6 }, { x: 0, y: -1.1, color: 'accent', r: 6 }, { x: 1.1, y: 0, color: 'accent', r: 6 }, { x: -1.1, y: 0, color: 'accent', r: 6 },
      { x: 0, y: -2.05, r: 0.01, color: 'teal', label: 'toward Earth’s centre', labelDx: 0, labelDy: 0, labelAlign: 'center' },
    ],
  },
  caption: 'A freely falling box seen from inside: test balls drift apart along the vertical and together across it. The drifts are tides, enormously exaggerated here; they grow in proportion to the size of the box.',
};

export default lesson({
  id: 'gr.S05.d',
  title: 'Weak and Einstein equivalence principles, and what tests them',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`The **weak equivalence principle** (WEP) says every body falls with the same acceleration in a gravitational field, whatever it is made of — gravitational mass is proportional to inertial mass, with the same ratio for all matter. Experiments test it by comparing two materials A and B with the **Eötvös ratio** above, which the WEP says is exactly zero; today it is known to be below about $10^{-15}$.

The **Einstein equivalence principle** (EEP) adds two statements about a small freely falling laboratory: inside it, all non-gravitational physics is special relativity (**local Lorentz invariance**), and it comes out the same wherever and whenever the laboratory is (**local position invariance**). From the EEP and nothing else, light must fall and clocks must run at height-dependent rates — $\Delta f/f = gh/c^2$, derived below.`,
  equation: t`\eta(\mathrm{A}, \mathrm{B}) = 2\,\frac{a_\mathrm{A} - a_\mathrm{B}}{a_\mathrm{A} + a_\mathrm{B}}`,
  symbols: [
    { tex: '\\eta(\\mathrm{A}, \\mathrm{B})', text: t`the Eötvös ratio of two materials A and B: zero if the WEP holds. (A traditional, unrelated use of the letter $\eta$ — not the Minkowski metric.)` },
    { tex: 'a_\\mathrm{A},\\ a_\\mathrm{B}', text: t`the free-fall accelerations of bodies made of A and of B, at the same place, in $\text{m/s}^2$` },
    { tex: 'm_\\text{g}/m_\\text{i}', text: t`gravitational over inertial mass: Newton’s law gives $a = (m_\text{g}/m_\text{i})\,g$, so $\eta$ measures how much this ratio differs between materials` },
    { tex: '\\Delta f/f', text: t`fractional frequency shift of light (or of a clock’s ticks) between two heights` },
    { tex: 'g,\\ h,\\ c', text: t`the local gravitational acceleration ($\text{m/s}^2$), the height difference (m) and the speed of light` },
  ],
  why: t`The EEP is what licenses describing gravity by a spacetime metric at all: if every body and every clock responds to gravity the same way, gravity can be a property of spacetime rather than a force on things. Steps 6 and 8 build on exactly that.`,
  visual: {
    type: 'graph',
    title: 'Light crests climbing an accelerating cabin',
    lead: t`An inertial observer watches a cabin of height $h$ accelerate upward; its floor and ceiling trace parabolas. Two light crests leave the floor and run at 45° to the ceiling. Raise the slider: the ceiling recedes faster by the time each crest arrives, so the crests arrive farther apart than they left.`,
    tasks: [
      'At gh/c² = 0 the cabin is inertial: crests arrive exactly as far apart as they left.',
      'Raise gh/c²: the received period grows. Compare the ratio with the first-order prediction 1 + gh/c².',
      'Push it to 0.15: the two drift apart — the 1 + gh/c² rule is a first-order result, excellent for every real tower (gh/c² ≈ 10⁻¹⁵).',
    ],
    params: pulseParams({
      sliders: [{ key: 'a', label: t`Exaggerated $gh/c^2$`, min: 0, max: 0.15, step: 0.005, value: 0.08, explain: t`For a 22.5 m tower on Earth it is $2.5\times10^{-15}$; here it is made visible.` }],
      readouts: [
        { label: 'emitted period (units of h/c)', expr: `${T0}`, digits: 3 },
        { label: 'received period', expr: `${arrive2} - ${arrive1}`, digits: 4 },
        { label: 'ratio received ÷ emitted', expr: `(${arrive2} - ${arrive1})/${T0}`, digits: 4 },
        { label: t`first order: $1 + gh/c^2$`, expr: '1 + a', digits: 4 },
      ],
    }),
    caption: t`Units with $c = 1$ and cabin height $h = 1$; time up, height across. Floor and ceiling move as $\tfrac12 gt^2$ (accurate while their speeds are small). The acceleration is exaggerated about $10^{16}$ times compared with a tower on Earth.`,
  },
  example: {
    prompt: t`A rocket accelerates at $g$ far from any star. A source on its floor emits light of frequency $f$; a detector on the ceiling, a height $h$ above, counts the crests. Using only the fact that light moves at $c$ in an inertial frame, derive the received frequency to first order in $gh/c^2$.`,
    visual: { type: 'graph', params: pulseParams({ constants: { a: 0.1 } }), caption: t`The crest-timing picture at an exaggerated $gh/c^2 = 0.1$: crests leave the floor (blue) $T_0$ apart and reach the receding ceiling (violet) farther apart. Units with $c = 1$, $h = 1$.` },
    steps: [
      { label: 'An inertial frame', text: t`Use the inertial frame in which the rocket is momentarily at rest at $t = 0$. While their speeds stay small, floor and ceiling move as $z_\text{f}(t) = \tfrac12 gt^2$ and $z_\text{c}(t) = h + \tfrac12 gt^2$.` },
      { label: 'One crest’s trip', text: t`A crest leaves the floor at $t_e$ and climbs at $c$, reaching the ceiling at $t_a$ where $c\,(t_a - t_e) = h + \tfrac12 g t_a^2 - \tfrac12 g t_e^2$.` },
      { label: 'Differentiate', text: t`The next crest leaves $dt_e = 1/f$ later. Differentiating with respect to $t_e$: $c\left(\dfrac{dt_a}{dt_e} - 1\right) = g t_a\dfrac{dt_a}{dt_e} - g t_e$, so $\dfrac{dt_a}{dt_e} = \dfrac{c - g t_e}{c - g t_a}$.` },
      { label: 'At the first crest', text: t`At $t_e = 0$ the light needs $t_a \approx h/c$, so $\dfrac{dt_a}{dt_e} = \dfrac{1}{1 - gh/c^2} \approx 1 + \dfrac{gh}{c^2}$: crests arrive $1 + gh/c^2$ times farther apart than they left.` },
      { label: 'The redshift', text: t`The ceiling receives $f' = f\left(1 - \dfrac{gh}{c^2}\right)$. By the EEP a laboratory at rest on Earth is equivalent to this rocket, so light climbing a height $h$ there loses the same fraction. Nothing is lost on the way — every crest that leaves arrives — so the floor’s clock itself ticks slower than the ceiling’s.` },
      { label: 'Size and test', text: t`For Pound and Rebka’s ${PR_H} m tower, $gh/c^2 = ${sci((g0 * PR_H) / C ** 2)}$; comparing upward with downward light doubles it. They confirmed it to 10% in 1960, and Pound and Snider to 1% in 1965.` },
    ],
    answer: t`$f' = f\,(1 - gh/c^2)$ to first order: crests arrive $1 + gh/c^2$ times farther apart, because the receiver gains speed $gh/c$ while the light climbs.`,
  },
  practice: [
    num({
      id: 'microscope', difficulty: 2,
      gen(r) {
        const eta = r.pick([1e-15, 3e-15, 1e-14]);
        const ans = eta * G_MICRO;
        return {
          prompt: t`The MICROSCOPE satellite (2016–2018) orbited 710 km up, where Earth’s gravity is $g = ${fmt(G_MICRO, 3)}\ \text{m/s}^2$, carrying test masses of titanium and platinum in free fall together. If the Eötvös ratio were $|\eta| = ${sci(eta, 1)}$, by how much would the two masses’ accelerations differ? (Their accelerations are both very nearly $g$.)`,
          answer: ans, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: 2 * ans, feedback: t`With $a_\mathrm{A} + a_\mathrm{B} \approx 2g$, $\eta = 2\Delta a/(2g) = \Delta a/g$: the 2s cancel.` },
            { value: ans / 2, feedback: t`$\eta = 2\Delta a/(a_\mathrm{A} + a_\mathrm{B}) \approx \Delta a/g$, so $\Delta a = \eta g$.` },
            { value: eta / G_MICRO, feedback: t`Multiply by $g$: $\Delta a = \eta\,g$.` },
          ],
          hints: [t`With both accelerations close to $g$: $\eta = \dfrac{2\Delta a}{a_\mathrm{A} + a_\mathrm{B}} \approx \dfrac{2\Delta a}{2g}$.`, t`$\Delta a = |\eta|\,g = ${sci(eta, 1)}\times${fmt(G_MICRO, 3)}$.`],
          teach: 'The Eötvös ratio is the difference in free-fall acceleration as a fraction of g; MICROSCOPE pinned it below about 10⁻¹⁵.',
          explain: t`$\Delta a = |\eta|\,g = ${sci(ans)}\ \text{m/s}^2$. MICROSCOPE’s final result was $\eta(\text{Ti, Pt}) = [-1.5 \pm 2.3\ (\text{stat}) \pm 1.5\ (\text{syst})]\times10^{-15}$ — consistent with zero. Orbit helps: the masses fall together for months instead of seconds.`,
          visual: wepHistory(),
        };
      },
    }),
    num({
      id: 'light-curve', difficulty: 2,
      gen(r) {
        const [where, g] = r.pick([['at Earth’s surface', g0], ['on the Moon’s surface', 1.62], ['at the Sun’s visible surface', 274], ['at the surface of a neutron star', 1.29e12]]);
        const ans = (C * C) / g / 1e3;
        return {
          prompt: t`In a cabin accelerating at $g$ — or standing ${where}, where $g = ${sci(g)}\ \text{m/s}^2$ — a horizontal light ray falls like everything else: relative to the cabin it follows $y = -\dfrac{g}{2c^2}x^2$. The radius of curvature of that parabola at its top is $c^2/g$. Find it, in kilometres.`,
          answer: ans, units: 'km', tol: { rel: 0.01 },
          errors: [
            { value: ans / 2, feedback: t`For $y = -\tfrac{k}{2}x^2$ the radius of curvature at the top is $1/k$; here $k = g/c^2$, so $R = c^2/g$ — no factor ½.` },
            { value: C / g / 1e3, feedback: t`Square the speed of light: $R = c^2/g$.` },
          ],
          hints: [t`For a curve $y(x)$ with $y' = 0$, the curvature is $|y''|$ and the radius of curvature $1/|y''|$.`, t`Here $y'' = -g/c^2$, so $R = c^2/g = (2.998\times10^{8})^2/${sci(g)}$ m.`],
          teach: 'By the equivalence principle light falls in gravity: its path curves with radius c²/g, about a light-year at Earth’s surface.',
          explain: t`$R = c^2/g = ${sci(ans * 1e3)}$ m $= ${sci(ans)}$ km${ans > 1e9 ? t` $= ${fmt((ans * 1e3) / LY, 3)}$ light-years` : ''}. ${g > 1e9 ? 'At a neutron star the path curves on the scale of the star itself: no longer a small effect, and the full theory is needed.' : 'Light crossing a laboratory falls by about 10⁻¹⁶ m — real, but far too small to see there.'}`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3], y: [-1.2, 0.3], xlabel: 'distance across the cabin (arbitrary units)', ylabel: 'height',
              curves: [{ fn: '-x^2/8', color: 'gold', label: 'the light ray', labelAt: 1.2, labelDx: 6, labelDy: -12 }, { fn: '0', color: 'ink3', dash: true, label: 'straight line', labelAt: 2.2, labelDx: 0, labelDy: -12 }],
            },
            caption: 'The ray’s path relative to the cabin, its droop exaggerated beyond all measure: a parabola, like a thrown ball’s, falling ½gt² in the crossing time t = x/c.',
          },
        };
      },
    }),
    num({
      id: 'gravity-probe-a', difficulty: 3,
      prompt: t`In 1976 Gravity Probe A carried a hydrogen-maser clock about 10,000 km up on a flight of under two hours and compared it by radio with one on the ground. Using the potential $\Phi = -GM/r$ (not $gh$: gravity weakens over that height), predict the fractional rate difference $\Delta\Phi/c^2 = \dfrac{GM}{c^2}\left(\dfrac{1}{R_\oplus} - \dfrac{1}{R_\oplus + h}\right)$ at the top. ($GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R_\oplus = 6371$ km.)`,
      answer: GPA, tol: { rel: 0.01 },
      errors: [
        { value: (g0 * 1e7) / C ** 2, feedback: t`$gh/c^2$ assumes $g$ stays 9.81 m/s² all the way up. At 10,000 km it has fallen to a sixth of that: use $\Phi = -GM/r$.` },
        { value: (GM_EARTH / (R_EARTH + 1e7)) / C ** 2, feedback: t`That is $|\Phi|/c^2$ at the top alone. The clocks compare the *difference* in potential.` },
      ],
      hints: [t`$\dfrac{1}{R_\oplus} - \dfrac{1}{R_\oplus + h} = \dfrac{1}{6.371\times10^{6}} - \dfrac{1}{1.6371\times10^{7}}\ \text{m}^{-1}$.`, t`Multiply by $GM/c^2 = 3.986\times10^{14}/(2.998\times10^{8})^2 = 4.435\times10^{-3}$ m.`],
      teach: 'For large height differences the redshift is the potential difference ΔΦ/c², with Φ = −GM/r, not gh/c².',
      explain: t`$\dfrac{GM}{c^2}\left(\dfrac1{R_\oplus} - \dfrac1{R_\oplus + h}\right) = (4.435\times10^{-3}\ \text{m})(${sci(1 / R_EARTH - 1 / (R_EARTH + 1e7))}\ \text{m}^{-1}) = ${sci(GPA)}$: a rate that would add up to about $${sci(GPA * 86400 * 1e6, 2)}\ \mu$s a day. GP-A confirmed the prediction to about $2\times10^{-4}$ — a test of local position invariance. The naive $gh/c^2$ would have overestimated it by ${fmt(((g0 * 1e7) / C ** 2) / GPA, 2)} times.`,
      visual: {
        type: 'graph',
        params: {
          x: [-3.2, 3.2], y: [-1.15, 2.85], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4 }, { param: ['0.06*sin(3*t)', '1 + 1.57*t'], t: [0, 1], color: 'gold', width: 2, dash: true }],
          points: [{ x: 0, y: 1, color: 'accent', label: 'ground maser' }, { x: 0, y: 2.57, color: 'gold', label: 'probe’s maser, 10 000 km up' }],
        },
        caption: 'Earth (radius 6371 km) and the probe’s nearly vertical flight to about 10,000 km, to scale in height. Radio links compared the two clocks throughout, with the Doppler shifts of the probe’s motion cancelled out.',
      },
    }),
    match({
      id: 'tests', difficulty: 2,
      prompt: 'Match each experiment to the part of the equivalence principle it tests most directly.',
      left: [
        'MICROSCOPE: titanium and platinum test masses falling together in orbit',
        'Pound–Rebka: gamma rays sent up and down a 22.5 m tower',
        'Hughes–Drever: nuclear energy levels watched as Earth turns',
        'Lunar laser ranging: do the Earth and the Moon fall toward the Sun alike?',
      ],
      right: [
        'universality of free fall (weak EP)',
        'local position invariance (gravitational redshift)',
        'local Lorentz invariance (no preferred direction)',
        'strong EP (gravitational self-energy falls alike)',
      ],
      answer: [0, 1, 2, 3],
      hints: ['The WEP is about bodies falling; LPI is about clocks at different places; LLI is about directions and states of motion; the strong EP adds bodies held together by their own gravity.', 'The Earth has a larger fraction of gravitational self-energy than the Moon.'],
      teach: 'The EEP has three testable parts — free fall (WEP), local Lorentz invariance and local position invariance — and the strong EP extends it to self-gravitating bodies.',
      explain: 'MICROSCOPE compares materials falling (WEP). Pound–Rebka compares clocks (frequencies) at two heights (LPI). Hughes–Drever looks for energy levels that depend on direction relative to the galaxy (LLI). Lunar laser ranging checks that Earth and Moon, with different gravitational binding energies, fall toward the Sun alike (the Nordtvedt effect, SEP).',
      visual: principlesPicture('The principles nested: the Einstein equivalence principle contains the weak one, local Lorentz invariance and local position invariance; the strong principle extends it to gravitational experiments and self-gravitating bodies.'),
    }),
    num({
      id: 'small-box', difficulty: 3,
      gen(r) {
        const [eps, lab] = r.pick([[1e-6, t`10^{-6}`], [1e-9, t`10^{-9}`], [1e-12, t`10^{-12}`]]);
        const ans = (eps * R_EARTH) / 2;
        return {
          prompt: t`The equivalence principle holds only in a *small* freely falling box. Near Earth’s surface the tidal acceleration between two points a vertical distance $L$ apart is $2GML/R_\oplus^3$. How tall can a falling box be if that must stay below $${lab}\,g$, with $g = GM/R_\oplus^2$? ($R_\oplus = 6371$ km.)`,
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: eps * R_EARTH, feedback: t`Along the vertical the tidal term has a factor 2: $2GML/R^3 < \epsilon\,GM/R^2$ gives $L < \epsilon R/2$.` },
            { value: (eps * R_EARTH) / 2 / 1e3, feedback: 'Keep the radius in metres to get the answer in metres.' },
          ],
          hints: [t`Set $\dfrac{2GML}{R^3} = \epsilon\,\dfrac{GM}{R^2}$ and cancel $GM$.`, t`$L = \epsilon R/2 = ${lab}\times6.371\times10^{6}/2$ m.`],
          teach: 'Tides grow with the size of the box, so the equivalence principle is exact only in the limit of a small enough laboratory: L ≲ εR/2 for precision ε.',
          explain: t`$L = \epsilon R_\oplus/2 = ${sci(ans)}$ m. Tides fix the scale: the more precisely you want gravity to vanish, the smaller the box (or the shorter the experiment). This leftover — the part no falling frame removes — is spacetime curvature.`,
          visual: tidalBox,
        };
      },
    }),
    expr({
      id: 'crest-rate', difficulty: 3,
      prompt: t`In the worked example a crest leaving the floor at $t_e$ reaches the ceiling at $t_a$, where $c(t_a - t_e) = h + \tfrac12 g t_a^2 - \tfrac12 g t_e^2$. Differentiate to find $\dfrac{dt_a}{dt_e}$, the ratio of arrival spacing to emission spacing, in terms of $c$, $g$, $t_a$ and $t_e$.`,
      answer: '(c - g t_e)/(c - g t_a)', answerTeX: t`\frac{c - g\,t_e}{c - g\,t_a}`,
      lhs: '\\dfrac{dt_a}{dt_e}',
      vars: { c: [5, 10], g: [0.1, 1], t_a: [0.5, 2], t_e: [0, 0.4] },
      errors: [
        { answer: '(c - g t_a)/(c - g t_e)', feedback: t`Upside down: collect the $dt_a/dt_e$ terms on one side: $(c - g t_a)\dfrac{dt_a}{dt_e} = c - g t_e$.` },
        { answer: '1 + g t_a/c', feedback: t`That is the first-order approximation. The exact derivative is $(c - g t_e)/(c - g t_a)$.` },
      ],
      hints: [t`Differentiating both sides with respect to $t_e$: $c\left(\dfrac{dt_a}{dt_e} - 1\right) = g t_a\dfrac{dt_a}{dt_e} - g t_e$.`, t`Collect: $(c - g t_a)\dfrac{dt_a}{dt_e} = c - g t_e$.`],
      teach: 'Implicit differentiation of the arrival condition gives the ratio of arrival to emission spacing: (c − g tₑ)/(c − g tₐ).',
      explain: t`$\dfrac{dt_a}{dt_e} = \dfrac{c - g t_e}{c - g t_a}$. With $t_e = 0$ and $t_a \approx h/c$ this is $1/(1 - gh/c^2) \approx 1 + gh/c^2$ — the redshift factor, from kinematics and the speed of light alone.`,
      visual: { type: 'graph', params: pulseParams({ constants: { a: 0.1 } }), caption: t`Crest 1 leaves at $t_e = 0$ and arrives at $t_a$; crest 2 leaves a little later and arrives later by more. Units with $c = 1$, $h = 1$, at an exaggerated $gh/c^2 = 0.1$.` },
    }),
    num({
      id: 'pound-rebka-speed', difficulty: 2,
      prompt: t`Pound and Rebka could not tune their 14.4 keV gamma rays directly. Instead they moved the source slowly, so that its Doppler shift $v/c$ exactly cancelled the gravitational shift $gh/c^2$ over the ${PR_H} m tower. At what speed did the source have to move? (Use $g = 9.81\ \text{m/s}^2$.)`,
      answer: (g0 * PR_H) / C, units: 'm/s', tol: { rel: 0.01 },
      errors: [
        { value: (g0 * PR_H) / C ** 2, feedback: t`That is the fractional shift $gh/c^2$. The speed whose Doppler shift matches it is $v = c\times gh/c^2 = gh/c$.` },
        { value: g0 * PR_H, feedback: t`Divide by $c$: the Doppler fraction is $v/c$, so $v = gh/c$.` },
      ],
      hints: [t`Set the Doppler fraction equal to the gravitational one: $v/c = gh/c^2$.`, t`$v = gh/c = 9.81\times${PR_H}/(2.998\times10^{8})$ m/s.`],
      teach: 'A source moving at v shifts frequencies by v/c, so a speed v = gh/c cancels the gravitational shift over a height h.',
      explain: t`$v = gh/c = ${sci((g0 * PR_H) / C)}$ m/s — under a micrometre per second, about ${fmt((g0 * PR_H) / C * 3600 * 1000, 2)} mm per hour. The Mössbauer effect made the 14.4 keV line of iron-57 sharp enough to notice a shift of $${sci((g0 * PR_H) / C ** 2)}$ of its frequency.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.6, 2.6], y: [-0.3, 2.75], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ param: ['-1.7', '2.55*t'], t: [0, 1], color: 'ink3', width: 3 }, { param: ['1.7', '2.55*t'], t: [0, 1], color: 'ink3', width: 3 }, { param: ['-2.3 + 4.6*t', '0'], t: [0, 1], color: 'ink2', width: 2 }],
          arrows: [{ from: [0, 0.3], to: [0, 2.2], color: 'gold', label: '14.4 keV γ, climbing', labelDx: 8, labelDy: 40 }, { from: [-0.3, 0.12], to: [-0.3, 0.55], color: 'violet' }],
          points: [{ x: 0, y: 0.15, color: 'violet', r: 5, label: 'source, moved slowly up', labelDx: 12, labelDy: 2 }, { x: 0, y: 2.38, color: 'accent', r: 5, label: 'iron-57 absorber', labelDx: 12, labelDy: 0 }],
        },
        caption: `Schematic, not to scale: the ${PR_H} m Jefferson tower at Harvard, with the source at the bottom and the absorber at the top (they also ran it the other way round).`,
      },
    }),
    order({
      id: 'chain', difficulty: 2,
      prompt: 'Put the chain of reasoning in order, from universal free fall to clocks that tick at different rates.',
      items: [
        t`All bodies fall alike: $m_\text{g}/m_\text{i}$ is the same for all matter (WEP).`,
        'So a small freely falling laboratory cannot tell it is in a gravitational field.',
        'EEP: inside it, all non-gravitational physics is special relativity, the same everywhere.',
        'Then a laboratory at rest on Earth is equivalent to a rocket accelerating at g.',
        t`Light climbing a height $h$ in the rocket is received redshifted by $gh/c^2$ — so on Earth too, and the lower clock runs slow.`,
      ],
      hints: ['Start from the experimental fact about falling bodies.', 'The rocket calculation comes last; the equivalence statements justify using it.'],
      teach: 'Universal free fall makes gravity locally equivalent to acceleration; the EEP then lets a rocket calculation predict clocks on Earth.',
      explain: 'WEP → falling labs are locally inertial → EEP fixes the physics inside them → a lab on the ground is an accelerating lab → the Doppler effect in the accelerating lab is the gravitational redshift.',
      visual: principlesPicture('Each step leans on one piece of the EEP: the WEP for the falling lab, local Lorentz invariance for doing special relativity inside it, local position invariance for carrying the result from the rocket to Earth.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-eccentric', difficulty: 3, transfer: true,
      prompt: t`Two Galileo navigation satellites stranded in elliptical orbits in 2014 turned out to be a gift: their clocks rise and fall in Earth’s potential every orbit, and in 2018 they confirmed the gravitational redshift to $2.5\times10^{-5}$. For an orbit with perigee 23,400 km and apogee 32,500 km from Earth’s centre, how much faster (as a fraction) does the clock run at apogee than at perigee, from the potential alone? ($GM_\oplus/c^2 = 4.435\times10^{-3}$ m.)`,
      answer: (GM_EARTH / C ** 2) * (1 / 2.34e7 - 1 / 3.25e7), tol: { rel: 0.01 },
      errors: [
        { value: (GM_EARTH / C ** 2) / 2.34e7, feedback: 'That is |Φ|/c² at perigee alone; the clock’s rate change is the difference in potential between the two points.' },
        { value: (g0 * (3.25e7 - 2.34e7)) / C ** 2, feedback: t`$gh/c^2$ with surface gravity fails badly this far out. Use $\Phi = -GM/r$ at both radii.` },
      ],
      hints: [t`$\dfrac{\Delta\Phi}{c^2} = \dfrac{GM}{c^2}\left(\dfrac{1}{r_\text{p}} - \dfrac{1}{r_\text{a}}\right)$.`, t`$4.435\times10^{-3}\times\left(\dfrac{1}{2.34\times10^{7}} - \dfrac{1}{3.25\times10^{7}}\right)$.`],
      teach: 'Local position invariance makes a clock’s rate follow the potential it sits in: ΔΦ/c² between two radii.',
      explain: t`$\dfrac{\Delta\Phi}{c^2} = 4.435\times10^{-3}\times${sci(1 / 2.34e7 - 1 / 3.25e7)} = ${sci((GM_EARTH / C ** 2) * (1 / 2.34e7 - 1 / 3.25e7))}$. (The satellite also moves faster at perigee, which slows its clock further there; the combined effect is what was measured.) Over many orbits the periodic wobble pins down the redshift law better than Gravity Probe A’s single flight.`,
      visual: {
        type: 'graph',
        params: {
          x: [-4.4, 4.4], y: [-3.05, 3.05], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ param: ['0.6371*cos(t)', '0.6371*sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4 }, { param: ['-0.455 + 2.795*cos(t)', '2.758*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 }],
          points: [{ x: 2.34, y: 0, color: 'accent', label: 'perigee' }, { x: -3.25, y: 0, color: 'violet', label: 'apogee' }],
        },
        caption: 'The orbit to scale (units of 10,000 km), with Earth at one focus. The clock’s potential — and so its rate — changes all the way round.',
      },
    }),
    mcq({
      id: 'cp-binding', difficulty: 2,
      prompt: 'Suppose gravity pulled slightly more strongly on nuclear binding energy than on the rest of a body’s mass-energy. Which principle would experiments catch failing first?',
      choices: [
        'The weak equivalence principle: titanium and platinum, with different binding energies per unit mass, would fall at slightly different rates',
        'Local Lorentz invariance only: the effect would depend on which direction the lab faces',
        'Local position invariance only: clocks at different heights would tick at the same rate',
        'None: binding energy has no mass, so gravity cannot act on it',
      ],
      answer: 0,
      why: {
        1: 'The proposed effect depends on composition, not on direction. It shows up as different materials falling differently.',
        2: 'That would be a separate violation; the first and most sensitive signature of a composition-dependent coupling is in free-fall tests.',
        3: 'Binding energy contributes to mass (E = mc²): a nucleus weighs less than its separate protons and neutrons by the binding energy over c².',
      },
      hints: ['Different materials carry different fractions of their mass as nuclear binding energy.', 'Which test compares different materials?'],
      teach: 'Any coupling of gravity to a particular form of energy makes the free-fall acceleration depend on composition — exactly what Eötvös-type tests look for.',
      explain: t`Nuclear binding energy is a different fraction of the mass in titanium and in platinum. If gravity treated it differently, $m_g/m_i$ would differ between them, and MICROSCOPE would have seen $\eta \neq 0$. That is why test materials are chosen to differ as much as possible in composition.`,
      visual: wepHistory('The tightening limits on composition dependence in free fall. Any coupling of gravity to one particular form of energy would have shown up as a non-zero η.'),
    }),
    num({
      id: 'cp-half-bending', difficulty: 2, transfer: true,
      prompt: t`Treat starlight as falling like everything else — the equivalence principle and nothing more — and a ray passing the Sun at closest distance $b$ is bent by $2GM_\odot/(c^2 b)$. Compute this for a ray grazing the Sun’s edge, $b = R_\odot = 6.957\times10^{8}$ m, in arcseconds. ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$.)`,
      answer: EP_LIMB, units: 'arcsec', tol: { rel: 0.01 },
      errors: [
        { value: 2 * EP_LIMB, feedback: t`That is general relativity’s full $4GM/(c^2b)$. The equivalence principle alone gives half of it.` },
        { value: EP_LIMB * ARCSEC, feedback: 'That is in radians; convert: 1 rad = 206 265″.' },
      ],
      hints: [t`$\dfrac{2GM_\odot}{c^2R_\odot} = \dfrac{2(1.327\times10^{20})}{(2.998\times10^{8})^2(6.957\times10^{8})}$ radians.`, 'Multiply by 206 265 to convert radians to arcseconds.'],
      teach: 'The equivalence principle predicts half of the light bending: the curvature of time alone; curved space supplies the other half.',
      explain: t`$\dfrac{2GM_\odot}{c^2R_\odot} = ${sci(EP_LIMB * ARCSEC)}$ rad $= ${fmt(EP_LIMB, 3)}''$ — Einstein’s 1911 value. Measured deflections are twice this, $${fmt(2 * EP_LIMB, 3)}''$, confirmed by the 1919 eclipse expeditions and, to about 1 part in 10,000, by radio interferometry: the EEP is right but not the whole story.`,
      visual: {
        type: 'graph',
        params: {
          x: [0.8, 6], y: [0, 2.2], xlabel: 'closest approach (solar radii)', ylabel: 'bending (arcsec)',
          curves: [{ fn: `${round(2 * EP_LIMB)}/x`, color: 'gold', label: 'measured (general relativity)', labelAt: 2.2, labelDx: 8, labelDy: -10 }, { fn: `${round(EP_LIMB)}/x`, color: 'accent', dash: true, label: 'equivalence principle alone', labelAt: 3.2, labelDx: 8, labelDy: 12 }],
          vlines: [{ x: 1, label: 'Sun’s edge' }],
        },
        caption: 'Bending of starlight against closest approach: both predictions fall as 1/b, the measured one twice as large. (The question’s value is where the dashed curve meets the edge.)',
      },
    }),
  ],
  sources: [
    { label: 'Will (2014), The confrontation between general relativity and experiment, Living Reviews in Relativity 17, 4', url: 'https://arxiv.org/abs/1403.7377' },
    { label: 'Touboul et al. (2022), MICROSCOPE mission: final results of the test of the equivalence principle, Phys. Rev. Lett. 129, 121102', url: 'https://arxiv.org/abs/2209.15487' },
    { label: 'Pound & Rebka (1960), Apparent weight of photons, Phys. Rev. Lett. 4, 337', url: 'https://doi.org/10.1103/PhysRevLett.4.337' },
    { label: 'Delva et al. (2018), Gravitational redshift test using eccentric Galileo satellites, Phys. Rev. Lett. 121, 231101', url: 'https://arxiv.org/abs/1812.03711' },
  ],
});
