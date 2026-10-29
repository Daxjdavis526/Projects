// Line elements in practice — Derivation Mode.
// The metric as a tensor: pulled back through the Jacobian (polar, sphere,
// skewed axes, a rotating frame), inverted to raise indices, its determinant
// giving areas; curvature detected from inside by a circle's circumference
// (the Bertrand–Diguet–Puiseux test); and the Schwarzschild line element
// integrated for radial ruler distances and set to zero for the light cone.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { fmt, sig } from '../../src/core/format.js';
import { C, GM_SUN, R_SUN, AU, sci, round, grp } from './_deriv.js';

const t = String.raw;

const RE = 6371;                                    // km, Earth's mean radius
const DEG = Math.PI / 180;
const RS_SUN = (2 * GM_SUN) / C / C;                // m, the Sun's Schwarzschild radius
const rsKm = (m) => (m * RS_SUN) / 1e3;
// ∫₁^X dx/√(1 − 1/x): ruler distance from the horizon to r = X r_s, in units of r_s
const D_HOR = (X) => Math.sqrt(X * (X - 1)) + Math.log(Math.sqrt(X) + Math.sqrt(X - 1));
// ∫₁^X √(1 − 1/x) dx: the same with the factor upside down (a slip)
const W_HOR = (X) => Math.sqrt(X * (X - 1)) - Math.log(Math.sqrt(X) + Math.sqrt(X - 1));
const circDeficit = (rho, R) => 2 * Math.PI * rho - 2 * Math.PI * R * Math.sin(rho / R);
const DEF100 = circDeficit(100, RE) * 1e3;          // m, for a 100 km circle on Earth
const capLat = (rho, R) => Math.min(85, Math.round(90 - (rho / R) / DEG));
const toScale = (rho, R) => 90 - (rho / R) / DEG <= 85.5;

// the radial integrand of the Schwarzschild metric, its area shaded from the horizon to X
function horizonGraph(X, extra = {}, caption) {
  return {
    type: 'graph',
    params: {
      x: [0, 10.6], y: [0, 3.3], xlabel: 'r / rₛ', ylabel: 'dℓ / dr',
      curves: [
        { fn: '1/sqrt(1 - 1/x)', domain: [1.003, 10.6], color: 'accent', width: 2.6, label: '1/√(1 − rₛ/r)', labelAt: 5.5, labelDy: -16 },
        { fn: '1', domain: [0, 10.6], color: 'teal', dash: true, width: 1.4, label: 'flat space', labelAt: 8.4, labelDy: 16 },
      ],
      vlines: [{ x: 1, color: 'warn', label: 'horizon' }],
      shade: [
        { fn: '1', from: 1, to: X, color: 'teal', alpha: 0.22 },
        { fn: '1/sqrt(1 - 1/x)', lower: '1', from: 1.0001, to: X, color: 'gold', alpha: 0.32 },
      ],
      ...extra,
    },
    caption: caption ?? t`The integrand of the radial ruler distance, $1/\sqrt{1 - r_s/r}$, against $r/r_s$. The distance from the horizon is the whole shaded area: teal is the coordinate difference $\Delta r$, gold the extra length the metric adds.`,
  };
}

// light cones in Schwarzschild coordinates (units of r_s, ct up): from each dot the
// outgoing and ingoing radial light rays, ct = ±r* + const with r* = r + ln(r − 1),
// followed for the same coordinate time H
function lightCones() {
  const rstar = (r) => r + Math.log(r - 1);
  const solve = (target, lo, hi) => { for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (rstar(m) < target) lo = m; else hi = m; } return (lo + hi) / 2; };
  const H = 1.2, curves = [], points = [];
  for (const [r0, t0] of [[1.15, 0.4], [1.5, 2], [2.5, 0.4], [4, 2], [6.5, 0.4]]) {
    const s0 = rstar(r0);
    const rOut = round(solve(s0 + H, r0, r0 + 2 * H), 5), rIn = round(solve(s0 - H, 1 + 1e-12, r0), 5);
    curves.push({ param: ['t', `${round(t0 - s0, 6)} + t + ln(t - 1)`], t: [r0, rOut], color: 'gold', width: 2 });
    curves.push({ param: ['t', `${round(t0 + s0, 6)} - t - ln(t - 1)`], t: [rIn, r0], color: 'gold', width: 2 });
    curves.push({ param: ['t', `${round(t0 + H, 6)}`], t: [rIn, rOut], color: 'gold', width: 1, dash: true });
    points.push({ x: r0, y: t0, color: 'ink', r: 3 });
  }
  return {
    type: 'graph',
    params: {
      x: [0, 8.6], y: [0, 3.6], equal: true, xlabel: 'r / rₛ', ylabel: 'ct / rₛ',
      curves, points,
      vlines: [{ x: 1, color: 'warn', label: 'horizon' }],
    },
    caption: t`Light cones in Schwarzschild coordinates ($ct$ up, $r$ across, both in units of $r_s$): from each dot, the outgoing and ingoing light rays, followed for the same coordinate time. Far out they open to $45^\circ$; toward the horizon they close up, and the ingoing ray never reaches $r_s$ — in these coordinates. A local observer still measures $c$.`,
  };
}

// Flamm's paraboloid: the equatorial plane at one instant, embedded (r_s = 0.5 in picture units)
const flamm = {
  type: 'surface3d',
  params: {
    surface: ['u*cos(v)', 'u*sin(v)', 'sqrt(2*u - 1)'], domain: [[0.5, 2.6], [0, 6.2832]], n: 36, axes: false, pitch: 0.42, dist: 9, scale: 1.6, target: [0, 0, 1.1],
    curves: [
      { param: ['1.5*cos(t)', '1.5*sin(t)', '1.4142'], t: [0, 6.2832], color: 'gold' },
      { param: ['0.8253*t', '-0.5646*t', 'sqrt(2*t - 1)'], t: [0.5, 1.5], color: 'violet' },
    ],
  },
  caption: t`Flamm’s paraboloid: the geometry of a black hole’s equatorial plane at one instant ($t$ = const). Distances measured along the surface are the true ones; the vertical direction is fictitious and time is not shown. Gold: the circle $r = 3r_s$, of circumference $2\pi r$. Violet: the radial path to it from the horizon — longer than $\Delta r = 2r_s$.`,
};

export default lesson({
  id: 'gr.S08.d',
  title: 'Line elements in practice: from polar coordinates to curved spacetime',
  minutes: 16,
  difficulty: 3,
  mode: 'derivation',
  badges: ['est-der'],
  intro: t`Step 7’s rule — one Jacobian factor per index — applies to the metric too. Because $ds^2$ is a number every chart must agree on, substituting $dx^\alpha = (\partial x^\alpha/\partial x'^\mu)\,dx'^\mu$ into $ds^2 = g_{\alpha\beta}\,dx^\alpha dx^\beta$ gives the components in the new chart; that is how the polar, spherical and rotating metrics below are derived. The **inverse metric** $g^{\mu\nu}$, defined by $g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu{}_\nu$, raises indices, and $\sqrt{|g|}$, the square root of the determinant’s size, is the area or volume of a unit coordinate cell. From a metric alone you can then compute lengths and areas, test for curvature by comparing a circle’s circumference with its radius, and — with the Schwarzschild line element — find how far a hovering probe is from a black hole’s horizon.`,
  equation: t`ds^2 = g_{\mu\nu}\,dx^\mu dx^\nu, \qquad g'_{\mu\nu} = \frac{\partial x^\alpha}{\partial x'^\mu}\frac{\partial x^\beta}{\partial x'^\nu}\,g_{\alpha\beta}`,
  symbols: [
    { tex: 'g_{\\mu\\nu}', text: t`the metric components: symmetric in $\mu\nu$, each a function of position — ten independent ones in four dimensions` },
    { tex: 'dx^\\mu', text: 'the coordinate differences of a small step' },
    { tex: 'ds^2', text: 'the squared length (or interval) of that step — the same number in every chart' },
    { tex: 'g^{\\mu\\nu}', text: t`the inverse metric, $g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu{}_\nu$: it turns a lower index into an upper one` },
    { tex: '\\sqrt{|g|}', text: t`the square root of $|\det g_{\mu\nu}|$: area (or volume) per unit coordinate cell — $r$ for polar coordinates` },
    { tex: 'r_s = 2GM/c^2', text: t`the Schwarzschild radius, where a black hole’s horizon is: ${fmt(RS_SUN / 1e3, 3)} km for the Sun’s mass` },
  ],
  why: t`Every prediction of general relativity — a clock’s reading, a ruler’s length, whether a signal can arrive at all — comes from integrating a line element. Because $g_{\mu\nu}$ transforms with the Jacobian, those answers do not depend on the coordinates chosen, and the metric itself can become the unknown that Einstein’s equations solve for.`,
  visual: {
    ...horizonGraph('X', {
      sliders: [{ key: 'X', label: t`Probe position $r/r_s$`, min: 1.1, max: 10, step: 0.1, value: 3, explain: t`The probe hovers at $r = X r_s$; the shaded area is its ruler distance from the horizon.` }],
      readouts: [
        { label: t`ruler distance from the horizon ($r_s$)`, expr: 'sqrt(X*(X - 1)) + ln(sqrt(X) + sqrt(X - 1))', digits: 4 },
        { label: t`coordinate difference $\Delta r$ ($r_s$)`, expr: 'X - 1', digits: 4 },
        { label: 'extra (gold area)', expr: 'sqrt(X*(X - 1)) + ln(sqrt(X) + sqrt(X - 1)) - X + 1', digits: 4 },
      ],
    }),
    title: 'How far is the horizon?',
    lead: t`Along a radial line at one instant ($dt = d\theta = d\phi = 0$) the Schwarzschild line element reduces to $d\ell = dr/\sqrt{1 - r_s/r}$. The ruler distance from the horizon to a hovering probe is the area under that integrand.`,
    tasks: [
      t`At $r = 3r_s$ the probe is $2r_s$ out in $r$ but $${fmt(D_HOR(3), 3)}\,r_s$ out by ruler.`,
      t`Slide toward the horizon: the integrand blows up at $r = r_s$, yet the area stays finite — at $r = 1.2\,r_s$ the probe is $${fmt(D_HOR(1.2), 2)}\,r_s$ from the horizon, not $0.2\,r_s$.`,
      t`Slide out to $10\,r_s$: far away the integrand is about $1 + r_s/2r$, so the gold extra grows only like $\tfrac12 r_s\ln r$.`,
    ],
  },
  example: {
    prompt: t`Derive the metric of a sphere of radius $R$ from flat space. Then find the circumference of a circle of radius $\rho$ — measured along the surface — and show how someone confined to the surface can tell it is curved. Put in numbers for a circle of radius 100 km on Earth ($R = ${grp(RE)}$ km).`,
    visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 50, transport: false, measure: true }, caption: t`A circle around the pole of a sphere (not to scale). Its radius $\rho$ is measured along the surface from the pole; the readout compares its circumference with $2\pi\rho$.` },
    steps: [
      { label: 'Embed', text: t`Points of the sphere in flat space: $x = R\sin\theta\cos\phi$, $y = R\sin\theta\sin\phi$, $z = R\cos\theta$, with $\theta$ the angle from the pole and $\phi$ the longitude.` },
      { label: 'Pull back the flat metric', text: t`Substitute $dx = R\cos\theta\cos\phi\,d\theta - R\sin\theta\sin\phi\,d\phi$, and likewise $dy$ and $dz$, into $dx^2 + dy^2 + dz^2$. This is $g'_{\mu\nu} = \dfrac{\partial x^\alpha}{\partial x'^\mu}\dfrac{\partial x^\beta}{\partial x'^\nu}\delta_{\alpha\beta}$: each new component is a dot product of two basis vectors, $\partial\vec x/\partial\theta$ and $\partial\vec x/\partial\phi$.` },
      { label: 'The result', text: t`The cross terms cancel (the two basis vectors are perpendicular) and $ds^2 = R^2\,d\theta^2 + R^2\sin^2\theta\,d\phi^2$: $g_{\theta\theta} = R^2$, $g_{\phi\phi} = R^2\sin^2\theta$, $g_{\theta\phi} = 0$. From here on the space around the sphere is never used.` },
      { label: 'Radius and circumference', text: t`The circle $\theta = \theta_0$. Its radius along a meridian ($d\phi = 0$) is $\rho = \int_0^{\theta_0} R\,d\theta = R\theta_0$; its length ($d\theta = 0$) is $C = \int_0^{2\pi} R\sin\theta_0\,d\phi = 2\pi R\sin(\rho/R)$.` },
      { label: 'The deficit', text: t`With $\sin u \approx u - u^3/6$: $C \approx 2\pi\rho - \dfrac{\pi\rho^3}{3R^2}$. For $\rho = 100$ km on Earth the circle is ${fmt(DEF100, 3)} m shorter than $2\pi\rho$ — measurable with tape measures, without leaving the ground.` },
      { label: 'Curvature from inside', text: t`Gauss’s curvature is $K = \lim_{\rho\to0}\dfrac{3}{\pi}\,\dfrac{2\pi\rho - C}{\rho^3} = \dfrac{1}{R^2}$, here $${sci(1 / (RE * 1e3) ** 2)}\ \text{m}^{-2}$. The polar metric of the plane also has position-dependent components, but its circles have $C = 2\pi r$ exactly: $K = 0$.` },
    ],
    answer: t`$ds^2 = R^2\,d\theta^2 + R^2\sin^2\theta\,d\phi^2$; $C = 2\pi R\sin(\rho/R)$, ${fmt(DEF100, 3)} m short of $2\pi\rho$ for $\rho = 100$ km on Earth; $K = 1/R^2$.`,
  },
  practice: [
    order({
      id: 'pullback-polar', difficulty: 2,
      prompt: t`Put the steps of deriving the polar metric from $ds^2 = dx^2 + dy^2$ in order.`,
      items: [
        t`Write the old coordinates as functions of the new: $x = r\cos\theta$, $y = r\sin\theta$.`,
        t`Differentiate (the Jacobian): $dx = \cos\theta\,dr - r\sin\theta\,d\theta$, $dy = \sin\theta\,dr + r\cos\theta\,d\theta$.`,
        t`Substitute into $dx^2 + dy^2$ and expand the squares.`,
        t`The $dr\,d\theta$ terms, $\mp 2r\sin\theta\cos\theta\,dr\,d\theta$, cancel, and $\cos^2\theta + \sin^2\theta = 1$.`,
        t`Read off $g_{rr} = 1$, $g_{\theta\theta} = r^2$, $g_{r\theta} = 0$.`,
      ],
      hints: ['The new metric needs the old differentials written in terms of the new ones.', 'Simplify only after everything has been substituted.'],
      teach: t`A metric transforms with one Jacobian factor per index: substitute the old differentials and collect the terms.`,
      explain: t`$ds^2 = dr^2 + r^2\,d\theta^2$ is the same flat plane in new labels. In the matrix form $g' = J^{\mathsf T} g\,J$ with $J = \partial(x, y)/\partial(r, \theta)$, the zero off-diagonal entry says the polar grid lines cross at right angles, and $g_{\theta\theta} = r^2$ says a radian of $\theta$ is $r$ metres of arc.`,
      visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', gridChoice: false, shape: 'none', shapeChoice: false, step: { r: 3, theta: 30, dr: 0.8, dtheta: 15 }, readout: false }, caption: t`The polar line element: a step $dr$ outward and $d\theta$ around makes a small, nearly right-angled triangle with legs $dr$ and $r\,d\theta$.` },
    }),
    num({
      id: 'raise-gradient', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, 4, 6]), rr = r.pick([2, 3, 4]);
        const ans = k / (rr * rr);
        const px = round(rr * Math.cos(30 * DEG), 4), py = round(rr * Math.sin(30 * DEG), 4);
        const curves = [1, 2, 3, 4].map((q) => ({ param: [`${q}*cos(t)`, `${q}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1 }));
        for (let j = 0; j < 12; j++) curves.push({ param: [`${round(Math.cos(j * 30 * DEG), 4)}*t`, `${round(Math.sin(j * 30 * DEG), 4)}*t`], t: [0, 4.6], color: 'teal', width: 1.3 });
        return {
          prompt: t`On a flat plane in polar coordinates, $f = ${k}\theta$. Its gradient has lower-index components $\partial_\mu f = (\partial_r f, \partial_\theta f) = (0, ${k})$. Raise the index with the inverse metric, $(\nabla f)^\mu = g^{\mu\nu}\,\partial_\nu f$: what is $(\nabla f)^\theta$ at $r = ${rr}$ m? (Give the number, with $r$ in metres.)`,
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: k * rr * rr, feedback: t`That multiplied by $g_{\theta\theta} = r^2$. Raising an index uses the inverse metric, $g^{\theta\theta} = 1/r^2$.` },
            { value: k, feedback: t`That is $\partial_\theta f$, the lower-index component. The vector $(\nabla f)^\mu$ needs $g^{\mu\nu}$ applied to it.` },
            { value: k / rr, feedback: t`That is the size of $\nabla f$ in units of $f$ per metre — its component along the unit vector $\hat\theta$. The coordinate component $(\nabla f)^\theta$ is per radian: divide by $r$ once more.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`For the polar metric $g_{\mu\nu} = \mathrm{diag}(1, r^2)$, so $g^{\mu\nu} = \mathrm{diag}(1, 1/r^2)$.`, t`$(\nabla f)^\theta = g^{\theta\theta}\,\partial_\theta f = ${k}/r^2$.`],
          teach: t`Raise an index with the inverse metric $g^{\mu\nu}$, never with $g_{\mu\nu}$ itself.`,
          explain: t`$(\nabla f)^\theta = ${k}/${rr}^2 = ${fmt(ans, 3)}$. Its length is $\sqrt{g_{\theta\theta}}\,|(\nabla f)^\theta| = r\times${fmt(ans, 3)} = ${fmt(k / rr, 3)}$ per metre, as it must be: the rays of $f$ spread out, so $f$ changes more slowly per metre farther from the origin. Contracting back, $\partial_\mu f\,(\nabla f)^\mu = ${k}\times${fmt(ans, 3)} = ${fmt(k * ans, 3)} = |\nabla f|^2$ ✓.`,
          visual: {
            type: 'graph',
            params: {
              x: [-4.6, 4.6], y: [-3.3, 3.3], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves,
              points: [{ x: px, y: py, color: 'ink', r: 4, label: 'P', labelDx: 8, labelDy: 14 }],
              arrows: [{ from: [px, py], to: [round(px - 0.5, 4), round(py + Math.sqrt(3) / 2, 4)], color: 'gold', label: '∇f' }],
            },
            caption: t`Level lines of $f = ${k}\theta$ (teal rays, every $30^\circ$) over the polar circles, and the direction of $\nabla f$ at P (gold): around the circle, across the rays. Farther out the rays are farther apart.`,
          },
        };
      },
    }),
    expr({
      id: 'skew-inverse', difficulty: 3,
      prompt: t`A flat plane is labelled with skewed axes at angle $\alpha$: $ds^2 = du^2 + 2\cos\alpha\,du\,dv + dv^2$, so $g_{uu} = g_{vv} = 1$ and $g_{uv} = g_{vu} = \cos\alpha$. Find the inverse-metric component $g^{uv}$, defined by $g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu{}_\nu$.`,
      answer: '-cos(alpha)/sin(alpha)^2', answerTeX: t`-\dfrac{\cos\alpha}{\sin^2\alpha}`,
      lhs: 'g^{uv}',
      vars: { alpha: [0.4, 1.4] },
      errors: [
        { answer: '1/cos(alpha)', feedback: t`That inverts one entry. $g^{\mu\nu}$ is the inverse *matrix*; entry by entry works only when the metric is diagonal.` },
        { answer: '-cos(alpha)', feedback: t`Right pattern, but divide by the determinant, $1 - \cos^2\alpha = \sin^2\alpha$.` },
        { answer: 'cos(alpha)/sin(alpha)^2', feedback: t`Check the sign: the inverse of $\begin{pmatrix} a & b\\ b & d\end{pmatrix}$ has $-b$ off the diagonal.` },
      ],
      hints: [t`The inverse of $\begin{pmatrix} a & b\\ b & d\end{pmatrix}$ is $\dfrac{1}{ad - b^2}\begin{pmatrix} d & -b\\ -b & a\end{pmatrix}$.`, t`Here $ad - b^2 = 1 - \cos^2\alpha = \sin^2\alpha$.`],
      teach: t`The inverse metric is the inverse matrix of $g_{\mu\nu}$, not the reciprocal of each component; the two agree only for a diagonal metric.`,
      explain: t`$g^{\mu\nu} = \dfrac{1}{\sin^2\alpha}\begin{pmatrix} 1 & -\cos\alpha\\ -\cos\alpha & 1\end{pmatrix}$, so $g^{uv} = -\cos\alpha/\sin^2\alpha$ and $g^{uu} = 1/\sin^2\alpha$. Check: $g^{u\lambda}g_{\lambda u} = (1 - \cos^2\alpha)/\sin^2\alpha = 1$. At $\alpha = 90^\circ$ the axes are perpendicular and both matrices are the identity. On skewed axes even a flat plane has $V_u = g_{u\nu}V^\nu = V^u + \cos\alpha\,V^v \neq V^u$: upper and lower components differ whenever the metric is not the identity.`,
      visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'skew', skew: 60, gridChoice: false, shape: 'segment', shapeChoice: false, ends: [[0, 0], [2, 1.5]], range: 4, readout: false }, caption: t`Skewed axes at $\alpha = 60^\circ$ on a flat plane. A segment’s length needs the cross term $2\cos\alpha\,du\,dv$: the metric is not diagonal, so its inverse is not $1/g_{\mu\nu}$ entry by entry.` },
    }),
    num({
      id: 'cap-area', difficulty: 3,
      gen(r) {
        const rho = r.pick([500, 1000, 2000]);
        const A = 2 * Math.PI * RE * RE * (1 - Math.cos(rho / RE));
        const flat = Math.PI * rho * rho, def = flat - A;
        return {
          prompt: t`Use the sphere’s area element $\sqrt{|g|}\,d\theta\,d\phi = R^2\sin\theta\,d\theta\,d\phi$ to find the area of the region within $\rho = ${grp(rho)}$ km of the North Pole (measured along the ground), with $R = ${grp(RE)}$ km. By how many square kilometres does it fall short of the flat-map value $\pi\rho^2$?`,
          answer: def, units: 'km^2', tol: { rel: 0.01 },
          integrand: `2*pi*(x - ${RE}*sin(x/${RE}))`, limits: [0, rho],
          errors: [
            { value: A, feedback: t`That is the area itself; the question asks how much smaller it is than $\pi\rho^2$.` },
            { value: circDeficit(rho, RE), feedback: 'That is the shortfall of the boundary circle’s circumference (in km), not of the area.' },
          ],
          hints: [t`$\sqrt{|g|} = \sqrt{R^2\cdot R^2\sin^2\theta} = R^2\sin\theta$. Integrate $\phi$ from 0 to $2\pi$ and $\theta$ from 0 to $\rho/R$.`, t`$A = 2\pi R^2\left(1 - \cos\dfrac{\rho}{R}\right)$; work in radians and keep plenty of digits, since $A$ and $\pi\rho^2$ are close.`],
          teach: t`The area element is $\sqrt{|g|}$ times the coordinate cell; on a sphere it is $R^2\sin\theta\,d\theta\,d\phi$.`,
          explain: t`$A = 2\pi R^2(1 - \cos(\rho/R)) = ${grp(Math.round(A))}$ km², against $\pi\rho^2 = ${grp(Math.round(flat))}$ km²: short by $${grp(Math.round(def))}$ km², close to the leading term $\pi\rho^4/(12R^2)$ and ${fmt((100 * def) / flat, 2)} % of the whole. Like the circumference, the area falls short because the surface curves back on itself.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: capLat(rho, RE), transport: false, readout: false }, caption: toScale(rho, RE) ? t`The region within $${grp(rho)}$ km of the pole, to scale on a globe of radius $${grp(RE)}$ km.` : t`The region within $${grp(rho)}$ km of the pole on a globe of radius $${grp(RE)}$ km (enlarged to be visible).` },
        };
      },
    }),
    num({
      id: 'horizon-distance', difficulty: 3,
      gen(r) {
        const m = r.pick([5, 10, 20]), k = r.pick([2, 3, 10]);
        const rs = round(rsKm(m), 6), ans = rs * D_HOR(k);
        return {
          prompt: t`Outside a black hole of ${m} solar masses ($r_s = 2GM/c^2 = ${fmt(rs, 4)}$ km), the Schwarzschild metric along a radial line at one instant ($dt = d\theta = d\phi = 0$) gives $d\ell = dr/\sqrt{1 - r_s/r}$. A probe hovers at $r = ${k}\,r_s$. How far is it from the horizon, measured by rulers laid along that line, in km?`,
          answer: ans, units: 'km', tol: { rel: 0.005 },
          integrand: `${rs}/sqrt(1 - 1/x)`, limits: [1, k],
          errors: [
            { value: (k - 1) * rs, feedback: t`That is the coordinate difference $\Delta r$. Every $dr$ near the horizon is stretched by $1/\sqrt{1 - r_s/r}$.` },
            { value: rs * W_HOR(k), feedback: t`That used $\sqrt{1 - r_s/r}$ — the factor for clocks, from $g_{tt}$. Radial lengths take $\sqrt{g_{rr}} = 1/\sqrt{1 - r_s/r}$.` },
            { value: k * rs, feedback: t`That is the coordinate $r$ itself. It is defined by area ($4\pi r^2$ for the sphere through the probe), not by distance to anything.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Substitute $x = r/r_s$: the distance is $r_s\int_1^{${k}}\dfrac{dx}{\sqrt{1 - 1/x}}$.`, t`The antiderivative is $\sqrt{x(x-1)} + \ln\!\left(\sqrt x + \sqrt{x-1}\right)$; at $x = 1$ it is 0.`],
          teach: t`Proper lengths come from $\sqrt{g_{rr}}\,dr$, integrated: in Schwarzschild the radial ruler distance exceeds $\Delta r$.`,
          explain: t`$r_s\left[\sqrt{x(x-1)} + \ln(\sqrt x + \sqrt{x-1})\right]_1^{${k}} = ${fmt(D_HOR(k), 4)}\,r_s = ${fmt(ans, 4)}$ km, against $\Delta r = ${fmt((k - 1) * rs, 4)}$ km. The integrand is infinite at the horizon but the area is finite: on a $t$ = const slice the horizon is a finite ruler distance away.`,
          visual: horizonGraph(k, {}, t`The integrand $1/\sqrt{1 - r_s/r}$ against $r/r_s$, shaded from the horizon to the probe at $${k}\,r_s$: teal is $\Delta r$, gold the extra length the metric adds.`),
        };
      },
    }),
    expr({
      id: 'closed-form', difficulty: 4,
      prompt: t`Do the radial integral in closed form. With $x = r/r_s > 1$, find an antiderivative of $\dfrac{1}{\sqrt{1 - 1/x}} = \sqrt{\dfrac{x}{x - 1}}$. (Substitute $x = \cosh^2 u$.)`,
      answer: 'sqrt(x*(x - 1)) + ln(sqrt(x) + sqrt(x - 1))', answerTeX: t`\sqrt{x(x-1)} + \ln\!\left(\sqrt{x} + \sqrt{x-1}\right)`,
      lhs: t`\int\sqrt{\frac{x}{x-1}}\,dx`,
      mode: 'constant',
      vars: { x: [1.2, 6] },
      integrand: 'sqrt(x/(x - 1))',
      errors: [
        { answer: 'sqrt(x*(x - 1))', feedback: t`Its derivative is $\dfrac{2x - 1}{2\sqrt{x(x-1)}}$, not the integrand: the $u$ term, $u = \ln(\sqrt x + \sqrt{x-1})$, is missing.` },
        { answer: 'ln(sqrt(x) + sqrt(x - 1))', feedback: t`That is only the $u$ term; $\sinh u\cosh u = \sqrt{x(x-1)}$ belongs too.` },
      ],
      hints: [t`With $x = \cosh^2 u$: $dx = 2\cosh u\sinh u\,du$ and $\sqrt{x/(x-1)} = \cosh u/\sinh u$, so the integrand becomes $2\cosh^2 u\,du = (1 + \cosh 2u)\,du$.`, t`That integrates to $u + \sinh u\cosh u$. Back-substitute: $\sinh u\cosh u = \sqrt{x(x-1)}$ and $u = \operatorname{arcosh}\sqrt x = \ln(\sqrt x + \sqrt{x-1})$.`],
      teach: t`A hyperbolic substitution, $x = \cosh^2 u$, turns $\sqrt{x/(x-1)}$ into $2\cosh^2 u$, which integrates at sight.`,
      explain: t`$\displaystyle\int\sqrt{\frac{x}{x-1}}\,dx = \sqrt{x(x-1)} + \ln\!\left(\sqrt x + \sqrt{x-1}\right) + C$. It vanishes at $x = 1$, so it *is* the ruler distance from the horizon in units of $r_s$: ${fmt(D_HOR(2), 4)}, ${fmt(D_HOR(3), 4)} and ${fmt(D_HOR(10), 4)} at $2r_s$, $3r_s$ and $10r_s$. For large $x$ it grows like $x + \tfrac12\ln x$: one $r_s$ of extra length per factor $e^2$ in $r$.`,
      visual: horizonGraph(4, {}, t`The integrand $\sqrt{x/(x-1)}$, shaded from the horizon to $x = 4$. Your antiderivative, evaluated from 1 to 4, must give that whole area.`),
    }),
    expr({
      id: 'light-cone', difficulty: 3,
      prompt: t`Light moving radially outward in the Schwarzschild geometry has $ds^2 = 0$ and $d\theta = d\phi = 0$: $\;0 = -\left(1 - \dfrac{r_s}{r}\right)c^2\,dt^2 + \dfrac{dr^2}{1 - r_s/r}$. Solve for its coordinate speed $dr/dt$.`,
      answer: 'c*(1 - r_s/r)', answerTeX: t`c\left(1 - \dfrac{r_s}{r}\right)`,
      lhs: t`\dfrac{dr}{dt}`,
      vars: { c: [1, 3], r_s: [0.5, 1], r: [1.5, 5] },
      errors: [
        { answer: 'c', feedback: t`$c$ is what an observer measures locally, with her own rulers and clock. $dr/dt$ uses the far-away time $t$ and the coordinate $r$, both scaled by the metric.` },
        { answer: 'c*sqrt(1 - r_s/r)', feedback: t`That keeps only one factor. $g_{tt}$ and $g_{rr}$ each carry one: $dr^2 = (1 - r_s/r)^2c^2\,dt^2$.` },
        { answer: 'c/(1 - r_s/r)', feedback: t`Upside down: toward the horizon the coordinate speed of light falls toward zero; it does not grow.` },
      ],
      hints: [t`Move the time term across: $\dfrac{dr^2}{1 - r_s/r} = \left(1 - \dfrac{r_s}{r}\right)c^2\,dt^2$.`, t`Multiply both sides by $1 - r_s/r$ and take the positive square root.`],
      teach: t`Light has $ds^2 = 0$: setting the line element to zero gives the light cone, here $dr/dt = \pm c\,(1 - r_s/r)$.`,
      explain: t`$dr^2 = (1 - r_s/r)^2c^2\,dt^2$, so $dr/dt = \pm c\,(1 - r_s/r)$: $c$ far away, half of $c$ at $r = 2r_s$, zero at the horizon. That says the coordinates $t$ and $r$ go bad at $r_s$, not that light stops: an observer hovering anywhere outside measures $c$ with her own instruments, and coordinates that stay regular across the horizon come in step 22.`,
      visual: lightCones(),
    }),
    mcq({
      id: 'r-meaning', difficulty: 2,
      prompt: t`In the Schwarzschild line element the angular part is $r^2(d\theta^2 + \sin^2\theta\,d\phi^2)$. What, operationally, is the coordinate $r$?`,
      choices: [
        t`The circumference of the sphere through the point, divided by $2\pi$ (so the sphere’s area is $4\pi r^2$)`,
        'The distance from the centre, measured with rulers',
        'The distance from the horizon, measured with rulers',
        'The radius a distant astronomer would measure from the angle the sphere fills on the sky',
      ],
      answer: 0,
      why: {
        1: t`Rulers measure $\int dr/\sqrt{1 - r_s/r}$, which is longer than $\Delta r$ — and inside the horizon $r$ is not even a direction in space. $r$ is fixed by the angular part of the metric.`,
        2: t`That is the ruler distance from $g_{rr}$, a different number: $${fmt(D_HOR(3), 3)}\,r_s$ at $r = 3r_s$, not $2r_s$.`,
        3: t`Light bends on its way out, so apparent sizes are magnified: a black hole’s shadow has radius $\tfrac{3\sqrt3}{2}r_s \approx 2.6\,r_s$, not $r_s$.`,
      },
      hints: [t`Which term of the metric contains $r$ without a $dr$?`, t`On a sphere of fixed $r$, $ds^2 = r^2(d\theta^2 + \sin^2\theta\,d\phi^2)$ — the metric of an ordinary sphere of radius $r$.`],
      teach: t`A coordinate means what the metric says it means: in Schwarzschild, $r$ is the areal radius, fixed by $g_{\theta\theta} = r^2$.`,
      explain: t`With $dt = dr = 0$ the line element is that of an ordinary sphere of radius $r$: circumference $2\pi r$, area $4\pi r^2$. That is the operational meaning of $r$ — lay a tape around the sphere and divide by $2\pi$. Radial distances need $g_{rr}$ and come out longer, which Flamm’s paraboloid draws as the slope of the funnel.`,
      visual: flamm,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-planet', difficulty: 3, transfer: true,
      gen(r) {
        const [name, R] = r.pick([['the Moon', 1737.4], ['Mars', 3389.5], ['Titan', 2574.7], ['Ganymede', 2634.1], ['Europa', 1560.8]]);
        const rho = r.pick([100, 200, 300]);
        const Dm = sig(1e3 * circDeficit(rho, R), 3);                // metres, as reported
        const est = Math.sqrt((Math.PI * rho ** 3) / (3 * (Dm / 1e3)));
        return {
          prompt: t`Surveyors on ${name} pace out a circle of radius $\rho = ${rho}$ km along the ground and find that its circumference is $${grp(Dm)}$ m short of $2\pi\rho$. Using $2\pi\rho - C \approx \dfrac{\pi\rho^3}{3R^2}$, what is the radius $R$ of ${name}, in km?`,
          answer: est, units: 'km', tol: { rel: 0.01 },
          errors: [
            { value: est / Math.sqrt(1e3), feedback: 'Put the shortfall and the radius in the same unit: the shortfall is in metres, ρ in kilometres.' },
            { value: Math.sqrt(rho ** 3 / (Dm / 1e3)), feedback: t`Keep the factor $\pi/3$: $R^2 = \pi\rho^3/(3\,\Delta C)$.` },
          ].filter((e) => Math.abs(e.value - est) > 0.015 * est),
          hints: [t`Solve for $R$: $R = \sqrt{\pi\rho^3/(3\,\Delta C)}$.`, t`Convert the shortfall to km first: $\Delta C = ${Dm / 1e3}$ km.`],
          teach: t`Curvature is measurable from inside: a circle of radius $\rho$ falls short of $2\pi\rho$ by $\pi K\rho^3/3$, with $K = 1/R^2$ on a sphere.`,
          explain: t`$R = \sqrt{\pi\times${rho}^3/(3\times${Dm / 1e3})} = ${fmt(est, 4)}$ km; the measured radius of ${name} is $${grp(R)}$ km. The surveyors never left the ground: they found the size of their world, as the 2D metric $R^2(d\theta^2 + \sin^2\theta\,d\phi^2)$ predicts, from lengths alone.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: capLat(rho, R), transport: false, readout: false }, caption: toScale(rho, R) ? t`A circle of radius ${rho} km paced out around a point on a globe the size of ${name}, to scale.` : t`A circle of radius ${rho} km paced out around a point on a globe the size of ${name} (enlarged to be visible).` },
        };
      },
    }),
    num({
      id: 'cp-sun', difficulty: 4, transfer: true,
      prompt: t`Outside the Sun the metric is Schwarzschild’s with $r_s = 2GM_\odot/c^2 = ${fmt(RS_SUN / 1e3, 4)}$ km. Expanding $1/\sqrt{1 - r_s/r} \approx 1 + r_s/2r$, how much longer than $\Delta r$ is the radial ruler distance from the Sun’s surface ($r = ${grp(R_SUN / 1e3)}$ km) to Earth’s orbit ($r = 1$ AU $= ${grp(AU / 1e3)}$ km)? Answer in km.`,
      answer: ((RS_SUN / 2) * Math.log(AU / R_SUN)) / 1e3, units: 'km', tol: { rel: 0.01 },
      integrand: `1/sqrt(1 - ${round(RS_SUN / 1e3, 6)}/x) - 1`, limits: [R_SUN / 1e3, AU / 1e3],
      errors: [
        { value: (RS_SUN * Math.log(AU / R_SUN)) / 1e3, feedback: t`That is twice the answer: $1/\sqrt{1 - \epsilon} \approx 1 + \epsilon/2$.` },
        { value: ((RS_SUN / 2) * Math.log10(AU / R_SUN)) / 1e3, feedback: t`The integral of $dr/r$ is the natural logarithm, $\ln$, not $\log_{10}$.` },
      ],
      hints: [t`The extra length is $\int\left(\dfrac{1}{\sqrt{1 - r_s/r}} - 1\right)dr \approx \dfrac{r_s}{2}\int\dfrac{dr}{r}$.`, t`$= \dfrac{r_s}{2}\ln\dfrac{r_2}{r_1}$, with $r_2/r_1 = ${fmt(AU / R_SUN, 4)}$.`],
      teach: t`In a weak field, $\sqrt{g_{rr}} \approx 1 + GM/(rc^2)$, so radial distances gain $\tfrac12 r_s\ln(r_2/r_1)$.`,
      explain: t`$\dfrac{r_s}{2}\ln\dfrac{r_2}{r_1} = ${fmt(RS_SUN / 2e3, 4)}\ \text{km}\times\ln ${fmt(AU / R_SUN, 4)} = ${fmt(((RS_SUN / 2) * Math.log(AU / R_SUN)) / 1e3, 3)}$ km, in $${sci((AU - R_SUN) / 1e3, 3)}$ km — five parts in $10^8$. Light along this path is delayed by twice that, $2\times${fmt(((RS_SUN / 2) * Math.log(AU / R_SUN)) / 1e3, 3)}\ \text{km}/c \approx ${fmt((RS_SUN * Math.log(AU / R_SUN)) / C * 1e6, 2)}\ \mu\text{s}$, because $g_{tt}$ contributes as much as $g_{rr}$: the Shapiro delay of step 24, which radar echoes and the Cassini spacecraft have confirmed to a few parts in $10^5$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 262], y: [0, 2.5], xlabel: 'r (solar radii)', ylabel: 'extra length per unit Δr  (×10⁻⁶)',
          curves: [{ fn: `${round((RS_SUN / (2 * R_SUN)) * 1e6, 4)}/x`, domain: [1, 262], color: 'accent', width: 2.4, label: 'rₛ / 2r', labelAt: 12, labelDx: 8, labelDy: -6 }],
          shade: [{ fn: `${round((RS_SUN / (2 * R_SUN)) * 1e6, 4)}/x`, from: 1, to: round(AU / R_SUN, 5), color: 'gold', alpha: 0.35 }],
          vlines: [{ x: 1, color: 'warn', label: 'Sun’s surface' }, { x: round(AU / R_SUN, 5), color: 'teal', label: 'Earth’s orbit' }],
        },
        caption: t`The excess of the radial integrand over 1, $r_s/2r$, from the Sun’s surface to 1 AU (in parts per million). The extra ruler distance is the shaded area — most of it gathered close to the Sun.`,
      },
    }),
    expr({
      id: 'cp-rotating', difficulty: 3, transfer: true,
      prompt: t`A turntable spins at angular speed $\omega$, and its riders label events with the co-rotating angle $\phi' = \phi - \omega t$ (and $t$, $r$, $z$). Start from flat spacetime in cylindrical coordinates, $ds^2 = -c^2dt^2 + dr^2 + r^2d\phi^2 + dz^2$, and substitute $d\phi = d\phi' + \omega\,dt$. What is $g_{tt}$, the coefficient of $dt^2$?`,
      answer: '-(c^2 - omega^2*r^2)', answerTeX: t`-\left(c^2 - \omega^2r^2\right)`,
      lhs: 'g_{tt}',
      vars: { c: [2, 4], omega: [0.1, 0.5], r: [0.5, 2] },
      errors: [
        { answer: '-c^2', feedback: t`Square $d\phi' + \omega\,dt$ in full: it contributes $\omega^2r^2\,dt^2$ as well.` },
        { answer: '-(c^2 + omega^2*r^2)', feedback: t`Sign: $r^2(d\phi' + \omega\,dt)^2$ adds $+\omega^2r^2\,dt^2$, which partly cancels $-c^2\,dt^2$.` },
        { answer: '2*omega*r^2', feedback: t`That is the coefficient of $d\phi'\,dt$, i.e. $2g_{t\phi'}$; the question asks for the $dt^2$ term.` },
      ],
      hints: [t`$r^2\,d\phi^2 = r^2(d\phi' + \omega\,dt)^2 = r^2d\phi'^2 + 2\omega r^2\,d\phi'\,dt + \omega^2r^2\,dt^2$.`, t`Collect everything multiplying $dt^2$.`],
      teach: t`A change of chart can make $g_{tt}$ position-dependent and add off-diagonal terms without any curvature: the rotating frame is flat spacetime relabelled.`,
      explain: t`$ds^2 = -(c^2 - \omega^2r^2)\,dt^2 + 2\omega r^2\,d\phi'\,dt + dr^2 + r^2d\phi'^2 + dz^2$. Flat spacetime, yet $g_{tt}$ depends on $r$ and $g_{t\phi'} = \omega r^2$ is off the diagonal. A rider at fixed $r$ ages at $d\tau/dt = \sqrt{1 - \omega^2r^2/c^2}$ — ordinary time dilation at speed $\omega r$ (step 9) — and $g_{tt}$ reaches zero at $r = c/\omega$, where staying at fixed $\phi'$ would mean moving at the speed of light.`,
      visual: {
        type: 'graph',
        params: {
          x: [-4.4, 4.4], y: [-3.4, 3.4], equal: true, axes: false, grid: false,
          curves: [
            ...[1, 2, 3].map((q) => ({ param: [`${q}*cos(t)`, `${q}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1 })),
            ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => ({ param: [`${round(Math.cos(a * DEG), 4)}*t`, `${round(Math.sin(a * DEG), 4)}*t`], t: [0, 3], color: 'teal', width: 1.3 })),
            { param: ['3.5*cos(t)', '3.5*sin(t)'], t: [0.25, 1.2], color: 'violet', width: 2, label: 'ω', labelAt: 0.7, labelDx: 8, labelDy: -4 },
          ],
          arrows: [
            { from: [round(3.5 * Math.cos(1.15), 4), round(3.5 * Math.sin(1.15), 4)], to: [round(3.5 * Math.cos(1.3), 4), round(3.5 * Math.sin(1.3), 4)], color: 'violet' },
            { from: [round(2 * Math.cos(30 * DEG), 4), round(2 * Math.sin(30 * DEG), 4)], to: [round(2 * Math.cos(30 * DEG) - 0.6, 4), round(2 * Math.sin(30 * DEG) + 0.6 * Math.sqrt(3), 4)], color: 'gold', label: 'ωr' },
          ],
          points: [{ x: round(2 * Math.cos(30 * DEG), 4), y: round(2 * Math.sin(30 * DEG), 4), color: 'ink', r: 4, label: 'rider', labelDx: 8, labelDy: 14 }],
        },
        caption: t`The turntable from above (not to scale). The riders’ coordinate lines $\phi'$ = const (teal) turn with it at $\omega$; a rider at radius $r$ moves at $\omega r$ through the inertial frame.`,
      },
    }),
    mcq({
      id: 'cp-curved', difficulty: 3,
      prompt: t`Which of these two-dimensional line elements describes a curved surface?`,
      choices: [
        t`$ds^2 = d\rho^2 + \sin^2\!\rho\;d\phi^2$`,
        t`$ds^2 = dr^2 + r^2\,d\theta^2$`,
        t`$ds^2 = du^2 + du\,dv + dv^2$`,
        t`$ds^2 = dx^2 + 4\,dy^2$`,
      ],
      answer: 0,
      why: {
        1: t`The polar plane. Its components vary from place to place, but a circle of radius $r$ has circumference exactly $2\pi r$: flat — it is $dx^2 + dy^2$ relabelled.`,
        2: t`Skewed axes at $60^\circ$ ($2\cos 60^\circ = 1$). A cross term with constant components is still a flat plane.`,
        3: t`Stretched labels: with $Y = 2y$ it becomes $dx^2 + dY^2$. Constant components can always be brought to the identity.`,
      },
      hints: ['Test each with a circle: compare circumference with radius.', 'Varying components alone prove nothing; they can come from the coordinates.'],
      teach: t`Varying or off-diagonal components can come from the coordinates alone; curvature shows in coordinate-free measurements, such as a circle’s circumference against its radius.`,
      explain: t`For $d\rho^2 + \sin^2\!\rho\,d\phi^2$ a circle at distance $\rho$ from the origin has circumference $2\pi\sin\rho < 2\pi\rho$: this is the unit sphere, with $K = 1$. The other three are the flat plane in polar, skewed and stretched labels; for each a coordinate change brings the metric to $dx^2 + dy^2$, which no change can do for the sphere.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 2 (the metric, its inverse and determinant) and ch. 7 (the Schwarzschild solution)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), ch. 6: the metric of a curved manifold and curvature measured from inside', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes (2nd ed., free online): the Schwarzschild metric and ruler distances', url: 'https://www.eftaylor.com/exploringblackholes/' },
  ],
});
