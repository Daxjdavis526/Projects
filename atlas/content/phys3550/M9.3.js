// Poisson brackets (Taylor problems 13.x; Goldstein §9.5–9.7):
// {f, g} = Σ(∂f/∂qᵢ ∂g/∂pᵢ − ∂f/∂pᵢ ∂g/∂qᵢ); along the motion
// df/dt = {f, H} + ∂f/∂t, so a quantity without explicit t is conserved
// exactly when {f, H} = 0. Fundamental brackets {qᵢ, pⱼ} = δᵢⱼ (Dirac:
// {,} → [,]/iħ). A conserved quantity generates its symmetry: δqᵢ = ε{qᵢ, Q}
// — p_x shifts x, L_z rotates (x, y) — the Hamiltonian face of Noether's
// theorem (M4.5). Worked: a central force, {L_z, H} = 0 while {p_x, H} =
// −∂U/∂x, and L_z generating rotations. Explore: cm2-noether — breaking the
// rotation symmetry by ε makes {L_z, H} = −εxy. Practice: fundamental
// brackets, {x², p}, {x, L_z}, {p, H} for gravity, a cyclic momentum,
// properties, a numerical dL/dt. Transfer: the Laplace–Runge–Lenz vector,
// whose bracket with H vanishes only for 1/r — GR's correction makes it turn
// (perihelion precession, M5.5); and {L_x, L_y} = L_z.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { sci, distinct } from './_cm.js';
import { planePic } from './_cm4.js';

const t = String.raw;

const noe = (params, caption) => ({ type: 'cm2-noether', params: { sliders: [], play: false, readout: false, ...params }, caption });

export default lesson({
  id: 'phys3550.M9.3',
  title: 'Poisson brackets',
  minutes: 18, difficulty: 4,
  intro: t`How fast does some quantity $f(q, p)$ — an angular momentum, a component of momentum, anything built from the state — change along the motion? Differentiate with the chain rule and use Hamilton's equations: the answer is a combination of derivatives of $f$ and of $H$ that Poisson named, the **Poisson bracket** $\{f, H\}$. So $f$ is conserved precisely when its bracket with the Hamiltonian vanishes: a test you can run without solving the motion. Brackets also say which quantities **generate** which motions — momentum generates shifts, angular momentum generates rotations — which is Noether's theorem ([M4.5](#/lesson/phys3550.M4.5)) seen from phase space. And Dirac noticed that quantum mechanics keeps every bracket, replacing $\{f, g\}$ by the commutator $[\hat f, \hat g]/i\hbar$.`,
  equation: t`\{f, g\} = \sum_i\left(\frac{\partial f}{\partial q_i}\frac{\partial g}{\partial p_i} - \frac{\partial f}{\partial p_i}\frac{\partial g}{\partial q_i}\right),\qquad \frac{df}{dt} = \{f, H\} + \frac{\partial f}{\partial t},\qquad \{q_i, p_j\} = \delta_{ij}`,
  symbols: [
    { tex: 'f,\\ g', text: 'any two functions of the coordinates, momenta (and possibly time)' },
    { tex: '\\{f, g\\}', text: 'their Poisson bracket: units of $f$ times $g$ divided by those of $q$ times $p$ (i.e. per J·s)' },
    { tex: 'H', text: 'the Hamiltonian: $\\{f, H\\}$ is the rate at which $f$ changes along the motion (if $f$ has no explicit $t$)' },
    { tex: 'q_i,\\ p_i', text: 'canonical coordinates and momenta' },
    { tex: '\\delta_{ij}', text: '1 if $i = j$, otherwise 0: the **fundamental brackets**' },
  ],
  why: t`Conservation laws, symmetries and their algebra (angular momenta obey $\{L_x, L_y\} = L_z$) all live in brackets — and they pass straight into quantum mechanics as commutators ([generators and commutators](#/lesson/st-g.G-LIEA.1)), where $[\hat x, \hat p] = i\hbar$ gives the uncertainty principle.`,
  visual: {
    type: 'cm2-noether',
    title: 'Watching a bracket switch on',
    lead: t`A 1 kg puck in the potential $U = \tfrac12\big(x^2 + (1 + \varepsilon)y^2\big)$. Its angular momentum changes at $\dot L_z = \{L_z, H\} = -\varepsilon\,xy$. Raise $\varepsilon$ from zero and watch $L_z$ (blue) start to wander while $H$ (gold) stays flat — since $\{H, H\} = 0$ always.`,
    tasks: [
      t`$\varepsilon = 0$: round contours; $\{L_z, H\} = 0$ and $L_z$ is a flat line.`,
      t`$\varepsilon = 0.2$: $L_z$ oscillates — fastest where the puck crosses the diagonals, where $|xy|$ is largest — and is momentarily still as the puck crosses an axis ($xy = 0$).`,
      t`Switch to **Time**: now $H$ depends on $t$, so $dH/dt = \partial H/\partial t \ne 0$, while $\{L_z, H\} = 0$ keeps $L_z$ flat.`,
    ],
    params: { kind: 'rotation', kinds: true, eps: 0.2, sliders: ['eps'] },
    caption: t`A 1 kg point puck, no friction, integrated numerically (RK4). Rotation: $U = \tfrac12(x^2 + (1 + \varepsilon)y^2)$ J with $x, y$ in m; each quantity is drawn as a fraction of its starting value.`,
  },
  example: {
    prompt: t`A particle moves in the plane with $H = \frac{p_x^2 + p_y^2}{2m} + U(r)$, $r = \sqrt{x^2 + y^2}$. Using Poisson brackets, show that $L_z = xp_y - yp_x$ is conserved but $p_x$ is not, and find what $L_z$ does to $x$ and $y$ as a generator.`,
    visual: noe({ kind: 'rotation', eps: 0, panels: ['plane', 'Q'] }, t`A round potential: $L_z$ (blue) and the energy (gold) both stay at their starting values.`),
    steps: [
      { label: 'Pieces', text: t`$\frac{\partial H}{\partial p_x} = \frac{p_x}{m}$, $\frac{\partial H}{\partial x} = U'(r)\frac xr$, and likewise for $y$. For $L_z$: $\frac{\partial L_z}{\partial x} = p_y$, $\frac{\partial L_z}{\partial p_x} = -y$, $\frac{\partial L_z}{\partial y} = -p_x$, $\frac{\partial L_z}{\partial p_y} = x$.` },
      { label: 'Bracket with H', text: t`$\{L_z, H\} = p_y\frac{p_x}{m} - (-y)U'\frac xr + (-p_x)\frac{p_y}{m} - xU'\frac yr$. The kinetic terms cancel and so do the potential ones: $\{L_z, H\} = 0$. Conserved — without solving anything.` },
      { label: 'Momentum', text: t`$\{p_x, H\} = 0\cdot\frac{\partial H}{\partial p_x} - 1\cdot\frac{\partial H}{\partial x} = -U'(r)\frac xr$: the $x$-component of the force. Not zero, so $p_x$ is not conserved (unless $U$ is constant).` },
      { label: 'Generators', text: t`$\{x, L_z\} = \frac{\partial L_z}{\partial p_x} = -y$ and $\{y, L_z\} = \frac{\partial L_z}{\partial p_y} = x$. So $\delta x = \varepsilon\{x, L_z\} = -\varepsilon y$, $\delta y = \varepsilon x$: a rotation by the small angle $\varepsilon$. Likewise $\{x, p_x\} = 1$: $p_x$ generates shifts in $x$.` },
      { label: 'Noether, again', text: t`For any $G$, $\{H, G\}$ is how much $H$ changes under the motion $G$ generates. $\{L_z, H\} = 0$ says both "$L_z$ is conserved" and "rotations leave $H$ unchanged": [M4.5](#/lesson/phys3550.M4.5)'s symmetry ↔ conservation, in one antisymmetric bracket.` },
    ],
    answer: t`$\{L_z, H\} = 0$, so $L_z$ is conserved; $\{p_x, H\} = -U'(r)\,x/r \ne 0$. $L_z$ generates rotations: $\{x, L_z\} = -y$, $\{y, L_z\} = x$.`,
  },
  practice: [
    mcq({
      id: 'fundamental', difficulty: 1,
      prompt: t`What are $\{x, p_x\}$, $\{x, p_y\}$ and $\{p_x, x\}$?`,
      visual: planePic({ fx: 'y', fy: '0', x: [-2, 2], y: [-1.5, 1.5], xlabel: 'x', ylabel: 'pₓ', equal: true, aspect: '', grid: 13, field: true, seeds: [[0, 1], [0, -0.5]], seedColor: 'accent' }, t`The flow generated by $p_x$ in the $(x, p_x)$ plane: every point slides along $x$ at a steady rate.`),
      choices: [t`$1$, $0$ and $-1$`, t`$1$, $1$ and $1$`, t`$0$, $0$ and $0$`, t`$1$, $0$ and $1$`],
      answer: 0,
      why: { 1: t`$x$ and $p_y$ belong to different pairs: no term of the sum has both derivatives non-zero.`, 2: t`$\{x, p_x\} = \frac{\partial x}{\partial x}\frac{\partial p_x}{\partial p_x} - 0 = 1$.`, 3: t`Brackets are antisymmetric: $\{g, f\} = -\{f, g\}$.` },
      hints: [t`Use the definition with $f = x$, $g = p_x$: only one term survives.`],
      teach: t`The fundamental brackets: $\{q_i, p_j\} = \delta_{ij}$, $\{q_i, q_j\} = \{p_i, p_j\} = 0$, and brackets change sign when swapped.`,
      explain: t`$\{x, p_x\} = 1$, $\{x, p_y\} = 0$, $\{p_x, x\} = -1$. Dirac's rule $\{\,,\} \to [\,,]/i\hbar$ turns the first into $[\hat x, \hat p_x] = i\hbar$.`,
    }),
    expr({
      id: 'x2-p', difficulty: 2,
      prompt: t`Compute $\{x^2, p\}$ for one coordinate $x$ and its momentum $p$.`,
      answer: '2x', answerTeX: t`2x`, lhs: '\\{x^2, p\\}', vars: { x: [-2, 2], p: [-2, 2] },
      errors: [{ answer: '-2x', feedback: t`$\{f, g\} = \frac{\partial f}{\partial x}\frac{\partial g}{\partial p} - \cdots$ with $f = x^2$, $g = p$: the first term, $2x\cdot1$, is the one that survives.` }, { answer: 'x^2', feedback: t`Differentiate $x^2$: the bracket with $p$ acts like $\partial/\partial x$.` }],
      hints: [t`$\frac{\partial(x^2)}{\partial x} = 2x$, $\frac{\partial(x^2)}{\partial p} = 0$, $\frac{\partial p}{\partial p} = 1$.`],
      teach: t`$\{f(x), p\} = df/dx$: momentum generates translations, so its bracket differentiates.`,
      explain: t`$\{x^2, p\} = 2x\cdot1 - 0 = 2x$. In general $\{f(x), p\} = f'(x)$ — shifting $x$ by $\varepsilon$ changes $f$ by $\varepsilon f'$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-2, 2], y: [-0.5, 4.2], xlabel: 'x', ylabel: 'f', curves: [{ fn: 'x^2', color: 'accent', width: 2.2, label: 'f = x²', labelAt: 1.6, labelDx: -50 }], points: [{ x: 1, y: 1, color: 'gold', r: 5 }] }, caption: t`The function $f = x^2$: sliding it sideways (what $p$ generates) changes its value at each point by its slope.` },
    }),
    expr({
      id: 'x-Lz', difficulty: 2,
      prompt: t`With $L_z = xp_y - yp_x$, compute $\{y, L_z\}$. Type $p_x$ as \`p_x\` and $p_y$ as \`p_y\`.`,
      answer: 'x', answerTeX: t`x`, lhs: '\\{y, L_z\\}', vars: { x: [-2, 2], y: [-2, 2], p_x: [-2, 2], p_y: [-2, 2] },
      errors: [{ answer: '-x', feedback: t`$\{y, L_z\} = \frac{\partial y}{\partial y}\frac{\partial L_z}{\partial p_y} = \frac{\partial L_z}{\partial p_y} = +x$.` }, { answer: '-y', feedback: t`That is $\{x, L_z\}$. For $y$, differentiate $L_z$ by $p_y$.` }, { answer: 'p_x', feedback: t`$\{y, L_z\} = \partial L_z/\partial p_y$, not $\partial L_z/\partial y$.` }],
      hints: [t`$\{y, g\} = \partial g/\partial p_y$ for any $g$ (only the $y$ term of the sum survives).`],
      teach: t`$\{q_i, g\} = \partial g/\partial p_i$: the bracket of a coordinate with $G$ is how fast $G$ pushes that coordinate.`,
      explain: t`$\{y, L_z\} = x$ (and $\{x, L_z\} = -y$): $L_z$ pushes $(x, y)$ in the direction $(-y, x)$ — anticlockwise round the origin. Angular momentum generates rotations.`,
      visual: { type: 'field2d', params: { P: '-y', Q: 'x', x: [-2, 2], y: [-2, 2], probe: false, readout: false }, caption: t`The velocity field $(\{x, L_z\}, \{y, L_z\}) = (-y, x)$: rotation about the origin.` },
    }),
    expr({
      id: 'gravity', difficulty: 1,
      prompt: t`A ball moves vertically with $H = \frac{p^2}{2m} + mgz$. Use $\dot p = \{p, H\}$ to find $\dot p$.`,
      answer: '-m*g', answerTeX: t`-mg`, lhs: '\\dot p', vars: { m: [0.5, 3], g: [9, 10], z: [0, 5], p: [-2, 2] },
      errors: [{ answer: 'm*g', feedback: t`$\{p, H\} = -\partial H/\partial z$: gravity pulls down.` }, { answer: 'p/m', feedback: t`That is $\dot z = \{z, H\}$.` }],
      hints: [t`$\{p, H\} = \frac{\partial p}{\partial z}\frac{\partial H}{\partial p} - \frac{\partial p}{\partial p}\frac{\partial H}{\partial z}$.`],
      teach: t`$\{q, H\}$ and $\{p, H\}$ are Hamilton's equations themselves.`,
      explain: t`$\{p, H\} = 0 - 1\cdot mg = -mg$. With $f = q$ or $f = p$, $df/dt = \{f, H\}$ reproduces $\dot q = \partial H/\partial p$ and $\dot p = -\partial H/\partial q$.`,
      visual: planePic({ fx: 'y', fy: '-1', x: [0, 4], y: [-3, 3], xlabel: 'z', ylabel: 'p', grid: 13, seeds: [[0, 2.5], [0, 1.5]], seedColor: 'accent' }, t`A thrown ball's paths in the $(z, p)$ plane (units with $m = g = 1$): parabolas, with $p$ falling steadily.`),
    }),
    mcq({
      id: 'cyclic', difficulty: 2,
      prompt: t`A particle moves in $H = \frac{p_x^2 + p_y^2}{2m} + U(y)$ — a potential that depends on $y$ only. Which bracket shows a conserved quantity?`,
      visual: noe({ kind: 'translation', eps: 0, panels: ['plane', 'Q'] }, t`A straight valley: the potential is the same all along $x$, and $p_x$ (green) stays constant.`),
      choices: [t`$\{p_x, H\} = -\partial H/\partial x = 0$, so $p_x$ is conserved`, t`$\{p_y, H\} = 0$, so $p_y$ is conserved`, t`$\{x, H\} = 0$, so $x$ is conserved`, t`$\{L_z, H\} = 0$, so $L_z$ is conserved`],
      answer: 0,
      why: { 1: t`$\{p_y, H\} = -U'(y)$, non-zero wherever the potential slopes.`, 2: t`$\{x, H\} = p_x/m$: $x$ changes steadily.`, 3: t`$\{L_z, H\} = x\cdot(-U'(y)) \ne 0$: the potential is not round.` },
      hints: [t`$\{p_i, H\} = -\partial H/\partial q_i$. Which coordinate is missing from $H$?`],
      teach: t`A cyclic coordinate's momentum has zero bracket with $H$: conserved.`,
      explain: t`$x$ does not appear in $H$, so $\{p_x, H\} = 0$: [M4.4](#/lesson/phys3550.M4.4)'s cyclic-coordinate rule, as a bracket. Conversely, $\{H, p_x\} = 0$ says the shift that $p_x$ generates leaves $H$ unchanged — the symmetry.`,
    }),
    multi({
      id: 'properties', difficulty: 3,
      prompt: t`Which properties do Poisson brackets have for all functions $f, g, h$?`,
      visual: noe({ kind: 'rotation', eps: 0.3, panels: ['Q'], show: ['L', 'E'] }, t`$\{H, H\} = 0$ at work: in a non-round bowl the energy (gold) stays flat while $L_z$ (blue) does not.`),
      choices: [t`Antisymmetry: $\{f, g\} = -\{g, f\}$, so $\{f, f\} = 0$`, t`The product rule: $\{fg, h\} = f\{g, h\} + g\{f, h\}$`, t`The Jacobi identity: $\{f, \{g, h\}\} + \{g, \{h, f\}\} + \{h, \{f, g\}\} = 0$`, t`Symmetry: $\{f, g\} = \{g, f\}$`, t`$\{f, g\} = 0$ whenever $f$ and $g$ are both conserved`],
      answer: [0, 1, 2],
      why: { 3: t`Swapping $f$ and $g$ swaps the two terms of the sum, flipping the sign.`, 4: t`Poisson's theorem says the bracket of two conserved quantities is **conserved**, not zero: $\{L_x, L_y\} = L_z$.` },
      hints: [t`Swap $f$ and $g$ in the definition. Then think of $\{f, \cdot\}$ as a derivative.`, t`For the last option, try $f = L_x$, $g = L_y$ for a free particle: both conserved.`],
      teach: t`Brackets are antisymmetric, obey the product rule and the Jacobi identity — the same algebra as commutators.`,
      explain: t`Antisymmetry gives $\{H, H\} = 0$: energy is conserved when $H$ has no explicit $t$. The product rule makes $\{\cdot, h\}$ a derivative, and the Jacobi identity gives Poisson's theorem: if $f$ and $g$ are conserved, so is $\{f, g\}$. Commutators $[\hat f, \hat g]$ obey all three.`,
    }),
    num({
      id: 'dLdt', difficulty: 3,
      gen(r) {
        const e = r.pick([0.2, 0.3, 0.5]), x = r.pick([0.6, 0.8, 1.2]), y = r.pick([-0.5, 0.4, 0.7]);
        const ans = -e * x * y;
        return {
          prompt: t`A 1 kg puck moves in $U = \tfrac12\big(x^2 + (1 + ${e})y^2\big)$ (J, with $x, y$ in m). Using $\dot L_z = \{L_z, H\}$, how fast is its angular momentum changing when it is at $(${x}, ${y})$ m?`,
          answer: ans, units: 'N m', tol: { rel: 0.005 },
          errors: distinct([{ value: -ans, feedback: t`$\{L_z, H\} = -\big(x\,\partial U/\partial y - y\,\partial U/\partial x\big)$: the torque about the origin. Check the sign.` }, { value: 0, feedback: t`The potential is not round when $\varepsilon \ne 0$, so $L_z$ is not conserved.` }, { value: -(1 + e) * x * y, feedback: t`The $x\cdot y$ terms from $\partial U/\partial x = x$ and $\partial U/\partial y = (1 + \varepsilon)y$ partly cancel, leaving $-\varepsilon xy$.` }], ans),
          hints: [t`The kinetic parts cancel as in the worked example; what is left is $\{L_z, H\} = y\,\frac{\partial U}{\partial x} - x\,\frac{\partial U}{\partial y}$.`, t`$\partial U/\partial x = x$, $\partial U/\partial y = (1 + \varepsilon)y$, so $\{L_z, H\} = -\varepsilon xy$.`],
          teach: t`$\{L_z, H\}$ is the torque about the origin: zero exactly when the potential is round.`,
          explain: t`$\dot L_z = -${e}\times${x}\times(${y}) = ${sci(ans, 3)}$ N·m (kg·m²/s²). It does not depend on the velocity at all: only the shape of the potential at the puck's position matters.`,
          visual: noe({ kind: 'rotation', eps: Math.min(e, 1), panels: ['plane'] }, t`The puck in the elliptical bowl, $\varepsilon = ${e}$ (its path from the default start shown).`),
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-lrl', difficulty: 3, transfer: true,
      prompt: t`For the Kepler Hamiltonian $H = \frac{p^2}{2m} - \frac{k}{r}$ the Laplace–Runge–Lenz vector $\vec A = \vec p\times\vec L - mk\,\hat r$ (it points to periapsis) has $\{\vec A, H\} = 0$. General relativity adds a small term $\propto -1/r^3$ to the effective potential. What happens?`,
      visual: { type: 'cm3-orbit', params: { force: 'gr', delta: 0.004, L: 1, E: -0.38, turns: 6, view: 2.6, r: [0, 2.6], y: [-0.6, 0.1], panels: ['orbit'], apsides: false, sliders: [], play: false, dragE: false, readouts: [] }, caption: t`An orbit with GR's $1/r^3$ term, enormously exaggerated (units with $GM = 1$): its periapsis advances each turn.` },
      choices: [t`$\{\vec A, H\} \ne 0$: $\vec A$ is no longer conserved, so the periapsis direction turns — the perihelion precession of Mercury`, t`Nothing changes: any central force conserves $\vec A$`, t`$\vec L$ stops being conserved, so the orbit plane tilts`, t`The energy stops being conserved, so the orbit decays`],
      answer: 0,
      why: { 1: t`Only the $1/r$ potential (and the oscillator) has this extra conserved vector; that is why only they give closed orbits (Bertrand's theorem, [M5.5](#/lesson/phys3550.M5.5)).`, 2: t`The correction is still central, so $\{\vec L, H\} = 0$: the plane stays put.`, 3: t`$H$ has no explicit $t$, so $\{H, H\} = 0$: energy is conserved.` },
      hints: [t`Which conserved quantities need only a central force, and which one is special to $1/r$?`, t`$\vec A$ points at periapsis. If it changes slowly, what does the orbit do?`],
      teach: t`Each conserved quantity is a vanishing bracket with $H$; break the special $1/r$ form and the Runge–Lenz vector precesses.`,
      explain: t`With the correction $\{\vec A, H\} \ne 0$, but small: $\vec A$ rotates slowly in the orbital plane, carrying the periapsis with it — 43″ per century for Mercury. $\{\vec L, H\} = 0$ and $\{H, H\} = 0$ still hold, so the plane and the energy are fixed.`,
    }),
    expr({
      id: 'cp-LxLy', difficulty: 3,
      prompt: t`With $L_x = yp_z - zp_y$ and $L_y = zp_x - xp_z$, compute $\{L_x, L_y\}$. Use \`p_x\`, \`p_y\`, \`p_z\`.`,
      answer: 'x*p_y - y*p_x', answerTeX: t`xp_y - yp_x = L_z`, lhs: '\\{L_x, L_y\\}', vars: { x: [-2, 2], y: [-2, 2], z: [-2, 2], p_x: [-2, 2], p_y: [-2, 2], p_z: [-2, 2] },
      errors: [{ answer: 'y*p_x - x*p_y', feedback: t`Check the sign of each term: only $z$ and $p_z$ appear in both, giving $\frac{\partial L_x}{\partial z}\frac{\partial L_y}{\partial p_z} - \frac{\partial L_x}{\partial p_z}\frac{\partial L_y}{\partial z}$.` }, { answer: '0', feedback: t`$L_x$ and $L_y$ share the variables $z$ and $p_z$: their bracket is not zero.` }],
      hints: [t`Only the $z$-pair contributes: $\{L_x, L_y\} = \frac{\partial L_x}{\partial z}\frac{\partial L_y}{\partial p_z} - \frac{\partial L_x}{\partial p_z}\frac{\partial L_y}{\partial z}$.`, t`$\frac{\partial L_x}{\partial z} = -p_y$, $\frac{\partial L_y}{\partial p_z} = -x$, $\frac{\partial L_x}{\partial p_z} = y$, $\frac{\partial L_y}{\partial z} = p_x$.`],
      teach: t`Angular-momentum components obey $\{L_x, L_y\} = L_z$ (and cyclically) — the algebra of rotations.`,
      explain: t`$\{L_x, L_y\} = (-p_y)(-x) - y\,p_x = xp_y - yp_x = L_z$. So if $L_x$ and $L_y$ are conserved, $L_z$ must be too (Poisson's theorem). In quantum mechanics this becomes $[\hat L_x, \hat L_y] = i\hbar\hat L_z$ — the algebra $\mathfrak{so}(3)$ behind spin.`,
      visual: { type: 'calc-vectors3d', params: { range: 2, grid: false, scale: 1.3, vectors: [{ to: [1.2, 0.4, 0.8], color: 'accent', label: '\\vec r' }, { to: [-0.4, 1.3, 0.2], color: 'warn', label: '\\vec p' }, { to: [-0.96, -0.56, 1.72], color: 'gold', label: '\\vec L' }] }, caption: t`$\vec L = \vec r\times\vec p$ for one state (drawn to scale). Drag to turn.` },
    }),
    num({
      id: 'cp-virial', difficulty: 3,
      gen(r) {
        const m = r.pick([1, 2]), k = r.pick([4, 8]), x = r.pick([0.3, 0.5]), p = r.pick([1, 2, 3]);
        const ans = (p * p) / m - k * x * x;
        return {
          prompt: t`For an oscillator $H = \frac{p^2}{2m} + \tfrac12kx^2$ with $m = ${m}$ kg and $k = ${k}$ N/m, find $\frac{d}{dt}(xp) = \{xp, H\}$ at the instant $x = ${x}$ m, $p = ${p}$ kg·m/s.`,
          answer: ans, units: 'J', tol: { rel: 0.005, abs: 0.001 },
          errors: distinct([{ value: (p * p) / m + k * x * x, feedback: t`$\{xp, H\} = p\,\frac{\partial H}{\partial p} - x\,\frac{\partial H}{\partial x}$: the potential term enters with a minus sign.` }, { value: (p * p) / (2 * m) - 0.5 * k * x * x, feedback: t`$p\,\partial H/\partial p = p^2/m$ (twice the kinetic energy), and $x\,\partial H/\partial x = kx^2$.` }], ans),
          hints: [t`$\frac{\partial(xp)}{\partial x} = p$ and $\frac{\partial(xp)}{\partial p} = x$, so $\{xp, H\} = p\frac{\partial H}{\partial p} - x\frac{\partial H}{\partial x}$.`, t`$= p^2/m - kx^2 = 2T - 2U$.`],
          teach: t`$\{xp, H\} = 2T - x\,U'$: averaged over a bounded motion it vanishes — the virial theorem.`,
          explain: t`$\{xp, H\} = ${p * p}/${m} - ${k}(${x})^2 = ${sci(ans, 3)}$ J. Since $xp$ stays bounded, its average rate is zero: $\langle2T\rangle = \langle xU'\rangle$ — for the oscillator $\langle T\rangle = \langle U\rangle$, and for gravity $2\langle T\rangle = -\langle U\rangle$, the virial theorem astronomers use to weigh galaxy clusters.`,
          visual: planePic({ fx: `y/${m}`, fy: `-${k}*x`, x: [-1.5, 1.5], y: [-4, 4], xlabel: 'x', ylabel: 'p', grid: 15, levels: { fn: `y^2/${2 * m} + ${k / 2}*x^2`, values: [0.5, 2, 4.5] }, points: [{ x, y: p, color: 'gold', r: 5 }] }, t`The oscillator's phase plane with the given state (gold).`),
        };
      },
    }),
  ],
  sources: [
    { label: 'H. Goldstein, C. Poole and J. Safko, Classical Mechanics, 3rd ed. (2002), §9.5–9.7: Poisson brackets, equations of motion, angular momentum', url: 'https://www.pearson.com/en-us/subject-catalog/p/classical-mechanics/P200000006389' },
    { label: 'P. A. M. Dirac, The fundamental equations of quantum mechanics, Proc. R. Soc. A 109, 642 (1925)', url: 'https://doi.org/10.1098/rspa.1925.0150' },
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 13 problems: Poisson brackets', url: 'https://uscibooks.aip.org/?p=2549' },
  ],
});
