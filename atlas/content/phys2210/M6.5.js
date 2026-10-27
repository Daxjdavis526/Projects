// Drag and terminal velocity: quadratic drag ½ρC_D A v² grows until it balances the weight.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, force, bodyFBD, s3 } from './_forces.js';

const t = String.raw;

const RHO = 1.2;                                   // air near the ground, kg/m³ (the problems say so)
const vtOf = (m, CdA, rho = RHO) => Math.sqrt((2 * m * G) / (rho * CdA));
const spanOf = (vt) => Math.max(4, Math.ceil((5.5 * vt) / G / 2) * 2);   // the drag sim's own time span
const near = (a, b) => Math.abs(a - b) <= 0.02 * Math.abs(b);
const keep = (answer, errors) => errors.filter((e) => !near(e.value, answer));

// a fall from rest in the drag sim, caught when the speed is the fraction q of terminal (q = 1: the end of the graph)
function fall({ m, CdA, rho = RHO, q = 1, icon = 'skydiver', ...rest }, caption) {
  const vt = vtOf(m, CdA, rho), T = spanOf(vt);
  const time = q >= 1 ? T : +((vt / G) * Math.atanh(q)).toFixed(4);
  return { type: 'mech-drag', params: { m, CdA: +CdA.toPrecision(8), rho, icon, T, time, ...rest }, ...(caption ? { caption } : {}) };
}
// terminal speed against altitude for an 80 kg body whose sea-level terminal speed (ρ = 1.225 kg/m³) is vt0
function altitudeView({ vt0, alt, altMax, sound = false }, caption) {
  const m = 80, CdA = (2 * m * G) / (1.225 * vt0 * vt0);
  return { type: 'mech-drag', params: { show: 'altitude', m, CdA: +CdA.toPrecision(8), alt, altMax, sound, ask: true }, caption };
}
// US Standard Atmosphere 1976 densities (kg/m³), as in the drag sim, and the speed of sound there (m/s)
const AIR = { 5: 0.7364, 10: 0.4135, 15: 0.1948, 20: 0.08891, 25: 0.04008, 30: 0.01841 };
const SOUND = { 20: 295, 25: 298, 30: 302 };

export default lesson({
  id: 'phys2210.M6.5',
  title: 'Drag and terminal velocity',
  minutes: 11, difficulty: 2,
  intro: t`Anything moving through air has to shove air out of its way, and the air shoves back: a **drag** force that points against the motion. For anything from a raindrop to an airliner it grows with the *square* of the speed:

$$D = \tfrac12\,\rho\,C_D A\,v^2$$

A body dropped from rest speeds up until the drag matches its weight; from then on the net force is zero and it falls at a steady **terminal speed**, $v_t = \sqrt{2mg/(\rho C_D A)}$ — about 55 m/s (200 km/h) for a skydiver spread flat, about 5 m/s under a parachute. Tiny, slow things such as fog droplets feel a drag proportional to $v$ instead.`,
  symbols: [
    { tex: 'D', text: 'the drag force, in N, pointing against the velocity relative to the air' },
    { tex: '\\rho', text: 'the density of the air, in kg/m³: about 1.2 near the ground, a few hundredths at 25–30 km' },
    { tex: 'C_D', text: 'the drag coefficient, a pure number set by the shape: about 0.3 for a car, 0.5 for a ball, around 1 for a blunt body' },
    { tex: 'A', text: 'the frontal area facing the flow, in m²; together, $C_D A$ is the “drag area”' },
    { tex: 'v', text: 'the speed through the air, in m/s' },
    { tex: 'v_t', text: 'the terminal speed, in m/s: the speed at which drag equals the weight' },
    { tex: 'm', text: 'the falling body’s mass, in kg' },
    { tex: 'g', text: 'the gravitational acceleration, 9.8 m/s²' },
  ],
  why: 'Terminal speed decides how big a parachute must be to land a capsule gently, how hard hail hits, and how a jumper from the stratosphere broke the sound barrier — and drag is most of what a car’s engine works against on the highway.',
  visual: {
    type: 'mech-drag',
    title: 'A skydiver falling from rest',
    lead: t`A skydiver steps out of a plane. On the left: her weight and the air’s drag on her, drawn to one scale. On the right: her speed against time. Press **Play** and watch the drag arrow grow until it matches her weight.`,
    tasks: [
      'Press Play: the speed climbs ever more slowly toward about 55 m/s (200 km/h), where the drag arrow has grown to match the weight.',
      'Switch to Head down: with less drag area she falls faster, about 76 m/s. Then open the canopy: under 6 m/s.',
      'Raise the altitude to 30 km: the air there is 67 times thinner, and the terminal speed is about 8 times higher (450 m/s), faster than sound.',
    ],
    params: { m: 80, CdA: 0.42, alt: 0, postures: true, sliders: ['m', 'alt'] },
    caption: t`An 80 kg skydiver with gear. The drag areas — about 0.42 m² flat, 0.22 m² head down, 40 m² under a round canopy — are typical values, not measurements of one person. Drag is $\tfrac12\rho C_D A v^2$ with the air density held at its value for the chosen altitude; a real fall from high up meets thicker air as it descends. $g = 9.8\ \text{m/s}^2$.`,
  },
  example: {
    prompt: t`An 80 kg skydiver (mass including gear) falls belly to earth. Her drag area is $C_D A = 0.42$ m² and the air density is 1.2 kg/m³. (a) What is her terminal speed? (b) What is her acceleration when she is falling at half that speed?`,
    visual: fall({ m: 80, CdA: 0.42, q: 0.5 }, 'At half her terminal speed the drag is a quarter of her weight. Arrows to scale.'),
    steps: [
      { label: 'Forces', text: t`Two forces act: her weight $mg = (80)(9.8) = 784$ N down, and drag $D = \tfrac12\rho C_D A v^2$ up. At the start $v = 0$, so there is no drag and she accelerates at $g$.` },
      { label: 'Terminal speed', text: t`She stops speeding up when the net force is zero, $\tfrac12\rho C_D A v_t^2 = mg$. So $v_t = \sqrt{\dfrac{2mg}{\rho C_D A}} = \sqrt{\dfrac{2(80)(9.8)}{(1.2)(0.42)}} = 55.8$ m/s.` },
      { label: 'Half speed', text: t`Drag goes as $v^2$, so at $v_t/2$ it is $(1/2)^2 = 1/4$ of its terminal value: $D = 784/4 = 196$ N. The net force is $784 - 196 = 588$ N down, and $a = 588/80 = 7.35$ m/s².` },
      { label: 'Sense check', text: t`55.8 m/s is 201 km/h — the familiar “about 200 km/h” (120 mph) of a belly-down skydive. At half that speed she still accelerates at three quarters of $g$: drag only takes over near the end.` },
    ],
    answer: t`(a) $v_t = 55.8$ m/s, about 200 km/h. (b) $a = 7.35$ m/s², three quarters of $g$.`,
  },
  practice: [
    mcq({
      id: 'at-terminal', difficulty: 1,
      prompt: 'A skydiver is falling belly to earth at a steady 55 m/s. How does the upward drag on her compare with her weight?',
      visual: fall({ m: 80, CdA: 0.42, rho: 1.225, show: 'graph' }, 'Her speed against time since she jumped. By the end of the graph the curve is flat.'),
      choices: [
        'Drag equals her weight, so the net force on her is zero',
        'Drag is slightly less than her weight: a small net force is needed to keep her moving down',
        'Drag is greater than her weight: that is what stops her speeding up',
        'There is no drag once her speed is steady: drag acts only while she accelerates',
      ],
      answer: 0,
      why: {
        1: 'A steady velocity needs no net force (the first law). With any net downward force she would still be speeding up.',
        2: 'If drag were greater than her weight, the net force would point up and she would slow down. To stop speeding up, the net force only has to be zero.',
        3: 'Drag depends on her speed through the air, not on her acceleration. At 55 m/s it is large: her whole weight.',
      },
      hints: ['Her speed is not changing. What does that say about her acceleration, and so about the net force?'],
      teach: 'At terminal speed the acceleration is zero, so drag exactly balances the weight.',
      explain: 'Constant velocity means zero acceleration, so by Newton’s second law the net force is zero: drag up equals weight down. That balance is what defines terminal speed.',
    }),
    num({
      id: 'vt-compute', difficulty: 2,
      gen(r) {
        const m = r.pick([60, 70, 80, 90, 100, 110]), CdA = r.pick([0.35, 0.4, 0.45, 0.5]);
        const v = vtOf(m, CdA);
        return {
          prompt: t`A skydiver of mass ${m} kg (with gear) falls belly to earth with a drag area $C_D A = ${CdA}$ m². The air density is 1.2 kg/m³. What is her terminal speed?`,
          visual: fall({ m, CdA, ask: true }, 'At terminal speed: drag balances weight (left, to scale) and the speed has levelled off (right).'),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: keep(v, [
            { value: v / Math.SQRT2, feedback: t`Keep the 2: setting $\tfrac12\rho C_D A v_t^2 = mg$ gives $v_t^2 = 2mg/(\rho C_D A)$.` },
            { value: v / Math.sqrt(G), feedback: 'Balance the drag against the weight mg, not the mass.' },
            { value: v * v, feedback: t`That is $v_t^2$. Take the square root.` },
          ]),
          hints: [t`At terminal speed, drag balances weight: $\tfrac12\rho C_D A v_t^2 = mg$.`],
          teach: 'Terminal speed comes from setting drag equal to weight: v_t = √(2mg/(ρC_D A)).',
          explain: t`$v_t = \sqrt{\dfrac{2mg}{\rho C_D A}} = \sqrt{\dfrac{2(${m})(9.8)}{(1.2)(${CdA})}} = ${s3(v)}$ m/s, about ${Math.round(v * 3.6)} km/h.`,
        };
      },
    }),
    num({
      id: 'accel-fraction', difficulty: 2,
      gen(r) {
        const vt = r.pick([40, 50, 60]), f = r.pick([0.25, 0.5, 0.6, 0.75, 0.8, 0.9]);
        const v = +(f * vt).toFixed(4), a = G * (1 - f * f);
        return {
          prompt: t`A skydiver’s terminal speed is ${vt} m/s. What is her acceleration at the moment she is falling at ${v} m/s?`,
          visual: fall({ m: 80, CdA: (2 * 80 * G) / (RHO * vt * vt), q: f, quiet: true }, 'That moment: her weight and the drag, to scale (left), and her place on the speed curve (right).'),
          answer: a, units: 'm/s²', tol: { rel: 0.01, abs: 0.01 },
          errors: keep(a, [
            { value: G * (1 - f), feedback: t`Drag grows as $v^2$, not $v$: at ${f} of the terminal speed it is $${f}^2 = ${s3(f * f)}$ of the weight.` },
            { value: G * f * f, feedback: 'That is the drag per kilogram, which points up. Her acceleration is what is left of g after it.' },
            { value: G, feedback: 'Drag is already acting at this speed and cancels part of the weight.' },
          ]),
          hints: [t`Drag is proportional to $v^2$ and equals $mg$ at $v_t$, so at speed $v$ it is $D = mg\,(v/v_t)^2$.`],
          teach: 'Drag scales as v², so at a fraction f of terminal speed it is f² of the weight, and a = g(1 − f²).',
          explain: t`$D/mg = (v/v_t)^2 = (${v}/${vt})^2 = ${s3(f * f)}$, so $a = g\,(1 - ${s3(f * f)}) = ${s3(a)}$ m/s², downward.`,
        };
      },
    }),
    mcq({
      id: 'chute-opens', difficulty: 2,
      prompt: 'A skydiver falling at 55 m/s opens her parachute. While the canopy is opening and she is still moving down fast, which way does she accelerate?',
      visual: bodyFBD([], { icon: 'skydiver', chute: true, show: 'picture', v: [0, -1], status: 'The canopy is opening', caption: 'A moment after the canopy starts to open: she is still falling at about 55 m/s.' }),
      choices: [
        'Upward: drag is now larger than her weight, so she slows down while still moving down',
        'Downward: she is still falling, so the net force must point down',
        'Upward, and she briefly moves upward too, as films of parachute openings show',
        'Not at all: she is at terminal speed until she lands',
      ],
      answer: 0,
      why: {
        1: 'Acceleration points the way the velocity is changing, not the way she moves. Her downward speed is dropping, so she accelerates upward.',
        2: 'Those films are shot by a camera flyer who is still falling at 55 m/s: next to him she seems to shoot up. Relative to the ground she keeps moving down, only more slowly.',
        3: 'Her terminal speed has just changed. With the canopy’s huge drag area, 55 m/s is far above the new terminal speed, so drag exceeds her weight.',
      },
      hints: ['Compare the drag on an open canopy at 55 m/s with her weight.'],
      teach: 'Acceleration points the way the velocity changes: a body slowing down while it falls accelerates upward.',
      explain: 'With the canopy open, the drag at 55 m/s is far more than her weight — for a fully open canopy around ninety times more, which is why canopies are made to open over a few seconds. The net force points up, so she decelerates while still moving down, until drag has fallen back to her weight at about 5 m/s.',
    }),
    mcq({
      id: 'heavier', difficulty: 2,
      prompt: 'Two balls of the same size and shape are dropped from a tall tower: a hollow plastic one, and a solid one four times as heavy. How do their terminal speeds compare?',
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-3, 3], y: [-1.75, 0.85], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          alt: 'Two balls of the same size with drag and weight arrows',
          points: [
            { x: -1.3, y: 0, r: 13, color: 'accent', label: 'light ball', labelDx: 20, labelDy: 0 },
            { x: 1.1, y: 0, r: 13, color: 'accent', label: 'heavy ball', labelDx: 20, labelDy: 0 },
          ],
          arrows: [
            { from: [-1.3, 0.2], to: [-1.3, 0.6], color: 'warn', label: 'D', labelDx: 8, labelDy: 0 },
            { from: [-1.3, -0.2], to: [-1.3, -0.6], color: 'ink2', label: 'mg', labelDx: 8, labelDy: 0 },
            { from: [1.1, 0.2], to: [1.1, 0.6], color: 'warn', label: 'D', labelDx: 8, labelDy: 0 },
            { from: [1.1, -0.2], to: [1.1, -1.6], color: 'ink2', label: '4mg', labelDx: 8, labelDy: 0 },
          ],
        },
        caption: 'Both balls at the light ball’s terminal speed, to scale: the same drag on each (same size, shape and speed), but the heavy ball’s weight is four times larger, so it is still speeding up.',
      },
      choices: [
        'The heavy ball’s terminal speed is twice the light ball’s',
        'They are the same: in free fall all bodies speed up at the same rate',
        'The heavy ball’s terminal speed is four times the light ball’s',
        'They are the same: drag depends only on size, shape and speed, not on mass',
      ],
      answer: 0,
      why: {
        1: 'That holds with no air. With drag, each ball stops speeding up when drag equals its own weight, and the heavy ball needs more drag.',
        2: 'It needs four times the drag, but drag grows as v², so twice the speed is enough.',
        3: 'Drag itself does not depend on mass, but terminal speed does: it is the speed at which drag equals the weight.',
      },
      hints: ['At terminal speed, drag equals the weight. How much faster must the heavy ball go to feel four times the drag?'],
      teach: 'For bodies of the same size and shape, terminal speed grows as √m: heavy bodies do fall faster through air.',
      explain: t`Each ball stops speeding up when $\tfrac12\rho C_D A v_t^2 = mg$, so $v_t \propto \sqrt{m}$ for the same size and shape. Four times the mass gives $\sqrt4 = 2$ times the terminal speed. Galileo was right that both fall alike — in a vacuum.`,
    }),
    num({
      id: 'canopy-cda', difficulty: 3,
      gen(r) {
        const m = r.pick([70, 80, 90, 100, 110]), v = r.pick([4, 5, 6]);
        const CdA = (2 * m * G) / (RHO * v * v), area = CdA / 0.8, D = 2 * Math.sqrt(area / Math.PI);
        return {
          prompt: t`A skydiver of mass ${m} kg (with gear) wants to come down at no more than ${v} m/s, falling straight down under a round parachute. Near the ground the air density is 1.2 kg/m³. What drag area $C_D A$ must the canopy provide?`,
          visual: fall({ m, CdA, show: 'both' }, 'Under the canopy at the landing speed: drag balances weight. Arrows to scale.'),
          answer: CdA, units: 'm²', tol: { rel: 0.01 },
          errors: keep(CdA, [
            { value: (m * G) / (RHO * v * v), feedback: t`Keep the factor 2 from $\tfrac12\rho C_D A v^2$.` },
            { value: (2 * m * G) / (RHO * v), feedback: 'Drag grows as v²: square the speed.' },
            { value: (2 * m) / (RHO * v * v), feedback: 'Balance the drag against her weight mg, not her mass.' },
          ]),
          hints: ['At the landing speed she is at terminal speed: drag equals weight.', t`Solve $\tfrac12\rho\,(C_D A)\,v^2 = mg$: $C_D A = \dfrac{2mg}{\rho v^2}$.`],
          teach: 'A parachute is sized so that its drag at the landing speed equals the weight it carries.',
          explain: t`$C_D A = \dfrac{2mg}{\rho v^2} = \dfrac{2(${m})(9.8)}{(1.2)(${v})^2} = ${s3(CdA)}$ m². With $C_D \approx 0.8$, typical of a round canopy, that is about ${Math.round(area)} m² of canopy, roughly ${Math.round(D)} m across.`,
        };
      },
    }),
    num({
      id: 'altitude', difficulty: 2,
      gen(r) {
        const vt0 = r.pick([50, 55, 60]), alt = r.pick([5, 10, 15]), rho = AIR[alt];
        const v = vt0 * Math.sqrt(1.225 / rho);
        return {
          prompt: t`A skydiver’s terminal speed near sea level, where the air density is 1.225 kg/m³, is ${vt0} m/s. On a high-altitude jump she falls through the air at ${alt} km, where the density is ${rho} kg/m³. What is her terminal speed there, in the same posture?`,
          visual: altitudeView({ vt0, alt, altMax: 16 }, 'Terminal speed for the same body at each altitude (US Standard Atmosphere densities; drag area held fixed).'),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: keep(v, [
            { value: vt0 * (1.225 / rho), feedback: t`Terminal speed goes as $1/\sqrt{\rho}$: take the square root of the density ratio.` },
            { value: vt0 * Math.sqrt(rho / 1.225), feedback: 'Thinner air gives less drag at each speed, so she must fall faster to balance her weight, not slower.' },
            { value: vt0, feedback: 'Terminal speed depends on the air density: thinner air means less drag at each speed.' },
          ]),
          hints: [t`In $v_t = \sqrt{2mg/(\rho C_D A)}$ only $\rho$ changes, so $v_t \propto 1/\sqrt{\rho}$.`],
          teach: 'Terminal speed scales as 1/√ρ: the thinner the air, the faster the fall.',
          explain: t`$v_t = ${vt0}\sqrt{\dfrac{1.225}{${rho}}} = ${s3(v)}$ m/s. As she descends into thicker air, drag exceeds her weight and she slows back toward ${vt0} m/s.`,
        };
      },
    }),
    num({
      id: 'fog-droplet', difficulty: 2,
      gen(r) {
        const rum = r.pick([5, 10, 20]), R = rum * 1e-6, eta = 1.8e-5;
        const v = (2 * 1000 * G * R * R) / (9 * eta), vmm = v * 1000;
        return {
          prompt: t`A fog droplet is a sphere of water (density 1000 kg/m³) of radius ${rum} μm. It is so small and slow that the air’s drag on it is proportional to its speed, given by Stokes’s law $D = 6\pi\eta r v$, where $\eta = 1.8\times10^{-5}$ Pa·s is the viscosity of air. What is its terminal speed, in mm/s?`,
          visual: bodyFBD([force('mg', 1, 270, 'weight'), force('D = 6πηrv', 1, 90, 'drag')], { icon: 'ball', show: 'both', v: [0, -1], name: 'Forces on the droplet', caption: 'At terminal speed the droplet’s Stokes drag balances its weight. Not to scale: the droplet is far too small to see.' }),
          answer: vmm, units: 'mm/s', tol: { rel: 0.01 },
          errors: keep(vmm, [
            { value: v, feedback: 'That is in m/s. Give the answer in mm/s.' },
            { value: vmm * (9 / (12 * Math.PI)), feedback: t`The droplet’s mass is its density times its volume, $\tfrac43\pi r^3$.` },
            { value: vmm * 4, feedback: t`$r$ is the radius, ${rum} μm, not the diameter.` },
          ]),
          hints: [t`At terminal speed $6\pi\eta r v_t = mg$, with $m = \rho_w \cdot \tfrac43\pi r^3$.`, t`So $v_t = \dfrac{2\rho_w g r^2}{9\eta}$.`],
          teach: 'For tiny, slow bodies drag is linear in v (Stokes’s law), and the terminal speed is the weight divided by 6πηr.',
          explain: t`$v_t = \dfrac{mg}{6\pi\eta r} = \dfrac{2\rho_w g r^2}{9\eta} = \dfrac{2(1000)(9.8)(${rum}\times10^{-6})^2}{9(1.8\times10^{-5})} = ${s3(vmm)}$ mm/s. In still air it takes ${Math.round(1000 / vmm)} s to fall a metre, which is why fog hangs in the air.`,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-tuck', difficulty: 2,
      prompt: t`A skydiver falling belly to earth at her terminal speed of 55 m/s tips over into a head-down dive, which cuts her drag area $C_D A$ roughly in half. What happens next?`,
      visual: fall({ m: 80, CdA: 0.42, rho: 1.225 }, 'Before the change: belly to earth at terminal speed, drag balancing weight.'),
      choices: [
        'She speeds up until drag again equals her weight, at a higher terminal speed',
        'Nothing changes: she is already at terminal velocity, the fastest anything can fall',
        'She speeds up, and keeps speeding up for as long as she stays head down',
        'She slows down: with less drag acting, there is less force to keep her moving',
      ],
      answer: 0,
      why: {
        1: 'Terminal speed is not a universal limit: it is where drag equals weight, and that depends on her shape and size and on the air.',
        2: 'As she speeds up, drag grows as v² until it matches her weight again: she levels off at a new terminal speed.',
        3: 'No force is needed to keep her moving. Drag opposes her motion; with less of it, the net force points down and she speeds up.',
      },
      hints: ['Right after the change, how does the drag at 55 m/s compare with her weight?', 'What happens to the drag as she speeds up?'],
      teach: 'Terminal speed is set by the balance of drag and weight: change the drag area and the balance point moves.',
      explain: t`Right after the change the drag at 55 m/s is only about half her weight, so the net force points down and she speeds up. Drag grows as $v^2$ until it equals her weight again, at $v_t \propto 1/\sqrt{C_D A}$: about $55\sqrt{0.42/0.22} \approx 76$ m/s.`,
    }),
    num({
      id: 'cp-capsule', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([5000, 5500, 6000]), Cd = r.pick([0.9, 1.0, 1.1]);
        const A = Math.PI * 1.95 * 1.95, v = vtOf(m, Cd * A);
        return {
          prompt: t`A capsule like Apollo’s command module — ${m.toLocaleString('en-US')} kg, 3.9 m across — falls heat shield first through air of density 1.2 kg/m³, with a drag coefficient of about ${Cd}. If its parachutes failed, what terminal speed would it reach near the sea?`,
          visual: fall({ m, CdA: Cd * A, icon: 'capsule', ask: true }, 'The capsule at terminal speed with no parachutes: drag balances its weight. Arrows to scale.'),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: keep(v, [
            { value: v / 2, feedback: 'The frontal area uses the radius, 1.95 m, not the diameter.' },
            { value: v / Math.SQRT2, feedback: t`Keep the 2: $\tfrac12\rho C_D A v_t^2 = mg$ gives $v_t^2 = 2mg/(\rho C_D A)$.` },
            { value: v * v, feedback: t`That is $v_t^2$. Take the square root.` },
          ]),
          hints: ['The frontal area is a circle 3.9 m across.', t`$A = \pi (1.95)^2$, then $v_t = \sqrt{2mg/(\rho C_D A)}$.`],
          teach: 'The same balance sets a capsule’s terminal speed: drag equals weight.',
          explain: t`$A = \pi(1.95)^2 = 11.9$ m², so $v_t = \sqrt{\dfrac{2(${m})(9.8)}{(1.2)(${Cd})(11.9)}} = ${s3(v)}$ m/s, about ${Math.round(v * 3.6)} km/h — far too fast to meet the sea. Apollo’s three main parachutes brought it down at about 10 m/s instead.`,
        };
      },
    }),
    num({
      id: 'cp-stratos', difficulty: 2, transfer: true,
      gen(r) {
        const vt0 = r.pick([50, 55, 60]), alt = r.pick([20, 25, 30]), rho = AIR[alt];
        const v = vt0 * Math.sqrt(1.225 / rho), c = SOUND[alt];
        return {
          prompt: t`In 2012 Felix Baumgartner jumped from a balloon 39 km up. Take a jumper whose terminal speed near sea level, where the air density is 1.225 kg/m³, is ${vt0} m/s. What would that jumper’s terminal speed be at ${alt} km, where the density is ${rho} kg/m³?`,
          visual: altitudeView({ vt0, alt, altMax: 40, sound: true }, 'Terminal speed for the same body at each altitude (US Standard Atmosphere; drag area held fixed), with the speed of sound dashed.'),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: keep(v, [
            { value: vt0 * (1.225 / rho), feedback: t`Terminal speed goes as $1/\sqrt{\rho}$: take the square root of the density ratio.` },
            { value: vt0 * Math.sqrt(rho / 1.225), feedback: 'Thinner air gives less drag at each speed, so the jumper must fall faster to balance the weight.' },
            { value: vt0, feedback: 'Terminal speed depends on the air density.' },
          ]),
          hints: [t`$v_t \propto 1/\sqrt{\rho}$.`, t`$v_t = ${vt0}\sqrt{1.225/\rho}$.`],
          teach: 'Terminal speed scales as 1/√ρ, and in the stratosphere the air is tens of times thinner.',
          explain: t`$v_t = ${vt0}\sqrt{\dfrac{1.225}{${rho}}} = ${s3(v)}$ m/s — ${v > c ? `faster than sound, which travels at about ${c} m/s up there` : v > 0.85 * c ? `close to the speed of sound, about ${c} m/s up there` : `below the speed of sound up there (about ${c} m/s), though higher still, in thinner air, it passes it`}. Baumgartner reached 1,358 km/h (377 m/s) this way. His speed peaked where it caught up with the local terminal speed; below that the thickening air slowed him.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §6.4 Drag Force and Terminal Speed', url: 'https://openstax.org/books/university-physics-volume-1/pages/6-4-drag-force-and-terminal-speed' },
    { label: 'NASA Glenn Research Center, The Drag Equation', url: 'https://www.grc.nasa.gov/www/k-12/airplane/drageq.html' },
  ],
});
