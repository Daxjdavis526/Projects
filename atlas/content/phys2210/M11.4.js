// Gyroscopes and precession: gravity's torque on a spinning wheel is
// horizontal, so it turns L sideways instead of tipping the axle: Ω = τ/L.
// Also reaction wheels, spin-stabilised satellites and Earth's 26 000-year wobble.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, gyroScene } from './_spin.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const RPM = (2 * Math.PI) / 60;
const DEG = 180 / Math.PI;

// the worked example: a bicycle wheel held by one end of its axle
const EX = { M: 2.2, R: 0.33, w: 30, r: 0.2 };
EX.I = EX.M * EX.R ** 2;
EX.L = EX.I * EX.w;
EX.tau = EX.M * G * EX.r;
EX.W = EX.tau / EX.L;
EX.T = (2 * Math.PI) / EX.W;

// Earth's spin axis precessing on a cone, tilted 23.4° from the orbit's axis
const earthAxis = {
  type: 'calc-vectors3d',
  params: {
    range: 2.2, aspect: 'wide', grid: false, yaw: 0.6, pitch: 0.3,
    spheres: [{ centre: [0, 0, 0], radius: 0.8, color: 'teal' }],
    segments: [{ from: [0, 0, -1.9], to: [0, 0, 1.9], color: 'ink3', dash: true }],
    curves: [{ param: [`${(1.9 * Math.sin(0.4084)).toFixed(4)}*cos(t)`, `${(1.9 * Math.sin(0.4084)).toFixed(4)}*sin(t)`, (1.9 * Math.cos(0.4084)).toFixed(4)], t: [0, 6.2832], color: 'gold', width: 1.4, dash: true }],
    vectors: [{ to: [(1.9 * Math.sin(0.4084)).toFixed(4), 0, (1.9 * Math.cos(0.4084)).toFixed(4)], color: 'accent', label: '\\vec L_\\text{spin}' }],
  },
  caption: 'Earth’s spin axis (blue), tilted 23.4° from the perpendicular to its orbit (dashed), sweeps round the gold cone. Not to scale. Drag to rotate the view.',
};

// a spinning satellite: a sideways torque turns its angular momentum
const spinSat = {
  type: 'calc-vectors3d',
  params: {
    range: 2.4, aspect: 'wide', grid: false, yaw: 0.7, pitch: 0.35,
    curves: [{ param: ['0.9cos(t)', '0.9sin(t)', '-0.5'], t: [0, 6.2832], color: 'ink2', width: 2 }, { param: ['0.9cos(t)', '0.9sin(t)', '0.5'], t: [0, 6.2832], color: 'ink2', width: 2 }],
    segments: [{ from: [0.9, 0, -0.5], to: [0.9, 0, 0.5], color: 'ink3' }, { from: [-0.9, 0, -0.5], to: [-0.9, 0, 0.5], color: 'ink3' }, { from: [0, 0.9, -0.5], to: [0, 0.9, 0.5], color: 'ink3' }, { from: [0, -0.9, -0.5], to: [0, -0.9, 0.5], color: 'ink3' }],
    vectors: [
      { to: [0, 0, 2.1], color: 'accent', label: '\\vec L' },
      { from: [0, 0, 2.1], to: [0.6, 0, 2.1], color: 'gold', label: '\\vec\\tau\\,\\Delta t' },
      { to: [0.6, 0, 2.1], color: 'violet', dash: true, label: '\\vec L + \\Delta\\vec L' },
    ],
  },
  caption: 'A spin-stabilised satellite (a drum spinning about its axis). A sideways torque adds a sideways ΔL: the spin axis tilts instead of the spin changing. Drag to rotate; ΔL exaggerated.',
};

export default lesson({
  id: 'phys2210.M11.4',
  title: 'Gyroscopes and precession',
  minutes: 10, difficulty: 3,
  intro: t`Support a spinning wheel by one end of its axle and it does not fall: the axle swings slowly round the support instead. Gravity's torque about the pivot, $\vec\tau = \vec r\times M\vec g$, is **horizontal and perpendicular to** $\vec L$, so — by $\vec\tau = d\vec L/dt$ — it changes the *direction* of $\vec L$, not its size. The axle sweeps round at the **precession** rate

$$\Omega = \frac{\tau}{L} = \frac{Mgr}{I\omega}$$

A faster spin means a slower precession. Nothing defies gravity: the support pushes up with $Mg$, and gravity's torque does exactly what $\vec\tau = d\vec L/dt$ demands.`,
  symbols: [
    { tex: '\\Omega', text: 'the precession rate: how fast the axle swings round the vertical, in rad/s' },
    { tex: '\\tau', text: 'the torque of gravity about the pivot, in N·m: $Mgr$ for a horizontal axle' },
    { tex: 'L = I\\omega', text: 'the spin angular momentum, in kg·m²/s, pointing along the axle' },
    { tex: 'M', text: 'the mass of the spinning body (and its axle), in kg' },
    { tex: 'g', text: 'the acceleration due to gravity, 9.8 m/s²' },
    { tex: 'r', text: 'the distance from the pivot to the centre of mass, along the axle, in m' },
    { tex: 'I', text: 'the moment of inertia about the axle, in kg·m²' },
    { tex: '\\omega', text: 'the spin rate, in rad/s; the formula holds when $\\omega \\gg \\Omega$' },
  ],
  why: 'Gyroscopes hold spacecraft and satellites steady and turn them without propellant; the same torque on a spin swings Earth’s axis round once in 26 000 years — and gyroscopes in orbit measured how Earth’s mass bends spacetime.',
  visual: {
    ...gyroScene({
      phi: 'phi', show: ['L', 'W', 'N', 'tau', 'dL', 'circle'], Lsize: 'w/200', extra: { range: 3.1 },
      sliders: [
        { key: 'phi', label: 'Where the axle points, $\\varphi$', min: 0, max: 360, step: 2, value: 30, unit: '^\\circ', explain: 'Precession turns this angle at the steady rate $\\Omega$.' },
        { key: 'w', label: 'Spin rate $\\omega$', min: 40, max: 300, step: 5, value: 120, unit: '\\mathrm{rad/s}', explain: 'A rotor with $I = 0.015\\ \\mathrm{kg\\,m^2}$ and $M = 1.2$ kg.' },
        { key: 'r', label: 'Pivot to centre of mass, $r$', min: 0.05, max: 0.25, step: 0.01, value: 0.12, unit: '\\mathrm{m}', explain: 'The lever arm of the weight about the pivot.' },
      ],
      readouts: [
        { label: '$L = I\\omega$', expr: '0.015*w', unit: '\\mathrm{kg\\,m^2/s}' },
        { label: '$\\tau = Mgr$', expr: '1.2*9.8*r', unit: '\\mathrm{N\\,m}' },
        { label: '$\\Omega = \\tau/L$', expr: '1.2*9.8*r/(0.015*w)', unit: '\\mathrm{rad/s}' },
        { label: 'one turn of the axle', expr: '2*pi*0.015*w/(1.2*9.8*r)', unit: '\\mathrm{s}' },
      ],
      caption: 'Blue: the spin angular momentum, drawn in proportion to ω. Red: gravity’s torque about the pivot; gold: the change dL it makes. The axle and the other arrows are not to scale. Drag to rotate the view.',
    }),
    title: 'Torque turns the spin sideways',
    lead: t`The wheel spins fast about its axle, held up only at the pivot. Blue is its angular momentum $\vec L$, red the torque of its weight about the pivot, gold the change $d\vec L = \vec\tau\,dt$ that torque makes. The dashed circle is the path of $\vec L$'s tip.`,
    tasks: [
      'Turn φ: the axle swings round the pivot, and the torque always points the way L is about to move — sideways, never down.',
      'Double the spin: L doubles and Ω halves. A fast gyroscope precesses slowly.',
      'Slide the wheel farther out: the torque grows, and Ω with it.',
    ],
  },
  example: {
    prompt: t`A classroom demonstration: a ${EX.M} kg bicycle wheel (treat it as a hoop of radius ${EX.R} m) spins at ${EX.w} rad/s on an axle held at a point ${EX.r} m from the wheel's centre, with the axle horizontal. How fast does it precess, and how long does one full turn take?`,
    visual: gyroScene({ phi: 25, show: ['L', 'W', 'N', 'tau'], caption: 'The wheel hangs from the pivot by its axle. Arrows show directions; lengths are not to one scale. Drag to rotate the view.' }),
    steps: [
      { label: 'Spin angular momentum', text: t`A hoop: $I = MR^2 = (${EX.M})(${EX.R})^2 = ${s3(EX.I)}\ \text{kg·m}^2$, so $L = I\omega = ${s3(EX.L)}\ \text{kg·m}^2/\text{s}$, along the axle.` },
      { label: 'Torque about the pivot', text: t`The weight acts at the wheel's centre, ${EX.r} m from the pivot, at right angles to the horizontal axle: $\tau = Mgr = (${EX.M})(9.8)(${EX.r}) = ${s3(EX.tau)}$ N·m — horizontal, perpendicular to $\vec L$.` },
      { label: 'Precession rate', text: t`In a short time $dt$, $\vec L$ gains a sideways piece $\tau\,dt$, turning it through $d\varphi = \tau\,dt/L$. So $\Omega = \tau/L = ${s3(EX.tau)}/${s3(EX.L)} = ${s3(EX.W)}$ rad/s.` },
      { label: 'One turn', text: t`$T = 2\pi/\Omega = ${s3(EX.T)}$ s.` },
      { label: 'Sense check', text: t`$\Omega$ = ${s3(EX.W)} rad/s is far below $\omega$ = ${EX.w} rad/s, as the formula requires. The hand holds up the full weight, $Mg = ${s3(EX.M * G)}$ N: precession is not levitation.` },
    ],
    answer: t`$\Omega = ${s3(EX.W)}$ rad/s: one turn every $${s3(EX.T)}$ s.`,
  },
  practice: [
    mcq({
      id: 'which-way', difficulty: 2,
      prompt: 'The wheel spins so that its angular momentum points along the axle, away from the pivot (as drawn). Released with the axle horizontal, what does the axle do?',
      choices: ['Swings anticlockwise round the pivot, seen from above', 'Swings clockwise round the pivot, seen from above', 'Tips down, as a wheel that is not spinning would', 'Tips up, away from the floor'],
      answer: 0,
      why: {
        1: 'That is what happens if the wheel spins the other way, so that L points in toward the pivot.',
        2: 'A wheel that is not spinning does tip down. With a fast spin, the torque changes L’s direction sideways instead.',
        3: 'Gravity’s torque about the pivot is horizontal: it cannot lift the axle.',
      },
      hints: [t`Find the torque: $\vec\tau = \vec r\times M\vec g$, with $\vec r$ along the axle and $M\vec g$ straight down.`, t`$\vec L$ moves in the direction of $\vec\tau$. Seen from above, is that anticlockwise or clockwise from where the axle points?`],
      teach: 'The tip of L moves along the torque; for a horizontal axle, gravity’s torque is horizontal and perpendicular to the axle.',
      explain: t`With $\vec r$ pointing out along the axle and $M\vec g$ down, the right-hand rule puts $\vec r\times M\vec g$ horizontal, a quarter-turn anticlockwise (seen from above) from the axle. $\vec L$, and the axle with it, swings that way.`,
      visual: gyroScene({ phi: 20, show: ['L', 'W'], caption: 'The wheel spins so that L points away from the pivot. Drag to rotate the view.' }),
    }),
    num({
      id: 'precession-rate', difficulty: 2,
      gen(r) {
        const R = r.pick([0.025, 0.03, 0.035]), n = r.pick([3000, 4000, 6000]), rr = r.pick([0.03, 0.04, 0.05]), M = r.pick([0.12, 0.15, 0.2]);
        const w = n * RPM, W = (M * G * rr) / (0.5 * M * R * R * w);
        return {
          prompt: t`A toy gyroscope's rotor is a uniform disk ($I = \tfrac12 MR^2$) of mass ${M} kg and radius ${+(R * 100).toFixed(2)} cm, spinning at ${n.toLocaleString('en-US')} rpm. Its centre of mass is ${+(rr * 100).toFixed(2)} cm from the pivot, with the axle horizontal. Treating all of the gyroscope's mass as the rotor's, how fast does it precess?`,
          answer: W, units: 'rad/s', tol: { rel: 0.01 },
          errors: [
            { value: W / 2, feedback: t`For a disk, $I = \tfrac12 MR^2$ — you used $MR^2$.` },
            { value: (M * G * rr) / (0.5 * M * R * R * n), feedback: 'Convert the spin from rpm to rad/s first: multiply by 2π/60.' },
            { value: (0.5 * M * R * R * w) / (M * G * rr), feedback: t`Upside down: $\Omega = \tau/L$, torque over angular momentum.` },
          ],
          hints: [t`$\Omega = \dfrac{\tau}{L} = \dfrac{Mgr}{I\omega}$ with $\omega$ in rad/s.`, t`$\omega = ${n}\times2\pi/60$ rad/s and $I = \tfrac12(${M})(${R})^2$.`],
          teach: 'Precession rate is torque over angular momentum: Ω = Mgr/(Iω).',
          explain: t`$L = \tfrac12(${M})(${R})^2(${s3(w)}) = ${s3(0.5 * M * R * R * w)}\ \text{kg·m}^2/\text{s}$ and $\tau = (${M})(9.8)(${rr}) = ${s3(M * G * rr)}$ N·m, so $\Omega = ${s3(W)}$ rad/s. The mass cancels: $\Omega = 2gr/(R^2\omega)$ for a disk rotor.`,
          visual: gyroScene({ phi: 35, show: ['L', 'W', 'tau'], caption: 'The gyroscope on its pivot. Arrows show directions only. Drag to rotate the view.' }),
        };
      },
    }),
    mcq({
      id: 'defy', difficulty: 2,
      prompt: 'Why does a fast-spinning gyroscope, supported at one end of its horizontal axle, not fall?',
      choices: [
        'Gravity’s torque is horizontal, so it turns L sideways instead of tipping the axle — and the pivot pushes up with the full weight',
        'The spin cancels gravity, so a spinning wheel is weightless',
        'The spinning wheel pushes on the air, which holds it up',
        'A spinning body’s angular momentum resists every torque, so nothing can change it',
      ],
      answer: 0,
      why: {
        1: 'A spinning wheel weighs exactly what a still one does: put the pivot on a scale and it reads the full Mg.',
        2: 'A gyroscope precesses just the same in a vacuum chamber.',
        3: t`Torques do change $\vec L$, at the rate $\vec\tau = d\vec L/dt$. Here the change is sideways, so the direction of $\vec L$ turns.`,
      },
      hints: ['What does the pivot have to push with, vertically? Is the centre of mass accelerating up or down?', t`Which way does $d\vec L = \vec\tau\,dt$ point?`],
      teach: 'A gyroscope does not defy gravity: its weight is fully supported, and gravity’s torque turns its angular momentum sideways.',
      explain: t`Vertically, the forces balance: the pivot pushes up with $Mg$. About the pivot, the weight's torque is horizontal and perpendicular to $\vec L$, so it swings $\vec L$ round. A wheel with no spin has $\vec L = 0$, and the same torque simply makes it fall.`,
      visual: gyroScene({ phi: 30, show: ['L', 'W', 'N'], caption: 'The forces on the gyroscope: its weight and the pivot’s upward push. Drag to rotate the view.' }),
    }),
    mcq({
      id: 'faster', difficulty: 1,
      prompt: 'You spin the same gyroscope twice as fast, keeping everything else the same. Its precession rate becomes:',
      choices: ['Half as large', 'Twice as large', 'Unchanged: the torque is the same', 'A quarter as large'],
      answer: 0,
      why: {
        1: 'More spin means more L to swing round; the same torque turns a larger L more slowly.',
        2: t`The torque is the same, but $\Omega = \tau/L$ depends on $L$ too.`,
        3: t`$\Omega$ goes as $1/\omega$, not $1/\omega^2$.`,
      },
      hints: [t`$\Omega = \tau/L$ with $L = I\omega$.`],
      teach: 'Precession is slower for a faster spin: Ω = τ/(Iω).',
      explain: t`Doubling $\omega$ doubles $L$; the torque $Mgr$ is unchanged, so $\Omega = \tau/L$ halves.`,
      visual: gyroScene({ phi: 50, show: ['L', 'tau', 'circle'], caption: 'The tip of L sweeps round the dashed circle; the torque always points along that circle. Drag to rotate the view.' }),
    }),
    num({
      id: 'spin-needed', difficulty: 2,
      gen(r) {
        const M = r.pick([1.8, 2.2, 2.6]), R = r.pick([0.3, 0.33, 0.35]), rr = r.pick([0.15, 0.2, 0.25]), T = r.pick([15, 20, 30]);
        const w = (M * G * rr * T) / (2 * Math.PI * M * R * R);
        return {
          prompt: t`You want a bicycle wheel (a hoop: $I = MR^2$, with $M = ${M}$ kg and $R = ${R}$ m), held by its axle ${rr} m from its centre, to precess slowly: one full turn every ${T} s. How fast must it spin?`,
          answer: w, units: 'rad/s', tol: { rel: 0.01 },
          errors: [{ value: (M * G * rr * T) / (M * R * R), feedback: t`The precession rate is $\Omega = 2\pi/T$, not $1/T$.` }, { value: (2 * Math.PI * M * R * R) / (M * G * rr * T), feedback: t`Solve $\Omega = Mgr/(I\omega)$ for $\omega$: $\omega = Mgr/(I\Omega)$.` }],
          hints: [t`The precession rate is $\Omega = 2\pi/T$.`, t`$\Omega = \dfrac{Mgr}{I\omega}$ gives $\omega = \dfrac{Mgr}{I\Omega}$.`],
          teach: 'The slower you want the precession, the faster the spin must be: ω = Mgr/(IΩ).',
          explain: t`$\Omega = 2\pi/${T} = ${s3((2 * Math.PI) / T)}$ rad/s and $I = ${s3(M * R * R)}\ \text{kg·m}^2$, so $\omega = \dfrac{(${M})(9.8)(${rr})}{(${s3(M * R * R)})(${s3((2 * Math.PI) / T)})} = ${s3(w)}$ rad/s — about ${Math.round(w / RPM)} rpm.`,
          visual: gyroScene({ phi: 25, show: ['L', 'W', 'tau'], caption: 'The wheel on its axle. Arrows show directions only. Drag to rotate the view.' }),
        };
      },
    }),
    num({
      id: 'reaction-wheel', difficulty: 3,
      gen(r) {
        const Isc = r.pick([800, 1500, 2500]), Iw = r.pick([0.05, 0.08, 0.12]), n = r.pick([2000, 3000, 4000]);
        const wsc = (Iw * n * RPM) / Isc;
        return {
          prompt: t`A space telescope ($I = ${Isc.toLocaleString('en-US')}\ \text{kg·m}^2$ about an axis) is at rest. A reaction wheel aligned with that axis ($I = ${Iw}\ \text{kg·m}^2$) is spun up from rest to ${n.toLocaleString('en-US')} rpm by a motor inside the telescope. How fast does the telescope turn, in degrees per second?`,
          answer: wsc * DEG, units: 'deg/s', tol: { rel: 0.01 },
          errors: [{ value: ((Iw * n) / Isc), feedback: 'Convert rpm to rad/s (× 2π/60) before using the angular momenta, then convert the answer to degrees.' }, { value: ((Isc * n * RPM) / Iw) * DEG, feedback: t`The ratio is the other way up: $\omega_\text{sc} = \omega_\text{w}I_\text{w}/I_\text{sc}$ — the big telescope turns slowly.` }],
          hints: [
            t`The motor's torques on the wheel and on the telescope are internal: total $L$ stays zero.`,
            t`$I_\text{w}\omega_\text{w} + I_\text{sc}\omega_\text{sc} = 0$, so the telescope turns the other way at $\omega_\text{sc} = I_\text{w}\omega_\text{w}/I_\text{sc}$.`,
            t`$\omega_\text{w} = ${n}\times2\pi/60$ rad/s; multiply the result by $180/\pi$ for degrees.`,
          ],
          teach: 'With no external torque, spinning a reaction wheel one way turns the spacecraft the other way: I_w ω_w = −I_sc ω_sc.',
          explain: t`$\omega_\text{w} = ${s3(n * RPM)}$ rad/s, so $\omega_\text{sc} = (${Iw})(${s3(n * RPM)})/${Isc} = ${s3(wsc)}$ rad/s $= ${s3(wsc * DEG)}$° per second, opposite to the wheel. Stop the wheel and the telescope stops — no propellant used.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 2.2, aspect: 'wide', grid: false, yaw: 0.65, pitch: 0.4,
              segments: [[[-1, -1, -0.6], [1, -1, -0.6]], [[1, -1, -0.6], [1, 1, -0.6]], [[1, 1, -0.6], [-1, 1, -0.6]], [[-1, 1, -0.6], [-1, -1, -0.6]], [[-1, -1, 0.6], [1, -1, 0.6]], [[1, -1, 0.6], [1, 1, 0.6]], [[1, 1, 0.6], [-1, 1, 0.6]], [[-1, 1, 0.6], [-1, -1, 0.6]], [[-1, -1, -0.6], [-1, -1, 0.6]], [[1, -1, -0.6], [1, -1, 0.6]], [[1, 1, -0.6], [1, 1, 0.6]], [[-1, 1, -0.6], [-1, 1, 0.6]]].map(([from, to]) => ({ from, to, color: 'ink3' })),
              curves: [{ param: ['0.45cos(t)', '0.45sin(t)', '0'], t: [0, 6.2832], color: 'accent', width: 2.4 }],
              vectors: [{ to: [0, 0, 1.6], color: 'accent', label: '\\vec L_\\text{wheel}' }, { from: [0.8, 0.8, 0], to: [0.8, 0.8, -1.6], color: 'bad', label: '\\vec L_\\text{telescope}' }],
            },
            caption: 'The telescope’s body (box) and its reaction wheel (blue ring). Their angular momenta are equal and opposite, so the total stays zero. Drag to rotate; not to scale.',
          },
        };
      },
    }),
    num({
      id: 'earth-axis', difficulty: 2,
      prompt: t`Earth's spin axis, tilted 23.4° from the perpendicular to its orbit, precesses like a top: the Sun's and the Moon's pulls on Earth's equatorial bulge supply the torque, and the axis goes once round its cone every $25\,772$ years. Through what angle around the cone does it move each year, in arcseconds? ($1° = 3600''$)`,
      answer: 1296000 / 25772, units: 'arcsec', tol: { rel: 0.005 },
      errors: [{ value: 360 / 25772, feedback: 'That is in degrees. Multiply by 3600 to get arcseconds.' }, { value: 129600000 / 25772, feedback: 'That is per century; the question asks per year.' }],
      hints: [t`One full turn is $360° = 1\,296\,000''$.`, t`Divide by the $25\,772$ years a turn takes.`],
      teach: 'Earth’s axis precesses once in about 25 800 years — about 50″ a year — driven by the Sun’s and Moon’s torques on its equatorial bulge.',
      explain: t`$1\,296\,000''/25\,772 = ${s3(1296000 / 25772)}''$ a year — about $5030''$ a century. That slow wobble of our own reference directions is most of the roughly $5600''$ per century by which Mercury's perihelion *appears* to advance, as seen from Earth; Le Verrier's unexplained remainder, $43''$, is where Newton's gravity first failed ([Newton's gravity and the 43 arcseconds it cannot explain](#/lesson/gr.S01.i)).`,
      visual: earthAxis,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rate', difficulty: 2,
      gen(r) {
        const I = r.pick([0.02, 0.03, 0.04]), w = r.pick([100, 150, 200]), M = r.pick([1.0, 1.5]), rr = r.pick([0.1, 0.15]);
        const W = (M * G * rr) / (I * w);
        return {
          prompt: t`A gyroscope's rotor ($I = ${I}\ \text{kg·m}^2$) spins at ${w} rad/s. The gyroscope's mass is ${M} kg and its centre of mass is ${rr} m from the pivot, with the axle horizontal. What is its precession rate?`,
          answer: W, units: 'rad/s', tol: { rel: 0.01 },
          hints: [t`$\Omega = Mgr/(I\omega)$.`],
          teach: 'Precession rate = torque ÷ spin angular momentum.',
          explain: t`$\Omega = \dfrac{(${M})(9.8)(${rr})}{(${I})(${w})} = ${s3(W)}$ rad/s.`,
          visual: gyroScene({ phi: 40, show: ['L', 'W', 'tau'], caption: 'The gyroscope on its pivot. Arrows show directions only. Drag to rotate the view.' }),
        };
      },
    }),
    mcq({
      id: 'cp-reverse', difficulty: 2,
      prompt: 'Now the wheel spins the other way, so its angular momentum points along the axle toward the pivot (as drawn). Which way does the axle swing, seen from above?',
      choices: ['Clockwise', 'Anticlockwise', 'It tips down: reversing the spin cancels the precession', 'It does not move at all'],
      answer: 0,
      why: {
        1: 'The torque has not changed (it depends only on where the weight hangs), but L now points the other way, so adding the same dL turns it the opposite way round.',
        2: 'Any fast spin gives precession; reversing it reverses the sense of precession.',
        3: 'The torque is still there, so L must still change.',
      },
      hints: [t`The torque $\vec r\times M\vec g$ is the same as before. Where is $\vec L$'s tip now, and which way does adding $\vec\tau\,dt$ move it?`],
      teach: 'Reversing a gyroscope’s spin reverses the sense of its precession: dL follows the torque, and the torque does not care about the spin.',
      explain: t`The weight's torque about the pivot is unchanged. $\vec L$ now points inward, and adding $d\vec L = \vec\tau\,dt$ to an inward-pointing $\vec L$ swings it — and the axle — clockwise seen from above.`,
      visual: gyroScene({ phi: 20, show: ['L', 'W'], inward: true, Lsize: 1.1, caption: 'This time L points along the axle toward the pivot. Drag to rotate the view.' }),
    }),
    num({
      id: 'cp-spin-sat', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([300, 400, 600]), n = r.pick([30, 60]), tau = r.pick([1.0, 1.5, 2.0]), dt = r.pick([5, 10, 20]);
        const L = I * n * RPM, th = (tau * dt) / L;
        return {
          prompt: t`A spin-stabilised satellite ($I = ${I}\ \text{kg·m}^2$ about its spin axis) spins at ${n} rpm. To re-point it, a thruster applies a torque of ${tau} N·m perpendicular to the spin axis for ${dt} s. Through what angle does the spin axis turn, in degrees?`,
          answer: th * DEG, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: ((tau * dt) / (I * n)) * DEG, feedback: 'Convert the spin to rad/s before computing L = Iω.' }],
          hints: [
            t`The torque adds $\Delta\vec L = \vec\tau\,\Delta t$, at right angles to $\vec L$.`,
            t`A small sideways $\Delta L$ turns $\vec L$ through the angle $\Delta\theta \approx \Delta L/L$ radians.`,
            t`$L = I\omega$ with $\omega = ${n}\times2\pi/60$ rad/s; convert the angle to degrees at the end.`,
          ],
          teach: 'A torque perpendicular to a spin turns the spin axis by Δθ ≈ τΔt/L — the reason spinning satellites hold their direction so well.',
          explain: t`$L = (${I})(${s3(n * RPM)}) = ${s3(L)}\ \text{kg·m}^2/\text{s}$ and $\Delta L = (${tau})(${dt}) = ${tau * dt}\ \text{kg·m}^2/\text{s}$, so $\Delta\theta = ${s3(th)}$ rad $= ${s3(th * DEG)}$°. The same physics, with no torque at all, kept the gyroscopes of Gravity Probe B pointing — so steadily that the 6.6″-a-year turning predicted by general relativity could be measured ([Carrying an arrow around a curved world](#/lesson/gr.S13.i)).`,
          visual: spinSat,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §11.4 Precession of a Gyroscope', url: 'https://openstax.org/books/university-physics-volume-1/pages/11-4-precession-of-a-gyroscope' },
    { label: 'Everitt et al. (2011), Gravity Probe B: final results, Phys. Rev. Lett. 106, 221101', url: 'https://arxiv.org/abs/1105.3456' },
  ],
});
