// Black-hole entropy and Hawking temperature — theory throughout: Hawking
// radiation has never been observed. Bekenstein–Hawking S = kc³A/4Għ and
// T_H = ħc³/8πGMk, linked by 1/T = dS/d(Mc²); the negative heat capacity
// C = −8πGM²k/ħc; a solar-mass hole far colder than the CMB, so today it
// absorbs more than it emits; the crossover mass (about 0.6 Moon masses); the
// photons-only evaporation time 5120πG²M³/ħc⁴; the area theorem checked with
// GW150914; and T_H = ħc/(4πk r_s) in geometric units.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, HBAR, CL, G, MSUN, T_CMB, MOON, EARTH, YEAR, SIGMA, hawkingT, bhS, bhC, bhP, bhLife, M_CROSS, rs, r4, texNum, apart } from './_th4.js';

const t = String.raw;
const LT1 = r4(Math.log10(hawkingT(1)));              // log₁₀ T_H for 1 kg
const LS1 = r4(Math.log10(bhS(1)));                   // log₁₀ S/k for 1 kg
const LC1 = r4(Math.log10(-bhC(1)));                  // log₁₀ |C| for 1 kg
const LL1 = r4(Math.log10(bhLife(1) / YEAR));         // log₁₀ lifetime (yr) for 1 kg
const M_TODAY = Math.cbrt((13.8e9 * YEAR * HBAR * CL ** 4) / (5120 * Math.PI * G * G));   // evaporates in 13.8 Gyr (photons-only)
const SGR = 4.297e6;                                  // M☉, Sgr A* (GRAVITY Collaboration 2022)
const WIEN_B = 2.897771955e-3;                        // m K
const GW150914 = { m1: 35.6, m2: 30.6, mf: 63.1, chi: 0.69 };   // M☉ (LIGO–Virgo GWTC-1)

/** T_H against M on log axes, with the CMB, real masses and an optional marked mass. */
function thPic({ M = null, caption, cross = true, names = true } = {}) {
  const lx = (m) => r4(Math.log10(m));
  const pts = names ? [[MOON, 'Moon'], [EARTH, 'Earth'], [MSUN, 'Sun'], [SGR * MSUN, 'Sgr A*']].map(([m, n]) => ({ x: lx(m), y: r4(LT1 - Math.log10(m)), r: 4, color: 'ink2', label: n, labelDx: 6, labelDy: -10 })) : [];
  return {
    type: 'graph',
    params: {
      x: [8, 38], y: [-16, 16], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'mass (kg)', ylabel: 'Hawking temperature (K)',
      curves: [{ fn: `${LT1} - x`, domain: [8, 38], color: 'violet', width: 2.4 }],
      hlines: [{ y: r4(Math.log10(T_CMB)), color: 'warn', label: 'CMB today, 2.725 K' }],
      vlines: [...(cross ? [{ x: lx(M_CROSS), color: 'ink4' }] : []), ...(M === null ? [] : [{ x: lx(M), color: 'gold' }])],
      points: pts,
    },
    caption: caption || 'Predicted Hawking temperature against mass (log axes): T ∝ 1/M. Holes heavier than the crossover (grey line, about 0.6 Moon masses) are colder than the CMB. Theory: never observed.',
  };
}

export default lesson({
  id: 'phys3700.T11.2',
  title: 'Black-hole entropy and Hawking temperature',
  minutes: 20, difficulty: 3,
  intro: t`In classical general relativity a black hole is a perfect absorber at absolute zero. Jacob Bekenstein argued in 1973 that it must nonetheless carry entropy — otherwise dropping a box of hot gas into one would destroy entropy — and that the entropy must grow with the horizon’s area. In 1974 Stephen Hawking applied quantum field theory near the horizon and found that a black hole should glow like a blackbody at

$$T_H = \frac{\hbar c^3}{8\pi G M k},$$

with entropy $S = kc^3A/(4G\hbar)$, a quarter of the horizon area in units of the Planck area. **This is theory.** Hawking radiation has never been observed: for any black hole astronomers know of, $T_H$ is far colder than the cosmic microwave background. Laboratory analogues — sound in a flowing Bose–Einstein condensate — show the same mathematics, but they are not black holes. The thermodynamics is remarkable: a black hole gets **hotter as it loses energy**. (The horizon itself is in [gr.S22.i](#/lesson/gr.S22.i); the open puzzles, including where the information goes, are in [gr.S37.i](#/lesson/gr.S37.i).)`,
  symbols: [
    { tex: 'T_H', text: 'the Hawking temperature of a non-rotating, uncharged black hole, in K (theoretical prediction)' },
    { tex: '\\hbar', text: 'the reduced Planck constant, $1.055\\times10^{-34}$ J s: the radiation is a quantum effect, absent when $\\hbar \\to 0$' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}$ m³ kg⁻¹ s⁻²' },
    { tex: 'M', text: 'the black hole’s mass, in kg; its horizon radius is $r_s = 2GM/c^2$ and its area $A = 4\\pi r_s^2$' },
    { tex: 'k', text: 'Boltzmann’s constant, $1.381\\times10^{-23}$ J/K' },
  ],
  why: 'Black-hole thermodynamics is where gravity, quantum mechanics and statistical physics meet, and its puzzles — what the entropy counts, where the information goes — are among the deepest open questions in physics.',
  visual: {
    type: 'graph',
    title: 'Hotter as it shrinks',
    lead: t`The violet line is the predicted Hawking temperature against mass, on log axes; the orange line is the CMB. Drag the mass (as $\log_{10}$ of kilograms) and read the hole’s temperature, entropy, heat capacity and lifetime. Remember throughout: **this is theory**.`,
    tasks: [
      'Set the mass to the Sun’s (about 10³⁰ kg): T is 6 × 10⁻⁸ K, tens of millions of times colder than the CMB. It absorbs far more than it emits.',
      'Slide down to the crossover near 4.5 × 10²² kg (0.6 Moon masses): there T(H) equals the CMB’s 2.725 K.',
      'Go down to about 2 × 10¹¹ kg, a small mountain: the photons-only lifetime equals the age of the universe, and T is near 10¹² K.',
    ],
    params: {
      x: [8, 38], y: [-16, 16], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'mass (kg)', ylabel: 'Hawking temperature (K)',
      sliders: [{ key: 'lm', label: 'Mass $\\log_{10}(M/\\text{kg})$', min: 9, max: 37, step: 0.05, value: 30.3, explain: 'The Sun is 30.3; the Moon 22.9; the Earth 24.8; Sagittarius A*, the Milky Way’s central black hole, 36.9.' }],
      curves: [{ fn: `${LT1} - x`, domain: [8, 38], color: 'violet', width: 2.4 }],
      hlines: [{ y: r4(Math.log10(T_CMB)), color: 'warn', label: 'CMB today' }],
      points: [{ x: 'lm', y: `${LT1} - lm`, r: 6, color: 'gold' }],
      vlines: [{ x: r4(Math.log10(M_CROSS)), color: 'ink4' }],
      readouts: [
        { label: '$T_H$ (K)', expr: `10^(${LT1} - lm)`, digits: 3, zero: 0 },
        { label: '$T_H/T_\\text{CMB}$', expr: `10^(${LT1} - lm)/${T_CMB}`, digits: 3, zero: 0 },
        { label: '$S/k$', expr: `10^(${LS1} + 2*lm)`, digits: 3 },
        { label: 'heat capacity $C$ (J/K)', expr: `-10^(${LC1} + 2*lm)`, digits: 3 },
        { label: 'lifetime, photons only (yr)', expr: `10^(${LL1} + 3*lm)`, digits: 2, zero: 0 },
      ],
    },
    caption: 'Hawking’s formulas for a non-rotating, uncharged hole. The lifetime counts photons only, as a perfect blackbody of the horizon’s area: real holes would also emit gravitons, neutrinos and — when hot enough — heavier particles, which shortens it. None of this has been observed.',
  },
  example: {
    prompt: t`For a black hole of one solar mass ($M = ${texNum(MSUN, 4)}$ kg): show that $T_H$ follows from the entropy through $1/T = dS/dU$, evaluate $T_H$, $S/k$ and the heat capacity, and say which way energy flows between it and the CMB.`,
    visual: thPic({ M: MSUN, caption: 'Hawking temperature against mass (theory), with one solar mass marked: far below the CMB line.' }),
    steps: [
      { label: 'Entropy', text: t`$A = 4\pi r_s^2 = 16\pi G^2M^2/c^4$, so $S = \dfrac{kc^3A}{4G\hbar} = \dfrac{4\pi GkM^2}{\hbar c}$. For the Sun’s mass: $S/k = ${texNum(bhS(MSUN), 3)}$. The Sun’s own gas, about $2\times10^{57}$ particles with a few tens of $k$ each, holds roughly $10^{58}k$: collapsing it to a hole would raise its entropy some $10^{19}$-fold.` },
      { label: 'Temperature', text: t`The hole’s energy is $U = Mc^2$, so $\dfrac1T = \dfrac{dS}{dU} = \dfrac{1}{c^2}\dfrac{dS}{dM} = \dfrac{8\pi GkM}{\hbar c^3}$, which is Hawking’s $T_H = \dfrac{\hbar c^3}{8\pi GMk}$. Bekenstein’s entropy and Hawking’s temperature are one thermodynamics.` },
      { label: 'Evaluate', text: t`$T_H = ${texNum(hawkingT(MSUN), 3)}$ K.` },
      { label: 'Heat capacity', text: t`$T_H \propto 1/M$, so $C = \dfrac{dU}{dT} = c^2\dfrac{dM}{dT} = -\dfrac{Mc^2}{T} = -\dfrac{8\pi GM^2k}{\hbar c} = ${texNum(bhC(MSUN), 3)}$ J/K. **Negative**: absorb energy and it cools; lose energy and it heats up.` },
      { label: 'Which way?', text: t`The CMB is at $2.725$ K, $${texNum(T_CMB / hawkingT(MSUN), 2)}$ times hotter. Heat flows from hot to cold, so the hole absorbs far more radiation than it emits: it grows, and because $C < 0$ it cools, falling further behind. Only when the universe’s expansion has cooled the CMB below $T_H$ — in the very distant future — could it start to evaporate.` },
    ],
    answer: t`$T_H = ${texNum(hawkingT(MSUN), 3)}$ K, $S/k = ${texNum(bhS(MSUN), 3)}$, $C = ${texNum(bhC(MSUN), 3)}$ J/K. Colder than the CMB, it absorbs net energy and grows. All of it is a theoretical prediction.`,
  },
  practice: [
    num({
      id: 'th', difficulty: 1,
      gen(r) {
        const [M, what] = r.pick([[MOON, 'the Moon’s mass, $7.346\\times10^{22}$ kg'], [EARTH, 'the Earth’s mass, $5.972\\times10^{24}$ kg'], [10 * MSUN, 'ten solar masses'], [1e12, '$10^{12}$ kg, about a mountain’s mass']]);
        const v = hawkingT(M);
        return {
          prompt: t`What Hawking temperature does theory predict for a black hole of ${what}? ($M_\odot = 1.988\times10^{30}$ kg.)`,
          answer: v, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: v * 8 * Math.PI / (4 * Math.PI), feedback: 'The denominator is 8πGMk.' }, { value: (HBAR * CL * CL) / (8 * Math.PI * G * M * KB), feedback: 'The speed of light is cubed: ħc³.' }], v),
          hints: [t`$T_H = \dfrac{\hbar c^3}{8\pi GMk}$.`, t`$\dfrac{\hbar c^3}{8\pi Gk} = ${texNum(hawkingT(1), 4)}$ K kg; divide by $M$.`],
          teach: 'T(H) ∝ 1/M: the lighter the hole, the hotter it is predicted to glow.',
          explain: t`$T_H = ${texNum(hawkingT(1), 4)}/${texNum(M, 4)} = ${texNum(v, 3)}$ K. ${v > T_CMB ? 'Hotter than the CMB: such a hole would lose energy and heat up as it shrank.' : 'Colder than the CMB: such a hole absorbs more than it emits.'}`,
          visual: thPic({ M, names: false, caption: 'Predicted Hawking temperature against mass (log axes); the gold line marks this mass. Theory: never observed.' }),
        };
      },
    }),
    num({
      id: 'heat-capacity', difficulty: 2,
      gen(r) {
        const [M, what] = r.pick([[MSUN, 'one solar mass'], [MOON, 'the Moon’s mass'], [1e15, '$10^{15}$ kg']]), v = bhC(M);
        return {
          prompt: t`Treating $U = Mc^2$ and $T_H = \hbar c^3/(8\pi GMk)$, what is the heat capacity $C = dU/dT_H$ of a black hole of ${what}, in J/K?`,
          answer: v, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: -v, feedback: 'Check the sign: T falls as M rises, so dU/dT is negative.' }, { value: v / 2, feedback: 'C = −Mc²/T = −8πGM²k/(ħc).' }], v),
          hints: [t`$M = \hbar c^3/(8\pi GkT)$, so $U = Mc^2 \propto 1/T$ and $dU/dT = -U/T$.`, t`$C = -\dfrac{8\pi GM^2k}{\hbar c}$.`],
          teach: 'A black hole’s heat capacity is negative: C = −8πGM²k/(ħc).',
          explain: t`$C = -Mc^2/T_H = ${texNum(v, 3)}$ J/K. Like a star (T11.1), and unlike anything in a laboratory, it cools when it absorbs heat — so it cannot sit in stable equilibrium with a heat bath (T9.1).`,
          visual: { type: 'graph', params: { x: [0.2, 3], y: [0, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'mass M (arbitrary units)', ylabel: 'T(H) (arbitrary units)', curves: [{ fn: '1/x', domain: [0.34, 3], color: 'violet', width: 2.4 }], arrows: [{ from: [1, 1], to: [1.5, 0.6667], color: 'warn', label: 'absorb: cools', labelDx: 6 }, { from: [1, 1], to: [0.6, 1.6667], color: 'accent', label: 'emit: heats', labelDx: 6 }], points: [{ x: 1, y: 1, r: 5, color: 'gold' }] }, caption: 'T(H) ∝ 1/M: adding mass-energy lowers the temperature — a negative heat capacity. Theory.' },
        };
      },
    }),
    num({
      id: 'crossover', difficulty: 2,
      gen(r) {
        const z = r.pick([0, 9, 99, 1089]), Tb = T_CMB * (1 + z), v = (HBAR * CL ** 3) / (8 * Math.PI * G * KB * Tb) / MOON;
        return {
          prompt: t`The CMB’s temperature scales as $T = 2.725\,(1 + z)$ K with redshift $z$. ${z === 0 ? 'Today ($z = 0$)' : `At redshift $z = ${z}$`}, what black-hole mass has a Hawking temperature equal to the CMB’s? Give it in Moon masses ($7.346\times10^{22}$ kg).`,
          answer: v, units: '', tol: { rel: 0.01 },
          errors: apart([{ value: v * (1 + z) * (1 + z), feedback: 'T(H) ∝ 1/M, so the crossover mass falls as 1/(1 + z), not faster.' }, { value: z ? v * (1 + z) : v * 2, feedback: z ? 'A hotter CMB means a lighter crossover: divide by (1 + z), do not multiply.' : 'M = ħc³/(8πGkT): check the factor of 8π.' }], v),
          hints: [t`Set $T_H = T$: $M = \dfrac{\hbar c^3}{8\pi GkT}$.`, t`$T = ${fmt(Tb, 4)}$ K; then divide by $7.346\times10^{22}$ kg.`],
          teach: 'Holes heavier than ħc³/(8πGkT(CMB)) — about 0.6 Moon masses today — are colder than the CMB and grow.',
          explain: t`$M = ${texNum(v * MOON, 3)}$ kg $= ${texNum(v, 3)}$ Moon masses. ${z === 0 ? 'Every black hole yet observed is millions of times heavier, so all of them absorb more than they emit.' : 'The early universe was hotter, so the crossover mass was smaller then.'}`,
          visual: thPic({ caption: 'Predicted Hawking temperature against mass (theory), with today’s CMB temperature. The crossover moves to lighter holes when the CMB is hotter.' }),
        };
      },
    }),
    num({
      id: 'wien', difficulty: 2,
      gen(r) {
        const T = r.pick([30, 100, 300, 1000, 3000]), M = hawkingT(1) / T, v = (WIEN_B / T) * 1e6;
        return {
          prompt: t`A hypothetical black hole of $${texNum(M, 3)}$ kg — about the mass of a large asteroid — would have $T_H = ${T}$ K. At what wavelength would its thermal spectrum (taken as an ideal blackbody) peak, in μm?`,
          answer: v, units: 'μm', tol: { rel: 0.005 },
          errors: apart([{ value: (CL / ((2.821439 * KB * T) / (2 * Math.PI * HBAR))) * 1e6, feedback: 'That is c divided by the frequency of the peak of B(ν). The peak of B(λ) is at λT = 2.898 mm K: the two peaks do not match.' }, { value: (WIEN_B / T) * 1e3, feedback: 'Wien’s constant is 2.898 × 10⁻³ m K: convert metres to micrometres.' }], v),
          hints: [t`Wien’s law: $\lambda_\text{max}T = 2.898\times10^{-3}$ m K.`],
          teach: 'A Hawking spectrum, ideally, is a Planck spectrum: Wien’s law applies.',
          explain: t`$\lambda_\text{max} = 2.898\times10^{-3}/${T}$ m $= ${fmt(v, 3)}$ μm. Real Hawking spectra are not exact blackbodies: the curved spacetime outside the horizon filters them (greybody factors). And no such hole is known.`,
          visual: { type: 'mp-blackbody', params: { T, axis: 'log', compare: ['cmb'], peak: false, readout: false, controls: false, swatch: false, band: true, window: 'all' }, caption: `An ideal ${T} K blackbody (the hole, theory) beside the CMB (faint). The peak is not marked.` },
        };
      },
    }),
    num({
      id: 'lifetime', difficulty: 3,
      gen(r) {
        const M = r.pick([1e9, 5e9, 1e10, 1e11, 1e12]), v = bhLife(M) / YEAR;
        return {
          prompt: t`Treating the horizon as a perfect blackbody radiating only photons, a black hole of mass $M$ evaporates in $t = \dfrac{5120\pi G^2M^3}{\hbar c^4}$. How long, in years, would a primordial black hole of $${texNum(M, 1)}$ kg last?`,
          answer: v, units: 'yr', tol: { rel: 0.01 },
          errors: apart([{ value: bhLife(M), feedback: 'That is in seconds; divide by 3.156 × 10⁷ s per year.' }, { value: (5120 * Math.PI * G * G * M * M) / (HBAR * CL ** 4) / YEAR, feedback: 'The mass is cubed: lighter holes die much faster.' }], v),
          hints: [t`$\dfrac{5120\pi G^2}{\hbar c^4} = ${texNum((5120 * Math.PI * G * G) / (HBAR * CL ** 4), 4)}$ s/kg³.`, t`Multiply by $M^3 = ${texNum(M ** 3, 2)}$ kg³, then divide by $3.156\times10^7$ s/yr.`],
          teach: 'Evaporation time ∝ M³: a hole has to be lighter than a mountain to have evaporated since the Big Bang.',
          explain: t`$t = ${texNum(v, 3)}$ yr ${v < 13.8e9 ? '— shorter than the age of the universe, so a hole formed this light in the Big Bang would already be gone' : '— longer than the age of the universe, 1.38 × 10¹⁰ yr'}. This photons-only estimate is a lower bound on the emission: real holes would also emit gravitons, neutrinos and, once hot enough, electrons and heavier particles, shortening their lives by a factor of tens. Gamma-ray telescopes have searched for the final bursts of evaporating primordial holes and found none — consistent with there being few or none, and no evidence for or against Hawking.`,
          visual: { type: 'graph', params: { x: [8, 14], y: [0, 20], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'mass (kg)', ylabel: 'lifetime (yr), photons only', curves: [{ fn: `${LL1} + 3*x`, domain: [8, 14], color: 'violet' }], hlines: [{ y: r4(Math.log10(13.8e9)), color: 'warn', label: 'age of the universe' }], vlines: [{ x: r4(Math.log10(M)), color: 'gold' }] }, caption: 'Photons-only evaporation time against mass, on log axes: a line of slope 3. Theory.' },
        };
      },
    }),
    num({
      id: 'area-theorem', difficulty: 3,
      prompt: t`When two black holes merge, Hawking’s area theorem (classical general relativity) says the total horizon area — and so the Bekenstein–Hawking entropy — cannot decrease. In GW150914, holes of $${GW150914.m1}$ and $${GW150914.m2}\,M_\odot$ (spinning little) merged into one of $${GW150914.mf}\,M_\odot$ with spin $\chi = ${GW150914.chi}$. A hole of mass $M$ and spin $\chi$ has area $A = 8\pi(GM/c^2)^2\bigl(1 + \sqrt{1 - \chi^2}\bigr)$. What is $A_\text{final}/(A_1 + A_2)$?`,
      answer: (GW150914.mf ** 2 * (1 + Math.sqrt(1 - GW150914.chi ** 2))) / (2 * (GW150914.m1 ** 2 + GW150914.m2 ** 2)),
      tol: { rel: 0.005 },
      errors: [
        { value: GW150914.mf ** 2 / (GW150914.m1 ** 2 + GW150914.m2 ** 2), feedback: 'That ignores the final hole’s spin: a spinning hole has a smaller area, by (1 + √(1 − χ²))/2.' },
        { value: GW150914.mf / (GW150914.m1 + GW150914.m2), feedback: 'Area goes as mass squared, not mass: the total mass fell (energy was radiated), yet the area rose.' },
      ],
      hints: [t`For the non-spinning initial holes, $A = 16\pi(GM/c^2)^2$. All the constants cancel in the ratio.`, t`Ratio $= \dfrac{M_f^2\,(1 + \sqrt{1 - \chi^2})}{2\,(m_1^2 + m_2^2)}$.`],
      teach: 'Horizon area — and with it black-hole entropy — rose in a real merger, even though about three solar masses were radiated away.',
      explain: t`$\dfrac{${GW150914.mf}^2(1 + ${fmt(Math.sqrt(1 - GW150914.chi ** 2), 4)})}{2(${GW150914.m1}^2 + ${GW150914.m2}^2)} = ${fmt((GW150914.mf ** 2 * (1 + Math.sqrt(1 - GW150914.chi ** 2))) / (2 * (GW150914.m1 ** 2 + GW150914.m2 ** 2)), 3)}$: the area grew by about half while $${fmt(GW150914.m1 + GW150914.m2 - GW150914.mf, 2)}\,M_\odot$ went into gravitational waves. Analysing the signal directly, Isi et al. (2021) confirmed the area increase at high confidence. That tests the **classical** area law — the second law’s geometric twin — not Hawking radiation.`,
      visual: { type: 'gr-chirp', params: { m1: 35.6, m2: 30.6, D: 440, sliders: false, play: false, readout: false }, caption: 'The inspiral of a GW150914-like pair at leading (quadrupole) order, up to where the horizons would touch, with the arms of a detector stretched (hugely exaggerated). The merger and ringdown that follow are not modelled.' },
    }),
    mcq({
      id: 'never-seen', difficulty: 2,
      prompt: 'Why has Hawking radiation never been detected from any known black hole?',
      choices: [
        'Every known black hole is at least a few solar masses, so T(H) is below about 10⁻⁷ K — swamped by the 2.7 K CMB and far too faint to measure',
        'Hawking radiation is emitted only inside the horizon, where nothing can escape',
        'Black holes are too far away; a nearby one would be easy to measure',
        'The radiation was detected by LIGO in 2015 as gravitational waves',
      ],
      answer: 0,
      why: { 1: 'In Hawking’s calculation the radiation emerges from just outside the horizon and escapes to infinity.', 2: 'Even the nearest known black hole, at a solar-mass scale, would emit a total power around 10⁻²⁸ W: distance is not the problem.', 3: 'LIGO detected the classical gravitational waves of merging holes, not quantum Hawking radiation.' },
      hints: ['Put a stellar-mass hole into T(H) = ħc³/(8πGMk) and compare with the CMB.', 'The total power also goes as 1/M²: ħc⁶/(15360πG²M²).'],
      teach: 'Known black holes are far too cold and faint for their predicted Hawking radiation to be seen.',
      explain: t`For $M = M_\odot$, $T_H = ${texNum(hawkingT(MSUN), 2)}$ K and the photons-only power is $${texNum(bhP(MSUN), 2)}$ W. Only small primordial black holes, if any exist, could be hot enough to see — and searches have found none. Hawking radiation remains a firm theoretical prediction, untested.`,
      visual: thPic({ M: 5 * MSUN, names: false, caption: 'Predicted Hawking temperature against mass (theory), with a 5-solar-mass hole marked: twenty-odd powers of ten below the CMB.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-geometric', difficulty: 3, transfer: true,
      gen(r) {
        const [Ms, name] = r.pick([[9.62, 'Gaia BH1, the nearest known black hole'], [21.2, 'Cygnus X-1'], [SGR, 'Sagittarius A*, at the Milky Way’s centre']]);
        const rsKm = (rs(Ms * MSUN) / 1000), v = (HBAR * CL) / (4 * Math.PI * KB * rsKm * 1000);
        return {
          prompt: t`In geometric units ([R0.1](#/lesson/phys3710.R0.1)) a mass is a length: one solar mass is $2.953$ km of Schwarzschild radius. ${name[0].toUpperCase() + name.slice(1)} has $r_s = ${texNum(rsKm, 4)}$ km. Using $T_H = \dfrac{\hbar c}{4\pi k\,r_s}$ (the same formula, since $r_s = 2GM/c^2$), what is its predicted Hawking temperature, in K?`,
          answer: v, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: v * 1000, feedback: 'Convert r(s) from kilometres to metres.' }, { value: v * 2, feedback: 'T(H) = ħc/(4πk r(s)): with r(s) = 2GM/c² the 8π becomes 4π.' }], v),
          hints: [t`$\dfrac{\hbar c}{4\pi k} = ${texNum((HBAR * CL) / (4 * Math.PI * KB), 4)}$ m K.`, t`$r_s = ${texNum(rsKm * 1000, 4)}$ m.`],
          teach: 'In geometric units T(H) = ħc/(4πk r(s)): the temperature of a horizon is set by its size alone.',
          explain: t`$T_H = ${texNum((HBAR * CL) / (4 * Math.PI * KB), 4)}/${texNum(rsKm * 1000, 4)} = ${texNum(v, 3)}$ K — a thermal wavelength comparable to the horizon itself. A prediction, not a measurement: this hole sits in a 2.7 K universe and is growing, not evaporating.`,
          visual: thPic({ M: (rsKm / 2.953) * MSUN, names: false, caption: 'Predicted Hawking temperature against mass (theory), with this hole marked.' }),
        };
      },
    }),
    mcq({
      id: 'cp-unstable', difficulty: 3,
      prompt: t`A black hole of exactly the crossover mass has $T_H = T_\text{CMB}$, so it absorbs and emits equally. What happens if it absorbs a little extra radiation?`,
      choices: [
        'It grows, cools below the CMB, and so absorbs even more: the balance is unstable, because its heat capacity is negative',
        'It warms slightly, emits the extra energy back, and returns to balance',
        'Nothing: equal temperatures mean permanent equilibrium',
        'It immediately evaporates',
      ],
      answer: 0,
      why: { 1: 'That is the stable behaviour of a body with positive heat capacity. A black hole cools when it gains energy.', 2: 'Equal temperatures are an equilibrium, but whether it is stable depends on the sign of the heat capacity.', 3: 'Gaining mass makes it colder and longer-lived, not hotter.' },
      hints: ['T(H) ∝ 1/M. What does extra mass do to T(H)?', 'Then compare T(H) with the CMB: which way does net energy now flow?'],
      teach: 'Negative heat capacity makes a black hole’s balance with a heat bath unstable: any nudge runs away.',
      explain: 'Extra mass lowers T(H) below the CMB, so it absorbs more than it emits, gains more mass, cools further — a runaway. Nudge it the other way and it heats, emits more than it absorbs, and runs away towards evaporation. This is T9.1’s point: a system with C < 0 cannot be in stable canonical equilibrium with a bath.',
      visual: { type: 'graph', params: { x: [0.4, 2.5], y: [0, 2.6], aspect: 'wide', axesAt: 'edge', xlabel: 'M / M(crossover)', ylabel: 'temperature / T(CMB)', curves: [{ fn: '1/x', domain: [0.4, 2.5], color: 'violet', width: 2.4, label: 'T(H) (theory)', labelAt: 0.55, labelDx: 8 }], hlines: [{ y: 1, color: 'warn', label: 'CMB' }], points: [{ x: 1, y: 1, r: 5, color: 'gold' }] }, caption: 'Hawking temperature against mass near the crossover (theory). Right of the gold point the hole is colder than the CMB; left of it, hotter.' },
    }),
    num({
      id: 'cp-gsl', difficulty: 3,
      gen(r) {
        const [Mh, what] = r.pick([[MSUN, 'a one-solar-mass'], [10 * MSUN, 'a ten-solar-mass'], [MOON, 'a Moon-mass']]), m = r.pick([1, 10]), Sgas = m * 6.84e3;
        const dS = (m * CL * CL) / hawkingT(Mh), v = Math.log10(dS / Sgas);
        return {
          prompt: t`A $${m}$ kg box of nitrogen at room temperature, with entropy about $${texNum(Sgas, 3)}$ J/K, falls into ${what} black hole. Its entropy vanishes from the outside world, but the hole gains energy $mc^2$, so its entropy rises by $\Delta S = mc^2/T_H$. Give $\log_{10}$ of the ratio $\Delta S_\text{hole}/S_\text{box}$.`,
          answer: v, tol: { rel: 0, abs: 0.05 },
          errors: [{ value: Math.log10((m * CL) / hawkingT(Mh) / Sgas), feedback: 'The energy added is mc², with c squared.' }],
          hints: [t`$\Delta S = mc^2/T_H$ with $T_H = ${texNum(hawkingT(Mh), 3)}$ K (thermodynamic identity, $dS = dU/T$).`, t`$\Delta S = ${texNum(dS, 3)}$ J/K; divide by $${texNum(Sgas, 3)}$ J/K and take $\log_{10}$.`],
          teach: 'The generalized second law: the hole’s entropy gain far outweighs the entropy it swallows.',
          explain: t`$\Delta S_\text{hole} = ${texNum(dS, 3)}$ J/K, so the ratio is $10^{${fmt(v, 3)}}$. Bekenstein’s generalized second law — the entropy outside plus the hole’s never decreases — is satisfied by a huge margin. That was his original argument that a black hole must have entropy at all.`,
          visual: thPic({ M: Mh, names: false, caption: 'Predicted Hawking temperature against mass (theory), with this hole marked. The colder the hole, the more entropy each joule adds: dS = dU/T.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Bekenstein, Black Holes and Entropy, Phys. Rev. D 7, 2333 (1973)', url: 'https://doi.org/10.1103/PhysRevD.7.2333' },
    { label: 'Hawking, Particle Creation by Black Holes, Commun. Math. Phys. 43, 199 (1975)', url: 'https://doi.org/10.1007/BF02345020' },
    { label: 'Wald, The Thermodynamics of Black Holes, Living Rev. Relativ. 4, 6 (2001)', url: 'https://arxiv.org/abs/gr-qc/9912119' },
    { label: 'Page, Particle emission rates from a black hole, Phys. Rev. D 13, 198 (1976)', url: 'https://doi.org/10.1103/PhysRevD.13.198' },
    { label: 'Isi et al., Testing the Black-Hole Area Law with GW150914, Phys. Rev. Lett. 127, 011103 (2021)', url: 'https://doi.org/10.1103/PhysRevLett.127.011103' },
    { label: 'LIGO–Virgo, GWTC-1, Phys. Rev. X 9, 031040 (2019) (GW150914 masses and spin)', url: 'https://doi.org/10.1103/PhysRevX.9.031040' },
    { label: 'Fixsen, The Temperature of the Cosmic Microwave Background, ApJ 707, 916 (2009)', url: 'https://doi.org/10.1088/0004-637X/707/2/916' },
  ],
});
