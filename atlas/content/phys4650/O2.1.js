// Light from Maxwell's equations, in matter (Hecht §3.1–3.2, §3.5.1). PHYS 3750
// W12 derived the vacuum wave and its polarization; this lesson is brief on
// that and takes the optics angle: in a linear, isotropic, uncharged
// dielectric the same derivation gives v = 1/√(εμ), hence Maxwell's relation
// n = √(K_E K_M) ≈ √K_E — which works for air and diamond and fails badly for
// water and glass, because K_E depends on frequency (the door to O3.1).
// Transversality from ∇·E = 0, B₀ = nE₀/c in a medium, the extra transit time
// of a slab. Transfer: the extra delay of a laser-ranging pulse through the
// atmosphere, from ∫(n − 1)dz with an exponential atmosphere.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, sf, nOf, MATS, bare } from './_op.js';

const t = String.raw;

// the worked example: static dielectric constants against optical indices
// (Hecht, Optics, Table 3.1; water: CRC Handbook, 20 °C; fused silica at 1 MHz)
const EX = [
  { name: 'air (0 °C, 1 atm)', K: 1.00059, n: 1.000293 },
  { name: 'water (20 °C)', K: 80.1, n: 1.333 },
  { name: 'fused silica', K: 3.8, n: 1.458 },
];

/** Axes for a wave travelling along +z: x up, y out of the page... drawn as a 2D sketch with z to the right. */
const axesSketch = (arrows, caption, extra = {}) => ({
  type: 'graph',
  params: bare([-0.6, 4.2], [-1.4, 1.4], {
    arrows: [
      { from: [0, 0], to: [3.8, 0], color: 'ink3', width: 1.4, label: 'z' },
      { from: [0, 0], to: [0, 1.2], color: 'ink3', width: 1.4, label: 'x' },
      { from: [0, 0], to: [-0.5, -0.6], color: 'ink3', width: 1.4, label: 'y', labelDx: -14 },
      ...arrows,
    ],
    ...extra,
  }),
  caption,
});

export default lesson({
  id: 'phys4650.O2.1',
  title: 'Light from Maxwell’s equations',
  minutes: 12, difficulty: 3,
  intro: t`In [PHYS 3750 W12](#/lesson/phys3750.W12.1) Maxwell’s equations in vacuum gave a wave travelling at $c = 1/\sqrt{\varepsilon_0\mu_0}$. Inside a **linear, isotropic** material with no free charge or current, the equations keep their form with $\varepsilon_0 \to \varepsilon = K_E\varepsilon_0$ and $\mu_0 \to \mu = K_M\mu_0$, so the same derivation gives a wave at $v = 1/\sqrt{\varepsilon\mu}$. The refractive index follows — **Maxwell’s relation**:

$$n = \frac{c}{v} = \sqrt{\frac{\varepsilon\mu}{\varepsilon_0\mu_0}} = \sqrt{K_EK_M} \approx \sqrt{K_E}$$

It works for air and diamond and fails badly for water. The failure is the interesting part: $K_E$ measured with static fields is not the $K_E$ light feels at $5\times10^{14}$ Hz.`,
  symbols: [
    { tex: 'n', text: 'the refractive index: how many times slower than $c$ the wave’s phase travels' },
    { tex: 'c', text: t`the speed of light in vacuum, $299\,792\,458$ m/s exactly` },
    { tex: 'v', text: 'the phase speed in the material, in m/s' },
    { tex: '\\varepsilon,\\ \\varepsilon_0', text: 'the permittivity of the material and of vacuum, in F/m' },
    { tex: '\\mu,\\ \\mu_0', text: 'the permeability of the material and of vacuum, in N/A²' },
    { tex: 'K_E', text: t`the relative permittivity (dielectric constant) $\varepsilon/\varepsilon_0$ — **at the light’s frequency**` },
    { tex: 'K_M', text: t`the relative permeability $\mu/\mu_0$; within $10^{-5}$ of 1 for transparent optical materials, so $n \approx \sqrt{K_E}$` },
  ],
  why: t`Maxwell’s relation turns a refractive index into an electrical property of matter, and its failures point straight at the electrons and molecules that make the index — the subject of O3.1.`,
  visual: {
    type: 'em-wave',
    title: 'A light wave, as Maxwell’s equations make it',
    lead: t`A plane light wave: violet arrows are $\vec E$, teal arrows $\vec B$, and the gold arrow the direction of travel. Both fields are **perpendicular to the travel** (that is $\nabla\cdot\vec E = 0$ and $\nabla\cdot\vec B = 0$), perpendicular to each other, and in phase. Drag to rotate.`,
    tasks: [
      t`Turn the polarization angle: $\vec E$ and $\vec B$ rotate together, always at right angles, and $\vec E\times\vec B$ always points along the travel.`,
      t`Raise $E_0$ and watch the readouts: $B_0 = E_0/c$ here in vacuum; in glass of index $n$ it would be $nE_0/c$.`,
    ],
    params: { E0: 800, f: 5.64e14 },
    caption: t`A plane wave in vacuum; arrow lengths show the field strengths, not to scale with the wavelength (here 532 nm). In a medium the picture is the same with a shorter wavelength $\lambda_0/n$ and $B_0 = nE_0/c$.`,
  },
  example: {
    prompt: t`Test Maxwell’s relation $n \approx \sqrt{K_E}$ on three materials, using their dielectric constants measured with static (or 1 MHz) fields and their refractive indices for yellow light: ${EX.map((m) => t`${m.name}, $K_E = ${m.K}$, $n = ${m.n}$`).join('; ')}.`,
    visual: { type: 'graph', params: { x: [0.5, 3.5], y: [0, 10], aspect: 'wide', xlabel: '', ylabel: 'n', xticks: 0, yticks: 5,
      points: EX.flatMap((m, i) => [
        { x: i + 1 - 0.12, y: Math.sqrt(m.K), color: 'warn', r: 6, label: `√K = ${sf(Math.sqrt(m.K), 3)}`, labelAlign: 'right', labelDx: -10, labelDy: -10 },
        { x: i + 1 + 0.12, y: m.n, color: 'accent', r: 6, label: `n = ${m.n}`, labelDx: 10, labelDy: -10 },
        { x: i + 1, y: 0.4, r: 0, label: ['air', 'water', 'fused silica'][i], color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 },
      ]),
      legend: [{ label: '√K (static field)', color: 'warn', point: true }, { label: 'n (yellow light)', color: 'accent', point: true }], legendAt: 'tr' }, caption: t`Maxwell’s prediction (orange) against the measured index (blue). For air the two dots overlap.` },
    steps: [
      { label: 'Air', text: t`$\sqrt{${EX[0].K}} = ${sf(Math.sqrt(EX[0].K), 7)}$ against $n = ${EX[0].n}$: agreement to a few parts in $10^{6}$. Air’s molecules are nonpolar and only their electrons respond — at any frequency up to the ultraviolet.` },
      { label: 'Water', text: t`$\sqrt{${EX[1].K}} = ${sf(Math.sqrt(EX[1].K), 3)}$ against $1.333$: wrong by a factor of 6.7. Water molecules carry permanent dipoles that line up in a static field (hence $K_E \approx 80$) but cannot turn $5\times10^{14}$ times a second.` },
      { label: 'Fused silica', text: t`$\sqrt{${EX[2].K}} = ${sf(Math.sqrt(EX[2].K), 3)}$ against $1.458$: in a static field the Si and O ions shift too; at optical frequencies they are too heavy to follow, and only the electrons are left.` },
      { label: 'Conclusion', text: t`Maxwell’s relation is right if $K_E$ is taken **at the light’s frequency**: $n(\omega) = \sqrt{K_E(\omega)}$. Measured with light, water has $K_E = n^2 \approx 1.78$. How $K_E$ depends on $\omega$ is dispersion — the oscillator model of O3.1.` },
    ],
    answer: t`Air: $\sqrt{K_E} = ${sf(Math.sqrt(EX[0].K), 7)}$ ≈ $n$. Water: $${sf(Math.sqrt(EX[1].K), 3)}$ ≫ $1.333$. Fused silica: $${sf(Math.sqrt(EX[2].K), 3)}$ > $1.458$. The relation holds with $K_E$ at optical frequencies.`,
  },
  practice: [
    order({
      id: 'derive-medium', difficulty: 2,
      prompt: t`Put in order the derivation of the wave equation for $\vec E$ in a linear, isotropic, uncharged, non-conducting medium.`,
      visual: { type: 'em-wave', params: { E0: 800, f: 5.64e14, phase: 30, controls: false, readout: false }, caption: t`The wave the derivation ends with. Not to scale.` },
      items: [
        t`Take the curl of Faraday’s law: $\nabla\times(\nabla\times\vec E) = -\partial_t(\nabla\times\vec B)$.`,
        t`Use Ampère–Maxwell with no current: $\nabla\times\vec B = \mu\varepsilon\,\partial_t\vec E$.`,
        t`So $\nabla\times(\nabla\times\vec E) = -\mu\varepsilon\,\partial_t^2\vec E$.`,
        t`Expand: $\nabla\times(\nabla\times\vec E) = \nabla(\nabla\cdot\vec E) - \nabla^2\vec E$, and $\nabla\cdot\vec E = 0$ with no free charge.`,
        t`Hence $\nabla^2\vec E = \mu\varepsilon\,\partial_t^2\vec E$: a wave with $v = 1/\sqrt{\mu\varepsilon}$.`,
      ],
      hints: ['Start from the law that has a curl of E in it.', t`You need a second curl to reach $\nabla^2\vec E$, and Ampère–Maxwell to turn $\nabla\times\vec B$ back into $\vec E$.`],
      teach: t`In a uniform linear medium Maxwell’s equations are the vacuum ones with $\varepsilon_0\mu_0 \to \varepsilon\mu$, so light travels at $1/\sqrt{\varepsilon\mu}$.`,
      explain: t`Curl Faraday, substitute Ampère–Maxwell, and use $\nabla\cdot\vec E = 0$ to kill the gradient term: $\nabla^2\vec E = \mu\varepsilon\,\partial_t^2\vec E$. Comparing with $\nabla^2\psi = \partial_t^2\psi/v^2$ gives $v = 1/\sqrt{\mu\varepsilon}$, so $n = c/v = \sqrt{K_EK_M}$.`,
    }),
    num({
      id: 'speed-from-K', difficulty: 1,
      gen(r) {
        const K = r.pick([1.77, 2.13, 2.25, 2.4, 3.1, 5.86]);
        const v = C / Math.sqrt(K);
        return {
          prompt: t`Measured at optical frequencies, a transparent material has $K_E = ${K}$ and $K_M = 1$. At what speed does light travel in it, in m/s?`,
          visual: { type: 'graph', params: { x: [1, 6.5], y: [0, 3.2e8], aspect: 'wide', xlabel: 'K (at optical frequency)', ylabel: 'v (m/s)', curves: [{ fn: `${C}/sqrt(x)`, color: 'accent', width: 2.2 }], vlines: [{ x: K, color: 'gold', label: `K = ${K}` }] }, caption: t`The speed $c/\sqrt{K_E}$ against the dielectric constant felt by the light.` },
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: C / K, feedback: t`$n = \sqrt{K_E}$, not $K_E$: take the square root before dividing.` }],
          hints: [t`$n = \sqrt{K_EK_M}$.`, t`$v = c/n$.`],
          teach: t`Maxwell’s relation: $n = \sqrt{K_EK_M}$, with $K_E$ taken at the light’s frequency; then $v = c/n$.`,
          explain: t`$n = \sqrt{${K}} = ${sf(Math.sqrt(K), 4)}$, so $v = c/n = ${tex(v, 4)}$ m/s.`,
        };
      },
    }),
    mcq({
      id: 'water-paradox', difficulty: 2,
      prompt: t`Water’s dielectric constant in a static field is about 80, yet its refractive index for visible light is 1.33, not $\sqrt{80} \approx 8.9$. Why?`,
      visual: { type: 'graph', params: { x: [0, 16], y: [0, 9.5], aspect: 'wide', xlabel: 'log₁₀ of frequency (Hz)', ylabel: '√K', xticks: 8, yticks: 4,
        curves: [{ fn: '1.333 + (8.95 - 1.333)*0.5*(1 - tanh(2.2*(x - 10.3)))', color: 'accent', width: 2.2, domain: [0, 13.5] }],
        points: [{ x: 1, y: 8.95, color: 'warn', label: 'static: √80', labelDy: 14 }, { x: 14.7, y: 1.333, color: 'accent', label: 'visible: 1.33', labelAlign: 'right', labelDx: -10 }] },
        caption: t`Schematic: $\sqrt{K_E}$ of water falls from about 9 to about 1.3 somewhere between microwaves and the infrared. The real curve has absorption bands and wiggles not drawn here.` },
      choices: [
        'Its molecules’ permanent dipoles line up in a slow field but cannot turn fast enough to follow light.',
        'Maxwell’s equations do not apply inside liquids.',
        'The static measurement includes the conductivity of the dissolved salts.',
        t`Water is magnetic enough that $K_M$ cancels most of $K_E$.`,
      ],
      answer: 0,
      why: {
        1: 'They apply everywhere; it is the material’s response that changes with frequency.',
        2: t`Pure water barely conducts, and conduction would not raise the static permittivity anyway; the large $K_E$ comes from the molecules’ dipoles.`,
        3: t`Water is very slightly diamagnetic: $K_M - 1 \approx -9\times10^{-6}$. That cannot change $n$ by a factor of 7.`,
      },
      hints: [t`$K_E$ measures how strongly the material polarizes. What does the polarizing at a few hertz, and at $5\times10^{14}$ Hz?`],
      teach: t`$K_E$ depends on frequency: slow fields polarize matter by turning molecules and shifting ions, light only by shifting electrons.`,
      explain: t`In a static field water’s polar molecules turn to align, giving $K_E \approx 80$. At optical frequencies they are far too sluggish (they relax in picoseconds; light reverses $10^{15}$ times a second), only the electron clouds respond, and $K_E(\omega) = n^2 \approx 1.78$. Maxwell’s relation survives; the static $K_E$ was the wrong number. (The same effect heats food in a microwave oven, at 2.45 GHz, where the turning lags and absorbs.)`,
    }),
    num({
      id: 'B-in-medium', difficulty: 2,
      gen(r) {
        const mat = r.pick(['bk7', 'f2', 'sapphire', 'diamond']), nm = r.pick([532, 633, 1064]), E0 = r.pick([150, 400, 900, 2500]);
        const n = nOf(mat, nm), B0 = (n * E0) / C;
        return {
          prompt: t`A ${nm} nm beam inside ${MATS[mat].name} ($n = ${sf(n, 4)}$) has electric-field amplitude ${E0} V/m. What is its magnetic-field amplitude, in μT?`,
          visual: axesSketch([{ from: [1.6, 0], to: [1.6, 1.0], color: 'violet', width: 2.6, label: 'E⃗' }, { from: [1.6, 0], to: [1.1, -0.6], color: 'teal', width: 2.6, label: 'B⃗ = ?', labelDx: -40 }, { from: [1.6, 0], to: [2.6, 0], color: 'gold', width: 2.6, label: 'travel' }], t`The fields at one point and instant: $\vec E$ along $x$, $\vec B$ along $y$, travel along $z$. Arrow lengths not to scale.`),
          answer: B0 * 1e6, units: 'μT', tol: { rel: 0.005 },
          errors: [{ value: (E0 / C) * 1e6, feedback: t`$E_0/c$ is the vacuum relation. In a medium $B_0 = E_0/v = nE_0/c$.` }, { value: (E0 / (n * C)) * 1e6, feedback: t`In a medium the wave is slower, so $B_0 = E_0/v$ is *larger*: multiply by $n$.` }],
          hints: [t`Faraday’s law for a plane wave gives $B_0 = E_0/v$.`, t`$v = c/n$, so $B_0 = nE_0/c$.`],
          teach: t`For a plane wave $B_0 = E_0/v$; in a medium of index $n$ that is $nE_0/c$.`,
          explain: t`$B_0 = nE_0/c = (${sf(n, 4)})(${E0})/(${tex(C, 4)}) = ${tex(B0 * 1e6, 3)}$ μT.`,
        };
      },
    }),
    mcq({
      id: 'transverse', difficulty: 2,
      prompt: t`Which of these could be the electric field of a light wave in empty space, travelling along $+z$? ($E_0$, $k$, $\omega$ constants.)`,
      visual: axesSketch([{ from: [0.4, 0], to: [3.2, 0], color: 'gold', width: 2.6, label: 'k⃗ (travel)', labelDy: 12 }], t`Axes: the wave travels along $+z$.`),
      choices: [t`$\vec E = E_0\,\hat y\cos(kz - \omega t)$`, t`$\vec E = E_0\,\hat z\cos(kz - \omega t)$`, t`$\vec E = E_0\,\hat y\cos(kx - \omega t)$`, t`$\vec E = E_0\,\hat y\cos(kz - \omega t)\,e^{-z/L}$`],
      answer: 0,
      why: {
        1: t`Its divergence is $\partial E_z/\partial z = -kE_0\sin(kz - \omega t) \ne 0$, but Gauss’s law in empty space demands $\nabla\cdot\vec E = 0$: light is transverse.`,
        2: t`This one travels along $x$ (its phase is $kx - \omega t$), not along $z$.`,
        3: t`A wave that dies away in empty space with no absorber violates energy conservation; it does not satisfy the wave equation either.`,
      },
      hints: [t`Check $\nabla\cdot\vec E = 0$ and the direction the phase moves.`],
      teach: t`$\nabla\cdot\vec E = 0$ makes a plane light wave transverse: $\vec E\perp\vec k$.`,
      explain: t`$E_0\hat y\cos(kz - \omega t)$ has zero divergence, travels along $+z$, and satisfies the wave equation with $\omega = ck$. Its partner is $\vec B = -(E_0/c)\,\hat x\cos(kz - \omega t)$, so that $\vec E\times\vec B$ points along $+z$.`,
    }),
    num({
      id: 'slab-delay', difficulty: 2,
      gen(r) {
        const mat = r.pick(['bk7', 'silica', 'sapphire', 'sf11']), nm = r.pick([532, 800, 1064]), L = r.pick([2, 5, 10, 25]);
        const n = nOf(mat, nm), dt = ((n - 1) * L * 1e-2) / C;
        return {
          prompt: t`A laser pulse at ${nm} nm crosses a ${L} cm block of ${MATS[mat].name} ($n = ${sf(n, 4)}$). How much later does it emerge than a pulse that crossed ${L} cm of vacuum, in picoseconds? (Use the phase index; the pulse’s group index is a little higher — O5.)`,
          visual: { type: 'graph', params: bare([-1, 7], [-1.2, 1.2], { shade: [{ fn: '0.8', lower: '-0.8', from: 2, to: 5, color: 'teal', alpha: 0.2 }], arrows: [{ from: [-0.6, 0.35], to: [6.6, 0.35], color: 'ink3', width: 1.4, dash: [5, 4], label: 'vacuum' }, { from: [-0.6, -0.35], to: [6.6, -0.35], color: 'gold', width: 2.2, label: 'through the block' }], points: [{ x: 3.5, y: 0.95, r: 0, label: `${L} cm`, color: 'teal', labelAlign: 'center', labelDx: 0, labelDy: -4 }] }), caption: t`Two paths of the same length, one through the block. Schematic.` },
          answer: dt * 1e12, units: 'ps', tol: { rel: 0.005 },
          errors: [{ value: ((n * L * 1e-2) / C) * 1e12, feedback: t`That is the whole transit time through the block, $nL/c$. The *extra* time compared with vacuum is $(n - 1)L/c$.` }],
          hints: [t`Time in the block: $nL/c$; in vacuum: $L/c$.`, t`The difference is $(n - 1)L/c$.`],
          teach: t`A thickness $L$ of index $n$ delays light by $(n-1)L/c$ compared with vacuum: optical path is time.`,
          explain: t`$\Delta t = (n - 1)L/c = (${sf(n - 1, 4)})(${L / 100}\ \text{m})/c = ${sf(dt * 1e12, 3)}$ ps.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-zenith-delay', difficulty: 3, transfer: true,
      gen(r) {
        const H = r.pick([8.0, 8.4, 8.8]), nm1 = r.pick([2.77, 2.79, 2.83]);
        const n1 = nm1 * 1e-4, path = n1 * H * 1e3, dt = path / C;
        return {
          prompt: t`A lunar-laser-ranging station fires 532 nm pulses straight up. At the station, air has $n - 1 = ${nm1}\times10^{-4}$, and $n - 1$ is proportional to the air’s density, which falls off with height as $e^{-z/H}$ with $H = ${H}$ km. How much later does a pulse reach the top of the atmosphere than it would through vacuum, in nanoseconds?`,
          visual: { type: 'graph', params: { x: [0, 3.2], y: [0, 40], aspect: 'wide', xlabel: '(n − 1) × 10⁴', ylabel: 'height z (km)', curves: [{ param: [`${nm1}*exp(-t/${H})`, 't'], t: [0, 40], color: 'accent', width: 2.2 }], shade: [], points: [{ x: nm1, y: 0, color: 'gold', label: 'station', labelDy: -12 }] }, caption: t`The refractivity $n - 1$ against height in an exponential atmosphere — a model: real profiles follow temperature and humidity.` },
          answer: dt * 1e9, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: (n1 * H * 1e3 * 2 / C) * 1e9, feedback: 'That is the round trip (up and down); the question asks for one way through the atmosphere.' }, { value: ((1 + n1) * H * 1e3 / C) * 1e9, feedback: t`That is the whole travel time over one scale height. The *extra* delay is $\int(n-1)\,dz/c$.` }],
          hints: [t`The extra delay is $\dfrac1c\int_0^\infty (n - 1)\,dz$.`, t`$\int_0^\infty (n_0 - 1)e^{-z/H}dz = (n_0 - 1)H$.`],
          teach: t`The extra optical path through a medium is $\int(n - 1)\,ds$; for an exponential atmosphere at the zenith it is $(n_0 - 1)H$, about 2.3 m.`,
          explain: t`Extra path $= (n_0 - 1)H = (${nm1}\times10^{-4})(${H}\times10^{3}\ \text{m}) = ${sf(path, 3)}$ m, so the delay is $${sf(dt * 1e9, 3)}$ ns each way. Ranging to the Moon to millimetres means modelling this delay to better than one part in a thousand.`,
        };
      },
    }),
    mcq({
      id: 'cp-maxwell-relation', difficulty: 2,
      prompt: t`Static dielectric constants: diamond 5.7, ethanol 24.5, fused silica 3.8, water 80. Visible-light indices: 2.42, 1.36, 1.46, 1.33. For which material does Maxwell’s relation $n \approx \sqrt{K_E}$ work best?`,
      visual: { type: 'graph', params: { x: [0.4, 4.6], y: [0, 9.5], aspect: 'wide', xlabel: '', ylabel: 'n', xticks: 0, yticks: 4, points: [['diamond', 5.7, 2.42], ['ethanol', 24.5, 1.36], ['silica', 3.8, 1.46], ['water', 80, 1.33]].flatMap(([nm, K, n], i) => [{ x: i + 0.88, y: Math.sqrt(K), color: 'warn', r: 5 }, { x: i + 1.12, y: n, color: 'accent', r: 5 }, { x: i + 1, y: 0.45, r: 0, label: nm, color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 }]), legend: [{ label: '√K (static)', color: 'warn', point: true }, { label: 'n (visible)', color: 'accent', point: true }], legendAt: 'tr' } , caption: t`The static $\sqrt{K_E}$ (orange) beside the visible index (blue) for each material.` },
      choices: ['Diamond', 'Ethanol', 'Fused silica', 'Water'],
      answer: 0,
      why: {
        1: t`$\sqrt{24.5} \approx 4.9$, far from 1.36: ethanol molecules are polar, like water’s.`,
        2: t`$\sqrt{3.8} \approx 1.95$ against 1.46: the ions’ displacement adds to the static $K_E$ but cannot follow light.`,
        3: t`$\sqrt{80} \approx 8.9$ against 1.33: the worst of the four.`,
      },
      hints: ['Compute √K for each and compare with n.', 'Which material has neither polar molecules nor mobile ions — only electrons that polarize?'],
      teach: t`Maxwell’s relation holds where only electrons polarize — nonpolar, covalently bonded materials such as diamond and simple gases.`,
      explain: t`$\sqrt{5.7} = ${sf(Math.sqrt(5.7), 3)}$ against 2.42. Diamond is a covalent crystal of one element: no permanent dipoles, no ions, so its static and optical $K_E$ are nearly the same.`,
    }),
    num({
      id: 'cp-B-ratio', difficulty: 2,
      gen(r) {
        const mat = r.pick(['water', 'bk7', 'sapphire', 'diamond']), nm = r.pick([450, 589.3, 700]);
        const n = nOf(mat, nm);
        return {
          prompt: t`In vacuum a plane wave has $B_0/E_0 = 1/c$. Inside ${MATS[mat].name} at ${nm} nm ($n = ${sf(n, 4)}$), what is $cB_0/E_0$?`,
          visual: axesSketch([{ from: [1.6, 0], to: [1.6, 1.0], color: 'violet', width: 2.6, label: 'E⃗' }, { from: [1.6, 0], to: [1.1, -0.6], color: 'teal', width: 2.6, label: 'B⃗', labelDx: -14 }, { from: [1.6, 0], to: [2.6, 0], color: 'gold', width: 2.6, label: 'travel' }], t`$\vec E$, $\vec B$ and the travel direction at one point. Arrow lengths not to scale.`),
          answer: n, tol: { rel: 0.003 },
          errors: [{ value: 1 / n, feedback: t`The wave is slower in the medium, so $B_0 = E_0/v$ is larger, not smaller: $cB_0/E_0 = c/v = n$.` }, { value: 1, feedback: t`$B_0 = E_0/c$ only in vacuum; in a medium $B_0 = E_0/v$.` }],
          hints: [t`$B_0 = E_0/v$ for any plane wave.`],
          teach: t`In a medium $B_0/E_0 = 1/v = n/c$.`,
          explain: t`$cB_0/E_0 = c/v = n = ${sf(n, 4)}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §3.1–3.2 and Table 3.1 (Maxwell’s relation)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'D. J. Griffiths, Introduction to Electrodynamics, 4th ed., §9.3', url: 'https://doi.org/10.1017/9781108333511' },
  ],
});
