// Mirrors: plane mirrors (virtual image as far behind as the object is in
// front), spherical mirrors with f = R/2, the mirror equation
// 1/d_o + 1/d_i = 1/f with m = −d_i/d_o, and the sign conventions that tell
// real from virtual. Pictures from optics-rays (mirror mode, paraxial).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, apart, mirrorPic } from './_optics.js';

const t = String.raw;
const image = (f, dO) => { const dI = (dO * f) / (dO - f); return { dI, m: -dI / dO }; };

export default lesson({
  id: 'phys2220.O2.1',
  title: 'Mirrors',
  minutes: 12, difficulty: 2,
  intro: t`A flat mirror makes an image as far behind it as the object is in front, the same size and upright: the reflected rays only *seem* to come from there, so the image is **virtual**. A curved, spherical mirror can do more. A **concave** mirror sends rays parallel to its axis through a **focal point** F, halfway to its centre of curvature: $f = R/2$. Where the image of any object lands, and how big it is, follow from

$$\frac{1}{d_o} + \frac{1}{d_i} = \frac{1}{f}, \qquad m = \frac{h_i}{h_o} = -\frac{d_i}{d_o}$$

When $d_i$ is positive the light really meets in front of the mirror: a **real** image you can catch on a screen.`,
  symbols: [
    { tex: 'd_o', text: 'the object distance, from the object to the mirror, in m or cm (positive for a real object in front)' },
    { tex: 'd_i', text: 'the image distance: **positive** for a real image in front of the mirror, **negative** for a virtual image behind it' },
    { tex: 'f', text: 'the focal length: $+R/2$ for a concave mirror, $-|R|/2$ for a convex one, infinite for a flat one' },
    { tex: 'R', text: 'the radius of curvature: the radius of the sphere the mirror is part of; its centre is C' },
    { tex: 'm', text: 'the magnification, $h_i/h_o$: its size says how much bigger the image is, a negative sign that it is upside down' },
    { tex: 'h_o,\\ h_i', text: 'the heights of the object and the image' },
  ],
  why: 'Every large telescope — Hubble, JWST, the giant ground-based observatories — gathers light with curved mirrors rather than lenses: a mirror reflects every colour to the same focus and can be supported across its whole back.',
  visual: {
    type: 'optics-rays',
    title: 'Images in a curved mirror',
    lead: t`An object (blue arrow) stands in front of a concave mirror. Three easy rays from its tip — parallel to the axis, through F, and to the centre of the mirror — find the image (green). Drag the tip of the object, or switch mirrors.`,
    tasks: [
      'Drag the object from far away in to C (twice the focal length): the real, upside-down image grows and moves out to meet it — at C they are the same size.',
      'Bring the object inside F: the image jumps behind the mirror, upright and magnified — a shaving or make-up mirror.',
      'Switch to a convex mirror: wherever the object is, the image is virtual, upright and smaller — the wide view of a car’s side mirror.',
    ],
    params: { mode: 'mirror', f: 10, dO: 30, hO: 4 },
  },
  example: {
    prompt: t`A concave mirror has a radius of curvature of $30$ cm. A $4.0$ cm tall object stands $45$ cm in front of it. Where is the image, how tall is it, and is it real or virtual, upright or inverted?`,
    visual: mirrorPic({ f: 15, dO: 45, hO: 4, view: [-50, 6] }, 'The object at 45 cm from a concave mirror of f = 15 cm and the three principal rays (paraxial, to scale).'),
    steps: [
      { label: 'Focal length', text: t`$f = R/2 = 15$ cm, positive for a concave mirror.` },
      { label: 'Mirror equation', text: t`$\dfrac{1}{d_i} = \dfrac{1}{f} - \dfrac{1}{d_o} = \dfrac{1}{15} - \dfrac{1}{45} = \dfrac{2}{45}$, so $d_i = 22.5$ cm. Positive: a real image, in front of the mirror.` },
      { label: 'Magnification', text: t`$m = -d_i/d_o = -22.5/45 = -0.50$, so $h_i = m h_o = -2.0$ cm: half the size, upside down.` },
      { label: 'Sense check', text: t`The object is beyond C ($2f = 30$ cm), and the rays agree: the image lies between F and C, smaller and inverted.` },
    ],
    answer: t`A real, inverted image $22.5$ cm in front of the mirror, $2.0$ cm tall ($m = -0.50$).`,
  },
  practice: [
    mcq({
      id: 'plane', difficulty: 1,
      gen(r) {
        const d = r.pick([1.5, 2, 2.5, 3]);
        return {
          prompt: t`You stand ${d} m in front of a flat wall mirror. Where is your image?`,
          choices: [`${d} m behind the mirror, ${2 * d} m from you`, 'On the surface of the mirror', `${d / 2} m behind the mirror`, `${2 * d} m behind the mirror`],
          answer: 0,
          why: { 1: 'The reflected rays seem to come from a point behind the glass, not from the glass itself.', 2: 'The image is as far behind the mirror as you are in front, not half as far.', 3: `That is the distance from you to your image, not from the mirror: ${d} m + ${d} m.` },
          hints: ['Trace two rays from your nose to the mirror and back to your eye, then extend them behind the mirror.', 'The law of reflection makes the image exactly as far behind the mirror as the object is in front.'],
          teach: 'A flat mirror forms a virtual image as far behind it as the object is in front, the same size and upright.',
          explain: t`Rays from you reflect with equal angles, so their backward extensions meet ${d} m behind the glass: the image is ${2 * d} m from you. It is virtual — no light really goes there — and the same size: $m = +1$.`,
          visual: mirrorPic({ f: Infinity, dO: d * 5, hO: 4, image: false, unit: 'cm' }, 'An object in front of a flat mirror, with rays from its tip arriving at the mirror (to scale; the reflected rays are what you are working out).'),
        };
      },
    }),
    num({
      id: 'star-focus', difficulty: 1,
      gen(r) {
        const R = r.pick([40, 60, 80, 120]);
        return {
          prompt: t`A concave telescope mirror has a radius of curvature of ${R} cm. How far in front of it does it bring the light from a distant star to a focus?`,
          answer: R / 2, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: R, feedback: 'That is the centre of curvature, C. Parallel rays meet halfway there, at F.' }, { value: 2 * R, feedback: t`The focal length is *half* the radius of curvature: $f = R/2$.` }],
          hints: ['Light from a distant star arrives as parallel rays.', t`Parallel rays meet at the focal point, $f = R/2$ from the mirror.`],
          teach: 'A concave mirror focuses parallel light at f = R/2: the focal point lies halfway to the centre of curvature.',
          explain: t`$f = R/2 = ${R / 2}$ cm: the star's image forms there (in the mirror equation, $d_o \to \infty$ gives $d_i = f$).`,
          visual: mirrorPic({ f: R / 2, obj: 'star', tilt: 3, image: false, hide: ['F'], ap: R / 6 }, 'Parallel light from a distant star arriving at a concave mirror (paraxial, to scale). Where it focuses is what you are finding.'),
        };
      },
    }),
    num({
      id: 'mirror-eq', difficulty: 2,
      gen(r) {
        const [f, dO] = r.pick([[10, 25], [12, 30], [15, 20], [20, 50], [8, 12], [10, 40]]);
        const { dI } = image(f, dO);
        return {
          prompt: t`An object stands ${dO} cm in front of a concave mirror of focal length ${f} cm. Where is its image?`,
          answer: dI, units: 'cm', tol: { rel: 0.005 },
          errors: apart([{ value: 1 / (1 / f + 1 / dO), feedback: t`Subtract: $1/d_i = 1/f - 1/d_o$.` }, { value: dO - f, feedback: t`Distances do not simply subtract: use the reciprocals, $1/d_i = 1/f - 1/d_o$.` }, { value: -dI, feedback: 'Check the sign: a positive answer means a real image in front of the mirror.' }], dI),
          hints: [t`$\dfrac{1}{d_i} = \dfrac{1}{f} - \dfrac{1}{d_o}$.`, t`$\dfrac{1}{${f}} - \dfrac{1}{${dO}} = ${tn(1 / f - 1 / dO, 4)}\ \text{cm}^{-1}$; take the reciprocal.`],
          teach: t`The mirror equation $1/d_o + 1/d_i = 1/f$ locates the image; a positive $d_i$ means a real image in front of the mirror.`,
          explain: t`$\dfrac{1}{d_i} = \dfrac{1}{${f}} - \dfrac{1}{${dO}} = ${tn(1 / f - 1 / dO, 4)}\ \text{cm}^{-1}$, so $d_i = ${tn(dI)}$ cm — positive, so the image is real, in front of the mirror.`,
          visual: mirrorPic({ f, dO, hO: 3, image: false }, `The object ${dO} cm from a concave mirror with f = ${f} cm, and the principal rays arriving (to scale). Where they meet after reflecting is what you are finding.`),
        };
      },
    }),
    num({
      id: 'image-height', difficulty: 2,
      gen(r) {
        const [f, dO] = r.pick([[10, 30], [10, 15], [12, 18], [20, 30], [15, 60]]);
        const h = r.pick([2, 3, 5]);
        const { dI, m } = image(f, dO);
        return {
          prompt: t`A ${h}.0 cm tall candle stands ${dO} cm from a concave mirror with $f = ${f}$ cm. The image forms ${tn(dI)} cm in front of the mirror. How tall is the image? (Give a negative height for an inverted image.)`,
          answer: m * h, units: 'cm', tol: { rel: 0.005 },
          errors: apart([{ value: -m * h, feedback: t`Keep the minus sign in $m = -d_i/d_o$: a real image from a single mirror is inverted.` }, { value: (dO / dI) * h, feedback: t`Upside down: $m = -d_i/d_o$, image distance over object distance.` }], m * h),
          hints: [t`$m = -d_i/d_o$.`, t`Then $h_i = m\,h_o$.`],
          teach: t`The magnification $m = -d_i/d_o$ gives the image's size and, through its sign, its orientation.`,
          explain: t`$m = -${tn(dI)}/${dO} = ${tn(m)}$, so $h_i = ${tn(m)}\times${h}.0 = ${tn(m * h)}$ cm: ${Math.abs(m) > 1 ? 'larger than the candle' : 'smaller than the candle'} and upside down.`,
          visual: mirrorPic({ f, dO, hO: h, hide: ['m'] }, 'The candle, the principal rays and its image (paraxial, to scale).'),
        };
      },
    }),
    mcq({
      id: 'convex-kind', difficulty: 1,
      prompt: 'A convex mirror (curving out toward you) is used for security in shops. Wherever a customer stands in front of it, the image is:',
      choices: ['Virtual, upright and smaller', 'Real, inverted and smaller', 'Virtual, upright and larger', 'Real and upright'],
      answer: 0,
      why: {
        1: 'A convex mirror spreads light out; reflected rays never meet in front of it, so it cannot form a real image of a real object.',
        2: 'Its images are always smaller: that is why it shows a wide field of view.',
        3: 'A single mirror’s real images are always inverted — and a convex mirror makes no real images of real objects.',
      },
      hints: ['Do the reflected rays from a convex mirror converge or spread apart?', t`With $f < 0$ and $d_o > 0$, the mirror equation always gives $d_i < 0$ with $|d_i| < d_o$.`],
      teach: 'A convex mirror always forms a virtual, upright, smaller image of a real object.',
      explain: t`With $f < 0$, $1/d_i = 1/f - 1/d_o$ is always negative: the image is behind the mirror (virtual), and $m = -d_i/d_o$ lies between 0 and 1: upright and smaller. Smaller images mean a wider field of view.`,
      visual: mirrorPic({ f: -15, dO: 30, hO: 4, image: false }, 'An object in front of a convex mirror and rays arriving from its tip (to scale).'),
    }),
    num({
      id: 'security-mirror', difficulty: 3,
      gen(r) {
        const [R, dO] = r.pick([[60, 90], [80, 120], [60, 120], [40, 100]]);
        const f = -R / 2, { dI, m } = image(f, dO);
        return {
          prompt: t`A convex security mirror has a radius of curvature of ${R} cm. A shopper stands ${dO} cm in front of it. What is the magnification of the shopper's image?`,
          answer: m, tol: { rel: 0.01 },
          errors: apart([{ value: -m, feedback: t`Watch the signs: $f = -R/2$ for a convex mirror, and the image is upright, so $m > 0$.` }, { value: -image(R / 2, dO).m, feedback: t`A convex mirror has a *negative* focal length: $f = -${R / 2}$ cm.` }, { value: image(R / 2, dO).m, feedback: t`A convex mirror has a *negative* focal length: $f = -${R / 2}$ cm.` }], m),
          hints: [t`For a convex mirror $f = -R/2 = -${R / 2}$ cm.`, t`$\dfrac{1}{d_i} = \dfrac{1}{f} - \dfrac{1}{d_o} = -\dfrac{1}{${R / 2}} - \dfrac{1}{${dO}}$.`, t`Then $m = -d_i/d_o$.`],
          teach: 'For a convex mirror, use f = −R/2; the negative image distance it gives is a virtual image behind the mirror.',
          explain: t`$\dfrac{1}{d_i} = -\dfrac{1}{${R / 2}} - \dfrac{1}{${dO}}$ gives $d_i = ${tn(dI)}$ cm (virtual, behind the mirror), so $m = -(${tn(dI)})/${dO} = ${tn(m)}$: the shopper looks about ${Math.round(1 / m)} times smaller — and the whole shop fits in the mirror.`,
          visual: mirrorPic({ f, dO, hO: 4, image: false }, 'The shopper (blue arrow) in front of the convex mirror, with rays arriving (to scale).'),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student finds the image of an object 6.0 cm in front of a concave mirror with $f = 10$ cm:

$$\frac{1}{d_i} = \frac{1}{10} - \frac{1}{6.0} = -\frac{1}{15}\ \text{cm}^{-1} \;\Rightarrow\; d_i = -15\ \text{cm}$$

"So there is a real image 15 cm in front of the mirror, and $m = -d_i/d_o = +2.5$, so it is inverted." What went wrong?`,
      choices: [
        'The negative image distance means a virtual image 15 cm behind the mirror, and the positive m means it is upright',
        t`The mirror equation should have been added: $1/d_i = 1/10 + 1/6.0$`,
        'A concave mirror needs f = −10 cm',
        'The arithmetic: 1/10 − 1/6.0 is +1/15',
      ],
      answer: 0,
      why: {
        1: t`The equation is right: $1/d_i = 1/f - 1/d_o$.`,
        2: 'Concave mirrors converge light: their focal length is positive.',
        3: t`$0.100 - 0.167 = -0.067 = -1/15$: the arithmetic is right.`,
      },
      hints: ['Every number in the calculation is right. Look at how the signs are read.', 'What does a negative image distance mean? And a positive magnification?'],
      teach: t`Read the signs: a negative $d_i$ is a virtual image behind the mirror; a positive $m$ is upright.`,
      explain: t`With the object inside F, the reflected rays spread apart and only their backward extensions meet — 15 cm *behind* the mirror. That image is virtual, upright ($m = +2.5$) and enlarged: the view in a make-up mirror.`,
      visual: mirrorPic({ f: 10, dO: 6, hO: 3, image: false, view: [-24, 22] }, 'The object 6.0 cm from the concave mirror, inside its focal point (to scale).'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-concave', difficulty: 2,
      gen(r) {
        const [f, dO] = r.pick([[25, 40], [18, 30], [30, 75], [12, 16]]);
        const { dI } = image(f, dO);
        return {
          prompt: t`An object is ${dO} cm in front of a concave mirror with a radius of curvature of ${2 * f} cm. How far from the mirror is the image?`,
          answer: dI, units: 'cm', tol: { rel: 0.005 },
          errors: apart([{ value: image(2 * f, dO).dI, feedback: t`Use the focal length, $f = R/2 = ${f}$ cm, not $R$.` }], dI),
          hints: [t`$f = R/2$, then the mirror equation.`],
          teach: 'Halve the radius of curvature to get f, then apply the mirror equation.',
          explain: t`$f = ${f}$ cm; $1/d_i = 1/${f} - 1/${dO}$ gives $d_i = ${tn(dI)}$ cm, a real image in front of the mirror.`,
          visual: mirrorPic({ f, dO, hO: 4, image: false, view: [-Math.max(dO, 2 * f) * 1.15 - 4, Math.max(dO, 2 * f) * 0.18] }, 'The object in front of the concave mirror, rays arriving (to scale).'),
        };
      },
    }),
    num({
      id: 'cp-hubble', difficulty: 3, transfer: true,
      gen(r) {
        const sep = r.pick([0.5, 1.0, 2.0]);
        const f = 5.52, x = f * ((sep * Math.PI) / 648000) * 1e6;
        return {
          prompt: t`Hubble's 2.4 m primary mirror has a radius of curvature of 11.04 m. Two stars ${sep.toFixed(1)} arcseconds apart on the sky are imaged at the primary's focus. How far apart are their images there? (1 arcsecond $= 4.848\times10^{-6}$ rad; for small angles the image of a star at angle $\alpha$ lies $f\alpha$ from the axis.)`,
          answer: x, units: 'µm', tol: { rel: 0.01 },
          errors: [{ value: 2 * x, feedback: t`Use the focal length, $f = R/2 = 5.52$ m, not the radius of curvature.` }, { value: x / 1e6 * 206265, feedback: 'Convert the angle to radians first.' }],
          hints: [t`$f = R/2 = 5.52$ m.`, t`Separation $= f\alpha$ with $\alpha$ in radians: $${sep}\times4.848\times10^{-6}$ rad.`, 'Give the answer in micrometres.'],
          teach: 'A focusing mirror maps angles on the sky to distances in its focal plane: x = fα, the plate scale.',
          explain: t`$x = f\alpha = 5.52\ \text{m}\times${tn(sep * 4.848e-6)}\ \text{rad} = ${tn(x)}\ \mu\text{m}$. That is only a few detector pixels, which is why Hubble adds a secondary mirror that stretches the effective focal length to 57.6 m. (The primary alone is $f/2.3$: focal length over diameter, $5.52/2.4$.)`,
          visual: mirrorPic({ f: 5.52, obj: 'star', tilt: 4, unit: 'm', ap: 1.2, view: [-7.5, 1], image: false }, 'Starlight reaching a concave primary mirror (angles enormously exaggerated; real star separations are a millionth of this).'),
        };
      },
    }),
    mcq({
      id: 'cp-makeup', difficulty: 2,
      prompt: 'A concave make-up mirror shows you an upright, enlarged image of your face. Where must your face be?',
      choices: ['Between the focal point and the mirror', 'Beyond the centre of curvature', 'Exactly at the centre of curvature', 'Between the centre of curvature and the focal point'],
      answer: 0,
      why: {
        1: 'Beyond C the image is real, inverted and smaller.',
        2: 'At C the image is real, inverted and the same size, at C itself.',
        3: 'Between C and F the image is real, inverted and larger — but upside down.',
      },
      hints: ['Upright images from a concave mirror are virtual. When are they virtual?', t`$d_i < 0$ needs $1/f - 1/d_o < 0$, that is, $d_o < f$.`],
      teach: 'A concave mirror gives an upright, enlarged, virtual image only when the object is inside the focal length.',
      explain: t`For $d_o < f$, $1/d_i = 1/f - 1/d_o$ is negative: a virtual image behind the mirror, upright, with $m = -d_i/d_o > 1$. So make-up and shaving mirrors have long focal lengths — longer than the distance to your face.`,
      visual: mirrorPic({ f: 20, dO: 30, hO: 3, image: false, view: [-46, 8] }, 'A concave mirror with its focal point F and centre of curvature C (to scale).'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §2.1 Images Formed by Plane Mirrors', url: 'https://openstax.org/books/university-physics-volume-3/pages/2-1-images-formed-by-plane-mirrors' },
    { label: 'OpenStax University Physics Vol. 3, §2.2 Spherical Mirrors', url: 'https://openstax.org/books/university-physics-volume-3/pages/2-2-spherical-mirrors' },
    { label: 'STScI, Hubble Space Telescope Primer: the telescope (2.4 m f/2.3 primary, f/24 system)', url: 'https://hst-docs.stsci.edu/hsp' },
  ],
});
