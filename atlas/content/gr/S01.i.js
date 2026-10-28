// Newton’s gravity and the 43 arcseconds it cannot explain — Intuition Mode.
// Every number a learner reads is computed here from the constants below.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { spacetimeSketch } from './_foundations.js';

const t = String.raw;

const C = 299792458;                 // m/s, exact
const GM_SUN = 1.32712440018e20;     // m³/s², IAU nominal
const R_SUN = 6.957e8;               // m, IAU nominal
const GM_EARTH = 3.986004418e14;     // m³/s²
const R_EARTH = 6.371e6;             // m, mean radius
const AU = 1.495978707e11;           // m
const ARCSEC = Math.PI / 648000;     // rad

// Mercury (semi-major axis, eccentricity, orbital period in days)
const MERC = { a: 5.7909e10, e: 0.20563, P: 87.969 };
const M_SUN_LEN = GM_SUN / C ** 2;                                             // GM/c² ≈ 1.48 km
const MERC_PER_ORBIT = 6 * Math.PI * M_SUN_LEN / (MERC.a * (1 - MERC.e ** 2)) / ARCSEC;   // ″ per orbit (GR)
const ORBITS_PER_CENTURY = 36525 / MERC.P;
const MERC_PER_CENTURY = MERC_PER_ORBIT * ORBITS_PER_CENTURY;                  // ≈ 42.98″
const MERC_A_IN_M = MERC.a / M_SUN_LEN;                                        // ≈ 3.9 × 10⁷

// the exaggerated rosette drawn in the budget question: r = 1/(1 + e cos kθ)
const ROSETTE_K = 0.92;
const ROSETTE_DEG = 360 * (1 / ROSETTE_K - 1);                                 // turn of the closest point per orbit
const ROSETTE_FACTOR = ROSETTE_DEG * 3600 / MERC_PER_ORBIT;
const ROSETTE = {
  type: 'graph',
  params: { x: [-1.7, 1.7], y: [-1.6, 1.6], equal: true, axes: false, xlabel: '', ylabel: '', curves: [{ polar: `0.75/(1 + 0.45*cos(${ROSETTE_K}*theta))`, theta: [0, `6*pi/${ROSETTE_K}`], color: 'accent', width: 1.6 }], points: [{ x: 0, y: 0, color: 'gold', r: 6, label: 'Sun' }] },
  caption: t`A sketch of an orbit whose closest point turns forward on every lap — here by ${Math.round(ROSETTE_DEG)}° per orbit, about ${fmt(ROSETTE_FACTOR / 1e6, 1)} million times Mercury’s unexplained $${fmt(MERC_PER_ORBIT, 2)}''$ per orbit.`,
};

// bodies: name, the phrase used in prompts, GM (m³/s²), radius (m)
const BODIES = [
  { name: 'Earth', where: 'the surface of the Earth', GM: GM_EARTH, R: R_EARTH },
  { name: 'the Moon', where: 'the surface of the Moon', GM: 4.9048695e12, R: 1.7374e6 },
  { name: 'Mars', where: 'the surface of Mars', GM: 4.282837e13, R: 3.3895e6 },
  { name: 'Jupiter', where: 'Jupiter’s cloud tops', GM: 1.26686534e17, R: 6.9911e7 },
];

// a number with thousands separators, safe inside $…$ (KaTeX spaces a bare comma)
const grp = (x) => x.toLocaleString('en-US').replace(/,/g, '{,}');
const vEsc = (GM, R) => Math.sqrt(2 * GM / R);
// the compactness ladder GM/(Rc²) on a logarithmic scale, labelled by hand
const LADDER = [['Earth', GM_EARTH, R_EARTH], ['Sun', GM_SUN, R_SUN], ['white dwarf', GM_SUN, 7e6], ['neutron star', 1.4 * GM_SUN, 12e3], ['2 M☉ neutron star', 2 * GM_SUN, 12.5e3]]
  .map(([label, GM, R], i) => ({ label, k: GM / (R * C * C), y: i + 1 }));
const SUPER = { '-9': '⁻⁹', '-6': '⁻⁶', '-3': '⁻³' };
const ladderVisual = (highlight) => ({
  type: 'graph',
  params: {
    x: [-10.5, 2.6], y: [-0.4, 6], axes: false, xlabel: '', ylabel: '',
    hlines: [{ y: 0, color: 'ink3' }],
    vlines: [{ x: Math.log10(0.5), label: 'black hole (0.5)', color: 'warn' }],
    points: [
      ...LADDER.map((p) => ({ x: Math.log10(p.k), y: p.y, label: p.label, color: p.label === highlight ? 'gold' : 'accent2' })),
      ...[-9, -6, -3, 0].map((e) => ({ x: e, y: 0, label: e === 0 ? '1' : `10${SUPER[e]}`, color: 'ink3', r: 2.5 })),
    ],
  },
  caption: 'The compactness ladder, GM/(Rc²), on a logarithmic scale: each step to the right is ten times more compact. Newton’s theory is superb on the left and fails on the right.',
});
const rDark = (GM) => 2 * GM / C ** 2;
const KM_PER_MSUN = rDark(GM_SUN) / 1000;                                      // ≈ 2.95 km
const SHRINK = Math.round(R_SUN / rDark(GM_SUN) / 1000) * 1000;                // ≈ 236,000

// the universal escape-speed curve: v_esc/c = √(r_s/R), with r_s = 2GM/c²
const escapeGraph = (extra = {}) => ({
  type: 'graph',
  params: {
    x: [0, 10], y: [0, 1.6], xlabel: 'R / (2GM/c²)', ylabel: 'escape speed / c',
    curves: [{ fn: 'sqrt(1/x)', color: 'accent', domain: [0.39, 10] }],
    hlines: [{ y: 1, label: 'speed of light', color: 'warn' }],
    vlines: [{ x: 1, label: 'R = 2GM/c²', color: 'ink3' }],
    ...extra,
  },
  caption: t`Newton’s escape speed for any mass, with the radius measured in units of $2GM/c^2$. Where the curve crosses the line, Newton would need light-speed launches.`,
});

export default lesson({
  id: 'gr.S01.i',
  title: 'Newton’s gravity and the 43 arcseconds it cannot explain',
  minutes: 8, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`Newton’s law says every two masses attract, with a force that falls off as the square of the distance between them. For two centuries it predicted planets, comets and tides superbly, and it still steers almost every spacecraft. But in 1859 Urbain Le Verrier found something that would not fit: **the point of Mercury’s orbit closest to the Sun creeps forward faster than Newton allows**. Modern measurements put the excess at 43 arcseconds per century (an arcsecond, $1''$, is $1/3600$ of a degree).

Add two more cracks — Newton’s force acts **instantly** across any distance, and his theory has one universal time, so it says **nothing about clocks** — and you have the gaps Einstein’s theory fills. In 1915 general relativity predicted Mercury’s extra $43''$ per century, all of it.`,
  equation: t`F = \frac{G M m}{r^2}`,
  symbols: [
    { tex: 'F', text: 'the attractive force on each of the two bodies, in newtons (N), pointing along the line between their centres' },
    { tex: 'G', text: t`Newton’s gravitational constant, $6.674\times10^{-11}\ \text{N·m}^2/\text{kg}^2$ — the same everywhere` },
    { tex: 'M', text: 'the larger mass (the Sun, the Earth), in kilograms (kg)' },
    { tex: 'm', text: t`the smaller mass being pulled, in kg; it cancels when you find the acceleration, $g = F/m = GM/r^2$` },
    { tex: 'r', text: 'the distance between the two centres, in metres (m)' },
  ],
  why: 'Every test of general relativity is a place where Newton’s law starts to fail — and everywhere else Einstein’s theory must hand back Newton’s answers, which it does.',
  visual: {
    type: 'orbit',
    title: 'Newton’s orbits close; Einstein’s turn',
    lead: t`Start with **Newton**: the planet retraces the same ellipse forever. Then switch *Gravity* to **Einstein** and watch the closest point (the *periapsis*) move forward on every lap. This orbit is drawn very close to its central mass, where the effect is enormous.`,
    tasks: ['Switch to Einstein and read the periapsis advance per orbit.', 'Move the whole orbit outward (r₀ = 40M, L = 6M): the advance shrinks — far from the mass, Einstein agrees with Newton.', 'Lower L until the orbit plunges — something Newton never predicts.'],
    params: { mode: 'newton', r0: 30, L: 4.5, compare: true },
    caption: t`Distances are in units of $M = GM/c^2$ (${fmt(M_SUN_LEN / 1000, 3)} km for the Sun). Mercury orbits about $${tex(MERC_A_IN_M, 2)}\,M$ from the Sun, where the same effect is only $${fmt(MERC_PER_ORBIT, 3)}''$ per orbit — this picture exaggerates it millions of times. The right panel is a graph of energy against $r$, not a picture of space.`,
  },
  example: {
    prompt: t`In 1783 John Michell realised that, by Newton’s gravity, a star massive and compact enough would hold back its own light. Find the Sun’s escape speed today, then the radius a Sun-mass “dark star” would need. Use $GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $R_\odot = 6.957\times10^{8}$ m and $c = 2.998\times10^{8}$ m/s.`,
    visual: escapeGraph(),
    steps: [
      { label: 'Escape condition', text: t`To coast away forever, the kinetic energy must pay back the gravitational energy: $\tfrac12 mv^2 = GMm/R$. The mass $m$ cancels, so a rock, a rocket and (Michell guessed) a particle of light all need the same speed: $v_\text{esc} = \sqrt{2GM/R}$.` },
      { label: 'The Sun today', text: t`$v_\text{esc} = \sqrt{\dfrac{2\times1.327\times10^{20}}{6.957\times10^{8}}} = ${fmt(vEsc(GM_SUN, R_SUN) / 1000, 3)}$ km/s — only ${fmt(100 * vEsc(GM_SUN, R_SUN) / C, 2)}% of the speed of light.` },
      { label: 'Set it equal to c', text: t`$c = \sqrt{2GM/R}$ gives $R = \dfrac{2GM}{c^2} = \dfrac{2\times1.327\times10^{20}}{(2.998\times10^{8})^2} = ${fmt(rDark(GM_SUN) / 1000, 3)}$ km.` },
      { label: 'Sense check — and a warning', text: t`The Sun would have to shrink about ${SHRINK.toLocaleString('en-US')}-fold. Einstein’s theory puts a black hole’s horizon at the same $2GM/c^2$, but the match is a coincidence of the arithmetic: Michell’s light climbs out and falls back, while from inside a real horizon nothing gets out at all, and light still moves at $c$ wherever you measure it.` },
    ],
    answer: t`$v_\text{esc} \approx ${fmt(vEsc(GM_SUN, R_SUN) / 1000, 3)}$ km/s today; Michell’s radius $2GM/c^2 \approx ${fmt(rDark(GM_SUN) / 1000, 3)}$ km.`,
  },
  practice: [
    num({
      id: 'surface-g', difficulty: 1,
      gen(r) {
        const B = r.pick(BODIES);
        const g = B.GM / B.R ** 2;
        return {
          prompt: t`Newton’s law gives the acceleration of anything falling freely at distance $r$ from a mass $M$: $g = GM/r^2$. Find $g$ at ${B.where}, where $GM = ${tex(B.GM, 4)}\ \text{m}^3/\text{s}^2$ and $r = ${grp(B.R / 1000)}$ km. (Ignore the planet’s spin.)`,
          answer: g, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: B.GM / B.R, feedback: 'Divide by r squared, not by r.' }, { value: B.GM / (B.R / 1000) ** 2, feedback: 'Convert the radius to metres before squaring it.' }],
          hints: ['Convert the radius to metres first.', t`$g = GM/r^2 = ${tex(B.GM, 4)} / (${tex(B.R, 5)})^2$.`],
          teach: t`Newton’s gravity gives every falling object the same acceleration $g = GM/r^2$, whatever its own mass.`,
          explain: t`$g = \dfrac{${tex(B.GM, 4)}}{(${tex(B.R, 5)})^2} = ${fmt(g, 3)}\ \text{m/s}^2$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 4], y: [0, g * 1.2], xlabel: 'r / R (distance in radii)', ylabel: 'g (m/s²)', constants: { gs: g }, curves: [{ fn: 'gs/x^2', color: 'accent', domain: [1, 4] }], points: [{ x: 1, y: 'gs', color: 'gold', label: 'surface' }] },
            caption: t`Outside the body, $g$ falls as $1/r^2$: at twice the distance it is a quarter as strong. The inside is not drawn.`,
          },
        };
      },
    }),
    num({
      id: 'in-orbit', difficulty: 2,
      gen(r) {
        const [what, h, short] = r.pick([['the International Space Station', 400, 'ISS'], ['a Starlink satellite', 550, 'Starlink'], ['a polar-orbiting weather satellite', 824, 'weather satellite'], ['China’s Tiangong space station', 390, 'Tiangong']]);
        const R = R_EARTH / 1000;
        const f = (R / (R + h)) ** 2;
        return {
          prompt: t`${what[0].toUpperCase() + what.slice(1)} orbits about ${h} km above the ground. Earth’s mean radius is ${R.toLocaleString('en-US')} km. What fraction of its surface value does Earth’s gravitational acceleration have up there? (Give a decimal, such as 0.5.)`,
          answer: f, tol: { rel: 0.005 },
          errors: [{ value: R / (R + h), feedback: 'Gravity falls as the square of the distance: square the ratio of the radii.' }, { value: 0, feedback: 'There is plenty of gravity in orbit. Astronauts float because they and their station are falling together, not because gravity has switched off.' }],
          hints: ['Distances in Newton’s law are measured from Earth’s centre, not from the ground.', t`The fraction is $\left(\dfrac{R}{R + h}\right)^2 = \left(\dfrac{${R}}{${R + h}}\right)^2$.`],
          teach: 'In low orbit gravity is still most of its surface value; orbiting means falling around the Earth, not escaping its pull.',
          explain: t`$\left(\dfrac{${R}}{${R + h}}\right)^2 = ${fmt(f, 3)}$ — about ${Math.round(100 * f)}% of surface gravity, or $${fmt(f * GM_EARTH / R_EARTH ** 2, 3)}\ \text{m/s}^2$. Astronauts feel weightless because they fall freely, along with everything around them.`,
          visual: {
            type: 'graph',
            params: { x: [0, 1000], y: [0, 1.1], xlabel: 'height above the ground (km)', ylabel: 'g / g at the ground', curves: [{ fn: `(${R}/(${R} + x))^2`, color: 'accent' }], points: [{ x: h, y: f, color: 'gold', label: short }] },
            caption: 'Earth’s gravity against height, from Newton’s inverse-square law (a round, non-spinning Earth).',
          },
        };
      },
    }),
    num({
      id: 'escape', difficulty: 2,
      gen(r) {
        const B = r.pick(BODIES);
        const v = vEsc(B.GM, B.R);
        return {
          prompt: t`Escape speed is the launch speed that lets an unpowered object coast away forever: set $\tfrac12 v^2 = GM/R$. Find it for ${B.where} ($GM = ${tex(B.GM, 4)}\ \text{m}^3/\text{s}^2$, $R = ${grp(B.R / 1000)}$ km), ignoring air.`,
          answer: v / 1000, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(B.GM / B.R) / 1000, feedback: 'That is the speed of a circular orbit skimming the surface. Escaping needs √2 times more.' }],
          hints: [t`Solve for $v$: $v = \sqrt{2GM/R}$, with $R$ in metres.`, t`$v = \sqrt{2\times${tex(B.GM, 4)}/${tex(B.R, 5)}}$ m/s; divide by 1000 for km/s.`],
          teach: t`Escape speed $\sqrt{2GM/R}$ depends only on the ratio $M/R$ — the same combination that will measure how strong gravity is in Einstein’s theory.`,
          explain: t`$v_\text{esc} = \sqrt{2\times${tex(B.GM, 4)}/${tex(B.R, 5)}} = ${fmt(v / 1000, 3)}$ km/s. A circular orbit at the same radius needs $1/\sqrt2$ of that, ${fmt(v / 1000 / Math.SQRT2, 3)} km/s.`,
          visual: {
            type: 'graph',
            params: { x: [0, 6], y: [0, v / 1000 * 1.25], xlabel: 'launch distance from the centre, r / R', ylabel: 'escape speed (km/s)', constants: { ve: v / 1000 }, curves: [{ fn: 've*sqrt(1/x)', color: 'accent', domain: [1, 6] }], points: [{ x: 1, y: 've', color: 'gold', label: 'surface' }] },
            caption: t`Escape speed $\sqrt{2GM/r}$ falls slowly with distance: launching from four radii out needs half the surface value.`,
          },
        };
      },
    }),
    num({
      id: 'dark-star', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 5, 8, 10, 20]);
        const R = rDark(n * GM_SUN);
        return {
          prompt: t`Apply Michell’s idea: how small must a star of ${n === 1 ? 'one solar mass' : `${n} solar masses`} be for Newton’s escape speed to equal the speed of light? Use $GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and $c = 2.998\times10^8$ m/s, and give the radius in kilometres.`,
          answer: R / 1000, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: n * GM_SUN / C ** 2 / 1000, feedback: 'Start from ½v² = GM/R with v = c: the radius is 2GM/c², with a factor of 2.' }],
          hints: [t`Set $\tfrac12 c^2 = GM/R$ and solve for $R$.`, t`$R = 2GM/c^2$, with $GM = ${n}\times1.327\times10^{20}\ \text{m}^3/\text{s}^2$.`],
          teach: t`Newton’s “dark star” radius $2GM/c^2$ — ${fmt(KM_PER_MSUN, 3)} km per solar mass — equals the black-hole horizon radius of general relativity, though the physics behind the two is different.`,
          explain: t`$R = \dfrac{2\times${n === 1 ? '' : `${n}\\times`}1.327\times10^{20}}{(2.998\times10^8)^2} = ${fmt(R / 1000, 3)}$ km — ${fmt(KM_PER_MSUN, 3)} km for every solar mass. In general relativity the same radius marks a black hole’s horizon.`,
          visual: escapeGraph(),
        };
      },
    }),
    num({
      id: 'compactness', difficulty: 2,
      gen(r) {
        const [what, n, Rkm, rung] = r.pick([['the Sun', 1, R_SUN / 1000, 'Sun'], ['a white dwarf of 1.0 solar mass and radius 7000 km', 1, 7000, 'white dwarf'], ['a neutron star of 1.4 solar masses and radius 12 km', 1.4, 12, 'neutron star'], ['a neutron star of 2.0 solar masses and radius 12.5 km', 2, 12.5, '2 M☉ neutron star']]);
        const k = n * GM_SUN / (Rkm * 1000 * C ** 2);
        return {
          prompt: t`How strongly gravity bends the rules depends on the dimensionless number $GM/(Rc^2)$. Compute it for ${what}${what === 'the Sun' ? ` (radius ${(R_SUN / 1000).toLocaleString('en-US')} km)` : ''}, with $GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and $c = 2.998\times10^8$ m/s.`,
          answer: k, tol: { rel: 0.01 },
          errors: [{ value: n * GM_SUN / (Rkm * 1000 * C), feedback: 'Divide by c squared, not c.' }, { value: n * GM_SUN / (Rkm * C ** 2), feedback: 'Put the radius in metres.' }],
          hints: ['Convert the radius to metres and multiply GM☉ by the number of solar masses.', t`$\dfrac{GM}{Rc^2} = \dfrac{${n}\times1.327\times10^{20}}{${tex(Rkm * 1000, 4)}\times(2.998\times10^8)^2}$.`],
          teach: t`Corrections to Newton grow with $GM/(Rc^2)$: about $10^{-9}$ at Earth, $10^{-6}$ at the Sun, and 0.2 at a neutron star.`,
          explain: t`$GM/(Rc^2) = ${tex(k, 3)}$. For comparison: Earth $${tex(GM_EARTH / (R_EARTH * C * C), 2)}$, the Sun $${tex(GM_SUN / (R_SUN * C * C), 2)}$, a neutron star about 0.2. Newton is superb when this number is tiny; at 0.5 the body’s radius would equal $2GM/c^2$, the horizon radius of a black hole.`,
          visual: ladderVisual(rung),
        };
      },
    }),
    num({
      id: 'mercury-residual', difficulty: 2,
      prompt: t`Seen from Earth, Mercury’s closest point to the Sun advances about $5600''$ per century. About $5025''$ of that is not Mercury at all: Earth’s axis slowly wobbles (the precession of the equinoxes), dragging the reference directions astronomers measure from. The pulls of the other planets, computed with Newton’s law, account for another $532''$. How much is left unexplained by Newton, per century?`,
      answer: 43, units: 'arcsec', tol: { rel: 0.01 },
      errors: [{ value: 575, feedback: 'You removed the wobble of Earth’s axis but not the other planets’ pulls.' }, { value: 5068, feedback: 'Remove both: the 5025″ wobble of Earth’s reference frame and the 532″ from the planets.' }],
      hints: ['Subtract both explained parts from the observed total.', t`$5600'' - 5025'' - 532''$.`],
      teach: 'General relativity explains a residual of under 1% of Mercury’s observed perihelion advance — not the whole advance.',
      explain: t`$5600'' - 5025'' - 532'' = 43''$ per century. Einstein’s theory predicts $${fmt(MERC_PER_CENTURY, 4)}''$ — the whole anomaly. Per orbit (about ${Math.round(ORBITS_PER_CENTURY)} per century) that is only $${fmt(MERC_PER_ORBIT, 3)}''$.`,
      solution: t`The total and its parts are the classic budget (Clemence 1947); the leftover was first found by Le Verrier in 1859. Astronomers hunted for an unseen planet, “Vulcan”, inside Mercury’s orbit to explain it; there is none.`,
      visual: ROSETTE,
    }),
    mcq({
      id: 'instant', difficulty: 2,
      prompt: t`Newton’s law $F = GMm/r^2$ uses the distance between the two bodies *right now*. Suppose the Sun’s mass could suddenly change. According to Newton’s formula, when would Earth’s orbit respond?`,
      choices: ['Instantly, across the whole 150 million km', 'After about 8.3 minutes, the time light takes to cross that distance', 'After one year, when Earth completes its orbit', 'Never: once an orbit is set, it cannot change'],
      answer: 0,
      why: {
        1: 'That is general relativity’s answer, and it is what is observed — but it is not in Newton’s formula, which has no delay built in.',
        2: 'The force changes the moment r or M does; the orbit starts to respond at once.',
        3: 'A changed force changes the acceleration, and with it the orbit.',
      },
      hints: ['Look for a time delay — or a speed — anywhere in F = GMm/r².'],
      teach: 'Newton’s gravity acts instantly at any distance, which clashes with relativity’s rule that no influence outruns light.',
      explain: t`Newton’s force depends only on the present positions, so it responds instantly — action at a distance. In general relativity, changes in gravity travel at $c$. In 2017 gravitational waves from a neutron-star merger about 130 million light-years away arrived 1.7 s before its gamma rays (which left a little after the merger), showing that gravity’s speed equals light’s to about one part in $10^{15}$.`,
      visual: spacetimeSketch({
        events: [[0, 0, 'the Sun changes'], [0, AU / C / 60, 'same instant'], [AU / C / 60, AU / C / 60, `${fmt(AU / C / 60, 2)} min later`], [13, AU / C / 60, 'Earth']],
        segments: [[-2, AU / C / 60, 14, AU / C / 60, 'accent2'], [0, 0, 0, AU / C / 60, 'bad', true], [0, 0, AU / C / 60, AU / C / 60, 'warn']],
        range: 12, xlabel: 'x (light-minutes)', ylabel: 't (minutes)',
        caption: 'Two candidates for when Earth (blue, standing still) could first respond: along the red horizontal line — the same instant — or along the 45° edge of the Sun’s light cone. Minutes up, light-minutes across.',
      }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sgra', difficulty: 2, transfer: true,
      gen(r) {
        const [what, n] = r.pick([['Sagittarius A*, the black hole at the centre of our galaxy, has a mass of 4.30 million Suns', 4.30e6], ['The black hole in the galaxy M87 has a mass of about 6.5 billion Suns', 6.5e9], ['The black hole in Cygnus X-1 has a mass of about 21 Suns', 21]]);
        const R = rDark(n * GM_SUN);
        return {
          prompt: t`${what}. Compute Michell’s radius $2GM/c^2$ for it, in kilometres. ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $c = 2.998\times10^8$ m/s.)`,
          answer: R / 1000, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: R / 2000, feedback: 'The radius is 2GM/c² — you left out the factor of 2.' }],
          hints: [t`Multiply $GM_\odot$ by the number of solar masses, then use $R = 2GM/c^2$.`, `One solar mass gives ${fmt(KM_PER_MSUN, 3)} km, and the radius grows in proportion to the mass.`],
          teach: t`The horizon radius $2GM/c^2$ grows in proportion to the mass: ${fmt(KM_PER_MSUN, 3)} km per solar mass.`,
          explain: t`$R = 2\times${tex(n, 3)}\times1.327\times10^{20}/(2.998\times10^8)^2 = ${tex(R / 1000, 3)}$ km${R / AU > 0.01 ? ` — about ${fmt(R / AU, 2)} AU (1 AU is the Earth–Sun distance)` : ''}. In general relativity this is the horizon radius, which is why Michell’s question still matters.`,
          visual: escapeGraph({ points: [{ x: 1, y: 1, color: 'gold', label: 'Michell’s radius' }] }),
        };
      },
    }),
    mcq({
      id: 'cp-mercury', difficulty: 2,
      prompt: 'Which statement about Mercury’s perihelion is right?',
      choices: [
        'General relativity accounts for the 43″ per century left after the wobble of Earth’s axis and the other planets’ pulls are removed',
        'General relativity explains all of the 5600″ per century that astronomers observe',
        'Newton’s theory explains Mercury exactly, once Venus and Jupiter are included',
        'The extra 43″ per century comes from an unseen planet inside Mercury’s orbit',
      ],
      answer: 0,
      why: { 1: 'Most of the 5600″ is the wobble of Earth’s own axis, and most of the rest is the other planets pulling — both fully explained by Newton.', 2: 'Including every planet still leaves 43″ per century unexplained — the anomaly Le Verrier found.', 3: 'Astronomers searched for that planet, “Vulcan”. It does not exist.' },
      hints: ['How big is the part Newton could not explain, compared with the total?'],
      teach: 'Einstein’s theory explains Mercury’s anomalous 43″ per century — less than 1% of the observed total.',
      explain: t`Of $5600''$ per century, $5025''$ is Earth’s axis wobbling and $532''$ is the other planets. General relativity predicts the remaining $${fmt(MERC_PER_CENTURY, 4)}''$, which matches the observed leftover.`,
      visual: ROSETTE,
    }),
    num({
      id: 'cp-neutron', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([1.4, 2.0]), Rkm = r.pick([11, 12, 13]);
        const f = Math.sqrt(2 * n * GM_SUN / (Rkm * 1000)) / C;
        return {
          prompt: t`A neutron star packs ${n} solar masses into a radius of ${Rkm} km. Use Newton’s escape speed $\sqrt{2GM/R}$ to find how fast something must leave its surface to escape, as a fraction of the speed of light. ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $c = 2.998\times10^8$ m/s.)`,
          answer: f, tol: { rel: 0.01 },
          errors: [{ value: f * f, feedback: 'Take the square root: v = √(2GM/R).' }, { value: f / Math.SQRT2, feedback: 'Escape speed has a 2 under the root: √(2GM/R).' }],
          hints: [t`$GM = ${n}\times1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and $R = ${Rkm}\times10^3$ m.`, 'Compute √(2GM/R) in m/s, then divide by c.'],
          teach: 'When Newton’s escape speed approaches the speed of light, Newton’s theory is being used far outside the range where it can be trusted.',
          explain: t`$v = \sqrt{2\times${n}\times1.327\times10^{20}/${Rkm}\times10^3} = ${tex(f * C, 3)}$ m/s $= ${fmt(f, 3)}c$. An object needing over half of light speed to escape is exactly where Newton’s theory breaks down — neutron stars are modelled with general relativity.`,
          visual: escapeGraph({ points: [{ x: 1 / (f * f), y: f, color: 'gold', label: 'this neutron star' }] }),
        };
      },
    }),
    mcq({
      id: 'cp-clocks', difficulty: 2, transfer: true,
      prompt: 'GPS satellites carry atomic clocks about 20,200 km above the ground. Left uncorrected, each would gain about 38 microseconds per day on clocks on the ground — enough to ruin navigation. What does Newton’s theory of gravity predict about this?',
      choices: [
        'Nothing: in Newton’s theory all clocks share one universal time, so gravity cannot change clock rates',
        'That weaker gravity up high makes the satellite clocks gain exactly 38 μs per day',
        'That the satellite clocks should lose time, not gain it',
        'That the effect is a delay in the radio signals, which Newton’s theory corrects',
      ],
      answer: 0,
      why: { 1: 'Newton’s theory has no link between gravity and the rate of time; that link is a prediction of Einstein’s theory.', 2: 'Newton’s theory predicts no clock effect at all, in either direction.', 3: 'Signal travel time is handled separately; the 38 μs per day is a real difference in how fast the clocks run.' },
      hints: ['Does time appear anywhere in Newton’s law of gravity?'],
      teach: 'Newton’s theory has one universal time, so it cannot account for gravity changing clock rates — one of its cracks.',
      explain: 'In Newton’s theory time is absolute: every clock, anywhere, runs at the same rate. The observed GPS offset — about +46 μs/day from weaker gravity aloft and −7 μs/day from the satellites’ speed — is predicted by relativity and is corrected for in every GPS satellite.',
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §13.1 and §13.3', url: 'https://openstax.org/books/university-physics-volume-1/pages/13-1-newtons-law-of-universal-gravitation' },
    { label: 'Clemence (1947), The relativity effect in planetary motions, Rev. Mod. Phys. 19, 361', url: 'https://doi.org/10.1103/RevModPhys.19.361' },
    { label: 'Will (2014), The confrontation between general relativity and experiment, Living Reviews', url: 'https://arxiv.org/abs/1403.7377' },
    { label: 'LIGO–Virgo et al. (2017), GW170817 and GRB 170817A', url: 'https://arxiv.org/abs/1710.05834' },
  ],
});
