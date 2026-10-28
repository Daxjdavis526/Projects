// Harmonic waves, phase and the complex representation, read as an optician
// reads them (Hecht ch. 2). PHYS 3750 W1.1 and W5.1 built the mathematics;
// this lesson keeps it brief and takes the optics angle: light oscillates far
// too fast for any detector, so what optics measures is the time average of
// ψ² and differences of phase; in a medium k = nk₀, so a thickness L adds the
// phase nk₀L (the optical path). Reads k, ω, v, n and λ₀ from a wave in BK7,
// direction from the sign in kx ∓ ωt, phase lag between points, the extra phase
// of a slab, Hecht's e^{+iωt} convention against this course's e^{−iωt},
// fitting the initial phase to a trace, and ⟨ψ²⟩ = |Ã|²/2. Transfer: how many
// optical cycles a fast photodiode averages over in a laser-communication link.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, PI, sf, nOf, MATS } from './_op.js';

const t = String.raw;
const TAU = 2 * PI;

// the worked example: a 532 nm beam inside N-BK7
const EX = { lam0: 532e-9, A: 240, eps: PI / 3 };
EX.n = nOf('bk7', 532);
EX.k = (TAU * EX.n) / EX.lam0;
EX.w = (TAU * C) / EX.lam0;
EX.kp = sf(EX.k, 5); EX.wp = sf(EX.w, 5);          // as printed
EX.lam = TAU / EX.kp; EX.nu = EX.wp / TAU; EX.v = EX.wp / EX.kp; EX.nn = C / EX.v; EX.lam0b = EX.nn * EX.lam;

/** ψ(x) at t = 0 as a graph, x in µm. */
const waveGraph = (fn, x, caption, extra = {}) => ({
  type: 'graph',
  params: { x, y: [-1.5, 1.5], aspect: 'wide', xlabel: 'x (µm)', ylabel: 'ψ', yticks: 3, curves: [{ fn, color: 'accent', width: 2.2 }], ...extra },
  caption,
});

// the slab picture: λ₀ = 0.6 µm, a slab from 1.0 to 2.5 µm
const SLAB = (n) => `cos(2*pi/0.6*(x + (${n} - 1)*min(max(x - 1, 0), 1.5)))`;

export default lesson({
  id: 'phys4650.O1.1',
  title: 'Harmonic waves, phase and complex representation',
  minutes: 12, difficulty: 2,
  intro: t`A harmonic wave is the building block of optics. You met its mathematics in [PHYS 3750](#/lesson/phys3750.W5.1) and the complex exponential in [W1.1](#/lesson/phys3750.W1.1); this course uses the same convention:

$$\psi(x,t) = A\cos(kx - \omega t + \varepsilon) = \operatorname{Re}\!\left[\tilde A\,e^{i(kx - \omega t)}\right],\qquad \tilde A = A e^{i\varepsilon}$$

What is new is the optics angle. Visible light oscillates about $3\times10^{15}$ times a second: no detector follows that, so optics measures **time averages** ($\langle\psi^2\rangle = A^2/2$) and **differences of phase**. In a medium of index $n$ the wavenumber is $k = nk_0$, so a thickness $L$ adds a phase $nk_0L$. Every lens, coating and interferometer in this course is bookkeeping of that phase.`,
  symbols: [
    { tex: '\\psi', text: 'the disturbance — for light, one component of the electric field, in V/m' },
    { tex: 'A', text: 'the amplitude, the largest value of $\\psi$ (same units as $\\psi$)' },
    { tex: 'k', text: t`the wavenumber $2\pi/\lambda$, in rad/m; in a medium $k = nk_0$, with $k_0 = 2\pi/\lambda_0$ in vacuum` },
    { tex: '\\omega', text: t`the angular frequency $2\pi\nu$, in rad/s; $\nu$ is the frequency in Hz, the same in every medium` },
    { tex: '\\varepsilon', text: 'the initial phase, in radians: where in its cycle the wave is at $x = 0$, $t = 0$' },
    { tex: '\\tilde A', text: t`the complex amplitude $Ae^{i\varepsilon}$: amplitude and initial phase in one number` },
    { tex: 'kx - \\omega t + \\varepsilon', text: t`the **phase** $\varphi$; a crest moves where $\varphi$ stays fixed, at the phase speed $v = \omega/k = c/n$` },
  ],
  why: t`Optics never sees the field itself, only its average square and its phase differences — which is why phase, not displacement, is the variable to track.`,
  visual: {
    type: 'graph',
    title: 'A wave through a slab of glass',
    lead: t`Light of vacuum wavelength $\lambda_0 = 0.6\ \mu\text{m}$ crosses a slab (shaded) 1.5 µm thick. The solid wave goes through the slab; the dashed one is the same wave in vacuum. Inside the slab $k = nk_0$: the crests crowd together, and the wave leaves **behind** the vacuum wave by $(n - 1)k_0L$.`,
    tasks: [
      t`Set $n = 1.5$: inside the slab the wavelength shrinks to $\lambda_0/n = 0.4\ \mu\text{m}$, and after it the two waves are half a cycle apart.`,
      t`Find the index that makes the lag exactly one whole cycle ($2\pi$): beyond the slab the waves line up again. (It is $n = 1.4$.)`,
      t`Slide $\omega t$ up: every crest moves toward $+x$ — the minus sign in $kx - \omega t$ makes it travel that way.`,
    ],
    params: {
      x: [0, 4], y: [-1.6, 1.6], aspect: 'wide', xlabel: 'x (µm)', ylabel: 'ψ', yticks: 3,
      sliders: [
        { key: 'n', label: 'Slab index $n$', min: 1, max: 2, step: 0.01, value: 1.33, explain: 'The refractive index of the slab: 1.33 water, 1.52 crown glass. Outside it, vacuum.' },
        { key: 'wt', label: 'Time, as $\\omega t$', min: 0, max: 6.28, step: 0.02, value: 0, unit: '\\text{rad}', explain: 'How far through one cycle; $2\\pi$ is one period, about 2 fs for this light.' },
      ],
      shade: [{ fn: '1.6', lower: '-1.6', from: 1, to: 2.5, color: 'teal', alpha: 0.14 }],
      curves: [
        { fn: 'cos(2*pi/0.6*x - wt)', color: 'ink3', width: 1.4, dash: [5, 4] },
        { fn: 'cos(2*pi/0.6*(x + (n - 1)*min(max(x - 1, 0), 1.5)) - wt)', color: 'accent', width: 2.4 },
      ],
      readouts: [
        { label: 'extra phase $(n-1)k_0L$', expr: '2*pi*(n - 1)*1.5/0.6', unit: '\\text{rad}', digits: 3 },
        { label: 'in cycles', expr: '(n - 1)*1.5/0.6', digits: 3 },
      ],
    },
    caption: t`Snapshot of $\psi = \cos(\varphi)$ with the phase built up along $x$; reflections at the slab’s faces are left out (they are a few percent: O3.4). Lengths to scale.`,
  },
  example: {
    prompt: t`Inside a window of N-BK7 glass, the field of a green laser beam is $E_y = E_0\cos(kx - \omega t + \pi/3)$, with $E_0 = ${EX.A}$ V/m, $k = ${tex(EX.kp, 5)}$ rad/m and $\omega = ${tex(EX.wp, 5)}$ rad/s. Find the wavelength in the glass, the frequency, the phase speed, the glass’s index, the vacuum wavelength, the direction of travel, and $E_y$ at $x = 0$, $t = 0$.`,
    visual: waveGraph(`${EX.A / 240}*cos(2*pi/${sf(EX.lam * 1e6, 4)}*x + pi/3)`, [0, 1.4], t`The field at $t = 0$ along $x$ (in µm), in units of 240 V/m. One wavelength in the glass is ${sf(EX.lam * 1e9, 4)} nm.`, { points: [{ x: 0, y: 0.5, label: 'x = 0', color: 'gold', labelDx: 8, labelDy: -10 }] }),
    steps: [
      { label: 'Wavelength', text: t`$\lambda = 2\pi/k = ${sf(EX.lam * 1e9, 4)}$ nm — the spatial period inside the glass.` },
      { label: 'Frequency', text: t`$\nu = \omega/2\pi = ${tex(EX.nu, 4)}$ Hz. The frequency is set by the source and is the same in every medium.` },
      { label: 'Phase speed', text: t`$v = \omega/k = ${tex(EX.v, 4)}$ m/s: a crest stays where $kx - \omega t$ is fixed, so $dx/dt = \omega/k$.` },
      { label: 'Index and vacuum wavelength', text: t`$n = c/v = ${sf(EX.nn, 4)}$, and $\lambda_0 = n\lambda = ${sf(EX.lam0b * 1e9, 4)}$ nm: a frequency-doubled Nd:YAG laser. (SCHOTT’s Sellmeier fit for N-BK7 gives $n = ${sf(EX.n, 5)}$ at 532 nm.)` },
      { label: 'Direction and value', text: t`The phase is $kx - \omega t$: as $t$ grows, $x$ must grow to keep it fixed, so the wave travels toward $+x$. At the origin $E_y = ${EX.A}\cos(\pi/3) = ${EX.A / 2}$ V/m.` },
      { label: 'Sense check', text: t`$v < c$ and $\lambda < \lambda_0$ by the same factor $n$ — the only change light suffers on entering glass is a slower phase, so a shorter wavelength.` },
    ],
    answer: t`$\lambda = ${sf(EX.lam * 1e9, 4)}$ nm, $\nu = ${tex(EX.nu, 4)}$ Hz, $v = ${tex(EX.v, 4)}$ m/s, $n = ${sf(EX.nn, 4)}$, $\lambda_0 = ${sf(EX.lam0b * 1e9, 3)}$ nm, travelling toward $+x$; $E_y(0,0) = ${EX.A / 2}$ V/m.`,
  },
  practice: [
    mcq({
      id: 'direction', difficulty: 1,
      prompt: t`A wave is $\psi = A\cos(kx + \omega t)$ with $k, \omega > 0$. Which way does it travel, and how fast?`,
      visual: waveGraph('cos(2*pi*x)', [0, 3], t`The wave at $t = 0$ (crest at P). Follow P: it keeps the phase $kx + \omega t$ fixed.`, { points: [{ x: 1, y: 1, label: 'P (crest)', color: 'gold' }] }),
      choices: [t`Toward $-x$, at $\omega/k$`, t`Toward $+x$, at $\omega/k$`, t`Toward $-x$, at $k/\omega$`, t`It does not travel: it is a standing wave`],
      answer: 0,
      why: {
        1: t`That is $kx - \omega t$. Here, as $t$ grows, $x$ must *shrink* to keep $kx + \omega t$ fixed.`,
        2: t`Check the units: $k/\omega$ is s/m, a slowness, not a speed.`,
        3: t`A standing wave is a product such as $\cos kx\cos\omega t$; a single cosine of $kx \pm \omega t$ always travels.`,
      },
      hints: [t`Follow a crest: it stays where $kx + \omega t$ is constant.`, t`Differentiate $kx + \omega t = \text{const}$: $k\,dx/dt + \omega = 0$.`],
      teach: t`A wave $f(kx \mp \omega t)$ travels toward $\pm x$ at the phase speed $\omega/k$.`,
      explain: t`$k\,dx/dt = -\omega$, so $dx/dt = -\omega/k$: the wave moves toward $-x$ at speed $\omega/k$.`,
    }),
    num({
      id: 'read-n', difficulty: 2,
      gen(r) {
        const nm = r.pick([450, 532, 633, 800, 1064]), mat = r.pick(['water', 'silica', 'bk7', 'sapphire', 'f2']);
        const n = nOf(mat, nm);
        const k = sf((TAU * n) / (nm * 1e-3), 4), w = sf((TAU * C * 1e-15) / (nm * 1e-9), 4);   // rad/µm, rad/fs
        const nn = (k / w) * (C * 1e-9);                     // c in µm/fs is 0.2998
        return {
          prompt: t`Inside a block of ${MATS[mat].name}, a light wave is $\psi = A\cos(kx - \omega t)$ with $k = ${k}$ rad/µm and $\omega = ${w}$ rad/fs. What is the block’s refractive index? ($c = 0.2998$ µm/fs.)`,
          visual: waveGraph(`cos(${k}*x)`, [0, 3], t`The wave at $t = 0$, with $x$ in µm.`),
          answer: nn, tol: { rel: 0.002 },
          errors: [{ value: 1 / nn, feedback: t`That is $v/c$, upside down: $n = c/v$, and $v = \omega/k$.` }, { value: k / w, feedback: t`$k/\omega$ is $1/v$ in fs/µm; multiply by $c$ to get $n = c/v$.` }],
          hints: [t`The phase speed is $v = \omega/k$.`, t`$n = c/v = ck/\omega$, with $c = 0.2998$ µm/fs.`],
          teach: t`Reading a wave: $v = \omega/k$, and the index is $n = c/v = ck/\omega$.`,
          explain: t`$v = ${w}/${k} = ${sf(w / k, 4)}$ µm/fs, so $n = 0.2998/${sf(w / k, 4)} = ${sf(nn, 4)}$ — the index of ${MATS[mat].name} at ${nm} nm.`,
        };
      },
    }),
    num({
      id: 'phase-lag', difficulty: 2,
      gen(r) {
        const nm = r.pick([405, 532, 633, 780]), mat = r.pick(['water', 'bk7', 'silica']), dx = r.pick([0.1, 0.15, 0.2, 0.25]);
        const n = nOf(mat, nm), dphi = (TAU * n * dx * 1000) / nm;
        return {
          prompt: t`A ${nm} nm beam (vacuum wavelength) travels along $+x$ through ${MATS[mat].name} ($n = ${sf(n, 4)}$). Point Q is ${dx * 1000} nm beyond point P. By how many radians does the phase at Q lag the phase at P, at the same instant?`,
          visual: waveGraph(`cos(2*pi*x/${sf(nm / n / 1000, 4)})`, [0, 1.2], t`The wave at one instant (x in µm), with P and Q marked.`, { points: [{ x: 0.2, y: Math.cos((TAU * 0.2 * n * 1000) / nm), label: 'P', color: 'gold' }, { x: 0.2 + dx, y: Math.cos((TAU * (0.2 + dx) * n * 1000) / nm), label: 'Q', color: 'gold' }] }),
          answer: dphi, units: 'rad', tol: { rel: 0.005 },
          errors: [{ value: (TAU * dx * 1000) / nm, feedback: t`You used the vacuum wavenumber. Inside the medium $k = nk_0 = 2\pi n/\lambda_0$.` }, { value: (TAU * dx * 1000) / (nm * n), feedback: t`You divided by $n$: the wavelength in the medium is $\lambda_0/n$, so the wavenumber is $n$ times *larger*.` }],
          hints: [t`At one instant the phase changes by $k\,\Delta x$ between two points.`, t`$k = 2\pi n/\lambda_0$.`],
          teach: t`At fixed time, the phase difference between two points is $k\,\Delta x = 2\pi n\,\Delta x/\lambda_0$: the optical path $n\,\Delta x$ in units of $\lambda_0/2\pi$.`,
          explain: t`$\Delta\varphi = 2\pi n\,\Delta x/\lambda_0 = 2\pi(${sf(n, 4)})(${dx * 1000})/${nm} = ${sf(dphi, 3)}$ rad.`,
        };
      },
    }),
    num({
      id: 'slab-phase', difficulty: 2,
      gen(r) {
        const nm = r.pick([550, 633, 1064]), mat = r.pick(['silica', 'bk7', 'water']), L = r.pick([2, 5, 8, 12]);
        const n = nOf(mat, nm), N = ((n - 1) * L * 1000) / nm;
        return {
          prompt: t`A film of ${MATS[mat].name} ${L} µm thick ($n = ${sf(n, 4)}$ at ${nm} nm) sits in a beam in vacuum. Compared with the same ${L} µm of vacuum, by how many **cycles** does the film delay the wave?`,
          visual: { type: 'graph', params: { x: [0, 4], y: [-1.6, 1.6], aspect: 'wide', xlabel: 'x', ylabel: 'ψ', xticks: 0, yticks: 0, shade: [{ fn: '1.6', lower: '-1.6', from: 1, to: 2.5, color: 'teal', alpha: 0.14 }], curves: [{ fn: 'cos(2*pi/0.6*x)', color: 'ink3', width: 1.4, dash: [5, 4] }, { fn: SLAB(1.5), color: 'accent', width: 2.2 }] }, caption: t`Schematic, not to scale: the wave through the film (solid) falls behind the wave through vacuum (dashed).` },
          answer: N, tol: { rel: 0.005 },
          errors: [{ value: (n * L * 1000) / nm, feedback: t`That counts every cycle inside the film. The *extra* delay compared with vacuum is $(n - 1)L/\lambda_0$.` }, { value: TAU * N, feedback: t`That is the delay in radians; one cycle is $2\pi$ rad.` }],
          hints: [t`In the film there are $nL/\lambda_0$ cycles; in the same thickness of vacuum, $L/\lambda_0$.`, t`Delay $= (n - 1)L/\lambda_0$ cycles.`],
          teach: t`A slab of index $n$ and thickness $L$ delays light by $(n - 1)L$ of optical path: $(n-1)L/\lambda_0$ cycles.`,
          explain: t`$(n - 1)L/\lambda_0 = (${sf(n - 1, 4)})(${L}\ \mu\text{m})/(${nm / 1000}\ \mu\text{m}) = ${sf(N, 3)}$ cycles.`,
        };
      },
    }),
    mcq({
      id: 'convention', difficulty: 2,
      prompt: t`This course writes a wave as $\operatorname{Re}\bigl[A e^{i\varepsilon}e^{i(kx - \omega t)}\bigr]$. Hecht’s *Optics* writes the same kind of wave as $\operatorname{Re}\bigl[A e^{i(\omega t - kx + \varepsilon')}\bigr]$. For the **same physical wave**, how are $\varepsilon$ and $\varepsilon'$ related?`,
      visual: waveGraph('cos(2*pi*x + pi/3)', [0, 2], t`One wave at $t = 0$: $\cos(kx + \pi/3)$, which is also $\cos(-kx - \pi/3)$ — cosine is even.`),
      choices: [t`$\varepsilon' = -\varepsilon$`, t`$\varepsilon' = \varepsilon$`, t`$\varepsilon' = \varepsilon + \pi$`, t`$\varepsilon' = \pi/2 - \varepsilon$`],
      answer: 0,
      why: {
        1: t`The real parts are $\cos(kx - \omega t + \varepsilon)$ and $\cos(\omega t - kx + \varepsilon')$. Cosine is even, so the second is $\cos(kx - \omega t - \varepsilon')$.`,
        2: t`Adding $\pi$ flips the sign of the whole wave; both conventions describe waves travelling toward $+x$, so nothing needs flipping.`,
        3: t`That would turn a cosine into a sine. Both conventions take the real part of an exponential, a cosine.`,
      },
      hints: [t`Take the real part of each: two cosines.`, t`Use $\cos(-\theta) = \cos\theta$ on Hecht’s version.`],
      teach: t`The $e^{-i\omega t}$ and $e^{+i\omega t}$ conventions describe the same waves with complex-conjugate amplitudes: every phase changes sign.`,
      explain: t`$\cos(\omega t - kx + \varepsilon') = \cos(kx - \omega t - \varepsilon')$, which equals $\cos(kx - \omega t + \varepsilon)$ when $\varepsilon' = -\varepsilon$. Whenever you copy a phase or a complex coefficient from a book, check its sign convention first.`,
    }),
    {
      type: 'slider', id: 'fit-phase', difficulty: 2,
      gen(r) {
        const opts = [[-2 * PI / 3, t`-2\pi/3`], [-PI / 2, t`-\pi/2`], [-PI / 4, t`-\pi/4`], [PI / 6, t`\pi/6`], [PI / 2, t`\pi/2`], [3 * PI / 4, t`3\pi/4`]];
        const [e] = r.pick(opts);
        return {
          prompt: t`A fast detector at $x = 0$ records $\psi(0, t) = \cos(\varepsilon - \omega t)$, drawn dashed against $\omega t$. Set the initial phase $\varepsilon$ of the solid curve so the two match.`,
          visual: { type: 'graph', params: { x: [0, 12.57], y: [-1.4, 1.4], aspect: 'wide', xlabel: 'ωt (rad)', ylabel: 'ψ', yticks: 3,
            sliders: [{ key: 'eps', label: 'Initial phase $\\varepsilon$', min: -3.1, max: 3.1, step: 0.01, value: 0, unit: '\\text{rad}', explain: 'Where in its cycle the wave is at $x = 0$ when $t = 0$.' }],
            curves: [{ fn: `cos(${sf(e, 6)} - x)`, color: 'ink3', width: 3, dash: [6, 5] }, { fn: 'cos(eps - x)', color: 'accent', width: 2 }] },
            caption: t`The trace against $\omega t$ (two periods). The dashed curve is the measurement.` },
          param: 'eps', answer: [sf(e - 0.1, 3), sf(e + 0.1, 3)],
          hints: [t`At $\omega t = 0$ the trace reads $\cos\varepsilon$; a peak sits at $\omega t = \varepsilon$.`, t`Find the first peak of the dashed curve: its position in $\omega t$ is $\varepsilon$ (or $\varepsilon + 2\pi$).`],
          teach: t`The initial phase sets where the cycle starts: $\psi(0,t) = \cos(\varepsilon - \omega t)$ peaks at $\omega t = \varepsilon$.`,
          explain: t`The measured trace peaks at $\omega t = ${sf(e, 3)}$ (mod $2\pi$), so $\varepsilon \approx ${sf(e, 3)}$ rad.`,
          instruction: 'Slide ε until the solid curve lies on the dashed one, then check.',
        };
      },
    },
    num({
      id: 'time-average', difficulty: 3,
      gen(r) {
        const a = r.intExcept(-6, 6, [0]), b = r.intExcept(-6, 6, [0]), m2 = a * a + b * b;
        return {
          prompt: t`At one point in a beam the field is $E(t) = \operatorname{Re}\bigl[\tilde E\,e^{-i\omega t}\bigr]$ with complex amplitude $\tilde E = (${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)}i)$ V/m. What is the time average $\langle E^2\rangle$, in V²/m²?`,
          visual: { type: 'graph', params: { x: [0, 12.57], y: [-1.3 * Math.sqrt(m2), 1.3 * Math.sqrt(m2)], aspect: 'wide', xlabel: 'ωt (rad)', ylabel: 'E (V/m)', yticks: 4, curves: [{ fn: `${a}*cos(x) + ${b}*sin(x)`, color: 'accent', width: 2.2 }] }, caption: t`The field against $\omega t$ over two periods. A detector reports only its average square.` },
          answer: m2 / 2, units: 'V^2/m^2', tol: { rel: 0.005 },
          errors: [{ value: m2, feedback: t`$|\tilde E|^2$ is the square of the *peak* field; the average of $\cos^2$ over a cycle is $\tfrac12$.` }, { value: (a * a - b * b) / 2, feedback: t`$|\tilde E|^2 = a^2 + b^2$, not $\operatorname{Re}(\tilde E^2) = a^2 - b^2$.` }, { value: (a + b) ** 2 / 2, feedback: t`Add the squares of the real and imaginary parts, not the parts themselves.` }].filter((x) => Math.abs(x.value - m2 / 2) > 0.02 * m2),
          hints: [t`The amplitude is $|\tilde E| = \sqrt{a^2 + b^2}$, and $E(t) = |\tilde E|\cos(\omega t - \arg\tilde E)$.`, t`The average of $\cos^2$ over a whole cycle is $\tfrac12$, so $\langle E^2\rangle = |\tilde E|^2/2$.`],
          teach: t`The time average of a harmonic field is half the squared modulus of its complex amplitude: $\langle E^2\rangle = \tfrac12|\tilde E|^2 = \tfrac12\tilde E\tilde E^*$.`,
          explain: t`$|\tilde E|^2 = ${a}^2 + ${b}^2 = ${m2}$ V²/m², so $\langle E^2\rangle = ${m2 / 2}$ V²/m². The phase of $\tilde E$ drops out — which is why a detector alone cannot measure phase.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-photodiode', difficulty: 2, transfer: true,
      gen(r) {
        const nm = r.pick([1064, 1550]), tau = r.pick([20, 35, 50, 100]);
        const nu = C / (nm * 1e-9), N = nu * tau * 1e-12;
        return {
          prompt: t`An optical link between satellites carries data on ${nm} nm laser light. Its photodiode responds in about ${tau} ps. Roughly how many optical cycles of the light does each reading average over?`,
          visual: { type: 'graph', params: { x: [0, 12], y: [-1.3, 1.6], aspect: 'wide', xlabel: 'time (optical periods)', ylabel: 'E', xticks: 6, yticks: 0, curves: [{ fn: 'cos(2*pi*x)', color: 'accent', width: 1.6 }, { fn: 'cos(2*pi*x)^2', color: 'gold', width: 1.2, dash: [4, 3] }], hlines: [{ y: 0.5, color: 'gold' }], legend: [{ label: 'field E', color: 'accent' }, { label: 'E²', color: 'gold', dash: [4, 3] }, { label: 'average of E², what is measured', color: 'gold' }], legendAt: 'tr' }, caption: t`Twelve optical periods, in units of the peak field. The photodiode’s response time spans thousands of periods, so it reports only the average of $E^2$.` },
          answer: N, tol: { rel: 0.02 },
          errors: [{ value: (nm * 1e-9 / C) / (tau * 1e-12), feedback: t`That is the period divided by the response time, upside down: count periods, $N = \nu\tau = c\tau/\lambda_0$.` }],
          hints: [t`The optical frequency is $\nu = c/\lambda_0$.`, t`$N = \nu\tau$.`],
          teach: t`Optical frequencies (hundreds of THz) are thousands of times faster than the fastest photodiodes, so detectors measure time-averaged power.`,
          explain: t`$\nu = c/\lambda_0 = ${tex(nu, 3)}$ Hz, so $N = \nu\tau = (${tex(nu, 3)})(${tau}\times10^{-12}) \approx ${tex(N, 2)}$ cycles. To read the phase itself you need a second wave to beat against: interference (O7).`,
        };
      },
    }),
    num({
      id: 'cp-vacuum-lambda', difficulty: 2,
      gen(r) {
        const nm = r.pick([405, 488, 589, 780, 1310]), mat = r.pick(['water', 'silica', 'sapphire', 'diamond']);
        const n = nOf(mat, nm);
        const k = sf((TAU * n) / (nm * 1e-9), 4), w = sf((TAU * C) / (nm * 1e-9), 4);
        const lam0 = (TAU * C / w) * 1e9;
        return {
          prompt: t`In ${MATS[mat].name} a wave is $\psi = A\cos\bigl[(${tex(k, 4)}\ \text{rad/m})x - (${tex(w, 4)}\ \text{rad/s})t\bigr]$. What is its wavelength **in vacuum**, in nm?`,
          visual: waveGraph(`cos(${sf(k * 1e-6, 4)}*x)`, [0, 2], t`The wave at $t = 0$, $x$ in µm. The wavelength you can see is the one inside the medium.`),
          answer: lam0, units: 'nm', tol: { rel: 0.003 },
          errors: [{ value: (TAU / k) * 1e9, feedback: t`$2\pi/k$ is the wavelength *inside* the medium, $\lambda_0/n$. The vacuum wavelength comes from the frequency: $\lambda_0 = 2\pi c/\omega$.` }],
          hints: [t`The frequency does not change between media; the vacuum wavelength is $c/\nu$.`, t`$\lambda_0 = 2\pi c/\omega$.`],
          teach: t`The vacuum wavelength is fixed by the frequency, $\lambda_0 = 2\pi c/\omega$; inside a medium the wavelength is $\lambda_0/n$.`,
          explain: t`$\lambda_0 = 2\pi c/\omega = ${sf(lam0, 4)}$ nm. Inside, $\lambda = 2\pi/k = ${sf((TAU / k) * 1e9, 4)}$ nm, smaller by $n = ${sf(n, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-enters-glass', difficulty: 2,
      prompt: t`A beam passes from vacuum into glass of index $n$. Which statement about its phase is right?`,
      visual: { type: 'graph', params: { x: [0, 4], y: [-1.6, 1.6], aspect: 'wide', xlabel: 'x', ylabel: 'ψ', xticks: 0, yticks: 0, shade: [{ fn: '1.6', lower: '-1.6', from: 2, to: 4, color: 'teal', alpha: 0.14 }], curves: [{ fn: 'cos(2*pi/0.6*(x + 0.5*max(x - 2, 0)))', color: 'accent', width: 2.2 }], points: [{ x: 3, y: 1.35, r: 0, label: 'glass', color: 'teal', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 1, y: 1.35, r: 0, label: 'vacuum', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: t`A wave entering glass at normal incidence (reflection left out). Schematic.` },
      choices: [t`At each point it still cycles at the source’s $\omega$, but its phase changes $n$ times faster with distance.`, t`It cycles $n$ times faster in time, with the same phase change per metre.`, t`It cycles at $\omega/n$ in time, so its wavelength is unchanged.`, t`Its phase jumps by $(n - 1)\pi$ at the surface and then advances as in vacuum.`],
      answer: 0,
      why: {
        1: t`The frequency is set by the source; the field on the glass side is driven at the same $\omega$ by the field at the surface.`,
        2: t`If the frequency dropped, crests would pile up or vanish at the surface. Continuity across the boundary keeps $\omega$ the same.`,
        3: t`There is no such jump: the field is continuous across the surface. The change is in how fast the phase builds with distance, $k = nk_0$.`,
      },
      hints: [t`What sets how often the field at a point oscillates?`, t`$\omega$ is fixed; $v = \omega/k$ drops to $c/n$, so $k$ must rise.`],
      teach: t`Crossing into a medium keeps $\omega$ and multiplies $k$ by $n$: the phase per metre grows, which is all the optical path $nL$ means.`,
      explain: t`The field at the boundary drives the field inside at the same $\omega$. With $v = c/n$ the wavenumber is $k = \omega/v = nk_0$, so the phase advances $n$ times faster per metre and the wavelength is $\lambda_0/n$.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §2.1–2.6', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'SCHOTT optical glass data sheet, N-BK7 (Sellmeier coefficients)', url: 'https://refractiveindex.info/?shelf=glass&book=SCHOTT-optical&page=N-BK7' },
  ],
});
