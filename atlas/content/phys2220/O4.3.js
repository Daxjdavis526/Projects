// Resolution limits: a round aperture turns every point of light into an Airy
// pattern, so two points closer than θ = 1.22λ/D blur into one (Rayleigh's
// criterion). Hubble, JWST, the eye, an Earth-sized radio telescope (the EHT),
// a star tracker's lens — and why magnification alone never helps. Pictures
// from optics-waves (airy mode: two Airy patterns added) and a sketch here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, apart, airyPic, seg, tag, r6, RAD2AS } from './_optics.js';

const t = String.raw;

/** A telescope looking at two points a distance s apart, a distance R away (not to scale). */
function sizeGeom({ target = 'two points on the target', caption }) {
  const X = 10.5, y = 1.0;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-1.4, 13.6], y: [-2.6, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        seg([0, -0.75], [0, 0.75], { color: 'accent', width: 5 }),
        seg([0, 0], [X, y], { color: 'gold', width: 1.4, dash: true }), seg([0, 0], [X, -y], { color: 'gold', width: 1.4, dash: true }),
        { param: ['2.6*cos(t)', '2.6*sin(t)'], t: [r6(-Math.atan2(y, X)), r6(Math.atan2(y, X))], color: 'violet', width: 1.6 },
        { param: [`${X + 2.6} + 2.6*cos(t)`, '2.6*sin(t)'], t: [2.2, 4.08], color: 'ink3', width: 2 },
      ],
      arrows: [{ from: [5.2, -2.1], to: [0.1, -2.1], color: 'ink2', width: 1.3 }, { from: [5.2, -2.1], to: [X - 0.1, -2.1], color: 'ink2', width: 1.3 }],
      points: [
        { x: X, y, r: 5, color: 'gold' }, { x: X, y: -y, r: 5, color: 'gold' },
        tag(-0.2, 1.05, 'aperture D', 'accent', 'center'), tag(2.85, 0, 'θ', 'violet'), tag(5.2, -1.75, 'distance R', 'ink2', 'center'),
        tag(X + 0.35, 0, 's', 'gold'), tag(X, 1.6, target, 'gold', 'center'),
      ],
    },
    caption,
  };
}

const as = (rad) => rad * RAD2AS;
const ray = (D, lam) => (1.22 * lam) / D;

export default lesson({
  id: 'phys2220.O4.3',
  title: 'Resolution limits',
  minutes: 14, difficulty: 3,
  intro: t`A lens or mirror cannot focus a distant star to a point. The light comes through a round aperture of diameter $D$, and diffraction spreads it into an **Airy pattern**: a bright central disc circled by faint rings. The first dark ring lies at

$$\sin\theta = 1.22\,\frac{\lambda}{D}$$

— the round version of a slit's $a\sin\theta = \lambda$. Two stars closer together than that blur into one. **Rayleigh's criterion** calls two points just resolved when the centre of one's pattern falls on the first dark ring of the other, at the angle

$$\theta_\text{min} \approx 1.22\,\frac{\lambda}{D} \quad (\text{in radians})$$

Only a wider aperture or a shorter wavelength sees finer detail. Magnifying the image enlarges the blur along with everything else.`,
  symbols: [
    { tex: '\\theta_\\text{min}', text: 'the smallest angle between two points of light that can be told apart, in radians (1 rad = 206 265 arcseconds)' },
    { tex: 'D', text: 'the diameter of the aperture: a lens, a mirror, your pupil — or the distance between radio dishes working as one' },
    { tex: '\\lambda', text: 'the wavelength, in the same unit as $D$' },
    { tex: '1.22', text: 'set by the round shape: the first dark ring of a circular aperture sits at $1.22\\lambda/D$, where a slit’s first dark fringe sits at $\\lambda/a$' },
  ],
  why: t`Diffraction sets the sharpness of every eye, camera and telescope. It is why astronomers build ever larger mirrors, and how radio dishes spread across the Earth photographed the ring of light around a black hole ([the photon ring and Einstein rings](#/lesson/gr.S24.i)).`,
  visual: {
    type: 'optics-waves',
    title: 'Two stars, one aperture',
    lead: t`Left: two stars seen through the aperture (brightness as the square root of intensity, so the faint rings show). Right: a cut through both stars — dashed, each star alone; solid, what the telescope actually records.`,
    tasks: [
      'Slide the separation down until the verdict reads “just resolved”: the centre of one star’s pattern now sits on the first dark ring of the other, and the dip between the peaks is about 26%.',
      'Push the stars closer, then magnify the picture ×16: the blob grows, but it does not split. Magnification cannot beat diffraction.',
      'Switch to JWST: its mirror is 2.7 times wider than Hubble’s, but it works at 2 µm, four times Hubble’s visible wavelength, so its limit is a little coarser.',
      'Choose the EHT: radio dishes across the Earth act as one aperture 10 700 km wide. At 1.3 mm wavelength that reaches about 30 microarcseconds.',
    ],
    params: { mode: 'airy', preset: 'hubble' },
  },
  example: {
    prompt: t`The Hubble Space Telescope has a 2.4 m mirror. (a) What is its Rayleigh limit at $\lambda = 500$ nm, in radians and in arcseconds? (b) What is the smallest crater it could resolve on the Moon, $3.84\times10^8$ m away? (c) How does it compare with your eye, whose pupil is 5 mm across?`,
    visual: airyPic({ preset: 'hubble', lambda: 500e-9 }, 'Two stars 1.4 Rayleigh limits apart through Hubble’s mirror: two separate Airy patterns.'),
    steps: [
      { label: 'Rayleigh limit', text: t`$\theta_\text{min} = 1.22\dfrac{\lambda}{D} = 1.22\times\dfrac{500\times10^{-9}\ \text{m}}{2.4\ \text{m}} = 2.54\times10^{-7}$ rad. In arcseconds: $2.54\times10^{-7}\times206\,265 = 0.052''$.` },
      { label: 'On the Moon', text: t`A small angle times a distance is a length: $s = R\theta = (3.84\times10^8\ \text{m})(2.54\times10^{-7}) = 98$ m. Hubble cannot see the Apollo landers, which are under 10 m across.` },
      { label: 'The eye', text: t`$\theta_\text{min} = 1.22\times\dfrac{500\times10^{-9}}{0.005} = 1.2\times10^{-4}$ rad $= 25''$, which is $2.4/0.005 = 480$ times coarser than Hubble — the ratio of the apertures.` },
      { label: 'Sense check', text: t`In practice the eye does worse, about an arcminute ($60''$), limited by its lens and the spacing of cells in the retina. Hubble, above the atmosphere, works close to its diffraction limit.` },
    ],
    answer: t`(a) $2.54\times10^{-7}$ rad $= 0.052''$; (b) about $98$ m; (c) the eye's limit is about $25''$, 480 times coarser.`,
  },
  practice: [
    num({
      id: 'rayleigh-angle', difficulty: 1,
      gen(r) {
        const [D, what] = r.pick([[0.1, 'A 10 cm telescope'], [0.2, 'A 20 cm backyard telescope'], [1.0, 'A 1.0 m research telescope']]);
        const key = as(ray(D, 550e-9));
        return {
          prompt: t`${what} observes a double star in green light, $\lambda = 550$ nm. What is its Rayleigh limit, in arcseconds?`,
          answer: key, units: 'arcsec', tol: { rel: 0.01 },
          errors: apart([
            { value: ray(D, 550e-9), feedback: t`That is the angle in radians. Multiply by $206\,265$ arcseconds per radian.` },
            { value: as((550e-9) / D), feedback: t`For a round aperture the first dark ring sits at $1.22\lambda/D$, not $\lambda/D$.` },
          ], key),
          hints: [t`$\theta_\text{min} = 1.22\lambda/D$, in radians.`, t`1 rad $= 206\,265''$.`],
          teach: 'Rayleigh limit: θ = 1.22λ/D radians, then × 206 265 for arcseconds.',
          explain: t`$\theta_\text{min} = 1.22\times\dfrac{550\times10^{-9}}{${D}} = ${tn(ray(D, 550e-9))}$ rad $= ${tn(key)}''$.`,
          visual: airyPic({ preset: 'custom', D, lambda: 550e-9, sep: 1.6 * ray(D, 550e-9), labels: false }, 'A double star a little wider apart than this telescope’s limit, as the telescope sees it.'),
        };
      },
    }),
    mcq({
      id: 'magnify', difficulty: 1,
      prompt: 'Through a telescope, a double star looks like this: a single blob. Will a stronger eyepiece, magnifying the image four times more, split it into two stars?',
      choices: [
        'No: it magnifies the blur too; only a wider aperture or a shorter wavelength can separate them',
        'Yes: four times the magnification makes the gap between them four times wider',
        'Yes, but only if the eyepiece is very high quality',
        'No, because a stronger eyepiece collects less light',
      ],
      answer: 0,
      why: {
        1: 'The gap grows four times — and so does each star’s Airy disc. The blob just gets bigger.',
        2: 'Even a perfect eyepiece can only enlarge the image the main lens or mirror formed, and that image is already blurred together by diffraction.',
        3: 'It is true that the image gets dimmer, but that is not the reason: even with plenty of light, magnification enlarges the overlapping Airy patterns together.',
      },
      hints: ['What sets the size of each star’s blur?', 'Does magnification change the ratio of the gap to the blur?'],
      teach: 'Magnification enlarges the diffraction blur along with the detail: only D and λ set the resolution.',
      explain: t`Each star's image is an Airy pattern whose angular size is set by $1.22\lambda/D$ at the main lens or mirror. An eyepiece magnifies the gap between the stars and their blurs by the same factor, so the ratio — what decides whether you see two — stays the same. Magnifying past the point where the Airy disc is easy to see is called *empty magnification*.`,
      visual: airyPic({ preset: 'custom', D: 0.1, lambda: 550e-9, sep: 0.6 * ray(0.1, 550e-9), labels: false }, 'A double star through a 10 cm telescope: the two Airy patterns overlap into one blob.'),
    }),
    num({
      id: 'detail', difficulty: 2,
      gen(r) {
        const [tname, R, scope, D, unit, scale] = r.pick([
          ['the Moon', 3.844e8, 'a 20 cm backyard telescope', 0.2, 'km', 1e-3],
          ['Mars, at a close approach 56 million km away', 5.6e10, 'the Hubble Space Telescope (2.4 m)', 2.4, 'km', 1e-3],
          ['Jupiter, 630 million km away', 6.3e11, 'a 20 cm backyard telescope', 0.2, 'km', 1e-3],
          ['the Moon', 3.844e8, 'the Hubble Space Telescope (2.4 m)', 2.4, 'm', 1],
        ]);
        const th = ray(D, 550e-9), key = th * R * scale;
        return {
          prompt: t`What is the smallest detail ${scope} can resolve on ${tname}${tname === 'the Moon' ? ', $3.84\\times10^8$ m away' : ''}, in green light (550 nm)? Answer in ${unit === 'km' ? 'kilometres' : 'metres'}.`,
          answer: key, units: unit, tol: { rel: 0.01 },
          errors: apart([{ value: (550e-9 / D) * R * scale, feedback: t`Include the 1.22 for a round aperture: $\theta_\text{min} = 1.22\lambda/D$.` }], key),
          hints: [t`First the angle: $\theta_\text{min} = 1.22\lambda/D$.`, t`Then the size: $s = R\,\theta_\text{min}$, with $\theta$ in radians.`],
          teach: 'The smallest resolvable detail at distance R is s = R × 1.22λ/D.',
          explain: t`$\theta_\text{min} = 1.22\times\dfrac{550\times10^{-9}}{${D}} = ${tn(th)}$ rad, so $s = R\theta = ${tn(R)}\ \text{m}\times${tn(th)} = ${tn(key)}$ ${unit}.${tname.startsWith('Jupiter') ? ' The Great Red Spot, about 16 000 km across, is easy to see.' : ''}`,
          visual: sizeGeom({ caption: 'Two points a distance s apart, seen from a distance R: they subtend an angle θ = s/R (not to scale). They can be told apart if θ is at least 1.22λ/D.' }),
        };
      },
    }),
    num({
      id: 'headlights', difficulty: 2,
      gen(r) {
        const [sep, pupil] = r.pick([[1.4, 5], [1.5, 4], [1.2, 6]]);
        const th = ray(pupil * 1e-3, 550e-9), key = sep / th / 1000;
        return {
          prompt: t`A car's headlights are ${sep} m apart. At night your pupil opens to ${pupil} mm. Considering diffraction alone, from how far away could your eye just tell the two headlights apart, in green light (550 nm)? Answer in km.`,
          answer: key, units: 'km', tol: { rel: 0.01 },
          errors: apart([{ value: key * 1000, feedback: 'Check the units: the question asks for kilometres.' }, { value: sep / (550e-9 / (pupil * 1e-3)) / 1000, feedback: t`Include the 1.22 for a round pupil: $\theta_\text{min} = 1.22\lambda/D$.` }], key),
          hints: [t`$\theta_\text{min} = 1.22\lambda/D$ with $D = ${pupil}$ mm.`, t`The headlights subtend $\theta = s/R$; set $s/R = \theta_\text{min}$ and solve for $R$.`],
          teach: 'Two sources a distance s apart are resolvable out to R = s/(1.22λ/D).',
          explain: t`$\theta_\text{min} = 1.22\times\dfrac{550\times10^{-9}}{${pupil}\times10^{-3}} = ${tn(th)}$ rad, so $R = \dfrac{s}{\theta_\text{min}} = \dfrac{${sep}}{${tn(th)}} = ${tn(key * 1000)}$ m $= ${tn(key)}$ km. A real eye falls short of this: its optics and retina limit it to about one arcminute, which gives ${tn(sep / (Math.PI / 180 / 60) / 1000)} km.`,
          visual: airyPic({ preset: 'eye', D: pupil * 1e-3, lambda: 550e-9, sep: th, labels: false }, 'Two headlights at the eye’s diffraction limit, as a perfect eye would see them: the centre of each pattern falls on the first dark ring of the other.'),
        };
      },
    }),
    num({
      id: 'jwst-ratio', difficulty: 2,
      prompt: t`JWST's mirror is 6.5 m across and it observes in the infrared, at wavelengths around $2.0\ \mu$m; Hubble's mirror is 2.4 m across and works in visible light around 500 nm. What is the ratio of JWST's Rayleigh limit to Hubble's, $\theta_\text{JWST}/\theta_\text{Hubble}$?`,
      answer: (2.0e-6 / 6.5) / (500e-9 / 2.4), tol: { rel: 0.01 },
      errors: [
        { value: 6.5 / 2.4, feedback: 'That is the ratio of the mirrors alone. The wavelength matters just as much: θ is proportional to λ/D.' },
        { value: (500e-9 / 2.4) / (2.0e-6 / 6.5), feedback: 'Upside down: that is Hubble’s limit divided by JWST’s.' },
      ],
      hints: [t`$\theta \propto \lambda/D$, so the 1.22 cancels in the ratio.`, t`$\dfrac{\theta_\text{JWST}}{\theta_\text{Hubble}} = \dfrac{\lambda_\text{J}/D_\text{J}}{\lambda_\text{H}/D_\text{H}}$.`],
      teach: 'Resolution goes as λ/D: a bigger mirror at a longer wavelength can be coarser.',
      explain: t`$\dfrac{2.0/6.5}{0.50/2.4} = \dfrac{0.308}{0.208} = ${tn((2.0e-6 / 6.5) / (500e-9 / 2.4))}$: JWST's images are about 1.5 times coarser than Hubble's, despite a mirror 2.7 times wider — because it sees at four times the wavelength. It needs the big mirror just to keep its infrared images sharp (and to collect faint light).`,
      visual: airyPic({ preset: 'jwst' }, 'Two stars 1.4 Rayleigh limits apart through JWST at 2 µm (false colour: infrared).'),
    }),
    num({
      id: 'aperture-needed', difficulty: 2,
      gen(r) {
        const sepAs = r.pick([0.1, 0.25, 0.5]), key = (1.22 * 550e-9) / (sepAs / RAD2AS);
        return {
          prompt: t`A double star's two stars are ${sepAs}″ apart. What is the smallest telescope mirror, in metres, that can resolve them in green light (550 nm)?`,
          answer: key, units: 'm', tol: { rel: 0.01 },
          errors: apart([{ value: (1.22 * 550e-9) / sepAs, feedback: 'Convert the angle to radians first: divide the arcseconds by 206 265.' }, { value: 550e-9 / (sepAs / RAD2AS), feedback: t`Include the 1.22 for a round mirror: $D = 1.22\lambda/\theta$.` }], key),
          hints: [t`$${sepAs}'' = ${sepAs}/206\,265$ rad.`, t`$D = 1.22\lambda/\theta$.`],
          teach: 'To resolve an angle θ, a telescope needs D ≥ 1.22λ/θ.',
          explain: t`$\theta = ${sepAs}/206\,265 = ${tn(sepAs / RAD2AS)}$ rad, so $D = \dfrac{1.22\lambda}{\theta} = \dfrac{1.22(550\times10^{-9})}{${tn(sepAs / RAD2AS)}} = ${tn(key)}$ m. (From the ground, the turbulent atmosphere blurs stars to about $1''$ anyway, unless the telescope uses adaptive optics.)`,
          visual: airyPic({ preset: 'custom', D: key, lambda: 550e-9, sep: sepAs / RAD2AS, labels: false }, 'The double star through a telescope just big enough: the dip between the peaks is 26%.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-eht', difficulty: 2, transfer: true,
      prompt: t`The Event Horizon Telescope combines radio dishes across the Earth into one telescope whose aperture is, in effect, the longest distance between them: about 10 700 km. It observes at $\lambda = 1.3$ mm. What is its Rayleigh limit, in microarcseconds? (The ring of light around the black hole M87* is 42 microarcseconds across.)`,
      answer: as(ray(1.07e7, 1.3e-3)) * 1e6, units: 'uas', tol: { rel: 0.01 },
      errors: [
        { value: ray(1.07e7, 1.3e-3) * 1e6, feedback: t`That is in microradians. Convert to arcseconds first: multiply the radians by $206\,265$, then by $10^6$ for microarcseconds.` },
        { value: as(1.3e-3 / 1.07e7) * 1e6, feedback: t`Include the 1.22: $\theta_\text{min} = 1.22\lambda/D$.` },
      ],
      hints: [t`$\theta_\text{min} = 1.22\lambda/D$ with $D = 1.07\times10^7$ m.`, t`Multiply radians by $206\,265\times10^6$ for microarcseconds.`],
      teach: 'Linking dishes across the Earth makes an aperture thousands of kilometres wide: resolution ~ λ/(baseline).',
      explain: t`$\theta_\text{min} = 1.22\times\dfrac{1.3\times10^{-3}}{1.07\times10^7} = ${tn(ray(1.07e7, 1.3e-3))}$ rad $= ${tn(as(ray(1.07e7, 1.3e-3)) * 1e6)}$ microarcseconds — only just finer than M87*'s 42-microarcsecond ring, which is why the 2019 image looks like a blurry doughnut. A few dishes do not fill an Earth-sized mirror, so the image is pieced together from many pairs of dishes as the Earth turns.`,
      visual: airyPic({ preset: 'eht' }, 'Two points of radio light 1.4 Rayleigh limits apart, as an Earth-sized dish would see them at 1.3 mm (false colour).'),
    }),
    num({
      id: 'cp-tracker', difficulty: 3, transfer: true,
      prompt: t`A spacecraft's star tracker photographs stars through a lens 25 mm across with a focal length of 50 mm, onto a sensor with pixels $5.5\ \mu$m wide. At $\lambda = 600$ nm, how many pixels wide is a star's Airy disc — the diameter of its first dark ring — on the sensor?`,
      answer: (2 * ray(0.025, 600e-9) * 0.05) / 5.5e-6, tol: { rel: 0.01 },
      errors: [
        { value: (ray(0.025, 600e-9) * 0.05) / 5.5e-6, feedback: 'That is the radius, from the centre to the first dark ring. The diameter is twice that.' },
        { value: (2 * ray(0.025, 600e-9) * 0.025) / 5.5e-6, feedback: 'An angle becomes a distance on the sensor through the focal length (50 mm), not the aperture.' },
      ],
      hints: [t`Angular radius of the first dark ring: $1.22\lambda/D$.`, t`On the sensor, an angle $\theta$ lands a distance $f\theta$ from the centre.`, t`Diameter $= 2f\theta$; divide by the pixel width.`],
      teach: 'An Airy disc’s size on a sensor is 2 × 1.22λf/D: set by the focal ratio f/D, not the lens size alone.',
      explain: t`$\theta = 1.22\times\dfrac{600\times10^{-9}}{0.025} = ${tn(ray(0.025, 600e-9))}$ rad; on the sensor the ring's radius is $f\theta = ${tn(ray(0.025, 600e-9) * 0.05 * 1e6)}\ \mu$m, so its diameter is ${tn(2 * ray(0.025, 600e-9) * 0.05 * 1e6)} µm $= ${tn((2 * ray(0.025, 600e-9) * 0.05) / 5.5e-6)}$ pixels. A star that small lands on a single pixel, and its position could only be read to about a pixel. Star trackers therefore defocus slightly, spreading each star over a few pixels so its centre can be found to a small fraction of a pixel.`,
      visual: airyPic({ preset: 'custom', D: 0.025, lambda: 600e-9, single: true }, 'One star through the tracker’s 25 mm lens: its Airy disc and first rings, in angle on the sky.'),
    }),
    mcq({
      id: 'cp-radio', difficulty: 2, transfer: true,
      prompt: 'A 100 m radio dish observes the 21 cm radio line of hydrogen gas; a 10 cm amateur telescope observes in green light (550 nm). Which sees finer detail?',
      choices: [
        'The 10 cm telescope, about 400 times finer: what matters is λ/D',
        'The 100 m dish, about 1000 times finer, since its aperture is 1000 times wider',
        'Neither: a radio dish and a lens obey different rules of diffraction',
        'The 100 m dish, because radio waves pass through dust that blocks light',
      ],
      answer: 0,
      why: {
        1: 'The dish is 1000 times wider, but 21 cm is 380 000 times longer than 550 nm: its λ/D is 380 times larger, so it is coarser.',
        2: 'Both are limited by the same diffraction: θ ≈ 1.22λ/D for any round aperture, lens, mirror or dish.',
        3: 'Radio waves do pass through dust, which is a real advantage — but that is about what you can see, not how finely.',
      },
      hints: ['Compute λ/D for each.', 'Compare 0.21/100 with 550×10⁻⁹/0.1.'],
      teach: 'Resolution depends on λ/D, not on D alone: radio telescopes must be enormous — or linked across continents — to see sharply.',
      explain: t`Radio: $1.22\times0.21/100 = 2.6\times10^{-3}$ rad, about $9'$ (a third of the Moon's width). Optical: $1.22\times550\times10^{-9}/0.1 = 6.7\times10^{-6}$ rad, $1.4''$. The small telescope is ${tn((0.21 / 100) / (550e-9 / 0.1))} times sharper. That is why radio astronomers link dishes across continents and even the whole Earth.`,
      visual: airyPic({ preset: 'custom', D: 100, lambda: 0.21, sep: 1.4 * ray(100, 0.21) }, 'Two radio sources 1.4 Rayleigh limits apart through a 100 m dish at 21 cm (false colour): resolved only when they are many arcminutes apart.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §4.6 Limits of Resolution: The Rayleigh Criterion', url: 'https://openstax.org/books/university-physics-volume-3/pages/4-6-limits-of-resolution-the-rayleigh-criterion' },
    { label: 'Event Horizon Telescope Collaboration, “First M87 Event Horizon Telescope Results. I”, ApJL 875, L1 (2019)', url: 'https://iopscience.iop.org/article/10.3847/2041-8213/ab0ec7' },
    { label: 'NASA: Webb vs Hubble telescope (mirror sizes and wavelengths)', url: 'https://science.nasa.gov/mission/webb/webb-vs-hubble-telescope/' },
    { label: 'Liebe, “Star trackers for attitude determination”, IEEE AES Magazine 10(6), 10 (1995)', url: 'https://doi.org/10.1109/62.387971' },
  ],
});
