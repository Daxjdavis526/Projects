// Lasers — Einstein’s absorption, spontaneous and stimulated emission; why
// thermal equilibrium (and any two-level scheme) can never invert a
// population; three- and four-level pumping (ruby, Nd:YAG) and the
// helium–neon laser’s energy transfer; gain against loss, threshold, the
// Doppler width of the neon line and the cavity’s modes (Maxwell–Boltzmann
// again); the quantum defect; and lasers in space: altimeters such as MOLA
// and LIGO’s 1064 nm light. A virtual laser on model/mp-laser.js; every
// number is computed here or there.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, C, KB, KB_EV, HC_EVNM, QE } from './_constants.js';
import { U_KG } from './_quanta.js';
import * as LZ from '../../src/viz/model/mp-laser.js';
import { levels, seg, label, frame, r6 } from './_atoms.js';

const t = String.raw;
const eV = (nm) => HC_EVNM / nm;
// vacuum wavelengths, nm
const LASERS = {
  hene: { name: 'helium–neon', nm: 632.99, note: 'red; 632.8 nm in air' },
  ruby: { name: 'ruby', nm: 694.3, note: 'deep red; the first laser, 1960' },
  yag: { name: 'Nd:YAG', nm: 1064, note: 'near infrared' },
  argon: { name: 'argon-ion', nm: 488.0, note: 'blue-green' },
  krf: { name: 'krypton fluoride excimer', nm: 248.4, note: 'ultraviolet, for chip lithography and eye surgery' },
  co2: { name: 'carbon dioxide', nm: 10600, note: 'mid infrared, for cutting steel' },
};
// the helium–neon levels that matter, eV above each atom’s ground state (NIST ASD)
const HE_2S = 20.616, NE_UP = 20.663, NE_LO = NE_UP - eV(632.99);
const kT = (T) => KB_EV * T;
const nbar = (x) => 1 / Math.expm1(x);
const dopplerGHz = (nm, T, Mu) => ((C / (nm * 1e-9)) / C) * Math.sqrt((8 * KB * T * Math.LN2) / (Mu * U_KG)) / 1e9;

/** A laser cavity: the gain medium between a full and a partial mirror. Schematic. */
const cavity = (Lcm, R2, caption) => ({
  type: 'graph',
  params: frame([-1.5, 13.5], [-2.6, 2.8], {
    aspect: 'wide',
    shade: [{ fn: '0.7', lower: '-0.7', from: 1, to: 9, color: 'accent', alpha: 0.18 }, { fn: '1.6', lower: '-1.6', from: -0.35, to: 0, color: 'ink2', alpha: 0.9 }, { fn: '1.6', lower: '-1.6', from: 10, to: 10.35, color: 'ink3', alpha: 0.5 }, { fn: '0.12', lower: '-0.12', from: 10.35, to: 13.3, color: 'bad', alpha: 0.6 }],
    curves: [seg(0, -2.1, 10.2, -2.1, 'ink3', 1.2), seg(0, -2.3, 0, -1.9, 'ink3', 1.2), seg(10.2, -2.3, 10.2, -1.9, 'ink3', 1.2)],
    arrows: [{ from: [2, 0.3], to: [8, 0.3], color: 'bad', width: 2 }, { from: [8, -0.3], to: [2, -0.3], color: 'bad', width: 2 }],
    points: [label(5.1, -2.1, `L = ${Lcm} cm`, 'ink2', 0, 12, 'center'), label(-0.2, 1.6, 'R₁ = 99.9%', 'ink2', 0, -12, 'center'), label(10.2, 1.6, `R₂ = ${R2}`, 'ink2', 0, -12, 'center'), label(5, 0.7, 'gain medium', 'accent', 0, -12, 'center'), label(12, 0.12, 'beam', 'bad', 0, -12, 'center')],
  }),
  caption: caption ?? 'A laser cavity, schematic: light bounces between a full mirror and a partly transmitting output mirror, gaining energy each pass through the medium.',
});

/** The helium–neon levels near 20 eV, to scale (the two ground states lie about 20 eV below). */
const heneLevels = (ask) => levels([
  { E: HE_2S, label: 'helium 2s (metastable): 20.62 eV', x0: 0, x1: 3, color: 'good', labelLeft: true },
  { E: NE_UP, label: 'neon 5s (upper laser level): 20.66 eV', x0: 4.6, x1: 8, color: 'ink' },
  { E: NE_LO, label: 'neon 3p (lower laser level): 18.70 eV', x0: 4.6, x1: 8, color: 'ink' },
  { E: NE_LO - 0.32, label: 'neon 3s levels, then the ground state', x0: 4.6, x1: 8, color: 'ink3', dash: true },
], {
  arrows: [
    { from: HE_2S - 0.55, to: HE_2S, x: 1.5, color: 'violet', label: 'electron impact' },
    { from: HE_2S, to: NE_UP, x: 3, x2: 4.6, color: 'good', label: 'collision', dy: -12, dash: true },
    { from: NE_UP, to: NE_LO, x: 6.3, color: 'bad', label: ask ? 'λ = ?' : '632.8 nm' },
    { from: NE_LO, to: NE_LO - 0.32, x: 7.4, color: 'ink3', dash: true },
  ],
  x: [-7.5, 15], pad: 0.18,
  caption: 'The helium–neon laser’s levels near 20 eV, to scale (NIST). A discharge excites helium to its metastable 2s level; collisions hand the energy to neon’s nearly equal 5s level; the laser line runs down to neon’s 3p level, which empties fast. Both ground states lie about 20 eV below.',
});

export default lesson({
  id: 'phys2710.MP10.3',
  title: 'Lasers',
  minutes: 16, difficulty: 3, lab: true,
  intro: t`In 1917 Einstein found that an atom can interact with light in three ways: it can **absorb** a photon, emit one **spontaneously**, or be **stimulated** to emit by a passing photon — and the stimulated photon is an exact copy of the one that triggered it, with the same frequency, direction, phase and polarization. Light travelling through a medium with $N_2$ atoms per volume in an upper level and $N_1$ in a lower one (of equal degeneracy) therefore grows or fades as

$$I(z) = I_0\,e^{\sigma(N_2 - N_1)z}$$

In thermal equilibrium $N_2 < N_1$ always, so light is absorbed. A **laser** — light amplification by stimulated emission of radiation — needs a **population inversion**, $N_2 > N_1$, made by pumping atoms through extra levels, and mirrors that send the light back through the medium until its gain beats its losses.

> Why equilibrium cannot invert came in [Maxwell–Boltzmann statistics](#/lesson/phys2710.MP10.1); photons as bosons, which crowd into occupied states, in [Fermi–Dirac and Bose–Einstein statistics](#/lesson/phys2710.MP10.2).`,
  symbols: [
    { tex: 'I(z)', text: 'the intensity of the light after it has travelled a distance $z$ through the medium, in W/m²' },
    { tex: 'I_0', text: 'the intensity going in' },
    { tex: '\\sigma', text: 'the transition’s cross-section, in m²: how strongly one atom absorbs, or is stimulated to emit, at the light’s frequency' },
    { tex: 'N_2,\\ N_1', text: 'the numbers of atoms per m³ in the upper and lower levels of the transition' },
    { tex: 'z', text: 'the distance travelled through the medium, in m' },
    { tex: 'N_2 - N_1', text: 'positive: gain (a laser medium); negative: absorption (every medium in thermal equilibrium)' },
  ],
  why: 'Lasers measure distances to the Moon and the heights of Martian mountains, carry the internet through optical fibre, cut steel, and in LIGO detected spacetime stretching by less than a proton’s width.',
  visual: {
    type: 'mp-laser',
    title: 'A laser, atom by atom',
    lead: t`Top: the medium’s energy levels with its 40 atoms as dots. Middle: the cavity, with the photons of the laser mode bouncing between the mirrors (red), spontaneous photons escaping sideways (gold) and the beam leaving on the right. Bottom: the steady state against the pump rate — the inversion (gold) and the laser output (red).`,
    tasks: [
      'Press Start from the ground state: the pump lifts atoms, they collect in the upper laser level, spontaneous photons scatter — and once the inversion is enough, photons along the axis multiply into a beam.',
      'Switch to three-level (ruby) at the same pump: its lower laser level is the ground state, almost full, so nothing lases until more than half the atoms are pumped. Find the threshold.',
      'Switch to two-level and pump as hard as you like: the upper level never holds more atoms than the lower one.',
    ],
    params: { scheme: 'four', W: 0.5, R: 0.95 },
  },
  example: {
    prompt: t`A helium–neon laser emits 632.8 nm light (632.99 nm in vacuum) from neon atoms in a discharge at about 400 K. Find the photon energy, show that thermal excitation could never invert the two neon levels, and explain how the tube does it.`,
    visual: heneLevels(false),
    steps: [
      { label: 'The photon', text: t`$E = hc/\lambda = 1239.84\ \text{eV nm}/632.99\ \text{nm} = ${fmt(eV(632.99), 4)}$ eV, at frequency $c/\lambda = ${tex(C / 632.99e-9, 4)}$ Hz.` },
      { label: 'Thermal populations', text: t`At 400 K, $k_BT = ${fmt(kT(400), 3)}$ eV, so the Boltzmann factor for the gap is $e^{-${fmt(eV(632.99), 4)}/${fmt(kT(400), 3)}} = ${tex(Math.exp(-eV(632.99) / kT(400)), 2)}$. Heat alone puts essentially no atom in the upper level — let alone more than in the lower one. No temperature can do it: $N_2/N_1 \to g_2/g_1$ at most.` },
      { label: 'Pump by collision', text: t`The discharge’s electrons excite helium atoms to their metastable 2s level at ${HE_2S} eV, where they can stay for a long time. Colliding with ground-state neon, they hand over their energy to neon’s 5s level at ${NE_UP} eV: a mismatch of only ${fmt(NE_UP - HE_2S, 2)} eV, about ${fmt((NE_UP - HE_2S) / kT(400), 2)} $k_BT$, made up from the atoms’ motion.` },
      { label: 'Four levels', text: t`The laser line runs from neon’s 5s level down to its 3p level at ${fmt(NE_LO, 4)} eV, which drains quickly into lower levels. With the lower laser level nearly empty, even a modest pump keeps $N_2 > N_1$: a four-level scheme.` },
      { label: 'Sense check', text: t`The energy budget is honest: each photon carries ${fmt(eV(632.99), 3)} eV of the ${HE_2S} eV the discharge put into a helium atom — under 10%, and helium–neon lasers are indeed inefficient, around 0.1% from the wall socket. What they offer is a beam of extraordinary purity of colour and direction.` },
    ],
    answer: t`The photon carries ${fmt(eV(632.99), 4)} eV; thermal excitation would give the upper level a share of about $${tex(Math.exp(-eV(632.99) / kT(400)), 1)}$ and never an inversion; collisions with metastable helium fill neon’s upper level, and its lower level empties fast.`,
  },
  practice: [
    num({
      id: 'photon-energy', difficulty: 1,
      gen(r) {
        const key = r.pick(['ruby', 'yag', 'argon', 'krf', 'co2']), { name, nm, note } = LASERS[key];
        return {
          prompt: t`A ${name} laser emits at ${nm >= 10000 ? `${(nm / 1000).toFixed(1)}\ µm` : `${nm} nm`} (${note}). What energy does each photon carry, in eV?`,
          answer: eV(nm), units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: (H * C) / (nm * 1e-9), feedback: 'That is in joules; divide by 1.602 × 10⁻¹⁹ J per eV.' }, { value: nm / HC_EVNM, feedback: t`Invert: $E = hc/\lambda$, with $hc = 1239.8$ eV nm.` }],
          hints: [t`$E = hc/\lambda$, with $hc = 1239.84$ eV nm.`],
          teach: 'A laser’s photon energy is hc/λ: from 0.1 eV for a CO₂ laser to 5 eV for an excimer.',
          explain: t`$E = 1239.84/${nm} = ${fmt(eV(nm), 4)}$ eV. Each laser’s wavelength is fixed by the gap between two levels of its medium.`,
          visual: { type: 'em-spectrum', params: { f: r6(C / (nm * 1e-9)), axes: ['lambda', 'f'], readouts: ['band'], sizes: false, controls: false, range: [12, 16] }, caption: 'Where this laser’s light falls in the spectrum. The photon-energy scale is left off.' },
        };
      },
    }),
    num({
      id: 'stim-vs-spont', difficulty: 2,
      gen(r) {
        const [what, lam, T] = r.pick([['green light (500 nm) in a room at 300 K', 500e-9, 300], ['green light (500 nm) at the Sun’s surface, 5772 K', 500e-9, 5772], ['1 cm microwaves in a room at 300 K', 0.01, 300], ['21 cm radio waves in the cosmic background, 2.725 K', 0.21106, 2.725]]);
        const x = (H * C) / (lam * KB * T), ans = nbar(x);
        return {
          prompt: t`In thermal radiation at temperature $T$, Einstein showed that stimulated emission outpaces spontaneous emission by the factor $\bar n = 1/(e^{h\nu/k_BT} - 1)$ — the Bose–Einstein occupation of the photon modes. Find that ratio for ${what}.`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(-x), feedback: t`Keep the $-1$: photons are bosons.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$h\nu/k_BT = hc/(\lambda k_BT)$.`, t`$hc/(\lambda k_BT) = ${fmt(x, 4)}$; then $\bar n = 1/(e^{${fmt(x, 4)}} - 1)$.`],
          teach: 'In thermal light, stimulated emission matters only where photons are plentiful per mode: hν ≲ kT.',
          explain: t`$h\nu/k_BT = ${fmt(x, 4)}$, so $\bar n = ${x > 5 ? tex(ans, 3) : fmt(ans, 3)}$. ${x > 20 ? 'Stimulated emission of visible light is utterly negligible in thermal light: a laser must create its own crowd of photons.' : x < 1 ? 'At long wavelengths stimulated emission dominates — which is why the first device, Townes’s 1954 ammonia maser, worked in microwaves.' : 'Even at the Sun’s surface spontaneous emission dominates visible light.'}`,
          visual: { type: 'graph', params: { x: [-2, 2.5], y: [-4, 2.5], xlog: true, ylog: true, aspect: 'wide', xlabel: 'hν / kT', ylabel: 'stimulated ÷ spontaneous', axesAt: 'edge', curves: [{ fn: '-log(exp(10^x) - 1)', domain: [-2, 2.2], color: 'warn', width: 2.6 }] }, caption: 'Stimulated over spontaneous emission in thermal light, 1/(e^(hν/kT) − 1), on log scales: above 1 only where hν < 0.7 kT.' },
        };
      },
    }),
    mcq({
      id: 'two-level', difficulty: 2,
      prompt: 'Why can no amount of pumping with light invert a two-level system?',
      choices: [
        'The pump light stimulates emission from the upper level exactly as readily as it causes absorption from the lower one, so at best the populations become equal',
        'Spontaneous emission empties the upper level faster than any pump can fill it',
        'Energy conservation forbids an atom from absorbing and emitting the same frequency',
        'The atoms would heat up and their thermal populations would take over',
      ],
      answer: 0,
      why: {
        1: 'A stronger pump beats spontaneous decay easily; it is the stimulated emission by the pump itself that sets the limit.',
        2: 'Absorption and emission at the same frequency are exactly what the two processes are.',
        3: 'Heating could only push towards a thermal ratio, which is never an inversion.',
      },
      hints: ['For equal degeneracies, Einstein’s B coefficients for absorption and stimulated emission are equal.'],
      teach: 'Light at the transition frequency can at most equalize two populations: inversion needs a third (or fourth) level.',
      explain: t`Absorption moves atoms up at rate $B\rho N_1$ and the same light moves them down at $B\rho N_2$. Once $N_2 = N_1$, the pump does nothing more: the medium becomes transparent but never amplifies. A third level breaks the symmetry: pump into it, and let it decay into the upper laser level.`,
      visual: { type: 'mp-laser', params: { scheme: 'two', W: 3, R: 0.95, panels: ['levels'], controls: false, readout: false }, caption: 'Forty two-level atoms pumped hard: the upper level fills to about half, and no further.' },
    }),
    num({
      id: 'threshold-gain', difficulty: 2,
      gen(r) {
        const Lcm = r.pick([15, 30, 50]), R2 = r.pick([0.98, 0.99, 0.995]), g = -Math.log(0.999 * R2) / (2 * Lcm / 100);
        return {
          prompt: t`A gas laser’s cavity is ${Lcm} cm long, with mirrors of reflectivity $R_1 = 0.999$ and $R_2 = ${R2}$. Light must gain as much on a round trip as it loses: $R_1R_2\,e^{2gL} = 1$. Ignoring other losses, what gain coefficient $g = \sigma(N_2 - N_1)$ must the medium reach, in m⁻¹?`,
          answer: g, units: 'm^-1', tol: { rel: 0.01 },
          errors: [{ value: 2 * g, feedback: t`A round trip passes through the medium twice: the exponent is $2gL$.` }, { value: g / 100, feedback: 'Convert the length to metres.' }],
          hints: [t`Take logs: $2gL = -\ln(R_1R_2)$.`, t`$g = -\ln(0.999 \times ${R2})/(2 \times ${(Lcm / 100).toFixed(2)}\ \text{m})$.`],
          teach: 'At threshold the round-trip gain exactly balances the mirror losses: g = −ln(R₁R₂)/2L.',
          explain: t`$g = ${fmt(-Math.log(0.999 * R2), 3)}/${fmt((2 * Lcm) / 100, 3)}\ \text{m} = ${fmt(g, 3)}\ \text{m}^{-1}$ — a few per cent per metre, which a helium–neon discharge can just supply. That is why such lasers need mirrors of 99% and better.`,
          visual: cavity(Lcm, R2),
        };
      },
    }),
    num({
      id: 'doppler-width', difficulty: 3,
      gen(r) {
        const T = r.pick([350, 400, 500]), dv = dopplerGHz(632.99, T, 20.1797);
        return {
          prompt: t`The neon atoms in a helium–neon laser have a Maxwell–Boltzmann spread of velocities, so their 632.99 nm line is Doppler-broadened. Its full width at half maximum is $\Delta\nu = \dfrac{\nu_0}{c}\sqrt{\dfrac{8k_BT\ln 2}{m}}$. Find it, in GHz, for neon (20.18 u) at ${T} K.`,
          answer: dv, units: 'GHz', tol: { rel: 0.01 },
          errors: [{ value: dv / Math.sqrt(Math.LN2), feedback: t`Keep the $\ln 2$ inside the root.` }, { value: dv * Math.sqrt(20.1797), feedback: 'Use the mass of one atom in kg: 20.18 × 1.661 × 10⁻²⁷ kg.' }],
          hints: [t`$\nu_0 = c/\lambda = ${tex(C / 632.99e-9, 4)}$ Hz and $m = 20.18 \times 1.6605\times10^{-27}$ kg.`, t`$\sqrt{8k_BT\ln2/m} = ${fmt(Math.sqrt((8 * KB * T * Math.LN2) / (20.1797 * U_KG)), 4)}$ m/s; multiply by $\nu_0/c$.`],
          teach: 'Thermal motion Doppler-broadens a gas laser’s line to about a gigahertz: the band in which its cavity modes can lase.',
          explain: t`$\Delta\nu = ${fmt(dv, 3)}$ GHz. The cavity only supports frequencies whose half-wavelengths fit a whole number of times: modes spaced $c/2L$, 500 MHz for a 30 cm tube. About ${Math.round(dv / 0.5)} of them fit under the gain curve, so a simple helium–neon laser runs on a few frequencies at once.`,
          visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [0, 1.25], aspect: 'wide', xlabel: 'frequency offset from the line centre (GHz)', ylabel: 'gain', yticks: 0, axesAt: 'edge', xticks: 0, curves: [{ fn: 'exp(-x^2/0.82)', color: 'accent', width: 2.6 }], vlines: [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2].map((v) => ({ x: v, color: 'ink4' })) }, caption: 'The Doppler-broadened gain curve (blue) and the cavity’s modes (grey lines, spaced c/2L). The frequency scale is left off.' },
        };
      },
    }),
    mcq({
      id: 'three-vs-four', difficulty: 2,
      prompt: 'The first laser, Maiman’s ruby (1960), needed a blinding flash lamp to fire at all. A small Nd:YAG laser runs continuously from a diode drawing a few watts. What is the main reason for the difference?',
      choices: [
        'Ruby’s lower laser level is its ground state, so over half its ions must be pumped before any inversion; Nd:YAG’s lower laser level lies above the ground state and stays nearly empty',
        'Ruby’s laser photons carry more energy than Nd:YAG’s, so each costs more to make',
        'Neodymium ions are heavier than chromium ions and so hold their energy longer',
        'Ruby crystals absorb their own red light, which no level scheme can avoid',
      ],
      answer: 0,
      why: {
        1: 'The photon energies differ by only 50%; the thresholds differ by orders of magnitude.',
        2: 'The masses of the ions play no part; the arrangement of their levels does.',
        3: 'Ruby absorbs its own red line only because ions remain in the ground state, its lower laser level — which is the level-scheme point itself.',
      },
      hints: ['In which scheme is the lower laser level already full before you start pumping?'],
      teach: 'A four-level laser’s lower level starts empty, so any pumping inverts it; a three-level laser must first pump away half its ground state.',
      explain: 'In ruby the laser transition ends on the ground state: half the chromium ions must be lifted before gain beats absorption. In Nd:YAG it ends on a level about 0.26 eV up, which empties in nanoseconds into the ground state, so the inversion starts from nothing. The curves show it: the three-level output switches on at a far higher pump.',
      visual: { type: 'mp-laser', params: { scheme: 'three', W: 0.5, R: 0.95, panels: ['curve'], controls: false, readout: false }, caption: 'Steady-state output (red: the three-level laser; dashed: the others) and inversion (gold) against the pump rate, on a log scale. Model rates.' },
    }),
    num({
      id: 'quantum-defect', difficulty: 1,
      gen(r) {
        const [pump, out, what] = r.pick([[808, 1064, 'Nd:YAG pumped by 808 nm diodes, lasing at 1064 nm'], [940, 1030, 'Yb:YAG pumped at 940 nm, lasing at 1030 nm'], [532, 800, 'a titanium–sapphire laser pumped with green 532 nm light and tuned to 800 nm']]);
        const ans = 100 * (1 - pump / out);
        return {
          prompt: t`For ${what}, what fraction of each pump photon’s energy, at the very least, ends up as heat in the crystal, in per cent?`,
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (100 * pump) / out, feedback: 'That is the share of the pump photon’s energy that the laser photon keeps. The rest becomes heat.' }, { value: 100 * (out / pump - 1), feedback: t`Divide by the *pump* photon’s energy: $1 - E_\text{laser}/E_\text{pump} = 1 - \lambda_\text{pump}/\lambda_\text{laser}$.` }],
          hints: [t`Energy per photon is $hc/\lambda$: the laser photon has $\lambda_\text{pump}/\lambda_\text{laser}$ of the pump photon’s energy.`],
          teach: 'The quantum defect, 1 − λpump/λlaser, is the least energy per photon a laser must dump as heat.',
          explain: t`$1 - ${pump}/${out} = ${fmt(ans, 3)}\%$. Every pump photon creates at most one laser photon, so the energy difference — spent in the fast, non-radiative steps of the four-level cycle — must be carried away as heat. That is why high-power lasers need cooling, and why Yb:YAG, with its small defect, is popular.`,
          visual: levels([{ E: 0, label: 'ground state' }, { E: 0.26, label: 'lower laser level' }, { E: 1.43, label: 'upper laser level' }, { E: 1.53, label: 'pump level' }], { arrows: [{ from: 0, to: 1.53, x: 0.8, color: 'violet', label: 'pump photon', left: true }, { from: 1.53, to: 1.43, x: 2, color: 'ink3', dash: true }, { from: 1.43, to: 0.26, x: 2.8, color: 'bad', label: 'laser photon' }, { from: 0.26, to: 0, x: 3.6, color: 'ink3', dash: true }], x: [-3.5, 10], caption: 'A four-level cycle (energies roughly those of Nd:YAG): the dashed steps give their energy to the crystal as heat.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-altimeter', difficulty: 2, transfer: true,
      gen(r) {
        const [what, h, dh] = r.pick([['NASA’s Mars Orbiter Laser Altimeter (MOLA), which mapped Mars from about 400 km up with 1064 nm Nd:YAG pulses', 400, 0.375], ['the Lunar Orbiter Laser Altimeter (LOLA), from about 50 km above the Moon', 50, 0.1], ['ICESat-2’s laser altimeter, measuring Earth’s ice sheets from about 500 km', 500, 0.03]]);
        const dt = (2 * dh) / C * 1e9;
        return {
          prompt: t`A laser altimeter times each pulse’s round trip to the ground and back. For ${what}, how precisely must the round-trip time be measured, in nanoseconds, to resolve heights of ${dh * 100} cm?`,
          answer: dt, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: dt / 2, feedback: 'The pulse goes down and back: a height change of Δh changes the path by 2Δh.' }],
          hints: [t`A height change $\Delta h$ changes the round trip by $2\Delta h$, and the time by $2\Delta h/c$.`],
          teach: 'Laser ranging turns time into distance: 1 ns of round trip is 15 cm of height.',
          explain: t`$\Delta t = 2\Delta h/c = 2 \times ${dh}\ \text{m}/(${tex(C, 4)}\ \text{m/s}) = ${fmt(dt, 3)}$ ns, out of a round trip of ${fmt((2 * h * 1e3) / C * 1e3, 3)} ms. A laser makes it possible: its short, intense, narrow beam comes back as a sharp, detectable echo from a small spot.`,
          visual: { type: 'graph', params: frame([-6, 6], [-1.2, 5.2], { aspect: 'wide', curves: [{ fn: '0.15*sin(1.3*x) + 0.1*sin(3.1*x)', color: 'ink2', width: 2 }, seg(-0.3, 4.3, -0.3, 0.2, 'bad', 2, false), seg(0.3, 0.2, 0.3, 4.3, 'bad', 1.4, true)], shade: [{ fn: '0.15*sin(1.3*x) + 0.1*sin(3.1*x)', lower: '-1.2', from: -6, to: 6, color: 'ink3', alpha: 0.18 }], points: [{ x: 0, y: 4.6, r: 8, color: 'ink' }, label(0.6, 4.6, 'spacecraft', 'ink2', 8, 0, 'left'), label(-0.3, 2.3, 'pulse down', 'bad', -8, 0, 'right'), label(0.3, 2.3, 'echo up', 'bad', 8, 0, 'left')] }), caption: 'A laser altimeter, not to scale: the pulse’s round-trip time gives the distance to the ground.' },
        };
      },
    }),
    mcq({
      id: 'cp-coherent', difficulty: 2,
      prompt: 'What makes laser light coherent — a single, steady wave rather than a jumble of independent wavelets?',
      choices: [
        'Each stimulated photon copies the one that triggered it — the same frequency, direction, phase and polarization — so the whole beam grows from copies of a few photons',
        'Stimulated photons carry more energy than spontaneous ones',
        'The mirrors filter out every wavelength but one',
        'The pump delivers its energy in one synchronized pulse',
      ],
      answer: 0,
      why: {
        1: 'Stimulated and spontaneous photons of a transition have the same energy; what differs is that the stimulated one is a clone.',
        2: 'The cavity selects which modes survive, but without stimulated emission a cavity full of spontaneous light would still be incoherent.',
        3: 'Many lasers are pumped continuously and still give coherent light.',
      },
      hints: ['Compare a photon from stimulated emission with the photon that caused it.'],
      teach: 'Stimulated emission clones photons, so a laser beam is one wave amplified, not many waves added.',
      explain: 'Spontaneous emission sends photons in random directions with random phases — the light of a lamp. Stimulated emission adds photons identical to those already in the mode, so the beam is a single wave that keeps its phase over long distances and spreads very little. That is what lets LIGO interfere its 1064 nm beams after kilometres of travel.',
      visual: { type: 'mp-laser', params: { scheme: 'four', W: 1.5, R: 0.95, panels: ['cavity'], controls: false, readout: false }, caption: 'Inside a working laser: photons of the laser mode (red) bounce along the axis; spontaneous photons (gold) escape sideways. Schematic.' },
    }),
    num({
      id: 'cp-ligo', difficulty: 2, transfer: true,
      gen(r) {
        const P = r.pick([2, 25, 125]), rate = (P * 1064e-9) / (H * C);
        return {
          prompt: t`LIGO’s detectors are lit by a stabilized 1064 nm laser. How many photons per second does a ${P} W beam at that wavelength carry?`,
          answer: rate, units: 's^-1', tol: { rel: 0.01 },
          errors: [{ value: P / eV(1064), feedback: t`That divides by the photon energy in eV. Use joules: $hc/\lambda = ${tex((H * C) / 1064e-9, 3)}$ J.` }],
          hints: [t`One photon carries $hc/\lambda = ${tex((H * C) / 1064e-9, 4)}$ J.`, t`Photons per second $= P/(hc/\lambda)$.`],
          teach: 'A beam’s photon rate is its power divided by hc/λ: about 5 × 10¹⁸ per second per watt at 1064 nm.',
          explain: t`$${P}\ \text{W}/(${tex((H * C) / 1064e-9, 4)}\ \text{J}) = ${tex(rate, 3)}$ photons per second. Counting statistics of so many photons — shot noise — falls as $1/\sqrt N$, which is why LIGO uses as much laser power as it can.`,
          visual: { type: 'em-spectrum', params: { f: r6(C / 1064e-9), axes: ['lambda', 'f'], readouts: ['band'], sizes: false, controls: false, range: [12, 16] }, caption: 'LIGO’s 1064 nm light, in the near infrared.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'Einstein (1917), Zur Quantentheorie der Strahlung, Phys. Z. 18, 121', url: 'https://einsteinpapers.press.princeton.edu/vol6-trans/232' },
    { label: 'Maiman (1960), Stimulated optical radiation in ruby, Nature 187, 493', url: 'https://doi.org/10.1038/187493a0' },
    { label: 'Javan, Bennett & Herriott (1961), Population inversion and continuous optical maser oscillation in a gas discharge containing a He–Ne mixture, Phys. Rev. Lett. 6, 106', url: 'https://doi.org/10.1103/PhysRevLett.6.106' },
    { label: 'Smith et al. (2001), Mars Orbiter Laser Altimeter: experiment summary after the first year of global mapping of Mars, J. Geophys. Res. 106, 23689', url: 'https://doi.org/10.1029/2000JE001364' },
    { label: 'OpenStax University Physics Vol. 3, §8.6 Atomic spectra and X-rays (lasers)', url: 'https://openstax.org/books/university-physics-volume-3/pages/8-6-atomic-spectra-and-x-rays' },
  ],
});
