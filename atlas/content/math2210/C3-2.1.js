// Curves in space — vector-valued functions r(t) = ⟨x(t), y(t), z(t)⟩: three
// ordinary functions moving together, their shadows on the coordinate planes,
// curves where two surfaces meet, helices in magnetic fields, orbits.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';
import { pickExpr, sterm } from './_space.js';

const t = String.raw;
const TAU = 2 * Math.PI;
const D = Math.PI / 180;

// a curve picture on c3-curve
const curvePic = (param, range, extra = {}, caption) => ({
  type: 'c3-curve',
  params: { curve: { param, t: range }, show: ['trail'], readouts: [], play: false, ...extra },
  caption: caption || 'Drag to rotate. The gold point is r(t) at the time in question.',
});
// a cylinder x² + y² = R² as a wire frame, for calc-vectors3d
const cylinderWire = (R, h0, h1, color = 'teal') => ({
  curves: [h0, (h0 + h1) / 2, h1].map((h) => ({ param: [`${R}*cos(t)`, `${R}*sin(t)`, `${h}`], t: [0, TAU], color })),
  segments: [0, 1, 2, 3, 4, 5].map((k) => ({ from: [R * Math.cos((k * Math.PI) / 3), R * Math.sin((k * Math.PI) / 3), h0], to: [R * Math.cos((k * Math.PI) / 3), R * Math.sin((k * Math.PI) / 3), h1], color })),
});

// the cylinder x² + y² = R² cut by the plane z = ax + by + c, scaled to fit
// (a uniform scale keeps the plane's normal and the curve's shape)
function weldPic(R, a, b, c, caption) {
  const m = R * Math.hypot(a, b), s = 2.6 / Math.max(R, c + m, m - c), Rs = R * s;
  const wire = cylinderWire(Rs, s * (c - m) - 0.4, s * (c + m) + 0.4);
  const curve = { param: [`${Rs}*cos(t)`, `${Rs}*sin(t)`, `${s}*(${a * R}*cos(t) + ${b * R}*sin(t) + ${c})`], t: [0, TAU], color: 'gold', width: 3 };
  return {
    type: 'calc-vectors3d',
    // seen from 50° round from the plane's uphill side, so the plane is never edge-on
    params: { range: 3, yaw: Math.atan2(-b, -a) + 0.9, pitch: 0.42, segments: wire.segments, curves: [...wire.curves, curve], planes: [{ normal: [-a, -b, 1], point: [0, 0, c * s], size: Rs * Math.sqrt(1 + a * a + b * b), color: 'violet', alpha: 0.16 }] },
    caption,
  };
}

// the Explore's five curves, all for t in [0, 4π]
const S = '(1.4*(t - 2*pi)/(2*pi))', U = '(t/2)';
const CURVES = [
  ['2*cos(t)', '2*sin(t)', '0.2*t'],
  ['2.6*t/(4*pi)*cos(1.5*t)', '2.6*t/(4*pi)*sin(1.5*t)', '2.6*t/(4*pi)'],
  [S, `${S}^2`, `${S}^3`],
  ['1 + cos(t)', 'sin(t)', '2*sin(t/2)'],
  [`0.8*(sin(${U}) + 2*sin(2*${U}))`, `0.8*(cos(${U}) - 2*cos(2*${U}))`, `-0.8*sin(3*${U})`],
];

const R_EARTH = 6371;
const ORBITS = [['the International Space Station', 420, 51.6], ['the Hubble Space Telescope', 540, 28.5], ['the Tiangong space station', 390, 41.5], ['a sun-synchronous imaging satellite', 700, 98.2]];

export default lesson({
  id: 'math2210.C3-2.1',
  title: 'Curves in space',
  minutes: 10, difficulty: 2,
  intro: t`A **vector-valued function** assigns a point of space to each value of a parameter $t$:

$$\vec r(t) = \langle x(t),\ y(t),\ z(t)\rangle$$

As $t$ runs, the tip of $\vec r(t)$ traces a **space curve**: three ordinary functions moving together, one for each coordinate. Calculus II drew parametric curves in the plane; in space the third component lets a curve twist out of every plane. The **helix** $\vec r(t) = \langle a\cos t,\ a\sin t,\ bt\rangle$ is the path of a charged particle spiralling along a magnetic field line. And where two surfaces meet, the curve they share is found by parametrizing one surface and substituting into the other.`,
  symbols: [
    { tex: '\\vec r(t)', text: t`the position vector of the moving point at parameter value $t$; its tip traces the curve` },
    { tex: 't', text: t`the parameter — very often time. Different parametrizations can trace the same curve faster, slower or backward` },
    { tex: 'x(t),\\ y(t),\\ z(t)', text: t`the **component functions**: ordinary one-variable functions. Each one alone is the curve’s shadow measured along one axis` },
    { tex: '\\text{domain}', text: t`the values of $t$ for which all three components are defined` },
  ],
  why: t`Trajectories are space curves — the next three lessons follow a moving point’s velocity, acceleration and curvature — and the work done along a path (line integrals, C3-5.2) is computed on a parametrized curve. In relativity a particle’s whole history is a curve $x^\mu(\tau)$ through spacetime: its worldline.`,
  visual: {
    type: 'c3-curve',
    title: 'Three functions, one curve',
    lead: t`Pick a curve, press **Play** and watch the point trace it; the readouts are its three coordinates. Switch on the shadows: the dashed curves are the curve’s projections onto the floor and the two back walls — each is a plain two-variable picture of two of the component functions.`,
    tasks: [
      t`**Helix** with shadows: on the floor the curve is a circle, $x^2 + y^2 = 4$; on the walls, sine waves. Three Calculus I functions, moving together.`,
      t`**Twisted cubic** $\langle s, s^2, s^3\rangle$: its floor shadow is the parabola $y = x^2$ and its back-wall shadow the cubic $z = x^3$.`,
      t`**Viviani’s curve** is where the sphere $x^2 + y^2 + z^2 = 4$ meets the cylinder $(x - 1)^2 + y^2 = 1$: press Play and watch it trace a figure-eight across the sphere.`,
    ],
    params: {
      curve: { param: [0, 1, 2].map((k) => pickExpr('q', CURVES.map((c) => c[k]))), t: [0, 4 * Math.PI] },
      choices: [{ key: 'q', label: 'Curve', options: [[0, 'Helix'], [1, 'Conical spiral'], [2, 'Twisted cubic'], [3, 'Viviani’s curve'], [4, 'Trefoil knot']], value: 0, explain: 'Helix $\\langle 2\\cos t, 2\\sin t, 0.2t\\rangle$; conical spiral, on the cone $z = \\sqrt{x^2 + y^2}$; twisted cubic $\\langle s, s^2, s^3\\rangle$; Viviani $\\langle 1 + \\cos t, \\sin t, 2\\sin\\frac t2\\rangle$; a trefoil knot.' }],
      at: 2, show: ['trail', 'shadows'], toggles: ['shadows', 'v'], scale: { v: 0.6 }, speed: 1.5,
      readouts: ['t', 'x', 'y', 'z'],
    },
    caption: 'Drag to rotate; scroll or pinch to zoom. The floor grid has one square per unit; shadows are drawn on the floor (z = 0) and on the back walls x = −3 and y = −3.',
  },
  example: {
    prompt: t`A fuel tank wall is the cylinder $x^2 + y^2 = 4$ (metres), and a slanted internal bulkhead lies in the plane $y + z = 3$. Find a vector function for the curve along which they must be welded, and describe it.`,
    visual: { type: 'calc-vectors3d', params: { range: 3.6, ...cylinderWire(2, 0, 5), planes: [{ normal: [0, 1, 1], d: 3, centre: [0, 0, 3], size: 3, color: 'violet', alpha: 0.18 }], curves: [...cylinderWire(2, 0, 5).curves, { param: ['2*cos(t)', '2*sin(t)', '3 - 2*sin(t)'], t: [0, TAU], color: 'gold', width: 3 }] }, caption: 'Drag to rotate. The tank wall (teal wire frame), the bulkhead plane (violet) and the weld line where they meet (gold).' },
    steps: [
      { label: 'Parametrize one surface', text: t`Every point of the cylinder can be written $x = 2\cos t$, $y = 2\sin t$, with $z$ still free. That uses up the first equation.` },
      { label: 'Substitute into the other', text: t`The plane says $z = 3 - y = 3 - 2\sin t$. So the shared curve is $\vec r(t) = \langle 2\cos t,\ 2\sin t,\ 3 - 2\sin t\rangle$, $0 \le t \le 2\pi$.` },
      { label: 'Check both equations', text: t`$x^2 + y^2 = 4\cos^2 t + 4\sin^2 t = 4$ ✓ and $y + z = 2\sin t + 3 - 2\sin t = 3$ ✓.` },
      { label: 'Describe it', text: t`The curve is flat (it lies in a plane) and closed: an **ellipse**. Its highest point is $z = 5$ at $t = 3\pi/2$, its lowest $z = 1$ at $t = \pi/2$. Across the tank it is 4 m wide; along the slope it stretches to $2\sqrt2 \approx 2.83$ m from the centre, because the plane is tilted $45^\circ$.` },
    ],
    answer: t`$\vec r(t) = \langle 2\cos t,\ 2\sin t,\ 3 - 2\sin t\rangle$, $0 \le t \le 2\pi$: a tilted ellipse with semi-axes $2$ and $2\sqrt2$ m, rising from $z = 1$ to $z = 5$.`,
  },
  practice: [
    num({
      id: 'position', difficulty: 1,
      gen(r) {
        const a = r.pick([2, 3]), b = r.int(1, 4), c = r.int(2, 6), t0 = r.pick([-1, 1, 2]), k = r.int(0, 2);
        const f = (u) => [a * u, u * u - b, c - u ** 3], P = f(t0), name = 'xyz'[k];
        const L = Math.max(3, Math.ceil(Math.max(...P.map(Math.abs))) + 1);
        // the stretch of curve around t0 that stays inside the drawn box
        const inside = (u) => f(u).every((v) => Math.abs(v) <= L);
        let lo = t0, hi = t0;
        while (lo > -3 && inside(lo - 0.02)) lo -= 0.02;
        while (hi < 3 && inside(hi + 0.02)) hi += 0.02;
        return {
          prompt: t`For $\vec r(t) = \langle ${a}t,\ t^2 - ${b},\ ${c} - t^3\rangle$, what is the $${name}$-coordinate of the point at $t = ${t0}$?`,
          answer: P[k], tol: { rel: 1e-9, abs: 1e-9 },
          hints: [t`Substitute $t = ${t0}$ into the $${name}$-component.`],
          teach: 'Each coordinate of a point on the curve is one component function evaluated at that t.',
          explain: t`$\vec r(${t0}) = \langle ${P[0]},\ ${P[1]},\ ${P[2]}\rangle$, so $${name} = ${P[k]}$.`,
          visual: curvePic([`${a}*t`, `t^2 - ${b}`, `${c} - t^3`], [nice(lo, 3), nice(hi, 3)], { at: t0, fixed: true, range: L }),
        };
      },
    }),
    mcq({
      id: 'domain', difficulty: 2,
      prompt: t`What is the domain of $\vec r(t) = \left\langle \sqrt{4 - t},\ \ln(t + 1),\ \dfrac{1}{t - 2}\right\rangle$?`,
      choices: [t`$-1 < t \le 4$ with $t \ne 2$`, t`$t \le 4$`, t`$-1 < t < 2$`, t`All $t > -1$`],
      answer: 0,
      why: {
        1: t`That is the domain of the first component only. The curve exists only where **all three** components are defined.`,
        2: t`The third component fails only at $t = 2$ itself; the stretch $2 < t \le 4$ is still allowed.`,
        3: t`The square root needs $4 - t \ge 0$, so $t \le 4$, and $t = 2$ is excluded too.`,
      },
      hints: ['Find the domain of each component, then keep only the t that work for all three.', t`$\sqrt{4 - t}$: $t \le 4$. $\ln(t + 1)$: $t > -1$. $\frac{1}{t - 2}$: $t \ne 2$.`],
      teach: 'The domain of a vector function is where every component is defined: the intersection of their domains.',
      explain: t`Intersecting $t \le 4$, $t > -1$ and $t \ne 2$ gives $(-1, 2)\cup(2, 4]$. Near $t = 2$ the third component blows up, so the curve runs off to infinity there and comes back on the other side.`,
      visual: { type: 'graph', params: { x: [-1.6, 4.6], y: [-4, 4], aspect: 'wide', xlabel: 't', ylabel: '', curves: [{ fn: 'sqrt(4 - x)', color: 'accent', label: 'x(t)', labelAt: 3.6 }, { fn: 'ln(x + 1)', color: 'warn', label: 'y(t)', labelAt: -0.6, labelDx: 8, labelDy: 10 }, { fn: '1/(x - 2)', color: 'good', label: 'z(t)', labelAt: 2.35 }] }, caption: 'The three component functions plotted against t.' },
    }),
    num({
      id: 'helix-pitch', difficulty: 2,
      gen(r) {
        const B = r.pick([0.05, 0.1, 0.2]), vp = r.pick([2, 5, 8]) * 1e5, w = (1.602176634e-19 * B) / 1.67262192e-27;
        const pitch = (2 * Math.PI * vp) / w;
        return {
          prompt: t`In a magnetic field of $${B}$ T along the $z$-axis, a proton follows the helix $\vec r(t) = \langle R\cos\omega t,\ R\sin\omega t,\ v_\parallel t\rangle$ with $\omega = ${tex(w, 3)}$ rad/s and $v_\parallel = ${tex(vp, 2)}$ m/s. How far along the field does it advance in one full turn (the **pitch**)? Give 3 significant figures, in metres.`,
          answer: pitch, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: vp / w, feedback: t`One full turn is $\omega t = 2\pi$, not $\omega t = 1$: the time per turn is $2\pi/\omega$.` }],
          hints: [t`One turn takes the time in which $\omega t$ grows by $2\pi$: $t = 2\pi/\omega$.`, t`In that time $z$ grows by $v_\parallel\cdot\frac{2\pi}{\omega}$.`],
          teach: 'A helix ⟨R cos ωt, R sin ωt, ct⟩ makes one turn every 2π/ω and rises 2πc/ω per turn.',
          explain: t`One turn takes $2\pi/\omega = ${tex((2 * Math.PI) / w, 3)}$ s, during which $z$ advances $v_\parallel\cdot2\pi/\omega = ${fmt(pitch, 3)}$ m. Protons trapped in Earth’s Van Allen belts spiral along field lines in exactly this way.`,
          visual: curvePic(['1.4*cos(t)', '1.4*sin(t)', '0.18*(t - 3*pi)'], [0, 6 * Math.PI], { at: 9, fixed: true }, 'Drag to rotate. The shape of the path: a helix about the field direction (proportions not to scale).'),
        };
      },
    }),
    mcq({
      id: 'shadow', difficulty: 2,
      prompt: t`What is the shadow (projection) of the twisted cubic $\vec r(t) = \langle t,\ t^2,\ t^3\rangle$ on the $xz$-plane?`,
      choices: [t`The cubic $z = x^3$`, t`The parabola $y = x^2$`, t`The parabola $z = x^2$`, t`The curve $y = x^3$`],
      answer: 0,
      why: {
        1: t`That is the shadow on the floor, the $xy$-plane, where $z$ is dropped.`,
        2: t`On the $xz$-plane you keep $x = t$ and $z = t^3$; $t^2$ belongs to $y$, which the projection drops.`,
        3: t`Dropping $z$ would leave $\langle t, t^2\rangle$, not $y = x^3$.`,
      },
      hints: [t`Projecting onto the $xz$-plane sets the $y$-component to zero and keeps $x$ and $z$.`, t`$x = t$ and $z = t^3$: eliminate $t$.`],
      teach: 'Projecting a space curve onto a coordinate plane drops one component; eliminating t gives the shadow’s equation.',
      explain: t`On the $xz$-plane the point is $\langle t, 0, t^3\rangle$; with $x = t$, that is $z = x^3$.`,
      visual: curvePic(['t', 't^2', 't^3'], [-1.4, 1.4], { at: 0.9, fixed: true, show: ['trail', 'shadows'] }, 'Drag to rotate. The twisted cubic and its dashed shadows on the floor and the back walls.'),
    }),
    mcq({
      id: 'on-surface', difficulty: 2,
      prompt: t`The curve $\vec r(t) = \langle t\cos t,\ t\sin t,\ t\rangle$ for $t \ge 0$ lies on which surface?`,
      choices: [t`The cone $z = \sqrt{x^2 + y^2}$`, t`The cylinder $x^2 + y^2 = 1$`, t`The paraboloid $z = x^2 + y^2$`, t`The sphere $x^2 + y^2 + z^2 = 1$`],
      answer: 0,
      why: {
        1: t`$x^2 + y^2 = t^2$, which grows with $t$: the curve moves away from the axis, so it cannot stay on a cylinder.`,
        2: t`$x^2 + y^2 = t^2$, but $z = t$, not $t^2$.`,
        3: t`$x^2 + y^2 + z^2 = 2t^2$, which is not constant.`,
      },
      hints: [t`Compute $x^2 + y^2$ for a point of the curve.`, t`$x^2 + y^2 = t^2$ and $z = t$: compare.`],
      teach: 'To find a surface a curve lies on, combine its components until t cancels out.',
      explain: t`$x^2 + y^2 = t^2(\cos^2 t + \sin^2 t) = t^2 = z^2$, with $z = t \ge 0$: the point always satisfies $z = \sqrt{x^2 + y^2}$. The curve is a **conical spiral**, winding out and up the cone.`,
      visual: curvePic(['0.25*t*cos(t)', '0.25*t*sin(t)', '0.25*t'], [0, 12], { at: 9, fixed: true, range: 3 }, 'Drag to rotate. The curve for 0 ≤ t ≤ 12, drawn at quarter scale.'),
    }),
    expr({
      id: 'intersection-z', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3]), a = r.intExcept(-2, 2, [0]), b = r.intExcept(-2, 2, [0]), c = r.int(1, 4);
        const ans = `${a * R}*cos(t) + ${b * R}*sin(t) + ${c}`;
        return {
          prompt: t`The cylinder $x^2 + y^2 = ${R * R}$ meets the plane $z = ${a === 1 ? '' : a === -1 ? '-' : a}x${sterm(b, 'y')} + ${c}$. Parametrize their curve of intersection with $x = ${R}\cos t$, $y = ${R}\sin t$: what is $z(t)$?`,
          answer: ans, answerTeX: t`${a * R}\cos t ${b < 0 ? '-' : '+'} ${Math.abs(b * R)}\sin t + ${c}`, lhs: 'z',
          vars: { t: [0, 6.2] },
          errors: [{ answer: `${a}*cos(t) + ${b}*sin(t) + ${c}`, feedback: t`Substitute the whole of $x = ${R}\cos t$ and $y = ${R}\sin t$, factors of ${R} included.` }],
          hints: ['The plane gives z directly in terms of x and y: substitute the cylinder’s parametrization.'],
          teach: 'Parametrize one surface, then let the other surface’s equation supply the remaining coordinate.',
          explain: t`$z = ${a === 1 ? '' : a === -1 ? '-' : a}(${R}\cos t) ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}(${R}\sin t) + ${c} = ${a * R}\cos t ${b < 0 ? '-' : '+'} ${Math.abs(b * R)}\sin t + ${c}$: a tilted ellipse round the cylinder.`,
          visual: weldPic(R, a, b, c, 'Drag to rotate. The cylinder (teal wire frame), the plane (violet) and their curve of intersection (gold), all scaled down together.'),
        };
      },
    }),
    mcq({
      id: 'collision', difficulty: 3,
      prompt: t`Two drones fly the paths $\vec r_A(t) = \langle t,\ 2t,\ t^2\rangle$ and $\vec r_B(t) = \langle t - 1,\ 10 - 2t,\ t + 1\rangle$ (metres, $t$ in seconds). Do they collide?`,
      choices: [
        t`No: their paths cross at $(2, 4, 4)$, but A is there at $t = 2$ s and B at $t = 3$ s`,
        t`Yes: both paths pass through $(2, 4, 4)$`,
        t`No: their paths never meet`,
        t`Yes, at $t = 2$ s`,
      ],
      answer: 0,
      why: {
        1: 'Sharing a point of their paths is not a collision: they must be there at the same moment.',
        2: t`Solve $\vec r_A(s) = \vec r_B(u)$ with two separate times: $s = 2$, $u = 3$ works, so the paths do meet.`,
        3: t`At $t = 2$ s, A is at $(2, 4, 4)$ but B is at $(1, 6, 3)$.`,
      },
      hints: [t`A collision needs $\vec r_A(t) = \vec r_B(t)$ with the **same** $t$. Paths crossing needs only $\vec r_A(s) = \vec r_B(u)$.`, t`Try $s = 2$ and $u = 3$; then check whether any single $t$ works.`],
      teach: t`Paths intersect when $\vec r_A(s) = \vec r_B(u)$ for some $s$ and $u$; objects collide only if they are there at the same time, $s = u$.`,
      explain: t`$\vec r_A(2) = (2, 4, 4) = \vec r_B(3)$, so the paths cross there. For a collision, $t = t - 1$ in $x$ is already impossible: at no single moment do the drones coincide. Air-traffic deconfliction checks exactly this difference between crossing routes and conflicting ones.`,
      visual: { type: 'calc-vectors3d', params: { range: 4, curves: [{ param: ['t', '2*t', 't^2'], t: [0, 2.6], color: 'accent', width: 2.4 }, { param: ['t - 1', '10 - 2*t', 't + 1'], t: [2.2, 5], color: 'warn', width: 2.4 }], points: [{ at: [2, 4, 4], color: 'gold' }] }, caption: 'Drag to rotate. Drone A’s path (blue) and drone B’s (amber); the gold point is where the paths cross.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-position', difficulty: 2,
      gen(r) {
        const t0 = r.pick([1, 2, 3]), a = r.int(2, 5);
        const P = [a * Math.cos((Math.PI * t0) / 2), t0 * t0 - 2 * t0, Math.exp(t0 - 2)];
        return {
          prompt: t`For $\vec r(t) = \left\langle ${a}\cos\frac{\pi t}{2},\ t^2 - 2t,\ e^{t - 2}\right\rangle$, find $|\vec r(${t0})|$, the distance of that point from the origin, to 3 significant figures.`,
          answer: Math.hypot(...P), tol: { rel: 0.005 },
          hints: [t`Evaluate each component at $t = ${t0}$, then take the length.`],
          teach: 'Evaluate the components, then use the distance formula.',
          explain: t`$\vec r(${t0}) = \langle ${nice(P[0], 4)},\ ${P[1]},\ ${nice(P[2], 4)}\rangle$, so $|\vec r(${t0})| = ${nice(Math.hypot(...P), 4)}$.`,
          visual: curvePic([`${a}*cos(pi*t/2)`, 't^2 - 2*t', 'exp(t - 2)'], [0, 3.2], { at: t0, fixed: true, range: 5 }),
        };
      },
    }),
    expr({
      id: 'cp-intersection', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3, 4]), k = r.int(1, 5);
        return {
          prompt: t`The cylinder $y^2 + z^2 = ${R * R}$ (its axis is the $x$-axis) meets the plane $x + z = ${k}$. With $y = ${R}\cos t$ and $z = ${R}\sin t$, what is $x(t)$ on their curve of intersection?`,
          answer: `${k} - ${R}*sin(t)`, answerTeX: t`${k} - ${R}\sin t`, lhs: 'x',
          vars: { t: [0, 6.2] },
          errors: [{ answer: `${k} - ${R}*cos(t)`, feedback: t`The plane involves $z$, and $z = ${R}\sin t$.` }],
          hints: [t`The plane gives $x = ${k} - z$.`],
          teach: 'Use the plane to express the missing coordinate in terms of the parametrized ones.',
          explain: t`$x = ${k} - z = ${k} - ${R}\sin t$, so $\vec r(t) = \langle ${k} - ${R}\sin t,\ ${R}\cos t,\ ${R}\sin t\rangle$.`,
          visual: { type: 'calc-vectors3d', params: { range: 4.5, curves: [{ param: [`${k} - ${R}*sin(t)`, `${R}*cos(t)`, `${R}*sin(t)`], t: [0, TAU], color: 'gold', width: 2.6 }, ...[-1, 2, 5].map((x0) => ({ param: [`${x0}`, `${R}*cos(t)`, `${R}*sin(t)`], t: [0, TAU], color: 'teal' }))] }, caption: 'Drag to rotate. Rings of the cylinder about the x-axis (teal) and the curve of intersection (gold).' },
        };
      },
    }),
    num({
      id: 'cp-orbit', difficulty: 2, transfer: true,
      gen(r) {
        const [name, h, inc] = r.pick(ORBITS), R = R_EARTH + h, zmax = R * Math.sin(inc * D);
        return {
          prompt: t`The orbit of ${name} is close to the circle $\vec r(t) = R\,\langle \cos\omega t,\ \cos i\,\sin\omega t,\ \sin i\,\sin\omega t\rangle$, with radius $R = ${R}$ km and inclination $i = ${inc}^\circ$ ($z$ along Earth’s axis). How far above Earth’s equatorial plane does it reach?`,
          answer: zmax, units: 'km', tol: { rel: 0.003 },
          errors: [{ value: R, feedback: t`$|\vec r| = R$ everywhere; the height above the equatorial plane is only the $z$-component, $R\sin i\,\sin\omega t$.` }, { value: R * Math.abs(Math.cos(inc * D)), feedback: t`The $z$-component carries $\sin i$, not $\cos i$.` }],
          hints: [t`The height above the equatorial plane is the $z$-component.`, t`$z = R\sin i\,\sin\omega t$ is largest when $\sin\omega t = 1$.`],
          teach: 'The largest value of one component of a curve is found exactly as for any function of t.',
          explain: t`$z_\text{max} = R\sin i = ${R}\sin ${inc}^\circ = ${fmt(zmax, 4)}$ km. That is why its ground track reaches latitude ${inc > 90 ? t`$${nice(180 - inc, 4)}^\circ$` : t`$${inc}^\circ$`} north and south — and never beyond.`,
          visual: curvePic([`2.6*cos(t)`, `2.6*cos(${inc}*pi/180)*sin(t)`, `2.6*sin(${inc}*pi/180)*sin(t)`], [0, TAU], { at: 1, fixed: true, show: [], range: 3, axisLabels: ['x', 'y', 'z (Earth’s axis)'] }, 'Drag to rotate. The tilted circular orbit (radius drawn as 2.6; Earth not drawn).'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §3.1 Vector-Valued Functions and Space Curves', url: 'https://openstax.org/books/calculus-volume-3/pages/3-1-vector-valued-functions-and-space-curves' },
  ],
});
