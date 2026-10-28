// Thick lenses and lens systems (Hecht §6.1–6.2), by ray-transfer (ABCD)
// matrices. A paraxial ray is a column (y, θ); every piece of an optical
// system is a 2×2 matrix (translation, refraction, thin lens), and a system
// is their product taken right to left in the order the light meets them.
// From M = [[A, B], [C, D]]: f = −1/C, back focal distance −A/C, principal
// planes (1 − A)/C and (D − 1)/C, det M = 1 in air. Thick lens worked through;
// two thin lenses (f = f₁f₂/(f₁ + f₂ − d)); the telephoto's principal plane in
// front of the lens; afocal systems (C = 0) and beam expanders. Uses op2-bench
// (two lenses with H, H′, F, F′ and the matrix readout). Transfers: a laser
// communication terminal's beam expander (divergence ÷ magnification), a
// thick star-tracker element.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sf, nOf, MATS } from './_op.js';
import { B, bench } from './_op2.js';

const t = String.raw;
const nd = nOf('bk7', 587.56);

// the worked example: a thick N-BK7 lens, R1 = +30 mm, R2 = −60 mm, t = 10 mm
const EX = { R1: 30, R2: -60, th: 10, n: nd };
EX.els = [{ kind: 'surf', z: 0, R: EX.R1, mat: 'crown', ap: 11 }, { kind: 'surf', z: EX.th, R: EX.R2, n: 1, ap: 11 }];
EX.c = B.cardinal(EX.els);
EX.P1 = (EX.n - 1) / EX.R1;              // power of surface 1 (mm⁻¹)
EX.P2 = (1 - EX.n) / EX.R2;              // power of surface 2
EX.thin = 1 / ((EX.n - 1) * (1 / EX.R1 - 1 / EX.R2));
const [[A, Bm], [Cm, Dm]] = EX.c.M;
const m4 = (x) => sf(x, 4);

/** Two thin lenses (mm) with the cardinal points. */
const twoLens = (f1, f2, d, caption, extra = {}) => {
  const els = [{ kind: 'thin', z: 0, f: f1, ap: 12, label: 'L₁' }, { kind: 'thin', z: d, f: f2, ap: 12, label: 'L₂' }];
  return bench({ elements: els, source: 'inf', rays: 5, fill: [-0.8, 0.8], y: [-16, 16], readout: false, marks: [], ...extra }, caption);
};

export default lesson({
  id: 'phys4650.O4.2',
  title: 'Thick lenses and lens systems',
  minutes: 18, difficulty: 3,
  intro: t`Chaining surfaces one image at a time ([O4.1](#/lesson/phys4650.O4.1)) gets clumsy beyond two. In the paraxial limit everything is linear, so each piece of a system becomes a 2×2 matrix acting on a ray’s height and angle:

$$\begin{pmatrix} y_2 \\ \theta_2 \end{pmatrix} = \begin{pmatrix} A & B \\ C & D \end{pmatrix}\begin{pmatrix} y_1 \\ \theta_1 \end{pmatrix}$$

A gap of length $d$ is $\begin{pmatrix} 1 & d \\ 0 & 1\end{pmatrix}$, a thin lens $\begin{pmatrix} 1 & 0 \\ -1/f & 1\end{pmatrix}$, a surface $\begin{pmatrix} 1 & 0 \\ -\frac{n_2 - n_1}{n_2R} & \frac{n_1}{n_2}\end{pmatrix}$. The system is their product, **written right to left** in the order the light meets them. Whatever is inside, a system in air acts like a thin lens of focal length $f = -1/C$ placed not at the glass but at two **principal planes** $H$ and $H'$.`,
  symbols: [
    { tex: 'y_1,\\ y_2', text: 'the ray’s height above the axis at the input and output reference planes, in m' },
    { tex: '\\theta_1,\\ \\theta_2', text: t`the ray’s angle to the axis there, in rad (positive when it climbs as it travels)` },
    { tex: 'A,\\ B,\\ C,\\ D', text: t`the system matrix. $C$ is minus the power: $f = -1/C$. $A = 0$ means the output plane is the back focal plane; $B = 0$ means the input and output planes are object and image. In air $AD - BC = 1$.` },
    { tex: "H,\\ H'", text: t`the first and second principal planes: the system images as a thin lens would if it stood at $H$ for the object side and at $H'$ for the image side; $f$ is measured from them` },
  ],
  why: t`Every real lens is thick and every instrument has several elements; the matrix method designs them on paper, and its product of matrices is the same algebra as the Jones calculus of O6.`,
  visual: {
    title: 'Two lenses as one',
    lead: t`A star’s parallel rays cross two thin lenses. The system matrix (readout) gives one effective focal length $f$, measured from the second principal plane $H'$ (violet) to the focus $F'$. Change the separation and the second lens.`,
    tasks: [
      t`Set $d$ to 150 mm, the sum of the focal lengths: $C = 0$ and the rays leave parallel — an afocal system, a telescope.`,
      t`Make the second lens diverging ($f_2 = -40$ mm) at $d = 70$ mm: $f$ is 400 mm, yet the focus is only 120 mm behind $L_2$. $H'$ has moved far out in front of the system: a **telephoto**.`,
      t`Check $AD - BC = 1$ for every setting: the system is in air.`,
    ],
    ...bench({
      elements: [{ kind: 'thin', z: 0, f: 100, ap: 12, label: 'L₁' }, { kind: 'thin', z: 30, f: 50, ap: 12, label: 'L₂' }],
      source: 'inf', rays: 5, fill: [-0.8, 0.8], x: [-260, 260], y: [-16, 16], marks: ['F2', 'H2'], readouts: ['matrix', 'f', 'bfd', 'H2'],
      controls: [
        { key: 'd', label: 'Separation $d$', min: 0, max: 150, step: 1, value: 30, unit: '\\mathrm{mm}', explain: 'Distance from the first lens to the second.', set: [[1, 'z']] },
        { key: 'f2', label: 'Second lens $f_2$', min: -100, max: 100, step: 5, value: 50, unit: '\\mathrm{mm}', explain: 'Negative: a diverging lens. The first lens has f₁ = 100 mm.', set: [[1, 'f']] },
      ],
    }, t`Paraxial rays; heights exaggerated about eight times. $H'$ and $F'$ are drawn when they lie in the view. At $f_2 = 0$ there is no second lens.`),
  },
  example: {
    prompt: t`A thick N-BK7 lens ($n = ${sf(nd, 5)}$) has $R_1 = +${EX.R1}$ mm, $R_2 = ${EX.R2}$ mm and a centre thickness of ${EX.th} mm. Build its system matrix from vertex to vertex, then find $f$, the back focal distance and the principal planes. How wrong is the thin-lens formula?`,
    visual: bench({ elements: EX.els, source: 'inf', rays: 5, fill: [-0.6, 0.6], x: [-50, 60], y: [-14, 14], marks: ['F', 'F2', 'H', 'H2'], readout: false }, t`The thick lens to scale along the axis, with paraxial rays, focal points $F$, $F'$ and principal planes $H$, $H'$ (both inside the glass). Heights exaggerated about two times.`),
    steps: [
      { label: 'Three pieces', text: t`Surface 1: $\mathcal R_1 = \begin{pmatrix} 1 & 0 \\ -${m4(EX.P1 / EX.n)} & ${m4(1 / EX.n)}\end{pmatrix}$ (power $${m4(EX.P1)}\ \text{mm}^{-1}$ divided by $n$). The gap: $\mathcal T = \begin{pmatrix} 1 & ${EX.th} \\ 0 & 1\end{pmatrix}$. Surface 2: $\mathcal R_2 = \begin{pmatrix} 1 & 0 \\ -${m4(EX.P2)} & ${m4(EX.n)}\end{pmatrix}$.` },
      { label: 'Multiply right to left', text: t`The light meets $\mathcal R_1$ first, so $M = \mathcal R_2\,\mathcal T\,\mathcal R_1 = \begin{pmatrix} ${m4(A)} & ${m4(Bm)} \\ ${m4(Cm)} & ${m4(Dm)}\end{pmatrix}$ (mm and mm⁻¹). Check: $AD - BC = ${sf(A * Dm - Bm * Cm, 6)}$.` },
      { label: 'Focal length', text: t`$f = -1/C = ${m4(EX.c.f)}$ mm. The thin-lens formula gives $${m4(EX.thin)}$ mm: ${sf(((EX.c.f - EX.thin) / EX.c.f) * 100, 2)}% short, because it ignores the ${EX.th} mm of glass.` },
      { label: 'Where the focus is', text: t`A parallel ray $(y, 0)$ leaves as $(Ay, Cy)$ and reaches the axis $-A/C = ${m4(EX.c.bfd)}$ mm after the back vertex: the back focal distance. It is shorter than $f$.` },
      { label: 'Principal planes', text: t`That ray, extended back, reaches its original height at $(1 - A)/C = ${m4(EX.c.h2)}$ mm from the back vertex: $H'$ lies inside the glass, and $f$ is measured from it ($${m4(EX.c.bfd)} + ${m4(-EX.c.h2)} = ${m4(EX.c.f)}$). Likewise $H$ is $(D - 1)/C = ${m4(EX.c.h1)}$ mm behind the front vertex.` },
    ],
    answer: t`$f = ${m4(EX.c.f)}$ mm from $H'$, which sits $${m4(-EX.c.h2)}$ mm inside the back surface; the back focal distance is $${m4(EX.c.bfd)}$ mm.`,
  },
  practice: [
    num({
      id: 'ray-out', difficulty: 1,
      gen(r) {
        const f = r.pick([50, 80, 100]), d = r.pick([20, 30, 40]), y = r.pick([4, 5, 6, 8]);
        const v = B.apply(B.mul(B.translate(d), B.thinLens(f)), [y, 0]);
        return {
          prompt: t`A ray parallel to the axis at height $y_1 = ${y}$ mm meets a thin lens with $f = ${f}$ mm and travels ${d} mm further. What is its height there, in mm? Use $\begin{pmatrix} 1 & d \\ 0 & 1\end{pmatrix}\begin{pmatrix} 1 & 0 \\ -1/f & 1\end{pmatrix}$.`,
          visual: bench({ elements: [{ kind: 'thin', z: 0, f, ap: 10 }, { kind: 'screen', z: d, ap: 10 }], source: 'inf', rays: 1, fill: [y / 10, y / 10], x: [-40, 1.2 * f], y: [-12, 12], marks: ['F2'], readout: false }, t`The ray, the lens and the plane ${d} mm behind it (dark bar). Heights exaggerated.`),
          answer: v[0], units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: y + d * (y / f), feedback: t`The lens gives the ray an angle $-y/f$: it bends **toward** the axis.` }],
          hints: [t`After the lens: $(y, \theta) = (${y}, -${y}/${f})$.`, t`Then $y_2 = y + d\,\theta$.`],
          teach: 'A thin lens changes only the angle; a gap changes only the height.',
          explain: t`$\theta = -${y}/${f} = ${sf(-y / f, 3)}$ rad, so $y_2 = ${y} + ${d}(${sf(-y / f, 3)}) = ${sf(v[0], 3)}$ mm.`,
        };
      },
    }),
    mcq({
      id: 'order-error', difficulty: 2, kind: 'error',
      prompt: t`Light passes lens $L_1$, then a gap $d$, then lens $L_2$. A student writes the system matrix as $M = \mathcal L_1\,\mathcal T(d)\,\mathcal L_2$. What is wrong?`,
      visual: twoLens(80, 40, 50, t`The two lenses in the order the light meets them, left to right. Heights exaggerated.`, { x: [-60, 140] }),
      choices: [t`The order: the first element acts first, so it stands on the right: $M = \mathcal L_2\,\mathcal T(d)\,\mathcal L_1$.`, 'Nothing: matrix multiplication does not depend on order.', t`The gap matrix should come last, $\mathcal L_1\mathcal L_2\mathcal T(d)$.`, t`The matrices should be added, not multiplied.`],
      answer: 0,
      why: { 1: t`Matrix products do not commute in general; here swapping the lenses changes $A$, $D$ and the focal points (only $C$ survives the swap).`, 2: 'The gap lies between the lenses, so it must stand between them in the product.', 3: 'Each element transforms the ray the previous one handed it: that is composition, a product.' },
      hints: [t`The column $(y_1, \theta_1)$ sits on the right of the product. Which matrix touches it first?`],
      teach: 'System matrices multiply right to left: the element the light meets first stands rightmost.',
      explain: t`$(y_2, \theta_2)^T = \mathcal L_2\bigl(\mathcal T(\mathcal L_1(y_1, \theta_1)^T)\bigr)$. Reversing the order describes light going through the system backward, which puts the focal points in different places.`,
    }),
    num({
      id: 'two-lens-f', difficulty: 2,
      gen(r) {
        const f1 = r.pick([60, 80, 100, 120]), f2 = r.pick([40, 60, 80]), d = r.pick([10, 20, 30]);
        const f = B.twoLensF(f1, f2, d);
        return {
          prompt: t`Two thin lenses, $f_1 = ${f1}$ mm and $f_2 = ${f2}$ mm, stand ${d} mm apart. What is the effective focal length of the pair, in mm?`,
          visual: twoLens(f1, f2, d, t`Parallel light through the pair; the focus is hidden. Heights exaggerated.`, { x: [-60, 1.3 * Math.max(f, d + 20)] }),
          answer: f, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: (f1 * f2) / (f1 + f2), feedback: t`That is for lenses in contact. The gap adds $-d/(f_1f_2)$ to the power.` }, { value: B.cardinal([{ kind: 'thin', z: 0, f: f1 }, { kind: 'thin', z: d, f: f2 }]).bfd, feedback: 'That is the back focal distance, from the second lens; the focal length is measured from H′.' }],
          hints: [t`Multiply $\mathcal L_2\,\mathcal T(d)\,\mathcal L_1$ and read $C$.`, t`$C = -\dfrac{1}{f_1} - \dfrac{1}{f_2} + \dfrac{d}{f_1f_2}$, and $f = -1/C$.`],
          teach: t`Two thin lenses $d$ apart: $\dfrac{1}{f} = \dfrac{1}{f_1} + \dfrac{1}{f_2} - \dfrac{d}{f_1f_2}$.`,
          explain: t`$f = \dfrac{f_1f_2}{f_1 + f_2 - d} = \dfrac{${f1}\times${f2}}{${f1 + f2 - d}} = ${sf(f, 4)}$ mm.`,
        };
      },
    }),
    expr({
      id: 'C-element', difficulty: 3,
      prompt: t`Multiply out $M = \begin{pmatrix} 1 & 0 \\ -1/f_2 & 1\end{pmatrix}\begin{pmatrix} 1 & d \\ 0 & 1\end{pmatrix}\begin{pmatrix} 1 & 0 \\ -1/f_1 & 1\end{pmatrix}$ for two thin lenses a distance $d$ apart. What is its element $C$?`,
      visual: twoLens(100, 50, 30, t`Two thin lenses $d$ apart; $C$ sets where parallel light focuses. Heights exaggerated.`, { x: [-60, 140] }),
      answer: '-1/f_1 - 1/f_2 + d/(f_1 f_2)', answerTeX: t`-\frac{1}{f_1} - \frac{1}{f_2} + \frac{d}{f_1f_2}`,
      vars: { f_1: [20, 200], f_2: [20, 200], d: [1, 100] }, lhs: 'C',
      errors: [{ answer: '-1/f_1 - 1/f_2 - d/(f_1 f_2)', feedback: t`Check the sign of the $d$ term: $(-1/f_2)(d)(-1/f_1)$ is positive.` }, { answer: '-1/f_1 - 1/f_2', feedback: 'That is two lenses in contact (d = 0): the gap contributes too.' }],
      hints: [t`First $\mathcal T(d)\mathcal L_1 = \begin{pmatrix} 1 - d/f_1 & d \\ -1/f_1 & 1\end{pmatrix}$.`, t`Then the bottom row of $\mathcal L_2$, $(-1/f_2,\ 1)$, times the first column $(1 - d/f_1,\ -1/f_1)$.`],
      teach: t`$C$ is minus the system’s power; separating two positive lenses weakens the pair by $d/(f_1f_2)$.`,
      explain: t`$C = -\dfrac{1}{f_2}\Bigl(1 - \dfrac{d}{f_1}\Bigr) - \dfrac{1}{f_1} = -\dfrac{1}{f_1} - \dfrac{1}{f_2} + \dfrac{d}{f_1f_2}$. Setting $C = 0$ gives $d = f_1 + f_2$: an afocal telescope.`,
    }),
    num({
      id: 'plano-thick', difficulty: 3,
      gen(r) {
        const R = r.pick([20, 25, 40, 50]), th = r.pick([4, 6, 8, 10]), mat = r.pick(['bk7', 'silica', 'sf11']);
        const n = nOf(mat, 587.56), ap = Math.min(R / 2.5, Math.sqrt(1.2 * R * th)), els = [{ kind: 'surf', z: 0, R, n, ap }, { kind: 'surf', z: th, R: Infinity, n: 1, ap }];
        const c = B.cardinal(els);
        return {
          prompt: t`A plano-convex lens of ${MATS[mat].name} ($n = ${sf(n, 4)}$) has its curved face, $R = ${R}$ mm, toward the light, a flat back and a centre thickness of ${th} mm. Parallel light enters. How far behind the flat back surface is the focus, in mm?`,
          visual: bench({ elements: els, source: 'inf', rays: 5, fill: [-0.7, 0.7], x: [-0.5 * R, 2.6 * R], y: [-1.5 * ap, 1.5 * ap], marks: ['H2'], readout: false }, t`The lens to scale with its second principal plane $H'$ (violet), which lies inside the glass. Heights exaggerated.`),
          answer: c.bfd, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: R / (n - 1), feedback: t`That is the focal length $f$, measured from $H'$. $H'$ lies $t/n$ inside the flat face.` }, { value: R / (n - 1) - th, feedback: t`The glass is not all lost path: $H'$ is $t/n$, not $t$, inside the back surface.` }],
          hints: [t`$f = R/(n - 1)$ for this lens, thick or not (the flat face has no power).`, t`$H'$ is $(1 - A)/C$ from the back vertex; for this lens that is $-t/n$. So the back focal distance is $f - t/n$.`],
          teach: t`A thick lens focuses $f$ beyond its principal plane $H'$, not beyond its glass.`,
          explain: t`$f = ${sf(R / (n - 1), 4)}$ mm, $H'$ lies $t/n = ${sf(th / n, 3)}$ mm inside the flat face, so the focus is $${sf(c.bfd, 4)}$ mm behind it.`,
        };
      },
    }),
    {
      type: 'slider', id: 'expander', difficulty: 2,
      prompt: t`A Galilean beam expander has a diverging lens $f_1 = -25$ mm followed by a converging lens $f_2 = +100$ mm. Set the separation so that a collimated laser beam leaves collimated (an afocal system, $C = 0$).`,
      visual: bench({ elements: [{ kind: 'thin', z: 0, f: -25, ap: 3, label: 'f₁ = −25' }, { kind: 'thin', z: 50, f: 100, ap: 14, label: 'f₂ = 100' }], source: 'inf', rays: 5, fill: [-0.8, 0.8], x: [-40, 230], y: [-16, 16], marks: [], readout: false, clip: false,
        controls: [{ key: 'd', label: 'Separation $d$', min: 20, max: 150, step: 0.5, value: 50, unit: '\\mathrm{mm}', explain: 'Distance between the two lenses.', set: [[1, 'z']] }] },
      t`A narrow laser beam enters from the left. Heights exaggerated; paraxial rays.`),
      param: 'd', answer: [74.5, 75.5],
      instruction: 'Set the separation so the rays leave parallel to the axis, then check.',
      hints: [t`$C = -1/f_1 - 1/f_2 + d/(f_1f_2) = 0$.`, t`That gives $d = f_1 + f_2$ — with $f_1$ negative.`],
      teach: t`Two lenses are afocal when $d = f_1 + f_2$: the back focus of the first sits on the front focus of the second.`,
      explain: t`$d = -25 + 100 = 75$ mm. The beam widens by $|f_2/f_1| = 4$ and its divergence shrinks by the same factor. A Galilean expander has no internal focus, which matters for high-power lasers that would ionize the air there.`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-lasercom', difficulty: 3, transfer: true,
      gen(r) {
        const f1 = r.pick([10, 15, 20]), f2 = r.pick([150, 200, 300]), th = r.pick([0.4, 0.6, 1.0]);
        const d = f1 + f2, M = B.mul(B.thinLens(f2), B.mul(B.translate(d), B.thinLens(f1)));
        const out = Math.abs(M[1][1] * th) * 1000;
        return {
          prompt: t`A laser communication terminal sends its beam (divergence half-angle ${th} mrad) through a Keplerian telescope used backward: $f_1 = ${f1}$ mm, then $f_2 = ${f2}$ mm, separated by $f_1 + f_2$. Its matrix is $M = \mathcal L_2\,\mathcal T(f_1 + f_2)\,\mathcal L_1$. What is the output divergence, in µrad?`,
          visual: bench({ elements: [{ kind: 'thin', z: 0, f: f1, ap: 3, label: 'L₁' }, { kind: 'thin', z: d, f: f2, ap: (2.8 * f2) / f1, label: 'L₂' }], source: 'inf', rays: 5, fill: [-0.8, 0.8], x: [-0.15 * d, 1.25 * d], y: [-(3.4 * f2) / f1, (3.4 * f2) / f1], marks: [], readout: false, clip: false }, t`The beam expander with an axial beam; heights exaggerated, the internal focus between the lenses.`),
          answer: out, units: 'urad', tol: { rel: 0.005 },
          errors: [{ value: th * (f2 / f1) * 1000, feedback: 'The angle shrinks by the magnification; the height grows by it.' }, { value: th * 1000, feedback: t`An afocal system still changes angles: $D = -f_1/f_2$.` }],
          hints: [t`For $d = f_1 + f_2$, $M = \begin{pmatrix} -f_2/f_1 & f_1 + f_2 \\ 0 & -f_1/f_2\end{pmatrix}$.`, t`$\theta_2 = D\,\theta_1$ when the ray starts on the axis.`],
          teach: t`An afocal expander of magnification $f_2/f_1$ multiplies beam width by it and divides divergence by it ($\det M = 1$).`,
          explain: t`$|\theta_2| = (f_1/f_2)\theta_1 = ${sf(out, 3)}$ µrad. From geostationary orbit (36 000 km) that spreads the beam to about $${sf((2 * out * 1e-6 * 3.6e7) / 1000, 3)}$ km across instead of $${sf((2 * th * 1e-3 * 3.6e7) / 1000, 3)}$ km — diffraction from the aperture sets the final limit (O8).`,
        };
      },
    }),
    mcq({
      id: 'cp-telephoto', difficulty: 3,
      prompt: t`A telephoto lens has a positive front group and a negative rear group. Its effective focal length is 400 mm, yet the whole lens plus its back focal distance is only 190 mm long. Where is its second principal plane $H'$?`,
      visual: bench({ elements: [{ kind: 'thin', z: 0, f: 100, ap: 12, label: 'L₁' }, { kind: 'thin', z: 70, f: -40, ap: 8, label: 'L₂' }], source: 'inf', rays: 5, fill: [-0.8, 0.8], x: [-250, 230], y: [-16, 16], marks: ['F2'], readout: false }, t`Parallel rays through a telephoto pair ($f_1 = 100$ mm, $f_2 = -40$ mm, 70 mm apart). Heights exaggerated.`),
      choices: [t`In front of the first lens: extending the emerging rays back to the incoming heights lands 400 mm before the focus.`, t`Between the two lenses.`, t`At the second lens, because the focal length is measured from the last element.`, t`Behind the focus.`],
      answer: 0,
      why: { 1: t`$f$ is measured from $H'$ to $F'$; 400 mm before $F'$ is beyond the front of a 190 mm lens.`, 2: t`$f$ is measured from $H'$, which for a thick system can lie anywhere — even outside the glass.`, 3: t`$H'$ lies $f$ before $F'$ along the light, and $f > 0$.` },
      hints: [t`$F'$ is $f = 400$ mm after $H'$.`, 'How far before the focus is the front lens?'],
      teach: t`$H'$ can lie outside the lens: a telephoto puts it in front, which is how a long focal length fits a short tube.`,
      explain: t`$F'$ is 120 mm behind $L_2$, so $H'$ is 400 mm in front of $F'$: 210 mm in front of $L_1$. The telephoto ratio, length over focal length, is $190/400 \approx 0.48$. A Cassegrain telescope (O4.3) is the same trick with mirrors.`,
    }),
    num({
      id: 'cp-thick', difficulty: 3, transfer: true,
      gen(r) {
        const R1 = r.pick([25, 30, 40]), R2 = r.pick([-80, -120, Infinity]), th = r.pick([6, 8, 12]);
        const els = [{ kind: 'surf', z: 0, R: R1, n: nd, ap: R1 / 2.5 }, { kind: 'surf', z: th, R: R2, n: 1, ap: R1 / 2.5 }];
        const c = B.cardinal(els), thin = 1 / ((nd - 1) * (1 / R1 - 1 / R2));
        return {
          prompt: t`The front element of a star tracker is a thick N-BK7 lens ($n = ${sf(nd, 5)}$): $R_1 = +${R1}$ mm, ${Number.isFinite(R2) ? t`$R_2 = ${R2}$ mm` : 'a flat back'}, centre thickness ${th} mm. What is its effective focal length, in mm?`,
          visual: bench({ elements: els, source: 'inf', rays: 5, fill: [-0.7, 0.7], x: [-0.6 * R1, 2.8 * R1], y: [-R1 / 2, R1 / 2], marks: [], readout: false }, t`The lens to scale along the axis, paraxial rays; the focus is hidden. Heights exaggerated.`),
          answer: c.f, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: thin, feedback: 'That is the thin-lens value. The thickness matters: build the matrix R₂ T R₁.' }, { value: c.bfd, feedback: 'That is the back focal distance, from the back vertex.' }].filter((e) => Math.abs(e.value - c.f) > 0.01 * c.f),
          hints: [t`$M = \mathcal R_2\,\mathcal T(${th})\,\mathcal R_1$; only $C$ is needed.`, t`$C = -P_1 - P_2 + \dfrac{t}{n}P_1P_2$ with $P_1 = (n - 1)/R_1$, $P_2 = (1 - n)/R_2$.`],
          teach: t`Thick lens: $1/f = P_1 + P_2 - (t/n)P_1P_2$.`,
          explain: t`$f = -1/C = ${sf(c.f, 4)}$ mm (thin-lens estimate $${sf(thin, 4)}$ mm).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §6.1–6.2 (thick lenses, matrix methods)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'A. Gerrard and J. M. Burch, Introduction to Matrix Methods in Optics (Wiley, 1975; Dover, 1994)', url: 'https://openlibrary.org/works/OL3264985W' },
  ],
});
