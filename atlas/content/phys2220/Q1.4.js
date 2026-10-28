// Wave–particle duality and the uncertainty principle — single quanta are
// detected as particles, but where they land follows a wave; a wave confined
// to Δx must contain a spread of momenta, Δx·Δp ≥ ħ/2. Not measurement
// clumsiness: a property of the state. Energy–time and natural linewidths;
// LIGO's 40 kg mirrors meet the same limit. Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { H, HBAR, QE, C } from '../../src/viz/model/qm-light.js';
import { PARTICLES, lambdaFromK, minDeltaP, minDeltaV } from '../../src/viz/model/qm-matterwaves.js';
import { seg, label, r6 } from './_modern.js';

const t = String.raw;

const ME = PARTICLES.electron.m;
const EX = { dx: 1e-10 };
EX.dp = minDeltaP(EX.dx); EX.K = (EX.dp * EX.dp) / (2 * ME) / QE; EX.dust = minDeltaV(1e-6, 1e-9);

/**
 * A wave packet and its momentum spread side by side (schematic): on the
 * left |ψ(x)|² with width s, on the right the spread of momenta, width ∝ 1/s.
 */
function packetPair(s, caption, { ask = '' } = {}) {
  const q = r6(0.3 / s);
  return {
    type: 'graph',
    params: {
      x: [0, 10.4], y: [-0.45, 1.35], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        { fn: `exp(-((x - 2.5)^2)/(2*${r6(s * s)}))*cos(9*(x - 2.5))`, domain: [0.1, 4.9], color: 'violet', width: 1.3 },
        { fn: `exp(-((x - 2.5)^2)/(2*${r6(s * s)}))`, domain: [0.1, 4.9], color: 'accent', width: 2.4 },
        { fn: `exp(-((x - 7.9)^2)/(2*${r6(q * q)}))`, domain: [5.5, 10.3], color: 'gold', width: 2.4 },
        seg(0.1, 0, 4.9, 0, 'ink3', 1.2), seg(5.5, 0, 10.3, 0, 'ink3', 1.2), seg(5.2, -0.4, 5.2, 1.3, 'ink4', 1, true),
      ],
      points: [label(2.5, 1.2, ask === 'x' ? 'position: Δx = ?' : 'position: spread Δx', 'accent', 0, 0, 'center'), label(7.9, 1.2, ask === 'p' ? 'momentum: Δp = ?' : 'momentum: spread Δp', 'gold', 0, 0, 'center'), label(2.5, -0.25, 'x', 'ink3', 0, 0, 'center'), label(7.9, -0.25, 'p', 'ink3', 0, 0, 'center')],
    },
    caption: caption ?? 'A wave packet (left: the wave in violet, the chance of finding the particle in blue) and the spread of momenta it is made of (right). Squeeze one and the other widens. Schematic: heights are relative.',
  };
}
/** A spectral line of natural width Γ: the Lorentzian shape. */
const lineShape = {
  type: 'graph',
  params: {
    x: [-4, 4], y: [0, 1.2], aspect: 'wide', xlabel: 'photon energy − line centre (in units of Γ)', ylabel: 'intensity', yticks: 0,
    curves: [{ fn: '1/(1 + 4*x^2)', color: 'accent' }],
    arrows: [{ from: [-0.5, 0.5], to: [0.5, 0.5], color: 'gold' }, { from: [0.5, 0.5], to: [-0.5, 0.5], color: 'gold' }],
    points: [label(0, 0.5, 'width Γ = ?', 'gold', 0, -14, 'center')],
  },
  caption: 'The shape of a spectral line from a state of lifetime τ: its full width at half height is Γ = ħ/τ. Real lines are often broadened further by collisions and the motion of the atoms.',
};

export default lesson({
  id: 'phys2220.Q1.4',
  title: 'Wave–particle duality and the uncertainty principle',
  minutes: 12, difficulty: 3,
  intro: t`Light and matter are neither waves nor particles in the everyday sense. Each electron or photon is detected at one place, like a particle — but where it is likely to turn up is governed by a wave, so single arrivals build up interference fringes. One consequence is unavoidable: a wave confined to a small region must be built from a wide range of wavelengths, and so of momenta. However carefully a particle is prepared, the spreads of its position and momentum along any direction obey

$$\Delta x\,\Delta p_x \ge \frac{\hbar}{2}$$

This is Heisenberg’s uncertainty principle (1927). **It is not about clumsy instruments disturbing the particle**: it describes the state itself, before any measurement is made — the same trade-off that makes a short musical note sound less sharply pitched.

> Continue in [Introductory Modern Physics](#/course/phys2710), where wave packets and the Schrödinger equation make this precise.`,
  symbols: [
    { tex: '\\Delta x', text: 'the spread (standard deviation) of the particle’s position along $x$, in m' },
    { tex: '\\Delta p_x', text: 'the spread of its momentum along the same direction, in kg·m/s' },
    { tex: '\\hbar', text: t`“h-bar”, $h/2\pi = 1.055\times10^{-34}$ J s` },
  ],
  why: 'The uncertainty principle sets the size and energy of atoms, the width of spectral lines and the ultimate precision of instruments — including LIGO’s mirrors.',
  visual: {
    type: 'qm-slits',
    title: 'One electron at a time',
    lead: t`Electrons leave the gun one by one: slow the rate and watch single arrivals. Each lands at one point — yet the points obey a wave’s pattern. Then find out what happens when you try to know more.`,
    tasks: [
      'At a few electrons per second each arrives at a single spot: no electron is ever split between two places.',
      'Press “+1000 at once”: the spots have built fringes, a wave’s signature. Now tick “detect which slit”: the fringes vanish, leaving the smooth single-slit pattern.',
      'Choose one slit and narrow it from 0.5 to 0.25 μm: the spot spreads out. Pinning down where an electron crosses (Δy ≈ a) widens its spread of sideways momentum (Δpᵧ ≈ h/a).',
    ],
    params: { mode: 'double', kV: 50, a: 0.5, d: 2.0, rate: 4 },
  },
  example: {
    prompt: t`An electron is confined within an atom, so $\Delta x \approx 0.10$ nm. What is the smallest its momentum spread can be, and what kinetic energy goes with a momentum that size? Then compare a 1 μg dust grain whose position is known to within 1 μm.`,
    visual: packetPair(0.35),
    steps: [
      { label: 'Smallest momentum spread', text: t`$\Delta p_x \ge \dfrac{\hbar}{2\Delta x} = \dfrac{1.055\times10^{-34}\ \text{J s}}{2\times1.0\times10^{-10}\ \text{m}} = ${tex(EX.dp, 3)}$ kg·m/s.` },
      { label: 'Energy that goes with it', text: t`A momentum of that size means a kinetic energy of about $\dfrac{(\Delta p)^2}{2m_e} = \dfrac{(${tex(EX.dp, 3)})^2}{2\times9.109\times10^{-31}}\ \text{J} = ${tex(EX.K * QE, 2)}$ J $\approx ${fmt(EX.K, 2)}$ eV.` },
      { label: 'Compare with atoms', text: t`Atomic energies are a few eV (13.6 eV to ionize hydrogen): the uncertainty principle alone sets their scale. Confining an electron costs kinetic energy — which is why an atom cannot collapse to a point.` },
      { label: 'A dust grain', text: t`For $m = 10^{-9}$ kg and $\Delta x = 10^{-6}$ m: $\Delta v \ge \dfrac{\hbar}{2m\,\Delta x} = ${tex(EX.dust, 2)}$ m/s — utterly undetectable. The principle applies to everything; it only matters for small masses.` },
      { label: 'Not clumsiness', text: t`No measurement appeared anywhere in this calculation: these spreads belong to the state itself.` },
    ],
    answer: t`$\Delta p_x \ge ${tex(EX.dp, 2)}$ kg·m/s, a kinetic energy of order ${fmt(EX.K, 1)} eV; for the dust grain $\Delta v \ge ${tex(EX.dust, 1)}$ m/s.`,
  },
  practice: [
    mcq({
      id: 'what-it-means', difficulty: 1,
      prompt: 'Which statement best describes the uncertainty principle?',
      choices: [
        'A particle cannot have both a sharply defined position and a sharply defined momentum — a property of its wave, true before any measurement',
        'Our instruments disturb a particle when they look at it, so we can never measure it exactly',
        'Better instruments will one day measure position and momentum exactly at the same time',
        'It applies only to electrons, not to photons or larger particles',
      ],
      answer: 0,
      why: {
        1: 'Disturbance by measurement is real, but the principle is deeper: even before any measurement, no state has both spreads small. Heisenberg’s own “microscope” story made this mistake easy.',
        2: 'No instrument can beat it: it follows from the wave description itself, the way a short pulse must contain many frequencies.',
        3: 'It applies to everything — dust grains and LIGO’s 40 kg mirrors too — but it only matters noticeably for small masses.',
      },
      hints: ['Think about a wave packet: what must a very short wave packet be made of?'],
      teach: 'The uncertainty principle is a property of waves: a narrow packet needs a wide spread of wavelengths, and so of momenta.',
      explain: t`A wave confined to a region $\Delta x$ must be a mixture of wavelengths, and $p = h/\lambda$ turns that mixture into a spread of momenta: $\Delta x\,\Delta p_x \ge \hbar/2$. Measurement can add disturbance on top, but the limit holds for the state itself.`,
      visual: packetPair(0.3),
    }),
    num({
      id: 'min-dv', difficulty: 2,
      gen(r) {
        const [dx, what, s] = r.pick([[1e-9, 'a 1 nm quantum dot', 0.5], [1e-10, 'an atom 0.1 nm across', 0.3], [1e-8, 'a 10 nm wire', 0.8], [5e-9, 'a 5 nm nanocrystal', 0.65]]);
        const dv = minDeltaV(dx, ME);
        return {
          prompt: t`An electron is confined to ${what}, so $\Delta x \approx ${tex(dx, 1)}$ m. What is the smallest possible spread in its velocity, in m/s?`,
          answer: dv, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: H / (ME * dx), feedback: t`Use $\hbar/2 = h/4\pi$, not $h$: $\Delta v \ge \hbar/(2m\,\Delta x)$.` }, { value: HBAR / (ME * dx), feedback: 'Keep the 2: Δx Δp ≥ ħ/2.' }],
          hints: [t`$\Delta p \ge \hbar/(2\Delta x)$, and $\Delta v = \Delta p/m_e$.`, t`$\Delta v \ge \dfrac{1.055\times10^{-34}}{2\times9.109\times10^{-31}\times${tex(dx, 1)}}$ m/s.`],
          teach: 'Confining a light particle forces a large spread in its velocity: Δv ≥ ħ/(2mΔx).',
          explain: t`$\Delta v \ge \dfrac{\hbar}{2m_e\Delta x} = ${tex(dv, 3)}$ m/s. The smaller the box, the faster the electron must jiggle — which is why small quantum dots glow bluer than big ones.`,
          visual: packetPair(s),
        };
      },
    }),
    num({
      id: 'slit-spread', difficulty: 2,
      gen(r) {
        const a = r.pick([0.25, 0.5, 1.0]), kV = r.pick([20, 50]);
        const lam = lambdaFromK('electron', kV * 1e3), th = (lam / (a * 1e-6)) * 1e6;
        return {
          prompt: t`Electrons of wavelength ${fmt(lam * 1e12, 3)} pm (accelerated through ${kV} kV) pass a single slit ${a} μm wide. At what angle from the straight-through direction is the first dark band, in microradians?`,
          answer: th, units: 'μrad', tol: { rel: 0.01 },
          errors: [{ value: th / 2, feedback: t`For a single slit the first dark band is at $\sin\theta = \lambda/a$.` }],
          hints: [t`First dark band: $\sin\theta = \lambda/a$; for small angles $\theta \approx \lambda/a$.`, t`$\theta = \dfrac{${fmt(lam * 1e12, 3)}\times10^{-12}}{${a}\times10^{-6}}$ rad.`],
          teach: 'A slit of width a pins the crossing point to Δy ≈ a and spreads the beam by about λ/a — so Δpᵧ ≈ p·λ/a = h/a.',
          explain: t`$\theta = \lambda/a = ${fmt(th, 3)}\ \mu\text{rad}$. The sideways momentum spread is about $p\theta = (h/\lambda)(\lambda/a) = h/a$, so $\Delta y\,\Delta p_y \approx a \cdot h/a = h$ — comfortably above $\hbar/2$. Narrow the slit and the spread grows.`,
          visual: { type: 'qm-slits', params: { mode: 'single', kV, a, d: 2, hits: 3000, hide: ['lambda'], controls: false, readout: false, range: 40 }, caption: 'Electrons recorded one by one behind a single slit; angles on the screen are not labelled here.' },
        };
      },
    }),
    mcq({
      id: 'which-path', difficulty: 2,
      prompt: 'Electrons build up a two-slit fringe pattern. You add detectors that record which slit each electron passes through. What happens to the pattern on the screen?',
      choices: [
        'The fringes vanish, leaving the smooth pattern of a single slit',
        'Two separate bright bands appear, one behind each slit',
        'Nothing changes: gentle enough detectors cannot affect electrons',
        'No electrons reach the screen any more',
      ],
      answer: 0,
      why: {
        1: 'Far from the slits each slit’s spreading pattern covers almost the same region, so the two add to one smooth hump, not two bands.',
        2: 'Any record of the path, however gentle, destroys the interference — the wave from the other slit no longer combines with it.',
        3: 'The electrons still arrive; only the fringes go.',
      },
      hints: ['Interference needs the wave to pass through both slits and combine.', 'What does knowing the slit do to the part of the wave from the other slit?'],
      teach: 'Interference requires that no record exists of which path a particle took; obtain that record and the fringes disappear.',
      explain: 'With which-slit information each electron’s wave is effectively from one slit only, and the two single-slit patterns simply add, with no fringes. Experiments with electrons, photons and atoms all show this.',
      visual: { type: 'qm-slits', params: { mode: 'double', kV: 50, a: 0.5, d: 2, hits: 3000, controls: false, readout: false }, caption: 'The two-slit pattern built from 3000 electrons, before any which-slit detectors are added.' },
    }),
    num({
      id: 'photon-rate', difficulty: 2,
      prompt: t`In 1909 G. I. Taylor photographed a two-slit pattern made with light so feeble that the exposure lasted months. Suppose a beam delivers $1.0\times10^{6}$ photons per second. On average, how far apart are successive photons as they travel, in metres?`,
      answer: C / 1e6, units: 'm', tol: { rel: 0.01 },
      errors: [{ value: 1e6 / C, feedback: 'Distance between photons = speed ÷ rate: c/(1.0 × 10⁶ s⁻¹).' }],
      hints: [t`In one second the first photon travels $c$; meanwhile $10^6$ photons set off behind it.`, t`Average spacing $= c/\text{rate}$.`],
      teach: 'With feeble light there is usually just one photon in the apparatus at a time — and the fringes still form.',
      explain: t`$\dfrac{2.998\times10^{8}\ \text{m/s}}{1.0\times10^{6}\ \text{s}^{-1}} = ${fmt(C / 1e6, 3)}$ m — far longer than any laboratory apparatus. Each photon is alone between source and plate, so the fringes cannot come from photons interfering with one another: each interferes only with itself.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.5, 10.5], y: [-1.2, 1.4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [seg(0, 0, 10, 0, 'ink4', 1, true), seg(4.4, -0.55, 5.6, -0.55, 'ink2', 1.6), seg(4.4, 0.55, 5.6, 0.55, 'ink2', 1.6), seg(4.4, -0.55, 4.4, 0.55, 'ink2', 1.6), seg(5.6, -0.55, 5.6, 0.55, 'ink2', 1.6)],
          points: [{ x: 1, y: 0, r: 5, color: 'gold' }, { x: 9.2, y: 0, r: 5, color: 'gold' }, label(5, 0.55, 'the apparatus', 'ink2', 0, -14, 'center'), label(5.1, -0.9, 'spacing = ?', 'gold', 0, 14, 'center')],
          arrows: [{ from: [5.1, -0.9], to: [1.1, -0.9], color: 'gold' }, { from: [5.1, -0.9], to: [9.1, -0.9], color: 'gold' }],
        },
        caption: 'Two successive photons in a feeble beam, and the apparatus between them. Not to scale.',
      },
    }),
    num({
      id: 'linewidth', difficulty: 3,
      gen(r) {
        const [tau, what] = r.pick([[1.596e-9, 'the 2p state of hydrogen, which emits Lyman-α, lives 1.60 ns'], [16.2e-9, 'the 3p state of sodium, which emits the yellow D lines, lives 16.2 ns'], [27.1e-9, 'the 2p state of lithium, which emits its red 671 nm line, lives 27.1 ns']]);
        const G = HBAR / tau / QE;
        return {
          prompt: t`An excited state that lasts a time $\tau$ on average has an energy spread — its natural linewidth — of $\Gamma = \hbar/\tau$. ${what[0].toUpperCase() + what.slice(1)}. What is its natural linewidth, in eV?`,
          answer: G, units: 'eV', tol: { rel: 0.02 },
          errors: [{ value: H / tau / QE, feedback: t`Use $\hbar = h/2\pi$, not $h$.` }, { value: HBAR / tau, feedback: 'That is in joules; divide by 1.602 × 10⁻¹⁹ J/eV.' }],
          hints: [t`$\Gamma = \hbar/\tau = 1.055\times10^{-34}\ \text{J s}/\tau$.`, t`Convert joules to eV by dividing by $1.602\times10^{-19}$.`],
          teach: 'Short-lived states have blurred energies: the energy–time relation gives a natural linewidth Γ = ħ/τ.',
          explain: t`$\Gamma = \dfrac{1.055\times10^{-34}}{${tex(tau, 3)}}\ \text{J} = ${tex(HBAR / tau, 3)}$ J $= ${tex(G, 3)}$ eV — a few parts in $10^{8}$ of the photon’s energy, so atomic lines are very sharp (until collisions and motion broaden them).`,
          visual: lineShape,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ligo', difficulty: 3, transfer: true,
      prompt: t`LIGO measures the position of its 40 kg mirrors to about $10^{-19}$ m. If a mirror’s position is known that precisely, what is the smallest possible spread in its velocity, in m/s?`,
      answer: minDeltaV(1e-19, 40), units: 'm/s', tol: { rel: 0.01 },
      errors: [{ value: H / (2 * 40 * 1e-19), feedback: t`Use $\hbar = h/2\pi$, not $h$.` }],
      hints: [t`$\Delta v \ge \hbar/(2m\,\Delta x)$ with $m = 40$ kg and $\Delta x = 10^{-19}$ m.`, t`$\dfrac{1.055\times10^{-34}}{2\times40\times10^{-19}}$ m/s.`],
      teach: 'Even 40 kg mirrors feel the uncertainty principle when their positions are measured to a ten-thousandth of a proton’s width.',
      explain: t`$\Delta v \ge ${tex(minDeltaV(1e-19, 40), 3)}$ m/s. Over a 10 ms measurement that velocity spread smears the position by about $${tex(minDeltaV(1e-19, 40) * 0.01, 2)}$ m — as large as the precision itself. This back-action limit is real: LIGO now injects “squeezed” light, which shifts quantum uncertainty from where it hurts to where it does not.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.6, 7.6], y: [-0.8, 5.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [seg(0, 0, 6.4, 0, 'gold', 1.6), seg(0, 0, 0, 4.4, 'gold', 1.6), seg(6.6, -0.5, 6.6, 0.5, 'ink', 5), seg(-0.5, 4.6, 0.5, 4.6, 'ink', 5)],
          points: [{ x: 0, y: 0, r: 6, color: 'ink2', label: 'laser and beam splitter', labelDx: 10, labelDy: 16 }, label(6.6, 0.5, '40 kg mirror', 'ink2', -10, -12, 'right'), label(0.5, 4.6, '40 kg mirror', 'ink2', 8, 0), label(3.2, 0, '4 km arm', 'gold', 0, 14, 'center')],
        },
        caption: 'A LIGO detector seen from above: laser light runs along two 4 km arms to suspended 40 kg mirrors. Not to scale.',
      },
    }),
    num({
      id: 'cp-nucleus', difficulty: 3,
      prompt: t`Before the neutron was discovered, some physicists thought nuclei contained electrons. Confine an electron to a nucleus, $\Delta x \approx 10$ fm $= 1.0\times10^{-14}$ m. What is the smallest momentum spread, expressed as $pc$ in MeV?`,
      answer: minDeltaP(1e-14) * C / QE / 1e6, units: 'MeV', tol: { rel: 0.01 },
      errors: [{ value: minDeltaP(1e-14) * C / QE, feedback: 'Convert eV to MeV: divide by 10⁶.' }],
      hints: [t`$\Delta p \ge \hbar/(2\Delta x)$; then multiply by $c$ and divide by $e$ to get eV.`, t`$\hbar c = 197.3$ MeV fm, so $\Delta p\,c \ge 197.3/(2\times10)$ MeV.`],
      teach: 'Confinement to nuclear size forces electron momenta of order 10 MeV/c — far more than any electron bound in a nucleus could have.',
      explain: t`$\Delta p\,c \ge \dfrac{\hbar c}{2\Delta x} = \dfrac{197.3\ \text{MeV fm}}{20\ \text{fm}} = ${fmt(minDeltaP(1e-14) * C / QE / 1e6, 3)}$ MeV. An electron with that momentum would have about 10 MeV of energy, while the electrons of beta decay come out with a few MeV at most — one of the arguments that nuclei are made of protons and neutrons, not electrons.`,
      visual: packetPair(0.22, 'Squeezed into a nucleus, the electron’s position spread is tiny — so its momentum spread is enormous. Schematic.', { ask: 'p' }),
    }),
    mcq({
      id: 'cp-duality', difficulty: 2,
      prompt: 'Photons are sent through a two-slit apparatus one at a time, with a sensitive detector screen behind it. What do you see?',
      choices: [
        'Each photon arrives at a single spot; after many photons, the spots form interference fringes',
        'Each photon spreads out over the whole screen as a faint fringe pattern',
        'The photons form two bright bands behind the slits, because each passes through one slit like a ball',
        'No fringes form, since interference needs many photons in the apparatus at once',
      ],
      answer: 0,
      why: {
        1: 'Detectors never record a fraction of a photon: each one is absorbed at one place.',
        2: 'With both slits open and no which-slit information, the arrivals follow the interference pattern, not two bands.',
        3: 'Fringes form even when only one photon is in the apparatus at a time: each photon interferes with itself.',
      },
      hints: ['Think about what a single detection looks like, and what many detections add up to.'],
      teach: 'Quanta are detected as particles, one at a time, but their arrivals are distributed like a wave’s intensity.',
      explain: 'Every photon is detected whole, at one spot — the particle side. Where it lands is random, but with the probabilities set by the wave through both slits — the wave side. Thousands of single arrivals draw the fringes.',
      visual: { type: 'qm-slits', params: { mode: 'double', kV: 50, a: 0.5, d: 2, hits: 120, curve: false, controls: false, readout: false }, caption: 'The first 120 arrivals in a two-slit experiment (shown here with electrons; photons behave the same way).' },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §6.6 Wave–particle duality', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-6-wave-particle-duality' },
    { label: 'OpenStax University Physics Vol. 3, §7.2 The Heisenberg uncertainty principle', url: 'https://openstax.org/books/university-physics-volume-3/pages/7-2-the-heisenberg-uncertainty-principle' },
    { label: 'Tonomura et al. (1989), Demonstration of single-electron buildup of an interference pattern, Am. J. Phys. 57, 117', url: 'https://doi.org/10.1119/1.16104' },
    { label: 'LIGO Scientific Collaboration (2019–2023), quantum-enhanced detection with squeezed light', url: 'https://www.ligo.caltech.edu/' },
  ],
});
