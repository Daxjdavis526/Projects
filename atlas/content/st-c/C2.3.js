// Helices and the fundamental theorem of curves: κ(s) and τ(s) determine a
// space curve up to a rigid motion; constant κ and τ give exactly the helices.
import { lesson, mcq, num, match, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;

// a helix of curvature k and torsion w, drawn by the dg-frenet sim as a still picture
const helixPic = (k, w, length, caption, at = 0.3 * length) => ({ type: 'dg-frenet', params: { kappa: String(k), tau: String(w), length: r6(length), at: r6(at), fixed: true, readouts: [] }, caption });

export default lesson({
  id: 'st-c.C2.3',
  title: 'Helices and the fundamental theorem of curves',
  minutes: 13, difficulty: 3,
  intro: t`Curvature and torsion were extracted from a curve. The **fundamental theorem of curves** runs the other way: given any smooth functions $\kappa(s) > 0$ and $\tau(s)$ on an interval, there is a unit-speed curve with exactly that curvature and torsion, and it is **unique up to a rigid motion** — a rotation followed by a translation. The proof is the Frenet–Serret system read as a linear differential equation for the frame:

$$\mathbf T' = \kappa\mathbf N, \quad \mathbf N' = -\kappa\mathbf T + \tau\mathbf B, \quad \mathbf B' = -\tau\mathbf N, \qquad \alpha(s) = \alpha(0) + \int_0^s \mathbf T(\sigma)\,d\sigma.$$

Choose a starting point and an orthonormal starting frame; the equations do the rest. The simplest case, $\kappa$ and $\tau$ both constant, gives the **circular helix** — and nothing else.`,
  symbols: [
    { tex: t`\kappa(s),\ \tau(s)`, text: t`the prescribed curvature and torsion, functions of arc length, in $\text{m}^{-1}$` },
    { tex: t`\mathbf T, \mathbf N, \mathbf B`, text: 'the Frenet frame, now the unknown: nine numbers obeying a linear ODE' },
    { tex: t`\alpha(0)`, text: 'the starting point — free, which is the translation in “up to a rigid motion”' },
    { tex: t`\alpha(s)`, text: t`the curve, recovered by integrating its unit tangent` },
  ],
  why: t`“Shape is captured by invariants, everything else is a choice of position” is the pattern of the whole subject. For surfaces the invariants become the two fundamental forms (module C5); for a spacetime, the metric up to coordinate changes. And the Frenet system — a frame carried along a curve by a linear ODE — is the template for parallel transport (C12).`,
  visual: {
    type: 'dg-frenet',
    title: 'Two numbers in, one curve out',
    lead: t`Set the curvature and torsion and the curve is **built** from them by integrating the Frenet–Serret equations. With the growth $g = 0$ they are constant; with $g > 0$ the curvature grows along the curve, $\kappa(s) = \kappa_0 + g\,s$. The dashed curve is the helix with constant $\kappa_0$ and $\tau$, for comparison.`,
    tasks: [
      t`With $g = 0$, any $\kappa_0$ and $\tau$ give a helix, and the frame turns the same way all along it. Set $\tau = 0$: the helix flattens into a circle of radius $1/\kappa_0$.`,
      t`Flip the sign of $\tau$: you get the mirror-image helix, left-handed instead of right-handed. Same $\kappa$, same $|\tau|$, different curve — not a rigid motion of the first.`,
      t`Raise $g$: the curvature grows along the curve, and it winds into ever-tighter coils, leaving the dashed helix behind.`,
    ],
    params: {
      kappa: 'k + g*s', tau: 'w', length: 26,
      sliders: [
        { key: 'k', label: t`$\kappa_0$`, min: 0.2, max: 1.5, step: 0.05, value: 0.6, explain: 'Curvature at the start, per unit length: the reciprocal of the radius of the osculating circle.' },
        { key: 'w', label: t`$\tau$`, min: -1, max: 1, step: 0.05, value: 0.3, explain: 'Torsion: how fast the osculating plane twists. Its sign is the handedness.' },
        { key: 'g', label: t`growth $g$`, min: 0, max: 0.1, step: 0.005, value: 0, explain: t`How fast the curvature increases with arc length: $\kappa(s) = \kappa_0 + g\,s$.` },
      ],
      ghost: { kappa: 'k', tau: 'w' },
      at: 5, speed: 2,
    },
    caption: t`The curve is integrated from $\kappa(s)$ and $\tau(s)$ by fourth-order Runge–Kutta and starts at the same point with the same frame as the dashed helix. Its place and orientation in space are otherwise arbitrary. Frame vectors are drawn shortened.`,
  },
  example: {
    prompt: t`A curve has constant curvature $\kappa = 0.6\ \text{cm}^{-1}$ and constant torsion $\tau = 0.8\ \text{cm}^{-1}$. Show that it is a circular helix, and find its radius, its pitch (rise per turn) and the length of wire in one turn.`,
    visual: helixPic(0.6, 0.8, 4 * Math.PI, t`The helix with $\kappa = 0.6\ \text{cm}^{-1}$ and $\tau = 0.8\ \text{cm}^{-1}$: two turns, built from those two numbers alone.`, 2),
    steps: [
      { label: 'A candidate', text: t`For the helix $\beta(t) = (a\cos t,\ a\sin t,\ bt)$ with $a > 0$: $\beta' = (-a\sin t, a\cos t, b)$, $\beta'' = (-a\cos t, -a\sin t, 0)$, $\beta''' = (a\sin t, -a\cos t, 0)$, so $|\beta'\times\beta''| = a\sqrt{a^2 + b^2}$ and $(\beta'\times\beta'')\cdot\beta''' = a^2 b$.` },
      { label: 'Its invariants', text: t`$\kappa = \dfrac{a\sqrt{a^2 + b^2}}{(a^2 + b^2)^{3/2}} = \dfrac{a}{a^2 + b^2}$ and $\tau = \dfrac{a^2b}{a^2(a^2 + b^2)} = \dfrac{b}{a^2 + b^2}$ — both constant.` },
      { label: 'Invert', text: t`$\kappa^2 + \tau^2 = \dfrac{1}{a^2 + b^2}$, so $a = \dfrac{\kappa}{\kappa^2 + \tau^2}$ and $b = \dfrac{\tau}{\kappa^2 + \tau^2}$. Here $\kappa^2 + \tau^2 = 1\ \text{cm}^{-2}$: $a = 0.6$ cm and $b = 0.8$ cm.` },
      { label: 'Uniqueness', text: t`This helix has the given $\kappa$ and $\tau$; by the fundamental theorem, every curve with them is this helix after a rigid motion. So the curve is a circular helix of radius 0.6 cm.` },
      { label: 'Pitch and length', text: t`One turn is $t$ from 0 to $2\pi$: it rises $2\pi b = 5.03$ cm and has length $2\pi\sqrt{a^2 + b^2} = 2\pi/\sqrt{\kappa^2 + \tau^2} = 6.28$ cm.` },
      { label: 'Sense check', text: t`$\tau \to 0$ gives $b = 0$, $a = 1/\kappa$: the circle ✓. $\kappa \to 0$ gives $a = 0$: a straight line ✓. And $\tau > 0$ goes with $b > 0$, the right-handed helix ✓.` },
    ],
    answer: t`A right-handed circular helix of radius $a = \kappa/(\kappa^2 + \tau^2) = 0.6$ cm and pitch $2\pi\tau/(\kappa^2 + \tau^2) = 5.03$ cm, with $6.28$ cm of wire per turn.`,
  },
  practice: [
    num({
      id: 'helix-radius', difficulty: 2,
      gen(r) {
        const [k, w] = r.pick([[0.5, 0.5], [0.3, 0.4], [1, 2], [0.8, 0.6], [2, 1], [0.25, 0.1]]);
        const a = k / (k * k + w * w);
        return {
          prompt: t`A curve has constant curvature $\kappa = ${k}\ \text{m}^{-1}$ and torsion $\tau = ${w}\ \text{m}^{-1}$. What is the radius of the cylinder its helix winds round?`,
          visual: helixPic(k, w, (4 * Math.PI) / Math.hypot(k, w), t`Two turns of the curve, built from $\kappa$ and $\tau$ (the scale is not shown).`),
          answer: a, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: 1 / k, feedback: t`$1/\kappa$ is the radius of the osculating circle, which is bigger than the helix’s own radius: the helix also climbs, so it bends less than a circle of its radius. Use $a = \kappa/(\kappa^2 + \tau^2)$.` }],
          hints: [t`For $(a\cos t, a\sin t, bt)$: $\kappa = a/(a^2 + b^2)$ and $\tau = b/(a^2 + b^2)$.`, t`So $\kappa^2 + \tau^2 = 1/(a^2 + b^2)$ and $a = \kappa/(\kappa^2 + \tau^2)$.`],
          teach: t`A helix’s radius is $\kappa/(\kappa^2 + \tau^2)$, smaller than the radius of curvature $1/\kappa$.`,
          explain: t`$a = \dfrac{${k}}{${k}^2 + ${w}^2} = ${nice(a, 4)}$ m, against $1/\kappa = ${nice(1 / k, 4)}$ m for the osculating circle — whose centre lies on the far side of the axis.`,
        };
      },
    }),
    num({
      id: 'turn-length', difficulty: 2,
      gen(r) {
        const [k, w] = r.pick([[3, 4], [0.6, 0.8], [5, 12], [1, 1], [0.12, 0.05]]);
        const L = (2 * Math.PI) / Math.hypot(k, w);
        return {
          prompt: t`How much arc length does one full turn of a helix with $\kappa = ${k}\ \text{m}^{-1}$ and $\tau = ${w}\ \text{m}^{-1}$ take, in metres?`,
          visual: helixPic(k, w, L, t`One turn, with the Frenet frame at a point. The frame turns once about the helix’s axis per turn.`, L / 3),
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (2 * Math.PI) / k, feedback: t`$2\pi/\kappa$ would be a full circle of radius $1/\kappa$. The frame turns about the axis at the rate $\sqrt{\kappa^2 + \tau^2}$ per metre, not $\kappa$.` }, { value: (2 * Math.PI) / (k + w), feedback: t`The bending rate $\kappa$ and twisting rate $\tau$ are perpendicular parts of one rotation: they combine as $\sqrt{\kappa^2 + \tau^2}$.` }],
          hints: [t`One turn has length $2\pi\sqrt{a^2 + b^2}$ for $(a\cos t, a\sin t, bt)$.`, t`And $\sqrt{a^2 + b^2} = 1/\sqrt{\kappa^2 + \tau^2}$.`],
          teach: t`One turn of a helix has length $2\pi/\sqrt{\kappa^2 + \tau^2}$ — one full revolution of its Darboux vector’s rotation.`,
          explain: t`$L = \dfrac{2\pi}{\sqrt{${k}^2 + ${w}^2}} = ${nice(L, 4)}$ m. The frame rotates about the fixed axis $\tau\mathbf T + \kappa\mathbf B$ at $\sqrt{\kappa^2 + \tau^2}$ rad/m, so a full turn takes that length.`,
        };
      },
    }),
    match({
      id: 'identify', difficulty: 2,
      prompt: t`Match each condition on a unit-speed curve (with $\kappa > 0$ unless it says otherwise) to the curves that satisfy it.`,
      left: [t`$\kappa = 0$ everywhere`, t`$\kappa$ constant, $\tau = 0$`, t`$\kappa$ and $\tau$ both constant, $\tau \ne 0$`, t`$\tau/\kappa$ constant`, t`$\tau = 0$, $\kappa$ not constant`],
      right: ['a straight line', 'a circle (or an arc of one)', 'a circular helix', 'a generalized helix: T keeps a fixed angle to some axis', 'a plane curve that is not a circle', 'a curve on a sphere'],
      answer: [0, 1, 2, 3, 4],
      visual: helixPic(0.5, 0.5, 18, 'A circular helix: constant κ and τ.'),
      hints: ['Use the fundamental theorem: find one curve with the property, and every other is a rigid motion of it.', t`For $\tau/\kappa$ constant (Lancret’s theorem), compare the Darboux vector $\tau\mathbf T + \kappa\mathbf B$ divided by $\kappa$: it is constant.`],
      teach: 'Each pattern of κ and τ picks out a family of curves; constant κ and τ give exactly the circular helices.',
      explain: t`$\kappa = 0$ means $\mathbf T$ is constant: a line. $\tau = 0$ means planar, and constant $\kappa$ in a plane means a circle (lesson C1.3). Constant $\kappa, \tau$ is the helix, by uniqueness. Lancret: $\tau/\kappa = c$ makes $\mathbf u = c\mathbf T + \mathbf B$ constant ($\mathbf u' = c\kappa\mathbf N - \tau\mathbf N = 0$), and $\mathbf T\cdot\mathbf u = c$ is a fixed angle. Curves on spheres satisfy a different condition (on $\kappa$, $\kappa'$ and $\tau$).`,
    }),
    order({
      id: 'uniqueness-proof', difficulty: 4,
      prompt: t`Prove uniqueness: two unit-speed curves $\alpha$, $\bar\alpha$ with the same $\kappa(s) > 0$ and $\tau(s)$ differ by a rigid motion. Order the steps.`,
      visual: { type: 'dg-frenet', params: { kappa: '0.6 + 0.04*s', tau: '0.3 - 0.02*s', length: 22, at: 0, fixed: true, readouts: [] }, caption: 'A curve with varying κ and τ. Any curve with the same two functions is a copy of it, moved rigidly.' },
      items: [
        t`Move $\bar\alpha$ by a rigid motion so that at $s = 0$ the two curves share a point and a Frenet frame. (A rigid motion does not change $\kappa$ or $\tau$.)`,
        t`Let $f(s) = \mathbf T\cdot\bar{\mathbf T} + \mathbf N\cdot\bar{\mathbf N} + \mathbf B\cdot\bar{\mathbf B}$; then $f(0) = 3$.`,
        t`By the Frenet–Serret equations, with the same $\kappa$ and $\tau$ for both, the terms of $f'$ cancel in pairs: $f' = 0$.`,
        t`So $f \equiv 3$. Each dot product is at most 1, so each equals 1: $\mathbf T = \bar{\mathbf T}$ (and $\mathbf N = \bar{\mathbf N}$, $\mathbf B = \bar{\mathbf B}$) for all $s$.`,
        t`Then $\alpha' = \bar\alpha'$ with $\alpha(0) = \bar\alpha(0)$, so $\alpha = \bar\alpha$.`,
      ],
      hints: ['First make the curves agree at one point, then show they cannot drift apart.', t`Expand $f' = \mathbf T'\cdot\bar{\mathbf T} + \mathbf T\cdot\bar{\mathbf T}' + \dots$ with $\mathbf T' = \kappa\mathbf N$ etc.: you get $\kappa\mathbf N\cdot\bar{\mathbf T} + \kappa\mathbf T\cdot\bar{\mathbf N} - \kappa\mathbf T\cdot\bar{\mathbf N} - \dots$.`],
      teach: 'Uniqueness: line up the frames at one point, and the Frenet equations keep them lined up.',
      explain: t`This is do Carmo’s proof. It needs only that the frame obeys a linear ODE with an antisymmetric matrix: standard ODE uniqueness would do as well. A reflection is not allowed in the first step — it would flip $\tau$ — which is why mirror images are genuinely different curves.`,
    }),
    mcq({
      id: 'rigid-motion', difficulty: 3,
      prompt: t`Two space curves with $\kappa > 0$ have the same curvature $\kappa(s)$ and the same torsion $\tau(s)$, with $\tau$ not identically zero. Which could be true?`,
      visual: { type: 'dg-frenet', params: { kappa: '0.7', tau: '0.35', length: 18, ghost: { kappa: '0.7', tau: '-0.35' }, at: 4, fixed: true, readouts: [] }, caption: 'A right-handed helix (solid) and its mirror image (dashed): same κ, opposite τ.' },
      choices: [
        'One is the other rotated and translated',
        'One is the mirror image of the other',
        'One is the other scaled up by a factor of 2',
        'They have different lengths per turn of the frame',
      ],
      answer: 0,
      why: {
        1: t`A reflection flips the sign of $\tau$; with $\tau \ne 0$ the mirror image has torsion $-\tau(s)$, not $\tau(s)$.`,
        2: t`Scaling by 2 halves both $\kappa$ and $\tau$: curvature has units of 1/length.`,
        3: t`The frame’s rotation rate $\sqrt{\kappa^2 + \tau^2}$ is the same function of $s$ for both.`,
      },
      hints: ['Which motions leave both κ and τ unchanged?', 'What does a reflection do to handedness?'],
      teach: 'The fundamental theorem determines a curve up to a proper rigid motion — rotation and translation, no reflection.',
      explain: 'Rotations and translations preserve lengths, angles and orientation, so they keep κ and τ; by uniqueness that is the only freedom. Reflections keep κ but negate τ, scalings change both.',
    }),
    num({
      id: 'helix-angle', difficulty: 3,
      gen(r) {
        const [k, w] = r.pick([[1, 1], [0.6, 0.8], [0.8, 0.6], [0.3, 1], [2, 0.5]]);
        const ang = Math.atan2(k, w) / DEG;
        return {
          prompt: t`A helix has $\kappa = ${k}\ \text{m}^{-1}$ and $\tau = ${w}\ \text{m}^{-1}$. What angle does its tangent make with its axis, in degrees?`,
          visual: helixPic(k, w, (4 * Math.PI) / Math.hypot(k, w), t`Two turns. The tangent keeps the same angle to the vertical axis all the way along.`),
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 90 - ang, feedback: t`That is the angle to the plane perpendicular to the axis — the pitch angle. The angle to the axis $\hat{\mathbf z}$ has $\cos\theta = \mathbf T\cdot\hat{\mathbf z}$.` }].filter((e) => Math.abs(e.value - ang) > 0.5),
          hints: [t`For $(a\cos t, a\sin t, bt)$, $\mathbf T = (-a\sin t, a\cos t, b)/\sqrt{a^2 + b^2}$, so $\cos\theta = b/\sqrt{a^2 + b^2}$.`, t`With $a = \kappa/(\kappa^2 + \tau^2)$, $b = \tau/(\kappa^2 + \tau^2)$: $\tan\theta = a/b = \kappa/\tau$.`],
          teach: t`A helix’s tangent keeps a fixed angle $\theta$ to its axis, with $\tan\theta = \kappa/\tau$.`,
          explain: t`$\theta = \arctan(${k}/${w}) = ${nice(ang, 4)}^\circ$. The same holds for any curve with constant $\tau/\kappa$ — Lancret’s generalized helices — with the axis along the Darboux vector.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-antenna', difficulty: 3, transfer: true,
      gen(r) {
        const al = r.pick([12, 13, 14]);
        const lam = 0.19029, a = lam / (2 * Math.PI), k = Math.cos(al * DEG) ** 2 / a, w = (Math.sin(al * DEG) * Math.cos(al * DEG)) / a;
        const which = r.pick(['kappa', 'tau']);
        const ans = which === 'kappa' ? k : w;
        return {
          prompt: t`An axial-mode helical antenna for GPS L1 (1575.42 MHz, wavelength $\lambda = 19.03$ cm) is wound with circumference equal to one wavelength and a pitch angle of $${al}^\circ$ (the angle between the wire and the plane perpendicular to the axis). What is the ${which === 'kappa' ? 'curvature $\\kappa$' : 'torsion $\\tau$'} of the wire, in $\text{m}^{-1}$?`,
          visual: helixPic(r6(k / 10), r6(w / 10), r6((6 * Math.PI) / Math.hypot(k / 10, w / 10)), t`Three turns of the winding, built from its $\kappa$ and $\tau$ (scale not shown). Real antennas have a ground plane and a feed, not drawn.`),
          answer: ans, units: 'm^-1', tol: { rel: 0.01 },
          errors: [{ value: 1 / a, feedback: t`$1/a$ would be the curvature of a flat circle of radius $a$. A helix climbs, so its curvature is smaller: $\kappa = a/(a^2 + b^2)$.` }, { value: which === 'kappa' ? w : k, feedback: which === 'kappa' ? t`That is the torsion $b/(a^2 + b^2)$; the curvature has $a$ on top.` : t`That is the curvature $a/(a^2 + b^2)$; the torsion has $b$ on top.` }],
          hints: [t`Radius $a = \lambda/(2\pi)$; the rise per turn is $S = 2\pi a\tan ${al}^\circ$, so $b = S/(2\pi) = a\tan ${al}^\circ$.`, t`Then $\kappa = \dfrac{a}{a^2 + b^2} = \dfrac{\cos^2 ${al}^\circ}{a}$ and $\tau = \dfrac{b}{a^2 + b^2} = \dfrac{\sin ${al}^\circ\cos ${al}^\circ}{a}$.`],
          teach: 'Turn a helix’s radius and pitch into a and b, then use κ = a/(a² + b²), τ = b/(a² + b²).',
          explain: t`$a = 19.03/(2\pi) = ${nice(a * 100, 4)}$ cm and $b = a\tan ${al}^\circ = ${nice(a * Math.tan(al * DEG) * 100, 4)}$ cm, so $\kappa = ${nice(k, 4)}\ \text{m}^{-1}$ and $\tau = ${nice(w, 4)}\ \text{m}^{-1}$. Kraus’s design rule — circumference near one wavelength, pitch angle 12–14° — gives the circularly polarized beam along the axis that GPS needs, and the sense of the winding (the sign of $\tau$) sets which circular polarization.`,
        };
      },
    }),
    num({
      id: 'cp-pitch', difficulty: 2,
      gen(r) {
        const [k, w] = r.pick([[0.5, 0.5], [0.3, 0.4], [0.8, 0.6], [1, 2], [0.6, 0.2]]);
        const P = (2 * Math.PI * w) / (k * k + w * w);
        return {
          prompt: t`A curve has constant $\kappa = ${k}\ \text{m}^{-1}$ and $\tau = ${w}\ \text{m}^{-1}$. How far does it rise along its axis per turn?`,
          visual: helixPic(k, w, (4 * Math.PI) / Math.hypot(k, w), 'Two turns of the curve built from κ and τ.'),
          answer: P, units: 'm', tol: { rel: 0.005 },
          hints: [t`The pitch of $(a\cos t, a\sin t, bt)$ is $2\pi b$, with $b = \tau/(\kappa^2 + \tau^2)$.`],
          teach: t`Pitch $= 2\pi\tau/(\kappa^2 + \tau^2)$.`,
          explain: t`$b = ${w}/(${k}^2 + ${w}^2) = ${nice(w / (k * k + w * w), 4)}$ m, so the pitch is $2\pi b = ${nice(P, 4)}$ m.`,
        };
      },
    }),
    mcq({
      id: 'cp-circle', difficulty: 2,
      prompt: t`A unit-speed curve has $\kappa(s) = 2\ \text{m}^{-1}$ and $\tau(s) = 0$ for $0 \le s \le 10$ m. What is it?`,
      visual: helixPic(2, 0, 3, 'Part of the curve, built from κ and τ.'),
      choices: [
        'A circle of radius 0.5 m, traced about 3.2 times',
        'An arc of a circle of radius 2 m',
        'A helix of radius 0.5 m',
        'Not determined: many different curves have these κ and τ',
      ],
      answer: 0,
      why: {
        1: t`The radius is $1/\kappa$, not $\kappa$.`,
        2: t`With $\tau = 0$ the curve is planar, and a planar curve of constant curvature is a circle.`,
        3: 'It is determined up to a rigid motion: all such curves are the same circle, moved.',
      },
      hints: [t`$\tau = 0$ means planar; constant $\kappa$ in a plane means…?`],
      teach: 'Constant κ with zero torsion is a circle of radius 1/κ — up to rigid motion, the only such curve.',
      explain: t`A circle of radius $1/2$ m has circumference $\pi$ m, so 10 m of curve goes round $10/\pi \approx 3.18$ times.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §1-5 and Appendix to ch. 4 (fundamental theorem)', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §2.3', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
    { label: 'Kraus & Marhefka, Antennas for All Applications (3rd ed.), ch. 8 (helical antennas)', url: 'https://www.mheducation.com/highered/product/antennas-all-applications-kraus-marhefka/M9780072321036.html' },
  ],
});
