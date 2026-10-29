// Phase space and Liouville's theorem (Taylor §13.6–13.7; Goldstein §9.9):
// the state (q, p) is a point; Hamilton's equations make the phase plane a
// flow whose velocity (q̇, ṗ) = (∂H/∂p, −∂H/∂q) has zero divergence, because
// mixed partial derivatives commute. So a region of initial conditions keeps
// its area (2n-volume) however it is sheared and stretched; friction
// (ṗ = … − (b/m)p) gives divergence −b/m and areas shrink as e^{−bt/m}.
// Phase portraits: libration inside the pendulum's separatrix (H = mgℓ),
// rotation outside; autonomous trajectories never cross. Numerics: explicit
// Euler multiplies areas by 1 + (hω)² per step, a symplectic step by exactly
// 1 (prog.P11.3, st-f F10). Worked: a blob of pendulum starts carried by the
// flow, its area computed. Transfer: beam emittance — focusing a beam to a
// smaller spot widens its angular spread.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sci, distinct, G } from './_cm.js';
import { planePic } from './_cm4.js';

const t = String.raw;

// carry a disc of pendulum states (q̈ = −sin q − b q̇) for time T with RK4 and measure its area (shoelace)
function blobArea(c, rad, T, b = 0, n = 720, steps = 2000) {
  const f = (s) => [s[1], -Math.sin(s[0]) - b * s[1]];
  const h = T / steps;
  const pts = Array.from({ length: n }, (_, k) => [c[0] + rad * Math.cos((2 * Math.PI * k) / n), c[1] + rad * Math.sin((2 * Math.PI * k) / n)]);
  const moved = pts.map((s0) => {
    let s = s0.slice();
    for (let i = 0; i < steps; i++) {
      const k1 = f(s), k2 = f([s[0] + (h / 2) * k1[0], s[1] + (h / 2) * k1[1]]), k3 = f([s[0] + (h / 2) * k2[0], s[1] + (h / 2) * k2[1]]), k4 = f([s[0] + h * k3[0], s[1] + h * k3[1]]);
      s = [s[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), s[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
    }
    return s;
  });
  let A = 0;
  for (let k = 0; k < n; k++) { const [x1, y1] = moved[k], [x2, y2] = moved[(k + 1) % n]; A += x1 * y2 - x2 * y1; }
  return Math.abs(A) / 2;
}

const EX = (() => {
  const c = [0.3, 1.4], rad = 0.3, A0 = Math.PI * rad * rad;
  const A4 = blobArea(c, rad, 4), A8 = blobArea(c, rad, 8), b = 0.1, Ad = blobArea(c, rad, 8, b);
  return { c, rad, A0, A4, A8, b, Ad, Ad0: A0 * Math.exp(-b * 8) };
})();

const pend = (extra = {}) => ({ fx: 'y', fy: '-sin(x)', x: [-6.5, 6.5], y: [-2.8, 2.8], xlabel: 'q = θ (rad)', ylabel: 'p', levels: { fn: 'y^2/2 - cos(x)', values: [-0.6, 0, 0.6, 1.5, 2.4], highlight: [1] }, grid: 19, ...extra });

export default lesson({
  id: 'phys3550.M9.2',
  title: 'Phase space and Liouville’s theorem',
  minutes: 18, difficulty: 3,
  intro: t`A Hamiltonian system's state is one point $(q, p)$ in **phase space**, and Hamilton's equations give that point a velocity $(\dot q, \dot p)$ everywhere: the motion is a flow, like a fluid streaming through the plane. Through each point passes exactly one trajectory, so (with no explicit $t$) trajectories never cross. Now follow not one start but a whole **blob** of them. The flow stretches it, shears it, wraps it round — but **never changes its area**. That is Liouville's theorem, and it follows in one line from Hamilton's equations: the flow has zero divergence. Friction breaks it, and phase-space areas shrink.`,
  equation: t`\nabla\cdot(\dot q, \dot p) = \frac{\partial}{\partial q}\frac{\partial H}{\partial p} + \frac{\partial}{\partial p}\Big(-\frac{\partial H}{\partial q}\Big) = 0 \quad\Longrightarrow\quad \frac{dA}{dt} = 0`,
  symbols: [
    { tex: '(q, p)', text: 'a point in phase space: a coordinate and its canonical momentum (for $n$ coordinates, $2n$ numbers)' },
    { tex: '(\\dot q, \\dot p)', text: 'the phase-space velocity, from Hamilton’s equations' },
    { tex: '\\nabla\\cdot', text: 'the divergence: how fast the flow spreads out of a small region (per unit area, per second)' },
    { tex: 'A', text: 'the area of a region of initial conditions carried along by the flow (in units of $q$ times $p$, e.g. J·s); with $n$ coordinates, its $2n$-dimensional volume' },
  ],
  why: t`Liouville's theorem is why statistical mechanics can count states by phase-space volume ([ensembles](#/lesson/phys3700.T9.1)), why a particle beam cannot be focused tighter without spreading in angle, and why **symplectic** integrators keep long orbit simulations honest ([P11.3](#/lesson/prog.P11.3), [leapfrog](#/lesson/st-f.F10.1)).`,
  visual: {
    type: 'de-plane',
    title: 'A blob of pendulums',
    lead: t`The pendulum's phase plane ($m\ell^2 = 1$, $g/\ell = 1$). The dashed disc is a set of starting states; the gold region is where the flow has carried them after time $t$. Slide $t$, then add friction $b$.`,
    tasks: [
      t`With $b = 0$, slide $t$ up to 10: the blob is sheared into a long curved strip — states near the separatrix (gold curve) lag behind — but its area never changes.`,
      t`Turn up the friction to $b = 0.2$: now the region shrinks as it spirals toward the bottom of the well, its area falling as $e^{-bt}$.`,
      t`Notice the strip never crosses itself: two different states can never flow into the same one.`,
    ],
    params: pend({ fy: '-sin(x) - b*y', equal: false, aspect: 'wide', field: true, flow: { t: 'tf', shape: 'disc', at: EX.c, size: EX.rad }, sliders: [
      { key: 'tf', label: 'Time $t$', min: 0, max: 10, step: 0.05, value: 2, unit: '', explain: 'How long the flow has carried the starting states (in units of $\\sqrt{\\ell/g}$).' },
      { key: 'b', label: 'Friction $b$', min: 0, max: 0.3, step: 0.01, value: 0, unit: '', explain: 'A drag term $-b\\,p$ in $\\dot p$. Zero is a Hamiltonian system.' },
    ], click: false, readout: false }),
    caption: t`An ideal pendulum ($m\ell^2 = 1$, $g/\ell = 1$), with optional linear drag. Each point of the disc's outline is integrated numerically (RK4); grey curves are levels of $H$ (exact only for $b = 0$).`,
  },
  example: {
    prompt: t`A disc of pendulum states, radius ${EX.rad} centred at $(q, p) = (${EX.c[0]}, ${EX.c[1]})$ (units with $m\ell^2 = 1$, $g/\ell = 1$), is carried by the flow. Show that its area cannot change, then check numerically after $t = 4$ and $t = 8$, and again with friction $b = ${EX.b}$.`,
    visual: planePic(pend({ equal: false, flow: { t: 8, shape: 'disc', at: EX.c, size: EX.rad } }), t`The disc (dashed) and the region it has flowed into by $t = 8$ (gold), with no friction.`),
    steps: [
      { label: 'The flow', text: t`$H = \tfrac12p^2 - \cos q$ gives $\dot q = \partial H/\partial p = p$ and $\dot p = -\partial H/\partial q = -\sin q$: a velocity field on the plane.` },
      { label: 'Divergence', text: t`$\frac{\partial\dot q}{\partial q} + \frac{\partial\dot p}{\partial p} = \frac{\partial p}{\partial q} + \frac{\partial(-\sin q)}{\partial p} = 0 + 0$. In general it is $\frac{\partial^2H}{\partial q\partial p} - \frac{\partial^2H}{\partial p\partial q} = 0$, for every Hamiltonian.` },
      { label: 'Area', text: t`For any velocity field, the area of a region carried by the flow changes at $\frac{dA}{dt} = \iint\nabla\cdot\vec v\,dA$ (the flux out through its boundary — the divergence theorem). Zero divergence: constant area.` },
      { label: 'Check', text: t`The disc starts with $A = \pi(${EX.rad})^2 = ${sci(EX.A0, 4)}$. Carrying 720 points of its edge numerically and measuring the enclosed area: $${sci(EX.A4, 4)}$ at $t = 4$ and $${sci(EX.A8, 4)}$ at $t = 8$ — unchanged, though the shape is now a long arc.` },
      { label: 'Friction', text: t`With $\dot p = -\sin q - bp$, the divergence is $-b$, so $A = A_0e^{-bt}$: predicted $${sci(EX.Ad0, 4)}$ at $t = 8$; measured $${sci(EX.Ad, 4)}$. Dissipation shrinks phase-space volume, which is how a damped system forgets where it started and settles on an attractor.` },
    ],
    answer: t`The divergence of a Hamiltonian flow is $\partial^2H/\partial q\partial p - \partial^2H/\partial p\partial q = 0$, so the area stays $${sci(EX.A0, 4)}$ (measured $${sci(EX.A8, 4)}$ at $t = 8$). With friction $b$ it decays as $e^{-bt}$, to $${sci(EX.Ad, 3)}$ at $t = 8$.`,
  },
  practice: [
    mcq({
      id: 'divergence', difficulty: 2,
      prompt: t`For any Hamiltonian $H(q, p)$, what is the divergence of the phase-space velocity $(\dot q, \dot p)$?`,
      visual: planePic(pend({ equal: false, field: true }), t`The pendulum's phase-space velocity field (arrows: direction only).`),
      choices: [t`Zero, because $\partial^2H/\partial q\partial p = \partial^2H/\partial p\partial q$`, t`$2H$`, t`$\partial H/\partial t$`, t`It depends on $H$: zero only for the harmonic oscillator`],
      answer: 0,
      why: { 1: t`Compute it: $\partial_q(\partial_pH) + \partial_p(-\partial_qH)$. Mixed partials of a smooth function are equal, so the two terms cancel.`, 2: t`$\partial H/\partial t$ is what changes $H$ along the motion; it does not appear in the divergence.`, 3: t`It vanishes for every $H$ — that generality is the power of Liouville's theorem.` },
      hints: [t`$\dot q = \partial H/\partial p$, $\dot p = -\partial H/\partial q$. Differentiate the first by $q$ and the second by $p$.`],
      teach: t`Hamilton's equations make the phase-space flow divergence-free, whatever $H$ is.`,
      explain: t`$\nabla\cdot(\dot q, \dot p) = \partial_q\partial_pH - \partial_p\partial_qH = 0$. With many coordinates the same cancellation happens pair by pair: the flow is incompressible in all $2n$ dimensions.`,
    }),
    num({
      id: 'damped-area', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 1, 2]), b = r.pick([0.05, 0.1, 0.2]), T = r.pick([5, 10, 20]);
        const ratio = Math.exp((-b * T) / m);
        return {
          prompt: t`A ${m} kg mass on a spring has linear drag: $\dot x = p/m$, $\dot p = -kx - (b/m)p$ with $b = ${b}$ kg/s. A small patch of initial states has area $A_0$ in the $(x, p)$ plane. What is $A/A_0$ after ${T} s?`,
          answer: ratio, tol: { rel: 0.005 },
          errors: distinct([{ value: Math.exp(-b * T), feedback: t`The divergence is $\partial\dot p/\partial p = -b/m$, not $-b$.` }, { value: Math.exp((-b * T) / (2 * m)), feedback: t`That is how the **amplitude** decays ($e^{-bt/2m}$). Area is a product of two such shrinking widths: $e^{-bt/m}$.` }, { value: 1, feedback: t`Drag makes the flow non-Hamiltonian: its divergence is $-b/m$.` }], ratio),
          hints: [t`Divergence: $\partial\dot x/\partial x + \partial\dot p/\partial p$.`, t`$dA/dt = (\nabla\cdot\vec v)A = -(b/m)A$, so $A = A_0e^{-bt/m}$.`],
          teach: t`Friction gives the phase flow a negative divergence, and areas shrink exponentially.`,
          explain: t`$\nabla\cdot\vec v = -b/m = ${-b / m}\ \text{s}^{-1}$, so $A/A_0 = e^{-${b}\times${T}/${m}} = ${sci(ratio, 3)}$. Each width shrinks as the amplitude does, $e^{-bt/2m}$, and the area as their product.`,
          visual: planePic({ fx: 'y', fy: '-x - 0.15*y', x: [-2.5, 2.5], y: [-2, 2], xlabel: 'x', ylabel: 'p', equal: true, aspect: '', grid: 15, flow: { t: 6, shape: 'disc', at: [1.2, 0.5], size: 0.35 } }, t`A damped oscillator (illustrative units): a disc of starting states (dashed) and where they are later (gold), smaller and nearer the origin.`),
        };
      },
    }),
    num({
      id: 'separatrix', difficulty: 2,
      gen(r) {
        const l = r.pick([0.25, 0.5, 1, 2]);
        const v = 2 * Math.sqrt(G * l);
        return {
          prompt: t`A pendulum of length ${l} m hangs straight down. Its phase portrait has a separatrix through the inverted position. What speed at the bottom puts it exactly on the separatrix (just reaching the top)?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(2 * G * l), feedback: t`The bob must rise $2\ell$ (from bottom to top), not $\ell$.` }, { value: Math.sqrt(G * l), feedback: t`That is $\sqrt{g\ell}$, the minimum speed **at the top** for a bob on a string. A rigid rod may arrive at the top at rest: $\tfrac12mv^2 = 2mg\ell$.` }], v),
          hints: [t`On the separatrix $H$ equals its value at the inverted equilibrium: $H = mg\ell$ with $U = -mg\ell\cos\theta$.`, t`At the bottom $U = -mg\ell$, so $\tfrac12mv^2 = 2mg\ell$.`],
          teach: t`The separatrix is the energy of the unstable equilibrium; it divides swinging (libration) from going over the top (rotation).`,
          explain: t`$v = 2\sqrt{g\ell} = ${sci(v, 3)}$ m/s. Slower: the pendulum swings back and forth (closed loops in phase space). Faster: it goes over the top (wavy lines with $q$ growing). Exactly this: it creeps up to the top and takes forever to arrive.`,
          visual: planePic(pend({ equal: false, field: false }), t`The pendulum's phase portrait: closed loops (libration), wavy lines (rotation) and the gold separatrix between them.`),
        };
      },
    }),
    mcq({
      id: 'no-crossing', difficulty: 1,
      prompt: t`A student sketches a phase portrait for a pendulum in which two trajectories cross at a point. What is wrong?`,
      visual: planePic(pend({ equal: false, seeds: [[1, 0], [0, 1.6], [-2.5, 2.2]], seedColor: 'accent' }), t`Three true trajectories of the pendulum: they never cross. (Where curves meet, at the inverted equilibrium, the motion takes infinitely long to arrive.)`),
      choices: [t`From any state, Hamilton's equations give one velocity, so only one trajectory passes through each point (when $H$ has no explicit $t$)`, t`Nothing: trajectories cross wherever the energies match`, t`Trajectories may cross, but only at $p = 0$`, t`Crossing is forbidden only for the harmonic oscillator`],
      answer: 0,
      why: { 1: t`Equal energies make two trajectories lie on the same level curve; they still cannot cross, since a crossing point would need two different velocities.`, 2: t`At $p = 0$ every trajectory still has a single, definite $\dot p$.`, 3: t`The argument uses only that $(\dot q, \dot p)$ is a single-valued function of $(q, p)$ — true for any time-independent $H$.` },
      hints: [t`At a crossing point the state $(q, p)$ would have to move two ways at once. What do Hamilton's equations say it does?`],
      teach: t`The state determines its own future: phase-space trajectories of an autonomous system never cross.`,
      explain: t`$(q, p)$ fixes $(\dot q, \dot p)$ uniquely, so the future (and past) is unique. The separatrices meeting at the inverted pendulum are not a crossing: that point is an equilibrium, approached only as $t \to \pm\infty$.`,
    }),
    num({
      id: 'euler-area', difficulty: 3,
      gen(r) {
        const w = 1, h = r.pick([0.01, 0.02, 0.05]), N = r.pick([200, 500, 1000]);
        const ratio = Math.pow(1 + (h * w) ** 2, N);
        return {
          prompt: t`The explicit Euler method applied to an oscillator ($\omega = 1$ rad/s) maps one step as $(x, v) \to (x + hv,\ v - h\omega^2x)$. That is a linear map with determinant $1 + (h\omega)^2$, so it multiplies phase-space areas by that factor each step. With $h = ${h}$ s, by what factor has a patch of initial conditions grown after ${N} steps?`,
          answer: ratio, tol: { rel: 0.005 },
          errors: distinct([{ value: 1 + N * (h * w) ** 2, feedback: t`The factor compounds: $(1 + h^2\omega^2)^N$, not $1 + Nh^2\omega^2$.` }, { value: 1, feedback: t`That is the symplectic (semi-implicit) Euler map, $v \to v - h\omega^2x$ then $x \to x + hv$: its determinant is exactly 1. Plain Euler's is not.` }], ratio),
          hints: [t`$\det\begin{bmatrix} 1 & h \\ -h\omega^2 & 1 \end{bmatrix} = 1 + h^2\omega^2$.`, t`After $N$ steps: $(1 + h^2\omega^2)^N$.`],
          teach: t`A numerical method that does not preserve phase-space area cannot keep a Hamiltonian system's energy bounded; symplectic methods preserve it exactly.`,
          explain: t`$(1 + ${h}^2)^{${N}} = ${sci(ratio, 4)}$: the Euler orbit spirals outward, gaining energy every step. A symplectic step has determinant exactly 1, obeys Liouville's theorem, and keeps the energy error bounded for ever — see [P11.3](#/lesson/prog.P11.3) and [why symplectic integrators keep energy bounded](#/lesson/st-f.F10.2).`,
          visual: planePic({ fx: 'y', fy: '-x', x: [-2.5, 2.5], y: [-2, 2], xlabel: 'x', ylabel: 'v', equal: true, aspect: '', grid: 15, curves: [{ param: ['exp(0.04*t)*cos(t)', '-exp(0.04*t)*sin(t)'], t: [0, 12.5], color: 'bad', width: 1.6 }], levels: { fn: 'x^2/2 + y^2/2', values: [0.5] } }, t`The true orbit (grey circle) and the outward spiral an explicit-Euler solution follows (red; growth exaggerated).`),
        };
      },
    }),
    mcq({
      id: 'libration', difficulty: 1,
      prompt: t`A pendulum's state is marked P in its phase portrait. What is it doing?`,
      visual: planePic(pend({ equal: false, points: [{ x: 0.5, y: 2.3, label: 'P', color: 'gold', r: 5 }] }), t`The pendulum's phase portrait with one state marked.`),
      choices: [t`Going over the top: P is outside the separatrix, on a wavy line where $q$ keeps increasing`, t`Swinging back and forth, because P is near the bottom ($q \approx 0.5$ rad)`, t`At rest, because P is on a grey curve`, t`Falling toward the inverted position, where it will stop`],
      answer: 0,
      why: { 1: t`Its angle is small but its momentum is large: P lies above the gold separatrix, on an open curve.`, 2: t`Every point lies on a grey curve: those are paths, not rest states. Rest is only at the equilibria, where $p = 0$ and $\sin q = 0$.`, 3: t`It would stop at the top only exactly on the separatrix.` },
      hints: [t`Is P inside the gold eye (closed loops) or outside it (open, wavy lines)?`],
      teach: t`Inside the separatrix: libration (swinging). Outside: rotation (over the top).`,
      explain: t`At P, $H = \tfrac12(2.3)^2 - \cos0.5 = ${sci(0.5 * 2.3 * 2.3 - Math.cos(0.5), 3)}$, above the separatrix value 1 (units with $m\ell^2 = 1$, $g/\ell = 1$): the pendulum whirls over the top.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-beam', difficulty: 2, transfer: true,
      gen(r) {
        const w0 = r.pick([4, 6, 10]), th0 = r.pick([0.5, 1, 2]), w1 = r.pick([0.5, 1]);
        const th1 = (w0 * th0) / w1;
        return {
          prompt: t`A beam of ions in an accelerator's focusing channel has a width of ${w0} mm and an angular spread of ${th0} mrad where it is widest and parallel. The magnets (no friction, no radiation) focus it to a ${w1} mm spot. Treating the beam as an upright ellipse in the $(x, \theta)$ plane whose area — the **emittance** — Liouville's theorem keeps fixed, what is its angular spread at the focus?`,
          answer: th1, units: 'mrad', tol: { rel: 0.005 },
          errors: distinct([{ value: (th0 * w1) / w0, feedback: t`Squeezing the width must **widen** the angles: the product $\Delta x\,\Delta\theta$ is fixed.` }, { value: th0, feedback: t`Lenses cannot shrink the phase-space area: a narrower beam has a wider angular spread.` }], th1),
          hints: [t`Area of an upright ellipse $\propto \Delta x\,\Delta\theta$, conserved.`, t`$\Delta\theta_1 = \Delta\theta_0\,\Delta x_0/\Delta x_1$.`],
          teach: t`Emittance — a beam's phase-space area — cannot be reduced by conservative focusing.`,
          explain: t`$\Delta\theta_1 = ${th0}\times${w0}/${w1} = ${sci(th1, 3)}$ mrad. (For paraxial rays $\theta$ is proportional to transverse momentum, so the $(x, \theta)$ area is a phase-space area.) Shrinking emittance needs something non-Hamiltonian — beam cooling, or synchrotron radiation in electron rings.`,
          visual: planePic({ fx: 'y', fy: '-x', x: [-2.5, 2.5], y: [-2, 2], xlabel: 'x', ylabel: 'θ', equal: true, aspect: '', grid: 15, flow: { t: 0.6, shape: 'disc', at: [0, 0], size: 1 }, field: false }, t`A beam's phase-space ellipse turned by a focusing channel (illustrative units): its shape changes, its area does not.`),
        };
      },
    }),
    num({
      id: 'cp-damped', difficulty: 2,
      gen(r) {
        const Q = r.pick([10, 20, 50]), cycles = r.pick([2, 5, 10]);
        const ratio = Math.exp((-2 * Math.PI * cycles) / Q);
        return {
          prompt: t`A lightly damped oscillator has quality factor $Q = \omega_0m/b = ${Q}$. By what factor does a patch of phase-space area shrink over ${cycles} cycles (take one cycle as $2\pi/\omega_0$)?`,
          answer: ratio, tol: { rel: 0.01 },
          errors: distinct([{ value: Math.exp((-Math.PI * cycles) / Q), feedback: t`That is the amplitude's factor, $e^{-bt/2m}$. Area goes as $e^{-bt/m}$.` }, { value: Math.exp(-cycles / Q), feedback: t`One cycle is $t = 2\pi/\omega_0$, so $bt/m = 2\pi/Q$ per cycle.` }], ratio),
          hints: [t`$A = A_0e^{-bt/m}$, and $b/m = \omega_0/Q$.`, t`Over $N$ cycles $t = 2\pi N/\omega_0$, so $bt/m = 2\pi N/Q$.`],
          teach: t`Phase-space area shrinks by $e^{-2\pi/Q}$ per cycle of a damped oscillator.`,
          explain: t`$A/A_0 = e^{-2\pi\times${cycles}/${Q}} = ${sci(ratio, 3)}$. Every trajectory spirals in, and so does every patch: the attractor at the origin has zero area.`,
          visual: planePic({ fx: 'y', fy: '-x - 0.12*y', x: [-2.5, 2.5], y: [-2, 2], xlabel: 'x', ylabel: 'p', equal: true, aspect: '', grid: 15, seeds: [{ x: 2, y: 0, dir: 'forward', color: 'accent' }], T: 30 }, t`A damped oscillator's trajectory spiralling in (illustrative units).`),
        };
      },
    }),
    mcq({
      id: 'cp-filament', difficulty: 3,
      prompt: t`A blob of initial conditions near a pendulum's separatrix is stretched by the flow into a thin filament that winds round and round the phase plane. Which statement is right?`,
      visual: planePic(pend({ equal: false, flow: { t: 9, shape: 'disc', at: [0.4, 1.7], size: 0.3 } }), t`A disc of states near the separatrix (dashed) after flowing for $t = 9$ (gold): drawn through only 121 points of its edge, so the thinnest parts are smoothed over.`),
      choices: [t`Its exact area is still the original area; but coarse-grained (any finite grid of cells it touches), it seems to fill more and more of the plane`, t`Its area has grown, because it now spreads over a much larger region`, t`Its area has shrunk, because it is so thin`, t`Liouville's theorem fails near a separatrix, where the motion is slow`],
      answer: 0,
      why: { 1: t`The region it spans grows, but the filament gets thinner in exact proportion: the area is unchanged.`, 2: t`It is thin but very long; length times width stays fixed.`, 3: t`The theorem holds everywhere for a smooth $H$, separatrix included.` },
      hints: [t`What does Liouville's theorem say about the exact area?`, t`Now imagine covering the plane with cells of fixed size and counting every cell the filament touches. Does that count stay fixed?`],
      teach: t`A Hamiltonian flow keeps exact phase-space volume while stretching it into fine filaments: the root of coarse-grained entropy growth.`,
      explain: t`Exact area is conserved; the apparent (coarse-grained) area grows. That distinction is how statistical mechanics reconciles reversible dynamics with entropy that increases ([ensembles](#/lesson/phys3700.T9.1)).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §13.6–13.7: phase-space orbits; Liouville’s theorem', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'H. Goldstein, C. Poole and J. Safko, Classical Mechanics, 3rd ed. (2002), §9.9: Liouville’s theorem', url: 'https://www.pearson.com/en-us/subject-catalog/p/classical-mechanics/P200000006389' },
    { label: 'E. Hairer, C. Lubich and G. Wanner, Geometric Numerical Integration, 2nd ed. (Springer, 2006), ch. VI: symplectic integration', url: 'https://doi.org/10.1007/3-540-30666-8' },
  ],
});
