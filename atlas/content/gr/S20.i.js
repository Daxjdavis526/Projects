// The Schwarzschild metric — Intuition Mode. Read as two maps: a clock-rate
// map, √(1 − r_s/r), and a radial ruler-stretch map, 1/√(1 − r_s/r). It is
// the exact spacetime outside any spherical mass (Birkhoff), so it covers the
// Sun, the planets and non-spinning black holes alike — but only outside the
// body. r is the areal radius; r = r_s is a coordinate failure, r = 0 a real
// singularity.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { G, C, M_SUN, M_EARTH, R_SUN, AU, DAY, rs, sci, round } from './_fasttrack.js';
import { staticClockRate } from '../../src/viz/model/gravity.js';

const t = String.raw;

const RS_SUN = rs(M_SUN), RS_10 = rs(10 * M_SUN);
const SGR = 4.30e6, M87 = 6.5e9;
const sunLoss = 1 - staticClockRate(R_SUN, RS_SUN / 2);   // staticClockRate(r, M) uses M = GM/c² (half of rₛ)
const stretch = (k) => 1 / Math.sqrt(1 - 1 / k);
const clock = (k) => staticClockRate(k, 0.5);              // r in units of rₛ, M = rₛ/2
const density = (M) => M / ((4 / 3) * Math.PI * rs(M) ** 3);
const log = Math.log10;

// who is a black hole? physical radius against mass, with the r_s line
const radiusMap = {
  type: 'graph',
  params: {
    x: [-6.5, 10.5], y: [-6, 11.5], xlabel: 'log₁₀(mass in solar masses)', ylabel: 'log₁₀(radius in km)',
    curves: [{ fn: `${round(log(RS_SUN / 1e3), 5)} + x`, color: 'bad', label: 'r = rₛ: black holes', labelAt: 3.2 }],
    points: [
      { x: round(log(M_EARTH / M_SUN), 4), y: round(log(6371), 4), color: 'accent', label: 'Earth' },
      { x: 0, y: round(log(R_SUN / 1e3), 4), color: 'gold', label: 'Sun' },
      { x: round(log(1.02), 4), y: round(log(5800), 4), color: 'teal', label: 'white dwarf' },
      { x: round(log(1.4), 4), y: round(log(12), 4), color: 'violet', label: 'neutron star' },
      { x: round(log(SGR), 4), y: round(log(rs(SGR * M_SUN) / 1e3), 4), color: 'ink', label: 'Sgr A*' },
      { x: round(log(M87), 4), y: round(log(rs(M87 * M_SUN) / 1e3), 4), color: 'ink', label: 'M87*' },
    ],
  },
  caption: 'Radius against mass, both in powers of ten. Ordinary bodies sit far above the red line r = rₛ; squeezed onto it, they would be black holes. Neutron stars come within a factor of 3.',
};

export default lesson({
  id: 'gr.S20.i',
  title: 'The spacetime outside any round mass',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-der', 'est-obs'],
  intro: t`Within weeks of Einstein publishing his field equations in late 1915, Karl Schwarzschild found their exact solution for the empty spacetime around a round mass. By Birkhoff's theorem it is the **only** such solution: outside the Sun, a planet, a non-spinning star or a black hole, spacetime is exactly this, whatever the inside is doing. Every solar-system test of general relativity lives in it. It is best read as **two maps** — one for clocks, one for rulers — set by a single length, the Schwarzschild radius $r_s = 2GM/c^2$:

$$ds^2 = -\left(1 - \frac{r_s}{r}\right)c^2\,dt^2 + \frac{dr^2}{1 - r_s/r} + r^2\left(d\theta^2 + \sin^2\theta\,d\phi^2\right)$$`,
  equation: t`\frac{d\tau}{dt} = \sqrt{1 - \frac{r_s}{r}} \qquad \frac{d\ell}{dr} = \frac{1}{\sqrt{1 - r_s/r}} \qquad r_s = \frac{2GM}{c^2}`,
  symbols: [
    { tex: 'ds^2', text: 'the spacetime interval between two nearby events: it gives proper time ($ds^2 = -c^2 d\\tau^2$) or distance ($ds^2 = d\\ell^2$)' },
    { tex: 't', text: 'the time of observers far away — not what a clock near the mass reads' },
    { tex: 'r', text: 'the **areal radius**: a sphere at $r$ has area $4\\pi r^2$ and circumference $2\\pi r$. It is not the distance to the centre' },
    { tex: '\\theta,\\ \\phi', text: 'angles that say where on the sphere you are, as latitude and longitude do on Earth' },
    { tex: 'd\\tau/dt', text: 'the clock-rate map: how fast a clock hovering at $r$ ticks compared with one far away' },
    { tex: 'd\\ell/dr', text: 'the ruler map: how much longer a short radial ruler measures than the change in $r$' },
    { tex: 'r_s', text: 'the Schwarzschild radius, $2GM/c^2$: 2.95 km for the Sun, 8.9 mm for Earth' },
    { tex: 'M', text: 'the mass, as measured by the orbits of distant moons and planets, in kg' },
  ],
  why: 'Every lesson from here to the event horizon — redshift, Mercury, light bending, black-hole orbits — is this one metric, read in different ways.',
  visual: {
    type: 'graph',
    title: 'Two maps of one spacetime',
    lead: t`The gold curve is the **time** map: how fast a clock hovering at $r$ ticks compared with one far away. The blue curve is the **space** map: how much a short radial ruler stretches. Distances are in units of $r_s$; pick a mass to see them in kilometres.`,
    tasks: ['Slide to r = 4 rₛ: a hovering clock ticks at 0.866 of the far-away rate, and radial rulers stretch by 1.155.', 'Slide toward rₛ: the clock rate falls toward zero and the stretch grows without limit — a sign that these coordinates fail there, not that space tears.', 'Far out both curves approach 1 and the dashed weak-field line takes over: that is the gh/c² world of everyday gravity.'],
    params: {
      x: [0, 10], y: [0, 3], xlabel: 'r / rₛ', ylabel: 'factor',
      sliders: [{ key: 'R', label: 'Hovering at $r/r_s$', min: 1.02, max: 10, step: 0.01, value: 3, unit: '', explain: 'Your distance label, in Schwarzschild radii.' }],
      choices: [{ key: 'rsk', label: 'Mass', options: [[round(RS_SUN / 1e3, 4), 'the Sun'], [round(RS_10 / 1e3, 4), '10 M☉'], [round(rs(SGR * M_SUN) / 1e3, 4), 'Sgr A*'], [round(rs(M87 * M_SUN) / 1e3, 4), 'M87*']], value: round(RS_10 / 1e3, 4), explain: 'Sets the scale: rₛ is 2.95 km × (M in solar masses).' }],
      curves: [
        { fn: '1/sqrt(1 - 1/x)', domain: [1.125, 10], color: 'accent', label: 'ruler stretch', labelAt: 2.2 },
        { fn: 'sqrt(1 - 1/x)', domain: [1, 10], color: 'gold', label: 'clock rate', labelAt: 6.5 },
        { fn: '1 - 1/(2x)', domain: [1, 10], color: 'gold', dash: true, width: 1.4 },
      ],
      points: [{ x: 'R', y: 'sqrt(1 - 1/R)', color: 'gold' }, { x: 'R', y: '1/sqrt(1 - 1/R)', color: 'accent' }],
      vlines: [{ x: 1, label: 'r = rₛ' }],
      readouts: [
        { label: '$r$', expr: 'R*rsk', unit: '\\mathrm{km}', digits: 4 },
        { label: 'clock rate', expr: 'sqrt(1 - 1/R)', digits: 4 },
        { label: 'radial stretch', expr: '1/sqrt(1 - 1/R)', digits: 4 },
        { label: 'circumference $2\\pi r$', expr: '2*pi*R*rsk', unit: '\\mathrm{km}', digits: 4 },
      ],
    },
    caption: 'Exact Schwarzschild factors outside a non-spinning mass. Dashed: the weak-field clock rate 1 − rₛ/2r. The metric holds only outside the body: the Sun’s surface is at 236 000 rₛ and Earth’s at 7×10⁸ rₛ, so this whole plot lies deep inside them — only black holes expose it.',
  },
  example: {
    prompt: t`Read the metric for (a) a clock hovering at fixed $r$ and (b) a short ruler pointing radially. Evaluate both for a 10-solar-mass black hole at $r = 4r_s$, then find how fast a clock on the Sun's surface ticks.`,
    steps: [
      { label: 'Size', text: t`$r_s = 2GM/c^2 = 2(6.674\times10^{-11})(1.989\times10^{31})/(2.998\times10^{8})^2 = ${sci(RS_10 / 1e3)}$ km, so $r = 4r_s = ${sci((4 * RS_10) / 1e3)}$ km.` },
      { label: 'A hovering clock', text: t`It does not move: $dr = d\theta = d\phi = 0$, and its ticks are proper time, $ds^2 = -c^2\,d\tau^2$. The metric leaves $c^2 d\tau^2 = (1 - r_s/r)\,c^2 dt^2$, so $d\tau = \sqrt{1 - r_s/r}\;dt = \sqrt{3/4}\;dt = ${sci(clock(4))}\,dt$: it ticks ${Math.round(100 * (1 - clock(4)))}% slower than a far-away clock.` },
      { label: 'A radial ruler', text: t`At one instant ($dt = 0$), pointing straight out ($d\theta = d\phi = 0$): $ds^2 = d\ell^2 = dr^2/(1 - r_s/r)$, so $d\ell = ${sci(stretch(4), 4)}\,dr$. The ruler measures ${Math.round(100 * (stretch(4) - 1))}% more than the change in $r$: space is stretched radially.` },
      { label: 'The Sun', text: t`$r_s = ${sci(RS_SUN / 1e3)}$ km and the surface is at $r = 6.957\times10^{5}$ km, so $r_s/r = ${sci(RS_SUN / R_SUN)}$ and $\sqrt{1 - r_s/r} = 1 - ${sci(sunLoss)}$. A clock there loses $${sci(sunLoss * DAY, 2)}$ s a day against a far-away clock.` },
      { label: 'Sense check', text: t`Far out, $\sqrt{1 - r_s/r} \approx 1 - r_s/2r = 1 - GM/(rc^2)$: the weak-field clock rule, which near Earth's surface becomes the $gh/c^2$ of everyday gravity.` },
    ],
    answer: t`At $4r_s$: clocks tick at $${sci(clock(4))}$ of the far-away rate and radial rulers stretch by $${sci(stretch(4), 4)}$. On the Sun's surface, clocks lose about $${sci(sunLoss * DAY, 2)}$ s a day.`,
  },
  practice: [
    num({
      id: 'rs', difficulty: 1,
      gen(r) {
        const [name, M, mtex, hole] = r.pick([
          ['the Sun', M_SUN, t`1.989\times10^{30}`, false], ['Earth', M_EARTH, t`5.972\times10^{24}`, false], ['Jupiter', 1.898e27, t`1.898\times10^{27}`, false],
          ['a 10-solar-mass black hole', 10 * M_SUN, t`1.989\times10^{31}`, true], ['Sagittarius A*, the Milky Way’s central black hole (4.30 million solar masses)', SGR * M_SUN, t`${sci(SGR * M_SUN, 3)}`, true],
        ]);
        const R = rs(M);
        return {
          prompt: t`What is the Schwarzschild radius $r_s = 2GM/c^2$ of ${name}? ($M = ${mtex}$ kg, $G = 6.674\times10^{-11}$ SI, $c = 2.998\times10^{8}$ m/s)`,
          answer: R / 1e3, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: (G * M) / (C * C) / 1e3, feedback: 'You dropped the 2: rₛ = 2GM/c².' }, { value: (2 * G * M) / C / 1e3, feedback: 'Divide by c squared.' }],
          hints: [t`$r_s = 2GM/c^2$; work in metres, then convert (1 km = 1000 m — you may also type an answer like “8.9 mm”).`],
          teach: 'The Schwarzschild radius rₛ = 2GM/c² is about 2.95 km for every solar mass.',
          explain: t`$r_s = 2(6.674\times10^{-11})(${mtex})/(2.998\times10^{8})^2 = ${sci(R)}$ m. ${hole ? 'That is the radius of its event horizon (circumference ÷ 2π).' : `Squeezed inside that radius, ${name} would become a black hole.`}`,
          visual: radiusMap,
        };
      },
    }),
    mcq({
      id: 'areal-r', difficulty: 2,
      prompt: t`In the Schwarzschild metric, what does the coordinate $r$ measure?`,
      choices: [
        'The circumference of the sphere through that point, divided by 2π',
        'The distance a ruler would measure from the centre',
        'The radius of the star or black hole',
        'The time it takes light to reach the centre',
      ],
      answer: 0,
      why: {
        1: 'Radial rulers are stretched by 1/√(1 − rₛ/r), so ruler distances are longer than differences in r — and inside a black hole there is no ruler path to r = 0 at all.',
        2: 'The coordinate r runs over all of space outside the body; the body’s radius is just one particular value of it.',
        3: 'r is a length label, not a light travel time — and light takes longer than r/c, because of the stretch and the slow clocks.',
      },
      hints: [t`Look at the last term: $r^2(d\theta^2 + \sin^2\theta\,d\phi^2)$ is the geometry of an ordinary sphere of radius $r$.`],
      teach: 'Schwarzschild r is the areal radius: you measure it by walking round a circle and dividing by 2π, not with a radial ruler.',
      explain: t`The angular part of the metric is exactly that of a sphere of radius $r$, so a circle at fixed $r$ has circumference $2\pi r$ and the sphere has area $4\pi r^2$. Radial distances, though, are stretched: between $r_s$ and $2r_s$ a ruler measures $${sci(Math.SQRT2 + Math.log(Math.SQRT2 + 1))}\,r_s$, not $1\,r_s$.`,
    }),
    num({
      id: 'clock-rate', difficulty: 2,
      gen(r) {
        const k = r.pick([1.5, 2, 3, 5, 10]);
        const f = clock(k);
        return {
          prompt: t`A probe hovers at $r = ${k}\,r_s$ outside a black hole, firing its engines to stay put. Its clock ticks at what fraction of the rate of a clock far away?`,
          answer: f, tol: { rel: 0.005 },
          errors: [{ value: 1 - 1 / k, feedback: 'Take the square root: dτ/dt = √(1 − rₛ/r).' }, { value: 1 / f, feedback: 'That is the ruler stretch, 1/√(1 − rₛ/r). Clocks run slow, so the fraction is below 1.' }],
          hints: [t`$d\tau/dt = \sqrt{1 - r_s/r}$ with $r_s/r = 1/${k}$.`],
          teach: 'A clock hovering at r ticks at √(1 − rₛ/r) of the rate of a far-away clock.',
          explain: t`$\sqrt{1 - 1/${k}} = ${sci(f, 4)}$. Each far-away hour, the probe's clock advances ${sci(60 * f, 3)} minutes.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 11], y: [0, 1.15], xlabel: 'r / rₛ', ylabel: 'clock rate',
              curves: [{ fn: 'sqrt(1 - 1/x)', domain: [1, 11], color: 'gold' }],
              points: [{ x: k, y: round(f, 5), color: 'gold', label: `r = ${k} rₛ` }],
              vlines: [{ x: 1, label: 'r = rₛ' }], hlines: [{ y: 1, label: 'far away' }],
            },
            caption: 'The clock-rate map √(1 − rₛ/r) for a clock hovering at r.',
          },
        };
      },
    }),
    multi({
      id: 'birkhoff', difficulty: 2,
      prompt: 'Which of these spacetimes are described exactly by the Schwarzschild metric? Select every one.',
      choices: [
        'Just outside the Sun’s surface (ignoring its slow spin)',
        'Around a non-rotating star while it collapses, staying perfectly spherical',
        'Outside a non-rotating black hole',
        'Inside the Earth',
        'Around a rapidly spinning black hole',
      ],
      answer: [0, 1, 2],
      why: {
        3: 'Inside matter the field equations have a source; the Schwarzschild metric is the vacuum solution, valid only outside the mass.',
        4: 'Spin changes the spacetime: a rotating black hole is described by the Kerr metric.',
      },
      hints: ['Schwarzschild is the solution for *empty* space around a *spherical* mass.', 'Birkhoff’s theorem: outside any spherical mass the empty spacetime is Schwarzschild — even if the mass is moving, as long as it stays spherical.'],
      teach: 'By Birkhoff’s theorem, the empty spacetime outside any spherical mass — static, pulsing or collapsing — is exactly Schwarzschild.',
      explain: 'Outside a spherical mass the metric depends only on M, whatever the inside does (Birkhoff). Inside matter, or around a spinning mass, it is different: inside Earth you need a solution with a source, around a spinning hole the Kerr metric.',
    }),
    mcq({
      id: 'replace-sun', difficulty: 2,
      prompt: 'Suppose the Sun were suddenly replaced by a black hole of exactly the same mass. What would happen to Earth’s orbit?',
      choices: [
        'Nothing: outside both, spacetime is the same Schwarzschild geometry, so the orbit is unchanged',
        'Earth would spiral in, because black holes suck everything toward them',
        'Earth would drift away, because a black hole’s gravity stays hidden behind its horizon',
        'Earth would orbit faster, because the mass is packed into a smaller space',
      ],
      answer: 0,
      why: {
        1: 'Black holes do not suck. Far from the horizon their gravity is exactly that of any other body of the same mass.',
        2: 'The horizon hides light and matter that fall in, not the mass’s gravity; the spacetime outside is set by M alone.',
        3: 'Orbits depend on the mass and the distance, not on how compact the central body is.',
      },
      hints: ['The Schwarzschild metric outside a mass depends on just one number about it. Which one?'],
      teach: 'Far from a black hole, its gravity is the same as any body’s of the same mass: black holes do not suck.',
      explain: t`Earth is at $1\ \text{AU} = ${sci(AU / RS_SUN, 3)}\,r_s$ from the Sun, where the metric depends only on $M$. Earth would keep orbiting just as before — in the dark and cold, but on the same orbit.`,
    }),
    num({
      id: 'density', difficulty: 3,
      gen(r) {
        const [name, m, compare] = r.pick([
          ['a 1-solar-mass black hole', 1, 'about 80 times the density of an atomic nucleus (2.3×10¹⁷ kg/m³)'],
          ['a 10-solar-mass black hole', 10, 'close to the density of an atomic nucleus (2.3×10¹⁷ kg/m³)'],
          ['Sagittarius A* (4.30 million solar masses)', SGR, 'about a hundred times denser than lead'],
          ['M87* (6.5 billion solar masses)', M87, 'less than the density of air (1.2 kg/m³)'],
        ]);
        const M = m * M_SUN, rho = density(M);
        return {
          prompt: t`A rough comparison number: the mass of ${name} divided by the volume $\tfrac43\pi r_s^3$. What is it, in kg/m³? (1 solar mass $= 1.989\times10^{30}$ kg)`,
          answer: rho, units: 'kg/m^3', tol: { rel: 0.01 },
          errors: [{ value: M / (4 * Math.PI * rs(M) ** 3), feedback: 'The volume of a sphere is (4/3)πr³, not 4πr³.' }, { value: M / ((4 / 3) * Math.PI * ((G * M) / (C * C)) ** 3), feedback: 'Use rₛ = 2GM/c², with the factor 2.' }],
          hints: [t`First $r_s = 2GM/c^2 = ${sci(rs(M))}$ m.`, t`Then $M / (\tfrac43\pi r_s^3) = ${sci(M)}/(\tfrac43\pi(${sci(rs(M))})^3)$.`],
          teach: 'Because rₛ grows in proportion to M, this mean density falls as 1/M²: giant black holes are not dense at all.',
          explain: t`$\rho = ${sci(rho)}$ kg/m³ — ${compare}. It falls as $1/M^2$. Honest caveat: inside $r_s$ space is not flat and nothing sits still, so this is only a comparison number, not the density of anything.`,
        };
      },
    }),
    mcq({
      id: 'coordinate', difficulty: 3,
      prompt: t`At $r = r_s$ the factor $1/(1 - r_s/r)$ in the metric becomes infinite. What does that mean physically?`,
      choices: [
        'These coordinates fail there: someone falling in notices nothing special at r = rₛ, and the curvature there is finite. The true singularity is at r = 0',
        'Spacetime is torn at r = rₛ, and anything that reaches it is destroyed',
        'Nothing can exist inside r = rₛ, so a black hole is a hollow shell',
        'Clocks at r = rₛ tick infinitely fast',
      ],
      answer: 0,
      why: {
        1: 'Tides at the horizon of a large black hole are gentle — for Sgr A*, about 0.001 m/s² across your body. The tearing happens near r = 0.',
        2: 'Infalling matter crosses r = rₛ in a finite time on its own clock and continues inward.',
        3: 'The clock-rate factor √(1 − rₛ/r) goes to zero, not infinity — and even that describes only clocks trying to hover, which becomes impossible there.',
      },
      hints: ['A map of the Earth in latitude and longitude goes wrong at the poles. Is anything physically strange at the North Pole?', 'Ask whether a quantity that does not depend on coordinates — such as the size of tides — blows up at r = rₛ.'],
      teach: 'r = rₛ is a coordinate singularity — the coordinates fail, not spacetime — while r = 0 is a real curvature singularity.',
      explain: 'Like longitude at the North Pole, Schwarzschild’s t and r go bad at r = rₛ, but measurable curvature stays finite there and other coordinates pass smoothly through it. What r = rₛ really is — a one-way surface — is the subject of the event-horizon lesson. At r = 0 the curvature itself becomes infinite.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rs', difficulty: 2,
      gen(r) {
        const [name, m] = r.pick([['the black hole left by GW150914, the first merger LIGO heard (62 solar masses)', 62], ['Cygnus X-1, the first black hole identified (21.2 solar masses)', 21.2], ['a 1.4-solar-mass neutron star, if it collapsed', 1.4]]);
        const R = rs(m * M_SUN);
        return {
          prompt: t`What is the Schwarzschild radius of ${name}? (1 solar mass $= 1.989\times10^{30}$ kg)`,
          answer: R / 1e3, units: 'km', tol: { rel: 0.01 },
          hints: [t`$r_s = 2GM/c^2$, or about 2.95 km per solar mass.`],
          teach: 'rₛ scales in proportion to the mass: about 2.95 km per solar mass.',
          explain: t`$r_s = 2GM/c^2 = ${sci(R / 1e3)}$ km.`,
        };
      },
    }),
    num({
      id: 'cp-stretch', difficulty: 2,
      gen(r) {
        const k = r.pick([1.25, 2, 4, 9]);
        return {
          prompt: t`At $r = ${k}\,r_s$, a short ruler pointing radially measures how many times the change in $r$ between its ends? (That is, find $d\ell/dr$.)`,
          answer: stretch(k), tol: { rel: 0.005 },
          hints: [t`$d\ell/dr = 1/\sqrt{1 - r_s/r}$.`],
          teach: 'Radial distances outside a mass are stretched by 1/√(1 − rₛ/r) compared with differences in r.',
          explain: t`$1/\sqrt{1 - 1/${k}} = ${sci(stretch(k), 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-s2', difficulty: 3, transfer: true,
      gen(r) {
        const au = r.pick([120, 150, 200]);
        const ratio = (au * AU) / rs(SGR * M_SUN);
        return {
          prompt: t`The star S2 swings past Sagittarius A* (4.30 million solar masses) at about ${au} AU from it. How many Schwarzschild radii is that? (1 AU $= 1.496\times10^{11}$ m)`,
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: (au * AU) / ((G * SGR * M_SUN) / (C * C)), feedback: 'Use rₛ = 2GM/c², with the factor 2.' }],
          hints: [t`First $r_s = 2GM/c^2$ for $M = 4.30\times10^{6}\times1.989\times10^{30}$ kg.`, t`$r_s = ${sci(rs(SGR * M_SUN))}$ m; divide ${au} AU in metres by it.`],
          teach: 'Even the closest-orbiting stars stay over a thousand Schwarzschild radii from Sgr A*, in the weak field.',
          explain: t`$r_s = ${sci(rs(SGR * M_SUN))}$ m $= ${sci(rs(SGR * M_SUN) / AU, 2)}$ AU, so ${au} AU is $${sci(ratio)}\,r_s$. There $r_s/2r = ${sci(1 / (2 * ratio), 2)}$: S2's light is redshifted by about that fraction by gravity — and the GRAVITY collaboration detected it, together with the slowing of S2's clock by its speed, in 2018.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 7 (the Schwarzschild solution)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'GRAVITY Collaboration, gravitational redshift of S2 near Sgr A* (2018)', url: 'https://arxiv.org/abs/1807.09409' },
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes (2nd ed., free online)', url: 'https://www.eftaylor.com/exploringblackholes' },
  ],
});
