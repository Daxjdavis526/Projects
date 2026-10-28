// scipy.optimize: brentq and minimize — a bracketing root finder that is as
// safe as bisection and nearly as fast as Newton, and minimizers that return
// a result object to be read, not trusted; the Earth–Moon L1 point, the plane
// change of a geostationary transfer split between two burns, and a nozzle's
// exit Mach number.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';

const t = String.raw;

// ── the Earth–Moon L1 point (constants as in the code) ──
const G = 6.674e-11, ME = 5.974e24, MM = 7.348e22, RM = 3.844e8, W = 2.662e-6;
const fL1 = (r) => (G * ME) / r ** 2 - (G * MM) / (RM - r) ** 2 - W * W * r;
const L1 = (() => { let a = 1e8, b = 3.8e8; for (let i = 0; i < 200; i++) { const m = (a + b) / 2; if (fL1(a) * fL1(m) <= 0) b = m; else a = m; } return (a + b) / 2; })();
const HILL = RM * (1 - Math.cbrt(MM / (3 * ME)));
const BRENT_L1 = { iterations: 12, calls: 13 };     // what brentq(f, 1e8, 3.8e8, full_output=True) reports in this Pyodide build (checked by running it)
// f in mm/s² against r in units of 10⁸ m, for the picture
const A1 = (G * ME) / 1e16 * 1e3, A2 = (G * MM) / 1e16 * 1e3, A3 = W * W * 1e8 * 1e3;

// ── the plane change of a geostationary transfer, split between perigee and apogee ──
const MU = 398600.4418, R1 = 6378.137 + 300, R2 = 42164.17;
const V1 = Math.sqrt(MU / R1), VP = Math.sqrt((MU * 2 * R2) / (R1 * (R1 + R2))), VA = Math.sqrt((MU * 2 * R1) / (R2 * (R1 + R2))), V2 = Math.sqrt(MU / R2);
const burn = (u, v, deg) => Math.sqrt(u * u + v * v - 2 * u * v * Math.cos((deg * Math.PI) / 180));
const totalDv = (a, inc) => burn(V1, VP, a) + burn(VA, V2, inc - a);
function bestSplit(inc) { let lo = 0, hi = inc; for (let i = 0; i < 200; i++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (totalDv(m1, inc) < totalDv(m2, inc)) hi = m2; else lo = m1; } const a = (lo + hi) / 2; return { a, dv: totalDv(a, inc) }; }
const CAPE = bestSplit(28.5), CAPE0 = totalDv(0, 28.5);

// ── the area–Mach relation of a nozzle, γ = 1.2 ──
const GAM = 1.2;
const AR = (M) => (1 / M) * ((2 / (GAM + 1)) * (1 + ((GAM - 1) / 2) * M * M)) ** ((GAM + 1) / (2 * (GAM - 1)));
const machSup = (eps) => { let a = 1, b = 20; for (let i = 0; i < 200; i++) { const m = (a + b) / 2; if ((AR(a) - eps) * (AR(m) - eps) <= 0) b = m; else a = m; } return (a + b) / 2; };
const machSub = (eps) => { let a = 1e-6, b = 1; for (let i = 0; i < 200; i++) { const m = (a + b) / 2; if ((AR(a) - eps) * (AR(m) - eps) <= 0) b = m; else a = m; } return (a + b) / 2; };
const EPS_CP = 40, M_CP = machSup(EPS_CP), M_CP_SUB = machSub(EPS_CP);

export default lesson({
  id: 'prog.P9.2',
  title: 'scipy.optimize: brentq and minimize',
  minutes: 12, difficulty: 3,
  intro: t`You wrote bisection and Newton by hand in the last lesson; in real work you call SciPy. \`brentq(f, a, b)\` needs a **bracket** — a sign change — and then mixes bisection with secant and inverse-quadratic steps (Brent's method): it can never leave the bracket, yet usually converges almost as fast as Newton, with no derivative needed. \`minimize(g, x0)\` and \`minimize_scalar(g, bounds=…)\` search for a minimum, where the gradient vanishes:

$$f(x^*) = 0 \ \text{ with } f(a)\,f(b) < 0, \qquad\qquad \nabla g(\vec p^{\,*}) = \vec 0$$

A minimizer finds a **local** minimum near where you start it, and reports how it went in a result object — read \`res.success\` and \`res.message\` before you believe \`res.x\`.`,
  symbols: [
    { tex: 'f(x)', text: 'the function whose root you want, written so that the root is where it is zero' },
    { tex: 'a,\\ b', text: 'the bracket you pass to `brentq`: $f$ must have opposite signs at the two ends' },
    { tex: 'x^*', text: 'the root `brentq` returns, to within `xtol` + `rtol`·|x| (by default $2\\times10^{-12}$ absolute plus about 4 machine epsilons relative)' },
    { tex: 'g(\\vec p)', text: 'the objective: the quantity to minimize (a total Δv, a χ², an energy) as a function of the parameters' },
    { tex: '\\vec p^{\\,*}', text: 'the minimizing parameters, `res.x` (always an array, even for one parameter)' },
    { tex: '\\nabla g', text: 'the gradient of $g$: zero at a smooth minimum; BFGS, the default method, estimates it by finite differences unless you pass `jac=`' },
  ],
  why: 'Trajectory design, equilibrium points, fitting, and every “choose the best” question in engineering run through these two calls; knowing what they assume is what keeps them honest.',
  visual: {
    type: 'code-runner',
    title: 'Where to turn the orbit',
    lead: t`A satellite bound for geostationary orbit starts in a 300 km parking orbit inclined like its launch site's latitude and must end in the equator's plane. Turning the plane costs less where the craft is slow (at apogee), but turning a little at perigee — combined with the big perigee burn — is almost free. Press **Run**: \`minimize_scalar\` finds the best split for three launch sites.`,
    tasks: [
      'Read the saving against doing the whole plane change at apogee: about 25 m/s from Cape Canaveral.',
      'Replace minimize_scalar with `minimize(lambda x: total_dv(x[0], inc), x0=[10.0])` and compare `res.x`: an array, and a slightly different answer.',
      'Change the parking altitude to 200 km. Does the best split move?',
    ],
    params: {
      rows: 24,
      code: t`import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import minimize_scalar

mu = 398600.4418                          # Earth's GM, km³/s²
r1, r2 = 6378.137 + 300, 42164.17         # parking-orbit and geostationary radii, km
v1 = np.sqrt(mu / r1)                     # circular speed in the parking orbit
vp = np.sqrt(mu * 2 * r2 / (r1 * (r1 + r2)))   # transfer orbit at perigee
va = np.sqrt(mu * 2 * r1 / (r2 * (r1 + r2)))   # transfer orbit at apogee
v2 = np.sqrt(mu / r2)                     # geostationary speed

def burn(u, v, deg):                      # Δv to turn speed u into speed v, deg degrees apart
    return np.sqrt(u**2 + v**2 - 2 * u * v * np.cos(np.radians(deg)))

def total_dv(a, inc):                     # a degrees of plane change at perigee, the rest at apogee
    return burn(v1, vp, a) + burn(va, v2, inc - a)

fig, ax = plt.subplots()
for site, inc in [("Kourou", 5.2), ("Cape Canaveral", 28.5), ("Baikonur", 51.6)]:
    res = minimize_scalar(total_dv, bounds=(0, inc), args=(inc,), method="bounded")
    saving = 1000 * (total_dv(0, inc) - res.fun)
    print(f"{site:15s} turn {res.x:5.2f}° at perigee: {res.fun:.4f} km/s, saves {saving:4.1f} m/s")
    a = np.linspace(0, min(inc, 8), 300)
    ax.plot(a, 1000 * (total_dv(a, inc) - res.fun), label=f"{site} ({inc}°)")
    ax.plot(res.x, 0, "o", color=ax.lines[-1].get_color())
ax.set_ylim(-5, 120)
ax.set_xlabel("plane change done at perigee (degrees)")
ax.set_ylabel("extra Δv over the best split (m/s)")
ax.legend()
plt.show()`,
    },
    caption: 'Impulsive burns, circular start and end orbits, a spherical Earth. Real transfers also weigh launcher performance, gravity losses and the time to reach the slot, so their numbers differ by a few metres per second.',
  },
  example: {
    prompt: t`Find the Earth–Moon L1 point: the distance $r$ from Earth's centre where a spacecraft co-rotating with the Moon feels no net force,

$$\frac{GM}{r^2} - \frac{Gm}{(R - r)^2} - \omega^2 r = 0$$

with $G = 6.674\times10^{-11}$ N m²/kg², Earth's mass $M = 5.974\times10^{24}$ kg, the Moon's mass $m = 7.348\times10^{22}$ kg, the Earth–Moon distance $R = 3.844\times10^{8}$ m and the Moon's orbital angular speed $\omega = 2.662\times10^{-6}$ rad/s.`,
    visual: {
      type: 'graph',
      params: { x: [0.8, 3.9], y: [-30, 60], aspect: 'wide', axesAt: 'edge', xlabel: 'r (10⁸ m)', ylabel: 'f(r) (mm/s²)',
        curves: [{ fn: `${A1}/x^2 - ${A2}/(${RM / 1e8} - x)^2 - ${A3}*x`, color: 'accent', domain: [0.8, 3.78], label: 'net acceleration f(r)', labelAt: 1.3, labelDx: 10, labelDy: -6 }],
        vlines: [{ x: 1, color: 'gold', label: 'a' }, { x: 3.8, color: 'gold', label: 'b' }] },
      caption: 'Earth’s pull minus the Moon’s minus the centripetal acceleration of co-rotation, between the bracket ends a and b. Earth sits at the origin; the Moon at 3.844. The model treats Earth, not the barycentre, as the centre of rotation.',
    },
    steps: [
      { label: 'Write f', text: t`Put every term on one side so the root is where $f = 0$: Earth's pull, minus the Moon's pull, minus the centripetal acceleration needed to co-rotate. Near Earth $f$ is large and positive; just short of the Moon it plunges negative.` },
      { label: 'Bracket it', text: t`$f(10^8\ \text{m}) = ${fL1(1e8).toFixed(4)}$ m/s² and $f(3.8\times10^{8}\ \text{m}) = ${fL1(3.8e8).toFixed(4)}$ m/s²: opposite signs, so a root lies between — and \`brentq\` will not start without that guarantee.` },
      { label: 'Call brentq', text: t`\`\`\`python
from scipy.optimize import brentq
G, M, m = 6.674e-11, 5.974e24, 7.348e22
R, w = 3.844e8, 2.662e-6
f = lambda r: G*M/r**2 - G*m/(R - r)**2 - w**2 * r
r, info = brentq(f, 1e8, 3.8e8, full_output=True)
print(r, info.iterations, info.function_calls)
\`\`\`

It prints $r = ${(L1 / 1e8).toFixed(5)}\times10^{8}$ m after ${BRENT_L1.iterations} iterations and ${BRENT_L1.calls} evaluations of $f$. Bisection over the same bracket would need about 50 halvings to reach the default tolerance.` },
      { label: 'Sense check', text: t`L1 is $R - r = ${((RM - L1) / 1e3).toFixed(0).replace(/(\d\d)(\d{3})$/, '$1{,}$2')}$ km from the Moon, ${(100 * (RM - L1) / RM).toFixed(1)}% of the way. The Hill-sphere estimate $R\left[1 - (m/3M)^{1/3}\right] = ${(HILL / 1e8).toFixed(3)}\times10^{8}$ m is within ${(100 * Math.abs(HILL - L1) / L1).toFixed(0)}% — a good check that the root is the one intended. (L1 is unstable: a craft parked there needs small station-keeping burns.)` },
    ],
    answer: t`$r \approx ${(L1 / 1e8).toFixed(4)}\times10^{8}$ m from Earth's centre, about ${Math.round((RM - L1) / 1e6)} 000 km short of the Moon.`,
  },
  practice: [
    mcq({
      id: 'same-sign', difficulty: 2,
      prompt: t`A nozzle's exit Mach number $M$ solves $A(M)/A^* = 16$, where $A/A^*$ is the area ratio. This call fails:

\`\`\`python
brentq(lambda M: area_ratio(M) - 16, 0.02, 5.0)
# ValueError: f(a) and f(b) must have different signs
\`\`\`

Why?`,
      visual: {
        type: 'graph',
        params: { x: [-2, 0.75], y: [0, 60], xlog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'Mach number M', ylabel: 'A/A*',
          curves: [{ fn: `(1/10^x)*((2/${GAM + 1})*(1 + ${(GAM - 1) / 2}*10^(2x)))^(${(GAM + 1) / (2 * (GAM - 1))})`, color: 'accent' }],
          hlines: [{ y: 16, color: 'gold', label: 'A/A* = 16' }], vlines: [{ x: Math.log10(0.02), color: 'ink3', label: '0.02' }, { x: Math.log10(5), color: 'ink3', label: '5' }] },
        caption: 'The area ratio against Mach number for γ = 1.2 (logarithmic Mach axis), with the bracket ends.',
      },
      choices: [
        'The bracket holds two roots, one subsonic and one supersonic, so f has the same sign at both ends',
        'There is no solution: no nozzle has an area ratio of 16',
        '`brentq` needs the derivative of f, which was not supplied',
        'The bracket is too wide: brentq only works on intervals shorter than 1',
      ],
      answer: 0,
      why: {
        1: 'The curve crosses 16 twice in the picture. Area ratios of 16 to 80 are typical of upper-stage engines.',
        2: 'Brent’s method needs no derivative — that is one of its selling points.',
        3: 'Any width is fine as long as f changes sign across it.',
      },
      hints: ['Evaluate the sign of f at each end, using the picture.', 'How many times does the curve cross the gold line between 0.02 and 5?'],
      teach: 'A bracketing method needs an odd number of roots inside the bracket — in practice exactly one — and refuses to start when the ends share a sign.',
      explain: t`$A/A^*$ is large at both low and high Mach number, with its minimum, 1, at the throat ($M = 1$). So $f$ is positive at both ends and the two roots are hidden. Choose the branch with the bracket: $[1, 10]$ for the supersonic exit of a rocket nozzle, $(0, 1]$ for the subsonic solution.`,
    }),
    num({
      id: 'plane-change', difficulty: 2,
      gen(r) {
        const [where, v] = r.pick([['at the apogee of a geostationary transfer orbit', VA], ['in a 300 km circular parking orbit', V1], ['in geostationary orbit', V2]]);
        const th = r.pick([5, 10, 28.5, 51.6]);
        const dv = 2 * v * Math.sin((th * Math.PI) / 360);
        const c = Math.cos((th * Math.PI) / 180), sn = Math.sin((th * Math.PI) / 180);
        return {
          prompt: t`A spacecraft moving at $v = ${v.toFixed(3)}$ km/s ${where} turns its velocity by $\theta = ${th}°$ **without changing its speed**. What $\Delta v$ does the burn cost?`,
          visual: {
            type: 'graph',
            params: { x: [-0.15, 1.25], y: [-0.15, Math.max(0.6, sn + 0.15)], equal: true, aspect: 'wide', axes: false, grid: false,
              arrows: [{ from: [0, 0], to: [1, 0], color: 'accent', label: 'before' }, { from: [0, 0], to: [c, sn], color: 'gold', label: 'after', labelDx: -46, labelDy: -6 }, { from: [1, 0], to: [c, sn], color: 'bad', dash: true, label: 'Δv', labelDx: 14, labelDy: 22 }] },
            caption: `Velocity before and after, equal in length, ${th}° apart; the dashed arrow is the change. Drawn to scale.`,
          },
          answer: dv, units: 'km/s', tol: { rel: 0.005 },
          errors: th < 20 ? [] : [{ value: v * Math.sin((th * Math.PI) / 180), feedback: t`$v\sin\theta$ is the sideways component of the new velocity. The change also shortens the forward component: $\Delta v = 2v\sin(\theta/2)$.` }],
          hints: ['The two velocities and Δv form an isosceles triangle with apex angle θ.', t`$\Delta v = 2v\sin(\theta/2)$ — or the law of cosines with $u = v$.`],
          teach: 'A pure plane change costs Δv = 2v sin(θ/2): proportional to speed, which is why it is done where the craft is slowest.',
          explain: t`$\Delta v = 2\times${v.toFixed(3)}\times\sin(${th / 2}°) = ${dv.toFixed(3)}$ km/s. ${v === VA ? 'At GTO apogee the craft is slow, so even a large turn is affordable.' : `At GTO apogee (${VA.toFixed(2)} km/s) the same turn would cost ${(2 * VA * Math.sin((th * Math.PI) / 360)).toFixed(3)} km/s.`}`,
        };
      },
    }),
    code({
      id: 'split', difficulty: 2,
      prompt: t`From Cape Canaveral the plane must turn by $28.5°$ between parking orbit and geostationary orbit. The function \`total_dv(a)\` (km/s) does $a$ degrees of it at perigee and the rest at apogee. Use \`minimize_scalar\` with \`bounds=(0, 28.5)\` and \`method="bounded"\` to set \`best_a\` (degrees) and \`best_dv\` (km/s).`,
      starter: t`import numpy as np
from scipy.optimize import minimize_scalar

v1, vp, va, v2 = ${V1.toFixed(6)}, ${VP.toFixed(6)}, ${VA.toFixed(6)}, ${V2.toFixed(6)}   # km/s

def burn(u, v, deg):
    return np.sqrt(u**2 + v**2 - 2 * u * v * np.cos(np.radians(deg)))

def total_dv(a):
    return burn(v1, vp, a) + burn(va, v2, 28.5 - a)

best_a = None
best_dv = None
`,
      answer: t`import numpy as np
from scipy.optimize import minimize_scalar

v1, vp, va, v2 = ${V1.toFixed(6)}, ${VP.toFixed(6)}, ${VA.toFixed(6)}, ${V2.toFixed(6)}   # km/s

def burn(u, v, deg):
    return np.sqrt(u**2 + v**2 - 2 * u * v * np.cos(np.radians(deg)))

def total_dv(a):
    return burn(v1, vp, a) + burn(va, v2, 28.5 - a)

res = minimize_scalar(total_dv, bounds=(0, 28.5), method="bounded")
best_a, best_dv = res.x, res.fun
print(best_a, best_dv)`,
      tests: [
        { name: t`about $${CAPE.a.toFixed(2)}°$ at perigee`, code: `abs(best_a - ${CAPE.a}) < 0.01` },
        { name: t`total $\Delta v = ${CAPE.dv.toFixed(4)}$ km/s`, code: `abs(best_dv - ${CAPE.dv}) < 1e-6` },
        { name: 'cheaper than doing the whole turn at apogee', code: 'best_dv < total_dv(0) - 0.02' },
      ],
      hints: ['`res = minimize_scalar(total_dv, bounds=(0, 28.5), method="bounded")`.', 'The minimizer is `res.x` and the minimum value is `res.fun`.'],
      teach: 'minimize_scalar with bounds searches a one-parameter design space safely; the result object carries both the best parameter (x) and the best value (fun).',
      explain: t`The best split turns ${CAPE.a.toFixed(2)}° at perigee and ${(28.5 - CAPE.a).toFixed(2)}° at apogee, for ${CAPE.dv.toFixed(4)} km/s — ${(1000 * (CAPE0 - CAPE.dv)).toFixed(0)} m/s less than turning only at apogee. A small turn added to a large burn costs almost nothing, because the turn's Δv is at right angles to the big one and adds in quadrature.`,
    }),
    mcq({
      id: 'maximize', difficulty: 2,
      prompt: t`\`range_km(angle)\` returns how far a sounding rocket's payload lands, with drag. SciPy has no \`maximize\`. Which call finds the angle for the **longest** range?

\`\`\`python
from scipy.optimize import minimize_scalar
# range_km(angle): landing distance in km for a launch angle in degrees
\`\`\``,
      choices: [
        '`minimize_scalar(lambda a: -range_km(a), bounds=(10, 89), method="bounded")`',
        '`minimize_scalar(range_km, bounds=(10, 89), method="bounded")`',
        '`minimize_scalar(lambda a: 1 / range_km(a), bounds=(0, 90), method="bounded")`',
        '`minimize_scalar(range_km, bounds=(10, 89), method="bounded").fun * -1`',
      ],
      answer: 0,
      why: {
        1: 'That finds the *shortest* range in the bounds.',
        2: 'Minimizing 1/range does maximize range — but at 0° or 90° the range is 0 and 1/range blows up; −range is smooth everywhere.',
        3: 'That only negates the shortest range; it does not search for the longest.',
      },
      hints: ['The largest value of g is where −g is smallest.'],
      teach: 'To maximize g, minimize −g; the maximum value is then −res.fun.',
      explain: t`The maximum of $g$ is the minimum of $-g$: pass \`lambda a: -range_km(a)\`, and read the longest range as \`-res.fun\`. With drag the best angle comes out below 45°, which is exactly why one optimizes rather than guesses.`,
    }),
    mcq({
      id: 'local-min', difficulty: 3,
      prompt: t`A fit's misfit $g(p)$ has two valleys. Two runs give different answers:

\`\`\`python
minimize(g, x0=[-1.5]).x     # array([-1.30])
minimize(g, x0=[ 1.5]).x     # array([ 1.13])
\`\`\`

Which is right?`,
      visual: {
        type: 'graph',
        params: { x: [-2.2, 2.2], y: [-4, 6], aspect: 'wide', axesAt: 'edge', xlabel: 'p', ylabel: 'g(p)',
          curves: [{ fn: 'x^4 - 3x^2 + x', color: 'accent' }],
          points: [{ x: -1.5, y: (-1.5) ** 4 - 3 * 2.25 - 1.5, color: 'gold', label: 'start −1.5', labelDx: -30, labelDy: -12 }, { x: 1.5, y: 1.5 ** 4 - 3 * 2.25 + 1.5, color: 'gold', label: 'start +1.5', labelDx: -20, labelDy: -12 }] },
        caption: 'The misfit g(p) = p⁴ − 3p² + p, with the two starting points.',
      },
      choices: [
        'Both are local minima; the one at −1.30 has the lower g, so it is the global minimum — and minimize alone cannot tell you that',
        'The second run, because BFGS always finds the global minimum from a positive start',
        'Neither: minimize failed, since a correct optimizer gives the same answer from any start',
        'Both are equally good; any point where the gradient vanishes is the answer',
      ],
      answer: 0,
      why: {
        1: 'No local method is guaranteed to find the global minimum; each slides into the valley it starts in.',
        2: 'Both runs succeeded — at different local minima. Local optimizers depend on where they start.',
        3: 'A zero gradient also holds at a maximum (here near p = 0.17) and at a local minimum that is not the lowest.',
      },
      hints: ['Each run walks downhill from its start. Which valley does each start sit above?', 'Compare g at the two answers.'],
      teach: 'minimize finds a local minimum near x0; for a global answer, start from several points (or use a global method such as differential_evolution) and keep the lowest.',
      explain: t`$g(-1.30) \approx -3.51$ and $g(1.13) \approx -1.07$: the left valley is deeper. A robust recipe is a multi-start: run from a grid of starts and keep the lowest \`res.fun\`, or call \`scipy.optimize.differential_evolution\` with bounds.`,
    }),
    mcq({
      id: 'xtol', difficulty: 3,
      prompt: t`A detector model needs the time $t$, a fraction of a picosecond, at which a pulse crosses threshold. Why is the first answer wrong?

\`\`\`python
f = lambda t: t - 3e-13          # root at 3 × 10⁻¹³ s
print(brentq(f, 0, 1))                # 0.0
print(brentq(f, 0, 1, xtol=1e-20))    # 3e-13
\`\`\``,
      choices: [
        '`xtol` is an absolute tolerance, $2\\times10^{-12}$ by default: any point within that of the root is accepted, and 0 is',
        'brentq cannot represent numbers smaller than $10^{-12}$',
        'Round-off: $3\\times10^{-13}$ is below machine epsilon',
        'The bracket [0, 1] does not contain the root',
      ],
      answer: 0,
      why: {
        1: 'Floats reach down to 10⁻³⁰⁸; the second call returns 3 × 10⁻¹³ exactly.',
        2: 'Machine epsilon limits *relative* precision near 1; small numbers are represented just as precisely relative to themselves.',
        3: 'f(0) < 0 < f(1): the root is inside.',
      },
      hints: ['The answer only has to be within xtol + rtol·|x| of the root.', 'What is the default xtol, and how big is the root?'],
      teach: 'brentq stops when the bracket is within xtol + rtol·|x|; xtol defaults to 2 × 10⁻¹² absolute, so for tiny roots set xtol yourself — or rescale to sensible units (picoseconds).',
      explain: t`The bracket shrank below $2\times10^{-12}$ while 0 was an end of it, so 0 was accepted: an absolute error of $3\times10^{-13}$, a relative error of 100%. Either pass a small \`xtol\`, or — better — work in units where the answer is of order 1 (here, picoseconds).`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      prompt: t`An upper-stage engine has nozzle area ratio $A_e/A^* = ${EPS_CP}$ and exhaust with $\gamma = ${GAM}$. Its exit Mach number $M$ solves the area–Mach relation

$$\frac{A}{A^*} = \frac1M\left[\frac{2}{\gamma + 1}\left(1 + \frac{\gamma - 1}{2}M^2\right)\right]^{\frac{\gamma + 1}{2(\gamma - 1)}}$$

on its **supersonic** branch. Write \`exit_mach(eps)\` with \`brentq\` and set \`M_exit = exit_mach(${EPS_CP})\`.`,
      starter: t`from scipy.optimize import brentq

g = ${GAM}

def area_ratio(M):
    return (1 / M) * ((2 / (g + 1)) * (1 + (g - 1) / 2 * M**2)) ** ((g + 1) / (2 * (g - 1)))

def exit_mach(eps):
    pass

M_exit = exit_mach(${EPS_CP})
`,
      answer: t`from scipy.optimize import brentq

g = ${GAM}

def area_ratio(M):
    return (1 / M) * ((2 / (g + 1)) * (1 + (g - 1) / 2 * M**2)) ** ((g + 1) / (2 * (g - 1)))

def exit_mach(eps):
    return brentq(lambda M: area_ratio(M) - eps, 1.0, 20.0)

M_exit = exit_mach(${EPS_CP})
print(M_exit)`,
      tests: [
        { name: t`$M_e = ${M_CP.toFixed(4)}$ for $A_e/A^* = ${EPS_CP}$`, code: `abs(M_exit - ${M_CP}) < 1e-8` },
        { name: t`the supersonic branch, not the subsonic root $M = ${M_CP_SUB.toFixed(4)}$`, code: 'M_exit > 1' },
        { name: t`$A_e/A^* = 16$ gives $M_e = ${machSup(16).toFixed(4)}$`, code: `abs(exit_mach(16) - ${machSup(16)}) < 1e-8` },
      ],
      hints: ['The root is where `area_ratio(M) - eps` is zero.', 'Bracket the supersonic branch: f(1) < 0 because A/A* = 1 at the throat, and f is large and positive by M = 20.', '`return brentq(lambda M: area_ratio(M) - eps, 1.0, 20.0)`'],
      teach: 'When an equation has several roots, the bracket chooses which one brentq returns — choose it from the physics.',
      explain: t`$M_e = ${M_CP.toFixed(3)}$. The bracket $[1, 20]$ holds exactly one root because $A/A^*$ rises monotonically above $M = 1$. The same equation has a subsonic root, $M = ${M_CP_SUB.toFixed(4)}$ — the flow in the converging part of the nozzle where the area is the same.`,
    }),
    mcq({
      id: 'cp-success', difficulty: 2,
      prompt: t`A trajectory optimizer prints this. What should you do?

\`\`\`python
>>> res = minimize(miss_distance, x0=[3.2e6, 0.4])
>>> res.success, res.message
(False, 'Desired error not necessarily achieved due to precision loss.')
>>> res.x
array([3.2e+06, 0.4])
\`\`\``,
      choices: [
        'Not use res.x: the search stalled at its start. Rescale the parameters to similar sizes (say, megametres and radians), then check res.success again',
        'Use res.x: the message is only a warning, and the optimizer found the minimum',
        'Raise maxiter until the warning goes away',
        'Switch to brentq, which never fails',
      ],
      answer: 0,
      why: {
        1: '`res.x` equals `x0`: nothing moved. A failed run’s x is wherever it gave up.',
        2: 'It did not run out of iterations; it could not find a downhill step it trusted.',
        3: 'brentq finds roots of one-variable functions; this is a two-parameter minimization.',
      },
      hints: ['Compare res.x with x0.', 'The two parameters differ in size by a factor of ten million. What does a finite-difference gradient step of the same size do to each?'],
      teach: 'Always read res.success and res.message; precision-loss failures usually mean badly scaled parameters or a noisy, non-smooth objective.',
      explain: t`The optimizer never left \`x0\`. Its finite-difference gradient uses steps scaled to each parameter and its line search assumes a smooth, well-scaled problem; with parameters of size $3\times10^{6}$ and $0.4$ (or with a noisy objective, such as one computed by a loose ODE solve) it cannot find a trusted downhill step. Rescale so both are of order 1, tighten the objective's own tolerances, or try a derivative-free method such as \`method="Nelder-Mead"\`.`,
    }),
    mcq({
      id: 'cp-branch', difficulty: 2,
      prompt: t`For a nozzle with $A/A^* = 25$, which bracket gives \`brentq\` the **supersonic** exit Mach number?

\`\`\`python
brentq(lambda M: area_ratio(M) - 25, a, b)
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [-2, 0.9], y: [0, 60], xlog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'Mach number M', ylabel: 'A/A*',
          curves: [{ fn: `(1/10^x)*((2/${GAM + 1})*(1 + ${(GAM - 1) / 2}*10^(2x)))^(${(GAM + 1) / (2 * (GAM - 1))})`, color: 'accent' }],
          hlines: [{ y: 25, color: 'gold', label: 'A/A* = 25' }] },
        caption: 'The area ratio against Mach number for γ = 1.2, logarithmic Mach axis.',
      },
      choices: ['$a = 1$, $b = 10$', '$a = 0.01$, $b = 10$', '$a = 0.01$, $b = 1$', '$a = 0$, $b = 10$'],
      answer: 0,
      why: {
        1: 'Both ends are above 25, so f has the same sign there: brentq raises ValueError.',
        2: 'That brackets the subsonic root, about M = 0.024.',
        3: 'At M = 0 the area ratio divides by zero; and the bracket would also contain both roots.',
      },
      hints: ['The supersonic branch is M > 1.', 'At the throat, M = 1, the area ratio is 1 — below 25.'],
      teach: 'Bracket a root from the physics: one end where you know f is negative (the throat, A/A* = 1), the other where it is surely positive.',
      explain: t`At $M = 1$, $f = 1 - 25 < 0$; at $M = 10$, $A/A^*$ is far above 25. The single crossing between is the supersonic exit, $M \approx ${machSup(25).toFixed(2)}$.`,
    }),
  ],
  sources: [
    { label: 'SciPy reference: scipy.optimize (brentq, minimize, minimize_scalar)', url: 'https://docs.scipy.org/doc/scipy/reference/optimize.html' },
    { label: 'Brent (1973), Algorithms for Minimization without Derivatives, ch. 4', url: 'https://books.google.com/books?id=FR8LAQAAMAAJ' },
    { label: 'Curtis, Orbital Mechanics for Engineering Students, §6.9–6.11: plane changes and combined maneuvers', url: 'https://www.sciencedirect.com/book/9780080977478/orbital-mechanics-for-engineering-students' },
    { label: 'Sutton & Biblarz, Rocket Propulsion Elements, §3.3: the area–Mach relation', url: 'https://www.wiley.com/en-us/Rocket+Propulsion+Elements%2C+9th+Edition-p-9781118753910' },
  ],
});
