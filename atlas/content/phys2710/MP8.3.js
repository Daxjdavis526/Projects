// Angular momentum and spin — |L| = √(l(l+1))ħ with Lz = mₗħ: the vector
// (cone) model, and why L never points straight along z. An orbiting charge
// is a magnet, μ = −(e/2m)L, so a field B shifts each level by mₗμ_B B: the
// normal Zeeman effect (14.0 GHz per tesla; cadmium's red line). Stern and
// Gerlach (1922) split a beam of silver atoms — l = 0 — into two: spin ½,
// |S| = (√3/2)ħ, S_z = ±ħ/2, g ≈ 2. Transfers: the 21 cm hyperfine line in
// Galileo's hydrogen masers, and Hale's measurement of sunspot fields.
// Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, C } from './_constants.js';
import { HC, MU_B, MU_B_EV, U_KG, H_EVFS, seg, label, r6 } from './_schrodinger.js';

const t = String.raw;
const M_AG = 107.8682 * U_KG;                   // kg, silver (standard atomic weight)
const CD_RED = 643.847;                         // nm, cadmium's red singlet line (¹D₂ → ¹P₁)
const HFS = 1420.405751768e6;                   // Hz, hydrogen's ground-state hyperfine transition
const FE_HALE = { lam: 525.02, g: 3 };          // nm, the Fe I line with Landé factor 3 used for sunspot fields

/**
 * The vector model of angular momentum (graph): a circle of radius √(l(l+1))
 * and the 2l + 1 allowed vectors, each ending at Lz = m. Units of ħ.
 *   l: a number (a still picture) — or 'l' for a slider-driven picture
 *   mark: an m to highlight; numbers: false hides the axis numbers
 */
function cone({ l, mark = null, numbers = true, spin = false, caption } = {}) {
  const live = typeof l === 'string', L2 = live ? 'l*(l+1)' : String(spin ? 0.75 : l * (l + 1));
  const ms = spin ? [-0.5, 0.5] : live ? [-4, -3, -2, -1, 0, 1, 2, 3, 4] : Array.from({ length: 2 * l + 1 }, (_, i) => i - l);
  const top = spin ? 1.3 : live ? 5 : l + 1;
  const arrows = [], points = [], curves = [
    { param: [`sqrt(${L2})*cos(t)`, `sqrt(${L2})*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1.2, dash: [4, 4] },
    seg(0, -top, 0, top, 'ink3', 1.2),
  ];
  for (const m of ms) {
    const when = live ? { when: `step(l - ${Math.abs(m)})` } : {};
    const hi = mark !== null && m === mark;
    const x = live ? `sqrt(max(0, l*(l+1) - ${m * m}))` : r6(Math.sqrt(Math.max(0, (spin ? 0.75 : l * (l + 1)) - m * m)));
    arrows.push({ from: [0, 0], to: [x, m], color: hi ? 'gold' : 'accent', width: hi ? 2.8 : 2, ...when });
    arrows.push({ from: [0, 0], to: [live ? `-${x}` : -x, m], color: 'ink4', width: 1.2, ...when });
    curves.push({ fn: String(m), domain: [r6(-top), r6(top)], color: 'ink4', width: 0.8, dash: [2, 4], ...when });
    points.push({ ...label(top, m, spin ? `Sz = ${m > 0 ? '+' : '−'}½ħ` : `m = ${m}`, hi ? 'gold' : 'ink2', 6, 0, 'left'), ...when });
  }
  points.push(label(0, top, spin ? 'Sz' : 'Lz', 'ink2', 8, 4, 'left'));
  return {
    type: 'graph',
    params: {
      x: [r6(-top - 0.4), r6(top + 2.2)], y: [r6(-top - 0.3), r6(top + 0.3)], equal: true, aspect: live ? '' : 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      ...(live ? { sliders: [{ key: 'l', label: 'Orbital quantum number $l$', min: 1, max: 4, step: 1, value: 2, explain: t`The vector’s length is $\sqrt{l(l+1)}\,\hbar$; its $z$-component can only be $m_l\hbar$ with $m_l = -l, \ldots, l$.` }], readouts: [{ label: t`$|\vec L|/\hbar$`, expr: 'sqrt(l*(l+1))', digits: 3 }, { label: t`largest $L_z/\hbar$`, expr: 'l', digits: 1 }, { label: 'closest approach to the z-axis (degrees)', expr: 'acos(l/sqrt(l*(l+1)))*180/pi', digits: 3 }] } : {}),
      curves, arrows, points,
    },
    caption: caption ?? (spin
      ? 'The vector model for spin ½: a vector of length (√3/2)ħ whose z-component is +½ħ or −½ħ. The cones are a picture, not a path: Sx and Sy are never definite.'
      : 'The vector model: the angular momentum vector (length √(l(l+1)) in units of ħ) can only make the angles whose z-components are whole multiples of ħ. Each vector stands for a cone around the z-axis (its mirror, grey, shows the cone’s other side); Lx and Ly are never definite.'),
  };
}

/** The normal Zeeman effect for an l = 1 level: energies m·μ_B·B against B. */
const fan = (B = null, l = 1, caption = null) => ({
  type: 'graph',
  params: {
    x: [0, 3.4], y: [-3.7, 3.7], aspect: 'wide', axesAt: 'edge', xlabel: 'magnetic field B (T)', ylabel: 'energy shift (units of the Bohr magneton × 1 T)', yticks: 0,
    curves: Array.from({ length: 2 * l + 1 }, (_, i) => i - l).map((m) => ({ fn: `${m}*x`, domain: [0, 3.4], color: m === 0 ? 'ink2' : m > 0 ? 'warn' : 'accent', width: 2.2, label: `mₗ = ${m > 0 ? '+' : ''}${m}`, labelAt: 0.9, labelDx: 0, labelDy: m >= 0 ? -12 : 14 })),
    ...(B ? { vlines: [{ x: B, label: `B = ${B} T`, color: 'gold' }] } : {}),
  },
  caption: caption ?? `An l = ${l} level in a magnetic field: it splits into ${2 * l + 1} equally spaced levels whose shifts grow in proportion to B (spin ignored).`,
});

/** A spectral line split into three (a Zeeman triplet), spacing unlabelled. */
const triplet = (caption) => ({
  type: 'graph',
  params: {
    x: [-3, 3], y: [0, 1.5], aspect: 'wide', axesAt: 'edge', xlabel: 'wavelength (around the line’s centre)', ylabel: '', xticks: 0, yticks: 0, grid: false,
    curves: [seg(-1.5, 0, -1.5, 1, 'accent', 3), seg(0, 0, 0, 1, 'bad', 3), seg(1.5, 0, 1.5, 1, 'accent', 3), seg(-2.6, 0, 2.6, 0, 'ink3', 1)],
    arrows: [{ from: [0, 1.15], to: [1.5, 1.15], color: 'gold', width: 1.6 }, { from: [1.5, 1.15], to: [0, 1.15], color: 'gold', width: 1.6 }],
    points: [label(0.75, 1.15, 'Δλ = ?', 'gold', 0, -12, 'center'), label(0, 1, 'B = 0 line', 'bad', 0, -12, 'center')],
  },
  caption: caption ?? 'A spectral line in a magnetic field splits into three components (the normal Zeeman triplet): one at the original wavelength and two shifted by ±Δλ. Schematic.',
});

/** The Stern–Gerlach experiment (schematic). */
const sg = {
  type: 'graph',
  params: {
    x: [-0.4, 12.4], y: [-2.6, 2.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: '1.5', lower: '-1.5', from: 9.4, to: 9.7, color: 'ink3', alpha: 0.15 }, { fn: '1.9', lower: '0.45 + 0.9*abs(x - 5)', from: 3.6, to: 6.4, color: 'bad', alpha: 0.35 }, { fn: '-0.45', lower: '-1.6', from: 3.6, to: 6.4, color: 'accent', alpha: 0.3 }],
    curves: [
      seg(0, -0.5, 1.1, -0.5, 'ink2', 2), seg(1.1, -0.5, 1.1, 0.5, 'ink2', 2), seg(1.1, 0.5, 0, 0.5, 'ink2', 2), seg(0, 0.5, 0, -0.5, 'ink2', 2),
      seg(1.1, 0, 3.6, 0, 'gold', 2.4), seg(3.6, 0, 6.4, 0.25, 'gold', 2.4), seg(3.6, 0, 6.4, -0.25, 'gold', 2.4), seg(6.4, 0.25, 9.5, 1.2, 'gold', 2.4), seg(6.4, -0.25, 9.5, -1.2, 'gold', 2.4),
      { fn: '0.45 + 0.9*abs(x - 5)', domain: [3.6, 6.4], color: 'bad', width: 1.6 }, seg(3.6, 1.71, 3.6, 1.9, 'bad', 1.6), seg(6.4, 1.71, 6.4, 1.9, 'bad', 1.6), seg(3.6, 1.9, 6.4, 1.9, 'bad', 1.6),
      seg(9.5, -1.6, 9.5, 1.6, 'ink2', 2),
    ],
    points: [
      { x: 9.5, y: 1.2, r: 6, color: 'gold' }, { x: 9.5, y: -1.2, r: 6, color: 'gold' },
      label(0.55, -0.8, 'oven: silver atoms', 'ink2', 0, 8, 'center'), label(5, 2.15, 'magnet (N): pointed pole', 'bad', 0, 0, 'center'), label(5, -1.95, 'magnet (S): flat pole', 'accent', 0, 0, 'center'),
      label(9.75, 1.2, 'two spots', 'gold', 4, 0, 'left'), label(9.75, 0, 'classically: a smear', 'ink3', 4, 0, 'left'),
    ],
  },
  caption: 'The Stern–Gerlach experiment (1922), schematic and not to scale: silver atoms from an oven pass between magnet poles shaped to make the field non-uniform, so the force on each atom depends on its magnetic moment along z. Classically the moments point every way and the beam would smear; it splits in two.',
};

export default lesson({
  id: 'phys2710.MP8.3',
  title: 'Angular momentum and spin',
  minutes: 16, difficulty: 3,
  intro: t`The quantum number $l$ fixes the size of the orbital angular momentum and $m_l$ its component along any chosen axis $z$:

$$|\vec L| = \sqrt{l(l+1)}\,\hbar, \qquad L_z = m_l\hbar, \qquad U = m_l\,\mu_B B$$

Because $l < \sqrt{l(l+1)}$, $\vec L$ can never point exactly along $z$: it lies somewhere on a cone, with $L_x$ and $L_y$ undefined. An orbiting charge is a magnet, so in a magnetic field $B$ along $z$ each state’s energy shifts by $m_l\mu_B B$ — the **Zeeman effect** — where $\mu_B = e\hbar/2m_e = 5.79\times10^{-5}$ eV/T is the Bohr magneton. In 1922 Stern and Gerlach sent silver atoms, whose outer electron has $l = 0$, through a non-uniform field and saw the beam split in **two**: the electron carries an intrinsic angular momentum, **spin**, with $s = \tfrac12$, $|\vec S| = \tfrac{\sqrt3}{2}\hbar$ and $S_z = \pm\tfrac12\hbar$ — and a magnetic moment twice as large, for its angular momentum, as an orbit’s ($g \approx 2$).`,
  symbols: [
    { tex: '\\vec L', text: 'the orbital angular momentum, in J s (units of ħ = 1.055 × 10⁻³⁴ J s)' },
    { tex: 'l', text: 'the orbital quantum number 0, 1, 2 …' },
    { tex: 'm_l', text: 'the magnetic quantum number −l … l, so Lz takes 2l + 1 values' },
    { tex: 'U', text: 'the energy shift of a state in a magnetic field, in J or eV' },
    { tex: '\\mu_B', text: t`the Bohr magneton $e\hbar/2m_e = 9.274\times10^{-24}$ J/T $= 5.788\times10^{-5}$ eV/T: the magnetic moment of one unit of orbital angular momentum` },
    { tex: 'B', text: 'the magnetic field along z, in tesla' },
  ],
  why: 'Angular momentum and spin organise the periodic table, split spectral lines in magnetic fields, set the 21 cm line that maps the Galaxy, and make MRI scanners and atomic clocks work.',
  visual: {
    type: 'graph',
    title: 'The vector model',
    lead: t`The angular momentum $\vec L$ (length $\sqrt{l(l+1)}$ in units of $\hbar$) drawn at each allowed tilt: its $z$-component must be a whole number $m_l$. Change $l$ and read the length, the largest $L_z$ and the closest the vector gets to the $z$-axis.`,
    tasks: [
      'l = 1: three tilts, Lz = −1, 0, +1, and the vector (length √2 = 1.41) never gets closer than 45° to the axis.',
      'Raise l to 4: nine tilts, and the closest approach shrinks to 26.6° — as l grows the vector can point more nearly along z, the classical limit.',
      'Notice Lz = 0 is always allowed: the vector lying flat, perpendicular to z.',
    ],
    params: cone({ l: 'l' }).params,
    caption: cone({ l: 'l' }).caption,
  },
  example: {
    prompt: t`A hydrogen electron is in a $3d$ state ($l = 2$). Find $|\vec L|$, the possible $L_z$, and the smallest angle $\vec L$ can make with the $z$-axis. Then put the atom in a field $B = 1.00$ T along $z$: by how much do the $m_l$ levels shift, and what frequency separates neighbouring ones?`,
    visual: cone({ l: 2, mark: 2, caption: 'The five allowed tilts for l = 2 (units of ħ); the gold one, mₗ = 2, comes closest to the z-axis.' }),
    steps: [
      { label: 'Magnitude', text: t`$|\vec L| = \sqrt{2\cdot3}\,\hbar = \sqrt6\,\hbar = ${fmt(Math.sqrt(6), 3)}\,\hbar = ${tex(Math.sqrt(6) * HBAR, 3)}$ J s.` },
      { label: 'Components', text: t`$L_z = m_l\hbar$ with $m_l = -2, -1, 0, 1, 2$: five values, from $-2\hbar$ to $+2\hbar$.` },
      { label: 'Closest approach', text: t`$\cos\theta = \dfrac{L_z}{|\vec L|} = \dfrac{2}{\sqrt6}$, so $\theta = ${fmt((Math.acos(2 / Math.sqrt(6)) * 180) / Math.PI, 3)}°$. It can never be 0: then $L_x = L_y = 0$ too, and all three components would be known at once.` },
      { label: 'Zeeman shifts', text: t`$U = m_l\mu_BB$: the five levels shift by $0, \pm${fmt(MU_B_EV * 1e6, 3)}$ and $\pm${fmt(2 * MU_B_EV * 1e6, 3)}$ μeV — tiny next to the 1.51 eV binding of $n = 3$.` },
      { label: 'Frequency', text: t`Neighbours differ by $\mu_BB/h = ${fmt(MU_B_EV / (H_EVFS * 1e-15) / 1e9, 3)}$ GHz per tesla — microwaves. Spectral lines split by this frequency, and that is how fields are measured in labs, in stars and in sunspots.` },
      { label: 'Sense check', text: t`In real hydrogen the electron’s spin adds its own magnetic moment, and the pattern is the more complicated “anomalous” Zeeman effect. The clean three-line pattern appears in atoms whose electron spins cancel, like cadmium’s red line.` },
    ],
    answer: t`$|\vec L| = \sqrt6\,\hbar$; $L_z = 0, \pm\hbar, \pm2\hbar$; $\theta_\text{min} = ${fmt((Math.acos(2 / Math.sqrt(6)) * 180) / Math.PI, 3)}°$; shifts of $m_l\times${fmt(MU_B_EV * 1e6, 3)}$ μeV, ${fmt(MU_B_EV / (H_EVFS * 1e-15) / 1e9, 3)} GHz apart.`,
  },
  practice: [
    num({
      id: 'size', difficulty: 1,
      gen(r) {
        const l = r.pick([1, 2, 3, 4]);
        return {
          prompt: t`What is the magnitude of the orbital angular momentum of an electron with $l = ${l}$, in units of $\hbar$?`,
          answer: Math.sqrt(l * (l + 1)), tol: { rel: 0.005 },
          errors: [{ value: l, feedback: t`$l\hbar$ is the largest $L_z$, not the length of $\vec L$: $|\vec L| = \sqrt{l(l+1)}\,\hbar$.` }],
          hints: [t`$|\vec L| = \sqrt{l(l+1)}\,\hbar$.`],
          teach: '|L| = √(l(l+1)) ħ — always a little more than the largest Lz = lħ.',
          explain: t`$|\vec L| = \sqrt{${l}\cdot${l + 1}}\,\hbar = \sqrt{${l * (l + 1)}}\,\hbar = ${fmt(Math.sqrt(l * (l + 1)), 3)}\,\hbar$, more than the largest $L_z = ${l}\hbar$.`,
          visual: cone({ l, numbers: false, caption: t`The allowed tilts for $l = ${l}$, drawn to scale in units of $\hbar$ (the dashed circle’s radius is the length asked for).` }),
        };
      },
    }),
    num({
      id: 'angle', difficulty: 2,
      gen(r) {
        const [l, m] = r.pick([[1, 1], [2, 1], [3, 2], [3, 1], [4, 3]]), th = (Math.acos(m / Math.sqrt(l * (l + 1))) * 180) / Math.PI;
        return {
          prompt: t`For $l = ${l}$ and $m_l = ${m}$, what angle does $\vec L$ make with the $z$-axis, in degrees?`,
          answer: th, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: (Math.acos(m / l) * 180) / Math.PI, feedback: t`The vector’s length is $\sqrt{l(l+1)} = ${fmt(Math.sqrt(l * (l + 1)), 3)}$, not $l$.` }],
          hints: [t`$\cos\theta = \dfrac{m_l}{\sqrt{l(l+1)}}$.`],
          teach: 'cos θ = mₗ/√(l(l+1)): the allowed tilts of the angular momentum are quantized.',
          explain: t`$\cos\theta = ${m}/\sqrt{${l * (l + 1)}} = ${fmt(m / Math.sqrt(l * (l + 1)), 4)}$, so $\theta = ${fmt(th, 3)}°$.`,
          visual: cone({ l, mark: m, caption: t`The allowed tilts for $l = ${l}$ (units of $\hbar$); the gold vector has $m_l = ${m}$.` }),
        };
      },
    }),
    mcq({
      id: 'never-along-z', difficulty: 2,
      prompt: t`Why can the orbital angular momentum never point exactly along the $z$-axis (except when $l = 0$)?`,
      choices: [
        t`If it did, $L_x$ and $L_y$ would both be exactly zero along with a definite $L_z$ — all three components known at once, which quantum mechanics forbids`,
        'The magnetic field of the nucleus tilts it away from z',
        'It can, for the state mₗ = l; the cone picture is just a drawing convention',
        'Because the electron is always moving, its angular momentum must keep changing direction',
      ],
      answer: 0,
      why: {
        1: 'No field is needed: the rule holds for any isolated atom and any choice of z.',
        2: t`For $m_l = l$, $L_z = l\hbar$ is still less than $|\vec L| = \sqrt{l(l+1)}\,\hbar$: the vector is tilted by $\arccos(l/\sqrt{l(l+1)})$.`,
        3: 'In a stationary state nothing about L changes with time; the cone describes what is undefined, not a precession.',
      },
      hints: [t`Compare the largest $L_z$, $l\hbar$, with $|\vec L| = \sqrt{l(l+1)}\,\hbar$.`, t`$L_x^2 + L_y^2 = |\vec L|^2 - L_z^2 \ge l\hbar^2 > 0$: what does that say about $L_x$ and $L_y$?`],
      teach: 'Only one component of L can be definite at a time, so L is never exactly along z — the extra l in l(l+1) is that indefiniteness.',
      explain: t`$L_x^2 + L_y^2 = l(l+1)\hbar^2 - m_l^2\hbar^2 \ge l\hbar^2$: some angular momentum is always left perpendicular to $z$, in an undefined direction. The components of $\vec L$ obey an uncertainty relation like $x$ and $p$.`,
      visual: cone({ l: 3, mark: 3, caption: 'The allowed tilts for l = 3 (units of ħ). Even the gold vector, mₗ = 3, is tilted away from the z-axis.' }),
    }),
    num({
      id: 'zeeman-shift', difficulty: 2,
      gen(r) {
        const B = r.pick([0.5, 1.5, 2, 3]), dU = MU_B_EV * B * 1e6;
        return {
          prompt: t`An atom’s $l = 1$ level sits in a magnetic field of ${B} T. Ignoring spin, how far apart in energy are neighbouring $m_l$ levels, in μeV?`,
          answer: dU, units: 'μeV', tol: { rel: 0.01 },
          errors: [{ value: 2 * dU, feedback: t`That is the spread from $m_l = -1$ to $+1$. Neighbouring levels differ by $\Delta m_l = 1$.` }],
          hints: [t`$U = m_l\mu_BB$, so neighbours differ by $\mu_BB$.`, t`$\mu_B = 5.788\times10^{-5}$ eV/T.`],
          teach: t`The normal Zeeman effect splits an $l$ level into $2l + 1$ levels $\mu_BB$ apart — 57.9 μeV per tesla.`,
          explain: t`$\mu_BB = (5.788\times10^{-5}\ \text{eV/T})(${B}\ \text{T}) = ${fmt(dU, 3)}$ μeV — a hundred-thousandth of a typical atomic energy, but easily seen in a spectrometer.`,
          visual: fan(B),
        };
      },
    }),
    num({
      id: 'cadmium', difficulty: 2,
      gen(r) {
        const B = r.pick([0.5, 1, 1.5]), dl = (CD_RED * CD_RED * MU_B_EV * B) / HC;
        return {
          prompt: t`Cadmium’s red line at ${CD_RED} nm comes from a transition between levels in which the electron spins cancel, so it shows the normal Zeeman effect: in a field $B$ it splits into three lines separated in photon energy by $\mu_BB$. How far apart in wavelength are neighbouring lines for $B = ${B}$ T, in pm?`,
          answer: dl * 1000, units: 'pm', tol: { rel: 0.01 },
          errors: [{ value: ((CD_RED * MU_B_EV * B) / HC) * 1000, feedback: t`That is $\Delta\lambda/\lambda$ times 1 nm. The shift is $\Delta\lambda = \lambda^2\Delta E/hc$ — two factors of $\lambda$.` }],
          hints: [t`From $\lambda = hc/E$: $|\Delta\lambda| = \dfrac{\lambda^2}{hc}\,\Delta E$.`, t`$\Delta\lambda = \dfrac{(${CD_RED}\ \text{nm})^2(5.788\times10^{-5}\ \text{eV/T})(${B}\ \text{T})}{1240\ \text{eV nm}}$.`],
          teach: 'A small energy splitting ΔE moves a line by Δλ = λ²ΔE/hc.',
          explain: t`$\Delta\lambda = ${fmt(dl, 3)}$ nm $= ${fmt(dl * 1000, 3)}$ pm — a few hundredths of a nanometre, resolved by Zeeman in 1896 with a good diffraction grating and an electromagnet. Lorentz’s explanation gave the charge-to-mass ratio of the radiating charge — close to the value Thomson measured for cathode rays in 1897.`,
          visual: triplet(),
        };
      },
    }),
    mcq({
      id: 'stern-gerlach', difficulty: 2,
      prompt: t`In the Stern–Gerlach experiment the outer electron of each silver atom has $l = 0$, so it has no orbital magnetic moment. Yet the beam splits into exactly two spots. What does this show?`,
      choices: [
        t`The electron has an intrinsic angular momentum — spin — with $s = \tfrac12$, whose component along $z$ takes $2s + 1 = 2$ values`,
        t`The outer electron really has $l = 1$`,
        'Silver has two isotopes, ¹⁰⁷Ag and ¹⁰⁹Ag, which the magnet separates by mass',
        'The atoms’ magnetic moments point every way, as classical magnets would',
      ],
      answer: 0,
      why: {
        1: t`$l = 1$ would give $2l + 1 = 3$ spots. An even number of spots cannot come from orbital angular momentum, which always gives an odd number.`,
        2: 'The force depends on the magnetic moment, not on the mass; the 2% mass difference would barely shift the spots, not separate them.',
        3: 'Random classical orientations would smear the atoms continuously across the screen — exactly what was not seen.',
      },
      hints: [t`An angular momentum with quantum number $j$ has $2j + 1$ components along $z$. What $j$ gives 2?`],
      teach: 'Two beams mean 2s + 1 = 2: the electron carries spin ½, with Sz = ±½ħ.',
      explain: t`$2s + 1 = 2$ gives $s = \tfrac12$: $|\vec S| = \sqrt{\tfrac12\cdot\tfrac32}\,\hbar = \tfrac{\sqrt3}{2}\hbar$ and $S_z = \pm\tfrac12\hbar$. Stern and Gerlach did not know it — spin was proposed by Uhlenbeck and Goudsmit in 1925 — but their two spots were its first direct sign. “Spin” is a name, not a picture: no spinning ball reproduces it.`,
      visual: sg,
    }),
    num({
      id: 'spin-angle', difficulty: 2,
      prompt: t`An electron’s spin has $|\vec S| = \sqrt{s(s+1)}\,\hbar$ with $s = \tfrac12$, and $S_z = +\tfrac12\hbar$. What angle does $\vec S$ make with the $z$-axis, in degrees?`,
      answer: (Math.acos(1 / Math.sqrt(3)) * 180) / Math.PI, units: 'deg', tol: { rel: 0.005 },
      errors: [{ value: 60, feedback: t`$\cos\theta = S_z/|\vec S|$ with $|\vec S| = \tfrac{\sqrt3}{2}\hbar$, not $\hbar$.` }],
      hints: [t`$|\vec S| = \sqrt{\tfrac12\cdot\tfrac32}\,\hbar = \tfrac{\sqrt3}{2}\hbar$.`, t`$\cos\theta = \dfrac{1/2}{\sqrt3/2} = \dfrac{1}{\sqrt3}$.`],
      teach: 'Spin ½ has |S| = (√3/2)ħ and Sz = ±ħ/2, so it always lies 54.7° from whichever axis is measured.',
      explain: t`$\cos\theta = 1/\sqrt3$, $\theta = ${fmt((Math.acos(1 / Math.sqrt(3)) * 180) / Math.PI, 3)}°$ — the same angle as the nodal cone of $Y_{20}$, and the “magic angle” of solid-state NMR.`,
      visual: cone({ spin: true }),
    }),
    num({
      id: 'sg-split', difficulty: 3,
      gen(r) {
        const G = r.pick([500, 1000, 1500]), v = r.pick([500, 600]), L = 0.035;
        const a = (MU_B * G) / M_AG, tt = L / v, sep = a * tt * tt;          // each beam is deflected ½at²; they part by at²
        return {
          prompt: t`In a Stern–Gerlach magnet the force on an atom is $F_z = \mu_z\,dB/dz$, and for a silver atom $\mu_z = \pm\mu_B$ (the spin’s $g \approx 2$ times $S_z/\hbar = \pm\tfrac12$). Silver atoms ($m = 107.9$ u) cross a magnet 3.5 cm long at ${v} m/s through a gradient $dB/dz = ${G}$ T/m. How far apart are the two beams as they leave the magnet, in mm?`,
          answer: sep * 1000, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (sep / 2) * 1000, feedback: 'That is one beam’s deflection, ½at². The other is deflected the same amount the other way.' }],
          hints: [t`Each beam accelerates at $a = \mu_B\,(dB/dz)/m$ for a time $t = L/v$.`, t`Each is deflected $\tfrac12at^2$, in opposite directions, so the separation is $at^2$.`],
          teach: 'The spin’s two orientations feel opposite forces in a field gradient, so the beam splits by a(L/v)².',
          explain: t`$a = \dfrac{(9.274\times10^{-24})(${G})}{${tex(M_AG, 4)}} = ${tex(a, 3)}\ \text{m/s}^2$ and $t = ${tex(tt, 3)}$ s, so the beams part by $at^2 = ${fmt(sep * 1000, 3)}$ mm. Stern and Gerlach’s split was about 0.2 mm — they first saw it as a darkening on a glass plate, made visible (the story goes) by sulphur from Stern’s cheap cigar.`,
          visual: sg,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-shell', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]);
        return {
          prompt: t`Counting spin, how many distinct electron states $(n, l, m_l, m_s)$ belong to hydrogen’s level $n = ${n}$?`,
          answer: 2 * n * n, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n * n, feedback: t`$n^2$ counts the orbitals; each holds two spin states, $m_s = \pm\tfrac12$.` }],
          hints: [t`There are $n^2$ combinations of $l$ and $m_l$; each comes with $m_s = +\tfrac12$ or $-\tfrac12$.`],
          teach: 'With spin, level n holds 2n² states — 2, 8, 18, 32: the lengths of the periodic table’s shells.',
          explain: t`$2n^2 = ${2 * n * n}$. With the exclusion principle (one electron per state), these numbers set the rows of the periodic table — the next module.`,
          visual: cone({ spin: true, caption: 'Each orbital comes with the two spin orientations, Sz = +½ħ and −½ħ.' }),
        };
      },
    }),
    mcq({
      id: 'cp-split-count', difficulty: 2,
      prompt: t`Ignoring spin, an atomic level with $l = 2$ is placed in a magnetic field. What happens to it?`,
      choices: [
        t`It splits into 5 equally spaced levels, $\mu_BB$ apart`,
        t`It splits into 2 levels, one for each spin direction`,
        t`It splits into 5 levels with spacings growing as $m_l^2$`,
        t`It splits into 3 levels, like every Zeeman pattern`,
      ],
      answer: 0,
      why: {
        1: 'Two levels is what spin ½ alone would give; this question sets spin aside and asks about l = 2.',
        2: t`$U = m_l\mu_BB$ is linear in $m_l$, so the spacing is uniform.`,
        3: 'Three is the number of spectral lines in the normal Zeeman effect (from the selection rule Δmₗ = 0, ±1), not the number of levels.',
      },
      hints: [t`$U = m_l\mu_BB$ with $m_l = -l, \ldots, l$.`],
      teach: 'An l level splits into 2l + 1 equally spaced Zeeman levels.',
      explain: t`$m_l = -2, \ldots, 2$ gives five levels at $U = m_l\mu_BB$, equally spaced. (Transitions obey $\Delta m_l = 0, \pm1$, so a spectral line still shows only three components.)`,
      visual: fan(null, 1, 'For comparison, an l = 1 level in a magnetic field: its shifts grow in proportion to B (spin ignored).'),
    }),
    num({
      id: 'cp-maser', difficulty: 3, transfer: true,
      prompt: t`The Galileo navigation satellites keep time with passive hydrogen masers. In hydrogen’s ground state the electron’s and proton’s spins can be parallel or antiparallel, and the two arrangements differ slightly in energy (the hyperfine splitting); the flip between them is at 1 420 405 751.768 Hz — the same transition radio astronomers see as the 21 cm line. What is the energy difference, in μeV?`,
      answer: HFS * H_EVFS * 1e-15 * 1e6, units: 'μeV', tol: { rel: 0.005 },
      errors: [{ value: (HFS * H_EVFS * 1e-15 * 1e6) / (2 * Math.PI), feedback: t`$E = hf$, with $h = 4.136\times10^{-15}$ eV s — not $\hbar$.` }],
      hints: [t`$\Delta E = hf$ with $h = 4.1357\times10^{-15}$ eV s.`, t`$\Delta E = (4.1357\times10^{-15})(1.4204\times10^{9})$ eV.`],
      teach: 'Spin flips have tiny energies — microelectronvolts — and therefore very sharp, very stable frequencies.',
      explain: t`$\Delta E = hf = ${fmt(HFS * H_EVFS * 1e-15 * 1e6, 4)}$ μeV, a photon of wavelength $c/f = ${fmt((C / HFS) * 100, 4)}$ cm. Because the level lives about 10 million years in isolation, the line is extraordinarily sharp: a maser locked to it drifts by only about a nanosecond a day, which is what lets Galileo place a receiver to within metres. The same line, from cold hydrogen gas, mapped the Milky Way’s spiral arms.`,
      visual: cone({ spin: true, caption: 'The two orientations of a spin ½ along z. In hydrogen’s hyperfine flip it is the relative orientation of the electron’s and proton’s spins that changes.' }),
    }),
    num({
      id: 'cp-sunspot', difficulty: 3, transfer: true,
      gen(r) {
        const B = r.pick([0.15, 0.25, 0.3, 0.4]), dl = (FE_HALE.g * FE_HALE.lam ** 2 * MU_B_EV * B) / HC * 1000, dlr = +dl.toPrecision(3);
        const Bfit = (dlr / 1000) * HC / (FE_HALE.g * FE_HALE.lam ** 2 * MU_B_EV);
        return {
          prompt: t`In 1908 George Ellery Hale found that lines in sunspot spectra were split: the first magnetic field measured beyond Earth. An iron line at ${FE_HALE.lam} nm, whose effective Landé factor (accounting for spin) is $g = ${FE_HALE.g}$, has its outer components shifted by $\Delta\lambda = g\,\lambda^2\mu_BB/hc$. If they are shifted by ${dlr} pm, what is the sunspot’s field, in tesla?`,
          answer: Bfit, units: 'T', tol: { rel: 0.01 },
          errors: [{ value: Bfit * FE_HALE.g, feedback: t`Divide by $g = ${FE_HALE.g}$: this line splits ${FE_HALE.g} times more than a normal Zeeman line.` }],
          hints: [t`$B = \dfrac{\Delta\lambda\,hc}{g\,\lambda^2\mu_B}$.`, t`$B = \dfrac{(${dlr}\times10^{-3}\ \text{nm})(1240\ \text{eV nm})}{${FE_HALE.g}(${FE_HALE.lam}\ \text{nm})^2(5.788\times10^{-5}\ \text{eV/T})}$.`],
          teach: 'Zeeman splitting turns a spectrum into a magnetometer — on the Sun, in stars, and for magnetars.',
          explain: t`$B = ${fmt(Bfit, 3)}$ T — thousands of times Earth’s field, strong enough to choke off the convection that heats the surface, which is why sunspots are dark. Solar observatories now map fields across the whole disc this way, every few minutes.`,
          visual: triplet('The iron line splits into a triplet in the sunspot’s field: one component at the original wavelength and two shifted by ±Δλ, three times further than a normal Zeeman line would be. Schematic.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §8.2–8.3 (orbital magnetic dipole moment, electron spin)', url: 'https://openstax.org/books/university-physics-volume-3/pages/8-3-electron-spin' },
    { label: 'Gerlach & Stern (1922), Der experimentelle Nachweis der Richtungsquantelung im Magnetfeld, Z. Phys. 9, 349', url: 'https://doi.org/10.1007/BF01326983' },
    { label: 'Hale (1908), On the probable existence of a magnetic field in sun-spots, Astrophys. J. 28, 315', url: 'https://doi.org/10.1086/141602' },
    { label: 'ESA Navipedia: Galileo passive hydrogen maser clocks', url: 'https://gssc.esa.int/navipedia/index.php/Galileo_Clocks' },
  ],
});
