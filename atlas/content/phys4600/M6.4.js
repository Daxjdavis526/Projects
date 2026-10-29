// The stress–energy tensor of the field (Griffiths §8.2 and Problem 12.68, in
// Carroll's −+++ convention): T^μν = (1/μ₀)[F^μα F^ν_α − ¼η^μν F_αβ F^αβ]
// gathers the energy density u (T⁰⁰), the Poynting vector (T⁰ⁱ = Sᵢ/c, equal
// to c times the momentum density) and minus the Maxwell stress (Tⁱʲ = −σᵢⱼ)
// into one symmetric, traceless tensor; ∂_ν T^μν = −F^μλ J_λ is Poynting's
// theorem plus momentum conservation. Explore: em4c-boost with the live T
// array. Worked example: sunlight's T at 1 AU and how it looks to a probe
// receding at 0.1c (each entry × (1 − β)/(1 + β)). Links gr.S16.d (dust,
// fluids, fields), gr.EQ.7 (the perfect fluid) and gr.EQ.1 (T on the right of
// Einstein's equations); avoids M2.3's sails and coils and gr.S16.d's
// magnetar and magnetopause. Transfers: the CMB's radiation pressure from
// tracelessness (p = u/3), an electron meeting a laser head-on (×(1+β)/(1−β)),
// and why a box of light weighs twice its u/c².
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, C, PI, sf, boostPic, tensorTable, MEC2 } from './_em4c.js';

const t = String.raw;
const A_RAD = 7.565733250e-16;   // radiation constant 4σ/c, J m⁻³ K⁻⁴ (CODATA 2022 σ)
const T_CMB = 2.7255;            // K (Fixsen 2009)

// the worked example: sunlight at 1 AU (1361 W/m², TSIS-1 total solar irradiance) seen from a probe receding at 0.1c
const EX = { I: 1361, b: 0.1 };
EX.u = EX.I / C;
EX.D = (1 - EX.b) / (1 + EX.b);
EX.g = 1 / Math.sqrt(1 - EX.b ** 2);
EX.u2 = EX.g ** 2 * (EX.u - 2 * EX.b * EX.u + EX.b ** 2 * EX.u);   // γ²(T⁰⁰ − 2βT⁰¹ + β²T¹¹), all three equal to u
if (Math.abs(EX.u2 / (EX.u * EX.D) - 1) > 1e-12) throw new Error('M6.4: boosted beam');

const T_CELLS = [
  ['u', 'Sx/c', 'Sy/c', 'Sz/c'],
  ['Sx/c', '−σxx', '−σxy', '−σxz'],
  ['Sy/c', '−σyx', '−σyy', '−σyz'],
  ['Sz/c', '−σzx', '−σzy', '−σzz'],
];
const T_COLORS = [['gold', 'accent', 'accent', 'accent'], ['accent', 'violet', 'violet', 'violet'], ['accent', 'violet', 'violet', 'violet'], ['accent', 'violet', 'violet', 'violet']];
const TPIC = (caption, hide = []) => tensorTable(T_CELLS, { caption, colors: T_COLORS, names: ['t', 'x', 'y', 'z'], hide });
/** A plane wave along x: four equal entries. */
const beamTable = (caption) => tensorTable([['u', 'u', '', ''], ['u', 'u', '', ''], ['', '', '', ''], ['', '', '', '']], { caption, colors: T_COLORS, names: ['t', 'x', 'y', 'z'] });

export default lesson({
  id: 'phys4600.M6.4',
  title: 'The stress–energy tensor of the field',
  minutes: 17, difficulty: 4,
  equation: t`T^{\mu\nu} = \frac{1}{\mu_0}\Bigl(F^{\mu\alpha}F^{\nu}{}_{\alpha} - \tfrac14\,\eta^{\mu\nu}F_{\alpha\beta}F^{\alpha\beta}\Bigr) = \begin{pmatrix} u & \vec S/c \\ \vec S/c & -\sigma_{ij} \end{pmatrix}`,
  intro: t`Chapter 8’s bookkeeping had three pieces: the energy density $u$, the energy flux $\vec S$ ([M2.2](#/lesson/phys4600.M2.2)) and the Maxwell stress tensor $\sigma_{ij}$ with the momentum density $\vec g = \vec S/c^2$ ([M2.3](#/lesson/phys4600.M2.3)). Built from $F^{\mu\nu}$, they turn out to be the sixteen entries of one tensor. Its time–time entry is $u$; its time–space entries are $S_i/c$, which is also $c$ times the momentum density — the same numbers, which is why the tensor is **symmetric**; its space block is minus the Maxwell stress, the flow of momentum. Contracting with the metric gives $T^\mu{}_\mu = 0$: the electromagnetic field is **traceless**, the tensor’s way of saying light has no rest mass. Its divergence, $\partial_\nu T^{\mu\nu} = -F^{\mu\lambda}J_\lambda$, is Poynting’s theorem ($\mu = 0$) and momentum conservation ($\mu = i$) in one line: what the field loses, the charges gain. And this is the object that sits on the right of Einstein’s equations: light, and every field, gravitates through all sixteen entries.`,
  symbols: [
    { tex: 'T^{\\mu\\nu}', text: t`the stress–energy tensor of the field, both indices up, in $\text{J/m}^3$ (the same as pascals)` },
    { tex: 'u', text: t`the energy density $\tfrac12\varepsilon_0E^2 + B^2/2\mu_0$` },
    { tex: '\\vec S', text: t`the Poynting vector $\vec E\times\vec B/\mu_0$, in $\text{W/m}^2$` },
    { tex: '\\sigma_{ij}', text: t`the Maxwell stress tensor, $\varepsilon_0(E_iE_j - \tfrac12\delta_{ij}E^2) + \tfrac{1}{\mu_0}(B_iB_j - \tfrac12\delta_{ij}B^2)$` },
    { tex: 'F^{\\mu\\alpha},\\ \\eta^{\\mu\\nu}', text: t`the field tensor of [M6.2](#/lesson/phys4600.M6.2) and the metric $\text{diag}(-1, 1, 1, 1)$` },
    { tex: '\\mu_0', text: 'the permeability of free space' },
  ],
  why: t`In general relativity $G_{\mu\nu} = (8\pi G/c^4)T_{\mu\nu}$ ([gr.EQ.1](#/lesson/gr.EQ.1)): the electromagnetic $T^{\mu\nu}$ is how a magnetic field or a beam of light curves spacetime, the same way the perfect fluid of [gr.EQ.7](#/lesson/gr.EQ.7) does for a star.`,
  visual: {
    type: 'em4c-boost',
    title: 'Energy, flux and stress in one array',
    lead: t`The array is now $T^{\mu\nu}$, computed from the fields above it ($c = 1$, $\mu_0 = 1$). Gold: energy density; blue: energy flux, equal to momentum density; violet: the flow of momentum (stress). Dashed cells are negative. The trace is in the readout.`,
    tasks: [
      t`Pure electric along $y$: $T^{yy} < 0$ — a **tension** along the field lines — and pressure $+u$ across them. The trace $-T^{00} + T^{xx} + T^{yy} + T^{zz}$ is 0.`,
      t`Light wave: four equal entries, $T^{00} = T^{0x} = T^{x0} = T^{xx}$. Boost along the beam: all four shrink by the same factor $(1 - \beta)/(1 + \beta)$ — the Doppler shift, squared.`,
      t`Pure electric again: boost along $x$ and energy flux $T^{0x}$ appears. A moving observer sees the static field carrying energy past.`,
    ],
    params: { preset: 'pureE', presets: ['pureE', 'pureB', 'wave', 'crossedE'], beta: 0, panels: ['fields', 'matrix'], matrix: 'T', matrices: ['T', 'F'], controls: ['beta', 'preset', 'matrix'], readouts: ['u', 'S', 'trace'] },
    caption: t`Exact $T^{\mu\nu}$ of uniform fields for an observer moving along $x$, signature $(-, +, +, +)$, in units with $c = \mu_0 = 1$ (so $u = \tfrac12(E^2 + B^2)$).`,
  },
  example: {
    prompt: t`Sunlight at Earth’s distance delivers $I = ${EX.I}\ \text{W/m}^2$, travelling along $x$ away from the Sun. Write its stress–energy tensor, and find the energy density measured by a probe receding from the Sun at $${EX.b}c$.`,
    visual: beamTable(t`$T^{\mu\nu}$ of a plane wave travelling along $x$: four equal entries, all others zero.`),
    steps: [
      { label: 'Energy density', text: t`For a plane wave $E = cB$, so $u = \varepsilon_0E^2$, and $S = uc$. With $\langle S\rangle = I$: $u = I/c = ${tex(EX.u, 3)}\ \text{J/m}^3$.` },
      { label: 'Flux and momentum', text: t`$T^{0x} = T^{x0} = S/c = I/c$ — the same number.` },
      { label: 'Stress', text: t`$T^{xx} = -\sigma_{xx}$: with $\vec E$ along $y$ and $\vec B$ along $z$, $\sigma_{xx} = -\tfrac12\varepsilon_0E^2 - \tfrac12B^2/\mu_0 = -u$, so $T^{xx} = u$: a pressure of $${nice(sf(EX.u * 1e6, 3))}\ \mu\text{Pa}$ along the beam. $T^{yy} = T^{zz} = 0$.` },
      { label: 'Trace', text: t`$-T^{00} + T^{xx} + T^{yy} + T^{zz} = -u + u + 0 + 0 = 0$ ✓.` },
      { label: 'Boost', text: t`One $\Lambda$ per index: $T'^{00} = \gamma^2(T^{00} - 2\beta T^{0x} + \beta^2T^{xx}) = \gamma^2(1 - \beta)^2u = \dfrac{1 - \beta}{1 + \beta}\,u$.` },
      { label: 'Numbers', text: t`$(1 - ${EX.b})/(1 + ${EX.b}) = ${nice(sf(EX.D, 4))}$, so the probe measures $u' \approx ${tex(EX.u2, 3)}\ \text{J/m}^3$ — one factor of the Doppler shift for each photon’s energy, one for their arrival rate.` },
    ],
    answer: t`$T^{00} = T^{0x} = T^{x0} = T^{xx} = I/c \approx ${tex(EX.u, 3)}\ \text{J/m}^3$, all else zero; the probe measures $u' \approx ${tex(EX.u2, 3)}\ \text{J/m}^3$.`,
  },
  practice: [
    mcq({
      id: 'which-entry', difficulty: 1,
      prompt: t`Which entries of $T^{\mu\nu}$ hold the Poynting vector?`,
      visual: boostPic({ preset: 'crossedE', beta: 0, matrix: 'T', panels: ['fields', 'matrix'] }, t`Crossed fields and their $T^{\mu\nu}$ ($c = \mu_0 = 1$). Here $\vec E\times\vec B$ points along $x$: find where that shows up in the array.`),
      choices: [t`The time row and the time column, $T^{0i} = T^{i0} = S_i/c$`, t`The diagonal, $T^{ii}$`, t`Only $T^{00}$`, t`The space block, $T^{ij}$`],
      answer: 0,
      why: {
        1: t`The space diagonal holds pressures, $-\sigma_{ii}$.`,
        2: t`$T^{00}$ is the energy density.`,
        3: t`The space block is the flow of momentum, minus the Maxwell stress.`,
      },
      hints: ['One index time, one index space: energy (time) flowing in a direction (space).'],
      teach: 'T⁰ⁱ is energy flux over c and Tⁱ⁰ momentum density times c — the same numbers.',
      explain: t`$T^{0i} = S_i/c$ (energy flowing in direction $i$) and $T^{i0} = cg_i$ (density of $i$-momentum), with $\vec g = \vec S/c^2$: the symmetry of $T$ is the statement that energy flow and momentum density are one thing.`,
    }),
    num({
      id: 'T00', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 3, 10]) * 1e6, B = r.pick([0.5, 1, 3]);
        const u = 0.5 * EPS0 * E * E + (B * B) / (2 * MU0);
        return {
          prompt: t`A region has $E = ${tex(E, 2)}$ V/m and $B = ${B}$ T. What is $T^{00}$, in $\text{kJ/m}^3$?`,
          visual: boostPic({ preset: 'custom', E: [0, 0.6, 0], B: [0, 0, 0.9], matrix: 'T', panels: ['matrix'], hide: ['cells'] }, t`$T^{\mu\nu}$ for crossed fields, numbers hidden ($c = \mu_0 = 1$, not to the problem’s scale).`),
          answer: u / 1e3, units: 'kJ/m^3', tol: { rel: 0.01 },
          errors: [{ value: (0.5 * EPS0 * E * E) / 1e3, feedback: t`Include the magnetic energy, $B^2/2\mu_0$ — at these values it dominates.` }, { value: (EPS0 * E * E + (B * B) / MU0) / 1e3, feedback: t`Each term has a factor $\tfrac12$.` }],
          hints: [t`$T^{00} = u = \tfrac12\varepsilon_0E^2 + \dfrac{B^2}{2\mu_0}$.`, t`$B^2/2\mu_0$ for 1 T is about $4\times10^{5}\ \text{J/m}^3$.`],
          teach: 'T⁰⁰ is the field’s energy density; a tesla-scale field stores hundreds of kJ per cubic metre, far more than a MV/m electric field.',
          explain: t`$\tfrac12\varepsilon_0E^2 = ${nice(sf((0.5 * EPS0 * E * E) / 1e3, 3))}$ kJ/m³ and $B^2/2\mu_0 = ${nice(sf((B * B) / (2 * MU0) / 1e3, 3))}$ kJ/m³: $T^{00} \approx ${nice(sf(u / 1e3, 3))}$ kJ/m³. Equal energies need $E = cB$ — 300 MV/m for each tesla.`,
        };
      },
    }),
    num({
      id: 'boosted-u', difficulty: 3,
      gen(r) {
        const E = r.pick([1, 2, 5]), b = r.pick([0.6, 0.8, 0.9]);   // MV/m
        const g = 1 / Math.sqrt(1 - b * b), u0 = 0.5 * EPS0 * (E * 1e6) ** 2, u = u0 * g * g * (1 + b * b);
        return {
          prompt: t`A capacitor’s field is a pure $E = ${E}$ MV/m in the lab. An observer flies parallel to the plates at $${b}c$. What energy density does the observer measure, as a multiple of the lab’s $\tfrac12\varepsilon_0E^2$?`,
          visual: boostPic({ preset: 'pureE', beta: b, matrix: 'T', panels: ['matrix'], hide: ['cells'] }, t`$T'^{\mu\nu}$ of the boosted field, numbers hidden: energy (gold), now also an energy flux (blue). $c = \mu_0 = 1$.`),
          answer: g * g * (1 + b * b), tol: { rel: 0.01 },
          errors: [{ value: g * g, feedback: t`The magnetic field the observer sees adds energy too: $B' = \gamma vE/c^2$ contributes $\gamma^2\beta^2$ times the original.` }, { value: g, feedback: t`Energy density is quadratic in the fields: $E' = \gamma E$ gives $\gamma^2$, and $B'$ adds more.` }],
          hints: [t`$E' = \gamma E$ and $cB' = \gamma\beta E$.`, t`$u' = \tfrac12\varepsilon_0(E'^2 + c^2B'^2) = \tfrac12\varepsilon_0E^2\gamma^2(1 + \beta^2)$.`],
          teach: 'Energy density is not invariant: it is one entry of T, and a boost mixes it with flux and stress.',
          explain: t`$\gamma^2(1 + \beta^2) = ${nice(sf(g * g, 4))}\times${nice(1 + b * b)} \approx ${nice(sf(g * g * (1 + b * b), 3))}$. Equivalently $T'^{00} = \gamma^2(T^{00} + \beta^2T^{xx})$ with $T^{xx} = +u$ for a field across the motion — two $\Lambda$s, no field formulas needed.`,
        };
      },
    }),
    num({
      id: 'doppler2', difficulty: 2,
      gen(r) {
        const b = r.pick([0.2, 0.3, 0.5, 0.6]), away = r.bool(0.5);
        const f = away ? (1 - b) / (1 + b) : (1 + b) / (1 - b);
        return {
          prompt: t`A laser beam’s energy density is $u$ in the lab. An observer moves ${away ? 'along the beam (away from the laser)' : 'against the beam (toward the laser)'} at $${b}c$. What energy density does the observer measure, as a multiple of $u$?`,
          visual: boostPic({ preset: 'wave', beta: away ? b : -b, matrix: 'T', panels: ['matrix'], hide: ['cells'] }, t`$T'^{\mu\nu}$ of a plane wave seen by a moving observer, numbers hidden: still four equal entries. $c = \mu_0 = 1$.`),
          answer: f, tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(f), feedback: t`$\sqrt{(1 \mp \beta)/(1 \pm \beta)}$ is the Doppler factor for frequency. Energy density takes it twice: once for each photon’s energy, once for the rate they arrive.` }, { value: 1 / f, feedback: away ? 'Moving away from the source, the observer sees the beam weaker.' : 'Moving toward the source, the observer sees the beam stronger.' }],
          hints: [t`For a plane wave $T^{00} = T^{0x} = T^{xx} = u$; $T'^{00} = \gamma^2(T^{00} - 2\beta T^{0x} + \beta^2T^{xx})$ with $\beta$ ${away ? 'positive' : 'negative'}.`, t`That is $\gamma^2(1 \mp \beta)^2u = \dfrac{1 \mp \beta}{1 \pm \beta}u$.`],
          teach: 'A plane wave’s T transforms by the square of the Doppler factor.',
          explain: t`$${away ? t`\dfrac{1 - ${b}}{1 + ${b}}` : t`\dfrac{1 + ${b}}{1 - ${b}}`} \approx ${nice(sf(f, 3))}$. Every entry of the beam’s tensor scales the same way, so it is still a beam: no frame turns light into anything else.`,
        };
      },
    }),
    mcq({
      id: 'conservation', difficulty: 3,
      prompt: t`What does the $\mu = 0$ component of $\partial_\nu T^{\mu\nu} = -F^{\mu\lambda}J_\lambda$ say?`,
      visual: TPIC(t`The time row of $T^{\mu\nu}$: energy density and energy flux.`),
      choices: [
        t`Poynting’s theorem: $\partial u/\partial t + \nabla\cdot\vec S = -\vec J\cdot\vec E$`,
        t`Gauss’s law, $\nabla\cdot\vec E = \rho/\varepsilon_0$`,
        t`Newton’s third law for the charges`,
        t`That the field’s energy density never changes`,
      ],
      answer: 0,
      why: {
        1: t`Gauss’s law is a component of $\partial_\nu F^{\mu\nu} = \mu_0J^\mu$, not of the conservation law for $T$.`,
        2: t`The space components ($\mu = i$) are about momentum: $\partial\vec g/\partial t - \nabla\cdot\sigma = -(\rho\vec E + \vec J\times\vec B)$.`,
        3: t`It changes whenever energy flows in or out, or the field does work on charges.`,
      },
      hints: [t`Row 0 of $T$ is $(u, S_x/c, S_y/c, S_z/c)$; $\partial_0 = \tfrac1c\partial_t$.`, t`$-F^{0\lambda}J_\lambda = -F^{0i}J_i = -\vec E\cdot\vec J/c$.`],
      teach: 'The divergence of T is energy and momentum conservation; its time component is Poynting’s theorem.',
      explain: t`$\partial_\nu T^{0\nu} = \dfrac1c\left(\dfrac{\partial u}{\partial t} + \nabla\cdot\vec S\right) = -\dfrac{\vec J\cdot\vec E}{c}$ — [M2.2](#/lesson/phys4600.M2.2) exactly. With no charges, $\partial_\nu T^{\mu\nu} = 0$: the form in which general relativity demands energy–momentum conservation, $\nabla_\nu T^{\mu\nu} = 0$.`,
    }),
    num({
      id: 'gas', difficulty: 2,
      gen(r) {
        const u = r.pick([3, 6, 12, 30]);
        return {
          prompt: t`A box is filled with isotropic radiation of energy density $u = ${u}\ \mu\text{J/m}^3$, so $T^{xx} = T^{yy} = T^{zz} = p$ and the off-diagonal entries are zero. Using only $T^\mu{}_\mu = 0$, find the pressure $p$, in $\mu\text{Pa}$.`,
          visual: tensorTable([['u', '', '', ''], ['', 'p', '', ''], ['', '', 'p', ''], ['', '', '', 'p']], { caption: t`Isotropic radiation: energy density on the corner, the same pressure along each axis.`, colors: T_COLORS, names: ['t', 'x', 'y', 'z'] }),
          answer: u / 3, units: 'uPa', tol: { rel: 0.01 },
          errors: [{ value: u, feedback: t`That is a single beam’s pressure along its direction. Spread over three directions, $-u + 3p = 0$ gives $p = u/3$.` }, { value: u / 2, feedback: t`Count the space dimensions: three diagonal entries.` }],
          hints: [t`$T^\mu{}_\mu = \eta_{\mu\nu}T^{\mu\nu} = -T^{00} + T^{xx} + T^{yy} + T^{zz}$.`, t`$-u + 3p = 0$.`],
          teach: 'Tracelessness makes any isotropic bath of light have p = u/3 — the radiation equation of state of cosmology.',
          explain: t`$p = u/3 = ${nice(sf(u / 3, 3))}\ \mu\text{Pa}$. This is $w = p/\rho c^2 = \tfrac13$, which makes a radiation-dominated universe’s density fall as $a^{-4}$ (see [gr.S16.d](#/lesson/gr.S16.d)).`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cmb', difficulty: 3, transfer: true,
      gen(r) {
        const [z, when] = r.pick([[0, 'today'], [1089, 'at recombination, when the universe became transparent'], [3400, 'at matter–radiation equality']]);
        const T = T_CMB * (1 + z), u = A_RAD * T ** 4, p = u / 3;
        return {
          prompt: t`The cosmic microwave background is a black body at $${nice(sf(T, 4))}$ K ${when}, with energy density $u = aT^4$, $a = ${tex(A_RAD, 4)}\ \text{J m}^{-3}\text{K}^{-4}$. Being isotropic and traceless, what pressure does it exert? Give it in pascals.`,
          visual: tensorTable([['u', '', '', ''], ['', 'u/3', '', ''], ['', '', 'u/3', ''], ['', '', '', 'u/3']], { caption: t`The stress–energy tensor of an isotropic photon gas in its rest frame.`, colors: T_COLORS, names: ['t', 'x', 'y', 'z'] }),
          answer: p, units: 'Pa', tol: { rel: 0.01 },
          errors: [{ value: u, feedback: t`That is the energy density. Tracelessness spreads it as a pressure $u/3$ along each of three axes.` }],
          hints: [t`$u = aT^4$.`, t`$p = u/3$, from $-u + 3p = 0$.`],
          teach: 'Light’s traceless T fixes p = u/3 for any isotropic radiation — the CMB included.',
          explain: t`$u = ${tex(u, 3)}\ \text{J/m}^3$, so $p \approx ${tex(p, 3)}$ Pa. ${z === 0 ? 'A fantastically small pressure, yet the same equation of state governed the universe’s first tens of thousands of years.' : 'Larger by $(1 + z)^4$ than today: the energy of each photon and their number density both grew as the universe shrinks backward in time.'}`,
        };
      },
    }),
    num({
      id: 'cp-headon', difficulty: 3, transfer: true,
      gen(r) {
        const E = r.pick([0.05, 0.5, 2]);   // GeV
        const g = E / MEC2, b = Math.sqrt(1 - 1 / (g * g)), f = (1 + b) / (1 - b);
        return {
          prompt: t`In a laser–electron collision experiment, an electron of ${E * 1e3} MeV ($m_ec^2 = 0.511$ MeV) flies head-on into a laser pulse. By what factor is the pulse’s energy density larger in the electron’s rest frame than in the lab? Give the answer in units of $10^{6}$.`,
          visual: beamTable(t`A plane wave’s stress–energy tensor: each entry is multiplied by the same factor in a frame moving into the beam.`),
          answer: f / 1e6, units: '', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(f) / 1e6, feedback: t`That is the frequency’s Doppler factor. Energy density takes it squared.` }, { value: (g * g) / 1e6, feedback: t`For $\beta \to 1$, $(1 + \beta)/(1 - \beta) \to 4\gamma^2$, not $\gamma^2$.` }],
          hints: [t`$T'^{00} = \dfrac{1 + \beta}{1 - \beta}\,T^{00}$ for an observer moving into the beam.`, t`For $\gamma \gg 1$ this is about $4\gamma^2$, with $\gamma = E/m_ec^2$.`],
          teach: 'Flying into a light beam multiplies its energy density by (1 + β)/(1 − β) ≈ 4γ².',
          explain: t`$\gamma \approx ${nice(sf(g, 4))}$ and $(1 + \beta)/(1 - \beta) \approx 4\gamma^2 \approx ${tex(f, 3)}$. This is why such collisions reach field strengths where radiation reaction ([M5.4](#/lesson/phys4600.M5.4)) becomes measurable.`,
        };
      },
    }),
    mcq({
      id: 'cp-weight', difficulty: 3,
      prompt: t`A mirrored box holds light of total energy $U$. In general relativity a static source’s pull comes from $\rho c^2 + 3p$, not just $\rho c^2$. How strongly does the trapped light gravitate, compared with a mass $U/c^2$ of dust?`,
      visual: tensorTable([['u', '', '', ''], ['', 'u/3', '', ''], ['', '', 'u/3', ''], ['', '', '', 'u/3']], { caption: t`The light inside the box: isotropic, so $p = u/3$. (The box’s walls, under tension, are left out here.)`, colors: T_COLORS, names: ['t', 'x', 'y', 'z'] }),
      choices: [
        t`The light alone gives $u + 3p = 2u$: twice as strongly. The walls’ tension, holding the light in, cancels the extra, so the whole box weighs $U/c^2$`,
        t`Not at all: light has no mass`,
        t`Exactly like $U/c^2$ of dust, with no subtlety`,
        t`Only through its momentum density`,
      ],
      answer: 0,
      why: {
        1: t`Light has no rest mass, but it has energy and pressure, and every entry of $T^{\mu\nu}$ gravitates.`,
        2: t`For the light alone, the pressure term doubles the source; only the box as a whole, with its stressed walls, weighs $U/c^2$.`,
        3: t`In the box’s rest frame the momentum density averages to zero; what remains is $u$ and the pressure.`,
      },
      hints: [t`For isotropic radiation, $p = u/3$.`, t`$\rho c^2 + 3p \to u + 3(u/3)$.`],
      teach: 'Pressure gravitates: light’s traceless T makes radiation pull twice as hard as its u/c², balanced in a box by the walls’ tension.',
      explain: t`$u + 3p = 2u$: Tolman’s result that radiation is a doubly strong source. The tension in the walls, a negative pressure, contributes the opposite amount, and the box as a whole has gravitational mass $U/c^2$ — as it must, by energy conservation. See [gr.S16.d](#/lesson/gr.S16.d) for stress as a source of gravity.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §8.2 and Problem 12.68 (the stress–energy tensor)', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Carroll, Lecture Notes on General Relativity, §1.9 (T^μν of the electromagnetic field)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Fixsen 2009, The temperature of the cosmic microwave background, ApJ 707, 916', url: 'https://doi.org/10.1088/0004-637X/707/2/916' },
    { label: 'Kopp & Lean 2011, A new, lower value of total solar irradiance (TSIS/SORCE, 1361 W/m²)', url: 'https://doi.org/10.1029/2010GL045777' },
  ],
});
