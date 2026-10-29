// The adiabatic theorem and Berry's phase (Griffiths & Schroeter §11.5 (2nd
// ed. §10); Berry 1984). A slowly changed Hamiltonian carries the nth
// eigenstate into the nth instantaneous eigenstate; the state picks up a
// dynamical phase −(1/ħ)∫E dt and a geometric phase γ = i∮⟨n|∇_R n⟩·dR that
// depends only on the loop in parameter space. Spin ½ along a field whose
// direction circles a cone of half-angle θ: γ = −Ω/2 = −π(1 − cos θ) (spin
// component m: −mΩ). Gauge-invariant mod 2π for a closed loop; independent of
// how slowly the loop is traversed. Landau–Zener P = exp(−πΔ²/2ħv) as the
// adiabatic condition made quantitative. The same mathematics as parallel
// transport (st-c.C6.3, holonomy) and the Aharonov–Bohm phase
// (phys4700.M7.1). Experiments: Tomita & Chiao (1986), polarization rotation
// in a helically wound fibre equal to the solid angle; Bitter & Dubbers
// (1987), polarized neutrons in a helical field.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, QE, blochPic, r6 } from './_q2b.js';

const t = String.raw;
const DEG = 180 / Math.PI;
const HB_UEVNS = (HBAR / QE) * 1e15;                       // ħ in μeV ns
const lz = (D, v) => Math.exp(-(Math.PI * D * D) / (2 * HB_UEVNS * v));
/** A field direction on a cone of half-angle th (deg) on the sphere, with the cap's boundary and some meridians. */
function conePic(th, caption, { spin = true, at = 60 } = {}) {
  const s = Math.sin(th / DEG), c = Math.cos(th / DEG), a = at / DEG;
  return blochPic({
    marks: false,
    extra: {
      vectors: [{ ...(spin ? { from: [r6(1.02 * s * Math.cos(a)), r6(1.02 * s * Math.sin(a)), r6(1.02 * c)] } : {}), to: [r6(1.4 * s * Math.cos(a)), r6(1.4 * s * Math.sin(a)), r6(1.4 * c)], color: 'accent', label: '\\hat B' }, ...(spin ? [{ to: [r6(s * Math.cos(a)), r6(s * Math.sin(a)), r6(c)], color: 'gold', label: '\\langle\\vec\\sigma\\rangle' }] : [])],
      curves: [{ param: [`${r6(s)}*cos(t)`, `${r6(s)}*sin(t)`, `${r6(c)}`], t: [0, 6.2832], color: 'gold' }, ...[0, 1, 2, 3, 4, 5].map((k) => ({ param: [`sin(t)*${r6(Math.cos((k * Math.PI) / 3))}`, `sin(t)*${r6(Math.sin((k * Math.PI) / 3))}`, 'cos(t)'], t: [0, r6(th / DEG)], color: 'violet' }))],
    },
    caption,
  });
}

export default lesson({
  id: 'phys4710.M7.5',
  title: 'The adiabatic theorem and Berry’s phase',
  minutes: 18, difficulty: 4,
  intro: t`Change a Hamiltonian slowly enough and a system in an energy eigenstate simply **stays** in the corresponding eigenstate as it deforms — the adiabatic theorem. Carry the Hamiltonian round a closed loop and back, and the state returns to itself up to a phase. Part of that phase is the expected $-\frac1\hbar\int E\,dt$; the other part, discovered by Michael Berry in 1984, depends only on the **geometry of the loop**:

$$\begin{gathered} \gamma_n = i\oint\langle n|\nabla_{\!R}\,n\rangle\cdot d\vec R \\ \gamma_{\text{spin }\frac12} = -\tfrac12\,\Omega_{\text{solid}} \end{gathered}$$

For a spin following a magnetic field, $\gamma$ is minus half the solid angle the field direction sweeps out — the quantum cousin of parallel transport around a curved surface.`,
  symbols: [
    { tex: '\\gamma_n', text: 'Berry’s geometric phase for the nth eigenstate, in radians' },
    { tex: '|n\\rangle', text: 'the instantaneous eigenstate, which depends on the parameters R' },
    { tex: '\\vec R', text: 'the slowly changed parameters of the Hamiltonian, e.g. the direction of a magnetic field' },
    { tex: '\\nabla_{\\!R}', text: 'the gradient with respect to those parameters, not position' },
    { tex: '\\Omega_{\\text{solid}}', text: 'the solid angle, in steradians, enclosed by the loop the field direction traces on the unit sphere' },
  ],
  why: 'Geometric phases explain polarization rotation in coiled fibres, the Aharonov–Bohm effect, molecular conical intersections, the quantum Hall effect and topological materials — and they are the quantum face of the holonomy that defines curvature in general relativity.',
  visual: {
    type: 'calc-vectors3d',
    title: 'A field carried round a cone',
    lead: t`A spin ½ (gold) follows a magnetic field (blue, drawn continuing the spin’s arrow) whose direction is carried slowly round a cone of half-angle $\theta$. After one loop the spin is back where it started, with an extra phase $\gamma = -\Omega/2$, where $\Omega = 2\pi(1 - \cos\theta)$ is the solid angle of the cap.`,
    tasks: [
      'Carry the field round with φ: the spin follows it exactly, the adiabatic theorem at work.',
      'Set θ = 90°: the loop is the equator, the cap a hemisphere (2π sr), and γ = −π — a sign flip.',
      'At θ = 180° the loop shrinks to the south pole and encloses the whole sphere: γ = −2π, the same as no phase at all. Only γ mod 2π is physical.',
    ],
    params: {
      range: 1.35, yaw: 0.6, pitch: 0.35,
      sliders: [
        { key: 'th', label: t`Cone half-angle $\theta$`, min: 0, max: 180, step: 1, value: 50, unit: '^\\circ', explain: 'The angle between the field and the cone’s axis.' },
        { key: 'ph', label: t`Azimuth $\varphi$`, min: 0, max: 360, step: 1, value: 60, unit: '^\\circ', explain: 'How far round the loop the field has been carried.' },
      ],
      spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink4' }],
      vectors: [
        { from: ['1.02*sin(th*pi/180)*cos(ph*pi/180)', '1.02*sin(th*pi/180)*sin(ph*pi/180)', '1.02*cos(th*pi/180)'], to: ['1.4*sin(th*pi/180)*cos(ph*pi/180)', '1.4*sin(th*pi/180)*sin(ph*pi/180)', '1.4*cos(th*pi/180)'], color: 'accent', label: '\\hat B' },
        { to: ['sin(th*pi/180)*cos(ph*pi/180)', 'sin(th*pi/180)*sin(ph*pi/180)', 'cos(th*pi/180)'], color: 'gold', label: '\\langle\\vec\\sigma\\rangle' },
      ],
      curves: [
        { param: ['sin(th*pi/180)*cos(t)', 'sin(th*pi/180)*sin(t)', 'cos(th*pi/180)'], t: [0, 6.2832], color: 'gold', dash: true },
        { param: ['sin(th*pi/180)*cos(t*ph/360)', 'sin(th*pi/180)*sin(t*ph/360)', 'cos(th*pi/180)'], t: [0, 6.2832], color: 'gold' },
        ...[0, 1, 2, 3, 4, 5].map((k) => ({ param: [`sin(t*th*pi/180)*${r6(Math.cos((k * Math.PI) / 3))}`, `sin(t*th*pi/180)*${r6(Math.sin((k * Math.PI) / 3))}`, 'cos(t*th*pi/180)'], t: [0, 1], color: 'violet' })),
      ],
      points: [{ at: [0, 0, 1], label: '\\hat z', color: 'ink3' }],
      readouts: [
        { label: t`solid angle $\Omega = 2\pi(1 - \cos\theta)$ (sr)`, expr: '2*pi*(1 - cos(th*pi/180))', digits: 4 },
        { label: t`Berry phase per loop $\gamma = -\Omega/2$ (rad)`, expr: '-pi*(1 - cos(th*pi/180))', digits: 4 },
      ],
    },
    caption: 'The violet meridians outline the cap whose solid angle sets the phase. Adiabatic limit: the field turns slowly compared with the Larmor frequency, so the spin stays aligned. The dynamical phase, which grows with the time taken, is separate and not shown. Drag to rotate.',
  },
  example: {
    prompt: t`A spin-½ particle sits in the up state along a field $\vec B$ whose direction $(\theta, \varphi)$ is carried slowly round the cone of fixed $\theta$, $\varphi$ from 0 to $2\pi$. Compute its Berry phase.`,
    visual: conePic(50, 'The field direction (blue) on its cone, the spin (gold) following it, and the cap (violet meridians) whose solid angle is 2π(1 − cos θ). Drag to rotate.'),
    steps: [
      { label: 'The eigenstate', text: t`Spin up along $(\theta, \varphi)$: $|\chi\rangle = \begin{pmatrix}\cos\frac\theta2\\ e^{i\varphi}\sin\frac\theta2\end{pmatrix}$, single-valued round the loop.` },
      { label: 'The connection', text: t`Only $\varphi$ changes: $\langle\chi|\partial_\varphi\chi\rangle = i\sin^2\frac\theta2$, so $i\langle\chi|\partial_\varphi\chi\rangle = -\sin^2\frac\theta2$.` },
      { label: 'Integrate', text: t`$\gamma = \displaystyle\int_0^{2\pi}\Bigl(-\sin^2\frac\theta2\Bigr)d\varphi = -2\pi\sin^2\frac\theta2 = -\pi(1 - \cos\theta)$.` },
      { label: 'Geometry', text: t`The cap of half-angle $\theta$ has solid angle $\Omega = 2\pi(1 - \cos\theta)$, so $\gamma = -\Omega/2$: half the solid angle, whatever the field’s strength and however slowly (within the adiabatic limit) the loop is traversed.` },
      { label: 'Numbers', text: t`For $\theta = 50^\circ$: $\Omega = ${fmt(2 * Math.PI * (1 - Math.cos(50 / DEG)), 4)}$ sr and $\gamma = ${fmt(-Math.PI * (1 - Math.cos(50 / DEG)), 4)}$ rad $= ${fmt(-180 * (1 - Math.cos(50 / DEG)), 4)}^\circ$.` },
      { label: 'Sense check', text: t`At $\theta = \pi/2$, $\gamma = -\pi$: the spinor changes sign, the famous $-1$ of a spin-½ under a $2\pi$ rotation. Spin-down gets $+\Omega/2$; a spin component $m$ gets $-m\Omega$. The phase is measurable by interfering the particle with a partner that did not go round — Bitter and Dubbers did exactly that with polarized neutrons in a helical field (1987).` },
    ],
    answer: t`$\gamma = -\pi(1 - \cos\theta) = -\Omega/2$: half the solid angle swept by the field direction, independent of the field strength and of the time taken.`,
  },
  practice: [
    num({
      id: 'cone', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 45, 60, 120, 135]);
        const ans = -180 * (1 - Math.cos(th / DEG));
        return {
          prompt: t`A spin-½ particle, aligned with a magnetic field, is taken adiabatically round one full loop as the field’s direction circles a cone of half-angle $\theta = ${th}^\circ$. What is its Berry phase, in degrees?`,
          visual: conePic(th, `The field’s cone (θ = ${th}°) and the cap it bounds. Drag to rotate.`),
          answer: ans, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: -360 * (1 - Math.cos(th / DEG)), feedback: t`For spin ½ the phase is minus *half* the solid angle.` }, { value: -180 * (1 - Math.sin(th / DEG)), feedback: t`The cap’s solid angle is $2\pi(1 - \cos\theta)$, with θ measured from the axis.` }, { value: -ans, feedback: 'A spin along the field (spin up) gets a negative phase, −Ω/2.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$\Omega = 2\pi(1 - \cos\theta)$.`, t`$\gamma = -\Omega/2 = -\pi(1 - \cos\theta)$, i.e. $-180^\circ(1 - \cos\theta)$.`],
          teach: 'For spin ½ the Berry phase is −½ × the solid angle enclosed by the field’s path.',
          explain: t`$\gamma = -180^\circ\times(1 - \cos ${th}^\circ) = ${fmt(ans, 4)}^\circ$.`,
        };
      },
    }),
    mcq({
      id: 'speed', difficulty: 2,
      prompt: t`The field is taken round the same loop twice: once in 1 ms and once in 1 s (both slow enough to be adiabatic). How do the geometric and dynamical phases compare?`,
      visual: conePic(70, 'The same loop traversed at two speeds. Drag to rotate.'),
      choices: [
        'The geometric phase is the same both times; the dynamical phase is 1000 times larger for the slow loop',
        'Both phases are 1000 times larger for the slow loop',
        'The geometric phase is 1000 times larger for the slow loop',
        'Both are the same, because the loop is the same',
      ],
      answer: 0,
      why: {
        1: 'Berry’s phase involves no time integral: it depends only on the path in parameter space.',
        2: 'That is backwards: time only enters the dynamical phase, −(1/ħ)∫E dt.',
        3: 'The dynamical phase grows with the time spent: it is −Et/ħ for a constant energy.',
      },
      hints: [t`$\gamma = i\oint\langle n|\nabla_R n\rangle\cdot d\vec R$ has no $dt$ in it.`],
      teach: 'The geometric phase depends on the loop, not on the speed — which is why it is called geometric.',
      explain: t`The dynamical phase is $-\frac1\hbar\int E\,dt$, proportional to the duration. Berry’s phase is a line integral over the path in parameter space, so it is the same at any (adiabatic) speed — which is how experiments separate the two.`,
    }),
    num({
      id: 'lz', difficulty: 3,
      gen(r) {
        const D = r.pick([0.5, 1, 2]), v = r.pick([0.5, 1, 2, 5]);            // μeV, μeV/ns
        const ans = lz(D, v);
        return {
          prompt: t`Two levels whose energies $\pm\varepsilon/2$ would cross are coupled, opening a minimum gap $\Delta = ${D}\ \mu\text{eV}$. The bias $\varepsilon$ is swept through the crossing at $v = d\varepsilon/dt = ${v}\ \mu\text{eV/ns}$. Landau–Zener: the probability of jumping across the gap (failing to follow adiabatically) is $P = \exp\bigl(-\pi\Delta^2/2\hbar v\bigr)$. Find $P$. ($\hbar = ${fmt(HB_UEVNS, 5)}\ \mu\text{eV ns}$.)`,
          visual: { type: 'graph', params: { x: [-5, 5], y: [-3, 3], aspect: 'wide', xlabel: 'bias ε (units of Δ)', ylabel: 'energy (units of Δ)', axesAt: 'edge', curves: [{ fn: 'sqrt(x^2 + 1)/2', color: 'accent', width: 2.4 }, { fn: '-sqrt(x^2 + 1)/2', color: 'accent', width: 2.4 }, { fn: 'x/2', color: 'ink3', width: 1.4, dash: [5, 4] }, { fn: '-x/2', color: 'ink3', width: 1.4, dash: [5, 4] }] }, caption: 'An avoided crossing: the coupled levels (blue) and the uncoupled ones they would follow (dashed). A slow sweep follows a blue curve; a fast one jumps across.' },
          answer: ans, tol: { rel: 0.01, abs: 1e-4 },
          errors: [{ value: Math.exp(-(2 * Math.PI * D * D) / (HB_UEVNS * v)), feedback: t`Check the factors: $P = \exp(-\pi\Delta^2/2\hbar v)$ with $\Delta$ the full minimum gap.` }, { value: 1 - ans, feedback: 'That is the probability of following adiabatically; the formula gives the jump probability.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.max(ans, 0.01)),
          hints: [t`Work in μeV and ns: $\Delta^2/\hbar v$ is then a pure number.`, t`$\pi\Delta^2/2\hbar v = \pi\times${D}^2/(2\times${fmt(HB_UEVNS, 4)}\times${v})$; then take $e^{-(\ldots)}$.`],
          teach: 'The adiabatic condition, quantified: following fails unless the sweep is slow compared with Δ²/ħ.',
          explain: t`The exponent is $${fmt((Math.PI * D * D) / (2 * HB_UEVNS * v), 4)}$, so $P = ${tex(ans, 3)}$. Halve the gap and the exponent drops fourfold; this exponential sensitivity is used to read out and control spin and charge qubits.`,
        };
      },
    }),
    mcq({
      id: 'meaning', difficulty: 1,
      prompt: t`In quantum mechanics, what does “adiabatic” mean?`,
      visual: { type: 'graph', params: { x: [-5, 5], y: [-3, 3], aspect: 'wide', xlabel: 'parameter', ylabel: 'energy', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: 'sqrt(x^2 + 1)/2', color: 'accent', width: 2.4 }, { fn: '-sqrt(x^2 + 1)/2', color: 'accent', width: 2.4 }] }, caption: 'Two instantaneous energy levels as a parameter is changed.' },
      choices: [
        'Changed slowly compared with the system’s internal frequencies (ΔE/ħ), so it stays in its instantaneous eigenstate',
        'Without heat exchange with the surroundings',
        'Changed very quickly, so the system has no time to respond',
        'At constant energy',
      ],
      answer: 0,
      why: {
        1: 'That is the thermodynamic meaning; the two are related (slow changes preserve entropy) but not the same.',
        2: 'That is the sudden approximation, the opposite limit.',
        3: 'The energy changes as the Hamiltonian changes; it is the quantum number that is preserved.',
      },
      hints: ['Compare the rate of change of H with the gaps between its levels.'],
      teach: 'Quantum adiabatic means slow compared with ħ/(energy gap): the quantum number is conserved.',
      explain: t`The theorem needs the change over a time $\hbar/\Delta E$ to be small. Then the state follows its eigenstate, gaining only phases. (Thermodynamic adiabatic processes are slow in this sense too, which is why entropy — the occupation of levels — is preserved.)`,
    }),
    mcq({
      id: 'gauge', difficulty: 3,
      prompt: t`Multiplying the eigenstates by a parameter-dependent phase, $|n\rangle \to e^{i\beta(\vec R)}|n\rangle$, changes $\langle n|\nabla_Rn\rangle$. Why is Berry’s phase still meaningful?`,
      visual: conePic(80, 'A closed loop of the field direction. Drag to rotate.', { spin: false }),
      choices: [
        t`Round a closed loop the extra term integrates to $\beta(\text{end}) - \beta(\text{start})$, a multiple of $2\pi$ since the states must be single-valued: $\gamma$ mod $2\pi$ is unchanged`,
        'It is not: Berry’s phase depends on the choice of phase and cannot be measured',
        'Because the phase β must be constant',
        'Because only the dynamical phase changes',
      ],
      answer: 0,
      why: {
        1: 'An open path’s phase is gauge-dependent; a closed loop’s is not, and it is measured by interference.',
        2: 'β may vary with R; the argument only uses that it is single-valued.',
        3: 'The dynamical phase is unaffected by this re-phasing; the question is about the geometric part.',
      },
      hints: [t`Under the change, $i\langle n|\nabla n\rangle \to i\langle n|\nabla n\rangle - \nabla\beta$.`, 'The integral of a gradient round a closed loop is the change in the function.'],
      teach: 'Like a magnetic flux, Berry’s phase for a closed loop is gauge-invariant; the “connection” itself is not.',
      explain: t`$\oint\nabla\beta\cdot d\vec R = \beta_{\text{end}} - \beta_{\text{start}} = 2\pi k$. So the closed-loop phase is physical (mod $2\pi$), exactly like the Aharonov–Bohm flux — and the connection $i\langle n|\nabla n\rangle$ plays the role of a vector potential.`,
    }),
    num({
      id: 'spin-m', difficulty: 3,
      gen(r) {
        const [s, m] = r.pick([[1, 1], [1, -1], [1.5, 1.5], [2, 2]]), th = r.pick([40, 60, 90]);
        const Om = 2 * Math.PI * (1 - Math.cos(th / DEG)), ans = -m * Om;
        return {
          prompt: t`For a spin-$${s}$ particle with spin component $m = ${m}$ along a field that is carried round a cone of half-angle $${th}^\circ$, Berry’s phase is $\gamma = -m\,\Omega$. What is $\gamma$, in radians?`,
          visual: conePic(th, `The cone of half-angle ${th}°. Drag to rotate.`, { spin: false }),
          answer: ans, units: 'rad', tol: { rel: 0.005 },
          errors: [{ value: -m * Om / 2, feedback: t`The −½Ω of spin ½ is $-m\Omega$ with $m = \tfrac12$; here $m = ${m}$.` }, { value: m * Om, feedback: 'Mind the sign: γ = −mΩ.' }],
          hints: [t`$\Omega = 2\pi(1 - \cos\theta)$.`, t`Multiply by $-m = ${-m}$.`],
          teach: 'The geometric phase scales with the spin component along the field: γ = −mΩ.',
          explain: t`$\Omega = 2\pi(1 - \cos ${th}^\circ) = ${fmt(Om, 4)}$ sr, so $\gamma = ${fmt(ans, 4)}$ rad.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fibre', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([1, 2, 3]), th = r.pick([20, 30, 45, 60]);
        const ans = (2 * Math.PI * N * (1 - Math.cos(th / DEG))) * DEG;
        return {
          prompt: t`In 1986 Tomita and Chiao sent linearly polarized laser light down a single-mode optical fibre wound as a helix, so that the light’s direction (the fibre’s tangent) traced a cone of half-angle $\theta = ${th}^\circ$ about the helix axis, ${N === 1 ? 'once' : `${N} times`}. Photons have helicity $\pm1$, so the two circular components gain Berry phases $\mp\Omega$, and the plane of linear polarization rotates by $\Omega$, the total solid angle swept. By how many degrees does it rotate?`,
          visual: conePic(th, 'The direction of the light (blue) circling a cone as it follows the helical fibre. Drag to rotate.', { spin: false }),
          answer: ans, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: ans / 2, feedback: t`For photons (helicity ±1) the rotation is the full solid angle $\Omega$, not $\Omega/2$.` }, { value: ans / N, feedback: `The tangent goes round the cone ${N} times: multiply the solid angle by ${N}.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`One turn sweeps $\Omega_1 = 2\pi(1 - \cos\theta)$.`, t`Rotation $= N\Omega_1$, converted to degrees.`],
          teach: 'Berry’s phase is visible in classical-looking optics: a helical fibre rotates polarization by the solid angle its tangent sweeps, independent of wavelength.',
          explain: t`$\Omega = ${N}\times2\pi(1 - \cos ${th}^\circ) = ${fmt(ans / DEG, 4)}$ sr, so the polarization turns by $${fmt(ans, 4)}^\circ$ — independent of the wavelength and of the fibre’s length, as Tomita and Chiao found. It is the same holonomy as parallel transport on a sphere.`,
        };
      },
    }),
    num({
      id: 'cp-half', difficulty: 2,
      gen(r) {
        const th = r.pick([25, 75, 100, 150]);
        const ans = -Math.PI * (1 - Math.cos(th / DEG));
        return {
          prompt: t`What Berry phase, in radians, does a spin ½ aligned with a field acquire when the field’s direction is carried once round a cone of half-angle $${th}^\circ$?`,
          visual: conePic(th, `The cone of half-angle ${th}°. Drag to rotate.`),
          answer: ans, units: 'rad', tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: 'Half the solid angle for spin ½.' }, { value: -ans, feedback: 'For a spin along the field, γ = −Ω/2 (negative).' }],
          hints: [t`$\gamma = -\pi(1 - \cos\theta)$.`],
          teach: 'γ = −π(1 − cos θ) for spin ½ along the field.',
          explain: t`$\gamma = -\pi(1 - \cos ${th}^\circ) = ${fmt(ans, 4)}$ rad.`,
        };
      },
    }),
    mcq({
      id: 'cp-holonomy', difficulty: 3,
      prompt: t`Berry’s phase has the same mathematics as carrying a vector by parallel transport round a loop on a sphere (it returns rotated by the enclosed area divided by $R^2$). What plays the role of the curvature?`,
      visual: { type: 'gr-sphere-transport', params: {}, caption: 'Parallel transport round a loop on a sphere: the arrow comes back rotated by the enclosed area over R².' },
      choices: [
        t`The Berry curvature $\nabla_R\times\vec A$ of the connection $\vec A = i\langle n|\nabla_R n\rangle$; for a spin it is uniform on the sphere of field directions, like a monopole at the centre`,
        'The strength of the magnetic field',
        'The rate at which the field is turned',
        'The energy gap between spin up and spin down',
      ],
      answer: 0,
      why: {
        1: 'The field strength sets the dynamical phase and the adiabatic condition, not γ.',
        2: 'Speed drops out of a geometric phase.',
        3: 'The gap matters for adiabaticity; the curvature of the spin’s state bundle is fixed by its geometry, ±½ per unit solid angle.',
      },
      hints: ['By Stokes’s theorem a loop integral of a connection is a surface integral of its curl.', t`$\gamma = -\tfrac12\times$(solid angle): the integrand is uniform over the sphere.`],
      teach: 'A geometric phase is the flux of a curvature through the loop: the same structure as holonomy in GR and the vector potential in electromagnetism.',
      explain: t`Stokes gives $\gamma = \iint(\nabla_R\times\vec A)\cdot d\vec S$. For spin ½ the curvature is a monopole field of strength −½ at the centre of the sphere of directions, so $\gamma = -\tfrac12\Omega$. Compare [parallel transport on the sphere](#/lesson/st-c.C6.3), where the curvature $1/R^2$ rotates a transported vector by area/$R^2$, and the [Aharonov–Bohm effect](#/lesson/phys4700.M7.1).`,
    }),
  ],
  sources: [
    { label: 'Berry, “Quantal phase factors accompanying adiabatic changes”, Proc. R. Soc. A 392, 45 (1984)', url: 'https://doi.org/10.1098/rspa.1984.0023' },
    { label: 'Tomita & Chiao, “Observation of Berry’s topological phase by use of an optical fiber”, Phys. Rev. Lett. 57, 937 (1986)', url: 'https://doi.org/10.1103/PhysRevLett.57.937' },
    { label: 'Bitter & Dubbers, “Manifestation of Berry’s topological phase in neutron spin rotation”, Phys. Rev. Lett. 59, 251 (1987)', url: 'https://doi.org/10.1103/PhysRevLett.59.251' },
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §11.5', url: 'https://www.cambridge.org/9781316995433' },
  ],
});
