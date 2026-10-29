// Linearized field equations in Lorenz gauge — Derivation Mode. g = η + h to
// first order: linear Christoffels and Riemann, R_ρσμν = ½(∂σ∂μ h_ρν +
// ∂ρ∂ν h_σμ − ∂σ∂ν h_ρμ − ∂ρ∂μ h_σν), gauge-invariant under h → h + ∂ξ + ∂ξ;
// with h̄ = h − ½ηh, G_μν = −½(□h̄_μν − ∂μ∂^ρh̄_ρν − ∂ν∂^ρh̄_ρμ + η_μν∂^ρ∂^σh̄_ρσ);
// the divergence shifts by □ξ_ν, so the Lorenz gauge is always reachable and
// □h̄_μν = −(16πG/c⁴)T_μν (worked example). Static star: h̄₀₀ = 4GM/(c²r),
// h₀₀ = h_ii = 2GM/(c²r). Plane waves: k null, transverse; TT components;
// one arm changes by ½h₊L; R_x0x0 = −½∂₀²h_xx ≠ 0 (code exercise, SymPy).
// Every identity above checked with SymPy (scratch v28.py). Avoids gr.S28.i
// (sizes of h, superposition, polarization count, Sun–Earth, GP-B) and
// gr.EQ.12 (wave operator, h̄₀₀ = 2ε, coupling, Lorenz meaning, grazing light,
// GW170817, divergence of T, static components).
import { lesson, mcq, multi, num, expr, code } from '../../src/core/content.js';
import { C, GM_SUN, R_SUN, KAPPA, sci, round, grid4 } from './_derivlate.js';

const t = String.raw;

const HB_SUN = (4 * GM_SUN) / (C * C * R_SUN);          // h̄₀₀ at the Sun's surface

// ── pictures ────────────────────────────────────────────────────────────────

// flat paper with the coordinate x′ = x − ε sin kx drawn on it (ε, k exaggerated)
const EPS = 0.32, K = 1.15;
const lineAt = (n) => { let x = n; for (let i = 0; i < 40; i++) x -= (x - EPS * Math.sin(K * x) - n) / (1 - EPS * K * Math.cos(K * x)); return x; };
const gaugeGrid = {
  type: 'graph',
  params: {
    x: [-4.6, 4.6], y: [-2.6, 2.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      ...[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((n) => ({ param: [`${round(lineAt(n), 6)}`, 't'], t: [-2.2, 2.2], color: 'accent', width: 1.6 })),
      ...[-2, -1, 0, 1, 2].map((m) => ({ param: ['t', `${m}`], t: [-4.4, 4.4], color: 'ink4', width: 1.1 })),
      { param: [`${round(lineAt(-1), 6)} + ${round(lineAt(1) - lineAt(-1), 6)}*t`, '2.55'], t: [0, 1], color: 'gold', width: 3 },
      { param: [`${round(lineAt(2), 6)} + ${round(lineAt(4) - lineAt(2), 6)}*t`, '2.55'], t: [0, 1], color: 'gold', width: 3 },
    ],
    points: [
      { x: round(lineAt(-1), 4), y: 2.55, r: 0.01, color: 'gold', label: 'two steps of x′', labelDx: -4, labelDy: -12 },
      { x: round(lineAt(2), 4), y: 2.55, r: 0.01, color: 'gold', label: 'two steps of x′', labelDx: -4, labelDy: -12 },
    ],
  },
  caption: 'Flat paper with a new coordinate x′ = x − ε sin kx drawn on it (blue lines of constant x′; ε hugely exaggerated). Two steps of x′ cover different true lengths (gold), so g in the x′ labels wiggles — but nothing about the paper has changed: it is flat everywhere.',
};

// the past light cone of an event (c = 1): where a retarded solution gathers its source
const pastCone = {
  type: 'graph',
  params: {
    x: [-4, 4], y: [-0.4, 4], equal: true, aspect: 'wide', xlabel: 'x (light-seconds)', ylabel: 'ct (light-seconds)', grid: false,
    curves: [
      { param: ['-3 + 3t', '3t'], t: [0, 1], color: 'gold', width: 3 },
      { param: ['3 - 3t', '3t'], t: [0, 1], color: 'gold', width: 3 },
      { fn: '0', color: 'ink3', width: 1.2, dash: true },
    ],
    points: [{ x: 0, y: 3, color: 'accent2', r: 5, label: 'the event where ξ is wanted', labelDx: 10, labelDy: -6 }, { x: -3.2, y: 0.6, r: 0.01, color: 'gold', label: 'past light cone', labelDx: 0, labelDy: 0 }],
  },
  caption: 'The retarded solution of □ξ = −f at an event adds up the source f over that event’s past light cone (in three space dimensions, on the cone itself). Any source will do, so the equation can always be solved.',
};

// ω against |k|: waves of the linearized equations sit on the light line
const dispersion = {
  type: 'graph',
  params: {
    x: [0, 3.2], y: [0, 3.6], xlabel: 'wavenumber |k| (arbitrary units)', ylabel: 'ω / c',
    curves: [
      { fn: 'x', color: 'gold', width: 2.6, label: 'ω = c|k|: speed c, for every wavelength', labelAt: 1.5, labelDx: 10, labelDy: 12 },
      { fn: 'sqrt(x^2 + 1)', color: 'ink3', width: 1.6, dash: true, label: 'a massive field, for comparison', labelAt: 2.3, labelDx: -10, labelDy: -12, labelAlign: 'right' },
    ],
  },
  caption: 'Frequency against wavenumber. The linearized vacuum equation allows only the gold line — no dispersion. A massive field (dashed, shown only for comparison) would make long waves travel slower.',
};

// the TT block of a wave travelling along z
const ttCells = [['0', '0', '0', '0'], ['0', '?', '?', '0'], ['0', '?', '?', '0'], ['0', '0', '0', '0']];
const ttMatrix = (cells, caption) => grid4(cells, { left: 'h =', colors: cells.map((row) => row.map(() => 'gold')), caption });

// in TT coordinates the coordinate separation stays put; the proper separation oscillates
const ttGraph = {
  type: 'graph',
  params: {
    x: [0, 3.05], y: [0.6, 1.32], xlabel: 'time (wave periods)', ylabel: 'separation ÷ its value before the wave', yticks: 4,
    curves: [
      { fn: '1', color: 'ink3', width: 2, dash: true },
      { fn: '1 + 0.17*cos(6.2832*x)', color: 'accent', width: 2.6 },
    ],
    points: [
      { x: 0.04, y: 1.27, r: 0.01, color: 'accent', label: 'blue: proper separation', labelDx: 0, labelDy: 0 },
      { x: 0.04, y: 0.67, r: 0.01, color: 'ink3', label: 'dashed: coordinate separation (TT gauge)', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: 'Two free masses on the x axis while a + wave passes (strain exaggerated about 10²⁰ times). Their TT coordinates never change; the distance between them, measured by light’s round-trip time, does.',
};

// a ring of free masses and an interferometer, stretched by a + wave (gr-chirp, still)
const ringPic = (caption) => ({
  type: 'gr-chirp',
  params: { m1: 36, m2: 29, sliders: false, play: false, readout: false, p: 0.92 },
  caption: caption ?? 'A ring of free masses and an interferometer’s arms stretched by a + wave, enormously exaggerated (left); right, the strain of a binary’s chirp, with the playhead at the moment drawn.',
});

// the source picture for the Explore: one component of a retarded wave, in the orbital plane (schematic)
const spiral = {
  type: 'surface3d',
  params: {
    surface: ['u*cos(v)', 'u*sin(v)', 'k*1.7*step(T - u)*cos(2*v - 6.2832*(T - u))/(u + 1.1)'],
    domain: [[0.3, 6.2], [0, 6.2832]], n: 52,
    axes: false, alpha: 0.85, yaw: -0.7, pitch: 0.9, dist: 15.5, target: [0, 0, 0],
    sliders: [{ key: 'T', label: 'Time since the source started, in wave periods', min: 0, max: 6, step: 0.02, value: 3.4, explain: 'One wave period is the time light takes to cross one wavelength, so the front sits T wavelengths out.' }],
    choices: [{ key: 'k', label: 'Source', options: [[1, 'A rotating pair'], [0, 'A pulsating sphere']], value: 1, explain: 'A pair of masses in orbit, or a sphere that swells and shrinks while staying round.' }],
    curves: [{ param: ['T*cos(t)', 'T*sin(t)', '0'], t: [0, 6.2832], color: 'gold', width: 2.4 }],
    readouts: [{ label: 'front, in wavelengths from the source', expr: 'T', digits: 3 }],
  },
};

// LISA: three spacecraft in a triangle (not to scale)
const lisaPic = {
  type: 'graph',
  params: {
    x: [-2.6, 2.6], y: [-1.3, 1.75], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['-1.2 + 2.4t', '-0.69'], t: [0, 1], color: 'accent', width: 2.2 },
      { param: ['1.2 - 1.2t', '-0.69 + 2.078t'], t: [0, 1], color: 'teal', width: 2.2 },
      { param: ['-1.2t', '1.388 - 2.078t'], t: [0, 1], color: 'teal', width: 2.2 },
    ],
    points: [
      { x: -1.2, y: -0.69, color: 'gold', r: 6, label: 'spacecraft 1', labelDx: -74, labelDy: 14 },
      { x: 1.2, y: -0.69, color: 'gold', r: 6, label: 'spacecraft 2', labelDx: 8, labelDy: 14 },
      { x: 0, y: 1.388, color: 'gold', r: 6, label: 'spacecraft 3', labelDx: 10, labelDy: 0 },
      { x: -0.62, y: -0.97, r: 0.01, color: 'accent', label: 'the arm along x: 2.5 million km', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: 'LISA’s three spacecraft (not to scale), with laser links 2.5 million km long. The question concerns the arm drawn in blue, lying along the x axis of the wave’s + pattern.',
};

// h̄₀₀ outside a uniform ball, in units of its surface value; the inside is the question
const outsideOnly = {
  type: 'graph',
  params: {
    x: [0, 4], y: [0, 1.75], xlabel: 'r / R', ylabel: 'h̄₀₀ ÷ its value at the surface',
    shade: [{ fn: '1.7', from: 0, to: 1, color: 'gold', alpha: 0.12 }],
    curves: [{ fn: '1/x', domain: [1, 4], color: 'accent', width: 2.6, label: '4GM/(c²r)', labelAt: 2.2 }],
    vlines: [{ x: 1, label: 'surface' }],
    points: [{ x: 0.2, y: 1.45, r: 0.01, color: 'gold', label: 'inside: ?', labelDx: 0, labelDy: 0 }],
  },
  caption: 'The static solution outside a uniform ball of radius R, where ∇²h̄₀₀ = 0. Inside (shaded), the matter sources it.',
};

const CODE_START = t`import sympy as sp

t, x, y, z = sp.symbols('t x y z', real=True)     # t stands for x0 = ct
X = [t, x, y, z]
hp, hc, w, eps, k = sp.symbols('h_p h_c omega epsilon k', positive=True)

def d2(f, a, b):
    """The second derivative d_a d_b f."""
    return sp.diff(f, X[a], X[b])

def riemann_lin(h, r, s, m, n):
    """R_rsmn to first order in the perturbation h (all indices down)."""
    return 0   # replace with the four second-derivative terms

# a + and x wave travelling along z, in TT gauge
ph = w*(t - z)
tt = sp.zeros(4)
tt[1, 1], tt[2, 2] = hp*sp.cos(ph), -hp*sp.cos(ph)
tt[1, 2] = tt[2, 1] = hc*sp.cos(ph)

# a pure-gauge ripple: h_xx = 2 d_x xi_x with xi_x = eps sin(kx)
gauge = sp.zeros(4)
gauge[1, 1] = 2*eps*k*sp.cos(k*x)

print('R_x0x0 of the wave:', sp.simplify(riemann_lin(tt, 1, 0, 1, 0)))
print('R_x0x0 of the ripple:', sp.simplify(riemann_lin(gauge, 1, 0, 1, 0)))
`;
const CODE_ANSWER = CODE_START.replace(
  '    return 0   # replace with the four second-derivative terms',
  '    return sp.Rational(1, 2)*(d2(h[r, n], s, m) + d2(h[s, m], r, n) - d2(h[r, m], s, n) - d2(h[s, n], r, m))',
);

export default lesson({
  id: 'gr.S28.d',
  title: 'Linearized field equations in Lorenz gauge',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`Wherever gravity is weak — everywhere but close to neutron stars and black holes — the metric is flat spacetime plus a small ripple, $g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}$ with $|h_{\mu\nu}| \ll 1$. Keep only the first order in $h$ and the curvature becomes **linear** in it. Two moves then turn Einstein's ten equations into ten wave equations, one per component: **reverse the trace** of $h$, and **choose coordinates** in which the reversed ripple has zero divergence — the Lorenz, or harmonic, gauge. The result is gravity's twin of Maxwell's equations in the Lorenz gauge: ripples sourced by stress–energy and travelling at $c$.

Conventions: Carroll's, signature $(-,+,+,+)$, $x^0 = ct$, indices raised and lowered with $\eta$. With $G = c = 1$ the equation reads $\Box\bar h_{\mu\nu} = -16\pi T_{\mu\nu}$.`,
  equation: t`\Box\,\bar h_{\mu\nu} = -\frac{16\pi G}{c^4}\,T_{\mu\nu}, \qquad \partial^\mu\bar h_{\mu\nu} = 0, \qquad \bar h_{\mu\nu} \equiv h_{\mu\nu} - \tfrac12\eta_{\mu\nu}h`,
  symbols: [
    { tex: 'h_{\\mu\\nu}', text: t`the ripple $g_{\mu\nu} - \eta_{\mu\nu}$: ten small, unitless numbers at each event (it is symmetric). Every term with two factors of $h$ is dropped` },
    { tex: '\\eta_{\\mu\\nu}', text: t`the flat Minkowski metric, $\operatorname{diag}(-1, 1, 1, 1)$; to first order it raises and lowers every index` },
    { tex: 'h', text: t`the trace $\eta^{\mu\nu}h_{\mu\nu} = -h_{00} + h_{11} + h_{22} + h_{33}$` },
    { tex: '\\bar h_{\\mu\\nu}', text: t`the trace-reversed ripple: the same information, repackaged; its trace is $\bar h = -h$` },
    { tex: '\\Box', text: t`the wave operator $\eta^{\alpha\beta}\partial_\alpha\partial_\beta = -\dfrac{1}{c^2}\dfrac{\partial^2}{\partial t^2} + \nabla^2$, in m⁻²` },
    { tex: '\\partial^\\mu', text: t`$\eta^{\mu\alpha}\partial_\alpha$, so $\partial^0 = -\partial_0$. The condition $\partial^\mu\bar h_{\mu\nu} = 0$ is four equations, one for each $\nu$: the **Lorenz gauge**` },
    { tex: 'T_{\\mu\\nu}', text: t`the stress–energy of the matter (step 16), in J/m³, computed as though spacetime were flat` },
    { tex: 'G,\\ c', text: t`Newton's constant and the speed of light; $16\pi G/c^4 = ${sci(2 * KAPPA)}\ \text{N}^{-1}$ is twice Einstein's coupling` },
  ],
  why: 'This is the equation behind every gravitational-wave prediction (step 27), the weak-field metric that bends light twice as much as Newton would, and frame dragging — and its harmonic gauge is the same trick that, decades later, let the full equations be solved on computers (steps 29 and 32).',
  visual: {
    ...spiral,
    title: 'A retarded solution: ripples leave at c',
    lead: t`Far from its source, the solution of $\Box\bar h_{\mu\nu} = -16\pi G\,T_{\mu\nu}/c^4$ is a ripple that leaves at the speed of light and falls off as $1/r$. Here, one component in the orbital plane of a pair of masses that start orbiting at time zero. Drag to rotate; slide the time.`,
    tasks: [
      'Slide the time: the front (gold ring) moves out one wavelength per wave period — the speed c that the □ sets. Nothing beyond the front has changed yet.',
      'Follow one radius outward: the height falls as 1/r, so the energy carried, which goes as the square, falls as 1/r², spread over spheres of area 4πr².',
      'Switch to the pulsating sphere: outside it, nothing ripples. A round source cannot radiate (Birkhoff’s theorem); the leading wave comes from a changing quadrupole (step 27).',
    ],
    caption: 'Schematic, not a simulation: one polarization in the orbital plane, proportional to cos 2(φ − Ω(t − r/c)) ÷ r, switched on at time zero. The near zone is not drawn, heights are exaggerated about 10²¹ times, and distances are in wavelengths.',
  },
  example: {
    prompt: t`Derive the linearized field equations. Start from $g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}$, keep the first order in $h$, and show that in the Lorenz gauge $G_{\mu\nu} = (8\pi G/c^4)\,T_{\mu\nu}$ becomes $\Box\bar h_{\mu\nu} = -(16\pi G/c^4)\,T_{\mu\nu}$. Then solve it outside a star at rest.`,
    visual: grid4([['4GM/c²r', '0', '0', '0'], ['0', '0', '0', '0'], ['0', '0', '0', '0'], ['0', '0', '0', '0']], { left: 'h̄ =', colors: [['gold']], caption: t`The solution outside a star at rest: only $\bar h_{00}$ is switched on. Reversing its trace spreads it over the whole diagonal of $h_{\mu\nu}$.` }),
    steps: [
      { label: 'Linear curvature', text: t`To first order $g^{\mu\nu} = \eta^{\mu\nu} - h^{\mu\nu}$ and $\Gamma^\rho{}_{\mu\nu} = \tfrac12\eta^{\rho\lambda}\left(\partial_\mu h_{\lambda\nu} + \partial_\nu h_{\lambda\mu} - \partial_\lambda h_{\mu\nu}\right)$. Every $\Gamma$ is first order, so the $\Gamma\Gamma$ products in the Riemann tensor are second order and drop out: $$R_{\rho\sigma\mu\nu} = \tfrac12\left(\partial_\sigma\partial_\mu h_{\rho\nu} + \partial_\rho\partial_\nu h_{\sigma\mu} - \partial_\sigma\partial_\nu h_{\rho\mu} - \partial_\rho\partial_\mu h_{\sigma\nu}\right).$$` },
      { label: 'Gauge freedom', text: t`A small change of coordinates, $x^\mu \to x^\mu - \xi^\mu$, changes the ripple by $h_{\mu\nu} \to h_{\mu\nu} + \partial_\mu\xi_\nu + \partial_\nu\xi_\mu$. Put that into $R_{\rho\sigma\mu\nu}$: the third derivatives of $\xi$ cancel in pairs, and the curvature is unchanged. Four of the ten functions in $h$ are labels, not gravity.` },
      { label: 'Contract', text: t`$R_{\mu\nu} = R^\lambda{}_{\mu\lambda\nu} = \tfrac12\left(\partial_\sigma\partial_\mu h^\sigma{}_\nu + \partial_\sigma\partial_\nu h^\sigma{}_\mu - \partial_\mu\partial_\nu h - \Box h_{\mu\nu}\right)$, and its trace is $R = \partial_\mu\partial_\nu h^{\mu\nu} - \Box h$.` },
      { label: 'Reverse the trace', text: t`Write it all with $\bar h_{\mu\nu} = h_{\mu\nu} - \tfrac12\eta_{\mu\nu}h$, whose trace is $-h$ (so $h_{\mu\nu} = \bar h_{\mu\nu} - \tfrac12\eta_{\mu\nu}\bar h$: the reversal undoes itself). The Einstein tensor $R_{\mu\nu} - \tfrac12\eta_{\mu\nu}R$ becomes $$G_{\mu\nu} = -\tfrac12\left(\Box\bar h_{\mu\nu} - \partial_\mu\partial^\rho\bar h_{\rho\nu} - \partial_\nu\partial^\rho\bar h_{\rho\mu} + \eta_{\mu\nu}\,\partial^\rho\partial^\sigma\bar h_{\rho\sigma}\right).$$ Every term but the first contains the divergence $\partial^\rho\bar h_{\rho\nu}$.` },
      { label: 'Choose the gauge', text: t`The change of coordinates shifts that divergence by $\Box\xi_\nu$. So choose $\xi$ with $\Box\xi_\nu = -\partial^\rho\bar h_{\rho\nu}$ — a wave equation with a source, which always has a solution — and in the new coordinates $\partial^\rho\bar h_{\rho\nu} = 0$. Then $G_{\mu\nu} = -\tfrac12\Box\bar h_{\mu\nu}$, and $G_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu}$ becomes $$\Box\bar h_{\mu\nu} = -\frac{16\pi G}{c^4}T_{\mu\nu}.$$` },
      { label: 'A star at rest', text: t`Slow, static matter has only $T_{00} = \rho c^2$, so only $\bar h_{00}$ is sourced, and $\Box$ becomes $\nabla^2$: $\nabla^2\bar h_{00} = -16\pi G\rho/c^2$. Since $\nabla^2(1/r) = -4\pi\delta^3(\vec x)$, outside a mass $M$ the solution is $\bar h_{00} = 4GM/(c^2r)$. Its trace is $\bar h = -\bar h_{00}$, and reversing back gives $h_{00} = h_{xx} = h_{yy} = h_{zz} = 2GM/(c^2r)$.` },
      { label: 'Sense check', text: t`$g_{00} = -1 + h_{00} = -(1 + 2\Phi/c^2)$ with $\Phi = -GM/r$: Newton (step 19). And $g_{xx} = 1 + 2GM/(c^2r)$: space is curved as much as time, which doubles the bending of light. At the Sun's surface $\bar h_{00} = ${sci(HB_SUN)}$, so the first order is plenty. Finally, taking $\partial^\mu$ of both sides shows the source must obey $\partial^\mu T_{\mu\nu} = 0$, as conserved matter does.` },
    ],
    answer: t`In the Lorenz gauge $G_{\mu\nu} = -\tfrac12\Box\bar h_{\mu\nu}$, so $\Box\bar h_{\mu\nu} = -\frac{16\pi G}{c^4}T_{\mu\nu}$. Outside a star at rest $\bar h_{00} = 4GM/(c^2r)$, and $h_{00} = h_{ii} = 2GM/(c^2r)$.`,
  },
  practice: [
    mcq({
      id: 'gauge-ripple', difficulty: 2,
      prompt: t`Every component of a perturbation is zero except $h_{xx} = 2\varepsilon k\cos kx$, with $\varepsilon k \ll 1$. Is this spacetime curved?`,
      visual: gaugeGrid,
      choices: [
        t`No: it is pure gauge — exactly $\partial_x\xi_x + \partial_x\xi_x$ for $\xi_x = \varepsilon\sin kx$ — and every component of the linearized Riemann tensor vanishes`,
        t`Yes: any non-zero $h_{\mu\nu}$ is a curvature of spacetime`,
        t`Yes: it is a gravitational wave travelling along $x$`,
        t`Only where $\cos kx \neq 0$`,
      ],
      answer: 0,
      why: {
        1: t`Four of the ten functions in $h_{\mu\nu}$ only reflect the coordinates. Curvature is the Riemann tensor, and here it is zero.`,
        2: t`It does not depend on time, and a wave along $x$ would be transverse to $x$: it would live in $h_{yy}$, $h_{zz}$ and $h_{yz}$, not in $h_{xx}$.`,
        3: t`Curvature that came and went with a coordinate label would be no curvature at all. The Riemann tensor here is zero everywhere.`,
      },
      hints: [t`Look for a $\xi_\mu$ whose $\partial_\mu\xi_\nu + \partial_\nu\xi_\mu$ equals this $h_{\mu\nu}$.`, t`Or test the curvature: $R_{xyxy}$ needs $\partial_y\partial_y h_{xx}$ or $\partial_x\partial_x h_{yy}$, and $R_{x0x0}$ needs $\partial_0\partial_0 h_{xx}$ or $\partial_x\partial_x h_{00}$. Are any of them non-zero?`],
      teach: 'A ripple in the metric’s components can be nothing but relabelled coordinates; only the Riemann tensor says whether spacetime is curved.',
      explain: t`$\xi_x = \varepsilon\sin kx$ gives $\partial_x\xi_x + \partial_x\xi_x = 2\varepsilon k\cos kx$: flat spacetime with wiggly coordinate lines, as in the picture. The only non-zero second derivative is $\partial_x\partial_x h_{xx}$, which could appear only in $R_{xxxx}$ — and that vanishes by antisymmetry. So $R_{\rho\sigma\mu\nu} = 0$.`,
    }),
    mcq({
      id: 'reach-lorenz', difficulty: 2,
      prompt: t`Your trace-reversed ripple has divergence $\partial^\mu\bar h_{\mu\nu} = f_\nu \neq 0$. A change of coordinates by $\xi^\mu$ turns that divergence into $f_\nu + \Box\xi_\nu$. Which statement is right?`,
      visual: pastCone,
      choices: [
        t`Any $\xi$ with $\Box\xi_\nu = -f_\nu$ reaches the Lorenz gauge — and it is not unique: adding any $\zeta$ with $\Box\zeta_\nu = 0$ keeps the gauge`,
        t`Take $\xi_\nu = -f_\nu$`,
        t`No $\xi$ is allowed except zero, since a change of coordinates must not change the physics`,
        t`The Lorenz gauge can be reached only in empty space, where $f_\nu = 0$ anyway`,
      ],
      answer: 0,
      why: {
        1: t`That adds $-\Box f_\nu$, not $-f_\nu$: the divergence changes by $\Box\xi_\nu$, so $\xi$ must solve a wave equation.`,
        2: t`Relabelling never changes the physics — the Riemann tensor is untouched — so a non-zero $\xi$ is allowed. That is the whole point.`,
        3: t`$\Box\xi_\nu = -f_\nu$ can be solved for any source, inside matter or not: the retarded solution adds up $f$ over the past light cone.`,
      },
      hints: [t`What must $f_\nu + \Box\xi_\nu$ equal?`, t`If $\xi$ works, does $\xi + \zeta$ with $\Box\zeta_\nu = 0$ work too?`],
      teach: t`The Lorenz gauge is reached by solving $\Box\xi_\nu = -\partial^\mu\bar h_{\mu\nu}$; solutions of $\Box\zeta_\nu = 0$ remain free.`,
      explain: t`$f_\nu + \Box\xi_\nu = 0$ is a wave equation for $\xi$ with source $-f_\nu$, always solvable. Any extra $\zeta$ with $\Box\zeta_\nu = 0$ keeps $\partial^\mu\bar h_{\mu\nu} = 0$. That leftover freedom — four more functions — is what makes waves traceless and purely spatial in the TT gauge, leaving two polarizations.`,
    }),
    mcq({
      id: 'null-k', difficulty: 2,
      prompt: t`In empty space, try a plane wave $\bar h_{\mu\nu} = A_{\mu\nu}\cos(k_\sigma x^\sigma)$, with constant amplitudes $A_{\mu\nu}$ and wave vector $k^\sigma = (\omega/c,\ \vec k)$. Since $\Box\cos(k_\sigma x^\sigma) = -k_\sigma k^\sigma\cos(k_\sigma x^\sigma)$, what do the field equation and the Lorenz gauge require?`,
      visual: dispersion,
      choices: [
        t`$k_\sigma k^\sigma = 0$, so $\omega = c|\vec k|$; and $k^\mu A_{\mu\nu} = 0$: the wave moves at $c$ and is transverse`,
        t`$k_\sigma k^\sigma = -\omega^2/c^2$, so waves of any frequency may travel at any speed`,
        t`Only that $A_{\mu\nu}$ is traceless; the speed is left open`,
        t`Only $k^\mu A_{\mu\nu} = 0$; the speed depends on the source`,
      ],
      answer: 0,
      why: {
        1: t`With $\eta = \operatorname{diag}(-1,1,1,1)$, $k_\sigma k^\sigma = -\omega^2/c^2 + |\vec k|^2$, and $\Box\bar h_{\mu\nu} = 0$ forces it to vanish.`,
        2: t`$\Box\bar h_{\mu\nu} = -k_\sigma k^\sigma\,\bar h_{\mu\nu} = 0$ fixes the speed: $\omega/|\vec k| = c$. Tracelessness is a later choice of gauge.`,
        3: t`Far from the source the vacuum equation alone sets the speed, and it is $c$ whatever made the wave.`,
      },
      hints: [t`For a non-zero wave, $\Box\bar h_{\mu\nu} = 0$ needs $k_\sigma k^\sigma = 0$.`, t`$\partial^\mu\left[A_{\mu\nu}\cos(k_\sigma x^\sigma)\right] = -k^\mu A_{\mu\nu}\sin(k_\sigma x^\sigma)$.`],
      teach: 'Vacuum plane waves of the linearized equations have null wave vectors — they travel at c without dispersion — and the Lorenz gauge makes them transverse.',
      explain: t`$-k_\sigma k^\sigma A_{\mu\nu}\cos(k_\sigma x^\sigma) = 0$ everywhere needs $-\omega^2/c^2 + |\vec k|^2 = 0$: speed $c$ at every wavelength. The gauge condition adds $k^\mu A_{\mu\nu} = 0$ — four conditions; the leftover gauge removes four more, leaving two polarizations.`,
    }),
    mcq({
      id: 'tt-components', difficulty: 2,
      prompt: t`A plane wave travels along $z$. After all the gauge freedom is used — the transverse–traceless (TT) gauge, with $h_{0\mu} = 0$, $\partial^\mu h_{\mu\nu} = 0$ and $h = 0$ — which components of $h_{\mu\nu}$ can be non-zero?`,
      visual: ttMatrix(ttCells, t`The perturbation of a wave travelling along $z$, rows and columns $t, x, y, z$: which of the marked cells can be non-zero, and how are they related?`),
      choices: [
        t`$h_{xx} = -h_{yy}$ and $h_{xy} = h_{yx}$: two independent numbers, $h_+$ and $h_\times$`,
        t`$h_{xx}$, $h_{yy}$ and $h_{zz}$, with $h_{xx} + h_{yy} + h_{zz} = 0$`,
        t`$h_{tt}$ and $h_{zz}$: along the direction of travel`,
        t`All ten, since the wave solves the full equations`,
      ],
      answer: 0,
      why: {
        1: t`Traceless, yes — but transverse too: $k^\mu h_{\mu\nu} = 0$ with $k$ along $z$, together with $h_{0\mu} = 0$, forces every component with a $z$ index to vanish.`,
        2: t`Those are exactly the components the gauge removes: nothing physical oscillates along the direction of travel.`,
        3: t`Four are coordinate choices and four more are fixed by the gauge conditions; only two carry the wave.`,
      },
      hints: [t`Transverse: $k^\mu h_{\mu\nu} = 0$ with $k^\mu = (\omega/c)(1, 0, 0, 1)$ and $h_{0\nu} = 0$ leaves $h_{z\nu} = 0$.`, t`Traceless: $h_{xx} + h_{yy} = 0$ once $h_{zz} = 0$.`],
      teach: t`In the TT gauge a wave along $z$ lives only in the $x$–$y$ block: $h_{xx} = -h_{yy} = h_+$ and $h_{xy} = h_{yx} = h_\times$.`,
      explain: t`With $h_{0\mu} = 0$, the transverse condition $k^\mu h_{\mu\nu} = (\omega/c)(h_{0\nu} + h_{z\nu}) = 0$ makes every $z$ component vanish; tracelessness then gives $h_{yy} = -h_{xx}$. What is left is a symmetric, traceless $2\times2$ block: two polarizations.`,
    }),
    num({
      id: 'arm-change', difficulty: 2,
      gen(r) {
        const [det, L] = r.pick([['LIGO', 4000], ['Virgo', 3000], ['KAGRA', 3000]]);
        const hp = r.pick([1e-21, 2e-21, 5e-22]);
        const dL = 0.5 * hp * L;
        return {
          prompt: t`A + wave travels along $z$ through ${det}. In the TT gauge $h_{xx} = h_+\cos\omega(t - z/c)$ and the mirrors keep their coordinates; the proper length of an arm of coordinate length $L$ along $x$ is $\int_0^L\sqrt{1 + h_{xx}}\,dx$. With $L = ${L / 1000}$ km and $h_+ = ${sci(hp)}$, by how much does that arm's length change at the wave's crest?`,
          answer: dL, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: hp * L, feedback: t`That is $h_+L$, the difference between the two arms: one grows by $\tfrac12h_+L$ while the other shrinks by as much.` }],
          hints: [t`$\sqrt{1 + h} \approx 1 + \tfrac12h$ for small $h$, and $h_{xx}$ does not depend on $x$ along the arm.`],
          teach: t`One arm of length $L$ along $x$ stretches by $\tfrac12h_+L$ — the square root of the metric halves the strain — while the arm along $y$ shrinks by as much.`,
          explain: t`$\Delta L = \tfrac12h_+L = \tfrac12\times${sci(hp)}\times${L}\ \text{m} = ${sci(dL)}$ m. The arm along $y$ changes by $-\tfrac12h_+L$, so the difference the interferometer reads is $h_+L = ${sci(hp * L)}$ m.`,
          visual: ringPic(),
        };
      },
    }),
    mcq({
      id: 'tidal-tt', difficulty: 3,
      prompt: t`In TT coordinates two free masses on the $x$ axis keep their coordinates as a wave passes. Yet the wave's linearized Riemann tensor is $R_{x0x0} = -\tfrac12\partial_0^2h_{xx} \neq 0$, and geodesic deviation gives $\dfrac{d^2\xi^x}{dt^2} = -c^2R^x{}_{0x0}\,\xi^x$ for their separation $\xi$. What happens to the distance between them?`,
      visual: ttGraph,
      choices: [
        t`It oscillates: $\ddot\xi^x = \tfrac12\ddot h_{xx}\,\xi^x$, so $\xi^x = \xi_0\left(1 + \tfrac12h_{xx}\right)$ — a real tidal stretch that no choice of gauge removes`,
        'Nothing: the masses keep their coordinates, so the wave is an artefact of the coordinates',
        'It grows steadily for as long as the wave lasts',
        t`It oscillates along $z$, the direction of travel`,
      ],
      answer: 0,
      why: {
        1: t`Coordinates are labels; the curvature $R_{x0x0}$ is not zero, and it is what tidal motion responds to. The TT coordinates simply ride along with the free masses.`,
        2: t`$\ddot\xi^x \propto \ddot h_{xx}\,\xi^x$ oscillates with the wave: the stretch comes and goes; it does not build up.`,
        3: t`Every deviation along $z$ vanishes, because the wave's Riemann components with a $z$ index do: the waves are transverse.`,
      },
      hints: [t`$R^x{}_{0x0} = \eta^{xx}R_{x0x0} = R_{x0x0}$, and with $x^0 = ct$, $c^2\partial_0^2 = \partial_t^2$.`, t`So $\ddot\xi^x = \tfrac12\ddot h_{xx}\,\xi^x$. Try $\xi^x = \xi_0\left(1 + \tfrac12h_{xx}\right)$ and keep the first order.`],
      teach: 'Gravitational waves are curvature: the linearized Riemann tensor of a TT wave is non-zero, and free masses really do oscillate in proper separation.',
      explain: t`$-c^2R^x{}_{0x0} = \tfrac12c^2\partial_0^2h_{xx} = \tfrac12\ddot h_{xx}$, so $\ddot\xi^x = \tfrac12\ddot h_{xx}\,\xi^x$, solved to first order by $\xi^x = \xi_0\left(1 + \tfrac12h_{xx}\right)$ — the same $\tfrac12h$ as the arm-length integral. The gauge decides which labels move; the curvature decides what distances do.`,
    }),
    code({
      id: 'sympy-riemann-lin', difficulty: 3,
      prompt: t`Check the claims about curvature with SymPy. Complete \`riemann_lin(h, r, s, m, n)\` so that it returns the linearized Riemann tensor
$$R_{rsmn} = \tfrac12\left(\partial_s\partial_m h_{rn} + \partial_r\partial_n h_{sm} - \partial_s\partial_n h_{rm} - \partial_r\partial_m h_{sn}\right).$$
The program builds a TT wave travelling along $z$ (the symbol \`t\` stands for $x^0 = ct$) and the pure-gauge ripple $h_{xx} = 2\varepsilon k\cos kx$. Index 0 is $t$, 1 is $x$, 2 is $y$, 3 is $z$, and \`d2(f, a, b)\` is $\partial_a\partial_b f$.`,
      starter: CODE_START,
      answer: CODE_ANSWER,
      tests: [
        { name: t`the wave: $R_{x0x0} = \tfrac12\omega^2h_+\cos\omega(t - z)$`, code: 'abs(float((riemann_lin(tt, 1, 0, 1, 0) - w**2*hp*sp.cos(w*(t - z))/2).subs({w: 1.3, hp: 0.7, t: 0.4, z: 0.1}))) < 1e-12' },
        { name: t`the wave: $R_{x0y0} = \tfrac12\omega^2h_\times\cos\omega(t - z)$`, code: 'abs(float((riemann_lin(tt, 1, 0, 2, 0) - w**2*hc*sp.cos(w*(t - z))/2).subs({w: 0.9, hc: 0.3, t: 0.2, z: 0.5}))) < 1e-12' },
        { name: 'the pure-gauge ripple: all 256 components vanish', code: 'all(sp.simplify(riemann_lin(gauge, a, b, m, n)) == 0 for a in range(4) for b in range(4) for m in range(4) for n in range(4))' },
        { name: 'antisymmetric in its last two indices', code: 'sp.simplify(riemann_lin(tt, 1, 0, 1, 0) + riemann_lin(tt, 1, 0, 0, 1)) == 0' },
      ],
      hints: [t`Each term is \`d2\` of one entry of \`h\`: the first is \`d2(h[r, n], s, m)\`.`, 'Return `sp.Rational(1, 2)*(d2(h[r, n], s, m) + d2(h[s, m], r, n) - d2(h[r, m], s, n) - d2(h[s, n], r, m))`.'],
      teach: 'The linearized Riemann tensor is four second derivatives of the ripple — non-zero for a gravitational wave, zero for a mere change of coordinates.',
      explain: t`For the wave, $R_{x0x0} = -\tfrac12\partial_0^2h_{xx} = \tfrac12\omega^2h_+\cos\omega(t - z)$ and $R_{x0y0} = \tfrac12\omega^2h_\times\cos\omega(t - z)$: tides in the $x$–$y$ plane, oscillating with the wave. For the ripple every component is zero: no relabelling can create curvature, and none can remove it.`,
      visual: ttMatrix([['0', '0', '0', '0'], ['0', 'h₊ cos', 'h× cos', '0'], ['0', 'h× cos', '−h₊ cos', '0'], ['0', '0', '0', '0']], t`The TT wave the program builds, travelling along $z$; "cos" is $\cos\omega(t - z/c)$.`),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lisa', difficulty: 2, transfer: true,
      gen(r) {
        const hp = r.pick([1e-20, 3e-21, 1e-21]);
        const L = 2.5e9, dL = 0.5 * hp * L;
        return {
          prompt: t`The space detector LISA, planned for launch around 2035, will track the distances between three spacecraft 2.5 million km apart. A low-frequency + wave — its wavelength far longer than an arm — arrives perpendicular to their plane with $h_+ = ${sci(hp)}$. How much does the arm lying along the $x$ axis of the wave's + pattern change in proper length at the crest?`,
          answer: dL, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: hp * L, feedback: t`That is $h_+L$; a single arm along $x$ changes by half of it, $\tfrac12h_+L$.` }],
          hints: [t`One arm along $x$ changes by $\tfrac12h_+L$, with $L = 2.5\times10^{9}$ m.`],
          teach: 'The same ½hL holds for a detector in space; long arms turn tiny strains into measurable picometres.',
          explain: t`$\tfrac12\times${sci(hp)}\times2.5\times10^{9}\ \text{m} = ${sci(dL)}$ m — $${sci(dL * 1e12, 3)}$ picometres, which LISA reads from laser interferometry between the spacecraft. Each of the other two arms, at $60^\circ$ to $x$, changes by $\tfrac12h_+L\cos 120^\circ = -\tfrac14h_+L$.`,
          visual: lisaPic,
        };
      },
    }),
    multi({
      id: 'cp-pure-gauge', difficulty: 3,
      prompt: t`Which of these perturbations are pure gauge — flat spacetime with relabelled coordinates, whose linearized Riemann tensor vanishes? (Components not listed are zero; $\varepsilon$ is small; $x^0 = ct$.)`,
      choices: [
        t`$h_{0x} = h_{x0} = \varepsilon k\cos kx$`,
        t`$h_{00} = 2\varepsilon k\cos kx^0$`,
        t`$h_{xx} = -h_{yy} = \varepsilon\cos k(z - x^0)$`,
        t`$h_{00} = h_{xx} = h_{yy} = h_{zz} = 2GM/(c^2r)$`,
      ],
      answer: [0, 1],
      why: {
        2: t`A TT wave: $R_{x0x0} = -\tfrac12\partial_0^2h_{xx} \neq 0$. Its tides are real.`,
        3: t`The field of a star: $R_{0i0j} = -\tfrac12\partial_i\partial_j h_{00} \neq 0$ off the axis — tides that no relabelling removes.`,
      },
      hints: [t`Pure gauge means $h_{\mu\nu} = \partial_\mu\xi_\nu + \partial_\nu\xi_\mu$. Try $\xi_0 = \varepsilon\sin kx$ and $\xi_0 = \varepsilon\sin kx^0$.`, t`For the others, compute one Riemann component, such as $R_{x0x0} = \tfrac12\left(2\partial_0\partial_x h_{x0} - \partial_0^2h_{xx} - \partial_x^2h_{00}\right)$.`],
      teach: 'Whether a perturbation is physical is decided by its linearized Riemann tensor, not by how its components look.',
      explain: t`$\xi_0 = \varepsilon\sin kx$ gives $h_{0x} = \partial_x\xi_0 = \varepsilon k\cos kx$; $\xi_0 = \varepsilon\sin kx^0$ gives $h_{00} = 2\partial_0\xi_0 = 2\varepsilon k\cos kx^0$ — a uniform, time-dependent $h_{00}$ that only re-ticks every clock alike. The TT wave and the star's field have non-zero Riemann components: real tides.`,
    }),
    expr({
      id: 'cp-interior', difficulty: 3,
      prompt: t`Inside a uniform ball of mass $M$ and radius $R$, the static equation is $\nabla^2\bar h_{00} = -16\pi G\rho/c^2$ with $\rho = 3M/(4\pi R^3)$, and $\nabla^2 f = \dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\dfrac{df}{dr}\right)$. The solution that is finite at the centre and joins the outside solution $4GM/(c^2r)$ smoothly at $r = R$ is a parabola. What is $\bar h_{00}(r)$ inside?`,
      answer: '2*G*M/(c^2*R)*(3 - r^2/R^2)', answerTeX: t`\frac{2GM}{c^2R}\left(3 - \frac{r^2}{R^2}\right)`, lhs: t`\bar h_{00}(r)`,
      vars: { G: [0.5, 2], M: [0.5, 2], c: [0.8, 1.5], R: [1, 2], r: [0.1, 0.9] },
      errors: [
        { answer: '4*G*M/(c^2*R)*(3 - r^2/R^2)', feedback: t`At $r = R$ that gives $8GM/(c^2R)$, twice the outside value: the parabola must join $4GM/(c^2r)$ at the surface.` },
        { answer: '4*G*M/(c^2*R)', feedback: t`That is the value at the surface, held constant. A constant has $\nabla^2 = 0$, but inside the matter $\nabla^2\bar h_{00}$ must equal $-16\pi G\rho/c^2$.` },
      ],
      hints: [t`Try $\bar h_{00} = A - Br^2$: then $\nabla^2\bar h_{00} = -6B$, and $-16\pi G\rho/c^2 = -12GM/(c^2R^3)$.`, t`So $B = 2GM/(c^2R^3)$; choose $A$ so that $A - BR^2 = 4GM/(c^2R)$. Then check that the slopes match too.`],
      teach: t`Solving the static equation through a body: inside, $\nabla^2\bar h_{00} = -16\pi G\rho/c^2$ gives a parabola that joins $4GM/(c^2r)$ at the surface.`,
      explain: t`$B = 2GM/(c^2R^3)$ and $A = 4GM/(c^2R) + 2GM/(c^2R) = 6GM/(c^2R)$, so $\bar h_{00} = \dfrac{2GM}{c^2R}\left(3 - \dfrac{r^2}{R^2}\right)$. Its slope at the surface, $-4GM/(c^2R^2)$, matches the outside one. It is $-4\Phi/c^2$ with Newton's interior potential: at the centre $6GM/(c^2R)$, one and a half times the surface value.`,
      visual: outsideOnly,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 6 (weak fields and gravitational radiation)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Flanagan & Hughes, “The basics of gravitational wave theory”, New J. Phys. 7, 204 (2005)', url: 'https://arxiv.org/abs/gr-qc/0501041' },
    { label: 'ESA: LISA mission (adopted 2024)', url: 'https://www.esa.int/Science_Exploration/Space_Science/Capturing_the_ripples_of_spacetime_LISA_gets_go-ahead' },
  ],
});
