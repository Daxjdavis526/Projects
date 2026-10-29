// Verification versus validation: "solving the equations right" (code
// against known solutions, conservation laws, convergence order, manufactured
// solutions) against "solving the right equations" (model against nature,
// with the ASME V&V 20 comparison E = S − D and its validation uncertainty).
// Worked through a Newtonian orbit code that is perfectly verified and still
// fails against the binary pulsar's orbital decay (Weisberg & Huang 2016).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { dataPlot, SRC } from './_rs.js';

const t = String.raw;

const SNIPPET = t`import math

# Leapfrog (kick-drift-kick) for an orbit with GM = 1;
# lam multiplies a GR-like term (lam = 0 is pure Newton).
def accel(x, y, vx, vy, lam, delta=0.001):
    r2 = x * x + y * y
    r = math.sqrt(r2)
    L = x * vy - y * vx
    f = -(1 + 3 * lam * delta * L * L / r2) / (r2 * r)
    return f * x, f * y

def run(e=0.5, steps_per_orbit=2000, orbits=10, lam=0.0):
    x, y = 1 - e, 0.0                      # perihelion of an orbit with a = 1
    vx, vy = 0.0, math.sqrt((1 + e) / (1 - e))
    h = 2 * math.pi / steps_per_orbit
    E0 = 0.5 * (vx**2 + vy**2) - 1 / math.hypot(x, y)
    worst = 0.0
    for n in range(steps_per_orbit * orbits):
        ax, ay = accel(x, y, vx, vy, lam)
        vx += 0.5 * h * ax; vy += 0.5 * h * ay
        x += h * vx; y += h * vy
        ax, ay = accel(x, y, vx, vy, lam)
        vx += 0.5 * h * ax; vy += 0.5 * h * ay
        E = 0.5 * (vx**2 + vy**2) - 1 / math.hypot(x, y)
        worst = max(worst, abs(E - E0) / abs(E0))
    return x, y, worst

# Verification test 1: with lam = 0 (pure Kepler) the orbit must close
x, y, worst = run(lam=0.0)
print("Kepler, 10 orbits: back at perihelion?", round(x, 6), round(y, 6), "(exact: 0.5, 0)")
print("largest relative energy error:", f"{worst:.1e}")

# Verification test 2: halve the step and the error should fall about 4x (2nd order)
x2, y2, worst2 = run(lam=0.0, steps_per_orbit=4000)
print("same, half the step:", f"{worst2:.1e}", " ratio:", round(worst / worst2, 2))`;

// the binary pulsar: ratio of measured (galaxy-corrected) orbital decay to GR's prediction
const pulsarRatio = (caption, { newton = true } = {}) => dataPlot([[1, 0.9983, 0.0016]], {
  x: [0, 2], y: [newton ? -0.1 : 0.99, newton ? 1.15 : 1.006], xlabel: '', xticks: 0, ylabel: 'measured ÷ GR decay', yticks: 5,
  hlines: [{ y: 1, label: 'GR (quadrupole radiation)', color: 'accent' }, ...(newton ? [{ y: 0, label: 'Newtonian point masses', color: 'gold' }] : [])],
}, { cap: 0.05, caption });

export default lesson({
  id: 'research.R5.1',
  title: 'Verification versus validation',
  minutes: 14, difficulty: 3,
  intro: t`Two different questions decide whether a simulation can be believed. **Verification**: does the code solve its equations correctly? It is checked against mathematics — exact solutions, conservation laws, the expected order of convergence. **Validation**: are they the right equations for this physics? It is checked against nature — measurements, with their uncertainties. A code can pass the first and fail the second. A standard way to state a validation comparison (ASME V&V 20) is

$$E = S - D, \qquad u_{\text{val}} = \sqrt{u_{\text{num}}^2 + u_{\text{input}}^2 + u_D^2}$$

If $|E|$ is well above $u_{\text{val}}$, the **model** is missing something. If it is not, the model is validated — but only to within $u_{\text{val}}$, and only for the conditions tested.`,
  symbols: [
    { tex: 'S', text: 'the simulation’s value of the quantity being compared' },
    { tex: 'D', text: 'the measured value of the same quantity' },
    { tex: 'E', text: 'the comparison error: the difference between simulation and data' },
    { tex: 'u_{\\text{num}}', text: 'the numerical uncertainty of $S$, estimated by verification (convergence tests, next lesson)' },
    { tex: 'u_{\\text{input}}', text: 'the uncertainty in $S$ caused by uncertain inputs (masses, material properties, boundary conditions)' },
    { tex: 'u_D', text: 'the measurement uncertainty of $D$' },
    { tex: 'u_{\\text{val}}', text: 'the validation uncertainty: the size of model error the comparison could detect at all' },
  ],
  why: t`"The simulation agrees with the data" means nothing until you know the code is right — and "the code is right" means nothing about nature.`,
  visual: {
    type: 'code-runner',
    title: 'Verify before you trust',
    lead: t`A leapfrog orbit integrator with two verification tests: a pure Kepler orbit must close on itself and conserve energy, and halving the step must cut the error by the method’s order ($2^2 = 4$). Run it, then break things on purpose.`,
    tasks: ['Run it: the energy error is tiny and falls 4× when the step halves — second order, as leapfrog should be.', 'Change the first run to lam=1.0: the orbit no longer returns to its start. That is physics (a precessing orbit), not a bug — which is why test 1 must use lam = 0.', 'Introduce a bug: change 0.5 * h to 0.6 * h in the second kick. Which test catches it?'],
    params: { code: SNIPPET, rows: 20 },
    caption: 'Units with GM = 1 and a = 1, so one orbit is 2π time units. The GR-like term uses δ = 0.001, exaggerated thousands of times beyond Mercury’s.',
  },
  example: {
    prompt: t`An orbit code for two point masses under Newtonian gravity conserves energy to $10^{-12}$ and converges at its designed order. Used on the binary pulsar PSR B1913+16, it predicts that the orbital period never changes. The measured period shrinks by about $76\ \mu\text{s}$ per year. What has gone wrong, and what would fix it?`,
    visual: pulsarRatio('Orbital decay of PSR B1913+16 as a fraction of the GR prediction: measured 0.9983 ± 0.0016 (Weisberg & Huang 2016, after correcting for the Galaxy’s acceleration). A Newtonian point-mass model predicts 0.'),
    steps: [
      { label: 'Verification passed', text: t`Energy conservation and the convergence order are tests of the code against its own equations. They passed: the code solves Newton’s equations correctly.` },
      { label: 'Validation failed', text: t`Compared with nature, $E = S - D$: the model predicts no decay, the data show $\dot P_b \approx -2.4\times10^{-12}$ (76 μs per year). The measurement uncertainty is a fraction of a percent of that, so $|E| \gg u_{\text{val}}$.` },
      { label: 'Diagnosis', text: t`Because verification passed, the gap is not a bug: the **model** lacks physics. Newtonian point masses on a fixed orbit lose no energy; GR says the binary radiates gravitational waves.` },
      { label: 'The fix', text: t`Add radiation reaction (the quadrupole formula). Then, after correcting the data for the Galaxy’s acceleration, measured ÷ predicted $= 0.9983 \pm 0.0016$: $|E|$ is about $1.1\,u_{\text{val}}$.` },
      { label: 'What was shown', text: t`GR’s quadrupole radiation is **validated** for this observable at about the 0.2% level. A smaller model error would be invisible in this comparison — the honest statement includes that limit.` },
    ],
    answer: t`The code is verified but the model is invalid for orbital decay: Newtonian point masses do not radiate. With GR’s radiation reaction, model and data agree to about $1\sigma$ at the 0.2% level.`,
  },
  practice: [
    multi({
      id: 'which-v', difficulty: 2,
      prompt: 'Which of these are **verification** activities (checking the code against its equations)? Choose all that apply.',
      visual: pulsarRatio('The validation side: a model’s prediction against a measurement.', { newton: false }),
      choices: [
        'Checking that a Kepler orbit with the GR term switched off closes on itself',
        'Checking that energy is conserved to the integrator’s expected accuracy',
        'Measuring that halving the step cuts the error by the method’s order',
        'Comparing the predicted orbital decay of a binary pulsar with timing data',
        'Comparing a nozzle simulation’s thrust with a test-stand measurement',
      ],
      answer: [0, 1, 2],
      why: { 3: 'That compares the model with nature: validation.', 4: 'A test stand measures nature: that is validation.' },
      hints: ['Verification needs only mathematics: a known answer the equations must give.', 'Validation needs a measurement.'],
      teach: 'Verification compares a code with the mathematics of its own equations; validation compares the equations with nature.',
      explain: 'Exact solutions, conservation laws and convergence order test the code. Pulsar timing and a test stand test the model.',
    }),
    mcq({
      id: 'first', difficulty: 2,
      prompt: 'Why must verification come before validation?',
      visual: pulsarRatio('A comparison with data is only interpretable once the code is known to solve its equations.'),
      choices: [
        'If the code is unverified, a disagreement with data could be a bug or missing physics, and you cannot tell which',
        'Because validation is less important',
        'Because the data are usually wrong',
        'Because verification is faster',
      ],
      answer: 0,
      why: { 1: 'Validation is the goal; verification makes it meaningful.', 2: 'Data have uncertainties, which the comparison includes, but that is not the reason for the order.', 3: 'Verification can take longer than the validation itself.' },
      hints: ['Suppose code and data disagree. What are the possible causes?'],
      teach: 'Verify first, so a disagreement with data can be blamed on the model rather than the code.',
      explain: 'Bugs and missing physics both produce disagreement. Verification removes the first explanation, so validation can test the second — and an agreement cannot be an accident of two errors cancelling.',
    }),
    num({
      id: 'e-over-u', difficulty: 2,
      gen(r) {
        const D = r.float(180, 260, 1), uD = r.float(1.5, 4, 0.5), un = r.float(0.5, 2.5, 0.5), ui = r.float(1, 3, 0.5);
        const E = +(r.sign() * r.float(1, 14, 0.5)).toFixed(1), S = +(D + E).toFixed(1);
        const uval = Math.sqrt(un * un + ui * ui + uD * uD), ans = Math.abs(E) / uval;
        return {
          prompt: t`A cold-gas thruster simulation predicts a thrust of $S = ${S}$ mN. The test stand measures $D = ${D}$ mN with $u_D = ${uD}$ mN. The simulation’s numerical uncertainty is $u_{\text{num}} = ${un}$ mN and its input uncertainty (from the plenum pressure) $u_{\text{input}} = ${ui}$ mN (constructed numbers). What is $|E|/u_{\text{val}}$?`,
          visual: dataPlot([[1, D, uD], [2, S, Math.hypot(un, ui)]], { x: [0.3, 2.7], y: [+(Math.min(D, S) - 3 * uval).toFixed(0), +(Math.max(D, S) + 3 * uval).toFixed(0)], xlabel: '', xticks: 0, ylabel: 'thrust (mN)', yticks: 4, points: [{ x: 1, y: D, r: 0, label: 'test stand', labelDx: 10, labelDy: 0 }, { x: 2, y: S, r: 0, label: 'simulation', labelDx: 10, labelDy: 0 }] }, { cap: 0.04, caption: 'Measurement (left) and simulation (right), each with its own uncertainty.' }),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: Math.abs(E) / uD, feedback: 'The simulation’s uncertainties count too: combine all three in quadrature.' }, { value: Math.abs(E) / (un + ui + uD), feedback: 'Independent uncertainties combine in quadrature, not by adding.' }].filter((x) => Math.abs(x.value - ans) > 0.03 * ans),
          hints: [t`$E = S - D = ${E}$ mN.`, t`$u_{\text{val}} = \sqrt{${un}^2 + ${ui}^2 + ${uD}^2}$.`],
          teach: 'A validation comparison is the difference between simulation and data, in units of all their uncertainties combined.',
          explain: t`$u_{\text{val}} = ${uval.toFixed(2)}$ mN, so $|E|/u_{\text{val}} = ${Math.abs(E).toFixed(1)}/${uval.toFixed(2)} = ${ans.toFixed(2)}$. ${ans > 3 ? 'The model is missing something (heat transfer, real-gas effects, the nozzle’s boundary layer…).' : 'No model error is detected — but none smaller than about ' + (2 * uval).toFixed(0) + ' mN could have been.'}`,
        };
      },
    }),
    mcq({
      id: 'mms', difficulty: 3,
      prompt: t`Your heat-conduction code has no known exact solution for the geometry you care about. The **method of manufactured solutions** verifies it anyway. How?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.1, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'u', xticks: 5, yticks: 4, curves: [{ fn: 'sin(pi*x)*(1 + 0.3*x)', color: 'accent', label: 'chosen u(x)', labelAt: 0.3, labelDy: -10 }] }, caption: 'A manufactured solution: any smooth function you like, not a physical one.' },
      choices: [
        'Choose any smooth function, put it into the equation to find the source term it would need, run the code with that source, and check it recovers the function at the expected order',
        'Run the code and adopt whatever it produces as the reference solution',
        'Compare the code with a measurement on the real geometry',
        'Manufacture a test stand that matches the geometry',
      ],
      answer: 0,
      why: { 1: 'That tests nothing: the code would always agree with itself.', 2: 'That is validation, and it cannot separate bugs from model errors.', 3: 'Building hardware is validation too, and far costlier.' },
      hints: ['Work backwards: pick the answer first.', 'Substituting a chosen function into the equation tells you what source term would make it exact.'],
      teach: 'Manufactured solutions give any code an exact answer to be verified against, by choosing the solution first and computing the source it needs.',
      explain: 'The chosen function need not be physical; it only has to exercise every term in the equation. If the code recovers it, with the error shrinking at the designed order, the implementation is verified (Roache 1997).',
    }),
    mcq({
      id: 'range', difficulty: 2,
      prompt: t`A nozzle model is validated against test-stand data for chamber pressures from 5 to 20 bar, where $|E| < u_{\text{val}}$ everywhere. Your engine runs at 60 bar. What can you claim?`,
      visual: dataPlot([[5, 1.31, 0.02], [10, 1.42, 0.02], [15, 1.47, 0.02], [20, 1.50, 0.02]], { x: [0, 65], y: [1.2, 1.75], xlabel: 'chamber pressure (bar)', ylabel: 'thrust coefficient', xticks: 6, yticks: 4, curves: [{ fn: '1.62 - 1.6/x', domain: [4, 20], color: 'accent' }, { fn: '1.62 - 1.6/x', domain: [20, 62], color: 'accent', dash: [6, 5] }], vlines: [{ x: 60, label: 'your engine', color: 'gold' }] }, { cap: 0.6, caption: 'Constructed: validation data (dots) and the model, solid where validated and dashed beyond.' }),
      choices: [
        'The model is validated from 5 to 20 bar; at 60 bar it is an extrapolation whose error is not measured',
        'The model is validated, so it holds at 60 bar too',
        'Nothing at all, since 60 bar was not tested',
        'The model is wrong at 60 bar',
      ],
      answer: 0,
      why: { 1: 'Validation is specific to the conditions tested; new physics (separation, heat flux) can appear outside them.', 2: 'The model’s physics is still the best guide — it is just not validated there; state the extrapolation and its risk.', 3: 'There is no evidence of that either.' },
      hints: ['Validation is always "for these conditions".'],
      teach: 'A model is validated for a range of conditions; outside it, it is an extrapolation and must be labelled as one.',
      explain: 'Use the model at 60 bar if you must, but say it is an extrapolation, give a reason to believe the physics carries over, and plan a test near 60 bar if the result matters.',
    }),
    mcq({
      id: 'calibrate', difficulty: 3,
      prompt: 'A team tunes a drag coefficient in their re-entry model until it matches a flight’s deceleration curve, then reports that the model is "validated by the same flight". What is the problem?',
      visual: dataPlot([[1, 3.1, 0.3], [2, 5.8, 0.4], [3, 8.9, 0.5], [4, 7.2, 0.5], [5, 4.0, 0.4]], { x: [0.4, 5.6], y: [0, 11], xlabel: 'time (min)', ylabel: 'deceleration (g)', xticks: 5, yticks: 4, curves: [{ fn: '9*exp(-((x - 3.1)^2)/1.6)', color: 'accent' }] }, { cap: 0.06, caption: 'Constructed: a deceleration profile and a model tuned to it.' }),
      choices: [
        'Calibration against data is not validation by the same data: the agreement was forced. Validation needs independent data (another flight)',
        'Nothing: agreement with flight data is validation',
        'Drag coefficients cannot be tuned',
        'Deceleration is not a valid observable',
      ],
      answer: 0,
      why: { 1: 'A tuned parameter can make many wrong models fit one data set.', 2: 'They can, and calibration is legitimate — as calibration.', 3: 'It is a perfectly good observable.' },
      hints: ['Could a wrong model have been tuned to fit this curve?', 'Which data could the tuned model still fail on?'],
      teach: 'Calibration uses data to set parameters; validation needs data that were not used to set them.',
      explain: 'Calibrate on one flight, validate on another (or on a different observable). Reusing the calibration data turns a test into a tautology.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pulsar', difficulty: 2, transfer: true,
      prompt: t`For PSR B1913+16, the ratio of measured (galaxy-corrected) orbital decay to GR’s prediction is $0.9983 \pm 0.0016$ (Weisberg & Huang 2016). By how many standard uncertainties does it differ from 1?`,
      visual: pulsarRatio('The measured ratio with its 1σ error bar, against GR (1).', { newton: false }),
      answer: (1 - 0.9983) / 0.0016, tol: { rel: 0.02 },
      errors: [{ value: 0.0017, feedback: 'That is the difference itself; divide by the uncertainty.' }],
      hints: [t`$|1 - 0.9983|/0.0016$.`],
      teach: 'A validation result is a difference measured in its uncertainty.',
      explain: t`$0.0017/0.0016 \approx ${((1 - 0.9983) / 0.0016).toFixed(1)}$: GR’s radiation reaction agrees with the data. The comparison could not have seen a model error much below about 0.3%.`,
    }),
    mcq({
      id: 'cp-diagnose', difficulty: 3,
      prompt: 'Your orbit integrator gives a perihelion advance 3% above the GR formula for Mercury. Energy is conserved poorly, and halving the step changes the answer by 1%. What do you conclude?',
      visual: { type: 'cm3-orbit', params: { force: 'gr', delta: 0.006, L: 1, E: -0.3, sliders: [], turns: 5, panels: ['orbit'], readouts: [], play: false, dragE: false, labels: false }, caption: 'An exaggerated precessing orbit.' },
      choices: [
        'The calculation is not verified: numerical error is at least comparable to the discrepancy, so nothing can be said about the physics yet',
        'GR is 3% wrong for Mercury',
        'The formula is wrong and the simulation right',
        'The result is validated, because 3% is close',
      ],
      answer: 0,
      why: { 1: 'A 1% change under step-halving means the numerical uncertainty is not small; the 3% could be numerical.', 2: 'There is no basis for preferring an unconverged simulation.', 3: 'Closeness is meaningless without uncertainties — and this is not even a comparison with data.' },
      hints: [t`Halving the step moved the answer by 1%: that is a rough size for $u_{\text{num}}$.`, t`Is $u_{\text{num}}$ small compared with the 3% discrepancy?`],
      teach: t`If $u_{\text{num}}$ is comparable to a discrepancy, the discrepancy says nothing about the model.`,
      explain: 'Fix verification first: converge the step size until changes are far below 1%, check energy conservation, then compare again. Only a converged result can test physics.',
    }),
    multi({
      id: 'cp-honest', difficulty: 2,
      prompt: 'A good validation statement includes which of these? Choose all that apply.',
      visual: pulsarRatio('Measured ÷ predicted, with its uncertainty: the core of a validation statement.', { newton: false }),
      choices: [
        'The quantity compared and the conditions it was compared under',
        t`The comparison error $E$ and the validation uncertainty $u_{\text{val}}$`,
        'How the numerical uncertainty was estimated',
        'A claim that the model is now correct everywhere',
      ],
      answer: [0, 1, 2],
      why: { 3: t`Validation is always limited to the conditions tested and to errors larger than $u_{\text{val}}$.` },
      hints: ['What would a reader need in order to judge, and reuse, the claim?'],
      teach: 'State what was compared, under which conditions, the difference, and the uncertainty that bounds what could be seen.',
      explain: t`"Validated" without conditions and $u_{\text{val}}$ is a slogan. With them, it is a result someone else can build on.`,
    }),
  ],
  sources: [SRC.oberkampf, SRC.roache, SRC.pulsar,
    { label: 'ASME V&V 20-2009, Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer', url: 'https://webstore.ansi.org/standards/asme/asme202009' }],
});
