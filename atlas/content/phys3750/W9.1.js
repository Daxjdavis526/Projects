// Energy density and flux on a string: e = ½μy_t² + ½Ty_x² and the power
// crossing a point, S = −T y_t y_x (the left part's transverse force times
// the velocity). A travelling wave splits its energy equally and carries it at
// v (S = v e); a harmonic wave carries ½Zω²A² with impedance Z = √(Tμ).
// Standing waves: all-kinetic at zero displacement, no flux through nodes.
// At a junction of two strings, r = (Z₁ − Z₂)/(Z₁ + Z₂), τ = 2Z₁/(Z₁ + Z₂),
// and the powers split as r² and 4Z₁Z₂/(Z₁ + Z₂)². New sim: wv2-junction.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;

// the worked example: a steel cable spliced to a light synthetic rope
const EX = (() => {
  const T = 500, mu1 = 0.8, mu2 = 0.05, f = 5, A = 0.02;
  const Z1 = Math.sqrt(T * mu1), Z2 = Math.sqrt(T * mu2), w = 2 * Math.PI * f;
  const P = 0.5 * Z1 * w * w * A * A, r = (Z1 - Z2) / (Z1 + Z2), tau = (2 * Z1) / (Z1 + Z2);
  const R = r * r, Tr = (4 * Z1 * Z2) / (Z1 + Z2) ** 2, At = tau * A, Pt = 0.5 * Z2 * w * w * At * At;
  return { T, mu1, mu2, f, A, Z1, Z2, w, P, r, tau, R, Tr, At, Pt, v1: Math.sqrt(T / mu1), v2: Math.sqrt(T / mu2) };
})();

const junction = (ratio, caption, more = {}) => ({ type: 'wv2-junction', params: { ratio, controls: [], play: false, time: more.time ?? 160, panels: more.panels || ['string', 'energy'], readout: more.readout ?? false, ...(more.params || {}) }, caption });

export default lesson({
  id: 'phys3750.W9.1',
  title: 'Energy density and flux on a string',
  minutes: 16, difficulty: 3,
  intro: t`A piece $dx$ of string has kinetic energy $\tfrac12(\mu\,dx)\,y_t^2$ and, because it is stretched when tilted, potential energy $\tfrac12T\,y_x^2\,dx$. The left part of the string pulls the right part sideways with force $-T\,y_x$, and that force does work at the rate force × velocity. So:

$$\begin{gathered}e = \tfrac12\mu\,y_t^2 + \tfrac12T\,y_x^2, \\ S = -T\,y_t\,y_x\end{gathered}$$

$e$ is the **energy density** (J/m) and $S$ the **energy flux** (W): the power flowing past a point, positive to the right. For a wave travelling right, $y_t = -vy_x$, so kinetic and potential energy are equal and $S = v\,e$: the energy rides along at the wave speed. A harmonic wave of amplitude $A$ carries on average $\bar P = \tfrac12Z\omega^2A^2$, where $Z = \sqrt{T\mu}$ is the string’s **impedance** — the quantity that decides what happens when two strings meet.`,
  symbols: [
    { tex: 'e', text: 'energy per unit length of string, in J/m' },
    { tex: 'S', text: 'energy flux: the power crossing a point, in W (positive means flowing toward $+x$)' },
    { tex: '\\mu,\\ T', text: 'mass per unit length (kg/m) and tension (N)' },
    { tex: 'y_t,\\ y_x', text: 'the string’s transverse velocity (m/s) and slope (dimensionless) at a point' },
    { tex: 'Z = \\sqrt{T\\mu} = \\mu v', text: 'the impedance, in kg/s: transverse force per unit transverse velocity for a travelling wave' },
  ],
  why: t`Energy that moves needs a density and a flux; the same pair for electromagnetic fields is Poynting’s, and impedance matching runs from guitar bridges to ultrasound gel to antenna feeds.`,
  visual: {
    type: 'wv2-junction',
    title: 'A pulse meets a junction',
    lead: t`Top: a pulse on a string ($\mu_1$) running into a string of different density ($\mu_2$), same tension; near the junction the incident (gold) and reflected (violet) parts are dashed. Middle: the energy density, with flux arrows. Bottom: the energy on each string, with the predictions marked once the pulse has gone by.`,
    tasks: [
      t`Set $\mu_2/\mu_1 = 1$: nothing reflects. Raise it to 9: half the amplitude comes back **upside down**, a quarter of the energy.`,
      t`Make the second string much lighter: the reflection is upright and the transmitted pulse is **taller** than the incident one — yet it carries less energy.`,
      t`Watch the energy density at the moment of reflection: energy piles up at the junction but the bars always add to 100%.`,
    ],
    params: { ratio: 9, flux: true },
    caption: t`Two ideal strings under the same tension, joined at $x = 0$; displacements exaggerated, line thickness shows density. Exact solution: reflected and transmitted pulses are copies of the incident one scaled by $r$ and $\tau$.`,
  },
  example: {
    prompt: t`A steel cable ($\mu_1 = ${EX.mu1}$ kg/m) is spliced to a light synthetic rope ($\mu_2 = ${EX.mu2}$ kg/m); both carry ${EX.T} N of tension. A ${EX.f} Hz wave of amplitude ${EX.A * 100} cm runs along the cable toward the splice. What power does it carry, and what amplitude and power continue into the rope?`,
    steps: [
      { label: 'Impedances', text: t`$Z_1 = \sqrt{T\mu_1} = ${tn(EX.Z1)}$ kg/s and $Z_2 = \sqrt{T\mu_2} = ${tn(EX.Z2)}$ kg/s.` },
      { label: 'Incident power', text: t`$\bar P = \tfrac12Z_1\omega^2A^2 = \tfrac12(${tn(EX.Z1)})(${tn(EX.w)})^2(${EX.A})^2 = ${tn(EX.P)}$ W. (Average of $S$: half its peak, since $\sin^2$ averages to $\tfrac12$.)` },
      { label: 'Amplitudes', text: t`$y$ and the sideways force $Ty_x$ must match at the splice: $r = \dfrac{Z_1 - Z_2}{Z_1 + Z_2} = ${tn(EX.r)}$ and $\tau = \dfrac{2Z_1}{Z_1 + Z_2} = ${tn(EX.tau)}$. The rope’s wave has amplitude $\tau A = ${tn(EX.At * 100)}$ cm — **larger** than the incident wave.` },
      { label: 'Powers', text: t`Reflected: $r^2\bar P = ${tn(EX.R * EX.P)}$ W. Transmitted: $\tfrac12Z_2\omega^2(\tau A)^2 = ${tn(EX.Pt)}$ W, a fraction $4Z_1Z_2/(Z_1 + Z_2)^2 = ${tn(EX.Tr)}$.` },
      { label: 'Sense check', text: t`$${tn(EX.R)} + ${tn(EX.Tr)} = 1$: energy is conserved. The rope’s wave is taller but the rope is “softer” (smaller $Z$): the same transverse force moves it faster, so it takes a bigger swing to carry less power.` },
    ],
    answer: t`$${tn(EX.P)}$ W arrives; $${tn(EX.R * EX.P)}$ W ($${tn(EX.R * 100)}\%$) reflects upright, and the rope carries a $${tn(EX.At * 100)}$ cm wave with $${tn(EX.Pt)}$ W ($${tn(EX.Tr * 100)}\%$).`,
    visual: junction(EX.mu2 / EX.mu1, t`A pulse version of the example: after the splice to the lighter rope, an upright reflection and a taller transmitted pulse. Displacements exaggerated.`, { time: 150, panels: ['string', 'bars'] }),
  },
  practice: [
    num({
      id: 'avg-power', difficulty: 2,
      gen(r) {
        const T = r.pick([60, 120, 250]), mu = r.pick([0.02, 0.05, 0.12]), f = r.pick([10, 20, 40]), A = r.pick([0.5, 1, 2]);   // A in cm
        const Z = Math.sqrt(T * mu), w = 2 * Math.PI * f, P = 0.5 * Z * w * w * (A / 100) ** 2;
        return {
          prompt: t`A rope with tension ${T} N and ${mu} kg/m carries a sinusoidal wave of frequency ${f} Hz and amplitude ${A} cm. What average power does it carry, in W?`,
          visual: curvesPic([{ fn: `${A}*sin(2*pi*x)`, color: 'accent', width: 2.2 }], [0, 3], [-A * 1.5, A * 1.5], t`The travelling wave at one instant (displacement in cm against $x$ in wavelengths).`, { xlabel: 'x (wavelengths)', ylabel: 'y (cm)' }),
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: 2 * P, feedback: t`That is the peak of $S$. Averaged over a cycle, $\sin^2$ gives $\tfrac12$: $\bar P = \tfrac12Z\omega^2A^2$.` }, { value: 0.5 * Z * f * f * (A / 100) ** 2, feedback: t`Use the angular frequency $\omega = 2\pi f$.` }],
          hints: [t`$Z = \sqrt{T\mu}$, $\omega = 2\pi f$.`, t`$\bar P = \tfrac12Z\omega^2A^2$ with $A$ in m.`],
          teach: t`A harmonic wave carries $\bar P = \tfrac12Z\omega^2A^2$: power grows as frequency² and amplitude².`,
          explain: t`$Z = ${tn(Z)}$ kg/s, $\omega = ${tn(w)}$ rad/s, so $\bar P = \tfrac12(${tn(Z)})(${tn(w)})^2(${tn(A / 100)})^2 = ${tn(P)}$ W.`,
        };
      },
    }),
    mcq({
      id: 'standing-zero', difficulty: 2,
      prompt: t`A string vibrating in its fundamental, $y = A\sin(\pi x/L)\cos\omega t$, passes through the instant when it is perfectly straight. Where is its energy then?`,
      visual: curvesPic([{ fn: '0', color: 'accent', width: 2.4, domain: [0, 1] }, { fn: 'sin(pi*x)', color: 'gold', dash: [5, 4], width: 1.4, label: 'velocity', labelAt: 0.5, labelDy: -12 }], [0, 1], [-0.4, 1.3], t`The string at the instant it is straight (blue) and its velocity profile then (dashed, arbitrary units).`, { xlabel: 'x / L', ylabel: '' }),
      choices: [
        'All of it is kinetic: the string is straight but moving fastest, most of all at the middle',
        'There is none: with no displacement the string has no energy at that instant',
        'All of it is potential, stored in the tension of the straight string',
        'It has all flowed out through the fixed ends and will flow back in',
      ],
      answer: 0,
      why: {
        1: t`No displacement does not mean no motion: $y_t = -A\omega\sin(\pi x/L)\sin\omega t$ is largest exactly when $y = 0$.`,
        2: t`The extra potential energy comes from slope, $\tfrac12Ty_x^2$; a straight string has none.`,
        3: t`Fixed ends do no work ($y_t = 0$ there, so $S = 0$): the energy never leaves the string.`,
      },
      hints: [t`Compute $y_t$ at the moment $\cos\omega t = 0$.`, t`$e = \tfrac12\mu y_t^2 + \tfrac12Ty_x^2$; which term survives when $y_x = 0$ everywhere?`],
      teach: 'In a standing wave the energy sloshes between kinetic (straight, moving) and potential (bent, still), with the total constant.',
      explain: t`At $\cos\omega t = 0$ the slope is zero everywhere and $y_t = \mp A\omega\sin(\pi x/L)$: all the energy, $\tfrac14\mu L\omega^2A^2$, is kinetic. A quarter period later the string is still and fully bent, all potential.`,
    }),
    num({
      id: 'transmit-fraction', difficulty: 2,
      gen(r) {
        const q = r.pick([2, 4, 9, 16, 0.25, 0.04]);
        const Tr = (4 * Math.sqrt(q)) / (1 + Math.sqrt(q)) ** 2;
        return {
          prompt: t`A wave on one string meets a second string ${q > 1 ? `${q} times heavier` : `${tn(1 / q)} times lighter`} per metre, under the same tension. What fraction of the incident power is transmitted?`,
          visual: junction(q, t`A pulse that has just met the junction (displacements exaggerated). The bars are hidden: work out the split.`, { time: 140 }),
          answer: Tr, tol: { rel: 0.005 },
          errors: [{ value: 1 - Tr, feedback: t`That is the reflected fraction, $r^2$.` }, { value: (2 / (1 + Math.sqrt(q))) ** 2, feedback: t`$\tau^2$ is not the power ratio: power also scales with impedance, so multiply by $Z_2/Z_1$.` }].filter((e) => Math.abs(e.value - Tr) > 0.01 * Tr),
          hints: [t`Same tension: $Z_2/Z_1 = \sqrt{\mu_2/\mu_1} = ${tn(Math.sqrt(q))}$.`, t`Transmitted fraction $= \dfrac{4Z_1Z_2}{(Z_1 + Z_2)^2}$.`],
          teach: t`Power transmission across a junction: $\dfrac{4Z_1Z_2}{(Z_1 + Z_2)^2}$ — the same either way round, and 1 only when $Z_1 = Z_2$.`,
          explain: t`With $Z_2/Z_1 = ${tn(Math.sqrt(q))}$: $\dfrac{4(${tn(Math.sqrt(q))})}{(1 + ${tn(Math.sqrt(q))})^2} = ${tn(Tr, 4)}$; the other $${tn(1 - Tr, 3)}$ reflects.`,
        };
      },
    }),
    {
      type: 'slider', id: 'quarter-reflect', difficulty: 3,
      prompt: t`Choose a **heavier** second string so that exactly a quarter of the pulse’s energy is reflected.`,
      visual: { type: 'wv2-junction', params: { ratio: 2, controls: ['ratio'], panels: ['string', 'energy'], readouts: ['ratio', 'r', 'R'], hide: ['r', 'R'] }, caption: 'Two strings under the same tension; drag the density ratio. Displacements exaggerated.' },
      param: 'ratio', answer: [8.4, 9.7],
      instruction: 'Set the density ratio, then check.',
      hints: [t`A quarter of the energy means $r^2 = \tfrac14$, so $|r| = \tfrac12$.`, t`$\dfrac{Z_2 - Z_1}{Z_2 + Z_1} = \tfrac12$ gives $Z_2 = 3Z_1$, and $Z \propto \sqrt\mu$.`],
      teach: t`Reflected energy fraction $r^2 = \left(\dfrac{Z_1 - Z_2}{Z_1 + Z_2}\right)^2$ with $Z \propto \sqrt\mu$ at fixed tension.`,
      explain: t`$Z_2/Z_1 = 3$ needs $\mu_2/\mu_1 = 9$. Then $r = -\tfrac12$: half the amplitude, a quarter of the energy, upside down.`,
    },
    num({
      id: 'instant-flux', difficulty: 3,
      gen(r) {
        const T = r.pick([40, 90]), A = r.pick([1, 2]), k = r.pick([2, 3, 4]), w = r.pick([30, 60]), x = r.pick([0.1, 0.2, 0.3]), tt = r.pick([0, 0.01, 0.02]);
        const ph = k * x - w * tt, yt = -(A / 100) * w * Math.cos(ph), yx = (A / 100) * k * Math.cos(ph), S = -T * yt * yx;
        return {
          prompt: t`A string at tension ${T} N carries $y = ${A / 100}\sin(${k}x - ${w}t)$ m. What power flows past $x = ${x}$ m at $t = ${tt}$ s, in W (positive to the right)?`,
          visual: curvesPic([{ fn: `${A}*sin(${k}*x - ${w * tt})`, color: 'accent', width: 2.2 }], [0, (4 * Math.PI) / k], [-A * 1.5, A * 1.5], t`The string at $t = ${tt}$ s (y in cm, x in m); the point asked about is marked.`, { xlabel: 'x (m)', ylabel: 'y (cm)', points: [{ x, y: A * Math.sin(ph), color: 'gold', r: 5 }] }),
          answer: S, units: 'W', tol: { rel: 0.01, abs: 1e-4 },
          errors: [{ value: -S, feedback: t`Mind the sign: $S = -Ty_ty_x$, and for a wave moving right it is never negative.` }, { value: 0.5 * T * (A / 100) ** 2 * k * w, feedback: t`That is the time average $\tfrac12Z\omega^2A^2$; the question asks for the instantaneous flux.` }].filter((e) => Math.abs(e.value - S) > 0.02 * Math.abs(S) + 1e-4),
          hints: [t`$y_t = -${A / 100}(${w})\cos(${k}x - ${w}t)$ and $y_x = ${A / 100}(${k})\cos(${k}x - ${w}t)$.`, t`$S = -Ty_ty_x = T(${A / 100})^2(${k})(${w})\cos^2(${k}x - ${w}t)$.`],
          teach: t`$S = -Ty_ty_x$; for a rightward wave $y_t = -vy_x$, so $S = Tvy_x^2 \ge 0$ — energy only flows forward, in pulses twice per cycle.`,
          explain: t`The phase is $${tn(ph)}$ rad, so $S = ${T}(${tn(A / 100)})^2(${k})(${w})\cos^2(${tn(ph)}) = ${tn(S)}$ W.`,
        };
      },
    }),
    mcq({
      id: 'inverted', difficulty: 2,
      prompt: t`A pulse on a light string reaches a junction with a much heavier string. What does the reflected pulse look like?`,
      visual: junction(25, t`The pulse just before it reaches the heavy string (thick line); displacements exaggerated.`, { time: 90 }),
      choices: ['Inverted, and nearly as tall as the incident pulse', 'Upright, and nearly as tall as the incident pulse', 'Inverted, but much smaller than the incident pulse', 'There is no reflection: the energy all goes into the heavy string'],
      answer: 0,
      why: {
        1: t`Upright reflections come from a **lighter** second string ($Z_2 < Z_1$, $r > 0$).`,
        2: t`A big impedance jump reflects strongly: $r = (Z_1 - Z_2)/(Z_1 + Z_2) \to -1$ as $Z_2 \gg Z_1$.`,
        3: t`Little energy gets through a large impedance mismatch: transmission $4Z_1Z_2/(Z_1 + Z_2)^2 \to 0$.`,
      },
      hints: [t`$Z = \sqrt{T\mu}$ is much larger on the heavy string.`, t`$r = (Z_1 - Z_2)/(Z_1 + Z_2)$: sign and size?`],
      teach: 'A much heavier (higher-impedance) string acts almost like a fixed end: the reflection is inverted and nearly complete.',
      explain: t`With $\mu_2 = 25\mu_1$, $Z_2 = 5Z_1$: $r = -\tfrac46 = -0.67$, reflecting 44% of the energy. As $\mu_2 \to \infty$ the junction becomes a wall and $r \to -1$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-water-air', difficulty: 3, transfer: true,
      gen(r) {
        const [m1, Z1, m2, Z2] = r.pick([['water', 1.48e6, 'air', 413], ['steel', 4.6e7, 'air', 413], ['water', 1.48e6, 'steel', 4.6e7]]);
        const Tr = (4 * Z1 * Z2) / (Z1 + Z2) ** 2;
        return {
          prompt: t`Sound behaves like the string: a plane wave meeting a flat boundary head-on transmits the power fraction $4Z_1Z_2/(Z_1 + Z_2)^2$, with acoustic impedance $Z = \rho c$. Going from ${m1} ($Z = ${tn(Z1)}$ kg m⁻² s⁻¹) into ${m2} ($Z = ${tn(Z2)}$ kg m⁻² s⁻¹), what percentage of the power gets through?`,
          visual: junction(Math.min(50, Math.max(0.02, (Z2 / Z1) ** 2)), t`The string analogue: the same mismatch, drawn as two strings (capped at the sim’s range); displacements exaggerated.`, { time: 200 }),
          answer: Tr * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: ((2 * Z1) / (Z1 + Z2)) ** 2 * 100, feedback: t`$\tau^2$ alone ignores the change of impedance: multiply by $Z_2/Z_1$.` }],
          hints: [t`Transmitted fraction $= 4Z_1Z_2/(Z_1 + Z_2)^2$.`, t`Multiply by 100 for a percentage.`],
          teach: t`Impedance mismatch reflects power: $4Z_1Z_2/(Z_1 + Z_2)^2 \approx 4Z_{\text{small}}/Z_{\text{big}}$ for a large mismatch.`,
          explain: t`$4(${tn(Z1)})(${tn(Z2)})/(${tn(Z1 + Z2)})^2 = ${tn(Tr * 100)}\%$. ${m2 === 'air' ? 'That is why you hear so little of the world above when your head is under water.' : 'Ultrasonic testing of welds and engine parts copes with this by pressing the probe on through a couplant.'}`,
        };
      },
    }),
    num({
      id: 'cp-amplitude', difficulty: 3,
      gen(r) {
        const q = r.pick([4, 9, 0.25, 1 / 9]), A = r.pick([2, 3, 5]);
        const z = Math.sqrt(q), tau = 2 / (1 + z);
        return {
          prompt: t`A ${A} mm pulse on a string reaches a second string with $\mu_2 = ${q >= 1 ? q : t`\tfrac{1}{${tn(1 / q)}}`}\,\mu_1$ (same tension). How tall is the transmitted pulse, in mm?`,
          visual: junction(q, 'Two strings under the same tension, the pulse arriving from the left (displacements exaggerated).', { time: 90 }),
          answer: tau * A, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: ((1 - z) / (1 + z)) * A, feedback: t`That is the reflected amplitude $rA$. The transmitted one is $\tau A$ with $\tau = 2Z_1/(Z_1 + Z_2)$.` }, { value: Math.sqrt((4 * z) / (1 + z) ** 2) * A, feedback: t`That would match the energy fraction, but the transmitted amplitude follows from continuity: $\tau = 2Z_1/(Z_1 + Z_2)$.` }].filter((e) => Math.abs(e.value - tau * A) > 0.02 * tau * A),
          hints: [t`$Z_2/Z_1 = \sqrt{\mu_2/\mu_1} = ${tn(z)}$.`, t`$\tau = 2Z_1/(Z_1 + Z_2) = 2/(1 + Z_2/Z_1)$.`],
          teach: t`Transmitted amplitude: $\tau A = \dfrac{2Z_1}{Z_1 + Z_2}A$ — more than $A$ into a lighter string, less into a heavier one.`,
          explain: t`$\tau = 2/(1 + ${tn(z)}) = ${tn(tau)}$, so the transmitted pulse is $${tn(tau * A)}$ mm tall. It carries the power fraction $\tau^2Z_2/Z_1 = ${tn(tau * tau * z)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-node', difficulty: 3,
      prompt: t`At a **node** of a standing wave on a string, which statement is true?`,
      visual: curvesPic([{ fn: 'sin(2*pi*x)', color: 'accent', width: 2.2 }, { fn: '-sin(2*pi*x)', color: 'ink3', dash: [5, 4], width: 1.2 }], [0, 1], [-1.3, 1.3], t`A standing wave at two instants half a period apart; the node is at the middle.`, { xlabel: 'x / L', ylabel: '', points: [{ x: 0.5, y: 0, color: 'gold', r: 5, label: 'node', labelDy: -12 }] }),
      choices: [
        'No energy ever flows through it, but energy is stored there: the string’s slope swings largest at a node',
        'There is no energy at all at a node, since the string never moves there',
        'Energy flows through it fastest, because the slope is largest there',
        'Energy flows through it at the wave speed v, as in a travelling wave',
      ],
      answer: 0,
      why: {
        1: t`Not moving is not the same as having no energy: $\tfrac12Ty_x^2$ is largest at a node.`,
        2: t`Flux needs both slope and velocity, $S = -Ty_ty_x$; at a node $y_t = 0$ always, so $S = 0$.`,
        3: 'A standing wave is two equal travelling waves going opposite ways: their fluxes cancel, so on average nothing flows anywhere.',
      },
      hints: [t`At a node, $y = 0$ for all $t$; what about $y_t$ and $y_x$?`, t`$S = -Ty_ty_x$ and $e$ includes $\tfrac12Ty_x^2$.`],
      teach: 'A node is a wall for energy (zero flux) but not empty: the potential (stretching) energy is concentrated there.',
      explain: t`For $y = A\sin kx\cos\omega t$: at a node $y_t = 0$ always, so $S = 0$ — energy sloshes within each half-wavelength but never crosses a node. Yet $y_x = \pm kA\cos\omega t$ is largest there, so $\tfrac12Ty_x^2$ peaks at the node twice per cycle.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 14: Conservation of Energy (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Crawford, Waves (Berkeley Physics Course vol. 3), ch. 5: reflection and impedance', url: 'https://archive.org/details/waves0003craw' },
  ],
});
