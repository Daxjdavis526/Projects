// The Ricci tensor R_μν = R^λ_μλν and scalar R = g^μν R_μν. In 2D, R_ab = K g_ab
// and R = 2K (the sphere: R_θθ = 1, R_φφ = sin²θ, R = 2/a²). The scalar measures
// how a small geodesic ball's volume falls short of flat,
// V ≈ V_flat(1 − R r²/(6(n + 2))), explored exactly for constant curvature in
// two and three dimensions. Practice on the torus, on what depends on the
// radius, on S²×H² (R = 0 but curved), on a hypothetical closed universe and
// on a radio dish.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const DEG = Math.PI / 180;

// exact area (n = 2) or volume (n = 3) of a geodesic ball of radius x over the flat value, for constant scalar curvature R
const RATIO2P = '2*(1 - cos(sqrt(R/2)*x))/((R/2)*x^2)', RATIO2N = '2*(cosh(sqrt(-R/2)*x) - 1)/((-R/2)*x^2)';
const RATIO3P = '3*(2*sqrt(R/6)*x - sin(2*sqrt(R/6)*x))/(4*(sqrt(R/6)*x)^3)', RATIO3N = '3*(sinh(2*sqrt(-R/6)*x) - 2*sqrt(-R/6)*x)/(4*(sqrt(-R/6)*x)^3)';

const torusPic = (v) => ({ type: 'gr-surface', params: { mode: 'basis', surface: 'torus', v: +Math.min(3.14, v * DEG).toFixed(4), controls: false, readout: false }, caption: t`The point at $v = ${v}^\circ$ round the tube (drawn with $R = 2$, $r = 1$); colour shows the curvature, gold positive and blue negative.` });

export default lesson({
  id: 'st-c.C16.1',
  title: 'The Ricci tensor and scalar',
  minutes: 14, difficulty: 3,
  equation: t`R_{\mu\nu} = R^\lambda{}_{\mu\lambda\nu},\qquad R = g^{\mu\nu}R_{\mu\nu}`,
  intro: t`Riemann has more components than you usually need. Contract its first index with its third and you get a symmetric two-index tensor, the **Ricci tensor** $R_{\mu\nu}$; contract that with the inverse metric and you get one number per point, the **Ricci scalar** $R$. They are averages: $R_{\mu\nu}u^\mu u^\nu$ for a unit vector $u$ adds up the curvatures of all the planes that contain $u$, and $R$ adds up all of those. Geometrically, $R$ is how much a small ball of geodesic radius $r$ falls short of its flat volume:
$$V \approx V_{\text{flat}}\left(1 - \frac{R\,r^2}{6(n + 2)}\right).$$
On a surface there is only one plane, so nothing is lost: $R_{ab} = K\,g_{ab}$ and $R = 2K$. The sphere of radius $a$ has $R_{\theta\theta} = 1$, $R_{\varphi\varphi} = \sin^2\theta$ and $R = 2/a^2$.`,
  symbols: [
    { tex: t`R_{\mu\nu}`, text: t`the Ricci tensor: symmetric, $n(n+1)/2$ components; in units of $1/\text{length}^2$ when its indices belong to length coordinates` },
    { tex: t`R^\lambda{}_{\mu\lambda\nu}`, text: t`the Riemann tensor with its first and third indices set equal and summed (Carroll’s and Misner–Thorne–Wheeler’s choice of slots)` },
    { tex: 'R', text: t`the Ricci scalar, in $\text{m}^{-2}$: one number per point` },
    { tex: t`g^{\mu\nu}`, text: t`the inverse metric, $g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu{}_\nu$` },
    { tex: t`V,\ V_{\text{flat}}`, text: t`the volume (area, for $n = 2$) of a small geodesic ball of radius $r$, and the same in flat space` },
    { tex: 'n', text: 'the dimension' },
  ],
  why: t`Einstein’s equation fixes the Ricci part of curvature by the matter present (gr.S15): in empty space $R_{\mu\nu} = 0$, while the rest of Riemann — tides and waves — carries on regardless.`,
  visual: {
    type: 'graph',
    title: 'Balls that come up short',
    lead: t`The curve is the exact area (2D) or volume (3D) of a geodesic ball of radius $r$ in a space of constant curvature, divided by the flat value; dashed, the small-ball formula $1 - R r^2/6(n + 2)$. Positive $R$ (a sphere) gives less room, negative $R$ (hyperbolic space) more.`,
    tasks: [
      t`At $R = 1$ in 2D, read the curve at $r = 0.5$: about $0.99$. The deficit $R r^2/24$ is only 1% — curvature hides at small scales.`,
      t`Make $R$ negative: hyperbolic space has *more* room than flat. Then switch to three dimensions: the same $R$ gives a smaller fractional deficit, $R r^2/30$.`,
      t`At large $r$ the dashed formula fails: it is only the first correction. On the sphere the exact curve keeps falling until the ball covers everything.`,
    ],
    params: {
      x: [0, 2.6], y: [0, 2], aspect: 'wide', axesAt: 'edge', xlabel: 'geodesic radius r', ylabel: 'V / V(flat)', yticks: 4,
      sliders: [{ key: 'R', label: 'Ricci scalar $R$', min: -3, max: 3, step: 0.1, value: 1, explain: 'The scalar curvature, the same everywhere (a sphere for R > 0, hyperbolic space for R < 0), in units where r is measured in the same length unit.' }],
      choices: [{ key: 'n', label: 'Dimension', options: [[2, 'surface (area)'], [3, '3D space (volume)']], value: 2, explain: 'A geodesic disc on a surface, or a geodesic ball in three dimensions.' }],
      curves: [
        { fn: '1', color: 'ink4', dash: [3, 4], label: 'flat', labelAt: 2.3, labelDy: -10 },
        { fn: RATIO2P, domain: [0.02, 2.6], color: 'accent', width: 2.6, when: 'step(R - 0.05)*step(2.5 - n)' },
        { fn: RATIO2N, domain: [0.02, 2.6], color: 'accent', width: 2.6, when: 'step(-R - 0.05)*step(2.5 - n)' },
        { fn: RATIO3P, domain: [0.02, 2.6], color: 'accent', width: 2.6, when: 'step(R - 0.05)*step(n - 2.5)' },
        { fn: RATIO3N, domain: [0.02, 2.6], color: 'accent', width: 2.6, when: 'step(-R - 0.05)*step(n - 2.5)' },
        { fn: '1 - R*x^2/(6*(n + 2))', color: 'gold', width: 1.6, dash: [6, 4] },
      ],
      readouts: [{ label: t`deficit at $r = 0.5$ (exact)`, expr: `step(2.5 - n)*(1 - (step(R - 0.001)*2*(1 - cos(sqrt(abs(R)/2)*0.5))/((abs(R)/2)*0.25) + step(-R - 0.001)*2*(cosh(sqrt(abs(R)/2)*0.5) - 1)/((abs(R)/2)*0.25) + step(0.001 - abs(R)))) + step(n - 2.5)*(1 - (step(R - 0.001)*3*(sqrt(abs(R)/6) - sin(2*sqrt(abs(R)/6)*0.5))/(4*(sqrt(abs(R)/6)*0.5)^3) + step(-R - 0.001)*3*(sinh(2*sqrt(abs(R)/6)*0.5) - sqrt(abs(R)/6))/(4*(sqrt(abs(R)/6)*0.5)^3) + step(0.001 - abs(R))))`, digits: 3 }],
    },
    caption: t`Exact for spaces of constant curvature (spheres and hyperbolic spaces); the blue curve stops showing at $R = 0$, where the ratio is exactly 1. In a space whose curvature varies, $R$ is the value at the ball’s centre and the formula holds for small $r$ only.`,
  },
  example: {
    prompt: t`On the sphere of radius $a$, $R^\theta{}_{\varphi\theta\varphi} = \sin^2\theta$ and $R^\varphi{}_{\theta\varphi\theta} = 1$ (C15.2). Find the Ricci tensor and scalar, and check $R_{ab} = K g_{ab}$.`,
    visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'chart', P: [2.0, 1.1], drag: false, readout: ['g', 'K'], field: true }, caption: 'The sphere’s (φ, θ) chart with the metric and K at P.' },
    steps: [
      { label: 'Contract', text: t`$R_{\mu\nu} = R^\theta{}_{\mu\theta\nu} + R^\varphi{}_{\mu\varphi\nu}$: sum over the first and third slots.` },
      { label: 'Theta theta', text: t`$R_{\theta\theta} = R^\theta{}_{\theta\theta\theta} + R^\varphi{}_{\theta\varphi\theta} = 0 + 1 = 1$ (a repeated index in the last pair gives zero).` },
      { label: 'Phi phi', text: t`$R_{\varphi\varphi} = R^\theta{}_{\varphi\theta\varphi} + R^\varphi{}_{\varphi\varphi\varphi} = \sin^2\theta + 0$. The mixed component $R_{\theta\varphi}$ is zero: both its terms have a repeated index.` },
      { label: 'Compare with g', text: t`$g_{\theta\theta} = a^2$, $g_{\varphi\varphi} = a^2\sin^2\theta$: so $R_{ab} = g_{ab}/a^2 = K g_{ab}$ ✓. Neither $R_{\theta\theta}$ nor $R_{\varphi\varphi}$ contains $a$ — the size enters through $g$.` },
      { label: 'Scalar', text: t`$R = g^{\theta\theta}R_{\theta\theta} + g^{\varphi\varphi}R_{\varphi\varphi} = \dfrac{1}{a^2} + \dfrac{\sin^2\theta}{a^2\sin^2\theta} = \dfrac{2}{a^2} = 2K$.` },
      { label: 'Sense check', text: t`Units $\text{m}^{-2}$. For the Earth, $a = 6371$ km: $R = 4.9\times10^{-14}\ \text{m}^{-2}$, and a geodesic disc of radius 100 km falls short of $\pi r^2$ by $R r^2/24 = 0.002\%$.` },
    ],
    answer: t`$R_{\theta\theta} = 1$, $R_{\varphi\varphi} = \sin^2\theta$, $R_{\theta\varphi} = 0$, i.e. $R_{ab} = g_{ab}/a^2$; $R = 2/a^2$.`,
  },
  practice: [
    num({
      id: 'torus-rvv', difficulty: 2,
      gen(r) {
        const [R, rr] = r.pick([[2, 0.5], [3, 1], [3, 1.5], [4, 1.5]]), v = r.pick([20, 45, 70, 150]);
        const c = Math.cos(v * DEG), w = R + rr * c;
        const key = (rr * c) / w, K = c / (rr * w);
        return {
          prompt: t`For the torus $ds^2 = (R + r\cos v)^2du^2 + r^2dv^2$ with $R = ${R}$, $r = ${rr}$, the only independent Riemann component is $R_{uvuv} = r(R + r\cos v)\cos v$ (C15.2). Find the Ricci component $R_{vv}$ at $v = ${v}^\circ$.`,
          visual: torusPic(v),
          answer: key, tol: { rel: 0.005 },
          errors: [
            { value: (w * c) / rr, feedback: t`That is $R_{uu} = R^v{}_{uvu}$. For $R_{vv}$ you need $R^u{}_{vuv} = g^{uu}R_{uvuv}$.` },
            { value: K, feedback: t`That is $K$. In 2D, $R_{vv} = K g_{vv}$, and $g_{vv} = r^2$.` },
            { value: rr * w * c, feedback: t`That is $R_{uvuv}$ itself. Raise its first index with $g^{uu} = 1/(R + r\cos v)^2$.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * Math.abs(key)),
          hints: [t`$R_{vv} = R^u{}_{vuv} + R^v{}_{vvv}$, and the second is zero.`, t`$R^u{}_{vuv} = g^{uu}R_{uvuv} = \dfrac{r(R + r\cos v)\cos v}{(R + r\cos v)^2}$ — or use $R_{vv} = K g_{vv}$.`],
          teach: 'In 2D the Ricci tensor is K times the metric, so each component is K times the matching g.',
          explain: t`$R_{vv} = \dfrac{r\cos v}{R + r\cos v} = \dfrac{${rr}\cos ${v}^\circ}{${nice(w, 4)}} = ${nice(key, 4)}$, which is $K g_{vv} = ${nice(K, 4)}\times${rr}^2$ ✓.`,
        };
      },
    }),
    num({
      id: 'torus-scalar', difficulty: 2,
      gen(r) {
        const [R, rr] = r.pick([[2, 1], [3, 1], [5, 2], [4, 1]]), v = r.pick([0, 60, 120, 180]);
        const c = Math.cos(v * DEG), w = R + rr * c;
        const Ruu = (w * c) / rr, Rvv = (rr * c) / w, guu = w * w, gvv = rr * rr, key = Ruu / guu + Rvv / gvv;
        return {
          prompt: t`At a point of a torus the metric is $g_{uu} = ${nice(guu, 4)}$, $g_{vv} = ${nice(gvv, 4)}$, $g_{uv} = 0$ (in $\text{m}^2$), and the Ricci tensor is $R_{uu} = ${nice(Ruu, 4)}$, $R_{vv} = ${nice(Rvv, 4)}$, $R_{uv} = 0$. What is the Ricci scalar there, in $\text{m}^{-2}$?`,
          visual: torusPic(v),
          answer: key, units: 'm^-2', tol: { rel: 0.005 },
          errors: [
            { value: Ruu + Rvv, feedback: t`Contract with the *inverse* metric: $R = g^{uu}R_{uu} + g^{vv}R_{vv}$, with $g^{uu} = 1/g_{uu}$.` },
            { value: key / 2, feedback: t`That is $K$. On a surface $R = 2K$.` },
            { value: Ruu * guu + Rvv * gvv, feedback: t`Use $g^{\mu\nu}$, the inverse: divide by $g_{uu}$ and $g_{vv}$, don’t multiply.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * Math.abs(key)),
          hints: [t`For a diagonal metric $g^{uu} = 1/g_{uu}$ and $g^{vv} = 1/g_{vv}$.`],
          teach: 'The Ricci scalar is the trace of the Ricci tensor taken with the inverse metric.',
          explain: t`$R = \dfrac{${nice(Ruu, 4)}}{${nice(guu, 4)}} + \dfrac{${nice(Rvv, 4)}}{${nice(gvv, 4)}} = ${nice(key, 4)}\ \text{m}^{-2}$. Both terms are equal — each is $K$ — as they must be on a surface: $R = 2K$. ${v === 180 ? 'On the inner equator it is negative: saddle-like.' : v === 0 ? 'On the outer equator it is positive: sphere-like.' : ''}`,
        };
      },
    }),
    multi({
      id: 'radius', difficulty: 2,
      prompt: t`The sphere’s radius $a$ is doubled. Which of these quantities change? Select all that do.`,
      visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'chart', P: [2.0, 1.1], drag: false, readout: ['g', 'gamma', 'K'], field: true, k: 2 }, caption: 'A sphere of radius 2 on its chart: compare the readout with radius 1 in the worked example.' },
      choices: [t`$R$, the Ricci scalar`, t`$R_{\theta\varphi\theta\varphi}$`, t`$R_{\theta\theta}$`, t`$R^\theta{}_{\varphi\theta\varphi}$`, t`$\Gamma^\theta{}_{\varphi\varphi}$`],
      answer: [0, 1],
      why: {
        2: t`$R_{\theta\theta} = 1$ for every radius: Ricci with lower indices is built from $\Gamma$s, which do not contain $a$.`,
        3: t`$R^\theta{}_{\varphi\theta\varphi} = \sin^2\theta$: no $a$ — the $\Gamma$s are the same for every radius.`,
        4: t`$\Gamma^\theta{}_{\varphi\varphi} = -\sin\theta\cos\theta$ does not depend on $a$: scaling a metric by a constant leaves the connection unchanged.`,
      },
      hints: [t`Scaling $g$ by a constant leaves every $\Gamma$ unchanged. Which quantities then bring in $g$ or $g^{-1}$?`],
      teach: t`Scaling the metric leaves $\Gamma$, $R^\rho{}_{\sigma\mu\nu}$ and $R_{\mu\nu}$ unchanged; $R_{\rho\sigma\mu\nu}$ scales with $g$ and $R$ with its inverse.`,
      explain: t`$R = 2/a^2$ drops to a quarter; $R_{\theta\varphi\theta\varphi} = a^2\sin^2\theta$ grows fourfold. The rest — the $\Gamma$s, $R^\theta{}_{\varphi\theta\varphi}$ and $R_{\mu\nu}$ — never see the constant factor. This is the research notes’ favourite pitfall: "$R_{\theta\theta} = 1$, so the sphere’s Ricci curvature is 1" forgets that the size lives in $g$.`,
    }),
    mcq({
      id: 'product', difficulty: 3,
      prompt: t`The four-dimensional space $S^2\times H^2$ — every point a pair (a point on a sphere of radius $a$, a point on a hyperbolic plane with $K = -1/a^2$) — has Ricci scalar $R = 2/a^2 - 2/a^2 = 0$. What does that tell you?`,
      visual: {
        type: 'graph',
        params: { x: [0, 3], y: [0, 2.6], aspect: 'wide', axesAt: 'edge', xlabel: 'r / a', ylabel: 'area / flat area', yticks: 4,
          curves: [{ fn: '1', color: 'ink4', dash: [3, 4] }, { fn: '2*(1 - cos(x))/x^2', domain: [0.02, 3], color: 'accent', width: 2.4, label: 'disc in the sphere factor', labelAt: 2.2, labelDy: 16 }, { fn: '2*(cosh(x) - 1)/x^2', domain: [0.02, 2.9], color: 'violet', width: 2.4, label: 'disc in the hyperbolic factor', labelAt: 1.7, labelDx: -150, labelDy: -14 }] },
        caption: 'Geodesic discs in the two factors: one falls short of flat, the other has room to spare. The Ricci scalar adds the two effects and gets zero.',
      },
      choices: [
        t`Only that the curvatures average out: the space is curved, and even its Ricci tensor is not zero`,
        'The space is flat',
        t`Its Ricci tensor is zero, but not its Riemann tensor`,
        t`Nothing: $R = 0$ is impossible for a product of curved spaces`,
      ],
      answer: 0,
      why: {
        1: 'Transport round a loop in the sphere factor still turns a vector: flatness needs Riemann = 0.',
        2: t`$R_{\mu\nu}$ is $+g/a^2$ on sphere directions and $-g/a^2$ on hyperbolic ones: not zero. Only its trace cancels.`,
        3: 'The two factors’ scalars simply add, and they can cancel — this is the example.',
      },
      hints: [t`$R$ is a trace: a sum over directions. Can a sum vanish while its terms do not?`, t`On sphere directions $R_{\mu\nu} = +g_{\mu\nu}/a^2$; on hyperbolic ones $-g_{\mu\nu}/a^2$. Flatness would need every Riemann component to vanish.`],
      teach: 'A zero Ricci scalar is a single average: neither Ricci nor Riemann need vanish.',
      explain: t`The scalar is the coarsest summary: $R = 0$ allows a curved space with a non-zero Ricci tensor; $R_{\mu\nu} = 0$ (as outside a star) still allows a curved space with non-zero Riemann. Only $R^\rho{}_{\sigma\mu\nu} = 0$ means flat.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-universe', difficulty: 3, transfer: true,
      gen(r) {
        const d = r.pick([2, 3, 4, 5]), frac = r.pick([0.4, 0.6, 1.0, 1.5]);   // Gly, percent
        const Rs = (30 * frac) / 100 / (d * d), a = Math.sqrt(6 / Rs);
        return {
          prompt: t`A hypothetical survey in a closed universe (space a 3-sphere) counts galaxies, assumed evenly spread, inside a sphere of proper radius $r = ${d}$ billion light-years, and finds the volume ${frac}% smaller than the flat $\tfrac43\pi r^3$. Using $V \approx V_{\text{flat}}\big(1 - R r^2/30\big)$ and $R = 6/a^2$ for a 3-sphere of radius $a$, what is the curvature radius $a$ of space, in billions of light-years?`,
          visual: { type: 'graph', params: { x: [0, 2.6], y: [0.6, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'r / a', ylabel: 'V / V(flat)', yticks: 4, curves: [{ fn: '1', color: 'ink4', dash: [3, 4] }, { fn: RATIO3P.replace(/sqrt\(R\/6\)/g, '1'), domain: [0.02, 2.6], color: 'accent', width: 2.4, label: '3-sphere', labelAt: 2, labelDy: 14 }, { fn: '1 - x^2/5', domain: [0, 1.4], color: 'gold', dash: [6, 4], width: 1.6, label: 'small-ball formula', labelAt: 0.9, labelDx: -40, labelDy: 16 }] }, caption: 'The volume of a geodesic ball in a 3-sphere over the flat value, against its radius in units of the curvature radius a (exact, blue; small-ball formula, dashed).' },
          answer: a, units: 'Gly', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(1 / Rs), feedback: t`For a 3-sphere $R = 6/a^2$, so $a = \sqrt{6/R}$, not $1/\sqrt{R}$.` },
            { value: Math.sqrt(6 / ((24 * frac) / 100 / (d * d))), feedback: t`$R r^2/24$ is the 2D formula. In three dimensions it is $R r^2/30$.` },
            { value: Math.sqrt(6 / ((30 * frac) / (d * d))), feedback: t`Write the deficit as a fraction: ${frac}% is $${frac / 100}$.` },
          ].filter((e) => Math.abs(e.value - a) > 0.02 * a),
          hints: [t`Deficit $= R r^2/30 = ${frac / 100}$, so $R = 30\times${frac / 100}/${d}^2$ (in Gly⁻²).`, t`Then $a = \sqrt{6/R}$.`],
          teach: 'The volume deficit of a ball measures the Ricci scalar: in 3D, ΔV/V ≈ −R r²/30.',
          explain: t`$R = 30\times${frac / 100}/${d * d} = ${nice(Rs, 4)}\ \text{Gly}^{-2}$, so $a = \sqrt{6/R} = ${nice(a, 4)}$ billion light-years. Check: $r/a = ${nice(d / a, 3)}$, small enough for the formula (exact: the curve). In our universe, Planck’s measurements find space flat to within the errors — a curvature radius, if any, far larger than the observable universe — and real counts of galaxies are dominated by evolution and selection effects, not geometry.`,
        };
      },
    }),
    num({
      id: 'cp-dish', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([8, 12, 20, 30]), rim = r.pick([0.5, 0.8, 1.1]) * f, c = 2 * f;
        const K = (c * c) / (c * c + rim * rim) ** 2, key = K * rim * rim;
        return {
          prompt: t`A radio dish is the paraboloid $z = \rho^2/4f$ with focal length $f = ${f}$ m. In polar coordinates on its surface, $ds^2 = \big(1 + \rho^2/4f^2\big)d\rho^2 + \rho^2d\varphi^2$, and its Gaussian curvature is $K = \dfrac{4f^2}{(4f^2 + \rho^2)^2}$. Find the Ricci component $R_{\varphi\varphi}$ at $\rho = ${nice(rim, 3)}$ m.`,
          visual: { type: 'surface3d', params: { surface: ['u*cos(v)', 'u*sin(v)', 'u^2/4'], domain: [[0, (rim / f) * 1.1], [0, 2 * Math.PI]], pitch: 0.5, scale: 2.4, axes: false, curves: [{ param: [`${rim / f}*cos(t)`, `${rim / f}*sin(t)`, `${(rim / f) ** 2 / 4}`], t: [0, 2 * Math.PI], color: 'gold', width: 3 }] }, caption: t`The dish in units of its focal length, with the circle $\rho = ${nice(rim, 3)}$ m in gold.` },
          answer: key, tol: { rel: 0.005 },
          errors: [
            { value: K, feedback: t`That is $K$. In 2D, $R_{\varphi\varphi} = K g_{\varphi\varphi}$ with $g_{\varphi\varphi} = \rho^2$.` },
            { value: 2 * K, feedback: t`That is the Ricci scalar $R = 2K$, not a component of the tensor.` },
            { value: K * (1 + (rim * rim) / (4 * f * f)), feedback: t`That is $R_{\rho\rho} = K g_{\rho\rho}$. The question asks for $R_{\varphi\varphi}$.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * key),
          hints: [t`On a surface $R_{ab} = K g_{ab}$.`, t`$g_{\varphi\varphi} = \rho^2 = ${nice(rim * rim, 4)}\ \text{m}^2$ and $K = ${tex(K, 4)}\ \text{m}^{-2}$.`],
          teach: 'On any surface each Ricci component is K times the matching metric component.',
          explain: t`$R_{\varphi\varphi} = K\rho^2 = ${tex(K, 4)}\times${nice(rim * rim, 4)} = ${nice(key, 4)}$ (a pure number: $\varphi$ is an angle). The dish is most curved at its vertex, $K = 1/4f^2$, and flattens outward — the same paraboloid that brings every ray to one focus.`,
        };
      },
    }),
    multi({
      id: 'cp-zero', difficulty: 3,
      prompt: t`Which of these follow from $R_{\mu\nu} = 0$ at every point of a space (or spacetime)? Select all that do.`,
      visual: { type: 'gr-dustball', params: { mode: 'tides', body: 'earth', t: 0.6, readout: false, views: 'side', play: false }, caption: 'A small ball of dust falling freely in empty space near the Earth, some time after release (side view; the deformation is exaggerated).' },
      choices: [
        t`The Ricci scalar is zero`,
        t`Small balls start out with their flat volume (to the order the formula shows)`,
        t`The Riemann tensor is zero`,
        t`Nearby geodesics stay parallel`,
      ],
      answer: [0, 1],
      why: {
        2: 'Outside the Earth, Ricci is zero but Riemann is not: that is what tides are.',
        3: 'Geodesics still converge in some directions and spread in others; only the average vanishes.',
      },
      hints: [t`$R$ is a trace of $R_{\mu\nu}$; the volume formula involves only Ricci.`, 'What does a falling ball of dust near the Earth do?'],
      teach: 'Ricci-flat means no volume change at leading order, not no curvature: the trace-free part of Riemann remains.',
      explain: t`$R = g^{\mu\nu}R_{\mu\nu} = 0$ and the leading volume deficit vanish. But Riemann keeps its Weyl part — 10 components in spacetime — so the dust ball near the Earth stretches toward it and squeezes sideways with its volume unchanged. That is empty space in general relativity.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.6 (Ricci tensor and scalar) and §3.9 (the 2-sphere)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Gray, The volume of a small geodesic ball of a Riemannian manifold, Michigan Math. J. 20 (1974)', url: 'https://doi.org/10.1307/mmj/1029001150' },
    { label: 'Planck Collaboration 2020, Planck 2018 results VI, A&A 641, A6 (spatial curvature)', url: 'https://doi.org/10.1051/0004-6361/201833910' },
  ],
});
