// Single-slit diffraction: dark fringes at a sin θ = mλ (m ≠ 0), a central
// maximum twice as wide as the side bands, narrower slit → wider pattern,
// the intensity (sin β/β)² from a phasor chain bent into an arc, missing
// orders in a two-slit pattern, and diffraction setting the beam width of a
// radar antenna. Pictures from optics-waves (slits mode, N = 1) and graph
// sketches drawn here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, apart, asind, slitsPic, seg, tag, r6 } from './_optics.js';

const t = String.raw;

/**
 * A slit, its screen and the pattern on it, seen from above (not to scale): the dashed lines run from the slit to the
 * dark fringes of the given order, and a bracket on the right spans the distance between that pair.
 */
function slitGeom({ order = 1, span = 'w', caption }) {
  const Y = 1.15, X = 9, y = order * Y;
  const bracket = { color: 'gold', width: 1.8 };
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-4.3, 12.2], y: [-3.4, 3.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        ...[-3.2, -2.5, -1.8].map((x) => seg([x, -1.1], [x, 1.1], { color: 'gold', width: 1.3 })),
        seg([0, 0.28], [0, 2.7], { color: 'ink', width: 4 }), seg([0, -0.28], [0, -2.7], { color: 'ink', width: 4 }),
        seg([0, 0], [X, 0], { color: 'ink3', width: 1, dash: true }),
        seg([0, 0], [X, y], { color: 'ink3', width: 1.4, dash: true }), seg([0, 0], [X, -y], { color: 'ink3', width: 1.4, dash: true }),
        { param: ['4.2*cos(t)', '4.2*sin(t)'], t: [0, r6(Math.atan2(y, X))], color: 'violet', width: 1.6 },
        seg([X, -3.1], [X, 3.1], { color: 'ink2', width: 3 }),
        { param: [`${X} + 1.5*(sin(${r6(Math.PI / Y)}*t + 1e-9)/(${r6(Math.PI / Y)}*t + 1e-9))^2`, 't'], t: [-3.1, 3.1], color: 'accent', width: 2 },
      ],
      arrows: [
        { from: [4.5, -3.0], to: [0.05, -3.0], color: 'ink2', width: 1.4 }, { from: [4.5, -3.0], to: [X - 0.05, -3.0], color: 'ink2', width: 1.4 },
        { from: [11.3, 0], to: [11.3, y], ...bracket }, { from: [11.3, 0], to: [11.3, -y], ...bracket },
        { from: [-0.4, -1.4], to: [-0.07, -0.34], color: 'ink3', width: 1.2 },
      ],
      points: [
        tag(-4.0, 1.55, 'light, wavelength λ', 'gold'), tag(-0.25, -1.65, 'slit, width a', 'ink2', 'right'),
        tag(4.5, -2.65, 'L', 'ink2', 'center'), tag(4.4, r6(4.4 * Math.tan(Math.atan2(y, X) / 2)), 'θ', 'violet'),
        tag(11.45, 0, span, 'gold'), tag(X - 0.15, y + 0.35, order === 1 ? 'first dark fringe' : 'second dark fringe', 'ink2', 'right'),
        { x: X, y: r6(y), r: 4, color: 'ink' }, { x: X, y: r6(-y), r: 4, color: 'ink' },
      ],
    },
    caption,
  };
}

/** The single-slit intensity against a sin θ / λ, dark wherever that is a whole number other than 0. */
function sincGraph(caption) {
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-3.6, 3.6], y: [0, 1.12], axesAt: 'edge', xlabel: 'a sin θ / λ: edge-to-edge path difference, in wavelengths', ylabel: 'I / I₀',
      curves: [{ fn: '(sin(pi*x + 1e-9)/(pi*x + 1e-9))^2', color: 'accent', width: 2.4 }],
      vlines: [-3, -2, -1, 1, 2, 3].map((m) => ({ x: m, color: 'ink3', label: `m = ${m < 0 ? '−' + -m : m}` })),
    },
    caption,
  };
}

/** The two factors of a two-slit pattern drawn separately: narrow-slit fringes and one slit's envelope (d = R·a). */
function twoFactors(R, caption) {
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-7.5, 7.5], y: [0, 1.15], axesAt: 'edge', xlabel: 'd sin θ / λ', ylabel: 'I / I₀', xticks: 15,
      curves: [
        { fn: 'cos(pi*x)^2', color: 'accent', width: 1.5 },
        { fn: `(sin(pi*x/${R} + 1e-9)/(pi*x/${R} + 1e-9))^2`, color: 'gold', width: 2.6, dash: true },
      ],
    },
    caption,
  };
}

/** A radar satellite's beam spreading to the ground between its first nulls, seen along the orbit (angle exaggerated). */
function sarPic(caption) {
  const h = 5.2, xf = 2.6;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-6.5, 6.5], y: [-0.9, 6.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: '0', lower: '-0.9', from: -7, to: 7, color: 'good', alpha: 0.12 }],
      curves: [
        seg([-7, 0], [7, 0], { color: 'ink3', width: 1.2 }),
        seg([-0.95, h], [0.95, h], { color: 'ink', width: 5 }),
        seg([0, h], [-xf, 0], { color: 'gold', width: 1.4, dash: true }), seg([0, h], [xf, 0], { color: 'gold', width: 1.4, dash: true }),
        seg([0, h], [0, 0], { color: 'ink3', width: 1, dash: true }),
        seg([-xf, 0], [xf, 0], { color: 'bad', width: 4 }),
      ],
      arrows: [{ from: [1.4, h + 0.55], to: [3.2, h + 0.55], color: 'ink2', width: 1.6, label: 'orbit', labelDx: 6, labelDy: 0 }],
      points: [
        tag(-1.15, h, 'antenna, 12.3 m', 'ink', 'right'), tag(0.15, 2.4, '850 km', 'ink3'),
        tag(-xf - 0.2, 1.0, 'first null', 'gold', 'right'), tag(xf + 0.2, 1.0, 'first null', 'gold'),
        tag(0, -0.5, 'strip between the nulls', 'bad', 'center'),
      ],
    },
    caption,
  };
}

/** Spreading through an opening: sound through a doorway (a = 0.9λ) against a slit 20 wavelengths wide. */
function doorPic(caption) {
  const f = (A) => `(sin(pi*${A}*sin(x*pi/180) + 1e-9)/(pi*${A}*sin(x*pi/180) + 1e-9))^2`;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-90, 90], y: [0, 1.12], axesAt: 'edge', xlabel: 'angle from straight ahead (°)', ylabel: 'I / I₀', xticks: 7,
      curves: [{ fn: f(0.9), color: 'gold', width: 2.6 }, { fn: f(20), color: 'accent', width: 2 }],
      points: [tag(30, 0.62, 'sound, doorway 0.9λ wide', 'gold'), tag(7, 1.05, '← opening 20λ wide', 'accent')],
    },
    caption,
  };
}

const y1 = (a, lam, L) => r6(1e3 * L * Math.tan(Math.asin(lam / a)));   // mm, first dark fringe on a screen

export default lesson({
  id: 'phys2220.O4.1',
  title: 'Single-slit diffraction',
  minutes: 14, difficulty: 2,
  intro: t`Send a laser through one narrow slit and it does not make a sharp line on the screen beyond: it spreads into a bright **central maximum** with fainter bands either side. Every strip of the slit sends out its own wavelets. Toward an angle $\theta$, light from one edge of the slit travels $a\sin\theta$ farther than light from the other. When that is one wavelength, pair each strip in the upper half of the slit with the strip half a slit-width below it: every pair is half a wavelength apart and cancels — a dark fringe. In general the light cancels where

$$a\sin\theta = m\lambda \qquad (m = \pm1, \pm2, \ldots)$$

with no $m = 0$: straight ahead, everything arrives in step, so the centre is bright. A narrower slit spreads the light *more*.`,
  symbols: [
    { tex: 'a', text: 'the slit width, in m — compare $d$, the spacing between two slits' },
    { tex: '\\theta', text: 'the angle from the straight-ahead direction' },
    { tex: 'm', text: 'the order of a dark fringe: ±1 for the first on either side of the centre, ±2 for the next, and so on — never 0' },
    { tex: '\\lambda', text: 'the wavelength, in the same unit as $a$' },
    { tex: 'a\\sin\\theta', text: 'the path difference between light from the slit’s two edges' },
  ],
  why: t`Diffraction is why no beam stays perfectly narrow: light, radio or sound leaving an opening of width $a$ spreads through an angle of about $\lambda/a$. It sets the [sharpness of every telescope](#/lesson/phys2220.O4.3) and the width of every radar beam — and for electrons squeezed through a slit, it is the [uncertainty principle](#/lesson/phys2220.Q1.4) at work.`,
  visual: {
    type: 'optics-waves',
    title: 'Light through one slit',
    lead: t`Top: the pattern on a screen. Middle: its intensity. Right: at the draggable probe, the phasors — one small arrow for each strip across the slit — added head to tail. The gold arrow is their sum; its length squared is the brightness.`,
    tasks: [
      'The probe starts at the first dark fringe: there the strips’ phasors curl once round a closed circle and add up to nothing. From edge to edge, the path difference is exactly one wavelength.',
      'Halve the slit width: the central maximum doubles in width. A narrower slit spreads the light more, not less.',
      'Drag the probe to the middle of the first side band: the chain winds round one and a half times, and only a short sum is left over. The side bands are under 5% as bright as the centre.',
      'Switch to white light: each colour makes its own pattern, red the widest, so the edges of the central band are coloured.',
    ],
    params: { mode: 'slits', N: 1, a: 40, lambda: 633, L: 1, controls: ['a', 'lambda', 'L', 'light'] },
  },
  example: {
    prompt: t`Yellow sodium light ($\lambda = 589$ nm) passes through a slit $0.10$ mm wide onto a screen $1.5$ m away. (a) At what angle is the first dark fringe? (b) How wide is the central maximum on the screen? (c) How far from the centre is the second dark fringe?`,
    visual: slitsPic({ N: 1, a: 100, lambda: 589, L: 1.5, marks: 'single' }, 'The pattern on the screen, with the dark fringes marked by their order m.'),
    steps: [
      { label: 'First dark fringe', text: t`$\sin\theta_1 = \dfrac{\lambda}{a} = \dfrac{589\times10^{-9}\ \text{m}}{0.10\times10^{-3}\ \text{m}} = 5.89\times10^{-3}$, so $\theta_1 = 0.337°$.` },
      { label: 'Central maximum', text: t`The angle is small, so on the screen $y_1 = L\tan\theta_1 \approx \dfrac{\lambda L}{a} = 8.8$ mm. The central maximum runs from $-y_1$ to $+y_1$: $w = \dfrac{2\lambda L}{a} = 17.7$ mm.` },
      { label: 'Second dark fringe', text: t`$a\sin\theta_2 = 2\lambda$, so $y_2 \approx \dfrac{2\lambda L}{a} = 17.7$ mm. Each side band is 8.8 mm wide: half the width of the central one.` },
      { label: 'Sense check', text: t`The slit is $a/\lambda = 170$ wavelengths wide, and the light spreads by about $1/170$ of a radian either side. A slit thousands of wavelengths wide would barely spread it at all.` },
    ],
    answer: t`(a) $0.337°$; (b) $17.7$ mm; (c) $17.7$ mm from the centre.`,
  },
  practice: [
    num({
      id: 'first-zero', difficulty: 1,
      gen(r) {
        const lam = r.pick([450, 532, 633]), a = r.pick([4, 8, 20]);
        const s = (lam * 1e-3) / a, key = asind(s);
        return {
          prompt: t`Light of wavelength ${lam} nm passes through a slit ${a} µm wide. At what angle from the straight-ahead direction is the first dark fringe?`,
          answer: key, units: 'deg', tol: { rel: 0.01 },
          errors: apart([
            { value: asind(s / 2), feedback: t`Half that angle is where two slits a distance $a$ apart would first go dark. For one slit, the first dark fringe is where light from its two *edges* differs by a whole wavelength: $a\sin\theta = \lambda$.` },
            { value: asind(2 * s), feedback: t`That is the second dark fringe, $m = 2$. The first has $a\sin\theta = \lambda$.` },
          ], key),
          hints: [t`Dark fringes: $a\sin\theta = m\lambda$, and the first is $m = 1$.`, t`$\sin\theta = \lambda/a$, with both in metres.`],
          teach: 'The first dark fringe of a single slit is where light from the two edges differs in path by one wavelength: a sin θ = λ.',
          explain: t`$\sin\theta = \dfrac{\lambda}{a} = \dfrac{${lam}\times10^{-9}}{${a}\times10^{-6}} = ${tn(s)}$, so $\theta = ${tn(key)}°$.`,
          visual: slitsPic({ N: 1, a, lambda: lam, L: 1 }, 'The pattern this slit makes on a screen 1 m away. The angle of each fringe does not depend on where the screen is.'),
        };
      },
    }),
    mcq({
      id: 'narrower', difficulty: 1,
      prompt: 'This pattern comes from a slit 40 µm wide. The slit is narrowed to 20 µm. What happens to the pattern?',
      choices: [
        'The central bright band becomes twice as wide',
        'The central bright band becomes half as wide, like the slit',
        'It stays the same width but gets dimmer',
        'It disappears: the slit is now too narrow for light to pass',
      ],
      answer: 0,
      why: {
        1: 'That is what a stream of particles would do: a narrower opening, a narrower patch. Waves do the opposite — the dark fringes sit at sin θ = λ/a, so a smaller a means larger angles.',
        2: 'It does get dimmer, since less light gets through, but the angles λ/a double, so the pattern spreads too.',
        3: 'A slit narrower than the light’s wavelength still lets light through; it just spreads it in every direction.',
      },
      hints: ['Where is the first dark fringe? Write it in terms of a.', 'sin θ = λ/a: what happens when a halves?'],
      teach: 'Narrower slit, wider pattern: the angles of the dark fringes scale as λ/a.',
      explain: t`The first dark fringe is at $\sin\theta = \lambda/a$: halving $a$ doubles the angle, so the central band doubles in width (and, with half as much light getting through, spread twice as wide, it is dimmer too). Squeezing a wave through a smaller opening spreads it more.`,
      visual: slitsPic({ N: 1, a: 40, lambda: 633, L: 1 }, 'The pattern from a slit 40 µm wide, on a screen 1 m away.'),
    }),
    num({
      id: 'central-width', difficulty: 2,
      gen(r) {
        const lam = r.pick([532, 633, 650]), a = r.pick([50, 80, 120]), L = r.pick([1.5, 2.0, 3.0]);
        const key = ((2 * lam * 1e-9 * L) / (a * 1e-6)) * 1e3;
        return {
          prompt: t`Light of wavelength ${lam} nm passes through a slit ${a} µm wide onto a screen ${L.toFixed(1)} m away. How wide is the central bright band on the screen, in mm?`,
          answer: key, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: key / 2, feedback: t`That is the distance from the centre to one first dark fringe. The central band runs from the first dark fringe on one side to the first on the other: twice that.` }],
          hints: [t`The first dark fringes are at $\sin\theta = \pm\lambda/a$; at small angles they sit $y = \lambda L/a$ either side of the centre.`, t`The central band spans both: $w = 2\lambda L/a$.`],
          teach: 'The central maximum is 2λL/a wide on a screen at distance L: twice as wide as each side band.',
          explain: t`$w = \dfrac{2\lambda L}{a} = \dfrac{2(${lam}\times10^{-9})(${L.toFixed(1)})}{${a}\times10^{-6}} = ${tn(key)}$ mm, twice the width of each side band.`,
          visual: slitGeom({ caption: 'A slit and its screen from above (not to scale): the central bright band, width w, runs between the first dark fringes on either side.' }),
        };
      },
    }),
    num({
      id: 'measure-slit', difficulty: 2,
      gen(r) {
        const lam = r.pick([650, 532]), L = r.pick([1.2, 2.0]), a0 = r.pick([60, 90, 150]);
        const w = Math.round(((2 * lam * 1e-9 * L) / (a0 * 1e-6)) * 1e4) / 10;   // mm, as measured
        const key = ((2 * lam * 1e-9 * L) / (w * 1e-3)) * 1e6;               // µm
        return {
          prompt: t`A ${lam} nm laser shines through a narrow slit onto a wall ${L.toFixed(1)} m away. The first dark fringes on either side of the central bright band are ${w} mm apart. How wide is the slit, in micrometres?`,
          answer: key, units: 'µm', tol: { rel: 0.01 },
          errors: [{ value: key / 2, feedback: t`The ${w} mm spans the central band from one dark fringe to the other, so each is half that from the centre: $a = \lambda L/(w/2) = 2\lambda L/w$.` }],
          hints: [t`Each first dark fringe is $w/2$ from the centre, at $\sin\theta \approx (w/2)/L$.`, t`$a = \lambda/\sin\theta = 2\lambda L/w$.`],
          teach: 'Run the pattern backwards to measure a slit: a = 2λL/w.',
          explain: t`$a = \dfrac{2\lambda L}{w} = \dfrac{2(${lam}\times10^{-9})(${L.toFixed(1)})}{${w}\times10^{-3}} = ${tn(key)}\ \mu\text{m}$ — a hair's width, measured with a ruler and a laser.`,
          visual: slitsPic({ N: 1, a: a0, lambda: lam, L, marks: 'single' }, 'The pattern on the wall, with the dark fringes marked by their order m.'),
        };
      },
    }),
    num({
      id: 'half-angle', difficulty: 3,
      gen(r) {
        const [f, words, part] = r.pick([[0.5, t`at $\tfrac12\theta_1$, halfway out to that dark fringe`, 'half'], [0.25, t`at $\tfrac14\theta_1$, a quarter of the way out`, 'a quarter'], [0.75, t`at $\tfrac34\theta_1$, three quarters of the way out`, 'three quarters']]);
        const b = f * Math.PI, key = (Math.sin(b) / b) ** 2;
        return {
          prompt: t`A single slit's first dark fringe is at a small angle $\theta_1$. How bright is its pattern ${words}, as a fraction of the brightness at the centre? (The phasors from strips across the slit turn through one full circle at the first dark fringe.)`,
          answer: key, tol: { rel: 0.02 },
          errors: apart([{ value: 1 - f, feedback: 'The brightness does not fall in a straight line to zero. The phasor chain bends into an arc, and the brightness is the square of the chord across it.' }], key),
          hints: [t`There the phasors turn through ${part} of a circle: they lie along an arc, and their sum is its chord.`, t`In formula form: $\dfrac{I}{I_0} = \left(\dfrac{\sin\beta}{\beta}\right)^2$ with $\beta = \dfrac{\pi a\sin\theta}{\lambda}$, which is $\pi$ at the first dark fringe.`, t`Here $\beta = ${f}\pi$.`],
          teach: 'A single slit’s intensity is I₀(sin β/β)², β = πa sin θ/λ: the chord of a bent phasor chain, squared.',
          explain: t`$\beta = ${f}\pi = ${tn(b)}$ rad, so $\dfrac{I}{I_0} = \left(\dfrac{\sin\beta}{\beta}\right)^2 = ${tn(key)}$.${f === 0.5 ? t` The phasors form a semicircle: its diameter is $2/\pi$ of its length, and $(2/\pi)^2 = 0.405$.` : ''}`,
          visual: slitsPic({ N: 1, a: 40, lambda: 633, L: 1, phasors: true, probe: y1(40e-6, 633e-9, 1) }, 'At the first dark fringe, the phasors from strips across the slit turn once round a circle and sum to zero (the gold sum shrinks to a dot).'),
        };
      },
    }),
    num({
      id: 'second-dark', difficulty: 2,
      gen(r) {
        const lam = r.pick([633, 532]), a = r.pick([2.0, 2.5, 3.0]), m = r.pick([2, 3]);
        const s = (m * lam * 1e-3) / a, key = asind(s);
        return {
          prompt: t`A slit ${a.toFixed(1)} µm wide is lit with ${lam} nm light. At what angle is the order $m = ${m}$ dark fringe? (The angle is not small.)`,
          answer: key, units: 'deg', tol: { rel: 0.01 },
          errors: apart([
            { value: (s * 180) / Math.PI, feedback: t`That takes $\theta \approx \sin\theta$, which only works at small angles. Here use $\theta = \arcsin(m\lambda/a)$.` },
            { value: asind(s / m), feedback: t`That is the first dark fringe. The order $m = ${m}$ fringe has $a\sin\theta = ${m}\lambda$.` },
          ], key),
          hints: [t`$a\sin\theta = m\lambda$ with $m = ${m}$.`, t`$\sin\theta = ${m}\lambda/a$, then take the arcsine.`],
          teach: 'Dark fringes at a sin θ = mλ hold at any angle; only the shortcut θ ≈ sin θ needs small angles.',
          explain: t`$\sin\theta = \dfrac{${m}(${lam}\times10^{-9})}{${a.toFixed(1)}\times10^{-6}} = ${tn(s)}$, so $\theta = ${tn(key)}°$. The small-angle shortcut would give ${tn((s * 180) / Math.PI)}°.`,
          visual: sincGraph('The single-slit pattern against a sin θ / λ, the path difference between the slit’s edges in wavelengths: dark wherever it is a whole number other than zero.'),
        };
      },
    }),
    mcq({
      id: 'missing-order', difficulty: 3,
      prompt: 'Two slits, each 0.10 mm wide, are 0.30 mm apart (centre to centre). The graph shows the two ingredients of their pattern separately. Which of the two-slit bright fringes are missing from the real pattern?',
      choices: [
        'The orders m = ±3, ±6, …, where one slit’s own pattern is dark',
        'Only the orders m = ±1, beside the centre',
        'None: two slits always give every bright fringe',
        'Every odd order: m = ±1, ±3, ±5, …',
      ],
      answer: 0,
      why: {
        1: 'At m = ±1, d sin θ = λ and a sin θ = λ/3: one slit’s envelope is still at 68% there, so the fringe is bright.',
        2: 'Each slit’s light follows its own single-slit pattern. Where that is zero, neither slit sends any light, so there is nothing to interfere.',
        3: 'Orders go missing only where a sin θ is a whole number of wavelengths: for d = 3a, that is m = 3, 6, 9, ….',
      },
      hints: ['The real pattern is the product of the two curves.', 'Where does an envelope zero land on a bright fringe?'],
      teach: 'A two-slit pattern is narrow-slit fringes times one slit’s diffraction envelope; a bright fringe landing on an envelope zero goes missing.',
      explain: t`Bright fringes need $d\sin\theta = m\lambda$; the envelope is dark where $a\sin\theta$ is a whole number of wavelengths. With $d = 3a$, the fringe $m = 3$ falls exactly where $a\sin\theta = \lambda$ — the envelope's first zero — so it vanishes, and so do $m = \pm6, \pm9, \ldots$.`,
      visual: twoFactors(3, 'Blue: the two-slit fringes if the slits were very narrow, bright at d sin θ = mλ. Gold, dashed: one slit’s own diffraction pattern, the envelope. The real pattern is their product.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-slit', difficulty: 2,
      gen(r) {
        const lam = r.pick([633, 532]), L = r.pick([2.0, 2.5]), a0 = r.pick([0.15, 0.2, 0.25]);
        const D = Math.round(((4 * lam * 1e-9 * L) / (a0 * 1e-3)) * 1e4) / 10;   // mm
        const key = ((4 * lam * 1e-9 * L) / (D * 1e-3)) * 1e3;               // mm
        return {
          prompt: t`On a screen ${L.toFixed(1)} m from a single slit lit at ${lam} nm, the two *second* dark fringes, one on each side of the centre, are ${D} mm apart. How wide is the slit, in mm?`,
          answer: key, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: key / 2, feedback: t`Those are the second dark fringes: each is $2\lambda L/a$ from the centre, so $D = 4\lambda L/a$.` }],
          hints: [t`Each second dark fringe is $D/2$ from the centre, where $a\sin\theta = 2\lambda$.`],
          teach: 'The m-th dark fringes sit at y = mλL/a either side of the centre (small angles).',
          explain: t`$y_2 = D/2 = ${tn(D / 2)}$ mm $= 2\lambda L/a$, so $a = \dfrac{4\lambda L}{D} = \dfrac{4(${lam}\times10^{-9})(${L.toFixed(1)})}{${D}\times10^{-3}} = ${tn(key)}$ mm.`,
          visual: slitGeom({ order: 2, span: 'D', caption: 'The slit and its screen from above (not to scale): D is the distance between the two second dark fringes.' }),
        };
      },
    }),
    num({
      id: 'cp-sar', difficulty: 3, transfer: true,
      prompt: t`The radar on ESA's Sentinel-1 satellites sends 5.55 cm microwaves from an antenna 12.3 m long. Treat the antenna as a single slit 12.3 m wide. Along the satellite's orbit, the beam spreads out to its first nulls — its first dark fringes — on either side. How long is the strip of ground between those nulls, 850 km away? Answer in km.`,
      answer: 2 * 850 * Math.tan(Math.asin(0.0555 / 12.3)), units: 'km', tol: { rel: 0.01 },
      errors: [
        { value: 850 * Math.tan(Math.asin(0.0555 / 12.3)), feedback: 'That is from the beam’s centre to one null. The strip runs from null to null: twice that.' },
        { value: 2 * 850 * Math.tan(Math.asin(0.0555 / 12.3)) * 1000, feedback: 'Check the units: 850 km times an angle in radians gives km.' },
      ],
      hints: [t`$\sin\theta = \lambda/a = 0.0555/12.3$.`, t`On the ground the null is $R\tan\theta$ from the centre, with $R = 850$ km.`],
      teach: 'An antenna of width a sends a beam spreading to about λ/a either side: diffraction sets every radar’s footprint.',
      explain: t`$\sin\theta = \dfrac{0.0555}{12.3} = 4.51\times10^{-3}$, so $\theta = 0.259°$ either side, and the strip is $2R\tan\theta = 2(850\ \text{km})(4.51\times10^{-3}) = ${tn(2 * 850 * Math.tan(Math.asin(0.0555 / 12.3)))}$ km long. A plain radar with this antenna would blur everything in that strip together. Synthetic-aperture radar records the echoes for the whole time a point stays inside the beam and combines them, as if from an antenna kilometres long, to see details about 20 m apart along the track in Sentinel-1's main mode. (A real antenna is not evenly lit like a slit, so its nulls sit a little differently.)`,
      visual: sarPic('A radar satellite’s beam seen along its orbit (simplified: the spreading angle is drawn hugely exaggerated, and the real beam looks sideways, not straight down).'),
    }),
    mcq({
      id: 'cp-sound', difficulty: 2, transfer: true,
      prompt: 'Through an open doorway 0.9 m wide you can hear someone talking in the next room even when you stand well to one side, but you cannot see them. Why does sound spread round the doorway when light does not?',
      choices: [
        'Speech’s wavelengths, around a metre, match the doorway’s width; light’s are a million times smaller',
        'Sound waves are longitudinal, and only longitudinal waves can diffract round edges',
        'Light travels in straight lines because it is a stream of particles',
        'Sound reflects off the walls and ceiling; diffraction plays no part',
      ],
      answer: 0,
      why: {
        1: 'Light diffracts too — every pattern in this lesson is light. Longitudinal or transverse does not decide it; the ratio of wavelength to opening does.',
        2: 'Light makes diffraction patterns just as sound does; its wavelength is simply tiny compared with a doorway.',
        3: 'Reflections help, but even outdoors, sound spreads widely from an opening its own size. That spreading is diffraction.',
      },
      hints: ['How does the spreading angle depend on λ and a?', 'Compare λ/a for sound and for light through the same doorway.'],
      teach: 'How much a wave spreads through an opening depends on λ/a: comparable sizes spread widely, tiny wavelengths barely at all.',
      explain: t`For 1 m sound waves through a 0.9 m doorway, $\lambda/a > 1$: there is no dark fringe at all, and at $45°$ the sound is still about 20% as intense as straight ahead. For green light, $\lambda/a = \dfrac{550\times10^{-9}}{0.9} = 6\times10^{-7}$: the first dark fringe is $6\times10^{-7}$ rad from straight ahead, a few hundred-thousandths of a degree.`,
      visual: doorPic('Gold: sound through a doorway 0.9 wavelengths wide, spreading to every angle. Blue: an opening 20 wavelengths wide, already confined to a few degrees. For light, a doorway is about 1.6 million wavelengths wide.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §4.1 Single-Slit Diffraction', url: 'https://openstax.org/books/university-physics-volume-3/pages/4-1-single-slit-diffraction' },
    { label: 'OpenStax University Physics Vol. 3, §4.2 Intensity in Single-Slit Diffraction', url: 'https://openstax.org/books/university-physics-volume-3/pages/4-2-intensity-in-single-slit-diffraction' },
    { label: 'OpenStax University Physics Vol. 3, §4.3 Double-Slit Diffraction', url: 'https://openstax.org/books/university-physics-volume-3/pages/4-3-double-slit-diffraction' },
    { label: 'ESA: Sentinel-1 (C-band radar, 12.3 m antenna, 5.405 GHz)', url: 'https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-1' },
  ],
});
