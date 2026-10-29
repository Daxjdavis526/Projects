// Gauss's Theorema Egregium: K, defined with the normal, depends only on
// E, F, G and their derivatives. The orthogonal-coordinate formula (and its
// special cases −f″/f and −Δ ln λ / λ²), Brioschi's in general; consequences:
// no isometric flat map, the pizza slice, curvature without an embedding.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';
import { R_EARTH, R_MOON } from './_surf.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);

export default lesson({
  id: 'st-c.C6.1',
  title: 'Gauss’s Theorema Egregium',
  minutes: 14, difficulty: 4,
  equation: t`K = -\frac{1}{2\sqrt{EG}}\left[\frac{\partial}{\partial u}\!\left(\frac{G_u}{\sqrt{EG}}\right) + \frac{\partial}{\partial v}\!\left(\frac{E_v}{\sqrt{EG}}\right)\right]`,
  intro: t`In C5.3, $K = (LN - M^2)/(EG - F^2)$ was built from the normal. In 1827 Gauss proved that the normal can be eliminated: **$K$ is a function of $E$, $F$, $G$ and their first and second derivatives alone.** He called it the *Theorema Egregium* — the “remarkable theorem”. For orthogonal coordinates ($F = 0$) the result is the formula above; for $F \ne 0$ the general version is Brioschi’s formula, a ratio of $3\times3$ determinants of the same ingredients.

Two special cases are worth knowing by heart:

- $ds^2 = du^2 + f(u)^2\,dv^2$ gives $K = -f''/f$;
- $ds^2 = \lambda(u, v)^2(du^2 + dv^2)$ (conformal) gives $K = -\Delta(\ln\lambda)/\lambda^2$, with $\Delta = \partial_u^2 + \partial_v^2$.

The consequence: **an isometry preserves $K$**. That is why C5.4’s ant could measure it, and why no map of the Earth can keep every distance.`,
  symbols: [
    { tex: 'K', text: t`the Gaussian curvature, in $\text{m}^{-2}$` },
    { tex: 'E,\\ G', text: t`the first fundamental form in orthogonal coordinates ($F = 0$)` },
    { tex: 'E_v,\\ G_u', text: t`partial derivatives: $\partial E/\partial v$ and $\partial G/\partial u$` },
    { tex: t`\sqrt{EG}`, text: t`the area element $\sqrt{EG - F^2}$ with $F = 0$` },
  ],
  why: t`This is the theorem that makes general relativity possible: curvature can live in the metric alone, with no space to bend into. The Riemann tensor of C15 is the higher-dimensional heir of this $K$; on a surface it has one component, $R_{1212} = K(EG - F^2)$, and the Ricci scalar is $R = 2K$.`,
  visual: {
    type: 'gr-surface',
    title: 'Curvature from the metric alone',
    lead: t`Each surface here is described to the computer only by its metric $ds^2 = \rho(v)^2\,du^2 + h(v)\,dv^2$. From that alone it computes the Christoffel symbols and $K$ at $P$ — and colours the surface by $K$. The 3D shape is drawn only for you to look at.`,
    tasks: [
      t`Sphere: $K = 1$ wherever you put $P$. Cylinder and cone: $K = 0$ everywhere (teal) — both unroll flat.`,
      t`Torus: slide $P$ round the tube. $K$ goes from $+\tfrac13$ on the outside to $-1$ on the inside, the values C5.3 found with the normal.`,
      t`Catenoid: $K < 0$, strongest at the neck — the same as the helicoid at matching points, since their metrics agree (C4.3).`,
    ],
    params: { mode: 'basis', surface: 'torus', surfaces: ['sphere', 'torus', 'cylinder', 'cone', 'catenoid'], pos: 0.5 },
    caption: t`Unit sphere; torus $R = 2$, $r = 1$; unit cylinder; cone of half-angle $30^\circ$; catenoid with neck radius 1. Colour: gold $K > 0$, teal $K = 0$, blue $K < 0$. The arrows are the coordinate basis vectors (not unit vectors).`,
  },
  example: {
    prompt: t`Compute $K$ for the torus from its metric $ds^2 = (R + r\cos v)^2\,du^2 + r^2\,dv^2$ alone, and compare with C5.3’s $\cos v/\big(r(R + r\cos v)\big)$.`,
    visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'torus', v: 2.2, controls: false }, caption: 'The torus with P on its inner half, where K < 0; the readout is computed from the metric alone.' },
    steps: [
      { label: 'Ingredients', text: t`$E = (R + r\cos v)^2$, $G = r^2$, $F = 0$. So $\sqrt{EG} = r(R + r\cos v)$, $G_u = 0$, and $E_v = -2r\sin v\,(R + r\cos v)$.` },
      { label: 'The u-term', text: t`$G_u = 0$, so $\partial_u\big(G_u/\sqrt{EG}\big) = 0$.` },
      { label: 'The v-term', text: t`$E_v/\sqrt{EG} = -2r\sin v\,(R + r\cos v)/\big(r(R + r\cos v)\big) = -2\sin v$, whose $v$-derivative is $-2\cos v$.` },
      { label: 'Assemble', text: t`$K = -\dfrac{1}{2r(R + r\cos v)}\,(0 - 2\cos v) = \dfrac{\cos v}{r(R + r\cos v)}$.` },
      { label: 'Compare', text: t`Identical to the extrinsic result $(LN - M^2)/(EG - F^2)$ — but no normal, no second derivatives of $\mathbf X$, no surrounding space were used. An inhabitant who knows only distances on the torus gets the same $K$.` },
    ],
    answer: t`$K = \cos v/\big(r(R + r\cos v)\big)$, from the metric alone, in agreement with C5.3.`,
  },
  practice: [
    mcq({
      id: 'statement', difficulty: 1,
      prompt: 'What exactly does the Theorema Egregium say?',
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'catenoid', controls: false, readout: false }, caption: 'A catenoid coloured by K computed from its metric alone.' },
      choices: [
        t`$K$ can be computed from $E$, $F$, $G$ and their derivatives, so isometric surfaces have equal $K$ at matching points`,
        t`$K$ and $H$ can both be computed from $E$, $F$, $G$`,
        t`Every surface is isometric to a plane, a sphere or a saddle`,
        t`$K$ depends only on the normal $\mathbf n$`,
      ],
      answer: 0,
      why: {
        1: t`$H$ cannot: a sheet and a cylinder have the same metric and different $H$ (C5.4).`,
        2: t`Only surfaces of *constant* $K$ are locally isometric to one of these (Minding’s theorem); most surfaces have varying $K$.`,
        3: t`That was the definition, $K = \kappa_1\kappa_2$. The surprise is that the normal is not needed.`,
      },
      hints: [t`Egregium is about which data are enough to compute $K$.`],
      teach: 'Gauss’s theorem: the Gaussian curvature is intrinsic — determined by the metric.',
      explain: t`$K$ is a function of $E$, $F$, $G$ and their first and second derivatives. Since an isometry preserves those, it preserves $K$ — the property behind every consequence in this lesson.`,
    }),
    num({
      id: 'f-metric', difficulty: 2,
      gen(r) {
        const [fT, f, K, u0, dom] = r.pick([
          [t`3\sin(u/3)`, '3*sin(x/3)', () => 1 / 9, 2, [0.05, 9]],
          [t`\cosh u`, 'cosh(x)', () => -1, 0.5, [-2, 2]],
          [t`1 + u^2`, '1 + x^2', (u) => -2 / (1 + u * u), 1, [-2, 2]],
          [t`e^{2u}`, 'e^(2*x)', () => -4, 0.3, [-1.5, 1]],
          [t`\sqrt u`, 'sqrt(x)', (u) => 1 / (4 * u * u), 0.5, [0.02, 3]],
        ]);
        const Kv = K(u0);
        return {
          prompt: t`A surface has metric $ds^2 = du^2 + f(u)^2\,dv^2$ with $f(u) = ${fT}$. Using $K = -f''/f$, what is $K$ at $u = ${u0}$?`,
          visual: { type: 'graph', params: { x: dom, y: [0, f === 'e^(2*x)' ? 8 : f === '1 + x^2' ? 5 : 4], xlabel: 'u', ylabel: 'f(u)', curves: [{ fn: f, color: 'accent', width: 2.4 }], vlines: [{ x: u0, color: 'gold' }] }, caption: t`The function $f$: the $v$-circle at distance $u$ has circumference $2\pi f(u)$ (if $v$ runs over $2\pi$). Its bending measures $K$.` },
          answer: Kv, tol: { rel: 0.01 },
          errors: [{ value: -Kv, feedback: t`Watch the sign: $K = -f''/f$. A sine-like $f$ (bending down) gives $K > 0$.` }].filter((e) => Math.abs(e.value - Kv) > 0.02 * Math.abs(Kv)),
          hints: [t`Differentiate $f$ twice with respect to $u$.`, t`Then evaluate $-f''(u)/f(u)$ at $u = ${u0}$.`],
          teach: t`For $ds^2 = du^2 + f(u)^2\,dv^2$, $K = -f''/f$: curvature is how the circles’ circumference bends as you move out.`,
          explain: t`$K(${u0}) = ${nice(Kv, 4)}$. Concave $f$ (circles growing more slowly than linearly) means $K > 0$; convex $f$ means $K < 0$. PHYS 3710 R0.3 uses this formula for the spatial slices of curved spacetimes.`,
        };
      },
    }),
    num({
      id: 'stereo', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 5]), x = r.pick([0, 1, 2]), y = r.pick([0.5, 1]);
        const lam = (2 * a * a) / (a * a + x * x + y * y), lap = (4 * a * a) / (a * a + x * x + y * y) ** 2;
        return {
          prompt: t`Stereographic projection maps a sphere of radius $a = ${a}$ onto a plane, with metric $ds^2 = \lambda^2(dx^2 + dy^2)$, $\lambda = \dfrac{2a^2}{a^2 + x^2 + y^2}$. Here $-\Delta\ln\lambda = \dfrac{4a^2}{(a^2 + x^2 + y^2)^2}$. Use $K = -\Delta(\ln\lambda)/\lambda^2$ to find $K$ at $(x, y) = (${x}, ${y})$.`,
          visual: { type: 'graph', params: { x: [-3 * a, 3 * a], y: [0, 2.2], xlabel: 'x (along the axis y = 0)', ylabel: 'λ', curves: [{ fn: `2*${a * a}/(${a * a} + x^2)`, color: 'accent', width: 2.4 }] }, caption: t`The scale factor $\lambda$ along the line $y = 0$ of the stereographic map: a map step near the centre is worth twice its length; far out, almost nothing — the whole sphere fits on the plane.` },
          answer: 1 / (a * a), tol: { rel: 0.01 },
          errors: [{ value: lap, feedback: t`Divide by $\lambda^2$: $K = -\Delta(\ln\lambda)/\lambda^2$.` }, { value: lam, feedback: t`$\lambda$ is the scale factor, not the curvature.` }].filter((e) => Math.abs(e.value - 1 / (a * a)) > 0.02 / (a * a)),
          hints: [t`At the point, $a^2 + x^2 + y^2 = ${nice(a * a + x * x + y * y)}$, so $\lambda = ${nice(lam, 4)}$ and $-\Delta\ln\lambda = ${nice(lap, 4)}$.`, t`$K = ${nice(lap, 4)}/${nice(lam * lam, 4)}$.`],
          teach: t`For a conformal metric $\lambda^2(dx^2 + dy^2)$, $K = -\Delta(\ln\lambda)/\lambda^2$.`,
          explain: t`$K = ${nice(lap, 4)}/${nice(lam * lam, 4)} = ${nice(1 / (a * a), 4)} = 1/a^2$ — the same at every point, as it must be for a sphere, though the map stretches different points very differently. The metric knows the sphere is round.`,
        };
      },
    }),
    num({
      id: 'helicoid-K', difficulty: 2,
      gen(r) {
        const v = r.pick([0, 0.5, 1, 1.5]);
        const K = -1 / Math.cosh(v) ** 4;
        return {
          prompt: t`The helicoid $(\sinh v\cos u,\ \sinh v\sin u,\ u)$ and the catenoid $(\cosh v\cos u,\ \cosh v\sin u,\ v)$ share the metric $ds^2 = \cosh^2 v\,(du^2 + dv^2)$ (C4.3). Use the conformal formula with $\lambda = \cosh v$ to find $K$ at $v = ${v}$.`,
          visual: { type: 'surface3d', params: { surface: ['sinh(v)*cos(u)', 'sinh(v)*sin(u)', 'u'], domain: [[-3.1416, 3.1416], [-1.6, 1.6]], alpha: 0.65, pitch: 0.3, dist: 10, curves: [{ param: [`${r6(Math.sinh(v))}*cos(t)`, `${r6(Math.sinh(v))}*sin(t)`, 't'], t: [-3.1416, 3.1416], color: 'gold', width: 3 }] }, caption: t`The helicoid, with the helix $v = ${v}$ in gold.` },
          answer: K, tol: { rel: 0.01 },
          errors: [{ value: -1 / Math.cosh(v) ** 2, feedback: t`$(\ln\cosh v)'' = 1/\cosh^2 v$; then divide by $\lambda^2 = \cosh^2 v$ as well.` }].filter((e) => Math.abs(e.value - K) > 0.02 * Math.abs(K)),
          hints: [t`$\ln\lambda = \ln\cosh v$; its second derivative is $\operatorname{sech}^2 v$ (there is no $u$-dependence).`, t`$K = -\operatorname{sech}^2 v/\cosh^2 v$.`],
          teach: 'Surfaces with the same metric have the same K at matching points — computed here without any normal.',
          explain: t`$K = -1/\cosh^4 ${v} = ${nice(K, 4)}$ on both surfaces, matching C5.3’s extrinsic $(LN - M^2)/(EG - F^2)$ for the catenoid. Their second fundamental forms differ completely (the helicoid has $L = N = 0$), yet $LN - M^2$ agrees: Gauss’s theorem at work.`,
        };
      },
    }),
    mcq({
      id: 'pizza', difficulty: 2,
      prompt: 'Why does folding a slice of pizza along its length stop the tip from drooping?',
      visual: { type: 'surface3d', params: { surface: ['u', 'v*0.9', '0.35*v^2'], domain: [[0, 3], [-1, 1]], alpha: 0.8, pitch: 0.45, yaw: -1.1, dist: 4.2, target: [1.5, 0, 0.15], axes: false }, caption: 'A slice folded into a trough: curved across, straight along. (A teaching cartoon; real pizza also stretches a little.)' },
      choices: [
        t`The slice is (nearly) unstretchable, so $K = \kappa_1\kappa_2$ stays $0$; with $\kappa_1 \ne 0$ across the fold, $\kappa_2$ along it must stay $0$ — no droop`,
        'Folding makes the crust thicker, so it is stiffer',
        t`Folding gives the slice positive curvature, like a dome, which resists bending`,
        t`Folding changes $K$ from 0 to negative, which is stiffer`,
      ],
      answer: 0,
      why: {
        1: 'The thickness barely changes. The effect is geometric: it works for a sheet of paper too.',
        2: t`It cannot: the slice started flat, $K = 0$, and bending without stretching keeps $K = 0$.`,
        3: t`$K$ stays $0$ — that is the whole point. To droop the slice would have to make $K \ne 0$, i.e. stretch.`,
      },
      hints: ['Folding is bending without stretching. Which curvature cannot change under bending?', t`If $\kappa_1 \ne 0$ across the fold and $\kappa_1\kappa_2 = 0$, what is $\kappa_2$?`],
      teach: 'An unstretchable sheet keeps K = 0, so curving it one way stiffens it against curving the other.',
      explain: t`Drooping along the slice would need $\kappa_2 \ne 0$ while $\kappa_1 \ne 0$, i.e. $K \ne 0$, which needs stretching. The same geometry stiffens corrugated sheet, carpenter’s tape measures and the fluted panels of rocket interstages.`,
    }),
    order({
      id: 'no-flat-map', difficulty: 3,
      prompt: 'Prove that no map of any region of the Earth onto a flat sheet preserves all distances. Order the steps.',
      visual: { type: 'ten-metric', params: { mode: 'chart', chart: 'sphere', readout: false, dragProbe: false, probe: [1, 1] }, caption: 'The latitude–longitude chart of the sphere: the unequal ellipses are its distortion.' },
      items: [
        'Suppose a map from a patch of the sphere to the plane preserved all distances: an isometry.',
        t`An isometry preserves $E$, $F$, $G$ in corresponding coordinates (C4.3).`,
        t`By the Theorema Egregium, $K$ is computed from $E$, $F$, $G$, so $K$ would be equal at corresponding points.`,
        t`But $K = 1/R^2$ on the sphere and $K = 0$ on the plane — a contradiction.`,
        'So every flat map of the Earth distorts some distances, however small the region.',
      ],
      hints: ['Assume the opposite and find a quantity that would have to match.', 'The quantity is the Gaussian curvature.'],
      teach: 'Isometries preserve K; a sphere and a plane have different K, so no flat map of a sphere is isometric.',
      explain: t`Cartographers can choose what to keep — angles (Mercator), areas (Lambert), distances from one point (azimuthal equidistant) — but never everything. Over a city the distortion is tiny, since $K\rho^2 \approx (10/6371)^2 \approx 2.5\times10^{-6}$; over a continent it is unavoidable.`,
    }),
    multi({
      id: 'preserve-K', difficulty: 2,
      prompt: t`Which of these maps between surfaces necessarily keep $K$ the same at corresponding points? Select every one.`,
      visual: { type: 'surface3d', params: { surface: ['cosh(v)*cos(u)', 'cosh(v)*sin(u)', 'v'], domain: [[0, TAU], [-1.2, 1.2]], alpha: 0.7, pitch: 0.25, dist: 8 }, caption: 'A catenoid: bend it into a helicoid and K is unchanged.' },
      choices: ['Bending a catenoid into a helicoid (an isometry)', 'Rolling a sheet into a cylinder', 'Scaling a surface up by a factor of 2', 'Mercator’s map from the sphere to the plane', 'A rotation in space'],
      answer: [0, 1, 4],
      why: {
        2: t`Scaling multiplies $E$, $F$, $G$ by 4, so $K$ is divided by 4: a bigger sphere is less curved.`,
        3: t`Mercator is conformal, not isometric: it keeps angles but scales lengths by a varying factor, sending $K = 1/R^2$ to $K = 0$.`,
      },
      hints: [t`$K$ is preserved by maps that preserve $E$, $F$, $G$ — isometries.`, 'Rigid motions are isometries too.'],
      teach: 'Isometries — bendings and rigid motions — preserve K; scalings and conformal maps in general do not.',
      explain: t`Bendings and rigid motions keep every distance, so they keep $K$. Scaling by $c$ sends $K$ to $K/c^2$, and a conformal factor $\lambda$ changes $K$ by the formula of this lesson.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mercator-K', difficulty: 3, transfer: true,
      gen(r) {
        const [body, R] = r.pick([['the Earth', R_EARTH], ['the Moon', R_MOON], ['Mars', 3389.5]]);
        const K = 1 / (R * R);
        return {
          prompt: t`A navigation computer stores the map of ${body} in Mercator coordinates, where $ds^2 = R^2\operatorname{sech}^2 y\,(dx^2 + dy^2)$ with $R = ${nice(R, 5)}$ km. Using $K = -\Delta(\ln\lambda)/\lambda^2$ with $\lambda = R\operatorname{sech} y$, what Gaussian curvature does the metric imply, in $\text{km}^{-2}$?`,
          visual: { type: 'graph', params: { x: [-3.3, 3.3], y: [-2.6, 2.6], equal: true, xlabel: 'x (longitude, rad)', ylabel: 'y', grid: false, hlines: [-60, -30, 0, 30, 60].map((l) => ({ y: r6(Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360))), color: 'accent', label: `${l}°` })), vlines: [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ x: r6((k * Math.PI) / 3), color: 'ink3' })) }, caption: 'Mercator’s grid: parallels every 30°, meridians every 60°.' },
          answer: K, units: 'km^-2', tol: { rel: 0.01 },
          errors: [{ value: 1 / R, feedback: t`Curvature of a surface has units of length$^{-2}$: $K = 1/R^2$.` }],
          hints: [t`$\ln\lambda = \ln R - \ln\cosh y$, and $(\ln\cosh y)'' = \operatorname{sech}^2 y$, so $-\Delta\ln\lambda = \operatorname{sech}^2 y$.`, t`Divide by $\lambda^2 = R^2\operatorname{sech}^2 y$.`],
          teach: 'The Theorema Egregium lets a map’s metric reveal the curvature of the world it maps.',
          explain: t`$K = \operatorname{sech}^2 y/(R^2\operatorname{sech}^2 y) = 1/R^2 = ${tex(K, 3)}\ \text{km}^{-2}$ — constant, even though Mercator’s scale varies wildly. The metric alone tells the computer it is mapping a sphere of radius $${nice(R, 5)}$ km.`,
        };
      },
    }),
    num({
      id: 'cp-fabric', difficulty: 4, transfer: true,
      gen(r) {
        const c = r.pick([0.2, 0.3, 0.5]), u0 = r.pick([0.5, 1]), v0 = r.pick([0.5, 1, 1.5]);
        const om = Math.PI / 2 - c * u0 * v0, K = c / Math.sin(om);
        return {
          prompt: t`When woven carbon-fibre fabric is draped over a curved mould for a composite rocket fairing, its threads keep their lengths but the angle $\omega$ between warp and weft changes (the fabric shears). With thread arc lengths $u$, $v$ as coordinates, $ds^2 = du^2 + 2\cos\omega\,du\,dv + dv^2$ — a **Chebyshev net** — and Brioschi’s formula reduces to $K = -\dfrac{\omega_{uv}}{\sin\omega}$. If the drape has $\omega = \dfrac\pi2 - ${c}\,uv$ (lengths in m), what is the mould’s $K$ at $(u, v) = (${u0}, ${v0})$, in $\text{m}^{-2}$?`,
          visual: { type: 'graph', params: { x: [-0.2, 3.4], y: [-0.2, 1.8], equal: true, axes: false, grid: false, curves: [0, 0.4, 0.8, 1.2, 1.6].flatMap((k) => [{ param: [`${k} + t*cos(1.5708 - ${c}*${k}*t)`, `t*sin(1.5708 - ${c}*${k}*t)`], t: [0, 1.6], color: 'accent', width: 1.6 }, { param: [`t + ${k}*cos(1.5708 - ${c}*t*${k})`, `${k}*sin(1.5708 - ${c}*t*${k})`], t: [0, 1.6], color: 'gold', width: 1.6 }]) }, caption: 'A cartoon of the sheared weave, warp threads blue and weft gold, flattened onto the page: the angle between them closes up across the cloth. (Schematic only; on the mould the net is curved and every thread segment keeps its length.)' },
          answer: K, units: 'm^-2', tol: { rel: 0.01 },
          errors: [{ value: c, feedback: t`Divide by $\sin\omega$: here $\omega = ${nice(om, 4)}$ rad, not $\pi/2$.` }, { value: -K, feedback: t`$\omega_{uv} = -${c}$, so $K = -(-${c})/\sin\omega$ is positive.` }].filter((e) => Math.abs(e.value - K) > 0.01 * K),
          hints: [t`$\omega_{uv} = \partial_u\partial_v\big(\tfrac\pi2 - ${c}uv\big) = -${c}$.`, t`$\omega = \pi/2 - ${nice(c * u0 * v0, 4)} = ${nice(om, 4)}$ rad; then $K = ${c}/\sin\omega$.`],
          teach: t`For a Chebyshev net $du^2 + 2\cos\omega\,du\,dv + dv^2$, $K = -\omega_{uv}/\sin\omega$: the fabric must shear to follow curvature.`,
          explain: t`$K = ${c}/\sin(${nice(om, 4)}) = ${nice(K, 4)}\ \text{m}^{-2}$. A woven fabric can follow a doubly curved mould only by shearing, and the Theorema Egregium says how much: no shear gradient, no curvature. Layup engineers use this to predict wrinkling, which sets in when the shear angle passes the fabric’s locking angle.`,
        };
      },
    }),
    mcq({
      id: 'cp-spacetime', difficulty: 2, transfer: true,
      prompt: 'Why is the Theorema Egregium the key to describing gravity as curved spacetime?',
      visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 90, colat: 90, progress: 1, readout: false }, caption: 'An arrow carried round a triangle on a sphere comes back turned — an intrinsic measurement (C6.3).' },
      choices: [
        'It shows curvature can be defined and measured from distances within a space, with no larger space for it to bend into — and spacetime has none',
        'It proves that spacetime is a sphere',
        'It shows spacetime must be embedded in a five-dimensional space',
        'It shows that gravity is an extrinsic curvature, like H',
      ],
      answer: 0,
      why: {
        1: 'Spacetime’s curvature varies from place to place and its signature is Lorentzian; the theorem says nothing of a sphere.',
        2: 'The opposite: no embedding is needed, because curvature is intrinsic.',
        3: t`GR’s curvature (Riemann) generalizes $K$, the intrinsic one. $H$ needs an embedding.`,
      },
      hints: ['What would you need, to talk about H or the normal of spacetime?'],
      teach: 'Because K is intrinsic, a space can be curved without being embedded in anything; GR’s curvature is of this kind.',
      explain: t`Riemann generalized Gauss to any dimension: the curvature tensor is built from $g_{\mu\nu}$ and its first two derivatives, just as $K$ is built from $E$, $F$, $G$. Einstein’s equations are about that intrinsic curvature; measurements of it are tidal forces and the turning of carried gyroscopes (gr.S13.d, gr.S14.i).`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §4-3', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §10.1–10.2', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
