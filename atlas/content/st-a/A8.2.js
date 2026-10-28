// Christoffel symbols in flat polar coordinates: the components of the
// derivative of each basis vector along each coordinate,
// ∂_μ(∂_ν) = Γ^λ_μν ∂_λ, read off with the dual basis: Γ^λ_μν = dx^λ(∂_μ ∂_ν).
// Γ^r_θθ = −r and Γ^θ_rθ = Γ^θ_θr = 1/r; the other five vanish.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, plane, polarGrid, basisAt, DEG } from './_tcalc.js';

const t = String.raw;

// the polar basis at n points round the circle of radius R, one of them marked
function ringPic(R, th, caption, { n = 8, k = 0.3 } = {}) {
  const S = Math.max(3, R + 1.6);
  return plane({
    x: [r6(-S * 1.6), r6(S * 1.6)], y: [-S, S],
    curves: polarGrid(Math.ceil(S * 1.8), { step: S > 6 ? 2 : 1 }),
    arrows: Array.from({ length: n }, (_, j) => basisAt([R * Math.cos((th + (360 / n) * j) * DEG), R * Math.sin((th + (360 / n) * j) * DEG)], { k, labels: j === 0 })).flat(),
    points: [{ x: r6(R * Math.cos(th * DEG)), y: r6(R * Math.sin(th * DEG)), r: 4, color: 'gold', label: 'P', labelDx: -16, labelDy: 12 }, { x: 0, y: 0, r: 3, color: 'ink3' }],
    caption,
  });
}

// the Explore: (∂_ν at Q − ∂_ν at P)/h, with Q a step h along x^μ, converging to Γ^λ_μν ∂_λ
const S = (k) => `step(0.5 - abs(f - ${k}))`;
const TH = '(th*pi/180)', TQ = '(th*pi/180 + h)';
const c = `cos${TH}`, s = `sin${TH}`;
// Cartesian components of the difference quotient D for each case
const DX = `${S(1)}*(-rr*sin${TQ} + rr*${s})/h + ${S(2)}*(-${s}) + ${S(3)}*(cos${TQ} - ${c})/h`;
const DY = `${S(1)}*(rr*cos${TQ} - rr*${c})/h + ${S(2)}*(${c}) + ${S(3)}*(sin${TQ} - ${s})/h`;
const PX = `rr*${c}`, PY = `rr*${s}`;
// Q: a step h along θ (cases 1, 3, 4 when μ = θ) or along r (case 2 and 4)
const QX = `(${S(1)} + ${S(3)})*rr*cos${TQ} + (${S(2)} + ${S(4)})*(rr + h)*${c}`;
const QY = `(${S(1)} + ${S(3)})*rr*sin${TQ} + (${S(2)} + ${S(4)})*(rr + h)*${s}`;
// the basis vector ∂_ν (half length) at P and at Q: ν = θ in cases 1, 2; ν = r in cases 3, 4
const EPX = `0.5*((${S(1)} + ${S(2)})*(-rr*${s}) + (${S(3)} + ${S(4)})*${c})`;
const EPY = `0.5*((${S(1)} + ${S(2)})*(rr*${c}) + (${S(3)} + ${S(4)})*${s})`;
const EQX = `0.5*(${S(1)}*(-rr*sin${TQ}) + ${S(2)}*(-(rr + h)*${s}) + ${S(3)}*cos${TQ} + ${S(4)}*${c})`;
const EQY = `0.5*(${S(1)}*(rr*cos${TQ}) + ${S(2)}*((rr + h)*${c}) + ${S(3)}*sin${TQ} + ${S(4)}*${s})`;
const explore = {
  type: 'graph',
  title: 'Measure how a basis vector changes',
  lead: t`Pick a basis vector $\partial_\nu$ and a direction $x^\mu$ to move in. The violet arrow is $\partial_\nu$ at P, the faint one is $\partial_\nu$ at Q, a step $h$ along $x^\mu$. The gold arrow at P is their difference divided by $h$. Its components along $\partial_r$ and $\partial_\theta$ at P are, in the limit $h \to 0$, the Christoffel symbols $\Gamma^r{}_{\mu\nu}$ and $\Gamma^\theta{}_{\mu\nu}$.`,
  tasks: [
    t`With $\partial_\theta$ moved along $\theta$, shrink $h$: the gold arrow points to the centre and its $\partial_r$ part settles on $-r$. Change $r$ and watch it follow: $\Gamma^r{}_{\theta\theta} = -r$.`,
    t`Compare “$\partial_\theta$ moved along $r$” with “$\partial_r$ moved along $\theta$”: both give $1/r$ along $\partial_\theta$ — the symmetry $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r}$.`,
    t`Choose $\partial_r$ moved along $r$: nothing changes at all. Moving out along a ray, $\partial_r$ keeps its length and direction, so $\Gamma^\lambda{}_{rr} = 0$.`,
  ],
  params: {
    x: [-4.4, 4.4], y: [-2.9, 2.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
    choices: [{ key: 'f', label: 'Basis vector, and the direction you move', options: [[1, '∂θ, moved along θ'], [2, '∂θ, moved along r'], [3, '∂r, moved along θ'], [4, '∂r, moved along r']], value: 1, explain: 'μ is the direction you move in; ν names the basis vector being carried.' }],
    sliders: [
      { key: 'rr', label: '$r$ at P', min: 0.8, max: 2.6, step: 0.1, value: 2, explain: 'Distance of P from the origin.' },
      { key: 'th', label: t`$\theta$ at P`, min: -180, max: 180, step: 5, value: 30, unit: '^\\circ', explain: 'Polar angle of P.' },
      { key: 'h', label: 'step $h$', min: 0.02, max: 1, step: 0.02, value: 0.6, explain: 'How far Q is from P, in units of the coordinate you move along (radians for θ).' },
    ],
    curves: polarGrid(5),
    arrows: [
      { from: [PX, PY], to: [`${PX} + 0.5*${c}`, `${PY} + 0.5*${s}`], color: 'accent', width: 1.6, label: '½∂r' },
      { from: [QX, QY], to: [`${QX} + ${EQX}`, `${QY} + ${EQY}`], color: 'violet', width: 1.6, dash: [5, 4] },
      { from: [PX, PY], to: [`${PX} + ${EPX}`, `${PY} + ${EPY}`], color: 'violet', width: 2.4, label: '½∂ν' },
      { from: [PX, PY], to: [`${PX} + 0.5*(${DX})`, `${PY} + 0.5*(${DY})`], color: 'gold', width: 3, when: `1 - ${S(4)}` },
    ],
    points: [{ x: PX, y: PY, r: 4, color: 'ink', label: 'P', labelDx: -16, labelDy: 12 }, { x: QX, y: QY, r: 3.5, color: 'ink3', label: 'Q', labelDx: 6, labelDy: 12 }, { x: 0, y: 0, r: 3, color: 'ink3' }],
    readouts: [
      { label: t`$\partial_r$ part of the gold arrow`, expr: `${c}*(${DX}) + ${s}*(${DY})`, digits: 3 },
      { label: t`$\partial_\theta$ part`, expr: `(-${s}*(${DX}) + ${c}*(${DY}))/rr`, digits: 3 },
      { label: t`exact $\Gamma^r{}_{\mu\nu}$`, expr: `-${S(1)}*rr`, digits: 3 },
      { label: t`exact $\Gamma^\theta{}_{\mu\nu}$`, expr: `(${S(2)} + ${S(3)})/rr`, digits: 3 },
    ],
  },
  caption: t`A flat plane under a polar grid; every arrow is drawn at half its length. Violet: the chosen basis vector at P (solid) and at Q (dashed). Gold: their difference divided by the step $h$, drawn at P. Its two components (readouts) tend to the Christoffel symbols as $h \to 0$; at large $h$ they are only rough.`,
};

export default lesson({
  id: 'st-a.A8.2',
  title: 'Christoffel symbols in flat polar coordinates',
  minutes: 12, difficulty: 3,
  intro: t`The polar basis vectors change from point to point. The **Christoffel symbols** are the numbers that say how: differentiate the basis vector $\partial_\nu$ along the coordinate $x^\mu$, and write the result back in the basis,

$$\partial_\mu(\partial_\nu) = \Gamma^\lambda{}_{\mu\nu}\,\partial_\lambda$$

Because the dual covector $dx^\lambda$ picks out the $\partial_\lambda$ component, $\Gamma^\lambda{}_{\mu\nu} = dx^\lambda(\partial_\mu\partial_\nu)$. On the flat plane in polar coordinates only three of the eight are non-zero: $\Gamma^r{}_{\theta\theta} = -r$ (going round, $\partial_\theta$ swings toward the centre) and $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$ (going out, $\partial_\theta$ grows in proportion to $r$; going round, $\partial_r$ turns toward $\partial_\theta$). In Cartesian coordinates every one is zero. So $\Gamma$ is a property of the **coordinates**, not of the plane.`,
  symbols: [
    { tex: t`\Gamma^\lambda{}_{\mu\nu}`, text: t`the Christoffel symbol: the $\lambda$-component of the rate of change of $\partial_\nu$ along $x^\mu$. Units: those of $x^\lambda$ divided by those of $x^\mu$ and $x^\nu$ — $\Gamma^r{}_{\theta\theta}$ is in metres (per radian squared), $\Gamma^\theta{}_{r\theta}$ in 1/m` },
    { tex: t`\partial_\mu(\partial_\nu)`, text: t`the derivative of the basis vector $\partial_\nu$ along $x^\mu$ — on a flat plane, differentiate its Cartesian components` },
    { tex: t`\partial_\lambda`, text: t`the coordinate basis vectors at the point ($\partial_r$, $\partial_\theta$)` },
    { tex: t`dx^\lambda`, text: t`the dual basis covectors ($dr$, $d\theta$), with $dx^\lambda(\partial_\nu) = \delta^\lambda{}_\nu$` },
    { tex: t`\lambda,\ \mu,\ \nu`, text: t`indices over the coordinates $r, \theta$: $2\times2\times2 = 8$ symbols in all` },
  ],
  why: t`The Christoffel symbols are the bridge between geometry and motion: in general relativity they are the “gravitational field” terms of the geodesic equation, built from the metric in step gr.S11.d and taken apart in the dissection gr.EQ.3.`,
  visual: explore,
  example: {
    prompt: t`Compute all eight Christoffel symbols of polar coordinates from $\Gamma^\lambda{}_{\mu\nu} = dx^\lambda(\partial_\mu\partial_\nu)$, and check one at the point $(r, \theta) = (2, 30^\circ)$ with numbers.`,
    visual: ringPic(2, 30, t`The polar basis round the circle $r = 2$: $\partial_r$ (blue) and $0.3\,\partial_\theta$ (violet). Going round, both turn; going out, $\partial_\theta$ lengthens.`),
    steps: [
      { label: 'The basis and its dual', text: t`$\partial_r = (\cos\theta, \sin\theta)$, $\partial_\theta = (-r\sin\theta, r\cos\theta)$; $dr = (\cos\theta, \sin\theta)$ and $d\theta = (-\sin\theta, \cos\theta)/r$ as rows (lesson A4.3).` },
      { label: 'Differentiate the basis', text: t`$\partial_r\partial_r = (0, 0)$; $\partial_r\partial_\theta = (-\sin\theta, \cos\theta)$; $\partial_\theta\partial_r = (-\sin\theta, \cos\theta)$; $\partial_\theta\partial_\theta = (-r\cos\theta, -r\sin\theta)$. The middle two agree: mixed partial derivatives of the position commute.` },
      { label: 'Apply dr', text: t`$dr$ of each: $0$; $-\cos\theta\sin\theta + \sin\theta\cos\theta = 0$; $0$; $-r\cos^2\theta - r\sin^2\theta = -r$. So $\Gamma^r{}_{\theta\theta} = -r$ and the other three $\Gamma^r$ are zero.` },
      { label: 'Apply dθ', text: t`$d\theta$ of each: $0$; $(\sin^2\theta + \cos^2\theta)/r = 1/r$; $1/r$; $(r\sin\theta\cos\theta - r\sin\theta\cos\theta)/r = 0$. So $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$, the other two zero.` },
      { label: 'Check with numbers', text: t`At $(2, 30^\circ)$: $\partial_\theta\partial_\theta = (-2\cos30^\circ, -2\sin30^\circ) = (-1.732, -1)$, and $-r\,\partial_r = -2(0.866, 0.5) = (-1.732, -1)$ ✓. It points straight at the origin.` },
      { label: 'Sense check', text: t`Units: $\Gamma^r{}_{\theta\theta}$ turns radians² into metres, so it carries a length; $\Gamma^\theta{}_{r\theta}$ turns metres × radians into radians, so it is per metre. And at large $r$, $\Gamma^\theta{}_{r\theta} \to 0$: far out, the polar grid looks almost Cartesian over a small patch.` },
    ],
    answer: t`$\Gamma^r{}_{\theta\theta} = -r$, $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$; $\Gamma^r{}_{rr} = \Gamma^r{}_{r\theta} = \Gamma^r{}_{\theta r} = \Gamma^\theta{}_{rr} = \Gamma^\theta{}_{\theta\theta} = 0$.`,
  },
  practice: [
    num({
      id: 'gamma-rtt', difficulty: 1,
      gen(r) {
        const R = r.pick([0.5, 1.5, 2.5, 3.2, 4]), th = r.pick([20, 70, 135, 250]);
        return {
          prompt: t`What is $\Gamma^r{}_{\theta\theta}$ at the point $(r, \theta) = (${R}\ \text{m}, ${th}^\circ)$ of the plane, in metres?`,
          visual: ringPic(Math.min(R, 3), th, t`The polar basis round P’s circle (schematic size).`),
          answer: -R, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: -1 / R, feedback: t`That is (minus) $\Gamma^\theta{}_{r\theta}$’s value. $\Gamma^r{}_{\theta\theta}$ is the inward part of $\partial_\theta\partial_\theta = -r\,\partial_r$.` }].filter((e) => Math.abs(e.value + R) > 0.01),
          hints: [t`$\partial_\theta\partial_\theta = -r\,\partial_r$: read off the $\partial_r$ component.`],
          teach: t`$\Gamma^r{}_{\theta\theta} = -r$: going round, $\partial_\theta$ turns toward the centre at a rate proportional to its length.`,
          explain: t`$\Gamma^r{}_{\theta\theta} = -r = -${R}$ m, whatever $\theta$ is: the polar grid looks the same at every angle.`,
        };
      },
    }),
    num({
      id: 'gamma-trt', difficulty: 1,
      gen(r) {
        const R = r.pick([0.4, 2, 2.5, 5, 8]);
        const which = r.pick([t`\Gamma^\theta{}_{r\theta}`, t`\Gamma^\theta{}_{\theta r}`]);
        return {
          prompt: t`What is $${which}$ at a point with $r = ${R}$ m, in $\text{m}^{-1}$?`,
          visual: ringPic(Math.min(R, 3), 40, t`The polar basis round P’s circle (schematic size): going out from one circle to the next, $\partial_\theta$ lengthens.`),
          answer: 1 / R, units: 'm^-1', tol: { rel: 0.005 },
          errors: [{ value: R, feedback: t`Invert: $\partial_r\partial_\theta = \tfrac1r\,\partial_\theta$ — the fractional growth of $\partial_\theta$ per metre outward.` }].filter((e) => Math.abs(e.value - 1 / R) > 0.01),
          hints: [t`$\partial_r\partial_\theta = (-\sin\theta, \cos\theta) = \tfrac1r\,\partial_\theta$.`],
          teach: t`$\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$: the lower indices are symmetric.`,
          explain: t`$${which} = 1/r = ${nice(1 / R, 4)}\ \text{m}^{-1}$. Both orders agree: moving out stretches $\partial_\theta$ by $1/r$ per metre, and moving round turns $\partial_r$ toward $\partial_\theta$ at the matching rate.`,
        };
      },
    }),
    mcq({
      id: 'meaning', difficulty: 2,
      prompt: t`What does $\Gamma^r{}_{\theta\theta} = -r$ say about the polar grid?`,
      visual: ringPic(2.2, 15, t`The polar basis round a circle: the violet $\partial_\theta$ arrows swing inward as you go round.`, { n: 12 }),
      choices: [
        t`Moving round the circle, $\partial_\theta$ changes by $-r\,\partial_r$ per radian: it swings toward the centre`,
        t`Moving outward, $\partial_\theta$ shrinks by $r$ per metre`,
        t`The radial basis vector $\partial_r$ has length $-r$`,
        'The plane is curved, with curvature −r',
      ],
      answer: 0,
      why: {
        1: t`Outward, $\partial_\theta$ grows, and that is $\Gamma^\theta{}_{r\theta} = 1/r$.`,
        2: t`$\partial_r$ always has length 1; $\Gamma$ describes changes, not lengths.`,
        3: 'The plane is flat; non-zero Γ come from the curved coordinates. Curvature needs derivatives of Γ (gr.EQ.4).',
      },
      hints: [t`Read the indices: $\Gamma^r{}_{\theta\theta}$ is the $r$-component of the change of $\partial_\theta$ along $\theta$.`],
      teach: t`$\Gamma^\lambda{}_{\mu\nu}$ is the $\lambda$-component of how $\partial_\nu$ changes along $x^\mu$.`,
      explain: t`$\partial_\theta\partial_\theta = -r\,\partial_r$: a step round the circle turns the tangent arrow $\partial_\theta$ inward — the same geometry that makes circular motion need a centripetal acceleration.`,
    }),
    num({
      id: 'degrees', difficulty: 3,
      gen(r) {
        const R = r.pick([500, 1000, 2000, 5000]);
        const k = Math.PI / 180, ans = -k * k * R;
        return {
          prompt: t`A surveyor uses polar coordinates with the angle in **degrees**, $\vartheta = (180/\pi)\,\theta$, so $x = r\cos(k\vartheta)$ and $y = r\sin(k\vartheta)$ with $k = \pi/180$. Find $\Gamma^r{}_{\vartheta\vartheta}$ at $r = ${R}$ m, in metres.`,
          visual: ringPic(2.4, 30, 'The same polar grid; only the labelling of the angle changes.'),
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: -R, feedback: t`That is $\Gamma^r{}_{\theta\theta}$ for $\theta$ in radians. Now $\partial_\vartheta = k\,\partial_\theta$, and two such factors appear.` }, { value: -k * R, feedback: t`Both lower indices are $\vartheta$: $\partial_\vartheta\partial_\vartheta = k^2\,\partial_\theta\partial_\theta$.` }],
          hints: [t`$\partial_\vartheta = \dfrac{\partial\theta}{\partial\vartheta}\partial_\theta = k\,\partial_\theta$.`, t`$\partial_\vartheta\partial_\vartheta = k^2\,\partial_\theta\partial_\theta = -k^2r\,\partial_r$.`],
          teach: 'Christoffel symbols belong to the coordinates: relabel the angle and they change, on the very same plane.',
          explain: t`$\Gamma^r{}_{\vartheta\vartheta} = -k^2r = -(\pi/180)^2(${R}) = ${nice(ans, 4)}$ m per degree². Same plane, same grid lines, different numbers — Γ is not a tensor.`,
        };
      },
    }),
    multi({
      id: 'which-nonzero', difficulty: 2,
      prompt: 'Which Christoffel symbols of polar coordinates on the flat plane are not zero? Select every one.',
      visual: ringPic(2, 50, t`The polar basis at eight points of a circle ($\partial_\theta$ at 0.3 of its length).`),
      choices: [t`$\Gamma^r{}_{\theta\theta}$`, t`$\Gamma^\theta{}_{r\theta}$`, t`$\Gamma^\theta{}_{\theta r}$`, t`$\Gamma^r{}_{rr}$`, t`$\Gamma^\theta{}_{\theta\theta}$`, t`$\Gamma^r{}_{r\theta}$`],
      answer: [0, 1, 2],
      why: {
        3: t`Moving out along a ray, $\partial_r$ does not change at all.`,
        4: t`$\partial_\theta\partial_\theta = -r\,\partial_r$ has no $\partial_\theta$ part: going round, $\partial_\theta$ turns but keeps its length.`,
        5: t`$\partial_\theta\partial_r = \tfrac1r\partial_\theta$ has no $\partial_r$ part: $\partial_r$ turns but does not lengthen.`,
      },
      hints: [t`Four derivatives to think about: $\partial_r\partial_r = 0$, $\partial_r\partial_\theta = \partial_\theta\partial_r = \tfrac1r\partial_\theta$, $\partial_\theta\partial_\theta = -r\,\partial_r$.`],
      teach: 'Three of the eight polar Christoffel symbols are non-zero; the lower pair is symmetric.',
      explain: t`Only $\Gamma^r{}_{\theta\theta} = -r$ and $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$ survive.`,
    }),
    mcq({
      id: 'symmetric', difficulty: 2, kind: 'error',
      prompt: t`A student argues: “$\Gamma^\theta{}_{r\theta}$ is how $\partial_\theta$ changes going out, and $\Gamma^\theta{}_{\theta r}$ is how $\partial_r$ changes going round. Those are different motions, so the two symbols need not be equal.” What is the flaw?`,
      visual: ringPic(2, 20, 'Going out stretches ∂θ; going round turns ∂r — by the same amount.'),
      choices: [
        t`Both are second derivatives of the position, $\partial_r\partial_\theta\mathbf x$ and $\partial_\theta\partial_r\mathbf x$, and mixed partial derivatives commute — so $\partial_r\partial_\theta = \partial_\theta\partial_r$`,
        'There is no flaw: they are equal only by coincidence in polar coordinates',
        t`The flaw is the claim about $\partial_\theta$: it does not change going out`,
        t`The symbols are equal because $\Gamma$ is a tensor`,
      ],
      answer: 0,
      why: {
        1: 'It holds for every coordinate basis, in every coordinate system: the symmetry is structural, not accidental.',
        2: t`$\partial_\theta$ does lengthen going out: its length is $r$.`,
        3: 'Γ is not a tensor; the symmetry comes from commuting derivatives.',
      },
      hints: [t`A coordinate basis vector is a partial derivative of the position: $\partial_\nu = \partial\mathbf x/\partial x^\nu$.`],
      teach: t`For a coordinate basis, $\Gamma^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\nu\mu}$, because $\partial_\mu\partial_\nu\mathbf x = \partial_\nu\partial_\mu\mathbf x$.`,
      explain: t`$\partial_r(\partial_\theta) = \dfrac{\partial^2\mathbf x}{\partial r\,\partial\theta} = \partial_\theta(\partial_r)$. The stretching of $\partial_\theta$ outward and the turning of $\partial_r$ round the circle are one fact seen two ways. General relativity keeps this symmetry (“no torsion”), lesson gr.S11.d.`,
    }),
    code({
      id: 'sympy-from-basis', difficulty: 3,
      prompt: t`Finish \`christoffel(X, q)\`: given the Cartesian coordinates \`X\` as SymPy expressions of the coordinates \`q\`, return the nested list \`G\` with \`G[l][m][n]\` $= \Gamma^l{}_{mn} = dx^l(\partial_m\partial_n)$. Column $n$ of the Jacobian $J = \partial X/\partial q$ is the basis vector $\partial_n$; row $l$ of $J^{-1}$ is the dual covector $dx^l$. The program applies it to polar and to spherical coordinates ($\theta$ from the $+z$ axis, $\phi$ around it).`,
      starter: t`import sympy as sp

def christoffel(X, q):
    n = len(q)
    J = sp.Matrix(X).jacobian(q)          # column k: the basis vector d_k
    Jinv = sp.simplify(J.inv())           # row l: the dual covector dx^l
    G = [[[0] * n for _ in range(n)] for _ in range(n)]
    # for each l, m, k: G[l][m][k] = sum over a of Jinv[l, a] * d/dq[m] of J[a, k], simplified
    return G

r, th, ph = sp.symbols('r theta phi', positive=True)
polar = christoffel([r * sp.cos(th), r * sp.sin(th)], [r, th])
sph = christoffel([r * sp.sin(th) * sp.cos(ph), r * sp.sin(th) * sp.sin(ph), r * sp.cos(th)], [r, th, ph])
print(polar)
`,
      answer: t`import sympy as sp

def christoffel(X, q):
    n = len(q)
    J = sp.Matrix(X).jacobian(q)          # column k: the basis vector d_k
    Jinv = sp.simplify(J.inv())           # row l: the dual covector dx^l
    G = [[[0] * n for _ in range(n)] for _ in range(n)]
    for l in range(n):
        for m in range(n):
            for k in range(n):
                G[l][m][k] = sp.simplify(sum(Jinv[l, a] * sp.diff(J[a, k], q[m]) for a in range(len(X))))
    return G

r, th, ph = sp.symbols('r theta phi', positive=True)
polar = christoffel([r * sp.cos(th), r * sp.sin(th)], [r, th])
sph = christoffel([r * sp.sin(th) * sp.cos(ph), r * sp.sin(th) * sp.sin(ph), r * sp.cos(th)], [r, th, ph])
print(polar)`,
      tests: [
        { name: t`polar: $\Gamma^r{}_{\theta\theta} = -r$`, code: 'sp.simplify(polar[0][1][1] + r) == 0' },
        { name: t`polar: $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$, and $\Gamma^r{}_{rr} = 0$`, code: 'sp.simplify(polar[1][0][1] - 1/r) == 0 and sp.simplify(polar[1][1][0] - 1/r) == 0 and polar[0][0][0] == 0' },
        { name: t`spherical: $\Gamma^r{}_{\phi\phi} = -r\sin^2\theta$`, code: 'sp.simplify(sph[0][2][2] + r*sp.sin(th)**2) == 0' },
        { name: t`spherical: $\Gamma^\phi{}_{\theta\phi} = \cot\theta$`, code: 'sp.simplify(sph[2][1][2] - sp.cos(th)/sp.sin(th)) == 0' },
      ],
      hints: [t`Three nested loops over \`l\`, \`m\`, \`k\`; inside, \`sum(Jinv[l, a] * sp.diff(J[a, k], q[m]) for a in range(len(X)))\`.`, t`\`sp.diff(J[a, k], q[m])\` is the $a$-th Cartesian component of $\partial_m\partial_k$; multiplying by row $l$ of $J^{-1}$ applies $dx^l$.`],
      teach: 'From the embedding alone — position as a function of the coordinates — the dual basis turns second derivatives into Christoffel symbols.',
      explain: t`$\Gamma^l{}_{mk} = (J^{-1})^l{}_a\,\partial_m J^a{}_k = \dfrac{\partial q^l}{\partial x^a}\dfrac{\partial^2x^a}{\partial q^m\partial q^k}$ — the transformation law from Cartesian coordinates, where every $\Gamma$ is zero. The same function gives spherical coordinates’ nine non-zero symbols, which lesson A9.1 uses. (gr.S11.d gets them from the metric instead, the route that works when no Cartesian coordinates exist.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-centrifuge', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([8.8, 7.6, 15]), rpm = r.pick([20, 30, 40]);
        const w = (rpm * 2 * Math.PI) / 60, ans = -R * w * w;
        return {
          prompt: t`An astronaut-training centrifuge spins its cab at radius $r = ${R}$ m and ${rpm} rpm, so in polar coordinates the cab has $\dot r = 0$ and $\dot\theta = \omega$. Its acceleration has radial component $a^r = \ddot r + \Gamma^r{}_{\theta\theta}\,\dot\theta^2$ (lesson A9.2 derives this). Find $a^r$, in m/s².`,
          visual: ringPic(2.2, 35, t`The cab’s circle: its velocity is $\omega\,\partial_\theta$, and $\partial_\theta$ swings inward as it goes round. Schematic.`),
          answer: ans, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [{ value: -R * rpm * rpm, feedback: t`Convert rpm to rad/s first: $\omega = 2\pi\times\text{rpm}/60$.` }, { value: -ans, feedback: t`$\Gamma^r{}_{\theta\theta} = -r$: the acceleration points inward.` }],
          hints: [t`$\omega = 2\pi(${rpm})/60 = ${nice(w, 4)}$ rad/s.`, t`$a^r = 0 + (-r)\,\omega^2$.`],
          teach: t`The centripetal acceleration $-r\omega^2$ is the Christoffel term $\Gamma^r{}_{\theta\theta}\dot\theta^2$ of polar coordinates.`,
          explain: t`$a^r = -r\omega^2 = -${R}\times${nice(w, 4)}^2 = ${nice(ans, 4)}$ m/s², about ${nice(-ans / 9.81, 3)} g pressing the trainee outward against the seat.`,
        };
      },
    }),
    num({
      id: 'cp-trt', difficulty: 2,
      gen(r) {
        const R = r.pick([0.25, 0.5, 4, 20]);
        return {
          prompt: t`Polar coordinates on a flat plane. At $r = ${R}$ m, by what fraction per metre does $\partial_\theta$ lengthen as you move outward — that is, what is $\Gamma^\theta{}_{r\theta}$, in $\text{m}^{-1}$?`,
          visual: ringPic(2, 60, 'The polar basis round a circle (schematic size).'),
          answer: 1 / R, units: 'm^-1', tol: { rel: 0.005 },
          hints: [t`$|\partial_\theta| = r$, so $\dfrac{1}{|\partial_\theta|}\dfrac{d|\partial_\theta|}{dr} = 1/r$.`],
          teach: t`$\Gamma^\theta{}_{r\theta} = 1/r$: the fractional growth of $\partial_\theta$ per unit $r$.`,
          explain: t`$\Gamma^\theta{}_{r\theta} = 1/r = ${nice(1 / R, 4)}\ \text{m}^{-1}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-cartesian', difficulty: 2,
      prompt: t`On the same flat plane, all Christoffel symbols of Cartesian coordinates are zero, while polar coordinates have three non-zero ones. Why?`,
      visual: plane({ x: [-4, 4], y: [-2.5, 2.5], curves: [...[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => ({ param: [`${k}`, 't'], t: [-3, 3], color: 'ink4', width: 1 })), ...[-2, -1, 0, 1, 2].map((k) => ({ param: ['t', `${k}`], t: [-5, 5], color: 'ink4', width: 1 }))], arrows: [[-2, 1], [1, -1], [2.5, 1.5]].flatMap(([x, y]) => [{ from: [x, y], to: [x + 0.8, y], color: 'accent', width: 2 }, { from: [x, y], to: [x, y + 0.8], color: 'violet', width: 2 }]), caption: t`The Cartesian basis $\partial_x$, $\partial_y$: the same pair of arrows at every point.` }),
      choices: [
        'The Cartesian basis vectors are the same at every point, so their derivatives vanish; the polar ones turn and stretch',
        'Polar coordinates describe a curved plane',
        'Cartesian coordinates have no metric',
        'Christoffel symbols are always zero for two-dimensional spaces',
      ],
      answer: 0,
      why: {
        1: 'It is the same flat plane; only the labels differ.',
        2: t`Cartesian coordinates have the metric $\delta_{ij}$ — constant, which is why their Γ vanish.`,
        3: 'Polar coordinates are two-dimensional and have non-zero Γ.',
      },
      hints: [t`$\Gamma^\lambda{}_{\mu\nu} = dx^\lambda(\partial_\mu\partial_\nu)$: what is $\partial_\mu\partial_\nu$ when the basis is constant?`],
      teach: 'Christoffel symbols measure how the coordinate basis changes; they depend on the coordinates, not only on the space.',
      explain: t`$\partial_x$ and $\partial_y$ never change, so every $\Gamma$ vanishes. Non-zero $\Gamma$ do not signal curvature — only a curving grid. (Curvature is what no choice of coordinates can remove: gr.EQ.4.)`,
    }),
  ],
  sources: [
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §5.3 (Christoffel symbols for polar coordinates)', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Carroll, Lecture Notes on GR, ch. 3 (the connection coefficients)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
