// Rotating frames (Taylor §9.3–9.6): for a frame turning at angular velocity
// Ω, any vector's rate of change obeys (dQ/dt)_in = (dQ/dt)_rot + Ω × Q.
// Applied to r twice it gives Newton's law in the rotating frame,
// mr̈ = F + 2mṙ × Ω + m(Ω × r) × Ω (Coriolis and centrifugal terms, examined
// in M6.3). Explored as a puck crossing a frictionless turntable — a straight
// line from the ground, a curling spiral from the table. Worked: a 100 m
// station ring spun for 0.5 g (2.11 rpm, the 1.8% head-to-foot gradient).
// Practice: spin rates, a point's velocity Ω × r, the turntable puck, the
// derivation in order, a geostationary satellite's inertial speed. Transfer:
// launch sites' eastward boost; a training centrifuge; what holds a GEO
// satellite still in Earth's frame. Links (not reused): phys3550.M1.1 (the
// climber on a station spoke, done in the inertial frame).
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct } from './_cm.js';
import { G0, OMEGA_E, R_EQ, R_GEO, T_SID, ring, disc } from './_cm3.js';

const t = String.raw;

const EX = (() => {
  const R = 100, g = 0.5 * G0, W = Math.sqrt(g / R);
  return { R, g, W, rpm: (W * 60) / (2 * Math.PI), head: (R - 1.8) / R, v: W * R };
})();

// a ring station seen end-on: rim, spokes, a crew member standing on the rim (feet out)
function stationPic({ caption, alt, person = true, spin = true, extra = {} }) {
  return gpic({
    x: [-1.5, 1.5], y: [-1.2, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [ring(1, 'ink2', 2.4), ring(0.15, 'ink3', 1.6), seg([0.15, 0], [1, 0], 'ink3', 1.2), seg([-0.15, 0], [-1, 0], 'ink3', 1.2), seg([0, 0.15], [0, 1], 'ink3', 1.2), seg([0, -0.15], [0, -1], 'ink3', 1.2),
      ...(person ? [seg([r6(Math.cos(-0.6)), r6(Math.sin(-0.6))], [r6(0.82 * Math.cos(-0.6)), r6(0.82 * Math.sin(-0.6))], 'warn', 3.5)] : []),
      ...(spin ? [{ param: ['1.22*cos(t)', '1.22*sin(t)'], t: [0.45, 0.95], color: 'accent', width: 1.6 }] : [])],
    points: [...(person ? [{ x: r6(0.8 * Math.cos(-0.6)), y: r6(0.8 * Math.sin(-0.6)), color: 'warn', r: 4 }] : []), ...(spin ? [lab(1.12, 0.98, 'Ω', 'accent')] : [])],
    arrows: spin ? [{ from: [r6(1.22 * Math.cos(0.9)), r6(1.22 * Math.sin(0.9))], to: [r6(1.22 * Math.cos(1.2)), r6(1.22 * Math.sin(1.2))], color: 'accent' }] : [],
    ...extra,
  }, caption, alt || 'A ring space station seen end-on, spinning anticlockwise');
}

// the turntable puck: launched from the centre along +x at speed v; table spins at W (rad/s, anticlockwise)
function puckPic({ v = 0.5, W = 0.6, T = 4, frame = 'rot', caption }) {
  const inertial = frame === 'in';
  return gpic({
    x: [-2.3, 2.3], y: [-2.3, 2.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [disc(2.1, 'ink4', 0.25)],
    curves: inertial
      ? [{ param: [`${v}*t`, '0'], t: [0, T], color: 'accent', width: 2.2 }]
      : [{ param: [`${v}*t*cos(${W}*t)`, `-${v}*t*sin(${W}*t)`], t: [0, T], color: 'accent', width: 2.2 }],
    points: [{ x: 0, y: 0, color: 'ink3', r: 3 }, inertial ? { x: r6(v * T), y: 0, color: 'warn', r: 6 } : { x: r6(v * T * Math.cos(W * T)), y: r6(-v * T * Math.sin(W * T)), color: 'warn', r: 6 }],
  }, caption, 'A puck on a turntable seen from above');
}

export default lesson({
  id: 'phys3550.M6.2',
  title: 'Rotating frames',
  minutes: 15, difficulty: 3,
  intro: t`Earth turns, space stations spin, and a turbine engineer lives in the rotor's frame. In a frame rotating with angular velocity $\vec\Omega$, a vector fixed in the frame still changes as seen from outside: it is carried round, at rate $\vec\Omega\times\vec Q$. So every rate of change picks up that term. Applying the rule twice to the position $\vec r$ turns $m\ddot{\vec r} = \vec F$ into Newton's law in the rotating frame — with two extra terms, the **Coriolis** and **centrifugal** forces. They are not interactions; they are the price of describing motion from a turning platform, and [M6.3](#/lesson/phys3550.M6.3) puts them to work.

$$m\ddot{\vec r} = \vec F + 2m\dot{\vec r}\times\vec\Omega + m(\vec\Omega\times\vec r)\times\vec\Omega$$`,
  equation: t`\left(\frac{d\vec Q}{dt}\right)_{\text{in}} = \left(\frac{d\vec Q}{dt}\right)_{\text{rot}} + \vec\Omega\times\vec Q`,
  symbols: [
    { tex: '\\vec Q', text: 'any vector: a position, a velocity, an angular momentum' },
    { tex: '(d\\vec Q/dt)_{\\text{in}}', text: 'its rate of change seen from an inertial frame' },
    { tex: '(d\\vec Q/dt)_{\\text{rot}}', text: 'its rate of change seen from the rotating frame (dots on $\\vec r$ in the second law mean this)' },
    { tex: '\\vec\\Omega', text: 'the frame’s angular velocity, in rad/s, along the rotation axis by the right-hand rule; Earth’s is $7.292\\times10^{-5}$ rad/s toward the north pole' },
    { tex: '\\vec F', text: 'the real forces, in N' },
  ],
  why: t`Weather, ocean currents, rendezvous in orbit and artificial gravity are all worked out in rotating frames — and general relativity's frame dragging is a rotating frame imposed by a spinning mass.`,
  visual: {
    type: 'graph',
    title: 'One puck, two descriptions',
    lead: t`A puck slides from the centre of a frictionless turntable. From the ground it goes straight. From the turntable, the same motion curls into a spiral. Switch views and run the clock.`,
    tasks: [
      t`In the ground view the puck's path is straight at every spin rate: no real horizontal force acts on it.`,
      t`In the table view, an anticlockwise table makes the path curl **clockwise** — to the right of the puck's motion.`,
      t`Set $\Omega = 0$: the two views agree.`,
    ],
    params: {
      aspect: 'wide', x: [-2.3, 2.3], y: [-2.3, 2.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      choices: [{ key: 'f', label: 'View from', options: [[0, 'the ground'], [1, 'the turntable']], value: 1, explain: 'The ground is (nearly) inertial; the turntable rotates anticlockwise for $\\Omega > 0$.' }],
      sliders: [
        { key: 'w', label: 'Spin rate $\\Omega$', min: -1.5, max: 1.5, step: 0.05, value: 0.8, unit: '\\mathrm{rad/s}', explain: 'Positive is anticlockwise seen from above.' },
        { key: 'T', label: 'Time $t$', min: 0.05, max: 4.2, step: 0.05, value: 3, unit: '\\mathrm{s}', explain: 'Since the puck left the centre at 0.5 m/s.' },
      ],
      shade: [{ fn: 'sqrt(max(0, 4.41 - x^2))', lower: '-sqrt(max(0, 4.41 - x^2))', from: -2.1, to: 2.1, color: 'ink4', alpha: 0.25 }],
      curves: [
        { param: ['0.5*t', '0'], t: [0, 'T'], color: 'accent', width: 2.2, when: 'step(0.5 - f)' },
        { param: ['0.5*t*cos(w*t)', '-0.5*t*sin(w*t)'], t: [0, 'T'], color: 'accent', width: 2.2, samples: 1500, when: 'step(f - 0.5)' },
        { param: ['2.1*t*cos(w*T)', '2.1*t*sin(w*T)'], t: [0, 1], color: 'ink3', width: 1.2, dash: true, when: 'step(0.5 - f)' },
        { param: ['2.1*t', '0'], t: [0, 1], color: 'ink3', width: 1.2, dash: true, when: 'step(f - 0.5)' },
      ],
      points: [
        { x: '0.5*T', y: 0, color: 'warn', r: 6, when: 'step(0.5 - f)' },
        { x: '0.5*T*cos(w*T)', y: '-0.5*T*sin(w*T)', color: 'warn', r: 6, when: 'step(f - 0.5)' },
        { x: 0, y: 0, color: 'ink3', r: 3 },
      ],
      readouts: [{ label: 'distance from centre', expr: '0.5*T', unit: '\\mathrm{m}', digits: 3 }, { label: 'table has turned', expr: 'w*T*180/pi', unit: '^\\circ', digits: 3 }],
    },
    caption: t`Seen from above; frictionless table of radius 2.1 m, the puck launched from the centre at 0.5 m/s. The dashed line is a stripe painted on the table along the launch direction. No forces are included but the table's (none, horizontally).`,
  },
  example: {
    prompt: t`A space station is a ring of radius ${EX.R} m. How fast must it spin for the crew to feel $0.5\,g$ at the rim? How different is the effective gravity at the head of a 1.8 m astronaut? ($g = 9.81$ m/s².)`,
    visual: stationPic({ caption: t`The ring station end-on, spinning anticlockwise; an astronaut stands on the rim with her feet outward. Not to scale.` }),
    steps: [
      { label: 'Inertial frame', text: t`The astronaut moves in a circle of radius $R$ at angular speed $\Omega$. The only force on her is the floor's push, inward, which must supply the centripetal force $mR\Omega^2$. She feels that push as weight.` },
      { label: 'Rotating frame', text: t`In the station's frame she is at rest, so $\dot{\vec r} = 0$ and the Coriolis term vanishes. The centrifugal term $m(\vec\Omega\times\vec r)\times\vec\Omega$ has size $mR\Omega^2$ and points outward: an effective gravity $g_{\text{eff}} = R\Omega^2$, balanced by the floor.` },
      { label: 'Spin rate', text: t`$\Omega = \sqrt{g_{\text{eff}}/R} = \sqrt{${sci(EX.g, 3)}/${EX.R}} = ${sci(EX.W, 3)}$ rad/s $= ${sci(EX.rpm, 3)}$ rpm; the rim moves at $R\Omega = ${sci(EX.v, 3)}$ m/s.` },
      { label: 'Gradient', text: t`$g_{\text{eff}}$ grows in proportion to $r$: at her head, 1.8 m nearer the axis, it is $(R - 1.8)/R = ${EX.head.toFixed(3)}$ of the floor value — ${((1 - EX.head) * 100).toFixed(1)}% less.` },
      { label: 'Sense check', text: t`Studies of rotating rooms suggest people adapt to about 2–4 rpm; at ${sci(EX.rpm, 3)} rpm this ring is comfortable. A smaller station would need a faster spin and a steeper gradient.` },
    ],
    answer: t`$\Omega = ${sci(EX.W, 3)}$ rad/s (${sci(EX.rpm, 3)} rpm); effective gravity at head height is ${((1 - EX.head) * 100).toFixed(1)}% weaker than at her feet.`,
  },
  practice: [
    num({
      id: 'spin-rpm', difficulty: 2,
      gen(r) {
        const R = r.pick([40, 60, 150, 250]), f = r.pick([0.38, 0.5, 1]);
        const W = Math.sqrt((f * G0) / R), rpm = (W * 60) / (2 * Math.PI);
        return {
          prompt: t`At how many revolutions per minute must a ring station of radius ${R} m spin to give ${f === 0.38 ? 'Mars-like gravity ($0.38\\,g$)' : f === 1 ? 'full Earth gravity ($1\\,g$)' : 'half Earth gravity ($0.5\\,g$)'} at the rim? ($g = 9.81$ m/s².)`,
          answer: rpm, units: 'rpm', tol: { rel: 0.005 },
          errors: distinct([{ value: W, feedback: t`That is $\Omega$ in rad/s. One revolution is $2\pi$ rad and a minute is 60 s: multiply by $60/2\pi$.` }, { value: ((f * G0) / R) * (60 / (2 * Math.PI)), feedback: t`$g_{\text{eff}} = R\Omega^2$: take the square root of $g_{\text{eff}}/R$.` }], rpm),
          hints: [t`$g_{\text{eff}} = R\Omega^2$, so $\Omega = \sqrt{g_{\text{eff}}/R}$.`, t`rpm $= \Omega \times 60/2\pi$.`],
          teach: t`Spin gravity is the centrifugal acceleration $R\Omega^2$ of the station's frame.`,
          explain: t`$\Omega = \sqrt{${sci(f * G0, 3)}/${R}} = ${sci(W, 3)}$ rad/s $= ${sci(rpm, 3)}$ rpm.`,
          visual: stationPic({ caption: t`A ring station end-on (not to scale), spinning anticlockwise.` }),
        };
      },
    }),
    expr({
      id: 'omega-cross-r', difficulty: 2,
      prompt: t`A point is fixed in a frame rotating about the $z$-axis, $\vec\Omega = \Omega\hat z$, at position $\vec r = (x, y, 0)$. Its velocity seen from the inertial frame is $\vec\Omega\times\vec r$. What is its **$x$-component**? Type $\Omega$ as Omega.`,
      answer: '-Omega*y', answerTeX: t`-\Omega y`,
      lhs: 'v_x', vars: { Omega: [0.5, 2], x: [-2, 2], y: [-2, 2] }, keys: [['Ω', 'Omega']],
      errors: [{ answer: 'Omega*y', feedback: t`Sign: $\hat z\times\hat y = -\hat x$. A point on the $+y$ axis, carried anticlockwise, moves toward $-x$.` }, { answer: 'Omega*x', feedback: t`That is the $y$-component. $(\Omega\hat z)\times(x\hat x + y\hat y) = \Omega x\,\hat y - \Omega y\,\hat x$.` }],
      hints: [t`Use $\hat z\times\hat x = \hat y$ and $\hat z\times\hat y = -\hat x$.`],
      teach: t`A point fixed in a rotating frame moves, seen from outside, at $\vec\Omega\times\vec r$: perpendicular to both the axis and the radius.`,
      explain: t`$\vec\Omega\times\vec r = (-\Omega y, \Omega x, 0)$: speed $\Omega\sqrt{x^2 + y^2}$, anticlockwise for $\Omega > 0$. This is the $(d\vec r/dt)_{\text{in}} = (d\vec r/dt)_{\text{rot}} + \vec\Omega\times\vec r$ rule with $(d\vec r/dt)_{\text{rot}} = 0$.`,
      visual: gpic({ x: [-2, 2], y: [-1.6, 1.6], equal: true, xlabel: 'x', ylabel: 'y', curves: [ring(1.2, 'ink4', 1, true)], points: [{ x: 0.6, y: 1.039, color: 'warn', r: 6 }, { x: 0, y: 0, color: 'ink3', r: 3, label: 'Ω out of page', labelDx: 8, labelDy: 14 }], arrows: [{ from: [0, 0], to: [0.6, 1.039], color: 'ink3', width: 1.2, label: 'r⃗', labelDx: -18, labelDy: -6 }] }, t`A point at $\vec r$ in the $xy$-plane, carried round the $z$-axis (out of the page) on the dashed circle. Its velocity arrow is what you are finding.`, 'A point on a circle about the origin'),
    }),
    mcq({
      id: 'puck-ground', difficulty: 2,
      prompt: t`A puck is released from rest relative to a spinning, frictionless turntable, near its edge. Seen **from the ground**, what path does it follow?`,
      visual: gpic({ x: [-2.3, 2.3], y: [-2.3, 2.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(2.1, 'ink4', 0.25)], curves: [{ param: ['2.3*cos(t)', '2.3*sin(t)'], t: [0.35, 0.85], color: 'accent', width: 1.6 }], points: [{ x: 1.7, y: 0, color: 'warn', r: 6, label: 'puck', labelDx: -14, labelDy: 18 }, { x: 0, y: 0, color: 'ink3', r: 3 }, lab(2.05, 1.85, 'Ω', 'accent')], arrows: [{ from: [r6(2.3 * Math.cos(0.8)), r6(2.3 * Math.sin(0.8))], to: [r6(2.3 * Math.cos(1.1)), r6(2.3 * Math.sin(1.1))], color: 'accent' }] }, t`The frictionless turntable from above, spinning anticlockwise, at the moment the puck is released near its edge.`, 'A turntable with a puck near its edge'),
      choices: [t`A straight line along the tangent, at the speed the table's surface had there`, t`Straight outward along the radius, flung by the centrifugal force`, t`A circle with the table, since it was moving with it`, t`A spiral curving outward`],
      answer: 0,
      why: { 1: t`From the ground there is no centrifugal force: with no horizontal force at all, the puck keeps its velocity, which was tangential.`, 2: t`It moved with the table only because friction — here absent — would have kept pushing it inward. Without a centripetal force there is no circle.`, 3: t`A spiral is what an observer **on the table** sees, as the table turns beneath a straight path.` },
      hints: [t`What horizontal forces act on the puck once released, seen from an inertial frame?`, t`Newton's first law: no net force, constant velocity. Which velocity did it have at release?`],
      teach: t`In the inertial frame a released object flies off along the tangent; "flung outward" is the rotating frame's description.`,
      explain: t`At release it has the table's local velocity $\vec\Omega\times\vec r$, tangential; no horizontal force acts, so it goes straight along the tangent. Seen from the table it drifts outward and curls backward — the centrifugal and Coriolis terms describe exactly this straight line.`,
    }),
    order({
      id: 'derive-order', difficulty: 3,
      prompt: t`Put the steps that give Newton's law in a rotating frame in order. (Dots mean rates seen in the rotating frame.)`,
      visual: puckPic({ frame: 'rot', W: 0.8, T: 3, caption: t`The straight-line motion of a free puck, as described in the rotating frame: the extra terms bend it.` }),
      items: [
        t`Apply the rule to $\vec r$: $\vec v_{\text{in}} = \dot{\vec r} + \vec\Omega\times\vec r$`,
        t`Apply it to $\vec v_{\text{in}}$: $\vec a_{\text{in}} = \dot{\vec v}_{\text{in}} + \vec\Omega\times\vec v_{\text{in}}$`,
        t`Expand: $\vec a_{\text{in}} = \ddot{\vec r} + 2\vec\Omega\times\dot{\vec r} + \vec\Omega\times(\vec\Omega\times\vec r)$`,
        t`Newton in the inertial frame: $m\vec a_{\text{in}} = \vec F$`,
        t`Rearrange: $m\ddot{\vec r} = \vec F + 2m\dot{\vec r}\times\vec\Omega + m(\vec\Omega\times\vec r)\times\vec\Omega$`,
      ],
      hints: [t`The transformation rule is used twice, first on position, then on velocity.`, t`Newton's law is only true in the inertial frame; it enters just before the final rearrangement.`],
      teach: t`The Coriolis and centrifugal terms are the two cross products left over from differentiating twice in a turning frame (constant $\vec\Omega$).`,
      explain: t`With constant $\vec\Omega$: $\vec a_{\text{in}} = \ddot{\vec r} + \vec\Omega\times\dot{\vec r} + \vec\Omega\times(\dot{\vec r} + \vec\Omega\times\vec r)$, giving the factor 2 on the Coriolis term. Moving the two extra terms to the force side and flipping the cross products' order gives the rotating-frame law.`,
    }),
    num({
      id: 'geo-speed', difficulty: 2,
      gen(r) {
        const v = (OMEGA_E * R_GEO) / 1e3;
        const unitKmh = r.bool(0.5);
        const ans = unitKmh ? v * 3600 : v;
        return {
          prompt: t`A geostationary satellite sits motionless in Earth's rotating frame, 42 164 km from Earth's centre. Earth turns once per sidereal day (${T_SID.toFixed(1)} s). How fast does the satellite move in an inertial frame, in ${unitKmh ? 'km/h' : 'km/s'}?`,
          answer: ans, units: unitKmh ? 'km/h' : 'km/s', tol: { rel: 0.005 },
          errors: distinct([{ value: unitKmh ? ((2 * Math.PI * R_GEO) / 86400 / 1e3) * 3600 : (2 * Math.PI * R_GEO) / 86400 / 1e3, feedback: t`Earth turns once in a sidereal day, 23 h 56 min — not 24 h, which is the solar day.` }], ans),
          hints: [t`$\vec v_{\text{in}} = \dot{\vec r} + \vec\Omega\times\vec r$ with $\dot{\vec r} = 0$.`, t`$|\vec\Omega\times\vec r| = \Omega r$ with $\Omega = 2\pi/T_{\text{sid}}$.`],
          teach: t`At rest in the rotating frame means moving at $\vec\Omega\times\vec r$ in the inertial one.`,
          explain: t`$\Omega = 2\pi/${T_SID.toFixed(1)} = ${sci(OMEGA_E, 4)}$ rad/s, so $v = \Omega r = ${sci(unitKmh ? ans : v, 4)}$ ${unitKmh ? 'km/h' : 'km/s'} — exactly the circular-orbit speed $\sqrt{GM/r}$ at that radius, which is what makes the orbit geostationary.`,
          visual: gpic({ x: [-1.25, 1.25], y: [-1.15, 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(0.151)], curves: [ring(1, 'ink3', 1.4, true)], points: [{ x: 0.707, y: 0.707, color: 'warn', r: 5, label: 'satellite', labelDx: 8, labelDy: -8 }, lab(0, -0.28, 'Earth', 'ink2')], arrows: [{ from: [0, 0], to: [0.7, 0.7], color: 'ink3', width: 1 }] }, t`Earth and the geostationary orbit seen from above the north pole, to scale.`, 'Earth with a satellite on a distant circular orbit'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-launch-site', difficulty: 2, transfer: true,
      gen(r) {
        const S = r.pick([{ name: 'Kourou, French Guiana', lat: 5.2 }, { name: 'Cape Canaveral', lat: 28.5 }, { name: 'Baikonur', lat: 45.6 }, { name: 'Plesetsk', lat: 62.9 }]);
        const v = OMEGA_E * R_EQ * Math.cos((S.lat * Math.PI) / 180);
        return {
          prompt: t`A rocket sitting on its pad at ${S.name} (latitude ${S.lat}°) already moves eastward in an inertial frame because Earth turns. How fast, in m/s? (Treat Earth as a sphere of radius 6378 km turning at $\Omega = 7.292\times10^{-5}$ rad/s.)`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: distinct([{ value: OMEGA_E * R_EQ, feedback: t`That is the equator's speed. Away from the equator the pad circles the axis at radius $R\cos\lambda$.` }, { value: OMEGA_E * R_EQ * Math.sin((S.lat * Math.PI) / 180), feedback: t`The distance from the axis is $R\cos\lambda$, not $R\sin\lambda$ (latitude is measured from the equator).` }], v),
          hints: [t`$|\vec\Omega\times\vec r| = \Omega\,\times$ (distance from the axis).`, t`The distance from the axis at latitude $\lambda$ is $R\cos\lambda$.`],
          teach: t`The ground moves eastward at $\Omega R\cos\lambda$; launching east collects it for free.`,
          explain: t`$v = \Omega R\cos\lambda = ${sci(v, 3)}$ m/s. That is why launch sites sit as close to the equator as politics allows, and why rockets launch eastward: a westward launch would have to cancel this speed first.`,
          visual: gpic({ x: [-1.6, 1.6], y: [-1.15, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(1, 'accent', 0.3)], curves: [seg([0, -1.15], [0, 1.2], 'ink3', 1.2, true), seg([0, r6(Math.sin((S.lat * Math.PI) / 180))], [r6(Math.cos((S.lat * Math.PI) / 180)), r6(Math.sin((S.lat * Math.PI) / 180))], 'ink3', 1.2, true), seg([0, 0], [r6(Math.cos((S.lat * Math.PI) / 180)), r6(Math.sin((S.lat * Math.PI) / 180))], 'ink3', 1)], points: [{ x: r6(Math.cos((S.lat * Math.PI) / 180)), y: r6(Math.sin((S.lat * Math.PI) / 180)), color: 'warn', r: 6, label: 'pad', labelDx: 8, labelDy: -8 }, lab(0.08, 1.18, 'Ω', 'accent', 8, 0), lab(0.32, 0.08, 'λ', 'ink2')] }, t`Earth side-on with its axis vertical; the pad at latitude $\lambda$ circles the axis on the dashed line.`, 'Earth side-on with a launch pad marked'),
        };
      },
    }),
    num({
      id: 'cp-centrifuge', difficulty: 2, transfer: true,
      gen(r) {
        const Rm = r.pick([6, 8, 10]), n = r.pick([4, 6, 8]);
        const rpm = (Math.sqrt((n * G0) / Rm) * 60) / (2 * Math.PI);
        return {
          prompt: t`A pilot-training centrifuge has an arm ${Rm} m long. At how many rpm does the gondola at its end have a centripetal acceleration of $${n}\,g$? ($g = 9.81$ m/s².)`,
          answer: rpm, units: 'rpm', tol: { rel: 0.005 },
          errors: distinct([{ value: (Math.sqrt((n * G0) / Rm) * 60) / (2 * Math.PI) / Math.sqrt(n), feedback: t`That gives only $1\,g$. Use $R\Omega^2 = ${n}\times9.81$ m/s².` }], rpm),
          hints: [t`$R\Omega^2 = ${n}g$.`, t`Convert $\Omega$ to rpm with $60/2\pi$.`],
          teach: t`In the gondola's rotating frame the trainee feels the centrifugal $R\Omega^2$ as extra weight.`,
          explain: t`$\Omega = \sqrt{${n}\times9.81/${Rm}} = ${sci(Math.sqrt((n * G0) / Rm), 3)}$ rad/s $= ${sci(rpm, 3)}$ rpm. The trainee also feels Earth's $1\,g$ downward, so the total effective gravity, $\sqrt{(${n}g)^2 + g^2}$, is slightly more — the gondola swings to align with it.`,
          visual: stationPic({ person: false, caption: t`Seen from above, a rotating arm (schematic; a centrifuge has one gondola, not a ring).`, extra: { curves: [seg([0, 0], [1, 0], 'ink2', 3), { param: ['1.22*cos(t)', '1.22*sin(t)'], t: [0.5, 1.1], color: 'accent', width: 1.6 }], points: [{ x: 1, y: 0, color: 'warn', r: 8, label: 'gondola', labelDx: -20, labelDy: 18 }, lab(1.12, 0.98, 'Ω', 'accent'), { x: 0, y: 0, color: 'ink3', r: 4 }] } }),
        };
      },
    }),
    mcq({
      id: 'cp-geo-balance', difficulty: 3,
      prompt: t`In Earth's rotating frame a geostationary satellite is at rest. Which forces in that frame balance on it?`,
      visual: gpic({ x: [-1.25, 1.25], y: [-1.15, 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(0.151)], curves: [ring(1, 'ink3', 1.4, true)], points: [{ x: 1, y: 0, color: 'warn', r: 6, label: 'satellite', labelDx: 8, labelDy: -10 }] }, t`Earth and a geostationary satellite, seen from above the north pole, to scale.`, 'Earth with a satellite at geostationary distance'),
      choices: [t`Gravity inward and the centrifugal force $mr\Omega^2$ outward; the Coriolis force is zero because the satellite does not move in this frame`, t`Gravity and the Coriolis force`, t`Nothing balances gravity: the satellite is falling`, t`Gravity, centrifugal and Coriolis forces all together`],
      answer: 0,
      why: { 1: t`The Coriolis force $2m\dot{\vec r}\times\vec\Omega$ needs a velocity in the rotating frame, and here $\dot{\vec r} = 0$.`, 2: t`That is the inertial-frame story (it falls round in a circle). In the rotating frame it is at rest, so the forces there must balance.`, 3: t`The Coriolis term vanishes for a body at rest in the frame.` },
      hints: [t`At rest in the frame: $\ddot{\vec r} = 0$ and $\dot{\vec r} = 0$. Which terms survive?`, t`The Coriolis term carries $\dot{\vec r}$; the centrifugal term needs only $\vec r$.`],
      teach: t`For a body at rest in a rotating frame, only gravity and the centrifugal force remain; their balance fixes the geostationary radius.`,
      explain: t`$0 = -GMm/r^2 + mr\Omega^2$, so $r^3 = GM/\Omega^2$: 42 164 km. Same physics as the inertial description, where gravity supplies the centripetal force — only the bookkeeping differs.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §9.3–9.6: rotating frames, Newton’s second law in a rotating frame', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'NASA Goddard Earth Fact Sheet (sidereal rotation period, equatorial radius)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' },
  ],
});
