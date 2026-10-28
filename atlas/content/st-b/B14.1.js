// Constraint equations that ride along with evolution: Maxwell's equations are
// 8 for 6 unknowns — Faraday and Ampère evolve E and B, Gauss's two laws hold
// no time derivative and constrain each moment. The divergence of Ampère plus
// charge conservation give ∂_t(∇·E − ρ/ε₀) = 0: the evolution carries the
// constraint along. A computer keeps it only if its discrete identities match:
// in 1D (model/pde4-constraint.js), a blob moved by upwind with E updated by
// the same flux on a staggered grid keeps Gauss's law to round-off; with E on
// the grid points it drifts, C_t = −(vΔx/2)ρ_xx at first (0.26 per second at
// N = 100, w = 0.6 m, against vΔx/w² = 0.28), to max|C| ≈ 0.071 at t = 5 s,
// halving with Δx (first order). Yee's staggered grid (1966) and
// charge-conserving current deposition in particle-in-cell codes (Villasenor &
// Buneman 1992; Esirkepov 2001) are the professional versions. The wave toy
// (φ standing for u_x): C = φ − u_x obeys C_t = 0 — a violation sits still.
// Avoids gr.S29.d's 3D Maxwell identity worked through symbolically.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';
import { runMaxwell } from '../../src/viz/model/pde4-constraint.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const con = (params, caption) => ({ type: 'pde4-constraint', params: { controls: false, play: false, readout: false, ...params }, caption });
const YEE = { label: 'K. S. Yee, Numerical solution of initial boundary value problems involving Maxwell’s equations in isotropic media, IEEE Trans. Antennas Propag. 14, 302 (1966)', url: 'https://doi.org/10.1109/TAP.1966.1138693' };
const ESIRKEPOV = { label: 'T. Zh. Esirkepov, Exact charge conservation scheme for particle-in-cell simulation with an arbitrary form-factor, Comput. Phys. Commun. 135, 144 (2001)', url: 'https://doi.org/10.1016/S0010-4655(00)00228-9' };
const GRIFFITHS = { label: 'D. J. Griffiths, Introduction to Electrodynamics, 4th ed. (Cambridge, 2017), §7.3', url: 'https://doi.org/10.1017/9781108333511' };

// the model's numbers: N = 100, blob width 0.6 m, v = 1 m/s, ν = 0.5
const R100 = runMaxwell({ N: 100, scheme: 'collocated', tmax: 5 });
const R200 = runMaxwell({ N: 200, scheme: 'collocated', tmax: 5 });
const RS = runMaxwell({ N: 100, scheme: 'staggered', tmax: 5 });
const last = (R) => R.hist[R.hist.length - 1][1];
const rate0 = (R100.hist[2][1] - R100.hist[1][1]) / R100.dt;

export default lesson({
  id: 'st-b.B14.1',
  title: 'Constraint equations that ride along with evolution',
  minutes: 15, difficulty: 3,
  intro: t`Maxwell’s equations are eight equations for six unknowns, the components of $\vec E$ and $\vec B$. Six of them — Faraday’s and Ampère’s laws — contain time derivatives and say how the fields **evolve**. The other two, Gauss’s laws $\nabla\cdot\vec E = \rho/\varepsilon_0$ and $\nabla\cdot\vec B = 0$, contain none: they are **constraints**, conditions the fields must meet at every single moment. Eight equations for six unknowns would be too many — unless the evolution keeps the constraints true by itself. It does. Take the divergence of Ampère’s law; the divergence of a curl vanishes, and

$$\partial_t\Big(\nabla\cdot\vec E - \frac{\rho}{\varepsilon_0}\Big) = -\frac{1}{\varepsilon_0}\big(\partial_t\rho + \nabla\cdot\vec J\big) = 0$$

because charge is conserved. So constraints satisfied once, at the start, ride along for ever. A computer is not so lucky: its versions of “the divergence of a curl is zero” and of charge conservation hold only if the scheme is built to make them hold.`,
  symbols: [
    { tex: t`\nabla\cdot\vec E - \rho/\varepsilon_0`, text: 'the Gauss-law violation $C$: zero for any physical field (units V/m²)' },
    { tex: t`\rho,\ \vec J`, text: 'the charge density (C/m³) and current density (A/m²)' },
    { tex: t`\partial_t\rho + \nabla\cdot\vec J`, text: 'zero by charge conservation: charge in a region changes only by what flows through its surface' },
    { tex: t`\varepsilon_0`, text: 'the permittivity of free space, $8.854\\times10^{-12}$ F/m (set to 1 in the simulation)' },
  ],
  why: t`Einstein’s equations have exactly this structure — four constraints riding along with six evolution equations (module B15). Whether a simulation keeps its constraints, and what it does when it does not, decided whether black-hole collisions could be computed at all. The same issue runs through plasma codes for electric thrusters and through incompressible flow, where $\nabla\cdot\vec u = 0$ is the constraint.`,
  visual: {
    type: 'pde4-constraint',
    title: 'Gauss’s law on a grid',
    lead: t`A blob of charge drifts right at 1 m/s through a uniform neutralizing background; its current changes the electric field by $E_t = -J$ (in units with $\varepsilon_0 = 1$). Below the fields: the Gauss-law violation $C = E_x - \rho$ along the line, and its largest value against time on a log scale.`,
    tasks: [
      t`With $E$ on the grid points, play: the violation jumps from zero to about $${r3(Math.max(...R100.hist.map((h) => h[1])))}$ within a second and stays — the scheme has drifted off Gauss’s law.`,
      t`Switch to $N = 200$: the violation halves. It is first-order truncation error, converging away — but never zero.`,
      t`Put $E$ between the grid points: the violation stays at round-off, $10^{-15}$, for the whole run. Same physics, same charge motion — only where $E$ lives has changed.`,
    ],
    params: { mode: 'maxwell', scheme: 'collocated', schemes: ['collocated', 'staggered'], N: 100, Ns: [50, 100, 200], tmax: 10, t: 0 },
    caption: t`One dimension ($\varepsilon_0 = 1$), periodic line 10 m long. The charge is moved by the upwind scheme at Courant number 0.5 in both versions. Field and charge are drawn to arbitrary scales; the violation (red) to its own, printed beside it.`,
  },
  example: {
    prompt: t`Why does the collocated scheme drift? The charge moves by upwind, $\rho_j^{n+1} = \rho_j^n - \nu(\rho_j^n - \rho_{j-1}^n)$, and the field by $E_j^{n+1} = E_j^n - \Delta t\,v\,\rho_j^n$. Gauss’s law is checked as $C_j = (E_{j+1} - E_{j-1})/(2\Delta x) - \rho_j$. Find how fast $C$ changes, and compare the staggered scheme.`,
    visual: con({ mode: 'maxwell', scheme: 'collocated', N: 100, t: 0.5, tmax: 5 }, 'The collocated scheme half a second in: the violation (red, bottom) sits where the charge density curves most.'),
    steps: [
      { label: 'Rate of the field part', text: t`One step changes $(E_{j+1} - E_{j-1})/(2\Delta x)$ by $-\Delta t\,v\,(\rho_{j+1} - \rho_{j-1})/(2\Delta x)$: a centred difference of the current.` },
      { label: 'Rate of the charge part', text: t`One step changes $\rho_j$ by $-\nu(\rho_j - \rho_{j-1}) = -\Delta t\,v\,(\rho_j - \rho_{j-1})/\Delta x$: an upwind difference.` },
      { label: 'Subtract', text: t`$C$ changes per unit time by $-\dfrac{v}{2\Delta x}\big(\rho_{j+1} - 2\rho_j + \rho_{j-1}\big) \approx -\dfrac{v\,\Delta x}{2}\,\rho_{xx}$: exactly the numerical diffusion upwind adds to the charge (lesson B13.1), which moves charge **without any current** for $E$ to see.` },
      { label: 'Size', text: t`For $\rho = e^{-x^2/w^2}$, $|\rho_{xx}|$ peaks at $2/w^2$, so $|C_t| \approx v\,\Delta x/w^2 = (1)(0.1)/0.6^2 = ${r3(0.1 / 0.36)}$ per second at first. The model’s run: $${r3(rate0)}$ per second. After 5 s, $\max|C| = ${r3(last(R100))}$; with half the spacing, $${r3(last(R200))}$.` },
      { label: 'Staggered instead', text: t`Put $E$ at the half points $j + \tfrac12$ and update it with the very flux that moves the charge, $E_{j+1/2} \leftarrow E_{j+1/2} - \Delta t\,v\,\rho_j$. Then $(E_{j+1/2} - E_{j-1/2})/\Delta x$ changes by $-\nu(\rho_j - \rho_{j-1})$ — exactly the change in $\rho_j$. The discrete Gauss law is kept identically: $\max|C| = ${tex(last(RS), 2)}$ after 5 s, round-off.` },
    ],
    answer: t`$C_t \approx -\tfrac12v\,\Delta x\,\rho_{xx}$: the collocated scheme drifts at about $${r3(rate0)}$ per second at first, reaching $${r3(last(R100))}$ (first order in $\Delta x$); the staggered scheme keeps Gauss’s law to round-off because its discrete charge conservation and discrete divergence match.`,
  },
  practice: [
    multi({
      id: 'which-constraints', difficulty: 1,
      prompt: t`Which of Maxwell’s equations are constraints — conditions on the fields at one instant, with no time derivative? (Select all that apply.)`,
      visual: con({ mode: 'maxwell', scheme: 'staggered', N: 100, t: 0, tmax: 5 }, 'A charge blob and its electric field at one instant: Gauss’s law ties them together at each moment.'),
      choices: [t`$\nabla\cdot\vec E = \rho/\varepsilon_0$`, t`$\nabla\cdot\vec B = 0$`, t`$\nabla\times\vec E = -\partial_t\vec B$`, t`$\nabla\times\vec B = \mu_0\vec J + \mu_0\varepsilon_0\,\partial_t\vec E$`],
      answer: [0, 1],
      why: { 2: 'Faraday’s law holds ∂ₜB: it says how B evolves.', 3: 'Ampère–Maxwell holds ∂ₜE: it says how E evolves.' },
      hints: ['Look for a time derivative in each equation.'],
      teach: 'Equations without time derivatives constrain each moment; those with them evolve the fields.',
      explain: t`Gauss’s two laws contain no $\partial_t$: they are the constraints. Faraday’s and Ampère’s laws (three components each) are the six evolution equations — one for each unknown.`,
    }),
    mcq({
      id: 'why-kept', difficulty: 2,
      prompt: t`Why does exact evolution under Faraday’s and Ampère’s laws keep $\nabla\cdot\vec E = \rho/\varepsilon_0$ true if it holds at $t = 0$?`,
      visual: con({ mode: 'maxwell', scheme: 'staggered', N: 100, t: 4, tmax: 5 }, 'A scheme built to mimic the continuum identities: the violation stays at round-off as the charge moves.'),
      choices: [t`The divergence of a curl is zero, so $\partial_t(\nabla\cdot\vec E) = -\nabla\cdot\vec J/\varepsilon_0$, which equals $\partial_t\rho/\varepsilon_0$ by charge conservation`, 'The evolution equations contain Gauss’s law, so they enforce it at every step', 'Gauss’s law is a boundary condition, imposed at the edges at every moment', 'Electric fields are too small to violate it noticeably'],
      answer: 0,
      why: { 1: 'Faraday and Ampère never mention ∇·E. The constraint is kept by an identity, not imposed.', 2: 'Gauss’s law holds at every point inside, not only at the edges; and it is not imposed — it is propagated.', 3: 'Violations have nothing to do with field strength; the identity is exact.' },
      hints: ['Take the divergence of Ampère’s law.', t`$\nabla\cdot(\nabla\times\vec B) = 0$ identically.`],
      teach: 'Constraints ride along because of an identity (div curl = 0) plus a conservation law (charge).',
      explain: t`$\nabla\cdot$(Ampère): $0 = \mu_0\nabla\cdot\vec J + \mu_0\varepsilon_0\,\partial_t\nabla\cdot\vec E$. With $\partial_t\rho = -\nabla\cdot\vec J$, this is $\partial_t(\nabla\cdot\vec E - \rho/\varepsilon_0) = 0$. In general relativity the same role is played by the Bianchi identity and energy–momentum conservation, $\nabla_\mu T^{\mu\nu} = 0$.`,
    }),
    num({
      id: 'cell-charge', difficulty: 2,
      gen(r) {
        const dxmm = r.pick([1, 2, 5]), E1 = r.pick([120, 300, 450]), dE = r.pick([-60, -25, 40, 90]);
        const E2 = E1 + dE, rho = (8.854e-12 * dE) / (dxmm / 1000);
        return {
          prompt: t`On a staggered grid the field $E_x$ is stored at cell faces. The two faces of one cell, ${dxmm} mm apart, carry $E_x = ${E1}$ V/m (left) and $${E2}$ V/m (right). What charge density does the discrete Gauss law $\varepsilon_0(E_{j+1/2} - E_{j-1/2})/\Delta x = \rho_j$ assign to the cell, in C/m³? ($\varepsilon_0 = 8.854\times10^{-12}$ F/m)`,
          visual: { type: 'graph', params: { x: [-1.5, 1.5], y: [0, Math.max(E1, E2) * 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'x (cells; the cell is between the faces)', ylabel: 'Eₓ (V/m)', xticks: 6, shade: [{ fn: `${Math.max(E1, E2) * 1.3}`, from: -0.5, to: 0.5, color: 'gold', alpha: 0.12 }], curves: [], points: [{ x: -0.5, y: E1, color: 'accent', r: 6, label: `${E1} V/m` }, { x: 0.5, y: E2, color: 'accent', r: 6, label: `${E2} V/m` }], vlines: [{ x: -0.5, color: 'ink3' }, { x: 0.5, color: 'ink3' }] }, caption: 'One cell (shaded) with the field stored on its two faces.' },
          answer: rho, units: 'C/m^3', tol: { rel: 0.005 },
          errors: [{ value: 8.854e-12 * dE / dxmm, feedback: 'Convert the spacing to metres.' }, { value: dE / (dxmm / 1000), feedback: t`Multiply by $\varepsilon_0$: Gauss’s law gives $\rho = \varepsilon_0\,\Delta E/\Delta x$.` }],
          hints: [t`$\Delta E = ${E2} - ${E1} = ${dE}$ V/m, $\Delta x = ${tex(dxmm / 1000)}$ m.`, t`$\rho = \varepsilon_0\,\Delta E/\Delta x$.`],
          teach: 'On a staggered grid, Gauss’s law becomes a difference of face values: flux out of a cell equals the charge inside.',
          explain: t`$\rho = 8.854\times10^{-12}\times${dE}/${tex(dxmm / 1000)} = ${tex(rho, 3)}$ C/m³. This is the integral form — flux out of the cell equals the charge in it — which is why a scheme that moves charge by face fluxes and updates face fields by the same fluxes keeps it exactly.`,
        };
      },
    }),
    num({
      id: 'drift-rate', difficulty: 3,
      gen(r) {
        const v = r.pick([0.5, 1, 2]), N = r.pick([50, 100, 200]), w = r.pick([0.4, 0.6, 1]);
        const dx = 10 / N, rate = (v * dx) / (w * w);
        return {
          prompt: t`In the collocated scheme the Gauss violation grows at first as $C_t \approx -\tfrac12 v\,\Delta x\,\rho_{xx}$. A blob $\rho = e^{-x^2/w^2}$ with $w = ${w}$ m moves at $v = ${v}$ m/s on a grid with $\Delta x = ${r3(dx)}$ m. What is the initial rate of growth of $\max|C|$, per second? (The largest $|\rho_{xx}|$ is $2/w^2$, at the blob’s centre.)`,
          visual: con({ mode: 'maxwell', scheme: 'collocated', N: 100, t: 0.3, tmax: 5 }, 'A collocated run 0.3 s in (other numbers than this problem’s): the violation grows fastest where the blob curves most.'),
          answer: rate, units: '1/s', tol: { rel: 0.005 },
          errors: [{ value: rate / 2, feedback: t`$\tfrac12v\,\Delta x\times2/w^2 = v\,\Delta x/w^2$ — the factors of 2 cancel.` }, { value: v * dx / w, feedback: t`$\rho_{xx}$ scales as $1/w^2$, not $1/w$.` }].filter((e) => Math.abs(e.value - rate) > 0.01 * rate),
          hints: [t`At the centre $|\rho_{xx}| = 2/w^2 = ${r3(2 / (w * w))}\ \text{m}^{-2}$.`, t`$|C_t| = \tfrac12 v\,\Delta x\cdot 2/w^2 = v\,\Delta x/w^2$.`],
          teach: 'The drift rate is set by the scheme’s numerical diffusion acting on the charge’s curvature: first order in Δx.',
          explain: t`$v\,\Delta x/w^2 = ${v}\times${r3(dx)}/${w}^2 = ${r3(rate)}$ per second (in units of the peak charge density). Halve $\Delta x$ and it halves — the violation converges, but only at first order, because the charge update is first order.`,
        };
      },
    }),
    mcq({
      id: 'resolve', difficulty: 2,
      prompt: t`A student says: “Since Gauss’s law is part of Maxwell’s equations, a simulation must solve $\nabla\cdot\vec E = \rho/\varepsilon_0$ again at every time step.” What is right?`,
      visual: con({ mode: 'maxwell', scheme: 'collocated', N: 100, t: 5, tmax: 10 }, 'A scheme that does not respect the identities: the violation sits at the truncation level.'),
      choices: ['Not necessary in principle — the evolution preserves it — but a code must either be built to keep its discrete version, or monitor it and correct or damp the drift', 'Yes, always: evolution equations cannot preserve a constraint', 'No: Gauss’s law can be ignored once the initial data satisfy it, whatever the scheme', 'Only in three dimensions; in one dimension it is automatic'],
      answer: 0,
      why: { 1: 'The continuum evolution preserves it exactly; re-solving it (a “projection”) is one remedy among several, and costs an elliptic solve per step.', 2: 'The collocated run shows otherwise: a scheme whose discrete identities do not match drifts.', 3: 'The one-dimensional run in the picture drifts.' },
      hints: ['What does the exact evolution do to the constraint? What did the collocated run do?'],
      teach: 'Constraints are propagated, not imposed — but only a matching scheme propagates them exactly; others must monitor, correct or damp.',
      explain: t`Three strategies exist in practice: **build** the scheme so its discrete constraint is an identity (Yee’s staggered grid keeps $\nabla\cdot\vec B = 0$; charge-conserving current deposition keeps Gauss’s law in particle codes); **project**, solving an elliptic equation now and then to remove the violation; or **damp** it with extra terms that make violations decay (next lesson). Numerical relativity mostly monitors and damps.`,
    }),
    mcq({
      id: 'toy-still', difficulty: 3,
      prompt: t`A toy system from numerical relativity evolves the wave equation in first-order form, $u_t = \pi$, $\pi_t = \varphi_x$, $\varphi_t = \pi_x$, where the extra field $\varphi$ stands for $u_x$. Its constraint is $C = \varphi - u_x$. The run starts with $\varphi$ 10% too large. What happens to the violation as the wave moves?`,
      visual: con({ mode: 'wave', gamma: 0, eps: 0.1, N: 100, t: 2, tmax: 6 }, 'The toy at t = 2 s: the wave u (blue) has moved off; compare where the violation (red) sits.'),
      choices: [t`It stays exactly where and as it began: $C_t = \varphi_t - \pi_x = 0$, so it neither moves, grows nor decays`, 'It travels with the wave at speed 1', 'It decays, because the wave equation conserves energy', 'It grows linearly, because the evolution never checks it'],
      answer: 0,
      why: { 1: t`$C$ obeys $C_t = 0$, an equation with zero speed: nothing carries it anywhere.`, 2: t`Energy conservation is about $u$, not about $C$, which obeys $C_t = 0$ exactly.`, 3: t`It does not grow either: $C_t = 0$ exactly, even with centred differences in place of $\partial_x$.` },
      hints: [t`Differentiate $C = \varphi - u_x$ in time and use the evolution equations.`, t`$\varphi_t = \pi_x$ and $(u_x)_t = (u_t)_x = \pi_x$.`],
      teach: t`Constraint violations obey their own evolution equation — here the trivial one, $C_t = 0$.`,
      explain: t`$C_t = \varphi_t - (u_t)_x = \pi_x - \pi_x = 0$: the violation is frozen in place. Meanwhile the wrong $\varphi$ feeds $\pi_t = \varphi_x$, so the *solution* is wrong — the wave splits off a spurious part. A violation that can never leave the grid is an invitation to trouble; the next lesson adds a term that makes it decay.`,
    }),
    code({
      id: 'maxwell-drift', difficulty: 3,
      prompt: t`Reproduce the drift. \`setup(N)\` (given) returns the spacing, the blob, the background density, and two starting fields that satisfy Gauss’s law exactly: \`Es\` (staggered) and \`Ec\` (collocated). Write \`violation(N, scheme)\`: for $T = 5$ s at $v = 1$ m/s and $\nu = 0.5$, update \`E = E - dt*v*blob\` and then \`blob = blob - nu*(blob - np.roll(blob, 1))\` each step, and return $\max|C|$ at the end, with $C$ = \`(E - np.roll(E, 1))/dx - rho\` (staggered) or \`(np.roll(E, -1) - np.roll(E, 1))/(2*dx) - rho\` (collocated), where \`rho = blob - mean\`. Set \`c100\`, \`c200\` (collocated) and \`s100\` (staggered).`,
      starter: t`import numpy as np

def setup(N, L=10.0, w=0.6):
    dx = L / N
    x = np.arange(N) * dx
    X = (x - L / 4 + L / 2) % L - L / 2
    blob = np.exp(-X**2 / w**2)
    mean = blob.mean()                  # the neutralizing background
    rho = blob - mean
    Es = np.cumsum(dx * rho); Es -= Es.mean()
    Ec = np.zeros(N)
    for s in (0, 1):                    # solve the centred Gauss law on even and odd points
        for j in range(s, N - 2, 2):
            Ec[j + 2] = Ec[j] + 2 * dx * rho[j + 1]
        Ec[s::2] -= Ec[s::2].mean()
    return dx, blob, mean, Es, Ec

def violation(N, scheme, T=5.0, v=1.0, nu=0.5):
    dx, blob, mean, Es, Ec = setup(N)
    pass

c100 = None
c200 = None
s100 = None
print(c100, c200, s100)
`,
      answer: t`import numpy as np

def setup(N, L=10.0, w=0.6):
    dx = L / N
    x = np.arange(N) * dx
    X = (x - L / 4 + L / 2) % L - L / 2
    blob = np.exp(-X**2 / w**2)
    mean = blob.mean()                  # the neutralizing background
    rho = blob - mean
    Es = np.cumsum(dx * rho); Es -= Es.mean()
    Ec = np.zeros(N)
    for s in (0, 1):                    # solve the centred Gauss law on even and odd points
        for j in range(s, N - 2, 2):
            Ec[j + 2] = Ec[j] + 2 * dx * rho[j + 1]
        Ec[s::2] -= Ec[s::2].mean()
    return dx, blob, mean, Es, Ec

def violation(N, scheme, T=5.0, v=1.0, nu=0.5):
    dx, blob, mean, Es, Ec = setup(N)
    E = (Es if scheme == 'staggered' else Ec).copy()
    dt = nu * dx / v
    for n in range(round(T / dt)):
        E = E - dt * v * blob
        blob = blob - nu * (blob - np.roll(blob, 1))
    rho = blob - mean
    if scheme == 'staggered':
        C = (E - np.roll(E, 1)) / dx - rho
    else:
        C = (np.roll(E, -1) - np.roll(E, 1)) / (2 * dx) - rho
    return np.max(np.abs(C))

c100 = violation(100, 'collocated')
c200 = violation(200, 'collocated')
s100 = violation(100, 'staggered')
print(c100, c200, s100)`,
      tests: [
        { name: t`collocated, $N = 100$: the violation has drifted to about ${r3(last(R100))}`, code: `c100 is not None and abs(c100 - ${last(R100)}) < 1e-3` },
        { name: t`collocated: doubling $N$ halves it (first order)`, code: 'c200 is not None and abs(np.log2(c100 / c200) - 1) < 0.05' },
        { name: 'staggered: Gauss’s law holds to round-off', code: 's100 is not None and s100 < 1e-12' },
      ],
      hints: ['Copy the right starting field, then loop round(T/dt) times with the two update lines in the order given.', 'After the loop, `rho = blob - mean`, then the two formulas for C.', 'Return `np.max(np.abs(C))`; then call `violation(100, \'collocated\')` and so on.'],
      teach: 'A constraint is kept by a scheme only if its discrete divergence and discrete conservation law are built from the same differences.',
      explain: t`The collocated violation comes out $${r3(last(R100))}$ at $N = 100$ and $${r3(last(R200))}$ at $N = 200$; the staggered one about $10^{-14}$. Nothing about the physics differs between the two — the staggered field is changed by exactly the flux that moved the charge, so “flux out of each cell = change of charge in it” holds to the last bit.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-pic', difficulty: 3, transfer: true,
      prompt: t`A particle-in-cell code simulates the plasma plume of a Hall-effect thruster: ions and electrons are particles, fields live on a grid. Each step it deposits the particles’ charge onto grid points with one weighting rule and their current with another, then advances $\vec E$ with Ampère’s law. After many steps, $\nabla\cdot\vec E - \rho/\varepsilon_0$ on the grid has grown well above round-off and the plume shows spurious fields. What is the standard remedy?`,
      visual: con({ mode: 'maxwell', scheme: 'collocated', N: 50, t: 6, tmax: 10 }, 'A one-dimensional stand-in: charge moved one way, field updated another — Gauss’s law drifts.'),
      choices: ['Deposit the current so that it satisfies the discrete continuity equation exactly with the deposited charge (charge-conserving deposition), or correct E by solving a Poisson equation', 'Use a smaller time step: the drift is a CFL violation', 'Use double precision: the drift is round-off', 'Add more particles: the drift is statistical noise and averages out'],
      answer: 0,
      why: { 1: 'The run is stable; the violation comes from mismatched discrete operators, and a smaller step leaves the mismatch.', 2: 'The violation is far above round-off; precision is not the issue.', 3: 'More particles reduce noise, but a systematic mismatch between charge and current deposition remains.' },
      hints: ['In the continuum, Gauss’s law is kept by charge conservation. What must hold on the grid?', 'The field update sees the current; the Gauss check sees the charge. The two must satisfy the discrete continuity equation together.'],
      teach: 'Gauss’s law survives on a grid only if the current used by the field update conserves the charge used by the Gauss check.',
      explain: t`Charge-conserving deposition (Villasenor and Buneman, 1992; Esirkepov, 2001) builds the current from each particle’s motion so that the discrete continuity equation holds exactly; on a Yee grid Gauss’s law then rides along to round-off. The alternative, a Poisson correction (a “projection”), costs an elliptic solve. Either way the cure is to make the discrete identities match the continuum ones.`,
    }),
    num({
      id: 'cp-order', difficulty: 2,
      gen(r) {
        const Nf = r.pick([200, 400, 800]);
        return {
          prompt: t`In the collocated run, $\max|C| = ${r3(last(R100))}$ after 5 s with $N = 100$ grid points. The violation is first order in $\Delta x$. Predict it with $N = ${Nf}$.`,
          visual: con({ mode: 'maxwell', scheme: 'collocated', N: 100, t: 5, tmax: 5 }, 'The N = 100 run after 5 s.'),
          answer: last(R100) * 100 / Nf, tol: { rel: 0.02 },
          errors: [{ value: last(R100) * (100 / Nf) ** 2, feedback: 'First order: the error scales as Δx, not Δx².' }],
          hints: [t`$\max|C| \propto \Delta x \propto 1/N$.`],
          teach: 'A first-order constraint violation halves when the grid spacing halves.',
          explain: t`$${r3(last(R100))}\times100/${Nf} = ${r3((last(R100) * 100) / Nf)}$. (The model’s own run at $N = 200$ gives $${r3(last(R200))}$.) Converging, but slowly: a first-order drift needs ${Nf / 100} times the points to cut it ${Nf / 100}-fold.`,
        };
      },
    }),
    mcq({
      id: 'cp-count', difficulty: 2,
      prompt: t`Count for Maxwell’s equations in vacuum: 6 unknowns ($\vec E$, $\vec B$), 6 evolution equations, 2 constraints. Electromagnetic waves have two polarizations. Which statement best explains why the constraints do not over-determine the system?`,
      visual: { type: 'em-wave', params: { phase: 30, readout: false, controls: false }, caption: 'A plane light wave: E and B transverse to the direction of travel — two polarizations.' },
      choices: ['The evolution preserves the constraints, so they restrict only the initial data — removing the longitudinal parts, which leaves transverse waves', 'The constraints are only approximately true', 'There are really only 4 unknowns', 'The evolution equations are not independent'],
      answer: 0,
      why: { 1: 'Gauss’s laws are exact.', 2: 'All six components are unknowns; the constraints restrict which values are allowed.', 3: 'The six evolution equations are independent; it is the constraints that are compatible with them.' },
      hints: [t`In a plane wave, what do $\nabla\cdot\vec E = 0$ and $\nabla\cdot\vec B = 0$ say about the components along the direction of travel?`],
      teach: 'Constraints that the evolution preserves restrict only the initial data — they cut out non-propagating parts of the fields.',
      explain: t`For a plane wave $e^{i\vec k\cdot\vec x}$ the constraints say $\vec k\cdot\vec E = \vec k\cdot\vec B = 0$: no longitudinal parts. What is left is transverse — and Faraday’s law ties $\vec B$ to $\vec E$, leaving two independent polarizations. Einstein’s equations repeat the pattern with 4 constraints and 4 gauge functions, leaving the two polarizations of gravitational waves.`,
    }),
  ],
  sources: [GRIFFITHS, YEE, ESIRKEPOV, SRC.strauss],
});
