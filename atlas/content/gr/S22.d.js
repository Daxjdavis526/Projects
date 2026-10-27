// Horizons in Eddington–Finkelstein and Kruskal coordinates — Derivation Mode.
// The Kretschmann scalar 48M²/r⁶ is finite at r = 2M (3/4M⁴) and infinite at
// r = 0. Radial light: dt = ±dr*, r* = r + 2M ln|r/2M − 1|. Ingoing
// coordinates v = t + r*: ds² = −(1 − 2M/r)dv² + 2dv dr + r²dΩ², regular at
// 2M (det g = −r⁴sin²θ, still Ricci-flat); outgoing light dr/dv = ½(1 − 2M/r);
// g^rr = 1 − 2M/r vanishes on the horizon, so it is a null surface. Kruskal:
// U = −e^{−u/4M}, V = e^{v/4M}, UV = (1 − r/2M)e^{r/2M},
// ds² = −(32M³/r)e^{−r/2M}dU dV + r²dΩ² (SymPy: reproduces Schwarzschild for
// r > 2M and r < 2M); T, X with light at 45°, r = const hyperbolae, t = const
// lines T/X = tanh(t/4M), singularity T² − X² = 1; Penrose squeeze Ũ = arctan U,
// Ṽ = arctan V puts the singularity on Ũ + Ṽ = π/2. Also: t* = v − r gives
// outgoing dr/dt* = (r − 2M)/(r + 2M); outgoing coordinates reach the white
// hole; near the horizon the metric is Rindler's with κ = 1/4M; the E = 0 path
// X = 0 takes πM from r = 2M to r = 0; a faller's free-fall path in Kruskal
// form, U and V smooth through the crossing (checked against MTW's t(η)).
// G = c = 1 throughout. Avoids gr.S22.i (τ_max and fall-time numbers, tides,
// area, Hawking numbers, the e-folding time) and gr.EQ.8 (compactness, the
// angular term, the far limit, the sign flip inside, proper distance, r_s from
// orbits, which clock reads t, local light speed).
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { C, M_SUN, T_SUN, sci, round, metricTable } from './_classic.js';

const t = String.raw;

// ─── the Kruskal plane, G = c = 1 and M = 1 ─────────────────────────────────
const Kr = (r) => (r / 2 - 1) * Math.exp(r / 2);            // X² − T² on the sphere of radius r
const K_OUT = '(R/2 - 1)*exp(R/2)', K_IN = '(1 - R/2)*exp(R/2)';
const SGR = 4.30e6, M87 = 6.5e9;                             // solar masses

/** A sphere of constant r: a hyperbola, in region I (r > 2M) or region II (r < 2M). */
const hyp = (r, { color = 'accent', width = 1.6, label, at = -0.7, dx, dy, align, span = 4 } = {}) => {
  const a = round(Math.sqrt(Math.abs(Kr(r))), 6);
  const param = r > 2 ? [`${a}*cosh(t)`, `${a}*sinh(t)`] : [`${a}*sinh(t)`, `${a}*cosh(t)`];
  return { param, t: [-span, span], color, width, label, labelAt: at, labelDx: dx, labelDy: dy, labelAlign: align };
};

/** Horizons, singularities and region names; extra curves, points and arrows on top. */
function kruskal({ x = [-3, 3], y = [-2.5, 3.5], curves = [], points = [], arrows = [], regions = true, past = true, hLabel = 2.3, hDx = 8, hDy = 4, hAlign, sLabel = -2.3, shade = true, sliders, readouts, caption, alt } = {}) {
  return {
    type: 'graph',
    params: {
      x, y, equal: true, aspect: 'square', xlabel: 'X', ylabel: 'T',
      ...(alt ? { alt } : {}),
      ...(sliders ? { sliders } : {}),
      ...(shade ? { shade: [{ fn: 'sqrt(1 + x^2)', lower: 'abs(x)', from: x[0], to: x[1], color: 'bad', alpha: 0.07 }] } : {}),
      curves: [
        { fn: 'x', color: 'ink2', width: 1.6, label: 'r = 2M', labelAt: hLabel, labelDx: hDx, labelDy: hDy, labelAlign: hAlign },
        { fn: '-x', color: 'ink2', width: 1.6 },
        { fn: 'sqrt(1 + x^2)', color: 'bad', width: 2.6, label: 'r = 0', labelAt: sLabel, labelDy: -10 },
        ...(past ? [{ fn: '-sqrt(1 + x^2)', color: 'bad', width: 2.6, dash: true }] : []),
        ...curves,
      ],
      points: [
        ...(regions ? [
          { x: round(x[1] - 0.35 * (x[1] - 0) * 0.6, 3), y: round(-0.06 * (y[1] - y[0]), 3), label: 'I', r: 0.01, color: 'ink3', labelDx: 0, labelDy: 0, labelAlign: 'center' },
          { x: 0, y: 0.62, label: 'II', r: 0.01, color: 'ink3', labelDx: 0, labelDy: 0, labelAlign: 'center' },
          ...(x[0] < -1 ? [{ x: round(x[0] + 0.21 * (0 - x[0]) * 0.6, 3), y: round(-0.06 * (y[1] - y[0]), 3), label: 'III', r: 0.01, color: 'ink3', labelDx: 0, labelDy: 0, labelAlign: 'center' }] : []),
          ...(y[0] < -0.8 ? [{ x: 0, y: -0.62, label: 'IV', r: 0.01, color: 'ink3', labelDx: 0, labelDy: 0, labelAlign: 'center' }] : []),
        ] : []),
        ...points,
      ],
      ...(arrows.length ? { arrows } : {}),
      ...(readouts ? { readouts } : {}),
    },
    ...(caption ? { caption } : {}),
  };
}

// ─── the Penrose diagram: Ũ = arctan U, Ṽ = arctan V; X̃ = (Ṽ − Ũ)/2, T̃ = (Ṽ + Ũ)/2 ────
const Q = round(Math.PI / 4, 6), H = round(Math.PI / 2, 6);
const penroseR = (r) => {                                    // a sphere of constant r, as a curve
  const a = round(Math.sqrt(Math.abs(Kr(r))), 6);
  return r > 2
    ? [`(atan(${a}*exp(t)) + atan(${a}*exp(-t)))/2`, `(atan(${a}*exp(t)) - atan(${a}*exp(-t)))/2`]
    : [`(atan(${a}*exp(t)) - atan(${a}*exp(-t)))/2`, `(atan(${a}*exp(t)) + atan(${a}*exp(-t)))/2`];
};
const penroseT = (tt) => {                                   // a line of constant Schwarzschild t outside, from the centre to i⁰
  const p = round(Math.exp(tt / 4), 6), m = round(Math.exp(-tt / 4), 6);
  return [`(atan(${p}*exp(t)) + atan(${m}*exp(t)))/2`, `(atan(${p}*exp(t)) - atan(${m}*exp(t)))/2`];
};
const penrose = {
  type: 'graph',
  params: {
    x: [-1.72, 1.72], y: [-0.97, 0.97], equal: true, aspect: 'wide', xlabel: '', ylabel: '', axes: false, grid: false,
    shade: [{ fn: `${Q}`, lower: 'abs(x)', from: -Q, to: Q, color: 'bad', alpha: 0.07 }],
    curves: [
      ...[2.5, 3, 4, 6].map((r, k) => ({ param: penroseR(r), t: [-9, 9], color: 'accent', width: 1.5, ...(k === 0 ? { label: 'r = 2.5M', labelAt: 0, labelDx: -6, labelDy: 12, labelAlign: 'right' } : {}) })),
      { param: penroseR(1.5), t: [-9, 9], color: 'violet', width: 1.5, label: 'r = 1.5M', labelAt: 0, labelDx: 0, labelDy: 14, labelAlign: 'center' },
      ...[-8, -4, 4, 8].map((tt) => ({ param: penroseT(tt), t: [-9, 9], color: 'gold', width: 1.2, dash: true, ...(tt === 4 ? { label: 't = 4M', labelAt: -1, labelDx: 6, labelDy: -4 } : {}) })),
      { fn: '0', domain: [0, H], color: 'gold', width: 1.2, dash: true },
      { fn: 'x', domain: [-Q, Q], color: 'ink2', width: 1.6 },
      { fn: '-x', domain: [-Q, Q], color: 'ink2', width: 1.6, label: 'horizon', labelAt: -0.5, labelDx: -8, labelDy: -12, labelAlign: 'right' },
      { fn: `${Q}`, domain: [-Q, Q], color: 'bad', width: 2.6, label: 'singularity r = 0', labelAt: -0.32, labelDy: -12 },
      { fn: `-${Q}`, domain: [-Q, Q], color: 'bad', width: 2.6, dash: true },
      { fn: `${H} - abs(x)`, domain: [Q, H], color: 'ink3', width: 1.4, label: 'ℐ⁺', labelAt: 1.25, labelDx: 6, labelDy: -8 },
      { fn: `abs(x) - ${H}`, domain: [Q, H], color: 'ink3', width: 1.4, label: 'ℐ⁻', labelAt: 1.25, labelDx: 6, labelDy: 14 },
      { fn: `${H} - abs(x)`, domain: [-H, -Q], color: 'ink3', width: 1.4 },
      { fn: `abs(x) - ${H}`, domain: [-H, -Q], color: 'ink3', width: 1.4 },
    ],
    points: [
      { x: Q, y: Q, r: 3, color: 'ink2', label: 'i⁺', labelDx: 6, labelDy: -6 },
      { x: H, y: 0, r: 3, color: 'ink2', label: 'i⁰', labelDx: 8, labelDy: 4 },
      { x: Q, y: -Q, r: 3, color: 'ink2', label: 'i⁻', labelDx: 6, labelDy: 10 },
      { x: 1.05, y: -0.2, r: 0.01, color: 'ink3', label: 'I', labelDx: 0, labelDy: 0, labelAlign: 'center' },
      { x: 0, y: 0.3, r: 0.01, color: 'ink3', label: 'II', labelDx: 0, labelDy: 0, labelAlign: 'center' },
      { x: -1.05, y: -0.2, r: 0.01, color: 'ink3', label: 'III', labelDx: 0, labelDy: 0, labelAlign: 'center' },
      { x: 0, y: -0.5, r: 0.01, color: 'ink3', label: 'IV', labelDx: 0, labelDy: 0, labelAlign: 'center' },
    ],
  },
  caption: t`The whole eternal black hole on one sheet — a **Penrose diagram** ($G = c = 1$): Kruskal's $U$ and $V$ each squeezed with arctan, so light still runs at 45° and infinity becomes an edge. Blue: spheres of constant $r$ outside ($2.5M$, $3M$, $4M$ and $6M$, from the centre outward); violet: $r = 1.5M$ inside, a moment rather than a place; gold dashed: Schwarzschild time $t = 0$, $\pm4M$, $\pm8M$ outside, all meeting at the centre and at spatial infinity $i^0$. Outgoing light ends on $\mathscr I^+$. Regions III and IV belong to the eternal vacuum solution; a black hole formed by a collapsing star keeps only I and II, with the star in place of the rest.`,
};

// ─── a probe falling from rest at r = 4M, in Kruskal form ─────────────────────
// Cycloid: r = 2(1 + cos η), τ = 2√2(η + sin η). U and V are smooth through the
// crossing (η = π/2); the release time is chosen so that the crossing is at U = 0, V = 1.
const B = round(0.5 * Math.log(2) + 1 + Math.PI / 2, 8);
const fallU = (e) => -(Math.cos(e / 2) - Math.sin(e / 2)) * Math.exp((1 + Math.cos(e)) / 2 - e - Math.sin(e) / 2 + B);
const fallV = (e) => (Math.cos(e / 2) + Math.sin(e / 2)) * Math.exp((1 + Math.cos(e)) / 2 + e + Math.sin(e) / 2 - B);
const VS = `(cos(t/2) + sin(t/2))*exp((1 + cos(t))/2 + t + sin(t)/2 - ${B})`, US = `(cos(t/2) - sin(t/2))*exp((1 + cos(t))/2 - t - sin(t)/2 + ${B})`;
const tauOf = (e) => 2 * Math.SQRT2 * (e + Math.sin(e));
const etaOf = (tau) => { let lo = 0, hi = Math.PI; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (tauOf(m) < tau) lo = m; else hi = m; } return (lo + hi) / 2; };
const TAU_H = tauOf(Math.PI / 2);
const ticks = [-1, -0.75, -0.5, -0.25, 0.5].map((d) => { const e = etaOf(TAU_H + d), U = fallU(e), V = fallV(e); return { d, U, X: (V - U) / 2, T: (V + U) / 2 }; });
const fadePic = kruskal({
  x: [-0.6, 3], y: [-1, 2.6], past: false, regions: false, hLabel: 2.2, sLabel: -0.45,
  curves: [
    { param: [`(${VS} + ${US})/2`, `(${VS} - ${US})/2`], t: [0.9, round(Math.PI, 6)], color: 'gold', width: 2.8, label: 'probe', labelAt: 1.2, labelDx: 8, labelDy: 6 },
    ...ticks.map(({ d, U, X }) => d < 0
      ? { fn: `x + ${round(U, 6)}`, domain: [round(X, 6), 3], color: 'accent', width: 1.6 }
      : { fn: `x + ${round(U, 6)}`, domain: [round(X, 6), round((1 - U * U) / (2 * U), 6)], color: 'bad', width: 1.6 }),
  ],
  points: [
    ...ticks.map(({ d, X, T }) => ({ x: round(X, 5), y: round(T, 5), r: 4, color: d < 0 ? 'accent' : 'bad' })),
    { x: 2.15, y: 1.25, r: 0.01, color: 'accent', label: 'its signals', labelDx: 0, labelDy: 0, labelAlign: 'center' },
  ],
  caption: t`Kruskal diagram ($G = c = 1$). Gold: a probe falling from rest at $r = 4M$. Blue: signals it sends at equal ticks of its own clock, $0.25\,GM/c^3$ apart, in its last moments outside: evenly spaced 45° lines that hug the horizon ever longer before pulling away toward a distant telescope (beyond the top right). Red: a signal sent after the crossing, which can only reach $r = 0$.`,
});

// ─── other pictures ──────────────────────────────────────────────────────────
const slopePic = {
  type: 'graph',
  params: {
    x: [0, 12], y: [0, 8], xlabel: 'r / M', ylabel: 'dr*/dr',
    curves: [{ fn: 'x/(x - 2)', domain: [2.29, 12], color: 'accent', width: 2.4, label: 'dr*/dr = 1/(1 − 2M/r)', labelAt: 4.2, labelDx: 8, labelDy: -6 }],
    vlines: [{ x: 2, color: 'bad' }],
    hlines: [{ y: 1 }],
    points: [{ x: 2, y: 0.35, r: 0.01, color: 'bad', label: 'r = 2M', labelDx: -6, labelDy: 0, labelAlign: 'right' }],
  },
  caption: t`How fast the tortoise coordinate grows with $r$ ($G = c = 1$, $r$ in units of $M$): close to 1 far away (dashed line), without bound at the horizon — the area under this curve is what light's coordinate time adds up.`,
};

const invariantsPic = {
  type: 'graph',
  params: {
    x: [0, 8], y: [0, 6], xlabel: 'r / M', ylabel: '',
    curves: [
      { fn: 'x/(x - 2)', domain: [2.34, 8], color: 'gold', width: 2.4, label: 'gᵣᵣ in Schwarzschild coordinates', labelAt: 3.0, labelDx: 8, labelDy: -4 },
      { fn: '48/x^6', domain: [1.35, 8], color: 'accent', width: 2.4, label: 'Kretschmann scalar K·M⁴', labelAt: 1.45, labelDx: -8, labelDy: 0, labelAlign: 'right' },
    ],
    points: [{ x: 2, y: 0.75, color: 'accent', r: 5, label: 'K = 3/(4M⁴) at r = 2M', labelDx: 10, labelDy: 14 }],
    vlines: [{ x: 2, color: 'ink3' }],
  },
  caption: t`Two quantities near a black hole ($G = c = 1$, $r$ in units of $M$): the metric component $g_{rr} = 1/(1 - 2M/r)$ of Schwarzschild coordinates, and the Kretschmann scalar $K = R_{\alpha\beta\gamma\delta}R^{\alpha\beta\gamma\delta} = 48M^2/r^6$ from step 20, times $M^4$.`,
};

const iefTable = metricTable([
  ['−(1 − 2M/r)', '1', '', ''],
  ['1', '', '', ''],
  ['', '', 'r²', ''],
  ['', '', '', 'r² sin²θ'],
], {
  labels: ['v', 'r', 'θ', 'φ'],
  colors: [['accent', 'accent'], ['accent', 'accent']],
  caption: t`The metric in ingoing Eddington–Finkelstein coordinates $(v, r, \theta, \phi)$, lower-index components $g_{\mu\nu}$ ($G = c = 1$). Blue: the $v$–$r$ block.`,
});

const schwTable = metricTable([
  ['−(1 − 2M/r)', '', '', ''],
  ['', '1/(1 − 2M/r)', '', ''],
  ['', '', 'r²', ''],
  ['', '', '', 'r² sin²θ'],
], { caption: t`The input: Schwarzschild's metric in $(t, r, \theta, \phi)$, $G = c = 1$. The program re-expresses it in $(v, r, \theta, \phi)$ with $t = v - r^*(r)$.` });

const flashPic = (d) => {
  const a1 = round(Math.sqrt(Kr(2 + d)), 6);
  return kruskal({
    x: [-1, 3], y: [-1, 3], past: false, hLabel: 1.1, hDx: -10, hDy: -8, hAlign: 'right', sLabel: -0.75,
    curves: [
      hyp(4, { label: 'r = 4M', at: 0.25, dx: -8, dy: 4, align: 'right' }),
      { fn: `x - ${a1}`, domain: [a1, 3], color: 'gold', width: 2.6, label: 'the flash', labelAt: 2.35, labelDx: 8, labelDy: 10 },
    ],
    points: [{ x: a1, y: 0, color: 'gold', r: 5 }],
    caption: t`The flash on the Kruskal diagram ($G = c = 1$): it leaves $r = 2M + ${d}M$ at $t = 0$ (gold dot) and is a straight 45° line, running alongside the horizon before it pulls away. It meets the hyperbola $r = 4M$ far beyond the top of this frame.`,
  });
};

const hyperPic = kruskal({
  x: [-1, 3.2], y: [-1.6, 2.6], past: false, hLabel: 0.9, hDx: -10, hDy: -8, hAlign: 'right', sLabel: -0.8,
  curves: [hyp(2.5, { label: 'r = 2.5M', at: 0.9, dx: 8, dy: 4 }), hyp(3, { label: 'r = 3M', at: 0.9, dx: 8, dy: 4 }), hyp(4, { label: 'r = 4M', at: -0.25, dx: 8, dy: 4 })],
  caption: t`Spheres of constant $r$ on the Kruskal plane ($G = c = 1$): hyperbolae, the same at every Schwarzschild time $t$.`,
});

const rindlerPic = kruskal({
  x: [-0.3, 1.1], y: [-0.7, 0.7], past: false, regions: false, shade: false, hLabel: 0.3, hDx: -10, hDy: -8, hAlign: 'right', sLabel: -0.2,
  curves: [2.01, 2.04, 2.09, 2.16].map((r, k) => hyp(r, { color: 'accent', width: 1.6, ...(k === 3 ? { label: 'r = 2.16M', at: 0.5, dx: 8, dy: 6 } : {}) })),
  caption: t`The Kruskal diagram very close to the centre ($G = c = 1$). Blue: observers hovering just outside the horizon at fixed $r = 2.01M$, $2.04M$, $2.09M$ and $2.16M$. Here the diagram is a small patch of nearly flat spacetime, and these hyperbolae are the paths of rockets accelerating uniformly — with the horizon as their Rindler horizon.`,
});

const vLines = [0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.6];
const vPic = kruskal({
  x: [-1.5, 3], y: [-1.5, 3], past: false, hLabel: 1.9, sLabel: -0.9,
  curves: vLines.map((V0, k) => ({ fn: `${V0} - x`, domain: [round((V0 * V0 - 1) / (2 * V0), 6), 3], color: 'accent', width: 1.3, ...(k === 6 ? { label: 'v = constant', labelAt: 2.0, labelDx: 8, labelDy: 2 } : {}) })),
  caption: t`Lines of constant $v$ — ingoing light rays, along which $V = e^{v/4M}$ is constant — drawn on the Kruskal plane ($G = c = 1$). They fill regions I and II and nothing else: that is the part of spacetime the coordinates $(v, r)$ reach.`,
});

const ingoingPic = {
  type: 'graph',
  params: {
    x: [0, 8], y: [0, 8], equal: true, aspect: 'square', xlabel: 'r / M', ylabel: 't* / M',
    curves: [1, 2.5, 4, 5.5, 7, 8.5, 10, 11.5, 13, 14.5].map((c, k) => ({ fn: `${c} - x`, domain: [Math.max(0, c - 8), Math.min(8, c)], color: 'ink3', width: 1.3, ...(k === 4 ? { label: 'ingoing light', labelAt: 4.5, labelDx: 8, labelDy: -4 } : {}) })),
    vlines: [{ x: 2, label: 'r = 2M', color: 'bad' }],
  },
  caption: t`Radial light in the coordinates $(t^*, r)$ with $t^* = v - r$ ($G = c = 1$): the ingoing rays run at 45° everywhere. The other family is the question.`,
};

const bridgePic = {
  type: 'surface3d',
  params: {
    surface: ['(1 + u^2/4)*cos(v)', '(1 + u^2/4)*sin(v)', 'u'], domain: [[-2.5, 2.5], [0, 6.2832]], n: 34,
    axes: false, alpha: 0.42, colorBy: false, yaw: 0.55, pitch: 0.3, dist: 9.5, target: [0, 0, 0],
    curves: [
      { param: ['cos(t)', 'sin(t)', '0'], t: [0, 6.2832], color: 'gold', width: 3.2 },
      { param: ['2*cos(t)', '2*sin(t)', '2'], t: [0, 6.2832], color: 'accent', width: 1.8 },
      { param: ['2*cos(t)', '2*sin(t)', '-2'], t: [0, 6.2832], color: 'accent', width: 1.8 },
    ],
  },
  caption: t`**Embedding diagram** of the slice $T = 0$ ($t = 0$ in regions I and III), drawn so that distances along the surface are true distances; the height is not a direction in space, and nothing rolls on it. Two copies of the outside joined at a throat of radius $2M$ (gold): the Einstein–Rosen bridge. Blue: the sphere $r = 4M$ on each side. Drag to turn it.`,
};

// The Explore picture: an event placed with Schwarzschild's (t, r), its sphere, its line of constant t and its light cone
const explorePic = kruskal({
  alt: 'A Kruskal diagram with a movable event, its sphere of constant r and its light cone',
  sliders: [
    { key: 'R', label: 'Radius $r$ of the event', min: 0.2, max: 4, step: 0.05, value: 3, unit: 'M', explain: 'Schwarzschild’s r: the sphere through the event has area 4πr².' },
    { key: 'ts', label: 'Schwarzschild time $t$', min: -8, max: 8, step: 0.1, value: 2, unit: 'M', explain: 'The time of a clock far away. Inside the horizon the same formula gives a coordinate that labels position, not time.' },
  ],
  curves: [
    { param: [`sqrt(${K_OUT})*cosh(t)`, `sqrt(${K_OUT})*sinh(t)`], t: [-3.5, 3.5], color: 'accent', width: 2.2, when: 'step(R - 2)' },
    { param: [`sqrt(${K_IN})*sinh(t)`, `sqrt(${K_IN})*cosh(t)`], t: [-3.5, 3.5], color: 'accent', width: 2.2, when: 'step(2 - R)' },
    { param: ['t*cosh(ts/4)', 't*sinh(ts/4)'], t: [0, 12], color: 'gold', width: 1.6, dash: true, when: 'step(R - 2)' },
    { param: ['t*sinh(ts/4)', 't*cosh(ts/4)'], t: [0, 1], color: 'gold', width: 1.6, dash: true, when: 'step(2 - R)' },
  ],
  points: [
    { x: `sqrt(${K_OUT})*cosh(ts/4)`, y: `sqrt(${K_OUT})*sinh(ts/4)`, color: 'accent2', r: 6, when: 'step(R - 2)' },
    { x: `sqrt(${K_IN})*sinh(ts/4)`, y: `sqrt(${K_IN})*cosh(ts/4)`, color: 'accent2', r: 6, when: 'step(2 - R)' },
  ],
  arrows: [[`sqrt(${K_OUT})*cosh(ts/4)`, `sqrt(${K_OUT})*sinh(ts/4)`, 'step(R - 2)'], [`sqrt(${K_IN})*sinh(ts/4)`, `sqrt(${K_IN})*cosh(ts/4)`, 'step(2 - R)']].flatMap(([X, T, when]) => [
    { from: [X, T], to: [`${X} + 0.7`, `${T} + 0.7`], color: 'good', when },
    { from: [X, T], to: [`${X} - 0.7`, `${T} + 0.7`], color: 'good', when },
  ]),
  readouts: [
    { label: 'tortoise $r^*$', expr: 'R + 2*ln(abs(R/2 - 1))', unit: 'M', digits: 3 },
    { label: '$v = t + r^*$', expr: 'ts + R + 2*ln(abs(R/2 - 1))', unit: 'M', digits: 3 },
    { label: '$u = t - r^*$', expr: 'ts - R - 2*ln(abs(R/2 - 1))', unit: 'M', digits: 3 },
  ],
  caption: t`Kruskal coordinates for the eternal Schwarzschild black hole ($G = c = 1$, lengths in units of $M$). Grey diagonals: the horizon $r = 2M$; red: the singularity $r = 0$, where $T^2 - X^2 = 1$. Blue: the sphere of the event, $X^2 - T^2 = (r/2M - 1)e^{r/2M}$; gold dashed: its line of constant $t$, $T/X = \tanh(t/4M)$ outside. Region I is our outside, II the black hole, III a second outside, IV a white hole; a black hole formed by a collapsing star keeps only I and II, with the star in place of the rest.`,
});

export default lesson({
  id: 'gr.S22.d',
  title: 'Horizons in Eddington–Finkelstein and Kruskal coordinates',
  minutes: 18, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`Step 20's metric misbehaves at $r = 2M$: $g_{tt} \to 0$ and $g_{rr} \to \infty$. Step 21 only used it outside. Here we find out what $r = 2M$ is. A curvature invariant settles the first question: nothing physical is singular there. Then we build coordinates out of light rays — first the ingoing ones (Eddington and Finkelstein), then both families (Kruskal) — in which the metric is smooth through $r = 2M$, every radial light ray can be followed, and the horizon shows what it is: a surface made of outgoing light that never gets out.

Conventions: Carroll's, signature $(-,+,+,+)$, **with $G = c = 1$**, so $M$ means $GM/c^2$; $d\Omega^2 = d\theta^2 + \sin^2\theta\,d\phi^2$.`,
  equation: t`ds^2 = -\left(1 - \frac{2M}{r}\right)dv^2 + 2\,dv\,dr + r^2\,d\Omega^2, \qquad v = t + r^*, \quad r^* = r + 2M\ln\left|\frac{r}{2M} - 1\right|`,
  symbols: [
    { tex: 'v', text: 'the ingoing (advanced) time: constant along every ingoing radial light ray' },
    { tex: 'r^*', text: t`the tortoise coordinate, with $dr^*/dr = 1/(1 - 2M/r)$; it runs to $-\infty$ at the horizon` },
    { tex: 't', text: 'Schwarzschild time: the time kept by a clock at rest far away' },
    { tex: 'r', text: t`the areal radius: the sphere through the event has area $4\pi r^2$` },
    { tex: 'M', text: t`the mass as a length, $GM/c^2$: 1.48 km per solar mass` },
    { tex: 'd\\Omega^2', text: t`$d\theta^2 + \sin^2\theta\,d\phi^2$, the metric of a unit sphere` },
  ],
  why: 'Every statement about what happens at and inside a black hole — that nothing gets out, that a faller crosses in finite time, the area theorem, Hawking radiation — is made in coordinates like these, which cross the horizon.',
  visual: {
    ...explorePic,
    title: 'Schwarzschild’s map, redrawn by Kruskal',
    lead: t`Kruskal's $T$ (up) and $X$ (across), with $G = c = 1$: every radial light ray is a line at 45°. Place an event with Schwarzschild's $r$ and $t$. Blue: its sphere of constant $r$; gold dashed: its line of constant $t$; green: the two edges of its future light cone.`,
    tasks: [
      'Keep r = 3M and slide t up: the event climbs its hyperbola toward the line T = X but never reaches it — that line is t = +∞. Someone hovering at r = 3M never meets the horizon.',
      'Bring r down to 2M at fixed t: the event slides into the centre, whatever t is — every (t, r = 2M) is the same place. The readouts u and v run off to ±∞: that is where Schwarzschild’s coordinates fail.',
      'Go below 2M: the blue curve becomes a moment between the horizon and r = 0, and both edges of the light cone end on the red singularity.',
    ],
  },
  example: {
    prompt: t`Show that $r = 2M$ is only a coordinate singularity and $r = 0$ a real one; build coordinates that cross $r = 2M$; show that the horizon is a one-way, null surface; then draw the whole spacetime on one sheet.`,
    visual: penrose,
    steps: [
      { label: 'Ask an invariant', text: t`Components depend on the coordinates: in polar coordinates even a flat plane has $g_{\phi\phi} = r^2 \to 0$ at the origin. A scalar does not. In vacuum the Ricci scalar is $0$ everywhere, so use the Kretschmann scalar of step 20, $$K = R_{\alpha\beta\gamma\delta}R^{\alpha\beta\gamma\delta} = \frac{48M^2}{r^6}.$$ At $r = 2M$ it is $3/(4M^4)$ — finite; at $r = 0$ it diverges. So $r = 0$ is a true singularity, and $r = 2M$ may be a failure of the coordinates.` },
      { label: 'Follow the light', text: t`For radial light $ds^2 = 0$ with $d\theta = d\phi = 0$: $dt = \pm\,dr/(1 - 2M/r) = \pm\,dr^*$, with $r^* = r + 2M\ln|r/2M - 1|$. So $t + r^*$ is constant along ingoing rays and $t - r^*$ along outgoing ones. As $r \to 2M$, $r^* \to -\infty$: by the far-away clock, light never quite arrives.` },
      { label: 'Ingoing coordinates', text: t`Trade $t$ for $v = t + r^*$. Then $dt = dv - dr/(1 - 2M/r)$, and $$-\left(1 - \tfrac{2M}{r}\right)dt^2 + \frac{dr^2}{1 - 2M/r} = -\left(1 - \tfrac{2M}{r}\right)dv^2 + 2\,dv\,dr :$$ the $dr^2$ terms cancel. Nothing blows up at $r = 2M$ and $\det g = -r^4\sin^2\theta$ is not zero there: the metric is regular, and continues to every $r > 0$. (SymPy: it still has $R_{\mu\nu} = 0$.)` },
      { label: 'Light cones', text: t`Radial light now obeys $dv\left[-\left(1 - \tfrac{2M}{r}\right)dv + 2\,dr\right] = 0$: either $dv = 0$ (ingoing) or $$\frac{dr}{dv} = \frac12\left(1 - \frac{2M}{r}\right)$$ (outgoing). Outside it is positive; at $r = 2M$ it is zero — outgoing light stands still; inside it is negative — "outgoing" light falls too. Both edges of every light cone point to smaller $r$ inside, and so does every body's path.` },
      { label: 'A null surface', text: t`The surface $r = 2M$ has normal $n_\mu = \partial_\mu r$, whose square is $g^{\mu\nu}n_\mu n_\nu = g^{rr}$. Inverting the $v$–$r$ block gives $g^{rr} = 1 - 2M/r$, which vanishes at $r = 2M$: the normal is null, so it lies in the surface, and the surface is null — made of the standing light rays of the last step. A null surface can be crossed in one direction only, here inward. That is the event horizon.` },
      { label: 'Both families: Kruskal', text: t`Outgoing rays still have $u = t - r^* \to \infty$ on the horizon. Use both null coordinates and exponentiate them: $U = -e^{-u/4M}$, $V = e^{v/4M}$. Then $dU\,dV = -UV\,du\,dv/16M^2$ and $UV = -e^{r^*/2M} = -\left(\tfrac{r}{2M} - 1\right)e^{r/2M}$, so $-(1 - 2M/r)\,du\,dv$ becomes $$ds^2 = -\frac{32M^3}{r}\,e^{-r/2M}\,dU\,dV + r^2\,d\Omega^2 .$$ The factor $(r/2M - 1)$ has cancelled: nothing vanishes or blows up anywhere with $r > 0$. Allow every $U$, $V$ with $UV < 1$.` },
      { label: 'The Kruskal diagram', text: t`With $T = (V + U)/2$ and $X = (V - U)/2$, $ds^2 = \frac{32M^3}{r}e^{-r/2M}\left(-dT^2 + dX^2\right) + r^2d\Omega^2$, so radial light runs on lines $T = \pm X + \text{const}$ — at 45° everywhere (the Explore picture). Spheres of constant $r$ are hyperbolae $X^2 - T^2 = (r/2M - 1)e^{r/2M}$; lines of constant $t$ are $T/X = \tanh(t/4M)$; the horizon is $T = \pm X$, where $t = \pm\infty$; the singularity is $T^2 - X^2 = 1$. There are four regions: our outside (I), the black hole (II), a second outside (III) and a white hole (IV).` },
      { label: 'Squeeze, and check', text: t`Light cares only about $U$ and $V$ separately, so squeezing each with $\tilde U = \arctan U$, $\tilde V = \arctan V$ keeps it at 45° and pulls infinity in to a finite edge. The singularity $UV = 1$ becomes $\tilde U + \tilde V = \pi/2$, a horizontal line — the **Penrose diagram** above. Checks: far out both forms become flat spacetime, and SymPy confirms that the Kruskal metric gives back Schwarzschild's, for $r > 2M$ and for $r < 2M$.` },
    ],
    answer: t`$K = 48M^2/r^6$ is finite at $r = 2M$ and infinite at $r = 0$. In $(v, r)$, $ds^2 = -(1 - 2M/r)\,dv^2 + 2\,dv\,dr + r^2d\Omega^2$ is regular at $r = 2M$; outgoing light has $dr/dv = \tfrac12(1 - 2M/r)$ — zero on the horizon, negative inside; $g^{rr} = 0$ there, so the horizon is a null, one-way surface. Kruskal's $ds^2 = (32M^3/r)e^{-r/2M}(-dT^2 + dX^2) + r^2d\Omega^2$ covers everything, with light at 45°, and arctan squeezes it into the Penrose diagram.`,
  },
  practice: [
    expr({
      id: 'tortoise', difficulty: 2,
      prompt: t`Radial light obeys $dt = \pm\,dr/(1 - 2M/r)$ ($G = c = 1$). Writing $x = r/M$, find the tortoise coordinate $r^*/M$ outside the horizon ($x > 2$): an antiderivative of $\dfrac{1}{1 - 2/x}$.`,
      answer: 'x + 2 ln(x/2 - 1)',
      answerTeX: t`x + 2\ln\left(\frac{x}{2} - 1\right)`,
      lhs: 'r^*/M',
      vars: { x: [2.5, 12] }, mode: 'constant', integrand: '1/(1 - 2/x)',
      errors: [
        { answer: 'x - 2 ln(x - 2)', feedback: t`Check the sign: $\dfrac{1}{1 - 2/x} = 1 + \dfrac{2}{x - 2}$, whose integral has $+2\ln(x - 2)$.` },
        { answer: '2 ln(x - 2)', feedback: t`You lost the $1$: $\dfrac{x}{x - 2} = 1 + \dfrac{2}{x - 2}$ — integrate both terms.` },
        { answer: 'x + ln(x - 2)', feedback: t`The numerator is 2: $\dfrac{x}{x - 2} = 1 + \dfrac{2}{x - 2}$.` },
      ],
      hints: [t`Rewrite $\dfrac{1}{1 - 2/x} = \dfrac{x}{x - 2} = 1 + \dfrac{2}{x - 2}$.`, 'Integrate the two terms separately; any constant is fine.'],
      teach: t`Split the fraction: $x/(x - 2) = 1 + 2/(x - 2)$, then integrate term by term.`,
      explain: t`$\int\left(1 + \frac{2}{x - 2}\right)dx = x + 2\ln(x - 2) + C$, the same as $x + 2\ln(x/2 - 1)$ up to a constant. With $M$ restored, $r^* = r + 2M\ln(r/2M - 1)$. As $x \to 2$ the logarithm runs to $-\infty$: light needs infinite far-away time to reach the horizon — a property of the clock far away, not of the light.`,
      visual: slopePic,
    }),
    mcq({
      id: 'singular-test', difficulty: 2,
      prompt: t`In Schwarzschild coordinates $g_{rr} = 1/(1 - 2M/r)$ blows up at $r = 2M$, and other things go wrong at $r = 0$. Which test can show that spacetime itself is singular somewhere?`,
      choices: [
        t`A curvature scalar, such as the Kretschmann scalar $R_{\alpha\beta\gamma\delta}R^{\alpha\beta\gamma\delta}$, which every coordinate system gives the same value: here $48M^2/r^6$, finite at $2M$ and infinite at $0$`,
        t`A metric component that blows up, as $g_{rr}$ does at $r = 2M$`,
        t`The Ricci scalar $R$ blowing up`,
        t`The determinant of the metric vanishing, as $\det g = -r^4\sin^2\theta$ does at $r = 0$`,
      ],
      answer: 0,
      why: {
        1: t`Components change with the coordinates: in ingoing coordinates nothing blows up at $r = 2M$, and polar coordinates make a flat plane's $g^{\phi\phi}$ blow up at its origin.`,
        2: t`Outside matter $R_{\mu\nu} = 0$, so $R = 0$ everywhere — even arbitrarily close to $r = 0$. The Ricci scalar cannot see this singularity; the full Riemann tensor can.`,
        3: t`$\det g$ also vanishes on the polar axis $\theta = 0$, where nothing is wrong. A zero of the determinant flags bad coordinates as often as bad geometry.`,
      },
      hints: [t`Which of these quantities is the same in every coordinate system?`],
      teach: 'Only invariants — scalars built from the curvature — can distinguish a real singularity from a bad choice of coordinates. (Geodesics that end after finite proper time are the other test.)',
      explain: t`A scalar has one value at each event, whatever the coordinates. $K = 48M^2/r^6$ is $3/(4M^4)$ at the horizon — a curvature radius $K^{-1/4} = (4/3)^{1/4}M$ of ${round((4 / 3) ** 0.25 * 10 * M_SUN / 1e3, 2)} km for a 10-solar-mass hole and ${round((4 / 3) ** 0.25 * SGR * M_SUN / 1e9, 2)} million km for Sagittarius A*, nothing extreme — and infinite at $r = 0$. Finite invariants do not prove that a place is smooth, but here coordinates that are smooth at $r = 2M$ exist, which settles it.`,
      visual: invariantsPic,
    }),
    expr({
      id: 'inverse-rr', difficulty: 3,
      prompt: t`In ingoing coordinates $(v, r)$ the radial block of the metric is $$\begin{pmatrix} g_{vv} & g_{vr} \\ g_{rv} & g_{rr} \end{pmatrix} = \begin{pmatrix} -(1 - 2M/r) & 1 \\ 1 & 0 \end{pmatrix}$$ ($G = c = 1$). The surfaces $r = $ const have normal $n_\mu = \partial_\mu r$, whose square is $g^{\mu\nu}n_\mu n_\nu = g^{rr}$. Find $g^{rr}$.`,
      answer: '1 - 2M/r',
      answerTeX: t`1 - \frac{2M}{r}`,
      lhs: 'g^{rr}',
      vars: { r: [0.5, 10], M: [0.5, 2] },
      errors: [
        { answer: '0', feedback: t`That is $g_{rr}$, a lower-index component. Upper indices come from the inverse matrix.` },
        { answer: '-(1 - 2M/r)', feedback: t`Sign slip: the block's determinant is $-1$, which flips the sign of $g_{vv}$ as it moves into $g^{rr}$.` },
        { answer: '1/(1 - 2M/r)', feedback: t`That is Schwarzschild's $g_{rr}$. Invert the $v$–$r$ block instead.` },
      ],
      hints: [t`For a $2\times2$ matrix, $\begin{pmatrix} a & b \\ b & 0 \end{pmatrix}^{-1} = \dfrac{1}{-b^2}\begin{pmatrix} 0 & -b \\ -b & a \end{pmatrix}$.`, t`Here $a = -(1 - 2M/r)$ and $b = 1$, so $g^{vv} = 0$, $g^{vr} = 1$ and $g^{rr} = -a$.`],
      teach: t`Upper-index components come from the inverse matrix; $g^{rr} = g^{\mu\nu}\partial_\mu r\,\partial_\nu r$ is the squared length of the normal to a surface of constant $r$.`,
      explain: t`$g^{rr} = 1 - 2M/r$. Outside it is positive: the normal is spacelike, and a sphere of constant $r$ traces a timelike surface that can be crossed either way. At $r = 2M$ it is zero: the normal is null and lies in the surface — a null surface, crossable one way only. Inside it is negative: $r = $ const is a moment, and $r$ is a time. Because $r$ is the same function in all these coordinates, $g^{rr}$ is a scalar and Schwarzschild's coordinates give the same formula — they just cannot be used at $r = 2M$.`,
      visual: iefTable,
    }),
    num({
      id: 'flash-delay', difficulty: 2,
      gen(r) {
        const [d, h] = r.pick([[0.1, '1.48 km'], [0.01, '148 m'], [0.001, '14.8 m']]);
        const x1 = 2 + d, dtM = (4 - x1) + 2 * Math.log(2 / d), TM = 10 * T_SUN;
        return {
          prompt: t`Near a 10-solar-mass black hole a flash of light leaves $r = 2M + ${d}M$ (${h} above the horizon, measured in $r$), heading straight out. How much far-away time $t$ passes before it crosses $r = 4M$? Along outgoing light $t - r^*$ is constant, with $r^* = r + 2M\ln(r/2M - 1)$; for this hole $GM/c^3 = ${sci(TM * 1e6, 4)}\ \mu\text{s}$. Answer in milliseconds.`,
          answer: dtM * TM * 1e3, units: 'ms', tol: { rel: 0.01 },
          errors: [
            { value: (4 - x1) * TM * 1e3, feedback: t`That is only $\Delta r$ — the time light would take without gravity. The logarithm in $r^*$ is what grows near the horizon.` },
            { value: 2 * Math.log(2 / d) * TM * 1e3, feedback: t`You kept only the logarithm; $r^*$ also contains $r$ itself.` },
            { value: ((4 - x1) + 4 * Math.log(2 / d)) * TM * 1e3, feedback: t`The logarithm's coefficient is $2M$, not $4M$.` },
          ],
          hints: [t`$\Delta t = r^*(4M) - r^*(2M + ${d}M)$. In units of $M$, $r^*/M = x + 2\ln(x/2 - 1)$.`, t`$\Delta t = (4 - ${x1})M + 2M\ln\dfrac{2}{${d}}$; multiply by $GM/c^3$ for seconds.`],
          teach: t`Along outgoing radial light $u = t - r^*$ is constant, so the far-away time it takes is just the change in $r^*$.`,
          explain: t`$\Delta t = (4 - ${x1})M + 2M\ln(2/${d}) = ${round(dtM, 4)}M = ${round(dtM * TM * 1e3, 3)}$ ms. Each factor of 10 closer to the horizon adds $2M\ln 10 = ${round(2 * Math.log(10), 3)}M$, or $${round(2 * Math.log(10) * TM * 1e3, 2)}$ ms; from the horizon itself, the flash never gets out. On the Kruskal diagram the same flash is a straight 45° line — the delay is all in how $t$ labels it.`,
          visual: flashPic(d),
        };
      },
    }),
    expr({
      id: 'uv-product', difficulty: 2,
      prompt: t`Outside the horizon Kruskal's coordinates are $U = -e^{-u/4M}$ and $V = e^{v/4M}$, with $u = t - r^*$, $v = t + r^*$ and $r^* = r + 2M\ln(r/2M - 1)$ ($G = c = 1$). Find the product $UV$ as a function of $r$ alone. (Type $r/2M$ as \`r/(2M)\`.)`,
      answer: '-(r/(2M) - 1) e^(r/(2M))',
      answerTeX: t`-\left(\frac{r}{2M} - 1\right)e^{r/2M}`,
      lhs: 'UV',
      vars: { r: [2.5, 9], M: [0.8, 1.2] },
      errors: [
        { answer: '(r/(2M) - 1) e^(r/(2M))', feedback: t`Keep the minus sign of $U$: outside the horizon $UV < 0$.` },
        { answer: '-sqrt(r/(2M) - 1) e^(r/(4M))', feedback: t`$v - u = 2r^*$, so the exponent is $2r^*/4M = r^*/2M$, not $r^*/4M$.` },
        { answer: '-e^(r/(2M))', feedback: t`$e^{r^*/2M} = e^{r/2M}\,e^{\ln(r/2M - 1)}$: the logarithm in $r^*$ leaves a factor $(r/2M - 1)$.` },
      ],
      hints: [t`$UV = -e^{(v - u)/4M}$, and $v - u = 2r^*$.`, t`$e^{r^*/2M} = e^{r/2M}\,e^{\ln(r/2M - 1)}$.`],
      teach: 'The time t cancels in UV, so each sphere of constant r is a curve of constant UV — a hyperbola.',
      explain: t`$UV = -e^{2r^*/4M} = -\left(\frac{r}{2M} - 1\right)e^{r/2M}$. The time has dropped out, so each sphere of constant $r$ is a hyperbola $X^2 - T^2 = (r/2M - 1)e^{r/2M}$. At $r = 2M$ the product is $0$ — the horizon is $U = 0$ or $V = 0$; at $r = 0$ it is $1$ — the singularity; in between it is positive, inside the black hole.`,
      visual: hyperPic,
    }),
    num({
      id: 'throat', difficulty: 3,
      prompt: t`The slice $T = 0$ of the Kruskal diagram runs from region I through $X = 0$ into region III: two outsides joined by a throat at $r = 2M$, the Einstein–Rosen bridge (picture). By symmetry the throat stays at $X = 0$, which is a radial free fall with $E = 0$, so $(dr/d\tau)^2 = 2M/r - 1$ ($G = c = 1$). How much proper time passes there while the throat shrinks from $r = 2M$ to $r = 0$? Give the number in units of $M$: $$\tau = \int_0^{2M}\frac{dr}{\sqrt{2M/r - 1}}.$$`,
      answer: Math.PI, tol: { rel: 0.005 },
      integrand: '1/sqrt(2/x - 1)', limits: [0, 2], vars: ['x'],
      errors: [
        { value: 4 / 3, feedback: t`That is the time for a body that fell from rest far away ($E = 1$). The throat has $E = 0$, the slowest possible fall, and takes longer.` },
        { value: 2 * Math.PI, feedback: t`That is the bridge's whole life, from the past singularity to the future one. The question asks for the half after $T = 0$.` },
        { value: 2, feedback: t`That would be a fall at the speed of light. Integrate $dr/\sqrt{2M/r - 1}$.` },
      ],
      hints: [t`Substitute $r = 2M\sin^2\theta$: then $\sqrt{2M/r - 1} = \cos\theta/\sin\theta$ and $dr = 4M\sin\theta\cos\theta\,d\theta$.`, t`The integral becomes $\int_0^{\pi/2} 4M\sin^2\theta\,d\theta$.`],
      teach: t`Proper time along a radial path is $\int dr/|dr/d\tau|$; for $E = 0$ the radial equation gives $(dr/d\tau)^2 = 2M/r - 1$.`,
      explain: t`$\tau = \int_0^{\pi/2}4M\sin^2\theta\,d\theta = \pi M$. So the bridge lasts only a moment: its throat opens out of the past singularity and pinches off at the future one, $\pi M$ after $T = 0$ — too soon for anything, even light, to get from region I to region III, which on the Kruskal diagram would mean moving at more than 45°. Since $E = 0$ is the slowest fall, $\pi M$ is also the most proper time anyone can spend between the horizon and $r = 0$.`,
      visual: bridgePic,
    }),
    code({
      id: 'sympy-ief', difficulty: 3,
      prompt: t`Let SymPy change the coordinates. A metric transforms as $g'_{\mu\nu} = \dfrac{\partial x^\alpha}{\partial x'^\mu}\dfrac{\partial x^\beta}{\partial x'^\nu}\,g_{\alpha\beta}$, i.e. $g' = J^{\mathsf T} g\,J$ with the Jacobian $J_{\alpha\mu} = \partial x^\alpha/\partial x'^\mu$. Here the old coordinates are $(t, r, \theta, \phi)$ with $t = v - r^*(r)$, and the new ones $(v, r, \theta, \phi)$. Build \`J\` with \`sp.diff\` so that the program prints the ingoing metric.`,
      starter: t`import sympy as sp

v, r, theta, phi = sp.symbols('v r theta phi', real=True)
M = sp.symbols('M', positive=True)
f = 1 - 2*M/r
rstar = r + 2*M*sp.log(r/(2*M) - 1)   # tortoise coordinate, r > 2M
t = v - rstar                          # old time in the new coordinates

# Schwarzschild's metric in the old coordinates (t, r, theta, phi)
g_old = sp.diag(-f, 1/f, r**2, r**2*sp.sin(theta)**2)

new = [v, r, theta, phi]
old = [t, r, theta, phi]               # as functions of the new ones
J = sp.eye(4)          # replace: J[a, m] = d old[a] / d new[m]

g_new = (J.T * g_old * J).applyfunc(sp.simplify)
print(g_new)
`,
      answer: t`import sympy as sp

v, r, theta, phi = sp.symbols('v r theta phi', real=True)
M = sp.symbols('M', positive=True)
f = 1 - 2*M/r
rstar = r + 2*M*sp.log(r/(2*M) - 1)   # tortoise coordinate, r > 2M
t = v - rstar                          # old time in the new coordinates

# Schwarzschild's metric in the old coordinates (t, r, theta, phi)
g_old = sp.diag(-f, 1/f, r**2, r**2*sp.sin(theta)**2)

new = [v, r, theta, phi]
old = [t, r, theta, phi]               # as functions of the new ones
J = sp.Matrix(4, 4, lambda a, m: sp.diff(old[a], new[m]))

g_new = (J.T * g_old * J).applyfunc(sp.simplify)
print(g_new)
`,
      tests: [
        { name: t`$g_{vv} = -(1 - 2M/r)$`, code: 'sp.simplify(g_new[0, 0] + f) == 0' },
        { name: t`$g_{vr} = 1$`, code: 'sp.simplify(g_new[0, 1] - 1) == 0' },
        { name: t`no $dr^2$ term: $g_{rr} = 0$`, code: 'sp.simplify(g_new[1, 1]) == 0' },
        { name: 'the angular part is unchanged', code: 'sp.simplify(g_new[3, 3] - r**2*sp.sin(theta)**2) == 0' },
      ],
      hints: [t`\`sp.Matrix(4, 4, lambda a, m: ...)\` builds a matrix entry by entry; \`sp.diff(old[a], new[m])\` is $\partial x^a_\text{old}/\partial x^m_\text{new}$.`, t`Only one entry differs from the identity: $\partial t/\partial r = -dr^*/dr = -1/(1 - 2M/r)$. \`J = sp.Matrix(4, 4, lambda a, m: sp.diff(old[a], new[m]))\`.`],
      teach: t`A coordinate change acts on the metric through the Jacobian twice, once per index: $g' = J^{\mathsf T}gJ$.`,
      explain: t`With $J_{tr} = \partial t/\partial r = -1/(1 - 2M/r)$ the $dr^2$ terms cancel exactly: $g_{vv} = -(1 - 2M/r)$, $g_{vr} = g_{rv} = 1$, $g_{rr} = 0$ — the ingoing Eddington–Finkelstein metric, with nothing wrong at $r = 2M$. The same lines with $t = u + r^*$ give the outgoing form, and with Kruskal's $U$ and $V$, the Kruskal metric.`,
      visual: schwTable,
    }),
    expr({
      id: 'rindler', difficulty: 3,
      prompt: t`Just outside the horizon write $r = 2M + \rho^2/8M$, with $\rho \ll M$ ($G = c = 1$). Show that the $t$–$r$ part of Schwarzschild's metric becomes $-\kappa^2\rho^2\,dt^2 + d\rho^2$ — the metric of flat spacetime as seen from a uniformly accelerating frame (Rindler's) — and find $\kappa$. (Type a fraction like $1/5M$ with brackets: \`1/(5M)\`.)`,
      answer: '1/(4M)',
      answerTeX: t`\frac{1}{4M}`,
      lhs: '\\kappa',
      vars: { M: [0.5, 3] },
      errors: [
        { answer: '1/(2M)', feedback: t`Check $1 - 2M/r = (r - 2M)/r \approx \dfrac{\rho^2/8M}{2M} = \dfrac{\rho^2}{16M^2}$.` },
        { answer: '1/(16M^2)', feedback: t`That is $\kappa^2$: the metric has $-\kappa^2\rho^2\,dt^2$.` },
        { answer: '1/(8M)', feedback: t`The $8M$ is in $r - 2M = \rho^2/8M$; dividing by $r \approx 2M$ gives $\rho^2/16M^2 = (\rho/4M)^2$.` },
      ],
      hints: [t`$1 - \dfrac{2M}{r} = \dfrac{r - 2M}{r} \approx \dfrac{\rho^2/8M}{2M}$.`, t`And $dr = (\rho/4M)\,d\rho$, so $dr^2/(1 - 2M/r) \approx d\rho^2$: $\rho$ is the proper distance from the horizon.`],
      teach: 'Near any horizon spacetime looks like flat spacetime seen from an accelerating frame; κ is the horizon’s surface gravity.',
      explain: t`$1 - 2M/r \approx \rho^2/16M^2$, so $-(1 - 2M/r)\,dt^2 \approx -(\rho/4M)^2\,dt^2$, and $dr^2/(1 - 2M/r) \approx d\rho^2$: Rindler's metric with $\kappa = 1/4M$, the **surface gravity** — $c^4/4GM$ in SI, $${sci(C ** 2 / (4 * 10 * M_SUN), 2)}$ m/s² for 10 solar masses. Hovering at proper distance $\rho$ takes a proper acceleration $1/\rho$, without bound at the horizon, while a free faller notices nothing — just as at the horizon of an accelerating rocket in flat spacetime. The same $\kappa$ sets how fast a faller's signals redden and the Hawking temperature, $\hbar\kappa/2\pi ck_B$.`,
      visual: rindlerPic,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-tstar', difficulty: 3,
      prompt: t`Eddington's own form of these coordinates uses $t^* = v - r$ instead of $v$. Substitute $dv = dt^* + dr$ into the ingoing metric ($G = c = 1$) and find $dr/dt^*$ for **outgoing** radial light.`,
      answer: '(r - 2M)/(r + 2M)',
      answerTeX: t`\frac{r - 2M}{r + 2M}`,
      lhs: 'dr/dt^*',
      vars: { r: [0.3, 10], M: [0.5, 1.5] },
      errors: [
        { answer: '(1 - 2M/r)/2', feedback: t`That is $dr/dv$. With $t^* = v - r$, $\dfrac{dr}{dt^*} = \dfrac{dr/dv}{1 - dr/dv}$.` },
        { answer: '-1', feedback: 'That is the ingoing family. Find the other root.' },
        { answer: '1 - 2M/r', feedback: t`That is $dr/dt$ in Schwarzschild coordinates, which fail at the horizon.` },
      ],
      hints: [t`For radial motion $ds^2 = -(1 - 2M/r)(dt^* + dr)^2 + 2(dt^* + dr)\,dr$. Set it to zero and write $s = dr/dt^*$.`, t`It factors: $(1 + s)\left[2s - (1 - 2M/r)(1 + s)\right] = 0$. One root is $s = -1$; solve the bracket for the other.`],
      teach: 'Change coordinates by substituting the differentials; a null direction is then a root of the quadratic ds² = 0.',
      explain: t`The roots are $s = -1$ (ingoing, at 45°) and $s = \dfrac{1 - 2M/r}{1 + 2M/r} = \dfrac{r - 2M}{r + 2M}$ (outgoing): $1$ far away, $0$ on the horizon, negative inside, and $-1$ as $r \to 0$, where both edges of the cone point straight in. Equivalently $\dfrac{dr/dv}{1 - dr/dv}$ with $dr/dv = \tfrac12(1 - 2M/r)$. In these coordinates the metric is $-(1 - 2M/r)\,dt^{*2} + (4M/r)\,dt^*dr + (1 + 2M/r)\,dr^2 + r^2d\Omega^2$.`,
      visual: ingoingPic,
    }),
    mcq({
      id: 'cp-white', difficulty: 3, transfer: true,
      prompt: t`Use the outgoing null coordinate $u = t - r^*$ instead: $ds^2 = -(1 - 2M/r)\,du^2 - 2\,du\,dr + r^2d\Omega^2$ ($G = c = 1$), also regular at $r = 2M$. Its radial light rays are $du = 0$ and $dr/du = -\tfrac12(1 - 2M/r)$. What do these coordinates reach for $r < 2M$?`,
      choices: [
        t`A **white hole**: there $dr/du > 0$ for both families, so light and matter can only move to larger $r$ and out, and nothing can enter. On the Kruskal diagram $u$ is finite only where $U < 0$: regions I and IV`,
        t`The same black-hole interior that the ingoing coordinates reach: they are two labellings of one region`,
        t`Nothing: these coordinates break down at $r = 2M$, as Schwarzschild's do`,
        t`The second outside region, III`,
      ],
      answer: 0,
      why: {
        1: t`Inside, the ingoing coordinates have all light moving to smaller $r$; these have it moving to larger $r$. Relabelling cannot reverse which way light goes, so this is a different region.`,
        2: t`The components are finite at $r = 2M$ and $\det g = -r^4\sin^2\theta \neq 0$: nothing breaks down there.`,
        3: t`Region III has $r > 2M$; the question is about $r < 2M$.`,
      },
      hints: [t`Inside, $1 - 2M/r < 0$. What sign does $dr/du = -\tfrac12(1 - 2M/r)$ have there?`, t`$U = -e^{-u/4M}$ is negative for every finite $u$. Which regions of the Kruskal diagram have $U < 0$?`],
      teach: 'Coordinates built on one family of light rays reach one horizon: ingoing rays reach the black hole’s, outgoing rays the white hole’s.',
      explain: t`In $(u, r)$ the cones tip the other way: inside, both edges point to larger $r$, so the region is a white hole — a black hole run backwards. In Kruskal's terms, $u$ is finite where $U < 0$ (regions I and IV) and $v$ where $V > 0$ (regions I and II). A black hole made by a collapsing star has no white hole: region IV is replaced by the star.`,
      visual: vPic,
    }),
    num({
      id: 'cp-fade', difficulty: 3, transfer: true,
      gen(r) {
        const [name, m, N, units, per] = r.pick([
          ['M87*', M87, 100, 'day', 86400], ['M87*', M87, 1000, 'day', 86400],
          ['Sagittarius A*', SGR, 100, 'min', 60], ['Sagittarius A*', SGR, 1000, 'min', 60],
        ]);
        const TM = m * T_SUN, dt = 4 * TM * Math.log(N);
        return {
          prompt: t`A probe falls into ${name} ($${sci(m, 2)}$ solar masses), radioing back to a distant telescope ($G = c = 1$). Near the crossing the Kruskal coordinate along its path is smooth, $U \approx -k(\tau_h - \tau)$, and a signal sent at $U$ reaches the telescope at $u = t - r^* = -4M\ln(-U)$. Received wavelengths are stretched by $du/d\tau$: crests sent $d\tau$ apart arrive $du$ apart. Once this has set in, how much telescope time $t$ passes while the stretch grows by a further factor of ${N}? ($GM_\odot/c^3 = ${sci(T_SUN * 1e6, 4)}\ \mu\text{s}$)`,
          answer: dt / per, units, tol: { rel: 0.01 },
          errors: [
            { value: (4 * TM) / per, feedback: t`That is one factor of $e$. A factor of ${N} takes $\ln ${N}$ of them.` },
            { value: (4 * TM * Math.log10(N)) / per, feedback: t`Use the natural logarithm: the growth goes in factors of $e$, not 10.` },
            { value: (2 * TM * Math.log(N)) / per, feedback: t`From $u = -4M\ln(-U)$ each factor of $e$ takes $4M$, not $2M$.` },
          ],
          hints: [t`$\dfrac{du}{d\tau} = -4M\,\dfrac{dU/d\tau}{U} = \dfrac{4M}{\tau_h - \tau}$, and $\tau_h - \tau = e^{-u/4M}/k$.`, t`So the stretch is $4Mk\,e^{u/4M}$: it grows by $e$ every $4M$ of telescope time, and by ${N} in $4M\ln ${N}$. Then $M = ${sci(m, 2)} \times GM_\odot/c^3$.`],
          teach: 'A smooth coordinate along the faller, seen through the logarithm that defines far-away time, gives an exponential: the redshift grows as e^{t/4M}.',
          explain: t`$du/d\tau = 4M/(\tau_h - \tau) = 4Mk\,e^{u/4M}$, so the stretch grows as $e^{t/4M}$. A factor of ${N} takes $4M\ln ${N} = ${round(4 * Math.log(N), 4)}M$; with $M = ${sci(TM, 4)}$ s that is $${sci(dt, 3)}$ s, or ${round(dt / per, 3)} ${units === 'day' ? 'days' : 'minutes'}. Its brightness falls faster still, and the last signal it sends before crossing never arrives at all: the probe fades and freezes, though by its own clock it crosses in finite time. The rate $1/4M$ is the surface gravity $\kappa$.`,
          visual: fadePic,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 7 (Eddington–Finkelstein and Kruskal coordinates)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Finkelstein, “Past-Future Asymmetry of the Gravitational Field of a Point Particle”, Phys. Rev. 110, 965 (1958)', url: 'https://doi.org/10.1103/PhysRev.110.965' },
    { label: 'Kruskal, “Maximal Extension of Schwarzschild Metric”, Phys. Rev. 119, 1743 (1960)', url: 'https://doi.org/10.1103/PhysRev.119.1743' },
    { label: 'Fuller & Wheeler, “Causality and Multiply Connected Space-Time”, Phys. Rev. 128, 919 (1962)', url: 'https://doi.org/10.1103/PhysRev.128.919' },
  ],
});
