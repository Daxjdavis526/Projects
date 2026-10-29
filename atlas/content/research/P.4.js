// Miniature project 4 — Mercury's perihelion by numerical integration.
// The project scoped in research.R3.2, carried out: Newton plus the
// Schwarzschild correction a = −(GM/r³) r [1 + λ·3L²/(c²r²)] integrated in
// Cartesian coordinates with solve_ivp (DOP853) in AU and days; the
// perihelion direction read from the Laplace–Runge–Lenz vector, averaged
// over each orbit (a straight fit to the raw osculating angle is biased to
// 42.22 by the in-orbit wobble); a Newtonian null test against tolerance
// (36.4, 4.72, 0.074, 0.0008 ″/century at rtol 10⁻⁶ … 10⁻¹²); the
// exaggerate-and-extrapolate fallback, advance/λ linear in λ, intercept
// 42.9807″ against the formula's 42.9807″ and Will (2014)'s 42.98″; and the
// historical budget (Clemence 1947: ≈5600 observed, ≈5025 precession of the
// equinoxes, ≈532 planets, ≈43 left). st-f.F14.2 measures the same number
// with the orbit equation u(φ) and fixed-step RK4 — a different route.
// Numbers from the Explore were copied from running it in Pyodide.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { sci, r6, SRC2 } from './_rs2.js';

const t = String.raw;
const GMSI = 1.32712440018e20, CSI = 299792458, AU = 1.495978707e11, ARC = 648000 / Math.PI;
const A_M = 0.387098, E_M = 0.20563, P_M = 87.969;
const FORMULA = 42.9807;
const PER = [[100, 42.9822], [300, 42.9852], [1000, 42.9957], [3000, 43.0256]];      // from the Explore
const NULL = [[1e-6, 36.36], [1e-8, 4.724], [1e-10, 0.0744], [1e-12, 0.0008]];        // Newton-only rate, ″/century

const orbitPic = (caption, delta = 0.01) => ({ type: 'cm3-orbit', params: { force: 'gr', delta, L: 1, E: -0.3, sliders: [], turns: 6, panels: ['orbit'], readouts: [], play: false, dragE: false, labels: false }, caption });
const lamPic = (caption, { fit = true } = {}) => ({
  type: 'graph',
  params: {
    x: [-200, 3300], y: [42.97, 43.035], aspect: 'wide', axesAt: 'edge', xlabel: 'exaggeration factor λ', ylabel: 'advance ÷ λ (″ per century)', xticks: 6, yticks: 4,
    points: PER.map(([x, y]) => ({ x, y, color: 'gold', r: 5 })),
    ...(fit ? { curves: [{ fn: `${FORMULA} + 1.495e-5*x`, color: 'accent', dash: [6, 4], width: 1.6 }] } : {}),
    hlines: [{ y: FORMULA, label: 'formula: 42.9807', color: 'good' }],
  },
  caption,
});
const nullPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-13, -5], y: [-4, 2.3], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'solver tolerance rtol', ylabel: 'Newton-only advance (″/century)', xticks: 4, yticks: 4,
    points: NULL.map(([x, y]) => ({ x: r6(Math.log10(x)), y: r6(Math.log10(y)), color: 'bad', r: 5 })),
    hlines: [{ y: r6(Math.log10(42.98)), label: 'the GR signal, 43″', color: 'good' }, { y: r6(Math.log10(0.43)), label: '1% of it', color: 'gold' }],
  },
  caption,
});

const PRELUDE = t`import numpy as np
from scipy.integrate import solve_ivp

GM = 0.01720209895**2                      # Sun's GM, AU^3/day^2 (Gauss's constant squared)
C = 299792458 * 86400 / 1.495978707e11     # speed of light, AU/day
a, e = 0.387098, 0.205630                  # Mercury's semi-major axis (AU) and eccentricity
P = 2 * np.pi * np.sqrt(a**3 / GM)         # orbital period, days
start = [a * (1 - e), 0, 0, np.sqrt(GM * (1 + e) / (a * (1 - e)))]   # at perihelion

def rhs(t, s, lam):
    """Newton plus lam times the general-relativistic correction."""
    x, y, vx, vy = s
    r2 = x*x + y*y
    L = x*vy - y*vx                        # angular momentum per unit mass
    k = -GM / r2**1.5 * (1 + lam * 3 * L*L / (C*C * r2))
    return [vx, vy, k*x, k*y]
`;
const LRL = t`
def lrl_angle(s):
    """Direction of the Laplace-Runge-Lenz vector: where the perihelion points."""
    x, y, vx, vy = s
    L = x*vy - y*vx
    r = np.hypot(x, y)
    return np.arctan2(-vx*L - GM*y/r, vy*L - GM*x/r)
`;
const RATE = t`
def rate(lam, rtol=1e-12, norb=10, n=200):
    """Perihelion advance in arcseconds per century, from orbit-averaged LRL angles."""
    tt = np.linspace(0, norb * P, norb * n, endpoint=False)
    sol = solve_ivp(rhs, (0, norb * P), start, args=(lam,), t_eval=tt,
                    method="DOP853", rtol=rtol, atol=rtol * 1e-3)
    w = np.unwrap(lrl_angle(sol.y)).reshape(norb, n).mean(axis=1)
    return np.polyfit(np.arange(norb) * P, w, 1)[0] * 36525 * 206264.806
`;
const EXPLORE = PRELUDE + LRL + RATE + t`
print(f"null test (Newton only): {rate(0):.4f} arcsec/century")
lams = np.array([100, 300, 1000, 3000])
per = np.array([rate(l) / l for l in lams])
for l, p in zip(lams, per):
    print(f"lambda = {l:5d}: advance / lambda = {p:.4f} arcsec/century")
slope, icept = np.polyfit(lams, per, 1)
print(f"extrapolated to lambda = 0: {icept:.4f} arcsec/century")
print(f"formula 6 pi GM / (c^2 a (1 - e^2)): {6*np.pi*GM/(C*C*a*(1-e*e)) * 36525/P * 206264.806:.4f}")

import atlas.plot as plt
plt.scatter(lams, per, label="simulation")
plt.plot([0, 3000], [icept, icept + 3000 * slope], label="straight-line fit")
plt.xlabel("exaggeration factor lambda"); plt.ylabel("advance / lambda (arcsec per century)"); plt.legend(); plt.show()
`;

export default lesson({
  id: 'research.P.4',
  title: 'Mercury’s perihelion by numerical integration',
  minutes: 25, difficulty: 3,
  intro: t`**The question.** Mercury’s perihelion turns about $5600''$ per century as seen from Earth. Clemence’s 1947 tally explained all but about $43''$ of it: roughly $5025''$ from the precession of Earth’s equinoxes and $532''$ from the other planets’ pull. General relativity predicts $42.98''$ for the rest. Can a simulation of the Sun’s gravity alone, plus the relativistic correction, reproduce that number — and how do we know it measures physics, not the integrator?

This is the project [Scoping a project](#/lesson/research.R3.2) planned. The model is Newton’s law plus the leading general-relativistic term, multiplied by an exaggeration factor $\lambda$ ($\lambda = 1$ is general relativity):

$$\ddot{\vec r} = -\frac{GM}{r^3}\,\vec r\left[1 + \lambda\,\frac{3L^2}{c^2 r^2}\right]$$

[The geodesic lab](#/lesson/st-f.F14.2) measured the same effect from the orbit equation with a fixed-step integrator; here the route is Cartesian coordinates, an adaptive solver and the Laplace–Runge–Lenz vector.`,
  symbols: [
    { tex: '\\vec r', text: 'Mercury’s position relative to the Sun, in AU' },
    { tex: 'GM', text: t`the Sun’s gravitational parameter, $2.959\times10^{-4}\ \text{AU}^3/\text{day}^2$` },
    { tex: 'L', text: t`the orbital angular momentum per unit mass, $|\vec r \times \dot{\vec r}|$, in $\text{AU}^2$/day` },
    { tex: 'c', text: 'the speed of light, 173.14 AU/day' },
    { tex: '\\lambda', text: 'an exaggeration factor on the relativistic term: 0 is pure Newton, 1 is general relativity' },
  ],
  why: t`The 43″ was the first anomaly general relativity explained, and “how do I know my simulation is right?” is the question every computational project must answer.`,
  visual: {
    type: 'code-runner',
    title: 'Measure the advance',
    lead: t`Run it (a few seconds). First a **null test**: pure Newton must give no advance. Then the relativistic term exaggerated by $\lambda = 100$ to $3000$, the advance divided by $\lambda$, and a straight line back to $\lambda = 0$.`,
    tasks: ['Read the null test: 0.0008″ per century is the integrator’s own drift — far below 43″.', 'Change `rtol=1e-12` to `rtol=1e-8` in `rate()` and rerun: the null test reports about 5″ of fake precession.', 'Compare the extrapolated value with the formula on the last line.'],
    params: { code: EXPLORE, rows: 20 },
    caption: 'The Sun alone plus the leading relativistic term: no planets, no solar oblateness, no Earth-based reference frame. Initial conditions are Newtonian perihelion values.',
  },
  example: {
    prompt: t`Write the mini-paper’s results: the null test, the exaggeration series, the extrapolated advance, and the comparison with $42.98''$ per century.`,
    visual: lamPic('The advance divided by λ (gold, from the Explore) is a straight line in λ; its intercept (dashed) lands on the formula (green).'),
    steps: [
      { label: 'Measure the turning', text: t`For a pure inverse-square orbit the Laplace–Runge–Lenz vector $\dot{\vec r}\times\vec L - GM\hat r$ is constant and points at perihelion; with the extra term it turns. Its angle is read at 200 times per orbit and **averaged over each orbit** — a straight fit to the raw angle gives 42.22, biased by the vector’s wobble within each orbit.` },
      { label: 'Null test', text: t`With $\lambda = 0$ the advance must vanish. At $\text{rtol} = 10^{-12}$ the solver’s own drift is $0.0008''$ per century: 0.002% of the signal.` },
      { label: 'Exaggerate', text: t`For $\lambda = 100, 300, 1000, 3000$ the advance divided by $\lambda$ is $${PER.map((p) => p[1]).join(',\\ ')}''$. Nearly constant: the effect is linear in $\lambda$, with a small $\lambda^2$ term.` },
      { label: 'Extrapolate', text: t`A straight line through those four points meets $\lambda = 0$ at $${FORMULA}''$ per century; the formula $6\pi GM/(c^2a(1-e^2))$ per orbit gives $${FORMULA}''$.` },
      { label: 'Compare', text: t`Will (2014) quotes $42.98''$: reproduced to all four figures. What the simulation does **not** test is the other $5557''$: planets and the reference frame were left out on purpose.` },
    ],
    answer: t`Null test $0.0008''$/century; extrapolated GR advance $${FORMULA}''$/century, matching the formula and the published $42.98''$.`,
  },
  practice: [
    num({
      id: 'slope-units', difficulty: 2,
      gen(r) {
        const lam = r.pick([100, 300, 1000]), per = PER.find((p) => p[0] === lam)[1];
        const slope = per * lam / (36525 * ARC);                 // rad/day
        const sR = +slope.toPrecision(4), ans = sR * 36525 * ARC;
        return {
          prompt: t`With $\lambda = ${lam}$ the Laplace–Runge–Lenz angle grows at $${sci(sR, 4)}$ rad per day. What is that in arcseconds per Julian century (36 525 days)?`,
          visual: orbitPic('An exaggerated precessing orbit: the perihelion direction turns steadily.'),
          answer: ans, units: 'arcsec', tol: { rel: 0.002 },
          errors: [{ value: sR * 36525 * 180 / Math.PI, feedback: 'That is degrees; one degree is 3600 arcseconds.' }, { value: sR * 36500 * ARC * 1.0, feedback: 'A Julian century is 36 525 days, not 36 500.' }].filter((x) => Math.abs(x.value - ans) > 0.002 * ans),
          hints: ['Multiply by days per century, then by 206 265 arcseconds per radian.'],
          teach: 'Convert the measured rate into the units the literature quotes before comparing.',
          explain: t`$${sci(sR, 4)} \times 36\,525 \times 206\,265 = ${ans.toFixed(0)}''$ per century, or $${(ans / lam).toFixed(3)}''$ per unit of $\lambda$.`,
        };
      },
    }),
    code({
      id: 'lrl', difficulty: 3,
      prompt: t`Write \`lrl_angle(s)\` for a state \`s = (x, y, vx, vy)\`: the angle of the Laplace–Runge–Lenz vector $\vec A = \dot{\vec r}\times\vec L - GM\,\hat r$. In the plane, with $L = x v_y - y v_x$, its components are $A_x = v_y L - GMx/r$ and $A_y = -v_x L - GMy/r$. Return \`np.arctan2(Ay, Ax)\`.`,
      starter: PRELUDE + t`
def lrl_angle(s):
    pass

print(lrl_angle(start))
`,
      answer: PRELUDE + LRL + t`
print(lrl_angle(start))
`,
      tests: [
        { name: 'at perihelion on the x-axis it points along x', code: 'abs(lrl_angle(start)) < 1e-12' },
        { name: 'at aphelion of the same orbit it still points at perihelion', code: 'abs(lrl_angle([-a * (1 + e), 0, 0, -np.sqrt(GM * (1 - e) / (a * (1 + e)))])) < 1e-9' },
        { name: 'rotating the orbit by 0.3 rad rotates it by 0.3 rad', code: 'abs(lrl_angle([start[0] * np.cos(0.3), start[0] * np.sin(0.3), -start[3] * np.sin(0.3), start[3] * np.cos(0.3)]) - 0.3) < 1e-12' },
      ],
      hints: ['Unpack `x, y, vx, vy = s`, then `L = x*vy - y*vx` and `r = np.hypot(x, y)`.', '`return np.arctan2(-vx*L - GM*y/r, vy*L - GM*x/r)`'],
      teach: 'For an inverse-square orbit the Laplace–Runge–Lenz vector is constant and points at perihelion, so its turning is the precession — measured at every step, not only at perihelion.',
      explain: t`At perihelion and aphelion alike the vector points along $+x$: it is a conserved quantity of the Kepler problem. Any extra force that is not inverse-square makes it turn, and its rate of turning is the precession.`,
    }),
    mcq({
      id: 'average', difficulty: 3,
      prompt: t`A straight-line fit to the raw Laplace–Runge–Lenz angle, sampled 40 times per orbit over 10 orbits, gives $42.22''$ per century per unit $\lambda$. Averaging the angle over each orbit first gives $42.98''$. Which is right, and why?`,
      visual: orbitPic('With the extra force the perihelion direction turns on average, but wobbles within each orbit.'),
      choices: ['42.98: the osculating vector wobbles within each orbit, and a fit over a few orbits picks up part of that wobble as a trend; averaging over whole orbits removes it', '42.22: more samples always give a better answer', 'Both: the difference is round-off', '42.22: averaging throws information away'],
      answer: 0,
      why: { 1: 'All 40 samples per orbit carry the same periodic wobble; more of them does not average it away within a fit over few orbits.', 2: 'Round-off at this tolerance is 0.0008″: four hundred times smaller than the difference.', 3: 'Averaging over one full period removes only the periodic part — exactly the part that is not precession.' },
      hints: ['The extra force speeds the vector’s turning near perihelion and slows it near aphelion.', 'Does the wobble cancel in a straight-line fit over only ten orbits?'],
      teach: 'A secular rate should be fitted to quantities averaged over whole periods, or a periodic wobble biases it.',
      explain: 'Within each orbit the vector turns fastest near perihelion. A regression line through the raw points tilts toward that pattern by an amount that falls only as 1/(number of orbits). Orbit averages (or values read at each perihelion) agree with the formula to 0.003%.',
    }),
    code({
      id: 'null-test', difficulty: 2,
      prompt: t`Run the **null test** at several tolerances: for each \`rtol\` in \`[1e-6, 1e-8, 1e-10, 1e-12]\`, compute \`rate(0, rtol=rtol)\` (pure Newton, which should give zero). Set \`rtol_ok\` to the **largest** tolerance whose spurious advance is below 1% of the $43''$ signal, that is below $0.43''$ per century.`,
      starter: PRELUDE + LRL + RATE + t`
rtol_ok = None
print(rtol_ok)
`,
      answer: PRELUDE + LRL + RATE + t`
spurious = {rt: abs(rate(0, rtol=rt)) for rt in [1e-6, 1e-8, 1e-10, 1e-12]}
rtol_ok = max(rt for rt, v in spurious.items() if v < 0.43)
print(spurious, rtol_ok)
`,
      tests: [
        { name: 'rtol = 10⁻¹⁰ is the loosest tolerance that passes', code: 'rtol_ok == 1e-10' },
      ],
      hints: ['Loop over the four tolerances and keep those whose |rate(0, rtol=…)| is below 0.43.', '`max(...)` of the passing tolerances is the loosest one.'],
      teach: 'A null test — the effect switched off — measures the method’s own error floor before you trust any signal.',
      explain: t`Newton alone gives $36''$, $4.7''$, $0.074''$ and $0.0008''$ per century of fake precession at the four tolerances. Only from $10^{-10}$ is the floor below 1% of the signal; the Explore uses $10^{-12}$ for margin.`,
    }),
    num({
      id: 'extrapolate', difficulty: 2,
      gen(r) {
        const [i, j] = r.pick([[0, 2], [0, 3], [1, 3], [1, 2]]);
        const [l1, p1] = PER[i], [l2, p2] = PER[j];
        const ans = p1 - (p2 - p1) / (l2 - l1) * l1;
        return {
          prompt: t`The advance divided by $\lambda$ is $${p1}''$ per century at $\lambda = ${l1}$ and $${p2}''$ at $\lambda = ${l2}$. Assuming it is a straight line in $\lambda$, what is it at $\lambda = 0$ — the general-relativistic value?`,
          visual: lamPic('The four simulated points; the line through them is what you extrapolate.', { fit: false }),
          answer: ans, units: 'arcsec', tol: { rel: 2e-5 },
          errors: [{ value: p1, feedback: 'That is the value at the smallest λ given; extrapolate the line all the way to λ = 0.' }, { value: (p1 + p2) / 2, feedback: 'An average is not an extrapolation: follow the slope back to λ = 0.' }],
          hints: [t`Slope $= (${p2} - ${p1})/(${l2} - ${l1})$.`, t`Intercept $= ${p1} - \text{slope}\times${l1}$.`],
          teach: 'Exaggerate an effect until it is easy to measure, check that it scales as expected, and extrapolate back to the real value.',
          explain: t`Slope $= ${sci((p2 - p1) / (l2 - l1), 3)}$ per unit $\lambda$, so the intercept is $${ans.toFixed(4)}''$ — the formula’s $${FORMULA}''$ within the rounding of the inputs.`,
        };
      },
    }),
    mcq({
      id: 'budget', difficulty: 2,
      prompt: t`A classmate objects: “Mercury’s perihelion moves about $5600''$ per century. Your simulation gives $43''$. It is off by a factor of 130.” What is the answer?`,
      visual: { type: 'graph', params: { x: [0, 6000], y: [0, 4], aspect: 'wide', axesAt: 'edge', xlabel: 'arcseconds per century', ylabel: '', yticks: 0, xticks: 6, shade: [{ fn: '3.6', lower: '3.0', from: 0, to: 5025, color: 'violet', alpha: 0.5 }, { fn: '2.4', lower: '1.8', from: 5025, to: 5557, color: 'accent', alpha: 0.5 }, { fn: '1.2', lower: '0.6', from: 5557, to: 5600, color: 'gold', alpha: 0.8 }], points: [{ x: 100, y: 3.3, r: 0, label: 'precession of Earth’s equinoxes ≈ 5025', color: 'ink', labelDx: 0, labelDy: 0 }, { x: 5000, y: 2.1, r: 0, label: 'other planets ≈ 532', color: 'ink', labelAlign: 'right', labelDx: -8, labelDy: 0 }, { x: 5540, y: 0.9, r: 0, label: 'left over ≈ 43', color: 'ink', labelAlign: 'right', labelDx: -8, labelDy: 0 }] }, caption: 'Clemence’s 1947 budget, rounded: the observed advance relative to Earth’s equinox, split into its causes.' },
      choices: ['The 5600″ is measured against Earth’s precessing equinox and includes the planets’ pull; the simulation models only the Sun plus relativity, so it targets the 43″ left over', 'The simulation is wrong and needs a smaller tolerance', 'λ should be 130', 'The 5600″ is an old, unreliable measurement'],
      answer: 0,
      why: { 1: 'The null test already shows the integrator floor is 0.0008″; tolerance cannot make up 5500″.', 2: 'λ = 1 is general relativity; tuning it to match a number defeats the test.', 3: 'Modern measurements agree; the point is what the number contains.' },
      hints: ['What does the observed number include that the model leaves out?'],
      teach: 'Compare like with like: a model that leaves out effects must be compared with the residual after those effects are removed.',
      explain: 'About 5025″ is the precession of the equinoxes (a property of Earth’s reference frame) and about 532″ is planetary perturbations; GR accounts for the remaining ≈ 43″. A simulation that included the planets — an N-body extension — would test the 532″ as well.',
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-extrap', difficulty: 3,
      prompt: t`Compute \`per\`, the advance divided by $\lambda$, for $\lambda$ in \`[100, 300, 1000]\` with \`rate\`, fit a straight line to \`per\` against $\lambda$ with \`np.polyfit\`, and set \`gr_advance\` to its value at $\lambda = 0$.`,
      starter: PRELUDE + LRL + RATE + t`
lams = np.array([100, 300, 1000])
gr_advance = None
print(gr_advance)
`,
      answer: PRELUDE + LRL + RATE + t`
lams = np.array([100, 300, 1000])
per = np.array([rate(l) / l for l in lams])
slope, gr_advance = np.polyfit(lams, per, 1)
print(per, gr_advance)
`,
      tests: [
        { name: 'the extrapolated advance is 42.981″ per century', code: 'gr_advance is not None and abs(gr_advance - 42.9807) < 0.001' },
        { name: 'it reproduces the published 42.98″', code: 'gr_advance is not None and round(gr_advance, 2) == 42.98' },
      ],
      hints: ['`per = np.array([rate(l) / l for l in lams])`', '`np.polyfit(lams, per, 1)` returns (slope, intercept); the intercept is the value at λ = 0.'],
      teach: 'Exaggerate, check linearity, extrapolate: a fallback that turns an impossibly small signal into a robust one.',
      explain: t`The intercept is $42.981''$ per century. At $\text{rtol} = 10^{-12}$ the direct $\lambda = 1$ run also works (it gives 42.982, with the 0.0008 floor inside it) — but the extrapolation stays robust even with a looser solver, which is why R3.2 planned it.`,
    }),
    num({
      id: 'cp-satellite', difficulty: 3, transfer: true,
      gen(r) {
        const [name, h] = r.pick([['a geodetic satellite at 5 900 km altitude', 5.9e6], ['a GPS satellite at 20 200 km altitude', 2.02e7], ['a satellite at 1 000 km altitude', 1.0e6]]);
        const GME = 3.986004418e14, RE = 6.3781e6, aS = RE + h;
        const dphi = 6 * Math.PI * GME / (CSI * CSI * aS);              // rad per orbit, circular-ish (e ≈ 0)
        const T = 2 * Math.PI * Math.sqrt(aS ** 3 / GME), perYear = 365.25 * 86400 / T;
        const ans = dphi * perYear * ARC * 1000;                        // milliarcseconds per year
        return {
          prompt: t`The same relativistic term turns the orbit of ${name} around Earth ($GM_\oplus = 3.986\times10^{14}\ \text{m}^3\text{s}^{-2}$, Earth’s radius 6378 km, nearly circular orbit, so take $e = 0$). Using $\Delta\phi = 6\pi GM/(c^2 a)$ per orbit, how many **milliarcseconds per year** does its perigee advance?`,
          visual: orbitPic('An exaggerated precessing orbit. Around Earth the effect is a few hundred to a few thousand milliarcseconds per year.', 0.006),
          answer: ans, units: 'mas', tol: { rel: 0.01 },
          errors: [{ value: dphi * ARC * 1000, feedback: 'That is per orbit; multiply by the number of orbits in a year.' }, { value: 6 * Math.PI * GME / (CSI * CSI * h) * perYear * ARC * 1000, feedback: 'a is measured from Earth’s centre: add Earth’s radius to the altitude.' }],
          hints: [t`$a = 6378\ \text{km} + $ altitude; the period is $2\pi\sqrt{a^3/GM}$.`, t`Per year: $\Delta\phi \times (365.25\ \text{days} / \text{period})$, then convert radians to milliarcseconds ($\times 2.063\times10^{8}$).`],
          teach: 'One formula, two scales: Mercury’s perihelion gains 43″ a century, while a close Earth satellite’s perigee gains arcseconds a year — Earth’s weaker pull is outweighed by the far smaller orbit and thousands of orbits a year.',
          explain: t`$a = ${(aS / 1e3).toFixed(0)}$ km, $\Delta\phi = ${sci(dphi, 3)}$ rad per orbit, ${perYear.toFixed(0)} orbits a year: $${ans.toFixed(0)}$ mas per year. Laser ranging to the LAGEOS satellites has measured perigee advances of this kind.`,
        };
      },
    }),
    mcq({
      id: 'cp-trust', difficulty: 2,
      prompt: 'A referee asks: “How do you know your 42.98″ comes from the physics and not from the integrator?” Which answer is strongest?',
      visual: nullPic('The null test: Newton-only “precession” against solver tolerance (red), against the 43″ signal (green) and 1% of it (gold). Log axes.'),
      choices: ['The Newton-only null test gives 0.0008″ per century at the tolerance used; the advance scales linearly with λ as the physics requires; and the extrapolated value matches the analytic formula to four decimal places', 'The answer matches the published value', 'DOP853 is a high-order, well-tested integrator', 'We used a very small tolerance'],
      answer: 0,
      why: { 1: 'Agreement alone could be luck or tuning; the referee asks how you know.', 2: 'A good method can still be misused; only tests on this problem show it worked here.', 3: 'Small compared with what? The null test is what makes “small” a number.' },
      hints: ['What tests would fail if the integrator were the cause?'],
      teach: 'Trust in a simulation comes from tests that could have failed: null tests, scaling checks and analytic limits.',
      explain: 'Each test could have failed: fake precession in the null test, a non-linear λ dependence, or a mismatch with the formula. Passing all three is evidence; matching the published number is the conclusion, not the proof.',
    }),
  ],
  sources: [SRC2.will, SRC2.clemence, { label: 'SciPy documentation: scipy.integrate.solve_ivp (DOP853)', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html' }, { label: 'NASA Goddard Space Flight Center, Mercury Fact Sheet (orbital elements)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html' }],
});
