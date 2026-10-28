// Transport from kinetic theory: the mean free path λ = 1/(√2 π d² n), from
// 66 nm at sea level to tens of kilometres in low Earth orbit (U.S. Standard
// Atmosphere 1976); diffusion and conduction as molecules carrying particles
// and energy one free path at a time — Fick's J = −D dn/dx and Fourier's
// q = −κ dT/dx, with D ≈ λv̄/3 and a conductivity independent of pressure
// until λ reaches the container size; and why a satellite's temperature is set
// by radiation, not by the 1000 K gas around it.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, AMU, ATM76, D_EFF, mfp, atmAt, atmExpr, r4, texNum, apart } from './_th4.js';

const t = String.raw;
const S0 = 1361;     // W/m², total solar irradiance at 1 AU (Kopp & Lean 2011)
const vbar = (T, M) => Math.sqrt((8 * KB * T) / (Math.PI * M * AMU));
const LOGL = atmExpr((r) => mfp(r.n));                 // log₁₀ λ(z), λ in m
const LOGN = atmExpr((r) => r.n);
const TEXPR = atmExpr((r) => r.T);
const SEA = atmAt(0), ORBIT = atmAt(400);
SEA.lam = mfp(SEA.n); ORBIT.lam = mfp(ORBIT.n);

/** λ against altitude on a log scale, with an optional altitude marked. */
function altPic({ z = null, caption, hide = false } = {}) {
  return {
    type: 'graph',
    params: {
      x: [0, 500], y: [-8, 5.5], aspect: 'wide', axesAt: 'edge', ylog: true, xlabel: 'altitude (km)', ylabel: 'mean free path (m)',
      curves: [{ fn: LOGL, domain: [0.5, 500], color: 'accent', width: 2.4 }],
      hlines: [{ y: 0, color: 'ink3', label: '1 m: a small satellite' }, { y: 2, color: 'ink4', label: 'ISS, about 100 m' }],
      vlines: z === null ? [] : [{ x: z, color: 'gold', label: hide ? '' : `${z} km` }],
    },
    caption: caption || 'Mean free path of air against altitude from the U.S. Standard Atmosphere 1976 (λ = 1/(√2 π d² n), d = 3.65 × 10⁻¹⁰ m), on a log scale; straight lines between tabulated altitudes. The real thermosphere swells and shrinks several-fold with solar activity.',
  };
}

/** A slab with a linear temperature profile. */
function slabPic({ Th, Tc, L, caption }) {
  return {
    type: 'graph',
    params: {
      x: [-0.4, 1.4], y: [Math.min(Tc, Th) - 15, Math.max(Tc, Th) + 15], aspect: 'wide', axesAt: 'edge', xlabel: `position across the layer (× ${L} cm)`, ylabel: 'temperature (K)',
      shade: [{ fn: String(Math.max(Tc, Th) + 15), lower: String(Math.min(Tc, Th) - 15), from: 0, to: 1, color: 'ink4', alpha: 0.18 }],
      curves: [{ fn: `${Th} + ${Tc - Th}*x`, domain: [0, 1], color: 'warn', width: 2.6 }, { fn: String(Th), domain: [-0.4, 0], color: 'warn', width: 2.6 }, { fn: String(Tc), domain: [1, 1.4], color: 'warn', width: 2.6 }],
      arrows: [{ from: [0.3, r4(Math.max(Tc, Th) + 6)], to: [0.7, r4(Math.max(Tc, Th) + 6)], color: 'gold', width: 2, label: 'heat flux q', labelDx: 6 }],
    },
    caption,
  };
}

export default lesson({
  id: 'phys3700.T10.1',
  title: 'Mean free path, conduction and diffusion',
  minutes: 16, difficulty: 2,
  intro: t`A molecule in a gas flies straight until it hits another. The average distance between hits is the **mean free path**,

$$\lambda = \frac{1}{\sqrt2\,\pi d^2 n},$$

where $\pi d^2$ is the target area a molecule of diameter $d$ presents and $n$ is the number density. In air at sea level $\lambda$ is about $${fmt(SEA.lam * 1e9, 2)}$ nm; at the International Space Station’s altitude it is about $${fmt(ORBIT.lam / 1000, 2)}$ km. Everything a gas *transports* — heat (Fourier’s law), particles (Fick’s law), momentum (viscosity) — is carried by molecules moving about one free path between collisions, so $\lambda$ sets how fast all of it spreads, and where the very idea of a continuous gas stops working.`,
  symbols: [
    { tex: '\\lambda', text: 'the mean free path: the average distance a molecule travels between collisions, in m' },
    { tex: 'd', text: 'the effective diameter of a molecule, about $3.65\\times10^{-10}$ m for air (the value the U.S. Standard Atmosphere uses)' },
    { tex: '\\pi d^2', text: 'the collision cross-section: two molecules collide when their centres pass within $d$' },
    { tex: 'n', text: 'the number density of molecules, in m⁻³ ($n = P/kT$ for an ideal gas)' },
    { tex: '\\sqrt2', text: 'from the relative speed of two molecules, $\\sqrt2$ times the mean speed of one, because the targets move too' },
  ],
  why: 'The mean free path decides whether air behaves as a fluid or as separate molecules: it sets rarefied-gas drag on satellites, how a vacuum flask insulates, how a Pirani gauge reads pressure, and how fast heat and particles diffuse.',
  visual: {
    type: 'graph',
    title: 'Climbing out of the continuum',
    lead: t`The curve is the mean free path of air from the ground to 500 km, from the U.S. Standard Atmosphere 1976 (note the logarithmic axis: each grid line is ten times the last). Drag the altitude and compare $\lambda$ with the size of a spacecraft.`,
    tasks: [
      'At sea level λ is 66 nm: a 1 m object meets air as a smooth continuous fluid.',
      'Climb to about 100 km (the Kármán line): λ is about 14 cm. Above 120 km it passes 1 m.',
      'At 400 km, the ISS’s altitude, λ is 16 km: a molecule that bounces off the station will almost never hit another one nearby.',
    ],
    params: {
      x: [0, 500], y: [-8, 5.5], aspect: 'wide', axesAt: 'edge', ylog: true, xlabel: 'altitude (km)', ylabel: 'mean free path (m)',
      sliders: [{ key: 'z', label: 'Altitude $z$', min: 1, max: 500, step: 1, value: 100, unit: '\\text{km}', explain: 'Geometric height above sea level. The table runs to 500 km; between tabulated heights the curve is interpolated.' }],
      curves: [{ fn: LOGL, domain: [0.5, 500], color: 'accent', width: 2.4 }],
      points: [{ x: 'z', y: LOGL.replaceAll('x', 'z'), r: 6, color: 'gold' }],
      hlines: [{ y: 0, color: 'ink3', label: '1 m' }],
      readouts: [
        { label: 'temperature $T$ (K)', expr: `10^(${TEXPR.replaceAll('x', 'z')})`, digits: 4 },
        { label: 'number density $n$ (m⁻³)', expr: `10^(${LOGN.replaceAll('x', 'z')})`, digits: 3 },
        { label: 'mean free path $\\lambda$ (m)', expr: `10^(${LOGL.replaceAll('x', 'z')})`, digits: 3, zero: 0 },
        { label: 'Knudsen number $\\lambda/L$ for $L = 1$ m', expr: `10^(${LOGL.replaceAll('x', 'z')})`, digits: 2, zero: 0 },
      ],
    },
    caption: 'U.S. Standard Atmosphere 1976, a mean-annual, moderate-solar-activity model. The real thermosphere’s density varies several-fold with solar activity, day and night. λ uses the standard’s effective collision diameter 3.65 × 10⁻¹⁰ m for every species.',
  },
  example: {
    prompt: t`Find the mean free path of air at sea level ($T = ${SEA.T}$ K, $P = 101\,325$ Pa) and at 400 km, where the U.S. Standard Atmosphere gives $n = ${texNum(ORBIT.n, 4)}\ \text{m}^{-3}$ and $T = ${fmt(ORBIT.T, 4)}$ K. Compare each with a 1 m satellite.`,
    visual: altPic({ z: 400, caption: 'Mean free path against altitude (U.S. Standard Atmosphere 1976), with 400 km marked.' }),
    steps: [
      { label: 'Density at sea level', text: t`$n = \dfrac{P}{kT} = \dfrac{101\,325}{(1.3806\times10^{-23})(${SEA.T})} = ${texNum(SEA.n, 4)}\ \text{m}^{-3}$.` },
      { label: 'Cross-section', text: t`$\pi d^2 = \pi(3.65\times10^{-10})^2 = ${texNum(Math.PI * D_EFF * D_EFF, 4)}\ \text{m}^2$.` },
      { label: 'Sea level', text: t`$\lambda = \dfrac{1}{\sqrt2\,(${texNum(Math.PI * D_EFF * D_EFF, 4)})(${texNum(SEA.n, 4)})} = ${texNum(SEA.lam, 3)}$ m $= ${fmt(SEA.lam * 1e9, 3)}$ nm — about 180 molecular diameters, and $${texNum(1 / SEA.lam, 2)}$ times smaller than the satellite.` },
      { label: 'At 400 km', text: t`$n$ is $${texNum(SEA.n / ORBIT.n, 3)}$ times smaller, so $\lambda$ is that much larger: $${fmt(ORBIT.lam / 1000, 3)}$ km — $${texNum(ORBIT.lam, 2)}$ times the satellite’s size.` },
      { label: 'What it means', text: t`The ratio $\lambda/L$ is the **Knudsen number**. Below about $0.01$ a gas acts as a continuum (Navier–Stokes, Fourier, Fick); far above 1 it is **free-molecular**: each molecule hits the body and leaves without meeting another. Orbital aerodynamics and heating are free-molecular.` },
    ],
    answer: t`Sea level: $\lambda = ${fmt(SEA.lam * 1e9, 3)}$ nm (continuum). At 400 km: $\lambda = ${fmt(ORBIT.lam / 1000, 3)}$ km, a Knudsen number of about $${texNum(ORBIT.lam, 2)}$ for a 1 m satellite (free-molecular).`,
  },
  practice: [
    num({
      id: 'mfp-pressure', difficulty: 2,
      gen(r) {
        const [P, what, T] = r.pick([[101325, 'at sea level', 288], [70100, 'at 3 km altitude', 268.7], [33700, 'on the summit of Everest', 253], [100, 'in a rough vacuum chamber', 293], [1, 'in a chamber pumped to 1 Pa', 293]]);
        const n = P / (KB * T), v = mfp(n);
        return {
          prompt: t`What is the mean free path of air molecules ${what}, where $P = ${P >= 1e4 ? String(P).replace(/(\d)(\d{3})$/, '$1\\,$2') : P}$ Pa and $T = ${T}$ K? Take $d = 3.65\times10^{-10}$ m. Give it in metres.`,
          answer: v, units: 'm', tol: { rel: 0.01 },
          errors: apart([{ value: v * Math.SQRT2, feedback: 'Include the √2 for the relative speed of the molecules.' }, { value: 1 / (Math.SQRT2 * Math.PI * (D_EFF / 2) ** 2 * n), feedback: 'The cross-section is πd², with d the diameter: centres collide when they pass within one diameter.' }, { value: 1 / (Math.SQRT2 * D_EFF * D_EFF * n), feedback: 'Keep the π in the cross-section πd².' }], v),
          hints: [t`$n = P/kT$.`, t`$n = ${texNum(n, 3)}\ \text{m}^{-3}$; then $\lambda = 1/(\sqrt2\,\pi d^2 n)$.`],
          teach: 'λ ∝ T/P: halve the pressure and the free path doubles.',
          explain: t`$n = ${texNum(n, 3)}\ \text{m}^{-3}$ and $\lambda = ${texNum(v, 3)}$ m. ${v > 1e-3 ? 'That is comparable to the size of the apparatus: the gas is no longer a continuum inside it.' : 'Still tiny compared with anything you can see: the gas is a continuum.'}`,
          visual: { type: 'graph', params: { x: [-1, 5.5], y: [-8, 0], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'pressure (Pa)', ylabel: 'mean free path (m)', curves: [{ fn: `${r4(Math.log10(KB * 293 / (Math.SQRT2 * Math.PI * D_EFF * D_EFF)))} - x`, domain: [-1, 5.5], color: 'accent', label: 'air at 293 K', labelAt: 0.5, labelDx: 8 }], vlines: [{ x: r4(Math.log10(P)), color: 'gold' }] }, caption: 'Mean free path of air at 293 K against pressure, on log axes: λ ∝ 1/P. The gold line marks this pressure.' },
        };
      },
    }),
    num({
      id: 'mfp-orbit', difficulty: 2,
      gen(r) {
        const z = r.pick([200, 250, 300, 350, 450, 500]), row = atmAt(z), v = mfp(row.n) / 1000;
        return {
          prompt: t`At ${z} km the U.S. Standard Atmosphere gives a number density $n = ${texNum(row.n, 4)}\ \text{m}^{-3}$. Using $d = 3.65\times10^{-10}$ m, what is the mean free path, in km?`,
          answer: v, units: 'km', tol: { rel: 0.01 },
          errors: apart([{ value: v * 1000, feedback: 'Convert metres to kilometres.' }, { value: v * Math.SQRT2, feedback: 'Include the √2.' }], v),
          hints: [t`$\lambda = 1/(\sqrt2\,\pi d^2 n)$, with $\pi d^2 = ${texNum(Math.PI * D_EFF * D_EFF, 3)}\ \text{m}^2$.`],
          teach: 'In low Earth orbit the free path is kilometres to tens of kilometres: the gas is free-molecular around any spacecraft.',
          explain: t`$\lambda = 1/(\sqrt2\,(${texNum(Math.PI * D_EFF * D_EFF, 3)})(${texNum(row.n, 4)})) = ${texNum(v * 1000, 3)}$ m $= ${fmt(v, 3)}$ km. The gas there is mostly atomic oxygen at about $${Math.round(row.T)}$ K.`,
          visual: altPic({ z, hide: true }),
        };
      },
    }),
    num({
      id: 'diffusion-time', difficulty: 2,
      gen(r) {
        const D = r.pick([[2.0e-5, 'oxygen in nitrogen'], [7.0e-5, 'helium in air'], [1.6e-5, 'carbon dioxide in air']]), L = r.pick([0.1, 0.5, 1]);
        const v = (L * L) / (2 * D[0]) / 3600;
        return {
          prompt: t`The diffusion coefficient of ${D[1]} at room conditions is about $D = ${texNum(D[0], 2)}\ \text{m}^2\text{/s}$. In still air, roughly how long does a molecule take to wander $${L}$ m along one direction? Use the random-walk result $\langle x^2\rangle = 2Dt$, and give hours.`,
          answer: v, units: 'h', tol: { rel: 0.01 },
          errors: apart([{ value: L / D[0] / 3600, feedback: 'Diffusion distance grows as √t, not t: set L² = 2Dt.' }, { value: (L * L) / D[0] / 3600, feedback: 'In one direction ⟨x²⟩ = 2Dt: keep the 2.' }, { value: (L * L) / (2 * D[0]), feedback: 'That is in seconds; divide by 3600 for hours.' }], v),
          hints: [t`Set $L^2 = 2Dt$ and solve for $t$.`, t`$t = ${L}^2/(2\times${texNum(D[0], 2)})$ s.`],
          teach: 'Diffusion is slow over large distances: the time grows as the distance squared.',
          explain: t`$t = L^2/2D = ${texNum((L * L) / (2 * D[0]), 3)}$ s, about $${fmt(v, 3)}$ hours. A smell crosses a room in seconds to minutes, not hours, because air currents carry it: in real rooms convection beats diffusion. Fick’s law $J = -D\,\partial n/\partial x$ with conservation of particles gives the heat equation $\partial n/\partial t = D\,\partial^2 n/\partial x^2$ — derived from random walks in [B4.1](#/lesson/st-b.B4.1).`,
          visual: { type: 'pde-walk', params: { N: 2000, steps: 200, controls: false, play: false, readout: false }, caption: 'Random walkers spreading from one point after 200 steps: the cloud widens as √t, matching the heat-equation Gaussian (gold). A lattice walk is a teaching model of molecular motion.' },
        };
      },
    }),
    num({
      id: 'fourier', difficulty: 2,
      gen(r) {
        const kap = r.pick([0.012, 0.015, 0.02]), L = r.pick([1.5, 2.5, 4]), dT = r.pick([40, 60, 90]), v = (kap * dT) / (L / 100);
        return {
          prompt: t`A Mars rover’s electronics box is wrapped in a silica-aerogel layer $${L}$ cm thick, with thermal conductivity $\kappa = ${kap}$ W/(m K) in thin Martian air. The inside is held $${dT}$ K warmer than the outside. What heat flux leaks through the layer, in W/m²?`,
          answer: v, units: 'W/m^2', tol: { rel: 0.005 },
          errors: apart([{ value: kap * dT * L, feedback: 'Divide by the thickness, in metres: q = κΔT/L.' }, { value: (kap * dT) / L, feedback: 'Convert the thickness to metres.' }], v),
          hints: [t`Fourier’s law for a flat layer: $q = \kappa\,\Delta T/L$.`, t`$L = ${L / 100}$ m.`],
          teach: 'Fourier: heat flux = conductivity × temperature gradient, q = −κ dT/dx.',
          explain: t`$q = (${kap})(${dT})/${L / 100} = ${fmt(v, 3)}$ W/m². Aerogel is mostly gas in pores far narrower than the gas’s mean free path at Martian pressure (about 600 Pa), so its molecules hit pore walls more often than each other — which is why aerogel conducts even less than still air.`,
          visual: slabPic({ Th: 270, Tc: 270 - dT, L, caption: `Steady conduction through a uniform layer: the temperature falls linearly across it, and the flux is κ × (slope). Temperatures illustrative.` }),
        };
      },
    }),
    mcq({
      id: 'pressure-independent', difficulty: 3,
      prompt: t`Kinetic theory gives a gas’s thermal conductivity as $\kappa \approx \tfrac13\,n\,c\,\bar v\,\lambda$, with $c$ the heat capacity per molecule and $\bar v$ the mean speed. What happens to $\kappa$ if you pump a vacuum flask’s jacket from 1 atm down to 0.1 atm?`,
      choices: [
        t`Almost nothing: $n$ falls tenfold but $\lambda \propto 1/n$ rises tenfold. Only once $\lambda$ exceeds the jacket’s width does $\kappa$ fall with pressure`,
        t`It falls tenfold, because there are ten times fewer molecules to carry heat`,
        t`It rises tenfold, because $\lambda$ is ten times longer`,
        t`It falls to zero: below 1 atm a gas cannot conduct heat`,
      ],
      answer: 0,
      why: { 1: 'Fewer carriers, but each carries its energy ten times farther: the product nλ is unchanged.', 2: 'λ rises, but n falls by the same factor.', 3: 'Gases conduct at any pressure; at low pressure the conduction just becomes limited by the gap instead of λ.' },
      hints: [t`Write $\lambda = 1/(\sqrt2\pi d^2 n)$ into $\kappa$: what happens to $n\lambda$?`, 'A vacuum flask works only when the gas is so thin that molecules cross the gap without colliding.'],
      teach: 'A gas’s conductivity is independent of pressure (Maxwell) — until the free path outgrows the container.',
      explain: t`$n\lambda = 1/(\sqrt2\pi d^2)$, independent of pressure: Maxwell predicted it and was surprised to confirm it. A vacuum jacket must be pumped hard enough (well below 1 Pa for a centimetre gap) that $\lambda$ exceeds the gap; then each molecule carries heat across in one flight, and the heat flow falls in proportion to the pressure. A Pirani gauge reads pressure from exactly that effect.`,
      visual: { type: 'graph', params: { x: [-3, 5.5], y: [-4, 0.5], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'pressure (Pa)', ylabel: 'κ / κ(atmospheric) (sketch)', curves: [{ fn: `-log10(1 + ${r4(1.37)}/10^x)`, domain: [-3, 5.5], color: 'accent', label: '1 cm gap', labelAt: -1, labelDx: 10 }], vlines: [{ x: 5.006, color: 'ink3', label: '1 atm' }] }, caption: 'Sketch: heat conduction across a 1 cm gas gap against pressure. Flat while λ is much smaller than the gap, falling as P once λ exceeds it (near 1 Pa for air at room temperature).' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-satellite', difficulty: 3, transfer: true,
      gen(r) {
        const z = r.pick([300, 400, 500]), row = atmAt(z), vb = vbar(row.T, row.M), flux = (row.n * vb) / 4, P = flux * 2 * KB * row.T, v = P * 1000;
        return {
          prompt: t`At ${z} km the air is $${Math.round(row.T)}$ K hot, but so thin ($n = ${texNum(row.n, 3)}\ \text{m}^{-3}$, mean molecular mass $${fmt(row.M, 3)}$ u) that a satellite feels it only as separate molecular impacts. Molecules strike each square metre at a rate $\tfrac14 n\bar v$, each bringing on average $2kT$ of energy. Ignoring the satellite’s own motion, what power per square metre does that deliver, in mW/m²? (Sunlight delivers $${S0}$ W/m².)`,
          answer: v, units: 'mW/m^2', tol: { rel: 0.01 },
          errors: apart([{ value: v * 4, feedback: 'The impact rate per unit area is n v̄/4: only a quarter of the molecules’ flux reaches a given wall.' }, { value: (v * 3) / 4, feedback: 'Molecules that hit a wall carry 2kT on average, not (3/2)kT: faster ones arrive more often.' }, { value: P, feedback: 'That is in W/m²; convert to mW/m².' }], v),
          hints: [t`$\bar v = \sqrt{8kT/\pi m} = ${fmt(vb, 4)}$ m/s.`, t`Power per area $= \tfrac14 n\bar v\times2kT$.`],
          teach: 'In orbit the hot thermosphere delivers almost no heat: too few molecules. Spacecraft temperatures are set by sunlight in and thermal radiation out.',
          explain: t`$\tfrac14 n\bar v = ${texNum(flux, 3)}\ \text{m}^{-2}\text{s}^{-1}$, times $2kT = ${texNum(2 * KB * row.T, 3)}$ J, gives $${fmt(v, 3)}$ mW/m² — about $${texNum(P / S0, 2)}$ of sunlight. The gas temperature is real but irrelevant: a satellite at ${z} km runs at whatever temperature balances sunlight, Earthshine and its own radiation. (Its orbital speed of 7.7 km/s adds the ram flux $\tfrac12\rho v^3$, of order a watt per square metre at 400 km — larger, still small, and the source of drag.)`,
          visual: altPic({ z, caption: 'Mean free path against altitude (U.S. Standard Atmosphere 1976): at this height λ is kilometres, so the gas reaches the satellite molecule by molecule.' }),
        };
      },
    }),
    num({
      id: 'cp-dewar', difficulty: 3,
      gen(r) {
        const gap = r.pick([2, 5, 10, 20]), T = 293, v = (KB * T) / (Math.SQRT2 * Math.PI * D_EFF * D_EFF * gap * 1e-3);
        return {
          prompt: t`A vacuum flask’s jacket is $${gap}$ mm wide. Below roughly what pressure does the mean free path of air at $293$ K exceed the gap, so conduction through the gas starts to fall with pressure? Take $d = 3.65\times10^{-10}$ m; give pascals.`,
          answer: v, units: 'Pa', tol: { rel: 0.01 },
          errors: apart([{ value: v / Math.SQRT2, feedback: 'λ = kT/(√2 π d² P): solve for P keeping the √2.' }, { value: v * 1000, feedback: 'Convert the gap to metres.' }], v),
          hints: [t`$\lambda = \dfrac{kT}{\sqrt2\,\pi d^2 P}$; set $\lambda$ equal to the gap.`, t`$P = \dfrac{kT}{\sqrt2\,\pi d^2\,L}$ with $L = ${gap / 1000}$ m.`],
          teach: 'A vacuum insulates only when λ exceeds the gap: around a pascal for centimetre gaps, far lower for good insulation.',
          explain: t`$P = \dfrac{(1.3806\times10^{-23})(293)}{\sqrt2\,\pi(3.65\times10^{-10})^2(${gap / 1000})} = ${fmt(v, 3)}$ Pa. Good cryogenic dewars are pumped to $10^{-3}$ Pa or below, where gas conduction is negligible and radiation (stopped by multilayer insulation) dominates the heat leak.`,
          visual: { type: 'graph', params: { x: [-3, 5.5], y: [-8, 1], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'pressure (Pa)', ylabel: 'mean free path (m)', curves: [{ fn: `${r4(Math.log10(KB * 293 / (Math.SQRT2 * Math.PI * D_EFF * D_EFF)))} - x`, domain: [-3, 5.5], color: 'accent', label: 'air at 293 K', labelAt: 3, labelDx: 8 }], hlines: [{ y: r4(Math.log10(gap / 1000)), color: 'gold', label: `gap, ${gap} mm` }] }, caption: 'Mean free path of air at 293 K against pressure (log axes), with the jacket width marked.' },
        };
      },
    }),
    mcq({
      id: 'cp-continuum', difficulty: 2,
      prompt: 'Which situation must be modelled molecule by molecule (free-molecular flow) rather than as a continuous fluid?',
      choices: [
        'A cubesat at 400 km, where λ is about 16 km and the satellite about 30 cm',
        'A jet airliner at 11 km, where λ is about 0.3 μm',
        'A capsule’s parachute opening at 10 km',
        'Air flowing through a rocket engine’s turbopump',
      ],
      answer: 0,
      why: { 1: 'λ is a millionth of the wing chord: a continuum, described by the Navier–Stokes equations.', 2: 'The parachute is metres across and λ is under a micrometre: continuum flow.', 3: 'High pressure means tiny λ: continuum flow (and it is propellant, not air).' },
      hints: ['Compare λ with the size of the object: the Knudsen number λ/L.'],
      teach: 'Knudsen number λ/L ≫ 1: free-molecular; λ/L ≪ 1: continuum.',
      explain: 'At 400 km the Knudsen number for a 30 cm satellite is about 50 000. Drag and heating there are computed from individual molecules hitting the surface — or, in between the regimes, by direct-simulation Monte Carlo (Bird’s DSMC), the method T8.2 introduced applied to gas molecules.',
      visual: altPic({ caption: 'Mean free path against altitude: kilometre-scale above about 300 km, sub-micrometre where airliners fly.' }),
    }),
  ],
  sources: [
    { label: 'U.S. Standard Atmosphere, 1976 (NOAA/NASA/USAF), Tables I and IV', url: 'https://ntrs.nasa.gov/citations/19770009539' },
    { label: 'Schroeder, An Introduction to Thermal Physics, §1.7 (rates of processes)', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Kopp & Lean, A new, lower value of total solar irradiance, Geophys. Res. Lett. 38, L01706 (2011)', url: 'https://doi.org/10.1029/2010GL045777' },
    { label: 'Bird, Molecular Gas Dynamics and the Direct Simulation of Gas Flows (Oxford, 1994)', url: 'https://global.oup.com/academic/product/molecular-gas-dynamics-and-the-direct-simulation-of-gas-flows-9780198561958' },
  ],
});
