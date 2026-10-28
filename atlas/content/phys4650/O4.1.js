// Spherical surfaces and thin lenses (Hecht §5.2). PHYS 2220 O2.2 gave the
// thin-lens equation and the lensmaker's formula as facts; here they are
// built. One spherical surface, paraxially: n₁/s_o + n₂/s_i = (n₂ − n₁)/R,
// with Hecht's signs (R > 0 when the centre of curvature lies on the side
// light goes to). Two surfaces in a row, the first image the second object,
// and the thin limit, give the lensmaker's and thin-lens equations; the
// Newtonian form x_o x_i = f²; a lens in water. Uses the new op2-bench
// tracer (single surface, ball lens, exact vs paraxial) and graph pictures.
// Transfers: a star tracker's equiconvex singlet, an orbital camera's focus
// shift for the Earth 400 km away (nanometres: why "focus at infinity" works).
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { sf, nOf, MATS } from './_op.js';
import { B, bench } from './_op2.js';

const t = String.raw;
const nd = nOf('bk7', 587.56);

// the worked example: an N-BK7 biconvex lens, R = ±50 mm, object 300 mm away, built one surface at a time
const EX = { R1: 50, R2: -50, so: 300, n: nd };
EX.si1 = EX.n / ((EX.n - 1) / EX.R1 - 1 / EX.so);           // image of surface 1, in the glass
EX.so2 = -EX.si1;                                           // a virtual object for surface 2 (thin lens)
EX.si = 1 / ((1 - EX.n) / EX.R2 - EX.n / EX.so2);
EX.f = 1 / ((EX.n - 1) * (1 / EX.R1 - 1 / EX.R2));
EX.check = 1 / (1 / EX.f - 1 / EX.so);
if (Math.abs(EX.check - EX.si) > 1e-9) throw new Error('O4.1 example');

/** One refracting surface with a point object on the axis (lengths in mm). */
const oneSurf = (R, n, so, caption, extra = {}) => bench({
  elements: [{ kind: 'surf', z: 0, R, n, ap: 10 }], source: 'point', obj: [-so, 0], rays: 9, fill: [-0.9, 0.9],
  x: [-so * 1.08, Math.max(60, 1.5 * Math.abs((n * R) / (n - 1)))], y: [-14, 14], marks: [], readout: false, ...extra,
}, caption);

/** A thin lens of focal length f (mm) drawn as a symbol, with a point object at so. */
const thinPic = (f, so, caption, extra = {}) => bench({
  elements: [{ kind: 'thin', z: 0, f, ap: 10 }], source: 'point', obj: [-so, 0], rays: 7, fill: [-0.9, 0.9],
  x: [-so * 1.1, Math.max(2.2 * f, 1.3 * Math.abs((f * so) / (so - f)))], y: [-14, 14], marks: ['F', 'F2'], readout: false, ...extra,
}, caption);

export default lesson({
  id: 'phys4650.O4.1',
  title: 'Spherical surfaces and thin lenses',
  minutes: 16, difficulty: 3,
  intro: t`In [PHYS 2220](#/lesson/phys2220.O2.2) the thin-lens equation arrived ready-made. Here you build it. Start with **one** curved boundary between two media. Applying Snell’s law to rays close to the axis (the paraxial approximation, $\sin\theta \approx \theta$) gives a point image for a point object:

$$\frac{n_1}{s_o} + \frac{n_2}{s_i} = \frac{n_2 - n_1}{R}$$

A lens is two such surfaces. The first surface’s image is the second surface’s object, and when the glass is thin that chain collapses into the lensmaker’s formula and $1/s_o + 1/s_i = 1/f$. The sign conventions here are Hecht’s, and every later lesson uses them.`,
  symbols: [
    { tex: 'n_1,\\ n_2', text: 'the refractive indices on the incoming side and on the far side of the surface' },
    { tex: 's_o', text: t`the object distance, in m: positive for a real object on the incoming side (light diverging from it)` },
    { tex: 's_i', text: t`the image distance, in m: positive for a real image on the far side (light converging to it); negative means a virtual image on the incoming side` },
    { tex: 'R', text: t`the surface’s radius of curvature, in m: positive when its centre of curvature lies on the far side (a surface bulging toward the incoming light), negative otherwise; $R = \infty$ for a flat surface` },
    { tex: '(n_2 - n_1)/R', text: t`the surface’s **power**, in dioptres (m⁻¹) when $R$ is in metres: how strongly it bends rays` },
  ],
  why: t`Every lens, every window and the cornea of your eye are built from this one equation; it is the first link in the matrix method of the next lesson and in the course’s telescope design.`,
  visual: { title: 'One refracting surface', lead: t`A point source in air sends rays to one spherical surface of glass. Paraxially they all meet at one image point, at the $s_i$ the equation predicts (readout). Change the object distance, the curvature and the glass.`,
    tasks: [
      t`Bring the source closer: the image recedes and, once $s_o$ is shorter than the front focal distance $n_1R/(n_2 - n_1)$, it becomes virtual (negative $s_i$) and the rays diverge.`,
      t`Raise $n_2$: the surface bends more strongly and the image moves in.`,
      t`Switch to exact rays: the outer rays cross short of the paraxial image — the first sign of spherical aberration.`,
    ],
    ...oneSurf(20, 1.5, 60, t`One spherical surface of glass ($n_2$, shaded) with a point source in air; heights are exaggerated about five times. Gold: rays; green: the paraxial image. The image is where the rays meet; with exact rays (switch) the outer ones cross a little short of the paraxial image.`, {
    rays: 9, marks: ['image'], readouts: ['image', 'bfd'], readout: true, toggle: true,
    controls: [
      { key: 'so', label: 'Object distance $s_o$', min: 25, max: 150, step: 1, value: 60, unit: '\\mathrm{mm}', explain: 'How far in front of the surface the point source sits.', set: [['obj', 0, -1, 0]] },
      { key: 'R', label: 'Radius of curvature $R$', min: 10, max: 60, step: 1, value: 20, unit: '\\mathrm{mm}', explain: 'Positive: the centre of curvature is inside the glass, so the surface bulges toward the light.', set: [[0, 'R']] },
      { key: 'n2', label: 'Index of the glass $n_2$', min: 1.2, max: 2.4, step: 0.01, value: 1.5, explain: 'The medium beyond the surface: 1.33 water, 1.52 crown glass, 2.42 diamond.', set: [[0, 'n']] },
    ],
    x: [-160, 220],
  }) },
  example: {
    prompt: t`A biconvex lens of N-BK7 ($n = ${sf(nd, 5)}$ at 587.6 nm) has $R_1 = +${EX.R1}$ mm and $R_2 = ${EX.R2}$ mm, and is thin. An object stands $${EX.so}$ mm in front of it. Find the image by treating the two surfaces one after the other, then check the answer against the thin-lens equation.`,
    visual: bench({ elements: [{ kind: 'surf', z: 0, R: EX.R1, mat: 'crown', ap: 10 }, { kind: 'surf', z: 4, R: EX.R2, n: 1, ap: 10 }], source: 'point', obj: [-EX.so, 0], rays: 7, fill: [-0.9, 0.9], x: [-EX.so * 1.05, 110], y: [-14, 14], marks: ['image'], readout: false }, t`The two surfaces, the object on the left and the rays to the image. The lens is drawn 4 mm thick; the example treats it as thin. Heights exaggerated.`),
    steps: [
      { label: 'First surface', text: t`Air to glass, $R_1 = +${EX.R1}$ mm: $\dfrac{1}{${EX.so}} + \dfrac{${sf(nd, 5)}}{s_{i1}} = \dfrac{${sf(nd - 1, 4)}}{${EX.R1}}$, so $s_{i1} = ${sf(EX.si1, 4)}$ mm. That image lies inside the glass — beyond the second surface, in fact.` },
      { label: 'It becomes the next object', text: t`The light converging toward that point meets the second surface first. For surface 2 it is a **virtual object** on the far side: $s_{o2} = -${sf(EX.si1, 4)}$ mm (negative, because the light converges toward it rather than diverging from it).` },
      { label: 'Second surface', text: t`Glass to air, $R_2 = ${EX.R2}$ mm: $\dfrac{${sf(nd, 5)}}{${sf(EX.so2, 4)}} + \dfrac{1}{s_i} = \dfrac{1 - ${sf(nd, 5)}}{${EX.R2}}$, so $s_i = ${sf(EX.si, 4)}$ mm.` },
      { label: 'Thin-lens algebra', text: t`Add the two surface equations with $s_{o2} = -s_{i1}$: the $n/s_{i1}$ terms cancel and $\dfrac{1}{s_o} + \dfrac{1}{s_i} = (n - 1)\left(\dfrac{1}{R_1} - \dfrac{1}{R_2}\right) = \dfrac{1}{f}$.` },
      { label: 'Check', text: t`$f = ${sf(EX.f, 4)}$ mm and $1/${EX.so} + 1/s_i = 1/${sf(EX.f, 4)}$ gives $s_i = ${sf(EX.check, 4)}$ mm — the same, as it must be. A real image, about ${sf(EX.si / EX.f, 2)} focal lengths behind the lens because the object is ${sf(EX.so / EX.f, 2)} focal lengths in front.` },
    ],
    answer: t`$s_i = ${sf(EX.si, 4)}$ mm behind the lens; the chained surfaces reproduce the thin-lens equation with $f = ${sf(EX.f, 4)}$ mm.`,
  },
  practice: [
    num({
      id: 'cornea', difficulty: 1,
      gen(r) {
        const R = r.pick([7.6, 7.7, 7.8, 7.9, 8.0]), [so, what] = r.pick([[Infinity, 'a distant star'], [250, 'a page 250 mm away'], [500, 'a screen 500 mm away']]);
        const n2 = 1.336, si = n2 / ((n2 - 1) / R - (Number.isFinite(so) ? 1 / so : 0));
        return {
          prompt: t`Model the eye’s cornea as one spherical surface, radius $R = ${R}$ mm, between air and the watery aqueous humour ($n = ${n2}$). Ignoring the eye’s lens, how far behind the cornea would it focus ${what}, in mm?`,
          visual: oneSurf(R, n2, Number.isFinite(so) ? Math.min(so, 140) : 120, t`One surface between air and aqueous humour, with ${Number.isFinite(so) ? 'a point object (distance shortened when it is far)' : 'a distant point'}; the image position is hidden. Heights exaggerated.`, Number.isFinite(so) ? {} : { source: 'inf', x: [-40, 50] }),
          answer: si, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: R / (n2 - 1), feedback: t`You left out $n_2$ on the image side: $n_2/s_i$, not $1/s_i$.` }, { value: (n2 * R) / (n2 - 1), feedback: Number.isFinite(so) ? 'That is where a distant object would focus; this object is at a finite distance.' : 'Right physics — check the arithmetic.' }].filter((e) => Math.abs(e.value - si) > 0.01 * si),
          hints: [t`$\dfrac{n_1}{s_o} + \dfrac{n_2}{s_i} = \dfrac{n_2 - n_1}{R}$ with $n_1 = 1$, $n_2 = ${n2}$; a distant object has $1/s_o = 0$.`],
          teach: t`A single curved surface focuses: $n_2/s_i = (n_2 - n_1)/R - n_1/s_o$.`,
          explain: t`$s_i = ${sf(si, 3)}$ mm. The real eye is about 24 mm long: the cornea does about two thirds of the focusing and the crystalline lens the rest.`,
        };
      },
    }),
    mcq({
      id: 'sign-R', difficulty: 2, kind: 'error',
      prompt: t`Light in air meets the hollow (concave) face of a glass block ($n = 1.5$): the surface curves away from the light, its centre of curvature 40 mm in front of it, in the air. A student writes $\dfrac{1}{s_o} + \dfrac{1.5}{s_i} = \dfrac{0.5}{+40\ \text{mm}}$. What is wrong?`,
      visual: oneSurf(-40, 1.5, 80, t`A concave air–glass surface with a point object. Rays diverge after the surface.`, { x: [-90, 60] }),
      choices: [t`$R$ is negative here: the centre of curvature is on the incoming side, so the surface diverges light and $R = -40$ mm.`, t`$R$ is right; the indices should be swapped, $(1 - 1.5)/R$.`, t`A concave surface needs the mirror equation, not the refraction equation.`, t`Nothing: $R$ is always taken as positive.`],
      answer: 0,
      why: { 1: t`The indices are in the right order: $n_1$ where the light comes from, $n_2$ where it goes.`, 2: 'It refracts light, so the refraction equation applies; only the sign of R carries the shape.', 3: t`The sign of $R$ is what tells a converging surface from a diverging one; dropping it gives wrong images.` },
      hints: [t`Hecht’s rule: $R > 0$ when the centre of curvature lies on the side the light goes to.`, 'Where is the centre of this surface: in the air or in the glass?'],
      teach: t`$R$ is positive when the centre of curvature is on the outgoing side, negative when it is on the incoming side.`,
      explain: t`The centre is in the air, on the incoming side, so $R = -40$ mm and the power $(n_2 - n_1)/R = -0.0125\ \text{mm}^{-1}$ is negative: the surface spreads light out, as the picture shows.`,
    }),
    num({
      id: 'ball-lens', difficulty: 3,
      gen(r) {
        const D = r.pick([1, 1.5, 2, 3]), [mat, nm] = r.pick([['bk7', 1550], ['sapphire', 1310], ['silica', 1550], ['bk7', 850]]);
        const n = nOf(mat, nm), R = D / 2;
        const els = [{ kind: 'surf', z: -R, R, n, ap: R }, { kind: 'surf', z: R, R: -R, n: 1, ap: R }];
        const c = B.cardinal(els), efl = (n * D) / (4 * (n - 1)), bfd = efl - D / 2;
        if (Math.abs(c.bfd - bfd) > 1e-9 * D) throw new Error('ball lens');
        return {
          prompt: t`A ball lens couples a laser diode into a fibre. It is a sphere of ${MATS[mat].name}, ${D} mm across ($n = ${sf(n, 4)}$ at ${nm} nm). Parallel light enters it. How far beyond the ball’s back surface is the focus, in mm? (Paraxial; treat it as two surfaces with the glass between them.)`,
          visual: bench({ elements: els, source: 'inf', rays: 7, fill: [-0.45, 0.45], x: [-1.4 * D, 1.6 * D], y: [-0.75 * D, 0.75 * D], marks: [], readout: false }, t`Paraxial rays through a glass sphere (to scale). The rays fill only the middle of the ball, where the paraxial treatment holds.`),
          answer: bfd, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: efl, feedback: 'That is measured from the ball’s centre (where both principal planes lie). Subtract the radius.' }, { value: (n * R) / (n - 1) - D, feedback: 'You stopped after the first surface. Its image is a virtual object for the second surface.' }],
          hints: [t`Surface 1 ($R = +${R}$ mm): parallel light focuses at $s_{i1} = nR/(n - 1)$ from the front vertex.`, t`That point is $s_{i1} - ${D}$ mm beyond the back vertex: a virtual object, $s_{o2} = -(s_{i1} - ${D})$, for surface 2 with $R = -${R}$ mm.`],
          teach: t`Chain the surfaces: each image is the next surface’s object, with a negative (virtual) object distance when the light is still converging toward it.`,
          explain: t`$s_{i1} = ${sf((n * R) / (n - 1), 4)}$ mm; surface 2 then gives $${sf(bfd, 3)}$ mm. In closed form a ball lens has $f = nD/4(n - 1) = ${sf(efl, 3)}$ mm, measured from its centre.`,
        };
      },
    }),
    num({
      id: 'newton', difficulty: 2,
      gen(r) {
        const f = r.pick([50, 75, 100]), xo = r.pick([200, 400, 800, 1600]);
        const xi = (f * f) / xo;
        return {
          prompt: t`A camera lens of focal length ${f} mm is focused at infinity: its detector sits at the back focal point. To photograph a target ${xo} mm in front of the **front focal point**, how far must the detector move back? Use Newton’s form of the lens equation.`,
          visual: thinPic(f, f + xo > 6 * f ? 6 * f : f + xo, t`A thin lens with its focal points; the object’s rays converge beyond $F′$. Distances ${f + xo > 6 * f ? 'shortened; ' : ''}heights exaggerated.`, { marks: ['F', 'F2'] }),
          answer: xi, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: 1 / (1 / f - 1 / xo), feedback: t`You put $x_o$ in as $s_o$. Newton’s distances are measured from the focal points: $x_ox_i = f^2$.` }, { value: 1 / (1 / f - 1 / (xo + f)) , feedback: t`That is $s_i$, measured from the lens. The detector moves by $x_i = s_i - f$.` }],
          hints: [t`Newton: $x_ox_i = f^2$, with $x_o$ measured from $F$ and $x_i$ from $F′$.`],
          teach: t`Measured from the focal points, the lens equation becomes $x_ox_i = f^2$: the image moves past $F′$ by $f^2/x_o$.`,
          explain: t`$x_i = ${f}^2/${xo} = ${sf(xi, 3)}$ mm. Newton’s form is the one focusing mechanisms use: the shift is tiny for distant objects and grows fast as the object nears $F$.`,
        };
      },
    }),
    num({
      id: 'in-water', difficulty: 3,
      gen(r) {
        const fa = r.pick([50, 80, 100, 150]), mat = r.pick(['bk7', 'f2', 'sf11']);
        const n = nOf(mat, 587.56), nw = nOf('water', 587.56);
        const fw = (fa * (n - 1)) / (n / nw - 1);
        return {
          prompt: t`A thin lens of ${MATS[mat].name} ($n = ${sf(n, 4)}$) has $f = ${fa}$ mm in air. What is its focal length when it is submerged in water ($n = ${sf(nw, 4)}$), in mm?`,
          visual: bench({ elements: [{ kind: 'surf', z: 0, R: 2 * fa * (n - 1), n, ap: 10 }, { kind: 'surf', z: 3, R: -2 * fa * (n - 1), n: 1, ap: 10 }], source: 'inf', rays: 7, fill: [-0.9, 0.9], x: [-0.6 * fa, 1.4 * fa], y: [-14, 14], marks: ['F2'], readout: false }, t`The lens in air, focusing parallel light at $F′$. In water the surfaces bend light less. Heights exaggerated.`),
          answer: fw, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: fa * nw, feedback: 'The index ratio enters through (n − 1) and (n/n_w − 1), not as a simple factor.' }, { value: fa, feedback: 'The surrounding medium changes the power: each surface’s power is proportional to the index difference across it.' }],
          hints: [t`In a medium of index $n_m$: $\dfrac{1}{f} = \dfrac{n - n_m}{n_m}\left(\dfrac{1}{R_1} - \dfrac{1}{R_2}\right)$.`, t`The bracket is the same in air and in water, so $f_w/f_a = (n - 1)/(n/n_w - 1)$.`],
          teach: t`A lens’s power scales with the index **difference** across its surfaces: in water a glass lens is several times weaker.`,
          explain: t`$f_w = ${fa}\times\dfrac{${sf(n - 1, 4)}}{${sf(n / nw - 1, 4)}} = ${sf(fw, 3)}$ mm. It is why you see blurry under water: the cornea, whose index nearly matches water, loses most of its power.`,
        };
      },
    }),
    order({
      id: 'derive-surface', difficulty: 3,
      prompt: t`Put in order the derivation of the single-surface equation $n_1/s_o + n_2/s_i = (n_2 - n_1)/R$ from Snell’s law.`,
      visual: { type: 'graph', params: { x: [-7, 13], y: [-0.5, 2.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [{ param: ['3 - 3*cos(t)', '3*sin(t)'], t: [-0.73, 0.73], color: 'accent', width: 2.4 }, { fn: '0', color: 'ink3', width: 1, dash: [5, 4] }, { param: ['-6 + t*6.2505', 't*1.2'], t: [0, 1], color: 'gold', width: 2 }, { param: ['0.2505 + t*11.7495', '1.2 - t*1.2'], t: [0, 1], color: 'gold', width: 2 }, { param: ['3 - t*3.8434', 't*1.68'], t: [0, 1], color: 'ink3', width: 1, dash: [3, 3] }],
        points: [{ x: -6, y: 0, color: 'accent', label: 'S', labelDy: 12 }, { x: 12, y: 0, color: 'good', label: 'P', labelDy: 12 }, { x: 3, y: 0, color: 'ink2', label: 'centre', labelDy: 12 }, { x: 0.2505, y: 1.2, r: 3, color: 'ink', label: 'height h', labelDx: -60, labelDy: -6 }, { x: -2, y: 1.9, r: 0, label: 'n₁', color: 'ink2' }, { x: 6, y: 1.9, r: 0, label: 'n₂', color: 'ink2' }] }, caption: t`A ray from S refracting at height $h$ toward the image P; the dashed line is the radius (the surface normal). Drawn for $n_2 = 2n_1$, $R = 3$, $s_o = 6$, $s_i = 12$; angles exaggerated.` },
      items: [
        t`Snell at the point of incidence: $n_1\sin\theta_1 = n_2\sin\theta_2$, angles measured from the radius through the centre.`,
        t`Paraxial: replace each sine by its angle, $n_1\theta_1 = n_2\theta_2$.`,
        t`Write the angles with the ray slopes: $\theta_1 = h/s_o + h/R$ and $\theta_2 = h/R - h/s_i$.`,
        t`Substitute and divide by $h$: the height drops out, so every paraxial ray meets at one point P.`,
        t`Collect terms: $n_1/s_o + n_2/s_i = (n_2 - n_1)/R$.`,
      ],
      hints: [t`Start from the law that holds exactly; the approximation comes second.`, t`The cancellation of $h$ is what makes an image — it comes just before the final form.`],
      teach: 'In the paraxial limit the height of the ray cancels: that is why a spherical surface forms an image at all.',
      explain: t`Each angle is an exterior angle of a triangle with the radius CP: $\theta_1 = \alpha + \varphi$ and $\theta_2 = \varphi - \beta$, with slopes $\alpha = h/s_o$, $\beta = h/s_i$, $\varphi = h/R$. For rays far from the axis the small-angle step fails and the focus spreads out — spherical aberration (O4.5).`,
    }),
    {
      type: 'slider', id: 'focus-target', difficulty: 2,
      prompt: t`A star tracker’s 50 mm lens is tested in the lab with a point source closer than infinity. The detector is fixed 52.0 mm behind the lens. Move the point source until its image lands on the detector.`,
      visual: bench({ elements: [{ kind: 'thin', z: 0, f: 50, ap: 12, label: 'f = 50 mm' }, { kind: 'screen', z: 52, ap: 9, label: 'detector' }], source: 'point', obj: [-600, 0], rays: 7, fill: [-0.9, 0.9], x: [-45, 75], y: [-16, 16], marks: ['F2'], readouts: ['image'], clip: false,
        controls: [{ key: 'so', label: 'Source distance $s_o$', min: 200, max: 1400, step: 10, value: 600, unit: '\\mathrm{mm}', explain: 'How far in front of the lens the point source is.', set: [['obj', 0, -1, 0]] }] },
      t`The lens, its back focal point $F′$ and the detector 52 mm behind the lens. The source is far off to the left; heights exaggerated. The readout says how far beyond the detector the image forms.`),
      param: 'so', answer: [1270, 1330],
      instruction: 'Set the source distance so the rays cross at the detector, then check.',
      hints: [t`$1/s_o = 1/f - 1/s_i$ with $s_i = 52$ mm.`, t`$1/s_o = 1/50 - 1/52 = 0.000769\ \text{mm}^{-1}$.`],
      teach: 'Moving an object closer pushes its image farther behind the lens.',
      explain: t`$s_o = 1/(1/50 - 1/52) = 1300$ mm. In Newton’s form: $x_i = 2$ mm beyond $F′$ needs $x_o = 50^2/2 = 1250$ mm beyond $F$.`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-tracker', difficulty: 2, transfer: true,
      gen(r) {
        const f = r.pick([25, 35, 50, 85]), mat = r.pick(['bk7', 'silica']);
        const n = nOf(mat, 587.56), R = 2 * f * (n - 1);
        return {
          prompt: t`A small star tracker needs a thin equiconvex singlet ($R_2 = -R_1$) of ${MATS[mat].name} ($n = ${sf(n, 5)}$ at 587.6 nm) with $f = ${f}$ mm. What radius $R_1$ must the surfaces have, in mm?`,
          visual: bench({ elements: [{ kind: 'surf', z: 0, R, n, ap: f / 5 }, { kind: 'surf', z: f / 25, R: -R, n: 1, ap: f / 5 }], source: 'inf', rays: 7, fill: [-0.9, 0.9], x: [-0.5 * f, 1.3 * f], y: [-f / 3.5, f / 3.5], marks: ['F2'], readout: false }, t`An equiconvex lens focusing starlight at $F′$; heights exaggerated.`),
          answer: R, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: f * (n - 1), feedback: t`With $R_2 = -R_1$ the bracket is $2/R_1$: $R_1 = 2f(n - 1)$.` }, { value: 2 * f, feedback: t`The glass enters through $(n - 1)$.` }],
          hints: [t`Lensmaker: $1/f = (n - 1)(1/R_1 - 1/R_2)$ with $R_2 = -R_1$.`],
          teach: t`An equiconvex lens has $R = 2f(n - 1)$: about one focal length for glass.`,
          explain: t`$R_1 = 2\times${f}\times${sf(n - 1, 4)} = ${sf(R, 4)}$ mm. Real trackers use several elements (O4.5) to keep every star sharp across the field and over the band.`,
        };
      },
    }),
    mcq({
      id: 'cp-flip', difficulty: 2,
      prompt: t`A thin plano-convex lens is turned around, so the flat side faces the light instead of the curved side. What happens to its paraxial focal length?`,
      visual: bench({ elements: [{ kind: 'surf', z: 0, R: Infinity, n: 1.5168, ap: 10 }, { kind: 'surf', z: 4, R: -51.68, n: 1, ap: 10 }], source: 'inf', rays: 7, fill: [-0.9, 0.9], x: [-40, 120], y: [-14, 14], marks: ['F2'], readout: false }, t`The lens with its flat side to the light, paraxial rays. Heights exaggerated.`),
      choices: ['Nothing: the lensmaker’s formula is symmetric, so f is the same either way.', 'It doubles, because only one surface now faces the light.', 'It changes sign: the lens becomes diverging.', 'It halves, because the light meets the curved surface last.'],
      answer: 0,
      why: { 1: t`Both surfaces still bend the light; turning the lens swaps $R_1$ and $R_2$ and flips both signs, leaving $1/R_1 - 1/R_2$ unchanged.`, 2: 'A converging lens converges whichever way round it sits.', 3: 'The power of a thin lens does not depend on the order of its surfaces.' },
      hints: [t`Turned around, $R_1 = \infty \to R_1' = -R_2$ and so on. Compute $1/R_1 - 1/R_2$ both ways.`],
      teach: 'A thin lens has the same focal length from both sides; what does change with its orientation is its aberration (O4.5).',
      explain: t`Facing the light: $R_1 = +51.7$ mm, $R_2 = \infty$; flipped: $R_1 = \infty$, $R_2 = -51.7$ mm. Either way $1/R_1 - 1/R_2 = 1/51.7$ mm⁻¹. The **exact** rays differ, though: curved side first bends the light in two gentler steps and blurs the focus about four times less.`,
    }),
    num({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([0.5, 1, 1.5, 2.2]), h = r.pick([400, 500, 700]);
        const xi = (f * f) / (h * 1000 - f);
        return {
          prompt: t`An Earth-observation camera with focal length $f = ${f}$ m was focused at infinity on the ground. In orbit it photographs the ground ${h} km below. How far behind the back focal point does the ground’s image actually form, in nm? (Treat the optics as one thin lens.)`,
          visual: thinPic(50, 600, t`A thin lens with the object far to the left; the image forms just beyond $F′$. Not to scale: the real shift is far too small to see.`, { marks: ['F2'], x: [-620, 120] }),
          answer: xi * 1e9, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: (f * f) / (h * 1000) * 1e6, feedback: 'Check the units: the answer is asked for in nanometres.' }],
          hints: [t`Newton: $x_i = f^2/x_o$, and $x_o \approx ${h}$ km.`, t`$x_i = (${f}\ \text{m})^2/(${h}\times 10^{3}\ \text{m})$.`],
          teach: t`$x_i = f^2/x_o$: an object hundreds of kilometres away is at infinity for any practical lens.`,
          explain: t`$x_i = ${tex(xi, 3)}$ m $= ${sf(xi * 1e9, 3)}$ nm, far inside the depth of focus (about $\pm 2\lambda N^2$, micrometres for $N \approx 10$). Focus drifts in orbit come from temperature changes in the structure, not from the distance to Earth.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §5.2 (lenses)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'SCHOTT optical glass data sheet, N-BK7', url: 'https://refractiveindex.info/?shelf=glass&book=SCHOTT-optical&page=N-BK7' },
    { label: 'D. A. Atchison and G. Smith, Optics of the Human Eye (Butterworth-Heinemann, 2000), ch. 2', url: 'https://openlibrary.org/works/OL3492745W' },
  ],
});
