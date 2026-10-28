// Constraint damping: add a multiple of the constraint to an evolution
// equation. The toy (model/pde4-constraint.js): u_t = π, π_t = φ_x,
// φ_t = π_x − γ(φ − u_x), so C = φ − u_x obeys C_t = −γC exactly (and, with
// centred differences, semi-discretely too): ‖C‖ falls by e^(−γt) — the run
// gives 1.000, 0.1339 and 0.0024 at t = 2.01 for γ = 0, 1, 3, against e^(−γt);
// γ < 0 grows (2.73 at γ = −0.5). On solutions (C = 0) the term vanishes:
// the physics is untouched. With a steady truncation source S, C → S/γ
// instead of growing as St. Price: stiffness — explicit RK4 needs γΔt ≤ 2.785.
// Damping is lower order: it cannot cure weak hyperbolicity (Kreiss). In
// numerical relativity: Gundlach et al. (2005) for Z4 and generalized
// harmonic; Pretorius's 2005 merger used it; Lindblom et al. (2006).
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';
import { runWave } from '../../src/viz/model/pde4-constraint.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const con = (params, caption) => ({ type: 'pde4-constraint', params: { controls: false, play: false, readout: false, mode: 'wave', ...params }, caption });
const GUNDLACH = { label: 'C. Gundlach, J. M. Martín-García, G. Calabrese & I. Hinder, Constraint damping in the Z4 formulation and harmonic gauge, Class. Quantum Grav. 22, 3767 (2005)', url: 'https://doi.org/10.1088/0264-9381/22/17/025' };
const PRETORIUS = { label: 'F. Pretorius, Evolution of binary black-hole spacetimes, Phys. Rev. Lett. 95, 121101 (2005)', url: 'https://doi.org/10.1103/PhysRevLett.95.121101' };
const LINDBLOM = { label: 'L. Lindblom, M. A. Scheel, L. E. Kidder, R. Owen & O. Rinne, A new generalized harmonic evolution system, Class. Quantum Grav. 23, S447 (2006)', url: 'https://doi.org/10.1088/0264-9381/23/16/S09' };

const RK4 = 2.785293563405282;              // RK4's stability interval on the negative real axis
const TSUN = 4.925491e-6;                  // GM☉/c³ in seconds
const RUNS = [0, 1, 3, -0.5].map((g) => { const R = runWave({ N: 100, gamma: g, eps: 0.1, tmax: 2 }); const [tf, cf] = R.hist[R.hist.length - 1]; return { g, tf, ratio: cf / R.hist[0][1], c0: R.hist[0][1] }; });

export default lesson({
  id: 'st-b.B14.2',
  title: 'Constraint damping',
  minutes: 14, difficulty: 3,
  intro: t`If constraint violations can sit still or grow, make them die. Take the toy from the last lesson — the wave equation as $u_t = \pi$, $\pi_t = \varphi_x$, $\varphi_t = \pi_x$, with $\varphi$ standing for $u_x$ — and add to the last equation a term proportional to the constraint itself:

$$\varphi_t = \pi_x - \gamma\,(\varphi - u_x).$$

For any true solution, $\varphi = u_x$ and the extra term is zero: **the physics is untouched**. But the violation $C = \varphi - u_x$ now obeys $C_t = -\gamma C$, so

$$C(x, t) = C(x, 0)\,e^{-\gamma t}:$$

whatever is broken dies away at the rate $\gamma$. This is **constraint damping**: adding multiples of the constraints — which vanish on solutions — to the evolution equations, chosen so that the constraints’ own evolution becomes a decay.`,
  symbols: [
    { tex: 'C = \\varphi - u_x', text: 'the constraint violation: zero for every true solution' },
    { tex: '\\gamma', text: 'the damping rate (1/s, or $1/M$ in relativity): violations fall by $e$ every $1/\\gamma$' },
    { tex: '\\varphi,\\ \\pi', text: 'the auxiliary fields standing for $u_x$ and $u_t$' },
    { tex: 'C(x, 0)', text: 'the violation present at the start — from inexact initial data, say' },
  ],
  why: t`This trick is part of why binary black holes could finally be simulated. Pretorius’s 2005 merger used generalized harmonic coordinates *with* constraint-damping terms (proposed by Gundlach and collaborators the same year); without them, violations grew and the runs died. The constraint subsystem of Einstein’s equations is much richer than $C_t = -\gamma C$, but the idea is the same.`,
  visual: {
    type: 'pde4-constraint',
    title: 'Dial the damping',
    lead: t`The toy starts with $\varphi$ wrong by 10%: the gold curve is $\varphi$, the dashed one $u_x$. Below them the violation (red), and its size against time on a log scale, with the prediction $C(0)e^{-\gamma t}$ dashed.`,
    tasks: [
      t`$\gamma = 0$: the violation never changes — a flat line on the log plot.`,
      t`$\gamma = 1$, then 3: straight lines down, matching the dashed $e^{-\gamma t}$; by $t = 6$ the gold and dashed curves agree.`,
      t`$\gamma = -0.5$: a formulation that *amplifies* violations — the kind numerical relativists had to escape.`,
    ],
    params: { mode: 'wave', gamma: 0, gmin: -1, gmax: 3, eps: 0.1, N: 100, Ns: [50, 100, 200], tmax: 6, logmin: -6, controls: ['gamma', 'eps', 'N', 't'] },
    caption: t`Periodic line of length $2\pi$, centred differences, RK4 with $\Delta t = \Delta x/2$. $u$, $\varphi$ and the violation are drawn to their own scales. The run at $N = 100$ reproduces $e^{-\gamma t}$ to four figures.`,
  },
  example: {
    prompt: t`In the toy, $\max|C| = ${r3(RUNS[0].c0)}$ at $t = 0$. Show that $C_t = -\gamma C$, and find $\max|C|$ at $t = ${r3(RUNS[0].tf)}$ for $\gamma = 0$, 1 and 3. How long does $\gamma = 1$ take to bring it below $10^{-6}$?`,
    visual: con({ gamma: 1, eps: 0.1, N: 100, t: 2, tmax: 6, logmin: -6 }, t`The toy with $\gamma = 1$ at $t = 2$: the violation’s history (red) on the dashed line $C(0)e^{-t}$.`),
    steps: [
      { label: 'Differentiate', text: t`$C_t = \varphi_t - (u_x)_t = \big(\pi_x - \gamma C\big) - (u_t)_x = \pi_x - \gamma C - \pi_x = -\gamma C$.` },
      { label: 'Discretely too', text: t`With centred differences $D_0$ for every $\partial_x$, $C = \varphi - D_0u$ obeys $C_t = D_0\pi - \gamma C - D_0\pi = -\gamma C$ exactly — the same cancellation, because $D_0$ commutes with $\partial_t$.` },
      { label: 'Solve', text: t`$C(t) = C(0)e^{-\gamma t}$ at each point. At $t = ${r3(RUNS[0].tf)}$: $\gamma = 0$ leaves $${r3(RUNS[0].c0)}$; $\gamma = 1$ gives $${r3(RUNS[0].c0 * Math.exp(-RUNS[0].tf))}$; $\gamma = 3$ gives $${tex(RUNS[0].c0 * Math.exp(-3 * RUNS[0].tf), 3)}$.` },
      { label: 'Check against the run', text: t`The simulation’s ratios $\max|C(t)|/\max|C(0)|$ are ${RUNS.slice(0, 3).map((q) => r3(q.ratio)).join(', ')}, against $e^{-\gamma t}$ = ${RUNS.slice(0, 3).map((q) => r3(Math.exp(-q.g * q.tf))).join(', ')}.` },
      { label: 'Time to a millionth', text: t`$t = \ln(${r3(RUNS[0].c0)}/10^{-6})/\gamma = ${r3(Math.log(RUNS[0].c0 / 1e-6))}$ s for $\gamma = 1$.` },
      { label: 'Physics untouched', text: t`Start with consistent data ($\varphi = u_x$) and the damping term is zero for all time: any $\gamma$ gives the same wave. Damping changes only what happens *off* the constraint surface.` },
    ],
    answer: t`$C_t = -\gamma C$, so $\max|C|$ falls to $${r3(RUNS[0].c0)}$, $${r3(RUNS[0].c0 * Math.exp(-RUNS[0].tf))}$ and $${tex(RUNS[0].c0 * Math.exp(-3 * RUNS[0].tf), 3)}$ for $\gamma = 0, 1, 3$; with $\gamma = 1$ it passes $10^{-6}$ after about $${r3(Math.log(RUNS[0].c0 / 1e-6))}$ s.`,
  },
  practice: [
    num({
      id: 'decay', difficulty: 1,
      gen(r) {
        const g = r.pick([0.5, 1, 2, 4]), T = r.pick([1, 2.5, 5]);
        const f = Math.exp(-g * T);
        return {
          prompt: t`With damping rate $\gamma = ${g}\ \text{s}^{-1}$, by what factor has a constraint violation shrunk after $${T}$ s? (Give $C(t)/C(0)$.)`,
          visual: { type: 'graph', params: { x: [0, 6], y: [-6, 0.5], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'log₁₀ C(t)/C(0)', curves: [{ fn: '-x/ln(10)', color: 'bad', width: 2.4, label: 'γ = 1 per second', labelAt: 3.2, labelDy: -12 }, { fn: '0*x', color: 'ink3', dash: [5, 4] }] }, caption: 'Exponential decay is a straight line on a log scale — drawn here for γ = 1 per second, for comparison; the dashed line is no damping.' },
          answer: f, tol: { rel: 0.005 },
          errors: [{ value: Math.exp(-T / g), feedback: t`$\gamma$ is a rate: the exponent is $-\gamma t$, not $-t/\gamma$.` }, { value: 1 - g * T, feedback: 'The decay is exponential, not linear.' }].filter((e) => Math.abs(e.value - f) > 0.01 * f),
          hints: [t`$C(t)/C(0) = e^{-\gamma t}$.`],
          teach: 'Damping makes every violation fall exponentially at the rate γ.',
          explain: t`$e^{-${g}\times${T}} = ${tex(f, 3)}$.`,
        };
      },
    }),
    num({
      id: 'choose-gamma', difficulty: 2,
      gen(r) {
        const F = r.pick([100, 1e3, 1e6]), T = r.pick([5, 10, 50]);
        const g = Math.log(F) / T;
        return {
          prompt: t`You want initial-data errors in the constraints to fall by a factor $${tex(F)}$ within the first $${T}$ s of a run. What damping rate $\gamma$ do you need, in s⁻¹?`,
          visual: { type: 'graph', params: { x: [0, T], y: [-Math.log10(F) - 1, 0.5], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'log₁₀ C(t)/C(0)', curves: [], hlines: [{ y: -Math.log10(F), color: 'gold', label: 'target' }], points: [{ x: 0, y: 0, color: 'bad', r: 5 }] }, caption: 'The start and the target: a straight line on this log scale joins them, with slope −γ/ln 10.' },
          answer: g, units: '1/s', tol: { rel: 0.005 },
          errors: [{ value: Math.log10(F) / T, feedback: t`Use the natural log: $e^{-\gamma T} = 1/F$ gives $\gamma = \ln F/T$.` }, { value: 1 / T, feedback: t`$1/T$ only gives one factor of $e$.` }],
          hints: [t`Solve $e^{-\gamma T} = 1/${tex(F)}$ for $\gamma$.`],
          teach: 'To shrink violations by F in time T you need γ = ln F / T.',
          explain: t`$\gamma = \ln(${tex(F)})/${T} = ${r3(g)}\ \text{s}^{-1}$.`,
        };
      },
    }),
    num({
      id: 'steady', difficulty: 2,
      gen(r) {
        const S = r.pick([1e-8, 4e-7, 2e-6]), g = r.pick([0.2, 0.5, 2]), T = r.pick([100, 1000]);
        return {
          prompt: t`Truncation error feeds a constraint violation at a steady rate $S = ${tex(S)}$ per second, so $C_t = -\gamma C + S$. With $\gamma = ${g}\ \text{s}^{-1}$, what value does $C$ settle at? (Without damping it would reach $S\,t = ${tex(S * T)}$ after ${T} s.)`,
          visual: { type: 'graph', params: { x: [0, 10 / g], y: [0, 1.5 * S / g], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'C', yticks: 0, curves: [{ fn: `${S}*x`, color: 'ink3', dash: [5, 4] }, { fn: `${S / g}*(1 - exp(-${g}*x))`, color: 'bad', width: 2.4 }] }, caption: 'Without damping the violation grows linearly (dashed); with damping it levels off (red). Vertical scale unlabelled: read off nothing, compute.' },
          answer: S / g, tol: { rel: 0.005 },
          errors: [{ value: S * g, feedback: t`At steady state $C_t = 0$: $\gamma C = S$, so $C = S/\gamma$.` }, { value: S * T, feedback: 'That is the undamped growth; damping caps it.' }],
          hints: [t`At steady state $C_t = 0$.`, t`$0 = -\gamma C + S \Rightarrow C = S/\gamma$.`],
          teach: 'With a steady source, damping caps the violation at S/γ instead of letting it grow as St.',
          explain: t`$C_\infty = S/\gamma = ${tex(S, 2)}/${g} = ${tex(S / g, 3)}$, reached after a few times $1/\gamma = ${r3(1 / g)}$ s — against $${tex(S * T, 2)}$ undamped after ${T} s. Since $S$ is truncation error, $C_\infty$ still converges to zero with the scheme’s order.`,
        };
      },
    }),
    mcq({
      id: 'physics', difficulty: 2,
      prompt: t`Adding $-\gamma(\varphi - u_x)$ to the $\varphi$ equation changes the equations. Why does it not change the physics they describe?`,
      visual: con({ gamma: 2, eps: 0, N: 100, t: 3, tmax: 6, logmin: -6 }, 'Consistent initial data (φ = uₓ up to truncation error): the damping term has nothing to act on.'),
      choices: ['On every true solution φ = uₓ, so the added term is zero: true solutions are solutions of both systems', 'Because γ is small', 'Because it only acts at the boundaries', 'It does change the physics: the waves are damped too'],
      answer: 0,
      why: { 1: 'γ need not be small — γ = 3 in the explorer leaves the wave untouched. The term vanishes on solutions whatever γ is.', 2: 'It acts everywhere, but only where the constraint is violated.', 3: t`$u$ obeys the same wave equation: $u_{tt} = \pi_t = \varphi_x$, and with $\varphi = u_x$ that is $u_{xx}$. Only the violation decays.` },
      hints: ['What is φ − uₓ for a true solution of the original problem?'],
      teach: 'A multiple of a constraint vanishes on solutions: adding one changes how errors behave, not what the solutions are.',
      explain: t`Exact solutions satisfy the constraint, so the added term is identically zero on them; both systems have the same solutions with consistent data. What differs is the evolution of *inconsistent* data — and every numerical solution is slightly inconsistent.`,
    }),
    num({
      id: 'stiff', difficulty: 3,
      gen(r) {
        const dt = r.pick([0.01, 0.025, 0.05]);
        const g = RK4 / dt;
        return {
          prompt: t`The damping term makes the system **stiff**: the violation obeys $C_t = -\gamma C$, and an explicit time stepper must keep $\gamma\,\Delta t$ inside its stability interval. For classical RK4 that interval on the negative real axis reaches $\gamma\,\Delta t = 2.785$. With $\Delta t = ${dt}$ s (set by the CFL condition), what is the largest usable $\gamma$, in s⁻¹?`,
          visual: { type: 'graph', params: { x: [-3.5, 0.5], y: [0, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 'z = −γΔt', ylabel: '|growth per step|', curves: [{ fn: 'abs(1 + x + x^2/2 + x^3/6 + x^4/24)', color: 'accent', width: 2.4 }], hlines: [{ y: 1, color: 'ink3' }] }, caption: 'RK4’s growth factor per step for C′ = −γC, against z = −γΔt: stable while below 1.' },
          answer: g, units: '1/s', tol: { rel: 0.005 },
          errors: [{ value: 2 / dt, feedback: 'That is the forward-Euler limit, γΔt ≤ 2; RK4’s reaches further, to 2.785.' }, { value: RK4 * dt, feedback: 'Divide by Δt, do not multiply.' }],
          hints: [t`$\gamma_{\max} = 2.785/\Delta t$.`, t`$2.785/${dt}$.`],
          teach: 'Damping that is too strong makes the equations stiff: an explicit integrator needs γΔt below its stability limit.',
          explain: t`$\gamma_{\max} = 2.785/${dt} = ${r3(g)}\ \text{s}^{-1}$. Past it the time stepper, not the physics, blows up: the damping term itself becomes the instability. In practice $\gamma$ is chosen of the order of the inverse dynamical time ($\sim1/M$ for black holes), far below this limit.`,
        };
      },
    }),
    mcq({
      id: 'negative', difficulty: 2,
      prompt: t`In the explorer, $\gamma = -0.5$ makes violations grow as $e^{0.5t}$. What does this stand for in real formulations?`,
      visual: con({ gamma: -0.5, eps: 0.1, N: 100, t: 6, tmax: 6, logmin: -2 }, 'γ = −0.5: the violation grows exponentially from its initial 10% error.'),
      choices: ['A formulation whose constraint subsystem has growing modes: tiny violations — from truncation error, at least — grow exponentially and swamp the solution', 'A sign error that no real formulation has', 'Faster convergence, since violations are pushed out of the domain', 'Nothing: growth of the constraint does not affect the fields u and π'],
      answer: 0,
      why: { 1: 'Formulations of Einstein’s equations that are mathematically equivalent can have constraint subsystems with growing modes; that is a real and common failure.', 2: 'Nothing is pushed anywhere: the violation grows in place.', 3: t`The violation feeds the evolution: $\pi_t = \varphi_x$ uses the wrong $\varphi$, so $u$ goes wrong too.` },
      hints: [t`$C$ obeys $C_t = 0.5\,C$. What happens to round-off-sized violations?`],
      teach: 'If the constraints’ own evolution has growing modes, truncation error alone will eventually wreck the run.',
      explain: t`Even with perfect initial data, truncation error seeds violations, and an exponentially growing mode amplifies them without bound. Early numerical-relativity codes met exactly this: runs that crashed after a few dynamical times, with the constraints growing first. Adding constraint multiples with the right signs turns growth into decay.`,
    }),
    multi({
      id: 'limits', difficulty: 3,
      prompt: t`Which problems can constraint damping fix? (Select all that apply.)`,
      visual: con({ gamma: 1, eps: 0.2, N: 50, t: 4, tmax: 6, logmin: -6 }, 'Damping at work: a large initial violation dying as e^(−t).'),
      choices: ['violations present in the initial data', 'violations fed steadily by truncation error (they are capped at S/γ)', 'growth of the solution ∝ k t caused by a Jordan block in the principal part (weak hyperbolicity)', 'a time step that violates the CFL condition'],
      answer: [0, 1],
      why: { 2: 'Damping terms contain no derivatives — they are lower order. Lower-order terms cannot change whether the principal part is strongly hyperbolic (Kreiss): the formulation itself must be fixed (next module).', 3: 'A CFL violation is an instability of the scheme for the evolution equations themselves; no term in the constraint equation repairs it.' },
      hints: ['The damping term −γC has no derivatives in it. What kind of instability can a term without derivatives control?', 'Growth that rises with the wavenumber k comes from the highest derivatives.'],
      teach: 'Damping is a lower-order fix: it kills violations but cannot cure an ill-posed principal part or an unstable scheme.',
      explain: t`Damping turns a constraint subsystem’s zero or growing rates into decay at rate $\gamma$ — independent of wavenumber. Growth proportional to $k$, from a missing eigenvector in the principal part (B12.2), outruns any fixed $\gamma$ at short enough wavelengths. That is why damping arrived *together* with strongly hyperbolic formulations (generalized harmonic, BSSN), not instead of them.`,
    }),
    code({
      id: 'damp-rate', difficulty: 3,
      prompt: t`Run the damped toy yourself. \`rhs(u, p, f, gamma)\` (given) returns the time derivatives of $u$, $\pi$ and $\varphi$ with centred differences on a periodic grid. Write \`run(gamma)\`: take RK4 steps of size \`dt\` from the given start for \`steps\` steps and return the ratio $\max|C(t)|/\max|C(0)|$, where \`C(u, f)\` (given) is $\varphi - D_0u$. Set \`ratios\` to \`[run(0), run(1), run(3)]\`.`,
      starter: t`import numpy as np

N = 100
dx = 2 * np.pi / N
x = np.arange(N) * dx
dt = 0.5 * dx
steps = round(2.0 / dt)
T = steps * dt

def D0(f):
    return (np.roll(f, -1) - np.roll(f, 1)) / (2 * dx)

def rhs(u, p, f, gamma):
    return p, D0(f), D0(p) - gamma * (f - D0(u))

def C(u, f):
    return f - D0(u)

w = 0.5
u0 = np.exp(-(x - np.pi)**2 / w**2)
du0 = -2 * (x - np.pi) / w**2 * u0
p0 = -du0                    # a right-moving pulse
f0 = 1.1 * du0               # phi wrong by 10%

def run(gamma):
    u, p, f = u0.copy(), p0.copy(), f0.copy()
    pass

ratios = []
print(T, ratios, [np.exp(-g * T) for g in (0, 1, 3)])
`,
      answer: t`import numpy as np

N = 100
dx = 2 * np.pi / N
x = np.arange(N) * dx
dt = 0.5 * dx
steps = round(2.0 / dt)
T = steps * dt

def D0(f):
    return (np.roll(f, -1) - np.roll(f, 1)) / (2 * dx)

def rhs(u, p, f, gamma):
    return p, D0(f), D0(p) - gamma * (f - D0(u))

def C(u, f):
    return f - D0(u)

w = 0.5
u0 = np.exp(-(x - np.pi)**2 / w**2)
du0 = -2 * (x - np.pi) / w**2 * u0
p0 = -du0                    # a right-moving pulse
f0 = 1.1 * du0               # phi wrong by 10%

def run(gamma):
    u, p, f = u0.copy(), p0.copy(), f0.copy()
    c0 = np.max(np.abs(C(u, f)))
    for n in range(steps):
        k1 = rhs(u, p, f, gamma)
        k2 = rhs(u + dt/2 * k1[0], p + dt/2 * k1[1], f + dt/2 * k1[2], gamma)
        k3 = rhs(u + dt/2 * k2[0], p + dt/2 * k2[1], f + dt/2 * k2[2], gamma)
        k4 = rhs(u + dt * k3[0], p + dt * k3[1], f + dt * k3[2], gamma)
        u = u + dt/6 * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0])
        p = p + dt/6 * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1])
        f = f + dt/6 * (k1[2] + 2*k2[2] + 2*k3[2] + k4[2])
    return np.max(np.abs(C(u, f))) / c0

ratios = [run(0), run(1), run(3)]
print(T, ratios, [np.exp(-g * T) for g in (0, 1, 3)])`,
      tests: [
        { name: t`without damping the violation is unchanged (ratio 1)`, code: 'len(ratios) == 3 and abs(ratios[0] - 1) < 1e-9' },
        { name: t`with $\gamma = 1$ and $\gamma = 3$ the ratios match $e^{-\gamma T}$ to 0.2%`, code: 'all(abs(r / np.exp(-g * T) - 1) < 2e-3 for r, g in zip(ratios[1:], (1, 3)))' },
      ],
      hints: ['Inside the loop, the four RK4 stages: k1 = rhs(u, p, f, gamma), k2 at the half step from k1, k3 at the half step from k2, k4 at the full step from k3.', 'Each field updates as `u + dt/6*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0])`, and the same with index 1 for p and 2 for f.', 'Compute `c0 = np.max(np.abs(C(u, f)))` before the loop and return the ratio after it.'],
      teach: 'Because C = φ − D₀u obeys C′ = −γC exactly, the measured decay matches e^(−γt) to the time-stepper’s accuracy.',
      explain: t`The ratios come out ${RUNS.slice(0, 3).map((q) => r3(q.ratio)).join(', ')} at $T = ${r3(RUNS[0].tf)}$, against $e^{-\gamma T}$ = ${RUNS.slice(0, 3).map((q) => r3(Math.exp(-q.g * q.tf))).join(', ')}. The small differences are RK4’s own error in approximating $e^{-\gamma\,\Delta t}$ per step.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bbh', difficulty: 3, transfer: true,
      gen(r) {
        const M = r.pick([20, 65, 150]), F = r.pick([1e3, 1e6]), gM = r.pick([0.5, 1, 2]);
        const tM = Math.log(F) / gM, ms = tM * M * TSUN * 1e3;
        return {
          prompt: t`A binary-black-hole run with total mass $M = ${M}\,M_\odot$ uses a damping rate $\gamma = ${gM}/M$ (with $G = c = 1$, so $1\,M$ of time is $GM/c^3 = ${tex(M * TSUN * 1e3, 3)}$ ms here). If the constraints obeyed $C_t = -\gamma C$, how long would initial-data violations take to fall by a factor $${tex(F)}$, in milliseconds of the binary’s time?`,
          visual: { type: 'graph', params: { x: [0, 30], y: [-7, 0.5], aspect: 'wide', axesAt: 'edge', xlabel: 'time (units of M)', ylabel: 'log₁₀ violation', curves: [{ fn: `-${gM}*x/ln(10)`, color: 'bad', width: 2.4 }], hlines: [{ y: -Math.log10(F), color: 'gold', label: 'target' }] }, caption: 'Exponential decay of a violation at the rate γ, in units of M (simplified: the real constraint system has many modes).' },
          answer: ms, units: 'ms', tol: { rel: 0.005 },
          errors: [{ value: (Math.log10(F) / gM) * M * TSUN * 1e3, feedback: 'Use the natural log of the factor: t = ln F/γ.' }, { value: tM, feedback: 'That is the time in units of M; multiply by GM/c³ in milliseconds.' }],
          hints: [t`In units of $M$: $t = \ln(${tex(F)})/${gM} = ${r3(tM)}\,M$.`, t`Multiply by $GM/c^3 = ${tex(M * TSUN * 1e3, 3)}$ ms.`],
          teach: 'Damping rates in numerical relativity are set in units of the inverse mass, 1/M: violations die in a few dynamical times.',
          explain: t`$t = \ln(${tex(F)})/${gM} = ${r3(tM)}\,M = ${r3(ms)}$ ms. The last orbits of a stellar-mass binary take tens of milliseconds, so violations die within a few dynamical times; for a supermassive binary the same numbers are hours or years. In units of $M$ the physics — and the damping — is the same.`,
        };
      },
    }),
    mcq({
      id: 'cp-cannot', difficulty: 3,
      prompt: t`A code evolves a weakly hyperbolic formulation; its short-wavelength errors grow like $k\,t$. A colleague proposes adding strong constraint damping, $\gamma = 50/M$. Will that cure it?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-0.3, 3.3], xlog: true, ylog: true, aspect: 'wide', xlabel: 'wavenumber k', ylabel: 'growth factor at t = 1', axesAt: 'edge', curves: [{ fn: 'log10((10^x + sqrt(10^(2*x) + 4))/2)', color: 'warn', width: 2.4, label: 'weak: ∝ k', labelAt: 1.6, labelDy: -14 }] }, caption: 'Growth rising with wavenumber: the signature of weak hyperbolicity (B12.2).' },
      choices: ['No: damping terms have no derivatives, so they cannot change the principal part; growth ∝ k beats any fixed γ at short wavelengths — and γ = 50/M would make the equations stiff', 'Yes: any growth can be damped if γ is large enough', 'Yes, provided the initial data satisfy the constraints', 'No, because damping only works for linear equations'],
      answer: 0,
      why: { 1: 'A fixed damping rate γ removes a fixed fraction per unit time; growth that rises without limit with k wins at large k.', 2: 'Truncation error re-seeds violations at the grid scale every step; good data do not help an ill-posed evolution.', 3: 'Damping works for nonlinear systems too — it was introduced for Einstein’s equations; the obstacle is the principal part, not nonlinearity.' },
      hints: ['Does −γC contain any derivatives? Which terms decide hyperbolicity?', 'Compare growth ∝ kt with decay e^(−γt) as k → ∞.'],
      teach: 'Fix the principal part first (strong hyperbolicity); damping then deals with what is left.',
      explain: t`Well-posedness is decided by the highest derivatives (the principal part); a strongly hyperbolic system stays well posed under *any* lower-order term, and a weakly hyperbolic one cannot be rescued by one (Kreiss). Strong damping adds a second problem: $\gamma\Delta t$ must stay below about 2.8 for RK4. The 2005 breakthroughs combined a strongly hyperbolic formulation *with* damping.`,
    }),
    num({
      id: 'cp-cap', difficulty: 2, transfer: true,
      gen(r) {
        const S = r.pick([1e-9, 5e-9, 2e-8]), gM = r.pick([0.25, 0.5, 1]), T = r.pick([1000, 5000]);
        return {
          prompt: t`In a long inspiral simulation, truncation error feeds a constraint violation at about $S = ${tex(S)}$ per unit of $M$. Over $${T}\,M$ of evolution, undamped, it would reach $S\,T$. With damping $\gamma = ${gM}/M$ it levels off instead. At what value?`,
          visual: { type: 'graph', params: { x: [0, 20], y: [0, 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 'time (units of 1/γ)', ylabel: 'C (scaled)', yticks: 0, curves: [{ fn: '1 - exp(-x)', color: 'bad', width: 2.4 }, { fn: '0.06*x', color: 'ink3', dash: [5, 4] }] }, caption: 'Damped (red) against undamped (dashed) growth of a fed violation, schematic.' },
          answer: S / gM, tol: { rel: 0.005 },
          errors: [{ value: S * T, feedback: 'That is the undamped value; with damping C settles where γC = S.' }, { value: S * gM, feedback: 'At steady state C = S/γ, not Sγ.' }].filter((e) => Math.abs(e.value - S / gM) > 0.01 * S / gM),
          hints: [t`Steady state: $C_t = -\gamma C + S = 0$.`, t`$C = S/\gamma$ with $\gamma$ in units of $1/M$.`],
          teach: 'Damping caps a steadily fed violation at S/γ, however long the run.',
          explain: t`$C_\infty = S/\gamma = ${tex(S, 2)}/${gM} = ${tex(S / gM, 3)}$, against $${tex(S * T, 2)}$ undamped after ${T} $M$ — ${r3((S * T) / (S / gM))} times smaller. Long inspirals of thousands of $M$ are exactly where this matters.`,
        };
      },
    }),
  ],
  sources: [GUNDLACH, PRETORIUS, LINDBLOM, SRC.evans],
});
