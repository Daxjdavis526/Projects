// Plane waves and wave vectors: the 3D wave equation u_tt = v²∇²u, solved by
// e^{i(k·r − ωt)} exactly when ω = v|k|. Wavefronts are planes ⟂ k spaced
// 2π/|k|; along any other line the pattern looks longer and faster (trace
// wavelength 2π/kₓ, trace speed ω/kₓ ≥ v) — which is how arrays find
// directions. Two crossing plane waves make fringes; phased arrays steer by
// a phase step; LIGO's two sites time a gravitational plane wave.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tn } from './_wv.js';

const t = String.raw;
const C = 299792458;
const DEG = Math.PI / 180;

// a plane wave cos(kx x + ky y) seen from above, crests gold; optional k arrow (scaled to length L)
function planePic(kx, ky, caption, o = {}) {
  const K = Math.hypot(kx, ky), L = o.L ?? 1.6;
  return {
    type: 'c3-contour',
    params: {
      f: o.f || `cos(${kx}*x + ${ky}*y)`, x: o.x || [-4, 4], y: o.y || [-2.5, 2.5], levels: { from: -0.6, to: 0.6, step: 0.6 }, labels: false, fill: true, n: 140,
      arrows: o.arrow === false ? [] : [{ from: [0, 0], to: [(L * kx) / K, (L * ky) / K], color: 'bad', label: o.label ?? 'k⃗' }],
      xlabel: o.xlabel ?? 'x (m)', ylabel: o.ylabel ?? 'y (m)', ...(o.more || {}),
    },
    caption,
  };
}

// the worked example: a plane sound wave arriving at a ground array
const EX = (() => {
  const v = 343, kx = 12, kz = -5, K = Math.hypot(kx, kz), lam = (2 * Math.PI) / K, w = v * K, f = w / (2 * Math.PI);
  const elev = Math.asin(-kz / K) / DEG, lamx = (2 * Math.PI) / kx, vx = w / kx;
  return { v, kx, kz, K, lam, w, f, elev, lamx, vx };
})();

export default lesson({
  id: 'phys3750.W7.1',
  title: 'Plane waves and wave vectors',
  minutes: 15, difficulty: 3,
  intro: t`In three dimensions the wave equation reads $\partial_t^2u = v^2\nabla^2u$, with $\nabla^2 = \partial_x^2 + \partial_y^2 + \partial_z^2$. Its simplest solutions are **plane waves**:

$$u(\vec r, t) = \tilde A\,e^{i(\vec k\cdot\vec r - \omega t)}, \qquad \omega = v\,|\vec k|$$

Each $\partial_x$ brings down $ik_x$, so $\nabla^2 \to -|\vec k|^2$ and $\partial_t^2 \to -\omega^2$: the equation holds exactly when $\omega = v|\vec k|$. The **wave vector** $\vec k$ points the way the wave travels; the crests are planes $\vec k\cdot\vec r = $ const, perpendicular to $\vec k$ and $\lambda = 2\pi/|\vec k|$ apart. Like sines in one dimension, plane waves are a complete set: any 3D wave is a superposition of them.`,
  symbols: [
    { tex: '\\vec r = (x, y, z)', text: 'position, in m' },
    { tex: '\\vec k = (k_x, k_y, k_z)', text: 'the wave vector, in rad/m: its direction is the direction of travel, its length $|\\vec k| = 2\\pi/\\lambda$' },
    { tex: '\\omega', text: 'the angular frequency, in rad/s — the same at every point' },
    { tex: 'v', text: 'the wave speed of the medium, in m/s' },
    { tex: '\\tilde A', text: 'the complex amplitude: size and phase of the wave (the physical field is its real part)' },
  ],
  why: t`Light, sound, seismic waves and gravitational waves far from their sources are plane waves; wave vectors are how antenna arrays, interferometers and detectors reason about direction.`,
  visual: {
    type: 'c3-contour',
    title: 'A plane wave from above',
    lead: t`A snapshot of $\cos(\vec k\cdot\vec r - \omega t)$ in the $xy$-plane: gold bands are crests, blue troughs, and the red arrow is $\vec k$. The readouts give the components and what the wave looks like along the $x$-axis.`,
    tasks: [
      t`Turn the direction $\theta$: the crests always stay perpendicular to $\vec k$.`,
      t`Advance the time through one period: every crest moves one wavelength along $\vec k$.`,
      t`Raise $\theta$ toward 90°: along the $x$-axis the crests get farther apart and $\lambda_x = \lambda/\cos\theta$ grows without limit.`,
    ],
    params: {
      f: 'cos(2*pi/lam*(cos(th*pi/180)*x + sin(th*pi/180)*y) - 2*pi*ph)', x: [-4, 4], y: [-2.5, 2.5], levels: { from: -0.6, to: 0.6, step: 0.6 }, labels: false, fill: true, n: 150,
      sliders: [
        { key: 'th', label: 'Direction $\\theta$', min: 0, max: 85, step: 1, value: 30, unit: '^\\circ', explain: 'The angle of $\\vec k$ from the $x$-axis.' },
        { key: 'lam', label: 'Wavelength $\\lambda$', min: 0.8, max: 3, step: 0.05, value: 1.5, unit: '\\mathrm{m}', explain: 'The spacing of the crests, measured along $\\vec k$: $|\\vec k| = 2\\pi/\\lambda$.' },
        { key: 'ph', label: 'Time $t/T$', min: 0, max: 1, step: 0.01, value: 0, unit: '', explain: 'The time as a fraction of one period $T = 2\\pi/\\omega$.' },
      ],
      arrows: [{ from: [0, 0], to: ['1.6*cos(th*pi/180)', '1.6*sin(th*pi/180)'], color: 'bad', label: 'k⃗' }],
      readouts: [
        { label: t`$k_x$`, expr: '2*pi/lam*cos(th*pi/180)', unit: '\\mathrm{rad/m}', digits: 3 },
        { label: t`$k_y$`, expr: '2*pi/lam*sin(th*pi/180)', unit: '\\mathrm{rad/m}', digits: 3 },
        { label: t`$\lambda_x = 2\pi/k_x$`, expr: 'lam/cos(th*pi/180)', unit: '\\mathrm{m}', digits: 3 },
      ],
      xlabel: 'x (m)', ylabel: 'y (m)',
    },
    caption: t`One snapshot of an infinite plane wave in the $xy$-plane (in 3D the crests are planes standing on these lines). Shading shows the value; the arrow’s length is not to scale.`,
  },
  example: {
    prompt: t`A distant aircraft’s engine tone reaches a field of ground microphones as a plane sound wave $p = p_0\cos(\vec k\cdot\vec r - \omega t)$ with $\vec k = (${EX.kx}, 0, ${EX.kz})$ rad/m ($x$ east, $z$ up) in air at $v = ${EX.v}$ m/s. Find its wavelength, frequency and direction, and what the microphones along the $x$-axis see.`,
    steps: [
      { label: 'Length of k', text: t`$|\vec k| = \sqrt{${EX.kx}^2 + ${-EX.kz}^2} = ${tn(EX.K)}$ rad/m, so $\lambda = 2\pi/|\vec k| = ${tn(EX.lam)}$ m.` },
      { label: 'Frequency', text: t`The wave equation demands $\omega = v|\vec k| = ${tn(EX.w, 4)}$ rad/s: $f = ${tn(EX.f)}$ Hz.` },
      { label: 'Direction', text: t`$\hat k = (${EX.kx}, 0, ${EX.kz})/${tn(EX.K)}$: travelling east and **down**, at $\arcsin(${-EX.kz}/${tn(EX.K)}) = ${tn(EX.elev)}^\circ$ below the horizontal — so the source is up to the west.` },
      { label: 'Along the ground', text: t`At $z = 0$, $p = p_0\cos(${EX.kx}x - \omega t)$: crests ${tn(EX.lamx)} m apart, sweeping along at $\omega/k_x = ${tn(EX.vx)}$ m/s — **faster** than sound.` },
      { label: 'Sense check', text: t`Nothing travels at ${tn(EX.vx)} m/s: the intersection of a tilted wavefront with the ground moves faster than the wavefront, like the point where a wave meets a beach. That **trace speed** $v/\cos(\text{elevation})$ is what the array measures to find the elevation.` },
    ],
    answer: t`$\lambda = ${tn(EX.lam)}$ m, $f = ${tn(EX.f)}$ Hz, arriving from the west at ${tn(EX.elev)}° elevation; along the ground the pattern has wavelength ${tn(EX.lamx)} m and trace speed ${tn(EX.vx)} m/s.`,
    visual: planePic(EX.kx, EX.kz, t`The wave in the vertical $xz$-plane ($x$ east, $z$ up), crests gold, $\vec k$ red. The ground is the line $z = 0$; lengths in m.`, { x: [-1.5, 1.5], y: [-0.94, 0.94], L: 0.6, ylabel: 'z (m)', more: { curves: [{ param: ['t', '0'], t: [-1.5, 1.5], color: 'ink', width: 2 }] } }),
  },
  practice: [
    num({
      id: 'freq-from-k', difficulty: 2,
      gen(r) {
        const [kx, ky, kz] = r.pick([[3, 4, 0], [2, 3, 6], [1, 4, 8], [6, 0, 8], [2, 6, 9]]), v = r.pick([343, 1480]);
        const K = Math.hypot(kx, ky, kz), f = (v * K) / (2 * Math.PI);
        return {
          prompt: t`A plane wave $\cos(${kx}x + ${ky}y + ${kz}z - \omega t)$ (wavenumbers in rad/m) travels through ${v === 343 ? 'air' : 'water'} at $v = ${v}$ m/s. What is its frequency, in Hz?`,
          visual: planePic(kx, ky, t`The wave’s crests (gold) in the plane $z = 0$; the arrow shows the $xy$-part of $\vec k$.`),
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: (v * (kx + ky + kz)) / (2 * Math.PI), feedback: t`$|\vec k|$ is the length $\sqrt{k_x^2 + k_y^2 + k_z^2}$, not the sum of the components.` }, { value: v * K, feedback: t`That is $\omega$; divide by $2\pi$.` }],
          hints: [t`$\omega = v|\vec k|$ with $|\vec k| = \sqrt{${kx}^2 + ${ky}^2 + ${kz}^2}$.`, t`$f = \omega/2\pi$.`],
          teach: t`Any plane wave in a non-dispersive medium has $\omega = v|\vec k|$: the frequency depends on the length of $\vec k$, not its direction.`,
          explain: t`$|\vec k| = ${tn(K)}$ rad/m, $\omega = ${tn(v * K)}$ rad/s, $f = ${tn(f)}$ Hz.`,
        };
      },
    }),
    expr({
      id: 'omega-from-eq', difficulty: 2,
      prompt: t`Substitute $u = \cos(ax + by + cz - \omega t)$ into $u_{tt} = v^2(u_{xx} + u_{yy} + u_{zz})$. What must $\omega$ be (taking $\omega > 0$)?`,
      visual: planePic(1, 1.6, t`A plane wave in the plane $z = 0$; its wave vector is $(a, b, c)$.`),
      answer: 'v*sqrt(a^2 + b^2 + c^2)', answerTeX: t`v\sqrt{a^2 + b^2 + c^2}`, lhs: '\\omega',
      vars: { a: [0.5, 3], b: [0.5, 3], c: [0.5, 3], v: [1, 5] },
      errors: [{ answer: 'v*(a + b + c)', feedback: t`Each second derivative brings down the **square** of its coefficient: $u_{xx} = -a^2u$.` }, { answer: 'v*(a^2 + b^2 + c^2)', feedback: t`$-\omega^2u = -v^2(a^2 + b^2 + c^2)u$: take the square root.` }],
      hints: [t`$u_{tt} = -\omega^2u$ and $u_{xx} = -a^2u$, and likewise for $y$ and $z$.`, t`So $\omega^2 = v^2(a^2 + b^2 + c^2)$.`],
      teach: t`For a plane wave, $\nabla^2 \to -|\vec k|^2$ and $\partial_t^2 \to -\omega^2$: the PDE becomes the algebra $\omega^2 = v^2|\vec k|^2$.`,
      explain: t`$-\omega^2 = -v^2(a^2 + b^2 + c^2)$, so $\omega = v\sqrt{a^2 + b^2 + c^2} = v|\vec k|$. Any direction works, provided the frequency matches the length of $\vec k$.`,
    }),
    {
      type: 'point', id: 'drag-k', difficulty: 2,
      gen(r) {
        const [kx, ky] = r.pick([[3, 4], [-2, 3], [4, -1], [-3, -2], [1, 3]]);
        return {
          prompt: t`A wave is $\cos(${kx}x ${ky < 0 ? '-' : '+'} ${Math.abs(ky)}y - \omega t)$ with $x, y$ in m. Drag the point to the tip of its wave vector $\vec k$, drawn from the origin in the $(k_x, k_y)$ plane.`,
          visual: { type: 'graph', params: { x: [-5, 5], y: [-5, 5], equal: true, aspect: 'wide', xlabel: 'kₓ (rad/m)', ylabel: 'k (y-part, rad/m)', drag: [{ key: 'p', x: 0.5, y: 0.5, snap: 0.1 }], points: [{ x: 0, y: 0, color: 'ink3', r: 3 }] }, caption: t`The plane of wave vectors (components in rad/m).` },
          answer: { x: kx, y: ky }, tol: { x: 0.3, y: 0.3 },
          instruction: 'Drag the point to the tip of k, then check.',
          hints: [t`$\vec k\cdot\vec r = k_xx + k_yy$: read the coefficients.`, t`$\vec k = (${kx}, ${ky})$ rad/m.`],
          teach: t`The wave vector’s components are the coefficients of $x$, $y$, $z$ in the phase.`,
          explain: t`$\vec k = (${kx}, ${ky})$ rad/m, length $${tn(Math.hypot(kx, ky))}$ rad/m: wavelength $${tn((2 * Math.PI) / Math.hypot(kx, ky))}$ m, travelling at $${tn(Math.atan2(ky, kx) / DEG)}^\circ$ from the $x$-axis.`,
        };
      },
    },
    num({
      id: 'trace-wavelength', difficulty: 2,
      gen(r) {
        const lam = r.pick([0.2, 0.5, 1.2]), th = r.pick([30, 50, 65, 75]);
        const lx = lam / Math.cos(th * DEG);
        return {
          prompt: t`A plane wave of wavelength ${lam} m travels at $${th}^\circ$ to a line of sensors (the $x$-axis). What wavelength does the line of sensors record, i.e. the distance between crests along the $x$-axis, in m?`,
          visual: planePic(Math.cos(th * DEG) * 2 * Math.PI / 1.4, Math.sin(th * DEG) * 2 * Math.PI / 1.4, t`Crests (gold) crossing the $x$-axis at an angle; along the axis they are farther apart than along $\vec k$ (scale illustrative).`, { arrow: true }),
          answer: lx, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: lam * Math.cos(th * DEG), feedback: t`Along a slanted line the crests are **farther** apart: $\lambda_x = \lambda/\cos\theta$.` }, { value: lam / Math.sin(th * DEG), feedback: t`$\theta$ is measured from the $x$-axis, so $k_x = |\vec k|\cos\theta$.` }],
          hints: [t`$k_x = |\vec k|\cos\theta$.`, t`$\lambda_x = 2\pi/k_x = \lambda/\cos\theta$.`],
          teach: t`Along any line at angle $\theta$ to $\vec k$, a plane wave shows the longer wavelength $\lambda/\cos\theta$ and the faster trace speed $v/\cos\theta$.`,
          explain: t`$\lambda_x = ${lam}/\cos ${th}^\circ = ${tn(lx)}$ m.`,
        };
      },
    }),
    num({
      id: 'fringes', difficulty: 3,
      gen(r) {
        const lam = r.pick([0.633, 0.532, 1.064]), a = r.pick([30, 60, 90, 120]);    // μm, degrees
        const s = lam / (2 * Math.sin((a * DEG) / 2));
        const ang = (a * DEG) / 2;
        return {
          prompt: t`Two laser beams of wavelength ${lam} μm cross at an angle of $${a}^\circ$ — two plane waves with $\vec k_{1,2} = |\vec k|(\cos\tfrac{\alpha}{2}, \pm\sin\tfrac{\alpha}{2}, 0)$. Their sum has bright fringes where the waves are in step. What is the fringe spacing, in μm?`,
          visual: planePic(1, 0, t`The two waves’ sum, $\cos(\vec k_1\cdot\vec r) + \cos(\vec k_2\cdot\vec r)$, from above: the bright and dark bands running along the beams’ direction are the fringes. (Lengths in units of λ.)`, { f: `cos(2*pi*(cos(${ang < 0.3 ? 0.3 : ang})*x + sin(${ang < 0.3 ? 0.3 : ang})*y)) + cos(2*pi*(cos(${ang < 0.3 ? 0.3 : ang})*x - sin(${ang < 0.3 ? 0.3 : ang})*y))`, arrow: false, x: [-3, 3], y: [-1.875, 1.875], xlabel: 'x (λ)', ylabel: 'y (λ)' }),
          answer: s, units: 'um', tol: { rel: 0.01 },
          errors: [{ value: lam / Math.sin(a * DEG), feedback: t`The difference of the wave vectors has length $2|\vec k|\sin(\alpha/2)$, so the spacing is $\lambda/(2\sin\frac\alpha2)$, not $\lambda/\sin\alpha$.` }, { value: lam / (2 * Math.sin(a * DEG)), feedback: t`Use half the crossing angle in the sine.` }].filter((e) => Math.abs(e.value - s) > 0.02 * s),
          hints: [t`$\cos(\vec k_1\cdot\vec r) + \cos(\vec k_2\cdot\vec r) = 2\cos\big(\tfrac{(\vec k_1 - \vec k_2)\cdot\vec r}{2}\big)\cos\big(\tfrac{(\vec k_1 + \vec k_2)\cdot\vec r}{2}\big)$.`, t`$\vec k_1 - \vec k_2 = (0, 2|\vec k|\sin\tfrac\alpha2, 0)$; the intensity repeats when $|\vec k_1 - \vec k_2|\,y$ grows by $2\pi$.`],
          teach: t`Two plane waves crossing at angle $\alpha$ make fringes spaced $\lambda/(2\sin\frac\alpha2)$, perpendicular to $\vec k_1 - \vec k_2$.`,
          explain: t`$${lam}/(2\sin ${a / 2}^\circ) = ${tn(s)}\ \mu\text{m}$. Holograms and the gratings written into optical fibres are made exactly this way.`,
        };
      },
    }),
    mcq({
      id: 'trace-faster', difficulty: 2,
      prompt: t`A sound wave sweeping across a line of microphones at a shallow angle makes its crests move along the line at 900 m/s, though sound travels at 343 m/s. What is going on?`,
      visual: planePic(1.2, 4, t`Crests (gold) arriving nearly head-on to the $x$-axis: where each crest crosses the axis slides along it quickly.`),
      choices: [
        'The crossing point of a tilted crest with the line moves faster than the crest itself; no energy goes at 900 m/s',
        'The air must be moving at 557 m/s along the line, adding its speed to the sound',
        'The microphones are miscalibrated, since nothing in air can move faster than sound',
        'Sound travels faster along some directions than others, so this direction is faster',
      ],
      answer: 0,
      why: {
        1: 'No wind is needed: the effect is pure geometry of a plane cutting a line.',
        2: 'The measurement is fine — it is a pattern speed, which may be anything ≥ v.',
        3: 'Air is isotropic: v is the same in every direction. The trace speed depends on the angle to the line, not on the medium.',
      },
      hints: [t`Along the line, the phase is $k_xx - \omega t$.`, t`The crests move along the line at $\omega/k_x = v/\cos\theta$, which grows as $\theta \to 90^\circ$.`],
      teach: t`A trace speed $v/\cos\theta$ along a line is a pattern speed, always $\ge v$, and carries nothing faster than $v$.`,
      explain: t`$\cos\theta = 343/900$, so the wave meets the line at $\theta = ${tn(Math.acos(343 / 900) / DEG)}^\circ$ from it — almost head-on. Arrays measure exactly this to find directions.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-phased-array', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([3, 5.5, 9.4, 10]), th = r.pick([15, 25, 40, 50]), dfrac = 0.5;
        const lam = C / (f * 1e9), d = dfrac * lam, dphi = (360 * d * Math.sin(th * DEG)) / lam;
        return {
          prompt: t`A spacecraft’s phased-array antenna has elements in a line spaced half a wavelength apart and transmits at ${f} GHz. To send a plane wave at $${th}^\circ$ from the array’s broadside (its perpendicular), by how much must the phase step from one element to the next, in degrees?`,
          visual: {
            type: 'graph',
            params: {
              x: [-3, 3], y: [-0.4, 3.2], equal: true, aspect: 'wide', xlabel: 'along the array (spacings)', ylabel: '', xticks: 7, yticks: 0,
              points: [-2, -1, 0, 1, 2].map((j) => ({ x: j, y: 0, color: 'accent', r: 5 })),
              curves: [0.8, 1.6, 2.4].map((s) => ({ param: [`t`, `${s / Math.cos(th * DEG)} - t*${Math.tan(th * DEG)}`], t: [-3, 3], color: 'gold', dash: [5, 4], width: 1.4 })),
              arrows: [{ from: [0, 0.2], to: [1.2 * Math.sin(th * DEG), 0.2 + 1.2 * Math.cos(th * DEG)], color: 'bad', label: 'k⃗' }],
            },
            caption: t`Five elements (blue) and the tilted wavefronts (dashed) they must launch; $\vec k$ is $${th}^\circ$ from broadside. Not to scale.`,
          },
          answer: dphi, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: (360 * d * Math.cos(th * DEG)) / lam, feedback: t`The angle is from broadside (the perpendicular), so the path difference between neighbours is $d\sin\theta$.` }, { value: (dphi * Math.PI) / 180, feedback: 'That is in radians; the question asks for degrees.' }],
          hints: [t`Neighbouring elements must differ in phase by $\vec k\cdot\Delta\vec r = kd\sin\theta$.`, t`With $d = \lambda/2$: $\Delta\phi = \pi\sin\theta$ rad $= 180^\circ\sin\theta$.`],
          teach: t`A line array launches a plane wave at angle $\theta$ from broadside when its phase steps by $kd\sin\theta$ per element.`,
          explain: t`$\Delta\phi = 180^\circ\sin ${th}^\circ = ${tn(dphi)}^\circ$ — independent of the frequency once $d = \lambda/2$. Changing the phase steps electronically swings the beam with no moving parts.`,
        };
      },
    }),
    num({
      id: 'cp-ligo', difficulty: 3, transfer: true,
      gen(r) {
        const dt = r.pick([6.9, 3.0, 8.5, 1.5]);    // ms
        const base = 3.002e6, cth = (C * dt * 1e-3) / base, ang = Math.acos(cth) / DEG;
        return {
          prompt: t`LIGO’s two detectors are 3002 km apart. A gravitational wave — a plane wave at $c$ by the time it arrives — reaches Livingston ${dt} ms before Hanford${dt === 6.9 ? ' (as GW150914 did)' : ''}. What angle does its direction of travel make with the line from Livingston to Hanford, in degrees?`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.3, 3.4], y: [-0.4, 1.6], equal: true, aspect: 'wide', xlabel: 'Livingston → Hanford (1000 km)', ylabel: '', xticks: 4, yticks: 0,
              points: [{ x: 0, y: 0, color: 'accent', r: 5, label: 'L', labelDy: 14 }, { x: 3.002, y: 0, color: 'accent', r: 5, label: 'H', labelDy: 14 }],
              curves: [{ param: ['t', '0'], t: [0, 3.002], color: 'ink3', width: 1.2, dash: [4, 4] }],
            },
            caption: t`The two sites and the baseline between them (the wave’s direction is what you are asked for). Earth’s curvature ignored.`,
          },
          answer: ang, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: 90 - ang, feedback: t`$c\Delta t = d\cos\theta$, where $\theta$ is the angle from the baseline itself, not from its perpendicular.` }],
          hints: [t`A plane wave reaches the second site later by $\Delta t = (\hat k\cdot\vec d)/c = d\cos\theta/c$.`, t`$\cos\theta = c\Delta t/d$.`],
          teach: t`Arrival-time differences give $\hat k\cdot\vec d = c\Delta t$: two detectors fix a cone of directions, three or more pin the source down.`,
          explain: t`$\cos\theta = (${tn(C, 4)} \times ${tn(dt * 1e-3)})/(${tn(base, 4)}) = ${tn(cth)}$, so $\theta = ${tn(ang)}^\circ$. Any direction on that cone around the baseline fits — which is why one pair localised GW150914 only to a ring on the sky.`,
        };
      },
    }),
    mcq({
      id: 'cp-wavefront', difficulty: 2,
      prompt: t`For the plane wave $\cos(\vec k\cdot\vec r - \omega t)$, which statement about its crests at one instant is true?`,
      visual: planePic(2, 3, t`One instant of a plane wave from above; $\vec k$ in red.`),
      choices: [
        t`They are planes perpendicular to $\vec k$, a distance $2\pi/|\vec k|$ apart`,
        t`They are planes parallel to $\vec k$, a distance $2\pi/|\vec k|$ apart`,
        t`They are planes perpendicular to $\vec k$, a distance $|\vec k|/2\pi$ apart`,
        t`They are spheres centred on the origin, a distance $2\pi/|\vec k|$ apart`,
      ],
      answer: 0,
      why: {
        1: t`Moving parallel to a crest keeps $\vec k\cdot\vec r$ fixed only if the motion is perpendicular to $\vec k$: so crests are perpendicular, not parallel, to $\vec k$.`,
        2: t`$|\vec k|$ is in rad/m; the spacing is a length, $\lambda = 2\pi/|\vec k|$.`,
        3: 'Spherical crests belong to a spherical wave (next lesson); a plane wave has the same phase across whole planes.',
      },
      hints: [t`A crest is a set where $\vec k\cdot\vec r$ is constant.`, t`$\vec k\cdot\vec r = $ const is a plane with normal $\vec k$.`],
      teach: t`Wavefronts of a plane wave are the planes $\vec k\cdot\vec r = $ const: normal to $\vec k$, spaced $2\pi/|\vec k|$.`,
      explain: t`Crests sit where $\vec k\cdot\vec r - \omega t = 2\pi n$: planes with normal $\vec k$, consecutive ones $2\pi/|\vec k| = \lambda$ apart, each moving along $\vec k$ at $\omega/|\vec k| = v$.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 9–10: the wave equation in three dimensions (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Abbott et al. (LIGO–Virgo), GW150914, PRL 116, 061102 (2016): 6.9 ms arrival-time difference', url: 'https://arxiv.org/abs/1602.03837' },
  ],
});
