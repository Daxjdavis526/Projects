// Superconductivity — zero resistance (persistent currents), the Meissner
// effect (field expelled whatever the history, unlike a merely perfect
// conductor), the critical field B_c(T) = B_c(0)[1 − (T/T_c)²], types I and
// II, BCS in words (Cooper pairs, the gap 2Δ ≈ 3.5kT_c, the isotope effect,
// the flux quantum h/2e), high-T_c cuprates and hydrides with their real
// critical temperatures, LK-99 (refuted), MRI, the LHC, maglev and Gravity
// Probe B’s London moment. Every number is computed here or in
// src/viz/model/mp-solids.js.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H_EVS } from './_constants.js';
import { disc } from './_diagrams.js';
import { S, r6, seg, label } from './_solids.js';

const t = String.raw;
const PB = S.SUPER.pb;
const MU0 = 4e-7 * Math.PI * 1.00000000055;              // H/m (CODATA 2022: μ₀/4π×10⁻⁷ = 1.000 000 000 55)
const BC42 = S.critField(4.2, PB.Tc, PB.Bc0);
const I_PB = (2 * Math.PI * 1e-3 * BC42) / MU0;          // A, a lead wire 1 mm in radius at 4.2 K

/**
 * Field lines around a long cylinder in a transverse field, R = 1: the lines y(1 − s/r²) = c,
 * with s = 1 when the field is fully expelled and s = 0 when it passes straight through.
 * s is an expression (it may use slider keys).
 */
function fieldLines(s, { extra = {}, caption, sample = true } = {}) {
  const curves = [];
  for (const c of [0.2, 0.6, 1.0, 1.4, 1.8, 2.2]) for (const [a, b] of [[0.002, 3.1396], [3.1436, 6.281]]) {
    curves.push({ polar: `(${c} + sqrt(${c}^2 + 4*(${s})*sin(theta)^2))/(2*abs(sin(theta)))`, theta: [a, b], color: 'accent', width: 1.8 });
  }
  return {
    type: 'graph',
    params: {
      x: [-3.4, 3.4], y: [-2.75, 2.75], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      shade: sample ? [{ ...disc(0, 0, 1, 'ink4', 0.35) }, { ...disc(0, 0, 1, 'violet', 0.35), when: `step((${s}) - 0.5)` }] : [],
      curves,
      arrows: [{ from: [-3.3, 2.6], to: [-2.5, 2.6], color: 'accent', label: 'applied field', labelDx: 8, labelDy: 0 }],
      ...extra,
    },
    caption: caption ?? 'Field lines around a long cylinder (seen end-on) in a sideways magnetic field: the exact pattern for complete expulsion, which crowds the lines at the sides to twice the applied field. The field actually leaks about 50 nm into the surface (the penetration depth) — far too thin to draw.',
  };
}

/** The B–T phase diagram of a type-I superconductor, with an optional horizontal field line and points. */
function phase(sc, { B = null, T = null, numbers = true, extra = {}, caption } = {}) {
  const f = `${sc.Bc0 * 1000}*(1 - (x/${sc.Tc})^2)`;
  return {
    type: 'graph',
    params: {
      x: [0, r6(sc.Tc * 1.25)], y: [0, r6(sc.Bc0 * 1000 * 1.2)], aspect: 'wide', axesAt: 'edge', xlabel: 'temperature (K)', ylabel: 'magnetic field (mT)',
      ...(numbers ? {} : { yticks: 0 }),
      shade: [{ fn: f, from: 0, to: sc.Tc, color: 'violet', alpha: 0.2 }],
      curves: [{ fn: f, domain: [0, sc.Tc], color: 'violet', width: 2.6 }],
      points: [label(sc.Tc * 0.3, sc.Bc0 * 1000 * 0.35, 'superconducting', 'violet', 0, 0, 'center'), label(sc.Tc * 0.95, sc.Bc0 * 1000 * 0.95, 'normal metal', 'ink2', 0, 0, 'center'), ...(extra.points || [])],
      hlines: B !== null ? [{ y: r6(B * 1000), color: 'gold' }] : [],
      vlines: T !== null ? [{ x: T, color: 'gold' }] : [],
      ...Object.fromEntries(Object.entries(extra).filter(([k]) => k !== 'points')),
    },
    caption: caption ?? t`The phase diagram of ${sc.label}: superconducting below the critical-field curve $B_c(T) = B_c(0)[1 - (T/T_c)^2]$, an empirical law that fits type-I elements to a few per cent.`,
  };
}

/** The record critical temperatures, year by year (ambient pressure unless marked). */
const RECORDS = [
  [1911, 4.2, 'Hg'], [1913, 7.2, ''], [1930, 9.2, 'Nb'], [1941, 16, ''], [1954, 18.3, 'Nb₃Sn'], [1973, 23.2, ''],
  [1986, 35, 'LBCO'], [1987, 93, 'YBCO'], [1988, 110, ''], [1988.6, 125, ''], [1993, 134, 'Hg-1223'], [2001, 39, 'MgB₂'], [2008, 55, 'iron-based'],
];
const timeline = (caption) => ({
  type: 'graph',
  params: {
    x: [1905, 2028], y: [0, 320], aspect: 'wide', axesAt: 'edge', xlabel: 'year of discovery', ylabel: 'critical temperature (K)',
    hlines: [{ y: 4.2, label: 'liquid helium boils, 4.2 K', color: 'accent' }, { y: 77, label: 'liquid nitrogen boils, 77 K', color: 'teal' }, { y: 293, label: 'room temperature', color: 'bad' }],
    points: [
      ...RECORDS.map(([x, y, n]) => ({ x, y, r: 4.5, color: 'violet', ...(n ? { label: n, labelDx: -8, labelDy: -10, labelAlign: 'right' } : {}) })),
      { x: 2015, y: 203, r: 5, color: 'gold', label: 'H₃S, at 1.5 million atm', labelDx: -8, labelDy: -10, labelAlign: 'right' },
      { x: 2019, y: 250, r: 5, color: 'gold', label: 'LaH₁₀, at 1.7 million atm', labelDx: -8, labelDy: -10, labelAlign: 'right' },
    ],
  },
  caption: caption ?? 'Record critical temperatures by year. Purple: at ordinary pressure (the cuprates from 1986 on; the record, mercury cuprate, is about 134 K). Gold: hydrides squeezed in diamond anvils to well over a million atmospheres. No superconductor is confirmed at room temperature and ordinary pressure.',
});

export default lesson({
  id: 'phys2710.MP12.4',
  title: 'Superconductivity',
  minutes: 13, difficulty: 3,
  badges: ['est-obs', 'model', 'open'],
  intro: t`Cool mercury below 4.2 K and its electrical resistance vanishes — not falls, **vanishes**: a current set flowing in a ring of superconductor keeps going for as long as anyone has watched. A superconductor also **expels magnetic field** from its interior (the Meissner effect), which no merely perfect conductor would do. That makes superconductivity a new state of matter, and like any state it has limits. Above a critical temperature $T_c$, or in a field above a critical field, it is destroyed:

$$B_c(T) = B_c(0)\left[1 - \left(\frac{T}{T_c}\right)^2\right]$$

The explanation (Bardeen, Cooper and Schrieffer, 1957): lattice vibrations bind electrons into **Cooper pairs**, which move together in a single quantum state that scattering cannot disturb. Why the copper-oxide superconductors work at up to 134 K is still an **open question**.`,
  symbols: [
    { tex: 'B_c(T)', text: 'the critical field at temperature $T$: a stronger field destroys superconductivity, in tesla' },
    { tex: 'B_c(0)', text: 'the critical field extrapolated to absolute zero — 0.080 T for lead, 0.041 T for mercury' },
    { tex: 'T', text: 'the temperature, in kelvin' },
    { tex: 'T_c', text: 'the critical temperature, above which the material is an ordinary metal: 4.15 K for mercury, 7.19 K for lead, 9.25 K for niobium' },
  ],
  why: 'Superconducting magnets make every hospital MRI scan, steer the Large Hadron Collider’s beams and float Japan’s maglev trains; superconducting detectors read the sky at millimetre wavelengths.',
  visual: {
    ...fieldLines('step(7.19 - T)*(kind + (1 - kind)*(1 - order))', {
      extra: {
        sliders: [{ key: 'T', label: 'Temperature $T$', min: 1, max: 12, step: 0.1, value: 10, unit: '\\mathrm{K}', explain: 'The sample is lead, $T_c = 7.19$ K. The applied field is weak, well below the critical field.' }],
        choices: [
          { key: 'kind', label: 'The sample', options: [[1, 'superconductor (lead)'], [0, 'perfect conductor (imagined)']], value: 1, explain: 'An imagined metal whose resistance simply drops to zero below 7.19 K, with no other change.' },
          { key: 'order', label: 'In what order', options: [[1, 'field on, then cool'], [0, 'cool, then field on']], value: 1, explain: 'Whether the field was already there when the sample was cooled.' },
        ],
        readouts: [{ label: 'field inside the sample', expr: '1 - step(7.19 - T)*(kind + (1 - kind)*(1 - order))', unit: '\\times\\text{ applied}', digits: 1 }],
      },
    }),
    title: 'Meissner versus a perfect conductor',
    lead: t`A long sample seen end-on, in a sideways magnetic field (blue lines). Above $T_c$ the field passes straight through. Cool it and watch what happens — and then ask whether a metal that had merely lost all its resistance would do the same.`,
    tasks: [
      'With the field on, cool the lead below 7.19 K: the field is pushed out (the sample turns violet). That is the Meissner effect.',
      'Switch to the imagined perfect conductor and do the same: the field stays inside, frozen in, because zero resistance only forbids the flux from changing.',
      'Choose “cool, then field on”: now both keep the field out. Only the superconductor ends up in the same state whichever order you choose — the mark of a true thermodynamic phase.',
    ],
  },
  example: {
    prompt: t`Lead has $T_c = 7.19$ K and $B_c(0) = 0.0803$ T. (a) What is its critical field at 4.2 K, the boiling point of liquid helium? (b) A current $I$ in a straight wire makes a field $B = \mu_0I/2\pi r$ at its surface. What is the largest current a lead wire of radius 1.0 mm can carry at 4.2 K before its own field destroys superconductivity?`,
    visual: phase(PB, { T: 4.2, caption: 'Lead’s phase diagram (an empirical parabola). The gold line marks 4.2 K, liquid helium’s boiling point.' }),
    steps: [
      { label: 'The critical field', text: t`$B_c(4.2\ \text{K}) = 0.0803\left[1 - \left(\dfrac{4.2}{7.19}\right)^2\right] = 0.0803\times${fmt(1 - (4.2 / 7.19) ** 2, 3)} = ${fmt(BC42, 3)}$ T.` },
      { label: 'The wire’s own field', text: t`The surface field reaches $B_c$ when $\mu_0I/2\pi r = B_c$, so $I = 2\pi rB_c/\mu_0$ (Silsbee’s rule).` },
      { label: 'The current', text: t`$I = \dfrac{2\pi(1.0\times10^{-3}\ \text{m})(${fmt(BC42, 3)}\ \text{T})}{4\pi\times10^{-7}\ \text{T m/A}} = ${fmt(I_PB, 3)}$ A.` },
      { label: 'Sense check', text: t`A few hundred amperes with no loss at all is impressive — but an MRI magnet needs fields of 1.5 to 3 T, some 50 times lead’s critical field. Type-I elements like lead cannot do it. **Type-II** alloys such as niobium–titanium let the field in as thin quantized whirlpools (vortices) and stay superconducting up to about 10 T at 4.2 K.` },
    ],
    answer: t`(a) $B_c = ${fmt(BC42, 3)}$ T; (b) $I_{\max} = ${fmt(I_PB, 3)}$ A.`,
  },
  practice: [
    mcq({
      id: 'meissner', difficulty: 2,
      prompt: 'A sample sits in a weak magnetic field and is then cooled below its critical temperature. Which observation shows that a superconductor is more than a perfect conductor?',
      choices: [
        'The field is pushed out of the sample as it cools, although nothing changed the applied field',
        'Its resistance drops to zero',
        'The field inside stays exactly as it was before cooling',
        'A current started in a ring of it never decays',
      ],
      answer: 0,
      why: {
        1: 'Zero resistance is what “perfect conductor” means; it does not distinguish the two.',
        2: 'That is what a perfect conductor would do: with no resistance, the flux inside cannot change. A superconductor expels it.',
        3: 'A persistent current also follows from zero resistance alone.',
      },
      hints: ['Faraday’s law: in a material with zero resistance, can the magnetic flux through it change?', 'So a perfect conductor cooled in a field keeps the field. What does a superconductor do?'],
      teach: 'A superconductor actively expels magnetic field (the Meissner effect); a perfect conductor would only freeze in whatever field it had.',
      explain: 'Zero resistance means no electric field inside, so by Faraday’s law the flux inside cannot change: a perfect conductor cooled in a field would keep it. Meissner and Ochsenfeld found in 1933 that tin and lead push the field out as they cool. The superconducting state is therefore a phase, with a unique equilibrium, not just a metal without resistance.',
      visual: fieldLines('1', { caption: 'A superconductor cooled in a field: the field is expelled (exact pattern for complete expulsion; the 50 nm penetration depth is too thin to draw).' }),
    }),
    num({
      id: 'field-kills', difficulty: 2,
      gen(r) {
        const key = r.pick(['pb', 'hg', 'sn', 'in']), sc = S.SUPER[key], frac = r.pick([0.3, 0.5, 0.6, 0.75]), B = +(frac * sc.Bc0).toPrecision(2), T = S.critTemp(B, sc.Tc, sc.Bc0);
        return {
          prompt: t`${sc.label[0].toUpperCase() + sc.label.slice(1)} has $T_c = ${sc.Tc}$ K and $B_c(0) = ${sc.Bc0}$ T. In a steady field of $${B}$ T, below what temperature is it superconducting?`,
          answer: T, units: 'K', tol: { rel: 0.005 },
          errors: [{ value: sc.Tc * (1 - B / sc.Bc0), feedback: t`$B_c$ falls with the **square** of $T/T_c$: solve $1 - (T/T_c)^2 = B/B_c(0)$, so $T = T_c\sqrt{1 - B/B_c(0)}$.` }],
          hints: [t`Set $B_c(T) = ${B}$ T and solve for $T$.`, t`$T = T_c\sqrt{1 - B/B_c(0)} = ${sc.Tc}\sqrt{1 - ${B}/${sc.Bc0}}$.`],
          teach: t`A field lowers the temperature at which superconductivity sets in: $T = T_c\sqrt{1 - B/B_c(0)}$.`,
          explain: t`$T = ${sc.Tc}\sqrt{1 - ${fmt(B / sc.Bc0, 3)}} = ${fmt(T, 3)}$ K. In the phase diagram, the gold line crosses the critical curve there.`,
          visual: phase(sc, { B, numbers: false, caption: `The phase diagram of ${sc.label} (field numbers hidden). The gold line is the applied field.` }),
        };
      },
    }),
    num({
      id: 'pair-gap', difficulty: 2,
      gen(r) {
        const [name, Tc, meas] = r.pick([['aluminium', 1.175, 0.34], ['tin', 3.722, 1.15], ['niobium', 9.25, 3.05]]), gap = S.pairGap(Tc), f = gap / H_EVS / 1e9;
        return {
          prompt: t`BCS theory predicts that breaking a Cooper pair costs $2\Delta = 3.53\,kT_c$. Photons with less energy than that cannot be absorbed by breaking pairs. For ${name} ($T_c = ${Tc}$ K), what is the lowest photon frequency that can break a pair, in GHz?`,
          answer: f, units: 'GHz', tol: { rel: 0.01 },
          errors: [{ value: f / 2, feedback: t`The pair gap is $2\Delta = 3.53\,kT_c$; you used half of it.` }],
          hints: [t`$2\Delta = 3.53\times(8.617\times10^{-5}\ \text{eV/K})\times${Tc}$ K.`, t`$f = 2\Delta/h$ with $h = 4.136\times10^{-15}$ eV s.`],
          teach: t`A superconductor’s pair gap, $2\Delta \approx 3.5\,kT_c$, is a few meV: photons below about a terahertz pass without breaking pairs.`,
          explain: t`$2\Delta = ${fmt(gap * 1000, 3)}$ meV, so $f = ${fmt(f, 3)}$ GHz — microwaves to far infrared. Measured, ${name}’s gap is about ${meas} meV: BCS’s simple ratio is close for weakly coupled metals and a little low for niobium. Niobium detectors on radio telescopes such as ALMA work up to about 700 GHz for exactly this reason.`,
          visual: { type: 'graph', params: { x: [0, 10], y: [-1.2, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'temperature (K)', ylabel: 'energy (meV)', yticks: 0,
            shade: [{ fn: `0.5*${r6(gap * 1000)}*sqrt(max(0, 1 - (x/${Tc})^4))`, lower: `-0.5*${r6(gap * 1000)}*sqrt(max(0, 1 - (x/${Tc})^4))`, from: 0, to: Tc, color: 'violet', alpha: 0.3 }],
            vlines: [{ x: Tc, label: 'critical temperature', color: 'violet' }],
            points: [label(0.2, 0, 'the gap: no states for single electrons', 'violet', 0, 0, 'left')] },
            caption: `Schematic: the energy gap of ${name} opening below its critical temperature and reaching its full width 2Δ at absolute zero (the curve’s shape is approximate).` },
        };
      },
    }),
    num({
      id: 'isotope', difficulty: 3,
      gen(r) {
        const M2 = r.pick([198, 200.6, 202, 204]), T2 = 4.185 * Math.sqrt(199.5 / M2);
        return {
          prompt: t`In 1950 mercury samples made of different isotopes were found to have different critical temperatures, with $T_c \propto M^{-1/2}$ for an average atomic mass $M$. A sample with $M = 199.5$ u has $T_c = 4.185$ K. What is $T_c$ for $M = ${M2}$ u, in K, to four significant figures?`,
          answer: T2, units: 'K', tol: { rel: 2e-4 },
          errors: [{ value: 4.185 * (199.5 / M2), feedback: t`$T_c$ goes as $M^{-1/2}$: take the square root of the mass ratio.` }, { value: 4.185 * Math.sqrt(M2 / 199.5), feedback: 'Heavier isotopes have the lower critical temperature: the ratio is √(199.5/M), not √(M/199.5).' }],
          hints: [t`$\dfrac{T_{c2}}{T_{c1}} = \left(\dfrac{M_1}{M_2}\right)^{1/2}$.`, t`$T_{c2} = 4.185\sqrt{199.5/${M2}}$ K.`],
          teach: t`The isotope effect, $T_c \propto M^{-1/2}$, was the clue that lattice vibrations — whose frequencies go as $M^{-1/2}$ — bind the Cooper pairs.`,
          explain: t`$T_c = 4.185\times\sqrt{199.5/${M2}} = ${fmt(T2, 4)}$ K. A lattice of heavier ions vibrates more slowly (as $M^{-1/2}$, like a mass on a spring), and the critical temperature follows: the electrons’ pairing glue is the lattice’s vibrations. This clue guided Bardeen, Cooper and Schrieffer to their theory.`,
          visual: { type: 'graph', params: { x: [197, 206], y: [4.12, 4.22], aspect: 'wide', axesAt: 'edge', xlabel: 'average isotopic mass (u)', ylabel: 'critical temperature (K)',
            curves: [{ fn: '4.185*sqrt(199.5/x)', color: 'violet', width: 2.4 }],
            points: [{ x: 199.5, y: 4.185, r: 5, color: 'gold', label: 'natural mercury, 4.185 K', labelDx: 8, labelDy: -10 }], vlines: [{ x: M2, label: `${M2} u: ?`, color: 'gold' }] },
            caption: t`The isotope effect in mercury: $T_c \propto M^{-1/2}$. The curve is the law; the measurements of 1950 (Maxwell; Reynolds and co-workers) lie on it within their scatter.` },
        };
      },
    }),
    num({
      id: 'flux-quantum', difficulty: 2,
      gen(r) {
        const B = r.pick([50e-6, 20e-6, 1e-6]), A = r.pick([1, 4, 0.25]) * 1e-6, N = (B * A) / S.FLUX_QUANTUM;
        return {
          prompt: t`The magnetic flux through a superconducting ring is quantized in units of $h/2e = ${tex(S.FLUX_QUANTUM, 4)}$ Wb — the charge is $2e$ because the carriers are pairs. How many flux quanta does a field of $${tex(B * 1e6, 2)}\ \mu\text{T}$ thread through a ring of area ${fmt(A * 1e6, 2)} mm²?`,
          answer: N, tol: { rel: 0.005 },
          errors: [{ value: N / 2, feedback: t`The flux quantum is $h/2e$, not $h/e$.` }],
          hints: [t`Flux $\Phi = BA$, with $A$ in m².`, t`$N = \Phi/(h/2e) = BA/(${tex(S.FLUX_QUANTUM, 4)}\ \text{Wb})$.`],
          teach: 'Flux through a superconducting loop comes in quanta of h/2e = 2.07 × 10⁻¹⁵ Wb; SQUIDs count fractions of one.',
          explain: t`$\Phi = ${tex(B * A, 3)}$ Wb, which is $${tex(N, 3)}$ flux quanta. A SQUID — a superconducting loop broken by one or two thin junctions — responds to a change of a tiny fraction of one quantum, enough to map the femtotesla fields of the human brain. That the quantum is $h/2e$, measured in 1961, was direct evidence that the carriers are pairs.`,
          visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-1.3, 1.3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
            curves: [{ param: ['cos(t)', '0.8*sin(t)'], t: [0, 6.2832], color: 'violet', width: 6 }],
            points: [...[-0.5, 0, 0.5].flatMap((x) => [-0.3, 0.3].map((y) => ({ x, y, r: 4, color: 'accent' }))), label(0, -1.1, 'superconducting ring', 'violet', 0, 0, 'center'), label(1.3, 0.6, 'field out of the page', 'accent', 0, 0, 'left')] },
            caption: 'A superconducting ring with a magnetic field through it (dots: field lines coming out of the page). Not to scale.' },
        };
      },
    }),
    mcq({
      id: 'nitrogen', difficulty: 2,
      prompt: 'When YBCO was found in 1987 to superconduct at 93 K, it caused a sensation. What made 93 K the important number?',
      choices: [
        'It is above 77 K, where liquid nitrogen boils: cooling became cheap and easy instead of needing scarce liquid helium',
        'It is above room temperature, so no cooling at all was needed',
        'It proved the BCS theory, which had predicted it',
        'Above 90 K superconductors no longer have a critical field',
      ],
      answer: 0,
      why: {
        1: 'Room temperature is about 293 K. 93 K is −180 °C.',
        2: 'BCS-style estimates had suggested limits near 30 K; how the cuprates superconduct is still debated.',
        3: 'Cuprates have critical fields — very large ones — like every superconductor.',
      },
      hints: ['What coolants are there, and at what temperatures do they boil?', 'Liquid helium boils at 4.2 K; liquid nitrogen at 77 K and costs about as much as milk.'],
      teach: 'Copper-oxide superconductors work above 77 K, so cheap liquid nitrogen can cool them; their mechanism remains an open question.',
      explain: 'Liquid nitrogen, made from air, costs a small fraction of liquid helium and is far easier to handle. Above 77 K superconducting cables, current leads and magnetic shields became practical. Why the cuprates superconduct at all is still debated: they are not simple BCS metals.',
      visual: timeline(),
    }),
    mcq({
      id: 'lk99', difficulty: 2,
      prompt: 'In July 2023 a preprint claimed that LK-99, a copper-doped lead apatite, was a superconductor at room temperature and ordinary pressure, with videos of a fragment half-levitating over a magnet. What is its status now?',
      choices: [
        'Refuted: laboratories that made pure samples found an insulator; the sudden drop in resistance came from a copper sulfide impurity changing structure near 104 °C',
        'Confirmed, and already used in prototype power cables',
        'Confirmed, but only under pressures above a million atmospheres',
        'Unsettled: half the replications found superconductivity',
      ],
      answer: 0,
      why: {
        1: 'No LK-99 sample has shown zero resistance or a Meissner effect.',
        2: 'That describes the hydrides, a different class of materials, measured in diamond anvils.',
        3: 'The replications converged within weeks: no superconductivity, and the effects were explained by impurities and ordinary magnetism.',
      },
      hints: ['A superconductor must show two things: zero resistance and field expulsion.', 'Did any group find both in a clean sample?'],
      teach: 'Extraordinary claims need both signatures — zero resistance and the Meissner effect — reproduced in clean samples; LK-99 showed neither.',
      explain: 'Within weeks, groups worldwide made LK-99. Pure single crystals turned out to be insulators. Copper sulfide, an impurity, changes structure at about 385 K (104 °C), which explained the drop in resistance; the half-levitation came from ferromagnetic and diamagnetic grains. Two earlier claims of room-temperature superconductivity in hydrides under pressure (2020, 2023) were retracted by the journal that published them. Room-temperature superconductivity at ordinary pressure remains undiscovered.',
      visual: timeline('Record critical temperatures by year. No superconductor is confirmed at room temperature and ordinary pressure; LK-99’s claim (2023) is not plotted because it was refuted.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gpb', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([60, 70, 80]), B = S.londonField(f);
        return {
          prompt: t`Gravity Probe B (launched 2004) tested general relativity with four gyroscopes: quartz balls coated with superconducting niobium. A spinning superconductor carries a magnetic field inside it, the **London moment** $B = 2m_e\omega/e$, which points along the spin axis and let SQUIDs read each rotor’s direction. What field did a rotor spinning at ${f} revolutions per second make, in nT?`,
          answer: B * 1e9, units: 'nT', tol: { rel: 0.005 },
          errors: [{ value: (B * 1e9) / (2 * Math.PI), feedback: t`$\omega$ is the angular speed: $\omega = 2\pi f$.` }, { value: (B * 1e9) / 2, feedback: t`The London moment is $2m_e\omega/e$ — keep the 2.` }],
          hints: [t`$\omega = 2\pi f = 2\pi\times${f}$ rad/s.`, t`$B = 2(9.109\times10^{-31}\ \text{kg})\,\omega/(1.602\times10^{-19}\ \text{C})$.`],
          teach: t`A rotating superconductor carries the London field $B = 2m_e\omega/e$ along its axis — a direct readout of its spin direction.`,
          explain: t`$B = \dfrac{2(9.109\times10^{-31})(2\pi\times${f})}{1.602\times10^{-19}} = ${fmt(B * 1e9, 3)}$ nT — about a ten-thousandth of Earth’s field, so the rotors sat inside superconducting shields. Tracking it, Gravity Probe B measured the geodetic precession of its gyroscopes to 0.3% and the frame dragging by Earth’s rotation to about 20%, both as Einstein’s theory predicts.`,
          visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.4, 1.4], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
            shade: [disc(0, 0, 1, 'violet', 0.3)],
            curves: [{ param: ['1.15*cos(t)', '0.25*sin(t)'], t: [0.3, 5.8], color: 'gold', width: 2 }],
            arrows: [{ from: [0, -1.3], to: [0, 1.35], color: 'accent', label: 'spin axis and London field', labelDx: 8, labelDy: 4 }],
            points: [label(-1.2, -1.15, 'niobium-coated rotor, 38 mm across', 'violet', 0, 0, 'right')] },
            caption: 'Schematic: a superconducting rotor spinning about its axis carries a uniform magnetic field along that axis (the London moment). Not to scale.' },
        };
      },
    }),
    mcq({
      id: 'cp-mri', difficulty: 2, transfer: true,
      prompt: 'A 3 T MRI magnet is wound from niobium–titanium wire and cooled with liquid helium. Why not use lead, which superconducts below 7.2 K — not far below niobium–titanium’s 9 K or so?',
      choices: [
        'Lead is type I: a field above about 0.05 T at 4.2 K destroys its superconductivity, while type-II NbTi lets the field in as vortices and stays superconducting to about 10 T',
        'Lead’s resistance in the superconducting state is small but not zero, so the magnet would heat up',
        'Lead is too heavy for a hospital magnet',
        'Lead does not show the Meissner effect',
      ],
      answer: 0,
      why: {
        1: 'Below its critical field lead’s resistance is exactly zero, like any superconductor’s.',
        2: 'Weight is not the problem; the critical field is.',
        3: 'Lead shows a complete Meissner effect — which is exactly why it cannot hold a strong field inside it.',
      },
      hints: ['Compare the field the magnet must make with lead’s critical field.', 'How do type-II superconductors survive strong fields?'],
      teach: 'Strong magnets need type-II superconductors, which admit quantized vortices of flux and survive fields of many tesla.',
      explain: 'A magnet’s windings sit in its own field. Lead’s critical field at 4.2 K is about 0.05 T, sixty times less than 3 T. NbTi is type II: above a low first critical field it lets flux thread it in quantized vortices (each carrying h/2e) and stays superconducting up to its upper critical field, about 10 T at 4.2 K. The LHC’s 8.3 T dipoles use the same alloy, cooled to 1.9 K for extra margin.',
      visual: phase(PB, { B: 0.05, caption: 'Lead’s phase diagram: even at absolute zero it cannot stay superconducting above 0.08 T (gold: 0.05 T). An MRI magnet makes 1.5–3 T.' }),
    }),
    num({
      id: 'cp-wire', difficulty: 3,
      gen(r) {
        const key = r.pick(['pb', 'sn', 'in']), sc = S.SUPER[key], T = r.pick([1.5, 2.0, 2.5]), rmm = r.pick([0.5, 1, 2]);
        const Bc = S.critField(T, sc.Tc, sc.Bc0), I = (2 * Math.PI * rmm * 1e-3 * Bc) / MU0;
        return {
          prompt: t`A ${sc.label} wire of radius ${rmm} mm is kept at ${T} K ($T_c = ${sc.Tc}$ K, $B_c(0) = ${sc.Bc0}$ T). What is the largest current it can carry before its own surface field, $\mu_0I/2\pi r$, destroys superconductivity? Answer in A.`,
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: [{ value: (2 * Math.PI * rmm * 1e-3 * sc.Bc0) / MU0, feedback: t`Use the critical field at ${T} K: $B_c(T) = B_c(0)[1 - (T/T_c)^2]$.` }],
          hints: [t`First $B_c(${T}\ \text{K}) = ${sc.Bc0}\,[1 - (${T}/${sc.Tc})^2]$.`, t`Then $I = 2\pi rB_c/\mu_0$ with $r = ${rmm}\times10^{-3}$ m and $\mu_0 = 4\pi\times10^{-7}$ T m/A.`],
          teach: t`A superconducting wire’s current is limited by its own field: $I_{\max} = 2\pi rB_c(T)/\mu_0$.`,
          explain: t`$B_c = ${fmt(Bc, 3)}$ T, so $I = 2\pi(${rmm}\times10^{-3})(${fmt(Bc, 3)})/(4\pi\times10^{-7}) = ${fmt(I, 3)}$ A.`,
          visual: phase(sc, { T, caption: `The phase diagram of ${sc.label}; the gold line is ${T} K.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §9.9 (superconductivity)', url: 'https://openstax.org/books/university-physics-volume-3/pages/9-9-superconductivity' },
    { label: 'Kittel, Introduction to Solid State Physics, ch. 10 (critical fields, Table 10.1)', url: 'https://www.wiley.com/en-us/Introduction+to+Solid+State+Physics%2C+8th+Edition-p-9780471415268' },
    { label: 'Bardeen, Cooper & Schrieffer (1957), Theory of superconductivity, Phys. Rev. 108, 1175', url: 'https://doi.org/10.1103/PhysRev.108.1175' },
    { label: 'Drozdov et al. (2015), Conventional superconductivity at 203 K at high pressures in the sulfur hydride system, Nature 525, 73', url: 'https://doi.org/10.1038/nature14964' },
    { label: 'Garisto (2023), LK-99 isn’t a superconductor, Nature 620, 705', url: 'https://doi.org/10.1038/d41586-023-02585-7' },
    { label: 'Everitt et al. (2011), Gravity Probe B: final results, Phys. Rev. Lett. 106, 221101', url: 'https://doi.org/10.1103/PhysRevLett.106.221101' },
  ],
});
