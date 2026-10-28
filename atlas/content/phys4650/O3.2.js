// Fermat's principle (Hecht §4.5). PHYS 3550 M3.4 derived Snell's law from
// least time with the lifeguard, the mirage, the ellipse and a graded fibre;
// this lesson takes the optics angle and goes further: the optical path
// length OPL = ∫n ds is phase divided by k₀; Fermat's principle is
// stationarity, not minimality (a tight concave mirror gives a maximum); an
// image is a point that every path reaches with the same OPL — the reason a
// lens has the shape it has and a telescope mirror is a paraboloid; in a
// layered medium it gives n sin θ = const, so the refraction of starlight by a
// flat atmosphere depends only on the index at the observer, R ≈ (n₀ − 1)tan z.
// Ends with the labelled pointer to gravitational lensing as Fermat's
// principle in curved spacetime (deflection 4GM/c²b), for the course boss.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, GM_SUN, R_SUN, ARCSEC, DEG, sf, nOf, MATS, bare } from './_op.js';

const t = String.raw;
const N0 = 2.78e-4;     // refractivity of dry air at 15 °C, 101.325 kPa, 550 nm (Edlén/Ciddor; approximate)

// the worked example: refraction of starlight seen at 45° and 75° from the zenith
const EX = { z1: 45, z2: 75 };
EX.R1 = N0 * Math.tan(EX.z1 * DEG) / ARCSEC;
EX.R2 = N0 * Math.tan(EX.z2 * DEG) / ARCSEC;

/** A flat layered atmosphere and a ray from a star bending toward the vertical as it descends (schematic). */
function atmosphere(caption, extra = {}) {
  const bands = [0, 1, 2, 3, 4].map((k) => ({ fn: `${sf(0.4 * (k + 1), 3)}`, lower: `${sf(0.4 * k, 3)}`, from: -3, to: 3, color: 'accent', alpha: sf(0.32 - 0.06 * k, 2) }));
  return {
    type: 'graph',
    params: bare([-3, 3], [-0.15, 2.4], {
      shade: bands,
      curves: [
        { param: ['-2.6 + 1.6*t - 0.2*t^2', '2.2 - t'], t: [0, 2.2], color: 'gold', width: 2.4 },
        { param: ['-0.048 - 0.72*t', 't'], t: [0, 2.3], color: 'gold', width: 1.2, dash: [4, 4] },
        { fn: '0', color: 'ink3', width: 2 },
      ],
      points: [{ x: -0.048, y: 0, r: 5, color: 'ink', label: 'observer', labelDx: 10, labelDy: 12 }, { x: 1.2, y: 2.25, r: 0, label: 'thinner air', color: 'ink2' }, { x: 1.2, y: 0.2, r: 0, label: 'denser air', color: 'ink2' }],
      ...extra,
    }),
    caption,
  };
}

/** A paraboloidal mirror (opening to the right) with parallel rays reflected to its focus; f in drawing units. */
function paraboloid(caption) {
  const f = 2, ys = [-1.4, -0.7, 0.7, 1.4];
  const curves = [{ param: [`t^2/${4 * f}`, 't'], t: [-1.7, 1.7], color: 'ink', width: 3 }];
  for (const y of ys) {
    const xm = (y * y) / (4 * f);
    curves.push({ param: [`${sf(4.5 - (4.5 - xm) * 0, 4)} - t*${sf(4.5 - xm, 4)}`, `${y}`], t: [0, 1], color: 'gold', width: 1.6 });
    curves.push({ param: [`${sf(xm, 4)} + t*${sf(f - xm, 4)}`, `${sf(y, 4)}*(1 - t)`], t: [0, 1], color: 'gold', width: 1.6 });
  }
  return { type: 'graph', params: bare([-0.5, 4.6], [-1.9, 1.9], { curves, points: [{ x: f, y: 0, r: 5, color: 'warn', label: 'focus', labelDy: -12 }] }), caption };
}

export default lesson({
  id: 'phys4650.O3.2',
  title: 'Fermat’s principle',
  minutes: 14, difficulty: 3,
  intro: t`In [PHYS 3550 M3.4](#/lesson/phys3550.M3.4) a lifeguard’s fastest route gave Snell’s law. Optics states the principle with the **optical path length**, the distance weighted by the index:

$$\text{OPL} = \int_S^P n(s)\,ds,\qquad \delta(\text{OPL}) = 0$$

Light travels between two points along a path whose OPL is **stationary**: unchanged, to first order, by any small deformation. Usually that is a minimum; it can be a maximum or a saddle. The OPL is also the phase: a path of OPL $L$ accumulates phase $k_0L$. So an **image** is a point that many paths reach with the *same* OPL — they arrive in step and add up. A lens or a telescope mirror is a device for equalizing optical paths, and in curved spacetime the same principle bends starlight round the Sun.`,
  symbols: [
    { tex: '\\text{OPL}', text: t`the optical path length, in m: the distance light would cover in vacuum in the same time, so the travel time is $\text{OPL}/c$` },
    { tex: 'n(s)', text: 'the refractive index along the path, which may vary from point to point' },
    { tex: 'ds', text: 'an element of length along the path, in m' },
    { tex: 'S,\\ P', text: 'the start and end points of the path' },
    { tex: '\\delta', text: 'the first-order change in OPL when the path is deformed slightly; zero for a real ray' },
  ],
  why: t`Fermat’s principle explains every law of geometrical optics in one line, tells you why lenses and mirrors have the shapes they do, and is how general relativity’s light bending is computed.`,
  visual: {
    type: 'graph',
    title: 'Why a lens focuses: equal optical paths',
    lead: t`Starlight (a plane wave) passes a perfect lens of focal length 100 mm and 25 mm aperture, and arrives at a point on the axis a distance $z$ behind it. The curve is the OPL of the path through the lens at height $h$, minus that of the central path, in waves of 550 nm. Where the curve is flat, every path arrives in step.`,
    tasks: [
      t`At $z = 100$ mm the curve is flat: every path has the same OPL. Each is stationary — that is what a focus is.`,
      t`Move $z$ by half a millimetre: the edges are now several waves out of step and their light cancels — the point is dark. Only the central path stays stationary.`,
      t`The lens’s glass delays the central path most (it is thickest there), exactly enough to make up for the longer geometric path at the edges.`,
    ],
    params: {
      x: [-12.5, 12.5], y: [-15, 15], aspect: 'wide', xlabel: 'height h through the lens (mm)', ylabel: 'OPL difference (waves)', yticks: 6,
      sliders: [{ key: 'z', label: 'Distance behind the lens $z$', min: 96, max: 104, step: 0.1, value: 101, unit: '\\mathrm{mm}', explain: 'Where on the axis the paths are compared; the lens’s focal length is 100 mm.' }],
      curves: [{ fn: '(sqrt(z^2 + x^2) - z - (sqrt(10000 + x^2) - 100))/0.00055', color: 'accent', width: 2.4 }],
      readouts: [{ label: 'edge path difference', expr: '(sqrt(z^2 + 156.25) - z - (sqrt(10156.25) - 100))/0.00055', unit: '\\text{waves}', digits: 3 }],
    },
    caption: t`A perfect lens modelled as a thin phase plate that adds $f - \sqrt{f^2 + h^2}$ of path at height $h$ (exactly right for a star on the axis). Real lenses with spherical surfaces add spherical aberration on top.`,
  },
  example: {
    prompt: t`Treat the atmosphere as flat, horizontal layers whose index falls from $n_0 = 1 + ${tex(N0, 3)}$ at the ground to 1 in space. Use Fermat’s principle to find how far refraction lifts a star seen ${EX.z1}° from the zenith, and one seen ${EX.z2}° from the zenith, in arcseconds.`,
    visual: atmosphere(t`The ray from a star (solid) bends toward the vertical as the air thickens; the observer sees the star along the ray’s final direction (dashed, extended back), higher in the sky than it really is. Bending hugely exaggerated.`),
    steps: [
      { label: 'Stationary path in layers', text: t`At each boundary between layers the path is stationary only if $n_1\sin\theta_1 = n_2\sin\theta_2$ (Snell’s law, which M3.4 derived from Fermat). Chained through every layer, $n\sin\theta$ is the **same** all the way down.` },
      { label: 'Only the ends matter', text: t`In space $n = 1$ and the angle is the true zenith distance $z_t$; at the ground the angle is the observed one $z_o$. So $\sin z_t = n_0\sin z_o$, whatever the layers in between.` },
      { label: 'Small difference', text: t`With $z_t = z_o + R$ and $R$ tiny: $\sin z_o + R\cos z_o = n_0\sin z_o$, so $R = (n_0 - 1)\tan z_o$.` },
      { label: 'Numbers', text: t`At ${EX.z1}°: $R = ${tex(N0, 3)}\times\tan ${EX.z1}^\circ$ rad $= ${sf(EX.R1, 3)}''$. At ${EX.z2}°: $${sf(EX.R2, 3)}''$.` },
      { label: 'Sense check', text: t`Measured values are about 58″ and 3.5′. Near the horizon the flat-layer model fails (Earth’s curvature matters) and refraction reaches about 34′ — more than the Sun’s diameter, so at sunset the Sun is already below the true horizon.` },
    ],
    answer: t`$R \approx ${sf(EX.R1, 2)}''$ at ${EX.z1}° and $\approx ${sf(EX.R2, 3)}''$ at ${EX.z2}° from the zenith: $R = (n_0 - 1)\tan z$.`,
  },
  practice: [
    num({
      id: 'opl-stack', difficulty: 1,
      gen(r) {
        const g = r.pick([2, 3, 5]), w = r.pick([4, 6, 10]), a = r.pick([5, 8, 12]);
        const ng = nOf('bk7', 589.3), nw = nOf('water', 589.3);
        const L = ng * g + nw * w + a;
        return {
          prompt: t`Yellow light (589 nm) crosses, at normal incidence, ${g} mm of crown glass ($n = ${sf(ng, 4)}$), ${w} mm of water ($n = ${sf(nw, 4)}$) and ${a} mm of air ($n = 1.000$). What is its total optical path length, in mm?`,
          visual: { type: 'graph', params: bare([0, g + w + a], [-2, 2], { shade: [{ fn: '1.6', lower: '-1.6', from: 0, to: g, color: 'teal', alpha: 0.35 }, { fn: '1.6', lower: '-1.6', from: g, to: g + w, color: 'accent', alpha: 0.25 }], arrows: [{ from: [0, 0], to: [g + w + a, 0], color: 'gold', width: 2.4 }], points: [{ x: g / 2, y: 1.8, r: 0, label: 'glass', color: 'teal', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: g + w / 2, y: 1.8, r: 0, label: 'water', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: g + w + a / 2, y: 1.8, r: 0, label: 'air', color: 'ink3', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }), caption: t`The three layers, thicknesses to scale.` },
          answer: L, units: 'mm', tol: { rel: 0.001 },
          errors: [{ value: g + w + a, feedback: 'That is the geometric length. Weight each layer by its index.' }],
          hints: [t`$\text{OPL} = \sum n_id_i$.`],
          teach: t`The OPL adds each thickness times its index: it is the vacuum distance that takes the same time.`,
          explain: t`$${sf(ng, 4)}(${g}) + ${sf(nw, 4)}(${w}) + ${a} = ${sf(L, 4)}$ mm, which light crosses in $${sf((L * 1e-3 / C) * 1e12, 3)}$ ps.`,
        };
      },
    }),
    mcq({
      id: 'not-least', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “Fermat’s principle says light always takes the path of **least** time. So light from a point P reflecting off a concave mirror to a point Q must take the shortest of the paths via the mirror.” What is wrong?`,
      visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.7, 1.2], { curves: [{ param: ['1.5*cos(t)', '-1.5*sin(t)'], t: [0.35, 2.79], color: 'ink', width: 3 }, { param: ['-0.6 + 0.6*t', '0.4 - 1.9*t'], t: [0, 1], color: 'gold', width: 2 }, { param: ['0.6*t', '-1.5 + 1.9*t'], t: [0, 1], color: 'gold', width: 2 }, { param: ['-0.6 + 1.0*t', '0.4 - 1.846*t'], t: [0, 1], color: 'ink3', width: 1.2, dash: [4, 4] }, { param: ['0.4 + 0.2*t', '-1.446 + 1.846*t'], t: [0, 1], color: 'ink3', width: 1.2, dash: [4, 4] }], points: [{ x: -0.6, y: 0.4, r: 5, color: 'accent', label: 'P', labelDx: -16 }, { x: 0.6, y: 0.4, r: 5, color: 'accent', label: 'Q' }] }), caption: t`A real reflection (gold) and a neighbouring path via another point of the mirror (dashed). Schematic.` },
      choices: ['The principle requires only a stationary OPL; for a mirror curved more tightly than the ellipse through P and Q, the real path is a maximum.', 'Nothing: reflection always takes the least time.', 'Fermat’s principle does not apply to reflection, only refraction.', 'Light takes the longest path whenever it reflects.'],
      answer: 0,
      why: { 1: 'Compare with the ellipse with foci P and Q that touches the mirror at the reflection point: every path via the ellipse has the same length; a mirror bending inside it gives longer real paths than its neighbours.', 2: 'Fermat’s principle covers reflection too; it gives the equal-angle law.', 3: 'A plane mirror gives a minimum. It depends on the mirror’s curvature compared with the ellipse.' },
      hints: ['Picture the ellipse with foci P and Q that touches the mirror at the reflection point.', 'Along the ellipse every path P → ellipse → Q has the same length. Is the mirror inside or outside it near the touching point?'],
      teach: 'Fermat’s principle is a stationary principle: the real ray’s OPL can be a minimum, a maximum or a saddle.',
      explain: 'Only the first variation must vanish. Paths via mirror points that lie inside the tangent ellipse are shorter, so when the mirror curves more tightly than the ellipse the real path is a local maximum. Stationarity is what matters for interference: nearby paths then arrive in step.',
    }),
    num({
      id: 'mirror-sag', difficulty: 2,
      gen(r) {
        const D = r.pick([150, 200, 300, 400]), N = r.pick([3, 4, 5, 8]);
        const f = D * N, sag = (D / 2) ** 2 / (4 * f), dsph = (D / 2) ** 4 / (64 * f ** 3) * 1000;
        return {
          prompt: t`A telescope mirror ${D} mm across is to focus starlight at $f = ${f}$ mm (an f/${N} mirror). Equal optical paths from a plane wavefront to the focus make it a paraboloid, $z = r^2/4f$. How deep is it at its edge, compared with its centre, in mm?`,
          visual: paraboloid(t`A paraboloidal mirror: every path from the incoming plane wavefront (from the right) to the focus has the same length. Depth exaggerated.`),
          answer: sag, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: (D ** 2) / (4 * f), feedback: t`Use the radius, $r = D/2$, not the diameter.` }, { value: (D / 2) ** 2 / (2 * f), feedback: t`For a paraboloid of focal length $f$ the depth is $r^2/4f$; $r^2/2R$ uses the radius of curvature $R = 2f$.` }],
          hints: [t`$r = ${D / 2}$ mm.`, t`$z = r^2/4f$.`],
          teach: t`A paraboloid makes every path from a plane wavefront to its focus equal — the shape Fermat’s principle demands for a perfect star image.`,
          explain: t`$z = (${D / 2})^2/(4\times${f}) = ${sf(sag, 3)}$ mm. A sphere of radius $2f$ differs from it at the edge by only about $r^4/64f^3 = ${sf(dsph, 2)}$ µm — but that is ${dsph > 1 ? 'several wavelengths' : 'about a wavelength'}, enough to blur the star, which is why telescope mirrors are figured to a small fraction of a wavelength.`,
        };
      },
    }),
    num({
      id: 'lens-thickness', difficulty: 3,
      gen(r) {
        const f = r.pick([50, 100, 150, 200]), D = r.pick([20, 25, 40]), mat = r.pick(['bk7', 'silica', 'sf11']);
        const n = nOf(mat, 587.56), h = D / 2, dt = (h * h) / (2 * f * (n - 1));
        return {
          prompt: t`A thin plano-convex lens of ${MATS[mat].name} ($n = ${sf(n, 4)}$) is ${D} mm across with focal length ${f} mm. From equal optical paths, the extra geometric path at height $h$ to the focus, $\approx h^2/2f$, must be made up by glass the edge lacks: $(n - 1)\Delta t = h^2/2f$. How much thicker is the lens at its centre than at its edge, in mm?`,
          visual: { type: 'graph', params: { x: [-1.3 * h, 1.3 * h], y: [-0.4 * dt, 1.8 * dt], aspect: 'wide', xlabel: 'height h (mm)', ylabel: '', yticks: 0, shade: [{ fn: `${sf(dt * 1.3, 4)} - x^2/${sf(2 * f * (n - 1), 5)}`, lower: '0', from: -h, to: h, color: 'teal', alpha: 0.4 }], curves: [{ fn: `${sf(dt * 1.3, 4)} - x^2/${sf(2 * f * (n - 1), 5)}`, color: 'teal', width: 2, domain: [-h, h] }], arrows: [{ from: [0, 0.3 * dt], to: [0, 1.3 * dt], color: 'gold', width: 2, label: 'Δt = ?' }] }, caption: t`The lens’s profile, lying flat; vertical scale exaggerated. Its thickness falls off as $h^2$.` },
          answer: dt, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: (h * h) / (2 * f), feedback: t`That is the path the glass must make up; glass adds only $(n - 1)$ per unit thickness.` }, { value: (D * D) / (2 * f * (n - 1)), feedback: t`$h$ is the radius, half the diameter.` }],
          hints: [t`At the edge, $h = ${h}$ mm.`, t`$\Delta t = h^2/[2f(n - 1)]$.`],
          teach: t`A lens is a phase plate: its thickness profile, $\propto h^2$, adds just the optical path needed to make every path to the focus equal.`,
          explain: t`$\Delta t = ${h}^2/[2\times${f}\times${sf(n - 1, 4)}] = ${sf(dt, 3)}$ mm.`,
        };
      },
    }),
    num({
      id: 'star-refraction', difficulty: 2,
      gen(r) {
        const z = r.pick([20, 30, 50, 60, 70]), [p, where] = r.pick([[1, 'at sea level'], [0.62, 'on a mountain observatory (pressure 0.62 atm, temperature like sea level)']]);
        const N = N0 * p, R = N * Math.tan(z * DEG) / ARCSEC;
        return {
          prompt: t`A star is observed ${z}° from the zenith ${where}. At sea level the air’s refractivity is $n_0 - 1 = ${tex(N0, 3)}$, and refractivity is proportional to pressure at fixed temperature. In the flat-layer model, by how many arcseconds does refraction lift the star?`,
          visual: atmosphere(t`Starlight bending through flat layers of air; the bending is exaggerated enormously.`),
          answer: R, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: N * Math.sin(z * DEG) / ARCSEC, feedback: t`The small-angle result is $(n_0 - 1)\tan z$, not $\sin z$.` }, { value: N * Math.tan(z * DEG), feedback: 'That is in radians; 1 rad = 206 265″.' }],
          hints: [t`$R = (n_0 - 1)\tan z$ in radians, with $n_0$ the index where the observer is.`, t`Multiply radians by 206 265 to get arcseconds.`],
          teach: t`Fermat’s principle in flat layers gives $R = (n_0 - 1)\tan z$: only the index at the observer matters.`,
          explain: t`$n_0 - 1 = ${tex(N, 3)}$, so $R = ${tex(N, 3)}\tan ${z}^\circ = ${sf(R, 3)}''$.`,
        };
      },
    }),
    mcq({
      id: 'only-ground', difficulty: 3,
      prompt: t`In the flat-layer model, the refraction of starlight depends only on the index at the observer — not on how the index varies with height. Why?`,
      visual: atmosphere(t`Starlight crossing flat layers of air (schematic).`),
      choices: ['Snell’s law at every layer boundary keeps n sin θ the same all the way down, so only its values in space and at the ground enter.', 'Refraction happens only in the lowest layer, where the air is densest.', 'The upper layers have n exactly 1, so they do nothing.', 'The bends in the upper layers cancel in pairs.'],
      answer: 0,
      why: { 1: 'Every layer bends the ray a little; the bends add up. What is fixed is the invariant n sin θ.', 2: 'Their index is slightly above 1 and they do bend the ray — but the total bending is fixed by the ends.', 3: 'All the bends are in the same sense (toward the vertical); none cancel.' },
      hints: [t`Write Snell’s law at two successive boundaries and chain them.`, t`$n_1\sin\theta_1 = n_2\sin\theta_2 = n_3\sin\theta_3 = \dots$`],
      teach: t`In a medium stratified in one direction, Fermat’s principle conserves $n\sin\theta$ (the analogue of a conserved momentum).`,
      explain: t`Chaining Snell’s law, $\sin z_t = n_0\sin z_o$ whatever lies between. Only when the layers are curved — near the horizon — does the profile matter.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-airborne', difficulty: 3, transfer: true,
      gen(r) {
        const [alt, p, T] = r.pick([[5.5, 0.50, 252], [12, 0.19, 217], [20, 0.054, 217]]), z = r.pick([40, 55, 65]);
        const N = N0 * p * (288 / T), R = N * Math.tan(z * DEG) / ARCSEC;
        return {
          prompt: t`An aircraft’s star tracker at ${alt} km altitude (pressure ${p} atm, temperature ${T} K) sights a star ${z}° from the zenith. At sea level (1 atm, 288 K) the refractivity is $${tex(N0, 3)}$, and refractivity is proportional to the air’s density, $\propto p/T$. How large is the refraction correction, in arcseconds? (Flat-layer model.)`,
          visual: atmosphere(t`Only the air above the aircraft bends the starlight; the index at the aircraft fixes the total (schematic).`, { points: [{ x: -0.048, y: 0, r: 5, color: 'ink', label: 'aircraft', labelDx: 10, labelDy: 12 }] }),
          answer: R, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: N0 * Math.tan(z * DEG) / ARCSEC, feedback: 'That is the sea-level value. Only the index at the observer matters: scale the refractivity by the density there.' }, { value: N0 * p * Math.tan(z * DEG) / ARCSEC, feedback: t`Density goes as $p/T$: the cold air at altitude is denser than its pressure alone suggests.` }],
          hints: [t`$n - 1$ at the aircraft $= ${tex(N0, 3)}\times(p/1\ \text{atm})\times(288\ \text{K}/T)$.`, t`$R = (n - 1)\tan z$, converted to arcseconds.`],
          teach: t`Refraction is set by the index where you stand: an airborne tracker sees much less of it.`,
          explain: t`$n - 1 = ${tex(N, 3)}$, so $R = ${sf(R, 3)}''$. Aircraft and missile celestial navigation systems apply exactly this correction.`,
        };
      },
    }),
    mcq({
      id: 'cp-focus', difficulty: 2,
      prompt: t`In terms of Fermat’s principle, what makes a point an image of a star?`,
      visual: { type: 'graph', params: { x: [-12.5, 12.5], y: [-4, 4], aspect: 'wide', xlabel: 'height through the lens (mm)', ylabel: 'OPL difference (waves)', yticks: 4, curves: [{ fn: '0', color: 'accent', width: 2.6 }] }, caption: t`The optical path to one special point, against where the path crosses the lens.` },
      choices: ['Every path from the star to that point through the lens has the same OPL, so all arrive in phase.', 'Only one path reaches it, the one of least time.', 'The paths through the lens edge are shortest, so most light goes there.', 'The glass bends all rays toward the thickest part of the lens.'],
      answer: 0,
      why: { 1: 'At an image point infinitely many paths are stationary at once — that is what concentrates the light.', 2: 'Through a converging lens the edge paths are geometrically longer and the centre ones optically delayed; at the image they balance exactly.', 3: 'Rays bend toward the thicker part, but the reason is the equalized optical path; “toward the thickest part” would not put them all at one point.' },
      hints: ['When do contributions from many paths add up rather than cancel?'],
      teach: 'An image is a point that a whole family of paths reaches with equal OPL — the paths arrive in phase.',
      explain: t`Equal OPL means equal phase $k_0\,\text{OPL}$, so the light from the whole aperture adds constructively there. Elsewhere the paths differ by many waves and their contributions cancel.`,
    }),
    num({
      id: 'cp-lensing', difficulty: 3, transfer: true,
      gen(r) {
        const [what, GM, b, bt] = r.pick([
          ['grazing the Sun’s limb', GM_SUN, R_SUN, t`R_\odot`],
          ['passing two solar radii from the Sun’s centre', GM_SUN, 2 * R_SUN, t`2R_\odot`],
          ['passing ten solar radii from the Sun’s centre', GM_SUN, 10 * R_SUN, t`10R_\odot`],
          ['grazing the white dwarf Sirius B (1.02 solar masses, radius 0.0084 solar radii)', 1.02 * GM_SUN, 0.0084 * R_SUN, t`0.0084R_\odot`],
        ]);
        const a = (4 * GM) / (C * C * b), as = a / ARCSEC;
        return {
          prompt: t`Near a mass $M$, weak gravity acts on light like an index $n \approx 1 + 2GM/rc^2$ (a model of curved spacetime, not a real medium). Integrating the index gradient across the path gives a deflection $\alpha = 4GM/c^2b$ for a ray passing at distance $b$. What is the deflection of starlight ${what}, in arcseconds? ($GM_\odot = ${tex(GM_SUN, 5)}$ m³/s², $R_\odot = ${tex(R_SUN, 4)}$ m.)`,
          visual: { type: 'gr-lensing', params: { beta: 0.2 }, caption: t`A point-mass lens bending light from a background galaxy into two images, or a ring when aligned. Ray-traced in the weak-field approximation; angles in the side view are hugely exaggerated.` },
          answer: as, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: as / 2, feedback: t`$2GM/c^2b$ is the “Newtonian” value (light as a fast particle). The effective index counts space curvature too and doubles it: $4GM/c^2b$.` }, { value: a, feedback: 'That is in radians: 1 rad = 206 265″.' }],
          hints: [t`$b = ${bt}$.`, t`$\alpha = 4GM/c^2b$ in radians; multiply by 206 265 for arcseconds.`],
          teach: t`Light passing a mass at impact parameter $b$ is deflected by $4GM/c^2b$: 1.75″ at the Sun’s limb.`,
          explain: t`$\alpha = 4GM/c^2b = ${tex(a, 3)}$ rad $= ${sf(as, 3)}''$.

> **Pointer — gravitational lensing is Fermat’s principle in curved spacetime.** In general relativity light follows null geodesics, and in a static spacetime they obey a Fermat principle: the arrival time is stationary. The effective index $1 + 2GM/rc^2$ is that statement in weak gravity, and it gives the factor 2 that Eddington’s 1919 eclipse expedition first tested (radio interferometry now confirms it to about $10^{-4}$). The images of a lensed quasar sit at the stationary points of its arrival time — a minimum, a saddle, sometimes a maximum — and a source directly behind the lens becomes an **Einstein ring**. See [Light bends: eclipses, lenses and Einstein rings](#/lesson/gr.S24.i); you will build an Einstein Ring Observatory as this course’s final challenge.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §4.5 (Fermat’s principle)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'P. E. Ciddor, Refractive index of air: new equations for the visible and near infrared, Appl. Opt. 35, 1566 (1996)', url: 'https://doi.org/10.1364/AO.35.001566' },
    { label: 'V. Perlick, Gravitational lensing from a spacetime perspective, Living Rev. Relativ. 7, 9 (2004)', url: 'https://link.springer.com/article/10.12942/lrr-2004-9' },
  ],
});
