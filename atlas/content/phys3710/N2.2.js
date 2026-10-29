// Alpha, beta and gamma decay, at Krane’s level. Gamow’s theory of alpha
// decay as a real calculation — the tunnelling exponent 2G through the
// Coulomb barrier, an assault frequency, a half-life within a factor of a
// few for uranium-238 and polonium-212, twenty-four orders of magnitude
// apart — and the Geiger–Nuttall law from real polonium data, with the
// N = 126 shell showing where it fails. Beta decay: positron emission
// against electron capture (2mₑc², beryllium-7), the continuous spectrum.
// Gamma decay: recoil and natural width, the Mössbauer effect and Pound
// and Rebka’s measurement of gravity’s redshift. Coding: the Gamow
// integral with quad. PHYS 2710 MP13.1 did alpha and beta Q-values, recoil
// sharing, the neutrino argument and the barrier sketch; not repeated.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { U, KE2, HBARC, MAC2, MEC2, HBAR_EVS, YEAR, mass, Zof, Q, uni, r6, seg, label } from './_nuclear.js';

const t = String.raw;
const C_FM = 2.99792458e23;                          // fm/s
/** Gamow’s model of alpha decay with a touching-spheres radius R = 1.2(A_d^(1/3) + 4^(1/3)) fm and a 35 MeV deep well. */
function gamow(parent, daughter) {
  const Qv = Q([parent], [daughter, 'He-4']), Zd = Zof(daughter), Ad = +daughter.split('-')[1];
  const md = mass(daughter) * U, mu = (MAC2 * md) / (MAC2 + md), R = 1.2 * (Math.cbrt(Ad) + Math.cbrt(4)), b = (2 * Zd * KE2) / Qv, x = R / b;
  const G2 = ((2 * Math.sqrt(2 * mu * Qv)) / HBARC) * b * (Math.acos(Math.sqrt(x)) - Math.sqrt(x * (1 - x)));
  const v = C_FM * Math.sqrt((2 * (Qv + 35)) / mu), f = v / (2 * R);
  return { Q: Qv, Zd, Ad, mu, R, b, x, G2, v, f, P: Math.exp(-G2), T: Math.LN2 / (f * Math.exp(-G2)) };
}
const GU = gamow('U-238', 'Th-234'), GP = gamow('Po-212', 'Pb-208');
const T_U = 4.468e9 * YEAR, T_P = 294.4e-9;

// Geiger–Nuttall: even polonium isotopes, measured half-lives (NUBASE2020)
const PO = [['Po-208', 'Pb-204', 2.898 * YEAR], ['Po-210', 'Pb-206', 138.376 * 86400], ['Po-212', 'Pb-208', 294.4e-9], ['Po-214', 'Pb-210', 164.3e-6], ['Po-216', 'Pb-212', 0.145], ['Po-218', 'Pb-214', 3.098 * 60]]
  .map(([p, d, T]) => { const q = Q([p], [d, 'He-4']); return { p, q, x: 1 / Math.sqrt(q), y: Math.log10(T), T }; });
const FIT = (() => {
  const pts = PO.filter((o) => +o.p.split('-')[1] >= 212), n = pts.length;
  const sx = pts.reduce((s, o) => s + o.x, 0), sy = pts.reduce((s, o) => s + o.y, 0), sxx = pts.reduce((s, o) => s + o.x * o.x, 0), sxy = pts.reduce((s, o) => s + o.x * o.y, 0);
  const a = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return { a, b: (sy - a * sx) / n };
})();
const A_GN = +FIT.a.toFixed(2), B_GN = +FIT.b.toFixed(2);       // the printed line

// ---- pictures
/** The alpha particle’s potential energy around a daughter of charge Zd and radius R (fm), with its energy Q. */
function barrier({ Zd = 82, R = 9.01, Qv = 'Q', showB = true, extra = {}, caption } = {}) {
  const k = typeof Zd === 'number' ? String(r6(2 * Zd * KE2)) : `(${r6(2 * KE2)}*${Zd})`;
  const b = typeof Qv === 'number' && typeof Zd === 'number' ? r6((2 * Zd * KE2) / Qv) : `${k}/(${Qv})`;
  return {
    type: 'graph',
    params: {
      x: [0, 70], y: [-40, 30], aspect: 'wide', axesAt: 'edge', xlabel: 'distance of the alpha from the centre r (fm)', ylabel: 'energy (MeV)',
      curves: [{ fn: `${k}/x`, domain: [R, 70], color: 'accent', width: 2.6, label: 'Coulomb barrier', labelAt: 22, labelDx: 6, labelDy: -14 }, seg(0, -35, R, -35, 'accent', 2.6),
        { param: [String(R), `-35 + t*(${k}/${R} + 35)`], t: [0, 1], color: 'accent', width: 2.6 },
        { fn: String(Qv), domain: [0, 70], color: 'gold', width: 2, dash: true, label: 'alpha’s energy Q', labelAt: 52, labelDy: 14 }],
      shade: [{ fn: `${k}/x`, lower: String(Qv), from: R, to: b, color: 'bad', alpha: 0.3 }],
      vlines: [{ x: R, label: 'R', color: 'ink3' }, ...(showB ? [{ x: b, label: 'b', color: 'ink3' }] : [])],
      points: [label(R / 2, -35, 'nuclear well', 'accent', 0, 12, 'center')],
      ...extra,
    },
    caption: caption ?? `The alpha particle’s potential energy near a daughter nucleus of charge ${Zd}e: a well (drawn square, 35 MeV deep, a simplification) inside R, the repulsion 2Z ke²/r outside. Between R and the turning point b the alpha is classically forbidden; it crosses by tunnelling (shaded).`,
  };
}

/** Gamow’s exponent 2G and log₁₀ of the half-life as expressions of slider keys Q and Z (μc² = 3660 MeV, R in fm). */
const R_EX = 9.2, MU_EX = 3660;
const X_EX = `(${R_EX}*Q/(${r6(2 * KE2)}*Z))`;
const G2_EX = `(2*sqrt(2*${MU_EX}*Q)/${HBARC}*${r6(2 * KE2)}*Z/Q*(acos(sqrt(${X_EX})) - sqrt(${X_EX}*(1 - ${X_EX}))))`;
const LOGT_EX = `(log10(0.693147/(${C_FM}*sqrt(2*(Q + 35)/${MU_EX})/(2*${R_EX}))) + 0.434294*${G2_EX})`;

/** The Geiger–Nuttall plot for even polonium isotopes, with the line fitted to those beyond N = 126. */
function gnPlot({ hide = null, caption } = {}) {
  return {
    type: 'graph',
    params: {
      x: [0.32, 0.45], y: [-8, 10], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: '1/√Q (Q in MeV)', ylabel: 'half-life (s)',
      curves: [{ fn: `${A_GN}*x + ${B_GN}`, color: 'gold', width: 2, dash: true, label: 'fit to ²¹²Po–²¹⁸Po', labelAt: 0.345, labelDx: 8, labelDy: 12 }],
      points: PO.map((o) => ({ x: r6(o.x), y: r6(hide === o.p ? -7.4 : o.y), r: hide === o.p ? 0.01 : 5, color: +o.p.split('-')[1] >= 212 ? 'accent' : 'warn', label: hide === o.p ? '' : uni(o.p), labelDx: -8, labelDy: -10, labelAlign: 'right' })),
    },
    caption: caption ?? 'The Geiger–Nuttall law for polonium: log half-life against 1/√Q falls on a straight line for the isotopes with more than 126 neutrons (blue). Polonium-210 and -208 (orange), with 126 and 124 neutrons, decay far more slowly than the line predicts. Q from AME2020 masses; half-lives NUBASE2020.',
  };
}

/** The allowed beta spectrum, N(T) ∝ pE(Q − T)², Coulomb correction left out. */
function betaShape(Qv, { who = 'positrons', endpoint = false, caption } = {}) {
  const m = MEC2, f = `sqrt(x^2 + 2*x*${m})*(x + ${m})*(${r6(Qv)} - x)^2`;
  let top = 0;
  for (let i = 1; i < 400; i++) { const x = (Qv * i) / 400; top = Math.max(top, Math.sqrt(x * x + 2 * x * m) * (x + m) * (Qv - x) ** 2); }
  return {
    type: 'graph',
    params: {
      x: [0, r6(Qv * 1.2)], y: [0, 1.25], aspect: 'wide', axesAt: 'edge', xlabel: `kinetic energy of the ${who} (MeV)`, ylabel: `${who} per energy`, yticks: 0, ...(endpoint ? {} : { xticks: 0 }),
      shade: [{ fn: `${f}/${r6(top)}`, from: 0, to: r6(Qv), color: 'accent', alpha: 0.25 }],
      curves: [{ fn: `${f}/${r6(top)}`, domain: [0, r6(Qv)], color: 'accent', width: 2.6 }],
      vlines: [{ x: r6(Qv), label: endpoint ? `endpoint ${fmt(Qv, 3)} MeV` : 'endpoint: ?', color: 'gold' }],
    },
    caption: caption ?? `The spread of ${who} energies in beta decay: continuous up to an endpoint, the rest carried by the neutrino. Allowed shape; the nucleus’s Coulomb push or pull is left out.`,
  };
}

/** Emission and absorption lines of a free nucleus, each shifted by the recoil energy (schematic widths). */
const recoilLines = {
  type: 'graph',
  params: {
    x: [-3, 3], y: [0, 1.25], aspect: 'wide', axesAt: 'edge', xlabel: 'photon energy − 14.4 keV (in recoil energies)', ylabel: '', yticks: 0,
    curves: [{ fn: '1/(1 + ((x + 1)/0.08)^2)', color: 'accent', width: 2.4, label: 'emitted', labelAt: -1, labelDx: -12, labelDy: -6 }, { fn: '1/(1 + ((x - 1)/0.08)^2)', color: 'warn', width: 2.4, label: 'needed to absorb', labelAt: 1, labelDx: 12, labelDy: -6 }],
    vlines: [{ x: 0, label: 'transition energy', color: 'ink3' }],
  },
  caption: 'A free nucleus emits a gamma ray short by its recoil energy and needs one long by the same to absorb it. The lines are drawn far wider than they are: for iron-57 each is about a millionth of the gap between them. In a crystal the whole lattice takes the recoil, and the lines coincide — the Mössbauer effect.',
};

export default lesson({
  id: 'phys3710.N2.2',
  title: 'Alpha, beta and gamma decay',
  minutes: 20, difficulty: 4,
  intro: t`Why does uranium-238 take 4.5 billion years to emit an alpha particle, and polonium-212 a third of a microsecond, when their decay energies differ only by a factor of two? Gamow’s answer (1928) was the first triumph of quantum tunnelling. The alpha rattles inside the nucleus, hitting the Coulomb barrier $f$ times a second, and each time slips through with probability $e^{-2G}$:

$$\lambda = f\,e^{-2G}, \qquad 2G = \frac{2}{\hbar}\int_R^b\sqrt{2\mu\left[V(r) - Q\right]}\,dr$$

The exponent is a large number, and small changes in $Q$ change it a lot. Beta and gamma decay need no tunnelling, but each has its own surprise: a missing particle, and a recoil that makes gamma rays miss their target. [MP13.1](#/lesson/phys2710.MP13.1) found the Q-values; here are the rates.`,
  symbols: [
    { tex: '\\lambda', text: t`the decay constant, $\ln 2/T_{1/2}$` },
    { tex: 'f', text: t`the assault frequency: how often the alpha hits the barrier, about $v/2R \approx 10^{21}\ \text{s}^{-1}$` },
    { tex: 'e^{-2G}', text: 'the probability of tunnelling through the barrier in one try (the WKB approximation)' },
    { tex: '\\mu', text: t`the reduced mass of the alpha and the daughter, $m_\alpha m_d/(m_\alpha + m_d)$, about $3660\ \text{MeV}/c^2$` },
    { tex: 'V(r)', text: t`the Coulomb potential energy outside the nucleus, $2Z_d\,e^2/4\pi\varepsilon_0r$, with $Z_d$ the daughter’s charge` },
    { tex: 'Q', text: 'the decay energy, which the alpha (with the recoiling daughter) carries away' },
    { tex: 'R', text: t`where the nuclear force lets go: here $1.2(A_d^{1/3} + 4^{1/3})$ fm, the daughter and the alpha just touching` },
    { tex: 'b', text: t`the outer turning point, where $V(b) = Q$: $b = 2Z_d\,(1.440\ \text{MeV fm})/Q$` },
  ],
  why: 'Tunnelling sets alpha half-lives, the fusion rate in stars and the current in a scanning tunnelling microscope; recoil-free gamma rays measured gravity’s effect on time in a 22-metre tower.',
  visual: {
    ...barrier({
      Zd: 'Z', R: R_EX,
      extra: {
        sliders: [
          { key: 'Q', label: 'Decay energy $Q$', min: 4, max: 9.5, step: 0.01, value: 4.27, unit: '\\mathrm{MeV}', explain: 'Uranium-238 has 4.27 MeV; polonium-212, 8.95 MeV.' },
          { key: 'Z', label: 'Daughter’s charge $Z_d$', min: 80, max: 92, step: 1, value: 90, explain: 'Thorium (90) after uranium-238 decays; lead (82) after polonium-212.' },
        ],
        readouts: [
          { label: t`turning point $b$`, expr: `${r6(2 * KE2)}*Z/Q`, unit: t`\text{fm}`, digits: 3 },
          { label: t`exponent $2G$`, expr: G2_EX, digits: 3 },
          { label: t`predicted $\log_{10}(T_{1/2}/\text{s})$`, expr: LOGT_EX, digits: 3 },
        ],
      },
      caption: `An alpha particle leaving a heavy nucleus: a square well inside R = ${R_EX} fm (a simplification; R really grows slightly with A), the Coulomb barrier outside, the forbidden region shaded. The readouts are Gamow’s model with a 35 MeV deep well and μc² = ${MU_EX} MeV; real half-lives agree to within a factor of about ten.`,
    }),
    title: 'Tunnelling out of a nucleus',
    lead: t`The alpha particle has energy $Q$ (gold), far below the top of the barrier. Classically it is trapped; quantum mechanically it leaks through the shaded region, with a probability that falls exponentially with the region’s size. Watch the half-life readout as you change $Q$.`,
    tasks: [
      'Start at Q = 4.27 MeV with Z = 90, uranium-238’s decay: the predicted half-life is about 10¹⁷ s — the age of the Earth.',
      'Now set Z = 82 and Q = 8.95 MeV, polonium-212’s decay: the shaded region shrinks to a sliver and the half-life falls below a microsecond, more than 20 powers of ten.',
      'Watch 2G: it falls from about 88 to about 32. Every 2.3 off the exponent is a factor of 10 in the half-life.',
    ],
  },
  example: {
    prompt: t`Compare uranium-238 → thorium-234 ($Q = ${fmt(GU.Q, 4)}$ MeV, $Z_d = 90$, $A_d = 234$) with polonium-212 → lead-208 ($Q = ${fmt(GP.Q, 4)}$ MeV, $Z_d = 82$, $A_d = 208$) in Gamow’s model. Use $R = 1.2(A_d^{1/3} + 4^{1/3})$ fm, $\mu c^2 \approx 3660$ MeV and an alpha moving inside a 35 MeV deep well. Predict both half-lives.`,
    visual: barrier({ Zd: 90, R: r6(GU.R), Qv: r6(GU.Q), caption: 'The barrier uranium-238’s alpha must cross: from R = 9.3 fm out to b = 60.7 fm, at an energy of 4.27 MeV against a barrier top near 28 MeV. Square well schematic.' }),
    steps: [
      { label: 'Turning points', text: t`$b = 2Z_d\times1.440/Q$: $${fmt(GU.b, 3)}$ fm for uranium, $${fmt(GP.b, 3)}$ fm for polonium. $R = ${fmt(GU.R, 3)}$ and $${fmt(GP.R, 3)}$ fm. The uranium alpha faces a barrier ${fmt(GU.b - GU.R, 3)} fm thick; the polonium alpha only ${fmt(GP.b - GP.R, 3)} fm.` },
      { label: 'The integral', text: t`For a pure Coulomb barrier the integral is exact: $2G = \dfrac{2\sqrt{2\mu c^2Q}}{\hbar c}\,b\left[\arccos\sqrt x - \sqrt{x(1-x)}\right]$ with $x = R/b$. Uranium: $x = ${fmt(GU.x, 3)}$, $2G = ${fmt(GU.G2, 4)}$. Polonium: $x = ${fmt(GP.x, 3)}$, $2G = ${fmt(GP.G2, 4)}$.` },
      { label: 'Assault frequency', text: t`Inside the well the alpha has kinetic energy $Q + 35$ MeV, so $v = c\sqrt{2(Q + 35)/\mu c^2} \approx ${fmt(GU.v / C_FM, 2)}c$ and $f = v/2R \approx ${tex(GU.f, 2)}\ \text{s}^{-1}$ — nearly the same for both.` },
      { label: 'Half-lives', text: t`$T_{1/2} = \ln 2/(f e^{-2G})$: uranium $${tex(GU.T, 2)}$ s $= ${tex(GU.T / YEAR, 2)}$ yr; polonium $${tex(GP.T, 2)}$ s.` },
      { label: 'Sense check', text: t`Measured: $4.468\times10^9$ yr and $0.294\ \mu\text{s}$. The model is off by factors of ${fmt(T_U / GU.T, 2)} and ${fmt(T_P / GP.T, 2)} — across a ratio of $${tex(T_U / T_P, 2)}$. Only the difference of the exponents matters for that ratio: $e^{${fmt(GU.G2, 3)} - ${fmt(GP.G2, 3)}} \approx 10^{${fmt((GU.G2 - GP.G2) / Math.LN10, 3)}}$. The factors left over come from $R$ (enlarge it 10% and the half-lives shorten twenty- to fortyfold), the shape of the nuclear edge and the chance of finding an alpha preformed.` },
    ],
    answer: t`Gamow’s model gives $${tex(GU.T / YEAR, 2)}$ yr for uranium-238 and $${tex(GP.T, 2)}$ s for polonium-212: both within about a factor of ten of the truth, over 24 orders of magnitude.`,
  },
  practice: [
    num({
      id: 'turning', difficulty: 1,
      gen(r) {
        const [p, d, name] = r.pick([['Ra-226', 'Rn-222', 'radium-226'], ['Rn-222', 'Po-218', 'radon-222'], ['Th-228', 'Ra-224', 'thorium-228'], ['Po-218', 'Pb-214', 'polonium-218'], ['U-234', 'Th-230', 'uranium-234']]);
        const g = gamow(p, d), q = +g.Q.toFixed(3), b = (2 * g.Zd * KE2) / q;
        return {
          prompt: t`${name[0].toUpperCase() + name.slice(1)} emits alpha particles with $Q = ${q}$ MeV, leaving a daughter of charge $Z_d = ${g.Zd}$. How far from the centre is the outer turning point $b$, where the Coulomb energy $2Z_d\,(1.440\ \text{MeV fm})/r$ equals $Q$, in fm?`,
          answer: b, units: 'fm', tol: { rel: 0.005 },
          errors: [{ value: (g.Zd * KE2) / q, feedback: t`The alpha particle carries charge $2e$: the energy is $2Z_dke^2/r$.` }, { value: (2 * (g.Zd + 2) * KE2) / q, feedback: 'Use the daughter’s charge: the alpha has already left the parent.' }],
          hints: [t`Solve $2Z_d\,(1.440)/b = Q$ for $b$.`, t`$b = 2\times${g.Zd}\times1.440/${q}$ fm.`],
          teach: t`The barrier an alpha must tunnel through runs from the nuclear surface to $b = 2Z_dke^2/Q$ — several times the nucleus’s radius.`,
          explain: t`$b = ${fmt(b, 3)}$ fm, against a nuclear radius near ${fmt(g.R, 2)} fm: the alpha must tunnel through ${fmt(b - g.R, 3)} fm of forbidden ground. Classically it would need ${fmt((2 * g.Zd * KE2) / g.R, 3)} MeV to get over the top at $R$.`,
          visual: barrier({ Zd: g.Zd, R: r6(g.R), Qv: q, showB: false, caption: `The barrier around the daughter (Z = ${g.Zd}): square well inside R (schematic), Coulomb repulsion outside, the alpha’s energy dashed. The turning point is withheld.` }),
        };
      },
    }),
    mcq({
      id: 'sensitive', difficulty: 2,
      prompt: 'Uranium-238 (Q = 4.27 MeV) and polonium-212 (Q = 8.95 MeV): twice the energy, but a half-life 10²⁴ times shorter. What makes the half-life so sensitive to Q?',
      choices: [
        t`The tunnelling probability is an exponential, $e^{-2G}$, and raising $Q$ both lowers the barrier above the alpha and narrows it, cutting $2G$ from 88 to 32`,
        'A faster alpha hits the barrier more often, and the number of hits grows exponentially with energy',
        'Higher-Q nuclei are smaller, so the alpha is closer to the edge',
        'Alpha particles form more readily inside nuclei with higher Q',
      ],
      answer: 0,
      why: {
        1: t`The assault frequency $f \propto \sqrt{Q + V_0}$ changes by only about 10% between the two: no help with 24 orders of magnitude.`,
        2: 'Radii of the two daughters differ by about 4%; that matters (the exponent depends on R), but Q is the main driver.',
        3: 'Preformation probabilities vary by factors of a few, not by 10²⁴.',
      },
      hints: ['Write the decay rate as (attempts per second) × (probability per attempt). Which factor can change by 10²⁴?', t`The tunnelling probability is $e^{-2G}$. How does $2G$ depend on the barrier’s height above $Q$ and its width?`],
      teach: 'Half-lives depend exponentially on the barrier integral, so a factor of 2 in Q becomes 24 orders of magnitude in time.',
      explain: t`$f$ is about $10^{21}\ \text{s}^{-1}$ for both. The tunnelling exponent falls from about 88 to 32 as the barrier above the alpha shrinks in both height and width, and $e^{-32}/e^{-88} = e^{56} \approx 10^{24}$. That is the **Geiger–Nuttall law**: $\log T_{1/2}$ is nearly linear in $1/\sqrt Q$.`,
      visual: gnPlot({ caption: 'Half-lives of polonium isotopes (log scale) against 1/√Q: a small change in Q moves the half-life by many powers of ten. Q from AME2020 masses, half-lives NUBASE2020.' }),
    }),
    num({
      id: 'gn-predict', difficulty: 2,
      prompt: t`The polonium isotopes from 212 to 218 follow the Geiger–Nuttall line $\log_{10}(T_{1/2}/\text{s}) = ${A_GN}/\sqrt{Q} - ${-B_GN}$ (Q in MeV) closely. Polonium-210 has $Q = ${fmt(PO[1].q, 4)}$ MeV. What half-life does the line predict for it, in days?`,
      answer: 10 ** (A_GN / Math.sqrt(PO[1].q) + B_GN) / 86400, units: 'd', tol: { rel: 0.02 },
      errors: [{ value: 10 ** (A_GN / Math.sqrt(PO[1].q) + B_GN), feedback: 'The line gives seconds; convert to days (86 400 s).' }, { value: 10 ** (A_GN / PO[1].q + B_GN) / 86400, feedback: t`The law uses $1/\sqrt Q$, not $1/Q$.` }],
      hints: [t`$1/\sqrt{${fmt(PO[1].q, 4)}} = ${fmt(1 / Math.sqrt(PO[1].q), 4)}$.`, t`$\log_{10}T = ${A_GN}\times${fmt(1 / Math.sqrt(PO[1].q), 4)} - ${-B_GN} = ${fmt(A_GN / Math.sqrt(PO[1].q) + B_GN, 4)}$; then $T$ in seconds, divided by 86 400.`],
      teach: 'The Geiger–Nuttall line predicts well within a family of similar nuclei, and its failures point at nuclear structure.',
      explain: t`The line predicts $10^{${fmt(A_GN / Math.sqrt(PO[1].q) + B_GN, 3)}}$ s $\approx ${fmt(10 ** (A_GN / Math.sqrt(PO[1].q) + B_GN) / 86400, 3)}$ days. Polonium-210 actually lives 138.4 days — about ${fmt((138.376 * 86400) / 10 ** (A_GN / Math.sqrt(PO[1].q) + B_GN), 2)} times longer. Its daughter, lead-206, has 124 neutrons, and polonium-210 itself has exactly 126, a closed shell: the alpha must be built from tightly held nucleons, and its preformation is far less likely. The heavier isotopes have neutrons outside the shell.`,
      visual: gnPlot({ hide: 'Po-210', caption: 'The Geiger–Nuttall plot for polonium, with polonium-210 withheld. The line is fitted to the isotopes beyond 126 neutrons (blue); polonium-208 (orange) is shown for comparison.' }),
    }),
    num({
      id: 'beta-plus', difficulty: 2,
      gen(r) {
        const [p, d, name, dn] = r.pick([['C-11', 'B-11', 'carbon-11', 'boron-11'], ['N-13', 'C-13', 'nitrogen-13', 'carbon-13'], ['O-15', 'N-15', 'oxygen-15', 'nitrogen-15']]);
        const qec = Q([p], [d]), qb = qec - 2 * MEC2;
        return {
          prompt: t`${name[0].toUpperCase() + name.slice(1)} (${fmt(mass(p), 10)} u) decays by positron emission to ${dn} (${fmt(mass(d), 10)} u). What is the largest kinetic energy a positron can have — the endpoint of the spectrum — in MeV? ($m_ec^2 = 0.511$ MeV.)`,
          answer: qb, units: 'MeV', tol: { rel: 0.003 },
          errors: [{ value: qec, feedback: t`With atomic masses, $\beta^+$ decay must also create the positron and leave a spare electron: subtract $2m_ec^2$.` }, { value: qec - MEC2, feedback: t`Two electron masses, not one: the positron is created, and the daughter atom has one electron too many, which is shed.` }],
          hints: [t`For $\beta^+$ with **atomic** masses: $Q = [M_\text{parent} - M_\text{daughter} - 2m_e]c^2$.`, t`$[M_\text{parent} - M_\text{daughter}]c^2 = ${fmt(qec, 4)}$ MeV; subtract $1.022$ MeV.`],
          teach: 'Positron emission costs 2mₑc² = 1.022 MeV in atomic-mass bookkeeping; electron capture does not.',
          explain: t`$Q_{\beta^+} = ${fmt(qec, 4)} - 1.022 = ${fmt(qb, 4)}$ MeV, shared between the positron and the neutrino (the recoil takes a few eV). ${name[0].toUpperCase() + name.slice(1)} is a PET tracer: each positron travels a millimetre or so, annihilates with an electron, and the two back-to-back 511 keV photons mark a line through the patient.`,
          visual: betaShape(qb),
        };
      },
    }),
    mcq({
      id: 'be7', difficulty: 2,
      prompt: t`Beryllium-7 (7.0169287 u) decays to lithium-7 (7.0160034 u) with a 53-day half-life, but only by **electron capture** — it never emits a positron. Why?`,
      choices: [
        t`The atomic mass difference is only 0.862 MeV, less than the $2m_ec^2 = 1.022$ MeV positron emission needs; capturing an atomic electron needs no such energy`,
        'Positron emission violates lepton number in light nuclei',
        'Beryllium-7 has too few protons for one to turn into a neutron',
        'The positron would be immediately recaptured by the nucleus',
      ],
      answer: 0,
      why: {
        1: 'p → n + e⁺ + νₑ conserves lepton number (−1 + 1); many light nuclei, such as carbon-11, do it.',
        2: 'It has four protons; any of them can capture an electron and become a neutron — that is what happens.',
        3: 'The positive positron is repelled by the nucleus; nothing recaptures it.',
      },
      hints: [t`Compute $[M({}^7\text{Be}) - M({}^7\text{Li})]c^2$ and compare with $2m_ec^2$.`, 'Electron capture uses an electron the atom already has; positron emission must create one and leave a spare.'],
      teach: 'When the atomic mass difference is below 1.022 MeV, a proton-rich nucleus can only decay by electron capture.',
      explain: t`$Q_{EC} = ${fmt(Q(['Be-7'], ['Li-7']), 4)}$ MeV, so $Q_{\beta^+} = ${fmt(Q(['Be-7'], ['Li-7']) - 2 * MEC2, 3)}$ MeV $< 0$: forbidden. Electron capture works, and since it needs an atomic electron, beryllium-7’s half-life changes slightly with its chemical surroundings — and fully ionized beryllium-7 in the Sun’s core decays only by capturing free electrons. The neutrinos it gives off were the target of the Borexino experiment.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [-0.2, 3.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [seg(1, 2.52, 4, 2.52, 'gold', 3), seg(6, 0.8, 9, 0.8, 'accent', 3), seg(5.6, 2.84, 9.4, 2.84, 'bad', 1.6, true)],
        arrows: [{ from: [4.1, 2.47], to: [5.95, 0.88], color: 'ink2', width: 1.8 }],
        points: [label(2.5, 2.52, '⁷Be atom: 0.862 MeV above ⁷Li', 'gold', 0, -13, 'center'), label(7.5, 0.8, '⁷Li atom', 'accent', 0, 14, 'center'), label(9.4, 2.84, '⁷Li + 2mₑc² = 1.022 MeV: needed for β⁺', 'bad', 0, -12, 'right'), label(5, 1.7, 'electron capture', 'ink2', 8, 0, 'left')] },
        caption: 'Energy levels of the two atoms, heights to scale. Positron emission would need the parent to lie at least 1.022 MeV above the daughter (red dashed); beryllium-7 lies only 0.862 MeV above, so only electron capture is open.' },
    }),
    num({
      id: 'recoil', difficulty: 2,
      prompt: t`The 14.41 keV gamma ray from iron-57 (56.935 u) is famous. A free iron-57 nucleus, at rest, emits one. How much kinetic energy does the recoiling nucleus take, in eV? (Momentum $p = E_\gamma/c$; $1\ \text{u}\,c^2 = 931.494$ MeV.)`,
      answer: 14412.9 ** 2 / (2 * mass('Fe-57') * U * 1e6), units: 'eV', tol: { rel: 0.01 },
      errors: [{ value: 14412.9 ** 2 / (mass('Fe-57') * U * 1e6), feedback: t`$K = p^2/2M$: keep the 2 in the denominator.` }],
      hints: [t`$E_R = \dfrac{p^2}{2M} = \dfrac{E_\gamma^2}{2Mc^2}$.`, t`$Mc^2 = 56.935\times931.494\times10^6$ eV $= ${tex(mass('Fe-57') * U * 1e6, 4)}$ eV.`],
      teach: 'A gamma ray’s recoil E²/2Mc² is tiny but dwarfs a long-lived level’s natural width — so free nuclei cannot reabsorb their own gamma rays.',
      explain: t`$E_R = (14\,413\ \text{eV})^2/(2\times${tex(mass('Fe-57') * U * 1e6, 4)}\ \text{eV}) = ${tex(14412.9 ** 2 / (2 * mass('Fe-57') * U * 1e6), 3)}$ eV. The level lives $\tau = 141$ ns, so its natural width is $\Gamma = \hbar/\tau = ${tex(HBAR_EVS / (98.3e-9 / Math.LN2), 2)}$ eV — about 400 000 times smaller. Emission and absorption lines of free nuclei miss each other completely. Mössbauer (1958) found that in a crystal the whole lattice can take the recoil, making it zero: the lines overlap and resonant absorption works.`,
      visual: recoilLines,
    }),
    code({
      id: 'gamow-quad', difficulty: 3,
      prompt: t`Compute Gamow’s tunnelling exponent by numerical integration. Finish \`two_G(Q, Zd, Ad)\`: integrate $\sqrt{2\mu c^2\,[V(r) - Q]}$ from $R$ to $b$ with \`quad\` (energies in MeV, distances in fm) and return $2/(\hbar c)$ times the integral. The program then checks it against the exact closed form and predicts half-lives of uranium-238 and polonium-212.`,
      starter: t`import numpy as np
from scipy.integrate import quad

HBARC, KE2, MA, U = 197.327, 1.440, 3727.379, 931.494   # MeV fm, MeV fm, MeV, MeV per u

def setup(Q, Zd, Ad):
    md = Ad * U
    mu = MA * md / (MA + md)                      # reduced mass, MeV
    R = 1.2 * (Ad**(1/3) + 4**(1/3))              # fm: alpha and daughter touching
    b = 2 * Zd * KE2 / Q                          # fm: the outer turning point
    return mu, R, b

def two_G(Q, Zd, Ad):
    mu, R, b = setup(Q, Zd, Ad)
    # integrate sqrt(2 mu (V(r) - Q)) from R to b, with V(r) = 2 Zd KE2 / r
    return 0.0

def closed_form(Q, Zd, Ad):
    mu, R, b = setup(Q, Zd, Ad)
    x = R / b
    return 2 * np.sqrt(2 * mu * Q) / HBARC * b * (np.arccos(np.sqrt(x)) - np.sqrt(x * (1 - x)))

def half_life(Q, Zd, Ad):
    mu, R, b = setup(Q, Zd, Ad)
    f = 2.998e23 * np.sqrt(2 * (Q + 35) / mu) / (2 * R)   # assaults per second
    return np.log(2) / (f * np.exp(-two_G(Q, Zd, Ad)))

for name, Q, Zd, Ad, T in [("U-238", 4.2698, 90, 234, 1.410e17), ("Po-212", 8.9542, 82, 208, 2.944e-7)]:
    print(f"{name}: 2G = {two_G(Q, Zd, Ad):.3f} (exact {closed_form(Q, Zd, Ad):.3f}), "
          f"T = {half_life(Q, Zd, Ad):.2e} s, measured {T:.2e} s")
`,
      answer: t`import numpy as np
from scipy.integrate import quad

HBARC, KE2, MA, U = 197.327, 1.440, 3727.379, 931.494

def setup(Q, Zd, Ad):
    md = Ad * U
    mu = MA * md / (MA + md)
    R = 1.2 * (Ad**(1/3) + 4**(1/3))
    b = 2 * Zd * KE2 / Q
    return mu, R, b

def two_G(Q, Zd, Ad):
    mu, R, b = setup(Q, Zd, Ad)
    integrand = lambda r: np.sqrt(max(0.0, 2 * mu * (2 * Zd * KE2 / r - Q)))
    val, err = quad(integrand, R, b)
    return 2 * val / HBARC

def closed_form(Q, Zd, Ad):
    mu, R, b = setup(Q, Zd, Ad)
    x = R / b
    return 2 * np.sqrt(2 * mu * Q) / HBARC * b * (np.arccos(np.sqrt(x)) - np.sqrt(x * (1 - x)))

def half_life(Q, Zd, Ad):
    mu, R, b = setup(Q, Zd, Ad)
    f = 2.998e23 * np.sqrt(2 * (Q + 35) / mu) / (2 * R)
    return np.log(2) / (f * np.exp(-two_G(Q, Zd, Ad)))

for name, Q, Zd, Ad, T in [("U-238", 4.2698, 90, 234, 1.410e17), ("Po-212", 8.9542, 82, 208, 2.944e-7)]:
    print(f"{name}: 2G = {two_G(Q, Zd, Ad):.3f} (exact {closed_form(Q, Zd, Ad):.3f}), "
          f"T = {half_life(Q, Zd, Ad):.2e} s, measured {T:.2e} s")`,
      tests: [
        { name: 'uranium-238’s exponent matches the closed form', code: 'abs(two_G(4.2698, 90, 234) - closed_form(4.2698, 90, 234)) < 1e-4' },
        { name: 'polonium-212’s exponent matches the closed form', code: 'abs(two_G(8.9542, 82, 208) - closed_form(8.9542, 82, 208)) < 1e-4' },
        { name: t`$2G$ is about 88 for uranium-238`, code: 'abs(two_G(4.2698, 90, 234) - 88.0) < 0.1' },
        { name: 'the predicted half-lives differ by more than 23 powers of ten', code: 'np.log10(half_life(4.2698, 90, 234) / half_life(8.9542, 82, 208)) > 23' },
      ],
      hints: [t`\`integrand = lambda r: np.sqrt(max(0.0, 2 * mu * (2 * Zd * KE2 / r - Q)))\` — the \`max\` guards against rounding just past $b$, where the square root’s argument touches zero.`, t`\`val, err = quad(integrand, R, b)\`, then \`return 2 * val / HBARC\`.`],
      teach: 'quad handles the square-root endpoint at the turning point; the exponent 2G carries all the physics of the half-life.',
      explain: t`The integral agrees with the closed form to many digits: $2G \approx 88.0$ for uranium-238 and $32.3$ for polonium-212. The predicted half-lives, about $5\times10^{16}$ s and $3\times10^{-8}$ s, are each within about a factor of ten of the measured ones — across 24 orders of magnitude. Try changing the 1.2 in $R$ to 1.3: the predictions shorten by factors of about 20 (uranium) and 13 (polonium), a reminder that the model’s agreement depends on a sensible radius.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pound-rebka', difficulty: 3, transfer: true,
      prompt: t`In 1959–60 Pound and Rebka sent iron-57’s recoil-free 14.41 keV gamma rays 22.5 m down a tower at Harvard. Gravity shifts their frequency by the fraction $gh/c^2$. The level’s natural width is $\Gamma = \hbar/\tau$ with $\tau = 141.8$ ns ($\hbar = 6.582\times10^{-16}$ eV s). How large is the gravitational shift as a fraction of the line’s width, $(gh/c^2)E_\gamma/\Gamma$? ($g = 9.81\ \text{m/s}^2$.)`,
      answer: ((9.81 * 22.5) / 299792458 ** 2) * 14412.9 / (HBAR_EVS / 141.8e-9), tol: { rel: 0.01 },
      errors: [{ value: (9.81 * 22.5) / 299792458 ** 2, feedback: t`That is the fractional shift of the energy. Multiply by $E_\gamma$ to get the shift in eV, then divide by $\Gamma$.` }],
      hints: [t`$gh/c^2 = 9.81\times22.5/(2.998\times10^8)^2 = ${tex((9.81 * 22.5) / 299792458 ** 2, 3)}$.`, t`Shift $= ${tex((9.81 * 22.5) / 299792458 ** 2, 3)}\times14\,410$ eV; width $\Gamma = 6.582\times10^{-16}/1.418\times10^{-7}$ eV.`],
      teach: 'Recoil-free gamma rays are so sharp that a 22-metre climb in gravity shifts them by a measurable fraction of their width.',
      explain: t`The shift is $${tex(((9.81 * 22.5) / 299792458 ** 2) * 14412.9, 3)}$ eV and the width $${tex(HBAR_EVS / 141.8e-9, 3)}$ eV, a ratio of $${fmt(((9.81 * 22.5) / 299792458 ** 2) * 14412.9 / (HBAR_EVS / 141.8e-9), 2)}$ — about 1/130 of a line width. Pound and Rebka compensated it with the Doppler shift of a source moving at under a micrometre per second, swapped source and absorber to cancel systematic errors, and found $1.05 \pm 0.10$ times Einstein’s prediction: the first laboratory test that clocks run slower lower down.`,
      visual: recoilLines,
    }),
    num({
      id: 'cp-gn', difficulty: 3,
      gen(r) {
        const q1 = r.pick([6.0, 6.5, 7.0]), dq = r.pick([0.3, 0.5, 0.8]), q2 = q1 + dq, ratio = 10 ** (A_GN * (1 / Math.sqrt(q1) - 1 / Math.sqrt(q2)));
        return {
          prompt: t`Two polonium isotopes beyond 126 neutrons follow the Geiger–Nuttall line $\log_{10}T_{1/2} = ${A_GN}/\sqrt{Q} + \text{const}$. One has $Q = ${q1}$ MeV, the other $${fmt(q2, 3)}$ MeV. By what factor is the first one’s half-life longer?`,
          answer: ratio, tol: { rel: 0.02 },
          errors: [{ value: 10 ** (A_GN * (1 / q1 - 1 / q2)), feedback: t`Use $1/\sqrt Q$, not $1/Q$.` }, { value: 1 / ratio, feedback: 'The lower-Q isotope has the longer half-life: its barrier is thicker.' }],
          hints: [t`The constant cancels: $\log_{10}(T_1/T_2) = ${A_GN}\left(\dfrac{1}{\sqrt{${q1}}} - \dfrac{1}{\sqrt{${fmt(q2, 3)}}}\right)$.`, t`$1/\sqrt{${q1}} = ${fmt(1 / Math.sqrt(q1), 4)}$, $1/\sqrt{${fmt(q2, 3)}} = ${fmt(1 / Math.sqrt(q2), 4)}$.`],
          teach: 'On the Geiger–Nuttall line a fraction of an MeV in Q is a factor of tens to thousands in half-life.',
          explain: t`$\log_{10}(T_1/T_2) = ${fmt(A_GN * (1 / Math.sqrt(q1) - 1 / Math.sqrt(q2)), 3)}$, a factor of $${fmt(ratio, 3)}$. A ${dq} MeV change in Q — about ${fmt((dq / q1) * 100, 2)}% — changes the half-life a ${ratio > 100 ? 'hundredfold or more' : 'great deal'}: Gamow’s exponent at work.`,
          visual: gnPlot(),
        };
      },
    }),
    num({
      id: 'cp-pet', difficulty: 2, transfer: true,
      prompt: t`Fluorine-18 (18.0009373 u, 110 minutes) is the workhorse of PET scanning: a sugar tagged with it lights up tumours. It decays to oxygen-18 (17.9991596 u), 97% of the time by positron emission. What is the positrons’ maximum kinetic energy, in MeV? ($m_ec^2 = 0.511$ MeV.)`,
      answer: Q(['F-18'], ['O-18']) - 2 * MEC2, units: 'MeV', tol: { rel: 0.005 },
      errors: [{ value: Q(['F-18'], ['O-18']), feedback: t`Subtract $2m_ec^2$: with atomic masses, positron emission must pay for the positron and the spare electron.` }, { value: Q(['F-18'], ['O-18']) - MEC2, feedback: t`Two electron masses: the created positron and the daughter atom’s extra electron.` }],
      hints: [t`$Q_{\beta^+} = [M({}^{18}\text{F}) - M({}^{18}\text{O})]c^2 - 2m_ec^2$.`, t`$[M({}^{18}\text{F}) - M({}^{18}\text{O})]c^2 = ${fmt(Q(['F-18'], ['O-18']), 4)}$ MeV.`],
      teach: 'Positron endpoints come from atomic masses minus 1.022 MeV; a low endpoint means a short positron range and a sharp image.',
      explain: t`$Q_{\beta^+} = ${fmt(Q(['F-18'], ['O-18']), 4)} - 1.022 = ${fmt(Q(['F-18'], ['O-18']) - 2 * MEC2, 4)}$ MeV. Most positrons have far less (the mean is about 0.25 MeV) and stop within about a millimetre of tissue before annihilating — a blur PET cannot remove, and one reason fluorine-18 beats higher-energy emitters such as oxygen-15 (1.73 MeV) for sharp images.`,
      visual: betaShape(Q(['F-18'], ['O-18']) - 2 * MEC2, { caption: 'The spread of positron energies from fluorine-18 (allowed shape; the nucleus’s push on the positron is left out). The endpoint is withheld.' }),
    }),
  ],
  sources: [
    { label: 'Krane, Introductory Nuclear Physics (Wiley, 1988), ch. 8–10: alpha, beta and gamma decay', url: 'https://www.wiley.com/en-us/Introductory+Nuclear+Physics%2C+3rd+Edition-p-9780471805533' },
    { label: 'Gamow (1928), Zur Quantentheorie des Atomkernes, Z. Phys. 51, 204', url: 'https://doi.org/10.1007/BF01343196' },
    { label: 'Pound and Rebka (1960), Apparent weight of photons, Phys. Rev. Lett. 4, 337', url: 'https://doi.org/10.1103/PhysRevLett.4.337' },
    { label: 'Kondev et al. (2021), The NUBASE2020 evaluation of nuclear physics properties, Chinese Physics C 45, 030001', url: 'https://doi.org/10.1088/1674-1137/abddae' },
  ],
});
