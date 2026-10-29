// Charges moving in fields: in a uniform field a charge has the constant
// acceleration a = qE/m — projectile motion with qE/m in place of g. Electron
// guns, deflection plates, ink-jet printers and the first stage of an
// accelerator.
import { lesson, mcq, num } from '../../src/core/content.js';
import { QE, ME, MP, tn, s3, field, fieldLive } from './_efield.js';

const t = String.raw;
const C = 2.998e8;

// the worked example: an electron at 3.0×10⁷ m/s between 4.0 cm plates, E = 1.2×10⁴ N/C, a screen 20 cm on
const WX = { v: 3.0e7, L: 0.04, E: 1.2e4, D: 0.2 };
WX.t = WX.L / WX.v;
WX.a = (QE * WX.E) / ME;
WX.y = 0.5 * WX.a * WX.t ** 2;
WX.vy = WX.a * WX.t;
WX.deg = (Math.atan(WX.vy / WX.v) * 180) / Math.PI;
WX.extra = (WX.D * WX.vy) / WX.v;
WX.total = WX.y + WX.extra;

// horizontal deflection plates (cm): + below, − above, so the field points up
const plates = (sigma, half = 5, gap = 1) => [{ x: 0, y: -gap, angle: 0, sigma, width: 2 * half }, { x: 0, y: gap, angle: 0, sigma: -sigma, width: 2 * half }];

export default lesson({
  id: 'phys2220.E2.5',
  title: 'Charges moving in fields',
  minutes: 13, difficulty: 3,
  intro: t`In a uniform field $\vec E$, a charge $q$ of mass $m$ feels a constant force $q\vec E$, so it moves with constant acceleration

$$\vec a = \frac{q\vec E}{m}$$

It is projectile motion again, with $q\vec E/m$ in place of $\vec g$. Released from rest, a charge accelerates straight along the field (against it, if negative); fired across the field, it bends into a **parabola**; once it leaves the field, it carries on in a straight line. For electrons and ions $qE/m$ is so much larger than $g$ that gravity is simply ignored.`,
  symbols: [
    { tex: '\\vec a', text: 'the acceleration of the charge, in m/s²: constant in a uniform field' },
    { tex: 'q', text: 'the charge, in C, with its sign: $-e$ for an electron, $+e$ for a proton' },
    { tex: '\\vec E', text: 'the electric field, in N/C' },
    { tex: 'm', text: 'the mass, in kg: $9.109\\times10^{-31}$ kg for an electron, $1.673\\times10^{-27}$ kg for a proton' },
  ],
  why: 'Steering charged particles with fields is how oscilloscopes, electron microscopes, mass spectrometers, ion thrusters and particle accelerators work.',
  visual: {
    type: 'em-field',
    title: 'Deflection plates',
    lead: t`A particle is fired between two charged plates (+ below, − above), so the field between them points up. Press **Launch**. Change the field, the launch speed and the particle, and watch how far the beam is bent.`,
    tasks: [
      'Double the field: the sideways shift doubles.',
      'Halve the launch speed: the shift becomes four times as big — the particle spends twice as long between the plates. Too slow, and it hits a plate.',
      'Switch to a proton at the same speed: it bends the other way, and 1836 times less — you will barely see it.',
    ],
    params: {
      unit: 'cm', x: [-8, 12], y: [-4, 4],
      sheets: [{ x: 0, y: -1, angle: 0, sigma: 'Ef*8.854', width: 10 }, { x: 0, y: 1, angle: 0, sigma: '-Ef*8.854', width: 10 }],
      sliders: [
        { key: 'Ef', label: 'Field between the plates $E$', min: 0, max: 8, step: 0.5, value: 3, unit: '\\mathrm{kN/C}', explain: 'Set by the charge on the plates; it points up, from the + plate to the − plate.' },
        { key: 'v', label: 'Launch speed $v_0$', min: 1.5, max: 4, step: 0.1, value: 2.5, unit: '\\times 10^7\\ \\mathrm{m/s}', explain: 'Horizontal, along the middle of the gap.' },
      ],
      choices: [{ key: 'kind', label: 'Particle', options: [['electron', 'Electron'], ['proton', 'Proton']], value: 'electron', explain: 'Same size of charge, opposite signs; the proton is 1836 times heavier.' }],
      particle: { kind: 'kind', x: -7.5, y: 0, speed: 'v*1e7', angle: 0, drag: false },
      arrows: true, fieldLines: false, readouts: ['deflect', 'speed'],
    },
    caption: 'The plates are 10 cm long and 2 cm apart; their field is computed exactly, including the weak fringe field outside them. Arrow lengths are compressed. The path is integrated from F = qE (no gravity, no relativity — fine below a few percent of the speed of light); the sideways shift is read where the particle leaves the picture.',
  },
  example: {
    prompt: t`In an oscilloscope, an electron enters the gap between two deflection plates moving at $3.0\times10^{7}$ m/s, parallel to them. The plates are 4.0 cm long and the field between them is $1.2\times10^{4}$ N/C, at right angles to the electron's path. (a) How far sideways has it moved when it leaves the plates? (b) At what angle does it leave? (c) How far from the centre does it hit a screen 20 cm beyond the plates? ($e = 1.602\times10^{-19}$ C, $m_e = 9.109\times10^{-31}$ kg)`,
    visual: field({ unit: 'cm', x: [-6, 22.1], y: [-3, 3], sheets: [{ x: 0, y: -0.6, angle: 0, sigma: 106, width: 4 }, { x: 0, y: 0.6, angle: 0, sigma: -106, width: 4 }], fieldLines: false, particle: { kind: 'electron', x: -5, y: 0, speed: WX.v, angle: 0, path: true }, notes: { lines: [{ from: [22, -3], to: [22, 3], color: 'ink2', width: 3 }] } }, 'The electron’s path (gold), drawn to scale: a parabola between the plates, then a straight line to the screen (grey). It is computed for these real plates, whose field weakens toward their ends, so it bends a little less than the idealised uniform field of the calculation.'),
    steps: [
      { label: 'Time between the plates', text: t`Across the field nothing pushes it, so its forward speed stays $3.0\times10^{7}$ m/s: $t = L/v_0 = 0.040/3.0\times10^{7} = ${tn(WX.t)}$ s.` },
      { label: 'Sideways acceleration', text: t`$a = \dfrac{eE}{m_e} = \dfrac{(1.602\times10^{-19})(1.2\times10^{4})}{9.109\times10^{-31}} = ${tn(WX.a)}\ \text{m/s}^2$, toward the + plate.` },
      { label: '(a) Shift', text: t`Starting with no sideways speed: $y = \tfrac12 at^2 = \tfrac12(${tn(WX.a)})(${tn(WX.t)})^2 = ${tn(WX.y * 1000)}$ mm.` },
      { label: '(b) Angle', text: t`$v_y = at = ${tn(WX.vy)}$ m/s, so $\tan\theta = v_y/v_0 = ${tn(WX.vy / WX.v)}$ and $\theta = ${s3(WX.deg, 3)}^\circ$.` },
      { label: '(c) Screen', text: t`Beyond the plates the path is straight: another $(0.20\ \text{m})\tan\theta = ${tn(WX.extra * 100)}$ cm sideways. In all $${tn(WX.total * 100)}$ cm from the centre.` },
      { label: 'Sense check', text: t`Gravity would pull it down by $\tfrac12 g t^2 \approx 10^{-17}$ m between the plates — nothing. And $3.0\times10^{7}$ m/s is a tenth of the speed of light, where Newton's mechanics is still good to about 1%.` },
    ],
    answer: t`(a) ${tn(WX.y * 1000)} mm; (b) ${s3(WX.deg, 3)}°; (c) ${tn(WX.total * 100)} cm from the centre of the screen.`,
  },
  practice: [
    num({
      id: 'from-rest', difficulty: 2,
      gen(r) {
        const [name, m, art] = r.pick([['proton', MP, 'A'], ['electron', ME, 'An']]), E = r.pick([2.0e3, 5.0e3, 1.0e4]), d = r.pick([1.0, 2.0, 4.0]);
        const v = Math.sqrt((2 * QE * E * (d / 100)) / m);
        return {
          prompt: t`${art} ${name} starts from rest in a uniform field of $${tn(E)}$ N/C, which pushes it ${d} cm in a straight line. How fast is it going then? ($e = 1.602\times10^{-19}$ C, $m = ${tn(m, 4)}$ kg)`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (QE * E * (d / 100)) / m, feedback: t`That is $v^2/2$. Take $v = \sqrt{2ad}$.` }, { value: Math.sqrt((QE * E * (d / 100)) / m), feedback: t`$v^2 = 2ad$: the 2 is missing.` }],
          hints: [t`Constant acceleration $a = eE/m$ from rest: $v^2 = 2ad$.`, t`Or by energy: the work $eEd$ becomes kinetic energy $\tfrac12 mv^2$.`],
          teach: 'Released from rest in a uniform field, a charge gains kinetic energy equal to the work done on it: ½mv² = |q|Ed.',
          explain: t`$a = eE/m = ${tn((QE * E) / m)}\ \text{m/s}^2$ and $v = \sqrt{2ad} = \sqrt{2(${tn((QE * E) / m)})(${d / 100})} = ${tn(v)}$ m/s. Equivalently, the work $eEd = ${tn(QE * E * (d / 100))}$ J becomes $\tfrac12 mv^2$.`,
          visual: field({ unit: 'cm', x: [-6, 6], y: [-3.5, 3.5], sheets: [{ x: -d / 2 - 0.5, y: 0, angle: 90, sigma: name === 'proton' ? 40 : -40, width: 6 }, { x: d / 2 + 0.5, y: 0, angle: 90, sigma: name === 'proton' ? -40 : 40, width: 6 }], fieldLines: true, density: 10, particle: { kind: name, x: -d / 2, y: 0, speed: 0, path: false } }, `The ${name} at rest at its starting point, between two charged plates. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'which-way', difficulty: 1,
      prompt: 'An electron moving to the right enters the space between two plates, where the field points up. Which way does its path bend?',
      choices: ['Down, toward the + plate', 'Up, along the field', 'It does not bend: the field is at right angles to its motion', 'To the left: it slows down'],
      answer: 0,
      why: {
        1: 'A positive charge would bend up. The electron is negative: F = qE points down.',
        2: 'A force at right angles to the velocity is exactly what bends a path — like gravity bending a thrown ball.',
        3: 'The force is vertical, so it changes the vertical part of the velocity and leaves the horizontal part alone.',
      },
      hints: [t`$\vec F = q\vec E$ with $q = -e$.`],
      teach: 'A charge fired across a field bends toward the side the force points to: along E for +, against E for −.',
      explain: 'The force on the electron is −eE, pointing down, toward the + plate. Its forward speed is unchanged, so its path curves down in a parabola.',
      visual: field({ unit: 'cm', x: [-8, 8], y: [-3.5, 3.5], sheets: plates(30), fieldLines: true, density: 10, particle: { kind: 'electron', x: -7, y: 0, speed: 0, path: false }, notes: { arrows: [{ from: [-6.6, 0], to: [-4.6, 0], label: 'v', color: 'gold' }] } }, 'An electron about to enter the plates, moving right. The + plate is below, so the field points up.'),
    }),
    num({
      id: 'deflection', difficulty: 2,
      gen(r) {
        const v = r.pick([2.0, 2.5, 3.0, 4.0]) * 1e7, L = r.pick([2.0, 3.0, 5.0]), E = r.pick([0.5, 1.0, 1.5, 2.0]) * 1e4;
        const tt = L / 100 / v, a = (QE * E) / ME, y = 0.5 * a * tt * tt;
        return {
          prompt: t`An electron moving at $${tn(v)}$ m/s enters deflection plates ${L} cm long, travelling parallel to them. The field between them is $${tn(E)}$ N/C. How far sideways is it pushed by the time it leaves? Give the answer in mm.`,
          answer: y * 1000, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: a * tt * tt * 1000, feedback: t`From rest sideways: $y = \tfrac12 at^2$ — the ½ is missing.` }, { value: 0.5 * a * tt * 1000, feedback: t`Square the time: $y = \tfrac12 at^2$.` }],
          hints: ['Its forward speed does not change: the time between the plates is L/v₀.', t`Sideways it starts from rest with $a = eE/m_e$: $y = \tfrac12 at^2$.`],
          teach: 'Across the field a charge moves like a projectile: steady speed along the plates, constant acceleration across them, so y = ½(qE/m)(L/v₀)².',
          explain: t`$t = L/v_0 = ${tn(tt)}$ s, $a = eE/m_e = ${tn(a)}\ \text{m/s}^2$, so $y = \tfrac12at^2 = ${tn(y * 1000)}$ mm.`,
          visual: field({ unit: 'cm', x: [-L / 2 - 3, L / 2 + 3], y: [-2.5, 2.5], sheets: plates(30, L / 2, 0.8), fieldLines: true, density: 10, particle: { kind: 'electron', x: -L / 2 - 2, y: 0, speed: 0, path: false }, notes: { arrows: [{ from: [-L / 2 - 1.7, 0], to: [-L / 2 - 0.3, 0], label: 'v₀', color: 'gold' }] } }, `The electron entering ${L} cm long plates. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'proton-electron', difficulty: 2,
      prompt: 'An electron and a proton enter the same deflection plates with the same speed. How do their paths compare?',
      choices: [
        'They bend in opposite directions, and the proton bends about 1836 times less',
        'They bend the same amount in opposite directions, because their charges are equal and opposite',
        'They bend the same way, the proton 1836 times more',
        'Neither bends: the plates’ field cancels for equal and opposite charges',
      ],
      answer: 0,
      why: {
        1: 'The forces are equal and opposite, but the same force gives the heavier proton 1836 times less acceleration.',
        2: 'Opposite charges feel opposite forces, so they bend opposite ways; and the heavier proton bends less, not more.',
        3: 'Each particle feels the plates’ field on its own; nothing cancels.',
      },
      hints: [t`$a = qE/m$: same $|q|$, very different $m$.`],
      teach: 'The deflection is proportional to q/m: equal and opposite charges bend oppositely, and the heavier one bends less.',
      explain: t`$a = qE/m$: the forces are equal and opposite, so the bends are in opposite directions; with the same speed, both spend the same time between the plates, so the shifts are in the ratio of $1/m$: $m_p/m_e = 1836$.`,
      visual: field({ unit: 'cm', x: [-8, 8], y: [-3.5, 3.5], sheets: plates(30), fieldLines: true, density: 10, particle: { kind: 'proton', x: -7, y: 0.4, speed: 0, path: false }, notes: { points: [{ x: -7, y: -0.4, color: 'accent', r: 6.5 }], arrows: [{ from: [-6.6, 0], to: [-4.6, 0], label: 'v', color: 'gold' }] } }, 'A proton (red) and an electron (blue) about to enter the plates side by side.'),
    }),
    num({
      id: 'stopping', difficulty: 3,
      gen(r) {
        const v = r.pick([1.0, 2.0, 3.0]) * 1e6, E = r.pick([100, 250, 500, 1000]);
        const d = (ME * v * v) / (2 * QE * E);
        return {
          prompt: t`An electron is fired at $${tn(v)}$ m/s in the same direction as a uniform field of ${E} N/C. How far does it go before it stops?`,
          answer: d * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: ((ME * v * v) / (QE * E)) * 100, feedback: t`$v^2 = 2ad$: you dropped the 2.` }],
          hints: ['The force on an electron points against the field, so it slows down steadily.', t`Its deceleration is $a = eE/m_e$; it stops when $v_0^2 = 2ad$.`, t`$d = \dfrac{m_e v_0^2}{2eE}$ — or: its kinetic energy $\tfrac12m_ev_0^2$ equals the work $eEd$ done against it.`],
          teach: 'A charge fired against the force on it slows to a stop where its kinetic energy has been used up: ½mv₀² = |q|Ed.',
          explain: t`$d = \dfrac{m_ev_0^2}{2eE} = \dfrac{(9.109\times10^{-31})(${tn(v)})^2}{2(1.602\times10^{-19})(${E})} = ${tn(d * 100)}$ cm. Then it turns round and is pushed back the way it came.`,
          visual: field({ unit: 'cm', x: [-8, 8], y: [-4, 4], uniform: [E, 0], fieldLines: true, density: 9, particle: { kind: 'electron', x: -6, y: 0, speed: 0, path: false }, notes: { arrows: [{ from: [-5.6, 0.9], to: [-3.4, 0.9], label: 'v₀', color: 'gold' }] } }, 'The electron fired to the right, the same way as the field. Not to scale.'),
        };
      },
    }),
    num({
      id: 'ink-jet', difficulty: 3,
      gen(r) {
        const E = r.pick([0.8, 1.0, 1.4]) * 1e6, v = r.pick([15, 18, 20]), q = 1.5e-13, m = 1.3e-10, L = 0.016;
        const y = 0.5 * ((q * E) / m) * (L / v) ** 2;
        return {
          prompt: t`An ink-jet printer steers drops of ink with charged plates. A drop of mass $1.3\times10^{-10}$ kg carrying $-1.5\times10^{-13}$ C moves at ${v} m/s between plates 1.6 cm long, where the field is $${tn(E)}$ N/C. How far sideways does it move between the plates? Give mm.`,
          answer: y * 1000, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: ((q * E) / m) * (L / v) ** 2 * 1000, feedback: t`$y = \tfrac12at^2$: the ½ is missing.` }],
          hints: [t`$t = L/v$ between the plates.`, t`$a = qE/m$ — here $q/m$ is far smaller than for an electron, but the method is the same.`, t`$y = \tfrac12at^2$.`],
          teach: 'Deflection by plates works the same for ink drops as for electrons: y = ½(qE/m)(L/v)².',
          explain: t`$a = qE/m = ${tn((q * E) / m)}\ \text{m/s}^2$, $t = 0.016/${v} = ${tn(L / v)}$ s, so $y = ${tn(y * 1000)}$ mm. The printer charges each drop by a different amount to place it — and gravity, $\tfrac12gt^2 \approx 4\times10^{-6}$ m, really is negligible.`,
          visual: field({ unit: 'mm', x: [-14, 14], y: [-6, 6], sheets: [{ x: 0, y: -2.5, angle: 0, sigma: 200, width: 16 }, { x: 0, y: 2.5, angle: 0, sigma: -200, width: 16 }], fieldLines: true, density: 10, particle: { q: -1e6, m: 1.3e-10, x: -12, y: 0, speed: 0, path: false } }, 'A charged ink drop (blue) about to pass between the deflection plates. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'shape', difficulty: 2,
      prompt: 'An electron enters the uniform field between two plates at right angles to the field, leaves at the far end, and flies on to a screen. What is the shape of its path?',
      choices: [
        'A parabola between the plates, then a straight line',
        'A parabola all the way to the screen',
        'An arc of a circle between the plates, then a straight line',
        'A straight line throughout, tilted by the field',
      ],
      answer: 0,
      why: {
        1: 'Once it leaves the plates there is no force on it, so it moves in a straight line.',
        2: 'A circle needs a force that keeps turning to stay at right angles to the motion (that is what a magnetic field does). This force has a fixed direction.',
        3: 'Between the plates the sideways velocity keeps growing, so the path curves.',
      },
      hints: ['A constant force at right angles to the initial velocity — what does gravity do to a ball thrown sideways?'],
      teach: 'In a uniform field a charge moves like a thrown ball — a parabola — and outside the field in a straight line.',
      explain: 'Between the plates: steady speed along them, constant acceleration across them — a parabola. Outside: no force, so a straight line along its exit velocity. That straight line is why a small deflection between the plates becomes a large one on a distant screen.',
      visual: field({ unit: 'cm', x: [-8, 16], y: [-4, 4], sheets: plates(30, 4, 0.8), fieldLines: true, density: 10, particle: { kind: 'electron', x: -7, y: 0, speed: 0, path: false }, notes: { lines: [{ from: [14.5, -4], to: [14.5, 4], color: 'ink2', width: 3 }], arrows: [{ from: [-6.6, 0], to: [-4.8, 0], label: 'v', color: 'gold' }] } }, 'The plates, the screen (grey) and the electron arriving from the left.'),
    }),
    mcq({
      id: 'whole-flight', difficulty: 3, kind: 'error',
      prompt: t`An electron crosses deflection plates 4.0 cm long and then flies 20 cm to a screen. A student finds where it hits the screen with $y = \tfrac12 a t^2$, using $a = eE/m_e$ and $t$ = the time for the whole 24 cm. What is wrong?`,
      choices: [
        'The force acts only between the plates; after them the electron moves in a straight line, so the acceleration must stop at the end of the plates',
        'They should use the time for the 4.0 cm only and stop there: the electron does not move sideways after leaving the plates',
        t`They should have used $y = at^2$ without the ½`,
        'Nothing: the electron accelerates sideways all the way to the screen',
      ],
      answer: 0,
      why: {
        1: 'It does keep moving sideways after the plates — with the sideways speed it had when it left them. That straight-line part is usually the larger share of the shift.',
        2: t`$\tfrac12at^2$ is right for motion from rest under constant acceleration; the trouble is applying it where there is no acceleration.`,
        3: 'Outside the plates there is no field, so no sideways force: the sideways speed stays constant.',
      },
      hints: ['Where is there a field — and so a force?', 'After the plates, what happens to the sideways velocity?'],
      teach: 'Split the flight: a parabola inside the field, then a straight line with the exit velocity.',
      explain: t`Inside the plates: $y_1 = \tfrac12a t_1^2$ and $v_y = at_1$, with $t_1 = L/v_0$. After them: $y_2 = v_y t_2$, with $t_2 = D/v_0$. The student's single formula pretends the field fills the whole flight and overestimates the shift several times over.`,
      visual: field({ unit: 'cm', x: [-6, 24], y: [-3, 5], sheets: [{ x: 0, y: -0.6, angle: 0, sigma: 106, width: 4 }, { x: 0, y: 0.6, angle: 0, sigma: -106, width: 4 }], fieldLines: true, density: 8, particle: { kind: 'electron', x: -5, y: 0, speed: 3e7, angle: 0, path: true }, notes: { lines: [{ from: [22, -3], to: [22, 5], color: 'ink2', width: 3 }] } }, 'The electron’s path through the plates and on to the screen (grey).'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-linac', difficulty: 2, transfer: true,
      gen(r) {
        const E = r.pick([1, 2, 3]) * 1e5, d = r.pick([2, 5]), v = Math.sqrt((2 * QE * E * (d / 100)) / ME);
        return {
          prompt: t`In the first stage of a small linear accelerator, electrons leave a hot cathode almost at rest and cross a ${d} cm gap where the field is $${tn(E)}$ N/C. How fast are they moving at the far side? (Use Newton's mechanics.)`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((QE * E * (d / 100)) / ME), feedback: t`$v^2 = 2ad$ (or $\tfrac12mv^2 = eEd$): a factor 2 is missing.` }],
          hints: [t`$\tfrac12 m_ev^2 = eEd$.`],
          teach: 'The work a uniform field does on a charge across a gap, |q|Ed, becomes kinetic energy.',
          explain: t`$v = \sqrt{2eEd/m_e} = \sqrt{\dfrac{2(1.602\times10^{-19})(${tn(E)})(${d / 100})}{9.109\times10^{-31}}} = ${tn(v)}$ m/s — already $${s3(v / C, 2)}c$. At this speed Newton's formula overestimates a little (special relativity gives about ${s3(100 * (1 - Math.sqrt(1 - 1 / (1 + (QE * E * (d / 100)) / (ME * C * C)) ** 2) / (v / C)), 1)}% less); later stages of an accelerator need relativity.`,
          visual: field({ unit: 'cm', x: [-4, d + 4], y: [-4, 4], sheets: [{ x: 0, y: 0, angle: 90, sigma: -40, width: 6 }, { x: d, y: 0, angle: 90, sigma: 40, width: 6 }], fieldLines: true, density: 10, particle: { kind: 'electron', x: 0.15, y: 0, speed: 0, path: false } }, 'The accelerating gap: electrons start at the cathode plate (left) and are pushed toward the right-hand plate. Not to scale.'),
        };
      },
    }),
    num({
      id: 'cp-proton-deflect', difficulty: 3,
      gen(r) {
        const v = r.pick([2, 3, 5]) * 1e5, L = r.pick([3, 5]), E = r.pick([100, 200, 400]);
        const tt = L / 100 / v, a = (QE * E) / MP, y = 0.5 * a * tt * tt;
        return {
          prompt: t`A proton moving at $${tn(v)}$ m/s enters plates ${L} cm long, parallel to them, where the field is ${E} N/C. How far sideways does it move between the plates? Give mm.`,
          answer: y * 1000, units: 'mm', tol: { rel: 0.01 },
          hints: [t`$t = L/v_0$.`, t`$y = \tfrac12(eE/m_p)t^2$.`],
          teach: 'y = ½(qE/m)(L/v₀)²: the same formula for any charged particle.',
          explain: t`$t = ${tn(tt)}$ s, $a = eE/m_p = ${tn(a)}\ \text{m/s}^2$, so $y = ${tn(y * 1000)}$ mm, toward the − plate.`,
          visual: field({ unit: 'cm', x: [-L / 2 - 3, L / 2 + 3], y: [-2.5, 2.5], sheets: plates(25, L / 2, 0.8), fieldLines: true, density: 10, particle: { kind: 'proton', x: -L / 2 - 2, y: 0, speed: 0, path: false }, notes: { arrows: [{ from: [-L / 2 - 1.7, 0], to: [-L / 2 - 0.3, 0], label: 'v₀', color: 'gold' }] } }, `A proton about to enter ${L} cm plates. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'cp-against', difficulty: 2,
      prompt: 'A proton is fired straight against the direction of a uniform field. What happens to it?',
      choices: [
        'It slows down, stops for an instant, then speeds back the way it came',
        'It keeps going at constant speed, since the field only bends paths',
        'It speeds up, because it is moving along a field line',
        'It turns sideways and moves at right angles to the field',
      ],
      answer: 0,
      why: {
        1: 'The force on it is along the field — opposite to its velocity — so it changes its speed.',
        2: 'The force on a proton points along E; moving against E, it is slowed, not sped up.',
        3: 'The force is exactly opposite to the velocity, with no sideways part, so the path stays straight.',
      },
      hints: ['Which way is the force on a proton? Compare it with the velocity.'],
      teach: 'A force opposite to the velocity slows a charge, stops it and sends it back — like a ball thrown straight up.',
      explain: 'The force eE points along the field, opposite to the proton’s motion: a constant deceleration. It stops where its kinetic energy has been used up, then accelerates back along the field — exactly like a ball thrown upward.',
      visual: field({ unit: 'cm', x: [-8, 8], y: [-4, 4], uniform: [800, 0], fieldLines: true, density: 9, particle: { kind: 'proton', x: 4, y: 0, speed: 0, path: false }, notes: { arrows: [{ from: [3.6, 0.9], to: [1.4, 0.9], label: 'v', color: 'gold' }] } }, 'A uniform field pointing right and a proton moving left, against it.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §5.4 Electric Field (charges in a uniform field)', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field' },
    { label: 'OpenStax University Physics Vol. 1, §4.3 Projectile Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion' },
  ],
});
