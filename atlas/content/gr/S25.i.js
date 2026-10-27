// Perihelion precession — Intuition Mode. In the Schwarzschild spacetime a
// planet's orbit is not a closed ellipse: its closest point creeps forward by
// Δφ ≈ 6πGM/[c²a(1 − e²)] per orbit. For Mercury that is 0.1035″ per orbit,
// 43″ per century — the anomaly Newton could not explain, and Einstein's
// first success (November 1915). Carried into strong fields by S2 and binary
// pulsars.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, C, M_SUN, AU, ARCSEC, DAY as DAY_S, YEAR, mLen, sci, round } from './_fasttrack.js';
import { advanceWeak } from '../../src/viz/model/gravity.js';

const t = String.raw;

const M1 = mLen(M_SUN);                                   // GM☉/c², m
const adv = (M, a, e) => advanceWeak(a * (1 - e * e), mLen(M));   // rad per orbit (6πM/p)
const PLANETS = [
  ['Mercury', 5.7909e10, 0.2056, 87.969],
  ['Venus', 1.0821e11, 0.0068, 224.70],
  ['Earth', 1.4960e11, 0.0167, 365.256],
  ['Mars', 2.2794e11, 0.0934, 686.98],
];
const perOrbit = ([, a, e]) => adv(M_SUN, a, e) / ARCSEC;            // arcsec per orbit
const perCentury = (pl) => perOrbit(pl) * (36525 / pl[3]);          // arcsec per century
const MERC = PLANETS[0], P_MERC = MERC[1] * (1 - MERC[2] ** 2);
const SGR = 4.30e6;

// relativistic advance per century against orbit size: circular orbits (curve) and the planets (dots)
const P1 = (2 * Math.PI * Math.sqrt(AU ** 3 / (G * M_SUN))) / DAY_S;           // days, circular orbit at 1 AU
const K_CY = ((6 * Math.PI * M1) / AU / ARCSEC) * (36525 / P1);                // ″ per century there
const centuryGraph = (only) => ({
  type: 'graph',
  params: {
    x: [0, 1.95], y: [0, 52], xlabel: 'orbit size a (AU)', ylabel: 'advance per century (″)',
    curves: [{ fn: `${round(K_CY, 5)}/x^2.5`, domain: [0.365, 1.95], color: 'accent' }],
    points: PLANETS.filter((pl) => !only || pl === MERC).map((pl, k) => ({ x: round(pl[1] / AU, 4), y: round(perCentury(pl), 4), color: ['gold', 'teal', 'good', 'bad'][k], label: `${pl[0]}: ${round(perCentury(pl), 3)}″` })),
    vlines: only ? [{ x: round(only[1] / AU, 4), label: only[0], color: 'violet' }] : [],
  },
  caption: 'Relativistic advance per century. Curve: circular orbits — per orbit the advance falls as 1/a, and farther orbits are also slower, so per century it falls as a^(−5/2). Dots: the planets’ real orbits.',
});

// an orbit and a later one, turned by an (exaggerated) angle w about the focus, with their long axes
const turningOrbit = (e, w, caption) => {
  const rp = 1 / (1 + e), ra = 1 / (1 - e), a = 1 / (1 - e * e), b = a * Math.sqrt(1 - e * e);
  const box = (th) => {
    const cx = -a * e * Math.cos(th), cy = -a * e * Math.sin(th);
    const hx = Math.hypot(a * Math.cos(th), b * Math.sin(th)), hy = Math.hypot(a * Math.sin(th), b * Math.cos(th));
    return [cx - hx, cx + hx, cy - hy, cy + hy];
  };
  const [p, q] = [box(0), box(w)], pad = 0.06 * ra;
  return {
    type: 'graph',
    params: {
      x: [round(Math.min(p[0], q[0]) - pad, 3), round(Math.max(p[1], q[1]) + 3 * pad, 3)], y: [round(Math.min(p[2], q[2]) - pad, 3), round(Math.max(p[3], q[3]) + pad, 3)],
      equal: true, grid: false, axes: false,
      curves: [
        { param: ['t', '0'], t: [round(-ra, 4), round(rp, 4)], color: 'gold', width: 1, dash: true },
        { param: [`t*cos(${w})`, `t*sin(${w})`], t: [round(-ra, 4), round(rp, 4)], color: 'accent', width: 1, dash: true },
        { polar: `1/(1 + ${e}cos(theta))`, theta: [0, 6.2832], color: 'gold', width: 2.4 },
        { polar: `1/(1 + ${e}cos(theta - ${w}))`, theta: [0, 6.2832], color: 'accent', width: 2 },
      ],
      points: [{ x: 0, y: 0, color: 'ink', r: 4.5 }, { x: round(rp, 4), y: 0, color: 'gold' }, { x: round(rp * Math.cos(w), 4), y: round(rp * Math.sin(w), 4), color: 'accent' }],
    },
    caption,
  };
};

const S2_PICTURE = turningOrbit(0.88, 0.3, 'S2’s orbit (gold) and its next one (blue), drawn in their own plane, with their long axes dashed; Sgr A* sits at the focus. Each orbit the point nearest Sgr A* moves on by the advance — here exaggerated about 85 times.');

export default lesson({
  id: 'gr.S25.i',
  title: 'Mercury’s 43 arcseconds, explained',
  minutes: 8, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`Mercury's orbit is an ellipse whose closest point to the Sun, the **perihelion**, slowly swings around. In 1859 Le Verrier showed that the pulls of the other planets explain almost all of the swing — but not all; the modern value of the leftover is about **43 arcseconds per century**. (An arcsecond is 1/3600 of a degree.) Astronomers hunted for a hidden planet, "Vulcan", and never found it. In November 1915 Einstein calculated the orbit in his new theory and got 43″ with nothing adjusted — its first success. In the Schwarzschild spacetime a planet's orbit is not a closed ellipse; each loop overshoots by the angle above.`,
  equation: t`\Delta\phi \approx \frac{6\pi GM}{c^2\,a\,(1 - e^2)} \quad \text{per orbit}`,
  symbols: [
    { tex: '\\Delta\\phi', text: 'how far the perihelion advances in one orbit, in radians (1 rad = 206 265″)' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\text{s}^{-2}$' },
    { tex: 'M', text: 'the mass of the central body — the Sun, $1.989\\times10^{30}$ kg; $GM/c^2 = 1477$ m' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
    { tex: 'a', text: 'the semi-major axis: half the longest diameter of the ellipse, in m' },
    { tex: 'e', text: 'the eccentricity: 0 for a circle, close to 1 for a very stretched ellipse' },
  ],
  why: 'The same correction, much larger, shapes orbits near black holes — rosettes, zoom-whirl orbits and, closer in, no stable orbits at all.',
  visual: {
    type: 'orbit',
    title: 'An orbit that does not close',
    lead: t`This orbit is around a black hole, only 20 mass-lengths out — with $G = c = 1$, distances are in units of $M = GM/c^2$, which is 1.48 km for the Sun. There the advance is about a hundred degrees per orbit; Mercury's is the same effect, millions of times weaker.`,
    tasks: ['Switch the law of gravity to Newton: the same start traces one closed ellipse.', 'Back with Einstein, set r₀ = 40 and L = 6: on this wider orbit the advance drops to about 38° per orbit. It shrinks roughly as 1/p, where p = L²/M measures the orbit’s size.', 'Compare the dashed Newtonian ellipse with the gold rosette: general relativity’s orbits are not ellipses.'],
    params: { mode: 'schwarzschild', r0: 20, L: 4.3, compare: true },
  },
  example: {
    prompt: t`Mercury's orbit has $a = 5.7909\times10^{10}$ m and $e = 0.2056$, and it takes 87.969 days. How many arcseconds per century does general relativity add to its perihelion advance?`,
    steps: [
      { label: 'The Sun as a length', text: t`$GM_\odot/c^2 = (6.674\times10^{-11})(1.989\times10^{30})/(2.998\times10^{8})^2 = ${sci(M1, 4)}$ m.` },
      { label: 'The orbit’s size', text: t`$a(1 - e^2) = 5.7909\times10^{10}\times(1 - 0.2056^2) = ${sci(P_MERC, 4)}$ m.` },
      { label: 'Per orbit', text: t`$\Delta\phi = 6\pi\times${sci(M1, 4)}/${sci(P_MERC, 4)} = ${sci(adv(M_SUN, MERC[1], MERC[2]))}$ rad $= ${sci(perOrbit(MERC), 4)}''$ — a tenth of an arcsecond.` },
      { label: 'Per century', text: t`A century is $36\,525$ days, or $36\,525/87.969 = ${sci(36525 / MERC[3], 4)}$ orbits: $${sci(perOrbit(MERC), 4)}''\times${sci(36525 / MERC[3], 4)} = ${sci(perCentury(MERC), 4)}''$ per century.` },
      { label: 'Sense check', text: t`The correction is tiny because $GM/(c^2 a) = ${sci(M1 / MERC[1], 2)}$ — about $(v/c)^2$ for Mercury's 47 km/s. Nothing in the formula was tuned to fit; the measured anomaly is $43''$ per century.` },
    ],
    answer: t`General relativity adds $${sci(perCentury(MERC), 4)}''$ per century — the 43″ Newtonian gravity could not explain.`,
  },
  practice: [
    mcq({
      id: 'budget', difficulty: 1,
      prompt: 'Seen from Earth, Mercury’s perihelion advances about 5600″ per century. About 5025″ comes from the slow wobble of Earth’s own axis, and about 532″ from the pulls of the other planets. How much is due to general relativity?',
      choices: ['About 43″', 'All 5600″', 'About 532″', 'About 5025″'],
      answer: 0,
      why: {
        1: 'Most of the swing is ordinary: the wobbling of the reference frame and the other planets’ pulls. Relativity explains only the remainder.',
        2: 'That part is Newtonian: the other planets tug on Mercury’s orbit.',
        3: 'That is not even a real motion of the orbit — it is the slow wobble (precession) of Earth’s axis, which shifts the directions we measure from.',
      },
      hints: ['Subtract the two Newtonian contributions from the total.'],
      teach: 'Only about 43″ of Mercury’s ≈5600″ per century is relativistic; the rest is the observing frame and the other planets.',
      explain: '5600 − 5025 − 532 ≈ 43″ per century. That small remainder, measured to within about 1%, is what general relativity predicts with no adjustable parameters.',
      visual: {
        type: 'graph',
        params: {
          x: [0, 4.2], y: [-350, 6500], grid: false, axes: false,
          curves: [{ fn: '0', domain: [0.1, 3.0], color: 'ink3', width: 1.2 }],
          shade: [
            { fn: '5600', from: 0.3, to: 1.1, color: 'ink3', alpha: 0.35 },
            { fn: '5025', from: 1.7, to: 2.5, color: 'accent', alpha: 0.55 },
            { fn: '5557', lower: '5025', from: 1.7, to: 2.5, color: 'teal', alpha: 0.7 },
            { fn: '5600', lower: '5557', from: 1.7, to: 2.5, color: 'gold', alpha: 0.95 },
          ],
          points: [
            { x: 0.3, y: 5600, r: 0.5, color: 'ink2', label: 'total: 5600″' },
            { x: 2.5, y: 2500, r: 0.5, color: 'accent', label: 'Earth’s axis: 5025″' },
            { x: 2.5, y: 5250, r: 0.5, color: 'teal', label: 'planets: 532″' },
            { x: 2.5, y: 5800, r: 0.5, color: 'gold', label: 'relativity: ?' },
          ],
        },
        caption: 'Mercury’s perihelion advance seen from Earth, in arcseconds per century: the total (left) and its parts stacked (right).',
      },
    }),
    num({
      id: 'per-orbit', difficulty: 2,
      gen(r) {
        const pl = r.pick(PLANETS), [name, a, e] = pl;
        const x = perOrbit(pl);
        return {
          prompt: t`${name}'s orbit has $a = ${sci(a, 5)}$ m and $e = ${e}$. By how many arcseconds does general relativity advance its perihelion in **one** orbit? Use $GM_\odot/c^2 = ${sci(M1, 4)}$ m.`,
          answer: x, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: adv(M_SUN, a, e), feedback: 'That is in radians. Convert: 1 rad = 206 265 arcseconds.' }, ...(e > 0.15 ? [{ value: (6 * Math.PI * M1) / a / ARCSEC, feedback: 'You left out the (1 − e²) factor.' }] : [])],
          hints: [t`$\Delta\phi = 6\pi\,(GM/c^2)/[a(1 - e^2)]$, in radians.`, t`$a(1 - e^2) = ${sci(a * (1 - e * e), 4)}$ m; multiply the radians by 206 265 to get arcseconds.`],
          teach: 'The relativistic perihelion advance per orbit is 6πGM/[c²a(1 − e²)] — about a tenth of an arcsecond for Mercury.',
          explain: t`$\Delta\phi = 6\pi\times${sci(M1, 4)}/${sci(a * (1 - e * e), 4)} = ${sci(adv(M_SUN, a, e))}$ rad $= ${sci(x)}''$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 1.75], y: [0, 0.16], xlabel: 'orbit size a (AU)', ylabel: 'advance per orbit (″)',
              curves: [{ fn: `${round((6 * Math.PI * M1) / AU / ARCSEC, 6)}/x`, domain: [0.24, 1.75], color: 'accent' }],
              points: PLANETS.map(([n, pa, pe], k) => ({ x: round(pa / AU, 4), y: round(perOrbit([n, pa, pe]), 5), color: ['gold', 'teal', 'good', 'bad'][k], label: n === name ? `${n} — this one` : n })),
            },
            caption: 'Relativistic advance per orbit. Curve: circular orbits, falling as 1/a. Dots: the planets’ real orbits — Mercury’s eccentricity lifts it slightly above the curve.',
          },
        };
      },
    }),
    num({
      id: 'per-century', difficulty: 3,
      gen(r) {
        const pl = r.pick(PLANETS.slice(1)), [name, a, e, P] = pl;
        const x = perCentury(pl);
        return {
          visual: centuryGraph(pl),
          prompt: t`${name} has $a = ${sci(a, 5)}$ m, $e = ${e}$ and an orbital period of ${P} days. How many arcseconds per century does general relativity advance its perihelion? ($GM_\odot/c^2 = ${sci(M1, 4)}$ m)`,
          answer: x, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: perOrbit(pl), feedback: 'That is per orbit. Multiply by the number of orbits in a century, 36 525 days ÷ the period.' }, { value: x / 100, feedback: 'That is per year. A century is 100 years: 36 525 days.' }],
          hints: [t`First the advance per orbit, $6\pi(GM/c^2)/[a(1 - e^2)]$, in arcseconds.`, t`Per orbit it is $${sci(perOrbit(pl))}''$; there are $36\,525/${P} = ${sci(36525 / P)}$ orbits per century.`],
          teach: 'Advance per century = advance per orbit × orbits per century; farther planets lose on both counts.',
          explain: t`$${sci(perOrbit(pl))}''\times${sci(36525 / P)} = ${sci(x)}''$ per century — compared with Mercury's 43″. ${name === 'Mars' ? 'Farther out, the effect fades fast.' : 'Modern planetary ephemerides, built from radar and spacecraft tracking, include these smaller advances.'}`,
        };
      },
    }),
    mcq({
      id: 'rosette', difficulty: 2,
      prompt: 'According to general relativity, what shape is the path of a single planet around a star (ignoring all other planets)?',
      choices: [
        'A rosette: an almost-ellipse whose closest point creeps forward a little every orbit',
        'A perfect ellipse, exactly as Kepler found',
        'A circle, because gravity is a curvature of space',
        'An inward spiral, because the star’s gravity slowly drags it in',
      ],
      answer: 0,
      why: {
        1: 'Kepler’s closed ellipse is exactly right only in Newtonian gravity, where the force falls off precisely as 1/r².',
        2: 'Orbits can be eccentric in general relativity just as in Newton’s theory.',
        3: 'A single planet does not spiral in; only gravitational-wave emission drains orbits, and for planets that is utterly negligible.',
      },
      hints: ['Switch the picture between Newton and Einstein, and compare the shapes.'],
      teach: 'General relativity’s orbits are not closed: each loop overshoots, tracing a rosette.',
      explain: 'The extra term in the Schwarzschild orbit equation means a planet’s distance from the star oscillates slightly more slowly than it goes round, so each perihelion comes a little later in angle. The path is a rosette — for Mercury, advancing 0.1″ per orbit.',
      visual: { type: 'orbit', params: { mode: 'schwarzschild', r0: 30, L: 5, compare: true } },
    }),
    mcq({
      id: 'vulcan', difficulty: 2,
      prompt: 'Which explanation of Mercury’s extra 43″ per century has survived testing?',
      choices: [
        'General relativity’s correction to the Sun’s gravity',
        'A hidden planet, Vulcan, orbiting inside Mercury’s orbit',
        'The Sun’s slightly flattened shape',
        'A ring of dust in the inner Solar System',
      ],
      answer: 0,
      why: {
        1: 'Vulcan was searched for during eclipses for decades and never found.',
        2: 'The Sun is nearly round; its flattening contributes only about 0.03″ per century.',
        3: 'There is far too little dust near the Sun to tug Mercury’s orbit that much.',
      },
      hints: ['One explanation needed a new object; another needed a new theory of gravity.'],
      teach: 'Mercury’s anomaly was solved not by a new planet but by a new theory of gravity.',
      explain: 'General relativity predicts 43″ per century with nothing adjusted, and the same theory passes every later test. Searches for Vulcan failed, and the Sun’s measured flattening adds only about 0.03″.',
      visual: {
        type: 'graph',
        params: {
          x: [0, 3.4], y: [0, 6000], xlabel: ' ', ylabel: 'arcsec per century',
          shade: [
            { fn: '5025', from: 0.2, to: 0.9, color: 'accent', alpha: 0.55 },
            { fn: '532', from: 1.25, to: 1.95, color: 'teal', alpha: 0.6 },
            { fn: '43', from: 2.3, to: 3.0, color: 'gold', alpha: 0.9 },
          ],
          points: [
            { x: 0.2, y: 5025, r: 0.5, color: 'accent', label: 'wobble of Earth’s axis: 5025″' },
            { x: 1.25, y: 532, r: 0.5, color: 'teal', label: 'other planets: 532″' },
            { x: 2.3, y: 43, r: 0.5, color: 'gold', label: 'left over: 43″' },
          ],
        },
        caption: 'Mercury’s perihelion advance as seen from Earth, about 5600″ per century, split into its parts (rounded). The leftover is the sliver on the right.',
      },
    }),
    num({
      id: 's2', difficulty: 3,
      gen(r) {
        const [rp, e] = r.pick([[120, 0.88], [120, 0.884], [118, 0.885]]);
        const p = rp * AU * (1 + e), d = advanceWeak(p, mLen(SGR * M_SUN));
        return {
          visual: S2_PICTURE,
          prompt: t`The star S2 orbits Sagittarius A* (4.30 million solar masses) with closest approach $r_p = ${rp}$ AU and eccentricity $e = ${e}$. Using $a(1 - e^2) = r_p(1 + e)$, by how many arcminutes does its pericentre advance each orbit? (1 AU $= 1.496\times10^{11}$ m; 1 rad $= 3438$ arcmin)`,
          answer: d * (180 * 60) / Math.PI, units: 'arcmin', tol: { rel: 0.01 },
          errors: [{ value: (d * 180) / Math.PI, feedback: 'That is in degrees. One degree is 60 arcminutes.' }, { value: d, feedback: 'That is in radians. Multiply by 3438 to get arcminutes.' }],
          hints: [t`$GM/c^2 = 4.30\times10^{6}\times${sci(M1, 4)}$ m $= ${sci(mLen(SGR * M_SUN))}$ m.`, t`$a(1 - e^2) = ${rp}\times1.88$ AU or so — compute $r_p(1 + e)$ in metres, then $\Delta\phi = 6\pi(GM/c^2)/[a(1 - e^2)]$.`],
          teach: 'Around a supermassive black hole the same 6πGM/[c²a(1 − e²)] gives arcminutes per orbit, not tenths of arcseconds.',
          explain: t`$a(1 - e^2) = ${sci(p)}$ m, so $\Delta\phi = ${sci(d)}$ rad $= ${sci((d * 180 * 60) / Math.PI)}$ arcmin per orbit. The GRAVITY collaboration measured S2's precession in 2020 at about 12′ per orbit, matching general relativity.`,
        };
      },
    }),
    mcq({
      id: 'scaling', difficulty: 2,
      prompt: 'A planet on an orbit of the same shape (same e) but half the size around the same star would have a relativistic advance per orbit that is…',
      choices: ['twice as large', 'half as large', 'four times as large', 'unchanged'],
      answer: 0,
      why: {
        1: 'The semi-major axis is in the denominator: a smaller orbit has a larger advance.',
        2: 'The advance per orbit goes as 1/a, not 1/a². (Per century it grows faster, because a smaller orbit is also quicker.)',
        3: 'The formula depends on a: closer orbits feel stronger gravity.',
      },
      hints: [t`Look at $\Delta\phi = 6\pi GM/[c^2 a(1 - e^2)]$: what happens when $a$ halves?`],
      teach: 'The advance per orbit is inversely proportional to the orbit’s size, a(1 − e²).',
      explain: t`Halving $a$ doubles $\Delta\phi$ per orbit. Per century the gain is bigger still: by Kepler's third law the period shrinks by $2^{3/2}$, so there are 2.8 times as many orbits.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.1, 1.25], y: [-1.15, 1.2], equal: true, grid: false, axes: false,
          curves: [
            { polar: '0.91/(1 + 0.4cos(theta))', theta: [0, 6.2832], color: 'accent', width: 2.2 },
            { polar: '0.455/(1 + 0.4cos(theta))', theta: [0, 6.2832], color: 'gold', width: 2.2 },
          ],
          points: [
            { x: 0, y: 0, color: 'ink', r: 5, label: 'star' },
            { x: -1.1, y: 1.0, r: 0.5, color: 'accent', label: 'size a' },
            { x: -0.36, y: 0.57, r: 0.5, color: 'gold', label: 'size a/2' },
          ],
        },
        caption: 'Two orbits of the same shape (same eccentricity) around the same star, one half the size of the other.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-century', difficulty: 2,
      gen(r) {
        const pl = r.pick(PLANETS.slice(0, 2)), [name, , , P] = pl;
        const step = round(perOrbit(pl), 4), X1 = round(5.4 * P, 5);
        return {
          visual: {
            type: 'graph',
            params: {
              x: [0, X1], y: [0, round(5.7 * step, 4)], xlabel: 'days', ylabel: 'total advance (″)',
              curves: [{ fn: `${step}*floor(x/${P})`, domain: [0, X1], color: 'gold' }],
              points: [1, 2, 3, 4, 5].map((k) => ({ x: round(k * P, 6), y: round(k * step, 4), color: 'gold', r: 3.5 })),
            },
            caption: `Each perihelion passage, every ${P} days, adds one more step of ${step}″. The first five orbits are shown.`,
          },
          prompt: t`General relativity advances ${name}'s perihelion by $${sci(perOrbit(pl), 4)}''$ each orbit, and ${name} orbits the Sun every ${P} days. What is the advance per century (36 525 days)?`,
          answer: perCentury(pl), units: 'arcsec', tol: { rel: 0.01 },
          hints: ['Multiply the advance per orbit by the number of orbits in a century.'],
          teach: 'Per-century precession = per-orbit precession × orbits per century.',
          explain: t`$${sci(perOrbit(pl), 4)}''\times(36\,525/${P}) = ${sci(perCentury(pl), 4)}''$ per century.`,
        };
      },
    }),
    mcq({
      id: 'cp-why-mercury', difficulty: 2,
      prompt: 'Why is the relativistic perihelion advance much larger for Mercury than for any other planet?',
      choices: [
        'It is closest to the Sun, where gravity is strongest, and it completes the most orbits per century',
        'It is the smallest planet, so it is pushed around more easily',
        'It spins very slowly on its axis',
        'It has no moon to steady its orbit',
      ],
      answer: 0,
      why: {
        1: 'A planet’s own mass does not enter: every body follows the same geodesics, light or heavy.',
        2: 'The planet’s spin plays no part in the orbit’s precession.',
        3: 'Moons do not steady orbits around the Sun, and the formula contains nothing about them.',
      },
      hints: [t`Which quantities appear in $6\pi GM/[c^2 a(1 - e^2)]$? Which belong to the planet’s orbit, not the planet?`],
      teach: 'The advance per orbit grows as the orbit shrinks, and small orbits are also completed more often.',
      explain: 'The advance per orbit goes as 1/[a(1 − e²)], so it is largest for the innermost, fairly eccentric orbit; Mercury also completes over 400 orbits a century. The planet’s own mass, spin and moons play no part.',
      visual: centuryGraph(null),
    }),
    num({
      id: 'cp-pulsar', difficulty: 3, transfer: true,
      gen(r) {
        // the Hulse–Taylor binary pulsar, treated as a test body orbiting the total mass
        const Pb = 7.7519 * 3600, e = 0.617, m = 2.828;
        const M = m * M_SUN, a = Math.cbrt((G * M * Pb * Pb) / (4 * Math.PI * Math.PI));
        const d = adv(M, a, e), perYear = (d * 180) / Math.PI * (YEAR / Pb);
        const ask = r.pick(['year', 'decade']), k = ask === 'year' ? 1 : 10;
        return {
          visual: turningOrbit(0.617, 0.6, 'The pulsar’s orbit now (gold) and some years later (blue), each with its long axis dashed: the whole ellipse slowly turns. The angle is not to scale.'),
          prompt: t`The Hulse–Taylor binary pulsar: two neutron stars with total mass ${m} solar masses orbit each other every 7.75 hours on an orbit with $a = ${sci(a, 3)}$ m and $e = ${e}$. Treating it as one body orbiting the total mass, by how many degrees does its periastron advance per ${ask}?`,
          answer: perYear * k, units: 'deg', tol: { rel: 0.02 },
          errors: [{ value: ((d * 180) / Math.PI) * k, feedback: 'That is per orbit. A year holds about 1130 orbits of 7.75 hours.' }],
          hints: [t`Per orbit: $\Delta\phi = 6\pi GM/[c^2 a(1 - e^2)]$ with $GM/c^2 = ${sci(mLen(M))}$ m.`, t`Per orbit that is $${sci((d * 180) / Math.PI)}^\circ$; there are $${sci(YEAR / Pb)}$ orbits in a year.`],
          teach: 'In a compact binary pulsar the same precession formula gives degrees per year — 35 000 times Mercury’s rate.',
          explain: t`Per orbit $${sci((d * 180) / Math.PI)}^\circ$, times $${sci(YEAR / Pb)}$ orbits a year: $${sci(perYear)}^\circ$ per year${k === 10 ? `, or $${sci(perYear * 10)}^\circ$ per decade` : ''}. The measured value is about 4.2° per year — gravity far stronger than in the Solar System, still as general relativity says.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Will, “The Confrontation between General Relativity and Experiment”, Living Rev. Relativ. 17, 4 (2014)', url: 'https://arxiv.org/abs/1403.7377' },
    { label: 'Clemence, “The relativity effect in planetary motions”, Rev. Mod. Phys. 19, 361 (1947)', url: 'https://doi.org/10.1103/RevModPhys.19.361' },
    { label: 'GRAVITY Collaboration, detection of the Schwarzschild precession of S2 (2020)', url: 'https://arxiv.org/abs/2004.07187' },
  ],
});
