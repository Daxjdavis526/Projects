// Two-slit interference: Young's experiment, bright fringes at d sin θ = mλ,
// dark ones halfway, evenly spaced fringes λL/d on a distant screen, the
// cos² intensity, and why dark fringes mean cancelling waves rather than
// "no light sent there". Pictures from optics-waves (slits mode: sums of
// phasors, tested against the closed forms).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, apart, asind, sind, slitsPic, label, seg, r6, RAD2AS } from './_optics.js';
import { twoSources } from './_waves.js';

const t = String.raw;

/** Two radio dishes on the ground and a wave arriving at an angle (schematic). */
function dishes(caption) {
  const th = 0.35, d = 6;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-1.5, 8], y: [-0.9, 4.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: '0', lower: '-0.9', from: -5, to: 12, color: 'good', alpha: 0.12 }],
      curves: [seg([-5, 0], [12, 0], { color: 'ink3', width: 1.2 }),
        seg([0, 0], [r6(-3.6 * Math.sin(th)), r6(3.6 * Math.cos(th))], { color: 'gold', width: 1.6 }), seg([d, 0], [r6(d - 3.6 * Math.sin(th)), r6(3.6 * Math.cos(th))], { color: 'gold', width: 1.6 }),
        seg([0, 0], [r6(d * Math.cos(th) ** 2), r6(d * Math.cos(th) * Math.sin(th))], { color: 'ink3', width: 1.2, dash: true }),
        seg([r6(d * Math.cos(th) ** 2), r6(d * Math.cos(th) * Math.sin(th))], [d, 0], { color: 'violet', width: 3.2 }),
        // an earlier wavefront, perpendicular to the rays
        seg([r6(-3.2 * Math.sin(th) - 1.0 * Math.cos(th)), r6(3.2 * Math.cos(th) - 1.0 * Math.sin(th))], [r6(-3.2 * Math.sin(th) + (d * Math.cos(th) + 1.2) * Math.cos(th)), r6(3.2 * Math.cos(th) + (d * Math.cos(th) + 1.2) * Math.sin(th))], { color: 'ink3', width: 1, dash: true })],
      points: [{ x: 0, y: 0, color: 'accent', r: 7, label: 'dish 1', labelDx: -22, labelDy: 18 }, { x: d, y: 0, color: 'accent', r: 7, label: 'dish 2', labelDx: -22, labelDy: 18 },
        label(2.2, -0.5, 'd (baseline)', 'ink2'), label(r6(d * Math.cos(th) ** 2 / 2 + d / 2 + 0.25), r6(d * Math.cos(th) * Math.sin(th) / 2), 'extra path d sin θ', 'violet'), label(1.2, 1.55, 'wavefront', 'ink3'),
        label(-1.4, 3.9, 'radio waves from a source at angle θ', 'gold')],
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.O3.1',
  title: 'Two-slit interference',
  minutes: 14, difficulty: 2,
  intro: t`Shine a laser on two narrow slits a distance $d$ apart. Light spreads out from each and overlaps on a screen beyond — and instead of two blurred patches you see a row of evenly spaced bright and dark **fringes**. Toward an angle $\theta$, the light from one slit travels $d\sin\theta$ farther than the light from the other; the waves arrive in step, and add, wherever that **path difference** is a whole number of wavelengths:

$$d\sin\theta = m\lambda \qquad (m = 0, \pm1, \pm2, \ldots)$$

Halfway between, they arrive half a cycle apart and cancel. Thomas Young's version of this experiment (1801–1803) was the first measurement of the wavelength of light.`,
  symbols: [
    { tex: 'd', text: 'the slit separation, centre to centre, in m (typically a fraction of a millimetre)' },
    { tex: '\\theta', text: 'the angle from the straight-ahead direction to a point on the screen' },
    { tex: 'm', text: 'the **order** of a bright fringe: 0 for the central one, ±1 for the first on either side, and so on' },
    { tex: '\\lambda', text: 'the wavelength of the light, in m (400–700 nm for visible light)' },
    { tex: 'd\\sin\\theta', text: 'the path difference between the two slits’ waves at that angle' },
  ],
  why: t`Interference is how optics measures lengths in units of the wavelength of light — and done one photon at a time, the same pattern still builds up, dot by dot: the central puzzle of [wave–particle duality](#/lesson/phys2220.Q1.4).`,
  visual: {
    type: 'optics-waves',
    title: 'Two slits, one pattern',
    lead: t`Top: the pattern on a screen 1 m away. Middle: its intensity. Right: at the draggable probe, the phasors — one small arrow for each strip of each slit (blue: slit 1, teal: slit 2) — added head to tail. The gold arrow is their sum; its length squared is the brightness. (Each slit's own width adds the dashed envelope, the subject of the next module.)`,
    tasks: [
      'Drag the probe to a dark fringe: the two slits’ phasors point opposite ways and cancel. Drag it to a bright one: they line up.',
      t`Halve the slit spacing $d$: the fringes spread twice as far apart. Spacing is $\lambda L/d$.`,
      'Switch to violet light, then to white: shorter wavelengths make closer fringes, so white light gives a white centre with coloured fringes either side.',
    ],
    params: { mode: 'slits', N: 2, a: 20, d: 100, lambda: 633, L: 1 },
  },
  example: {
    prompt: t`Red laser light ($\lambda = 633$ nm) passes through two slits $0.25$ mm apart onto a screen $2.0$ m away. At what angle is the first bright fringe beside the centre, how far apart are the fringes on the screen, and where is the third bright fringe?`,
    visual: slitsPic({ N: 2, a: 0, d: 250, lambda: 633, L: 2, marks: 'bright', range: 18 }, 'The pattern for very narrow slits (no envelope), with the bright orders marked.'),
    steps: [
      { label: 'First order', text: t`$\sin\theta_1 = \dfrac{\lambda}{d} = \dfrac{633\times10^{-9}}{0.25\times10^{-3}} = 2.53\times10^{-3}$, so $\theta_1 = 0.145°$: a tiny angle.` },
      { label: 'On the screen', text: t`For small angles $\sin\theta \approx \tan\theta = y/L$, so the bright fringes sit at $y_m = m\lambda L/d$, evenly spaced by $\Delta y = \dfrac{\lambda L}{d} = \dfrac{(633\times10^{-9})(2.0)}{0.25\times10^{-3}} = 5.1$ mm.` },
      { label: 'Third fringe', text: t`$y_3 = 3\Delta y = 15.2$ mm from the centre.` },
      { label: 'Sense check', text: t`Wavelengths are about a thousandth of a millimetre, so to make fringes you can see, $d$ must be small and $L$ large: $\lambda/d$ is only $0.0025$ here, magnified by 2 m.` },
    ],
    answer: t`$\theta_1 = 0.145°$; the fringes are $5.1$ mm apart; the third bright fringe is $15.2$ mm from the centre.`,
  },
  practice: [
    num({
      id: 'angle-m', difficulty: 1,
      gen(r) {
        const lam = r.pick([450, 532, 633]), d = r.pick([5, 10, 20]), m = r.pick([1, 2, 3]);
        const key = asind((m * lam * 1e-9) / (d * 1e-6));
        return {
          prompt: t`Light of wavelength ${lam} nm falls on two slits ${d} µm apart. At what angle from the centre is the order $m = ${m}$ bright fringe?`,
          answer: key, units: 'deg', tol: { rel: 0.005 },
          errors: apart([{ value: asind((lam * 1e-9) / (d * 1e-6)), feedback: t`That is the first order. The ${m === 2 ? 'second' : 'third'} needs $d\sin\theta = ${m}\lambda$.` }, { value: asind(((m + 0.5) * lam * 1e-9) / (d * 1e-6)), feedback: t`$(m + \tfrac12)\lambda$ gives the dark fringes; bright ones need $m\lambda$.` }], key),
          hints: [t`$\sin\theta = m\lambda/d$, with $\lambda$ and $d$ in the same units.`, t`$\sin\theta = ${m}\times${lam}\times10^{-9}/(${d}\times10^{-6}) = ${tn((m * lam * 1e-9) / (d * 1e-6), 4)}$.`],
          teach: t`Bright fringes sit where the path difference is a whole number of wavelengths: $d\sin\theta = m\lambda$.`,
          explain: t`$\sin\theta = ${tn((m * lam * 1e-9) / (d * 1e-6), 4)}$, so $\theta = ${tn(key)}°$.`,
          visual: slitsPic({ N: 2, a: 0, d, lambda: lam, axis: 'angle', range: Math.min(89, Math.max(1.4 * key, 8)) }, `The pattern of two very narrow slits ${d} µm apart, against angle. Which bright fringe is order ${m} — and its angle — is what you are finding.`),
        };
      },
    }),
    num({
      id: 'spacing', difficulty: 1,
      gen(r) {
        const lam = r.pick([532, 633, 650]), d = r.pick([0.2, 0.25, 0.5]), L = r.pick([1.5, 2, 3]);
        const dy = ((lam * 1e-9 * L) / (d * 1e-3)) * 1e3;
        return {
          prompt: t`Laser light of wavelength ${lam} nm passes through two slits ${d} mm apart. How far apart are the bright fringes on a screen ${L} m away?`,
          answer: dy, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: dy / 2, feedback: t`Neighbouring bright fringes are a whole $\lambda L/d$ apart; half that is bright-to-dark.` }, { value: (d * 1e-3) / (lam * 1e-9 * L) / 1e3, feedback: t`Upside down: $\Delta y = \lambda L/d$.` }],
          hints: [t`Small angles: $\Delta y = \lambda L/d$.`, t`Use metres throughout: $\lambda = ${lam}\times10^{-9}$ m, $d = ${d}\times10^{-3}$ m.`],
          teach: 'On a distant screen the fringes are evenly spaced by λL/d: longer wavelength or closer slits spread them out.',
          explain: t`$\Delta y = \dfrac{(${lam}\times10^{-9})(${L})}{${d}\times10^{-3}} = ${tn(dy / 1e3)}$ m $= ${tn(dy)}$ mm.`,
          visual: slitsPic({ N: 2, a: 0, d: d * 1000, lambda: lam, L, hide: ['spacing'] }, `The pattern of two very narrow slits on a screen ${L} m away. The fringe spacing is what you are finding.`),
        };
      },
    }),
    num({
      id: 'measure-lambda', difficulty: 2,
      gen(r) {
        const [lam0, src] = r.pick([[589, 'a sodium lamp'], [543, 'a green helium–neon laser'], [633, 'a red helium–neon laser'], [405, 'a violet diode laser']]);
        const d = r.pick([0.15, 0.3]), L = r.pick([1.2, 2.5]);
        const n = 10, span = +((n * lam0 * 1e-9 * L) / (d * 1e-3) * 1e3).toFixed(1);
        const key = ((span / n) * 1e-3 * d * 1e-3) / L * 1e9;
        return {
          prompt: t`In the lab, light from ${src} passes through two slits ${d} mm apart. On a screen ${L} m away, you measure ${span} mm across ${n} fringe spacings. What is the wavelength, in nm?`,
          answer: key, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: key * n, feedback: t`${span} mm spans ${n} fringe spacings: divide by ${n} first.` }],
          hints: [t`One fringe spacing: $\Delta y = ${span}/${n}$ mm.`, t`$\lambda = d\,\Delta y/L$; use metres, then convert to nm.`],
          teach: 'Measuring many fringe spacings at once and dividing cuts the error: λ = d Δy/L.',
          explain: t`$\Delta y = ${tn(span / n)}$ mm, so $\lambda = \dfrac{(${d}\times10^{-3})(${tn(span / n)}\times10^{-3})}{${L}} = ${tn(key)}$ nm.`,
          visual: slitsPic({ N: 2, a: 0, d: d * 1000, lambda: Math.round(key), L, range: Math.min(40, 0.7 * span), hide: ['spacing'], labels: false }, 'The fringes on the screen (very narrow slits).'),
        };
      },
    }),
    mcq({
      id: 'energy', difficulty: 2,
      prompt: 'At the dark fringes of a two-slit pattern, the light from the two slits cancels. Where does that light’s energy go?',
      choices: [
        'To the bright fringes, which are four times as bright as one slit alone makes them — the average over the pattern is just the sum of the two slits’ light',
        'It is destroyed at the dark fringes',
        'It is reflected back toward the source',
        'It turns into heat at the dark places on the screen',
      ],
      answer: 0,
      why: {
        1: 'Energy is conserved: interference redistributes light across the screen; it neither creates nor destroys any.',
        2: 'Nothing is reflected: the light passing the slits all reaches the screen, just unevenly spread.',
        3: 'The dark places receive no light to absorb; nothing heats them.',
      },
      hints: [t`At a bright fringe the amplitudes add: $2A$, so the intensity is $(2A)^2 = 4A^2$ — four times one slit's $A^2$.`, 'Average 4A² over bright and dark fringes alike.'],
      teach: 'Interference moves light energy from the dark fringes to the bright ones; the total is unchanged.',
      explain: t`With amplitudes $A$ from each slit, bright fringes get $(2A)^2 = 4A^2$ and dark ones 0. The average of $4A^2\cos^2(\pi d\sin\theta/\lambda)$ over many fringes is $2A^2$ — exactly what two separate slits would deliver. The energy is all there, rearranged into stripes.`,
      visual: slitsPic({ N: 2, a: 0, d: 100, lambda: 633, phasors: true, probe: 3.165 }, 'Two narrow slits, with the phasors at a dark fringe: the two slits’ arrows point opposite ways.'),
    }),
    num({
      id: 'intensity', difficulty: 2,
      gen(r) {
        const [q, qTeX] = r.pick([[0.25, t`\tfrac14`], [1 / 3, t`\tfrac13`], [0.1, '0.10'], [0.4, '0.40']]);
        const key = Math.cos(Math.PI * q) ** 2;
        return {
          prompt: t`At a point P on the screen, the light from one slit has travelled $${qTeX}$ of a wavelength farther than the light from the other. What is the intensity there as a fraction of the central maximum, $I/I_0 = \cos^2(\pi\,\Delta/\lambda)$ with path difference $\Delta$? (Narrow slits.)`,
          answer: key, tol: { rel: 0.005, abs: 0.002 },
          errors: apart([{ value: Math.cos(2 * Math.PI * q) ** 2, feedback: t`The phase difference is $2\pi\Delta/\lambda$, and the cos² takes *half* of it: $\cos^2(\pi\Delta/\lambda)$.` }, { value: Math.cos(Math.PI * q), feedback: 'Square the cosine: intensity goes as amplitude squared.' }], key),
          hints: [t`$\pi\Delta/\lambda = ${tn(Math.PI * q, 4)}$ rad $= ${tn(180 * q)}°$.`, 'Take its cosine and square it.'],
          teach: t`Two equal waves with path difference $\Delta$ give $I = I_0\cos^2(\pi\Delta/\lambda)$.`,
          explain: t`$\cos^2(${tn(180 * q)}°) = ${tn(key, 3)}$. The amplitude is $2A\cos(\phi/2)$ with phase difference $\phi = 2\pi\Delta/\lambda$; squaring gives the intensity.`,
          visual: twoSources({ l1: 'r', l2: `r + ${q === 1 / 3 ? '⅓' : q === 0.25 ? '¼' : q}λ`, who: 'P', caption: 'The two slits (S₁, S₂) and the point P on the screen, with the two paths (not to scale).' }),
        };
      },
    }),
    mcq({
      id: 'in-water', difficulty: 2,
      prompt: 'A two-slit experiment is set up under water (n = 1.33) instead of in air, with the same laser. What happens to the fringes?',
      choices: ['They move closer together, by a factor of 1.33', 'They spread 1.33 times farther apart', 'Nothing: the laser’s frequency is unchanged', 'They vanish: light cannot interfere in water'],
      answer: 0,
      why: {
        1: t`The wavelength in water is *shorter*: $\lambda/n$. Fringe spacing goes as $\lambda$.`,
        2: 'The frequency is unchanged, but the fringes depend on the wavelength, which shrinks in water.',
        3: 'Waves interfere in any medium; only the wavelength changes.',
      },
      hints: [t`Spacing $= \lambda L/d$. What happens to $\lambda$ in water?`],
      teach: 'Interference depends on the wavelength in the medium, λ/n.',
      explain: t`In water the wavelength is $\lambda/1.33$, so $\Delta y = \lambda L/(nd)$: the fringes close up by a factor of 1.33.`,
      visual: slitsPic({ N: 2, a: 0, d: 250, lambda: 633, L: 2, hide: ['spacing'] }, 'The pattern in air, for comparison.'),
    }),
    num({
      id: 'white-spread', difficulty: 3,
      gen(r) {
        const d = r.pick([0.2, 0.3, 0.5]), L = r.pick([1, 1.5, 2]);
        const key = ((300e-9 * L) / (d * 1e-3)) * 1e3;
        return {
          prompt: t`White light passes through two slits ${d} mm apart onto a screen ${L} m away. The first-order fringe spreads into a little spectrum. How wide is it on the screen, from violet (400 nm) to red (700 nm)?`,
          answer: key, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: ((700e-9 * L) / (d * 1e-3)) * 1e3, feedback: 'That is where the red first-order fringe sits; subtract where the violet one does.' }],
          hints: ['Each colour makes its own pattern, with its own first-order position.', t`$y_1 = \lambda L/d$ for each: the width is $(700 - 400)\ \text{nm}\times L/d$.`, 'Use metres, then convert to mm.'],
          teach: 'Each wavelength makes its own fringes; in white light the orders become little spectra, violet innermost.',
          explain: t`Violet: $y_1 = ${tn(((400e-9 * L) / (d * 1e-3)) * 1e3)}$ mm; red: $${tn(((700e-9 * L) / (d * 1e-3)) * 1e3)}$ mm. The first-order spectrum is $${tn(key)}$ mm wide, violet nearest the centre. Only the central fringe ($m = 0$) is white, since every colour has zero path difference there.`,
          visual: slitsPic({ N: 2, a: 0, d: d * 1000, lambda: 550, L, light: 'white', hide: ['spacing'] }, 'Two narrow slits in white light: a white centre, then coloured fringes.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-spacing', difficulty: 2,
      gen(r) {
        const lam = r.pick([450, 532, 650]), d = r.pick([0.12, 0.18, 0.4]), L = r.pick([1.2, 2.4]);
        const dy = ((lam * 1e-9 * L) / (d * 1e-3)) * 1e3;
        return {
          prompt: t`Two slits ${d} mm apart are lit with ${lam} nm light. What is the distance on a screen ${L} m away from the central bright fringe to the **second** dark fringe beside it?`,
          answer: 1.5 * dy, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: 2 * dy, feedback: 'That is the second bright fringe. Dark fringes lie halfway between bright ones: the second is at 1.5 spacings.' }, { value: 0.5 * dy, feedback: 'That is the first dark fringe; the second is one spacing farther out.' }],
          hints: [t`Dark fringes: $d\sin\theta = (m + \tfrac12)\lambda$, at $y = (m + \tfrac12)\lambda L/d$.`, t`The second dark fringe has $m = 1$: $y = 1.5\,\lambda L/d$.`],
          teach: 'Dark fringes lie halfway between bright ones, at (m + ½)λL/d.',
          explain: t`$\lambda L/d = ${tn(dy)}$ mm, so the second dark fringe is at $1.5\times${tn(dy)} = ${tn(1.5 * dy)}$ mm.`,
          visual: slitsPic({ N: 2, a: 0, d: d * 1000, lambda: lam, L, hide: ['spacing'] }, 'The two-slit pattern on the screen (very narrow slits).'),
        };
      },
    }),
    num({
      id: 'cp-radio', difficulty: 3, transfer: true,
      gen(r) {
        const [lam, lamTxt] = r.pick([[0.21, '21 cm (the hydrogen line)'], [0.06, '6.0 cm'], [0.013, '1.3 cm']]);
        const d = r.pick([1, 3, 10]);
        const key = (lam / (d * 1e3)) * RAD2AS;
        return {
          prompt: t`Two radio telescopes ${d}.0 km apart observe the same source at a wavelength of ${lamTxt}, and their signals are added — a two-slit experiment run backwards. As the Earth turns the source across the sky, the combined signal rises and falls in fringes: a maximum whenever the extra path $d\sin\theta$ is a whole number of wavelengths. How large an angle on the sky separates neighbouring fringes? (Small angles; give arcseconds.)`,
          answer: key, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: lam / (d * 1e3), feedback: 'That is in radians: multiply by 206 265 arcseconds per radian.' }, { value: key * 1000, feedback: 'Put the baseline in metres before dividing.' }],
          hints: [t`Neighbouring fringes differ by one wavelength of path: $\Delta\theta \approx \lambda/d$ for small angles.`, t`$\lambda/d = ${lam}\ \text{m}/${d * 1000}\ \text{m}$; convert radians to arcseconds (×206 265).`],
          teach: 'Two antennas a distance d apart see fringes on the sky every λ/d radians — the basis of radio interferometry.',
          explain: t`$\Delta\theta = \lambda/d = ${tn(lam / (d * 1e3))}$ rad $= ${tn(key)}''$. A wider baseline gives finer fringes, which can locate and resolve sources more sharply — the idea that, pushed to Earth-sized baselines, gave the Event Horizon Telescope its image of a black hole's shadow.`,
          visual: dishes('Two radio dishes and waves arriving from a source at an angle θ: the wave reaches one dish d sin θ later than the other (schematic, not to scale).'),
        };
      },
    }),
    mcq({
      id: 'cp-one-slit', difficulty: 2,
      prompt: 'A student argues: “Light is a stream of little particles. The dark fringes are simply places where the particles from the two slits don’t go.” Which observation rules this out?',
      choices: [
        'Covering one slit makes the dark fringes brighter: light from a single slit does reach them, so with both open they are dark because the two waves cancel',
        'The bright fringes are evenly spaced',
        'The central fringe is the brightest',
        'Red light gives wider fringes than blue light',
      ],
      answer: 0,
      why: {
        1: 'Evenly spaced fringes alone could perhaps be fitted by some rule for where particles land; they do not decide the question.',
        2: 'A bright centre is expected from many models, wave or particle.',
        3: 'This shows the pattern depends on wavelength, but not, by itself, that dark fringes come from cancellation.',
      },
      hints: ['What would happen at a dark point if you blocked one of the two sources of light?', 'If particles from either slit could reach a point, opening a second slit should never make it darker.'],
      teach: 'Opening a second slit can make a point darker: only cancelling waves do that.',
      explain: 'With one slit open, light spreads smoothly across the screen, including the places that are dark with both open. Adding light from the second slit makes those places darker: the two waves arrive half a cycle apart and cancel. Particles that each go through one slit or the other could only add up. (Quantum mechanics keeps the cancellation even one photon at a time — each photon’s probability wave goes through both slits.)',
      visual: slitsPic({ N: 1, a: 20, lambda: 633, range: 31.6 }, 'For comparison: the light reaching the screen from one slit alone (20 µm wide) — smooth, with no dark fringes near the centre.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §3.1 Young’s Double-Slit Interference; §3.2 Mathematics of Interference', url: 'https://openstax.org/books/university-physics-volume-3/pages/3-1-youngs-double-slit-interference' },
    { label: 'Event Horizon Telescope Collaboration, “First M87 Event Horizon Telescope Results. I”, ApJL 875, L1 (2019)', url: 'https://arxiv.org/abs/1906.11238' },
  ],
});
