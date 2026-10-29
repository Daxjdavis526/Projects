// Smoothing and the maximum principle: every Fourier mode of the heat
// equation decays as e^(−Dk²t), so corners and ripples vanish first and the
// solution is smooth for t > 0; no new extremes appear (maximum principle);
// compact data are felt everywhere at once; running backward is hopeless. The
// explicit scheme inherits the maximum principle exactly when r = DΔt/Δx² ≤ ½.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { player, MATERIALS, LI900, SRC } from './_pde.js';

const t = String.raw;
const SS = MATERIALS[1];                    // stainless steel 304
// worked example: a cryogenic tank wall, wetted on the inside and insulated outside
const TW = { L: 0.003 };
TW.tau1 = (4 * TW.L ** 2) / (Math.PI ** 2 * SS.alpha);
TW.tau2 = TW.tau1 / 9;

export default lesson({
  id: 'st-b.B4.3',
  title: 'Smoothing and the maximum principle',
  minutes: 14, difficulty: 3,
  intro: t`Feed the heat equation a ripple and watch: a profile $\sin kx$ keeps its shape and fades,

$$\sin kx \;\longrightarrow\; e^{-Dk^2t}\sin kx$$

at a rate $Dk^2$ that grows with the **square** of the wavenumber. Halve the wavelength and the ripple dies four times faster. Since any profile is a sum of such modes (MATH 2280, lesson DE-8.3), the fine detail — corners, jumps, noise — vanishes first: for any $t > 0$ the solution is perfectly smooth. Three more facts follow from the same equation. **Maximum principle**: on a rod, the largest value over a stretch of time is reached at the start or at an end, never inside — diffusion makes no new hot spots. **Infinite speed**: a pulse confined to a finite region is felt, if only by an astronomically small amount, everywhere at once. **No way back**: run time backward and every mode grows as $e^{+Dk^2t}$; the slightest noise explodes.`,
  symbols: [
    { tex: 'k', text: 'the wavenumber of a ripple (rad/m): $2\\pi/\\lambda$ for wavelength $\\lambda$' },
    { tex: t`Dk^2`, text: 'the decay rate of that ripple (1/s); its e-folding time is $1/(Dk^2)$' },
    { tex: 'D', text: 'the diffusivity (m²/s), the thermal diffusivity $\\alpha$ for heat' },
    { tex: t`e^{-Dk^2t}`, text: 'the factor by which the ripple’s amplitude has shrunk after time $t$' },
  ],
  why: t`The contrast with waves is the deepest fact in this course: hyperbolic equations (waves, Einstein’s equations) carry information at finite speed and keep it; parabolic ones smooth it away. Module B10 turns that contrast into a classification, and Ricci flow — a heat equation for geometry — is how Perelman proved the Poincaré conjecture.`,
  visual: {
    type: 'pde-player',
    title: 'The ripple dies first',
    lead: t`The initial bump carries a fine ripple. Play: the ripple disappears long before the bump has spread much. Watch the readouts — the maximum only ever falls (maximum principle), and the value 8 m away is positive at once (infinite speed).`,
    tasks: [
      'Play the rippled bump: the ripple is gone by about t = 0.3 s, the bump survives for seconds.',
      'Switch to the square pulse: its corners round off instantly; its far-away value (readout) is tiny but never zero once t > 0.',
      'Watch max u in every case: it never rises.',
    ],
    params: { mode: 'heat', profile: 'rough', w: 1.5, D: 0.5, far: 8, x: [-10, 10], tmax: 4, controls: ['profile', 'D', 't'] },
    caption: t`Exact solutions on an infinite line. The ripple has wavenumber $8/w \approx 5.3$ rad/m, so with $D = 0.5\ \text{m}^2/\text{s}$ it e-folds in about 0.07 s. Values below about $10^{-300}$ cannot be represented and show as 0.`,
  },
  example: {
    prompt: t`Liquid nitrogen suddenly wets the inside of a tank wall: ${TW.L * 1000} mm of stainless steel ($\alpha = ${tex(SS.alpha)}\ \text{m}^2/\text{s}$), insulated on the outside. With the inner face held cold and the outer face insulated, the wall’s temperature is a sum of modes $\sin\big((2n - 1)\pi x/2L\big)$. How quickly do the first two modes decay, and what does that say about the shape of the profile?`,
    visual: { type: 'graph', params: { x: [0, 3], y: [-0.05, 1.15], aspect: 'wide', xlabel: 'x from the cold face (mm)', ylabel: 'scaled temperature', curves: [0.002, 0.2, 0.6, 1.2].map((s, i) => ({ fn: `(4/pi)*(${[1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49].map((m) => `sin(${m}*pi*x/6)*e^(-${(m * m * Math.PI ** 2 * SS.alpha * s) / (4 * TW.L ** 2)})/${m}`).join(' + ')})`, color: ['ink3', 'accent', 'violet', 'teal'][i], width: i ? 2.2 : 1.4, label: `${s === 0.002 ? '0' : s} s`, labelAt: i ? 2.6 : 0.6, labelDy: -8 })) },
      caption: t`The scaled temperature $(T - T_c)/(T_0 - T_c)$ through the wall (25-term series) at $t \approx 0$, 0.2, 0.6 and 1.2 s: within a fraction of a second only the smooth first mode is left, and it then decays as a whole. Room-temperature properties; at cryogenic temperatures steel’s specific heat drops and the real process is faster.` },
    steps: [
      { label: 'Decay rates', text: t`Mode $n$ has wavenumber $k_n = (2n - 1)\pi/(2L)$ and decays at $\alpha k_n^2$, an e-folding time $\tau_n = \dfrac{4L^2}{(2n - 1)^2\pi^2\alpha}$.` },
      { label: 'Slowest mode', text: t`$\tau_1 = \dfrac{4(${TW.L})^2}{\pi^2(${tex(SS.alpha)})} = ${tex(TW.tau1)}$ s.` },
      { label: 'Next mode', text: t`$\tau_2 = \tau_1/9 = ${tex(TW.tau2)}$ s, and $\tau_3 = \tau_1/25$: the higher modes are gone almost at once.` },
      { label: 'The shape', text: t`After a few tenths of a second the profile is a single smooth quarter-sine shape, whatever the initial details — the smoothing property. It then fades with $\tau_1 \approx ${tex(TW.tau1)}$ s.` },
      { label: 'Maximum principle', text: t`At no point does the wall get colder than the liquid or warmer than it started: the extremes sit on the initial line and the wetted face.` },
      { label: 'Honesty', text: t`Holding the wetted face at the liquid’s temperature is the idealization. In a real chill-down the liquid first boils away in a vapour film that insulates the wall (the Leidenfrost effect), so cooling is limited by the boiling, and takes far longer than the wall’s own $\tau_1$.` },
    ],
    answer: t`$\tau_1 \approx ${tex(TW.tau1)}$ s and $\tau_2 \approx ${tex(TW.tau2)}$ s: fine structure disappears nine times faster than the overall cooling, so the wall quickly settles into a single smooth profile.`,
  },
  practice: [
    num({
      id: 'ripple-efold', difficulty: 2,
      gen(r) {
        const m = r.pick(MATERIALS), lmm = r.pick([0.5, 1, 2, 5]);
        const k = (2 * Math.PI) / (lmm / 1000), tau = 1 / (m.alpha * k * k);
        return {
          prompt: t`A plate of ${m.name} ($\alpha = ${tex(m.alpha)}\ \text{m}^2/\text{s}$) has a temperature ripple of wavelength ${lmm} mm across its surface. How long does the ripple take to shrink by a factor $e$, in seconds?`,
          visual: { type: 'graph', params: { x: [0, 4], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'x (wavelengths)', ylabel: 'ripple', curves: [{ fn: 'sin(2*pi*x)', color: 'ink3', dash: [5, 4] }, { fn: 'sin(2*pi*x)/e', color: 'accent', width: 2.4 }] }, caption: t`The ripple at the start (dashed) and after one e-folding time (solid): same shape, amplitude divided by $e$.` },
          answer: tau, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (lmm / 1000) ** 2 / m.alpha, feedback: t`Use the wavenumber $k = 2\pi/\lambda$, not $1/\lambda$: $\tau = \lambda^2/(4\pi^2\alpha)$.` }],
          hints: [t`$k = 2\pi/\lambda$, decay rate $\alpha k^2$.`, t`$\tau = 1/(\alpha k^2) = \lambda^2/(4\pi^2\alpha)$.`],
          teach: 'A ripple of wavenumber k decays at rate Dk².',
          explain: t`$k = 2\pi/${tex(lmm / 1000)} = ${tex(k)}$ rad/m, so $\tau = 1/(\alpha k^2) = ${tex(tau)}$ s.`,
        };
      },
    }),
    num({
      id: 'rate-ratio', difficulty: 1,
      gen(r) {
        const f = r.pick([2, 3, 5, 10]);
        return {
          prompt: t`Two ripples on the same rod have wavelengths $\lambda$ and $\lambda/${f}$. How many times faster does the shorter one decay?`,
          visual: { type: 'graph', params: { x: [0, 2], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'x / λ', ylabel: '', curves: [{ fn: 'sin(2*pi*x)', color: 'accent', width: 2 }, { fn: `0.5*sin(${2 * f}*pi*x)`, color: 'violet', width: 1.6 }] }, caption: t`A long ripple and one ${f} times shorter (amplitudes illustrative).` },
          answer: f * f, tol: { rel: 0, abs: 0.05 },
          errors: [{ value: f, feedback: t`The rate is $Dk^2$: it grows as the square of the wavenumber.` }],
          hints: [t`Decay rate $Dk^2$, and $k \propto 1/\lambda$.`],
          teach: 'Decay rates scale as 1/λ²: fine detail dies first.',
          explain: t`$k$ is ${f} times larger, so $Dk^2$ is ${f * f} times larger.`,
        };
      },
    }),
    mcq({
      id: 'hot-spot', difficulty: 2,
      prompt: t`A rod’s ends are held at 20 °C and 80 °C. Initially every interior point is between 30 °C and 60 °C. What is the highest temperature any point of the rod can ever reach?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [0, 100], aspect: 'wide', xlabel: 'x / L', ylabel: 'T (°C)', curves: [{ fn: '45 + 15*sin(3*pi*x)*sin(pi*x)', color: 'ink3', dash: [5, 4], domain: [0.02, 0.98] }, { fn: '20 + 60*x + 18*sin(pi*x)', color: 'accent', width: 2.2 }], points: [{ x: 0, y: 20, label: '20 °C', color: 'teal' }, { x: 1, y: 80, label: '80 °C', color: 'warn', labelDx: -46 }] }, caption: 'The initial profile (dashed) and a later one (solid), illustrative: the solution is bounded by the largest value on the initial line and the two ends.' },
      choices: ['80 °C', '60 °C', '50 °C (the average of the ends)', 'It can exceed 80 °C briefly while heat flows in'],
      answer: 0,
      why: {
        1: 'The hot end supplies heat, so interior points near it rise above 60 °C toward 80 °C.',
        2: 'The average matters only for the eventual straight-line profile; along the way, points near the hot end are hotter.',
        3: 'Diffusion never overshoots: a hot spot above every neighbour and every boundary value would have to be cooling, not warming.',
      },
      hints: ['The maximum principle compares interior values with the initial values and the boundary values.', 'The largest of those is 80 °C.'],
      teach: 'Maximum principle: the solution stays between the extremes of its initial and boundary data.',
      explain: t`$\max u \le \max\{60, 20, 80\} = 80$ °C. Points near the hot end approach 80 °C as time goes on, but never pass it.`,
    }),
    mcq({
      id: 'infinite-speed', difficulty: 2,
      prompt: t`A rod is infinitely long and initially at 0 everywhere except a hot stretch $|x| < 1$ m, with $D = 1\ \text{m}^2/\text{s}$. According to the heat equation, what is the temperature rise at $x = 9$ m after $t = 0.05$ s?`,
      visual: player({ mode: 'heat', profile: 'box', w: 1, D: 1, t: 0.05, tmax: 1, x: [-10, 10], far: 9, readout: true, hide: ['far', 'max', 'area', 'spread'] }, 'The hot stretch a moment after release; the readout would give the value at x = 9 m (hidden).'),
      choices: [t`positive, but about $10^{-140}$ of the initial value`, 'exactly zero: the heat has not had time to get there', 'about half the initial value', 'negative, because the rod cools near the hot region'],
      answer: 0,
      why: {
        1: 'The heat kernel is positive everywhere for t > 0, so every point is warmed at once — the heat equation has no speed limit.',
        2: t`The spread $\sqrt{2Dt} \approx 0.3$ m is tiny compared with 9 m: almost nothing has arrived.`,
        3: 'The maximum principle (in its minimum form) forbids values below the smallest initial value, 0.',
      },
      hints: [t`$u = \tfrac12\big[\operatorname{erfc}\big((x - 1)/\sqrt{4Dt}\big) - \operatorname{erfc}\big((x + 1)/\sqrt{4Dt}\big)\big]$ for $x > 1$.`, t`$(9 - 1)/\sqrt{0.2} \approx 17.9$, and $\operatorname{erfc}(17.9) \approx 10^{-141}$.`],
      teach: 'In the heat equation every disturbance is felt everywhere instantly — but astronomically weakly far away.',
      explain: t`$u \approx \tfrac12\operatorname{erfc}(17.9) \approx 2\times10^{-141}$: positive, not zero. Physically, heat is carried by molecules and phonons at finite speeds, so this is where the model is wrong — harmlessly, since no thermometer could tell $10^{-141}$ from zero.`,
    }),
    num({
      id: 'backward', difficulty: 3,
      gen(r) {
        const n = r.pick([5, 10, 20]), T = r.pick([0.05, 0.1]);
        const g = Math.exp(n * n * T);
        return {
          prompt: t`Try to run $u_t = u_{xx}$ (with $D = 1$) **backward** in time by $${T}$ to recover an earlier profile. A tiny error in the mode $\sin(${n}x)$ of the data is multiplied by what factor?`,
          visual: { type: 'graph', params: { x: [0, 3.1416], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [{ fn: '0.8*sin(x) + 0.3*sin(2*x)', color: 'accent', width: 2.2 }, { fn: `0.8*sin(x) + 0.3*sin(2*x) + 0.04*sin(${n}*x)`, color: 'warn', width: 1.2 }] }, caption: t`Smooth data (blue) and the same data with a tiny high-frequency error (orange): forward in time the error dies, backward it explodes.` },
          answer: g, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(-n * n * T), feedback: 'Backward in time the sign of the exponent flips: the mode grows.' }, { value: Math.exp(n * T), feedback: t`The rate is $k^2$, not $k$: $e^{${n * n}\times${T}}$.` }],
          hints: [t`Forward, $\sin(kx)$ decays as $e^{-k^2t}$. Backward by $T$, it grows as $e^{+k^2T}$.`, t`Here $k = ${n}$ and $T = ${T}$: the factor is $e^{${n * n}\times${T}}$.`],
          teach: 'The backward heat equation amplifies a mode of wavenumber k by $e^{k^2t}$: it is ill-posed.',
          explain: t`$e^{${n}^2\times${T}} = e^{${tex(n * n * T)}} \approx ${tex(g)}$. Higher modes are amplified even more, without bound: no stable recovery of the past is possible (module B12, Hadamard’s criteria).`,
        };
      },
    }),
    code({
      id: 'ftcs', difficulty: 3,
      prompt: t`The explicit (FTCS) scheme for $u_t = D\,u_{xx}$ is
$$u_j^{n+1} = u_j^n + r\big(u_{j+1}^n - 2u_j^n + u_{j-1}^n\big), \qquad r = \frac{D\,\Delta t}{\Delta x^2},$$
with the end values held fixed. Write \`ftcs(u0, r, steps)\`. Run the square pulse given (on $|x| < 1$, $\Delta x = 0.05$, $D = 1$) to $t = 0.5$ with $r = 0.4$ and set \`err\` to the largest difference from the exact solution. Then set \`blowup\` to the largest $|u|$ after 100 steps with $r = 0.6$.`,
      starter: t`import numpy as np
from scipy.special import erf

def ftcs(u0, r, steps):
    u = np.array(u0, dtype=float)
    # each step: update u[1:-1] from its neighbours; keep u[0] and u[-1]
    pass

x = np.linspace(-5, 5, 201)
dx, D = x[1] - x[0], 1.0
u0 = (np.abs(x) < 1).astype(float)

r = 0.4
steps = round(0.5 / (r * dx**2 / D))
t = steps * r * dx**2 / D
exact = 0.5 * (erf((x + 1) / np.sqrt(4 * D * t)) - erf((x - 1) / np.sqrt(4 * D * t)))

err = None       # largest |ftcs(u0, 0.4, steps) - exact|
blowup = None    # largest |u| after 100 steps at r = 0.6
print(steps, err, blowup)
`,
      answer: t`import numpy as np
from scipy.special import erf

def ftcs(u0, r, steps):
    u = np.array(u0, dtype=float)
    for n in range(steps):
        u[1:-1] = u[1:-1] + r * (u[2:] - 2 * u[1:-1] + u[:-2])
    return u

x = np.linspace(-5, 5, 201)
dx, D = x[1] - x[0], 1.0
u0 = (np.abs(x) < 1).astype(float)

r = 0.4
steps = round(0.5 / (r * dx**2 / D))
t = steps * r * dx**2 / D
exact = 0.5 * (erf((x + 1) / np.sqrt(4 * D * t)) - erf((x - 1) / np.sqrt(4 * D * t)))

err = np.max(np.abs(ftcs(u0, 0.4, steps) - exact))
blowup = np.max(np.abs(ftcs(u0, 0.6, 100)))
print(steps, err, blowup)`,
      tests: [
        { name: t`at $r = 0.4$ the scheme matches the exact solution to within 0.02 at $t = 0.5$`, code: 'err is not None and err < 0.02' },
        { name: t`at $r = 0.4$ the solution stays between 0 and 1 (a discrete maximum principle)`, code: '(lambda u4: u4.min() >= -1e-12 and u4.max() <= 1 + 1e-12)(ftcs(u0, 0.4, 500))' },
        { name: t`at $r = \tfrac12$ it is still stable`, code: 'np.max(np.abs(ftcs(u0, 0.5, 400))) <= 1 + 1e-12' },
        { name: t`at $r = 0.6$ it blows up: $|u|$ passes $10^6$ within 100 steps`, code: 'blowup is not None and blowup > 1e6' },
        { name: t`even $r = 0.51$, just over the limit, grows past 10 within 400 steps`, code: 'np.max(np.abs(ftcs(u0, 0.51, 400))) > 10' },
      ],
      hints: ['Loop `steps` times; inside, one NumPy line updates every interior point at once.', '`u[1:-1] = u[1:-1] + r * (u[2:] - 2 * u[1:-1] + u[:-2])` — the right side is computed before u changes.', 'Then `err = np.max(np.abs(ftcs(u0, 0.4, steps) - exact))` and `blowup = np.max(np.abs(ftcs(u0, 0.6, 100)))`.'],
      teach: t`Rewritten, FTCS is $u_j^{n+1} = r\,u_{j-1}^n + (1 - 2r)\,u_j^n + r\,u_{j+1}^n$: a weighted average — and so bounded by its neighbours — exactly when $r \le \tfrac12$.`,
      explain: t`For $r \le \tfrac12$ all three weights are non-negative and sum to 1: each new value lies between its old neighbours, the discrete maximum principle, so nothing can grow. For $r > \tfrac12$ the middle weight is negative; the sawtooth mode $(-1)^j$ is multiplied by $|1 - 4r|$ each step — 1.4 at $r = 0.6$, 1.04 at $r = 0.51$ — and the jumps of the square pulse hand it a seed. That is the stability limit $\Delta t \le \Delta x^2/(2D)$: halving $\Delta x$ forces four times as many steps (module B13).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tank', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([MATERIALS[0], MATERIALS[1], MATERIALS[3]]), Lmm = r.pick([2, 4, 6]);
        const L = Lmm / 1000, tau = (4 * L * L) / (Math.PI ** 2 * m.alpha);
        return {
          prompt: t`A ${Lmm} mm ${m.short} tank wall ($\alpha = ${tex(m.alpha)}\ \text{m}^2/\text{s}$) is chilled from the inside by liquid oxygen and insulated outside. Its slowest temperature mode is $\sin(\pi x/2L)$. What is that mode’s e-folding time, in seconds?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.15], aspect: 'wide', xlabel: 'x / L (from the cold face)', ylabel: 'mode shape', curves: [{ fn: 'sin(pi*x/2)', color: 'accent', width: 2.4 }], points: [{ x: 0, y: 0, label: 'cold face', color: 'teal' }, { x: 1, y: 1, label: 'insulated', color: 'gold', labelDx: -66, labelDy: 14 }] }, caption: 'The slowest mode: zero at the cold face, flat (no heat flow) at the insulated one. Room-temperature properties.' },
          answer: tau, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (L * L) / (Math.PI ** 2 * m.alpha), feedback: t`The wavenumber is $\pi/(2L)$, not $\pi/L$: a quarter-wave fits in the wall.` }, { value: (L * L) / m.alpha, feedback: t`That is the rough scale $L^2/\alpha$; the mode’s exact rate is $\alpha(\pi/2L)^2$.` }],
          hints: [t`Wavenumber $k = \pi/(2L)$; decay rate $\alpha k^2$.`, t`$\tau = 4L^2/(\pi^2\alpha)$ with $L$ in metres.`],
          teach: 'The slowest mode sets how long a body takes to equilibrate: τ = 1/(αk²) for the smallest allowed k.',
          explain: t`$\tau = \dfrac{4(${tex(L)})^2}{\pi^2(${tex(m.alpha)})} = ${tex(tau)}$ s. Every finer mode decays at least 9 times faster.`,
        };
      },
    }),
    mcq({
      id: 'cp-no-hotspot', difficulty: 2,
      prompt: t`A satellite’s aluminium boom has both ends held at 300 K and starts everywhere at or below 300 K. With no internal heating, can its middle ever become hotter than 300 K?`,
      visual: player({ mode: 'heat', profile: 'gauss', A: -1, w: 2, D: 0.5, t: 1, tmax: 4, x: [-8, 8] }, 'A cold dip relaxing (illustrative): it fills in from both sides and never overshoots the surrounding level.'),
      choices: ['No: by the maximum principle it stays at or below 300 K', 'Yes, briefly, as heat from the ends rushes in', 'Yes, if the boom is long enough', 'Only if its thermal diffusivity is high'],
      answer: 0,
      why: {
        1: 'Diffusion moves heat down gradients; it cannot push a point above all its sources.',
        2: 'Length changes how long it takes to warm, not the bound.',
        3: 'α sets the time scale only; the bound is the same for any diffusivity.',
      },
      hints: ['Where are the largest initial and boundary values?'],
      teach: 'Without sources, the heat equation never creates a new maximum.',
      explain: t`The maximum principle: $\max u$ over the rod and all times is the larger of the initial maximum and the boundary values, both 300 K. (Sunlight on the boom would be a source term, and then it could.)`,
    }),
    num({
      id: 'cp-surface-ripple', difficulty: 2, transfer: true,
      gen(r) {
        const lcm = r.pick([1, 2, 5]);
        const k = (2 * Math.PI) / (lcm / 100), tau = 1 / (LI900.alpha * k * k);
        return {
          prompt: t`During entry, uneven heating leaves a temperature ripple of wavelength ${lcm} cm along the face of an LI-900 tile ($\alpha \approx ${tex(LI900.alpha)}\ \text{m}^2/\text{s}$). Ignoring further heating, how long does conduction take to shrink the ripple by a factor $e$, in seconds?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'x (wavelengths)', ylabel: 'ripple', curves: [{ fn: 'sin(2*pi*x)', color: 'warn', width: 2.2 }] }, caption: 'A temperature ripple along the tile face (amplitude illustrative). Radiation from the hot face, ignored here, also smooths it.' },
          answer: tau, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (lcm / 100) ** 2 / LI900.alpha, feedback: t`Use $k = 2\pi/\lambda$: $\tau = \lambda^2/(4\pi^2\alpha)$.` }],
          hints: [t`$\tau = 1/(\alpha k^2)$ with $k = 2\pi/\lambda$.`],
          teach: 'Smoothing time of a ripple: λ²/(4π²α).',
          explain: t`$\tau = \dfrac{(${tex(lcm / 100)})^2}{4\pi^2(${tex(LI900.alpha)})} = ${tex(tau)}$ s. An insulating tile is slow to even out hot spots — in copper the same ripple would vanish ${Math.round(MATERIALS[2].alpha / LI900.alpha)} times faster.`,
        };
      },
    }),
  ],
  sources: [SRC.strauss, SRC.evans, SRC.incropera, SRC.tpsx],
});
