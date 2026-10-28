// Optical systems and aberrations (Hecht §5.3, §6.3). Paraxial optics is
// exact only near the axis and for one colour. Spherical aberration grows as
// h² along the axis and depends on the lens's bending; the five Seidel
// aberrations (spherical, coma, astigmatism, field curvature, distortion) by
// their symptoms; chromatic aberration of a singlet, Δf ≈ f/V; the achromatic
// doublet 1/(f₁V₁) + 1/(f₂V₂) = 0 designed in N-BK7 + F2 and checked by
// exact tracing (colour focus spread 1.55 mm → 0.13 mm at f = 100 mm, the
// rest thickness and secondary spectrum); stops and f-numbers. Uses op2-bench
// (exact multi-wavelength tracing, a bending slider). Transfers: a star
// tracker's deliberate defocus for centroiding, why JWST uses only mirrors.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { sf, nOf, MATS } from './_op.js';
import { B, bench } from './_op2.js';
import { abbe } from '../../src/viz/model/optics-rays.js';

const t = String.raw;
const LAM = [486.13, 587.56, 656.27];
const V = { bk7: abbe('crown'), f2: abbe('flint'), sf11: abbe('denseflint'), silica: abbe('silica') };
const nd = (m) => nOf(m, 587.56);

// the worked example: an f = 100 mm achromatic doublet of N-BK7 and F2
const EX = { f: 100 };
EX.f1 = (EX.f * (V.bk7 - V.f2)) / V.bk7;
EX.f2 = (-EX.f * (V.bk7 - V.f2)) / V.f2;
EX.R1 = 2 * EX.f1 * (nd('bk7') - 1);
EX.R3 = 1 / (-1 / EX.R1 - 1 / EX.f2 / (nd('f2') - 1));
EX.dbl = [{ kind: 'surf', z: 0, R: EX.R1, mat: 'crown', ap: 12.5 }, { kind: 'surf', z: 7, R: -EX.R1, mat: 'flint', ap: 12.5 }, { kind: 'surf', z: 9.5, R: EX.R3, n: 1, ap: 12.5 }];
EX.sing = [{ kind: 'surf', z: 0, R: 2 * EX.f * (nd('bk7') - 1), mat: 'crown', ap: 12.5 }, { kind: 'surf', z: 5, R: -2 * EX.f * (nd('bk7') - 1), n: 1, ap: 12.5 }];
const colourSpread = (els) => B.cardinal(els, { lambda: 656.27 }).zF2 - B.cardinal(els, { lambda: 486.13 }).zF2;
EX.cs = colourSpread(EX.sing);
EX.cd = colourSpread(EX.dbl);
// check the flint element's focal length from its two radii
{ const P2 = (nd('f2') - 1) * (1 / -EX.R1 - 1 / EX.R3); if (Math.abs(1 / P2 - EX.f2) > 1e-6) throw new Error('O4.5 doublet'); }

/** Exact rays at three colours near the focus of a system (mm). */
const focusZoom = (els, caption, extra = {}) => bench({ elements: els, source: 'inf', rays: 9, fill: [-1, 1], trace: 'exact', lambdas: LAM, x: [86, 106], y: [-2.2, 2.2], start: -20, marks: ['F2'], readout: false, ...extra }, caption);

const K = 2 * EX.f * (nd('bk7') - 1);       // 2f(n − 1): curvatures are (q ± 1)/K

export default lesson({
  id: 'phys4650.O4.5',
  title: 'Optical systems and aberrations',
  minutes: 18, difficulty: 3,
  intro: t`Everything so far was paraxial and in one colour. Real rays far from the axis do not meet at the paraxial image (**monochromatic aberrations** — spherical aberration, coma, astigmatism, field curvature and distortion), and glass bends blue more than red (**chromatic aberration**): a singlet’s focal length changes by about $f/V$ across the visible, $V$ being the glass’s Abbe number ([O4.4](#/lesson/phys4650.O4.4)). Two glasses can cancel it. Two thin lenses in contact focus red and blue together when

$$\frac{1}{f_1V_1} + \frac{1}{f_2V_2} = 0, \qquad \frac{1}{f_1} + \frac{1}{f_2} = \frac{1}{f}$$

— an **achromatic doublet**: a strong crown lens and a weaker flint lens of opposite sign.`,
  symbols: [
    { tex: 'f_1,\\ f_2', text: 'the focal lengths of the two elements (at the yellow d line, 587.6 nm), in m; one positive, one negative' },
    { tex: 'V_1,\\ V_2', text: t`their glasses’ Abbe numbers, $V = (n_d - 1)/(n_F - n_C)$: large for weakly dispersive crown glass (N-BK7: 64.2), small for flint (F2: 36.4)` },
    { tex: 'f', text: 'the focal length of the pair' },
  ],
  why: t`Every camera, star tracker and spectrograph is a fight against aberrations; the doublet is the first and most useful weapon, and the reason big telescopes use mirrors.`,
  visual: {
    title: 'Bending a lens',
    lead: t`A singlet of N-BK7 with $f = 100$ mm at f/4, seen close to its focus (the lens is 90 mm to the left). Exact rays in blue, yellow and red. The slider **bends** the lens — changes its shape while keeping its thin-lens focal length.`,
    tasks: [
      t`Find the bending with the least spherical aberration (readout): near $q = +0.7$, mostly convex toward the light. Flat side toward the light ($q = -1$) is about four times worse.`,
      t`Watch the colour readout: bending hardly changes it. Blue focuses about $f/V \approx 1.5$ mm before red whatever the shape.`,
      t`The outer rays always cross short of the paraxial focus $F'$: a single positive lens is undercorrected.`,
    ],
    ...focusZoom(EX.sing, t`Exact rays traced through a 5 mm thick N-BK7 lens at 486, 588 and 656 nm, magnified around the focus; heights magnified about 6 times more than lengths. $F'$ is the paraxial focus for yellow light.`, {
      readouts: ['lsa', 'colour'], readout: true,
      controls: [{ key: 'q', label: 'Shape (bending) factor $q$', min: -2, max: 2, step: 0.1, value: 0, explain: 'q = 0 equiconvex, q = 1 plano-convex with the curved side to the light, q = −1 the flat side to the light; |q| > 1 makes a meniscus.', set: [[0, 'c', 1 / K, 1 / K], [1, 'c', 1 / K, -1 / K]] }],
    }),
  },
  example: {
    prompt: t`Design a cemented achromatic doublet with $f = ${EX.f}$ mm for a star tracker, from N-BK7 ($n_d = ${nd('bk7').toFixed(4)}$, $V = ${sf(V.bk7, 4)}$) and F2 ($n_d = ${nd('f2').toFixed(4)}$, $V = ${sf(V.f2, 4)}$). Make the crown element equiconvex. Then check it by exact tracing against a singlet.`,
    visual: focusZoom(EX.dbl, t`The finished doublet (7 mm crown, 2.5 mm flint), exact rays at 486, 588 and 656 nm near the focus: the colours now meet. Heights magnified about 6 times more than lengths.`),
    steps: [
      { label: 'Two conditions', text: t`Powers add: $1/f_1 + 1/f_2 = 1/f$. Colour cancels: each element’s power changes across F to C by $1/(fV)$, so $1/(f_1V_1) + 1/(f_2V_2) = 0$.` },
      { label: 'Solve', text: t`$f_1 = f\,\dfrac{V_1 - V_2}{V_1} = ${sf(EX.f1, 4)}$ mm (crown, positive) and $f_2 = -f\,\dfrac{V_1 - V_2}{V_2} = ${sf(EX.f2, 4)}$ mm (flint, negative). The crown does more than all the focusing; the flint undoes its colour.` },
      { label: 'Shapes', text: t`Equiconvex crown: $R_1 = -R_2 = 2f_1(n_1 - 1) = ${sf(EX.R1, 4)}$ mm. Cemented, the flint’s first radius is $-${sf(EX.R1, 4)}$ mm, and its lensmaker’s equation gives the last radius, $R_3 = ${sf(EX.R3, 4)}$ mm — nearly flat.` },
      { label: 'Check by tracing', text: t`With real thicknesses (7 and 2.5 mm), the paraxial foci for red (C) and blue (F) are $${sf(EX.cd, 2)}$ mm apart. A 5 mm singlet of the same focal length: $${sf(EX.cs, 3)}$ mm. Better by a factor of $${sf(EX.cs / EX.cd, 2)}$.` },
      { label: 'What is left', text: t`The residue comes from the thicknesses (the thin-lens design ignored them; a few iterations remove it) and from the **secondary spectrum**: the glasses’ dispersions are not exactly proportional, so green still focuses slightly apart from red and blue. Apochromats use special glasses for that.` },
    ],
    answer: t`$f_1 = ${sf(EX.f1, 4)}$ mm (N-BK7, $R = \pm${sf(EX.R1, 3)}$ mm) and $f_2 = ${sf(EX.f2, 4)}$ mm (F2, $R_3 = ${sf(EX.R3, 3)}$ mm); the colour spread falls from $${sf(EX.cs, 2)}$ to $${sf(EX.cd, 2)}$ mm.`,
  },
  practice: [
    num({
      id: 'singlet-colour', difficulty: 1,
      gen(r) {
        const mat = r.pick(['bk7', 'f2', 'sf11', 'silica']), f = r.pick([50, 100, 200]);
        const df = f / V[mat];
        return {
          prompt: t`A thin singlet of ${MATS[mat].name} ($V = ${sf(V[mat], 4)}$) has $f = ${f}$ mm in yellow light. Roughly how far apart are its foci for red (C) and blue (F) light, in mm?`,
          visual: focusZoom([{ kind: 'surf', z: 0, R: 2 * f * (nd(mat) - 1), mat: MATS[mat].key, ap: f / 8 }, { kind: 'surf', z: f / 20, R: -2 * f * (nd(mat) - 1), n: 1, ap: f / 8 }], t`Exact rays at three colours near the focus of an equiconvex singlet; the readouts are hidden. Heights magnified more than lengths.`, { x: [0.85 * f, 1.05 * f], y: [-f / 45, f / 45] }),
          answer: df, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: f * V[mat] / 1000, feedback: t`The spread is $f/V$: a larger $V$ (less dispersion) gives a smaller spread.` }, { value: (f * (nd(mat) - 1)) / V[mat], feedback: t`$\Delta f/f = \Delta n/(n - 1) = 1/V$ exactly: no extra $(n - 1)$.` }],
          hints: [t`$1/f = (n - 1)K$, so $\Delta(1/f)/(1/f) = \Delta n/(n_d - 1)$.`, t`From F to C, $\Delta n/(n_d - 1) = 1/V$, so $\Delta f \approx f/V$.`],
          teach: t`A singlet’s longitudinal colour is about $f/V$: 1.6% of the focal length for crown glass.`,
          explain: t`$\Delta f \approx ${f}/${sf(V[mat], 4)} = ${sf(df, 3)}$ mm, blue focusing closer to the lens than red.`,
        };
      },
    }),
    num({
      id: 'achromat-f1', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([['bk7', 'f2'], ['bk7', 'sf11'], ['silica', 'f2']]), f = r.pick([50, 80, 120, 200]);
        const f1 = (f * (V[a] - V[b])) / V[a];
        return {
          prompt: t`An achromatic doublet of focal length ${f} mm is made of ${MATS[a].name} ($V_1 = ${sf(V[a], 4)}$) and ${MATS[b].name} ($V_2 = ${sf(V[b], 4)}$). What must the focal length of the ${MATS[a].name} element be, in mm?`,
          visual: focusZoom(EX.dbl, t`An achromatic doublet’s colours meeting near its focus (the worked example’s N-BK7 and F2 doublet). Heights magnified more than lengths.`),
          answer: f1, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: (-f * (V[a] - V[b])) / V[b], feedback: 'That is the second element (negative). The crown element is the positive one.' }, { value: f / 2, feedback: 'The powers are not split equally: the dispersions decide.' }],
          hints: [t`$1/f_1 + 1/f_2 = 1/f$ and $1/(f_1V_1) + 1/(f_2V_2) = 0$.`, t`$f_1 = f(V_1 - V_2)/V_1$.`],
          teach: t`Achromat: $f_1 = f(V_1 - V_2)/V_1$ and $f_2 = -f(V_1 - V_2)/V_2$ — the closer the Abbe numbers, the stronger both elements must be.`,
          explain: t`$f_1 = ${f}\times(${sf(V[a], 4)} - ${sf(V[b], 4)})/${sf(V[a], 4)} = ${sf(f1, 4)}$ mm; the other element has $f_2 = ${sf((-f * (V[a] - V[b])) / V[b], 4)}$ mm.`,
        };
      },
    }),
    match({
      id: 'seidel', difficulty: 2,
      prompt: t`Match each aberration to what it does to the image of a field of stars.`,
      visual: bench({ elements: [{ kind: 'surf', z: 0, R: 51.68, mat: 'crown', ap: 12 }, { kind: 'surf', z: 5, R: Infinity, n: 1, ap: 12 }], source: 'inf', angle: 6, rays: 11, fill: [-1, 1], trace: 'exact', x: [-15, 112], y: [-14, 14], start: -15, marks: ['F2'], readout: false }, t`Exact rays from a star 6° off the axis through a plano-convex singlet: the rays meet only roughly, above the axis and short of the paraxial focal plane. Heights exaggerated.`),
      left: ['Spherical aberration', 'Coma', 'Astigmatism', 'Field curvature', 'Distortion', 'Chromatic aberration'],
      right: ['blur even on the axis: edge rays focus short', 'off-axis stars flare into comet shapes', 'off-axis stars focus as two short lines at different distances', 'sharp stars lie on a curved surface, not the flat detector', 'stars sharp but in the wrong places: straight lines bow', 'colour fringes: each wavelength focuses elsewhere'],
      answer: [0, 1, 2, 3, 4, 5],
      hints: ['Which one is present for a star exactly on the axis in one colour?', 'Which one moves images without blurring them?'],
      teach: 'The five Seidel aberrations differ in how they grow with aperture and field angle; chromatic aberration is separate, from dispersion.',
      explain: t`Spherical aberration grows with aperture alone (as $h^2$ along the axis); coma with aperture² × field; astigmatism and field curvature with aperture × field²; distortion with field³ and blurs nothing. A star tracker cares most about distortion — it measures star positions — and calibrates the residue out.`,
    }),
    num({
      id: 'stop-down', difficulty: 2,
      gen(r) {
        const [N1, N2] = r.pick([[2, 4], [2.8, 5.6], [1.4, 4], [4, 8]]);
        const fac = (N2 / N1) ** 2;
        return {
          prompt: t`A lens’s longitudinal spherical aberration grows as the square of the ray height. By what factor does it fall when the lens is stopped down from f/${N1} to f/${N2}?`,
          visual: focusZoom(EX.sing, t`A singlet’s exact rays near focus; the outer rays cross shortest. Stopping down removes them. Heights magnified more than lengths.`, { lambdas: [587.56] }),
          answer: fac, tol: { rel: 0.005 },
          errors: [{ value: N2 / N1, feedback: 'The aberration goes as h², and the largest h is the aperture radius, ∝ 1/N.' }, { value: fac ** 1.5, feedback: 'That is the transverse blur, which grows as h³. The question asks the longitudinal one.' }],
          hints: [t`The largest ray height is $D/2 = f/2N$.`, t`Longitudinal aberration $\propto h^2 \propto 1/N^2$.`],
          teach: 'Stopping down cuts spherical aberration fast (as 1/N² along the axis), at the cost of light and, eventually, diffraction.',
          explain: t`$(${N2}/${N1})^2 = ${sf(fac, 3)}$. The blur spot shrinks even faster ($\propto h^3$), until diffraction (spot $\approx 2.44\lambda N$) takes over.`,
        };
      },
    }),
    mcq({
      id: 'stop-tradeoff', difficulty: 2,
      prompt: t`A star tracker’s designer wants sharper star images. Why can’t she simply stop the lens down to f/16?`,
      visual: focusZoom(EX.sing, t`A singlet at f/4: the blur comes from the outer rays (spherical aberration) and from colour.`),
      choices: ['Light gathered falls as 1/N² — dim stars vanish — and diffraction blur grows as N.', 'Stopping down increases chromatic aberration.', 'Stopping down moves the focus by f/N.', 'A smaller stop adds coma.'],
      answer: 0,
      why: { 1: 'Chromatic focal shift does not depend on the aperture; its blur shrinks as the cone narrows.', 2: 'The paraxial focus does not move when the stop changes.', 3: 'Coma shrinks with a smaller aperture (as h²).' },
      hints: ['How does the energy collected depend on the aperture diameter?', 'What sets the smallest possible spot for a perfect lens?'],
      teach: 'The f-number trades aberrations against light and diffraction; a good design fixes aberrations so the aperture can stay large.',
      explain: t`At f/16 the aperture area is 16 times smaller than at f/4 and the Airy disc is $2.44\lambda N \approx 21$ µm across at 550 nm — several pixels. Trackers run fast (f/1.2–f/2) with multi-element lenses to see faint stars.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-defocus', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([1.2, 1.4, 2]), px = r.pick([5.5, 6.5, 9]), n = r.pick([3, 4, 5]);
        const dz = n * px * N;
        return {
          prompt: t`Star trackers find each star’s position to a fraction of a pixel by centroiding, which needs the star’s light spread over a few pixels. A tracker’s f/${N} lens would focus a star much smaller than its ${px} µm pixels, so the detector is moved off focus. How far must it be moved for the blur circle to be ${n} pixels across, in µm? (Geometric optics.)`,
          visual: bench({ elements: [{ kind: 'thin', z: 0, f: 50, ap: 50 / (2 * N), label: `f/${N}` }, { kind: 'screen', z: 46, ap: 14, label: 'detector' }], source: 'inf', rays: 7, fill: [-1, 1], x: [-10, 70], y: [-26, 26], marks: ['F2'], readout: false, clip: false }, t`A lens with the detector moved off the focus $F'$ (displacement exaggerated): the converging cone cuts the detector in a blur circle.`),
          answer: dz, units: 'um', tol: { rel: 0.005 },
          errors: [{ value: (n * px) / N, feedback: t`The cone’s diameter grows by $1/N$ per unit distance: $\Delta z = bN$, not $b/N$.` }, { value: (n * px * N) / 2, feedback: t`The blur **diameter** is $\Delta z/N$; you used the radius.` }],
          hints: [t`The converging cone has diameter $D$ at the lens and 0 at the focus, over a length $f$: diameter $\Delta z\,D/f = \Delta z/N$ at distance $\Delta z$ from focus.`, t`$\Delta z = bN$ with $b = ${n}\times${px}$ µm.`],
          teach: t`A detector $\Delta z$ from focus sees a blur circle $\Delta z/N$ across: fast lenses defocus quickly.`,
          explain: t`$\Delta z = ${n * px}\ \mu\text{m}\times${N} = ${sf(dz, 3)}$ µm. Spread over ${n} pixels, a star’s centroid can be found to about a tenth of a pixel — arcsecond pointing from a lens of modest focal length.`,
        };
      },
    }),
    mcq({
      id: 'cp-mirrors', difficulty: 2, transfer: true,
      prompt: t`JWST observes from 0.6 to 28 µm. Why is its telescope built entirely of mirrors (gold-coated beryllium), with no lenses?`,
      visual: { type: 'graph', params: { x: [0.5, 2.5], y: [1.4, 1.56], aspect: 'wide', xlabel: 'wavelength (µm)', ylabel: 'index n', yticks: 4, curves: [{ fn: `sqrt(1 + 1.03961212*x^2/(x^2 - 0.00600069867) + 0.231792344*x^2/(x^2 - 0.0200179144) + 1.01046945*x^2/(x^2 - 103.560653))`, color: 'accent', width: 2.4, domain: [0.5, 2.5], label: 'N-BK7', labelAt: 1.2 }, { fn: `sqrt(1 + 0.6961663*x^2/(x^2 - 0.0046791) + 0.4079426*x^2/(x^2 - 0.0135121) + 0.8974794*x^2/(x^2 - 97.934))`, color: 'teal', width: 2.4, domain: [0.5, 2.5], label: 'fused silica', labelAt: 1.8, labelDy: 14 }] }, caption: t`Refractive index against wavelength (Sellmeier fits) for two common glasses: it keeps changing across the near infrared, and glasses become opaque beyond a few µm.` },
      choices: ['Reflection does not depend on wavelength, so mirrors have no chromatic aberration across the whole band — and no glass transmits from 0.6 to 28 µm anyway.', 'Mirrors have no spherical aberration.', 'Lenses cannot form images in the infrared.', 'Mirrors are lighter than lenses of the same focal length only because they are thinner.'],
      answer: 0,
      why: { 1: 'A spherical mirror has spherical aberration; JWST’s mirrors are aspheres for that reason.', 2: 'Infrared lenses exist (germanium, ZnSe) but each works over a limited band and has its own dispersion.', 3: 'Mass matters, but the decisive reason is the band: one set of mirrors serves every wavelength.' },
      hints: ['What does the law of reflection depend on?', 'How large is a lens’s colour error over a factor of 50 in wavelength?'],
      teach: 'Mirrors are free of chromatic aberration; that, and size, is why telescopes are reflectors.',
      explain: t`The angle of reflection equals the angle of incidence for every wavelength, so a mirror focuses 0.6 µm and 28 µm light at the same place. The gold coating reflects over 98% across the infrared. JWST’s instruments do use some refractive optics, each for its own narrower band.`,
    }),
    num({
      id: 'cp-flint', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([['bk7', 'f2'], ['bk7', 'sf11'], ['silica', 'sf11']]), f = r.pick([75, 150, 300]);
        const f2 = (-f * (V[a] - V[b])) / V[b];
        return {
          prompt: t`A ${f} mm achromatic objective for a laser-comm terminal’s acquisition camera pairs ${MATS[a].name} ($V = ${sf(V[a], 4)}$) with ${MATS[b].name} ($V = ${sf(V[b], 4)}$). What is the focal length of the ${MATS[b].name} element, in mm (with its sign)?`,
          visual: focusZoom(EX.dbl, t`An achromatic doublet’s colours meeting near its focus (an N-BK7 and F2 example). Heights magnified more than lengths.`),
          answer: f2, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: -f2, feedback: 'The flint element is diverging: its focal length is negative.' }, { value: (f * (V[a] - V[b])) / V[a], feedback: 'That is the crown element.' }],
          hints: [t`$f_2 = -f(V_1 - V_2)/V_2$.`, 'The high-dispersion (low V) element is the negative one.'],
          teach: 'In an achromat the more dispersive glass forms the negative element, cancelling the positive element’s colour.',
          explain: t`$f_2 = -${f}\times(${sf(V[a], 4)} - ${sf(V[b], 4)})/${sf(V[b], 4)} = ${sf(f2, 4)}$ mm.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §5.3 (stops), §6.3 (aberrations)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'W. J. Smith, Modern Optical Engineering, 4th ed. (McGraw-Hill, 2008), ch. 5 and 12', url: 'https://openlibrary.org/works/OL2672543W' },
    { label: 'C. C. Liebe, Accuracy performance of star trackers — a tutorial, IEEE Trans. Aerosp. Electron. Syst. 38, 587 (2002)', url: 'https://doi.org/10.1109/TAES.2002.1008988' },
  ],
});
