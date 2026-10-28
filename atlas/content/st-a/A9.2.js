// Straight lines in polar coordinates: the flat-space geodesic equation
// r̈ − r θ̇² = 0, θ̈ + (2/r) ṙ θ̇ = 0. A straight line at constant speed
// satisfies it (checked by hand, by finite differences and by RK4); dropping
// the Christoffel terms gives a spiral instead. r² θ̇ is conserved: a free
// particle sweeps equal areas about any point.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6, plane, polarGrid } from './_tcalc.js';

const t = String.raw;

// a straight line x = b (drawn), a point on it, and the polar grid
function linePic(b, s, caption, { R = 4, extra = [], points = [] } = {}) {
  const y = s;
  return plane({
    x: [-R, R], y: [r6(-0.62 * R), r6(0.62 * R)],
    curves: [...polarGrid(R + 1), { param: [`${r6(b)}`, 't'], t: [r6(-0.62 * R), r6(0.62 * R)], color: 'gold', width: 2.4 }],
    arrows: [{ from: [0, 0], to: [r6(b), r6(y)], color: 'ink3', width: 1.4, dash: [4, 4] }, { from: [r6(b), r6(y)], to: [r6(b), r6(y + 0.9)], color: 'gold', width: 2.6, label: 'v' }, ...extra],
    points: [{ x: 0, y: 0, r: 4, color: 'ink', label: 'O', labelDx: -14, labelDy: 12 }, { x: r6(b), y: r6(y), r: 4, color: 'gold' }, ...points],
    caption,
  });
}

// the Explore: the line x = b, the Γ-free "solution" from the same start, and a moving point
const RT = 'sqrt(b^2 + tt^2)';
const explore = {
  type: 'graph',
  title: 'A straight line in polar coordinates',
  lead: t`A particle moves along the straight line $x = b$ at unit speed (gold), with no force on it. In the origin’s polar coordinates its $r$ and $\theta$ change in a complicated way — yet they satisfy the geodesic equations. The readouts check them **numerically** at the time $t$: $\ddot r$ from finite differences of $r(t)$ against $r\dot\theta^2$, and $\ddot\theta$ against $-2\dot r\dot\theta/r$. The red dashed curve starts from the same point with the same $\dot r$ and $\dot\theta$ but ignores the Christoffel terms: $\ddot r = \ddot\theta = 0$.`,
  tasks: [
    t`Slide $t$: $\ddot r$ is positive everywhere, though nothing pushes the particle — it equals $r\dot\theta^2$ at every moment, to the digits shown.`,
    t`Watch $r^2\dot\theta$: it stays equal to $b$. That is the $\theta$ equation, $\tfrac{d}{dt}(r^2\dot\theta) = 0$ — a free particle sweeps equal areas about any point.`,
    t`Follow the red curve: with the Christoffel terms dropped, “uniform motion in $r$ and $\theta$” is a spiral into the origin, not a straight line.`,
  ],
  params: {
    x: [-4.4, 4.4], y: [-2.9, 2.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
    sliders: [
      { key: 'b', label: 'closest approach $b$', min: 1.5, max: 3, step: 0.1, value: 2, explain: 'The distance from the origin to the line.' },
      { key: 'tt', label: 'time $t$', min: -2.5, max: 2.5, step: 0.05, value: -1, explain: 'Time, with t = 0 at closest approach; the speed is 1.' },
    ],
    curves: [
      ...polarGrid(5),
      { param: ['b', 't'], t: [-2.5, 2.5], color: 'gold', width: 2.6 },
      { param: ['(sqrt(b^2 + 6.25) - 2.5*t/sqrt(b^2 + 6.25))*cos(atan(-2.5/b) + b*t/(b^2 + 6.25))', '(sqrt(b^2 + 6.25) - 2.5*t/sqrt(b^2 + 6.25))*sin(atan(-2.5/b) + b*t/(b^2 + 6.25))'], t: [0, 3.3], color: 'bad', width: 2, dash: [6, 4] },
    ],
    arrows: [
      { from: [0, 0], to: ['b', 'tt'], color: 'ink3', width: 1.2, dash: [4, 4] },
      { from: ['b', 'tt'], to: ['b', 'tt + 0.8'], color: 'gold', width: 2.6, label: 'v' },
    ],
    points: [{ x: 0, y: 0, r: 3, color: 'ink2' }, { x: 'b', y: 'tt', r: 4.5, color: 'gold' }, { x: 'b', y: -2.5, r: 3.5, color: 'bad', label: 'start', labelDx: 6 }],
    readouts: [
      { label: '$r$', expr: RT, digits: 4 },
      { label: t`$\ddot r$ (finite differences)`, expr: `(sqrt(b^2 + (tt + 0.01)^2) - 2*${RT} + sqrt(b^2 + (tt - 0.01)^2))/0.0001`, digits: 4 },
      { label: t`$r\dot\theta^2$`, expr: `${RT}*(b/(b^2 + tt^2))^2`, digits: 4 },
      { label: t`$\ddot\theta$ (finite differences)`, expr: '(atan((tt + 0.01)/b) - 2*atan(tt/b) + atan((tt - 0.01)/b))/0.0001', digits: 4 },
      { label: t`$-2\dot r\dot\theta/r$`, expr: `-2*(tt/${RT})*(b/(b^2 + tt^2))/${RT}`, digits: 4 },
      { label: t`$r^2\dot\theta$`, expr: `(b^2 + tt^2)*b/(b^2 + tt^2)`, digits: 4 },
    ],
  },
  caption: t`A flat plane under a polar grid centred on O. Gold: the straight path $x = b$ at unit speed. Red dashed: the curve with $r$ and $\theta$ changing at their starting rates for ever (Christoffel terms dropped). The finite differences use a time step of 0.01; agreement to about four digits is their accuracy, not a coincidence.`,
};

export default lesson({
  id: 'st-a.A9.2',
  title: 'Straight lines in polar coordinates: flat-space geodesics',
  minutes: 12, difficulty: 3,
  intro: t`A free particle moves in a straight line at constant speed: its velocity does not change, $\nabla_{\dot x}\dot x = 0$. Written out with the covariant derivative of lesson A8.3, that is the **geodesic equation**,

$$\frac{d^2x^\mu}{dt^2} + \Gamma^\mu{}_{\nu\rho}\,\frac{dx^\nu}{dt}\frac{dx^\rho}{dt} = 0$$

In polar coordinates, with $\Gamma^r{}_{\theta\theta} = -r$ and $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$, it becomes two equations: $\ddot r - r\dot\theta^2 = 0$ and $\ddot\theta + \tfrac2r\dot r\dot\theta = 0$ (dots are $d/dt$). They are the polar acceleration of Physics I set to zero: $r\dot\theta^2$ is the “centripetal” term and $2\dot r\dot\theta$ the “Coriolis-like” one — **Christoffel terms**, artefacts of the curved grid, not forces. The second equation says $\tfrac{d}{dt}(r^2\dot\theta) = 0$.`,
  symbols: [
    { tex: t`x^\mu(t)`, text: t`the path: its coordinates as functions of time — here $r(t)$ and $\theta(t)$` },
    { tex: t`\dfrac{dx^\mu}{dt}`, text: t`the velocity’s coordinate components, $(\dot r, \dot\theta)$, in m/s and rad/s` },
    { tex: t`\dfrac{d^2x^\mu}{dt^2}`, text: t`the second derivatives $(\ddot r, \ddot\theta)$ — not the acceleration’s components, until the $\Gamma$ terms are added` },
    { tex: t`\Gamma^\mu{}_{\nu\rho}`, text: 'the Christoffel symbols of the coordinates (lesson A8.2)' },
  ],
  why: t`In general relativity the same equation, with spacetime’s Christoffel symbols, is free fall — orbits, light bending, the paths of GPS satellites. Flat space in polar coordinates is the one case where you can check every answer against a ruler. (The Road derives it from the action in gr.S12.d.)`,
  visual: explore,
  example: {
    prompt: t`A particle moves along the line $x = b$ at speed $v$, passing closest to the origin at $t = 0$: $r = \sqrt{b^2 + v^2t^2}$, $\theta = \arctan(vt/b)$. Show that it satisfies both polar geodesic equations, then check with numbers for $b = 2$ m, $v = 3$ m/s, $t = 1$ s.`,
    visual: linePic(2, 1.5, t`The straight path $x = b$ (gold) and the particle’s position vector from O (dashed).`),
    steps: [
      { label: 'First derivatives', text: t`$\dot r = \dfrac{v^2t}{r}$ and $\dot\theta = \dfrac{v/b}{1 + v^2t^2/b^2} = \dfrac{bv}{r^2}$.` },
      { label: 'The r equation', text: t`$\ddot r = \dfrac{v^2r - v^2t\,\dot r}{r^2} = \dfrac{v^2(r^2 - v^2t^2)}{r^3} = \dfrac{b^2v^2}{r^3}$, and $r\dot\theta^2 = r\cdot\dfrac{b^2v^2}{r^4} = \dfrac{b^2v^2}{r^3}$. Equal: $\ddot r - r\dot\theta^2 = 0$ ✓.` },
      { label: 'The θ equation', text: t`$r^2\dot\theta = bv$, a constant, so $\tfrac{d}{dt}(r^2\dot\theta) = r(r\ddot\theta + 2\dot r\dot\theta) = 0$, which is $\ddot\theta + \tfrac2r\dot r\dot\theta = 0$ ✓.` },
      { label: 'Numbers', text: t`At $t = 1$ s: $r = \sqrt{13} = 3.606$ m, $\dot r = 9/3.606 = 2.496$ m/s, $\dot\theta = 6/13 = 0.4615$ rad/s. Then $\ddot r = 36/3.606^3 = 0.768\ \text{m/s}^2$ and $r\dot\theta^2 = 3.606\times0.2130 = 0.768\ \text{m/s}^2$ ✓; $\ddot\theta = -2\dot r\dot\theta/r = -0.639\ \text{rad/s}^2$.` },
      { label: 'Sense check', text: t`$\ddot r > 0$ with no force: the distance from O grows ever faster toward the straight-line rate $v$, because more of the velocity points away from O as the particle recedes. $r^2\dot\theta = bv = 6\ \text{m}^2/\text{s}$ is twice the rate at which the line from O sweeps area.` },
    ],
    answer: t`Both equations hold for all $t$: $\ddot r = r\dot\theta^2 = b^2v^2/r^3$ and $r^2\dot\theta = bv$ is constant. At $t = 1$ s, $\ddot r = 0.768\ \text{m/s}^2$ and $\ddot\theta = -0.639\ \text{rad/s}^2$.`,
  },
  practice: [
    num({
      id: 'area-rate', difficulty: 1,
      gen(r) {
        const b = r.pick([2, 5, 12]), v = r.pick([3, 4, 8]);
        return {
          prompt: t`A puck slides without friction in a straight line, passing ${b} m from a post at ${v} m/s. In polar coordinates centred on the post, what is the constant value of $r^2\dot\theta$, in $\text{m}^2/\text{s}$?`,
          visual: linePic(Math.min(b, 3), 1, 'Schematic: the puck’s straight path past the post O.'),
          answer: b * v, units: 'm^2/s', tol: { rel: 0.005 },
          errors: [{ value: (b * v) / 2, feedback: t`That is the areal rate $\tfrac12r^2\dot\theta$. The conserved quantity asked for is $r^2\dot\theta$ itself.` }],
          hints: [t`$r^2\dot\theta$ is the same all along the path; evaluate it at closest approach, where $r = b$ and $\dot\theta = v/b$.`],
          teach: t`The $\theta$ geodesic equation is $\tfrac{d}{dt}(r^2\dot\theta) = 0$: for a straight line, $r^2\dot\theta = bv$.`,
          explain: t`$r^2\dot\theta = b^2\cdot\dfrac{v}{b} = bv = ${b * v}\ \text{m}^2/\text{s}$ — angular momentum per unit mass, conserved because no force acts.`,
        };
      },
    }),
    num({
      id: 'rddot', difficulty: 2,
      gen(r) {
        const b = r.pick([3, 4, 6]), v = r.pick([2, 5, 10]), s = r.pick([4, 8]);
        const R = Math.hypot(b, s), ans = (b * b * v * v) / R ** 3;
        return {
          prompt: t`A drone flies straight and level at ${v} m/s on a line whose closest approach to a ground beacon is ${b} m (measured in the plane of flight). When it is ${s} m past the closest point, find $\ddot r$, the second derivative of its distance from the beacon, in m/s².`,
          visual: linePic(Math.min(b, 2.5), Math.min(s, 2.2) * 0.8, 'Schematic: the straight path, the beacon O and the drone’s position vector.'),
          answer: ans, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: t`No force acts, but $\ddot r = r\dot\theta^2 \ne 0$ in polar coordinates.` }, { value: (v * v) / b, feedback: t`That is $\ddot r$ at closest approach. Here $r = \sqrt{b^2 + s^2}$ and $\dot\theta = bv/r^2$.` }],
          hints: [t`$r = \sqrt{${b}^2 + ${s}^2} = ${nice(R, 4)}$ m and $\dot\theta = bv/r^2$.`, t`$\ddot r = r\dot\theta^2 = b^2v^2/r^3$.`],
          teach: t`Along a straight line, $\ddot r = r\dot\theta^2 = b^2v^2/r^3$ — largest at closest approach, fading as $1/r^3$.`,
          explain: t`$\dot\theta = ${b * v}/${nice(R * R, 4)} = ${nice((b * v) / (R * R), 4)}$ rad/s, so $\ddot r = r\dot\theta^2 = ${nice(ans, 4)}$ m/s².`,
        };
      },
    }),
    num({
      id: 'thetaddot', difficulty: 2,
      gen(r) {
        const b = r.pick([2, 3]), v = r.pick([2, 3, 4]), tt = r.pick([-1, 1, 2]);
        const R = Math.hypot(b, v * tt), rd = (v * v * tt) / R, td = (b * v) / (R * R), ans = (-2 * rd * td) / R;
        return {
          prompt: t`For straight-line motion $r = \sqrt{b^2 + v^2t^2}$ with $b = ${b}$ m, $v = ${v}$ m/s, at $t = ${tt}$ s you have $\dot r = ${nice(rd, 4)}$ m/s and $\dot\theta = ${nice(td, 4)}$ rad/s. Use the geodesic equation to find $\ddot\theta$, in rad/s².`,
          visual: linePic(b > 2.5 ? 2.5 : b, (v * tt) / 2, 'Schematic: the straight path and the moving point.'),
          answer: ans, units: 'rad/s^2', tol: { rel: 0.01 },
          errors: [{ value: (-rd * td) / R, feedback: t`The coefficient is $2/r$: $\Gamma^\theta{}_{r\theta}$ and $\Gamma^\theta{}_{\theta r}$ both contribute.` }],
          hints: [t`$\ddot\theta = -\Gamma^\theta{}_{r\theta}\dot r\dot\theta - \Gamma^\theta{}_{\theta r}\dot\theta\dot r = -\tfrac2r\dot r\dot\theta$.`, t`$r = ${nice(R, 4)}$ m.`],
          teach: t`The two symmetric symbols $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r}$ give the factor 2 in $\ddot\theta = -\tfrac2r\dot r\dot\theta$.`,
          explain: t`$\ddot\theta = -2(${nice(rd, 4)})(${nice(td, 4)})/${nice(R, 4)} = ${nice(ans, 4)}$ rad/s². ${tt > 0 ? 'Receding, the angle swings ever more slowly.' : 'Approaching, the angle swings ever faster.'}`,
        };
      },
    }),
    mcq({
      id: 'drop-gamma', difficulty: 2,
      prompt: t`Someone drops the Christoffel terms and solves $\ddot r = 0$, $\ddot\theta = 0$: $r$ and $\theta$ each change at a constant rate. What path is that?`,
      visual: plane({ x: [-4.4, 4.4], y: [-2.7, 2.7], curves: [...polarGrid(5), { param: ['(3.2 - 0.5*t)*cos(-0.8 + 0.35*t)', '(3.2 - 0.5*t)*sin(-0.8 + 0.35*t)'], t: [0, 6], color: 'bad', width: 2.4, dash: [6, 4] }, { param: ['2', 't'], t: [-2.6, 2.6], color: 'gold', width: 2 }], points: [{ x: 0, y: 0, r: 3, color: 'ink2' }], caption: 'Gold: a straight line. Red dashed: a path with r and θ each changing at a constant rate.' }),
      choices: [
        'A spiral (r changing linearly with θ), not a straight line: the polar grid is not straight',
        'A straight line, because nothing accelerates',
        'A circle about the origin',
        'A straight line through the origin, whatever the starting velocity',
      ],
      answer: 0,
      why: {
        1: t`Constant $\dot r$ and $\dot\theta$ means steady motion in the grid, and the grid curves. A straight line needs $\ddot r = r\dot\theta^2 \ne 0$.`,
        2: t`Only if $\dot r = 0$; then $r$ is fixed.`,
        3: t`Only if $\dot\theta = 0$ from the start.`,
      },
      hints: [t`With $r = r_0 + at$ and $\theta = \theta_0 + \omega t$, eliminate $t$: how does $r$ depend on $\theta$?`],
      teach: 'Without the Christoffel terms, “constant velocity in the coordinates” follows the curving grid, not a straight line.',
      explain: t`$r = r_0 + (a/\omega)(\theta - \theta_0)$: an Archimedean spiral. The Christoffel terms are what turn coordinate motion into straight motion — and a tracking computer that left them out would see forces that are not there.`,
    }),
    num({
      id: 'not-geodesic', difficulty: 2,
      gen(r) {
        const [what, R, v] = r.pick([['A car drives round a roundabout', 25, 12], ['A runner rounds the bend of a track', 36.5, 9], ['A train takes a curve', 600, 40]]);
        const ans = -(v * v) / R;
        return {
          prompt: t`${what} of radius ${R} m at a steady ${v} m/s, so $\dot r = 0$, $\ddot r = 0$ and $\dot\theta = v/r$. A circle is not a geodesic: the radial component of its acceleration is $a^r = \ddot r - r\dot\theta^2$. Find $a^r$, in m/s².`,
          visual: plane({ x: [-4, 4], y: [-2.5, 2.5], curves: [...polarGrid(5), { param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.6 }], arrows: [{ from: [1.4142, 1.4142], to: [0.5657, 0.5657], color: 'bad', width: 2.4, label: 'a' }, { from: [1.4142, 1.4142], to: [0.7071, 2.1213], color: 'ink', width: 2, label: 'v' }], points: [{ x: 1.4142, y: 1.4142, r: 4, color: 'gold' }], caption: 'Schematic: a circular path and its inward acceleration.' }),
          answer: ans, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`$\ddot r = 0$, but the Christoffel term $-r\dot\theta^2$ is not zero: the circle is curved.` }],
          hints: [t`$a^r = 0 - r(v/r)^2 = -v^2/r$.`],
          teach: t`The left side of the geodesic equation is the acceleration; for a circle it is the centripetal $-v^2/r$, entirely Christoffel term.`,
          explain: t`$a^r = -v^2/r = -${v}^2/${R} = ${nice(ans, 4)}$ m/s², pointing inward. Something — friction, the rails — must supply it; a geodesic needs nothing.`,
        };
      },
    }),
    mcq({
      id: 'cone', difficulty: 2,
      prompt: t`A cone is flat in the sense that matters: cut it along a line and it unrolls onto a table without stretching. A geodesic integrated on the cone (below) wraps around it. What does it look like after unrolling?`,
      visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'cone', heading: 30, controls: false, readout: false }, caption: 'A geodesic on a cone, computed by integrating the geodesic equation of the cone’s own metric.' },
      choices: [
        'A straight line on the flat paper',
        'A spiral, because it wraps around the cone',
        'A circle centred on the tip',
        'It cannot be unrolled: the cone is curved',
      ],
      answer: 0,
      why: {
        1: 'It looks like a spiral only from outside, in three dimensions; the geodesic equation uses distances within the surface.',
        2: 'Circles about the tip are not geodesics (Γ terms push them off), just as circles in the plane are not straight.',
        3: 'Away from its tip, a cone has zero intrinsic curvature: it unrolls without stretching.',
      },
      hints: ['Unrolling keeps every distance measured within the surface; the geodesic equation only knows those distances.'],
      teach: 'Geodesics are defined by the metric alone, so a surface that unrolls flat has straight-line geodesics on the unrolled sheet.',
      explain: t`The cone’s metric $ds^2 + s^2\sin^2\alpha\,d\phi^2$ is the flat polar metric in disguise (with the angle rescaled), so its geodesics are the polar straight lines of this lesson, wrapped around the cone (gr.S13.d uses cones for parallel transport).`,
    }),
    code({
      id: 'rk4-geodesic', difficulty: 3,
      prompt: t`Integrate the polar geodesic equations numerically. Finish \`rhs(s)\` for the state $s = (r, \theta, \dot r, \dot\theta)$: it must return $(\dot r, \dot\theta, \ddot r, \ddot\theta)$ from $\ddot r = r\dot\theta^2$ and $\ddot\theta = -2\dot r\dot\theta/r$. The program then takes RK4 steps from $(r, \theta) = (2, 0)$ with $(\dot r, \dot\theta) = (0, 0.5)$ — a particle moving straight up the line $x = 2$ at speed 1 — for 6 s.`,
      starter: t`import numpy as np

def rhs(s):
    r, th, rd, thd = s
    return np.array([0.0, 0.0, 0.0, 0.0])   # (r', theta', r'', theta'')

def rk4(s, h):
    k1 = rhs(s); k2 = rhs(s + h/2 * k1); k3 = rhs(s + h/2 * k2); k4 = rhs(s + h * k3)
    return s + h/6 * (k1 + 2*k2 + 2*k3 + k4)

s = np.array([2.0, 0.0, 0.0, 0.5])
h, n = 0.001, 6000
path = [s]
for _ in range(n):
    s = rk4(s, h)
    path.append(s)
path = np.array(path)
r, th = path[:, 0], path[:, 1]
x, y = r * np.cos(th), r * np.sin(th)
print("x stays at", x.min(), "to", x.max(), "; y at t = 6:", y[-1])
`,
      answer: t`import numpy as np

def rhs(s):
    r, th, rd, thd = s
    return np.array([rd, thd, r * thd**2, -2 * rd * thd / r])   # (r', theta', r'', theta'')

def rk4(s, h):
    k1 = rhs(s); k2 = rhs(s + h/2 * k1); k3 = rhs(s + h/2 * k2); k4 = rhs(s + h * k3)
    return s + h/6 * (k1 + 2*k2 + 2*k3 + k4)

s = np.array([2.0, 0.0, 0.0, 0.5])
h, n = 0.001, 6000
path = [s]
for _ in range(n):
    s = rk4(s, h)
    path.append(s)
path = np.array(path)
r, th = path[:, 0], path[:, 1]
x, y = r * np.cos(th), r * np.sin(th)
print("x stays at", x.min(), "to", x.max(), "; y at t = 6:", y[-1])`,
      tests: [
        { name: t`the path stays on the straight line $x = 2$ (to $10^{-6}$)`, code: 'abs(x - 2).max() < 1e-6' },
        { name: t`it moves at unit speed: $y = 6$ at $t = 6$ s`, code: 'abs(y[-1] - 6) < 1e-6' },
        { name: t`$r^2\dot\theta$ stays equal to 2 all the way`, code: 'abs(path[:, 0]**2 * path[:, 3] - 2).max() < 1e-6' },
      ],
      hints: [t`\`rhs\` returns the derivative of each entry of the state: \`(rd, thd, r'', theta'')\`.`, t`\`return np.array([rd, thd, r * thd**2, -2 * rd * thd / r])\``],
      teach: 'Integrating the geodesic equation numerically in polar coordinates traces a straight line: the Christoffel terms do exactly the steering needed.',
      explain: t`With RK4 and a 1 ms step the computed path stays on $x = 2$ far more closely than the tests demand, and $r^2\dot\theta$ is conserved just as well. Delete the two Christoffel terms (\`0.0\` in place of \`r * thd**2\` and \`-2 * rd * thd / r\`) and the particle circles the origin instead.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-flyby', difficulty: 3, transfer: true,
      gen(r) {
        const b = r.pick([200, 500, 1000]), v = r.pick([5, 10, 15]), dist = r.pick([2, 3]) * b;
        const ans = (b * v) / (dist * dist);
        return {
          prompt: t`A spacecraft coasts past a small asteroid — too small for its gravity to matter — on a straight line passing ${b} km from it at ${v} km/s. Its camera must turn to keep the asteroid in view. Using the conserved $r^2\dot\theta = bv$, find the camera’s turning rate $\dot\theta$ when the spacecraft is ${dist} km from the asteroid, in rad/s.`,
          visual: linePic(2, 2.2, 'Schematic, not to scale: the straight flyby path (gold) and the line of sight to the asteroid at O.', { points: [{ x: 0, y: 0, r: 6, color: 'ink3' }] }),
          answer: ans, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: v / b, feedback: t`That is the rate at closest approach, $v/b$. Here $r$ is larger: $\dot\theta = bv/r^2$.` }, { value: v / dist, feedback: t`$v/r$ would be right only if the whole velocity were sideways; it is not, away from closest approach. Use $r^2\dot\theta = bv$.` }],
          hints: [t`$r^2\dot\theta$ keeps its closest-approach value $b\cdot(v/b)\cdot b = bv$.`, t`$\dot\theta = bv/r^2$ with $r = ${dist}$ km.`],
          teach: t`The θ geodesic equation is a conservation law: $r^2\dot\theta = bv$ along any straight line.`,
          explain: t`$\dot\theta = \dfrac{(${b})(${v})}{${dist}^2} = ${tex(ans, 4)}$ rad/s, a ${dist / b === 2 ? 'quarter' : 'ninth'} of the peak rate $v/b$ at closest approach.`,
        };
      },
    }),
    num({
      id: 'cp-conserve', difficulty: 2,
      gen(r) {
        const r1 = r.pick([3, 5]), w1 = r.pick([0.2, 0.4]), r2 = r.pick([6, 10]);
        const ans = (r1 * r1 * w1) / (r2 * r2);
        return {
          prompt: t`A free particle on a straight path is at $r = ${r1}$ m with $\dot\theta = ${w1}$ rad/s. Later it is at $r = ${r2}$ m. What is $\dot\theta$ then, in rad/s?`,
          visual: linePic(2, 0.5, 'Schematic: a straight path and the moving line of sight from O.'),
          answer: ans, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: (r1 * w1) / r2, feedback: t`The conserved quantity is $r^2\dot\theta$, with $r$ squared.` }],
          hints: [t`$r_1^2\dot\theta_1 = r_2^2\dot\theta_2$.`],
          teach: t`$r^2\dot\theta$ is constant along a geodesic of the plane.`,
          explain: t`$\dot\theta_2 = ${r1 * r1}\times${w1}/${r2 * r2} = ${nice(ans, 4)}$ rad/s.`,
        };
      },
    }),
    mcq({
      id: 'cp-statement', difficulty: 2,
      prompt: t`Which statement about the polar equations $\ddot r - r\dot\theta^2 = 0$, $\ddot\theta + \tfrac2r\dot r\dot\theta = 0$ is right?`,
      visual: linePic(1.8, -0.8, 'A straight path past O.'),
      choices: [
        t`They describe straight lines at constant speed; the $r\dot\theta^2$ and $\tfrac2r\dot r\dot\theta$ terms are Christoffel terms from the curved grid, not forces`,
        t`They describe motion under a centrifugal force $r\dot\theta^2$`,
        t`They hold only for paths through the origin`,
        t`They are the equations of circular orbits`,
      ],
      answer: 0,
      why: {
        1: 'No force acts on a free particle; the term appears only because the polar basis turns.',
        2: t`Through the origin $\dot\theta = 0$ and they reduce to $\ddot r = 0$; but they hold for every straight line.`,
        3: t`A circle has $\ddot r - r\dot\theta^2 = -r\dot\theta^2 \ne 0$: it needs a force.`,
      },
      hints: ['Test the equations on the line x = b from the worked example.'],
      teach: 'Geodesic equations in curvilinear coordinates carry Christoffel terms that look like forces but are geometry.',
      explain: t`They are $\nabla_{\dot x}\dot x = 0$ in polar coordinates. General relativity reverses the logic: gravity itself is moved into the Christoffel terms, and free fall is a geodesic.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 3 (the geodesic equation)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §6.4 (geodesics), with the polar plane of ch. 5', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Taylor, Classical Mechanics, §1.7 (acceleration in polar coordinates)', url: 'https://uscibooks.aip.org/books/classical-mechanics/' },
  ],
});
