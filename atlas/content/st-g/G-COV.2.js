// General covariance and its limits, honestly. Einstein's principle (laws as
// tensor equations, true in every chart) and Kretschmann's 1917 objection:
// any theory can be written that way — special relativity with g_μν and
// R^ρ_σμν = 0, Newtonian gravity in Cartan's form — so covariance alone has no
// physical content. What general relativity adds is no prior geometry: the
// metric is dynamical, and diffeomorphisms are a gauge symmetry (the hole
// argument). Coordinate artifacts against geometry: Schwarzschild's g_rr blows
// up at r = 2M while the invariant K = 48M²/r⁶ is finite (3c⁸/4(GM)⁴ in SI;
// 1.6 × 10⁻¹⁷ m⁻⁴ for 10 M☉); the Rindler horizon c²/g in flat spacetime.
// The comma → semicolon rule is ambiguous because ∇'s do not commute.
// Transfer: tidal stretch at the horizon, L c⁶/4(GM)².
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { tex, nice } from '../../src/core/format.js';

const t = String.raw;
const C = 299792458, GM_SUN = 1.32712440018e20, LY = 9.4607304725808e15;

// Schwarzschild components and the Kretschmann scalar against r (units of M, G = c = 1)
const schwarzPic = (extra = {}) => ({
  x: [0.6, 6], y: [-3, 6], aspect: 'wide', xlabel: 'r (units of M)', ylabel: '',
  curves: [
    { fn: '1/(1 - 2/x)', domain: [2.05, 6], color: 'accent', width: 2.2, label: 'g_rr = 1/(1 − 2M/r)', labelAt: 2.6, labelDx: 8, labelDy: -4 },
    { fn: '1/(1 - 2/x)', domain: [0.6, 1.95], color: 'accent', width: 2.2 },
    { fn: '48/x^6', domain: [1.12, 6], color: 'gold', width: 2.4, label: 'K M⁴ = 48M⁶/r⁶', labelAt: 1.25, labelDx: 10, labelDy: 0 },
  ],
  vlines: [{ x: 2, color: 'bad', label: 'r = 2M' }],
  hlines: [{ y: 0, color: 'ink4' }],
  ...extra,
});

export default lesson({
  id: 'st-g.G-COV.2',
  title: 'General covariance and its limits',
  minutes: 14, difficulty: 4,
  intro: t`Einstein made **general covariance** a founding principle: the laws of physics are tensor equations on a manifold, so a law true in one coordinate system is true in all. In 1917 Erich Kretschmann objected that this is **no restriction on physics at all**: with enough effort *any* theory can be written covariantly — special relativity, even Newtonian gravity. Einstein agreed. What general relativity really adds is subtler: its geometry is **dynamical**. In special relativity the metric is fixed in advance (“prior geometry”, $R^\rho{}_{\sigma\mu\nu} = 0$ imposed); in general relativity it is solved for:

$$G_{\mu\nu} = 8\pi T_{\mu\nu}, \qquad K = R_{\alpha\beta\gamma\delta}R^{\alpha\beta\gamma\delta}$$

Because coordinates are then pure labels, anything a coordinate system says can be an artifact. Invariants such as the Kretschmann scalar $K$ (same Kretschmann, different idea) tell geometry from bookkeeping. This lesson is about where the principle earns its keep and where it is empty — with $G = c = 1$ unless SI is said.`,
  symbols: [
    { tex: 'G_{\\mu\\nu}', text: t`the Einstein tensor, built from the metric and its first two derivatives` },
    { tex: 'T_{\\mu\\nu}', text: 'the stress–energy tensor of matter and fields' },
    { tex: 'R_{\\alpha\\beta\\gamma\\delta}', text: 'the Riemann curvature tensor, all indices lowered' },
    { tex: 'K', text: t`the Kretschmann scalar, a curvature invariant: every coordinate system gives it the same value at a point` },
    { tex: 'R^\\rho{}_{\\sigma\\mu\\nu} = 0', text: 'flatness: the condition special relativity imposes in advance' },
  ],
  why: 'Knowing what general covariance does and does not say keeps you from two classic errors: mistaking a coordinate singularity for a physical one, and believing that writing a theory in tensors makes it a theory of gravity.',
  visual: {
    type: 'graph',
    title: 'A coordinate singularity beside an invariant',
    lead: t`Outside a mass $M$, the Schwarzschild metric component $g_{rr} = 1/(1 - 2M/r)$ (blue) blows up at $r = 2M$. The Kretschmann scalar $K = 48M^2/r^6$ (gold, in units of $M^{-4}$) — a number every coordinate system agrees on — sails smoothly through.`,
    tasks: [
      t`Read the gold curve at $r = 2M$: $K = 48/64 = 0.75\,M^{-4}$, finite. Nothing physical happens at the horizon; the blue divergence belongs to the coordinates.`,
      t`Follow the gold curve inward: it does diverge at $r = 0$. That singularity no change of coordinates can remove.`,
      t`Switch to ingoing Eddington–Finkelstein coordinates: their components ($g_{vv} = -(1 - 2M/r)$ and $g_{vr} = 1$) are finite at $r = 2M$. Same spacetime, new labels, no blow-up.`,
    ],
    params: schwarzPic({
      choices: [{ key: 'ef', label: 'Coordinates', options: [[0, 'Schwarzschild (t, r)'], [1, 'Eddington–Finkelstein (v, r)']], value: 0, explain: 'Two charts on the same spacetime outside and across the horizon.' }],
      curves: [
        { fn: '1/(1 - 2/x)', domain: [2.05, 6], color: 'accent', width: 2.2, label: 'g_rr = 1/(1 − 2M/r)', labelAt: 2.6, labelDx: 8, labelDy: -4, when: '1 - ef' },
        { fn: '1/(1 - 2/x)', domain: [0.6, 1.95], color: 'accent', width: 2.2, when: '1 - ef' },
        { fn: '-(1 - 2/x)', domain: [0.6, 6], color: 'teal', width: 2.2, label: 'g_vv = −(1 − 2M/r)', labelAt: 4.4, labelDx: 4, labelDy: 14, when: 'ef' },
        { fn: '1', domain: [0.6, 6], color: 'violet', width: 2.2, label: 'g_vr = 1', labelAt: 5.2, labelDy: -8, when: 'ef' },
        { fn: '48/x^6', domain: [1.12, 6], color: 'gold', width: 2.4, label: 'K M⁴ = 48M⁶/r⁶', labelAt: 1.25, labelDx: 10, labelDy: 0 },
      ],
      readouts: [{ label: t`$K$ at $r = 2M$, in $M^{-4}$`, expr: '48/64', digits: 3 }],
    }),
    caption: t`Exact Schwarzschild expressions with $G = c = 1$, clipped to the window. Eddington–Finkelstein: $ds^2 = -(1 - 2M/r)\,dv^2 + 2\,dv\,dr + r^2d\Omega^2$.`,
  },
  example: {
    prompt: t`Write special relativity in a generally covariant form, and say what — if not covariance — distinguishes general relativity from it.`,
    visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', shape: 'segment', readout: false }, caption: 'Flat space under a curvilinear grid: the components of the metric change, the geometry does not.' },
    steps: [
      { label: 'Start in Cartesian form', text: t`A free scalar field obeys $\eta^{\mu\nu}\partial_\mu\partial_\nu\phi = 0$ in inertial coordinates — Lorentz covariant, but not covariant under general coordinate changes.` },
      { label: 'Go to any chart', text: t`In arbitrary coordinates the metric is $g_{\mu\nu} = \tfrac{\partial x^\alpha}{\partial x'^\mu}\tfrac{\partial x^\beta}{\partial x'^\nu}\eta_{\alpha\beta}$, and $\partial$ must become $\nabla$: $g^{\mu\nu}\nabla_\mu\nabla_\nu\phi = 0$. Add the condition $R^\rho{}_{\sigma\mu\nu} = 0$ to say the spacetime is flat. Every piece is a tensor: special relativity is now generally covariant.` },
      { label: 'Kretschmann’s point', text: t`So general covariance cannot be what makes general relativity a theory of gravity. Cartan did the same for Newton (1923): Newtonian gravity as a curved connection with absolute time — also covariant.` },
      { label: 'The real difference', text: t`In the covariant special relativity, $g_{\mu\nu}$ is fixed in advance by $R^\rho{}_{\sigma\mu\nu} = 0$: **prior geometry**, the same whatever the matter does. In general relativity $g_{\mu\nu}$ is determined by $G_{\mu\nu} = 8\pi T_{\mu\nu}$ — no prior geometry, and the geometry responds to matter (Anderson’s formulation).` },
      { label: 'Consequence', text: t`With no fixed background, moving all fields together by a diffeomorphism gives a physically identical spacetime: diffeomorphisms are a **gauge** symmetry. Coordinates (and even “the point $p$” of the manifold) carry no physics by themselves.` },
    ],
    answer: t`$g^{\mu\nu}\nabla_\mu\nabla_\nu\phi = 0$ with $R^\rho{}_{\sigma\mu\nu} = 0$ is generally covariant special relativity. What sets general relativity apart is not covariance but that the metric is dynamical — no prior geometry — which makes diffeomorphisms a gauge freedom.`,
  },
  practice: [
    num({
      id: 'kretschmann', difficulty: 3,
      gen(r) {
        const [what, m] = r.pick([['a 10 M☉ black hole', 10], ['the 62 M☉ remnant of GW150914', 62], ['Sagittarius A* (4.3 × 10⁶ M☉)', 4.3e6], ['M87* (6.5 × 10⁹ M☉)', 6.5e9]]);
        const GM = GM_SUN * m, ans = (3 * C ** 8) / (4 * GM ** 4);
        return {
          prompt: t`In SI units the Kretschmann scalar outside a mass $M$ is $K = \dfrac{48G^2M^2}{c^4r^6}$, which at the horizon $r_s = 2GM/c^2$ becomes $K = \dfrac{3c^8}{4(GM)^4}$. Evaluate it at the horizon of ${what}, in $\text{m}^{-4}$ (use $GM_\odot = ${tex(GM_SUN, 6)}\ \text{m}^3/\text{s}^2$).`,
          visual: { type: 'graph', params: schwarzPic(), caption: 'The same invariant in units of M (G = c = 1): finite at r = 2M for every mass. In SI, its size there falls as M⁻⁴.' },
          answer: ans, units: 'm^-4', tol: { rel: 0.01 },
          errors: [{ value: (48 * C ** 8) / (4 * GM ** 4), feedback: t`Substituting $r_s^6 = 64(GM)^6/c^{12}$ gives $48/64 = 3/4$, not $48/4$.` }],
          hints: [t`$GM = ${tex(GM, 4)}\ \text{m}^3/\text{s}^2$ and $c^8 = ${tex(C ** 8, 4)}\ \text{m}^8/\text{s}^8$.`, t`$K = 0.75\,c^8/(GM)^4$.`],
          teach: 'A curvature invariant is finite at the Schwarzschild horizon, and smaller for bigger black holes: the horizon is a coordinate singularity, not a curvature one.',
          explain: t`$K = ${tex(ans, 3)}\ \text{m}^{-4}$ — finite. ${m > 1e5 ? 'For a supermassive hole the horizon is gentler than a laboratory centrifuge’s tidal field; nothing marks it locally.' : 'Large, but finite: the infinity of g_rr was the coordinates’ doing.'}`,
        };
      },
    }),
    mcq({
      id: 'objection', difficulty: 3,
      prompt: t`Kretschmann objected in 1917 that general covariance is physically empty. What was his argument, and what is the usual response?`,
      visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', shape: 'circle', centre: [2, 1], radius: 1.5, readout: false }, caption: 'Flat geometry in curvilinear coordinates: covariance lets any theory use any chart.' },
      choices: ['Any theory, special relativity and Newtonian gravity included, can be rewritten in generally covariant form; the physical content of general relativity is rather that the metric is dynamical (no prior geometry)', 'General covariance contradicts the equivalence principle, so general relativity is inconsistent', 'Tensor equations cannot describe gravity, so Einstein had to give up covariance', 'Covariant equations have no solutions in curved spacetime'],
      answer: 0,
      why: {
        1: 'The two principles are compatible; Kretschmann’s point was about content, not consistency.',
        2: 'General relativity is written entirely in tensor equations; it kept covariance.',
        3: 'Schwarzschild, Kerr and FLRW are solutions of covariant equations.',
      },
      hints: ['Think of special relativity written with gμν, ∇ and R = 0 imposed. Is it covariant?', 'Anderson (1967) relocated the content: absolute (prior) objects versus dynamical ones.'],
      teach: 'General covariance by itself restricts nothing — any theory can be made covariant; what distinguishes general relativity is the absence of prior geometry.',
      explain: 'Einstein conceded the formal point and kept covariance as a heuristic: among covariant theories, simplicity singles out his. The modern statement of the content is background independence: no fixed, non-dynamical geometric objects.',
    }),
    multi({
      id: 'which-real', difficulty: 3,
      prompt: 'Which of these are coordinate artifacts rather than real (curvature) singularities?',
      visual: { type: 'graph', params: schwarzPic(), caption: 'Schwarzschild: a metric component and a curvature invariant (G = c = 1).' },
      choices: [t`Schwarzschild’s $g_{rr} \to \infty$ at $r = 2M$`, t`The origin $r = 0$ of polar coordinates on the flat plane, where $\det g = r^2 = 0$`, t`The Rindler horizon of a uniformly accelerated observer in flat spacetime`, t`$r = 0$ in Schwarzschild, where $K = 48M^2/r^6 \to \infty$`, t`The big-bang limit $a \to 0$ of a matter-filled FLRW universe, where the density diverges`],
      answer: [0, 1, 2],
      why: {
        3: t`A curvature invariant diverges there; no coordinate change can make an invariant finite.`,
        4: t`Curvature invariants diverge with the density ($R \propto \rho$): a genuine singularity of the model.`,
      },
      hints: ['Ask whether any curvature invariant blows up there.', 'Flat spacetime has zero curvature everywhere, whatever its coordinates do.'],
      teach: 'Coordinate singularities disappear in a better chart; curvature singularities show up in invariants that no chart can tame.',
      explain: t`$r = 2M$, the polar origin and the Rindler horizon all have finite (or zero) curvature invariants: new coordinates — Eddington–Finkelstein, Cartesian, Minkowski — remove them. Schwarzschild $r = 0$ and the big bang have divergent invariants.`,
    }),
    mcq({
      id: 'comma', difficulty: 4,
      prompt: t`In flat spacetime the Maxwell equation can be written $\partial_\mu\partial^\mu A^\nu - \partial^\nu\partial_\mu A^\mu = -J^\nu$, or equally with the derivatives in the second term in the other order, $\partial_\mu\partial^\nu A^\mu$. Turning commas into semicolons, the two versions give different equations in curved spacetime. Why?`,
      visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 90, colat: 90, readout: false }, caption: 'Parallel transport round a loop on a sphere: the arrow comes back turned. On a curved space, covariant derivatives do not commute.' },
      choices: [t`Partial derivatives commute but covariant ones do not: $[\nabla_\mu, \nabla_\nu]A^\rho = R^\rho{}_{\sigma\mu\nu}A^\sigma$, so the two orderings differ by a Ricci term $R^\nu{}_\mu A^\mu$`, 'Because the comma-to-semicolon rule only applies to scalars', t`Because $J^\nu$ is not a tensor in curved spacetime`, 'They do not differ: the rule is unambiguous'],
      answer: 0,
      why: {
        1: 'It is applied to tensors of every rank — that is its point; the trouble is the ordering of second derivatives.',
        2: t`$J^\nu$ is a perfectly good vector.`,
        3: t`They differ by $R^\nu{}_\mu A^\mu$, which vanishes only where the Ricci tensor does.`,
      },
      hints: ['In flat space ∂μ∂ν = ∂ν∂μ, so both forms agree. What replaces that in curved space?', t`The commutator of covariant derivatives is the Riemann tensor.`],
      teach: 'The comma-to-semicolon rule is ambiguous whenever second derivatives appear, because covariant derivatives do not commute; the ambiguity is a curvature coupling.',
      explain: t`Writing Maxwell as $\nabla_\mu F^{\mu\nu} = -J^\nu$ with $F = dA$ removes the ambiguity (and keeps gauge invariance); the other ordering adds a term $R^\nu{}_\mu A^\mu$. For a scalar field the same ambiguity allows a coupling $\xi R\phi^2$. Principles beyond covariance — simplicity, gauge invariance, an action — must choose.`,
    }),
    mcq({
      id: 'hole', difficulty: 4,
      prompt: t`Einstein’s hole argument: take a solution $g$ and a diffeomorphism $\varphi$ that is the identity outside a small region (the “hole”) but moves points inside it. Then $\varphi^*g$ is also a solution, with the same matter and the same fields everywhere outside the hole. Which conclusion do relativists draw?`,
      visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-1.6, 1.6], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves: [...[-1.2, -0.6, 0, 0.6, 1.2].map((y0) => ({ param: ['t', `${y0} + 0.35*exp(-(t^2 + ${y0 * y0})/0.6)*sin(2*t)`], t: [-3.2, 3.2], color: 'accent', width: 1.4 })), ...[-2.4, -1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8, 2.4].map((x0) => ({ param: [`${x0} + 0.35*exp(-(${x0 * x0} + t^2)/0.6)*cos(2*t)`, 't'], t: [-1.6, 1.6], color: 'accent', width: 1.4 })), { param: ['1.1*cos(t)', '1.1*sin(t)'], t: [0, 6.2832], color: 'gold', dash: true, width: 1.6, label: 'the hole', labelAt: 0.8, labelDx: 6 }] }, caption: 'Grid lines dragged around by a diffeomorphism that is the identity outside the dashed hole (the deformation is exaggerated and illustrative).' },
      choices: ['The two solutions describe the same physical spacetime: manifold points have no identity apart from the fields on them, so diffeomorphisms are gauge', 'General relativity is indeterministic: the field inside the hole is not fixed by the field outside', 'Only one of the two is physical, and an experiment can tell which', 'General covariance must be abandoned'],
      answer: 0,
      why: {
        1: 'That was Einstein’s worry in 1913; it dissolves once the two solutions are recognized as the same state, as with two gauge-equivalent potentials in electromagnetism.',
        2: 'Every observable — every invariant, every relation between fields and matter — is the same in both. No experiment distinguishes them.',
        3: 'Einstein briefly drew this conclusion in 1913–14 and then abandoned it; the resolution keeps covariance.',
      },
      hints: ['Compare every measurable quantity in the two solutions: coincidences of worldlines, invariants, readings of clocks.', 'Electromagnetism has the same structure with A and A + dλ.'],
      teach: 'The hole argument shows diffeomorphisms must be treated as gauge: physical states are equivalence classes of metrics, and spacetime points are individuated only by what happens at them.',
      explain: t`Einstein’s “point-coincidence” resolution (1915): physics lives in coincidences — which worldlines meet, what clocks read there — and those are identical in $g$ and $\varphi^*g$. So general relativity is deterministic up to gauge, just like electromagnetism.`,
    }),
    num({
      id: 'rindler', difficulty: 2,
      gen(r) {
        const [what, g] = r.pick([['1 g (9.81 m/s²)', 9.81], ['a 3 g rocket burn (29.4 m/s²)', 29.43], ['a 0.1 g ion-drive-style cruise (0.981 m/s²)', 0.981], ['a 10 g abort motor (98.1 m/s²)', 98.1]]);
        const ans = (C * C) / g / LY;
        return {
          prompt: t`An observer accelerating uniformly through *flat* spacetime has a horizon behind them at distance $c^2/g$: light from beyond it never catches up. For an acceleration of ${what}, how far is it, in light-years?`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-1.6, 1.6], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ fn: 'x', color: 'warn', dash: true, width: 1.2, label: 'horizon', labelAt: 1.4, labelDx: 6 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 }, { param: ['cosh(t)', 'sinh(t)'], t: [-1.5, 1.5], color: 'gold', width: 2.4, label: 'accelerated worldline', labelAt: 0.6, labelDx: 8 }] }, caption: t`Flat spacetime ($c = 1$): a uniformly accelerated worldline (a hyperbola) and its horizon, the light cone it never crosses. Units are $c^2/g$.` },
          answer: ans, units: 'ly', tol: { rel: 0.005 },
          errors: [{ value: (C / g) / LY, feedback: t`$c/g$ is a time (the time to reach near light speed); the distance is $c^2/g$.` }],
          hints: [t`$c^2/g = (2.998\times10^8)^2/${g}$ metres; one light-year is $${tex(LY, 5)}\ \text{m}$.`],
          teach: 'A horizon can be a property of an observer’s coordinates in perfectly flat spacetime — curvature is not needed to have one.',
          explain: t`$c^2/g = ${tex((C * C) / g, 3)}\ \text{m} = ${nice(ans, 3)}$ light-years. The Rindler horizon is a coordinate horizon; every curvature invariant there is zero. The Schwarzschild horizon is also locally unremarkable — but it is the same for every outside observer, which makes it a property of the spacetime.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tidal', difficulty: 3, transfer: true,
      gen(r) {
        const [what, m] = r.pick([['a 10 M☉ black hole', 10], ['Sagittarius A* (4.3 × 10⁶ M☉)', 4.3e6], ['M87* (6.5 × 10⁹ M☉)', 6.5e9], ['a 62 M☉ black hole', 62]]);
        const GM = GM_SUN * m, L = 2, ans = (L * C ** 6) / (4 * GM * GM);
        return {
          prompt: t`What an astronaut feels at a horizon is the tidal stretch across their body, a physical (coordinate-free) effect: $\Delta a = 2GML/r^3$ for length $L$ along the radius. At $r_s = 2GM/c^2$ this is $\Delta a = Lc^6/4(GM)^2$. For a $2\ \text{m}$ astronaut at the horizon of ${what}, find $\Delta a$ in $\text{m/s}^2$.`,
          visual: { type: 'gr-dustball', params: { mode: 'tides', body: m === 4.3e6 ? 'sgra' : 'bh', readout: false }, caption: 'A freely falling ball of dust near a black hole: stretched along the radius, squeezed across it. The size of the effect is the question.' },
          answer: ans, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: (L * C ** 6) / (8 * GM * GM), feedback: t`$2GML/r_s^3$ with $r_s^3 = 8(GM)^3/c^6$ gives $Lc^6/4(GM)^2$: check the factor.` }],
          hints: [t`$GM = ${tex(GM, 4)}\ \text{m}^3/\text{s}^2$, $c^6 = ${tex(C ** 6, 4)}\ \text{m}^6/\text{s}^6$.`, t`$\Delta a = 2\cdot c^6/(4(GM)^2)$ for $L = 2\ \text{m}$.`],
          teach: 'Tidal acceleration is curvature you can feel; at a horizon it falls as 1/M², so a big enough black hole’s horizon is crossed without noticing.',
          explain: t`$\Delta a = ${tex(ans, 3)}\ \text{m/s}^2$ — ${ans > 1e4 ? 'lethal: spaghettification well outside the horizon' : 'imperceptible: the horizon is locally unremarkable, as the finite invariants promised'}. Covariance’s lesson in one number: what matters physically is what every observer agrees on.`,
        };
      },
    }),
    mcq({
      id: 'cp-honest', difficulty: 3,
      prompt: 'A popular article says: “Einstein’s great insight was that the laws of physics must be the same in all coordinate systems, and that alone forces gravity to be curvature.” How accurate is that?',
      choices: ['Overstated: any theory can be written in every coordinate system; what general relativity adds is a dynamical metric with no prior geometry, plus the equivalence principle that ties gravity to that metric', 'Exactly right: covariance alone implies Einstein’s equations', 'Wrong in the other direction: general relativity is not covariant', 'Right, because covariance forbids flat spacetime'],
      answer: 0,
      why: {
        1: 'Covariant theories with prior geometry (covariant special relativity, Nordström’s scalar gravity in geometric form) exist; covariance alone does not single out Einstein’s equations.',
        2: 'General relativity is generally covariant; the issue is only what that buys.',
        3: 'Minkowski spacetime is a solution of the covariant Einstein equations (with no matter).',
      },
      hints: ['Recall Kretschmann.', 'What ingredients do lead to Einstein’s equations? (No prior geometry, the equivalence principle, second-order equations, Lovelock’s theorem in 4D.)'],
      teach: 'General covariance is a formal requirement any theory can meet; gravity-as-curvature comes from the equivalence principle and a dynamical metric with no prior geometry.',
      explain: 'Einstein’s equations follow from a dynamical metric, the equivalence principle, and the demand for second-order equations (Lovelock: in 4D, G_μν + Λg_μν is then essentially unique). Covariance is the language; these are the physics.',
    }),
  ],
  sources: [
    { label: 'Norton, General covariance and the foundations of general relativity: eight decades of dispute, Rep. Prog. Phys. 56, 791 (1993)', url: 'https://doi.org/10.1088/0034-4885/56/7/001' },
    { label: 'Kretschmann, Über den physikalischen Sinn der Relativitätspostulate, Ann. Phys. 358, 575 (1917)', url: 'https://doi.org/10.1002/andp.19183581602' },
    { label: 'Stanford Encyclopedia of Philosophy: The Hole Argument', url: 'https://plato.stanford.edu/entries/spacetime-holearg/' },
    { label: 'Carroll, Spacetime and Geometry (Addison-Wesley, 2004), §§4.1, 5.7 (minimal coupling; Kretschmann scalar)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
