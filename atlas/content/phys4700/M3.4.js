// The free particle and wave packets (Griffiths & Schroeter §2.4). Derived:
// plane waves e^{i(kx − ħk²t/2m)} separate but cannot be normalized; a
// normalizable state is a superposition over k with weight φ(k), the Fourier
// transform of Ψ(x, 0); |φ(k)|² never changes; a Gaussian packet's width grows
// as σ(t) = σ₀√(1 + (t/τ)²) with the dispersion time τ = 2mσ₀²/ħ, tending to
// σ_v t with σ_v = ħ/2mσ₀. phys2710.MP6.2 built packets and their two
// velocities; this lesson follows a packet in time. Constants CODATA 2022.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, ME, MP, QE, M_RB87 } from './_qm.js';
import { r6 } from './_wells.js';

const t = String.raw;
const tau = (m, s) => (2 * m * s * s) / HBAR;           // s, the dispersion time for width s (m)

/** A Gaussian |Ψ|² of width s₀ at times given as multiples of τ, on axes in units of σ₀. */
function spreadPic(times, caption, { xmax = 6, labels = true } = {}) {
  const cols = ['accent', 'violet', 'teal', 'warn'];
  return {
    type: 'graph',
    params: {
      x: [-xmax, xmax], y: [0, 0.45], aspect: 'wide', xlabel: 'x / σ₀', ylabel: '|Ψ|² (per σ₀)', axesAt: 'edge', xticks: 6, yticks: 3,
      curves: times.map((T, j) => {
        const s = Math.sqrt(1 + T * T);
        return { fn: `exp(-x^2/(2*${r6(s * s)}))/(${r6(s)}*sqrt(2*pi))`, color: cols[j % 4], width: 2.4, ...(labels ? { label: T === 0 ? 't = 0' : `t = ${T === 1 ? '' : T}τ`, labelAt: r6(0.9 * s + 0.2), labelDy: -8 } : {}) };
      }),
    },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M3.4',
  title: 'The free particle and wave packets',
  minutes: 17, difficulty: 3,
  intro: t`With $V = 0$, separation of variables gives plane waves $e^{i(kx - \hbar k^2t/2m)}$ — but no plane wave can be normalized, so none is a state a particle can be in. A real free particle is a **wave packet**, a superposition of plane waves with a weight $\phi(k)$ found from the starting state by a Fourier transform. Each component keeps its own phase, $|\phi(k)|^2$ never changes, and because faster components outrun slower ones, the packet **spreads**. For a Gaussian of starting width $\sigma_0$:

$$\sigma(t) = \sigma_0\sqrt{1 + \Big(\frac{t}{\tau}\Big)^2}, \qquad \tau = \frac{2m\sigma_0^2}{\hbar}$$`,
  symbols: [
    { tex: '\\sigma(t)', text: t`the packet’s width: the standard deviation of $|\Psi|^2$ at time $t$, in m` },
    { tex: '\\sigma_0', text: 'the width at t = 0, when the packet is narrowest (a minimum-uncertainty Gaussian)' },
    { tex: '\\tau', text: t`the **dispersion time**, in s: after $\tau$ the width has grown by $\sqrt2$; long after, it grows linearly` },
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: '\\phi(k)', text: t`the momentum-space weight: $\Psi(x, 0) = \tfrac{1}{\sqrt{2\pi}}\int\phi(k)e^{ikx}dk$; $|\phi(k)|^2dk$ is the probability that $\hbar k$ lies in $dk$` },
    { tex: 'k', text: t`a component’s wavenumber, in m⁻¹; its momentum is $\hbar k$ and its speed $\hbar k/m$` },
  ],
  why: 'Every beam in an electron microscope, every atom cloud in an interferometer and every neutron in a scattering experiment is a free packet; τ says when quantum spreading matters and when it never will.',
  visual: {
    type: 'mp-packet',
    title: 'A packet that spreads',
    lead: t`A packet built from plane waves. The gold dot rides the envelope (the group velocity, the particle’s speed); the violet dot rides one crest (the phase velocity). The lower panel is the dispersion relation $\omega(k)$: for a free particle $\omega = \hbar k^2/2m$ curves upward, so different components travel at different speeds.`,
    tasks: [
      'With the free-particle relation, watch the envelope widen and its peak sink as it travels.',
      'Switch to “none: ω = ck”: every component moves at one speed and the shape never changes. Spreading needs dispersion.',
      'Raise the spread of wavenumbers Δk: the packet starts narrower but spreads faster — τ ∝ σ₀².',
    ],
    params: { view: 'build', disp: 'free', sk: 0.8, N: 31 },
    caption: 'A sum of 31 plane waves in dimensionless units (ħ = m = 1). The finite sum repeats far away; only the central packet is drawn.',
  },
  example: {
    prompt: t`An electron is prepared in $\Psi(x, 0) = (2\pi\sigma_0^2)^{-1/4}e^{-x^2/4\sigma_0^2}e^{ik_0x}$ with $\sigma_0 = 1$ nm. Find $\phi(k)$, derive how the width grows, and find $\tau$.`,
    visual: spreadPic([0, 1, 3], t`$|\Psi|^2$ at $t = 0$, $\tau$ and $3\tau$, centred on the moving packet. The area stays 1; the width grows as $\sqrt{1 + (t/\tau)^2}$. Exact.`),
    steps: [
      { label: 'Plane waves first', text: t`With $V = 0$, $\hat H\psi = E\psi$ is solved by $e^{ikx}$ with $E = \hbar^2k^2/2m$. Attaching the phase: $e^{i(kx - \hbar k^2t/2m)}$. Its $|\Psi|^2 = 1$ everywhere, so $\int|\Psi|^2dx$ diverges: not a physical state.` },
      { label: 'Fourier transform', text: t`$\phi(k) = \tfrac{1}{\sqrt{2\pi}}\int\Psi(x, 0)e^{-ikx}dx = \big(2\sigma_0^2/\pi\big)^{1/4}e^{-\sigma_0^2(k - k_0)^2}$, a Gaussian in $k$ with spread $\sigma_k = 1/2\sigma_0$ — the uncertainty principle at its minimum.` },
      { label: 'Evolve each component', text: t`$\Psi(x, t) = \tfrac{1}{\sqrt{2\pi}}\int\phi(k)\,e^{i(kx - \hbar k^2t/2m)}dk$. The extra phase is quadratic in $k$, so the integral is still Gaussian; it replaces $\sigma_0^2$ by the complex $\sigma_0^2(1 + it/\tau)$ with $\tau = 2m\sigma_0^2/\hbar$.` },
      { label: 'Read off the width', text: t`$|\Psi|^2$ is a Gaussian centred at $\hbar k_0t/m$ with $\sigma(t)^2 = \sigma_0^2\big(1 + t^2/\tau^2\big)$. The centre moves at the group velocity; $|\phi(k)|^2$ has not changed at all.` },
      { label: 'The number', text: t`$\tau = \dfrac{2(${tex(ME, 5)})(10^{-9})^2}{${tex(HBAR, 5)}} = ${fmt(tau(ME, 1e-9) * 1e15, 3)}$ fs. After a picosecond the electron is $\sigma \approx \sigma_0\,t/\tau = ${fmt(1e-12 / tau(ME, 1e-9), 3)}$ nm wide.` },
      { label: 'Sense check', text: t`Late on, $\sigma \approx \tfrac{\hbar}{2m\sigma_0}t = \sigma_vt$: the spread of velocities $\sigma_p/m$ times the time, exactly what a classical cloud with that velocity spread would do. Nothing is lost: $\langle H\rangle$ and $|\phi(k)|^2$ are constant.` },
    ],
    answer: t`$\phi(k) = (2\sigma_0^2/\pi)^{1/4}e^{-\sigma_0^2(k - k_0)^2}$; $\sigma(t) = \sigma_0\sqrt{1 + (t/\tau)^2}$ with $\tau = 2m\sigma_0^2/\hbar = ${fmt(tau(ME, 1e-9) * 1e15, 3)}$ fs.`,
  },
  practice: [
    mcq({
      id: 'plane-not-state', difficulty: 1,
      prompt: t`The free Schrödinger equation is solved by $\Psi = Ae^{i(kx - \hbar k^2t/2m)}$. Why can this not be the state of a real free electron?`,
      visual: { type: 'graph', params: { x: [-10, 10], y: [-1.3, 1.6], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: 'cos(2*x)', color: 'accent', width: 2, label: 'Re Ψ', labelAt: -9.6, labelDy: -14 }, { fn: '1.3', color: 'gold', width: 2.6, label: '|Ψ|² = |A|², everywhere', labelAt: 2, labelDy: -10 }] }, caption: 'A plane wave’s real part and its density, which is the same at every x, out to infinity in both directions.' },
      choices: [
        t`$\int|\Psi|^2dx = |A|^2\int dx$ diverges, so no choice of $A$ normalizes it`,
        t`Its energy $\hbar^2k^2/2m$ is not quantized`,
        t`It is complex, and a wave function must be real`,
        t`Its phase velocity is half the particle’s speed, which is unphysical`,
      ],
      answer: 0,
      why: {
        1: 'Unquantized energy is fine: a free particle can have any energy. The problem is normalization.',
        2: t`Wave functions are generally complex; a real one carries no current.`,
        3: t`The phase velocity has no direct physical meaning; the packet, which is what you detect, moves at the group velocity.`,
      },
      hints: ['Try to normalize it: what is ∫|Ψ|² dx over all x?'],
      teach: 'A plane wave is not normalizable; physical free states are packets — superpositions of plane waves.',
      explain: t`$|\Psi|^2 = |A|^2$ is the same everywhere, so the total probability is infinite. Plane waves remain enormously useful as a **basis** (the next lessons call them the continuous spectrum of $\hat p$), but a particle is always in a superposition of them.`,
    }),
    num({
      id: 'tau', difficulty: 2,
      gen(r) {
        const P = r.pick([
          { name: 'An electron', m: ME, s: r.pick([0.1, 0.5, 1, 2]), su: 'nm', sf: 1e-9, unit: 'fs', uf: 1e15 },
          { name: 'A proton', m: MP, s: r.pick([0.1, 0.2, 1]), su: 'nm', sf: 1e-9, unit: 'ps', uf: 1e12 },
          { name: 'A rubidium-87 atom', m: M_RB87, s: r.pick([0.5, 1, 2, 5]), su: '\\mu\\text{m}', sf: 1e-6, unit: 'ms', uf: 1e3 },
        ]);
        const ans = tau(P.m, P.s * P.sf) * P.uf;
        return {
          prompt: t`${P.name} (mass $${tex(P.m, 5)}$ kg) is prepared as a minimum-uncertainty Gaussian packet of width $\sigma_0 = ${P.s}\ ${P.su}$. What is its dispersion time $\tau = 2m\sigma_0^2/\hbar$, in ${P.unit}?`,
          visual: spreadPic([0, 1], t`The packet at $t = 0$ and at $t = \tau$, when its width has grown by $\sqrt2$. Exact for a free Gaussian.`),
          answer: ans, units: P.unit, tol: { rel: 0.005 },
          errors: [{ value: ans / 2, feedback: t`$\tau = 2m\sigma_0^2/\hbar$: keep the 2.` }, { value: ans / (2 * Math.PI), feedback: t`Use $\hbar$, not $h$, in $\tau$.` }],
          hints: [t`Convert $\sigma_0$ to metres before squaring.`, t`$\tau = 2m\sigma_0^2/\hbar$ with $\hbar = ${tex(HBAR, 5)}$ J s.`],
          teach: t`The dispersion time $\tau = 2m\sigma_0^2/\hbar$ grows with mass and with the square of the starting width.`,
          explain: t`$\tau = 2(${tex(P.m, 4)})(${tex(P.s * P.sf, 2)})^2/${tex(HBAR, 4)} = ${fmt(ans, 3)}$ ${P.unit}. Halve the width and τ falls fourfold: a sharper packet spreads sooner.`,
        };
      },
    }),
    num({
      id: 'width-later', difficulty: 2,
      gen(r) {
        const s0 = r.pick([0.5, 1, 2]), tf = r.pick([5, 10, 30, 100]);
        const T = tau(ME, s0 * 1e-9) * 1e15, ans = s0 * Math.sqrt(1 + (tf / T) ** 2);
        return {
          prompt: t`An electron starts as a Gaussian packet with $\sigma_0 = ${s0}$ nm, for which $\tau = ${fmt(T, 4)}$ fs. How wide is it $${tf}$ fs later, in nm?`,
          visual: spreadPic([0, r6(tf / T)].map((v) => +v.toFixed(2)), t`The packet now and later, centred on its moving peak. Axes in units of $\sigma_0$.`, { xmax: Math.max(6, 3.2 * Math.sqrt(1 + (tf / T) ** 2)) }),
          answer: ans, units: 'nm', tol: { rel: 0.005 },
          errors: [
            { value: s0 * (1 + tf / T), feedback: t`The width does not add linearly: $\sigma = \sigma_0\sqrt{1 + (t/\tau)^2}$.` },
            { value: s0 * tf / T, feedback: t`$\sigma_0t/\tau$ is the late-time limit; at this $t/\tau$ use the full $\sigma_0\sqrt{1 + (t/\tau)^2}$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$t/\tau = ${tf}/${fmt(T, 4)} = ${fmt(tf / T, 4)}$.`, t`$\sigma = \sigma_0\sqrt{1 + (t/\tau)^2}$.`],
          teach: t`A Gaussian’s width grows as $\sigma_0\sqrt{1 + (t/\tau)^2}$: slowly at first, then linearly.`,
          explain: t`$\sigma = ${s0}\sqrt{1 + ${fmt((tf / T) ** 2, 4)}} = ${fmt(ans, 4)}$ nm.`,
        };
      },
    }),
    mcq({
      id: 'phi-fixed', difficulty: 2,
      prompt: t`As a free packet spreads in position, what happens to its momentum distribution $|\phi(k)|^2$?`,
      visual: spreadPic([0, 2], t`Position densities at $t = 0$ and $t = 2\tau$.`),
      choices: [
        t`Nothing: each component only gains a phase $e^{-i\hbar k^2t/2m}$, so $|\phi(k)|^2$ is constant`,
        t`It narrows, so that $\sigma_x\sigma_p$ stays at $\hbar/2$`,
        t`It widens along with the position distribution`,
        t`It shifts to lower $k$ as the packet loses energy by spreading`,
      ],
      answer: 0,
      why: {
        1: t`$\sigma_x\sigma_p$ is not fixed at $\hbar/2$; it grows. The packet develops the chirp met in [the uncertainty principle](#/lesson/phys4700.M2.4).`,
        2: t`Momentum is conserved for a free particle: no force acts, so its distribution cannot change.`,
        3: t`$\langle H\rangle = \int|\phi|^2\hbar^2k^2/2m\,dk$ is constant; spreading costs no energy.`,
      },
      hints: ['How does each plane-wave component evolve in time?', 'Does a free particle feel any force that could change its momentum?'],
      teach: 'Free evolution multiplies each momentum component by a phase, so the momentum distribution never changes while the position distribution spreads.',
      explain: t`$\phi(k, t) = \phi(k)e^{-i\hbar k^2t/2m}$, whose modulus does not depend on $t$. The spreading is the different speeds $\hbar k/m$ of components already present, sorting themselves out in space.`,
    }),
    num({
      id: 'best-width', difficulty: 3,
      gen(r) {
        const T = r.pick([1, 10, 100, 1000]);       // ns
        const s0 = Math.sqrt((HBAR * T * 1e-9) / (2 * ME)), ans = Math.SQRT2 * s0 * 1e6;
        return {
          prompt: t`You want an electron packet to be as narrow as possible when it arrives at a target ${T} ns after launch. Start too narrow and it spreads fast; start too wide and it is wide already. Minimizing $\sigma(T) = \sigma_0\sqrt{1 + (\hbar T/2m\sigma_0^2)^2}$ over $\sigma_0$ gives $\sigma_0 = \sqrt{\hbar T/2m}$. What is the smallest possible arrival width, in μm?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 3.2], aspect: 'wide', xlabel: 'starting width σ₀ (units of √(ħT/2m))', ylabel: 'width at arrival (same units)', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: 'sqrt(x^2 + 1/x^2)', color: 'accent', width: 2.4, domain: [0.3, 3] }] }, caption: 'Arrival width against starting width: too narrow and too wide both lose. The minimum is the question.' },
          answer: ans, units: 'μm', tol: { rel: 0.005 },
          errors: [{ value: s0 * 1e6, feedback: t`That is the best *starting* width. At arrival $t = \tau$, so the width has grown by $\sqrt2$.` }],
          hints: [t`At the optimum, $\tau = 2m\sigma_0^2/\hbar$ equals $T$.`, t`So $\sigma(T) = \sigma_0\sqrt2 = \sqrt{\hbar T/m}$.`],
          teach: t`For a fixed flight time $T$, the narrowest arrival is $\sqrt{\hbar T/m}$, reached by starting at $\sqrt{\hbar T/2m}$ so that $\tau = T$.`,
          explain: t`$\sigma_{\min} = \sqrt{\hbar T/m} = \sqrt{${tex(HBAR, 4)}\times${tex(T * 1e-9, 2)}/${tex(ME, 4)}} = ${fmt(ans, 3)}\ \mu\text{m}$. This “standard quantum limit” on tracking a free mass is the same trade-off that limits position measurements of LIGO’s free-falling mirrors.`,
        };
      },
    }),
    code({
      id: 'spread-code', difficulty: 3,
      prompt: t`Evolve a free packet exactly with the FFT ($\hbar = m = 1$). Write \`evolve(psi, t)\`: transform with \`np.fft.fft\`, multiply each component by $e^{-ik^2t/2}$ (with \`k = 2*np.pi*np.fft.fftfreq(len(x), dx)\`), and transform back with \`np.fft.ifft\`. Write \`width(psi)\`, the standard deviation of $|\psi|^2$ (normalize inside). The starting packet has $\sigma_0 = 1$ and $k_0 = 2$.`,
      starter: t`import numpy as np

x = np.linspace(-200, 200, 8192, endpoint=False)
dx = x[1] - x[0]
psi0 = np.exp(-x**2 / 4) * np.exp(2j * x)

def evolve(psi, t):
    pass

def width(psi):
    pass

for t in [0, 2, 5, 10]:
    print(t, width(evolve(psi0, t)), np.sqrt(1 + (t / 2)**2))
`,
      answer: t`import numpy as np

x = np.linspace(-200, 200, 8192, endpoint=False)
dx = x[1] - x[0]
psi0 = np.exp(-x**2 / 4) * np.exp(2j * x)

def evolve(psi, t):
    k = 2 * np.pi * np.fft.fftfreq(len(x), dx)
    return np.fft.ifft(np.fft.fft(psi) * np.exp(-1j * k**2 * t / 2))

def width(psi):
    rho = np.abs(psi)**2
    rho = rho / np.trapezoid(rho, x)
    m = np.trapezoid(x * rho, x)
    return np.sqrt(np.trapezoid((x - m)**2 * rho, x))

for t in [0, 2, 5, 10]:
    print(t, width(evolve(psi0, t)), np.sqrt(1 + (t / 2)**2))`,
      tests: [
        { name: 'the starting width is 1', code: 'abs(width(psi0) - 1) < 1e-6' },
        { name: t`at $t = 5$ the width is $\sqrt{1 + (5/2)^2}$, since $\tau = 2\sigma_0^2 = 2$`, code: 'abs(width(evolve(psi0, 5)) - np.sqrt(1 + 6.25)) < 1e-4' },
        { name: 'the norm is unchanged', code: 'abs(np.sum(np.abs(evolve(psi0, 10))**2) / np.sum(np.abs(psi0)**2) - 1) < 1e-10' },
        { name: t`the centre moves at $k_0 = 2$: at $t = 10$ it is at $x = 20$`, code: 'abs(np.trapezoid(x * np.abs(evolve(psi0, 10))**2, x) / np.trapezoid(np.abs(evolve(psi0, 10))**2, x) - 20) < 1e-4' },
        { name: t`$|\phi(k)|^2$ does not change`, code: 'np.allclose(np.abs(np.fft.fft(evolve(psi0, 7))), np.abs(np.fft.fft(psi0)))' },
      ],
      hints: ['`np.fft.fft(psi)` gives the components on the k grid; multiply by the phases elementwise; `np.fft.ifft` returns to x.', 'width: ρ = |ψ|², normalized by `np.trapezoid(rho, x)`; then the mean and the second moment about it.'],
      teach: 'Free evolution is diagonal in momentum: Fourier transform, multiply by phases, transform back.',
      explain: t`The FFT method is exact for $V = 0$ (up to the grid). Widths $1, 1.414, 2.693, 5.099$ at $t = 0, 2, 5, 10$ match $\sqrt{1 + (t/2)^2}$. The same idea, alternating with steps in $V$, is the split-operator method used to simulate packets in any potential.`,
    }),
    mcq({
      id: 'why-spread', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “A free electron packet spreads because it gradually loses energy, and its probability leaks away into the tails.” What is wrong?`,
      visual: spreadPic([0, 3], t`The same packet at $t = 0$ and $t = 3\tau$. Both curves enclose an area of exactly 1.`),
      choices: [
        t`Neither happens: $\langle H\rangle$ and $\int|\Psi|^2dx$ are both constant; the packet spreads because components with different $k$ travel at different speeds $\hbar k/m$`,
        t`It is right about energy, but probability is conserved`,
        t`It is right about probability, but the energy grows as the packet spreads`,
        'Nothing; spreading is how a free particle dissipates energy into the vacuum',
      ],
      answer: 0,
      why: {
        1: t`$\langle H\rangle = \int|\phi(k)|^2\tfrac{\hbar^2k^2}{2m}dk$ depends only on $|\phi|^2$, which never changes.`,
        2: t`Normalization is conserved by the Schrödinger equation, and the total area under $|\Psi|^2$ stays 1.`,
        3: 'There is nothing to dissipate into: the free Schrödinger equation has no loss term.',
      },
      hints: ['Which quantities does the Schrödinger equation conserve for a free particle?', 'Look at |φ(k)|²: what does it say about energy?'],
      teach: 'Spreading is dispersion — components sorting by speed — with energy and probability exactly conserved.',
      explain: t`The packet holds a range of momenta from the start; the faster ones get ahead and the slower ones fall behind, just as runners of different speeds spread out. Total probability, $\langle H\rangle$ and $\langle p\rangle$ all stay fixed.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-double', difficulty: 2,
      gen(r) {
        const s0 = r.pick([0.2, 0.5, 1, 2]);
        const T = tau(ME, s0 * 1e-9) * 1e15, ans = Math.sqrt(3) * T;
        return {
          prompt: t`An electron packet starts with $\sigma_0 = ${s0}$ nm. How long, in fs, until its width has doubled?`,
          visual: spreadPic([0, 1.73], t`The packet at the start and at the moment its width has doubled.`),
          answer: ans, units: 'fs', tol: { rel: 0.005 },
          errors: [{ value: T, feedback: t`At $t = \tau$ the width is $\sqrt2\,\sigma_0$, not $2\sigma_0$. Solve $\sqrt{1 + (t/\tau)^2} = 2$.` }, { value: 2 * T, feedback: t`$\sqrt{1 + 4} \ne 2$: solve $1 + (t/\tau)^2 = 4$.` }],
          hints: [t`Set $\sqrt{1 + (t/\tau)^2} = 2$: then $t = \sqrt3\,\tau$.`, t`$\tau = 2m_e\sigma_0^2/\hbar = ${fmt(T, 4)}$ fs.`],
          teach: t`A Gaussian doubles its width at $t = \sqrt3\,\tau$.`,
          explain: t`$\tau = ${fmt(T, 4)}$ fs, so the width doubles after $\sqrt3\,\tau = ${fmt(ans, 4)}$ fs.`,
        };
      },
    }),
    mcq({
      id: 'cp-baseball', difficulty: 2,
      prompt: t`Why does nobody see a thrown baseball (0.145 kg) spread like a wave packet? Suppose its centre of mass were localized to $\sigma_0 = 1\ \mu\text{m}$.`,
      visual: spreadPic([0, 0.001], 'A packet one-thousandth of a dispersion time after preparation: the two curves cannot be told apart.', { labels: false }),
      choices: [
        t`Its $\tau = 2m\sigma_0^2/\hbar \approx ${tex(tau(0.145, 1e-6), 2)}$ s, about $10^{14}$ years: it never spreads noticeably`,
        'Quantum mechanics does not apply to objects larger than atoms',
        'Air resistance continually re-localizes it',
        'It does spread, by about a metre per second, but too fast to see',
      ],
      answer: 0,
      why: {
        1: 'No size limit for quantum mechanics has ever been found; the equations simply predict negligible spreading for large masses.',
        2: 'Interactions with air do destroy interference (decoherence), but even in vacuum the spreading would be negligible.',
        3: t`Its velocity spread is $\hbar/2m\sigma_0 \approx 4\times10^{-28}$ m/s, not a metre per second.`,
      },
      hints: [t`Compute $\tau$ with $m = 0.145$ kg and $\sigma_0 = 10^{-6}$ m.`],
      teach: 'The dispersion time grows with mass; for everyday objects it exceeds the age of the universe.',
      explain: t`$\tau = 2(0.145)(10^{-12})/(${tex(HBAR, 3)}) = ${tex(tau(0.145, 1e-6), 2)}$ s, several thousand times the age of the universe. Quantum mechanics still applies; its spreading is simply invisible.`,
    }),
    num({
      id: 'cp-detector', difficulty: 3, transfer: true,
      gen(r) {
        const [E, d] = r.pick([[1, 0.1], [10, 0.5], [100, 0.2], [5, 0.3]]);
        const v = Math.sqrt((2 * E * QE) / ME), tf = d / v, T = tau(ME, 1e-9);
        const ans = 1e-9 * Math.sqrt(1 + (tf / T) ** 2) * 1e3;
        return {
          prompt: t`A spacecraft’s electron spectrometer counts solar-wind electrons after a flight path of $${d * 100}$ cm. Suppose one of them were a minimum-uncertainty Gaussian packet $\sigma_0 = 1$ nm wide where its path began, moving at ${E} eV (speed $v = ${tex(v, 3)}$ m/s, non-relativistic). How wide would the packet be on arrival, in mm? ($\tau = ${fmt(T * 1e15, 4)}$ fs for this $\sigma_0$.)`,
          visual: spreadPic([0, 4], t`Spreading in units of the starting width, here only to $4\tau$; the actual flight lasts millions of $\tau$.`),
          answer: ans, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: ans / 1000, feedback: t`Check the units: the answer is asked in mm.` }, { value: 1e-6, feedback: t`The width does change: the flight time is millions of dispersion times.` }],
          hints: [t`Flight time $t = d/v = ${tex(tf, 3)}$ s.`, t`$t \gg \tau$, so $\sigma \approx \sigma_0t/\tau$.`],
          teach: t`After many dispersion times a packet’s width grows as $\sigma_0t/\tau = \hbar t/2m\sigma_0$, which can reach macroscopic size.`,
          explain: t`$t = ${tex(tf, 3)}$ s $= ${tex(tf / T, 3)}\,\tau$, so $\sigma \approx ${fmt(ans, 3)}$ mm. Real solar-wind electrons are not prepared this sharply — their spread comes from their thermal origin — but the result shows that a single electron’s wave can be macroscopically wide, as electron-interference experiments confirm.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §2.4 and Problem 2.21', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Braginsky & Khalili, Quantum Measurement (Cambridge, 1992): the standard quantum limit', url: 'https://doi.org/10.1017/CBO9780511622748' },
  ],
});
