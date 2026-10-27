// Kerr black holes — Intuition Mode. A settled, uncharged black hole is fixed
// by its mass M and spin a = J/(Mc) ≤ GM/c². In units of M = GM/c²: horizons
// r± = M ± √(M² − a²); ergosphere edge r_E = M + √(M² − a²cos²θ), reaching 2M
// at the equator; co-rotating ISCO 6M → M as a → M (Bardeen–Press–Teukolsky),
// so thin-disk efficiency 1 − √(1 − 2M/3r) rises from 5.7% to 42% (1 − 1/√3).
// Frame dragging (Gravity Probe B: 37.2 ± 7.2 mas/yr, GR 39.2); Penrose
// process (≤ 29% of an extreme hole's mass); a > M has no horizon [math].
import { lesson, mcq, num } from '../../src/core/content.js';
import { C, M_SUN, YEAR, mLen, sci, round, T_SUN, kerr, kerrExpr } from './_frontier.js';

const t = String.raw;

const KM = mLen(M_SUN) / 1e3;                         // GM☉/c² in km
const pct = (x) => sci(100 * x, 3);

// a slice through a spinning hole containing its spin axis (vertical); radii are
// Boyer–Lindquist r drawn as distance from the centre. Spin variable: a (units of M).
const sliceCurves = [
  { polar: '1 + sqrt(1 - a^2 sin(theta)^2)', theta: [0, 6.2832], color: 'bad', width: 2.6, label: 'ergosphere edge', labelAt: 0.62 },
  { polar: kerrExpr.rPlus('a'), theta: [0, 6.2832], color: 'ink', width: 3 },
  { polar: kerrExpr.rMinus('a'), theta: [0, 6.2832], color: 'ink3', width: 1.4, dash: true },
];
const slicePoints = (labels = true) => [
  { x: kerrExpr.isco('a', true), y: 0, color: 'gold', label: labels ? 'co-rotating ISCO' : undefined },
  { x: `-${kerrExpr.isco('a', false)}`, y: 0, color: 'violet', label: labels ? 'counter-rotating ISCO' : undefined },
  { x: 0.12, y: kerrExpr.rPlus('a'), r: 0.5, color: 'ink', label: labels ? 'horizon' : undefined },
];
const crossSection = (a, caption) => ({
  type: 'graph',
  params: {
    x: [-9.8, 9.8], y: [-3.6, 3.9], equal: true, aspect: 'wide', xlabel: 'units of GM/c²', ylabel: '',
    constants: { a },
    curves: sliceCurves,
    points: slicePoints(),
    arrows: [{ from: [0, 2.35], to: [0, 3.55], color: 'gold', label: 'spin axis' }],
  },
  caption: caption ?? `A slice through a black hole with a = ${a}M, containing its spin axis. Black: the horizon; red: the edge of the ergosphere; dashed: the inner horizon. Boyer–Lindquist r is drawn as distance from the centre — a map of the formulas, not of true distances.`,
});

// the two horizons against spin
const horizonsGraph = (chi, wide = false) => ({
  type: 'graph',
  params: {
    x: [0, wide ? 1.4 : 1.05], y: [0, 2.25], xlabel: 'spin χ = a/M', ylabel: 'radius / M',
    curves: [
      { fn: '1 + sqrt(1 - x^2)', domain: [0, 1], color: 'ink', width: 2.6, label: 'outer horizon r₊', labelAt: 0.25 },
      { fn: '1 - sqrt(1 - x^2)', domain: [0, 1], color: 'ink3', dash: true, label: 'inner horizon r₋', labelAt: 0.62 },
    ],
    vlines: [{ x: 1, label: 'χ = 1' }, ...(chi === null ? [] : [{ x: chi, label: `χ = ${chi}`, color: 'accent' }])],
  },
  caption: wide ? 'Boyer–Lindquist radii of the two horizons against spin, in units of GM/c². They merge at χ = 1; beyond it the formula has no real value — there is no horizon at all.' : 'Boyer–Lindquist radii of the two horizons against spin, in units of GM/c². Spin shrinks the event horizon from 2M toward M.',
});

// innermost stable orbits against spin
const iscoGraph = (chi) => ({
  type: 'graph',
  params: {
    x: [0, 1.02], y: [0, 9.6], xlabel: 'spin χ = a/M', ylabel: 'ISCO radius / M',
    curves: [
      { fn: kerrExpr.isco('x', true), domain: [0, 1], color: 'gold', label: 'co-rotating', labelAt: 0.45, labelDy: 14 },
      { fn: kerrExpr.isco('x', false), domain: [0, 1], color: 'violet', label: 'counter-rotating', labelAt: 0.45 },
      { fn: '1 + sqrt(1 - x^2)', domain: [0, 1], color: 'ink', width: 1.6, label: 'horizon', labelAt: 0.12, labelDy: 14 },
    ],
    vlines: chi === null ? [] : [{ x: chi, label: `χ = ${chi}`, color: 'accent' }],
  },
  caption: 'Innermost stable circular orbits around a Kerr black hole (Bardeen, Press & Teukolsky 1972), in Boyer–Lindquist r. Orbits going with the spin can come much closer than the 6M of a non-spinning hole.',
});

// thin-disk efficiency against spin
const effGraph = (chi) => ({
  type: 'graph',
  params: {
    x: [0, 1.02], y: [0, 45], xlabel: 'spin χ = a/M', ylabel: '% of rest energy',
    curves: [
      { fn: `100*${kerrExpr.efficiency('x', true)}`, domain: [0, 0.99999], color: 'gold', label: 'co-rotating disk', labelAt: 0.3, labelDy: -14 },
      { fn: `100*${kerrExpr.efficiency('x', false)}`, domain: [0, 1], color: 'violet', label: 'counter-rotating', labelAt: 0.3, labelDy: 14 },
    ],
    hlines: [{ y: round(100 * (1 - 1 / Math.sqrt(3)), 5), label: '42.3% at χ = 1' }],
    vlines: chi === null ? [] : [{ x: chi, label: `χ = ${chi}`, color: 'accent' }],
  },
  caption: 'The fraction of rest energy that gas radiates as it spirals through a thin disk to the innermost stable orbit, 1 − √(1 − 2M/3r), against spin. The steep rise happens only very close to χ = 1.',
});

// spin values with their ISCO, used by several items
const SPINS = [0, 0.5, 0.7, 0.9, 0.998];
const iscoTxt = (a) => sci(kerr.isco(a), 4);

export default lesson({
  id: 'gr.S26.i',
  title: 'Spinning black holes and frame dragging',
  minutes: 10, difficulty: 3, mode: 'intuition', badges: ['est-der', 'math'],
  intro: t`Stars spin, so the black holes they collapse into spin too. In 1963 Roy Kerr found the exact spacetime around a spinning black hole, and it has only two numbers: the mass $M$ and the spin $a = J/(Mc)$. Measuring lengths in units of $M = GM/c^2$ (that is, $G = c = 1$), it has an **event horizon** at $r_+$, smaller than the non-spinning $2M$, and outside it an **ergosphere**, where spacetime is dragged around so fast that nothing can stay still relative to the distant stars:

$$r_\pm = M \pm \sqrt{M^2 - a^2} \qquad r_E(\theta) = M + \sqrt{M^2 - a^2\cos^2\theta}$$

A horizon exists only if $a \le M$. The same **frame dragging**, vastly weaker, happens around the spinning Earth — and Gravity Probe B measured it.`,
  equation: t`r_+ = M + \sqrt{M^2 - a^2}, \qquad a \le M`,
  symbols: [
    { tex: 'r_+', text: 'the event horizon: the point of no return, as a Boyer–Lindquist radius. For a spinning hole $r$ is a coordinate — not the distance to the centre, nor even circumference ÷ 2π' },
    { tex: 'r_-', text: 'the inner horizon, deep inside. Everything beyond it is mathematically allowed but expected to be unstable — badged **math**' },
    { tex: 'M', text: 'the mass written as a length, $GM/c^2$: 1.48 km per solar mass' },
    { tex: 'a', text: 'the spin written as a length, $a = J/(Mc)$; the dimensionless spin is $\\chi = a/M$, between 0 and 1 for a black hole' },
    { tex: 'J', text: 'the black hole’s angular momentum, in kg m²/s' },
    { tex: 'r_E(\\theta)', text: 'the outer edge of the ergosphere, at angle $\\theta$ from the spin axis: it touches the horizon at the poles and reaches $2M$ at the equator' },
  ],
  why: 'Spin decides how much light a quasar wrings out of infalling gas — up to 42% of its rest energy instead of 5.7% — and it is one of the two numbers LIGO reads from every black-hole merger.',
  visual: {
    type: 'graph',
    title: 'A slice through a spinning black hole',
    lead: t`The slice contains the spin axis (vertical). **Black**: the event horizon. **Red**: the edge of the ergosphere. The dots on the equator are the innermost stable circular orbits for gas going round **with** the spin (gold) and **against** it (violet). Distances are in units of $M = GM/c^2$.`,
    tasks: ['Start at a = 0: horizon and ergosphere edge coincide at 2M and both orbits sit at 6M — a non-spinning (Schwarzschild) hole.', 'Slide to a = 0.9: the horizon shrinks to 1.44M, the ergosphere opens up between it and 2M at the equator, and the co-rotating orbit moves in to 2.32M.', 'Push toward a = 1: the co-rotating orbit closes in on M and the energy released heads for 42%.'],
    params: {
      x: [-9.8, 9.8], y: [-3.6, 3.9], equal: true, aspect: 'wide', xlabel: 'units of GM/c²', ylabel: '',
      sliders: [{ key: 'a', label: 'Spin $a$', min: 0, max: 0.999, step: 0.001, value: 0.6, unit: 'M', explain: 'Angular momentum per unit mass, $a = J/(Mc)$, in units of $M = GM/c^2$. A black hole needs $a \\le M$.' }],
      curves: sliceCurves,
      points: slicePoints(),
      arrows: [{ from: [0, 2.35], to: [0, 3.55], color: 'gold', label: 'spin axis' }],
      readouts: [
        { label: 'horizon $r_+$', expr: kerrExpr.rPlus('a'), unit: 'M', digits: 4 },
        { label: 'ergosphere at the equator', expr: '2', unit: 'M', digits: 2 },
        { label: 'co-rotating ISCO', expr: kerrExpr.isco('a', true), unit: 'M', digits: 4 },
        { label: 'counter-rotating ISCO', expr: kerrExpr.isco('a', false), unit: 'M', digits: 4 },
        { label: 'disk efficiency (co-rotating)', expr: `100*${kerrExpr.efficiency('a', true)}`, unit: '\\%', digits: 3 },
      ],
    },
    caption: 'Boyer–Lindquist r drawn as distance from the centre: a map of the formulas, not a picture of true distances. Dashed: the inner horizon r₋ — everything inside it is mathematically allowed but expected to be unstable. The ring-shaped singularity is not drawn. The orbits are circles in the equatorial plane, shown where they cross this slice.',
  },
  example: {
    prompt: t`A 10-solar-mass black hole spins at $\chi = 0.9$, so $a = 0.9M$. Find its horizon radius, the thickness of its ergosphere at the equator, and the innermost stable orbit for gas going round with the spin, with the energy that gas radiates — and compare each with a non-spinning hole.`,
    steps: [
      { label: 'The unit', text: t`$M = GM/c^2 = 10\times${sci(KM, 4)}$ km $= ${sci(10 * KM, 4)}$ km.` },
      { label: 'Horizon', text: t`$r_+ = M + \sqrt{M^2 - a^2} = (1 + \sqrt{1 - 0.81})\,M = ${sci(kerr.rPlus(0.9), 4)}\,M = ${sci(kerr.rPlus(0.9) * 10 * KM, 3)}$ km, against $2M = ${sci(20 * KM, 3)}$ km without spin.` },
      { label: 'Ergosphere', text: t`At the equator $\cos\theta = 0$, so $r_E = M + \sqrt{M^2} = 2M = ${sci(20 * KM, 3)}$ km for every spin. The ergosphere fills the gap from ${sci(kerr.rPlus(0.9) * 10 * KM, 3)} to ${sci(20 * KM, 3)} km there — ${sci((2 - kerr.rPlus(0.9)) * 10 * KM, 2)} km thick — and closes up at the poles, where $\cos\theta = \pm1$ makes $r_E = r_+$.` },
      { label: 'Innermost stable orbit', text: t`Bardeen, Press and Teukolsky's formula gives $r_\text{ISCO} = ${iscoTxt(0.9)}\,M = ${sci(kerr.isco(0.9) * 10 * KM, 3)}$ km for co-rotating gas, against $6M = ${sci(60 * KM, 3)}$ km without spin. (Gas going against the spin must stay outside ${sci(kerr.isco(0.9, false), 4)}M.)` },
      { label: 'Energy', text: t`On that orbit each kilogram has energy $\sqrt{1 - 2M/(3r)}\,mc^2 = ${sci(kerr.eIsco(kerr.isco(0.9)), 4)}\,mc^2$, so gas spiralling in through a disk radiates ${pct(kerr.efficiency(0.9))}% of its rest energy — almost three times the ${pct(kerr.efficiency(0))}% of a non-spinning hole.` },
      { label: 'Sense check', text: t`As $\chi \to 1$, $r_+$ and the co-rotating ISCO both approach $M$ and the energy factor approaches $\sqrt{1 - 2/3} = 1/\sqrt3$: the famous limit of $1 - 1/\sqrt3 = ${pct(1 - 1 / Math.sqrt(3))}\%$.` },
    ],
    answer: t`Horizon ${sci(kerr.rPlus(0.9) * 10 * KM, 3)} km (not ${sci(20 * KM, 3)}); ergosphere ${sci((2 - kerr.rPlus(0.9)) * 10 * KM, 2)} km thick at the equator; co-rotating ISCO ${sci(kerr.isco(0.9) * 10 * KM, 3)} km (not ${sci(60 * KM, 3)}); ${pct(kerr.efficiency(0.9))}% of the rest energy radiated (not ${pct(kerr.efficiency(0))}%).`,
  },
  practice: [
    mcq({
      id: 'no-hair', difficulty: 1,
      prompt: 'According to general relativity, an isolated black hole that has settled down, with no electric charge, is completely described by which numbers?',
      choices: ['Its mass and its spin', 'Its mass alone', 'Its mass, its spin and the composition of what fell in', 'Its mass, its spin and the temperature of its surface'],
      answer: 0,
      why: {
        1: 'Mass alone describes only a non-spinning hole — the Schwarzschild spacetime. Real black holes spin.',
        2: 'Every detail of what fell in — iron or hydrogen, matter or antimatter — is radiated away or hidden behind the horizon. Only mass and spin (and charge) are left: the “no-hair” result.',
        3: 'A black hole has no surface. Its predicted Hawking temperature is set by its mass and spin, not by a separate number.',
      },
      hints: ['How many numbers does the Kerr solution contain?'],
      teach: 'A settled, uncharged black hole in general relativity is fixed by two numbers, mass and spin: the “no-hair” result.',
      explain: 'Uniqueness theorems show that every settled, uncharged black hole in empty space is a Kerr black hole, with just two parameters, M and a = J/(Mc). Black-hole “ringdowns” test this: in GW250114, LIGO–Virgo–KAGRA measured two tones of the final hole’s ringing, both consistent with the Kerr values to within about 30%.',
      visual: crossSection(0.7),
    }),
    num({
      id: 'horizon', difficulty: 2,
      gen(r) {
        const [name, m, chi] = r.pick([
          ['a 10-solar-mass black hole spinning at χ = 0.9', 10, 0.9],
          ['a 30-solar-mass black hole spinning at χ = 0.7', 30, 0.7],
          ['a 5-solar-mass black hole spinning at χ = 0.5', 5, 0.5],
          ['GW231123’s heavier black hole, about 137 solar masses spinning at χ ≈ 0.9', 137, 0.9],
          ['a 20-solar-mass black hole spinning at χ = 0.99', 20, 0.99],
        ]);
        const unit = m * KM, x = kerr.rPlus(chi) * unit;
        return {
          prompt: t`What is the horizon radius $r_+ = \dfrac{GM}{c^2}\left(1 + \sqrt{1 - \chi^2}\right)$ of ${name}? ($GM_\odot/c^2 = ${sci(KM * 1e3, 4)}$ m)`,
          answer: x, units: 'km', tol: { rel: 0.01 },
          errors: [
            { value: 2 * unit, feedback: 'That is the horizon of a non-spinning hole, 2GM/c². Spin shrinks it: r₊ = (GM/c²)(1 + √(1 − χ²)).' },
            { value: kerr.rMinus(chi) * unit, feedback: 'That is the inner horizon r₋. The event horizon takes the + sign.' },
            { value: (2 - chi * chi) * unit, feedback: 'Take the square root of 1 − χ² before adding 1.' },
          ],
          hints: [t`First $GM/c^2 = ${m}\times${sci(KM * 1e3, 4)}$ m $= ${sci(unit, 4)}$ km.`, t`$1 + \sqrt{1 - ${chi}^2} = ${sci(kerr.rPlus(chi), 4)}$; multiply.`],
          teach: 'Spin shrinks the event horizon from 2GM/c² (no spin) toward GM/c² (maximal spin).',
          explain: t`$r_+ = ${sci(kerr.rPlus(chi), 4)}\times${sci(unit, 4)}$ km $= ${sci(x)}$ km, against $${sci(2 * unit)}$ km if it did not spin.`,
          visual: horizonsGraph(chi),
        };
      },
    }),
    mcq({
      id: 'ergosphere', difficulty: 2,
      prompt: 'A probe dips into the ergosphere of a spinning black hole — inside the red curve, but still outside the black horizon. Which statement is right?',
      choices: [
        'It can still escape, but it cannot stay at rest relative to the distant stars: it is forced to go round with the hole',
        'It can never escape: the ergosphere is the black hole’s true edge',
        'With powerful enough rockets it can hover, motionless relative to the distant stars',
        'Nothing changes there: the ergosphere is only an effect of the coordinates',
      ],
      answer: 0,
      why: {
        1: 'The point of no return is the horizon, which lies inside the ergosphere. Between the two, escape is still possible — which is what lets energy be extracted.',
        2: 'Inside the ergosphere even light aimed against the rotation is carried forward around the hole, and nothing outruns light: no rocket can hold a probe still there.',
        3: 'Being unable to stay still relative to the distant stars is true for every observer there, in any coordinates; it is a physical fact.',
      },
      hints: ['Two surfaces are drawn. Which one is the point of no return?', 'Inside the red surface, spacetime is dragged around faster than light could move against it.'],
      teach: 'In the ergosphere nothing can stay still relative to the distant stars, yet escape is still possible, because the horizon lies deeper.',
      explain: 'Between the edge of the ergosphere (2GM/c² at the equator) and the horizon (1.44GM/c² for this spin), every possible path — even a light ray aimed against the rotation — is swept around with the hole. But paths outward still exist: the point of no return is the horizon.',
      visual: crossSection(0.9),
    }),
    num({
      id: 'ergo-angle', difficulty: 2,
      gen(r) {
        const chi = r.pick([0.6, 0.8, 0.9, 0.99]), deg = r.pick([30, 45, 60]);
        const th = (deg * Math.PI) / 180, x = kerr.rErgo(chi, th);
        const swap = 1 + Math.sqrt(1 - chi * chi * Math.sin(th) ** 2);
        return {
          prompt: t`A black hole spins at $\chi = ${chi}$. How far out, in units of $GM/c^2$, does its ergosphere reach in a direction ${deg}° from the spin axis? Use $r_E = M + \sqrt{M^2 - a^2\cos^2\theta}$, with $a = \chi M$.`,
          answer: x, tol: { rel: 0.005 },
          errors: [
            ...(deg === 45 ? [] : [{ value: swap, feedback: 'θ is measured from the spin axis, so use cos θ (cos²θ is 1 at the poles, where the ergosphere touches the horizon).' }]),
            { value: kerr.rPlus(chi), feedback: 'That is the horizon, which the ergosphere touches only at the poles (θ = 0).' },
            { value: 2, feedback: 'That is the equator (θ = 90°), where cos θ = 0.' },
          ],
          hints: [t`With $M = 1$: $r_E = 1 + \sqrt{1 - ${chi}^2\cos^2 ${deg}^\circ}$.`, t`$\cos^2 ${deg}^\circ = ${sci(Math.cos(th) ** 2, 3)}$, so the square root is $\sqrt{${sci(1 - chi * chi * Math.cos(th) ** 2, 4)}}$.`],
          teach: 'The ergosphere is widest at the equator (2GM/c²) and closes onto the horizon at the poles.',
          explain: t`$r_E = 1 + \sqrt{1 - ${chi}^2\times${sci(Math.cos(th) ** 2, 3)}} = ${sci(x, 4)}$, in units of $GM/c^2$ — between the horizon (${sci(kerr.rPlus(chi), 4)}) and the equator's 2.`,
          visual: {
            type: 'graph',
            params: {
              x: [-3, 3], y: [-2.3, 2.6], equal: true, xlabel: 'units of GM/c²', ylabel: '',
              constants: { a: chi },
              curves: sliceCurves.slice(0, 2),
              arrows: [{ from: [0, 0], to: [round(2.45 * Math.sin(th), 5), round(2.45 * Math.cos(th), 5)], color: 'accent', label: `${deg}° from the axis` }, { from: [0, 1.6], to: [0, 2.45], color: 'gold' }],
            },
            caption: `The horizon (black) and the edge of the ergosphere (red) for χ = ${chi}; the spin axis points up (gold). Boyer–Lindquist r drawn as distance from the centre.`,
          },
        };
      },
    }),
    num({
      id: 'horizon-spin', difficulty: 2,
      gen(r) {
        const [name, m, chi] = r.pick([
          ['a 10-solar-mass black hole with χ = 0.9', 10, 0.9],
          ['a 30-solar-mass black hole with χ = 0.7', 30, 0.7],
          ['a 5-solar-mass black hole with χ = 0.99', 5, 0.99],
          ['Sagittarius A* (4.30 million solar masses), if its spin were χ = 0.9', 4.3e6, 0.9],
        ]);
        const W = kerr.omegaH(chi) / (m * T_SUN), f = W / (2 * Math.PI);
        return {
          prompt: t`The horizon of a spinning black hole turns as a whole, at angular velocity $\Omega_H = \dfrac{c^3}{GM}\cdot\dfrac{\chi}{2\left(1 + \sqrt{1 - \chi^2}\right)}$. How many turns per second does it make, for ${name}? ($GM_\odot/c^3 = ${sci(T_SUN, 4)}$ s)`,
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: W, feedback: 'That is the angular velocity in rad/s. One turn is 2π radians: divide by 2π.' }],
          hints: [t`$GM/c^3 = ${sci(m, 3)}\times${sci(T_SUN, 4)}$ s $= ${sci(m * T_SUN)}$ s.`, t`$\chi/(2(1 + \sqrt{1 - \chi^2})) = ${sci(kerr.omegaH(chi), 4)}$; divide by $GM/c^3$, then by $2\pi$.`],
          teach: 'A stellar black hole’s horizon can turn hundreds of times a second; a giant one takes minutes.',
          explain: t`$\Omega_H = ${sci(kerr.omegaH(chi), 4)}/${sci(m * T_SUN)}\ \text{s} = ${sci(W)}$ rad/s, so $f = \Omega_H/2\pi = ${sci(f)}$ Hz${f < 1 ? ` — one turn every ${sci(1 / f / 60, 2)} minutes` : ''}.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 1.05], y: [0, 0.55], xlabel: 'spin χ = a/M', ylabel: 'Ω_H in units of c³/GM',
              curves: [{ fn: 'x/(2(1 + sqrt(1 - x^2)))', domain: [0, 1], color: 'accent' }],
              vlines: [{ x: chi, label: `χ = ${chi}`, color: 'accent' }],
            },
            caption: 'The horizon’s angular velocity in units of c³/(GM), against spin. It climbs steeply near χ = 1, where it reaches 1/2.',
          },
        };
      },
    }),
    num({
      id: 'efficiency', difficulty: 3,
      gen(r) {
        const chi = r.pick(SPINS), R = kerr.isco(chi), E = kerr.eIsco(R), x = 100 * (1 - E);
        return {
          prompt: t`Gas spirals inward through a thin disk around a black hole spinning at $\chi = ${chi}$, going round the same way as the hole, until it reaches the innermost stable orbit at $r = ${iscoTxt(chi)}\,GM/c^2$. There each kilogram has energy $E = \sqrt{1 - \dfrac{2GM}{3rc^2}}\;mc^2$. What percentage of its rest energy has the gas radiated?`,
          answer: x, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: 100 * E, feedback: 'That is the energy the gas still has. It has radiated the rest: 1 − E.' },
            { value: 100 * (2 / (3 * R)), feedback: 'Take the square root: E = √(1 − 2/(3r)), so 1 − E is not 2/(3r).' },
          ],
          hints: [t`With $r$ in units of $GM/c^2$: $E = \sqrt{1 - 2/(3r)}$.`, t`$E = \sqrt{1 - 2/(3\times${iscoTxt(chi)})} = ${sci(E, 4)}$; the gas has radiated $1 - E$.`],
          teach: 'The closer the innermost stable orbit, the deeper gas sinks before plunging, and the more of its rest energy it radiates: 5.7% without spin, up to 42% at maximal spin.',
          explain: t`$1 - ${sci(E, 4)} = ${sci(x / 100, 3)}$: ${sci(x, 3)}% of the rest energy${chi === 0 ? ' — the Schwarzschild value from the orbits lesson' : chi > 0.99 ? '. Matter falling in from a disk can spin a hole up to only about χ = 0.998 (Thorne 1974), so about 32% is a realistic ceiling; the 42% needs exactly χ = 1' : `, against ${pct(kerr.efficiency(0))}% without spin`}. Hydrogen fusion releases 0.7%.`,
          visual: iscoGraph(chi),
        };
      },
    }),
    mcq({
      id: 'penrose', difficulty: 3,
      prompt: 'In the Penrose process, a particle falls into the ergosphere and splits in two. One piece falls into the hole; the other escapes with more energy than the original particle had. Where does the extra energy come from?',
      choices: [
        'From the black hole’s rotation: the hole’s spin and mass both go down',
        'From nowhere: the process creates energy, which is why it is only theoretical',
        'From the singularity at the centre',
        'From Hawking radiation leaking out through the horizon',
      ],
      answer: 0,
      why: {
        1: 'Energy is conserved: the piece that falls in carries negative energy, as measured from far away, and lowers the hole’s mass by exactly the surplus.',
        2: 'Nothing can come out from the singularity, which lies inside the horizon.',
        3: 'Hawking radiation is a separate quantum effect, unobserved and utterly negligible for any real black hole.',
      },
      hints: ['Energy is conserved in the whole process. Whose energy goes down?', 'Inside the ergosphere a piece can be put on a path whose energy, as measured from far away, is negative.'],
      teach: 'The Penrose process taps a spinning hole’s rotational energy: at most 29% of the mass of a maximally spinning hole.',
      explain: t`The infalling piece has negative energy as measured from far away, so the hole's mass drops by exactly what the escaping piece gains, and its spin drops too. Only rotational energy can be taken: the mass cannot fall below the **irreducible mass** $M\sqrt{(1 + \sqrt{1 - \chi^2})/2}$, so at most $1 - 1/\sqrt2 = ${pct(1 - kerr.mIrr(1))}\%$ of an extreme hole's mass. Magnetic fields threading the ergosphere are thought to tap the same energy to drive jets — an idea still being tested.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 1.05], y: [0, 33], xlabel: 'spin χ = a/M', ylabel: '% of the mass',
          curves: [{ fn: '100*(1 - sqrt((1 + sqrt(1 - x^2))/2))', domain: [0, 1], color: 'gold' }],
          hlines: [{ y: round(100 * (1 - kerr.mIrr(1)), 5), label: '29.3%' }],
        },
        caption: 'The most energy that could ever be extracted from a spinning black hole, as a percentage of its mass: 1 − M_irr/M, where M_irr is the irreducible mass. All of it is rotational energy.',
      },
    }),
    mcq({
      id: 'naked', difficulty: 3,
      prompt: t`What does the Kerr solution say about a black hole spinning faster than the limit, $a > GM/c^2$ ($\chi > 1$)?`,
      choices: [
        'It has no horizon at all: a “naked” ring singularity, visible from outside. It is mathematically allowed but has never been observed, and no process we know of spins a hole that far',
        'It has a larger horizon, because the extra spin adds energy',
        'It splits into two black holes, each spinning below the limit',
        'Nothing special happens: LIGO has observed many such black holes',
      ],
      answer: 0,
      why: {
        1: 'That is a guess, not what the solution says: for a > M the horizon formula has no real value at all.',
        2: 'The Kerr solution describes one spinning object; it says nothing about splitting. With a > M it simply has no horizon.',
        3: 'Every measured black-hole spin is below 1 — GW231123’s heavier hole, one of the fastest, spins at about 0.9.',
      },
      hints: ['Follow the two horizon curves in the picture to χ = 1. What happens beyond?', t`For $\chi > 1$, $1 - \chi^2 < 0$. What is $\sqrt{1 - \chi^2}$ then?`],
      teach: 'A Kerr solution with a > M has no horizon — a naked singularity — which is mathematically allowed but unobserved.',
      explain: 'The horizons M ± √(M² − a²) stop being real numbers when a > M, so the singularity would be visible from outside. That solution exists on paper (badge: mathematically allowed); nothing like it has been seen. Gas falling in from a disk spins a hole up only to about χ ≈ 0.998, and whether collapse can ever produce a naked singularity — the “cosmic censorship” conjecture says no — is an open question.',
      visual: horizonsGraph(null, true),
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-gpb', difficulty: 2,
      prompt: 'Gravity Probe B carried four gyroscopes in a polar orbit about 640 km above Earth (2004–05). Besides the large turning in the orbital plane (6.6″ per year), their spin axes slowly turned in the direction of Earth’s rotation, by about 37 milliarcseconds per year. What was that?',
      choices: [
        'Frame dragging: the spinning Earth drags spacetime around with it — general relativity predicted 39 mas per year',
        'Friction from Earth’s thin upper atmosphere',
        'A wobble of the gyroscopes themselves, which would average to zero over a year',
        'Light bending by Earth’s gravity, shifting the guide star’s apparent position',
      ],
      answer: 0,
      why: {
        1: 'The gyroscopes were inside a drag-free satellite that flew around them, and friction would slow the spin, not turn its axis toward Earth’s rotation.',
        2: 'The effect accumulated steadily in one direction over the year; a wobble would not.',
        3: 'The guide star’s light bending is known and was corrected for; it is not a turning of the gyroscopes themselves.',
      },
      hints: ['Which property of Earth points along the direction of the turning?'],
      teach: 'Frame dragging — spacetime dragged around by a spinning mass — was measured near Earth by Gravity Probe B.',
      explain: 'General relativity predicts that a spinning mass drags the local inertial frames around with it. For Gravity Probe B that meant 39.2 mas/yr; it measured 37.2 ± 7.2 mas/yr (Everitt et al. 2011). Near a spinning black hole the same effect becomes the ergosphere.',
      visual: {
        type: 'graph',
        params: {
          x: [0.4, 2.6], y: [0.6, 1.35], xticks: 2, xlabel: ' ', ylabel: 'measured ÷ predicted',
          curves: [{ param: ['1', `${round(1 - 18.3 / 6606.1, 6)} + ${round(2 * 18.3 / 6606.1, 6)}t`], t: [0, 1], color: 'accent', width: 3 }, { param: ['2', `${round((37.2 - 7.2) / 39.2, 5)} + ${round(14.4 / 39.2, 5)}t`], t: [0, 1], color: 'gold', width: 3 }],
          points: [{ x: 1, y: round(6601.8 / 6606.1, 5), color: 'accent', label: '6.6″/yr turning' }, { x: 2, y: round(37.2 / 39.2, 5), color: 'gold', label: '37 mas/yr turning' }],
          hlines: [{ y: 1, label: 'general relativity' }],
        },
        caption: 'Gravity Probe B’s two results as measured ÷ predicted, with 1σ error bars (Everitt et al. 2011). Both agree with general relativity; the small one is far less precise.',
      },
    }),
    num({
      id: 'cp-quasar', difficulty: 3, transfer: true,
      gen(r) {
        const chi = r.pick([0.5, 0.9, 0.998]), k = r.pick([1, 2, 5]);
        const R = kerr.isco(chi), eta = 1 - kerr.eIsco(R);
        const mdot = (k * M_SUN) / YEAR, P = eta * mdot * C * C;
        return {
          prompt: t`A quasar's black hole spins at $\chi = ${chi}$ and swallows ${k} solar mass${k > 1 ? 'es' : ''} of gas per year through a thin disk turning the same way. The disk's inner edge is the innermost stable orbit, $r = ${iscoTxt(chi)}\,GM/c^2$, and the gas radiates $1 - \sqrt{1 - 2/(3r)}$ of its rest energy on the way there. What is the quasar's power, in watts? (1 solar mass $= 1.989\times10^{30}$ kg, 1 year $= 3.156\times10^{7}$ s)`,
          answer: P, units: 'W', tol: { rel: 0.015 },
          errors: [
            { value: mdot * C * C, feedback: 'Only a fraction of the rest energy is radiated: multiply by 1 − √(1 − 2/(3r)).' },
            { value: kerr.efficiency(0) * mdot * C * C, feedback: 'That is the 5.7% of a non-spinning hole. Here the orbit is closer in.' },
          ],
          hints: [t`Efficiency: $1 - \sqrt{1 - 2/(3\times${iscoTxt(chi)})} = ${sci(eta, 3)}$.`, t`$\dot m = ${k}\times1.989\times10^{30}/3.156\times10^{7} = ${sci(mdot)}$ kg/s; $P = \eta\,\dot m c^2$.`],
          teach: 'A spinning black hole turns a larger share of infalling mass into light: the quasar engine runs hotter.',
          explain: t`$\eta = ${sci(eta, 3)}$, so $P = ${sci(eta, 3)}\times${sci(mdot)}\times(2.998\times10^{8})^2 = ${sci(P)}$ W — ${sci(eta / kerr.efficiency(0), 2)} times what the same inflow gives a non-spinning hole.`,
          visual: effGraph(chi),
        };
      },
    }),
    mcq({
      id: 'cp-earth', difficulty: 3, transfer: true,
      prompt: t`Earth's angular momentum is $J = 5.85\times10^{33}$ kg m²/s, so its spin as a length is $a = J/(Mc) = 3.3$ m, while $GM/c^2$ is only 4.4 mm: $a/M \approx 740$. Does Earth break the limit $a \le M$?`,
      choices: [
        'No: the limit applies to black holes, and Earth is not one. To collapse into a black hole it would first have to shed almost all of its spin',
        'Yes: Earth must hide a naked singularity',
        'Yes: general relativity fails for spinning planets',
        'No: the spin length a is only defined for objects smaller than their Schwarzschild radius',
      ],
      answer: 0,
      why: {
        1: 'There is no singularity inside Earth. The limit a ≤ M is about horizons, and Earth has none.',
        2: 'General relativity describes Earth’s spin effects well — Gravity Probe B measured its frame dragging. The limit simply does not apply to things that are not black holes.',
        3: 'a = J/(Mc) is defined for any spinning body; what is special to black holes is the limit.',
      },
      hints: ['What does the formula for r₊ describe? Does Earth have one?', 'The Kerr spacetime is the outside of a black hole. What would Earth have to do before it could become one?'],
      teach: 'The Kerr limit a ≤ GM/c² constrains black holes, not ordinary spinning bodies.',
      explain: 'The Kerr spacetime with its horizons describes black holes only. Earth’s outside is a weak, slightly dragged field, perfectly consistent with a ≫ M. A collapsing star with too much spin must shed angular momentum before a horizon can form — one reason measured black-hole spins all lie below 1.',
    }),
  ],
  sources: [
    { label: 'Kerr, “Gravitational field of a spinning mass…”, Phys. Rev. Lett. 11, 237 (1963)', url: 'https://doi.org/10.1103/PhysRevLett.11.237' },
    { label: 'Bardeen, Press & Teukolsky, “Rotating black holes”, ApJ 178, 347 (1972)', url: 'https://ui.adsabs.harvard.edu/abs/1972ApJ...178..347B' },
    { label: 'Everitt et al., Gravity Probe B final results, Phys. Rev. Lett. 106, 221101 (2011)', url: 'https://arxiv.org/abs/1105.3456' },
    { label: 'LIGO–Virgo–KAGRA, black-hole spectroscopy with GW250114 (2025)', url: 'https://arxiv.org/abs/2509.08099' },
    { label: 'Carroll, Lecture Notes on GR, ch. 7', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
