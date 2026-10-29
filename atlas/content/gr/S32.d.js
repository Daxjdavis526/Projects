// The 3+1 split, BSSN and moving punctures — Derivation Mode. ADM form
// ds² = −α²c²dt² + γ_ij(dxⁱ + βⁱdt)(dxʲ + βʲdt), unit normal n_μ = (−αc, 0, 0, 0),
// K_ij = −(∂_tγ_ij − D_iβ_j − D_jβ_i)/(2αc), so K = −∇·n. Gauss: 2G_μν n^μ n^ν =
// ⁽³⁾R + K² − K_ijK^ij; Codazzi: G_μν n^μ γ^ν_i = −(D_jK^j_i − D_iK) — both
// checked in SymPy for a general spherical metric with lapse and shift
// (scratch v32.py). Painlevé–Gullstrand: α = 1, β_r = c√(r_s/r), flat slice;
// K^r_r = −½√(r_s/r³), K^θ_θ = K^φ_φ = √(r_s/r³), K = (3/2)√(r_s/r³), K² =
// K_ijK^ij, momentum constraint satisfied. FLRW: K = −3H/c and the Hamiltonian
// constraint is the Friedmann equation. ⁽³⁾R = −8ψ⁻⁵∇²ψ for γ = ψ⁴δ; ψ = 1 +
// M/(2r): R = r + M + M²/(4r), throat r = M/2, R = 2M; Brill–Lindquist masses
// beyond the throats m_i(1 + m_j/(2d)), so M − (M₁ + M₂) = −m₁m₂/d. 1+log:
// α = 1 + ln(γ/γ₀), zero at √γ/√γ₀ = e^(−1/2); harmonic α = √γ/√γ₀; geodesic
// slicing from the time-symmetric slice reaches r = 0 after πGM/c³. Static
// lapse of Earth: GPS-radius clock gains 45.7 μs/day on the ground.
import { lesson, mcq, num, expr, order, code } from '../../src/core/content.js';
import { C, GM_SUN, GM_EARTH, R_EARTH, sci, round, grid4 } from './_derivlate.js';

const t = String.raw;
const R3 = '{}^{(3)}\\!R';

// ── pictures ────────────────────────────────────────────────────────────────

// one step of a 3+1 evolution (schematic, drawn Euclidean)
const yLo = (x) => round(0.25 * Math.sin(0.6 * x), 4);
const yHi = (x) => round(2.2 + 0.3 * Math.sin(0.6 * x + 0.5), 4);
const PX = -1.4, QX = 1.4;
const admPic = {
  type: 'graph',
  params: {
    x: [-4, 4], y: [-0.7, 3.2], axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { fn: '0.25*sin(0.6*x)', color: 'accent', width: 2.4, label: 'slice t', labelAt: 3.2, labelDy: 18 },
      { fn: '2.2 + 0.3*sin(0.6*x + 0.5)', color: 'accent', width: 2.4, label: 'slice t + dt', labelAt: 2.7, labelDy: -14 },
    ],
    arrows: [
      { from: [PX, yLo(PX)], to: [PX, yHi(PX)], color: 'gold' },
      { from: [PX, round(yHi(PX) + 0.14, 4)], to: [QX, round(yHi(QX) + 0.14, 4)], color: 'violet' },
      { from: [PX, yLo(PX)], to: [QX, yHi(QX)], color: 'ink3' },
    ],
    points: [
      { x: PX, y: yLo(PX), color: 'ink', r: 4.5, label: 'P', labelDx: -16, labelDy: 10 },
      { x: QX, y: yHi(QX), color: 'ink', r: 4.5, label: 'Q: same xⁱ as P', labelDx: 10, labelDy: -12 },
      { x: PX - 0.12, y: 1.05, r: 0.01, color: 'gold', label: 'along the normal n: proper time α dt', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 0, y: round((yHi(PX) + yHi(QX)) / 2 + 0.14, 4), r: 0.01, color: 'violet', label: 'shift: βⁱ dt', labelDx: -10, labelDy: -20 },
      { x: 0.35, y: 0.95, r: 0.01, color: 'ink3', label: 't direction = αc n + β', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`One step of a 3+1 evolution (schematic: the drawing is Euclidean, spacetime is not). An observer at P moving along the unit normal $n$ reaches the next slice after proper time $\alpha\,dt$; the point Q with the same spatial coordinates $x^i$ lies a further $\beta^i dt$ along that slice. Lapse and shift are free: they decide how slices and coordinates advance, not what spacetime is.`,
};

// Brill–Lindquist data for two punctures, total mass 1 (G = c = 1): height ψ⁻², a common starting lapse
const PSI = '1 + q/(2*sqrt((x + d*(1 - q))^2 + y^2)) + (1 - q)/(2*sqrt((x - d*q)^2 + y^2))';
const blDomain = (d, q) => {
  const half = Math.max(2.5, round(d * Math.max(q, 1 - q) + 1.2, 3));
  return [[-half, half], [-round(0.75 * half, 3), round(0.75 * half, 3)]];
};
const blSurface = ({ d = 2.5, q = 0.5, sliders = false, caption } = {}) => ({
  type: 'surface3d',
  params: {
    z: `1/(${PSI})^2`, domain: sliders ? [[-4, 4], [-3, 3]] : blDomain(d, q), n: 72, zscale: 1.6, axisLen: 3.4, axisLabels: ['x', 'y', 'ψ⁻²'],
    ...(sliders ? {
      sliders: [
        { key: 'd', label: 'Separation $d$ (units of $M$)', min: 0.3, max: 4, step: 0.05, value: d, explain: 'Coordinate distance between the punctures, in units of the total mass $M = m_1 + m_2$ (geometric units, $G = c = 1$, so a mass is a length $GM/c^2$).' },
        { key: 'q', label: 'Mass fraction $m_1/M$', min: 0.2, max: 0.8, step: 0.01, value: q, explain: 'How the total is shared: $m_1 = qM$ on the left, $m_2 = (1 - q)M$ on the right, placed so the centre of mass is at the origin.' },
      ],
      readouts: [
        { label: t`$M_1 = m_1\left(1 + \tfrac{m_2}{2d}\right)$`, expr: 'q*(1 + (1 - q)/(2*d))', digits: 4 },
        { label: t`$M_2 = m_2\left(1 + \tfrac{m_1}{2d}\right)$`, expr: '(1 - q)*(1 + q/(2*d))', digits: 4 },
        { label: t`$M - (M_1 + M_2)$`, expr: '-q*(1 - q)/d', digits: 3 },
      ],
    } : { constants: { d, q } }),
  },
  caption: caption ?? t`Brill–Lindquist initial data, exact for any separation: the height is $\psi^{-2}$ on the plane through both punctures, $\psi = 1 + \tfrac{m_1}{2r_1} + \tfrac{m_2}{2r_2}$, in units of the total mass with $G = c = 1$. Each funnel reaches zero at a puncture. Drag to rotate.`,
});

// FLRW sliced along cosmic time: comoving galaxies are the normal observers
const flrwSlicesPic = {
  type: 'graph',
  params: {
    x: [-3.4, 3.4], y: [0, 2.2], xlabel: 'distance between galaxies (schematic)', ylabel: 'cosmic time t', grid: false, axesAt: 'edge',
    curves: [
      ...[0.5, 1, 1.5, 2].map((y, k) => ({ fn: String(y), color: 'accent', width: 1.8, ...(k === 0 ? { label: 'slices of constant t', labelAt: 3.3, labelAlign: 'right', labelDx: 0, labelDy: -10 } : {}) })),
      ...[-2, -1, 0, 1, 2].map((x0) => ({ param: [`${x0}*t^(2/3)`, 't'], t: [0.001, 2.15], color: 'gold', width: 2 })),
    ],
    points: [{ x: 0.06, y: 1.78, r: 0.01, color: 'gold', label: 'galaxies', labelAlign: 'left', labelDx: 0, labelDy: 0 }],
  },
  caption: t`A flat FLRW universe sliced along cosmic time: $\alpha = 1$, $\beta^i = 0$. The observers moving along the normals are the comoving galaxies (gold), spreading apart as $a \propto t^{2/3}$ in this dust example. The slices are flat, yet bent in time.`,
};

// areal radius on the time-symmetric slice through one black hole
const throatPic = {
  type: 'graph',
  params: {
    x: [0, 3], y: [0, 6], xlabel: 'coordinate radius r (units of M)', ylabel: 'areal radius R (units of M)',
    curves: [{ fn: 'x*(1 + 1/(2*x))^2', domain: [0.055, 3], color: 'accent', width: 2.6 }],
    hlines: [{ y: 2, color: 'gold', label: 'R = 2M' }],
    points: [
      { x: 0.5, y: 2, color: 'gold', r: 5, label: 'throat', labelDx: 8, labelDy: 18 },
      { x: 0.16, y: 5.3, r: 0.01, color: 'ink3', label: 'the other side of the throat', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: 2.95, y: 4.3, r: 0.01, color: 'ink3', label: 'our side', labelAlign: 'right', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`The size of spheres on the time-symmetric slice through one black hole: areal radius $R = r\psi^2$ with $\psi = 1 + M/(2r)$, in geometric units $G = c = 1$. Going inward, spheres shrink to a throat of radius $2M$, then grow again: inside it lies a second copy of the outside, whose infinity is the puncture at $r = 0$.`,
};

// three slicing conditions: the lapse as the volume element of a collapsing region shrinks
const lapsePic = {
  type: 'graph',
  params: {
    x: [0, 1], y: [-0.05, 1.15], xlabel: 'volume element √γ (starting value 1)', ylabel: 'lapse α',
    curves: [
      { fn: '1', color: 'ink3', width: 2, label: 'geodesic slicing', labelAt: 0.05, labelDy: -12 },
      { fn: 'x', color: 'accent', width: 2.2, label: 'harmonic', labelAt: 0.3, labelDx: 8, labelDy: 6 },
      { fn: '1 + 2*ln(x)', domain: [0.6066, 1], color: 'gold', width: 2.6, label: '1+log', labelAt: 0.7, labelDx: 10, labelDy: 4 },
    ],
  },
  caption: t`Three slicing conditions with zero shift, each tying the lapse to the volume element of a collapsing region, starting from $\alpha = 1$. Read from right to left as the volume shrinks: the 1+log lapse reaches zero first.`,
};

// weak versus strong hyperbolicity (step 29's Jordan-block model)
const growthPic = {
  type: 'graph',
  params: {
    x: [0, 20], y: [0, 22], xlabel: 'wavenumber × time, kt', ylabel: 'growth of a small error',
    curves: [
      { fn: '(x + sqrt(x^2 + 4))/2', color: 'bad', width: 2.6, label: 'weakly hyperbolic: grows with k', labelAt: 9, labelDx: -12, labelDy: -16, labelAlign: 'right' },
      { fn: '1', color: 'good', width: 2.6, label: 'strongly hyperbolic: bounded', labelAt: 12, labelDy: -12 },
    ],
  },
  caption: t`Step 29's model of what went wrong: in a weakly hyperbolic system a small error can grow in proportion to $kt$ — faster for shorter wavelengths, so a finer grid makes it worse. A strongly hyperbolic system keeps every mode bounded. Schematic: the red curve is the 2×2 Jordan-block example, not a measured code.`,
};

// Painlevé–Gullstrand extrinsic curvature, units of 1/r_s
const kPic = {
  type: 'graph',
  params: {
    x: [0.4, 4], y: [-1.3, 3.3], xlabel: 'r / rₛ', ylabel: 'curvature × rₛ', axesAt: 'edge',
    curves: [
      { fn: '1.5*x^(-1.5)', color: 'gold', width: 2.6 },
      { fn: 'x^(-1.5)', color: 'accent', width: 2.2 },
      { fn: '-0.5*x^(-1.5)', color: 'bad', width: 2.2 },
    ],
    vlines: [{ x: 1, color: 'ink3', label: 'horizon' }],
    hlines: [{ y: 0, color: 'violet' }],
    points: [
      { x: 3.9, y: 2.95, r: 0.01, color: 'gold', label: 'K, the trace', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 3.9, y: 2.6, r: 0.01, color: 'accent', label: 'tangential components', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 3.9, y: 2.25, r: 0.01, color: 'bad', label: 'radial component', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 3.9, y: 1.9, r: 0.01, color: 'violet', label: 'dashed: K² − KᵢⱼKⁱʲ = 0', labelAlign: 'right', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`Extrinsic curvature of the Painlevé–Gullstrand slices of a Schwarzschild black hole, in units of $1/r_s$: $K^r{}_r = -\tfrac12\sqrt{r_s/r^3}$, $K^\theta{}_\theta = K^\phi{}_\phi = \sqrt{r_s/r^3}$ and their sum $K$. The combination $K^2 - K_{ij}K^{ij}$ is zero everywhere (dashed). Everything is smooth through the horizon, and the slice itself is flat.`,
};

// the metric in 3+1 form
const metricGrid = grid4([
  ['−α²c² + βₖβᵏ', 'β₁', 'β₂', 'β₃'],
  ['β₁', 'γ₁₁', 'γ₁₂', 'γ₁₃'],
  ['β₂', 'γ₁₂', 'γ₂₂', 'γ₂₃'],
  ['β₃', 'γ₁₃', 'γ₂₃', 'γ₃₃'],
], {
  rowLabels: ['t', '1', '2', '3'], colLabels: ['t', '1', '2', '3'], w: 2.0,
  colors: [['gold', 'violet', 'violet', 'violet'], ['violet', 'accent', 'accent', 'accent'], ['violet', 'accent', 'accent', 'accent'], ['violet', 'accent', 'accent', 'accent']],
  caption: t`The metric $g_{\mu\nu}$ in 3+1 form: lapse (gold, with the shift's square), shift $\beta_i = \gamma_{ij}\beta^j$ (violet) and spatial metric $\gamma_{ij}$ (blue) — 1 + 3 + 6 functions, all ten components.`,
});

const chirpPic = {
  type: 'gr-chirp',
  params: { m1: 36, m2: 29, sliders: false, play: false, readout: false, ring: false, p: 1 },
  caption: 'What the last stage produces: a chirp like GW150914’s (36 and 29 solar masses). Drawn here at leading order, a teaching model; the merger and ringdown in real templates are calibrated to numerical-relativity simulations.',
};

// Earth's static lapse: (1 − α) × 10⁹ against radius in thousands of km
const KE = round((GM_EARTH / C ** 2) * 1e3, 5);   // GM/c² in mm = 4.435
const gpsPic = (rk, name) => ({
  type: 'graph',
  params: {
    x: [4, 32], y: [0, 0.8], xlabel: 'distance from Earth’s centre (thousand km)', ylabel: '(1 − α) × 10⁹',
    curves: [{ fn: `${KE}/x`, domain: [4.5, 32], color: 'accent', width: 2.4 }],
    points: [
      { x: round(R_EARTH / 1e6, 5), y: round(KE / (R_EARTH / 1e6), 4), color: 'good', r: 5, label: 'clock on the ground', labelDx: 10, labelDy: -4 },
      { x: round(rk / 1000, 5), y: round(KE / (rk / 1000), 4), color: 'gold', r: 5, label: `clock at rest at ${name} radius`, labelDx: -8, labelDy: 20, labelAlign: 'right' },
    ],
  },
  caption: t`The lapse of Earth's static slicing, $\alpha = \sqrt{1 - 2GM/(rc^2)} \approx 1 - GM/(rc^2)$: proper time per unit coordinate time for a clock at rest. Its tiny shortfall below 1 is drawn multiplied by $10^9$; Earth's rotation is ignored.`,
});

// ── coding exercise ─────────────────────────────────────────────────────────

const CODE_START = `import sympy as sp

r, th, ph, c, rs = sp.symbols('r theta phi c r_s', positive=True)
Y = [r, th, ph]
gam = sp.diag(1, r**2, r**2*sp.sin(th)**2)   # the flat slice, spherical coordinates
gi = gam.inv()
alpha = 1                                    # Painleve-Gullstrand lapse
beta = [c*sp.sqrt(rs/r), 0, 0]               # shift, index lowered: beta_r = c sqrt(rs/r)

def Gam(k, i, j):                            # Christoffel symbols of gam
    return sum(gi[k, l]*(sp.diff(gam[l, i], Y[j]) + sp.diff(gam[l, j], Y[i])
                         - sp.diff(gam[i, j], Y[l])) for l in range(3))/2

def D_beta(i, j):                            # D_i beta_j: covariant derivative within the slice
    return sp.diff(beta[j], Y[i]) - sum(Gam(k, i, j)*beta[k] for k in range(3))

def K_down(i, j):
    # K_ij = -(d_t gam_ij - D_i beta_j - D_j beta_i)/(2 alpha c); here d_t gam_ij = 0
    return 0                                 # replace this line

K = sp.Matrix(3, 3, lambda i, j: sp.simplify(K_down(i, j)))
Kmix = (gi*K).applyfunc(sp.simplify)         # K^i_j
trK = sp.simplify(Kmix.trace())
KK = sp.simplify(sum(Kmix[i, j]*Kmix[j, i] for i in range(3) for j in range(3)))
print('K^i_j on the diagonal:', [Kmix[i, i] for i in range(3)])
print('K =', trK, '   K^2 - K_ij K^ij =', sp.simplify(trK**2 - KK))
`;
const CODE_ANSWER = CODE_START.replace('    return 0                                 # replace this line', '    return (D_beta(i, j) + D_beta(j, i))/(2*alpha*c)');

// ── numbers ─────────────────────────────────────────────────────────────────

const T_GEO10 = (Math.PI * 10 * GM_SUN) / C ** 3;   // geodesic slicing from the throat to r = 0, 10 solar masses (s)

export default lesson({
  id: 'gr.S32.d',
  title: 'The 3+1 split, BSSN and moving punctures',
  minutes: 16, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`Step 29 found that four of Einstein's ten equations are constraints. To put that to work on a computer, cut spacetime into **slices** of constant $t$. Each slice has its own geometry, the spatial metric $\gamma_{ij}$, and a way of sitting in spacetime — how it bends from one moment to the next — the **extrinsic curvature** $K_{ij}$. Two free functions join neighbouring slices: the lapse $\alpha$, the proper time between them, and the shift $\beta^i$, how the coordinates slide. Projecting Einstein's equations onto the normal of the slices gives the four constraints above, which hold no second time derivatives; the other six evolve $\gamma_{ij}$ and $K_{ij}$ (Arnowitt, Deser and Misner, 1959–62).

Written that way, the evolution is only weakly hyperbolic, and black-hole codes crashed for decades. New variables (**BSSN**, 1995–98), a lapse that freezes the slices before they reach a singularity, and coordinates that let **punctures** move across the grid made binary black holes run in 2005–06. Their waveforms have matched the signals LIGO and Virgo record ever since.`,
  equation: t`${R3} + K^2 - K_{ij}K^{ij} = \frac{16\pi G}{c^4}E, \qquad D_j\!\left(K^{j}{}_{i} - \delta^{j}{}_{i}K\right) = \frac{8\pi G}{c^4}S_i`,
  symbols: [
    { tex: R3, text: t`the Ricci scalar of the slice's own metric $\gamma_{ij}$ — the curvature you could measure without leaving the slice, in m⁻²` },
    { tex: '\\gamma_{ij}', text: 'the **spatial metric**: distances within one slice — six functions of position and time' },
    { tex: 'K_{ij}', text: t`the **extrinsic curvature**: how the slice bends inside spacetime, $K_{ij} = -\dfrac{1}{2\alpha c}\left(\partial_t\gamma_{ij} - D_i\beta_j - D_j\beta_i\right)$, in m⁻¹; its indices are raised with the inverse $\gamma^{ij}$` },
    { tex: 'K', text: t`the trace $\gamma^{ij}K_{ij}$. With this sign $K = -\nabla_\mu n^\mu$: positive where observers moving along the normal converge` },
    { tex: 'D_j', text: t`the covariant derivative built from $\gamma_{ij}$ alone, inside the slice` },
    { tex: '\\delta^{j}{}_{i}', text: 'the Kronecker delta: 1 when the two indices are equal, 0 otherwise' },
    { tex: 'E', text: t`the energy density measured by observers moving along the unit normal $n^\mu$ of the slices, $E = T_{\mu\nu}n^\mu n^\nu$, in J/m³` },
    { tex: 'S_i', text: t`the momentum density those observers measure, times $c$: $S_i = -T_{\mu\nu}n^\mu\gamma^\nu{}_i$, where $\gamma^\nu{}_i$ projects onto the slice; in J/m³` },
    { tex: '\\alpha,\\ \\beta^i', text: t`the **lapse** (proper time between neighbouring slices per unit of $t$; no units) and the **shift** (how fast the coordinates drift, in m/s). Free choices: they appear in the definition of $K_{ij}$ but not in the constraints` },
    { tex: 'G,\\ c', text: "Newton's constant and the speed of light" },
  ],
  why: 'Every simulated black-hole merger is computed this way, and the waveforms that LIGO, Virgo and KAGRA compare with their data rest on these constraints, these variables and these choices of lapse and shift.',
  visual: {
    ...blSurface({ sliders: true }),
    title: 'Two black holes on the first slice',
    lead: t`On a slice with $K_{ij} = 0$ and a conformally flat metric $\gamma_{ij} = \psi^4\delta_{ij}$, the vacuum Hamiltonian constraint becomes Laplace's equation, $\nabla^2\psi = 0$. It is linear, so black holes superpose exactly: $\psi = 1 + \dfrac{m_1}{2r_1} + \dfrac{m_2}{2r_2}$ (Brill and Lindquist, 1963). The height drawn is $\psi^{-2}$, a common starting lapse.`,
    tasks: [
      t`Each funnel is a **puncture**: $\psi \to \infty$ there, so the starting lapse $\psi^{-2}$ is zero. Slices started with this lapse barely advance at the holes from the very first step.`,
      t`Bring the holes close (small $d$): the funnels merge into one well. The data stay exact at every separation, because the constraint became linear.`,
      t`Watch the readouts. Far away $\psi \approx 1 + M/(2r)$, so the total mass is always $M = m_1 + m_2$, while the masses $M_1$ and $M_2$ seen from beyond each throat grow as $d$ shrinks. Their excess, $m_1m_2/d$ (with $G = c = 1$), is the Newtonian binding energy.`,
    ],
  },
  example: {
    prompt: t`Show where the four constraints come from, and check them on a black hole: write the metric in 3+1 form, define the extrinsic curvature, project $G_{\mu\nu}$ onto the normal, then evaluate everything on the Painlevé–Gullstrand slices of Schwarzschild, $ds^2 = -c^2dt^2 + \left(dr + c\sqrt{r_s/r}\,dt\right)^2 + r^2d\Omega^2$.`,
    visual: admPic,
    steps: [
      { label: 'Slices, lapse and shift', text: t`Pick a time function $t$; its level surfaces are the slices. Write $ds^2 = -\alpha^2c^2dt^2 + \gamma_{ij}\left(dx^i + \beta^idt\right)\left(dx^j + \beta^jdt\right)$. An observer moving along the unit normal, $n_\mu = (-\alpha c, 0, 0, 0)$, ages $d\tau = \alpha\,dt$ between neighbouring slices, and the coordinates slide by $\beta^idt$ beneath them. That is $1 + 3 + 6 = 10$ functions — all of $g_{\mu\nu}$.` },
      { label: 'Extrinsic curvature', text: t`How a slice sits in spacetime is the rate its metric changes along the normal: $$K_{ij} = -\frac{1}{2\alpha c}\left(\partial_t\gamma_{ij} - D_i\beta_j - D_j\beta_i\right).$$ The shift terms remove the change that is only the coordinates sliding; dividing by $\alpha c$ turns coordinate time into proper distance. With this sign, $K = -\nabla_\mu n^\mu$.` },
      { label: 'Project the equations', text: t`Gauss's equation links the curvature of spacetime to that of the slice, $2G_{\mu\nu}n^\mu n^\nu = ${R3} + K^2 - K_{ij}K^{ij}$; Codazzi's gives $G_{\mu\nu}n^\mu\gamma^\nu{}_i = -\left(D_jK^j{}_i - D_iK\right)$. Insert $G_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu}$ with $E = T_{\mu\nu}n^\mu n^\nu$ and $S_i = -T_{\mu\nu}n^\mu\gamma^\nu{}_i$: the Hamiltonian and momentum constraints. $K_{ij}$ holds only first time derivatives of $\gamma_{ij}$, so these four equations hold no $\partial_t^2$ — step 29's constraints. The other six components evolve $\gamma_{ij}$ and $K_{ij}$.` },
      { label: 'Painlevé–Gullstrand slices', text: t`Here $\alpha = 1$, $\beta^r = c\sqrt{r_s/r}$, and $\gamma_{ij}$ is flat space in spherical coordinates, never changing: $\partial_t\gamma_{ij} = 0$. So $K_{ij} = \left(D_i\beta_j + D_j\beta_i\right)/(2c)$ with $\beta_r = c\sqrt{r_s/r}$. Radially, $K^r{}_r = \partial_r\sqrt{r_s/r} = -\tfrac12\sqrt{r_s/r^3}$. Tangentially, $D_\theta\beta_\theta = -\Gamma^r{}_{\theta\theta}\beta_r = r\beta_r$, so $K^\theta{}_\theta = K^\phi{}_\phi = \sqrt{r_s/r^3}$.` },
      { label: 'Check the constraints', text: t`$K = \tfrac32\sqrt{r_s/r^3}$, so $K^2 = \tfrac94\,r_s/r^3$, while $K_{ij}K^{ij} = \left(\tfrac14 + 1 + 1\right)r_s/r^3 = \tfrac94\,r_s/r^3$. The slice is flat, $${R3} = 0$, so the Hamiltonian constraint reads $0 + \tfrac94 - \tfrac94 = 0$, as vacuum demands. With $s = \sqrt{r_s/r^3}$, the momentum constraint is $D_jK^j{}_r - \partial_rK = \tfrac34\tfrac{s}{r} - 3\tfrac{s}{r} + \tfrac94\tfrac{s}{r} = 0$.` },
      { label: 'Sense check', text: t`Nothing is singular at the horizon $r = r_s$: these slices cross it smoothly. And the slice is flat — a black hole's curvature need not show in the geometry of a slice at all; here it is carried entirely by $K_{ij}$, by how the slice bends. SymPy confirms both projections for a general spherical metric with lapse and shift.` },
    ],
    answer: t`$2G_{\mu\nu}n^\mu n^\nu = ${R3} + K^2 - K_{ij}K^{ij}$ and $G_{\mu\nu}n^\mu\gamma^\nu{}_i = -\left(D_jK^j{}_i - D_iK\right)$ give the four constraints. On Painlevé–Gullstrand slices $${R3} = 0$, $K = \tfrac32\sqrt{r_s/r^3}$ and $K^2 = K_{ij}K^{ij}$: both constraints hold.`,
  },
  practice: [
    expr({
      id: 'metric-inverse', difficulty: 2,
      prompt: t`In 3+1 form the metric has $g_{tt} = -\alpha^2c^2 + \beta_k\beta^k$, $g_{ti} = \beta_i$ and $g_{ij} = \gamma_{ij}$. The slices $t = \text{const}$ have unit normal $n_\mu = (-\alpha c, 0, 0, 0)$, and a unit timelike vector obeys $g^{\mu\nu}n_\mu n_\nu = -1$. Find the inverse-metric component $g^{tt}$.`,
      visual: metricGrid,
      answer: '-1/(alpha^2*c^2)', answerTeX: t`-\frac{1}{\alpha^2c^2}`, lhs: 'g^{tt}',
      vars: { alpha: [0.3, 2], c: [0.5, 3] },
      errors: [
        { answer: '-alpha^2*c^2', feedback: t`That is $g_{tt}$ without its shift term. The inverse metric's $tt$ component is not read off $g_{tt}$ — use the normalisation of $n_\mu$.` },
        { answer: '1/(alpha^2*c^2)', feedback: t`The normal is timelike: $g^{\mu\nu}n_\mu n_\nu = -1$, so $g^{tt}$ is negative.` },
        { answer: '-1/(alpha*c)', feedback: t`$n_t$ appears twice in the sum: $g^{tt}n_tn_t = g^{tt}\alpha^2c^2$.` },
      ],
      hints: [t`Only $n_t = -\alpha c$ is nonzero, so the sum $g^{\mu\nu}n_\mu n_\nu$ has a single term.`],
      teach: t`$g^{tt} = -1/(\alpha^2c^2)$: the lapse alone fixes it, whatever the shift.`,
      explain: t`$g^{tt}n_tn_t = g^{tt}\alpha^2c^2 = -1$. The rest of the inverse follows the same way: $g^{ti} = \beta^i/(\alpha^2c^2)$ and $g^{ij} = \gamma^{ij} - \beta^i\beta^j/(\alpha^2c^2)$. The determinant is $g = -\alpha^2c^2\det\gamma_{ij}$, so the volume element every 3+1 code integrates with is $\sqrt{-g} = \alpha c\sqrt\gamma$.`,
    }),
    expr({
      id: 'flrw-k', difficulty: 2,
      prompt: t`Slice a flat FLRW universe along cosmic time: $\alpha = 1$, $\beta^i = 0$, and $\gamma_{ij} = a^2(t)\,\delta_{ij}$ in Cartesian comoving coordinates. From $K_{ij} = -\dfrac{1}{2\alpha c}\left(\partial_t\gamma_{ij} - D_i\beta_j - D_j\beta_i\right)$, find the trace $K = \gamma^{ij}K_{ij}$ in terms of the Hubble rate $H = \dot a/a$.`,
      visual: flrwSlicesPic,
      answer: '-3*H/c', answerTeX: t`-\frac{3H}{c}`, lhs: 'K',
      vars: { H: [0.5, 3], c: [0.5, 3] },
      errors: [
        { answer: '0', feedback: t`A flat slice can still bend in time. $K_{ij}$ measures how the slice's metric changes along the normal, and $a^2(t)$ changes.` },
        { answer: '3*H/c', feedback: t`Mind the sign in the definition: with it, $K = -\nabla_\mu n^\mu$, negative when the normal observers spread apart.` },
        { answer: '-H/c', feedback: t`Take the trace over all three directions: each diagonal term gives $-H/c$.` },
        { answer: '-6*H/c', feedback: t`$\partial_t(a^2) = 2a\dot a$, and the $\tfrac12$ in the definition cancels the 2.` },
        { answer: '-3*H', feedback: t`Keep the $1/c$: $K$ is a curvature, in m⁻¹, while $H$ is in s⁻¹.` },
      ],
      hints: [t`$\partial_t\gamma_{ij} = 2a\dot a\,\delta_{ij}$, so $K_{ij} = -a\dot a\,\delta_{ij}/c$.`],
      teach: t`FLRW slices have $K = -3H/c$: flat in space, yet bent in time. The trace of the extrinsic curvature is minus the expansion rate of the normal observers.`,
      explain: t`$K_{ij} = -\frac{1}{2c}\,2a\dot a\,\delta_{ij} = -\frac{a\dot a}{c}\delta_{ij}$ and $\gamma^{ij} = \delta^{ij}/a^2$, so $K = -\frac{3\dot a}{ac} = -\frac{3H}{c}$ — negative because the galaxies, the normal observers, spread apart: $\nabla_\mu n^\mu = 3H/c > 0$. Then $K^2 - K_{ij}K^{ij} = 9H^2/c^2 - 3H^2/c^2 = 6H^2/c^2$: the checkpoint shows what that becomes.`,
    }),
    expr({
      id: 'throat-map', difficulty: 3,
      prompt: t`On a slice with $K_{ij} = 0$ ("time-symmetric"), take a conformally flat metric $\gamma_{ij} = \psi^4\delta_{ij}$. Then $${R3} = -8\psi^{-5}\nabla^2\psi$, with the flat Laplacian, so the vacuum Hamiltonian constraint is just $\nabla^2\psi = 0$. For one black hole, in geometric units $G = c = 1$, $\psi = 1 + M/(2r)$. A sphere of coordinate radius $r$ has area $4\pi R^2$ with $R = r\psi^2$. Expand $R(r)$, then find the other coordinate radius $r'$ whose sphere has exactly the same area, as a function of $r$.`,
      visual: throatPic,
      answer: 'M^2/(4*r)', answerTeX: t`\frac{M^2}{4r}`, lhs: "r'",
      vars: { M: [0.5, 2], r: [0.3, 3] },
      errors: [
        { answer: 'M/2', feedback: t`That is the throat itself, the one radius that is its own partner. The question asks for the partner of a general $r$.` },
        { answer: 'M^2/r', feedback: t`Expand carefully: $R = r + M + \dfrac{M^2}{4r}$ — the last term has a 4.` },
        { answer: 'M/(2*r)', feedback: t`Check the units: $r'$ is a length, while $M/(2r)$ is a pure number.` },
      ],
      hints: [t`$R = r\left(1 + \dfrac{M}{2r}\right)^2 = r + M + \dfrac{M^2}{4r}$.`, t`Look for a substitution that swaps the first and last terms.`],
      teach: t`The slice through one black hole is two copies of the outside joined at a throat of area $4\pi(2M)^2$; the puncture $r = 0$ is the far infinity of the second copy.`,
      explain: t`$R(r) = r + M + \dfrac{M^2}{4r}$ is unchanged by $r \to r' = M^2/(4r)$, which maps $r > M/2$ onto $r < M/2$. The fixed point $r = M/2$ is the throat, with $R = 2M$ — the Schwarzschild radius $2GM/c^2$. So the coordinate ball $r < M/2$ holds a whole second exterior, squeezed down, with its infinity at $r = 0$. Codes need not resolve it: they split $\psi$ into this known $1/r$ part and a smooth remainder and "puncture" the grid at $r = 0$ (Brandt and Brügmann, 1997) — hence the name.`,
    }),
    num({
      id: 'one-plus-log', difficulty: 3,
      gen(r) {
        const s = r.pick([0.9, 0.8, 0.7]);
        const a = 1 + 2 * Math.log(s);
        return {
          prompt: t`With zero shift, the definition of $K_{ij}$ gives $\partial_t\gamma_{ij} = -2\alpha cK_{ij}$, so the volume element $\sqrt\gamma$ (with $\gamma = \det\gamma_{ij}$) obeys $\partial_t\ln\sqrt\gamma = -\alpha cK$. Moving-puncture codes choose the "1+log" slicing condition, $\partial_t\alpha = -2\alpha cK$. Starting from $\alpha = 1$, what is the lapse at a point where the volume element has fallen to $${s}$ of its starting value?`,
          answer: a, tol: { abs: 0.005 },
          errors: [
            { value: 1 + Math.log(s), feedback: t`Keep the factor 2: $\partial_t\alpha = 2\,\partial_t\ln\sqrt\gamma$, so $\alpha = 1 + 2\ln\left(\sqrt\gamma/\sqrt{\gamma_0}\right)$.` },
            { value: s, feedback: t`That is harmonic slicing, $\partial_t\alpha = -\alpha^2cK$, which gives $\alpha = \sqrt\gamma/\sqrt{\gamma_0}$.` },
            { value: 1, feedback: t`A lapse held at 1 is geodesic slicing. The 1+log lapse falls as the volume shrinks.` },
          ],
          hints: [t`Divide the two equations: $\partial_t\alpha \big/ \partial_t\ln\sqrt\gamma = 2$ at every moment.`, t`So $\alpha - 1 = 2\ln\left(\sqrt\gamma/\sqrt{\gamma_0}\right)$.`],
          teach: t`1+log slicing ties the lapse to the volume, $\alpha = 1 + \ln(\gamma/\gamma_0)$: it reaches zero when $\sqrt\gamma$ has fallen to $e^{-1/2} \approx 0.61$ of its start, long before a singularity could crush the volume to nothing.`,
          explain: t`$\partial_t\alpha = -2\alpha cK = 2\,\partial_t\ln\sqrt\gamma$, so $\alpha = 1 + 2\ln(${s}) = ${round(a, 3)}$ — the same as $1 + \ln(\gamma/\gamma_0)$, which gives the condition its name. The lapse reaches zero at $\sqrt\gamma/\sqrt{\gamma_0} = e^{-1/2} \approx 0.61$, and as it does the volume stops shrinking, since $\partial_t\ln\sqrt\gamma = -\alpha cK \to 0$: the slice freezes short of the singularity. Harmonic slicing reaches zero only as the volume itself does; geodesic slicing, $\alpha = 1$, runs straight in — started on the time-symmetric slice of a Schwarzschild hole, it hits $r = 0$ after a proper time $\pi GM/c^3$, $${sci(T_GEO10 * 1e3, 2)}$ ms for 10 solar masses.`,
          visual: lapsePic,
        };
      },
    }),
    mcq({
      id: 'bssn-why', difficulty: 2,
      prompt: t`Written in the variables $\gamma_{ij}$ and $K_{ij}$, the six evolution equations are only weakly hyperbolic (step 29), and free evolutions of black holes crashed. What did the BSSN reformulation change?`,
      visual: growthPic,
      choices: [
        t`It splits off the conformal factor and the trace $K$, and makes the conformal connection functions $\tilde\Gamma^i = -\partial_j\tilde\gamma^{ij}$ independent variables, adding the momentum constraint to their evolution: the same solutions whenever the constraints hold, but strongly hyperbolic for suitable lapse and shift conditions`,
        t`It modifies Einstein's equations by adding terms that damp the gravitational waves`,
        t`It solves the four constraint equations again at every time step instead of evolving freely`,
        t`It replaces the ADM equations with a finer grid near the black holes`,
      ],
      answer: 0,
      why: {
        1: t`Every BSSN solution that satisfies the constraints solves Einstein's equations: only the behaviour off the constraint surface changes, and physical waves are untouched.`,
        2: t`That is constrained evolution, with an elliptic solve at every step — costly, and not what BSSN does. BSSN evolves freely and watches the constraints as a check on accuracy.`,
        3: t`Resolution cannot cure weak hyperbolicity: the growth scales with wavenumber, so a finer grid makes it worse. Mesh refinement buys accuracy, not well-posedness.`,
      },
      hints: [t`Adding a multiple of a constraint to an evolution equation changes nothing for true solutions — but it can change the principal part.`],
      teach: t`BSSN: new variables (conformal factor, trace-free $\tilde A_{ij}$, $K$, $\tilde\Gamma^i$) plus the momentum constraint added to the $\tilde\Gamma^i$ equation — strongly hyperbolic with suitable gauge conditions.`,
      explain: t`Shibata and Nakamura (1995) and Baumgarte and Shapiro (1998) evolve $\phi = \tfrac1{12}\ln\gamma$, the unit-determinant $\tilde\gamma_{ij} = e^{-4\phi}\gamma_{ij}$, $K$, the trace-free $\tilde A_{ij} = e^{-4\phi}\left(K_{ij} - \tfrac13\gamma_{ij}K\right)$ and $\tilde\Gamma^i$: 17 functions instead of 12. Rewriting the $\tilde\Gamma^i$ equation with the momentum constraint changes the principal part — step 29's notion — and with conditions such as 1+log slicing and a Gamma-driver shift the system is strongly hyperbolic (shown by Beyer and Sarbach, 2004). On solutions of the constraints, nothing physical changes.`,
    }),
    order({
      id: 'puncture-order', difficulty: 2,
      prompt: 'Put the stages of a moving-puncture simulation of two black holes in order.',
      visual: chirpPic,
      items: [
        t`Solve the Hamiltonian and momentum constraints for the first slice: two punctures with chosen masses, momenta and spins`,
        t`Choose the starting gauge: a lapse already collapsed at the punctures, such as $\alpha = \psi^{-2}$, and zero shift`,
        t`Evolve the BSSN variables with 1+log slicing and a Gamma-driver shift, letting the punctures move across the grid`,
        t`Extract the outgoing gravitational waves on large spheres around the binary and compare them with detector data`,
      ],
      hints: [t`Constraints first, because evolution only preserves them; waves last, because they must first travel out.`],
      teach: 'Initial data solve the constraints; the gauge is chosen; the evolution equations carry the slices forward; the waves are read off far away.',
      explain: t`The momentum constraint has an analytic solution for holes with momentum and spin (Bowen and York, 1980), and the Hamiltonian constraint is then solved numerically for the smooth part of $\psi$. The evolution never reaches the singularities — the lapse keeps the slices away, and the shift lets the punctures move. Throughout, the constraint violations are monitored: they must shrink as the resolution increases. The waves are measured on spheres tens to hundreds of $GM/c^2$ out.`,
    }),
    code({
      id: 'sympy-pg', difficulty: 3,
      prompt: t`Check the constraints on a black hole yourself. The program sets up the Painlevé–Gullstrand slice of Schwarzschild — flat space in spherical coordinates, lapse $\alpha = 1$, shift $\beta_r = c\sqrt{r_s/r}$ — with its Christoffel symbols and \`D_beta(i, j)\` $= D_i\beta_j$. Complete \`K_down(i, j)\` so that it returns $K_{ij}$. The tests check two components and the vacuum Hamiltonian constraint on this flat slice, $K^2 - K_{ij}K^{ij} = 0$.`,
      visual: kPic,
      starter: CODE_START,
      answer: CODE_ANSWER,
      tests: [
        { name: t`radial: $K^r{}_r = -\tfrac12\sqrt{r_s/r^3}$`, code: 'sp.simplify(Kmix[0, 0] + sp.sqrt(rs/r**3)/2) == 0' },
        { name: t`tangential: $K^\theta{}_\theta = \sqrt{r_s/r^3}$`, code: 'sp.simplify(Kmix[1, 1] - sp.sqrt(rs/r**3)) == 0' },
        { name: t`Hamiltonian constraint: $K^2 - K_{ij}K^{ij} = 0$ with $K \neq 0$`, code: 'sp.simplify(trK**2 - KK) == 0 and trK != 0' },
      ],
      hints: [t`With $\partial_t\gamma_{ij} = 0$ the definition leaves $K_{ij} = \left(D_i\beta_j + D_j\beta_i\right)/(2\alpha c)$.`, 'In code: `return (D_beta(i, j) + D_beta(j, i))/(2*alpha*c)`.'],
      teach: t`A flat slice through a black hole: $${R3} = 0$, and $K^2 = K_{ij}K^{ij}$ makes the Hamiltonian constraint hold. The curvature lives in how the slice is embedded.`,
      explain: t`$K_{rr} = \partial_r\sqrt{r_s/r} = -\tfrac12\sqrt{r_s/r^3}$, and $D_\theta\beta_\theta = -\Gamma^r{}_{\theta\theta}\beta_r = rc\sqrt{r_s/r}$ gives $K^\theta{}_\theta = \sqrt{r_s/r^3}$. So $K = \tfrac32\sqrt{r_s/r^3}$ and $K^2 - K_{ij}K^{ij} = \left(\tfrac94 - \tfrac14 - 1 - 1\right)r_s/r^3 = 0$. Nothing singular happens at $r = r_s$: the slices cross the horizon smoothly.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      gen(r) {
        const [name, rk, rkTeX] = r.pick([['GPS', 26561.75, t`26{,}562`], ['Galileo', 29599.8, t`29{,}600`], ['GLONASS', 25508, t`25{,}508`]]);
        const rS = rk * 1e3;
        const dAlpha = Math.sqrt(1 - (2 * GM_EARTH) / (rS * C * C)) - Math.sqrt(1 - (2 * GM_EARTH) / (R_EARTH * C * C));
        const us = dAlpha * 86400 * 1e6;
        const vel = ((GM_EARTH / (2 * rS * C * C)) * 86400) * 1e6;
        return {
          prompt: t`Around the slowly rotating Earth, the static slicing of the Schwarzschild metric has lapse $\alpha = \sqrt{1 - 2GM/(rc^2)}$: the proper time a clock at rest at radius $r$ ticks per unit of $t$. How many microseconds per day more does a clock held at rest at the ${name} orbital radius, $${rkTeX}$ km, tick than one at rest on the ground at $6{,}371$ km? Use $GM_\oplus = 3.986\times10^{14}$ m³/s² and ignore Earth's rotation.`,
          answer: us, units: 'μs', tol: { rel: 0.01 },
          errors: [
            { value: 2 * us, feedback: t`Expand the square root: $\sqrt{1 - 2x} \approx 1 - x$, so the lapse falls short of 1 by $GM/(rc^2)$, not $2GM/(rc^2)$.` },
            { value: us / 86400, feedback: t`That is per second of time; a day has $86\,400$ s.` },
          ],
          hints: [t`$\Delta\alpha \approx \dfrac{GM}{c^2}\left(\dfrac{1}{R_\oplus} - \dfrac{1}{r}\right)$, and $GM_\oplus/c^2 = 4.435$ mm.`, t`Multiply $\Delta\alpha$ by $86\,400$ s and express the result in μs.`],
          teach: t`The lapse of a static slicing is the gravitational clock rate, $\alpha \approx 1 - GM/(rc^2)$ in a weak field — an effect satellite navigation corrects for every day.`,
          explain: t`$\Delta\alpha = ${sci(dAlpha)}$; times $86\,400$ s it is $${us.toFixed(1)}$ μs per day. A real ${name} satellite also moves, and its speed slows it by about $${vel.toFixed(1)}$ μs per day — a separate effect. GPS clocks are tuned before launch to run slow by 4.465 parts in $10^{10}$, so that in orbit, with both effects, they keep time with the ground (Ashby, 2003).`,
          visual: gpsPic(rk, name),
        };
      },
    }),
    mcq({
      id: 'cp-hamiltonian-flrw', difficulty: 2,
      prompt: t`Slice an FLRW universe along cosmic time: $\alpha = 1$, $\beta^i = 0$, $\gamma_{ij} = a^2(t)\hat\gamma_{ij}$ with $\hat\gamma_{ij}$ the comoving metric of curvature $k$. Then $${R3} = 6k/a^2$ and $K_{ij} = -a\dot a\,\hat\gamma_{ij}/c$, so $K^2 - K_{ij}K^{ij} = 6H^2/c^2$. For dust or any perfect fluid at rest, $E = \rho c^2$. Which equation is the Hamiltonian constraint?`,
      visual: { type: 'gr-friedmann', params: { sliders: false, readout: false, t: [-14, 12], a: [0, 2] }, caption: 'Our universe’s scale factor (Planck 2018 fit): every slice along this history satisfies the Hamiltonian constraint.' },
      choices: [
        t`The Friedmann equation: $\dfrac{6k}{a^2} + \dfrac{6H^2}{c^2} = \dfrac{16\pi G\rho}{c^2}$, that is $H^2 = \dfrac{8\pi G}{3}\rho - \dfrac{kc^2}{a^2}$`,
        t`The acceleration equation, $\ddot a/a = -\tfrac{4\pi G}{3}\left(\rho + 3p/c^2\right)$`,
        t`The continuity equation, $\dot\rho = -3H\left(\rho + p/c^2\right)$`,
        t`None: for $k = 0$ the slices are flat, so the constraint is empty`,
      ],
      answer: 0,
      why: {
        1: t`It holds $\ddot a$, a second time derivative, and the constraints never do: it comes from the six evolution equations.`,
        2: t`Conservation follows from the constraints and the evolution together (step 31), not from the Hamiltonian constraint alone; here the momentum constraint is empty by isotropy.`,
        3: t`A flat slice can still bend in time: $K = -3H/c \neq 0$ while the universe expands, and $K^2 - K_{ij}K^{ij}$ carries the $H^2$.`,
      },
      hints: ['Constraints hold at most first time derivatives.'],
      teach: t`The Friedmann equation is cosmology's Hamiltonian constraint: the one condition every slice must meet.`,
      explain: t`$6k/a^2 + 6H^2/c^2 = 16\pi G\rho/c^2$; multiply by $c^2/6$: $H^2 + kc^2/a^2 = \tfrac{8\pi G}{3}\rho$. Step 31 found it as the time–time component, with no $\ddot a$; here it is $2G_{\mu\nu}n^\mu n^\nu$ with $n^\mu = (1/c, 0, 0, 0)$ — the same equation, seen as the constraint on each slice.`,
    }),
    num({
      id: 'cp-binding', difficulty: 3,
      gen(r) {
        const [m1, d] = r.pick([[0.5, 4], [0.6, 3], [0.75, 5]]);
        const m2 = round(1 - m1, 4);
        const ans = -(m1 * m2) / d;
        return {
          prompt: t`Brill–Lindquist data for two black holes momentarily at rest, in geometric units $G = c = 1$ with masses in units of the total: $\psi = 1 + \dfrac{m_1}{2r_1} + \dfrac{m_2}{2r_2}$. Far away $\psi \approx 1 + (m_1 + m_2)/(2r)$, so the total mass is $M = m_1 + m_2$. Near puncture 1, $\psi \approx \dfrac{m_1}{2r_1} + 1 + \dfrac{m_2}{2d}$; inverting through the throat shows that the mass seen from its far side is $M_1 = m_1\left(1 + \dfrac{m_2}{2d}\right)$, and likewise $M_2$. For $m_1 = ${m1}$, $m_2 = ${m2}$ and coordinate separation $d = ${d}$, find $M - (M_1 + M_2)$.`,
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: -ans, feedback: t`Mind the sign: $M_1 + M_2$ exceeds $m_1 + m_2$, so the whole is lighter than its parts.` },
            { value: ans / 2, feedback: t`Both holes gain: $M_1 + M_2 = m_1 + m_2 + \dfrac{m_1m_2}{2d} + \dfrac{m_2m_1}{2d}$.` },
          ],
          hints: [t`$M_1 + M_2 = m_1 + m_2 + \dfrac{m_1m_2}{2d} + \dfrac{m_2m_1}{2d}$.`, t`So $M - (M_1 + M_2) = -m_1m_2/d$.`],
          teach: t`Exact initial data for two black holes already contain the Newtonian binding energy: with $G = c = 1$, the whole weighs $m_1m_2/d$ less than its parts.`,
          explain: t`$M - (M_1 + M_2) = -m_1m_2/d = ${round(ans, 4)}$ — exactly $-Gm_1m_2/(c^2d)$, the Newtonian binding energy, although nothing Newtonian went in: it came out of the Hamiltonian constraint. (For close holes, $M_1$ and $M_2$ are only approximately each hole's own mass, and $d$ is a coordinate separation.)`,
          visual: blSurface({ d, q: m1, caption: t`These Brill–Lindquist data: the height is $\psi^{-2}$ on the plane through both punctures, masses $${m1}$ and $${m2}$ of the total, $G = c = 1$. Drag to rotate.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Arnowitt, Deser & Misner, “The dynamics of general relativity” (1962), reprinted in Gen. Relativ. Gravit. 40, 1997 (2008)', url: 'https://arxiv.org/abs/gr-qc/0405109' },
    { label: 'Gourgoulhon, “3+1 formalism and bases of numerical relativity”, lecture notes (2007)', url: 'https://arxiv.org/abs/gr-qc/0703035' },
    { label: 'Baumgarte & Shapiro, “On the numerical integration of Einstein’s field equations”, Phys. Rev. D 59, 024007 (1998)', url: 'https://arxiv.org/abs/gr-qc/9810065' },
    { label: 'Brill & Lindquist, “Interaction energy in geometrostatics”, Phys. Rev. 131, 471 (1963)', url: 'https://doi.org/10.1103/PhysRev.131.471' },
    { label: 'Pretorius, “Evolution of binary black-hole spacetimes”, Phys. Rev. Lett. 95, 121101 (2005)', url: 'https://arxiv.org/abs/gr-qc/0507014' },
    { label: 'Campanelli, Lousto, Marronetti & Zlochower, “Accurate evolutions of orbiting black-hole binaries without excision”, Phys. Rev. Lett. 96, 111101 (2006)', url: 'https://arxiv.org/abs/gr-qc/0511048' },
    { label: 'Ashby, “Relativity in the Global Positioning System”, Living Rev. Relativ. 6, 1 (2003)', url: 'https://doi.org/10.12942/lrr-2003-1' },
  ],
});
