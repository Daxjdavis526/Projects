// Lenses as Fourier transformers (Hecht §11.3; enrichment). A lens of focal
// length f puts, in its back focal plane, the Fourier transform of the field
// in its front focal plane: position x_f there is spatial frequency
// ν = x_f/(λf). A grating of period Λ makes spots λf/Λ apart. The 4f system
// (transform, mask, transform back) filters an image by its spatial
// frequencies: an iris of radius R passes ν ≤ R/(λf); a pinhole cleans a
// laser beam; blocking the centre spot leaves edges (dark field) and, for a
// cosine grating, fringes at twice the frequency. Abbe: a lens images a
// grating only if it catches the ±1 orders, Λ_min = λ/NA in coherent axial
// light (λ/2NA with oblique light); incoherent imaging cuts off at 2NA/λ, a
// telescope's at D/λ cycles per radian. Explore: a square-wave grating rebuilt
// from the orders an iris lets through (graph series sums). Transfers: a
// laser-comm terminal's spatial filter, JWST's finest angular period.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { sf } from './_op.js';
import { seg, word, pic } from './_op3.js';

const t = String.raw;
const ARCSEC = Math.PI / 648000;

// the worked example: a 4f system, 20 lines/mm grating, 633 nm, f = 200 mm
const EX = { lpmm: 20, lam: 633e-9, f: 0.2 };
EX.Lam = 1e-3 / EX.lpmm;
EX.dx = (EX.lam * EX.f) / EX.Lam;

/** The Fourier plane of a square-wave grating of duty r: spots at m (in units of λf/Λ), heights |c_m|², an iris of radius R (same units). */
function spectrumPic(r, R, caption, mmax = 5, extra = {}, block = false) {
  const arrows = [];
  for (let m = -mmax; m <= mmax; m++) {
    const c = m === 0 ? r : Math.sin(Math.PI * m * r) / (Math.PI * m);
    const h = c * c / (r * r);
    if (h > 1e-4) arrows.push({ from: [m, 0], to: [m, sf(Math.max(0.02, h), 3)], color: block && m === 0 ? 'bad' : R === null || Math.abs(m) <= R ? 'gold' : 'ink3', width: 2.4 });
  }
  return {
    type: 'graph', caption,
    params: { x: [-mmax - 0.6, mmax + 0.6], y: [0, 1.25], aspect: 'wide', xlabel: 'position in the Fourier plane (units of λf/Λ)', ylabel: 'spot power', xticks: 2 * mmax + 1, yticks: 0,
      arrows, ...(R !== null ? { vlines: [{ x: R, color: 'accent' }, { x: -R, color: 'accent' }] } : {}), ...extra },
  };
}

/** A 4f system: object, lens, Fourier plane (mask), lens, image. */
const fourF = (caption, mask = 'iris') => ({
  type: 'graph', caption,
  params: pic([-0.4, 8.4], [-1.9, 2.1], {
    curves: [
      seg([0, -1.2], [0, 1.2], 'ink2', { width: 4, dash: [3, 3] }),
      { param: ['2 + 0.18*cos(t)', '1.4*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 },
      { param: ['6 + 0.18*cos(t)', '1.4*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 },
      ...(mask === 'iris' ? [seg([4, 1.5], [4, 0.45], 'ink', { width: 5 }), seg([4, -0.45], [4, -1.5], 'ink', { width: 5 })] : [seg([4, -0.15], [4, 0.15], 'ink', { width: 6 })]),
      seg([8, -1.2], [8, 1.2], 'ink2', { width: 4, dash: [3, 3] }),
      seg([0, 0.9], [2, 0.9], 'gold', { width: 1.4 }), seg([2, 0.9], [4, 0], 'gold', { width: 1.4 }), seg([0, -0.9], [2, -0.9], 'gold', { width: 1.4 }), seg([2, -0.9], [4, 0], 'gold', { width: 1.4 }),
      seg([0, 0.6], [2, 1.2], 'violet', { width: 1.4 }), seg([2, 1.2], [4, 1.2], 'violet', { width: 1.4, dash: [4, 4] }),
      seg([0, -1.6], [8, -1.6], 'ink3', { width: 1 }),
    ],
    points: [word(0, 1.6, 'object', 'ink2'), word(2, 1.75, 'lens f', 'accent'), word(4, 1.8, mask === 'iris' ? 'iris (Fourier plane)' : 'stop (Fourier plane)', 'ink'), word(6, 1.75, 'lens f', 'accent'), word(8, 1.6, 'image', 'ink2'), word(1, -1.85, 'f', 'ink3'), word(3, -1.85, 'f', 'ink3'), word(5, -1.85, 'f', 'ink3'), word(7, -1.85, 'f', 'ink3')],
  }),
});

export default lesson({
  id: 'phys4650.O9.1',
  title: 'Lenses as Fourier transformers',
  minutes: 14, difficulty: 3,
  intro: t`Light leaving an object in a set of directions is a set of plane waves — the object’s **spatial frequencies**: a pattern repeating every $\Lambda$ sends light off at $\sin\theta = \lambda/\Lambda$. A lens focuses each direction to one point of its back focal plane, so that plane holds the **Fourier transform** of the field in the front focal plane:

$$U_f(x_f) \propto \int U(x)\,e^{-2\pi i\,\nu x}\,dx, \qquad \nu = \frac{x_f}{\lambda f}$$

Put a mask there and a second lens transforms back: a **4f system** that edits an image by its spatial frequencies. And it explains imaging itself (Abbe): a lens reproduces only the detail whose diffracted light it catches.`,
  symbols: [
    { tex: 'U(x)', text: 'the light’s field (amplitude and phase) across the object, in the front focal plane' },
    { tex: 'U_f(x_f)', text: 'the field across the back focal plane, the Fourier plane' },
    { tex: '\\nu', text: 'spatial frequency: cycles per metre (or lines per millimetre) across the object' },
    { tex: 'x_f', text: 'position in the Fourier plane' },
    { tex: '\\lambda', text: 'the wavelength' },
    { tex: 'f', text: 'the lens’s focal length' },
  ],
  why: t`Spatial filters clean laser beams, microscopes see what their apertures let through, and a telescope’s point-spread function is the Fourier transform of its pupil — the same idea throughout.`,
  visual: {
    type: 'graph',
    title: 'Rebuilding a grating from its orders',
    lead: t`A grating of slits (grey, its field) imaged by a 4f system whose iris passes orders up to $|m| = M$ — or with the centre spot blocked. Gold is the field in the image.`,
    tasks: [
      t`Pass only the zeroth order ($M = 0$): the image is uniform. No detail without diffracted light — Abbe’s point.`,
      t`Pass $M = 1$: a pure cosine with the grating’s period. Raise $M$ and the edges sharpen (with Gibbs’s overshoot).`,
      t`Block the centre spot: the field loses its average and swings positive and negative; its square, what you see, drops to zero at every edge, where the field changes sign: each slit is outlined in dark lines.`,
    ],
    params: {
      x: [0, 3], y: [-0.8, 1.4], aspect: 'wide', xlabel: 'position across the image (grating periods)', ylabel: 'field', xticks: 6, yticks: 4,
      sliders: [
        { key: 'M', label: 'Highest order passed $M$', min: 0, max: 15, step: 1, value: 3, explain: 'The iris in the Fourier plane passes orders $-M$ to $M$.' },
        { key: 'r', label: 'Slit width ÷ period', min: 0.1, max: 0.9, step: 0.05, value: 0.4, explain: 'The fraction of each period that is open.' },
      ],
      choices: [{ key: 'f0', label: 'Fourier-plane mask', options: [[0, 'Iris (low-pass)'], [1, 'Iris with the centre blocked']], value: 0, explain: 'Blocking the zeroth order removes the average field.' }],
      curves: [
        { fn: 'step(r/2 - abs(x - round(x)))', color: 'ink3', width: 1.6 },
        { sum: '(2 - step(0.5 - k))*sin(pi*k*r + 0.000000001)/(pi*k + 0.000000001/r)*cos(2*pi*k*x)', k: ['f0', 'M'], color: 'gold', width: 2.4 },
      ],
    },
    caption: t`Coherent, unit-magnification imaging of a thin grating of perfect slits (the image of a 4f system is really inverted). The curves are fields; the irradiance you would see is their square.`,
  },
  example: {
    prompt: t`A grating of $${EX.lpmm}$ lines per millimetre sits in the front focal plane of a lens of focal length $f = ${EX.f * 1000}$ mm, lit by a $633$ nm plane wave. How far apart are the spots in the back focal plane? What iris there passes only the zeroth and first orders, and what does the final image of the 4f system look like?`,
    visual: fourF(t`A 4f system: each lens is a focal length from the planes beside it. Gold rays from one direction meet at one point of the Fourier plane; violet shows another direction (schematic).`),
    steps: [
      { label: 'Directions', text: t`The grating ($\Lambda = ${sf(EX.Lam * 1e6, 3)}\ \mu$m) sends order $m$ off at $\sin\theta_m = m\lambda/\Lambda$; the lens maps a direction $\theta$ to the point $x_f = f\tan\theta \approx f\theta$.` },
      { label: 'Spot spacing', text: t`$\Delta x_f = \lambda f/\Lambda = (633\times10^{-9})(${EX.f})/(${sf(EX.Lam, 3)})\ \text{m} = ${sf(EX.dx * 1e3, 3)}$ mm. Each spot is one spatial frequency, $\nu = x_f/(\lambda f) = m/\Lambda$.` },
      { label: 'Iris', text: t`To pass $m = 0, \pm1$ and block $\pm2$, the iris radius must lie between $${sf(EX.dx * 1e3, 3)}$ and $${sf(2 * EX.dx * 1e3, 3)}$ mm.` },
      { label: 'Image', text: t`Three plane waves recombine: the image field is $c_0 + 2c_1\cos(2\pi x/\Lambda)$ — the grating’s period, but a smooth cosine; the square edges needed the higher orders.` },
      { label: 'Sense check', text: t`Finer gratings or longer focal lengths spread the spots further; at $\lambda f/\Lambda$ they scale exactly like the far-field fringes of O8.1, which is what they are.` },
    ],
    answer: t`Spots $${sf(EX.dx * 1e3, 3)}$ mm apart; an iris of radius between $${sf(EX.dx * 1e3, 3)}$ and $${sf(2 * EX.dx * 1e3, 3)}$ mm leaves a sinusoidal image with the grating’s period.`,
  },
  practice: [
    num({
      id: 'spot-spacing', difficulty: 1,
      gen(r) {
        const lpmm = r.pick([10, 25, 50, 100]), f = r.pick([100, 150, 300]), lam = r.pick([532, 633]);
        const dx = (lam * 1e-6 * f * lpmm);          // mm: λ[mm]·f[mm]/Λ[mm]
        return {
          prompt: t`A grating of $${lpmm}$ lines per millimetre is lit by $${lam}$ nm light in front of a lens of focal length $${f}$ mm. How far apart are the diffraction spots in the lens’s back focal plane, in millimetres?`,
          visual: spectrumPic(0.5, null, t`The Fourier plane of a grating: equally spaced spots, one per order (powers for slits half the period wide; the spacing is the question).`),
          answer: dx, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: lam * 1e-6 * f / lpmm, feedback: t`The period is $\Lambda = 1/${lpmm}$ mm: divide by it, i.e. multiply by the lines per millimetre.` }],
          hints: [t`$\Delta x_f = \lambda f/\Lambda$.`],
          teach: t`In a lens’s Fourier plane, period $\Lambda$ lands at $\lambda f/\Lambda$ from the axis.`,
          explain: t`$\lambda f/\Lambda = (${lam}\times10^{-6}\ \text{mm})(${f}\ \text{mm})(${lpmm}\ \text{mm}^{-1}) = ${sf(dx, 3)}$ mm.`,
        };
      },
    }),
    num({
      id: 'iris-cutoff', difficulty: 2,
      gen(r) {
        const R = r.pick([0.5, 1, 2]), f = r.pick([100, 200, 250]), lam = r.pick([532, 633]);
        const nu = R / (lam * 1e-6 * f);          // lines/mm
        return {
          prompt: t`An iris of radius $${R}$ mm is centred in the Fourier plane of a 4f system with $f = ${f}$ mm lenses, in $${lam}$ nm light. What is the highest spatial frequency of the object that reaches the image, in lines per millimetre?`,
          visual: fourF(t`A 4f system with an iris in the Fourier plane (schematic).`),
          answer: nu, units: 'mm^-1', tol: { rel: 0.01 },
          errors: [{ value: nu / 2, feedback: t`The iris’s radius, not its diameter, sets the cutoff: $\nu_{\max} = R/(\lambda f)$.` }],
          hints: [t`Position $x_f$ in the Fourier plane is frequency $\nu = x_f/(\lambda f)$.`, t`$\nu_{\max} = R/(\lambda f)$.`],
          teach: t`An iris of radius $R$ is a low-pass filter with cutoff $R/(\lambda f)$.`,
          explain: t`$\nu_{\max} = ${R}/((${lam}\times10^{-6})(${f}))\ \text{mm}^{-1} = ${sf(nu, 3)}$ lines per mm: detail finer than $${sf(1000 / nu, 3)}\ \mu$m is lost.`,
        };
      },
    }),
    num({
      id: 'abbe', difficulty: 2,
      gen(r) {
        const NA = r.pick([0.25, 0.4, 0.65, 0.95]), lam = r.pick([450, 550]);
        const L = lam / NA;
        return {
          prompt: t`A microscope objective of numerical aperture $\text{NA} = ${NA}$ looks at a grating lit straight on by coherent $${lam}$ nm light. What is the finest grating period it can image at all, in nanometres?`,
          visual: spectrumPic(0.5, 1, t`The orders a grating sends into the objective; the vertical lines mark the edge of its aperture. To image the grating, it must catch at least the first orders.`),
          answer: L, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: lam / (2 * NA), feedback: t`That is the limit with oblique illumination, which tilts the zeroth order to one edge of the aperture. Lit straight on, both $\pm1$ orders must fit: $\sin\theta_1 = \lambda/\Lambda \le \text{NA}$.` }, { value: (1.22 * lam) / NA, feedback: t`The Rayleigh factor 1.22 belongs to two point sources; a grating’s first order needs $\lambda/\Lambda \le \text{NA}$.` }],
          hints: [t`Abbe: with only the zeroth order, the image is uniform.`, t`The first order leaves at $\sin\theta = \lambda/\Lambda$; it must be within the cone $\sin\theta \le \text{NA}$.`],
          teach: t`Abbe’s limit: a coherent, axially lit microscope resolves periods down to $\lambda/\text{NA}$.`,
          explain: t`$\Lambda_{\min} = \lambda/\text{NA} = ${lam}/${NA} = ${sf(L, 3)}$ nm. Tilting the illumination lets the zeroth and one first order through together: down to $\lambda/(2\text{NA}) = ${sf(L / 2, 3)}$ nm.`,
        };
      },
    }),
    mcq({
      id: 'dc-block', difficulty: 3,
      prompt: t`A cosine grating (field $1 + \cos(2\pi x/\Lambda)$) sends only three spots into a 4f system’s Fourier plane: the centre and the two first orders. A small stop blocks the centre spot. What does the image show?`,
      visual: spectrumPic(0.5, null, t`The three spots of a sinusoidal grating’s Fourier plane (a slit grating would have more); the centre one is blocked.`, 2, { points: [{ x: 0, y: 1.1, r: 0, label: 'blocked', color: 'bad', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, true),
      choices: [t`Fringes with period $\Lambda/2$: the field is $\cos(2\pi x/\Lambda)$, and its square repeats twice as often.`, 'Darkness: the centre spot carried all the light.', t`The same fringes with period $\Lambda$, only dimmer.`, 'The same fringes with bright and dark swapped.'],
      answer: 0,
      why: { 1: 'The first orders carry light of their own; only the uniform background is removed.', 2: 'With the average gone, the field swings symmetrically about zero, and the eye sees its square.', 3: 'Swapping bright and dark would need a phase shift of π on the centre spot, not a block.' },
      hints: ['What field do the two remaining spots make?', 'Two plane waves at ±θ make a field cos(2πx/Λ); the irradiance is cos², which has period Λ/2.'],
      teach: 'Removing the zeroth order removes a field’s average; the irradiance of what is left can show twice the frequency, or bright edges.',
      explain: t`The field is $\cos(2\pi x/\Lambda)$, and $\cos^2 = \tfrac12\bigl(1 + \cos(4\pi x/\Lambda)\bigr)$: fringes at period $\Lambda/2$. Block the centre of a general object and only its edges stay bright — dark-field microscopy.`,
    }),
    mcq({
      id: 'pinhole', difficulty: 2,
      prompt: t`Laser beams pick up ripples from dust and scratches on optics. A **spatial filter** focuses the beam through a tiny pinhole and recollimates it. Why does the beam come out clean?`,
      visual: fourF(t`Lens, pinhole in the Fourier plane, lens (schematic).`, 'stop'),
      choices: ['Ripples are high spatial frequencies: they focus away from the axis and the pinhole blocks them.', 'The pinhole absorbs the noisy light because it is weaker.', 'The pinhole makes the light more monochromatic.', 'Focusing averages the ripples out, and the pinhole only limits the power.'],
      answer: 0,
      why: { 1: 'A pinhole sorts light by direction, not by strength.', 2: 'A pinhole acts on spatial frequencies (directions), not on temporal ones (colours).', 3: 'Focusing alone keeps every direction; the pinhole is what removes the off-axis ones.' },
      hints: ['In the focal plane each direction is a point.', 'A ripple of period Λ sends light off at angle λ/Λ.'],
      teach: 'A spatial filter is a low-pass filter in the Fourier plane: smooth beams pass, ripples focus to the side and are blocked.',
      explain: t`A ripple of period $\Lambda$ focuses $\lambda f/\Lambda$ off axis; a pinhole a little larger than the beam’s focused spot passes the smooth part and blocks the ripples. That is the same 4f filter, with only the lowest frequencies kept.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-commfilter', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([25, 50, 100]), L = r.pick([0.1, 0.2, 0.5]);
        const R = (1064e-6 * f) / L;         // mm
        return {
          prompt: t`A laser-communication terminal cleans its $1064$ nm beam with a spatial filter: a lens of focal length $${f}$ mm and a pinhole in its focal plane. The beam carries a ripple with period $${L}$ mm across it. What is the largest pinhole **radius** that still blocks that ripple, in millimetres?`,
          visual: fourF(t`A spatial filter: lens, pinhole, lens (schematic).`, 'stop'),
          answer: R, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: R * 2, feedback: 'That would be the diameter: the ripple’s spots sit λf/Λ from the axis, so the radius must be less than that.' }],
          hints: [t`The ripple sends light off at $\theta = \lambda/\Lambda$, which focuses at $x_f = f\theta$.`, t`The pinhole radius must be less than $\lambda f/\Lambda$.`],
          teach: t`A ripple of period $\Lambda$ focuses $\lambda f/\Lambda$ from the axis; a pinhole smaller than that removes it.`,
          explain: t`$\lambda f/\Lambda = (1.064\times10^{-3}\ \text{mm})(${f}\ \text{mm})/(${L}\ \text{mm}) = ${sf(R, 3)}$ mm. The pinhole must also pass the beam’s own focused spot, about $\lambda f/D$ wide for a beam of width $D$: both scale with $f$, so only ripples much finer than the beam itself can be filtered out.`,
        };
      },
    }),
    num({
      id: 'cp-jwst', difficulty: 3, transfer: true,
      gen(r) {
        const [D, nm] = r.pick([[6.5, 'JWST’s 6.5 m'], [2.4, 'Hubble’s 2.4 m'], [39, 'a 39 m']]), lam = r.pick([1, 2, 4.4]);
        const p = ((lam * 1e-6) / D) / ARCSEC * 1000;     // mas
        return {
          prompt: t`For incoherent light (stars), a telescope’s image keeps spatial frequencies on the sky up to a cutoff of $D/\lambda$ cycles per radian — the pupil’s width, since the transfer function is the pupil correlated with itself. What is the finest angular **period** that ${nm} mirror can pass at $${lam}\ \mu$m, in milliarcseconds?`,
          visual: { type: 'graph', caption: t`The incoherent transfer function (MTF) of a perfect round pupil: contrast passed against spatial frequency, falling to zero at $D/\lambda$.`, params: { x: [0, 1.15], y: [0, 1.1], aspect: 'wide', xlabel: 'spatial frequency / (D/λ)', ylabel: 'contrast passed', xticks: 4, yticks: 2,
            curves: [{ fn: '(2/pi)*(acos(min(x, 1)) - min(x, 1)*sqrt(1 - min(x, 1)^2))', color: 'gold', width: 2.4 }] } },
          answer: p, units: 'mas', tol: { rel: 0.01 },
          errors: [{ value: p * 2, feedback: t`For incoherent light the cutoff is $D/\lambda$, twice the coherent one ($D/2\lambda$ in these units) — the finest period is $\lambda/D$.` }, { value: p * 1.22, feedback: t`The 1.22 belongs to the Rayleigh criterion for two points; the transfer function’s cutoff is exactly $\lambda/D$.` }],
          hints: [t`The finest period is the inverse of the cutoff: $\lambda/D$ radians.`, t`One milliarcsecond is $${sf(ARCSEC / 1000 * 1e9, 4)}\times10^{-9}$ rad.`],
          teach: t`A telescope passes no detail with an angular period below $\lambda/D$: its MTF reaches zero there.`,
          explain: t`$\lambda/D = (${lam}\times10^{-6})/${D} = ${tex((lam * 1e-6) / D)}$ rad $= ${sf(p, 3)}$ mas. The MTF falls steadily toward that cutoff, so fine detail near it comes through with little contrast.`,
        };
      },
    }),
    mcq({
      id: 'cp-darkfield', difficulty: 2,
      prompt: t`A glass slide carrying an opaque square $1$ mm across is imaged by a 4f system whose Fourier plane has a small stop on the axis: it blocks the undiffracted light and every spatial frequency below $20$ lines per millimetre. What does the image show?`,
      visual: fourF(t`A 4f system with a small central stop (schematic).`, 'stop'),
      choices: ['A dark field with the outline of the square glowing: only light diffracted by its edges gets through.', 'The square, bright on a dark background, filled in.', 'Nothing at all: the stop blocks all the light.', 'The usual image, slightly dimmer.'],
      answer: 0,
      why: { 1: 'Inside the square and on the glass around it the field is uniform over far more than the $50\ \mu$m period the stop cuts at: that light lies in the low frequencies it removes. Only the edges diffract beyond the stop.', 2: 'The stop is small: diffracted light passes around it.', 3: 'The undiffracted light, which carries most of the power and the uniform parts of the image, is removed.' },
      hints: ['Uniform regions send light straight through the focus; edges diffract it sideways.', 'What is left after removing the lowest spatial frequencies?'],
      teach: 'Blocking the zeroth order and the lowest frequencies (dark field) shows only where the object changes over short distances: edges and small scatterers glow.',
      explain: t`Removing the frequencies below $20$ lines per millimetre removes everything uniform over more than about $50\ \mu$m — the bright glass and the dark inside alike. What remains is the high-frequency light from the square’s edges — a glowing outline on black. (A square much smaller than $50\ \mu$m would glow all over instead: Babinet’s principle.) Dark-field microscopes show live bacteria this way; coronagraphs use related tricks to suppress a star.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §11.3 (Fourier methods: the lens as a transformer, spatial filtering, the transfer function)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'J. W. Goodman, Introduction to Fourier Optics, 4th ed. (W. H. Freeman, 2017), ch. 5–7', url: 'https://openlibrary.org/search?q=Introduction+to+Fourier+Optics+Goodman' },
  ],
});
