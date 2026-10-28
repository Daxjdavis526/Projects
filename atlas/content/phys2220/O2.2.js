// Thin lenses: converging and diverging lenses, principal rays, the thin-lens
// equation 1/d_o + 1/d_i = 1/f and m = −d_i/d_o with the sign conventions,
// the lensmaker's formula, power in dioptres — and why covering half a lens
// dims the image without cutting it in half. Pictures from optics-rays
// (lens mode, paraxial thin lens; model tested against the equations).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, apart, tand, lensPic, label, seg, r6 } from './_optics.js';

const t = String.raw;
const image = (f, dO) => { const dI = (dO * f) / (dO - f); return { dI, m: -dI / dO }; };

/** A lens in cross-section with its two surfaces' centres of curvature (curvature exaggerated). Infinity: a flat face. */
function lensSection(R1, R2, l1, l2, caption) {
  const Rd = 6, a = 3, v = 0.9;
  const arc = (side, R) => {
    if (!Number.isFinite(R)) return seg([side * v * 0.35, -a], [side * v * 0.35, a], { color: 'accent2', width: 2.4 });
    const cx = side < 0 ? -v + Rd : v - Rd;
    return { param: [`${r6(cx)} ${side < 0 ? '-' : '+'} sqrt(${Rd * Rd} - t^2)`, 't'], t: [-a, a], color: 'accent2', width: 2.4 };
  };
  const c1 = -v + Rd, c2 = v - Rd;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-7.5, 7.5], y: [-3.7, 3.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [arc(-1, R1), arc(1, R2), seg([-7.5, 0], [7.5, 0], { color: 'ink3', width: 1 }),
        ...(Number.isFinite(R1) ? [seg([-v, 0.12], [c1, 0.12], { color: 'gold', width: 1.4, dash: true })] : []),
        ...(Number.isFinite(R2) ? [seg([v, -0.12], [c2, -0.12], { color: 'violet', width: 1.4, dash: true })] : [])],
      points: [
        ...(Number.isFinite(R1) ? [{ x: r6(c1), y: 0, color: 'gold', r: 4.5, label: 'C₁', labelDx: 6, labelDy: -10 }] : []),
        ...(Number.isFinite(R2) ? [{ x: r6(c2), y: 0, color: 'violet', r: 4.5, label: 'C₂', labelDx: -22, labelDy: -10 }] : []),
        label(-6.9, 3.3, `first surface: ${l1}`, 'gold'), label(1.4, 3.3, `second surface: ${l2}`, 'violet'),
        label(-6.9, -3.1, 'light travels left to right →', 'ink3'),
      ],
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.O2.2',
  title: 'Thin lenses',
  minutes: 14, difficulty: 2,
  intro: t`A **converging** lens (thicker in the middle) bends rays parallel to its axis so that they cross at a focal point F, a distance $f$ beyond it; a **diverging** lens (thicker at the edges) spreads them as if they came from a focal point in front of it. Images follow the same equation as for mirrors:

$$\frac{1}{d_o} + \frac{1}{d_i} = \frac{1}{f}, \qquad m = -\frac{d_i}{d_o}$$

For a lens the signs read: $f > 0$ converging, $f < 0$ diverging; $d_i > 0$ a **real** image on the far side (light really meets there), $d_i < 0$ a **virtual** image on the object's side.`,
  symbols: [
    { tex: 'd_o', text: 'the object distance, from the object to the lens, in m or cm' },
    { tex: 'd_i', text: 'the image distance: positive for a real image beyond the lens, negative for a virtual image on the same side as the object' },
    { tex: 'f', text: 'the focal length: positive for a converging lens, negative for a diverging one. Its reciprocal $1/f$ in m⁻¹ is the lens’s **power**, in **dioptres** (D)' },
    { tex: 'm', text: 'the magnification $h_i/h_o$: its size is the enlargement; negative means the image is upside down' },
  ],
  why: 'A camera, a star tracker, your eye and a pair of glasses all form images by this one equation; applied twice in a row it designs microscopes and telescopes.',
  visual: {
    type: 'optics-rays',
    title: 'Images through a thin lens',
    lead: t`The three principal rays from the object's tip — parallel to the axis, through the centre, and through F — meet at the tip of the image (green). The fan shows that *every* ray from the tip goes there. Drag the object, change the lens, and slide the card over it.`,
    tasks: [
      'Drag the object in from far away toward F: the real image moves out and grows; with the object at 2F, image and object are the same size.',
      'Cover half the lens with the card: the whole image stays where it was, only dimmer — the rays through the uncovered half still reach every point of it.',
      'Switch to a diverging lens: wherever the object is, the image is virtual, upright and smaller, on the object’s side.',
    ],
    params: { mode: 'lens', f: 10, dO: 25, hO: 4, rays: 'both' },
  },
  example: {
    prompt: t`A 3.0 cm tall object stands 30 cm in front of a converging lens with $f = 20$ cm. Where is the image, how tall is it, and what kind of image is it?`,
    visual: lensPic({ f: 20, dO: 30, hO: 3, view: [-36, 68] }, 'The object, the three principal rays and the image (ideal thin lens, to scale).'),
    steps: [
      { label: 'Lens equation', text: t`$\dfrac{1}{d_i} = \dfrac{1}{f} - \dfrac{1}{d_o} = \dfrac{1}{20} - \dfrac{1}{30} = \dfrac{1}{60}$, so $d_i = +60$ cm: a real image 60 cm beyond the lens.` },
      { label: 'Magnification', text: t`$m = -d_i/d_o = -60/30 = -2.0$, so $h_i = -2.0\times3.0 = -6.0$ cm: twice as tall, upside down.` },
      { label: 'Sense check', text: t`The object sits between F (20 cm) and 2F (40 cm), and the rays agree: the image lies beyond 2F, enlarged and inverted — the arrangement of a slide projector.` },
    ],
    answer: t`A real, inverted image 60 cm beyond the lens, $6.0$ cm tall ($m = -2.0$).`,
  },
  practice: [
    num({
      id: 'lens-eq', difficulty: 1,
      gen(r) {
        const [f, dO] = r.pick([[10, 15], [10, 30], [15, 40], [20, 25], [8, 24], [25, 75]]);
        const { dI } = image(f, dO);
        return {
          prompt: t`An object is ${dO} cm in front of a converging lens of focal length ${f} cm. Where is the image?`,
          answer: dI, units: 'cm', tol: { rel: 0.005 },
          errors: apart([{ value: 1 / (1 / f + 1 / dO), feedback: t`Subtract: $1/d_i = 1/f - 1/d_o$.` }, { value: -dI, feedback: 'Check the sign: the image of an object outside F is real, beyond the lens: positive.' }], dI),
          hints: [t`$\dfrac{1}{d_i} = \dfrac{1}{f} - \dfrac{1}{d_o}$.`, t`$\dfrac{1}{${f}} - \dfrac{1}{${dO}} = ${tn(1 / f - 1 / dO, 4)}\ \text{cm}^{-1}$.`],
          teach: t`The thin-lens equation $1/d_o + 1/d_i = 1/f$ finds the image; positive $d_i$ is a real image beyond the lens.`,
          explain: t`$1/d_i = 1/${f} - 1/${dO} = ${tn(1 / f - 1 / dO, 4)}\ \text{cm}^{-1}$, so $d_i = ${tn(dI)}$ cm beyond the lens: real, and inverted.`,
          visual: lensPic({ f, dO, hO: 3, image: false }, `The object ${dO} cm from a converging lens with f = ${f} cm, and the principal rays reaching the lens. Where they meet beyond it is what you are finding.`),
        };
      },
    }),
    num({
      id: 'lens-height', difficulty: 2,
      gen(r) {
        const [f, dO] = r.pick([[10, 14], [12, 20], [10, 40], [15, 18], [20, 60]]);
        const h = r.pick([1.5, 2, 3]);
        const { dI, m } = image(f, dO);
        return {
          prompt: t`A ${h} cm tall object is ${dO} cm in front of a converging lens with $f = ${f}$ cm. How tall is its image? (Negative if inverted.)`,
          answer: m * h, units: 'cm', tol: { rel: 0.005 },
          errors: apart([{ value: -m * h, feedback: t`Keep the minus sign: $m = -d_i/d_o$, and a single lens's real image is inverted.` }, { value: h * dO / dI, feedback: t`Upside down: $m = -d_i/d_o$.` }], m * h),
          hints: ['Find the image distance first, with the lens equation.', t`Then $m = -d_i/d_o$ and $h_i = m h_o$.`],
          teach: t`First locate the image; then $m = -d_i/d_o$ gives its size and orientation.`,
          explain: t`$d_i = ${tn(dI)}$ cm, $m = -${tn(dI)}/${dO} = ${tn(m)}$, so $h_i = ${tn(m * h)}$ cm.`,
          visual: lensPic({ f, dO, hO: h, hide: ['m', 'di'] }, 'The object, principal rays and image (ideal thin lens, to scale).'),
        };
      },
    }),
    mcq({
      id: 'half-lens', difficulty: 2,
      prompt: 'A converging lens projects a sharp image of a lamp onto a screen. You cover the top half of the lens with a card. What happens to the image on the screen?',
      choices: ['The whole image is still there, but dimmer', 'The top half of the image disappears', 'The bottom half of the image disappears, because the image is inverted', 'The image disappears: the principal rays are blocked'],
      answer: 0,
      why: {
        1: 'Each point of the lamp sends rays through *every* part of the lens, and they all converge on the same image point. The lower half of the lens still delivers rays to every image point.',
        2: 'Inversion moves where each image point is, not which part of the lens makes it. Every part of the lens contributes to every point of the image.',
        3: 'The principal rays are just three easy rays to draw. Any other rays from the object that pass the uncovered half still meet at the image.',
      },
      hints: ['Pick one point on the lamp. Which parts of the lens do its rays pass through on their way to its image point?', 'Run the Explore picture with the fan of rays and the card over half the lens.'],
      teach: 'Every part of a lens forms the whole image; covering part of it only dims the image.',
      explain: 'Rays from each point of the lamp spread over the whole lens and all converge on that point’s image. The card removes half of the rays reaching each image point, so every point keeps half its brightness: the whole picture, dimmer. (Research by Goldberg and McDermott found most students predict half an image, even after instruction.)',
      visual: lensPic({ f: 10, dO: 25, hO: 4, mask: 0.5, rays: 'fan', image: false }, 'A fan of rays from the tip of the object reaching the lens, half of which is covered by a card (to scale). What appears on the far side is the question.'),
    }),
    num({
      id: 'diverging', difficulty: 2,
      gen(r) {
        const [f, dO] = r.pick([[-15, 30], [-20, 20], [-10, 30], [-12, 24], [-30, 15]]);
        const { dI } = image(f, dO);
        return {
          prompt: t`An object is ${dO} cm in front of a diverging lens with focal length $${f}$ cm. Where is its image? (Give $d_i$ with its sign.)`,
          answer: dI, units: 'cm', tol: { rel: 0.005 },
          errors: apart([{ value: -dI, feedback: t`A diverging lens forms a virtual image on the object's side: $d_i$ must be negative.` }, { value: image(-f, dO).dI, feedback: t`A diverging lens has a *negative* focal length: $f = ${f}$ cm.` }], dI),
          hints: [t`Use $f = ${f}$ cm with its sign in $1/d_i = 1/f - 1/d_o$.`, t`$\dfrac{1}{d_i} = -\dfrac{1}{${-f}} - \dfrac{1}{${dO}}$.`],
          teach: t`A diverging lens ($f < 0$) always makes a virtual, upright, smaller image of a real object: $d_i$ comes out negative.`,
          explain: t`$1/d_i = 1/(${f}) - 1/${dO} = ${tn(1 / f - 1 / dO, 4)}\ \text{cm}^{-1}$, so $d_i = ${tn(dI)}$ cm: a virtual image ${tn(-dI)} cm in front of the lens, on the object's side, upright with $m = ${tn(-dI / dO)}$.`,
          visual: lensPic({ f, dO, hO: 4, image: false }, `The object in front of a diverging lens (f = ${f} cm), rays arriving (to scale).`),
        };
      },
    }),
    num({
      id: 'lensmaker', difficulty: 2,
      gen(r) {
        const [kind, R1, R2, n] = r.pick([['symmetric biconvex', 20, -20, 1.5], ['plano-convex', 10, Infinity, 1.5], ['biconvex', 15, -25, 1.52], ['symmetric biconvex', 30, -30, 1.6]]);
        const inv = (n - 1) * (1 / R1 - (Number.isFinite(R2) ? 1 / R2 : 0)), f = 1 / inv;
        const r2txt = Number.isFinite(R2) ? t`$R_2 = ${R2}$ cm` : t`flat ($R_2 = \infty$)`;
        return {
          prompt: t`A ${kind} glass lens ($n = ${n}$) has surfaces with $R_1 = +${R1}$ cm and ${r2txt}. Use the lensmaker's formula $\dfrac{1}{f} = (n - 1)\left(\dfrac{1}{R_1} - \dfrac{1}{R_2}\right)$ to find its focal length in air.`,
          answer: f, units: 'cm', tol: { rel: 0.005 },
          errors: apart([{ value: 1 / ((n - 1) * (1 / R1 + (Number.isFinite(R2) ? 1 / R2 : 0))), feedback: t`Mind the sign of $R_2$: a surface whose centre lies on the incoming side has negative $R$, and the formula subtracts $1/R_2$.` }, { value: 1 / (n * (1 / R1 - (Number.isFinite(R2) ? 1 / R2 : 0))), feedback: t`The factor is $(n - 1)$, not $n$: a lens of $n = 1$ would not bend light at all.` }], f),
          hints: [t`Sign rule: $R > 0$ when the surface's centre of curvature lies beyond it (on the outgoing side). Here $R_1 = +${R1}$ cm${Number.isFinite(R2) ? ` and $R_2 = ${R2}$ cm` : ' and the flat face contributes $1/R_2 = 0$'}.`, t`$(n - 1) = ${tn(n - 1, 2)}$; multiply by $\left(\frac{1}{${R1}} - \frac{1}{R_2}\right)$, then take the reciprocal.`],
          teach: 'The lensmaker’s formula ties a lens’s focal length to its glass and the curvature of its two faces.',
          explain: t`$\dfrac{1}{f} = ${tn(n - 1, 2)}\left(\dfrac{1}{${R1}} - ${Number.isFinite(R2) ? t`\dfrac{1}{${R2}}` : '0'}\right) = ${tn(inv, 4)}\ \text{cm}^{-1}$, so $f = ${tn(f)}$ cm. More strongly curved faces, or glass of higher index, give a shorter focal length.`,
          visual: lensSection(R1, R2, `R₁ = +${R1} cm`, Number.isFinite(R2) ? `R₂ = ${R2} cm` : 'flat', 'The lens in cross-section and the centres of curvature of its faces (curvature exaggerated).'),
        };
      },
    }),
    num({
      id: 'dioptres', difficulty: 1,
      gen(r) {
        const [P, who] = r.pick([[2.5, 'A pair of reading glasses'], [4, 'A magnifying lens'], [-2, 'A lens for short-sighted eyes'], [1.25, 'A pair of reading glasses'], [-1.5, 'A lens for short-sighted eyes']]);
        return {
          prompt: t`${who} has a power of $${P > 0 ? '+' : ''}${P}$ dioptres. What is its focal length, in centimetres? (Power is $1/f$ with $f$ in metres; give the sign.)`,
          answer: 100 / P, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: P, feedback: 'That is the power itself. The focal length is its reciprocal: f = 1/P, in metres.' }, { value: 1 / P, feedback: 'Right number, but in metres — the question asks for centimetres.' }],
          hints: [t`$f = 1/P$ gives metres.`, 'Multiply by 100 for centimetres; keep the sign.'],
          teach: 'Opticians use power in dioptres, P = 1/f with f in metres: positive converges, negative diverges.',
          explain: t`$f = 1/(${P}\ \text{m}^{-1}) = ${tn(1 / P)}$ m $= ${tn(100 / P)}$ cm${P < 0 ? ': a diverging lens' : ': a converging lens'}. Powers add for thin lenses in contact, which is why prescriptions are written this way.`,
          visual: lensPic({ f: Math.sign(P) * Math.min(60, Math.max(4, Math.abs(100 / P) / 4)), obj: 'star', tilt: 0, image: false, hide: ['F'] }, `Parallel light meeting a ${P > 0 ? 'converging' : 'diverging'} lens (not to scale).`),
        };
      },
    }),
    {
      type: 'slider', id: 'same-size', difficulty: 2,
      prompt: t`A converging lens has $f = 10$ cm. Move the object until its real image is exactly the same size as the object (but upside down).`,
      visual: { type: 'optics-rays', params: { mode: 'lens', f: 10, dO: 32, hO: 3, rays: 'principal', controls: ['dO'], readout: false, hide: ['F'], view: [-42, 42] }, caption: 'Drag the object’s tip or use the slider; the focal points are hidden. Ideal thin lens, to scale.' },
      param: 'dO', answer: [19.5, 20.5],
      instruction: 'Set the object distance, then check.',
      hints: [t`Same size means $m = -1$, so $d_i = d_o$.`, t`Put $d_i = d_o$ into $1/d_o + 1/d_i = 1/f$: $2/d_o = 1/f$.`],
      teach: 'An object at twice the focal length gives a real image at twice the focal length on the other side, the same size.',
      explain: t`$m = -1$ needs $d_i = d_o$, and then $2/d_o = 1/f$ gives $d_o = 2f = 20$ cm — the point 2F. Nearer than that the image grows; farther, it shrinks.`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-projector', difficulty: 2,
      gen(r) {
        const f = r.pick([5, 8, 10]), D = r.pick([3, 4, 5]);
        const dO = 1 / (1 / f - 1 / (D * 100));
        return {
          prompt: t`A projector's lens ($f = ${f}$ cm) throws a sharp image of a slide onto a screen ${D}.0 m away. How far from the lens must the slide be?`,
          answer: dO, units: 'cm', tol: { rel: 0.002 },
          errors: apart([{ value: f, feedback: t`Close, but not exactly at F, or the image would be at infinity. Solve the lens equation with $d_i = ${D * 100}$ cm.` }], dO),
          hints: [t`Here the image distance is known: $d_i = ${D * 100}$ cm.`, t`$1/d_o = 1/f - 1/d_i$.`],
          teach: 'For a large, distant image the object sits just outside the focal point.',
          explain: t`$1/d_o = 1/${f} - 1/${D * 100}$ gives $d_o = ${tn(dO, 4)}$ cm, just beyond F; the image is magnified $m = -${D * 100}/${tn(dO, 4)} = ${tn(-(D * 100) / dO, 3)}$ times (inverted, which is why slides go in upside down).`,
          visual: lensPic({ f: 10, dO: 12, hO: 1.5, image: false, view: [-20, 60] }, 'A slide just outside the focal point of a projector lens (not to scale: the real screen is metres away).'),
        };
      },
    }),
    num({
      id: 'cp-tracker', difficulty: 2, transfer: true,
      gen(r) {
        const f = r.pick([25, 35, 50]), a = r.pick([3, 5, 8]);
        const x = f * tand(a);
        return {
          prompt: t`A spacecraft's star tracker has a lens with $f = ${f}$ mm, its detector at the focal plane. A star lies $${a}°$ from the lens's axis. How far from the centre of the detector does its image land?`,
          answer: x, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: f / tand(a), feedback: t`Upside down: the offset is $f\tan\alpha$, the side opposite the angle.` }],
          hints: ['A star is so far away that its light arrives as parallel rays, imaged at the focal plane.', t`The ray through the centre of the lens goes straight, so the image is at $x = f\tan\alpha$ from the axis.`],
          teach: 'A lens maps each direction on the sky to one point of its focal plane: x = f tan α.',
          explain: t`$x = f\tan\alpha = ${f}\ \text{mm}\times\tan ${a}° = ${tn(x)}$ mm. Measuring where several stars land, and matching their pattern to a catalogue, gives the spacecraft's orientation to a few arcseconds; one 5.5 µm pixel spans $5.5\times10^{-3}/${f}$ rad, about $${tn((5.5e-3 / f) * 206265)}''$.`,
          visual: lensPic({ f, obj: 'star', tilt: a, unit: 'mm', hide: ['image'] }, 'Light from a star at an angle to the axis meeting the tracker’s lens (ideal thin lens; the angle drawn to scale).'),
        };
      },
    }),
    mcq({
      id: 'cp-jwst', difficulty: 3, transfer: true,
      prompt: 'In 2022 a micrometeoroid struck one of the 18 segments of JWST’s 6.5 m primary mirror, leaving a small damaged patch. What did that do to the telescope’s images?',
      choices: [
        'Every image lost a little quality — a slightly dimmer, slightly blurred picture overall — but no part of any image went missing',
        'A dark spot appears in the same place in every image',
        'One eighteenth of every image is missing',
        'Nothing at all: mirrors, unlike lenses, are unaffected by damage',
      ],
      answer: 0,
      why: {
        1: 'The mirror is not in focus on the detector: every patch of it sends light to every point of the image, so a damaged patch cannot make a matching spot.',
        2: 'This is the half-lens idea again: each segment contributes light to the whole image, not to one eighteenth of it.',
        3: 'A damaged patch scatters or loses some light, so the image does suffer — just everywhere a little, not anywhere completely.',
      },
      hints: ['Think of the half-covered lens: which parts of a focusing mirror send light to one point of the image?', 'Damage removes or scatters a little of the light that every image point receives.'],
      teach: 'Every part of a focusing lens or mirror contributes to every point of the image, so local damage degrades the whole image slightly rather than removing part of it.',
      explain: 'Each point of a star’s image is made by light from the entire primary mirror. A damaged patch sends a little light the wrong way and collects less, so the whole image loses a little sharpness and contrast — NASA reported a marginally detectable effect in the data, with the telescope still exceeding its requirements. The same physics explains the covered lens: a dirty or partly blocked aperture dims and softens, it does not crop.',
      visual: lensPic({ f: 10, dO: 25, hO: 4, mask: 0.15, rays: 'fan', image: false }, 'The lens analogue: a small patch of the aperture blocked, with a fan of rays from one object point (the telescope uses a mirror, but the reasoning is the same).'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §2.4 Thin Lenses', url: 'https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses' },
    { label: 'Goldberg & McDermott, “An investigation of student understanding of the real image formed by a converging lens or concave mirror”, Am. J. Phys. 55, 108 (1987)', url: 'https://doi.org/10.1119/1.15254' },
    { label: 'NASA: JWST micrometeoroid impact on a primary-mirror segment (2022)', url: 'https://blogs.nasa.gov/webb/2022/06/08/webb-engineered-to-endure-micrometeoroid-impacts/' },
  ],
});
