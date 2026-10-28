// Normal modes of the chain, all at once: the sine ansatz x_j = sin(jqa)e^{−iωt},
// the dispersion relation ω = 2√(k/m)|sin(qa/2)|, the fixed ends picking
// q_n = nπ/((N+1)a), aliasing (only N distinct modes), the cutoff 2√(k/m),
// the long-wave line ω = vq, and the chain as a model crystal (phonons).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, chainPic, curvesPic } from './_wv.js';

const t = String.raw;
const U = 1.66053906892e-27;     // atomic mass unit, kg (CODATA 2022)

const wn = (N, n) => 2 * Math.sin((n * Math.PI) / (2 * (N + 1)));      // ω_n / √(k/m), fixed ends

// the worked example: a one-dimensional model of aluminium
const EX = (() => {
  const m = 26.98 * U, a = 0.286e-9, k = 22, w0 = Math.sqrt(k / m), v = a * w0, wmax = 2 * w0;
  const N = 1000, w1 = w0 * wn(N, 1), L = (N + 1) * a;
  return { m, a, k, w0, v, wmax, fmax: wmax / (2 * Math.PI), N, w1, f1: w1 / (2 * Math.PI), L, fs: v / (2 * L) };
})();

const dispPic = (caption, more = {}) => ({
  type: 'graph',
  params: {
    x: [0, 3.45], y: [0, 2.45], aspect: 'wide', xlabel: 'q a (rad)', ylabel: 'ω/√(k/m)', xticks: 7, yticks: 5,
    curves: [{ fn: '2*abs(sin(x/2))', color: 'accent', width: 2 }, { fn: 'x', color: 'ink3', dash: [6, 5], width: 1.2, domain: [0, 2.3], label: 'ω = v q', labelAt: 1.1, labelDx: -50, labelDy: -4 }],
    hlines: [{ y: 2, label: 'cutoff', color: 'warn' }], vlines: [{ x: 'pi', color: 'ink3' }],
    points: [{ x: Math.PI, y: 0.18, r: 0, label: 'q a = π', labelDx: -52, labelDy: 0, color: 'ink3' }],
    ...more,
  },
  caption,
});

export default lesson({
  id: 'phys3750.W3.2',
  title: 'Normal modes of a chain',
  minutes: 16, difficulty: 3,
  intro: t`Every mass in the chain obeys the same equation, so try the same shape everywhere: a sine sampled at the masses, $x_j = \sin(jqa)\,e^{-i\omega t}$. Using $\sin(\theta + \phi) + \sin(\theta - \phi) = 2\sin\theta\cos\phi$, the second difference becomes $2(\cos qa - 1)\sin(jqa)$, and **every** equation of the chain gives the same condition — the chain’s **dispersion relation** — while the fixed far end picks out the allowed wavenumbers:

$$\omega(q) = 2\sqrt{\frac km}\,\Big|\sin\frac{qa}{2}\Big|, \qquad q_n = \frac{n\pi}{(N+1)a}, \quad n = 1, \ldots, N$$

No mode is faster than the **cutoff** $2\sqrt{k/m}$, reached when neighbours move oppositely. Long waves, $qa \ll 1$, obey $\omega \approx vq$ with $v = a\sqrt{k/m}$: a string’s relation. In a crystal these are the lattice vibrations whose quanta are **phonons**.`,
  symbols: [
    { tex: 'q', text: 'the wavenumber, in rad/m: the sine’s phase advances by $qa$ from one mass to the next; the wavelength is $2\\pi/q$' },
    { tex: 'a', text: 'the spacing between neighbouring masses, in m' },
    { tex: '\\omega(q)', text: 'the frequency a sine of wavenumber $q$ oscillates at: the dispersion relation, in rad/s' },
    { tex: 'k,\\ m', text: 'the spring constant (N/m) and the mass of each particle (kg)' },
    { tex: 'n,\\ N', text: 'the mode number and the number of moving masses' },
    { tex: '2\\sqrt{k/m}', text: 'the cutoff: the highest frequency at which the chain can carry a wave' },
    { tex: 'v = a\\sqrt{k/m}', text: 'the long-wave speed, in m/s (the speed of sound, for a crystal)' },
  ],
  why: t`A dispersion relation $\omega(q)$ is a medium’s fingerprint: it decides how fast waves go, whether packets spread, and where a crystal stops transmitting sound.`,
  visual: {
    type: 'wv-chain',
    title: 'The modes of a chain on its dispersion curve',
    lead: t`Above: the chain moving in mode $n$, beads drawn sideways; the dashed sine is the shape they sample. Below: every allowed mode as a dot on $\omega(q)$, the current one gold, the long-wave line $\omega = vq$ dashed.`,
    tasks: [t`Raise $n$ and watch the gold dot climb the curve; mode $N$ sits just below the cutoff, neighbours nearly opposite.`, t`Keep $n = 1$ and raise $N$: the dots crowd toward $q = 0$, where the curve and the straight line agree.`, t`Set $N = 5$: there are exactly five dots — $q$ beyond $\pi/a$ adds nothing new.`],
    params: { N: 8, n: 3, maxN: 30, controls: ['N', 'n'], readouts: ['N', 'n', 'q', 'omega', 'vq', 'ratio', 'cutoff'] },
  },
  example: {
    prompt: t`Model a row of aluminium atoms ($m = 26.98$ u) as a chain with spacing $a = 0.286$ nm and nearest-neighbour spring $k = ${EX.k}$ N/m. Find the long-wave (sound) speed, the highest vibration frequency the row can carry, and the lowest mode of a row of $N = ${EX.N}$ atoms with fixed ends.`,
    steps: [
      { label: 'Rate', text: t`$m = 26.98 \times ${tn(U, 4)} = ${tn(EX.m, 4)}$ kg, so $\sqrt{k/m} = ${tn(EX.w0)}$ rad/s.` },
      { label: 'Sound speed', text: t`For $qa \ll 1$, $\sin(qa/2) \approx qa/2$ and $\omega \approx a\sqrt{k/m}\,q$: $v = (${tn(EX.a)}\ \text{m})(${tn(EX.w0)}\ \text{s}^{-1}) = ${tn(EX.v)}$ m/s. (Measured longitudinal sound in aluminium: about 6400 m/s; the spring was chosen to match.)` },
      { label: 'Cutoff', text: t`$\omega_{\max} = 2\sqrt{k/m} = ${tn(EX.wmax)}$ rad/s, so $f_{\max} = ${tn(EX.fmax / 1e12)}$ THz — far infrared.` },
      { label: 'Lowest mode', text: t`$\omega_1 = 2\sqrt{k/m}\sin\dfrac{\pi}{2(N + 1)} = ${tn(EX.w1)}$ rad/s, $f_1 = ${tn(EX.f1 / 1e9)}$ GHz.` },
      { label: 'Compare a string', text: t`A continuous rod of length $L = (N + 1)a = ${tn(EX.L * 1e9)}$ nm with the same $v$ has fundamental $v/(2L) = ${tn(EX.fs / 1e9, 4)}$ GHz: for $n \ll N$ the chain *is* a string.` },
      { label: 'Honesty', text: t`Real aluminium is three-dimensional, with transverse waves and forces beyond nearest neighbours; neutron scattering finds its phonon frequencies run up to roughly 10 THz. This model gets the scale, not the detail.` },
    ],
    answer: t`$v \approx ${tn(EX.v, 2)}$ m/s, $f_{\max} \approx ${tn(EX.fmax / 1e12, 2)}$ THz, and $f_1 \approx ${tn(EX.f1 / 1e9, 3)}$ GHz for a thousand atoms.`,
    visual: dispPic(t`The chain’s dispersion relation in units of $\sqrt{k/m}$: the long-wave line $\omega = vq$ (dashed) and the cutoff at $qa = \pi$.`),
  },
  practice: [
    num({
      id: 'omega-n', difficulty: 2,
      gen(r) {
        const N = r.pick([4, 5, 6, 9]), n = r.int(2, N - 1), k = r.pick([50, 80, 200]), m = r.pick([0.05, 0.1, 0.2]);
        const w = Math.sqrt(k / m) * wn(N, n);
        return {
          prompt: t`A chain of $N = ${N}$ equal ${m} kg masses joined by springs of ${k} N/m has fixed ends. What is the frequency of mode $n = ${n}$, in Hz?`,
          visual: chainPic({ N, start: 'mode', n, k, m }, `Mode ${n} of ${N} masses between walls, drawn sideways (exaggerated). Dashed: the sine the beads sample.`),
          answer: w / (2 * Math.PI), units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: w, feedback: 'That is ω in rad/s.' }, { value: (Math.sqrt(k / m) * 2 * Math.sin((n * Math.PI) / (2 * N))) / (2 * Math.PI), feedback: t`For fixed ends the walls sit at $j = 0$ and $j = N + 1$, so $q_na = n\pi/(N + 1)$, not $n\pi/N$.` }],
          hints: [t`$q_na = n\pi/(N + 1)$.`, t`$\omega_n = 2\sqrt{k/m}\,\sin\big(n\pi/(2(N + 1))\big)$; then divide by $2\pi$.`],
          teach: t`Mode $n$ of a fixed chain: $\omega_n = 2\sqrt{k/m}\,\sin\frac{n\pi}{2(N + 1)}$.`,
          explain: t`$\omega_{${n}} = 2\sqrt{${k}/${m}}\,\sin\frac{${n}\pi}{${2 * (N + 1)}} = ${tn(w)}$ rad/s, so $f = ${tn(w / (2 * Math.PI))}$ Hz.`,
        };
      },
    }),
    mcq({
      id: 'aliasing', difficulty: 3,
      prompt: t`The sine ansatz $x_j = \sin(jqa)$ works for any $q$, yet a chain of $N$ masses has only $N$ modes. Why?`,
      visual: curvesPic([
        { fn: 'cos(1.1*x)', color: 'accent', width: 2, label: 'q a = 1.1', labelAt: 0.5, labelDy: -10 },
        { fn: `cos(${(2 * Math.PI - 1.1).toFixed(4)}*x)`, color: 'violet', width: 1.2, dash: [5, 4], label: 'q a = 2π − 1.1', labelAt: 6.3, labelDy: 18 },
      ], [0, 7.5], [-1.5, 1.6], t`Two waves sampled at the beads $j = 1, \ldots, 7$ (gold): the long and the short one pass through exactly the same points.`, { xlabel: 'position along the chain (spacings)', ylabel: '', points: [1, 2, 3, 4, 5, 6, 7].map((j) => ({ x: j, y: +Math.cos(1.1 * j).toFixed(4), color: 'gold', r: 5 })) }),
      choices: [
        t`Wavenumbers beyond $\pi/a$ move the beads exactly as some smaller one does: the same modes`,
        t`Larger wavenumbers would need more energy than the springs of the chain can store`,
        t`The fixed ends forbid every wavenumber larger than $\pi/a$ from appearing at all`,
        t`The sine guess stops solving the equations of motion once $qa$ passes $\pi$`,
      ],
      answer: 0,
      why: {
        1: t`Energy is not the limit: the bead displacements of the larger $q$ are literally the same numbers as those of a smaller one.`,
        2: t`The ends allow $q_n = n\pi/((N + 1)a)$ for every $n$; it is just that $n$ and $2(N + 1) - n$ give the same beads (up to sign).`,
        3: t`The algebra never used $qa < \pi$: the guess solves the bulk equations for every $q$, with $\omega = 2\sqrt{k/m}|\sin(qa/2)|$.`,
      },
      hints: [t`Compare $\cos(jqa)$ with $\cos\big(j(2\pi - qa)\big)$ at whole numbers $j$.`, t`$\cos(2\pi j - \theta) = \cos\theta$ for every integer $j$: only the beads are sampled.`],
      teach: t`On a lattice, wavenumbers differing by $2\pi/a$ (or mirrored about $\pi/a$) are the same wave: only $0 < q \le \pi/a$ is new — the first Brillouin zone.`,
      explain: t`The masses only sample the sine at $x = ja$, so a wave too short to be resolved by the spacing looks exactly like a longer one — the same aliasing that makes wagon wheels spin backwards on film. That leaves $N$ distinct fixed-end modes.`,
    }),
    num({
      id: 'cutoff', difficulty: 2,
      gen(r) {
        const [name, A] = r.pick([['carbon', 12.011], ['silicon', 28.086], ['copper', 63.546]]), k = r.pick([15, 20, 30, 45]);
        const f = (2 * Math.sqrt(k / (A * U))) / (2 * Math.PI);
        return {
          prompt: t`In a one-dimensional chain model of ${name} (atomic mass ${A} u) with nearest-neighbour springs of ${k} N/m, what is the highest frequency at which the chain can carry a vibration, in THz?`,
          visual: dispPic('The chain’s dispersion relation in units of √(k/m). The frequency asked for is where the curve flattens out.'),
          answer: f / 1e12, units: 'THz', tol: { rel: 0.01 },
          errors: [{ value: (2 * Math.sqrt(k / (A * U))) / 1e12, feedback: 'That is ω in rad/s (×10⁻¹²). Divide by 2π for the frequency.' }, { value: f / 2e12, feedback: t`The top of the curve is at $2\sqrt{k/m}$, not $\sqrt{k/m}$.` }],
          hints: [t`$\omega_{\max} = 2\sqrt{k/m}$, reached at $qa = \pi$.`, t`Convert the mass: 1 u $= ${tn(U, 4)}$ kg.`],
          teach: t`The cutoff $\omega_{\max} = 2\sqrt{k/m}$ is set by one mass and one spring: neighbours moving exactly opposite.`,
          explain: t`$m = ${tn(A * U, 4)}$ kg, $\omega_{\max} = 2\sqrt{${k}/m} = ${tn(2 * Math.sqrt(k / (A * U)))}$ rad/s, $f_{\max} = ${tn(f / 1e12)}$ THz.`,
        };
      },
    }),
    {
      type: 'point', id: 'place-mode', difficulty: 2,
      gen(r) {
        const N = r.pick([4, 5, 7]), n = r.int(2, N);
        const x = (n * Math.PI) / (N + 1), y = wn(N, n);
        return {
          prompt: t`Drag the point to where mode $n = ${n}$ of a chain of $N = ${N}$ masses with fixed ends sits on the dispersion curve.`,
          visual: dispPic(`ω in units of √(k/m) against q a. The point is free to move.`, { drag: [{ key: 'p', x: 0.35, y: 0.35, snap: 0.01 }] }),
          answer: { x, y }, tol: { x: 0.08, y: 0.08 },
          instruction: 'Drag the point onto mode n, then check.',
          hints: [t`$q_na = n\pi/(N + 1)$.`, t`Then go up to the curve: $\omega_n/\sqrt{k/m} = 2\sin(q_na/2)$.`],
          teach: t`Every mode is a point on the one curve, at $q_na = n\pi/(N + 1)$.`,
          explain: t`$q_{${n}}a = ${n}\pi/${N + 1} = ${tn(x)}$ rad and $\omega_{${n}} = 2\sin(${tn(x / 2)}) = ${tn(y)}\sqrt{k/m}$.`,
        };
      },
    },
    num({
      id: 'below-line', difficulty: 3,
      gen(r) {
        const N = r.pick([9, 11, 14, 19]), n = r.pick([3, 4, 5, 6]);
        const x = (n * Math.PI) / (2 * (N + 1)), ratio = Math.sin(x) / x;
        return {
          prompt: t`In mode $n = ${n}$ of a fixed chain of $N = ${N}$ masses, what is the ratio $\omega_n/(vq_n)$ of its frequency to the long-wave line’s value, with $v = a\sqrt{k/m}$? Give 3 significant figures.`,
          visual: chainPic({ N, start: 'mode', n }, `Mode ${n} of ${N} beads; the dashed sine is the continuous string shape it samples.`),
          answer: ratio, tol: { rel: 0.003 },
          errors: [{ value: Math.sin(2 * x) / (2 * x), feedback: t`The sine’s argument is $qa/2$, not $qa$.` }],
          hints: [t`$\dfrac{\omega_n}{vq_n} = \dfrac{2\sin(q_na/2)}{q_na}$.`, t`With $u = q_na/2 = n\pi/(2(N + 1))$ it is $\sin u/u$.`],
          teach: t`The chain lags the straight line by the factor $\sin u/u$, $u = qa/2$: about $1 - u^2/6$ for long waves.`,
          explain: t`$u = ${n}\pi/${2 * (N + 1)} = ${tn(x, 4)}$, so $\sin u/u = ${tn(ratio, 4)}$: the mode is $${tn((1 - ratio) * 100, 2)}\%$ below $vq$. Dispersion: shorter waves on a chain are slower.`,
        };
      },
    }),
    mcq({
      id: 'above-cutoff', difficulty: 3,
      prompt: t`One end of a long chain is shaken at $\omega = 2.5\sqrt{k/m}$, above the cutoff. What happens along the chain?`,
      visual: dispPic('The dispersion curve, with the drive frequency (gold) above the cutoff.', { hlines: [{ y: 2, label: 'cutoff', color: 'warn' }, { y: 2.25, label: 'drive', color: 'gold' }] }),
      choices: [
        'The motion dies away exponentially within a few masses of the shaken end',
        'A wave travels along the chain with a wavelength shorter than two spacings',
        'A wave travels along faster than the long-wave speed v, with the same shape',
        'The whole chain resonates, its amplitude growing steadily without any limit',
      ],
      answer: 0,
      why: {
        1: t`Wavelengths shorter than $2a$ are not new waves on a lattice (aliasing): no real $q$ gives $\omega > 2\sqrt{k/m}$.`,
        2: 'No real wavenumber has that frequency, so nothing propagates at all, fast or slow.',
        3: 'There is no mode at that frequency to resonate with: all modes lie below the cutoff.',
      },
      hints: [t`Solve $2|\sin(qa/2)| = 2.5$ for real $q$. Can you?`, t`Allow $qa = \pi + i\kappa a$: then $|\sin(qa/2)| = \cosh(\kappa a/2)$ can exceed 1, and $e^{iqja}$ shrinks by $e^{-\kappa a}$ per mass.`],
      teach: 'Above the cutoff the wavenumber becomes complex: neighbours alternate in sign while the amplitude decays exponentially — the chain filters out high frequencies.',
      explain: t`With $qa = \pi + i\kappa a$, $\cosh(\kappa a/2) = 1.25$ gives $\kappa a = ${tn(2 * Math.acosh(1.25), 3)}$: each mass moves $e^{-${tn(2 * Math.acosh(1.25), 3)}} \approx ${tn(Math.exp(-2 * Math.acosh(1.25)), 2)}$ times as much as the one before, alternating in sign. A crystal likewise cannot carry phonons above its top frequency.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nanowire', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([200, 500, 800]), k = r.pick([30, 45]), A = 28.086, a = 0.235e-9;
        const w = 2 * Math.sqrt(k / (A * U)) * Math.sin(Math.PI / (2 * (N + 1)));
        return {
          prompt: t`A chain of $N = ${N}$ silicon atoms (28.086 u), spacing 0.235 nm and springs of ${k} N/m, is clamped at both ends — a crude model of a nanowire resonator in a MEMS sensor. What is the frequency of its lowest lengthwise mode, in GHz?`,
          visual: chainPic({ N: 24, start: 'mode', n: 1, view: 'longitudinal' }, 'The lowest lengthwise mode of a clamped chain (24 atoms drawn; the real wire has hundreds). Displacements exaggerated.'),
          answer: w / (2 * Math.PI) / 1e9, units: 'GHz', tol: { rel: 0.01 },
          errors: [{ value: w / 1e9, feedback: 'That is ω (in units of 10⁹ rad/s).' }, { value: (2 * Math.sqrt(k / (A * U))) / (2 * Math.PI) / 1e9, feedback: 'That is the cutoff — the highest mode, not the lowest.' }],
          hints: [t`$\omega_1 = 2\sqrt{k/m}\,\sin\frac{\pi}{2(N + 1)}$, and for large $N$ this is very close to $v\pi/L$.`, t`$m = 28.086 \times ${tn(U, 4)}$ kg.`],
          teach: t`The lowest mode of a long chain matches a string’s: $\omega_1 \approx \pi v/L$ with $v = a\sqrt{k/m}$ and $L = (N + 1)a$.`,
          explain: t`$\sqrt{k/m} = ${tn(Math.sqrt(k / (A * U)))}$ rad/s, $\omega_1 = ${tn(w)}$ rad/s, so $f_1 = ${tn(w / (2 * Math.PI) / 1e9)}$ GHz.`,
        };
      },
    }),
    num({
      id: 'cp-tether-mode', difficulty: 2,
      gen(r) {
        const N = r.pick([5, 6, 8]), n = r.int(2, 4), T = r.pick([30, 50]), a = r.pick([40, 60]), m = r.pick([8, 12]);
        const w = Math.sqrt(T / a / m) * wn(N, n);
        return {
          prompt: t`${N} identical ${m} kg satellites are strung on a tether at tension ${T} N, ${a} m apart, between two massive end bodies treated as fixed. What is the period of sideways mode $n = ${n}$, in s?`,
          visual: chainPic({ N, start: 'pluck', pluck: 2 }, `${N} satellites as beads on a tether, one displaced sideways (exaggerated).`),
          answer: (2 * Math.PI) / w, units: 's', tol: { rel: 0.01 },
          errors: [{ value: w, feedback: 'That is ω in rad/s; the period is 2π/ω.' }],
          hints: [t`$k = T/a$ and $\omega_n = 2\sqrt{k/m}\,\sin\frac{n\pi}{2(N + 1)}$.`, t`Period $= 2\pi/\omega_n$.`],
          teach: 'The same dispersion relation holds for beads on a string, with k = T/a.',
          explain: t`$\sqrt{k/m} = \sqrt{${T}/(${a} \times ${m})} = ${tn(Math.sqrt(T / a / m))}$ rad/s, $\omega_{${n}} = ${tn(w)}$ rad/s, period $${tn((2 * Math.PI) / w)}$ s.`,
        };
      },
    }),
    mcq({
      id: 'cp-ring', difficulty: 2,
      prompt: t`Six identical satellites are joined into a closed **ring** by equal tether segments — no ends at all. Which statement about its modes is right?`,
      visual: chainPic({ N: 6, bc: 'periodic', start: 'pluck', pluck: 2 }, 'Six beads joined into a ring, drawn opened out: the faded beads are copies showing that the last is joined to the first.'),
      choices: [
        t`The wave must fit the loop a whole number of times, $q = 2\pi p/(Na)$: still discrete, still on $\omega(q)$`,
        t`With no ends, nothing quantizes the wave, so every wavenumber $q$ is an allowed mode of the ring`,
        t`The ring has the fixed-end wavenumbers $q_n = n\pi/((N + 1)a)$, just as if it had been cut open`,
        t`Without ends the ring cannot have a dispersion relation at all, so its frequencies are random`,
      ],
      answer: 0,
      why: {
        1: t`Going once round the ring must bring the pattern back to itself, $e^{iqNa} = 1$: that quantizes $q$ just as walls do.`,
        2: 'The ends do not appear in the ring’s equations — every mass has two neighbours — so the wavenumbers differ from the fixed chain’s.',
        3: t`The dispersion relation comes from each mass’s equation, which is the same as in the chain: $\omega = 2\sqrt{k/m}|\sin(qa/2)|$.`,
      },
      hints: [t`Mass $j + N$ is mass $j$.`, t`So $e^{iq(j + N)a} = e^{iqja}$: what does that require of $qN a$?`],
      teach: t`Periodic boundary conditions quantize too: $q = 2\pi p/(Na)$; boundary conditions choose the $q$s, the bulk sets $\omega(q)$.`,
      explain: t`$e^{iqNa} = 1$ gives $q = 2\pi p/(Na)$. The ring also has a zero-frequency mode ($p = 0$, sliding round as a whole), and its modes with $0 < p < N/2$ come in pairs — waves running either way round.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 4: Linear Chain of Coupled Oscillators', url: 'https://digitalcommons.usu.edu/foundation_wave/19/' },
    { label: 'Georgi, The Physics of Waves, ch. 5 (free from the author)', url: 'https://www.people.fas.harvard.edu/~hgeorgi/new.htm' },
  ],
});

