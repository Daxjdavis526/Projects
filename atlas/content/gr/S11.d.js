// Christoffel symbols from the metric — Derivation Mode. Torsion-free plus
// metric-compatible fixes the connection: Γ^λ_μν = ½g^λσ(∂_μg_νσ + ∂_νg_μσ −
// ∂_σg_μν). Worked in full for the 2-sphere; practice on flat spherical
// coordinates, the hyperbolic plane, Rindler (an accelerating observer in
// flat spacetime), the trace identity Γ^μ_μλ = ∂_λ ln√|g|, a cylinder, and a
// SymPy function that computes any symbol. Avoids gr.EQ.3's items (polar
// Γ^r_θθ, the sphere's value at an angle, rotating frames, counting).
// Every result verified with SymPy (scratch v10_11.py).
import { lesson, mcq, expr, order, code, num } from '../../src/core/content.js';
import { C, sci } from './_curvature.js';
import { surfacePic, spherePic, halfPlane } from './_tensors.js';

const t = String.raw;
const LY = 9.461e15;                                    // m

const CHR = t`\Gamma^\lambda{}_{\mu\nu} = \tfrac12\,g^{\lambda\sigma}\left(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma} - \partial_\sigma g_{\mu\nu}\right)`;

// Rindler observers: hyperbolae x² − t² = ρ² in flat spacetime, with the horizon x = |t|
const rindler = (caption) => ({
  type: 'graph',
  params: {
    x: [-0.4, 3.6], y: [-2.1, 2.1], equal: true, xlabel: 'x (c = 1)', ylabel: 't',
    curves: [
      { fn: 'x', domain: [0, 2.2], color: 'warn', dash: true, label: 'horizon', labelAt: 1.7, labelDx: -62, labelDy: -6 },
      { fn: '-x', domain: [0, 2.2], color: 'warn', dash: true },
      ...[0.5, 1, 1.6, 2.4].map((R) => { const T = Math.round(Math.asinh(2.1 / R) * 1000) / 1000; return { param: [`${R}*cosh(t)`, `${R}*sinh(t)`], t: [-T, T], color: 'accent' }; }),
    ],
    points: [{ x: 1, y: 0, color: 'gold', label: 'ρ = 1' }, { x: 2.4, y: 0, color: 'gold', label: 'ρ = 2.4' }],
  },
  caption: caption ?? 'Flat spacetime in Rindler coordinates (c = 1). Each blue hyperbola is the worldline of an observer at fixed ρ, who must accelerate at 1/ρ to stay on it; the dashed lines are the horizon no signal from beyond can cross to reach them.',
});

const sphereBasis = (v, caption) => surfacePic({ mode: 'basis', surface: 'sphere', v }, caption);

export default lesson({
  id: 'gr.S11.d',
  title: 'Christoffel symbols from the metric',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`In step 10 the connection was read off basis vectors drawn on a flat page. A curved spacetime has no flat page to draw them on — but it has a **metric**, and two demands fix the connection completely. It must not twist: $\Gamma^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\nu\mu}$ (**torsion-free**). And carrying vectors along must keep their lengths and angles: $\nabla_\rho g_{\mu\nu} = 0$ (**metric compatibility**). Solving those two conditions gives the formula above — the **Levi-Civita connection**, built from first derivatives of the metric alone.

Every geodesic, every gyroscope's precession and every curvature tensor in general relativity starts with this computation.`,
  equation: CHR,
  symbols: [
    { tex: '\\Gamma^\\lambda{}_{\\mu\\nu}', text: t`the Christoffel symbol: the $\lambda$-component of the change of the basis vector $\mathbf e_\nu$ per unit step along $x^\mu$. Symmetric in $\mu\nu$, so $n^2(n+1)/2$ independent ones in $n$ dimensions — 40 in spacetime` },
    { tex: 'g_{\\mu\\nu}', text: t`the metric components, from the line element $ds^2 = g_{\mu\nu}\,dx^\mu dx^\nu$: dot products of the basis vectors, $g_{\mu\nu} = \mathbf e_\mu\cdot\mathbf e_\nu$` },
    { tex: 'g^{\\lambda\\sigma}', text: t`the inverse metric, the matrix inverse of $g_{\mu\nu}$: $g^{\lambda\sigma}g_{\sigma\nu} = \delta^\lambda{}_\nu$ (1 if $\lambda = \nu$, else 0). For a diagonal metric, $g^{\lambda\lambda} = 1/g_{\lambda\lambda}$` },
    { tex: '\\partial_\\mu g_{\\nu\\sigma}', text: t`the rate of change of a metric component along the coordinate $x^\mu$` },
    { tex: '\\sigma', text: t`a dummy index, summed: it appears once up (in $g^{\lambda\sigma}$) and once down (in the bracket)` },
    { tex: '\\lambda,\\ \\mu,\\ \\nu', text: t`free indices: each choice picks out one symbol` },
  ],
  why: t`These numbers steer free fall (step 12), turn gyroscopes (step 13) and build the Riemann tensor (step 14): computing them from a metric is the first step of almost every calculation in general relativity.`,
  visual: {
    type: 'gr-surface',
    title: 'Christoffel symbols measured on five surfaces',
    lead: t`Each surface carries coordinates $(u, v)$: $u$ goes around the axis, $v$ along a meridian. At P, blue and violet are the coordinate basis vectors; the readout gives the metric there and the three Christoffel symbols that can be non-zero, computed from the formula above. Move P and switch surfaces.`,
    tasks: [
      t`Sphere: slide P toward a pole. $\Gamma^\phi{}_{\phi\theta} = \cot\theta$ grows without limit as $\mathbf e_\phi$ shrinks — a coordinate effect, since $K$ stays 1. At the equator $\Gamma^\theta{}_{\phi\phi} = 0$.`,
      t`Cylinder: every symbol is zero and $K = 0$. A rolled-up sheet is flat from the inside, however curved it looks from outside.`,
      t`Cone: the symbols are not zero, yet $K = 0$ everywhere. A non-zero $\Gamma$ does not mean curvature.`,
    ],
    params: { mode: 'basis', surface: 'sphere', surfaces: ['sphere', 'torus', 'cylinder', 'cone', 'catenoid'], pos: 0.3 },
  },
  example: {
    prompt: t`Compute every Christoffel symbol of a sphere of radius $a$, with $ds^2 = a^2\,d\theta^2 + a^2\sin^2\theta\,d\phi^2$ ($\theta$ measured from the north pole, $\phi$ around it).`,
    visual: sphereBasis(0.9, t`A sphere with the basis vectors $\mathbf e_\phi$ (blue) and $\mathbf e_\theta$ (violet) at P, and their copies a step away. Going around, $\mathbf e_\phi$ turns; going toward the pole, it shrinks.`),
    steps: [
      { label: 'Metric and inverse', text: t`$g_{\theta\theta} = a^2$, $g_{\phi\phi} = a^2\sin^2\theta$, $g_{\theta\phi} = 0$. The metric is diagonal, so its inverse is too: $g^{\theta\theta} = 1/a^2$ and $g^{\phi\phi} = 1/(a^2\sin^2\theta)$.` },
      { label: 'Which derivatives survive', text: t`Nothing depends on $\phi$ and only $g_{\phi\phi}$ depends on $\theta$, so the one non-zero derivative is $\partial_\theta g_{\phi\phi} = 2a^2\sin\theta\cos\theta$. A symbol can only be non-zero if its three indices are two $\phi$'s and one $\theta$.` },
      { label: 'θ upstairs', text: t`With a diagonal metric only $\sigma = \lambda$ survives the sum: $\Gamma^\theta{}_{\phi\phi} = \tfrac12 g^{\theta\theta}\big(\partial_\phi g_{\phi\theta} + \partial_\phi g_{\phi\theta} - \partial_\theta g_{\phi\phi}\big) = \tfrac12\cdot\tfrac1{a^2}\big(0 + 0 - 2a^2\sin\theta\cos\theta\big) = -\sin\theta\cos\theta$.` },
      { label: 'φ upstairs', text: t`$\Gamma^\phi{}_{\theta\phi} = \tfrac12 g^{\phi\phi}\big(\partial_\theta g_{\phi\phi} + \partial_\phi g_{\theta\phi} - \partial_\phi g_{\theta\phi}\big) = \tfrac12\cdot\tfrac{1}{a^2\sin^2\theta}\cdot2a^2\sin\theta\cos\theta = \cot\theta$, and $\Gamma^\phi{}_{\phi\theta}$ is the same by symmetry.` },
      { label: 'The rest', text: t`$\Gamma^\theta{}_{\theta\theta}$, $\Gamma^\theta{}_{\theta\phi}$, $\Gamma^\phi{}_{\theta\theta}$ and $\Gamma^\phi{}_{\phi\phi}$ contain only derivatives that vanish. Of the $2^2\cdot3/2 = 6$ independent symbols, two are non-zero.` },
      { label: 'Sense check', text: t`The radius cancels: angles carry no units, so neither do these symbols. $\Gamma^\theta{}_{\phi\phi}$ vanishes on the equator, the one circle of latitude that is a straight line on the sphere (step 12). And metric compatibility holds: $\nabla_\theta g_{\phi\phi} = \partial_\theta g_{\phi\phi} - 2\Gamma^\phi{}_{\theta\phi}g_{\phi\phi} = 2a^2\sin\theta\cos\theta - 2\cot\theta\cdot a^2\sin^2\theta = 0$.` },
    ],
    answer: t`$\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$ and $\Gamma^\phi{}_{\theta\phi} = \Gamma^\phi{}_{\phi\theta} = \cot\theta$; the other symbols are zero.`,
  },
  practice: [
    order({
      id: 'derive', difficulty: 3,
      prompt: t`Put the steps of the derivation of the Christoffel formula in order.`,
      items: [
        t`Write metric compatibility with one $-\Gamma$ term per lower index: $\nabla_\rho g_{\mu\nu} = \partial_\rho g_{\mu\nu} - \Gamma^\lambda{}_{\rho\mu}g_{\lambda\nu} - \Gamma^\lambda{}_{\rho\nu}g_{\mu\lambda} = 0$`,
        t`Write the same equation twice more with the indices cycled: $\nabla_\mu g_{\nu\rho} = 0$ and $\nabla_\nu g_{\rho\mu} = 0$`,
        t`Subtract the second and third equations from the first; with $\Gamma^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\nu\mu}$ (no torsion), four of the six $\Gamma$ terms cancel`,
        t`What is left: $2\,g_{\lambda\rho}\Gamma^\lambda{}_{\mu\nu} = \partial_\mu g_{\nu\rho} + \partial_\nu g_{\rho\mu} - \partial_\rho g_{\mu\nu}$`,
        t`Multiply by $\tfrac12 g^{\sigma\rho}$ and use $g^{\sigma\rho}g_{\rho\lambda} = \delta^\sigma{}_\lambda$ to free the upper index`,
      ],
      hints: ['Start from the condition that defines the connection, then generate more equations from it.', 'The symmetry of Γ is what makes terms cancel; the inverse metric comes last, to isolate Γ.'],
      teach: 'The Christoffel formula is metric compatibility written three ways with cycled indices, combined so that a torsion-free Γ can be solved for.',
      explain: t`Cycling the indices gives three equations in the same unknowns. First minus second minus third leaves $\partial_\rho g_{\mu\nu} - \partial_\mu g_{\nu\rho} - \partial_\nu g_{\rho\mu} + 2g_{\lambda\rho}\Gamma^\lambda{}_{\mu\nu} = 0$, and raising the index with $g^{\sigma\rho}$ gives $\Gamma^\sigma{}_{\mu\nu} = \tfrac12 g^{\sigma\rho}(\partial_\mu g_{\nu\rho} + \partial_\nu g_{\rho\mu} - \partial_\rho g_{\mu\nu})$. Uniqueness follows: there was no freedom at any step.`,
    }),
    expr({
      id: 'spherical', difficulty: 2,
      prompt: t`Flat space in spherical coordinates has $ds^2 = dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$. Find $\Gamma^r{}_{\phi\phi}$.`,
      answer: '-r sin(theta)^2', answerTeX: t`-r\sin^2\theta`, lhs: t`\Gamma^r{}_{\phi\phi}`,
      vars: { r: [0.5, 3], theta: [0.3, 2.8] },
      errors: [
        { answer: 'r sin(theta)^2', feedback: t`Check the sign: only the "minus" term, $-\partial_r g_{\phi\phi}$, survives.` },
        { answer: '-2r sin(theta)^2', feedback: t`Keep the $\tfrac12$ in front of the bracket.` },
        { answer: '-r', feedback: t`That is $\Gamma^r{}_{\theta\theta}$. Here $g_{\phi\phi} = r^2\sin^2\theta$.` },
      ],
      hints: [t`The metric is diagonal with $g^{rr} = 1$, so only $\sigma = r$ survives.`, t`$\Gamma^r{}_{\phi\phi} = \tfrac12\,g^{rr}\big(2\partial_\phi g_{\phi r} - \partial_r g_{\phi\phi}\big)$, and $g_{\phi r} = 0$.`],
      teach: t`For a diagonal metric, $\Gamma^\lambda{}_{\mu\mu} = -\tfrac12\,g^{\lambda\lambda}\,\partial_\lambda g_{\mu\mu}$ when $\lambda \neq \mu$.`,
      explain: t`$\Gamma^r{}_{\phi\phi} = -\tfrac12\,\partial_r(r^2\sin^2\theta) = -r\sin^2\theta$. Moving along a circle of latitude, $\mathbf e_\phi$ turns toward the axis; $\Gamma^r{}_{\phi\phi}$ and $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$ are the inward and poleward parts of that turn.`,
      visual: spherePic([{ param: ['sin(1)*cos(t)', 'sin(1)*sin(t)', 'cos(1)'], t: [0, 6.2832], color: 'gold', width: 2.6 }], t`One sphere $r = $ const inside flat space, with a circle of latitude (gold). Carried along it, $\mathbf e_\phi$ turns toward the axis — the turn that $\Gamma^r{}_{\phi\phi}$ and $\Gamma^\theta{}_{\phi\phi}$ record. Drag to rotate.`),
    }),
    expr({
      id: 'half-plane', difficulty: 2,
      gen(r) {
        const c = r.pick([
          { sym: t`\Gamma^y{}_{xx}`, ans: '1/y', tex: t`\frac1y`, errs: [{ answer: '-1/y', feedback: t`Sign: here the "minus" term $-\partial_y g_{xx}$ acts on a decreasing $g_{xx} = 1/y^2$, so the result is positive.` }, { answer: '1/y^3', feedback: t`Multiply by the inverse metric $g^{yy} = y^2$.` }] },
          { sym: t`\Gamma^x{}_{xy}`, ans: '-1/y', tex: t`-\frac1y`, errs: [{ answer: '1/y', feedback: t`Sign: $\partial_y g_{xx} = \partial_y(1/y^2) = -2/y^3$ is negative.` }, { answer: '-2/y', feedback: t`Keep the $\tfrac12$.` }] },
          { sym: t`\Gamma^y{}_{yy}`, ans: '-1/y', tex: t`-\frac1y`, errs: [{ answer: '1/y', feedback: t`Sign: $g_{yy} = 1/y^2$ decreases with $y$.` }, { answer: '-3/y', feedback: t`All three derivatives in the bracket are $\partial_y g_{yy}$, with signs $+\,+\,-$: they add to one of them, not three.` }] },
        ]);
        return {
          prompt: t`The upper half-plane, $y > 0$, with $ds^2 = \dfrac{dx^2 + dy^2}{y^2}$, is the standard picture of a surface with constant negative curvature. Find $${c.sym}$.`,
          answer: c.ans, answerTeX: c.tex, lhs: c.sym,
          vars: { y: [0.4, 3] },
          errors: c.errs,
          hints: [t`$g_{xx} = g_{yy} = 1/y^2$ and $g^{xx} = g^{yy} = y^2$; the only non-zero derivatives are $\partial_y g_{xx} = \partial_y g_{yy} = -2/y^3$.`, t`Write the bracket for your three indices, keep only the derivatives with respect to $y$, then multiply by $\tfrac12 y^2$.`],
          teach: 'Christoffel symbols come from derivatives of the metric times the inverse metric; signs follow whether the metric grows or shrinks along each direction.',
          explain: t`$${c.sym} = ${c.tex}$. The full set is $\Gamma^y{}_{xx} = 1/y$, $\Gamma^x{}_{xy} = \Gamma^x{}_{yx} = -1/y$, $\Gamma^y{}_{yy} = -1/y$. Put into the geodesic equation, they bend straight lines into the semicircles drawn above.`,
          visual: halfPlane(),
        };
      },
    }),
    expr({
      id: 'rindler', difficulty: 3,
      prompt: t`Flat spacetime as seen by a family of steadily accelerating observers — **Rindler coordinates** — has, with $c = 1$, $$ds^2 = -\rho^2\,d\eta^2 + d\rho^2$$ ($\eta$ a time coordinate, $\rho$ a distance). Find $\Gamma^\rho{}_{\eta\eta}$.`,
      answer: 'rho', answerTeX: t`\rho`, lhs: t`\Gamma^\rho{}_{\eta\eta}`,
      vars: { rho: [0.5, 3] },
      errors: [
        { answer: '-rho', feedback: t`That is the pattern of polar coordinates, $\Gamma^r{}_{\theta\theta} = -r$. Here $g_{\eta\eta} = -\rho^2$ carries the opposite sign, and so does the result.` },
        { answer: '2rho', feedback: t`Keep the $\tfrac12$: $-\tfrac12\,\partial_\rho(-\rho^2) = \rho$.` },
      ],
      hints: [t`Only $\sigma = \rho$ survives, with $g^{\rho\rho} = 1$.`, t`$\Gamma^\rho{}_{\eta\eta} = \tfrac12\,g^{\rho\rho}\big(2\partial_\eta g_{\eta\rho} - \partial_\rho g_{\eta\eta}\big) = -\tfrac12\,\partial_\rho(-\rho^2)$.`],
      teach: 'The signature matters: a time–time metric component with a minus sign flips the sign of the Christoffel symbol compared with its spatial cousin.',
      explain: t`$\Gamma^\rho{}_{\eta\eta} = -\tfrac12\,\partial_\rho(-\rho^2) = +\rho$ (and $\Gamma^\eta{}_{\eta\rho} = 1/\rho$). An observer staying at fixed $\rho$ has $u^\eta = 1/\rho$, so the geodesic equation says a free particle released there accelerates at $\Gamma^\rho{}_{\eta\eta}(u^\eta)^2 = 1/\rho$ toward smaller $\rho$: to stay put, the observer must accelerate at $1/\rho$. This "gravity" is all coordinates — the spacetime is flat.`,
      visual: rindler(),
    }),
    code({
      id: 'sympy-christoffel', difficulty: 3,
      prompt: t`Finish the function \`christoffel(g, x, l, m, n)\` so it returns $\Gamma^l{}_{mn} = \tfrac12\,g^{ls}\left(\partial_m g_{ns} + \partial_n g_{ms} - \partial_s g_{mn}\right)$, summed over $s$, for a SymPy metric matrix \`g\` in the coordinates \`x\` (indices count from 0). The program then applies it to a torus whose tube, of radius $r$, runs around a circle of radius $R$.`,
      starter: t`import sympy as sp

def christoffel(g, x, l, m, n):
    """Gamma^l_mn of the metric matrix g in coordinates x."""
    ginv = g.inv()
    # sum over s of ginv[l, s] * (d_m g[n, s] + d_n g[m, s] - d_s g[m, n]), times 1/2
    return 0

# a torus: ds^2 = (R + r cos v)^2 du^2 + r^2 dv^2
u, v = sp.symbols('u v')
R, r = sp.symbols('R r', positive=True)
torus = sp.diag((R + r*sp.cos(v))**2, r**2)
print(sp.simplify(christoffel(torus, [u, v], 1, 0, 0)))
`,
      answer: t`import sympy as sp

def christoffel(g, x, l, m, n):
    """Gamma^l_mn of the metric matrix g in coordinates x."""
    ginv = g.inv()
    total = sum(ginv[l, s] * (sp.diff(g[n, s], x[m]) + sp.diff(g[m, s], x[n]) - sp.diff(g[m, n], x[s])) for s in range(len(x)))
    return sp.simplify(total / 2)

# a torus: ds^2 = (R + r cos v)^2 du^2 + r^2 dv^2
u, v = sp.symbols('u v')
R, r = sp.symbols('R r', positive=True)
torus = sp.diag((R + r*sp.cos(v))**2, r**2)
print(sp.simplify(christoffel(torus, [u, v], 1, 0, 0)))
`,
      tests: [
        { name: t`torus: $\Gamma^v{}_{uu} = (R + r\cos v)\sin v/r$`, code: 'sp.simplify(christoffel(torus, [u, v], 1, 0, 0) - (R + r*sp.cos(v))*sp.sin(v)/r) == 0' },
        { name: t`torus: $\Gamma^u{}_{uv} = -r\sin v/(R + r\cos v)$`, code: 'sp.simplify(christoffel(torus, [u, v], 0, 0, 1) + r*sp.sin(v)/(R + r*sp.cos(v))) == 0' },
        { name: t`symmetric in its lower indices: $\Gamma^u{}_{uv} = \Gamma^u{}_{vu}$`, code: 'sp.simplify(christoffel(torus, [u, v], 0, 0, 1) - christoffel(torus, [u, v], 0, 1, 0)) == 0' },
        { name: t`a sphere of radius 2: $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$`, code: 'sp.simplify(christoffel(sp.diag(4, 4*sp.sin(u)**2), [u, v], 0, 1, 1) + sp.sin(u)*sp.cos(u)) == 0' },
      ],
      hints: ['Loop (or use sum) over s from 0 to len(x) − 1.', 'Each term is ginv[l, s] * (sp.diff(g[n, s], x[m]) + sp.diff(g[m, s], x[n]) - sp.diff(g[m, n], x[s])); halve the total at the end.'],
      teach: 'A Christoffel symbol is a short sum over one dummy index — exactly the kind of bookkeeping a computer algebra system does without slips.',
      explain: t`\`sum(ginv[l, s] * (sp.diff(g[n, s], x[m]) + sp.diff(g[m, s], x[n]) - sp.diff(g[m, n], x[s])) for s in range(len(x))) / 2\`. For the torus it gives $\Gamma^v{}_{uu} = (R + r\cos v)\sin v/r$ and $\Gamma^u{}_{uv} = -r\sin v/(R + r\cos v)$ — the numbers the Explore's torus readout shows, for $R = 2$, $r = 1$.`,
      visual: surfacePic({ mode: 'basis', surface: 'torus', v: 0.8 }, t`A torus with $R = 2$, $r = 1$, and the basis vectors $\mathbf e_u$ (blue, around the axis) and $\mathbf e_v$ (violet, around the tube) at a point. Colour: Gaussian curvature.`),
    }),
    expr({
      id: 'trace', difficulty: 3,
      gen(r) {
        const c = r.pick([
          { what: t`flat space in spherical coordinates, $ds^2 = dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$`, sq: t`r^2\sin\theta`, wrt: 'r', idx: 'r', ans: '2/r', tex: t`\frac2r`, errs: [{ answer: '1/r', feedback: t`$\ln(r^2\sin\theta) = 2\ln r + \ln\sin\theta$: the square gives a 2.` }, { answer: '2r', feedback: 'Differentiate the logarithm: ∂(ln r²)/∂r = 2/r.' }] },
          { what: t`flat space in spherical coordinates, $ds^2 = dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$`, sq: t`r^2\sin\theta`, wrt: 'theta', idx: t`\theta`, ans: 'cot(theta)', tex: t`\cot\theta`, errs: [{ answer: 'tan(theta)', feedback: t`$\partial_\theta\ln\sin\theta = \cos\theta/\sin\theta = \cot\theta$.` }, { answer: '-cot(theta)', feedback: 'Check the sign: sin θ grows for θ below 90°.' }] },
          { what: t`the Schwarzschild spacetime ($G = c = 1$), $ds^2 = -(1 - 2M/r)\,dt^2 + (1 - 2M/r)^{-1}dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$`, sq: t`r^2\sin\theta`, wrt: 'r', idx: 'r', ans: '2/r', tex: t`\frac2r`, errs: [{ answer: '1/r', feedback: t`$\ln(r^2\sin\theta) = 2\ln r + \ln\sin\theta$: the square gives a 2.` }, { answer: '2/r - 2/(r - 2)', feedback: t`The factors $(1 - 2M/r)$ in $g_{tt}$ and $g_{rr}$ cancel in the determinant: $\sqrt{|g|} = r^2\sin\theta$ exactly.` }] },
        ]);
        return {
          prompt: t`Sum the Christoffel formula over $\mu = \lambda$: two of the three bracket terms cancel and Jacobi's formula for a determinant gives $$\Gamma^\mu{}_{\mu\nu} = \tfrac12\,g^{\mu\sigma}\partial_\nu g_{\mu\sigma} = \partial_\nu\ln\sqrt{|g|},$$ where $|g|$ is the absolute value of the metric's determinant. For ${c.what}, $\sqrt{|g|} = ${c.sq}$. Find $\Gamma^\mu{}_{\mu ${c.idx}}$.`,
          answer: c.ans, answerTeX: c.tex, lhs: t`\Gamma^\mu{}_{\mu ${c.idx}}`,
          vars: { r: [3, 9], theta: [0.3, 2.8] }, wrt: c.wrt, derivativeOf: 'ln(r^2*sin(theta))',
          errors: c.errs,
          hints: [t`Take the logarithm first: $\ln(${c.sq}) = 2\ln r + \ln\sin\theta$.`, t`Differentiate with respect to $${c.idx}$.`],
          teach: t`The contracted Christoffel symbol is a derivative of the logarithm of the volume factor: $\Gamma^\mu{}_{\mu\nu} = \partial_\nu\ln\sqrt{|g|}$.`,
          explain: t`$\Gamma^\mu{}_{\mu ${c.idx}} = \partial_{${c.idx}}\ln(${c.sq}) = ${c.tex}$. This identity is why the covariant divergence is $\nabla_\mu V^\mu = \tfrac{1}{\sqrt{|g|}}\partial_\mu(\sqrt{|g|}\,V^\mu)$ (step 10) — no Christoffel symbols needed, only the volume factor.`,
          visual: spherePic([{ param: ['sin(1.1)*cos(t)', 'sin(1.1)*sin(t)', 'cos(1.1)'], t: [0, 6.2832], color: 'gold', width: 2 }, { param: ['sin(t)*cos(0.5)', 'sin(t)*sin(0.5)', 'cos(t)'], t: [0.05, 3.09], color: 'violet', width: 2 }], t`A sphere of fixed $r$ with a circle of latitude (gold) and a meridian (violet). The area of a small patch is $r^2\sin\theta\,d\theta\,d\phi$: the volume factor $\sqrt{|g|}$ at work. Drag to rotate.`),
        };
      },
    }),
    mcq({
      id: 'inverse-error', difficulty: 2, kind: 'error',
      prompt: t`A student computes $\Gamma^\phi{}_{\theta\phi}$ for a sphere of radius $a$ ($g_{\phi\phi} = a^2\sin^2\theta$) and writes $$\Gamma^\phi{}_{\theta\phi} = \tfrac12\,g_{\phi\phi}\,\partial_\theta g_{\phi\phi} = \tfrac12\,(a^2\sin^2\theta)(2a^2\sin\theta\cos\theta) = a^4\sin^3\theta\cos\theta.$$ Where is the mistake?`,
      choices: [
        t`The formula needs the inverse metric, $g^{\phi\phi} = 1/(a^2\sin^2\theta)$, not $g_{\phi\phi}$ — which gives $\cot\theta$`,
        t`The $\tfrac12$ should be a 2`,
        t`$\partial_\theta g_{\phi\phi}$ is zero, because $g_{\phi\phi}$ does not depend on $\phi$`,
        t`$\Gamma^\phi{}_{\theta\phi}$ must vanish, because the sphere looks the same in every direction`,
      ],
      answer: 0,
      why: {
        1: t`The $\tfrac12$ is right: the bracket here is $\partial_\theta g_{\phi\phi} + 0 - 0$, and half of it times $g^{\phi\phi}$ gives $\cot\theta$.`,
        2: t`The derivative is with respect to $\theta$, and $g_{\phi\phi} = a^2\sin^2\theta$ certainly depends on $\theta$.`,
        3: 'Symbols depend on the coordinates; with latitude–longitude angles they are not zero, even though every point of a sphere is like every other.',
      },
      hints: ['Check the position of the indices on the metric in the formula.', t`A sense check: should a symbol for angle coordinates depend on the radius $a$ at all?`],
      teach: t`The Christoffel formula raises an index with the inverse metric; on a diagonal metric that means dividing by $g_{\lambda\lambda}$, never multiplying.`,
      explain: t`With $g^{\phi\phi} = 1/(a^2\sin^2\theta)$: $\Gamma^\phi{}_{\theta\phi} = \tfrac12\cdot\tfrac{1}{a^2\sin^2\theta}\cdot2a^2\sin\theta\cos\theta = \cot\theta$. The student's answer carries units of $a^4$ — impossible for a symbol whose indices are all angles.`,
      visual: sphereBasis(0.7, t`The sphere's basis vectors at P: $\mathbf e_\phi$ (blue) has length $a\sin\theta$, $\mathbf e_\theta$ (violet) length $a$.`),
    }),
    mcq({
      id: 'cylinder', difficulty: 1,
      prompt: t`A cylinder of radius $a$ has $ds^2 = a^2\,d\phi^2 + dz^2$. What are its Christoffel symbols?`,
      choices: [
        'All zero: no metric component depends on φ or z — the cylinder is a flat sheet rolled up',
        t`$\Gamma^\phi{}_{\phi\phi} = 1/a$, because the cylinder is round`,
        'They are not zero, because the cylinder is visibly curved',
        'They cannot be defined, because φ comes back to itself after 2π',
      ],
      answer: 0,
      why: {
        1: t`$g_{\phi\phi} = a^2$ is a constant, so every derivative in the formula is zero.`,
        2: 'That curving is extrinsic — how the sheet sits in space. Measured from inside (lengths and angles on the surface), nothing has changed from a flat sheet.',
        3: 'Periodic coordinates are fine; only a coordinate that misbehaves (like φ at a sphere’s pole) causes trouble.',
      },
      hints: ['Which metric components depend on a coordinate?'],
      teach: 'Constant metric components mean every Christoffel symbol vanishes: a cylinder is intrinsically flat.',
      explain: t`Every $\partial_\sigma g_{\mu\nu} = 0$, so every $\Gamma = 0$. Its geodesics, $\ddot\phi = \ddot z = 0$, are helices — straight lines on the unrolled sheet. General relativity's curvature is this intrinsic kind: what an inhabitant could measure, not how the surface bends in a space around it.`,
      visual: surfacePic({ mode: 'basis', surface: 'cylinder', v: 0.2 }, t`A cylinder with its basis vectors at P (blue $\mathbf e_\phi$, violet $\mathbf e_z$) and their copies a step away: unchanged in length, and no turning that an inhabitant could detect. Colour: Gaussian curvature, zero.`),
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-cone', difficulty: 2,
      gen(r) {
        const [deg, s2, s2TeX] = r.pick([[30, 0.25, t`\tfrac14`], [45, 0.5, t`\tfrac12`], [60, 0.75, t`\tfrac34`]]);
        return {
          prompt: t`A cone of half-angle $\alpha = ${deg}^\circ$, measured with $s$, the distance from the tip along the surface, and the angle $\phi$ around it, has $d\ell^2 = ds^2 + s^2\sin^2\alpha\,d\phi^2$ (here $\sin^2\alpha = ${s2TeX}$). Find $\Gamma^s{}_{\phi\phi}$.`,
          answer: `-${s2}*s`, answerTeX: t`-${s2TeX}\,s`, lhs: t`\Gamma^s{}_{\phi\phi}`,
          vars: { s: [0.5, 3] },
          errors: [{ answer: `${s2}*s`, feedback: 'Check the sign of the “minus” term.' }, { answer: '-s', feedback: t`That is the flat plane's $-r$; $g_{\phi\phi}$ here carries $\sin^2\alpha = ${s2TeX}$.` }],
          hints: [t`$\Gamma^s{}_{\phi\phi} = -\tfrac12\,g^{ss}\,\partial_s g_{\phi\phi}$ with $g^{ss} = 1$.`],
          teach: t`For a diagonal metric, $\Gamma^\lambda{}_{\mu\mu} = -\tfrac12 g^{\lambda\lambda}\partial_\lambda g_{\mu\mu}$ when $\lambda \neq \mu$.`,
          explain: t`$\Gamma^s{}_{\phi\phi} = -\tfrac12\,\partial_s(s^2\sin^2\alpha) = -s\sin^2\alpha = -${s2TeX}\,s$. A cone is a flat sheet with a wedge removed: these symbols are those of polar coordinates with the angle rescaled, and its curvature is zero everywhere except the tip.`,
          visual: surfacePic({ mode: 'basis', surface: 'cone', v: 1.3 }, t`A cone (drawn with half-angle 30°) with the basis vectors at P: blue $\mathbf e_\phi$, violet $\mathbf e_s$. Colour: Gaussian curvature, zero away from the tip.`),
        };
      },
    }),
    num({
      id: 'cp-starship', difficulty: 3, transfer: true,
      gen(r) {
        const [label, a] = r.pick([['1 g, 9.81 m/s²', 9.81], ['2 g, 19.6 m/s²', 19.62], ['0.5 g, 4.9 m/s²', 4.905], ['10 g, 98.1 m/s²', 98.1]]);
        const rho = (C * C) / a;
        return {
          prompt: t`In Rindler coordinates ($c = 1$), $ds^2 = -\rho^2\,d\eta^2 + d\rho^2$ and $\Gamma^\rho{}_{\eta\eta} = \rho$. An observer at fixed $\rho$ has $u^\eta = 1/\rho$, so to stay put they must accelerate at $\Gamma^\rho{}_{\eta\eta}(u^\eta)^2 = 1/\rho$ — in SI units, $a = c^2/\rho$. A starship accelerates steadily at ${label}. Light from events more than a distance $\rho = c^2/a$ behind it can never catch up: its **Rindler horizon**. How far behind the ship is that, in light-years?`,
          answer: rho / LY, units: 'ly', tol: { rel: 0.01 },
          errors: [{ value: C / a / LY, feedback: t`Square $c$: $\rho = c^2/a$.` }, { value: rho, feedback: 'That is in metres; divide by 9.461 × 10¹⁵ m per light-year.' }],
          hints: [t`$\rho = c^2/a = (2.998\times10^{8})^2/a$ in metres.`, 'Divide by 9.461 × 10¹⁵ m per light-year.'],
          teach: t`The Christoffel symbol $\Gamma^\rho{}_{\eta\eta} = \rho$ of flat spacetime in accelerated coordinates is the "gravity" an accelerating crew feels: $a = c^2/\rho$.`,
          explain: t`$\rho = c^2/a = ${sci(rho, 3)}$ m $= ${sci(rho / LY, 3)}$ ly. Signals sent toward the ship from farther behind than that never arrive while it keeps accelerating (at 1 g the distance is about 0.97 ly) — an event horizon in perfectly flat spacetime, made by the ship's motion alone.`,
          visual: rindler(t`Rindler observers in flat spacetime ($c = 1$): the ship rides one hyperbola; the dashed horizon lies a distance $c^2/a$ behind it. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'cp-torsion', difficulty: 3,
      prompt: t`General relativity uses a connection that is symmetric in its lower indices, $\Gamma^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\nu\mu}$. What makes that the physically right choice?`,
      choices: [
        t`The equivalence principle: freely falling coordinates must make every $\Gamma$ vanish at a point, and an antisymmetric part (torsion) is a tensor, which no change of coordinates can remove`,
        'The metric is symmetric, so every connection built on it is automatically symmetric',
        'Christoffel symbols are tensors, and tensors are always symmetric',
        'Nothing physical: it only shortens the formula',
      ],
      answer: 0,
      why: {
        1: 'Connections with torsion can be compatible with a symmetric metric too; symmetry of g does not force symmetry of Γ.',
        2: 'Christoffel symbols are not tensors, and tensors need not be symmetric (the electromagnetic field tensor is antisymmetric).',
        3: 'It is physics: a torsion part would survive in every freely falling frame and spoil the equivalence principle.',
      },
      hints: ['What must be true of Γ in a freely falling laboratory, at its centre?', t`The difference of two connections is a tensor. What is $\Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\nu\mu}$?`],
      teach: 'Freely falling frames remove the connection at a point; that is only possible if its antisymmetric part, a tensor, is zero.',
      explain: t`The torsion $T^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\nu\mu}$ transforms as a tensor, so if it were non-zero in one frame it would be non-zero in all, including the freely falling one. Setting it to zero, and demanding $\nabla g = 0$, leaves exactly the Christoffel formula.`,
      visual: { type: 'gr-elevator', params: { mode: 'falling' }, caption: 'A box falling freely near Earth: inside it, released balls float — the connection is zero at its centre. Press Release.' },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §3.2 (the Christoffel connection)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Carroll, Spacetime and Geometry, §3.2', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
