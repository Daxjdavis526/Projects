// Geometric units: c = G = 1. Time and mass both measured in metres, with
// conversions back to SI, the compactness M/R as the size of relativistic
// effects, and putting G and c back into a formula. Builds on gr.S03.i
// (c = 1 with years and light-years) without repeating it.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex, nice } from '../../src/core/format.js';
import { C, G, GM_SUN, GM_EARTH, R_SUN, r6, label, st } from './_geom.js';

const t = String.raw;
const KM = G / (C * C);                  // metres per kilogram, G/c²
const KS = KM / C;                       // seconds per kilogram, G/c³
const MSUN_KG = GM_SUN / G;              // kg
const MSUN_M = GM_SUN / (C * C);         // m, 1476.6
const MSUN_S = MSUN_M / C;               // s, 4.925 μs
const LOG2K = Math.log10(2 * KM);        // the horizon line R = 2GM/c² on log axes
const POWER = C ** 5 / G;                // W, the unit of power when G = c = 1

// bodies on the mass–radius ladder: [name, mass kg, radius m, label dx, label dy, align]
// (black holes at their horizon radius 2GM/c², ignoring spin)
const BODIES = [
  ['Earth', 5.9722e24, 6.371e6, 8, -8],
  ['Jupiter', 1.89813e27, 6.9911e7, 8, -8],
  ['Sun', MSUN_KG, 6.957e8, 8, -10],
  ['Sirius B', 1.018 * MSUN_KG, 5.84e6, 8, 12],
  ['neutron star', 2.08 * MSUN_KG, 1.24e4, 8, 4],
  ['GW150914 remnant', 62 * MSUN_KG, 2 * KM * 62 * MSUN_KG, -8, -8, 'right'],
  ['Sgr A*', 4.3e6 * MSUN_KG, 2 * KM * 4.3e6 * MSUN_KG, -8, -8, 'right'],
  ['M87*', 6.5e9 * MSUN_KG, 2 * KM * 6.5e9 * MSUN_KG, -8, -8, 'right'],
];

/** The mass–radius ladder on log axes, with the horizon line R = 2GM/c² and the region inside it shaded. */
function ladder({ only = null, mark = null, sliders = null, readouts = null, extraCurves = [], caption } = {}) {
  const list = only ? BODIES.filter((b) => only.includes(b[0])) : BODIES;
  const points = list.map(([name, m, r, dx, dy, align]) => ({ x: r6(Math.log10(m)), y: r6(Math.log10(r)), r: 4.5, color: name === mark ? 'gold' : 'accent2', label: name, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) }));
  return {
    type: 'graph',
    params: {
      x: [23.5, 41], y: [-3, 14.5], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge',
      xlabel: 'mass (kg)', ylabel: 'radius (m)',
      shade: [{ fn: `x - ${r6(-LOG2K)}`, lower: '-3', from: 23.5, to: 41, color: 'bad', alpha: 0.13 }],
      curves: [
        { fn: `x - ${r6(-LOG2K)}`, color: 'bad', width: 1.8, label: 'R = 2GM/c²: a horizon', labelAt: 33.6, labelDx: 10, labelDy: 14 },
        ...extraCurves,
      ],
      points: [...points, label(37.5, -1.6, 'inside its own horizon', 'bad', 0, 0, 'center')],
      ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}),
    },
    caption: caption ?? t`Mass across, radius up, both on logarithmic scales. The red line is $R = 2GM/c^2$, the horizon radius of a non-rotating black hole: ordinary bodies sit far above it, black holes on it. The three black holes are drawn at that radius, ignoring their spin.`,
  };
}

/** A clock-rate curve √(1 − 2M/r) against r/M (geometric units). */
const clockRate = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 20], y: [0, 1.1], aspect: 'wide', xlabel: 'r / M', ylabel: 'clock rate dτ/dt',
    curves: [{ fn: 'sqrt(1 - 2/x)', domain: [2.0001, 20], color: 'accent', label: 'a hovering clock', labelAt: 9, labelDy: 16 }],
    hlines: [{ y: 1, label: 'far away', color: 'ink3' }], vlines: [{ x: 2, label: 'r = 2M', color: 'bad' }],
  },
  caption: caption ?? t`A clock hovering at radius $r$ outside a black hole ticks slower than one far away. With $G = c = 1$ the curve depends on $r$ only through $r/M$.`,
});

export default lesson({
  id: 'phys3710.R0.1',
  title: 'Geometric units: c = 1',
  minutes: 10, difficulty: 2,
  intro: t`Relativity treats time as a fourth dimension of the same spacetime as length, so it pays to measure both in the same unit. Setting $c = 1$ makes one second the distance light travels in it, $299{,}792{,}458$ m. General relativity goes one step further and also sets $G = 1$, which turns **mass into a length** too:

$$M_{\text{geom}} = \frac{G}{c^2}\,M, \qquad t_{\text{geom}} = c\,t$$

These are **geometric units**, the units of Hartle’s *Gravity* and of almost every relativity paper. The Sun’s mass becomes 1.48 km, and a dimensionless ratio such as $M/R$ tells you at a glance how strongly relativity matters near a body. You met $c = 1$ with years and light-years in [Spacetime diagrams and light cones](#/lesson/gr.S03.i); here the second step, $G = 1$, and the art of converting back.`,
  symbols: [
    { tex: 'c', text: t`the speed of light, $299{,}792{,}458$ m/s exactly; set to 1, it converts seconds into metres` },
    { tex: 'G', text: t`Newton’s gravitational constant, $6.6743\times10^{-11}\ \text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2}$; set to 1, it converts kilograms into metres` },
    { tex: 'M', text: 'a mass in kilograms' },
    { tex: 'M_{\\text{geom}}', text: t`the same mass as a length, $GM/c^2$, in metres: $1\ \text{kg} = ${tex(KM, 4)}$ m` },
    { tex: 't_{\\text{geom}}', text: t`a time as a length, $ct$, in metres: $1\ \text{s} = 299{,}792{,}458$ m, or $1\ \text{ns} \approx 30$ cm` },
  ],
  why: 'Every black-hole and gravitational-wave formula you will meet is written with G = c = 1, and the ratio M/R it makes visible is the size of every relativistic effect around a star.',
  visual: {
    title: 'Every mass is a length',
    lead: t`Slide the mass from the Earth to the largest black holes. The readouts give it in geometric units, as a length $GM/c^2$ and as a time $GM/c^3$. The red line is the horizon radius $2GM/c^2$; the height of a body above it is how weak its gravity is.`,
    tasks: [
      t`Set the mass to the Sun’s, about $10^{30.3}$ kg: it is 1.48 km, or 4.9 μs.`,
      'Compare the Earth with the Sun: a million times the mass, a million times the length — the conversion is just a fixed factor.',
      'Find the neutron star: only about four times its own mass above the horizon line, so M/R ≈ 0.25.',
    ],
    ...ladder({
    sliders: [{ key: 'm', label: t`Mass, $\log_{10}(M/\text{kg})$`, min: 24, max: 41, step: 0.01, value: 30.3, explain: t`From the Earth ($6\times10^{24}$ kg) to the black hole in M87 ($10^{40}$ kg).` }],
    readouts: [
      { label: t`$M$ in kilograms`, expr: '10^m', digits: 3, unit: t`\text{kg}` },
      { label: t`$GM/c^2$ (mass as a length)`, expr: `${r6(KM * 1e28)}*10^(m - 28)`, digits: 4, unit: t`\text{m}` },
      { label: t`$GM/c^3$ (mass as a time)`, expr: `${r6(KS * 1e36)}*10^(m - 36)`, digits: 4, unit: t`\text{s}` },
      { label: t`horizon radius $2GM/c^2$`, expr: `${r6(2 * KM * 1e28)}*10^(m - 28)`, digits: 4, unit: t`\text{m}` },
    ],
    extraCurves: [],
    }),
  },
  example: {
    prompt: t`Express the Sun’s mass, $M_\odot$, in metres and in seconds, using $GM_\odot = ${tex(GM_SUN, 12)}\ \text{m}^3/\text{s}^2$. Then find the ratio $M/R$ at its surface ($R_\odot = ${tex(R_SUN, 4)}$ m) and say what it measures.`,
    visual: ladder({ only: ['Earth', 'Jupiter', 'Sun', 'Sirius B', 'neutron star'], mark: 'Sun', caption: t`The Sun among other bodies, mass against radius on logarithmic scales. The red line is the horizon radius $2GM/c^2$; the Sun sits about half a million times above it.` }),
    steps: [
      { label: 'Why GM, not M', text: t`Astronomers know $GM_\odot$ to twelve figures from planetary orbits, but $G$ alone only to five. Geometric units need $GM/c^2$, so start from $GM_\odot$ and never divide out $G$.` },
      { label: 'Mass as a length', text: t`$M_\odot = \dfrac{GM_\odot}{c^2} = \dfrac{${tex(GM_SUN, 12)}}{(${tex(C, 9)})^2}\ \text{m} = ${nice(MSUN_M, 5)}$ m — about $1.48$ km.` },
      { label: 'Mass as a time', text: t`Divide once more by $c$: $GM_\odot/c^3 = ${tex(MSUN_S, 4)}$ s $\approx 4.93\ \mu\text{s}$, the time light takes to cross $1.48$ km.` },
      { label: 'Compactness', text: t`$M/R = ${nice(MSUN_M, 5)}/${tex(R_SUN, 4)} = ${tex(MSUN_M / R_SUN, 3)}$. Both are lengths, so the ratio has no units at all: it is the same number in every unit system. Put back $G$ and $c$ and it is $GM/(c^2R)$, the Newtonian potential at the surface divided by $c^2$.` },
      { label: 'Sense check', text: t`Relativistic corrections at the Sun’s surface are of order $M/R \approx 2\times10^{-6}$. Light from the surface loses that fraction of its frequency climbing out: a redshift equivalent to $${tex(MSUN_M / R_SUN, 3)}\times c = ${nice(MSUN_M / R_SUN * C, 3)}$ m/s, which solar spectroscopists do measure (about 0.63 km/s, after correcting for convection).` },
    ],
    answer: t`$M_\odot = ${nice(MSUN_M, 5)}$ m $= ${tex(MSUN_S, 4)}$ s, and $M/R = ${tex(MSUN_M / R_SUN, 3)}$ at the surface: the size of relativistic effects there.`,
  },
  practice: [
    num({
      id: 'mass-in-length', difficulty: 1,
      gen(r) {
        const [name, GM, R, unit, f] = r.pick([
          ['the Earth', GM_EARTH, 6.371e6, 'mm', 1e3], ['the Moon', 4.9048695e12, 1.7374e6, 'mm', 1e3],
          ['Mars', 4.282837e13, 3.3895e6, 'mm', 1e3], ['Jupiter', 1.26686534e17, 6.9911e7, 'm', 1],
        ]);
        const ans = GM / (C * C);
        return {
          prompt: t`The gravitational parameter of ${name} is $GM = ${tex(GM, 7)}\ \text{m}^3/\text{s}^2$. What is its mass in geometric units, $GM/c^2$? Answer in ${unit === 'mm' ? 'millimetres' : 'metres'}.`,
          visual: ladder({ only: ['Earth', 'Jupiter', 'Sun'], mark: name === 'Jupiter' ? 'Jupiter' : name === 'the Earth' ? 'Earth' : null, caption: t`The ladder of masses and radii (logarithmic scales). The red line marks $R = 2GM/c^2$; planets lie very far above it.` }),
          answer: ans * f, units: unit, tol: { rel: 0.005 },
          errors: [{ value: (GM / C) * f, feedback: t`Divide by $c^2$, not $c$: $GM$ has units $\text{m}^3/\text{s}^2$, and only $c^2$ (in $\text{m}^2/\text{s}^2$) leaves metres.` }],
          hints: [t`$GM/c^2$ with $c = ${tex(C, 9)}$ m/s; check that the units leave metres.`, t`$c^2 = ${tex(C * C, 6)}\ \text{m}^2/\text{s}^2$.`],
          teach: 'In geometric units a mass M is the length GM/c²: start from the measured GM and divide by c².',
          explain: t`$GM/c^2 = ${tex(GM, 7)}/${tex(C * C, 6)} = ${tex(ans, 4)}$ m. Its radius is $${tex(R, 4)}$ m, so $M/R = ${tex(ans / R, 3)}$ — relativity is a part-in-a-billion correction there.`,
        };
      },
    }),
    num({
      id: 'time-as-length', difficulty: 1,
      gen(r) {
        const ns = r.pick([12, 25, 40, 70]);
        const ans = C * ns * 1e-9;
        return {
          prompt: t`A GPS receiver times a satellite’s signal, but its own clock is off by ${ns} ns. With $c = 1$, a time error *is* a distance error. How many metres of range error does it make?`,
          visual: st({ x: [-2, 30], t: [-2, 30], xlabel: 'distance (m)', ylabel: 'ct (m)', cones: [[0, 0, 'future']],
            lines: [{ pts: [[0, 0], [0, 29]], color: 'accent', label: 'receiver', at: 0, dx: 8, dy: -40 }],
            caption: t`Time drawn as $ct$ in metres: light runs at 45°, so a clock error of $\Delta t$ moves the inferred distance by $c\,\Delta t$. Not to scale for the satellite’s real distance of about 20 000 km.` }),
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: ns * 0.3e-3, feedback: 'Check the conversion: 1 ns of light travel is about 0.3 m, not 0.3 mm.' }],
          hints: [t`Multiply by $c$: $\Delta x = c\,\Delta t$.`, t`$1\ \text{ns}$ of light travel is $0.2998$ m.`],
          teach: 'With c = 1, one nanosecond is 0.2998 m, about a foot: time and distance are the same kind of quantity.',
          explain: t`$${ns}\ \text{ns}\times0.2998\ \text{m/ns} = ${nice(ans, 3)}$ m. This is why GPS clocks must agree to a few nanoseconds.`,
        };
      },
    }),
    mcq({
      id: 'compactness', difficulty: 2,
      prompt: t`In geometric units ($G = c = 1$), which combination of a body’s mass $M$ and radius $R$ is a pure number that says how strongly relativity matters at its surface?`,
      visual: ladder({ caption: t`Mass against radius (logarithmic scales). Distance above the red line $R = 2GM/c^2$ measures how weak gravity is at the surface.` }),
      choices: [t`$M/R$`, t`$MR$`, t`$M/R^2$`, t`$M^2/R$`],
      answer: 0,
      why: {
        1: t`$M$ and $R$ are both lengths, so $MR$ is an area, in $\text{m}^2$ — not a pure number.`,
        2: t`$M/R^2$ is Newton’s surface gravity $g$ in these units; it has units of $1/\text{length}$, so its size depends on the unit.`,
        3: t`$M^2/R$ is a length. Only a ratio of two lengths has no units.`,
      },
      hints: ['In geometric units M and R are both lengths.', 'A pure number is a ratio of two lengths.'],
      teach: 'With G = c = 1 mass is a length, so M/R is dimensionless: the compactness, the size of relativistic effects.',
      explain: t`$M/R$ (in SI, $GM/c^2R$) is $${tex(GM_EARTH / C / C / 6.371e6, 2)}$ for the Earth, $${tex(MSUN_M / R_SUN, 2)}$ for the Sun, about 0.25 for a neutron star and exactly $\tfrac12$ at a black hole’s horizon.`,
    }),
    num({
      id: 'km-to-msun', difficulty: 2,
      gen(r) {
        const Mk = r.pick([12, 20, 44.3, 105]);
        const ans = (Mk * 1000) / MSUN_M;
        return {
          prompt: t`A paper on a black-hole merger gives the final black hole’s mass as $M = ${Mk}$ km, in geometric units. What is it in solar masses? ($M_\odot = 1.4766$ km.)`,
          visual: clockRate(t`Every quantity outside the hole scales with $M$: the horizon sits at $r = 2M$ whatever $M$ is. This curve is the same for every black hole once $r$ is measured in units of $M$.`),
          answer: ans, units: 'Msun', tol: { rel: 0.005 },
          errors: [{ value: (Mk * 1000) / (2 * MSUN_M), feedback: t`$2.953$ km is the Sun’s *horizon radius*, $2GM_\odot/c^2$. The mass itself is $1.4766$ km.` }],
          hints: ['Divide the mass in kilometres by the Sun’s mass in kilometres.', t`$M/M_\odot = ${Mk}/1.4766$.`],
          teach: 'Converting back is division by the unit: a mass of M km is M/1.4766 solar masses.',
          explain: t`$${Mk}/1.4766 = ${nice(ans, 4)}\,M_\odot$, or $${tex(ans * MSUN_KG, 3)}$ kg. Its horizon radius is $2M = ${nice(2 * Mk, 4)}$ km.`,
        };
      },
    }),
    mcq({
      id: 'restore', difficulty: 2,
      prompt: t`In geometric units a clock hovering at radius $r$ outside a black hole of mass $M$ ticks at the rate $d\tau/dt = \sqrt{1 - 2M/r}$. Which is the same formula in SI units?`,
      visual: clockRate(),
      choices: [t`$\sqrt{1 - \dfrac{2GM}{rc^2}}$`, t`$\sqrt{1 - \dfrac{2GM}{rc}}$`, t`$\sqrt{1 - \dfrac{2M}{rc^2}}$`, t`$\sqrt{1 - \dfrac{2GMc^2}{r}}$`],
      answer: 0,
      why: {
        1: t`$GM/(rc)$ has units of m/s, so it cannot be subtracted from 1. A geometric mass is $GM/c^2$: two powers of $c$.`,
        2: t`Without $G$, $M/(rc^2)$ has units of $\text{kg}\,\text{s}^2/\text{m}^3$. Every $M$ becomes $GM/c^2$ — the $G$ comes along.`,
        3: t`The $c^2$ divides: $GMc^2/r$ is enormous and has units $\text{m}^4/\text{s}^4$.`,
      },
      hints: [t`Each $M$ in a geometric formula stands for the length $GM/c^2$.`, t`Check: the thing subtracted from 1 must have no units.`],
      teach: 'To restore SI units, replace each M by GM/c² and each t by ct, then check every term is dimensionless where it must be.',
      explain: t`Replace $M$ by $GM/c^2$: $\sqrt{1 - 2GM/(rc^2)}$. The ratio $2GM/(rc^2)$ is a pure number, as it must be inside the square root.`,
    }),
    num({
      id: 'mass-as-time', difficulty: 2,
      gen(r) {
        const [name, Ms, unit, f] = r.pick([
          ['the 62-solar-mass black hole left by GW150914', 62, 'us', 1e6], ['a 10-solar-mass black hole', 10, 'us', 1e6],
          ['M87*, the black hole imaged by the Event Horizon Telescope ($6.5\\times10^{9}$ solar masses)', 6.5e9, 'h', 1 / 3600],
        ]);
        const ans = Ms * MSUN_S * f;
        return {
          prompt: t`Measured as a time, $GM/c^3$, how big is the mass of ${name}? The Sun’s is $4.9255\ \mu\text{s}$. Answer in ${unit === 'h' ? 'hours' : 'microseconds'}.`,
          visual: ladder({ mark: Ms > 1e6 ? 'M87*' : 'GW150914 remnant', caption: t`The black holes sit on the red horizon line $R = 2GM/c^2$; their horizon’s light-crossing time is $2GM/c^3$.` }),
          answer: ans, units: unit, tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`That is $2GM/c^3$, the light-crossing time of the horizon radius. The mass itself is $GM/c^3$.` }],
          hints: ['Mass in time units scales with the mass: multiply the Sun’s 4.9255 μs by the number of solar masses.', unit === 'h' ? t`Convert seconds to hours at the end: divide by 3600.` : t`$${Ms}\times4.9255\ \mu\text{s}$.`],
          teach: 'In geometric units a solar mass is 4.9255 μs: black-hole time scales grow in proportion to the mass.',
          explain: t`$${Ms > 1e6 ? '6.5\\times10^{9}' : Ms}\times4.9255\ \mu\text{s} = ${unit === 'h' ? `${tex(Ms * MSUN_S, 4)}\\ \\text{s} = ${nice(ans, 4)}\\ \\text{h}` : `${nice(ans, 4)}\\ \\mu\\text{s}`}$. Everything near a black hole — orbits, ringing, flickering — happens on time scales of tens to hundreds of this unit.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-isco', difficulty: 3, transfer: true,
      prompt: t`Sagittarius A*, the black hole at the centre of the Milky Way, has $M = 4.30\times10^{6}\,M_\odot$. In geometric units Kepler’s third law for a circular orbit is exactly $T = 2\pi\sqrt{r^3/M}$, where $T$ is the period measured by a distant clock. The innermost stable circular orbit of a non-spinning hole is at $r = 6M$. What is the orbital period there, in minutes? ($M_\odot = 4.9255\ \mu\text{s}$.)`,
      visual: clockRate(t`Radii near a black hole are measured in units of $M$. The innermost stable circular orbit sits at $r = 6M$, three times the horizon radius, for a hole that does not spin.`),
      answer: (2 * Math.PI * 6 ** 1.5 * 4.3e6 * MSUN_S) / 60, units: 'min', tol: { rel: 0.01 },
      errors: [
        { value: (2 * Math.PI * 4.3e6 * MSUN_S) / 60, feedback: t`With $r = 6M$, $\sqrt{r^3/M} = 6^{3/2}M$, not $M$.` },
        { value: (2 * Math.PI * 6 ** 1.5 * 4.3e6 * MSUN_S * 2) / 60, feedback: t`Use $M$ itself, not the horizon radius $2M$.` },
      ],
      hints: [t`$\sqrt{(6M)^3/M} = 6^{3/2}M$, so $T = 2\pi\,6^{3/2}\,M$.`, t`$M = 4.30\times10^{6}\times4.9255\ \mu\text{s} = ${nice(4.3e6 * MSUN_S, 4)}$ s; multiply by $2\pi\times6^{3/2} = ${nice(2 * Math.PI * 6 ** 1.5, 4)}$.`],
      teach: 'With G = c = 1 a black hole’s time scale is its mass in seconds; orbital periods are pure numbers times M.',
      explain: t`$M = ${nice(4.3e6 * MSUN_S, 4)}$ s, so $T = 2\pi\,6^{3/2}\times${nice(4.3e6 * MSUN_S, 4)}\ \text{s} = ${nice(2 * Math.PI * 6 ** 1.5 * 4.3e6 * MSUN_S, 4)}$ s $\approx ${nice((2 * Math.PI * 6 ** 1.5 * 4.3e6 * MSUN_S) / 60, 3)}$ minutes. Flares from Sgr A* do vary on time scales of tens of minutes, as gas this close to the hole should. (Its spin is not well measured; a spinning hole moves the orbit inward and shortens the period.)`,
    }),
    num({
      id: 'cp-gw-power', difficulty: 2, transfer: true,
      prompt: t`With $G = c = 1$ a power has no units: the conversion factor is $c^5/G = ${tex(POWER, 3)}$ W. At its peak the merger GW150914 radiated gravitational waves at $3.6\times10^{49}$ W. What is that in geometric units?`,
      visual: ladder({ mark: 'GW150914 remnant', caption: t`The remnant of GW150914, 62 solar masses, sits on the horizon line. Two black holes about 30 times the Sun’s mass merged to make it.` }),
      answer: 3.6e49 / POWER, tol: { rel: 0.01 },
      errors: [{ value: POWER / 3.6e49, feedback: 'Divide the power by c⁵/G, not the other way round: the result is a small fraction.' }],
      hints: ['A pure number: divide the power in watts by the unit c⁵/G in watts.'],
      teach: 'Geometric units make every quantity a power of length; c⁵/G is the natural unit of power, and it is huge.',
      explain: t`$3.6\times10^{49}/${tex(POWER, 3)} = ${tex(3.6e49 / POWER, 2)}$. For a fifth of a second the merger outshone every star in the observable universe combined, yet it reached only a thousandth of the natural unit $c^5/G$.`,
    }),
    num({
      id: 'cp-neutron', difficulty: 2,
      gen(r) {
        const Ms = r.pick([1.4, 2.0, 1.7]), R = r.pick([11, 12.5, 13]);
        const ans = (Ms * MSUN_M) / (R * 1000);
        return {
          prompt: t`A neutron star has mass $${Ms}\,M_\odot$ and radius ${R} km. What is its compactness $M/R$ in geometric units? ($M_\odot = 1.4766$ km.)`,
          visual: ladder({ mark: 'neutron star', caption: t`A neutron star sits only a few times above the horizon line. (The one plotted is PSR J0740+6620: about $2.08\,M_\odot$ and 12.4 km, from NICER.)` }),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Ms / R, feedback: 'Convert the mass to kilometres first: M = 1.4766 km per solar mass.' }],
          hints: [t`$M = ${Ms}\times1.4766$ km.`],
          teach: 'Compactness M/R is a ratio of two lengths in geometric units; for a neutron star it is a few tenths.',
          explain: t`$M = ${nice(Ms * MSUN_M / 1000, 4)}$ km, so $M/R = ${nice(ans, 3)}$ — about a hundred thousand times the Sun’s. Near a neutron star relativity is not a correction; it is most of the story.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity: An Introduction to Einstein’s General Relativity, §1.5 and Appendix A (geometrized units)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'IAU 2015 Resolution B3: nominal solar values (GM☉, R☉)', url: 'https://www.iau.org/static/resolutions/IAU2015_English.pdf' },
    { label: 'LIGO/Virgo (2016), Observation of gravitational waves from a binary black hole merger, PRL 116, 061102', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
    { label: 'GRAVITY Collaboration (2022), Mass distribution in the Galactic Center, A&A 657, L12', url: 'https://doi.org/10.1051/0004-6361/202142465' },
  ],
});
