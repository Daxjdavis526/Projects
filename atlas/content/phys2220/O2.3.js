// Optical instruments: the eye and its near point, angular size and angular
// magnification, the simple magnifier (M = 25 cm/f), the compound microscope
// (M = (L/f_o)(25 cm/f_e)) and the refracting telescope (M = −f_o/f_e), with
// corrective lenses. Pictures from optics-rays (system and lens modes).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, apart, lensPic, systemPic, label, seg, RAD2AS } from './_optics.js';

const t = String.raw;

/** An object seen by the eye: the angle it fills (schematic). */
function angularPic(caption) {
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-1, 11], y: [-1.2, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [seg([0, 0], [9.6, 0], { color: 'ink3', width: 1 }), seg([0, 0], [9, 1.6], { color: 'gold', width: 1.6, dash: true }), seg([0, 0], [4.5, 1.6], { color: 'accent', width: 1.6, dash: true }),
        { param: ['1.9*cos(t)', '1.9*sin(t)'], t: [0, 0.1758], color: 'gold', width: 1.4 }, { param: ['1.2*cos(t)', '1.2*sin(t)'], t: [0, 0.3419], color: 'accent', width: 1.4 }],
      arrows: [{ from: [9, 0], to: [9, 1.6], color: 'gold' }, { from: [4.5, 0], to: [4.5, 1.6], color: 'accent' }],
      points: [{ x: 0, y: 0, color: 'good', r: 6, label: 'eye', labelDx: -12, labelDy: 16 }, label(6.1, 2.1, 'farther: smaller angle', 'gold'), label(2.2, 2.1, 'closer: larger angle', 'accent')],
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.O2.3',
  title: 'Optical instruments',
  minutes: 14, difficulty: 3,
  intro: t`How big something looks is set by the **angle** it fills at your eye, not by its size. Your eye can bring things only so close — to its **near point**, about 25 cm for a young adult — so instruments enlarge angles instead. Their **angular magnification** compares the angle seen through the instrument with the angle seen by eye. A refracting telescope pairs a long-focus objective lens with a short-focus eyepiece:

$$M = \frac{\theta'}{\theta} = -\frac{f_o}{f_e}$$

A magnifying glass gives $M = 25\ \text{cm}/f$; a microscope multiplies the enlargement of its objective by that of its eyepiece.`,
  symbols: [
    { tex: 'M', text: 'the angular magnification: how many times larger the angle is through the instrument. Negative means the view is upside down' },
    { tex: '\\theta', text: 'the angle the object fills seen by eye (for a distant object), or at the near point (for a small near one), in rad or degrees' },
    { tex: "\\theta'", text: 'the angle the image fills as seen through the instrument' },
    { tex: 'f_o', text: 'the focal length of the **objective**, the lens facing the object' },
    { tex: 'f_e', text: 'the focal length of the **eyepiece**, the lens you look through' },
    { tex: '25\\ \\text{cm}', text: 'the standard near point: the closest the average eye focuses comfortably' },
  ],
  why: t`Galileo saw Jupiter's moons through exactly this arrangement in 1610. But magnification is not the whole story: how much *detail* an instrument shows is limited by the diameter of its objective, as [resolution limits](#/lesson/phys2220.O4.3) explains.`,
  visual: {
    type: 'optics-rays',
    title: 'A refracting telescope',
    lead: t`Parallel light from a star, at a small angle to the axis, enters the objective. It focuses to an image of the star (green), then leaves the eyepiece as parallel light again — at a larger angle. That larger angle is the magnification.`,
    tasks: [
      t`Lengthen the objective's focal length: the image of the star moves out, and the light leaves the eyepiece more steeply. $M = f_o/f_e$ grows.`,
      'Shorten the eyepiece’s focal length: more magnification again, and a shorter tube.',
      'Raise the star’s angle: the angle at the eye grows in proportion. (Real stars are far closer together; the angle is exaggerated to be seen.)',
    ],
    params: { mode: 'system', kind: 'telescope', f1: 36, f2: 9, tilt: 4 },
  },
  example: {
    prompt: t`A refracting telescope has an objective of focal length $100$ cm and an eyepiece of $2.5$ cm, set up so that the image is at infinity (lenses $f_o + f_e$ apart). What is its angular magnification, how long is it, and how large does the Moon (0.52° across) look through it?`,
    visual: systemPic({ f1: 40, f2: 4, tilt: 1.5 }, t`A refracting telescope, its two lenses $f_o + f_e$ apart (drawn shorter than the one in the example; angles exaggerated).`),
    steps: [
      { label: 'Magnification', text: t`$M = -f_o/f_e = -100/2.5 = -40$: angles become 40 times larger, and the view is upside down.` },
      { label: 'Length', text: t`The objective's image of a distant object lies at its focal point, which must also be the eyepiece's focal point: $f_o + f_e = 102.5$ cm.` },
      { label: 'The Moon', text: t`$\theta' \approx |M|\theta = 40\times0.52° \approx 21°$ — like a dinner plate held at arm's length. ($\theta' = M\theta$ is a small-angle rule; at 20° it runs about 4% high, and an ideal telescope gives $\tan\theta' = 40\tan\theta$, or 20°.)` },
      { label: 'Sense check', text: t`A long objective and a short eyepiece give a high magnification. The inverted view does not matter to astronomers; terrestrial telescopes add a prism or lens to turn it upright.` },
    ],
    answer: t`$M = -40$; the tube is $102.5$ cm long; the Moon appears about $21°$ across.`,
  },
  practice: [
    num({
      id: 'tele-M', difficulty: 1,
      gen(r) {
        const fo = r.pick([36, 40, 45, 50, 60]), fe = r.pick([3, 4, 5, 6, 10]);
        return {
          prompt: t`A small refracting telescope has an objective with $f_o = ${fo}$ cm and an eyepiece with $f_e = ${fe}$ cm. What is the size of its angular magnification?`,
          answer: fo / fe, tol: { rel: 0.005 },
          errors: [{ value: fe / fo, feedback: t`Upside down: the long objective divided by the short eyepiece, $f_o/f_e$.` }, { value: fo + fe, feedback: t`That is the tube length, $f_o + f_e$, in centimetres — not the magnification.` }],
          hints: [t`$|M| = f_o/f_e$.`],
          teach: 'A refracting telescope magnifies angles by the ratio of its focal lengths, objective over eyepiece.',
          explain: t`$|M| = ${fo}/${fe} = ${tn(fo / fe)}$: a star field ${tn(fo / fe)} times wider, inverted.`,
          visual: systemPic({ f1: fo, f2: fe, tilt: 3, hide: ['M'], labels: false }, 'The telescope’s two lenses and light from a star (angles exaggerated).'),
        };
      },
    }),
    num({
      id: 'magnifier', difficulty: 1,
      gen(r) {
        const f = r.pick([2.5, 5, 8, 10]);
        return {
          prompt: t`A magnifying glass has a focal length of ${f} cm. Held so that the image is at infinity (the object at its focal point), what is its angular magnification, using the 25 cm near point?`,
          answer: 25 / f, tol: { rel: 0.005 },
          errors: [{ value: f / 25, feedback: t`Upside down: $M = 25\ \text{cm}/f$.` }, { value: 25 / f + 1, feedback: t`$25/f + 1$ applies with the image at the near point; with the image at infinity it is $25/f$.` }],
          hints: ['Compare the angle through the lens, h/f, with the angle at the near point, h/(25 cm).', t`$M = (h/f)/(h/25\ \text{cm}) = 25\ \text{cm}/f$.`],
          teach: 'A simple magnifier lets you hold an object at f instead of 25 cm, magnifying angles by 25 cm/f.',
          explain: t`$M = 25/${f} = ${tn(25 / f)}$. Without the lens the best you can do is hold the object at 25 cm; with it, at ${f} cm, and the angle grows in proportion.`,
          visual: lensPic({ f: 10, dO: 8, hO: 2, view: [-45, 14], hide: ['m', 'di'] }, 'An object just inside the focal point of a magnifying lens: its virtual image is upright and enlarged (ideal thin lens, to scale for f = 10 cm).'),
        };
      },
    }),
    num({
      id: 'moon-through', difficulty: 2,
      gen(r) {
        const [what, ang, M] = r.pick([['the Moon (0.52° across)', 0.52, 10], ['the Moon (0.52° across)', 0.52, 15], ['the Andromeda galaxy’s bright core (about 0.25° across)', 0.25, 30], ['Jupiter (about 45 arcseconds across)', 45 / 3600, 120]]);
        const key = ang * M;
        return {
          prompt: t`Through ${M <= 15 ? `${M}× binoculars` : `a ${M}× telescope`}, how large an angle does ${what} fill? Give it in degrees.`,
          answer: key, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: ang / M, feedback: 'The telescope makes angles larger: multiply.' }],
          hints: [t`$\theta' = |M|\,\theta$.`],
          teach: 'A telescope multiplies every angle in the scene by its magnification.',
          explain: t`$\theta' = ${M}\times${tn(ang)}° = ${tn(key)}°$${key < 1 ? ` — still small: ${tn(key * 60)} arcminutes` : ''}.`,
          visual: angularPic('How large something looks depends on the angle it fills at the eye (schematic).'),
        };
      },
    }),
    num({
      id: 'microscope', difficulty: 2,
      gen(r) {
        const [fo, fe, L] = r.pick([[4, 25, 160], [2, 25, 160], [16, 10, 160], [8, 20, 160]]);
        const M = (L / fo) * (250 / fe);
        return {
          prompt: t`A microscope has an objective with $f_o = ${fo}$ mm and an eyepiece with $f_e = ${fe}$ mm; its tube length (the distance between the objective's image and the objective's focal point) is $L = ${L}$ mm. Use $|M| = \dfrac{L}{f_o}\cdot\dfrac{250\ \text{mm}}{f_e}$ to find the size of its overall magnification.`,
          answer: M, tol: { rel: 0.005 },
          errors: [{ value: L / fo, feedback: t`That is only the objective's lateral magnification. Multiply by the eyepiece's $250\ \text{mm}/f_e$.` }, { value: (L / fo) + (250 / fe), feedback: 'The two enlargements multiply: the eyepiece magnifies an image the objective has already enlarged.' }],
          hints: [t`Objective: $L/f_o = ${L}/${fo} = ${tn(L / fo)}$. Eyepiece: $250/f_e = 250/${fe} = ${tn(250 / fe)}$.`, 'Multiply them.'],
          teach: 'A compound microscope multiplies the objective’s enlargement by the eyepiece’s.',
          explain: t`$|M| = ${tn(L / fo)}\times${tn(250 / fe)} = ${tn(M)}$. The objective makes a real, enlarged image inside the tube; the eyepiece views that image as a magnifier does.`,
          visual: systemPic({ kind: 'microscope', labels: false }, 'A compound microscope: the objective makes a real, enlarged image (green) inside the tube, which the eyepiece magnifies (schematic, not to the scale of the question).'),
        };
      },
    }),
    num({
      id: 'myopia', difficulty: 2,
      gen(r) {
        const far = r.pick([0.5, 0.8, 1.0, 2.0, 2.5]);
        return {
          prompt: t`A short-sighted person cannot see clearly beyond ${far} m (their far point). What power of contact lens lets them see distant objects clearly? (Power $= 1/f$ in dioptres, $f$ in metres.)`,
          answer: -1 / far, units: 'm^-1', tol: { rel: 0.005 },
          errors: apart([{ value: 1 / far, feedback: 'The lens must spread light out, as if it came from the far point: a diverging lens, negative power.' }, { value: -far, feedback: 'Power is the reciprocal of the focal length: P = 1/f.' }], -1 / far),
          hints: [t`The lens must take parallel light from a distant object and make it seem to come from ${far} m away: a virtual image at $d_i = -${far}$ m of an object at infinity.`, t`That makes $f = -${far}$ m; $P = 1/f$.`],
          teach: 'A diverging lens corrects short sight by making distant objects appear to lie at the eye’s far point.',
          explain: t`With $d_o \to \infty$, the lens equation gives $d_i = f$, so $f = -${far}$ m and $P = ${tn(-1 / far)}$ D. A contact lens sits on the eye, so its focal length equals the needed distance; spectacles 1–2 cm in front need a slightly weaker lens.`,
          visual: lensPic({ f: -Math.min(20, 10 * far), obj: 'star', tilt: 0, hide: ['image'] }, 'A diverging lens takes parallel light from a distant object and spreads it as if from a point in front of the lens (not to scale).'),
        };
      },
    }),
    mcq({
      id: 'more-M', difficulty: 2,
      prompt: 'Which change gives a refracting telescope a higher magnification?',
      choices: ['An eyepiece of shorter focal length', 'An objective of larger diameter', 'An eyepiece of longer focal length', 'An objective of shorter focal length'],
      answer: 0,
      why: {
        1: 'A wider objective collects more light and resolves finer detail, but the magnification depends only on the focal lengths.',
        2: t`A longer eyepiece focal length lowers $f_o/f_e$.`,
        3: t`A shorter objective focal length lowers $f_o/f_e$.`,
      },
      hints: [t`$|M| = f_o/f_e$.`],
      teach: t`Magnification is $f_o/f_e$: a long objective and a short eyepiece; the aperture affects brightness and detail, not magnification.`,
      explain: t`$|M| = f_o/f_e$ grows when $f_e$ shrinks. Swapping eyepieces is how one telescope gives several magnifications. The diameter matters for something else: how faint and how fine the things it shows can be.`,
      visual: systemPic({ f1: 36, f2: 9, tilt: 3, hide: ['M'], labels: false }, 'A refracting telescope and light from a star (angles exaggerated).'),
    }),
    mcq({
      id: 'empty-M', difficulty: 3,
      prompt: t`A beginner swaps the 25 mm eyepiece of a small telescope (70 mm aperture, $f_o = 700$ mm) for a 4 mm one, raising the magnification from 28× to 175×. Jupiter now looks bigger. Will it show more detail?`,
      choices: [
        'Hardly: the image is enlarged, blur and all; the finest detail is set by the 70 mm aperture (and the air), not by the eyepiece',
        'Yes: six times the magnification shows six times the detail',
        'Yes, as long as the eyepiece is of good quality',
        'No: higher magnification always destroys detail',
      ],
      answer: 0,
      why: {
        1: 'Magnification enlarges what the objective has already made, including its diffraction blur; it cannot add detail the objective never captured.',
        2: 'Even a perfect eyepiece only magnifies the objective’s image — whose sharpness is limited by the aperture.',
        3: 'Some magnification is needed to see the detail that is there (the eye has its own limit), so a moderate increase can help; it is beyond that point that magnification becomes "empty".',
      },
      hints: ['Where is the finest detail in the image decided: at the objective or at the eyepiece?', 'Look ahead to resolution: diffraction blurs every point of light into a spot whose size depends on the aperture.'],
      teach: 'Magnifying an image enlarges its blur too: beyond a point, more magnification shows no more detail ("empty magnification").',
      explain: t`The objective sets the sharpness: diffraction spreads each point of light into a spot about $1.22\lambda/D$ wide — about $2''$ for 70 mm — and the air often blurs more. 175× enlarges that blur along with Jupiter. A rule of thumb puts the useful limit near 2× per millimetre of aperture (about 140× here). More detail needs a larger aperture.`,
      visual: systemPic({ f1: 45, f2: 4, tilt: 2, hide: ['M'], labels: false }, 'A small telescope with a short eyepiece (angles exaggerated).'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-design', difficulty: 2,
      gen(r) {
        const fo = r.pick([80, 100, 120]), M = r.pick([20, 40, 50]);
        const fe = fo / M;
        return {
          prompt: t`You are building a ${M}× refracting telescope around an objective of focal length ${fo} cm. How long must the tube be (the distance between the lenses), with the image at infinity?`,
          answer: fo + fe, units: 'cm', tol: { rel: 0.002 },
          errors: apart([{ value: fo, feedback: t`Add the eyepiece's focal length: the lenses are $f_o + f_e$ apart.` }, { value: fo + M, feedback: t`Find the eyepiece first: $f_e = f_o/M$, not $M$ itself.` }], fo + fe),
          hints: [t`$f_e = f_o/|M|$.`, t`Tube length $= f_o + f_e$.`],
          teach: 'A telescope focused at infinity has its lenses separated by the sum of their focal lengths.',
          explain: t`$f_e = ${fo}/${M} = ${tn(fe)}$ cm, so the tube is $${fo} + ${tn(fe)} = ${tn(fo + fe, 4)}$ cm.`,
          visual: systemPic({ f1: 45, f2: 4.5, tilt: 2, hide: ['M'], labels: false }, 'A refracting telescope focused at infinity (not to the scale of the question).'),
        };
      },
    }),
    num({
      id: 'cp-galileo', difficulty: 3, transfer: true,
      prompt: t`Galileo's telescopes (1609–10), with which he found Jupiter's moons, used a converging objective and a **diverging** eyepiece. Such a telescope with $f_o = 98$ cm and $f_e = -4.9$ cm has its lenses $f_o + f_e$ apart. What is its angular magnification $M = -f_o/f_e$, sign included?`,
      answer: 20, tol: { rel: 0.005 },
      errors: [{ value: -20, feedback: t`With $f_e$ negative, $M = -f_o/f_e$ is *positive*: the view is upright.` }, { value: 98 - 4.9, feedback: 'That is the tube length, not the magnification.' }],
      hints: [t`Put the signs in: $M = -\dfrac{98}{-4.9}$.`, 'A positive M means an upright view.'],
      teach: t`A Galilean telescope's diverging eyepiece gives an upright view, $M = -f_o/f_e > 0$, in a shorter tube.`,
      explain: t`$M = -98/(-4.9) = +20$: twenty times, upright, in a tube only $98 - 4.9 = 93$ cm long. The diverging eyepiece intercepts the light before it focuses, so no real image forms inside. Opera glasses still use this design; astronomers switched to Kepler's two converging lenses, which give a wider field of view.`,
      visual: systemPic({ f1: 45, f2: -4.5, tilt: 2, hide: ['M'], labels: false }, 'A Galilean telescope: a converging objective and a diverging eyepiece (angles exaggerated).'),
    }),
    num({
      id: 'cp-iss', difficulty: 2, transfer: true,
      gen(r) {
        const M = r.pick([30, 50, 80]), d = r.pick([420, 600, 800]);
        const th = (109 / (d * 1e3)) * M * (180 / Math.PI);
        return {
          prompt: t`The International Space Station is about 109 m across. Passing ${d} km from an observer, it is followed with a ${M}× telescope. What angle, in degrees, does it fill in the eyepiece? (Small angles: $\theta \approx \text{size}/\text{distance}$ in radians.)`,
          answer: th, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: th / M, feedback: 'That is its size by eye; multiply by the magnification.' }, { value: (109 / (d * 1e3)) * M, feedback: 'That is in radians: convert to degrees.' }],
          hints: [t`By eye: $\theta = 109/(${d}\times10^{3})$ rad $= ${tn(109 / (d * 1e3))}$ rad.`, t`Multiply by ${M}, then by $180/\pi$.`],
          teach: 'Angular size is size over distance; a telescope multiplies it by its magnification.',
          explain: t`$\theta = ${tn(109 / (d * 1e3))}$ rad by eye — about $${tn((109 / (d * 1e3)) * RAD2AS)}''$, too small to see its shape — and $${M}\times$ that is $${tn(th)}°$ through the telescope${th > 0.52 ? ', larger than the full Moon looks by eye' : ''}. Tracking it is the hard part: it crosses the sky in a few minutes.`,
          visual: angularPic('The station fills a tiny angle at the eye; the telescope multiplies that angle (schematic).'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §2.5 The Eye; §2.7 Microscopes and Telescopes', url: 'https://openstax.org/books/university-physics-volume-3/pages/2-7-microscopes-and-telescopes' },
    { label: 'NASA: International Space Station facts and figures (length 109 m)', url: 'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/' },
  ],
});
