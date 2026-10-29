// Fission and fusion, at Krane’s level. Fission: the energy of one
// U-235 split from AME2020 masses (173 MeV prompt, about 200 in all), why
// thermal neutrons split U-235 but not U-238 (the compound nucleus’s
// neutron separation energy against a ~6 MeV barrier — pairing again), the
// liquid drop’s fissility limit Z²/A = 2a_S/a_C, η and enrichment, k and
// the role of delayed neutrons. Fusion: the Coulomb barrier, the Gamow peak
// (Maxwell tail × tunnelling) in the Sun and in a D–T plasma, Lawson’s
// triple product with ITER’s design targets, NIF’s target gain honestly
// labelled, and D–³He fusion as a rocket fuel. PHYS 2220 A1.2 did 200 MeV
// per fission, energy per kilogram, the D–T Q-value and the Sun’s mass
// loss; not repeated.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import * as Nu from '../../src/viz/model/qm-nuclear.js';
import { KE2, ALPHA, NA, mass, Q, Sn, uni, r6, seg, label } from './_nuclear.js';

const t = String.raw;
const QF = Q(['n', 'U-235'], ['Ba-141', 'Kr-92', 'n', 'n', 'n']);
const KB_KEV_PER_MK = 8.617333262e-8 * 1e6;                 // keV per megakelvin
const EG = { pp: 2 * (938.27208943 / 2) * (Math.PI * ALPHA) ** 2 * 1000, dt: 2 * ((1875.612945 * 2808.92113668) / (1875.612945 + 2808.92113668)) * (Math.PI * ALPHA) ** 2 * 1000 };
const E0 = (eg, kT) => Math.cbrt((eg * kT * kT) / 4);
const ETA = (e) => (2.43 * e * 585) / (e * (585 + 99) + (1 - e) * 2.68);
const { aS, aC } = Nu.SEMF;

// ---- pictures
/** The Gamow peak: Boltzmann factor, tunnelling factor and their product (scaled to 1 at its peak). EGv, T: numbers or keys. */
function gamowPeak({ EGv = 'EG', T = 'T', x = [0, 60], extra = {}, caption, labels = true } = {}) {
  const kT = `(${T}*${KB_KEV_PER_MK})`, e0 = `((${EGv})*${kT}^2/4)^(1/3)`;
  return {
    type: 'graph',
    params: {
      x, y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'collision energy E in the centre of mass (keV)', ylabel: 'relative size', yticks: 0,
      shade: [{ fn: `exp(-x/${kT} - sqrt((${EGv})/x) + 3*${e0}/${kT})`, from: 0.01, to: x[1], color: 'gold', alpha: 0.3 }],
      curves: [
        { fn: `exp(-x/${kT})`, domain: [0, x[1]], color: 'accent', width: 2.2, ...(labels ? { label: 'Maxwell tail', labelAt: x[1] * 0.06, labelDx: 8, labelDy: -6 } : {}) },
        { fn: `exp(-sqrt((${EGv})/x))`, domain: [0.01, x[1]], color: 'warn', width: 2.2, ...(labels ? { label: 'tunnelling', labelAt: x[1] * 0.85, labelDx: -4, labelDy: -12, labelAlign: 'right' } : {}) },
        { fn: `exp(-x/${kT} - sqrt((${EGv})/x) + 3*${e0}/${kT})`, domain: [0.01, x[1]], color: 'gold', width: 2.8, ...(labels ? { label: 'product (scaled up)', labelAt: `${e0}`, labelDx: 10, labelDy: -10 } : {}) },
      ],
      ...extra,
    },
    caption: caption ?? 'Fusion happens in a window: the Boltzmann factor (blue) says how many pairs collide with energy E, the tunnelling factor (orange) how likely each is to get through the Coulomb barrier. Their product (gold, scaled up enormously to be visible) is the Gamow peak. Simplified: the nuclear S-factor, a slowly varying factor, is left out.',
  };
}

/** Neutron population growth N(t)/N₀ = k^(t/ℓ) for prompt neutrons only and with delayed neutrons. */
function growth({ dk = 0.001, xmax = 2, caption } = {}) {
  const k = 1 + dk, top = Math.ceil(xmax * 1e4 * Math.log10(k) * 1.05);
  return {
    type: 'graph',
    params: {
      x: [0, xmax], y: [0, top], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: `time after k rises to ${k} (s)`, ylabel: 'power ÷ starting power',
      curves: [{ fn: `x*10000*log10(${k})`, color: 'bad', width: 2.6, label: 'prompt neutrons only (ℓ = 0.1 ms)', labelAt: xmax * 0.15, labelDx: 10, labelDy: 4 },
        { fn: `x/0.08*log10(${k})`, color: 'good', width: 2.6, label: 'with delayed neutrons (effective ℓ ≈ 0.08 s)', labelAt: xmax * 0.55, labelDy: -12 }],
    },
    caption: caption ?? `A reactor’s power after its multiplication factor rises to ${k}, on a log scale. The 0.65% of neutrons emitted seconds later by fission fragments slow the growth to a crawl that control rods can follow. Simplified: one effective delayed-neutron group.`,
  };
}

/** The fission barrier sketched against deformation, with the excitation energy a captured neutron brings. */
function fissionBarrier(Sn6, { compound = 'U-236', showSn = true, caption } = {}) {
  return {
    type: 'graph',
    params: {
      x: [0, 10], y: [-4, 9], aspect: 'wide', axesAt: 'edge', xlabel: 'deformation (elongation of the nucleus)', xticks: 0, ylabel: 'energy (MeV)',
      curves: [{ fn: '6*exp(-((x - 3.2)/1.3)^2) - 0.35*(x - 3.2)*step(x - 3.2)^2', domain: [0, 10], color: 'accent', width: 2.6 },
        ...(showSn ? [{ fn: String(r6(Sn6)), domain: [0, 10], color: 'gold', width: 2, dash: true, label: `after capture: ${fmt(Sn6, 3)} MeV`, labelAt: 0.3, labelDy: -10 }] : [])],
      hlines: [{ y: 6, label: 'barrier ≈ 6 MeV', color: 'ink3' }],
      points: [label(0.3, 0, `${uni(compound)} at rest`, 'accent', 0, 12, 'left'), label(9.6, -3.2, 'two fragments, flying apart', 'accent', 0, 0, 'right')],
    },
    caption: caption ?? 'The energy of a nucleus as it stretches toward splitting (a sketch: real barriers have two humps). The energy a captured neutron brings, the compound nucleus’s neutron separation energy, must reach the barrier for fission to follow quickly.',
  };
}

export default lesson({
  id: 'phys3710.N3.2',
  title: 'Fission and fusion',
  minutes: 20, difficulty: 3,
  intro: t`There are two ways down the binding-energy curve toward iron: split a heavy nucleus, or join light ones. Both are held back by a barrier. A heavy nucleus must stretch over a **fission barrier** of about 6 MeV before electric repulsion wins — which is why one captured neutron can tip uranium-235 over and start a chain reaction. Light nuclei must get close despite their **Coulomb barrier**, and in a hot gas only the fastest pairs tunnel through. The reaction rate is decided by a narrow window of energies, the **Gamow peak**:

$$e^{-E/kT}\times e^{-\sqrt{E_G/E}}\quad\text{peaks at}\quad E_0 = \left(\tfrac14E_G\,(kT)^2\right)^{1/3}$$

The Sun burns at 6 keV, far above its 1.35 keV thermal energy and far below its 600 keV barrier.`,
  symbols: [
    { tex: 'E', text: 'the energy of a colliding pair in their centre-of-mass frame' },
    { tex: 'kT', text: t`the thermal energy: $k = 8.617\times10^{-8}$ keV/K, so $kT = 1.35$ keV at the Sun’s centre, 15.7 million K` },
    { tex: 'e^{-E/kT}', text: 'the Maxwell–Boltzmann tail: the relative number of pairs with energy E — it falls fast' },
    { tex: 'e^{-\\sqrt{E_G/E}}', text: 'the probability of tunnelling through the Coulomb barrier at energy E — it rises fast' },
    { tex: 'E_G', text: t`the Gamow energy, $2\mu c^2(\pi\alpha Z_1Z_2)^2$, with $\mu$ the reduced mass and $\alpha = 1/137.036$: $${fmt(EG.pp, 4)}$ keV for two protons, $${fmt(EG.dt, 4)}$ keV for deuterium and tritium` },
    { tex: 'E_0', text: 'the Gamow peak: the energy at which most reactions happen' },
  ],
  why: 'Fission powers reactors and the nuclear thermal rockets of the 1960s; fusion powers every star, and the hope of a fusion rocket rests on Lawson’s numbers.',
  visual: {
    ...gamowPeak({
      extra: {
        sliders: [{ key: 'T', label: 'Temperature $T$', min: 5, max: 200, step: 0.1, value: 15.7, unit: '\\text{million K}', explain: 'The Sun’s core is 15.7 million K; a fusion reactor’s plasma needs about 150 million K.' }],
        choices: [{ key: 'EG', label: 'Reaction', options: [[r6(EG.pp), 'p + p (the Sun)'], [r6(EG.dt), 'D + T (a reactor)']], value: r6(EG.pp), explain: 'Two protons have Gamow energy 493 keV; deuterium and tritium, heavier, 1182 keV.' }],
        readouts: [
          { label: t`$kT$`, expr: `T*${KB_KEV_PER_MK}`, unit: t`\text{keV}`, digits: 3 },
          { label: t`Gamow peak $E_0$`, expr: `(EG*(T*${KB_KEV_PER_MK})^2/4)^(1/3)`, unit: t`\text{keV}`, digits: 3 },
          { label: t`product at the peak, $e^{-3E_0/kT}$`, expr: `exp(-3*(EG*(T*${KB_KEV_PER_MK})^2/4)^(1/3)/(T*${KB_KEV_PER_MK}))`, digits: 3 },
        ],
      },
    }),
    title: 'The Gamow peak',
    lead: t`Blue: how many pairs collide at energy E. Orange: how likely such a collision is to tunnel through the barrier. Their product (gold) is where the fusion happens — drawn scaled up, because in the Sun it is about a millionth.`,
    tasks: [
      'At the Sun’s 15.7 million K the peak sits near 6 keV: four or five times kT, but a hundred times below the Coulomb barrier.',
      'Double the temperature: the peak moves up only by a factor of 1.6 (2 to the power ⅔), but the product at the peak — the reaction rate — rises enormously.',
      'Switch to D + T and set 150 million K (kT ≈ 13 keV): the peak near 37 keV is why fusion reactors run so hot.',
    ],
  },
  example: {
    prompt: t`A thermal neutron is absorbed by uranium-235, which splits: $n + {}^{235}\text{U} \to {}^{141}\text{Ba} + {}^{92}\text{Kr} + 3n$. (a) From AME2020 masses — U-235 235.0439281 u, Ba-141 140.914404 u, Kr-92 91.9261731 u, neutron 1.0086649 u — find the energy released. (b) Why does a slow neutron split uranium-235, but not uranium-238? (U-236 236.0455661 u; U-238 238.0507869 u; U-239 239.054292 u.)`,
    visual: fissionBarrier(Sn('U-236'), { caption: 'The energy of uranium-236 as it stretches toward fission (a sketch; real barriers have two humps). A captured slow neutron leaves it 6.55 MeV above its ground state — over the barrier.' }),
    steps: [
      { label: 'Mass in, mass out', text: t`Before: $235.0439281 + 1.0086649 = 236.052593$ u. After: $140.914404 + 91.9261731 + 3\times1.0086649 = 235.866572$ u. $Q = 0.186021\ \text{u}\times931.494 = ${fmt(QF, 4)}$ MeV.` },
      { label: 'The rest of the 200 MeV', text: t`The fragments are far too neutron-rich and beta-decay in chains (barium-141 → lanthanum → cerium-141 → praseodymium-141; krypton-92 → … → zirconium-92), adding about 20 MeV — some of it carried off by antineutrinos. Most of the prompt ${fmt(QF, 3)} MeV is the fragments’ kinetic energy: two highly charged nuclei repelling from contact.` },
      { label: 'What a neutron brings', text: t`Absorbing a neutron releases its separation energy in the compound nucleus: $S_n({}^{236}\text{U}) = [M({}^{235}\text{U}) + m_n - M({}^{236}\text{U})]c^2 = ${fmt(Sn('U-236'), 3)}$ MeV, while $S_n({}^{239}\text{U}) = ${fmt(Sn('U-239'), 3)}$ MeV.` },
      { label: 'Pairing decides', text: t`Both compound nuclei have fission barriers near 6 MeV. Uranium-236 is even–even, so the neutron that makes it pairs up and is bound by 6.55 MeV — over the barrier, even with no kinetic energy. Uranium-239 is even–odd: its last neutron is unpaired, bound by only 4.81 MeV, short of the barrier. Uranium-238 needs neutrons of about 1 MeV to fission.` },
      { label: 'Sense check', text: t`Plutonium-239 + n makes even–even plutonium-240 with $S_n = ${fmt(Sn('Pu-240'), 3)}$ MeV: also fissile with thermal neutrons. **Fissile** nuclei are those with an odd number of neutrons, for exactly this reason.` },
    ],
    answer: t`$Q = ${fmt(QF, 4)}$ MeV promptly (about 200 MeV in all); slow neutrons split uranium-235 because the even–even uranium-236 they make is ${fmt(Sn('U-236'), 3)} MeV excited, above its ~6 MeV barrier, while uranium-239 gets only ${fmt(Sn('U-239'), 3)} MeV.`,
  },
  practice: [
    num({
      id: 'fissility', difficulty: 2,
      prompt: t`Stretch a liquid drop into a slight ellipsoid with deformation $\varepsilon$: its surface energy grows to $E_S(1 + \tfrac25\varepsilon^2)$ and its Coulomb energy falls to $E_C(1 - \tfrac15\varepsilon^2)$. With $E_S = a_SA^{2/3}$ and $E_C = a_CZ^2/A^{1/3}$ ($a_S = 17.8$, $a_C = 0.711$ MeV), above what value of $Z^2/A$ does any small deformation lower the energy, so that the nucleus fissions at once?`,
      answer: (2 * aS) / aC, tol: { rel: 0.005 },
      errors: [{ value: aS / aC, feedback: t`The surface term grows by $\tfrac25\varepsilon^2$ but the Coulomb term falls by only $\tfrac15\varepsilon^2$: the condition is $E_C > 2E_S$.` }, { value: aC / (2 * aS), feedback: t`Invert: $E_C > 2E_S$ means $a_CZ^2/A^{1/3} > 2a_SA^{2/3}$, i.e. $Z^2/A > 2a_S/a_C$.` }],
      hints: [t`The energy changes by $\Delta E = \tfrac15\varepsilon^2(2E_S - E_C)$. It is negative when $E_C > 2E_S$.`, t`$a_C\dfrac{Z^2}{A^{1/3}} > 2a_SA^{2/3} \Rightarrow \dfrac{Z^2}{A} > \dfrac{2a_S}{a_C}$.`],
      teach: t`Bohr and Wheeler’s liquid drop has no fission barrier once $Z^2/A$ exceeds $2a_S/a_C \approx 50$; real heavy nuclei sit well below and must be pushed over.`,
      explain: t`$Z^2/A > 2\times17.8/0.711 = ${fmt((2 * aS) / aC, 3)}$. Uranium-235 has $Z^2/A = 92^2/235 = ${fmt(92 * 92 / 235, 3)}$, about 72% of the limit: stable against small wobbles, but with a barrier of only about 6 MeV. The heaviest nuclei made, up to $Z^2/A \approx 47$ (oganesson-294), survive at all only thanks to shell effects the liquid drop leaves out.`,
      visual: fissionBarrier(Sn('U-236'), { caption: 'A sketch of the energy against deformation for a heavy nucleus: a barrier, then the long fall as the fragments repel. As $Z^2/A$ approaches $2a_S/a_C$, the barrier shrinks to nothing.' }),
    }),
    num({
      id: 'sn-compound', difficulty: 2,
      gen(r) {
        const [target, comp, tn, cn] = r.pick([['U-235', 'U-236', 'uranium-235', 'uranium-236'], ['U-238', 'U-239', 'uranium-238', 'uranium-239'], ['Pu-239', 'Pu-240', 'plutonium-239', 'plutonium-240']]);
        const s = Sn(comp);
        return {
          prompt: t`A thermal neutron is captured by ${tn} (${fmt(mass(target), 10)} u), making ${cn} (${fmt(mass(comp), 10)} u). How much excitation energy does the compound nucleus have, in MeV? ($m_n = 1.008664916$ u.) Its fission barrier is about 6 MeV.`,
          answer: s, units: 'MeV', tol: { rel: 0.003 },
          errors: [{ value: (mass(target) - mass(comp)) * 931.494, feedback: 'Include the neutron’s mass on the left: the excitation is [M(target) + mₙ − M(compound)]c².' }],
          hints: ['A slow neutron brings almost no kinetic energy; the excitation is the energy released by binding it.', t`$E^* = [M({}^A\text{X}) + m_n - M({}^{A+1}\text{X})]c^2$.`],
          teach: 'A captured neutron excites the compound nucleus by its separation energy; pairing makes that larger when the compound nucleus is even–even.',
          explain: t`$E^* = ${fmt(s, 4)}$ MeV — ${s > 6 ? `above the barrier, so ${tn} is **fissile**: slow neutrons split it.` : `short of the barrier, so ${tn} does not fission with slow neutrons; the compound nucleus emits a gamma ray instead, and a neutron needs about 1 MeV of kinetic energy to make up the difference.`}`,
          visual: fissionBarrier(s, { compound: comp, showSn: false, caption: `The energy of ${cn} against deformation (a sketch; real barriers have two humps). Where the captured neutron leaves it — above or below the barrier — is the question.` }),
        };
      },
    }),
    num({
      id: 'eta', difficulty: 3,
      gen(r) {
        const pct = r.pick([0.72, 3, 5, 20]), e = pct / 100, eta = ETA(e);
        return {
          prompt: t`For thermal neutrons, uranium-235 has $\sigma_f = 585$ b and $\sigma_\gamma = 99$ b (capture without fission) and releases $\nu = 2.43$ neutrons per fission; uranium-238 only captures, $\sigma_\gamma = 2.68$ b. For uranium that is ${pct}% uranium-235 by atoms, how many fission neutrons are produced per thermal neutron absorbed in the fuel, $\eta = \nu\Sigma_f/\Sigma_a$?`,
          answer: eta, tol: { rel: 0.003 },
          errors: [{ value: (2.43 * 585) / 684, feedback: 'That is pure uranium-235. Weight each isotope’s cross sections by its fraction of the atoms.' }, { value: (2.43 * e * 585) / (e * 585 + (1 - e) * 2.68), feedback: t`Absorption in uranium-235 includes its 99 b of capture: $\sigma_a = 585 + 99$ b.` }],
          hints: [t`Per uranium atom: $\Sigma_f = ${e}\times585$ b, $\Sigma_a = ${e}\times(585 + 99) + ${fmt(1 - e, 4)}\times2.68$ b.`, t`$\eta = 2.43\times\Sigma_f/\Sigma_a$.`],
          teach: 'η, neutrons out per neutron absorbed in fuel, must exceed 1 with margin for leakage and moderator capture.',
          explain: t`$\Sigma_f = ${fmt(e * 585, 4)}$ b, $\Sigma_a = ${fmt(e * 684 + (1 - e) * 2.68, 4)}$ b, $\eta = ${fmt(eta, 4)}$. ${pct === 0.72 ? 'Natural uranium manages 1.35 — enough only with a superb moderator (heavy water or very pure graphite) and careful geometry, as in Fermi’s 1942 pile and CANDU reactors.' : 'Enrichment buys margin: the other factors of $k$ — neutrons that escape, are captured by the moderator or by uranium-238’s resonances while slowing — all take their share.'}`,
          visual: { type: 'graph', params: { x: [0, 25], y: [0, 2.3], aspect: 'wide', axesAt: 'edge', xlabel: 'uranium-235 share of the atoms (%)', ylabel: 'η (neutrons per absorption)',
            curves: [{ fn: '2.43*x/100*585/(x/100*684 + (1 - x/100)*2.68)', domain: [0.05, 25], color: 'accent', width: 2.6 }],
            hlines: [{ y: 1, label: 'η = 1: no chain reaction possible', color: 'bad' }], vlines: [{ x: 0.72, label: 'natural', color: 'ink3' }] },
            caption: 'η against enrichment for thermal neutrons (2200 m/s cross sections). It rises steeply at first and levels off near pure uranium-235’s 2.08. A chain reaction needs η comfortably above 1.' },
        };
      },
    }),
    num({
      id: 'k-growth', difficulty: 2,
      gen(r) {
        const dk = r.pick([0.0005, 0.001, 0.002]), k = 1 + dk, l = 1e-4, tt = 1, f = k ** (tt / l);
        return {
          prompt: t`A reactor’s multiplication factor rises from 1 to $k = ${k}$. If every neutron were born promptly, a generation would last $\ell = 0.1$ ms, and after time $t$ the power would be multiplied by $k^{t/\ell}$. By what factor would it grow in 1 second?`,
          answer: f, tol: { rel: 0.01 },
          errors: [{ value: k ** tt, feedback: t`Count the generations: $t/\ell = 1\ \text{s}/10^{-4}\ \text{s} = 10\,000$ of them.` }],
          hints: [t`Generations in a second: $1/(10^{-4}) = 10^4$.`, t`$${k}^{10\,000} = e^{10\,000\ln ${k}}$.`],
          teach: 'With prompt neutrons alone a reactor would be uncontrollable; delayed neutrons stretch the generation time a thousandfold.',
          explain: t`$${k}^{10\,000} = ${tex(f, 3)}$ — a runaway no mechanical control rod could follow. But 0.65% of uranium-235’s fission neutrons come seconds later, from the decay of fission fragments; while $k - 1$ is smaller than that fraction, the effective generation time is about 0.08 s and the power grows only by $${fmt(Math.exp((dk * tt) / 0.08), 4)}$ in the same second. Reactors are always run below **prompt critical**.`,
          visual: growth({ dk, xmax: 0.3, caption: `A reactor’s power after k rises to ${k}, on a log scale, for the first 0.3 s only. Prompt neutrons alone would make it run away; delayed neutrons (one effective group, a simplification) hold it nearly level.` }),
        };
      },
    }),
    num({
      id: 'coulomb-barrier', difficulty: 2,
      gen(r) {
        const [n, z, A1, A2, txt] = r.pick([['D + T', 1, 2, 3, 'deuterium and tritium'], ['D + D', 1, 2, 2, 'two deuterons'], ['D + ³He', 2, 2, 3, 'deuterium and helium-3']]);
        const R = 1.2 * (Math.cbrt(A1) + Math.cbrt(A2)), V = (z * KE2) / R;
        return {
          prompt: t`How high is the Coulomb barrier between ${txt} (${n}) when their surfaces touch, with radii $1.2A^{1/3}$ fm and $e^2/4\pi\varepsilon_0 = 1.440$ MeV fm? Answer in keV.`,
          answer: V * 1000, units: 'keV', tol: { rel: 0.005 },
          errors: [{ value: ((z * KE2) / (1.2 * Math.cbrt(A1 + A2))) * 1000, feedback: 'Add the two radii: the centres are R₁ + R₂ apart when the surfaces touch.' }],
          hints: [t`$R = 1.2\left(${A1}^{1/3} + ${A2}^{1/3}\right)$ fm $= ${fmt(R, 4)}$ fm.`, t`$V = Z_1Z_2\times1.440/R$ MeV.`],
          teach: 'Fusion barriers are hundreds of keV, but plasmas run at about 10 keV: tunnelling, not climbing, makes fusion happen.',
          explain: t`$V = ${z === 1 ? '' : `${z}\\times`}1.440/${fmt(R, 4)} = ${fmt(V * 1000, 3)}$ keV. A plasma at 150 million K has $kT \approx 13$ keV, about ${fmt(V / 0.0129, 2)} times less. Only pairs from the Maxwell tail, tunnelling, fuse. ${z === 2 ? 'With twice the charge, D–³He needs a much hotter plasma — the price of its fewer neutrons.' : ''}`,
          visual: gamowPeak({ EGv: r6(EG.dt), T: 150, x: [0, 100], caption: 'The Gamow peak for D + T at 150 million K: the reactions come from collisions of a few tens of keV, far below the barrier of a few hundred keV. S-factor left out.' }),
        };
      },
    }),
    num({
      id: 'gamow-peak', difficulty: 2,
      gen(r) {
        const T = r.pick([13, 15.7, 20, 25]), kT = T * KB_KEV_PER_MK, e0 = E0(EG.pp, kT);
        return {
          prompt: t`In a star’s core at ${T} million K, at what energy is the Gamow peak for two protons, in keV? The Gamow energy for p + p is $E_G = ${fmt(EG.pp, 4)}$ keV, and $k = 8.617\times10^{-8}$ keV/K.`,
          answer: e0, units: 'keV', tol: { rel: 0.005 },
          errors: [{ value: kT, feedback: t`That is $kT$, the typical thermal energy. The peak is where the rising tunnelling factor meets the falling tail: $E_0 = (E_G(kT)^2/4)^{1/3}$.` }],
          hints: [t`$kT = ${T}\times10^6\times8.617\times10^{-8} = ${fmt(kT, 4)}$ keV.`, t`$E_0 = \left(\tfrac14\times${fmt(EG.pp, 4)}\times${fmt(kT, 4)}^2\right)^{1/3}$.`],
          teach: 'Stars fuse at the Gamow peak: several times kT, far below the barrier.',
          explain: t`$E_0 = ${fmt(e0, 3)}$ keV, ${fmt(e0 / kT, 2)} times $kT$. Even there, only about one collision in $${tex(1 / Math.exp((-3 * e0) / kT) / 1, 2)}$ has the right energy and tunnels — and the first step of the proton–proton chain also needs a weak interaction to turn a proton into a neutron, which is why a proton in the Sun’s core waits billions of years to fuse.`,
          visual: gamowPeak({ EGv: r6(EG.pp), T, x: [0, 30], labels: false, caption: `The Gamow peak for p + p at ${T} million K (gold, scaled up): between the falling Maxwell tail (blue) and the rising tunnelling factor (orange). S-factor left out.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dhe3', difficulty: 3, transfer: true,
      prompt: t`Fusion-rocket studies favour $\text{D} + {}^3\text{He} \to {}^4\text{He} + p$: both products are charged, so a magnetic nozzle can direct them. From the atomic masses — deuterium 2.01410178 u, helium-3 3.01602932 u, helium-4 4.00260325 u, hydrogen-1 1.00782503 u — how much energy does fusing 1 kg of this fuel release, in joules?`,
      answer: (Q(['H-2', 'He-3'], ['He-4', 'H-1']) / ((mass('H-2') + mass('He-3')) * 931.49410372)) * 299792458 ** 2, units: 'J', tol: { rel: 0.005 },
      errors: [{ value: Q(['H-2', 'He-3'], ['He-4', 'H-1']) * 1.602176634e-13 * (1000 / 5.0301311) * NA / 1000, feedback: 'A kilogram is 1000 g: it holds 1000/5.030 mol of D–³He pairs, not 1/5.030.' }],
      hints: [t`$Q = [M(\text{D}) + M({}^3\text{He}) - M({}^4\text{He}) - M({}^1\text{H})]c^2 = ${fmt(Q(['H-2', 'He-3'], ['He-4', 'H-1']), 4)}$ MeV per reaction.`, t`The fraction of the fuel’s mass converted is $Q/[(M_\text{D} + M_{{}^3\text{He}})c^2]$; multiply by $c^2 = 8.988\times10^{16}$ J/kg.`],
      teach: 'Fusion turns about 0.4% of its fuel’s mass into energy — ten million times what a chemical rocket gets per kilogram.',
      explain: t`$Q = ${fmt(Q(['H-2', 'He-3'], ['He-4', 'H-1']), 4)}$ MeV out of $${fmt((mass('H-2') + mass('He-3')) * 931.494, 5)}$ MeV of fuel: a fraction $${tex(Q(['H-2', 'He-3'], ['He-4', 'H-1']) / ((mass('H-2') + mass('He-3')) * 931.49410372), 3)}$, or $${tex((Q(['H-2', 'He-3'], ['He-4', 'H-1']) / ((mass('H-2') + mass('He-3')) * 931.49410372)) * 299792458 ** 2, 3)}$ J/kg. Hydrogen and oxygen give about $1.3\times10^7$ J/kg. If all of it went into exhaust, the exhaust would leave at about 9% of the speed of light. The catches: helium-3 is rare on Earth, and D–³He needs plasma several times hotter than D–T. **No fusion rocket has been built**; these are design studies.`,
      visual: gamowPeak({ EGv: 4728, T: 600, x: [0, 400], labels: false, caption: 'The Gamow peak for D + ³He (Z₁Z₂ = 2, Gamow energy 4.7 MeV) at 600 million K: higher charge pushes the peak to well over 100 keV. S-factor left out.' }),
    }),
    num({
      id: 'cp-lawson', difficulty: 2,
      prompt: t`For a D–T plasma to heat itself (“ignition”) its triple product must reach about $nT\tau_E \approx 3\times10^{21}\ \text{keV s m}^{-3}$, where $n$ is the ion density, $T$ the temperature and $\tau_E$ the energy confinement time. ITER’s design targets for its planned deuterium–tritium operation are roughly $n = 1.0\times10^{20}\ \text{m}^{-3}$, $T = 9$ keV and $\tau_E = 3.7$ s. What triple product does that give, in keV s per m³?`,
      answer: 1.0e20 * 9 * 3.7, units: 'keV s m^-3', tol: { rel: 0.01 },
      errors: [{ value: 1.0e20 * 9, feedback: t`Multiply by the confinement time too: the product is $n\,T\,\tau_E$.` }],
      hints: ['Multiply the three numbers.', t`$1.0\times10^{20}\times9\times3.7$.`],
      teach: 'Lawson’s criterion is a product: density, temperature and confinement time can trade off against each other.',
      explain: t`$nT\tau_E = ${tex(1.0e20 * 9 * 3.7, 2)}\ \text{keV s m}^{-3}$ — at the edge of ignition. ITER is designed for $Q = 10$ (500 MW of fusion from 50 MW of heating), not full ignition. These are **design targets**: ITER’s deuterium–tritium experiments are planned for the late 2030s. The best results so far fall short: JT-60U’s triple product of about $1.5\times10^{21}$ (1996, in deuterium only), and JET’s record 69 MJ of D–T fusion energy in 2023, from less fusion power than it took to heat the plasma.`,
      visual: gamowPeak({ EGv: r6(EG.dt), T: 104, x: [0, 80], labels: false, caption: 'The Gamow peak for D + T at 9 keV (104 million K): reactions come from the tail of the distribution near 30 keV. S-factor left out.' }),
    }),
    mcq({
      id: 'cp-nif', difficulty: 2,
      prompt: 'On 5 December 2022 the National Ignition Facility fired 2.05 MJ of laser light at a D–T capsule and got 3.15 MJ of fusion energy back. Which statement is honest?',
      choices: [
        'The fusion output exceeded the laser energy on the target (target gain about 1.5), a real milestone; but the lasers drew roughly 300 MJ from the grid, so it was far from producing net electricity',
        'It was the first fusion power plant, supplying net electricity to the grid',
        'It proved fusion is impossible, since the lasers used more energy than came out',
        'It released more energy than any fission bomb',
      ],
      answer: 0,
      why: {
        1: 'NIF is an experiment with no turbines or power conversion; nothing reached the grid.',
        2: 'The capsule itself released more than the light delivered to it — the scientific definition of ignition was met. The wall-plug inefficiency of 1980s-era laser technology is a separate, engineering problem.',
        3: 'Three megajoules is about the chemical energy of 0.7 kg of TNT.',
      },
      hints: ['Two kinds of gain: fusion energy out compared with laser energy in, and with the electricity the facility used.', 'How efficient are NIF’s flash-lamp-pumped lasers?'],
      teach: 'Target gain above 1 is ignition in the physics sense; a power plant needs a gain of order 100 counting every loss.',
      explain: 'Scientific gain 3.15/2.05 ≈ 1.5: the fusion burn produced more energy than the laser light delivered, and later shots reached several megajoules. But the lasers convert under 1% of their electricity into light, and a power plant would also need to fire many times a second and convert heat to electricity. Labelled honestly: a physics milestone, not a power source.',
      visual: gamowPeak({ EGv: r6(EG.dt), T: 116, x: [0, 80], labels: false, caption: 'The Gamow peak for D + T at 10 keV (116 million K), the regime of an imploded NIF capsule’s hot spot (simplified; S-factor left out).' }),
    }),
  ],
  sources: [
    { label: 'Krane, Introductory Nuclear Physics (Wiley, 1988), ch. 13–14: fission and fusion', url: 'https://www.wiley.com/en-us/Introductory+Nuclear+Physics%2C+3rd+Edition-p-9780471805533' },
    { label: 'Bohr and Wheeler (1939), The mechanism of nuclear fission, Phys. Rev. 56, 426', url: 'https://doi.org/10.1103/PhysRev.56.426' },
    { label: 'Abu-Shawareb et al. (2024), Achievement of target gain larger than unity in an inertial fusion experiment, Phys. Rev. Lett. 132, 065102', url: 'https://doi.org/10.1103/PhysRevLett.132.065102' },
    { label: 'ITER Organization, ITER research plan and baseline', url: 'https://www.iter.org/' },
  ],
});
