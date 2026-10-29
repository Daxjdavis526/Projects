// Accelerating frames (Taylor §9.1–9.2): in a frame whose origin accelerates
// at A relative to an inertial one, mr̈′ = F − mA. The inertial force −mA acts
// on everything in proportion to its mass, exactly like gravity, so inside
// the frame g_eff = g − A: a plumb line hangs along it (tan θ = A/g), a free
// liquid surface lies perpendicular to it, a pendulum swings with
// √(L/|g_eff|). Worked: a Falcon 9 at liftoff — the cabin's apparent gravity
// T/m = 1.41 g, not (T − mg)/m. Practice: the hanging accelerometer, a tanker
// braking, a pendulum's period, free fall cancelling gravity in orbit, the
// helium balloon that leans forward. Transfer: a stage's apparent gravity at
// burnout, ullage burns that settle propellant, the equivalence principle
// (pointer to gr.S05.i). Links (not reused): phys2210.M5.2 (the train car),
// phys2210.M5.5 (apparent weight in lifts).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct } from './_cm.js';
import { G0 } from './_cm3.js';

const t = String.raw;
const G = 9.8;

const F9 = (() => {
  const T = 7.607e6, m = 549054, a = T / m;
  return { T, m, a, net: a - G0, ng: a / G0 };
})();

// a vehicle seen side-on with a hanging plumb bob at angle th (rad, bob swung back for th > 0)
function cabinPic({ th = 0.35, caption, alt, arrow = true, surface = null }) {
  const bx = -1 - 1.3 * Math.sin(th), by = 1.25 - 1.3 * Math.cos(th);
  return gpic({
    x: [-2.4, 2.4], y: [-1.25, 1.75], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg([-2, -1], [2, -1], 'ink2', 2), seg([-2, 1.25], [2, 1.25], 'ink2', 2), seg([-2, -1], [-2, 1.25], 'ink2', 2), seg([2, -1], [2, 1.25], 'ink2', 2), seg([-1, 1.25], [r6(bx), r6(by)], 'ink2', 1.4), seg([-1, 1.25], [-1, -0.2], 'ink4', 1, true),
      ...(surface !== null ? [seg([0.3, -1], [0.3, 0.2], 'ink3', 1.6), seg([1.8, -1], [1.8, 0.2], 'ink3', 1.6)] : [])],
    shade: surface !== null ? [{ fn: `-0.4 - ${r6(surface)}*(x - 1.05)`, lower: '-1', from: 0.3, to: 1.8, color: 'accent', alpha: 0.4 }] : [],
    points: [{ x: r6(bx), y: r6(by), color: 'warn', r: 7 }],
    arrows: arrow ? [{ from: [-0.4, 1.55], to: [0.6, 1.55], color: 'good', label: 'A', labelDx: 6, labelDy: 0 }] : [],
  }, caption, alt || 'A vehicle seen side-on with a plumb bob hanging from its roof');
}

export default lesson({
  id: 'phys3550.M6.1',
  title: 'Accelerating frames',
  minutes: 13, difficulty: 2,
  intro: t`Newton's laws hold in inertial frames. Inside a vehicle that is speeding up, braking or burning its engines, they fail — unless you add one extra force. If the frame's origin accelerates at $\vec A$, every position measured in it is $\vec r\,' = \vec r - \vec R(t)$, so $\ddot{\vec r}\,' = \ddot{\vec r} - \vec A$, and Newton's law in the frame picks up an **inertial force** $-m\vec A$. Because it is proportional to mass, it acts exactly like gravity: everything in the cabin feels an **effective gravity** $\vec g_{\text{eff}} = \vec g - \vec A$. That is why an astronaut is pressed into the seat at launch, and why Einstein could build general relativity on the idea that the two cannot be told apart.`,
  equation: t`m\ddot{\vec r}\,' = \vec F - m\vec A \qquad\Longrightarrow\qquad \vec g_{\text{eff}} = \vec g - \vec A`,
  symbols: [
    { tex: "\\ddot{\\vec r}\\,'", text: 'the acceleration measured in the accelerating frame (relative to the cabin), in m/s²' },
    { tex: '\\vec F', text: 'the real forces — gravity, tension, normal forces, thrust — in N' },
    { tex: '\\vec A', text: 'the acceleration of the frame’s origin relative to an inertial frame, in m/s²' },
    { tex: '-m\\vec A', text: 'the **inertial force**: not caused by any body, present only because the frame accelerates' },
    { tex: '\\vec g_{\\text{eff}}', text: 'the effective gravity inside the frame, in m/s²: what a plumb line, a level and an accelerometer respond to' },
  ],
  why: t`Every instrument on an accelerating vehicle — accelerometers, propellant gauges, a pilot's inner ear — works in this frame, and Einstein's equivalence principle starts here.`,
  visual: {
    type: 'graph',
    title: 'Effective gravity in an accelerating vehicle',
    lead: t`A vehicle accelerating at $A$ (green arrow; negative means braking). Inside, the plumb bob hangs along $\vec g_{\text{eff}} = \vec g - \vec A$ (gold) and the liquid surface in the tank lies perpendicular to it.`,
    tasks: [
      t`Set $A = 9.8$ m/s²: the plumb line hangs at $45^\circ$ and $g_{\text{eff}} = \sqrt2\,g$.`,
      t`Brake ($A < 0$): the bob swings forward and the liquid piles up at the front.`,
      t`At $A = 0$ the cabin is inertial (moving steadily or at rest) and nothing inside reveals its speed.`,
    ],
    params: {
      aspect: 'wide', x: [-2.1, 2.1], y: [-1.1, 1.75], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [{ key: 'A', label: 'Vehicle acceleration $A$', min: -8, max: 12, step: 0.1, value: 4, unit: '\\mathrm{m/s^2}', explain: 'Forward is positive; negative is braking. Gravity is 9.8 m/s² downward.' }],
      shade: [{ fn: '-0.4 - A/9.8*(x - 1.05)', lower: '-1', from: 0.3, to: 1.8, color: 'accent', alpha: 0.4 }],
      curves: [
        { param: ['-2 + 4*t', '-1'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['-2 + 4*t', '1.25'], t: [0, 1], color: 'ink2', width: 2 },
        { param: ['-2', '-1 + 2.25*t'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['2', '-1 + 2.25*t'], t: [0, 1], color: 'ink2', width: 2 },
        { param: ['0.3', '-1 + 1.2*t'], t: [0, 1], color: 'ink3', width: 1.6 }, { param: ['1.8', '-1 + 1.2*t'], t: [0, 1], color: 'ink3', width: 1.6 },
        { param: ['-1 - 1.3*t*sin(atan(A/9.8))', '1.25 - 1.3*t*cos(atan(A/9.8))'], t: [0, 1], color: 'ink2', width: 1.4 },
        { param: ['-1', '1.25 - 1.45*t'], t: [0, 1], color: 'ink4', width: 1, dash: true },
      ],
      points: [{ x: '-1 - 1.3*sin(atan(A/9.8))', y: '1.25 - 1.3*cos(atan(A/9.8))', color: 'warn', r: 7 }],
      arrows: [
        { from: [-0.4, 1.6], to: ['-0.4 + 0.08*A', 1.6], color: 'good', label: 'A', labelDx: 6, labelDy: 0 },
        { from: [-0.15, 0.9], to: [-0.15, 0.1], color: 'accent', label: 'g', labelDx: 6, labelDy: 0 },
        { from: [-0.15, 0.9], to: ['-0.15 - 0.08*A', 0.1], color: 'gold', label: 'g eff', labelDx: -40, labelDy: 10 },
      ],
      readouts: [{ label: 'plumb-line angle', expr: 'atan(abs(A)/9.8)*180/pi', unit: '^\\circ', digits: 3 }, { label: '$g_{\\text{eff}}$', expr: 'sqrt(9.8^2 + A^2)', unit: '\\mathrm{m/s^2}', digits: 3 }],
    },
    caption: t`Steady acceleration, the bob at rest relative to the cabin, the liquid settled. Arrows: $\vec g$ (blue) and $\vec g_{\text{eff}}$ (gold) to one scale; $A$ to its own. Not to scale otherwise.`,
  },
  example: {
    prompt: t`At liftoff a Falcon 9's nine engines produce $${sci(F9.T / 1e6, 4)}$ MN of thrust on a $${sci(F9.m / 1e3, 3)}$ t vehicle. What effective gravity does a crew member feel, in units of $g = 9.81$ m/s²? (Ignore drag, which is zero at liftoff.)`,
    visual: { type: 'gr-elevator', params: { mode: 'rocket' }, caption: t`A closed cabin on an accelerating rocket: released balls fall to the floor exactly as they would on the ground (shown here for an acceleration of exactly $g$).` },
    steps: [
      { label: 'Inertial view', text: t`Real forces on the vehicle: thrust $T$ up, weight $mg$ down. $A = T/m - g = ${sci(F9.a, 4)} - 9.81 = ${sci(F9.net, 3)}$ m/s² upward.` },
      { label: 'Cabin frame', text: t`In the rocket's frame every mass feels gravity $\vec g$ (down) plus the inertial force $-m\vec A$ (also down): $g_{\text{eff}} = g + A$.` },
      { label: 'Numbers', text: t`$g_{\text{eff}} = 9.81 + ${sci(F9.net, 3)} = ${sci(F9.a, 4)}$ m/s² $= ${sci(F9.ng, 3)}\,g$, pointing to the floor (the rocket's tail).` },
      { label: 'Notice', text: t`$g + A = T/m$ exactly: **gravity drops out**. The crew feel only the thrust per unit mass. An accelerometer bolted to the rocket reads the same — it cannot sense gravity, only the push of non-gravitational forces.` },
      { label: 'Sense check', text: t`If thrust stopped, $g_{\text{eff}} = 0$: the crew would float even though Earth's gravity still pulls on them — free fall. As propellant burns, $m$ falls and $T/m$ climbs; engines are throttled to keep crews below about 4–5 $g$.` },
    ],
    answer: t`$g_{\text{eff}} = T/m = ${sci(F9.a, 3)}$ m/s² $\approx ${sci(F9.ng, 3)}\,g$, toward the tail.`,
  },
  practice: [
    num({
      id: 'plumb-angle', difficulty: 1,
      gen(r) {
        const A = r.pick([2, 3, 4.5, 6]);
        const th = (Math.atan(A / G) * 180) / Math.PI;
        return {
          prompt: t`An airliner accelerates down the runway at a steady ${A} m/s². At what angle from the vertical does a cord with a weight on its end hang in the cabin? ($g = 9.8$ m/s².)`,
          answer: th, units: 'deg', tol: { rel: 0.005 },
          errors: distinct([{ value: (Math.atan(G / A) * 180) / Math.PI, feedback: t`That is the angle from the horizontal. The cord lies along $\vec g_{\text{eff}}$, whose sideways part is $A$ and downward part $g$: $\tan\theta = A/g$ from the vertical.` }, { value: (Math.asin(Math.min(1, A / G)) * 180) / Math.PI, feedback: t`$A$ and $g$ are perpendicular legs of the triangle, so the tangent, not the sine: $\tan\theta = A/g$.` }], th),
          hints: [t`In the cabin, $\vec g_{\text{eff}} = \vec g - \vec A$: $g$ downward and $A$ backward.`, t`$\tan\theta = A/g$.`],
          teach: t`A plumb line in an accelerating vehicle hangs along $\vec g_{\text{eff}}$, tilted back by $\arctan(A/g)$.`,
          explain: t`$\theta = \arctan(${A}/9.8) = ${sci(th, 3)}^\circ$, swung **backward** — toward the tail. Hung from the roof, this is an accelerometer: the angle reads $A$.`,
          visual: cabinPic({ th: 0.32, caption: t`The cabin side-on, accelerating to the right; the cord's angle is not drawn to scale.` }),
        };
      },
    }),
    num({
      id: 'tanker', difficulty: 2,
      gen(r) {
        const A = r.pick([2.5, 3.5, 5]), L = r.pick([6, 8, 10]);
        const dh = L * (A / G);
        return {
          prompt: t`A road tanker ${L} m long, its tank half full, brakes at a steady ${A} m/s². Once the liquid settles, by how much does its surface stand higher at the front wall than at the back? ($g = 9.8$ m/s².)`,
          answer: dh, units: 'm', tol: { rel: 0.005 },
          errors: distinct([{ value: (L / 2) * (A / G), feedback: t`The surface tilts over the whole length of the tank: the height difference is the full length times the slope $A/g$.` }, { value: L * (G / A), feedback: t`Upside down: the slope is $A/g$, the ratio of the sideways to the downward part of $\vec g_{\text{eff}}$.` }], dh),
          hints: [t`A settled liquid surface is perpendicular to $\vec g_{\text{eff}}$.`, t`Its slope is $A/g$; multiply by the length.`],
          teach: t`A liquid at rest in an accelerating container lies perpendicular to the effective gravity.`,
          explain: t`Slope $= A/g = ${sci(A / G, 3)}$, so over ${L} m the surface rises $${sci(dh, 3)}$ m toward the front. Tankers have internal baffles so this surge cannot slosh the whole load forward at once.`,
          visual: cabinPic({ th: 0, arrow: false, surface: 0, caption: t`A vehicle side-on (front to the right) with a tank of liquid, before braking: the surface is level. What happens to it while braking is the question.` }),
        };
      },
    }),
    num({
      id: 'pendulum-period', difficulty: 2,
      gen(r) {
        const A = r.pick([3, 5, 7]), L = r.pick([0.5, 1, 2]);
        const T = 2 * Math.PI * Math.sqrt(L / Math.hypot(G, A));
        return {
          prompt: t`A pendulum ${L} m long hangs in a van accelerating horizontally at ${A} m/s². What is the period of its small swings about its tilted rest position? ($g = 9.8$ m/s².)`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: 2 * Math.PI * Math.sqrt(L / G), feedback: t`That is the period on the ground. In the van the restoring "gravity" is $|\vec g_{\text{eff}}| = \sqrt{g^2 + A^2}$.` }, { value: 2 * Math.PI * Math.sqrt(L / (G + A)), feedback: t`$\vec g$ and $\vec A$ are perpendicular here: add them as vectors, $\sqrt{g^2 + A^2}$.` }], T),
          hints: [t`In the van's frame the pendulum feels a uniform effective gravity $\vec g_{\text{eff}} = \vec g - \vec A$.`, t`$T = 2\pi\sqrt{L/g_{\text{eff}}}$ with $g_{\text{eff}} = \sqrt{g^2 + A^2}$.`],
          teach: t`In an accelerating frame every gravity formula works with $\vec g$ replaced by $\vec g_{\text{eff}}$.`,
          explain: t`$g_{\text{eff}} = \sqrt{9.8^2 + ${A}^2} = ${sci(Math.hypot(G, A), 3)}$ m/s², so $T = 2\pi\sqrt{${L}/${sci(Math.hypot(G, A), 4)}} = ${sci(T, 3)}$ s — slightly faster than on the ground.`,
          visual: cabinPic({ th: 0.4, caption: t`The van accelerating to the right, the pendulum swinging about its tilted rest position (angle not to scale).` }),
        };
      },
    }),
    mcq({
      id: 'iss-gravity', difficulty: 2,
      prompt: t`At the International Space Station's height (about 420 km) Earth's gravity is still $8.6$ m/s², 88% of its value on the ground. Why do the astronauts float?`,
      visual: { type: 'gr-elevator', params: { mode: 'falling' }, caption: t`A closed box falling freely: inside (left), released objects float; from outside (right), box and objects fall together.` },
      choices: [t`The station and everything in it accelerate at $\vec A = \vec g$ (free fall), so $\vec g_{\text{eff}} = \vec g - \vec A = 0$`, t`Above the atmosphere there is no gravity`, t`The station's speed creates a centrifugal force that exactly balances gravity on every astronaut in the inertial frame`, t`Gravity is too weak at that height to be felt`],
      answer: 0,
      why: { 1: t`Gravity at 420 km is 8.6 m/s² — it is what keeps the station in orbit at all.`, 2: t`In the inertial frame there is no centrifugal force: gravity is unbalanced and is exactly the centripetal force of the orbit. "Centrifugal" appears only in a rotating frame ([M6.3](#/lesson/phys3550.M6.3)).`, 3: t`8.7 m/s² is easily felt when you stand on a floor that pushes back; what is missing in orbit is the floor's push.` },
      hints: [t`What is the station's own acceleration?`, t`Use $\vec g_{\text{eff}} = \vec g - \vec A$ with $\vec A$ the station's acceleration.`],
      teach: t`Free fall cancels gravity inside the falling frame: weightlessness is $\vec A = \vec g$, not $\vec g = 0$.`,
      explain: t`The orbiting station falls freely: its acceleration is $\vec g$, so in its frame $\vec g_{\text{eff}} = 0$ and nothing presses on anything. "Microgravity" is the small remainder: drag, and the tidal difference between points not at the station's centre of mass.`,
    }),
    mcq({
      id: 'balloon', difficulty: 3,
      prompt: t`A child holds a helium balloon on a string in a closed car with the windows shut. The car accelerates forward. Which way does the balloon lean?`,
      visual: cabinPic({ th: 0, arrow: true, caption: t`The closed car side-on, about to accelerate to the right. (The hanging bob is only a reference.)` }),
      choices: [t`Forward, in the direction of the acceleration`, t`Backward, like a hanging plumb bob`, t`It stays vertical: the string is light`, t`Backward at first, then forward`],
      answer: 0,
      why: { 1: t`A plumb bob is denser than air and "falls" along $\vec g_{\text{eff}}$, backward. A helium balloon is lighter than the air: it "rises" against $\vec g_{\text{eff}}$.`, 2: t`The air in the car feels $\vec g_{\text{eff}}$ too, and its pressure gradient tilts with it: buoyancy then points along $-\vec g_{\text{eff}}$, which tips forward.`, 3: t`Once the air settles, the balloon stays leaning forward while the acceleration lasts.` },
      hints: [t`In the car frame, the air itself feels $\vec g_{\text{eff}} = \vec g - \vec A$ and "settles" toward the back.`, t`Buoyancy points opposite to effective gravity, the way it points opposite to real gravity.`],
      teach: t`Buoyancy points against the effective gravity, so a balloon leans the opposite way to a plumb line.`,
      explain: t`The air piles up slightly toward the back, so pressure is higher at the back: the balloon is pushed forward and up, along $-\vec g_{\text{eff}}$. Everything in the cabin behaves as if gravity pointed down and backward — including buoyancy.`,
    }),
    multi({
      id: 'which-true', difficulty: 2,
      prompt: t`Which statements about the inertial force $-m\vec A$ are true?`,
      visual: cabinPic({ th: 0.42, caption: t`A plumb bob in a vehicle accelerating to the right (angle not to scale).` }),
      choices: [
        t`It is proportional to the mass of the body it acts on`,
        t`No other body exerts it, so it has no third-law partner`,
        t`It vanishes if you describe the motion from an inertial frame`,
        t`It is a real force that pushes passengers backward when a car starts`,
        t`It appears only for bodies touching the vehicle`,
      ],
      answer: [0, 1, 2],
      why: { 3: t`In the ground's frame nothing pushes passengers backward: the seat pushes them **forward**, and their inertia resists. The backward "push" is the inertial force of the car's frame.`, 4: t`It acts on everything described in the frame — a ball in mid-air in the cabin too — just as gravity does.` },
      hints: [t`Ask which body could be exerting it, and what happens to it in the ground's frame.`],
      teach: t`Inertial forces are proportional to mass, act on everything in the frame, have no source body and disappear in an inertial frame.`,
      explain: t`$-m\vec A$ comes from describing motion in an accelerating frame, not from an interaction: proportional to mass, acting on everything, with no reaction partner, and absent from the inertial description. Gravity shares the first two properties — the clue Einstein followed.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-burnout', difficulty: 2, transfer: true,
      gen(r) {
        const m0 = r.pick([80, 120, 200]) * 1e3, tw = r.pick([1.3, 1.5]), f = r.pick([0.25, 0.3, 0.35]);
        const T = tw * m0 * G0, mf = f * m0, ng = T / (mf * G0);
        return {
          prompt: t`A rocket stage of $${sci(m0 / 1e3, 3)}$ t lifts off with a thrust of $${sci(T / 1e6, 3)}$ MN, which stays constant. At burnout ${Math.round(f * 100)}% of its liftoff mass remains. Ignoring drag, what does an accelerometer on board read at burnout, in units of $g = 9.81$ m/s²?`,
          answer: ng, tol: { rel: 0.005 },
          errors: distinct([{ value: (T / mf - G0) / G0, feedback: t`That is the rocket's acceleration relative to the ground, $T/m - g$. On board, gravity is felt only through $\vec g_{\text{eff}} = \vec g - \vec A$, which comes to $T/m$: the reading is thrust per unit mass.` }, { value: tw, feedback: t`That is the liftoff value. The mass has dropped to ${Math.round(f * 100)}% of it, so $T/m$ is larger.` }], ng),
          hints: [t`In the rocket's frame, $g_{\text{eff}} = g + A$ with $A = T/m - g$.`, t`So $g_{\text{eff}} = T/m$; use the burnout mass.`],
          teach: t`An accelerometer reads thrust per unit mass: gravity cancels from what anything on board can feel.`,
          explain: t`$T/m_f = ${sci(T / mf, 3)}$ m/s² $= ${sci(ng, 3)}\,g$. Real launchers throttle down or shut off engines near the end of a burn to keep this below a few $g$.`,
          visual: { type: 'gr-elevator', params: { mode: 'rocket' }, caption: t`A closed cabin on an accelerating rocket (shown at exactly $g$): inside, the thrust's acceleration is felt as gravity toward the floor.` },
        };
      },
    }),
    mcq({
      id: 'cp-ullage', difficulty: 3, transfer: true,
      prompt: t`An upper stage coasting in orbit is in free fall, so its liquid propellant floats as blobs in the tank — and an engine cannot restart on gas bubbles. Before restarting, small **ullage** thrusters fire to give the stage a gentle forward acceleration $\vec A$. Where does the propellant collect?`,
      visual: gpic({ x: [-2.6, 2.6], y: [-1, 1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([-2, -0.6], [1.2, -0.6], 'ink2', 2), seg([-2, 0.6], [1.2, 0.6], 'ink2', 2), seg([-2, -0.6], [-2, 0.6], 'ink2', 2), seg([1.2, -0.6], [1.2, 0.6], 'ink2', 2), seg([-2, -0.25], [-2.4, -0.45], 'ink3', 2), seg([-2, 0.25], [-2.4, 0.45], 'ink3', 2)], points: [{ x: -0.5, y: 0.2, color: 'accent', r: 9 }, { x: 0.4, y: -0.25, color: 'accent', r: 6 }, { x: -1.2, y: -0.1, color: 'accent', r: 7 }, lab(-2.3, 0.75, 'engine', 'ink3')], arrows: [{ from: [1.5, 0], to: [2.3, 0], color: 'good', label: 'A', labelDx: 6, labelDy: 0 }] }, t`A propellant tank side-on, engine at the left, floating propellant blobs; the ullage thrusters accelerate the stage to the right. Schematic.`, 'A tank with floating blobs of liquid'),
      choices: [t`At the aft end, over the engine's intake: in the tank's frame $\vec g_{\text{eff}} = -\vec A$ points aft`, t`At the front of the tank, pushed by the thrusters`, t`Evenly against the walls`, t`Nowhere: in orbit the propellant is weightless whatever the thrusters do`],
      answer: 0,
      why: { 1: t`The tank wall moves forward and the propellant lags behind it: relative to the tank it drifts aft.`, 2: t`Spreading round the walls is what surface tension does with no acceleration at all; ullage replaces that with a definite "down".`, 3: t`Free fall cancels gravity ($\vec g - \vec A_{\text{orbit}} = 0$), but the extra thrust $\vec A$ is not cancelled: it is a non-gravitational push.` },
      hints: [t`In the coasting stage $\vec g_{\text{eff}} = 0$. Add the ullage acceleration: what is $\vec g_{\text{eff}}$ now?`, t`Things "fall" along $\vec g_{\text{eff}}$.`],
      teach: t`A small thrust gives a freely falling vehicle a definite effective gravity, opposite to the thrust.`,
      explain: t`With the stage accelerating forward at $\vec A$, $\vec g_{\text{eff}} = -\vec A$: a gentle gravity pointing aft, which settles the propellant over the outlet. Even $10^{-3}\,g$ does it, given a minute or so.`,
    }),
    mcq({
      id: 'cp-equivalence', difficulty: 2,
      prompt: t`You wake in a closed, windowless cabin. Dropped objects fall to the floor at $9.81$ m/s², and a pendulum swings with its usual period. Can you tell, from experiments confined to a small cabin, whether it sits on Earth's surface or accelerates at $g$ through empty space?`,
      visual: { type: 'gr-elevator', params: { mode: 'earth' }, caption: t`Choose Rocket or Earth: inside the box (left) the two look the same.` },
      choices: [t`No: uniform gravity and uniform acceleration produce identical effects in a small enough cabin`, t`Yes: an accelerometer reads 0 on Earth's surface and $g$ in the rocket`, t`Yes: on Earth, heavy objects fall faster`, t`Yes: in the rocket, the inertial force acts only on objects touching the walls`],
      answer: 0,
      why: { 1: t`An accelerometer reads $g$ in both: on the ground the floor pushes up on it, in the rocket the floor pushes it forward. It measures non-gravitational push.`, 2: t`All bodies fall alike in both cases — the inertial force and gravity are both proportional to mass.`, 3: t`The inertial force acts on everything in the frame, like gravity.` },
      hints: [t`Both gravity and $-m\vec A$ are proportional to mass. What experiment could separate them?`],
      teach: t`Locally, a uniform gravitational field cannot be distinguished from an accelerating frame: the equivalence principle.`,
      explain: t`No local experiment can tell them apart — only tides (gravity converging toward Earth's centre) give it away in a big enough cabin. Einstein turned this into a principle and built general relativity on it: see [Falling elevators: gravity you cannot feel](#/lesson/gr.S05.i).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §9.1–9.2: acceleration without rotation', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'SpaceX, Falcon 9 vehicle data (thrust 7 607 kN, liftoff mass 549 054 kg)', url: 'https://www.spacex.com/vehicles/falcon-9/' },
  ],
});
