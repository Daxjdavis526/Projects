// Foucault's pendulum (Taylor §9.10): for small swings in Earth's frame only
// the vertical part of Ω, Ω_z = Ω sin λ, acts horizontally, giving
// η̈ + 2iΩ_zη̇ + ω₀²η = 0 for η = x + iy (x east, y north). Substituting
// η = e^{−iΩ_z t}ξ leaves ξ̈ + (ω₀² + Ω_z²)ξ = 0: an ordinary pendulum in a
// plane turning clockwise (north) at Ω sin λ; one full turn takes
// T_sid/sin λ. Explored as the exact rosette (release from rest: cusps).
// Worked: the derivation and the Griffith Observatory's rate. Practice: the
// angle turned during a visit, direction north/south/equator, why sin λ (the
// horizontal part only tugs on the string), the substitution, release from
// rest vs a push through the centre, the tiny Coriolis-to-restoring ratio.
// Transfer: a MEMS Coriolis vibratory gyroscope. The geometric (holonomy)
// view is st-c C6.3's — linked, not redone. Avoids the sites used by
// st-c.C6.3, gr.S11.i and gr.S13.i.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct } from './_cm.js';
import { OMEGA_E, T_SID, disc } from './_cm3.js';

const t = String.raw;
const DEG = Math.PI / 180;
const TS_H = T_SID / 3600;                // 23.934 h
const RATE = 360 / TS_H;                  // 15.04° per hour at a pole

// the rosette of a pendulum released from rest at (1, 0); W = Ω_z/ω₀ (exaggerated), N swings
function rosette({ W = 0.05, N = 6, caption, alt, push = false }) {
  const w = Math.sqrt(1 + W * W);
  const P = push
    ? [`sin(${r6(w)}*t)*cos(${r6(W)}*t)`, `-sin(${r6(w)}*t)*sin(${r6(W)}*t)`]
    : [`cos(${r6(W)}*t)*cos(${r6(w)}*t) + ${r6(W / w)}*sin(${r6(W)}*t)*sin(${r6(w)}*t)`, `-sin(${r6(W)}*t)*cos(${r6(w)}*t) + ${r6(W / w)}*cos(${r6(W)}*t)*sin(${r6(w)}*t)`];
  return gpic({
    x: [-1.25, 1.25], y: [-1.15, 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: P, t: [0, r6(2 * Math.PI * N)], color: 'accent', width: 1.4, samples: 4000 }, { param: ['1.1*cos(t)', '1.1*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }],
    points: [lab(0, 1.05, 'N', 'ink3'), lab(1.05, 0, 'E', 'ink3')],
  }, caption, alt || 'The track of a Foucault pendulum’s bob seen from above');
}

const EX = (() => {
  const lat = 34.12, rate = RATE * Math.sin(lat * DEG), T = TS_H / Math.sin(lat * DEG);
  return { lat, rate, T };
})();

export default lesson({
  id: 'phys3550.M6.4',
  title: 'Foucault’s pendulum',
  minutes: 14, difficulty: 3,
  intro: t`In 1851 Léon Foucault hung a 28 kg bob on a 67 m wire and showed Paris that the Earth turns: the plane of the swing slowly rotates relative to the floor. In Earth's frame the culprit is the Coriolis force ([M6.3](#/lesson/phys3550.M6.3)). For small swings only the vertical part of Earth's spin, $\Omega_z = \Omega\sin\lambda$, pushes the bob sideways, and it does so in a way that exactly rotates the whole swing — clockwise seen from above in the north, at $\Omega\sin\lambda$. The same answer falls out of geometry as the holonomy of a circle of latitude ([parallel transport and holonomy](#/lesson/st-c.C6.3)); here we get it from Newton's law in the rotating frame.`,
  equation: t`\ddot\eta + 2i\Omega_z\dot\eta + \omega_0^2\eta = 0 \quad\Longrightarrow\quad \eta \approx A\,e^{-i\Omega_z t}\cos\omega_0 t`,
  symbols: [
    { tex: '\\eta = x + iy', text: 'the bob’s horizontal position as one complex number: $x$ east and $y$ north of the point below the pivot, in m' },
    { tex: '\\Omega_z = \\Omega\\sin\\lambda', text: 'the vertical part of Earth’s rotation at latitude $\\lambda$, in rad/s ($\\Omega = 7.292\\times10^{-5}$ rad/s)' },
    { tex: '\\omega_0 = \\sqrt{g/L}', text: 'the pendulum’s own angular frequency for a wire of length $L$, in rad/s' },
    { tex: 'A', text: 'the swing amplitude, in m (small compared with $L$)' },
    { tex: 'e^{-i\\Omega_z t}', text: 'a rotation of the swing plane by $-\\Omega_z t$: clockwise seen from above when $\\lambda > 0$' },
  ],
  why: t`It was the first laboratory proof of Earth's rotation, and the same Coriolis coupling between two vibration modes is how the gyroscope in every phone and many spacecraft measures rotation.`,
  visual: {
    type: 'graph',
    title: 'The rosette of a Foucault pendulum',
    lead: t`The bob's path seen from above, released from rest due east of centre. Earth's rotation is hugely sped up (the "exaggeration" slider) so the turning shows within a few swings. Change the latitude and watch the rate and direction.`,
    tasks: [
      t`At the North Pole ($90^\circ$) the plane turns fastest — once per sidereal day for real. At $30^\circ$ it turns half as fast.`,
      t`At the equator ($0^\circ$) it does not turn at all; south of it, it turns anticlockwise.`,
      t`Look at the outer ends of the swings: released from rest, the bob makes little cusps there — it is at rest in Earth's frame at those instants.`,
    ],
    params: {
      aspect: 'wide', x: [-1.25, 1.25], y: [-1.15, 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'lam', label: 'Latitude $\\lambda$', min: -90, max: 90, step: 1, value: 50, unit: '^\\circ', explain: 'Positive is north.' },
        { key: 'k', label: 'Exaggeration $\\Omega/\\omega_0$', min: 0.005, max: 0.12, step: 0.005, value: 0.05, explain: 'Earth’s spin over the pendulum’s angular frequency; really about $3\\times10^{-4}$ for a 67 m wire.' },
        { key: 'N', label: 'Swings shown', min: 1, max: 20, step: 1, value: 8, explain: 'Full back-and-forth swings.' },
      ],
      curves: [
        { param: ['cos(k*sin(lam*pi/180)*t)*cos(sqrt(1 + (k*sin(lam*pi/180))^2)*t) + k*sin(lam*pi/180)/sqrt(1 + (k*sin(lam*pi/180))^2)*sin(k*sin(lam*pi/180)*t)*sin(sqrt(1 + (k*sin(lam*pi/180))^2)*t)', '-sin(k*sin(lam*pi/180)*t)*cos(sqrt(1 + (k*sin(lam*pi/180))^2)*t) + k*sin(lam*pi/180)/sqrt(1 + (k*sin(lam*pi/180))^2)*cos(k*sin(lam*pi/180)*t)*sin(sqrt(1 + (k*sin(lam*pi/180))^2)*t)'], t: [0, '2*pi*N'], color: 'accent', width: 1.4, samples: 4000 },
        { param: ['1.1*cos(t)', '1.1*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true },
      ],
      points: [{ x: 1, y: 0, color: 'warn', r: 5, label: 'release', labelDx: 8, labelDy: 12 }, { x: 0, y: 1.05, r: 0, color: 'ink3', label: 'N' }, { x: 1.05, y: 0.12, r: 0, color: 'ink3', label: 'E' }],
      readouts: [{ label: 'real rate', expr: '15.0411*sin(lam*pi/180)', unit: '^\\circ/\\mathrm{h}', digits: 3 }, { label: 'real time for a full turn', expr: '23.9345/max(abs(sin(lam*pi/180)), 1e-9)', unit: '\\mathrm{h}', digits: 3, zero: 0 }],
    },
    caption: t`Exact solution of the linearized equations (small swings, the vertical Coriolis component only, no air drag). Positions in units of the amplitude; seen from above with north up and east right. The rotation is exaggerated thousands of times; the readouts give the real rate.`,
  },
  example: {
    prompt: t`Show that a small-amplitude pendulum's swing plane turns at $\Omega\sin\lambda$, and find how fast it turns, in degrees per hour, at the Griffith Observatory in Los Angeles (latitude ${EX.lat}°N), and how long a full turn takes.`,
    visual: rosette({ W: 0.04, N: 8, caption: t`The bob's track seen from above (north up), Earth's rotation exaggerated: the swing plane turns clockwise.` }),
    steps: [
      { label: 'Equations', text: t`With $x$ east, $y$ north and swings small, $\ddot{\vec r} = -\omega_0^2\vec r + 2\dot{\vec r}\times\vec\Omega$ horizontally. The horizontal part of $\vec\Omega$ crossed with a horizontal velocity is vertical — taken up by the wire — so only $\Omega_z$ acts: $\ddot x = 2\Omega_z\dot y - \omega_0^2x$, $\ddot y = -2\Omega_z\dot x - \omega_0^2y$.` },
      { label: 'Combine', text: t`With $\eta = x + iy$: $\ddot\eta + 2i\Omega_z\dot\eta + \omega_0^2\eta = 0$.` },
      { label: 'Rotate it away', text: t`Put $\eta = e^{-i\Omega_z t}\xi$. The first-derivative terms cancel, leaving $\ddot\xi + (\omega_0^2 + \Omega_z^2)\xi = 0$: an ordinary pendulum in coordinates that turn by $-\Omega_z t$. Since $\Omega_z \ll \omega_0$, its frequency is $\omega_0$ to one part in $10^8$.` },
      { label: 'Read it', text: t`$e^{-i\Omega_z t}$ turns the swing plane clockwise (seen from above) at rate $\Omega_z = \Omega\sin\lambda$.` },
      { label: 'Numbers', text: t`$\Omega = 360^\circ/${TS_H.toFixed(3)}\ \text{h} = ${RATE.toFixed(2)}^\circ$/h, so the rate is $${RATE.toFixed(2)}\sin${EX.lat}^\circ = ${sci(EX.rate, 3)}^\circ$/h, and a full turn takes $${TS_H.toFixed(3)}/\sin${EX.lat}^\circ = ${sci(EX.T, 3)}$ h.` },
      { label: 'Sense check', text: t`At the pole $\sin\lambda = 1$: the floor simply turns under a plane fixed in space, once per sidereal day ✓. At the equator the floor's vertical never turns about itself, and nothing happens ✓.` },
    ],
    answer: t`The plane turns clockwise at $\Omega\sin\lambda$: $${sci(EX.rate, 3)}^\circ$ per hour at the Griffith Observatory, a full turn in $${sci(EX.T, 3)}$ h.`,
  },
  practice: [
    num({
      id: 'visit-angle', difficulty: 1,
      gen(r) {
        const S = r.pick([{ name: 'the United Nations headquarters in New York', lat: 40.75 }, { name: 'the California Academy of Sciences in San Francisco', lat: 37.77 }, { name: 'St Isaac’s Cathedral in St Petersburg', lat: 59.93 }]);
        const mins = r.pick([30, 45, 90]);
        const ang = RATE * Math.sin(S.lat * DEG) * (mins / 60);
        return {
          prompt: t`You watch the Foucault pendulum at ${S.name} (latitude ${S.lat}°N) for ${mins} minutes. Through what angle does its swing plane turn relative to the floor? (Earth turns $360^\circ$ per sidereal day of ${TS_H.toFixed(3)} h.)`,
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: distinct([{ value: RATE * (mins / 60), feedback: t`That is the rate at a pole. At latitude $\lambda$ only $\Omega\sin\lambda$ turns the plane.` }, { value: RATE * Math.cos(S.lat * DEG) * (mins / 60), feedback: t`The vertical component of Earth's spin is $\Omega\sin\lambda$ (latitude is measured from the equator), not $\Omega\cos\lambda$.` }], ang),
          hints: [t`The rate is $\Omega\sin\lambda$ with $\Omega = 360^\circ/${TS_H.toFixed(3)}\ \text{h}$.`],
          teach: t`A Foucault pendulum turns at $${RATE.toFixed(2)}^\circ\sin\lambda$ per hour.`,
          explain: t`$${RATE.toFixed(2)}^\circ/\text{h}\times\sin${S.lat}^\circ\times${mins / 60} = ${sci(ang, 3)}^\circ$ — enough to knock over a few of the pegs set round the base.`,
          visual: rosette({ W: 0.03, N: 5, caption: t`A swing plane slowly turning clockwise, seen from above (rotation exaggerated).` }),
        };
      },
    }),
    mcq({
      id: 'direction', difficulty: 2,
      prompt: t`Seen from above, which way does a Foucault pendulum's swing plane turn at Wellington, New Zealand (41°S)?`,
      visual: rosette({ W: 0.0001, N: 1, caption: t`A pendulum swinging east–west, seen from above (north up).` }),
      choices: [t`Anticlockwise, at $\Omega\sin41^\circ$`, t`Clockwise, at $\Omega\sin41^\circ$, the same as in the north`, t`It does not turn: the effect needs the observer above the pendulum's latitude`, t`Anticlockwise, at the full rate $\Omega$`],
      answer: 0,
      why: { 1: t`South of the equator $\Omega_z = \Omega\sin\lambda$ is negative: the local vertical component of Earth's spin points down, so the rotation reverses.`, 2: t`It turns at any latitude except exactly the equator.`, 3: t`Only the vertical component, $|\Omega\sin\lambda|$, acts; the full rate is reached only at the South Pole.` },
      hints: [t`$e^{-i\Omega_z t}$ with $\Omega_z = \Omega\sin\lambda$: what is the sign for $\lambda = -41^\circ$?`],
      teach: t`The swing plane turns clockwise in the north and anticlockwise in the south, at $|\Omega\sin\lambda|$.`,
      explain: t`$\Omega_z = \Omega\sin(-41^\circ) < 0$, so $e^{-i\Omega_z t}$ turns anticlockwise, at $${sci(RATE * Math.sin(41 * DEG), 3)}^\circ$ per hour.`,
    }),
    mcq({
      id: 'why-sin', difficulty: 3,
      prompt: t`Why does only the vertical component $\Omega\sin\lambda$ of Earth's spin turn the swing plane, and not the horizontal (northward) component $\Omega\cos\lambda$?`,
      visual: gpic({ x: [-1.6, 1.6], y: [-1.15, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(1, 'accent', 0.3)], curves: [seg([0, -1.15], [0, 1.2], 'ink3', 1.2, true)], points: [{ x: 0.643, y: 0.766, color: 'warn', r: 5 }, lab(0.08, 1.18, 'Ω', 'accent', 8, 0)], arrows: [{ from: [0.643, 0.766], to: [0.97, 1.155], color: 'good', label: 'vertical', labelDx: 6, labelDy: 0 }, { from: [0.643, 0.766], to: [0.257, 1.09], color: 'gold', label: 'north', labelDx: -40, labelDy: -6 }] }, t`Earth side-on, axis vertical, with a pendulum at latitude 50° and its local vertical and northward directions. Not to scale.`, 'Earth with local vertical and north arrows at one latitude'),
      choices: [
        t`The Coriolis force from $\Omega\cos\lambda$ on a horizontal velocity points vertically; the wire's tension absorbs it, so it cannot move the bob sideways`,
        t`The horizontal component is too small to matter at most latitudes`,
        t`The horizontal component cancels between the two halves of each swing, and so does the vertical one`,
        t`Gravity cancels the horizontal component`,
      ],
      answer: 0,
      why: { 1: t`At $45^\circ$ the two components are equal; the point is direction, not size.`, 2: t`The vertical component does **not** cancel: it pushes right on the way out and right on the way back (the velocity reverses and so does the push), which turns the plane steadily.`, 3: t`Gravity is vertical; the Coriolis force from $\Omega\cos\lambda$ is also vertical — it changes the wire's tension very slightly, which is why it is invisible.` },
      hints: [t`For a horizontal velocity $\vec v$, compute the direction of $\vec v\times(\Omega\cos\lambda\,\hat y)$.`, t`A cross product of two horizontal vectors is vertical.`],
      teach: t`Horizontal motion crossed with the horizontal part of $\vec\Omega$ gives a vertical force, which the wire absorbs; only $\Omega_z$ deflects sideways.`,
      explain: t`$\vec v$ horizontal $\times$ $\Omega\cos\lambda\,\hat y$ horizontal $=$ vertical: a tiny change in apparent weight, absorbed by the tension. $2\vec v\times\Omega_z\hat z$ is horizontal and always to the right of $\vec v$ (in the north), so it turns the plane. The geometric reading — a vector carried round a circle of latitude comes back rotated by $2\pi\sin\lambda$ — is [the holonomy lesson](#/lesson/st-c.C6.3).`,
    }),
    expr({
      id: 'substitution', difficulty: 3,
      prompt: t`Substitute $\eta = e^{-i\Omega_z t}\xi$ into $\ddot\eta + 2i\Omega_z\dot\eta + \omega_0^2\eta = 0$. You get $\ddot\xi + \omega^2\xi = 0$. What is $\omega$? Type $\omega_0$ as omega_0 and $\Omega_z$ as Omega.`,
      answer: 'sqrt(omega_0^2 + Omega^2)', answerTeX: t`\sqrt{\omega_0^2 + \Omega_z^2}`,
      lhs: '\\omega', vars: { omega_0: [0.5, 2], Omega: [0.01, 0.3] }, keys: [['ω₀', 'omega_0'], ['Ω', 'Omega']],
      errors: [{ answer: 'omega_0', feedback: t`Close numerically, but not exact: the $-\Omega_z^2$ from $\ddot\eta$ and the $+2\Omega_z^2$ from the middle term leave $+\Omega_z^2$.` }, { answer: 'sqrt(omega_0^2 - Omega^2)', feedback: t`Check the sign: $\ddot\eta$ contributes $-\Omega_z^2\xi$, and $2i\Omega_z\dot\eta$ contributes $+2\Omega_z^2\xi$.` }],
      hints: [t`$\dot\eta = e^{-i\Omega_z t}(\dot\xi - i\Omega_z\xi)$ and $\ddot\eta = e^{-i\Omega_z t}(\ddot\xi - 2i\Omega_z\dot\xi - \Omega_z^2\xi)$.`, t`Add $2i\Omega_z\dot\eta = e^{-i\Omega_z t}(2i\Omega_z\dot\xi + 2\Omega_z^2\xi)$: the $\dot\xi$ terms cancel.`],
      teach: t`Going into coordinates that turn at $\Omega_z$ removes the Coriolis term entirely: the pendulum is ordinary in a slowly turning frame.`,
      explain: t`$\ddot\xi + (\omega_0^2 + \Omega_z^2)\xi = 0$, so $\omega = \sqrt{\omega_0^2 + \Omega_z^2}$ — for a 67 m wire, $\omega_0 = 0.38$ rad/s against $\Omega_z \approx 5\times10^{-5}$ rad/s: a frequency shift of about one part in $10^8$.`,
      visual: rosette({ W: 0.06, N: 4, caption: t`In Earth's frame (seen from above) the path is a rosette; in the turning coordinates $\xi$ it is a straight back-and-forth line.` }),
    }),
    mcq({
      id: 'release', difficulty: 2,
      prompt: t`A Foucault pendulum is started in two ways: (P) pulled aside and released from rest; (Q) given a push from the centre. Seen from above, in Earth's frame, how do the tracks differ?`,
      visual: rosette({ W: 0.05, N: 6, caption: t`One of the two tracks (rotation exaggerated), seen from above.` }),
      choices: [t`P makes little cusps at the outer ends (the bob is momentarily at rest there); Q's swings pass straight through the centre, like petals`, t`They are identical: the starting method cannot matter`, t`P makes petals through the centre; Q makes cusps`, t`Only P precesses`],
      answer: 0,
      why: { 1: t`Both precess at the same rate, but the details of each swing remember the start.`, 2: t`Reversed: released from rest, the bob is at rest in Earth's frame at each turning point, giving cusps; launched from the centre, it returns through the centre each half-swing.`, 3: t`Both precess at $\Omega\sin\lambda$: the rate comes from the equation, not the start.` },
      hints: [t`Released from rest, what is the bob's velocity in Earth's frame at the ends of its swings?`],
      teach: t`The precession rate is universal, but the track's shape — cusps or petals — depends on how the swing began.`,
      explain: t`The exact solution from rest is $\eta = Ae^{-i\Omega_z t}\big(\cos\omega t + i\tfrac{\Omega_z}{\omega}\sin\omega t\big)$: the small out-of-phase part makes narrow loops that close into cusps at the ends. From the centre, $\eta \propto e^{-i\Omega_z t}\sin\omega t$ passes through 0 every half-swing. Real pendulums also pick up ellipticity from imperfect release, which is why careful ones use a Charron ring.`,
    }),
    num({
      id: 'tiny-ratio', difficulty: 2,
      gen(r) {
        const L = r.pick([10, 25, 67]), lat = r.pick([40, 50, 60]);
        const w0 = Math.sqrt(9.81 / L), ratio = (2 * OMEGA_E * Math.sin(lat * DEG)) / w0;
        return {
          prompt: t`For a Foucault pendulum ${L} m long at latitude ${lat}°, compare the largest sideways Coriolis acceleration, $2\Omega_zv_{\max}$, with the largest restoring acceleration, $\omega_0^2A$. Since $v_{\max} = \omega_0A$, the ratio is $2\Omega_z/\omega_0$. Evaluate it. ($g = 9.81$ m/s², $\Omega = 7.292\times10^{-5}$ rad/s.)`,
          answer: ratio, tol: { rel: 0.005 },
          errors: distinct([{ value: (OMEGA_E * Math.sin(lat * DEG)) / w0, feedback: t`The Coriolis acceleration carries a factor 2: $2\Omega_zv$.` }, { value: (2 * OMEGA_E) / w0, feedback: t`Only the vertical component $\Omega_z = \Omega\sin\lambda$ deflects the swing sideways.` }], ratio),
          hints: [t`$\omega_0 = \sqrt{g/L}$ and $\Omega_z = \Omega\sin\lambda$.`],
          teach: t`The Coriolis push on a pendulum is thousands of times weaker than gravity's — which is why Foucault needed a long, heavy, carefully started pendulum.`,
          explain: t`$\omega_0 = ${sci(w0, 3)}$ rad/s, so the ratio is $${sci(ratio, 3)}$. A long wire helps (smaller $\omega_0$ means slower swings and more time for the push to act per swing), and a heavy bob keeps air drag and stray disturbances from swamping such a tiny effect.`,
          visual: gpic({ x: [-1.4, 1.4], y: [-1.5, 0.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([-0.5, 0], [0.5, 0], 'ink2', 3), seg([0, 0], [0.35, -1.25], 'ink2', 1.4), seg([0, 0], [0, -1.3], 'ink4', 1, true)], points: [{ x: 0.35, y: -1.25, color: 'warn', r: 9 }, lab(0.65, -0.6, 'L', 'ink2')] }, t`A long pendulum, side-on (not to scale).`, 'A long pendulum hanging from a support'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mems', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([2, 5, 10]) * 1e-6, f = r.pick([10, 20, 30]) * 1e3, rate = r.pick([1, 10, 100]);
        const a = 2 * rate * DEG * (2 * Math.PI * f) * A;
        return {
          prompt: t`A MEMS gyroscope — the chip that senses rotation in phones and drones — drives a tiny proof mass to vibrate along $x$ with amplitude $${A * 1e6}\ \mu\text{m}$ at ${f / 1e3} kHz. When the chip turns at ${rate}°/s about the $z$-axis, the Coriolis force pushes the mass along $y$, exactly as on a Foucault pendulum. What is the amplitude of that Coriolis acceleration, in m/s²?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.005 },
          errors: distinct([{ value: a / 2, feedback: t`The Coriolis acceleration is $2\Omega v$: keep the factor 2.` }, { value: 2 * rate * (2 * Math.PI * f) * A, feedback: t`Convert the turn rate to rad/s: $${rate}^\circ/\text{s} = ${sci(rate * DEG, 3)}$ rad/s.` }, { value: 2 * rate * DEG * f * A, feedback: t`The peak speed is $\omega A$ with the angular frequency $\omega = 2\pi f$, not $f$.` }], a),
          hints: [t`Peak drive speed $v = \omega A$ with $\omega = 2\pi f$.`, t`Coriolis acceleration $= 2\Omega v$ with $\Omega$ in rad/s.`],
          teach: t`A vibrating gyroscope reads rotation from the Coriolis coupling between two vibration modes — the Foucault effect on a chip.`,
          explain: t`$v = 2\pi(${f})(${sci(A, 2)}) = ${sci(2 * Math.PI * f * A, 3)}$ m/s and $\Omega = ${sci(rate * DEG, 3)}$ rad/s, so $a = 2\Omega v = ${sci(a, 3)}$ m/s². Driving fast makes $v$ large; the sense mode is tuned near the drive frequency so this small force builds up a measurable motion.`,
          visual: gpic({ x: [-1.6, 1.6], y: [-1, 1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([-0.5, -0.4], [0.5, -0.4], 'ink2', 2), seg([-0.5, 0.4], [0.5, 0.4], 'ink2', 2), seg([-0.5, -0.4], [-0.5, 0.4], 'ink2', 2), seg([0.5, -0.4], [0.5, 0.4], 'ink2', 2), seg([-1.3, 0], [-0.5, 0], 'ink3', 1.2, true), seg([0.5, 0], [1.3, 0], 'ink3', 1.2, true)], points: [lab(0, 0, 'proof mass', 'ink2'), lab(-1.25, 0.75, 'Ω about z (out of page)', 'accent')], arrows: [{ from: [-0.2, -0.6], to: [0.4, -0.6], color: 'accent', label: 'drive (x)', labelDx: 6, labelDy: 0 }, { from: [0.75, -0.2], to: [0.75, 0.5], color: 'warn', label: 'Coriolis (y)', labelDx: 6, labelDy: 0 }] }, t`A proof mass on springs, driven along $x$; rotation about $z$ adds a Coriolis force along $y$. Schematic, not to scale.`, 'A vibrating proof mass with drive and Coriolis directions'),
        };
      },
    }),
    num({
      id: 'cp-full-turn', difficulty: 2, transfer: true,
      gen(r) {
        const S = r.pick([{ name: 'the Griffith Observatory, Los Angeles', lat: 34.12 }, { name: 'Singapore', lat: 1.35 }, { name: 'Cape Town', lat: -33.92 }, { name: 'Tromsø', lat: 69.65 }]);
        const T = TS_H / Math.abs(Math.sin(S.lat * DEG));
        return {
          prompt: t`How many hours does a Foucault pendulum at ${S.name} (latitude ${Math.abs(S.lat)}°${S.lat < 0 ? 'S' : 'N'}) take for its swing plane to make one full turn? (Sidereal day ${TS_H.toFixed(3)} h.)`,
          answer: T, units: 'h', tol: { rel: 0.005 },
          errors: distinct([{ value: 24 / Math.abs(Math.sin(S.lat * DEG)), feedback: t`Earth turns once relative to the stars in a sidereal day, ${TS_H.toFixed(3)} h, not 24 h.` }, { value: TS_H / Math.cos(S.lat * DEG), feedback: t`The rate is $\Omega\sin\lambda$, so the time is $T_{\text{sid}}/\sin\lambda$.` }], T),
          hints: [t`Full turn time $= 360^\circ/(\Omega\sin\lambda) = T_{\text{sid}}/|\sin\lambda|$.`],
          teach: t`A full turn takes a sidereal day divided by $|\sin\lambda|$.`,
          explain: t`$${TS_H.toFixed(3)}/|\sin${S.lat}^\circ| = ${sci(T, 3)}$ h${Math.abs(S.lat) < 5 ? ' — over a month: near the equator the effect all but vanishes.' : S.lat < 0 ? ', turning anticlockwise.' : ', turning clockwise.'}`,
          visual: rosette({ W: 0.03 * Math.sign(S.lat) * Math.max(0.2, Math.abs(Math.sin(S.lat * DEG))), N: 5, caption: t`A swing plane turning, seen from above (rotation exaggerated).` }),
        };
      },
    }),
    mcq({
      id: 'cp-pole', difficulty: 2,
      prompt: t`A Foucault pendulum hangs exactly at the North Pole. Which description is right?`,
      visual: rosette({ W: 0.05, N: 6, caption: t`The bob's track seen from above (rotation exaggerated).` }),
      choices: [t`In an inertial frame the swing plane stays fixed and Earth turns beneath it once per sidereal day`, t`The Coriolis force turns the plane, so it turns in an inertial frame too`, t`It turns once every 24 hours`, t`It does not turn: the Coriolis force vanishes at the poles`],
      answer: 0,
      why: { 1: t`The Coriolis force exists only in Earth's frame; inertially, nothing twists the plane (gravity and tension lie in it).`, 2: t`Relative to the stars Earth turns once per sidereal day, 23.93 h.`, 3: t`At the poles the vertical component $\Omega\sin\lambda$ is largest; the Coriolis effect on horizontal motion is greatest there.` },
      hints: [t`Describe it once from the stars and once from the floor.`],
      teach: t`At a pole the Foucault effect is just Earth turning under a fixed plane; elsewhere only the vertical part of the turn counts.`,
      explain: t`From the stars, the plane is fixed and the floor turns once per sidereal day; from the floor, the Coriolis force turns the plane at $\Omega$. Away from the pole the inertial picture is subtler — the plane is carried round a cone — which is the holonomy of [st-c C6.3](#/lesson/st-c.C6.3) and, in curved spacetime, of [comparing arrows at different places](#/lesson/gr.S11.i).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §9.10: the Foucault pendulum', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'Foucault pendulum: history, Foucault’s 1851 demonstration and the Charron ring (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Foucault_pendulum' },
    { label: 'Vibrating structure gyroscope: MEMS Coriolis gyroscopes (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Vibrating_structure_gyroscope' },
  ],
});
