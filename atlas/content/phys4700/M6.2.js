// Spin in a magnetic field: precession (Griffiths & Schroeter §4.4.2, Example
// 4.3; Levitt, Spin Dynamics). Ĥ = −γB·Ŝ; for B = B₀ẑ the energy eigenstates
// are |±z⟩ and any other state precesses at the Larmor frequency ω = γB₀:
// ⟨S⟩ obeys d⟨S⟩/dt = γ⟨S⟩ × B exactly (Ehrenfest), clockwise from +z for
// γ > 0 (protons), anticlockwise for electrons. NMR and MRI: a resonant
// rotating field B₁ tips spins by ω₁t (π/2 and π pulses); a spread of fields
// fans the spins out (T₂*), and Hahn's spin echo (1950) refocuses that static
// spread at 2τ but not random fluctuations (T₂). Transfers: Overhauser
// proton magnetometers on Ørsted and CHAMP, and MRI gradient encoding.
// phys4700.M1.2 met precession as a winding relative phase; this lesson
// derives it from the Hamiltonian. CODATA 2022 gyromagnetic ratios; every
// number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { GAMMA_E, GAMMA_P, GAMMA_P_HZ, blochPic, r6 } from './_qm.js';

const t = String.raw;
const D = Math.PI / 180;
const GAMMA_E_HZ = GAMMA_E / (2 * Math.PI);        // Hz/T, 28.024 951 4 GHz/T

/** Spins in the rotating frame after a π/2 pulse: 7 isochromats fanned by δₖ = k·spread·t, optionally refocused by a π pulse at τ. */
function fanPic(phaseMax, caption) {
  const arrows = [-3, -2, -1, 0, 1, 2, 3].map((k) => {
    const a = (k / 3) * phaseMax * D + Math.PI / 2;
    return { from: [0, 0], to: [r6(Math.cos(a)), r6(Math.sin(a))], color: k === 0 ? 'gold' : 'accent', width: 2.2 };
  });
  return {
    type: 'graph',
    params: { x: [-1.35, 1.35], y: [-1.15, 1.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [2, 4] }], arrows, points: [{ x: 0, y: 1.12, r: 0, label: 'y′ (where the pulse left them)', color: 'ink3', labelAlign: 'center', labelDx: 0, labelDy: 0 }] },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M6.2',
  title: 'Spin in a magnetic field: precession',
  minutes: 17, difficulty: 3,
  intro: t`A particle with spin carries a magnetic moment $\hat{\vec\mu} = \gamma\hat{\vec S}$, so a magnetic field gives it energy $-\vec\mu\cdot\vec B$. In a steady field along $z$ the two energy eigenstates are spin up and spin down; every other state is a superposition whose relative phase winds steadily, and its Bloch vector turns round the field — **Larmor precession**:

$$\begin{gathered} \hat H = -\gamma\vec B\cdot\hat{\vec S} \\ \frac{d\langle\vec S\rangle}{dt} = \gamma\,\langle\vec S\rangle\times\vec B \\ \omega_L = \gamma B_0 \end{gathered}$$

The second equation is exact (the generalized Ehrenfest theorem), and it is the classical equation of a spinning top in a torque. It is the physics of NMR, MRI, electron spin resonance, atomic magnetometers and the control of spin qubits.`,
  symbols: [
    { tex: '\\gamma', text: t`the gyromagnetic ratio, in $\text{s}^{-1}\text{T}^{-1}$: $\gamma_p = ${tex(GAMMA_P, 8)}$ for a free proton; $-${tex(GAMMA_E, 8)}$ for the electron (negative: its moment points against its spin)` },
    { tex: '\\vec B', text: t`the magnetic field, in tesla; $B_0$ is its steady part along $z$` },
    { tex: '\\hat{\\vec S}', text: t`the spin operator, $\tfrac{\hbar}{2}\vec\sigma$ for spin ½` },
    { tex: '\\langle\\vec S\\rangle', text: 'the expectation value of the spin: the Bloch vector times ħ/2' },
    { tex: '\\omega_L', text: t`the Larmor angular frequency, in rad/s; $f_L = \omega_L/2\pi$ is ${fmt(GAMMA_P_HZ / 1e6, 8)} MHz per tesla for protons and ${fmt(GAMMA_E_HZ / 1e9, 8)} GHz per tesla for electrons` },
  ],
  why: 'Every MRI image, every NMR spectrum, every spin qubit gate and every proton or alkali magnetometer is spin precession, controlled and read out.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Larmor precession',
    lead: t`A proton spin in a field $B_0$ along $z$ (blue). Its Bloch vector (gold) starts tipped by $\theta$ from the field. Run the clock forward.`,
    tasks: [
      'Move time: the spin turns about the field at fixed tilt — clockwise seen from above, because the proton’s γ is positive.',
      'Double B₀: it turns twice as fast. At 3 T one turn takes 7.8 ns (127.7 MHz).',
      'Set the tilt to 0: the spin is an energy eigenstate and nothing happens at all, however long you wait.',
    ],
    params: {
      range: 1.4, yaw: 0.55, pitch: 0.4,
      sliders: [
        { key: 'B', label: t`Field $B_0$`, min: 0.5, max: 3, step: 0.1, value: 1.5, unit: '\\text{T}', explain: 'The steady field along z, as in a clinical MRI scanner.' },
        { key: 'th', label: t`Tilt $\theta$`, min: 0, max: 180, step: 5, value: 60, unit: '^\\circ', explain: 'The angle between the spin’s Bloch vector and the field.' },
        { key: 'tt', label: t`Time $t$`, min: 0, max: 20, step: 0.1, value: 2, unit: '\\text{ns}', explain: 'Time since the spin was prepared at azimuth 0 (along the xz-plane).' },
      ],
      spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink4' }],
      vectors: [
        { to: [0, 0, 1.3], color: 'accent', label: '\\vec B_0' },
        { to: [`sin(th*pi/180)*cos(2*pi*${r6(GAMMA_P_HZ / 1e9)}*B*tt)`, `-sin(th*pi/180)*sin(2*pi*${r6(GAMMA_P_HZ / 1e9)}*B*tt)`, 'cos(th*pi/180)'], color: 'gold', label: '\\langle\\vec\\sigma\\rangle' },
      ],
      curves: [{ param: ['sin(th*pi/180)*cos(t)', 'sin(th*pi/180)*sin(t)', 'cos(th*pi/180)'], t: [0, 6.2832], color: 'gold', dash: true }],
      readouts: [
        { label: t`$f_L$ (MHz)`, expr: `${r6(GAMMA_P_HZ / 1e6)}*B`, digits: 4 },
        { label: t`turns so far`, expr: `${r6(GAMMA_P_HZ / 1e9)}*B*tt`, digits: 3 },
        { label: t`$P(+\hbar/2\ \text{along}\ x)$`, expr: `(1 + sin(th*pi/180)*cos(2*pi*${r6(GAMMA_P_HZ / 1e9)}*B*tt))/2`, digits: 3 },
      ],
    },
    caption: 'Exact for a free proton (γ/2π = 42.577 MHz/T); protons in water are shielded by about 26 parts per million. No relaxation is included: a real spin ensemble also dephases and returns toward +z. Drag to rotate.',
  },
  example: {
    prompt: t`A proton in a field $B_0\hat z$ starts in $|{+x}\rangle$. Find its state at time $t$, the expectation value $\langle\vec S\rangle$, and the probability of finding it in $|{+x}\rangle$. Put in numbers for a 3 T scanner.`,
    visual: blochPic({ states: [{ v: [1, 0, 0], label: '|{+x}\\rangle' }, { v: [0, 0, 1.25], color: 'accent', label: '\\vec B_0' }], extra: { curves: [{ param: ['cos(t)', '-sin(t)', '0'], t: [0, 4.7], color: 'gold' }] }, caption: t`The spin starts at $+x$ and precesses clockwise round the equator (gold), about the field along $z$. Drag to rotate.` }),
    steps: [
      { label: 'Energies', text: t`$\hat H = -\gamma B_0\hat S_z$ has eigenstates $|\pm\rangle$ with $E_\pm = \mp\tfrac12\gamma B_0\hbar$. Spin up is lower for $\gamma > 0$: the moment lines up with the field.` },
      { label: 'Evolve', text: t`$|{+x}\rangle = \tfrac{1}{\sqrt2}(|+\rangle + |-\rangle)$, and each component gains $e^{-iE_\pm t/\hbar}$: $|\psi(t)\rangle = \tfrac{1}{\sqrt2}\big(e^{i\gamma B_0t/2}|+\rangle + e^{-i\gamma B_0t/2}|-\rangle\big)$.` },
      { label: 'Spin vector', text: t`$\langle S_x\rangle = \tfrac\hbar2\cos\gamma B_0t$, $\langle S_y\rangle = -\tfrac\hbar2\sin\gamma B_0t$, $\langle S_z\rangle = 0$: the spin turns in the $xy$-plane at $\omega_L = \gamma B_0$, clockwise seen from $+z$.` },
      { label: 'Probability', text: t`$|\langle{+x}|\psi\rangle|^2 = \cos^2(\omega_Lt/2)$: back to 1 after every full turn, zero after half a turn.` },
      { label: 'Same thing, classically', text: t`Ehrenfest: $d\langle\vec S\rangle/dt = \tfrac{i}{\hbar}\langle[\hat H, \hat{\vec S}]\rangle$ $= \gamma\langle\vec S\rangle\times\vec B$ — exactly the equation of a magnetic top. It holds for any field, even one that changes in time, which is what makes NMR pulses easy to design.` },
      { label: 'Numbers', text: t`At 3 T, $f_L = ${fmt(GAMMA_P_HZ / 1e6, 6)}\times3 = ${fmt(3 * GAMMA_P_HZ / 1e6, 5)}$ MHz — a radio frequency — and one turn takes $${fmt(1e9 / (3 * GAMMA_P_HZ), 4)}$ ns. The energy splitting $\hbar\omega_L = ${fmt((3 * GAMMA_P * 1.0545718176461565e-34) / 1.602176634e-19 * 1e6, 4)}\ \mu$eV is tiny beside $k_BT$ at body temperature (27 meV), which is why only a few parts per million of the spins are polarized and MRI needs strong fields.` },
    ],
    answer: t`$\langle S_x\rangle = \tfrac\hbar2\cos\omega_Lt$, $\langle S_y\rangle = -\tfrac\hbar2\sin\omega_Lt$ with $\omega_L = \gamma B_0$; $P(+x) = \cos^2(\omega_Lt/2)$. At 3 T, $f_L = ${fmt(3 * GAMMA_P_HZ / 1e6, 5)}$ MHz.`,
  },
  practice: [
    num({
      id: 'larmor', difficulty: 2,
      gen(r) {
        const [who, g, B, ctx] = r.pick([
          ['a proton', GAMMA_P_HZ, 1.5, 'a 1.5 T clinical MRI scanner'], ['a proton', GAMMA_P_HZ, 7, 'a 7 T research MRI scanner'], ['a proton', GAMMA_P_HZ, 11.7, 'an 11.7 T (“500 MHz”) NMR spectrometer'],
          ['an electron', GAMMA_E_HZ, 0.35, 'an X-band electron-spin-resonance spectrometer at 0.35 T'], ['an electron', GAMMA_E_HZ, 1, 'a 1 T magnet'],
        ]);
        const ans = (g * B) / 1e6;
        return {
          prompt: t`What is the Larmor frequency $f_L = |\gamma|B/2\pi$, in MHz, of ${who} in ${ctx}? ($|\gamma_p|/2\pi = ${fmt(GAMMA_P_HZ / 1e6, 8)}$ MHz/T, $|\gamma_e|/2\pi = ${fmt(GAMMA_E_HZ / 1e6, 8)}$ MHz/T.)`,
          visual: blochPic({ states: [{ v: [0.866, 0, 0.5], label: '\\langle\\vec\\sigma\\rangle' }, { v: [0, 0, 1.25], color: 'accent', label: '\\vec B' }], extra: { curves: [{ param: ['0.866*cos(t)', '0.866*sin(t)', '0.5'], t: [0, 6.2832], color: 'gold' }] }, caption: 'A tipped spin and the cone it sweeps round the field. Drag to rotate.' }),
          answer: ans, units: 'MHz', tol: { rel: 0.005 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`$\gamma B$ is an angular frequency in rad/s; divide by $2\pi$ for hertz (the values given are already $\gamma/2\pi$).` }, { value: g === GAMMA_P_HZ ? (GAMMA_E_HZ * B) / 1e6 : (GAMMA_P_HZ * B) / 1e6, feedback: 'Use the gyromagnetic ratio of the particle in question.' }],
          hints: [t`$f_L = (\gamma/2\pi)\,B$.`],
          teach: 'The Larmor frequency is proportional to the field: 42.58 MHz per tesla for protons, 28.02 GHz per tesla for electrons.',
          explain: t`$f_L = ${fmt(g / 1e6, 7)}\times${B} = ${fmt(ans, 5)}$ MHz. Electrons precess about 658 times faster than protons, because their moment is that much larger for the same spin.`,
        };
      },
    }),
    num({
      id: 'px-t', difficulty: 2,
      gen(r) {
        const B = r.pick([1, 1.5, 3]), tns = r.pick([2, 3, 5, 6]);
        const ph = 2 * Math.PI * GAMMA_P_HZ * B * tns * 1e-9, ans = Math.cos(ph / 2) ** 2;
        return {
          prompt: t`A proton spin is prepared in $|{+x}\rangle$ in a field $B_0 = ${B}$ T along $z$. What is the probability of finding it in $|{+x}\rangle$ after $${tns}$ ns?`,
          visual: blochPic({ states: [{ v: [1, 0, 0], label: '|{+x}\\rangle' }], extra: { curves: [{ param: ['cos(t)', '-sin(t)', '0'], t: [0, 6.2832], color: 'gold' }] }, caption: 'The equator the spin precesses round. Drag to rotate.' }),
          answer: ans, tol: { rel: 0.01, abs: 0.003 },
          errors: [{ value: Math.cos(ph) ** 2, feedback: t`The Bloch vector turns by $\omega_Lt$, and the probability is $\cos^2$ of **half** that angle.` }, { value: Math.cos(ph / (4 * Math.PI)) ** 2, feedback: t`$\omega_L = 2\pi f_L$: the precession angle is $2\pi f_Lt$ radians.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\omega_Lt = 2\pi\times(${fmt(GAMMA_P_HZ / 1e6, 6)}\ \text{MHz/T})\times${B}\ \text{T}\times${tns}\ \text{ns}$.`, t`$P = \cos^2(\omega_Lt/2)$.`],
          teach: t`For a spin starting along $x$, the probability of still finding it along $x$ oscillates as $\cos^2(\omega_Lt/2)$.`,
          explain: t`$\omega_Lt = ${fmt(ph, 4)}$ rad (${fmt(ph / (2 * Math.PI), 3)} turns), so $P = \cos^2(${fmt(ph / 2, 4)}) = ${fmt(ans, 3)}$.`,
        };
      },
    }),
    mcq({
      id: 'sense', difficulty: 2,
      prompt: t`An electron and a proton, both tipped away from a field along $+z$, precess. Seen from above ($+z$), which way does each turn?`,
      visual: blochPic({ states: [{ v: [0.866, 0, 0.5], label: '\\langle\\vec\\sigma\\rangle' }, { v: [0, 0, 1.25], color: 'accent', label: '\\vec B' }], extra: { curves: [{ param: ['0.866*cos(t)', '0.866*sin(t)', '0.5'], t: [0, 6.2832], color: 'gold', dash: true }] }, caption: 'A tipped spin and its precession cone; the sense of rotation is the question. Drag to rotate.' }),
      choices: [
        t`In opposite senses: the proton clockwise, the electron anticlockwise, because their $\gamma$ have opposite signs`,
        t`Both clockwise: precession is set by the field’s direction alone`,
        t`Both anticlockwise, at the same rate`,
        t`Neither: a spin is quantized and cannot point partway`,
      ],
      answer: 0,
      why: {
        1: t`$d\langle\vec S\rangle/dt = \gamma\langle\vec S\rangle\times\vec B$: the sign of $\gamma$ reverses the motion.`,
        2: t`They differ in sense and also in rate, by a factor of about 658.`,
        3: t`Single measurements give $\pm\hbar/2$, but the expectation value $\langle\vec S\rangle$ — the Bloch vector — can point anywhere and does precess.`,
      },
      hints: [t`Write $\vec\Omega = -\gamma\vec B$: the spin rotates about $\vec\Omega$ by the right-hand rule.`],
      teach: 'Spins precess about −γB: positive-γ particles (protons) turn clockwise seen from the field’s tip, electrons the other way.',
      explain: t`$d\vec S/dt = \vec\Omega\times\vec S$ with $\vec\Omega = -\gamma\vec B$. For the proton $\vec\Omega$ points along $-z$ (clockwise from above); for the electron, whose moment points against its spin ($\gamma_e < 0$), along $+z$. NMR people call the proton’s sense “negative” precession for this reason.`,
    }),
    num({
      id: 'pi2', difficulty: 2,
      gen(r) {
        const B1 = r.pick([5, 10, 20, 25]), which = r.pick([2, 1]);        // μT; π/which
        const ans = (Math.PI / which) / (GAMMA_P * B1 * 1e-6) * 1e3;      // ms
        return {
          prompt: t`In an NMR experiment a weak field $B_1 = ${B1}\ \mu\text{T}$ rotates in the $xy$-plane at exactly the Larmor frequency. In the frame rotating with it the static field disappears, and the proton spins simply precess about $B_1$ at $\omega_1 = \gamma_pB_1$. How long, in ms, must the pulse last to turn the spins from $+z$ by $${which === 2 ? '90^\\circ' : '180^\\circ'}$ (a “${which === 2 ? 'π/2' : 'π'} pulse”)?`,
          visual: blochPic({ states: [{ v: [0, 0, 1], label: '+z' }, { v: [1.2, 0, 0], color: 'accent', label: '\\vec B_1' }], marks: false, extra: { curves: [{ param: ['0', '-sin(t)', 'cos(t)'], t: [0, r6(Math.PI / which)], color: 'gold' }] }, caption: t`In the rotating frame: $B_1$ along $x'$ and the path (gold) a spin takes from $+z$ while the pulse is on. Drag to rotate.` }),
          answer: ans, units: 'ms', tol: { rel: 0.005 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`$\omega_1 = \gamma_pB_1$ is already in rad/s; the angle is $\omega_1t$ with no extra $2\pi$.` }, { value: which === 2 ? 2 * ans : ans / 2, feedback: which === 2 ? 'A π/2 pulse turns the spin by 90°, half of π.' : 'A π pulse turns the spin by 180°.' }],
          hints: [t`The turn angle is $\omega_1t = \gamma_pB_1t$.`, t`$t = \dfrac{\pi/${which}}{\gamma_pB_1}$ with $\gamma_p = ${tex(GAMMA_P, 6)}\ \text{s}^{-1}\text{T}^{-1}$.`],
          teach: 'A resonant field B₁ tips spins at the rate γB₁ in the rotating frame; the pulse length sets the tip angle.',
          explain: t`$t = (\pi/${which})/(${tex(GAMMA_P, 5)}\times${tex(B1 * 1e-6, 2)}) = ${fmt(ans, 4)}$ ms. A π/2 pulse leaves the magnetization in the $xy$-plane, where it precesses at the Larmor frequency and induces the signal in the receiver coil.`,
        };
      },
    }),
    num({
      id: 'fan', difficulty: 3,
      gen(r) {
        const B = r.pick([1.5, 3]), ppm = r.pick([0.5, 1, 2, 5]);
        const df = GAMMA_P_HZ * B * ppm * 1e-6, ans = 1 / (2 * df) * 1e3;
        return {
          prompt: t`After a π/2 pulse, the spins in a sample all point along $y'$ of the rotating frame. But the field varies across the sample by $${ppm}$ ppm of $B_0 = ${B}$ T, so spins at the two extremes precess at frequencies differing by $\Delta f$. After how long, in ms, do the two extremes point in opposite directions?`,
          visual: fanPic(90, 'Spins in the rotating frame some time after the pulse, fanned out by small differences in field (schematic: seven representative spins).'),
          answer: ans, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: 1 / df * 1e3, feedback: t`Opposite directions means half a turn apart: $\Delta f\,t = \tfrac12$.` }, { value: 1 / (2 * Math.PI * 2 * df) * 1e3, feedback: t`$\Delta f$ is already in hertz (turns per second): no $2\pi$.` }],
          hints: [t`$\Delta f = (\gamma_p/2\pi)\,\Delta B$ with $\Delta B = ${ppm}\times10^{-6}\times${B}$ T.`, t`The extremes are opposite when $\Delta f\,t = \tfrac12$.`],
          teach: 'A spread of fields fans out the precessing spins; the net magnetization decays in a time of order 1/Δf (the T₂* decay).',
          explain: t`$\Delta f = ${tex(GAMMA_P_HZ, 6)}\times${tex(ppm * 1e-6 * B, 3)} = ${fmt(df, 4)}$ Hz, so $t = 1/(2\Delta f) = ${fmt(ans, 4)}$ ms. Long before then the sum of all the spins — the signal — has dwindled: this is free-induction decay, governed by $T_2^*$.`,
        };
      },
    }),
    mcq({
      id: 'echo', difficulty: 3,
      prompt: t`In Hahn’s spin echo, a π pulse about $x'$ is applied a time $\tau$ after the π/2 pulse. The spins, fanned out by a **static** spread of fields, then re-form a strong signal. When, and what does the echo fail to undo?`,
      visual: fanPic(150, t`The fan just before the π pulse. A π pulse about $x'$ reflects every spin through the $x'z$-plane, swinging the fan round to $-y'$ with its order reversed: the fastest spins, which were ahead, are now behind.`),
      choices: [
        t`At $2\tau$; it cannot undo random, fluctuating fields (true $T_2$ relaxation), only static ones`,
        t`At $\tau$; it undoes every kind of dephasing`,
        t`At $2\tau$; it undoes everything, so the echo is as strong as the first signal`,
        t`At $\tau/2$; it cannot undo the static spread`,
      ],
      answer: 0,
      why: {
        1: t`The π pulse is applied at $\tau$; the spins need another $\tau$ to catch up.`,
        2: t`A spin whose field changes at random after the pulse does not retrace its phase; that loss is irreversible and sets $T_2$.`,
        3: t`The refocusing happens after the π pulse, at $2\tau$, and it is precisely the static spread that it cancels.`,
      },
      hints: [t`After the flip, a spin that gained an extra phase $\delta\phi$ in time $\tau$ starts $\delta\phi$ behind and gains it back in another $\tau$.`, 'Only a spin that keeps the same precession rate before and after the pulse retraces its phase exactly.'],
      teach: 'A π pulse reverses static dephasing, so the spins refocus at 2τ; random fluctuations are not reversed and shrink the echo (T₂).',
      explain: t`A spin precessing $\delta\omega$ faster has gained $\delta\omega\tau$ by the π pulse; the flip turns that lead into a lag of $\delta\omega\tau$, which it makes up in a further time $\tau$. All static offsets vanish together at $2\tau$. The echo’s height against $2\tau$ measures $T_2$ — tissue contrast in MRI and the coherence time of a spin qubit.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-overhauser', difficulty: 2, transfer: true,
      gen(r) {
        const f = r.pick([1100, 1450, 1800, 2150, 2600]);           // Hz
        const ans = f / GAMMA_P_HZ * 1e9;                              // nT
        return {
          prompt: t`The Danish Ørsted satellite (1999) and Germany’s CHAMP (2000) measured the strength of Earth’s field with Overhauser magnetometers: proton spins in a liquid are polarized, tipped, and left to precess, and the precession frequency gives the field. If the protons precess at $${f}$ Hz, what is $B$, in nT? Use the free-proton $\gamma_p/2\pi = ${tex(GAMMA_P_HZ, 9)}$ Hz/T.`,
          visual: blochPic({ states: [{ v: [1, 0, 0], label: '\\langle\\vec\\sigma\\rangle' }, { v: [0, 0, 1.25], color: 'accent', label: '\\vec B_{\\oplus}' }], extra: { curves: [{ param: ['cos(t)', '-sin(t)', '0'], t: [0, 6.2832], color: 'gold' }] }, caption: 'Tipped proton spins precessing about Earth’s field. Drag to rotate.' }),
          answer: ans, units: 'nT', tol: { rel: 0.005 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`Divide the frequency by $\gamma_p/2\pi$ (in Hz/T), not by $\gamma_p$ (rad s⁻¹ T⁻¹).` }, { value: ans / 1000, feedback: 'Check the conversion: 1 nT = 10⁻⁹ T.' }],
          hints: [t`$B = f/(\gamma_p/2\pi)$.`, t`$1\ \text{T} = 10^9$ nT.`],
          teach: 'A proton precession magnetometer turns a frequency into a field through a fundamental constant, so it needs no calibration.',
          explain: t`$B = ${f}/(${tex(GAMMA_P_HZ, 7)}) = ${tex(f / GAMMA_P_HZ, 5)}$ T $= ${fmt(ans, 5)}$ nT, a typical field strength at satellite altitude. Because frequency can be counted to parts per billion and $\gamma_p$ is known to parts per billion, these instruments served as the absolute reference for the vector magnetometers flown beside them. (The protons in the liquid are shielded by their molecules’ electrons by a few tens of ppm, a correction the real instruments apply.)`,
        };
      },
    }),
    num({
      id: 'cp-gradient', difficulty: 2, transfer: true,
      gen(r) {
        const G = r.pick([10, 20, 40, 80]), dx = r.pick([0.5, 1, 2]);
        const ans = GAMMA_P_HZ * G * 1e-3 * dx * 1e-3;
        return {
          prompt: t`An MRI scanner locates protons by adding a field gradient: $B_z = B_0 + Gx$, so the Larmor frequency changes from place to place. With $G = ${G}$ mT/m, by how many Hz do the precession frequencies of two voxels $${dx}$ mm apart differ?`,
          visual: { type: 'graph', params: { x: [-0.1, 0.1], y: [-0.012, 0.012], aspect: 'wide', xlabel: 'x (m)', ylabel: 'B − B₀ (T)', xticks: 4, yticks: 4, axesAt: 'edge', curves: [{ fn: `${G / 1000}*x`, color: 'accent', width: 2.4 }] }, caption: 'The gradient field across a 20 cm field of view: a straight line through B₀ at the centre.' },
          answer: ans, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`Use $\gamma_p/2\pi$ in Hz/T for a frequency in hertz.` }, { value: ans * 1000, feedback: 'Convert mm to m and mT to T.' }],
          hints: [t`$\Delta f = (\gamma_p/2\pi)\,G\,\Delta x$.`, t`$G = ${G}\times10^{-3}$ T/m and $\Delta x = ${dx}\times10^{-3}$ m.`],
          teach: 'A field gradient turns position into frequency: MRI images are Fourier transforms of the precession signal.',
          explain: t`$\Delta f = ${fmt(GAMMA_P_HZ / 1e6, 6)}\ \text{MHz/T}\times${G / 1000}\ \text{T/m}\times${dx / 1000}\ \text{m} = ${fmt(ans, 4)}$ Hz — easily resolved in a signal recorded for tens of milliseconds. Every MRI image is built this way, by Fourier analysis of the precessing magnetization.`,
        };
      },
    }),
    mcq({
      id: 'cp-aligned', difficulty: 2,
      prompt: t`A proton spin is prepared exactly along $+z$, parallel to the field $B_0\hat z$. How does it precess?`,
      visual: blochPic({ states: [{ v: [0, 0, 1], label: '\\langle\\vec\\sigma\\rangle' }, { v: [0.15, 0, 1.3], color: 'accent', label: '\\vec B_0' }], caption: 'A spin along the field (the field arrow is drawn slightly offset so both show). Drag to rotate.' }),
      choices: [
        t`It does not: $|{+z}\rangle$ is an energy eigenstate, and only its overall phase changes`,
        t`At the Larmor frequency, in a cone of zero width`,
        t`At twice the Larmor frequency`,
        t`It flips to $-z$ and back at the Larmor frequency`,
      ],
      answer: 0,
      why: {
        1: t`“A cone of zero width” is no motion: every expectation value is constant.`,
        2: t`Twice $\omega_L$ appears nowhere here; the Bloch vector simply stays put.`,
        3: t`Flipping needs a transverse field such as $B_1$; a field along $z$ cannot change $\langle S_z\rangle$, since $[\hat H, \hat S_z] = 0$.`,
      },
      hints: [t`Is $|{+z}\rangle$ an eigenstate of $\hat H = -\gamma B_0\hat S_z$?`],
      teach: 'Only states with a spread of energy evolve visibly; a spin along the field is stationary.',
      explain: t`$|{+z}\rangle$ gains only $e^{i\gamma B_0t/2}$, an overall phase. Precession is the beat between the two energy components, so it needs both of them — which is why NMR must first tip the spins with a π/2 pulse.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §4.4.2', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Hahn, “Spin echoes”, Phys. Rev. 80, 580 (1950)', url: 'https://doi.org/10.1103/PhysRev.80.580' },
    { label: 'CODATA 2022 recommended values (gyromagnetic ratios)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
