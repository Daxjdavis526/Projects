// Mirrors (Hecht §5.4, §6.3), aimed at telescopes. PHYS 2220 O2.1 did the
// mirror equation and Hubble's prime focus; here a mirror is a ray-transfer
// matrix — a lens of focal length R/2 that folds the light back — and two of
// them make a Cassegrain telescope. A sphere's edge rays focus short (≈ h²/8f);
// a paraboloid is perfect on axis; a Ritchey–Chrétien pair of hyperboloids
// also cancels coma. Hubble's real prescription (R₁ = 11.04 m, R₂ = 1.358 m
// convex, 4.906 m apart: f = 57.6 m, f/24, focus 1.5 m behind the primary;
// secondary magnification 10.4 and a focus that moves 110 times as far as the
// secondary); plate scale; JWST's 18 segments (1.32 m flat to flat, 7 mm gaps,
// f/20, 131.4 m). Uses op2-bench (folded Cassegrain, exact rays). Transfers:
// JWST's plate scale, Hubble's 1990 spherical aberration from the as-built
// conic (−1.0139 instead of −1.0023): edge and inner rays focus ≈ 38 mm apart.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sf } from './_op.js';
import { B, bench, HUBBLE, hubbleEls } from './_op2.js';

const t = String.raw;
const AS = 206264.806;            // arcseconds per radian

// the worked example: Hubble's Cassegrain from its prescription
const EX = { f1: -HUBBLE.R1 / 2, f2: HUBBLE.R2 / 2, d: HUBBLE.d };
EX.c = B.cardinal(hubbleEls());
EX.f = EX.c.f;
EX.m2 = EX.f / EX.f1;
EX.N = EX.f / HUBBLE.D;
EX.back = EX.c.zF2;                // focus behind the primary vertex, m
EX.scale = AS / (EX.f * 1000);     // arcsec per mm
if (Math.abs(B.twoLensF(EX.f1, EX.f2, EX.d) - EX.f) > 1e-9) throw new Error('O4.3 Hubble');

/** Hubble drawn folded, in metres. */
const hubble = (caption, extra = {}) => bench({
  elements: hubbleEls(), source: 'inf', rays: 6, annulus: true, fill: [0.35, 1], x: [-5.4, 2.4], y: [-1.6, 1.6], start: -5.4, marks: ['F2'], readout: false, unit: 'm', ...extra,
}, caption);

/** One spherical (k = 0) or paraboloidal (k = −1) mirror of focal length f and aperture D (mm), exact rays. */
const oneMirror = (f, D, k, caption, extra = {}) => bench({
  elements: [{ kind: 'mirror', z: 0, R: -2 * f, k, ap: D / 2 }], source: 'inf', rays: 9, fill: [-1, 1], trace: 'exact', x: [-1.25 * f, 0.08 * f], y: [-0.7 * D, 0.7 * D], marks: ['F2'], readout: false, ...extra,
}, caption);

// JWST's primary: 18 hexagons, 1.32 m flat to flat, 7 mm gaps (schematic orientation)
const HEX = (() => {
  const p = 1.327, out = [];
  for (let k = 0; k < 6; k++) { const a = (Math.PI / 3) * k + Math.PI / 6; out.push([p * Math.cos(a), p * Math.sin(a)], [2 * p * Math.cos(a), 2 * p * Math.sin(a)]); }
  for (let k = 0; k < 6; k++) { const a = (Math.PI / 3) * k; out.push([p * Math.sqrt(3) * Math.cos(a), p * Math.sqrt(3) * Math.sin(a)]); }
  return out;
})();
// Hubble as built: where inner (0.33 m) and edge (1.2 m) rays cross the axis, beyond the paraxial focus (mm)
const FLAW = { inner: B.longitudinal(hubbleEls(-1.0139), 0.33) * 1000, edge: B.longitudinal(hubbleEls(-1.0139), 1.2) * 1000 };
FLAW.spread = FLAW.edge - FLAW.inner;

const jwstPic = (caption) => ({
  type: 'graph', caption,
  params: { x: [-3.6, 3.6], y: [-3.4, 3.4], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: HEX.map(([cx, cy]) => ({ param: [`${sf(cx, 5)} + 0.66*cos(t)/cos(t - (pi/3)*floor(3*t/pi) - pi/6)`, `${sf(cy, 5)} + 0.66*sin(t)/cos(t - (pi/3)*floor(3*t/pi) - pi/6)`], t: [0, 6.2832], color: 'gold', width: 2 })),
    points: [{ x: 0, y: 0, r: 0, label: 'empty', color: 'ink3', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 2.65, y: -3.05, r: 0, label: '6.5 m', color: 'ink2' }] },
});

export default lesson({
  id: 'phys4650.O4.3',
  title: 'Mirrors',
  minutes: 18, difficulty: 3,
  intro: t`A curved mirror bends every wavelength the same way — no dispersion, so no colour error — and can be made metres across, which is why every large telescope is built from mirrors. For paraxial rays a spherical mirror of radius $R$ acts exactly like a thin lens of focal length $R/2$, except that it sends the light back. Unfold the path and its ray-transfer matrix is

$$\mathcal M = \begin{pmatrix} 1 & 0 \\ -\dfrac{2}{R} & 1 \end{pmatrix}$$

so a telescope of two mirrors is two “lenses” a distance $d$ apart ([O4.2](#/lesson/phys4650.O4.2)). A concave primary and a smaller convex secondary make a **Cassegrain** telescope: a long focal length folded into a short tube, with the focus behind a hole in the primary.`,
  symbols: [
    { tex: 'R', text: t`the mirror’s radius of curvature, in m; in this matrix $R > 0$ for a concave (converging) mirror and $R < 0$ for a convex one (Hecht writes the mirror equation with the opposite sign convention for $R$; only the focal length’s sign matters here)` },
    { tex: 'f = R/2', text: t`the mirror’s focal length: where parallel light comes to a focus, half way to the centre of curvature` },
    { tex: '\\mathcal M', text: t`the matrix acting on $(y, \theta)$, with $\theta$ measured from the direction the light travels, before and after the bounce` },
  ],
  why: t`The course’s observatory, Hubble and JWST are Cassegrain telescopes; their focal lengths, f-numbers and plate scales come straight out of this matrix.`,
  visual: {
    title: 'Hubble’s Cassegrain',
    lead: t`Starlight hits Hubble’s 2.4 m concave primary (right), reflects to the 0.27 m convex secondary, and comes back through the primary’s central hole to a focus behind it. Move the secondary, switch to exact rays, and read the system’s focal length.`,
    tasks: [
      t`The system focal length is about 57.6 m — ten times the primary’s 5.52 m — in a tube under 5 m long. The secondary magnifies the primary’s image by $m_2 \approx 10.4$.`,
      t`Move the secondary 1 mm: the focus moves about 11 cm. Hubble is focused by nudging its secondary micrometres.`,
      t`Switch to exact rays: with the design conics (both hyperboloids) the rays meet at one point.`,
    ],
    ...hubble(t`Hubble’s mirrors (Ritchey–Chrétien prescription), drawn folded as built; incoming rays miss the secondary and the primary’s hole. Heights exaggerated slightly; the mirrors’ depths are to scale. The back focal distance is measured from the secondary.`, {
      readouts: ['f', 'bfd', 'matrix'], readout: true, toggle: true,
      controls: [{ key: 'd', label: 'Mirror separation $d$', min: 4.88, max: 4.93, step: 0.001, value: 4.906, unit: '\\mathrm{m}', explain: 'Distance from the primary’s vertex to the secondary’s (design: 4.906 m).', set: [[1, 'z', -1, 0]] }],
    }),
  },
  example: {
    prompt: t`Hubble’s primary has $R_1 = ${-HUBBLE.R1}$ m (concave) and a 2.4 m aperture; its secondary is convex with $|R_2| = ${-HUBBLE.R2}$ m, ${HUBBLE.d} m in front of the primary. Find the telescope’s effective focal length, its f-number, where the focus lies, and its plate scale.`,
    visual: hubble(t`Paraxial rays through Hubble’s two mirrors; $F'$ is the telescope’s focus behind the primary. Heights slightly exaggerated.`),
    steps: [
      { label: 'Each mirror as a lens', text: t`Primary: $f_1 = R_1/2 = ${sf(EX.f1, 4)}$ m (f/${sf(EX.f1 / HUBBLE.D, 2)} on its own). Secondary: $f_2 = ${sf(EX.f2, 4)}$ m, negative because it is convex.` },
      { label: 'The pair', text: t`Unfolded, the two are “lenses” $d = ${HUBBLE.d}$ m apart: $\dfrac{1}{f} = \dfrac{1}{f_1} + \dfrac{1}{f_2} - \dfrac{d}{f_1f_2}$, so $f = ${sf(EX.f, 4)}$ m. (The published value is 57.6 m; the last digit depends on how the prescription is rounded.)` },
      { label: 'Where the focus is', text: t`The back focal distance, $-A/C = f(1 - d/f_1) = ${sf(EX.c.bfd, 4)}$ m from the secondary, back toward the primary — so $${sf(EX.back, 3)}$ m **behind** the primary’s vertex, through its hole.` },
      { label: 'Secondary magnification', text: t`$m_2 = f/f_1 = ${sf(EX.m2, 3)}$: the secondary enlarges the primary’s image ten times. The f-number is $N = f/D = ${sf(EX.N, 3)}$ — Hubble is f/24.` },
      { label: 'Plate scale', text: t`An angle $\alpha$ on the sky lands $f\alpha$ from the axis. One arcsecond, $1/206\,265$ rad, becomes $${sf((EX.f * 1e6) / AS, 3)}\ \mu\text{m}$, so the plate scale is $${sf(EX.scale, 3)}''$ per mm.` },
    ],
    answer: t`$f = ${sf(EX.f, 3)}$ m, f/${sf(EX.N, 2)}, focus $${sf(EX.back, 2)}$ m behind the primary, $${sf(EX.scale, 3)}''$ per mm.`,
  },
  practice: [
    num({
      id: 'sphere-sa', difficulty: 2,
      gen(r) {
        const D = r.pick([150, 200, 250, 300]), N = r.pick([3, 4, 5, 6]);
        const f = N * D, lsa = -B.longitudinal([{ kind: 'mirror', z: 0, R: -2 * f, k: 0, ap: D / 2 }], D / 2);
        return {
          prompt: t`A spherical mirror ${D} mm across with $f = ${f}$ mm (f/${N}) reflects starlight. Exact tracing finds that a ray at the mirror’s edge crosses the axis short of the paraxial focus by about $h^2/8f$. How far short, in mm?`,
          visual: oneMirror(f, D, 0, t`Exact rays from a star reflected by a sphere; $F'$ is the paraxial focus. The edge rays cross short of it. Heights exaggerated.`),
          answer: lsa, units: 'mm', tol: { rel: 0.03 },
          errors: [{ value: (D * D) / (8 * f), feedback: t`$h$ is the ray’s height: the radius, $D/2$, not the diameter.` }, { value: (D * D) / 4 / (4 * f), feedback: t`The shift is $h^2/8f$ (or $h^2/4R$ with $R = 2f$).` }].filter((e) => Math.abs(e.value - lsa) > 0.05 * lsa),
          hints: [t`$h = D/2 = ${D / 2}$ mm.`, t`$\Delta \approx h^2/8f$.`],
          teach: t`A sphere’s edge rays focus short by about $h^2/8f$: spherical aberration, which grows fast as the f-number falls.`,
          explain: t`$\Delta \approx ${D / 2}^2/(8\times${f}) = ${sf((D * D) / 4 / (8 * f), 3)}$ mm (exact tracing: $${sf(lsa, 3)}$ mm). A paraboloid ($z = r^2/4f$) has none on axis, which is why telescope primaries are paraboloids or hyperboloids.`,
        };
      },
    }),
    mcq({
      id: 'paraboloid', difficulty: 2,
      prompt: t`Why are large telescope primaries made paraboloidal (or hyperboloidal) rather than spherical, even though a sphere is far easier to grind and test?`,
      visual: oneMirror(300, 300, -1, t`Exact rays from a star on the axis reflected by a paraboloid: all meet at $F'$. Heights exaggerated.`),
      choices: ['A sphere’s edge rays focus short of its centre rays (spherical aberration); a paraboloid sends every ray from an on-axis star to one point.', 'A paraboloid has a shorter focal length for the same radius.', 'A paraboloid has no chromatic aberration and a sphere does.', 'A sphere cannot form a real image of a star.'],
      answer: 0,
      why: { 1: t`Paraxially both have $f = R/2$ at the vertex; they differ away from the axis.`, 2: 'No mirror has chromatic aberration: reflection does not depend on wavelength.', 3: 'A sphere forms a real image — a slightly blurred one.' },
      hints: ['Think about rays far from the axis.', 'Which surface makes every path from a plane wavefront to the focus equal (O3.2)?'],
      teach: 'A paraboloid is the surface of equal optical path from a distant point source to its focus: no spherical aberration on axis.',
      explain: t`For a sphere of radius $R$ the edge rays cross the axis about $h^2/4R$ short. A paraboloid fixes that exactly on axis, but off axis it suffers **coma**; a Ritchey–Chrétien design (two hyperboloids, as in Hubble and JWST) cancels both over a wider field.`,
    }),
    num({
      id: 'cass-f', difficulty: 2,
      gen(r) {
        const [D, N1] = r.pick([[0.2, 2.5], [0.28, 2], [0.36, 3], [0.5, 3]]), m = r.pick([4, 5, 6]);
        const f1 = N1 * D, f = m * f1;
        // the secondary puts the focus 0.15 m behind the primary: f(1 − d/f₁) = d + 0.15 m
        const back = 0.15, d = (f - back) / (1 + m);
        const fsec = ((f1 - d) * f) / (f1 - f);
        const fc = B.twoLensF(f1, fsec, d);
        return {
          prompt: t`An amateur Cassegrain telescope has a ${sf(D * 1000, 3)} mm primary with $f_1 = ${sf(f1 * 1000, 4)}$ mm and a convex secondary with $f_2 = ${sf(fsec * 1000, 4)}$ mm, ${sf(d * 1000, 4)} mm in front of the primary. What is the telescope’s effective focal length, in mm?`,
          visual: bench({ elements: [{ kind: 'mirror', z: 0, R: -2 * f1 * 1000, ap: D * 500, hole: D * 110, label: 'primary' }, { kind: 'mirror', z: -d * 1000, R: 2 * fsec * 1000, ap: D * 500 * (1 - d / f1) * 1.1, label: 'secondary' }], source: 'inf', rays: 6, annulus: true, fill: [0.3, 1], x: [-d * 1150, 0.3 * 1000], y: [-D * 650, D * 650], start: -d * 1150, marks: [], readout: false }, t`The two mirrors folded as built, paraxial rays; the focus behind the primary is not marked. Heights exaggerated.`),
          answer: fc * 1000, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: ((f1 * fsec) / (f1 + fsec)) * 1000, feedback: 'You left out the separation: −d/(f₁f₂) is part of the power.' }, { value: f1 * 1000, feedback: 'That is the primary alone. The convex secondary lengthens it.' }],
          hints: [t`Treat each mirror as a lens of the same focal length (the secondary’s negative).`, t`$f = \dfrac{f_1f_2}{f_1 + f_2 - d}$.`],
          teach: 'A Cassegrain is two thin lenses in disguise: the convex secondary multiplies the primary’s focal length.',
          explain: t`$f = \dfrac{(${sf(f1 * 1000, 4)})(${sf(fsec * 1000, 4)})}{${sf(f1 * 1000, 4)} + (${sf(fsec * 1000, 4)}) - ${sf(d * 1000, 4)}} = ${sf(fc * 1000, 4)}$ mm: f/${sf(fc / D, 3)}, ${m} times the primary’s.`,
        };
      },
    }),
    num({
      id: 'focus-sens', difficulty: 3,
      gen(r) {
        const dd = r.pick([2, 5, 10, 20]);   // µm toward the primary
        const c0 = B.cardinal(hubbleEls()), c1 = B.cardinal([hubbleEls()[0], { ...hubbleEls()[1], z: -HUBBLE.d + dd * 1e-6 }]);
        const shift = (c1.zF2 - c0.zF2) * 1000;
        return {
          prompt: t`Hubble’s secondary is moved ${dd} µm toward the primary. Using the system’s matrix (or the result that the focus moves about $m_2^2 + 1$ times as far, with $m_2 = ${sf(EX.m2, 3)}$), how far does the focus behind the primary move, in mm?`,
          visual: hubble(t`Hubble’s mirrors; a tiny motion of the small secondary moves the focus a long way. Heights exaggerated.`),
          answer: shift, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: dd * 1e-3, feedback: 'The focus moves much farther than the mirror: the secondary’s magnification enters squared.' }, { value: EX.m2 * dd * 1e-3, feedback: t`Longitudinal magnification goes as $m_2^2$, not $m_2$ — plus one for the mirror’s own move.` }],
          hints: [t`Longitudinal (along-axis) magnification is the square of the transverse one.`, t`Focus shift $\approx (m_2^2 + 1)\,\delta$, with $\delta = ${dd}$ µm.`],
          teach: t`Along the axis, an image moves $m^2$ times as far as its object: a Cassegrain’s focus is extremely sensitive to the secondary’s position.`,
          explain: t`$(${sf(EX.m2, 3)}^2 + 1)\times ${dd}\ \mu\text{m} = ${sf(shift, 3)}$ mm. Hubble’s focus is adjusted by moving the secondary a few micrometres; the tube’s length must be held stable to a similar precision as temperatures change.`,
        };
      },
    }),
    mcq({
      id: 'fnumber-error', difficulty: 2, kind: 'error',
      prompt: t`A student reads that Hubble’s primary is f/2.3 and concludes: “Hubble’s camera works at f/2.3, so a star’s image is spread over a cone 1/2.3 as wide as it is long.” What is wrong?`,
      visual: hubble(t`The light cone after the secondary converges slowly to the focus behind the primary. Heights exaggerated.`),
      choices: ['The camera sees the whole telescope: after the convex secondary the beam converges at f/24, the effective focal length over the aperture.', 'Nothing: the f-number is fixed by the primary.', 'Hubble works at f/1.15, half the primary’s f-number, because there are two mirrors.', 'f-numbers do not apply to mirrors.'],
      answer: 0,
      why: { 1: 'The secondary changes the cone: it multiplies the focal length by m₂ ≈ 10.4 with the same 2.4 m aperture.', 2: 'The convex secondary lengthens the focal length; it does not halve the f-number.', 3: 'N = f/D applies to any focusing system.' },
      hints: [t`$N = f/D$ with the **system’s** focal length.`],
      teach: t`The f-number at the instruments is the system’s: $N = f_{\text{eff}}/D$.`,
      explain: t`$N = 57.6\ \text{m}/2.4\ \text{m} = 24$. The primary alone is f/2.3, which made it hard to make (a deep, steep surface), but the light reaching the cameras converges at f/24.`,
    }),
    num({
      id: 'jwst-segments', difficulty: 1,
      prompt: t`JWST’s primary is 18 hexagonal segments, each 1.32 m across its flats. A regular hexagon of flat-to-flat width $w$ has area $\tfrac{\sqrt3}{2}w^2$. Ignoring the 7 mm gaps, what is the primary’s collecting area, in m²?`,
      visual: jwstPic(t`JWST’s primary seen face-on: 18 hexagonal segments, 1.32 m across the flats, with no segment at the centre. Schematic; the 7 mm gaps are too narrow to show.`),
      answer: 18 * (Math.sqrt(3) / 2) * 1.32 * 1.32, units: 'm^2', tol: { rel: 0.005 },
      errors: [{ value: Math.PI * 3.25 * 3.25, feedback: 'That is a full 6.5 m circle; the segments do not fill it.' }, { value: 19 * (Math.sqrt(3) / 2) * 1.32 * 1.32, feedback: 'There are 18 segments: the central position is empty (the secondary would block it anyway).' }],
      hints: [t`One segment: $\tfrac{\sqrt3}{2}(1.32)^2$ m².`],
      teach: 'A segmented mirror collects light over the sum of its segments’ areas.',
      explain: t`$18\times 0.866\times 1.32^2 = ${sf(18 * (Math.sqrt(3) / 2) * 1.32 * 1.32, 3)}$ m² (before the secondary’s shadow), about 6 times Hubble’s 4.5 m². The segments only act as one mirror if their surfaces agree to a few tens of nanometres; actuators behind each set its tilt, piston and curvature.`,
    }),
    {
      type: 'slider', id: 'set-secondary', difficulty: 3,
      prompt: t`Hubble’s instruments need the focus 1.600 m behind the primary’s vertex (the dark bar), slightly beyond the design’s 1.508 m. Move the secondary until the focus lands there. (Positions are in mm beyond 4.900 m.)`,
      visual: bench({ elements: [...hubbleEls(), { kind: 'screen', z: 1.6, ap: 0.12, label: 'detector' }], source: 'inf', rays: 6, annulus: true, fill: [0.35, 1], x: [-5.4, 2.4], y: [-1.6, 1.6], start: -5.4, marks: ['F2'], readout: false, unit: 'm', clip: false,
        controls: [{ key: 'dmm', label: 'Separation beyond 4.900 m', min: 0, max: 12, step: 0.05, value: 6, unit: '\\mathrm{mm}', explain: 'How far beyond 4.900 m the secondary sits in front of the primary.', set: [[1, 'z', -0.001, -4.9]] }] },
      t`Hubble folded, with a detector plane 1.600 m behind the primary. The focus ($F'$) moves about 110 mm for every millimetre the secondary moves.`),
      param: 'dmm', answer: [5.05, 5.30],
      instruction: 'Set the secondary so that F′ sits on the detector, then check.',
      hints: [t`The focus must move $1.600 - 1.508 = 0.092$ m farther back.`, t`It moves about $m_2^2 + 1 \approx 110$ times as far as the secondary, the other way: move the secondary about $0.092/110 \approx 0.84$ mm **toward** the primary, to about 5.2 mm beyond 4.900 m.`],
      teach: 'Moving a Cassegrain’s secondary toward the primary pushes the focus out behind it, about m² times as far.',
      explain: t`The exact solution is a separation of 4.90517 m: 0.83 mm closer than the design. The focal length changes too (by about 1.3%), so the plate scale shifts with it.`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-jwst-scale', difficulty: 2, transfer: true,
      gen(r) {
        const [a, what] = r.pick([[1, '1″'], [0.1, '0.1″'], [0.068, 'the 0.068″ diffraction limit at 2 µm']]);
        const x = 131.4e6 * (a / AS);
        return {
          prompt: t`JWST’s telescope has an effective focal length of 131.4 m (f/20). How far apart, in µm, are the images of two stars separated by ${what} on the sky, at the telescope’s focus?`,
          visual: jwstPic(t`JWST’s 18-segment primary (schematic). Its secondary turns this 6.5 m mirror into a 131.4 m focal length.`),
          answer: x, units: 'um', tol: { rel: 0.005 },
          errors: [{ value: 131.4e6 * a, feedback: 'Convert the angle to radians first: 1″ = 4.848 × 10⁻⁶ rad.' }, { value: 131.4e6 * (a / 3600) * (Math.PI / 180) * 20, feedback: 'The f-number does not enter: the separation is f times the angle.' }],
          hints: [t`$x = f\alpha$ with $\alpha$ in radians.`, t`$1'' = 1/206\,265$ rad.`],
          teach: t`Plate scale: an angle $\alpha$ lands $f\alpha$ away at the focus — 637 µm per arcsecond for JWST.`,
          explain: t`$x = 131.4\ \text{m}\times\alpha = ${sf(x, 3)}$ µm. JWST’s instruments then reimage this focal plane onto 18 µm pixels at the scale each camera needs.`,
        };
      },
    }),
    num({
      id: 'cp-hubble-flaw', difficulty: 4, transfer: true,
      prompt: t`Hubble’s primary was polished to the wrong conic constant: $k = -1.0139$ instead of the design’s $-1.0023$ — at the edge it is about 2 µm too flat. Exact ray tracing through the as-built mirrors gives the distances beyond the paraxial focus where rays cross the axis: $+${sf(FLAW.inner, 2)}$ mm for rays entering 0.33 m from the axis, $+${sf(FLAW.edge, 3)}$ mm for rays at the 1.2 m edge. Over what length along the axis is the light from a star spread, in mm?`,
      visual: bench({ elements: hubbleEls(-1.0139), source: 'inf', rays: 12, annulus: true, fill: [0.28, 1], trace: 'exact', x: [1.495, 1.565], y: [-0.0022, 0.0022], start: -5.4, marks: ['F2'], readout: false, unit: 'm' }, t`Exact rays from a star through Hubble’s mirrors as built, magnified around the focus ($F'$, paraxial): the outer rays cross farther back than the inner ones. Heights magnified much more than lengths.`),
      answer: sf(FLAW.edge, 3) - sf(FLAW.inner, 2), units: 'mm', tol: { rel: 0.01 },
      errors: [{ value: sf(FLAW.edge, 3), feedback: 'That is measured from the paraxial focus; but no rays travel near the axis — the central obstruction blocks them. Subtract the innermost rays’ crossing.' }, { value: sf(FLAW.edge, 3) + sf(FLAW.inner, 2), feedback: 'Both crossings lie on the same side of the paraxial focus: subtract, do not add.' }],
      hints: [t`The innermost rays that get past the secondary’s shadow cross ${sf(FLAW.inner, 2)} mm beyond the paraxial focus.`, 'The spread is the difference between the edge rays’ crossing and the inner rays’.'],
      teach: 'Spherical aberration spreads a star’s light along the axis between the inner and outer zones’ foci.',
      explain: t`$${sf(FLAW.edge, 3)} - ${sf(FLAW.inner, 2)} = ${sf(sf(FLAW.edge, 3) - sf(FLAW.inner, 2), 3)}$ mm. A 2 µm error at the edge of a 2.4 m mirror — a few wavelengths — spread each star into a halo. The 1993 servicing mission fitted corrective optics (COSTAR and the WFPC2 camera) with the opposite aberration built in.`,
    }),
    mcq({
      id: 'cp-rc', difficulty: 3,
      prompt: t`A classical Cassegrain (paraboloidal primary) is perfect for a star on the axis. Hubble and JWST instead use a Ritchey–Chrétien design with two hyperboloids. What does that buy?`,
      visual: hubble(t`Exact rays through Hubble’s Ritchey–Chrétien mirrors, for a star on the axis. Heights exaggerated.`, { trace: 'exact' }),
      choices: ['Freedom from coma as well as spherical aberration, so stars stay sharp across a wider field of view.', 'A shorter focal length for the same tube.', 'Removal of chromatic aberration.', 'A focus in front of the primary instead of behind it.'],
      answer: 0,
      why: { 1: 'The focal length is set by the paraxial curvatures and the spacing, not the conics.', 2: 'Mirrors have no chromatic aberration to remove.', 3: 'The focus position is a paraxial property; both designs put it behind the primary.' },
      hints: ['Paraxial properties (focal length, focus position) depend only on the vertex curvatures.', 'Which aberration appears for stars off the axis?'],
      teach: 'Conic constants change only rays far from the axis: two of them can cancel two aberrations, spherical aberration and coma.',
      explain: t`With two free conics, the designer cancels both third-order spherical aberration and coma. A paraboloidal primary leaves coma, which smears off-axis stars into comet shapes; Hubble’s wide-field cameras need the flat, sharp field the Ritchey–Chrétien gives.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §5.4 and §6.3 (mirrors, aberrations)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'M. D. Lallo, Experience with the Hubble Space Telescope: 20 years of an archetype, Opt. Eng. 51, 011011 (2012)', url: 'https://arxiv.org/abs/1203.0002' },
    { label: 'The Hubble Space Telescope Optical Systems Failure Report (Allen et al., NASA, 1990)', url: 'https://ntrs.nasa.gov/citations/19910003124' },
    { label: 'L. D. Feinberg et al., The James Webb Space Telescope mission: optical telescope element design, development and performance, PASP 136 (2024); arXiv:2301.01779', url: 'https://arxiv.org/abs/2301.01779' },
  ],
});
