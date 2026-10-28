// Lengths, angles and areas on a surface, all from E, F, G: arc length as the
// integral of the metric speed, angles between tangent vectors, the area
// element √(EG − F²); torus, catenoid, saddle and the Earth (zones, satellite
// coverage, the equal-area map).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, mesh } from './_dg.js';
import { saddle, torus, forms, angleI, R_EARTH } from './_surf.js';

const t = String.raw;
const DEG = Math.PI / 180;
const TAU = r6(2 * Math.PI);
const TOR = (R, r) => [`(${R} + ${r}*cos(v))*cos(u)`, `(${R} + ${r}*cos(v))*sin(u)`, `${r}*sin(v)`];
const SPH = ['sin(v)*cos(u)', 'sin(v)*sin(u)', 'cos(v)'];
const lat = (l) => ({ param: [`${r6(Math.cos(l * DEG))}*cos(t)`, `${r6(Math.cos(l * DEG))}*sin(t)`, `${r6(Math.sin(l * DEG))}`], t: [0, TAU], color: 'gold', width: 2.6 });

export default lesson({
  id: 'st-c.C4.2',
  title: 'Lengths, angles and areas on a surface',
  minutes: 13, difficulty: 3,
  equation: t`\ell = \int_a^b \sqrt{E\,u'^2 + 2F\,u'v' + G\,v'^2}\;dt`,
  intro: t`A curve on a surface is written in coordinates as $\big(u(t), v(t)\big)$. Its velocity is $u'\mathbf X_u + v'\mathbf X_v$, whose squared length is $\mathrm I(u', v') = E\,u'^2 + 2F\,u'v' + G\,v'^2$: integrate the square root and you have its length $\ell$. Two tangent vectors $\mathbf a = (a^1, a^2)$ and $\mathbf b = (b^1, b^2)$ (components along $\mathbf X_u$, $\mathbf X_v$) meet at the angle $\theta$ with $\cos\theta = \mathrm I(\mathbf a, \mathbf b)/\sqrt{\mathrm I(\mathbf a, \mathbf a)\,\mathrm I(\mathbf b, \mathbf b)}$, where $\mathrm I(\mathbf a, \mathbf b) = Ea^1b^1 + F(a^1b^2 + a^2b^1) + Ga^2b^2$. And a small coordinate rectangle $du \times dv$ is a parallelogram of area

$$dA = |\mathbf X_u\times\mathbf X_v|\,du\,dv = \sqrt{EG - F^2}\;du\,dv.$$

**Lengths, angles and areas all come from $E$, $F$, $G$**: an inhabitant of the surface can measure every one of them without a normal or a surrounding space.`,
  symbols: [
    { tex: t`\ell`, text: t`the length of the curve, in the units of $\mathbf X$` },
    { tex: t`u(t),\ v(t)`, text: t`the curve written in the surface’s coordinates, for $a \le t \le b$; $u'$, $v'$ are their rates of change` },
    { tex: 'E,\\ F,\\ G', text: t`the first fundamental form, evaluated along the curve at $\big(u(t), v(t)\big)$` },
    { tex: t`\mathrm I(\mathbf a, \mathbf b)`, text: t`the metric’s dot product of two tangent vectors given by their components — $g_{ij}a^ib^j$ in index notation` },
    { tex: 'dA', text: t`the area element: the area on the surface of the coordinate rectangle $du\times dv$` },
  ],
  why: t`In relativity the same integral, with the spacetime metric, is the proper time a clock keeps along its worldline (gr.S09.d), and $\sqrt{|g|}\,d^4x$ is the volume element every action is integrated against.`,
  visual: {
    type: 'ten-metric',
    title: 'Measuring on a map of the sphere',
    lead: t`This is the $(\varphi, \theta)$ coordinate map of a unit sphere, with $\theta$ measured down from the north pole. Each ellipse is the set of steps that are all the same length on the sphere. Drag the ends of the gold segment: the readout measures it with the metric $d\theta^2 + \sin^2\theta\,d\varphi^2$, and naively as if the map were flat.`,
    tasks: [
      t`Lay the segment along the equator ($\theta = \pi/2 \approx 1.57$): the two lengths agree, because $\sin\theta = 1$ there.`,
      t`Slide it, still horizontal, up toward the pole: its map length stays the same while its true length shrinks like $\sin\theta$.`,
      t`Make it vertical (a meridian): now the two agree at every height — $G = \sin^2\theta$ only affects east–west steps.`,
    ],
    params: { mode: 'chart', chart: 'sphere', probe: [1.2, 0.6], segment: [[0.5, 1.57], [2.5, 1.57]], readout: ['g', 'seg'] },
    caption: t`A unit sphere ($R = 1$). The chart is the flat $(\varphi, \theta)$ rectangle; the ellipses are drawn small, at radius $\varepsilon = 0.13$ on the sphere. The segment is straight on the map, which is not the shortest path on the sphere (C6.2).`,
  },
  example: {
    prompt: t`Find the surface area of the torus with radii $R > r$, $\mathbf X(u, v) = \big((R + r\cos v)\cos u,\ (R + r\cos v)\sin u,\ r\sin v\big)$, and evaluate it for the toroidal tank of C4.1 with $R = 4$ m, $r = 1$ m.`,
    visual: { type: 'surface3d', params: { surface: TOR(2, 0.8), domain: [[0, TAU], [0, TAU]], alpha: 0.7, pitch: 0.6, dist: 8, curves: [{ param: ['(2 + 0.8*cos(0.6))*cos(t)', '(2 + 0.8*cos(0.6))*sin(t)', '0.8*sin(0.6)'], t: [0.3, 0.75], color: 'gold', width: 3 }, { param: ['(2 + 0.8*cos(1.1))*cos(t)', '(2 + 0.8*cos(1.1))*sin(t)', '0.8*sin(1.1)'], t: [0.3, 0.75], color: 'gold', width: 3 }, { param: ['(2 + 0.8*cos(t))*cos(0.3)', '(2 + 0.8*cos(t))*sin(0.3)', '0.8*sin(t)'], t: [0.6, 1.1], color: 'gold', width: 3 }, { param: ['(2 + 0.8*cos(t))*cos(0.75)', '(2 + 0.8*cos(t))*sin(0.75)', '0.8*sin(t)'], t: [0.6, 1.1], color: 'gold', width: 3 }] }, caption: t`A coordinate patch (gold) on a torus with $R = 2$, $r = 0.8$. Its $u$-sides are longer on the outside of the torus than on the inside, so equal coordinate rectangles have unequal areas.` },
    steps: [
      { label: 'The metric', text: t`From C4.1: $E = (R + r\cos v)^2$, $F = 0$, $G = r^2$.` },
      { label: 'Area element', text: t`$\sqrt{EG - F^2} = r(R + r\cos v)$. It depends on $v$: a patch on the outside ($\cos v > 0$) is bigger than the same coordinate patch inside.` },
      { label: 'Integrate', text: t`$A = \int_0^{2\pi}\!\!\int_0^{2\pi} r(R + r\cos v)\,dv\,du = 2\pi\cdot r\,(2\pi R + 0) = 4\pi^2 Rr$. The $\cos v$ term integrates to zero: the outside’s surplus exactly pays for the inside’s shortfall.` },
      { label: 'Numbers', text: t`$R = 4$ m, $r = 1$ m: $A = 4\pi^2 \times 4 \times 1 = 157.9\ \text{m}^2$ of skin.` },
      { label: 'Sense check', text: t`$4\pi^2Rr = (2\pi r)(2\pi R)$: the tube’s circumference times the length of its centre circle — the area of the cylinder you would get by cutting the torus and straightening it (Pappus’s theorem).` },
    ],
    answer: t`$A = 4\pi^2Rr$, which is $157.9\ \text{m}^2$ for $R = 4$ m, $r = 1$ m.`,
  },
  practice: [
    num({
      id: 'helix-length', difficulty: 2,
      gen(r) {
        const a = r.pick([1.5, 1.8, 2, 2.5]), h = r.pick([2, 2.5, 3]);
        const L = Math.hypot(2 * Math.PI * a, h);
        return {
          prompt: t`A spiral walkway climbs round a cylindrical propellant storage tank of radius $a = ${a}$ m, rising $h = ${h}$ m per turn. In coordinates $(\varphi, z)$ the cylinder’s metric is $ds^2 = a^2\,d\varphi^2 + dz^2$, and the walkway’s centre line is $\varphi = t$, $z = ht/(2\pi)$. How long is one turn, in metres?`,
          visual: { type: 'surface3d', params: { surface: [`${a}*cos(u)`, `${a}*sin(u)`, 'v'], domain: [[0, TAU], [0, r6(4 * h)]], alpha: 0.45, pitch: 0.2, dist: r6(6.5 * h), target: [0, 0, r6(2 * h)], axes: false, curves: [{ param: [`${a}*cos(t)`, `${a}*sin(t)`, `${r6(h / (2 * Math.PI))}*t`], t: [0, r6(8 * Math.PI)], color: 'gold', width: 3 }] }, caption: 'Four turns of the walkway on the tank wall, to scale.' },
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI * a, feedback: t`That is one turn round the circle with no climb. The $z$-motion adds $dz^2$ to $ds^2$.` }, { value: 2 * Math.PI * a + h, feedback: t`Lengths do not add like that: the speeds combine as $\sqrt{a^2\varphi'^2 + z'^2}$ — Pythagoras.` }].filter((e) => Math.abs(e.value - L) > 0.012 * L),
          hints: [t`Along the line $\varphi' = 1$ and $z' = h/(2\pi)$, so the speed is $\sqrt{a^2 + h^2/(4\pi^2)}$ — constant.`, t`One turn is $0 \le t \le 2\pi$: multiply the speed by $2\pi$.`],
          teach: t`Length is the integral of the speed $\sqrt{E\,u'^2 + 2F\,u'v' + G\,v'^2}$ along the curve.`,
          explain: t`$\ell = 2\pi\sqrt{a^2 + h^2/(4\pi^2)} = \sqrt{(2\pi a)^2 + h^2} = ${nice(L, 4)}\ \text{m}$. Unrolled, one turn is the hypotenuse of a right triangle with legs $2\pi a$ and $h$ — the cylinder’s metric is the flat one, which C4.3 makes precise.`,
        };
      },
    }),
    num({
      id: 'saddle-angle', difficulty: 2,
      gen(r) {
        const [u0, v0] = r.pick([[1, 0], [1, 1], [0.5, -1], [-1, 1.5], [1.5, 0.5]]);
        const [A, B] = r.pick([[[1, 0], [1, 1]], [[1, 0], [0, 1]], [[1, 1], [1, -1]], [[2, 1], [0, 1]]]);
        const fm = forms(saddle(1), u0, v0), ang = angleI(fm, A, B) / DEG;
        const flat = Math.acos((A[0] * B[0] + A[1] * B[1]) / (Math.hypot(...A) * Math.hypot(...B))) / DEG;
        const P = [u0, v0, u0 * v0], va = [A[0], A[1], v0 * A[0] + u0 * A[1]], vb = [B[0], B[1], v0 * B[0] + u0 * B[1]];
        const cf = (c, X) => (c === 1 ? X : c === -1 ? `-${X}` : `${c}${X}`);
        const vt = (w) => (w[0] === 0 ? cf(w[1], t`\mathbf X_v`) : `${cf(w[0], t`\mathbf X_u`)} ${w[1] < 0 ? '-' : '+'} ${cf(Math.abs(w[1]), t`\mathbf X_v`)}`);
        return {
          prompt: t`On the saddle $\mathbf X(u, v) = (u, v, uv)$ at $(u, v) = (${u0}, ${v0})$, what angle do the tangent vectors $\mathbf a = ${vt(A)}$ and $\mathbf b = ${vt(B)}$ make, in degrees?`,
          visual: { type: 'calc-vectors3d', params: { range: 2.3, grid: false, yaw: -0.8, pitch: 0.5, curves: mesh((u, v) => [`${u}`, `${v}`, `${u}*${v}`], [-1.5, 1.5], [-1.5, 1.5], { nu: 8, nv: 8 }), points: [{ at: P, color: 'gold', label: 'p' }], vectors: [{ from: P, to: P.map((x, i) => r6(x + 0.6 * va[i])), color: 'accent', label: t`\mathbf a` }, { from: P, to: P.map((x, i) => r6(x + 0.6 * vb[i])), color: 'violet', label: t`\mathbf b` }] }, caption: t`The saddle $z = uv$ over $|u|, |v| \le 1.5$, with $\mathbf a$ and $\mathbf b$ drawn at 0.6 of their length.` },
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: Math.abs(flat - ang) > 0.02 * ang ? [{ value: flat, feedback: t`That is the angle between $(${A.join(', ')})$ and $(${B.join(', ')})$ drawn on the flat $(u, v)$ map. On the surface, use $E$, $F$, $G$ in the dot product.` }] : [],
          hints: [t`At the point, $E = 1 + v^2 = ${nice(fm.E)}$, $F = uv = ${nice(fm.F)}$, $G = 1 + u^2 = ${nice(fm.G)}$.`, t`$\mathrm I(\mathbf a, \mathbf b) = Ea^1b^1 + F(a^1b^2 + a^2b^1) + Ga^2b^2$; then $\cos\theta = \mathrm I(\mathbf a, \mathbf b)/\sqrt{\mathrm I(\mathbf a, \mathbf a)\,\mathrm I(\mathbf b, \mathbf b)}$.`],
          teach: 'Angles between tangent vectors come from the metric’s dot product, not from the coordinate map.',
          explain: t`With $E = ${nice(fm.E)}$, $F = ${nice(fm.F)}$, $G = ${nice(fm.G)}$, the metric gives $\cos\theta = ${nice(Math.cos(ang * DEG), 4)}$, so $\theta = ${nice(ang, 4)}^\circ$. Check in space: $\mathbf a = (${va.join(', ')})$ and $\mathbf b = (${vb.join(', ')})$ give the same angle by the ordinary dot product.`,
        };
      },
    }),
    num({
      id: 'zone-area', difficulty: 3,
      gen(r) {
        const [name, l1, l2] = r.pick([['between the tropics', -23.44, 23.44], ['north of the Arctic Circle', 66.56, 90], ['in the northern temperate zone, between the Tropic of Cancer and the Arctic Circle', 23.44, 66.56], ['between latitudes $30^\\circ$S and $30^\\circ$N', -30, 30], ['north of $60^\\circ$N', 60, 90]]);
        const f = 100 * (Math.sin(l2 * DEG) - Math.sin(l1 * DEG)) / 2, naive = (100 * (l2 - l1)) / 180;
        return {
          prompt: t`In latitude $\lambda$ and longitude $\varphi$ the Earth’s metric is $R^2\,d\lambda^2 + R^2\cos^2\lambda\,d\varphi^2$. What percentage of the Earth’s surface lies ${name} (from $${l1}^\circ$ to $${l2}^\circ$)?`,
          visual: { type: 'surface3d', params: { surface: SPH, domain: [[0, TAU], [0.01, 3.13]], alpha: 0.55, pitch: 0.3, dist: 4.2, axes: false, curves: [lat(l1), lat(l2)] }, caption: 'The Earth as a sphere, with the two bounding latitudes in gold.' },
          answer: f, tol: { rel: 0.01 },
          errors: [{ value: naive, feedback: t`That shares the area out in proportion to latitude, as a map with evenly spaced parallels would. Near the poles the parallels are short: the area element is $R^2\cos\lambda\,d\lambda\,d\varphi$.` }].filter((e) => Math.abs(e.value - f) > 0.02 * f),
          hints: [t`$\sqrt{EG - F^2} = R^2\cos\lambda$, so $A = \int_0^{2\pi}\!\!\int_{\lambda_1}^{\lambda_2} R^2\cos\lambda\,d\lambda\,d\varphi$.`, t`That is $2\pi R^2(\sin\lambda_2 - \sin\lambda_1)$; divide by $4\pi R^2$ and multiply by 100.`],
          teach: t`On a sphere the area between two latitudes is $2\pi R^2(\sin\lambda_2 - \sin\lambda_1)$ — proportional to the height between them.`,
          explain: t`$\dfrac{\sin ${l2}^\circ - \sin(${l1}^\circ)}{2}\times 100 = ${nice(f, 3)}\%$. Archimedes knew this as the hat-box theorem: a band of the sphere has the same area as the band of the circumscribed cylinder at the same heights.`,
        };
      },
    }),
    expr({
      id: 'torus-curve-speed', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 3]), rr = r.pick([0.5, 1]), p = r.pick([1, 2]), q = r.pick([2, 3]);
        const ans = `sqrt(${p * p}(${R} + ${rr}cos(${q}t))^2 + ${q * q * rr * rr})`;
        return {
          prompt: t`On the torus with $R = ${R}$, $r = ${rr}$ ($E = (R + r\cos v)^2$, $F = 0$, $G = r^2$), a curve winds as $u = ${p === 1 ? '' : p}t$, $v = ${q}t$. Find its speed $|\gamma'(t)|$ as a function of $t$.`,
          visual: { type: 'surface3d', params: { surface: TOR(R, rr), domain: [[0, TAU], [0, TAU]], alpha: 0.45, pitch: 0.6, dist: r6(2.8 * (R + rr)), curves: [{ param: [`(${R} + ${rr}*cos(${q}*t))*cos(${p}*t)`, `(${R} + ${rr}*cos(${q}*t))*sin(${p}*t)`, `${rr}*sin(${q}*t)`], t: [0, TAU], color: 'gold', width: 2.6 }] }, caption: t`The curve for $0 \le t \le 2\pi$: it goes ${p === 1 ? 'once' : 'twice'} round the axis and ${q === 2 ? 'twice' : 'three times'} round the tube.` },
          answer: ans, answerTeX: t`\sqrt{${p * p === 1 ? '' : p * p}(${R} + ${rr === 1 ? '' : rr}\cos ${q}t)^2 + ${q * q * rr * rr}}`, vars: { t: [0, 6] }, lhs: t`|\gamma'(t)|`,
          errors: [
            { answer: `sqrt((${R} + ${rr}cos(${q}t))^2 + ${rr * rr})`, feedback: t`Multiply by the rates: the speed squared is $E\,u'^2 + G\,v'^2$ with $u' = ${p}$ and $v' = ${q}$.` },
            { answer: `${p * p}(${R} + ${rr}cos(${q}t))^2 + ${q * q * rr * rr}`, feedback: 'That is the speed squared. Take the square root.' },
          ],
          hints: [t`$u' = ${p}$ and $v' = ${q}$; evaluate $E$ at $v = ${q}t$.`, t`$|\gamma'|^2 = E\,u'^2 + G\,v'^2 = (${R} + ${rr === 1 ? '' : rr}\cos ${q}t)^2\cdot ${p * p} + ${rr * rr}\cdot ${q * q}$.`],
          teach: 'Along a curve, the speed is the square root of the first fundamental form evaluated on (u′, v′).',
          explain: t`$|\gamma'| = \sqrt{${p * p}(${R} + ${rr === 1 ? '' : rr}\cos ${q}t)^2 + ${q * q * rr * rr}}$. It is fastest on the outside of the torus. Its integral over $[0, 2\pi]$ — the curve’s length — has no elementary form; a computer gives it in a moment.`,
        };
      },
    }),
    mcq({
      id: 'area-element', difficulty: 2,
      prompt: t`Why is the area element $\sqrt{EG - F^2}\,du\,dv$, and not $\sqrt{EG}\,du\,dv$?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, grid: false, axes: false, pitch: 1.25, vectors: [{ from: [0, 0, 0], to: [1.3, 0, 0], color: 'accent', label: t`\mathbf X_u\,du` }, { from: [0, 0, 0], to: [0.8, 0.9, 0], color: 'violet', label: t`\mathbf X_v\,dv` }], parallelograms: [{ at: [0, 0, 0], u: [1.3, 0, 0], v: [0.8, 0.9, 0], color: 'gold', alpha: 0.3 }] }, caption: 'The small coordinate rectangle becomes a slanted parallelogram on the surface.' },
      choices: [
        t`The patch is a parallelogram with sides $|\mathbf X_u|du$ and $|\mathbf X_v|dv$ at an angle $\theta$; its area is $|\mathbf X_u||\mathbf X_v|\sin\theta\,du\,dv$, and $|\mathbf X_u|^2|\mathbf X_v|^2\sin^2\theta = EG - F^2$`,
        t`$F^2$ corrects for the surface bending out of the tangent plane`,
        t`$\sqrt{EG}$ would be right; the $F^2$ is a convention that makes the formula symmetric`,
        t`$EG - F^2$ is the determinant of the metric, and determinants are always subtracted`,
      ],
      answer: 0,
      why: {
        1: t`Bending is normal data; $E$, $F$, $G$ know nothing of it. $F$ records the slant *within* the tangent plane.`,
        2: t`$\sqrt{EG}$ is right only when $F = 0$ (orthogonal coordinates). For slanted coordinate curves it overcounts: it treats the parallelogram as a rectangle.`,
        3: t`It is the determinant, but that is the conclusion, not the reason. The reason is the parallelogram’s $\sin\theta$.`,
      },
      hints: [t`$F = |\mathbf X_u||\mathbf X_v|\cos\theta$, so $F^2 = EG\cos^2\theta$.`],
      teach: t`$\sqrt{EG - F^2} = |\mathbf X_u\times\mathbf X_v|$: the area of the parallelogram spanned by the coordinate velocities.`,
      explain: t`$EG - F^2 = EG(1 - \cos^2\theta) = EG\sin^2\theta = |\mathbf X_u\times\mathbf X_v|^2$ (Lagrange’s identity). In index notation it is $\det g$, and the area element is $\sqrt{\det g}\,d^2x$ — the pattern of $\sqrt{|g|}\,d^4x$ in GR.`,
    }),
    num({
      id: 'catenoid-band', difficulty: 3,
      gen(r) {
        const c = r.pick([1, 2]), h = r.pick([0.5, 1, 1.5]) * c;
        const A = 2 * Math.PI * c * (h + (c / 2) * Math.sinh((2 * h) / c));
        return {
          prompt: t`A soap film between two rings of radius $${nice(c * Math.cosh(h / c), 3)}$ cm, $${nice(2 * h)}$ cm apart, is the catenoid $\big(${c}\cosh(v/${c})\cos u,\ ${c}\cosh(v/${c})\sin u,\ v\big)$ for $|v| \le ${nice(h)}$, with $E = ${c * c}\cosh^2(v/${c})$, $F = 0$, $G = \cosh^2(v/${c})$. What is the area of the film (one side), in cm²?`,
          visual: { type: 'surface3d', params: { surface: [`${c}*cosh(v/${c})*cos(u)`, `${c}*cosh(v/${c})*sin(u)`, 'v'], domain: [[0, TAU], [-h, h]], alpha: 0.7, pitch: 0.2, dist: r6(7 * c + 3 * h), axes: false, curves: [{ param: [`${r6(c * Math.cosh(h / c))}*cos(t)`, `${r6(c * Math.cosh(h / c))}*sin(t)`, `${h}`], t: [0, TAU], color: 'gold', width: 3 }, { param: [`${r6(c * Math.cosh(h / c))}*cos(t)`, `${r6(c * Math.cosh(h / c))}*sin(t)`, `${-h}`], t: [0, TAU], color: 'gold', width: 3 }] }, caption: 'The film and its two wire rings (gold).' },
          answer: A, units: 'cm^2', tol: { rel: 0.005 },
          integrand: `2*pi*${c}*cosh(v/${c})^2`, limits: [-h, h], vars: { v: [-h, h] },
          errors: [{ value: 2 * Math.PI * c * 2 * h, feedback: t`That is a cylinder of the neck’s radius. The film flares out: the area element is $\sqrt{EG} = ${c}\cosh^2(v/${c})$, not ${c}.` }, { value: 2 * Math.PI * c * c * (h + (c / 2) * Math.sinh((2 * h) / c)), feedback: t`$\sqrt{EG} = \sqrt{${c * c}\cosh^4(v/${c})} = ${c}\cosh^2(v/${c})$ — one factor of ${c}, not two.` }].filter((e) => Math.abs(e.value - A) > 0.02 * A),
          hints: [t`$dA = \sqrt{EG}\,du\,dv = ${c}\cosh^2(v/${c})\,du\,dv$. The $u$-integral gives $2\pi$.`, t`$\int\cosh^2(v/c)\,dv = \tfrac v2 + \tfrac c4\sinh(2v/c)$.`],
          teach: t`Area is $\iint\sqrt{EG - F^2}\,du\,dv$; on a surface of revolution the $u$-integral is just $2\pi$.`,
          explain: t`$A = 2\pi\cdot${c}\int_{-${nice(h)}}^{${nice(h)}}\cosh^2(v/${c})\,dv = 2\pi\cdot ${c}\,\big(${nice(h)} + \tfrac{${c}}{2}\sinh ${nice((2 * h) / c)}\big) = ${nice(A, 4)}\ \text{cm}^2$. Among all surfaces spanning the two rings near this one, the catenoid has the least area — that is why the film chooses it (C5.3 shows its mean curvature is zero).`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-coverage', difficulty: 3, transfer: true,
      gen(r) {
        const [name, h] = r.pick([['the International Space Station', 420], ['an Iridium satellite', 780], ['a GPS satellite', 20200], ['a geostationary satellite', 35786]]);
        const R = R_EARTH, cosPsi = R / (R + h), psi = Math.acos(cosPsi), f = 100 * (1 - cosPsi) / 2;
        const flat = 100 * (Math.PI * (R * psi) ** 2) / (4 * Math.PI * R * R);
        const sx = r6((R + h) / R), tx = r6(cosPsi), ty = r6(Math.sin(psi));
        return {
          prompt: t`From altitude $h = ${h}$ km, ${name} sees the cap of the Earth inside its horizon: the cap of angular radius $\psi$ with $\cos\psi = R/(R + h)$, where $R = 6371$ km. What percentage of the Earth’s surface is that? (The area element on the sphere, in colatitude about the sub-satellite point, is $R^2\sin\theta\,d\theta\,d\varphi$.)`,
          visual: { type: 'calc-vectors3d', params: { range: Math.max(1.4, sx * 1.05), grid: false, axes: false, yaw: 0.2, pitch: 0.15, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink4' }], points: [{ at: [0, 0, sx], color: 'gold', label: 'sat' }], segments: [{ from: [0, 0, sx], to: [ty, 0, tx], color: 'gold' }, { from: [0, 0, sx], to: [-ty, 0, tx], color: 'gold' }], curves: [{ param: [`${ty}*cos(t)`, `${ty}*sin(t)`, `${tx}`], t: [0, TAU], color: 'teal', width: 2.6 }] }, caption: 'The Earth (radius 1) and the satellite, to scale; gold lines graze the horizon, and the teal circle bounds the visible cap.' },
          answer: f, tol: { rel: 0.01 },
          errors: [{ value: flat, feedback: t`That treats the cap as a flat disc of radius $R\psi$. On a sphere a cap’s area is less than $\pi(R\psi)^2$: integrate $R^2\sin\theta$.` }, { value: f * 2, feedback: t`The whole sphere is $4\pi R^2$, and the cap $2\pi R^2(1 - \cos\psi)$: the fraction is $(1 - \cos\psi)/2$.` }].filter((e) => Math.abs(e.value - f) > 0.02 * f),
          hints: [t`$A = \int_0^{2\pi}\!\!\int_0^{\psi} R^2\sin\theta\,d\theta\,d\varphi = 2\pi R^2(1 - \cos\psi)$.`, t`Here $\cos\psi = ${nice(cosPsi, 4)}$. Divide by $4\pi R^2$.`],
          teach: t`A spherical cap of angular radius $\psi$ has area $2\pi R^2(1 - \cos\psi)$.`,
          explain: t`Fraction $= (1 - \cos\psi)/2 = (1 - ${nice(cosPsi, 4)})/2 = ${nice(f, 3)}\%$ ($\psi = ${nice(psi / DEG, 3)}^\circ$). Even from geostationary orbit you see well under half the Earth, which is why three such satellites are the minimum for global coverage, and polar regions are missed anyway.`,
        };
      },
    }),
    num({
      id: 'cp-crossing', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 3, 4]), rr = r.pick([0.5, 1]), v0deg = r.pick([0, 90, 180]);
        const fm = forms(torus(R, rr), 0, v0deg * DEG), ang = angleI(fm, [1, 1], [1, 0]) / DEG;
        return {
          prompt: t`On the torus with $R = ${R}$, $r = ${rr}$, the curve $u = t$, $v = t$ crosses the $u$-circle $v = ${v0deg}^\circ$. At what angle does it cross it, in degrees?`,
          visual: { type: 'surface3d', params: { surface: TOR(R, rr), domain: [[0, TAU], [0, TAU]], alpha: 0.45, pitch: 0.6, dist: r6(2.8 * (R + rr)), curves: [{ param: [`(${R} + ${rr}*cos(t))*cos(t)`, `(${R} + ${rr}*cos(t))*sin(t)`, `${rr}*sin(t)`], t: [0, TAU], color: 'gold', width: 2.6 }, { param: [`(${R} + ${rr}*cos(${r6(v0deg * DEG)}))*cos(t)`, `(${R} + ${rr}*cos(${r6(v0deg * DEG)}))*sin(t)`, `${rr}*sin(${r6(v0deg * DEG)})`], t: [0, TAU], color: 'accent', width: 2.2 }] }, caption: t`The curve $u = v$ (gold) and the circle $v = ${v0deg}^\circ$ (blue).` },
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 45, feedback: t`On the $(u, v)$ map the line $u = v$ makes $45^\circ$ with the $u$-direction, but the torus stretches $u$ by $\sqrt E$ and $v$ by $\sqrt G$.` }].filter((e) => Math.abs(e.value - ang) > 0.02 * ang),
          hints: [t`The curve’s velocity is $(1, 1)$ and the circle’s is $(1, 0)$, in components along $\mathbf X_u$, $\mathbf X_v$.`, t`With $F = 0$: $\cos\alpha = \dfrac{E}{\sqrt E\,\sqrt{E + G}} = \sqrt{\dfrac{E}{E + G}}$, where $E = (R + r\cos v)^2$ and $G = r^2$.`],
          teach: 'An angle on a surface uses the metric; equal coordinate steps are not equal lengths.',
          explain: t`At $v = ${v0deg}^\circ$, $E = ${nice(fm.E, 4)}$ and $G = ${nice(fm.G, 4)}$, so $\cos\alpha = \sqrt{${nice(fm.E, 4)}/${nice(fm.E + fm.G, 4)}}$ and $\alpha = ${nice(ang, 4)}^\circ$. The curve crosses the outer equator at a shallower angle than the inner one, because there a unit of $u$ is longer.`,
        };
      },
    }),
    mcq({
      id: 'cp-equal-area', difficulty: 3, transfer: true,
      prompt: t`A cylindrical map of the Earth plots longitude $\varphi$ across and some function $y(\lambda)$ of latitude up. On the sphere $dA = R^2\cos\lambda\,d\lambda\,d\varphi$; on the map $dA_{\text{map}} = R^2\,dy\,d\varphi$. Which choice of $y$ makes the map **equal-area** — every region drawn with its true area?`,
      visual: { type: 'surface3d', params: { surface: ['sin(v)*cos(u)', 'sin(v)*sin(u)', 'cos(v)'], domain: [[0, TAU], [0.01, 3.13]], alpha: 0.5, pitch: 0.12, dist: 6.5, axes: false, curves: [{ param: ['cos(t)', 'sin(t)', '1'], t: [0, TAU], color: 'ink3', width: 1.4 }, { param: ['cos(t)', 'sin(t)', '-1'], t: [0, TAU], color: 'ink3', width: 1.4 }, { param: ['1', '0', 't'], t: [-1, 1], color: 'ink3', width: 1.4 }, { param: ['-1', '0', 't'], t: [-1, 1], color: 'ink3', width: 1.4 }, { param: ['cos(t)', 'sin(t)', '0.5'], t: [0, TAU], color: 'gold', width: 2.4 }, { param: ['cos(t)', 'sin(t)', '0.8'], t: [0, TAU], color: 'gold', width: 2.4 }, { param: [`${r6(Math.sqrt(0.75))}*cos(t)`, `${r6(Math.sqrt(0.75))}*sin(t)`, '0.5'], t: [0, TAU], color: 'violet', width: 2.4 }, { param: ['0.6*cos(t)', '0.6*sin(t)', '0.8'], t: [0, TAU], color: 'violet', width: 2.4 }] }, caption: 'A sphere in the cylinder that touches it at the equator (grey outline). Gold: a band of the cylinder; violet: the band of the sphere at the same heights.' },
      choices: [t`$y = \sin\lambda$`, t`$y = \lambda$`, t`$y = \ln\tan(\tfrac\pi4 + \tfrac\lambda2)$`, t`$y = \tan\lambda$`],
      answer: 0,
      why: {
        1: t`$y = \lambda$ is the plain latitude–longitude grid (equirectangular). It draws every band of latitude with the same height, so polar regions are inflated by $1/\cos\lambda$.`,
        2: t`That is Mercator: $dy = d\lambda/\cos\lambda$, which preserves *angles* and inflates areas by $1/\cos^2\lambda$ — Greenland looks the size of Africa.`,
        3: t`$dy = d\lambda/\cos^2\lambda$: the map from the centre of the Earth onto the cylinder. It inflates areas even faster toward the poles.`,
      },
      hints: [t`Equal area needs $R^2\,dy\,d\varphi = R^2\cos\lambda\,d\lambda\,d\varphi$, i.e. $dy/d\lambda = \cos\lambda$.`, 'Integrate.'],
      teach: 'An equal-area map needs its own area element to equal the sphere’s, √(EG − F²) du dv.',
      explain: t`$dy = \cos\lambda\,d\lambda$ gives $y = \sin\lambda$: project each point horizontally onto the touching cylinder. This is Lambert’s cylindrical equal-area projection — Archimedes’ hat-box theorem made into a map. It keeps areas but squashes shapes near the poles; C4.3 shows no map can keep both.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §2-5', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §6.1–6.4', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
