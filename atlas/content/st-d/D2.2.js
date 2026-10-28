// Möbius transformations M(z) = (az + b)/(cz + d): the maps built from
// translations, turn-and-stretches and the inversion 1/z. They send circles
// and lines to circles and lines, compose like 2×2 matrices, are fixed by
// three points — and they are exactly what a Lorentz transformation does to
// the sky: PSL(2, C) ≅ SO⁺(1, 3).
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, r6, cTeX, num as nm, deg, argand, cxmap, apart } from './_cx.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the Cayley map (z − i)/(z + i)
const CAY = { a: [1, 0], b: [0, -1], c: [1, 0], d: [0, 1] };
const cayley = (z) => M.value('mobius', z, CAY);

// the sky in stereographic coordinates ζ = tan(θ/2) e^{iφ}: θ from straight ahead
const RING = [[60, 'violet'], [90, 'gold'], [120, 'teal']];
const STARS = [[25, 40], [40, 200], [55, 120], [70, 300], [100, 20], [110, 160], [135, 250], [150, 80], [165, 200], [80, 230], [125, 340]];
const sky = (beta, { slider = false, caption, labels = true } = {}) => cxmap({
  f: 'mobius', a: slider ? ['sqrt((1 - beta)/(1 + beta))', 0] : [r6(Math.sqrt((1 - beta) / (1 + beta))), 0],
  ...(slider ? { sliders: [{ key: 'beta', label: t`Speed $\beta = v/c$`, min: 0, max: 0.95, step: 0.01, value: beta, explain: 'The ship’s speed as a fraction of the speed of light, straight toward the centre of the picture.' }] } : {}),
  layout: 'same', x: [-3.2, 3.2], y: [-2.2, 2.2], grid: 'none', drag: false, ticks: false,
  curves: RING.map(([th, color]) => ({ param: [`${r6(Math.tan(th * DEG / 2))}*cos(t)`, `${r6(Math.tan(th * DEG / 2))}*sin(t)`], t: [0, 6.2832], color, ...(labels ? { label: `${th}°` } : {}) })),
  points: STARS.map(([th, ph]) => { const z = M.stereo(th * DEG, ph * DEG); return { x: r6(z[0]), y: r6(z[1]), color: 'ink' }; }),
}, caption);

export default lesson({
  id: 'st-d.D2.2',
  title: 'Möbius transformations',
  minutes: 13, difficulty: 3,
  intro: t`A **Möbius transformation** is a ratio of two linear functions,

$$M(z) = \frac{az + b}{cz + d}, \qquad ad - bc \ne 0$$

It is built from three moves you already know: slide ($z + k$), turn-and-stretch ($kz$), and **inversion** $z \mapsto 1/z$, which turns the plane inside out — $0$ goes to infinity and infinity comes back to $0$. So the plane gets one extra point, $\infty$; think of it as the north pole of a sphere (the **Riemann sphere**) that the plane wraps around. On that sphere every Möbius map is one-to-one, and it has a famous property: **it sends circles to circles**, where a straight line counts as a circle through $\infty$.`,
  symbols: [
    { tex: 'a,\\ b,\\ c,\\ d', text: t`complex constants. Multiplying all four by the same number changes nothing, so a Möbius map has three complex degrees of freedom` },
    { tex: 'ad - bc', text: t`the determinant; if it were $0$ the map would be constant` },
    { tex: t`-d/c`, text: t`the **pole**: the point sent to $\infty$ (when $c \ne 0$)` },
    { tex: t`a/c`, text: t`the image of $\infty$: where points far away all end up` },
    { tex: t`\infty`, text: t`the point at infinity, added so that $1/0 = \infty$ and $1/\infty = 0$ make sense — the north pole of the Riemann sphere` },
  ],
  why: t`Möbius maps are the conformal maps of the whole sphere, the tool for mapping a half-plane onto a disc in potential problems — and the Lorentz transformations of special relativity act on the sky exactly as Möbius maps.`,
  visual: {
    type: 'cx-map',
    title: 'Lines bend into circles',
    lead: t`The map $M(z) = \dfrac{z}{cz + 1}$. With $c = 0$ it does nothing. Move $c$ away from $0$: the pole $-1/c$ appears in the $z$-plane, and every grid line becomes a circle in the $w$-plane, all of them passing through one point, $M(\infty) = 1/c$.`,
    tasks: [
      t`Set $c = 0.5$ (and $\operatorname{Im} c = 0$): the lines are now circles, all meeting at $w = 2$, the image of $\infty$.`,
      t`Drag $z$ near the pole $z = -1/c$: its image flies off to infinity.`,
      t`Watch any grid crossing: the circles still meet at right angles.`,
    ],
    params: {
      f: 'mobius', a: [1, 0], b: [0, 0], c: ['cr', 'ci'], d: [1, 0],
      sliders: [
        { key: 'cr', label: t`$\operatorname{Re} c$`, min: -1, max: 1, step: 0.05, value: 0.35, explain: t`Real part of $c$, the coefficient that bends lines into circles.` },
        { key: 'ci', label: t`$\operatorname{Im} c$`, min: -1, max: 1, step: 0.05, value: 0, explain: t`Imaginary part of $c$; it turns where the pole sits.` },
      ],
      x: [-2, 2], y: [-2, 2], wx: [-3, 3], wy: [-3, 3], grid: 'cartesian', gn: 9, drag: { x: 1, y: 0.6 }, readout: ['z', 'w'],
    },
    caption: t`Exact images of the grid lines (from $-2$ to $2$ each way). A line through the pole would go off to infinity, the lines’ images are pieces of circles through $1/c$.`,
  },
  example: {
    prompt: t`Show that the Cayley map $M(z) = \dfrac{z - i}{z + i}$ sends the real axis onto the unit circle, and the upper half-plane into the unit disc.`,
    visual: cxmap({ f: 'mobius', ...CAY, x: [-2.5, 2.5], y: [-0.3, 2.5], wx: [-1.6, 1.6], wy: [-1.6, 1.6], grid: 'cartesian', gx: [-2.5, 2.5], gy: [0, 2.5], gn: 7, drag: false, points: [{ x: 0, y: 0, label: '0', wlabel: '−1' }, { x: 1, y: 0, label: '1', wlabel: '−i' }, { x: 0, y: 1, label: 'i', wlabel: '0', color: 'gold' }] }, t`Part of the upper half-plane (left) and its image: inside the unit disc. The real axis (blue, along the bottom) lands on the unit circle.`),
    steps: [
      { label: 'Three points', text: t`$M(0) = \dfrac{-i}{i} = -1$, $\;M(1) = \dfrac{1 - i}{1 + i} = \dfrac{(1 - i)^2}{2} = -i$, $\;M(\infty) = \dfrac{1}{1} = 1$ (divide top and bottom by $z$).` },
      { label: 'Circle through them', text: t`The real axis is a “circle” through $0$, $1$ and $\infty$, so its image is the circle through $-1$, $-i$ and $1$: the unit circle. Check any real $x$: $|x - i| = |x + i|$ (both are $\sqrt{x^2 + 1}$), so $|M(x)| = 1$. ✓` },
      { label: 'Which side', text: t`One point decides the side: $M(i) = 0$, inside the circle. The upper half-plane goes inside, the lower outside.` },
      { label: 'Why', text: t`$|M(z)| = \dfrac{|z - i|}{|z + i|}$ is the ratio of the distances from $z$ to $i$ and to $-i$ — less than 1 exactly when $z$ is nearer $i$, that is, above the real axis.` },
    ],
    answer: t`The real axis maps onto $|w| = 1$ and the upper half-plane onto $|w| < 1$. Any problem posed on a half-plane can be moved to a disc and back.`,
  },
  practice: [
    mcq({
      id: 'line-to-circle', difficulty: 2,
      prompt: t`Under inversion $w = 1/z$, what is the image of the vertical line $\operatorname{Re} z = 1$?`,
      visual: argand({ curves: [{ param: ['1', 't'], t: [-3, 3], color: 'violet', label: 'Re z = 1', labelAt: 1.6 }], pts: [{ z: [1, 0], label: '1', color: 'violet' }, { z: [0, 0], label: '0', color: 'ink2' }], circles: [{ r: 1 }], view: 1.6, caption: t`The line $\operatorname{Re} z = 1$, with the unit circle (dashed) for reference.` }),
      choices: [t`The circle through $0$ with centre $\tfrac12$ and radius $\tfrac12$`, t`The line $\operatorname{Re} w = 1$`, t`The unit circle $|w| = 1$`, t`The line $\operatorname{Re} w = \tfrac12$`],
      answer: 0,
      why: {
        1: 'Inversion moves points: 1 + i goes to (1 − i)/2, which is not on that line.',
        2: t`Only the point $1$ of the line has $|z| = 1$; its far points have $|z| \to \infty$, so their images crowd toward $0$.`,
        3: t`A line not through $0$ cannot stay a line: its point at $\infty$ goes to $0$, so the image passes through $0$ and is bounded — a circle.`,
      },
      hints: [t`Where do the line’s far-away points go under $1/z$?`, t`$1 \mapsto 1$, $\infty \mapsto 0$, and $1 + i \mapsto \tfrac{1 - i}{2}$. Which circle passes through these three?`],
      teach: 'Inversion sends a line not through 0 to a circle through 0 (and vice versa): the line’s point at infinity goes to 0.',
      explain: t`With $z = 1 + iy$: $w = \dfrac{1 - iy}{1 + y^2}$, and $|w - \tfrac12|^2 = \tfrac14$ for every $y$. The image is the circle centred $\tfrac12$ with radius $\tfrac12$, through $0$ (the image of $\infty$) and $1$.`,
    }),
    {
      type: 'point', id: 'cayley-value', difficulty: 2,
      gen(r) {
        const z = r.pick([[1, 0], [-1, 0], [2, 0], [0, 2], [1, 1], [0, 3], [-1, 1]]);
        const w = cayley(z);
        return {
          prompt: t`Drag the gold point to $M(z)$ for the Cayley map $M(z) = \dfrac{z - i}{z + i}$ at $z = ${cTeX(z)}$.`,
          visual: (() => { const v = argand({ pts: [{ z, label: 'z', color: 'accent' }], circles: [{ r: 1 }], view: 3.2, caption: 'The point z and the unit circle (dashed).' }); v.params.drag = [{ key: 'p', x: 2.6, y: -2.4, snap: 0.05 }]; return v; })(),
          answer: { x: r6(w[0]), y: r6(w[1]) }, tol: { x: 0.12, y: 0.12 },
          instruction: 'Drag the point to M(z), then check.',
          hints: [t`$|M(z)|$ is the distance from $z$ to $i$ divided by the distance from $z$ to $-i$.`, t`Compute it: $\dfrac{${cTeX(M.sub(z, [0, 1]))}}{${cTeX(M.add(z, [0, 1]))}}$; multiply top and bottom by the conjugate of the bottom.`],
          teach: 'Evaluate a Möbius map by complex division: multiply by the conjugate of the denominator.',
          explain: t`$M(${cTeX(z)}) = ${cTeX(w)}$, of modulus $${nm(M.abs(w), 3)}$${Math.abs(z[1]) < 1e-9 ? ' — on the unit circle, as every real z must be' : ' — inside the unit disc, as every point of the upper half-plane must be'}.`,
        };
      },
    },
    num({
      id: 'image-of-infinity', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3, -2]), b = r.pick([1, -1, 2]), c = r.pick([2, 4, -1]), d = r.pick([1, 3, -2]);
        const ans = a / c;
        const bad = a * d - b * c === 0;
        const [A, B, Cc, D] = bad ? [a + 1, b, c, d] : [a, b, c, d];
        const val = A / Cc;
        return {
          prompt: t`Where does $M(z) = \dfrac{${A}z ${B < 0 ? '-' : '+'} ${Math.abs(B)}}{${Cc}z ${D < 0 ? '-' : '+'} ${Math.abs(D)}}$ send the point at infinity? (Give the real number $M(\infty)$.)`,
          visual: cxmap({ f: 'mobius', a: [A, 0], b: [B, 0], c: [Cc, 0], d: [D, 0], x: [-2, 2], y: [-2, 2], wx: [-3, 3], wy: [-3, 3], grid: 'cartesian', gn: 9, drag: false, ticks: false }, 'The grid and its image (axes without numbers): the far-out parts of the grid lines crowd toward one point.'),
          answer: val, tol: { rel: 1e-3, abs: 1e-3 },
          errors: apart(val, [{ value: -D / Cc, feedback: t`That is the pole, the point that goes **to** infinity. The image **of** infinity is where $M(z)$ settles as $|z| \to \infty$.` }, { value: B / D, feedback: t`That is $M(0)$.` }]),
          hints: [t`Divide top and bottom by $z$: $M(z) = \dfrac{${A} ${B < 0 ? '-' : '+'} ${Math.abs(B)}/z}{${Cc} ${D < 0 ? '-' : '+'} ${Math.abs(D)}/z}$.`, t`As $|z| \to \infty$, the terms with $1/z$ vanish.`],
          teach: t`$M(\infty) = a/c$ and the pole is $z = -d/c$.`,
          explain: t`$M(\infty) = ${A}/${Cc} = ${nm(val, 3)}$: every grid line’s image passes through it. (The pole, sent to $\infty$, is $z = ${nm(-D / Cc, 3)}$.)`,
        };
      },
    }),
    mcq({
      id: 'compose', difficulty: 3,
      prompt: t`A Möbius map can be stored as its matrix $\begin{bmatrix} a & b \\ c & d \end{bmatrix}$. Let $T(z) = z + 2$, matrix $\begin{bmatrix} 1 & 2 \\ 0 & 1 \end{bmatrix}$, and $J(z) = 1/z$, matrix $\begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}$. Which matrix belongs to “first $T$, then $J$”, the map $z \mapsto \dfrac{1}{z + 2}$?`,
      visual: cxmap({ f: 'mobius', a: [0, 0], b: [1, 0], c: [1, 0], d: [2, 0], x: [-2, 2], y: [-2, 2], wx: [-2, 2], wy: [-2, 2], grid: 'cartesian', gn: 9, drag: false }, t`The composite map $1/(z + 2)$ acting on the grid.`),
      choices: [t`$\begin{bmatrix} 0 & 1 \\ 1 & 2 \end{bmatrix}$`, t`$\begin{bmatrix} 2 & 1 \\ 1 & 0 \end{bmatrix}$`, t`$\begin{bmatrix} 1 & 3 \\ 1 & 1 \end{bmatrix}$`, t`$\begin{bmatrix} 0 & 2 \\ 0 & 0 \end{bmatrix}$`],
      answer: 0,
      why: {
        1: t`That is $T\circ J$ in the opposite order, $2 + 1/z = \frac{2z + 1}{z}$: matrix products, like maps, do not commute.`,
        2: 'Composition is a matrix product, not a sum.',
        3: 'Multiplying entry by entry gives a matrix with zero determinant — a constant map, not a composition.',
      },
      hints: [t`Write $\frac{1}{z + 2}$ in the form $\frac{az + b}{cz + d}$ and read off the matrix.`, t`It equals the product $J\,T$ (the map applied first stands on the right).`],
      teach: 'Composing Möbius maps multiplies their matrices, the first map on the right.',
      explain: t`$\frac{1}{z + 2} = \frac{0\cdot z + 1}{1\cdot z + 2}$, matrix $\begin{bmatrix} 0 & 1 \\ 1 & 2 \end{bmatrix} = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}\begin{bmatrix} 1 & 2 \\ 0 & 1 \end{bmatrix}$.`,
    }),
    mcq({
      id: 'three-points', difficulty: 2,
      prompt: t`How many points must you choose images for to pin down a Möbius map $\dfrac{az + b}{cz + d}$ completely?`,
      visual: cxmap({ f: 'mobius', ...CAY, x: [-2, 2], y: [-0.5, 2], wx: [-1.5, 1.5], wy: [-1.5, 1.5], grid: 'none', drag: false, points: [{ x: 0, y: 0, label: '0', wlabel: 'M(0)' }, { x: 1, y: 0, label: '1', wlabel: 'M(1)' }, { x: -1, y: 0, label: '−1', wlabel: 'M(−1)', color: 'gold' }] }, t`The Cayley map is fixed by where it sends $0$, $1$ and $-1$.`),
      choices: ['Three', 'Two', 'Four', 'One'],
      answer: 0,
      why: { 1: 'Two images leave one complex degree of freedom: a whole family of maps fix them.', 2: t`There are four coefficients, but scaling all of them by the same number changes nothing: only three are free.`, 3: 'One point fixes very little: every translation moves a point anywhere you like.' },
      hints: ['Count the coefficients, then remember that (a, b, c, d) and (ka, kb, kc, kd) give the same map.'],
      teach: 'A Möbius map has three complex degrees of freedom, so it is fixed by the images of three points.',
      explain: 'Four complex coefficients, minus one for the common scale: three. Any three distinct points can be sent to any three distinct points by exactly one Möbius map — which is why “the circle through the images of three points” settled the Cayley example.',
    }),
    mcq({
      id: 'headlight', difficulty: 2,
      prompt: t`Map the sky to the plane by stereographic projection: a star at angle $\theta$ from your direction of travel and azimuth $\varphi$ sits at $\zeta = \tan(\theta/2)\,e^{i\varphi}$, so straight ahead is $\zeta = 0$ and the circle $|\zeta| = 1$ is everything abeam ($\theta = 90^\circ$). Moving at speed $\beta = v/c$, relativistic aberration multiplies every $\zeta$ by $k = \sqrt{(1 - \beta)/(1 + \beta)}$. What does the traveller see?`,
      visual: sky(0.6, { caption: t`Faint, dashed: the sky at rest, with circles at $60^\circ$, $90^\circ$ and $120^\circ$ from straight ahead. Bold: the same stars and circles at $\beta = 0.6$ ($k = 0.5$). Only directions are shown; brightness and colour shifts are ignored.` }),
      choices: ['Stars crowd toward the direction of travel, and stars from behind appear in the forward half of the sky', 'Stars spread away from the direction of travel', 'Only the stars straight ahead move', 'The stars all turn about the direction of travel'],
      answer: 0,
      why: { 1: t`$k < 1$ shrinks $|\zeta|$, and small $|\zeta|$ means small $\theta$: toward straight ahead.`, 2: t`Multiplying by $k$ moves every $\zeta \ne 0$ — only the points straight ahead and straight behind stay put.`, 3: t`$k$ is a positive real number, so it stretches without turning: azimuths $\varphi$ are unchanged.` },
      hints: [t`$k < 1$ for $\beta > 0$. What happens to $|\zeta| = \tan(\theta/2)$?`, t`A smaller $\tan(\theta/2)$ is a smaller $\theta$.`],
      teach: 'A boost acts on the stereographic sky as a dilation toward the forward point: the headlight effect.',
      explain: t`Every star’s $\tan(\theta/2)$ shrinks by $k$, so it appears closer to straight ahead, at the same azimuth; the circle that used to be at $\tan(\theta/2) = 1/k$ now lies abeam. In the picture the $120^\circ$ circle has moved inside the old $90^\circ$ one.`,
    }),
  ],
  checkpoint: [
    {
      type: 'point', id: 'cp-invert', difficulty: 2,
      gen(r) {
        const z = r.pick([[1, 1], [1, -1], [0, 2], [2, 0], [-1, 1], [0.5, 0.5]]);
        const w = M.div([1, 0], z);
        return {
          prompt: t`Drag the gold point to $1/z$ for $z = ${cTeX(z)}$.`,
          visual: (() => { const v = argand({ pts: [{ z, label: 'z', color: 'accent' }], circles: [{ r: 1 }], view: 2.4, caption: 'The point z and the unit circle (dashed).' }); v.params.drag = [{ key: 'p', x: -2.8, y: -2, snap: 0.05 }]; return v; })(),
          answer: { x: r6(w[0]), y: r6(w[1]) }, tol: { x: 0.1, y: 0.1 },
          instruction: 'Drag the point to 1/z, then check.',
          hints: [t`$|1/z| = 1/|z|$ and $\arg(1/z) = -\arg z$: reflect in the real axis and invert the length.`, t`$\dfrac{1}{z} = \dfrac{\bar z}{|z|^2}$.`],
          teach: 'Inversion 1/z: reciprocal length, opposite angle.',
          explain: t`$1/z = \bar z/|z|^2 = ${cTeX(w)}$.`,
        };
      },
    },
    num({
      id: 'cp-abeam', difficulty: 3, transfer: true,
      gen(r) {
        const beta = r.pick([0.5, 0.6, 0.8, 0.9]);
        const k = Math.sqrt((1 - beta) / (1 + beta));
        const ans = 2 * Math.atan(1 / k) / DEG;
        return {
          prompt: t`An interstellar probe coasts at $\beta = ${beta}$. In the stereographic sky coordinate $\zeta = \tan(\theta/2)e^{i\varphi}$ ($\theta$ measured from the direction of travel), aberration is the Möbius map $\zeta \mapsto k\zeta$ with $k = \sqrt{(1 - \beta)/(1 + \beta)}$. A star appears exactly abeam ($90^\circ$) to the probe’s camera. At what angle $\theta$ from the direction of travel does that star lie for an observer at rest?`,
          visual: sky(beta, { caption: t`Dashed: the sky at rest (circles at $60^\circ$, $90^\circ$, $120^\circ$). Bold: as seen at $\beta = ${beta}$. Directions only; the Doppler shifts in colour and brightness are not drawn.` }),
          answer: ans, units: '°', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 180 - ans, feedback: t`Seen ahead of where it really is: the rest-frame angle is **larger** than $90^\circ$, behind the beam.` }, { value: 2 * Math.atan(k) / DEG, feedback: t`Solve $k\tan(\theta/2) = 1$ for $\theta$: $\tan(\theta/2) = 1/k$.` }],
          hints: [t`The camera sees $|\zeta'| = 1$. So $k\tan(\theta/2) = 1$.`, t`$k = ${nm(k, 4)}$, so $\tan(\theta/2) = ${nm(1 / k, 4)}$.`],
          teach: 'Under a boost the stereographic sky is multiplied by k = √((1 − β)/(1 + β)): stars from behind are pulled forward.',
          explain: t`$\theta = 2\arctan(1/k) = 2\arctan ${nm(1 / k, 4)} = ${nm(ans, 4)}^\circ$ — in agreement with the textbook aberration formula $\cos\theta' = (\cos\theta + \beta)/(1 + \beta\cos\theta)$, which gives $\cos\theta = -\beta$ for $\theta' = 90^\circ$.`,
        };
      },
    }),
    mcq({
      id: 'cp-lorentz', difficulty: 3, transfer: true,
      prompt: t`Every proper, orthochronous Lorentz transformation (boosts and rotations, no reflections or time reversal) acts on the directions of incoming light — the celestial sphere — as some Möbius map of $\zeta$, and every Möbius map arises this way: the groups are isomorphic, $\mathrm{PSL}(2, \mathbb C) \cong \mathrm{SO}^+(1, 3)$. Which consequence follows?`,
      visual: sky(0.8, { labels: false, caption: t`A boost at $\beta = 0.8$ acting on a few stars and three circles of the sky (directions only).` }),
      choices: [
        'A circle on the sky — such as the outline of a distant sphere — is seen as a circle by every observer, whatever their velocity',
        'A fast-moving sphere looks flattened into an ellipse along its motion',
        'Boosts and rotations act on the sky in the same way, so they cannot be told apart',
        'The isomorphism means Lorentz transformations are really just rotations of a sphere',
      ],
      answer: 0,
      why: {
        1: 'Lorentz contraction is real, but what you see is a set of light-ray directions, and Möbius maps send circles to circles: Penrose and Terrell (1959) showed the outline stays circular.',
        2: 'Rotations are the Möbius maps that preserve distances on the sphere; boosts are the ones that do not (they dilate toward a point). Same family, different members.',
        3: 'The sky is a sphere, but Möbius maps include dilations toward a point, which no rotation of the sphere can do.',
      },
      hints: ['What is the defining geometric property of Möbius maps?', 'They send circles to circles.'],
      teach: 'Lorentz transformations act on the sky as Möbius maps, which preserve circles and angles.',
      explain: t`Möbius maps send circles to circles, so a sphere’s circular outline on the sky stays a circle for every observer (Penrose 1959; Terrell 1959). The isomorphism is exact and established mathematics; this picture uses directions only and ignores the Doppler change of colour and brightness. The Atlas’s own tests check it numerically: random $2\times2$ complex matrices give matrices $\Lambda$ that preserve the Minkowski metric, and their Möbius action moves each star exactly as $\Lambda$ does.`,
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 3 (Möbius transformations)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Penrose, The apparent shape of a relativistically moving sphere, Proc. Camb. Phil. Soc. 55, 137 (1959)', url: 'https://doi.org/10.1017/S0305004100033776' },
    { label: 'Terrell, Invisibility of the Lorentz contraction, Phys. Rev. 116, 1041 (1959)', url: 'https://doi.org/10.1103/PhysRev.116.1041' },
    { label: 'Penrose & Rindler, Spinors and Space-Time, Vol. 1, §1.2–1.4 (Cambridge 1984)', url: 'https://doi.org/10.1017/CBO9780511564048' },
  ],
});
