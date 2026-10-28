// Spacetime diagrams and the interval — a moving frame's axes on your
// diagram, calibrated by the invariant hyperbolae; the interval
// Δs² = (cΔt)² − Δx² (Taylor–Wheeler's sign: positive for timelike pairs;
// the Road to Einstein uses Carroll's opposite sign); and two paradoxes
// dissolved on one diagram each: the pole in the barn (worked example) and
// the twins' jump in "now" at the turnaround. Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { C } from './_constants.js';
import { label, minkowski, r6 } from './_diagrams.js';

const t = String.raw;
const g = (b) => 1 / Math.sqrt(1 - b * b);
const CNS = C / 1e9;                             // m per ns
// the worked example: a 10 m pole and an 8 m barn, pole at 0.6c
const PB = { LP: 10, LB: 8, b: 0.6 };
PB.G = g(PB.b); PB.dtp = PB.G * PB.b * PB.LB;   // c·Δt′ between the door events, m

/** The pole and the barn in the barn's frame (x and ct in metres): doors, pole ends, both frames' "now". */
function poleBarn({ LP, LB, b, numbers = true, caption, labels = true }) {
  const top = LB * 0.95, x1 = -LB * 0.45, x2 = LB * 1.5;
  return minkowski({
    x: [x1, x2], t: [-LB * 0.55, top], xlabel: 'x (m, barn frame)', ylabel: 'ct (m)', numbers, aspect: 'wide',
    lines: [
      { pts: [[0, -LB * 0.5], [0, top]], color: 'ink2', width: 3 },
      { pts: [[LB, -LB * 0.5], [LB, top]], color: 'ink2', width: 3 },
      { pts: [[-b * LB * 0.5, -LB * 0.5], [b * top, top]], color: 'accent', width: 2.4 },
      { pts: [[LB - b * LB * 0.5, -LB * 0.5], [LB + b * top, top]], color: 'accent', width: 2.4 },
      { pts: [[x1, 0], [x2, 0]], color: 'ink3', width: 1.3, dash: true },
    ],
    simul: [{ at: [0, 0], beta: b, color: 'gold' }],
    events: labels ? [[0, 0, 'E1: back of pole at front door', 'accent2', -10, 16, 'right'], [LB, 0, 'E2: front of pole at back door', 'accent2', 10, 16]] : [[0, 0, 'E1', 'accent2', -10, 14, 'right'], [LB, 0, 'E2', 'accent2', 10, 14]],
    extra: { points: [label(0, top * 0.92, 'front door', 'ink2', -8, 0, 'right'), label(LB, -LB * 0.38, 'back door', 'ink2', 8, 0), label(b * top * 0.75, top * 0.75, 'rear of pole', 'accent', -8, 0, 'right'), label(LB + b * top * 0.6, top * 0.6, 'front of pole', 'accent', 8, 0), label(x2 * 0.97, b * x2 * 0.97, 'pole’s “now”', 'gold', 0, -12, 'right'), label(x1 * 0.95, 0, 'barn’s “now”', 'ink3', 0, -12, 'left')] },
    caption: caption ?? 'The barn’s frame, with time drawn as ct in metres: the doors (grey) stand still, the pole’s two ends (blue) move right. Dashed grey: the barn’s “now” through E1; gold: the pole’s.',
  });
}

/** The twins: Earth's worldline, the traveller out and back, and the traveller's two "nows" at the turnaround. */
function twins({ D, b, numbers = false, caption }) {
  const T = 2 * D / b, tu = D / b;
  return minkowski({
    x: [-0.25 * D, 1.35 * D], t: [-0.05 * T, 1.06 * T], numbers, aspect: 'square',
    lines: [
      { pts: [[0, -0.03 * T], [0, 1.04 * T]], color: 'accent', width: 2.6 },
      { pts: [[0, 0], [D, tu]], color: 'gold', width: 2.4 }, { pts: [[D, tu], [0, T]], color: 'gold', width: 2.4 },
      { pts: [[D, tu], [0, tu - b * D]], color: 'violet', width: 1.6, dash: true }, { pts: [[D, tu], [0, tu + b * D]], color: 'warn', width: 1.6, dash: true },
    ],
    events: [[D, tu, 'turnaround', 'gold', 10, 0], [0, tu - b * D, '“now” just before', 'violet', -10, 0, 'right'], [0, tu + b * D, '“now” just after', 'warn', -10, 0, 'right']],
    extra: { points: [label(0, 0.08 * T, 'Earth', 'accent', -8, 0, 'right'), label(D * 0.45, tu * 0.45, 'traveller', 'gold', 10, 4)] },
    caption: caption ?? 'Earth’s frame, years up and light-years across (c = 1). Gold: the traveller. Dashed: the traveller’s lines of simultaneity just before (violet) and just after (orange) turning around. Not to scale.',
  });
}

export default lesson({
  id: 'phys2710.MP2.4',
  title: 'Spacetime diagrams and the interval',
  minutes: 14, difficulty: 3,
  intro: t`A spacetime diagram puts every event on one sheet: time up, space across, light along 45° lines. A second observer, moving at $v$, has axes that close up toward the light line like a pair of scissors: the $t'$ axis is that observer’s worldline, $x = vt$, and the $x'$ axis — their line of “now” — tilts up by the same angle. What fixes the scale on those tilted axes is the one quantity every observer computes alike, the **spacetime interval**:

$$(\Delta s)^2 = (c\,\Delta t)^2 - (\Delta x)^2 = (c\,\Delta t')^2 - (\Delta x')^2$$

Positive means **timelike**: $\Delta s/c$ is the proper time of a clock that travels between the events. Negative means **spacelike**: $\sqrt{-(\Delta s)^2}$ is the distance between them in the frame where they are simultaneous. Zero means light could just connect them. With these tools the classic paradoxes dissolve, one diagram each.

> You met the diagram in [Spacetime diagrams and light cones](#/lesson/gr.S03.i) and the interval in [The interval: what every observer agrees on](#/lesson/gr.S04.i). This course writes $(\Delta s)^2$ with time positive, as Taylor and Wheeler do; the Road to Einstein uses the opposite sign, so there a timelike interval is negative. The physics is the same.`,
  symbols: [
    { tex: '(\\Delta s)^2', text: 'the squared spacetime interval between two events, in m² (or light-years² with $c = 1$) — the same in every inertial frame' },
    { tex: 'c\\,\\Delta t', text: 'the time between the events times the speed of light, so that it is a distance, in m' },
    { tex: '\\Delta x', text: 'the distance between the events along $x$ in the same frame, in m (with $\\Delta y$ and $\\Delta z$ too, subtract $\\Delta y^2 + \\Delta z^2$ as well)' },
    { tex: "\\Delta t',\\ \\Delta x'", text: 'the same separations measured in any other inertial frame' },
  ],
  why: 'The interval is the first glimpse of the geometry behind relativity: general relativity keeps exactly this rule, locally, and lets the coefficients of (cΔt)² and (Δx)² vary from place to place.',
  visual: {
    type: 'spacetime',
    title: 'Tilted axes, calibrated by hyperbolae',
    lead: t`Your frame’s axes are grey; the gold axes belong to an observer moving at the slider’s $\beta$. The grey curves are hyperbolae $t^2 - x^2 = $ constant ($c = 1$): every observer’s 1-second and 1-light-second marks lie on them. Drag the two events and watch the readout.`,
    tasks: [
      'The gold dots on the t′ axis sit where it crosses the hyperbolae t² − x² = 1, 4, 9…: one second of the moving observer’s time is longer on your page than yours.',
      'Keep A and B fixed and slide β from −0.9 to 0.9: their coordinates in the moving frame change, but Δt² − Δx² in the readout never does.',
      'Drag B so the pair is spacelike (outside the dashed light lines) and find the β whose gold dashed line of “now” runs through both: their t′ values become equal.',
    ],
    params: { beta: 0.6, events: [[0, 0], [4, 2]], range: 5, simultaneity: true, hyperbolae: true },
    caption: t`Units with $c = 1$: light runs at 45° (dashed). The readout’s $\Delta t^2 - \Delta x^2$ is the interval in these units, positive for timelike pairs. A diagram distorts the moving frame’s lengths: equal intervals lie on hyperbolae, not at equal distances from the origin.`,
  },
  example: {
    prompt: t`A pole ${PB.LP} m long (its proper length) flies at $${PB.b}c$ into a barn ${PB.LB} m long, which has a door at each end. In the barn’s frame the pole is contracted to ${PB.LB} m, so at the instant its back passes the front door (event E1) its front reaches the back door (event E2), and the farmer can shut both doors for a moment with the pole inside. In the pole’s frame the barn is only ${fmt(PB.LB / PB.G, 3)} m long. Who is right?`,
    visual: poleBarn(PB),
    steps: [
      { label: 'The barn’s account', text: t`$\gamma = 1.25$, so the pole is $10/1.25 = 8$ m long in the barn’s frame. E1 at $(x, ct) = (0, 0)$ and E2 at $(8\ \text{m}, 0)$ are simultaneous: both doors can be shut at once, for an instant, around the pole.` },
      { label: 'The pole’s account', text: t`Transform E2: $c\,\Delta t' = \gamma\,(c\,\Delta t - \beta\,\Delta x) = 1.25\,(0 - 0.6\times8\ \text{m}) = -${fmt(PB.dtp, 3)}$ m, so E2 happens $${fmt(PB.dtp / CNS, 3)}$ ns **before** E1 in the pole’s frame. The front reaches the back door first, while the rear is still outside; the rear enters ${fmt(PB.dtp / CNS, 3)} ns later, by which time the front has gone.` },
      { label: 'Read it off the diagram', text: t`The pole’s “now” through E1 (gold) is tilted: it meets the back door’s worldline well *after* E2. In the pole’s frame the two door events are not simultaneous, so the doors are never both shut around the whole pole.` },
      { label: 'Check the interval', text: t`Barn frame: $(c\Delta t)^2 - \Delta x^2 = 0 - 8^2 = -64\ \text{m}^2$. Pole frame: $\Delta x' = \gamma\,\Delta x = 10$ m and $c\,\Delta t' = -${fmt(PB.dtp, 3)}$ m, so $${fmt(PB.dtp, 3)}^2 - 10^2 = -64\ \text{m}^2$ ✓ — spacelike, so the order of E1 and E2 is not fixed, and no signal could link them.` },
      { label: 'Sense check', text: t`Both frames agree on every single event: where each door is when it shuts, and whether the pole hits a closed door. If the doors stay shut, the pole crashes in both accounts — and since no force can travel faster than light, its back keeps moving for a while after its front is stopped. A rigid pole is a Newtonian idea that relativity forbids.` },
    ],
    answer: t`Both. “Both doors shut at once” is a statement about simultaneity at two places, which frames disagree about: in the pole’s frame E2 comes ${fmt(PB.dtp / CNS, 3)} ns before E1.`,
  },
  practice: [
    num({
      id: 'tick-mark', difficulty: 2,
      gen(r) {
        const b = r.pick([0.6, 0.8, 0.5, 0.28]);
        return {
          prompt: t`On a spacetime diagram of your frame ($c = 1$, seconds up, light-seconds across), an observer moves at $${b}c$. Their clock reads $t' = 1$ s at the event on their worldline that lies on the hyperbola $t^2 - x^2 = 1$. What is that event’s $t$ coordinate in your frame?`,
          answer: g(b), units: 's', tol: { rel: 0.005 },
          errors: [{ value: 1 / g(b), feedback: t`On the page the moving observer’s tick lies *farther* from the origin, not nearer: solve $t^2 - (\beta t)^2 = 1$.` }, { value: 1, feedback: t`The event is on the line $x = \beta t$ as well as on the hyperbola: it cannot be at $t = 1$ unless $\beta = 0$.` }],
          hints: [t`The event lies on the worldline $x = ${b}\,t$ and on $t^2 - x^2 = 1$.`, t`$t^2(1 - ${b}^2) = 1$, so $t = 1/\sqrt{1 - ${b}^2}$.`],
          teach: 'A moving observer’s unit ticks lie where their axis crosses the invariant hyperbolae, at t = γ on your diagram.',
          explain: t`$t = 1/\sqrt{1 - ${b}^2} = ${fmt(g(b), 4)}$ s, at $x = ${fmt(b * g(b), 4)}$ light-seconds — which is time dilation read off a diagram: when their clock reads 1 s, yours (in your frame) read ${fmt(g(b), 4)} s.`,
          visual: minkowski({ x: [-1.2, 2.8], t: [-0.4, 3], xlabel: 'x (light-seconds)', ylabel: 't (s)', hyperbolae: [1, 2], cones: [[0, 0, 'future']], lines: [{ pts: [[0, 0], [b * 2.9, 2.9]], color: 'gold', width: 2.4, label: 'moving observer', at: 0, dx: 8, dy: 30 }], caption: t`Your frame with c = 1. Grey dashed: the hyperbolae t² − x² = 1 and 4. Gold: the worldline of the observer moving at ${b}c.` }),
        };
      },
    }),
    mcq({
      id: 'x-axis-tilt', difficulty: 2,
      prompt: t`On your spacetime diagram ($c = 1$), an observer moves at $\beta = 0.5$. Their $t'$ axis is the line $x = 0.5\,t$. Which line is their $x'$ axis — the events they call simultaneous with the origin?`,
      visual: minkowski({ x: [-2.5, 2.5], t: [-1.5, 2.5], xlabel: 'x', ylabel: 't', cones: [[0, 0, 'both']], lines: [{ pts: [[-0.75, -1.5], [1.25, 2.5]], color: 'gold', width: 2.4, label: 't′ axis', at: 0, dx: 10, dy: -40 }], caption: 'Your frame with c = 1; gold: the moving observer’s t′ axis. The dashed lines are light.' }),
      choices: [t`$t = 0.5\,x$: tilted up from your $x$ axis by the same angle as $t'$ is tilted from your $t$ axis`, t`$t = -2x$: perpendicular to the $t'$ axis`, t`$t = 0$: the same as your $x$ axis`, t`$t = 2x$`],
      answer: 0,
      why: {
        1: 'Right angles on paper mean nothing in spacetime. The x′ axis must make light’s 45° line a bisector of the two primed axes, so light has speed 1 in the new frame too.',
        2: 'That would make simultaneity absolute; the moving frame disagrees with you about which distant events happen “now”.',
        3: 'That line is steeper than light (slope 2): no observer’s “now” can be timelike.',
      },
      hints: [t`Set $t' = 0$ in $t' = \gamma(t - \beta x)$.`],
      teach: 'The x′ axis is the line t = βx: both primed axes tilt toward the light line by the same angle.',
      explain: t`$t' = 0$ means $t = \beta x = 0.5\,x$. The two gold axes are mirror images about the 45° light line, which is what keeps light’s speed equal to 1 in both frames.`,
    }),
    num({
      id: 'pole-early', difficulty: 2,
      gen(r) {
        const [LP, LB] = r.pick([[15, 9], [13, 5], [25, 7], [20, 12]]);
        const G = LP / LB, b = Math.sqrt(1 - 1 / (G * G)), dt = (b * LP) / CNS;
        return {
          prompt: t`A pole ${LP} m long flies through a barn ${LB} m long at exactly the speed that makes it ${LB} m long in the barn’s frame, $\beta = ${fmt(b, 4)}$. In the barn’s frame its back passes the front door (E1) at the same moment as its front reaches the back door (E2). In the **pole’s** frame, how many nanoseconds before E1 does E2 happen?`,
          answer: dt, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: (b * LB) / CNS, feedback: t`Transform properly: $c\,\Delta t' = \gamma\beta\,\Delta x$ with $\Delta x = ${LB}$ m, and $\gamma = ${fmt(G, 4)}$.` }, { value: LB / CNS, feedback: t`That is the light-travel time across the barn. The shift is $\gamma\beta\,\Delta x/c$.` }],
          hints: [t`$\gamma = ${LP}/${LB} = ${fmt(G, 4)}$, and $c\,\Delta t' = \gamma\,(c\,\Delta t - \beta\,\Delta x)$ with $c\,\Delta t = 0$, $\Delta x = ${LB}$ m.`, t`$|c\,\Delta t'| = ${fmt(G, 4)}\times${fmt(b, 4)}\times${LB}\ \text{m} = ${fmt(b * LP, 4)}$ m; divide by $c = 0.2998$ m/ns.`],
          teach: 'Door events simultaneous in the barn are separated in the pole’s frame by γβΔx/c, so the pole never sits wholly inside in its own frame.',
          explain: t`$|c\,\Delta t'| = \gamma\beta\,L_{\text{barn}} = \beta\,L_{\text{pole}} = ${fmt(b * LP, 4)}$ m, or ${fmt(dt, 3)} ns. In the pole’s frame the front reaches the back door first; the rear gets in only that much later.`,
          visual: poleBarn({ LP, LB, b, numbers: false, labels: false, caption: 'The barn’s frame (ct in metres, numbers hidden): doors grey, pole ends blue. Dashed grey: the barn’s “now”; gold: the pole’s “now” through E1.' }),
        };
      },
    }),
    num({
      id: 'pole-separation', difficulty: 3,
      gen(r) {
        const [LP, LB] = r.pick([[15, 9], [13, 5], [25, 7], [20, 12]]);
        const G = LP / LB, b = Math.sqrt(1 - 1 / (G * G));
        return {
          prompt: t`For the same kind of pole (${LP} m) and barn (${LB} m), the door events E1 and E2 are ${LB} m apart and simultaneous in the barn’s frame. In the pole’s frame they are $c\,\Delta t' = ${fmt(b * LP, 4)}$ m apart in time. Use the invariance of the interval to find how far apart they are in space in the pole’s frame.`,
          answer: LP, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(Math.abs(LB * LB - (b * LP) ** 2)), feedback: t`Mind the sign: $(c\Delta t')^2 - \Delta x'^2 = -${LB}^2$, so $\Delta x'^2 = ${LB}^2 + (c\Delta t')^2$.` }, { value: LB, feedback: 'That is the separation in the barn’s frame. In the pole’s frame the events are not simultaneous, and farther apart.' }],
          hints: [t`Barn frame: $(\Delta s)^2 = 0 - ${LB}^2 = -${LB * LB}\ \text{m}^2$.`, t`Pole frame: $(${fmt(b * LP, 4)})^2 - \Delta x'^2 = -${LB * LB}$.`],
          teach: 'The interval is the same in every frame, so knowing the time separation in one frame fixes the space separation there.',
          explain: t`$\Delta x'^2 = ${LB * LB} + ${fmt((b * LP) ** 2, 5)} = ${fmt(LP * LP, 5)}$, so $\Delta x' = ${LP}$ m — exactly the pole’s length, as it must be: E1 and E2 happen at the two ends of the pole, which is at rest in its own frame.`,
          visual: poleBarn({ LP, LB, b, numbers: false, labels: false, caption: 'The barn’s frame (numbers hidden). E1 and E2 are both on the pole: one at each end.' }),
        };
      },
    }),
    num({
      id: 'twin-jump', difficulty: 3,
      gen(r) {
        const D = r.pick([6, 8, 12]), b = r.pick([0.6, 0.8]);
        return {
          prompt: t`A traveller flies to a star ${D} light-years away at $${b}c$, turns around and comes back. Just before the turnaround, the traveller’s line of “now” meets Earth’s worldline at one Earth time; just after, flying home, at a later one. By how many years of Earth time does the traveller’s “now on Earth” jump?`,
          answer: 2 * D * b, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: D * b, feedback: t`Each leg’s line of simultaneity is tilted by $\beta$, one up and one down: the jump is $2\beta D$, twice $\beta D$.` }, { value: (2 * D) / b, feedback: 'That is the whole trip in Earth time. The jump is the gap between the two lines of simultaneity where they meet Earth.' }],
          hints: [t`Outbound, the traveller’s “now” through the turnaround has slope $\beta$: it meets Earth at $t = D/\beta - \beta D$.`, t`Inbound the slope is $-\beta$: it meets Earth at $t = D/\beta + \beta D$.`],
          teach: 'At the turnaround the traveller changes frame, and the Earth time the traveller calls “now” jumps by 2βD/c.',
          explain: t`$(D/\beta + \beta D) - (D/\beta - \beta D) = 2\beta D = ${fmt(2 * D * b, 3)}$ years. That jump is where the “missing” Earth years go: during each leg the traveller rightly sees Earth’s clocks running slow, and the turnaround makes up the difference.`,
          visual: twins({ D, b }),
        };
      },
    }),
    num({
      id: 'twin-outbound', difficulty: 2,
      gen(r) {
        const D = r.pick([6, 8, 12]), b = r.pick([0.6, 0.8]);
        const legOwn = D / b / g(b), earthAdv = legOwn / g(b);
        return {
          prompt: t`The same trip: a star ${D} light-years away at $${b}c$ ($\gamma = ${fmt(g(b), 4)}$). The outbound leg takes ${fmt(legOwn, 4)} years on the traveller’s own clock. In the traveller’s outbound frame Earth’s clock moves and runs slow. How much does Earth’s clock advance during the outbound leg, by the traveller’s reckoning?`,
          answer: earthAdv, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: legOwn * g(b), feedback: t`Moving clocks run slow: divide by $\gamma$, do not multiply.` }, { value: D / b, feedback: 'That is how long the leg takes in Earth’s own frame. The traveller’s reckoning differs.' }],
          hints: [t`The traveller sees Earth’s clock tick at $1/\gamma$ of the traveller’s rate.`],
          teach: 'Each twin sees the other’s clock run slow during a leg; the asymmetry comes only at the turnaround.',
          explain: t`$${fmt(legOwn, 4)}/${fmt(g(b), 4)} = ${fmt(earthAdv, 3)}$ years. Two legs give $${fmt(2 * earthAdv, 3)}$ years, and the jump at the turnaround adds $2\beta D = ${fmt(2 * b * D, 3)}$: total $${fmt(2 * earthAdv + 2 * b * D, 4)}$ years — exactly Earth’s own $2D/\beta = ${fmt((2 * D) / b, 4)}$ years. The traveller ages ${fmt(2 * legOwn, 4)} years.`,
          visual: twins({ D, b }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-x-tick', difficulty: 2,
      gen(r) {
        const b = r.pick([0.6, 0.8, 0.5]);
        return {
          prompt: t`On your diagram ($c = 1$), where does an observer moving at $${b}c$ put the mark $x' = 1$ light-second on their $x'$ axis? It lies on the hyperbola $x^2 - t^2 = 1$. Give its $t$ coordinate in your frame, in seconds.`,
          answer: b * g(b), units: 's', tol: { rel: 0.005 },
          hints: [t`The $x'$ axis is $t = ${b}\,x$; substitute into $x^2 - t^2 = 1$.`],
          teach: 'The moving frame’s unit of length lies where its x′ axis meets the hyperbola x² − t² = 1, at x = γ, t = γβ.',
          explain: t`$x^2(1 - ${b}^2) = 1$ gives $x = ${fmt(g(b), 4)}$, so $t = ${b}\times${fmt(g(b), 4)} = ${fmt(b * g(b), 4)}$ s. That event is simultaneous with the origin for the moving observer, though not for you.`,
          visual: minkowski({ x: [-0.6, 2.8], t: [-0.6, 2.2], xlabel: 'x (light-seconds)', ylabel: 't (s)', cones: [[0, 0, 'future']], extra: { curves: [{ param: ['cosh(t)', 'sinh(t)'], t: [-1.2, 1.6], color: 'ink3', width: 1.1, dash: true }, { param: ['t', `${b}*t`], t: [-0.5, 2.8], color: 'gold', width: 2.4 }], points: [label(2.4, b * 2.4, 'x′ axis', 'gold', 0, -12, 'right')] }, caption: t`Your frame with c = 1; grey dashed: the hyperbola x² − t² = 1; gold: the x′ axis of the observer moving at ${b}c.` }),
        };
      },
    }),
    num({
      id: 'cp-vega', difficulty: 3, transfer: true,
      prompt: t`An astronaut flies to Vega, 25 light-years away, at $0.99c$ and straight back. At the turnaround, by how many years does the Earth time the astronaut calls “now” jump?`,
      answer: 2 * 25 * 0.99, units: 'yr', tol: { rel: 0.005 },
      errors: [{ value: 25 * 0.99, feedback: t`The lines of simultaneity before and after tilt in opposite directions: the jump is $2\beta D$.` }],
      hints: [t`Before turning: “now on Earth” is $D/\beta - \beta D$; after: $D/\beta + \beta D$.`, t`Jump $= 2\beta D$ with $D = 25$ light-years.`],
      teach: 'The twin paradox’s asymmetry is the frame change at the turnaround, which shifts the traveller’s “now on Earth” by 2βD.',
      explain: t`$2\times0.99\times25 = ${fmt(49.5, 3)}$ years. Earth ages $2D/\beta = ${fmt(50 / 0.99, 4)}$ years in all; the astronaut ages $\dfrac{2D}{\beta\gamma} = ${fmt((50 / 0.99) * Math.sqrt(1 - 0.99 ** 2), 3)}$ years. By the astronaut’s reckoning, Earth’s clocks run slow on both legs — and almost all of Earth’s half century passes in the turnaround.`,
      visual: twins({ D: 25, b: 0.99, caption: 'Earth’s frame (c = 1, numbers hidden): the round trip to Vega at 0.99c, almost along the light lines, with the astronaut’s “now” just before and just after turning.' }),
    }),
    mcq({
      id: 'cp-agree', difficulty: 2,
      prompt: 'In the pole-and-barn puzzle, which of these do the barn’s frame and the pole’s frame necessarily agree on?',
      visual: poleBarn({ ...PB, numbers: false, labels: false, caption: 'The barn’s frame (numbers hidden): doors grey, pole ends blue; the barn’s “now” (grey dashed) and the pole’s (gold).' }),
      choices: [
        'Whether the front of the pole hits the back door while that door is shut',
        'Whether both doors are shut at the same moment',
        'How long the pole is',
        'How long the barn is',
      ],
      answer: 0,
      why: {
        1: '“At the same moment” at two different places depends on the frame: simultaneous in the barn’s frame, 20 ns apart in the pole’s.',
        2: 'Lengths are frame-dependent: 10 m in the pole’s frame, 8 m in the barn’s.',
        3: 'The barn is 8 m in its own frame and 6.4 m in the pole’s.',
      },
      hints: ['Which of these is about a single event at a single place?'],
      teach: 'Observers agree on events — what happens at one place and moment — and disagree about lengths and about simultaneity at a distance.',
      explain: 'A collision between the pole’s front and the back door is a single event: if it happens in one frame it happens in all. Lengths and the simultaneity of the two door closings are frame-dependent, which is why both stories can be told without contradiction.',
    }),
  ],
  sources: [
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 3, 5 and 6 (the interval, the pole and barn, the twins)', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'OpenStax University Physics Vol. 3, §5.5 The Lorentz transformation (spacetime and the interval)', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-5-the-lorentz-transformation' },
    { label: 'Scherr, Shaffer & Vokos (2001), student understanding of time in special relativity', url: 'https://arxiv.org/abs/physics/0207109' },
  ],
});
