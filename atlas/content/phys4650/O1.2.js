// Plane and spherical waves, read as an optician reads them (Hecht §2.7–2.9).
// PHYS 3750 W7.1–W7.2 derived both from the wave equation; this lesson is brief
// and takes the optics angle: wavefronts and rays (a ray is the normal to the
// wavefronts), the index hidden in |k| = nk₀, the 1/r amplitude and 1/r²
// irradiance of a point source, and when a spherical wavefront is flat enough
// to count as plane across an aperture: its sag a²/2R against a quarter wave
// (the Fresnel number a²/λR seeded for O8). Paraxial expansion of the phase.
// Worked example: Sirius as a spherical wave at Earth. Transfer: how far a lamp
// must be to stand in for a star when testing a star tracker (hence collimators).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, EPS0, PI, sf, nOf, MATS, L_SUN, bare } from './_op.js';

const t = String.raw;
const PC = 3.0856775814913673e16;       // m (IAU 2015)

// the worked example: Sirius A (luminosity about 25.4 L☉, distance 2.64 pc) and a 50 mm aperture at 550 nm
const EX = { L: 25.4 * L_SUN, d: 2.64 * PC, a: 0.025, lam: 550e-9 };
EX.I = EX.L / (4 * PI * EX.d ** 2);
EX.E0 = Math.sqrt((2 * EX.I) / (C * EPS0));
EX.calA = EX.E0 * EX.d;
EX.sag = EX.a ** 2 / (2 * EX.d);
EX.sagW = EX.sag / EX.lam;

/** Circular wavefront arcs (crests) from a source at (sx, 0), radii rs, drawn over angles ±span. */
const arcs = (sx, rs, span = 0.9, color = 'accent') => rs.map((R) => ({ param: [`${sx} + ${R}*cos(t)`, `${R}*sin(t)`], t: [-span, span], color, width: 1.8 }));

export default lesson({
  id: 'phys4650.O1.2',
  title: 'Plane and spherical waves',
  minutes: 11, difficulty: 2,
  intro: t`In three dimensions the two waves that matter most in optics are the **plane wave**, whose crests are flat sheets, and the **spherical wave** from a point source, whose crests are spheres ([PHYS 3750 W7](#/lesson/phys3750.W7.1) derived both):

$$\begin{gathered}\psi = A\cos(\vec k\cdot\vec r - \omega t)\\ \psi = \frac{\mathcal A}{r}\cos(kr - \omega t)\end{gathered}$$

A surface of constant phase is a **wavefront**; a **ray** is a line everywhere perpendicular to the wavefronts — the direction the light goes. A spherical wave’s amplitude falls as $1/r$, so its irradiance falls as $1/r^2$. And far from its source, a patch of a spherical wavefront is so nearly flat that a lens or mirror sees a plane wave: that is why starlight arrives as parallel rays.`,
  symbols: [
    { tex: '\\vec k', text: t`the wave vector: it points along the direction of travel (normal to the wavefronts), with length $k = 2\pi/\lambda = nk_0$, in rad/m` },
    { tex: '\\vec r', text: 'the position where the wave is evaluated, in m' },
    { tex: 'A', text: 'the plane wave’s amplitude, the same everywhere' },
    { tex: 'r', text: 'the distance from the point source, in m' },
    { tex: '\\mathcal A', text: t`the spherical wave’s source strength, in field units × metres: the amplitude at distance $r$ is $\mathcal A/r$` },
    { tex: '\\omega', text: 'the angular frequency, in rad/s' },
  ],
  why: t`Whether light can be treated as a plane wave across your aperture — or must be treated as curved — decides between a collimated beam and a focus, and between far-field and near-field diffraction later in the course.`,
  visual: {
    type: 'graph',
    title: 'When is a spherical wave plane?',
    lead: t`Light of wavelength 550 nm from a point source a distance $R$ away falls on an aperture 50 mm across. The curve is how far each point of the wavefront lags the centre, $\sqrt{R^2 + y^2} - R$, measured in **waves**. The gold band is $\pm\tfrac14$ wave: inside it, the wavefront is flat enough to focus almost as well as a plane wave (Rayleigh’s quarter-wave rule).`,
    tasks: [
      t`At $R = 10$ m the edges lag the centre by about 57 waves: strongly curved. The curve is a parabola, $y^2/2R$.`,
      t`Push $R$ up until the whole curve fits inside the band: about 2.3 km. Closer than that, a lamp cannot stand in for a star.`,
      t`Watch the Fresnel number $a^2/\lambda R$: it is the edge lag in **half**-waves, and it falls below 1 at the same distances.`,
    ],
    params: {
      x: [-25, 25], y: [-0.4, 2.2], aspect: 'wide', xlabel: 'y across the aperture (mm)', ylabel: 'lag (waves)', yticks: 5,
      sliders: [{ key: 'R', label: 'Source distance $R$', min: 1, max: 10000, value: 10, logScale: true, unit: '\\mathrm{m}', explain: 'From the point source to the aperture.', fmt: (v) => String(+v.toPrecision(2)) }],
      shade: [{ fn: '0.25', lower: '-0.25', from: -25, to: 25, color: 'gold', alpha: 0.18 }],
      curves: [{ fn: '(sqrt((1000*R)^2 + x^2) - 1000*R)/0.00055', color: 'accent', width: 2.4, samples: 600 }],
      readouts: [
        { label: 'edge lag', expr: '(sqrt((1000*R)^2 + 625) - 1000*R)/0.00055', unit: '\\text{waves}', digits: 3 },
        { label: 'Fresnel number $a^2/\\lambda R$', expr: '625/(0.00055*1000*R)', digits: 3 },
      ],
    },
    caption: t`Exact path differences from a point source on the axis; the aperture is 50 mm across ($a = 25$ mm). The vertical axis is cut off at 2.2 waves.`,
  },
  example: {
    prompt: t`Sirius A radiates about $25.4\,L_\odot$ ($L_\odot = 3.828\times10^{26}$ W) and is ${sf(EX.d / PC, 3)} pc ($${tex(EX.d, 3)}$ m) away. Treat its light as a spherical wave. Find the irradiance at Earth (above the atmosphere), the field amplitude, the source strength $\mathcal A$, and how far its wavefront departs from flat across a 50 mm star-tracker aperture at 550 nm.`,
    visual: { type: 'graph', params: bare([-1, 6.5], [-1.6, 1.6], { curves: [...arcs(-6, [6.2, 6.7, 7.2], 0.32), { fn: '0', color: 'ink3', width: 1, dash: [4, 4], domain: [-1, 6.4] }], shade: [{ fn: '0.5', lower: '-0.5', from: 1.15, to: 1.3, color: 'ink3', alpha: 0.6 }], points: [{ x: 1.3, y: 0.9, r: 0, label: 'aperture', color: 'ink2' }, { x: -0.95, y: -1.35, r: 0, label: 'wavefronts from the star (far to the left)', color: 'accent', labelDx: 0 }] }), caption: t`Schematic, hugely exaggerated: real wavefronts arriving from 2.6 pc are flat to a few zeptometres across the aperture.` },
    steps: [
      { label: 'Irradiance', text: t`The power spreads over a sphere: $I = \dfrac{L}{4\pi d^2} = \dfrac{${tex(EX.L, 3)}}{4\pi(${tex(EX.d, 3)})^2} = ${tex(EX.I, 3)}\ \text{W/m}^2$.` },
      { label: 'Field amplitude', text: t`With $I = \tfrac12c\varepsilon_0E_0^2$ (O2.2): $E_0 = \sqrt{2I/c\varepsilon_0} = ${tex(EX.E0, 2)}$ V/m — about $10^{-5}$ of sunlight’s.` },
      { label: 'Source strength', text: t`$\mathcal A = E_0 d = ${tex(EX.calA, 2)}$ V. The amplitude at any distance is $\mathcal A/r$; this one number describes the star’s wave everywhere.` },
      { label: 'Flatness', text: t`Across a radius $a = 25$ mm the sphere sags by $a^2/2d = ${tex(EX.sag, 2)}$ m, or $${tex(EX.sagW, 2)}$ waves: perfectly plane. (Turbulence in our own atmosphere wrinkles it far more than that; above the atmosphere, nothing does.)` },
      { label: 'Sense check', text: t`Irradiance $\propto 1/d^2$ and amplitude $\propto 1/d$: at twice the distance Sirius would be four times fainter but its field only half as strong.` },
    ],
    answer: t`$I \approx ${tex(EX.I, 3)}$ W/m², $E_0 \approx ${tex(EX.E0, 2)}$ V/m, $\mathcal A \approx ${tex(EX.calA, 2)}$ V; the wavefront is flat to $${tex(EX.sagW, 1)}$ waves.`,
  },
  practice: [
    mcq({
      id: 'ray', difficulty: 1,
      prompt: t`The arcs are crests of a spherical wave in glass. At the gold point, which arrow shows the ray — the direction the light travels?`,
      visual: { type: 'graph', params: bare([-1, 5], [-1.8, 1.8], { curves: arcs(-2, [3, 4, 5], 0.45), points: [{ x: 2 + 0 * 1, y: 0, r: 5, color: 'gold' }],
        arrows: [
          { from: [2, 0], to: [2.9, 0], color: 'warn', label: 'P' },
          { from: [2, 0], to: [2, 0.9], color: 'warn', label: 'Q' },
          { from: [2, 0], to: [1.1, 0], color: 'warn', label: 'R', labelDx: -16 },
          { from: [2, 0], to: [2.64, -0.64], color: 'warn', label: 'S' },
        ] }), caption: t`Crests of a wave spreading from a point source off to the left (not shown).` },
      choices: ['P', 'Q', 'R', 'S'],
      answer: 0,
      why: { 1: 'Q runs along the crest. A crest is a surface of constant phase: moving along it the phase does not change at all.', 2: 'R is perpendicular to the crest but points back toward the source; the wave spreads outward.', 3: 'S crosses the crest at 45°. In an isotropic medium the ray is along the normal to the wavefront.' },
      hints: ['The ray points where the phase changes fastest.', 'In glass, water or air (isotropic media) rays are perpendicular to the wavefronts.'],
      teach: 'In an isotropic medium a ray is the normal to the wavefronts, pointing the way the wave travels.',
      explain: t`The phase grows fastest along $\vec k$, perpendicular to the crests; for a spherical wave that is radially outward. (In crystals such as calcite the energy can flow at an angle to $\vec k$ — O6.)`,
    }),
    num({
      id: 'index-from-k', difficulty: 2,
      gen(r) {
        const nm = r.pick([532, 633, 800, 1064]), mat = r.pick(['water', 'silica', 'bk7', 'sapphire']), deg = r.pick([20, 30, 35, 50, 60]);
        const n = nOf(mat, nm), K = (2 * PI * n) / (nm / 1000);
        const kx = sf(K * Math.sin((deg * PI) / 180), 4), kz = sf(K * Math.cos((deg * PI) / 180), 4);
        const nn = (Math.hypot(kx, kz) * (nm / 1000)) / (2 * PI);
        return {
          prompt: t`Inside a block of ${MATS[mat].name}, light of vacuum wavelength ${nm} nm is the plane wave $\psi = A\cos(k_xx + k_zz - \omega t)$ with $k_x = ${kx}$ rad/µm and $k_z = ${kz}$ rad/µm. What is the block’s refractive index?`,
          visual: (() => { const K = Math.hypot(kx, kz), ux = sf(kx / K, 4), uz = sf(kz / K, 4); return { type: 'graph', params: bare([0, 3], [0, 2], { curves: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((c) => ({ param: [`1.5 + ${sf(c * 0.32, 3)}*${ux} + t*${uz}`, `1 + ${sf(c * 0.32, 3)}*${uz} - t*${ux}`], t: [-4, 4], color: 'accent', width: 1.6 })), arrows: [{ from: [1.5 - 0.5 * ux, 1 - 0.5 * uz], to: [1.5 + 0.5 * ux, 1 + 0.5 * uz], color: 'gold', width: 2.6, label: 'k⃗' }], points: [{ x: 2.95, y: 0.08, r: 0, label: 'x →', color: 'ink3', labelAlign: 'right', labelDx: 0 }, { x: 0.05, y: 1.92, r: 0, label: 'z ↑', color: 'ink3', labelDx: 0 }] }), caption: t`Crests (schematic spacing) and the direction of $\vec k$, perpendicular to them. Not to scale.` }; })(),
          answer: nn, tol: { rel: 0.002 },
          errors: [{ value: (kz * (nm / 1000)) / (2 * PI), feedback: t`Only $k_z$? The wavenumber is the length of the whole vector, $|\vec k| = \sqrt{k_x^2 + k_z^2}$.` }, { value: ((kx + kz) * (nm / 1000)) / (2 * PI), feedback: t`Components add as a vector: $|\vec k| = \sqrt{k_x^2 + k_z^2}$, not $k_x + k_z$.` }],
          hints: [t`In the medium $|\vec k| = nk_0 = 2\pi n/\lambda_0$.`, t`$n = |\vec k|\lambda_0/2\pi$ with $|\vec k| = \sqrt{k_x^2 + k_z^2}$ and $\lambda_0 = ${nm / 1000}$ µm.`],
          teach: t`The length of the wave vector carries the medium’s index, $|\vec k| = nk_0$; its direction carries the direction of travel.`,
          explain: t`$|\vec k| = \sqrt{${kx}^2 + ${kz}^2} = ${sf(Math.hypot(kx, kz), 4)}$ rad/µm, so $n = |\vec k|\lambda_0/2\pi = ${sf(nn, 4)}$.`,
        };
      },
    }),
    num({
      id: 'amp-falloff', difficulty: 1,
      gen(r) {
        const r1 = r.pick([2, 3, 5]), m = r.pick([4, 6, 10, 25]), E1 = r.pick([12, 30, 45, 80]);
        return {
          prompt: t`${r1} m from a small lamp the field amplitude of its light is ${E1} V/m. Treating the light as a spherical wave in open air, what is the amplitude ${r1 * m} m from the lamp, in V/m?`,
          visual: { type: 'graph', params: { x: [0, 1.15 * r1 * m], y: [0, 1.3 * E1], aspect: 'wide', xlabel: 'r (m)', ylabel: 'E₀ (V/m)', curves: [{ fn: `${E1 * r1}/x`, color: 'accent', width: 2.2, domain: [r1 * 0.6, 1.15 * r1 * m] }], points: [{ x: r1, y: E1, color: 'gold', label: `${E1} V/m` }, { x: r1 * m, y: (E1 * r1) / (r1 * m), color: 'warn', label: '?' }] }, caption: t`The amplitude of a spherical wave, $\mathcal A/r$.` },
          answer: E1 / m, units: 'V/m', tol: { rel: 0.005 },
          errors: [{ value: E1 / (m * m), feedback: t`That is how the **irradiance** falls, as $1/r^2$. The amplitude falls as $1/r$.` }],
          hints: [t`The amplitude is $\mathcal A/r$.`, t`Going ${m} times farther divides the amplitude by ${m}.`],
          teach: t`A spherical wave’s amplitude falls as $1/r$ so that its irradiance, $\propto$ amplitude², falls as $1/r^2$ and the power through every sphere is the same.`,
          explain: t`$E_0 \propto 1/r$: $${E1}/${m} = ${sf(E1 / m, 3)}$ V/m.`,
        };
      },
    }),
    num({
      id: 'inverse-square', difficulty: 2,
      gen(r) {
        const P = r.pick([2, 5, 10, 20]), km = r.pick([50, 120, 400, 800]);
        const I = P / (4 * PI * (km * 1e3) ** 2);
        return {
          prompt: t`A beacon on a spacecraft radiates ${P} W of visible light evenly in all directions. What irradiance reaches a telescope ${km} km away, in W/m²?`,
          visual: { type: 'graph', params: bare([-2, 6], [-2.2, 2.2], { curves: [1, 2, 3, 4].map((R) => ({ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [-1.0, 1.0], color: 'accent', width: 1.6 })), points: [{ x: 0, y: 0, r: 5, color: 'gold', label: 'beacon', labelDx: -10, labelDy: -14, labelAlign: 'right' }, { x: 5, y: 0, r: 5, color: 'ink2', label: 'telescope', labelAlign: 'center', labelDx: 0, labelDy: -14 }] }), caption: t`The same power crosses every sphere around the beacon. Not to scale.` },
          answer: I, units: 'W/m^2', tol: { rel: 0.01 },
          errors: [{ value: P / (4 * PI * km * 1e3), feedback: 'The power is spread over the area of a sphere, 4πr²: square the distance.' }, { value: P / (PI * (km * 1e3) ** 2), feedback: t`A sphere’s area is $4\pi r^2$, not $\pi r^2$.` }],
          hints: [t`$I = P/4\pi r^2$.`, t`Convert ${km} km to metres first.`],
          teach: t`From a point source radiating evenly, $I = P/4\pi r^2$: the inverse-square law.`,
          explain: t`$I = ${P}/\bigl(4\pi(${km}\times10^3)^2\bigr) = ${tex(I, 3)}$ W/m².`,
        };
      },
    }),
    num({
      id: 'sag', difficulty: 2,
      gen(r) {
        const D = r.pick([20, 40, 80, 150]), R = r.pick([5, 20, 50, 200]), nm = r.pick([550, 633, 850]);
        const a = D / 2000, w = (a * a) / (2 * R) / (nm * 1e-9);
        return {
          prompt: t`A point source ${R} m away lights an aperture ${D} mm across with ${nm} nm light. Across the aperture, how many waves does the wavefront at the edge lag the wavefront at the centre? (Use the paraxial sag $a^2/2R$.)`,
          visual: { type: 'graph', params: bare([-1, 6], [-1.6, 1.6], { curves: [...arcs(-4, [5.0, 5.5, 6.0], 0.42), { fn: '0', color: 'ink3', width: 1, dash: [4, 4], domain: [-1, 6] }], arrows: [{ from: [1.4, -1.4], to: [1.4, 1.4], color: 'ink3', width: 1.4, label: 'aperture' }], points: [{ x: 1, y: 0, r: 4, color: 'gold' }] }), caption: t`A curved wavefront crossing an aperture; the sag is greatly exaggerated.` },
          answer: w, units: '', tol: { rel: 0.01 },
          errors: [{ value: (4 * a * a) / (2 * R) / (nm * 1e-9), feedback: t`$a$ is the aperture’s **radius**, half the ${D} mm diameter.` }, { value: (a * a) / R / (nm * 1e-9), feedback: t`The sag of a sphere is $a^2/2R$: you left out the factor $\tfrac12$.` }],
          hints: [t`$a = ${D / 2}$ mm is the radius. The sag is $a^2/2R$.`, t`Divide the sag by the wavelength to count waves.`],
          teach: t`Across an aperture of radius $a$, a spherical wavefront of radius $R$ departs from flat by $a^2/2R$ — measure it in wavelengths to judge whether it counts as plane.`,
          explain: t`$a^2/2R = (${a})^2/(2\times${R}) = ${tex((a * a) / (2 * R), 3)}$ m $= ${sf(w, 3)}$ waves${w > 0.25 ? ' — far too curved to count as plane' : ' — flat enough to count as plane'}.`,
        };
      },
    }),
    expr({
      id: 'paraxial', difficulty: 3,
      prompt: t`At a screen a distance $z$ from a point source, the phase of a spherical wave at height $y$ is $k\sqrt{z^2 + y^2}$. Expand it for $y \ll z$, keeping terms up to $y^2$.`,
      visual: { type: 'graph', params: { x: [-1.5, 1.5], y: [0.9, 1.9], aspect: 'wide', xlabel: 'y/z', ylabel: 'phase/kz', curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.4 }, { fn: '1 + x^2/2', color: 'gold', width: 1.8, dash: [6, 4] }], legend: [{ label: 'exact √(1 + y²/z²)', color: 'accent' }, { label: 'your expansion, divided by kz', color: 'gold', dash: [6, 4] }], legendAt: 'tr' }, caption: t`The exact phase and its quadratic approximation, both divided by $kz$: they agree near the axis.` },
      answer: 'k z + k y^2/(2 z)', answerTeX: t`kz + \frac{ky^2}{2z}`,
      vars: { k: [1, 5], z: [2, 6], y: [0.01, 0.2] },
      errors: [{ answer: 'k z + k y^2/z', feedback: t`$\sqrt{1 + u} \approx 1 + u/2$: the correction carries a half.` }, { answer: 'k z', feedback: 'Keep the next term: it is the curvature of the wavefront, the whole point.' }, { answer: 'k z + k y/(2 z)', feedback: t`The small quantity is $y^2/z^2$, so the correction is quadratic in $y$.` }],
      hints: [t`Factor out $z$: $\sqrt{z^2 + y^2} = z\sqrt{1 + y^2/z^2}$.`, t`For small $u$, $\sqrt{1 + u} \approx 1 + u/2$.`],
      teach: t`Near the axis a spherical wave is a plane wave $e^{ikz}$ times a quadratic phase $e^{iky^2/2z}$: the curvature of its wavefront.`,
      explain: t`$k\sqrt{z^2 + y^2} = kz\sqrt{1 + y^2/z^2} \approx kz\bigl(1 + \tfrac{y^2}{2z^2}\bigr) = kz + \dfrac{ky^2}{2z}$. A lens works by adding (or removing) exactly such a quadratic phase: O4.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-collimator', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([30, 50, 60, 80]), nm = r.pick([550, 650, 700]);
        const a = D / 2000, R = (2 * a * a) / (nm * 1e-9);
        return {
          prompt: t`An engineer wants to test a star tracker (aperture ${D} mm across, working at ${nm} nm) with a small lamp instead of a star. How far away must the lamp be for its wavefront to be flat within a quarter wave across the aperture? Give the answer in metres.`,
          visual: { type: 'graph', params: bare([-3.2, 4], [-1.6, 1.6], { curves: arcs(-2.5, [3.4, 3.9, 4.4], 0.3), points: [{ x: -2.5, y: 0, r: 5, color: 'gold', label: 'lamp', labelDx: 0, labelDy: 14, labelAlign: 'center' }], shade: [{ fn: '0.55', lower: '-0.55', from: 2.6, to: 3.3, color: 'ink3', alpha: 0.5 }], arrows: [{ from: [-2.5, -1.35], to: [2.6, -1.35], color: 'ink2', width: 1.2, label: 'R = ?' }] }), caption: t`The star tracker (grey) and a lamp a distance $R$ away; the wavefront curvature is exaggerated.` },
          answer: R, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (2 * (D / 1000) ** 2) / (nm * 1e-9), feedback: t`$a$ is the radius, half the aperture’s diameter.` }, { value: (a * a) / (2 * nm * 1e-9), feedback: t`Set the sag $a^2/2R$ equal to $\lambda/4$, not to $\lambda$.` }],
          hints: [t`The sag across radius $a$ is $a^2/2R$.`, t`Require $a^2/2R \le \lambda/4$, so $R \ge 2a^2/\lambda$.`],
          teach: t`A point source at distance $R$ looks plane to an aperture of radius $a$ once $R \gtrsim 2a^2/\lambda$.`,
          explain: t`$R \ge 2a^2/\lambda = 2(${a})^2/(${nm}\times10^{-9}) = ${sf(R, 3)}$ m — about ${sf(R / 1000, 2)} km. That is why optical test benches use a **collimator**: a lamp at the focus of a lens or mirror makes the plane wave in a few metres.`,
        };
      },
    }),
    num({
      id: 'cp-nav-light', difficulty: 2,
      gen(r) {
        const P = r.pick([3, 8, 15]), km = r.pick([300, 420, 600]), A = r.pick([0.01, 0.05]);
        const I = P / (4 * PI * (km * 1e3) ** 2), Pw = I * A;
        return {
          prompt: t`A navigation light on an orbiting station radiates ${P} W of visible light evenly in all directions. An observer’s telescope ${km} km away has a collecting area of ${A} m². How much of the light’s power does it collect, in W?`,
          visual: { type: 'graph', params: { x: [km * 0.5, km * 1.6], y: [0, 2.2 * P / (4 * PI * (km * 0.5e3) ** 2) * 1e12], aspect: 'wide', xlabel: 'distance (km)', ylabel: 'irradiance (pW/m²)', curves: [{ fn: `${P}/(4*pi*(x*1000)^2)*1e12`, color: 'accent', width: 2.2 }], vlines: [{ x: km, label: `${km} km`, color: 'gold' }] }, caption: t`Irradiance from the light against distance: the inverse-square law, in pW/m².` },
          answer: Pw, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: I, feedback: 'That is the irradiance, in W/m². Multiply by the collecting area to get power.' }, { value: P * A / (4 * PI * km * 1e3), feedback: 'Square the distance: the power spreads over 4πr².' }],
          hints: [t`$I = P/4\pi r^2$, then power collected $= IA$.`],
          teach: t`A point source’s irradiance is $P/4\pi r^2$; a collector of area $A$ catches $IA$.`,
          explain: t`$I = ${P}/\bigl(4\pi(${km}\times10^3)^2\bigr) = ${tex(I, 3)}$ W/m², so the telescope collects $${tex(Pw, 3)}$ W. (In O2.3 you will count that in photons per second.)`,
        };
      },
    }),
    mcq({
      id: 'cp-curvature', difficulty: 2,
      prompt: t`Light from the same lamp falls on two apertures at the same distance: one 10 mm across, one 100 mm across. Which statement is right?`,
      visual: { type: 'graph', params: bare([-1, 6], [-2.2, 2.2], { curves: arcs(-3, [5.5], 0.5), shade: [{ fn: '0.25', lower: '-0.25', from: 2.4, to: 2.55, color: 'gold', alpha: 0.7 }, { fn: '2', lower: '-2', from: 3.1, to: 3.25, color: 'ink3', alpha: 0.5 }], points: [{ x: 2.45, y: 0.5, r: 0, label: 'small', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: -6 }, { x: 3.2, y: 2.05, r: 0, label: 'large', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: -4 }] }), caption: t`One wavefront and two apertures, side by side for comparison. Not to scale.` },
      choices: ['The wavefront sags 100 times more across the large aperture, so it is far less like a plane wave there.', 'The sag is 10 times more across the large aperture.', 'Both see the same curvature, since the distance is the same.', 'The small aperture sees more curvature, because its edges are closer to the axis.'],
      answer: 0,
      why: { 1: t`The sag grows as the **square** of the radius, $a^2/2R$.`, 2: t`The radius of curvature is the same, but the sag across the aperture is $a^2/2R$, which depends on the aperture’s size.`, 3: t`Closer to the axis means *less* sag: $a^2/2R$ shrinks with $a$.` },
      hints: [t`The sag across radius $a$ is $a^2/2R$.`],
      teach: t`Whether a wave counts as plane depends on the aperture as well as the distance: the sag $a^2/2R$ grows as the aperture’s size squared.`,
      explain: t`Ten times the radius gives $10^2 = 100$ times the sag. Big telescopes need their test sources farther away (or a collimator).`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §2.7–2.9', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'IAU 2015 Resolution B3 (nominal solar luminosity)', url: 'https://www.iau.org/static/resolutions/IAU2015_English.pdf' },
  ],
});
