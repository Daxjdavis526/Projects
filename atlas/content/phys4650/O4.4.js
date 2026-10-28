// Prisms and fibres (Hecht §5.5–5.6). PHYS 2220 O1.2 met the critical
// angle, a fibre's acceptance angle and a prism at minimum deviation; here:
// the deviation curve δ(θ₁) and why its minimum is the symmetric path; the
// index from the minimum deviation, n = sin((A + δ_m)/2)/sin(A/2), which is
// how glass makers measure it; dispersion across the F, d and C lines and
// the Abbe number (N-BK7 64.2, F2 36.4, from SCHOTT's Sellmeier fits); thin
// wedges, δ ≈ (n − 1)A, and Risley-prism beam steering. Fibres: the
// numerical aperture NA = √(n₁² − n₂²) from TIR at the core wall, launching
// from water, intermodal dispersion Δt = (Ln₁/c)(n₁/n₂ − 1) and its bit-rate
// limit, why long links are single-mode. Transfer pointer: the fibre-optic
// gyroscope (Sagnac phase 2πLDΩ/λc; the interferometry is O7).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, DEG, sf, nOf, MATS } from './_op.js';
import { B } from './_op2.js';

const t = String.raw;
const LINES = { F: 486.13, d: 587.56, C: 656.27 };
const nl = (mat, k) => nOf(mat, LINES[k]);
const dmin = (A, n) => B.minDeviation(A * DEG, n) / DEG;

// the worked example: a 60° prism of N-BK7 on a spectrometer
const EX = { A: 60, mat: 'bk7' };
for (const k of ['F', 'd', 'C']) EX[k] = { n: nl('bk7', k), dm: dmin(60, nl('bk7', k)) };
EX.V = (EX.d.n - 1) / (EX.F.n - EX.C.n);
// recover n from the rounded measured deviations, as a student would
for (const k of ['F', 'd', 'C']) EX[k].m = +EX[k].dm.toFixed(3), EX[k].nBack = Math.sin(((60 + EX[k].m) / 2) * DEG) / Math.sin(30 * DEG);
EX.Vback = (EX.d.nBack - 1) / (EX.F.nBack - EX.C.nBack);

/** A prism from the optics-rays bench. */
const prismPic = (mat, apex, angle, caption, extra = {}) => ({ type: 'optics-rays', params: { mode: 'prism', mat, apex, angle, light: 'white', controls: false, readout: false, ...extra }, caption });
/** A step-index fibre from the optics-rays bench. */
const fibrePic = (nCore, nClad, angle, caption, extra = {}) => ({ type: 'optics-rays', params: { mode: 'fibre', nCore, nClad, angle, controls: false, readout: false, ...extra }, caption });

/** δ(θ₁) for a prism, x and y in degrees, as a graph expression. */
const devExpr = (n, A = 'A') => `x + asin(${n}*sin(${A}*pi/180 - asin(sin(x*pi/180)/${n})))*180/pi - ${A}`;

/** The modal spread of a step-index fibre in ns per km. */
const modal = (n1, n2) => B.modalSpread(n1, n2) * 1e3 * 1e9;

/** A fibre-gyro coil as a picture: a loop with two counter-propagating beams. */
const coilPic = (caption) => ({
  type: 'graph', caption,
  params: { x: [-2.6, 2.6], y: [-1.5, 1.5], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink2', width: 5 }, { param: ['1.12*cos(t)', '1.12*sin(t)'], t: [0.3, 2.6], color: 'gold', width: 2 }, { param: ['0.88*cos(t)', '0.88*sin(t)'], t: [0.6, 2.9], color: 'teal', width: 2 }],
    arrows: [{ from: [1.12 * Math.cos(2.45), 1.12 * Math.sin(2.45)], to: [1.12 * Math.cos(2.6), 1.12 * Math.sin(2.6)], color: 'gold', width: 2 }, { from: [0.88 * Math.cos(0.75), 0.88 * Math.sin(0.75)], to: [0.88 * Math.cos(0.6), 0.88 * Math.sin(0.6)], color: 'teal', width: 2 }],
    points: [{ x: -2.1, y: 1.1, r: 0, label: 'clockwise beam', color: 'teal' }, { x: -2.1, y: -1.2, r: 0, label: 'fibre coil, diameter D', color: 'ink2' }, { x: 1.2, y: 1.2, r: 0, label: 'counterclockwise', color: 'gold' }, { x: 1.3, y: -0.9, r: 0, label: 'coil turning at rate Ω', color: 'violet' }] },
});

export default lesson({
  id: 'phys4650.O4.4',
  title: 'Prisms and fibres',
  minutes: 16, difficulty: 3,
  intro: t`A prism and a fibre are both refraction put to work. A **prism** bends light by an angle that depends on the index — and so on the colour — and is least when the ray crosses symmetrically. At that **minimum deviation** $\delta_m$ Snell’s law at either face gives

$$n = \frac{\sin\frac{A + \delta_m}{2}}{\sin\frac{A}{2}}$$

which is how the index of a glass is measured to six decimals. A **fibre** traps light by total internal reflection: rays entering within its **numerical aperture** $\text{NA} = \sqrt{n_1^2 - n_2^2}$ stay in the core. Rays at different angles take paths of different length, so a short pulse spreads — modal dispersion — unless the core is so thin that only one path, one mode, survives.`,
  symbols: [
    { tex: 'n', text: 'the prism glass’s refractive index at the wavelength used (the prism sits in air)' },
    { tex: 'A', text: 'the apex angle of the prism, between its two refracting faces' },
    { tex: '\\delta_m', text: 'the minimum deviation: the smallest angle between the ray going in and the ray coming out, reached when the ray crosses the prism parallel to its base' },
    { tex: 'n_1,\\ n_2', text: 'in a fibre, the indices of the core and of the cladding around it ($n_1 > n_2$)' },
    { tex: '\\text{NA}', text: t`the numerical aperture, $\sin\theta_{\max}$ for a fibre in air: the sine of the widest angle to the axis at which light is accepted` },
  ],
  why: t`Prisms sort starlight into spectra and steer laser beams; fibres carry the data, the laser light of comm terminals, and the light of fibre-optic gyroscopes in spacecraft.`,
  visual: {
    type: 'graph',
    title: 'The deviation curve',
    lead: t`How far a prism turns light, $\delta$, against the angle of incidence on its first face, $\theta_1$, for blue (486 nm), yellow (588 nm) and red (656 nm) light. Change the apex angle and the glass.`,
    tasks: [
      t`Each curve has a minimum: near it, $\delta$ hardly changes with $\theta_1$, so a prism there is forgiving to set up — and the ray inside runs parallel to the base.`,
      t`Switch from crown (N-BK7) to flint (F2): the curves rise, and the blue–red spread at minimum deviation (readout) grows from 0.7° to 1.7°. Flint glass disperses colours about twice as strongly (Abbe numbers 64 and 36).`,
      t`Raise the apex angle: the curves end on the left where the ray can no longer leave the second face (total internal reflection).`,
    ],
    params: {
      x: [20, 90], y: [10, 90], aspect: 'wide', xlabel: 'angle of incidence θ₁ (°)', ylabel: 'deviation δ (°)',
      sliders: [{ key: 'A', label: 'Apex angle $A$', min: 30, max: 70, step: 1, value: 60, unit: '^\\circ', explain: 'The angle between the prism’s two faces.' }],
      choices: [{ key: 'm', label: 'Glass', options: [[1, 'Crown (N-BK7)'], [2, 'Flint (F2)']], value: 1, explain: 'Indices from SCHOTT’s Sellmeier fits.' }],
      curves: [
        { fn: devExpr(`(${sf(nl('bk7', 'F'), 6)} + (m - 1)*${sf(nl('f2', 'F') - nl('bk7', 'F'), 6)})`), color: 'accent', width: 2.2 },
        { fn: devExpr(`(${sf(nl('bk7', 'd'), 6)} + (m - 1)*${sf(nl('f2', 'd') - nl('bk7', 'd'), 6)})`), color: 'gold', width: 2.2 },
        { fn: devExpr(`(${sf(nl('bk7', 'C'), 6)} + (m - 1)*${sf(nl('f2', 'C') - nl('bk7', 'C'), 6)})`), color: 'bad', width: 2.2 },
      ],
      readouts: [{ label: 'minimum deviation (yellow) $\\delta_m$', expr: `2*asin((${sf(nl('bk7', 'd'), 6)} + (m - 1)*${sf(nl('f2', 'd') - nl('bk7', 'd'), 6)})*sin(A*pi/360))*180/pi - A`, unit: '^\\circ', digits: 4 },
        { label: 'blue − red at minimum', expr: `2*(asin((${sf(nl('bk7', 'F'), 6)} + (m - 1)*${sf(nl('f2', 'F') - nl('bk7', 'F'), 6)})*sin(A*pi/360)) - asin((${sf(nl('bk7', 'C'), 6)} + (m - 1)*${sf(nl('f2', 'C') - nl('bk7', 'C'), 6)})*sin(A*pi/360)))*180/pi`, unit: '^\\circ', digits: 3 }],
      legend: [{ label: 'blue 486 nm', color: 'accent' }, { label: 'yellow 588 nm', color: 'gold' }, { label: 'red 656 nm', color: 'bad' }], legendAt: 'tr',
    },
    caption: t`Exact Snell’s-law deviation through a prism in air, from catalogue indices at the Fraunhofer F, d and C lines. A curve stops where the ray cannot leave the second face.`,
  },
  example: {
    prompt: t`A glass maker puts a ${EX.A}° prism of N-BK7 on a spectrometer and measures the minimum deviation at three spectral lines: $${EX.F.m}^\circ$ (blue F, 486.1 nm), $${EX.d.m}^\circ$ (yellow d, 587.6 nm) and $${EX.C.m}^\circ$ (red C, 656.3 nm). Find the three indices and the glass’s Abbe number $V = (n_d - 1)/(n_F - n_C)$.`,
    visual: prismPic('crown', 60, 49, t`White light through a 60° crown-glass prism near minimum deviation: blue is bent most. Exact Snell’s law with catalogue dispersion.`),
    steps: [
      { label: 'Why the minimum', text: t`At minimum deviation the ray inside runs parallel to the base, so it meets both faces at the same angle, $A/2$ inside the glass. Outside, the two angles are equal too: $\theta_1 = (A + \delta_m)/2$.` },
      { label: 'Snell at one face', text: t`$\sin\theta_1 = n\sin(A/2)$, so $n = \dfrac{\sin\frac{A + \delta_m}{2}}{\sin\frac{A}{2}}$, with $\sin 30^\circ = 0.5$ in the denominator.` },
      { label: 'Three indices', text: t`$n_F = ${sf(EX.F.nBack, 6)}$, $n_d = ${sf(EX.d.nBack, 6)}$, $n_C = ${sf(EX.C.nBack, 6)}$. (Catalogue: 1.52238, 1.51680, 1.51432.)` },
      { label: 'Abbe number', text: t`$V = \dfrac{${sf(EX.d.nBack, 6)} - 1}{${sf(EX.F.nBack, 6)} - ${sf(EX.C.nBack, 6)}} = ${sf(EX.Vback, 3)}$. A high $V$ means weak dispersion: crown glass. Flint glasses have $V$ below 50.` },
      { label: 'Sense check', text: t`A thousandth of a degree in $\delta_m$ moves $n$ by about $10^{-5}$, so a careful spectrometer measures the index to the fifth decimal — and the Abbe number to a few tenths of a percent, worse because it divides by the small difference $n_F - n_C \approx 0.008$.` },
    ],
    answer: t`$n_F = ${sf(EX.F.nBack, 6)}$, $n_d = ${sf(EX.d.nBack, 6)}$, $n_C = ${sf(EX.C.nBack, 6)}$; $V \approx ${sf(EX.Vback, 3)}$.`,
  },
  practice: [
    num({
      id: 'n-from-dmin', difficulty: 2,
      gen(r) {
        const mat = r.pick(['bk7', 'f2', 'sf11', 'silica']), A = r.pick([45, 50, 60]), k = r.pick(['F', 'd', 'C']);
        const n = nl(mat, k), dm = +dmin(A, n).toFixed(2), nb = Math.sin(((A + dm) / 2) * DEG) / Math.sin((A / 2) * DEG);
        return {
          prompt: t`A ${A}° prism of an unknown glass gives a minimum deviation of $${dm}^\circ$ for light of ${LINES[k]} nm. What is its index at that wavelength?`,
          visual: prismPic(MATS[mat].key, A, sf((A + dm) / 2, 3), t`The prism near minimum deviation, here with white light; the readout of the deviation is hidden.`, { light: 'mono', lambda: Math.round(LINES[k]) }),
          answer: nb, tol: { rel: 2e-4 },
          errors: [{ value: Math.sin(((A + dm) / 2) * DEG) / Math.sin(A * DEG), feedback: t`The denominator is $\sin(A/2)$: inside the glass the ray meets each face at half the apex angle.` }, { value: Math.sin((A + dm) * DEG) / Math.sin(A * DEG), feedback: t`Halve both angles: $n = \sin\frac{A + \delta_m}{2}/\sin\frac{A}{2}$.` }],
          hints: [t`$n = \sin\dfrac{A + \delta_m}{2}\Big/\sin\dfrac{A}{2}$.`],
          teach: 'At minimum deviation the path is symmetric, so one Snell’s law gives the index from two measured angles.',
          explain: t`$n = \sin(${sf((A + dm) / 2, 4)}^\circ)/\sin(${A / 2}^\circ) = ${sf(nb, 5)}$ — ${MATS[mat].name}.`,
        };
      },
    }),
    num({
      id: 'colour-spread', difficulty: 3,
      gen(r) {
        const mat = r.pick(['bk7', 'f2', 'sf11']), A = r.pick([45, 60]);
        const th1 = Math.asin(nl(mat, 'd') * Math.sin((A / 2) * DEG));      // set for yellow minimum deviation
        const dF = B.prismDeviation(A * DEG, nl(mat, 'F'), th1) / DEG, dC = B.prismDeviation(A * DEG, nl(mat, 'C'), th1) / DEG;
        const spread = dF - dC;
        return {
          prompt: t`A ${A}° prism of ${MATS[mat].name} is set at minimum deviation for yellow light ($n_d = ${sf(nl(mat, 'd'), 6)}$, angle of incidence $${sf(th1 / DEG, 4)}^\circ$). Keeping that angle of incidence, how far apart, in degrees, do blue ($n_F = ${sf(nl(mat, 'F'), 6)}$) and red ($n_C = ${sf(nl(mat, 'C'), 6)}$) light leave?`,
          visual: prismPic(MATS[mat].key, A, sf(th1 / DEG, 3), t`White light through the prism at yellow’s minimum deviation; the colours fan out. Exact Snell’s law with catalogue dispersion.`),
          answer: spread, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: (nl(mat, 'F') - nl(mat, 'C')) * A, feedback: t`$(n_F - n_C)A$ is the thin-prism result; at ${A}° the prism is not thin. Trace both colours through both faces.` }],
          hints: [t`For each colour: $\theta_2 = \arcsin(\sin\theta_1/n)$, $\theta_3 = A - \theta_2$, $\theta_4 = \arcsin(n\sin\theta_3)$, $\delta = \theta_1 + \theta_4 - A$.`, t`Do it for $n_F$ and $n_C$ and subtract.`],
          teach: 'A prism’s angular dispersion grows with the glass’s dispersion and with the apex angle.',
          explain: t`$\delta_F = ${sf(dF, 5)}^\circ$ and $\delta_C = ${sf(dC, 5)}^\circ$: they differ by $${sf(spread, 3)}^\circ$. Near minimum deviation $d\delta/dn = 2\sin(A/2)/\cos\theta_1 = ${sf((2 * Math.sin((A / 2) * DEG)) / Math.cos(th1), 3)}$, and $(n_F - n_C)$ times that gives nearly the same.`,
        };
      },
    }),
    mcq({
      id: 'why-minimum', difficulty: 2,
      prompt: t`Why does the deviation of a prism have a minimum, at which the ray crosses symmetrically?`,
      visual: { type: 'graph', params: { x: [25, 90], y: [30, 70], aspect: 'wide', xlabel: 'angle of incidence θ₁ (°)', ylabel: 'deviation δ (°)', curves: [{ fn: devExpr(sf(nl('bk7', 'd'), 6), '60'), color: 'gold', width: 2.4 }] }, caption: t`The deviation of yellow light by a 60° N-BK7 prism against the angle of incidence.` },
      choices: ['The light path is reversible: angles θ₁ and θ₄ give the same deviation as θ₄ and θ₁, so a single extremum must sit where θ₁ = θ₄.', 'Because the glass absorbs least light there.', 'Because the ray inside then meets the second face at the critical angle.', 'Because Snell’s law is linear in the angles there.'],
      answer: 0,
      why: { 1: 'Absorption has nothing to do with the geometry of deviation.', 2: 'At the critical angle the ray grazes out of the second face — that is the left end of the curve, the largest deviation.', 3: 'Snell’s law is never linear in the angles for a prism this size; the symmetry argument needs no approximation.' },
      hints: ['Run the ray backward: what is its deviation?', 'If the curve has one minimum and swapping θ₁ and θ₄ gives the same δ, where must the minimum be?'],
      teach: 'Reversibility makes δ(θ₁) symmetric under θ₁ ↔ θ₄, so its single minimum is the symmetric path.',
      explain: t`Light retracing its path enters at $\theta_4$ and leaves at $\theta_1$ with the same deviation. If the minimum were at $\theta_1 \neq \theta_4$ there would be a second, mirror-image minimum; there is only one, so $\theta_1 = \theta_4$ there and the ray inside is parallel to the base.`,
    }),
    num({
      id: 'na-water', difficulty: 2,
      gen(r) {
        const [n1, n2, what] = r.pick([[1.48, 1.46, 'a plastic-clad silica fibre'], [1.462, 1.447, 'a multimode silica fibre'], [1.50, 1.40, 'an imaging fibre bundle'], [1.4682, 1.4629, 'a telecom single-mode fibre']]);
        const [n0, where] = r.pick([[1, 'air'], [1.333, 'water']]);
        const NA = Math.sqrt(n1 * n1 - n2 * n2), th = Math.asin(NA / n0) / DEG;
        return {
          prompt: t`${what[0].toUpperCase() + what.slice(1)} has core index $n_1 = ${n1}$ and cladding $n_2 = ${n2}$. Light is launched into its flat end from ${where}${n0 > 1 ? ' ($n_0 = 1.333$)' : ''}. What is the largest angle to the fibre’s axis at which light is still trapped, in degrees?`,
          visual: fibrePic(n1, n2, Math.min(40, sf(th * 0.8, 3)), t`A ray inside the acceptance cone, trapped by total internal reflection at the core wall; the cross-section is widened enormously.`, { hide: ['acceptance'] }),
          answer: th, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: Math.asin(NA) / DEG, feedback: 'That is for launching from air. From a medium of index n₀, n₀ sin θ = NA.' }, { value: Math.acos(n2 / n1) / DEG, feedback: 'That is the largest angle inside the core. Snell’s law at the end face carries it outside.' }].filter((e) => Math.abs(e.value - th) > 0.01 * th),
          hints: [t`At the core wall the ray needs $n_1\sin\phi \ge n_2$; at the end face $n_0\sin\theta = n_1\cos\phi$.`, t`Together: $n_0\sin\theta_{\max} = \sqrt{n_1^2 - n_2^2} = \text{NA}$.`],
          teach: t`$n_0\sin\theta_{\max} = \text{NA} = \sqrt{n_1^2 - n_2^2}$: the acceptance cone narrows in a denser outside medium.`,
          explain: t`$\text{NA} = ${sf(NA, 3)}$, so $\theta_{\max} = \arcsin(${sf(NA, 3)}/${n0}) = ${sf(th, 3)}^\circ$.`,
        };
      },
    }),
    num({
      id: 'modal', difficulty: 3,
      gen(r) {
        const [n1, n2] = r.pick([[1.48, 1.46], [1.462, 1.447], [1.475, 1.46]]), L = r.pick([0.5, 1, 2, 5]);
        const dt = modal(n1, n2) * L;
        return {
          prompt: t`In a step-index multimode fibre ($n_1 = ${n1}$, $n_2 = ${n2}$), the axial ray travels ${L} km at speed $c/n_1$, while the steepest trapped ray zigzags at the critical angle, a path longer by the factor $n_1/n_2$. By how much does a short pulse spread over the length, in ns?`,
          visual: fibrePic(n1, n2, sf(0.85 * Math.asin(Math.sqrt(n1 * n1 - n2 * n2)) / DEG, 3), t`A steep ray zigzagging down a step-index core; the axial ray goes straight. Widened enormously.`),
          answer: dt, units: 'ns', tol: { rel: 0.005 },
          errors: [{ value: (L * 1000 * (n1 - n2)) / C * 1e9, feedback: t`The steep ray’s path is longer by $n_1/n_2$, not its speed slower: $\Delta t = \dfrac{Ln_1}{c}\Bigl(\dfrac{n_1}{n_2} - 1\Bigr)$.` }, { value: ((L * 1000 * n1) / C) * 1e9, feedback: 'That is the whole transit time; the spread is the difference between the two rays.' }],
          hints: [t`Axial: $t_0 = Ln_1/c$. Steepest: $t_0\,n_1/n_2$.`, t`$\Delta t = \dfrac{Ln_1}{c}\Bigl(\dfrac{n_1}{n_2} - 1\Bigr)$.`],
          teach: 'Modal dispersion: rays at different angles take different times, so a pulse spreads in proportion to the length.',
          explain: t`$\Delta t = \dfrac{${L * 1000}\times${n1}}{${tex(C, 4)}}\times${sf(n1 / n2 - 1, 3)} = ${sf(dt, 3)}$ ns. Pulses closer together than about $2\Delta t$ blur into each other, which limits the bit rate to roughly $1/2\Delta t \approx ${sf(1 / (2 * dt * 1e-9) / 1e6, 2)}$ Mbit/s.`,
        };
      },
    }),
    mcq({
      id: 'graded', difficulty: 2,
      prompt: t`A graded-index fibre has a core whose index falls smoothly from the axis outward. Why does that reduce modal dispersion so much?`,
      visual: fibrePic(1.48, 1.46, 11, t`A step-index fibre for comparison: steep rays bounce sharply off the core wall. Widened enormously.`),
      choices: ['Steep rays travel longer paths but spend them in lower-index glass, where light is faster; the times nearly equalize.', 'The graded core absorbs the steep rays.', 'It traps fewer rays, so less light arrives.', 'Light in a graded core travels at c.'],
      answer: 0,
      why: { 1: 'Steep rays are guided, not absorbed: they curve back toward the axis.', 2: 'A graded-index fibre accepts a comparable cone of light; it equalizes the times, it does not reject modes.', 3: 'Light in glass is always slower than c; the point is that the outer glass is slightly faster than the centre.' },
      hints: ['Recall Fermat’s principle (O3.2): paths that reach the same point with equal optical path arrive together.'],
      teach: 'A graded index equalizes transit times: longer paths run through faster (lower-index) glass.',
      explain: t`A parabolic index profile makes the rays curve like sinusoids whose optical path lengths are nearly equal — the same trick as a lens equalizing paths to its focus. Modal spread falls from tens of ns/km to well under 1 ns/km.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-risley', difficulty: 2, transfer: true,
      gen(r) {
        const A = r.pick([1, 2, 3, 4]), [mat, nm] = r.pick([['silica', 1550], ['bk7', 1064], ['silica', 1064]]);
        const n = nOf(mat, nm), d1 = (n - 1) * A, ex = B.minDeviation(A * DEG, n) / DEG;
        return {
          prompt: t`A laser-comm terminal steers its ${nm} nm beam with a Risley pair: two identical thin wedges of ${MATS[mat].name} ($n = ${sf(n, 4)}$ at ${nm} nm), each with a ${A}° wedge angle, rotated independently. Aligned, their deviations add. What is the largest steering angle the pair gives, in degrees? (Thin-prism approximation.)`,
          visual: prismPic(MATS[mat].key, 30, 20, t`A prism bending light toward its base (drawn with a 30° apex so it can be seen; the real wedges are a few degrees).`, { light: 'mono', lambda: 650 }),
          answer: 2 * d1, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: d1, feedback: 'That is one wedge. Aligned, the two deviations add.' }, { value: 2 * n * A, feedback: t`A thin prism deviates by $(n - 1)A$: the glass bends the ray by the index **excess** over air.` }],
          hints: [t`A thin wedge deviates by $\delta \approx (n - 1)A$.`],
          teach: t`A thin prism deviates light by $(n - 1)A$, whatever the angle of incidence near normal.`,
          explain: t`Each wedge: $(${sf(n, 4)} - 1)\times${A}^\circ = ${sf(d1, 3)}^\circ$ (exact minimum deviation $${sf(ex, 4)}^\circ$). Together up to $${sf(2 * d1, 3)}^\circ$; counter-rotated they cancel, so every direction inside that cone is reachable.`,
        };
      },
    }),
    num({
      id: 'cp-gyro', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([200, 500, 1000, 2000]), D = r.pick([0.06, 0.08, 0.1, 0.15]), lam = 1550e-9;
        const Om = (15.041 / 3600) * DEG, dphi = (2 * Math.PI * L * D * Om) / (lam * C);
        return {
          prompt: t`A spacecraft’s fibre-optic gyroscope sends light both ways round a coil of ${L} m of fibre wound ${sf(D * 100, 3)} cm across. When the coil turns at rate $\Omega$, the two beams return with a phase difference $\Delta\phi = 2\pi LD\Omega/\lambda c$ (the Sagnac effect). What is $\Delta\phi$, in µrad, for Earth’s rotation rate, 15.04°/h, at 1550 nm?`,
          visual: coilPic(t`A fibre coil with light sent both ways round (schematic: a real coil has thousands of turns).`),
          answer: dphi * 1e6, units: 'urad', tol: { rel: 0.01 },
          errors: [{ value: ((2 * Math.PI * L * D * 15.041) / (lam * C)) * 1e6, feedback: 'Convert the rotation rate to rad/s: 15.04°/h = 7.29 × 10⁻⁵ rad/s.' }],
          hints: [t`$\Omega = 15.04^\circ/\text{h} = ${tex(Om, 3)}$ rad/s.`, t`$\Delta\phi = 2\pi LD\Omega/(\lambda c)$ with everything in SI units.`],
          teach: 'Light going round a rotating loop with and against the rotation takes different times: the Sagnac phase is proportional to the rotation rate and to the coil’s length times its diameter.',
          explain: t`$\Delta\phi = ${sf(dphi * 1e6, 3)}$ µrad. Gyros resolve phases far smaller than this. The fibre itself must be single-mode, so that both beams share one path. How the phase is read — interference — is O7.`,
        };
      },
    }),
    mcq({
      id: 'cp-singlemode', difficulty: 2,
      prompt: t`Why do long-distance telecom links (and fibre gyros) use single-mode fibre, with a core only about 8 µm across, rather than wider multimode fibre?`,
      visual: fibrePic(1.4682, 1.4629, 4, t`A single-mode fibre’s core and cladding indices (1.4682 and 1.4629), drawn as a ray picture; in reality an 8 µm core guides one wave pattern, not rays.`),
      choices: ['With only one mode there is no modal dispersion: no paths of different length to spread a pulse.', 'A thin core collects more light.', 'Single-mode fibre has no material dispersion.', 'Thin fibres have no total internal reflection, so no losses.'],
      answer: 0,
      why: { 1: 'A thin core with a small NA collects less light; it is harder to launch into.', 2: 'Material (chromatic) dispersion remains, which is why links work near 1310 nm or manage dispersion at 1550 nm.', 3: 'Single-mode fibres still guide light at the core–cladding boundary.' },
      hints: ['What limited the multimode fibre’s bit rate?'],
      teach: 'A core small enough to guide only one mode removes modal dispersion entirely.',
      explain: t`When the core radius and NA satisfy $V = 2\pi a\,\text{NA}/\lambda < 2.405$ only one mode is guided. The ray picture fails at this size — the mode is a wave pattern that reaches into the cladding (O3.4’s evanescent field) — but the conclusion stands: one path, no modal spread.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §5.5 (prisms) and §5.6 (fibre optics)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'SCHOTT optical glass data sheets, N-BK7 and F2', url: 'https://refractiveindex.info/?shelf=glass&book=SCHOTT-optical&page=N-BK7' },
    { label: 'H. C. Lefèvre, The Fiber-Optic Gyroscope, 2nd ed. (Artech House, 2014)', url: 'https://us.artechhouse.com/The-Fiber-Optic-Gyroscope-Second-Edition-P1702.aspx' },
  ],
});
