// The metric of a surface: the first fundamental form E du² + 2F du dv + G dv²
// as the dot products of the coordinate velocities, computed for the torus,
// catenoid, helicoid and saddle; what E, F and G each record; the 2 × 2
// matrix g_ij of st-a's metric lessons.
import { lesson, mcq, num, expr, order, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, mesh } from './_dg.js';
import { torus, forms, R_EARTH } from './_surf.js';

const t = String.raw;
const DEG = Math.PI / 180;
const TAU = r6(2 * Math.PI);

// Explore surfaces, each on the unit square of sliders (a, b) ∈ [0, 1]²:
// X, its partials and E, F, G as expression builders in the surface's own (u, v).
const EX = [
  { // torus R = 2, r = 0.8
    U: [0, TAU], V: [0, TAU], cu: true, cv: true, nu: 16, nv: 10,
    X: (u, v) => [`(2 + 0.8*cos(${v}))*cos(${u})`, `(2 + 0.8*cos(${v}))*sin(${u})`, `0.8*sin(${v})`],
    Xu: (u, v) => [`-(2 + 0.8*cos(${v}))*sin(${u})`, `(2 + 0.8*cos(${v}))*cos(${u})`, '0'],
    Xv: (u, v) => [`-0.8*sin(${v})*cos(${u})`, `-0.8*sin(${v})*sin(${u})`, `0.8*cos(${v})`],
    E: (u, v) => `(2 + 0.8*cos(${v}))^2`, F: () => '0', G: () => '0.64',
  },
  { // catenoid c = 1
    U: [0, TAU], V: [-1.4, 1.4], cu: true, nu: 16, nv: 8,
    X: (u, v) => [`cosh(${v})*cos(${u})`, `cosh(${v})*sin(${u})`, `${v}`],
    Xu: (u, v) => [`-cosh(${v})*sin(${u})`, `cosh(${v})*cos(${u})`, '0'],
    Xv: (u, v) => [`sinh(${v})*cos(${u})`, `sinh(${v})*sin(${u})`, '1'],
    E: (u, v) => `cosh(${v})^2`, F: () => '0', G: (u, v) => `cosh(${v})^2`,
  },
  { // ruled helicoid (u cos v, u sin v, 0.4 v)
    U: [-2, 2], V: [-3.1416, 3.1416], nu: 8, nv: 14,
    X: (u, v) => [`${u}*cos(${v})`, `${u}*sin(${v})`, `0.4*${v}`],
    Xu: (u, v) => [`cos(${v})`, `sin(${v})`, '0'],
    Xv: (u, v) => [`-${u}*sin(${v})`, `${u}*cos(${v})`, '0.4'],
    E: () => '1', F: () => '0', G: (u) => `${u}^2 + 0.16`,
  },
  { // saddle (u, v, uv/2)
    U: [-2, 2], V: [-2, 2], nu: 8, nv: 8,
    X: (u, v) => [`${u}`, `${v}`, `0.5*${u}*${v}`],
    Xu: (u, v) => ['1', '0', `0.5*${v}`],
    Xv: (u, v) => ['0', '1', `0.5*${u}`],
    E: (u, v) => `1 + 0.25*${v}^2`, F: (u, v) => `0.25*${u}*${v}`, G: (u) => `1 + 0.25*${u}^2`,
  },
];
const W = (k) => `step(0.5 - abs(s - ${k}))`;
const UA = (S) => `(${S.U[0]} + ${r6(S.U[1] - S.U[0])}*a)`, VB = (S) => `(${S.V[0]} + ${r6(S.V[1] - S.V[0])}*b)`;
const tip = (P, D) => P.map((p, i) => `${p} + (${D[i]})`);
const exploreScene = {
  range: 2.8, grid: false,
  choices: [{ key: 's', label: 'Surface', options: [[0, 'torus'], [1, 'catenoid'], [2, 'helicoid'], [3, 'saddle']], value: 0, explain: 'Four surfaces, each with its own coordinates (u, v); the sliders run over each one’s whole patch.' }],
  sliders: [
    { key: 'a', label: '$u$ (scaled to 0–1)', min: 0, max: 1, step: 0.005, value: 0.12, explain: 'Moves the point along a v-curve, i.e. changes u.' },
    { key: 'b', label: '$v$ (scaled to 0–1)', min: 0, max: 1, step: 0.005, value: 0.15, explain: 'Moves the point along a u-curve, i.e. changes v.' },
  ],
  curves: EX.flatMap((S, k) => mesh(S.X, S.U, S.V, { nu: S.nu, nv: S.nv, closedU: !!S.cu, closedV: !!S.cv, color: 'ink3', width: 1, when: W(k) })),
  points: EX.map((S, k) => ({ at: S.X(UA(S), VB(S)), color: 'gold', label: 'p', when: W(k) })),
  vectors: EX.flatMap((S, k) => {
    const P = S.X(UA(S), VB(S));
    return [
      { from: P, to: tip(P, S.Xu(UA(S), VB(S))), color: 'accent', label: t`\mathbf X_u`, when: W(k) },
      { from: P, to: tip(P, S.Xv(UA(S), VB(S))), color: 'violet', label: t`\mathbf X_v`, when: W(k) },
    ];
  }),
  readouts: ['E', 'F', 'G'].map((f) => ({ label: `$${f}$`, expr: EX.map((S, k) => `${W(k)}*(${S[f](UA(S), VB(S))})`).join(' + '), digits: 3 })),
};

// a torus as a surface3d parametric surface
const TOR = (R, r) => [`(${R} + ${r}*cos(v))*cos(u)`, `(${R} + ${r}*cos(v))*sin(u)`, `${r}*sin(v)`];

export default lesson({
  id: 'st-c.C4.1',
  title: 'The metric of a surface',
  minutes: 12, difficulty: 2,
  equation: t`ds^2 = E\,du^2 + 2F\,du\,dv + G\,dv^2`,
  intro: t`Take a tiny step on a surface: $u$ changes by $du$ and $v$ by $dv$. In space the step is $d\mathbf X = \mathbf X_u\,du + \mathbf X_v\,dv$, and its squared length is $d\mathbf X\cdot d\mathbf X$. Expanding gives the line above, the **first fundamental form** $\mathrm I$, with

$$E = \mathbf X_u\cdot\mathbf X_u,\quad F = \mathbf X_u\cdot\mathbf X_v,\quad G = \mathbf X_v\cdot\mathbf X_v.$$

Three functions on the $(u, v)$ map tell an inhabitant of the surface everything about distance: $\sqrt E$ is how fast the $u$-curves are traced, $\sqrt G$ the same for the $v$-curves, and $F$ how far the two are from perpendicular. Written as a matrix, $g_{ij} = \begin{pmatrix} E & F \\ F & G \end{pmatrix}$ is the **metric** of lessons st-a A6.1–A6.3 — here *induced* by the surface’s sitting in space. Notice what is gone: the normal $\mathbf n$ of C3.2 appears nowhere.`,
  symbols: [
    { tex: 'u,\\ v', text: 'the surface’s coordinates: labels on a patch, with no units of their own' },
    { tex: t`\mathbf X_u,\ \mathbf X_v`, text: t`the coordinate velocities $\partial\mathbf X/\partial u$ and $\partial\mathbf X/\partial v$: tangent vectors at the point` },
    { tex: 'E', text: t`$\mathbf X_u\cdot\mathbf X_u$: the squared speed of the $u$-curve (length² per unit $u$²)` },
    { tex: 'F', text: t`$\mathbf X_u\cdot\mathbf X_v$: zero exactly where the coordinate curves cross at right angles` },
    { tex: 'G', text: t`$\mathbf X_v\cdot\mathbf X_v$: the squared speed of the $v$-curve` },
    { tex: 'ds', text: t`the length of the step $(du, dv)$, measured in space along the surface — in metres if $\mathbf X$ is in metres` },
  ],
  why: t`This is the metric $g_{\mu\nu}$ of general relativity in its first, most visible form. In C4.2 it measures lengths, angles and areas; in C6.1 Gauss shows it alone fixes the curvature $K$ — and spacetime, which sits inside nothing, has only a metric to be curved with.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Reading E, F and G off the coordinate grid',
    lead: t`Each surface is drawn by its coordinate curves. At the point $p$ you see $\mathbf X_u$ (blue) and $\mathbf X_v$ (violet), and below them the three numbers $E$, $F$, $G$ — their dot products.`,
    tasks: [
      t`Torus: move $u$ — nothing changes (the torus is round). Move $v$: $E$ is largest on the outer equator, $(2 + 0.8)^2 = 7.84$, and smallest on the inner one, $(2 - 0.8)^2 = 1.44$, while $G = 0.64$ never moves.`,
      t`Catenoid: $E = G$ everywhere, and both grow away from the neck. The coordinate grid is made of small *squares* — the coordinates are **conformal**.`,
      t`Saddle: $F \ne 0$ except on the two axes, and the arrows visibly lean toward each other. On the helicoid $F = 0$ everywhere, though $E \ne G$.`,
    ],
    params: exploreScene,
    caption: t`Torus $R = 2$, $r = 0.8$; catenoid $(\cosh v\cos u,\ \cosh v\sin u,\ v)$; helicoid $(u\cos v,\ u\sin v,\ 0.4v)$; saddle $(u,\ v,\ uv/2)$. The sliders are rescaled so 0–1 covers each patch. Arrows are to scale: $|\mathbf X_u| = \sqrt E$ and $|\mathbf X_v| = \sqrt G$.`,
  },
  example: {
    prompt: t`Find the first fundamental form of the torus $\mathbf X(u, v) = \big((R + r\cos v)\cos u,\ (R + r\cos v)\sin u,\ r\sin v\big)$, and use it to find the length of the outer and inner equators.`,
    visual: { type: 'surface3d', params: { surface: TOR(2, 0.8), domain: [[0, TAU], [0, TAU]], alpha: 0.75, pitch: 0.55, dist: 8, curves: [{ param: ['2.8*cos(t)', '2.8*sin(t)', '0'], t: [0, TAU], color: 'gold', width: 3 }, { param: ['1.2*cos(t)', '1.2*sin(t)', '0'], t: [0, TAU], color: 'violet', width: 3 }] }, caption: t`A torus with $R = 2$, $r = 0.8$: the outer equator $v = 0$ (gold) and the inner equator $v = \pi$ (violet). Both are $u$-curves.` },
    steps: [
      { label: 'Coordinate velocities', text: t`$\mathbf X_u = (R + r\cos v)(-\sin u,\ \cos u,\ 0)$: a horizontal circle’s velocity. $\mathbf X_v = r(-\sin v\cos u,\ -\sin v\sin u,\ \cos v)$: the velocity round the tube.` },
      { label: 'Dot products', text: t`$E = (R + r\cos v)^2(\sin^2 u + \cos^2 u) = (R + r\cos v)^2$. $F = (R + r\cos v)\,r\,(\sin v\sin u\cos u - \sin v\cos u\sin u) = 0$. $G = r^2(\sin^2 v + \cos^2 v) = r^2$.` },
      { label: 'The metric', text: t`$ds^2 = (R + r\cos v)^2\,du^2 + r^2\,dv^2$. No $du\,dv$ term: the coordinate circles cross at right angles everywhere.` },
      { label: 'Use it', text: t`Along an equator $v$ is fixed, so $dv = 0$ and $ds = (R + r\cos v)\,du$. Over $0 \le u \le 2\pi$: the outer equator ($v = 0$) has length $2\pi(R + r)$, the inner one ($v = \pi$) $2\pi(R - r)$.` },
      { label: 'Sense check', text: t`Those are the circumferences of circles of radius $R \pm r$ — what you would get by looking at the torus from above. The metric reproduced them without ever leaving the $(u, v)$ map.` },
    ],
    answer: t`$E = (R + r\cos v)^2$, $F = 0$, $G = r^2$; the equators have lengths $2\pi(R \pm r)$.`,
  },
  practice: [
    mcq({
      id: 'what-F', difficulty: 1,
      prompt: t`At a point of a surface, $F = \mathbf X_u\cdot\mathbf X_v = 0$. What does that tell you?`,
      visual: { type: 'calc-vectors3d', params: { range: 2.2, grid: false, yaw: -0.8, pitch: 0.5, curves: mesh((u, v) => [`${u}`, `${v}`, `0.5*${u}*${v}`], [-1.6, 1.6], [-1.6, 1.6], { nu: 8, nv: 8 }), points: [{ at: [0, 1, 0], color: 'gold', label: 'p' }, { at: [1.2, 1.2, 0.72], color: 'bad', label: 'q' }], vectors: [{ from: [0, 1, 0], to: [1, 1, 0.5], color: 'accent' }, { from: [0, 1, 0], to: [0, 2, 0], color: 'violet' }, { from: [1.2, 1.2, 0.72], to: [2.2, 1.2, 1.32], color: 'accent' }, { from: [1.2, 1.2, 0.72], to: [1.2, 2.2, 1.32], color: 'violet' }] }, caption: t`The saddle $(u, v, uv/2)$ with $\mathbf X_u$ (blue) and $\mathbf X_v$ (violet) at two points. At $p$, on the axis $u = 0$, $F = 0$; at $q$ it is not.` },
      choices: ['The two coordinate curves through the point cross at right angles', 'The surface is flat there', t`The coordinate curves are traced at the same speed, $E = G$`, 'The surface has no area element there'],
      answer: 0,
      why: {
        1: t`$F$ describes the coordinate grid, not the bending: a sphere in $(\theta, \varphi)$ has $F = 0$ everywhere and is not flat.`,
        2: t`Equal speeds is $E = G$. $F$ compares *directions*: it is $|\mathbf X_u||\mathbf X_v|\cos\theta$.`,
        3: t`The area element is $\sqrt{EG - F^2}$; with $F = 0$ it is $\sqrt{EG}$, which is not zero at a regular point.`,
      },
      hints: [t`A dot product is zero when the vectors are perpendicular. Which two vectors is $F$ the dot product of?`],
      teach: t`$F = |\mathbf X_u||\mathbf X_v|\cos\theta$, so $F = 0$ means the coordinate curves meet at right angles: the coordinates are orthogonal.`,
      explain: t`$\mathbf X_u$ and $\mathbf X_v$ are the velocities of the two coordinate curves, so $F = 0$ says they are perpendicular. Orthogonal coordinates — polar, spherical, the torus’s angles — make everything simpler, which is why most examples use them.`,
    }),
    expr({
      id: 'saddle-EFG', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4]), which = r.pick(['E', 'F', 'G']), k2 = k * k;
        const ans = { E: `1 + ${k2}v^2`, F: `${k2}u v`, G: `1 + ${k2}u^2` }[which];
        const ansTeX = { E: t`1 + ${k2}v^2`, F: t`${k2}uv`, G: t`1 + ${k2}u^2` }[which];
        const err = {
          E: [{ answer: `${k2}v^2`, feedback: t`$\mathbf X_u = (1, 0, ${k}v)$ has a 1 in its first component too: $E = 1^2 + (${k}v)^2$.` }, { answer: `1 + ${k}v^2`, feedback: t`Square the whole third component: $(${k}v)^2 = ${k2}v^2$.` }],
          F: [{ answer: `${k}u v`, feedback: t`Each of $\mathbf X_u = (1, 0, ${k}v)$ and $\mathbf X_v = (0, 1, ${k}u)$ carries a factor ${k}: their product is $${k2}uv$.` }, { answer: '0', feedback: t`The first two components give $1\cdot 0 + 0\cdot 1 = 0$, but the third ones do not cancel.` }],
          G: [{ answer: `${k2}u^2`, feedback: t`$\mathbf X_v = (0, 1, ${k}u)$ has a 1 in its second component: $G = 1 + (${k}u)^2$.` }, { answer: `1 + ${k}u^2`, feedback: t`Square the whole third component: $(${k}u)^2 = ${k2}u^2$.` }],
        }[which];
        return {
          prompt: t`For the saddle $\mathbf X(u, v) = (u,\ v,\ ${k}uv)$, find $${which}(u, v)$.`,
          visual: { type: 'surface3d', params: { z: `${k}*x*y`, domain: [[-1, 1], [-1, 1]], zscale: r6(1 / k), pitch: 0.42, yaw: -0.8, dist: 5.5, curves: [{ param: ['t', '0.5', `${k}*0.5*t`], t: [-1, 1], color: 'accent', width: 3 }, { param: ['0.5', 't', `${k}*0.5*t`], t: [-1, 1], color: 'violet', width: 3 }] }, caption: t`The saddle $z = ${k}uv$ (heights scaled by $1/${k}$) with the $u$-curve (blue) and $v$-curve (violet) through $(0.5, 0.5)$. Each is a straight line in space.` },
          answer: ans, answerTeX: ansTeX, vars: { u: [-2, 2], v: [-2, 2] }, lhs: which, errors: err,
          hints: [t`$\mathbf X_u = (1,\ 0,\ ${k}v)$ and $\mathbf X_v = (0,\ 1,\ ${k}u)$.`, t`$E = \mathbf X_u\cdot\mathbf X_u$, $F = \mathbf X_u\cdot\mathbf X_v$, $G = \mathbf X_v\cdot\mathbf X_v$ — multiply matching components and add.`],
          teach: t`$E$, $F$, $G$ are the three dot products of the two coordinate velocities.`,
          explain: t`With $\mathbf X_u = (1, 0, ${k}v)$ and $\mathbf X_v = (0, 1, ${k}u)$: $E = 1 + ${k2}v^2$, $F = ${k2}uv$, $G = 1 + ${k2}u^2$. The coordinate lines are straight lines in space, but they meet at right angles only along the axes, where $uv = 0$.`,
        };
      },
    }),
    expr({
      id: 'catenoid-G', difficulty: 2,
      gen(r) {
        const c = r.pick([2, 3, 4]), which = r.pick(['E', 'G']);
        const ans = which === 'E' ? `${c * c}cosh(v/${c})^2` : `cosh(v/${c})^2`;
        return {
          prompt: t`A soap film between two rings takes the shape of a catenoid, $\mathbf X(u, v) = \big(${c}\cosh(v/${c})\cos u,\ ${c}\cosh(v/${c})\sin u,\ v\big)$ (lengths in cm). Find $${which}(u, v)$.`,
          visual: { type: 'surface3d', params: { surface: [`${c}*cosh(v/${c})*cos(u)`, `${c}*cosh(v/${c})*sin(u)`, 'v'], domain: [[0, TAU], [-1.3 * c, 1.3 * c]], alpha: 0.75, pitch: 0.2, dist: r6(8 * c), curves: [{ param: [`${c}*cosh(0.6)*cos(t)`, `${c}*cosh(0.6)*sin(t)`, `${r6(0.6 * c)}`], t: [0, TAU], color: 'accent', width: 2.4 }, { param: [`${c}*cosh(t/${c})`, '0', 't'], t: [-1.3 * c, 1.3 * c], color: 'violet', width: 2.4 }] }, caption: t`The catenoid with neck radius ${c} cm: a $u$-curve (blue, a horizontal circle) and a $v$-curve (violet, a catenary).` },
          answer: ans, answerTeX: which === 'E' ? t`${c * c}\cosh^2(v/${c})` : t`\cosh^2(v/${c})`,
          vars: { u: [0, 6], v: [-3, 3] }, lhs: which,
          errors: which === 'E'
            ? [{ answer: `cosh(v/${c})^2`, feedback: t`The radius of the $u$-circle is $${c}\cosh(v/${c})$, so its speed is that — square the ${c} too.` }]
            : [{ answer: `sinh(v/${c})^2`, feedback: t`$\mathbf X_v = (\sinh(v/${c})\cos u,\ \sinh(v/${c})\sin u,\ 1)$: you dropped the $z$-component 1. Then $\sinh^2 + 1 = \cosh^2$.` }],
          hints: [which === 'E' ? t`$\mathbf X_u = ${c}\cosh(v/${c})\,(-\sin u,\ \cos u,\ 0)$.` : t`Differentiate each component in $v$: $\frac{d}{dv}\,${c}\cosh(v/${c}) = \sinh(v/${c})$, and $\frac{d}{dv}\,v = 1$.`, t`Use $\cosh^2 x - \sinh^2 x = 1$ to tidy the answer.`],
          teach: t`On a surface of revolution $\big(\rho(v)\cos u,\ \rho(v)\sin u,\ z(v)\big)$: $E = \rho^2$, $F = 0$, $G = \rho'^2 + z'^2$.`,
          explain: t`$E = ${c * c}\cosh^2(v/${c})$ (the circle’s radius squared), $F = 0$, and $G = \sinh^2(v/${c}) + 1 = \cosh^2(v/${c})$. So $ds^2 = \cosh^2(v/${c})\,(${c * c}\,du^2 + dv^2)$ — a multiple of a flat metric, which is why the catenoid’s grid is made of small squares once $u$ is scaled by ${c}.`,
        };
      },
    }),
    num({
      id: 'small-step', difficulty: 2,
      gen(r) {
        const R = r.pick([3, 4, 5]), rr = r.pick([0.6, 1, 1.2]), v0deg = r.pick([0, 60, 120, 180]), du = r.pick([0.02, 0.03]), dv = r.pick([0.05, 0.08]);
        const fm = forms(torus(R, rr), 0, v0deg * DEG);
        const ds = Math.sqrt(fm.E * du * du + fm.G * dv * dv);
        const naive = Math.hypot(du, dv);
        return {
          prompt: t`A toroidal propellant tank has $R = ${R}$ m and $r = ${rr}$ m. On its skin, at $v = ${v0deg}^\circ$, a strain gauge is bonded across the coordinate step $\Delta u = ${du}$, $\Delta v = ${dv}$ (radians). Using the torus metric $ds^2 = (R + r\cos v)^2\,du^2 + r^2\,dv^2$, how long is the gauge, in metres?`,
          visual: { type: 'surface3d', params: { surface: TOR(R, rr), domain: [[0, TAU], [0, TAU]], alpha: 0.7, pitch: 0.55, dist: r6(2.9 * (R + rr)), curves: [{ param: [`(${R} + ${rr}*cos(${r6(v0deg * DEG)} + ${dv}*t))*cos(${du}*t)`, `(${R} + ${rr}*cos(${r6(v0deg * DEG)} + ${dv}*t))*sin(${du}*t)`, `${rr}*sin(${r6(v0deg * DEG)} + ${dv}*t)`], t: [0, 1], color: 'gold', width: 7 }] }, caption: 'The tank’s torus, with the gauge in gold (drawn to scale — it is small).' },
          answer: ds, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: naive, feedback: t`That is $\sqrt{\Delta u^2 + \Delta v^2}$, a length in the coordinate map. Coordinates are angles; the metric converts them to metres.` }, { value: fm.E * du * du + fm.G * dv * dv, feedback: t`That is $ds^2$. Take the square root.` }].filter((e) => Math.abs(e.value - ds) > 0.03 * ds),
          hints: [t`At $v = ${v0deg}^\circ$, $E = (R + r\cos v)^2 = ${nice(fm.E, 4)}\ \text{m}^2$ and $G = r^2 = ${nice(fm.G, 4)}\ \text{m}^2$.`, t`$\Delta s \approx \sqrt{E\,\Delta u^2 + G\,\Delta v^2}$ — there is no cross term because $F = 0$.`],
          teach: 'The metric turns a step in coordinates into a length: ds² = E du² + 2F du dv + G dv².',
          explain: t`$\Delta s = \sqrt{${nice(fm.E, 4)}\times${du}^2 + ${nice(fm.G, 4)}\times${dv}^2} = ${nice(ds, 3)}\ \text{m}$. For a step this small the formula is accurate to well under a percent; for a long curve you add up such steps — an integral (C4.2).`,
        };
      },
    }),
    match({
      id: 'match-metrics', difficulty: 2,
      prompt: t`Match each surface, in the coordinates shown, to its $(E,\ F,\ G)$.`,
      left: [t`sphere $a(\sin\theta\cos\varphi,\ \sin\theta\sin\varphi,\ \cos\theta)$`, t`cylinder $(a\cos\varphi,\ a\sin\varphi,\ z)$`, t`helicoid $(u\cos v,\ u\sin v,\ v)$`, t`saddle $(u,\ v,\ uv)$`],
      right: ['a², 0, a² sin²θ', 'a², 0, 1', '1, 0, u² + 1', '1 + v², uv, 1 + u²', '1, 0, 1', 'a², 0, a²'],
      answer: [0, 1, 2, 3],
      visual: { type: 'calc-vectors3d', params: { range: 2.2, grid: false, curves: mesh((u, v) => [`${u}*cos(${v})`, `${u}*sin(${v})`, `0.35*${v}`], [-1.8, 1.8], [-3.1416, 3.1416], { nu: 6, nv: 14 }) }, caption: t`The helicoid $(u\cos v,\ u\sin v,\ 0.35v)$ — heights scaled down — drawn by its coordinate curves: straight rulings ($v$ fixed) and helices ($u$ fixed).` },
      hints: [t`For each, write $\mathbf X_1$ and $\mathbf X_2$ and take the three dot products. The first coordinate listed is $u$.`, t`Helicoid: $\mathbf X_v = (-u\sin v,\ u\cos v,\ 1)$, so $G = u^2 + 1$.`],
      teach: 'Every surface carries its own E, F, G; computing them is three dot products.',
      explain: t`Sphere: $E = a^2$, $G = a^2\sin^2\theta$ (circles of latitude shrink toward the poles). Cylinder: $a^2$ and $1$, flat as paper once $a\varphi$ is used as a coordinate. Helicoid: the rulings are traced at unit speed, the helices at speed $\sqrt{u^2 + 1}$. Saddle: as in the earlier problem, with $k = 1$.`,
    }),
    mcq({
      id: 'graph-metric', difficulty: 2,
      prompt: t`A surface is the graph $z = f(x, y)$, parameterized by $\mathbf X(x, y) = (x,\ y,\ f(x, y))$. What is its first fundamental form?`,
      visual: { type: 'surface3d', params: { z: '0.6*sin(x)*cos(0.8*y)', domain: [[-2.5, 2.5], [-2.5, 2.5]], tangentAt: [0.8, -0.6], gradient: false, planeSize: 1.2, pitch: 0.5, dist: 9, readouts: [] }, caption: t`A graph $z = f(x, y)$ with its tangent plane at a point. Where the surface is steep, a step $dx$ on the map is a longer step on the surface.` },
      choices: [
        t`$E = 1 + f_x^2,\ F = f_xf_y,\ G = 1 + f_y^2$`,
        t`$E = f_x^2,\ F = f_xf_y,\ G = f_y^2$`,
        t`$E = 1 + f_x^2,\ F = 0,\ G = 1 + f_y^2$`,
        t`$E = 1 + f_x^2,\ F = f_{xy},\ G = 1 + f_y^2$`,
      ],
      answer: 0,
      why: {
        1: t`$\mathbf X_x = (1, 0, f_x)$ has a 1 in it: moving in $x$ moves you in $x$, as well as up. Without it, a flat graph ($f = 0$) would have $E = 0$.`,
        2: t`$\mathbf X_x\cdot\mathbf X_y = 0 + 0 + f_xf_y$: the third components do not cancel, so the grid lines are skewed wherever both slopes are nonzero.`,
        3: t`$F$ is a dot product of first derivatives; $f_{xy}$ is a second derivative and belongs to the *second* fundamental form (C5.1).`,
      },
      hints: [t`$\mathbf X_x = (1, 0, f_x)$ and $\mathbf X_y = (0, 1, f_y)$.`],
      teach: t`For a graph, $E = 1 + f_x^2$, $F = f_xf_y$, $G = 1 + f_y^2$: the flat-map metric plus the slopes.`,
      explain: t`$ds^2 = (1 + f_x^2)\,dx^2 + 2f_xf_y\,dx\,dy + (1 + f_y^2)\,dy^2 = dx^2 + dy^2 + (f_x\,dx + f_y\,dy)^2 = dx^2 + dy^2 + dz^2$ — Pythagoras in space, restricted to the surface.`,
    }),
    order({
      id: 'derive-I', difficulty: 3,
      prompt: t`Derive the first fundamental form from the parameterization. Put the steps in order.`,
      visual: { type: 'calc-vectors3d', params: { range: 3, grid: false, curves: mesh(EX[0].X, [0, TAU], [0, TAU], { nu: 16, nv: 10, closedU: true, closedV: true }), points: [{ at: EX[0].X(0.7, 0.9), color: 'gold', label: 'p' }], vectors: [{ from: EX[0].X(0.7, 0.9), to: EX[0].X(0.7, 0.9).map((p, i) => `${p} + 0.25*(${EX[0].Xu(0.7, 0.9)[i]}) + 0.6*(${EX[0].Xv(0.7, 0.9)[i]})`), color: 'gold', label: t`d\mathbf X` }] }, caption: t`A small step $d\mathbf X$ on a torus: a combination of $\mathbf X_u$ and $\mathbf X_v$ (drawn enlarged).` },
      items: [
        t`A small step in the coordinates moves the point by $d\mathbf X = \mathbf X_u\,du + \mathbf X_v\,dv$ (chain rule).`,
        t`Its squared length is $ds^2 = d\mathbf X\cdot d\mathbf X$.`,
        t`Expand: $ds^2 = (\mathbf X_u\cdot\mathbf X_u)\,du^2 + 2(\mathbf X_u\cdot\mathbf X_v)\,du\,dv + (\mathbf X_v\cdot\mathbf X_v)\,dv^2$.`,
        t`Name the coefficients $E$, $F$, $G$: $ds^2 = E\,du^2 + 2F\,du\,dv + G\,dv^2$.`,
      ],
      hints: ['Start from how the point moves when u and v change a little.', t`The middle term has a 2 because the dot product is symmetric: $\mathbf X_u\cdot\mathbf X_v = \mathbf X_v\cdot\mathbf X_u$.`],
      teach: t`The first fundamental form is the squared length of the step $d\mathbf X = \mathbf X_u\,du + \mathbf X_v\,dv$.`,
      explain: t`In index notation (st-a A6.2) this is $ds^2 = g_{ij}\,dx^i\,dx^j$ with $x^1 = u$, $x^2 = v$ and $g_{ij} = \partial_i\mathbf X\cdot\partial_j\mathbf X$ — the metric pulled back from space onto the surface.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-parallel', difficulty: 2, transfer: true,
      gen(r) {
        const lat = r.pick([30, 45, 52, 60, 64]), dphi = r.pick([1, 5, 10]);
        const R = R_EARTH, ans = R * Math.cos(lat * DEG) * dphi * DEG;
        return {
          prompt: t`In latitude $\lambda$ and longitude $\varphi$, the Earth (a sphere of radius $R = 6371$ km) has metric $ds^2 = R^2\,d\lambda^2 + R^2\cos^2\lambda\,d\varphi^2$. An aircraft holds latitude $${lat}^\circ$N and flies $${dphi}^\circ$ of longitude due east. How far does it fly, in km?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.4, grid: false, axes: false, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink4' }], curves: [{ param: [`${r6(Math.cos(lat * DEG))}*cos(t)`, `${r6(Math.cos(lat * DEG))}*sin(t)`, `${r6(Math.sin(lat * DEG))}`], t: [0, TAU], color: 'ink3' }, { param: [`${r6(Math.cos(lat * DEG))}*cos(t)`, `${r6(Math.cos(lat * DEG))}*sin(t)`, `${r6(Math.sin(lat * DEG))}`], t: [0, r6(Math.max(dphi, 15) * DEG)], color: 'gold', width: 6 }] }, caption: t`The parallel at $${lat}^\circ$N on a unit sphere. The gold arc is the flight (exaggerated in length when it is short).` },
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: [
            { value: R * dphi * DEG, feedback: t`That is the length of $${dphi}^\circ$ along the equator. Along a parallel, $d\lambda = 0$ and $ds = R\cos\lambda\,d\varphi$: the parallels shrink toward the pole.` },
            { value: R * Math.sin(lat * DEG) * dphi * DEG, feedback: t`You used $\sin\lambda$. In latitude (measured from the equator) the factor is $\cos\lambda$; $\sin$ belongs with colatitude $\theta = 90^\circ - \lambda$.` },
            { value: R * Math.cos(lat * DEG) * dphi, feedback: t`Convert the longitude change to radians before multiplying.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Along a parallel, $d\lambda = 0$, so $ds = R\cos\lambda\,d\varphi$.`, t`$\Delta\varphi = ${dphi}^\circ = ${nice(dphi * DEG, 4)}$ rad.`],
          teach: 'Along a coordinate curve only one term of the metric survives: here ds = R cos λ dφ.',
          explain: t`$s = R\cos\lambda\,\Delta\varphi = 6371 \times \cos ${lat}^\circ \times ${nice(dphi * DEG, 4)} = ${nice(ans, 4)}\ \text{km}$. This is $G = R^2\cos^2\lambda$ at work: on a map with straight, equally spaced meridians the same $${dphi}^\circ$ looks equally wide at every latitude, which is the first sign that such a map distorts (C4.3). Following a parallel is not the shortest route between two points on it either — that is a great circle (C6.2).`,
        };
      },
    }),
    expr({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      gen(r) {
        const rt = r.pick([0.1, 0.15, 0.2]), k = r.pick([0.5, 1, 2]), which = r.bool(0.5) ? 'E' : 'G';
        const ans = which === 'E' ? `(${rt} + ${k}z^2)^2` : `1 + ${4 * k * k}z^2`;
        return {
          prompt: t`The wall of a rocket nozzle’s expansion section is modelled as the surface of revolution $\mathbf X(u, z) = \big(\rho(z)\cos u,\ \rho(z)\sin u,\ z\big)$ with radius $\rho(z) = ${rt} + ${k}z^2$ (metres, $z$ measured downstream from the throat). Find $${which}(u, z)$ of its first fundamental form.`,
          visual: { type: 'surface3d', params: { surface: [`(${rt} + ${k}*v^2)*cos(u)`, `(${rt} + ${k}*v^2)*sin(u)`, `-v`], domain: [[0, TAU], [0, r6(Math.sqrt(0.5 / k))]], alpha: 0.75, pitch: 0.3, dist: 2.6, axes: false, curves: [{ param: [`(${rt} + ${k}*t^2)`, '0', '-t'], t: [0, r6(Math.sqrt(0.5 / k))], color: 'violet', width: 2.6 }] }, caption: t`The nozzle wall drawn from the throat to where $\rho \approx ${nice(rt + 0.5, 3)}$ m, flow downward. Violet: one meridian, a $z$-curve. A parabolic profile is a simplification; real bell contours are designed by the method of characteristics.` },
          answer: ans, answerTeX: which === 'E' ? t`(${rt} + ${k}z^2)^2` : t`1 + ${4 * k * k}z^2`, vars: { u: [0, 6], z: [0, 1.5] }, lhs: which,
          errors: which === 'E'
            ? [{ answer: `${rt} + ${k}z^2`, feedback: t`$E = \mathbf X_u\cdot\mathbf X_u = \rho^2$ — the speed squared, not the speed.` }]
            : [{ answer: `1 + ${2 * k}z`, feedback: t`$G = \rho'^2 + 1$: square the derivative $\rho' = ${2 * k}z$.` }, { answer: `${4 * k * k}z^2`, feedback: t`$\mathbf X_z = (\rho'\cos u,\ \rho'\sin u,\ 1)$: the third component contributes $1$.` }],
          hints: [t`$\mathbf X_u = \rho(z)(-\sin u,\ \cos u,\ 0)$ and $\mathbf X_z = (\rho'(z)\cos u,\ \rho'(z)\sin u,\ 1)$.`, t`$E = \rho^2$, $F = 0$, $G = \rho'^2 + 1$, with $\rho' = ${2 * k}z$.`],
          teach: t`A surface of revolution $(\rho\cos u,\ \rho\sin u,\ z)$ has $E = \rho^2$, $F = 0$, $G = 1 + \rho'^2$.`,
          explain: t`$E = (${rt} + ${k}z^2)^2$, $F = 0$ and $G = 1 + (${2 * k}z)^2 = 1 + ${4 * k * k}z^2$. $\sqrt G$ is the length of wall per metre of axis: it grows as the wall flares, which is what you integrate to find how much sheet a nozzle extension needs (C4.2).`,
        };
      },
    }),
    mcq({
      id: 'cp-impossible', difficulty: 3,
      prompt: t`Which of these cannot be $(E, F, G)$ at a regular point of any surface?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, grid: false, axes: false, pitch: 1.25, vectors: [{ from: [0, 0, 0], to: [1.4, 0, 0], color: 'accent', label: t`\mathbf X_u` }, { from: [0, 0, 0], to: [0.5, 1, 0], color: 'violet', label: t`\mathbf X_v` }], parallelograms: [{ at: [0, 0, 0], u: [1.4, 0, 0], v: [0.5, 1, 0], color: 'gold', alpha: 0.25 }] }, caption: t`Two tangent vectors and the parallelogram they span. $E$ and $G$ are their squared lengths and $F$ their dot product; the parallelogram’s area is $|\mathbf X_u\times\mathbf X_v|$.` },
      choices: [t`$(1,\ 2,\ 1)$`, t`$(4,\ 1,\ 1)$`, t`$(1,\ 0,\ 9)$`, t`$(2,\ -1,\ 3)$`],
      answer: 0,
      why: {
        1: t`$EG - F^2 = 3 > 0$: two vectors of lengths 2 and 1 at $60^\circ$ (since $\cos\theta = F/\sqrt{EG} = \tfrac12$).`,
        2: t`Perpendicular coordinate curves, the $v$-curve traced three times as fast — a perfectly good metric.`,
        3: t`A negative $F$ only means the angle between the coordinate curves is obtuse: $EG - F^2 = 5 > 0$.`,
      },
      hints: [t`$|F| = |\mathbf X_u\cdot\mathbf X_v| \le |\mathbf X_u||\mathbf X_v| = \sqrt{EG}$ (Cauchy–Schwarz).`, t`Equivalently $EG - F^2 = |\mathbf X_u\times\mathbf X_v|^2$, which is positive at a regular point. Check each choice.`],
      teach: t`A metric is positive definite: $E > 0$, $G > 0$ and $EG - F^2 = |\mathbf X_u\times\mathbf X_v|^2 > 0$.`,
      explain: t`$(1, 2, 1)$ gives $EG - F^2 = -3$: two unit vectors with dot product 2, which is impossible. In matrix language the metric $\begin{pmatrix} E & F \\ F & G \end{pmatrix}$ of a surface must have positive determinant and positive diagonal. Spacetime’s metric drops exactly this requirement — its determinant is negative — and that is where light cones come from (st-a A6.6).`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §2-5', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §6.1', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
