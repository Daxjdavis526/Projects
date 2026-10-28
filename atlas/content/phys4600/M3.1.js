// Waves in vacuum (Griffiths §9.2), short and one step past PHYS 3750 W12:
// the general monochromatic plane wave Ẽ₀e^{i(k·r − ωt)} in any direction,
// where ∇ → ik and ∂/∂t → −iω turn Maxwell's equations into algebra —
// k·Ẽ₀ = 0, k·B̃₀ = 0 (transverse), B̃₀ = k × Ẽ₀/ω, ω = c|k|. Then the new
// step: two plane waves superposed. A wave reflected straight back by a
// perfect conductor makes a standing wave, E = 2E₀ sin kz sin ωt and
// cB = 2E₀ cos kz cos ωt: E and B a quarter cycle and a quarter wavelength
// apart, no average energy flow, the energy sloshing between E and B. With
// partial reflection r the average flow is (1 − r²)I₀ and the standing-wave
// ratio (1 + r)/(1 − r). Wiener's 1890 experiment. Transfers: atoms in an
// optical-lattice clock (Sr at 813.4 nm, Yb at 759.4 nm), an antenna feed's
// VSWR.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, C, PI, sf, standPic } from './_em4b.js';

const t = String.raw;

// the worked example: a 10 GHz wave, E₀ = 50 V/m, meets a flat metal plate square-on
const EX = { f: 10e9, E0: 50 };
EX.lam = C / EX.f;
EX.Bmax = (2 * EX.E0) / C;
EX.I0 = 0.5 * C * EPS0 * EX.E0 ** 2;

/** A 3D picture of a wave vector (gold) and, optionally, other arrows. */
const kPic = (k, extra, caption, o = {}) => ({
  type: 'calc-vectors3d',
  params: { range: 1.6, vectors: [{ to: k, color: 'gold', label: '\\hat k' }, ...extra], ...o },
  caption,
});

const GHZ = (f) => `${nice(f / 1e9)} GHz`;

export default lesson({
  id: 'phys4600.M3.1',
  title: 'Waves in vacuum',
  minutes: 14, difficulty: 3,
  equation: t`\begin{gathered}\tilde{\vec E} = \tilde{\vec E}_0\,e^{i(\vec k\cdot\vec r - \omega t)},\quad \vec k\cdot\tilde{\vec E}_0 = 0, \\ \tilde{\vec B}_0 = \frac{1}{\omega}\,\vec k\times\tilde{\vec E}_0,\quad \omega = c|\vec k|\end{gathered}`,
  intro: t`In [PHYS 3750 W12.1](#/lesson/phys3750.W12.1) Maxwell’s equations in empty space gave the wave equation, and in [W12.2](#/lesson/phys3750.W12.2) a wave along $z$ turned out transverse, with $B = E/c$ in phase. Here is the same physics in a form that works in **any direction**, and then what happens when two waves meet. For a plane wave every derivative is a multiplication: $\nabla \to i\vec k$ and $\partial/\partial t \to -i\omega$. Maxwell’s equations become algebra — the divergence laws say $\vec k\cdot\tilde{\vec E}_0 = 0$ and $\vec k\cdot\tilde{\vec B}_0 = 0$ (the fields stand across $\vec k$), and Faraday’s law fixes $\vec B$ completely. A single travelling wave keeps $\vec E$ and $\vec B$ in step. But send a wave into a mirror and add the reflection: you get a **standing wave**, in which $\vec E$ and $\vec B$ are a quarter cycle apart in time and a quarter wavelength apart in space, and no energy flows on average.`,
  symbols: [
    { tex: '\\tilde{\\vec E}_0', text: t`the complex amplitude, in V/m: its size and phase say how strong the wave is and when it peaks; the physical field is the real part of $\tilde{\vec E}$` },
    { tex: '\\vec k', text: t`the wave vector, in rad/m: it points along the direction of travel, and its length $|\vec k| = 2\pi/\lambda$ counts radians of phase per metre` },
    { tex: '\\vec r', text: 'the position where the field is evaluated, in m' },
    { tex: '\\omega', text: t`the angular frequency, in rad/s ($\omega = 2\pi f$)` },
    { tex: '\\tilde{\\vec B}_0', text: t`the complex amplitude of the magnetic field, in tesla` },
    { tex: 'c', text: t`the speed of light, $299\,792\,458$ m/s exactly, equal to $1/\sqrt{\mu_0\varepsilon_0}$` },
  ],
  why: t`Every field in empty space — a radar echo, starlight, the inside of a microwave cavity or a laser — is a sum of these plane waves, and standing waves are how cavities, waveguides and optical clocks hold light still.`,
  visual: {
    type: 'graph',
    title: 'A wave and its reflection',
    lead: t`A plane wave travels to the right into a surface at $z = 0$ that reflects a fraction $r$ of its amplitude (for $r = 1$ a perfect mirror, which forces $E = 0$ at its face). Violet is $E$, dashed teal is $cB$ (multiplied by $c$ so both share a scale), and thin gold is the Poynting vector $S$. Step the time slider through a cycle and watch where things move.`,
    tasks: [
      t`Set $r = 0$: a travelling wave. $E$ and $cB$ ride along together, peaks lined up, and $S$ is never negative.`,
      t`Set $r = 1$ and step $\omega t$: the pattern no longer moves. $E$ has fixed zeros (nodes) at the mirror and every half wavelength; $cB$ is largest exactly there.`,
      t`With $r = 1$, find the instant when $E$ is zero everywhere: $cB$ is then at its largest. A quarter cycle later it is the other way round — the energy sloshes between the two fields, and $S$ swings back and forth, averaging zero.`,
    ],
    params: {
      x: [-2, 0.3], y: [-2.3, 2.3], aspect: 'wide', xlabel: 'z / λ', ylabel: '', yticks: 0, grid: false,
      sliders: [
        { key: 'ph', label: t`Time $\omega t$`, min: 0, max: 360, step: 5, value: 40, unit: '^\\circ', explain: 'One full cycle is 360°.' },
        { key: 'r', label: t`Reflected amplitude $r$`, min: 0, max: 1, step: 0.05, value: 1, explain: t`The fraction of the incident amplitude sent back: 0 for a perfect absorber, 1 for a perfect mirror.` },
      ],
      shade: [{ fn: '2.3', lower: '-2.3', from: 0, to: 0.3, color: 'ink3', alpha: 0.45 }],
      curves: [
        { fn: '(cos(2*pi*x - ph*pi/180))^2 - r^2*(cos(2*pi*x + ph*pi/180))^2', domain: [-2, 0], color: 'gold', width: 1.4, label: 'S', labelAt: -1.93, labelDy: 4 },
        { fn: 'cos(2*pi*x - ph*pi/180) - r*cos(2*pi*x + ph*pi/180)', domain: [-2, 0], color: 'violet', width: 2.6, label: 'E', labelAt: -1.75, labelDy: -2 },
        { fn: 'cos(2*pi*x - ph*pi/180) + r*cos(2*pi*x + ph*pi/180)', domain: [-2, 0], color: 'teal', width: 2.4, dash: [7, 4], label: 'cB', labelAt: -1.5, labelDy: -2 },
      ],
      points: [{ x: 0.15, y: 1.95, r: 0, label: 'surface', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' }],
      readouts: [
        { label: t`Average $\langle S\rangle$ as a fraction of the incident $I_0$`, expr: '1 - r^2', digits: 3 },
        { label: t`Largest $|E|$ anywhere, in units of $E_0$`, expr: '1 + r', digits: 3 },
      ],
    },
    caption: t`Fields in units of the incident amplitude $E_0$; $S$ in units of $E_0^2/\mu_0c$. One polarization, normal incidence, no loss in the space in front of the surface. A real reflector also shifts the phase of the reflection; here it is the perfect conductor’s.`,
  },
  example: {
    prompt: t`A ${GHZ(EX.f)} radar wave with $E_0 = ${EX.E0}$ V/m strikes a flat metal plate square-on and is reflected perfectly. Describe the field in front of the plate: where are the nodes of $E$, how large do $E$ and $B$ get, and how much energy flows?`,
    visual: standPic(t`The standing wave in front of the plate (on the right), at one instant. Fields in units of $E_0$; not to scale with the plate.`, { r: 1, ph: 50 }),
    steps: [
      { label: 'Add the reflection', text: t`Put the plate at $z = 0$. The incident wave is $E_0\cos(kz - \omega t)\,\hat x$. At a perfect conductor the tangential $\vec E$ must vanish, so the reflected wave is $-E_0\cos(-kz - \omega t)\,\hat x$, travelling back along $-z$. Their sum is $E_x = E_0[\cos(kz - \omega t) - \cos(kz + \omega t)] = 2E_0\sin kz\,\sin\omega t$.` },
      { label: 'The magnetic field', text: t`Each wave carries $\vec B = \tfrac1c\hat k\times\vec E$. For the reflected wave $\hat k = -\hat z$, which flips the sign once more: $cB_y = E_0[\cos(kz - \omega t) + \cos(kz + \omega t)] = 2E_0\cos kz\,\cos\omega t$. Sine against cosine, in space and in time: a quarter wavelength and a quarter cycle apart.` },
      { label: 'Numbers', text: t`$\lambda = c/f = ${nice(sf(EX.lam * 100, 4))}$ cm. $E$ vanishes at the plate and every $\lambda/2 = ${nice(sf(EX.lam * 50, 4))}$ cm in front of it, and peaks at $2E_0 = ${2 * EX.E0}$ V/m halfway between, starting $\lambda/4 = ${nice(sf(EX.lam * 25, 3))}$ cm out. $B$ peaks **at** the plate, at $2E_0/c = ${nice(sf(EX.Bmax * 1e6, 3))}$ μT.` },
      { label: 'Energy flow', text: t`$S_z = E_xB_y/\mu_0 = \dfrac{E_0^2}{\mu_0c}\sin 2kz\,\sin 2\omega t$, which averages to zero over a cycle: the incident wave’s $I_0 = \tfrac12c\varepsilon_0E_0^2 \approx ${nice(sf(EX.I0, 3))}$ W/m² is all sent back. Within each quarter wavelength, energy surges toward the $E$ antinodes and back toward the $B$ antinodes twice per cycle.` },
      { label: 'Sense check', text: t`Doubling of the amplitude is what two equal waves in phase give; nodes half a wavelength apart are what two equal waves travelling in opposite directions give. In 1890 Otto Wiener put a thin photographic film at a slant through such a standing wave of light and found dark bands at the $E$ nodes: it is the electric field that drives photochemistry.` },
    ],
    answer: t`$E = 2E_0\sin kz\sin\omega t$ with nodes at the plate and every ${nice(sf(EX.lam * 50, 4))} cm, peaking at ${2 * EX.E0} V/m; $B$ peaks at the plate at ${nice(sf(EX.Bmax * 1e6, 3))} μT; the average Poynting vector is zero.`,
  },
  practice: [
    num({
      id: 'b-from-k', difficulty: 2,
      gen(r) {
        const [p, q, h] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
        const sx = r.sign(), sy = r.sign(), kx = (sx * p) / h, ky = (sy * q) / h;
        const E0 = r.pick([30, 60, 150, 300]), comp = r.pick(['x', 'y']);
        // B₀ = (1/c) k̂ × E₀ẑ = (E₀/c)(k_y, −k_x, 0)
        const B = comp === 'x' ? (E0 / C) * ky : -(E0 / C) * kx;
        const wrong = comp === 'x' ? (E0 / C) * kx : -(E0 / C) * ky;
        const kTeX = t`\tfrac{1}{${h}}(${sx * p}\,\hat x ${sy > 0 ? '+' : '-'} ${q}\,\hat y)`;
        return {
          prompt: t`A plane wave travels in vacuum along $\hat k = ${kTeX}$, with $\vec E = ${E0}\,\hat z\,\cos(\vec k\cdot\vec r - \omega t)$ V/m. Its magnetic field is $\vec B = \vec B_0\cos(\vec k\cdot\vec r - \omega t)$. What is $B_{0${comp}}$, with its sign, in nT?`,
          visual: kPic([sx * p / h, sy * q / h, 0].map((v) => +(1.3 * v).toFixed(4)), [{ to: [0, 0, 1.1], color: 'violet', label: '\\vec E_0' }], t`The direction of travel $\hat k$ (gold) in the $xy$-plane and $\vec E_0$ (violet) along $z$. Drag to turn.`),
          answer: B * 1e9, units: 'nT', tol: { rel: 0.01 },
          errors: [
            { value: wrong * 1e9, feedback: t`You took the wrong component of $\hat k$: $\hat k\times\hat z = (k_y, -k_x, 0)$.` },
            { value: (comp === 'x' ? E0 * ky : -E0 * kx) * 1e9, feedback: t`In vacuum $|\vec B| = |\vec E|/c$: divide by $c$.` },
          ].filter((e) => Math.abs(e.value - B * 1e9) > 0.03 * Math.abs(B * 1e9)),
          hints: [t`$\vec B_0 = \tfrac1c\,\hat k\times\vec E_0$.`, t`$\hat k\times\hat z = (k_x\hat x + k_y\hat y)\times\hat z = k_y\,\hat x - k_x\,\hat y$.`],
          teach: 'In any direction, B₀ = k̂ × E₀/c: perpendicular to both, and smaller by c.',
          explain: t`$\vec B_0 = \dfrac{E_0}{c}(k_y\,\hat x - k_x\,\hat y)$, so $B_{0${comp}} = ${nice(sf(B * 1e9, 3))}$ nT. Check: $\vec B_0\cdot\hat k = 0$ and $\vec B_0\cdot\vec E_0 = 0$, and $|\vec B_0| = E_0/c = ${nice(sf((E0 / C) * 1e9, 3))}$ nT.`,
        };
      },
    }),
    mcq({
      id: 'transverse', difficulty: 2,
      prompt: t`A plane wave travels through vacuum along $\hat k = (\hat x + \hat y)/\sqrt2$. Which of these could be its electric field amplitude $\vec E_0$?`,
      visual: kPic([0.92, 0.92, 0], [], t`The direction of travel, $\hat k$, halfway between the $x$- and $y$-axes. Drag to turn.`),
      choices: [
        t`$E_0(\hat x - \hat y + \sqrt2\,\hat z)/2$`,
        t`$E_0\,\hat x$`,
        t`$E_0(\hat x + \hat y)/\sqrt2$`,
        t`$E_0(2\hat x - \hat y)/\sqrt5$`,
      ],
      answer: 0,
      why: {
        1: t`$\hat k\cdot\hat x = 1/\sqrt2 \ne 0$: half of this field points along the direction of travel, and $\nabla\cdot\vec E = i\vec k\cdot\tilde{\vec E}$ would not vanish.`,
        2: t`This field points exactly along $\hat k$ — a longitudinal wave. Gauss’s law in vacuum, $\vec k\cdot\vec E_0 = 0$, forbids it.`,
        3: t`$\hat k\cdot(2\hat x - \hat y) = 1/\sqrt2 \ne 0$. Being in the $xy$-plane is not enough; it must be perpendicular to $\hat k$.`,
      },
      hints: [t`Gauss’s law with no charge, $\nabla\cdot\vec E = 0$, becomes $\vec k\cdot\vec E_0 = 0$.`, t`Take the dot product of each candidate with $(1, 1, 0)$: only a zero is allowed.`],
      teach: 'In vacuum the divergence laws make every plane wave transverse: k·E₀ = 0 and k·B₀ = 0.',
      explain: t`$(1, 1, 0)\cdot(1, -1, \sqrt2) = 1 - 1 + 0 = 0$, so $E_0(\hat x - \hat y + \sqrt2\hat z)/2$ is perpendicular to $\hat k$ (and of length $E_0$). Any vector in the plane across $\hat k$ will do — a mixture of the $\hat z$ direction and $(\hat x - \hat y)/\sqrt2$ — and the mixture sets the polarization.`,
    }),
    mcq({
      id: 'algebra', difficulty: 2,
      prompt: t`For a plane wave $\tilde{\vec E} = \tilde{\vec E}_0e^{i(\vec k\cdot\vec r - \omega t)}$, $\tilde{\vec B} = \tilde{\vec B}_0e^{i(\vec k\cdot\vec r - \omega t)}$, what does Faraday’s law $\nabla\times\vec E = -\partial\vec B/\partial t$ become?`,
      visual: { type: 'em-wave', params: { controls: false, readout: false, phase: 60 }, caption: t`A plane wave: $\vec E$ (violet), $\vec B$ (teal) and the direction of travel (gold) form a right-handed set. Not to scale.` },
      choices: [
        t`$\vec k\times\tilde{\vec E}_0 = \omega\tilde{\vec B}_0$`,
        t`$\vec k\times\tilde{\vec E}_0 = -\omega\tilde{\vec B}_0$`,
        t`$\vec k\cdot\tilde{\vec E}_0 = \omega\tilde{\vec B}_0$`,
        t`$\vec k\times\tilde{\vec E}_0 = \dfrac{\omega}{c^2}\tilde{\vec B}_0$`,
      ],
      answer: 0,
      why: {
        1: t`The minus sign of Faraday’s law meets the $-i\omega$ from $\partial/\partial t$: $-(-i\omega) = +i\omega$. With $\nabla\times \to i\vec k\times$, the $i$’s cancel and no minus sign is left.`,
        2: t`The curl becomes a **cross** product with $i\vec k$; a dot product is what the divergence becomes.`,
        3: t`The $1/c^2$ belongs to the Ampère–Maxwell law, $\vec k\times\tilde{\vec B}_0 = -\frac{\omega}{c^2}\tilde{\vec E}_0$.`,
      },
      hints: [t`On $e^{i(\vec k\cdot\vec r - \omega t)}$, $\nabla$ acts as $i\vec k$ and $\partial/\partial t$ as $-i\omega$.`, t`So $i\vec k\times\tilde{\vec E}_0 = -(-i\omega)\tilde{\vec B}_0$.`],
      teach: 'On a plane wave ∇ → ik and ∂/∂t → −iω, so each Maxwell equation becomes a line of vector algebra.',
      explain: t`$i\vec k\times\tilde{\vec E}_0 = i\omega\tilde{\vec B}_0$, so $\tilde{\vec B}_0 = \vec k\times\tilde{\vec E}_0/\omega$ — perpendicular to $\vec k$ and $\vec E_0$, in phase with $\vec E$, and with $|\vec B_0| = |\vec E_0|/c$ because $\omega/k = c$.`,
    }),
    num({
      id: 'nodes', difficulty: 2,
      gen(r) {
        const f = r.pick([2.45e9, 5.8e9, 10e9, 24e9]), kind = r.pick(['emax', 'enode', 'bnode']), n = r.int(1, 3);
        const lam = C / f;
        const z = kind === 'emax' ? ((2 * n - 1) * lam) / 4 : kind === 'enode' ? (n * lam) / 2 : ((2 * n - 1) * lam) / 4;
        const ord = ['first', 'second', 'third'][n - 1];
        const what = kind === 'emax' ? t`the ${ord} maximum of the electric field` : kind === 'enode' ? t`the ${ord} node of the electric field (not counting the plate itself)` : t`the ${ord} node of the magnetic field`;
        const alt = kind === 'enode' ? ((2 * n - 1) * lam) / 4 : (n * lam) / 2;
        return {
          prompt: t`A ${GHZ(f)} wave is reflected straight back by a flat metal plate, making a standing wave in front of it. How far from the plate is ${what}, in cm?`,
          visual: standPic(t`The standing wave in front of the plate at one instant. Fields in units of the incident $E_0$.`, { r: 1, ph: 60 }),
          answer: z * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: alt * 100, feedback: kind === 'enode' ? t`That is a maximum of $E$. At a perfect conductor $E = 0$, so the nodes of $E$ sit at the plate and every $\lambda/2$ from it.` : t`That is a node of ${kind === 'bnode' ? '$E$ — where $B$ is largest' : '$E$'}. ${kind === 'bnode' ? '$B$ peaks at the plate, so its nodes are a quarter wavelength out.' : '$E$ peaks a quarter wavelength from each node.'}` }],
          hints: [t`$E \propto \sin kz$ and $B \propto \cos kz$ with the plate at $z = 0$: $E$ vanishes at the plate, $B$ is largest there.`, t`Zeros of $\sin kz$ are $\lambda/2$ apart; the peaks and the zeros of $\cos kz$ lie halfway between, at odd multiples of $\lambda/4$.`],
          teach: 'In front of a mirror E has nodes at the surface and every λ/2; B has its antinodes there, and its nodes λ/4 out.',
          explain: t`$\lambda = c/f = ${nice(sf(lam * 100, 4))}$ cm, so the distance is ${kind === 'enode' ? t`$${n}\lambda/2$` : t`$${2 * n - 1}\lambda/4$`} $= ${nice(sf(z * 100, 3))}$ cm.`,
        };
      },
    }),
    mcq({
      id: 'slosh', difficulty: 3,
      prompt: t`In the standing wave in front of a perfect mirror there is an instant, twice each cycle, when the electric field is zero **everywhere** (as drawn). Where is the wave’s energy at that instant?`,
      visual: standPic(t`The standing wave at the instant $\omega t = 0$: $E$ (violet) is zero everywhere. Fields in units of $E_0$.`, { r: 1, ph: 0 }),
      choices: [
        t`All in the magnetic field, concentrated near the mirror and every half wavelength from it`,
        'Nowhere: the wave has momentarily lost its energy and regains it a quarter cycle later',
        'In transit toward the mirror at the speed of light',
        'Half in the electric field and half in the magnetic field, as in any electromagnetic wave',
      ],
      answer: 0,
      why: {
        1: t`Energy is conserved locally: $\partial u/\partial t = -\nabla\cdot\vec S$. With no absorber, it cannot vanish — it has moved into $\vec B$.`,
        2: t`On average no energy flows at all in a standing wave: $\langle S\rangle = 0$. It only surges back and forth within each quarter wavelength.`,
        3: t`Equal shares, $u_E = u_B$ at every point and instant, hold for a **single travelling** wave. Superposing two waves breaks it.`,
      },
      hints: ['Look at the dashed teal curve at this instant.', t`$u = \tfrac12\varepsilon_0E^2 + \tfrac{1}{2\mu_0}B^2$. With $E = 0$ everywhere, what is left?`],
      teach: 'In a standing wave the energy sloshes between E and B each quarter cycle; only a travelling wave keeps them equal.',
      explain: t`At this instant $cB = 2E_0\cos kz$ is at its largest, so $u = B^2/2\mu_0 = 2\varepsilon_0E_0^2\cos^2kz$: all magnetic, peaked at the mirror and every $\lambda/2$. A quarter cycle later $B = 0$ everywhere and the same energy sits in $E$, peaked at odd multiples of $\lambda/4$. Integrated over a half wavelength the total is the same both times.`,
    }),
    num({
      id: 'partial', difficulty: 3,
      gen(r) {
        const E0 = r.pick([20, 40, 80, 150]), rr = r.pick([0.2, 0.3, 0.5, 0.6, 0.8]);
        const I0 = 0.5 * C * EPS0 * E0 * E0, S = (1 - rr * rr) * I0;
        return {
          prompt: t`A plane wave with $E_0 = ${E0}$ V/m strikes a surface square-on, and the reflected wave has amplitude $${rr}E_0$. What is the time-averaged Poynting vector in front of the surface, in W/m²?`,
          visual: standPic(t`Incident plus reflected wave at one instant, with the envelope of $E$ dashed. Fields in units of $E_0$.`, { r: rr, ph: 30, env: true }),
          answer: S, units: 'W/m^2', tol: { rel: 0.01 },
          errors: [
            { value: I0, feedback: t`That is the incident intensity alone. The reflected wave carries $r^2I_0$ back the other way.` },
            { value: (1 - rr) * I0, feedback: t`Intensity goes as the **square** of the amplitude: the reflected wave carries $r^2I_0$, not $rI_0$.` },
            { value: (1 + rr * rr) * I0, feedback: t`The two waves travel in opposite directions, so their energy flows subtract.` },
          ].filter((e) => Math.abs(e.value - S) > 0.03 * S),
          hints: [t`Each travelling wave carries $\tfrac12c\varepsilon_0(\text{amplitude})^2$ in its own direction; the cross terms average to zero.`, t`$\langle S\rangle = \tfrac12c\varepsilon_0E_0^2(1 - r^2)$.`],
          teach: 'A partly reflected wave carries (1 − r²) of the incident intensity forward, on average.',
          explain: t`$I_0 = \tfrac12c\varepsilon_0E_0^2 \approx ${nice(sf(I0, 3))}$ W/m², of which $r^2 = ${nice(sf(rr * rr, 3))}$ comes back, so $\langle S\rangle \approx ${nice(sf(S, 3))}$ W/m² flows into the surface.`,
        };
      },
    }),
    num({
      id: 'u-mirror', difficulty: 3,
      gen(r) {
        const E0 = r.pick([100, 300, 1000, 3000]);
        const u = 2 * EPS0 * E0 * E0;
        return {
          prompt: t`A plane wave of amplitude $E_0 = ${E0}$ V/m is reflected perfectly by a metal surface. What is the largest magnetic energy density anywhere in the standing wave, in $\text{J/m}^3$?`,
          visual: standPic(t`The standing wave at the instant its magnetic field is largest. Fields in units of $E_0$.`, { r: 1, ph: 0 }),
          answer: u * 1e6, units: 'μJ/m^3', tol: { rel: 0.01 },
          errors: [
            { value: 0.5 * EPS0 * E0 * E0 * 1e6, feedback: t`That is the magnetic energy density of the incident wave alone. At the mirror the two waves’ $B$ add: $B_{\max} = 2E_0/c$.` },
            { value: EPS0 * E0 * E0 * 1e6, feedback: t`The peak field is $2E_0/c$, and energy goes as its square: four times the single wave’s $\tfrac12\varepsilon_0E_0^2$.` },
          ],
          hints: [t`At the mirror the magnetic fields of the incident and reflected waves add: $B_{\max} = 2E_0/c$.`, t`$u_B = B^2/2\mu_0$, and $1/(\mu_0c^2) = \varepsilon_0$.`],
          teach: 'Superposed waves add amplitudes, so the energy density at an antinode is four times one wave’s.',
          explain: t`$u_{B,\max} = \dfrac{(2E_0/c)^2}{2\mu_0} = 2\varepsilon_0E_0^2 \approx ${tex(u, 3)}\ \text{J/m}^3$, at the mirror’s face. Averaged over the standing wave it is still $\tfrac12\varepsilon_0E_0^2$ per wave — interference moves energy around, it does not create it.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lattice', difficulty: 3, transfer: true,
      gen(r) {
        const [atom, lam] = r.pick([['strontium', 813.43e-9], ['ytterbium', 759.35e-9]]);
        const L = r.pick([0.2, 0.5, 1, 2]);
        const N = (L * 1e-3) / (lam / 2);
        return {
          prompt: t`An optical lattice clock traps ${atom} atoms in a laser beam at ${nice(lam * 1e9)} nm that is reflected straight back on itself. The light pulls atoms toward the places where its electric field oscillates most strongly, one site at each antinode. About how many lattice sites fit in a cloud ${L} mm long?`,
          visual: standPic(t`A retro-reflected beam makes a standing wave; the atoms sit at the antinodes of $E$ (violet). Not to scale.`, { r: 1, ph: 90, B: false }),
          answer: N, tol: { rel: 0.01 },
          errors: [{ value: (L * 1e-3) / lam, feedback: t`Antinodes of a standing wave are half a wavelength apart, not a whole one.` }, { value: (L * 1e-3) / (lam / 4), feedback: t`$\lambda/4$ separates a node from the next antinode; antinode to antinode is $\lambda/2$.` }],
          hints: [t`$E \propto \sin kz$: its antinodes repeat every half wavelength.`, t`Divide the length of the cloud by $\lambda/2$.`],
          teach: 'A standing wave repeats every λ/2, so a retro-reflected laser makes a lattice with that spacing.',
          explain: t`The sites are $\lambda/2 = ${nice(sf((lam / 2) * 1e9, 4))}$ nm apart, so ${L} mm holds about $${nice(sf(N, 3))}$ of them. The wavelength is a “magic” one, chosen so the light shifts the clock’s two levels equally and the trapping does not disturb the ticking; such clocks reach fractional uncertainties near $10^{-18}$.`,
        };
      },
    }),
    num({
      id: 'cp-vswr', difficulty: 3, transfer: true,
      gen(r) {
        const S = r.pick([1.2, 1.5, 2, 2.5, 3]);
        const rr = (S - 1) / (S + 1), R = rr * rr;
        return {
          prompt: t`The waveguide feeding a deep-space antenna is checked with a probe slid along it: the field amplitude of the standing wave swings between a maximum and a minimum whose ratio is $E_{\max}/E_{\min} = ${S}$ (the voltage standing-wave ratio, VSWR). What percentage of the transmitter’s power is reflected back from the antenna?`,
          visual: standPic(t`A partly reflected wave: the dashed envelope of $E$ swings between $1 + r$ and $1 - r$ times the incident amplitude. Not to scale.`, { r: rr, ph: 30, env: true, B: false }),
          answer: R * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: rr * 100, feedback: t`$r$ is the reflected **amplitude**; power goes as its square.` }, { value: (1 - R) * 100, feedback: 'That is the power delivered to the antenna; the question asks what comes back.' }],
          hints: [t`Where the waves add in step the amplitude is $(1 + r)E_0$; where they oppose, $(1 - r)E_0$.`, t`So $\text{VSWR} = \dfrac{1 + r}{1 - r}$, giving $r = \dfrac{\text{VSWR} - 1}{\text{VSWR} + 1}$, and the reflected power is $r^2$.`],
          teach: 'A standing-wave ratio measures the reflection: r = (S − 1)/(S + 1), and r² of the power comes back.',
          explain: t`$r = \dfrac{${S} - 1}{${S} + 1} = ${nice(sf(rr, 3))}$, and $r^2 \approx ${nice(sf(R * 100, 3))}\%$ of the power returns toward the transmitter. Feeds are usually specified at VSWR below about 1.5 (4%), both to deliver the power and to spare the amplifier.`,
        };
      },
    }),
    mcq({
      id: 'cp-dir', difficulty: 2,
      prompt: t`At some point in empty space, a plane wave’s electric field points along $+\hat x$ while its magnetic field points along $-\hat y$. Which way is the wave travelling?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, vectors: [{ to: [1.2, 0, 0], color: 'violet', label: '\\vec E' }, { to: [0, -1.2, 0], color: 'teal', label: '\\vec B' }] }, caption: t`The two fields at one point and one instant. Drag to turn.` },
      choices: [t`$-\hat z$`, t`$+\hat z$`, t`$+\hat x$, along $\vec E$`, t`$-\hat y$, along $\vec B$`],
      answer: 0,
      why: {
        1: t`$\hat x\times\hat y = +\hat z$, but here $\vec B$ is along $-\hat y$, which reverses the product.`,
        2: t`In vacuum the fields are transverse: $\vec E$ never points along the direction of travel.`,
        3: t`$\vec B$ is transverse too; the direction of travel is perpendicular to both fields, along $\vec E\times\vec B$.`,
      },
      hints: [t`Energy flows along $\vec S = \vec E\times\vec B/\mu_0$.`, t`$\hat x\times(-\hat y) = -(\hat x\times\hat y)$.`],
      teach: 'A plane wave travels along E × B.',
      explain: t`$\vec S \propto \hat x\times(-\hat y) = -\hat z$. The same follows from $\vec B = \hat k\times\vec E/c$: with $\hat k = -\hat z$, $(-\hat z)\times\hat x = -\hat y$ ✓.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §9.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Ushijima et al., Cryogenic optical lattice clocks, Nature Photonics 9, 185 (2015)', url: 'https://doi.org/10.1038/nphoton.2015.5' },
  ],
});
