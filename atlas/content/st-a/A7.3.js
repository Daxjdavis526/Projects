// Invariants: contract every index of a tensor field and the Jacobian factors
// cancel in pairs, leaving a scalar every observer agrees on. The
// electromagnetic invariant F_{μν}F^{μν} = 2(B² − E²/c²) across Lorentz
// boosts, and the trace of the stress tensor across rotations.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6, plane, DEG } from './_tcalc.js';
import { grid, legs } from './_ten.js';

const t = String.raw;
const C = 2.998e8;

// E and B in the lab, drawn as two arrows (E/c and B to one scale, in mT)
function fieldsPic(Ec, B, angleDeg = 90, caption) {
  const big = Math.max(Ec, B), s = 1.6 / big;
  const a = angleDeg * DEG;
  return plane({
    x: [-2.6, 2.6], y: [-0.6, 2.2],
    arrows: [
      { from: [0, 0], to: [0, r6(Ec * s)], color: 'gold', width: 3, label: 'E/c', labelDx: 6 },
      { from: [0, 0], to: [r6(B * s * Math.sin(a)), r6(B * s * Math.cos(a))], color: 'accent', width: 3, label: 'B', labelDx: 6 },
    ],
    points: [{ x: 0, y: 0, r: 3, color: 'ink2' }],
    caption: caption || t`The lab’s fields at one point, $E/c$ (gold) and $B$ (blue), drawn to one scale in millitesla.`,
  });
}

// E′ and B′ as functions of the boost speed β = v/c, for crossed fields (E/c and B in mT)
function boostPic(Ec, B, { caption, mark } = {}) {
  const top = Math.max(4, 1.6 * (Ec * Ec + B * B));
  return {
    type: 'graph',
    params: {
      x: [-0.9, 0.9], y: [r6(-top * 0.45), r6(top)], aspect: 'wide', xlabel: 'boost speed β = v/c', ylabel: 'mT  or  mT²', xticks: 6, yticks: 5,
      curves: [
        { fn: `(${Ec} - x*${B})/sqrt(1 - x^2)`, color: 'gold', width: 2.4, label: 'E′/c', labelAt: -0.75 },
        { fn: `(${B} - x*${Ec})/sqrt(1 - x^2)`, color: 'accent', width: 2.4, label: 'B′', labelAt: -0.75 },
        { fn: `${r6(B * B - Ec * Ec)} + 0*x`, color: 'good', width: 2, dash: [6, 4], label: 'B′² − E′²/c²', labelAt: 0.35 },
      ],
      ...(mark ? { vlines: [{ x: mark, color: 'ink3' }] } : {}),
    },
    caption: caption || t`Crossed fields seen from frames moving at speed $\beta c$ along $\mathbf E\times\mathbf B$’s line: $E'/c$ (gold) and $B'$ (blue) change; $B'^2 - E'^2/c^2$ (green, dashed) does not.`,
  };
}

const ffLegs = legs([{ name: 'F', down: [] }, { name: 'F', up: [] }], { links: [{ a: 0, b: 1, index: 'μ' }, { a: 0, b: 1, index: 'ν', arc: true }], caption: t`$F_{\mu\nu}F^{\mu\nu}$ as an index diagram: both pairs joined, no loose legs — a scalar.` });

export default lesson({
  id: 'st-a.A7.3',
  title: 'Invariants: building scalars from tensors',
  minutes: 12, difficulty: 3,
  intro: t`Contract **every** index of a tensor expression — each upper index summed against a lower one — and what is left has no indices at all. Under a change of coordinates each upper index brings a factor $\partial x'/\partial x$ and each lower one a factor $\partial x/\partial x'$; in a contracted pair the two are inverse matrices and cancel. So a full contraction is a **scalar**: one number per point that every coordinate system, and every observer, agrees on. The length $V^\mu V_\mu$ is one; the trace $T^\mu{}_\mu$ is another. The most famous comes from the electromagnetic field tensor:

$$F_{\mu\nu}F^{\mu\nu} = 2\left(B^2 - \frac{E^2}{c^2}\right)$$

Observers moving relative to each other disagree about $\mathbf E$ and $\mathbf B$ — one’s pure magnetic field is another’s mixture — but never about this combination.`,
  symbols: [
    { tex: t`F_{\mu\nu}`, text: t`the electromagnetic field tensor, antisymmetric: $F_{0i} = -E_i/c$ and $F_{ij} = \varepsilon_{ijk}B^k$ (with $x^0 = ct$; Carroll’s convention, set $c = 1$ there). In tesla` },
    { tex: t`F^{\mu\nu}`, text: t`the same tensor with both indices raised by $\eta^{\mu\nu} = \text{diag}(-1, 1, 1, 1)$: $F^{0i} = +E_i/c$, $F^{ij} = F_{ij}$` },
    { tex: t`E`, text: t`the size of the electric field, in V/m` },
    { tex: t`B`, text: t`the size of the magnetic field, in tesla` },
    { tex: t`c`, text: t`the speed of light, $2.998\times10^{8}$ m/s; $E/c$ is in tesla, so the two terms can be compared` },
  ],
  why: t`Invariants are how general relativity asks coordinate-free questions: is this a real singularity or a bad grid? (the curvature invariant $R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}$ answers it, lesson gr.EQ.4); is this field configuration a light wave in every frame? ($F_{\mu\nu}F^{\mu\nu} = 0$).`,
  visual: {
    type: 'graph',
    title: 'Fields change with the observer; the invariant does not',
    lead: t`Crossed fields — $\mathbf E$ along $y$, $\mathbf B$ along $z$ — and observers moving along $x$ at speed $\beta c$. Each observer measures $E' = \gamma(E - vB)$ and $B' = \gamma(B - vE/c^2)$. The curves show what each one sees; the dashed line is $B'^2 - E'^2/c^2$.`,
    tasks: [
      t`Set $E/c = 1$ mT and $B = 2$ mT. Find the speed where $E'$ crosses zero ($\beta = 0.5$): that observer sees a pure magnetic field of $\sqrt3 \approx 1.73$ mT — exactly what the invariant demands, $\sqrt{B^2 - E^2/c^2}$.`,
      t`Make $E/c$ bigger than $B$: now $B'$ crosses zero instead, and the invariant is negative. No observer can make a mostly electric field purely magnetic.`,
      t`Set $E/c = B$, as in a light wave: the invariant is 0, and both fields shrink or grow together without either ever vanishing.`,
    ],
    params: {
      x: [-0.9, 0.9], y: [-4, 10], aspect: 'wide', xlabel: 'boost speed β = v/c', ylabel: 'mT  or  mT²', xticks: 6, yticks: 7,
      sliders: [
        { key: 'e', label: '$E/c$ in the lab', min: 0, max: 3, step: 0.1, value: 1, unit: '\\mathrm{mT}', explain: 'The electric field divided by c, in millitesla: 1 mT means E = 3.0 × 10⁵ V/m.' },
        { key: 'b', label: '$B$ in the lab', min: 0, max: 3, step: 0.1, value: 2, unit: '\\mathrm{mT}', explain: 'The magnetic field, at right angles to E.' },
        { key: 'v', label: 'your speed $\\beta$', min: -0.9, max: 0.9, step: 0.05, value: 0, explain: 'Speed along x, as a fraction of c.' },
      ],
      curves: [
        { fn: '(e - x*b)/sqrt(1 - x^2)', color: 'gold', width: 2.4, label: 'E′/c', labelAt: -0.8 },
        { fn: '(b - x*e)/sqrt(1 - x^2)', color: 'accent', width: 2.4, label: 'B′', labelAt: -0.65 },
        { fn: 'b^2 - e^2 + 0*x', color: 'good', width: 2, dash: [6, 4], label: 'B′² − E′²/c²', labelAt: 0.45 },
        { fn: '((e^2 + b^2)*(1 + x^2) - 4*x*e*b)/(1 - x^2)', color: 'warn', width: 1.6, label: 'B′² + E′²/c²', labelAt: 0.7 },
      ],
      vlines: [{ x: 'v', color: 'ink3' }],
      readouts: [
        { label: t`$E'/c$ (mT)`, expr: '(e - v*b)/sqrt(1 - v^2)', digits: 3 },
        { label: t`$B'$ (mT)`, expr: '(b - v*e)/sqrt(1 - v^2)', digits: 3 },
        { label: t`$B'^2 - E'^2/c^2$ (mT²)`, expr: '((b - v*e)^2 - (e - v*b)^2)/(1 - v^2)', digits: 3 },
        { label: t`$B'^2 + E'^2/c^2$ (mT²)`, expr: '((b - v*e)^2 + (e - v*b)^2)/(1 - v^2)', digits: 3 },
      ],
    },
    caption: t`Exact Lorentz transformation of crossed fields for a boost along $\mathbf E\times\mathbf B$. Fields in mT ($E/c$ for the electric one); their squares in mT². The orange curve, proportional to the energy density, is not invariant — it is one component of a tensor, not a contraction.`,
  },
  example: {
    prompt: t`In a lab, $\mathbf E = (0, 3.0\times10^{5}, 0)$ V/m and $\mathbf B = (0, 0, 2.0\times10^{-3})$ T at a point. Compute $F_{\mu\nu}F^{\mu\nu}$, then use it to find the magnetic field seen by the observer for whom the electric field vanishes.`,
    visual: fieldsPic(1.0007, 2, 90, t`The lab’s fields at the point: $E/c \approx 1.0$ mT (gold) and $B = 2.0$ mT (blue), at right angles. Drawn to one scale.`),
    steps: [
      { label: 'Build the tensor', text: t`With $E_y/c = 3.0\times10^5/2.998\times10^8 = 1.0007\times10^{-3}$ T: $F_{02} = -E_y/c$, $F_{20} = +E_y/c$, $F_{12} = B_z$, $F_{21} = -B_z$; the other twelve components are zero.` },
      { label: 'Raise both indices', text: t`$F^{\mu\nu} = \eta^{\mu\alpha}\eta^{\nu\beta}F_{\alpha\beta}$. A time index picks up $\eta^{00} = -1$, a space index $+1$: $F^{02} = +E_y/c$, $F^{20} = -E_y/c$, $F^{12} = F_{12}$, $F^{21} = F_{21}$.` },
      { label: 'Contract', text: t`$F_{\mu\nu}F^{\mu\nu} = F_{02}F^{02} + F_{20}F^{20} + F_{12}F^{12} + F_{21}F^{21} = -2(E_y/c)^2 + 2B_z^2 = 2(4.000 - 1.001)\times10^{-6} = 6.00\times10^{-6}\ \text{T}^2$.` },
      { label: 'Use the invariant', text: t`It is positive: $B$ wins. An observer moving along $\mathbf E\times\mathbf B$ at $v = E/B = 1.5\times10^{8}$ m/s $= 0.50c$ sees $E' = 0$, and the invariant fixes what they do see: $2B'^2 = 6.00\times10^{-6}\ \text{T}^2$, so $B' = 1.73$ mT.` },
      { label: 'Check', text: t`The Lorentz transformation gives $B' = \gamma(B - vE/c^2) = 1.155\,(2.0 - 0.50\times1.0007)$ mT $= 1.73$ mT ✓ — the long way round, which the invariant let you skip.` },
    ],
    answer: t`$F_{\mu\nu}F^{\mu\nu} = 6.00\times10^{-6}\ \text{T}^2$; the observer moving at $0.50c$ along $\mathbf E\times\mathbf B$ sees a pure magnetic field of $1.73$ mT.`,
  },
  practice: [
    num({
      id: 'ff-number', difficulty: 2,
      gen(r) {
        const B = r.pick([1, 2, 4]) * 1e-3, E = r.pick([1.5, 3, 6, 9]) * 1e5;
        const ans = 2 * (B * B - (E * E) / (C * C));
        return {
          prompt: t`At a point in a lab, $E = ${tex(E)}$ V/m and $B = ${B * 1000}$ mT, at right angles. Find the invariant $F_{\mu\nu}F^{\mu\nu} = 2(B^2 - E^2/c^2)$, in $\text{T}^2$.`,
          visual: fieldsPic(E / C * 1000, B * 1000, 90, t`The two fields at the point, $E/c$ and $B$, drawn to one scale.`),
          answer: ans, units: 'T^2', tol: { rel: 0.01 },
          errors: [{ value: 2 * (B * B + (E * E) / (C * C)), feedback: t`Raising a time index flips its sign ($\eta^{00} = -1$), so the electric terms enter with a minus sign.` }, { value: 2 * (B * B - E * E), feedback: t`Divide $E$ by $c$ first: $E/c$ is in tesla, the same units as $B$.` }],
          hints: [t`$E/c = ${tex(E)}/(2.998\times10^8) = ${tex(E / C, 4)}$ T.`, t`$F_{\mu\nu}F^{\mu\nu} = 2\big[(${tex(B)})^2 - (${tex(E / C, 4)})^2\big]$.`],
          teach: t`$F_{\mu\nu}F^{\mu\nu} = 2(B^2 - E^2/c^2)$: the minus sign comes from raising the time index with $\eta^{00} = -1$.`,
          explain: t`$2\big(${tex(B * B, 4)} - ${tex((E * E) / (C * C), 4)}\big) = ${tex(ans, 4)}\ \text{T}^2$ — ${ans > 0 ? 'positive, so some observer sees no electric field at all' : 'negative, so some observer sees no magnetic field at all'}.`,
        };
      },
    }),
    multi({
      id: 'which-scalars', difficulty: 2,
      prompt: 'Which of these are scalars — the same in every coordinate system? (Repeated indices are summed.) Select every one.',
      visual: ffLegs,
      choices: [t`$V^\mu V_\mu$`, t`$T^\mu{}_\mu$`, t`$F_{\mu\nu}F^{\mu\nu}$`, t`$T^{\mu\mu}$, summed over $\mu$`, t`$T^{00}$`, t`$g_{\mu\nu}U^\mu V^\nu$`],
      answer: [0, 1, 2, 5],
      why: {
        3: 'Two upper indices summed is not a contraction: their two forward Jacobians do not cancel. In Minkowski space it even disagrees with the trace by the sign of the time term.',
        4: 'A single component is one observer’s view — here the energy density in one frame, which a moving observer measures differently.',
      },
      hints: ['A scalar has no free indices, and every summed pair must be one upper and one lower.'],
      teach: 'Only a full contraction — every index paired upper with lower — is a scalar.',
      explain: t`$V^\mu V_\mu$, $T^\mu{}_\mu$, $F_{\mu\nu}F^{\mu\nu}$ and $g_{\mu\nu}U^\mu V^\nu$ pair every index up with down, so all Jacobian factors cancel. $T^{\mu\mu}$ sums two uppers; $T^{00}$ is a component.`,
    }),
    num({
      id: 'trace-rotated', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-40, 80, [0]), b = r.intExcept(-40, 80, [0, a]), c = r.intExcept(-30, 30, [0]), ph = r.pick([20, 30, 40, 50]);
        const co = Math.cos(ph * DEG), si = Math.sin(ph * DEG);
        const sxx = Math.round((a * co * co + b * si * si) * 100) / 100, sxy = Math.round((b - a) * si * co * 100) / 100;
        const ans = a + b + c - sxx - c;
        return {
          prompt: t`At a point in a turbine blade the principal stresses — the stress components along the three axes in which it has no shear — are $${a}$, $${b}$ and $${c}$ MPa. In axes turned $${ph}^\circ$ about the third axis, $\sigma'_{xx} = ${sxx}$ MPa and $\sigma'_{zz} = ${c}$ MPa. Find $\sigma'_{yy}$, in MPa.`,
          visual: grid([[sxx, sxy, 0], [sxy, '?', 0], [0, 0, c]], { hl: [[1, 1]], rowNames: ['x′', 'y′', 'z′'], colNames: ['x′', 'y′', 'z′'], dx: 1.4, caption: t`The stress components in the turned axes, MPa; $\sigma'_{yy}$ is the one asked for.` }),
          answer: ans, units: 'MPa', tol: { rel: 0, abs: 0.06 },
          errors: [{ value: a + b + c, feedback: 'That is the whole trace. Subtract the two diagonal components you already know.' }],
          hints: [t`The trace $\sigma^i{}_i$ is a scalar: it is the same in the turned axes as in the principal ones.`, t`$\sigma'_{yy} = (${a} + ${b} + ${c}) - ${sxx} - ${c}$.`],
          teach: 'The trace of the stress tensor is an invariant: rotations reshuffle the components but never change their diagonal sum.',
          explain: t`$\sigma'_{xx} + \sigma'_{yy} + \sigma'_{zz} = ${a + b + c}$ MPa in any axes, so $\sigma'_{yy} = ${nice(ans)}$ MPa. Minus a third of the trace is the mean pressure, $${nice(-(a + b + c) / 3, 4)}$ MPa here, which sets how much the material’s volume changes.`,
        };
      },
    }),
    mcq({
      id: 'light-wave', difficulty: 2,
      prompt: t`In a light wave in vacuum, $\mathbf E \perp \mathbf B$ and $E = cB$ at every point. What does that imply?`,
      visual: {
        type: 'graph',
        params: { x: [0, 12.57], y: [-1.5, 1.5], aspect: 'wide', xlabel: 'distance along the beam', ylabel: '', xticks: 0, yticks: 0, curves: [{ fn: 'sin(x)', color: 'gold', width: 2.4, label: 'E/c', labelAt: 1.6 }, { fn: 'sin(x)', color: 'accent', width: 1.4, dash: [6, 4], label: 'B', labelAt: 7.9, labelDy: 16 }] },
        caption: t`A plane light wave: $E/c$ and $B$ rise and fall together (they point at right angles, in and across the page; drawn on one axis here).`,
      },
      choices: [
        t`$F_{\mu\nu}F^{\mu\nu} = 0$ in every frame: every observer sees $E = cB$, so light is light for everyone and no frame removes either field`,
        'There is a frame in which the wave is purely magnetic',
        'There is a frame in which the wave is purely electric',
        'The invariant is zero only for observers at rest relative to the source',
      ],
      answer: 0,
      why: {
        1: t`A pure magnetic field would make $F_{\mu\nu}F^{\mu\nu} = 2B'^2 > 0$, but it is 0 in every frame.`,
        2: t`A pure electric field would make the invariant $-2E'^2/c^2 < 0$; it is 0 in every frame.`,
        3: 'An invariant is the same for every observer — that is the whole point.',
      },
      hints: [t`Compute $2(B^2 - E^2/c^2)$ when $E = cB$, and remember that every observer must get the same number.`],
      teach: t`$F_{\mu\nu}F^{\mu\nu} = 0$ (with $\mathbf E \perp \mathbf B$) is a frame-independent statement: the field is light-like for everyone.`,
      explain: t`$2(B^2 - E^2/c^2) = 0$ here, and so in every frame: each observer measures $E' = cB'$. A moving observer sees the light Doppler-shifted — weaker or stronger — but never turned into a static field.`,
    }),
    mcq({
      id: 'no-raise', difficulty: 3, kind: 'error',
      prompt: t`A student wants an invariant and computes $\sum_{\mu,\nu}F_{\mu\nu}F_{\mu\nu}$ — both indices down in both factors — getting $2(B^2 + E^2/c^2)$. What is wrong?`,
      visual: grid([['0', '−Ex/c', '−Ey/c', '−Ez/c'], ['Ex/c', '0', 'Bz', '−By'], ['Ey/c', '−Bz', '0', 'Bx'], ['Ez/c', 'By', '−Bx', '0']], { dx: 1.5, rowNames: ['0', '1', '2', '3'], colNames: ['0', '1', '2', '3'], caption: t`The components $F_{\mu\nu}$, row $\mu$ and column $\nu$.` }),
      choices: [
        t`Summing two lower indices is not a contraction, so the result is not invariant: it is proportional to the field’s energy density, which moving observers measure differently`,
        t`Nothing: squaring every component always gives an invariant`,
        t`They forgot the factor $\tfrac12$: the invariant is $B^2 + E^2/c^2$`,
        t`It is invariant, but only under rotations, not boosts — which is all anyone needs`,
      ],
      answer: 0,
      why: {
        1: 'Squaring and adding is invariant only when the metric is the identity in every frame allowed — rotations in space, but not boosts in spacetime.',
        2: 'A factor of ½ cannot turn a non-invariant into an invariant; the problem is the sign of the electric term.',
        3: 'Boosts are exactly the transformations under which E and B mix; an expression unchanged only by rotations misses the point of relativity.',
      },
      hints: ['Count: is each summed index one up and one down?', t`Compare with the Explore’s orange curve, $B'^2 + E'^2/c^2$.`],
      teach: 'Only upper-against-lower sums cancel the Jacobians; summing squares of components is not invariant under boosts.',
      explain: t`$\sum F_{\mu\nu}^2 = 2(B^2 + E^2/c^2) = 4\mu_0u$, where $u = \tfrac12\varepsilon_0E^2 + B^2/2\mu_0$ is the field’s energy density — the 00 component of a tensor, which grows when you move toward or against the fields (the Explore’s orange curve). Raising with $\eta$ supplies the minus sign that makes $2(B^2 - E^2/c^2)$ invariant.`,
    }),
    num({
      id: 'predict-B', difficulty: 3,
      gen(r) {
        const B = r.pick([2, 3, 5]) * 1e-3, E = r.pick([1.5, 3.0, 4.5]) * 1e5;
        const ans = Math.sqrt(B * B - (E * E) / (C * C)) * 1000;
        return {
          prompt: t`Crossed fields in a lab: $E = ${tex(E)}$ V/m and $B = ${B * 1000}$ mT at right angles. An observer moving along $\mathbf E\times\mathbf B$ at $v = E/B$ measures no electric field. Using only the invariant $F_{\mu\nu}F^{\mu\nu}$, find the magnetic field they measure, in mT.`,
          visual: fieldsPic((E / C) * 1000, B * 1000, 90, t`The lab’s fields, $E/c$ and $B$, drawn to one scale.`),
          answer: ans, units: 'mT', tol: { rel: 0.005 },
          errors: [{ value: B * 1000, feedback: t`Moving observers measure different fields: $B' \ne B$. Use $2(B'^2 - 0) = 2(B^2 - E^2/c^2)$.` }, { value: Math.sqrt(B * B + (E * E) / (C * C)) * 1000, feedback: t`The invariant is $B^2 - E^2/c^2$, with a minus sign.` }],
          hints: [t`In their frame $E' = 0$, so the invariant is $2B'^2$; in the lab it is $2(B^2 - E^2/c^2)$.`, t`$B' = \sqrt{B^2 - (E/c)^2}$ with $E/c = ${tex(E / C, 4)}$ T.`],
          teach: 'An invariant computed in one frame tells you a quantity in another without doing the transformation.',
          explain: t`$B' = \sqrt{(${tex(B)})^2 - (${tex(E / C, 4)})^2}\ \text{T} = ${nice(ans, 4)}$ mT.`,
        };
      },
    }),
    code({
      id: 'sympy-boost', difficulty: 3,
      prompt: t`With $c = 1$, \`F_low\` holds $F_{\mu\nu}$ for arbitrary fields. Finish \`invariant(F)\` so it returns $F_{\mu\nu}F^{\mu\nu}$ (raise both indices with $\eta$: $F^{\mu\nu} = (\eta F\eta)^{\mu\nu}$), and build \`F_boosted\`, the lower-index components seen after a boost of rapidity $w$ along $x$: $F'_{\mu\nu} = (\Lambda^{-1})^\alpha{}_\mu(\Lambda^{-1})^\beta{}_\nu F_{\alpha\beta}$, i.e. $(\Lambda^{-1})^\mathsf{T}F\,\Lambda^{-1}$. The tests check that the invariant does not change.`,
      starter: t`import sympy as sp
Ex, Ey, Ez, Bx, By, Bz = sp.symbols('E_x E_y E_z B_x B_y B_z', real=True)
w = sp.symbols('w', real=True)                  # rapidity: v = tanh(w)
eta = sp.diag(-1, 1, 1, 1)
F_low = sp.Matrix([[0, -Ex, -Ey, -Ez],
                   [Ex, 0, Bz, -By],
                   [Ey, -Bz, 0, Bx],
                   [Ez, By, -Bx, 0]])           # F_{mu nu}, c = 1

def invariant(F):
    pass   # F_{mu nu} F^{mu nu}, simplified

L = sp.Matrix([[sp.cosh(w), -sp.sinh(w), 0, 0],
               [-sp.sinh(w), sp.cosh(w), 0, 0],
               [0, 0, 1, 0],
               [0, 0, 0, 1]])                    # x' = L x: a boost along +x
F_boosted = None                                 # (L^-1)^T F_low L^-1, simplified
print(invariant(F_low))
`,
      answer: t`import sympy as sp
Ex, Ey, Ez, Bx, By, Bz = sp.symbols('E_x E_y E_z B_x B_y B_z', real=True)
w = sp.symbols('w', real=True)                  # rapidity: v = tanh(w)
eta = sp.diag(-1, 1, 1, 1)
F_low = sp.Matrix([[0, -Ex, -Ey, -Ez],
                   [Ex, 0, Bz, -By],
                   [Ey, -Bz, 0, Bx],
                   [Ez, By, -Bx, 0]])           # F_{mu nu}, c = 1

def invariant(F):
    F_up = eta * F * eta
    return sp.simplify(sum(F[i, j] * F_up[i, j] for i in range(4) for j in range(4)))

L = sp.Matrix([[sp.cosh(w), -sp.sinh(w), 0, 0],
               [-sp.sinh(w), sp.cosh(w), 0, 0],
               [0, 0, 1, 0],
               [0, 0, 0, 1]])                    # x' = L x: a boost along +x
Linv = L.inv()
F_boosted = sp.simplify(Linv.T * F_low * Linv)
print(invariant(F_low))`,
      tests: [
        { name: t`\`invariant(F_low)\` is $2(B^2 - E^2)$`, code: 'sp.simplify(invariant(F_low) - 2*(Bx**2 + By**2 + Bz**2 - Ex**2 - Ey**2 - Ez**2)) == 0' },
        { name: t`the boosted field has $E'_y = E_y\cosh w - B_z\sinh w$ (that is, $\gamma(E_y - vB_z)$)`, code: 'F_boosted is not None and sp.simplify(-F_boosted[0, 2] - (Ey*sp.cosh(w) - Bz*sp.sinh(w))) == 0' },
        { name: 'the invariant is the same after the boost', code: 'F_boosted is not None and sp.simplify(invariant(F_boosted) - invariant(F_low)) == 0' },
      ],
      hints: [t`\`F_up = eta * F * eta\`, then add up \`F[i, j] * F_up[i, j]\` over all sixteen pairs.`, t`\`Linv = L.inv()\` and \`F_boosted = sp.simplify(Linv.T * F_low * Linv)\`: each lower index takes one factor of $\Lambda^{-1}$.`],
      teach: 'A computer algebra system confirms invariance for all fields and all boosts at once, symbolically.',
      explain: t`Every component of $F'$ is a mixture of $\mathbf E$ and $\mathbf B$ with $\cosh w$ and $\sinh w$, yet the contraction collapses to $2(B^2 - E^2)$ again, because $\cosh^2w - \sinh^2w = 1$. That identity is the Lorentz group’s version of $\cos^2 + \sin^2 = 1$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([7.5, 7.7]), B = r.pick([25, 30, 35]), Lk = r.pick([2, 5, 10]);
        const gamma = 1 / Math.sqrt(1 - (v * 1e3 / C) ** 2);
        const Ep = gamma * v * 1e3 * B * 1e-6, V = Ep * Lk * 1e3;
        return {
          prompt: t`An electrodynamic tether — a long conducting wire hanging from a satellite — moves at $${v}$ km/s through Earth’s magnetic field of $${B}\ \mu\text{T}$, at right angles to it. In the satellite’s frame there is an electric field $E' = \gamma vB$ along the wire (and $B' = \gamma B$), where in Earth’s frame (ignoring its rotation) there was none. What voltage appears along ${Lk} km of tether?`,
          visual: plane({
            x: [-3.4, 3.4], y: [-2.1, 2.1],
            curves: [{ param: ['1.5*cos(t)', '1.5*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['2.6*cos(t)', '2.6*sin(t)'], t: [0.6, 1.6], color: 'ink4', width: 1, dash: [5, 4] }],
            arrows: [{ from: [r6(2.6 * Math.cos(1.1)), r6(2.6 * Math.sin(1.1))], to: [r6(1.9 * Math.cos(1.1)), r6(1.9 * Math.sin(1.1))], color: 'gold', width: 2, label: 'tether', labelDx: 8 }, { from: [r6(2.6 * Math.cos(1.1)), r6(2.6 * Math.sin(1.1))], to: [r6(2.6 * Math.cos(1.1) - 0.8 * Math.sin(1.1)), r6(2.6 * Math.sin(1.1) + 0.8 * Math.cos(1.1))], color: 'ink', width: 2, label: 'v' }],
            points: [{ x: 0, y: 0, r: 0.01, color: 'accent', label: 'Earth', labelDx: 0, labelDy: 0, labelAlign: 'center' }, { x: r6(2.6 * Math.cos(1.1)), y: r6(2.6 * Math.sin(1.1)), r: 5, color: 'ink' }],
            caption: 'Schematic, not to scale: a satellite in low orbit trailing a tether toward Earth, crossing the geomagnetic field (out of the page here).',
          }),
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: V / 1000, feedback: 'Use SI throughout: v in m/s, B in T, length in m.' }],
          hints: [t`$E' = \gamma vB$ with $\gamma = 1/\sqrt{1 - v^2/c^2} \approx 1$ here.`, t`$V = E'L = (${v}\times10^3)(${B}\times10^{-6})(${Lk}\times10^3)$.`],
          teach: 'What one observer calls a pure magnetic field, a moving observer sees partly as an electric field; only the invariants are shared.',
          explain: t`$E' = ${nice(Ep, 4)}$ V/m, so $V = E'L = ${nice(V, 4)}$ V. The invariant checks it: $B'^2 - E'^2/c^2 = \gamma^2B^2(1 - v^2/c^2) = B^2$, exactly Earth’s value.`,
        };
      },
    }),
    num({
      id: 'cp-trench', difficulty: 2,
      gen(r) {
        const [place, h] = r.pick([['the Challenger Deep (the deepest point of the Mariana Trench)', 10935], ['the Puerto Rico Trench', 8376], ['the abyssal plain', 4000]]);
        const p = (1025 * 9.81 * h) / 1e6;
        return {
          prompt: t`At the bottom of ${place}, ${h} m down, the water pressure is about $\rho gh$ with $\rho = 1025\ \text{kg/m}^3$ (ignore the 0.1 MPa of the atmosphere and the slight compression of the water above). Water at rest carries the isotropic stress $\sigma_{ij} = -p\,\delta_{ij}$. Find its trace $\sigma^i{}_i$, in MPa.`,
          visual: grid([['−p', '0', '0'], ['0', '−p', '0'], ['0', '0', '−p']], { rowNames: ['x', 'y', 'z'], colNames: ['x', 'y', 'z'], dx: 1.2, caption: t`The stress of still water: the same $-p$ on every face, in any axes.` }),
          answer: -3 * p, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: -p, feedback: t`That is one diagonal component. The trace adds all three: $\delta^i{}_i = 3$.` }, { value: 3 * p, feedback: 'Pressure squeezes: compressive stress is negative in the sign convention used here.' }],
          hints: [t`$p = \rho gh = 1025\times9.81\times${h}$ Pa.`, t`$\sigma^i{}_i = -p\,\delta^i{}_i = -3p$.`],
          teach: 'The trace of the stress tensor is minus three times the pressure — a scalar, which is why pressure needs no direction.',
          explain: t`$p = ${nice(p, 4)}$ MPa, so $\sigma^i{}_i = ${nice(-3 * p, 4)}$ MPa. The trace is what squeezes volume: with water’s bulk modulus of about 2.2 GPa, $\Delta V/V = -p/K \approx ${nice((-p / 2200) * 100, 2)}\%$.`,
        };
      },
    }),
    mcq({
      id: 'cp-pure-E', difficulty: 2,
      prompt: t`Between the plates of a charged capacitor there is a pure electric field: $B = 0$ in the lab. Can any moving observer see a pure magnetic field there?`,
      visual: boostPic(2, 0, { caption: t`$E'/c$ (gold) and $B'$ (blue) seen by observers moving at $\beta c$ across a pure electric field of $E/c = 2$ mT; the green dashed line is the invariant.` }),
      choices: [
        t`No: $F_{\mu\nu}F^{\mu\nu} = -2E^2/c^2 < 0$ in every frame, but a pure magnetic field would make it positive`,
        'Yes, an observer moving fast enough sees only a magnetic field',
        'Yes, but only an observer moving at the speed of light',
        'No, because moving observers always measure the same fields',
      ],
      answer: 0,
      why: {
        1: t`Moving observers do see a magnetic field appear, but $E'$ never reaches zero: $E'^2/c^2 - B'^2$ stays equal to $E^2/c^2$.`,
        2: 'No observer moves at c, and even the limit keeps the invariant negative.',
        3: 'They measure different fields — a magnetic one appears — but the invariant is shared.',
      },
      hints: [t`Compute the invariant in the lab, then ask what sign a pure magnetic field would give it.`],
      teach: 'The sign of an invariant is a fact every observer agrees on; it decides which field can be transformed away.',
      explain: t`In the lab the invariant is $-2E^2/c^2 < 0$; a pure magnetic field would give $+2B'^2 > 0$. Moving observers see $B' = \gamma vE/c^2 \ne 0$ but always $E' > cB'$.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (the electromagnetic field tensor and its invariants)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §12.3 (relativistic electrodynamics; problem on the field invariants)', url: 'https://www.cambridge.org/9781108420419' },
  ],
});
