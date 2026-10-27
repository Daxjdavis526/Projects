// The metric: a rule for measuring distances and times — Intuition Mode.
// Line elements are written out term by term (no index notation); signature
// (−, +, +, +) as in Carroll.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { fromSkew } from '../../src/viz/model/gr-coords.js';
import { spacetimeSketch } from './_foundations.js';

const t = String.raw;

const R_EARTH = 6371;                 // km, mean radius (a perfect sphere is assumed)
const DEG = Math.PI / 180;
const grp = (x) => x.toLocaleString('en-US').replace(/,/g, '{,}');   // thousands separator safe inside $…$

// a circle of radius ρ (measured along the ground) around the pole of a sphere of radius R
const sphereCircle = (rho, R = R_EARTH) => 2 * Math.PI * R * Math.sin(rho / R);
const EX_RHO = 100;                                         // km
const EX_C = sphereCircle(EX_RHO);
const EX_SHORT_M = (2 * Math.PI * EX_RHO - EX_C) * 1000;    // ≈ 25.8 m

// the polar line element as a picture (not to scale: a real “small step” is far smaller)
const stepPicture = (caption) => ({
  type: 'gr-coordinates',
  params: { mode: 'measure', grid: 'polar', gridChoice: false, shape: 'none', shapeChoice: false, step: { r: 3, theta: 25, dr: 0.7, dtheta: 14 } },
  caption: caption ?? t`One small step, drawn much larger than a real one. On the plane: out by $dr$, around by $r\,d\theta$, and the true step $ds$. In the chart the same step has sides $dr$ and $d\theta$ — and $\sqrt{dr^2 + d\theta^2}$ is not its length.`,
});

export default lesson({
  id: 'gr.S08.i',
  title: 'The metric: a rule for measuring distances and times',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-der'],
  intro: t`Coordinates are numbers attached to places and moments. On their own they measure nothing: one degree of longitude is ${fmt(R_EARTH * DEG, 3)} km of ground at the equator and none at all at the pole. The **metric** is the rule that turns a small step in the coordinates into a real distance a ruler would measure — or, in spacetime, a real time a clock would record. It is written as a **line element**, $ds^2 = \ldots$, for a tiny step.

On a flat sheet with ordinary $x, y$ axes the metric is Pythagoras, $ds^2 = dx^2 + dy^2$. Label the same sheet with polar coordinates and the rule becomes

$$ds^2 = dr^2 + r^2\,d\theta^2$$

because turning through a small angle $d\theta$ covers more ground farther out. In spacetime the metric of special relativity is the interval of step 4 for a tiny step — the equation above. In general relativity **the metric is the gravitational field**: its numbers change from place to place, and they say how far apart nearby events are, how fast clocks tick there, and which way light can go.`,
  equation: t`ds^2 = -c^2\,dt^2 + dx^2 + dy^2 + dz^2`,
  symbols: [
    { tex: 'ds^2', text: t`the squared size of a tiny step between two nearby events. Positive for a step in space: $ds$ is what a ruler measures. Negative for a step a clock can take: the clock records $d\tau = \sqrt{-ds^2}/c$` },
    { tex: 'dt', text: 'a tiny step in coordinate time, in seconds' },
    { tex: 'dx,\\ dy,\\ dz', text: 'tiny steps along three perpendicular directions, in metres' },
    { tex: 'c', text: t`the speed of light; $c\,dt$ turns the time step into a distance so it can be combined with the others` },
    { tex: 'r,\\ \\theta', text: t`polar coordinates on a plane: distance from the origin, and angle in radians. In the polar metric the factor $r^2$ in front of $d\theta^2$ is what makes an angle step into a distance` },
  ],
  why: 'Every black-hole and cosmology lesson ahead starts by writing down a metric — Schwarzschild, Kerr, the expanding universe — and reading distances, clock rates and light paths from it.',
  visual: {
    type: 'gr-coordinates',
    title: 'One plane, two sets of labels, one length',
    lead: t`The gold circle is drawn on a flat plane covered by a polar grid; the second panel is the coordinate chart, with $\theta$ across and $r$ up. The readout measures the circle three ways.`,
    tasks: [
      'Drag the circle anywhere: the Pythagoras length and the polar-metric length always agree.',
      'The third number adds up √(dr² + dθ²) — coordinate steps treated as distances. It changes as you move the circle, though the circle itself does not. It is not a length.',
      'Switch to skewed axes: a different metric, with a cross term — and the same length again.',
    ],
    params: { mode: 'measure', grid: 'polar', shape: 'circle', centre: [2, 1], radius: 1.5 },
  },
  example: {
    prompt: t`An ant on a perfectly round globe of radius $R = ${grp(R_EARTH)}$ km walks ${EX_RHO} km straight out from the North Pole in every direction, marking a circle. How long is the circle? On a flat sheet it would be $2\pi\times${EX_RHO}$ km.`,
    visual: {
      type: 'gr-sphere-transport',
      params: { mode: 'cap', lat: 60, transport: false, measure: true },
      caption: t`Not to scale: this circle is 30° from the pole; a ${EX_RHO} km circle on the Earth would be a speck. Move the latitude and compare the circumference with $2\pi\rho$. Distances in units of the sphere’s radius $R$.`,
    },
    steps: [
      { label: 'The sphere’s metric', text: t`With $\theta$ the angle from the pole and $\phi$ the longitude (both in radians), a sphere of radius $R$ has $ds^2 = R^2\,d\theta^2 + R^2\sin^2\theta\,d\phi^2$. The first term is a step toward or away from the pole; the second, a step east–west, which shrinks near the pole by the factor $\sin\theta$.` },
      { label: 'Measure the radius on the ground', text: t`Walking straight out from the pole, $d\phi = 0$ and $ds = R\,d\theta$. So ${EX_RHO} km of walking reaches $\theta_0 = ${EX_RHO}/${R_EARTH} = ${fmt(EX_RHO / R_EARTH, 4)}$ rad.` },
      { label: 'Measure around', text: t`Going around at fixed $\theta_0$, $d\theta = 0$ and $ds = R\sin\theta_0\,d\phi$; once round is $\phi$ from 0 to $2\pi$: circumference $= 2\pi R\sin\theta_0 = ${EX_C.toFixed(3)}$ km.` },
      { label: 'Sense check: curvature from the inside', text: t`$2\pi\times${EX_RHO} = ${(2 * Math.PI * EX_RHO).toFixed(3)}$ km, so the circle is about ${fmt(EX_SHORT_M, 3)} m short — four parts in a hundred thousand. Ants could measure that without ever leaving the surface or knowing about a third dimension. This *intrinsic* curvature, found from distances measured inside, is the only kind general relativity needs.` },
    ],
    answer: t`About ${EX_C.toFixed(3)} km — ${fmt(EX_SHORT_M, 3)} m shorter than $2\pi\times${EX_RHO}$ km. (A real Earth adds hills and a slight flattening; this is the ideal sphere.)`,
  },
  practice: [
    num({
      id: 'pythagoras-3d', difficulty: 1,
      gen(r) {
        const [dx, dy, dz, ds] = r.pick([[2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [6, 6, 7, 11], [2, 10, 11, 15]]);
        return {
          prompt: t`In flat space with ordinary $x, y, z$ axes the metric is $ds^2 = dx^2 + dy^2 + dz^2$. A drone moves $dx = ${dx}$ m, $dy = ${dy}$ m and $dz = ${dz}$ m. How far has it moved?`,
          answer: ds, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: dx + dy + dz, feedback: 'Steps along perpendicular directions combine by Pythagoras, not by adding.' }, { value: ds * ds, feedback: 'That is ds²; take the square root.' }],
          hints: [t`$ds^2 = ${dx}^2 + ${dy}^2 + ${dz}^2$.`],
          teach: 'With Cartesian axes the metric is Pythagoras in three dimensions.',
          explain: t`$ds^2 = ${dx * dx} + ${dy * dy} + ${dz * dz} = ${ds * ds}$, so $ds = ${ds}$ m.`,
          visual: (() => {
            const k = 2.4 / Math.max(dx, dy, dz), X = dx * k, Y = dy * k, Z = dz * k;
            return {
              type: 'surface3d',
              params: {
                z: '0', domain: [[0, X], [0, Y]], n: 4, colorBy: false, alpha: 0.35, axisLen: 2.9, axisLabels: ['x', 'y', 'z'], dist: 6, target: [X / 2, Y / 2, Z / 2],
                curves: [
                  // the box's twelve edges, thin
                  ...[[0, 0], [X, 0], [X, Y], [0, Y]].map(([a, b]) => ({ param: [`${a}`, `${b}`, `${Z}*t`], t: [0, 1], color: 'ink3', width: 1 })),
                  ...[0, Z].flatMap((h) => [[[0, 0], [X, 0]], [[X, 0], [X, Y]], [[X, Y], [0, Y]], [[0, Y], [0, 0]]].map(([[a0, b0], [a1, b1]]) => ({ param: [`${a0} + ${a1 - a0}*t`, `${b0} + ${b1 - b0}*t`, `${h}`], t: [0, 1], color: 'ink3', width: 1 }))),
                  { param: [`${X}*t`, `${Y}*t`, '0'], t: [0, 1], color: 'accent2', width: 2 },
                  { param: [`${X}`, `${Y}`, `${Z}*t`], t: [0, 1], color: 'violet', width: 2 },
                  { param: [`${X}*t`, `${Y}*t`, `${Z}*t`], t: [0, 1], color: 'gold', width: 3 },
                ],
              },
              caption: t`The drone’s move as the diagonal of a box (gold) with sides $dx$, $dy$, $dz$: Pythagoras on the floor (blue), then again with the height (violet). Drag to turn it.`,
            };
          })(),
        };
      },
    }),
    num({
      id: 'polar-around', difficulty: 1,
      gen(r) {
        const rr = r.pick([2, 5, 8, 20]), d = r.pick([2, 3, 5, 10]);
        const ds = rr * d * DEG;
        return {
          prompt: t`On a flat plane in polar coordinates, $ds^2 = dr^2 + r^2\,d\theta^2$. At $r = ${rr}$ m you step around the origin by $d\theta = ${d}^\circ$, keeping $r$ fixed. How far do you move? (Convert the angle to radians.)`,
          answer: ds, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: d * DEG, feedback: 'An angle step is not a distance: multiply by r.' }, { value: rr * d, feedback: 'Use radians: dθ = d° × π/180.' }],
          hints: [t`With $dr = 0$, $ds = r\,d\theta$.`, t`$d\theta = ${d}\times\pi/180 = ${fmt(d * DEG, 3)}$ rad.`],
          teach: t`In polar coordinates a step $d\theta$ around the origin covers a distance $r\,d\theta$ — more the farther out you are.`,
          explain: t`$ds = r\,d\theta = ${rr}\times${fmt(d * DEG, 4)} = ${fmt(ds, 3)}$ m. The same ${d}° step at twice the radius covers twice the ground.`,
          visual: stepPicture(),
        };
      },
    }),
    num({
      id: 'polar-step', difficulty: 2,
      gen(r) {
        const [rr, dr, dth, ds] = r.pick([[4, 0.03, 0.01, 0.05], [2, 0.03, 0.02, 0.05], [8, 0.03, 0.005, 0.05], [6, 0.05, 0.02, 0.13], [12, 0.05, 0.01, 0.13], [5, 0.08, 0.03, 0.17]]);
        return {
          prompt: t`On a flat plane in polar coordinates, $ds^2 = dr^2 + r^2\,d\theta^2$. At $r = ${rr}$ m a small step has $dr = ${dr}$ m and $d\theta = ${dth}$ rad. How long is the step?`,
          answer: ds, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(dr, dth), feedback: 'That treats dθ as a distance. The metric multiplies it by r: the around-step is r dθ.' }, { value: dr + rr * dth, feedback: 'The two parts are perpendicular: combine them with Pythagoras, as the metric says.' }],
          hints: [t`The around-part of the step is $r\,d\theta = ${rr}\times${dth} = ${nice(rr * dth)}$ m.`, t`$ds = \sqrt{${dr}^2 + ${nice(rr * dth)}^2}$.`],
          teach: 'The metric tells you how to combine coordinate steps into a distance: here, dr and r dθ by Pythagoras.',
          explain: t`$ds^2 = ${dr}^2 + (${rr}\times${dth})^2 = ${nice(dr * dr)} + ${nice((rr * dth) ** 2)} = ${nice(ds * ds)}$, so $ds = ${ds}$ m.`,
          visual: stepPicture(),
        };
      },
    }),
    mcq({
      id: 'circumference', difficulty: 2,
      prompt: t`Use the polar metric $ds^2 = dr^2 + r^2\,d\theta^2$ to find the length of the circle $r = 3$, going once around.`,
      choices: [t`$6\pi$`, t`$2\pi$`, t`$9$`, t`$9\pi$`],
      answer: 0,
      why: { 1: t`That adds up the angle steps $d\theta$ alone, as if they were distances. Each one is worth $r\,d\theta$.`, 2: t`Going around, $d\theta$ adds up to $2\pi$, not to $r^2$.`, 3: t`That uses $r^2\,d\theta$; the distance is $\sqrt{r^2\,d\theta^2} = r\,d\theta$.` },
      hints: [t`On the circle $r$ stays at 3, so $dr = 0$ and $ds = r\,d\theta$.`, t`Add up $3\,d\theta$ as $\theta$ goes from 0 to $2\pi$.`],
      teach: 'Summing ds = r dθ around a circle gives 2πr: the familiar circumference comes out of the metric.',
      explain: t`With $dr = 0$, $ds = 3\,d\theta$; around the circle $d\theta$ adds up to $2\pi$, so the length is $3\times2\pi = 6\pi \approx ${fmt(6 * Math.PI, 4)}$.`,
      visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', gridChoice: false, shape: 'circle', shapeChoice: false, centre: [0, 0], radius: 3, readout: false }, caption: t`The circle $r = 3$ on the plane, and in the chart — where it is the straight line $r = 3$ running across every $\theta$.` },
    }),
    num({
      id: 'sphere-circle', difficulty: 3,
      gen(r) {
        const rho = r.pick([100, 300, 500, 1000]);
        const shortKm = 2 * Math.PI * rho - sphereCircle(rho);
        return {
          prompt: t`On a round Earth of radius ${R_EARTH.toLocaleString('en-US')} km, the metric is $ds^2 = R^2\,d\theta^2 + R^2\sin^2\theta\,d\phi^2$. A circle is drawn ${rho.toLocaleString('en-US')} km (measured along the ground) from the North Pole. By how much is its circumference shorter than $2\pi\times${grp(rho)}$ km? Answer in metres.`,
          answer: shortKm * 1000, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: 'On a curved surface the circle is shorter than 2π × radius: that is how curvature shows up from the inside.' }],
          hints: [t`The circle sits at $\theta_0 = ${rho}/${R_EARTH}$ rad; its circumference is $2\pi R\sin\theta_0$.`, t`Keep plenty of digits — or use $x - \sin x \approx x^3/6$ for small $x$, so the shortfall is about $2\pi R\,\theta_0^3/6$.`],
          teach: 'On a sphere a circle of radius ρ has circumference 2πR sin(ρ/R), less than 2πρ — curvature measured without leaving the surface.',
          explain: t`$\theta_0 = ${fmt(rho / R_EARTH, 4)}$ rad; $2\pi R\sin\theta_0 = ${sphereCircle(rho).toFixed(4)}$ km against $2\pi\rho = ${(2 * Math.PI * rho).toFixed(4)}$ km: short by ${shortKm < 1 ? `${fmt(shortKm * 1000, 3)} m` : `${fmt(shortKm, 3)} km`}.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 50, transport: false, readout: false }, caption: 'Not to scale: a circle drawn around the pole of a sphere. Its radius is measured along the surface from the pole.' },
        };
      },
    }),
    num({
      id: 'clock-step', difficulty: 2,
      gen(r) {
        const [dt, dx, tau] = r.pick([[5, 3, 4], [10, 6, 8], [13, 5, 12], [5, 4, 3], [10, 8, 6]]);
        return {
          prompt: t`With $c = 1$ (years and light-years), the spacetime metric is $ds^2 = -dt^2 + dx^2 + dy^2 + dz^2$. A clock coasts ${dx} light-years in ${dt} years. What time does it record, $d\tau = \sqrt{-ds^2}$?`,
          answer: tau, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(dt * dt + dx * dx), feedback: 'The time term has a minus sign in the spacetime metric.' }, { value: dt, feedback: 'That is the coordinate time; the moving clock records less.' }],
          hints: [t`$ds^2 = -${dt}^2 + ${dx}^2 = ${-dt * dt + dx * dx}$ light-years².`, t`$d\tau = \sqrt{${dt * dt - dx * dx}}$.`],
          teach: 'The spacetime metric gives a clock’s time as well as a ruler’s distance: dτ = √(−ds²)/c.',
          explain: t`$ds^2 = ${-dt * dt + dx * dx}$, so $d\tau = \sqrt{${dt * dt - dx * dx}} = ${tau}$ years. The same metric, read for a ruler instead of a clock, gives distances.`,
          visual: spacetimeSketch({ events: [[0, 0, 'start'], [dt, dx, 'end']], segments: [[0, 0, dt, dx, 'gold']], range: Math.max(5, Math.ceil(Math.max(dt / 1.3, dx * 1.1))), caption: 'Gold: the clock’s worldline. Years up, light-years across.' }),
        };
      },
    }),
    num({
      id: 'skew', difficulty: 3,
      gen(r) {
        const [u, v, d] = r.pick([[3, 5, 7], [5, 3, 7], [7, 8, 13], [8, 7, 13]]);
        const [x, y] = fromSkew(u, v, 60 * DEG);
        return {
          prompt: t`A flat plane is labelled with skewed axes: $u$ along one direction and $v$ along another at 60° to it, both marked in metres. The metric is then $ds^2 = du^2 + dv^2 + 2\cos 60^\circ\,du\,dv$. How far is the point $(u, v) = (${u}, ${v})$ from the origin $(0, 0)$?`,
          answer: d, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: Math.hypot(u, v), feedback: 'Pythagoras is the rule for perpendicular axes. These axes are skewed, so the metric has the extra cross term 2 cos 60° du dv.' }, { value: u + v, feedback: 'Combine the steps with the metric, not by adding them.' }],
          hints: ['For a straight path from the origin the steps add up to du = u and dv = v, so the same formula holds for the whole path.', t`$ds^2 = ${u}^2 + ${v}^2 + 2\times\tfrac12\times${u}\times${v}$.`],
          teach: 'When the axes are not perpendicular, the metric gains a cross term: here 2 cos α du dv — the law of cosines.',
          explain: t`$ds^2 = ${u * u} + ${v * v} + ${u * v} = ${d * d}$, so the distance is ${d} m. This is the law of cosines; with perpendicular axes the cross term vanishes and Pythagoras returns.`,
          visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'skew', gridChoice: false, shape: 'segment', shapeChoice: false, ends: [[0, 0], [x, y]], range: Math.ceil(Math.max(x, y) + 1), readout: false }, caption: 'The segment from the origin to the point, on the skewed grid and in its chart, where the skewed grid lines become square.' },
        };
      },
    }),
    mcq({
      id: 'what-metric', difficulty: 2,
      prompt: 'In general relativity, what is the metric?',
      choices: [
        'The gravitational field itself: at every event it sets distances, clock rates and which way light can go',
        'A fixed table of numbers, the same everywhere in the universe',
        'A force that pulls objects toward masses',
        'A description of curved space only — time is not part of it',
      ],
      answer: 0,
      why: { 1: 'That is true only of flat spacetime in suitable coordinates. In general relativity the metric varies from place to place — that variation is gravity.', 2: 'There is no gravitational force in general relativity: free bodies follow the straightest paths the metric allows.', 3: 'The time part matters most: in weak gravity, nearly all of it is in how clock rates (the dt² term) change with position.' },
      hints: ['What would you need to know to compute a distance, a clock reading, or a light path near the Sun?'],
      teach: 'The metric is the gravitational field: a rule, varying from place to place, for turning coordinate steps into measured distances and times.',
      explain: 'Everything measurable comes from the metric: the length of a path, the time a clock records along a worldline, the light cones. Solving Einstein’s equations means finding the metric produced by the matter present.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-hover', difficulty: 3, transfer: true,
      gen(r) {
        const [label, x] = r.pick([['\\tfrac43\\,r_s', 4 / 3], ['2\\,r_s', 2], ['4\\,r_s', 4], ['\\tfrac{25}{9}\\,r_s', 25 / 9]]);
        const rate = Math.sqrt(1 - 1 / x);
        return {
          prompt: t`Outside a black hole, the part of the metric you need for a clock that stays at one place is $ds^2 = -\left(1 - \dfrac{r_s}{r}\right)c^2dt^2$, where $r_s$ is the horizon radius and $t$ is the time kept by clocks far away. A probe hovers, rockets firing, at $r = ${label}$. How many seconds does its clock record for each second that passes far away?`,
          answer: rate, tol: { rel: 0.005 },
          errors: [{ value: 1 - 1 / x, feedback: 'Take the square root: dτ = √(−ds²)/c = √(1 − r_s/r) dt.' }, { value: 1 / rate, feedback: 'Clocks low down run slow: the ratio dτ/dt is less than 1.' }],
          hints: [t`For a clock at rest only the $dt^2$ term survives, and $d\tau = \sqrt{-ds^2}/c$.`, t`$d\tau/dt = \sqrt{1 - r_s/r}$ with $r_s/r = ${nice(1 / x)}$.`],
          teach: 'Reading a metric: for a clock at rest, the coefficient of c²dt² sets its rate — here √(1 − r_s/r), slower near a black hole.',
          explain: t`$d\tau/dt = \sqrt{1 - ${nice(1 / x)}} = ${fmt(rate, 4)}$. The hovering clock runs slow compared with clocks far away; at the horizon the factor would reach zero. This metric (Schwarzschild’s) is the subject of step 20.`,
          visual: {
            type: 'graph',
            params: { x: [1, 6], y: [0, 1.1], xlabel: 'r / r_s', ylabel: 'clock rate dτ/dt', curves: [{ fn: 'sqrt(1 - 1/x)', color: 'accent', domain: [1, 6] }], hlines: [{ y: 1, label: 'far away', color: 'ink3' }], vlines: [{ x: 1, label: 'horizon', color: 'warn' }] },
            caption: t`How fast a clock held at rest at radius $r$ ticks, compared with clocks far away: $\sqrt{1 - r_s/r}$.`,
          },
        };
      },
    }),
    num({
      id: 'cp-east', difficulty: 2, transfer: true,
      gen(r) {
        const lat = r.pick([30, 40, 60, 75]);
        const d = R_EARTH * Math.cos(lat * DEG) * DEG;
        return {
          prompt: t`A ship sails due east along the ${lat}°N parallel, through 1° of longitude. On a round Earth of radius ${R_EARTH.toLocaleString('en-US')} km, how far does it travel? The metric is $ds^2 = R^2\,d\theta^2 + R^2\sin^2\theta\,d\phi^2$, with $\theta$ measured from the North Pole.`,
          answer: d, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: R_EARTH * DEG, feedback: 'That is the distance at the equator. Along a parallel the east–west step is multiplied by sin θ.' }, ...(Math.abs(lat - 45) > 5 ? [{ value: R_EARTH * Math.sin(lat * DEG) * DEG, feedback: 'θ is measured from the pole: at latitude λ, θ = 90° − λ, so sin θ = cos λ.' }] : [])],
          hints: [t`Sailing east, $d\theta = 0$ and $ds = R\sin\theta\,d\phi$, with $\theta = 90^\circ - ${lat}^\circ$.`, t`$d\phi = 1^\circ = ${fmt(DEG, 4)}$ rad.`],
          teach: 'The sphere’s metric shrinks east–west distances by sin θ: a degree of longitude covers less ground closer to the pole.',
          explain: t`$ds = R\sin(${90 - lat}^\circ)\,d\phi = ${R_EARTH}\times${fmt(Math.cos(lat * DEG), 4)}\times${fmt(DEG, 4)} = ${fmt(d, 3)}$ km, against ${fmt(R_EARTH * DEG, 4)} km at the equator.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat, transport: false, readout: false }, caption: t`The ${lat}°N parallel. Every circle of latitude is smaller than the equator by the factor $\sin\theta$.` },
        };
      },
    }),
    mcq({
      id: 'cp-coefficient', difficulty: 2,
      prompt: t`In the polar metric $ds^2 = dr^2 + r^2\,d\theta^2$ the number in front of $d\theta^2$ changes from place to place. What does that tell you about the plane?`,
      choices: [
        'Nothing about curvature: the same flat plane, labelled differently, can have changing numbers in its metric',
        'The plane is curved, more so far from the origin',
        'Distances on the plane grow with r',
        'Polar coordinates give wrong distances and should be avoided',
      ],
      answer: 0,
      why: { 1: 'The plane is flat: every triangle on it has angles adding to 180°. Changing numbers can come from the labels alone.', 2: 'The distance between two given points is the same in every coordinate system; only the coordinate step needed changes.', 3: 'Used with its own metric, polar coordinates give exactly the right distances — as the Explore readout shows.' },
      hints: ['Is a sheet of paper curved because you draw circles and rays on it?'],
      teach: 'A metric whose numbers vary need not mean curvature: curvature is what remains in every coordinate system, such as triangles whose angles do not add to 180°.',
      explain: 'The polar grid’s lines spread apart, so the rule for converting coordinate steps has to change from place to place — but the plane is the same flat plane. Real curvature, like the sphere’s, shows up in measurements no relabelling can undo: circles shorter than 2πρ, triangle angles adding to more than 180°.',
      visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', shape: 'circle', centre: [1.6, 0.8], radius: 1.5 }, caption: 'One flat plane: switch between the coordinate systems and compare the lengths.' },
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity: An Introduction to Einstein’s General Relativity, ch. 2 and 7', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Carroll, Lecture Notes on GR, §2.5 (the roles of the metric)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes (2nd ed.), ch. 1–3', url: 'https://www.eftaylor.com/exploringblackholes/' },
  ],
});
