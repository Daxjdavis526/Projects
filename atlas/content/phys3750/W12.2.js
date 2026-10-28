// Electromagnetic plane waves and polarization: the complex amplitude
// Ẽ₀ = (E_x, E_y e^{iδ}) with the course's e^{−iωt} convention. Transverse
// fields, B = k̂ × E/c in phase with E, intensity ½cε₀E₀², radiation pressure
// I/c or 2I/c. Polarization from the components' amplitudes and relative
// phase: linear, circular, elliptical, and the sense of rotation (with the
// clash of naming conventions said out loud). Contexts: sunlight's fields, a
// laser pointer, a quarter-wave plate, a solar sail, GPS antennas.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const EPS0 = 8.8541878188e-12, C = 299792458, SUN = 1361;
const E0of = (I) => Math.sqrt((2 * I) / (C * EPS0));

// the worked example: sunlight at 1 AU
const EX = (() => {
  const E0 = E0of(SUN);
  return { E0, B0: E0 / C, pa: SUN / C, pr: (2 * SUN) / C, Erms: E0 / Math.SQRT2 };
})();

/** The two field components at one place, against ωt: E_x = a cos ωt, E_y = b cos(ωt − δ) (δ in degrees). */
function componentsPic(a, b, dDeg, caption) {
  const d = (dDeg * Math.PI) / 180;
  return curvesPic([
    { fn: `${a}*cos(x)`, color: 'accent', width: 2.2, label: 'Eₓ', labelAt: 0.25, labelDy: -8 },
    { fn: `${b}*cos(x - ${+d.toFixed(6)})`, color: 'gold', width: 2.2, dash: [6, 4], label: 'E (y)', labelAt: 9.2, labelDy: -8 },
  ], [0, 4 * Math.PI], [-1.35, 1.35], caption, { xlabel: 'ωt (rad)', ylabel: 'E', yticks: 0 });
}

/** The tip of E traced in the plane facing the oncoming wave. */
function ellipsePic(a, b, dDeg, caption, more = {}) {
  const d = +((dDeg * Math.PI) / 180).toFixed(6);
  return {
    type: 'graph',
    params: { x: [-1.4, 1.4], y: [-1.3, 1.3], equal: true, aspect: 'wide', xlabel: 'Eₓ', ylabel: 'E (y)', xticks: 0, yticks: 0,
      curves: [{ param: [`${a}*cos(t)`, `${b}*cos(t - ${d})`], t: [0, 2 * Math.PI], color: 'accent', width: 2.4 }, ...(more.curves || [])],
      arrows: more.arrows || [] },
    caption,
  };
}

export default lesson({
  id: 'phys3750.W12.2',
  title: 'Electromagnetic plane waves and polarization',
  minutes: 16, difficulty: 3,
  intro: t`Try a plane wave travelling along $z$ in the wave equation of [the last lesson](#/lesson/phys3750.W12.1). With this course’s convention, $\vec E$ is the real part of a complex amplitude times $e^{i(kz - \omega t)}$, with $\omega = ck$. Gauss’s law, $\nabla\cdot\vec E = 0$, makes it **transverse**: no $z$-component. So the amplitude has two complex components, and only their relative phase $\delta$ matters:

$$\vec E = \text{Re}\Big[\big(E_x\,\hat x + E_y\,e^{i\delta}\,\hat y\big)\,e^{i(kz - \omega t)}\Big]$$

Faraday’s law then fixes $\vec B = \hat z\times\vec E/c$: perpendicular to $\vec E$, in phase with it, $c$ times smaller. The relative phase sets the **polarization**: $\delta = 0$ or $\pi$ is linear; $E_x = E_y$ with $\delta = \pm\pi/2$ is circular; anything else traces an ellipse. The intensity, $I = \tfrac12c\varepsilon_0(E_x^2 + E_y^2)$, does not care about $\delta$. [Electromagnetic waves](#/lesson/phys2220.B6.3) and [polarization](#/lesson/phys2220.O1.3) met these facts as rules; here they come from the equations.`,
  symbols: [
    { tex: 'E_x,\\ E_y', text: 'the real amplitudes of the two transverse components, in V/m' },
    { tex: '\\delta', text: 'the phase of the $y$-component relative to the $x$-component, in rad' },
    { tex: 'k,\\ \\omega', text: 'wavenumber (rad/m) and angular frequency (rad/s), with $\\omega = ck$ in vacuum' },
    { tex: '\\hat x,\\ \\hat y,\\ \\hat z', text: 'unit vectors; the wave travels along $+\\hat z$' },
    { tex: '\\text{Re}', text: 'the real part: the physical field is the real part of the complex expression' },
  ],
  why: t`Polarization is how radio and GPS antennas reject reflections, how polarimetric radar satellites read soil moisture, and — with two polarizations rotated by 45° instead of 90° — how gravitational waves (W14) differ from light.`,
  visual: {
    type: 'graph',
    title: 'The tip of the electric field',
    lead: t`You face the oncoming wave: $\hat x$ right, $\hat y$ up, the wave coming toward you. The blue curve is the path traced by the tip of $\vec E$; the gold arrow is $\vec E$ at the moment $\omega t$, and the hollow dot where it will be a little later.`,
    tasks: [
      t`Set $\delta = 0$: the tip slides back and forth on a line, at an angle set by $E_y/E_x$. Linear.`,
      t`Equal amplitudes and $\delta = 90°$: a circle. Step $\omega t$ forward — the field turns counterclockwise as you see it. With $\delta = -90°$ it turns clockwise.`,
      t`Any other $\delta$, or unequal amplitudes with $\delta = \pm90°$: an ellipse. Watch the intensity readout: it never depends on $\delta$.`,
    ],
    params: {
      x: [-1.4, 1.4], y: [-1.3, 1.3], equal: true, aspect: 'wide', xlabel: 'Eₓ', ylabel: 'E (y)', xticks: 0, yticks: 0,
      sliders: [
        { key: 'a', label: 'Amplitude $E_x$', min: 0, max: 1, step: 0.05, value: 1, unit: '', explain: 'The $x$-component’s amplitude (relative units).' },
        { key: 'b', label: 'Amplitude $E_y$', min: 0, max: 1, step: 0.05, value: 1, unit: '', explain: 'The $y$-component’s amplitude (relative units).' },
        { key: 'd', label: 'Relative phase $\\delta$', min: -180, max: 180, step: 5, value: 90, unit: '^\\circ', explain: 'How far the $y$-component’s oscillation is shifted from the $x$-component’s.' },
        { key: 'p', label: 'Moment $\\omega t$', min: 0, max: 360, step: 5, value: 30, unit: '^\\circ', explain: 'Step time forward and watch which way the field turns.' },
      ],
      curves: [{ param: ['a*cos(t)', 'b*cos(t - d*pi/180)'], t: [0, 2 * Math.PI], color: 'accent', width: 2.4 }],
      arrows: [{ from: [0, 0], to: ['a*cos(p*pi/180)', 'b*cos((p - d)*pi/180)'], color: 'gold', width: 2.6 }],
      points: [{ x: 'a*cos((p + 25)*pi/180)', y: 'b*cos((p + 25 - d)*pi/180)', color: 'gold', r: 4.5, hollow: true }],
      readouts: [{ label: 'intensity (relative)', expr: 'a^2 + b^2', digits: 3 }],
    },
    caption: t`$E_x = a\cos\omega t$, $E_y = b\cos(\omega t - \delta)$ at one point ($z = 0$). Seen facing the oncoming wave; naming conventions for “left” and “right” disagree between optics and engineering, so the picture names the turn instead.`,
  },
  example: {
    prompt: t`Sunlight reaches Earth’s orbit with intensity ${SUN} W/m². Treat it as one plane wave and find the amplitudes $E_0$ and $B_0$, and the pressure it exerts on a surface that absorbs it and on a mirror.`,
    steps: [
      { label: 'Average flux', text: t`$\vec S = \vec E\times\vec B/\mu_0$ with $B = E/c$ gives $S = \varepsilon_0cE^2$ (using $1/\mu_0c = \varepsilon_0c$). Averaging $\cos^2$ over a cycle, $I = \tfrac12c\varepsilon_0E_0^2$.` },
      { label: 'Electric field', text: t`$E_0 = \sqrt{2I/c\varepsilon_0} = ${tn(EX.E0)}$ V/m (an rms value of $${tn(EX.Erms)}$ V/m).` },
      { label: 'Magnetic field', text: t`$B_0 = E_0/c = ${tn(EX.B0 * 1e6)}\ \mu\text{T}$ — about a fifteenth of Earth’s field, flipping $10^{15}$ times a second.` },
      { label: 'Pressure', text: t`Light carries momentum $U/c$ with energy $U$. Absorbed: $p = I/c = ${tn(EX.pa * 1e6)}\ \mu\text{Pa}$. Reflected straight back the momentum reverses: $2I/c = ${tn(EX.pr * 1e6)}\ \mu\text{Pa}$.` },
      { label: 'Honest check', text: t`Sunlight is not one plane wave: it is unpolarized and spread over many frequencies, so $E_0$ here is the amplitude of a single wave carrying the same intensity. The pressure needs only the intensity, so it is exact.` },
    ],
    answer: t`$E_0 = ${tn(EX.E0)}$ V/m, $B_0 = ${tn(EX.B0 * 1e6)}\ \mu\text{T}$; pressure $${tn(EX.pa * 1e6)}\ \mu\text{Pa}$ absorbed, $${tn(EX.pr * 1e6)}\ \mu\text{Pa}$ reflected.`,
    visual: { type: 'em-wave', params: { E0: Math.round(EX.E0), phase: 60, controls: false, readouts: ['lambda', 'B0', 'I', 'p'] }, caption: 'A plane wave: E (violet) and B (teal) in phase and at right angles to the travel. Not to scale.' },
  },
  practice: [
    mcq({
      id: 'pol-state', difficulty: 2,
      gen(r) {
        const cases = [
          { a: 1, b: r.pick([0.5, 0.8, 1]), d: r.pick([0, 180]), k: 0 },
          { a: 1, b: 1, d: 90, k: 1 },
          { a: 1, b: 1, d: -90, k: 2 },
          r.bool(0.5) ? { a: 1, b: r.pick([0.4, 0.6]), d: r.pick([90, -90]), k: 3 } : { a: 1, b: 1, d: r.pick([45, -60, 135]), k: 3 },
        ];
        const C0 = cases[r.int(0, 3)];
                const why = {
          0: 'Linear needs the components in step (or exactly opposite): δ = 0 or 180°. Here the peaks of the two components do not line up.',
          1: t`Counterclockwise circular needs equal amplitudes and $E_y$ lagging $E_x$ by a quarter cycle ($\delta = +90°$).`,
          2: t`Clockwise circular needs equal amplitudes and $E_y$ leading $E_x$ by a quarter cycle ($\delta = -90°$).`,
          3: 'These amplitudes and this phase make one of the special shapes, not a general ellipse: check whether the peaks line up, or are a quarter-cycle apart with equal heights.',
        };
        delete why[C0.k];
        return {
          prompt: t`At one place a wave travelling along $+z$ has $E_x = ${C0.a === 1 ? '' : C0.a}\cos\omega t$ and $E_y = ${C0.b === 1 ? '' : C0.b}\cos(\omega t${C0.d === 0 ? '' : C0.d > 0 ? ` - ${C0.d}°` : ` + ${-C0.d}°`})$ (in kV/m). Seen by someone facing the oncoming wave ($\hat x$ right, $\hat y$ up), what is its polarization?`,
          visual: componentsPic(C0.a, C0.b, C0.d, t`The two components at one place against $\omega t$: $E_x$ (blue) and $E_y$ (gold, dashed).`),
          choices: ['Linear', 'Circular, turning counterclockwise', 'Circular, turning clockwise', 'Elliptical'],
          answer: C0.k, fixedOrder: true, why,
          hints: ['Compare the amplitudes, then how far apart the two components’ peaks are in time.', t`Equal amplitudes a quarter-cycle apart make a circle; if $E_x$ peaks first and $E_y$ a quarter-cycle later, the field turns from $+\hat x$ toward $+\hat y$: counterclockwise.`],
          teach: t`Polarization is read from the two components’ amplitudes and relative phase: in step is linear, a quarter-cycle apart with equal amplitudes is circular.`,
          explain: t`Here $E_y/E_x$ amplitudes are ${C0.b}/${C0.a} and the phase lag of $E_y$ is $${C0.d}°$: ${['linear polarization', 'circular, counterclockwise as you face the wave (positive helicity; “left-circular” in optics’ naming, “right-hand” in the IEEE’s)', 'circular, clockwise as you face the wave (negative helicity)', 'an ellipse'][C0.k]}.`,
        };
      },
    }),
    num({
      id: 'tilt', difficulty: 2,
      gen(r) {
        const a = r.pick([3, 4, 5, 6]), b = r.pick([2, 3, 7, 8]);
        const ang = (Math.atan2(b, a) * 180) / Math.PI;
        return {
          prompt: t`A wave has $E_x = ${a}\cos(kz - \omega t)$ and $E_y = ${b}\cos(kz - \omega t)$ (V/m): the components are in phase. At what angle to the $x$-axis is it linearly polarized, in degrees?`,
          visual: componentsPic(a / 8, b / 8, 0, t`The two components at one place against $\omega t$: they rise and fall together (relative scale).`),
          answer: ang, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: 90 - ang, feedback: t`That is the angle from the $y$-axis: $\tan\theta = E_y/E_x$ from the $x$-axis.` }].filter((e) => Math.abs(e.value - ang) > 1),
          hints: [t`In phase, the field is $(${a}, ${b})\cos(\ldots)$: always along one direction.`, t`$\theta = \arctan(E_y/E_x)$.`],
          teach: 'Components in phase add to one oscillating vector: linear polarization along their sum.',
          explain: t`$\theta = \arctan(${b}/${a}) = ${tn(ang)}°$, and $E_0 = \sqrt{${a}^2 + ${b}^2} = ${tn(Math.hypot(a, b))}$ V/m.`,
        };
      },
    }),
    num({
      id: 'laser-E0', difficulty: 2,
      gen(r) {
        const P = r.pick([1, 5, 50]), d = r.pick([1, 2, 3]);
        const I = (P / 1000) / (Math.PI * (d / 1000) ** 2 / 4), E0 = E0of(I);
        return {
          prompt: t`A ${P} mW laser makes a spot ${d} mm across (take the intensity as uniform over the spot). What is the amplitude $E_0$ of its electric field, in V/m?`,
          visual: { type: 'em-wave', params: { phase: 20, controls: false, readout: false }, caption: 'A linearly polarized plane wave (not to scale).' },
          answer: E0, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: E0 / Math.SQRT2, feedback: t`That is the rms field. The amplitude satisfies $I = \tfrac12c\varepsilon_0E_0^2$.` }, { value: E0of(I / 4), feedback: t`The spot’s area is $\pi d^2/4$ with $d$ the diameter — or use the radius in $\pi r^2$.` }],
          hints: [t`$I = P/A$ with $A = \pi(d/2)^2$.`, t`$E_0 = \sqrt{2I/c\varepsilon_0}$.`],
          teach: t`$I = \tfrac12c\varepsilon_0E_0^2$: the half comes from averaging $\cos^2$.`,
          explain: t`$I = ${tn(I)}$ W/m², so $E_0 = ${tn(E0)}$ V/m.`,
        };
      },
    }),
    expr({
      id: 'B-from-E', difficulty: 3,
      prompt: t`In vacuum, $\vec E = E_0\,\hat y\cos(kx - \omega t)$. Use Faraday’s law, $\nabla\times\vec E = -\partial_t\vec B$, to find $B_z(x, t)$ (no static field). Write $c$ for $\omega/k$.`,
      visual: { type: 'em-wave', params: { phase: 0, controls: false, readout: false, hide: ['B'] }, caption: 'The electric half of the wave, travelling along the gold arrow (not to scale). B is left for you.' },
      answer: '(E_0/c) cos(k x - omega t)', answerTeX: t`\frac{E_0}{c}\cos(kx - \omega t)`,
      lhs: 'B_z', vars: { E_0: [0.5, 2], c: [1, 3], k: [0.5, 2], x: [-2, 2], omega: [0.5, 2], t: [0, 2] }, keys: [['E₀', 'E_0'], ['ω', 'omega']],
      errors: [{ answer: '-(E_0/c) cos(k x - omega t)', feedback: t`$(\nabla\times\vec E)_z = \partial_xE_y = -kE_0\sin(kx - \omega t)$; then $\partial_tB_z = +kE_0\sin(\ldots)$, which integrates to $+\tfrac{k}{\omega}E_0\cos$.` }, { answer: 'E_0 c cos(k x - omega t)', feedback: t`$B$ is smaller than $E$ by a factor $c$: $B_0 = kE_0/\omega$.` }],
      hints: [t`$(\nabla\times\vec E)_z = \partial_xE_y - \partial_yE_x = \partial_xE_y$.`, t`$\partial_tB_z = -\partial_xE_y = -kE_0\sin(kx - \omega t)$… check the sign of $\partial_x\cos$, then integrate in $t$.`],
      teach: t`Faraday’s law turns a plane-wave $\vec E$ into $\vec B = \hat k\times\vec E/c$, in phase.`,
      explain: t`$\partial_xE_y = -kE_0\sin(kx - \omega t)$, so $\partial_tB_z = kE_0\sin(kx - \omega t)$ and $B_z = \tfrac{k}{\omega}E_0\cos(kx - \omega t) = \tfrac{E_0}{c}\cos(kx - \omega t)$. $\hat x\times\hat y = \hat z$: $\vec E\times\vec B$ points along the travel.`,
    }),
    mcq({
      id: 'quarter-wave', difficulty: 3,
      prompt: t`A quarter-wave plate delays the light polarized along its slow axis by a quarter cycle relative to its fast axis ($\delta$ changes by $90°$). Linearly polarized light enters with its field at $45°$ to the two axes. What comes out?`,
      visual: ellipsePic(0.9, 0.9, 0, t`The incoming field (blue line), at 45° to the plate’s axes (along $x$ and $y$).`, { curves: [{ param: ['0.9*cos(t)', '0.9*sin(t)'], t: [0, 2 * Math.PI], color: 'gold', dash: [5, 4], width: 1.2 }] }),
      choices: ['Circularly polarized light', 'Linear light turned through 90°', 'Linear light turned through 45°, along one axis', 'Unpolarized light'],
      answer: 0,
      why: {
        1: t`Turning the line by 90° needs a half cycle of delay ($\delta = 180°$): a half-wave plate.`,
        2: 'The plate passes both components; it only shifts their relative phase, so the field cannot collapse onto one axis.',
        3: 'A fixed phase delay keeps the light perfectly polarized; unpolarized light has a randomly changing phase.',
      },
      hints: ['At 45°, the components along the two axes have equal amplitudes.', t`Equal amplitudes with $\delta = 90°$ is the circular case.`],
      teach: 'A quarter-wave plate at 45° to linear light gives equal components a quarter-cycle apart: circular polarization.',
      explain: t`The components along the axes are equal and start in phase; the plate makes $\delta = \pm90°$, so the tip traces a circle (dashed). Turning the plate the other way reverses the sense of rotation.`,
    }),
    num({
      id: 'ellipse-intensity', difficulty: 2,
      gen(r) {
        const a = r.pick([300, 400, 500]), b = r.pick([200, 600, 700]), d = r.pick([30, 60, 120]);
        const I = 0.5 * C * EPS0 * (a * a + b * b);
        return {
          prompt: t`An elliptically polarized wave has $E_x = ${a}\cos\omega t$ and $E_y = ${b}\cos(\omega t - ${d}°)$, in V/m. What is its intensity, in W/m²?`,
          visual: ellipsePic(a / 750, b / 750, d, t`The ellipse traced by the tip of $\vec E$ (to scale, relative).`),
          answer: I, units: 'W/m^2', tol: { rel: 0.01 },
          errors: [{ value: 0.5 * C * EPS0 * (a + b) ** 2, feedback: t`The components are perpendicular: their energies add, $E_x^2 + E_y^2$, not $(E_x + E_y)^2$.` }, { value: C * EPS0 * (a * a + b * b), feedback: t`Average over a cycle: $\overline{\cos^2} = \tfrac12$.` }],
          hints: [t`$S = c\varepsilon_0|\vec E|^2 = c\varepsilon_0(E_x^2 + E_y^2)$ at each instant.`, t`Average each $\cos^2$ to $\tfrac12$: the phase $\delta$ drops out.`],
          teach: t`Intensity is $\tfrac12c\varepsilon_0(E_x^2 + E_y^2)$ whatever the polarization.`,
          explain: t`$I = \tfrac12c\varepsilon_0(${a}^2 + ${b}^2) = ${tn(I)}$ W/m² — the same for any $\delta$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sail', difficulty: 3, transfer: true,
      gen(r) {
        const [what, A] = r.pick([['The Planetary Society’s LightSail 2 had a 32 m² sail', 32], ['JAXA’s IKAROS flew a square sail about 14 m on a side (take 196 m²)', 196]]), [where, dAU] = r.pick([['at 1 AU', 1], ['near Venus, 0.72 AU from the Sun', 0.72], ['near Mars, 1.52 AU from the Sun', 1.52]]);
        const I = SUN / (dAU * dAU), F = (2 * I * A) / C;
        return {
          prompt: t`${what}. Facing the Sun ${where} and reflecting perfectly, what force does sunlight exert on it, in mN? (Sunlight: $1361/d^2$ W/m² with $d$ in AU.)`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['1.6', 't'], t: [-1.2, 1.2], color: 'accent', width: 4 }], arrows: [...[-0.8, 0, 0.8].map((y) => ({ from: [-2.8, y], to: [1.5, y], color: 'gold' })), ...[-0.5, 0.5].map((y) => ({ from: [1.5, y + 0.15], to: [-0.6, y + 0.15], color: 'gold', dash: [4, 4] })), { from: [1.8, 0], to: [2.8, 0], color: 'good', width: 2.6, label: 'F', labelDx: 4 }] }, caption: 'Sunlight (gold) reflected straight back by the sail (blue); the push F. Not to scale.' },
          answer: F * 1000, units: 'mN', tol: { rel: 0.01 },
          errors: [{ value: (I * A) / C * 1000, feedback: t`A mirror reverses the light’s momentum: $2I/c$, twice the absorbed value.` }, { value: (2 * SUN * A) / C * 1000, feedback: t`Scale the sunlight with distance: $I = 1361/d^2$.` }].filter((e) => Math.abs(e.value - F * 1000) > 0.02 * F * 1000),
          hints: [t`$I = 1361/${dAU}^2$ W/m².`, t`$F = 2IA/c$ for perfect reflection at normal incidence.`],
          teach: t`Radiation pressure is $I/c$ absorbed and $2I/c$ reflected: tiny forces that never run out.`,
          explain: t`$F = 2(${tn(I)})(${A})/c = ${tn(F * 1000)}$ mN. Tiny, but continuous: over a month it adds metres per second to a light spacecraft — no propellant needed.`,
        };
      },
    }),
    mcq({
      id: 'cp-mirror-hand', difficulty: 3, transfer: true,
      prompt: t`GPS satellites transmit circularly polarized signals, and receiver antennas are built to accept only that sense of rotation. Consider the simplest reflection: a circularly polarized wave reflected straight back by a flat metal surface. Compared with the incoming wave (each judged by someone facing it as it arrives), the reflected wave turns…`,
      visual: ellipsePic(1, 1, 90, t`Circular polarization: the field’s tip traces a circle; arrows show the turn as seen facing the incoming wave.`, { arrows: [{ from: [0.71, 0.71], to: [0.5, 0.87], color: 'gold', width: 2.4 }, { from: [-0.71, -0.71], to: [-0.5, -0.87], color: 'gold', width: 2.4 }] }),
      choices: [
        'the opposite way: the field keeps turning the same way in space, but the wave now travels the other way',
        'the same way: reflection reverses the direction of travel and the rotation, which cancel',
        'not at all: reflection turns circular polarization into linear',
        'the same way, but with half the amplitude',
      ],
      answer: 0,
      why: {
        1: 'The metal flips the tangential field’s sign, which does not change its sense of rotation in space; only the direction of travel reverses.',
        2: 'A perfect mirror at normal incidence keeps both components equal and a quarter-cycle apart: still circular.',
        3: 'A perfect conductor reflects all of the wave; and amplitude has nothing to do with the sense of rotation.',
      },
      hints: [t`At the mirror the reflected field is $-\vec E_{\text{incident}}$: does that change the way it turns?`, 'An observer facing the reflected wave stands on the other side of the turning field from one facing the incident wave.'],
      teach: 'Reflection at normal incidence reverses the handedness of circular polarization, because travel reverses while the turning does not.',
      explain: t`The field at the mirror turns the same way in space, but the viewer facing the reflected wave looks at it from the opposite side, so it turns the other way. That is why a GPS antenna rejects much of the signal that bounced once off the ground — at steep enough angles; at grazing angles real ground reflects with mixed handedness.`,
    }),
    num({
      id: 'cp-B0', difficulty: 2, transfer: true,
      gen(r) {
        const [name, d] = r.pick([['Mercury', 0.387], ['Mars', 1.524], ['Jupiter', 5.20], ['Saturn', 9.58]]);
        const I = SUN / (d * d), B0 = E0of(I) / C;
        return {
          prompt: t`A magnetometer on a probe at ${name} (${d} AU from the Sun) sits in sunlight of intensity $1361/d^2$ W/m². Treating sunlight as one plane wave, what is its magnetic amplitude $B_0$, in μT?`,
          visual: { type: 'em-wave', params: { phase: 70, controls: false, readout: false }, caption: 'A plane wave: B (teal) in phase with E (violet), c times smaller. Not to scale.' },
          answer: B0 * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: (E0of(I) / C) * 1e6 / Math.SQRT2, feedback: t`That is the rms value; $I = \tfrac12c\varepsilon_0E_0^2$ gives the amplitude.` }, { value: (E0of(SUN / d) / C) * 1e6, feedback: t`Intensity falls as $1/d^2$, not $1/d$.` }],
          hints: [t`$I = 1361/${d}^2$ W/m², $E_0 = \sqrt{2I/c\varepsilon_0}$.`, t`$B_0 = E_0/c$.`],
          teach: t`Field amplitudes scale as $\sqrt I$: sunlight’s fields fall as $1/d$ with distance.`,
          explain: t`$I = ${tn(I)}$ W/m², $E_0 = ${tn(E0of(I))}$ V/m, $B_0 = ${tn(B0 * 1e6)}\ \mu\text{T}$ — oscillating far too fast for a magnetometer to register; it measures the slowly varying field of the solar wind instead.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 18–19: electromagnetic waves; electromagnetic energy (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Jackson, Classical Electrodynamics, 3rd ed., §7.1–7.2: plane waves and polarization (the helicity convention)', url: 'https://openlibrary.org/isbn/9780471309321' },
    { label: 'Kopp & Lean, A new, lower value of total solar irradiance, GRL 38, L01706 (2011): 1360.8 W/m²', url: 'https://doi.org/10.1029/2010GL045777' },
  ],
});
