// Holonomic and nonholonomic constraints. A holonomic constraint is an equation
// among the coordinates (and t), f(q, t) = 0: it removes a dimension of
// configuration space. A nonholonomic one restricts velocities, a(q)·q̇ = 0,
// and cannot be integrated to such an equation: velocities lose a dimension,
// reachable configurations do not. Test in three variables (Frobenius):
// a·(∇ × a) = 0 ⇔ integrable. Explore: the model constraint ż = ½(xẏ − yẋ) —
// a closed loop in the plane lifts to a path that climbs by the enclosed area
// (surface3d; ellipse πab, independent of where the loop sits). Worked: three
// constraints classified (a hoop; x dy + y dx, exact; dz − y dx, not).
// Practice: counting (a free chain of N masses: 2N + 1), the curl test, the
// lifted area, the unicycle’s turn–reverse–turn back manoeuvre (net shift
// 2d sin(α/2)), velocities vs configurations, the integrating factor. Transfer:
// a satellite with zero angular momentum reorients itself by cycling its
// shape (the falling cat). Overlaps: phys3550 M4.1 (counting, the skate),
// M3.5 (multipliers) linked; gr S13.d (holonomy of parallel transport) linked.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const deg = (d) => (d * Math.PI) / 180;

export default lesson({
  id: 'st-g.G6.1',
  title: 'Holonomic and nonholonomic constraints',
  minutes: 15, difficulty: 3,
  intro: t`A **constraint** limits what a system may do. If it is an equation among the coordinates — a bead on a hoop, a rigid rod — it is **holonomic** and removes a dimension from the space of configurations. If it only restricts **velocities**, and no equation among the coordinates is equivalent to it, it is **nonholonomic**: a wheel cannot slide sideways, yet a car can still park anywhere.

$$\begin{gathered}\text{holonomic: } f(q_1, \dots, q_n, t) = 0 \\ \text{nonholonomic: } \textstyle\sum_i a_i(q)\,\dot q_i = 0,\ \text{not integrable}\end{gathered}$$

Counting configurations and constraints is the theme of this module; it ends with the count that says [gravity has two degrees of freedom](#/lesson/st-g.G6.4). The mechanics of generalized coordinates is in [generalized coordinates and constraints](#/lesson/phys3550.M4.1).`,
  symbols: [
    { tex: 'q_i', text: t`generalized coordinates: any numbers that fix the configuration (angles, lengths, positions)` },
    { tex: 'f(q, t)', text: t`a holonomic constraint function: the motion stays on the surface $f = 0$ in configuration space` },
    { tex: '\\dot q_i', text: t`the generalized velocities $dq_i/dt$` },
    { tex: 'a_i(q)', text: t`the coefficients of a velocity constraint; together they form a covector $a$ that must annihilate every allowed velocity` },
    { tex: '\\sum_i a_i\\dot q_i = 0', text: t`a Pfaffian (linear velocity) constraint; it is holonomic exactly when it is, up to a factor, the time derivative $\dot f = \sum_i(\partial f/\partial q_i)\dot q_i$ of some $f$` },
  ],
  why: 'General relativity’s constraints are holonomic in this sense — four equations each moment must satisfy — and the integrability test used here (Frobenius) is the same mathematics as curvature and the holonomy of parallel transport.',
  visual: {
    type: 'surface3d',
    title: 'A closed loop that does not close',
    lead: t`Three coordinates $(x, y, z)$ obey one velocity constraint, $\dot z = \tfrac12(x\dot y - y\dot x)$. Drive $x$ and $y$ around the ellipse on the floor (gold): $z$ is forced to follow, along the blue path. When the floor loop closes, the blue path has climbed by exactly the area the loop encloses.`,
    tasks: [
      t`Read the climb: $\Delta z = \pi ab$, the ellipse’s area. Make the loop thinner: the climb shrinks with the area — and vanishes only when the loop encloses nothing.`,
      t`Slide the loop sideways with its centre: the climb does not change. Only the enclosed area matters.`,
      t`So every $(x, y, z)$ is reachable although the velocity is always constrained: no equation $f(x, y, z) = 0$ holds. This is how a car parallel-parks and how a falling cat turns over.`,
    ],
    params: {
      z: '0*x', domain: [[-2.5, 2.5], [-2.5, 2.5]], colorBy: false, alpha: 0.15, yaw: 0.7, pitch: 0.45,
      sliders: [
        { key: 'a', label: 'Semi-axis $a$', min: 0.3, max: 1.5, step: 0.05, value: 1.2, explain: 'Half-width of the loop along x.' },
        { key: 'b', label: 'Semi-axis $b$', min: 0.3, max: 1.5, step: 0.05, value: 0.8, explain: 'Half-width of the loop along y.' },
        { key: 'cx', label: 'Loop centre $x_c$', min: -1, max: 1, step: 0.05, value: 0, explain: 'Where the loop sits: the climb does not depend on it.' },
      ],
      curves: [
        { param: ['cx + a*cos(t)', 'b*sin(t)', '0'], t: [0, 6.2832], color: 'gold', width: 2.4 },
        { param: ['cx + a*cos(t)', 'b*sin(t)', '0.5*(cx*b*sin(t) + a*b*t)'], t: [0, 6.2832], color: 'accent', width: 3 },
        { param: ['cx + a', '0', '3.1416*a*b*t'], t: [0, 1], color: 'bad', width: 2 },
      ],
      readouts: [{ label: t`climb $\Delta z$ after one loop`, expr: 'pi*a*b', digits: 3 }, { label: t`area $\pi ab$`, expr: 'pi*a*b', digits: 3 }],
    },
    caption: t`Exact: along $x = x_c + a\cos t$, $y = b\sin t$ the constraint integrates to $z = \tfrac12(x_cb\sin t + abt)$. The red segment marks the gap between start and finish. Drag to rotate.`,
  },
  example: {
    prompt: t`Classify each constraint as holonomic or nonholonomic: (a) a bead on a hoop, $x^2 + y^2 = R^2$; (b) $y\dot x + x\dot y = 0$; (c) $\dot z - y\dot x = 0$ in three coordinates $(x, y, z)$.`,
    visual: { type: 'graph', params: { x: [-2, 2], y: [-1.6, 1.6], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.2, label: '(a) x² + y² = 1', labelAt: 0.6, labelDx: 6 }, { fn: '0.6/x', domain: [0.35, 2], color: 'violet', width: 2, label: '(b) xy = 0.6', labelAt: 1.6, labelDx: -10, labelDy: -14 }, { fn: '0.6/x', domain: [-2, -0.35], color: 'violet', width: 2 }] }, caption: t`Constraints (a) and (b) confine the motion to curves in the plane. Constraint (c) confines no motion to any surface — it needs a third dimension to show (see Explore).` },
    steps: [
      { label: 'Already an equation', text: t`(a) is an equation among the coordinates: holonomic. It removes one dimension; the bead has one coordinate, the angle.` },
      { label: 'A disguised derivative', text: t`(b) looks like a velocity constraint, but $y\dot x + x\dot y = \dfrac{d}{dt}(xy)$. So it says $xy = \text{const}$: holonomic. Velocity constraints that are time derivatives are holonomic in disguise.` },
      { label: 'The curl test', text: t`(c) has coefficients $a = (-y, 0, 1)$ on $(\dot x, \dot y, \dot z)$. A constraint $a\cdot\dot{\mathbf q} = 0$ in three variables is integrable (some factor times it is $\dot f$) exactly when $a\cdot(\nabla\times a) = 0$ — Frobenius’ theorem.` },
      { label: 'Compute', text: t`$\nabla\times a = \bigl(\partial_ya_z - \partial_za_y,\ \partial_za_x - \partial_xa_z,\ \partial_xa_y - \partial_ya_x\bigr) = (0, 0, 1)$, so $a\cdot(\nabla\times a) = 1 \ne 0$: nonholonomic.` },
      { label: 'Sense check', text: t`For (b), $a = (y, x, 0)$ and $\nabla\times a = (0, 0, 1 - 1) = 0$: integrable, as found. For (c), a loop in $(x, y)$ changes $z$ by $\oint y\,dx$, minus the area enclosed — no surface in $(x, y, z)$ can hold such paths.` },
    ],
    answer: t`(a) holonomic; (b) holonomic, since it is $\tfrac{d}{dt}(xy) = 0$; (c) nonholonomic, since $a\cdot(\nabla\times a) = 1 \ne 0$.`,
  },
  practice: [
    num({
      id: 'chain-count', difficulty: 1,
      gen(r) {
        const N = r.pick([3, 4, 5, 6]);
        const ans = 3 * N - (N - 1);
        return {
          prompt: t`A space tether is modelled as $${N}$ point masses joined in a line by $${N - 1}$ rigid massless rods, floating freely. Each rod is one holonomic constraint (a fixed distance). How many degrees of freedom — independent coordinates — does the system have?`,
          visual: { type: 'graph', params: { x: [0, N + 1], y: [-1, 1], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ fn: '0.3*sin(1.3*x)', domain: [1, N], color: 'ink2', width: 2 }], points: Array.from({ length: N }, (_, i) => ({ x: i + 1, y: 0.3 * Math.sin(1.3 * (i + 1)), color: 'accent', r: 6 })) }, caption: t`The chain of masses and rods (drawn in a plane; it is free in three dimensions).` },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 3 * N, feedback: 'Each rigid rod removes one coordinate: subtract the constraints.' }, { value: 3 * N - N, feedback: t`There are $${N - 1}$ rods between $${N}$ masses, not $${N}$.` }, { value: 6, feedback: 'Six would be a rigid body; the joints let the rods swing independently.' }].filter((e) => e.value !== ans),
          hints: [t`$3N$ Cartesian coordinates for $N$ point masses.`, t`$3\times${N} - ${N - 1}$.`],
          teach: 'Each independent holonomic constraint removes one coordinate: degrees of freedom = coordinates − constraints.',
          explain: t`$3\times${N} - ${N - 1} = ${ans}$: three for the centre of mass, and two angles for each rod’s direction (plus nothing for its fixed length) — $3 + 2\times${N - 1} = ${ans}$.`,
        };
      },
    }),
    mcq({
      id: 'curl-test', difficulty: 2,
      prompt: t`Which velocity constraint on $(x, y, z)$ is **nonholonomic**?`,
      visual: { type: 'field2d', params: { P: '-y', Q: 'x', x: [-2, 2], y: [-2, 2], probe: false, readout: false }, caption: t`The vector field $(-y, x)$ circulates: its curl is not zero. A constraint covector that twists like this cannot be the gradient of anything, even after rescaling.` },
      choices: [t`$\dot z + x\dot y - y\dot x = 0$`, t`$x\dot x + y\dot y + z\dot z = 0$`, t`$\dot z - 2x\dot x = 0$`, t`$y\dot x + x\dot y + \dot z = 0$`],
      answer: 0,
      why: {
        1: t`This is $\tfrac12\tfrac{d}{dt}(x^2 + y^2 + z^2) = 0$: motion on a sphere, holonomic.`,
        2: t`This is $\tfrac{d}{dt}(z - x^2) = 0$: holonomic.`,
        3: t`This is $\tfrac{d}{dt}(xy + z) = 0$: holonomic.`,
      },
      hints: [t`Try to recognize each as $\tfrac{d}{dt}$ of something.`, t`For $a = (-y, x, 1)$, $\nabla\times a = (0, 0, 2)$ and $a\cdot(\nabla\times a) = 2$.`],
      teach: t`A linear velocity constraint $a\cdot\dot{\mathbf q} = 0$ in three variables is holonomic exactly when $a\cdot(\nabla\times a) = 0$.`,
      explain: t`$a\cdot(\nabla\times a) = 2 \ne 0$. The other three are exact derivatives, so their curls vanish. This is the explore’s constraint, scaled by $2$.`,
    }),
    num({
      id: 'lift-area', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1, 1.5, 2]), b = r.pick([0.4, 0.8, 1.2]);
        const ans = Math.PI * a * b;
        return {
          prompt: t`With $\dot z = \tfrac12(x\dot y - y\dot x)$, $x$ and $y$ are driven once counterclockwise around the ellipse $x = ${a}\cos s$, $y = ${b}\sin s$. By how much has $z$ changed when the loop closes?`,
          visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [-1.5, 1.5], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', curves: [{ param: [`${a}*cos(t)`, `${b}*sin(t)`], t: [0, 6.2832], color: 'gold', width: 2.2 }], arrows: [{ from: [a, -0.05], to: [a, 0.2], color: 'gold' }] }, caption: t`The loop in the $xy$-plane, travelled counterclockwise.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`$\tfrac12\oint(x\,dy - y\,dx)$ is the area; you dropped the $\tfrac12$.` }, { value: 0, feedback: t`The loop closes in $(x, y)$, but $z$ is not a function of $(x, y)$: it accumulates the enclosed area.` }],
          hints: [t`$\Delta z = \tfrac12\oint(x\,dy - y\,dx)$, which by Green’s theorem is the enclosed area.`, t`An ellipse’s area is $\pi ab$.`],
          teach: 'For a nonholonomic constraint, going round a closed loop in some coordinates leaves the others changed — here by the enclosed area.',
          explain: t`$\Delta z = \pi\times${a}\times${b} = ${nice(ans, 4)}$. Clockwise would give $-${nice(ans, 4)}$. Small loops give small changes, proportional to their area: the signature of a curvature-like quantity, as in parallel transport.`,
        };
      },
    }),
    num({
      id: 'unicycle', difficulty: 3,
      gen(r) {
        const d = r.pick([1, 1.5, 2, 3]), al = r.pick([20, 30, 45, 60]);
        const ans = 2 * d * Math.sin(deg(al) / 2);
        const c = Math.cos(deg(al)), s = Math.sin(deg(al));
        return {
          prompt: t`A wheel (a unicycle robot) can roll along its heading or turn in place, never slide sideways. It rolls forward $${d}\ \text{m}$, turns in place by $${al}^\circ$, rolls **back** $${d}\ \text{m}$, and turns back by $-${al}^\circ$. Its heading is restored. How far is it from where it started?`,
          visual: { type: 'graph', params: { x: [-0.5, d + 0.8], y: [-d * s - 0.5, 0.8], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (m)', ylabel: 'y (m)', arrows: [{ from: [0, 0], to: [d, 0], color: 'accent', label: '1. forward' }, { from: [d, 0], to: [d - d * c, -d * s], color: 'violet', label: '3. back', labelDx: 8, labelDy: 12 }], points: [{ x: 0, y: 0, color: 'ink2', label: 'start' }, { x: d, y: 0, color: 'gold', r: 4, label: `2. turn ${al}°`, labelDx: -40, labelDy: -14 }] }, caption: t`The two rolling legs. Turning in place moves nothing but the heading.` },
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: 'The legs do not cancel: the second one runs along the new heading.' }, { value: d * Math.sin(deg(al)), feedback: t`That is only the sideways part; there is also a forward part $d(1 - \cos\alpha)$.` }],
          hints: [t`After leg 1: $(d, 0)$. Leg 3 runs backward along heading $\alpha$: subtract $d(\cos\alpha, \sin\alpha)$.`, t`End point $\bigl(d(1 - \cos\alpha), -d\sin\alpha\bigr)$; its distance is $2d\sin(\alpha/2)$.`],
          teach: 'Alternating two allowed motions (roll, turn) in a loop produces a third, forbidden-looking one (sideways): the hallmark of a nonholonomic constraint, measured by a Lie bracket.',
          explain: t`$2\times${d}\times\sin(${al / 2}^\circ) = ${nice(ans, 3)}\ \text{m}$, mostly sideways for small turns. Repeating the loop is parallel parking: the wheel can reach any position and heading, though it never slides.`,
        };
      },
    }),
    mcq({
      id: 'what-is-lost', difficulty: 2,
      prompt: t`A coin rolls upright without slipping on a table. Its configuration is $(x, y, \theta, \varphi)$ — contact point, heading and rolling angle — and rolling imposes two velocity constraints, $\dot x = R\dot\varphi\cos\theta$ and $\dot y = R\dot\varphi\sin\theta$. What do these two constraints remove?`,
      visual: { type: 'graph', params: { x: [-0.5, 4], y: [-1.2, 1.5], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', curves: [{ param: ['t', '0.6*sin(t)'], t: [0, 3.8], color: 'accent', width: 2.2, label: 'contact path', labelAt: 1.6, labelDy: -12 }], arrows: [{ from: [1.2, 0.56], to: [1.6, 0.56 + 0.4 * 0.6 * Math.cos(1.2)], color: 'gold', label: 'heading θ' }] }, caption: t`A path traced by the coin’s contact point. It may wander anywhere; at every instant it moves along its heading.` },
      choices: [
        t`Two velocity directions (no sideways or skidding motion), but no configurations: every $(x, y, \theta, \varphi)$ can still be reached`,
        t`Two configuration dimensions: the coin lives on a 2-dimensional surface in $(x, y, \theta, \varphi)$`,
        t`Nothing, because they are velocity constraints`,
        t`All but one degree of freedom`,
      ],
      answer: 0,
      why: {
        1: t`That would be true of two holonomic constraints. These cannot be integrated: wiggling roll and turn reaches any position, heading and roll angle.`,
        2: t`They certainly restrict how the coin moves at each instant: only two velocity combinations (roll and turn) are allowed.`,
        3: t`Two of four velocity directions remain: rolling and turning.`,
      },
      hints: [t`Can the coin end up one radius to its side with the same heading and roll angle? (See the unicycle problem.)`],
      teach: 'Holonomic constraints reduce both configurations and velocities; nonholonomic ones reduce only the velocities at each instant.',
      explain: t`At each instant the velocity lies in a 2-dimensional subspace of the 4 directions; over time, combinations of the two reach all 4. Lagrangian mechanics handles this with multipliers rather than by eliminating coordinates — the next lesson.`,
    }),
    mcq({
      id: 'integrating-factor', difficulty: 3,
      prompt: t`Is the two-variable constraint $x\dot y - y\dot x = 0$ (for $x > 0$) holonomic?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-2, 2], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', curves: [-1.2, -0.6, 0.3, 0.8].map((m) => ({ fn: `${m}*x`, color: 'violet', width: 1.8, label: `y/x = ${m}`, labelAt: 2.4, labelDx: 4 })) }, caption: t`Rays from the origin: the curves on which a motion obeying the constraint stays.` },
      choices: [
        t`Yes: dividing by $x^2$ gives $\tfrac{d}{dt}(y/x) = 0$, so $y/x$ is constant — and every Pfaffian constraint in two variables can be integrated this way`,
        t`No: it is not the time derivative of anything`,
        t`No: velocity constraints are never holonomic`,
        t`Only if $x = y$`,
      ],
      answer: 0,
      why: {
        1: t`Not as it stands, but after multiplying by $1/x^2$ it is. Holonomic means integrable up to a factor.`,
        2: t`Many velocity constraints are derivatives in disguise; this one, with a factor.`,
        3: t`The constraint holds along any ray from the origin, not one line.`,
      },
      hints: [t`Compute $\dfrac{d}{dt}\dfrac yx$.`, t`It is $\dfrac{x\dot y - y\dot x}{x^2}$.`],
      teach: 'A velocity constraint is holonomic if some integrating factor turns it into a total derivative; in two variables one always exists, so nonholonomy needs three or more.',
      explain: t`$\dfrac{x\dot y - y\dot x}{x^2} = \dfrac{d}{dt}\dfrac yx$. In two dimensions a single Pfaffian constraint just defines a family of curves; the twist that obstructs integrability (the curl test) needs a third direction to twist into.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-satellite', difficulty: 3, transfer: true,
      prompt: t`A satellite with two hinged solar panels floats with **zero** total angular momentum. Conservation of angular momentum, $\mathbf L = 0$, relates the body’s rotation rate to the panels’ hinge rates. Can the satellite change its orientation using only its panels, and end with the panels back where they started?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.4, 1.4], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: ['0.5*cos(t) - 0.5*sin(t)', '0.5*cos(t) + 0.5*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2 }], arrows: [{ from: [0.6, 0], to: [2.2, 0.6], color: 'accent', width: 3, label: 'panel 1' }, { from: [-0.6, 0], to: [-2.2, -0.3], color: 'accent', width: 3, label: 'panel 2', labelDx: -50 }] }, caption: t`A schematic satellite body with two hinged panels. Panel moves are the “shape” coordinates; the body angle is what we want to change.` },
      choices: [
        t`Yes: $\mathbf L = 0$ is a nonholonomic constraint on the body angle and the panel angles, so a closed cycle of panel motions can leave a net rotation — as a falling cat turns over`,
        t`No: zero angular momentum means the orientation can never change`,
        t`Yes, but only if the panels end in a different position`,
        t`No: a constraint from a conservation law is always holonomic`,
      ],
      answer: 0,
      why: {
        1: t`$\mathbf L = 0$ fixes the rotation **rate** for given panel rates; it does not fix the orientation as a function of the panel angles.`,
        2: t`The point of the cycle is that the panels return exactly; the net rotation survives because the constraint cannot be integrated.`,
        3: t`Conservation of momentum gives a holonomic constraint (the centre of mass), but angular momentum, which involves the moment of inertia of a changing shape, generally does not.`,
      },
      hints: [t`Write $\mathbf L = 0$ as a relation among $\dot\theta_{\text{body}}$ and $\dot\theta_{\text{panels}}$: a velocity constraint.`, 'Is the body angle a function of the panel angles, or does it depend on the path through panel space?'],
      teach: 'Angular momentum conservation acts as a nonholonomic constraint on a deformable body: shape cycles produce net rotation (geometric phase).',
      explain: t`The net rotation is proportional to the area the cycle encloses in panel-angle space — like the explore’s climb. Astronauts turn themselves this way, and it has been proposed and studied for reorienting spacecraft without thrusters or wheels.`,
    }),
    num({
      id: 'cp-parking', difficulty: 3,
      gen(r) {
        const d = r.pick([2, 2.5, 4]), al = r.pick([10, 15, 25]);
        const once = 2 * d * Math.sin(deg(al) / 2), n = r.pick([2, 3, 4]);
        const ans = n * d * Math.sin(deg(al));
        return {
          prompt: t`The unicycle repeats the manoeuvre “forward $${d}\ \text{m}$, turn $${al}^\circ$, back $${d}\ \text{m}$, turn $-${al}^\circ$” $${n}$ times. Each cycle shifts it by $\bigl(d(1 - \cos\alpha), -d\sin\alpha\bigr)$ with the heading restored. How far has it moved **sideways** (perpendicular to its heading), in metres?`,
          visual: { type: 'graph', params: { x: [-0.5, n * d * (1 - Math.cos(deg(al))) + d + 0.5], y: [-n * d * Math.sin(deg(al)) - 0.6, 0.8], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (m)', ylabel: 'y (m)', points: Array.from({ length: n + 1 }, (_, k) => ({ x: k * d * (1 - Math.cos(deg(al))), y: -k * d * Math.sin(deg(al)), color: k ? 'accent' : 'ink2', r: 4 })) }, caption: t`Where the wheel is after each complete cycle (heading always along $+x$).` },
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: n * once, feedback: t`That counts the full shift, including the forward part $d(1 - \cos\alpha)$. Sideways is the $y$ part only.` }, { value: d * Math.sin(deg(al)), feedback: 'That is one cycle; the shifts add.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Sideways per cycle: $d\sin\alpha$.`, t`Times $${n}$ cycles.`],
          teach: 'Repeated small loops of allowed motions add up to a large forbidden-looking displacement: nonholonomic systems are controllable.',
          explain: t`$${n}\times${d}\sin ${al}^\circ = ${nice(ans, 3)}\ \text{m}$ sideways — a wheel that has never slid. For small turns the sideways shift per cycle grows as $d\alpha$, the “area” of the loop in (distance, angle) space.`,
        };
      },
    }),
    mcq({
      id: 'cp-gr-constraints', difficulty: 2,
      prompt: t`On each moment of time, Einstein’s equations require four relations among the spatial metric and its rate of change (the Hamiltonian and momentum constraints). In this lesson’s language, what kind of constraints are they?`,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'space', ylabel: 'time', yticks: 0, xticks: 0, curves: [0.5, 1.3, 2.1].map((h) => ({ fn: `${h} + 0.15*sin(1.5*x + ${h})`, color: 'accent', width: 2 })) }, caption: t`Spacetime sliced into moments. Each slice’s data must satisfy the constraints before evolving.` },
      choices: [
        t`Relations among the phase-space variables (coordinates and momenta) that hold at each instant — the kind Dirac’s theory, two lessons on, is built for`,
        t`Nonholonomic constraints like a rolling wheel’s, which can be broken by cycling the metric`,
        t`Boundary conditions at infinity only`,
        t`Gauge choices that one is free to impose or not`,
      ],
      answer: 0,
      why: {
        1: t`They cannot be evaded by any motion: they hold on every slice of every solution.`,
        2: t`They hold at every point of every slice, not only far away.`,
        3: t`The gauge choices are the lapse and shift; the constraints are equations the data must obey whatever the gauge.`,
      },
      hints: [t`They involve the metric and its rate of change — positions and momenta, in Hamiltonian language.`],
      teach: 'GR’s Hamiltonian and momentum constraints restrict initial data on every slice: constraints on phase space, which Dirac’s method classifies.',
      explain: t`They involve momenta, so they are not holonomic in the strict configuration-space sense — Dirac’s theory treats such phase-space constraints. See [constraints and evolution](#/lesson/gr.S29.i) for their role in simulations.`,
    }),
  ],
  sources: [
    { label: 'Goldstein, Poole & Safko, Classical Mechanics, 3rd ed., §1.3 and §2.4 (constraints)', url: 'https://openlibrary.org/isbn/9780201657029' },
    { label: 'Bloch, Nonholonomic Mechanics and Control, 2nd ed. (Springer, 2015), ch. 1', url: 'https://scholar.google.com/scholar?q=Bloch+%22Nonholonomic+Mechanics+and+Control%22' },
    { label: 'Montgomery, Gauge theory of the falling cat, Fields Inst. Commun. 1, 193 (1993)', url: 'https://scholar.google.com/scholar?q=Montgomery+%22Gauge+theory+of+the+falling+cat%22' },
  ],
});
