// Velocity, acceleration and the TNB frame — speed as ds/dt, the split of
// acceleration into a tangential part (changing the speed) and a normal part
// κv² (bending the path), the binormal and torsion, and a rocket's gravity
// turn, whose path is bent by gravity alone.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { add, scale, dot, cross, norm, vecTeX } from './_space.js';

const t = String.raw;
const D = Math.PI / 180;
const near = (a, b) => Math.abs(a - b) <= 0.006 * Math.max(Math.abs(b), 1e-9);
// keep only the error values a grader could tell apart from the answer and each other
const distinct = (answer, errs) => errs.filter((e, k) => Number.isFinite(e.value) && !near(e.value, answer) && !errs.slice(0, k).some((f) => near(e.value, f.value)));

const UNITS_LAUNCH = { t: '\\text{s}', len: '\\text{km}', speed: '\\text{km/s}', acc: '\\text{m/s}^2', accScale: 1000 };

export default lesson({
  id: 'math2210.C3-2.4',
  title: 'Velocity, acceleration and the TNB frame',
  minutes: 12, difficulty: 2,
  intro: t`For a point moving along $\vec r(t)$, the **velocity** $\vec v = \vec r\,'$ is tangent to the path, the **speed** $|\vec v| = ds/dt$ is how fast arc length grows, and the **acceleration** is $\vec a = \vec v\,' = \vec r\,''$. Writing $\vec v = |\vec v|\,\vec T$ and differentiating with the product rule splits the acceleration into two perpendicular parts:

$$\vec a = \underbrace{\frac{d|\vec v|}{dt}}_{a_T}\,\vec T + \underbrace{\kappa|\vec v|^2}_{a_N}\,\vec N$$

The **tangential** component $a_T$ changes the speed; the **normal** component $a_N$ bends the path, pointing along the **principal unit normal** $\vec N = \vec T\,'/|\vec T\,'|$ toward the inside of the bend. To compute them,

$$a_T = \frac{\vec v\cdot\vec a}{|\vec v|}, \qquad a_N = \frac{|\vec v\times\vec a|}{|\vec v|} = \sqrt{|\vec a|^2 - a_T^2}$$

The **binormal** $\vec B = \vec T\times\vec N$ completes a right-handed frame of unit vectors that rides along with the point: the **TNB** or Frenet frame. $\vec T$ and $\vec N$ span the **osculating plane**, the plane the path is momentarily turning in. How fast $\vec B$ turns, $d\vec B/ds = -\tau\vec N$, measures the **torsion** $\tau$: how quickly the path twists out of that plane. A plane curve has $\tau = 0$.`,
  symbols: [
    { tex: '\\vec v,\\ \\vec a', text: t`velocity $\vec r\,'(t)$ and acceleration $\vec r\,''(t)$` },
    { tex: 'a_T', text: t`the tangential component of $\vec a$: the rate of change of speed, $d|\vec v|/dt$ — negative when slowing down` },
    { tex: 'a_N', text: t`the normal component of $\vec a$, $\kappa|\vec v|^2 \ge 0$: the part that bends the path` },
    { tex: '\\vec N', text: t`the principal unit normal, perpendicular to $\vec T$ and pointing toward the inside of the bend` },
    { tex: '\\vec B', text: t`the binormal $\vec T\times\vec N$, perpendicular to the osculating plane` },
    { tex: '\\tau', text: t`the torsion, $\tau = \dfrac{(\vec r\,'\times\vec r\,'')\cdot\vec r\,'''}{|\vec r\,'\times\vec r\,''|^2}$: the rate at which the osculating plane twists, per unit length` },
  ],
  why: t`Launch engineers think in exactly these components. A rocket’s engine pushes along its velocity — pure $a_T$ — while the sideways part of gravity bends the path over: the **gravity turn** flown by nearly every orbital launch. In a turning aircraft or on a roller coaster, $a_N = \kappa v^2$ is the load felt through the seat, which is why a tight turn at speed is limited by what the pilot and the structure can take.`,
  visual: {
    type: 'c3-curve',
    title: 'A gravity turn',
    lead: t`A rocket’s ascent, computed from its equations of motion: the engine pushes along the velocity, gravity pulls down. Press **Play**. The dashed blue arrow is the tangential part $a_T\vec T$ of the acceleration, which changes the speed; the dashed orange arrow is the normal part $a_N\vec N$, which bends the path.`,
    tasks: [
      t`For the first 12 s the rocket climbs straight up. A straight path has no normal component: $a_N = 0$ and the radius of curvature is infinite.`,
      t`At 12 s a small kick tips it $1.3^\circ$ off vertical, and from then on gravity does the turning. The engine adds nothing to $a_N$ — it pushes along $\vec T$ — so $a_N = g\cos\gamma$, where $\gamma$ is the climb angle above the horizontal: tiny while the rocket is nearly vertical, about $8.3$ m/s² by burnout at $\gamma \approx 33^\circ$.`,
      t`Watch the radius of curvature $R = v^2/a_N$: about 18 km just after the kick, when the rocket is slow, and over 500 km at burnout. The turn is tightest when the rocket is slowest — which is why the kick comes early.`,
    ],
    params: {
      curve: { model: 'gravity-turn' }, plane: 'xz', at: 110,
      show: ['v', 'split', 'trail'], toggles: ['v', 'a', 'split', 'circle'], scale: { v: 12, a: 1200 },
      readouts: ['t', 'speed', 'aT', 'aN', 'R'], units: UNITS_LAUNCH, speed: 10,
      xlabel: 'downrange x (km)', ylabel: 'altitude z (km)',
    },
    caption: 'Flat Earth, constant g, no air; thrust always along the velocity, rising from 1.5 g to 3.2 g as propellant burns, until burnout at 160 s. Velocity is drawn as 12 s of flight, accelerations at 1.2 km per m/s².',
  },
  example: {
    prompt: t`A small aircraft’s climbing, accelerating turn is logged as $\vec r(t) = \left\langle t,\ t^2,\ \tfrac23 t^3\right\rangle$ km, with $t$ in minutes. At $t = 1$ min, find its speed, the tangential and normal components of its acceleration, the curvature of its path, and the frame $\vec T, \vec N, \vec B$.`,
    visual: {
      type: 'c3-curve',
      params: { curve: { param: ['t', 't^2', '2*t^3/3'], t: [0, 1.5] }, at: 1, show: ['T', 'N', 'B', 'trail'], toggles: ['split', 'circle'], readouts: ['t', 'speed', 'aT', 'aN', 'kappa', 'tau'], units: { t: '\\text{min}', len: '\\text{km}', speed: '\\text{km/min}', acc: '\\text{km/min}^2' }, speed: 0.3, range: 2.4, target: [0.7, 1.1, 0.8], scale3d: 2, yaw: 0.2, pitch: 0.3 },
      caption: 'Drag to rotate. The logged path with its T (blue), N (orange) and B (teal) at the moving point.',
    },
    steps: [
      { label: 'Velocity and speed', text: t`$\vec v = \langle 1,\ 2t,\ 2t^2\rangle$, and $|\vec v| = \sqrt{1 + 4t^2 + 4t^4} = 1 + 2t^2$ — a perfect square. At $t = 1$: $\vec v = \langle 1, 2, 2\rangle$ km/min, speed 3 km/min (180 km/h).` },
      { label: 'Acceleration', text: t`$\vec a = \langle 0,\ 2,\ 4t\rangle = \langle 0, 2, 4\rangle$ km/min² at $t = 1$, with $|\vec a| = \sqrt{20}$.` },
      { label: 'Tangential part', text: t`$a_T = \frac{d|\vec v|}{dt} = 4t = 4$ km/min². Check: $\frac{\vec v\cdot\vec a}{|\vec v|} = \frac{0 + 4 + 8}{3} = 4$ ✓. The aircraft is speeding up.` },
      { label: 'Normal part and curvature', text: t`$a_N = \sqrt{|\vec a|^2 - a_T^2} = \sqrt{20 - 16} = 2$ km/min², so $\kappa = \frac{a_N}{|\vec v|^2} = \frac29$ km⁻¹: the turn has a radius of $4.5$ km.` },
      { label: 'The frame', text: t`$\vec T = \frac{\vec v}{|\vec v|} = \frac13\langle 1, 2, 2\rangle$. $\vec N = \frac{\vec a - a_T\vec T}{a_N} = \frac12\left(\langle 0, 2, 4\rangle - \tfrac43\langle 1, 2, 2\rangle\right) = \frac13\langle -2, -1, 2\rangle$. $\vec B = \vec T\times\vec N = \frac19\langle 6, -6, 3\rangle = \frac13\langle 2, -2, 1\rangle$. Each is a unit vector and each pair is perpendicular — check $\vec T\cdot\vec N = \frac{-2 - 2 + 4}{9} = 0$.` },
    ],
    answer: t`Speed 3 km/min; $a_T = 4$ km/min², $a_N = 2$ km/min²; $\kappa = 2/9$ km⁻¹ (radius 4.5 km); $\vec T = \frac13\langle 1, 2, 2\rangle$, $\vec N = \frac13\langle -2, -1, 2\rangle$, $\vec B = \frac13\langle 2, -2, 1\rangle$.`,
  },
  practice: [
    num({
      id: 'projectile-split', difficulty: 2,
      gen(r) {
        const u = r.pick([40, 50, 60]), al = r.pick([30, 45, 60]), T = r.pick([1, 2, 3]), g = 9.81, which = r.pick(['T', 'N']);
        const vx = u * Math.cos(al * D), vy = u * Math.sin(al * D) - g * T, sp = Math.hypot(vx, vy);
        const aT = (-g * vy) / sp, aN = (g * vx) / sp, ans = which === 'T' ? aT : aN;
        const errors = distinct(ans, which === 'T'
          ? [{ value: -aT, feedback: t`Check the sign: $\vec v\cdot\vec a = -g\,v_y$ is ${vy > 0 ? 'negative while the shell rises — it is slowing' : 'positive once it falls — it is speeding up'}.` }, { value: aN, feedback: t`That is the normal component. $a_T = \vec v\cdot\vec a/|\vec v|$.` }, { value: -g, feedback: 'Only part of gravity lies along the path; the rest bends it.' }]
          : [{ value: g, feedback: 'Only part of gravity lies across the path; the rest changes the speed.' }, { value: Math.abs(aT), feedback: t`That is the size of the tangential component. $a_N = |\vec v\times\vec a|/|\vec v|$.` }]);
        const tf = (2 * u * Math.sin(al * D)) / g;
        return {
          prompt: t`A shell is fired at $${u}$ m/s, $${al}^\circ$ above the horizontal. Ignoring air, what is the ${which === 'T' ? 'tangential' : 'normal'} component $a_${which}$ of its acceleration at $t = ${T}$ s, in m/s²? (Use $g = 9.81$ m/s²${which === 'T' ? '; negative means slowing down' : ''}.)`,
          answer: ans, units: 'm/s^2', tol: { rel: 0.005, abs: 0.01 }, errors,
          hints: [t`$\vec v(${T}) = \langle ${nice(vx, 4)},\ ${nice(vy, 4)}\rangle$ m/s and $\vec a = \langle 0, -9.81\rangle$.`, which === 'T' ? t`$a_T = \dfrac{\vec v\cdot\vec a}{|\vec v|}$.` : t`$a_N = \dfrac{|v_x a_y - v_y a_x|}{|\vec v|}$.`],
          teach: 'Gravity’s pull splits into a part along the path, which changes the speed, and a part across it, which bends the path.',
          explain: t`$|\vec v| = ${nice(sp, 4)}$ m/s, so $a_T = \frac{-9.81(${nice(vy, 4)})}{${nice(sp, 4)}} = ${nice(aT, 3)}$ m/s² and $a_N = \frac{9.81(${nice(vx, 4)})}{${nice(sp, 4)}} = ${nice(aN, 3)}$ m/s². Check: $a_T^2 + a_N^2 = ${nice(aT * aT + aN * aN, 4)} = g^2$.`,
          visual: { type: 'c3-curve', params: { curve: { param: [`${nice(vx, 6)}*t`, '0', `${nice(u * Math.sin(al * D), 6)}*t - 4.905*t^2`], t: [0, nice(tf, 4)] }, plane: 'xz', at: T, fixed: true, show: ['trail', 'v', 'split'], scale: { v: 1, a: 4 }, readouts: [], xlabel: 'x (m)', ylabel: 'height (m)' }, caption: 'The shell’s path, its velocity (1 s of flight) and the two parts of gravity at the gold point (4 m per m/s²).' },
        };
      },
    }),
    num({
      id: 'aN-3d', difficulty: 2,
      gen(r) {
        const v = [r.pick([160, 180, 200, 220]), r.pick([-40, -20, 20, 40]), r.pick([-10, 5, 10, 15])], a = [r.int(-3, 3), r.pick([-20, -15, 15, 20]), r.int(-2, 4)];
        const sp = norm(v), aT = dot(v, a) / sp, aN = norm(cross(v, a)) / sp;
        const errors = distinct(aN, [
          { value: norm(a), feedback: t`That is the whole acceleration, $|\vec a|$. Remove the part along the velocity: $a_N = \sqrt{|\vec a|^2 - a_T^2}$.` },
          { value: Math.abs(aT), feedback: 'That is the tangential part, which changes the speed.' },
          { value: norm(cross(v, a)), feedback: t`Divide by the speed: $a_N = |\vec v\times\vec a|/|\vec v|$.` },
        ]);
        return {
          prompt: t`At one instant a jet’s velocity is $\vec v = ${vecTeX(v)}$ m/s and its acceleration $\vec a = ${vecTeX(a)}$ m/s². What is the normal component $a_N$ — the part that bends its path? Give 3 significant figures.`,
          answer: aN, units: 'm/s^2', tol: { rel: 0.005 }, errors,
          hints: [t`$a_N = \dfrac{|\vec v\times\vec a|}{|\vec v|}$, or $\sqrt{|\vec a|^2 - a_T^2}$ with $a_T = \dfrac{\vec v\cdot\vec a}{|\vec v|}$.`],
          teach: t`$a_N = |\vec v\times\vec a|/|\vec v| = \sqrt{|\vec a|^2 - a_T^2}$: the part of the acceleration perpendicular to the velocity.`,
          explain: t`$a_T = \frac{\vec v\cdot\vec a}{|\vec v|} = \frac{${dot(v, a)}}{${nice(sp, 4)}} = ${nice(aT, 3)}$ m/s², $|\vec a| = ${nice(norm(a), 4)}$ m/s², so $a_N = \sqrt{|\vec a|^2 - a_T^2} = ${nice(aN, 3)}$ m/s² — about $${nice(aN / 9.81, 2)}\,g$ of sideways load, on a turn of radius $|\vec v|^2/a_N = ${nice((sp * sp) / aN / 1000, 3)}$ km.`,
          visual: {
            type: 'calc-vectors3d',
            params: { range: 2.6, vectors: [{ to: scale(v, 0.01), color: 'good', label: '\\vec v' }, { to: scale(a, 0.1), color: 'violet', label: '\\vec a' }] },
            caption: 'Drag to rotate. The velocity (green, 1 unit per 100 m/s) and the acceleration (violet, 1 unit per 10 m/s²) from the jet’s position.',
          },
        };
      },
    }),
    num({
      id: 'circular-accel', difficulty: 2,
      gen(r) {
        const R = r.pick([40, 50, 60]), v = r.pick([12, 15, 18]), aT = r.pick([1.5, 2, 2.5]), aN = (v * v) / R, A = Math.hypot(aT, aN);
        const errors = distinct(A, [
          { value: aN, feedback: t`That is only the normal part, $v^2/R$. The car is also speeding up: add $a_T$ — at right angles.` },
          { value: aT + aN, feedback: t`The two parts are perpendicular: combine them with Pythagoras, not by adding.` },
        ]);
        return {
          prompt: t`A car is driving round a bend of radius $${R}$ m. At the moment its speed is $${v}$ m/s it is speeding up at $${aT}$ m/s². How large is its acceleration? Give 3 significant figures.`,
          answer: A, units: 'm/s^2', tol: { rel: 0.005 }, errors,
          hints: [t`$a_T = ${aT}$ m/s² and $a_N = \kappa v^2 = v^2/R$.`, t`$|\vec a| = \sqrt{a_T^2 + a_N^2}$, since $\vec T \perp \vec N$.`],
          teach: t`The acceleration is $a_T\vec T + a_N\vec N$ with $\vec T \perp \vec N$, so $|\vec a| = \sqrt{a_T^2 + a_N^2}$.`,
          explain: t`$a_N = ${v}^2/${R} = ${nice(aN, 4)}$ m/s² toward the centre, $a_T = ${aT}$ m/s² forward, so $|\vec a| = \sqrt{${aT}^2 + ${nice(aN, 4)}^2} = ${nice(A, 3)}$ m/s² — pointing ahead of the centre by $${nice(Math.atan(aT / aN) / D, 3)}^\circ$. The tyres must supply all of it: braking or accelerating in a bend uses up grip that cornering needs.`,
          visual: { type: 'c3-curve', params: { curve: { param: [`${R}*cos(${v}*t/${R} + ${aT / 2}*t^2/${R})`, `${R}*sin(${v}*t/${R} + ${aT / 2}*t^2/${R})`, '0'], t: [-2.5, 2.5] }, plane: 'xy', at: 0, fixed: true, show: ['trail', 'a', 'split'], scale: { a: R / 8 }, readouts: [], xlabel: 'x (m)', ylabel: 'y (m)' }, caption: 'The car’s line through the bend, with its acceleration (violet) and the two parts of it at the gold point.' },
        };
      },
    }),
    mcq({
      id: 'dip-direction', difficulty: 1,
      prompt: t`A roller-coaster car passes the lowest point of a dip at 25 m/s; at that instant its speed is neither increasing nor decreasing. Which way does its acceleration point?`,
      choices: ['Straight up, toward the centre of curvature of the dip', 'Forward, along its velocity', 'Nowhere: it is zero, because the speed is not changing', 'Straight down, the way gravity pulls'],
      answer: 0,
      why: {
        1: t`A forward acceleration would change the speed, and at this instant $a_T = d|\vec v|/dt = 0$.`,
        2: t`Constant speed only makes $a_T = 0$. The path is curving, so $a_N = \kappa v^2 \ne 0$.`,
        3: 'Gravity is only one of the forces: the track pushes up harder than gravity pulls down, and the net acceleration points up, into the bend.',
      },
      hints: [t`$\vec a = a_T\vec T + a_N\vec N$. What is $a_T$ here?`, t`$\vec N$ points toward the inside of the bend.`],
      teach: 'When the speed is momentarily constant, the whole acceleration is normal: κv², toward the centre of curvature.',
      explain: t`$a_T = 0$, so $\vec a = \kappa v^2\vec N$, and at the bottom of a dip $\vec N$ points straight up. That is why riders feel heavy there: the seat must push up with $m(g + \kappa v^2)$.`,
      visual: { type: 'c3-curve', params: { curve: { param: ['t', '0', '0.05*t^2'], t: [-20, 20] }, plane: 'xz', at: 0, fixed: true, show: ['v'], scale: { v: 8 }, readouts: [], xlabel: 'x (m)', ylabel: 'height (m)' }, caption: 'The dip, and the car’s velocity at its lowest point.' },
    }),
    num({
      id: 'binormal', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [3, 1], [1, 1], [2, 3], [4, 3], [1, 2]]), t0 = r.pick([0.5, 1, 2, 3]);
        const ang = Math.atan2(b, a) / D;
        const errors = distinct(ang, [{ value: 90 - ang, feedback: t`That is the angle between $\vec T$ and the axis. $\vec B$ is perpendicular to $\vec T$.` }]);
        const k = 2.2 / Math.max(a, Math.PI * b);
        return {
          prompt: t`For the helix $\vec r(t) = \langle ${a === 1 ? '' : a}\cos t,\ ${a === 1 ? '' : a}\sin t,\ ${b === 1 ? '' : b}t\rangle$, find the angle between the binormal $\vec B$ at $t = ${t0}$ and the helix’s axis (the $z$-axis), in degrees.`,
          answer: ang, units: '°', tol: { rel: 0.005 }, errors,
          hints: [t`$\vec T = \frac{1}{\sqrt{${a * a + b * b}}}\langle -${a === 1 ? '' : a}\sin t,\ ${a === 1 ? '' : a}\cos t,\ ${b}\rangle$ and $\vec N = \langle -\cos t,\ -\sin t,\ 0\rangle$.`, t`$\vec B = \vec T\times\vec N$; then $\cos\theta = \vec B\cdot\hat k$.`],
          teach: 'For a helix the binormal makes the same angle with the axis at every point: B = ⟨b sin t, −b cos t, a⟩/√(a² + b²).',
          explain: t`$\vec B = \vec T\times\vec N = \frac{1}{\sqrt{${a * a + b * b}}}\langle ${b === 1 ? '' : b}\sin t,\ -${b === 1 ? '' : b}\cos t,\ ${a}\rangle$, so $\cos\theta = \frac{${a}}{\sqrt{${a * a + b * b}}}$ and $\theta = ${nice(ang, 3)}^\circ$ — the same at every $t$: as the frame rides round, $\vec B$ sweeps out a cone about the axis.`,
          visual: { type: 'c3-curve', params: { curve: { param: [`${nice(k * a, 4)}*cos(t)`, `${nice(k * a, 4)}*sin(t)`, `${nice(k * b, 4)}*(t - ${t0})`], t: [t0 - Math.PI, t0 + Math.PI] }, at: t0, fixed: true, show: ['trail', 'T', 'N', 'B'], readouts: [] }, caption: 'Drag to rotate. One turn of the helix, scaled down, with T, N and B at the gold point.' },
        };
      },
    }),
    mcq({
      id: 'plane-torsion', difficulty: 2,
      prompt: t`A satellite’s orbit lies in a single plane. What can you say about the binormal $\vec B$ and the torsion $\tau$ of its path?`,
      choices: [t`$\vec B$ is the same at every point — perpendicular to the orbit’s plane — so $\tau = 0$`, t`$\kappa = 0$ and $\tau = 0$: a plane curve neither bends nor twists`, t`$\vec B$ lies in the orbit’s plane, turning with the satellite`, t`$\tau = \kappa$, because the orbit closes on itself`],
      answer: 0,
      why: {
        1: t`A plane curve can bend as much as it likes — an orbit is curved everywhere. It just never twists out of its plane.`,
        2: t`$\vec T$ and $\vec N$ lie in the plane; $\vec B = \vec T\times\vec N$ is perpendicular to both, so it sticks out of the plane.`,
        3: 'Torsion measures twisting out of the osculating plane, and that plane never changes here, closed orbit or not.',
      },
      hints: [t`$\vec T$ and $\vec N$ both lie in the orbit’s plane.`, t`$\tau$ measures how fast $\vec B$ turns: $d\vec B/ds = -\tau\vec N$.`],
      teach: 'A plane curve has constant binormal, normal to its plane, and zero torsion; any curvature it has is bending within the plane.',
      explain: t`$\vec T$ and $\vec N$ stay in the plane, so $\vec B = \vec T\times\vec N$ is always the plane’s unit normal (on one side). It never turns, so $d\vec B/ds = \vec 0$ and $\tau = 0$. For an orbit, $\vec B$ points along the angular momentum $\vec r\times\vec v$ — the key to the next lesson.`,
      visual: { type: 'c3-curve', params: { curve: { param: ['0.6 + 2*cos(t)', `${nice(1.4 * Math.cos(30 * D), 5)}*sin(t)`, `${nice(1.4 * Math.sin(30 * D), 5)}*sin(t)`], t: [0, 2 * Math.PI] }, at: 2.2, fixed: true, show: ['T', 'N', 'B'], readouts: [] }, caption: 'Drag to rotate. An elliptical orbit in a tilted plane, with T, N and B at one point.' },
    }),
    num({
      id: 'gravity-turn', difficulty: 2,
      gen(r) {
        const v = r.pick([0.6, 1, 1.5, 2]), gam = r.pick([30, 45, 60]), g = 9.81, R = (v * 1000) ** 2 / (g * Math.cos(gam * D)) / 1000;
        const errors = distinct(R, [
          { value: (v * 1000) ** 2 / g / 1000, feedback: t`Only gravity’s component across the path bends it: $a_N = g\cos\gamma$, not $g$.` },
          { value: (v * 1000) ** 2 / (g * Math.sin(gam * D)) / 1000, feedback: t`$g\sin\gamma$ is gravity’s part **along** the path (it slows the rocket). Across the path it is $g\cos\gamma$.` },
        ]);
        return {
          prompt: t`In a gravity turn the engine thrusts along the velocity, so only gravity bends the path. A rocket is moving at $${v}$ km/s, climbing at $${gam}^\circ$ above the horizontal. What is the radius of curvature of its path, in km? (Use $g = 9.81$ m/s² and ignore air.)`,
          answer: R, units: 'km', tol: { rel: 0.005 }, errors,
          hints: [t`Thrust lies along $\vec T$, so $a_N$ comes from gravity alone: $a_N = g\cos\gamma$.`, t`$a_N = \kappa v^2$, so $R = 1/\kappa = v^2/a_N$ — with $v$ in m/s.`],
          teach: t`Only forces across the path bend it: $a_N = \kappa v^2$ equals the sum of their normal components.`,
          explain: t`$a_N = 9.81\cos ${gam}^\circ = ${nice(g * Math.cos(gam * D), 4)}$ m/s², so $R = \frac{v^2}{a_N} = \frac{(${v * 1000})^2}{${nice(g * Math.cos(gam * D), 4)}} = ${tex(R * 1000, 4)}$ m $= ${nice(R, 3)}$ km. The faster the rocket, the gentler gravity’s turn.`,
          visual: { type: 'c3-curve', params: { curve: { model: 'gravity-turn' }, plane: 'xz', at: 110, fixed: true, show: ['trail', 'v', 'split'], scale: { v: 12, a: 1200 }, readouts: [], xlabel: 'downrange x (km)', ylabel: 'altitude z (km)' }, caption: 'A gravity-turn ascent (the Explore’s rocket) at one moment: velocity, and the acceleration’s tangential (blue) and normal (orange) parts.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-components', difficulty: 2,
      gen(r) {
        const fam = r.int(0, 1), which = r.pick(['T', 'N']);
        const F = fam === 0
          ? { tex: t`\langle t^2,\ 2t,\ \ln t\rangle`, param: ['t^2', '2*t', 'ln(t)'], ts: [0.5, 1, 2], aT: (u) => 2 - 1 / u ** 2, aN: (u) => 2 / u, v: (u) => [2 * u, 2, 1 / u], a: (u) => [2, 0, -1 / u ** 2], range: [0.4, 2.4] }
          : { tex: t`\langle e^t,\ e^{-t},\ \sqrt2\,t\rangle`, param: ['exp(t)', 'exp(-t)', 'sqrt(2)*t'], ts: [0.5, 1], aT: (u) => Math.exp(u) - Math.exp(-u), aN: () => Math.SQRT2, v: (u) => [Math.exp(u), -Math.exp(-u), Math.SQRT2], a: (u) => [Math.exp(u), Math.exp(-u), 0], range: [-1.2, 1.4] };
        const t0 = r.pick(F.ts), ans = which === 'T' ? F.aT(t0) : F.aN(t0), A = norm(F.a(t0));
        const errors = distinct(ans, [
          { value: A, feedback: t`That is $|\vec a|$, both parts together.` },
          { value: which === 'T' ? F.aN(t0) : Math.abs(F.aT(t0)), feedback: which === 'T' ? 'That is the normal component.' : 'That is the tangential component.' },
        ]);
        return {
          prompt: t`For $\vec r(t) = ${F.tex}$, find the ${which === 'T' ? 'tangential' : 'normal'} component $a_${which}$ of the acceleration at $t = ${t0}$, to 3 significant figures.`,
          answer: ans, tol: { rel: 0.005, abs: 0.002 }, errors,
          hints: [t`$a_T = \vec v\cdot\vec a/|\vec v|$ and $a_N = |\vec v\times\vec a|/|\vec v|$.`],
          teach: t`$a_T = \vec v\cdot\vec a/|\vec v|$ changes the speed; $a_N = |\vec v\times\vec a|/|\vec v|$ bends the path.`,
          explain: t`$\vec v(${t0}) = ${vecTeX(F.v(t0).map((x) => +x.toFixed(4)))}$ and $\vec a(${t0}) = ${vecTeX(F.a(t0).map((x) => +x.toFixed(4)))}$, giving $a_T = ${nice(F.aT(t0), 4)}$ and $a_N = ${nice(F.aN(t0), 4)}$ (check: $a_T^2 + a_N^2 = |\vec a|^2 = ${nice(A * A, 4)}$).`,
          visual: { type: 'c3-curve', params: { curve: { param: F.param, t: F.range }, at: t0, fixed: true, show: ['trail', 'v', 'a'], scale: { v: 0.5, a: 0.5 }, readouts: [], range: 4 }, caption: 'Drag to rotate. The curve, with the velocity (green) and acceleration (violet) at the gold point, both at half scale.' },
        };
      },
    }),
    mcq({
      id: 'cp-tnb', difficulty: 2,
      prompt: t`At a point of a space curve, $\vec T = \left\langle 0,\ \tfrac35,\ \tfrac45\right\rangle$ and $\vec N = \langle -1,\ 0,\ 0\rangle$. What is the binormal $\vec B$?`,
      choices: [t`$\left\langle 0,\ -\tfrac45,\ \tfrac35\right\rangle$`, t`$\left\langle 0,\ \tfrac45,\ -\tfrac35\right\rangle$`, t`$\left\langle -1,\ \tfrac35,\ \tfrac45\right\rangle$`, t`$\langle 1,\ 0,\ 0\rangle$`],
      answer: 0,
      why: {
        1: t`That is $\vec N\times\vec T = -\vec B$: the order of the cross product matters.`,
        2: t`That is $\vec T + \vec N$ — not perpendicular to either, and not a unit vector.`,
        3: t`That is $-\vec N$, which lies in the osculating plane.`,
      },
      hints: [t`$\vec B = \vec T\times\vec N$ — in that order.`],
      teach: 'B = T × N, in that order, completing the right-handed frame.',
      explain: t`$\vec T\times\vec N = \left\langle \tfrac35\cdot0 - \tfrac45\cdot0,\ \tfrac45(-1) - 0\cdot0,\ 0\cdot0 - \tfrac35(-1)\right\rangle = \left\langle 0, -\tfrac45, \tfrac35\right\rangle$, a unit vector perpendicular to both.`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, yaw: 2.2, vectors: [{ to: [0, 0.6, 0.8], color: 'accent', label: '\\vec T' }, { to: [-1, 0, 0], color: 'warn', label: '\\vec N' }] }, caption: 'Drag to rotate. T and N at the point (drawn from the origin).' },
    }),
    num({
      id: 'cp-reentry', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([6.5, 7, 7.5]), gam = r.pick([2, 4, 6]), g = 9.5, drag = r.pick([20, 30, 40]);
        const aN = g * Math.cos(gam * D), R = ((v * 1000) ** 2 / aN) / 1000;
        const errors = distinct(R, [
          { value: ((v * 1000) ** 2 / Math.hypot(drag, aN)) / 1000, feedback: t`Drag acts along $-\vec T$: it changes the speed but cannot bend the path. Use only the normal component, $a_N = g\cos\gamma$.` },
          { value: ((v * 1000) ** 2 / (g * Math.sin(gam * D))) / 1000, feedback: t`$g\sin\gamma$ is gravity’s component along the path. Across it, $g\cos\gamma$.` },
          { value: v * v / aN, feedback: 'Convert the speed to m/s before squaring.' },
        ]);
        return {
          prompt: t`A ballistic capsule re-enters at 100 km altitude at $${v}$ km/s, flying $${gam}^\circ$ below the local horizontal. Aerodynamic drag acts straight against its velocity, slowing it at $${drag}$ m/s², and gravity there is $9.5$ m/s² toward Earth’s centre. What is the radius of curvature of its path, in km?`,
          answer: R, units: 'km', tol: { rel: 0.005 }, errors,
          hints: [t`Split each force’s acceleration into parts along and across the velocity: drag has no part across it.`, t`$a_N = g\cos\gamma = \kappa v^2$, so $R = v^2/(g\cos\gamma)$.`],
          teach: 'Only accelerations across the path bend it: a force along the velocity changes the speed and leaves the curvature alone.',
          explain: t`Drag is pure $a_T$. Across the path there is only gravity’s part, $a_N = 9.5\cos ${gam}^\circ = ${nice(aN, 4)}$ m/s², so $R = \frac{v^2}{a_N} = \frac{(${v * 1000})^2}{${nice(aN, 4)}}$ m $= ${nice(R, 4)}$ km. That is tighter than the 6471 km circle of the altitude itself, so the path keeps steepening toward the ground. A capsule at $\sqrt{9.5 \times 6.471\times10^6} \approx 7.84$ km/s would curve exactly as fast as the Earth below it: orbital speed.`,
          visual: {
            type: 'graph',
            params: {
              x: [-3.2, 3.2], y: [-1.6, 1.4], equal: true, grid: false, axes: false, xlabel: '', ylabel: '',
              arrows: [
                { from: [0, 0], to: [2.6 * Math.cos(gam * D), -2.6 * Math.sin(gam * D)], color: 'good', label: 'v' },
                { from: [0, 0], to: [-0.04 * drag * Math.cos(gam * D), 0.04 * drag * Math.sin(gam * D)], color: 'warn', label: 'drag' },
                { from: [0, 0], to: [0, -0.04 * g], color: 'violet', label: 'gravity' },
              ],
              hlines: [{ y: 0, color: 'ink3', dash: true }],
              points: [{ x: 0, y: 0, r: 4, color: 'gold' }],
            },
            caption: 'The capsule (gold) with its velocity direction and the two accelerations acting on it, drawn to one scale. The dashed line is the local horizontal.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §3.3 Arc Length and Curvature (the TNB frame)', url: 'https://openstax.org/books/calculus-volume-3/pages/3-3-arc-length-and-curvature' },
    { label: 'OpenStax Calculus Vol. 3, §3.4 Motion in Space', url: 'https://openstax.org/books/calculus-volume-3/pages/3-4-motion-in-space' },
    { label: 'Wikipedia: Gravity turn', url: 'https://en.wikipedia.org/wiki/Gravity_turn' },
  ],
});
