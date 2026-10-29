// Faraday's law and induced fields (Griffiths §7.2): one law for three
// experiments — ∮E·dl = −dΦ/dt, ∇×E = −∂B/∂t — read as "a changing B makes
// an E"; the flux rule for a moving loop gives the same number by a different
// mechanism (the magnetic force). The induced E is found like a magnetostatic
// B, by symmetry and a loop ("the Ampère trick"): round a long solenoid
// carrying AC, E = (s/2)∂B/∂t inside and (R²/2s)∂B/∂t outside, where B = 0;
// its curl is −∂B/∂t inside and zero outside; Lenz's sign. Eddy currents in a
// conducting disk, P = πσhḂ²a⁴/8. Transfers: eddy-current despin of a spinning
// spacecraft in Earth's field; a pickup coil round a solenoid. Uses field2d
// (curl and circulation readouts) and em-faraday.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { PI, SIGMA, sf, circle, bare, outOf, into, tag, circArrows } from './_em4.js';

const t = String.raw;
const SIG_AL = SIGMA.aluminium.sigma;

// the worked example: a solenoid of radius 3 cm with B = B0 sin ωt, 20 mT at 60 Hz
const EX = { R: 0.03, B0: 0.02, f: 60, s1: 0.02, s2: 0.06 };
EX.w = 2 * PI * EX.f;
EX.E1 = (EX.s1 / 2) * EX.w * EX.B0;
EX.E2 = ((EX.R * EX.R) / (2 * EX.s2)) * EX.w * EX.B0;
EX.emf = PI * EX.R * EX.R * EX.w * EX.B0;

/**
 * A long solenoid end-on (radius 1, shaded), its field out of (dir > 0) or into the page, a dashed
 * circle of radius s and, if sense is given, circling arrows for the induced E on it.
 */
function solPic(s, caption, { dir = 1, sense = 0, label = 's', note = '' } = {}) {
  const mark = dir > 0 ? outOf : into;
  return {
    type: 'graph',
    params: bare([-3, 3], [-1.85, 1.85], {
      shade: [{ fn: 'sqrt(max(1 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'accent', alpha: 0.18 }],
      curves: [circle(1, 'accent', { width: 1.5 }), circle(s, 'ink2', { dash: [5, 4], width: 1.6 })],
      arrows: sense ? circArrows(s, 4, sense, 'warn', 0, 0, 0.55) : [],
      points: [...mark(-0.4, 0.35), ...mark(0.4, 0.35), ...mark(-0.4, -0.35), ...mark(0.4, -0.35),
        { x: s * Math.cos(-0.75), y: s * Math.sin(-0.75), r: 3.5, color: 'ink2' }, tag(s * Math.cos(-0.75), s * Math.sin(-0.75), label, 'ink2', { labelDx: 8, labelDy: 10 }),
        tag(-2.95, 1.6, note || (dir > 0 ? 'B out of the page' : 'B into the page'), 'accent')],
    }),
    caption,
  };
}

/** The induced E of a solenoid of radius 1 with dB/dt = k (B out of the page), as field2d expressions. */
const E_SOL = { P: '(k/2)*y*min(1, 1/(x^2 + y^2))', Q: '-(k/2)*x*min(1, 1/(x^2 + y^2))' };

export default lesson({
  id: 'phys4600.M1.2',
  title: 'Faraday’s law and induced fields',
  minutes: 16, difficulty: 3,
  equation: t`\begin{gathered}\oint\vec E\cdot d\vec l = -\frac{d\Phi_B}{dt}, \\ \nabla\times\vec E = -\frac{\partial\vec B}{\partial t}\end{gathered}`,
  intro: t`Faraday found that an emf appears in a loop whether the loop moves through a magnet’s field, the magnet moves past the loop, or the current making the field changes. The first is the magnetic force of [M1.1](#/lesson/phys4600.M1.1). The other two have no moving charges in the loop to push — so Faraday’s law says something new: **a changing magnetic field makes an electric field**, with circulation $-d\Phi_B/dt$ round any loop, wire or no wire. In differential form, $\nabla\times\vec E = -\partial\vec B/\partial t$. With no charge around, $\nabla\cdot\vec E = 0$ too, so the induced field obeys the same equations as a magnetostatic $\vec B$ with $-\partial\vec B/\partial t$ in place of $\mu_0\vec J$ — and where there is symmetry, an Amperian-style loop finds it in one line.`,
  symbols: [
    { tex: '\\vec E', text: 'the induced electric field, in V/m' },
    { tex: '\\Phi_B', text: t`the magnetic flux through a surface bounded by the loop, $\int\vec B\cdot d\vec a$, in webers (T·m²)` },
    { tex: 'd\\vec l', text: t`a step round the loop, in m; its direction and the surface’s normal $d\vec a$ obey the right-hand rule` },
    { tex: '\\partial\\vec B/\\partial t', text: 'how fast the magnetic field changes at a fixed point, in T/s' },
    { tex: '\\nabla\\times\\vec E', text: t`the curl of $\vec E$, in $\text{V/m}^2$ (= T/s): its circulation per unit area` },
  ],
  why: t`Transformers, induction motors, wireless chargers, eddy-current brakes and the despin of a tumbling satellite all run on an electric field made by a changing magnetic one.`,
  visual: {
    type: 'field2d',
    title: 'The induced field of a solenoid',
    lead: t`The electric field induced by a long solenoid (radius 1) whose field, out of the page, grows at the rate $k = \partial B/\partial t$. Drag the probe: its curl readout is $(\nabla\times\vec E)_z$. The gold circle reports the field’s circulation beside the integral of its curl — Stokes’s theorem, which here **is** Faraday’s law.`,
    tasks: [
      t`Put the probe inside the solenoid: the curl is $-k$ everywhere there. Move it outside: the curl is zero, but $\vec E$ is not.`,
      t`The gold circle encloses the whole solenoid: its circulation equals $-k$ times the solenoid’s area, $-\pi k$, however big the circle — the flux it encloses is all inside.`,
      t`Reverse $k$ (the field shrinking): the field circles the other way. Lenz’s law is the minus sign.`,
    ],
    params: { ...E_SOL, x: [-3, 3], y: [-3, 3], loop: { r: 1.6 }, probe: [0.5, 0.3], density: 15, sliders: [{ key: 'k', label: t`Rate $\partial B/\partial t$`, min: -2, max: 2, step: 0.1, value: 1, unit: '\\mathrm{T/s}', explain: 'Positive: the field out of the page grows. Negative: it shrinks.' }] },
    caption: t`An ideal long solenoid of radius 1 (lengths in its radii, so $E$ is in units of radius × T/s), quasistatic. The divergence readout is zero everywhere: there is no charge.`,
  },
  example: {
    prompt: t`A long solenoid of radius ${EX.R * 100} cm carries an alternating current, so the field inside is $B = B_0\sin\omega t$ with $B_0 = ${EX.B0 * 1e3}$ mT at ${EX.f} Hz. Find the amplitude of the induced electric field ${EX.s1 * 100} cm and ${EX.s2 * 100} cm from the axis, and of the emf round a circle of radius ${EX.s2 * 100} cm.`,
    visual: solPic(EX.s2 / EX.R, t`The solenoid end-on (shaded) and a circle of radius $s$ outside it. The induced $\vec E$ circles the axis. Not to scale.`, { sense: -1 }),
    steps: [
      { label: 'Symmetry', text: t`The set-up is unchanged by rotation about the axis and by sliding along it, and $\nabla\cdot\vec E = 0$, so $\vec E$ circles the axis with a size $E(s)$ that depends only on the distance $s$ — like $\vec B$ round a wire.` },
      { label: 'Inside', text: t`Round a circle of radius $s < R$: $E\cdot2\pi s = -\dfrac{d}{dt}(\pi s^2B)$, so $E = -\dfrac{s}{2}\dfrac{dB}{dt}$. With $dB/dt = \omega B_0\cos\omega t$ the amplitude is $\dfrac{s}{2}\omega B_0 = \dfrac{${EX.s1}}{2}(${nice(sf(EX.w, 4))})(${EX.B0}) \approx ${nice(sf(EX.E1 * 1e3, 3))}$ mV/m.` },
      { label: 'Outside', text: t`For $s > R$ the circle encloses all the flux, $\pi R^2B$: $E = -\dfrac{R^2}{2s}\dfrac{dB}{dt}$, amplitude $\dfrac{R^2}{2s}\omega B_0 \approx ${nice(sf(EX.E2 * 1e3, 3))}$ mV/m — where $\vec B$ itself is zero.` },
      { label: 'The emf', text: t`Round the outer circle, $\mathcal E = E\cdot2\pi s = \pi R^2\omega B_0 \approx ${nice(sf(EX.emf * 1e3, 3))}$ mV amplitude, the same for every circle that encloses the solenoid.` },
      { label: 'Check the curl', text: t`In cylindrical coordinates $(\nabla\times\vec E)_z = \dfrac1s\dfrac{d}{ds}(sE_\phi)$. Inside, $sE_\phi = -\tfrac12 s^2\dot B$ gives $-\dot B$ ✓; outside, $sE_\phi$ is constant and the curl is zero ✓. Quasistatic? At ${EX.f} Hz the wavelength is 5000 km, so yes.` },
    ],
    answer: t`$E$ amplitudes $\approx ${nice(sf(EX.E1 * 1e3, 3))}$ mV/m at ${EX.s1 * 100} cm and $${nice(sf(EX.E2 * 1e3, 3))}$ mV/m at ${EX.s2 * 100} cm; emf amplitude $\approx ${nice(sf(EX.emf * 1e3, 3))}$ mV.`,
  },
  practice: [
    num({
      id: 'e-inside', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 4, 5]), s = r.pick([0.5, 1, 1.5]), B0 = r.pick([10, 50, 100]), f = r.pick([50, 60, 400]);
        const E = (s / 100 / 2) * 2 * PI * f * B0 * 1e-3;
        return {
          prompt: t`A long solenoid of radius ${R} cm has an alternating field $B_0\sin\omega t$ inside, with $B_0 = ${B0}$ mT at ${f} Hz. What is the amplitude of the induced electric field ${s} cm from the axis?`,
          visual: solPic(s / R, t`The solenoid end-on (shaded) and a circle of radius $s$ inside it. Not to scale.`),
          answer: E * 1e3, units: 'mV/m', tol: { rel: 0.01 },
          errors: [
            { value: (s / 100 / 2) * f * B0 * 1e-3 * 1e3, feedback: t`Use the angular frequency $\omega = 2\pi f$: the rate of change of $B_0\sin\omega t$ peaks at $\omega B_0$.` },
            { value: (s / 100) * 2 * PI * f * B0, feedback: t`The circle’s circumference is $2\pi s$ and its area $\pi s^2$: their ratio gives $s/2$, not $s$.` },
          ],
          hints: [t`Round a circle of radius $s$ inside: $E\cdot2\pi s = \pi s^2\,|dB/dt|$.`, t`So $E = \tfrac{s}{2}|dB/dt|$, and $|dB/dt|$ peaks at $\omega B_0$ with $\omega = 2\pi f$.`],
          teach: 'Inside a solenoid the induced field grows linearly with distance from the axis: E = (s/2)|∂B/∂t|.',
          explain: t`$E = \dfrac{s}{2}\omega B_0 = \dfrac{${s / 100}}{2}(2\pi\cdot${f})(${B0}\times10^{-3}) \approx ${nice(sf(E * 1e3, 3))}$ mV/m. It is zero on the axis and largest at the winding.`,
        };
      },
    }),
    num({
      id: 'e-outside', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3, 5]), k = r.pick([2, 3, 5]), dB = r.pick([0.5, 2, 10]);
        const s = R * k, E = ((R / 100) ** 2 / (2 * s / 100)) * dB;
        return {
          prompt: t`The field inside a long solenoid of radius ${R} cm is rising at ${dB} T/s. What is the induced electric field ${s} cm from its axis, outside the solenoid?`,
          visual: solPic(Math.min(k * 0.55, 1.75), t`The solenoid end-on (shaded) and a circle of radius $s$ outside it, where $\vec B = 0$. Not to scale.`),
          answer: E * 1e3, units: 'mV/m', tol: { rel: 0.01 },
          errors: [
            { value: (s / 100 / 2) * dB * 1e3, feedback: t`$\tfrac{s}{2}\dot B$ holds only inside. Outside, the circle encloses just the solenoid’s flux $\pi R^2B$.` },
            { value: 0, feedback: t`$\vec B$ is zero out here, but the flux through a circle enclosing the solenoid is not, and it is changing.` },
          ],
          hints: [t`A circle of radius $s > R$ encloses the flux $\pi R^2B$ — all of it.`, t`$E\cdot2\pi s = \pi R^2\dot B$, so $E = \dfrac{R^2}{2s}\dot B$.`],
          teach: 'Outside a solenoid the induced field falls as 1/s, though B there is zero: it is set by the changing flux the loop encloses.',
          explain: t`$E = \dfrac{R^2}{2s}\dot B = \dfrac{(${R / 100})^2}{2(${s / 100})}(${dB}) \approx ${nice(sf(E * 1e3, 3))}$ mV/m. A charge sitting here, in zero magnetic field, is pushed round the solenoid — the classical seed of the Aharonov–Bohm puzzle in quantum mechanics.`,
        };
      },
    }),
    mcq({
      id: 'lenz', difficulty: 2,
      prompt: t`The field of a long solenoid points **out of the page** and is **growing**. Seen as drawn, which way does the induced electric field circle?`,
      visual: solPic(1.5, t`The solenoid end-on (shaded), its field out of the page and growing, and a circle round it. No arrows: that is the question.`, { note: 'B out of the page, growing' }),
      choices: ['Clockwise', 'Counterclockwise', 'Radially outward', 'It does not circle: it points along the axis'],
      answer: 0,
      why: {
        1: t`That is the right-hand sense for an upward normal, without the minus sign. A current driven that way would **add** to the growing flux — energy from nowhere.`,
        2: t`$\nabla\cdot\vec E = 0$ with no charge, and by symmetry a radial part would need charge on the axis.`,
        3: t`An axial $\vec E$ would have no circulation round a circle in the page, and Faraday’s law demands one.`,
      },
      hints: [t`With the normal out of the page, $d\vec l$ runs counterclockwise. Is $\oint\vec E\cdot d\vec l = -d\Phi/dt$ positive or negative?`, t`It is negative: $\vec E$ runs against the counterclockwise direction.`],
      teach: 'Lenz’s law is the minus sign: the induced E circles so that a current it drove would oppose the change in flux.',
      explain: t`Take the normal out of the page; then $d\vec l$ runs counterclockwise and $\oint\vec E\cdot d\vec l = -d\Phi/dt < 0$, so $\vec E$ circles **clockwise**. A ring placed there would carry a clockwise current, whose own field points into the page inside it — opposing the growth.`,
    }),
    num({
      id: 'curl-check', difficulty: 3,
      gen(r) {
        const a = r.pick([0.2, 0.5, 1.5, 3]);
        return {
          prompt: t`In a region with no charge, the induced electric field is $\vec E = \alpha(y\,\hat x - x\,\hat y)$ with $\alpha = ${a}\ \text{V/m}^2$. At what rate is $B_z$ changing there? (Positive if $B_z$ grows.)`,
          visual: { type: 'field2d', params: { P: 'y', Q: '-x', x: [-2, 2], y: [-2, 2], probe: false, readout: false, density: 12 }, caption: t`The field $\vec E \propto (y, -x)$: it circles clockwise. Arrow colour shows strength.` },
          answer: 2 * a, units: 'T/s', tol: { rel: 0.01 },
          errors: [
            { value: a, feedback: t`Both terms of the curl contribute: $\partial E_y/\partial x - \partial E_x/\partial y = -\alpha - \alpha$.` },
          ],
          hints: [t`$(\nabla\times\vec E)_z = \dfrac{\partial E_y}{\partial x} - \dfrac{\partial E_x}{\partial y}$.`, t`That gives $-2\alpha$. Faraday: $\partial B_z/\partial t = -(\nabla\times\vec E)_z$.`],
          teach: 'Faraday’s law point by point: the rate of change of B is minus the curl of E — a field circling clockwise means B (out of the page) is growing.',
          explain: t`$(\nabla\times\vec E)_z = -\alpha - \alpha = -2\alpha$, so $\partial B_z/\partial t = 2\alpha = ${nice(2 * a)}$ T/s (V/m² is T/s). It is the field inside a solenoid with $\dot B = 2\alpha$: $E = \tfrac{s}{2}\dot B$, circling clockwise as the field out of the page grows.`,
        };
      },
    }),
    num({
      id: 'eddy-disk', difficulty: 3,
      gen(r) {
        const a = r.pick([5, 10, 15]), h = r.pick([1, 2, 3]), dB = r.pick([1, 5, 20]);
        const P = (PI * SIG_AL * h * 1e-3 * dB * dB * (a / 100) ** 4) / 8;
        return {
          prompt: t`A thin aluminium disk (radius ${a} cm, thickness ${h} mm, $\sigma = ${tex(SIG_AL, 3)}$ S/m) lies flat in a uniform field along its axis that is rising at ${dB} T/s. How much power do the induced eddy currents dissipate?`,
          visual: { type: 'graph', params: bare([-3, 3], [-1.7, 1.7], {
            shade: [{ fn: 'sqrt(max(1.69 - x^2, 0))', lower: '-sqrt(max(1.69 - x^2, 0))', from: -1.3, to: 1.3, color: 'ink3', alpha: 0.35 }],
            curves: [circle(1.3, 'ink2'), circle(0.5, 'warn', { width: 1.2, dash: [3, 3] }), circle(0.95, 'warn', { width: 1.2, dash: [3, 3] })],
            arrows: [...circArrows(0.5, 3, -1, 'warn', 0, 0, 0.35), ...circArrows(0.95, 4, -1, 'warn', 0, 0, 0.45)],
            points: [...outOf(-2.2, 1.1), ...outOf(2.2, 1.1), ...outOf(-2.2, -1.1), ...outOf(2.2, -1.1), tag(-2.95, 1.55, 'B out of the page, rising', 'accent'), tag(1.4, -1.2, 'eddy currents', 'warn')],
          }), caption: t`The disk face-on, with eddy currents circling inside it (orange, clockwise as the field out of the page grows). The currents’ own field is ignored. Not to scale.` },
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: [
            { value: (PI * SIG_AL * h * 1e-3 * dB * dB * (a / 100) ** 4) / 2, feedback: t`$E = \tfrac{s}{2}\dot B$: square it and the $\tfrac14$ makes the result $\pi\sigma h\dot B^2a^4/8$.` },
          ],
          hints: [t`At radius $s$ the induced field is $E = \tfrac{s}{2}\dot B$, and the power per unit volume is $\vec J\cdot\vec E = \sigma E^2$.`, t`$P = \displaystyle\int_0^a\sigma\left(\frac{s\dot B}{2}\right)^2 h\,2\pi s\,ds = \frac{\pi\sigma h\dot B^2a^4}{8}$.`],
          teach: 'Eddy currents dissipate σE² per unit volume; for a disk that grows as a⁴, so laminating or slotting a conductor cuts the loss sharply.',
          explain: t`$P = \dfrac{\pi\sigma h\dot B^2a^4}{8} \approx ${tex(P, 3)}$ W. The $a^4$ is why transformer cores are laminated: cutting the disk into $N$ thin strips shrinks every current loop and the loss with it. (The eddy currents’ own field, which would reduce $\dot B$ inside, is negligible while the disk is thin and the change slow.)`,
        };
      },
    }),
    mcq({
      id: 'two-mechanisms', difficulty: 2,
      prompt: t`A loop slides into a steady field region, and a second, fixed loop sits in a field that is being switched on. Both see the flux through them grow at the same rate. Which is true?`,
      visual: { type: 'em-faraday', params: { mode: 'slide', play: false, graphs: [], readouts: [], arrows: ['v', 'I'] }, caption: t`The first loop, crossing the edge of a steady field. Arrow lengths not to scale.` },
      choices: [
        t`Both have the same emf, $-d\Phi/dt$; in the moving loop it comes from the magnetic force on its moving charges, in the fixed loop from an induced electric field`,
        t`Both emfs come from an induced electric field`,
        t`Only the fixed loop has an emf: a steady field cannot induce anything`,
        t`Only the moving loop has an emf: without motion there is no force on the charges`,
      ],
      answer: 0,
      why: {
        1: t`In the frame of the magnet the first field is steady: $\partial\vec B/\partial t = 0$ and there is no induced $\vec E$. The push is $q\vec v\times\vec B$.`,
        2: t`The moving loop’s charges move through the field and feel $q\vec v\times\vec B$: motional emf.`,
        3: t`A changing field makes an electric field, which pushes charges at rest. That is Faraday’s discovery.`,
      },
      hints: ['In the first case, is the field changing anywhere? In the second, are the charges moving?', 'The flux rule gives the same number for both — that coincidence troubled Einstein.'],
      teach: 'The flux rule covers two different mechanisms with one formula: the magnetic force on moving charges, and the electric field of a changing B.',
      explain: t`Both emfs are $-d\Phi/dt$, but for different reasons: motional emf is $\oint(\vec v\times\vec B)\cdot d\vec l$, while the fixed loop feels $\oint\vec E\cdot d\vec l$ with $\nabla\times\vec E = -\partial\vec B/\partial t$. That two unrelated forces give one rule was the puzzle that opened Einstein’s 1905 paper on relativity: the split into “electric” and “magnetic” depends on the frame.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-despin', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([0.4, 0.5, 0.75]), h = r.pick([1, 2, 3]), w = r.pick([1, 2, 5]), B = r.pick([25, 30, 45]);
        const N = (PI * SIG_AL * h * 1e-3 * (B * 1e-6) ** 2 * w * a ** 4) / 16;
        return {
          prompt: t`A small spacecraft spins at ${w} rad/s about an axis perpendicular to Earth’s field (${B} μT in its orbit). Model its conducting structure as one aluminium disk of radius ${a} m and thickness ${h} mm, whose axis is perpendicular to the spin axis. The field component along the disk’s axis is then $B\cos\omega t$. Using $P = \pi\sigma h\dot B^2a^4/8$ averaged over a turn, what braking torque do the eddy currents exert?`,
          visual: { type: 'graph', params: bare([-3, 3], [-1.7, 1.7], {
            shade: [{ fn: '0.07', lower: '-0.07', from: -1.2, to: 1.2, color: 'ink3', alpha: 0.8 }],
            curves: [{ param: ['0', 't'], t: [-1.5, 1.5], color: 'good', width: 1.5, dash: [5, 4] }, { param: ['0.35*cos(t)', '1.3 + 0.12*sin(t)'], t: [-2.6, 2.4], color: 'good', width: 1.8 }],
            arrows: [{ from: [-2.6, -1.3], to: [-1.6, -1.3], color: 'accent', width: 2.2, label: 'B', labelDx: 6, labelDy: 0 }, { from: [-2.6, -0.9], to: [-1.6, -0.9], color: 'accent', width: 2.2 }],
            points: [tag(1.3, 0.2, 'aluminium disk (edge-on)', 'ink2'), tag(0.45, 1.45, 'ω', 'good')],
          }), caption: t`The disk seen edge-on, spinning about the dashed axis in Earth’s field. A real spacecraft is not a disk; this sets the scale. Not to scale.` },
          answer: N * 1e6, units: 'μN m', tol: { rel: 0.01 },
          errors: [
            { value: (N * 2) * 1e6, feedback: t`Average over a turn: $\dot B = -\omega B\sin\omega t$, and $\sin^2$ averages to $\tfrac12$.` },
            { value: N * w * 1e6, feedback: t`Torque is power divided by angular speed, $\tau = \langle P\rangle/\omega$.` },
          ].filter((e) => Math.abs(e.value - N * 1e6) > 0.02 * N * 1e6),
          hints: [t`$\dot B = -\omega B\sin\omega t$, so $\langle\dot B^2\rangle = \tfrac12\omega^2B^2$ and $\langle P\rangle = \dfrac{\pi\sigma h\omega^2B^2a^4}{16}$.`, t`The torque does work at the rate $\tau\omega = \langle P\rangle$, so $\tau = \dfrac{\pi\sigma h\omega B^2a^4}{16}$.`],
          teach: 'A conductor spinning in a field dissipates eddy-current power that grows as ω²: the braking torque grows as ω, so the spin decays exponentially.',
          explain: t`$\langle P\rangle = \pi\sigma h\omega^2B^2a^4/16$ and $\tau = \langle P\rangle/\omega \approx ${tex(N * 1e6, 3)}$ μN·m. Tiny, but it never stops: since $\tau\propto\omega$, the spin decays exponentially, with a time constant of days to months for a small satellite (a few kg m² of moment of inertia). Early spin-stabilized satellites slowed down measurably this way, and some missions use it deliberately to damp a tumble.`,
        };
      },
    }),
    num({
      id: 'cp-pickup', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3]), s = r.pick([5, 8, 12]), N = r.pick([20, 50, 100]), B0 = r.pick([5, 20, 50]), f = r.pick([50, 1000]);
        const emf = N * PI * (R / 100) ** 2 * 2 * PI * f * B0 * 1e-3;
        return {
          prompt: t`A pickup coil of ${N} turns, each a circle of radius ${s} cm, is wound round a long solenoid of radius ${R} cm, coaxial with it. The solenoid’s field is $B_0\sin\omega t$ with $B_0 = ${B0}$ mT at ${f} Hz. What is the amplitude of the emf in the pickup coil?`,
          visual: solPic(1.6, t`The solenoid end-on (shaded) inside one turn of the pickup coil (dashed). Not to scale.`, { label: 'pickup turn' }),
          answer: emf, units: 'V', tol: { rel: 0.01 },
          errors: [
            { value: N * PI * (s / 100) ** 2 * 2 * PI * f * B0 * 1e-3, feedback: t`The field is zero outside the solenoid: only its own area, $\pi R^2$, carries flux.` },
            { value: PI * (R / 100) ** 2 * 2 * PI * f * B0 * 1e-3, feedback: t`Each of the ${N} turns adds its own emf.` },
          ],
          hints: [t`The flux through one turn is $\pi R^2B$, whatever the turn’s radius, as long as it encloses the solenoid.`, t`$\mathcal E = N\pi R^2\omega B_0$ in amplitude.`],
          teach: 'A coil wound round a solenoid picks up N times the solenoid’s own changing flux, independent of the coil’s size.',
          explain: t`$\mathcal E = N\pi R^2\omega B_0 \approx ${nice(sf(emf, 3))}$ V. The turns sit where $\vec B = 0$; the induced $\vec E$ there, $R^2\dot B/2s$, falls as $1/s$ while each turn’s length grows as $s$, so the product does not care. Current transformers and Rogowski coils use this.`,
        };
      },
    }),
    mcq({
      id: 'cp-curl-outside', difficulty: 3,
      prompt: t`Outside a long solenoid whose current is changing, $\vec B = 0$ and the induced $\vec E$ circles the axis. What is $\nabla\times\vec E$ there, and what does that imply?`,
      visual: solPic(1.6, t`The solenoid end-on and a circle outside it, with the induced $\vec E$ (orange). Not to scale.`, { sense: -1 }),
      choices: [
        t`Zero: locally $\vec E$ looks electrostatic, but its circulation round the solenoid is still $-d\Phi/dt$ — like $\vec B$ round a wire`,
        t`$-\partial\vec B/\partial t$ of the solenoid’s interior field, carried outward`,
        t`Zero, so $\vec E$ is the gradient of a single-valued potential outside`,
        t`It is not defined, because $\vec B = 0$ there`,
      ],
      answer: 0,
      why: {
        1: t`Faraday’s law is local: $\nabla\times\vec E = -\partial\vec B/\partial t$ at the same point, and outside $\vec B$ is not changing (it is zero).`,
        2: t`A curl-free field in a region with a hole need not be a gradient: round the hole, $\oint\vec E\cdot d\vec l \ne 0$, so any “potential” would change by $\mathcal E$ each time round.`,
        3: t`$\vec E$ is perfectly well defined there; its curl is simply zero.`,
      },
      hints: [t`$\nabla\times\vec E = -\partial\vec B/\partial t$ holds point by point. What is $\partial\vec B/\partial t$ outside?`, t`Compare $\vec B = \dfrac{\mu_0I}{2\pi s}\hat\phi$ round a wire: curl-free outside, yet with circulation $\mu_0I$.`],
      teach: 'A field can be curl-free everywhere in a region and still circulate round a hole in it: its line integral then depends on how many times a path winds round.',
      explain: t`Outside, $\vec E = \dfrac{R^2\dot B}{2s}$ circling the axis has zero curl — just like a wire’s $\vec B$. But the region outside a solenoid has a hole, so curl-free does not mean gradient: any loop that winds round the solenoid once picks up $-d\Phi/dt$. That is why the two voltmeters of [M0.1](#/lesson/phys4600.M0.1) disagree.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §7.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Einstein, On the electrodynamics of moving bodies (1905), the opening paragraph', url: 'https://www.fourmilab.ch/etexts/einstein/specrel/www/' },
  ],
});
