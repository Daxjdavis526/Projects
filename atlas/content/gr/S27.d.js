// Wave solutions, polarizations and the quadrupole formula — Derivation Mode.
// From step 28's □h̄_μν = 0 in Lorenz gauge: plane waves with null k (speed c);
// TT gauge leaves h₊ and h× (wave along z). Free masses keep their TT
// coordinates (Γⁱ₀₀ = 0), and a rod at angle ψ changes by
// δL/L = ½(h₊cos2ψ + h×sin2ψ). Quadrupole formula h̄_ij = (2G/c⁴r)Ï_ij(t − r/c);
// a circular binary gives Ï_xx = −2μa²ω²cos2ωt, face-on h₊ = −(4Gμa²ω²/c⁴r)cos2ωt,
// h× = −(4Gμa²ω²/c⁴r)sin2ωt, and at inclination ι the factors (1 + cos²ι)/2 and
// cos ι; P = (G/5c⁵)Q⃛_ijQ⃛_ij = (32/5)Gμ²a⁴ω⁶/c⁵ = (32/5)G⁴μ²M³/(c⁵a⁵);
// da/dt = −(64/5)G³μM²/(c⁵a³); merger time (5/256)c⁵a⁴/(G³μM²); the chirp
// ḟ = (96/5)π^{8/3}(G𝓜/c³)^{5/3}f^{11/3}. All checked with SymPy; numbers from
// the tested model/gr-waves.js. Keeps G and c (SI numbers matter here).
// Avoids gr.S27.i (ring, ΔL = hL, chirp mass from masses, τ(f), energy,
// "sound", Earth–Sun power, two-site delay, Hulse–Taylor), gr.EQ.12 and
// gr.EQ.13 (the factor in the formula, dipole, frequency doubling numbers,
// 1/r fall-off, power scaling, strain from 𝓜, edge-on view, the Crab).
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { sci, round } from './_classic.js';
import { chirpMass, fdot, chirpMassFromFdot, pbDot, petersF, G, C, M_SUN, T_SUN, L_SUN } from '../../src/viz/model/gr-waves.js';

const t = String.raw;
const YR = 365.25 * 86400;

// ─── pictures ────────────────────────────────────────────────────────────────
// a ring of free masses across the wave, with a rod at angle ψ = 30°
const ringRod = {
  type: 'graph',
  params: {
    x: [-2.8, 2.8], y: [-1.3, 1.3], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y',
    curves: [
      { polar: '1', theta: [0, 6.2832], color: 'ink3', width: 1, dash: true },
      { param: ['0.32*cos(t)', '0.32*sin(t)'], t: [0, 0.5236], color: 'ink2', width: 1.4 },
    ],
    points: [
      ...Array.from({ length: 12 }, (_, k) => ({ x: round(Math.cos((k * Math.PI) / 6), 5), y: round(Math.sin((k * Math.PI) / 6), 5), color: 'accent', r: 4 })),
      { x: 0.44, y: 0.11, r: 0.01, color: 'ink2', label: 'ψ', labelDx: 0, labelDy: 0, labelAlign: 'center' },
      { x: -2.7, y: 1.15, r: 0.01, color: 'ink3', label: 'the wave travels along z,', labelDx: 0, labelDy: 0, labelAlign: 'left' },
      { x: -2.7, y: 0.97, r: 0.01, color: 'ink3', label: 'out of the screen', labelDx: 0, labelDy: 0, labelAlign: 'left' },
    ],
    arrows: [{ from: [0, 0], to: [0.86603, 0.5], color: 'gold', label: 'L', labelDx: -10, labelDy: -10, labelAlign: 'right' }],
  },
  caption: t`Free test masses on a ring across the wave's direction (blue). A rod of length $L$ (gold) joins the centre to the mass at angle $\psi$ from the $x$ axis.`,
};

// a cross-polarized wave from overhead, hugely exaggerated, and an L-shaped detector
const EPS = 0.36;
const crossRing = {
  type: 'graph',
  params: {
    x: [-2.8, 2.8], y: [-1.3, 1.3], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y',
    curves: [
      { polar: '1', theta: [0, 6.2832], color: 'ink3', width: 1, dash: true },
      { param: [`cos(t) + ${EPS / 2}*sin(t)`, `sin(t) + ${EPS / 2}*cos(t)`], t: [0, 6.2832], color: 'accent', width: 2 },
      { fn: '0', domain: [0, 1], color: 'gold', width: 3.2 },
      { param: ['0', 't'], t: [0, 1], color: 'gold', width: 3.2 },
    ],
    points: [
      { x: 1, y: EPS / 2, color: 'accent', r: 6 }, { x: EPS / 2, y: 1, color: 'accent', r: 6 },
      { x: 1, y: 0, color: 'ink3', r: 3 }, { x: 0, y: 1, color: 'ink3', r: 3 },
      { x: -2.7, y: 1.15, r: 0.01, color: 'gold', label: 'gold: the two arms', labelDx: 0, labelDy: 0, labelAlign: 'left' },
      { x: -2.7, y: 0.97, r: 0.01, color: 'accent', label: 'blue: the ring as', labelDx: 0, labelDy: 0, labelAlign: 'left' },
      { x: -2.7, y: 0.81, r: 0.01, color: 'accent', label: 'the wave passes', labelDx: 0, labelDy: 0, labelAlign: 'left' },
    ],
    arrows: [{ from: [1.12, 0], to: [1.12, EPS / 2], color: 'accent' }, { from: [0, 1.1], to: [EPS / 2, 1.1], color: 'accent' }],
  },
  caption: t`A purely cross-polarized wave arriving from overhead, its strain exaggerated about $10^{20}$ times. The ring of free masses (dashed when undisturbed) is stretched along one diagonal and squeezed along the other; the masses at the ends of the arms move sideways (arrows).`,
};

// the binary: relative orbit a(cos ωt, sin ωt), masses 1.5 and 1, separation 2
const binaryPic = {
  type: 'graph',
  params: {
    x: [-2.2, 2.2], y: [-1.5, 1.5], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y',
    curves: [
      { polar: '0.8', theta: [0, 6.2832], color: 'gold', width: 1, dash: true },
      { polar: '1.2', theta: [0, 6.2832], color: 'accent', width: 1, dash: true },
      { fn: `${round(Math.tan((35 * Math.PI) / 180), 6)}*x`, domain: [round(-1.2 * Math.cos((35 * Math.PI) / 180), 5), round(0.8 * Math.cos((35 * Math.PI) / 180), 5)], color: 'ink2', width: 1.4 },
      { param: ['0.35*cos(t)', '0.35*sin(t)'], t: [0, 0.6109], color: 'ink2', width: 1.2 },
    ],
    points: [
      { x: round(0.8 * Math.cos((35 * Math.PI) / 180), 5), y: round(0.8 * Math.sin((35 * Math.PI) / 180), 5), color: 'gold', r: 8, label: 'm₁', labelDx: 10, labelDy: -6 },
      { x: round(-1.2 * Math.cos((35 * Math.PI) / 180), 5), y: round(-1.2 * Math.sin((35 * Math.PI) / 180), 5), color: 'accent', r: 6, label: 'm₂', labelDx: -10, labelDy: 10, labelAlign: 'right' },
      { x: 0.5, y: 0.13, r: 0.01, color: 'ink2', label: 'ωt', labelDx: 0, labelDy: 0, labelAlign: 'center' },
      { x: -0.3, y: 0.06, r: 0.01, color: 'ink2', label: 'a', labelDx: 0, labelDy: 0, labelAlign: 'center' },
    ],
  },
  caption: t`Two stars on circular orbits about their centre of mass (the origin). Their separation $a$ points along angle $\omega t$; for the quadrupole, the pair acts like one body of reduced mass $\mu = m_1m_2/(m_1 + m_2)$ at $a(\cos\omega t, \sin\omega t)$.`,
};

const spiralPic = {
  type: 'graph',
  params: {
    x: [-1.4, 1.4], y: [-1.1, 1.1], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ polar: '(1 - theta/18.85)^0.4', theta: [0, 18.85], color: 'accent', width: 2 }],
    points: [{ x: 1, y: 0, color: 'gold', r: 5, label: 'start', labelDx: 8, labelDy: 0 }, { x: 0, y: 0, color: 'bad', r: 4, label: 'merger', labelDx: 8, labelDy: 12 }],
  },
  caption: t`The separation of an inspiralling binary against orbital angle, at leading order — drawn with only three turns; a real binary makes thousands. The orbit stays nearly circular while it shrinks, faster and faster.`,
};

const decayCurve = {
  type: 'graph',
  params: {
    x: [0, 1.05], y: [0, 1.1], xlabel: 'time / merger time', ylabel: 'a / a₀',
    curves: [{ fn: '(1 - x)^0.25', domain: [0, 1], color: 'accent', width: 2.6 }],
    points: [{ x: 1, y: 0, color: 'bad', r: 5, label: 'merger', labelDx: -8, labelDy: -8, labelAlign: 'right' }],
  },
  caption: t`The separation of a circular binary against time, at leading order: it holds up for most of the time and plunges at the end.`,
};

const ddpOrbit = (() => {
  const e = 0.0878, q = 1.248868 / 1.338185;            // B's mass over A's
  const a1 = 1 / (1 + q), a2 = q / (1 + q);              // orbit sizes about the centre of mass, in units of a
  const ell = (s, k) => [`${round(s * k, 5)}*(cos(t) - ${e})`, `${round(s * k * Math.sqrt(1 - e * e), 5)}*sin(t)`];
  return {
    type: 'graph',
    params: {
      x: [-1.7, 1.7], y: [-1.1, 1.1], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: ell(1.8, a1), t: [0, 6.2832], color: 'gold', width: 1.6 }, { param: ell(-1.8, a2), t: [0, 6.2832], color: 'accent', width: 1.6 }],
      points: [
        { x: round(1.8 * a1 * (1 - e), 5), y: 0, color: 'gold', r: 6, label: 'pulsar A, 22.7 ms', labelDx: 10, labelDy: -8 },
        { x: round(-1.8 * a2 * (1 - e), 5), y: 0, color: 'accent', r: 6, label: 'pulsar B, 2.77 s', labelDx: -10, labelDy: -8, labelAlign: 'right' },
        { x: 0, y: 0, color: 'ink3', r: 2 },
      ],
    },
    caption: t`The double pulsar PSR J0737−3039A/B: two neutron stars, both seen as pulsars (spin periods 22.7 ms and 2.77 s), orbiting their centre of mass every 2.45 hours on a slightly eccentric orbit ($e = 0.088$). Shapes to scale; sizes not.`,
  };
})();

// ─── the Explore: the two polarizations of a circular binary, seen at inclination ι ──
const INC = 'inc*pi/180';
const explorePic = {
  type: 'graph',
  params: {
    x: [0, 2], y: [-1.15, 1.15], xlabel: 'time / orbital period', ylabel: 'h / h₀',
    sliders: [{ key: 'inc', label: 'Inclination $\\iota$', min: 0, max: 180, step: 1, value: 0, unit: '^\\circ', explain: 'The angle between the orbit’s axis and the line of sight: 0° face-on, 90° edge-on, 180° face-on from the other side.' }],
    curves: [
      { fn: `-(1 + cos(${INC})^2)/2*cos(4*pi*x)`, color: 'gold', width: 2.6, label: 'h₊', labelAt: 0.5, labelDx: 6, labelDy: -14 },
      { fn: `-cos(${INC})*sin(4*pi*x)`, color: 'violet', width: 2.6, label: 'h×', labelAt: 0.39, labelDx: 6, labelDy: -12 },
    ],
    hlines: [{ y: 0 }],
    readouts: [
      { label: '$h_+$ amplitude', expr: `(1 + cos(${INC})^2)/2`, digits: 3 },
      { label: '$h_\\times$ amplitude', expr: `abs(cos(${INC}))`, digits: 3 },
    ],
  },
  caption: t`The two polarizations from a circular binary, over two orbits, in units of the face-on amplitude $h_0 = 4G\mu a^2\omega^2/(c^4r)$: $h_+ = -h_0\tfrac{1 + \cos^2\iota}{2}\cos2\omega t$ and $h_\times = -h_0\cos\iota\,\sin2\omega t$ (quadrupole formula, projected on the sky; checked with SymPy). Two wave cycles per orbit.`,
};

// ─── numbers ─────────────────────────────────────────────────────────────────
const EX = { m1: 36 * 1.09, m2: 29 * 1.09, f: 40 };                    // GW150914 as seen at Earth (masses × (1 + z), z ≈ 0.09)
EX.Mc = chirpMass(EX.m1, EX.m2); EX.fd = +fdot(EX.f, EX.Mc).toPrecision(3); EX.McBack = chirpMassFromFdot(EX.f, EX.fd);
const sepAt = (M, fgw) => Math.cbrt((G * M * M_SUN) / (Math.PI * fgw) ** 2);        // Kepler, orbital ω = πf
const DP = { Pb: 0.1022515593 * 86400, m1: 1.338185, m2: 1.248868, e: 0.087777 };
DP.Mc = chirpMass(DP.m1, DP.m2); DP.pb = pbDot(DP.Pb, DP.m1, DP.m2, DP.e);
DP.a = Math.cbrt((G * (DP.m1 + DP.m2) * M_SUN * DP.Pb ** 2) / (4 * Math.PI ** 2));
const tMerge = (a, m1, m2) => { const M = (m1 + m2) * M_SUN, mu = ((m1 * m2) / (m1 + m2)) * M_SUN; return ((5 / 256) * C ** 5 * a ** 4) / (G ** 3 * mu * M * M); };

export default lesson({
  id: 'gr.S27.d',
  title: 'Wave solutions, polarizations and the quadrupole formula',
  minutes: 17, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`Step 28 turned Einstein's equations, for a small ripple $h_{\mu\nu}$ on flat spacetime, into a wave equation. Here we solve it: the waves move at $c$, have exactly two polarizations, and stretch the distance between free masses across their direction of travel. Then we follow them back to their source. A binary star's changing **quadrupole moment** radiates waves at twice its orbital frequency; the energy they carry makes the orbit shrink and the frequency rise — the **chirp** — at a rate set by one combination of the masses. That is how LIGO weighed GW150914, and how a double pulsar tests the whole chain to one part in ten thousand.

Conventions: Carroll's, signature $(-,+,+,+)$. We keep $G$ and $c$ here, because the numbers are the point.`,
  equation: t`h^{\mathrm{TT}}_{ij} = \frac{2G}{c^4r}\,\ddot I^{\mathrm{TT}}_{ij}\!\left(t - \frac rc\right), \qquad P = \frac{G}{5c^5}\,\dddot Q_{ij}\,\dddot Q_{ij}`,
  symbols: [
    { tex: 'h^{\\mathrm{TT}}_{ij}', text: t`the wave in transverse–traceless gauge: only its components across the direction of travel, with zero trace — $h_+$ and $h_\times$` },
    { tex: 'I_{ij}', text: t`the mass quadrupole moment, $\int\rho\,x_ix_j\,d^3x$; dots are time derivatives` },
    { tex: 'Q_{ij}', text: t`its trace-free part, $I_{ij} - \tfrac13\delta_{ij}I_{kk}$, whose third derivative sets the power` },
    { tex: 'r', text: 'the distance from the source; the strain falls as 1/r' },
    { tex: 't - r/c', text: 'the retarded time: what the source did when the wave left it' },
    { tex: 'P', text: 'the power carried off by the waves, averaged over a cycle (in watts)' },
  ],
  why: 'These few formulas turn a wiggle in a detector into masses, distances and a test of general relativity — the basis of every gravitational-wave measurement since 2015, and of the binary-pulsar tests before it.',
  visual: {
    ...explorePic,
    title: 'Two polarizations, seen from any angle',
    lead: t`The waves from two stars on a circular orbit, over two orbital periods: $h_+$ (gold) and $h_\times$ (violet), from the quadrupole formula. Tilt the orbit away from the line of sight.`,
    tasks: [
      'Face-on (0°): equal amplitudes, a quarter-cycle apart — the stretching pattern rotates, like circularly polarized light. Note two wave cycles per orbit.',
      'Edge-on (90°): h× vanishes and h₊ halves — linear polarization. The ratio of the two amplitudes tells an observer the tilt.',
      'Past 90°: h× changes sign — the orbit is seen turning the other way.',
    ],
  },
  example: {
    prompt: t`Starting from step 28's vacuum equation, $\Box\bar h_{\mu\nu} = 0$ in Lorenz gauge, find the polarizations of gravitational waves and what they do to free masses. Then derive the waves, the power and the chirp of a binary star, and weigh GW150914 from its chirp.`,
    visual: { type: 'gr-chirp', params: { m1: 36, m2: 29, D: 410, p: 0.9 }, caption: t`GW150914 at leading order (the quadrupole formula): strain against time as the frequency sweeps up, and a ring of free masses stretched by it — exaggerated enormously. The sweep is the chirp of the last steps.` },
    steps: [
      { label: 'Plane waves', text: t`In vacuum, step 28 gave $\Box\bar h_{\mu\nu} = 0$ with $\partial^\mu\bar h_{\mu\nu} = 0$. A plane wave $\bar h_{\mu\nu} = A_{\mu\nu}\cos(k_\sigma x^\sigma)$ solves it only if $k_\sigma k^\sigma = 0$: $\omega = c|\vec k|$, so the waves move at the speed of light. The gauge condition becomes $k^\mu A_{\mu\nu} = 0$.` },
      { label: 'Transverse and traceless', text: t`Lorenz gauge still allows $x^\mu \to x^\mu + \xi^\mu$ with $\Box\xi^\mu = 0$; use it to set $A_{0\nu} = 0$ and $A^\mu{}_\mu = 0$ (then $\bar h = h$). For a wave along $z$, $k^\mu A_{\mu\nu} = 0$ then removes $A_{z\nu}$, leaving $$h_{\mu\nu} = \begin{pmatrix} 0 & 0 & 0 & 0 \\ 0 & h_+ & h_\times & 0 \\ 0 & h_\times & -h_+ & 0 \\ 0 & 0 & 0 & 0 \end{pmatrix}\cos\omega\left(t - \frac zc\right):$$ two polarizations, plus and cross (SymPy: this solves the wave equation and is transverse and traceless).` },
      { label: 'What free masses do', text: t`A mass at rest stays at fixed TT coordinates: with $h_{0\mu} = 0$ the geodesic equation gives $d^2x^i/d\tau^2 = -\Gamma^i{}_{00}c^2 = 0$. But the proper distance between two masses changes: $L = \int\sqrt{g_{ij}\,dx^idx^j} \approx L_0\left(1 + \tfrac12h_{ij}n^in^j\right)$, so a rod at angle $\psi$ across the wave stretches by $$\frac{\delta L}{L} = \tfrac12\left(h_+\cos2\psi + h_\times\sin2\psi\right).$$ Arms along $x$ and $y$ change by $\pm\tfrac12h_+L$ — a difference of $h_+L$.` },
      { label: 'The source', text: t`Far from a source moving slowly compared with light, step 28's retarded solution reduces to $\bar h_{ij} = \dfrac{2G}{c^4r}\ddot I_{ij}(t - r/c)$, with $I_{ij} = \int\rho\,x_ix_j\,d^3x$. For a wave travelling along $z$ keep the transverse, traceless part: $h_+ = \dfrac{G}{c^4r}\left(\ddot I_{xx} - \ddot I_{yy}\right)$ and $h_\times = \dfrac{2G}{c^4r}\ddot I_{xy}$.` },
      { label: 'A circular binary', text: t`With relative orbit $a(\cos\omega t, \sin\omega t)$ and reduced mass $\mu$: $I_{xx} = \mu a^2\cos^2\omega t$, $I_{yy} = \mu a^2\sin^2\omega t$, $I_{xy} = \mu a^2\sin\omega t\cos\omega t$, so $\ddot I_{xx} = -\ddot I_{yy} = -2\mu a^2\omega^2\cos2\omega t$ and $\ddot I_{xy} = -2\mu a^2\omega^2\sin2\omega t$. Seen face-on, $$h_+ = -\frac{4G\mu a^2\omega^2}{c^4r}\cos2\omega t, \qquad h_\times = -\frac{4G\mu a^2\omega^2}{c^4r}\sin2\omega t:$$ waves at **twice** the orbital frequency. From an angle $\iota$ the two get factors $\tfrac12(1 + \cos^2\iota)$ and $\cos\iota$ (the Explore).` },
      { label: 'Power and decay', text: t`The waves carry $P = \dfrac{G}{5c^5}\dddot Q_{ij}\dddot Q_{ij}$; for the binary (SymPy) $P = \dfrac{32}{5}\dfrac{G\mu^2a^4\omega^6}{c^5} = \dfrac{32}{5}\dfrac{G^4\mu^2M^3}{c^5a^5}$, using Kepler's $\omega^2 = GM/a^3$. It drains the orbital energy $E = -G\mu M/2a$, so $$\frac{da}{dt} = -\frac{64}{5}\frac{G^3\mu M^2}{c^5a^3}.$$` },
      { label: 'The chirp', text: t`The wave frequency $f = \omega/\pi$ therefore rises, as $$\dot f = \frac{96}{5}\pi^{8/3}\left(\frac{G\mathcal M}{c^3}\right)^{5/3}f^{11/3}, \qquad \mathcal M = \frac{(m_1m_2)^{3/5}}{(m_1 + m_2)^{1/5}},$$ while the amplitude grows as $f^{2/3}$: a chirp. Only the **chirp mass** $\mathcal M$ sets the sweep (SymPy checks both).` },
      { label: 'Weighing GW150914', text: t`At leading order, GW150914's frequency rose through $${EX.f}$ Hz at $${EX.fd}$ Hz/s. Inverting, $G\mathcal M/c^3 = \left(\tfrac{5}{96}\pi^{-8/3}f^{-11/3}\dot f\right)^{3/5}$ gives $\mathcal M = ${round(EX.McBack, 3)}\,M_\odot$ as measured at Earth (about $28\,M_\odot$ at the source, $z \approx 0.09$). Since $\mathcal M = \mu^{3/5}M^{2/5}$ is largest for equal masses, the total mass is at least $4^{3/5}\mathcal M \approx 70\,M_\odot$ — all of it orbiting 75 times a second when the signal peaked at 150 Hz.` },
    ],
    answer: t`Waves move at $c$ with two polarizations, $h_+$ and $h_\times$; a rod at angle $\psi$ stretches by $\tfrac12(h_+\cos2\psi + h_\times\sin2\psi)$. A circular binary radiates at twice its orbital frequency, with face-on amplitude $4G\mu a^2\omega^2/(c^4r)$ and power $\tfrac{32}{5}G^4\mu^2M^3/(c^5a^5)$; its orbit shrinks as $\dot a = -\tfrac{64}{5}G^3\mu M^2/(c^5a^3)$ and its frequency chirps at a rate set by $\mathcal M$ — about $30\,M_\odot$ for GW150914, so at least $70\,M_\odot$ in all.`,
  },
  practice: [
    expr({
      id: 'rod-angle', difficulty: 2,
      prompt: t`A wave travels along $z$; in TT gauge its only components are $h_{xx} = -h_{yy} = h_+$ and $h_{xy} = h_{yx} = h_\times$. Two free masses in the $xy$-plane are a distance $L$ apart along $\hat n = (\cos\psi, \sin\psi, 0)$, and their proper separation is $L\left(1 + \tfrac12h_{ij}n^in^j\right)$. Find $\delta L/L$. (Type $h_+$ as \`h_p\` and $h_\times$ as \`h_c\`.)`,
      answer: '(h_p cos(2psi) + h_c sin(2psi))/2',
      answerTeX: t`\tfrac12\left(h_+\cos2\psi + h_\times\sin2\psi\right)`,
      lhs: '\\delta L/L',
      vars: { h_p: [-1, 1], h_c: [-1, 1], psi: [0, 3] },
      keys: [['h₊', 'h_p'], ['h×', 'h_c'], ['ψ', 'psi']],
      errors: [
        { answer: '(h_p cos(psi) + h_c sin(psi))/2', feedback: t`$h_{ij}n^in^j$ is quadratic in $\hat n$: $h_+(\cos^2\psi - \sin^2\psi) + 2h_\times\sin\psi\cos\psi$.` },
        { answer: 'h_p cos(2psi) + h_c sin(2psi)', feedback: t`Keep the $\tfrac12$.` },
        { answer: '(h_p cos(2psi) - h_c sin(2psi))/2', feedback: t`Both off-diagonal entries are $+h_\times$, so the cross term is $+2h_\times n^xn^y$.` },
      ],
      hints: [t`$h_{ij}n^in^j = h_{xx}\cos^2\psi + 2h_{xy}\sin\psi\cos\psi + h_{yy}\sin^2\psi$.`, t`$\cos^2\psi - \sin^2\psi = \cos2\psi$ and $2\sin\psi\cos\psi = \sin2\psi$.`],
      teach: t`Free masses keep their TT coordinates while the metric between them changes, so their proper distance does: $\delta L/L = \tfrac12h_{ij}n^in^j$.`,
      explain: t`$\delta L/L = \tfrac12\left(h_+\cos2\psi + h_\times\sin2\psi\right)$. A rod along $x$ feels $+\tfrac12h_+$, one along $y$ the opposite, one at $45°$ only $\tfrac12h_\times$. Turning by $45°$ turns one polarization into the other, and the pattern repeats after $180°$; light's two polarizations are $90°$ apart and its pattern repeats after $360°$ — the difference between spin 2 and spin 1.`,
      visual: ringRod,
    }),
    mcq({
      id: 'blind', difficulty: 2,
      prompt: t`A purely cross-polarized wave ($h_+ = 0$, $h_\times \ne 0$) arrives from straight overhead at a detector whose two arms lie along $x$ and $y$. What does the detector record?`,
      choices: [
        t`Nothing, to first order: at $\psi = 0$ and $90°$, $\tfrac12h_\times\sin2\psi = 0$ — the end masses are pushed across their arms, not along them. Arms at $45°$ would see the wave`,
        t`An arm-length difference of $h_\times L$, just as a plus wave gives $h_+L$`,
        t`Each arm changes by $\tfrac12h_\times L$ in the same direction, so the difference cancels`,
        t`It depends on the wave's frequency`,
      ],
      answer: 0,
      why: {
        1: t`The plus wave stretches along $x$ and $y$; the cross wave along the diagonals. For arms along the axes, $\sin2\psi = 0$.`,
        2: t`At $\psi = 0$ and $90°$ the change is not merely equal in the two arms — it is zero in each.`,
        3: t`$\delta L/L = \tfrac12(h_+\cos2\psi + h_\times\sin2\psi)$ contains no frequency, for arms much shorter than the wavelength (LIGO's 4 km against about 3000 km at 100 Hz).`,
      },
      hints: [t`Use $\delta L/L = \tfrac12\left(h_+\cos2\psi + h_\times\sin2\psi\right)$ at $\psi = 0$ and at $\psi = 90°$.`],
      teach: 'An L-shaped detector responds to the polarization lined up with its arms and is blind to the one at 45° to them; a network of detectors in different orientations sees both.',
      explain: t`Both arms have $\sin2\psi = 0$: a cross wave from overhead moves the end masses sideways (picture), changing the arm lengths only at second order. Turned by $45°$, the same detector would record the full $h_\times L$. This is why several detectors with different orientations are needed to measure both polarizations — and with them, the tilt of the source's orbit (the Explore).`,
      visual: crossRing,
    }),
    expr({
      id: 'quad-xx', difficulty: 2,
      prompt: t`Two stars orbit their common centre on a circle. Their relative position is $a(\cos\omega t, \sin\omega t, 0)$ and their reduced mass $\mu = m_1m_2/(m_1 + m_2)$, so the mass quadrupole has $I_{xx} = \mu a^2\cos^2\omega t$. Find its second time derivative, $\ddot I_{xx}$.`,
      answer: '-2 mu a^2 omega^2 cos(2 omega t)',
      answerTeX: t`-2\mu a^2\omega^2\cos2\omega t`,
      lhs: '\\ddot I_{xx}',
      vars: { mu: [0.5, 2], a: [0.5, 2], omega: [0.5, 2], t: [0, 3] },
      keys: [['μ', 'mu'], ['ω', 'omega']],
      errors: [
        { answer: '-mu a^2 omega^2 cos(2 omega t)', feedback: t`Check the factor: $\cos^2\omega t = \tfrac12(1 + \cos2\omega t)$, and differentiating $\cos2\omega t$ twice brings $-4\omega^2$.` },
        { answer: '-2 mu a^2 omega^2 cos(omega t)', feedback: t`The quadrupole repeats every half orbit: $\cos^2\omega t = \tfrac12(1 + \cos2\omega t)$.` },
        { answer: '2 mu a^2 omega^2 cos(2 omega t)', feedback: t`Sign: $\dfrac{d^2}{dt^2}\cos2\omega t = -4\omega^2\cos2\omega t$.` },
      ],
      hints: [t`$\cos^2\omega t = \tfrac12\left(1 + \cos2\omega t\right)$.`, t`$\dfrac{d^2}{dt^2}\cos2\omega t = -4\omega^2\cos2\omega t$.`],
      teach: 'The quadrupole of two orbiting masses repeats every half orbit, so the waves come out at twice the orbital frequency.',
      explain: t`$\ddot I_{xx} = -2\mu a^2\omega^2\cos2\omega t$; likewise $\ddot I_{yy} = +2\mu a^2\omega^2\cos2\omega t$ and $\ddot I_{xy} = -2\mu a^2\omega^2\sin2\omega t$. Face-on, $h_+ = \dfrac{G}{c^4r}\left(\ddot I_{xx} - \ddot I_{yy}\right) = -\dfrac{4G\mu a^2\omega^2}{c^4r}\cos2\omega t$: the wave frequency is twice the orbital one.`,
      visual: binaryPic,
    }),
    expr({
      id: 'decay', difficulty: 3,
      prompt: t`A circular binary — total mass $M$, reduced mass $\mu$, separation $a$ — radiates $P = \dfrac{32}{5}\dfrac{G^4\mu^2M^3}{c^5a^5}$, and its orbital energy is $E = -\dfrac{G\mu M}{2a}$. Find $da/dt$.`,
      answer: '-(64/5) G^3 mu M^2/(c^5 a^3)',
      answerTeX: t`-\frac{64}{5}\,\frac{G^3\mu M^2}{c^5a^3}`,
      lhs: 'da/dt',
      vars: { G: [0.5, 2], mu: [0.5, 2], M: [1, 3], c: [1, 3], a: [1, 3] },
      keys: [['μ', 'mu']],
      errors: [
        { answer: '(64/5) G^3 mu M^2/(c^5 a^3)', feedback: t`Radiating makes $E$ more negative, and $E = -G\mu M/2a$ becomes more negative as $a$ shrinks: $da/dt < 0$.` },
        { answer: '-(32/5) G^3 mu M^2/(c^5 a^3)', feedback: t`$dE/da = G\mu M/2a^2$: dividing by it doubles the factor.` },
      ],
      hints: [t`Energy balance: $\dfrac{dE}{dt} = -P$, and $\dfrac{dE}{dt} = \dfrac{dE}{da}\,\dfrac{da}{dt}$.`, t`$\dfrac{dE}{da} = \dfrac{G\mu M}{2a^2}$, so $\dfrac{da}{dt} = -P\Big/\dfrac{G\mu M}{2a^2}$.`],
      teach: 'The power radiated comes out of the orbital energy, so the orbit shrinks: da/dt = −P/(dE/da).',
      explain: t`$\dfrac{da}{dt} = -\dfrac{P}{dE/da} = -\dfrac{64}{5}\dfrac{G^3\mu M^2}{c^5a^3}$. The closer the stars, the faster they close in: $a^3\,da \propto -dt$, so $a^4$ falls linearly in time and the end comes in a rush. With Kepler's $\omega^2 = GM/a^3$ this same law is the chirp, $\dot f \propto \mathcal M^{5/3}f^{11/3}$.`,
      visual: spiralPic,
    }),
    num({
      id: 'merge-time', difficulty: 3,
      gen(r) {
        const [name, a, m1, m2, note] = r.pick([
          ['the double pulsar PSR J0737−3039A/B (1.338 and 1.249 solar masses, $a = 8.79\\times10^{8}$ m)', 8.79e8, DP.m1, DP.m2, t`Its slight eccentricity, $e = 0.088$, shortens this by a few per cent: the double pulsar will merge in about 85 million years.`],
          ['two 1.4-solar-mass neutron stars $10^{9}$ m apart', 1e9, 1.4, 1.4, t`Halve the separation and the wait drops sixteen-fold: $t \propto a_0^4$.`],
          ['two 30-solar-mass black holes 0.1 AU apart', 0.1 * 1.495978707e11, 30, 30, t`Heavier pairs merge sooner at a given separation, but black holes formed far apart need some other push to come close enough to merge within the age of the universe.`],
        ]);
        const T = tMerge(a, m1, m2) / YR / 1e6, mu = (m1 * m2) / (m1 + m2), M = m1 + m2;
        return {
          prompt: t`Integrate $\dfrac{da}{dt} = -\dfrac{64}{5}\dfrac{G^3\mu M^2}{c^5a^3}$ from the separation $a_0$ down to $0$ to find how long a circular binary takes to merge, and evaluate it for ${name}. ($G = ${sci(G, 4)}$ SI, $c = ${sci(C, 4)}$ m/s, $M_\odot = ${sci(M_SUN, 4)}$ kg.) Answer in millions of years.`,
          answer: T, units: 'Myr', tol: { rel: 0.01 },
          errors: [
            { value: 4 * T, feedback: t`$\int_0^{a_0}a^3\,da = a_0^4/4$: keep the 4.` },
            { value: (T * mu) / M, feedback: t`Use the reduced mass $\mu = m_1m_2/(m_1 + m_2)$, not the total mass, in $G^3\mu M^2$.` },
          ],
          hints: [t`Separate the variables: $a^3\,da = -K\,dt$ with $K = \dfrac{64}{5}\dfrac{G^3\mu M^2}{c^5}$, so $t = \dfrac{a_0^4}{4K} = \dfrac{5}{256}\dfrac{c^5a_0^4}{G^3\mu M^2}$.`, t`Here $\mu = ${round(mu, 4)}\,M_\odot$ and $M = ${round(M, 4)}\,M_\odot$; convert both to kg, and seconds to years ($1$ yr $= 3.156\times10^{7}$ s).`],
          teach: 'Separating the variables turns the decay law into a merger time that grows as the fourth power of the separation.',
          explain: t`$t = \dfrac{5}{256}\dfrac{c^5a_0^4}{G^3\mu M^2} = ${sci(T * YR * 1e6, 3)}$ s, or ${round(T, 3)} million years. ${note}`,
          visual: decayCurve,
        };
      },
    }),
    code({
      id: 'sympy-power', difficulty: 3,
      prompt: t`Let SymPy find the power a circular binary radiates. With the relative orbit \`pos\` and reduced mass \`mu\`, build the trace-free quadrupole $Q_{ij} = \mu\left(x_ix_j - \tfrac13\delta_{ij}r^2\right)$ as a $3\times3$ \`sp.Matrix\` (\`sp.KroneckerDelta(i, j)\` is $\delta_{ij}$). The program then evaluates $P = \dfrac{G}{5c^5}\dddot Q_{ij}\dddot Q_{ij}$.`,
      starter: t`import sympy as sp

t, G, c, mu, a, w, M = sp.symbols('t G c mu a omega M', positive=True)
pos = [a*sp.cos(w*t), a*sp.sin(w*t), 0]     # relative orbit, reduced mass mu
r2 = sum(p**2 for p in pos)

Q = sp.zeros(3, 3)       # replace: Q[i, j] = mu (x_i x_j - delta_ij r^2 / 3)

Q3 = Q.diff(t, 3)        # third time derivative
P = sp.simplify(G/(5*c**5) * sum(Q3[i, j]**2 for i in range(3) for j in range(3)))
print(P)
`,
      answer: t`import sympy as sp

t, G, c, mu, a, w, M = sp.symbols('t G c mu a omega M', positive=True)
pos = [a*sp.cos(w*t), a*sp.sin(w*t), 0]     # relative orbit, reduced mass mu
r2 = sum(p**2 for p in pos)

Q = sp.Matrix(3, 3, lambda i, j: mu*(pos[i]*pos[j] - sp.KroneckerDelta(i, j)*r2/3))

Q3 = Q.diff(t, 3)        # third time derivative
P = sp.simplify(G/(5*c**5) * sum(Q3[i, j]**2 for i in range(3) for j in range(3)))
print(P)
`,
      tests: [
        { name: t`$Q_{ij}$ is trace-free`, code: 'sp.simplify(Q.trace()) == 0' },
        { name: t`$P = \frac{32}{5}G\mu^2a^4\omega^6/c^5$, steady in time`, code: 'sp.simplify(P - sp.Rational(32, 5)*G*mu**2*a**4*w**6/c**5) == 0' },
        { name: t`with Kepler's $\omega^2 = GM/a^3$: $P = \frac{32}{5}G^4\mu^2M^3/(c^5a^5)$`, code: 'sp.simplify(P.subs(w, sp.sqrt(G*M/a**3)) - sp.Rational(32, 5)*G**4*mu**2*M**3/(c**5*a**5)) == 0' },
      ],
      hints: [t`\`sp.Matrix(3, 3, lambda i, j: ...)\` builds the matrix entry by entry, with \`pos[i]\` as $x_i$.`, t`\`Q = sp.Matrix(3, 3, lambda i, j: mu*(pos[i]*pos[j] - sp.KroneckerDelta(i, j)*r2/3))\``],
      teach: 'Only the trace-free part of the quadrupole radiates; for a circular orbit its third derivative has constant size, so the power is steady.',
      explain: t`SymPy gives $P = \dfrac{32}{5}\dfrac{G\mu^2a^4\omega^6}{c^5}$ — no averaging needed, because a circular orbit's $\dddot Q_{ij}$ only rotates. With Kepler's law it becomes $\dfrac{32}{5}\dfrac{G^4\mu^2M^3}{c^5a^5}$, the power that drives the orbital decay. For the Earth and Sun it is about 200 W; near GW150914's merger it reached some $10^{49}$ W.`,
      visual: binaryPic,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-chirp', difficulty: 3, transfer: true,
      gen(r) {
        const [what, m1, m2, f] = r.pick([['two neutron stars like those of GW170817', 1.46, 1.27, 100], ['two 10-solar-mass black holes', 10, 10, 60]]);
        const fd = +fdot(f, chirpMass(m1, m2)).toPrecision(3), Mc = chirpMassFromFdot(f, fd);
        return {
          prompt: t`For a binary inspiral at leading order, $$\dot f = \frac{96}{5}\pi^{8/3}\left(\frac{G\mathcal M}{c^3}\right)^{5/3}f^{11/3}.$$ In the signal from ${what}, the wave frequency rises through $${f}$ Hz at $${fd}$ Hz per second. What is the chirp mass $\mathcal M$, in solar masses? ($GM_\odot/c^3 = ${sci(T_SUN * 1e6, 4)}\ \mu\text{s}$)`,
          answer: Mc, units: 'Msun', tol: { rel: 0.01 },
          errors: [
            { value: chirpMassFromFdot(f / 2, fd / 2), feedback: t`$f$ here is the wave frequency, ${f} Hz — twice the orbital one. Use it as given.` },
            { value: ((5 / 96) * f ** (-11 / 3) * fd) ** 0.6 / T_SUN, feedback: t`You dropped the $\pi^{8/3}$.` },
          ],
          hints: [t`$\left(\dfrac{G\mathcal M}{c^3}\right)^{5/3} = \dfrac{5}{96}\,\pi^{-8/3}f^{-11/3}\,\dot f$.`, t`Raise that to the power $3/5$ to get $G\mathcal M/c^3$ in seconds, then divide by $GM_\odot/c^3$.`],
          teach: 'A frequency and its rate of change weigh a binary: they fix the chirp mass, whatever the distance.',
          explain: t`$G\mathcal M/c^3 = \left(\tfrac{5}{96}\pi^{-8/3}f^{-11/3}\dot f\right)^{3/5} = ${sci(Mc * T_SUN, 4)}$ s, so $\mathcal M = ${round(Mc, 3)}\,M_\odot$ (as measured at Earth: for a distant source, divide by $1 + z$). Neither the distance nor the loudness entered — the sweep alone weighs the binary.`,
          visual: { type: 'gr-chirp', params: { m1, m2, D: 100, sliders: false, play: false, readout: false, p: 0.6 }, caption: t`The chirp of ${what}, at leading order: strain against time as the frequency sweeps up.` },
        };
      },
    }),
    num({
      id: 'cp-bh', difficulty: 3, transfer: true,
      prompt: t`GW150914's chirp mass meant a total mass of at least $70$ solar masses, and its waves peaked near $f = 150$ Hz. Treating the two bodies as Newtonian point masses on a circular orbit, how far apart were they then, in km? ($GM_\odot = ${sci(G * M_SUN, 4)}\ \text{m}^3/\text{s}^2$)`,
      answer: sepAt(70, 150) / 1e3, units: 'km', tol: { rel: 0.01 },
      errors: [
        { value: Math.cbrt((G * 70 * M_SUN) / (2 * Math.PI * 150) ** 2) / 1e3, feedback: t`150 Hz is the wave frequency. The orbit turns at half of it: $\omega_\text{orb} = \pi f$.` },
        { value: (2 * 70 * L_SUN) / 1e3, feedback: t`That is $2GM/c^2$, the size of a horizon. Find the orbit's separation from Kepler's law.` },
      ],
      hints: [t`The waves come at twice the orbital frequency, so $\omega_\text{orb} = \pi f = ${round(Math.PI * 150, 4)}$ rad/s.`, t`Kepler: $a^3 = GM/\omega_\text{orb}^2$ with $M = 70\,M_\odot$.`],
      teach: 'Two numbers from the chirp — the mass and the peak frequency — fix how compact the bodies must be.',
      explain: t`$a = \left(GM/\omega_\text{orb}^2\right)^{1/3} = ${round(sepAt(70, 150) / 1e3, 3)}$ km. Seventy solar masses still orbiting within ${round(sepAt(70, 150) / 1e3, 3)} km: only black holes are that compact — the horizons of the pair alone span $2GM/c^2 = ${round((2 * 70 * L_SUN) / 1e3, 3)}$ km, and neutron stars cannot exceed about 2–3 solar masses each. This was the argument of LIGO and Virgo's discovery paper (2016).`,
      visual: { type: 'gr-chirp', params: { m1: 36, m2: 29, D: 410, sliders: false, play: false, readout: false, p: 0.97 }, caption: t`GW150914's chirp at leading order, close to its end: the frequency and amplitude climb steeply.` },
    }),
    num({
      id: 'cp-pbdot', difficulty: 3, transfer: true,
      prompt: t`For an eccentric orbit the quadrupole formula gives the rate of change of the orbital period (Peters & Mathews 1963): $$\dot P_b = -\frac{192\pi}{5}\left(\frac{2\pi G\mathcal M}{c^3P_b}\right)^{5/3}f(e), \qquad f(e) = \frac{1 + \frac{73}{24}e^2 + \frac{37}{96}e^4}{(1 - e^2)^{7/2}}.$$ The double pulsar PSR J0737−3039A/B has $P_b = ${round(DP.Pb, 6)}$ s, $e = ${round(DP.e, 4)}$, and masses $${round(DP.m1, 5)}$ and $${round(DP.m2, 5)}$ solar masses. Predict $\dot P_b$, in seconds per second. ($GM_\odot/c^3 = ${sci(T_SUN * 1e6, 4)}\ \mu\text{s}$)`,
      answer: DP.pb, tol: { rel: 0.01 },
      errors: [
        { value: pbDot(DP.Pb, DP.m1, DP.m2, 0), feedback: t`That leaves out $f(e) = ${round(petersF(DP.e), 4)}$: even a small eccentricity adds 5% here.` },
        { value: -((192 * Math.PI) / 5) * ((2 * Math.PI * (DP.m1 + DP.m2) * T_SUN) / DP.Pb) ** (5 / 3) * petersF(DP.e), feedback: t`Use the chirp mass $\mathcal M = (m_1m_2)^{3/5}/(m_1 + m_2)^{1/5}$, not the total mass.` },
      ],
      hints: [t`$\mathcal M = (m_1m_2)^{3/5}/(m_1 + m_2)^{1/5} = ${round(DP.Mc, 5)}\,M_\odot$, so $G\mathcal M/c^3 = ${sci(DP.Mc * T_SUN, 4)}$ s.`, t`$f(${round(DP.e, 4)}) = ${round(petersF(DP.e), 5)}$. Then evaluate the bracket, raise it to $5/3$, and multiply.`],
      teach: t`Kepler's $P_b \propto a^{3/2}$ turns the orbital decay into a shrinking period; for circular orbits it is the same law as the chirp.`,
      explain: t`$\dot P_b = ${sci(DP.pb, 4)}$: the orbit shrinks by about ${round(Math.abs((2 / 3) * DP.a * (DP.pb / DP.Pb) * 86400 * 1e3), 2)} mm a day. Kramer and colleagues (2021) measured $-1.2479\times10^{-12}$ over 16 years of timing — agreement with the quadrupole formula to about one part in ten thousand, once the masses are fixed by other relativistic effects in the same timing data.`,
      visual: ddpOrbit,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 6 (gravitational radiation)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'LIGO Scientific & Virgo Collaborations, “Observation of Gravitational Waves from a Binary Black Hole Merger”, PRL 116, 061102 (2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
    { label: 'Peters & Mathews, “Gravitational Radiation from Point Masses in a Keplerian Orbit”, Phys. Rev. 131, 435 (1963)', url: 'https://doi.org/10.1103/PhysRev.131.435' },
    { label: 'Kramer et al., “Strong-Field Gravity Tests with the Double Pulsar”, PRX 11, 041050 (2021)', url: 'https://doi.org/10.1103/PhysRevX.11.041050' },
  ],
});
