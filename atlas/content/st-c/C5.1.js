// Normal curvature and the second fundamental form: the normal of C3.2 comes
// back. L = X_uu·n, M = X_uv·n, N = X_vv·n; κ_n = II/I depends only on the
// direction (Meusnier); sphere, cylinder, torus and graphs.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';
import { saddle, forms } from './_surf.js';

const t = String.raw;
const DEG = Math.PI / 180;
const TAU = r6(2 * Math.PI);

// Explore surface z = 0.4x² + 0.5xy − 0.3y²: at the origin n = (0, 0, 1), L = 0.8, M = 0.5, N = −0.6.
const F0 = '0.4*x^2 + 0.5*x*y - 0.3*y^2';
const KN = '0.8*cos(th)^2 + cos(th)*sin(th) - 0.6*sin(th)^2';
const sec = (f, th) => [`t*cos(${th})`, `t*sin(${th})`, f.replace(/x/g, `(t*cos(${th}))`).replace(/y/g, `(t*sin(${th}))`)];
// the osculating circle of a normal section of curvature k, in arclength s, in the vertical plane at angle th
const osc = (k, th) => { const K = `(${k} + 0.000001)`; return [`sin(${K}*t)/${K}*cos(${th})`, `sin(${K}*t)/${K}*sin(${th})`, `(1 - cos(${K}*t))/${K}`]; };
const graphPic = (f, th, caption, extra = {}) => ({ type: 'surface3d', params: { z: f, domain: [[-1.6, 1.6], [-1.6, 1.6]], alpha: 0.65, pitch: 0.35, yaw: -0.6, dist: 7, curves: [{ param: sec(f, th), t: [-1.6, 1.6], color: 'gold', width: 3.2 }], ...extra }, caption });

export default lesson({
  id: 'st-c.C5.1',
  title: 'Normal curvature and the second fundamental form',
  minutes: 13, difficulty: 3,
  equation: t`\kappa_n = \frac{\mathrm{II}}{\mathrm I} = \frac{L\,du^2 + 2M\,du\,dv + N\,dv^2}{E\,du^2 + 2F\,du\,dv + G\,dv^2}`,
  intro: t`The first fundamental form threw the normal $\mathbf n$ away. Now it comes back. A curve running along a surface must bend, just to stay on it; the part of its acceleration along $\mathbf n$ is forced by the surface. For a unit-speed curve $\gamma$ that part is the **normal curvature** $\kappa_n = \gamma''\cdot\mathbf n$. Differentiating $\gamma'\cdot\mathbf n = 0$ shows it depends only on the curve’s *direction* $(du : dv)$, through the **second fundamental form** $\mathrm{II}$, whose coefficients are the normal components of the second derivatives:

$$L = \mathbf X_{uu}\cdot\mathbf n,\qquad M = \mathbf X_{uv}\cdot\mathbf n,\qquad N = \mathbf X_{vv}\cdot\mathbf n.$$

$\kappa_n$ is how fast the surface bends away from its tangent plane in that direction — positive when it bends toward $\mathbf n$. Flip $\mathbf n$ and $\mathrm{II}$ and $\kappa_n$ flip with it.`,
  symbols: [
    { tex: t`\kappa_n`, text: t`the normal curvature in the direction $(du : dv)$, in $\text{m}^{-1}$ if lengths are in metres; signed by $\mathbf n$` },
    { tex: t`\mathrm{II}`, text: 'the second fundamental form: how the surface bends out of its tangent plane' },
    { tex: 'L,\\ M,\\ N', text: t`its coefficients, $\mathbf X_{uu}\cdot\mathbf n$, $\mathbf X_{uv}\cdot\mathbf n$, $\mathbf X_{vv}\cdot\mathbf n$ (the $N$ here is a number, not the curve’s principal normal)` },
    { tex: t`\mathrm I`, text: t`the first fundamental form $E\,du^2 + 2F\,du\,dv + G\,dv^2$ — dividing by it makes $\kappa_n$ independent of the step’s size` },
    { tex: t`\mathbf n`, text: t`the unit normal $\mathbf X_u\times\mathbf X_v/|\mathbf X_u\times\mathbf X_v|$ of C3.2` },
  ],
  why: t`$\mathrm{II}$ is the **extrinsic curvature**. In GR it reappears as the extrinsic curvature $K_{ij}$ of a slice of constant time inside spacetime — one of the two pieces of data numerical relativity evolves (gr.S32.d).`,
  visual: {
    type: 'surface3d',
    title: 'Slicing a surface along its normal',
    lead: t`The surface $z = 0.4x^2 + 0.5xy - 0.3y^2$ near the origin, where $\mathbf n$ points straight up. Turn the direction $\theta$: the gold curve is the **normal section** — the surface cut by the vertical plane in that direction — and the blue circle is its osculating circle, of radius $1/|\kappa_n|$.`,
    tasks: [
      t`Find a direction where the section bends up ($\kappa_n > 0$) and one where it bends down ($\kappa_n < 0$). The blue circle swaps sides.`,
      t`Between them there are directions where $\kappa_n = 0$ and the circle opens into a straight line: the surface is momentarily flat that way.`,
      t`The readout repeats every $180^\circ$: $\theta$ and $\theta + 180^\circ$ are the same line through the point.`,
    ],
    params: {
      z: F0, domain: [[-1.6, 1.6], [-1.6, 1.6]], alpha: 0.62, pitch: 0.3, yaw: -0.6, dist: 7, n: 40,
      sliders: [{ key: 'th', label: t`Direction $\theta$`, min: 0, max: 3.1416, step: 0.01, value: 0.3, explain: t`The angle of the cutting plane from the $x$-axis, in radians.` }],
      curves: [{ param: sec(F0, 'th'), t: [-1.6, 1.6], color: 'gold', width: 3.2 }, { param: osc(KN, 'th'), t: [-1.6, 1.6], color: 'accent', width: 2 }],
      readouts: [{ label: t`$\kappa_n$`, expr: KN, digits: 3 }],
    },
    caption: t`At the origin $E = G = 1$, $F = 0$ and $L = 0.8$, $M = 0.5$, $N = -0.6$, so $\kappa_n = 0.8\cos^2\theta + \sin\theta\cos\theta - 0.6\sin^2\theta$ (dimensionless units). The circle is drawn over an arc of length 3.2.`,
  },
  example: {
    prompt: t`Find $L$, $M$, $N$ for the sphere of radius $a$, $\mathbf X(\theta, \varphi) = a(\sin\theta\cos\varphi,\ \sin\theta\sin\varphi,\ \cos\theta)$, and the normal curvature in every direction.`,
    visual: { type: 'surface3d', params: { surface: ['sin(v)*cos(u)', 'sin(v)*sin(u)', 'cos(v)'], domain: [[0, TAU], [0.01, 3.13]], alpha: 0.55, pitch: 0.35, dist: 4.4, axes: false, curves: [{ param: ['sin(t)*cos(0.6)', 'sin(t)*sin(0.6)', 'cos(t)'], t: [0, 3.1416], color: 'gold', width: 3 }, { param: [`${r6(Math.sin(1.1))}*cos(t)`, `${r6(Math.sin(1.1))}*sin(t)`, `${r6(Math.cos(1.1))}`], t: [0, TAU], color: 'violet', width: 2.6 }] }, caption: 'A meridian (gold) and a latitude circle (violet) on a sphere: both have normal curvature −1/a with the outward normal.' },
    steps: [
      { label: 'The normal', text: t`$\mathbf X_\theta\times\mathbf X_\varphi = a^2\sin\theta\,(\sin\theta\cos\varphi,\ \sin\theta\sin\varphi,\ \cos\theta)$, so $\mathbf n = \mathbf X/a$: the outward radial direction.` },
      { label: 'Second derivatives', text: t`$\mathbf X_{\theta\theta} = -\mathbf X$, so $L = -\mathbf X\cdot\mathbf X/a = -a$. $\mathbf X_{\theta\varphi} = a\cos\theta(-\sin\varphi,\ \cos\varphi,\ 0)$ is horizontal and perpendicular to $\mathbf n$: $M = 0$. $\mathbf X_{\varphi\varphi} = -a\sin\theta(\cos\varphi,\ \sin\varphi,\ 0)$, so $N = -a\sin^2\theta$.` },
      { label: 'Compare with I', text: t`$E = a^2$, $F = 0$, $G = a^2\sin^2\theta$. Every coefficient of $\mathrm{II}$ is $-1/a$ times the matching one of $\mathrm I$: $\mathrm{II} = -\tfrac1a\,\mathrm I$.` },
      { label: 'Normal curvature', text: t`$\kappa_n = \mathrm{II}/\mathrm I = -1/a$ in **every** direction. The sign says the sphere bends away from the outward normal; the size, $1/a$, is the curvature of a great circle.` },
      { label: 'Sense check', text: t`With the inward normal, $\kappa_n = +1/a$. For the Earth, $|\kappa_n| = 1/6371\ \text{km}^{-1}$: the ground drops below a level line by about $d^2/(2R)$, i.e. $7.8$ cm over 1 km.` },
    ],
    answer: t`$L = -a$, $M = 0$, $N = -a\sin^2\theta$, and $\kappa_n = -1/a$ in every direction (outward normal).`,
  },
  practice: [
    mcq({
      id: 'what-L', difficulty: 1,
      prompt: t`What does $L = \mathbf X_{uu}\cdot\mathbf n$ measure?`,
      visual: graphPic('0.4*x^2 - 0.2*y^2', 0, t`The surface $z = 0.4x^2 - 0.2y^2$ with its $x$-curve through the origin (gold) bending up away from the tangent plane $z = 0$.`),
      choices: [
        t`How fast the $u$-curve bends out of the tangent plane, toward $\mathbf n$`,
        t`The squared speed of the $u$-curve`,
        t`How fast the $u$-curve turns within the tangent plane`,
        t`The length of $\mathbf X_{uu}$`,
      ],
      answer: 0,
      why: {
        1: t`That is $E = \mathbf X_u\cdot\mathbf X_u$, from the first fundamental form.`,
        2: t`Turning *within* the tangent plane is the tangential part of $\mathbf X_{uu}$ — geodesic curvature (C6.2). $L$ is the normal part.`,
        3: t`$\mathbf X_{uu}$ has tangential parts too; $L$ keeps only its component along $\mathbf n$.`,
      },
      hints: [t`$\mathbf X_{uu}$ is the acceleration of the $u$-curve. Dotting with $\mathbf n$ keeps which part of it?`],
      teach: t`$L$, $M$, $N$ are the normal components of the second derivatives: how the coordinate curves bend away from the tangent plane.`,
      explain: t`$\mathbf X_{uu}$ is the $u$-curve’s acceleration; $L$ is its component along $\mathbf n$. Divided by $E$ it is the normal curvature in the $u$-direction: $\kappa_n = L/E$.`,
    }),
    num({
      id: 'graph-kn', difficulty: 2,
      gen(r) {
        let a, b, c, th, C, S, k;
        for (let i = 0; i < 60; i++) {           // keep κn clear of zero
          a = r.pick([0.5, 1, 1.5]); b = r.pick([-1, 0.5, 1]); c = r.pick([-1, -0.5, 0.5]); th = r.pick([30, 45, 60, 120, 150]);
          C = Math.cos(th * DEG); S = Math.sin(th * DEG);
          k = 2 * a * C * C + 2 * b * C * S + 2 * c * S * S;
          if (Math.abs(k) > 0.25) break;
        }
        const half = k / 2;
        const f = `${a}*x^2 + ${b}*x*y + ${c}*y^2`;
        const fTeX = t`${a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}xy ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}y^2`;
        return {
          prompt: t`At the origin of the surface $z = ${fTeX}$, the tangent plane is $z = 0$ and $\mathbf n = (0, 0, 1)$. What is the normal curvature in the direction at $${th}^\circ$ to the $x$-axis?`,
          visual: graphPic(f, r6(th * DEG), t`The surface with the normal section in that direction (gold). Heights to scale.`, { zclip: 6 }),
          answer: k, tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: half, feedback: t`$L = f_{xx} = 2\times${a}$, not ${a}: the second derivative of $ax^2$ is $2a$. (Similarly $N = 2\times${c}$.)` }, { value: 2 * a * C * C + 2 * c * S * S, feedback: t`You dropped the cross term $2M\cos\theta\sin\theta$ with $M = f_{xy} = ${b}$.` }].filter((e) => Math.abs(e.value - k) > 0.03 * Math.abs(k) + 0.01),
          hints: [t`For a graph at a point where $f_x = f_y = 0$: $E = G = 1$, $F = 0$ and $L = f_{xx}$, $M = f_{xy}$, $N = f_{yy}$.`, t`With the unit direction $(\cos\theta, \sin\theta)$: $\kappa_n = L\cos^2\theta + 2M\cos\theta\sin\theta + N\sin^2\theta$, where $L = ${2 * a}$, $M = ${b}$, $N = ${2 * c}$.`],
          teach: t`Where the tangent plane is horizontal, $\mathrm{II}$ is the Hessian of the height: $L = f_{xx}$, $M = f_{xy}$, $N = f_{yy}$.`,
          explain: t`$\kappa_n = ${2 * a}\cos^2 ${th}^\circ + 2(${b})\cos ${th}^\circ\sin ${th}^\circ + (${2 * c})\sin^2 ${th}^\circ = ${nice(k, 4)}$. ${k > 0 ? 'Positive: the section bends up, toward n.' : 'Negative: the section bends down, away from n.'} This is the second-derivative test of Calculus III, read as geometry.`,
        };
      },
    }),
    num({
      id: 'cyl-helix', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1, 2]), beta = r.pick([20, 30, 45, 60]);
        const k = Math.cos(beta * DEG) ** 2 / a;
        return {
          prompt: t`On a cylinder of radius $a = ${a}$ m, a curve leaves a point at $${beta}^\circ$ to the horizontal circle through it. What is the magnitude of its normal curvature there, in $\text{m}^{-1}$? (In the coordinates $(\varphi, z)$: $E = a^2$, $F = 0$, $G = 1$ and $L = -a$, $M = N = 0$.)`,
          visual: { type: 'surface3d', params: { surface: [`${a}*cos(u)`, `${a}*sin(u)`, 'v'], domain: [[0, TAU], [r6(-1.6 * a), r6(1.6 * a)]], alpha: 0.5, pitch: 0.25, dist: r6(6.5 * a), axes: false, curves: [{ param: [`${a}*cos(t/${a})`, `${a}*sin(t/${a})`, `${r6(Math.tan(beta * DEG))}*t`], t: [r6(-1.5 * a / Math.max(1, Math.tan(beta * DEG))), r6(1.5 * a / Math.max(1, Math.tan(beta * DEG)))], color: 'gold', width: 3 }, { param: [`${a}*cos(t)`, `${a}*sin(t)`, '0'], t: [0, TAU], color: 'ink3', width: 1.6 }] }, caption: t`The curve (gold, a helix) leaving the horizontal circle at $${beta}^\circ$.` },
          answer: k, units: 'm^-1', tol: { rel: 0.01 },
          errors: [{ value: Math.cos(beta * DEG) / a, feedback: t`The direction enters $\mathrm{II}/\mathrm I$ squared: $\kappa_n = \cos^2\beta/a$, not $\cos\beta/a$.` }, { value: 1 / a, feedback: t`$1/a$ is the normal curvature along the circle. Tilted at $\beta$, the curve bends less.` }].filter((e) => Math.abs(e.value - k) > 0.02 * k),
          hints: [t`A unit vector at angle $\beta$ to the circle has components $(d\varphi, dz) = (\cos\beta/a,\ \sin\beta)$, since $|\mathbf X_\varphi| = a$.`, t`$\mathrm{II} = -a\,d\varphi^2 = -\cos^2\beta/a$ and $\mathrm I = 1$.`],
          teach: t`On a cylinder of radius $a$, the normal curvature at angle $\beta$ to the circles is $-\cos^2\beta/a$: full along the circles, zero along the rulings.`,
          explain: t`$|\kappa_n| = \cos^2 ${beta}^\circ/${a} = ${nice(k, 4)}\ \text{m}^{-1}$. The curve is a helix, and C2.3’s formula gives its curvature as exactly this — because a helix on a cylinder bends only along the normal (it is a geodesic, C6.2).`,
        };
      },
    }),
    expr({
      id: 'torus-L', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 3, 4]), rr = r.pick([0.5, 1]), rs = rr === 1 ? '' : rr;
        return {
          prompt: t`For the torus $\mathbf X(u, v) = \big((${R} + ${rs}\cos v)\cos u,\ (${R} + ${rs}\cos v)\sin u,\ ${rs}\sin v\big)$, with the outward normal $\mathbf n = (\cos v\cos u,\ \cos v\sin u,\ \sin v)$, find $L(v) = \mathbf X_{uu}\cdot\mathbf n$.`,
          visual: { type: 'surface3d', params: { surface: [`(${R} + ${rr}*cos(v))*cos(u)`, `(${R} + ${rr}*cos(v))*sin(u)`, `${rr}*sin(v)`], domain: [[0, TAU], [0, TAU]], alpha: 0.6, pitch: 0.6, dist: r6(2.8 * (R + rr)), curves: [0, 1.2, 2.2, 3.1416].map((v) => ({ param: [`(${R} + ${rr}*cos(${v}))*cos(t)`, `(${R} + ${rr}*cos(${v}))*sin(t)`, `${r6(rr * Math.sin(v))}`], t: [0, TAU], color: 'gold', width: 2.2 })) }, caption: t`Four $u$-curves (gold): horizontal circles whose acceleration points at the axis.` },
          answer: `-(${R} + ${rr}cos(v))cos(v)`, answerTeX: t`-(${R} + ${rs}\cos v)\cos v`, vars: { v: [0, 6], u: [0, 6] }, lhs: 'L',
          errors: [{ answer: `(${R} + ${rr}cos(v))cos(v)`, feedback: t`$\mathbf X_{uu} = -(${R} + ${rs}\cos v)(\cos u, \sin u, 0)$ points toward the axis: the dot product with the outward $\mathbf n$ is negative on the outside.` }, { answer: `-(${R} + ${rr}cos(v))`, feedback: t`$\mathbf X_{uu}$ is horizontal, but $\mathbf n$ is tilted by $v$: the dot product picks up a factor $\cos v$.` }],
          hints: [t`$\mathbf X_{uu} = -(${R} + ${rs}\cos v)(\cos u,\ \sin u,\ 0)$: the centripetal acceleration of a horizontal circle.`, t`$(\cos u, \sin u, 0)\cdot\mathbf n = \cos v(\cos^2 u + \sin^2 u) = \cos v$.`],
          teach: t`$L$ is the component of the $u$-curve’s acceleration along the normal.`,
          explain: t`$L = -(${R} + ${rs}\cos v)\cos v$. With $E = (${R} + ${rs}\cos v)^2$, the normal curvature along the circles is $L/E = -\cos v/(${R} + ${rs}\cos v)$: negative outside, zero on the top and bottom circles ($\cos v = 0$), positive inside. (The other coefficients are $M = 0$ and $N = -${rr}$.)`,
        };
      },
    }),
    mcq({
      id: 'flip-n', difficulty: 2,
      prompt: t`You replace $\mathbf n$ by $-\mathbf n$ (for instance by swapping $u$ and $v$). What happens?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.8, grid: false, axes: false, pitch: 0.3, curves: [{ param: ['t', '0', '0.45*t^2'], t: [-1.5, 1.5], color: 'gold', width: 3 }], vectors: [{ from: [0, 0, 0], to: [0, 0, 0.9], color: 'bad', label: t`\mathbf n` }, { from: [0, 0, 0], to: [0, 0, -0.9], color: 'violet', label: t`-\mathbf n` }] }, caption: 'A normal section that bends upward, and the two possible unit normals.' },
      choices: [t`$\mathrm I$ is unchanged; $\mathrm{II}$ and every $\kappa_n$ change sign`, t`Both $\mathrm I$ and $\mathrm{II}$ change sign`, 'Nothing changes: curvature is geometric', t`$\kappa_n$ is unchanged, because it is $\mathrm{II}/\mathrm I$ and both flip`],
      answer: 0,
      why: {
        1: t`$\mathrm I$ is built from $\mathbf X_u$ and $\mathbf X_v$ only; it is positive definite and cannot flip.`,
        2: t`How much the curve bends is geometric; the *sign* of $\kappa_n$ only says toward which normal, and that is a choice.`,
        3: t`$\mathrm I$ does not flip — it never mentions $\mathbf n$.`,
      },
      hints: [t`Which of $E, F, G, L, M, N$ contain $\mathbf n$?`],
      teach: 'Reversing the normal reverses II and the sign of every normal curvature, and leaves I alone.',
      explain: t`$L$, $M$, $N$ are dot products with $\mathbf n$, so they flip; $E$, $F$, $G$ do not. A product of two normal curvatures, like the Gaussian curvature of C5.3, does not care which normal you chose — a hint that it might be more than extrinsic.`,
    }),
    order({
      id: 'derive-kn', difficulty: 3,
      prompt: t`Show that a unit-speed curve $\gamma(s) = \mathbf X(u(s), v(s))$ on a surface has $\gamma''\cdot\mathbf n = L\,u'^2 + 2M\,u'v' + N\,v'^2$. Order the steps.`,
      visual: graphPic('0.3*x^2 + 0.2*x*y - 0.25*y^2', 0.8, 'A curve through a point of a surface: its acceleration has a part in the tangent plane and a part along the normal.'),
      items: [
        t`Chain rule: $\gamma' = u'\,\mathbf X_u + v'\,\mathbf X_v$.`,
        t`Again: $\gamma'' = u''\mathbf X_u + v''\mathbf X_v + u'^2\mathbf X_{uu} + 2u'v'\mathbf X_{uv} + v'^2\mathbf X_{vv}$.`,
        t`Dot with $\mathbf n$: the terms in $\mathbf X_u$ and $\mathbf X_v$ vanish, since they are tangent.`,
        t`What is left is $u'^2\,\mathbf X_{uu}\cdot\mathbf n + 2u'v'\,\mathbf X_{uv}\cdot\mathbf n + v'^2\,\mathbf X_{vv}\cdot\mathbf n = \mathrm{II}(u', v')$.`,
        t`It depends only on $(u', v')$ — the direction — so every curve through the point in that direction has the same $\kappa_n$.`,
      ],
      hints: ['Differentiate γ twice with the chain rule, then use that n is perpendicular to the tangent plane.', 'The second derivatives of u and v multiply tangent vectors; they drop out.'],
      teach: 'Only the second derivatives of X survive the dot product with n, which is why the normal curvature depends on the direction alone.',
      explain: t`The last step is **Meusnier’s theorem**: curves through a point in the same direction share their normal curvature, however differently they bend sideways. For a curve not at unit speed, divide by $|\gamma'|^2 = \mathrm I(u', v')$ — hence $\kappa_n = \mathrm{II}/\mathrm I$.`,
    }),
    mcq({
      id: 'meusnier', difficulty: 2,
      prompt: t`On a sphere of radius $a$, a latitude circle at colatitude $\theta_0$ and the great circle tangent to it at a point $p$ leave $p$ in the same direction. The latitude circle has curvature $1/(a\sin\theta_0)$, the great circle $1/a$. Compare their normal curvatures at $p$.`,
      visual: { type: 'surface3d', params: { surface: ['sin(v)*cos(u)', 'sin(v)*sin(u)', 'cos(v)'], domain: [[0, TAU], [0.01, 3.13]], alpha: 0.45, pitch: 0.4, dist: 4.4, axes: false, curves: [{ param: [`${r6(Math.sin(0.8))}*cos(t)`, `${r6(Math.sin(0.8))}*sin(t)`, `${r6(Math.cos(0.8))}`], t: [0, TAU], color: 'violet', width: 2.6 }, { param: [`${r6(Math.sin(0.8))}*cos(t)`, 'sin(t)', `${r6(Math.cos(0.8))}*cos(t)`], t: [0, TAU], color: 'gold', width: 2.6 }] }, caption: t`A latitude circle at $\theta_0 = 0.8$ rad (violet) and the great circle tangent to it at $(\sin\theta_0, 0, \cos\theta_0)$ (gold).` },
      choices: [t`They are equal, $-1/a$ each: only the direction matters`, t`The latitude circle’s is larger, $-1/(a\sin\theta_0)$`, t`The latitude circle’s is zero, since it lies in a horizontal plane`, t`The great circle’s is zero, since great circles are “straight”`],
      answer: 0,
      why: {
        1: t`Its whole curvature is not normal: its acceleration points at the axis, tilted from $\mathbf n$. Only the normal component, $1/a$, counts.`,
        2: t`Its plane is horizontal, but $\mathbf n$ is not vertical there: the acceleration has a normal component.`,
        3: t`Great circles are straight *within* the sphere (zero geodesic curvature, C6.2), but they bend with it: all their curvature is normal.`,
      },
      hints: [t`$\kappa_n = \mathrm{II}/\mathrm I$ depends only on the direction — and the sphere’s is $-1/a$ in every direction.`],
      teach: 'Curves through a point in the same direction share their normal curvature (Meusnier); they can differ only in their sideways bending.',
      explain: t`Both have $\kappa_n = -1/a$. The latitude circle’s extra curvature lies in the tangent plane: $\kappa^2 = \kappa_n^2 + \kappa_g^2$ gives $\kappa_g = \cot\theta_0/a$ — the sideways bending C6.2 calls geodesic curvature.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-stringer', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([1.5, 1.85, 2.0, 2.6]), beta = r.pick([25, 30, 40, 50]);
        const rad = a / Math.cos(beta * DEG) ** 2;
        return {
          prompt: t`An aircraft fuselage is a cylinder of radius $${a}$ m. A stiffening stringer is to be laid along the skin at $${beta}^\circ$ to the hoop (circumferential) direction, as a helix. It bends only along the skin’s normal, so its curvature equals $|\kappa_n|$. To what radius of curvature must it be pre-formed, in metres?`,
          visual: { type: 'surface3d', params: { surface: [`${a}*cos(u)`, `${a}*sin(u)`, 'v'], domain: [[0, TAU], [-3, 3]], alpha: 0.45, pitch: 0.2, dist: 13, axes: false, curves: [{ param: [`${a}*cos(t/${a})`, `${a}*sin(t/${a})`, `${r6(Math.tan(beta * DEG))}*t`], t: [r6(-2.8 / Math.tan(beta * DEG) * Math.min(1, Math.tan(beta * DEG))), r6(2.8 / Math.tan(beta * DEG) * Math.min(1, Math.tan(beta * DEG)))], color: 'gold', width: 3 }] }, caption: 'A 6 m section of fuselage with the stringer’s path (gold). Real fuselages are not exact cylinders near the nose and tail.' },
          answer: rad, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: a / Math.cos(beta * DEG), feedback: t`The normal curvature goes as $\cos^2\beta$, not $\cos\beta$: the direction enters $\mathrm{II}$ quadratically.` }, { value: a, feedback: t`That is the hoop direction’s radius. Laid at an angle, the stringer bends more gently.` }, { value: a / Math.sin(beta * DEG) ** 2, feedback: t`$\beta$ is measured from the hoop direction, where the curvature is largest: use $\cos^2\beta$.` }].filter((e) => Math.abs(e.value - rad) > 0.02 * rad),
          hints: [t`On a cylinder of radius $a$, $|\kappa_n| = \cos^2\beta/a$ at angle $\beta$ to the circles.`, t`The radius of curvature is $1/|\kappa_n| = a/\cos^2\beta$.`],
          teach: t`Normal curvature on a cylinder varies as $\cos^2\beta/a$ between the hoop and axial directions.`,
          explain: t`$a/\cos^2 ${beta}^\circ = ${a}/${nice(Math.cos(beta * DEG) ** 2, 4)} = ${nice(rad, 4)}$ m. Along the fuselage ($\beta = 90^\circ$) the stringer would be straight — which is why most stringers run lengthwise.`,
        };
      },
    }),
    num({
      id: 'cp-saddle-kn', difficulty: 3,
      gen(r) {
        const [u0, v0] = r.pick([[1, 0], [1, 1], [0.5, 1], [2, 1], [1, -2]]);
        const [p, q] = r.pick([[1, 1], [1, -1], [2, 1], [1, 2]]);
        const fm = forms(saddle(1), u0, v0);
        const II = 2 * fm.M * p * q, I = fm.E * p * p + 2 * fm.F * p * q + fm.G * q * q, k = II / I;
        return {
          prompt: t`On the saddle $\mathbf X(u, v) = (u, v, uv)$ at $(u, v) = (${u0}, ${v0})$: $E = ${nice(fm.E)}$, $F = ${nice(fm.F)}$, $G = ${nice(fm.G)}$, $L = N = 0$ and $M = 1/\sqrt{1 + u^2 + v^2} = ${nice(fm.M, 4)}$. What is the normal curvature in the direction $(du, dv) = (${p}, ${q})$?`,
          visual: { type: 'surface3d', params: { z: 'x*y', domain: [[-2.2, 2.2], [-2.2, 2.2]], zscale: 0.4, alpha: 0.6, pitch: 0.4, yaw: -0.8, dist: 9, curves: [{ param: [`${u0} + ${p}*t`, `${v0} + ${q}*t`, `(${u0} + ${p}*t)*(${v0} + ${q}*t)`], t: [-0.5, 0.5], color: 'gold', width: 3.4 }] }, caption: t`The saddle (heights scaled by 0.4) with a curve through the point in the direction $(${p}, ${q})$ (gold).` },
          answer: k, tol: { rel: 0.01, abs: 0.001 },
          errors: [{ value: II / (p * p + q * q), feedback: t`Divide by $\mathrm I = E\,du^2 + 2F\,du\,dv + G\,dv^2$, not by $du^2 + dv^2$: the coordinates are not orthonormal here.` }, { value: II, feedback: t`$\mathrm{II}$ alone depends on the length of $(du, dv)$. Divide by $\mathrm I$.` }].filter((e) => Math.abs(e.value - k) > 0.03 * Math.abs(k)),
          hints: [t`$\mathrm{II} = 2M\,du\,dv = ${nice(II, 4)}$.`, t`$\mathrm I = E\,du^2 + 2F\,du\,dv + G\,dv^2 = ${nice(I, 4)}$; then $\kappa_n = \mathrm{II}/\mathrm I$.`],
          teach: t`$\kappa_n = \mathrm{II}/\mathrm I$: the ratio makes it independent of the length of $(du, dv)$.`,
          explain: t`$\kappa_n = ${nice(II, 4)}/${nice(I, 4)} = ${nice(k, 4)}$. Along the coordinate directions ($du = 0$ or $dv = 0$) it would be zero: the saddle’s coordinate lines are straight lines in space.`,
        };
      },
    }),
    mcq({
      id: 'cp-sign', difficulty: 2,
      prompt: t`At a point of a surface, with a chosen unit normal $\mathbf n$, the normal curvature in some direction is $\kappa_n = +0.5\ \text{m}^{-1}$. What does that tell you?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.8, grid: false, axes: false, pitch: 0.3, curves: [{ param: ['t', '0', '0.25*t^2'], t: [-1.6, 1.6], color: 'gold', width: 3 }, { param: ['t', '0', '0'], t: [-1.6, 1.6], color: 'ink3', width: 1.4 }], vectors: [{ from: [0, 0, 0], to: [0, 0, 1], color: 'bad', label: t`\mathbf n` }] }, caption: 'A normal section (gold) beside the tangent line (grey).' },
      choices: [
        t`In that direction the surface bends toward $\mathbf n$, along a normal section of radius 2 m`,
        t`In that direction the surface bends away from $\mathbf n$, with radius 0.5 m`,
        t`The surface is curved like a sphere at that point`,
        t`Every curve through the point in that direction has curvature exactly $0.5\ \text{m}^{-1}$`,
      ],
      answer: 0,
      why: {
        1: t`Positive means toward $\mathbf n$ ($\gamma''\cdot\mathbf n > 0$), and the radius is $1/\kappa_n = 2$ m.`,
        2: t`One direction says nothing about the others: a saddle has positive $\kappa_n$ in some directions too.`,
        3: t`Only their *normal* curvature is $0.5\ \text{m}^{-1}$; a curve may also bend sideways, so its total curvature is at least $0.5\ \text{m}^{-1}$.`,
      },
      hints: [t`$\kappa_n = \gamma''\cdot\mathbf n$ for a unit-speed curve; the radius of a curve of curvature $\kappa$ is $1/\kappa$.`],
      teach: t`The sign of $\kappa_n$ says whether the surface bends toward or away from the chosen normal; its size is the curvature of the normal section.`,
      explain: t`The normal section bends toward $\mathbf n$ with radius $1/0.5 = 2$ m; any other curve in that direction has curvature $\kappa \ge 0.5\ \text{m}^{-1}$ (Meusnier). Whether the surface is sphere-like needs all directions at once — C5.2’s principal curvatures.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §3-2', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §7.1–7.2', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
