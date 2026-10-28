// Optimization — model the quantity, use the constraint to leave one variable,
// find the critical points, and check them against the ends of the domain.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { curveFig, fitY } from './_c1kit.js';

const t = String.raw;
const PI = Math.PI;

// the worked example: a 10 m³ tank with flat ends
const VT = 10, RT = Math.cbrt(VT / (2 * PI)), HT = VT / (PI * RT * RT), AT = 6 * PI * RT * RT;

// a capsule outline (cylinder of length L between two hemispheres of radius R), centred on the origin
function capsule(L, R, color = 'accent') {
  return [
    { param: [`${L / 2} + ${R}*cos(t)`, `${R}*sin(t)`], t: [-PI / 2, PI / 2], color },
    { param: [`${-L / 2} - ${R}*cos(t)`, `${R}*sin(t)`], t: [-PI / 2, PI / 2], color },
    { fn: `${R}`, domain: [-L / 2, L / 2], color },
    { fn: `${-R}`, domain: [-L / 2, L / 2], color },
  ];
}

export default lesson({
  id: 'math1210.C1-4.6',
  title: 'Optimization',
  minutes: 11, difficulty: 3,
  intro: t`An optimization problem asks for the best value of something — least material, most power, shortest time. The method is always the same: write the quantity as a function of **one** variable, using any constraint to eliminate the others; find its domain; then the best value is at a critical point or at an end of the domain:

$$Q'(x) = 0 \quad\text{or}\quad x = \text{an endpoint}$$

Calculus finds the candidates; comparing them (or the sign of $Q'$ and $Q''$) picks the winner. Physics is full of such problems, and some of its deepest laws — Fermat’s principle of least time, the principle of least action — are stated as optimizations.`,
  symbols: [
    { tex: 'Q(x)', text: 'the quantity to make as large or as small as possible (area, cost, power, time), written in terms of one variable' },
    { tex: 'x', text: 'the variable you choose to keep after using the constraint' },
    { tex: "Q'(x) = 0", text: 'the condition for a critical point — a candidate for the best value' },
    { tex: '\\text{endpoint}', text: 'an end of the physically allowed interval, which must also be checked' },
  ],
  why: t`Engineering is optimization under constraints — the lightest tank for a given volume, the load that draws the most power from a source, the route that takes the least time — and the same calculus finds them all.`,
  visual: {
    type: 'graph',
    title: 'The least metal for a tank of given volume',
    lead: t`A closed cylindrical tank with flat ends must hold a volume $V$. The curve is its surface area $A(r) = 2\pi r^2 + \dfrac{2V}{r}$ as a function of the radius $r$ (the height has been eliminated with $V = \pi r^2 h$). Drag the gold point to the bottom of the curve.`,
    tasks: [
      'At the bottom the tangent is flat; read off h ÷ r there. It is 2: height equals diameter.',
      'Change V. The best radius moves, but at the minimum h ÷ r is always 2.',
      'Drag to small r (a tall thin pipe) and to large r (a flat pancake): both waste metal, so the best tank lies between.',
    ],
    params: {
      x: [0, 3.2], y: [0, 70], aspect: 'wide', xlabel: 'r (m)', ylabel: 'A (m²)',
      sliders: [{ key: 'V', label: t`Volume $V$`, min: 2, max: 20, step: 0.5, value: 10, unit: t`\mathrm{m^3}`, explain: 'The volume the tank must hold — the constraint.' }],
      curves: [{ fn: '2*pi*x^2 + 2*V/x', color: 'accent', domain: [0.15, 3.2] }],
      tangent: { fn: '2*pi*x^2 + 2*V/x', at: 2 },
      readouts: [
        { label: t`radius $r$`, expr: 'x0', unit: t`\mathrm{m}`, digits: 3 },
        { label: t`height $h = V/\pi r^2$`, expr: 'V/(pi*x0^2)', unit: t`\mathrm{m}`, digits: 3 },
        { label: t`$h/r$`, expr: 'V/(pi*x0^3)', digits: 3 },
        { label: t`area $A$`, expr: '2*pi*x0^2 + 2*V/x0', unit: t`\mathrm{m^2}`, digits: 4 },
        { label: t`$dA/dr$`, expr: 'slope', digits: 3 },
      ],
    },
    caption: 'Wall thickness is ignored, and the ends are flat. Real propellant tanks have domed ends, which change the best proportions (see the last practice problem).',
  },
  example: {
    prompt: t`Find the radius and height of a closed cylindrical tank with flat ends that holds $10.0\ \text{m}^3$ using the least sheet metal.`,
    visual: curveFig({ fn: '2*pi*x^2 + 20/x', x: [0, 3.2], y: [0, 70], xlabel: 'r (m)', ylabel: 'A (m²)', domain: [0.2, 3.2], points: [{ x: RT, y: AT, color: 'gold', label: `minimum: r = ${RT.toFixed(2)} m`, labelDx: -20, labelDy: 24 }], caption: t`$A(r) = 2\pi r^2 + 20/r$ for $V = 10\ \text{m}^3$: a single valley, at $r = ${RT.toFixed(3)}$ m.` }),
    steps: [
      { label: 'Model', text: t`Area of two ends plus the side: $A = 2\pi r^2 + 2\pi r h$, with radius $r$ and height $h$ in metres. Constraint: $\pi r^2 h = 10$.` },
      { label: 'One variable', text: t`$h = \dfrac{10}{\pi r^2}$, so $A(r) = 2\pi r^2 + 2\pi r\cdot\dfrac{10}{\pi r^2} = 2\pi r^2 + \dfrac{20}{r}$, for $r > 0$.` },
      { label: 'Critical point', text: t`$A'(r) = 4\pi r - \dfrac{20}{r^2} = 0 \Rightarrow r^3 = \dfrac{20}{4\pi} = \dfrac{5}{\pi} \Rightarrow r = ${RT.toFixed(3)}$ m.` },
      { label: 'Check it is a minimum', text: t`$A''(r) = 4\pi + \dfrac{40}{r^3} > 0$ for every $r > 0$, so this is the minimum. The domain has no endpoints to compare: $A \to \infty$ both as $r \to 0$ and as $r \to \infty$.` },
      { label: 'Height', text: t`$h = \dfrac{10}{\pi(${RT.toFixed(3)})^2} = ${HT.toFixed(3)}$ m $= 2r$. The best tank is as tall as it is wide.` },
      { label: 'Sense check', text: t`$A = 6\pi r^2 = ${AT.toFixed(1)}\ \text{m}^2$. A cube of the same volume (side $2.154$ m) needs $27.8\ \text{m}^2$; the cylinder does better, and a sphere ($22.4\ \text{m}^2$) better still.` },
    ],
    answer: t`$r = ${RT.toFixed(3)}$ m, $h = ${HT.toFixed(3)}$ m (height = diameter), using $${AT.toFixed(1)}\ \text{m}^2$ of metal.`,
  },
  practice: [
    num({
      id: 'box-fold', difficulty: 2,
      gen(r) {
        const L = r.pick([12, 18, 24, 30, 36]), x = L / 6;
        return {
          prompt: t`An open-topped box is folded from a square sheet $${L}$ cm on a side by cutting a square of side $x$ from each corner and turning up the flaps. What $x$ gives the largest volume, in cm?`,
          answer: x, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: L / 2, feedback: t`At $x = ${L / 2}$ cm nothing is left of the base: the volume is $0$. That root of $V'$ is outside the useful domain $0 < x < ${L / 2}$.` }, { value: L / 4, feedback: t`Differentiate $V = x(${L} - 2x)^2$ carefully (product and chain rules), then solve $V' = 0$.` }],
          hints: [t`$V(x) = x(${L} - 2x)^2$ for $0 < x < ${L / 2}$.`, t`$V'(x) = (${L} - 2x)^2 - 4x(${L} - 2x) = (${L} - 2x)(${L} - 6x)$.`, t`$V' = 0$ at $x = ${L / 2}$ (no box) or $x = ${L}/6$.`],
          teach: 'State the domain before solving: a root of Q′ outside it, or at its edge, is not the answer.',
          explain: t`$V'(x) = (${L} - 2x)(${L} - 6x)$ vanishes at $x = ${nice(x)}$ cm inside the domain; $V$ is $0$ at both ends, so this is the maximum: $V = ${nice(x * (L - 2 * x) ** 2)}\ \text{cm}^3$.`,
          visual: curveFig({ fn: `x*(${L} - 2*x)^2`, x: [-0.03 * L, 0.53 * L], y: [-0.03 * 2 * L ** 3 / 27, 1.12 * 2 * L ** 3 / 27], xlabel: 'x', ylabel: 'V', extra: { xticks: 0, yticks: 0 }, domain: [0, L / 2], caption: t`The shape of $V(x)$ over $0 \le x \le ${L / 2}$ cm (axes left unnumbered): zero at both ends, one hump between.` }),
        };
      },
    }),
    num({
      id: 'cost-tank', difficulty: 3,
      gen(r) {
        const m = r.pick([2, 3]), V = r.pick([5, 10, 20]), R = Math.cbrt(V / (2 * PI * m));
        return {
          prompt: t`A closed cylindrical tank must hold $${V}\ \text{m}^3$. The end plates are thicker than the wall, so per square metre they cost $${m}$ times as much. What radius minimizes the cost, in m?`,
          answer: R, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: Math.cbrt(V / (2 * PI)), feedback: t`That is the least-*area* radius. Weight the ends by $${m}$: cost $\propto 2\pi r h + ${m}\cdot 2\pi r^2$.` }],
          hints: [t`Cost $C \propto 2\pi r h + ${2 * m}\pi r^2$, with $h = ${V}/(\pi r^2)$.`, t`$C(r) = \dfrac{${2 * V}}{r} + ${2 * m}\pi r^2$ (in units of the wall price).`, t`$C'(r) = -\dfrac{${2 * V}}{r^2} + ${4 * m}\pi r = 0 \Rightarrow r^3 = \dfrac{${V}}{${2 * m}\pi}$.`],
          teach: 'Optimize what you are asked to optimize: a cost weights each part of the area by its price.',
          explain: t`$r^3 = \dfrac{${V}}{${2 * m}\pi}$ gives $r = ${nice(R, 4)}$ m and $h = ${nice(V / (PI * R * R), 4)}$ m, so $h = ${2 * m}r$: dearer ends make a taller, slimmer tank.`,
          visual: curveFig({ fn: `${2 * V}/x + ${2 * m}*pi*x^2`, x: [0, 2.6], y: [0, fitY((x) => 2 * V / x + 2 * m * PI * x * x, 0.35, 2.6)[1]], xlabel: 'r', ylabel: 'cost', extra: { xticks: 0, yticks: 0 }, domain: [0.3, 2.6], curves: [{ fn: `${2 * V}/x + 2*pi*x^2`, color: 'ink3', dash: true, width: 1.4, domain: [0.3, 2.6] }], caption: t`Cost against radius (solid) and plain area (dashed), axes unnumbered. The dearer ends push the best radius smaller.` }),
        };
      },
    }),
    num({
      id: 'power-transfer', difficulty: 2,
      gen(r) {
        const E = r.pick([6, 9, 12, 24]), ri = r.pick([0.5, 1, 1.5, 2]), P = E * E / (4 * ri);
        return {
          prompt: t`A source with emf $\mathcal{E} = ${E}$ V and internal resistance $r = ${ri}\ \Omega$ drives a load $R$. The load’s power is $P(R) = \dfrac{\mathcal{E}^2 R}{(R + r)^2}$. What is the largest power the load can draw, in W?`,
          answer: P, units: 'W', tol: { rel: 0.005 },
          errors: [{ value: E * E / ri, feedback: t`That is $\mathcal E^2/r$, the power at $R = 0$ if all of it went into the load. Find the best $R$ first ($R = r$), then evaluate $P$.` }, { value: E * E / (2 * ri), feedback: t`At $R = r$ the denominator is $(2r)^2 = 4r^2$.` }],
          hints: [t`Quotient rule: $P'(R) = \mathcal{E}^2\dfrac{(R + r)^2 - 2R(R + r)}{(R + r)^4} = \mathcal{E}^2\dfrac{r - R}{(R + r)^3}$.`, t`$P' = 0$ at $R = r$; then $P = \dfrac{\mathcal E^2 r}{4r^2}$.`],
          teach: 'Maximum power transfer: a load draws the most power when its resistance matches the source’s internal resistance.',
          explain: t`$P' \propto r - R$ changes from $+$ to $-$ at $R = r = ${ri}\ \Omega$, so $P_{\max} = \dfrac{\mathcal E^2}{4r} = \dfrac{${E * E}}{${4 * ri}} = ${nice(P)}$ W. At that point the source wastes as much power inside itself as it delivers.`,
          visual: curveFig({ fn: `${E * E}*x/(x + ${ri})^2`, x: [0, 8 * ri], y: [0, 1.25 * P], xlabel: 'R (Ω)', ylabel: 'P', extra: { yticks: 0 }, domain: [0, 8 * ri], caption: t`Load power against load resistance (power axis unnumbered). An ideal source with a fixed internal resistance.` }),
        };
      },
    }),
    num({
      id: 'hopper-range', difficulty: 2,
      gen(r) {
        const v = r.pick([40, 50, 60, 80]), g = 1.62, R = v * v / g / 1000;
        return {
          prompt: t`A small hopper on the Moon ($g = 1.62\ \text{m/s}^2$, no air) leaves level ground at $${v}$ m/s, pitched at angle $\theta$ above the horizontal. Its range is $R(\theta) = \dfrac{v^2\sin 2\theta}{g}$. What is the largest range it can reach, in km?`,
          answer: R, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: v * v / 9.81 / 1000, feedback: t`You used Earth’s gravity. On the Moon $g = 1.62\ \text{m/s}^2$.` }, { value: R / 2, feedback: t`That is $v^2/(2g)$, the height of a vertical hop. The range is largest at $\sin 2\theta = 1$: $R = v^2/g$.` }],
          hints: [t`$R'(\theta) = \dfrac{2v^2\cos 2\theta}{g} = 0$ at $2\theta = 90^\circ$.`, t`At $\theta = 45^\circ$, $R = v^2/g$.`],
          teach: t`With no air and level ground, range $\propto \sin 2\theta$ peaks at $45^\circ$.`,
          explain: t`$R' = 0$ at $\theta = 45^\circ$, the only critical point in $0 < \theta < 90^\circ$; $R = 0$ at both ends, so it is the maximum: $R = \dfrac{${v}^2}{1.62} = ${nice(v * v / g, 4)}$ m $= ${nice(R, 3)}$ km.`,
          visual: curveFig({ fn: 'sin(2*x*pi/180)', x: [0, 92], y: [-0.06, 1.2], xlabel: 'θ (degrees)', ylabel: 'R', extra: { yticks: 0 }, domain: [0, 90], caption: 'The shape of R(θ), range axis unnumbered. Level ground, no air; a real hopper fires its engine for a while rather than launching instantly.' }),
        };
      },
    }),
    mcq({
      id: 'find-error-endpoint', difficulty: 3, kind: 'error',
      prompt: t`To find the maximum of $f(x) = x^3 - 3x$ on $[0, 3]$, a student solves $f'(x) = 3x^2 - 3 = 0$, gets $x = 1$ (the only root in the interval), and concludes the maximum is $f(1)$. What went wrong?`,
      visual: curveFig({ fn: 'x^3 - 3*x', x: [-0.2, 3.2], y: [-3.5, 20], domain: [0, 3], caption: t`$y = x^3 - 3x$ on $[0, 3]$.` }),
      choices: [
        t`$x = 1$ is a minimum, and the endpoints were not checked: the maximum is $f(3) = 18$`,
        t`Nothing: the only critical point in the interval must be the maximum`,
        t`The root $x = -1$ should have been used`,
        t`The maximum is $f(0) = 0$, because $f$ starts there`,
      ],
      answer: 0,
      why: {
        1: t`A lone critical point can be a minimum. $f(1) = -2$ is the *lowest* value here.`,
        2: t`$x = -1$ is outside $[0, 3]$; it does not count.`,
        3: t`$f(3) = 18$ is larger than $f(0) = 0$. Compare all the candidates.`,
      },
      hints: ['On a closed interval the candidates are the critical points inside it and both endpoints.', t`Evaluate $f$ at $0$, $1$ and $3$, and compare.`],
      teach: 'On a closed interval, always compare the critical points with the endpoints.',
      explain: t`$f(0) = 0$, $f(1) = -2$, $f(3) = 18$. The largest is $18$, at the endpoint $x = 3$; $x = 1$ is the minimum.`,
    }),
    mcq({
      id: 'capsule-sphere', difficulty: 3,
      prompt: t`A pressurant tank is a capsule: a cylinder of length $L$ and radius $r$ capped by two hemispheres. Its volume $V = \pi r^2 L + \tfrac43\pi r^3$ is fixed. Its surface area works out to $A(r) = \dfrac{2V}{r} + \dfrac{4}{3}\pi r^2$ for $L \ge 0$. Which shape needs the least material?`,
      visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-1.5, 1.5], equal: true, axes: false, grid: false, aspect: 'wide', curves: capsule(2.4, 1), arrows: [{ from: [-1.2, -1.25], to: [1.2, -1.25], color: 'gold', width: 1.6, label: 'L' }, { from: [1.2, 0], to: [2.2, 0], color: 'violet', width: 1.6, label: 'r' }] }, caption: 'A capsule tank: two hemispheres of radius r joined by a cylinder of length L. Not to scale.' },
      choices: [t`$L = 0$: a sphere`, t`$L = 2r$`, t`$L = r$`, t`$L = 4r$`],
      answer: 0,
      why: {
        1: t`$h = 2r$ is the answer for a cylinder with **flat** ends. With hemispherical caps the result changes.`,
        2: t`Solve $A'(r) = 0$: $-\dfrac{2V}{r^2} + \dfrac83\pi r = 0$ gives $V = \tfrac43\pi r^3$ — no room left for a cylinder.`,
        3: t`A longer cylinder only adds side area for the volume it holds. Solve $A'(r) = 0$.`,
      },
      hints: [t`Set $A'(r) = -\dfrac{2V}{r^2} + \dfrac{8}{3}\pi r = 0$.`, t`That gives $V = \tfrac43\pi r^3$. Compare with $V = \pi r^2 L + \tfrac43\pi r^3$: what must $L$ be?`],
      teach: 'Sometimes the optimum sits at the edge of the family of shapes — here, the capsule with no cylinder at all.',
      explain: t`$A' = 0$ gives $\tfrac43\pi r^3 = V$, so $\pi r^2 L = 0$ and $L = 0$: the best capsule is a sphere, which encloses a given volume with the least surface of any shape. That is why high-pressure helium and nitrogen bottles on spacecraft are spheres, and long tanks are a compromise forced by the shape of a rocket.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-beam', difficulty: 3,
      gen(r) {
        const d = r.pick([30, 40, 50, 60]), w = d / Math.sqrt(3);
        return {
          prompt: t`A rectangular beam is sawn from a round log of diameter $${d}$ cm. Its bending strength is proportional to $wh^2$, where $w$ is the width and $h$ the depth, and the corners lie on the circle: $w^2 + h^2 = ${d}^2$. What width gives the strongest beam, in cm?`,
          answer: w, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: d / Math.sqrt(2), feedback: t`That is the square cross-section, which maximizes the area $wh$, not the strength $wh^2$.` }],
          hints: [t`Write $S(w) = w(${d * d} - w^2) = ${d * d}w - w^3$ for $0 < w < ${d}$.`, t`$S'(w) = ${d * d} - 3w^2 = 0$.`],
          teach: 'Substitute the constraint into the quantity first, so it depends on one variable, then differentiate.',
          explain: t`$S'(w) = ${d * d} - 3w^2 = 0$ gives $w = ${d}/\sqrt3 = ${nice(w, 4)}$ cm, and then $h = \sqrt2\,w = ${nice(Math.sqrt(2) * w, 4)}$ cm. $S = 0$ at both ends of the domain, so this is the maximum.`,
          visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-1.15, 1.15], equal: true, axes: false, grid: false, aspect: 'wide', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * PI], color: 'ink3' }, { fn: '0.8', domain: [-0.6, 0.6], color: 'accent' }, { fn: '-0.8', domain: [-0.6, 0.6], color: 'accent' }, { param: ['0.6', 't'], t: [-0.8, 0.8], color: 'accent' }, { param: ['-0.6', 't'], t: [-0.8, 0.8], color: 'accent' }], arrows: [{ from: [-0.6, -0.92], to: [0.6, -0.92], color: 'gold', width: 1.5, label: 'w' }, { from: [0.7, -0.8], to: [0.7, 0.8], color: 'violet', width: 1.5, label: 'h' }] }, caption: 'The log’s cross-section with one possible beam; its corners touch the circle. Not the optimum.' },
        };
      },
    }),
    num({
      id: 'cp-rover', difficulty: 3, transfer: true,
      gen(r) {
        const [v1, v2] = r.pick([[4, 2], [5, 3], [5, 4]]), d = r.pick([30, 40, 50]), L = 100;
        const k = v2 / v1, x = L - d * k / Math.sqrt(1 - k * k);
        return {
          prompt: t`A Mars rover drives at $${v1}$ cm/s along a firm track (the $x$-axis) and at only $${v2}$ cm/s on the soft sand beside it. Its target is $${L}$ m down the track and $${d}$ m off to the side. It drives $x$ metres along the track, then heads straight across the sand to the target. What $x$ gets it there soonest, in m?`,
          answer: x, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: L, feedback: t`Driving all the way along the track first is not best: cutting across a little earlier saves more track time than it costs on the sand.` }],
          hints: [t`Time: $T(x) = \dfrac{x}{${v1}} + \dfrac{\sqrt{${d}^2 + (${L} - x)^2}}{${v2}}$ (in units where the speeds are in cm/s — any consistent units work).`, t`$T'(x) = \dfrac{1}{${v1}} - \dfrac{${L} - x}{${v2}\sqrt{${d}^2 + (${L} - x)^2}} = 0$.`, t`So $\dfrac{${L} - x}{\sqrt{${d}^2 + (${L} - x)^2}} = \dfrac{${v2}}{${v1}}$; with $u = ${L} - x$, square and solve: $u = \dfrac{${d}\cdot ${v2}/${v1}}{\sqrt{1 - (${v2}/${v1})^2}}$.`],
          teach: 'Least time across two media gives a condition on the angle of the crossing — Snell’s law of refraction comes from exactly this calculation (Fermat’s principle).',
          explain: t`The sand leg must satisfy $\sin\phi = ${v2}/${v1}$, where $\phi$ is its angle from the perpendicular, so it runs $${nice(L - x, 4)}$ m along the track while crossing $${d}$ m: $x = ${nice(x, 4)}$ m. $T'$ goes from $-$ to $+$ there, so it is the minimum. Light obeys the same rule at a glass surface.`,
          visual: { type: 'graph', params: { x: [-5, 112], y: [-12, 62], aspect: 'wide', xlabel: 'along the track (m)', ylabel: 'off the track (m)', curves: [{ fn: '0', color: 'ink3', width: 3, domain: [0, 105] }, { fn: `${d}/40*(x - 60)`, color: 'gold', dash: true, width: 1.6, domain: [60, 100] }], points: [{ x: 0, y: 0, color: 'accent', label: 'start' }, { x: L, y: d, color: 'good', label: 'target' }, { x: 60, y: 0, color: 'gold', label: 'turn off?', labelDx: -8, labelDy: -4, labelAlign: 'right' }], arrows: [{ from: [0, -7], to: [60, -7], color: 'accent', width: 1.5, label: 'x', labelDy: 4 }] }, caption: 'The track (grey), the target, and one possible route (gold dashes) — not the best one. The sand is assumed uniform.' },
        };
      },
    }),
    num({
      id: 'cp-closed', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[-3, 5], [-5, 3], [-3, 3], [-4, 2]]), f = (x) => x ** 3 - 12 * x;
        const cands = [a, b, -2, 2].filter((x) => x >= a && x <= b), best = Math.max(...cands.map(f));
        const crit = Math.max(...[-2, 2].filter((x) => x >= a && x <= b).map(f));
        return {
          prompt: t`Find the absolute maximum value of $f(x) = x^3 - 12x$ on $[${a}, ${b}]$.`,
          answer: best, tol: { rel: 0, abs: 0.01 },
          errors: best !== crit ? [{ value: crit, feedback: t`That is the larger critical value. Check the endpoints too: $f(${b}) = ${f(b)}$.` }] : [],
          hints: [t`$f'(x) = 3x^2 - 12 = 0$ at $x = \pm2$.`, t`Compare $f(${a})$, $f(-2)$, $f(2)$ and $f(${b})$.`],
          teach: 'Closed-interval method: evaluate f at every critical point inside the interval and at both endpoints; the largest value wins.',
          explain: t`$f(${a}) = ${f(a)}$, $f(-2) = 16$, $f(2) = -16$, $f(${b}) = ${f(b)}$. The largest is $${best}$.`,
          visual: curveFig({ fn: 'x^3 - 12*x', x: [a - 0.5, b + 0.5], y: fitY(f, a, b), domain: [a, b], caption: t`$y = x^3 - 12x$ on $[${a}, ${b}]$.` }),
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §4.7 Applied optimization problems', url: 'https://openstax.org/books/calculus-volume-1/pages/4-7-applied-optimization-problems' }],
});
