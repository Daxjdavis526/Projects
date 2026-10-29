// Free particle waves and dispersion: the Schrödinger equation read as one
// more linear wave equation. A plane wave e^{i(kx − ωt)} gives ω = ħk²/2m —
// one time derivative against two space derivatives — so the equation is
// dispersive: crests at v_p = ħk/2m, the packet (and the particle) at
// v_g = ħk/m = 2v_p, a packet that spreads. The zero of energy shifts ω and
// v_p but nothing observable; |ψ|² and the probability current obey the
// conservation law of W9.2. Contexts: a LEED electron, a fullerene, a cold-atom
// gravimeter, a neutron time-of-flight beamline.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const HBAR = 1.054571817e-34, ME = 9.1093837139e-31, QE = 1.602176634e-19, U = 1.66053906892e-27, MN = 1.67492750056e-27, C = 299792458;

// the worked example: a 50 eV electron, as in low-energy electron diffraction
const EX = (() => {
  const E = 50, v = Math.sqrt((2 * E * QE) / ME), k = (ME * v) / HBAR, w = (E * QE) / HBAR;
  return { E, v, k, w, lam: (2 * Math.PI) / k, vp: w / k, vg: (HBAR * k) / ME, vpRest: (ME * C * C + E * QE) / HBAR / k };
})();

// ω = k²/2 (units with ħ = m = 1): the chord from the origin (slope v_p) and the tangent (slope v_g) at k₀
function dispPic(k0, caption, o = {}) {
  const curves = [{ fn: 'x^2/2', color: 'accent', width: 2.4, domain: [0, 3.2] }];
  if (o.chord !== false) curves.push({ fn: `${k0 / 2}*x`, color: 'violet', dash: [5, 4], width: 1.5, domain: [0, k0 * 1.12], label: o.labels === false ? undefined : 'chord: v (phase)', labelAt: k0 * 0.3, labelDx: -4, labelDy: -14 });
  if (o.tangent !== false) curves.push({ fn: `${k0}*(x - ${k0}) + ${(k0 * k0) / 2}`, color: 'gold', dash: [5, 4], width: 1.5, domain: [k0 / 2, Math.min(3.2, k0 + 0.9)], label: o.labels === false ? undefined : 'tangent: v (group)', labelAt: Math.min(2.9, k0 + 0.5), labelDx: 8, labelDy: 14 });
  return curvesPic([...curves, ...(o.curves || [])], [0, 3.2], [0, 5], caption, { xlabel: 'k', ylabel: 'ω', points: [{ x: k0, y: (k0 * k0) / 2, color: 'ink', r: 4.5 }, ...(o.points || [])] });
}

const packet = (caption, t0 = 0) => ({ type: 'mp-packet', params: { view: 'build', disp: 'free', sk: 0.8, N: 41, t: t0, play: false, dispersion: false, controls: false, readout: false }, caption });

export default lesson({
  id: 'phys3750.W10.1',
  title: 'Free particle waves and dispersion',
  minutes: 16, difficulty: 3,
  intro: t`Schrödinger’s equation for a free particle is one more linear wave equation, and the method of [dispersion, phase and group velocity](#/lesson/phys3750.W6.4) works on it unchanged. Put in $\psi = e^{i(kx - \omega t)}$: the left side gives $\hbar\omega\,\psi$, the right $\frac{\hbar^2k^2}{2m}\psi$, so

$$\omega = \frac{\hbar k^2}{2m},\qquad v_p = \frac{\hbar k}{2m},\qquad v_g = \frac{\hbar k}{m} = 2v_p$$

One time derivative against two space derivatives makes $\omega \propto k^2$: the equation is **dispersive**. The group velocity is $p/m$ with $p = \hbar k$ — exactly the particle’s classical velocity — while the crests run at half of it, and every packet spreads. [Matter waves](#/lesson/phys2710.MP6.2) met this rule from the de Broglie side; here it falls out of the equation.`,
  equation: t`i\hbar\,\frac{\partial\psi}{\partial t} = -\frac{\hbar^2}{2m}\,\frac{\partial^2\psi}{\partial x^2}`,
  symbols: [
    { tex: '\\psi(x, t)', text: 'the wave function, a complex field; $|\\psi|^2$ is the probability density, in m⁻¹ in one dimension' },
    { tex: '\\hbar', text: 'the reduced Planck constant, $1.0546\\times10^{-34}$ J s' },
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: 'k,\\ \\omega', text: 'wavenumber (rad/m) and angular frequency (rad/s) of a plane wave; momentum $p = \\hbar k$ and energy $E = \\hbar\\omega$' },
    { tex: 'i', text: 'the imaginary unit: with one time derivative, a real $\\psi$ could not oscillate, so $\\psi$ must be complex' },
  ],
  why: t`Every quantum particle in flight — an electron in a microscope, a neutron in a beamline, an atom in an interferometer — moves at the group velocity of this dispersion relation, and its packet spreads by it.`,
  visual: {
    type: 'pde2-fourier',
    title: 'Same spectrum, spreading packet',
    lead: t`One Gaussian, evolved three ways and drawn in $x$ (above) and $k$ (below). For the dispersive equation $u_t = i\beta u_{xx}$ — Schrödinger’s, with $\beta = \hbar/2m$ — each wavenumber turns by its own phase $e^{-i\beta k^2t}$.`,
    tasks: [
      t`Dispersive: run $t$ forward. The spectrum $|\hat u(k)|$ never changes — no wavenumber gains or loses anything — yet the packet in $x$ spreads and its peak falls.`,
      t`Wave: the same Gaussian splits into two pulses that keep their shape, because $\omega = ck$ gives every wavenumber the same speed.`,
      t`Heat: it spreads too, but by killing high $k$ for good. Schrödinger spreading is reversible: run time backwards and the packet re-focuses.`,
    ],
    params: { eq: 'schrod', eqs: ['schrod', 'wave', 'heat'], profile: 'gauss', w: 1, beta: 0.5, t: 0, tmax: 4 },
    caption: t`Dimensionless units: $\beta = \hbar/2m$ is set to $0.5\ \text{m}^2/\text{s}$ so the spreading is visible. The blue profile in the dispersive case is $|u|$; the packet here does not move, because it has no mean wavenumber.`,
  },
  example: {
    prompt: t`Low-energy electron diffraction (LEED) maps crystal surfaces with ${EX.E} eV electrons. Find their wavenumber, wavelength, phase velocity and group velocity, and decide which one is the electron’s speed. Then see what happens to each if you count the rest energy $mc^2$ in $\hbar\omega$.`,
    steps: [
      { label: 'Classical speed', text: t`$\tfrac12mv^2 = ${EX.E}$ eV gives $v = \sqrt{2E/m} = ${tn(EX.v)}$ m/s, well below $c$, so the non-relativistic equation is fine.` },
      { label: 'Wavenumber', text: t`$k = p/\hbar = mv/\hbar = ${tn(EX.k)}$ rad/m, so $\lambda = 2\pi/k = ${tn(EX.lam * 1e9)}$ nm — comparable to the spacing of atoms, which is why these electrons diffract off a crystal.` },
      { label: 'Two speeds', text: t`$\omega = E/\hbar = ${tn(EX.w)}$ rad/s. Then $v_p = \omega/k = ${tn(EX.vp)}$ m/s and $v_g = d\omega/dk = \hbar k/m = ${tn(EX.vg)}$ m/s.` },
      { label: 'Which is real', text: t`$v_g = v$: the packet moves exactly as the classical electron does, which is how quantum mechanics reproduces Newton for a narrow-band packet. The crests move at $v/2$, sliding backwards through the packet.` },
      { label: 'Shift the zero', text: t`Count the rest energy: $\hbar\omega = mc^2 + \hbar^2k^2/2m$. That adds a constant to $\omega$, so the curve $\omega(k)$ moves up. Its slope, $v_g$, is unchanged; its chord, $v_p$, becomes $${tn(EX.vpRest)}$ m/s $\approx c^2/v$, faster than light.` },
      { label: 'Sense check', text: t`A constant in $\omega$ multiplies $\psi$ by $e^{-i\,\text{const}\,t}$, which leaves $|\psi|^2$ and every measurable quantity alone. The phase velocity of a matter wave is not a physical speed; the group velocity is.` },
    ],
    answer: t`$k = ${tn(EX.k)}$ rad/m ($\lambda = ${tn(EX.lam * 1e9)}$ nm), $v_p = ${tn(EX.vp)}$ m/s, $v_g = ${tn(EX.vg)}$ m/s $= v$. Adding $mc^2$ changes $v_p$ to about $c^2/v$ and leaves $v_g$ alone.`,
    visual: dispPic(1.8, t`The free particle’s $\omega = \hbar k^2/2m$ (units with $\hbar = m = 1$): at one wavenumber the tangent is twice as steep as the chord, so $v_g = 2v_p$.`),
  },
  practice: [
    expr({
      id: 'omega-k-V0', difficulty: 2,
      prompt: t`A particle moves through a region of constant potential energy $V_0$: $\;i\hbar\psi_t = -\dfrac{\hbar^2}{2m}\psi_{xx} + V_0\psi$. Substitute $\psi = e^{i(kx - \omega t)}$ and find the dispersion relation $\omega(k)$.`,
      visual: curvesPic([{ fn: 'x^2/2', color: 'accent', width: 2.2, label: 'V₀ = 0', labelAt: 2.6, labelDx: 8, labelDy: 10 }, { fn: 'x^2/2 + 1.2', color: 'gold', width: 2.2, dash: [6, 4], label: 'V₀ > 0', labelAt: 2.2, labelDx: -60, labelDy: -6 }], [0, 3.2], [0, 5.5], t`Two dispersion curves, units with $\hbar = m = 1$: a constant potential moves the whole curve up or down.`, { xlabel: 'k', ylabel: 'ω' }),
      answer: 'hbar*k^2/(2m) + V_0/hbar',
      answerTeX: t`\frac{\hbar k^2}{2m} + \frac{V_0}{\hbar}`,
      lhs: '\\omega', vars: { hbar: [0.5, 2], k: [0.5, 3], m: [0.5, 3], V_0: [0.2, 3] }, keys: [['ħ', 'hbar'], ['V₀', 'V_0']],
      errors: [
        { answer: 'hbar*k^2/(2m)', feedback: t`The $V_0\psi$ term survives the substitution: it adds $V_0/\hbar$ to $\omega$.` },
        { answer: '-hbar*k^2/(2m) + V_0/hbar', feedback: t`$\psi_{xx} = -k^2\psi$, and the minus sign in front of $\hbar^2/2m$ cancels it: the kinetic term is positive.` },
        { answer: 'hbar*k^2/(2m) + V_0', feedback: t`The left side gives $\hbar\omega$; divide every term by $\hbar$.` },
      ],
      hints: [t`$\partial_t e^{i(kx - \omega t)} = -i\omega\,e^{i(kx - \omega t)}$ and $\partial_x^2$ brings down $-k^2$.`, t`You get $\hbar\omega = \dfrac{\hbar^2k^2}{2m} + V_0$; divide by $\hbar$.`],
      teach: t`Each term of a linear equation turns into a factor for a plane wave: $\partial_t \to -i\omega$, $\partial_x \to ik$.`,
      explain: t`$i\hbar(-i\omega) = \hbar\omega$ and $-\tfrac{\hbar^2}{2m}(-k^2) = \tfrac{\hbar^2k^2}{2m}$, so $\hbar\omega = \tfrac{\hbar^2k^2}{2m} + V_0$: energy equals kinetic plus potential. The slope $d\omega/dk = \hbar k/m$ does not depend on $V_0$.`,
    }),
    num({
      id: 'electron-vp', difficulty: 2,
      gen(r) {
        const E = r.pick([5, 12, 40, 150, 600]);
        const v = Math.sqrt((2 * E * QE) / ME), vp = v / 2;
        return {
          prompt: t`An electron has kinetic energy ${E} eV. What is the phase velocity of its (non-relativistic) matter wave, $\omega/k$, in km/s?`,
          visual: dispPic(1.5, t`$\omega = \hbar k^2/2m$ in units with $\hbar = m = 1$: the chord’s slope is the phase velocity, the tangent’s the group velocity.`),
          answer: vp / 1000, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: v / 1000, feedback: t`That is the electron’s speed $v = \sqrt{2E/m}$, which is the group velocity $\hbar k/m$. The crests move at half of it.` }],
          hints: [t`$v = \sqrt{2E/m_e}$ with $E$ in joules ($1\ \text{eV} = 1.602\times10^{-19}$ J).`, t`$v_p = \omega/k = \hbar k/2m = v/2$.`],
          teach: t`For a free non-relativistic particle $v_p = \hbar k/2m$: half the particle’s speed.`,
          explain: t`$v = ${tn(v / 1000)}$ km/s, so $v_p = v/2 = ${tn(vp / 1000)}$ km/s. The packet — the electron — moves at $v$.`,
        };
      },
    }),
    mcq({
      id: 'why-dispersive', difficulty: 2,
      prompt: t`A string obeys $y_{tt} = v^2y_{xx}$ and a pulse on it keeps its shape. The free Schrödinger equation is $\psi_t = \dfrac{i\hbar}{2m}\psi_{xx}$, and every packet spreads. What in the equation makes the difference?`,
      visual: curvesPic([{ fn: 'x', color: 'violet', width: 2.2, label: 'string: ω = v k', labelAt: 2.7, labelDx: -100, labelDy: -8 }, { fn: 'x^2/2', color: 'accent', width: 2.2, label: 'free particle: ω ∝ k²', labelAt: 2.4, labelDx: 8, labelDy: 8 }], [0, 3.2], [0, 4.5], t`The two dispersion relations (illustrative units): a straight line gives every wavenumber the same speed; the parabola does not.`, { xlabel: 'k', ylabel: 'ω' }),
      choices: [
        t`One time derivative against two space derivatives makes $\omega \propto k^2$, so each wavenumber has its own phase speed $\hbar k/2m$`,
        t`$\psi$ is complex, and its real and imaginary parts interfere and wash the packet out`,
        t`The uncertainty principle forces the spread $\Delta x$ to grow with time, whatever the equation`,
        t`The factor $i$ makes it a diffusion equation, which damps the short wavelengths as heat does`,
      ],
      answer: 0,
      why: {
        1: t`Complex solutions of the wave equation, $e^{i(kx - vkt)}$, do not spread at all. What matters is how $\omega$ depends on $k$.`,
        2: t`The uncertainty principle bounds $\Delta x\,\Delta p$ at one instant; it says nothing about growth. A packet can even narrow for a while (one that was focused) — the spreading is dispersion.`,
        3: t`Heat damps each $k$ by $e^{-Dk^2t}$. Here each $k$ only turns, by $e^{-i\hbar k^2t/2m}$: $|\hat\psi(k)|$ never changes, and nothing is lost.`,
      },
      hints: [t`Substitute $e^{i(kx - \omega t)}$ into each equation and compare $\omega(k)$.`, t`A packet keeps its shape only if all its wavenumbers travel at the same speed $\omega/k$.`],
      teach: t`A wave equation disperses whenever $\omega(k)$ is not proportional to $k$; Schrödinger’s gives $\omega \propto k^2$.`,
      explain: t`String: $\omega^2 = v^2k^2$, every $k$ moves at $v$. Schrödinger: $\omega = \hbar k^2/2m$, the short waves outrun the long ones and the packet spreads — reversibly, since no amplitude is lost.`,
    }),
    order({
      id: 'continuity', difficulty: 3,
      prompt: t`Show that probability is conserved locally, as energy was in [conservation laws for fields](#/lesson/phys3750.W9.2). Put the steps in order. (Here $i\hbar\psi_t = -\tfrac{\hbar^2}{2m}\psi_{xx} + V\psi$ with $V$ real.)`,
      visual: packet(t`A packet’s real part and envelope $|\psi|$: probability flows with it, never jumping (dimensionless units).`, 4),
      items: [
        t`Let $\rho = \psi^*\psi$, so $\rho_t = \psi^*\psi_t + \psi\psi^*_t$`,
        t`Substitute $\psi_t = \tfrac{i\hbar}{2m}\psi_{xx} - \tfrac{i}{\hbar}V\psi$ and its conjugate`,
        t`The $V$ terms cancel: $\rho_t = \tfrac{i\hbar}{2m}(\psi^*\psi_{xx} - \psi\psi^*_{xx})$`,
        t`Write $\psi^*\psi_{xx} - \psi\psi^*_{xx} = \partial_x(\psi^*\psi_x - \psi\psi^*_x)$`,
        t`With $j = \tfrac{\hbar}{m}\,\text{Im}(\psi^*\psi_x)$: $\rho_t + j_x = 0$`,
      ],
      hints: ['Start from the density, differentiate it in time, then use the equation of motion.', t`The cross terms $\psi^*_x\psi_x$ cancel when you differentiate $\psi^*\psi_x - \psi\psi^*_x$.`],
      teach: t`The Schrödinger equation conserves probability locally: a density $|\psi|^2$ and a current $j$, as for energy on a string.`,
      explain: t`$\tfrac{i\hbar}{2m}\partial_x(\psi^*\psi_x - \psi\psi^*_x) = \tfrac{i\hbar}{2m}\partial_x\big(2i\,\text{Im}\,\psi^*\psi_x\big) = -\partial_xj$. The potential drops out only because it is real — an imaginary potential is how physicists model absorption, a sink. See [probability current](#/lesson/phys4700.M2.2) for more.`,
    }),
    num({
      id: 'beam-current', difficulty: 3,
      gen(r) {
        const K = r.pick([0.2, 0.5, 1, 2]), n = r.pick([2, 5, 8]) * 1e13;
        const v = Math.sqrt((2 * K * 1000 * QE) / ME), j = n * v, J = QE * j;
        return {
          prompt: t`A beam of ${K} keV electrons is described by a plane wave $\psi = \sqrt{n}\,e^{i(kx - \omega t)}$, normalised so that $|\psi|^2 = n = ${tn(n)}$ electrons per m³. Using $j = \tfrac{\hbar}{m}\,\text{Im}(\psi^*\psi_x)$, find the electric current density $J = e\,j$ the beam carries, in A/m². (Non-relativistic.)`,
          visual: curvesPic([{ fn: 'cos(4*x)', color: 'accent', width: 1.8, label: 'Re ψ', labelAt: 0.2, labelDy: -6 }, { fn: '1.25', color: 'gold', width: 2.2, label: '|ψ|² (uniform)', labelAt: 4.4, labelDy: -8 }], [0, 6], [-1.4, 1.8], t`A plane wave (relative units): the density is the same everywhere, and the current carries it along $+x$.`, { xlabel: 'x', ylabel: '', arrows: [{ from: [4.6, 1.55], to: [5.8, 1.55], color: 'gold', label: 'j' }] }),
          answer: J, units: 'A/m^2', tol: { rel: 0.01 },
          errors: [{ value: J / 2, feedback: t`That uses the phase velocity. $\psi^*\psi_x = ik\,n$, so $j = \hbar kn/m = nv$: the density moves at the group velocity.` }, { value: j, feedback: 'That is the particle flux per m² per second; multiply by the electron charge to get amperes per m².' }],
          hints: [t`For $\psi = \sqrt n\,e^{i(kx - \omega t)}$, $\psi^*\psi_x = ikn$.`, t`So $j = \hbar kn/m = nv$ with $v = \sqrt{2K/m_e}$; then $J = ej$.`],
          teach: t`A plane wave’s probability current is density times group velocity: $j = n\hbar k/m = nv$.`,
          explain: t`$v = ${tn(v)}$ m/s, $j = nv = ${tn(j)}$ m⁻² s⁻¹, $J = ej = ${tn(J)}$ A/m². It is the classical $J = nev$ — the probability current is the particle flux.`,
        };
      },
    }),
    num({
      id: 'spread-time', difficulty: 3,
      gen(r) {
        const [what, m, s0, s0T] = r.pick([['an electron', ME, 1e-9, '1 nm'], ['a C₆₀ fullerene molecule (720 u)', 720 * U, 1e-8, '10 nm'], ['a dust grain of mass $10^{-15}$ kg', 1e-15, 1e-9, '1 nm']]);
        const tau = (2 * m * s0 * s0) / HBAR, t2 = Math.sqrt(3) * tau;
        return {
          prompt: t`A free Gaussian packet of initial width $\sigma_0$ spreads as $\sigma(t) = \sigma_0\sqrt{1 + (t/\tau)^2}$ with $\tau = 2m\sigma_0^2/\hbar$. How long does it take ${what} prepared with $\sigma_0 =$ ${s0T} to double its width, in seconds?`,
          visual: curvesPic([{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.4 }, { fn: '2', color: 'ink3', dash: [5, 4], width: 1.2 }], [0, 3], [0, 3.2], t`Width in units of $\sigma_0$ against time in units of $\tau$: flat at first, then growing linearly.`, { xlabel: 't / τ', ylabel: 'σ / σ₀' }),
          answer: t2, units: 's', tol: { rel: 0.01 },
          errors: [{ value: tau, feedback: t`At $t = \tau$ the width is only $\sqrt2\,\sigma_0$. Doubling needs $1 + (t/\tau)^2 = 4$.` }, { value: 3 * tau, feedback: t`Solve $\sqrt{1 + (t/\tau)^2} = 2$: $t = \sqrt3\,\tau$, not $3\tau$.` }],
          hints: [t`Set $\sigma = 2\sigma_0$: $1 + (t/\tau)^2 = 4$.`, t`$t = \sqrt3\,\tau = \sqrt3\cdot2m\sigma_0^2/\hbar$.`],
          teach: t`Spreading time scales as $m\sigma_0^2/\hbar$: light, tightly localised things spread fast; heavy ones hardly at all.`,
          explain: t`$\tau = ${tn(tau)}$ s, so $t = \sqrt3\,\tau = ${tn(t2)}$ s. An electron localised to a nanometre doubles in femtoseconds; the far heavier objects take microseconds or longer — one reason everyday objects never show their wave nature.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gravimeter', difficulty: 3, transfer: true,
      gen(r) {
        const s0 = r.pick([0.5, 1, 2]), m = 86.909 * U;
        const tau = (2 * m * (s0 * 1e-6) ** 2) / HBAR, t2 = Math.sqrt(3) * tau;
        return {
          prompt: t`Cold-atom gravimeters — flown on aircraft and proposed for satellites that map Earth’s gravity — drop clouds of rubidium-87 atoms (86.909 u, $1\ \text{u} = 1.6605\times10^{-27}$ kg). Treat one atom as a free Gaussian packet of initial width $\sigma_0 = ${s0}\ \mu\text{m}$, spreading as $\sigma = \sigma_0\sqrt{1 + (t/\tau)^2}$ with $\tau = 2m\sigma_0^2/\hbar$. After how many seconds has its width doubled?`,
          visual: packet(t`A free packet some time after release: wider, lower, crests still inside (dimensionless units, not the atom’s scale).`, 8),
          answer: t2, units: 's', tol: { rel: 0.01 },
          errors: [{ value: tau, feedback: t`That is when $\sigma = \sqrt2\,\sigma_0$. Doubling needs $t = \sqrt3\,\tau$.` }, { value: Math.sqrt(3) * tau * 1e12, feedback: t`Convert $\sigma_0$ to metres before squaring: $1\ \mu\text{m} = 10^{-6}$ m.` }],
          hints: [t`$m = 86.909 \times 1.6605\times10^{-27}$ kg and $\sigma_0 = ${s0}\times10^{-6}$ m.`, t`Doubling: $t = \sqrt3\,\tau$.`],
          teach: t`The spreading time $2m\sigma_0^2/\hbar$ grows with mass and the square of the initial width.`,
          explain: t`$\tau = ${tn(tau)}$ s and $t = \sqrt3\,\tau = ${tn(t2)}$ s. A gravimeter’s drop lasts a fraction of a second — many times $\tau$ — so even a single atom’s packet ends up tens to hundreds of times wider than it started; the cloud as a whole spreads faster still, because of its temperature — a velocity spread this model leaves out.`,
        };
      },
    }),
    mcq({
      id: 'cp-rest-energy', difficulty: 3,
      prompt: t`Relativity says a free particle’s energy includes its rest energy, so perhaps $\hbar\omega = mc^2 + \dfrac{\hbar^2k^2}{2m}$ is the better dispersion relation. Compared with $\hbar\omega = \hbar^2k^2/2m$, what changes?`,
      visual: curvesPic([{ fn: 'x^2/2', color: 'accent', width: 2.2 }, { fn: 'x^2/2 + 2.4', color: 'gold', width: 2.2, dash: [6, 4] }, { fn: '1.5*(x - 1.5) + 1.125', color: 'ink3', width: 1.2, dash: [3, 3], domain: [0.8, 2.3] }, { fn: '1.5*(x - 1.5) + 3.525', color: 'ink3', width: 1.2, dash: [3, 3], domain: [0.8, 2.3] }], [0, 3.2], [0, 6.5], t`The curve with and without a constant added (gold, dashed), with the tangents at one $k$ (grey). Illustrative units; the real $mc^2$ is enormous on this scale.`, { xlabel: 'k', ylabel: 'ω' }),
      choices: [
        t`Only the phase velocity: it becomes about $c^2/v$, faster than light, while $v_g$, $|\psi|^2$ and every measurement stay the same`,
        t`The group velocity rises by about $c$, so the particle should move faster than light`,
        t`The packet spreads faster, because the rest energy adds to every wavenumber’s frequency`,
        t`Nothing at all: the zero of energy is a convention, so no speed of any kind can depend on it`,
      ],
      answer: 0,
      why: {
        1: t`A constant does not change a slope: $v_g = d\omega/dk$ is still $\hbar k/m$.`,
        2: t`Spreading comes from differences between wavenumbers’ frequencies; adding the same constant to all of them changes none of the differences.`,
        3: t`$v_p = \omega/k$ does depend on $\omega$’s constant: the chord from the origin steepens enormously.`,
      },
      hints: [t`Which of $\omega/k$ and $d\omega/dk$ notices a constant added to $\omega$?`, t`A constant multiplies $\psi$ by $e^{-i\,mc^2t/\hbar}$. What does that do to $|\psi|^2$?`],
      teach: t`The zero of energy shifts $\omega$ and so the phase velocity, but nothing observable: only $v_g$ is physical.`,
      explain: t`$v_p = mc^2/\hbar k + \hbar k/2m \approx c^2/v$, while $v_g$ and all differences of frequencies are unchanged. The common factor $e^{-imc^2t/\hbar}$ drops out of $|\psi|^2$. (Relativistic quantum mechanics uses $\omega = \sqrt{m^2c^4/\hbar^2 + c^2k^2}$, which gives the same slope at low speed.)`,
    }),
    num({
      id: 'cp-neutron-tof', difficulty: 3, transfer: true,
      gen(r) {
        const [E, label] = r.pick([[5, 'cold'], [25.3, 'thermal'], [80, 'warm']]), L = r.pick([8, 12, 20]);
        const v = Math.sqrt((2 * E * 1e-3 * QE) / MN), tt = L / v;
        return {
          prompt: t`At a neutron source, a chopper releases a short burst of ${label} neutrons of energy ${E} meV, and a detector ${L} m away records when they arrive. Treating each neutron as a free packet, how long after the burst does the signal arrive, in ms? ($m_n = 1.6749\times10^{-27}$ kg.)`,
          visual: dispPic(1.2, t`Each neutron’s packet rides the tangent, not the chord (units with $\hbar = m = 1$).`, { labels: false }),
          answer: tt * 1000, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: 2 * tt * 1000, feedback: t`That times the crests, at $v_p = v/2$. The packet — the neutron — arrives at $v_g = v$.` }],
          hints: [t`The neutron’s packet moves at $v_g = \hbar k/m = \sqrt{2E/m_n}$.`, t`$E = ${E}\times10^{-3}\times1.602\times10^{-19}$ J; time $= L/v_g$.`],
          teach: t`Time-of-flight instruments measure the group velocity, which is the particle’s speed $p/m$.`,
          explain: t`$v_g = \sqrt{2E/m_n} = ${tn(v)}$ m/s, so $t = ${L}/${tn(v)} = ${tn(tt * 1000)}$ ms. Since $\lambda = h/m_nv$, timing the arrival gives every neutron’s wavelength — the principle of time-of-flight diffractometers.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 15: The Schrödinger equation (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/8/' },
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §2.4: the free particle', url: 'https://doi.org/10.1017/9781316995433' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
