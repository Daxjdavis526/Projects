// Centrifugal and Coriolis forces (Taylor §9.7–9.9): F_cf = m(Ω × r) × Ω,
// outward from the axis with size mΩ²ρ; F_cor = 2mṙ × Ω, sideways to the
// motion (to the right in the northern hemisphere), doing no work. Explored:
// an object dropped inside a spinning station, which lands behind the point
// beneath it (exact: an arc R[Ωt* − arctan Ωt*] with Ωt* = √(R²/r₀² − 1)).
// Worked: a ball dropped 300 m at 45° lands (1/3)Ωgt³cos λ ≈ 8 cm east.
// Practice: horizontal Coriolis 2Ωv sin λ, cyclones turning anticlockwise in
// the north, the station drop, the plumb-line tilt from Earth's centrifugal
// term (≤ 0.1°), running spinward feels heavier, true/false properties.
// Transfer: a projectile fired straight up lands west by (4/3)Ω cos λ v₀³/g²;
// a runner's weight in a station; a southern-hemisphere cyclone.
// Links (not reused): phys3550.M1.1 (the station climber, inertial frame).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct } from './_cm.js';
import { G0, OMEGA_E, R_EQ, ring, disc } from './_cm3.js';

const t = String.raw;
const DEG = Math.PI / 180;

const EX = (() => {
  const h = 300, lat = 45, tt = Math.sqrt((2 * h) / G0);
  const d = (1 / 3) * OMEGA_E * G0 * tt ** 3 * Math.cos(lat * DEG);
  return { h, lat, tt, d };
})();

// the drop inside a station of radius R (m) spinning at W, released from rest at height h above the floor
function stationDrop(R, W, h) {
  const r0 = R - h, wt = Math.sqrt((R * R) / (r0 * r0) - 1);
  return { r0, wt, tstar: wt / W, lag: R * (wt - Math.atan(wt)) };
}

// a low-pressure centre with air drawn inward, seen from above
function cyclonePic({ caption, deflect = false, south = false }) {
  const arrows = [];
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3 + 0.3, r1 = 1.6, r2 = 0.8;
    const bend = deflect ? (south ? 0.45 : -0.45) : 0;
    arrows.push({ from: [r6(r1 * Math.cos(a)), r6(r1 * Math.sin(a))], to: [r6(r2 * Math.cos(a + bend)), r6(r2 * Math.sin(a + bend))], color: 'accent', width: 1.6 });
  }
  return gpic({ x: [-2, 2], y: [-1.9, 1.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [ring(0.45, 'ink3', 1.2, true), ring(1.9, 'ink4', 1, true)], points: [lab(0, 0, 'L', 'warn')], arrows }, caption, 'Air flowing toward a low-pressure centre, seen from above');
}

export default lesson({
  id: 'phys3550.M6.3',
  title: 'Centrifugal and Coriolis forces',
  minutes: 16, difficulty: 3,
  intro: t`In a rotating frame ([M6.2](#/lesson/phys3550.M6.2)) every body feels two extra forces. The **centrifugal** force pushes it straight away from the rotation axis, growing with distance from it; it is the spin gravity of a station and the reason Earth bulges at the equator. The **Coriolis** force acts only on bodies that move in the frame, at right angles to their velocity: on a frame turning anticlockwise (Earth seen from above the north pole) it deflects every motion **to the right**. It is why hurricanes spin, why long-range artillery tables have a correction for latitude, and why a dropped stone lands a little east of the plumb line.`,
  equation: t`\vec F_{\text{cf}} = m(\vec\Omega\times\vec r)\times\vec\Omega, \qquad \vec F_{\text{cor}} = 2m\,\dot{\vec r}\times\vec\Omega`,
  symbols: [
    { tex: '\\vec F_{\\text{cf}}', text: 'the centrifugal force, in N: directly away from the axis, size $m\\Omega^2\\rho$ with $\\rho$ the distance from the axis' },
    { tex: '\\vec F_{\\text{cor}}', text: 'the Coriolis force, in N: perpendicular to both $\\dot{\\vec r}$ and $\\vec\\Omega$, so it never does work' },
    { tex: '\\vec\\Omega', text: 'the frame’s angular velocity, in rad/s; for Earth $7.292\\times10^{-5}$ rad/s along the axis toward the north pole' },
    { tex: '\\vec r,\\ \\dot{\\vec r}', text: 'position and velocity measured in the rotating frame, in m and m/s' },
    { tex: 'm', text: 'the body’s mass, in kg — both forces are proportional to it, like gravity' },
  ],
  why: t`Weather maps, ocean gyres, ballistic tables, inertial navigation and the comfort of a spinning habitat all hinge on these two terms.`,
  visual: {
    type: 'graph',
    title: 'Dropping a ball in a spinning station',
    lead: t`A ring station of radius 100 m spins anticlockwise for $0.5\,g$ at the rim. A crew member lets go of a ball at the height you choose. In the station's frame (default) the ball does not fall straight "down": the Coriolis force pushes it **behind** the point beneath it (green). Switch to the inertial view: it simply flies straight along a tangent.`,
    tasks: [
      t`At 1.5 m (hand height) the ball lands about 18 cm behind the point beneath it — enough to miss a cup.`,
      t`At 30 m the miss is about 22 m: on a small station, "down" is not straight.`,
      t`In the inertial view the floor point beneath the release moves on round while the ball flies straight — it gets there first.`,
    ],
    params: {
      aspect: 'wide', x: [-1.15, 1.15], y: [-1.15, 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      choices: [{ key: 'f', label: 'View from', options: [[1, 'the station'], [0, 'outside (inertial)']], value: 1, explain: 'The station turns anticlockwise at 0.221 rad/s.' }],
      sliders: [{ key: 'h', label: 'Release height $h$', min: 1.5, max: 60, step: 0.5, value: 20, unit: '\\mathrm{m}', explain: 'Above the floor, at rest relative to the station.' }],
      constants: { R: 100 },
      curves: [
        { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2.4 },
        { param: ['(1 - h/R)*cos(sqrt(1/(1 - h/R)^2 - 1)*t) + (1 - h/R)*sqrt(1/(1 - h/R)^2 - 1)*t*sin(sqrt(1/(1 - h/R)^2 - 1)*t)', '-(1 - h/R)*sin(sqrt(1/(1 - h/R)^2 - 1)*t) + (1 - h/R)*sqrt(1/(1 - h/R)^2 - 1)*t*cos(sqrt(1/(1 - h/R)^2 - 1)*t)'], t: [0, 1], color: 'warn', width: 2.2, when: 'step(f - 0.5)' },
        { param: ['1 - h/R', '(1 - h/R)*sqrt(1/(1 - h/R)^2 - 1)*t'], t: [0, 1], color: 'warn', width: 2.2, when: 'step(0.5 - f)' },
        { param: ['(1 - h/R)*cos(sqrt(1/(1 - h/R)^2 - 1)*t)', '(1 - h/R)*sin(sqrt(1/(1 - h/R)^2 - 1)*t)'], t: [0, 1], color: 'ink4', width: 1.2, dash: true, when: 'step(0.5 - f)' },
      ],
      points: [
        { x: '1 - h/R', y: 0, color: 'warn', r: 5, label: 'release', labelDx: -56, labelDy: -10, when: 'step(f - 0.5)' },
        { x: 1, y: 0, color: 'good', r: 5, label: 'beneath', labelDx: 8, labelDy: 0, when: 'step(f - 0.5)' },
        { x: 'cos(sqrt(1/(1 - h/R)^2 - 1))', y: 'sin(sqrt(1/(1 - h/R)^2 - 1))', color: 'good', r: 5, label: 'beneath, at landing', labelDx: 8, labelDy: -8, when: 'step(0.5 - f)' },
        { x: 0, y: 0, color: 'ink3', r: 3 },
      ],
      readouts: [
        { label: 'lands behind by', expr: 'R*(sqrt(1/(1 - h/R)^2 - 1) - atan(sqrt(1/(1 - h/R)^2 - 1)))', unit: '\\mathrm{m}', digits: 3 },
        { label: 'fall time', expr: 'sqrt(1/(1 - h/R)^2 - 1)/0.221435', unit: '\\mathrm{s}', digits: 3 },
      ],
    },
    caption: t`Exact, not a small-height approximation: the ball keeps the tangential speed $\Omega(R - h)$ it had at release and moves in a straight line in the inertial frame; the station-frame path is that line in rotating coordinates. Seen end-on, rim to scale; air drag ignored.`,
  },
  example: {
    prompt: t`A ball is dropped from rest from a ${EX.h} m tower at latitude ${EX.lat}°N. Ignoring air, how far east of the point directly below does it land? ($\Omega = 7.292\times10^{-5}$ rad/s, $g = 9.81$ m/s².)`,
    visual: gpic({ x: [-1.6, 1.6], y: [-0.25, 1.35], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '0', lower: '-0.25', from: -1.6, to: 1.6, color: 'ink4', alpha: 0.35 }], curves: [seg([-0.6, 0], [-0.6, 1.2], 'ink2', 4), seg([-0.6, 1.2], [-0.45, 1.2], 'ink2', 2), { param: ['-0.45 + 0.25*t^3', '1.2*(1 - t^2)'], t: [0, 1], color: 'warn', width: 2, dash: true }, seg([-0.45, 1.2], [-0.45, 0], 'ink4', 1, true)], points: [{ x: -0.45, y: 1.2, color: 'warn', r: 5 }, { x: -0.2, y: 0, color: 'warn', r: 5 }, lab(0.6, 0.65, 'east →', 'ink2')], arrows: [] }, t`The tower seen from the south, east to the right. The deflection is exaggerated about a thousandfold.`, 'A tower with a ball falling slightly eastward'),
    steps: [
      { label: 'Set up', text: t`Local axes: $x$ east, $y$ north, $z$ up. Earth's $\vec\Omega = \Omega(0, \cos\lambda, \sin\lambda)$. To first order the ball falls with $\dot{\vec r} \approx (0, 0, -gt)$.` },
      { label: 'Coriolis', text: t`$2\dot{\vec r}\times\vec\Omega = 2(0, 0, -gt)\times\Omega(0, \cos\lambda, \sin\lambda) = (2\Omega gt\cos\lambda, 0, 0)$: an acceleration due **east**.` },
      { label: 'Integrate', text: t`$\ddot x = 2\Omega gt\cos\lambda$ from rest gives $x = \tfrac13\Omega gt^3\cos\lambda$.` },
      { label: 'Numbers', text: t`Fall time $t = \sqrt{2h/g} = ${sci(EX.tt, 3)}$ s, so $x = \tfrac13(7.292\times10^{-5})(9.81)(${sci(EX.tt, 3)})^3\cos${EX.lat}^\circ = ${sci(EX.d * 100, 3)}$ cm east.` },
      { label: 'Sense check', text: t`Inertially: the top of the tower is farther from Earth's axis than its foot, so it moves east faster, by $\Omega h\cos\lambda$; the ball keeps that extra speed as it falls. Over 8 s at about 1 cm/s that is several cm ✓. Measured by Reich (1831) in a Freiberg mine shaft: 28 mm for a 158 m drop.` },
    ],
    answer: t`About $${sci(EX.d * 100, 2)}$ cm east of the point directly below: $x = \tfrac13\Omega gt^3\cos\lambda$.`,
  },
  practice: [
    num({
      id: 'coriolis-horizontal', difficulty: 2,
      gen(r) {
        const v = r.pick([250, 400, 800]), lat = r.pick([30, 45, 60]);
        const a = 2 * OMEGA_E * v * Math.sin(lat * DEG);
        const what = { 250: 'an airliner cruising', 400: 'a supersonic jet', 800: 'a rifle bullet' }[v];
        return {
          prompt: t`For ${what} at ${v} m/s horizontally at latitude ${lat}°N, what is the size of the horizontal Coriolis acceleration, in m/s²? (Earth's $\Omega = 7.292\times10^{-5}$ rad/s.)`,
          answer: a, units: 'm/s^2', tol: { rel: 0.005 },
          errors: distinct([{ value: 2 * OMEGA_E * v * Math.cos(lat * DEG), feedback: t`For horizontal motion only the **vertical** part of $\vec\Omega$, $\Omega\sin\lambda$, gives a horizontal deflection.` }, { value: OMEGA_E * v * Math.sin(lat * DEG), feedback: t`The Coriolis acceleration has a factor 2: $2\vec v\times\vec\Omega$.` }], a),
          hints: [t`Split $\vec\Omega$ into vertical $\Omega\sin\lambda$ and horizontal (northward) $\Omega\cos\lambda$ parts.`, t`For horizontal $\vec v$, the horizontal deflection comes from the vertical part: $2v\Omega\sin\lambda$.`],
          teach: t`Horizontal motion is deflected sideways at $2\Omega v\sin\lambda$: zero at the equator, largest at the poles.`,
          explain: t`$a = 2\Omega v\sin\lambda = 2(7.292\times10^{-5})(${v})\sin${lat}^\circ = ${sci(a, 3)}$ m/s², to the right of the motion. Small — about $${sci(a / G0, 2)}\,g$ — but it acts steadily, so over long flights or long ranges it adds up.`,
          visual: gpic({ x: [-1.6, 1.6], y: [-1, 1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', arrows: [{ from: [-1, -0.3], to: [0.8, -0.3], color: 'accent', label: 'v', labelDx: 6, labelDy: 0 }, { from: [0, -0.3], to: [0, -0.8], color: 'warn', label: 'Coriolis', labelDx: 6, labelDy: 0 }], points: [lab(-1.3, 0.75, 'N ↑', 'ink2'), lab(0.9, 0.75, 'seen from above', 'ink3')] }, t`Moving east in the northern hemisphere, seen from above: the Coriolis force points to the right of the motion (south). Arrow sizes not to scale.`, 'A velocity arrow and a sideways force arrow'),
        };
      },
    }),
    mcq({
      id: 'cyclone', difficulty: 2,
      prompt: t`Air flows in toward a low-pressure centre in the northern hemisphere. Seen from above, which way does the storm turn?`,
      visual: cyclonePic({ caption: t`Air drawn straight toward a low (L), seen from above, before any deflection. Schematic.` }),
      choices: [t`Anticlockwise: each inflowing stream is deflected to its right, so the air circles the low anticlockwise`, t`Clockwise: the air is deflected to its right, which carries it clockwise`, t`Neither: the Coriolis force only acts on north–south motion`, t`It depends on which way the air was pushed to start the storm, as with water draining from a sink`],
      answer: 0,
      why: { 1: t`Try it: a stream heading north toward the low is turned right, to the east of the centre, and so passes it going anticlockwise round it.`, 2: t`$2\vec v\times\vec\Omega$ acts for any horizontal direction of motion (through $\Omega\sin\lambda$).`, 3: t`For a storm hundreds of km across lasting days, the Coriolis effect dominates. For a sink it is a million times too weak — draining direction is set by how the water was disturbed; that is the myth.` },
      hints: [t`Pick one stream — say one heading north toward the low — and turn it a little to its right. Which side of the centre does it now pass?`],
      teach: t`Air spiralling into a low is deflected right in the north, so northern cyclones turn anticlockwise.`,
      explain: t`Every inflowing stream veers right and misses the centre on the same side, so the whole flow circulates anticlockwise round the low (and clockwise round a high). In balance, the inward pressure force and outward Coriolis force nearly cancel: the geostrophic wind blows along the isobars.`,
    }),
    num({
      id: 'station-drop', difficulty: 3,
      gen(r) {
        const R = r.pick([50, 100, 200]), h = r.pick([1.5, 2, 10]), fg = r.pick([0.5, 1]);
        const W = Math.sqrt((fg * G0) / R), D = stationDrop(R, W, h);
        return {
          prompt: t`In a ring station of radius ${R} m spinning for $${fg}\,g$ at the rim, a crew member releases a tool from rest (relative to the station) ${h} m above the floor. How far from the point directly beneath it does it land, measured along the floor, in cm?`,
          answer: D.lag * 100, units: 'cm', tol: { rel: 0.01 },
          errors: distinct([{ value: 0.01, feedback: t`It does not land straight down: it keeps the tangential speed $\Omega(R - h)$ of its release point, which is slower than the floor's $\Omega R$.` }], D.lag * 100),
          hints: [t`Work in the inertial frame: the tool moves in a straight line at speed $\Omega(R - h)$ along the tangent until it meets the rim.`, t`It travels $\sqrt{R^2 - (R - h)^2}$, taking $t^* = \sqrt{R^2 - (R - h)^2}/\Omega(R - h)$; it lands at angle $\arctan(\Omega t^*)$ while the floor point has turned $\Omega t^*$. The arc between them is $R(\Omega t^* - \arctan\Omega t^*)$.`],
          teach: t`A dropped object in a spinning station lands behind (anti-spinward of) the point beneath it: the Coriolis effect of the station's frame.`,
          explain: t`$\Omega t^* = \sqrt{R^2/(R - h)^2 - 1} = ${sci(D.wt, 3)}$, so the gap is $R(\Omega t^* - \arctan\Omega t^*) = ${sci(D.lag * 100, 3)}$ cm, anti-spinward. For small $h$ this is close to the Coriolis estimate $\tfrac23h\sqrt{2h/R}$.`,
          visual: gpic({ x: [-1.2, 1.2], y: [-1.15, 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [ring(1, 'ink2', 2.4)], points: [{ x: 0.85, y: 0, color: 'warn', r: 5, label: 'release', labelDx: -56, labelDy: -10 }, { x: 1, y: 0, color: 'good', r: 5, label: 'beneath', labelDx: 8, labelDy: 0 }, { x: 0, y: 0, color: 'ink3', r: 3 }] }, t`The station end-on, spinning anticlockwise, with the release point and the point beneath it (height exaggerated).`, 'A ring station with a release point marked'),
        };
      },
    }),
    num({
      id: 'plumb-tilt', difficulty: 3,
      gen(r) {
        const lat = r.pick([20, 35, 45, 60]);
        const a = OMEGA_E ** 2 * R_EQ * Math.cos(lat * DEG);
        const ang = (Math.atan2(a * Math.sin(lat * DEG), G0 - a * Math.cos(lat * DEG)) * 180) / Math.PI;
        return {
          prompt: t`Because of Earth's rotation, a plumb line at latitude ${lat}° does not point at Earth's centre. By what angle does it deviate, in degrees? (Spherical Earth, radius 6378 km, true gravity 9.81 m/s² toward the centre, $\Omega = 7.292\times10^{-5}$ rad/s.)`,
          answer: ang, units: 'deg', tol: { rel: 0.01 },
          errors: distinct([{ value: (Math.atan(a / G0) * 180) / Math.PI, feedback: t`The centrifugal acceleration $\Omega^2\rho$ uses the distance from the **axis**, $\rho = R\cos\lambda$, and only its component perpendicular to the vertical, $\Omega^2R\cos\lambda\sin\lambda$, tilts the line.` }], ang),
          hints: [t`The centrifugal acceleration is $\Omega^2R\cos\lambda$, pointing away from the axis (horizontally outward).`, t`Split it into a part along the local vertical ($\Omega^2R\cos^2\lambda$) and a part along the ground toward the equator ($\Omega^2R\cos\lambda\sin\lambda$); the tilt is $\arctan$ of that sideways part over $g$ minus the vertical part.`],
          teach: t`Earth's centrifugal term tilts effective gravity toward the equator by up to about a tenth of a degree, at 45°.`,
          explain: t`$\Omega^2R\cos\lambda = ${sci(a, 3)}$ m/s²; its sideways part $${sci(a * Math.sin(lat * DEG), 3)}$ m/s² against $${sci(G0 - a * Math.cos(lat * DEG), 4)}$ m/s² downward gives $${sci(ang, 3)}^\circ$. Over geological time Earth's shape relaxed to be perpendicular to this effective gravity — the equatorial bulge, 21 km.`,
          visual: gpic({ x: [-1.6, 1.6], y: [-1.15, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(1, 'accent', 0.3)], curves: [seg([0, -1.15], [0, 1.2], 'ink3', 1.2, true), seg([0, 0], [r6(Math.cos(lat * DEG)), r6(Math.sin(lat * DEG))], 'ink3', 1)], points: [{ x: r6(Math.cos(lat * DEG)), y: r6(Math.sin(lat * DEG)), color: 'warn', r: 5 }, lab(0.08, 1.18, 'Ω', 'accent', 8, 0)], arrows: [{ from: [r6(Math.cos(lat * DEG)), r6(Math.sin(lat * DEG))], to: [r6(Math.cos(lat * DEG) + 0.4), r6(Math.sin(lat * DEG))], color: 'gold', label: 'centrifugal', labelDx: 6, labelDy: 0 }] }, t`Earth side-on, axis vertical: the centrifugal acceleration at latitude $\lambda$ points straight away from the axis (gold, size hugely exaggerated).`, 'Earth with a centrifugal arrow at one latitude'),
        };
      },
    }),
    mcq({
      id: 'run-spinward', difficulty: 2,
      prompt: t`An astronaut on a spinning ring station runs along the rim in the direction of the spin. Does she feel heavier, lighter or the same?`,
      visual: gpic({ x: [-1.5, 1.5], y: [-1.2, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [ring(1, 'ink2', 2.4), { param: ['1.22*cos(t)', '1.22*sin(t)'], t: [0.45, 0.95], color: 'accent', width: 1.6 }], points: [{ x: 0, y: -1, color: 'warn', r: 6, label: 'runner', labelDx: 8, labelDy: 14 }, lab(1.1, 1.0, 'Ω', 'accent')], arrows: [{ from: [r6(1.22 * Math.cos(0.9)), r6(1.22 * Math.sin(0.9))], to: [r6(1.22 * Math.cos(1.2)), r6(1.22 * Math.sin(1.2))], color: 'accent' }, { from: [0, -1], to: [0.45, -1], color: 'warn', label: 'run', labelDx: 6, labelDy: 0 }] }, t`The station end-on, spinning anticlockwise; the runner at the bottom moves the same way as the spin.`, 'A runner on the rim of a spinning station'),
      choices: [t`Heavier: the Coriolis force $2m\dot{\vec r}\times\vec\Omega$ points outward, toward the floor`, t`Lighter: running adds to her speed, so she is "flung" less`, t`The same: running along the floor does not change her distance from the axis`, t`Heavier only while she speeds up`],
      answer: 0,
      why: { 1: t`Faster round the axis means more centripetal force is needed, and that comes from the floor: she presses harder.`, 2: t`The centrifugal force is unchanged, but the Coriolis force is not zero for a moving body: with $\dot{\vec r}$ along the spin, $\dot{\vec r}\times\vec\Omega$ points outward.`, 3: t`It lasts as long as she runs at that speed.` },
      hints: [t`In the inertial frame, how fast is she circling the axis now? What centripetal force does that need?`],
      teach: t`Moving spinward in a rotating station adds an outward Coriolis force: you feel heavier; anti-spinward, lighter.`,
      explain: t`Inertially she circles at $R\Omega + v$, needing $m(R\Omega + v)^2/R$ from the floor. In the station's frame that is $mR\Omega^2$ (centrifugal) $+ 2m\Omega v$ (Coriolis) $+ mv^2/R$ (ordinary centripetal for running on a curved floor).`,
    }),
    multi({
      id: 'properties', difficulty: 2,
      prompt: t`Which statements about the Coriolis and centrifugal forces on Earth are true?`,
      visual: cyclonePic({ deflect: true, caption: t`Northern-hemisphere inflow toward a low, each stream deflected to its right (schematic).` }),
      choices: [
        t`The Coriolis force does no work, because it is always perpendicular to the velocity`,
        t`A body at rest on the ground feels the centrifugal force but no Coriolis force`,
        t`Vertical motion is deflected too: a falling stone drifts east`,
        t`The centrifugal force points away from Earth's centre`,
        t`At the equator the Coriolis force on horizontal motion is at its largest`,
      ],
      answer: [0, 1, 2],
      why: { 3: t`It points away from the **axis**: horizontally outward, perpendicular to $\vec\Omega$ — toward the centre's direction only at the equator.`, 4: t`Horizontal deflection goes as $\Omega\sin\lambda$: zero at the equator, largest at the poles.` },
      hints: [t`Look at the cross products: $\dot{\vec r}\times\vec\Omega$ and $(\vec\Omega\times\vec r)\times\vec\Omega$. What are they perpendicular to?`],
      teach: t`Coriolis: velocity-dependent, sideways, workless. Centrifugal: position-dependent, away from the axis.`,
      explain: t`$2m\dot{\vec r}\times\vec\Omega$ is perpendicular to $\dot{\vec r}$ (no work) and vanishes when $\dot{\vec r} = 0$; with $\vec\Omega$ tilted at mid-latitudes it deflects vertical motion east–west too. $(\vec\Omega\times\vec r)\times\vec\Omega$ points away from the axis, not from the centre.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-vertical-shot', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([500, 1000, 2000]), lat = r.pick([30, 45, 52]);
        const v0 = Math.sqrt(2 * G0 * h), dx = (4 / 3) * OMEGA_E * Math.cos(lat * DEG) * v0 ** 3 / G0 ** 2;
        return {
          prompt: t`A small test projectile is fired straight up at latitude ${lat}°N, rises ${h} m and falls back. Ignoring air (and the slight fall of $g$ with height), its Coriolis drift is $\Delta x = \tfrac43\Omega\cos\lambda\,v_0^3/g^2$. How far from the launch point does it land, in m, and which way?`,
          answer: dx, units: 'm', tol: { rel: 0.01 },
          errors: distinct([{ value: (1 / 3) * OMEGA_E * G0 * (Math.sqrt((2 * h) / G0)) ** 3 * Math.cos(lat * DEG), feedback: t`That is the eastward drift of a drop from ${h} m. On the way up the drift is westward and larger; the net result is westward, $\tfrac43\Omega\cos\lambda\,v_0^3/g^2$.` }], dx),
          hints: [t`$v_0 = \sqrt{2gh}$.`, t`Substitute into $\tfrac43\Omega\cos\lambda\,v_0^3/g^2$.`],
          teach: t`Vertical motion is deflected east–west: rising drifts west, falling drifts east, and a vertical shot lands west of its launch point.`,
          explain: t`$v_0 = \sqrt{2(9.81)(${h})} = ${sci(v0, 3)}$ m/s, so $\Delta x = ${sci(dx, 3)}$ m, **west**. Rising, the projectile moves up into regions that turn eastward faster than it does, so it lags west; falling only partly recovers. Sounding rockets and artillery tables include this correction.`,
          visual: gpic({ x: [-1.6, 1.6], y: [-0.2, 1.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '0', lower: '-0.2', from: -1.6, to: 1.6, color: 'ink4', alpha: 0.35 }], curves: [seg([0, 0], [0, 1.25], 'ink4', 1, true)], points: [{ x: 0, y: 0, color: 'warn', r: 6, label: 'launch', labelDx: 8, labelDy: 10 }, lab(1.1, 0.6, 'east →', 'ink2'), lab(-1.1, 0.6, '← west', 'ink2')], arrows: [{ from: [0, 0.05], to: [0, 0.8], color: 'warn', label: 'v₀', labelDx: 6, labelDy: 0 }] }, t`The launch seen from the south, east to the right. Not to scale.`, 'A projectile fired straight up'),
        };
      },
    }),
    num({
      id: 'cp-runner', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([50, 100, 225]), v = r.pick([3, 5]);
        const W = Math.sqrt(G0 / R), ratio = (R * W + v) ** 2 / R / (R * W * W);
        return {
          prompt: t`A ring station of radius ${R} m spins to give $1\,g$ at the rim. An astronaut runs along the rim at ${v} m/s in the direction of spin. By what factor is her apparent weight multiplied?`,
          answer: ratio, tol: { rel: 0.005 },
          errors: distinct([{ value: (R * W - v) ** 2 / R / (R * W * W), feedback: t`That is for running against the spin. Running spinward, she circles the axis faster, at $R\Omega + v$.` }, { value: 1 + (2 * v) / (R * W), feedback: t`That keeps the Coriolis term but drops the small $v^2/R$ term. Exactly: $(R\Omega + v)^2/R\,\div\,R\Omega^2$.` }], ratio),
          hints: [t`In the inertial frame she circles at speed $R\Omega + v$, so the floor must push $m(R\Omega + v)^2/R$.`, t`Divide by her standing weight $mR\Omega^2$.`],
          teach: t`Running spinward adds an outward Coriolis term $2m\Omega v$: on a small station it is a large fraction of the weight.`,
          explain: t`$\Omega = \sqrt{9.81/${R}} = ${sci(W, 3)}$ rad/s, rim speed $${sci(R * W, 3)}$ m/s; the factor is $(${sci(R * W, 3)} + ${v})^2/${sci(R * W, 3)}^2 = ${sci(ratio, 3)}$. Designers want stations big enough that walking does not change weight noticeably.`,
          visual: gpic({ x: [-1.5, 1.5], y: [-1.2, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [ring(1, 'ink2', 2.4)], points: [{ x: 0, y: -1, color: 'warn', r: 6, label: 'runner', labelDx: 8, labelDy: 14 }], arrows: [{ from: [0, -1], to: [0.45, -1], color: 'warn', label: 'run, spinward', labelDx: 6, labelDy: 0 }] }, t`The station end-on (spin anticlockwise), with the runner on the rim. Not to scale.`, 'A runner on a spinning ring station'),
        };
      },
    }),
    mcq({
      id: 'cp-south', difficulty: 2, transfer: true,
      prompt: t`Tropical cyclones near Australia (southern hemisphere) are seen by satellites from above. Which way do they turn?`,
      visual: cyclonePic({ caption: t`Air drawn toward a low (L), seen from above, before deflection. Schematic.` }),
      choices: [t`Clockwise: in the south the vertical part of $\vec\Omega$ points down, so streams are deflected to their left`, t`Anticlockwise, as in the north: Earth spins the same way everywhere`, t`They do not turn: the Coriolis effect cancels across the equator`, t`Randomly, depending on how each storm formed`],
      answer: 0,
      why: { 1: t`Earth spins the same way, but seen from above a southern site the local vertical component $\Omega\sin\lambda$ has the opposite sign ($\lambda < 0$).`, 2: t`Only exactly at the equator does the horizontal deflection vanish — which is why cyclones do not form within about 5° of it.`, 3: t`Storm-sized flows are dominated by the Coriolis effect: southern cyclones all turn clockwise.` },
      hints: [t`The horizontal deflection goes as $\Omega\sin\lambda$. What is its sign for $\lambda < 0$?`],
      teach: t`South of the equator the Coriolis deflection is to the left, so cyclones turn clockwise.`,
      explain: t`$\sin\lambda < 0$ flips the horizontal deflection to the left: inflow circles clockwise. With deflection vanishing at the equator, no hurricane has ever crossed it.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §9.7–9.9: centrifugal force, Coriolis force, free fall', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'A. Persson, “How do we understand the Coriolis force?”, Bull. Amer. Meteor. Soc. 79, 1373 (1998)', url: 'https://doi.org/10.1175/1520-0477(1998)079<1373:HDWUTC>2.0.CO;2' },
  ],
});
