// Boundary conditions on E and V (Griffiths §2.3.5): the pillbox gives the
// jump σ/ε₀ in the normal component, the thin loop the continuity of the
// tangential one, and V is continuous; equivalently the normal derivative of
// V jumps by −σ/ε₀. The worked example glues V = A r cos θ inside a sphere to
// A R³cos θ/r² outside and reads off σ ∝ cos θ — the template for M4.4.
// Transfer: the fair-weather field and the charge on the Earth. Builds on
// phys3600.M1.3 (the pillbox) and phys2220.E3.4.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, KC, sf, field } from './_bvp.js';

const t = String.raw;
const RE = 6.371e6;

/** A charged surface edge-on (y = 0) with normal field arrows above and below, lengths to scale (graph). */
const jumpPic = (above, below, caption, { tang = 0, show = true } = {}) => {
  const m = Math.max(Math.abs(above), Math.abs(below), Math.abs(tang), 1), s = 1.3 / m;
  // an arrow on its own side of the surface: leaving from the surface, or arriving at it
  const ar = (x, y0, ex, ey, label) => {
    const away = Math.sign(y0) * ey >= 0;
    const [a, b] = away ? [[x, y0], [x + ex * s, y0 + ey * s]] : [[x - ex * s, y0 - ey * s], [x, y0]];
    return { from: a, to: b, color: 'gold', width: 2.6, label: show ? label : '', labelDx: 6 };
  };
  return {
    type: 'graph',
    params: {
      x: [-3.2, 3.2], y: [-1.8, 1.8], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ fn: '0', domain: [-9, 9], color: 'warn', width: 4 }],
      shade: [{ fn: '0.05', lower: '-0.05', from: -9, to: 9, color: 'warn', alpha: 0.3 }],
      arrows: [ar(-0.6, 0.12, tang, above, 'above'), ar(0.6, -0.12, tang, below, 'below')],
      points: [{ x: 2.2, y: 0, r: 0, label: 'σ', labelDy: 14, labelDx: 0 }, { x: -2.8, y: 1.2, r: 0, label: 'n̂ points up', labelDx: 0 }],
    },
    caption,
  };
};

/** V = r cos θ inside the unit sphere, cos θ / r² outside, on a contour map (axis vertical). */
const spherePic = (caption, extra = {}) => ({
  type: 'c3-contour',
  params: {
    f: 'step(1 - sqrt(x^2 + y^2))*y + step(sqrt(x^2 + y^2) - 1)*y/(x^2 + y^2)^1.5',
    x: [-3.2, 3.2], y: [-2, 2], levels: { from: -0.9, to: 0.9, step: 0.2 }, labels: false, fill: true, xlabel: '', ylabel: 'z',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'warn', width: 2.5 }],
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'phys3600.M2.2',
  title: 'Boundary conditions on E and V',
  minutes: 14, difficulty: 3,
  equation: t`\vec E_{\text{above}} - \vec E_{\text{below}} = \frac{\sigma}{\varepsilon_0}\,\hat n, \qquad V_{\text{above}} = V_{\text{below}}`,
  intro: t`Across a sheet of surface charge, the field jumps — but only in one way. A flat **pillbox** straddling the sheet ([M1.3](#/lesson/phys3600.M1.3)) encloses charge $\sigma A$, so the **normal** component jumps by $\sigma/\varepsilon_0$. A thin rectangular **loop** straddling it has $\oint\vec E\cdot d\vec l = 0$, so the **tangential** component is continuous. And since the field stays finite, $V$ is continuous: integrating a finite field over a vanishing distance gives nothing. In terms of $V$ alone, the conditions read
$$V_{\text{above}} = V_{\text{below}}, \qquad \frac{\partial V_{\text{above}}}{\partial n} - \frac{\partial V_{\text{below}}}{\partial n} = -\frac{\sigma}{\varepsilon_0}.$$
These two lines are the glue of every boundary-value problem ahead: solve Laplace’s equation on each side of a surface, then stitch the pieces together with them.`,
  symbols: [
    { tex: '\\vec E_{\\text{above}},\\ \\vec E_{\\text{below}}', text: 'the field just on either side of the surface, in V/m' },
    { tex: '\\hat n', text: 'the unit normal to the surface, pointing from “below” to “above”' },
    { tex: '\\sigma', text: 'the surface charge density at that point, in C/m²' },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $8.854\times10^{-12}\ \text{F/m}$` },
    { tex: 'V_{\\text{above}},\\ V_{\\text{below}}', text: 'the potential just on either side, in V' },
    { tex: '\\partial V/\\partial n', text: t`the normal derivative $\nabla V\cdot\hat n$: the slope of $V$ along $\hat n$, in V/m` },
  ],
  why: t`Spacecraft charging, the field at a conductor’s surface, the bound charge on a dielectric, and the solutions inside and outside a sphere in module M4 are all fixed by these jump conditions.`,
  visual: {
    type: 'em-field',
    title: 'What jumps and what does not',
    lead: t`An infinite charged sheet stands edge-on down the middle, in a uniform external field you set. Drag the probe across the sheet and watch the readouts: $E_x$ (normal to the sheet) jumps, $E_y$ (along it) does not. The graph below the picture is $V$ along the horizontal line through the probe: a kink, never a step.`,
    tasks: [
      t`Set both external fields to zero. On the left $E_x = -\sigma/2\varepsilon_0$, on the right $+\sigma/2\varepsilon_0$: the jump is $\sigma/\varepsilon_0$, never $\sigma/2\varepsilon_0$.`,
      t`Now turn the external fields on. Both sides change, but the **difference** in $E_x$ across the sheet stays $\sigma/\varepsilon_0$, and $E_y$ is the same on both sides.`,
      t`Set $\sigma = 0$: the kink in the $V$ graph straightens out — no charge, no change of slope.`,
    ],
    params: {
      unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6, 6],
      sheets: [{ x: 0, y: 0, angle: 90, sigma: 'sig' }], uniform: ['Ex0', 'Ey0'], ref: [0, 0],
      arrows: true, fieldLines: false, equip: true, probe: { x: 3, y: 1.5, label: 'P' }, profile: true,
      readouts: ['Ex', 'Ey', 'V'],
      sliders: [
        { key: 'sig', label: t`Surface charge $\sigma$`, min: -150, max: 150, step: 10, value: 100, unit: t`\text{nC/m}^2`, explain: 'The sheet’s charge per area. 100 nC/m² gives σ/ε₀ ≈ 11 300 V/m.' },
        { key: 'Ex0', label: t`External field, normal part`, min: -10000, max: 10000, step: 500, value: 0, unit: t`\text{V/m}`, explain: 'A uniform field across the sheet, from charges far away.' },
        { key: 'Ey0', label: t`External field, tangential part`, min: -10000, max: 10000, step: 500, value: 4000, unit: t`\text{V/m}`, explain: 'A uniform field along the sheet.' },
      ],
    },
    caption: t`The sheet is infinite and seen edge-on; $V = 0$ on it. Arrow lengths are compressed. The jump conditions hold point by point on any surface, curved or not, as long as $\sigma$ is finite.`,
  },
  example: {
    prompt: t`A sphere of radius $R = 5$ cm carries a surface charge with no charge anywhere else. The potential is $V = A\,r\cos\theta$ inside and $V = A\dfrac{R^3}{r^2}\cos\theta$ outside, with $A = 2000$ V/m. Check the boundary conditions and find $\sigma(\theta)$.`,
    visual: spherePic(t`Equipotentials of this $V$ (low blue, high gold) with the sphere in orange and the polar axis vertical. Inside they are flat planes — a uniform field; outside they curve like a dipole’s.`),
    steps: [
      { label: 'V is continuous', text: t`At $r = R$: inside gives $AR\cos\theta$, outside gives $A\dfrac{R^3}{R^2}\cos\theta = AR\cos\theta$ ✓. Equal for every $\theta$, so the tangential field $-\frac1r\partial V/\partial\theta$ matches too.` },
      { label: 'Normal derivatives', text: t`Here $\hat n = \hat r$. Outside: $\partial V/\partial r = -2A\dfrac{R^3}{r^3}\cos\theta \to -2A\cos\theta$ at $r = R$. Inside: $\partial V/\partial r = A\cos\theta$.` },
      { label: 'The jump gives sigma', text: t`$\sigma = -\varepsilon_0\left(\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r}\right) = -\varepsilon_0(-2A - A)\cos\theta = 3\varepsilon_0A\cos\theta$.` },
      { label: 'Numbers', text: t`$\sigma_{\max} = 3(8.854\times10^{-12})(2000) \approx ${nice(sf(3 * EPS0 * 2000 * 1e9, 3))}\ \text{nC/m}^2$ at the north pole, the same negative at the south pole, zero on the equator.` },
      { label: 'Sense check', text: t`Total charge $\int\sigma\,da \propto \int_0^\pi\cos\theta\sin\theta\,d\theta = 0$: no monopole, so no $1/r$ term outside — consistent with the $\cos\theta/r^2$ (dipole) potential. Inside, $\vec E = -A\hat z$ is **uniform**, pointing from the positive cap to the negative one.` },
    ],
    answer: t`$\sigma(\theta) = 3\varepsilon_0A\cos\theta$, up to $\approx ${nice(sf(3 * EPS0 * 2000 * 1e9, 3))}\ \text{nC/m}^2$ at the poles.`,
  },
  practice: [
    num({
      id: 'sigma-from-E', difficulty: 2,
      gen(r) {
        const up = r.pick([300, 500, 800]), down = r.pick([100, 200, 400]);
        const ans = (EPS0 * (up + down)) / 1e-9;
        return {
          prompt: t`Just above a charged surface the field is ${up} V/m pointing straight up, away from the surface. Just below it the field is ${down} V/m pointing straight down, also away from it. What is the surface charge density?`,
          visual: jumpPic(up, -down, 'The surface edge-on (orange) and the field just above and just below it, to scale. The normal n̂ points up.'),
          answer: ans, units: 'nC/m^2', tol: { rel: 0.01 },
          errors: [{ value: (EPS0 * Math.abs(up - down)) / 1e-9, feedback: t`You subtracted the magnitudes. Use components along $\hat n$ (up): above $+${up}$, below $-${down}$ V/m, so the jump is ${up + down} V/m.` }],
          hints: [t`$\sigma = \varepsilon_0\left(E^\perp_{\text{above}} - E^\perp_{\text{below}}\right)$, with both components measured along the same $\hat n$ (up).`, t`$E^\perp_{\text{above}} = +${up}$, $E^\perp_{\text{below}} = -${down}$ V/m.`],
          teach: 'The normal component jumps by σ/ε₀; signed components along one normal, not magnitudes, go into the jump.',
          explain: t`$\sigma = \varepsilon_0(${up} - (-${down})) = (8.854\times10^{-12})(${up + down}) \approx ${nice(sf(ans, 3))}\ \text{nC/m}^2$. Field leaving on both sides means positive charge.`,
        };
      },
    }),
    mcq({
      id: 'tangential', difficulty: 2,
      prompt: t`Why is the tangential component of $\vec E$ continuous across a sheet of charge?`,
      visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ fn: '0', domain: [-9, 9], color: 'warn', width: 4 }, { param: ['-1.6 + 3.2*t', '0.25'], t: [0, 1], color: 'violet', width: 2 }, { param: ['1.6 - 3.2*t', '-0.25'], t: [0, 1], color: 'violet', width: 2 }, { param: ['1.6', '-0.25 + 0.5*t'], t: [0, 1], color: 'violet', width: 2 }, { param: ['-1.6', '0.25 - 0.5*t'], t: [0, 1], color: 'violet', width: 2 }], arrows: [{ from: [-0.3, 0.25], to: [0.3, 0.25], color: 'violet', width: 2 }, { from: [0.3, -0.25], to: [-0.3, -0.25], color: 'violet', width: 2 }], points: [{ x: 1.7, y: 0, r: 0, label: 'width → 0', labelDx: 4 }, { x: 0, y: 0.25, r: 0, label: 'length ℓ', labelDy: -10, labelDx: -20 }] }, caption: 'A thin rectangular loop (violet) straddling the charged sheet (orange), seen edge-on.' },
      choices: [
        t`$\oint\vec E\cdot d\vec l = 0$ round a thin loop straddling the sheet, so $E^\parallel_{\text{above}}\ell - E^\parallel_{\text{below}}\ell = 0$`,
        t`The pillbox encloses no charge sideways`,
        t`The sheet’s own field has no tangential part, and the external field cannot change across it`,
        t`Charge on a sheet cannot move along it`,
      ],
      answer: 0,
      why: {
        1: 'The pillbox fixes the normal component only: its flux comes through the flat faces. The tangential statement needs a loop, i.e. the curl.',
        2: 'True for a flat, uniform sheet, but the condition holds for any surface and any σ(position); the general reason is the vanishing curl.',
        3: 'Electrostatics assumes the charges are already at rest; the condition follows from ∇×E = 0, not from what the charges can do.',
      },
      hints: ['Which of Maxwell’s statics equations involves a line integral round a loop?', t`Shrink the short sides to zero: only the two long sides, one above and one below, contribute to $\oint\vec E\cdot d\vec l$.`],
      teach: 'Divergence (Gauss, a pillbox) controls the normal component; curl (a loop) controls the tangential one.',
      explain: t`With $\nabla\times\vec E = 0$, the circulation round any loop vanishes. For a loop of length $\ell$ whose short sides shrink to zero, $\left(E^\parallel_{\text{above}} - E^\parallel_{\text{below}}\right)\ell = 0$. Together with the pillbox this gives the whole jump: $\vec E_{\text{above}} - \vec E_{\text{below}} = (\sigma/\varepsilon_0)\hat n$.`,
    }),
    multi({
      id: 'continuous', difficulty: 2,
      prompt: t`Across a surface with a finite surface charge $\sigma$, which of these are **always** continuous?`,
      visual: field({ x: [-10, 10], y: [-6, 6], sheets: [{ x: 0, y: 0, angle: 90, sigma: 80 }], uniform: [3000, 3000], ref: [0, 0], arrows: true, equip: true, probe: { x: 3, y: 1 }, profile: true }, 'A charged sheet (edge-on) in a slanting external field, with the potential along the horizontal line through the probe drawn below.'),
      choices: [t`$V$`, t`$E^\parallel$, the tangential component of $\vec E$`, t`$E^\perp$, the normal component of $\vec E$`, t`$\partial V/\partial n$`, t`the derivative of $V$ along the surface`],
      answer: [0, 1, 4],
      why: {
        2: t`It jumps by $\sigma/\varepsilon_0$ — that is Gauss’s law on a pillbox.`,
        3: t`$\partial V/\partial n = -E^\perp$, so it jumps by $-\sigma/\varepsilon_0$: the kink in the graph.`,
      },
      hints: [t`$\partial V/\partial n = -E^\perp$, and a derivative of $V$ along the surface is minus a tangential component of $\vec E$.`],
      teach: 'V and its derivatives along the surface are continuous; only the normal derivative (the normal field) jumps.',
      explain: t`$V$ is continuous because $\vec E$ is finite; its tangential derivatives are then continuous too (they are $-E^\parallel$). Only the normal derivative jumps, by $-\sigma/\varepsilon_0$ — a kink, not a step. (A **dipole layer**, with infinite $\sigma$ of both signs a vanishing distance apart, is the one idealization in which $V$ itself jumps.)`,
    }),
    num({
      id: 'sigma-from-V', difficulty: 2,
      gen(r) {
        const g1 = r.pick([2000, 3000, 5000]), g2 = r.pick([1000, 4000, 6000]), V0 = r.pick([100, 200]);
        const ans = (EPS0 * (g1 + g2)) / 1e-9;
        return {
          prompt: t`Near a large charged plane at $x = 0$ the potential is $V = ${V0} - ${g1}x$ for $x > 0$ and $V = ${V0} + ${g2}x$ for $x < 0$ (volts, $x$ in metres). Find the plane’s surface charge density.`,
          visual: { type: 'graph', params: { x: [-1, 1], y: [0, 1.25], aspect: 'wide', xlabel: 'x', ylabel: 'V', yticks: 0, xticks: 0, curves: [{ fn: `1 - ${(g1 / Math.max(g1, g2)) * 0.8}*x`, domain: [0, 1], color: 'accent', width: 2.6 }, { fn: `1 + ${(g2 / Math.max(g1, g2)) * 0.8}*x`, domain: [-1, 0], color: 'accent', width: 2.6 }], vlines: [{ x: 0, color: 'warn', label: 'plane' }] }, caption: t`The shape of $V(x)$: continuous at the plane, with a kink. Slopes in proportion; the vertical scale is arbitrary.` },
          answer: ans, units: 'nC/m^2', tol: { rel: 0.01 },
          errors: [{ value: (EPS0 * Math.abs(g1 - g2)) / 1e-9, feedback: t`Watch the signs: $E_x = -dV/dx$ is $+${g1}$ on the right and $-${g2}$ on the left.` }],
          hints: [t`$\dfrac{\partial V_{\text{above}}}{\partial n} - \dfrac{\partial V_{\text{below}}}{\partial n} = -\dfrac{\sigma}{\varepsilon_0}$, with $\hat n = \hat x$ (“above” is $x > 0$).`, t`$dV/dx$ is $-${g1}$ on the right and $+${g2}$ on the left, so the jump is $-${g1 + g2}$ V/m.`],
          teach: 'A kink in V is a surface charge: σ = −ε₀ times the jump in the normal derivative.',
          explain: t`$\sigma = -\varepsilon_0(-${g1} - ${g2}) = (8.854\times10^{-12})(${g1 + g2}) \approx ${nice(sf(ans, 3))}\ \text{nC/m}^2$. $V$ peaks at the plane, so the field points away on both sides: positive charge.`,
        };
      },
    }),
    mcq({
      id: 'err-half', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “A sheet’s field is $\sigma/2\varepsilon_0$, so crossing the sheet changes $E^\perp$ by $\sigma/2\varepsilon_0$.” What is wrong?`,
      visual: field({ x: [-10, 10], y: [-6, 6], sheets: [{ x: 0, y: 0, angle: 90, sigma: 60 }], arrows: true, fieldLines: true }, 'An isolated charged sheet, edge-on: its field points away from it on both sides.'),
      choices: [
        t`The sheet’s field reverses direction: it goes from $-\sigma/2\varepsilon_0$ to $+\sigma/2\varepsilon_0$, a change of $\sigma/\varepsilon_0$`,
        t`Nothing: the jump is $\sigma/2\varepsilon_0$`,
        t`The jump is $2\sigma/\varepsilon_0$, one $\sigma/\varepsilon_0$ for each face`,
        t`$E^\perp$ is continuous; only $V$ jumps`,
      ],
      answer: 0,
      why: {
        1: t`$\sigma/2\varepsilon_0$ is the size of the sheet’s field on **one** side; on the other side it points the opposite way.`,
        2: 'A sheet of charge has no “faces” carrying separate charges; the pillbox encloses σA once.',
        3: 'Backwards: V is continuous; the normal field is what jumps.',
      },
      hints: [t`Write the normal component on each side with a sign, along one fixed $\hat n$.`, t`Left: $-\sigma/2\varepsilon_0$. Right: $+\sigma/2\varepsilon_0$.`],
      teach: 'The jump is the difference of signed normal components, σ/ε₀, whatever the field’s size on each side.',
      explain: t`Along $\hat n$ the sheet’s own field is $-\sigma/2\varepsilon_0$ below and $+\sigma/2\varepsilon_0$ above: the jump is $\sigma/\varepsilon_0$. Any external field adds the same amount on both sides and drops out of the difference. This is the factor-of-2 slip of the pillbox, in another costume.`,
    }),
    num({
      id: 'cos-sphere', difficulty: 3,
      gen(r) {
        const k = r.pick([10, 30, 50]);
        const A = (k * 1e-9) / (3 * EPS0);
        return {
          prompt: t`A sphere carries $\sigma = k\cos\theta$ with $k = ${k}$ nC/m² and no other charge. Try $V = Ar\cos\theta$ inside and $V = AR^3\cos\theta/r^2$ outside (this already makes $V$ continuous). Use the jump in $\partial V/\partial r$ to find $A$, which is also the size of the uniform field inside.`,
          visual: spherePic(t`Equipotentials of the trial solution, with the sphere in orange. Inside: parallel planes, a uniform field. Not to any particular scale.`),
          answer: A, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: (k * 1e-9) / EPS0, feedback: t`The jump in $\partial V/\partial r$ at $r = R$ is $-2A\cos\theta - A\cos\theta = -3A\cos\theta$, not $-A\cos\theta$.` }, { value: (k * 1e-9) / (2 * EPS0), feedback: t`Differentiate the outside solution: $\partial_r(R^3/r^2) = -2R^3/r^3$, which is $-2$ at $r = R$. Then add the inside slope.` }],
          hints: [t`$\sigma = -\varepsilon_0\left(\partial_rV_{\text{out}} - \partial_rV_{\text{in}}\right)$ at $r = R$.`, t`$\partial_rV_{\text{out}} = -2A\cos\theta$, $\partial_rV_{\text{in}} = A\cos\theta$, so $\sigma = 3\varepsilon_0A\cos\theta$.`],
          teach: 'Continuity of V picks the shape; the jump in the normal derivative fixes the size.',
          explain: t`$3\varepsilon_0A\cos\theta = k\cos\theta$ gives $A = \dfrac{k}{3\varepsilon_0} = \dfrac{${k}\times10^{-9}}{3(8.854\times10^{-12})} \approx ${nice(sf(A, 3))}$ V/m. Inside, $\vec E = -A\hat z$: uniform, pointing from the positive cap to the negative one. Module M4 builds the general method from exactly this step.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-earth', difficulty: 3, transfer: true,
      gen(r) {
        const E = r.pick([100, 120, 130, 150]);
        const sig = -EPS0 * E, Q = sig * 4 * Math.PI * RE * RE;
        return {
          prompt: t`On a calm day the atmospheric electric field at the ground is about ${E} V/m, pointing straight **down**. The ground conducts, so the field just below its surface is zero. If the same field held all over the Earth (radius 6 371 km), what would the Earth’s total charge be, in kilocoulombs?`,
          visual: jumpPic(-E, 0, 'The ground (orange) edge-on, the fair-weather field just above it pointing down, and no field inside the conducting ground. The normal n̂ points up, out of the Earth.', { show: true }),
          answer: Q / 1000, units: 'kC', tol: { rel: 0.01 },
          errors: [{ value: -Q / 1000, feedback: 'The field points down, into the ground: field lines end on the surface, so the charge there is negative.' }, { value: (sig * 2 * Math.PI * RE * RE) / 1000, feedback: t`The area of a sphere is $4\pi R^2$.` }],
          hints: [t`$\sigma = \varepsilon_0\left(E^\perp_{\text{above}} - E^\perp_{\text{below}}\right)$ with $\hat n$ up: $E^\perp_{\text{above}} = -${E}$ V/m, $E^\perp_{\text{below}} = 0$.`, t`Then $Q = \sigma\cdot4\pi R^2$ with $R = 6.371\times10^6$ m. Give the answer in kC, with its sign.`],
          teach: 'At a conductor the field inside is zero, so the jump condition gives the surface charge directly: σ = ε₀E⊥ outside.',
          explain: t`$\sigma = -\varepsilon_0\cdot${E} \approx ${tex(sig, 3)}\ \text{C/m}^2$, and $Q = 4\pi R^2\sigma \approx ${tex(Q, 3)}$ C, about $${nice(sf(Q / 1000, 3))}$ kC. Thunderstorms worldwide keep charging the Earth negative against the fair-weather leak current — the global electric circuit. The real field varies with place, weather and the time of day.`,
        };
      },
    }),
    num({
      id: 'cp-slant', difficulty: 3,
      gen(r) {
        const Et = r.pick([300, 400]), Ea = r.pick([600, 900]), Eb = r.pick([200, 500]);
        const ans = (EPS0 * (Ea - Eb)) / 1e-9;
        return {
          prompt: t`Just above a charged surface the field has a tangential component ${Et} V/m and a normal component ${Ea} V/m (along $\hat n$, away from the surface). Just below, the tangential component is again ${Et} V/m and the normal component is ${Eb} V/m along $\hat n$ (pointing **toward** the surface). Find $\sigma$.`,
          visual: jumpPic(Ea, Eb, 'The surface edge-on and the field just above and below it, to scale, with n̂ up. Both have the same tangential part.', { tang: Et, show: true }),
          answer: ans, units: 'nC/m^2', tol: { rel: 0.01 },
          errors: [{ value: (EPS0 * (Math.hypot(Et, Ea) - Math.hypot(Et, Eb))) / 1e-9, feedback: 'Only the normal components enter the jump. The tangential parts are equal and cancel; the magnitudes mix them in.' }, { value: (EPS0 * (Ea + Eb)) / 1e-9, feedback: t`Below, the normal component is $+${Eb}$ along $\hat n$ (it points up, toward the surface from below).` }],
          hints: [t`Only the normal component jumps: $\sigma = \varepsilon_0\left(E^\perp_{\text{above}} - E^\perp_{\text{below}}\right)$.`, t`Along $\hat n$: above $+${Ea}$, below $+${Eb}$ V/m.`],
          teach: 'Split the field into normal and tangential parts at the surface; only the normal part carries the surface charge.',
          explain: t`$\sigma = \varepsilon_0(${Ea} - ${Eb}) \approx ${nice(sf(ans, 3))}\ \text{nC/m}^2$. The equal tangential parts confirm the curl condition.`,
        };
      },
    }),
    mcq({
      id: 'cp-glue', difficulty: 3,
      prompt: t`You have solved Laplace’s equation inside and outside a sphere that carries a known $\sigma(\theta)$, each with unknown coefficients. Which two conditions at $r = R$ fix them?`,
      visual: spherePic('A sphere (orange) with a solution inside and another outside, to be stitched together at its surface.'),
      choices: [
        t`$V_{\text{in}} = V_{\text{out}}$, and $\partial_rV_{\text{out}} - \partial_rV_{\text{in}} = -\sigma/\varepsilon_0$`,
        t`$V_{\text{in}} = V_{\text{out}}$, and $\partial_rV_{\text{out}} = \partial_rV_{\text{in}}$`,
        t`$V_{\text{out}} - V_{\text{in}} = \sigma/\varepsilon_0$, and $\partial_rV_{\text{out}} = \partial_rV_{\text{in}}$`,
        t`$V = 0$ on the sphere, and $\vec E = 0$ inside`,
      ],
      answer: 0,
      why: {
        1: 'That would hold with no surface charge; with σ ≠ 0 the normal derivative must jump.',
        2: t`$V$ never jumps across a finite $\sigma$ (it has the wrong units, too: $\sigma/\varepsilon_0$ is a field, in V/m).`,
        3: 'Those describe a grounded conductor, not a sphere with a given surface charge.',
      },
      hints: ['One condition comes from V being continuous, the other from the pillbox.', t`The pillbox says the normal field, $-\partial V/\partial r$, jumps by $\sigma/\varepsilon_0$.`],
      teach: 'Gluing solutions across a charged surface: V continuous, normal derivative jumping by −σ/ε₀.',
      explain: t`Continuity of $V$ and the jump in its normal derivative give two equations per Legendre term — exactly enough for the two unknown coefficients (inside and outside). That is the recipe of [M4.4](#/lesson/phys3600.M4.4).`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §2.3.5', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Feynman Lectures on Physics, Vol. II, ch. 9: Electricity in the atmosphere', url: 'https://www.feynmanlectures.caltech.edu/II_09.html' },
  ],
});
