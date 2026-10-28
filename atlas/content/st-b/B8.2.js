// Fourier transform solutions on the line: the transform turns ∂x into ik, so
// a constant-coefficient PDE becomes an ODE in time for each wavenumber.
// Heat multiplies by e^(−Dk²t) (the heat kernel, recovered), waves by
// cos(ckt) (d'Alembert), Laplace in a half-plane by e^(−|k|y) (upward
// continuation of gravity data), a dispersive equation by e^(−iβk²t)
// (spreading). Dispersion relations, and the FFT as the computational form.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { MATERIALS, SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const fou = (params, caption) => ({ type: 'pde2-fourier', params: { readout: false, ...params }, caption });
const HBAR = 1.054571817e-34, ME = 9.1093837015e-31;   // CODATA 2018
const BETA_E = HBAR / (2 * ME);                          // m²/s, free electron
const AL = MATERIALS[0], TI = MATERIALS[3];
// worked example: a Gaussian hot stripe on an aluminium sheet
const WE = { w: 2e-3, t: 0.1 };
WE.s = Math.sqrt(WE.w ** 2 + 2 * AL.alpha * WE.t);

export default lesson({
  id: 'st-b.B8.2',
  title: 'Fourier transform solutions on the line',
  minutes: 15, difficulty: 3,
  intro: t`On an infinite line there are no end conditions to pick out a discrete set of modes; every wavenumber $k$ is allowed, and the Fourier series becomes the **Fourier transform**. With the convention $\hat f(k) = \int_{-\infty}^{\infty} f(x)\,e^{-ikx}\,dx$, a derivative becomes a multiplication: $\widehat{u_x} = ik\,\hat u$, $\widehat{u_{xx}} = -k^2\hat u$. So the heat equation $u_t = Du_{xx}$ becomes, for each $k$ separately, the ODE $\hat u_t = -Dk^2\hat u$:

$$\hat u(k, t) = \hat f(k)\,e^{-Dk^2t} .$$

Every linear equation with constant coefficients works the same way: it **multiplies each wavenumber by its own factor**. Heat damps short waves; the wave equation only turns their phases; Laplace’s equation in a half-plane damps them with height; a Schrödinger-type equation turns each at its own rate, so a packet spreads. Transform back, and you have the solution.`,
  symbols: [
    { tex: t`\hat f(k)`, text: 'the Fourier transform of the initial profile: how much of the wave $e^{ikx}$ it contains (units of $u$ × m)' },
    { tex: 'k', text: 'the wavenumber (rad/m), $2\\pi/\\lambda$ for wavelength $\\lambda$' },
    { tex: t`\hat u(k, t)`, text: 'the transform of the solution at time $t$' },
    { tex: t`e^{-Dk^2t}`, text: 'the heat equation’s multiplier: the fraction of wavenumber $k$ that survives after time $t$' },
    { tex: 'D', text: 'the diffusivity (m²/s)' },
  ],
  why: t`Gravitational-wave data analysis lives in the frequency domain: LIGO’s matched filters multiply the transform of the data by the transform of a template, weighted by the detector’s noise at each frequency — the same “one factor per frequency” idea.`,
  visual: {
    type: 'pde2-fourier',
    title: 'One multiplier per wavenumber',
    lead: t`Below, the initial profile’s spectrum (dashed), the equation’s multiplier (gold) and their product (blue). Above, the profile they add up to. Move time forward — or, for Laplace, height — and switch equations.`,
    tasks: [
      'Heat: the gold multiplier narrows round k = 0 as t grows, so the spectrum narrows and the profile widens. Watch the half-width readout follow √(w² + 2Dt).',
      'Wave: the multiplier cos(ckt) wiggles faster and faster but never shrinks — no wavenumber is lost, and the profile splits into two intact halves.',
      'Dispersive: |û| never changes, yet the packet spreads, ripples running ahead. Switch the profile to a square under heat: its long 1/k tail is cut off first.',
    ],
    params: { eq: 'heat', eqs: ['heat', 'wave', 'schrod', 'laplace'], profile: 'gauss', w: 1, D: 0.5, c: 1, beta: 0.5, t: 0.5, tmax: 4, readout: true },
    caption: t`Exact solutions on an infinite line, from closed forms or by adding the waves back up numerically. Laplace: the bounded solution of $u_{xx} + u_{yy} = 0$ in $y > 0$, with the profile as its values on $y = 0$; the slider is then the height $y$. Convention $\hat f(k) = \int f(x)e^{-ikx}dx$.`,
  },
  example: {
    prompt: t`A laser leaves a hot stripe on a thin aluminium sheet ($\alpha = ${tex(AL.alpha)}\ \text{m}^2/\text{s}$) with the temperature rise $u(x, 0) = u_0e^{-x^2/2w^2}$, $w = ${WE.w * 1000}$ mm. Find $u(x, t)$ by Fourier transform, and its half-width and peak after ${WE.t} s.`,
    visual: fou({ eq: 'heat', profile: 'gauss', w: 1, D: 0.5, t: 1, tmax: 4, controls: [] }, t`A Gaussian under the heat equation (scaled units): the spectrum narrows by $e^{-Dk^2t}$ and the profile widens to $\sigma^2 = w^2 + 2Dt$.`),
    steps: [
      { label: 'Transform the data', text: t`$\widehat{e^{-x^2/2w^2}}(k) = w\sqrt{2\pi}\,e^{-k^2w^2/2}$ — a Gaussian’s transform is a Gaussian, narrow in $x$ meaning wide in $k$.` },
      { label: 'Transform the equation', text: t`$\hat u_t = -\alpha k^2\hat u$, so $\hat u(k, t) = u_0 w\sqrt{2\pi}\,e^{-k^2w^2/2}\,e^{-\alpha k^2t} = u_0 w\sqrt{2\pi}\,e^{-k^2(w^2 + 2\alpha t)/2}$.` },
      { label: 'Recognise it', text: t`That is the transform of a Gaussian of width $\sigma = \sqrt{w^2 + 2\alpha t}$, scaled by $w/\sigma$: $\;u(x, t) = u_0\dfrac{w}{\sigma}\,e^{-x^2/2\sigma^2}$.` },
      { label: 'Numbers', text: t`$\sigma = \sqrt{(${tex(WE.w)})^2 + 2(${tex(AL.alpha)})(${WE.t})} = ${tex(WE.s)}$ m $= ${r3(WE.s * 1000)}$ mm; peak $u_0w/\sigma = ${r3(WE.w / WE.s)}\,u_0$.` },
      { label: 'Check', text: t`The area $\int u\,dx = u_0w\sqrt{2\pi}$ never changes ($\hat u(0, t) = \hat f(0)$: the multiplier is 1 at $k = 0$) — heat is conserved. And multiplying transforms is convolving functions: this is the data convolved with the heat kernel of lesson B4.2.` },
    ],
    answer: t`$u = u_0\dfrac{w}{\sigma}e^{-x^2/2\sigma^2}$ with $\sigma^2 = w^2 + 2\alpha t$. After ${WE.t} s: $\sigma \approx ${r3(WE.s * 1000)}$ mm and the peak has fallen to $${r3(WE.w / WE.s)}\,u_0$.`,
  },
  practice: [
    mcq({
      id: 'derivative-rule', difficulty: 1,
      prompt: t`With $\hat f(k) = \int f(x)e^{-ikx}\,dx$, what is the transform of $u_{xx}$?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: 'cos(2*x)', color: 'accent', width: 2.2, label: 'cos 2x', labelAt: -2.6, labelDy: -12 }, { fn: '-4*cos(2*x)/4', color: 'warn', width: 1.6, dash: [5, 4], label: '(cos 2x)″ / 4', labelAt: 1.6, labelDy: 14 }] }, caption: t`A single wave and its second derivative (scaled by ¼): the same wave, flipped and multiplied by $k^2 = 4$.` },
      choices: [t`$-k^2\hat u$`, t`$k^2\hat u$`, t`$ik\,\hat u$`, t`$-2ik\,\hat u$`],
      answer: 0,
      why: {
        1: t`Each derivative brings down $ik$, and $(ik)^2 = -k^2$: the sign matters — it is why heat damps rather than amplifies.`,
        2: t`That is one derivative, $u_x$.`,
        3: t`Derivatives multiply by $ik$ each; they do not add a factor 2.`,
      },
      hints: [t`Integrate by parts, or differentiate $e^{ikx}$ twice.`],
      teach: 'Under the Fourier transform each x-derivative becomes a factor ik, so ∂²ₓ becomes −k².',
      explain: t`$\frac{d^2}{dx^2}e^{ikx} = (ik)^2e^{ikx} = -k^2e^{ikx}$, so $\widehat{u_{xx}} = -k^2\hat u$ (assuming $u$ and $u_x$ vanish at $\pm\infty$, so the boundary terms of the integration by parts drop).`,
    }),
    num({
      id: 'gauss-ft', difficulty: 2,
      gen(r) {
        const k = r.pick([0.5, 1, 1.3, 2]);
        const F = Math.sqrt(2 * Math.PI) * Math.exp((-k * k) / 2);
        return {
          prompt: t`Using $\widehat{e^{-x^2/2}}(k) = \sqrt{2\pi}\,e^{-k^2/2}$ (with $\hat f(k) = \int f e^{-ikx}dx$), evaluate the transform at $k = ${k}$.`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-0.1, 1.15], aspect: 'wide', xlabel: 'x', ylabel: 'f', axesAt: 'edge', curves: [{ fn: 'e^(-x^2/2)', color: 'accent', width: 2.4 }] }, caption: t`$f(x) = e^{-x^2/2}$: its transform has the same shape in $k$.` },
          answer: F, tol: { rel: 0.003 },
          errors: [{ value: Math.exp((-k * k) / 2), feedback: t`Keep the factor $\sqrt{2\pi}$, the area under $e^{-x^2/2}$ (the value of the transform at $k = 0$).` }],
          hints: [t`$\sqrt{2\pi} \approx 2.507$.`],
          teach: 'The Fourier transform of a Gaussian is a Gaussian: narrow in x means wide in k.',
          explain: t`$\sqrt{2\pi}\,e^{-${tex(k * k / 2)}} = ${r3(F)}$. With this convention $\hat f(0) = \int f\,dx$, the area.`,
        };
      },
    }),
    mcq({
      id: 'which-keeps-shape', difficulty: 2,
      prompt: t`Writing $u = e^{i(kx - \omega t)}$ gives each equation’s **dispersion relation** $\omega(k)$. Which equation carries a pulse along without changing its shape?`,
      visual: fou({ eq: 'schrod', profile: 'gauss', w: 0.6, beta: 0.5, t: 1.2, tmax: 4, labels: false }, 'A Gaussian packet under one of the equations: same spectrum magnitude, spreading profile (blue: real part; gold: magnitude).'),
      choices: [t`the one-way wave $u_t + cu_x = 0$, with $\omega = ck$: every wavenumber moves at the same speed`, t`$u_t = Du_{xx}$, with $\omega = -iDk^2$`, t`$u_t = i\beta u_{xx}$, with $\omega = \beta k^2$`, 'all of them: shape is set by the initial data alone'],
      answer: 0,
      why: {
        1: t`An imaginary $\omega$ means decay, $e^{-Dk^2t}$: high $k$ dies first and the pulse spreads and sinks.`,
        2: t`Speed $\omega/k = \beta k$ depends on $k$: short waves outrun long ones, and the packet spreads — as in the picture.`,
        3: 'The equation decides how each wavenumber evolves; only if all move alike does the shape survive.',
      },
      hints: [t`The wave $e^{i(kx - \omega t)}$ moves at speed $\omega/k$. When is that the same for every $k$?`],
      teach: 'A shape survives only if ω/k is the same for every k (no dispersion) and ω is real (no damping).',
      explain: t`For $u_t + cu_x = 0$: $-i\omega + ick = 0$, $\omega = ck$, speed $c$ for all $k$ — the profile slides along intact (the two-way wave equation, $\omega = \pm ck$, splits it into two intact halves). Heat gives complex $\omega$ (damping), Schrödinger-type equations give $\omega \propto k^2$ (dispersion).`,
    }),
    num({
      id: 'electron-spread', difficulty: 3,
      gen(r) {
        const wnm = r.pick([0.1, 0.5, 1, 2]);
        const w = wnm * 1e-9, tt = (Math.sqrt(3) * w * w) / (2 * BETA_E);
        return {
          prompt: t`A free electron’s wavefunction obeys $\psi_t = i\beta\,\psi_{xx}$ with $\beta = \hbar/2m_e = ${tex(BETA_E)}\ \text{m}^2/\text{s}$. It starts as $e^{-x^2/2w^2}$ with $w = ${wnm}$ nm. The transform method gives a half-width of $|\psi|$ of $s(t) = \sqrt{w^2 + (2\beta t/w)^2}$. How long until $s$ has doubled, in seconds?`,
          visual: fou({ eq: 'schrod', profile: 'gauss', w: 1, beta: 0.5, t: 1.7, tmax: 4, labels: false }, 'A Gaussian packet spreading under a Schrödinger-type equation (scaled units).'),
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (w * w) / (2 * BETA_E), feedback: t`$s = 2w$ needs $(2\beta t/w)^2 = 3w^2$, so $2\beta t/w = \sqrt3\,w$ — you dropped the $\sqrt3$.` }],
          hints: [t`Set $s = 2w$: $w^2 + (2\beta t/w)^2 = 4w^2$.`, t`$t = \dfrac{\sqrt3\,w^2}{2\beta}$.`],
          teach: 'Dispersion spreads a packet: the narrower it starts, the wider its spread of k and the faster it spreads (t ∝ w²).',
          explain: t`$t = \dfrac{\sqrt3\,(${tex(w)})^2}{2\times${tex(BETA_E)}} = ${tex(tt)}$ s. Halving $w$ quarters the time: localizing an electron more tightly gives it a wider range of wavenumbers, hence of speeds. This is the PDE behind the uncertainty principle.`,
        };
      },
    }),
    expr({
      id: 'damped-symbol', difficulty: 2,
      prompt: t`A pollutant in a long channel diffuses and decays: $u_t = D\,u_{xx} - \gamma u$. Transform in $x$ and solve for $\hat u(k, t)$, given $\hat u(k, 0) = F$.`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [0, 1.1], aspect: 'wide', xlabel: 'k', ylabel: 'multiplier', axesAt: 'edge', curves: [{ fn: 'e^(-0.5*x^2*0.5)', color: 'gold', width: 2, dash: [5, 4], label: 'diffusion alone', labelAt: 2.2, labelDy: -12 }, { fn: 'e^(-(0.5*x^2 + 0.4)*0.5)', color: 'accent', width: 2.4, label: 'with decay', labelAt: 0.4, labelDy: 14 }] }, caption: 'Multipliers after the same time, with and without decay (illustrative D, γ, t): decay lowers every wavenumber equally.' },
      answer: 'F*e^(-(D*k^2 + gamma)*t)',
      answerTeX: t`F\,e^{-(Dk^2 + \gamma)t}`,
      lhs: t`\hat u(k, t)`,
      vars: { F: [0.5, 2], D: [0.1, 1], k: [-2, 2], gamma: [0.1, 1], t: [0, 2] },
      errors: [{ answer: 'F*e^(-(D*k^2 - gamma)*t)', feedback: t`$-\gamma u$ removes material: it adds $-\gamma$ to the rate, making the decay faster.` }, { answer: 'F*e^(-D*k^2*t)', feedback: t`You dropped the decay term: transform $-\gamma u$ to $-\gamma\hat u$.` }],
      hints: [t`$\hat u_t = -Dk^2\hat u - \gamma\hat u$.`, t`A linear ODE $\hat u_t = -(Dk^2 + \gamma)\hat u$: exponential.`],
      teach: 'Every term of a linear constant-coefficient PDE becomes a factor in Fourier space; their sum is the exponent.',
      explain: t`$\hat u = F\,e^{-(Dk^2 + \gamma)t}$: diffusion damps each wavenumber by $e^{-Dk^2t}$ and decay damps them all by $e^{-\gamma t}$. Transforming back: $u = e^{-\gamma t}\times$(the pure diffusion solution).`,
    }),
    code({
      id: 'fft-heat', difficulty: 3,
      prompt: t`Solve the heat equation spectrally with NumPy’s FFT. On a periodic grid of $N = 512$ points on $[-20, 20)$, take $u_0 = e^{-x^2/2}$ and $D = 0.5$. The discrete wavenumbers are \`k = 2*np.pi*np.fft.fftfreq(N, dx)\`. Compute \`u\` at $t = 3$ by multiplying \`np.fft.fft(u0)\` by $e^{-Dk^2t}$ and transforming back (keep the real part). Set \`err\` to the largest difference from the exact $\frac{1}{\sigma}e^{-x^2/2\sigma^2}$, $\sigma^2 = 1 + 2Dt$.`,
      starter: t`import numpy as np

N, Lbox, D, t = 512, 40.0, 0.5, 3.0
x = np.linspace(-Lbox / 2, Lbox / 2, N, endpoint=False)
dx = x[1] - x[0]
u0 = np.exp(-x**2 / 2)

u = None
err = None
print(err)
`,
      answer: t`import numpy as np

N, Lbox, D, t = 512, 40.0, 0.5, 3.0
x = np.linspace(-Lbox / 2, Lbox / 2, N, endpoint=False)
dx = x[1] - x[0]
u0 = np.exp(-x**2 / 2)

k = 2 * np.pi * np.fft.fftfreq(N, dx)
u = np.real(np.fft.ifft(np.fft.fft(u0) * np.exp(-D * k**2 * t)))
s2 = 1 + 2 * D * t
err = np.max(np.abs(u - np.exp(-x**2 / (2 * s2)) / np.sqrt(s2)))
print(err)`,
      tests: [
        { name: t`\`u\` agrees with the exact solution to $10^{-10}$`, code: 'err is not None and err < 1e-10' },
        { name: t`the area $\int u\,dx$ is conserved`, code: 'u is not None and abs(np.sum(u) * dx - np.sum(u0) * dx) < 1e-10' },
        { name: 'the peak has fallen to 1/2 (σ = 2)', code: 'u is not None and abs(u.max() - 0.5) < 1e-6' },
      ],
      hints: ['`k = 2*np.pi*np.fft.fftfreq(N, dx)` gives the wavenumber of each FFT entry, in the FFT’s own order.', '`u = np.real(np.fft.ifft(np.fft.fft(u0) * np.exp(-D*k**2*t)))`.', 'Exact: `np.exp(-x**2/(2*s2))/np.sqrt(s2)` with `s2 = 1 + 2*D*t`; `err` is the max of the absolute difference.'],
      teach: 'The FFT turns the transform method into an algorithm: transform, multiply by the equation’s factor, transform back — exact for every resolved wavenumber.',
      explain: t`The error is at round-off level, about $10^{-15}$: for a smooth, well-resolved profile the spectral method is exact up to the periodic box (the Gaussian is $e^{-100}$ at its edges). The same three lines solve the wave equation (multiply by $\cos ckt$) or a dispersive one (by $e^{-i\beta k^2t}$) — no time steps, no stability limit.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-upward', difficulty: 2, transfer: true,
      gen(r) {
        const c = r.pick([
          { what: 'an airborne gravity survey', h: r.pick([1, 2, 4]), lam: r.pick([10, 20, 50]) },
          { what: 'a gravity-mapping satellite pair like GRACE', h: 450, lam: r.pick([1000, 2000, 4000]) },
        ]);
        const f = Math.exp((-2 * Math.PI * c.h) / c.lam);
        return {
          prompt: t`Above the ground, the disturbance of Earth’s gravitational potential is harmonic, and over a small region the ground can be treated as flat. A pattern of gravity anomalies with wavelength $\lambda = ${c.lam}$ km at ground level is seen by ${c.what} at height $h = ${c.h}$ km. By what factor is its amplitude reduced there?`,
          visual: { type: 'graph', params: { x: [0, 2], y: [-0.2, 2.2], aspect: 'wide', xlabel: 'distance along the ground (wavelengths)', ylabel: 'height (scaled)', axesAt: 'edge', xticks: 4, yticks: 0, curves: [{ fn: '0.15*sin(2*pi*x)', color: 'accent', width: 2.4, label: 'at the ground', labelAt: 0.1, labelDy: 18 }, { fn: '1.6', color: 'gold', width: 1.4, dash: [5, 4], label: 'survey height h', labelAt: 1.4, labelDy: -10 }] }, caption: 'A ground pattern (amplitude exaggerated) and the height at which it is measured; the pattern at that height is what the question asks about. Flat-Earth approximation.' },
          answer: f, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(-c.h / c.lam), feedback: t`The rate is $|k| = 2\pi/\lambda$, not $1/\lambda$.` }],
          hints: [t`Laplace’s equation in $y > 0$: each wavenumber decays as $e^{-|k|y}$.`, t`$|k| = 2\pi/\lambda$, so the factor is $e^{-2\pi h/\lambda}$.`],
          teach: 'Harmonic fields decay away from their sources as e^(−|k|h): fine detail is lost first — upward continuation.',
          explain: t`$e^{-2\pi(${c.h})/${c.lam}} = ${tex(f)}$. Short wavelengths fade fastest with height, which is why satellites map only broad gravity features and aircraft or ground surveys are needed for detail — and why “downward continuation” of satellite data amplifies noise, like the backward heat equation.`,
        };
      },
    }),
    mcq({
      id: 'cp-name-equation', difficulty: 2,
      prompt: t`The picture shows a profile’s spectrum (dashed), an equation’s multiplier (gold) and the result (blue). The multiplier has a sharp corner at $k = 0$ and decays exponentially on both sides. Which problem is it?`,
      visual: fou({ eq: 'laplace', profile: 'gauss', w: 0.5, t: 0.8, tmax: 4, labels: false }, 'Spectrum, multiplier and product (lower panel); the resulting profile (upper panel).'),
      choices: [t`Laplace’s equation in the half-plane $y > 0$, multiplier $e^{-|k|y}$`, t`the heat equation, multiplier $e^{-Dk^2t}$`, t`the wave equation, multiplier $\cos ckt$`, t`a dispersive equation, multiplier $e^{-i\beta k^2t}$`],
      answer: 0,
      why: {
        1: t`$e^{-Dk^2t}$ is a Gaussian in $k$: smooth and flat at $k = 0$, with no corner.`,
        2: t`$\cos ckt$ oscillates between $\pm1$ and never decays.`,
        3: t`That multiplier has magnitude 1 for every $k$; its real part oscillates rather than decays.`,
      },
      hints: [t`Which multiplier involves $|k|$ rather than $k^2$?`],
      teach: 'Each equation has a signature multiplier: Gaussian for heat, cosine for waves, e^(−|k|y) for Laplace, unit-modulus phase for dispersion.',
      explain: t`$|k|$ has a corner at 0, $k^2$ does not. Laplace’s bounded solution in $y > 0$ is $\hat u = \hat f(k)e^{-|k|y}$ — the Fourier form of the Poisson kernel $\frac{y}{\pi(x^2 + y^2)}$, the Green’s function of module B9.`,
    }),
    num({
      id: 'cp-stripe-width', difficulty: 2,
      gen(r) {
        const wmm = r.pick([0.2, 0.5, 1]), tt = r.pick([0.05, 0.2, 1]);
        const w = wmm / 1000, s = Math.sqrt(w * w + 2 * TI.alpha * tt);
        return {
          prompt: t`A laser marks a titanium sheet ($\alpha = ${tex(TI.alpha)}\ \text{m}^2/\text{s}$) with a Gaussian hot stripe of half-width $w = ${wmm}$ mm, $u = u_0e^{-x^2/2w^2}$. What is its half-width $\sigma$ after ${tt} s, in mm?`,
          visual: fou({ eq: 'heat', profile: 'gauss', w: 1, D: 0.5, t: 0.6, tmax: 4, labels: false }, 'A Gaussian stripe spreading (scaled units): the spectrum narrows, the profile widens.'),
          answer: s * 1000, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: (w + Math.sqrt(2 * TI.alpha * tt)) * 1000, feedback: t`Widths add in quadrature: $\sigma^2 = w^2 + 2\alpha t$, not $\sigma = w + \sqrt{2\alpha t}$.` }],
          hints: [t`$\sigma^2 = w^2 + 2\alpha t$.`],
          teach: 'Under diffusion a Gaussian stays Gaussian; its variance grows by 2Dt.',
          explain: t`$\sigma = \sqrt{(${tex(w)})^2 + 2(${tex(TI.alpha)})(${tt})} = ${tex(s)}$ m $= ${r3(s * 1000)}$ mm. In Fourier space: $e^{-k^2w^2/2}e^{-\alpha k^2t} = e^{-k^2\sigma^2/2}$.`,
        };
      },
    }),
  ],
  sources: [SRC.strauss, SRC.evans, SRC.incropera, { label: 'W. M. Telford, L. P. Geldart & R. E. Sheriff, Applied Geophysics, 2nd ed. (CUP, 1990), §2.6 (upward continuation)', url: 'https://doi.org/10.1017/CBO9781139167932' }],
});
