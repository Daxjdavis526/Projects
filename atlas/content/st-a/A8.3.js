// The covariant derivative: differentiate the whole field V = V^ν ∂_ν, basis
// and all, and collect the result in the basis. ∇_μV^ν = ∂_μV^ν + Γ^ν_μλ V^λ;
// one −Γ per lower index, one +Γ per upper; a scalar gets none. Worked on the
// field of a straight current, checked against Cartesian components.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, plane, polarGrid, fieldArrows, basisAt, polarToCart, DEG } from './_tcalc.js';

const t = String.raw;

// a field (Cartesian components f) on a polar grid, with a marked point and optional arrows at it
function fieldPic(f, P, caption, { R = 4, arrows = [], cap, skip0 = 0.5 } = {}) {
  return plane({
    x: [-R, R], y: [r6(-0.62 * R), r6(0.62 * R)],
    curves: polarGrid(R + 1),
    arrows: [...fieldArrows(f, { x: [-R, R], y: [-0.62 * R, 0.62 * R], maxLen: 0.7, cap, skip: (x, y) => Math.hypot(x, y) < skip0 || (P && Math.hypot(x - P[0], y - P[1]) < 0.7) }), ...(P ? basisAt(P, { k: 0.3 }) : []), ...arrows],
    points: [{ x: 0, y: 0, r: 3, color: 'ink3' }, ...(P ? [{ x: r6(P[0]), y: r6(P[1]), r: 4, color: 'gold', label: 'P', labelDx: -16, labelDy: 12 }] : [])],
    caption,
  });
}
const wire = (x, y) => [-y / (x * x + y * y), x / (x * x + y * y)];

// the Explore: naive derivative, Γ correction and covariant derivative as arrows at P
const S = (k, key = 'f') => `step(0.5 - abs(${key} - ${k}))`;
const R = 'sqrt(px^2 + py^2)', T = 'atan2(py, px)', A = '(pi/6)';
// polar components and their derivatives, field by field: [Vr, Vt, dr Vr, dr Vt, dθ Vr, dθ Vt]
const F = {
  1: [`cos(${T} - ${A})`, `(-sin(${T} - ${A})/${R})`, '0', `(sin(${T} - ${A})/${R}^2)`, `(-sin(${T} - ${A}))`, `(-cos(${T} - ${A})/${R})`],
  2: ['0', `(1/${R}^2)`, '0', `(-2/${R}^3)`, '0', '0'],
  3: [`(1/${R})`, '0', `(-1/${R}^2)`, '0', '0', '0'],
};
const sum = (i) => [1, 2, 3].map((k) => `${S(k)}*${F[k][i]}`).join(' + ');
const [VR, VT, DRR, DRT, DTR, DTT] = [0, 1, 2, 3, 4, 5].map(sum);
const MR = S(1, 'm'), MT = S(2, 'm');
const NA = `(${MR}*(${DRR}) + ${MT}*(${DTR}))`;                  // naive: ∂_μ V^r
const NB = `(${MR}*(${DRT}) + ${MT}*(${DTT}))`;                  // naive: ∂_μ V^θ
const CA = `(${MT}*(-${R}*(${VT})))`;                             // Γ^r_μλ V^λ
const CB = `(${MR}*(${VT})/${R} + ${MT}*(${VR})/${R})`;           // Γ^θ_μλ V^λ
const cx = (a, b) => `((${a})*px/${R} - (${b})*py)`, cy = (a, b) => `((${a})*py/${R} + (${b})*px)`;
const K = 2;
const grid = (k, f, o = {}) => fieldArrows(f, { x: [-4.4, 4.4], y: [-2.9, 2.9], maxLen: 0.6, skip: (x, y) => Math.hypot(x, y) < 0.5, ...o }).map((a) => ({ ...a, when: S(k) }));
const explore = {
  type: 'graph',
  title: 'The partial derivative, the correction and their sum',
  lead: t`Three vector fields on the flat plane, described in polar coordinates. At the point P, the red dashed arrow is the naive derivative $(\partial_\mu V^\nu)\,\partial_\nu$; the violet arrow, drawn from its tip, is the correction $\Gamma^\nu{}_{\mu\lambda}V^\lambda\,\partial_\nu$ from the turning grid; the gold arrow is their sum, $\nabla_\mu V$ — how the field really changes as you move along $x^\mu$.`,
  tasks: [
    t`Uniform field, either direction: the red and violet arrows are equal and opposite and the gold one vanishes. The field does not change; $\nabla$ says so.`,
    t`Wire field, moving along $\theta$: every partial derivative is zero (no red arrow), yet the field turns as you go round — the gold arrow points to the centre. Only the correction sees it.`,
    t`Source field, moving along $r$: here the correction is zero and red equals gold. Along a ray the polar grid does not turn, so nothing needs correcting.`,
  ],
  params: {
    x: [-4.4, 4.4], y: [-2.9, 2.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
    choices: [
      { key: 'f', label: 'Field', options: [[1, 'Uniform (at 30°)'], [2, 'Wire (around, ∝ 1/r)'], [3, 'Source (out, ∝ 1/r)']], value: 2, explain: 'Uniform: the same arrow everywhere. Wire: the magnetic field of a straight current, (−y, x)/r². Source: the field of a line charge, (x, y)/r².' },
      { key: 'm', label: 'Move along', options: [[1, 'r (outward)'], [2, 'θ (around)']], value: 2, explain: 'The direction μ of the derivative.' },
    ],
    curves: polarGrid(5),
    arrows: [
      ...grid(1, () => [Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)]),
      ...grid(2, wire, { cap: 1.5 }),
      ...grid(3, (x, y) => [x / (x * x + y * y), y / (x * x + y * y)], { cap: 1.5 }),
      { from: ['px', 'py'], to: [`px + ${K}*${cx(NA, NB)}`, `py + ${K}*${cy(NA, NB)}`], color: 'bad', width: 2.2, dash: [6, 4], label: '∂' },
      { from: [`px + ${K}*${cx(NA, NB)}`, `py + ${K}*${cy(NA, NB)}`], to: [`px + ${K}*(${cx(NA, NB)} + ${cx(CA, CB)})`, `py + ${K}*(${cy(NA, NB)} + ${cy(CA, CB)})`], color: 'violet', width: 2.2, label: 'Γ' },
      { from: ['px', 'py'], to: [`px + ${K}*(${cx(NA, NB)} + ${cx(CA, CB)})`, `py + ${K}*(${cy(NA, NB)} + ${cy(CA, CB)})`], color: 'gold', width: 3, label: '∇' },
    ],
    drag: [{ key: 'p', x: 1.9, y: 1.1 }],
    points: [{ x: 0, y: 0, r: 3, color: 'ink2' }],
    readouts: [
      { label: t`$\partial_\mu V^r$`, expr: NA, digits: 3 },
      { label: t`$\partial_\mu V^\theta$`, expr: NB, digits: 3 },
      { label: t`$\nabla_\mu V^r$`, expr: `${NA} + ${CA}`, digits: 3 },
      { label: t`$\nabla_\mu V^\theta$`, expr: `${NB} + ${CB}`, digits: 3 },
    ],
  },
  caption: t`Grey: the field (arrows to scale with one another, capped near the origin). At P: red dashed, the naive derivative built from the partials of the polar components; violet, the Christoffel correction; gold, the covariant derivative, which equals the change of the field’s Cartesian arrow. All three drawn at twice their length. Drag P.`,
};

export default lesson({
  id: 'st-a.A8.3',
  title: 'The covariant derivative',
  minutes: 13, difficulty: 3,
  intro: t`Differentiate the whole field, basis vectors included. With $V = V^\lambda\partial_\lambda$ and $\partial_\mu(\partial_\lambda) = \Gamma^\nu{}_{\mu\lambda}\partial_\nu$ (lesson A8.2), the product rule gives $\partial_\mu V = \big(\partial_\mu V^\nu + \Gamma^\nu{}_{\mu\lambda}V^\lambda\big)\,\partial_\nu$. The bracket is the **covariant derivative**:

$$\nabla_\mu V^\nu = \partial_\mu V^\nu + \Gamma^\nu{}_{\mu\lambda}\,V^\lambda$$

It is a genuine $(1, 1)$ tensor: the extra term of lesson A8.1 is cancelled exactly by the way $\Gamma$ itself transforms. The rule extends to every tensor: **one $+\Gamma$ term for each upper index, one $-\Gamma$ term for each lower index**, and none for a scalar ($\nabla_\mu f = \partial_\mu f$). For a covector, $\nabla_\mu\omega_\nu = \partial_\mu\omega_\nu - \Gamma^\lambda{}_{\mu\nu}\,\omega_\lambda$; the minus sign is what keeps $\nabla_\mu(\omega_\nu V^\nu) = \partial_\mu(\omega_\nu V^\nu)$ for the scalar $\omega_\nu V^\nu$.`,
  symbols: [
    { tex: t`\nabla_\mu V^\nu`, text: t`the covariant derivative: the $\nu$-component of the rate of change of the field along $x^\mu$, counting the change of the basis too. A $(1, 1)$ tensor` },
    { tex: t`\partial_\mu V^\nu`, text: 'the naive part: the partial derivative of the components alone' },
    { tex: t`\Gamma^\nu{}_{\mu\lambda}V^\lambda`, text: t`the correction: how much the basis vectors, weighted by the components $V^\lambda$, change along $x^\mu$ — summed over $\lambda$` },
    { tex: t`\omega_\nu`, text: 'a covector field’s components (lower index): its correction comes with a minus sign' },
    { tex: t`\mu,\ \nu,\ \lambda`, text: t`coordinate indices; $\mu$ and $\nu$ are free, $\lambda$ is summed` },
  ],
  why: t`With $\nabla$ in place of $\partial$, any law written in Cartesian coordinates holds in every coordinate system — and, in general relativity, in curved spacetime: energy conservation becomes $\nabla_\mu T^{\mu\nu} = 0$ and Maxwell’s equations $\nabla_\mu F^{\mu\nu} = \mu_0J^\nu$ (step gr.S10.d builds ∇ on the Road).`,
  visual: explore,
  example: {
    prompt: t`A long straight wire carries current $I$ along the $z$ axis. Around it, $\mathbf B = \dfrac{\mu_0I}{2\pi r}\,\hat\theta$, so its coordinate components are $B^r = 0$ and $B^\theta = k/r^2$, with $k = \mu_0I/2\pi$ (recall $\hat\theta = \partial_\theta/r$). Find all four components of $\nabla_\mu B^\nu$, and check one against Cartesian coordinates.`,
    visual: fieldPic(wire, [1.8, 1.2], t`The field of the wire (seen end-on at the origin) on a polar grid, arrows to scale with one another and capped near the wire; the polar basis at P ($\partial_\theta$ at 0.3 of its length).`, { cap: 1.5 }),
    steps: [
      { label: 'Partials', text: t`$\partial_rB^r = 0$, $\partial_\theta B^r = 0$, $\partial_\theta B^\theta = 0$, $\partial_rB^\theta = -2k/r^3$. Only one is non-zero.` },
      { label: 'Corrections', text: t`With $\Gamma^r{}_{\theta\theta} = -r$ and $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$: $\Gamma^r{}_{r\lambda}B^\lambda = 0$; $\Gamma^\theta{}_{r\lambda}B^\lambda = \tfrac1r\cdot\tfrac{k}{r^2} = k/r^3$; $\Gamma^r{}_{\theta\lambda}B^\lambda = -r\cdot\tfrac{k}{r^2} = -k/r$; $\Gamma^\theta{}_{\theta\lambda}B^\lambda = \tfrac1r B^r = 0$.` },
      { label: 'Add them', text: t`$\nabla_rB^r = 0$, $\;\nabla_rB^\theta = -2k/r^3 + k/r^3 = -k/r^3$, $\;\nabla_\theta B^r = -k/r$, $\;\nabla_\theta B^\theta = 0$.` },
      { label: 'Read them', text: t`Going round ($\mu = \theta$), the field keeps its size but turns: $\nabla_\theta B = -\tfrac{k}{r}\partial_r$, pointing at the wire. Going out ($\mu = r$), it weakens: $\nabla_rB = -\tfrac{k}{r^3}\partial_\theta$, opposite to $B$. The divergence, $\nabla_\mu B^\mu = 0 + 0$, is zero: no magnetic charge.` },
      { label: 'Check in Cartesian', text: t`$B^x = -ky/r^2$, $B^y = kx/r^2$. At the point $(x, y) = (r, 0)$, moving round is moving along $y$, at $\partial y/\partial\theta = r$ per radian. There $\partial_yB^x = -k/r^2$ and $\partial_yB^y = 0$, so per radian $\mathbf B$ changes by $r\,\partial_y\mathbf B = (-k/r,\ 0)$: a radial part $-k/r$ ✓ and no part along $\hat\theta$, so $\nabla_\theta B^\theta = 0$ ✓.` },
    ],
    answer: t`$\nabla_rB^r = 0$, $\nabla_rB^\theta = -k/r^3$, $\nabla_\theta B^r = -k/r$, $\nabla_\theta B^\theta = 0$ (with $k = \mu_0I/2\pi$); the partials alone would have missed the turning entirely.`,
  },
  practice: [
    num({
      id: 'nabla-theta-r', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([0.5, 2, 3]), R = r.pick([1.5, 2, 4]);
        const ans = -R * b;
        return {
          prompt: t`A field has polar components $V^r = ${a}r$ and $V^\theta = ${b}$. Find $\nabla_\theta V^r = \partial_\theta V^r + \Gamma^r{}_{\theta\lambda}V^\lambda$ at $r = ${R}$.`,
          visual: fieldPic((x, y) => polarToCart([x, y], a * Math.hypot(x, y), b), [R * 0.8, R * 0.6].map((v) => v * Math.min(1, 2.4 / R)), t`The field on a polar grid: a spiral, outward and around (arrows to scale with one another). P is schematic.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`$\partial_\theta V^r = 0$, but the correction is not: $\Gamma^r{}_{\theta\theta}V^\theta = -r\,V^\theta$.` }, { value: -ans, feedback: t`$\Gamma^r{}_{\theta\theta} = -r$, with a minus sign.` }],
          hints: [t`Only $\lambda = \theta$ contributes: $\Gamma^r{}_{\theta r} = 0$ and $\Gamma^r{}_{\theta\theta} = -r$.`],
          teach: t`$\nabla_\theta V^r = \partial_\theta V^r - rV^\theta$: going round, the around-part of a field turns inward.`,
          explain: t`$\nabla_\theta V^r = 0 + (-r)(${b}) = ${nice(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'nabla-r-theta', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3]), n = r.pick([1, 2, -2, -3]), R = r.pick([2, 3]);
        const ans = c * (n + 1) * R ** (n - 1), naive = c * n * R ** (n - 1);
        return {
          prompt: t`A field has $V^r = 0$ and $V^\theta = ${c}\,r^{${n}}$. Find $\nabla_r V^\theta$ at $r = ${R}$.`,
          visual: fieldPic((x, y) => polarToCart([x, y], 0, c * Math.hypot(x, y) ** n), [1.9, 1.1], t`The field on a polar grid (arrows to scale with one another, capped near the origin). P is schematic.`, { cap: 2 }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: naive, feedback: t`That is $\partial_rV^\theta$ alone. Add $\Gamma^\theta{}_{r\theta}V^\theta = V^\theta/r$.` }],
          hints: [t`$\nabla_rV^\theta = \partial_rV^\theta + \Gamma^\theta{}_{r\theta}V^\theta$ with $\Gamma^\theta{}_{r\theta} = 1/r$.`, t`$\partial_r(${c}r^{${n}}) = ${c * n}r^{${n - 1}}$.`],
          teach: t`$\nabla_rV^\theta = \partial_rV^\theta + V^\theta/r$: the correction accounts for $\partial_\theta$ growing outward.`,
          explain: t`$\nabla_rV^\theta = ${c * n}r^{${n - 1}} + ${c}r^{${n - 1}} = ${c * (n + 1)}r^{${n - 1}} = ${nice(ans, 4)}$ at $r = ${R}$.`,
        };
      },
    }),
    num({
      id: 'nabla-theta-theta', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2]), R = r.pick([2, 4]), th = r.pick([30, 60, 120]);
        const ans = b * Math.cos(th * DEG) + (a * Math.cos(th * DEG)) / R;
        return {
          prompt: t`A field has $V^r = ${a}\cos\theta$ and $V^\theta = ${b}\sin\theta$. Find $\nabla_\theta V^\theta$ at $(r, \theta) = (${R}, ${th}^\circ)$.`,
          visual: fieldPic((x, y) => { const q = Math.atan2(y, x); return polarToCart([x, y], a * Math.cos(q), b * Math.sin(q)); }, [R * Math.cos(th * DEG) * 0.6, R * Math.sin(th * DEG) * 0.6], t`The field on a polar grid (arrows to scale with one another). P marks the direction $\theta = ${th}^\circ$; schematic distance.`, { cap: 3 }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: b * Math.cos(th * DEG), feedback: t`That is $\partial_\theta V^\theta$ alone. Add $\Gamma^\theta{}_{\theta r}V^r = V^r/r$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\nabla_\theta V^\theta = \partial_\theta V^\theta + \Gamma^\theta{}_{\theta r}V^r$, and $\Gamma^\theta{}_{\theta r} = 1/r$.`, t`$\partial_\theta(${b}\sin\theta) = ${b}\cos\theta$.`],
          teach: t`Each component of $\nabla_\mu V^\nu$ sums the naive derivative and every $\Gamma^\nu{}_{\mu\lambda}V^\lambda$ that is not zero.`,
          explain: t`$\nabla_\theta V^\theta = ${b}\cos${th}^\circ + \dfrac{${a}\cos${th}^\circ}{${R}} = ${nice(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'rule', difficulty: 2,
      prompt: t`What is the covariant derivative of a type $(1, 1)$ tensor field $T^\nu{}_\rho$?`,
      visual: fieldPic(wire, [2, 1], t`Every index of a tensor refers to the basis at its point, and that basis changes from point to point: each index needs its own correction.`, { cap: 1.5 }),
      choices: [
        t`$\nabla_\mu T^\nu{}_\rho = \partial_\mu T^\nu{}_\rho + \Gamma^\nu{}_{\mu\lambda}T^\lambda{}_\rho - \Gamma^\lambda{}_{\mu\rho}T^\nu{}_\lambda$`,
        t`$\nabla_\mu T^\nu{}_\rho = \partial_\mu T^\nu{}_\rho + \Gamma^\nu{}_{\mu\lambda}T^\lambda{}_\rho + \Gamma^\lambda{}_{\mu\rho}T^\nu{}_\lambda$`,
        t`$\nabla_\mu T^\nu{}_\rho = \partial_\mu T^\nu{}_\rho + \Gamma^\nu{}_{\mu\lambda}T^\lambda{}_\rho$`,
        t`$\nabla_\mu T^\nu{}_\rho = \partial_\mu T^\nu{}_\rho - \Gamma^\nu{}_{\mu\rho}T^\lambda{}_\lambda$`,
      ],
      answer: 0,
      why: {
        1: t`A lower index takes $-\Gamma$: otherwise contracting $T^\nu{}_\nu$ (a scalar) would not give $\partial_\mu$ of the trace.`,
        2: 'The lower index ρ needs its own correction too.',
        3: t`That corrects with the trace $T^\lambda{}_\lambda$ alone. Each index of $T$ needs its own correction, with the other index left in place.`,
      },
      hints: ['One correction per index: + for upper, − for lower, and in each the summed λ replaces that index.'],
      teach: t`$\nabla$ adds $+\Gamma$ for each upper index and $-\Gamma$ for each lower index.`,
      explain: t`Upper $\nu$: $+\Gamma^\nu{}_{\mu\lambda}T^\lambda{}_\rho$. Lower $\rho$: $-\Gamma^\lambda{}_{\mu\rho}T^\nu{}_\lambda$. Contract $\nu$ with $\rho$ and the two corrections cancel, so $\nabla_\mu T^\nu{}_\nu = \partial_\mu T^\nu{}_\nu$ — right for a scalar.`,
    }),
    num({
      id: 'covector', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, -1, -2]), R = r.pick([2, 3]);
        const ans = (k - 1) * R ** (k - 1);
        return {
          prompt: t`The covector field $\omega = r^{${k}}\,d\theta$ has components $\omega_r = 0$, $\omega_\theta = r^{${k}}$. Find $\nabla_r\omega_\theta = \partial_r\omega_\theta - \Gamma^\lambda{}_{r\theta}\,\omega_\lambda$ at $r = ${R}$.`,
          visual: fieldPic((x, y) => polarToCart([x, y], 0, Math.hypot(x, y) ** (k - 2)), [1.9, 1.1], t`The vector field obtained by raising $\omega$’s index ($V^\theta = r^{${k - 2}}$), on a polar grid (arrows capped near the origin). P is schematic.`, { cap: 2 }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: k * R ** (k - 1), feedback: t`That is $\partial_r\omega_\theta$ alone. Subtract $\Gamma^\theta{}_{r\theta}\omega_\theta = \omega_\theta/r$.` }, { value: (k + 1) * R ** (k - 1), feedback: t`For a lower index the correction is subtracted: $-\Gamma^\lambda{}_{r\theta}\omega_\lambda$.` }],
          hints: [t`Only $\lambda = \theta$ contributes, with $\Gamma^\theta{}_{r\theta} = 1/r$.`, t`$\nabla_r\omega_\theta = ${k}r^{${k - 1}} - r^{${k}}/r$.`],
          teach: t`A lower index gets $-\Gamma$: $\nabla_r\omega_\theta = \partial_r\omega_\theta - \omega_\theta/r$.`,
          explain: t`$\nabla_r\omega_\theta = ${k}r^{${k - 1}} - r^{${k - 1}} = ${k - 1}r^{${k - 1}} = ${nice(ans, 4)}$. For $k = 1$ it would vanish: $r\,d\theta$ is the covector of the unit vector $\hat\theta$, which does not change moving outward.`,
        };
      },
    }),
    mcq({
      id: 'zero-means', difficulty: 2,
      prompt: t`In polar coordinates on the flat plane, a vector field has $\nabla_\mu V^\nu = 0$ for all $\mu, \nu$ at every point, though its polar components vary. What is the field?`,
      visual: fieldPic(() => [0.8, -0.6], [2, 1], 'A candidate field on the polar grid.'),
      choices: [
        'A uniform field: the same arrow everywhere',
        t`Zero everywhere, since its derivatives vanish`,
        t`A field whose polar components are constant, such as $\partial_r$`,
        'Impossible: varying components always mean a non-zero derivative',
      ],
      answer: 0,
      why: {
        1: t`$\nabla V = 0$ says the field does not change; it can have any constant value.`,
        2: t`$\partial_r$ has $\nabla_\theta\partial_r = \tfrac1r\partial_\theta \ne 0$: it turns going round.`,
        3: 'Varying components can describe a constant field in a turning basis — lesson A8.1.',
      },
      hints: [t`$\nabla_\mu V^\nu$ is a tensor. What is it in Cartesian coordinates, where $\Gamma = 0$?`],
      teach: t`$\nabla_\mu V^\nu = 0$ is a coordinate-free statement: the field does not change from point to point.`,
      explain: t`In Cartesian coordinates $\nabla_\mu V^\nu = \partial_\mu V^\nu$, so all the Cartesian components are constant: a uniform field. Being a tensor, $\nabla V$ is then zero in polar coordinates too, even though $V^r$ and $V^\theta$ vary.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cable', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([500, 1200, 2000]), R = r.pick([0.5, 1, 2]);
        const mu0 = 4 * Math.PI * 1e-7, k = (mu0 * I) / (2 * Math.PI);
        const ans = -k / R;
        return {
          prompt: t`A launch-pad power cable carries ${I} A. Around it, in polar coordinates centred on the cable, $B^r = 0$ and $B^\theta = k/r^2$ with $k = \mu_0I/2\pi$. A magnetometer is carried round the cable at $r = ${R}$ m. Find $\nabla_\theta B^r$ there — how fast, per radian, the field gains a radial part as it turns — in tesla.`,
          visual: fieldPic(wire, [1.6, 1.3], t`The cable’s field, seen end-on (arrows to scale with one another, capped near the cable). Schematic distances.`, { cap: 1.5 }),
          answer: ans, units: 'T', tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: t`$\partial_\theta B^r = 0$, but the field turns as you go round: add $\Gamma^r{}_{\theta\theta}B^\theta = -rB^\theta$.` }, { value: -k / (R * R * R), feedback: t`$\Gamma^r{}_{\theta\theta} = -r$ multiplies $B^\theta = k/r^2$: the result is $-k/r$.` }].filter((e) => Math.abs(e.value - ans) > 1e-3 * Math.abs(ans)),
          hints: [t`$\nabla_\theta B^r = \partial_\theta B^r + \Gamma^r{}_{\theta\theta}B^\theta$.`, t`$k = 2\times10^{-7}\ \text{T m/A}\times${I}$ A.`],
          teach: t`The covariant derivative catches a field turning with the grid: $\nabla_\theta B^r = -rB^\theta$.`,
          explain: t`$\nabla_\theta B^r = -r\cdot\dfrac{k}{r^2} = -\dfrac{k}{r} = -\dfrac{${nice(k, 4)}}{${R}} = ${nice(ans, 4)}$ T per radian. Its size equals the field strength $\mu_0I/2\pi r$ itself: a field of fixed size turning through one radian changes by its own size, inward.`,
        };
      },
    }),
    mcq({
      id: 'cp-scalar', difficulty: 2,
      prompt: t`What is the covariant derivative of a scalar field $f$, such as temperature?`,
      visual: fieldPic((x, y) => [x / Math.hypot(x, y), y / Math.hypot(x, y)], [2, 1], 'The gradient of the scalar f = r: an arrow out from the origin everywhere.'),
      choices: [
        t`$\nabla_\mu f = \partial_\mu f$: a scalar has no index, so no correction`,
        t`$\nabla_\mu f = \partial_\mu f + \Gamma^\lambda{}_{\mu\lambda}f$`,
        t`$\nabla_\mu f = \partial_\mu f - \Gamma^\lambda{}_{\mu\lambda}f$`,
        'It is not defined: ∇ acts only on vectors',
      ],
      answer: 0,
      why: {
        1: t`There is no index to correct. That combination appears in the divergence (lesson A9.1), not here.`,
        2: 'There is no lower index on f to correct.',
        3: 'It acts on every tensor, scalars included.',
      },
      hints: ['Count the indices of f.'],
      teach: t`The Γ corrections come one per index; a scalar has none, so $\nabla_\mu f = \partial_\mu f$.`,
      explain: t`A scalar does not refer to any basis, so turning basis vectors cannot affect it: $\nabla_\mu f = \partial_\mu f$, already a covector.`,
    }),
    num({
      id: 'cp-source', difficulty: 2,
      gen(r) {
        const q = r.pick([2, 3, 5]), R = r.pick([2, 4]);
        const ans = q / (R * R);
        return {
          prompt: t`A line charge’s field has $E^r = ${q}/r$ and $E^\theta = 0$ (in some units). Find $\nabla_\theta E^\theta$ at $r = ${R}$.`,
          visual: fieldPic((x, y) => [x / (x * x + y * y), y / (x * x + y * y)], [1.9, 1.1], 'The field of a line charge on a polar grid (arrows capped near the charge).', { cap: 1.5 }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`$\partial_\theta E^\theta = 0$, but $\Gamma^\theta{}_{\theta r}E^r = E^r/r$ is not.` }],
          hints: [t`$\nabla_\theta E^\theta = \partial_\theta E^\theta + \Gamma^\theta{}_{\theta r}E^r$ with $\Gamma^\theta{}_{\theta r} = 1/r$.`],
          teach: t`Going round, an outward field spreads apart: $\nabla_\theta E^\theta = E^r/r$.`,
          explain: t`$\nabla_\theta E^\theta = 0 + \tfrac1r\cdot\tfrac{${q}}{r} = ${q}/r^2 = ${nice(ans, 4)}$. Added to $\nabla_rE^r = -${q}/r^2$, the divergence $\nabla_\mu E^\mu$ is zero away from the charge — Gauss’s law, lesson A9.1.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 3 (covariant derivatives)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §5.3–5.4', url: 'https://www.cambridge.org/9780521887052' },
  ],
});
