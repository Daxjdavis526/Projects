// Event horizons — Intuition Mode. The horizon r = 2GM/c² is a one-way
// surface made of light that cannot get out: in coordinates that stay smooth
// there (ingoing Eddington–Finkelstein), light cones tip over and inside even
// "outgoing" light moves inward. An infaller crosses in finite proper time
// (from the horizon to r = 0: at most πGM/c³); a distant observer sees her
// signals redshift and fade, never crossing. The singularity is a moment in
// her future, not a place. Area theorem (GW250114); Hawking radiation
// (derived, unobserved).
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, C, M_SUN, mLen, rs, sci, round } from './_fasttrack.js';

const t = String.raw;

const tM = (M) => (G * M) / C ** 3;                       // GM/c³, s
const HBAR = 1.054571817e-34, KB = 1.380649e-23;
const hawking = (M) => (HBAR * C ** 3) / (8 * Math.PI * G * M * KB);   // K
const tidalHorizon = (M, L = 2) => (2 * G * M * L) / rs(M) ** 3;       // m/s² across L at r = r_s
const area = (M) => 4 * Math.PI * rs(M) ** 2;                          // m²
const SGR = 4.30e6, M87 = 6.5e9;
const log = Math.log10;

// light cones in ingoing Eddington–Finkelstein coordinates (G = c = 1, r and t* in units of M)
const TOP = 8.2;                                   // trim rays to the visible window (the plotter does not clip)
const solve = (f, lo, hi) => { for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if ((f(lo) - TOP) * (f(m) - TOP) <= 0) hi = m; else lo = m; } return (lo + hi) / 2; };
const OUT = [2.15, 2.5, 3, 4, 6].map((x0) => {        // outgoing rays through (x0, 0), outside: rise to the right
  const c = -x0 - 4 * Math.log(x0 - 2), f = (x) => x + 4 * Math.log(x - 2) + c;
  return { c, dom: [x0, f(8) > TOP ? round(solve(f, x0, 8), 5) : 8] };
});
const INN = [0.5, 1, 1.5, 1.9, 1.98].map((x0) => {    // and inside: rise to the left
  const c = -x0 - 4 * Math.log(2 - x0), f = (x) => x + 4 * Math.log(2 - x) + c;
  return { c, dom: [f(1e-4) > TOP ? round(solve(f, 1e-4, x0), 5) : 1e-4, x0] };
});
const coneGraph = (flash) => ({
  type: 'graph',
  params: {
    x: [0, 8], y: [0, 8], equal: true, aspect: 'square', xlabel: 'r / M', ylabel: 'time t* / M',
    ...(flash ? { sliders: [{ key: 'R', label: 'A flash of light at $r$', min: 0.3, max: 7.5, step: 0.05, value: 4, unit: 'M', explain: 'At time t* = 3M. The two arrows show the two directions its light can go.' }] } : {}),
    curves: [
      ...[1, 2.5, 4, 5.5, 7, 8.5, 10, 11.5, 13, 14.5].map((c) => ({ fn: `${c} - x`, domain: [Math.max(0, round(c - TOP, 3)), Math.min(8, c)], color: 'ink3', width: 1 })),
      ...OUT.map(({ c, dom }) => ({ fn: `x + 4ln(x - 2) + ${round(c, 6)}`, domain: dom, color: 'gold', width: 1.6 })),
      ...INN.map(({ c, dom }) => ({ fn: `x + 4ln(2 - x) + ${round(c, 6)}`, domain: dom, color: 'gold', width: 1.6 })),
    ],
    vlines: [{ x: 2, label: 'horizon', color: 'bad' }],
    ...(flash ? {
      arrows: [
        { from: ['R', 3], to: ['max(R - 1.1, 0)', '3 + R - max(R - 1.1, 0)'], color: 'accent2' },
        { from: ['R', 3], to: ['max(R + 1.5(R - 2)/sqrt((R - 2)^2 + (R + 2)^2), 0)', '3 + 1.5(R + 2)/sqrt((R - 2)^2 + (R + 2)^2)'], color: 'gold' },
      ],
      readouts: [{ label: '“outgoing” light moves at $dr/dt^*$ =', expr: '(R - 2)/(R + 2)', digits: 3 }, { label: 'ingoing light', expr: '-1', digits: 2 }],
    } : {}),
  },
  caption: 'Ingoing Eddington–Finkelstein coordinates (G = c = 1): r in units of M, and a time t* that stays smooth through r = 2M. Grey lines: ingoing light, always at 45°. Gold: “outgoing” light — it escapes outside r = 2M, hovers on it, and moves inward inside. The tipping is how these coordinates draw it; that nothing gets out from inside r = 2M is true in every coordinate system.',
});

// falling in from rest far away: her clock against far-away time (G = c = 1, from r = 10M)
const infallGraph = {
  type: 'graph',
  params: {
    x: [0, 40], y: [0, 10.5], xlabel: 'time since passing r = 10M  (units of GM/c³)', ylabel: 'r / M',
    curves: [
      { param: ['0.4714045(31.6227766 - t^1.5)', 't'], t: [0, 10], color: 'gold', width: 2.6 },
      { param: ['-2((2/3)sqrt(t/2)^3 + 2sqrt(t/2) + ln(abs((sqrt(t/2) - 1)/(sqrt(t/2) + 1)))) + 21.926544', 't'], t: [2.00001, 10], color: 'accent', width: 2.6 },
    ],
    hlines: [{ y: 2, label: 'horizon r = 2M', color: 'bad' }],
    points: [
      { x: 13.57, y: 2, color: 'gold', label: 'her clock: crosses' },
      { x: 14.91, y: 0, color: 'gold', label: 'r = 0' },
      { x: 25, y: 2.45, color: 'accent', label: 'far-away time: never quite', r: 0.5 },
    ],
  },
  caption: 'A fall from rest far away into a non-spinning black hole (G = c = 1). Gold: r against the faller’s own clock — she reaches the horizon and r = 0 in finite time. Blue: r against the far-away bookkeeping time t, which runs to infinity at the horizon. Same fall, two clocks.',
};

// log-log "maps" against mass
const massMap = ({ ylabel, fn, y, points, caption, hline }) => ({
  type: 'graph',
  params: {
    x: [0, 10.5], y, xlabel: 'log₁₀(mass in solar masses)', ylabel,
    curves: [{ fn, color: 'accent' }],
    points,
    ...(hline ? { hlines: [hline] } : {}),
  },
  caption,
});

export default lesson({
  id: 'gr.S22.i',
  title: 'The event horizon: a one-way surface',
  minutes: 10, difficulty: 3, mode: 'intuition', badges: ['est-der'],
  intro: t`At $r_s = 2GM/c^2$ the Schwarzschild metric looks broken, but nothing local happens there: a falling astronaut crosses it without noticing. What makes it special is **causal**: it is the boundary of the region from which no signal — not even light — can ever reach the outside. It is made of light rays that hover, trying to get out and never managing. Inside, the future itself points inward: $r$ decreases as surely as time advances, so the singularity at $r = 0$ is not a place you could steer around but a **moment in your future**. From the horizon, the longest that moment can be postponed is

$$\tau_\text{max} = \frac{\pi GM}{c^3}$$`,
  equation: t`r_s = \frac{2GM}{c^2}`,
  symbols: [
    { tex: 'r_s', text: 'the radius of the horizon (its circumference ÷ 2π): 2.95 km per solar mass' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\text{s}^{-2}$' },
    { tex: 'M', text: 'the black hole’s mass, in kg' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
    { tex: '\\tau_\\text{max}', text: 'the longest time, on your own clock, from crossing the horizon to reaching $r = 0$ — even with rockets firing' },
    { tex: 'GM/c^3', text: 'the black hole’s natural time scale: 4.9 μs per solar mass' },
  ],
  why: 'Horizons are what make a black hole black. Their areas never shrink — a law LIGO, Virgo and KAGRA confirmed with the merger GW250114 — and they connect gravity with thermodynamics and quantum theory.',
  visual: {
    ...coneGraph(true),
    title: 'Light cones near a black hole',
    lead: t`Each line is a light ray, drawn in coordinates that pass smoothly through the horizon; time runs up and $r$ is in units of $M = GM/c^2$. Slide the flash: its two arrows show the two directions its light can travel.`,
    tasks: ['Outside, the gold rays escape — slowly near r = 2M, quickly far away.', 'At exactly r = 2M an outgoing ray hovers forever: the horizon is made of light that cannot get out.', 'Inside, both arrows point toward smaller r. Every possible future ends at r = 0.'],
  },
  example: {
    prompt: t`An astronaut falls from rest, far away, into Sagittarius A* ($4.30\times10^{6}$ solar masses). How long after crossing the horizon does she reach $r = 0$ on her own clock? What does she feel at the horizon? What does a distant friend see?`,
    visual: infallGraph,
    steps: [
      { label: 'The time scale', text: t`$GM/c^3 = 4.30\times10^{6}\times4.925\ \mu\text{s} = ${sci(tM(SGR * M_SUN))}$ s.` },
      { label: 'Her clock', text: t`Falling from rest far away, the trip from the horizon to $r = 0$ takes $\tfrac43 GM/c^3 = ${sci((4 / 3) * tM(SGR * M_SUN))}$ s of her time. Even firing rockets outward she could stretch it to at most $\pi GM/c^3 = ${sci(Math.PI * tM(SGR * M_SUN))}$ s.` },
      { label: 'At the horizon', text: t`Tides across her 2 m body are $2GML/r_s^3 = ${sci(tidalHorizon(SGR * M_SUN))}$ m/s² — a ten-thousandth of $g$. Nothing marks the horizon: she feels nothing as she crosses.` },
      { label: 'Her friend', text: t`Her signals arrive ever more redshifted and ever further apart; the redshift grows by a factor $e$ every $4GM/c^3 = ${sci(4 * tM(SGR * M_SUN), 2)}$ s. Her image fades and freezes just outside the horizon, and is never seen to cross.` },
      { label: 'Both are right', text: t`They describe different clocks. Her own clock runs normally all the way; the far-away time coordinate, used to label her signals, runs to infinity at the horizon.` },
    ],
    answer: t`About $${sci((4 / 3) * tM(SGR * M_SUN), 2)}$ s from horizon to $r = 0$ (at most $${sci(Math.PI * tM(SGR * M_SUN), 2)}$ s); nothing felt at the horizon; to her friend she fades and freezes, never seen to cross.`,
  },
  practice: [
    mcq({
      id: 'time-stops', difficulty: 1,
      prompt: 'Does time stop at the event horizon?',
      choices: [
        'No: the infaller’s clock ticks normally and she crosses in finite time; it is her signals to the outside that are delayed without limit',
        'Yes, for everyone: all clocks stop there',
        'Yes, for the infaller: she freezes at the horizon',
        'Only for light, which stops at the horizon',
      ],
      answer: 0,
      why: {
        1: 'Clocks are local; each one ticks at one second per second for its owner. What "stops" is far-away time used as a label.',
        2: 'She feels nothing special and keeps falling; the freezing is in the picture her friend receives, not in what happens to her.',
        3: t`Light always moves at $c$ locally. Outgoing light at the horizon does stay at $r = r_s$ — but it is still moving at $c$.`,
      },
      hints: ['Compare the two curves in the picture: which clock reaches the horizon?'],
      teach: 'Nothing happens to time at the horizon for the infaller; only signals sent from there to far away are delayed without limit.',
      explain: 'On her own clock the infaller crosses in finite time (gold curve). The far-away time coordinate goes to infinity at the horizon (blue curve), which is why distant observers never see her cross — her last signals take ever longer to climb out.',
      visual: infallGraph,
    }),
    num({
      id: 'max-time', difficulty: 2,
      gen(r) {
        const [name, m] = r.pick([['a 10-solar-mass black hole', 10], ['Sagittarius A* (4.30 million solar masses)', SGR], ['M87* (6.5 billion solar masses)', M87]]);
        const x = Math.PI * tM(m * M_SUN);
        return {
          prompt: t`What is the longest time anyone can spend inside the horizon of ${name}, on their own clock, before reaching $r = 0$? Use $\tau_\text{max} = \pi GM/c^3$, with $GM_\odot/c^3 = ${sci(tM(M_SUN), 4)}$ s.`,
          answer: x, units: 's', tol: { rel: 0.01 },
          errors: [{ value: tM(m * M_SUN), feedback: 'Multiply GM/c³ by π.' }, { value: (4 / 3) * tM(m * M_SUN), feedback: 'That is the time for a fall from rest far away, (4/3)GM/c³. The maximum is πGM/c³.' }],
          hints: [t`$GM/c^3 = ${sci(m, 3)}\times${sci(tM(M_SUN), 4)}$ s; multiply by $\pi$.`],
          teach: 'The time from horizon to singularity scales with the mass: microseconds for stellar black holes, a day for M87*.',
          explain: t`$\tau_\text{max} = \pi\times${sci(tM(m * M_SUN))}$ s $= ${sci(x)}$ s${x > 3600 ? ` — about ${Math.round(x / 3600)} hours` : ''}.`,
          visual: massMap({
            ylabel: 'log₁₀(time in s)', y: [-5, 6], fn: `${round(log(Math.PI * tM(M_SUN)), 5)} + x`,
            points: [
              { x: 1, y: round(log(Math.PI * tM(10 * M_SUN)), 4), color: 'gold', label: '10 M☉' },
              { x: round(log(SGR), 4), y: round(log(Math.PI * tM(SGR * M_SUN)), 4), color: 'gold', label: 'Sgr A*' },
              { x: round(log(M87), 4), y: round(log(Math.PI * tM(M87 * M_SUN)), 4), color: 'gold', label: 'M87*' },
            ],
            caption: 'πGM/c³ against mass, both in powers of ten: it grows in proportion to the mass.',
          }),
        };
      },
    }),
    num({
      id: 'fall-time', difficulty: 2,
      gen(r) {
        const [name, m] = r.pick([['a 10-solar-mass black hole', 10], ['a 30-solar-mass black hole', 30], ['Sagittarius A*', SGR]]);
        const x = (4 / 3) * tM(m * M_SUN);
        return {
          prompt: t`A probe falls from rest, far away, into ${name}${m === SGR ? ' (4.30 million solar masses)' : ''}. How long does it take on its own clock to go from the horizon to $r = 0$? Use $\tfrac43 GM/c^3$, with $GM_\odot/c^3 = ${sci(tM(M_SUN), 4)}$ s.`,
          answer: x, units: 's', tol: { rel: 0.01 },
          errors: [{ value: Math.PI * tM(m * M_SUN), feedback: 'That is the maximum possible, πGM/c³. Falling from rest far away takes (4/3)GM/c³.' }],
          hints: [t`$GM/c^3 = ${sci(m, 3)}\times${sci(tM(M_SUN), 4)}$ s.`],
          teach: 'A fall from rest far away takes (4/3)GM/c³ of proper time from horizon to singularity.',
          explain: t`$\tfrac43\times${sci(tM(m * M_SUN))}$ s $= ${sci(x)}$ s. In the picture it is the short last stretch of the gold curve, from $r = 2M$ to $r = 0$: $\tfrac43$ in units of $GM/c^3$.`,
          visual: infallGraph,
        };
      },
    }),
    mcq({
      id: 'one-way', difficulty: 2,
      prompt: 'Inside the horizon, which way does even “outgoing” light move?',
      choices: [
        'Toward smaller r: every direction into the future leads inward',
        'Outward, but too slowly to reach the horizon in time',
        'It stays at the same r, like light on the horizon',
        'Outward at the speed of light, and it escapes',
      ],
      answer: 0,
      why: {
        1: 'Look at the gold rays left of the horizon: they move to smaller r as time goes up.',
        2: 'Only light exactly on the horizon hovers; inside, it is carried inward.',
        3: 'Nothing escapes from inside the horizon — that is what the horizon is.',
      },
      hints: ['Follow a gold ray that starts inside r = 2M upward in the picture.'],
      teach: 'Inside the horizon the light cones tip so far that all futures point to smaller r: the singularity is a moment ahead, not a place.',
      explain: 'Inside r = 2M both light rays from any event move to smaller r. Since nothing outruns light, everything inside moves inward too, and reaches r = 0 within a finite time.',
      visual: coneGraph(false),
    }),
    num({
      id: 'tides', difficulty: 3,
      gen(r) {
        const [name, m] = r.pick([['a 10-solar-mass black hole', 10], ['Sagittarius A*', SGR], ['a 1000-solar-mass black hole', 1000]]);
        const M = m * M_SUN, a = tidalHorizon(M);
        return {
          prompt: t`How strongly is a 2 m astronaut stretched — the difference in gravity between feet and head, $2GML/r^3$ — as she crosses the horizon ($r = r_s$) of ${name}${m === SGR ? ' (4.30 million solar masses)' : ''}?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: a / 2, feedback: 'Keep the factor 2 in 2GML/r³.' }, { value: (2 * G * M * 2) / mLen(M) ** 3, feedback: t`Use $r = r_s = 2GM/c^2$, not $GM/c^2$.` }],
          hints: [t`First $r_s = 2GM/c^2 = ${sci(rs(M))}$ m.`, t`Then $2GML/r_s^3 = 2\times${sci(G * M)}\times2/(${sci(rs(M))})^3$.`],
          teach: 'Horizon tides fall as 1/M²: deadly for stellar black holes, unnoticeable for supermassive ones.',
          explain: t`$\Delta g = ${sci(a)}$ m/s² — ${a > 1e4 ? 'she would be torn apart (“spaghettified”) well before reaching the horizon' : a > 10 ? 'painful and dangerous' : 'far less than anything she could feel'}. Big black holes have gentle horizons.`,
          visual: massMap({
            ylabel: 'log₁₀(stretch in m/s²)', y: [-12, 10], fn: `${round(log(tidalHorizon(M_SUN)), 5)} - 2x`,
            hline: { y: round(log(9.81), 4), label: 'g on Earth', color: 'bad' },
            points: [
              { x: 1, y: round(log(tidalHorizon(10 * M_SUN)), 4), color: 'gold', label: '10 M☉' },
              { x: round(log(SGR), 4), y: round(log(tidalHorizon(SGR * M_SUN)), 4), color: 'gold', label: 'Sgr A*' },
            ],
            caption: 'Feet-to-head stretch on a 2 m body at the horizon, against mass, in powers of ten. Above the red line it exceeds Earth’s gravity.',
          }),
        };
      },
    }),
    num({
      id: 'area', difficulty: 3,
      gen(r) {
        const [m1, m2] = r.pick([[33.6, 32.2], [36, 29], [30, 20]]);
        const A = (area(m1 * M_SUN) + area(m2 * M_SUN)) / 1e6;
        return {
          prompt: t`Two black holes of ${m1} and ${m2} solar masses (taken as non-spinning) are about to merge. What is their total horizon area, $4\pi r_s^2$ each, in square kilometres?`,
          answer: A, units: 'km^2', tol: { rel: 0.01 },
          errors: [{ value: (4 * Math.PI * rs((m1 + m2) * M_SUN) ** 2) / 1e6, feedback: 'That is the area of one hole of the combined mass. Add the two areas separately.' }, { value: A / 4, feedback: 'The area of a sphere is 4πr², not πr².' }],
          hints: [t`$r_s$ is 2.95 km per solar mass: $${sci(rs(m1 * M_SUN) / 1e3)}$ km and $${sci(rs(m2 * M_SUN) / 1e3)}$ km.`, t`Add $4\pi r_s^2$ for each.`],
          teach: 'Horizon area grows as the square of the mass, and the area theorem says the total never decreases.',
          explain: t`$4\pi(${sci(rs(m1 * M_SUN) / 1e3)})^2 + 4\pi(${sci(rs(m2 * M_SUN) / 1e3)})^2 = ${sci(A)}$ km². For GW250114 (33.6 + 32.2 solar masses) the measured area grew from about 240 000 km² to about 400 000 km² after the merger — as Hawking’s area theorem demands.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 75], y: [0, 700], xlabel: 'mass (solar masses)', ylabel: 'area (thousand km²)',
              curves: [{ fn: `${round((4 * Math.PI * rs(M_SUN) ** 2) / 1e9, 8)}x^2`, color: 'accent' }],
              points: [{ x: m1, y: round(area(m1 * M_SUN) / 1e9, 3), color: 'gold', label: `${m1} and ${m2} M☉` }, { x: m2, y: round(area(m2 * M_SUN) / 1e9, 3), color: 'teal' }],
            },
            caption: 'Horizon area of a non-spinning black hole, 4π(2GM/c²)², against its mass: it grows as M².',
          },
        };
      },
    }),
    mcq({
      id: 'hawking', difficulty: 2,
      prompt: 'Which statement about Hawking radiation is right?',
      choices: [
        'It is a theoretical prediction for quantum fields near a horizon; for any black hole of stellar mass or more it is far colder than the 2.7 K cosmic background, and it has never been observed from a real black hole',
        'LIGO detected it in the 2015 black-hole merger',
        'It makes stellar black holes evaporate within a few million years',
        'The Event Horizon Telescope photographed it around M87*',
      ],
      answer: 0,
      why: {
        1: 'LIGO detected gravitational waves from the merger, which are classical and unrelated to Hawking radiation.',
        2: 'A solar-mass black hole is at about 6×10⁻⁸ K and would take far longer than the age of the universe to evaporate — and today it absorbs more background radiation than it emits.',
        3: 'The EHT images show radio light from hot gas around the shadow, not Hawking radiation.',
      },
      hints: ['Compare the temperatures in the picture with the cosmic microwave background.'],
      teach: 'Hawking radiation is a derived but unobserved prediction: real black holes are much colder than the universe around them.',
      explain: t`$T = \hbar c^3/(8\pi GMk_B)$ is $${sci(hawking(M_SUN), 2)}$ K for one solar mass — far below 2.7 K — so astrophysical black holes absorb more than they emit. Hawking-like radiation has been seen only in laboratory analogues, not from a black hole.`,
      visual: massMap({
        ylabel: 'log₁₀(temperature in K)', y: [-19, 1], fn: `${round(log(hawking(M_SUN)), 5)} - x`,
        hline: { y: round(log(2.725), 4), label: 'cosmic background 2.7 K', color: 'bad' },
        points: [{ x: 0, y: round(log(hawking(M_SUN)), 4), color: 'gold', label: '1 M☉' }, { x: round(log(SGR), 4), y: round(log(hawking(SGR * M_SUN)), 4), color: 'gold', label: 'Sgr A*' }],
        caption: 'Predicted Hawking temperature against mass, in powers of ten: every known black hole lies far below the 2.7 K background.',
      }),
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-definition', difficulty: 2,
      prompt: 'What is an event horizon?',
      choices: [
        'The boundary of the region from which nothing — not even light — can ever reach far-away observers',
        'A solid surface on which infalling matter piles up',
        'The place where gravity becomes infinitely strong',
        'The edge of the dark patch in Event Horizon Telescope images',
      ],
      answer: 0,
      why: {
        1: 'There is no surface there; infalling matter crosses it in finite time on its own clock.',
        2: 'Tides at the horizon are finite — gentle for big black holes. The curvature becomes infinite only at r = 0.',
        3: 'The dark patch is the shadow, about 2.6 times the horizon’s diameter.',
      },
      hints: ['The horizon is defined by where light can and cannot go.'],
      teach: 'An event horizon is a causal boundary — defined by where signals can reach — not a material surface.',
      explain: 'The horizon separates events that can send signals to far-away observers from events that cannot. Locally nothing marks it; globally it is a one-way surface.',
    }),
    num({
      id: 'cp-fade', difficulty: 2,
      gen(r) {
        const [name, m] = r.pick([['a 30-solar-mass black hole', 30], ['Sagittarius A* (4.30 million solar masses)', SGR], ['M87* (6.5 billion solar masses)', M87]]);
        const x = 4 * tM(m * M_SUN);
        return {
          prompt: t`As a probe falls into ${name}, the redshift of its signals grows by a factor $e$ every $4GM/c^3$. How long is that, in seconds? ($GM_\odot/c^3 = ${sci(tM(M_SUN), 4)}$ s)`,
          answer: x, units: 's', tol: { rel: 0.01 },
          errors: [{ value: tM(m * M_SUN), feedback: 'Multiply GM/c³ by 4.' }],
          hints: [t`$4GM/c^3 = 4\times${sci(m, 3)}\times${sci(tM(M_SUN), 4)}$ s.`],
          teach: 'An infalling object fades from view in a few times GM/c³ of far-away time: milliseconds for stellar black holes, a day and more for the largest.',
          explain: t`$4GM/c^3 = ${sci(x)}$ s. After a few of these intervals the probe's signals are redshifted beyond detection.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 5], y: [0, 100], xlabel: 'far-away time (units of 4GM/c³)', ylabel: '1 + z',
              curves: [{ fn: 'exp(x)', color: 'bad' }],
              points: [{ x: 1, y: round(Math.E, 4), color: 'bad', label: '×e' }, { x: 2, y: round(Math.E ** 2, 4), color: 'bad', label: '×e²' }],
            },
            caption: 'Late in the fall, the redshift of the probe’s signals grows exponentially with far-away time (illustrative scale: 1 + z = 1 at time 0).',
          },
        };
      },
    }),
    num({
      id: 'cp-area-bound', difficulty: 3, transfer: true,
      gen(r) {
        const [m1, m2] = r.pick([[36, 29], [33.6, 32.2], [10, 10], [30, 20]]);
        const mf = Math.sqrt(m1 * m1 + m2 * m2), x = m1 + m2 - mf;
        return {
          prompt: t`Hawking's area theorem: total horizon area never decreases. Two non-spinning black holes of ${m1} and ${m2} solar masses merge into one, which we also take as non-spinning. Since area grows as $M^2$, the final mass must be at least $\sqrt{m_1^2 + m_2^2}$. What is the largest energy, in solar masses times $c^2$, that the gravitational waves could carry away?`,
          answer: x, units: 'Msun', tol: { rel: 0.01 },
          errors: [{ value: mf, feedback: 'That is the smallest possible final mass. The energy radiated is what is missing: m₁ + m₂ − that.' }],
          hints: [t`Minimum final mass: $\sqrt{${m1}^2 + ${m2}^2} = ${sci(mf, 4)}$ solar masses.`, 'Energy radiated = (m₁ + m₂ − final mass) c².'],
          teach: 'The area theorem caps how much energy a black-hole merger can radiate; real mergers radiate far less.',
          explain: t`At most $${m1} + ${m2} - ${sci(mf, 4)} = ${sci(x)}$ solar masses of energy (${Math.round((100 * x) / (m1 + m2))}% of the total). GW150914 radiated about 3 solar masses — well within the bound — and spinning final holes make the true limit tighter still.`,
          visual: {
            type: 'graph',
            params: {
              x: [-3.4, 3.4], y: [-1.6, 1.6], equal: true, grid: false, axes: false, xlabel: '', ylabel: '',
              curves: [
                { param: [`-2.3 + ${round(m1 / 60, 4)}cos(t)`, `${round(m1 / 60, 4)}sin(t)`], t: [0, 6.2832], color: 'accent' },
                { param: [`-1.1 + ${round(m2 / 60, 4)}cos(t)`, `${round(m2 / 60, 4)}sin(t)`], t: [0, 6.2832], color: 'teal' },
                { param: [`1.9 + ${round(mf / 60, 4)}cos(t)`, `${round(mf / 60, 4)}sin(t)`], t: [0, 6.2832], color: 'gold' },
              ],
              arrows: [{ from: [-0.35, 0], to: [0.85, 0], color: 'ink3' }],
              points: [
                { x: -2.3, y: round(-m1 / 60 - 0.25, 4), color: 'accent', label: `${m1} M☉`, r: 0.5 },
                { x: -1.1, y: round(-m2 / 60 - 0.25, 4), color: 'teal', label: `${m2} M☉`, r: 0.5 },
                { x: 1.9, y: round(-mf / 60 - 0.25, 4), color: 'gold', label: 'smallest allowed', r: 0.5 },
              ],
            },
            caption: 'Horizons drawn with radii in proportion to mass, so areas compare honestly: the final circle’s area equals the two before. Schematic, not to any real scale.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 7 (horizons and Eddington–Finkelstein coordinates)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Penrose, “Gravitational collapse and space-time singularities”, Phys. Rev. Lett. 14, 57 (1965)', url: 'https://doi.org/10.1103/PhysRevLett.14.57' },
    { label: 'LIGO–Virgo–KAGRA, GW250114 and Hawking’s area theorem (2025)', url: 'https://arxiv.org/abs/2509.08054' },
  ],
});
