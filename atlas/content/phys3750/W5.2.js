// Standing waves and boundary conditions: sin(qx)cos(ωt) as two opposite
// travelling waves; fixed ends (y = 0), free ends (y_x = 0) and rings
// (periodic) each pick their own allowed q — and the chain's ends become the
// string's. Reflection with and without inversion. Example: a launch vehicle
// in flight as a free–free rod.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, chainPic, curvesPic } from './_wv.js';

const t = String.raw;

// the worked example: a stage in flight as a uniform free–free rod
const EX = (() => {
  const L = 60, v = 1500;
  return { L, v, f: [1, 2, 3].map((n) => (n * v) / (2 * L)), lam1: 2 * L };
})();

// a clamped–free member's first mode shape, sin(πx/2L)
const boomPic = (L, caption) => ({ type: 'graph', params: { x: [0, L * 1.08], y: [-0.3, 1.35], aspect: 'wide', xlabel: 'x (m)', ylabel: 'X', yticks: 0, curves: [{ fn: `sin(${Math.PI / 2 / L}*x)`, color: 'accent', domain: [0, L], label: 'mode 1', labelAt: L * 0.55, labelDy: -12 }], vlines: [{ x: 0, label: 'clamped', color: 'ink3' }, { x: L, label: 'free', color: 'ink3' }] }, caption });

export default lesson({
  id: 'phys3750.W5.2',
  title: 'Standing waves and boundary conditions',
  minutes: 14, difficulty: 2,
  intro: t`Send equal waves both ways along a medium and add them: $\cos(qx - \omega t) + \cos(qx + \omega t) = 2\cos qx\,\cos\omega t$. The pattern no longer travels — it **stands**, with nodes that never move. On a finite medium the ends decide which standing waves fit, just as the walls did for the chain:

$$y_n(x, t) = X_n(x)\cos(\omega_nt - \phi_n), \qquad \omega_n = vq_n$$

$$\text{fixed: } X_n = \sin\frac{n\pi x}{L} \qquad \text{free: } X_n = \cos\frac{n\pi x}{L} \qquad \text{ring: } X_n = e^{2\pi inx/L}$$

A **fixed** end holds $y = 0$; a **free** end feels no sideways force, so the slope vanishes, $\partial y/\partial x = 0$; a **ring** must join up with itself. Every one of them quantizes $q$. A wave reflected from a fixed end comes back inverted; from a free end, upright.`,
  symbols: [
    { tex: 'X_n(x)', text: 'the mode shape: the standing pattern of mode $n$' },
    { tex: 'q_n', text: 'the allowed wavenumbers, in rad/m: $n\\pi/L$ (fixed–fixed and free–free), $(n - \\tfrac12)\\pi/L$ (fixed–free), $2\\pi n/L$ (ring)' },
    { tex: '\\omega_n = vq_n', text: 'the mode frequencies, in rad/s' },
    { tex: 'L', text: 'the length of the medium (for a ring, its circumference), in m' },
    { tex: 'n', text: 'the mode number: $1, 2, \\ldots$ (fixed), $0, 1, \\ldots$ (free and ring; $n = 0$ is the whole body moving or sliding at once)' },
    { tex: '\\phi_n', text: 'the phase of mode $n$, set by how it was started' },
  ],
  why: t`Boundary conditions quantize: a string’s harmonics, a rocket’s structural modes, an electron’s energy levels in a box and the modes of a laser cavity are all standing waves picked out by their ends.`,
  visual: {
    type: 'wv-chain',
    title: 'Ends choose the modes',
    lead: t`A long chain — nearly a string — in one mode, with the continuous shape it samples dashed. Switch the ends between fixed, free and ring and step through the modes; below, each mode’s dot on the dispersion curve.`,
    tasks: [t`Fixed ends: mode $n$ fits $n$ half-wavelengths, with nodes at the walls.`, t`Free ends: the shapes are cosines with flat (zero-slope) ends; $n = 0$ is the whole chain sliding at zero frequency.`, 'Ring: the dashed copies join the last bead to the first; a whole number of wavelengths must fit round.'],
    params: { N: 24, maxN: 40, bc: 'fixed', n: 2, controls: ['bc', 'n', 'N'], readouts: ['N', 'n', 'q', 'omega', 'ratio'] },
  },
  example: {
    prompt: t`In flight a launch vehicle is held by nothing: lengthwise, it is a **free–free** rod. Model a ${EX.L} m stage as uniform, with an effective lengthwise wave speed $v = ${EX.v}$ m/s (an illustrative value: propellant loads the structure and slows its waves well below bare aluminium’s 5100 m/s). Find the shapes and frequencies of its first three lengthwise modes.`,
    steps: [
      { label: 'Boundary condition', text: t`At a free end nothing pushes or pulls, so the strain $\partial u/\partial x$ vanishes: $u_x(0) = u_x(L) = 0$.` },
      { label: 'Shapes', text: t`$X = \cos qx$ satisfies $X'(0) = 0$; $X'(L) = -q\sin qL = 0$ needs $q_n = n\pi/L$. So $X_n = \cos(n\pi x/L)$, $n = 0, 1, 2, \ldots$` },
      { label: 'Rigid-body mode', text: t`$n = 0$: $X = $ constant, $\omega = 0$ — the whole vehicle moving at once. That is the flight itself, not a vibration.` },
      { label: 'Frequencies', text: t`$f_n = vq_n/2\pi = nv/(2L)$: $f_1 = ${tn(EX.f[0])}$ Hz, $f_2 = ${tn(EX.f[1])}$ Hz, $f_3 = ${tn(EX.f[2])}$ Hz.` },
      { label: 'Nodes', text: t`Mode 1 has one node, at mid-length: the two ends move oppositely, stretching and squeezing the middle — a wavelength of $2L = ${EX.lam1}$ m. Mode 2 has nodes at $L/4$ and $3L/4$.` },
      { label: 'Sense check', text: t`Free–free gives the same frequencies as fixed–fixed, $nv/2L$, but cosines instead of sines: the ends are antinodes. These are the modes that pogo can excite — and engineers check where each mode’s nodes fall before placing flight sensors.` },
    ],
    answer: t`$X_n = \cos(n\pi x/L)$ with $f_1 = ${tn(EX.f[0])}$, $f_2 = ${tn(EX.f[1])}$ and $f_3 = ${tn(EX.f[2])}$ Hz (plus the zero-frequency rigid-body mode).`,
    visual: chainPic({ N: 5, bc: 'free', panels: ['gallery'], labels: false }, t`The modes of a free–free chain of 5 masses (lengthwise motion drawn sideways): $n = 0$ slides whole, mode $n$ has $n$ nodes. Dashed: the continuous rod’s cosines.`),
  },
  practice: [
    mcq({
      id: 'two-travelling', difficulty: 1,
      prompt: t`What is $\sin(qx - \omega t) + \sin(qx + \omega t)$?`,
      visual: curvesPic([
        { fn: 'sin(x - 0.6)', color: 'ink3', dash: [5, 4], width: 1.2 },
        { fn: 'sin(x + 0.6)', color: 'ink3', dash: [2, 4], width: 1.2 },
        { fn: 'sin(x - 0.6) + sin(x + 0.6)', color: 'accent', width: 2 },
      ], [0, 12.6], [-2.2, 2.2], t`Two equal waves running opposite ways (dashed) and their sum (solid) at one instant, $x$ across in units of $1/q$.`, { xlabel: 'q x', ylabel: '' }),
      choices: [t`$2\sin qx\,\cos\omega t$: a standing wave`, t`$2\sin qx\,\sin\omega t$: a standing wave`, t`$2\sin(qx)$: a fixed, unmoving shape`, t`$\sin 2qx$: a wave of half the wavelength`],
      answer: 0,
      why: {
        1: t`Use $\sin(A \mp B) = \sin A\cos B \mp \cos A\sin B$: the $\sin\omega t$ terms cancel, the $\cos\omega t$ terms add.`,
        2: t`The amplitude still oscillates in time, as $\cos\omega t$; the waves do not freeze.`,
        3: 'Adding two waves of wavenumber q gives wavenumber q, not 2q.',
      },
      hints: [t`Expand each sine with the angle-sum formula.`, t`Or in complex form: $e^{i(qx - \omega t)} + e^{i(qx + \omega t)} = 2e^{iqx}\cos\omega t$.`],
      teach: 'Two equal waves running opposite ways make a standing wave: a fixed shape whose size oscillates.',
      explain: t`$2\sin qx\cos\omega t$: nodes where $\sin qx = 0$, every point oscillating in step with amplitude $2|\sin qx|$. Conversely, every standing wave is two travelling waves.`,
    }),
    num({
      id: 'mast', difficulty: 2,
      gen(r) {
        const L = r.pick([2, 3, 4]), E = 135e9, rho = 1600, v = Math.sqrt(E / rho), n = r.pick([1, 2, 3]);
        const f = ((2 * n - 1) * v) / (4 * L);
        return {
          prompt: t`A carbon-fibre antenna mast ${L} m long is clamped to a spacecraft at its base and free at its tip. Lengthwise waves in it travel at $v = ${tn(v)}$ m/s. What is the frequency of its ${['', 'first', 'second', 'third'][n]} lengthwise mode, in Hz?`,
          visual: boomPic(L, 'The mast’s first lengthwise mode shape, displacement along the mast drawn sideways: a quarter wavelength fits between the clamp and the free tip.'),
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: (n * v) / (2 * L), feedback: t`That is a fixed–fixed (or free–free) mode. A clamped–free mast fits an **odd** number of quarter-wavelengths: $q_n = (n - \tfrac12)\pi/L$.` }],
          hints: [t`Clamped: $u(0) = 0$; free: $u_x(L) = 0$. Try $X = \sin qx$.`, t`$\cos qL = 0$ gives $q_n = (n - \tfrac12)\pi/L$, so $f_n = (2n - 1)v/(4L)$.`],
          teach: t`Fixed at one end and free at the other: odd quarter-wavelengths, $f_n = (2n - 1)v/4L$.`,
          explain: t`$f_{${n}} = ${2 * n - 1} \times ${tn(v)}/(4 \times ${L}) = ${tn(f)}$ Hz.`,
        };
      },
    }),
    mcq({
      id: 'free-reflect', difficulty: 2,
      prompt: t`An upward pulse runs toward the end of a string whose end ring slides freely on a smooth vertical rod (a free end). What comes back?`,
      visual: curvesPic([{ fn: '1.2*exp(-((x - 6)/0.8)^2)', color: 'accent', label: 'pulse →', labelAt: 6, labelDy: -14 }], [0, 12], [-1.6, 1.8], 'An upward pulse heading right toward a free end at x = 10 (vertical line).', { xlabel: 'x', ylabel: '', vlines: [{ x: 10, label: 'free end', color: 'ink3' }], yticks: 0 }),
      choices: ['An upward pulse: a free end reflects without inverting', 'A downward pulse: every end inverts the pulse it reflects', 'Nothing: a free end lets the pulse slide off the string', 'A pulse of twice the height, travelling on the rod'],
      answer: 0,
      why: {
        1: 'Inversion is the rule for a fixed end, where the reflected wave must cancel the incoming one to hold y = 0.',
        2: 'The ring cannot leave the rod: the energy must return along the string.',
        3: 'The end does briefly swing to twice the height, but the reflected pulse has the original height.',
      },
      hints: [t`A free end needs $y_x = 0$ there at all times.`, t`Add a mirror-image pulse coming from beyond the end. Which sign keeps the slope zero at the end?`],
      teach: t`Fixed end ($y = 0$): reflection inverted. Free end ($y_x = 0$): reflection upright.`,
      explain: t`An upright mirror image makes the shape symmetric about the end, so its slope there is zero — the free-end condition. (An inverted image makes it antisymmetric, so $y = 0$: the fixed end.)`,
    }),
    num({
      id: 'ring', difficulty: 2,
      gen(r) {
        const C = r.pick([600, 1000, 1500]), v = r.pick([20, 40, 60]), p = r.pick([1, 2, 3]);
        return {
          prompt: t`Satellites in a formation are joined into a closed loop of tether, ${C} m round; sideways waves travel along it at ${v} m/s. What is the frequency of its mode with ${p} whole wavelength${p > 1 ? 's' : ''} round the loop, in Hz?`,
          visual: chainPic({ N: 12, bc: 'periodic', start: 'mode', n: p }, `A ring of beads, drawn opened out (faded copies show the join), in its mode with ${p} wavelength${p > 1 ? 's' : ''} round the loop.`),
          answer: (p * v) / C, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: (p * v) / (2 * C), feedback: t`A ring fits whole wavelengths, not half-wavelengths: $q_p = 2\pi p/C$.` }],
          hints: [t`Going once round must repeat the pattern: $e^{iqC} = 1$, so $q_p = 2\pi p/C$.`, t`$f = vq/2\pi = pv/C$.`],
          teach: t`Periodic boundary conditions: $q_p = 2\pi p/L$, so $f_p = pv/L$ — and each one comes as a pair (waves going either way round).`,
          explain: t`$f = ${p} \times ${v}/${C} = ${tn((p * v) / C)}$ Hz. There are two such modes, $\cos$ and $\sin$ (or one wave going each way round), with the same frequency.`,
        };
      },
    }),
    mcq({
      id: 'which-ends', difficulty: 2,
      prompt: 'These are the slowest modes of a chain of four masses. What kind of ends does it have?',
      visual: chainPic({ N: 4, bc: 'free', panels: ['gallery'], labels: false, ghost: false }, 'The four normal modes of a chain of four masses, slowest at the top (displacements drawn sideways).'),
      choices: ['Free ends: the top mode is the whole chain moving together', 'Fixed ends: each mode samples a sine that vanishes at the walls', 'A ring: the last mass is joined back to the first', 'Fixed at one end and free at the other end'],
      answer: 0,
      why: {
        1: 'With fixed ends no mode can move every mass by the same amount: the walls hold the chain in.',
        2: 'A ring’s modes join up end to end and come in pairs with equal frequencies; these have flat ends and four different frequencies.',
        3: 'A fixed end would pin its end mass more than the other end in every mode; these modes are symmetric or antisymmetric about the centre.',
      },
      hints: ['Look at the top row: what is it?', 'Which ends allow the whole chain to slide without stretching any spring?'],
      teach: 'Free ends allow a zero-frequency mode (rigid motion) and give cosine shapes with flat ends.',
      explain: t`The top row moves every mass equally: $n = 0$, $\omega = 0$ — possible only if nothing holds the ends. The others sample $\cos\big(n\pi(j - \tfrac12)/N\big)$, with zero slope at the ends.`,
    }),
    mcq({
      id: 'flat-energy', difficulty: 3,
      prompt: t`A string vibrates in a standing wave $y = A\sin qx\cos\omega t$. At the instant it is perfectly straight ($\cos\omega t = 0$), where is its energy?`,
      visual: curvesPic([
        { fn: 'sin(x)', color: 'ink4', dash: [4, 4], width: 1 }, { fn: '-sin(x)', color: 'ink4', dash: [4, 4], width: 1 },
        { fn: '0.5*sin(x)', color: 'ink3', width: 1.2 }, { fn: '0*x', color: 'accent', width: 2.4, label: 'cos ωt = 0', labelAt: 4.6, labelDy: -10 },
      ], [0, 2 * Math.PI], [-1.3, 1.3], 'A standing wave between fixed ends: its outline (dashed), an earlier instant (thin) and the instant it is straight (blue).', { xlabel: 'x', ylabel: '', xticks: 0, yticks: 0 }),
      choices: ['All kinetic: every point is moving fastest just then', 'Nowhere: the string is straight, so the energy is zero', 'All potential, stored in the tension of the string', 'Half kinetic and half potential, as at every instant'],
      answer: 0,
      why: {
        1: t`A straight string has no stretch energy, but it is moving: $y_t = -A\omega\sin qx\sin\omega t$ is at its largest. Energy is conserved; it has not vanished.`,
        2: t`Potential energy needs bending, $\tfrac12T(y_x)^2$, and a straight string has none.`,
        3: 'In a standing wave the two forms take turns: all potential at the extremes, all kinetic when straight.',
      },
      hints: [t`Kinetic energy density $\tfrac12\mu y_t^2$; potential $\tfrac12T y_x^2$.`, t`When $\cos\omega t = 0$, $\sin\omega t = \pm1$.`],
      teach: 'In a standing wave the energy sloshes between stretch (at the extremes) and motion (when straight).',
      explain: t`When $y = 0$ everywhere, $y_x = 0$ (no potential energy) but $|y_t| = A\omega|\sin qx|$ is at its maximum: all the energy is kinetic, concentrated at the antinodes.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-stack', difficulty: 2, transfer: true,
      gen(r) {
        const L = r.pick([40, 50, 70, 90]), v = r.pick([1200, 1500, 2000]);
        return {
          prompt: t`Model a launch vehicle in flight as a uniform free–free rod ${L} m long with an effective lengthwise wave speed of ${v} m/s. What is the frequency of its lowest lengthwise vibration (not the rigid-body motion), in Hz?`,
          visual: chainPic({ N: 14, bc: 'free', start: 'mode', n: 1, view: 'longitudinal' }, 'A free–free chain in its first lengthwise mode: the ends move oppositely, the middle is a node. Displacements exaggerated.'),
          answer: v / (2 * L), units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: v / (4 * L), feedback: t`That is the clamped–free answer. Free at both ends fits a half wavelength: $\lambda = 2L$.` }, { value: v / L, feedback: t`The first free–free mode has one node and $\lambda = 2L$, so $f = v/2L$.` }],
          hints: [t`Free ends: $X = \cos(n\pi x/L)$.`, t`$f_1 = v/(2L)$.`],
          teach: t`Free–free: $f_n = nv/2L$, with antinodes at both ends and $n = 0$ the rigid motion.`,
          explain: t`$f_1 = ${v}/(2 \times ${L}) = ${tn(v / (2 * L))}$ Hz.`,
        };
      },
    }),
    num({
      id: 'cp-mast', difficulty: 3,
      gen(r) {
        const L = r.pick([1.5, 2.5, 5]), v = r.pick([5000, 6000, 9000]), n = r.pick([2, 3]);
        const f = ((2 * n - 1) * v) / (4 * L);
        return {
          prompt: t`A slender sensor boom ${L} m long is clamped at the spacecraft and free at its tip; lengthwise waves travel at ${v} m/s. What is the frequency of mode $n = ${n}$, in Hz?`,
          visual: boomPic(L, 'The boom’s first lengthwise mode shape (displacement along it, drawn sideways): a quarter wavelength fits.'),
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: (n * v) / (4 * L), feedback: t`Clamped–free modes fit odd quarter-wavelengths: $(2n - 1)$, not $n$.` }, { value: (n * v) / (2 * L), feedback: 'That is a fixed–fixed mode.' }],
          hints: [t`$q_n = (n - \tfrac12)\pi/L$.`, t`$f_n = (2n - 1)v/(4L)$.`],
          teach: t`Clamped–free: $f_n = (2n - 1)v/4L$ — only odd multiples of the fundamental.`,
          explain: t`$f_{${n}} = ${2 * n - 1} \times ${v}/(4 \times ${L}) = ${tn(f)}$ Hz, ${2 * n - 1} times the fundamental.`,
        };
      },
    }),
    mcq({
      id: 'cp-quantize', difficulty: 2,
      prompt: 'Which media have only a discrete set of standing-wave frequencies?',
      visual: chainPic({ N: 10, bc: 'periodic', start: 'mode', n: 2 }, 'A ring of ten beads in one of its modes (drawn opened out).'),
      choices: ['Any finite one — fixed ends, free ends or a ring alike', 'Only a medium whose ends are both firmly fixed', 'Only a medium with at least one fixed end', 'None of them: a wave can take any frequency it likes'],
      answer: 0,
      why: {
        1: t`Free ends quantize too ($q_n = n\pi/L$), and so does a ring ($2\pi n/L$): any condition at the ends of a finite medium does.`,
        2: 'Free–free and ring media have discrete modes with no fixed point at all.',
        3: 'Only an infinite medium allows every frequency; any finite one picks a discrete set.',
      },
      hints: ['What did the ring in this lesson need?', 'Finite size plus any end condition picks out special wavenumbers.'],
      teach: 'Quantization comes from finiteness plus boundary conditions — of any kind.',
      explain: t`Fixed–fixed: $\sin(n\pi x/L)$; free–free: $\cos(n\pi x/L)$; ring: $e^{2\pi inx/L}$. Each gives a discrete ladder $\omega_n = vq_n$. A quantum particle in a box gets discrete energies the same way.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 5 §5.2 and ch. 6', url: 'https://digitalcommons.usu.edu/foundation_wave/17/' },
    { label: 'Georgi, The Physics of Waves, ch. 7 (free from the author)', url: 'https://www.people.fas.harvard.edu/~hgeorgi/new.htm' },
  ],
});
