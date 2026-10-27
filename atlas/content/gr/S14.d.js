// The Riemann tensor — Derivation Mode. Defined by the failure of covariant
// derivatives to commute, [∇_μ, ∇_ν]V^ρ = R^ρ_σμν V^σ, equivalently by the
// turn of a vector carried round a small loop; worked in full for the 2-sphere
// (R^θ_φθφ = −cos 2θ + cos²θ = sin²θ, K = 1/a²). Practice: counting by
// symmetries, flat spaces with non-zero Γ (Rindler), the half-plane, small
// loops on a torus, geodesic deviation of meridians, Gauss's K = −f″/f and a
// SymPy Riemann function. Avoids gr.EQ.4's items (the sphere at an angle,
// components n²(n²−1)/12, tidal components, LIGO, Kretschmann).
// Every result verified with SymPy (scratch v14_15.py, riem_ex.py).
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { rnd, surfacePic, spherePic, halfPlane } from './_tensors.js';

const t = String.raw;
const DEG = Math.PI / 180;
const A_EARTH = 6371;                                            // km

// the 6 × 6 grid of antisymmetric index pairs (4D): symmetric under exchanging pairs, so 21 cells count
const PAIRS = ['01', '02', '03', '12', '13', '23'];
const pairGrid = (() => {
  const shade = [], points = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      const on = j >= i;
      shade.push({ fn: `${-i - 0.04}`, lower: `${-i - 0.96}`, from: j + 0.54, to: j + 1.46, color: on ? 'gold' : 'ink4', alpha: on ? 0.32 : 0.1 });
    }
    points.push({ x: 0.08, y: -i - 0.62, r: 0.01, color: 'ink3', label: PAIRS[i] });
    points.push({ x: i + 0.8, y: 0.12, r: 0.01, color: 'ink3', label: PAIRS[i] });
  }
  return {
    type: 'graph',
    params: { x: [0, 6.6], y: [-6.2, 0.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade, points },
    caption: t`In four dimensions: the antisymmetric pairs $[\rho\sigma]$ (down the side) and $[\mu\nu]$ (along the top) take 6 values each. Exchanging the pairs changes nothing, so only the gold cells — the diagonal and above — are independent.`,
  };
})();

// two meridians leaving the equator and meeting at the pole (separation exaggerated)
const meridians = spherePic([
  { param: ['cos(t)', '0', 'sin(t)'], t: [0, 1.5708], color: 'gold', width: 2.6 },
  { param: ['cos(t)*cos(0.35)', 'cos(t)*sin(0.35)', 'sin(t)'], t: [0, 1.5708], color: 'gold', width: 2.6 },
  { param: ['cos(t)', 'sin(t)', '0'], t: [-0.4, 0.75], color: 'ink3', width: 1.4 },
], 'Two meridians leaving the equator side by side, both heading due north: geodesics that start parallel and converge, with no force between them. Separation exaggerated. Drag to rotate.', { yaw: -0.25, pitch: 0.3, dist: 4 });

export default lesson({
  id: 'gr.S14.d',
  title: 'The Riemann tensor',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`Curvature is what no choice of coordinates can remove. There are two equivalent ways to catch it. Covariant derivatives **fail to commute**: $[\nabla_\mu, \nabla_\nu]V^\rho = R^\rho{}_{\sigma\mu\nu}V^\sigma$. And a vector carried around a **small loop** spanned by the directions $\mu$ and $\nu$ comes back changed by $R^\rho{}_{\sigma\mu\nu}V^\sigma$ times the loop's area. Working out the commutator with the Christoffel symbols gives the formula above — the **Riemann tensor**.

Its symmetries leave 20 independent numbers at each event of spacetime; it vanishes everywhere exactly when spacetime is flat; and through geodesic deviation it is the tides.`,
  equation: t`R^\rho{}_{\sigma\mu\nu} = \partial_\mu\Gamma^\rho{}_{\nu\sigma} - \partial_\nu\Gamma^\rho{}_{\mu\sigma} + \Gamma^\rho{}_{\mu\lambda}\Gamma^\lambda{}_{\nu\sigma} - \Gamma^\rho{}_{\nu\lambda}\Gamma^\lambda{}_{\mu\sigma}`,
  symbols: [
    { tex: 'R^\\rho{}_{\\sigma\\mu\\nu}', text: t`the Riemann curvature tensor, in m⁻²: $\sigma$ is the input (the vector carried), $\rho$ the output (its change), and $\mu\nu$ the plane of the loop — antisymmetric, so going round the other way reverses the change` },
    { tex: '\\partial_\\mu\\Gamma^\\rho{}_{\\nu\\sigma}', text: t`how the connection changes from place to place: second derivatives of the metric — the part no freely falling frame can remove` },
    { tex: '\\Gamma^\\rho{}_{\\mu\\lambda}\\Gamma^\\lambda{}_{\\nu\\sigma}', text: t`products of Christoffel symbols, with the dummy index $\lambda$ summed: they make the whole a tensor in any coordinates` },
    { tex: '[\\nabla_\\mu, \\nabla_\\nu]', text: t`the commutator $\nabla_\mu\nabla_\nu - \nabla_\nu\nabla_\mu$: differentiate along $\nu$ then $\mu$, minus the other order` },
    { tex: '\\rho,\\ \\sigma,\\ \\mu,\\ \\nu', text: t`free indices, each over $0$–$3$ in spacetime: $4^4 = 256$ labels, of which symmetries leave 20 independent` },
  ],
  why: t`The Riemann tensor is curvature itself: the tidal accelerations of falling bodies, the stretching a gravitational wave imprints on LIGO's arms, and — contracted — the part of curvature Einstein's equations tie to matter (steps 15–18).`,
  visual: {
    type: 'gr-surface',
    title: 'Curvature as the turn around a small loop',
    lead: t`A vector carried around a small coordinate rectangle at P comes back turned. Shrink the loop: the turn divided by the enclosed area settles on the Gaussian curvature $K$ — on a surface, the single independent component of the Riemann tensor, $K = R_{uvuv}/\det g$.`,
    tasks: [
      'Torus: with P on the outer equator the vector comes back turned anticlockwise (K > 0); move P to the inner side and it turns clockwise (K < 0).',
      'Shrink the loop to its smallest size: rotation ÷ area matches K at P to three figures.',
      'Cylinder: no turn at all, however big the loop — zero Riemann tensor, flat however it looks.',
    ],
    params: { mode: 'loop', surface: 'torus', surfaces: ['sphere', 'torus', 'catenoid', 'cylinder'], pos: 0.5, size: 0.3 },
  },
  example: {
    prompt: t`Compute the Riemann tensor of a sphere of radius $a$ from its Christoffel symbols, $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$ and $\Gamma^\phi{}_{\theta\phi} = \Gamma^\phi{}_{\phi\theta} = \cot\theta$, and read off its curvature.`,
    visual: surfacePic({ mode: 'loop', surface: 'sphere', v: 1.0, size: 0.4 }, 'A vector (violet) carried around a coordinate rectangle on a sphere comes back turned (red), by the enclosed area divided by a².'),
    steps: [
      { label: 'Which components', text: t`On a surface every index is $\theta$ or $\phi$. Antisymmetry in the last pair leaves only $\mu\nu = \theta\phi$ (or $\phi\theta$, its negative), and with the first index lowered, antisymmetry in the first pair does the same: one independent component. Compute $R^\theta{}_{\phi\theta\phi}$ ($\rho = \theta$, $\sigma = \phi$, $\mu = \theta$, $\nu = \phi$).` },
      { label: 'Derivative terms', text: t`$\partial_\theta\Gamma^\theta{}_{\phi\phi} - \partial_\phi\Gamma^\theta{}_{\theta\phi} = \partial_\theta(-\sin\theta\cos\theta) - 0 = -\cos 2\theta$.` },
      { label: 'Product terms', text: t`$\Gamma^\theta{}_{\theta\lambda}\Gamma^\lambda{}_{\phi\phi} - \Gamma^\theta{}_{\phi\lambda}\Gamma^\lambda{}_{\theta\phi}$. In the first, $\Gamma^\theta{}_{\theta\theta} = \Gamma^\theta{}_{\theta\phi} = 0$, so it vanishes. In the second only $\lambda = \phi$ survives: $\Gamma^\theta{}_{\phi\phi}\Gamma^\phi{}_{\theta\phi} = (-\sin\theta\cos\theta)\cot\theta = -\cos^2\theta$, which enters with a minus sign: $+\cos^2\theta$.` },
      { label: 'Add', text: t`$R^\theta{}_{\phi\theta\phi} = -\cos2\theta + \cos^2\theta = \sin^2\theta$. Lowering the first index, $R_{\theta\phi\theta\phi} = g_{\theta\theta}R^\theta{}_{\phi\theta\phi} = a^2\sin^2\theta$.` },
      { label: 'The curvature', text: t`In two dimensions the whole tensor is $R_{abcd} = K\,(g_{ac}g_{bd} - g_{ad}g_{bc})$, so $K = R_{\theta\phi\theta\phi}/\det g = a^2\sin^2\theta/(a^4\sin^2\theta) = 1/a^2$ — the same at every point, as a sphere must be. The coordinate artefacts, like $\cot\theta$ blowing up at the poles, have cancelled.` },
      { label: 'Sense check', text: t`The flat plane in polar coordinates: the derivative term $\partial_r\Gamma^r{}_{\theta\theta} = -1$ and the product term $-\Gamma^r{}_{\theta\theta}\Gamma^\theta{}_{r\theta} = +1$ cancel, so $R^r{}_{\theta r\theta} = 0$ although the Christoffel symbols are not zero. Flat is flat in every coordinate system.` },
    ],
    answer: t`$R^\theta{}_{\phi\theta\phi} = \sin^2\theta$, $R_{\theta\phi\theta\phi} = a^2\sin^2\theta$, and the Gaussian curvature is $K = 1/a^2$ everywhere.`,
  },
  practice: [
    num({
      id: 'pairs', difficulty: 2,
      gen(r) {
        const n = r.pick([4, 5, 6]);
        const M = (n * (n - 1)) / 2, after = (M * (M + 1)) / 2, final = (n * n * (n * n - 1)) / 12;
        return {
          prompt: t`With its first index lowered, the Riemann tensor is antisymmetric in its first pair, $R_{\rho\sigma\mu\nu} = -R_{\sigma\rho\mu\nu}$, antisymmetric in its last pair, and symmetric under exchanging the pairs, $R_{\rho\sigma\mu\nu} = R_{\mu\nu\rho\sigma}$. In $n = ${n}$ dimensions, how many independent components do these three symmetries leave? (The cyclic identity $R_{\rho[\sigma\mu\nu]} = 0$ then removes a few more.)`,
          answer: after, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: final, feedback: t`That is the final count, after the cyclic identity has removed $\binom{n}{4} = ${final === after ? 0 : after - final}$ more. Count before it.` }, { value: M * M, feedback: t`That counts every ordered pair of pairs. Exchanging the pairs changes nothing, so count only the diagonal and one side of it.` }],
          hints: [t`An antisymmetric pair of indices takes $M = n(n-1)/2$ values: $${M}$ here.`, t`A symmetric $M\times M$ array has $M(M+1)/2$ independent entries.`],
          teach: 'Riemann’s pair symmetries make it a symmetric matrix on antisymmetric index pairs: M(M + 1)/2 numbers with M = n(n − 1)/2, before the cyclic identity.',
          explain: t`$M = ${M}$, so $M(M+1)/2 = ${after}$. The cyclic identity removes $\binom{${n}}{4} = ${after - final}$ more, leaving $n^2(n^2-1)/12 = ${final}$ — the 20 of spacetime when $n = 4$.`,
          visual: pairGrid,
        };
      },
    }),
    expr({
      id: 'half-plane', difficulty: 3,
      prompt: t`For the upper half-plane, $ds^2 = (dx^2 + dy^2)/y^2$, the Christoffel symbols are $\Gamma^x{}_{xy} = \Gamma^x{}_{yx} = -1/y$, $\Gamma^y{}_{xx} = 1/y$ and $\Gamma^y{}_{yy} = -1/y$ (steps 11 and 12). Find $R^x{}_{yxy}$.`,
      answer: '-1/y^2', answerTeX: t`-\frac{1}{y^2}`, lhs: t`R^x{}_{yxy}`,
      vars: { y: [0.4, 3] },
      errors: [{ answer: '1/y^2', feedback: t`Sign: the derivative term is $-\partial_y\Gamma^x{}_{xy} = -\partial_y(-1/y) = -1/y^2$.` }, { answer: '-1/y^4', feedback: t`That is the fully lowered $R_{xyxy} = g_{xx}R^x{}_{yxy}$. The question asks for $R^x{}_{yxy}$.` }, { answer: '-2/y^2', feedback: t`The two product terms are $+1/y^2$ and $-1/y^2$: they cancel rather than add.` }],
      hints: [t`Derivative terms: $\partial_x\Gamma^x{}_{yy} - \partial_y\Gamma^x{}_{xy}$, and $\Gamma^x{}_{yy} = 0$.`, t`Product terms: $\Gamma^x{}_{x\lambda}\Gamma^\lambda{}_{yy} - \Gamma^x{}_{y\lambda}\Gamma^\lambda{}_{xy}$; only $\lambda = y$ in the first and $\lambda = x$ in the second survive, and they cancel.`],
      teach: 'Riemann components come from derivative terms plus products of Christoffel symbols; keep the index order exactly as the formula gives it.',
      explain: t`Derivative terms: $0 - \partial_y(-1/y) = -1/y^2$. Products: $(-1/y)(-1/y) - (-1/y)(-1/y) = 0$. So $R^x{}_{yxy} = -1/y^2$, $R_{xyxy} = -1/y^4$ and $K = R_{xyxy}/\det g = (-1/y^4)/(1/y^4) = -1$: constant negative curvature, everywhere the same.`,
      visual: halfPlane(),
    }),
    mcq({
      id: 'rindler', difficulty: 2,
      prompt: t`Accelerated observers in flat spacetime use Rindler coordinates, $ds^2 = -\rho^2d\eta^2 + d\rho^2$ ($c = 1$), with $\Gamma^\rho{}_{\eta\eta} = \rho$ and $\Gamma^\eta{}_{\eta\rho} = 1/\rho$: they feel a "gravity" of $1/\rho$. Compute $R^\rho{}_{\eta\rho\eta}$. What does it show?`,
      choices: [
        t`It is zero: the derivative term $\partial_\rho\Gamma^\rho{}_{\eta\eta} = 1$ and the product term $-\Gamma^\rho{}_{\eta\eta}\Gamma^\eta{}_{\rho\eta} = -1$ cancel — their "gravity" is pure coordinates`,
        t`It is $1$: the derivative term alone, so spacetime is curved where they are`,
        t`It is $1/\rho^2$: curvature grows toward the horizon`,
        'It cannot be zero, because the Christoffel symbols are not zero',
      ],
      answer: 0,
      why: {
        1: t`The product terms count too: $\Gamma^\rho{}_{\eta\eta}\Gamma^\eta{}_{\rho\eta} = \rho\cdot\tfrac1\rho = 1$, entering with a minus sign.`,
        2: 'Nothing in the calculation produces 1/ρ²; the two contributions cancel at every ρ.',
        3: 'Polar coordinates on a flat plane have non-zero Christoffel symbols too. Curvature is the Riemann tensor, not Γ.',
      },
      hints: [t`$R^\rho{}_{\eta\rho\eta} = \partial_\rho\Gamma^\rho{}_{\eta\eta} - \partial_\eta\Gamma^\rho{}_{\rho\eta} + \Gamma^\rho{}_{\rho\lambda}\Gamma^\lambda{}_{\eta\eta} - \Gamma^\rho{}_{\eta\lambda}\Gamma^\lambda{}_{\rho\eta}$.`, t`$\Gamma^\rho{}_{\rho\rho} = \Gamma^\rho{}_{\rho\eta} = 0$; only $\Gamma^\rho{}_{\eta\eta}\Gamma^\eta{}_{\rho\eta}$ survives among the products.`],
      teach: 'An accelerated frame has a connection but no curvature: its Christoffel symbols are non-zero while the Riemann tensor vanishes.',
      explain: t`$R^\rho{}_{\eta\rho\eta} = 1 - 0 + 0 - \rho\cdot\tfrac1\rho = 0$, and so is every other component. A rocket's crew feels "gravity" from the connection; real gravity — the kind no frame removes — would show up as a non-zero Riemann tensor, felt as tides.`,
      visual: { type: 'gr-elevator', params: { mode: 'rocket' }, caption: 'A box riding a rocket that accelerates at g, far from any star. Press Release: inside, the balls fall exactly as on Earth — but no tidal drift appears, however big the box. Flat spacetime, accelerated coordinates.' },
    }),
    num({
      id: 'torus-loop', difficulty: 2,
      gen(r) {
        const vd = r.pick([0, 60, 120, 180]);
        const v = vd * DEG, d = 0.04;                              // full widths 0.08 rad
        const K = Math.cos(v) / (2 + Math.cos(v)), area = (2 + Math.cos(v)) * 1 * (2 * d) ** 2;
        const rot = (K * area) / DEG;
        return {
          prompt: t`On a torus with $R = 2$, $r = 1$ (lengths in metres), $K = \dfrac{\cos v}{r(R + r\cos v)}$ and the area element is $(R + r\cos v)\,r\,du\,dv$. A vector is carried anticlockwise around a small coordinate rectangle $0.08$ rad wide in both $u$ and $v$, centred at $v = ${vd}^\circ$. Using rotation $\approx K\times$ area, by how many degrees does it come back turned (anticlockwise positive)?`,
          answer: rot, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: -rot, feedback: t`Check the sign of $\cos v$: ${vd > 90 ? 'on the inner side K is negative, so the turn is clockwise' : 'on the outer side K is positive, so the turn is anticlockwise'}.` }, { value: K * area, feedback: 'That is in radians. Multiply by 180/π.' }],
          hints: [t`$K\times\text{area} = \dfrac{\cos v}{r(R + r\cos v)}\times(R + r\cos v)\,r\,(0.08)^2 = \cos v\times0.0064$ rad.`, t`$\cos ${vd}^\circ = ${fmt(Math.cos(v), 3)}$; convert radians to degrees.`],
          teach: 'The turn around a small loop is the curvature times the enclosed area — positive on the outside of a torus, negative on the inside.',
          explain: t`$K\,dA = \cos v\,du\,dv$, so the turn is $${fmt(Math.cos(v), 3)}\times0.0064 = ${fmt(K * area, 3)}$ rad $= ${fmt(rot, 3)}^\circ$. Added over the whole torus, $\int K\,dA = 0$: the positive outside exactly cancels the negative inside (the Gauss–Bonnet theorem).`,
          visual: surfacePic({ mode: 'loop', surface: 'torus', v: rnd(v === Math.PI ? 3.14 : v, 4), size: 0.3 }, t`A larger loop drawn at $v = ${vd}^\circ$ so it can be seen: violet, the vector at the start; red, what comes back. Colour: Gaussian curvature (gold positive, blue negative).`),
        };
      },
    }),
    num({
      id: 'meridians', difficulty: 2,
      gen(r) {
        const [x0, s] = r.pick([[100, 1000], [100, 3000], [50, 2000], [200, 5000]]);
        const xi = x0 * Math.cos(s / A_EARTH);
        return {
          prompt: t`Two aircraft leave the equator ${x0} km apart, both flying due north along meridians. On a sphere of radius $a = ${A_EARTH}$ km, the geodesic deviation equation $\dfrac{D^2\xi^\rho}{ds^2} = R^\rho{}_{\sigma\mu\nu}T^\sigma T^\mu\xi^\nu$ reduces to $\xi'' = -\xi/a^2$ for their separation $\xi$, with $\xi(0) = ${x0}$ km and $\xi'(0) = 0$. How far apart are they after flying ${s.toLocaleString('en-US')} km?`,
          answer: xi, units: 'km', tol: { rel: 0.002 },
          errors: [{ value: x0, feedback: 'They start parallel, but on a curved surface geodesics that start parallel converge: ξ″ = −ξ/a².' }, { value: x0 * (1 - s / A_EARTH), feedback: t`The separation follows $\cos(s/a)$, not a straight line.` }],
          hints: [t`$\xi'' = -\xi/a^2$ with $\xi'(0) = 0$ has solution $\xi = \xi_0\cos(s/a)$.`, t`$s/a = ${s}/${A_EARTH}$ rad.`],
          teach: 'On a sphere, geodesics that start parallel converge as cos(s/a): the Riemann tensor at work, with no force between them.',
          explain: t`$\xi = ${x0}\cos(${s}/${A_EARTH}) = ${fmt(xi, 4)}$ km. The component doing it is $R^\phi{}_{\theta\theta\phi} = -1$ (with unit-speed $T^\theta = 1/a$): the curvature $1/a^2$ pulls the meridians together until they meet at the pole, $s = \pi a/2$.`,
          visual: meridians,
        };
      },
    }),
    code({
      id: 'sympy-riemann', difficulty: 3,
      prompt: t`The program has a working \`christoffel(g, x)\` that returns the array \`G[l][m][n]\` $= \Gamma^l{}_{mn}$. Finish \`riemann(g, x, r, s, m, n)\` so it returns $R^r{}_{smn} = \partial_m\Gamma^r{}_{ns} - \partial_n\Gamma^r{}_{ms} + \Gamma^r{}_{ml}\Gamma^l{}_{ns} - \Gamma^r{}_{nl}\Gamma^l{}_{ms}$ (summed over $l$). The program then finds the torus's Gaussian curvature, $K = g_{uu}R^u{}_{vuv}/\det g$.`,
      starter: t`import sympy as sp

def christoffel(g, x):
    """G[l][m][n] = Gamma^l_mn of the metric matrix g in coordinates x."""
    ginv, d = g.inv(), len(x)
    return [[[sp.simplify(sum(ginv[l, s]*(sp.diff(g[n, s], x[m]) + sp.diff(g[m, s], x[n]) - sp.diff(g[m, n], x[s])) for s in range(d))/2)
              for n in range(d)] for m in range(d)] for l in range(d)]

def riemann(g, x, r, s, m, n):
    """R^r_smn for the metric g in coordinates x."""
    G = christoffel(g, x)
    d = len(x)
    # two derivative terms, then the sum over l of two products
    return 0

u, v = sp.symbols('u v')
R, r = sp.symbols('R r', positive=True)
th, ph, a, rr = sp.symbols('theta phi a rr', positive=True)
torus = sp.diag((R + r*sp.cos(v))**2, r**2)
print('K =', sp.simplify(torus[0, 0]*riemann(torus, [u, v], 0, 1, 0, 1)/torus.det()))
`,
      answer: t`import sympy as sp

def christoffel(g, x):
    """G[l][m][n] = Gamma^l_mn of the metric matrix g in coordinates x."""
    ginv, d = g.inv(), len(x)
    return [[[sp.simplify(sum(ginv[l, s]*(sp.diff(g[n, s], x[m]) + sp.diff(g[m, s], x[n]) - sp.diff(g[m, n], x[s])) for s in range(d))/2)
              for n in range(d)] for m in range(d)] for l in range(d)]

def riemann(g, x, r, s, m, n):
    """R^r_smn for the metric g in coordinates x."""
    G = christoffel(g, x)
    d = len(x)
    expr = sp.diff(G[r][n][s], x[m]) - sp.diff(G[r][m][s], x[n])
    expr += sum(G[r][m][l]*G[l][n][s] - G[r][n][l]*G[l][m][s] for l in range(d))
    return sp.simplify(expr)

u, v = sp.symbols('u v')
R, r = sp.symbols('R r', positive=True)
th, ph, a, rr = sp.symbols('theta phi a rr', positive=True)
torus = sp.diag((R + r*sp.cos(v))**2, r**2)
print('K =', sp.simplify(torus[0, 0]*riemann(torus, [u, v], 0, 1, 0, 1)/torus.det()))
`,
      tests: [
        { name: t`a sphere of radius $a$: $R^\theta{}_{\phi\theta\phi} = \sin^2\theta$`, code: 'abs(float((riemann(sp.diag(a**2, a**2*sp.sin(th)**2), [th, ph], 0, 1, 0, 1) - sp.sin(th)**2).subs({th: 0.7, a: 1.3}))) < 1e-9' },
        { name: t`the torus: $K = \cos v/\big(r(R + r\cos v)\big)$`, code: 'abs(float((torus[0, 0]*riemann(torus, [u, v], 0, 1, 0, 1)/torus.det() - sp.cos(v)/(r*(R + r*sp.cos(v)))).subs({v: 0.9, R: 2, r: 1}))) < 1e-9' },
        { name: 'flat polar coordinates give zero', code: 'sp.simplify(riemann(sp.diag(1, rr**2), [rr, th], 0, 1, 0, 1)) == 0' },
        { name: 'antisymmetric in its last two indices', code: 'sp.simplify(riemann(torus, [u, v], 0, 1, 0, 1) + riemann(torus, [u, v], 0, 1, 1, 0)) == 0' },
      ],
      hints: ['Start with expr = sp.diff(G[r][n][s], x[m]) - sp.diff(G[r][m][s], x[n]).', 'Then add sum(G[r][m][l]*G[l][n][s] - G[r][n][l]*G[l][m][s] for l in range(d)) and return sp.simplify(expr).'],
      teach: 'The Riemann tensor is a mechanical recipe from the Christoffel symbols — two derivatives and two products — which a computer algebra system carries out without slips.',
      explain: t`The function adds the two derivative terms and the summed products. For the torus it prints $K = \cos v/\big(r(R + r\cos v)\big)$: $1/3$ on the outer equator and $-1$ on the inner one for $R = 2$, $r = 1$ — the values the Explore's loops measure.`,
      visual: surfacePic({ mode: 'loop', surface: 'torus', v: 0.2, size: 0.35 }, 'A torus (R = 2, r = 1), coloured by its Gaussian curvature, with a vector carried round a loop on its outer side. Your function computes that curvature exactly.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-flight', difficulty: 3, transfer: true,
      gen(r) {
        const ratio = r.pick([0.5, 0.75, 0.9]);
        const s = A_EARTH * Math.acos(ratio);
        return {
          prompt: t`Two aircraft leave the equator side by side, a short distance apart, and both fly due north along meridians. Their separation obeys the geodesic deviation equation on a sphere of radius ${A_EARTH} km, $\xi'' = -\xi/a^2$, with $\xi'(0) = 0$. After how many kilometres has their separation shrunk to ${ratio * 100}% of its starting value?`,
          answer: s, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: A_EARTH * (1 - ratio), feedback: t`The separation shrinks as $\cos(s/a)$, not linearly: solve $\cos(s/a) = ${ratio}$.` }, { value: A_EARTH * Math.acos(ratio) * 180 / Math.PI, feedback: t`Take $\arccos$ in radians before multiplying by $a$.` }],
          hints: [t`$\xi = \xi_0\cos(s/a)$, so $\cos(s/a) = ${ratio}$.`, t`$s = a\arccos(${ratio})$, with the angle in radians.`],
          teach: 'Geodesic deviation turns curvature into distances: on a sphere of radius a, parallel geodesics close in as cos(s/a).',
          explain: t`$s = ${A_EARTH}\times\arccos(${ratio}) = ${fmt(s, 4)}$ km. Navigators meet this every day: lines of longitude, parallel at the equator, close in toward the poles with nothing pushing them.`,
          visual: meridians,
        };
      },
    }),
    num({
      id: 'cp-gauss', difficulty: 3,
      gen(r) {
        const [kind, k] = r.pick([['sin', 2], ['sinh', 2], ['sin', 0.5], ['sinh', 3]]);
        const K = kind === 'sin' ? k * k : -k * k;
        const fTeX = kind === 'sin' ? t`\dfrac{\sin(${k}q)}{${k}}` : t`\dfrac{\sinh(${k}q)}{${k}}`;
        return {
          prompt: t`A surface with $d\ell^2 = dq^2 + f(q)^2\,d\phi^2$ has $\Gamma^q{}_{\phi\phi} = -ff'$ and $\Gamma^\phi{}_{q\phi} = f'/f$, so $R^q{}_{\phi q\phi} = -f f''$ and $K = R_{q\phi q\phi}/\det g = -f''/f$. Find $K$ for $f(q) = ${fTeX}$.`,
          answer: K, tol: { rel: 1e-3, abs: 1e-9 },
          errors: [{ value: -K, feedback: t`Sign: $K = -f''/f$. ${kind === 'sin' ? t`For a sine, $f'' = -${k * k}f$.` : t`For a hyperbolic sine, $f'' = +${k * k}f$.`}` }, { value: kind === 'sin' ? k : -k, feedback: t`Differentiate twice: the chain rule brings out $${k}$ each time.` }],
          hints: [t`Differentiate $f$ twice.`, t`${kind === 'sin' ? t`$f'' = -${k}\sin(${k}q) = -${k * k}f$` : t`$f'' = ${k}\sinh(${k}q) = ${k * k}f$`}, so $-f''/f = ${K}$.`],
          teach: 'For a surface ds² + f² dφ², the Riemann tensor reduces to Gauss’s K = −f″/f: sines give spheres, hyperbolic sines saddles.',
          explain: t`$K = -f''/f = ${K}$: ${K > 0 ? t`a sphere of radius $1/${k}$` : t`a surface of constant negative curvature, the hyperbolic plane with $K = ${K}$`}. With $f = q$ (a flat plane in polar coordinates) $K = 0$.`,
          visual: K > 0 ? surfacePic({ mode: 'basis', surface: 'sphere', v: 1.1 }, t`Positive curvature: a sphere, where the circles $q = $ const grow more slowly than on a flat plane.`) : surfacePic({ mode: 'basis', surface: 'catenoid', v: 0.6 }, t`Negative curvature (blue), drawn on a catenoid: circles grow faster than on a flat plane. The hyperbolic plane cannot be drawn whole in ordinary space.`),
        };
      },
    }),
    mcq({
      id: 'cp-scalar', difficulty: 2,
      prompt: t`The Riemann tensor measures $[\nabla_\mu, \nabla_\nu]V^\rho$. What does the commutator give acting on a scalar field $f$, with the torsion-free connection of general relativity?`,
      choices: [
        t`Zero: $\nabla_\mu\nabla_\nu f - \nabla_\nu\nabla_\mu f = -(\Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\nu\mu})\,\partial_\lambda f = 0$`,
        t`$R_{\mu\nu}f$, the Ricci tensor times $f$`,
        t`$\Gamma^\lambda{}_{\mu\nu}\,\partial_\lambda f$`,
        t`$\partial_\mu\partial_\nu f$`,
      ],
      answer: 0,
      why: {
        1: 'A scalar has no components to turn, so there is nothing for curvature to act on.',
        2: t`The Christoffel terms come in as a difference, $\Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\nu\mu}$, which is zero for a symmetric connection.`,
        3: t`Partial derivatives commute, and the commutator is a difference: $\partial_\mu\partial_\nu f$ cancels against $\partial_\nu\partial_\mu f$.`,
      },
      hints: [t`$\nabla_\nu f = \partial_\nu f$, a covector; then $\nabla_\mu(\partial_\nu f) = \partial_\mu\partial_\nu f - \Gamma^\lambda{}_{\mu\nu}\partial_\lambda f$.`],
      teach: 'On a scalar, covariant derivatives commute (no torsion); on a vector, their commutator is the Riemann tensor.',
      explain: t`The second derivatives cancel and the $\Gamma$ terms leave the torsion, zero here. Only objects with directions — vectors, covectors, tensors — feel curvature through the commutator, one Riemann term per index.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §3.6–3.7 (curvature, geodesic deviation)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Carroll, Spacetime and Geometry, §3.6–3.10', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
