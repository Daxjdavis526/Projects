// Testing your code — plain test functions that assert, numpy.testing's
// assert_allclose and its tolerance, the kinds of test a physics code needs
// (known values, limits, symmetries, conservation, convergence order,
// expected errors, regression), tests that check they can fail (swap in a
// broken function), tolerances for stochastic output, and what pytest adds on
// a real machine (there is no pytest in this browser; the lessons run tests
// with a ten-line loop instead).
//
// The failure messages quoted were produced by running the code in this
// Atlas's Pyodide (NumPy 2.4).
import { lesson, mcq, num, match, order, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';

const t = String.raw;

// ── the worked example's atmosphere: ISA troposphere ──
const isa = (h, R = 287.053) => { const T = 288.15 - 0.0065 * h; return (101325 * (T / 288.15) ** 5.25588) / (R * T); };
const RHO0_BAD = isa(0, 287);
// ── GEO for the exercise ──
const MU = 398600.4418, V_GEO = Math.sqrt(MU / 42164);
// ── GPS clocks for the checkpoint (a point-mass Earth, the ground clock's rotation ignored) ──
const GM = 3.986004418e14, C2 = 299792458 ** 2, RE = 6.371e6, RGPS = 2.656175e7, DAY = 86400;
const GPS_GRAV = ((GM / C2) * (1 / RE - 1 / RGPS) * DAY) * 1e6, GPS_VEL = ((GM / RGPS) / (2 * C2) * DAY) * 1e6;   // μs/day

export default lesson({
  id: 'prog.P15.1',
  title: 'Testing your code',
  minutes: 13, difficulty: 2,
  intro: t`A **test** is a small function that calls your code and **asserts** something that must be true — a value you know, a limit, a symmetry, a conserved quantity. If the assertion is false, Python raises an \`AssertionError\` and the test fails. You run every test after every change, so a bug announces itself the moment it is made rather than months later in a figure.

Floats are compared with a tolerance, never with \`==\`. \`numpy.testing.assert_allclose(actual, desired, rtol, atol)\` passes when, element by element,

$$\lvert \text{actual} - \text{desired}\rvert \;\le\; \text{atol} + \text{rtol}\times\lvert\text{desired}\rvert$$

and otherwise fails with a message giving both values and the largest difference. Choose the tolerance from what you know: how many figures the reference was printed to, or how accurate the method is supposed to be.`,
  symbols: [
    { tex: t`\text{actual}`, text: 'what your code computed' },
    { tex: t`\text{desired}`, text: 'the value it must match: an exact result, a table, a limit; the relative tolerance is measured against this one' },
    { tex: t`\text{rtol}`, text: 'the relative tolerance (`assert_allclose`’s default is $10^{-7}$)' },
    { tex: t`\text{atol}`, text: 'the absolute tolerance, in the units of the values (default 0) — needed when desired is zero' },
  ],
  why: 'Simulations are long chains of arithmetic in which a wrong sign still produces a plausible plot; tests are how you know the chain still says what you think it says.',
  visual: {
    type: 'code-runner',
    title: 'Six tests for relativistic velocity addition',
    lead: t`Press **Run**. The function adds two velocities along a line by special relativity, $w = (u + v)/(1 + uv/c^2)$. Six tests check it from different directions, and a ten-line runner calls every function whose name starts with \`test_\` — the job pytest does on a real machine.`,
    tasks: [
      t`Introduce a sign error: make the denominator \`1 - u * v / C**2\`. Three tests fail — but not the one at orbital speeds, where $uv/c^2$ is $10^{-10}$ and the sign cannot be seen.`,
      t`Instead forget the square (\`u * v / C\`). Now the orbital-speed test catches it. Different kinds of test catch different bugs.`,
      'Delete the word assert in test_adding_zero, then break the function: that test still passes. A test without assert tests nothing.',
    ],
    params: {
      rows: 22,
      code: t`import numpy as np
from numpy.testing import assert_allclose

C = 299792.458                          # speed of light, km/s

def add_velocities(u, v):
    """Relativistic sum of two velocities along one line (km/s)."""
    return (u + v) / (1 + u * v / C**2)

# ── the tests: each asserts something that must be true ──
def test_adding_zero():
    assert add_velocities(1234.5, 0.0) == 1234.5

def test_order_does_not_matter():
    assert_allclose(add_velocities(0.3 * C, 0.6 * C), add_velocities(0.6 * C, 0.3 * C), rtol=1e-15)

def test_light_stays_light():
    assert_allclose(add_velocities(0.5 * C, C), C, rtol=1e-12)

def test_never_faster_than_light():
    u, v = np.meshgrid(np.linspace(-0.999, 0.999, 41) * C, np.linspace(-0.999, 0.999, 41) * C)
    assert np.all(np.abs(add_velocities(u, v)) < C)

def test_newton_at_orbital_speeds():
    # the ISS's 7.66 km/s plus a sample thrown forward at 3 km/s: u + v to a part in 10⁹
    assert_allclose(add_velocities(7.66, 3.0), 10.66, rtol=1e-9)

def test_known_value():
    # two ships at 0.6c each, approaching: 1.2c / (1 + 0.36) = 15c/17
    assert_allclose(add_velocities(0.6 * C, 0.6 * C), 15 / 17 * C, rtol=1e-12)

# ── a tiny test runner: what pytest does for you on a real machine ──
tests = [f for name, f in list(globals().items()) if name.startswith("test_") and callable(f)]
failed = 0
for test in tests:
    try:
        test()
        print("PASS ", test.__name__)
    except AssertionError as err:
        failed += 1
        why = str(err).strip().splitlines()[0] if str(err).strip() else "the assert was false"
        print("FAIL ", test.__name__, "—", why)
print(f"{len(tests) - failed} passed, {failed} failed")`,
    },
    caption: 'Special relativity for velocities along one line. The exact comparison in test_adding_zero is safe because dividing by exactly 1 cannot round; everywhere else the tests use a tolerance.',
  },
  example: {
    prompt: t`Write tests for a function giving the air density of the International Standard Atmosphere (ISA) in the troposphere, $0 \le h \le 11\,000$ m, where the temperature falls linearly and $\rho = p/(RT)$:

\`\`\`python
def isa_density(h):
    """Air density (kg/m³) in the International Standard Atmosphere, 0 ≤ h ≤ 11 000 m."""
    if not 0 <= h <= 11000:
        raise ValueError(f"isa_density covers 0 to 11000 m, not {h} m")
    T = 288.15 - 0.0065 * h                     # temperature, K
    p = 101325 * (T / 288.15) ** 5.25588        # pressure, Pa
    return p / (287.053 * T)                    # ideal gas: ρ = p / (R T)
\`\`\``,
    visual: {
      type: 'graph',
      params: { x: [-0.5, 14], y: [0, 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 'altitude (km)', ylabel: 'ρ (kg/m³)',
        curves: [{ fn: '101325*((288.15 - 6.5*x)/288.15)^5.25588/(287.053*(288.15 - 6.5*x))', color: 'accent', domain: [0, 11] }],
        shade: [{ fn: '1.4', from: 11, to: 14, color: 'warn', alpha: 0.12 }],
        points: [{ x: 0, y: 1.225, color: 'gold', r: 5, label: '1.225 (sea level)', labelDx: 8, labelDy: 4 }, { x: 11, y: 0.3639, color: 'gold', r: 5, label: '0.3639 (11 km)', labelDx: -6, labelDy: -12, labelAlign: 'right' }],
        vlines: [{ x: 11, label: 'must raise ValueError', color: 'warn' }] },
      caption: 'The ISA troposphere: the two tabulated values the tests use, and the region above 11 km, where this formula no longer applies (the temperature stops falling), that the function must refuse.',
    },
    steps: [
      { label: 'Known values', text: t`Test against values you did not compute with this code: the ISA tables give 1.225 kg/m³ at sea level and 0.3639 at 11 km. The table prints four figures, so a tolerance of $10^{-3}$ is honest for 11 km; sea level is a defining value, worth $10^{-4}$.

\`\`\`python
def test_sea_level():
    assert_allclose(isa_density(0), 1.225, rtol=1e-4)

def test_tropopause():
    assert_allclose(isa_density(11000), 0.3639, rtol=1e-3)
\`\`\`` },
      { label: 'A property', text: t`Some truths hold everywhere, not at one point: density must fall with every step up. A property test sweeps the whole range:

\`\`\`python
def test_thins_with_height():
    rho = [isa_density(h) for h in range(0, 11001, 500)]
    assert np.all(np.diff(rho) < 0), "density must fall with every step up"
\`\`\`

The text after the comma is printed if the assertion fails.` },
      { label: 'An expected error', text: t`Above 11 km the formula is wrong, and the function promises to refuse. Test the promise: the test passes only if the error is raised.

\`\`\`python
def test_refuses_the_stratosphere():
    try:
        isa_density(15000)
    except ValueError:
        return
    raise AssertionError("isa_density(15000) should raise ValueError")
\`\`\`` },
      { label: 'Watch one fail', text: t`A test you have never seen fail may be unable to. Round the gas constant to 287 and run: \`test_sea_level\` fails with

\`\`\`
AssertionError:
Not equal to tolerance rtol=0.0001, atol=0
Max relative difference among violations: 0.00018423
 ACTUAL: array(1.225226)
 DESIRED: array(1.225)
\`\`\`

The message says which value, by how much, and against what tolerance: a $${(100 * (RHO0_BAD / 1.225 - 1)).toFixed(3)}$% error that no plot would ever show.` },
    ],
    answer: t`Four tests: two known values with tolerances matched to the table, a property (monotonic decrease), and an expected \`ValueError\` — and each one seen to fail on a broken version.`,
  },
  practice: [
    mcq({
      id: 'no-assert', difficulty: 1,
      prompt: t`This test has passed every run for a year. What is wrong with it?

\`\`\`python
def test_energy_conserved():
    E0 = energy(state0)
    E1 = energy(run(state0, steps=1000))
    abs(E1 - E0) / abs(E0) < 1e-6
\`\`\``,
      choices: [
        'It has no `assert`: the comparison is computed and thrown away, so the test can never fail',
        'Nothing: a comparison inside a test function is checked automatically',
        'The tolerance $10^{-6}$ is too tight for any integrator',
        'It should compare with `==` because energy is conserved exactly',
      ],
      answer: 0,
      why: {
        1: 'Python checks nothing unless told to. A test fails only by raising an exception, and an unused True or False raises nothing.',
        2: 'A symplectic integrator easily holds $10^{-6}$ over 1000 steps; and a tolerance that is too tight would make the test fail, not pass for a year.',
        3: 'A numerical integration conserves energy only approximately; floats are compared with a tolerance.',
      },
      hints: ['How does a test function signal failure?', 'What happens to the value of an expression that is not assigned, returned or asserted?'],
      teach: 'A test fails only by raising an exception: without assert, a comparison does nothing.',
      explain: t`The last line computes \`True\` or \`False\` and discards it. Write \`assert abs(E1 - E0) / abs(E0) < 1e-6\`. Then break the integrator on purpose and watch the test fail — the only proof a test can.`,
    }),
    match({
      id: 'kinds', difficulty: 2,
      prompt: t`Match each test to the kind of check it is.`,
      left: [
        t`\`assert_allclose(escape_speed(M_earth, R_earth), 11186, rtol=1e-3)\``,
        t`\`assert_allclose(pendulum_period(L, theta0=1e-4), 2*np.pi*np.sqrt(L/g), rtol=1e-8)\``,
        t`\`assert_allclose(force(a, b), -force(b, a))\``,
        t`\`assert abs(energy(run(1000)) / E0 - 1) < 1e-6\``,
        t`\`assert 15 < error(h) / error(h / 2) < 17\``,
        t`\`assert_allclose(simulate(), np.load("reference_v1.npy"), rtol=1e-12)\``,
      ],
      right: ['a known value', 'a limiting case', 'a symmetry', 'a conserved quantity', 'a convergence order', 'a regression test'],
      answer: [0, 1, 2, 3, 4, 5],
      hints: ['One compares with a published number, one with a simpler formula valid in a limit.', 'An error ratio of 16 when h halves means fourth order; a saved file from an earlier version guards against changes.'],
      teach: 'Physics code is tested from several directions: known values, limits, symmetries, conservation laws, convergence order and regression against trusted output.',
      explain: t`Escape speed: a known value. The tiny-amplitude pendulum: the small-angle limit. Newton's third law: a symmetry. Energy: conservation. Halving $h$ divides an RK4 error by $2^4 = 16$: the order. Comparing with saved output from version 1: a regression test, which says *something changed* — not which version was right.`,
    }),
    num({
      id: 'rtol-needed', difficulty: 2,
      gen(r) {
        const [what, desired, unit] = r.pick([['the period of a GPS orbit', 43082.0, 's'], ['the period of the ISS', 5554.0, 's'], ['the speed of a GEO satellite', 3.0747, 'km/s']]);
        const k = r.int(2, 9), e = r.pick([-4, -5, -6]);
        const actual = desired * (1 + r.sign() * k * 10 ** e);
        const shown = String(+actual.toPrecision(9));
        const key = Math.abs(+shown - desired) / desired;
        return {
          prompt: t`A test compares ${what} with a reference:

\`\`\`python
assert_allclose(actual, desired, rtol=rtol, atol=0)
# actual = ${shown} ${unit},  desired = ${desired} ${unit}
\`\`\`

What is the smallest \`rtol\` that lets it pass?`,
          answer: key, tol: { rel: 0.01 },
          errors: [{ value: Math.abs(+shown - desired), feedback: t`That is the absolute difference, in ${unit}. rtol is relative: divide by $\lvert\text{desired}\rvert$.` }],
          hints: [t`It passes when $\lvert\text{actual} - \text{desired}\rvert \le \text{rtol}\times\lvert\text{desired}\rvert$ (with atol = 0).`, 'Divide the difference by the desired value.'],
          teach: 'With atol = 0, assert_allclose needs rtol ≥ |actual − desired| / |desired|.',
          explain: t`$\lvert ${shown} - ${desired}\rvert / ${desired} = ${tex(key, 2)}$. Any rtol at least that large passes. Whether it *should* pass depends on how accurate the reference and the method are — the tolerance is a physics decision, not a number to tune until the test goes green.`,
        };
      },
    }),
    code({
      id: 'write-tests', difficulty: 2,
      prompt: t`Write two tests for \`circular_speed(r)\`, the speed $v = \sqrt{\mu/r}$ of a circular orbit around Earth: **test_geo** asserts that at $r = 42\,164$ km the speed is 3.0747 km/s (to a relative $10^{-4}$), and **test_scaling** asserts a property — an orbit four times as wide is half as fast. The checker swaps in broken functions to see whether your tests catch them.`,
      starter: t`import numpy as np
from numpy.testing import assert_allclose

MU = 398600.4418                     # Earth's GM, km³/s²

def circular_speed(r):
    """Speed (km/s) of a circular orbit of radius r (km) around Earth."""
    return np.sqrt(MU / r)

def test_geo():
    pass

def test_scaling():
    pass

# --- the checker uses this: leave it as it is ---
def catches(test, broken):
    """True if test() fails when circular_speed is swapped for broken."""
    good = circular_speed
    globals()["circular_speed"] = broken
    try:
        test()
        return False
    except AssertionError:
        return True
    finally:
        globals()["circular_speed"] = good
`,
      answer: t`import numpy as np
from numpy.testing import assert_allclose

MU = 398600.4418                     # Earth's GM, km³/s²

def circular_speed(r):
    """Speed (km/s) of a circular orbit of radius r (km) around Earth."""
    return np.sqrt(MU / r)

def test_geo():
    assert_allclose(circular_speed(42164), 3.0747, rtol=1e-4)

def test_scaling():
    assert_allclose(circular_speed(4 * 7000) / circular_speed(7000), 0.5, rtol=1e-12)

# --- the checker uses this: leave it as it is ---
def catches(test, broken):
    """True if test() fails when circular_speed is swapped for broken."""
    good = circular_speed
    globals()["circular_speed"] = broken
    try:
        test()
        return False
    except AssertionError:
        return True
    finally:
        globals()["circular_speed"] = good`,
      tests: [
        { name: 'both tests pass on the correct function', code: 'test_geo() is None and test_scaling() is None' },
        { name: 'test_geo catches a speed 1% too high', code: 'catches(test_geo, lambda r: 1.01 * np.sqrt(MU / r))' },
        { name: t`test_scaling catches the wrong law $v \propto 1/r$ (which is right at GEO)`, code: 'catches(test_scaling, lambda r: 3.0747 * 42164 / r)' },
        { name: t`test_scaling catches $v \propto r^{-1/3}$`, code: 'catches(test_scaling, lambda r: 3.0747 * (42164 / r) ** (1 / 3))' },
      ],
      hints: [t`\`assert_allclose(circular_speed(42164), 3.0747, rtol=1e-4)\``, 'For the property, compare two speeds: `circular_speed(4 * r) / circular_speed(r)` should be 0.5 for any r.', t`\`assert_allclose(circular_speed(4 * 7000) / circular_speed(7000), 0.5, rtol=1e-12)\``],
      teach: 'A test is only as good as the bugs it can catch: a known value pins one point, a property pins the shape of the whole law.',
      explain: t`At GEO $v = \sqrt{398\,600.4418/42\,164} = ${V_GEO.toFixed(5)}$ km/s, within $10^{-4}$ of 3.0747. The broken $v \propto 1/r$ was built to be exactly right at GEO, so only the property test can catch it: a single known value constrains one point, not a law. \`catches\` is the idea of *mutation testing*: break the code on purpose and check that some test notices.`,
    }),
    mcq({
      id: 'tolerance', difficulty: 3,
      prompt: t`A test integrates one period of an eccentric orbit with RK4 (500 steps) and compares the final position with the exact one. It fails:

\`\`\`python
assert_allclose(r_end, r_exact, rtol=1e-15)
# Max relative difference among violations: 2.3e-07
\`\`\`

What should you do?`,
      choices: [
        'Base the test on what the method promises: RK4 with this step is accurate to about 10⁻⁷, so compare at that level — or better, test the order: halving h should cut the error about 16-fold',
        'Conclude that the integrator is broken, because the difference is not zero',
        'Raise rtol to 0.1 so that it passes reliably',
        'Compare with `==` instead, since both values are floats',
      ],
      answer: 0,
      why: {
        1: 'Every fixed-step method has a truncation error; 2.3×10⁻⁷ is what RK4 with 500 steps on this orbit should give. A bug usually shows as an error far larger, or one that does not shrink at the right rate as h halves.',
        2: 'A tolerance a million times looser than the method’s error catches almost nothing: a wrong coefficient in one RK4 stage could pass.',
        3: '`==` is the same as a tolerance of zero: stricter still, and it would fail on any rounding.',
      },
      hints: ['How accurate is a fourth-order method with a finite step supposed to be?', 'What does a test of the convergence order check that a single comparison cannot?'],
      teach: 'Set a tolerance from the method’s expected accuracy, and test numerical methods by their convergence order, which a subtle bug changes.',
      explain: t`$10^{-15}$ is round-off level; no integrator with a finite step reaches it. Choose rtol a few times above the expected truncation error — or, more robustly, run at $h$ and $h/2$ and assert that the error ratio is near $2^4 = 16$. A bug in one stage of RK4 typically drops the order to 2 or 1, which the ratio test catches even when the error happens to be small.`,
    }),
    num({
      id: 'stochastic', difficulty: 3,
      gen(r) {
        const N = r.pick([1000, 2500, 10000, 40000]), sd = r.pick([0.8, 1.2, 2.0, 2.5]), k = 5;
        const key = (k * sd) / Math.sqrt(N);
        return {
          prompt: t`A Monte Carlo function draws $N = ${N}$ random burn errors whose true mean is 0 and standard deviation ${sd} m/s. A test checks the sample mean with a **five-sigma** tolerance, so that a correct code essentially never fails:

\`\`\`python
def test_mean():
    errors = sample_burn_errors(${N}, sd=${sd})
    assert abs(errors.mean()) < tol
\`\`\`

What should \`tol\` be, in m/s?`,
          answer: key, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: k * sd, feedback: t`That is five standard deviations of a single draw. The mean of $N$ draws scatters $\sqrt N$ times less.` },
            { value: sd / Math.sqrt(N), feedback: t`That is one standard error: a correct code would fail this test about one run in three.` },
          ],
          hints: [t`The sample mean of $N$ draws has a standard deviation of $\sigma/\sqrt N$.`, t`Five of those: $5\sigma/\sqrt N$.`],
          teach: 'Test random output statistically: allow several standard errors, σ/√N each, so a correct code almost never fails and a biased one still does.',
          explain: t`$5\times${sd}/\sqrt{${N}} = ${key.toPrecision(3)}$ m/s. A correct code fails a five-sigma test about once in 1.7 million runs; a bias larger than about $${key.toPrecision(2)}$ m/s fails it. Never test a random result against the exact number one seed happened to give — a library update can change the stream.`,
        };
      },
    }),
    order({
      id: 'bug-first', difficulty: 2,
      prompt: t`A user reports that \`drag(h=0, v=0)\` crashes:

\`\`\`
ZeroDivisionError: division by zero
\`\`\`

Put the steps of fixing it, test first, in order.`,
      items: [
        'Write a test that calls drag(0, 0) and asserts the force is 0',
        'Run the tests and see the new one fail, for the reported reason',
        'Fix the function',
        'Run every test: the new one passes and the old ones still do',
        'Keep the test, so the bug can never quietly return',
      ],
      hints: ['If you fix first, how do you know the test would have caught the bug?', 'The last two steps protect everything else.'],
      teach: 'Reproduce a bug as a failing test before fixing it; the test then proves the fix and guards against the bug returning.',
      explain: t`A test written after the fix may never have been able to fail. Seeing it fail first proves it reproduces the bug; rerunning the whole suite proves the fix broke nothing else; keeping it is a regression test for ever.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-doppler', difficulty: 3, transfer: true,
      prompt: t`The relativistic Doppler factor for a source moving straight toward you at $\beta = v/c$ is $f_\text{obs}/f_\text{src} = \sqrt{(1+\beta)/(1-\beta)}$; a receding source has $\beta < 0$. The tests below are right; the function is not. Run it, read which tests fail, and fix \`doppler\` until **all five pass** — without changing the tests.`,
      starter: t`import numpy as np
from numpy.testing import assert_allclose

def doppler(beta):
    """Observed/emitted frequency for a source approaching at beta = v/c (beta < 0: receding)."""
    return np.sqrt((1 - beta) / (1 + beta))

def test_at_rest():
    assert doppler(0.0) == 1.0

def test_approaching_is_blueshifted():
    assert doppler(0.5) > 1

def test_known_value():
    assert_allclose(doppler(0.6), 2.0, rtol=1e-12)          # √(1.6/0.4) = 2

def test_receding_undoes_approaching():
    assert_allclose(doppler(0.3) * doppler(-0.3), 1.0, rtol=1e-12)

def test_rejects_faster_than_light():
    try:
        doppler(1.2)
    except ValueError:
        return
    raise AssertionError("doppler(1.2) should raise ValueError")

for name, test in list(globals().items()):
    if name.startswith("test_"):
        try:
            test()
            print("PASS ", name)
        except AssertionError as err:
            print("FAIL ", name, "—", str(err).strip().splitlines()[0] if str(err).strip() else "")
`,
      answer: t`import numpy as np
from numpy.testing import assert_allclose

def doppler(beta):
    """Observed/emitted frequency for a source approaching at beta = v/c (beta < 0: receding)."""
    if not -1 < beta < 1:
        raise ValueError(f"|beta| must be below 1, not {beta}")
    return np.sqrt((1 + beta) / (1 - beta))

def test_at_rest():
    assert doppler(0.0) == 1.0

def test_approaching_is_blueshifted():
    assert doppler(0.5) > 1

def test_known_value():
    assert_allclose(doppler(0.6), 2.0, rtol=1e-12)          # √(1.6/0.4) = 2

def test_receding_undoes_approaching():
    assert_allclose(doppler(0.3) * doppler(-0.3), 1.0, rtol=1e-12)

def test_rejects_faster_than_light():
    try:
        doppler(1.2)
    except ValueError:
        return
    raise AssertionError("doppler(1.2) should raise ValueError")

for name, test in list(globals().items()):
    if name.startswith("test_"):
        try:
            test()
            print("PASS ", name)
        except AssertionError as err:
            print("FAIL ", name, "—", str(err).strip().splitlines()[0] if str(err).strip() else "")`,
      tests: [
        { name: 'all five tests are still there', code: 'len([n for n in list(globals()) if n.startswith("test_")]) == 5' },
        { name: 'every test passes', code: 'all(f() is None for n, f in list(globals().items()) if n.startswith("test_"))' },
        { name: 'a source approaching at 0.8c is blueshifted by a factor 3', code: 'abs(doppler(0.8) - 3.0) < 1e-9' },
      ],
      hints: [
        'Run it first: three tests fail. Read their names.',
        t`An approaching source must be *blue*shifted (factor above 1): the numerator should be $1 + \beta$.`,
        t`At $\beta = 1.2$, \`np.sqrt\` of a negative number gives nan and raises nothing; add \`if not -1 < beta < 1: raise ValueError(...)\` at the top.`,
      ],
      teach: 'Failing tests point at the bug: read which ones fail and what they assert, then change the code — never the test — until they pass.',
      explain: t`The fraction was upside down (a blueshift came out as a redshift), and nothing stopped $\lvert\beta\rvert \ge 1$, where \`np.sqrt\` silently returns nan. Fixed, \`doppler(0.6)\` is 2: light from a source approaching at $0.6c$ arrives at twice its frequency. Note that two tests passed even with the formula upside down — at rest and the receding–approaching product are symmetric — which is why a suite needs several kinds of test.`,
    }),
    mcq({
      id: 'cp-pytest', difficulty: 2,
      prompt: t`Your tests are plain functions named \`test_…\` that use \`assert\` and \`assert_allclose\`, run by a loop like the lesson's. On your own computer you install **pytest**. What do you have to change?

\`\`\`python
def test_known_value():
    assert_allclose(add_velocities(0.6 * C, 0.6 * C), 15 / 17 * C, rtol=1e-12)
\`\`\``,
      choices: [
        'Almost nothing: put the tests in a file named test_something.py that imports your functions, delete the loop, and run `pytest` — it finds every test_ function and reports each one',
        'Rewrite every test as a method of a unittest.TestCase class',
        'Replace each assert with self.assertEqual',
        'Nothing works with floats in pytest, so convert the values to strings first',
      ],
      answer: 0,
      why: {
        1: 'That is the older unittest style. pytest runs plain functions with plain asserts as they are.',
        2: '`self.assertEqual` belongs to unittest; pytest reads a plain `assert` and, on failure, shows the values on both sides.',
        3: 'pytest compares floats like Python does; for tolerances use assert_allclose or `pytest.approx`.',
      },
      hints: ['How does pytest find tests?', 'The loop in the lesson imitates exactly that discovery.'],
      teach: 'pytest discovers test_ functions in test_*.py files and runs them with plain asserts: the habits in this lesson carry straight over.',
      explain: t`pytest adds what the ten-line loop cannot: discovery across many files, a clear report with the values in a failing \`assert\`, \`pytest.approx\`, \`@pytest.mark.parametrize\` to run one test over many inputs, \`pytest.raises\` for expected errors, and fixtures for shared setup. Run on every commit (continuous integration), it keeps a project honest for years. This browser has no pytest and no files for it to find — the reason for the loop.`,
    }),
    mcq({
      id: 'cp-gps', difficulty: 3, transfer: true,
      prompt: t`A function returns how much faster a GPS satellite's clock runs than one on the ground, in μs per day: a gravitational gain ($+${GPS_GRAV.toFixed(1)}$) plus a velocity loss ($-${GPS_VEL.toFixed(1)}$). Which **single** test would catch a sign error in the gravitational term?

\`\`\`python
def gps_clock_gain(r_orbit):
    """Satellite clock rate minus ground clock rate, μs/day."""
    return gravitational_term(r_orbit) + velocity_term(r_orbit)
\`\`\``,
      choices: [
        t`\`assert_allclose(gps_clock_gain(26_561.75e3), 38.5, rtol=0.01)\` — the known net gain`,
        t`\`assert_allclose(velocity_term(26_561.75e3), -7.2, rtol=0.01)\``,
        t`\`assert isinstance(gps_clock_gain(26_561.75e3), float)\``,
        t`\`assert gps_clock_gain(26_561.75e3) != 0\``,
      ],
      answer: 0,
      why: {
        1: 'It tests the velocity term alone, which the bug does not touch.',
        2: 'A wrong sign still returns a float.',
        3: t`With the sign wrong the result is $-${(GPS_GRAV + GPS_VEL).toFixed(1)}$ μs/day — not zero, so this test passes.`,
      },
      hints: ['What would the function return with the gravitational term’s sign flipped?', 'Which test involves the gravitational term and pins its value?'],
      teach: 'A test catches a bug only if the bug changes what the test checks: aim each test at a number the suspect code determines.',
      explain: t`With the sign flipped the function returns $-${GPS_GRAV.toFixed(1)} - ${GPS_VEL.toFixed(1)} = -${(GPS_GRAV + GPS_VEL).toFixed(1)}$ μs/day instead of $+${(GPS_GRAV - GPS_VEL).toFixed(1)}$; only the known-value test of the total notices. (The real system builds this into the satellites: their clocks are set to tick slow by about 4.5 parts in $10^{10}$ before launch.)`,
    }),
  ],
  sources: [
    { label: 'NumPy reference: numpy.testing.assert_allclose', url: 'https://numpy.org/doc/stable/reference/generated/numpy.testing.assert_allclose.html' },
    { label: 'pytest documentation: Get started', url: 'https://docs.pytest.org/en/stable/getting-started.html' },
    { label: 'Wilson et al. (2014), Best practices for scientific computing, PLoS Biol 12, e1001745', url: 'https://doi.org/10.1371/journal.pbio.1001745' },
    { label: 'Ashby (2003), Relativity in the Global Positioning System, Living Rev. Relativ. 6, 1', url: 'https://doi.org/10.12942/lrr-2003-1' },
  ],
});
