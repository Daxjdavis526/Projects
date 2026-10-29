// Gödel, cosmic strings and what each solution needs — Derivation Mode.
// Cosmic string: ds² = −c²dt² + dz² + dr² + (1 − 4Gμ/c²)²r²dφ², flat off the
// axis, deficit 8πGμ/c²; the linearized field r^(−2k)(dr² + r²dφ²), k = 4Gμ/c²
// (step 28) becomes that cone with R = r^(1−k)/(1−k). Source: ε = μc² per area,
// tension p_z = −ε, p_x = p_y = 0 — every energy condition holds (null, strong,
// dominant with equality). Gödel (c = G = 1): ds² = a²[−(dt + eˣdz)² + dx² + dy²
// + ½e^{2x}dz²]; u_μ = (−a, 0, 0, −a eˣ) geodesic, expansion-free, ω = 1/(√2 a);
// R_μν = u_μu_ν/a², R = −1/a²; dust 8πGρ = 1/a² with Λ = −1/(2a²), or stiff
// fluid p = ρ = 1/(16πGa²) with Λ = 0. Cylindrical form: g_φφ = 4a² sinh²r(1 −
// sinh²r), closed timelike circles beyond r = asinh 1 = ln(1 + √2); null slopes
// dt/dφ = sinh r cosh r ∓ … (see v34.py). SI: ω = √(4πGρ). All checked in SymPy
// (scratch v34.py), numbers computed below.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { C, G, LY, YEAR, MPC, M_SUN, sci, round } from './_derivlate.js';

const t = String.raw;

// ── numbers ─────────────────────────────────────────────────────────────────

const GLY = 1e9 * LY;
const H0 = 67.4e3 / MPC;                           // s⁻¹
const RHO_CRIT = (3 * H0 ** 2) / (8 * Math.PI * G); // kg/m³
const OMEGA_LIMIT = 4.7e-11 * H0;                  // CMB bound on rotation (Saadeh et al. 2016), rad/s
const T_CMB = 2.7255;                              // K
const RC = Math.asinh(1);                          // ln(1 + √2)

// ── pictures ────────────────────────────────────────────────────────────────

// Gödel's light cone at radius r, in the (dφ, dt) plane of the cylindrical coordinates
const M1 = '(sinh(r)*cosh(r) - sqrt(2)*sinh(r)^2)';
const M2 = '(-sinh(r)*cosh(r) - sqrt(2)*sinh(r)^2)';
const godelCone = ({ r = 0.4, sliders = false, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [-3.4, 3.4], y: [-1.6, 2.4], equal: true, xlabel: 'step around the circle, dφ', ylabel: 'step in time, dt',
    ...(sliders ? {
      sliders: [{ key: 'r', label: 'Distance from the axis $r$ (cylindrical coordinate)', min: 0.1, max: 1.5, step: 0.01, value: r, explain: 'Gödel’s radial coordinate; the proper distance from the axis is $2ar$. Every place in Gödel’s universe is equivalent, so any event can serve as the axis.' }],
      readouts: [
        { label: t`$\sinh r$`, expr: 'sinh(r)', digits: 3 },
        { label: t`$g_{\phi\phi}/4a^2 = \sinh^2 r\,(1 - \sinh^2 r)$`, expr: 'sinh(r)^2*(1 - sinh(r)^2)', digits: 3 },
      ],
    } : { constants: { r } }),
    shade: [{ fn: `max(2.6, max(${M1}*x, ${M2}*x))`, lower: `max(${M1}*x, ${M2}*x)`, from: -3.6, to: 3.6, color: 'gold', alpha: 0.18 }],
    curves: [
      { fn: `${M1}*x`, color: 'gold', width: 2.4 },
      { fn: `${M2}*x`, color: 'gold', width: 2.4 },
    ],
    hlines: [{ y: 0, color: 'violet', label: 'once round the circle at fixed t' }],
    points: [{ x: 0.3, y: 1.75, r: 0.01, color: 'gold', label: 'future light cone', labelAlign: 'left', labelDx: 0, labelDy: 0 }],
  },
  caption: caption ?? t`The local light cone at radius $r$ in Gödel's universe, drawn in the plane of steps $(d\phi, dt)$ at fixed $r$ and $y$. Gold lines are light rays; the shaded wedge holds the future-pointing timelike directions. The violet line is the direction of the circle around the axis.`,
});

// a flat sheet with a wedge removed (deficit hugely exaggerated)
const DEF = (90 * Math.PI) / 180;
const wedgePic = {
  type: 'graph',
  params: {
    x: [-2.4, 2.4], y: [-2.4, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      ...[0.7, 1.4, 2.1].map((R) => ({ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [round(DEF / 2, 5), round(2 * Math.PI - DEF / 2, 5)], color: 'accent', width: 2 })),
      { param: [`t*cos(${round(DEF / 2, 5)})`, `t*sin(${round(DEF / 2, 5)})`], t: [0, 2.3], color: 'bad', width: 2.2 },
      { param: [`t*cos(${round(DEF / 2, 5)})`, `-t*sin(${round(DEF / 2, 5)})`], t: [0, 2.3], color: 'bad', width: 2.2 },
    ],
    points: [
      { x: 0, y: 0, color: 'gold', r: 5, label: 'string', labelDx: -10, labelDy: 16, labelAlign: 'right' },
      { x: 1.75, y: 0, r: 0.01, color: 'bad', label: 'wedge δ removed', labelAlign: 'center', labelDx: 0, labelDy: 0 },
      { x: 0.35, y: 2.3, r: 0.01, color: 'bad', label: 'these two edges are joined', labelAlign: 'left', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`Space in a plane through a cosmic string (the deficit is hugely exaggerated): a flat sheet with a wedge of angle $\delta$ cut out and its edges joined. Every circle around the string is short of $2\pi r$ by $\delta r$, yet no tidal force acts anywhere off the string.`,
};

// the same, rolled up: a cone (embedding diagram, exaggerated)
const SA = 1 - DEF / (2 * Math.PI);
const conePic = {
  type: 'surface3d',
  params: {
    surface: [`u*${round(SA, 5)}*cos(v)`, `u*${round(SA, 5)}*sin(v)`, `u*${round(Math.sqrt(1 - SA * SA), 5)}`],
    domain: [[0, 2.4], [0, 6.2832]], n: 40, axes: false, pitch: 0.4, dist: 6, target: [0, 0, 0.9],
    curves: [{ param: [`1.6*${round(SA, 5)}*cos(t)`, `1.6*${round(SA, 5)}*sin(t)`, `1.6*${round(Math.sqrt(1 - SA * SA), 5)}`], t: [0, 6.2832], color: 'gold', width: 2.6 }],
  },
  caption: t`The sheet with its edges joined is a cone, with the string at its tip (embedding diagram, deficit exaggerated). The surface is intrinsically flat — a triangle drawn on it away from the tip has angles summing to $180°$ — but the gold circle around the tip is short of $2\pi r$ by $\delta r$.`,
};

// the Kaiser–Stebbins step: a moving string leaves a temperature step on the CMB
const ksPic = (dT) => ({
  type: 'graph',
  params: {
    x: [-1, 1], y: [-1, round(dT * 1.6, 3)], xlabel: 'position across the string’s path on the sky (arbitrary)', ylabel: 'ΔT (μK)', axesAt: 'edge',
    curves: [{ fn: `${round(dT, 4)}*step(x)`, color: 'gold', width: 2.6 }],
    vlines: [{ x: 0, color: 'ink3', label: 'string' }],
    points: [
      { x: 0.5, y: round(dT, 4), r: 0.01, color: 'gold', label: 'behind the moving string: hotter', labelDx: 0, labelDy: -14, labelAlign: 'center' },
      { x: -0.5, y: 0, r: 0.01, color: 'ink2', label: 'ahead of it', labelDx: 0, labelDy: -14, labelAlign: 'center' },
    ],
  },
  caption: 'The signature searched for in microwave-background maps: a sharp step in temperature along the line a moving string sweeps (the Kaiser–Stebbins effect). Schematic profile; real maps add the ordinary fluctuations of about 100 μK.',
});

// rotation rates on a logarithmic scale
const ratesPic = {
  type: 'graph',
  params: {
    x: [0, 4], y: [-30, -15], xlabel: '', ylabel: 'log₁₀(rate in s⁻¹)', axesAt: 'edge', xticks: 0,
    points: [
      { x: 1, y: round(Math.log10(H0), 4), color: 'accent', r: 5, label: 'expansion rate today, H₀', labelDx: 10, labelDy: 4 },
      { x: 1, y: round(Math.log10(OMEGA_LIMIT), 4), color: 'bad', r: 5, label: 'largest rotation the CMB allows', labelDx: 10, labelDy: 4 },
    ],
  },
  caption: t`Rates on a logarithmic scale: the universe's expansion rate today and the upper limit on any overall rotation from the isotropy of the microwave background, $\omega < 4.7\times10^{-11}H_0$ (Saadeh et al., 2016).`,
};

// ── coding exercise ─────────────────────────────────────────────────────────

const CODE_START = `import sympy as sp

t, x, y, z, a = sp.symbols('t x y z a', positive=True)
X = [t, x, y, z]
g = a**2*sp.Matrix([[-1, 0, 0, -sp.exp(x)],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [-sp.exp(x), 0, 0, -sp.exp(2*x)/2]])   # Goedel's metric, c = G = 1
gi = g.inv()

def Gam(l, m, n):
    return sum(gi[l, s]*(sp.diff(g[s, m], X[n]) + sp.diff(g[s, n], X[m])
                         - sp.diff(g[m, n], X[s])) for s in range(4))/2

G3 = [[[sp.simplify(Gam(l, m, n)) for n in range(4)] for m in range(4)] for l in range(4)]

def ricci(m, n):
    return sp.simplify(sum(sp.diff(G3[l][m][n], X[l]) - sp.diff(G3[l][l][m], X[n])
                           + sum(G3[l][l][s]*G3[s][m][n] - G3[l][n][s]*G3[s][l][m] for s in range(4))
                           for l in range(4)))

R = sp.Matrix(4, 4, lambda m, n: ricci(m, n))
Rs = sp.simplify(sum(gi[m, n]*R[m, n] for m in range(4) for n in range(4)))

def einstein(m, n):
    # return the Einstein tensor G_mn = R_mn - (1/2) R g_mn
    return 0                                     # replace this line

u = g*sp.Matrix([1/a, 0, 0, 0])                  # u_mu of the matter at rest in these coordinates
rho, Lam = 1/(8*sp.pi*a**2), -1/(2*a**2)         # dust density and cosmological constant
residual = sp.Matrix(4, 4, lambda m, n: sp.simplify(einstein(m, n) + Lam*g[m, n] - 8*sp.pi*rho*u[m]*u[n]))
print('Ricci scalar:', Rs)
print('G_tt =', sp.simplify(einstein(0, 0)))
print('field equations with dust and Lambda, residual:', residual)
`;
const CODE_ANSWER = CODE_START.replace('    return 0                                     # replace this line', '    return R[m, n] - Rs*g[m, n]/2');

export default lesson({
  id: 'gr.S34.d',
  title: 'Gödel, cosmic strings and what each solution needs',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['math', 'spec'],
  intro: t`Any metric solves Einstein's equations — if you may choose the matter. Read the equations backwards: pick $g_{\mu\nu}$, compute $G_{\mu\nu}$, and $T_{\mu\nu} = \frac{c^4}{8\pi G}\left(G_{\mu\nu} + \Lambda g_{\mu\nu}\right)$ is what the source has to be. A solution describes the world only if that source exists, in a configuration that can actually form. This lesson does the bookkeeping for two famous exact solutions.

Around a straight **cosmic string** spacetime is flat everywhere except on the string itself, yet space is a cone missing a wedge $8\pi G\mu/c^2$. Its source — a line of energy whose tension equals its energy — meets every energy condition. What it needs is a phase transition in the early universe that may never have happened: no string has been found. **Gödel's** 1949 universe has closed timelike curves through every event, sourced by ordinary dust plus a negative cosmological constant. What it needs is a whole universe that rotates and does not expand — and ours does neither.`,
  equation: t`\begin{gathered} ds^2 = -c^2dt^2 + dz^2 + dr^2 + \left(1 - \frac{4G\mu}{c^2}\right)^2 r^2\,d\phi^2 \\[4pt] ds^2 = a^2\left[-\left(dt + e^{x}dz\right)^2 + dx^2 + dy^2 + \tfrac12 e^{2x}dz^2\right] \end{gathered}`,
  symbols: [
    { tex: 'ds^2', text: 'the spacetime interval between neighbouring events' },
    { tex: '\\mu', text: 'the cosmic string’s mass per unit length, in kg/m; its tension equals $\\mu c^2$' },
    { tex: 'r,\\ \\phi,\\ z', text: 'cylindrical coordinates around the string, which lies along the $z$-axis; $r$ is the proper distance from it' },
    { tex: 'a', text: t`Gödel's length scale, in m: it fixes the density, $8\pi G\rho/c^2 = 1/a^2$, and the rotation rate, $\omega = c/(\sqrt2\,a)$` },
    { tex: 't,\\ x,\\ y,\\ z', text: t`in Gödel's metric (second line), dimensionless coordinates in units with $c = 1$; the matter sits at fixed $x$, $y$, $z$` },
    { tex: 'G,\\ c', text: "Newton's constant and the speed of light" },
  ],
  why: 'Exact solutions are often quoted as if they were discoveries about the world — time machines, wormholes, warp drives. Reading the field equations backwards shows what each one demands of matter and of the universe, which is how you tell mathematics from physics.',
  visual: {
    ...godelCone({ sliders: true }),
    title: 'Light cones that tip over',
    lead: t`Gödel's universe in his cylindrical coordinates: $ds^2 = 4a^2\left[-dt^2 + dr^2 - (\sinh^4 r - \sinh^2 r)\,d\phi^2 - 2\sqrt2\sinh^2 r\,d\phi\,dt\right] + a^2dy^2$. The picture is the light cone at one radius, in the plane of small steps $(d\phi, dt)$. Watch the circle around the axis — the violet line.`,
    tasks: [
      t`Near the axis the cone opens upward but leans to one side: the rotating matter drags the light cones round with it.`,
      t`Slide $r$ outward: the right edge of the cone flattens. At $\sinh r = 1$, $r = \ln(1 + \sqrt2) \approx 0.881$, it lies along the circle: $g_{\phi\phi} = 0$, and the circle itself is a light ray.`,
      t`Beyond that radius the violet line is inside the cone. Going once round the circle at fixed $t$ is a future-pointing timelike path that ends where it began — a **closed timelike curve**. Gödel's universe is homogeneous, so such loops pass through every event.`,
    ],
  },
  example: {
    prompt: t`Read Einstein's equations backwards for Gödel's metric, $ds^2 = a^2\left[-(dt + e^xdz)^2 + dx^2 + dy^2 + \tfrac12e^{2x}dz^2\right]$ with $c = G = 1$: find what matter it needs, test that matter against the energy conditions, and locate the closed timelike curves.`,
    visual: godelCone({ r: 1.1, caption: t`Gödel's light cone at $r = 1.1$, beyond the critical radius $\ln(1 + \sqrt2) \approx 0.881$: the circle direction (violet) lies inside the cone, so circles here are timelike.` }),
    steps: [
      { label: 'The matter', text: t`Matter at fixed $(x, y, z)$ has $u^\mu = (1/a, 0, 0, 0)$, so $u_\mu = g_{\mu\nu}u^\nu = (-a, 0, 0, -ae^x)$ and $u_\mu u^\mu = -1$. Computing $u^\nu\nabla_\nu u^\mu$ gives zero: it falls freely. Its expansion is zero, and its vorticity, $\omega^2 = \tfrac12\omega_{\mu\nu}\omega^{\mu\nu}$ with $\omega_{\mu\nu} = \nabla_{[\nu}u_{\mu]}$, is $\omega = 1/(\sqrt2\,a)$: it rotates relative to gyroscopes.` },
      { label: 'Curvature', text: t`From the Christoffel symbols, $R_{\mu\nu} = u_\mu u_\nu/a^2$. Then $R = g^{\mu\nu}R_{\mu\nu} = -1/a^2$ and $$G_{\mu\nu} = R_{\mu\nu} - \tfrac12Rg_{\mu\nu} = \frac{u_\mu u_\nu}{a^2} + \frac{g_{\mu\nu}}{2a^2}.$$` },
      { label: 'Read off the source', text: t`Demand $G_{\mu\nu} + \Lambda g_{\mu\nu} = 8\pi G\rho\,u_\mu u_\nu$, dust. Matching the $u_\mu u_\nu$ terms gives $8\pi G\rho = 1/a^2$; matching the $g_{\mu\nu}$ terms gives $\Lambda = -1/(2a^2)$, a **negative** cosmological constant. Alternatively, with $\Lambda = 0$, a perfect fluid $(\rho + p)u_\mu u_\nu + pg_{\mu\nu}$ works with $8\pi G(\rho + p) = 1/a^2$ and $8\pi Gp = 1/(2a^2)$: stiff matter, $p = \rho = 1/(16\pi Ga^2)$.` },
      { label: 'Energy conditions', text: t`Dust with $\rho > 0$ meets all four; the stiff fluid meets all four, the dominant one with equality. Gödel's strangeness needs no exotic matter — it is global, not local.` },
      { label: 'Time loops', text: t`In cylindrical coordinates (the lead of the Explore step) the circle at fixed $t$, $r$, $y$ has $g_{\phi\phi} = 4a^2\sinh^2r\left(1 - \sinh^2r\right)$, negative for $\sinh r > 1$. Beyond $r_c = \ln(1 + \sqrt2)$ — a proper distance $2ar_c \approx 1.76a$ from the axis — those circles are closed timelike curves.` },
      { label: 'What it needs', text: t`In SI units, $8\pi G\rho/c^2 = 1/a^2$ and $\omega = c/(\sqrt2a)$ give $\omega = \sqrt{4\pi G\rho}$: a universe filled with matter rotating at that rate, not expanding, with $\Lambda < 0$. Ours expands, has $\Lambda > 0$, and the microwave background limits any rotation to $\omega < 4.7\times10^{-11}H_0$. Gödel's universe is mathematics, not ours.` },
    ],
    answer: t`Dust with $8\pi G\rho = 1/a^2$ and $\Lambda = -1/(2a^2)$ (or a stiff fluid $p = \rho = 1/(16\pi Ga^2)$ with $\Lambda = 0$), rotating at $\omega = 1/(\sqrt2a)$; every energy condition holds, and circles beyond $r = \ln(1 + \sqrt2)$ are closed timelike curves.`,
  },
  practice: [
    expr({
      id: 'cone-deficit', difficulty: 2,
      prompt: t`Outside a straight cosmic string, $ds^2 = -c^2dt^2 + dz^2 + dr^2 + \left(1 - \frac{4G\mu}{c^2}\right)^2r^2\,d\phi^2$. A circle at fixed $t$, $z$ and $r$ has proper circumference $C$, while its proper distance from the string is $r$. Find the deficit angle $\delta = 2\pi - C/r$.`,
      visual: wedgePic,
      answer: '8*pi*G*mu/c^2', answerTeX: t`\frac{8\pi G\mu}{c^2}`, lhs: t`\delta`,
      vars: { G: [0.5, 2], mu: [0.01, 0.05], c: [0.8, 2] },
      errors: [
        { answer: '2*pi*(1 - 4*G*mu/c^2)', feedback: t`That is $C/r$ itself. The deficit is what is missing from $2\pi$.` },
        { answer: '4*G*mu/c^2', feedback: t`$C = 2\pi\left(1 - 4G\mu/c^2\right)r$: the missing part is $2\pi\times4G\mu/c^2$.` },
        { answer: '8*G*mu/c^2', feedback: t`Keep the $\pi$: $\delta = 2\pi\times4G\mu/c^2$.` },
      ],
      hints: [t`$C = \int_0^{2\pi}\left(1 - 4G\mu/c^2\right)r\,d\phi$.`],
      teach: t`A cosmic string removes a wedge $\delta = 8\pi G\mu/c^2$ from space around it — and nothing else: the cone is flat away from the string.`,
      explain: t`$C = 2\pi r\left(1 - 4G\mu/c^2\right)$, so $\delta = 8\pi G\mu/c^2$. The Riemann tensor of this metric vanishes everywhere except on the axis: no tides, no Newtonian pull, just a global wedge — which is why a string would show itself through doubled images and a step in the microwave background rather than by attracting anything.`,
    }),
    expr({
      id: 'linear-to-cone', difficulty: 3,
      prompt: t`Solving step 28's linearized field equations for a string gives the spatial metric in the plane around it as $\left(1 - 2k\ln r\right)\left(dr^2 + r^2d\phi^2\right) \approx r^{-2k}\left(dr^2 + r^2d\phi^2\right)$, with $k = 4G\mu/c^2$ and $r$ in units of some reference radius. Find a new radial coordinate $R(r)$ that turns it into $dR^2 + (1 - k)^2R^2d\phi^2$.`,
      visual: conePic,
      answer: 'r^(1 - k)/(1 - k)', answerTeX: t`\frac{r^{1-k}}{1 - k}`, lhs: 'R(r)',
      vars: { r: [0.5, 3], k: [0.05, 0.3] },
      errors: [
        { answer: 'r^(1 - k)', feedback: t`Check $dR$: with $R = r^{1-k}$, $dR = (1 - k)r^{-k}dr$, so $dR^2$ carries an extra $(1 - k)^2$. Divide by $1 - k$.` },
        { answer: 'r^(1 + k)/(1 + k)', feedback: t`You need $dR = r^{-k}dr$, which integrates to $r^{1-k}/(1 - k)$.` },
        { answer: 'r*(1 - k)', feedback: t`That rescales $r$ but cannot absorb the factor $r^{-2k}$, which changes with $r$.` },
      ],
      hints: [t`The radial part needs $dR = r^{-k}dr$.`, t`Then check the angular part: $(1 - k)^2R^2 = r^{2-2k} = r^{-2k}r^2$.`],
      teach: t`The weak-field metric of a string is a flat cone in disguise: $R = r^{1-k}/(1 - k)$ turns it into $dR^2 + (1 - k)^2R^2d\phi^2$, deficit $2\pi k = 8\pi G\mu/c^2$.`,
      explain: t`$dR = r^{-k}dr$ gives the radial term, and $(1 - k)^2R^2 = r^{2-2k}$ gives the angular one. The result is the exact cone of the main equation: circles have circumference $2\pi(1 - k)R$, a deficit $2\pi k = 8\pi G\mu/c^2$. Vilenkin (1981) found the linearized field; the exact conical metric shows the deficit is no artefact of linearizing.`,
    }),
    mcq({
      id: 'string-conditions', difficulty: 2,
      prompt: t`Smoothed over its core, a straight string along $z$ has energy density $\varepsilon$ (energy per unit volume) and a tension along its length equal to it — pressure $p_z = -\varepsilon$ — with $p_x = p_y = 0$. Which energy conditions does its source break?`,
      visual: wedgePic,
      choices: [
        t`None: null ($\varepsilon + p_i \ge 0$), weak, strong ($\varepsilon + \sum p_i = 0$) and dominant ($\varepsilon \ge |p_i|$) all hold — three of them with equality`,
        t`The null condition, because the tension is a negative pressure`,
        t`The strong condition, like a cosmological constant`,
        t`The weak condition, because tension carries negative energy`,
      ],
      answer: 0,
      why: {
        1: t`Negative pressure alone is not enough: along $z$, $\varepsilon + p_z = 0$ exactly — the boundary, not beyond it.`,
        2: t`$\varepsilon + p_x + p_y + p_z = 0$: the strong condition holds with equality. $\Lambda$ breaks it because it has negative pressure in all three directions.`,
        3: t`The energy density $\varepsilon$ is positive for every observer: boosts along $z$ leave it unchanged (the null value there is zero), boosts across raise it.`,
      },
      hints: [t`Apply the eigenvalue forms: $\varepsilon + p_i$ for each $i$, $\varepsilon + \sum p_i$, and $\varepsilon \ge |p_i|$.`],
      teach: 'A cosmic string needs no exotic matter: its source meets every energy condition, sitting exactly on the boundary of three of them.',
      explain: t`$\varepsilon + p_x = \varepsilon + p_y = \varepsilon > 0$, $\varepsilon + p_z = 0$; $\varepsilon + \sum p_i = 0$; $\varepsilon = |p_z|$. Tension equal to energy density makes the string look the same to anyone moving along it. What a string needs is not exotic matter but a phase transition that leaves one behind — and none has been seen: the microwave background limits $G\mu/c^2$ to below about $10^{-7}$ (Planck, 2014), and pulsar timing pushes harder in many models.`,
    }),
    num({
      id: 'string-mass', difficulty: 2,
      gen(r) {
        const [x, txt] = r.pick([[1e-7, t`10^{-7}`], [1e-8, t`10^{-8}`], [1e-11, t`10^{-11}`]]);
        const mu = (x * C * C) / G;
        const m = (mu * LY) / M_SUN;
        return {
          prompt: t`A cosmic string has $G\mu/c^2 = ${txt}$. What is the mass of one light-year of it, in solar masses? ($G = 6.674\times10^{-11}$ SI, $c = 2.998\times10^8$ m/s, 1 ly $= 9.461\times10^{15}$ m, $M_\odot = 1.989\times10^{30}$ kg)`,
          answer: m, units: 'M☉', tol: { rel: 0.01 },
          errors: [
            { value: mu / M_SUN, feedback: t`That is one metre of string. Multiply by the light-year, $9.461\times10^{15}$ m.` },
            { value: (x * C * LY) / G / M_SUN, feedback: t`$\mu = (G\mu/c^2)\times c^2/G$ — square the speed of light.` },
          ],
          hints: [t`$\mu = \left(G\mu/c^2\right)\times c^2/G$, in kg/m.`, t`Multiply by $9.461\times10^{15}$ m and divide by $1.989\times10^{30}$ kg.`],
          teach: t`Even a "light" cosmic string is astonishingly dense: $\mu = (G\mu/c^2)\,c^2/G$, with $c^2/G = 1.35\times10^{27}$ kg/m.`,
          explain: t`$\mu = ${sci(mu)}$ kg/m, so a light-year weighs $${sci(mu * LY)}$ kg $= ${sci(m)}\,M_\odot$ — yet it pulls on nothing nearby: the cone has no tides. Its deficit angle is $8\pi G\mu/c^2 = ${sci(8 * Math.PI * x * 206264.806)}$ arcseconds.`,
          visual: wedgePic,
        };
      },
    }),
    num({
      id: 'godel-ctc', difficulty: 3,
      gen(r) {
        const aG = r.pick([5, 8.4, 20]);
        const d = 2 * aG * RC;
        return {
          prompt: t`In Gödel's cylindrical coordinates the circle at fixed $t$, $r$, $y$ has $g_{\phi\phi} = 4a^2\sinh^2r\left(1 - \sinh^2r\right)$, and the proper distance from the axis is $2ar$ (since $g_{rr} = 4a^2$). For $a = ${aG}$ billion light-years, how far from the axis, in billions of light-years, do the circles become timelike?`,
          answer: d, units: 'Gly', tol: { rel: 0.01 },
          errors: [
            { value: aG * RC, feedback: t`The proper distance is $\sqrt{g_{rr}}\,r = 2ar$, not $ar$.` },
            { value: 2 * aG, feedback: t`The circles turn timelike where $\sinh r = 1$, at $r = \ln(1 + \sqrt2) \approx 0.881$ — not at $r = 1$.` },
          ],
          hints: [t`$g_{\phi\phi} < 0$ once $\sinh r > 1$: $r_c = \sinh^{-1}1 = \ln(1 + \sqrt2)$.`, t`Then the distance is $2ar_c \approx 1.763a$.`],
          teach: t`Gödel's time loops start at a proper distance $2a\ln(1 + \sqrt2) \approx 1.76a$ from any chosen axis — for a density like ours, about 15 billion light-years.`,
          explain: t`$2a\ln(1 + \sqrt2) = ${round(d, 3)}$ Gly. For the average density of our universe, $a = c/\sqrt{8\pi G\rho}$ would be about $${round(C / Math.sqrt(8 * Math.PI * G * RHO_CRIT) / GLY, 2)}$ Gly, putting the loops some $${round(2 * RC * C / Math.sqrt(8 * Math.PI * G * RHO_CRIT) / GLY, 2)}$ Gly away — cosmological, and only in a universe that rotates and does not expand.`,
          visual: godelCone({ r: 1.0, caption: t`Gödel's light cone just beyond the critical radius: the circle direction (violet) has entered the cone.` }),
        };
      },
    }),
    mcq({
      id: 'godel-source', difficulty: 3,
      prompt: t`For Gödel's metric ($c = G = 1$), $R_{\mu\nu} = u_\mu u_\nu/a^2$ with $u_\mu u^\mu = -1$. If the source is pure dust, $T_{\mu\nu} = \rho u_\mu u_\nu$, what cosmological constant does $G_{\mu\nu} + \Lambda g_{\mu\nu} = 8\pi T_{\mu\nu}$ require?`,
      visual: godelCone({ r: 0.5, caption: t`Gödel's light cone at $r = 0.5$, inside the critical radius: tilted, but the circle direction (violet) is still outside it.` }),
      choices: [
        t`$\Lambda = -1/(2a^2)$, with $8\pi\rho = 1/a^2$`,
        t`$\Lambda = +1/(2a^2)$, with $8\pi\rho = 1/a^2$`,
        t`$\Lambda = 0$: dust alone does it`,
        t`$\Lambda = -1/a^2$, with $8\pi\rho = 2/a^2$`,
      ],
      answer: 0,
      why: {
        1: t`Check the sign of $R$: $R = g^{\mu\nu}u_\mu u_\nu/a^2 = -1/a^2$, so $-\tfrac12Rg_{\mu\nu} = +g_{\mu\nu}/(2a^2)$, which $\Lambda g_{\mu\nu}$ must cancel.`,
        2: t`With $\Lambda = 0$ the $g_{\mu\nu}/(2a^2)$ term must come from pressure: that is the stiff-fluid reading, $p = \rho = 1/(16\pi a^2)$ — not dust.`,
        3: t`Match term by term: the $u_\mu u_\nu$ coefficient is $1/a^2$ on the left, so $8\pi\rho = 1/a^2$.`,
      },
      hints: [t`$G_{\mu\nu} = R_{\mu\nu} - \tfrac12Rg_{\mu\nu}$ with $R = -1/a^2$.`, t`Compare the coefficients of $u_\mu u_\nu$ and of $g_{\mu\nu}$ separately.`],
      teach: t`Gödel's dust needs a negative cosmological constant, $\Lambda = -1/(2a^2)$ — the opposite sign to the one our universe has.`,
      explain: t`$G_{\mu\nu} = u_\mu u_\nu/a^2 + g_{\mu\nu}/(2a^2)$. Then $G_{\mu\nu} + \Lambda g_{\mu\nu} = 8\pi\rho u_\mu u_\nu$ needs $8\pi\rho = 1/a^2$ and $\Lambda = -1/(2a^2)$. Our measured $\Lambda$ is positive, about $1.1\times10^{-52}$ m⁻²: one more way Gödel's universe is not ours.`,
    }),
    code({
      id: 'sympy-godel', difficulty: 3,
      prompt: t`Check Gödel's source with SymPy. The program builds his metric ($c = G = 1$), its Christoffel symbols, the Ricci tensor \`R\` and the Ricci scalar \`Rs\`. Complete \`einstein(m, n)\` so that it returns $G_{\mu\nu} = R_{\mu\nu} - \tfrac12Rg_{\mu\nu}$. The tests then check the field equations for dust plus $\Lambda$, and for a stiff fluid with no $\Lambda$.`,
      visual: godelCone({ r: 1.1, caption: t`What the metric you are checking does to light cones beyond $r = \ln(1 + \sqrt2)$.` }),
      starter: CODE_START,
      answer: CODE_ANSWER,
      tests: [
        { name: t`$G_{tt} = \tfrac12$`, code: 'sp.simplify(einstein(0, 0) - sp.Rational(1, 2)) == 0' },
        { name: t`dust with $8\pi\rho = 1/a^2$ and $\Lambda = -1/(2a^2)$ solves every component`, code: 'residual == sp.zeros(4, 4)' },
        { name: t`so does a stiff fluid, $p = \rho = 1/(16\pi a^2)$, with $\Lambda = 0$`, code: 'all(sp.simplify(einstein(m, n) - 8*sp.pi*(2*u[m]*u[n] + g[m, n])/(16*sp.pi*a**2)) == 0 for m in range(4) for n in range(4))' },
      ],
      hints: ['`R[m, n]` is the Ricci tensor, `Rs` the scalar and `g[m, n]` the metric.', 'In code: `return R[m, n] - Rs*g[m, n]/2`.'],
      teach: t`Reading the field equations backwards is mechanical: compute $G_{\mu\nu}$ from the metric, then see what $T_{\mu\nu}$ it demands.`,
      explain: t`With $R_{\mu\nu} = u_\mu u_\nu/a^2$ and $R = -1/a^2$, $G_{tt} = 1 - \tfrac12 = \tfrac12$. Dust plus $\Lambda = -1/(2a^2)$ and a stiff fluid with $\Lambda = 0$ both make every component vanish: the same geometry, two readings of its source, and neither exotic.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-kaiser-stebbins', difficulty: 3, transfer: true,
      gen(r) {
        const [x, txt, v] = r.pick([[1e-7, t`10^{-7}`, 0.5], [1e-7, t`10^{-7}`, 0.9], [3e-8, t`3\times10^{-8}`, 0.5]]);
        const gam = 1 / Math.sqrt(1 - v * v);
        const dT = 8 * Math.PI * x * gam * v * T_CMB * 1e6;
        return {
          prompt: t`A cosmic string with $G\mu/c^2 = ${txt}$ sweeps across the sky at $v = ${v}c$. Because of the missing wedge, matter on the two sides of its path rushes together at relative speed $\delta\gamma v$, with $\delta = 8\pi G\mu/c^2$ and $\gamma = 1/\sqrt{1 - v^2/c^2}$; light from behind the string is Doppler-shifted by $\Delta T/T = \delta\gamma v/c$ relative to light from ahead of it. What temperature step, in microkelvin, would it leave on the microwave background, $T = 2.7255$ K?`,
          answer: dT, units: 'μK', tol: { rel: 0.01 },
          errors: [
            { value: dT / gam, feedback: t`Include the Lorentz factor: $\gamma = ${round(gam, 4)}$ at $v = ${v}c$.` },
            { value: dT / (8 * Math.PI), feedback: t`$\delta = 8\pi G\mu/c^2$, not $G\mu/c^2$.` },
            { value: dT / 1e6, feedback: 'That is in kelvin; the question asks for microkelvin.' },
          ],
          hints: [t`$\Delta T/T = 8\pi(G\mu/c^2)\gamma v/c$.`, t`Multiply by $2.7255$ K and by $10^6$ for μK.`],
          teach: 'A moving cosmic string would leave a sharp temperature step on the microwave background, a few microkelvin for the heaviest strings still allowed.',
          explain: t`$\Delta T/T = ${sci(dT / (T_CMB * 1e6))}$, so $\Delta T = ${round(dT, 3)}$ μK — sharp, along a line, against fluctuations of about 100 μK. Planck's searches for such steps found none, which is how the limit $G\mu/c^2 \lesssim 10^{-7}$ arises (Kaiser and Stebbins, 1984; Planck, 2014).`,
          visual: ksPic(dT),
        };
      },
    }),
    mcq({
      id: 'cp-time-machine', difficulty: 2,
      prompt: t`Closed timelike curves appear in other exact solutions too: around Tipler's infinitely long, rapidly rotating cylinder (1974), and around two cosmic strings passing each other at high speed (Gott, 1991). What do the theorems say about building a time machine in a finite region?`,
      visual: godelCone({ r: 1.2, caption: t`Gödel's tipped light cone at $r = 1.2$: the kind of geometry every time-machine solution needs somewhere.` }),
      choices: [
        t`Creating closed timelike curves in a finite region requires the null energy condition to fail (Hawking, 1992); Tipler's cylinder escapes only by being infinite, and Gott's strings only with a total momentum that is faster than light`,
        t`Closed timelike curves cannot appear in any solution of Einstein's equations`,
        t`Any rapidly rotating body, such as a pulsar, has time loops close to it`,
        t`Closed timelike curves are coordinate artefacts that a better choice of coordinates removes`,
      ],
      answer: 0,
      why: {
        1: t`Gödel's, Tipler's and Gott's spacetimes are all exact solutions with closed timelike curves.`,
        2: t`A rotating star's exterior has no time loops. Even Kerr's appear only deep inside the inner horizon, in a region not expected to exist in real collapse.`,
        3: t`Whether a closed curve is timelike, $g_{\mu\nu}\dot x^\mu\dot x^\nu < 0$ all the way round, does not depend on coordinates.`,
      },
      hints: ['What separates a solution from something that can be built in a laboratory-sized region of an ordinary universe?'],
      teach: 'Time loops exist on paper; making one in a finite region would need matter that breaks the null energy condition — and whether physics forbids it outright (chronology protection) is open.',
      explain: t`Hawking's 1992 theorem: a time machine that forms in a finite region, from ordinary initial conditions, needs the null (or averaged null) energy condition to fail somewhere. Tipler's cylinder must be infinitely long; Gott's strings need a total momentum faster than light (Carroll, Farhi and Guth; Deser, Jackiw and 't Hooft, 1992). Hawking conjectured that quantum effects always prevent time machines — "chronology protection", still unproven.`,
    }),
    num({
      id: 'cp-godel-rotation', difficulty: 3,
      gen(r) {
        const [rho, rhoTeX] = r.pick([[8.5e-27, t`8.5\times10^{-27}`], [2.7e-27, t`2.7\times10^{-27}`], [1e-25, t`1.0\times10^{-25}`]]);
        const w = Math.sqrt(4 * Math.PI * G * rho);
        const P = (2 * Math.PI) / w / YEAR / 1e9;
        return {
          prompt: t`In SI units Gödel's universe has $8\pi G\rho/c^2 = 1/a^2$ and rotation rate $\omega = c/(\sqrt2\,a)$. Find the rotation period $2\pi/\omega$, in billions of years, for a density $\rho = ${rhoTeX}$ kg/m³. ($G = 6.674\times10^{-11}$ SI, 1 yr $= 3.156\times10^7$ s)`,
          answer: P, units: 'Gyr', tol: { rel: 0.01 },
          errors: [
            { value: (2 * Math.PI) / Math.sqrt(8 * Math.PI * G * rho) / YEAR / 1e9, feedback: t`Keep the $\sqrt2$: $\omega = c/(\sqrt2a) = \sqrt{8\pi G\rho}/\sqrt2 = \sqrt{4\pi G\rho}$.` },
            { value: 1 / w / YEAR / 1e9, feedback: t`That is $1/\omega$. One turn takes $2\pi/\omega$.` },
          ],
          hints: [t`Eliminate $a$: $\omega^2 = c^2/(2a^2) = 4\pi G\rho$.`, t`$2\pi/\sqrt{4\pi G\rho}$ in seconds, then divide by $3.156\times10^{16}$ s per billion years.`],
          teach: t`Gödel's universe must rotate at $\omega = \sqrt{4\pi G\rho}$ — for our density, once every 75 billion years, about $10^{10}$ times faster than the microwave background allows.`,
          explain: t`$\omega = \sqrt{4\pi G\rho} = ${sci(w)}$ s⁻¹, a period of $${round(P, 3)}$ billion years. The isotropy of the microwave background limits any rotation of our universe to $\omega < ${sci(OMEGA_LIMIT, 2)}$ s⁻¹ — some $10^{${Math.round(Math.log10(w / OMEGA_LIMIT))}}$ times slower. Gödel's solution is correct mathematics; it is simply not our universe.`,
          visual: ratesPic,
        };
      },
    }),
  ],
  sources: [
    { label: 'Gödel, “An example of a new type of cosmological solutions of Einstein’s field equations of gravitation”, Rev. Mod. Phys. 21, 447 (1949)', url: 'https://doi.org/10.1103/RevModPhys.21.447' },
    { label: 'Vilenkin, “Gravitational field of vacuum domain walls and strings”, Phys. Rev. D 23, 852 (1981)', url: 'https://doi.org/10.1103/PhysRevD.23.852' },
    { label: 'Kaiser & Stebbins, “Microwave anisotropy due to cosmic strings”, Nature 310, 391 (1984)', url: 'https://doi.org/10.1038/310391a0' },
    { label: 'Planck 2013 results XXV: searches for cosmic strings and other topological defects, A&A 571, A25 (2014)', url: 'https://arxiv.org/abs/1303.5085' },
    { label: 'Hawking, “Chronology protection conjecture”, Phys. Rev. D 46, 603 (1992)', url: 'https://doi.org/10.1103/PhysRevD.46.603' },
    { label: 'Saadeh, Feeney, Pontzen, Peiris & McEwen, “How isotropic is the Universe?”, Phys. Rev. Lett. 117, 131302 (2016)', url: 'https://arxiv.org/abs/1605.07178' },
  ],
});
