// Null, weak, strong and dominant energy conditions — Derivation Mode. Perfect
// fluid in its rest frame, T = diag(ρc², p, p, p); observer t = γ(1, β n̂):
// T(t,t) = γ²(ρc² + p) − p; null k = (1, n̂): T(k,k) = ρc² + p; trace −ρc² + 3p,
// SEC combination γ²(ρc² + p) + (p − ρc²)/2; DEC flux −T^μ_ν t^ν = γ(ρc², −βp n̂),
// causal for all β iff ρc² ≥ |p| (w = 2: spacelike for β > ½). Radiation seen at
// speed v: ρc²(1 + v²/3c²)/(1 − v²/c²); Λ: ρc² for every observer; phantom w:
// zero at β = √(−1/w). Casimir T = A diag(−1, 1, 1, −3), A = π²ħc/(720d⁴):
// T(k,k) = −4A cos²θ. Scalar field (c = 1): ρ + p = φ̇² ≥ 0 always, ρ + 3p =
// 2(φ̇² − V), ρ − p = 2V; T(k,k) = (k·∂φ)². Raychaudhuri, no shear or twist, vacuum:
// θ = 2θ₀/(2 + θ₀λ), area ∝ (1 + θ₀λ/2)². All checked in SymPy (scratch v33.py).
import { lesson, mcq, multi, num, expr, code } from '../../src/core/content.js';
import { C, G, HBAR, MPC, sci, round } from './_derivlate.js';

const t = String.raw;

// ── numbers ─────────────────────────────────────────────────────────────────

const casimirA = (d) => (Math.PI ** 2 * HBAR * C) / (720 * d ** 4);    // J/m³
const H0 = 67.4e3 / MPC;                                               // s⁻¹ (Planck 2018)
const RHO_CRIT = (3 * H0 ** 2) / (8 * Math.PI * G);                    // kg/m³
const RHO_L_C2 = 0.685 * RHO_CRIT * C ** 2;                            // J/m³, vacuum energy today
const THROAT_1M = C ** 4 / (8 * Math.PI * G);                          // J/m³: |ρc²| at a 1 m Ellis throat

// ── pictures ────────────────────────────────────────────────────────────────

// what an observer at speed β measures in a fluid with p = wρc², in units of ρc² (ρ > 0)
const boostPic = ({ w = 0, sliders = false, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [0, 0.95], y: [-4, 6], xlabel: 'observer speed β = v/c', ylabel: 'measured ÷ ρc² at rest', axesAt: 'edge',
    ...(sliders ? {
      sliders: [{ key: 'w', label: 'Equation of state $w = p/(\\rho c^2)$', min: -1.6, max: 1.2, step: 0.01, value: w, explain: 'Pressure over energy density in the fluid’s rest frame: 0 for dust, 1/3 for radiation, −1 for a cosmological constant. The rest-frame density ρ is taken positive.' }],
      readouts: [
        { label: t`null: $1 + w$`, expr: '1 + w', digits: 3 },
        { label: t`strong, at rest: $\tfrac12(1 + 3w)$`, expr: '(1 + 3*w)/2', digits: 3 },
        { label: t`dominant: $1 - |w|$`, expr: '1 - abs(w)', digits: 3 },
      ],
    } : { constants: { w } }),
    curves: [
      { fn: '(1 + w*x^2)/(1 - x^2)', color: 'gold', width: 2.6 },
      { fn: '(1 + w)/(1 - x^2) + (w - 1)/2', color: 'violet', width: 2.2 },
    ],
    hlines: [{ y: 0, color: 'ink3' }],
    points: [
      { x: 0.02, y: 5.4, r: 0.01, color: 'gold', label: 'gold: energy density measured', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: 0.02, y: 4.75, r: 0.01, color: 'violet', label: 'violet: strong-condition combination', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: caption ?? t`What an observer moving at speed $\beta c$ through a perfect fluid measures, in units of the rest-frame $\rho c^2$: the energy density $T_{\mu\nu}t^\mu t^\nu = \gamma^2(\rho c^2 + p) - p$ (gold) and the strong-condition combination $\gamma^2(\rho c^2 + p) + \tfrac12(p - \rho c^2)$ (violet). A condition fails if its curve dips below zero for any speed.`,
});

// the (ρc², p) plane with the four boundaries
const fluidPlane = ({ extra = [], caption } = {}) => ({
  type: 'graph',
  params: {
    x: [-1, 2.6], y: [-2.2, 2.6], xlabel: 'energy density ρc² (arbitrary units)', ylabel: 'pressure p',
    shade: [{ fn: 'x', lower: '-x', from: 0, to: 2.6, color: 'good', alpha: 0.12 }],
    curves: [
      { fn: '-x', color: 'bad', width: 2.2, label: 'null: ρc² + p = 0', labelAt: -0.95, labelDx: 8, labelDy: -8 },
      { fn: '-x/3', color: 'violet', width: 2, dash: true, label: 'strong: ρc² + 3p = 0', labelAt: 1.95, labelDx: 0, labelDy: -10 },
      { fn: 'x', domain: [0, 2.6], color: 'good', width: 2, label: 'dominant: |p| = ρc²', labelAt: 1.9, labelDx: -150, labelDy: -10 },
    ],
    vlines: [{ x: 0, color: 'ink3', label: 'weak: ρ = 0' }],
    points: [
      { x: 1.2, y: 0, color: 'ink', r: 4.5, label: 'dust', labelDx: 10, labelDy: 4 },
      { x: 1.2, y: 0.4, color: 'accent', r: 4.5, label: 'radiation', labelDx: 10, labelDy: 0 },
      { x: 1.2, y: 1.2, color: 'accent2', r: 4.5, label: 'stiff, w = 1', labelDx: 10, labelDy: 14 },
      { x: 1.2, y: -1.2, color: 'gold', r: 4.5, label: 'Λ, w = −1', labelDx: 10, labelDy: -10 },
      { x: 1.2, y: -1.56, color: 'bad', r: 4.5, label: 'phantom, w < −1', labelDx: -10, labelDy: 0, labelAlign: 'right' },
      ...extra,
    ],
  },
  caption: caption ?? t`Perfect fluids in the plane of rest-frame energy density and pressure. The null condition allows everything above the red line; the weak one, the part of that to the right of $\rho = 0$; the strong one, the region above both the red and the dashed violet lines; the dominant one, only the green wedge $\rho c^2 \ge |p|$.`,
});

// conducting plates and a light ray crossing the gap
const TH = (35 * Math.PI) / 180;
const platesPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-2.2, 2.2], y: [-0.45, 1.45], axes: false, grid: false, xlabel: '', ylabel: '', equal: true,
    curves: [
      { fn: '0', domain: [-2, 2], color: 'ink2', width: 6 },
      { fn: '1', domain: [-2, 2], color: 'ink2', width: 6 },
      { param: ['-0.6', 't'], t: [0, 1], color: 'ink3', dash: true, width: 1.4 },
    ],
    arrows: [{ from: [-0.6, 0.04], to: [round(-0.6 + 1.1 * Math.sin(TH), 4), round(0.04 + 1.1 * Math.cos(TH), 4)], color: 'gold' }],
    points: [
      { x: -2, y: -0.2, r: 0.01, color: 'ink3', label: 'conducting plate', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: -2, y: 1.2, r: 0.01, color: 'ink3', label: 'conducting plate', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: -0.66, y: 0.5, r: 0.01, color: 'ink3', label: 'normal z', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: -0.47, y: 0.42, r: 0.01, color: 'gold', label: 'θ', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: round(-0.6 + 1.1 * Math.sin(TH), 4), y: round(0.04 + 1.1 * Math.cos(TH), 4), r: 0.01, color: 'gold', label: 'light ray k', labelAlign: 'left', labelDx: 10, labelDy: 4 },
      { x: 1.5, y: 0.5, r: 0.01, color: 'ink3', label: 'gap d', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption,
});

// a scalar field rolling in its potential (schematic, c = 1)
const scalarPic = {
  type: 'graph',
  params: {
    x: [-2.5, 2.5], y: [-4.5, 7.6], xlabel: 'field value φ', ylabel: 'potential V(φ)', axesAt: 'edge',
    curves: [
      { fn: 'x^2', color: 'accent', width: 2.6 },
      { fn: 'x^2 - 4', color: 'bad', width: 2, dash: true },
    ],
    hlines: [{ y: 0, color: 'ink3' }],
    points: [
      { x: -2.4, y: 7.15, r: 0.01, color: 'accent', label: 'solid: V ≥ 0 everywhere', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: 2.4, y: 7.15, r: 0.01, color: 'bad', label: 'dashed: V dips below zero', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 2.2, y: 4.84, color: 'gold', r: 6, label: 'rolling slowly: V far above φ̇²', labelDx: -12, labelDy: -10, labelAlign: 'right' },
      { x: 0.3, y: 0.09, color: 'ink2', r: 5, label: 'oscillating near the bottom', labelDx: 10, labelDy: 18 },
    ],
  },
  caption: t`A homogeneous scalar field $\phi(t)$ in a potential $V(\phi)$, in units with $c = 1$: $\rho = \tfrac12\dot\phi^2 + V$, $p = \tfrac12\dot\phi^2 - V$. A field held high on its potential (gold) drives inflation; one oscillating about the minimum behaves, on average, like dust. Schematic shapes.`,
};

// a light bundle's cross-section: focusing, and what NEC violation would allow
const focusPic = {
  type: 'graph',
  params: {
    x: [0, 3], y: [0, 1.2], xlabel: 'affine parameter λ, in units of 1/|θ₀|', ylabel: 'bundle area ÷ starting area', axesAt: 'edge',
    curves: [
      { fn: '(1 - x/2)^2', domain: [0, 2], color: 'gold', width: 2.6 },
      { fn: '1 - x + 0.45*x^2', domain: [0, 2.2], color: 'violet', width: 2, dash: true },
    ],
    vlines: [{ x: 2, color: 'ink3', label: 'caustic' }],
    points: [
      { x: 0.85, y: 0.22, r: 0.01, color: 'gold', label: 'vacuum: the rays meet', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 0.6, y: 1.09, r: 0.01, color: 'violet', label: 'null condition broken: a throat (schematic)', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`The cross-section of a converging bundle of light rays with no shear or twist, starting with expansion $\theta_0 < 0$. In vacuum (gold) it shrinks to zero at $\lambda = 2/|\theta_0|$; matter obeying the null condition only brings that point closer. A bundle that turns around and re-expands (violet, a sketch) needs $T_{\mu\nu}k^\mu k^\nu < 0$ — a wormhole throat.`,
};

// worldlines of observers moving through vacuum energy
const observersPic = {
  type: 'graph',
  params: {
    x: [-1.2, 1.2], y: [0, 1.5], xlabel: 'position x (light-seconds)', ylabel: 'time t (s)', equal: true, axesAt: 'edge',
    curves: [
      { fn: 'abs(x)', color: 'ink4', width: 1.4, dash: true, label: 'light', labelAt: -1.1, labelDx: 6, labelDy: -2 },
      { param: ['0', 't'], t: [0, 1.45], color: 'gold', width: 2.4 },
      { param: ['0.5*t', 't'], t: [0, 1.45], color: 'accent', width: 2.4 },
      { param: ['0.9*t', 't'], t: [0, 1.3], color: 'violet', width: 2.4 },
    ],
    points: [
      { x: 0, y: 1.42, r: 0.01, color: 'gold', label: 'at rest', labelAlign: 'right', labelDx: -8, labelDy: 0 },
      { x: 0.72, y: 1.44, r: 0.01, color: 'accent', label: 'v = 0.5c', labelAlign: 'left', labelDx: 8, labelDy: 0 },
      { x: 1.17, y: 1.3, r: 0.01, color: 'violet', label: 'v = 0.9c', labelAlign: 'right', labelDx: 0, labelDy: -14 },
    ],
  },
  caption: 'Three observers passing through the same vacuum energy at different speeds (a spacetime diagram; dashed lines are light rays). Each measures the energy density in their own frame.',
};

const accelPic = {
  type: 'gr-friedmann',
  params: { sliders: false, readout: false, t: [-14, 12], a: [0, 2] },
  caption: 'The measured history of the scale factor (Planck 2018 fit): its curve bends upward — the expansion accelerates — for the last several billion years.',
};

// ── coding exercise ─────────────────────────────────────────────────────────

const CODE_START = `import sympy as sp

rho, p, c, beta, A, theta, phi = sp.symbols('rho p c beta A theta phi', real=True)
eta = sp.diag(-1, 1, 1, 1)                     # Minkowski metric, orthonormal frame

def contract(T, u):
    # return T_{mu nu} u^mu u^nu, summed over mu and nu = 0..3
    return 0                                   # replace this line

gamma = 1/sp.sqrt(1 - beta**2)
t_obs = [gamma, gamma*beta, 0, 0]              # an observer moving along x at speed beta c
k_ray = [1, sp.sin(theta)*sp.cos(phi), sp.sin(theta)*sp.sin(phi), sp.cos(theta)]   # a light ray

T_fluid = sp.diag(rho*c**2, p, p, p)           # perfect fluid, in its rest frame
T_casimir = A*sp.diag(-1, 1, 1, -3)            # between conducting plates, z normal to them

print('observer normalisation:', sp.simplify(contract(eta, t_obs)))
print('fluid, moving observer:', sp.simplify(contract(T_fluid, t_obs)))
print('Casimir, light ray:    ', sp.simplify(contract(T_casimir, k_ray)))
`;
const CODE_ANSWER = CODE_START.replace('    return 0                                   # replace this line', '    return sum(T[m, n]*u[m]*u[n] for m in range(4) for n in range(4))');

export default lesson({
  id: 'gr.S33.d',
  title: 'Null, weak, strong and dominant energy conditions',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`An **energy condition** is an assumption about matter, written as an inequality on its stress–energy tensor and demanded of every observer $t^\mu$ or every light ray $k^\mu$ at once. They are not laws of physics. They are what the big theorems assume: the null condition makes light rays focus, which drives Penrose's singularity theorem (step 37), and it is exactly the condition a traversable wormhole (step 35) or a warp drive (step 36) must break.

If some observer sees the stress tensor as diagonal, $\text{diag}(\rho c^2, p_1, p_2, p_3)$ — Hawking and Ellis's type I, which covers all ordinary matter — the conditions become inequalities on these eigenvalues. **Null:** $\rho c^2 + p_i \ge 0$ for each $i$. **Weak:** that, and $\rho \ge 0$. **Strong:** the null inequalities and $\rho c^2 + p_1 + p_2 + p_3 \ge 0$. **Dominant:** $\rho c^2 \ge |p_i|$. The worked example derives them for a perfect fluid.`,
  equation: t`\begin{gathered} T_{\mu\nu}k^\mu k^\nu \ge 0 \ \ (\text{null}), \qquad T_{\mu\nu}t^\mu t^\nu \ge 0 \ \ (\text{weak}), \\ \left(T_{\mu\nu} - \tfrac12Tg_{\mu\nu}\right)t^\mu t^\nu \ge 0 \ \ (\text{strong}), \qquad -T^\mu{}_\nu t^\nu \ \text{future-pointing, never spacelike} \ \ (\text{dominant}) \end{gathered}`,
  symbols: [
    { tex: 'T_{\\mu\\nu}', text: 'the stress–energy tensor of the matter: energy density, momentum density and stresses, in J/m³' },
    { tex: 'k^\\mu', text: t`any null vector — the direction of a light ray, $g_{\mu\nu}k^\mu k^\nu = 0$` },
    { tex: 't^\\mu', text: t`any future-pointing unit timelike vector: an observer's 4-velocity divided by $c$, so $g_{\mu\nu}t^\mu t^\nu = -1$. Then $T_{\mu\nu}t^\mu t^\nu$ is the energy density that observer measures` },
    { tex: 'T', text: t`the trace $g^{\mu\nu}T_{\mu\nu}$; for a perfect fluid, $-\rho c^2 + 3p$` },
    { tex: 'g_{\\mu\\nu}', text: 'the metric, signature (−, +, +, +)' },
    { tex: '-T^\\mu{}_\\nu t^\\nu', text: t`the flow of energy and momentum the observer measures — "never spacelike" means it does not outrun light` },
  ],
  why: 'Every theorem about singularities, black-hole areas and the impossibility of wormholes starts from one of these inequalities. Knowing exactly what each one says — and which real matter breaks it — tells you what those theorems can and cannot promise.',
  visual: {
    ...boostPic({ sliders: true }),
    title: 'What a moving observer measures',
    lead: t`Each condition must hold for every observer, however fast. For a perfect fluid with $p = w\rho c^2$ and $\rho > 0$, the gold curve is the energy density measured at speed $\beta c$ and the violet one the strong-condition combination, both in units of the rest-frame $\rho c^2$. A condition is broken if its curve goes below zero anywhere.`,
    tasks: [
      t`Dust, $w = 0$: a moving observer measures $\gamma^2\rho c^2$ — each grain heavier by $\gamma$, and packed closer by another $\gamma$.`,
      t`Set $w = -1$, a cosmological constant: the gold line is flat. Every observer measures the same energy density — vacuum energy has no rest frame.`,
      t`Go below $w = -1$ (phantom): fast observers measure **negative** energy density, although $\rho > 0$ at rest. That is what breaking the null condition means.`,
      t`Between $w = -1$ and $w = -\tfrac13$ the violet curve starts below zero while the gold one stays positive: the strong condition fails, and gravity pushes the expansion faster.`,
    ],
  },
  example: {
    prompt: t`Turn the four energy conditions into inequalities on the rest-frame energy density $\rho c^2$ and pressure $p$ of a perfect fluid, $T_{\mu\nu} = (\rho + p/c^2)u_\mu u_\nu + pg_{\mu\nu}$, by testing every observer and every light ray.`,
    visual: fluidPlane(),
    steps: [
      { label: 'The fluid frame', text: t`In the fluid's rest frame, with orthonormal axes, $T_{\mu\nu} = \text{diag}(\rho c^2, p, p, p)$. An observer moving at speed $\beta c$ along a unit vector $\hat n$ has $t^\mu = \gamma(1, \beta\hat n)$ with $\gamma = 1/\sqrt{1 - \beta^2}$, so $t_\mu t^\mu = -1$. A light ray along $\hat n$ has $k^\mu = (1, \hat n)$.` },
      { label: 'Weak', text: t`$T_{\mu\nu}t^\mu t^\nu = \gamma^2\rho c^2 + \gamma^2\beta^2p = \gamma^2(\rho c^2 + p) - p$, using $\gamma^2\beta^2 = \gamma^2 - 1$. At rest it is $\rho c^2$; as $\beta \to 1$, $\gamma^2 \to \infty$ and its sign becomes that of $\rho c^2 + p$. Conversely, if $\rho \ge 0$ and $\rho c^2 + p \ge 0$, then $\gamma^2(\rho c^2 + p) - p \ge \rho c^2 \ge 0$. **Weak: $\rho \ge 0$ and $\rho c^2 + p \ge 0$.**` },
      { label: 'Null', text: t`$T_{\mu\nu}k^\mu k^\nu = \rho c^2 + p$, the same for every direction. **Null: $\rho c^2 + p \ge 0$** — the weak condition's fast-observer limit, since $t^\mu/\gamma \to k^\mu$ as $\beta \to 1$.` },
      { label: 'Strong', text: t`The trace is $T = -\rho c^2 + 3p$ and $g_{\mu\nu}t^\mu t^\nu = -1$, so $\left(T_{\mu\nu} - \tfrac12Tg_{\mu\nu}\right)t^\mu t^\nu = \gamma^2(\rho c^2 + p) - p + \tfrac12(-\rho c^2 + 3p) = \gamma^2(\rho c^2 + p) + \tfrac12(p - \rho c^2)$. At rest it is $\tfrac12(\rho c^2 + 3p)$; for fast observers, the sign of $\rho c^2 + p$. **Strong: $\rho c^2 + 3p \ge 0$ and $\rho c^2 + p \ge 0$** — with no demand that $\rho \ge 0$.` },
      { label: 'Dominant', text: t`With $T^0{}_0 = -\rho c^2$ and $T^i{}_j = p\,\delta^i{}_j$, the flow the observer measures is $-T^\mu{}_\nu t^\nu = \gamma\left(\rho c^2, -\beta p\,\hat n\right)$. It points to the future and is never spacelike, for every $\beta < 1$, only if $\rho c^2 \ge |\beta p|$ for all $\beta$: **dominant: $\rho c^2 \ge |p|$**. Energy never flows faster than light.` },
      { label: 'Sense check', text: t`Dust ($p = 0$) and radiation ($p = \rho c^2/3$) pass all four. A cosmological constant, $p = -\rho c^2$, meets the null, weak and dominant conditions with equality but breaks the strong one: $\rho c^2 + 3p = -2\rho c^2$. That failure is what lets $\Lambda$ accelerate the expansion (step 31).` },
    ],
    answer: t`Null: $\rho c^2 + p \ge 0$. Weak: also $\rho \ge 0$. Strong: $\rho c^2 + p \ge 0$ and $\rho c^2 + 3p \ge 0$. Dominant: $\rho c^2 \ge |p|$.`,
  },
  practice: [
    expr({
      id: 'boost-radiation', difficulty: 2,
      prompt: t`A gas of radiation has pressure $p = \rho c^2/3$. Using $T_{\mu\nu}t^\mu t^\nu = \gamma^2(\rho c^2 + p) - p$, find the energy density measured by an observer moving through it at speed $v$, in terms of $\rho$, $v$ and $c$.`,
      visual: boostPic({ w: 1 / 3, caption: t`What an observer moving through radiation measures, in units of the rest-frame $\rho c^2$ ($w = \tfrac13$): the energy density (gold) and the strong-condition combination (violet) coincide, because radiation's trace $T$ is zero, and both grow without limit as $v \to c$.` }),
      answer: 'rho*c^2*(1 + v^2/(3*c^2))/(1 - v^2/c^2)', answerTeX: t`\rho c^2\,\frac{1 + v^2/(3c^2)}{1 - v^2/c^2}`, lhs: t`T_{\mu\nu}t^\mu t^\nu`,
      vars: { rho: [0.5, 2], v: [0.1, 0.9], c: [1, 3] },
      errors: [
        { answer: 'rho*c^2/(1 - v^2/c^2)', feedback: t`That is dust's answer. Radiation's pressure adds $\gamma^2\beta^2p$: a moving observer also sees the momentum flowing past.` },
        { answer: 'rho*c^2*(1 + v^2/(3*c^2))/sqrt(1 - v^2/c^2)', feedback: t`Energy density gets two factors of $\gamma$, one for the energy of each bit and one for the squeezed volume: $\gamma^2 = 1/(1 - v^2/c^2)$.` },
        { answer: 'rho*c^2', feedback: t`Only a cosmological constant looks the same to every observer. For radiation, $\rho c^2 + p \ne 0$, so the result depends on $v$.` },
      ],
      hints: [t`$\gamma^2(\rho c^2 + \tfrac13\rho c^2) - \tfrac13\rho c^2$, with $\gamma^2 = 1/(1 - v^2/c^2)$.`],
      teach: t`For radiation, $T_{\mu\nu}t^\mu t^\nu = \rho c^2\,\dfrac{1 + v^2/3c^2}{1 - v^2/c^2}$: positive for every observer, so all four conditions hold.`,
      explain: t`$\tfrac43\gamma^2\rho c^2 - \tfrac13\rho c^2 = \rho c^2\,\dfrac{4 - (1 - v^2/c^2)}{3(1 - v^2/c^2)} = \rho c^2\,\dfrac{1 + v^2/(3c^2)}{1 - v^2/c^2}$. It grows without limit as $v \to c$ but never changes sign — radiation meets every energy condition.`,
    }),
    num({
      id: 'phantom-speed', difficulty: 2,
      gen(r) {
        const w = r.pick([-1.1, -1.2, -1.5]);
        const b = Math.sqrt(-1 / w);
        return {
          prompt: t`A phantom dark-energy fluid has $w = p/(\rho c^2) = ${w}$ and positive $\rho$ in its rest frame. Using $T_{\mu\nu}t^\mu t^\nu = \gamma^2(\rho c^2 + p) - p$, find the speed $v/c$ above which an observer measures negative energy density.`,
          answer: b, tol: { rel: 0.005 },
          errors: [
            { value: -1 / w, feedback: t`That is $\beta^2$. Take the square root: the energy density is $\gamma^2\rho c^2(1 + w\beta^2)$, zero at $\beta = \sqrt{-1/w}$.` },
          ],
          hints: [t`$\gamma^2(\rho c^2 + p) - p = \gamma^2\rho c^2\left[(1 + w) - w(1 - \beta^2)\right] = \gamma^2\rho c^2(1 + w\beta^2)$.`],
          teach: t`Breaking the null condition means some observers — the fast ones — measure negative energy density, even if it is positive at rest.`,
          explain: t`$1 + w\beta^2 = 0$ at $\beta = \sqrt{-1/w} = ${round(b, 4)}$. Faster observers see negative energy. For $w \ge -1$, $1 + w\beta^2 > 0$ for every $\beta < 1$: that is the null condition at work. Whether dark energy has $w < -1$ is open; measurements cluster near $w = -1$.`,
          visual: boostPic({ w, caption: t`The energy density measured at speed $\beta c$ in a phantom fluid with $w = ${w}$ (gold), in units of the rest-frame value. It crosses zero at some speed below $c$.` }),
        };
      },
    }),
    mcq({
      id: 'dec-flux', difficulty: 2,
      prompt: t`A hypothetical fluid has $p = 2\rho c^2$, with $\rho > 0$. Which energy condition does it break, and what goes wrong?`,
      visual: fluidPlane({ extra: [{ x: 1.2, y: 2.4, color: 'bad', r: 5.5, label: 'w = 2', labelDx: 10, labelDy: 4 }], caption: t`The fluid $p = 2\rho c^2$ (red, top) sits above the dominant wedge but inside the regions the other three conditions allow.` }),
      choices: [
        t`The dominant one: the measured energy flow $\gamma(\rho c^2, -2\beta\rho c^2\,\hat n)$ is spacelike for observers faster than $c/2$ — energy would outrun light`,
        t`The null one, because $|p| > \rho c^2$`,
        t`The strong one, because the pressure is too large`,
        t`None: a larger pressure only makes the fluid stiffer`,
      ],
      answer: 0,
      why: {
        1: t`The null condition needs $\rho c^2 + p \ge 0$: here it is $3\rho c^2$. It never limits large positive pressure.`,
        2: t`Positive pressure helps the strong condition: $\rho c^2 + 3p = 7\rho c^2 > 0$.`,
        3: t`Stiffness has a limit: past $p = \rho c^2$, the energy flow seen by fast observers is spacelike. (For such a fluid the sound speed $\sqrt{dp/d\rho} = \sqrt2\,c$ would also exceed $c$.)`,
      },
      hints: [t`Compute the flow $-T^\mu{}_\nu t^\nu = \gamma(\rho c^2, -\beta p\,\hat n)$ and ask when its spatial part exceeds its time part.`],
      teach: t`The dominant condition, $\rho c^2 \ge |p|$, is the one that forbids energy flowing faster than light.`,
      explain: t`The flow is causal while $\rho c^2 \ge \beta|p| = 2\beta\rho c^2$, so it turns spacelike for $\beta > \tfrac12$. The null, weak and strong conditions all hold. No known matter sits there: even nuclear matter in neutron stars stays below $p = \rho c^2$.`,
    }),
    expr({
      id: 'casimir-null', difficulty: 3,
      prompt: t`Between two parallel conducting plates a distance $d$ apart, the electromagnetic vacuum has, in the plates' frame with $z$ normal to them, $T_{\mu\nu} = A\,\text{diag}(-1, 1, 1, -3)$ with $A = \pi^2\hbar c/(720d^4)$ (Brown and Maclay, 1969). For a light ray $k^\mu = (1, \sin\theta\cos\phi, \sin\theta\sin\phi, \cos\theta)$ at angle $\theta$ to the normal, find $T_{\mu\nu}k^\mu k^\nu$.`,
      visual: platesPic(t`Two conducting plates and a light ray crossing the gap at angle $\theta$ to the normal. The pressure across the gap, $3A$, is the measured Casimir attraction; the negative energy density $-A$ is what the same theory predicts between the plates.`),
      answer: '-4*A*cos(theta)^2', answerTeX: t`-4A\cos^2\theta`, lhs: t`T_{\mu\nu}k^\mu k^\nu`,
      vars: { A: [0.5, 2], theta: [0, 1.5] },
      errors: [
        { answer: '-A*(1 + 3*cos(theta)^2)', feedback: t`Include the stresses along the plates: $T_{xx}k^xk^x + T_{yy}k^yk^y = A\sin^2\theta$.` },
        { answer: '-4*A*sin(theta)^2', feedback: t`$\theta$ is measured from the normal $z$, so the $-3A$ component pairs with $\cos^2\theta$.` },
        { answer: '4*A*cos(theta)^2', feedback: t`$T_{00} = -A$ is negative: the energy density between the plates is below the vacuum's.` },
        { answer: '-4*A', feedback: t`That holds only for rays straight across the gap, $\theta = 0$. Keep the angle.` },
      ],
      hints: [t`$T_{\mu\nu}k^\mu k^\nu = -A + A\sin^2\theta\cos^2\phi + A\sin^2\theta\sin^2\phi - 3A\cos^2\theta$.`, t`Use $\sin^2\theta = 1 - \cos^2\theta$.`],
      teach: t`The Casimir vacuum breaks the null condition for every light ray crossing the gap, $T_{\mu\nu}k^\mu k^\nu = -4A\cos^2\theta$ — quantum fields can do what ordinary matter does not.`,
      explain: t`$-A + A\sin^2\theta - 3A\cos^2\theta = -4A\cos^2\theta \le 0$: negative for every ray that crosses the gap, zero for rays parallel to the plates. Quantum fields can break the null condition. The amount is tiny: for $d = 1$ μm, $4A = ${sci(4 * casimirA(1e-6))}$ J/m³.`,
    }),
    multi({
      id: 'scalar-field', difficulty: 3,
      prompt: t`A homogeneous scalar field $\phi(t)$ with potential $V(\phi)$ has, in units with $c = 1$, $\rho = \tfrac12\dot\phi^2 + V$ and $p = \tfrac12\dot\phi^2 - V$. Which energy conditions can it break, for a suitable $V$ and $\dot\phi$?`,
      visual: scalarPic,
      choices: ['The null condition', 'The strong condition', 'The weak condition', 'The dominant condition'],
      answer: [1, 2, 3],
      why: {
        0: t`$\rho + p = \dot\phi^2 \ge 0$ always — and for any field configuration $T_{\mu\nu}k^\mu k^\nu = (k^\mu\partial_\mu\phi)^2 \ge 0$. No scalar field of this standard kind breaks the null condition.`,
        1: t`$\rho + 3p = 2(\dot\phi^2 - V)$, negative whenever the potential outweighs the kinetic term: inflation, and quintessence models of dark energy.`,
        2: t`$\rho = \tfrac12\dot\phi^2 + V < 0$ needs $V < -\tfrac12\dot\phi^2$: possible with a potential that dips below zero.`,
        3: t`$\rho - p = 2V$, so the dominant condition fails wherever $V < 0$.`,
      },
      hints: [t`Compute $\rho + p$, $\rho + 3p$ and $\rho - p$.`, t`$\rho + p = \dot\phi^2$, which can never be negative.`],
      teach: t`Classical scalar fields can break the strong, weak and dominant conditions, but never the null one: $\rho + p = \dot\phi^2$.`,
      explain: t`$\rho + p = \dot\phi^2 \ge 0$, so the null condition always holds; $\rho + 3p = 2(\dot\phi^2 - V)$ fails during inflation; $\rho = \tfrac12\dot\phi^2 + V$ and $\rho - p = 2V$ fail only where $V < 0$. That is why the null condition is the hardest to break: it takes quantum effects, or a scalar field coupled directly to curvature at enormous field strengths (Barceló and Visser, 1999).`,
    }),
    expr({
      id: 'focusing', difficulty: 3,
      prompt: t`For a bundle of light rays with no shear or twist, the Raychaudhuri equation is $\dfrac{d\theta}{d\lambda} = -\tfrac12\theta^2 - R_{\mu\nu}k^\mu k^\nu$, where $\theta$ is the expansion — the fractional rate of change of the bundle's cross-section per unit affine parameter $\lambda$. Einstein's equations give $R_{\mu\nu}k^\mu k^\nu = \frac{8\pi G}{c^4}T_{\mu\nu}k^\mu k^\nu$, so the null condition makes that term $\le 0$. In vacuum, solve for $\theta(\lambda)$ with $\theta(0) = \theta_0$.`,
      visual: focusPic,
      answer: '2*theta0/(2 + theta0*lambda)', answerTeX: t`\frac{2\theta_0}{2 + \theta_0\lambda}`, lhs: t`\theta(\lambda)`,
      vars: { theta0: [-1.5, -0.3], lambda: [0, 1] },
      errors: [
        { answer: 'theta0/(1 + theta0*lambda)', feedback: t`Keep the $\tfrac12$: $d(1/\theta)/d\lambda = +\tfrac12$, not 1.` },
        { answer: 'theta0 - theta0^2*lambda/2', feedback: t`That is only the first step of a Taylor series. Solve exactly: the equation separates.` },
        { answer: 'theta0*exp(-theta0*lambda/2)', feedback: t`The right side is $-\tfrac12\theta^2$, quadratic in $\theta$, so the solution is not exponential. Try $u = 1/\theta$.` },
      ],
      hints: [t`Write $u = 1/\theta$: then $du/d\lambda = -\theta^{-2}\,d\theta/d\lambda = \tfrac12$.`, t`$1/\theta = 1/\theta_0 + \lambda/2$.`],
      teach: t`Light converging in vacuum focuses to a point within $\lambda = 2/|\theta_0|$, and matter obeying the null condition only makes it sooner: gravity always focuses light.`,
      explain: t`$1/\theta = 1/\theta_0 + \lambda/2$, so $\theta = 2\theta_0/(2 + \theta_0\lambda)$. For $\theta_0 < 0$ it reaches $-\infty$ — a caustic, rays crossing — at $\lambda = 2/|\theta_0|$, and with $T_{\mu\nu}k^\mu k^\nu \ge 0$ the extra term brings that point closer. This is the engine of Penrose's singularity theorem (step 37), and the reason a wormhole throat, where light must start to re-expand, needs $T_{\mu\nu}k^\mu k^\nu < 0$ (step 35).`,
    }),
    code({
      id: 'sympy-conditions', difficulty: 3,
      prompt: t`Let SymPy test observers for you. Complete \`contract(T, u)\` so that it returns $T_{\mu\nu}u^\mu u^\nu$ for a 4×4 matrix \`T\` and a list \`u\` of four components. The program then measures a perfect fluid with a moving observer and the Casimir vacuum with a light ray.`,
      visual: fluidPlane({ caption: t`The regions your function will map out: each condition is a sign test on $T_{\mu\nu}t^\mu t^\nu$ or $T_{\mu\nu}k^\mu k^\nu$, here for perfect fluids.` }),
      starter: CODE_START,
      answer: CODE_ANSWER,
      tests: [
        { name: t`observer normalisation: $\eta_{\mu\nu}t^\mu t^\nu = -1$`, code: 'sp.simplify(contract(eta, t_obs) + 1) == 0' },
        { name: t`fluid: $\gamma^2(\rho c^2 + p) - p$`, code: 'sp.simplify(contract(T_fluid, t_obs) - (gamma**2*(rho*c**2 + p) - p)) == 0' },
        { name: t`Casimir: $-4A\cos^2\theta$`, code: 'sp.simplify(contract(T_casimir, k_ray) + 4*A*sp.cos(theta)**2) == 0' },
      ],
      hints: ['A double sum over both indices: `sum(T[m, n]*u[m]*u[n] for m in range(4) for n in range(4))`.', 'Return that expression; the prints show the three results.'],
      teach: 'Every energy condition is a contraction of the stress tensor with vectors, followed by a sign test.',
      explain: t`The double sum gives $\eta_{\mu\nu}t^\mu t^\nu = -\gamma^2 + \gamma^2\beta^2 = -1$, the fluid's $\gamma^2\rho c^2 + \gamma^2\beta^2p = \gamma^2(\rho c^2 + p) - p$, and the Casimir $-4A\cos^2\theta$. The same function, with \`eta\` replaced by a curved metric and an orthonormal frame, is how energy conditions are checked for wormhole and warp-drive metrics.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mems', difficulty: 3, transfer: true,
      gen(r) {
        const [d, dTeX] = r.pick([[100e-9, '100'], [200e-9, '200'], [500e-9, '500']]);
        const A = casimirA(d);
        return {
          prompt: t`In a micro-machined actuator, two parallel metal plates sit $${dTeX}$ nm apart. Between them $T_{\mu\nu} = A\,\text{diag}(-1, 1, 1, -3)$ with $A = \pi^2\hbar c/(720d^4)$ ($\hbar = 1.055\times10^{-34}$ J s). What is the most negative value of $T_{\mu\nu}k^\mu k^\nu$ over all light rays $k^\mu = (1, \hat n)$, in J/m³?`,
          answer: -4 * A, units: 'J/m^3', tol: { rel: 0.01 },
          errors: [
            { value: -A, feedback: t`That is the energy density alone, $T_{00}$. A ray straight across the gap also picks up $T_{zz} = -3A$.` },
            { value: -3 * A, feedback: t`Add the energy density: $T_{00} + T_{zz} = -A - 3A$.` },
            { value: 4 * A, feedback: t`The result is negative: this vacuum breaks the null condition.` },
          ],
          hints: [t`$T_{\mu\nu}k^\mu k^\nu = -4A\cos^2\theta$ is most negative for $\theta = 0$: a ray straight across the gap.`, t`$-4A = -\pi^2\hbar c/(180d^4)$, with $d$ in metres.`],
          teach: t`The Casimir vacuum's null energy is $-4A = -\pi^2\hbar c/(180d^4)$ for rays across the gap: real, measurable physics — and absurdly small next to what a wormhole would need.`,
          explain: t`$-4A = -\pi^2\hbar c/(180d^4) = ${sci(-4 * A)}$ J/m³. The plates attract with pressure $3A = ${sci(3 * A)}$ Pa, which devices of this size do feel. Compare a wormhole throat 1 m across: it needs $|T_{\mu\nu}k^\mu k^\nu|$ near $c^4/(8\pi Gr_0^2) = ${sci(THROAT_1M)}$ J/m³ (step 35) — about $10^{${Math.round(Math.log10(THROAT_1M / (4 * A)))}}$ times more.`,
          visual: platesPic(t`The plates of the actuator, $${dTeX}$ nm apart (not to scale), and a light ray crossing the gap.`),
        };
      },
    }),
    mcq({
      id: 'cp-acceleration', difficulty: 2,
      prompt: t`Through Einstein's equations the strong condition is the same as $R_{\mu\nu}t^\mu t^\nu \ge 0$ for every observer, which makes nearby free-falling particles converge: gravity attracts. Yet supernova, microwave-background and galaxy surveys show the expansion of the universe accelerating. What follows?`,
      visual: accelPic,
      choices: [
        t`The strong condition fails on cosmic scales today — dark energy behaves like $\Lambda$, with $\rho c^2 + 3p < 0$ — and general relativity is fine`,
        t`The null condition fails, so dark energy is the exotic matter wormholes need`,
        t`General relativity is refuted, because the energy conditions are laws of physics`,
        t`The weak condition fails: dark energy has negative energy density`,
      ],
      answer: 0,
      why: {
        1: t`A cosmological constant sits exactly on the null boundary, $\rho c^2 + p = 0$, and measurements put dark energy close to $w = -1$. Some recent survey fits hint that $w$ drifts with time — an open question — but no null violation is established.`,
        2: t`The energy conditions are assumptions about matter, not laws. General relativity with a positive $\Lambda$ predicts exactly this acceleration.`,
        3: t`Vacuum energy is positive for every observer: about $${sci(RHO_L_C2, 2)}$ J/m³ today.`,
      },
      hints: [t`For $\Lambda$, $\rho c^2 + p = 0$ while $\rho c^2 + 3p = -2\rho c^2$.`],
      teach: 'Cosmic acceleration is the strong energy condition failing, on average, over the whole universe — exactly as a cosmological constant should.',
      explain: t`Averaged over the universe today, $(\rho c^2 + 3p)/(\rho_{\text{crit}}c^2) = \Omega_m - 2\Omega_\Lambda = ${round(0.315 - 2 * 0.685, 3)}$ with Planck's $\Omega_m = 0.315$ and $\Omega_\Lambda = 0.685$: the strong condition fails, the null and weak ones hold. Inflation broke the strong condition too. The singularity theorems that assume it do not apply to such epochs; Penrose's, which assumes only the null condition, still does.`,
    }),
    expr({
      id: 'cp-vacuum-same', difficulty: 2,
      prompt: t`Vacuum energy acts like a fluid with $p = -\rho c^2$, so $T_{\mu\nu} = -\rho c^2\,g_{\mu\nu}$. What energy density does an observer moving at speed $v$ through it measure? Write it in terms of $\rho$, $v$ and $c$.`,
      visual: observersPic,
      answer: 'rho*c^2', answerTeX: t`\rho c^2`, lhs: t`T_{\mu\nu}t^\mu t^\nu`,
      vars: { rho: [0.5, 2], v: [0.1, 0.9], c: [1, 3] },
      errors: [
        { answer: 'rho*c^2/(1 - v^2/c^2)', feedback: t`That is dust. Here the pressure term cancels the growth: $\gamma^2(\rho c^2 + p) = 0$.` },
        { answer: '-rho*c^2', feedback: t`$g_{\mu\nu}t^\mu t^\nu = -1$, so $-\rho c^2 g_{\mu\nu}t^\mu t^\nu = +\rho c^2$.` },
      ],
      hints: [t`$T_{\mu\nu}t^\mu t^\nu = -\rho c^2\,g_{\mu\nu}t^\mu t^\nu$, and $t^\mu$ is a unit timelike vector.`],
      teach: t`A cosmological constant is the same for every observer: $T_{\mu\nu} \propto g_{\mu\nu}$ has no rest frame.`,
      explain: t`$T_{\mu\nu}t^\mu t^\nu = -\rho c^2\,(t_\mu t^\mu) = \rho c^2$ for every observer — or, from the fluid formula, $\gamma^2(\rho c^2 - \rho c^2) + \rho c^2$. A stress tensor proportional to the metric picks out no rest frame, which is why vacuum energy cannot tell you how fast you are moving.`,
    }),
  ],
  sources: [
    { label: 'Hawking & Ellis, The Large Scale Structure of Space-Time, §4.3 (Cambridge, 1973)', url: 'https://doi.org/10.1017/CBO9780511524646' },
    { label: 'Curiel, “A primer on energy conditions” (2017)', url: 'https://arxiv.org/abs/1405.0403' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 4 (energy conditions)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Brown & Maclay, “Vacuum stress between conducting plates: an image solution”, Phys. Rev. 184, 1272 (1969)', url: 'https://doi.org/10.1103/PhysRev.184.1272' },
    { label: 'Bressi, Carugno, Onofrio & Ruoso, “Measurement of the Casimir force between parallel metallic surfaces”, Phys. Rev. Lett. 88, 041804 (2002)', url: 'https://arxiv.org/abs/quant-ph/0203002' },
    { label: 'Barceló & Visser, “Twilight for the energy conditions?” (2002)', url: 'https://arxiv.org/abs/gr-qc/0205066' },
  ],
});
