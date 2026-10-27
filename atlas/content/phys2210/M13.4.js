// Orbits and Kepler's laws: ellipses with the central mass at a focus, equal
// areas in equal times, T² = 4π²a³/GM — with real orbits from the ISS and GPS
// to Halley's comet and the star S2 around the Milky Way's black hole.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { G, GM_EARTH, R_EARTH, keplerPicture } from './_gravity.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (v) => +(+v).toFixed(4);
const RK = R_EARTH / 1000;
const vc = (rm) => Math.sqrt(GM_EARTH / rm);
const Tc = (rm) => 2 * Math.PI * Math.sqrt(rm ** 3 / GM_EARTH);

// the Earth with one or two circular orbits, to scale
function earthOrbits(radiiKm, labels = [], caption) {
  const R = Math.max(...radiiKm) * 1.18;
  return {
    type: 'graph',
    params: {
      x: [r4(-R * 1.6), r4(R * 1.6)], y: [r4(-R), r4(R)], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
      shade: [{ fn: `sqrt(max(0, ${RK * RK} - x^2))`, lower: `-sqrt(max(0, ${RK * RK} - x^2))`, from: -RK, to: RK, color: 'teal', alpha: 0.45 }],
      curves: radiiKm.map((rk, i) => ({ param: [`${rk}*cos(t)`, `${rk}*sin(t)`], t: [0, 6.2832], color: i ? 'gold' : 'accent', width: 1.6, dash: true })),
      points: radiiKm.map((rk, i) => ({ x: r4(rk * Math.cos(0.8 + i)), y: r4(rk * Math.sin(0.8 + i)), color: i ? 'gold' : 'accent', r: 4.5, ...(labels[i] ? { label: labels[i] } : {}) })),
    },
    caption: caption ?? 'Earth and the orbit, to scale, seen from above the orbit.',
  };
}

// Kepler's third law on logarithmic axes: the planets lie on a line of slope 3/2
const PLANETS = [['Mercury', 0.3871, 0.2408], ['Venus', 0.7233, 0.6152], ['Earth', 1, 1], ['Mars', 1.5237, 1.8809], ['Jupiter', 5.2029, 11.862], ['Saturn', 9.537, 29.457], ['Uranus', 19.19, 84.01], ['Neptune', 30.07, 164.8]];
const keplerLog = (hide) => ({
  type: 'graph',
  params: {
    x: [-0.6, 1.7], y: [-0.9, 2.5], xlabel: 'log₁₀(a in AU)', ylabel: 'log₁₀(T in years)', aspect: 'wide',
    curves: [{ fn: '1.5x', color: 'ink3', width: 1.2, dash: true }],
    points: PLANETS.filter(([n]) => n !== hide).map(([n, a, T]) => ({ x: r4(Math.log10(a)), y: r4(Math.log10(T)), color: 'accent', label: n, labelDx: 8, labelDy: 10 })),
  },
  caption: 'The planets’ periods against their orbit sizes on logarithmic axes: a straight line of slope 3/2, which is T² ∝ a³. (Measured values; the dashed line is T = a^1.5 in years and AU.)',
});

// Galilean moons: name, semi-major axis (km), period (days)
const MOONS = [['Io', 421700, 1.769], ['Europa', 671100, 3.551], ['Ganymede', 1070400, 7.155], ['Callisto', 1882700, 16.689]];

const GEO = { T: 86164 };
GEO.r = Math.cbrt((GM_EARTH * GEO.T ** 2) / (4 * Math.PI ** 2));
GEO.v = (2 * Math.PI * GEO.r) / GEO.T;

export default lesson({
  id: 'phys2210.M13.4',
  title: 'Orbits and Kepler’s laws',
  minutes: 12, difficulty: 3,
  intro: t`Johannes Kepler found three rules in Tycho Brahe's measurements of the planets, and Newton showed that his law of gravity produces all three:

- orbits are **ellipses** with the Sun at one focus (a circle is the special case);
- the line from the Sun to a planet sweeps out **equal areas in equal times** — angular momentum is conserved;
- the square of the period grows as the cube of the orbit's size:

$$T^2 = \frac{4\pi^2}{GM}\,a^3$$

For a circular orbit, gravity supplies exactly the centripetal force, $GMm/r^2 = mv^2/r$, so $v = \sqrt{GM/r}$. **The orbiting body's own mass cancels**: a space station and a dropped spanner on the same path orbit together — which is why the spanner floats.`,
  symbols: [
    { tex: 'T', text: 'the period: the time for one orbit, in s' },
    { tex: 'a', text: 'the semi-major axis: half the longest diameter of the ellipse (the radius, for a circle), in m — measured from the centre of the central body, not its surface' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$' },
    { tex: 'M', text: 'the central mass, in kg ($GM = 3.986\\times10^{14}\\ \\text{m}^3/\\text{s}^2$ for Earth, $1.327\\times10^{20}$ for the Sun); the orbiting body’s mass is assumed much smaller' },
    { tex: 'v = \\sqrt{GM/r}', text: 'the speed of a circular orbit of radius $r$, in m/s' },
    { tex: 'e', text: 'the eccentricity: 0 for a circle, near 1 for a long, thin ellipse; the closest and farthest distances are $a(1 - e)$ and $a(1 + e)$' },
  ],
  why: 'Kepler’s third law weighs the Sun, the planets and the black hole at the centre of our galaxy: measure a period and a size, and out comes the mass at the centre.',
  visual: {
    type: 'mech-kepler',
    title: 'Real orbits, from the ISS to a black hole',
    lead: t`Each orbit is drawn to its own scale, moving at its true relative pace. Compare sizes and periods in the readout; watch the coloured sectors, each swept in the same time.`,
    tasks: [
      'Go from the ISS to the geostationary orbit: 6.2 times wider, 15.5 times longer to go round — and 6.2^1.5 = 15.5. That is Kepler’s third law.',
      'Pick the transfer orbit, then Halley’s comet: the central body sits at one focus, and the orbiting body races through the near end and crawls through the far one.',
      'Pick S2: a star circling a black hole of 4.3 million Suns once every 16 years, obeying the same law.',
    ],
    params: { presets: ['iss', 'gps', 'geo', 'gto', 'moon', 'earth', 'mercury', 'halley', 's2'], preset: 'iss', readout: ['r', 'v', 'T', 'a', 'e'], autoplay: true },
  },
  example: {
    prompt: t`A geostationary satellite hangs above one spot on the equator: it orbits in exactly the time the Earth takes to turn once relative to the stars, 23 h 56 min 4 s ($86\,164$ s). How far from Earth's centre must it orbit, how high above the equator is that, and how fast does it move? ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$; equatorial radius 6378 km)`,
    visual: keplerPicture('geo', { t: 0.15, caption: 'The geostationary orbit and the Earth, to scale.' }),
    steps: [
      { label: 'Why 86 164 s, not 86 400', text: t`A 24-hour solar day includes the extra quarter-degree turn the Earth makes each day because it has moved along its orbit. Relative to the stars, one turn takes ${(86164 / 3600).toFixed(4)} h.` },
      { label: 'Kepler III for the radius', text: t`$r = \left(\dfrac{GM\,T^2}{4\pi^2}\right)^{1/3} = \left(\dfrac{(3.986\times10^{14})(86\,164)^2}{4\pi^2}\right)^{1/3} = ${tex(GEO.r, 5)}$ m $= ${Math.round(GEO.r / 1000).toLocaleString('en-US').replace(/,/g, '{,}')}$ km.` },
      { label: 'Height', text: t`$${Math.round(GEO.r / 1000).toLocaleString('en-US').replace(/,/g, '{,}')} - 6378 = ${Math.round(GEO.r / 1000 - 6378).toLocaleString('en-US').replace(/,/g, '{,}')}$ km above the equator.` },
      { label: 'Speed', text: t`$v = 2\pi r/T = ${s3(GEO.v / 1000)}$ km/s — or $\sqrt{GM/r}$, the same.` },
      { label: 'Sense check', text: t`The centripetal acceleration $v^2/r = ${s3(GEO.v ** 2 / GEO.r)}\ \text{m/s}^2$ equals $GM/r^2$ there, as it must. Communications satellites sit on this one circle; their dishes on the ground never need to move.` },
    ],
    answer: t`$r = ${Math.round(GEO.r / 1000).toLocaleString('en-US').replace(/,/g, '{,}')}$ km from the centre, ${Math.round(GEO.r / 1000 - 6378).toLocaleString('en-US')} km up, moving at $${s3(GEO.v / 1000)}$ km/s.`,
  },
  practice: [
    num({
      id: 'v-circ', difficulty: 1,
      gen(r) {
        const [what, h] = r.pick([['the International Space Station, 420 km up', 420], ['the Hubble Space Telescope, 535 km up', 535], ['a Starlink satellite, 550 km up', 550], ['a satellite in a circular orbit 1200 km up', 1200]]);
        const v = vc((RK + h) * 1000);
        return {
          prompt: t`How fast does ${what} move? Treat the orbit as a circle. ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km)`,
          answer: v / 1000, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(GM_EARTH / (h * 1000)) / 1000, feedback: 'r is measured from Earth’s centre: R + h.' }, { value: Math.sqrt((2 * GM_EARTH) / ((RK + h) * 1000)) / 1000, feedback: t`That is the escape speed. A circular orbit needs $\sqrt{GM/r}$, $1/\sqrt2$ of it.` }],
          hints: [t`Gravity provides the centripetal force: $\dfrac{GMm}{r^2} = \dfrac{mv^2}{r}$, so $v = \sqrt{GM/r}$.`, t`$r = (6371 + ${h})$ km in metres.`],
          teach: 'A circular orbit at radius r needs v = √(GM/r): lower orbits are faster.',
          explain: t`$v = \sqrt{\dfrac{3.986\times10^{14}}{${tex((RK + h) * 1000, 5)}}} = ${s3(v / 1000)}$ km/s — about ${Math.round((v * 3.6) / 100) * 100} km/h.`,
          visual: earthOrbits([RK + h], [], 'The Earth and the orbit, to scale: low Earth orbits skim just above the surface.'),
        };
      },
    }),
    num({
      id: 'period', difficulty: 2,
      gen(r) {
        const [what, h] = r.pick([['a polar weather satellite 830 km up', 830], ['a satellite 2000 km up', 2000], ['an Iridium satellite 780 km up', 780], ['the ISS, 420 km up', 420]]);
        const T = Tc((RK + h) * 1000);
        return {
          prompt: t`What is the orbital period of ${what}, in minutes? (A circular orbit; $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km.)`,
          answer: T / 60, units: 'min', tol: { rel: 0.01 },
          errors: [{ value: Tc(h * 1000) / 60, feedback: 'Use the distance from Earth’s centre, R + h, as the radius.' }, { value: T / 60 / (2 * Math.PI), feedback: t`You left out the $2\pi$: $T = 2\pi\sqrt{r^3/GM}$.` }],
          hints: [t`Kepler's third law: $T = 2\pi\sqrt{r^3/GM}$.`, t`$r = (6371 + ${h})\times10^{3}$ m; divide the answer by 60 for minutes.`],
          teach: 'Kepler’s third law gives the period from the size: T = 2π√(r³/GM).',
          explain: t`$T = 2\pi\sqrt{\dfrac{(${tex((RK + h) * 1000, 5)})^3}{3.986\times10^{14}}} = ${s3(T)}$ s $= ${s3(T / 60)}$ min.`,
          visual: earthOrbits([RK + h], [], 'The Earth and the orbit, to scale.'),
        };
      },
    }),
    mcq({
      id: 'same-orbit', difficulty: 2,
      prompt: 'A 420-tonne space station and a 2 kg experiment are released side by side, at the same speed, in the same circular orbit. What happens next?',
      choices: ['They stay side by side: the orbit does not depend on the orbiting mass', 'The station falls behind: it is heavier, so gravity slows it more', 'The experiment drifts off: it is too light to be held in orbit', 'The station sinks into a lower orbit, pulled harder by gravity'],
      answer: 0,
      why: {
        1: t`The station is pulled harder, but it also has more inertia: $a = GM/r^2$ for both.`,
        2: t`A lighter body is pulled less, by exactly the factor that makes its acceleration the same: nothing is "too light" to orbit.`,
        3: t`A larger pull on a larger mass gives the same acceleration; the path depends only on position and velocity.`,
      },
      hints: [t`Find each body's acceleration: $a = F/m = (GMm/r^2)/m$.`],
      teach: 'An orbit depends on the central mass, the position and the velocity — never on the orbiting body’s own mass.',
      explain: t`Both accelerate at $GM/r^2$, so with the same starting position and velocity they trace the same path. That is also why everything inside the station floats: crew, spanners and station are all in the same orbit.`,
      visual: keplerPicture('iss', { t: 0.15, sectors: 0, caption: 'The ISS’s orbit around Earth, to scale.' }),
    }),
    num({
      id: 'weigh-jupiter', difficulty: 2,
      gen(r) {
        const [name, ak, Td] = r.pick(MOONS);
        const a = ak * 1000, T = Td * 86400, M = (4 * Math.PI ** 2 * a ** 3) / (G * T * T);
        return {
          prompt: t`Jupiter's moon ${name} orbits ${ak.toLocaleString('en-US')} km from Jupiter's centre, once every ${Td} days, on a nearly circular path. What is Jupiter's mass? ($G = 6.674\times10^{-11}$ SI)`,
          answer: M, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: (4 * Math.PI ** 2 * a ** 3) / (G * Td * Td), feedback: 'Convert the period to seconds.' }, { value: (4 * Math.PI ** 2 * ak ** 3) / (G * T * T), feedback: 'Convert the distance to metres before cubing it.' }],
          hints: [t`Rearrange $T^2 = 4\pi^2 a^3/(GM)$: $M = \dfrac{4\pi^2 a^3}{GT^2}$.`, t`$a = ${tex(a, 4)}$ m and $T = ${Td}\times86\,400$ s.`],
          teach: 'Kepler’s third law weighs the central body: M = 4π²a³/(GT²) — the moon’s own mass drops out.',
          explain: t`$M = \dfrac{4\pi^2(${tex(a, 4)})^3}{(6.674\times10^{-11})(${tex(T, 4)})^2} = ${tex(M)}$ kg — 318 Earth masses. Every Galilean moon gives the same answer; that is how Jupiter was first weighed.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2.6e6, 2.6e6], y: [-1.95e6, 1.95e6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
              shade: [{ fn: 'sqrt(max(0, 4.8875e9 - x^2))', lower: '-sqrt(max(0, 4.8875e9 - x^2))', from: -69911, to: 69911, color: 'warn', alpha: 0.6 }],
              curves: MOONS.map(([n, ak2]) => ({ param: [`${ak2}*cos(t)`, `${ak2}*sin(t)`], t: [0, 6.2832], color: n === name ? 'gold' : 'ink4', width: n === name ? 2 : 1, dash: n !== name })),
              points: [{ x: r4(ak * Math.cos(0.6)), y: r4(ak * Math.sin(0.6)), color: 'gold', r: 4.5, label: name }],
            },
            caption: 'Jupiter (orange, to scale) and the orbits of its four large moons, seen from above.',
          },
        };
      },
    }),
    num({
      id: 'planet-periods', difficulty: 2,
      gen(r) {
        const [name, a] = r.pick([['Mars', 1.5237], ['Jupiter', 5.2029], ['Saturn', 9.537], ['Neptune', 30.07]]);
        return {
          prompt: t`For orbits around the Sun, Kepler's third law takes a neat form in years and astronomical units (1 AU = Earth's average distance from the Sun): $T^2 = a^3$. ${name}'s semi-major axis is ${a} AU. What is its orbital period, in years?`,
          answer: a ** 1.5, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: a ** 2 / 1, feedback: t`$T^2 = a^3$ means $T = a^{3/2}$, not $a^2$.` }, { value: a ** (2 / 3), feedback: t`The other way round: $T = a^{3/2}$; a larger orbit has a longer period.` }],
          hints: [t`$T = a^{3/2} = a\sqrt a$.`],
          teach: 'In years and AU, T² = a³ for anything orbiting the Sun — because Earth (1 AU, 1 year) fixes the constant.',
          explain: t`$T = ${a}^{3/2} = ${s3(a ** 1.5)}$ years. (Measured: ${PLANETS.find((p) => p[0] === name)[2]} years.)`,
          visual: keplerLog(name),
        };
      },
    }),
    mcq({
      id: 'fastest', difficulty: 1,
      prompt: 'Where along its orbit does Halley’s comet move fastest?',
      choices: ['At perihelion, closest to the Sun', 'At aphelion, farthest from the Sun', 'Halfway between, where it is moving most directly toward the Sun', 'Everywhere at the same speed'],
      answer: 0,
      why: {
        1: 'At aphelion it is slowest: there r is largest, and r × v is fixed.',
        2: 'It speeds up all the way in, so it is fastest at the very closest point.',
        3: 'Only circular orbits have a constant speed; Halley’s is a long ellipse (e = 0.967).',
      },
      hints: ['Equal areas in equal times: near the Sun, a sector of a given area must be short and wide.'],
      teach: 'Kepler’s second law: an orbiting body moves fastest where it is closest to the central mass.',
      explain: t`With $r\,v_\perp$ constant, the speed is greatest where $r$ is least: at perihelion Halley's comet moves at about 55 km/s, at aphelion under 1 km/s.`,
      visual: keplerPicture('halley', { t: 0.3, sectors: 0, caption: 'Halley’s comet’s orbit, to scale (the Sun is a dot).' }),
    }),
    num({
      id: 'closest', difficulty: 2,
      gen(r) {
        const [name, a, e, unit, preset] = r.pick([['Mercury', 0.3871, 0.2056, 'AU', 'mercury'], ['Halley’s comet', 17.83, 0.967, 'AU', 'halley'], ['Earth', 1, 0.0167, 'AU', 'earth'], ['the Moon', 384400, 0.0549, 'km', 'moon']]);
        const rp = a * (1 - e), centre = preset === 'moon' ? 'Earth' : 'the Sun';
        return {
          prompt: t`${name[0].toUpperCase() + name.slice(1)}'s orbit around ${centre} has a semi-major axis of ${a.toLocaleString('en-US')} ${unit} and an eccentricity of ${e}. How close does it come to ${centre} (centre to centre), in ${unit}?`,
          answer: rp, units: unit, tol: { rel: 0.01 },
          errors: [{ value: a * (1 + e), feedback: 'That is the farthest distance, a(1 + e). The closest is a(1 − e).' }],
          hints: [t`The focus is $ae$ from the ellipse's centre, so the closest point is $a - ae = a(1 - e)$ from it.`],
          teach: 'An ellipse’s closest and farthest distances from the focus are a(1 − e) and a(1 + e).',
          explain: t`$r_\text{min} = a(1 - e) = ${a.toLocaleString('en-US').replace(/,/g, '{,}')}(1 - ${e}) = ${s3(rp)}$ ${unit}; the farthest is $a(1 + e) = ${s3(a * (1 + e))}$ ${unit}.`,
          visual: keplerPicture(preset, { t: 0.3, sectors: 0, caption: `The orbit of ${name}, to scale.` }),
        };
      },
    }),
    num({
      id: 'raise-orbit', difficulty: 3,
      gen(r) {
        const m = r.pick([1000, 2000, 4000]), h1 = 300;
        const r1 = (RK + h1) * 1000, r2 = 42164e3, dE = ((GM_EARTH * m) / 2) * (1 / r1 - 1 / r2);
        return {
          prompt: t`How much energy must be added to move a ${m.toLocaleString('en-US')} kg satellite from a circular orbit 300 km up to the geostationary orbit, $4.2164\times10^{7}$ m from Earth's centre? Give the answer in gigajoules. ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km)`,
          answer: dE / 1e9, units: 'GJ', tol: { rel: 0.01 },
          errors: [{ value: (GM_EARTH * m * (1 / r1 - 1 / r2)) / 1e9, feedback: 'That is the rise in potential energy alone. The satellite also slows down — its kinetic energy falls by half that much.' }],
          hints: [
            t`In a circular orbit $K = \dfrac{GMm}{2r}$ and $U = -\dfrac{GMm}{r}$, so the total is $E = -\dfrac{GMm}{2r}$.`,
            t`$\Delta E = E_2 - E_1 = \dfrac{GMm}{2}\left(\dfrac1{r_1} - \dfrac1{r_2}\right)$, with $r_1 = 6671$ km.`,
          ],
          teach: 'A circular orbit has total energy −GMm/2r: raising the orbit adds energy, even though the satellite ends up slower.',
          explain: t`$\Delta E = \dfrac{(3.986\times10^{14})(${m})}{2}\left(\dfrac{1}{6.671\times10^{6}} - \dfrac{1}{4.2164\times10^{7}}\right) = ${s3(dE / 1e9)}$ GJ. Its speed drops from ${s3(vc(r1) / 1000)} to ${s3(vc(r2) / 1000)} km/s: the potential energy rises by twice what the kinetic energy loses.`,
          visual: earthOrbits([RK + h1, 42164], ['300 km', 'geostationary'], 'The two orbits and the Earth, to scale.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sgra', difficulty: 3, transfer: true,
      prompt: t`Since 1992, astronomers have tracked the star S2 round the dark centre of our galaxy, Sagittarius A*. Its orbit has a semi-major axis of about 1030 AU and a period of 16.05 years. Using Kepler's third law in years, AU and solar masses, $T^2 = a^3/M$, what mass does the orbit imply? Give it in millions of solar masses.`,
      answer: 1030 ** 3 / 16.05 ** 2 / 1e6, tol: { rel: 0.01 },
      errors: [{ value: 1030 ** 2 / 16.05 ** 2 / 1e6, feedback: t`Cube the semi-major axis: $M = a^3/T^2$.` }],
      hints: [t`Rearrange: $M = a^3/T^2$ in solar masses (with $a$ in AU and $T$ in years — for Earth, $1^3/1^2 = 1$ solar mass).`, t`$M = 1030^3/16.05^2$; divide by $10^6$.`],
      teach: 'A measured orbit weighs whatever it circles: four million suns, inside a region smaller than S2’s 120 AU closest approach — a supermassive black hole.',
      explain: t`$M = \dfrac{1030^3}{16.05^2} = ${s3(1030 ** 3 / 16.05 ** 2 / 1e6)}$ million solar masses. The GRAVITY collaboration's full fit gives about 4.3 million (the small difference comes from rounding $a$, and from the uncertain distance to the Galactic Centre used to turn S2's angular orbit into AU). So much mass in so small a region, giving out no light, is a black hole: this work shared the 2020 Nobel Prize in Physics.`,
      visual: keplerPicture('s2', { t: 0.03, caption: 'S2’s orbit around Sagittarius A*, to scale; it swings to within 120 AU of the black hole.' }),
    }),
    num({
      id: 'cp-gps', difficulty: 2, transfer: true,
      prompt: t`GPS satellites orbit 20 200 km above the ground in nearly circular orbits. What is their period, in hours? ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km)`,
      answer: Tc((RK + 20200) * 1000) / 3600, units: 'h', tol: { rel: 0.01 },
      errors: [{ value: Tc(20200e3) / 3600, feedback: 'Add Earth’s radius: r = 26 571 km.' }],
      hints: [t`$T = 2\pi\sqrt{r^3/GM}$ with $r = 26\,571$ km.`],
      teach: 'Kepler’s third law sets every satellite’s period from its orbit’s size.',
      explain: t`$T = 2\pi\sqrt{\dfrac{(2.6571\times10^{7})^3}{3.986\times10^{14}}} = ${s3(Tc((RK + 20200) * 1000))}$ s $= ${s3(Tc((RK + 20200) * 1000) / 3600)}$ h: two orbits a day — chosen so the pattern of satellites over the ground repeats daily.`,
      visual: keplerPicture('gps', { t: 0.1, caption: 'A GPS orbit and the Earth, to scale.' }),
    }),
    mcq({
      id: 'cp-spanner', difficulty: 2,
      prompt: 'An astronaut inside the ISS lets go of a spanner in the middle of the cabin. What does the spanner do, compared with the station around it?',
      choices: ['It floats where it was released, because it follows the same orbit as the station', 'It slowly falls to the floor, because gravity is still about 90% of its value on the ground', 'It drifts toward the back of the cabin, left behind because it is lighter', 'It floats away, because there is no gravity in orbit'],
      answer: 0,
      why: {
        1: 'Gravity is strong there — but the floor is falling at exactly the same rate as the spanner.',
        2: 'Lighter bodies orbit just like heavy ones; the orbit does not depend on the orbiting mass.',
        3: 'There is plenty of gravity in orbit: it is what keeps the station and the spanner going round.',
      },
      hints: ['Does the spanner’s orbit depend on its mass?', 'What is the station itself doing?'],
      teach: 'Everything in a freely falling spacecraft follows the same orbit, so objects float relative to each other.',
      explain: t`Spanner and station accelerate together at $GM/r^2$: both are in free fall, on the same orbit. Over many minutes, tiny effects — air drag on the station, and tides across its length — make loose objects drift slowly.`,
      visual: keplerPicture('iss', { t: 0.4, sectors: 0, caption: 'The station’s orbit around Earth, to scale.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §13.4 Satellite Orbits and Energy and §13.5 Kepler’s Laws of Planetary Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/13-5-keplers-laws-of-planetary-motion' },
    { label: 'GRAVITY Collaboration (2020), Detection of the Schwarzschild precession in the orbit of the star S2', url: 'https://arxiv.org/abs/2004.07187' },
    { label: 'NASA/JPL Solar System Dynamics: planetary and satellite orbits', url: 'https://ssd.jpl.nasa.gov/' },
  ],
});
