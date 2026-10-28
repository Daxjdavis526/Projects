// The complex derivative as an amplitwist (Needham's word): near a point
// z₀, an analytic map acts like multiplication by the number f′(z₀) — it
// amplifies every tiny arrow by |f′(z₀)| and twists it by arg f′(z₀). So
// infinitesimal circles go to circles, and angles are preserved wherever
// f′ ≠ 0. A map that is not complex-differentiable (z̄) turns circles into
// mirror images or ellipses instead.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, r6, cTeX, num as nm, deg, cxmap, apart } from './_cx.js';

const t = String.raw;

// the amplitwist picture of f at a fixed point z₀
const twistPic = (f, z0, caption, o = {}) => cxmap({ f, x: [-2, 2], y: [-2, 2], wx: [-4, 4], wy: [-4, 4], grid: 'cartesian', gn: 9, amplitwist: true, eps: 0.3, drag: { x: z0[0], y: z0[1] }, ...o }, caption);

const EZ = [1, 1], ED = M.derivative('z2', EZ);

export default lesson({
  id: 'st-d.D3.1',
  title: 'The complex derivative as an amplitwist',
  minutes: 12, difficulty: 2,
  intro: t`Zoom in on a smooth complex map near a point $z_0$. A tiny arrow $\Delta z$ from $z_0$ is carried to a tiny arrow $\Delta w$ from $f(z_0)$, and the **complex derivative** is the number that does it:

$$\Delta w \approx f'(z_0)\,\Delta z$$

Multiplying by a complex number is a turn and a stretch (D1.1). So, close to $z_0$, the whole map is one rotation and one magnification: every tiny arrow is **amplified** by $|f'(z_0)|$ and **twisted** by $\arg f'(z_0)$ — Needham’s *amplitwist*. Tiny circles go to tiny circles; tiny squares to tiny squares; angles between curves survive. That is a strong demand: most maps of the plane squash a tiny circle into an ellipse, and those maps have no complex derivative.`,
  symbols: [
    { tex: 'z_0', text: 'the point where we zoom in' },
    { tex: t`\Delta z`, text: t`a tiny arrow (a small complex number) starting at $z_0$` },
    { tex: t`\Delta w`, text: t`its image, the tiny arrow from $f(z_0)$ to $f(z_0 + \Delta z)$` },
    { tex: t`f'(z_0)`, text: t`the complex derivative, $\lim_{\Delta z\to0}\dfrac{f(z_0 + \Delta z) - f(z_0)}{\Delta z}$ — the same limit from **every** direction of $\Delta z$` },
    { tex: t`|f'(z_0)|`, text: t`the **amplification**: how much tiny lengths are stretched near $z_0$ (areas by its square)` },
    { tex: t`\arg f'(z_0)`, text: t`the **twist**: how far tiny arrows are turned near $z_0$` },
  ],
  why: t`Because analytic maps preserve angles they are the tool for conformal mapping — airflow round a wing, fields round conductors — and the amplitwist is the picture behind the Cauchy–Riemann equations in the next lesson.`,
  visual: {
    type: 'cx-map',
    title: 'The amplitwist magnifier',
    lead: t`The green disc round $z$ and its image; the short blue and orange arrows (pointing east and north from $z$) and their images. Drag $z$: for an analytic $f$ the image is a disc again — bigger or smaller, turned — and the two arrows stay perpendicular and equal. The readout gives $f'(z)$, the amplification and the twist.`,
    tasks: [
      t`For $z^2$, drag $z$ toward $0$: the image disc shrinks and the twist follows $\arg z$, since $f'(z) = 2z$.`,
      t`For $e^z$, drag $z$ straight up: the amplification stays $e^x$ while the twist grows with $y$.`,
      t`Choose $\bar z$: the image disc is a mirror image (the arrows swap their order) — no turn-and-stretch can do that, and the derivative readout says “none”.`,
    ],
    params: {
      f: 'z2', fns: ['z2', 'z3', 'exp', 'inv', 'conj'], x: [-2, 2], y: [-2, 2], wx: [-4, 4], wy: [-4, 4], grid: 'cartesian', gn: 9,
      amplitwist: true, eps: 0.25, drag: { x: 1, y: 0.6 }, readout: ['z', 'fp', 'amp', 'twist'],
    },
    caption: t`The disc (radius $0.25$) is not infinitesimal, so its image is only nearly a disc; shrink it in your mind and the amplitwist becomes exact. The images are computed exactly, not linearized.`,
  },
  example: {
    prompt: t`Find the amplitwist of $f(z) = z^2$ at $z_0 = 1 + i$, and check it on the arrow $\Delta z = 0.01$.`,
    visual: twistPic('z2', EZ, t`At $z_0 = 1 + i$ the disc grows by $2\sqrt2 \approx 2.83$ and turns $45^\circ$; the east-pointing (blue) arrow now points north-east.`),
    steps: [
      { label: 'Derivative', text: t`$f'(z) = 2z$, exactly as for real $x^2$ (the limit $\frac{(z + \Delta z)^2 - z^2}{\Delta z} = 2z + \Delta z \to 2z$ from every direction). So $f'(1 + i) = 2 + 2i$.` },
      { label: 'Amplify and twist', text: t`$|2 + 2i| = 2\sqrt2 = ${nm(M.abs(ED), 4)}$ and $\arg(2 + 2i) = 45^\circ$. Near $1 + i$, the map stretches every tiny arrow by $2.83$ and turns it $45^\circ$ anticlockwise.` },
      { label: 'Check', text: t`$f(1.01 + i) - f(1 + i) = (0.0201 + 2.02i) - 2i = 0.0201 + 0.02i$, while $f'(z_0)\Delta z = (2 + 2i)(0.01) = 0.02 + 0.02i$. They agree up to $(\Delta z)^2 = 0.0001$. ✓` },
      { label: 'Areas', text: t`A tiny square of area $A$ near $1 + i$ becomes a tiny square of area $|f'|^2A = 8A$.` },
    ],
    answer: t`Amplification $2\sqrt2$, twist $45^\circ$: near $1 + i$, $z^2$ behaves like multiplication by $2 + 2i$.`,
  },
  practice: [
    num({
      id: 'amp-z3', difficulty: 2,
      gen(r) {
        const z0 = r.pick([[1, 1], [1, -1], [0.5, 1], [-1, 0.5], [1.5, 0]]);
        const ans = 3 * (z0[0] ** 2 + z0[1] ** 2);
        return {
          prompt: t`Find the amplification of $f(z) = z^3$ at $z_0 = ${cTeX(z0)}$.`,
          visual: twistPic('z3', z0, t`The small disc at $z_0$ and its image under $z^3$ (axes without numbers).`, { wx: [-6, 6], wy: [-6, 6], ticks: false }),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: M.abs(z0) ** 3, feedback: t`That is $|f(z_0)|$, the size of the value. The amplification is $|f'(z_0)|$.` }, { value: 3 * M.abs(z0), feedback: t`$f'(z) = 3z^2$, so the amplification is $3|z_0|^2$.` }]),
          hints: [t`$f'(z) = 3z^2$, and the amplification is $|f'(z_0)|$.`, t`$|3z_0^2| = 3|z_0|^2$, with $|z_0|^2 = ${z0[0] ** 2 + z0[1] ** 2}$.`],
          teach: t`Amplification is $|f'(z_0)|$: the factor by which tiny lengths near $z_0$ are stretched.`,
          explain: t`$|f'(z_0)| = 3|z_0|^2 = 3\times${z0[0] ** 2 + z0[1] ** 2} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'twist-exp', difficulty: 2,
      gen(r) {
        const x = r.pick([-0.5, 0, 0.5, 1]), y = r.pick([0.5, 1, 1.5, -1]);
        const ans = deg(y);
        return {
          prompt: t`Find the twist $\arg f'(z_0)$ of $f(z) = e^z$ at $z_0 = ${cTeX([x, y])}$, in degrees.`,
          visual: twistPic('exp', [x, y], t`The disc at $z_0$ and its image under $e^z$ (axes without numbers).`, { wx: [-3.5, 3.5], wy: [-3.5, 3.5], ticks: false }),
          answer: ans, units: '°', tol: { rel: 0.005, abs: 0.3 },
          errors: apart(ans, [{ value: deg(Math.atan2(y, x || 1e-9)), feedback: t`That is $\arg z_0$. The twist is the angle of $f'(z_0) = e^{z_0}$.` }]),
          hints: [t`$f'(z) = e^z$ and $e^{x + iy} = e^x e^{iy}$.`, t`The angle of $e^xe^{iy}$ is $y$ radians.`],
          teach: t`For $e^z$ the twist at $x + iy$ is $y$ and the amplification is $e^x$.`,
          explain: t`$f'(z_0) = e^{${x}}e^{i(${y})}$: twist $${y}$ rad $= ${nm(ans, 4)}^\circ$, amplification $e^{${x}} = ${nm(Math.exp(x), 3)}$.`,
        };
      },
    }),
    {
      type: 'point', id: 'find-z', difficulty: 3,
      gen(r) {
        const z0 = r.pick([[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1]]);
        const d = M.scale(z0, 2), amp = M.abs(d), tw = deg(M.arg(d));
        return {
          prompt: t`For $f(z) = z^2$, drag $z$ to the point where the amplitwist is: amplification $${nm(amp, 3)}$ and twist $${nm(tw, 3)}^\circ$.`,
          visual: cxmap({ f: 'z2', x: [-2, 2], y: [-2, 2], wx: [-4, 4], wy: [-4, 4], grid: 'cartesian', gn: 9, amplitwist: true, eps: 0.25, drag: { x: 1.4, y: -1.2 } }, 'Drag z: the green disc and the two arrows show the local turn and stretch.'),
          answer: { x: z0[0], y: z0[1] }, tol: { x: 0.12, y: 0.12 },
          instruction: 'Drag z, then check.',
          hints: [t`The amplitwist is $f'(z) = 2z$: you need $2z = ${nm(amp, 3)}e^{i\,${nm(tw, 3)}^\circ}$.`, t`So $z = ${nm(amp / 2, 3)}e^{i\,${nm(tw, 3)}^\circ}$: length $${nm(amp / 2, 3)}$, angle $${nm(tw, 3)}^\circ$.`],
          teach: t`The amplitwist is the single complex number $f'(z)$: its length is the amplification, its angle the twist.`,
          explain: t`$2z = ${cTeX(d)}$ gives $z = ${cTeX(z0)}$.`,
        };
      },
    },
    mcq({
      id: 'conj', difficulty: 2,
      prompt: t`The picture shows the map $f(z) = \bar z$ (reflection in the real axis) acting on a small disc with two arrows. Why does $\bar z$ have no complex derivative anywhere?`,
      visual: twistPic('conj', [1, 0.8], t`$\bar z$: the east (blue) arrow keeps its direction, the north (orange) arrow flips south.`, { wx: [-2, 2], wy: [-2, 2] }),
      choices: ['It reflects tiny shapes: blue-then-orange turns from anticlockwise to clockwise, which no turn-and-stretch can do', 'It changes the size of tiny circles', 'Its image of the small disc is not a disc', 'It is not continuous'],
      answer: 0,
      why: { 1: t`It changes no sizes at all: $|\Delta w| = |\Delta z|$.`, 2: 'The image is a disc of the same size — the trouble is the mirror flip, not the shape.', 3: t`$\bar z$ is perfectly continuous (and smooth as a real map); it just is not complex-differentiable.` },
      hints: [t`Compute $\Delta w/\Delta z$ for $\Delta z$ real and for $\Delta z$ imaginary.`, t`Real: $\bar{\Delta z}/\Delta z = 1$. Imaginary: $(-i h)/(ih) = -1$. A derivative must give one number.`],
      teach: 'A complex derivative must act on tiny arrows as one multiplication; a reflection reverses orientation, so it cannot.',
      explain: t`$\Delta w/\Delta z = \overline{\Delta z}/\Delta z = e^{-2i\phi}$ depends on the direction $\phi$ of $\Delta z$: there is no single limit. Geometrically, the map is a reflection — it reverses the turning sense of every pair of arrows (anti-conformal).`,
    }),
    num({
      id: 'area-scale', difficulty: 2,
      gen(r) {
        const z0 = r.pick([[1, 1], [2, 1], [1, 2], [0.5, 0.5], [1.5, -1]]);
        const ans = 4 * (z0[0] ** 2 + z0[1] ** 2);
        return {
          prompt: t`A tiny patch of area $1\ \text{mm}^2$ sits at $z_0 = ${cTeX(z0)}$. What is the area of its image under $f(z) = z^2$?`,
          visual: twistPic('z2', z0, t`The disc at $z_0$ and its image under $z^2$ (axes without numbers).`, { x: [-2.5, 2.5], y: [-2.5, 2.5], wx: [-6, 6], wy: [-6, 6], ticks: false }),
          answer: ans, units: 'mm^2', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 2 * M.abs(z0), feedback: t`That is the stretch of **lengths**. Areas scale by its square, $|f'|^2$.` }]),
          hints: [t`Lengths scale by $|f'(z_0)| = |2z_0|$.`, t`Areas scale by $|f'(z_0)|^2 = 4|z_0|^2$.`],
          teach: t`An amplitwist stretches lengths by $|f'|$ in every direction, so areas by $|f'|^2$.`,
          explain: t`$|f'(z_0)|^2 = |2z_0|^2 = 4\times${z0[0] ** 2 + z0[1] ** 2} = ${nm(ans, 4)}$, so the image has area $${nm(ans, 4)}\ \text{mm}^2$. (This is the Jacobian determinant of the real map $(x, y) \mapsto (u, v)$.)`,
        };
      },
    }),
    mcq({
      id: 'critical', difficulty: 2,
      prompt: t`Where does $f(z) = z^2$ fail to preserve the angle between two crossing curves?`,
      visual: cxmap({ f: 'z2', x: [-1.5, 1.5], y: [-1.5, 1.5], wx: [-2.3, 2.3], wy: [-2.3, 2.3], grid: 'polar', gr: [0.3, 1.4], gth: [0, 6.2832], gn: 4, gm: 8, drag: false }, t`Rays from $0$ and circles round it, and their images: the rays $45^\circ$ apart come out $90^\circ$ apart.`),
      choices: [t`Only at $z = 0$`, 'Nowhere', 'Everywhere on the real axis', t`On the unit circle $|z| = 1$`],
      answer: 0,
      why: { 1: t`Look at the rays at $0$ in the picture: angles there are doubled.`, 2: t`$f'(x) = 2x \ne 0$ for real $x \ne 0$: those points are fine.`, 3: t`$|f'| = 2$ on $|z| = 1$ — stretching, but no failure of angles.` },
      hints: [t`Angles survive wherever the amplitwist $f'(z)$ is a genuine turn-and-stretch — that is, $f'(z) \ne 0$.`, t`$f'(z) = 2z$.`],
      teach: t`An analytic map is conformal wherever $f' \ne 0$; at a critical point ($f' = 0$) angles are multiplied.`,
      explain: t`$f'(z) = 2z$ vanishes only at $0$. There $z^2$ doubles every angle (since $\arg z^2 = 2\arg z$). Everywhere else it preserves them — the grids of the last lesson crossed at right angles away from $0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-inv-amp', difficulty: 2,
      gen(r) {
        const z0 = r.pick([[2, 0], [1, 1], [0, 0.5], [1, 2], [-2, 1]]);
        const ans = 1 / (z0[0] ** 2 + z0[1] ** 2);
        return {
          prompt: t`Find the amplification of $f(z) = 1/z$ at $z_0 = ${cTeX(z0)}$.`,
          visual: twistPic('inv', z0, t`The disc at $z_0$ and its image under $1/z$ (axes without numbers).`, { x: [-2.5, 2.5], y: [-2.5, 2.5], wx: [-2.5, 2.5], wy: [-2.5, 2.5], eps: 0.15, ticks: false }),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 1 / M.abs(z0), feedback: t`That is $|f(z_0)|$. Differentiate: $f'(z) = -1/z^2$.` }]),
          hints: [t`$f'(z) = -1/z^2$, so the amplification is $1/|z_0|^2$.`],
          teach: t`$1/z$ shrinks tiny shapes far from $0$ and magnifies them near it, by $1/|z|^2$.`,
          explain: t`$|f'(z_0)| = 1/|z_0|^2 = 1/${z0[0] ** 2 + z0[1] ** 2} = ${nm(ans, 4)}$. The twist is $\arg(-1/z_0^2) = 180^\circ - 2\arg z_0$.`,
        };
      },
    }),
    {
      type: 'point', id: 'cp-exp-find', difficulty: 3,
      gen(r) {
        const a = r.pick([-0.5, 0.5, 1]), b = r.pick([-1, 1, 1.5]);
        return {
          prompt: t`For $f(z) = e^z$, drag $z$ to the point (in the window shown) where the amplification is $e^{${a}} \approx ${nm(Math.exp(a), 3)}$ and the twist is $${nm(deg(b), 3)}^\circ$.`,
          visual: cxmap({ f: 'exp', x: [-2, 2], y: [-2, 2], wx: [-4, 4], wy: [-4, 4], grid: 'cartesian', gn: 9, amplitwist: true, eps: 0.25, drag: { x: -1.5, y: -1.5 } }, 'Drag z: the disc and arrows show the local amplitwist of eᶻ.'),
          answer: { x: a, y: b }, tol: { x: 0.12, y: 0.12 },
          instruction: 'Drag z, then check.',
          hints: [t`$f'(z) = e^z = e^xe^{iy}$: the amplification is $e^x$ and the twist is $y$ (radians).`, t`Twist $${nm(deg(b), 3)}^\circ = ${b}$ rad.`],
          teach: 'For eᶻ the real part of z sets the amplification and the imaginary part the twist.',
          explain: t`$e^x = e^{${a}}$ gives $x = ${a}$, and $y = ${b}$ rad: $z = ${cTeX([a, b])}$.`,
        };
      },
    },
    num({
      id: 'cp-cylinder', difficulty: 3, transfer: true,
      gen(r) {
        const U = r.pick([40, 60, 80]), th = r.pick([30, 45, 60, 90, 120]);
        const ans = 2 * U * Math.abs(Math.sin(th * Math.PI / 180));
        return {
          prompt: t`Ideal airflow at speed $U = ${U}$ m/s past a cylinder of radius $a$ has the complex potential $\Omega(z) = U\left(z + \dfrac{a^2}{z}\right)$, and the air’s speed at any point is the amplification $|\Omega'(z)|$. Find the speed on the cylinder’s surface at the point $z = a\,e^{i\,${th}^\circ}$.`,
          visual: { type: 'field2d', params: { P: 'step(x^2 + y^2 - 1)*(1 - (x^2 - y^2)/(x^2 + y^2)^2)', Q: 'step(x^2 + y^2 - 1)*(-2*x*y/(x^2 + y^2)^2)', x: [-3, 3], y: [-3, 3], density: 15, particles: true, readout: false, probe: false, loop: { r: 1 } }, caption: 'The ideal (inviscid, irrotational) flow past a cylinder (gold circle, radius 1), coming from the left. Arrows coloured by speed. Real air separates behind a cylinder; this model does not.' },
          answer: ans, units: 'm/s', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: U, feedback: 'The air speeds up as it squeezes past the cylinder: compute |Ω′| on the surface.' }, { value: 2 * U, feedback: t`$2U$ is the top speed, at $90^\circ$. At other points the factor is $2|\sin\theta|$.` }]),
          hints: [t`$\Omega'(z) = U\left(1 - \dfrac{a^2}{z^2}\right)$.`, t`On the surface $a^2/z^2 = e^{-2i\theta}$, and $|1 - e^{-2i\theta}| = 2|\sin\theta|$.`],
          teach: t`The amplification of a complex potential is the flow speed; for a cylinder it is $2U|\sin\theta|$ on the surface.`,
          explain: t`$|\Omega'| = U|1 - e^{-2i\,${th}^\circ}| = 2U|\sin ${th}^\circ| = ${nm(ans, 4)}$ m/s. The front and back points ($\theta = 0^\circ, 180^\circ$) are stagnation points, where $\Omega' = 0$ — critical points of the map, where angles are not preserved.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 4 (the amplitwist concept)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Anderson, Fundamentals of Aerodynamics, ch. 3 (non-lifting flow over a cylinder)', url: 'https://openlibrary.org/search?q=Anderson+Fundamentals+of+Aerodynamics' },
  ],
});
