// The Scientific Programming boss, "The Simulation Challenge": an imagined
// clock satellite, Tempo, on an eccentric orbit like the one Galileo
// satellites 5 and 6 were stranded in by a faulty upper stage in 2014 (a ≈
// 27 977 km, e ≈ 0.162), whose atomic clock should show general relativity's
// periodic offset Δτ = −(2/c²)√(μa) e sin E (the same term GPS calls the
// eccentricity correction), amplitude ≈ 381 ns. The team inherits a crashing
// analysis script (an acos past 1 at perigee), makes the clock part of the
// integrated state, measures its integrator's order and the energy drift
// over a year, writes a time-reversal test that catches a spurious drag term,
// finds two values of c in two files, fits the offset with honest
// uncertainties, finds the orbital line in the FFT, propagates the orbit's
// uncertainty into the prediction, reads the radial phase portrait, and
// states what the result does and does not show. Every number a learner
// reads comes from code here or from a run in the Atlas's Pyodide (noted).
import { boss, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { errbar, normals } from './_numkit.js';
import { linlsq } from './_fit.js';
import { uniforms } from './_solvers.js';

const t = String.raw;
const lg = Math.log10;

// ── Tempo's orbit ──
const MU = 398600.4418, CK = 299792.458;                      // km³/s², km/s
const A_ORB = 27977, ECC = 0.162;                              // km
const T_ORB = 2 * Math.PI * Math.sqrt(A_ORB ** 3 / MU);       // s
const N_YEAR = (365.25 * 86400) / T_ORB;                      // orbits per year
const A_NS = ((2 * Math.sqrt(MU * A_ORB) * ECC) / CK ** 2) * 1e9;   // the predicted amplitude, ns
const VR = Math.sqrt(MU / A_ORB) * ECC;                       // km/s, the scale of dr/dt

// ── round 4: synthetic clock residuals, made with GR's amplitude, σ = 3 ns ──
const FIT = (() => {
  const z = normals(43), u = uniforms(143);
  const E = Array.from({ length: 36 }, () => +(2 * Math.PI * u()).toFixed(3));
  const y = E.map((x) => +(-A_NS * Math.sin(x) + 1.5 + 3 * z()).toFixed(1));
  return { E, y, ...linlsq([(x) => -Math.sin(x), () => 1], E, y, 3) };
})();
const ALPHA = FIT.p[0] / A_NS - 1, DALPHA = FIT.err[0] / A_NS;
function chi2sf(x, nu) {            // P(χ² ≥ x), even ν
  let l = -x / 2, s = 0;
  for (let k = 0; k < nu / 2; k++) { s += Math.exp(l); l += Math.log(x / 2) - Math.log(k + 1); }
  return s;
}

/** Keep only slips that stand clear of the key and of each other. */
const apart = (errors, key, rel = 0.03) => {
  const out = [];
  for (const e of errors) {
    if (!Number.isFinite(e.value) || Math.abs(e.value - key) <= rel * Math.abs(key)) continue;
    if (out.some((o) => Math.abs(o.value - e.value) <= rel * Math.abs(e.value))) continue;
    out.push(e);
  }
  return out;
};

// ── the radial loop of Tempo's orbit, in 1000 km and km/s, parametrized by the eccentric anomaly ──
const loop = { param: [`${A_ORB / 1000}*(1 - ${ECC}*cos(t))`, `${VR.toFixed(5)}*sin(t)/(1 - ${ECC}*cos(t))`], t: [0, 2 * Math.PI], color: 'accent', width: 2.2 };
const E90 = (A_ORB / 1000), V90 = VR;

export default boss({
  title: 'The Simulation Challenge',
  intro: t`In 2014 a faulty upper stage left two Galileo navigation satellites on eccentric orbits, useless for navigation — and in 2018 two teams turned the accident into a test of general relativity: a clock that swings between 23 000 and 33 000 km from Earth's centre should run fast and slow by a precise, periodic amount. This boss imagines a successor, *Tempo*, on the same kind of orbit ($a = 27\,977$ km, $e = 0.162$, $\mu = 398\,600.4418\ \text{km}^3/\text{s}^2$). Relativity predicts that its clock, compared with a steady one, gains and loses $\Delta\tau = -\frac{2}{c^2}\sqrt{\mu a}\,e\,\sin E$, where $E$ is the eccentric anomaly — an amplitude of about $${A_NS.toFixed(0)}$ ns. Your job: make the simulation run, converge it, test it, measure the effect — and say honestly what you have shown.`,
  pass: 0.7,
  rounds: [
    {
      title: 'The inherited script',
      story: t`The analysis code you inherit crashes on its first pass through perigee. Before anything else, it has to run — and it has to carry the clock.`,
      items: [
        mcq({
          id: 'r1-crash', skill: 'prog.P0.2', difficulty: 3,
          prompt: t`The script converts each integrated position to a true anomaly $\nu$. It stops at the first perigee:

\`\`\`python
import math
a, e = 27977.0, 0.162                     # km

def true_anomaly(r, a, e):
    """True anomaly (rad) from the distance r, by inverting the orbit equation."""
    return math.acos((a * (1 - e**2) / r - 1) / e)

for t, x, y in zip(sol.t, sol.y[0], sol.y[1]):
    nu = true_anomaly(math.hypot(x, y), a, e)
\`\`\`

\`\`\`
  line 9, in <module>
  line 6, in true_anomaly
ValueError: expected a number in range from -1 up to 1, got 1.00000000002152
\`\`\`

What happened, and what is the right fix?`,
          choices: [
            'At perigee the integrated r is a hair below a(1 − e), so the cosine comes out as 1 + 2×10⁻¹¹ and acos refuses; compute ν from the position itself with atan2, which also tells the outbound half of the orbit from the inbound one',
            'The orbit has become hyperbolic: e is now above 1',
            'math.acos works in degrees, so the radians must be converted first',
            'The satellite has passed below the Earth’s surface',
          ],
          answer: 0,
          why: {
            1: t`$e = 0.162$ is fixed in the code; the argument's excess, $2\times10^{-11}$, is the size of integration and rounding error, not of a change of orbit.`,
            2: 'acos takes a cosine (a pure number) and returns radians; its argument here is out of range for any unit.',
            3: 'Perigee is 23 445 km from the centre, far above the 6378 km surface.',
          },
          hints: ['Read the last line: what number did acos get, and what range does it accept?', t`What is $(a(1 - e^2)/r - 1)/e$ exactly at $r = a(1 - e)$, and what do a few rounding errors do to it?`],
          teach: 'A formula that is exact at a boundary (a cosine of exactly 1) fails when rounding nudges it past; use a formulation that cannot leave its domain, such as atan2.',
          explain: t`At perigee the argument is exactly 1 in mathematics, and $1 + 2\times10^{-11}$ after a long integration. Clipping (\`max(-1, min(1, c))\`) stops the crash, but acos of a distance still cannot say whether the satellite is going out or coming in. With perigee on the $x$ axis, \`nu = math.atan2(y, x)\` is exact everywhere.`,
        }),
        code({
          id: 'r1-clock', skill: 'prog.P11.2', difficulty: 3,
          prompt: t`Make the clock part of the simulation. Its offset from a steady clock grows at the rate $\dfrac{d\,\Delta\tau}{dt} = -\dfrac{2\mu}{c^2}\left(\dfrac1r - \dfrac1a\right)$. Add $\Delta\tau$ (in seconds) as a **fifth state component**, integrate one orbit from perigee with tolerances tight enough to resolve a few hundred nanoseconds (\`atol\` is in each component's units, so give the clock a tiny one), and set \`amp_ns\` to half the peak-to-peak offset in nanoseconds.`,
          starter: t`import numpy as np
from scipy.integrate import solve_ivp

mu, c = 398600.4418, 299792.458              # km³/s², km/s
a, e = 27977.0, 0.162                        # km
T = 2 * np.pi * np.sqrt(a**3 / mu)
rp = a * (1 - e)

def rhs(t, s):
    x, y, vx, vy = s
    r = np.hypot(x, y)
    return [vx, vy, -mu * x / r**3, -mu * y / r**3]

s0 = [rp, 0.0, 0.0, np.sqrt(mu * (1 + e) / rp)]
sol = solve_ivp(rhs, (0, T), s0)

amp_ns = None
`,
          answer: t`import numpy as np
from scipy.integrate import solve_ivp

mu, c = 398600.4418, 299792.458              # km³/s², km/s
a, e = 27977.0, 0.162                        # km
T = 2 * np.pi * np.sqrt(a**3 / mu)
rp = a * (1 - e)

def rhs(t, s):
    x, y, vx, vy, dtau = s
    r = np.hypot(x, y)
    return [vx, vy, -mu * x / r**3, -mu * y / r**3, -2 * mu / c**2 * (1 / r - 1 / a)]

s0 = [rp, 0.0, 0.0, np.sqrt(mu * (1 + e) / rp), 0.0]
sol = solve_ivp(rhs, (0, T), s0, rtol=1e-10, atol=[1e-9, 1e-9, 1e-12, 1e-12, 1e-18],
                t_eval=np.linspace(0, T, 2001))
offset_ns = sol.y[4] * 1e9
amp_ns = (offset_ns.max() - offset_ns.min()) / 2
print(f"amplitude {amp_ns:.3f} ns; offset after one orbit {offset_ns[-1]:.2e} ns")`,
          tests: [
            { name: t`the state now has five components`, code: 'sol.y.shape[0] == 5' },
            { name: t`the amplitude matches $\frac{2}{c^2}\sqrt{\mu a}\,e = ${A_NS.toFixed(2)}$ ns`, code: `abs(amp_ns - ${A_NS}) < 0.05` },
            { name: 'after a whole orbit the clock is back in step (within 0.05 ns)', code: 'abs(sol.y[4, -1]) < 5e-11' },
          ],
          hints: [
            t`Unpack five values in \`rhs\` and return five derivatives; the fifth is \`-2 * mu / c**2 * (1 / r - 1 / a)\` (units: km³/s² ÷ (km²/s²) ÷ km — dimensionless, seconds per second).`,
            t`Start the clock at zero: append \`0.0\` to \`s0\`. Pass \`rtol=1e-10\` and an \`atol\` list with one entry per component, the last around $10^{-18}$ s.`,
            t`Sample densely with \`t_eval=np.linspace(0, T, 2001)\`; then \`amp_ns = (sol.y[4].max() - sol.y[4].min()) / 2 * 1e9\`.`,
          ],
          teach: 'Quantities that accumulate along a trajectory can ride along as extra state components — with an atol in their own units.',
          explain: t`The integral reproduces $\frac{2}{c^2}\sqrt{\mu a}\,e = ${A_NS.toFixed(2)}$ ns to a few picoseconds. With solve_ivp's default tolerances the same code gives an amplitude near 318 ns and a clock that does not return to zero (a run in this Atlas's Python): the orbit itself is computed too loosely for a signal that is $10^{-11}$ of the orbital period.`,
        }),
      ],
    },
    {
      title: 'Converge it',
      story: t`The clock signal now appears. Before anyone believes it, the integrator must prove it converges — and that its errors over a year of data cannot fake an effect.`,
      items: [
        num({
          id: 'r2-order', skill: 'prog.P11.1', difficulty: 3,
          gen(r) {
            const p = r.pick([2, 4]), C = r.float(1.5, 4.5, 0.1), wob = r.float(0.97, 1.03, 0.005);
            const hs = [120, 60, 30];
            const es = hs.map((h, i) => (C * (h / 120) ** p * (i === 2 ? wob : 1) * (p === 2 ? 1 : 0.05)).toPrecision(3)), e = es.map(Number);
            const key = Math.log2(e[1] / e[2]);
            return {
              prompt: t`Tempo's clock offset after one orbit should return to zero; with fixed steps $h$ your integrator leaves this much (in ns):

\`\`\`python
for h, err in zip([120, 60, 30], errors):
    print(h, err)
# 120 ${es[0]}
#  60 ${es[1]}
#  30 ${es[2]}
\`\`\`

What order $p$ does the step from $h = 60$ s to $h = 30$ s show (error $\propto h^p$)? Give it to two decimals.`,
              answer: key, tol: { rel: 0, abs: 0.03 },
              errors: apart([{ value: e[1] / e[2], feedback: t`That is the ratio of the errors, $2^p$. The order is its base-2 logarithm.` }], key),
              hints: [t`Halving $h$ divides the error by $2^p$.`, t`$p = \log_2(e_{60}/e_{30})$.`],
              teach: 'The order of a method is measured, not assumed: p = log₂ of the error ratio when the step halves.',
              explain: t`$\log_2(${es[1]}/${es[2]}) = ${key.toFixed(2)}$ — ${p === 4 ? 'fourth order, as RK4 should be' : 'second order, like leapfrog — or an RK4 with a bug in a stage'}. If the errors keep falling at this rate as $h$ halves, the integration is converging; if the ratio wanders, round-off or a discontinuity has taken over.`,
              visual: {
                type: 'graph',
                params: { x: [1.3, 2.3], y: [lg(e[2]) - 0.5, lg(e[0]) + 0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (s)', ylabel: 'error after one orbit (ns)',
                  points: [120, 60, 30].map((h, i) => ({ x: lg(h), y: lg(e[i]), r: 5, color: 'gold' })) },
                caption: 'The three errors on log–log axes: the slope of the line through them is the order.',
              },
            };
          },
        }),
        num({
          id: 'r2-drift', skill: 'prog.P11.3', difficulty: 3,
          gen(r) {
            const eps = r.pick([1, 2, 3, 5]) * 1e-9;
            const da = A_ORB * N_YEAR * eps * 1000;                 // m
            return {
              prompt: t`Over one orbit the integrator changes Tempo's specific energy $E = -\mu/(2a)$ by a relative $\Delta E/E = ${tex(eps, 1)}$, the same every orbit (a secular drift). After one year — $${N_YEAR.toFixed(1)}$ orbits of ${(T_ORB / 3600).toFixed(2)} h — by how many **metres** has the simulated semi-major axis drifted?`,
              answer: da, units: 'm', tol: { rel: 0.02 },
              errors: apart([{ value: da / N_YEAR, feedback: 'That is one orbit’s drift. The error accumulates every orbit for a year.' }, { value: 1.5 * da, feedback: t`That is the relative change of the *period* ($T \propto a^{3/2}$). The semi-major axis changes by $\Delta a/a = -\Delta E/E$.` }], da),
              hints: [t`From $E = -\mu/(2a)$: $\Delta E/E = -\Delta a/a$.`, t`After $N$ orbits, $\lvert\Delta a\rvert = a\,N\,\lvert\Delta E/E\rvert$ with $a = 27\,977$ km.`],
              teach: 'A relative energy error maps onto the orbit: ΔE/E = −Δa/a for a Kepler orbit, and a secular drift grows linearly with the number of orbits.',
              explain: t`$\lvert\Delta a\rvert = 27\,977\ \text{km}\times${N_YEAR.toFixed(1)}\times${tex(eps, 1)} = ${da.toFixed(1)}$ m. The clock amplitude scales as $\sqrt a$, so it moves by only $\tfrac12\Delta a/a \approx ${tex(0.5 * N_YEAR * eps, 1)}$ of itself — far below anything measurable. The along-track position is another matter: a period error that grows every orbit puts the simulated satellite kilometres away from the real one, which is why orbit determination refits real tracking data instead of trusting a year-long integration.`,
              visual: {
                type: 'graph',
                params: { x: [0, 820], y: [0, 1.1 * da], aspect: 'wide', axesAt: 'edge', xlabel: 'orbits', ylabel: '|Δa|', yticks: 0,
                  curves: [{ fn: `${da / N_YEAR}*x`, color: 'warn', domain: [0, 820] }], vlines: [{ x: N_YEAR, label: 'one year', color: 'ink3' }] },
                caption: 'A secular drift: the same small error every orbit, growing in a straight line (vertical scale left unlabelled: it is the question).',
              },
            };
          },
        }),
      ],
    },
    {
      title: 'Prove it',
      story: t`A referee will ask how you know the simulation has no hidden friction, and whether every file uses the same physics. Answer both with code.`,
      items: [
        code({
          id: 'r3-reversal', skill: 'prog.P15.1', difficulty: 3,
          prompt: t`Gravity alone is **time-reversible**: run an orbit forward for a time $T$, reverse the velocity, run forward another $T$, and the satellite must arrive back where it started, moving the opposite way. Write \`test_time_reversal()\` that asserts this (position within 1 m, velocity within 1 mm/s). The checker then slips a tiny drag term into \`rhs\` — which no energy-free orbit should have — to see whether your test notices.`,
          starter: t`import numpy as np
from numpy.testing import assert_allclose
from scipy.integrate import solve_ivp

mu = 398600.4418                             # km³/s²
a, e = 27977.0, 0.162                        # km
T = 2 * np.pi * np.sqrt(a**3 / mu)
rp = a * (1 - e)
s0 = np.array([rp, 0.0, 0.0, np.sqrt(mu * (1 + e) / rp)])    # km, km/s

def rhs(t, s):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return [vx, vy, -mu * x / r3, -mu * y / r3]

def integrate(s, duration):
    """The state after integrating rhs for \`duration\` seconds from state s."""
    sol = solve_ivp(lambda t, s: rhs(t, s), (0, duration), s, rtol=1e-11, atol=1e-11)
    return sol.y[:, -1]

def test_time_reversal():
    pass

# --- the checker uses this: leave it as it is ---
def catches(test, broken_rhs):
    """True if test() fails when rhs is swapped for broken_rhs."""
    global rhs
    good = rhs
    rhs = broken_rhs
    try:
        test()
        return False
    except AssertionError:
        return True
    finally:
        rhs = good

def with_drag(t, s, k=1e-7):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return [vx, vy, -mu * x / r3 - k * vx, -mu * y / r3 - k * vy]
`,
          answer: t`import numpy as np
from numpy.testing import assert_allclose
from scipy.integrate import solve_ivp

mu = 398600.4418                             # km³/s²
a, e = 27977.0, 0.162                        # km
T = 2 * np.pi * np.sqrt(a**3 / mu)
rp = a * (1 - e)
s0 = np.array([rp, 0.0, 0.0, np.sqrt(mu * (1 + e) / rp)])    # km, km/s

def rhs(t, s):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return [vx, vy, -mu * x / r3, -mu * y / r3]

def integrate(s, duration):
    """The state after integrating rhs for \`duration\` seconds from state s."""
    sol = solve_ivp(lambda t, s: rhs(t, s), (0, duration), s, rtol=1e-11, atol=1e-11)
    return sol.y[:, -1]

def test_time_reversal():
    s1 = integrate(s0, T)
    s1[2:] *= -1                              # reverse the velocity
    s2 = integrate(s1, T)
    assert_allclose(s2[:2], s0[:2], rtol=0, atol=1e-3)       # back home, within 1 m
    assert_allclose(-s2[2:], s0[2:], rtol=0, atol=1e-6)      # moving the opposite way

# --- the checker uses this: leave it as it is ---
def catches(test, broken_rhs):
    """True if test() fails when rhs is swapped for broken_rhs."""
    global rhs
    good = rhs
    rhs = broken_rhs
    try:
        test()
        return False
    except AssertionError:
        return True
    finally:
        rhs = good

def with_drag(t, s, k=1e-7):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return [vx, vy, -mu * x / r3 - k * vx, -mu * y / r3 - k * vy]`,
          tests: [
            { name: 'the test passes on the true gravity', code: 'test_time_reversal() is None' },
            { name: t`it catches a drag of $10^{-7}\ \text{s}^{-1}$`, code: 'catches(test_time_reversal, with_drag)' },
            { name: t`it catches a push along the velocity, the same size`, code: 'catches(test_time_reversal, lambda t, s: with_drag(t, s, k=-1e-7))' },
          ],
          hints: [
            t`\`s1 = integrate(s0, T)\`, then flip the velocity: \`s1[2:] *= -1\`.`,
            t`\`s2 = integrate(s1, T)\` should equal \`s0\` with its velocity reversed.`,
            t`\`assert_allclose(s2[:2], s0[:2], rtol=0, atol=1e-3)\` (km) and \`assert_allclose(-s2[2:], s0[2:], rtol=0, atol=1e-6)\` (km/s).`,
          ],
          teach: 'A symmetry of the physics is a test that needs no reference solution: conservative dynamics must retrace its path when the velocities are reversed.',
          explain: t`The true orbit returns to within micrometres. A drag of $10^{-7}\ \text{s}^{-1}$ — a velocity loss of under 1% per orbit — leaves the reversed run tens of kilometres off. Note what this test cannot see: a wrong *sign* of gravity, or a wrong $\mu$, are reversible too. Hence several kinds of test.`,
        }),
        num({
          id: 'r3-c', skill: 'prog.P15.2', difficulty: 2,
          gen(r) {
            const [shown, cval, nd] = r.pick([['3e8', 3e8, 1], ['2.998e8', 2.998e8, 4], ['2.9979e8', 2.9979e8, 5]]), cT = tex(cval, nd);
            const ps = A_NS * 1000 * Math.abs(1 - (299792458 / cval) ** 2);
            return {
              prompt: t`The orbit code and the clock analysis each define the speed of light:

\`\`\`python
# orbit.py
c = 299792458.0          # m/s

# clock_analysis.py
c = ${shown}               # m/s
\`\`\`

The predicted amplitude is proportional to $1/c^2$. If the analysis uses its own value, by how many **picoseconds** does its prediction of the ${A_NS.toFixed(1)} ns amplitude differ from the orbit code's?`,
              answer: ps, units: 'ps', tol: { rel: 0.02 },
              errors: apart([{ value: ps / 2, feedback: t`The amplitude goes as $1/c^2$: a relative error $\delta$ in $c$ gives about $2\delta$.` }], ps),
              hints: [t`The ratio of the two predictions is $(c_\text{true}/c_\text{rounded})^2$.`, t`Difference $= ${A_NS.toFixed(2)}\ \text{ns}\times\lvert 1 - (2.99792458\times10^{8}/${cT})^2\rvert$, then ×1000 for ps.`],
              teach: 'A constant defined in two places will disagree; import it from one source (scipy.constants.c) so every part of a project uses the same physics.',
              explain: t`$\lvert 1 - (2.99792458\times10^{8}/${cT})^2\rvert = ${tex(Math.abs(1 - (299792458 / cval) ** 2), 3)}$, so the predictions differ by ${ps.toFixed(1)} ps. Whether that matters depends on the precision you claim — here ${ps > 100 ? 'it is comparable to the measurement’s uncertainty, and would bias the result' : 'it is far below the measurement’s uncertainty, but it is a silent difference between two parts of one project'}. Use \`from scipy.constants import c\` in both.`,
            };
          },
        }),
      ],
    },
    {
      title: 'The signal',
      story: t`A month of clock data is in, as offsets against a ground reference (synthetic, for this boss). Measure the amplitude, honestly, and make sure the signal sits where the orbit says it should.`,
      items: [
        code({
          id: 'r4-fit', skill: 'prog.P14.1', difficulty: 3,
          prompt: t`The clock residuals \`y\` (ns), each with $\sigma = 3$ ns, are tabulated against the eccentric anomaly \`E\` at the moment of measurement. Fit $y = -A\sin E + b$ ($b$ is the clock's constant offset), with honest uncertainties, and set \`A\`, \`dA\` and \`chi2_red\`.`,
          starter: t`import numpy as np
from scipy.optimize import curve_fit

E = np.array([${FIT.E.join(', ')}])     # rad
y = np.array([${FIT.y.join(', ')}])     # ns
sigma = 3.0                                                  # ns

A = None
dA = None
chi2_red = None
`,
          answer: t`import numpy as np
from scipy.optimize import curve_fit

E = np.array([${FIT.E.join(', ')}])     # rad
y = np.array([${FIT.y.join(', ')}])     # ns
sigma = 3.0                                                  # ns

def offset(E, A, b):
    return -A * np.sin(E) + b

popt, pcov = curve_fit(offset, E, y, p0=[380, 0], sigma=np.full(E.size, sigma), absolute_sigma=True)
A, dA = popt[0], np.sqrt(pcov[0, 0])
chi2_red = np.sum(((y - offset(E, *popt)) / sigma)**2) / (E.size - 2)
print(f"A = {A:.2f} ± {dA:.2f} ns, chi²/dof = {chi2_red:.2f}")`,
          tests: [
            { name: t`$A \approx ${FIT.p[0].toFixed(2)}$ ns`, code: `abs(A - ${FIT.p[0]}) < 0.01` },
            { name: t`its uncertainty comes from the stated $\sigma$: ${FIT.err[0].toFixed(3)} ns`, code: `abs(dA - ${FIT.err[0]}) < 0.01 * ${FIT.err[0]}` },
            { name: t`$\chi^2/\nu$ with $\nu = N - 2$`, code: `abs(chi2_red - ${FIT.red}) < 0.005` },
          ],
          hints: [
            t`Model: \`def offset(E, A, b): return -A * np.sin(E) + b\`.`,
            t`\`curve_fit(offset, E, y, p0=[380, 0], sigma=np.full(E.size, sigma), absolute_sigma=True)\`.`,
            t`\`dA = np.sqrt(pcov[0, 0])\`; \`chi2_red\` is the sum of squared residuals over $\sigma^2$, divided by $36 - 2$.`,
          ],
          teach: 'Known measurement noise goes in as sigma with absolute_sigma=True; χ²/ν then checks both the model and the noise.',
          explain: t`$A = ${FIT.p[0].toFixed(2)} \pm ${FIT.err[0].toFixed(2)}$ ns with $\chi^2/\nu = ${FIT.red.toFixed(2)}$ for 34 degrees of freedom (a chance probability of ${(100 * chi2sf(FIT.chi2, 34)).toFixed(0)}% of one this large: unremarkable). The prediction is ${A_NS.toFixed(2)} ns — ${(Math.abs(FIT.p[0] - A_NS) / FIT.err[0]).toFixed(1)} standard deviations away.`,
        }),
        num({
          id: 'r4-alpha', skill: 'prog.P14.1', difficulty: 3,
          gen(r) {
            const s = r.pick([0.6, 0.8, 1.1, 1.5]), z = r.pick([-2.2, -1.4, -0.6, 0.5, 1.2, 1.9]);
            const Af = +(A_NS + z * s).toFixed(2), alpha = (Af / A_NS - 1) * 1e3, da = (s / A_NS) * 1e3;
            return {
              prompt: t`A violation of general relativity is often written as a factor on the prediction: $A_\text{measured} = (1 + \alpha)\,A_\text{GR}$, with $\alpha = 0$ if relativity is right. A fit gives $A = ${Af} \pm ${s}$ ns against $A_\text{GR} = ${A_NS.toFixed(2)}$ ns. What is $\alpha$, **in units of $10^{-3}$**?`,
              answer: alpha, tol: { rel: 0.02, abs: 0.02 },
              errors: apart([{ value: Af - A_NS, feedback: t`That is the difference in ns. $\alpha$ is relative: divide by $A_\text{GR}$.` }, { value: (Af - A_NS) / s, feedback: 'That is the number of standard deviations, z. α is the fractional difference.' }], alpha),
              hints: [t`$\alpha = A/A_\text{GR} - 1$.`, 'Multiply by 1000 to express it in units of 10⁻³.'],
              teach: t`Report a test of a theory as a bound on a parametrized deviation, $\alpha \pm \sigma_\alpha$, not as a yes or no.`,
              explain: t`$\alpha = ${Af}/${A_NS.toFixed(2)} - 1 = (${alpha.toFixed(2)} \pm ${da.toFixed(2)})\times10^{-3}$, where $\sigma_\alpha = \sigma_A/A_\text{GR}$. That is ${Math.abs(z).toFixed(1)} standard deviations from zero: ${Math.abs(z) < 2 ? 'consistent with general relativity' : 'a mild tension, about what one experiment in twenty shows by chance — worth checking the systematics before claiming anything'}.`,
              visual: {
                type: 'graph',
                params: { x: [A_NS - 5, A_NS + 5], y: [0, 2], aspect: 'wide', axesAt: 'edge', xlabel: 'amplitude A (ns)', ylabel: '', yticks: 0,
                  curves: [{ param: [`${Af} + ${s}*(2*t - 1)`, '1'], t: [0, 1], color: 'gold', width: 2.5 }],
                  points: [{ x: Af, y: 1, r: 5, color: 'gold', label: 'measured ±1σ', labelDy: -12 }],
                  vlines: [{ x: +A_NS.toFixed(3), label: 'GR', color: 'accent' }] },
                caption: 'The measurement with its one-standard-deviation bar, against the prediction.',
              },
            };
          },
        }),
        num({
          id: 'r4-fft', skill: 'prog.P12.1', difficulty: 3,
          gen(r) {
            const days = r.pick([10, 15, 20, 30]), dt = r.pick([60, 300, 900]);
            const N = (days * 86400) / dt, k = (days * 86400) / T_ORB, key = Math.round(k);
            return {
              prompt: t`The clock offsets are sampled every ${dt} s for ${days} days. In their spectrum, which **bin index** is nearest the orbital frequency, $1/T$ with $T = ${T_ORB.toFixed(0)}$ s?

\`\`\`python
spec = np.abs(np.fft.rfft(offsets))          # ${N} samples
freq = np.fft.rfftfreq(${N}, d=${dt})          # Hz; bin k is at k / (${N} × ${dt} s)
\`\`\``,
              answer: key, tol: { rel: 0, abs: 0.5 },
              errors: apart([{ value: Math.floor(k) === key ? Math.ceil(k) : Math.floor(k), feedback: t`The line falls between bins, at $k = ${k.toFixed(2)}$; round to the nearer one.` }], key, 0.001),
              hints: [t`Bin $k$ sits at frequency $k/(N\Delta t)$, so the line is at $k = N\Delta t / T$.`, t`$N\Delta t = ${days}$ days $= ${days * 86400}$ s.`],
              teach: 'The rfft bin spacing is one over the record length; a signal of period T falls at bin (record length)/T — usually between two bins.',
              explain: t`$k = ${days * 86400}/${T_ORB.toFixed(0)} = ${k.toFixed(2)}$, so bin ${key}. The record holds ${k.toFixed(2)} orbits — not a whole number — so the line leaks into neighbouring bins (a window helps). Fitting $A\sin E$ directly, as in the last problem, uses the orbit's known phase and is more precise than reading a bin.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Defend the accuracy',
      story: t`The result goes to review. Three last questions: how well is the prediction itself known, can you read your own orbit's portrait, and what exactly may you claim?`,
      items: [
        num({
          id: 'r5-mc', skill: 'prog.P13.2', difficulty: 3,
          gen(r) {
            const se = r.pick([2, 3, 4, 6]) * 1e-4, sa = r.pick([10, 20, 40]);
            const rel = Math.hypot(se / ECC, sa / (2 * A_ORB)), key = A_NS * rel;
            return {
              prompt: t`The predicted amplitude $A_\text{GR} = \frac{2}{c^2}\sqrt{\mu a}\,e$ uses an orbit known to $\sigma_e = ${tex(se, 1)}$ and $\sigma_a = ${sa}$ km (independent). What spread does this Monte Carlo print, in ns?

\`\`\`python
rng = np.random.default_rng(1)
e_s = rng.normal(0.162, ${se}, 100_000)
a_s = rng.normal(27977, ${sa}, 100_000)                  # km
A_s = 2 * np.sqrt(mu * a_s) * e_s / c**2 * 1e9          # ns
print(A_s.std())
\`\`\``,
              answer: key, units: 'ns', tol: { rel: 0.03 },
              errors: apart([
                { value: A_NS * (se / ECC + sa / (2 * A_ORB)), feedback: 'Independent errors add in quadrature, not linearly.' },
                { value: A_NS * Math.hypot(se / ECC, sa / A_ORB), feedback: t`$A \propto \sqrt a$: a relative error in $a$ contributes half of itself.` },
              ], key, 0.02),
              hints: [t`For $A \propto e\,a^{1/2}$: $(\sigma_A/A)^2 = (\sigma_e/e)^2 + (\tfrac12\sigma_a/a)^2$.`, t`Then $\sigma_A = ${A_NS.toFixed(1)}\ \text{ns}\times\sigma_A/A$. The Monte Carlo agrees because the errors are small.`],
              teach: 'For small independent errors, Monte Carlo and linear propagation agree: relative errors add in quadrature, each weighted by its power in the formula.',
              explain: t`$\sigma_A/A = \sqrt{(${tex(se, 1)}/0.162)^2 + (${sa}/(2\times27\,977))^2} = ${tex(rel, 3)}$, so $\sigma_A \approx ${key.toFixed(2)}$ ns. ${key > FIT.err[0] ? 'That is larger than the fit’s own uncertainty: here the orbit, not the clock, limits the test.' : 'That is smaller than the fit’s own uncertainty, so the clock noise still limits the test.'} Real analyses know the orbit from laser ranging to centimetres, which is why the eccentric Galileo satellites could test relativity at all.`,
            };
          },
        }),
        mcq({
          id: 'r5-portrait', skill: 'prog.P16.1', difficulty: 2,
          prompt: t`Tempo's radial phase portrait: distance from Earth's centre against its rate of change, traced clockwise once per orbit. The clock's rate, relative to its average, is $-\frac{2\mu}{c^2}\left(\frac1r - \frac1a\right)$. At which labelled state does the clock tick **slowest**?`,
          visual: {
            type: 'graph',
            params: { x: [22, 34], y: [-0.85, 0.85], aspect: 'wide', axesAt: 'edge', xlabel: 'r (1000 km)', ylabel: 'dr/dt (km/s)',
              curves: [loop], hlines: [{ y: 0, color: 'ink4' }],
              points: [
                { x: +((A_ORB * (1 - ECC)) / 1000).toFixed(3), y: 0, r: 5, color: 'gold', label: 'P', labelDx: -16, labelDy: -6 },
                { x: E90, y: +V90.toFixed(4), r: 5, color: 'gold', label: 'Q', labelDy: -10 },
                { x: +((A_ORB * (1 + ECC)) / 1000).toFixed(3), y: 0, r: 5, color: 'gold', label: 'R', labelDx: 8, labelDy: -6 },
                { x: E90, y: -(+V90.toFixed(4)), r: 5, color: 'gold', label: 'S', labelDy: 18 },
              ] },
            caption: 'The orbit’s r and dr/dt over one period (exact Kepler motion). Only the radial part of the motion is shown.',
          },
          choices: ['P', 'Q', 'R', 'S'],
          fixedOrder: true,
          answer: 0,
          why: {
            1: 'Q is where r grows fastest — the radial speed, not the depth in the potential. The clock’s rate depends on r.',
            2: 'R is apogee, the farthest point: the clock runs fastest there, high in Earth’s potential.',
            3: 'S is where r shrinks fastest on the way in; its r equals Q’s, so its clock rate is the same as at Q.',
          },
          hints: ['The rate is most negative where 1/r is largest.', 'Which point has the smallest r?'],
          teach: 'Read a phase portrait by its coordinates: the extremes of r sit where the loop crosses dr/dt = 0, on the left and right.',
          explain: t`P is perigee — smallest $r$, deepest in the potential and fastest along the orbit — so the clock's rate is lowest there and highest at apogee R. The *accumulated* offset, $-A\sin E$, is most negative a quarter of an orbit later, at Q: a rate and its integral peak at different places.`,
        }),
        mcq({
          id: 'r5-claim', skill: 'prog.P14.1', difficulty: 3,
          prompt: t`The final analysis prints:

\`\`\`
A = ${FIT.p[0].toFixed(2)} ± ${FIT.err[0].toFixed(2)} ns    (GR: ${A_NS.toFixed(2)} ns)
alpha = (${(ALPHA * 1e3).toFixed(1)} ± ${(DALPHA * 1e3).toFixed(1)}) × 10⁻³
chi²/dof = ${FIT.red.toFixed(2)} for 34 degrees of freedom
\`\`\`

Which sentence belongs in the report?`,
          choices: [
            t`The periodic clock offset agrees with general relativity: $\alpha = (${(ALPHA * 1e3).toFixed(1)} \pm ${(DALPHA * 1e3).toFixed(1)})\times10^{-3}$, consistent with zero, so any violation is below a few parts in a thousand — for this model and these (synthetic) data`,
            'These data prove general relativity correct',
            'The test failed, because α is not exactly zero',
            'General relativity is confirmed to 10⁻¹⁰, the size of the clock-rate changes',
          ],
          answer: 0,
          why: {
            1: 'A measurement bounds a deviation; it cannot prove a theory. A better experiment could still find α ≠ 0 below this precision.',
            2: 'With an uncertainty of about 2×10⁻³, a value of −2×10⁻³ is about one standard deviation from zero: expected about a third of the time if α = 0.',
            3: 'The size of an effect is not the precision of a test. The rate changes are 10⁻¹⁰ of the clock rate; the test checks their size to about 10⁻³ of itself.',
          },
          hints: ['How many standard deviations is α from zero?', 'What does an uncertainty let you claim — and not claim?'],
          teach: 'State a result as a value with an uncertainty, compare it in standard deviations, and name what it rests on: the model, the data and their errors.',
          explain: t`$\alpha$ is ${(Math.abs(ALPHA) / DALPHA).toFixed(1)} standard deviations from zero, and $\chi^2/\nu = ${FIT.red.toFixed(2)}$ (probability ${(100 * chi2sf(FIT.chi2, 34)).toFixed(0)}%) says the model fits. The honest claim is a bound, with its conditions. The real 2018 analyses of the Galileo satellites, with years of data and centimetre orbits, bounded $\alpha$ at a few parts in $10^{5}$.`,
        }),
      ],
    },
  ],
});
