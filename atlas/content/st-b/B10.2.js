// Why the type decides what you can ask: hyperbolic equations take Cauchy
// data (u and u_t) on a non-characteristic initial slice and march; parabolic
// ones take u at the start and march forward only; elliptic ones take one
// condition all round a closed boundary. Ask the wrong question and you get
// no solution, many, or one that ignores small changes in the data no longer:
// the wave equation's Dirichlet problem on a square has infinitely many
// solutions; Laplace's Cauchy problem and the backward heat equation are the
// ill-posed ones of B12.1. Smoothness by type; GR's elliptic constraints.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { player, SRC } from './_pde.js';

const t = String.raw;
// the unit square's edges as graph curves
const edge = { bottom: ['t', '0'], top: ['t', '1'], left: ['0', 't'], right: ['1', 't'] };
const side = (which, color, width, when, dash) => ({ param: edge[which], t: [0, 1], color, width, when, ...(dash ? { dash } : {}) });
const W = 'step(0.5 - abs(eq - 0))', H = 'step(0.5 - abs(eq - 1))', L = 'step(0.5 - abs(eq - 2))';
const label = (x, y, text, color, when, extra = {}) => ({ x, y, label: text, r: 0, color, when, labelAlign: 'center', labelDx: 0, labelDy: 0, ...extra });

export default lesson({
  id: 'st-b.B10.2',
  title: 'Why the type decides what you can ask',
  minutes: 13, difficulty: 3,
  intro: t`Each type of equation answers one kind of question, and only that kind:

- **Hyperbolic** (waves): give $u$ **and** $u_t$ on an initial slice — the **Cauchy data** — plus conditions where characteristics enter through the sides. The solution marches forward, and backward too, at finite speed.
- **Parabolic** (diffusion): give $u$ alone at the start, plus side conditions. It marches **forward only**, smoothing as it goes.
- **Elliptic** (equilibrium): give **one** condition — $u$, or its normal derivative $\partial_n u$ — **all the way round** a closed boundary. There is no “start”: every boundary point influences every interior point.

Ask the wrong question and something breaks: there is no solution, or there are many, or the answer jumps wildly when the data move a little. Hadamard’s word for a question that works is **well-posed** (module B12).`,
  symbols: [
    { tex: 'u,\\ u_t', text: 'the Cauchy data of a hyperbolic equation: the value and the rate of change on the initial slice' },
    { tex: t`\partial_n u`, text: 'the derivative across the boundary (along the outward normal): a flux, for heat — the Neumann datum' },
    { tex: t`\partial\Omega`, text: 'the boundary of the region $\\Omega$ where the equation holds' },
  ],
  why: t`Numerical relativity splits Einstein’s equations exactly along these lines: initial data on a slice of space must satisfy elliptic constraints (solved all at once, like Poisson’s equation), and the slice is then pushed forward by hyperbolic evolution equations. Mixing up the two questions is how early simulations went wrong.`,
  visual: {
    type: 'graph',
    title: 'Where the data go',
    lead: t`A square region, with time (or $y$) upward. Gold and blue edges are where you may — and must — give data; a dashed edge is where you may give nothing. Switch between the three types.`,
    tasks: [
      'Wave: two families of characteristics carry the bottom edge’s u and uₜ up through the square. The top edge is decided by them — impose data there too and you over-ask.',
      'Heat: one family, the horizontal lines t = const — everything at one moment talks to everything else, but only forward in time. Still nothing may be imposed on the top.',
      'Laplace: no characteristics, no direction: one condition on every edge, and each edge’s data reach every interior point.',
    ],
    params: {
      x: [-0.45, 1.45], y: [-0.22, 1.24], aspect: 'wide', xlabel: 'x', ylabel: 't or y', axesAt: 'edge', xticks: 0, yticks: 0,
      choices: [{ key: 'eq', label: 'Type', options: [[0, 'hyperbolic: $u_{tt} = u_{xx}$'], [1, 'parabolic: $u_t = u_{xx}$'], [2, 'elliptic: $u_{xx} + u_{yy} = 0$']], value: 0, explain: 'The same square, three different kinds of equation inside it.' }],
      curves: [
        ...[-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75].map((c) => ({ fn: `x - ${c}`, color: 'violet', width: 1.1, domain: [Math.max(0, c), Math.min(1, 1 + c)], when: W })),
        ...[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75].map((c) => ({ fn: `${c} - x`, color: 'teal', width: 1.1, domain: [Math.max(0, c - 1), Math.min(1, c)], when: W })),
        ...[0.2, 0.4, 0.6, 0.8].map((c) => ({ param: ['t', `${c}`], t: [0, 1], color: 'violet', width: 1.1, when: H })),
        side('bottom', 'gold', 5, `${W} + ${H}`), side('left', 'accent', 4, '1'), side('right', 'accent', 4, '1'),
        side('top', 'ink3', 2, `${W} + ${H}`, [6, 5]), side('top', 'accent', 4, L), side('bottom', 'accent', 4, L),
      ],
      points: [
        label(0.5, -0.12, 'u and uₜ given', 'gold', W), label(0.5, -0.12, 'u given', 'gold', H), label(0.5, -0.12, 'u given', 'accent', L),
        label(0.5, 1.12, 'nothing may be imposed', 'ink3', `${W} + ${H}`), label(0.5, 1.12, 'u given', 'accent', L),
        label(-0.22, 0.5, 'u given', 'accent', '1'), label(1.22, 0.5, 'u given', 'accent', '1'),
      ],
    },
    caption: t`Dirichlet data are shown on the sides; a Neumann or Robin condition would do as well (one condition per boundary point). Characteristics: $x \pm t = $ const for the wave equation, $t = $ const for the heat equation, none for Laplace’s.`,
  },
  example: {
    prompt: t`Pose the wave equation $u_{tt} = u_{xx}$ like Laplace’s equation: on the unit square $0 \le x \le 1$, $0 \le t \le 1$, with $u = 0$ on all four edges. Does it have a unique solution? Compare Laplace’s equation with the same data, and the heat equation given its temperature on the top edge.`,
    visual: { type: 'c3-contour', params: { f: 'sin(2*pi*x)*sin(2*pi*y)*step(x)*step(1 - x)', x: [-0.3, 1.3], y: [0, 1], levels: [-0.75, -0.4, -0.1, 0.1, 0.4, 0.75], labels: false, ylabel: 't', curves: [{ param: ['t', '0'], t: [0, 1], color: 'gold', width: 3 }, { param: ['t', '1'], t: [0, 1], color: 'gold', width: 3 }, { param: ['0', 't'], t: [0, 1], color: 'gold', width: 3 }, { param: ['1', 't'], t: [0, 1], color: 'gold', width: 3 }] }, caption: t`$u = \sin(2\pi x)\sin(2\pi t)$: zero on all four edges (gold), yet not zero inside — and it solves $u_{tt} = u_{xx}$. The map is shaded by value, blue low to gold high.` },
    steps: [
      { label: 'Try a mode', text: t`$u = \sin(n\pi x)\sin(n\pi t)$ has $u_{tt} = -n^2\pi^2u = u_{xx}$, so it solves the wave equation for every whole number $n$.` },
      { label: 'Check the edges', text: t`It vanishes at $x = 0, 1$ and at $t = 0, 1$: all four edges carry the data $u = 0$. So does $u = 0$, and any combination of these modes. **Infinitely many solutions**: the question is not well-posed.` },
      { label: 'Laplace instead', text: t`For $u_{xx} + u_{yy} = 0$ with $u = 0$ on the edges, Green’s identity (lesson B6.2) forces $\int|\nabla u|^2 = 0$: only $u = 0$. The same question, a different type, a unique answer.` },
      { label: 'What went wrong', text: t`The characteristics $x \pm t = $ const carry the bottom edge’s data up to the top. Values on the top edge are therefore *results*, not data: impose them and the problem has no solution unless they happen to match, and then (as here) the bottom’s $u_t$ is left undetermined.` },
      { label: 'The heat equation backward', text: t`Giving the heat equation its temperature on the top edge and asking for the bottom is running it backward in time. A solution exists only for very special data, and tiny changes in the data change it enormously (lessons B4.3 and B12.1).` },
    ],
    answer: t`No: $\sin(n\pi x)\sin(n\pi t)$ solves the problem for every $n$, so it has infinitely many solutions. Laplace’s equation with the same data has only $u = 0$. A hyperbolic equation wants $u$ and $u_t$ on the bottom edge and nothing on the top.`,
  },
  practice: [
    mcq({
      id: 'heat-data', difficulty: 1,
      prompt: t`A metal rod conducts heat: $u_t = Du_{xx}$ on $0 \le x \le L$. Which information determines its temperature for all $t > 0$?`,
      visual: player({ mode: 'heat', profile: 'tri', w: 2, D: 0.6, t: 0.8, tmax: 3, x: [-6, 6] }, 'A temperature profile spreading under the heat equation (dashed: the start). The infinite line stands in for a long rod.'),
      choices: ['the temperature along the rod at t = 0, and the temperature (or heat flux) at both ends for t > 0', 'the temperature and its rate of change along the rod at t = 0, and nothing at the ends', 'the temperature along the rod at t = 0 and at some later time T', 'the end temperatures alone'],
      answer: 0,
      why: {
        1: t`The heat equation is first order in time: $u$ at $t = 0$ already fixes $u_t = Du_{xx}$, so $u_t$ cannot be chosen freely. And without end conditions heat could flow in or out at will.`,
        2: 'Prescribing a later temperature over-asks: the initial data already decide it, and asking for a final state is the backward problem.',
        3: 'The initial state matters: two rods with the same end temperatures but different starting profiles evolve differently (until both settle).',
      },
      hints: ['How many time derivatives does the heat equation have?'],
      teach: 'Parabolic: one initial condition (u at t = 0) plus boundary conditions, marching forward only.',
      explain: t`One time derivative means one initial condition: the profile $u(x, 0)$. One condition at each end (temperature, flux or Robin) for $t > 0$ completes it. That is the problem lesson B7.1 solved by separation.`,
    }),
    mcq({
      id: 'laplace-data', difficulty: 2,
      prompt: t`A square plate has reached a steady temperature, $u_{xx} + u_{yy} = 0$. Which data pin it down?`,
      visual: { type: 'c3-contour', params: { f: '0.25*(x^2 - y^2) + 0.4*x*y + 0.5', x: [-0.3, 1.3], y: [0, 1], levels: 8, labels: false, curves: [{ param: ['t', '0'], t: [0, 1], color: 'ink', width: 2.4 }, { param: ['t', '1'], t: [0, 1], color: 'ink', width: 2.4 }, { param: ['0', 't'], t: [0, 1], color: 'ink', width: 2.4 }, { param: ['1', 't'], t: [0, 1], color: 'ink', width: 2.4 }] }, caption: 'One possible steady temperature in the plate (illustrative): its contours run from edge to edge.' },
      choices: ['the temperature (or the heat flux) at every point of all four edges', 'the temperature and the heat flux along the bottom edge only', 'the temperatures at the four corners', 'the temperature along two opposite edges'],
      answer: 0,
      why: {
        1: 'That is a Cauchy problem for an elliptic equation. Its solution, when one exists, depends so violently on the data that measurements cannot fix it (Hadamard’s example, lesson B12.1).',
        2: 'Four numbers cannot fix a function on a whole plate: infinitely many harmonic functions share them.',
        3: 'The other two edges would be left free, and then infinitely many steady states fit.',
      },
      hints: ['An elliptic equation has no direction to march in. Where must the data be?'],
      teach: 'Elliptic: one condition on every point of a closed boundary — no more, no less.',
      explain: t`Give one condition per boundary point all the way round and there is exactly one steady temperature (up to a constant if every condition is a flux; lesson B6.1). Data on part of the boundary only leave it undetermined; two conditions on part of it over-ask.`,
    }),
    num({
      id: 'nonunique', difficulty: 2,
      gen(r) {
        const c = r.pick([{ T: '1.5', v: 1.5, n: 2 }, { T: '1.25', v: 1.25, n: 4 }, { T: '0.4', v: 0.4, n: 5 }, { T: '\\tfrac23', v: 2 / 3, n: 3 }, { T: '2.5', v: 2.5, n: 2 }]);
        return {
          prompt: t`The wave equation $u_{tt} = u_{xx}$ is posed on the rectangle $0 \le x \le 1$, $0 \le t \le ${c.T}$ with $u = 0$ on all four edges. The modes $\sin(n\pi x)\sin(n\pi t)$ vanish on three edges for every whole number $n$. What is the smallest $n \ge 1$ for which the mode also vanishes on the top edge — a nonzero solution with all-zero data?`,
          visual: { type: 'graph', params: { x: [-0.25, 1.25], y: [-0.05 * c.v, 1.45 * c.v], aspect: 'wide', xlabel: 'x', ylabel: 't', axesAt: 'edge', xticks: 4, yticks: 4, curves: [{ param: ['t', '0'], t: [0, 1], color: 'gold', width: 3 }, { param: ['t', `${c.v}`], t: [0, 1], color: 'gold', width: 3 }, { param: ['0', `${c.v}*t`], t: [0, 1], color: 'gold', width: 3 }, { param: ['1', `${c.v}*t`], t: [0, 1], color: 'gold', width: 3 }, { fn: `${c.v} + ${(0.3 * c.v).toFixed(4)}*sin(pi*x)*sin(pi*${c.v.toFixed(6)})`, color: 'accent', width: 2, dash: [5, 4], domain: [0, 1] }] }, caption: t`The rectangle and its zero edges (gold). Dashed: the $n = 1$ mode along the top edge (exaggerated), which is not zero there for this $T$.` },
          answer: c.n, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: 1, feedback: t`At $n = 1$ the top edge has $\sin(\pi T) \ne 0$ for this $T$.` }].filter((e) => e.value !== c.n),
          hints: [t`You need $\sin(n\pi T) = 0$, i.e. $nT$ a whole number.`, t`Try $n = 1, 2, 3, \ldots$ with $T = ${c.T}$.`],
          teach: 'For the wave equation, zero data all round a rectangle can still allow nonzero solutions: the boundary-value question is the wrong one.',
          explain: t`$nT$ must be a whole number; the smallest is $n = ${c.n}$ (then $nT = ${Math.round(c.n * c.v)}$). So $u = \sin(${c.n}\pi x)\sin(${c.n}\pi t)$, and every multiple of it, solves the problem with all-zero data: no uniqueness. For a rectangle whose $T$ is not a fraction no mode fits, but the problem is still not well-posed: the hyperbolic equation wants Cauchy data on the bottom, not values on the top.`,
        };
      },
    }),
    mcq({
      id: 'two-conditions', difficulty: 2,
      prompt: t`Why must a vibrating string be given both its initial shape $u(x, 0)$ and its initial velocity $u_t(x, 0)$, when a rod needs only its initial temperature?`,
      visual: player({ mode: 'wave', init: 'strike', profile: 'gauss', w: 1, c: 2, t: 1.2, tmax: 3, x: [-8, 8] }, 'A string struck while flat: no initial displacement at all, yet it moves — its initial velocity alone sets it going.'),
      choices: [t`The wave equation is second order in time, so (like $F = ma$) it needs a position and a velocity; the heat equation is first order in time`, 'Strings are more sensitive to their initial state than rods', 'The velocity is needed only when the string is struck; a plucked string needs only its shape', 'Both need both, but the rod’s initial rate of heating is usually zero'],
      answer: 0,
      why: {
        1: 'Sensitivity is not the issue — the count of time derivatives is.',
        2: t`A plucked string has $u_t = 0$ — that is still a datum; another initial velocity would give another motion.`,
        3: t`For the rod $u_t = Du_{xx}$ at $t = 0$ is already determined by the profile: it cannot be prescribed separately.`,
      },
      hints: ['Count the time derivatives in each equation.'],
      teach: 'The number of initial conditions equals the order in time: two for waves, one for diffusion.',
      explain: t`$u_{tt} = c^2u_{xx}$ is Newton’s law for each bit of string; like any $F = ma$, it needs positions and velocities. The struck string in the picture starts flat and moves anyway. The heat equation fixes $u_t$ from $u$, so prescribing it too would over-ask.`,
    }),
    mcq({
      id: 'jumps', difficulty: 2,
      prompt: t`An initial profile has a sharp jump. For which equation can the solution still have a jump at a later time $t > 0$?`,
      visual: player({ mode: 'wave', modes: ['wave', 'heat'], init: 'pluck', profile: 'box', w: 1.5, c: 2, D: 0.5, t: 1.2, tmax: 3, x: [-8, 8] }, 'A square pulse (dashed) evolved by one of the equations; below, the x–t plane.'),
      choices: ['the wave equation: jumps travel along its characteristics', 'the heat equation: jumps diffuse slowly but remain', 'both: initial jumps never disappear', 'neither: every PDE smooths its data'],
      answer: 0,
      why: {
        1: t`The heat equation smooths instantly: every mode decays as $e^{-Dk^2t}$, so for any $t > 0$ the solution is infinitely differentiable (lesson B4.3).`,
        2: 'Parabolic and elliptic solutions are smooth inside their region, whatever the data.',
        3: 'Hyperbolic equations carry singularities without smoothing them: the picture’s pulse keeps its sharp edges.',
      },
      hints: ['Which equation has characteristics a jump could ride along?'],
      teach: 'Hyperbolic equations propagate singularities along characteristics; parabolic and elliptic ones smooth them away.',
      explain: t`D’Alembert’s solution moves the jump intact at speed $c$ — the wave picture shows two square half-pulses. That is why shocks and sonic booms (module B11) exist only for hyperbolic equations, and why heat conduction and steady fields are always smooth inside.`,
    }),
    match({
      id: 'natural-question', difficulty: 2,
      prompt: t`Match each physical problem with the data that make it well-posed.`,
      visual: { type: 'graph', params: { x: [-0.45, 1.45], y: [-0.2, 1.2], aspect: 'wide', xlabel: 'x', ylabel: 't or y', axesAt: 'edge', xticks: 0, yticks: 0, curves: [side('bottom', 'gold', 5), side('left', 'accent', 4), side('right', 'accent', 4), side('top', 'ink3', 2, undefined, [6, 5])] }, caption: 'A region with data on the bottom and sides only (gold, blue) — the shape of an evolution problem. An equilibrium problem would have data on the top as well.' },
      left: [t`a guitar string, $u_{tt} = c^2u_{xx}$`, t`a cooling rod, $u_t = Du_{xx}$`, t`a steady plate, $\nabla^2u = 0$`, t`a galaxy’s potential, $\nabla^2\Phi = 4\pi G\rho$`],
      right: ['initial shape and velocity, plus the two ends', 'initial temperature, plus the two ends', 'one condition all round the edge', 'the density everywhere, and Φ → 0 far away', 'the final state, worked backward'],
      answer: [0, 1, 2, 3],
      hints: ['Two evolution problems (one second-order in time, one first), and two equilibrium problems.', 'For the galaxy, the “boundary” is at infinity.'],
      teach: 'Evolution equations take initial data and march; equilibrium equations take boundary data all round, even if the boundary is at infinity.',
      explain: t`String: Cauchy data plus end conditions (hyperbolic). Rod: initial temperature plus end conditions (parabolic). Plate: one condition all round (elliptic). Galaxy: Poisson’s equation in all space, with $\Phi \to 0$ far away as the boundary condition — solved by the Green’s function of lesson B9.2. Working backward from a final state is the ill-posed question.`,
    }),
    mcq({
      id: 'characteristic-slice', difficulty: 3,
      prompt: t`For $u_{tt} = u_{xx}$ someone gives Cauchy data, $u$ and $u_t$, along the line $x = t$ instead of along $t = 0$. What goes wrong?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [0, 2], aspect: 'wide', equal: true, xlabel: 'x', ylabel: 't', axesAt: 'edge', xticks: 0, yticks: 0, curves: [...[-1.5, -1, -0.5, 0, 0.5].map((c) => ({ fn: `x - ${c}`, color: 'violet', width: 1, domain: [Math.max(-2, c), 2] })), ...[-0.5, 0, 0.5, 1, 1.5, 2].map((c) => ({ fn: `${c} - x`, color: 'teal', width: 1, domain: [-2, Math.min(2, c)] })), { fn: 'x', color: 'gold', width: 4, domain: [0, 2] }] }, caption: 'The two families of characteristics, and the line x = t (gold) where the data are given: it is one of the violet characteristics.' },
      choices: ['x = t is a characteristic: the data on it cannot be chosen freely, and even consistent data leave the solution undetermined', 'Nothing: any line will do, as long as u and uₜ are given on it', 'The data must be given on two lines instead of one', 'Only the speed changes: the solution moves at a different c'],
      answer: 0,
      why: {
        1: 'Not any line: Cauchy data must be given on a non-characteristic curve — one that every characteristic crosses.',
        2: t`Two lines would over-ask; one non-characteristic line with $u$ and $u_t$ is right.`,
        3: 'The equation, and hence its speed, is unchanged; the problem is where the data sit.',
      },
      hints: [t`Write $u = F(x - t) + G(x + t)$. On the line $x = t$, what is $F(x - t)$?`, t`It is the single number $F(0)$: the data on that line cannot reveal $F$, and $u$, $u_t$ there are tied together.`],
      teach: 'Cauchy data must sit on a non-characteristic surface — for waves, a spacelike one — or they can neither be chosen freely nor fix the solution.',
      explain: t`On $x = t$, $u = F(0) + G(2t)$: the right-moving part is invisible there, so $F$ is undetermined, and $u$ and $u_t$ are linked (both are fixed by $G$), so they cannot be chosen independently. In relativity this is why initial data live on a **spacelike** slice — one that every light ray crosses — and never on a light cone.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-marching', difficulty: 2, transfer: true,
      prompt: t`A CFD code for a supersonic inlet can compute the flow by **marching** downstream, slice by slice, never looking back. The same trick fails in the subsonic region behind the inlet’s shock. Why?`,
      visual: { type: 'graph', params: { x: [-0.2, 4.2], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'x (flow direction)', ylabel: 'y', axesAt: 'edge', xticks: 0, yticks: 0, shade: [{ fn: '1.3', lower: '-1.3', from: 2.6, to: 4.2, color: 'accent', alpha: 0.12 }], curves: [...[0, 0.6, 1.2, 1.8].map((x0) => ({ fn: `(x - ${x0})*0.58`, color: 'violet', width: 1.1, domain: [x0, 2.6] })), ...[0, 0.6, 1.2, 1.8].map((x0) => ({ fn: `-(x - ${x0})*0.58`, color: 'teal', width: 1.1, domain: [x0, 2.6] })), { param: ['2.6', 't'], t: [-1.3, 1.3], color: 'warn', width: 3 }], points: [{ x: 1.2, y: 1.15, label: 'supersonic', r: 0, color: 'ink2', labelAlign: 'center', labelDx: 0 }, { x: 3.4, y: 1.15, label: 'subsonic', r: 0, color: 'ink2', labelAlign: 'center', labelDx: 0 }, { x: 2.6, y: -1.15, label: 'shock', r: 0, color: 'warn', labelDx: 6 }] }, caption: 'Supersonic flow with its Mach lines (left), a normal shock (orange) and subsonic flow behind it (shaded). Schematic.' },
      choices: ['Subsonic flow is elliptic: downstream conditions affect every upstream point, so the whole region must be solved together', 'Subsonic flow is parabolic, so it can only be marched backward', 'The shock adds too many grid points', 'Marching works everywhere; the failure must be a bug'],
      answer: 0,
      why: {
        1: 'Steady subsonic flow is elliptic, not parabolic, and no direction of marching works for it.',
        2: 'The number of points is not the issue: a subsonic region has no direction in which information flows one way.',
        3: 'It is the mathematics, not a bug: marching an elliptic equation is the ill-posed Cauchy problem.',
      },
      hints: [t`Classify the small-disturbance equation $(1 - M^2)\phi_{xx} + \phi_{yy} = 0$ on each side of $M = 1$.`],
      teach: 'Hyperbolic regions can be marched along their characteristics; elliptic regions must be solved all at once with conditions all round.',
      explain: t`Supersonic: hyperbolic in $x$ — downstream points depend only on upstream data, so marching works. Subsonic: elliptic — the outlet pressure is felt all the way to the shock, so the region needs boundary conditions all round and an iterative or global solve. Transonic codes switch method across $M = 1$ for exactly this reason.`,
    }),
    mcq({
      id: 'cp-inverse-heat', difficulty: 3, transfer: true,
      prompt: t`Engineers want the heat flux that hit a re-entry capsule’s outer surface, but their thermocouples sit 1 cm deep inside the heat shield. Working the heat equation from the buried readings out to the surface is called **inverse heat conduction**. What kind of problem is it?`,
      visual: player({ mode: 'heat', profile: 'rough', w: 2, D: 0.4, t: 0.6, tmax: 3, x: [-8, 8] }, 'A rippled temperature profile under the heat equation (dashed: the start): the fine ripple is gone almost at once. Recovering it from the smooth result is the inverse problem.'),
      choices: ['Ill-posed, like the backward heat equation: fine detail in the surface heating is damped on its way in, so recovering it amplifies measurement noise — it needs regularization', 'Well-posed: the heat equation can be solved in any direction', 'Impossible even in principle: a buried sensor carries no information about the surface', 'Hyperbolic, because heat travels inward at a finite speed'],
      answer: 0,
      why: {
        1: 'The heat equation is well-posed only forward in time, with data in the right places; asking for the surface from inside reverses the damping.',
        2: 'The slow, smooth part of the heating does reach the sensor and can be recovered; it is the fast detail that is lost below the noise.',
        3: 'Fourier conduction is parabolic: it has no finite speed and no characteristics carrying the signal.',
      },
      hints: [t`A surface oscillation of frequency $\omega$ decays with depth as $e^{-x/\delta}$, $\delta = \sqrt{2\alpha/\omega}$. What happens to noise if you undo that decay?`, 'Running diffusion in the direction it does not naturally go is the backward heat equation in disguise.'],
      teach: 'Inverse heat conduction runs diffusion backward: it is ill-posed, so practical methods trade detail for stability (regularization).',
      explain: t`A surface heating oscillation decays as $e^{-x/\delta}$ with $\delta = \sqrt{2\alpha/\omega}$ on its way in; undoing that multiplies sensor noise by $e^{x/\delta}$, enormous for fast changes. Flight-data reconstructions (for the Shuttle’s tiles, or the Mars Science Laboratory’s heat shield) therefore smooth the answer in time on purpose — lesson B12.1 makes this precise.`,
    }),
    mcq({
      id: 'cp-constraints', difficulty: 2,
      prompt: t`To start a simulation of two black holes, numerical relativists must find initial data on one slice of space that satisfy Einstein’s four **constraint equations**, which are elliptic (Poisson-like) on that slice. How must they be solved?`,
      visual: { type: 'c3-contour', params: { f: '-1/sqrt((x - 1)^2 + y^2 + 0.05) - 1/sqrt((x + 1)^2 + y^2 + 0.05)', x: [-3.2, 3.2], y: [-2, 2], levels: [-3, -2, -1.4, -1, -0.8, -0.6], labels: false }, caption: 'A Poisson-like field of two compact sources on one slice of space (Newtonian potential, illustrative): the shape of the problem the constraints pose.' },
      choices: ['As a boundary-value problem over the whole slice at once, with conditions far away (the metric becoming flat at large distance)', 'By marching outward from the black holes, slice by slice in radius', 'By evolving them forward in time from an initial guess', 'They need no solving: any data will do once the evolution starts'],
      answer: 0,
      why: {
        1: 'Marching an elliptic equation in radius is a Cauchy problem for an elliptic equation: ill-posed.',
        2: 'The constraints hold on each slice; they are not evolution equations, though relaxation methods may borrow a pseudo-time to solve them.',
        3: 'Data that violate the constraints are not a solution of Einstein’s equations at all; the evolution then follows something unphysical.',
      },
      hints: ['Elliptic means: one condition all round, everything solved together.'],
      teach: 'Elliptic constraints are solved globally on a slice, with conditions at the outer boundary — like Poisson’s equation for a galaxy.',
      explain: t`The constraints are solved like Poisson’s equation: all over the slice at once, with asymptotic flatness as the condition at infinity (often by relaxation or multigrid). Only then do the hyperbolic evolution equations take over and march the slice forward — the two questions of this lesson, in one simulation (module B14).`,
    }),
  ],
  sources: [SRC.strauss, SRC.evans, { label: 'M. Alcubierre, Introduction to 3+1 Numerical Relativity (Oxford University Press, 2008), ch. 2–3', url: 'https://doi.org/10.1093/acprof:oso/9780199205677.001.0001' }],
});
