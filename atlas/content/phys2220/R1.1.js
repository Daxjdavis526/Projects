// The postulates and simultaneity — Einstein's two postulates, the
// Michelson–Morley null result, and the relativity of simultaneity: events a
// frame moving at v calls simultaneous happen Δt = vΔx/c² apart in yours, the
// one farther along the motion later. Every number is computed here.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { C, seg, label, st, shipCurves } from './_modern.js';

const t = String.raw;

// the worked example: a ship 300 m long in the station's frame, at 0.6c, with a lamp at its middle
const EX = { L: 300, b: 0.6 };
const EX_TAIL = (EX.L / 2) / (1 + EX.b);            // ct of the tail's arrival (m) = 93.75
const EX_NOSE = (EX.L / 2) / (1 - EX.b);            // ct of the nose's arrival (m) = 375
const ns = (ctMetres) => ctMetres / C * 1e9;        // ct in metres → nanoseconds
const EX_XT = -EX.L / 2 + EX.b * EX_TAIL, EX_XN = EX.L / 2 + EX.b * EX_NOSE;
const EX_DX = EX_XN - EX_XT;                        // 468.75 m
const SLOW = 300;                                   // m/s, an airliner
const EX_SLOW = EX.L * SLOW / (C * C - SLOW * SLOW); // s

// Michelson and Morley, 1887: effective arm 11 m, yellow light, Earth's orbital speed
const MM = { L: 11, lam: 590e-9, v: 3.0e4 };
const MM_SHIFT = 2 * MM.L * MM.v ** 2 / (MM.lam * C * C);

const ANDROMEDA = 2.5e6;                            // light-years

// the train of the thought experiment, in units with c = 1: ends at x = ±1 at t = 0, moving at 0.5
const TRAIN_V = 0.5;
const trainPicture = (caption) => st({
  range: 2.6, top: 3.3, bottom: -0.55, cone: false, numbers: false, xlabel: 'x (ground)', ylabel: 't (ground)',
  lines: [
    [-0.4, -1 - 0.4 * TRAIN_V, 3.2, -1 + 3.2 * TRAIN_V, 'ink3', false, 1.6], [-0.4, 1 - 0.4 * TRAIN_V, 3.2, 1 + 3.2 * TRAIN_V, 'ink3', false, 1.6],
    [-0.4, -0.4 * TRAIN_V, 3.2, 3.2 * TRAIN_V, 'accent', false, 2.6],
    [0, 1, 2 / 3, 1 / 3, 'gold'], [0, -1, 2, 1, 'gold'],
  ],
  events: [[0, -1, 'P: back strike', 'warn', -30, 18], [0, 1, 'Q: front strike', 'warn', -20, 18], [2 / 3, 1 / 3, 'front flash meets her', 'gold', 10, 4], [2, 1, 'back flash meets her', 'gold', 10, 4]],
  extra: { points: [label(1.45, 2.9, 'passenger', 'accent', -74, 0)] },
  caption: caption ?? 'The ground’s frame with c = 1. Grey: the two ends of the train; blue: the passenger at its middle, all moving right. Gold: the light from each strike. Not to scale.',
});

export default lesson({
  id: 'phys2220.R1.1',
  title: 'The postulates and simultaneity',
  minutes: 11, difficulty: 2,
  intro: t`Special relativity rests on two postulates (Einstein, 1905). **First, the laws of physics are the same in every inertial frame**: no experiment inside a smoothly coasting laboratory can tell you it is moving. **Second, light in vacuum travels at $c$ in every inertial frame**, whatever the motion of its source or of the observer — as Maxwell’s equations suggest by predicting $c = 1/\sqrt{\mu_0\varepsilon_0}$ without naming any frame, and as the Michelson–Morley experiment found in 1887. Together they force a startling conclusion: **whether two distant events happen at the same time depends on who is asking**. Events that a frame moving at speed $v$ calls simultaneous happen, in your frame, a time

$$\Delta t = \frac{v\,\Delta x}{c^2}$$

apart — the one farther along the direction of motion later.

> Continue on the Road to Einstein: [Spacetime diagrams and light cones](#/lesson/gr.S03.i) draws these lines of simultaneity for any speed.`,
  symbols: [
    { tex: '\\Delta t', text: 'the time between the two events, measured in your frame, in seconds' },
    { tex: '\\Delta x', text: 'how far apart the two events are in your frame, measured along the direction of the other frame’s motion, in metres' },
    { tex: 'v', text: 'the speed of the other frame relative to yours, in m/s' },
    { tex: 'c', text: t`the speed of light in vacuum, $299\,792\,458$ m/s exactly — the same in every inertial frame` },
  ],
  why: t`Every later result in relativity — time dilation, length contraction, the Lorentz transformation — leans on this one. At everyday speeds it is tiny: for an airliner ($v = 300$ m/s) and events 1000 km apart, $\Delta t$ is ${nice(SLOW * 1e6 / (C * C) * 1e9, 2)} ns.`,
  visual: {
    type: 'spacetime',
    title: 'Two flashes, two verdicts',
    lead: t`Your frame’s axes are the plain grey ones; the gold axes belong to a rocket moving along $x$ at the speed the slider sets. Events A and B are two flashes that are **simultaneous for you** — both at $t = 0$. The gold dashed line through each event joins everything the rocket calls simultaneous with it.`,
    tasks: [
      'At β = 0.5 the readout gives t′ = 0 for A but t′ = −1.73 for B: the rocket, moving toward B, says B flashed first.',
      'Slide β to −0.5: now the rocket moves toward A and says A flashed first. Observers moving along x disagree with you, and with each other.',
      'Drag B up inside the dashed light cone (above the 45° line through A): now no speed puts B before A.',
    ],
    params: { beta: 0.5, events: [[0, 0], [0, 3]], simultaneity: true, hyperbolae: false, range: 5 },
    caption: t`Units with $c = 1$ — seconds up the page and light-seconds across — so light runs at 45° (dashed). Each gold dashed line has slope $v/c$: it is a line of constant $t'$, the rocket’s “now”.`,
  },
  example: {
    prompt: t`A spaceship cruises past a space station at $v = ${EX.b}c$; in the station’s frame the ship is ${EX.L} m long. A lamp at the exact middle of the ship flashes. In the ship’s frame the light reaches the nose and the tail at the same moment. When does it reach each end in the station’s frame, and how far apart are those two arrivals? Check that $\Delta t = v\,\Delta x/c^2$.`,
    visual: st({
      range: 430, top: 600, bottom: -110, cone: true, xlabel: 'x (m)', ylabel: 'ct (m)',
      lines: [
        [-60, -150 - 0.6 * 60, 560, -150 + 0.6 * 560, 'accent'], [-60, 150 - 0.6 * 60, 450, 150 + 0.6 * 450, 'accent'],
        [-60, -0.6 * 60, 560, 0.6 * 560, 'ink3', false, 1.6],
        [0, -250, 408, 430, 'gold', true, 1.8],
      ],
      events: [[0, 0, 'flash', 'ink2', 8, 14], [EX_TAIL, EX_XT, 'tail lit', 'gold', -64, -4], [EX_NOSE, EX_XN, 'nose lit', 'gold', -64, -10]],
      caption: t`The station’s frame, with time drawn as $ct$ in metres so that light runs at 45° (dashed). Blue: the ship’s tail and nose, moving at $0.6c$; grey: the lamp. The gold dashed line is the ship’s “now”: it joins the two arrivals.`,
    }),
    steps: [
      { label: 'The tail', text: t`In the station’s frame the light still moves at $c$ both ways (second postulate), but the tail moves *toward* it. The tail starts $L/2 = 150$ m behind the lamp and the gap closes at $c + v$: $t_\text{tail} = \dfrac{L/2}{c + v} = \dfrac{150\ \text{m}}{1.6c} = ${fmt(ns(EX_TAIL), 4)}$ ns.` },
      { label: 'The nose', text: t`The nose runs *away* from the light, so that gap closes at only $c - v$: $t_\text{nose} = \dfrac{150\ \text{m}}{0.4c} = ${fmt(ns(EX_NOSE), 5)}$ ns. In the station’s frame the tail is lit first, ${fmt(ns(EX_NOSE - EX_TAIL), 3)} ns earlier.` },
      { label: 'Where they happen', text: t`The tail is reached at $x = -150 + v\,t_\text{tail} = ${nice(EX_XT)}$ m and the nose at $x = 150 + v\,t_\text{nose} = ${nice(EX_XN)}$ m, so $\Delta x = ${nice(EX_DX)}$ m.` },
      { label: 'Check the formula', text: t`$\dfrac{v\,\Delta x}{c^2} = 0.6 \times \dfrac{${nice(EX_DX)}\ \text{m}}{c} = ${fmt(ns(EX.b * EX_DX), 3)}$ ns ✓. In symbols, $\Delta t = \dfrac{Lv}{c^2 - v^2}$ and $\Delta x = L + v\,\Delta t$; rearranging the first, $c^2\Delta t = v(L + v\,\Delta t) = v\,\Delta x$ — exactly.` },
      { label: 'Who is right', text: t`Both. For the crew the two arrivals are simultaneous; for the station the tail is lit first. Neither frame is privileged (first postulate), so simultaneity at a distance is **relative**. Sense check: at an airliner’s 300 m/s the same ship would disagree with the station by only ${fmt(EX_SLOW * 1e12, 2)} ps.` },
    ],
    answer: t`Tail at ${fmt(ns(EX_TAIL), 3)} ns and nose at ${fmt(ns(EX_NOSE), 4)} ns in the station’s frame: ${fmt(ns(EX_NOSE - EX_TAIL), 3)} ns and ${nice(EX_DX)} m apart, and $v\,\Delta x/c^2 = ${fmt(ns(EX.b * EX_DX), 3)}$ ns.`,
  },
  practice: [
    num({
      id: 'michelson', difficulty: 2,
      prompt: t`If light moved through an “ether” and Earth moved through the ether at speed $v$, a round trip along an interferometer arm of length $L$ would take longer than one across it, by about $\dfrac{L}{c}\dfrac{v^2}{c^2}$. Turning the apparatus by 90° swaps the arms, so the fringes should shift by $\Delta N = \dfrac{2Lv^2}{\lambda c^2}$. Michelson and Morley’s arms were effectively ${MM.L} m long, they used yellow light ($\lambda = ${MM.lam * 1e9}$ nm), and Earth orbits the Sun at 30 km/s. What fringe shift did the ether theory predict?`,
      answer: MM_SHIFT, tol: { rel: 0.01 },
      errors: [
        { value: MM_SHIFT / 2, feedback: 'Turning the apparatus by 90° swaps the arms, so the shift is doubled: keep the 2 in 2Lv²/(λc²).' },
        { value: 2 * MM.L * MM.v / (MM.lam * C), feedback: t`The effect is second order: use $(v/c)^2$, not $v/c$.` },
      ],
      hints: [t`$v/c = (3.0\times10^4)/(3.0\times10^8) = 10^{-4}$, so $(v/c)^2 = 10^{-8}$.`, t`$\Delta N = \dfrac{2 \times ${MM.L}\ \text{m}}{${MM.lam * 1e9}\times10^{-9}\ \text{m}} \times 10^{-8}$.`],
      teach: 'The ether theory predicted a small but easily measurable fringe shift as the interferometer turned; none was seen.',
      explain: t`$\Delta N = \dfrac{2(${MM.L})(3.0\times10^4)^2}{(${MM.lam * 1e9}\times10^{-9})(2.998\times10^8)^2} = ${fmt(MM_SHIFT, 2)}$ of a fringe. Michelson and Morley saw less than a twentieth of that — and every repetition since, now with lasers and cavities to parts in $10^{17}$, agrees: light’s speed does not depend on direction or on Earth’s motion.`,
      visual: {
        type: 'graph',
        params: {
          x: [-4.4, 5.4], y: [-2.6, 3.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [
            seg(-3.4, 0, -0.05, 0, 'gold', 2.2), seg(0, 0, 3.8, 0, 'gold', 2.2), seg(0, 0, 0, 2.8, 'gold', 2.2), seg(0, 0, 0, -1.9, 'gold', 2.2),
            seg(-0.38, -0.38, 0.38, 0.38, 'ink', 3.4), seg(3.95, -0.6, 3.95, 0.6, 'ink', 4), seg(-0.6, 2.95, 0.6, 2.95, 'ink', 4),
          ],
          points: [
            { x: -3.6, y: 0, r: 7, color: 'warn', label: 'lamp', labelDx: -14, labelDy: -18 },
            { x: 0, y: -2.1, r: 6, color: 'ink2', label: 'eyepiece: the fringes', labelDx: 12, labelDy: 2 },
            label(0.45, 0.42, 'half-silvered mirror', 'ink2', 4, -12), label(3.95, 0.75, 'mirror', 'ink2', -22, -10), label(0.7, 2.95, 'mirror', 'ink2', 4, 0),
            label(1.9, 0, 'arm 1', 'gold', -18, 14), label(0, 1.6, 'arm 2', 'gold', 8, 0),
          ],
          arrows: [{ from: [1.4, -1.5], to: [4.2, -1.5], color: 'violet', label: 'Earth’s motion, 30 km/s', labelDx: -150, labelDy: 18 }],
        },
        caption: 'Michelson and Morley’s interferometer, simplified. The real arms were folded by mirrors to an effective 11 m, and the stone slab floated on mercury so it could be turned smoothly. Not to scale.',
      },
    }),
    mcq({
      id: 'train-verdict', difficulty: 2,
      prompt: t`Lightning strikes the front and the back of a fast train at the same moment **in the ground’s frame**. A passenger sits at the exact middle of the train, which moves toward the front strike, and the flash from the front reaches her first. She knows she sits midway between the two ends, and that both flashes moved at $c$ in her frame. What must she conclude?`,
      choices: [
        'The front strike happened first: in her frame the strikes were not simultaneous',
        'The strikes were simultaneous; she simply moved toward the front flash',
        'The back strike happened first, because its light had to catch up with her',
        'Nothing: her motion changed the speeds of the two flashes',
      ],
      answer: 0,
      why: {
        1: 'That is the ground’s account. In her own frame she is at rest, and the flashes cover equal distances at equal speeds — so the one that arrives first started first.',
        2: 'Catching up is the ground’s description of the back flash. In her frame she is not moving, and the back flash simply arrives later — it set off later.',
        3: 'The second postulate: light moves at c in every inertial frame, whatever the motion of its source or of the observer.',
      },
      hints: ['Describe everything in her frame: where is she, and how far does each flash travel?', 'Equal distances at equal speeds take equal times. Which flash must have set off first?'],
      teach: 'Simultaneity is relative: events simultaneous in one frame need not be simultaneous in another moving along the line joining them.',
      explain: 'In her frame both flashes start at the ends of the train, equally far from her, and both move at c. The front flash arrives first, so it set off first. The ground says the strikes were simultaneous; the train says the front one came first. Both are right in their own frames — and they agree on everything that happens at one place, such as which flash reached her first.',
      visual: trainPicture(),
    }),
    num({
      id: 'ship-flashes', difficulty: 2,
      gen(r) {
        const b = r.pick([0.3, 0.5, 0.6, 0.8]), dx = r.pick([300, 450, 600, 900, 1500]);
        const dt = b * dx / C * 1e9;
        return {
          prompt: t`A starship cruises past a space station at $${b}c$. Its crew fires one flash at the nose and one at the tail at the same moment **in the ship’s frame**. In the station’s frame the two flashes happen ${dx} m apart. How far apart in time are they in the station’s frame? Answer in nanoseconds.`,
          answer: dt, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: dx / C * 1e9, feedback: t`That is $\Delta x/c$, the light-travel time across the gap. The shift in simultaneity is $v\,\Delta x/c^2$ — smaller by the factor $v/c$.` }],
          hints: [t`Use $\Delta t = v\,\Delta x/c^2$ with $v = ${b}c$.`, t`$\Delta t = ${b} \times \dfrac{${dx}\ \text{m}}{2.998\times10^8\ \text{m/s}}$.`],
          teach: 'Events simultaneous in a frame moving at v are Δt = vΔx/c² apart in yours.',
          explain: t`$\Delta t = \dfrac{v}{c}\cdot\dfrac{\Delta x}{c} = ${b} \times ${fmt(dx / C * 1e9, 4)}\ \text{ns} = ${fmt(dt, 3)}$ ns. In the station’s frame the **tail** flash comes first: the event farther back along the direction of motion happens earlier.`,
          visual: st({
            range: 4.2, top: 4.6, bottom: -0.8, cone: false, numbers: false, xlabel: 'x (station)', ylabel: 't (station)',
            lines: [[-0.6, -0.6 * b, 4.4, 4.4 * b, 'accent'], [-0.6, 3 - (3 * b + 0.6) * b, 4.4, 3 + (4.4 - 3 * b) * b, 'accent'], [-0.75 * b, -0.75, 3.9 * b, 3.9, 'gold', true, 1.8]],
            events: [[0, 0, 'P: tail flash', 'warn', -92, 14], [3 * b, 3, 'Q: nose flash', 'warn', 12, 10]],
            caption: 'The station’s frame, c = 1. Blue: the ship’s tail and nose. Gold dashed: the ship’s line of simultaneity through the two flashes. Not to scale.',
          }),
        };
      },
    }),
    num({
      id: 'find-frame', difficulty: 2,
      gen(r) {
        const [dx, dt] = r.pick([[10, 4], [5, 2], [8, 6], [6, 3], [10, 7], [4, 1]]);
        return {
          prompt: t`In Earth’s frame two supernovae are ${dx} light-years apart, and the farther one (in the $+x$ direction) explodes ${dt} years after the nearer one. How fast must a spacecraft move along the line from the first toward the second for the two explosions to be simultaneous in its frame? Give $v/c$.`,
          answer: dt / dx, tol: { rel: 0.005 },
          errors: [{ value: dx / dt, feedback: t`Upside down: $v = c^2\Delta t/\Delta x$, so $v/c = c\,\Delta t/\Delta x$ — and a speed above $c$ would be impossible anyway.` }],
          hints: [t`Solve $\Delta t = v\,\Delta x/c^2$ for $v$: $\;v = c^2\,\Delta t/\Delta x$.`, t`With $\Delta x$ in light-years and $\Delta t$ in years, $c\,\Delta t = ${dt}$ light-years, so $v/c = ${dt}/${dx}$.`],
          teach: 'Two events with |Δx| > c|Δt| are simultaneous for an observer moving at v = c²Δt/Δx along the line joining them.',
          explain: t`$v/c = \dfrac{c\,\Delta t}{\Delta x} = \dfrac{${dt}\ \text{ly}}{${dx}\ \text{ly}} = ${nice(dt / dx)}$. On the diagram, the line through the two explosions is that spacecraft’s line of simultaneity, with slope $v/c$.`,
          visual: st({ range: Math.max(5, dx * 1.15), top: Math.max(5, dx * 1.15) * 1.1, events: [[0, 0, 'P'], [dt, dx, 'Q']], lines: [[0, 0, dt, dx, 'gold', true, 1.6]], caption: 'The two explosions in Earth’s frame: years up, light-years across (c = 1). Dashed orange: the light cone of the first one.' }),
        };
      },
    }),
    mcq({
      id: 'light-speed', difficulty: 1,
      prompt: t`A spacecraft approaching a space station at $0.5c$ fires a laser pulse straight ahead. At what speed does the station measure the pulse approaching?`,
      choices: [t`$c$`, t`$1.5c$`, t`$0.5c$`, t`Between $c$ and $1.5c$, depending on the laser`],
      answer: 0,
      why: {
        1: 'Adding speeds Galileo’s way works for thrown balls at everyday speeds, but not for light: the second postulate says light moves at c in every inertial frame.',
        2: 'The pulse still moves at c relative to the ship; it cannot be slower relative to the station either.',
        3: 'Light’s speed in vacuum does not depend on the source at all — this is checked to high precision with light from fast-moving sources such as binary stars and particle beams.',
      },
      hints: ['Which postulate is about the speed of light?', 'Does the speed of light depend on the motion of its source?'],
      teach: 'Light in vacuum moves at c in every inertial frame, whatever the motion of its source.',
      explain: t`The station measures $c$, exactly as the crew does. Experiments confirm it: gamma rays from pions decaying at $0.99975c$ were timed at CERN in 1964 and moved at $c$ to within about one part in ten thousand.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.6, 9.4], y: [-1.6, 1.6], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [...shipCurves(0, 2.2, 0, 0.7), seg(7.7, -0.7, 8.9, -0.7, 'ink2'), seg(7.7, 0.7, 8.9, 0.7, 'ink2'), seg(7.7, -0.7, 7.7, 0.7, 'ink2'), seg(8.9, -0.7, 8.9, 0.7, 'ink2')],
          arrows: [{ from: [0.3, -1.05], to: [2.3, -1.05], color: 'accent', label: '0.5c', labelDx: 6, labelDy: 0 }, { from: [2.4, 0], to: [5.6, 0], color: 'gold', label: 'laser pulse', labelDx: -70, labelDy: -16 }],
          points: [label(8.3, 0.7, 'station', 'ink2', -22, -14)],
        },
        caption: 'The ship approaches the station at half the speed of light and fires a pulse ahead. Not to scale.',
      },
    }),
    mcq({
      id: 'causal', difficulty: 2,
      prompt: t`In Earth’s frame, event Q happens 2 years after event P and 1 light-year away from it. Using $\Delta t = v\,\Delta x/c^2$, could any observer find P and Q simultaneous?`,
      choices: [
        t`No: it would take $v = 2c$, and no observer moves faster than light`,
        t`Yes: an observer moving at $0.5c$ from P toward Q`,
        t`Yes: an observer moving at exactly $c$`,
        'Yes: every observer far enough away',
      ],
      answer: 0,
      why: {
        1: t`That inverts the ratio. $v = c^2\Delta t/\Delta x = c \times (2\ \text{yr})/(1\ \text{ly}) = 2c$.`,
        2: 'Nothing with mass reaches c, and even light has no frame of its own — and the required speed here is 2c anyway.',
        3: 'Simultaneity in a given frame does not depend on the observer’s position, only on its velocity.',
      },
      hints: [t`Solve $\Delta t = v\,\Delta x/c^2$ for $v$.`, t`$c\,\Delta t = 2$ light-years is more than $\Delta x = 1$ light-year: where does Q sit relative to P’s light cone?`],
      teach: 'Only events outside each other’s light cones can be simultaneous for some observer; for events inside, every observer agrees on the order.',
      explain: t`$v = c^2\,\Delta t/\Delta x = 2c$ — impossible. Q lies inside P’s future light cone, so P could have caused Q, and every observer agrees P came first. The relativity of simultaneity only reorders events that cannot influence each other.`,
      visual: st({ range: 3, events: [[0, 0, 'P'], [2, 1, 'Q']], caption: 'Years up, light-years across (c = 1); the dashed lines are the light cone of P.' }),
    }),
    order({
      id: 'argument-order', difficulty: 2,
      prompt: 'Put the steps of Einstein’s train argument in order.',
      items: [
        'Lightning strikes both ends of the train at the same moment in the ground’s frame.',
        'In the ground’s frame the passenger moves toward the front flash, which reaches her first.',
        'She agrees that the front flash reached her first: that is a single event at one place.',
        'In her frame she sits midway between the ends and both flashes move at c, so the flash that arrived first must have set off first.',
        'Conclusion: strikes simultaneous for the ground are not simultaneous for the train.',
      ],
      hints: ['Start with what the ground observes, and end with what the passenger concludes.', 'The bridge between the two frames is an event both agree on: the order in which the flashes reach her.'],
      teach: 'Events at one place are agreed by everyone; the order of distant events is what frames can disagree about.',
      explain: 'The argument starts in the ground’s frame, passes through a fact every observer shares — the order in which the two flashes meet the passenger — and ends in the passenger’s frame, where equal distances at equal speeds force the conclusion that the front strike came first.',
      visual: trainPicture(),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-andromeda', difficulty: 3, transfer: true,
      gen(r) {
        const [v, who] = r.pick([[17, 'about Voyager 1’s speed relative to the Sun'], [30, 'about Earth’s orbital speed'], [230, 'about the Sun’s speed around the Milky Way'], [12, 'about the speed of a probe leaving the Solar System']]);
        const dt = (v * 1e3 / C) * ANDROMEDA;
        return {
          prompt: t`The Andromeda Galaxy is about 2.5 million light-years away. A probe moves straight toward it at ${v} km/s relative to the Sun (${who}). The events in Andromeda that the probe calls “now” happen how many years later, in the Sun’s frame, than the events the Sun calls “now”?`,
          answer: dt, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: ANDROMEDA, feedback: t`That is $\Delta x/c$, the light-travel time. Multiply it by $v/c$.` }, { value: dt / 1e3, feedback: 'Check the units: the speed is in km/s, so convert to m/s before dividing by c.' }],
          hints: [t`Use $\Delta t = v\,\Delta x/c^2 = (v/c)(\Delta x/c)$, with $\Delta x/c = 2.5\times10^{6}$ years.`, t`$v/c = ${v}\times10^{3}/(2.998\times10^{8})$.`],
          teach: 'Over astronomical distances even modest speeds shift “now” by years — for events nobody there can yet signal.',
          explain: t`$\Delta t = \dfrac{v}{c}\cdot\dfrac{\Delta x}{c} = \dfrac{${v}\times10^{3}}{2.998\times10^{8}} \times 2.5\times10^{6}\ \text{yr} = ${fmt(dt, 3)}$ years. Nothing paradoxical follows: light from those events will not reach the probe or the Sun for millions of years, so neither can act on them or be affected by them.`,
          visual: st({
            range: 5, xr: [-1.4, 5.6], top: 4.4, bottom: -1.2, cone: false, numbers: false, xlabel: 'distance toward Andromeda', ylabel: 'Sun’s time',
            lines: [[-1, 0, 4.2, 0, 'accent', false, 2.4], [-1, 4, 4.2, 4, 'violet', false, 2.4], [0, -0.6, 0, 4.9, 'ink3', true, 1.4], [-0.15, -0.6, 1.2, 4.8, 'gold', true, 1.6]],
            events: [[0, 4, 'Andromeda now, for the Sun', 'ink2', -170, 18], [1, 4, 'Andromeda now, for the probe', 'gold', 14, -10]],
            extra: { points: [label(0, 3.6, 'Sun', 'accent', 8, 0), label(4, 3.6, 'Andromeda', 'violet', 8, 0)] },
            caption: 'Not to scale: the probe’s line of simultaneity (gold) really tilts by only about one part in ten thousand. Grey dashed: the Sun’s “now”.',
          }),
        };
      },
    }),
    num({
      id: 'cp-lightning', difficulty: 2,
      prompt: t`Two lightning strikes hit a long straight railway 4.5 km apart, and in the ground’s frame the eastern one strikes 9.0 μs after the western one (light-travel times already corrected for). How fast must a train travel east for the strikes to be simultaneous in its frame? Give $v/c$.`,
      answer: C * 9.0e-6 / 4500, tol: { rel: 0.01 },
      errors: [{ value: 4500 / (C * 9.0e-6), feedback: 'Upside down: v/c = cΔt/Δx, which must be less than 1.' }],
      hints: [t`$v = c^2\Delta t/\Delta x$, so $v/c = c\,\Delta t/\Delta x$.`, t`$c\,\Delta t = (2.998\times10^8\ \text{m/s})(9.0\times10^{-6}\ \text{s})$ — compare it with 4500 m.`],
      teach: 'Solving Δt = vΔx/c² for v gives the observer for whom two events are simultaneous.',
      explain: t`$c\,\Delta t = ${fmt(C * 9.0e-6, 4)}$ m, so $v/c = ${fmt(C * 9.0e-6, 4)}/4500 = ${fmt(C * 9.0e-6 / 4500, 3)}$. Light could not have connected the strikes (it covers only ${fmt(C * 9.0e-6 / 1000, 3)} km in 9.0 μs), which is why such an observer can exist.`,
      visual: st({ range: 5, xlabel: 'x (km)', ylabel: 'ct (km)', events: [[0, 0, 'west strike'], [C * 9.0e-6 / 1000, 4.5, 'east strike', 'accent2', -60, -14]], caption: 'The ground’s frame, with time drawn as ct in kilometres (c = 1). Dashed: the light cone of the western strike.' }),
    }),
    mcq({
      id: 'cp-postulate', difficulty: 2,
      prompt: 'You are inside a windowless laboratory coasting through space at constant velocity. Can any experiment done inside it reveal how fast it is moving?',
      choices: [
        'No — the laws of physics are the same in every inertial frame',
        'Yes — light sent forward and backward would move at different speeds',
        'Yes — a pendulum’s period depends on the laboratory’s speed',
        'Yes — your own clocks would run slow, so compare them with how fast your heart beats',
      ],
      answer: 0,
      why: {
        1: 'That is what the ether theory predicted and Michelson and Morley failed to find: light moves at c in every direction in every inertial frame.',
        2: 'A pendulum swings the same way in any inertial frame; only acceleration or gravity changes its period.',
        3: 'In your own frame your clocks — and your heart — run at their normal rates. Time dilation is about clocks seen from another frame.',
      },
      hints: ['Which postulate is about experiments in different inertial frames?'],
      teach: 'The first postulate: no experiment inside an inertial laboratory can detect its uniform motion.',
      explain: 'Uniform motion is undetectable from inside: the first postulate. Speed is only ever relative to something else — the Sun, a station, another ship.',
      visual: {
        type: 'graph',
        params: {
          x: [-2.6, 4.4], y: [-1.5, 1.5], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [seg(-2, -1, 2, -1, 'ink2', 2.4), seg(-2, 1, 2, 1, 'ink2', 2.4), seg(-2, -1, -2, 1, 'ink2', 2.4), seg(2, -1, 2, 1, 'ink2', 2.4),
            seg(-1.3, 0.95, -0.95, 0.05, 'ink3', 1.6), seg(0.6, 0.8, 1.4, 0.8, 'ink', 3), seg(0.6, -0.8, 1.4, -0.8, 'ink', 3), seg(1, -0.72, 1, 0.72, 'gold', 2)],
          points: [{ x: -0.95, y: 0.05, r: 7, color: 'accent', label: 'pendulum', labelDx: -24, labelDy: 22 }, label(1.05, 0, 'light pulse', 'gold', 8, 0)],
          arrows: [{ from: [2.4, 0], to: [3.8, 0], color: 'violet', label: 'v = ?', labelDx: -24, labelDy: -16 }],
        },
        caption: 'A closed laboratory coasting at constant velocity, with a pendulum and a light pulse bouncing between two mirrors. Not to scale.',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §5.1 Invariance of physical laws', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-1-invariance-of-physical-laws' },
    { label: 'OpenStax University Physics Vol. 3, §5.2 Relativity of simultaneity', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-2-relativity-of-simultaneity' },
    { label: 'Einstein (1905), On the electrodynamics of moving bodies (English translation)', url: 'https://www.fourmilab.ch/etexts/einstein/specrel/www/' },
    { label: 'Michelson & Morley (1887), On the relative motion of the Earth and the luminiferous ether, Am. J. Sci. 34, 333', url: 'https://doi.org/10.2475/ajs.s3-34.203.333' },
    { label: 'Scherr, Shaffer & Vokos (2001), student understanding of time in special relativity', url: 'https://arxiv.org/abs/physics/0207109' },
  ],
});
