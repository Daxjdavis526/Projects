// Relative motion: velocities add as vectors between frames (Galilean
// relativity), and accelerations are the same in every inertial frame.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { s3, D2R } from './_kinematics.js';

const t = String.raw;

// the wind-triangle explore: heading h (degrees from north, + toward east), airspeed va, wind w toward the east
const AIR = ['va*sin(h*pi/180)', 'va*cos(h*pi/180)'];
const GROUND = ['va*sin(h*pi/180) + w', 'va*cos(h*pi/180)'];

export default lesson({
  id: 'phys2210.M4.5',
  title: 'Relative motion',
  minutes: 10, difficulty: 2,
  intro: t`Every velocity is measured **relative to something**. If an object P moves relative to a frame B, and B moves relative to a frame A, then

$$\vec v_{PA} = \vec v_{PB} + \vec v_{BA}$$

Velocities add as vectors. For an aircraft: its velocity over the ground is its velocity through the air plus the wind. The subscripts chain like this — P relative to A equals P relative to B, plus B relative to A — and swapping them flips the sign: $\vec v_{AB} = -\vec v_{BA}$. Accelerations, by contrast, come out the same in every frame moving at constant velocity: the seed of the principle of relativity.`,
  symbols: [
    { tex: '\\vec v_{PA}', text: 'velocity of object P relative to frame A (for example, an aircraft relative to the ground), in m/s' },
    { tex: '\\vec v_{PB}', text: 'velocity of P relative to frame B (the aircraft relative to the air)' },
    { tex: '\\vec v_{BA}', text: 'velocity of frame B relative to frame A (the air relative to the ground: the wind)' },
    { tex: '\\vec v_{AB} = -\\vec v_{BA}', text: 'the same relative velocity seen the other way round' },
    { tex: '\\text{heading, track}', text: 'where the nose points (the direction of $\\vec v_{PB}$) and where the aircraft actually goes over the ground (the direction of $\\vec v_{PA}$)' },
  ],
  why: 'Crosswind landings, river crossings and orbital rendezvous all come down to adding velocity vectors — and the statement that every inertial frame sees the same accelerations is where special relativity begins.',
  visual: {
    type: 'graph',
    title: 'The wind triangle',
    lead: t`An aircraft lines up with a north–south runway, seen from above. Blue: its velocity **through the air** (along the nose). Teal: the wind, carrying the air over the ground. Gold: the sum, its velocity **over the ground**. Positive wind blows toward the east.`,
    tasks: [
      'Point the nose due north (heading 0°) and add wind: the gold ground track drifts off the runway.',
      'Now crab: turn the heading into the wind until the track reads 0°. The aircraft tracks straight down the runway with its nose pointing off to one side.',
      'Watch the groundspeed while you crab: part of the airspeed is spent cancelling the wind, so it falls below the airspeed.',
    ],
    params: {
      x: [-45, 45], y: [-6, 88], equal: true, xlabel: 'east (m/s)', ylabel: 'north (m/s)',
      sliders: [
        { key: 'h', label: 'Heading', min: -30, max: 30, step: 0.5, value: 0, unit: '^\\circ', explain: 'Where the nose points: degrees east of north (negative is west).' },
        { key: 'va', label: 'Airspeed $v_\\text{air}$', min: 40, max: 80, step: 1, value: 70, unit: '\\mathrm{m/s}', explain: 'The aircraft’s speed relative to the air.' },
        { key: 'w', label: 'Wind', min: -25, max: 25, step: 1, value: 15, unit: '\\mathrm{m/s}', explain: 'Positive blows toward the east (a wind from the west).' },
      ],
      curves: [{ param: ['0', 't'], t: [-6, 88], color: 'ink4', width: 6 }],
      arrows: [
        { from: [0, 0], to: AIR, color: 'accent', label: 'air' },
        { from: AIR, to: GROUND, color: 'teal' },
        { from: [0, 0], to: GROUND, color: 'gold', label: 'ground' },
      ],
      points: [{ x: 'va*sin(h*pi/180) + w/2 - 3', y: 'va*cos(h*pi/180) - 5', r: 0.1, color: 'teal', label: 'wind' }],
      readouts: [
        { label: 'groundspeed', expr: 'sqrt((va*sin(h*pi/180) + w)^2 + (va*cos(h*pi/180))^2)', unit: '\\mathrm{m/s}', digits: 3 },
        { label: 'track (east of north)', expr: 'atan2(va*sin(h*pi/180) + w, va*cos(h*pi/180))*180/pi', unit: '^\\circ', digits: 3 },
        { label: 'drift = track − heading', expr: 'atan2(va*sin(h*pi/180) + w, va*cos(h*pi/180))*180/pi - h', unit: '^\\circ', digits: 3 },
      ],
    },
    caption: 'Seen from above, every arrow on one scale in m/s; the grey band is the runway direction. A steady, uniform wind is assumed — real winds gust and change with height.',
  },
  example: {
    prompt: t`An airliner approaches a runway that points due north. The wind blows from the west at 15 m/s, and the approach airspeed is 70 m/s. Which heading keeps the aircraft tracking straight along the runway, and what is its groundspeed?`,
    visual: {
      type: 'graph',
      params: {
        x: [-30, 30], y: [-5, 78], equal: true, xlabel: 'east (m/s)', ylabel: 'north (m/s)',
        curves: [{ param: ['0', 't'], t: [-5, 78], color: 'ink4', width: 6 }],
        arrows: [
          { from: [0, 0], to: [-15, 68.37], color: 'accent', label: 'air, 70 m/s' },
          { from: [-15, 68.37], to: [0, 68.37], color: 'teal' },
          { from: [0, 0], to: [0, 68.37], color: 'gold', label: 'ground' },
        ],
        points: [{ x: -11, y: 63, r: 0.1, color: 'teal', label: 'wind' }],
      },
      caption: 'The wind triangle for the crabbed approach, to scale.',
    },
    steps: [
      { label: 'The vector equation', text: t`$\vec v_\text{ground} = \vec v_\text{air} + \vec v_\text{wind}$, with east $= +x$ and north $= +y$. The wind is $(+15,\ 0)$ m/s.` },
      { label: 'The condition', text: t`To track north, the east component of $\vec v_\text{ground}$ must be zero: $70\sin\alpha$ toward the west must cancel the 15 m/s wind, where $\alpha$ is the angle of the nose west of north.` },
      { label: 'Solve', text: t`$\sin\alpha = \dfrac{15}{70} = 0.214$, so $\alpha = 12.4^\circ$: heading $12.4^\circ$ west of north.` },
      { label: 'Groundspeed', text: t`What is left is the north component: $70\cos 12.4^\circ = 68.4$ m/s, or $\sqrt{70^2 - 15^2} = 68.4$ m/s.` },
      { label: 'Sense check', text: t`The groundspeed is a little less than the airspeed — part of the airspeed is spent cancelling the wind. Pilots hold this “crab” on the approach and straighten the nose just before touchdown.` },
    ],
    answer: t`Head $12.4^\circ$ west of north; the groundspeed is 68.4 m/s.`,
  },
  practice: [
    num({
      id: 'walkway', difficulty: 1,
      gen(r) {
        const w = r.pick([0.8, 1.0, 1.2]), u = r.pick([1.4, 1.5, 1.8, 2.0]), against = r.bool(0.5);
        const v = against ? w - u : w + u;
        return {
          prompt: t`An airport walkway moves at ${nice(w)} m/s toward the gates. A passenger walks at ${nice(u)} m/s relative to the walkway, ${against ? 'back toward the entrance' : 'toward the gates'}. Taking “toward the gates” as positive, what is the passenger’s velocity relative to the floor?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: against ? [{ value: w + u, feedback: 'The passenger walks against the walkway: the two velocities have opposite signs.' }] : [{ value: u - w, feedback: 'Walking with the walkway: the velocities add.' }],
          hints: [t`$v_\text{PF} = v_\text{PW} + v_\text{WF}$: passenger relative to walkway, plus walkway relative to floor.`],
          teach: 'Relative velocities add: velocity relative to the floor = velocity relative to the walkway + walkway relative to the floor.',
          explain: t`$v_\text{PF} = (${against ? '-' : '+'}${nice(u)}) + (+${nice(w)}) = ${nice(v)}$ m/s${v < 0 ? ' — the passenger is moving back toward the entrance' : ''}.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2.6, 3.6], y: [-0.4, 1.9], axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ fn: '0', domain: [-2.6, 3.6], color: 'ink4', width: 5 }],
              arrows: [
                { from: [0, 1.5], to: [w, 1.5], color: 'teal', label: 'walkway' },
                { from: [0, 1.0], to: [against ? -u : u, 1.0], color: 'accent', label: 'walking' },
                { from: [0, 0.5], to: [v, 0.5], color: 'gold', label: 'sum' },
              ],
              points: [{ x: 2.6, y: -0.25, r: 0.1, color: 'ink2', label: 'to the gates →' }],
            },
            caption: 'The velocities as arrows (one scale), with the walkway below.',
          },
        };
      },
    }),
    mcq({
      id: 'swap', difficulty: 1,
      prompt: t`A train moves past a platform at $\vec v_{TP} = +30$ m/s (train relative to platform, east positive). What is $\vec v_{PT}$, the platform’s velocity relative to the train?`,
      choices: ['−30 m/s: from the train, the platform moves west', '+30 m/s: the same, since it is the same motion', '0 m/s: platforms do not move', '+60 m/s'],
      answer: 0,
      why: {
        1: 'Swapping the order of the subscripts reverses the direction: a passenger sees the platform slide backward.',
        2: 'Relative to the ground it does not move — but relative to the train, it does.',
        3: 'Nothing here doubles. The speed is the same 30 m/s; only the direction reverses.',
      },
      hints: [t`$\vec v_{PT} = -\vec v_{TP}$.`],
      teach: 'Reversing the subscripts of a relative velocity reverses its direction: v_AB = −v_BA.',
      explain: t`$\vec v_{PT} = -\vec v_{TP} = -30$ m/s: seen from the train, the platform slides west at 30 m/s.`,
      visual: {
        type: 'graph',
        params: {
          x: [-50, 50], y: [-12, 16], axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ fn: '0', domain: [-45, 45], color: 'ink4', width: 5 }, { param: ['-20 + 40*t', '6'], t: [0, 1], color: 'accent', width: 9 }],
          arrows: [{ from: [20, 6], to: [44, 6], color: 'gold', label: '30 m/s' }],
          points: [{ x: -22, y: 11, r: 0.1, color: 'accent', label: 'train' }, { x: -40, y: -6, r: 0.1, color: 'ink2', label: 'platform' }, { x: 30, y: -6, r: 0.1, color: 'ink2', label: 'east →' }],
        },
        caption: 'The train’s velocity relative to the platform.',
      },
    }),
    num({
      id: 'river-drift', difficulty: 2,
      gen(r) {
        const u = r.pick([2.5, 3, 4, 5]), c = r.pick([1, 1.2, 1.5, 2]), W = r.pick([40, 60, 80, 100]);      // c < u always
        const tt = W / u, d = c * tt;
        return {
          prompt: t`A boat crosses a ${W} m wide river, steering straight across at ${nice(u)} m/s relative to the water. The current flows at ${nice(c)} m/s. How far downstream does it land?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: (c * W) / Math.hypot(u, c), feedback: 'The time to cross comes from the across-river component alone: t = W/u. The current does not slow the crossing.' },
            { value: (u * W) / c, feedback: 'Upside down: the drift is the current’s speed times the crossing time, W/u.' },
          ],
          hints: ['Treat the two directions separately: across the river and along it.', t`Time to cross: $t = W/u$; drift: $c\,t$.`],
          teach: 'Perpendicular components are independent: the crossing time depends only on the speed across, and the current carries the boat downstream meanwhile.',
          explain: t`$t = ${W}/${nice(u)} = ${nice(tt)}$ s, so the drift is $${nice(c)} \times ${nice(tt)} = ${nice(d)}$ m downstream.`,
          visual: {
            type: 'graph',
            params: {
              x: [-10, W + d * 0.5 + 10], y: [-12, W + 12], equal: true, xlabel: 'downstream (m)', ylabel: 'across (m)',
              hlines: [{ y: 0, label: 'bank', color: 'ink3' }, { y: W, label: 'far bank', color: 'ink3' }],
              arrows: [{ from: [0, 0], to: [0, W * 0.4], color: 'accent', label: 'heading' }, { from: [0, 0], to: [W * 0.4 * (c / u), 0], color: 'teal', label: 'current' }],
              points: [{ x: 0, y: 0, color: 'ink' }],
            },
            caption: 'The river seen from above; the velocity arrows share one scale. The landing point is not drawn.',
          },
        };
      },
    }),
    num({
      id: 'upstream', difficulty: 2,
      gen(r) {
        const [u, c] = r.pick([[2, 1], [3, 1.5], [4, 2], [2.5, 1.5], [5, 3]]);
        const a = Math.asin(c / u) / D2R;
        return {
          prompt: t`A boat can do ${nice(u)} m/s relative to the water, and the current is ${nice(c)} m/s. At what angle upstream from the straight-across direction must it steer to cross along a line straight to the opposite point?`,
          answer: a, units: 'deg', tol: { rel: 0.01, abs: 0.2 },
          errors: [{ value: Math.atan(c / u) / D2R, feedback: t`Use $\sin$, not $\tan$: the boat’s full ${nice(u)} m/s is the hypotenuse, and its upstream component must equal the current.` }].filter((e) => Math.abs(e.value - a) > 0.5),
          hints: ['The upstream component of the boat’s velocity must cancel the current.', t`$u\sin\alpha = c$, so $\alpha = \arcsin(c/u)$.`],
          teach: 'To cancel a current, steer so that the upstream component of your velocity equals the current speed.',
          explain: t`$\sin\alpha = ${nice(c)}/${nice(u)} = ${nice(c / u)}$, so $\alpha = ${s3(a)}^\circ$ upstream. It then crosses at $\sqrt{${nice(u)}^2 - ${nice(c)}^2} = ${s3(Math.sqrt(u * u - c * c))}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [-u * 1.4, u * 1.2], y: [-0.4, u * 1.15], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              arrows: [
                { from: [0, 0], to: [-c, Math.sqrt(u * u - c * c)], color: 'accent', label: `boat, ${nice(u)} m/s` },
                { from: [-c, Math.sqrt(u * u - c * c)], to: [0, Math.sqrt(u * u - c * c)], color: 'teal', label: 'current' },
                { from: [0, 0], to: [0, Math.sqrt(u * u - c * c)], color: 'gold' },
              ],
              points: [{ x: 0.15, y: Math.sqrt(u * u - c * c) * 0.5, r: 0.1, color: 'gold', label: 'straight across' }],
            },
            caption: 'The velocity triangle, seen from above; the current flows to the right.',
          },
        };
      },
    }),
    num({
      id: 'crosswind-speed', difficulty: 2,
      gen(r) {
        const va = r.pick([60, 70, 80, 90]), w = r.pick([10, 15, 20, 25]);
        const vg = Math.hypot(va, w);
        return {
          prompt: t`A light aircraft heads due north at an airspeed of ${va} m/s. A ${w} m/s wind blows toward the east. What is its speed over the ground?`,
          answer: vg, units: 'm/s', tol: { rel: 0.005 },
          errors: [
            { value: va + w, feedback: 'The wind is at right angles to the heading: add the vectors with Pythagoras, not as numbers.' },
            { value: va - w, feedback: 'A crosswind is not a headwind: it adds a perpendicular component.' },
          ],
          hints: [t`$\vec v_\text{ground} = \vec v_\text{air} + \vec v_\text{wind}$, and the two are perpendicular.`],
          teach: 'Perpendicular velocities combine by Pythagoras.',
          explain: t`$v_\text{ground} = \sqrt{${va}^2 + ${w}^2} = ${s3(vg)}$ m/s, on a track $${s3(Math.atan(w / va) / D2R)}^\circ$ east of north.`,
          visual: {
            type: 'graph',
            params: {
              x: [-10, 40], y: [-5, va * 1.12], equal: true, xlabel: 'east (m/s)', ylabel: 'north (m/s)',
              arrows: [{ from: [0, 0], to: [0, va], color: 'accent', label: 'air' }, { from: [0, va], to: [w, va], color: 'teal' }, { from: [0, 0], to: [w, va], color: 'gold', label: 'ground' }],
              points: [{ x: w / 2 - 3, y: va + 6, r: 0.1, color: 'teal', label: 'wind' }],
            },
            caption: 'The wind triangle, to scale.',
          },
        };
      },
    }),
    mcq({
      id: 'same-a', difficulty: 2,
      prompt: 'A car speeds up at 2.0 m/s² along a road. A train runs alongside at a constant 30 m/s. What acceleration does a passenger on the train measure for the car?',
      choices: ['2.0 m/s², the same', '32 m/s²', '−28 m/s²', 'Zero, if they happen to be moving at the same speed'],
      answer: 0,
      why: {
        1: 'Speeds and accelerations do not add. The train’s constant velocity shifts every velocity the passenger measures by the same amount — which leaves the changes, and so the acceleration, untouched.',
        2: 'That mixes a velocity with an acceleration; they have different units and cannot be added.',
        3: 'Equal velocities make the relative velocity zero for an instant, not the relative acceleration.',
      },
      hints: [t`$\vec v_\text{car, train} = \vec v_\text{car, road} - \vec v_\text{train, road}$. Differentiate.`, 'The train’s velocity is constant, so its derivative is zero.'],
      teach: 'Frames moving at constant velocity relative to each other measure the same accelerations.',
      explain: t`$\vec v_\text{car, train} = \vec v_\text{car, road} - (30\ \text{m/s})$. The 30 m/s is constant, so differentiating gives the same 2.0 m/s². This is the Galilean principle of relativity for accelerations.`,
      visual: {
        type: 'graph',
        params: {
          x: [-5, 48], y: [-3, 15], axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ fn: '0', domain: [-5, 48], color: 'ink4', width: 4 }, { fn: '9', domain: [-5, 48], color: 'ink4', width: 4 }],
          arrows: [{ from: [0, 11.5], to: [30, 11.5], color: 'accent', label: 'train, 30 m/s' }, { from: [0, 2.5], to: [18, 2.5], color: 'gold', label: 'car, speeding up' }],
          points: [{ x: 0, y: 11.5, color: 'accent' }, { x: 0, y: 2.5, color: 'gold' }],
        },
        caption: 'Seen from above: the train on its track and the car on the road beside it.',
      },
    }),
    num({
      id: 'rain', difficulty: 3,
      gen(r) {
        const vr = r.pick([6, 8, 10]), vc = r.pick([12, 15, 20, 25]);      // vc ≠ vr, so the two angles differ
        const a = Math.atan(vc / vr) / D2R;
        return {
          prompt: t`Rain falls straight down at ${vr} m/s. A car drives through it at ${vc} m/s. At what angle from the vertical do the raindrops streak across the car’s side window?`,
          answer: a, units: 'deg', tol: { rel: 0.01, abs: 0.2 },
          errors: [{ value: Math.atan(vr / vc) / D2R, feedback: 'That is the angle from the horizontal. Measure from the vertical.' }],
          hints: [t`Relative to the car, the rain’s velocity is $\vec v_\text{rain, car} = \vec v_\text{rain, ground} - \vec v_\text{car, ground}$.`, t`That is ${vr} m/s down and ${vc} m/s backward: $\tan\theta = ${vc}/${vr}$ from the vertical.`],
          teach: 'To find what a moving observer sees, subtract the observer’s velocity from the object’s.',
          explain: t`Relative to the car the rain moves ${vr} m/s down and ${vc} m/s backward, so $\theta = \arctan(${vc}/${vr}) = ${s3(a)}^\circ$ from the vertical.`,
          visual: {
            type: 'graph',
            params: {
              x: [-vc * 1.4, vc * 1.4], y: [-vr * 1.25, vr * 0.6], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              arrows: [
                { from: [0, 0], to: [0, -vr], color: 'teal', label: 'rain (ground)' },
                { from: [0, 0], to: [vc, 0], color: 'accent', label: 'car (ground)' },
                { from: [0, 0], to: [-vc, -vr], color: 'gold', label: 'rain (car)' },
              ],
            },
            caption: 'Velocities seen from the roadside, one scale; the car drives to the right.',
          },
        };
      },
    }),
    {
      type: 'slider', id: 'set-crab', difficulty: 2, param: 'h',
      prompt: t`The airspeed is 60 m/s and a 15 m/s wind blows toward the east. Set the heading so that the aircraft tracks straight along the runway (due north).`,
      instruction: 'Turn the heading until the gold ground arrow lies along the runway, then check.',
      answer: [-15.5, -13.5],
      hints: ['The nose must point partly into the wind — west of north.', t`The west component of the air velocity, $60\sin\alpha$, must cancel the 15 m/s wind.`],
      teach: 'To track along a line in a crosswind, crab into the wind until the cross-component of the air velocity cancels it.',
      explain: t`$60\sin\alpha = 15$ gives $\alpha = 14.5^\circ$: a heading of $-14.5^\circ$, that is 14.5° west of north.`,
      visual: {
        type: 'graph',
        params: {
          x: [-30, 30], y: [-4, 66], equal: true, xlabel: 'east (m/s)', ylabel: 'north (m/s)',
          sliders: [{ key: 'h', label: 'Heading', min: -30, max: 30, step: 0.5, value: 0, unit: '^\\circ', explain: 'Degrees east of north (negative is west).' }],
          constants: { va: 60, w: 15 },
          curves: [{ param: ['0', 't'], t: [-4, 66], color: 'ink4', width: 6 }],
          arrows: [
            { from: [0, 0], to: AIR, color: 'accent', label: 'air' },
            { from: AIR, to: GROUND, color: 'teal' },
            { from: [0, 0], to: GROUND, color: 'gold', label: 'ground' },
          ],
          points: [{ x: 'va*sin(h*pi/180) + w/2 - 3', y: 'va*cos(h*pi/180) - 5', r: 0.1, color: 'teal', label: 'wind' }],
        },
        caption: 'The wind triangle seen from above; the grey band is the runway direction.',
      },
    },
  ],
  checkpoint: [
    num({
      id: 'cp-crab', difficulty: 3, transfer: true,
      gen(r) {
        const va = r.pick([60, 65, 70, 75]), w = r.pick([8, 10, 12, 15]);
        const a = Math.asin(w / va) / D2R;
        return {
          prompt: t`A transport aircraft lands on a runway pointing due east, with a ${w} m/s wind blowing from the north (toward the south). Its approach airspeed is ${va} m/s. How many degrees must the nose point into the wind (north of east) for the aircraft to track straight down the runway?`,
          answer: a, units: 'deg', tol: { rel: 0.01, abs: 0.2 },
          errors: [{ value: Math.atan(w / va) / D2R, feedback: t`Use $\sin$: the airspeed is the hypotenuse of the wind triangle, and its cross-runway component must equal the wind.` }].filter((e) => Math.abs(e.value - a) > 0.3),
          hints: ['The cross-runway component of the air velocity must cancel the wind.', t`$v_\text{air}\sin\alpha = w$.`],
          teach: 'The crab angle is arcsin(crosswind / airspeed).',
          explain: t`$\sin\alpha = ${w}/${va}$, so $\alpha = ${s3(a)}^\circ$ north of east; the groundspeed is $\sqrt{${va}^2 - ${w}^2} = ${s3(Math.sqrt(va * va - w * w))}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [-6, va * 1.12], y: [-w * 1.6, w * 2.2], equal: true, xlabel: 'east (m/s)', ylabel: 'north (m/s)',
              curves: [{ fn: '0', domain: [-6, va * 1.12], color: 'ink4', width: 6 }],
              arrows: [{ from: [va * 0.55, w * 1.6], to: [va * 0.55, w * 0.6], color: 'teal', label: `wind, ${w} m/s` }],
            },
            caption: 'The runway direction (grey) and the wind, seen from above.',
          },
        };
      },
    }),
    num({
      id: 'cp-closing', difficulty: 2,
      gen(r) {
        const v1 = r.pick([200, 220, 250]), v2 = r.pick([150, 180, 200]), d = r.pick([30, 40, 50]);
        const tt = (d * 1000) / (v1 + v2);
        return {
          prompt: t`Two aircraft fly straight toward each other on the same line, at ${v1} m/s and ${v2} m/s relative to the ground. They are ${d} km apart. How long until they meet?`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (d * 1000) / Math.abs(v1 - v2), feedback: 'Head-on, the closing speed is the sum of the two speeds, not the difference.' }, { value: d / (v1 + v2), feedback: 'Convert the distance to metres.' }],
          hints: ['In the frame of one aircraft, the other approaches at v₁ + v₂.'],
          teach: 'For objects approaching head-on, the relative (closing) speed is the sum of their speeds.',
          explain: t`The closing speed is $${v1} + ${v2} = ${v1 + v2}$ m/s, so $t = ${d * 1000}/${v1 + v2} = ${s3(tt)}$ s.`,
          visual: {
            type: 'graph',
            params: {
              x: [-4, d + 4], y: [-3, 5], axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ fn: '0', domain: [0, d], color: 'ink4', width: 1, dash: true }],
              arrows: [{ from: [0, 0], to: [d * 0.22, 0], color: 'accent', label: `${v1} m/s` }, { from: [d, 0], to: [d * 0.78, 0], color: 'warn', label: `${v2} m/s` }],
              points: [{ x: 0, y: 0, color: 'accent' }, { x: d, y: 0, color: 'warn' }, { x: d * 0.42, y: -1.6, r: 0.1, color: 'ink2', label: `${d} km` }],
            },
            caption: 'The two aircraft and the gap between them (not to scale).',
          },
        };
      },
    }),
    mcq({
      id: 'cp-coffee', difficulty: 2,
      prompt: 'A flight attendant pours coffee in an airliner cruising straight and level at a steady 250 m/s. Relative to the cabin, the coffee falls:',
      choices: ['Straight down into the cup, just as on the ground', 'Backward toward the tail, at about 250 m/s', 'Forward, ahead of the cup', 'Not at all: at that speed it hangs in the air'],
      answer: 0,
      why: {
        1: 'The coffee already shares the aircraft’s 250 m/s when it leaves the pot. Nothing slows it horizontally, so relative to the cabin it has no sideways motion.',
        2: 'It keeps the same horizontal velocity as the cup; nothing pushes it ahead.',
        3: 'Gravity acts on it just as on the ground; steady flight changes nothing about falling.',
      },
      hints: ['What horizontal velocity does the coffee have as it leaves the pot?', 'Does steady motion of the whole cabin change anything you can see inside it?'],
      teach: 'In a frame moving at constant velocity, everything behaves exactly as at rest — the principle of relativity.',
      explain: t`Pot, coffee and cup all move at 250 m/s; in the cabin’s frame the coffee starts at rest horizontally and falls straight down with $g$. No experiment inside a steadily moving cabin can detect its motion — the principle Einstein later extended to light.`,
      visual: {
        type: 'graph',
        params: {
          x: [-6, 10], y: [-1, 8], axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ fn: '0', domain: [-6, 10], color: 'ink4', width: 3 }, { param: ['-1 + 2*t', '6'], t: [0, 1], color: 'ink3', width: 8 }, { param: ['0.4*cos(t)', '0.7 + 0.5*sin(t)'], t: [3.1416, 6.2832], color: 'ink3', width: 2 }],
          arrows: [{ from: [2, 7.3], to: [8, 7.3], color: 'gold', label: '250 m/s' }],
          points: [{ x: -3.5, y: 7.4, r: 0.1, color: 'ink2', label: 'pot' }, { x: -2.2, y: 1.3, r: 0.1, color: 'ink2', label: 'cup' }],
        },
        caption: 'Inside the cabin (a sketch). The arrow is the cabin’s velocity relative to the ground.',
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §4.5', url: 'https://openstax.org/books/university-physics-volume-1/pages/4-5-relative-motion-in-one-and-two-dimensions' }],
});
