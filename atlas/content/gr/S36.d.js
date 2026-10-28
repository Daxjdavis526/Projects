// The Alcubierre metric, its energy budget and the 2021–2024 claims — Derivation
// Mode. ds² = −c²dt² + (dx − v_s f(r_s)dt)² + dy² + dz²: lapse 1, shift β_x =
// −v_s f, flat slices (step 32). K_ij = (∂_iβ_j + ∂_jβ_i)/(2c), K = −(v_s/c)∂_x f;
// Hamiltonian constraint on the flat slice: E = (c⁴/16πG)(K² − K_ijK^ij) =
// −(c²v_s²/32πG)[(∂_y f)² + (∂_z f)²] = −(c⁴/8πG)(v_s²/4c²)((y² + z²)/r_s²)(f′)².
// Thin wall: ∫ sin²θ dΩ = 8π/3, ∫(f′)²r²dr ≈ R²σ/3 (∫sech⁴ = 4/3), so E_tot/c² ≈
// −β²c²R²σ/(36G) (direct integration agrees to 3×10⁻⁵ at σR = 100): −3.74×10²⁹ kg
// for R = 100 m, σ = 1/m, β = 1; σ = 2/(100 ℓ_P) gives −4.6×10⁶² kg. Average of
// T(k,k) over null directions (G = c = 1): ⟨T(k,k)⟩ = 2E + (v²/12π)∂_x[(1 − f)∂_x f],
// so ∫⟨T(k,k)⟩dV = 2∫E dV < 0: the null condition fails somewhere, even on the
// axis where E = 0 (SymPy, scratch v36.py).
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { C, G, M_SUN, LY, L_PLANCK, sci, round } from './_derivlate.js';

const t = String.raw;
const R3 = '{}^{(3)}\\!R';

// ── numbers ─────────────────────────────────────────────────────────────────

const bill = (R, sigma, beta) => (beta ** 2 * C ** 2 * R * R * sigma) / (36 * G);   // |E|/c², kg (thin wall)
const SIGMA_QI = 2 / (100 * L_PLANCK);                                              // wall ~100 Planck lengths
const AXIS = C ** 4 / (48 * Math.PI * G);                                            // J/m³ per (β²σ²·m²)
const NUCLEAR = 2.3e17 * C ** 2;                                                     // J/m³, nuclear matter

// ── pictures ────────────────────────────────────────────────────────────────

// shape function f(r) of the tanh top hat, R = 1, steepness s, written for a point (x, h)
const r_ = 'sqrt(x^2 + h^2 + 1e-9)';
const T1 = `tanh(s*(${r_} + 1))`, T2 = `tanh(s*(${r_} - 1))`, N = '(2*tanh(s))';
const F = `((${T1} - ${T2})/${N})`;
const FP = `(s*(${T2}^2 - ${T1}^2)/${N})`;
const FPP = `(s^2*(2*(1 - ${T2}^2)*${T2} - 2*(1 - ${T1}^2)*${T1})/${N})`;
const FX = `(${FP}*x/${r_})`;
const FXX = `(${FPP}*x^2/(x^2 + h^2 + 1e-9) + ${FP}*h^2/${r_}^3)`;
const EUL = `(-(${FP})^2*h^2/(x^2 + h^2 + 1e-9))`;                   // 32πE/v²
const AVG = `(2*${EUL} + (8/3)*((1 - ${F})*${FXX} - ${FX}^2))`;     // 32π⟨T(k,k)⟩/v²

const linePic = ({ h = 0, s = 4, sliders = false, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [-2.2, 2.2], y: [-14, 14.5], xlabel: 'position along the direction of motion, x / R', ylabel: 'units of v²/(32π)  (G = c = 1)', axesAt: 'edge',
    ...(sliders ? {
      sliders: [
        { key: 'h', label: 'Distance of the line from the axis $h/R$', min: 0, max: 1.5, step: 0.01, value: h, explain: 'The line runs parallel to the direction of motion at this distance from it; $h = 0$ is the axis itself.' },
        { key: 's', label: 'Wall steepness $\\sigma R$', min: 2, max: 4, step: 0.05, value: s, explain: 'The wall is about $2/\\sigma$ thick.' },
      ],
    } : { constants: { h, s } }),
    curves: [
      { fn: EUL, color: 'gold', width: 2.6 },
      { fn: AVG, color: 'violet', width: 2.4 },
    ],
    hlines: [{ y: 0, color: 'ink3' }],
    vlines: [{ x: -1, color: 'ink4' }, { x: 1, color: 'ink4' }],
    points: [
      { x: -2.1, y: 13.3, r: 0.01, color: 'gold', label: 'gold: energy density, free-falling observers', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: -2.1, y: 11.9, r: 0.01, color: 'violet', label: 'violet: null energy averaged over light rays', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: caption ?? t`Along a line parallel to the bubble's motion, at distance $h$ from it, through an Alcubierre bubble of radius $R$ (dotted lines: the wall's middle): the energy density $E$ the free-falling (Eulerian) observers measure, and the average of $T_{\mu\nu}k^\mu k^\nu$ over all light-ray directions $k$. Where the violet curve is negative, some light ray sees negative energy.`,
});

// the Eulerian energy density in the plane z = 0 (doughnut), R = 1, s = 4
const FPxy = '(4*(tanh(4*(sqrt(x^2 + y^2) - 1))^2 - tanh(4*(sqrt(x^2 + y^2) + 1))^2)/(2*tanh(4)))';
const doughnutPic = {
  type: 'surface3d',
  params: {
    z: `-(${FPxy})^2*y^2/(x^2 + y^2 + 1e-9)`, domain: [[-2, 2], [-2, 2]], n: 70, zscale: 0.18, axisLabels: ['x (motion)', 'y', 'E'], axisLen: 2.4, pitch: 0.75,
  },
  caption: t`The energy density measured by the free-falling (Eulerian) observers, in the plane through the centre of a bubble moving along $x$ (radius 1, wall steepness 4, units $v^2/32\pi$ with $G = c = 1$): a trough in the wall, deepest at the sides, zero on the line of motion and everywhere inside and outside. Mathematics: no such matter is known.`,
};

// the wall profile and the integrand of the energy bill
const wallPic = {
  type: 'graph',
  params: {
    x: [0, 2], y: [-0.2, 1.25], xlabel: 'distance from the bubble centre r / R', ylabel: '', axesAt: 'edge',
    curves: [
      { fn: '(tanh(10*(x + 1)) - tanh(10*(x - 1)))/(2*tanh(10))', color: 'accent', width: 2.6 },
      { fn: '((tanh(10*(x - 1))^2 - tanh(10*(x + 1))^2)/(2*tanh(10)))^2*x^2', color: 'bad', width: 2.4 },
    ],
    shade: [{ fn: '((tanh(10*(x - 1))^2 - tanh(10*(x + 1))^2)/(2*tanh(10)))^2*x^2', from: 0.5, to: 1.5, color: 'bad', alpha: 0.2 }],
    points: [
      { x: 0.05, y: 0.82, r: 0.01, color: 'accent', label: 'blue: shape f(r)', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: 0.05, y: 0.7, r: 0.01, color: 'bad', label: 'red: (f′)² r² ÷ σ², the integrand', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`A thin-walled bubble, $\sigma R = 10$: the shape function $f(r)$ falls from 1 to 0 across the wall, and the integrand $(f')^2r^2$ of the energy bill (divided by $\sigma^2$ to fit) is a narrow spike there. Its area is about $R^2\sigma/3$.`,
};

// a straight-line trip on a spacetime diagram (schematic)
const tripPic = (ly, vs) => ({
  type: 'graph',
  params: {
    x: [0, round(ly * 1.15, 4)], y: [0, round((ly / vs) * 1.6, 4)], xlabel: 'distance (light-years)', ylabel: 'time in the distant stars’ frame (years)', axesAt: 'edge',
    curves: [
      { fn: `x/${vs}`, domain: [0, ly], color: 'gold', width: 2.6 },
      { fn: 'x', domain: [0, round((ly / vs) * 1.55, 4)], color: 'ink4', width: 1.4, dash: true },
    ],
    points: [
      { x: ly, y: round(ly / vs, 4), color: 'gold', r: 5, label: 'arrival', labelDx: -10, labelDy: -12, labelAlign: 'right' },
      { x: 0.02, y: round((ly / vs) * 1.5, 4), r: 0.01, color: 'ink3', label: 'dashed: a light ray', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`The hypothetical bubble's path at $v_s = ${vs}c$ against a light ray (dashed), relative to the distant stars. Schematic, and not achievable: it needs negative energy, and a crew could not lay the wall ahead of them.`,
});

// ── coding exercise ─────────────────────────────────────────────────────────

const CODE_START = `import sympy as sp

x, y, z, v, c, G = sp.symbols('x y z v c G', positive=True)
X = [x, y, z]
f = sp.Function('f')(x, y, z)            # the bubble's shape on this slice
beta = [-v*f, 0, 0]                      # shift beta_i (the slice is flat, so index position does not matter)

def K_down(i, j):
    # K_ij = (d_i beta_j + d_j beta_i)/(2 alpha c), with alpha = 1, a flat slice and d_t gamma_ij = 0
    return 0                             # replace this line

K = sp.Matrix(3, 3, lambda i, j: K_down(i, j))
trK = sp.simplify(K.trace())
KK = sp.simplify(sum(K[i, j]**2 for i in range(3) for j in range(3)))
E = sp.simplify(c**4/(16*sp.pi*G)*(trK**2 - KK))     # Hamiltonian constraint on a flat slice
print('K =', trK)
print('E =', E)
`;
const CODE_ANSWER = CODE_START.replace('    return 0                             # replace this line', '    return (sp.diff(beta[j], X[i]) + sp.diff(beta[i], X[j]))/(2*c)');

export default lesson({
  id: 'gr.S36.d',
  title: 'The Alcubierre metric, its energy budget and the 2021–2024 claims',
  minutes: 16, difficulty: 3, mode: 'derivation', badges: ['math', 'refuted'],
  intro: t`In 1994 Miguel Alcubierre wrote down a geometry that carries a bubble of flat space at any speed $v_s$ — even faster than light relative to the distant stars — while everything inside floats in free fall. Like Gödel's universe and the wormholes of steps 34 and 35, it is a solution read backwards: the metric is chosen, and Einstein's equations dictate the matter. This lesson derives the bill. In 3+1 form (step 32) the metric has lapse 1, a shift that is the bubble's velocity profile, and flat slices, so the Hamiltonian constraint alone gives the energy density seen by the free-falling observers: **negative**, throughout the wall.

The total is roughly $-\beta^2c^2R^2\sigma/(36G)$ as a mass — about $-0.2$ solar masses for a 100 m bubble at light speed with a 2 m wall, and some $10^{62}$ kg once quantum inequalities thin the wall. In 2021 two papers claimed faster-than-light "solitons" with only positive energy; they had checked one family of observers. Averaged over light rays, the null energy of a warp bubble integrates to a negative number, so the null condition fails somewhere (Santiago, Schuster and Visser, 2022). The positive-energy solutions that survive are shells coasting slower than light. The geometry is **mathematics**; the positive-energy faster-than-light claims are **refuted as stated**.`,
  equation: t`ds^2 = -c^2dt^2 + \left(dx - v_sf(r_s)\,dt\right)^2 + dy^2 + dz^2, \qquad E = -\frac{c^4}{8\pi G}\,\frac{v_s^2}{4c^2}\,\frac{y^2 + z^2}{r_s^2}\left(\frac{df}{dr_s}\right)^2`,
  symbols: [
    { tex: 'v_s', text: t`the bubble's speed relative to the distant stars, $dx_s/dt$; nothing in the geometry limits it to below $c$` },
    { tex: 'x_s(t)', text: 'the position of the bubble’s centre on the $x$-axis' },
    { tex: 'r_s', text: t`the distance from the bubble's centre, $\sqrt{(x - x_s)^2 + y^2 + z^2}$` },
    { tex: 'f(r_s)', text: t`the shape function: 1 inside the bubble, 0 far away, falling across the wall. Alcubierre's choice: $f = \dfrac{\tanh\sigma(r_s + R) - \tanh\sigma(r_s - R)}{2\tanh\sigma R}$, radius $R$, wall steepness $\sigma$ (thickness about $2/\sigma$)` },
    { tex: 'E', text: t`the energy density measured by the **Eulerian** observers, who move along the normal to the slices $t = $ const — inside the bubble, the passengers. In J/m³` },
    { tex: 'y^2 + z^2', text: 'the squared distance from the line of motion' },
    { tex: 'G,\\ c', text: "Newton's constant and the speed of light" },
  ],
  why: 'Warp drives are the most famous claim made in general relativity’s name. Deriving their energy bill, and seeing exactly what the 2021 papers left out, is a complete lesson in how to judge such a claim.',
  visual: {
    ...linePic({ sliders: true }),
    title: 'Two ways to measure the cost',
    lead: t`The free-falling (Eulerian) observers are one family. Energy conditions ask about **every** observer — and every light ray. Compare what the Eulerian observers measure (gold) with the null energy averaged over all light-ray directions (violet), along lines through the bubble parallel to its motion.`,
    tasks: [
      t`At $h = 0$, on the line of motion, the Eulerian energy density is exactly zero — yet the violet curve dips below zero in the wall: some light ray there sees negative energy. A check that uses only the Eulerian observers misses it.`,
      t`Raise $h$: the gold curve turns negative in the wall, deepest near $h = R$, the sides of the bubble.`,
      t`Steepen the wall: both dips deepen and narrow — the price of a thin wall.`,
    ],
  },
  example: {
    prompt: t`Find the energy density the Eulerian observers measure for Alcubierre's metric, using the 3+1 machinery of step 32, and then the total energy of a thin-walled bubble of radius $R$ and wall steepness $\sigma$.`,
    visual: doughnutPic,
    steps: [
      { label: '3+1 form', text: t`Compare with $ds^2 = -\alpha^2c^2dt^2 + \gamma_{ij}(dx^i + \beta^idt)(dx^j + \beta^jdt)$: lapse $\alpha = 1$, shift $\beta^x = -v_sf$, $\beta^y = \beta^z = 0$, and flat slices, $\gamma_{ij} = \delta_{ij}$. The Eulerian observers move with $dx/dt = -\beta^x = v_sf$: inside the bubble ($f = 1$) they ride along at $v_s$. With $\alpha = 1$ they are in free fall, and their proper time is $d\tau = dt$.` },
      { label: 'Extrinsic curvature', text: t`$\partial_t\gamma_{ij} = 0$ and $D_i = \partial_i$, so $K_{ij} = \left(\partial_i\beta_j + \partial_j\beta_i\right)/(2c)$: $K_{xx} = -\frac{v_s}{c}\partial_xf$, $K_{xy} = -\frac{v_s}{2c}\partial_yf$, $K_{xz} = -\frac{v_s}{2c}\partial_zf$, the rest zero. The trace is $K = -\frac{v_s}{c}\partial_xf$: volumes shrink ahead of the bubble and grow behind it — a feature of this slicing, not of every warp drive (Natário, 2002).` },
      { label: 'Hamiltonian constraint', text: t`On a flat slice $${R3} = 0$, so $\frac{16\pi G}{c^4}E = K^2 - K_{ij}K^{ij} = \frac{v_s^2}{c^2}\left[(\partial_xf)^2 - (\partial_xf)^2 - \tfrac12(\partial_yf)^2 - \tfrac12(\partial_zf)^2\right]$. With $\partial_yf = f'y/r_s$ and $\partial_zf = f'z/r_s$: $$E = -\frac{c^4}{8\pi G}\,\frac{v_s^2}{4c^2}\,\frac{y^2 + z^2}{r_s^2}\,(f')^2.$$ Negative wherever $f' \neq 0$ off the axis: a ring of negative energy in the wall.` },
      { label: 'Integrate', text: t`For a thin wall, $f' \approx -\tfrac{\sigma}{2}\,\text{sech}^2\sigma(r_s - R)$. The angles give $\int\frac{y^2 + z^2}{r_s^2}\,d\Omega = \int\sin^2\theta\,d\Omega = \frac{8\pi}{3}$, and the radius $\int(f')^2r_s^2\,dr_s \approx R^2\frac{\sigma^2}{4}\cdot\frac{4}{3\sigma} = \frac{R^2\sigma}{3}$, using $\int\text{sech}^4u\,du = \tfrac43$. So $$\frac{E_{\text{tot}}}{c^2} = -\frac{c^2v_s^2}{32\pi G}\cdot\frac{8\pi}{3}\cdot\frac{R^2\sigma}{3}\cdot\frac{1}{c^2} = -\frac{\beta^2c^2R^2\sigma}{36G}, \quad \beta = \frac{v_s}{c}.$$` },
      { label: 'Numbers', text: t`For $R = 100$ m, $\sigma = 1$ m⁻¹ (a wall about 2 m thick) and $\beta = 1$: $${sci(-bill(100, 1, 1))}$ kg, or $${round(-bill(100, 1, 1) / M_SUN, 2)}$ solar masses; direct numerical integration agrees to $3\times10^{-5}$. Quantum inequalities limit such a wall to about 100 Planck lengths (Pfenning and Ford, 1997): $\sigma \approx 2/(100\ell_P)$ gives $${sci(-bill(100, SIGMA_QI, 1), 2)}$ kg — their estimate is $-6.2\times10^{62}$ kg, some $10^{10}$ times the mass of the visible universe.` },
      { label: 'Sense check', text: t`The bill grows as $\beta^2R^2\sigma$: faster, bigger and thinner-walled bubbles all cost more. Inside, the passengers float in flat space with $d\tau = dt$ — no acceleration, no time dilation. The appeal and the price sit in different places: the price is all in the wall.` },
    ],
    answer: t`$E = -\frac{c^4}{8\pi G}\frac{v_s^2}{4c^2}\frac{y^2 + z^2}{r_s^2}(f')^2 \le 0$, and for a thin wall $E_{\text{tot}}/c^2 \approx -\beta^2c^2R^2\sigma/(36G)$: $${sci(-bill(100, 1, 1), 2)}$ kg for $R = 100$ m, $\sigma = 1$ m⁻¹, $\beta = 1$.`,
  },
  practice: [
    expr({
      id: 'york-time', difficulty: 2,
      prompt: t`Take a soft bubble shape $f = e^{-r_s^2/w^2}$, centred at the origin at this instant, so $r_s^2 = x^2 + y^2 + z^2$. Using $K = -\dfrac{v_s}{c}\,\partial_xf$ for Alcubierre's slices, find the trace of the extrinsic curvature as a function of $x$, $y$ and $z$.`,
      visual: doughnutPic,
      answer: '2*v_s*x*exp(-(x^2 + y^2 + z^2)/w^2)/(c*w^2)', answerTeX: t`\frac{2v_sx}{cw^2}\,e^{-(x^2 + y^2 + z^2)/w^2}`, lhs: 'K',
      vars: { v_s: [0.5, 2], x: [-1, 1], y: [-1, 1], z: [-1, 1], w: [0.8, 2], c: [0.8, 2] },
      errors: [
        { answer: '-2*v_s*x*exp(-(x^2 + y^2 + z^2)/w^2)/(c*w^2)', feedback: t`$\partial_xf = -\dfrac{2x}{w^2}f$ is negative ahead of the centre, and $K = -\dfrac{v_s}{c}\partial_xf$ flips that sign.` },
        { answer: 'v_s*x*exp(-(x^2 + y^2 + z^2)/w^2)/(c*w^2)', feedback: t`Differentiate $-x^2/w^2$: it gives $-2x/w^2$.` },
        { answer: '2*v_s*x*exp(-(x^2 + y^2 + z^2)/w^2)/w^2', feedback: t`Keep the $1/c$: $K$ is a curvature, in m⁻¹.` },
      ],
      hints: [t`$\partial_x e^{-r_s^2/w^2} = -\dfrac{2x}{w^2}e^{-r_s^2/w^2}$.`],
      teach: t`$K = -\frac{v_s}{c}\partial_xf$: positive ahead of the bubble (volumes shrinking) and negative behind (volumes growing) — in Alcubierre's slicing.`,
      explain: t`$K = -\frac{v_s}{c}\cdot\left(-\frac{2x}{w^2}\right)e^{-r_s^2/w^2} = \frac{2v_sx}{cw^2}e^{-r_s^2/w^2}$. With $K = -\nabla_\mu n^\mu$, $K > 0$ means the Eulerian observers converge: space "contracts" ahead and "expands" behind. That famous picture is a property of this slicing; Natário's warp drive has $K = 0$ everywhere and still needs negative energy.`,
    }),
    mcq({
      id: 'energy-where', difficulty: 2,
      prompt: t`According to $E = -\frac{c^4}{8\pi G}\frac{v_s^2}{4c^2}\frac{y^2 + z^2}{r_s^2}(f')^2$, where do the Eulerian observers measure negative energy density?`,
      visual: doughnutPic,
      choices: [
        t`In the wall wherever it is off the line of motion — deepest at the sides, the same ahead of and behind the bubble — and nowhere inside, outside, or on the axis`,
        t`Only ahead of the bubble, where space contracts`,
        t`Inside the bubble, around the passengers`,
        t`Everywhere, falling off slowly with distance`,
      ],
      answer: 0,
      why: {
        1: t`$E$ depends on $y^2 + z^2$ and $(f')^2$, both unchanged by $x \to -x$: front and back are alike. The contraction ahead is $K$, a different quantity.`,
        2: t`Inside, $f = 1$ and $f' = 0$: the passengers sit in flat, empty space.`,
        3: t`$(f')^2$ vanishes outside the wall; for Alcubierre's tanh profile it dies off exponentially.`,
      },
      hints: [t`Which factor vanishes inside and outside the wall, and which vanishes on the $x$-axis?`],
      teach: 'The negative energy of an Alcubierre bubble sits in a ring around the wall, symmetric front to back — not "ahead of the ship".',
      explain: t`$(f')^2$ is nonzero only in the wall; $(y^2 + z^2)/r_s^2 = \sin^2\theta$ is zero on the axis and largest at the sides. So the Eulerian energy density forms a negative ring around the wall, the same in front and behind.`,
    }),
    expr({
      id: 'wall-integral', difficulty: 3,
      prompt: t`For a thin wall ($\sigma R \gg 1$), $f'(r) \approx -\tfrac{\sigma}{2}\,\text{sech}^2\sigma(r - R)$ is sharply peaked at $r = R$. Evaluate the radial part of the energy bill, $\displaystyle\int_0^\infty (f')^2r^2\,dr$, to leading order. ($\int_{-\infty}^{\infty}\text{sech}^4u\,du = \tfrac43$)`,
      visual: wallPic,
      answer: 'R^2*sigma/3', answerTeX: t`\frac{R^2\sigma}{3}`, lhs: t`\int_0^\infty (f')^2r^2\,dr`,
      vars: { R: [5, 50], sigma: [0.5, 5] },
      errors: [
        { answer: 'R^2*sigma^2/3', feedback: t`Change variables, $u = \sigma(r - R)$: $dr = du/\sigma$ removes one power of $\sigma$.` },
        { answer: 'R^2*sigma/4', feedback: t`Include $\int\text{sech}^4u\,du = \tfrac43$: $\tfrac{\sigma^2}{4}\cdot\tfrac{4}{3\sigma}R^2$.` },
        { answer: '4*R^2*sigma/3', feedback: t`$(f')^2 = \tfrac{\sigma^2}{4}\text{sech}^4$: keep the $\tfrac14$.` },
      ],
      hints: [t`The integrand is a spike at $r = R$: replace $r^2$ by $R^2$.`, t`$\displaystyle\frac{\sigma^2}{4}R^2\int\text{sech}^4\sigma(r - R)\,dr = \frac{\sigma^2}{4}R^2\cdot\frac{4}{3\sigma}$.`],
      teach: t`The wall contributes $\int(f')^2r^2dr \approx R^2\sigma/3$: the bill grows with the bubble's area and with the wall's steepness.`,
      explain: t`$\frac{\sigma^2}{4}R^2\cdot\frac{4}{3\sigma} = \frac{R^2\sigma}{3}$. With the angular factor $8\pi/3$ and the prefactor $c^2v_s^2/(32\pi G)$ this gives $E_{\text{tot}}/c^2 = -\beta^2c^2R^2\sigma/(36G)$ — accurate to $8\times10^{-4}$ already at $\sigma R = 20$, and $3\times10^{-5}$ at $\sigma R = 100$.`,
    }),
    mcq({
      id: 'null-average', difficulty: 3,
      prompt: t`Averaging $T_{\mu\nu}k^\mu k^\nu$ over all light-ray directions $k^\mu = n^\mu + \hat s^\mu$ at a point, for Alcubierre's bubble, SymPy gives (with $G = c = 1$) $$\left\langle T_{\mu\nu}k^\mu k^\nu\right\rangle = 2E + \frac{v_s^2}{12\pi}\,\partial_x\!\left[(1 - f)\,\partial_xf\right].$$ The 2021 papers checked that $E \ge 0$ for their Eulerian observers. What does this identity show for Alcubierre's bubble?`,
      visual: linePic({ h: 0.6, s: 4, caption: t`Along a line at $h = 0.6R$ from the axis: the Eulerian energy density (gold) and the null energy averaged over light rays (violet), units $v^2/(32\pi)$ with $G = c = 1$.` }),
      choices: [
        t`Integrated over all space the second term vanishes (it is a derivative of something that dies away), so $\int\left\langle T_{\mu\nu}k^\mu k^\nu\right\rangle dV = 2\int E\,dV < 0$: some light ray somewhere sees negative energy, and the null condition fails`,
        t`Nothing: the average could still be positive everywhere`,
        t`Only the weak condition fails, because only $E$ is negative`,
        t`The null condition holds, because only the Eulerian observers measure physical energy`,
      ],
      answer: 0,
      why: {
        1: t`A function whose integral is negative must be negative somewhere — and if the average over directions is negative, at least one direction is.`,
        2: t`The weak condition includes the null one; and the identity shows the null condition fails too.`,
        3: t`Energy conditions are demanded of every observer and every light ray; the Eulerian observers are one family among infinitely many.`,
      },
      hints: [t`What is $\int\partial_x[(1 - f)\partial_xf]\,dx$ when $\partial_xf \to 0$ far away?`, t`If an average over directions is negative, can every direction be non-negative?`],
      teach: 'The null energy averaged over light rays integrates to twice the (negative) Eulerian total: a warp bubble breaks the null condition somewhere, whatever its Eulerian observers see.',
      explain: t`The divergence integrates to zero, so the averaged null energy integrates to $2\int E\,dV$, negative. Santiago, Schuster and Visser (2022) proved the general version: generic warp drives violate the null energy condition, whatever the Eulerian energy density does. The 2021 superluminal "positive-energy" claims checked only the Eulerian observers, and are refuted as stated.`,
    }),
    num({
      id: 'axis-null', difficulty: 3,
      gen(r) {
        const [beta, sigma] = r.pick([[1, 1], [0.5, 1], [1, 2]]);
        const val = -AXIS * beta * beta * sigma * sigma;
        return {
          prompt: t`On the line of motion the Eulerian observers measure $E = 0$. There, at the middle of a thin wall, $f \approx \tfrac12$, $f' \approx -\sigma/2$ and $f'' \approx 0$. Using the averaged identity, restored to SI units, $\left\langle T_{\mu\nu}k^\mu k^\nu\right\rangle = 2E + \frac{c^4}{12\pi G}\beta^2\left[(1 - f)f'' - (f')^2\right]$ with $\beta = v_s/c$, find the average null energy there for $\beta = ${beta}$ and $\sigma = ${sigma}$ m⁻¹, in J/m³.`,
          answer: val, units: 'J/m^3', tol: { rel: 0.01 },
          errors: [
            { value: 0, feedback: 'That is what the Eulerian observers see. The light rays see the second term.' },
            { value: -val, feedback: t`$(1 - f)f'' - (f')^2 = -\sigma^2/4$ is negative.` },
            { value: val * 4, feedback: t`$(f')^2 = (\sigma/2)^2 = \sigma^2/4$.` },
          ],
          hints: [t`$(1 - f)f'' - (f')^2 \approx -\sigma^2/4$.`, t`So the average is $-\dfrac{c^4\beta^2\sigma^2}{48\pi G}$, with $c^4/(48\pi G) = ${sci(AXIS)}$ J/m; times $\sigma^2$ in m⁻² it gives J/m³.`],
          teach: t`Where the free-falling observers see nothing, light rays crossing the wall see on average $-c^4\beta^2\sigma^2/(48\pi G)$ — about $${sci(-AXIS, 2)}$ J/m³ for a 2 m wall at light speed.`,
          explain: t`$-\dfrac{c^4\beta^2\sigma^2}{48\pi G} = ${sci(val)}$ J/m³ — $${sci(Math.abs(val) / NUCLEAR, 2)}$ times the energy density of nuclear matter, and negative. The average being negative means at least one direction is: light rays crossing the axis in the wall see negative energy where the Eulerian observers measure none.`,
          visual: linePic({ h: 0, s: 4, caption: t`On the axis ($h = 0$): the Eulerian energy density (gold) is zero everywhere, while the null energy averaged over light rays (violet) dips negative in the wall. Units $v^2/(32\pi)$, $G = c = 1$, $\sigma R = 4$.` }),
        };
      },
    }),
    code({
      id: 'sympy-alcubierre', difficulty: 3,
      prompt: t`Derive the Eulerian energy density yourself. The program sets up a flat slice with an arbitrary bubble shape \`f(x, y, z)\` and the shift $\beta_x = -v_sf$. Complete \`K_down(i, j)\` so that it returns $K_{ij} = (\partial_i\beta_j + \partial_j\beta_i)/(2c)$; the program then applies the Hamiltonian constraint, $E = \frac{c^4}{16\pi G}\left(K^2 - K_{ij}K^{ij}\right)$.`,
      visual: doughnutPic,
      starter: CODE_START,
      answer: CODE_ANSWER,
      tests: [
        { name: t`$K = -\frac{v}{c}\,\partial_xf$`, code: 'sp.simplify(trK + v/c*sp.diff(f, x)) == 0' },
        { name: t`$E = -\frac{c^2v^2}{32\pi G}\left[(\partial_yf)^2 + (\partial_zf)^2\right]$`, code: 'sp.simplify(E + c**2*v**2*(sp.diff(f, y)**2 + sp.diff(f, z)**2)/(32*sp.pi*G)) == 0' },
        { name: t`spherical bubble: $E = 0$ on the axis but not off it`, code: '(lambda Eb: sp.simplify(Eb.subs({y: 0, z: 0})) == 0 and sp.simplify(Eb.subs({x: 0, y: 1, z: 0})) != 0)(E.subs(f, sp.exp(-(x**2 + y**2 + z**2))).doit())' },
      ],
      hints: [t`\`sp.diff(beta[j], X[i])\` is the derivative $\partial_i\beta_j$.`, 'In code: `return (sp.diff(beta[j], X[i]) + sp.diff(beta[i], X[j]))/(2*c)`.'],
      teach: 'Three lines of 3+1 algebra give the warp bubble’s energy density: lapse 1 and flat slices leave only the shift.',
      explain: t`$K_{xx} = -\frac{v}{c}\partial_xf$ and $K_{xy} = -\frac{v}{2c}\partial_yf$, $K_{xz} = -\frac{v}{2c}\partial_zf$; then $K^2 - K_{ij}K^{ij} = -\frac{v^2}{2c^2}\left[(\partial_yf)^2 + (\partial_zf)^2\right]$ and $E = -\frac{c^2v^2}{32\pi G}\left[(\partial_yf)^2 + (\partial_zf)^2\right]$, never positive. The same three lines, with other shifts, give the Eulerian energy of any warp drive of this class — which is exactly why checking only them is not enough.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-proxima', difficulty: 3, transfer: true,
      gen(r) {
        const vs = r.pick([10, 2, 100]);
        const ly = 4.2465;                                        // Proxima Centauri
        const days = (ly / vs) * 365.25;
        return {
          prompt: t`A mission planner asks: if an Alcubierre bubble could be laid along the route to Proxima Centauri, 4.2465 light-years away, and moved at $v_s = ${vs}c$ relative to the distant stars, how many days would the passengers age during the trip? (Lapse $\alpha = 1$; 1 yr = 365.25 days.)`,
          answer: days, units: 'day', tol: { rel: 0.01 },
          errors: [
            { value: ly * 365.25, feedback: t`That is light's travel time. The geometry lets the bubble move at $${vs}c$ relative to the distant stars.` },
            { value: days / vs, feedback: t`Divide the distance by the speed once: $4.2465\text{ ly}/(${vs}c)$ years.` },
          ],
          hints: [t`With $\alpha = 1$, the passengers' proper time equals coordinate time: $d\tau = dt$.`, t`$t = D/v_s = 4.2465/${vs}$ years.`],
          teach: t`Inside the bubble $d\tau = dt$: the passengers age exactly as the distant stars' clocks run — no time dilation either way.`,
          explain: t`$\tau = t = 4.2465\text{ ly}/(${vs}c) = ${round(ly / vs, 4)}$ yr $= ${round(days, 4)}$ days. That is the geometry's promise. Its bill: negative energy far beyond anything known, a wall that would have to be laid along the route in advance (the front of a superluminal bubble is out of the crew's causal reach; Everett and Roman, 1997), and quantum instability at the front. No physical route to such a trip is known.`,
          visual: tripPic(ly, vs),
        };
      },
    }),
    mcq({
      id: 'cp-literature', difficulty: 2,
      prompt: 'Which summary matches the warp-drive literature up to 2026?',
      visual: linePic({ h: 0, s: 4, caption: t`The point the 2021 claims missed: on the axis the Eulerian energy density (gold) is zero, but the null energy averaged over light rays (violet) is negative in the wall.` }),
      choices: [
        t`The superluminal positive-energy claims (Lentz; Fell and Heisenberg, 2021) checked only Eulerian observers and are refuted as stated (Santiago, Schuster and Visser, 2022); the positive-energy solutions that survive (Bobrick and Martire, 2021; Fuchs et al., 2024) are shells coasting slower than light; and a 2026 review (Barzegar, Buchert and Vigneron) adds obstacles beyond energy conditions, such as global hyperbolicity and the definition of mass`,
        t`Fuchs et al. (2024) built a faster-than-light warp drive from ordinary matter`,
        t`Santiago, Schuster and Visser showed that warp metrics do not solve Einstein's equations`,
        t`The 2026 review confirmed positive-energy faster-than-light drives`,
      ],
      answer: 0,
      why: {
        1: t`Their shell moves at constant speed, slower than light, and has no way to accelerate. It satisfies the energy conditions precisely because it is subluminal.`,
        2: t`Every metric solves Einstein's equations with some $T_{\mu\nu}$ — read backwards. Their point was that the required $T_{\mu\nu}$ breaks the null energy condition.`,
        3: t`It concluded the opposite: most physicality claims must be reassessed, and it found further no-go results.`,
      },
      hints: ['Separate three things: faster than light or not; positive energy for which observers; and what the critics actually proved.'],
      teach: 'No known physical route to faster-than-light travel exists: every superluminal warp drive breaks the null energy condition for some observer, and the positive-energy solutions coast slower than light.',
      explain: t`The 2021 superluminal claims rested on positive Eulerian energy alone; with all observers — as in the averaged identity of this lesson — the null condition fails. Subluminal, constant-velocity shells of ordinary matter are allowed, and are not faster-than-light drives. The February 2026 review classifies warp spacetimes, proves new no-go theorems and names obstacles beyond energy conditions.`,
    }),
    num({
      id: 'cp-qi-ratio', difficulty: 3,
      gen(r) {
        const R = r.pick([100, 10, 1000]);
        const m = bill(R, SIGMA_QI, 1);
        const ratio = m / 1e53;
        return {
          prompt: t`Quantum inequalities limit an Alcubierre wall to roughly 100 Planck lengths, so $\sigma \approx 2/(100\ell_P)$ with $\ell_P = 1.616\times10^{-35}$ m. For a bubble of radius $R = ${R}$ m at $\beta = 1$, compute $|E_{\text{tot}}|/c^2 = \beta^2c^2R^2\sigma/(36G)$ and divide by $10^{53}$ kg, roughly the mass of the visible universe. ($c = 2.998\times10^8$ m/s, $G = 6.674\times10^{-11}$ SI)`,
          answer: ratio, tol: { rel: 0.02 },
          errors: [
            { value: (bill(R, SIGMA_QI / 2, 1)) / 1e53, feedback: t`$\sigma = 2/\text{thickness}$, not $1/\text{thickness}$.` },
            { value: (bill(1, SIGMA_QI, 1) * R) / 1e53, feedback: t`The radius enters squared: $R^2 = ${sci(R * R)}$ m².` },
          ],
          hints: [t`$\sigma = 2/(100\times1.616\times10^{-35}) = ${sci(SIGMA_QI, 3)}$ m⁻¹.`, t`$c^2/(36G) = ${sci((C * C) / (36 * G), 3)}$ kg/m; multiply by $R^2\sigma$, then divide by $10^{53}$.`],
          teach: 'With quantum-inequality walls, a warp bubble needs more negative energy than the whole visible universe holds in positive energy — by many orders of magnitude.',
          explain: t`$|E_{\text{tot}}|/c^2 = ${sci(m, 3)}$ kg, about $${sci(ratio, 2)}$ times the visible universe's mass. Pfenning and Ford's estimate for a 100 m bubble, $6.2\times10^{62}$ kg, says the same. The bill is mathematics; no way to supply it is known.`,
          visual: wallPic,
        };
      },
    }),
  ],
  sources: [
    { label: 'Alcubierre, “The warp drive: hyper-fast travel within general relativity”, Class. Quantum Grav. 11, L73 (1994)', url: 'https://arxiv.org/abs/gr-qc/0009013' },
    { label: 'Pfenning & Ford, “The unphysical nature of ‘warp drive’”, Class. Quantum Grav. 14, 1743 (1997)', url: 'https://arxiv.org/abs/gr-qc/9702026' },
    { label: 'Natário, “Warp drive with zero expansion”, Class. Quantum Grav. 19, 1157 (2002)', url: 'https://arxiv.org/abs/gr-qc/0110086' },
    { label: 'Everett & Roman, “A superluminal subway: the Krasnikov tube”, Phys. Rev. D 56, 2100 (1997)', url: 'https://arxiv.org/abs/gr-qc/9702049' },
    { label: 'Santiago, Schuster & Visser, “Generic warp drives violate the null energy condition”, Phys. Rev. D 105, 064038 (2022)', url: 'https://arxiv.org/abs/2105.03079' },
    { label: 'Lentz, “Breaking the warp barrier: hyper-fast solitons in Einstein–Maxwell-plasma theory”, Class. Quantum Grav. 38, 075015 (2021)', url: 'https://arxiv.org/abs/2006.07125' },
    { label: 'Fell & Heisenberg, “Positive energy warp drive from hidden geometric structures”, Class. Quantum Grav. 38, 155020 (2021)', url: 'https://arxiv.org/abs/2104.06488' },
    { label: 'Bobrick & Martire, “Introducing physical warp drives”, Class. Quantum Grav. 38, 105009 (2021)', url: 'https://arxiv.org/abs/2102.06824' },
    { label: 'Fuchs, Helmerich, Bobrick, Sellers, Melcher & Martire, “Constant velocity physical warp drive solution” (2024)', url: 'https://arxiv.org/abs/2405.02709' },
    { label: 'Barzegar, Buchert & Vigneron, “General formalism, classification, and demystification of the current warp-drive spacetimes” (2026)', url: 'https://arxiv.org/abs/2602.16495' },
  ],
});
