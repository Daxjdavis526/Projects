// Conformal maps: an analytic f with f′(z₀) ≠ 0 turns every direction at z₀
// by arg f′ and stretches it by |f′|, so the angle between any two curves
// through z₀ — size and sense — survives. Lengths and areas do not. At a
// critical point (f′ = 0, first non-zero derivative the n-th) angles are
// multiplied by n: z² opens a right angle to a straight one, and the
// Joukowski map's critical point z = 1 turns a smooth circle into a cusped
// trailing edge. The payoff: harmonic functions stay harmonic under
// conformal maps, so a hard region can be mapped to an easy one (a wedge to
// a half-plane with z^{π/α}). Transfers: the Mercator chart (conformal, so
// rhumb lines are straight; scale sec φ) and Penrose diagrams (a Lorentzian
// cousin: conformal rescaling keeps light cones at 45°).
import { lesson, mcq, num } from '../../src/core/content.js';
import { num as nm, apart, cxmap, deg } from './_cx.js';
import { r4 } from './_cx3.js';

const t = String.raw;
const PI = Math.PI;
const ray = (phi, len = 1.6, color = 'accent', o = {}) => ({ param: [`t*${r4(Math.cos(phi))}`, `t*${r4(Math.sin(phi))}`], t: [0, len], color, ...o });
const offCircle = (cx, cy) => { const R = Math.hypot(1 - cx, cy); return { param: [`${r4(cx)} + ${r4(R)}*cos(t)`, `${r4(cy)} + ${r4(R)}*sin(t)`], t: [0, 2 * PI], color: 'gold' }; };

export default lesson({
  id: 'st-d.D10.1',
  title: 'Angle-preserving maps',
  minutes: 12, difficulty: 3,
  intro: t`Zoom in on an analytic map at a point $z_0$. Near it, $f$ is its tangent approximation:

$$f(z_0 + \delta z) \approx f(z_0) + f'(z_0)\,\delta z$$

Multiplying by the complex number $f'(z_0)$ turns **every** small arrow $\delta z$ by the same angle, $\arg f'(z_0)$, and stretches it by the same factor, $|f'(z_0)|$ (D3.1’s amplitwist). So two curves crossing at $z_0$ are turned together: their images cross at **the same angle, in the same sense**. A map that does this at every point is **conformal**. It is not rigid: the stretch changes from place to place, so lengths and areas are not kept — only angles and the shapes of very small figures. Where $f'(z_0) = 0$ — a **critical point** — the rule fails, and angles get multiplied.`,
  symbols: [
    { tex: 'z_0', text: 'the point where the map is examined' },
    { tex: t`\delta z`, text: t`a small step away from $z_0$, in any direction` },
    { tex: t`f'(z_0)`, text: t`the complex derivative: its modulus is the local stretch, its argument the local turn; conformality needs $f'(z_0) \ne 0$` },
  ],
  why: t`Conformal maps carry solutions of Laplace’s equation into solutions, so a hard region — an airfoil, a slot, the edge of a capacitor — can be mapped to an easy one, solved there and mapped back. That is the next lesson.`,
  visual: {
    type: 'cx-map',
    title: 'Small squares stay square',
    lead: t`A grid in the $z$-plane (left) and its image (right). The green disc round the draggable point $z$ maps to a small disc round $f(z)$, turned and stretched by $f'(z)$; the two short arrows keep their right angle. Choose a map and drag $z$.`,
    tasks: [
      t`With $z^2$, the image grid is made of parabolas — yet everywhere they cross at right angles. Drag $z$ toward $0$: the stretch $|f'| = 2|z|$ shrinks to nothing, and at $0$ itself the right angles between the rays open to straight angles.`,
      t`With $z + 1/z$ (Joukowski), drag $z$ to $1$ or $-1$: $f' = 1 - 1/z^2$ vanishes there, and the grid is pinched. Everywhere else, right angles stay right.`,
      t`With $\bar z$, the disc is reflected: angles keep their size but reverse their sense. A reflection is *anticonformal* — not analytic.`,
    ],
    params: {
      f: 'z2', fns: ['z2', 'joukowski', 'exp', 'inv', 'conj'], x: [-2, 2], y: [-2, 2], wx: [-4, 4], wy: [-4, 4], grid: 'cartesian', gn: 11,
      amplitwist: true, eps: 0.28, drag: { x: 0.9, y: 0.7 }, readout: ['amp', 'twist'],
    },
    caption: t`The images are exact. The disc and arrows are small but finite, so for a strongly curved map their images are slightly distorted — the amplitwist describes the limit of very small ones.`,
  },
  example: {
    prompt: t`A large metal plate fills the first quadrant $x > 0$, $y > 0$. Its edge along the $x$-axis is held at $0^\circ$C and its edge along the $y$-axis at $T_0$. Find the steady temperature $T(x, y)$, which must be harmonic ($\nabla^2 T = 0$).`,
    visual: cxmap({ f: 'z2', x: [-0.3, 2.2], y: [-0.3, 2.2], wx: [-4.4, 4.4], wy: [-0.6, 4.4], grid: 'polar', gr: [0.4, 2], gth: [0, PI / 2], gn: 5, gm: 7, drag: false, ticks: false,
      curves: [ray(0, 2, 'accent', { label: '0°C' }), ray(PI / 2, 2, 'bad', { label: 'T₀' })] },
    t`$w = z^2$ opens the quarter-plane onto the upper half-plane: rays from $0$ (at angles $0^\circ$ to $90^\circ$) become rays at twice the angle. The cold edge (blue) lands on the positive real axis, the hot edge (red) on the negative one.`),
    steps: [
      { label: 'Map', text: t`$w = z^2$ doubles every angle at $0$: the quarter-plane $0 < \arg z < \pi/2$ becomes the upper half-plane $0 < \arg w < \pi$. The cold edge goes to the positive real $w$-axis, the hot edge to the negative one. (At $0$, a critical point, the corner’s right angle opens to a straight one — that is what flattens the corner.)` },
      { label: 'Solve there', text: t`In the half-plane, $\arg w$ is harmonic (it is the imaginary part of the analytic $\operatorname{Log} w$), is $0$ on the positive axis and $\pi$ on the negative one. So $T = \dfrac{T_0}{\pi}\arg w$.` },
      { label: 'Pull back', text: t`A harmonic function composed with an analytic map is harmonic. With $w = z^2$, $\arg w = 2\arg z$: $$T(x, y) = \frac{2T_0}{\pi}\arg z = \frac{2T_0}{\pi}\arctan\frac{y}{x}.$$` },
      { label: 'Check', text: t`On the $x$-axis $\arg z = 0$: $T = 0$. On the $y$-axis $\arg z = \pi/2$: $T = T_0$. Along the diagonal $y = x$, $T = T_0/2$, as symmetry demands. The isotherms are rays from the corner.` },
    ],
    answer: t`$T = \dfrac{2T_0}{\pi}\arctan\dfrac{y}{x}$`,
  },
  practice: [
    mcq({
      id: 'what-kept', difficulty: 1,
      prompt: t`The map $e^z$ is conformal everywhere. In the picture, the small squares of the grid get much bigger toward the right. What does “conformal” promise?`,
      visual: cxmap({ f: 'exp', x: [-1.2, 1.2], y: [-1.2, 1.2], wx: [-3.5, 3.5], wy: [-3.5, 3.5], grid: 'cartesian', gn: 9, drag: false }, t`$e^z$: vertical lines become circles, horizontal lines become rays, and they still cross at right angles.`),
      choices: [
        'Angles between curves, and their sense, are preserved; lengths and areas need not be',
        'Lengths are preserved, so shapes are kept exactly',
        'Areas are preserved',
        'Straight lines are mapped to straight lines',
      ],
      answer: 0,
      why: {
        1: t`Then the squares could not grow. The local stretch $|f'| = e^x$ changes from place to place.`,
        2: t`Area is multiplied by $|f'|^2 = e^{2x}$, which varies.`,
        3: t`Vertical lines become circles under $e^z$.`,
      },
      hints: [t`Near a point, $f$ multiplies small arrows by one complex number $f'(z_0)$.`, 'Multiplying by a complex number turns and stretches every arrow the same way: what does that keep?'],
      teach: '“Conformal” means angle-preserving (with orientation), not length-preserving: the stretch may vary from point to point.',
      explain: t`Each small arrow is multiplied by $f'(z_0) = e^{z_0}$: turned by $y_0$ and stretched by $e^{x_0}$, the same for every direction at that point. Angles survive; sizes do not.`,
    }),
    num({
      id: 'critical-angle', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]), phi = r.pick([20, 30, 40, 45]);
        const ans = n * phi;
        return {
          prompt: t`Two straight curves leave $z = 0$ at an angle of $${phi}^\circ$ to each other. At what angle (in degrees) do their images under $f(z) = z^{${n}}$ leave $f(0) = 0$?`,
          visual: cxmap({ f: 'pow', p: [n, 0], x: [-1.4, 1.4], y: [-1.4, 1.4], wx: [-1.6, 1.6], wy: [-1.6, 1.6], grid: 'none', drag: false, ticks: false, curves: [ray(0.15, 1.1, 'accent'), ray(0.15 + (phi * PI) / 180, 1.1, 'violet')] }, t`Two rays from $0$ and their images under $z^{${n}}$.`),
          answer: ans, units: '°', tol: { rel: 0, abs: 0.5 },
          errors: apart(ans, [{ value: phi, feedback: t`At $0$, $f'(0) = 0$: the map is not conformal there. A ray at angle $\theta$ goes to one at $${n}\theta$.` }, { value: phi / n, feedback: t`$z^{${n}}$ multiplies angles at $0$ by ${n}; it does not divide them.` }]),
          hints: [t`A ray $z = re^{i\theta}$ maps to $r^{${n}}e^{${n}i\theta}$.`, t`Both rays’ angles are multiplied by ${n}, so their difference is too.`],
          teach: t`At a critical point where $f$ behaves like $(z - z_0)^n$, angles are multiplied by $n$.`,
          explain: t`$z^{${n}}$ sends angle $\theta$ to $${n}\theta$: the gap of $${phi}^\circ$ becomes $${ans}^\circ$. Conformality fails exactly where $f' = 0$.`,
        };
      },
    }),
    num({
      id: 'open-wedge', difficulty: 2,
      gen(r) {
        const a = r.pick([30, 45, 60, 90, 120, 135]);
        const ans = 180 / a;
        return {
          prompt: t`What power $p$ makes $w = z^p$ open the wedge $0 < \arg z < ${a}^\circ$ onto the upper half-plane $0 < \arg w < 180^\circ$?`,
          visual: cxmap({ f: 'pow', p: [ans, 0], x: [-1.5, 1.5], y: [-0.4, 1.6], wx: [-1.6, 1.6], wy: [-0.4, 1.6], grid: 'polar', gr: [0.3, 1.1], gth: [0, (a * PI) / 180], gn: 4, gm: 6, drag: false, ticks: false }, t`The wedge with its polar grid, and its image: the edges at $0^\circ$ and $${a}^\circ$ land on the two halves of the real axis.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: a / 180, feedback: t`That would shrink the wedge. To open angle $${a}^\circ$ to $180^\circ$, multiply angles by $180/${a}$.` }]),
          hints: [t`$z^p$ multiplies every angle at $0$ by $p$.`, t`You need $p\cdot${a}^\circ = 180^\circ$.`],
          teach: t`$z^{\pi/\alpha}$ opens a wedge of angle $\alpha$ onto a half-plane — the first step in solving any wedge problem.`,
          explain: t`$p = 180/${a} = ${nm(ans, 4)}$. ${a > 180 / 2 ? 'Here the wedge is wider than a right angle, so the power is less than 2.' : ''} A non-integer power needs a branch cut, placed outside the wedge (the principal branch, cut along the negative real axis, works here).`,
        };
      },
    }),
    {
      type: 'point', id: 'find-critical', difficulty: 2,
      gen(r) {
        const side = r.pick([1, -1]);
        return {
          prompt: t`Drag $z$ to the point ${side > 0 ? 'in the right half-plane' : 'in the left half-plane'} where the Joukowski map $J(z) = z + 1/z$ fails to be conformal.`,
          visual: cxmap({ f: 'joukowski', x: [-2.2, 2.2], y: [-1.8, 1.8], wx: [-3.2, 3.2], wy: [-2.4, 2.4], grid: 'cartesian', gn: 13, drag: { x: 0.4 * side, y: 1.2 }, amplitwist: true, eps: 0.2, readout: false }, 'Drag z. Watch the green disc: where the map stops being conformal, its image collapses.'),
          answer: { x: side, y: 0 }, tol: { x: 0.15, y: 0.15 },
          instruction: 'Drag z, then check.',
          hints: [t`Conformality fails where $J'(z) = 0$.`, t`$J'(z) = 1 - 1/z^2 = 0$ at $z = \pm1$.`],
          teach: t`Critical points are the zeros of $f'$; there the amplitwist degenerates and angles are multiplied.`,
          explain: t`$J'(z) = 1 - z^{-2}$ vanishes at $z = ${side}$. There $J(z) - J(${side}) = (z ${side > 0 ? '-' : '+'} 1)^2/z$ behaves like a square, so angles double — the source of the airfoil’s sharp trailing edge.`,
        };
      },
    },
    num({
      id: 'transplant', difficulty: 3,
      gen(r) {
        const T0 = r.pick([60, 80, 100, 150]), [x, y] = r.pick([[1, 2], [2, 1], [1, 3], [3, 1], [1, 1.5], [2, 3]]);
        const ans = ((2 * T0) / PI) * Math.atan2(y, x);
        return {
          prompt: t`In the worked example (the quarter-plate with its $x$-edge at $0^\circ$C and its $y$-edge at $T_0 = ${T0}^\circ$C), what is the temperature at the point $(${x}, ${y})$, in $^\circ$C?`,
          visual: { type: 'c3-contour', params: { f: `${(2 * T0) / PI}*atan2(y, x)`, x: [0, 5.2], y: [0, 5.2 / 1.6], levels: { from: T0 / 6, to: (5 * T0) / 6, step: T0 / 6 }, labels: false, fill: true, points: [{ x, y, label: `(${x}, ${y})`, color: 'gold' }], aspect: '' }, caption: t`The isotherms of the plate: rays from the corner, equally spaced in angle (labels hidden).` },
          answer: ans, units: '°C', difference: true, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: (T0 / PI) * Math.atan2(y, x), feedback: t`$w = z^2$ doubles the angle: $T = \frac{T_0}{\pi}\arg w = \frac{2T_0}{\pi}\arg z$.` }, { value: ((2 * T0) / PI) * Math.atan2(x, y), feedback: t`$\arg z = \arctan(y/x)$, measured from the cold $x$-axis.` }]),
          hints: [t`$T = \dfrac{2T_0}{\pi}\arctan\dfrac{y}{x}$, with the angle in radians.`, t`$\arctan(${y}/${x}) = ${nm(Math.atan2(y, x), 4)}$ rad.`],
          teach: 'Solve in the easy region, then compose with the conformal map: the result is still harmonic.',
          explain: t`$T = \frac{2\cdot${T0}}{\pi}\cdot${nm(Math.atan2(y, x), 4)} = ${nm(ans, 4)}^\circ$C. The temperature depends only on the direction from the corner — the isotherms are rays.`,
        };
      },
    }),
    mcq({
      id: 'cusp', difficulty: 3,
      prompt: t`The gold circle passes through $z = 1$ and encloses $z = -1$. Under $J(z) = z + 1/z$ it becomes an airfoil with a **sharp** trailing edge at $J(1) = 2$, though the circle itself is smooth there. Why?`,
      visual: cxmap({ f: 'joukowski', x: [-2.4, 2.4], y: [-1.8, 1.8], wx: [-2.6, 2.6], wy: [-1.6, 1.6], grid: 'none', drag: false, curves: [offCircle(-0.12, 0.1)], points: [{ x: 1, y: 0, label: '1', wlabel: '2', color: 'bad' }] }, t`The circle with centre $-0.12 + 0.1i$ through $z = 1$, and its image, a Joukowski airfoil.`),
      choices: [
        t`$J'(1) = 0$: near $1$, $J$ acts like $(z - 1)^2$ and doubles angles, so the circle’s straight angle of $180^\circ$ at $1$ becomes $360^\circ$ — a cusp`,
        t`$J$ has a pole at $1$, which tears the curve`,
        t`$J$ is not analytic at $1$`,
        t`The circle has a corner at $1$ that the map merely keeps`,
      ],
      answer: 0,
      why: {
        1: t`$J$’s only pole is at $0$, inside the circle.`,
        2: t`$J$ is analytic everywhere except $0$; at $1$ it is analytic but not conformal, because $J' = 0$.`,
        3: 'A circle is smooth everywhere; the cusp is made by the map.',
      },
      hints: [t`Compute $J'(1)$.`, t`$J(z) - 2 = \dfrac{(z - 1)^2}{z}$: near $1$ that is a square.`],
      teach: 'At a critical point the map multiplies angles; Joukowski’s z = 1 turns a smooth boundary into a cusp.',
      explain: t`$J(z) - 2 = (z - 1)^2/z$, so near $z = 1$ angles double: the circle’s two directions at $1$, which meet at $180^\circ$, come out at $360^\circ$ — folded back onto each other, a cusp. Every other point of the circle maps conformally, so the rest of the airfoil is smooth.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cubic', difficulty: 3,
      gen(r) {
        const phi = r.pick([25, 35, 50, 70]), z0 = r.pick([1, -1]);
        const ans = 2 * phi;
        return {
          prompt: t`Two curves cross at $z = ${z0}$ at an angle of $${phi}^\circ$. At what angle do their images under $f(z) = z^3 - 3z$ cross?`,
          visual: cxmap({ f: 'uv', u: 'x^3 - 3*x*y^2 - 3*x', v: '3*x^2*y - y^3 - 3*y', x: [-2, 2], y: [-1.6, 1.6], wx: [-4, 4], wy: [-3.2, 3.2], grid: 'cartesian', gn: 11, drag: false, ticks: false, points: [{ x: z0, y: 0, label: String(z0).replace('-', '−'), color: 'gold' }] }, t`$z^3 - 3z$ and its image grid; the gold point is $z = ${z0}$.`),
          answer: ans, units: '°', tol: { rel: 0, abs: 0.5 },
          errors: apart(ans, [{ value: phi, feedback: t`$f'(z) = 3z^2 - 3$ vanishes at $z = \pm1$: the map is not conformal there.` }, { value: 3 * phi, feedback: t`$f''(${z0}) = ${6 * z0} \ne 0$, so near $${z0}$ the map behaves like a square, not a cube: angles double.` }]),
          hints: [t`$f'(${z0}) = 3 - 3 = 0$: a critical point. Check $f''(${z0})$.`, t`$f(z) \approx f(${z0}) + \tfrac12 f''(${z0})(z - ${z0})^2$: the lowest non-zero term is a square.`],
          teach: t`If $f'(z_0) = 0$ but $f''(z_0) \ne 0$, angles at $z_0$ are doubled.`,
          explain: t`$f'(${z0}) = 0$ and $f''(${z0}) = ${6 * z0} \ne 0$, so $f(z) - f(${z0}) \approx ${3 * z0}(z - ${z0})^2$: angles double, $${phi}^\circ \to ${ans}^\circ$.`,
        };
      },
    }),
    num({
      id: 'cp-mercator', difficulty: 3, transfer: true,
      gen(r) {
        const [place, lat] = r.pick([['central Greenland', 72], ['Svalbard', 78], ['Reykjavík', 64], ['Oslo', 60], ['Anchorage', 61], ['the Antarctic coast at McMurdo Station', -78]]);
        const phi = (Math.abs(lat) * PI) / 180, ans = 1 / Math.cos(phi);
        const ys = [0, 20, 40, 60, 70, 80].map((d) => r4(Math.log(Math.tan(PI / 4 + (d * PI) / 360))));
        return {
          prompt: t`A pilot’s Mercator chart plots longitude $\lambda$ and latitude $\phi$ (in radians, on a globe of radius 1) as $x = \lambda$, $y = \ln\tan\!\left(\dfrac{\pi}{4} + \dfrac{\phi}{2}\right)$. It is conformal — stereographic projection followed by a logarithm — so near any point it is a pure scaling, and a course of constant compass bearing is a straight line. By what factor does the chart enlarge lengths near ${place} (latitude $${Math.abs(lat)}^\circ$${lat < 0 ? ' S' : ' N'}), compared with lengths at the equator?`,
          visual: { type: 'graph', params: { x: [-1.4, 1.4], y: [-0.15, 2.6], equal: true, xlabel: '', ylabel: '', axes: false, xticks: 0, yticks: 0,
            hlines: [0, 20, 40, 60, 70, 80].map((d, k) => ({ y: ys[k], label: `${d}°`, color: 'ink3' })),
            vlines: [-60, -40, -20, 0, 20, 40, 60].map((d) => ({ x: r4((d * PI) / 180), color: 'ink4' })),
            points: [{ x: 0.2, y: r4(Math.log(Math.tan(PI / 4 + phi / 2))), label: lat < 0 ? `${place.split(' at ')[1] || place} (mirrored north)` : place.replace('central ', ''), color: 'gold' }],
            curves: [{ fn: '0.9*x + 0.3', domain: [-0.33, 1.3], color: 'accent', dash: [6, 4], label: 'rhumb line', labelAt: 0.4, labelDx: 10, labelDy: 14 }] },
            caption: 'A Mercator grid: meridians every 20°, parallels at the latitudes marked. Equal steps in latitude are drawn further and further apart toward the pole.' },
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [
            { value: Math.cos(phi), feedback: t`On the globe a degree of longitude at latitude $\phi$ is only $\cos\phi$ as long as at the equator, but the chart draws it the same width: the chart *enlarges* by $1/\cos\phi$.` },
            { value: 1 / Math.cos(phi) ** 2, feedback: t`$\sec^2\phi$ is the **area** factor. Lengths scale by $\sec\phi$.` },
          ]),
          hints: [t`Along a parallel, the chart’s $dx = d\lambda$, while the true distance on the globe is $\cos\phi\,d\lambda$.`, t`Conformal means the north–south scale is the same: check $dy/d\phi = \sec\phi$.`, t`So the local scale factor is $\sec\phi = 1/\cos\phi$.`],
          teach: t`Mercator is conformal with scale factor $\sec\phi$: shapes are right locally, sizes grow toward the poles.`,
          explain: t`$\sec ${Math.abs(lat)}^\circ = ${nm(ans, 4)}$. Both directions agree — $dy/d\phi = \sec\phi$ too — which is conformality. Areas grow by $\sec^2\phi = ${nm(ans * ans, 3)}$, which is why Greenland looks about the size of Africa on a Mercator map though it is some fourteen times smaller. Navigators keep it because a constant-bearing course is a straight line on it.`,
        };
      },
    }),
    mcq({
      id: 'cp-penrose', difficulty: 2, transfer: true,
      prompt: t`A Penrose diagram squeezes all of flat spacetime into a finite triangle by a **conformal** rescaling of the metric: every interval is multiplied by a positive factor that varies from point to point. (This is the Lorentzian cousin of the maps in this lesson, an analogy rather than complex analysis.) What does the diagram keep faithfully?`,
      visual: { type: 'graph', params: { x: [-0.3, 3.6], y: [-3.4, 3.4], equal: true, axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
        curves: [{ param: ['0', 't'], t: [-3.1416, 3.1416], color: 'ink3', width: 1.6 }, { param: ['t', '3.1416 - t'], t: [0, 3.1416], color: 'ink2', width: 2 }, { param: ['t', 't - 3.1416'], t: [0, 3.1416], color: 'ink2', width: 2 },
          { param: ['0.4672 + t', '-1 + t'], t: [0, 1.837], color: 'gold', width: 2.2 }, { param: ['(3.1416 - abs(t))*0.3*(1 + 0.3*sin(2*t))', 't'], t: [-3.1416, 3.1416], color: 'accent', width: 2 }],
        points: [{ x: 0, y: 3.1416, label: 'i⁺ (far future)', color: 'ink2', r: 3 }, { x: 0, y: -3.1416, label: 'i⁻ (far past)', color: 'ink2', r: 3 }, { x: 3.1416, y: 0, label: 'i⁰', color: 'ink2', r: 3 }, { x: 1.4, y: -0.1, label: 'light ray', color: 'gold', r: 0, labelDx: 10, labelDy: 8 }] } ,
        caption: 'A schematic Penrose diagram of flat spacetime (r ≥ 0): the edges are where light rays begin and end. The blue curve is a wandering observer’s worldline (schematic); the gold line is a light ray, at 45°.' },
      choices: [
        'Angles — so light rays stay at 45° and the causal structure (what can reach what) is exact',
        'Distances and times, so you can read off how far apart events are',
        'Areas, so the volume of spacetime is preserved',
        'Nothing physical: it is only a picture',
      ],
      answer: 0,
      why: {
        1: 'The rescaling factor shrinks distances more and more toward the edges — infinite distances become finite.',
        2: 'Areas are multiplied by the square of a varying factor, so they are not kept.',
        3: 'The causal structure is exact: two events can signal each other in the diagram exactly when they can in spacetime.',
      },
      hints: ['A conformal rescaling multiplies every length at a point by the same factor.', 'Which property of a light ray’s direction does a common factor leave unchanged?'],
      teach: 'Conformal maps and rescalings keep angles; in spacetime that means light cones keep their 45°, so causal structure survives while distances do not.',
      explain: t`Multiplying $ds^2$ by a positive factor leaves $ds^2 = 0$ unchanged: light rays are still light rays, at $45^\circ$. Penrose diagrams use that to show a whole spacetime — including a black hole’s horizon and singularity — on one page, with causal relations exact and every distance distorted.`,
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 4 (conformal maps) and ch. 12 (harmonic functions and physics)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §§112–118 (conformal mapping)', url: 'https://openlibrary.org/isbn/9780073383170' },
    { label: 'Snyder, Map Projections — A Working Manual, USGS Professional Paper 1395 (1987), §7 (Mercator)', url: 'https://pubs.usgs.gov/publication/pp1395' },
  ],
});
