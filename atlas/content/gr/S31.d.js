// Deriving the Friedmann and acceleration equations — Derivation Mode. FLRW
// (coordinate t, g_tt = −c²) with a perfect fluid at rest in comoving
// coordinates: R_tt = −3ä/a, R_ij = [(aä + 2ȧ²)/c² + 2k]γ_ij, R =
// 6(ä/a + ȧ²/a² + kc²/a²)/c²; G_tt = 3(ȧ²/a² + kc²/a²) (the ä cancels: a
// constraint) and T_tt = ρc⁴ give the Friedmann equation; the trace-reversed
// tt equation with T_tt − ½Tg_tt = ½c²(ρc² + 3p) gives the acceleration
// equation; ∇_μT^μt = ρ̇ + 3H(ρ + p/c²) (worked example). Also: a ∝
// t^{2/(3(1+w))}, q = (1 + 3w)/2, EdS R = 4/(3c²t²), Einstein's static universe
// Λ = k = 4πGρ/c², the bounce of Ω_m = 0.3, Ω_Λ = 2 at a = 0.647 (threshold
// Ω_Λ = 1.71), dust collapse in √(3π/(32Gρ₀)). Every result checked with SymPy
// (scratch v31.py) and the bounce with model/gr-cosmology. Avoids gr.EQ.11's
// and gr.S31.i's items.
import { lesson, mcq, num, expr, order, code } from '../../src/core/content.js';
import { G, C, YEAR, sci, round, rows } from './_derivlate.js';

const t = String.raw;

// ── pictures ────────────────────────────────────────────────────────────────

const ricciRows = rows([
  ['Rₜₜ', '−3ä/a'],
  ['Rᵢⱼ', '[(aä + 2ȧ²)/c² + 2k] γᵢⱼ'],
  ['R (scalar)', '6(ä/a + ȧ²/a² + kc²/a²)/c²'],
  ['Gₜₜ = Rₜₜ − ½R gₜₜ', '3(ȧ²/a² + kc²/a²)'],
], { split: 0.42, colors: ['ink2', 'ink2', 'ink2', 'gold'], caption: t`The Ricci tensor of FLRW in coordinates $(t, r, \theta, \phi)$, with $g_{tt} = -c^2$ and $\gamma_{ij}$ the comoving spatial metric — and the time–time component of the Einstein tensor built from it.` });

const fried = (models, caption, extra = {}) => ({
  type: 'gr-friedmann',
  params: { sliders: false, readout: false, models, t: [-14, 12], a: [0, 2], ...extra },
  caption,
});

// a static universe and its two neighbours (schematic)
const staticPic = {
  type: 'graph',
  params: {
    x: [0, 5], y: [0, 2], xlabel: 'time (arbitrary units)', ylabel: 'scale factor a',
    curves: [
      { fn: '1', color: 'gold', width: 2.6, label: 'balanced: static', labelAt: 4.2, labelDy: -12 },
      { fn: '1 + 0.03*exp(x)', domain: [0, 3.5], color: 'accent', width: 2, dash: true, label: 'a little more Λ: runs away', labelAt: 2.75, labelDx: -150, labelDy: -14 },
      { fn: '1 - 0.03*exp(x)', domain: [0, 3.5], color: 'bad', width: 2, dash: true, label: 'a little less: collapses', labelAt: 2.95, labelDx: -150, labelDy: 18 },
    ],
  },
  caption: 'Einstein’s static universe and two of its neighbours (schematic). Any small push grows: the balance is unstable, as Eddington showed in 1930.',
};

// a single power law, dust
const dustPower = {
  type: 'graph',
  params: {
    x: [0, 3], y: [0, 2.2], xlabel: 'time (arbitrary units)', ylabel: 'scale factor a',
    curves: [{ fn: 'x^(2/3)', domain: [0, 3], color: 'accent', width: 2.6, label: 'dust, w = 0: a ∝ t²ᐟ³', labelAt: 1.6, labelDx: 10, labelDy: 14 }],
  },
  caption: t`One example: a flat universe of pressureless matter grows as $t^{2/3}$. Other fluids give other powers.`,
};

// the collapse of a pressureless ball: a closed Friedmann solution (cycloid), time in units of the free-fall time
const cycloid = {
  type: 'graph',
  params: {
    x: [0, 1.15], y: [0, 1.15], xlabel: 'time ÷ the free-fall time', ylabel: 'radius ÷ starting radius',
    curves: [{ param: ['(t + sin(t))/pi', '(1 + cos(t))/2'], t: [0, 3.14159], color: 'accent', width: 2.8 }],
    points: [{ x: 0, y: 1, color: 'gold', r: 5, label: 'at rest', labelDx: 12, labelDy: 22 }],
  },
  caption: 'A cold, uniform ball of gas collapsing from rest: inside it, a closed Friedmann universe running in reverse, a = (1 + cos η)/2. Pressure, rotation and magnetic fields — all ignored — slow real collapses down.',
};

const CODE_START = t`import sympy as sp

t, r, th, ph, c, k = sp.symbols('t r theta phi c k', positive=True)
a = sp.Function('a')(t)
X = [t, r, th, ph]
g = sp.diag(-c**2, a**2/(1 - k*r**2), a**2*r**2, a**2*r**2*sp.sin(th)**2)   # FLRW
gi = g.inv()

def christoffel(l, m, n):
    return sum(gi[l, s]*(sp.diff(g[s, m], X[n]) + sp.diff(g[s, n], X[m]) - sp.diff(g[m, n], X[s])) for s in range(4))/2

Gam = [[[sp.simplify(christoffel(l, m, n)) for n in range(4)] for m in range(4)] for l in range(4)]

def ricci(m, n):
    tot = 0
    for l in range(4):
        tot += sp.diff(Gam[l][m][n], X[l]) - sp.diff(Gam[l][l][m], X[n])
        for s in range(4):
            tot += Gam[l][l][s]*Gam[s][m][n] - Gam[l][n][s]*Gam[s][l][m]
    return sp.simplify(tot)

R = sp.Matrix(4, 4, lambda m, n: ricci(m, n))   # diagonal for FLRW

def einstein_mixed(m):
    """G^m_m (no sum): g^mm R_mm - R/2, where R = g^nn R_nn summed."""
    return 0   # replace

print('G^t_t =', sp.simplify(einstein_mixed(0)))
print('G^r_r =', sp.simplify(einstein_mixed(1)))
`;
const CODE_ANSWER = CODE_START.replace('    return 0   # replace', '    Rs = sum(gi[n, n]*R[n, n] for n in range(4))\n    return gi[m, m]*R[m, m] - Rs/2');

export default lesson({
  id: 'gr.S31.d',
  title: 'Deriving the Friedmann and acceleration equations',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-obs', 'open'],
  intro: t`Put the FLRW metric into Einstein's equations, filled with a perfect fluid at rest in the comoving coordinates: energy density $\rho c^2$ and pressure $p$, depending on time only. Symmetry leaves just two independent equations. The time–time component contains no $\ddot a$ — it is the **Friedmann equation**, a constraint relating the expansion rate to the contents. The space–space components contain $\ddot a$ and give the **acceleration equation**. Energy conservation, $\nabla_\mu T^{\mu\nu} = 0$, then follows from the pair, as the Bianchi identity promises.

The derivation is exact and **established**; its inputs — what the universe contains, and what dark energy is — carry the open questions of the intuition lesson.`,
  equation: t`\left(\frac{\dot a}{a}\right)^2 = \frac{8\pi G}{3}\rho - \frac{kc^2}{a^2} + \frac{\Lambda c^2}{3}, \qquad \frac{\ddot a}{a} = -\frac{4\pi G}{3}\left(\rho + \frac{3p}{c^2}\right) + \frac{\Lambda c^2}{3}`,
  symbols: [
    { tex: 'a,\\ \\dot a,\\ \\ddot a', text: t`the scale factor (1 today) and its first and second derivatives with respect to cosmic time $t$` },
    { tex: '\\rho', text: t`the total mass density of the contents — energy density divided by $c^2$ — in kg/m³, the same everywhere at each moment` },
    { tex: 'p', text: t`the pressure, in Pa: $0$ for dust, $\rho c^2/3$ for radiation` },
    { tex: 'k', text: t`the spatial curvature of the FLRW metric, in m⁻²` },
    { tex: '\\Lambda', text: t`the cosmological constant, in m⁻² (measured: about $1.1\times10^{-52}$)` },
    { tex: 'G,\\ c', text: t`Newton's constant and the speed of light` },
  ],
  why: 'These two lines turn the contents of the universe into its history — the age, the switch to acceleration, the fate — and they are the template for every cosmological model, including the ones now testing whether dark energy is constant.',
  visual: {
    type: 'gr-friedmann',
    title: 'Solutions of the two equations',
    lead: t`Each curve solves the Friedmann and acceleration equations for matter and $\Lambda$, with $k$ fixed by the Friedmann equation today: $\Omega_k = 1 - \Omega_m - \Omega_\Lambda$. The dashed curve is Planck 2018.`,
    tasks: [
      t`Set $\Omega_m = 0.6$ and slide $\Omega_\Lambda$ through $0.3$: $q_0$ changes sign there. That is the acceleration equation today — matter’s pull, $\Omega_m/2$, against $\Lambda$’s push.`,
      t`Set $\Omega_m = 1$, $\Omega_\Lambda = 0$: a flat dust universe, $a \propto t^{2/3}$, the power law the practice derives.`,
      t`With $\Omega_m = 0.3$, push $\Omega_\Lambda$ past about $1.71$: the age reads “a bounce”. Run backwards, $\dot a$ reaches zero before $a$ does — the Friedmann equation has no solution below a minimum size.`,
    ],
    params: { Om: 0.315, OL: 0.685, H0: 67.4 },
  },
  example: {
    prompt: t`Derive the Friedmann and acceleration equations from $G_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu}$, for the FLRW metric in coordinates $(t, r, \theta, \phi)$ and a perfect fluid at rest in them, $u^\mu = (1, 0, 0, 0)$. Then show that energy conservation follows.`,
    visual: ricciRows,
    steps: [
      { label: 'Christoffel symbols', text: t`From step 30: $\Gamma^t{}_{ij} = a\dot a\,\gamma_{ij}/c^2$, $\Gamma^i{}_{tj} = (\dot a/a)\,\delta^i{}_j$, and the $\Gamma^i{}_{jk}$ of the comoving spatial metric $\gamma$; every other one is zero.` },
      { label: 'Ricci tensor', text: t`Feeding them into $R_{\mu\nu} = \partial_\lambda\Gamma^\lambda{}_{\mu\nu} - \partial_\nu\Gamma^\lambda{}_{\lambda\mu} + \Gamma\Gamma - \Gamma\Gamma$ gives $R_{tt} = -3\ddot a/a$ and $R_{ij} = \left[(a\ddot a + 2\dot a^2)/c^2 + 2k\right]\gamma_{ij}$; contracting with $g^{tt} = -1/c^2$ and $g^{ij} = \gamma^{ij}/a^2$, $$R = \frac{6}{c^2}\left(\frac{\ddot a}{a} + \frac{\dot a^2}{a^2} + \frac{kc^2}{a^2}\right).$$` },
      { label: 'Time–time', text: t`$G_{tt} = R_{tt} - \tfrac12Rg_{tt} = -3\dfrac{\ddot a}{a} + 3\left(\dfrac{\ddot a}{a} + \dfrac{\dot a^2}{a^2} + \dfrac{kc^2}{a^2}\right) = 3\left(\dfrac{\dot a^2}{a^2} + \dfrac{kc^2}{a^2}\right)$ — the $\ddot a$ cancels. The fluid has $u_t = g_{tt}u^t = -c^2$, so $T_{tt} = (\rho + p/c^2)c^4 - pc^2 = \rho c^4$. With $g_{tt} = -c^2$: $3\left(\dot a^2/a^2 + kc^2/a^2\right) - \Lambda c^2 = 8\pi G\rho$, the Friedmann equation.` },
      { label: 'Acceleration', text: t`Use the trace-reversed form (step 18), $R_{tt} = \frac{8\pi G}{c^4}\left(T_{tt} - \tfrac12Tg_{tt}\right) + \Lambda g_{tt}$. The trace is $T = -\rho c^2 + 3p$, so $T_{tt} - \tfrac12Tg_{tt} = \rho c^4 - \tfrac12(\rho c^4 - 3pc^2) = \tfrac12c^2(\rho c^2 + 3p)$. Then $-3\ddot a/a = 4\pi G(\rho + 3p/c^2) - \Lambda c^2$: $$\frac{\ddot a}{a} = -\frac{4\pi G}{3}\left(\rho + \frac{3p}{c^2}\right) + \frac{\Lambda c^2}{3}.$$` },
      { label: 'Conservation', text: t`Differentiate the Friedmann equation: $2H\dot H = \frac{8\pi G}{3}\dot\rho + \frac{2kc^2}{a^2}H$, with $H = \dot a/a$ and $\dot H = \ddot a/a - H^2$. Substitute the acceleration equation, then the Friedmann equation for $H^2$: the $k$ and $\Lambda$ terms cancel and $\dot\rho = -3H\left(\rho + p/c^2\right)$ remains — exactly $\nabla_\mu T^{\mu t} = 0$.` },
      { label: 'Sense check', text: t`Dust ($p = 0$) with $k = \Lambda = 0$: $\rho \propto a^{-3}$, so $\dot a^2 \propto 1/a$ and $a \propto t^{2/3}$ — Einstein–de Sitter (step 30). The $3p/c^2$ is pure relativity: in the Newtonian ball picture pressure would never enter.` },
    ],
    answer: t`$G_{tt} = 3(\dot a^2 + kc^2)/a^2$ with $T_{tt} = \rho c^4$ gives $H^2 = \frac{8\pi G}{3}\rho - \frac{kc^2}{a^2} + \frac{\Lambda c^2}{3}$; the trace-reversed $tt$ equation gives $\frac{\ddot a}{a} = -\frac{4\pi G}{3}\left(\rho + \frac{3p}{c^2}\right) + \frac{\Lambda c^2}{3}$; together they imply $\dot\rho = -3H(\rho + p/c^2)$.`,
  },
  practice: [
    mcq({
      id: 'tt-cancel', difficulty: 2,
      prompt: t`$R_{tt} = -3\ddot a/a$ contains the acceleration of the expansion, but $G_{tt} = R_{tt} - \tfrac12Rg_{tt}$ does not. Why must the $\ddot a$ cancel?`,
      visual: ricciRows,
      choices: [
        t`The time–time component of the Einstein tensor is a constraint: by the Bianchi identity, $G^{0\nu}$ never contains second time derivatives (step 29)`,
        'Because the universe is not accelerating',
        t`Because $\ddot a$ is negligible next to $\dot a^2/a$`,
        t`Because $k = 0$ in our universe`,
      ],
      answer: 0,
      why: {
        1: t`It cancels whatever $\ddot a$ is: the cancellation is an identity, true for every $a(t)$ — including our accelerating one.`,
        2: t`Nothing is neglected: $-3\ddot a/a$ from $R_{tt}$ and $+3\ddot a/a$ from $-\tfrac12Rg_{tt}$ cancel exactly.`,
        3: t`The $k$ terms survive in $G_{tt}$; they have nothing to do with the cancellation of $\ddot a$.`,
      },
      hints: [t`Add up the $\ddot a$ terms: $-3\ddot a/a$ from $R_{tt}$, and from $-\tfrac12Rg_{tt} = \tfrac12c^2R$.`, t`Step 29 showed which four components of $G_{\mu\nu}$ can never contain second time derivatives.`],
      teach: 'The Friedmann equation has no ä because it is the time–time component of the Einstein tensor — one of the four constraints of step 29.',
      explain: t`$-\tfrac12Rg_{tt} = \tfrac12c^2R = 3(\ddot a/a + \dot a^2/a^2 + kc^2/a^2)$, whose $+3\ddot a/a$ cancels $R_{tt}$'s $-3\ddot a/a$. It is the cosmological case of a general fact: the Bianchi identity keeps second time derivatives out of $G^{0\nu}$, so the Friedmann equation constrains each moment while the acceleration equation evolves.`,
    }),
    expr({
      id: 'ricci-eds', difficulty: 2,
      prompt: t`For a flat universe of dust, $a \propto t^{2/3}$. Using $R = \dfrac{6}{c^2}\left(\dfrac{\ddot a}{a} + \dfrac{\dot a^2}{a^2}\right)$ (with $k = 0$), find the Ricci scalar as a function of cosmic time.`,
      visual: fried([[1, 0, 'dust only', 'accent']], t`The flat dust universe, $a \propto t^{2/3}$, passing through today with the measured expansion rate (a teaching model).`),
      answer: '4/(3*c^2*t^2)', answerTeX: t`\frac{4}{3c^2t^2}`, lhs: 'R',
      vars: { t: [0.5, 3], c: [0.5, 2] },
      errors: [
        { answer: '4/(c^2*t^2)', feedback: t`Check the sign of $\ddot a/a$: for $a = t^{2/3}$, $\ddot a/a = \tfrac23\left(-\tfrac13\right)/t^2 = -\tfrac{2}{9t^2}$.` },
        { answer: '8/(3*c^2*t^2)', feedback: t`Include the $\ddot a/a$ term: it is $-\tfrac{2}{9t^2}$, not zero.` },
      ],
      hints: [t`$\dot a/a = \tfrac{2}{3t}$, and $\ddot a/a = \tfrac23\cdot\left(-\tfrac13\right)\tfrac{1}{t^2}$.`, t`$\tfrac{\ddot a}{a} + \tfrac{\dot a^2}{a^2} = -\tfrac{2}{9t^2} + \tfrac{4}{9t^2} = \tfrac{2}{9t^2}$.`],
      teach: t`The curvature of a dust universe falls as $1/t^2$: $R = 4/(3c^2t^2)$.`,
      explain: t`$R = \tfrac{6}{c^2}\cdot\tfrac{2}{9t^2} = \tfrac{4}{3c^2t^2}$. Check it against the field equations: $R = -\frac{8\pi G}{c^4}T = \frac{8\pi G\rho}{c^2}$, and the Friedmann equation with $H = 2/(3t)$ gives $\rho = 1/(6\pi Gt^2)$ — the same $4/(3c^2t^2)$.`,
    }),
    num({
      id: 'time-exponent', difficulty: 2,
      gen(r) {
        const [w, wTeX] = r.pick([[1 / 3, t`\tfrac13`], [1, '1'], [-1 / 3, t`-\tfrac13`], [-2 / 3, t`-\tfrac23`]]);
        const n = 2 / (3 * (1 + w));
        const errs = [{ value: (3 * (1 + w)) / 2, feedback: t`Upside down: $\rho \propto t^{-3n(1+w)}$ must match $H^2 \propto t^{-2}$, so $3n(1 + w) = 2$.` }, { value: 2 / 3, feedback: t`That is dust's exponent. With pressure, $\rho \propto a^{-3(1+w)}$ dilutes at a different rate.` }];
        return {
          prompt: t`A flat universe ($k = \Lambda = 0$) holds one fluid with $p = w\rho c^2$, $w = ${wTeX}$, so $\rho \propto a^{-3(1+w)}$. Try $a \propto t^n$ in the Friedmann equation $\left(\dot a/a\right)^2 = \tfrac{8\pi G}{3}\rho$. What is $n$?`,
          answer: n, tol: { rel: 0.001, abs: 0.001 },
          errors: errs.filter((e) => Math.abs(e.value - n) > 1e-6),
          hints: [t`With $a \propto t^n$: $(\dot a/a)^2 = n^2/t^2$, and $\rho \propto a^{-3(1+w)} \propto t^{-3n(1+w)}$.`, t`Matching the powers of $t$: $3n(1 + w) = 2$.`],
          teach: t`A single fluid with $p = w\rho c^2$ drives $a \propto t^{2/(3(1+w))}$: radiation $t^{1/2}$, dust $t^{2/3}$, a $w = -\tfrac13$ fluid coasts as $t$.`,
          explain: t`$n = \dfrac{2}{3(1 + w)} = ${sci(n, 3)}$. ${w > -1 / 3 ? 'Above $w = -\\tfrac13$, $n < 1$: the expansion decelerates.' : w === -1 / 3 ? 'At $w = -\\tfrac13$ the expansion coasts: $\\ddot a = 0$.' : 'Below $w = -\\tfrac13$, $n > 1$: the expansion accelerates — this fluid breaks the strong energy condition (step 33).'}`,
          visual: dustPower,
        };
      },
    }),
    num({
      id: 'einstein-static', difficulty: 3,
      gen(r) {
        const [rho, rhoTeX] = r.pick([[1e-26, t`1.0\times10^{-26}`], [3e-27, t`3.0\times10^{-27}`], [1e-27, t`1.0\times10^{-27}`]]);
        const L = (4 * Math.PI * G * rho) / C ** 2;
        return {
          prompt: t`Einstein's static universe (1917): dust of density $\rho$, with $\dot a = \ddot a = 0$ at $a = 1$. The acceleration equation then demands a cosmological constant to balance the dust's pull. For $\rho = ${rhoTeX}$ kg/m³, what $\Lambda$ is needed? ($G = 6.674\times10^{-11}$ SI, $c = 2.998\times10^{8}$ m/s)`,
          answer: L, units: 'm^-2', tol: { rel: 0.01 },
          errors: [{ value: 2 * L, feedback: t`From $\ddot a = 0$: $\tfrac{4\pi G}{3}\rho = \tfrac{\Lambda c^2}{3}$, so $\Lambda = 4\pi G\rho/c^2$ — not $8\pi G\rho/c^2$.` }, { value: L * C * C, feedback: t`Divide by $c^2$: $\Lambda$ is a curvature, in m⁻².` }],
          hints: [t`Set $\ddot a = 0$ and $p = 0$ in the acceleration equation.`, t`$\Lambda c^2/3 = 4\pi G\rho/3$, so $\Lambda = 4\pi G\rho/c^2$.`],
          teach: 'A static universe needs Λ = 4πGρ/c² and positive curvature k = Λ — a balance that any small push upsets.',
          explain: t`$\Lambda = 4\pi G\rho/c^2 = ${sci(L)}\ \text{m}^{-2}$. The Friedmann equation with $\dot a = 0$ then fixes $k = \Lambda$: a closed universe of curvature radius $1/\sqrt k = ${sci(1 / Math.sqrt(L) / 9.4607304725808e24, 3)}$ billion light-years. The balance is unstable (Eddington, 1930), and Hubble's expanding universe soon made it moot. The measured $\Lambda$, about $1.1\times10^{-52}\ \text{m}^{-2}$, is $${round(1.1e-52 / L, 1)}$ times this — the same ballpark only because dark energy and matter happen to have comparable densities today, a coincidence nobody has explained.`,
          visual: staticPic,
        };
      },
    }),
    mcq({
      id: 'bounce', difficulty: 3,
      prompt: t`Take $\Omega_m = 0.3$ and $\Omega_\Lambda = 2$, so $\Omega_k = -1.3$. The Friedmann equation $H^2 = H_0^2\left[\Omega_ma^{-3} + \Omega_ka^{-2} + \Omega_\Lambda\right]$ then has $H^2 < 0$ for $0.257 < a < 0.647$: run backwards from today, the expansion rate falls to zero at $a = 0.647$, and the universe bounces instead of starting in a Big Bang. What rules such a universe out?`,
      visual: fried([[0.3, 2, 'bounce', 'accent'], [0.315, 0.685, 'Planck 2018', 'gold']], 'Two solutions through today with the same expansion rate: the bouncing universe (blue) never had a Big Bang; Planck 2018’s (gold) did.'),
      choices: [
        t`In it no light could reach us from redshifts above $1/0.647 - 1 = 0.55$ — yet we see quasars beyond $z = 7$ and the cosmic background from $z \approx 1100$`,
        'Nothing: a bounce in the distant past would leave no trace today',
        t`$\Omega_\Lambda$ can never exceed 1`,
        'The Friedmann equation forbids negative curvature',
      ],
      answer: 0,
      why: {
        1: t`It leaves a sharp trace: a maximum redshift. Every observed source would have $1 + z < 1/a_{\min}$.`,
        2: t`Nothing in the equations caps $\Omega_\Lambda$; it is the observations that do.`,
        3: t`$k < 0$ (here $\Omega_k < 0$ means $k > 0$, closed) is perfectly allowed; the problem is the bounce, not the sign of $k$.`,
      },
      hints: [t`Redshift measures how much smaller the universe was when the light left: $1 + z = 1/a$.`, t`If $a$ was never below 0.647, what is the largest redshift any light could carry?`],
      teach: 'Run backwards, the Friedmann equation must allow a to reach the small values that observed redshifts require — which excludes bouncing universes like this one.',
      explain: t`$1 + z = 1/a \le 1/0.647$, so $z \le 0.55$. We see galaxies and quasars far beyond that, and the cosmic background was released when $a$ was about $1/1100$. For $\Omega_m = 0.3$, any $\Omega_\Lambda$ above about 1.71 gives a bounce; Planck's 0.685 is far below. (Here $\Omega_k = -kc^2/H_0^2$, so $\Omega_k < 0$ means $k > 0$.)`,
    }),
    order({
      id: 'continuity-order', difficulty: 2,
      prompt: t`Put the steps that derive energy conservation, $\dot\rho = -3H(\rho + p/c^2)$, from the Friedmann and acceleration equations in order.`,
      items: [
        t`Differentiate the Friedmann equation: $2H\dot H = \tfrac{8\pi G}{3}\dot\rho + \tfrac{2kc^2}{a^2}H$`,
        t`Write $\dot H = \ddot a/a - H^2$ and substitute the acceleration equation for $\ddot a/a$`,
        t`Replace $H^2$ with the Friedmann equation: the $k$ and $\Lambda$ terms cancel`,
        t`Divide by $\tfrac{8\pi G}{3}$: $\dot\rho = -3H\left(\rho + p/c^2\right)$`,
      ],
      hints: ['Start from the equation without ä, and bring ä in through the time derivative of H.', 'The curvature and Λ terms must disappear before ρ̇ stands alone.'],
      teach: 'The continuity equation is not independent: the Friedmann and acceleration equations already contain it — the Bianchi identity at work.',
      explain: t`Differentiating the constraint and inserting the evolution equation leaves $\tfrac{8\pi G}{3}\dot\rho = -8\pi GH(\rho + p/c^2)$. That is $\nabla_\mu T^{\mu t} = 0$, which the Bianchi identity guarantees for any solution of Einstein's equations.`,
    }),
    code({
      id: 'sympy-friedmann', difficulty: 3,
      prompt: t`Derive the left-hand sides with SymPy. The program builds the FLRW metric in coordinates $(t, r, \theta, \phi)$, its Christoffel symbols and its Ricci tensor \`R\` (a matrix, diagonal here). Complete \`einstein_mixed(m)\` so that it returns the mixed Einstein tensor $G^m{}_m = g^{mm}R_{mm} - \tfrac12R$, where $R = \sum_n g^{nn}R_{nn}$ (the metric is diagonal, so \`gi[n, n]\` is $g^{nn}$).`,
      starter: CODE_START,
      answer: CODE_ANSWER,
      tests: [
        { name: t`$G^t{}_t = -3\left(\dot a^2 + kc^2\right)/(c^2a^2)$`, code: 'sp.simplify(einstein_mixed(0) + 3*(sp.diff(a, t)**2 + k*c**2)/(c**2*a**2)) == 0' },
        { name: t`$G^r{}_r = -\left(2a\ddot a + \dot a^2 + kc^2\right)/(c^2a^2)$`, code: 'sp.simplify(einstein_mixed(1) + (2*a*sp.diff(a, t, 2) + sp.diff(a, t)**2 + k*c**2)/(c**2*a**2)) == 0' },
        { name: t`isotropy: $G^\theta{}_\theta = G^r{}_r$`, code: 'sp.simplify(einstein_mixed(2) - einstein_mixed(1)) == 0' },
      ],
      hints: ['First the Ricci scalar: `Rs = sum(gi[n, n]*R[n, n] for n in range(4))`.', 'Then `return gi[m, m]*R[m, m] - Rs/2`.'],
      teach: t`With $T^t{}_t = -\rho c^2$ and $T^r{}_r = p$, the two components $G^t{}_t$ and $G^r{}_r$ are all of cosmology's field equations.`,
      explain: t`$G^t{}_t + \Lambda = -\frac{8\pi G}{c^2}\rho$ is the Friedmann equation, and $G^r{}_r + \Lambda = \frac{8\pi G}{c^4}p$, combined with it, is the acceleration equation. SymPy confirms there is no $\ddot a$ in $G^t{}_t$ — the constraint — and that the three space directions agree, as isotropy demands.`,
      visual: { type: 'gr-friedmann', params: { sliders: false, readout: false, t: [-14, 12], a: [0, 2] }, caption: 'Our universe’s scale factor (Planck 2018): the solution of the two equations your code derives, for matter and Λ.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-collapse', difficulty: 3, transfer: true,
      gen(r) {
        const [rho, rhoTeX] = r.pick([[1e-17, t`1\times10^{-17}`], [3e-17, t`3\times10^{-17}`], [1e-16, t`1\times10^{-16}`]]);
        const tff = Math.sqrt((3 * Math.PI) / (32 * G * rho)) / YEAR;
        return {
          prompt: t`A cold, uniform gas cloud of density $\rho_0$ starts at rest and collapses under its own gravity, pressure negligible. Inside, it is a closed dust universe running in reverse ($a(0) = 1$, $\dot a(0) = 0$): $a = \tfrac12(1 + \cos\eta)$, $t = (\eta + \sin\eta)\big/\left(2\sqrt{8\pi G\rho_0/3}\right)$, which reaches $a = 0$ at $\eta = \pi$, after $t_{\text{ff}} = \sqrt{3\pi/(32G\rho_0)}$. How many years does a star-forming cloud core with $\rho_0 = ${rhoTeX}$ kg/m³ take? ($G = 6.674\times10^{-11}$ SI)`,
          answer: tff, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(3 / (8 * Math.PI * G * rho)) / YEAR, feedback: t`That is $1/\sqrt{8\pi G\rho_0/3}$ alone; the collapse takes $\pi/2$ times it.` }, { value: tff * YEAR, feedback: 'That is in seconds; divide by 3.156 × 10⁷ s per year.' }],
          hints: [t`$t_{\text{ff}} = \pi/\left(2\sqrt{8\pi G\rho_0/3}\right) = \sqrt{3\pi/(32G\rho_0)}$, in seconds.`, t`$\sqrt{3\pi/(32\times6.674\times10^{-11}\times\rho_0)}$, then divide by $3.156\times10^{7}$ s.`],
          teach: 'The free-fall time of a pressureless cloud is a closed Friedmann universe run backwards: √(3π/(32Gρ₀)), depending on the density alone.',
          explain: t`$t_{\text{ff}} = ${sci(tff)}$ years. It depends only on the density: a denser core collapses faster. The same closed-Friedmann interior, glued to a Schwarzschild exterior, is Oppenheimer and Snyder's 1939 model of a star collapsing to a black hole. Real cores collapse more slowly — pressure, rotation and magnetic fields resist.`,
          visual: cycloid,
        };
      },
    }),
    mcq({
      id: 'cp-lambda-fluid', difficulty: 2,
      prompt: t`Move $\Lambda$ to the matter side as a "fluid" of density $\rho_\Lambda = \Lambda c^2/(8\pi G)$. What pressure must it have for its terms in **both** the Friedmann and the acceleration equations to come out right?`,
      choices: [
        t`$p_\Lambda = -\rho_\Lambda c^2$, so $\rho_\Lambda + 3p_\Lambda/c^2 = -2\rho_\Lambda$ and the acceleration term is $+\tfrac{8\pi G}{3}\rho_\Lambda = +\tfrac{\Lambda c^2}{3}$`,
        t`$p_\Lambda = 0$, like dust`,
        t`$p_\Lambda = +\rho_\Lambda c^2/3$, like radiation`,
        t`$p_\Lambda = -\rho_\Lambda c^2/3$`,
      ],
      answer: 0,
      why: {
        1: t`Dust would put $-\tfrac{4\pi G}{3}\rho_\Lambda$ in the acceleration equation — a pull — where $\Lambda$ gives $+\tfrac{\Lambda c^2}{3}$, a push.`,
        2: t`Positive pressure adds to the pull: $\rho + 3p/c^2 = 2\rho_\Lambda$.`,
        3: t`That makes $\rho + 3p/c^2 = 0$: no acceleration at all — the boundary, $w = -\tfrac13$.`,
      },
      hints: [t`The Friedmann equation fixes $\rho_\Lambda$. In the acceleration equation you need $-\tfrac{4\pi G}{3}(\rho_\Lambda + 3p_\Lambda/c^2) = \tfrac{\Lambda c^2}{3} = \tfrac{8\pi G}{3}\rho_\Lambda$.`],
      teach: 'A cosmological constant is a fluid with p = −ρc²: positive energy, negative pressure, and net repulsive gravity.',
      explain: t`The condition is $\rho_\Lambda + 3p_\Lambda/c^2 = -2\rho_\Lambda$, so $p_\Lambda = -\rho_\Lambda c^2$ ($w = -1$). With it $\rho + p/c^2 = 0$ and the continuity equation gives $\dot\rho_\Lambda = 0$: a constant density, as $\Lambda$ must be. Whether dark energy is exactly this — $w = -1$ for ever — is one of the open questions.`,
    }),
    num({
      id: 'cp-q', difficulty: 2,
      gen(r) {
        const [w, wTeX] = r.pick([[1 / 3, t`\tfrac13`], [1, '1'], [-1, '-1'], [-2 / 3, t`-\tfrac23`]]);
        const q = (1 + 3 * w) / 2;
        return {
          prompt: t`The deceleration parameter is $q = -\ddot a\,a/\dot a^2$. For a flat universe holding one fluid with $p = w\rho c^2$ (and $\Lambda$ counted as the fluid $w = -1$), divide the acceleration equation by the Friedmann equation. What is $q$ for $w = ${wTeX}$?`,
          answer: q, tol: { rel: 0.001, abs: 0.001 },
          errors: [{ value: 1 + 3 * w, feedback: t`Keep the ratio of the coefficients: $\tfrac{4\pi G}{3}$ over $\tfrac{8\pi G}{3}$ is $\tfrac12$.` }, ...(w !== 0 ? [{ value: -(1 + 3 * w) / 2, feedback: t`Mind the sign in the definition: $q = -\ddot a a/\dot a^2$ is positive when the expansion slows.` }] : [])],
          hints: [t`$\dfrac{\ddot a/a}{(\dot a/a)^2} = \dfrac{-\tfrac{4\pi G}{3}\rho(1 + 3w)}{\tfrac{8\pi G}{3}\rho} = -\tfrac12(1 + 3w)$.`],
          teach: 'For a single fluid, q = (1 + 3w)/2: decelerating for w > −1/3, accelerating below.',
          explain: t`$q = \tfrac12(1 + 3w) = ${sci(q, 3)}$: ${q > 0 ? 'positive — the expansion slows' : 'negative — the expansion speeds up'}. Our universe, a mixture, has $q_0 = \Omega_m/2 - \Omega_\Lambda \approx -0.53$ (step 31's intuition lesson).`,
          visual: dustPower,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 8 (the Friedmann equations)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Carroll, Press & Turner, “The cosmological constant”, Annu. Rev. Astron. Astrophys. 30, 499 (1992)', url: 'https://doi.org/10.1146/annurev.aa.30.090192.002435' },
    { label: 'Oppenheimer & Snyder, “On continued gravitational contraction”, Phys. Rev. 56, 455 (1939)', url: 'https://doi.org/10.1103/PhysRev.56.455' },
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
  ],
});
