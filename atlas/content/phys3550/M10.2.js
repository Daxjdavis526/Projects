// Sensitive dependence and Lyapunov exponents (Taylor §12.6–12.7; Strogatz
// §9.3, §10.5): two starts Δφ₀ apart separate as |Δφ| ≈ |Δφ₀|e^{λt} until
// the gap is as large as the attractor. λ > 0: chaos (Taylor's pendulum at
// γ = 1.105, λ ≈ 0.72 s⁻¹); λ < 0: a periodic attractor (γ = 0.9, where the
// gap shrinks at −β). The slope of ln|Δφ| against t estimates λ; the
// prediction horizon t = ln(Δ_tol/Δφ₀)/λ grows only logarithmically with
// precision. Coding exercise: fit λ to the separation of two RK4 pendulums.
// Transfer: the inner Solar System's Lyapunov time (≈ 5 Myr, Laskar 1989),
// and Lorenz's weather model. Numbers from model/cm5-chaos.js.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { K, sci, gpic, distinct, pendPic, logPic } from './_cm5.js';
import { sepFit } from '../../src/viz/sims/cm5-pendulum.js';

const t = String.raw;

// the worked example: γ = 1.105, two starts 10⁻⁴ rad apart
const EX = (() => {
  const d0 = 1e-4, sep = K.separation({ gamma: 1.105 }, undefined, d0, { periods: 20, spp: 200, every: 10 });
  const fit = sepFit(sep), lam = K.lyapunov({ gamma: 1.105 }, undefined, { skip: 60, periods: 600, spp: 100 });
  const lamP = K.lyapunov({ gamma: 0.9 }, undefined, { skip: 60, periods: 200, spp: 100 });
  const h1 = Math.log(0.1 / d0) / lam, h2 = Math.log(0.1 / 1e-8) / lam;
  return { d0, fit, lam, lamP, h1, h2, t1: 2, t2: 10 };
})();
const L105 = EX.lam;

/** ln|Δφ| against t as a straight line through two marked readings. */
function lnPic(t1, l1, t2, l2, caption, { labels = true } = {}) {
  const m = (l2 - l1) / (t2 - t1), c = l1 - m * t1;
  const lo = Math.floor(Math.min(l1, l2) - 2), hi = Math.ceil(Math.max(l1, l2) + 2);
  return gpic({
    x: [0, Math.ceil(t2 * 1.25)], y: [lo, hi], axesAt: 'edge', xlabel: 't (s)', ylabel: 'ln |Δφ|',
    curves: [{ fn: `${+c.toPrecision(6)} + ${+m.toPrecision(6)}*x`, color: 'accent', width: 2.2 }],
    points: [{ x: t1, y: +l1.toPrecision(6), color: 'gold', r: 5, label: labels ? 'P' : '' }, { x: t2, y: +l2.toPrecision(6), color: 'gold', r: 5, label: labels ? 'Q' : '' }],
  }, caption, 'A straight line of log separation against time through two marked readings');
}

export default lesson({
  id: 'phys3550.M10.2',
  title: 'Sensitive dependence and Lyapunov exponents',
  minutes: 18, difficulty: 3,
  intro: t`Start two identical driven pendulums a hair apart — $10^{-4}$ rad, a twentieth of a degree. On a periodic attractor the gap shrinks and both settle into the same motion. In the chaotic regime it **grows exponentially**, doubling again and again, until the two pendulums are doing unrelated things. The growth rate $\lambda$ is the **Lyapunov exponent**, and its sign is the working definition of chaos: $\lambda > 0$ means sensitive dependence on initial conditions. Plot $\ln|\Delta\phi|$ against $t$ and exponential growth becomes a straight line whose slope is $\lambda$. That straight line is also a sentence of doom for long-range prediction: each factor of 10 of extra precision buys only a fixed $\ln 10/\lambda$ of extra time.`,
  equation: t`|\Delta\phi(t)| \approx |\Delta\phi_0|\,e^{\lambda t} \quad\Longleftrightarrow\quad \ln|\Delta\phi(t)| \approx \ln|\Delta\phi_0| + \lambda t`,
  symbols: [
    { tex: '\\Delta\\phi(t)', text: 'the difference between the two pendulums’ angles at time $t$, in rad' },
    { tex: '\\Delta\\phi_0', text: 'the starting difference, in rad' },
    { tex: '\\lambda', text: 'the (largest) **Lyapunov exponent**, in $\\text{s}^{-1}$: positive for chaos, negative on a periodic attractor; $1/\\lambda$ is the **Lyapunov time**' },
    { tex: 't', text: 'time, in s; the law holds only while $\\Delta\\phi$ is small compared with the size of the attractor' },
  ],
  why: t`Lyapunov exponents set how far ahead anything chaotic can be forecast — the weather (about two weeks), the planets (tens of millions of years) — and how precisely a spacecraft's trajectory near a chaotic region must be known.`,
  visual: {
    type: 'cm5-pendulum',
    title: 'Two pendulums, a hair apart',
    lead: t`Two of Taylor's pendulums (blue and orange) started $\Delta\phi_0$ apart, and below them $\ln|\Delta\phi|$ against $t$ with its least-squares line (gold, dashed) through the part before the gap saturates. The readouts compare the line's slope with $\lambda$ computed by a more careful method (renormalizing a tiny separation every period, over 240 periods).`,
    tasks: [
      t`At $\gamma = 1.105$ the two agree for about ten seconds, then part. $\ln|\Delta\phi|$ climbs on a wobbly straight line with slope about $0.7\ \text{s}^{-1}$.`,
      t`Change $\Delta\phi_0$ from $10^{-4}$ to $10^{-6}$ rad: 100 times more precision, but the pendulums part only about $\ln 100/\lambda \approx 6$ s later.`,
      t`Set $\gamma = 0.9$: the gap shrinks to round-off within seconds ($\lambda < 0$). Try $\gamma = 1.06$, close to the first doubling: it still shrinks, but slowly.`,
    ],
    params: { gamma: 1.105, two: true, d0: 1e-4, panels: ['swing', 'time', 'sep'], periods: 20, controls: ['gamma', 'd0'], gRange: [0.9, 1.11], readouts: ['gamma', 'fit', 'lambda'] },
    caption: t`Taylor's pendulum (drive period 1 s, $\omega_0 = 1.5\omega$, $\beta = \omega_0/4$), RK4 at 200 steps per period. The gap is a difference of unwrapped angles. It cannot grow beyond a few radians, so the line is fitted only while $|\Delta\phi| < 0.1$ rad (and above round-off, $10^{-13}$).`,
  },
  example: {
    prompt: t`Two of Taylor's pendulums at $\gamma = 1.105$ start at $\phi = -\pi/2$ and $-\pi/2 + 10^{-4}$, both at rest. Estimate $\lambda$ from the separation, then say how long the motion stays predictable to $0.1$ rad, and how much longer if the start were known to $10^{-8}$ rad.`,
    visual: pendPic({ gamma: 1.105, d0: 1e-4, panels: ['sep'], periods: 20 }, t`$\ln|\Delta\phi|$ for the two pendulums (blue) and the least-squares line through it before saturation (gold, dashed). The dotted line marks $\Delta\phi = \pi$.`),
    steps: [
      { label: 'Plot the log', text: t`If $|\Delta\phi| = |\Delta\phi_0|e^{\lambda t}$, then $\ln|\Delta\phi| = \ln|\Delta\phi_0| + \lambda t$: a straight line of slope $\lambda$. The real curve wobbles about it, because the stretching happens unevenly through each drive period.` },
      { label: 'Fit', text: t`A least-squares line through $\ln|\Delta\phi|$ from $t = 0$ until $|\Delta\phi|$ first reaches $0.1$ rad has slope $${sci(EX.fit.m, 3)}\ \text{s}^{-1}$ and intercept $${sci(EX.fit.c, 3)}$.` },
      { label: 'Check', text: t`A more careful estimate (follow a tiny separation for 600 periods, rescaling it every period so it never saturates, and average the log growth) gives $\lambda = ${sci(EX.lam, 3)}\ \text{s}^{-1}$. The fit is good to about ${Math.round((100 * Math.abs(EX.fit.m - EX.lam)) / EX.lam)}%. The intercept lies below $\ln 10^{-4} = -9.21$: at first the gap shrinks, until it lines up with the direction the flow stretches.` },
      { label: 'Horizon', text: t`The gap reaches $0.1$ rad when $e^{\lambda t} = 0.1/10^{-4}$: $t = \ln(10^3)/\lambda = ${sci(EX.h1, 3)}$ s.` },
      { label: 'More precision', text: t`From $10^{-8}$ rad: $t = \ln(10^7)/\lambda = ${sci(EX.h2, 3)}$ s. Ten thousand times the precision buys only $\ln(10^4)/\lambda = ${sci(EX.h2 - EX.h1, 3)}$ s more.` },
    ],
    answer: t`$\lambda \approx ${sci(EX.fit.m, 2)}\ \text{s}^{-1}$ from the fit ($${sci(EX.lam, 3)}\ \text{s}^{-1}$ carefully); predictable to $0.1$ rad for about $${sci(EX.h1, 2)}$ s, or $${sci(EX.h2, 2)}$ s with a start known to $10^{-8}$ rad.`,
  },
  practice: [
    num({
      id: 'two-readings', difficulty: 2,
      gen(r) {
        const lam = r.pick([0.3, 0.5, 0.8, 1.2]), t1 = r.pick([1, 2, 3]), t2 = t1 + r.pick([5, 6, 8]), d1 = r.pick([2e-6, 5e-6, 1e-5]);
        const d2 = +(d1 * Math.exp(lam * (t2 - t1))).toPrecision(2), key = Math.log(d2 / d1) / (t2 - t1);
        return {
          prompt: t`Two runs of a chaotic system differ by $|\Delta x| = ${sci(d1, 2)}$ m at $t = ${t1}$ s (point P) and by $${sci(d2, 2)}$ m at $t = ${t2}$ s (point Q). Assuming exponential growth between them, what is the Lyapunov exponent?`,
          answer: key, units: 's^-1', tol: { rel: 0.01 },
          errors: distinct([{ value: Math.log10(d2 / d1) / (t2 - t1), feedback: t`Use the natural logarithm: $\lambda = \ln(\Delta_2/\Delta_1)/(t_2 - t_1)$. $\log_{10}$ gives a rate per factor of 10, smaller by $\ln 10$.` }, { value: (d2 / d1) / (t2 - t1), feedback: t`The ratio grows exponentially, not linearly: take its logarithm before dividing by the time.` }, { value: Math.log(d2 / d1) / t2, feedback: t`Divide by the time *between* the readings, $t_2 - t_1$.` }], key),
          hints: [t`$\Delta_2/\Delta_1 = e^{\lambda(t_2 - t_1)}$.`, t`$\lambda = \ln(\Delta_2/\Delta_1)/(t_2 - t_1)$.`],
          teach: t`The Lyapunov exponent is the slope of $\ln|\Delta|$ against time.`,
          explain: t`$\lambda = \ln(${sci(d2, 2)}/${sci(d1, 2)})/(${t2} - ${t1}) = ${sci(Math.log(d2 / d1), 3)}/${t2 - t1} = ${sci(key, 3)}\ \text{s}^{-1}$: the gap grows by a factor $e$ every $${sci(1 / key, 3)}$ s.`,
          visual: lnPic(t1, Math.log(d1), t2, Math.log(d2), t`$\ln|\Delta x|$ against time: the readings P and Q on a straight line (natural log of the gap in metres; idealized — real data wobble about the line).`),
        };
      },
    }),
    num({
      id: 'horizon', difficulty: 2,
      gen(r) {
        const lam = r.pick([0.25, 0.5, 0.72, 1.1]), d0 = r.pick([1e-3, 1e-5, 1e-7]), tol = r.pick([0.1, 0.5]);
        const key = Math.log(tol / d0) / lam;
        return {
          prompt: t`A chaotic pendulum has $\lambda = ${lam}\ \text{s}^{-1}$. Its starting angle is known to within $${sci(d0, 1)}$ rad. For how long can its angle be predicted to within $${tol}$ rad?`,
          answer: key, units: 's', tol: { rel: 0.01 },
          errors: distinct([{ value: (tol / d0) / lam, feedback: t`The growth is exponential: solve $e^{\lambda t} = ${tol}/${sci(d0, 1)}$ with a logarithm.` }, { value: Math.log10(tol / d0) / lam, feedback: t`Use $\ln$, the natural logarithm, since the growth is $e^{\lambda t}$.` }, { value: 1 / lam, feedback: t`$1/\lambda$ is the Lyapunov time, one factor of $e$. The horizon is $\ln(\text{tolerance}/\Delta\phi_0)$ Lyapunov times.` }], key),
          hints: [t`Set $\Delta\phi_0e^{\lambda t}$ equal to the tolerance.`, t`$t = \ln(\text{tolerance}/\Delta\phi_0)/\lambda$.`],
          teach: t`The prediction horizon is the Lyapunov time multiplied by the log of how much the error may grow.`,
          explain: t`$t = \ln(${tol}/${sci(d0, 1)})/${lam} = ${sci(Math.log(tol / d0), 3)}/${lam} = ${sci(key, 3)}$ s, which is $${sci(Math.log(tol / d0), 3)}$ Lyapunov times.`,
          visual: lnPic(0, Math.log(d0), Math.min(60, key) * 0.6, Math.log(d0) + lam * Math.min(60, key) * 0.6, t`The error's logarithm grows on a straight line of slope $\lambda$ (idealized). Where it reaches the tolerance is the horizon.`, { labels: false }),
        };
      },
    }),
    num({
      id: 'buy-time', difficulty: 3,
      gen(r) {
        const lam = r.pick([0.4, 0.72, 1.5]), k = r.pick([2, 3, 6]);
        const key = (k * Math.LN10) / lam;
        return {
          prompt: t`A chaotic system has $\lambda = ${lam}\ \text{s}^{-1}$. An engineer improves the measurement of its starting state by a factor of $10^{${k}}$. How many seconds longer does a forecast stay within the same tolerance?`,
          answer: key, units: 's', tol: { rel: 0.01 },
          errors: distinct([{ value: (Math.pow(10, k) - 1) / lam, feedback: t`The horizon depends on the *logarithm* of the precision: a factor $10^{${k}}$ adds $\ln 10^{${k}}/\lambda$.` }, { value: k / lam, feedback: t`$\ln 10^{${k}} = ${k}\ln 10$, not ${k}.` }], key),
          hints: [t`Horizon: $t = \ln(\text{tol}/\Delta_0)/\lambda$. What happens to it when $\Delta_0$ is divided by $10^{${k}}$?`, t`The extra time is $\ln(10^{${k}})/\lambda = ${k}\ln 10/\lambda$.`],
          teach: t`Exponential divergence means precision buys prediction time only logarithmically.`,
          explain: t`$\Delta t = ${k}\ln 10/${lam} = ${sci(key, 3)}$ s — the same however good the measurement already was. A millionfold improvement is only six times the gain of a tenfold one.`,
          visual: gpic({ x: [0, 20], y: [Math.floor(-6.6 - k * Math.LN10), 1], axesAt: 'edge', xlabel: 't (s)', ylabel: 'ln |Δ|', curves: [{ fn: `-4.6 + ${lam}*x`, color: 'accent', width: 2.2, label: 'today', labelAt: 2, labelDx: 6, labelDy: 14 }, { fn: `-4.6 - ${+(k * Math.LN10).toFixed(4)} + ${lam}*x`, color: 'warn', width: 2.2, dash: true, label: 'more precise', labelAt: 6, labelDx: 6, labelDy: 14 }], hlines: [{ y: -0.7, label: 'tolerance', color: 'ink3' }] }, t`Two error histories with the same slope $\lambda$: the more precise start (dashed) is shifted down by $\ln 10^{${k}}$, and so reaches the tolerance later by a fixed time (idealized straight lines).`, 'Two parallel rising lines of log error, one lower, crossing a tolerance line'),
        };
      },
    }),
    mcq({
      id: 'negative', difficulty: 2,
      prompt: t`At $\gamma = 0.9$ the same experiment gives the separation shown. What does it say?`,
      visual: pendPic({ gamma: 0.9, d0: 1e-4, panels: ['sep'], periods: 12 }, t`$\ln|\Delta\phi|$ for two of Taylor's pendulums at $\gamma = 0.9$ started $10^{-4}$ rad apart; the curve stops when the gap reaches round-off.`),
      choices: [t`$\lambda < 0$: nearby starts converge onto the same periodic motion, which is predictable for ever`, t`$\lambda > 0$, because the curve is a straight line`, t`The pendulums have stopped moving`, t`$\lambda = 0$: the gap stays the same`],
      answer: 0,
      why: { 1: t`A straight line is what an exponential looks like on a log plot either way; here it slopes **down**, so $\lambda < 0$.`, 2: t`The pendulums keep swinging; it is the *difference* between them that dies away.`, 3: t`The gap falls from $10^{-4}$ to round-off in about ten seconds: it does not stay the same.` },
      hints: [t`Is the slope of $\ln|\Delta\phi|$ positive or negative?`],
      teach: t`A negative Lyapunov exponent means a stable attractor: errors die away and the motion is predictable.`,
      explain: t`The slope is about $${sci(EX.lamP, 2)}\ \text{s}^{-1}$ — the damping rate $-\beta$: the period-1 motion is a stable attractor, so any small disturbance dies out and the long-run motion forgets its start. Chaos needs $\lambda > 0$.`,
    }),
    mcq({
      id: 'bounded', difficulty: 3,
      prompt: t`At $\gamma = 1.105$, with $\lambda \approx ${sci(L105, 2)}\ \text{s}^{-1}$, a student extrapolates $|\Delta\phi| = 10^{-4}e^{\lambda t}$ to $t = 60$ s and gets about $${sci(1e-4 * Math.exp(L105 * 60), 2)}$ rad. What is wrong?`,
      visual: pendPic({ gamma: 1.105, d0: 1e-4, panels: ['sep'], periods: 30 }, t`$\ln|\Delta\phi|$ over 30 s for two pendulums at $\gamma = 1.105$ started $10^{-4}$ rad apart. The dotted line marks $\Delta\phi = \pi$.`),
      choices: [t`The exponential law holds only while the gap is small; once it is as big as the attractor (a few rad) it stops growing and just fluctuates`, t`Nothing: the pendulums really are that far apart`, t`$\lambda$ must be measured in rad/s, so the units are wrong`, t`The gap grows linearly after the first few seconds`],
      answer: 0,
      why: { 1: t`Both pendulums stay on the same bounded attractor, so their angles cannot differ by more than a few radians (here they never pass about $3.4$ rad from the bottom).`, 2: t`$\lambda$ has units of 1/s; the exponent $\lambda t$ is dimensionless, as it should be.`, 3: t`It saturates: it stops growing on average once it reaches the attractor's size, then wanders.` },
      hints: [t`Look at the curve after about 15 s.`, t`Can two pendulums on the same attractor be further apart than the attractor is wide?`],
      teach: t`Exponential separation is a small-gap law: on a bounded attractor the gap saturates at the attractor's size.`,
      explain: t`Linearization — "small differences grow at rate $\lambda$" — is valid only while the gap is small. Chaos combines **stretching** (the exponential) with **folding** (keeping everything bounded); after about 15 s the two pendulums are simply uncorrelated motions on the same attractor.`,
    }),
    code({
      id: 'fit-lambda', difficulty: 3,
      prompt: t`The program below integrates two of Taylor's pendulums at $\gamma = 1.105$, started $10^{-4}$ rad apart, with RK4. Write \`lyapunov_slope(t, d)\`: keep the points from the start up to (not including) the first one where the gap \`d\` reaches \`0.1\`, fit a straight line to $\ln d$ against $t$ with \`np.polyfit\`, and **return** its slope. The program then prints your estimate of $\lambda$.`,
      starter: t`import math
import numpy as np

W = 2 * math.pi; W0 = 1.5 * W; B = W0 / 4      # Taylor's pendulum: drive period 1 s

def simulate(gamma, phi0, T=16.0, steps_per_period=200):
    """RK4 for phi'' + 2B phi' + W0^2 sin(phi) = gamma W0^2 cos(W t), from rest. Returns t, phi."""
    h = 1.0 / steps_per_period
    n = int(round(T / h))
    f = lambda tt, p, v: -2 * B * v - W0**2 * math.sin(p) + gamma * W0**2 * math.cos(W * tt)
    p, v = phi0, 0.0
    phi = [p]
    for i in range(n):
        tt = i * h
        k1p, k1v = v, f(tt, p, v)
        k2p, k2v = v + h/2 * k1v, f(tt + h/2, p + h/2 * k1p, v + h/2 * k1v)
        k3p, k3v = v + h/2 * k2v, f(tt + h/2, p + h/2 * k2p, v + h/2 * k2v)
        k4p, k4v = v + h * k3v, f(tt + h, p + h * k3p, v + h * k3v)
        p += h/6 * (k1p + 2*k2p + 2*k3p + k4p)
        v += h/6 * (k1v + 2*k2v + 2*k3v + k4v)
        phi.append(p)
    return np.arange(n + 1) * h, np.array(phi)

def lyapunov_slope(t, d, hi=0.1):
    # keep t[:k], d[:k] where k is the first index with d >= hi (or all points if none)
    # fit ln d = lam * t + c and return lam
    pass

t, a = simulate(1.105, -math.pi / 2)
_, b = simulate(1.105, -math.pi / 2 + 1e-4)
lam = lyapunov_slope(t, np.abs(b - a))
print("lambda estimate:", lam, "1/s")
`,
      answer: t`import math
import numpy as np

W = 2 * math.pi; W0 = 1.5 * W; B = W0 / 4      # Taylor's pendulum: drive period 1 s

def simulate(gamma, phi0, T=16.0, steps_per_period=200):
    """RK4 for phi'' + 2B phi' + W0^2 sin(phi) = gamma W0^2 cos(W t), from rest. Returns t, phi."""
    h = 1.0 / steps_per_period
    n = int(round(T / h))
    f = lambda tt, p, v: -2 * B * v - W0**2 * math.sin(p) + gamma * W0**2 * math.cos(W * tt)
    p, v = phi0, 0.0
    phi = [p]
    for i in range(n):
        tt = i * h
        k1p, k1v = v, f(tt, p, v)
        k2p, k2v = v + h/2 * k1v, f(tt + h/2, p + h/2 * k1p, v + h/2 * k1v)
        k3p, k3v = v + h/2 * k2v, f(tt + h/2, p + h/2 * k2p, v + h/2 * k2v)
        k4p, k4v = v + h * k3v, f(tt + h, p + h * k3p, v + h * k3v)
        p += h/6 * (k1p + 2*k2p + 2*k3p + k4p)
        v += h/6 * (k1v + 2*k2v + 2*k3v + k4v)
        phi.append(p)
    return np.arange(n + 1) * h, np.array(phi)

def lyapunov_slope(t, d, hi=0.1):
    big = np.nonzero(d >= hi)[0]
    k = big[0] if len(big) else len(d)
    lam, c = np.polyfit(t[:k], np.log(d[:k]), 1)
    return lam

t, a = simulate(1.105, -math.pi / 2)
_, b = simulate(1.105, -math.pi / 2 + 1e-4)
lam = lyapunov_slope(t, np.abs(b - a))
print("lambda estimate:", lam, "1/s")
`,
      tests: [
        { name: 'a pure exponential $10^{-6}e^{0.8t}$ gives slope 0.8', code: 'abs(lyapunov_slope(np.linspace(0, 10, 101), 1e-6 * np.exp(0.8 * np.linspace(0, 10, 101))) - 0.8) < 1e-9' },
        { name: 'points after the gap reaches 0.1 are left out', code: 'abs(lyapunov_slope(np.linspace(0, 30, 301), np.minimum(1e-6 * np.exp(0.8 * np.linspace(0, 30, 301)), 2.0)) - 0.8) < 1e-9' },
        { name: 'the pendulum at γ = 1.105 gives λ between 0.55 and 0.85 per second', code: '0.55 < lam < 0.85' },
        { name: 'the estimate is printed', code: '"lambda estimate" in _stdout' },
      ],
      hints: [t`\`np.nonzero(d >= hi)[0]\` lists the indices where the gap is at least \`hi\`; the first of them (if any) is where to stop.`, t`\`np.polyfit(x, y, 1)\` returns \`[slope, intercept]\` for a straight-line fit: use \`y = np.log(d[:k])\`.`],
      teach: t`A Lyapunov exponent is measured as the slope of $\ln|\Delta|$ against time, fitted only while the gap is small.`,
      explain: t`The fit gives about $${sci(EX.fit.m, 2)}\ \text{s}^{-1}$, within a few per cent of the careful value $${sci(EX.lam, 3)}\ \text{s}^{-1}$. Cutting the data at $0.1$ rad matters: the saturated tail is flat and would drag the slope down. A single pair of starts gives a noisy estimate; averaging over many pairs, or renormalizing the gap as the careful method does, is better.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-planets', difficulty: 3, transfer: true,
      gen(r) {
        const TL = 5, d0 = r.pick([1, 15, 100]), tolKm = r.pick([1e3, 1e5, 1.5e8]);
        const key = TL * Math.log((tolKm * 1e3) / d0);
        return {
          prompt: t`Numerical integrations of the whole Solar System (Laskar, 1989) find that the inner planets' orbits are chaotic, with a Lyapunov time $1/\lambda$ of about ${TL} million years. If Earth's position today were known to ${d0} m, roughly how far into the future (in millions of years) could its position along its orbit be predicted to within $${sci(tolKm, 2)}$ km?`,
          answer: key, units: 'Myr', tol: { rel: 0.02 },
          errors: distinct([{ value: (TL * Math.log((tolKm * 1e3) / d0)) / Math.LN10, feedback: t`Use the natural log: the error grows as $e^{t/T_L}$.` }, { value: TL * Math.log(tolKm / d0), feedback: t`Convert the tolerance to metres before taking the ratio.` }, { value: (tolKm * 1e3) / d0 * TL, feedback: t`The growth is exponential, so the time goes as the *logarithm* of the ratio.` }], key),
          hints: [t`The error grows as $\Delta_0e^{t/T_L}$ with $T_L = 1/\lambda = ${TL}$ Myr.`, t`$t = T_L\ln(\text{tolerance}/\Delta_0)$, with both lengths in metres.`],
          teach: t`A Lyapunov time sets a forecasting horizon that grows only with the logarithm of the starting precision.`,
          explain: t`$t = ${TL}\ \text{Myr}\times\ln\bigl(${sci(tolKm * 1e3, 2)}/${d0}\bigr) = ${TL}\times${sci(Math.log((tolKm * 1e3) / d0), 3)} = ${sci(key, 3)}$ Myr. Even perfect knowledge of today to a metre leaves Earth's position along its orbit unknowable beyond about $100$ Myr — though the orbit's size and shape stay bounded far longer. (An order-of-magnitude estimate: the real error growth is uneven.)`,
          visual: gpic({ x: [-1.6, 1.6], y: [-1.25, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: 'sqrt(max(0, 0.0144 - x^2))', lower: '-sqrt(max(0, 0.0144 - x^2))', from: -0.12, to: 0.12, color: 'gold', alpha: 0.9 }], curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4 }, { param: ['cos(t)', 'sin(t)'], t: [0.35, 1.9], color: 'warn', width: 7 }], points: [{ x: 0.5, y: 0.866, color: 'accent', r: 6 }, { x: 0.18, y: -0.16, r: 0, color: 'gold', label: 'Sun' }, { x: 1.02, y: 1.02, r: 0, color: 'warn', label: 'where Earth might be' }] }, t`Earth's orbit, schematic (not to scale): after many Lyapunov times the orbit's size and shape are still known, but not where along it Earth is (orange).`, 'A circular orbit around the Sun with an arc of it highlighted as the uncertain position'),
        };
      },
    }),
    num({
      id: 'cp-readings', difficulty: 2,
      gen(r) {
        const lam = r.pick([0.6, 0.9, 1.3]), t1 = r.pick([1, 2]), t2 = t1 + r.pick([4, 6]), d1 = r.pick([1e-7, 3e-7]);
        const d2 = +(d1 * Math.exp(lam * (t2 - t1))).toPrecision(2), key = Math.log(d2 / d1) / (t2 - t1);
        return {
          prompt: t`Two simulations of a driven pendulum differ by $${sci(d1, 1)}$ rad at $t = ${t1}$ s and by $${sci(d2, 2)}$ rad at $t = ${t2}$ s. Estimate $\lambda$.`,
          answer: key, units: 's^-1', tol: { rel: 0.01 },
          errors: distinct([{ value: Math.log10(d2 / d1) / (t2 - t1), feedback: t`Use $\ln$, not $\log_{10}$.` }, { value: Math.log(d2 / d1) / t2, feedback: t`Divide by the elapsed time $t_2 - t_1$.` }], key),
          hints: [t`$\lambda = \ln(\Delta_2/\Delta_1)/(t_2 - t_1)$.`],
          teach: t`The Lyapunov exponent is the growth rate of $\ln|\Delta|$.`,
          explain: t`$\lambda = \ln(${sci(d2 / d1, 3)})/${t2 - t1} = ${sci(key, 3)}\ \text{s}^{-1}$.`,
          visual: lnPic(t1, Math.log(d1), t2, Math.log(d2), t`The two readings on a log plot (idealized straight line).`),
        };
      },
    }),
    mcq({
      id: 'cp-logistic', difficulty: 3, transfer: true,
      prompt: t`The logistic map $x_{n+1} = 4x_n(1 - x_n)$ (a model of a population, met in [the next lesson](#/lesson/phys3550.M10.3)) has Lyapunov exponent $\ln 2$ per step. Two starts differ by $10^{-15}$ — the precision of a double-precision number. After about how many steps do they differ completely?`,
      visual: logPic({ r: 4, x0: 0.3, n: 60, two: true, dx: 1e-10, panels: ['series'] }, t`Two orbits of the map at $r = 4$ started $10^{-10}$ apart (blue and orange; a larger gap than the question's, so the parting shows sooner).`),
      choices: [t`About 50 steps: $2^{50} \approx 10^{15}$`, t`About $10^{15}$ steps`, t`About 15 steps`, t`Never: a computer is deterministic`],
      answer: 0,
      why: { 1: t`The gap doubles every step: it reaches order 1 when $2^n \approx 10^{15}$, after $n = 15\ln 10/\ln 2$ steps, not $10^{15}$.`, 2: t`15 steps multiply the gap by $2^{15} \approx 3\times10^{4}$ — still only $3\times10^{-11}$.`, 3: t`Deterministic, yes — but the two starts are different numbers, and their difference doubles every step.` },
      hints: [t`$\lambda = \ln 2$ per step means the gap doubles each step.`, t`Solve $10^{-15}\times2^n = 1$.`],
      teach: t`With $\lambda = \ln 2$ per step, a double-precision start is forgotten after about 50 steps.`,
      explain: t`$n = \ln(10^{15})/\ln 2 = ${sci((15 * Math.LN10) / Math.LN2, 3)}$. After about 50 steps the computed orbit has no digits in common with the true one — yet its statistics (which values it visits, how often) are still right.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 12: sensitivity to initial conditions and the Lyapunov exponent', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'S. H. Strogatz, Nonlinear Dynamics and Chaos, 2nd ed. (CRC Press, 2015), §9.3 and §10.5: Lyapunov exponents', url: 'https://doi.org/10.1201/9780429492563' },
    { label: 'J. Laskar, A numerical experiment on the chaotic behaviour of the Solar System, Nature 338, 237 (1989)', url: 'https://doi.org/10.1038/338237a0' },
  ],
});
