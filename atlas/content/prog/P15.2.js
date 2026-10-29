// Organizing a project — split a simulation by what changes together:
// parameters in one place with units, physics as pure functions, numerical
// methods that know nothing of the physics, analysis and plotting that read
// results and never change them, and a driver that takes everything as
// arguments. Copy-paste and magic numbers as bug factories, the global that
// changes under a function, a dataclass for a small record, recording what
// a result came from (commit, versions, seed), git, and the package layout
// a project grows into on a real machine (this browser shows no files).
//
// The Explore's printed apogees and the entry example's peak decelerations
// were copied from running the code in this Atlas's Pyodide.
import { lesson, mcq, num, match, code } from '../../src/core/content.js';

const t = String.raw;

// ── the refactoring exercise: q = ½ρv² with an isothermal atmosphere ──
const qOf = (h, v) => 0.5 * 1.225 * Math.exp(-h / 8500) * v * v;
const QPTS = [[11000, 420], [12500, 480], [10500, 395]];
// ── the checkpoint's transfer orbit ──
const MU = 398600.4418, RP = 6378 + 250, RA = 6378 + 35786, A = (RP + RA) / 2;
const T_GTO = 2 * Math.PI * Math.sqrt(A ** 3 / MU), E_GTO = (RA - RP) / (RA + RP);
// ── Allen–Eggers peak deceleration for the example (v = 7500 m/s, γ = 10°, H = 7200 m) ──
const AE = (7500 ** 2 * Math.sin((10 * Math.PI) / 180)) / (2 * Math.E * 7200) / 9.80665;

export default lesson({
  id: 'prog.P15.2',
  title: 'Organizing a project',
  minutes: 12, difficulty: 2,
  intro: t`A forty-line script becomes a four-hundred-line project faster than anyone plans. What keeps it workable is one rule: **separate the things that change for different reasons.** The physics changes when the model improves; the numerical method when you need more accuracy; the plots when a reader asks; the parameters every run. On your own computer a simulation usually ends up laid out like this:

\`\`\`
rocketsim/
├── README.md              what it is, how to run it, what it assumes
├── requirements.txt       numpy==2.4.*  scipy==1.18.*  (pinned versions)
├── src/rocketsim/
│   ├── physics.py         pure functions of the state: no printing, no plotting
│   ├── integrate.py       numerical methods that take any function
│   └── plots.py           read results, never change them
├── scripts/run_flight.py  the driver: parameters in, results out
└── tests/test_physics.py  the tests of the last lesson
\`\`\`

and the whole folder lives under version control (git). This browser shows no files, so here the same layers live in one program, in that order.`,
  symbols: [
    { tex: t`\texttt{physics}`, text: 'the model: functions that take the state and the parameters as arguments and **return** derivatives or forces' },
    { tex: t`\texttt{integrate}`, text: 'the numerical method: takes the physics as a function argument and knows nothing about rockets' },
    { tex: t`\texttt{plots}`, text: 'output: reads arrays, draws or prints them, and changes nothing' },
    { tex: t`\texttt{main()}`, text: 'the driver: the only place that names this run’s parameters, passed down as arguments' },
    { tex: t`\texttt{tests}`, text: 'checks of each layer on its own: possible only because the layers are separate' },
  ],
  why: 'The code you write for a thesis or a mission outlives your memory of it; a structure that lets you change the integrator without touching the physics is what makes it trustworthy a year later.',
  visual: {
    type: 'code-runner',
    title: 'A sounding rocket in five layers',
    lead: t`Press **Run**. A small solid-fuel sounding rocket climbs vertically against gravity and drag. Read the program top to bottom: parameters, physics, numerics, analysis and output, driver. Then use the structure — each task changes **one** place.`,
    tasks: [
      'Below main(), add main(dt=0.5) and main(dt=0.01): the convergence check is one argument. The apogee moves from 12.565 km to 12.426 km, and 0.001 s changes it by a metre.',
      'Add main(rocket=dict(ROCKET, thrust=2000.0)): a variant without copying anything. More thrust gives a lower apogee (12.12 km): the same propellant burns faster, deep in thick air, and drag takes more.',
      'Change the scale height in air_density from 8500 to 7000 m. Only that function changes; the apogee rises to 13.38 km.',
    ],
    params: {
      rows: 24,
      code: t`import numpy as np
import matplotlib.pyplot as plt

# ── parameters: one place, with units ─────────────────────────────
G0 = 9.80665                                    # m/s²
ROCKET = dict(m0=40.0, m_dry=25.0, thrust=1500.0, isp=200.0, CdA=0.008)
#              kg       kg           N             s          m²

# ── physics: pure functions of the state; no printing, no plotting ──
def air_density(h):
    """Isothermal atmosphere, kg/m³."""
    return 1.225 * np.exp(-h / 8500.0)

def derivatives(t, s, rocket):
    """d/dt of the state s = [height (m), velocity (m/s), mass (kg)]."""
    h, v, m = s
    F = rocket["thrust"] if m > rocket["m_dry"] else 0.0
    drag = 0.5 * air_density(h) * rocket["CdA"] * v * abs(v)
    return np.array([v, (F - drag) / m - G0, -F / (rocket["isp"] * G0)])

# ── numerics: knows nothing about rockets ──────────────────────────
def rk4(f, s0, t_end, dt, *args):
    t = np.arange(0.0, t_end + dt / 2, dt)
    S = np.empty((t.size, s0.size))
    S[0] = s0
    for i in range(t.size - 1):
        k1 = f(t[i], S[i], *args)
        k2 = f(t[i] + dt / 2, S[i] + dt / 2 * k1, *args)
        k3 = f(t[i] + dt / 2, S[i] + dt / 2 * k2, *args)
        k4 = f(t[i] + dt, S[i] + dt * k3, *args)
        S[i + 1] = S[i] + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
    return t, S

# ── analysis and output: read results, never change them ──────────
def apogee(t, S):
    i = np.argmax(S[:, 0])
    return t[i], S[i, 0]

def plot_flight(t, S, ax, label):
    ax.plot(t, S[:, 0] / 1e3, label=label)

# ── the driver: the only part that changes from run to run ────────
def main(rocket=ROCKET, dt=0.05, t_end=110.0):
    t, S = rk4(derivatives, np.array([0.0, 0.0, rocket["m0"]]), t_end, dt, rocket)
    t_top, h_top = apogee(t, S)
    print(f"dt = {dt} s: apogee {h_top / 1e3:.3f} km at t = {t_top:.1f} s")
    return t, S

fig, ax = plt.subplots()
t, S = main()
plot_flight(t, S, ax, "dt = 0.05 s")
ax.set_xlabel("time (s)")
ax.set_ylabel("height (km)")
ax.legend()
plt.show()`,
    },
    caption: 'One dimension, an isothermal atmosphere, constant drag coefficient and thrust: a teaching model. The thrust switches off inside a time step, which lowers RK4’s accuracy near burnout — the convergence check in the first task is how you would notice.',
  },
  example: {
    prompt: t`A colleague's script finds the peak deceleration of a capsule entering the atmosphere for three ballistic coefficients $\beta = m/(C_DA)$. It works, and it is a trap. Reorganize it.

\`\`\`python
import numpy as np
h = 120000; v = 7500; amax = 0
while h > 0 and v > 100:
    a = 1.225*np.exp(-h/7200)*v**2/(2*100)
    if a > amax: amax = a
    v = v - a*0.01
    h = h - v*0.1736*0.01
print("beta 100:", amax/9.81)
h = 120000; v = 7500; amax = 0
while h > 0 and v > 100:
    a = 1.225*np.exp(-h/7200)*v**2/(2*300)
    if a > amax: amax = a
    v = v - a*0.01
    h = h - v*0.1736*0.01
print("beta 300:", amax/9.81)
# … and a third copy for beta = 1000
\`\`\``,
    steps: [
      { label: 'Name the smells', text: t`**Copy-paste**: three loops that must stay identical, and one day will not. **Magic numbers**: 0.1736 is $\sin 10°$, 7200 m a scale height, 0.01 s a time step — none named, and 9.81 where the standard value is 9.80665. **Output mixed with computation**: the result exists only as printed text, so nothing else (a test, a plot) can use it.` },
      { label: 'One function', text: t`Everything that differs between the copies becomes a parameter; everything that stays the same becomes a named default. The function **returns** its result.

\`\`\`python
def peak_deceleration(beta, v0=7500.0, gamma_deg=10.0, h0=120e3,
                      H=7200.0, rho0=1.225, dt=0.01):
    """Peak deceleration (in g) of a ballistic entry: straight-line path,
    no lift, no gravity, exponential atmosphere. beta = m/(C_D A), kg/m²."""
    sin_g = np.sin(np.radians(gamma_deg))
    h, v, a_max = h0, v0, 0.0
    while h > 0 and v > 100:
        a = rho0 * np.exp(-h / H) * v**2 / (2 * beta)
        a_max = max(a_max, a)
        v -= a * dt
        h -= v * sin_g * dt
    return a_max / 9.80665
\`\`\`` },
      { label: 'A driver', text: t`The variation is now data, not code:

\`\`\`python
for beta in [100, 300, 1000]:
    print(f"beta = {beta:5d} kg/m²: peak {peak_deceleration(beta):.2f} g")
\`\`\`

It prints 25.45 g for all three. Adding a fourth capsule, or halving \`dt\` to check convergence, is now an argument.` },
      { label: 'A test it makes possible', text: t`Under exactly these assumptions Allen and Eggers found the peak deceleration in closed form, $a_{\max} = v_0^2\sin\gamma/(2eH)$ — independent of $\beta$. That is a test:

\`\`\`python
def test_allen_eggers():
    exact = 7500**2 * np.sin(np.radians(10)) / (2 * np.e * 7200) / 9.80665
    for beta in [100, 300, 1000]:
        assert_allclose(peak_deceleration(beta), exact, rtol=1e-3)
\`\`\`

The original script could not be tested at all: its answer was a printed line.` },
      { label: 'Sense check', text: t`$7500^2 \times \sin 10° / (2e \times 7200\ \text{m}) = ${(AE * 9.80665).toFixed(1)}\ \text{m/s}^2 = ${AE.toFixed(2)}\,g$, matching the simulation to a part in 4000. A heavier capsule (larger $\beta$) brakes lower down, in denser air, but just as hard. The physics is unchanged by the reorganization; what changed is that every number now has a name and every result a reader.` },
    ],
    answer: t`One function with named, defaulted parameters that returns its result; a three-line driver; and a test against the Allen–Eggers peak, ${AE.toFixed(2)} $g$ for every $\beta$.`,
  },
  practice: [
    mcq({
      id: 'pure', difficulty: 1,
      prompt: t`Which version is easier to test and to reuse, and why?

\`\`\`python
# version P
def report_period():
    T = 2 * math.pi * math.sqrt(a**3 / mu)      # a and mu are global variables
    print(f"T = {T:.1f} s")

# version Q
def period(a, mu):
    return 2 * math.pi * math.sqrt(a**3 / mu)
\`\`\``,
      choices: [
        'Q: it depends only on its arguments and returns a number, so a test can call it with any a and mu and check the result',
        'P: it prints its answer, so you can see it is right',
        'P: it has no arguments, so there is nothing to get wrong when calling it',
        'Neither: they compute the same thing, so they are equally good',
      ],
      answer: 0,
      why: {
        1: 'A human can read a printed line; a test, a plot or another function cannot use it. Return the value and print it in the driver.',
        2: 'Its inputs are hidden in global variables: to test it you must set globals first, and any code that changes them changes it.',
        3: 'They agree on today’s inputs. Only Q can be called for another orbit, tested, or used inside a larger calculation.',
      },
      hints: ['How would a test check version P’s answer?', 'Where do P’s inputs come from?'],
      teach: 'A pure function — inputs as arguments, result as a return value, no side effects — is the unit that can be tested, reused and trusted.',
      explain: t`Version Q is a *pure* function: same arguments, same result, nothing else touched. A test is one line, \`assert_allclose(period(42164, 398600.4418), 86164, rtol=1e-4)\` (one sidereal day for GEO). Version P can only be checked by reading its output.`,
    }),
    mcq({
      id: 'magic', difficulty: 2,
      prompt: t`An Earth landing script is adapted to a Mars hopper by editing the numbers where they appear. It runs, and the touchdown speed looks too high:

\`\`\`python
v_impact = np.sqrt(2 * 9.81 * h_drop)        # line 12
t_fall   = np.sqrt(2 * h_drop / 3.71)        # line 40
weight   = m * 3.71                          # line 77
\`\`\`

What went wrong, and what prevents it?`,
      choices: [
        'One 9.81 was missed: a number that means one thing should be written once, as a named parameter (g = 3.71  # Mars, m/s²) passed to every function that needs it',
        'Square roots of Mars quantities need complex numbers',
        'The lines are in the wrong order: line 12 must come after line 77',
        'Mars needs a different time step, so `t_fall` is wrong',
      ],
      answer: 0,
      why: {
        1: 'All the quantities are positive; the roots are ordinary floats.',
        2: 'These lines do not depend on one another; order is not the problem.',
        3: '`t_fall` uses 3.71 correctly. The touchdown speed comes from line 12.',
      },
      hints: ['Compare the gravitational accelerations on the three lines.', 'How many places would you have to edit to go to the Moon next?'],
      teach: 'Give every physical constant one name in one place; a number repeated in many places will one day be changed in only some of them.',
      explain: t`Line 12 still uses Earth's 9.81, so the impact speed is $\sqrt{9.81/3.71} \approx 1.6$ times too high. With \`g\` defined once (or passed as an argument) going to the Moon is one edit — and a test of the landing at a known $g$ catches the rest.`,
    }),
    match({
      id: 'where', difficulty: 2,
      prompt: t`The project is laid out as in the introduction:

\`\`\`
rocketsim/
├── requirements.txt
├── src/rocketsim/  physics.py  integrate.py  plots.py
├── scripts/run_flight.py
└── tests/test_physics.py
\`\`\`

Match each piece of code to the file it belongs in.`,
      left: [
        t`\`def derivatives(t, s, rocket):\``,
        t`\`def rk4(f, s0, t_end, dt, *args):\``,
        t`\`def plot_flight(t, S, ax, label):\``,
        t`\`def test_air_density_at_sea_level():\``,
        t`\`main(rocket=ROCKET, dt=0.01)\`, today's run`,
        t`\`numpy==2.4.*\``,
      ],
      right: ['physics.py', 'integrate.py', 'plots.py', 'tests/test_physics.py', 'scripts/run_flight.py', 'requirements.txt'],
      answer: [0, 1, 2, 3, 4, 5],
      hints: ['Ask what each piece changes with: the model, the method, the picture, the run, or the environment.', 'The integrator takes any function f; it is not physics.'],
      teach: 'Put each piece where it changes for the same reason as its neighbours: model, method, output, tests, the run, the environment.',
      explain: t`The right-hand side of the equations is the model (physics.py); RK4 works for any \`f\` (integrate.py); drawing is output (plots.py); tests live apart from the code they test; the parameters of a particular run belong to a script; and the versions the results depend on are pinned in requirements.txt, so a colleague installs the same ones.`,
    }),
    num({
      id: 'global-dt', difficulty: 3,
      gen(r) {
        const n = r.pick([500, 800, 1000, 2000]), [d1, d2] = r.pick([[0.1, 0.01], [0.05, 0.005], [0.2, 0.02]]);
        return {
          prompt: t`What does \`coarse\` hold — how many seconds of flight did the "coarse" run simulate?

\`\`\`python
dt = ${d1}                              # s

def simulate(n_steps):
    t = 0.0
    for _ in range(n_steps):
        t += dt                        # (the physics is left out)
    return t

dt = ${d2}                             # for the fine run later
coarse = simulate(${n})
\`\`\``,
          answer: n * d2, units: 's', tol: { rel: 0.001 },
          errors: [{ value: n * d1, feedback: t`\`simulate\` reads the global \`dt\` when it *runs*, not when it was defined — and by then \`dt\` is ${d2}.` }],
          hints: ['A function that uses a global variable reads its value at the moment the function runs.', t`Which value does \`dt\` have when \`simulate(${n})\` is called?`],
          teach: 'A function that reads a global depends on whatever that global holds when it is called — pass parameters as arguments instead.',
          explain: t`$${n}\times${d2} = ${+(n * d2).toFixed(6)}$ s, not the ${+(n * d1).toFixed(6)} s intended: the "coarse" run silently used the fine step, and a convergence check comparing it with the fine run would compare a run with itself. Write \`def simulate(n_steps, dt):\` and the call says which step it uses.`,
        };
      },
    }),
    code({
      id: 'refactor', difficulty: 2,
      prompt: t`This script computes the dynamic pressure $q = \tfrac12\rho v^2$ (Pa) at three points of an ascent, with $\rho = 1.225\,e^{-h/8500\ \text{m}}$ kg/m³, by copy-paste — and one copy is wrong. Replace it with a function \`dynamic_pressure(h, v)\` ($h$ in m, $v$ in m/s) and a list \`q\` of the three values computed with it.`,
      starter: t`import math

# dynamic pressure q = ½ ρ v² at three points of an ascent (Pa)
q1 = 0.5 * 1.225 * math.exp(-11000 / 8500) * 420**2
q2 = 0.5 * 1.225 * math.exp(-12500 / 8500) * 480**2
q3 = 0.5 * 1.225 * math.exp(-10500 / 8000) * 395**2
print(q1, q2, q3)
`,
      answer: t`import math

def dynamic_pressure(h, v, rho0=1.225, H=8500.0):
    """Dynamic pressure (Pa) at altitude h (m) and speed v (m/s), isothermal atmosphere."""
    return 0.5 * rho0 * math.exp(-h / H) * v**2

points = [(11000, 420), (12500, 480), (10500, 395)]       # (h in m, v in m/s)
q = [dynamic_pressure(h, v) for h, v in points]
print(q)`,
      tests: [
        { name: t`\`dynamic_pressure(0, 100)\` is 6125 Pa at sea level`, code: 'abs(dynamic_pressure(0, 100) - 6125) < 1e-6' },
        { name: t`\`dynamic_pressure(11000, 420)\` is ${Math.round(qOf(11000, 420))} Pa`, code: `abs(dynamic_pressure(11000, 420) - ${qOf(11000, 420)}) < 1e-6` },
        { name: t`\`q\` holds the three values — including a correct third one, ${Math.round(qOf(10500, 395))} Pa`, code: `len(q) == 3 and all(abs(a - b) < 1e-6 for a, b in zip(q, [${QPTS.map(([h, v]) => qOf(h, v)).join(', ')}]))` },
      ],
      hints: ['Copy one of the three lines into a function body, with h and v as the parameters.', 'Then `q = [dynamic_pressure(h, v) for h, v in [(11000, 420), (12500, 480), (10500, 395)]]`.', 'Look at the third copy’s scale height: 8000, not 8500.'],
      teach: 'Turn copies into one function and a loop over data: the bug that hid in one copy has nowhere left to hide.',
      explain: t`The third copy had a scale height of 8000 m and gave ${Math.round(0.5 * 1.225 * Math.exp(-10500 / 8000) * 395 ** 2)} Pa instead of ${Math.round(qOf(10500, 395))} Pa — a ${(100 * (1 - Math.exp(-10500 / 8000) / Math.exp(-10500 / 8500))).toFixed(0)}% error that nothing flagged. With one function every point uses the same formula, and the scale height is a parameter you can change in one place.`,
    }),
    mcq({
      id: 'reproduce', difficulty: 2,
      prompt: t`Six months ago a run printed this, and it went into a report. Today the same script gives a different number, and nobody can say why.

\`\`\`
miss distance: 1.83 km
\`\`\`

What should the program have written next to its result?`,
      choices: [
        'Everything the number depends on: the code’s version (the git commit), the library versions, the random seed and every parameter of the run',
        'Only the result, but with more decimal places',
        'The date and the name of the computer',
        'Nothing: the same script always gives the same answer',
      ],
      answer: 0,
      why: {
        1: 'More digits of an irreproducible number do not help find what changed.',
        2: 'Useful context, but they do not identify the code, the libraries or the inputs that produced the number.',
        3: 'Only if the script, its inputs, its libraries and its random numbers are all unchanged — exactly what nobody recorded.',
      },
      hints: ['List everything that could have changed between the two runs.'],
      teach: 'A result is reproducible only if it carries what produced it: code version, library versions, seed and parameters.',
      explain: t`Have the program print or save its provenance with its output: \`git rev-parse HEAD\` (the commit), \`np.__version__\` and \`scipy.__version__\`, the seed passed to \`default_rng\`, and the parameters. Then "why is it different?" becomes a diff instead of an investigation.`,
    }),
    mcq({
      id: 'git', difficulty: 2,
      prompt: t`You are about to rewrite the integrator of a working simulation. A colleague suggests committing first:

\`\`\`
$ git add -A
$ git commit -m "Working RK4 flight sim; apogee 12.43 km at dt = 0.01 s"
\`\`\`

What does that commit give you?`,
      choices: [
        'A named snapshot of every file: you can see exactly what you changed since (git diff) and return to the working version if the rewrite goes wrong',
        'A copy of the code on a server, safe if your laptop is lost',
        'An automatic run of the tests',
        'Faster code, because git compiles it',
      ],
      answer: 0,
      why: {
        1: 'Only after `git push` to a remote. A commit lives in the repository on your own disk.',
        2: 'Git records history; running tests on each commit needs a separate service (continuous integration).',
        3: 'Git never touches what the code does; it only records versions of it.',
      },
      hints: ['Git is version control: what does it keep?'],
      teach: 'Commit before every risky change: a commit is a snapshot you can compare with and return to.',
      explain: t`After the rewrite, \`git diff\` shows every line you changed and \`git checkout\` of the old commit brings back the working version. A message that records a result (the apogee) also lets you check later that the new integrator reproduces it.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-orbit', difficulty: 2, transfer: true,
      prompt: t`Group an orbit's numbers into one object. Complete the dataclass \`Orbit\` (perigee radius \`rp\` and apogee radius \`ra\` in km, \`mu\` defaulting to Earth's 398600.4418 km³/s²) with three methods: \`semi_major_axis()\` $= (r_p + r_a)/2$, \`eccentricity()\` $= (r_a - r_p)/(r_a + r_p)$, and \`period()\` $= 2\pi\sqrt{a^3/\mu}$ in seconds. Then set \`gto\` to a geostationary transfer orbit: perigee 250 km and apogee 35 786 km above an Earth of radius 6378 km.`,
      starter: t`import math
from dataclasses import dataclass

@dataclass
class Orbit:
    rp: float                    # perigee radius, km
    ra: float                    # apogee radius, km
    mu: float = 398600.4418      # km³/s²

    def semi_major_axis(self):
        pass

gto = None
`,
      answer: t`import math
from dataclasses import dataclass

@dataclass
class Orbit:
    rp: float                    # perigee radius, km
    ra: float                    # apogee radius, km
    mu: float = 398600.4418      # km³/s²

    def semi_major_axis(self):
        return (self.rp + self.ra) / 2

    def eccentricity(self):
        return (self.ra - self.rp) / (self.ra + self.rp)

    def period(self):
        return 2 * math.pi * math.sqrt(self.semi_major_axis()**3 / self.mu)

gto = Orbit(6378 + 250, 6378 + 35786)
print(gto, gto.period() / 3600, "h")`,
      tests: [
        { name: t`\`gto\` has $r_p = ${RP}$ km and $r_a = ${RA}$ km`, code: `abs(gto.rp - ${RP}) < 1e-9 and abs(gto.ra - ${RA}) < 1e-9` },
        { name: t`its eccentricity is ${E_GTO.toFixed(4)}`, code: `abs(gto.eccentricity() - ${E_GTO}) < 1e-9` },
        { name: t`its period is ${(T_GTO / 3600).toFixed(2)} h`, code: `abs(gto.period() - ${T_GTO}) < 1e-3` },
        { name: 'the same class works for Mars: Phobos’s orbit, near-circular at 9376 km, takes 7.66 h', code: 'abs(Orbit(9376, 9376, mu=42828.37).period() / 3600 - 7.6566) < 0.001' },
      ],
      hints: ['Inside a method, the object’s fields are `self.rp`, `self.ra` and `self.mu`.', 'One method can call another: `self.semi_major_axis()`.', t`\`gto = Orbit(6378 + 250, 6378 + 35786)\` — radii, not altitudes.`],
      teach: 'A dataclass bundles the numbers that belong together, and its methods compute what follows from them — one object to pass around instead of loose variables.',
      explain: t`$a = ${A}$ km, $e = ${E_GTO.toFixed(4)}$, $T = ${T_GTO.toFixed(0)}$ s $= ${(T_GTO / 3600).toFixed(2)}$ h. The \`mu\` default makes Earth the common case and Mars one keyword away. The fields are radii: passing altitudes (250 and 35 786) would give an "orbit" dipping to 250 km from the centre of the Earth, deep inside the planet — a check worth adding as a test.`,
    }),
    mcq({
      id: 'cp-main', difficulty: 2,
      prompt: t`On your own computer, \`run_flight.py\` ends like this. What do the last two lines do?

\`\`\`python
def main(dt=0.01):
    ...

if __name__ == "__main__":
    main()
\`\`\``,
      choices: [
        'They run main() when the file is run as a script (python run_flight.py), but not when another file — a test, a notebook — imports it to use its functions',
        'They run main() twice, once for each underscore pair',
        'They are required: Python will not run a file without them',
        'They make main() run faster by compiling it',
      ],
      answer: 0,
      why: {
        1: 'They call it at most once, and only under the condition.',
        2: 'Python runs any file top to bottom without them; the guard only stops code from running on import.',
        3: 'They change when code runs, not how fast.',
      },
      hints: ['When a file is run directly, Python sets its __name__ to "__main__"; when it is imported, __name__ is the module’s name.'],
      teach: 'The __main__ guard lets one file be both a script and an importable module: tests can import its functions without starting a run.',
      explain: t`Run directly, the module's \`__name__\` is \`"__main__"\` and \`main()\` runs. Imported by \`tests/test_physics.py\`, its \`__name__\` is \`"run_flight"\`, so only the definitions load and the tests do not start a simulation. (The Atlas runs your program as \`__main__\` too, so a guarded \`main()\` runs here just as it would from a terminal.)`,
    }),
    mcq({
      id: 'cp-plot-mutates', difficulty: 3, transfer: true,
      prompt: t`A CubeSat attitude simulation passes its pointing check — except when the figure is drawn first, and then the check reports errors 57 times too large. Why?

\`\`\`python
def plot_attitude(t, S, ax):
    S[:, 0] *= 180 / np.pi                # radians → degrees, for the axis
    ax.plot(t, S[:, 0])

t, S = simulate(controller, t_end=600)
plot_attitude(t, S, ax)
worst = check_pointing(S)                 # expects radians
\`\`\``,
      choices: [
        'The plotting function converted the shared array in place, so the simulation’s results are now in degrees; output code must not change data — plot np.degrees(S[:, 0]) instead',
        'Matplotlib rescales any array it plots',
        'check_pointing has a units bug that only shows after plotting',
        'The simulation is random, so its result differs from run to run',
      ],
      answer: 0,
      why: {
        1: 'Matplotlib never changes your data; this function does, on its first line.',
        2: 'It works on radians, as documented; it was handed degrees. 57 is 180/π.',
        3: 'Nothing here is random, and the error appears only when the plot is drawn: an ordering effect, not chance.',
      },
      hints: ['What is 180/π?', '`S[:, 0] *= …` writes into the array; which other code holds that same array?'],
      teach: 'Output code reads results and never changes them: an in-place change inside a plotting function silently corrupts everything that runs after it.',
      explain: t`\`S[:, 0] *= 180/np.pi\` modifies the very array \`simulate\` returned (\`S\` inside the function is the same object), so every later use sees degrees — a factor of $180/\pi \approx 57.3$. Compute a new array for display, \`ax.plot(t, np.degrees(S[:, 0]))\`, and keep the layers' contract: physics produces, output reads.`,
    }),
  ],
  sources: [
    { label: 'Wilson et al. (2017), Good enough practices in scientific computing, PLoS Comput. Biol. 13, e1005510', url: 'https://doi.org/10.1371/journal.pcbi.1005510' },
    { label: 'Python Packaging User Guide: packaging projects (the src layout)', url: 'https://packaging.python.org/en/latest/tutorials/packaging-projects/' },
    { label: 'Python documentation: dataclasses', url: 'https://docs.python.org/3/library/dataclasses.html' },
    { label: 'Allen & Eggers (1958), A study of the motion and aerodynamic heating of ballistic missiles entering the Earth’s atmosphere, NACA Report 1381', url: 'https://ntrs.nasa.gov/search?q=NACA%20Report%201381' },
  ],
});
