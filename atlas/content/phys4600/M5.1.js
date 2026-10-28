// Electric dipole radiation (Griffiths §11.1.2). A point dipole p₀ cos ωt
// under the three approximations d ≪ λ ≪ r: the far fields
// E = −(μ₀p₀ω²/4π)(sin θ/r)cos[ω(t − r/c)] θ̂, B = E/c φ̂, the intensity
// ⟨S⟩ = (μ₀p₀²ω⁴/32π²c) sin²θ/r² (the doughnut: nothing along the axis) and
// the power ⟨P⟩ = μ₀p₀²ω⁴/12πc (ω⁴: the blue sky). Explore: the new
// em4c-dipole sim (exact field lines pinching off into loops, the zones, the
// sin²θ pattern against a half-wave antenna's). Worked example: a short
// antenna's power and radiation resistance (Griffiths's 789 (d/λ)² Ω).
// Twist: at fixed current a short antenna's power grows as ω², not ω⁴.
// Transfers: a CubeSat's half-wave UHF antenna (73 Ω), Rayleigh's sky, and a
// satellite whose radial dipole is deaf straight below it.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, C, PI, DEG, sf, dipoleP, rShort, R_HALF, dipolePic, patternPic } from './_em4c.js';

const t = String.raw;

// the worked example: a 0.5 m antenna at 30 MHz carrying a 2 A current amplitude along its length
const EX = { d: 0.5, f: 30e6, I: 2, r: 10e3 };
EX.w = 2 * PI * EX.f;
EX.lam = C / EX.f;
EX.p0 = (EX.I * EX.d) / EX.w;
EX.P = dipoleP(EX.p0, EX.w);
EX.R = (2 * EX.P) / EX.I ** 2;
EX.Rf = rShort(EX.d / EX.lam);
EX.S = (3 * EX.P) / (8 * PI * EX.r ** 2);
if (Math.abs(EX.R / EX.Rf - 1) > 1e-9) throw new Error('M5.1: radiation resistance two ways');

/** A vertical dipole at the origin with receivers at the given angles from its axis (graph). */
function geoPic(caption, spots) {
  return {
    type: 'graph',
    params: {
      x: [-1.6, 1.6], y: [-1.25, 1.25], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      curves: [{ param: ['0', 't'], t: [-1.2, 1.2], color: 'ink4', width: 1, dash: [3, 4] }, { param: ['0', 't'], t: [-0.12, 0.12], color: 'ink2', width: 3 }],
      points: [
        { x: 0, y: 0.12, r: 4, color: 'warn' }, { x: 0, y: -0.12, r: 4, color: 'accent' },
        { x: 0, y: 1.15, r: 0, label: 'dipole axis', color: 'ink3', labelDx: 6, labelDy: 0 },
        ...spots.map(([deg, label]) => ({ x: +(Math.sin(deg * DEG)).toFixed(4), y: +(Math.cos(deg * DEG)).toFixed(4), r: 5, color: 'good', label, labelDx: 9, labelDy: -9 })),
      ],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4600.M5.1',
  title: 'Electric dipole radiation',
  minutes: 18, difficulty: 3,
  equation: t`\begin{gathered}\langle\vec S\rangle = \frac{\mu_0p_0^2\omega^4}{32\pi^2c}\,\frac{\sin^2\theta}{r^2}\,\hat r, \\ \langle P\rangle = \frac{\mu_0p_0^2\omega^4}{12\pi c}\end{gathered}`,
  intro: t`Let the charge on two tiny spheres slosh back and forth along a wire: $q(t) = q_0\cos\omega t$ on the top one, $-q(t)$ on the bottom, a distance $d$ apart. That is an **oscillating electric dipole**, $p(t) = p_0\cos\omega t$ with $p_0 = q_0d$. Feed the retarded potentials of [M4.3](#/lesson/phys4600.M4.3) three approximations — the source is small compared with the wavelength ($d \ll \lambda$) and with the distance ($d \ll r$), and you look from far away ($r \gg \lambda$) — and what survives is a pair of fields that fall as $1/r$, at right angles, in phase, with $B = E/c$. Their energy flux falls as $1/r^2$, so the same power crosses every large sphere: **radiation**. The flux goes as $\sin^2\theta$ — a doughnut, with **nothing at all along the axis** — and the total power as $\omega^4$.`,
  symbols: [
    { tex: 'p_0', text: t`the amplitude of the dipole moment, $q_0d$, in $\text{C·m}$` },
    { tex: '\\omega', text: 'the angular frequency of the oscillation, in rad/s' },
    { tex: '\\theta', text: 'the angle between the dipole’s axis and the direction you look in' },
    { tex: 'r', text: 'the distance from the dipole, in m (far: r ≫ λ)' },
    { tex: '\\langle\\vec S\\rangle', text: t`the Poynting vector averaged over a cycle — the intensity — in $\text{W/m}^2$` },
    { tex: '\\langle P\\rangle', text: 'the total power radiated, averaged over a cycle, in W' },
    { tex: '\\mu_0,\\ c', text: t`the permeability of free space ($1.257\times10^{-6}$ N/A²) and the speed of light` },
  ],
  why: t`Every antenna, from a phone’s to a deep-space transmitter’s, is a dipole or a sum of them; the $\omega^4$ makes the sky blue; and gravitational waves are the next term up — quadrupole radiation, [the quadrupole formula](#/lesson/gr.EQ.13).`,
  visual: {
    type: 'em4c-dipole',
    title: 'Field lines breaking free',
    lead: t`The exact electric field lines of a point dipole oscillating as $\cos\omega t$ (vertical, at the centre), in a plane through its axis, and below them the power radiated in each direction. Press Play and watch the lines: near the dipole they stretch out and snap back like a static dipole’s; every half cycle a set of them **pinches off into closed loops** that travel outward at $c$ and never come back.`,
    tasks: [
      t`Zoom in to a fraction of a wavelength: inside the dashed circle $r = \lambda/2\pi$ the field is the static dipole’s, rising and falling in step with the charges. Zoom out: beyond it, detached loops — radiation.`,
      t`Look straight up the axis: the loops never reach it. The pattern below confirms it: $\sin^2\theta$ is zero along the axis and largest at the equator.`,
      t`Switch the pattern to “both”: a half-wave antenna, as long as half a wavelength, beams slightly more toward the equator than a point dipole, but not by much.`,
    ],
    params: { phase: 60, view: 1.5, pattern: 'short', patterns: ['short', 'half', 'both'], controls: ['phase', 'view', 'pattern'] },
    caption: t`Exact fields of a point dipole (size $\ll\lambda$) in a plane through its axis; the picture is the same in every such plane. The lines are level curves of a flux function and their spacing is only a rough guide to strength. The polar pattern is the cycle-averaged power per solid angle, scaled so its largest value is 1.`,
  },
  example: {
    prompt: t`A short antenna ${EX.d} m long is driven at ${EX.f / 1e6} MHz, with a current amplitude of ${EX.I} A along its whole length (Griffiths’s model of a short antenna). How much power does it radiate, what is its radiation resistance, and what intensity reaches a receiver ${EX.r / 1e3} km away, broadside?`,
    visual: dipolePic({ phase: 30, view: 1, panels: ['lines'] }, t`A point dipole’s field lines at one instant: the antenna is far shorter than the wavelength, $d/\lambda \approx ${nice(sf(EX.d / EX.lam, 2))}$. Lengths in wavelengths.`),
    steps: [
      { label: 'The dipole moment', text: t`The current $I = dq/dt$ charges the ends: $q(t) = (I_0/\omega)\sin\omega t$, so $p_0 = q_0d = I_0d/\omega$. With $\omega = 2\pi f = ${tex(EX.w, 4)}$ rad/s, $p_0 = ${tex(EX.p0, 3)}\ \text{C·m}$.` },
      { label: 'Check the approximations', text: t`$\lambda = c/f = ${nice(sf(EX.lam, 4))}$ m, so $d/\lambda \approx ${nice(sf(EX.d / EX.lam, 2))} \ll 1$ ✓, and ${EX.r / 1e3} km is a thousand wavelengths away ✓.` },
      { label: 'Power', text: t`$\langle P\rangle = \dfrac{\mu_0p_0^2\omega^4}{12\pi c} = ${nice(sf(EX.P, 3))}$ W.` },
      { label: 'Radiation resistance', text: t`Write it as $\langle P\rangle = \tfrac12I_0^2R$: $R = 2\langle P\rangle/I_0^2 = ${nice(sf(EX.R, 3))}\ \Omega$. In general $R = \dfrac{2\pi}{3}\sqrt{\dfrac{\mu_0}{\varepsilon_0}}\left(\dfrac d\lambda\right)^2 \approx 789\left(\dfrac d\lambda\right)^2\ \Omega$.` },
      { label: 'Intensity', text: t`Broadside, $\theta = 90^\circ$: $\langle S\rangle = \dfrac{\mu_0p_0^2\omega^4}{32\pi^2c\,r^2} = \dfrac{3\langle P\rangle}{8\pi r^2} \approx ${tex(EX.S, 3)}\ \text{W/m}^2$ — 1.5 times what the same power spread evenly over the sphere would give.` },
      { label: 'Sense check', text: t`A resistance of about 2 Ω is tiny next to the wires and the transmitter’s output: most of the power would be wasted as heat. **Short antennas are poor radiators**, because $R \propto (d/\lambda)^2$; that is why real antennas are made about half a wavelength long.` },
    ],
    answer: t`$\langle P\rangle \approx ${nice(sf(EX.P, 3))}$ W, $R \approx ${nice(sf(EX.R, 3))}\ \Omega$, and $\langle S\rangle \approx ${tex(EX.S, 3)}\ \text{W/m}^2$ broadside at ${EX.r / 1e3} km.`,
  },
  practice: [
    mcq({
      id: 'deaf-spot', difficulty: 1,
      prompt: t`Four receivers sit at the same distance (many wavelengths) from a vertical oscillating dipole, at the angles shown. Which receives **no** signal at all?`,
      visual: geoPic('A vertical dipole (centre) and four receivers at the same distance, at 0°, 30°, 60° and 90° from its axis. Not to scale: the receivers are many wavelengths away.', [[0, '1'], [30, '2'], [60, '3'], [90, '4']]),
      choices: ['Receiver 1, straight along the dipole’s axis', 'Receiver 4, at right angles to the axis', 'Receiver 2, 30° from the axis', 'None: a dipole radiates equally in all directions'],
      answer: 0,
      why: {
        1: t`Broadside is where the dipole radiates **most**: $\sin^2 90^\circ = 1$.`,
        2: t`At 30° the intensity is $\sin^2 30^\circ = 1/4$ of the maximum — weak, but not zero.`,
        3: t`The pattern is $\sin^2\theta$, a doughnut around the axis, not a sphere.`,
      },
      hints: [t`The radiation field is $\propto\sin\theta$, with $\theta$ measured from the axis.`, 'Charges sloshing up and down accelerate along the axis; seen from straight above, that motion has no sideways part.'],
      teach: 'A dipole radiates most at right angles to its axis and nothing at all along it.',
      explain: t`$\langle S\rangle \propto \sin^2\theta$: zero at $\theta = 0$, the axis. Seen end-on, the charges move straight toward and away from you, and only the motion **across** the line of sight radiates.`,
    }),
    num({
      id: 'ratio-theta', difficulty: 2,
      gen(r) {
        const th = r.pick([20, 30, 40, 50, 60, 70]), k = r.pick([1, 2, 3]);
        const ans = Math.sin(th * DEG) ** 2 / (k * k);
        const errs = [
          { value: Math.sin(th * DEG) / (k * k), feedback: t`$\sin\theta$ is how the **field** varies; the intensity goes as the field squared, $\sin^2\theta$.` },
          { value: Math.cos(th * DEG) ** 2 / (k * k), feedback: t`$\theta$ is measured from the dipole’s **axis**, not from the equator.` },
          { value: Math.sin(th * DEG) ** 2 / k, feedback: t`The intensity falls as $1/r^2$; it is the field that falls as $1/r$.` },
        ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans);
        return {
          prompt: k === 1
            ? t`A receiver sits at $${th}^\circ$ from an oscillating dipole’s axis. What fraction of the intensity it would get broadside (at the same distance) does it receive?`
            : t`Receiver P is broadside to an oscillating dipole at distance $r$. Receiver Q is $${k}r$ away, at $${th}^\circ$ from the dipole’s axis. What is Q’s intensity as a fraction of P’s?`,
          visual: patternPic(t`The radiation pattern $\sin^2\theta$ about the dipole’s axis (vertical), with the direction toward ${k === 1 ? 'the receiver' : 'Q'} at $${th}^\circ$.`, { rays: [{ deg: th, label: k === 1 ? 'receiver' : 'Q', color: 'accent' }, ...(k === 1 ? [] : [{ deg: 90, label: 'P', color: 'good' }])] }),
          answer: ans, tol: { rel: 0.01 },
          errors: errs,
          hints: [t`$\langle S\rangle \propto \sin^2\theta/r^2$.`, t`Divide: $\dfrac{S_Q}{S_P} = \dfrac{\sin^2${th}^\circ}{\sin^2 90^\circ}\left(\dfrac{r}{${k}r}\right)^2$.`],
          teach: 'Dipole intensity goes as sin²θ/r²: θ from the axis, and the square of the distance.',
          explain: t`$\sin^2${th}^\circ = ${nice(sf(Math.sin(th * DEG) ** 2, 4))}$${k === 1 ? '' : t`, divided by $${k}^2 = ${k * k}$`}: $${nice(sf(ans, 3))}$.`,
        };
      },
    }),
    num({
      id: 'S-from-P', difficulty: 2,
      gen(r) {
        const P = r.pick([5, 20, 100, 500]), rk = r.pick([2, 5, 10, 50]);
        const S = (3 * P) / (8 * PI * (rk * 1e3) ** 2);
        return {
          prompt: t`A small dipole antenna radiates a total of ${P} W. What is the intensity broadside to it, ${rk} km away? Give it in $\mu\text{W/m}^2$.`,
          visual: patternPic(t`The $\sin^2\theta$ pattern: the broadside direction (arrow) gets more than the average over all directions.`, { rays: [{ deg: 90, label: 'broadside', color: 'accent' }] }),
          answer: S * 1e6, units: 'uW/m^2', tol: { rel: 0.01 },
          errors: [{ value: (P / (4 * PI * (rk * 1e3) ** 2)) * 1e6, feedback: t`That spreads the power evenly over the sphere. The dipole puts more broadside: $\langle S\rangle = \dfrac{3\langle P\rangle}{8\pi r^2}\sin^2\theta$, 1.5 times the average there.` }],
          hints: [t`Write $\langle S\rangle = A\sin^2\theta/r^2$ and fix $A$ so that $\oint\langle S\rangle\,da = \langle P\rangle$.`, t`$\int_0^\pi\sin^2\theta\cdot2\pi\sin\theta\,d\theta = 8\pi/3$, so $A = 3\langle P\rangle/8\pi$.`],
          teach: 'Broadside, a dipole’s intensity is 3P/8πr² — 1.5 times the isotropic value P/4πr².',
          explain: t`$\langle S\rangle = \dfrac{3\langle P\rangle}{8\pi r^2} = \dfrac{3 \times ${P}}{8\pi\,(${rk * 1e3}\ \text{m})^2} \approx ${nice(sf(S * 1e6, 3))}\ \mu\text{W/m}^2$. The ratio $(3/8\pi)/(1/4\pi) = 1.5$ is the dipole’s **directivity** (1.76 dB).`,
        };
      },
    }),
    num({
      id: 'omega4', difficulty: 2,
      gen(r) {
        const f1 = r.pick([100, 200, 300]), m = r.pick([1.5, 2, 3, 5]), f2 = f1 * m;
        return {
          prompt: t`An oscillating dipole of fixed amplitude $p_0$ radiates at ${f1} MHz. The same $p_0$ is driven at ${f2} MHz instead. By what factor does the radiated power change?`,
          visual: { type: 'graph', params: { x: [0, 1.15 * f2], y: [0, 1.15 * m ** 4], aspect: 'wide', axesAt: 'edge', xlabel: 'frequency (MHz)', ylabel: 'power ÷ power at f₁', yticks: 4, curves: [{ fn: `(x/${f1})^4`, domain: [0, 1.15 * f2], color: 'gold', width: 2.4 }], points: [{ x: f1, y: 1, r: 5, color: 'accent', label: 'f₁', labelDx: -6, labelDy: -12 }], vlines: [{ x: f2, label: 'f₂', color: 'ink3' }] }, caption: t`Power of a dipole of fixed amplitude against frequency (gold): it rises steeply. The value at $f_2$ is the question.` },
          answer: m ** 4, tol: { rel: 0.005 },
          errors: [{ value: m * m, feedback: t`The **field** grows as $\omega^2$ (it is set by the acceleration of the charges); the power goes as the field squared, $\omega^4$.` }, { value: m, feedback: t`Power goes as $\omega^4$, not $\omega$.` }],
          hints: [t`$\langle P\rangle \propto p_0^2\omega^4$.`, t`Ratio $= (f_2/f_1)^4 = ${m}^4$.`],
          teach: 'At fixed dipole amplitude the radiated power goes as ω⁴.',
          explain: t`$(${f2}/${f1})^4 = ${m}^4 = ${nice(m ** 4)}$. The charges’ acceleration is $\omega^2$ times their displacement, the radiation field is proportional to that acceleration, and the power to its square.`,
        };
      },
    }),
    num({
      id: 'R-short', difficulty: 2,
      gen(r) {
        const d = r.pick([10, 20, 40, 60]), f = r.pick([20, 50, 100]);
        const x = (d * 1e-2) / (C / (f * 1e6)), R = rShort(x);
        return {
          prompt: t`A short antenna ${d} cm long, carrying the same current along its whole length, is driven at ${f} MHz. Using $R = 789\,(d/\lambda)^2\ \Omega$, what is its radiation resistance?`,
          visual: dipolePic({ phase: 0, view: 0.5, panels: ['lines'] }, 'The near zone of a short dipole antenna: most of the field close in is stored energy that comes back each cycle, not radiation. Lengths in wavelengths.'),
          answer: R, units: 'ohm', tol: { rel: 0.01 },
          errors: [{ value: 789 * x, feedback: t`Square the ratio: $R \propto (d/\lambda)^2$.` }, { value: 789 * ((d * 1e-2) / C * f * 1e6 * 2 * PI) ** 2, feedback: t`Use $\lambda = c/f$, not $c/\omega$.` }],
          hints: [t`$\lambda = c/f$.`, t`$R = 789\left(\dfrac{${d / 100}\ \text{m}}{\lambda}\right)^2\ \Omega$.`],
          teach: 'A short antenna’s radiation resistance grows as the square of its length in wavelengths.',
          explain: t`$\lambda = ${nice(sf(C / (f * 1e6), 4))}$ m, $d/\lambda = ${nice(sf(x, 3))}$, so $R \approx ${nice(sf(R, 3))}\ \Omega$. ${R < 5 ? 'A few ohms or less: hard to feed efficiently.' : 'Already a usable value as the antenna approaches half a wavelength — where this short-antenna formula stops being accurate.'}`,
        };
      },
    }),
    mcq({
      id: 'fixed-current', difficulty: 3,
      prompt: t`A short antenna of fixed length is driven with the **same current amplitude** $I_0$ at a higher frequency. How does its radiated power scale with $\omega$?`,
      visual: dipolePic({ phase: 90, view: 1, panels: ['lines'] }, t`A short antenna’s field lines at one instant. At a fixed current amplitude, the charge piling up at the ends each cycle is $I_0/\omega$. Lengths in wavelengths.`),
      choices: [t`As $\omega^2$: $p_0 = I_0d/\omega$ shrinks as $\omega$ grows`, t`As $\omega^4$, like every dipole`, t`It does not change: the current is the same`, t`As $\omega^6$`],
      answer: 0,
      why: {
        1: t`$\omega^4$ holds at fixed **dipole moment**. Here the current is fixed, and the charge that piles up each half cycle is only $I_0/\omega$.`,
        2: t`The radiation resistance $789(d/\lambda)^2$ grows with frequency, so the same current radiates more.`,
        3: t`The moment shrinks as $1/\omega$, which takes two powers of $\omega$ away, not adds them.`,
      },
      hints: [t`Find $p_0$ in terms of $I_0$: $q(t) = \int I\,dt$.`, t`$p_0 = I_0d/\omega$; put it into $\langle P\rangle \propto p_0^2\omega^4$.`],
      teach: 'ω⁴ is for a fixed dipole moment; a fixed current gives p₀ ∝ 1/ω and power ∝ ω² — the same as R ∝ (d/λ)².',
      explain: t`$\langle P\rangle \propto (I_0d/\omega)^2\omega^4 = I_0^2d^2\omega^2$, the same as $\tfrac12I_0^2R$ with $R \propto (d/\lambda)^2 \propto \omega^2$. Which law applies depends on what is held fixed: Rayleigh’s $\omega^4$ is for molecules whose dipole moment is set by the incoming field’s strength, not its frequency.`,
    }),
    mcq({
      id: 'far-fields', difficulty: 2,
      prompt: t`Far from an oscillating dipole ($r \gg \lambda$), which describes its fields?`,
      visual: dipolePic({ phase: 200, view: 2.4, panels: ['lines'], zones: false }, t`Electric field lines out to more than two wavelengths: closed loops travelling outward. Lengths in wavelengths.`),
      choices: [
        t`$\vec E$ and $\vec B$ at right angles to each other and to $\hat r$, in phase, with $B = E/c$, both falling as $1/r$`,
        t`$\vec E$ points along $\hat r$ and falls as $1/r^2$, like a Coulomb field`,
        t`$\vec E$ and $\vec B$ are $90^\circ$ out of phase, so no energy flows on average`,
        t`Both fall as $1/r^3$, like a static dipole’s field`,
      ],
      answer: 0,
      why: {
        1: t`The radial part of $\vec E$ falls as $1/r^2$ and $1/r^3$; far away only the transverse $1/r$ part is left.`,
        2: t`That is the **near** zone, where much of the energy sloshes back and forth. Far out, $\vec E$ and $\vec B$ are in phase and carry energy away.`,
        3: t`The $1/r^3$ static field dominates only at $r \ll \lambda/2\pi$.`,
      },
      hints: [t`Which part of the field can carry a fixed power through ever larger spheres?`, t`$\langle S\rangle \cdot 4\pi r^2$ stays finite only if $E \propto 1/r$.`],
      teach: 'Radiation fields are transverse, in phase, with B = E/c, and fall as 1/r — locally a plane wave.',
      explain: t`$\vec E = -\dfrac{\mu_0p_0\omega^2}{4\pi}\dfrac{\sin\theta}{r}\cos[\omega(t - r/c)]\,\hat\theta$ and $\vec B = (E/c)\,\hat\phi$: locally a plane wave moving outward, with $\vec S$ along $\hat r$.`,
    }),
    mcq({
      id: 'zones', difficulty: 3,
      prompt: t`The derivation uses three approximations: $d \ll r$, $d \ll \lambda$ and $r \gg \lambda$. Which one lets you drop the terms that fall as $1/r^2$ and $1/r^3$?`,
      visual: dipolePic({ phase: 140, view: 0.6, panels: ['lines'] }, t`Field lines within about half a wavelength: inside the dashed circle $r = \lambda/2\pi$ the field is nearly the static dipole’s. Lengths in wavelengths.`),
      choices: [t`$r \gg \lambda$: the radiation zone`, t`$d \ll \lambda$: the source is small compared with a wavelength`, t`$d \ll r$: the source looks like a point`, 'None: those terms are always negligible'],
      answer: 0,
      why: {
        1: t`$d \ll \lambda$ lets you ignore the difference in retarded time across the source, so it acts as one dipole. It says nothing about where you are.`,
        2: t`$d \ll r$ lets you expand $|\vec r - \vec r'|$ to first order; it is the multipole approximation, not the far-field one.`,
        3: t`Close to the dipole ($r < \lambda/2\pi$) the $1/r^3$ term dominates — the quasi-static dipole field.`,
      },
      hints: [t`Compare $1/r$ with $1/r^2$: their ratio involves $r$ and what other length?`, t`The terms come in powers of $1/(kr) = \lambda/2\pi r$.`],
      teach: 'The near-field terms are smaller by powers of λ/2πr: only far out, r ≫ λ, is the field pure radiation.',
      explain: t`The exact fields carry $1/kr$, $1/(kr)^2$ and $1/(kr)^3$ with $k = 2\pi/\lambda$. Far out only the first survives: that is the radiation zone. Close in, the $1/(kr)^3$ term — the static dipole field — wins.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cubesat', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([145.8, 437.2, 435.0]), P = r.pick([0.5, 1, 2]);
        const I = Math.sqrt((2 * P) / R_HALF);
        return {
          prompt: t`A CubeSat’s beacon feeds ${P} W into a half-wave dipole at ${f} MHz. A thin half-wave antenna in free space has a radiation resistance of $${nice(sf(R_HALF, 3))}\ \Omega$. Assuming all the power is radiated, what is the current amplitude at the antenna’s centre, in mA?`,
          visual: patternPic(t`The half-wave antenna’s pattern (gold), $[\cos(\tfrac\pi2\cos\theta)/\sin\theta]^2$, against a point dipole’s $\sin^2\theta$ (dashed). The antenna lies along the axis.`, { fn: 'cos(pi/2*cos(t))^2/max(sin(t)^2, 1e-9)', second: { fn: 'sin(t)^2', color: 'accent' } }),
          answer: I * 1e3, units: 'mA', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(P / R_HALF) * 1e3, feedback: t`That is the rms current. The amplitude obeys $\langle P\rangle = \tfrac12I_0^2R$.` }, { value: (P / R_HALF) * 1e3, feedback: t`Solve $\tfrac12I_0^2R = \langle P\rangle$ for $I_0$: a square root.` }],
          hints: [t`$\langle P\rangle = \tfrac12I_0^2R$.`, t`$I_0 = \sqrt{2\langle P\rangle/R}$.`],
          teach: 'Radiation resistance turns radiated power into a circuit quantity: P = ½I₀²R.',
          explain: t`$I_0 = \sqrt{2 \times ${P}/${nice(sf(R_HALF, 3))}} \approx ${nice(sf(I * 1e3, 3))}$ mA. The antenna is $\lambda/2 = ${nice(sf(C / (f * 1e6) / 2 * 100, 3))}$ cm long. The 73 Ω comes from integrating the antenna’s sinusoidal current over its length, not from the point-dipole formula; real antennas near a spacecraft’s body differ by a few ohms.`,
        };
      },
    }),
    num({
      id: 'cp-sky', difficulty: 2, transfer: true,
      gen(r) {
        const [b, bn] = r.pick([[450, 'blue'], [470, 'blue'], [400, 'violet']]), [rd, rn] = r.pick([[650, 'red'], [700, 'deep red'], [600, 'orange']]);
        const ans = (rd / b) ** 4;
        return {
          prompt: t`Air molecules are dipoles driven by sunlight, far below their resonance, so their induced moment barely depends on frequency. How many times more strongly do they scatter ${bn} light (${b} nm) than ${rn} light (${rd} nm)?`,
          visual: { type: 'graph', params: { x: [380, 720], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'wavelength (nm)', ylabel: 'scattering (relative)', yticks: 3, curves: [{ fn: '(380/x)^4', domain: [380, 720], color: 'accent', width: 2.4 }], vlines: [{ x: b, label: bn, color: 'accent' }, { x: rd, label: rn, color: 'bad' }] }, caption: t`Rayleigh scattering $\propto 1/\lambda^4$, relative to its value at 380 nm. The ratio at the two marked wavelengths is the question.` },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (rd / b) ** 2, feedback: t`Power, not amplitude: $\langle P\rangle \propto \omega^4 \propto 1/\lambda^4$.` }, { value: rd / b, feedback: t`The scattered power goes as the fourth power of the frequency.` }],
          hints: [t`$\langle P\rangle \propto p_0^2\omega^4$ with $p_0$ fixed.`, t`$\omega \propto 1/\lambda$: ratio $= (\lambda_{\text{red}}/\lambda_{\text{blue}})^4$.`],
          teach: 'Rayleigh scattering is dipole radiation: ∝ ω⁴, so short wavelengths scatter far more.',
          explain: t`$(${rd}/${b})^4 \approx ${nice(sf(ans, 3))}$. Scattered blue fills the sky; at sunset the long path through air strips the blue from the direct beam and leaves it red. (The sky is not violet because the Sun gives less violet, some is absorbed high up, and the eye is less sensitive to it.)`,
        };
      },
    }),
    mcq({
      id: 'cp-overhead', difficulty: 3, transfer: true,
      prompt: t`A satellite carries a short dipole antenna pointing straight down at the Earth’s centre. A ground station tracks it from horizon to horizon. When is the signal weakest?`,
      visual: geoPic('The satellite’s dipole (centre) points along the vertical dashed line toward the ground; the receivers are ground stations seeing the satellite from different angles. Not to scale.', [[180, 'overhead'], [135, ''], [100, 'near horizon']]),
      choices: ['When the satellite is directly overhead', 'When it is near the horizon', 'The signal is the same throughout; only the distance matters', 'When it is at 45° elevation'],
      answer: 0,
      why: {
        1: t`Near the horizon the station sees the dipole nearly side-on — close to its strongest direction (though it is also farther away).`,
        2: t`The pattern $\sin^2\theta$ matters as much as the $1/r^2$: straight down the axis it is zero, however close.`,
        3: t`At 45° elevation the station is well off the axis and receives a healthy signal.`,
      },
      hints: [t`Where does the station sit relative to the antenna’s axis when the satellite is overhead?`, t`$\langle S\rangle \propto \sin^2\theta$, $\theta$ from the axis.`],
      teach: 'A dipole is deaf along its own axis: a nadir-pointing dipole cannot be heard straight below.',
      explain: t`Overhead, the station is on the antenna’s axis, $\theta = 180^\circ$, where $\sin^2\theta = 0$: a null, even though the satellite is closest. Real spacecraft avoid this with turnstile (crossed-dipole) or patch antennas that fill the nadir in.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §11.1.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Balanis, Antenna Theory (4th ed.), §4.6: the half-wavelength dipole (Rᵣ ≈ 73 Ω)', url: 'https://www.wiley.com/en-us/Antenna+Theory%3A+Analysis+and+Design%2C+4th+Edition-p-9781118642061' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
