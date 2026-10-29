// Vectors and coordinate systems revisited: the polar unit vectors r̂, θ̂
// depend on where the particle is, so they turn as it moves —
// dr̂/dt = θ̇ θ̂, dθ̂/dt = −θ̇ r̂ — and the velocity picks up the transverse
// part rθ̇. Cylindrical and spherical versions; converting Cartesian data
// (radar tracking) to polar rates. Sets up the acceleration of M1.1.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sci, r6, pl, gpic, seg, lab, polarPic, GM_EARTH } from './_cm.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the worked example: a bead in a spiral groove, r = ct, θ = ωt
const EX = (() => {
  const c = 0.2, w = 2.0, T = 3.0;
  const r = c * T, vr = c, vt = r * w, v = Math.hypot(vr, vt);
  const th = w * T, x = r * Math.cos(th), y = r * Math.sin(th);
  const vx = c * Math.cos(th) - r * w * Math.sin(th), vy = c * Math.sin(th) + r * w * Math.cos(th);
  return { c, w, T, r, vr, vt, v, th, x, y, vx, vy, ang: Math.atan2(vt, vr) / DEG };
})();

// the two unit vectors at θ and θ + Δθ, with their difference (for the dr̂/dt item)
const turnPic = (() => {
  const a = 30 * DEG, b = 52 * DEG;
  const p = [Math.cos(a), Math.sin(a)], q = [Math.cos(b), Math.sin(b)];
  return gpic({
    x: [-0.25, 1.35], y: [-0.15, 1.05], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 1.5708], color: 'ink4', width: 1, dash: true }, seg([0, 0], [1.25, 0], 'ink4', 1)],
    arrows: [
      { from: [0, 0], to: p, color: 'accent', label: 'r̂(θ)', labelDx: 6, labelDy: 6 },
      { from: [0, 0], to: q, color: 'accent', label: 'r̂(θ + Δθ)', labelDx: -96, labelDy: -6 },
      { from: p, to: q, color: 'gold', width: 2.6 },
    ],
    points: [lab(0.32, 0.08, 'θ', 'ink2'), lab(0.36, 0.3, 'Δθ', 'ink2'), lab((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 'Δr̂', 'gold', 10, 4)],
  }, t`Two unit vectors $\hat r$, a small angle $\Delta\theta$ apart (to scale, $\Delta\theta = 22^\circ$). Both have length 1; the gold difference is what $d\hat r/dt$ measures.`, 'The radial unit vector at two nearby angles and the small vector joining their tips');
})();

export default lesson({
  id: 'phys3550.M0.1',
  title: 'Vectors and coordinate systems revisited',
  minutes: 14, difficulty: 2,
  intro: t`In Cartesian coordinates the unit vectors $\hat x$, $\hat y$, $\hat z$ point the same way everywhere, so differentiating a vector means differentiating its components. In **polar coordinates** that fails: the unit vectors $\hat r$ (outward) and $\hat\theta$ (anticlockwise, perpendicular to it) are tied to the particle's angle $\theta$, so **they turn as the particle moves**:

$$\frac{d\hat r}{dt} = \dot\theta\,\hat\theta, \qquad \frac{d\hat\theta}{dt} = -\dot\theta\,\hat r.$$

Differentiate $\vec r = r\,\hat r$ with the product rule and the turning of $\hat r$ hands you a second term. Every curvilinear calculation in this course — orbits, rotating frames, Lagrangians — starts here.`,
  equation: t`\vec v = \frac{d}{dt}\big(r\,\hat r\big) = \dot r\,\hat r + r\dot\theta\,\hat\theta`,
  symbols: [
    { tex: '\\vec v', text: 'the particle’s velocity, in m/s' },
    { tex: 'r,\\ \\theta', text: 'its plane-polar coordinates: distance from the origin (m) and angle from the $x$-axis, anticlockwise (rad)' },
    { tex: '\\hat r,\\ \\hat\\theta', text: 'unit vectors at the particle: $\\hat r = (\\cos\\theta, \\sin\\theta)$ points directly away from the origin, $\\hat\\theta = (-\\sin\\theta, \\cos\\theta)$ points the way $\\theta$ increases. Dimensionless' },
    { tex: '\\dot r,\\ \\dot\\theta', text: 'time derivatives (a dot means $d/dt$): the rate the distance grows (m/s) and the angular velocity (rad/s)' },
    { tex: 'r\\dot\\theta', text: 'the **transverse** speed, in m/s — a turn of $d\\theta$ at distance $r$ is an arc $r\\,d\\theta$' },
  ],
  why: t`Polar coordinates fit anything that circles a centre — planets, satellites, a bead on a turntable — but only if you remember that $\hat r$ and $\hat\theta$ rotate with the particle.`,
  visual: {
    type: 'cm-polar',
    title: 'Unit vectors that ride with the particle',
    lead: t`The blue $\hat r$ and violet $\hat\theta$ are drawn at the particle; the green arrow is its velocity. Drag time or press **Play**, and switch between motions.`,
    tasks: [
      t`**Spiral:** $\hat r$ and $\hat\theta$ swing round with the particle, and the velocity leans ahead of $\hat r$ because $r\dot\theta$ grows while $\dot r$ stays fixed.`,
      t`**Circle:** $\dot r = 0$, so the velocity lies exactly along $\hat\theta$.`,
      t`**Straight line:** the particle moves at constant velocity, yet both $v_r$ and $v_\theta$ change — the basis turns under it.`,
    ],
    params: {
      presets: [
        { label: 'Spiral', r: '0.5 + 0.3*t', theta: '0.8*t', T: [0, 7], at: 2, explain: t`$r = 0.5 + 0.3t$ m and $\theta = 0.8t$ rad: steady $\dot r$ and $\dot\theta$.` },
        { label: 'Circle', r: '1.5', theta: '0.9*t', T: [0, 7], at: 1, explain: t`$r = 1.5$ m and $\theta = 0.9t$: uniform circular motion.` },
        { label: 'Straight line', r: 'sqrt(1 + (0.8*t)^2)', theta: 'atan(0.8*t)', T: [-3, 3], at: -1.5, explain: t`$x = 1$ m, $y = 0.8t$ m: a straight line at constant velocity, written in polar form.` },
      ],
      show: ['path', 'basis', 'v', 'rvec'], bars: false,
      readouts: ['t', 'r', 'th', 'rd', 'thd', 'vr', 'vt', 'speed'],
      scale: { v: 0.8 },
    },
    caption: t`Point particle in a plane. $\hat r$ and $\hat\theta$ are drawn with a fixed length; the velocity is to scale (0.8 m of picture per m/s). Polar grid rings are 0.5 m apart.`,
  },
  example: {
    prompt: t`A bead runs outward along a spiral groove on a turntable so that $r = ct$ and $\theta = \omega t$, with $c = ${EX.c.toFixed(2)}$ m/s and $\omega = ${EX.w.toFixed(1)}$ rad/s. Find its velocity in polar components at $t = ${EX.T.toFixed(1)}$ s, its speed, and the angle between $\vec v$ and $\hat r$. Check the speed in Cartesian coordinates.`,
    visual: polarPic({ r: `${EX.c}*t`, theta: `${EX.w}*t`, T: [0, 3.6], at: EX.T, show: ['path', 'basis', 'v', 'rvec'], scale: { v: 0.25 }, caption: t`The spiral $r = ${EX.c}t$, $\theta = ${EX.w}t$ (dashed) and the bead at $t = ${EX.T}$ s with $\hat r$, $\hat\theta$ and its velocity (to scale, 0.25 m per m/s).` }),
    steps: [
      { label: 'Differentiate the position', text: t`$\vec r = r\hat r$, so $\vec v = \dot r\,\hat r + r\,\dfrac{d\hat r}{dt} = \dot r\,\hat r + r\dot\theta\,\hat\theta$. The second term exists only because $\hat r$ turns.` },
      { label: 'Read off the rates', text: t`$\dot r = c = ${EX.c.toFixed(2)}$ m/s and $\dot\theta = \omega = ${EX.w.toFixed(1)}$ rad/s. At $t = ${EX.T.toFixed(1)}$ s, $r = ct = ${sci(EX.r)}$ m.` },
      { label: 'Components', text: t`$v_r = \dot r = ${sci(EX.vr)}$ m/s and $v_\theta = r\dot\theta = ${sci(EX.r)}\times${EX.w.toFixed(1)} = ${sci(EX.vt)}$ m/s.` },
      { label: 'Speed and direction', text: t`$|\vec v| = \sqrt{v_r^2 + v_\theta^2} = ${sci(EX.v, 4)}$ m/s, and $\tan\alpha = v_\theta/v_r = ${sci(EX.vt / EX.vr)}$, so $\vec v$ makes $\alpha = ${sci(EX.ang)}^\circ$ with $\hat r$: the bead mostly circles, and drifts slowly outward.` },
      { label: 'Cartesian check', text: t`$x = ct\cos\omega t$, $y = ct\sin\omega t$ give $\dot x = c\cos\omega t - ct\omega\sin\omega t = ${sci(EX.vx)}$ m/s and $\dot y = ${sci(EX.vy)}$ m/s; $\sqrt{\dot x^2 + \dot y^2} = ${sci(Math.hypot(EX.vx, EX.vy), 4)}$ m/s. ✓ In general $\dot x^2 + \dot y^2 = c^2 + c^2t^2\omega^2$ — the polar form, with far less work.` },
    ],
    answer: t`$\vec v = ${sci(EX.vr)}\,\hat r + ${sci(EX.vt)}\,\hat\theta$ m/s; speed $${sci(EX.v, 4)}$ m/s, at $${sci(EX.ang)}^\circ$ to $\hat r$.`,
  },
  practice: [
    mcq({
      id: 'rhat-dot', difficulty: 2,
      prompt: t`A particle moves so that its polar angle changes at the rate $\dot\theta$. What is $d\hat r/dt$?`,
      visual: turnPic,
      choices: [t`$\dot\theta\,\hat\theta$`, t`$0$, because $\hat r$ is a unit vector`, t`$\dot\theta\,\hat r$`, t`$-\dot\theta\,\hat\theta$`],
      answer: 0,
      why: {
        1: t`A unit vector keeps its **length**, not its direction. $\hat r$ points at the particle, so it swings round as $\theta$ changes; only Cartesian unit vectors are constant.`,
        2: t`A vector of fixed length can only change sideways: its derivative is perpendicular to it. $\hat r$ cannot grow along itself.`,
        3: t`Sign: $\hat r$ turns *toward* increasing $\theta$, which is the $+\hat\theta$ direction. The minus sign belongs to $d\hat\theta/dt = -\dot\theta\,\hat r$.`,
      },
      hints: [t`Write $\hat r = (\cos\theta, \sin\theta)$ and differentiate each component with the chain rule.`, t`$\frac{d}{dt}(\cos\theta, \sin\theta) = \dot\theta\,(-\sin\theta, \cos\theta)$. Which unit vector is $(-\sin\theta, \cos\theta)$?`],
      teach: t`Polar unit vectors depend on $\theta$, so $d\hat r/dt = \dot\theta\,\hat\theta$ and $d\hat\theta/dt = -\dot\theta\,\hat r$.`,
      explain: t`$\hat r = (\cos\theta, \sin\theta)$, so $\dfrac{d\hat r}{dt} = \dot\theta(-\sin\theta, \cos\theta) = \dot\theta\,\hat\theta$. In the picture, $|\Delta\hat r| \approx \Delta\theta$ (an arc of the unit circle) and $\Delta\hat r$ points along $\hat\theta$.`,
    }),
    num({
      id: 'groove-speed', difficulty: 2,
      gen(r) {
        const w = r.pick([1.5, 2.0, 2.5, 3.0]), rr = r.pick([0.15, 0.2, 0.25, 0.3, 0.4]), rd = r.pick([0.2, 0.3, 0.4, 0.5, 0.6]);
        const v = Math.hypot(rd, rr * w), D = (0.5 * rr) / rd;
        return {
          prompt: t`A bead slides outward along a straight radial groove on a turntable that turns at $\omega = ${w.toFixed(1)}$ rad/s. At one instant it is $r = ${rr.toFixed(2)}$ m from the axle and moving outward along the groove at $\dot r = ${rd.toFixed(1)}$ m/s. What is its speed?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: rd + rr * w, feedback: t`You added the two components as numbers. $v_r$ and $v_\theta$ are perpendicular: combine them with Pythagoras.` },
            { value: Math.hypot(rd, w), feedback: t`$\dot\theta$ alone is not a speed (its units are rad/s). The transverse speed is $r\dot\theta$.` },
            { value: rr * w, feedback: t`That is only the transverse part $r\dot\theta$; the bead also moves outward at $\dot r$.` },
          ],
          hints: [t`$\vec v = \dot r\,\hat r + r\dot\theta\,\hat\theta$, and here $\dot\theta = \omega$.`, t`$|\vec v| = \sqrt{\dot r^2 + (r\omega)^2}$.`],
          teach: t`The speed in polar coordinates is $\sqrt{\dot r^2 + r^2\dot\theta^2}$: the radial and transverse parts are perpendicular.`,
          explain: t`$v_r = ${rd.toFixed(1)}$ m/s and $v_\theta = r\omega = ${rr.toFixed(2)}\times${w.toFixed(1)} = ${sci(rr * w)}$ m/s, so $|\vec v| = \sqrt{${rd.toFixed(1)}^2 + ${sci(rr * w)}^2} = ${sci(v)}$ m/s.`,
          visual: polarPic({ r: `${rr} + ${rd}*t`, theta: `${w}*t`, T: [-r6(D), r6(D)], at: 0, show: ['path', 'basis', 'rvec'], caption: t`The bead's path over a short stretch of time (dashed) and $\hat r$, $\hat\theta$ at the moment in question; the groove is the line from O through the bead.` }),
        };
      },
    }),
    num({
      id: 'rdot-from-xy', difficulty: 3,
      gen(r) {
        const x = r.pick([3, 4, 5, 6]) * r.sign(), y = r.pick([2, 4, 5, 8]), vx = r.intExcept(-6, 6, [0]), vy = r.intExcept(-6, 6, [0]);
        const R = Math.hypot(x, y), rd = (x * vx + y * vy) / R;
        const bad = Math.hypot(vx, vy);
        return {
          prompt: t`A particle is at $(x, y) = (${x},\ ${y})$ m moving with velocity $(v_x, v_y) = (${vx},\ ${vy})$ m/s. At what rate is its distance from the origin changing, $\dot r$? (Negative means approaching.)`,
          answer: rd, units: 'm/s', tol: { rel: 0.01, abs: 0.005 },
          errors: Math.abs(bad - Math.abs(rd)) > 0.05 ? [{ value: bad, feedback: t`That is the whole speed $|\vec v|$. Only the part of $\vec v$ along $\hat r$ changes the distance: $\dot r = \vec v\cdot\hat r$.` }] : [],
          hints: [t`$\dot r$ is the component of $\vec v$ along $\hat r = \vec r/r$.`, t`$\dot r = \dfrac{x v_x + y v_y}{\sqrt{x^2 + y^2}}$ — or differentiate $r^2 = x^2 + y^2$: $2r\dot r = 2x\dot x + 2y\dot y$.`],
          teach: t`The radial rate is the projection of the velocity on $\hat r$: $\dot r = \vec v\cdot\hat r = (x\dot x + y\dot y)/r$.`,
          explain: t`$r = \sqrt{${x < 0 ? `(${x})` : x}^2 + ${y < 0 ? `(${y})` : y}^2} = ${sci(R)}$ m and $\vec v\cdot\vec r = (${x})(${vx}) + (${y})(${vy}) = ${x * vx + y * vy}$ m²/s, so $\dot r = ${x * vx + y * vy}/${sci(R)} = ${sci(rd)}$ m/s.`,
          visual: gpic({
            x: [Math.min(-1, x - 2), Math.max(1, x + 2)], y: [-1, y + 3], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
            curves: [seg([0, 0], [x * 1.6, y * 1.6], 'ink4', 1, true)],
            arrows: [{ from: [0, 0], to: [x, y], color: 'ink2', label: 'r', labelDx: -16, labelDy: 0 }, { from: [x, y], to: [x + 0.35 * vx, y + 0.35 * vy], color: 'good', label: 'v', labelDx: 6, labelDy: 0 }],
            points: [{ x, y, color: 'ink', r: 4.5 }],
          }, t`The position vector and the velocity (to scale, 0.35 m per m/s); the dashed line continues $\hat r$. Only the part of $\vec v$ along that line changes $r$.`, 'A position vector and a velocity arrow at its tip'),
        };
      },
    }),
    mcq({
      id: 'missing-r', difficulty: 2, kind: 'error',
      prompt: t`A student differentiates $\vec r = r\hat r$ and writes $\vec v = \dot r\,\hat r + \dot\theta\,\hat\theta$. What is wrong?`,
      visual: gpic({
        x: [-0.3, 2.6], y: [-0.25, 1.7], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [{ param: ['1*cos(t)', '1*sin(t)'], t: [0, 0.6], color: 'accent', width: 3 }, { param: ['2.2*cos(t)', '2.2*sin(t)'], t: [0, 0.6], color: 'warn', width: 3 }, seg([0, 0], [2.4, 0], 'ink3', 1), seg([0, 0], [2.4 * Math.cos(0.6), 2.4 * Math.sin(0.6)], 'ink3', 1)],
        points: [lab(0.38, 0.1, 'Δθ', 'ink2'), lab(Math.cos(0.3) * 1.02, Math.sin(0.3) * 1.02, 'arc = 1 × Δθ', 'accent', 6, 4), lab(Math.cos(0.3) * 2.22, Math.sin(0.3) * 2.22, 'arc = 2.2 × Δθ', 'warn', 6, 4)],
      }, t`The same turn $\Delta\theta$ moves a particle 2.2 times as far at $r = 2.2$ as at $r = 1$ (to scale).`, 'Two arcs of the same angle at two radii'),
      choices: [t`The $\hat\theta$ term should be $r\dot\theta\,\hat\theta$: $\dot\theta$ is in rad/s, not m/s`, t`Nothing: velocity is the time derivative of each coordinate`, t`The $\hat r$ term should be $r\dot r\,\hat r$`, t`The terms are swapped: it should be $\dot\theta\,\hat r + \dot r\,\hat\theta$`],
      answer: 0,
      why: {
        1: t`That works for Cartesian coordinates only. Here $\hat r$ itself changes, and $r\,d\hat r/dt = r\dot\theta\,\hat\theta$ — the factor $r$ comes from the product rule.`,
        2: t`Check units: $r\dot r$ is m²/s, not a velocity. The radial part is simply $\dot r$.`,
        3: t`$\dot r$ is the rate of moving *away from* the origin, which is along $\hat r$; the turning is along $\hat\theta$.`,
      },
      hints: [t`Check the units of each term.`, t`Apply the product rule to $r\hat r$ and use $d\hat r/dt = \dot\theta\,\hat\theta$.`],
      teach: t`A turn $d\theta$ at radius $r$ is an arc $r\,d\theta$, so the transverse velocity is $r\dot\theta$, not $\dot\theta$.`,
      explain: t`$\dfrac{d}{dt}(r\hat r) = \dot r\,\hat r + r\,\dot\theta\,\hat\theta$. The student dropped the $r$; the units give it away ($\dot\theta$ is rad/s).`,
    }),
    mcq({
      id: 'spherical-speed', difficulty: 2,
      prompt: t`In spherical coordinates — $r$ the distance from the origin, $\theta$ the angle down from the $+z$ axis, $\phi$ the azimuth round it — what is the squared speed $v^2$ of a moving particle?`,
      visual: { type: 'c3-coords', params: { system: 'spherical', point: [2.2, 55, 40], sliders: false, element: true, edgeLabels: false, readouts: [], curves: true }, caption: t`The coordinate box at a point: its three edges are the distances moved when $r$, $\theta$ or $\phi$ alone changes a little. Edge lengths left for you to work out.` },
      choices: [t`$\dot r^2 + r^2\dot\theta^2 + r^2\sin^2\theta\,\dot\phi^2$`, t`$\dot r^2 + r^2\dot\theta^2 + r^2\dot\phi^2$`, t`$\dot r^2 + \dot\theta^2 + \dot\phi^2$`, t`$\dot r^2 + r^2\dot\theta^2 + r^2\cos^2\theta\,\dot\phi^2$`],
      answer: 0,
      why: {
        1: t`A change $d\phi$ moves the point round a circle of radius $r\sin\theta$ (its distance from the $z$-axis), not $r$. Near the pole that circle shrinks to nothing.`,
        2: t`Angles are not lengths: each angular rate must be multiplied by the radius of the circle it moves the point round.`,
        3: t`The circle that $\phi$ sweeps has radius $r\sin\theta$ when $\theta$ is measured from the $z$-axis. $\cos\theta$ would fit a latitude, measured from the equator.`,
      },
      hints: [t`Find the length of each edge of the small box: $dr$, then the arc swept when $\theta$ changes, then when $\phi$ changes.`, t`Changing $\phi$ moves the point round a horizontal circle. How far is the point from the $z$-axis?`],
      teach: t`Each coordinate's rate is weighted by its scale factor: $1$, $r$ and $r\sin\theta$ in spherical coordinates.`,
      explain: t`The edges are $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$, and they are mutually perpendicular, so $v^2 = \dot r^2 + r^2\dot\theta^2 + r^2\sin^2\theta\,\dot\phi^2$.`,
    }),
    num({
      id: 'helix', difficulty: 2,
      gen(r) {
        const R = r.pick([0.5, 0.8, 1.2, 1.5]), w = r.pick([2, 3, 4, 5]), u = r.pick([0.6, 1.0, 1.5, 2.0]);
        const v = Math.hypot(R * w, u);
        return {
          prompt: t`In cylindrical coordinates $(\rho, \phi, z)$ a particle moves on a helix: $\rho = ${R}$ m, $\phi = ${w}t$ rad and $z = ${u}t$ m (with $t$ in seconds). What is its speed?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(w, u), feedback: t`$\dot\phi$ is not a speed. The point circles at distance $\rho$ from the axis, so its round-the-axis speed is $\rho\dot\phi$.` }, { value: R * w + u, feedback: t`The $\hat\phi$ and $\hat z$ parts are perpendicular: add their squares.` }],
          hints: [t`In cylindrical coordinates $\vec v = \dot\rho\,\hat\rho + \rho\dot\phi\,\hat\phi + \dot z\,\hat z$.`, t`Here $\dot\rho = 0$, $\rho\dot\phi = ${R}\times${w}$ m/s and $\dot z = ${u}$ m/s.`],
          teach: t`Cylindrical coordinates are polar coordinates plus a $z$ that never turns: $v^2 = \dot\rho^2 + \rho^2\dot\phi^2 + \dot z^2$.`,
          explain: t`$|\vec v| = \sqrt{(\rho\dot\phi)^2 + \dot z^2} = \sqrt{${sci(R * w)}^2 + ${u}^2} = ${sci(v)}$ m/s — constant, as it is on any helix traced at a steady rate.`,
          visual: { type: 'calc-vectors3d', params: { range: 2, curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`, `${r6(u / w)}*t - 1.5`], t: [0, r6((3 * w) / u)], color: 'teal' }], vectors: [{ from: [0, 0, -1.6], to: [0, 0, 1.8], color: 'ink3', label: 'z' }] }, caption: t`The helix $\rho = ${R}$ m, rising $${sci((2 * Math.PI * u) / w)}$ m per turn (drawn over about 3 m of rise). Drag to turn it.` },
        };
      },
    }),
    expr({
      id: 'xdot-polar', difficulty: 3,
      prompt: t`A particle has polar coordinates $r(t)$ and $\theta(t)$. Write $\dot x$, the $x$-component of its velocity, in terms of $r$, $\theta$, $u = \dot r$ and $\omega = \dot\theta$.`,
      answer: 'u cos(theta) - r omega sin(theta)', answerTeX: t`\dot r\cos\theta - r\dot\theta\sin\theta`,
      vars: { r: [0.3, 3], theta: [-3, 3], u: [-2, 2], omega: [-2, 2] }, lhs: t`\dot x`,
      keys: [['θ', 'theta'], ['ω', 'omega']],
      errors: [
        { answer: 'u cos(theta) + r omega sin(theta)', feedback: t`Sign: $\frac{d}{dt}\cos\theta = -\dot\theta\sin\theta$.` },
        { answer: 'u cos(theta) - omega sin(theta)', feedback: t`The product rule on $r\cos\theta$ keeps the factor $r$ in the second term.` },
        { answer: '-r omega sin(theta)', feedback: t`You treated $r$ as constant. Use the product rule: both $r$ and $\cos\theta$ change.` },
      ],
      hints: [t`$x = r\cos\theta$. Differentiate with the product rule.`, t`$\dot x = \dot r\cos\theta + r\,\frac{d}{dt}(\cos\theta)$, and $\frac{d}{dt}\cos\theta = -\sin\theta\,\dot\theta$.`],
      teach: t`$\dot x = \vec v\cdot\hat x$, and $\hat r\cdot\hat x = \cos\theta$, $\hat\theta\cdot\hat x = -\sin\theta$: the same answer from the polar velocity.`,
      explain: t`$\dot x = \dot r\cos\theta - r\dot\theta\sin\theta$. Equivalently, project $\vec v = \dot r\hat r + r\dot\theta\hat\theta$ on $\hat x$: $\hat r\cdot\hat x = \cos\theta$ and $\hat\theta\cdot\hat x = -\sin\theta$.`,
      visual: gpic({
        x: [-0.4, 2.4], y: [-0.3, 1.9], equal: true, xlabel: 'x', ylabel: 'y',
        curves: [{ param: ['0.45*cos(t)', '0.45*sin(t)'], t: [0, 0.75], color: 'ink3', width: 1.2 }],
        arrows: [{ from: [0, 0], to: [1.6 * Math.cos(0.75), 1.6 * Math.sin(0.75)], color: 'ink2', label: 'r', labelDx: -16, labelDy: -4 },
          { from: [1.6 * Math.cos(0.75), 1.6 * Math.sin(0.75)], to: [2.1 * Math.cos(0.75), 2.1 * Math.sin(0.75)], color: 'accent', label: 'r̂' },
          { from: [1.6 * Math.cos(0.75), 1.6 * Math.sin(0.75)], to: [1.6 * Math.cos(0.75) - 0.5 * Math.sin(0.75), 1.6 * Math.sin(0.75) + 0.5 * Math.cos(0.75)], color: 'teal', label: 'θ̂', labelDx: -22, labelDy: -2 },
          { from: [1.6 * Math.cos(0.75), 1.6 * Math.sin(0.75)], to: [1.6 * Math.cos(0.75) + 0.5, 1.6 * Math.sin(0.75)], color: 'ink3', label: 'x̂' }],
        points: [lab(0.55, 0.18, 'θ', 'ink2')],
      }, t`At the particle: $\hat r$ makes angle $\theta$ with $\hat x$; $\hat\theta$ makes $\theta + 90^\circ$.`, 'Polar and Cartesian unit vectors at one point'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-radar', difficulty: 3, transfer: true,
      gen(r) {
        const x = r.pick([20, 30, 40]), y = r.pick([10, 15, 25]), vx = -r.pick([150, 200, 250]), vy = r.pick([-60, -40, 40, 80]);
        const X = x * 1e3, Y = y * 1e3, thd = (X * vy - Y * vx) / (X * X + Y * Y);
        const degs = thd / DEG;
        return {
          prompt: t`A tracking radar at the origin follows an aircraft flying level at $(x, y) = (${x},\ ${y})$ km (seen from above), with ground velocity $(v_x, v_y) = (${vx},\ ${vy})$ m/s. How fast must the antenna turn to keep pointing at it — what is $\dot\theta$, in degrees per second? (Positive is anticlockwise.)`,
          answer: degs, units: 'deg/s', tol: { rel: 0.01 },
          errors: [{ value: thd, feedback: t`That is in rad/s. Multiply by $180/\pi$ for degrees per second.` }, { value: (X * vy - Y * vx) / Math.hypot(X, Y) / DEG, feedback: t`That is $v_\theta = r\dot\theta$ in disguise — divide by $r$ once more: $\dot\theta = (x v_y - y v_x)/r^2$.` }],
          hints: [t`The transverse speed is $v_\theta = r\dot\theta$, the component of $\vec v$ along $\hat\theta$.`, t`Differentiate $\tan\theta = y/x$, or use $\dot\theta = \dfrac{x v_y - y v_x}{x^2 + y^2}$ (the $z$-part of $\vec r\times\vec v$ over $r^2$).`],
          teach: t`The angular rate seen from the origin is the transverse velocity over the range: $\dot\theta = (\vec r\times\vec v)_z / r^2$.`,
          explain: t`$x v_y - y v_x = (${X})(${vy}) - (${Y})(${vx}) = ${sci(X * vy - Y * vx, 4)}$ m²/s and $r^2 = ${sci(X * X + Y * Y, 4)}$ m², so $\dot\theta = ${sci(thd)}$ rad/s $= ${sci(degs)}$°/s.`,
          visual: gpic({
            x: [-5, x + 10], y: [-5, y + 12], equal: true, xlabel: 'x (km)', ylabel: 'y (km)',
            curves: [seg([0, 0], [x, y], 'ink3', 1.2, true)],
            arrows: [{ from: [x, y], to: [x + vx * 0.04, y + vy * 0.04], color: 'good', label: 'v', labelDx: -14, labelDy: -6 }],
            points: [{ x: 0, y: 0, color: 'ink2', label: 'radar', labelDx: 6, labelDy: 12 }, { x, y, color: 'accent', label: 'aircraft' }],
          }, t`Seen from above: the line of sight (dashed) and the aircraft's ground velocity (40 m of picture per m/s).`, 'A radar at the origin and an aircraft with its velocity arrow'),
        };
      },
    }),
    num({
      id: 'cp-iss', difficulty: 2, transfer: true,
      gen(r) {
        const h = r.pick([400, 420, 550]), R = 6371 + h;
        const v = Math.sqrt(GM_EARTH / (R * 1e3)) / 1e3;      // km/s, circular
        const vv = +v.toFixed(2), thd = vv / R, T = (2 * Math.PI) / thd / 60;
        return {
          prompt: t`A satellite circles Earth at $r = ${sci(R, 4)}$ km from its centre (${h} km up) at a steady ${vv.toFixed(2)} km/s. In polar coordinates centred on Earth, what is $\dot\theta$ — and so how many minutes does one orbit take? Give the period, in minutes.`,
          answer: T, units: 'min', tol: { rel: 0.01 },
          errors: [{ value: (2 * Math.PI * R) / vv, feedback: t`That is in seconds. Divide by 60.` }],
          hints: [t`On a circle $\dot r = 0$, so all the speed is transverse: $v = r\dot\theta$.`, t`$\dot\theta = v/r$, then $T = 2\pi/\dot\theta$.`],
          teach: t`For circular motion the whole velocity is $r\dot\theta\,\hat\theta$, so $\dot\theta = v/r$.`,
          explain: t`$\dot\theta = ${vv.toFixed(2)}/${sci(R, 4)} = ${sci(thd)}$ rad/s, so $T = 2\pi/\dot\theta = ${sci(T * 60, 4)}$ s $= ${sci(T)}$ min.`,
          visual: gpic({
            x: [-8500, 8500], y: [-7500, 7500], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
            curves: [{ param: ['6371*cos(t)', '6371*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1.2, dash: true }],
            shade: [{ fn: 'sqrt(max(0, 6371^2 - x^2))', lower: '-sqrt(max(0, 6371^2 - x^2))', from: -6371, to: 6371, color: 'accent', alpha: 0.18 }],
            arrows: [{ from: [R * Math.cos(0.6), R * Math.sin(0.6)], to: [R * Math.cos(0.6) - 2400 * Math.sin(0.6), R * Math.sin(0.6) + 2400 * Math.cos(0.6)], color: 'good', label: 'v (along θ̂)', labelDx: -40, labelDy: -10 }],
            points: [{ x: R * Math.cos(0.6), y: R * Math.sin(0.6), color: 'ink', r: 4 }],
          }, t`Earth (to scale) and the orbit, ${h} km up — barely outside the surface at this scale. The velocity arrow is not to scale.`, 'Earth with a low circular orbit around it'),
        };
      },
    }),
    mcq({
      id: 'cp-constant', difficulty: 2,
      prompt: t`Which of these unit vectors points the same way at every point of space?`,
      visual: gpic({
        x: [-2.4, 2.4], y: [-1.6, 1.6], equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
        arrows: [[1.3, 0.4], [-1.1, 0.9], [-0.6, -1.1], [1.4, -0.9]].flatMap(([x, y]) => {
          const a = Math.atan2(y, x), s = 0.45;
          return [{ from: [x, y], to: [x + s * Math.cos(a), y + s * Math.sin(a)], color: 'accent' }, { from: [x, y], to: [x - s * Math.sin(a), y + s * Math.cos(a)], color: 'teal' }];
        }),
        points: [[1.3, 0.4], [-1.1, 0.9], [-0.6, -1.1], [1.4, -0.9]].map(([x, y]) => ({ x, y, color: 'ink', r: 3.5 })),
        legend: [{ label: 'r-hat (radial)', color: 'accent' }, { label: 'theta-hat (transverse)', color: 'teal' }], legendAt: 'tr',
      }, t`Plane-polar $\hat r$ (blue) and $\hat\theta$ (teal) drawn at four points.`, 'Polar unit vectors at four different points, pointing in different directions'),
      choices: [t`$\hat x$, the Cartesian unit vector`, t`$\hat r$ of spherical coordinates`, t`$\hat\theta$ of plane-polar coordinates`, t`$\hat\phi$ of cylindrical coordinates`],
      answer: 0,
      why: {
        1: t`Spherical $\hat r$ points away from the origin, so its direction depends on where you are — it is $\vec r/r$.`,
        2: t`$\hat\theta = (-\sin\theta, \cos\theta)$ depends on $\theta$: the picture shows it pointing different ways at different points.`,
        3: t`Cylindrical $\hat\phi$ circles the $z$-axis, so it turns as $\phi$ changes, just like plane-polar $\hat\theta$.`,
      },
      hints: ['Which unit vector does not depend on the coordinates of the point?'],
      teach: t`Only Cartesian unit vectors (and cylindrical $\hat z$) are the same everywhere; curvilinear unit vectors depend on position, so their time derivatives are not zero.`,
      explain: t`$\hat x$ is fixed. The curvilinear unit vectors depend on the angles of the point where they are drawn — which is why differentiating them produces extra terms.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 1: polar coordinates', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'OpenStax Calculus Vol. 3, §2.7 Cylindrical and Spherical Coordinates', url: 'https://openstax.org/books/calculus-volume-3/pages/2-7-cylindrical-and-spherical-coordinates' },
  ],
});
